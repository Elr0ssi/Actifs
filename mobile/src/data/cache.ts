import AsyncStorage from "@react-native-async-storage/async-storage";
import { mergeSettings, type AppSettings, DEFAULT_SETTINGS } from "~/core/settings";
import { emptyTables, type AppData } from "~/core/model";
import type { Op } from "~/core/outbox";

/**
 * Cache hors-ligne dans le sandbox de l'app (chiffré par iOS tant que l'appareil est verrouillé).
 * Les clés sont propres à chaque utilisateur et tout est effacé à la déconnexion.
 */
const dataKey = (uid: string) => `flozea.data.v1.${uid}`;
const outboxKey = (uid: string) => `flozea.outbox.v1.${uid}`;
const SETTINGS_KEY = "flozea.settings.v1";
const LAST_USER_KEY = "flozea.lastUser.v1";

async function readJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
const writeJSON = (key: string, v: unknown) => AsyncStorage.setItem(key, JSON.stringify(v)).catch(() => undefined);

export async function loadCache(uid: string): Promise<{ data: AppData | null; outbox: Op[] }> {
  const data = await readJSON<AppData>(dataKey(uid));
  const outbox = (await readJSON<Op[]>(outboxKey(uid))) ?? [];
  if (data && data.userId === uid) data.tables = { ...emptyTables(), ...data.tables };
  return { data: data && data.userId === uid ? data : null, outbox: Array.isArray(outbox) ? outbox : [] };
}
export const saveData = (uid: string, data: AppData) => writeJSON(dataKey(uid), data);
export const saveOutbox = (uid: string, ops: Op[]) => writeJSON(outboxKey(uid), ops);

export async function loadSettings(): Promise<AppSettings> {
  return mergeSettings(await readJSON<unknown>(SETTINGS_KEY));
}
export const saveSettings = (s: AppSettings) => writeJSON(SETTINGS_KEY, s);
export const defaultSettings = () => DEFAULT_SETTINGS;

export async function rememberUser(uid: string) {
  await AsyncStorage.setItem(LAST_USER_KEY, uid).catch(() => undefined);
}

/** Déconnexion : on efface les données de l'utilisateur ET l'instantané des widgets (fait ailleurs). */
export async function wipeUser(uid: string | null) {
  const keys = await AsyncStorage.getAllKeys().catch(() => [] as readonly string[]);
  const mine = keys.filter((k) => k.startsWith("flozea.data.") || k.startsWith("flozea.outbox.") || (uid ? k.endsWith(uid) : false));
  await AsyncStorage.multiRemove(mine).catch(() => undefined);
}
