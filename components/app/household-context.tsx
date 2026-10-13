"use client";

import { createContext, useContext } from "react";

const Ctx = createContext({ multi: false });

/** Dit aux formulaires s'il y a plusieurs personnes dans le foyer (donc s'il faut proposer « Perso / Partagé »). */
export function HouseholdProvider({ multi, children }: { multi: boolean; children: React.ReactNode }) {
  return <Ctx.Provider value={{ multi }}>{children}</Ctx.Provider>;
}

export const useHousehold = () => useContext(Ctx);
