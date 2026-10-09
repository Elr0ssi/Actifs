"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { splitLocalePath } from "@/lib/i18n";
import { cx } from "@/lib/utils";

/**
 * Logo Flozea : trois bulles (Budget, Recettes, Planning) disposées en moulinet.
 * Un seul composant : la section active devient la grosse bulle du bas, les deux autres passent en haut à gauche et à droite.
 * Le changement est une vraie rotation du moulinet (±120°), avec une légère déformation de chaque bulle pendant le mouvement.
 */
export type LogoSection = "budget" | "recettes" | "planning";

const C = { x: 200, y: 190 }; // centre du moulinet
const R = 122; // rayon d'orbite des bulles
const SMALL = 0.94;
const BIG = 1.12;
const EASE = "cubic-bezier(0.34, 1.18, 0.5, 1)";
const MS = 560;

/** Position de repos de chaque bulle (angle d'écran, 90° = bas) et direction de sa pointe : chaque pointe vise la bulle suivante. */
const BUBBLES: { id: LogoSection; at: number; tip: number; from: string; to: string }[] = [
  { id: "planning", at: 90, tip: -120, from: "#C9ABF4", to: "#8A63EB" },
  { id: "budget", at: 210, tip: 0, from: "#5A34F0", to: "#9288F8" },
  { id: "recettes", at: 330, tip: 120, from: "#E58F90", to: "#F4AA89" },
];

/** Couleur des détails creusés dans les icônes (celle de la bulle, à cet endroit). */
const TINT: Record<LogoSection, string> = { planning: "#9B78EE", budget: "#7664F5", recettes: "#EE9C8B" };

/** Angle de rotation d'ensemble (degrés) qui amène chaque bulle en bas, modulo 360. */
const TURN: Record<LogoSection, number> = { planning: 0, recettes: 120, budget: 240 };

/** Rotation la plus courte vers la cible (toujours ±120° entre deux sections) à partir de l'angle courant. */
function nextTurn(current: number, section: LogoSection) {
  const base = TURN[section];
  const k = Math.round((current - base) / 360);
  return base + 360 * k;
}

/** Quelle section correspond à cette adresse ? `null` : on garde la section précédente. */
export function sectionOfPath(pathname: string): LogoSection | null {
  const { path } = splitLocalePath(pathname);
  if (path.startsWith("/app")) {
    if (path.startsWith("/app/finance")) return "budget";
    if (path.startsWith("/app/lists")) return "recettes";
    if (/^\/app\/(tasks|calendar|routines|notes)/.test(path)) return "planning";
    return null;
  }
  if (path === "/finances" || path.startsWith("/calculateurs") || /^\/fonctionnalites\/(budget-et-finances|paiements-automatiques|analyse-bancaire)/.test(path) || path.startsWith("/outils/budget-mensuel")) return "budget";
  if (path === "/repas" || path.startsWith("/recettes") || /^\/fonctionnalites\/(liste-de-courses|recettes-et-menu-de-la-semaine)/.test(path) || path.startsWith("/outils/liste-de-courses")) return "recettes";
  if (path === "/organisation" || /^\/fonctionnalites\/(agenda|taches-et-routines|notes)/.test(path) || path.startsWith("/outils/suivi-habitudes")) return "planning";
  return null;
}

// Les en-têtes du site sont recréés à chaque page : on garde ici l'état précédent pour que la transition continue d'une page à l'autre.
let lastSection: LogoSection | null = null;
let lastTurn = 0;

const tipPath = "M126 0 C104 -14 92 -40 80 -60 A100 100 0 1 0 80 60 C92 40 104 14 126 0 Z";

/** Icône blanche dessinée dans un repère centré, ~90 unités de large. */
function Icon({ id, tint }: { id: LogoSection; tint: string }) {
  if (id === "budget")
    return (
      <g fill="#fff" stroke={tint} strokeWidth="5" strokeLinejoin="round">
        {[-30, -4, 22].map((y) => (
          <path key={y} d={`M-36 ${y} v12 a36 15 0 0 0 72 0 v-12 a36 15 0 0 0 -72 0z`} />
        ))}
      </g>
    );
  if (id === "recettes")
    return (
      <g>
        <rect x="-44" y="-30" width="88" height="60" rx="14" fill="#fff" />
        <rect x="-44" y="-12" width="88" height="8" fill={tint} />
        <rect x="14" y="10" width="22" height="10" rx="5" fill={tint} />
      </g>
    );
  return (
    <g fill="#fff">
      <rect x="-42" y="6" width="20" height="40" rx="10" />
      <rect x="-10" y="-20" width="20" height="66" rx="10" />
      <rect x="22" y="-48" width="20" height="94" rx="10" />
    </g>
  );
}

export function AnimatedLogo({ section, className }: { section?: LogoSection; className?: string }) {
  const pathname = usePathname() || "/";
  const detected = sectionOfPath(pathname);
  const target: LogoSection = section ?? detected ?? lastSection ?? "planning";
  const uid = useId().replace(/:/g, "");

  const [state, setState] = useState<{ section: LogoSection; turn: number }>(() => ({ section: lastSection ?? target, turn: lastSection ? lastTurn : TURN[lastSection ?? target] }));
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const turn = nextTurn(state.turn, target);
    if (target === state.section && turn === state.turn) { lastSection = target; lastTurn = turn; return; }
    const raf = requestAnimationFrame(() => {
      setState({ section: target, turn });
      setBeat((b) => b + 1);
      lastSection = target;
      lastTurn = turn;
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const move = { transition: `transform ${MS}ms ${EASE}` } as const;
  return (
    <svg viewBox="0 28 400 400" className={cx("logo-svg h-10 w-10 shrink-0 overflow-visible", className)} role="img" aria-label="Flozea" focusable="false">
      <defs>
        {BUBBLES.map((b) => (
          <linearGradient key={b.id} id={`${uid}-${b.id}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={b.from} />
            <stop offset="1" stopColor={b.to} />
          </linearGradient>
        ))}
      </defs>
      <g className="logo-move" style={{ ...move, transformOrigin: `${C.x}px ${C.y}px`, transform: `rotate(${state.turn}deg)` }}>
        {BUBBLES.map((b) => {
          const active = b.id === state.section;
          const rad = (b.at * Math.PI) / 180;
          const x = C.x + R * Math.cos(rad);
          const y = C.y + R * Math.sin(rad);
          const iconShift = { x: -9 * Math.cos((b.tip * Math.PI) / 180), y: -9 * Math.sin((b.tip * Math.PI) / 180) };
          return (
            <g key={b.id} transform={`translate(${x} ${y})`}>
              <g className="logo-move" style={{ ...move, transform: `scale(${active ? BIG : SMALL})` }}>
                <g transform={`rotate(${b.tip})`}>
                  <g className={beat > 0 ? "logo-squish" : undefined} key={beat} style={{ animationDelay: active ? "0ms" : "70ms" }}>
                    <path d={tipPath} fill="rgb(var(--surface))" stroke="rgb(var(--surface))" strokeWidth="14" strokeLinejoin="round" />
                    <path d={tipPath} fill={`url(#${uid}-${b.id})`} stroke={`url(#${uid}-${b.id})`} strokeWidth="6" strokeLinejoin="round" />
                  </g>
                </g>
                {/* L'icône reste droite : elle tourne en sens inverse de l'ensemble */}
                <g className="logo-move" style={{ ...move, transform: `rotate(${-state.turn}deg)` }}>
                  <g transform={`translate(${iconShift.x} ${iconShift.y}) scale(1.04)`}><Icon id={b.id} tint={TINT[b.id]} /></g>
                </g>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
