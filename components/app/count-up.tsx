"use client";

import { useEffect, useRef, useState } from "react";

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const EUR0 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const INT = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Compte jusqu'à la valeur à l'affichage, puis à chaque changement. Sans animation si l'utilisateur la réduit. */
export function CountUp({ value, kind = "eur", duration = 900 }: { value: number; kind?: "eur" | "eur0" | "int"; duration?: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !Number.isFinite(value)) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const current = origin + (value - origin) * eased;
      setShown(current);
      from.current = current;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const fmt = kind === "int" ? INT : kind === "eur0" ? EUR0 : EUR;
  return <span className="tabular">{fmt.format(kind === "int" ? Math.round(shown) : shown)}</span>;
}
