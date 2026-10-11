import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import { useAuth } from "~/auth/AuthProvider";
import { supabase } from "~/lib/supabase";
import { localISO } from "~/core/dates";
import { sel, type AppData } from "~/core/model";
import type { MutCtx } from "~/core/mutations";
import { applyOp, applyOps, compact, type Op } from "~/core/outbox";
import { planNotifications } from "~/core/notify-plan";
import { buildSnapshot } from "~/core/snapshot";
import { DEFAULT_SETTINGS, type AppSettings } from "~/core/settings";
import { applyPlan } from "~/native/notifications";
import { writeWidgetSnapshot } from "~/native/widgets";
import { loadCache, loadSettings, saveData, saveOutbox, saveSettings } from "./cache";
import { fetchAll } from "./fetch";
import { sendOp } from "./flush";

export interface DataValue {
  /** Données affichées = dernier état connu du serveur + écritures en attente. `null` tant que rien n'est chargé. */
  data: AppData | null;
  ready: boolean;
  syncing: boolean;
  online: boolean;
  /** Nombre d'écritures pas encore confirmées par le serveur. */
  pending: number;
  lastSync: string | null;
  error: string | null;
  /** Écritures refusées par le serveur depuis le dernier rafraîchissement. */
  rejected: string[];
  settings: AppSettings;
  /** Date locale « aujourd'hui » (se met à jour quand l'app repasse au premier plan). */
  today: string;
  mutCtx: MutCtx | null;
  refresh(): Promise<void>;
  run(ops: Op[]): void;
  updateSettings(patch: Partial<AppSettings>): void;
}

const Ctx = createContext<DataValue | null>(null);
export const useData = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData hors DataProvider");
  return v;
};

