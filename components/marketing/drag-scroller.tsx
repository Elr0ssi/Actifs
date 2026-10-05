"use client";

import { useRef, useState } from "react";
import { cx } from "@/lib/utils";

/** Carrousel horizontal : se fait glisser à la souris (clic maintenu) et au trackpad ou au doigt (défilement natif). */
export function DragScroller({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  return (
    <div
      ref={ref}
      className={cx("flex gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]", dragging ? "cursor-grabbing select-none" : "cursor-grab", className)}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        drag.current = { active: true, startX: e.clientX, startLeft: ref.current.scrollLeft, moved: false };
        setDragging(true);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.active || !ref.current) return;
        const dx = e.clientX - d.startX;
        if (Math.abs(dx) > 5) d.moved = true;
        ref.current.scrollLeft = d.startLeft - dx;
      }}
      onPointerUp={() => { drag.current.active = false; setDragging(false); }}
      onPointerLeave={() => { drag.current.active = false; setDragging(false); }}
      onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } }}
      onDragStart={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
