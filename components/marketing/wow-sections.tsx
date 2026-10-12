"use client";

import { useEffect, useRef, useState } from "react";
import { useDesktop } from "@/components/marketing/use-desktop";
import { AnimatedLogo, type LogoSection } from "@/components/animated-logo";
import { cx } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  1. « Toutes les applis, au même endroit » : les applis convergent  */
/* ------------------------------------------------------------------ */

export interface ConvergeChip { icon: string; name: string; replaces: string; group: LogoSection }

const GROUP_COLOR: Record<LogoSection, string> = { planning: "167,139,250", recettes: "251,146,60", budget: "99,102,241" };
const ORDER: LogoSection[] = ["planning", "recettes", "budget"];

/** Position (en % de la scène) de chaque pastille : trois à gauche, trois à droite. */
const SLOTS = [
  { x: 17, y: 14 }, { x: 11, y: 50 }, { x: 17, y: 86 },
  { x: 83, y: 14 }, { x: 89, y: 50 }, { x: 83, y: 86 },
];

export function ConvergeStage({ chips, children }: { chips: ConvergeChip[]; children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [cur, setCur] = useState<LogoSection>("planning");

  const [inView, setInView] = useState(false);

  // La scène se déclenche quand elle entre dans l'écran, puis on suit si elle est encore visible (pour mettre l'animation en pause quand on la quitte).
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      if (e.isIntersecting && e.intersectionRatio >= 0.25) setOn(true);
    }, { threshold: [0, 0.25] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Le logo du centre passe d'une section à l'autre ; les pastilles de la section active s'allument.
  // Rien ne tourne quand la scène est hors de l'écran ou que l'onglet est masqué (avant : minuteur et re-rendus permanents).
  useEffect(() => {
    if (!on || !inView) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return; // téléphone : logo fixe (chaque rotation re-rendait toute la scène)
    const t = setInterval(() => { if (!document.hidden) setCur((c) => ORDER[(ORDER.indexOf(c) + 1) % ORDER.length]); }, 2800);
    return () => clearInterval(t);
  }, [on, inView]);

  const spot = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const rgb = GROUP_COLOR[cur];

  return (
    <div
      ref={panel}
      onMouseMove={spot}
      className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#0a0720] px-6 py-12 text-white shadow-[0_40px_120px_-30px_rgba(76,29,149,0.7)] sm:py-14 lg:px-12 lg:py-14"
      style={{ "--mx": "50%", "--my": "40%" } as React.CSSProperties}
    >
      {/* fond : aurore, grille et halo qui suit le curseur */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 -top-24 h-[34rem] w-[34rem] rounded-full glow from-violet-600/50 to-transparent" />
        <div className="absolute -bottom-32 -right-16 h-[36rem] w-[36rem] rounded-full glow from-orange-500/35 to-transparent" />
        <div className="absolute left-1/3 top-1/2 h-[26rem] w-[26rem] rounded-full glow from-sky-500/30 to-transparent" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_55%,#000_20%,transparent_100%)]" />
        <div className="absolute inset-0 [background:radial-gradient(520px_circle_at_var(--mx)_var(--my),rgba(167,139,250,0.22),transparent_60%)]" />
      </div>

      <div className="relative">{children}</div>

      {/* Grand écran : la scène */}
      <div className="relative mx-auto mt-8 hidden aspect-[1000/340] w-full max-w-[62rem] lg:block">
        <svg viewBox="0 0 1000 340" className="absolute inset-0 h-full w-full" aria-hidden fill="none">
          <defs>
            <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0.05" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {SLOTS.map((s, i) => {
            const left = s.x < 50;
            const x0 = (s.x / 100) * 1000 + (left ? 136 : -136);
            const y0 = (s.y / 100) * 340;
            const x1 = left ? 440 : 560;
            const lit = chips[i]?.group === cur;
            const d = `M${x0} ${y0} C ${left ? x0 + 120 : x0 - 120} ${y0}, ${left ? x1 - 90 : x1 + 90} 170, ${x1} 170`;
            return (
              <g key={i} style={{ opacity: on ? 1 : 0, transition: `opacity 700ms ${900 + i * 90}ms` }}>
                <path d={d} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <circle r={lit ? 4 : 2.5} fill={lit ? `rgb(${rgb})` : "#fff"} style={{ filter: `drop-shadow(0 0 5px ${lit ? `rgb(${rgb})` : "#fff"})` }}>
                  <animateMotion dur={`${2.2 + (i % 3) * 0.5}s`} begin={`${i * 0.35}s`} repeatCount="indefinite" path={d} />
                </circle>
                <path d={d} stroke={lit ? `rgb(${rgb})` : "url(#beam)"} strokeWidth={lit ? 2.5 : 1.5} strokeLinecap="round" strokeDasharray="6 14" className="converge-flow" style={{ transition: "stroke 500ms, stroke-width 500ms", filter: lit ? `drop-shadow(0 0 6px rgb(${rgb}))` : undefined, animationDirection: left ? "normal" : "reverse" }} />
              </g>
            );
          })}
        </svg>

        {/* le logo, au centre, qui respire */}
        <div className="absolute left-1/2 top-1/2" style={{ opacity: on ? 1 : 0, transform: `translate(-50%,-50%) scale(${on ? 1 : 0.4})`, transition: "opacity 700ms 300ms, transform 900ms 300ms cubic-bezier(0.34,1.4,0.5,1)" }}>
          {[0, 1, 2].map((k) => (
            <span key={k} className="converge-ring absolute left-1/2 top-1/2 h-44 w-44 rounded-full border" style={{ borderColor: `rgba(${rgb},0.55)`, animationDelay: `${k * 1.1}s`, transition: "border-color 600ms" }} aria-hidden />
          ))}
          <span className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-700" style={{ backgroundImage: `radial-gradient(closest-side, rgba(${rgb},0.4), rgba(${rgb},0))` }} aria-hidden />
          <AnimatedLogo section={cur} className="relative h-44 w-44 drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)]" />
        </div>

        {chips.map((c, i) => {
          const s = SLOTS[i];
          const lit = c.group === cur;
          const dx = (s.x - 50) * 14;
          const dy = (s.y - 50) * 9;
          return (
            <div
              key={c.name}
              className="absolute w-[17rem]"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                opacity: on ? 1 : 0,
                transform: on ? "translate(-50%,-50%)" : `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.35) rotate(${s.x < 50 ? -12 : 12}deg)`,
                filter: on ? "none" : "blur(6px)",
                transition: `opacity 600ms ${i * 110}ms, transform 1000ms ${i * 110}ms cubic-bezier(0.34,1.35,0.5,1), filter 700ms ${i * 110}ms`,
              }}
            >
              {on && <span className="converge-land pointer-events-none absolute inset-0 rounded-2xl border" style={{ borderColor: `rgba(${GROUP_COLOR[c.group]},0.9)`, animationDelay: `${i * 110 + 800}ms` }} aria-hidden />}
              <div className="converge-float" style={{ animationDelay: `${i * 0.7}s` }}>
                <div
                  className="flex items-center gap-3 rounded-2xl border bg-white/[0.07] px-4 py-3 lg:backdrop-blur-md transition duration-500"
                  style={{ borderColor: lit ? `rgba(${GROUP_COLOR[c.group]},0.8)` : "rgba(255,255,255,0.14)", boxShadow: lit ? `0 0 0 1px rgba(${GROUP_COLOR[c.group]},0.35), 0 12px 50px -8px rgba(${GROUP_COLOR[c.group]},0.7)` : "0 8px 30px -12px rgba(0,0,0,0.6)", transform: lit ? "scale(1.06)" : "scale(1)" }}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">{c.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold leading-tight text-white">{c.name}</span>
                    <span className="block text-xs leading-snug text-white/55">{c.replaces}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Petits écrans : le logo puis les pastilles */}
      <div className="relative mt-10 lg:hidden">
        <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
          <span className="absolute -inset-8 rounded-full transition-colors duration-700" style={{ backgroundImage: `radial-gradient(closest-side, rgba(${rgb},0.45), rgba(${rgb},0))` }} aria-hidden />
          <AnimatedLogo section={cur} className="relative h-36 w-36" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {chips.map((c, i) => (
            <div key={c.name} className="conv-item rounded-2xl border border-white/15 bg-white/[0.07] p-3.5 transition duration-500 lg:backdrop-blur-md" style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(24px) scale(.95)", transition: `opacity 600ms ${i * 90}ms, transform 800ms ${i * 90}ms cubic-bezier(0.34,1.3,0.5,1)`, borderColor: c.group === cur ? `rgba(${GROUP_COLOR[c.group]},0.8)` : undefined }}>
              <span className="text-2xl">{c.icon}</span>
              <span className="mt-2 block text-sm font-bold">{c.name}</span>
              <span className="block text-[11px] leading-snug text-white/55">{c.replaces}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2. « Tout ton quotidien » : un chemin qui se dessine au défilement */
/* ------------------------------------------------------------------ */

export interface TimelineStep { key: "week" | "meals" | "shop" | "budget" | "track" | "notes"; title: string; text: string; step: string; tone: string; glow: string }
export interface TimelineLabels {
  days: string[]; meals: string[]; items: string[]; shopBudget: string; remaining: string; noteTitle: string;
}

/** Points par lesquels passent le chemin (repère 1200 × 1150) : les trois premières étapes descendent en escalier vers la droite, puis le chemin fait demi-tour et les trois suivantes descendent vers la gauche. */
const W: [number, number][] = [
  [30, 60], [150, 90], [350, 120], [560, 200], [770, 250], [970, 310], [1100, 370], [1150, 470], [1110, 560], [1040, 610],
  [970, 650], [770, 700], [560, 760], [350, 810], [150, 870], [30, 910],
];
const NODES = [1, 3, 5, 10, 12, 14];

/** Courbe de Catmull-Rom qui passe exactement par chaque point. */
function smooth(pts: [number, number][]) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}
const PATH_D = smooth(W);
const CUM = W.reduce<number[]>((acc, p, i) => { acc.push(i === 0 ? 0 : acc[i - 1] + Math.hypot(p[0] - W[i - 1][0], p[1] - W[i - 1][1])); return acc; }, []);
/** Part du chemin parcourue quand chaque étape est atteinte. */
const NODE_P = NODES.map((n) => CUM[n] / CUM[CUM.length - 1]);
/** Sur mobile, les cartes sont empilées : les étapes se répartissent à intervalles réguliers. */
const NODE_P_MOBILE = [0.08, 0.26, 0.44, 0.62, 0.8, 0.95];

function useCount(on: boolean, to: number, ms = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on) { setV(0); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, to, ms]);
  return v;
}

/** Les petites maquettes vivantes, une par étape : elles s'animent quand le chemin atteint l'étape. */
function Mini({ k, on, l }: { k: TimelineStep["key"]; on: boolean; l: TimelineLabels }) {
  const budget = useCount(on && k === "budget", 64);
  const left = useCount(on && k === "track", 642);
  const pop = (i: number, extra = ""): React.CSSProperties => ({ transition: `opacity 500ms ${250 + i * 110}ms, transform 700ms ${250 + i * 110}ms cubic-bezier(0.34,1.4,0.5,1)${extra}`, opacity: on ? 1 : 0, transform: on ? "none" : "translateY(-12px) scale(0.8)" });
  if (k === "week") {
    const cols: { h: number; c: string }[][] = [[{ h: 22, c: "bg-violet-400/30 text-violet-800" }, { h: 12, c: "bg-emerald-400/30" }], [{ h: 34, c: "bg-amber-400/35" }], [{ h: 12, c: "bg-emerald-400/30" }, { h: 26, c: "bg-sky-400/35" }], [{ h: 24, c: "bg-violet-400/30" }], [{ h: 12, c: "bg-emerald-400/30" }, { h: 20, c: "bg-rose-400/35" }]];
    return (
      <div className="grid grid-cols-5 gap-1.5 text-[10px] text-stone-400">
        {l.days.map((d) => <span key={d} className="text-center">{d}</span>)}
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((b, bi) => <span key={bi} className={cx("block rounded-md", b.c)} style={{ height: b.h, ...pop(ci + bi) }} />)}
          </div>
        ))}
      </div>
    );
  }
  if (k === "meals")
    return (
      <div className="space-y-1.5">
        {[["🍗", l.meals[0]], ["🍝", l.meals[1]], ["🌶️", l.meals[2]]].map(([e, n], i) => (
          <div key={n} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-1.5" style={pop(i)}>
            <span className="text-lg">{e}</span><span className="truncate text-xs font-semibold text-stone-700">{n}</span>
          </div>
        ))}
      </div>
    );
  if (k === "shop")
    return (
      <ul className="space-y-1.5">
        {l.items.map((n, i) => (
          <li key={n} className="flex items-center gap-2.5 text-xs font-medium text-stone-700">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 text-[9px] font-bold text-white" style={{ transition: `background-color 300ms ${600 + i * 330}ms, border-color 300ms ${600 + i * 330}ms`, backgroundColor: on ? "#10b981" : "transparent", borderColor: on ? "#10b981" : "#d6d3d1" }}>{on ? "✓" : ""}</span>
            <span style={{ transition: `color 300ms ${600 + i * 330}ms`, color: on ? "#a8a29e" : undefined }}>{n}</span>
          </li>
        ))}
      </ul>
    );
  if (k === "budget")
    return (
      <div>
        <p className="text-[11px] text-stone-500">{l.shopBudget}</p>
        <p className="tabular text-2xl font-extrabold text-stone-900">{budget} €</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600" style={{ width: on ? "64%" : "0%", transition: "width 1400ms 300ms cubic-bezier(0.22,1,0.36,1)" }} /></div>
      </div>
    );
  if (k === "track")
    return (
      <div>
        <p className="text-[11px] text-stone-500">{l.remaining}</p>
        <p className="tabular text-2xl font-extrabold text-stone-900">{left} €</p>
        <svg viewBox="0 0 200 40" className="mt-1 h-9 w-full" fill="none" aria-hidden>
          <path d="M2 30 C30 28 40 10 70 14 S110 34 140 18 S180 6 198 4" stroke="url(#spark)" strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={on ? 0 : 1} style={{ transition: "stroke-dashoffset 1600ms 300ms cubic-bezier(0.22,1,0.36,1)" }} />
          <defs><linearGradient id="spark" x1="0" x2="1"><stop offset="0" stopColor="#d946ef" /><stop offset="1" stopColor="#7c3aed" /></linearGradient></defs>
        </svg>
      </div>
    );
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center gap-2 text-xs font-bold text-stone-800"><span style={pop(0)}>📌</span>{l.noteTitle}</div>
      <div className="mt-2.5 space-y-1.5">
        {[88, 100, 62].map((w, i) => <div key={i} className="h-1.5 rounded-full bg-stone-200" style={{ width: on ? `${w}%` : "0%", transition: `width 700ms ${400 + i * 380}ms cubic-bezier(0.22,1,0.36,1)` }} />)}
      </div>
    </div>
  );
}

