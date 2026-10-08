"use client";

import { useT } from "@/components/i18n/provider";
import { useState } from "react";
import { regenerateCalendarToken } from "@/app/app/settings/actions";

export function CalendarFeedCard({ token }: { token: string }) {
  const tr = useT();
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? `/api/calendar/${token}` : `${window.location.origin}/api/calendar/${token}`;
  const webcal = url.replace(/^https?:/, "webcal:");
  return (
    <div>
      <div className="flex gap-2">
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="input flex-1 font-mono text-xs" aria-label={tr("Adresse du flux calendrier")} />
        <button type="button" className="btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }}>
          {copied ? tr("Copié ✓") : tr("Copier")}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <a href={webcal} className="btn-secondary px-3 py-1.5 text-xs">{tr("S'abonner sur cet appareil (iPhone / Mac)")}</a>
        <form action={regenerateCalendarToken} onSubmit={(e) => { if (!confirm("Générer une nouvelle adresse ? L'ancienne cessera de fonctionner.")) e.preventDefault(); }}>
          <button className="text-stone-400 underline hover:text-rose-600">{tr("Changer l'adresse")}</button>
        </form>
      </div>
      <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-stone-500">
        <li><strong className="text-stone-700">{tr("Google Agenda")}</strong> : Autres agendas → « + » → À partir de l'URL → colle l'adresse.</li>
        <li><strong className="text-stone-700">{tr("iPhone")}</strong> : Réglages → Calendrier → Comptes → Ajouter un compte → Autre → Ajouter un calendrier avec abonnement, ou touche le bouton ci-dessus.</li>
        <li>{tr("Le flux est en lecture seule et se met à jour tout seul (comptez quelques heures côté Google). Toute personne ayant l'adresse peut le lire : ne la partage pas.")}</li>
      </ul>
    </div>
  );
}