const POLL_MS = 90_000;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [server, setServer] = useState<AppData | null>(null);
  const [pending, setPending] = useState<Op[]>([]);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejected, setRejected] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [today, setToday] = useState(localISO());

  const pendingRef = useRef<Op[]>([]);
  const serverRef = useRef<AppData | null>(null);
  const busy = useRef(false);
  const queued = useRef<{ full: boolean } | null>(null);
  const dirty = useRef(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefresh = useRef(0);

  const setPend = useCallback((ops: Op[]) => {
    pendingRef.current = ops;
    setPending(ops);
    if (userId) void saveOutbox(userId, ops);
  }, [userId]);

  // 1) Chargement du cache de l'utilisateur dès la connexion (affichage immédiat, même hors-ligne).
  useEffect(() => {
    let alive = true;
    setServer(null);
    serverRef.current = null;
    setReady(false);
    pendingRef.current = [];
    setPending([]);
    setRejected([]);
    setError(null);
    loadSettings().then((s) => alive && setSettings(s));
    if (!userId) return;
    loadCache(userId).then(({ data, outbox }) => {
      if (!alive) return;
      serverRef.current = data;
      setServer(data);
      pendingRef.current = outbox;
      setPending(outbox);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  /** Envoie les écritures en attente, dans l'ordre. Retourne false si on est hors-ligne. */
  const flush = useCallback(async (): Promise<boolean> => {
    if (!userId) return true;
    const sb = supabase();
    let offline = false;
    const refused: string[] = [];
    while (pendingRef.current.length) {
      const [op, ...rest] = pendingRef.current;
      const res = await sendOp(sb, op);
      if (res.status === "offline") {
        offline = true;
        break;
      }
      if (res.status === "rejected") refused.push(`${op.table} : ${res.message}`);
      else if (serverRef.current) {
        // L'écriture est confirmée : elle rejoint la base « serveur » locale (pas de clignotement avant la relecture).
        serverRef.current = applyOp(serverRef.current, op);
        setServer(serverRef.current);
      }
      setPend(rest);
    }
    if (refused.length) setRejected((r) => [...r, ...refused]);
    return !offline;
  }, [userId, setPend]);

  /**
   * Point d'entrée unique de la synchronisation (sérialisée) :
   *  - `full: false` → envoie seulement les écritures en attente ;
   *  - `full: true`  → les envoie puis relit tout le foyer sur le serveur.
   */
  const sync = useCallback(async (full: boolean) => {
    if (!userId) return;
    if (busy.current) {
      queued.current = { full: (queued.current?.full ?? false) || full };
      return;
    }
    busy.current = true;
    setSyncing(true);
    try {
      const flushed = await flush();
      if (full || (flushed && pendingRef.current.length === 0 && dirty.current)) {
        dirty.current = false;
        const day = localISO();
        setToday(day);
        const fresh = await fetchAll(supabase(), userId, day);
        // Les écritures encore en attente sont rejouées par-dessus (calcul de `data`).
        serverRef.current = fresh;
        setServer(fresh);
        lastRefresh.current = Date.now();
        void saveData(userId, fresh);
      }
      setOnline(flushed);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const offline = /network|fetch|timed? ?out|offline/i.test(msg);
      setOnline(!offline);
      setError(offline ? null : msg);
    } finally {
      busy.current = false;
      setSyncing(false);
      const q = queued.current;
      queued.current = null;
      if (q) void sync(q.full);
    }
  }, [userId, flush]);

  const refresh = useCallback(() => sync(true), [sync]);

  // 2) Première synchronisation une fois le cache lu, puis : retour au premier plan, retour du réseau, minuteur.
  useEffect(() => {
    if (!userId || !ready) return;
    void refresh();
  }, [userId, ready, refresh]);

  useEffect(() => {
    if (!userId) return;
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") {
        setToday(localISO());
        if (Date.now() - lastRefresh.current > 15_000) void refresh();
      }
    });
    const net = NetInfo.addEventListener((st) => {
      const on = !!st.isConnected && st.isInternetReachable !== false;
      setOnline(on);
      if (on) void refresh();
    });
    const timer = setInterval(() => {
      if (AppState.currentState === "active") void refresh();
    }, POLL_MS);
    return () => {
      sub.remove();
      net();
      clearInterval(timer);
    };
  }, [userId, refresh]);

  const run = useCallback((ops: Op[]) => {
    if (!ops.length) return;
    setPend(compact([...pendingRef.current, ...ops]));
    dirty.current = true;
    // Envoi immédiat ; si on est hors-ligne les écritures restent en file et partent au retour du réseau.
    void sync(false);
    // Puis relecture complète groupée (autres appareils, valeurs calculées côté serveur).
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => void sync(true), 4000);
  }, [setPend, sync]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((cur) => {
      const next: AppSettings = { ...cur, ...patch, notifications: { ...cur.notifications, ...(patch.notifications ?? {}) } };
      void saveSettings(next);
      return next;
    });
  }, []);

  const data = useMemo(() => (server ? applyOps(server, pending) : null), [server, pending]);

  // 3) Sorties dérivées : widgets + rappels, recalculés (avec un délai) à chaque changement de données ou de réglages.
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => {
      const now = new Date();
      writeWidgetSnapshot(buildSnapshot(data, now, { hideAmounts: settings.hideWidgetAmounts }));
      void applyPlan(planNotifications(data, settings.notifications, now));
    }, 1200);
    return () => clearTimeout(t);
  }, [data, settings]);

  const household = data ? sel.household(data) : null;
  const mutCtx = useMemo<MutCtx | null>(() => (userId && household ? { householdId: household.id, userId, newId: () => Crypto.randomUUID(), now: () => Date.now() } : null), [userId, household]);

  const value = useMemo<DataValue>(
    () => ({ data, ready, syncing, online, pending: pending.length, lastSync: server?.syncedAt ?? null, error, rejected, settings, today, mutCtx, refresh, run, updateSettings }),
    [data, ready, syncing, online, pending.length, server, error, rejected, settings, today, mutCtx, refresh, run, updateSettings]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
