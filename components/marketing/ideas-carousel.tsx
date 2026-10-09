"use client";

import { useRef, useState } from "react";
import Link from "@/components/marketing/link";

/** Textes déjà traduits côté serveur (le navigateur n'a pas le dictionnaire complet du site). */
export interface IdeaItem { slug: string; icon: string; label: string; count: string }

/** Carrousel d'idées de recettes : défile à la main ou avec les flèches, chaque carte mène à une page d'idées. */
export function IdeasCarousel({ items, prev, next }: { items: IdeaItem[]; prev: string; next: string }) {
  const row = useRef<HTMLUListElement>(null);
  // Glisser à la souris : on attrape le carrousel et on tire ; un vrai glissement n'ouvre pas la carte sous le curseur.
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const [grabbing, setGrabbing] = useState(false);
  const onDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !row.current) return;
    drag.current = { down: true, x: e.clientX, left: row.current.scrollLeft, moved: false };
  };
  const onMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d.down || !row.current) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) { d.moved = true; setGrabbing(true); }
    if (d.moved) row.current.scrollLeft = d.left - dx;
  };
  const onUp = () => {
    drag.current.down = false;
    setGrabbing(false);
  };
  const scroll = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * Math.max(240, (row.current.clientWidth || 600) * 0.8), behavior: "smooth" });
  const arrow = "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-lg text-stone-700 transition hover:border-brand-300 hover:text-brand-700";
  return (
    <div>
      <div className="mb-2 hidden justify-end gap-2 md:flex">
        <button type="button" onClick={() => scroll(-1)} aria-label={prev} className={arrow}>‹</button>
        <button type="button" onClick={() => scroll(1)} aria-label={next} className={arrow}>›</button>
      </div>
      <ul
        ref={row}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } }}
        className={`no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-3 pt-1 select-none ${grabbing ? "cursor-grabbing" : "cursor-grab snap-x snap-mandatory scroll-smooth"}`}
      >
        {items.map((i) => (
          <li key={i.slug} className="snap-start">
            <Link draggable={false} href={`/recettes/idees/${i.slug}`} className="group flex h-full w-44 flex-col rounded-3xl border border-line bg-surface p-4 shadow-soft transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
              <span className="text-3xl transition group-hover:scale-110">{i.icon}</span>
              <span className="mt-3 text-sm font-bold leading-snug text-stone-900 group-hover:text-brand-700">{i.label}</span>
              <span className="mt-auto pt-3 text-xs text-stone-500">{i.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
