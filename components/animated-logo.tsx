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
const R = 112; // rayon d'orbite des bulles
const SMALL = 0.9;
const BIG = 1.1;
const EASE = "cubic-bezier(0.34, 1.18, 0.5, 1)";
const MS = 560;

/**
 * Position de repos de chaque bulle (angle d'écran, 90° = bas) et direction de sa pointe : chaque pointe vise la bulle suivante.
 * `cuts` : la bulle dont la pointe vient mordre celle-ci (elle laisse un petit vide blanc autour de la pointe).
 */
const BUBBLES: { id: LogoSection; at: number; from: string; to: string; cuts: LogoSection }[] = [
  { id: "planning", at: 90, from: "#C5A7F4", to: "#8A62EA", cuts: "recettes" },
  { id: "budget", at: 210, from: "#5A36F0", to: "#9086F7", cuts: "planning" },
  { id: "recettes", at: 330, from: "#E88F90", to: "#F3A887", cuts: "budget" },
];
const tipOf = (at: number) => at + 110;

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

const tipPath = "M150 0 C122 -14 90 -48 66.7 -74.5 A100 100 0 1 0 66.7 74.5 C90 48 122 14 150 0 Z";

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
      <g fill="#fff">
        {/* fourchette */}
        {[-44, -32, -20].map((x) => <rect key={x} x={x} y="-50" width="9" height="34" rx="4.5" />)}
        <rect x="-44" y="-30" width="33" height="26" rx="12" />
        <rect x="-36" y="-8" width="17" height="58" rx="8.5" />
        {/* cuillère */}
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
  const pos = (id: LogoSection) => {
    const b = BUBBLES.find((x) => x.id === id)!;
    const rad = (b.at * Math.PI) / 180;
    return { b, x: C.x + R * Math.cos(rad), y: C.y + R * Math.sin(rad), active: id === state.section };
  };
  /** La forme d'une bulle (pointe vers +x, puis tournée vers sa direction de repos), avec la petite déformation de mouvement. */
  const shape = (id: LogoSection, children: React.ReactNode) => {
    const { b } = pos(id);
    return (
      <g transform={`rotate(${tipOf(b.at)})`}>
        <g className={beat > 0 ? "logo-squish" : undefined} key={beat} style={{ animationDelay: id === state.section ? "0ms" : "70ms" }}>{children}</g>
      </g>
    );
  };
  const placed = (id: LogoSection, children: React.ReactNode) => {
    const { x, y, active } = pos(id);
    return (
      <g transform={`translate(${x} ${y})`}>
        <g className="logo-move" style={{ ...move, transform: `scale(${active ? BIG : SMALL})` }}>{children}</g>
      </g>
    );
  };
  return (
    <svg viewBox="0 24 400 400" className={cx("logo-svg h-10 w-10 shrink-0 overflow-visible", className)} role="img" aria-label="Flozea" focusable="false">
      <defs>
        {BUBBLES.map((b) => (
          <linearGradient key={b.id} id={`${uid}-${b.id}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={b.from} />
            <stop offset="1" stopColor={b.to} />
          </linearGradient>
        ))}
        {/* Chaque bulle est découpée par la pointe de sa voisine : un petit vide autour d'elle, sans fond blanc (marche aussi en mode sombre) */}
        {BUBBLES.map((b) => (
          <mask key={b.id} id={`${uid}-m-${b.id}`} maskUnits="userSpaceOnUse" x="-200" y="-200" width="800" height="900">
            <rect x="-200" y="-200" width="800" height="900" fill="#fff" />
            {placed(b.cuts, shape(b.cuts, <path d={tipPath} fill="#000" stroke="#000" strokeWidth="16" strokeLinejoin="round" />))}
          </mask>
        ))}
      </defs>
      <g className="logo-move" style={{ ...move, transformOrigin: `${C.x}px ${C.y}px`, transform: `rotate(${state.turn}deg)` }}>
        {BUBBLES.map((b) => {
          const tip = tipOf(b.at);
          const iconShift = { x: -9 * Math.cos((tip * Math.PI) / 180), y: -9 * Math.sin((tip * Math.PI) / 180) };
          const fill = `url(#${uid}-${b.id})`;
          return (
            <g key={b.id} mask={`url(#${uid}-m-${b.id})`}>
              {placed(b.id, shape(b.id, <path d={tipPath} fill={fill} stroke={fill} strokeWidth="6" strokeLinejoin="round" />))}
              {placed(
                b.id,
                /* L'icône reste droite : elle tourne en sens inverse de l'ensemble */
                <g className="logo-move" style={{ ...move, transform: `rotate(${-state.turn}deg)` }}>
                  <g transform={`translate(${iconShift.x} ${iconShift.y}) scale(0.95)`}><Icon id={b.id} tint={TINT[b.id]} /></g>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
