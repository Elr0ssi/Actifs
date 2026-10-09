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
const R = 104; // rayon d'orbite des bulles : elles se chevauchent, c'est la découpe qui les garde sans contact
const SMALL = 0.97;
const BIG = 1.05;
const GAP = 30; // épaisseur (x2) du vide qui sépare deux bulles
const EASE = "cubic-bezier(0.34, 1.22, 0.5, 1)"; // ressort doux : un léger dépassement, jamais linéaire
const ICON = 1.2; // taille des icônes : toujours la même

/**
 * Position de repos de chaque bulle (angle d'écran, 90° = bas). Chaque bulle est une goutte arrondie dont la pointe vise le centre.
 * `cutBy` : la bulle voisine qui s'emboîte dans celle-ci (elle la « creuse » en laissant un vide régulier) ; le sens est fixe pour que les formes restent continues.
 */
const BUBBLES: { id: LogoSection; at: number; from: string; to: string; cutBy: LogoSection }[] = [
  { id: "planning", at: 90, from: "#C5A7F4", to: "#8A62EA", cutBy: "recettes" },
  { id: "budget", at: 210, from: "#5A36F0", to: "#9086F7", cutBy: "planning" },
  { id: "recettes", at: 330, from: "#E88F90", to: "#F3A887", cutBy: "budget" },
];
/** Direction de la pointe : vers le centre. */
const tipOf = (at: number) => at + 180;

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

// Goutte de rayon 94 (+6 de contour arrondi), pointe courte vers +x.
const tipPath = "M108 0 C98 -8 88 -28 75 -56.6 A94 94 0 1 0 75 56.6 C88 28 98 8 108 0 Z";

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

  /** Chaque bulle a son propre rythme : la nouvelle bulle active part la première, les autres suivent. Les formes se déforment donc au passage. */
  const timing = (id: LogoSection) => {
    const lead = id === state.section;
    const i = BUBBLES.findIndex((b) => b.id === id);
    return `transform ${lead ? 600 : 660 + i * 40}ms ${EASE} ${lead ? 0 : 50 + i * 30}ms`;
  };
  const orbit = (id: LogoSection, children: React.ReactNode) => (
    <g className="logo-move" style={{ transition: timing(id), transformOrigin: `${C.x}px ${C.y}px`, transform: `rotate(${state.turn}deg)` }}>{children}</g>
  );
  const at = (id: LogoSection) => {
    const b = BUBBLES.find((x) => x.id === id)!;
    const rad = (b.at * Math.PI) / 180;
    return { b, x: C.x + R * Math.cos(rad), y: C.y + R * Math.sin(rad) };
  };
  /** Corps de la bulle : positionné sur son orbite, avec son échelle et la légère déformation de mouvement. */
  const body = (id: LogoSection, children: React.ReactNode) => {
    const { b, x, y } = at(id);
    const active = id === state.section;
    return orbit(
      id,
      <g transform={`translate(${x} ${y})`}>
        <g className="logo-move" style={{ transition: timing(id), transform: `scale(${active ? BIG : SMALL})` }}>
          <g transform={`rotate(${tipOf(b.at)})`}>
            <g className={beat > 0 ? "logo-squish" : undefined} key={beat} style={{ animationDelay: active ? "0ms" : "80ms" }}>{children}</g>
          </g>
        </g>
      </g>
    );
  };
  /** Icône : suit l'orbite mais reste droite et garde toujours la même taille, quelle que soit la bulle. */
  const icon = (id: LogoSection) => {
    const { b, x, y } = at(id);
    const tip = (tipOf(b.at) * Math.PI) / 180;
    return orbit(
      id,
      <g transform={`translate(${x} ${y})`}>
        <g className="logo-move" style={{ transition: timing(id), transform: `rotate(${-state.turn}deg)` }}>
          <g transform={`translate(${-8 * Math.cos(tip)} ${-8 * Math.sin(tip)}) scale(${ICON})`}><Icon id={id} tint={TINT[id]} /></g>
        </g>
      </g>
    );
  };

  return (
    <svg viewBox="5 34 390 390" className={cx("logo-svg h-10 w-10 shrink-0 overflow-visible", className)} role="img" aria-label="Flozea" focusable="false">
      <defs>
        {BUBBLES.map((b) => (
          <linearGradient key={b.id} id={`${uid}-${b.id}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={b.from} />
            <stop offset="1" stopColor={b.to} />
          </linearGradient>
        ))}
        {/* Une bulle est creusée par sa voisine, qui s'y emboîte avec un vide régulier : elles se fondent l'une dans l'autre sans se toucher */}
        {BUBBLES.map((b) => (
          <mask key={b.id} id={`${uid}-m-${b.id}`} maskUnits="userSpaceOnUse" x="-200" y="-200" width="800" height="900">
            <rect x="-200" y="-200" width="800" height="900" fill="#fff" />
            {body(b.cutBy, <path d={tipPath} fill="#000" stroke="#000" strokeWidth={GAP} strokeLinejoin="round" />)}
          </mask>
        ))}
      </defs>
      {BUBBLES.map((b) => {
        const fill = `url(#${uid}-${b.id})`;
        return (
          <g key={b.id} mask={`url(#${uid}-m-${b.id})`}>
            {body(b.id, <path d={tipPath} fill={fill} stroke={fill} strokeWidth="12" strokeLinejoin="round" />)}
          </g>
        );
      })}
      {/* Les icônes passent au-dessus de toutes les bulles : une bulle qui glisse ne les recouvre jamais */}
      {BUBBLES.map((b) => <g key={b.id}>{icon(b.id)}</g>)}
    </svg>
  );
}
