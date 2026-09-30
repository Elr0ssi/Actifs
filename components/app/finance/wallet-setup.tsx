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
  const template = `${url}?merchant=&amount=&card=`;

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
            <p className="mt-1 text-[11px] text-stone-500">Elle se termine par <span className={CODE}>?merchant=&amp;amount=&amp;card=</span> : c'est là que Raccourcis viendra mettre le commerçant, le montant et la carte.</p>
          </div>

          <div>
            <p className="label mb-1.5">2 · Sur ton iPhone : Raccourcis → Automatisation → + → Transaction</p>
            <ol className="list-decimal space-y-1.5 pl-5 leading-relaxed">
              <li>Choisis tes cartes, garde « Toute transaction », <b>Suivant</b>. Tu arrives sur l'écran avec <b>« Recevoir transaction en tant qu'entrée »</b>.</li>
              <li>Si une action <b>« Partager Contenu avec App »</b> est présente, supprime-la (croix à droite).</li>
              <li>Dans « Rechercher des actions », tape <b>URL</b> et ajoute <b>« Obtenir le contenu de l'URL »</b>.</li>
              <li>Touche le champ URL et <b>colle</b> l'adresse copiée.</li>
              <li>Place le curseur juste après <span className={CODE}>merchant=</span>, puis dans la barre au-dessus du clavier touche la variable <b>Transaction</b> et choisis sa propriété <b>Commerçant</b>. Fais pareil après <span className={CODE}>amount=</span> avec <b>Montant</b>, et après <span className={CODE}>card=</span> avec <b>Carte ou Pass</b>.</li>
              <li>Laisse la méthode sur <b>GET</b> (par défaut), touche <b>✓</b> en haut à droite, puis désactive <b>« Demander avant d'exécuter »</b> s'il apparaît.</li>
            </ol>
            <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-[12px] text-amber-800">Apple ne permet pas de partager cette automatisation par lien : elle doit être créée sur le téléphone. Les noms des propriétés peuvent varier légèrement selon la version d'iOS : prends celles qui correspondent au commerçant, au montant et à la carte.</p>
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
