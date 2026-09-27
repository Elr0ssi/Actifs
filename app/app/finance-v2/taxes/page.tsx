import type { Metadata } from "next";
import { loadFinanceV2Data } from "@/lib/data/finance-v2";
import { formatEUR, todayISO } from "@/lib/utils";
import { saveTaxProfile } from "@/app/app/finance-v2/actions";

export const metadata: Metadata = { title: "Finance — Impôts" };

export default async function TaxesPage({ searchParams }: { searchParams: { year?: string } }) {
  const data = await loadFinanceV2Data();
  if (!data) return null;

  const year = Number(searchParams.year) || new Date(`${todayISO()}T00:00:00Z`).getUTCFullYear();
  const profile = data.taxProfiles.find((t) => t.year === year);
  const inputs = profile?.inputs ?? {};

  return (
    <div className="space-y-6">
      <div className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Estimation indisponible : le barème et les règles fiscales {year} ne sont pas implémentés ici. Cette page enregistre tes données et une provision <b>manuelle</b> uniquement — aucun calcul automatique n'est inventé.
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Données {year}</h2>
        <form action={saveTaxProfile.bind(null, year)} className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-slate-500">
            Revenu imposable saisi
            <input name="gross_income" type="number" step="0.01" defaultValue={inputs.grossIncome ?? ""} className="input mt-1" />
          </label>
          <label className="text-xs text-slate-500">
            Déjà prélevé (prélèvement à la source)
            <input name="already_withheld" type="number" step="0.01" defaultValue={inputs.alreadyWithheld ?? ""} className="input mt-1" />
          </label>
          <label className="text-xs text-slate-500">
            Parts fiscales du foyer
            <input name="household_parts" type="number" step="0.5" defaultValue={inputs.householdParts ?? 1} className="input mt-1" />
          </label>
          <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="net_after_withholding" defaultChecked={Boolean(inputs.netAlreadyAfterWithholding)} />
            Le montant saisi est déjà net après prélèvement (ne pas déduire une seconde fois)
          </label>
          <label className="text-xs text-slate-500 sm:col-span-2">
            Provision manuelle pour l'année
            <input name="provision_manual" type="number" step="0.01" defaultValue={profile?.provisionManual ?? ""} placeholder="Ton estimation, à la main" className="input mt-1" />
          </label>
          <button className="btn-primary sm:col-span-2">Enregistrer</button>
        </form>
      </div>

      {profile?.provisionManual !== null && profile?.provisionManual !== undefined && (
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Provision manuelle</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{formatEUR(profile.provisionManual)}</p>
          <p className="mt-1 text-xs text-slate-400">Prélèvement mensuel indicatif : {formatEUR(profile.provisionManual / 12)}</p>
        </div>
      )}
    </div>
  );
}
