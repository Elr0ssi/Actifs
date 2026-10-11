import * as SecureStore from "expo-secure-store";

/**
 * Stockage de session dans le Keychain iOS. SecureStore limite chaque valeur (~2 Ko) alors qu'un
 * jeton de session Supabase est plus long : on découpe en morceaux.
 */
const CHUNK = 1800;
const countKey = (k: string) => `${k}.n`;
const partKey = (k: string, i: number) => `${k}.${i}`;
const opts: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const n = Number(await SecureStore.getItemAsync(countKey(key), opts));
    if (!n) return null;
    const parts: string[] = [];
    for (let i = 0; i < n; i++) {
      const p = await SecureStore.getItemAsync(partKey(key, i), opts);
      if (p === null) return null;
      parts.push(p);
    }
    return parts.join("");
  },
  async setItem(key: string, value: string): Promise<void> {
    const old = Number(await SecureStore.getItemAsync(countKey(key), opts)) || 0;
    const parts = value.match(new RegExp(`.{1,${CHUNK}}`, "gs")) ?? [""];
    for (let i = 0; i < parts.length; i++) await SecureStore.setItemAsync(partKey(key, i), parts[i], opts);
    for (let i = parts.length; i < old; i++) await SecureStore.deleteItemAsync(partKey(key, i), opts);
    await SecureStore.setItemAsync(countKey(key), String(parts.length), opts);
  },
  async removeItem(key: string): Promise<void> {
    const n = Number(await SecureStore.getItemAsync(countKey(key), opts)) || 0;
    for (let i = 0; i < n; i++) await SecureStore.deleteItemAsync(partKey(key, i), opts);
    await SecureStore.deleteItemAsync(countKey(key), opts);
  },
};
