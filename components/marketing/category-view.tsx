import { lowerFor } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/i18n/server";
import Link from "@/components/marketing/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { Bubble, Float, InView } from "@/components/marketing/fx";
import { Ambience, CtaBanner } from "@/components/marketing/sections";
import { MOCKS } from "@/components/marketing/mocks";
import { CATEGORIES, GUIDE_CATEGORY, featuresOf, type CategoryKey } from "@/lib/marketing/features";
import { GUIDES } from "@/lib/marketing/guides";
import { absolute } from "@/lib/marketing/site";
import { cx } from "@/lib/utils";

export function CategoryView({ category }: { category: CategoryKey }) {
  const tr = getT();
  const c = CATEGORIES.find((x) => x.key === category)!;
  const list = featuresOf(c);
  const url = absolute(c.href);
  const articles = GUIDES.filter((g) => GUIDE_CATEGORY[g.category] === category);
  const [topArticle, ...restArticles] = articles;
  return (
    <div className="relative overflow-hidden">
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Fonctionnalités", url: absolute("/fonctionnalites") }, { name: c.name, url }])} />
      <SiteHeader current={c.key} />
      <main>
        <section className="relative">
          <Ambience tone={c.tone} emojis={c.emojis} />
          <div className="relative mx-auto max-w-4xl px-6 pb-14 pt-16 text-center">
            <h1 className="text-6xl font-extrabold tracking-tight text-stone-900 sm:text-8xl">
              {tr("Flozea")} <span className={cx("bg-gradient-to-r bg-clip-text text-transparent", c.gradient)}>{tr(c.label)}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-xl font-semibold text-stone-800 sm:text-2xl">{tr(c.tagline)}</p>
            <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-stone-600">{tr(c.description)}</p>
          </div>
        </section>

        {list.map((f, i) => {
          const Mock = MOCKS[f.mock];
          return (
            <section key={f.slug} className={cx("relative overflow-hidden py-16", i % 2 === 0 ? "bg-transparent" : "bg-stone-50/80")}>
              <div className={cx("mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2", i % 2 === 1 && "lg:[&>*:first-child]:order-2")}>
                <div>
                  <span className={cx("inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold", f.soft)}>
                    <span className="text-base">{tr(f.icon)}</span>{tr(f.name)}
                    {f.soon && <span className="rounded-full bg-white px-1.5 py-px text-[9px] font-bold uppercase text-indigo-700">{tr("Bientôt")}</span>}
                  </span>
                  <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl">{tr(f.h1)}</h2>
                  <p className="mt-4 leading-relaxed text-stone-600">{tr(f.intro)}</p>
                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {f.highlights.slice(0, 4).map((h) => (
                      <li key={h.title} className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-3 py-2.5 text-sm font-medium text-stone-800">
                        <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base text-white", f.gradient)}>{tr(h.icon)}</span>
                        {tr(h.title)}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/fonctionnalites/${f.slug}`} className="btn-primary mt-7 inline-block px-6 py-3">{tr("Découvrir")} {lowerFor(getLocale(), tr(f.name))} →</Link>
                </div>
                <InView>
                  <div className="relative mx-auto w-full max-w-xl">
                    <div className={cx("absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br opacity-20 blur-2xl", f.gradient)} aria-hidden />
                    <Mock />
                    {f.bubbles.slice(0, 2).map((b, k) => (
                      <Float key={b.title} delay={k * 1.2} duration={6.5 + k} amp={10} rot={k ? -2 : 2} className={cx("absolute z-10", k ? "-right-2 bottom-8 sm:-right-6" : "-left-2 top-6 sm:-left-8")}>
                        <Bubble {...b} />
                      </Float>
                    ))}
                  </div>
                </InView>
              </div>
            </section>
          );
        })}

        {topArticle && (
          <section id="articles" className="relative overflow-hidden py-20" aria-labelledby="articles-titre">
            <Ambience tone={c.tone} dots={false} />
            <div className="relative mx-auto max-w-6xl px-6">
              <div className="text-center">
                <span className={cx("rounded-full px-4 py-1.5 text-xs font-semibold", c.soft)}>{tr(c.icon)} {tr("Articles")}</span>
                <h2 id="articles-titre" className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{tr("Pour aller plus loin avec")} {tr(c.name)}</h2>
                <p className="mx-auto mt-3 max-w-xl text-stone-600">{articles.length} {tr("articles pratiques pour mieux t'organiser, avec des méthodes simples et concrètes.")}</p>
              </div>
              <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
                <InView>
                  <Link href={`/guides/${topArticle.slug}`} className={cx("fx-in group relative block h-full overflow-hidden rounded-[2rem] bg-gradient-to-br p-8 text-white", c.gradient)}>
                    <span className="fx-gradient pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.14),transparent)]" aria-hidden />
                    <p className="relative text-xs font-semibold uppercase tracking-widest text-white/70">{tr("À lire en premier ·")} {topArticle.minutes} {tr("min")}</p>
                    <h3 className="relative mt-4 text-2xl font-bold leading-tight sm:text-3xl">{tr(topArticle.h1)}</h3>
                    <p className="relative mt-3 line-clamp-4 text-white/85">{tr(topArticle.description)}</p>
                    <p className="relative mt-6 font-semibold transition group-hover:translate-x-1">{tr("Lire l'article →")}</p>
                  </Link>
                </InView>
                <ol className="divide-y divide-stone-200/80">
                  {restArticles.map((g, i) => (
                    <li key={g.slug}>
                      <Link href={`/guides/${g.slug}`} className="group flex items-center gap-4 py-3.5">
                        <span className="w-8 text-xl font-bold text-stone-300 transition group-hover:text-brand-500">{String(i + 2).padStart(2, "0")}</span>
                        <span className="flex-1">
                          <span className="block font-semibold leading-snug text-stone-900 group-hover:text-brand-700">{tr(g.h1)}</span>
                          <span className="text-xs text-stone-500">{g.minutes} {tr("min de lecture")}</span>
                        </span>
                        <span className="text-stone-300 transition group-hover:translate-x-1 group-hover:text-brand-500">→</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-5xl px-6 py-20">
          <CtaBanner title={`Essaie ${c.name}`} text={tr("Un seul espace pour organiser ton temps, tes repas et ton argent, seul ou à deux.")} secondary={{ href: "/tarifs", label: tr("Voir les tarifs") }} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
