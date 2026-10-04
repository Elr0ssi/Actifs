"use client";

import { useEffect, useState } from "react";

/** État enregistré dans le navigateur (aucun compte, aucune donnée envoyée). Le rendu serveur utilise la valeur initiale. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* stockage indisponible */
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota ou mode privé */
    }
  }, [key, value, ready]);
  return [value, setValue, ready] as const;
}
