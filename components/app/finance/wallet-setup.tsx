"use client";

import { useState, useTransition } from "react";
import { addTestPayment, regenerateWalletToken } from "@/app/app/finance/actions";

const CODE = "rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-brand-700";

export function WalletSetup({ token, defaultOpen }: { token: string; defaultOpen: boolean }) {
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
          <h2 className="font-semibold text-stone-900">📱 Connecter mes paiements iPhone (Apple Pay)</h2>
          <p className="text-xs text-stone-500">Chaque paiement Wallet arrive ici tout seul : commerçant, heure, montant.</p>
        </div>
        <span className="text-xs font-medium text-brand-600">{open ? "Masquer" : "Configurer"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 text-[13px] text-stone-700">
          <div>
            <p className="label mb-1.5">1 · Copie ton adresse privée (garde-la pour toi)</p>
            <div className="flex gap-2">
              <input readOnly value={template} onFocus={(e) => e.currentTarget.select()} className="input flex-1 font-mono text-xs" aria-label="Adresse de réception des paiements" />
              <button type="button" className="btn-primary" onClick={() => copy("url", template)}>{copied === "url" ? "Copié ✓" : "Copier"}</button>
            </div>
          </div>

          <div>
            <p className="label mb-1.5">2 · Sur ton iPhone (une seule fois, environ 2 minutes)</p>
            <ol className="list-decimal space-y-2 pl-5 leading-relaxed">
              <li>Ouvre l'application <b>« Raccourcis »</b>.</li>
              <li>En bas de l'écran, appuie sur <b>« Automatisation »</b>.</li>
              <li>Appuie sur <b>« + »</b> en haut à droite.</li>
              <li>Dans <b>« Nouvelle automatisation »</b>, sélectionne <b>« Carte »</b>.</li>
              <li>Sélectionne la ou les cartes bancaires que tu veux connecter.</li>
              <li>Sélectionne <b>« Exécuter immédiatement »</b>.</li>
              <li>Appuie sur <b>« Suivant »</b>.</li>
              <li>Appuie sur <b>« Créer un raccourci »</b>.</li>
              <li>Dans le nouveau raccourci, ajoute l'action <b>« Obtenir le contenu de l'URL »</b>.</li>
              <li>Dans le bloc <b>« Obtenir le contenu de »</b>, appuie directement sur le bouton bleu <b>« URL »</b>.</li>
              <li>Colle dans ce champ l'adresse copiée à l'étape 1.</li>
              <li>Appuie sur la <b>petite flèche bleue</b> à droite de l'URL pour afficher les options.</li>
              <li>À <b>« Méthode »</b>, appuie sur <b>« GET »</b> puis sélectionne <b>« POST »</b>.</li>
              <li><b>« Corps de la requête »</b> apparaît : sélectionne <b>« JSON »</b>.</li>
              <li>
                Appuie sur <b>« Ajouter nouveau champ »</b>, et crée ces <b>4 champs</b> :
                <div className="mt-2 overflow-hidden rounded-xl border border-line text-[12px]">
                  {[
                    { type: "Nombre", key: "amount", prop: "Montant" },
                    { type: "Texte", key: "merchant", prop: "Commerçant" },
                    { type: "Texte", key: "name", prop: "Nom" },
                    { type: "Texte", key: "card", prop: "Carte ou billet" },
                  ].map((f) => (
                    <div key={f.key} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b border-line/70 px-3 py-2 last:border-0">
                      <span className="w-14 text-stone-400">{f.type}</span>
                      <span className={CODE}>{f.key}</span>
                      <span className="text-stone-500">→ « Entrée de raccourci » → <b className="text-stone-800">« {f.prop} »</b></span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-stone-600">
                  Pour chaque valeur : appuie dans la valeur du champ, sélectionne <b>« Entrée de raccourci »</b>, appuie sur la variable insérée, puis choisis la propriété ci-dessus (dans la liste : Transaction, Carte ou billet, Commerçant, Montant, Nom).
                </p>
              </li>
              <li>Appuie sur la <b>coche bleue ✓</b> en haut à droite pour enregistrer.</li>
            </ol>
            <p className="mt-3 rounded-lg bg-sky-500/10 px-3 py-2 text-[12px] text-sky-800">La date et l'heure ne sont pas fournies par l'iPhone : elles sont ajoutées automatiquement par ton site à la réception de chaque paiement.</p>
            <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-[12px] text-amber-800">Apple ne permet pas de partager cette automatisation par lien : elle se crée une seule fois sur le téléphone.</p>
          </div>

          <div>
            <p className="label mb-1.5">3 · Vérifier</p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={pending} onClick={() => start(async () => { await addTestPayment(); setTested(true); })} className="btn-secondary">Ajouter un paiement test de 1 €</button>
              <button type="button" className="btn-secondary" onClick={() => copy("test", `${url}?merchant=Test%20Safari&amount=1,50`)}>{copied === "test" ? "Copié ✓" : "Copier un lien de test"}</button>
              {tested && <span className="text-xs text-emerald-600">Ajouté : il apparaît dans la liste ci-dessous.</span>}
            </div>
            <p className="mt-1.5 text-[11px] text-stone-500">Le lien de test s'ouvre dans Safari et enregistre un paiement de 1,50 € — tu peux le supprimer ensuite.</p>
          </div>

          <form
            action={regenerateWalletToken}
            onSubmit={(e) => { if (!confirm("Générer une nouvelle adresse ? L'ancienne cessera de fonctionner et ton automatisation devra être mise à jour.")) e.preventDefault(); }}
          >
            <button className="text-[11px] text-stone-400 underline hover:text-rose-600">Changer l'adresse (si elle a fuité)</button>
          </form>
        </div>
      )}
    </section>
  );
}
