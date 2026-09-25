"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createRecipe, updateRecipe } from "@/app/app/lists/recipes/actions";
import type { Recipe, RecipeItem } from "@/lib/types";

export const RECIPE_CATEGORIES = ["Rapide", "Healthy", "Gourmand", "Végétarien", "Petit-déjeuner", "Dessert", "Batch cooking", "Apéro", "Favoris"];

/** Downscales to max 1200px JPEG so uploads stay small and pages load fast. */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.82));
}

export function RecipeForm({
  recipe,
  householdId,
  categories,
  onDone,
}: {
  recipe?: Recipe & { recipe_items: RecipeItem[] };
  householdId: string;
  categories: string[];
  onDone?: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(recipe?.image_url ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const allCategories = [...new Set([...RECIPE_CATEGORIES, ...categories])];

  async function submit(fd: FormData) {
    setPending(true);
    setError(null);
    try {
      let imageUrl = recipe?.image_url ?? "";
      if (file) {
        const supabase = createClient();
        const path = `${householdId}/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage.from("recipe-images").upload(path, await compress(file), { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        imageUrl = supabase.storage.from("recipe-images").getPublicUrl(path).data.publicUrl;
      } else if (!preview) {
        imageUrl = "";
      }
      fd.set("image_url", imageUrl);
      if (recipe) await updateRecipe(recipe.id, fd);
      else await createRecipe(fd);
      if (!recipe) {
        formRef.current?.reset();
        setPreview(null);
        setFile(null);
      }
      onDone?.();
    } catch {
      setError("Impossible d'envoyer l'image, réessaie avec une autre photo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} action={submit} className="grid gap-4 sm:grid-cols-[160px_1fr]">
      <label className="group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400 hover:border-brand-300">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>📷<br />Ajouter une photo</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setFile(f);
            setPreview(URL.createObjectURL(f));
          }}
        />
        {preview && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setPreview(null);
              setFile(null);
            }}
            className="absolute right-1.5 top-1.5 hidden rounded-full bg-white/90 px-2 py-0.5 text-[11px] text-slate-600 shadow group-hover:block"
          >
            Retirer
          </button>
        )}
      </label>

      <div className="space-y-3">
        <input
          name="name"
          defaultValue={recipe?.name}
          placeholder="Nom de la recette (ex. Poulet basquaise)"
          className="input py-3 text-lg font-semibold"
          required
        />
        <select name="category" defaultValue={recipe?.category ?? "Rapide"} className="input">
          {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea
          name="items"
          rows={5}
          defaultValue={recipe?.recipe_items.map((i) => i.label).join("\n")}
          className="input"
          placeholder={"Ingrédients, un par ligne :\nPoulet\nPoivrons\nRiz"}
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex gap-2">
          <button disabled={pending} className="btn-primary">{pending ? "Enregistrement…" : recipe ? "Enregistrer" : "Créer la recette"}</button>
          {onDone && recipe && <button type="button" onClick={onDone} className="btn-secondary">Annuler</button>}
        </div>
      </div>
    </form>
  );
}
