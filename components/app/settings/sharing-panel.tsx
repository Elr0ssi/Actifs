"use client";

import { useState, useTransition } from "react";
import { useT } from "@/components/i18n/provider";
import { SHARE_SECTIONS, type ShareLevel, type ShareSection } from "@/lib/sharing";
import { setMemberShare, setShareDefault } from "@/app/(main)/app/settings/actions";

type Levels = Record<ShareSection, ShareLevel>;
export type SharingMember = { id: string; name: string; given: Levels; received: Levels };

export function LevelPicker({ value, canEdit, disabled, label, onChange }: { value: ShareLevel; canEdit: boolean; disabled: boolean; label: string; onChange: (v: ShareLevel) => void }) {
  const tr = useT();
  const options: { id: ShareLevel; text: string }[] = [
    { id: "none", text: tr("Rien") },
    { id: "view", text: tr("Voir") },
    ...(canEdit ? [{ id: "edit" as ShareLevel, text: tr("Modifier") }] : []),
  ];
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex shrink-0 rounded-xl bg-stone-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          disabled={disabled}
          onClick={() => value !== o.id && onChange(o.id)}
          className={`rounded-[10px] px-2.5 py-1 text-xs font-semibold transition ${
            value === o.id ? (o.id === "none" ? "bg-surface text-stone-700 shadow-soft" : "bg-brand-600 text-white shadow-soft") : "text-stone-500 hover:text-stone-800"
          }`}
        >
          {o.text}
        </button>
      ))}
    </div>
  );
}

function levelText(tr: ReturnType<typeof useT>, l: ShareLevel) {
  return l === "edit" ? tr("modifier") : tr("voir");
}

/**
 * Qui voit quoi : pour chaque membre du foyer, ce que TU partages avec lui (section par section),
 * ce qu'il partage avec toi, et les réglages appliqués aux futures personnes qui rejoignent avec ton code.
 * Par défaut rien n'est partagé, à part ce que tu as choisi.
 */
export function SharingPanel({ members, defaults }: { members: SharingMember[]; defaults: Levels }) {
  const tr = useT();
  const [given, setGiven] = useState<Record<string, Levels>>(() => Object.fromEntries(members.map((m) => [m.id, m.given])));
  const [defs, setDefs] = useState<Levels>(defaults);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function changeMember(memberId: string, section: ShareSection, level: ShareLevel) {
    const before = given[memberId];
    setError(null);
    setGiven((g) => ({ ...g, [memberId]: { ...g[memberId], [section]: level } }));
    start(async () => {
      try {
        await setMemberShare(memberId, section, level);
      } catch {
        setGiven((g) => ({ ...g, [memberId]: before }));
        setError(tr("Le réglage n'a pas pu être enregistré. Réessaie."));
      }
    });
  }

  function changeDefault(section: ShareSection, level: ShareLevel) {
    const before = defs;
    setError(null);
    setDefs((d) => ({ ...d, [section]: level }));
    start(async () => {
      try {
        await setShareDefault(section, level);
      } catch {
        setDefs(before);
        setError(tr("Le réglage n'a pas pu être enregistré. Réessaie."));
      }
    });
  }

  return (
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

      <div className="rounded-2xl bg-stone-50 p-4">
        <p className="text-sm font-semibold text-stone-800">{tr("Quand quelqu'un rejoint avec ton code")}</p>
        <p className="mb-3 mt-1 text-xs text-stone-500">{tr("Choisis ce qu'il/elle verra de ce qui est à toi. Tu pourras le changer ensuite, personne par personne. Ses propres données restent à lui/elle.")}</p>
        <ul className="space-y-2">
          {SHARE_SECTIONS.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-stone-800">{tr(s.label)}</p>
                <p className="text-[11px] text-stone-500">{tr(s.hint)}</p>
              </div>
              <LevelPicker value={defs[s.id]} canEdit={s.canEdit} disabled={pending} label={tr(s.label)} onChange={(v) => changeDefault(s.id, v)} />
            </li>
          ))}
        </ul>
      </div>

      {members.length === 0 ? (
        <p className="text-xs text-stone-500">{tr("Personne d'autre dans ton foyer pour l'instant. Partage ton code d'invitation : tu pourras alors choisir ici ce que chacun voit.")}</p>
      ) : (
        members.map((m) => {
          const receivedList = SHARE_SECTIONS.filter((s) => m.received[s.id] !== "none");
          return (
            <div key={m.id} className="rounded-2xl border border-line p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-violet-600 text-sm font-bold text-white">{(m.name || "?").slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">{m.name}</p>
                  <p className="text-[11px] text-stone-500">{tr("Ce que {name} peut voir de ce qui est à toi", { name: m.name })}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-2">
                {SHARE_SECTIONS.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-stone-800">{tr(s.label)}</p>
                    <LevelPicker value={given[m.id]?.[s.id] ?? "none"} canEdit={s.canEdit} disabled={pending} label={`${m.name} — ${tr(s.label)}`} onChange={(v) => changeMember(m.id, s.id, v)} />
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-3 text-[11px] text-stone-500">
                {receivedList.length === 0
                  ? tr("{name} ne partage rien avec toi pour l'instant.", { name: m.name })
                  : tr("{name} partage avec toi :", { name: m.name }) + " " + receivedList.map((s) => `${tr(s.label)} (${levelText(tr, m.received[s.id])})`).join(", ")}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