const NODE_ICON: Record<TimelineStep["key"], React.ReactNode> = {
  week: <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
  meals: <><path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10" /><path d="M17 21V3c-2.2 1.2-3.5 3.7-3.5 7v2.5H17" /></>,
  shop: <><path d="M3 4h2.2l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.1L19.5 8H6.2" /><circle cx="9.5" cy="19.5" r="1.3" /><circle cx="16.5" cy="19.5" r="1.3" /></>,
  budget: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v14H6.5A2.5 2.5 0 0 1 4 16.5z" /><path d="M18 9h2v6h-2a3 3 0 0 1 0-6z" /></>,
  track: <><path d="M4 20V4M4 20h16" /><path d="M8 15l3.5-4 3 2.5L19 7" /></>,
  notes: <><path d="M6 3.5h9l3.5 3.5v13.5H6z" /><path d="M14.5 3.5V7.5h4M9 12h6M9 16h6" /></>,
};

function NodeDot({ s, on, size = 56 }: { s: TimelineStep; on: boolean; size?: number }) {
  return (
    <span className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {on && <span className="timeline-ping absolute inset-0 rounded-full" style={{ background: s.glow }} aria-hidden />}
      <span className={cx("relative flex h-full w-full items-center justify-center rounded-full border-4 border-surface text-white shadow-lift transition-all duration-700", on ? "scale-100" : "scale-90 bg-stone-300")} style={on ? { backgroundImage: `linear-gradient(135deg, ${s.tone})` } : undefined}>
        <svg viewBox="0 0 24 24" className="h-[46%] w-[46%]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{NODE_ICON[s.key]}</svg>
      </span>
    </span>
  );
}

