import { getT } from "@/lib/i18n/server";

/** Offre « connexion bancaire » : visible par tous comme « en développement », utilisable seulement par les profils débloqués. */
export function BankConnectCard({ unlocked, providerReady }: { unlocked: boolean; providerReady: boolean }) {
  const tr = getT();
  const steps = [tr("Tu choisis ta banque"), tr("Tu confirmes un accès en lecture seule"), tr("Tes opérations arrivent seules dans Flozea")];
  return (
    <section className="card relative overflow-hidden p-5 sm:col-span-2 lg:col-span-3">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-300 to-sky-300 opacity-30 blur-3xl" aria-hidden />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="flex items-center gap-2 font-semibold text-stone-900">🏦 {tr("Connexion bancaire directe")}</p>
            <span className="rounded-full bg-indigo-100 px-2 py-px text-[10px] font-bold uppercase tracking-wide text-indigo-700">{tr("En développement")}</span>
            {unlocked && <span className="rounded-full bg-emerald-100 px-2 py-px text-[10px] font-bold uppercase tracking-wide text-emerald-700">{tr("Accès développeur")}</span>}
          </div>
          <p className="mt-1.5 text-sm text-stone-600">{tr("Relie ton compte en lecture seule : tes opérations sont récupérées et analysées toutes seules, sans rien saisir. Prévu à 3 € par mois.")}</p>
          <ol className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-500">
            {steps.map((s, i) => <li key={s} className="flex items-center gap-1.5"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-100 text-[9px] font-bold text-stone-600">{i + 1}</span>{s}</li>)}
          </ol>
        </div>
        <div className="shrink-0 text-right">
          {unlocked ? (
            <>
              <button type="button" disabled className="btn-primary cursor-not-allowed opacity-50">{tr("Connecter ma banque")}</button>
              <p className="mt-2 max-w-[16rem] text-[11px] text-stone-500">
                {providerReady ? tr("Fournisseur configuré : l'écran de connexion sera branché ici.") : tr("Le fournisseur de connexion bancaire n'est pas encore configuré (clés API manquantes côté serveur).")}
              </p>
            </>
          ) : (
            <>
              <button type="button" disabled className="btn-secondary cursor-not-allowed opacity-60">{tr("Bientôt disponible")}</button>
              <p className="mt-2 max-w-[16rem] text-[11px] text-stone-400">{tr("Cette offre n'est pas encore ouverte. Elle sera débloquée pour certains profils pendant les tests.")}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
