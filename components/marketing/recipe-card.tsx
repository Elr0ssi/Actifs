"use client";

import { useT } from "@/components/i18n/provider";
import Link from "@/components/marketing/link";
import type { MarketingRecipe } from "@/lib/marketing/recipes";

/** Zone photo (vide pour l'instant, prête pour un vrai PNG) + badge d'ingrédient qui déborde dessus. */
export function RecipeCard({ recipe, size = "normal" }: { recipe: MarketingRecipe; size?: "normal" | "small" }) {
  const tr = useT();
  return (
    <Link href={`/recettes/${recipe.slug}`} className="card group block h-full p-0 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <div className="aspect-video overflow-hidden rounded-t-2xl bg-stone-100">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.image} alt={tr(recipe.name)} loading="lazy" decoding="async" width={640} height={360} className="h-full w-full object-cover" />
          ) : (
            <div className={`relative flex h-full items-center justify-center bg-gradient-to-br ${recipe.gradient}`}>
              <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/30 blur-2xl" />
              <span className="text-5xl drop-shadow-sm transition duration-300 group-hover:scale-110 group-hover:-rotate-6">{tr(recipe.icon)}</span>
            </div>
          )}
        </div>
        <span className="absolute -bottom-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-surface text-lg shadow-md">
          {tr(recipe.icon)}
        </span>
      </div>
      <div className={size === "small" ? "p-3 pt-4" : "p-5 pt-6"}>
        {size === "normal" && (
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">{tr(recipe.category)}</span>
            <span className="text-xs text-stone-500">{tr(recipe.tag)}</span>
          </div>
        )}
        <h3 className={size === "small" ? "text-sm font-semibold text-stone-900 group-hover:text-brand-700" : "mt-2.5 font-semibold text-stone-900 group-hover:text-brand-700"}>
          {tr(recipe.name)}
        </h3>
        {size === "normal" && <p className="mt-1 text-sm text-stone-500">{tr(recipe.desc)}</p>}
      </div>
    </Link>
  );
}
