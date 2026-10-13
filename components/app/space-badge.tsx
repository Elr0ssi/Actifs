"use client";

import { useTransition } from "react";
import { useT } from "@/components/i18n/provider";
import { setItemShared } from "@/app/(main)/app/share-actions";
import type { SharedTable } from "@/lib/sharing";
import { cx } from "@/lib/utils";

/**
 * Dit d'un coup d'œil à qui est un élément :
 *  - « Perso » : visible par toi seul(e) ;
 *  - « Partagé » : à toi, mais visible par tout le foyer ;
 *  - « Partagé · par Raph » : c'est à quelqu'un d'autre, tu le consultes.
 */
export function SpaceBadge({ shared, mine, ownerName, className }: { shared: boolean; mine: boolean; ownerName?: string; className?: string }) {
  const tr = useT();
  if (!mine) {
    return (
      <span title={tr("Partagé par {name} : tu peux le consulter, pas le modifier.", { name: ownerName ?? "—" })} className={cx("inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800", className)}>
        <span aria-hidden>👥</span>
        {tr("Partagé · par {name}", { name: ownerName ?? "—" })}
      </span>
    );
  }
  return shared ? (
    <span title={tr("Visible par tout ton foyer. Toi seul(e) peux le modifier ou le supprimer.")} className={cx("inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700", className)}>
      <span aria-hidden>👥</span>
      {tr("Partagé")}
    </span>
  ) : (
    <span title={tr("Visible par toi seul(e).")} className={cx("inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600", className)}>
      <span aria-hidden>🔒</span>
      {tr("Perso")}
    </span>
  );
}

/** Bouton du propriétaire : partager avec le foyer, ou repasser en perso. Ne supprime ni ne copie rien. */
export function ShareToggle({ table, id, shared, className }: { table: SharedTable; id: string; shared: boolean; className?: string }) {
  const tr = useT();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        e.stopPropagation();
        start(() => setItemShared(table, id, !shared));
      }}
      className={cx("rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50", className)}
    >
      {shared ? tr("Rendre perso") : tr("Partager avec le foyer")}
    </button>
  );
}

/** Choix au moment de créer : Perso ou Partagé (champ `shared` d'un formulaire). */
export function SpaceChoice({ name = "shared", defaultShared = false, className }: { name?: string; defaultShared?: boolean; className?: string }) {
  const tr = useT();
  return (
    <fieldset className={cx("inline-flex rounded-xl bg-stone-100 p-0.5 text-xs font-semibold", className)}>
      <legend className="sr-only">{tr("Où ranger ça ?")}</legend>
      <label className="cursor-pointer">
        <input type="radio" name={name} value="" defaultChecked={!defaultShared} className="peer sr-only" />
        <span className="block rounded-[10px] px-3 py-1.5 text-stone-500 peer-checked:bg-surface peer-checked:text-stone-900 peer-checked:shadow-soft">🔒 {tr("Perso")}</span>
      </label>
      <label className="cursor-pointer">
        <input type="radio" name={name} value="1" defaultChecked={defaultShared} className="peer sr-only" />
        <span className="block rounded-[10px] px-3 py-1.5 text-stone-500 peer-checked:bg-violet-600 peer-checked:text-white peer-checked:shadow-soft">👥 {tr("Partagé")}</span>
      </label>
    </fieldset>
  );
}
