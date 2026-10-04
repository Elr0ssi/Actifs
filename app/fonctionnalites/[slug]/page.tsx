import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/marketing/json-ld";
import { Aurora, Bubble, Float, InView, Marquee } from "@/components/marketing/fx";
import { CtaBanner, StepsRail } from "@/components/marketing/sections";
import { MOCKS } from "@/components/marketing/mocks";
import { FEATURES, getFeature } from "@/lib/marketing/features";
import { getGuide } from "@/lib/marketing/guides";
import { SITE_NAME, absolute, pageMeta } from "@/lib/marketing/site";
import { cx } from "@/lib/utils";

export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const f = getFeature(params.slug);
  if (!f) return {};
  return pageMeta({ title: f.title, description: f.description, path: `/fonctionnalites/${f.slug}` });
}

const POS = ["-left-4 top-8 sm:-left-10", "-right-2 top-1/3 sm:-right-8", "left-4 -bottom-5 sm:left-8"];

export default function FeaturePage({ params }: { params: { slug: string } }) {
  const f = getFeature(params.slug);
  if (!f) notFound();
  const Mock = MOCKS[f.mock];
  const url = absolute(`/fonctionnalites/${f.slug}`);
  const others = FEATURES.filter((x) => x.slug !== f.slug);
  const guides = f.guides.map((s) => getGuide(s)).filter((g): g is NonNullable<typeof g> => !!g);

  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebPage", name: f.h1, description: f.description, url, inLanguage: "fr-FR", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absolute("/") } },
          faqJsonLd(f.faq),
          breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Fonctionnalités", url: absolute("/fonctionnalites") }, { name: f.name, url }]),
        ]}
      />
      <SiteHeader current="fonctionnalites" />
      <Aurora />
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <nav aria-label="Fil d'Ariane" className="text-sm text-stone-500">
              <Link href="/" className="hover:text-stone-800">Accueil</Link> <span className="mx-1">/</span>
              <Link href="/fonctionnalites" className="hover:text-stone-800">Fonctionnalités</Link>
            </nav>
            <span className={cx("mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold", f.soft)}><span className="text-base">{f.icon}</span>{f.name}</span>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl">{f.h1}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">{f.intro}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">Créer mon espace</Link>
              {f.tool && <Link href={f.tool.href} className="btn-secondary px-6 py-3 text-base">{f.tool.label}</Link>}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className={cx("absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br opacity-20 blur-2xl", f.gradient)} aria-hidden />
            <Mock />
            {f.bubbles.map((b, i) => (
              <Float key={b.title} delay={i * 1.1} duration={6 + i} amp={10} rot={i % 2 ? -2 : 2} className={cx("absolute z-10", POS[i])}>
                <Bubble {...b} />
              </Float>
            ))}
          </div>
        </section>

        {/* Points forts en zigzag */}
        <section className="bg-stone-50 py-20" aria-labelledby="forts">
          <div className="mx-auto max-w-5xl px-6">
            <h2 id="forts" className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Ce que tu peux faire</h2>
            <div className="mt-14 space-y-6">
              {f.highlights.map((h, i) => (
                <InView key={h.title}>
                  <div className={cx("fx-in flex flex-col items-start gap-5 rounded-[2rem] border border-line bg-surface p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8", i % 2 === 1 && "sm:flex-row-reverse sm:text-right")}>
                    <span className={cx("relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br text-4xl text-white shadow-lift", f.gradient)}>
                      {h.icon}
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface text-xs font-bold text-stone-800 shadow">{i + 1}</span>
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900">{h.title}</h3>
                      <p className="mt-2 leading-relaxed text-stone-600">{h.text}</p>
                    </div>
                  </div>
                </InView>
              ))}
            </div>
          </div>
        </section>

        {/* Étapes */}
        <section className="mx-auto max-w-5xl px-6 py-20" aria-labelledby="etapes">
          <h2 id="etapes" className="text-center text-3xl font-bold tracking-tight sm:text-4xl">En pratique</h2>
          <div className="mt-12"><StepsRail steps={f.steps} /></div>
        </section>

        {/* Autres modules */}
        <section className="py-10" aria-label="Autres fonctionnalités">
          <p className="mb-5 text-center text-sm font-semibold text-stone-500">Aussi dans All In</p>
          <Marquee speed={50} items={others.map((o) => (
            <Link key={o.slug} href={`/fonctionnalites/${o.slug}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className={cx("flex h-10 w-10 items-center justify-center rounded-xl text-xl", o.soft)}>{o.icon}</span>
              <span><span className="block text-sm font-semibold text-stone-900">{o.name}</span><span className="block max-w-[14rem] truncate text-xs text-stone-500">{o.short}</span></span>
            </Link>
          ))} />
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-20" aria-labelledby="faq">
          <h2 id="faq" className="text-center text-3xl font-bold tracking-tight">Questions fréquentes</h2>
          <div className="mt-8 divide-y divide-line rounded-3xl border border-line bg-surface">
            {f.faq.map((q) => (
              <details key={q.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-stone-900">
                  {q.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition group-open:rotate-45 group-open:bg-brand-50 group-open:text-brand-700">+</span>
                </summary>
                <p className="mt-3 pr-10 text-sm leading-relaxed text-stone-600">{q.a}</p>
              </details>
            ))}
          </div>
        </section>

        {guides.length > 0 && (
          <section className="mx-auto max-w-5xl px-6 pb-16">
            <h2 className="text-lg font-bold text-stone-900">Pour aller plus loin</h2>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {guides.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="min-w-[16rem] max-w-xs flex-1 rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <p className="text-xs font-semibold text-brand-700">{g.category}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-stone-900">{g.h1}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <CtaBanner title={`Essaie ${f.name.toLowerCase()} dans All In`} text="Un seul espace pour organiser ton temps, tes repas et ton argent, seul ou à deux." secondary={f.tool ? { href: f.tool.href, label: "Version gratuite sans compte" } : undefined} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
