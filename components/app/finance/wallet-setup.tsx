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
            <p className="label mb-1.5">2 · Sur ton iPhone, dans l'app Raccourcis</p>
            <ol className="list-decimal space-y-1.5 pl-5 leading-relaxed">
              <li>Ouvre <b>Raccourcis</b>, va dans <b>Automatisation</b> et appuie sur <b>+</b>.</li>
              <li>Choisis <b>Transaction</b>.</li>
              <li>Dans <b>« Quand je touche »</b>, sélectionne ta ou tes cartes Wallet, puis continue.</li>
              <li>Choisis l'exécution <b>automatique</b>, sans demander de validation à chaque paiement.</li>
              <li>Ajoute l'action <b>« Obtenir le contenu de l'URL »</b>.</li>
              <li>Colle l'adresse copiée à l'étape 1 dans le champ URL.</li>
              <li>Affiche les options supplémentaires et choisis la méthode <b>POST</b>.</li>
              <li>Pour <b>« Demander le corps »</b>, choisis <b>JSON</b>.</li>
              <li>
                Ajoute ces trois champs, en choisissant à chaque fois la variable de la transaction qui correspond :
                <ul className="mt-1 space-y-0.5 text-[12px]">
                  <li><span className={CODE}>merchant</span> → le commerçant</li>
                  <li><span className={CODE}>amount</span> → le montant</li>
                  <li><span className={CODE}>card</span> → la carte</li>
                </ul>
              </li>
              <li>Valide en haut à droite.</li>
            </ol>
            <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-[12px] text-amber-800">Apple ne permet pas de partager cette automatisation par lien : elle se crée une seule fois sur le téléphone. Le reste est automatique.</p>
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
