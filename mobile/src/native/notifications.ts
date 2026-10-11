import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { PlannedNotification } from "~/core/notify-plan";

/** Notifications LOCALES uniquement : aucun serveur de push, aucun coût. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export type PermissionState = "granted" | "denied" | "undetermined";

export async function permissionState(): Promise<PermissionState> {
  const p = await Notifications.getPermissionsAsync();
  if (p.granted || p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return "granted";
  return p.canAskAgain ? "undetermined" : "denied";
}

/** Demande l'autorisation iOS (une seule fois possible : ensuite l'utilisateur doit passer par les Réglages). */
export async function requestPermission(): Promise<PermissionState> {
  const p = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: true } });
  return p.granted ? "granted" : p.canAskAgain ? "undetermined" : "denied";
}

/**
 * Remplace toutes les notifications planifiées par le plan calculé (fonction pure testée dans core/notify-plan.ts).
 * Les identifiants sont stables, donc replanifier ne crée jamais de doublon.
 */
export async function applyPlan(plan: PlannedNotification[]): Promise<number> {
  if (Platform.OS !== "ios") return 0;
  if ((await permissionState()) !== "granted") return 0;
  await Notifications.cancelAllScheduledNotificationsAsync();
  let n = 0;
  for (const p of plan) {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: p.id,
        content: { title: p.title, body: p.body, data: { url: p.url } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.fireAt },
      });
      n++;
    } catch {
      /* une notification invalide ne bloque pas les autres */
    }
  }
  return n;
}

export const cancelAll = () => Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
