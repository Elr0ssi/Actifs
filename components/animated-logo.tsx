"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { splitLocalePath } from "@/lib/i18n";
import { cx } from "@/lib/utils";

/**
 * Logo Flozea : trois ronds (Budget, Recettes, Planning).
 * Un seul composant : la section active devient le plus gros rond, en bas ; les deux autres passent en haut à gauche et à droite.
 * Les ronds changent de place par un petit mouvement orbital, avec un « blop » élastique et un léger décalage entre eux.
 */
export type LogoSection = "budget" | "recettes" | "planning";

const C = { x: 200, y: 190 }; // centre du moulinet
const R = 86; // rayon d'orbite des bulles
const SMALL = 65; // rayon des deux bulles du haut
const BIG = 75; // rayon de la bulle active, en bas
const ICON = 0.9; // taille des icônes : toujours la même
const EASE = "cubic-bezier(0.34, 1.3, 0.5, 1)"; // ressort doux : un léger rebond, jamais linéaire

/** Position de repos de chaque bulle (angle d'écran, 90° = bas). */
const BUBBLES: { id: LogoSection; at: number; from: string; to: string }[] = [
  { id: "planning", at: 90, from: "#C5A7F4", to: "#8A62EA" },
  { id: "budget", at: 210, from: "#5A36F0", to: "#9086F7" },
  { id: "recettes", at: 330, from: "#E88F90", to: "#F3A887" },
];

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

/** Détails creusés dans l'icône (couleur de la bulle, à cet endroit). */
const TINT: Record<LogoSection, string> = { planning: "#9B78EE", budget: "#7664F5", recettes: "#EE9C8B" };

/** Icône blanche dessinée dans un repère centré, ~90 unités de large. */
function Icon({ id }: { id: LogoSection }) {
  if (id === "budget")
    return (
      <g fill="#fff" stroke={TINT.budget} strokeWidth="5" strokeLinejoin="round">
        {[-30, -4, 22].map((y) => (
          <path key={y} d={`M-36 ${y} v12 a36 15 0 0 0 72 0 v-12 a36 15 0 0 0 -72 0z`} />
        ))}
      </g>
    );
  if (id === "recettes")
    return (
      <g fill="#fff">
        {[-44, -32, -20].map((x) => <rect key={x} x={x} y="-50" width="9" height="34" rx="4.5" />)}
        <rect x="-44" y="-30" width="33" height="26" rx="12" />
        <rect x="-36" y="-8" width="17" height="58" rx="8.5" />
        <ellipse cx="27" cy="-22" rx="17" ry="26" />
        <rect x="18.5" y="-2" width="17" height="52" rx="8.5" />
      </g>
    );
  return (
    <g>
      <rect x="-38" y="-34" width="76" height="78" rx="14" fill="none" stroke="#fff" strokeWidth="10" />
      <rect x="-22" y="-52" width="10" height="24" rx="5" fill="#fff" />
      <rect x="12" y="-52" width="10" height="24" rx="5" fill="#fff" />
      {[[-14, -6], [14, -6], [-14, 20], [14, 20]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="8" fill="#fff" />)}
    </g>
  );
}

// Les en-têtes du site sont recréés à chaque page : on garde ici l'état précédent pour que la transition continue d'une page à l'autre.
let lastSection: LogoSection | null = null;
let lastTurn = 0;

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

  /** Chaque rond a son propre rythme : le nouveau rond actif part le premier, les autres suivent. */
  const timing = (id: LogoSection) => {
    const lead = id === state.section;
    const i = BUBBLES.findIndex((b) => b.id === id);
    return `transform ${lead ? 560 : 620 + i * 40}ms ${EASE} ${lead ? 0 : 40 + i * 30}ms`;
  };

  return (
    <svg viewBox="54 70 292 292" className={cx("logo-svg h-11 w-11 -my-0.5 shrink-0 overflow-visible", className)} role="img" aria-label="Flozea" focusable="false">
      <defs>
        {BUBBLES.map((b) => (
          <linearGradient key={b.id} id={`${uid}-${b.id}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={b.from} />
            <stop offset="1" stopColor={b.to} />
          </linearGradient>
        ))}
      </defs>
      {BUBBLES.map((b) => {
        const rad = (b.at * Math.PI) / 180;
        const x = C.x + R * Math.cos(rad);
        const y = C.y + R * Math.sin(rad);
        const active = b.id === state.section;
        return (
          <g key={b.id} className="logo-move" style={{ transition: timing(b.id), transformOrigin: `${C.x}px ${C.y}px`, transform: `rotate(${state.turn}deg)` }}>
            <g transform={`translate(${x} ${y})`}>
              <g className={beat > 0 ? "logo-blop" : undefined} key={beat} style={{ animationDelay: active ? "0ms" : `${60 + BUBBLES.findIndex((o) => o.id === b.id) * 30}ms` }}>
                <g className="logo-move" style={{ transition: timing(b.id), transform: `scale(${active ? BIG / SMALL : 1})` }}>
                  <circle r={SMALL} fill={`url(#${uid}-${b.id})`} />
                </g>
              </g>
            </g>
          </g>
        );
      })}
      {/* Les icônes passent au-dessus des ronds, restent droites et gardent toujours la même taille */}
      {BUBBLES.map((b) => {
        const rad = (b.at * Math.PI) / 180;
        const x = C.x + R * Math.cos(rad);
        const y = C.y + R * Math.sin(rad);
        return (
          <g key={b.id} className="logo-move" style={{ transition: timing(b.id), transformOrigin: `${C.x}px ${C.y}px`, transform: `rotate(${state.turn}deg)` }}>
            <g transform={`translate(${x} ${y})`}>
              <g className="logo-move" style={{ transition: timing(b.id), transform: `rotate(${-state.turn}deg)` }}>
                <g transform={`scale(${ICON})`}><Icon id={b.id} /></g>
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
