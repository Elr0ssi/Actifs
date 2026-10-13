"use client";

import { useEffect, useRef } from "react";

/**
 * Apparition douce au défilement.
 *
 * Le contenu est TOUJOURS visible dans le HTML envoyé par le serveur : rien ne dépend de React pour s'afficher
 * (avant, tout restait à `opacity: 0` jusqu'à l'hydratation, ce qui retardait le titre de la page d'accueil de plusieurs secondes
 * sur mobile). Une fois la page interactive, seuls les blocs situés SOUS l'écran sont masqués puis révélés quand ils approchent.
 * Un seul IntersectionObserver est partagé par tous les blocs, et aucun état React n'est utilisé (pas de re-rendu).
 */
type Variant = "up" | "pop";
interface Entry { variant: Variant; delay: number }

let observer: IntersectionObserver | null = null;
const pending = new WeakMap<Element, Entry>();

function reveal(el: Element, { variant, delay }: Entry) {
  const node = el as HTMLElement;
  node.style.animationDelay = delay ? `${delay}ms` : "";
  node.classList.remove("fx-pre");
  node.classList.add(variant === "pop" ? "animate-popIn" : "animate-fadeUp");
}

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const entry = pending.get(e.target);
          observer?.unobserve(e.target);
          pending.delete(e.target);
          if (entry) reveal(e.target, entry);
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
  }
  return observer;
}

export function FadeIn({
  children,
  delay = 0,
  variant = "up",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: Variant;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Téléphone / tablette : tout reste affiché (voir globals.css) ; les apparitions au défilement sont réservées au grand écran.
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    // Déjà à l'écran (ou au-dessus) : on ne touche à rien, le contenu reste affiché.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.95) return;
    node.classList.add("fx-pre");
    pending.set(node, { variant, delay });
    getObserver().observe(node);
    return () => {
      pending.delete(node);
      observer?.unobserve(node);
      node.classList.remove("fx-pre");
    };
  }, [variant, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
