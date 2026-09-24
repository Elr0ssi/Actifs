"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateListFromRecipe } from "@/app/app/lists/recipes/actions";

export function GenerateListButton({ recipeId, recipeName }: { recipeId: string; recipeName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const listId = await generateListFromRecipe(recipeId, recipeName);
          if (listId) router.push(`/app/lists/${listId}`);
        })
      }
      className="btn-primary py-2 text-xs"
    >
      {isPending ? "Génération…" : "Créer la liste de courses"}
    </button>
  );
}
