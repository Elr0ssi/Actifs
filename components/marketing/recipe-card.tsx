import Link from "next/link";
import type { MarketingRecipe } from "@/lib/marketing/recipes";

/** Zone photo (vide pour l'instant, prête pour un vrai PNG) + badge d'ingrédient qui déborde dessus. */
export function RecipeCard({ recipe, size = "normal" }: { recipe: MarketingRecipe; size?: "normal" | "small" }) {
  const photoHeight = size === "small" ? "h-24" : "h-36";
  return (
    <Link href={`/recettes/${recipe.slug}`} className="card group block h-full p-0 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <div className={`overflow-hidden rounded-t-2xl ${photoHeight} bg-stone-100`}>
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-stone-300">Photo à venir</div>
          )}
        </div>
        <span className="absolute -bottom-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-white text-lg shadow-md">
          {recipe.icon}
        </span>
      </div>
      <div className={size === "small" ? "p-3 pt-4" : "p-5 pt-6"}>
        {size === "normal" && (
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">{recipe.category}</span>
            <span className="text-xs text-stone-400">{recipe.tag}</span>
          </div>
        )}
        <h3 className={size === "small" ? "text-sm font-semibold text-stone-900 group-hover:text-brand-700" : "mt-2.5 font-semibold text-stone-900 group-hover:text-brand-700"}>
          {recipe.name}
        </h3>
        {size === "normal" && <p className="mt-1 text-sm text-stone-500">{recipe.desc}</p>}
      </div>
    </Link>
  );
}
