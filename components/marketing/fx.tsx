"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";

/** Marque un bloc comme « visible » quand il entre dans l'écran : déclenche les animations .fx-in, .fx-slide, .fx-bar… à l'intérieur. */
export function InView({ children, className, once = true }: { children: React.ReactNode; className?: string; once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          if (once) io.disconnect();
        } else if (!once) setOn(false);
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  return (
    <div ref={ref} data-in={on} className={className}>
      {children}
    </div>
  );
}

/** Élément qui flotte doucement. `amp` = amplitude en px, `rot` = légère rotation en degrés. */
export function Float({ children, className, delay = 0, duration = 6, amp = 10, rot = 0 }: { children: React.ReactNode; className?: string; delay?: number; duration?: number; amp?: number; rot?: number }) {
  return (
    <div className={cx("fx-float", className)} style={{ "--d": `${delay}s`, "--t": `${duration}s`, "--a": `${amp}px`, "--r": `${rot}deg` } as React.CSSProperties}>
      {children}
    </div>
  );
}

/** Bulle « verre » avec icône, façon notification d'appli bancaire. */
export function Bubble({ icon, title, sub, tone = "violet", className }: { icon: string; title: string; sub?: string; tone?: "violet" | "green" | "amber" | "rose" | "sky"; className?: string }) {
  const tones = {
    violet: "from-brand-500/20 to-brand-500/5 text-brand-700",
    green: "from-emerald-500/20 to-emerald-500/5 text-emerald-700",
    amber: "from-amber-500/25 to-amber-500/5 text-amber-700",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-700",
    sky: "from-sky-500/20 to-sky-500/5 text-sky-700",
  } as const;
  return (
    <div className={cx("flex items-center gap-2.5 rounded-2xl border border-white/60 bg-surface/80 py-2 pl-2 pr-4 shadow-lift backdrop-blur-xl", className)}>
      <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg", tones[tone])}>{icon}</span>
      <span className="leading-tight">
        <span className="block text-[12px] font-semibold text-stone-900">{title}</span>
        {sub && <span className="block text-[10.5px] text-stone-500">{sub}</span>}
      </span>
    </div>
  );
}

/** Bandeau qui défile sans fin. */
export function Marquee({ items, reverse, speed = 40, className }: { items: React.ReactNode[]; reverse?: boolean; speed?: number; className?: string }) {
  return (
    <div className={cx("fx-marquee-wrap relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]", className)}>
      <div className="fx-marquee flex gap-3" style={{ "--t": `${speed}s`, animationDirection: reverse ? "reverse" : "normal" } as React.CSSProperties}>
        {[...items, ...items].map((it, i) => (
          <div key={i} className="shrink-0">{it}</div>
        ))}
      </div>
    </div>
  );
}

/** Fond de halos colorés qui dérivent lentement. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cx("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      <div className="fx-drift absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-brand-300/40 blur-[90px]" style={{ "--t": "22s" } as React.CSSProperties} />
      <div className="fx-drift absolute -right-20 top-10 h-[360px] w-[360px] rounded-full bg-sky-300/30 blur-[90px]" style={{ "--t": "26s", "--d": "-6s" } as React.CSSProperties} />
      <div className="fx-drift absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-emerald-300/25 blur-[90px]" style={{ "--t": "30s", "--d": "-12s" } as React.CSSProperties} />
    </div>
  );
}

/** Compteur animé quand il devient visible. */
export function Counter({ to, suffix = "", prefix = "", duration = 1400, className }: { to: number; suffix?: string; prefix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (reduce) return setV(to);
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref} className={className}>{prefix}{v.toLocaleString("fr-FR")}{suffix}</span>;
}