function Card({ s, on, l, i }: { s: TimelineStep; on: boolean; l: TimelineLabels; i: number }) {
  return (
    <div className={cx("rounded-3xl border bg-surface p-4 shadow-soft transition-all duration-700 lg:will-change-transform", on ? "border-line opacity-100 shadow-lift" : "translate-y-5 scale-95 border-transparent opacity-30 blur-[1.5px]")} style={on ? { boxShadow: `0 24px 60px -24px ${s.glow}` } : undefined}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{s.step} {i + 1}</p>
      <h3 className="mt-0.5 text-[15px] font-bold leading-snug text-stone-900">{s.title}</h3>
      <p className="mt-1 text-[12.5px] leading-relaxed text-stone-500">{s.text}</p>
      <div className="mt-3 min-h-[5.5rem] rounded-2xl bg-stone-50/80 p-3"><Mini k={s.key} on={on} l={l} /></div>
    </div>
  );
}

export function TimelinePath({ steps, labels }: { steps: TimelineStep[]; labels: TimelineLabels }) {
  const wrap = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const prog = useRef<SVGPathElement>(null);
  const comet = useRef<SVGGElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const desktop = useDesktop();

  useEffect(() => {
    const root = wrap.current;
    if (!root || !desktop) return; // téléphone / tablette : étapes toutes affichées, aucune mesure au défilement
    let raf = 0;
    let cur = 0;
    let target = 0;
    let visible = false;
    let len = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const measure = () => {
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      target = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
    };
    const apply = () => {
      const p = path.current, g = prog.current, c = comet.current;
      if (p && g && c) {
        if (!len) len = p.getTotalLength();
        g.style.strokeDashoffset = String(1 - cur);
        const pt = p.getPointAtLength(cur * len);
        c.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
        c.style.opacity = cur > 0.005 && cur < 0.995 ? "1" : "0";
      }
      if (bar.current) bar.current.style.transform = `scaleY(${cur})`;
      const thr = window.innerWidth >= 1024 ? NODE_P : NODE_P_MOBILE;
      const n = thr.filter((np) => cur >= np - 0.015).length;
      setCount((old) => (old === n ? old : n));
    };
    // Une image à la fois, et seulement tant que la frise bouge : à l'arrêt, plus aucun calcul (avant : boucle permanente dès l'ouverture de la page).
    const step = () => {
      raf = 0;
      measure();
      cur += (target - cur) * (reduce ? 1 : 0.09);
      if (Math.abs(target - cur) < 0.0004) cur = target;
      apply();
      if (cur !== target) raf = requestAnimationFrame(step);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
    const onMove = () => { if (visible) kick(); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: "150px 0px" });
    io.observe(root);
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    kick();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [desktop]);

  const posOf = (n: number) => ({ left: `${(W[n][0] / 1200) * 100}%`, top: `${(W[n][1] / 1150) * 100}%` });
  return (
    <div ref={wrap}>
      {/* Grand écran : le chemin sinueux */}
      <div className="relative mx-auto hidden aspect-[1200/1150] w-full max-w-6xl lg:block">
        {desktop && (<>
        <svg viewBox="0 0 1200 1150" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden fill="none">
          <defs>
            <linearGradient id="trail" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7c3aed" />
              <stop offset="0.35" stopColor="#f59e0b" />
              <stop offset="0.65" stopColor="#0ea5e9" />
              <stop offset="1" stopColor="#d946ef" />
            </linearGradient>
          </defs>
          <path ref={path} d={PATH_D} stroke="rgba(120,113,108,0.22)" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
          <path ref={prog} d={PATH_D} pathLength="1" stroke="url(#trail)" strokeWidth="7" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" style={{ filter: "drop-shadow(0 4px 14px rgba(124,58,237,0.45))" }} />
          <g ref={comet} style={{ opacity: 0 }}>
            <circle r="26" fill="rgba(124,58,237,0.22)" className="timeline-ping" />
            <circle r="11" fill="#fff" stroke="#7c3aed" strokeWidth="4" />
          </g>
        </svg>
        {NODES.map((n, i) => (
          <div key={steps[i].key}>
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={posOf(n)}><NodeDot s={steps[i]} on={count > i} /></div>
            <div className="absolute w-[17rem] -translate-x-1/2" style={{ left: posOf(n).left, top: `calc(${posOf(n).top} + 2.6rem)` }}><Card s={steps[i]} on={count > i} l={labels} i={i} /></div>
          </div>
        ))}
      </>)}
      </div>

      {/* Petits écrans : une ligne verticale qui se remplit */}
      <div className="relative mx-auto max-w-md pl-14 lg:hidden">
        <span className="absolute bottom-6 left-[1.65rem] top-6 w-1 rounded-full bg-stone-200" aria-hidden />
        <div ref={bar} className="absolute bottom-6 left-[1.65rem] top-6 w-1 origin-top rounded-full bg-gradient-to-b from-violet-500 via-amber-400 to-fuchsia-500" style={{ transform: "scaleY(1)" }} aria-hidden />
        <ol className="space-y-6">
          {steps.map((s, i) => (
            <li key={s.key} className="relative">
              <span className="absolute -left-14 top-3"><NodeDot s={s} on={!desktop || count > i} size={48} /></span>
              <Card s={s} on={!desktop || count > i} l={labels} i={i} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
