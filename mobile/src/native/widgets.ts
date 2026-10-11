import { Platform } from "react-native";
import Constants from "expo-constants";
import type { WidgetSnapshot } from "~/core/snapshot";
import { SNAPSHOT_KEY } from "~/core/snapshot";

/**
 * Pont app → widgets iOS. L'instantané JSON est écrit dans l'App Group (UserDefaults partagé) puis
 * on demande à WidgetKit de recharger ses timelines. iOS décide ensuite QUAND il rafraîchit réellement
 * un widget (budget limité par le système) : il n'y a pas de synchronisation instantanée garantie.
 *
 * Fonctionne uniquement dans une build native (development build / TestFlight), jamais dans Expo Go
 * ni hors iOS : on échoue silencieusement dans ces cas.
 */
type ExtensionStorageT = { new (group: string): { set(key: string, value?: string): void; remove(key: string): void }; reloadWidget(name?: string): void };

let storage: InstanceType<ExtensionStorageT> | null | undefined;
let Ext: ExtensionStorageT | null = null;

function load() {
  if (storage !== undefined) return storage;
  storage = null;
  if (Platform.OS !== "ios") return storage;
  try {
    const group = (Constants.expoConfig?.extra as { appGroup?: string } | undefined)?.appGroup;
    if (!group) return storage;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Ext = (require("@bacons/apple-targets") as { ExtensionStorage: ExtensionStorageT }).ExtensionStorage;
    storage = new Ext(group);
  } catch {
    storage = null;
  }
  return storage;
}

export function writeWidgetSnapshot(snapshot: WidgetSnapshot): boolean {
  const s = load();
  if (!s || !Ext) return false;
  try {
    s.set(SNAPSHOT_KEY, JSON.stringify(snapshot));
    Ext.reloadWidget();
    return true;
  } catch {
    return false;
  }
}

/** Déconnexion : l'instantané précédent ne doit jamais rester visible sur l'écran d'accueil. */
export function clearWidgetSnapshot() {
  const s = load();
  if (!s || !Ext) return;
  try {
    s.remove(SNAPSHOT_KEY);
    Ext.reloadWidget();
  } catch {
    /* sans effet hors build native */
  }
}
