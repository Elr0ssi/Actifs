"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/marketing/link";
import { cx } from "@/lib/utils";

export interface PinnedFeature { slug: string; name: string; icon: string; text: string; soon: boolean; badge: string }
export interface PinnedGroup { key: string; href: string; name: string; icon: string; tagline: string; gradient: string; soft: string; features: PinnedFeature[]; cta: string }

/**
 * Section « figée » : on fait défiler la page, la section reste en place et ses cartes
 * se retournent pour laisser la place à celles de la catégorie suivante (Agenda → Repas → Finances).
 * Sur mobile, simple liste par catégorie.
 */
export function PinnedFeatures({ groups, eyebrow, title, accent, all }: { groups: PinnedGroup[]; eyebrow: string; title: string; accent: string; all: string }) {
  const runway = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const n = groups.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = runway.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(0.999, Math.max(0, -r.top / span));
      setPhase(Math.floor(p * n));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [n]);

  const goTo = (i: number) => {
    const el = runway.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + ((i + 0.5) / n) * span, behavior: "smooth" });
  };

  const spans = (count: number, i: number) => (count === 3 ? (i === 0 ? "col-span-2" : "col-span-1") : "col-span-1");

  return (
    <section id="fonctionnalites" aria-labelledby="features-title" className="relative">
      {/* Mobile : liste classique */}
      <div className="mx-auto max-w-6xl px-6 py-16 md:hidden">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</p>
        <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight">{title} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{accent}</span></h2>
        <div className="mt-10 space-y-10">
          {groups.map((g) => (
            <div key={g.key}>
              <Link href={g.href} className="flex items-center gap-3">
                <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-lg text-white shadow-soft", g.gradient)}>{g.icon}</span>
                <span><span className="block text-lg font-bold text-stone-900">{g.name}</span><span className="block text-xs text-stone-500">{g.tagline}</span></span>
              </Link>
              <div className="mt-4 space-y-3">
                {g.features.map((f) => <FeatureCard key={f.slug} f={f} soft={g.soft} cta={g.cta} />)}
              </div>
            </div>
          ))}
          <p className="text-center"><Link href="/fonctionnalites" className="btn-secondary px-5 py-2.5">{all}</Link></p>
        </div>
      </div>

      {/* Bureau : section figée */}
      <div ref={runway} className="hidden md:block" style={{ height: `${100 + n * 75}vh` }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-brand-50/60 to-transparent" aria-hidden />
          <div className="relative mx-auto grid w-full max-w-6xl grid-cols-[0.85fr_1.15fr] items-center gap-12 px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</p>
              <h2 id="features-title" className="mt-3 text-4xl font-extrabold leading-tight tracking-tight">{title} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{accent}</span></h2>
              <ul className="mt-8 space-y-2">
                {groups.map((g, i) => (
                  <li key={g.key}>
                    <button type="button" onClick={() => goTo(i)} aria-current={i === phase} className={cx("flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-500", i === phase ? "border-brand-200 bg-surface shadow-soft" : "border-transparent opacity-50 hover:opacity-80")}>
                      <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg text-white", g.gradient)}>{g.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-stone-900">{g.name}</span>
                        <span className={cx("block overflow-hidden text-xs text-stone-500 transition-all duration-500", i === phase ? "max-h-10 opacity-100" : "max-h-0 opacity-0")}>{g.tagline}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-center gap-4 text-sm">
                <Link href={groups[phase].href} className="font-semibold text-brand-700 hover:underline">{groups[phase].cta} {groups[phase].name} →</Link>
                <Link href="/fonctionnalites" className="text-stone-500 hover:text-stone-800">{all}</Link>
              </p>
            </div>

            <div className="relative h-[26rem]" style={{ perspective: "1400px" }}>
              {groups.map((g, gi) => (
                <div key={g.key} className={cx("absolute inset-0 grid auto-rows-fr gap-4", g.features.length >= 3 ? "grid-cols-2" : "grid-cols-1 content-center")} aria-hidden={gi !== phase}>
                  {g.features.map((f, i) => {
                    const state = gi === phase ? "in" : gi < phase ? "out" : "wait";
                    const fromLeft = i % 3 === 2;
                    return (
                      <div
                        key={f.slug}
                        className={cx("transition-all duration-700 ease-out will-change-transform", spans(g.features.length, i), state === "in" ? "opacity-100" : "pointer-events-none opacity-0")}
                        style={{
                          transitionDelay: state === "in" ? `${i * 130}ms` : "0ms",
                          transform: state === "in" ? "none" : state === "out" ? "rotateY(-80deg) scale(.92)" : `translateX(${fromLeft ? "-90px" : "90px"}) scale(.95)`,
                          transformOrigin: "left center",
                        }}
                      >
                        <FeatureCard f={f} soft={g.soft} cta={g.cta} tabIndex={state === "in" ? 0 : -1} tall />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
            {groups.map((g, i) => <span key={g.key} className={cx("h-1.5 rounded-full transition-all duration-500", i === phase ? "w-8 bg-brand-500" : "w-2 bg-stone-300")} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ f, soft, cta, tabIndex, tall }: { f: PinnedFeature; soft: string; cta: string; tabIndex?: number; tall?: boolean }) {
  return (
    <Link href={`/fonctionnalites/${f.slug}`} tabIndex={tabIndex} className={cx("group flex h-full flex-col rounded-3xl border border-line bg-surface p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift", tall && "justify-between")}>
      <div>
        <span className={cx("flex h-11 w-11 items-center justify-center rounded-2xl text-xl", soft)}>{f.icon}</span>
        <h3 className="mt-3 flex flex-wrap items-center gap-2 text-base font-bold leading-snug text-stone-900">{f.name}{f.soon && <span className="rounded-full bg-indigo-100 px-1.5 py-px text-[9px] font-bold uppercase text-indigo-700">{f.badge}</span>}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-stone-500">{f.text}</p>
      </div>
      <p className="mt-3 text-xs font-semibold text-brand-700 transition group-hover:translate-x-1">{cta} →</p>
    </Link>
  );
}
