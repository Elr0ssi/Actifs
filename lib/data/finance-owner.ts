import { cache } from "react";
import { cookies } from "next/headers";
import { getAppContext } from "@/lib/data/context";
import { FINANCE_OWNER_COOKIE } from "@/lib/sharing";

export type FinanceOwnerOption = { id: string; name: string; self: boolean };

/**
 * De qui affiche-t-on la finance ? De soi-même par défaut. Si un autre membre du foyer partage sa finance
 * avec toi (lecture seule) et que tu l'as choisi dans le sélecteur, c'est la sienne — mais seulement si
 * le partage existe vraiment : sinon on revient à la tienne (et la base refuserait de toute façon la lecture).
 *
 * `forceOwn` : le tableau de bord reste toujours le tien.
 */
export const getFinanceOwner = cache(async (forceOwn: boolean = false) => {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, user } = ctx;
  const me = user.id;

  const { data: shares } = await supabase.from("member_shares").select("owner_id").eq("member_id", me).eq("section", "finance");
  const sharedIds = (shares ?? []).map((s) => s.owner_id as string);
  let names: Record<string, string> = {};
  if (sharedIds.length) {
    const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", sharedIds);
    names = Object.fromEntries((profs ?? []).map((p) => [p.id as string, (p.display_name as string | null) || "—"]));
  }

  const wanted = cookies().get(FINANCE_OWNER_COOKIE)?.value;
  const ownerId = !forceOwn && wanted && sharedIds.includes(wanted) ? wanted : me;
  const options: FinanceOwnerOption[] = [
    { id: me, name: ctx.profile?.display_name || "Moi", self: true },
    ...sharedIds.map((id) => ({ id, name: names[id] ?? "—", self: false })),
  ];
  return { me, ownerId, readOnly: ownerId !== me, options, ownerName: options.find((o) => o.id === ownerId)?.name ?? "" };
});
