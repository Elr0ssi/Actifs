"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/app/icons";
import { RECIPES } from "@/lib/marketing/recipes";
import { setAppearance } from "@/app/app/settings/actions";
import { logout } from "@/app/(auth)/actions";
import { cx } from "@/lib/utils";
import type { ThemeMode } from "@/lib/theme";

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  group: "Actions" | "Aller à" | "Recettes";
  icon: IconName;
  keywords?: string;
  run: () => void;
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Recherche et raccourcis globaux : Ctrl/Cmd + K depuis n'importe quelle page de l'app. */
export function CommandPalette({ mode }: { mode: ThemeMode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [, start] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("allin:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("allin:palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
    }
  }, [open]);

  const go = (href: string) => () => router.push(href);
  const commands: Cmd[] = useMemo(
    () => [
      { id: "a-task", group: "Actions", label: "Nouvelle tâche", hint: "Ajout rapide", icon: "plus", keywords: "ajouter creer todo", run: () => window.dispatchEvent(new Event("allin:quickadd")) },
      { id: "a-list", group: "Actions", label: "Nouvelle liste de courses", icon: "cart", keywords: "creer courses", run: go("/app/lists/mes-listes") },
      { id: "a-op", group: "Actions", label: "Nouvelle opération", hint: "Finance", icon: "wallet", keywords: "depense revenu charge", run: go("/app/finance/operations") },
      { id: "a-word", group: "Actions", label: "Ajouter un mot de vocabulaire", icon: "book", keywords: "notes", run: go("/app/notes/vocabulaire") },
      {
        id: "a-theme",
        group: "Actions",
        label: mode === "dark" ? "Passer en mode clair" : "Passer en mode sombre",
        icon: mode === "dark" ? "sun" : "moon",
        keywords: "theme apparence nuit",
        run: () => start(() => setAppearance(mode === "dark" ? "light" : "dark", null)),
      },
      { id: "a-out", group: "Actions", label: "Se déconnecter", icon: "logout", run: () => start(() => logout()) },
      { id: "n-home", group: "Aller à", label: "Tableau de bord", icon: "home", run: go("/app") },
      { id: "n-tasks", group: "Aller à", label: "Tâches & projets", icon: "tasks", run: go("/app/tasks/list") },
      { id: "n-routines", group: "Aller à", label: "Routines", icon: "repeat", run: go("/app/tasks/routines") },
      { id: "n-cal", group: "Aller à", label: "Calendrier des tâches", icon: "calendar", run: go("/app/tasks/calendar") },
      { id: "n-lists", group: "Aller à", label: "Listes de courses", icon: "cart", run: go("/app/lists/mes-listes") },
      { id: "n-recipes", group: "Aller à", label: "Mes recettes", hint: "Trouver des recettes", icon: "chef", keywords: "cuisine", run: go("/app/lists/recipes") },
      { id: "n-ingr", group: "Aller à", label: "Ingrédients & prix", icon: "list", run: go("/app/lists/ingredients") },
      { id: "n-fin", group: "Aller à", label: "Finance — vue d'ensemble", icon: "wallet", run: go("/app/finance") },
      { id: "n-fincal", group: "Aller à", label: "Finance — calendrier", icon: "calendar", run: go("/app/finance/calendar") },
      { id: "n-budgets", group: "Aller à", label: "Finance — budgets", icon: "pie", run: go("/app/finance/budgets") },
      { id: "n-ops", group: "Aller à", label: "Finance — opérations", icon: "list", run: go("/app/finance/operations") },
      { id: "n-acc", group: "Aller à", label: "Finance — comptes", icon: "bank", run: go("/app/finance/accounts") },
      { id: "n-tax", group: "Aller à", label: "Finance — impôts", icon: "chart", run: go("/app/finance/taxes") },
      { id: "n-notes", group: "Aller à", label: "Notes & vocabulaire", icon: "notes", run: go("/app/notes") },
      { id: "n-set", group: "Aller à", label: "Paramètres & apparence", icon: "settings", keywords: "theme couleur profil", run: go("/app/settings") },
      ...RECIPES.map<Cmd>((r) => ({ id: `r-${r.slug}`, group: "Recettes", label: r.name, hint: `${r.category} · ${r.time}`, icon: "chef", keywords: r.ingredients.join(" "), run: () => window.open(`/recettes/${r.slug}`, "_blank") })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode]
  );

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return commands.filter((c) => c.group !== "Recettes");
    const words = q.split(/\s+/);
    return commands
      .filter((c) => {
        const hay = norm(`${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`);
        return words.every((w) => hay.includes(w));
      })
      .sort((a, b) => Number(norm(b.label).startsWith(q)) - Number(norm(a.label).startsWith(q)))
      .slice(0, 30);
  }, [commands, query]);

  useEffect(() => setIndex(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const run = (c: Cmd | undefined) => {
    if (!c) return;
    setOpen(false);
    c.run();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[index]);
    }
  };

  if (!open) return null;
  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[70] flex animate-fade items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Recherche" onClick={(e) => e.stopPropagation()} className="w-full max-w-[620px] animate-modal overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Icon name="search" className="h-[18px] w-[18px] text-stone-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Chercher une page, une action, une recette…"
            className="flex-1 bg-transparent text-[15px] text-stone-900 outline-none placeholder:text-stone-400"
          />
          <kbd className="rounded-md border border-line bg-stone-50 px-1.5 py-0.5 font-sans text-[10px] text-stone-400">Échap</kbd>
        </div>
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-stone-400">Aucun résultat pour « {query} »</p>}
          {results.map((c, i) => {
            const header = c.group !== lastGroup;
            lastGroup = c.group;
            return (
              <div key={c.id}>
                {header && <p className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">{c.group}</p>}
                <button
                  type="button"
                  data-idx={i}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => run(c)}
                  className={cx("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors", i === index ? "bg-brand-500/12 text-brand-800" : "text-stone-700")}
                >
                  <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", i === index ? "bg-brand-500 text-white" : "bg-stone-100 text-stone-500")}>
                    <Icon name={c.icon} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{c.label}</span>
                  {c.hint && <span className="shrink-0 text-[11px] text-stone-400">{c.hint}</span>}
                  {i === index && <span className="shrink-0 text-[10px] text-stone-400">↵</span>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[11px] text-stone-400">
          <span>↑ ↓ pour naviguer · ↵ pour ouvrir</span>
          <span className="hidden items-center gap-1 sm:flex"><Icon name="sparkle" className="h-3 w-3" />Astuce : tape une recette ou un ingrédient</span>
        </div>
      </div>
    </div>
  );
}
