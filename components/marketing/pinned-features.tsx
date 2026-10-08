"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/marketing/link";
import { cx } from "@/lib/utils";

export interface PinnedFeature { slug: string; name: string; icon: string; text: string; soon: boolean; badge: string; soft: string; gradient: string }
export interface PinnedGroup { key: string; href: string; name: string; icon: string; tagline: string; gradient: string; see: string; cta: string; mock: React.ReactNode; features: PinnedFeature[] }

/**
 * Section « figée » : on fait défiler la page, la section reste en place et les rectangles
 * (mêmes cartes que sur /fonctionnalites) se retournent pour laisser la place à ceux de la
 * catégorie suivante (Agenda → Repas → Finances). Sous lg : simple liste, sans animation.
 */
export function PinnedFeatures({ groups, eyebrow, title, accent, all }: { groups: PinnedGroup[]; eyebrow: string; title: string; accent: string; all: string }) {
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const n = groups.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = runway.current;
      const st = stage.current;
      if (!el || !st) return;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - st.offsetHeight);
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
    const st = stage.current;
    if (!el || !st) return;
    const span = el.offsetHeight - st.offsetHeight;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + ((i + 0.5) / n) * span, behavior: "smooth" });
  };

  const heading = (
    <>
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</p>
      <h2 id="features-title" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{accent}</span></h2>
    </>
  );

  return (
    <section id="fonctionnalites" aria-labelledby="features-title" className="relative">
      {/* Petits écrans : liste classique */}
      <div className="mx-auto max-w-6xl px-6 py-16 lg:hidden">
        <div className="text-center">{heading}</div>
        <div className="mt-10 space-y-6">
          {groups.map((g) => <Band key={g.key} g={g} />)}
          <p className="text-center"><Link href="/fonctionnalites" className="btn-secondary px-5 py-2.5">{all}</Link></p>
        </div>
      </div>

      {/* Grand écran : section figée */}
      <div ref={runway} className="hidden lg:block" style={{ height: `calc(100vh + ${n * 70}vh)` }}>
        <div ref={stage} className="sticky top-0 flex h-screen min-h-[40rem] flex-col justify-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-brand-50/50 to-transparent" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl px-6">
            <div className="flex items-end justify-between gap-6">
              <div>{heading}</div>
              <div className="flex items-center gap-2" role="tablist">
                {groups.map((g, i) => (
                  <button key={g.key} type="button" role="tab" aria-selected={i === phase} onClick={() => goTo(i)} className={cx("flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-500", i === phase ? "border-brand-200 bg-surface text-stone-900 shadow-soft" : "border-transparent text-stone-500 hover:text-stone-800")}>
                    <span>{g.icon}</span>{g.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid [&>*]:col-start-1 [&>*]:row-start-1" style={{ perspective: "1600px" }}>
              {groups.map((g, gi) => {
                const state = gi === phase ? "in" : gi < phase ? "out" : "wait";
                return (
                  <div key={g.key} aria-hidden={state !== "in"} className={cx("transition-opacity duration-500", state === "in" ? "opacity-100" : "pointer-events-none opacity-0")}>
                    <Band g={g} animate state={state} />
                  </div>
                );
              })}
            </div>

            <p className="mt-6 flex items-center justify-between text-sm">
              <span className="flex gap-2" aria-hidden>
                {groups.map((g, i) => <span key={g.key} className={cx("h-1.5 rounded-full transition-all duration-500", i === phase ? "w-8 bg-brand-500" : "w-2 bg-stone-300")} />)}
              </span>
              <Link href="/fonctionnalites" className="font-semibold text-stone-600 hover:text-brand-700">{all}</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Une bande = la grande carte de l'univers + ses cartes de fonctionnalités (même design que /fonctionnalites). */
function Band({ g, animate, state = "in" }: { g: PinnedGroup; animate?: boolean; state?: "in" | "out" | "wait" }) {
  const focus = state === "in" ? 0 : -1;
  const motion = (i: number, side: "left" | "right"): React.CSSProperties => {
    if (!animate) return {};
    return {
      transitionDelay: state === "in" ? `${i * 120}ms` : "0ms",
      transform: state === "in" ? "none" : state === "out" ? "rotateY(-80deg) scale(.9)" : `translateX(${side === "left" ? "-110px" : "110px"}) scale(.95)`,
      transformOrigin: "left center",
    };
  };
  const wrap = cx(animate && "transition-all duration-700 ease-out will-change-transform", animate && (state === "in" ? "opacity-100" : "opacity-0"));
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <div className={wrap} style={motion(0, "left")}>
        <Link href={g.href} tabIndex={focus} className={cx("group relative block h-full min-h-[16rem] overflow-hidden rounded-[2rem] bg-gradient-to-br p-7 text-white", g.gradient)}>
          <span className="text-4xl">{g.icon}</span>
          <h3 className="mt-3 text-3xl font-bold tracking-tight">{g.name}</h3>
          <p className="mt-2 max-w-xs text-white/85">{g.tagline}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">{g.see} <span className="transition group-hover:translate-x-1">→</span></span>
          <div className="pointer-events-none absolute -bottom-10 -right-10 hidden w-[58%] rotate-[-5deg] opacity-90 transition duration-500 group-hover:rotate-0 sm:block">{g.mock}</div>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {g.features.map((f, i) => (
          <div key={f.slug} className={cx(wrap, g.features.length === 3 && i === 2 && "sm:col-span-2")} style={motion(i + 1, i === 2 ? "left" : "right")}>
            <Link href={`/fonctionnalites/${f.slug}`} tabIndex={focus} className="group relative block h-full overflow-hidden rounded-[2rem] border border-line bg-surface p-6 transition hover:-translate-y-1 hover:shadow-lift">
              <span className={cx("flex h-12 w-12 items-center justify-center rounded-2xl text-2xl", f.soft)}>{f.icon}</span>
              <h3 className="mt-4 flex items-center gap-2 text-xl font-bold text-stone-900">
                {f.name}
                {f.soon && <span className="rounded-full bg-indigo-100 px-2 py-px text-[10px] font-bold uppercase text-indigo-700">{f.badge}</span>}
              </h3>
              <p className="mt-1 text-sm text-stone-600">{f.text}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-600">{g.cta} <span className="inline-block transition group-hover:translate-x-1">→</span></span>
              <span className={cx("pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition group-hover:opacity-40", f.gradient)} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
