"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { FINANCE_OWNER_COOKIE } from "@/lib/sharing";

/**
 * Choisit de quelle personne on consulte la finance. Le choix est seulement mémorisé : à chaque lecture,
 * il est revérifié contre les partages réels (et la base refuse de toute façon ce qui n'est pas partagé).
 * `null` ou ton propre id → ta finance.
 */
export async function setFinanceOwner(ownerId: string | null) {
  const jar = cookies();
  if (!ownerId || !/^[0-9a-f-]{36}$/i.test(ownerId)) jar.delete(FINANCE_OWNER_COOKIE);
  else jar.set(FINANCE_OWNER_COOKIE, ownerId, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/app", "layout");
}
