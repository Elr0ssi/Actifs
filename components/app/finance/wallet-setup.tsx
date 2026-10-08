"use client";

import { useT } from "@/components/i18n/provider";
import { useState, useTransition } from "react";
import { addTestPayment, regenerateWalletToken } from "@/app/(main)/app/finance/actions";

const CODE = "rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-brand-700";

export function WalletSetup({ token, defaultOpen }: { token: string; defaultOpen: boolean }) {
  const tr = useT();
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [pending, start] = useTransition();
  const [tested, setTested] = useState(false);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const url = `${origin}/api/wallet/${token}`;
  const template = url;

  const copy = async (what: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  return (
    <section className="card p-5">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <h2 className="font-semibold text-stone-900">{tr("📱 Connecter mes paiements iPhone (Apple Pay)")}</h2>
          <p className="text-xs text-stone-500">{tr("Chaque paiement Wallet arrive ici tout seul : commerçant, heure, montant.")}</p>
        </div>
        <span className="text-xs font-medium text-brand-600">{open ? tr("Masquer") : tr("Configurer")}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 text-[13px] text-stone-700">
          <div>
            <p className="label mb-1.5">{tr("1 · Copie ton adresse privée (garde-la pour toi)")}</p>
            <div className="flex gap-2">
              <input readOnly value={template} onFocus={(e) => e.currentTarget.select()} className="input flex-1 font-mono text-xs" aria-label={tr("Adresse de réception des paiements")} />
              <button type="button" className="btn-primary" onClick={() => copy("url", template)}>{copied === "url" ? tr("Copié ✓") : tr("Copier")}</button>
            </div>
          </div>

          <div>
            <p className="label mb-1.5">{tr("2 · Sur ton iPhone (une seule fois, environ 2 minutes)")}</p>
            <ol className="list-decimal space-y-2 pl-5 leading-relaxed">
              <li>{tr("Ouvre l'application")} <b>{tr("« Raccourcis »")}</b>.</li>
              <li>{tr("En bas de l'écran, appuie sur")} <b>{tr("« Automatisation »")}</b>.</li>
              <li>{tr("Appuie sur")} <b>« + »</b> {tr("en haut à droite.")}</li>
              <li>{tr("Dans")} <b>{tr("« Nouvelle automatisation »")}</b>{tr(", sélectionne")} <b>{tr("« Carte »")}</b>.</li>
              <li>{tr("Sélectionne la ou les cartes bancaires que tu veux connecter.")}</li>
              <li>{tr("Sélectionne")} <b>{tr("« Exécuter immédiatement »")}</b>.</li>
              <li>{tr("Appuie sur")} <b>{tr("« Suivant »")}</b>.</li>
              <li>{tr("Appuie sur")} <b>{tr("« Créer un raccourci »")}</b>.</li>
              <li>{tr("Dans le nouveau raccourci, ajoute l'action")} <b>{tr("« Obtenir le contenu de l'URL »")}</b>.</li>
              <li>{tr("Dans le bloc")} <b>{tr("« Obtenir le contenu de »")}</b>{tr(", appuie directement sur le bouton bleu")} <b>{tr("« URL »")}</b>.</li>
              <li>{tr("Colle dans ce champ l'adresse copiée à l'étape 1.")}</li>
              <li>{tr("Appuie sur la")} <b>{tr("petite flèche bleue")}</b> {tr("à droite de l'URL pour afficher les options.")}</li>
              <li>À <b>{tr("« Méthode »")}</b>{tr(", appuie sur")} <b>{tr("« GET »")}</b> {tr("puis sélectionne")} <b>{tr("« POST »")}</b>.</li>
              <li><b>{tr("« Corps de la requête »")}</b> {tr("apparaît : sélectionne")} <b>{tr("« JSON »")}</b>.</li>
              <li>
                {tr("Appuie sur")} <b>{tr("« Ajouter nouveau champ »")}</b>{tr(", et crée ces")} <b>{tr("4 champs")}</b> :
                <div className="mt-2 overflow-hidden rounded-xl border border-line text-[12px]">
                  {[
                    { type: "Nombre", key: "amount", prop: tr("Montant") },
                    { type: "Texte", key: "merchant", prop: tr("Commerçant") },
                    { type: "Texte", key: "name", prop: tr("Nom") },
                    { type: "Texte", key: "card", prop: tr("Carte ou billet") },
                  ].map((f) => (
                    <div key={f.key} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b border-line/70 px-3 py-2 last:border-0">
                      <span className="w-14 text-stone-400">{f.type}</span>
                      <span className={CODE}>{f.key}</span>
                      <span className="text-stone-500">{tr("→ « Entrée de raccourci » →")} <b className="text-stone-800">« {f.prop} »</b></span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-stone-600">
                  {tr("Pour chaque valeur : appuie dans la valeur du champ, sélectionne")} <b>{tr("« Entrée de raccourci »")}</b>{tr(", appuie sur la variable insérée, puis choisis la propriété ci-dessus (dans la liste : Transaction, Carte ou billet, Commerçant, Montant, Nom).")}
                </p>
              </li>
              <li>{tr("Appuie sur la")} <b>{tr("coche bleue ✓")}</b> {tr("en haut à droite pour enregistrer.")}</li>
            </ol>
            <p className="mt-3 rounded-lg bg-sky-500/10 px-3 py-2 text-[12px] text-sky-800">{tr("La date et l'heure ne sont pas fournies par l'iPhone : elles sont ajoutées automatiquement par ton site à la réception de chaque paiement.")}</p>
            <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-[12px] text-amber-800">{tr("Apple ne permet pas de partager cette automatisation par lien : elle se crée une seule fois sur le téléphone.")}</p>
          </div>

          <div>
            <p className="label mb-1.5">{tr("3 · Vérifier")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={pending} onClick={() => start(async () => { await addTestPayment(); setTested(true); })} className="btn-secondary">{tr("Ajouter un paiement test de 1 €")}</button>
              <button type="button" className="btn-secondary" onClick={() => copy("test", `${url}?merchant=Test%20Safari&amount=1,50`)}>{copied === "test" ? tr("Copié ✓") : tr("Copier un lien de test")}</button>
              {tested && <span className="text-xs text-emerald-600">{tr("Ajouté : il apparaît dans la liste ci-dessous.")}</span>}
            </div>
            <p className="mt-1.5 text-[11px] text-stone-500">{tr("Le lien de test s'ouvre dans Safari et enregistre un paiement de 1,50 € — tu peux le supprimer ensuite.")}</p>
          </div>

          <form
            action={regenerateWalletToken}
            onSubmit={(e) => { if (!confirm(tr("Générer une nouvelle adresse ? L'ancienne cessera de fonctionner et ton automatisation devra être mise à jour."))) e.preventDefault(); }}
          >
            <button className="text-[11px] text-stone-400 underline hover:text-rose-600">{tr("Changer l'adresse (si elle a fuité)")}</button>
          </form>
        </div>
      )}
    </section>
  );
}
