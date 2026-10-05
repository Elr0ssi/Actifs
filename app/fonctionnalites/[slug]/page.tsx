import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/marketing/json-ld";
import { Aurora, Bubble, Float, InView, Marquee } from "@/components/marketing/fx";
import { Ambience, CtaBanner, StepsRail, type AmbienceTone } from "@/components/marketing/sections";
import { MOCKS } from "@/components/marketing/mocks";
import { DragScroller } from "@/components/marketing/drag-scroller";
import { FEATURES, categoryOf, getFeature } from "@/lib/marketing/features";
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

const TONE: Record<string, { tone: AmbienceTone; band: string; emojis: string[] }> = {
  agenda: { tone: "violet", band: "bg-violet-50/70", emojis: ["📅", "⏰", "🔁"] },
  "taches-et-routines": { tone: "rose", band: "bg-rose-50/60", emojis: ["✅", "🔥", "🎯"] },
  "recettes-et-menu-de-la-semaine": { tone: "amber", band: "bg-amber-50/70", emojis: ["🍅", "🥕", "🧅", "🍝"] },
  "liste-de-courses": { tone: "emerald", band: "bg-emerald-50/60", emojis: ["🛒", "🥖", "🧀", "🥛"] },
  "budget-et-finances": { tone: "sky", band: "bg-sky-50/70", emojis: ["💶", "📈", "💳", "🏦"] },
  notes: { tone: "violet", band: "bg-indigo-50/60", emojis: ["📝", "📌", "💡"] },
  "paiements-automatiques": { tone: "rose", band: "bg-rose-50/60", emojis: ["💳", "📲", "🧾"] },
  "analyse-bancaire": { tone: "sky", band: "bg-indigo-50/60", emojis: ["🏦", "📊", "🔗"] },
};

const SPAN = [4, 2, 2, 4, 3, 3];
const SPAN_CLASS: Record<number, string> = { 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4", 6: "md:col-span-6" };
/** Largeurs des tuiles : le motif se répète et la dernière tuile comble la ligne. */
function spans(n: number) {
  const out = Array.from({ length: n }, (_, i) => SPAN[i % SPAN.length]);
  const used = out.slice(0, -1).reduce((a, b) => a + b, 0) % 6;
  if (n > 0) out[n - 1] = used === 0 ? 6 : 6 - used;
  return out;
}

const POS = ["-left-4 top-8 sm:-left-10", "-right-2 top-1/3 sm:-right-8", "left-4 -bottom-5 sm:left-8"];

export default function FeaturePage({ params }: { params: { slug: string } }) {
  const f = getFeature(params.slug);
  if (!f) notFound();
  const Mock = MOCKS[f.mock];
  const url = absolute(`/fonctionnalites/${f.slug}`);
  const others = FEATURES.filter((x) => x.slug !== f.slug);
  const cat = categoryOf(f);
  const t = TONE[f.slug] ?? TONE.agenda;
  const guides = f.guides.map((s) => getGuide(s)).filter((g): g is NonNullable<typeof g> => !!g);

  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebPage", name: f.h1, description: f.description, url, inLanguage: "fr-FR", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absolute("/") } },
          faqJsonLd(f.faq),
          breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Fonctionnalités", url: absolute("/fonctionnalites") }, { name: cat.name, url: absolute(cat.href) }, { name: f.name, url }]),
        ]}
      />
      <SiteHeader current={f.category} />
      <Aurora />
      <main>
        {/* Hero */}
        <section className="relative">
          <Ambience tone={t.tone} emojis={t.emojis} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <Link href={cat.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"><span aria-hidden>←</span> {cat.name}</Link>
            <span className={cx("mt-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold", f.soft)}><span className="text-base">{f.icon}</span>{f.name}{f.soon && <span className="rounded-full bg-white px-1.5 py-px text-[9px] font-bold uppercase text-indigo-700">Bientôt disponible</span>}</span>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl">{f.h1}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">{f.intro}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">{f.soon ? "Créer mon espace gratuit" : "Créer mon espace"}</Link>
              <Link href="/tarifs" className="btn-secondary px-6 py-3 text-base">Voir les tarifs</Link>
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
        </div>
        </section>

        {/* Points forts : bento immersif */}
        <section className="px-4 py-12 sm:px-6" aria-labelledby="forts">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-stone-950 px-5 py-16 text-white sm:px-10">
            <div className={cx("fx-drift absolute -left-20 -top-24 h-96 w-96 rounded-full bg-gradient-to-br opacity-50 blur-3xl", f.gradient)} aria-hidden />
            <div className={cx("fx-drift absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-gradient-to-br opacity-35 blur-3xl", f.gradient)} style={{ "--d": "-8s" } as React.CSSProperties} aria-hidden />
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:26px_26px]" aria-hidden />
            <div className="relative text-center">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80">{f.icon} {f.name}</span>
              <h2 id="forts" className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Ce que tu peux faire</h2>
            </div>
            <InView>
              <div className="relative mt-12 grid gap-4 md:grid-cols-6">
                {f.highlights.map((h, i, all) => {
                  const sp = spans(all.length);
                  const filled = i % 3 === 0;
                  return (
                    <div key={h.title} className={cx("fx-in group relative overflow-hidden rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-1", SPAN_CLASS[sp[i]], filled ? cx("bg-gradient-to-br shadow-lift", f.gradient) : "border border-white/10 bg-white/[0.06] backdrop-blur hover:bg-white/10")} style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}>
                      <span className="pointer-events-none absolute -right-2 -top-6 select-none text-[7rem] font-black leading-none text-white/[0.07]">{i + 1}</span>
                      <span className={cx("fx-float relative flex h-14 w-14 items-center justify-center rounded-2xl text-3xl", filled ? "bg-white/20" : "bg-white/10")} style={{ "--d": `${i * 0.5}s`, "--a": "5px" } as React.CSSProperties}>{h.icon}</span>
                      <h3 className="relative mt-5 text-lg font-bold">{h.title}</h3>
                      <p className={cx("relative mt-2 text-sm leading-relaxed", filled ? "text-white/85" : "text-stone-300")}>{h.text}</p>
                    </div>
                  );
                })}
              </div>
            </InView>
          </div>
        </section>

        {/* Étapes */}
        <section className={cx("relative overflow-hidden", t.band)} aria-labelledby="etapes">
          <Ambience tone={t.tone} emojis={[t.emojis[0], t.emojis[1]]} />
          <div className="relative mx-auto max-w-5xl px-6 py-20">
            <h2 id="etapes" className="text-center text-3xl font-bold tracking-tight sm:text-4xl">En pratique</h2>
            <div className="mt-12"><StepsRail steps={f.steps} /></div>
          </div>
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
            <h2 className="text-lg font-bold text-stone-900">Articles liés</h2>
            <DragScroller className="mt-4">
              {guides.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} draggable={false} className="shrink-0 min-w-[16rem] max-w-xs flex-1 rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <p className="text-xs font-semibold text-brand-700">{g.category}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-stone-900">{g.h1}</p>
                </Link>
              ))}
            </DragScroller>
          </section>
        )}

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <CtaBanner title={`Essaie ${f.name.toLowerCase()} dans All In`} text="Un seul espace pour organiser ton temps, tes repas et ton argent, seul ou à deux." secondary={{ href: "/tarifs", label: "Voir les tarifs" }} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
