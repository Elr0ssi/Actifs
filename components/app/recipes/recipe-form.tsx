"use client";

import { useT } from "@/components/i18n/provider";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createRecipe, updateRecipe } from "@/app/app/lists/recipes/actions";
import type { Recipe, RecipeItem } from "@/lib/types";
import { IngredientPicker } from "@/components/app/recipes/ingredient-picker";
import type { CatalogIngredient, QtyUnit } from "@/lib/shopping";

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
  catalog,
  onDone,
}: {
  recipe?: Recipe & { recipe_items: RecipeItem[] };
  householdId: string;
  categories: string[];
  catalog: CatalogIngredient[];
  onDone?: () => void;
}) {
  const tr = useT();
  const [preview, setPreview] = useState<string | null>(recipe?.image_url ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [resetKey, setResetKey] = useState(0);
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
        setResetKey((k) => k + 1);
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
      <label className="group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 text-center text-xs text-stone-400 hover:border-brand-300">
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
            className="absolute right-1.5 top-1.5 hidden rounded-full bg-surface/90 px-2 py-0.5 text-[11px] text-stone-600 shadow group-hover:block"
          >
            {tr("Retirer")}</button>
        )}
      </label>

      <div className="space-y-3">
        <input
          name="name"
          defaultValue={recipe?.name}
          placeholder={tr("Nom de la recette (ex. Poulet basquaise)")}
          className="input py-3 text-lg font-semibold"
          required
        />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <select name="category" defaultValue={recipe?.category ?? "Rapide"} className="input">
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs text-stone-500">
            Pour
            <input name="servings" type="number" min={1} max={50} defaultValue={recipe?.servings ?? 2} className="w-12 bg-transparent text-center text-sm font-semibold text-stone-800 outline-none" aria-label={tr("Nombre de personnes")} />
            pers.
          </label>
        </div>
        <div>
          <p className="label mb-1.5">{tr("Ingrédients")}</p>
          <IngredientPicker
            key={resetKey}
            name="ingredients"
            catalog={catalog}
            initial={
              recipe?.recipe_items.map((i) => ({
                id: i.ingredient_id,
                name: i.label,
                qty: i.qty ?? null,
                qtyUnit: (i.qty_unit ?? "u") as QtyUnit,
              })) ?? []
            }
          />
        </div>
        <div>
          <p className="label mb-1.5">{tr("Étapes & notes")}</p>
          <textarea
            name="notes"
            defaultValue={recipe?.notes ?? ""}
            key={`n${resetKey}`}
            rows={5}
            placeholder={"- Préchauffer le four à 180 °C\n- Faire revenir l'oignon…\nUne ligne par étape."}
            className="input min-h-[7rem] resize-y leading-relaxed"
            onKeyDown={(e) => {
              if (e.key !== "Enter" || e.shiftKey) return;
              const el = e.currentTarget;
              const before = el.value.slice(0, el.selectionStart);
              const line = before.slice(before.lastIndexOf("\n") + 1);
              if (!/^\s*[-•*] /.test(line)) return;
              e.preventDefault();
              if (/^\s*[-•*] $/.test(line)) {
                // ligne vide avec juste une puce : on quitte la liste
                el.setRangeText("", el.selectionStart - line.length, el.selectionStart, "end");
                return;
              }
              el.setRangeText("\n- ", el.selectionStart, el.selectionEnd, "end");
            }}
          />
          <button type="button" className="mt-1 text-xs text-brand-600 hover:underline" onClick={(e) => { const t = e.currentTarget.previousElementSibling as HTMLTextAreaElement; if (!t.value.trim()) t.value = "- "; t.focus(); t.setSelectionRange(t.value.length, t.value.length); }}>{tr("+ Commencer une liste à puces")}</button>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex gap-2">
          <button disabled={pending} className="btn-primary">{pending ? "Enregistrement…" : recipe ? "Enregistrer" : "Créer la recette"}</button>
          {onDone && recipe && <button type="button" onClick={onDone} className="btn-secondary">{tr("Annuler")}</button>}
        </div>
      </div>
    </form>
  );
}
