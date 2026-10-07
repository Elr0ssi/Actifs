"use client";

import { useEffect } from "react";

const INTERACTIVE = "a, button, input, textarea, select, label, summary, video, audio, iframe, [role='button'], [role='link'], [role='menuitem'], [role='tab'], [contenteditable='true'], [draggable='true'], [data-no-ripple]";

/** Au clic dans une zone « vide » (hors liens, boutons et champs), de petits ronds s'étendent comme une onde dans l'eau. */
export function ClickRipple() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden";
    document.body.appendChild(layer);

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const t = e.target as Element | null;
      if (!t || t.closest(INTERACTIVE)) return;
      if (getComputedStyle(t).cursor === "pointer") return;
      for (let i = 0; i < 3; i++) {
        const ring = document.createElement("span");
        ring.className = "click-ripple";
        ring.style.left = `${e.clientX}px`;
        ring.style.top = `${e.clientY}px`;
        ring.style.animationDelay = `${i * 80}ms`;
        layer.appendChild(ring);
        setTimeout(() => ring.remove(), 1000 + i * 80);
      }
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onDown);
      layer.remove();
    };
  }, []);
  return null;
}
