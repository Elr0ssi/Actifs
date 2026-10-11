import React, { useCallback, useEffect, useState } from "react";
import { Linking, Switch, View } from "react-native";
import { Stack } from "expo-router";
import Constants from "expo-constants";
import { useAuth } from "~/auth/AuthProvider";
import { sel } from "~/core/model";
import { ACCENT_NAMES, type NotificationSettings } from "~/core/settings";
import { useData } from "~/data/DataProvider";
import { permissionState, requestPermission, type PermissionState } from "~/native/notifications";
import { Button, Card, Chip, Divider, H2, Label, Row, Screen, SyncBanner, T } from "~/ui/kit";
import { TimeField } from "~/ui/forms";
import { ACCENT_LABEL, ACCENTS, useTheme } from "~/ui/theme";
import { Ready, type ReadyValue } from "~/ui/ready";

export default function Settings() {
  return <Ready>{(v) => <Inner {...v} />}</Ready>;
}

function Toggle({ label, hint, value, onChange, disabled }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Row style={{ justifyContent: "space-between", opacity: disabled ? 0.45 : 1 }}>
      <View style={{ flex: 1 }}><T weight="600">{label}</T>{hint ? <T size={12} color="muted">{hint}</T> : null}</View>
      <Switch value={value} onValueChange={onChange} disabled={disabled} trackColor={{ true: t.brand }} />
    </Row>
  );
}

function Inner({ data, refresh, settings, updateSettings, pending, lastSync, online, syncing }: ReadyValue) {
  const t = useTheme();
  const { session, signOut } = useAuth();
  const household = sel.household(data);
  const profile = sel.profile(data);
  const n = settings.notifications;
  const [perm, setPerm] = useState<PermissionState>("undetermined");
  const setN = useCallback((patch: Partial<NotificationSettings>) => updateSettings({ notifications: { ...n, ...patch } }), [n, updateSettings]);

  useEffect(() => { permissionState().then(setPerm).catch(() => undefined); }, []);

  const enableNotifications = async (on: boolean) => {
    if (on && perm !== "granted") {
      const p = await requestPermission();
      setPerm(p);
      if (p !== "granted") return;
    }
    setN({ enabled: on });
  };

  return (
    <Screen onRefresh={refresh}>
      <Stack.Screen options={{ title: "Réglages" }} />
      <SyncBanner />

      <Card>
        <H2>Compte</H2>
        <T weight="600">{profile?.display_name ?? "—"}</T>
        <T color="sub">{session?.user.email}</T>
        {household ? <T size={13} color="muted">Foyer : {household.name} · code d'invitation {household.invite_code}</T> : null}
        <T size={12} color="muted">Pour modifier le profil, le foyer ou le mot de passe, utilise flozea.com — les changements arrivent ici automatiquement.</T>
      </Card>

      <Card>
        <H2>Apparence</H2>
        <T size={13} color="sub">Le mode clair / sombre suit les réglages de ton iPhone.</T>
        <Row style={{ flexWrap: "wrap", gap: 8 }}>
          {ACCENT_NAMES.map((a) => <Chip key={a} label={ACCENT_LABEL[a]} active={settings.accent === a} color={ACCENTS[a][600]} onPress={() => updateSettings({ accent: a })} />)}
        </Row>
      </Card>

      <Card>
        <H2>Notifications</H2>
        <T size={12} color="muted">Rappels locaux programmés sur ton iPhone : aucun serveur, aucun suivi.</T>
        {perm === "denied" ? (
          <>
            <T size={13} color="bad">Les notifications sont désactivées pour Flozea dans les Réglages iOS.</T>
            <Button title="Ouvrir les Réglages iOS" kind="secondary" small onPress={() => void Linking.openSettings()} />
          </>
        ) : null}
        <Toggle label="Activer les rappels" value={n.enabled && perm === "granted"} onChange={enableNotifications} />
        <Divider />
        <Toggle label="Tâches à heure fixe" hint={`Rappel ${n.taskLeadMin} min avant`} value={n.tasks} onChange={(v) => setN({ tasks: v })} disabled={!n.enabled} />
        {n.enabled && n.tasks ? <Row style={{ flexWrap: "wrap", gap: 8 }}>{[0, 5, 15, 30, 60].map((m) => <Chip key={m} label={m === 0 ? "À l'heure" : `${m} min`} active={n.taskLeadMin === m} onPress={() => setN({ taskLeadMin: m })} />)}</Row> : null}
        <Toggle label="Tâches du jour sans heure" hint={`Rappel à ${n.dueTime}`} value={n.due} onChange={(v) => setN({ due: v })} disabled={!n.enabled} />
        {n.enabled && n.due ? <TimeField label="Heure du rappel" value={n.dueTime} onChange={(v) => v && setN({ dueTime: v })} /> : null}
        <Toggle label="Routines du jour" hint={`Rappel à ${n.routineTime} s'il en reste à faire`} value={n.routines} onChange={(v) => setN({ routines: v })} disabled={!n.enabled} />
        {n.enabled && n.routines ? <TimeField label="Heure du rappel" value={n.routineTime} onChange={(v) => v && setN({ routineTime: v })} /> : null}
        <Divider />
        <Toggle label="Heures calmes" hint="Aucune alerte pendant la nuit : elle est décalée à la fin de la plage" value={n.quietEnabled} onChange={(v) => setN({ quietEnabled: v })} disabled={!n.enabled} />
        {n.enabled && n.quietEnabled ? (
          <>
            <TimeField label="De" value={n.quietStart} onChange={(v) => v && setN({ quietStart: v })} />
            <TimeField label="À" value={n.quietEnd} onChange={(v) => v && setN({ quietEnd: v })} />
          </>
        ) : null}
      </Card>

      <Card>
        <H2>Widgets</H2>
        <T size={12} color="muted">Ajoute-les depuis l'écran d'accueil (appui long → +). iOS décide du rythme de rafraîchissement : ils peuvent avoir quelques minutes de retard.</T>
        <Toggle label="Masquer les montants" hint="Les widgets finances n'affichent aucun chiffre (et rien n'est écrit dans le conteneur partagé)" value={settings.hideWidgetAmounts} onChange={(v) => updateSettings({ hideWidgetAmounts: v })} />
      </Card>

      <Card>
        <H2>Synchronisation</H2>
        <Row style={{ justifyContent: "space-between" }}><T color="sub">Connexion</T><T weight="600" color={online ? "ok" : "warn"}>{online ? "En ligne" : "Hors-ligne"}</T></Row>
        <Row style={{ justifyContent: "space-between" }}><T color="sub">Dernière synchro</T><T weight="600">{lastSync ? new Date(lastSync).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}</T></Row>
        <Row style={{ justifyContent: "space-between" }}><T color="sub">Modifications en attente</T><T weight="600">{pending}</T></Row>
        <Button title="Synchroniser maintenant" kind="secondary" loading={syncing} onPress={() => void refresh()} />
        <T size={12} color="muted">Même compte et mêmes données que le site : chaque modification est envoyée tout de suite, et l'app relit le serveur à l'ouverture, toutes les 90 s et à chaque tirage vers le bas.</T>
      </Card>

      <Button title="Se déconnecter" kind="danger" onPress={() => void signOut()} />
      <Label>Flozea {Constants.expoConfig?.version ?? ""}</Label>
      <View style={{ height: 8, backgroundColor: t.canvas }} />
    </Screen>
  );
}
