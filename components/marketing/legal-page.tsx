import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { absolute } from "@/lib/marketing/site";

export interface LegalSection {
  h2: string;
  paragraphs?: string[];
  list?: string[];
}

/** Mise en page commune des pages légales (confidentialité, CGU, mentions légales). */
export function LegalPage({ title, path, updated, intro, sections }: { title: string; path: string; updated: string; intro: string; sections: LegalSection[] }) {
  return (
    <div className="relative overflow-hidden">
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: title, url: absolute(path) }])} />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">{title}</h1>
        <p className="mt-2 text-sm text-stone-500">Dernière mise à jour : {updated}</p>
        <p className="mt-6 leading-relaxed text-stone-700">{intro}</p>
        <div className="mt-10 space-y-9">
          {sections.map((s) => (
            <section key={s.h2}>
              <h2 className="text-xl font-bold text-stone-900">{s.h2}</h2>
              {s.paragraphs?.map((p) => <p key={p} className="mt-3 leading-relaxed text-stone-700">{p}</p>)}
              {s.list && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-stone-700">
                  {s.list.map((li) => <li key={li}>{li}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
