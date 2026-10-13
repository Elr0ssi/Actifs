/** Partage entre les membres d'un foyer : sections, niveaux, et lecture des réglages. */

export type ShareSection = "courses" | "tasks" | "finance" | "notes";
export type ShareLevel = "none" | "view" | "edit";

export const SHARE_SECTIONS: { id: ShareSection; label: string; hint: string; canEdit: boolean }[] = [
  { id: "courses", label: "Courses, recettes et menu", hint: "Listes de courses, recettes, menu de la semaine", canEdit: true },
  { id: "tasks", label: "Tâches, projets et routines", hint: "Tout, ou un projet précis depuis la page du projet", canEdit: true },
  { id: "finance", label: "Finance", hint: "Budget, opérations, comptes, impôts (lecture seule)", canEdit: false },
  { id: "notes", label: "Notes et vocabulaire", hint: "Tes pages de notes", canEdit: true },
];

export const SHARE_SECTION_IDS = SHARE_SECTIONS.map((s) => s.id);

export function isShareSection(v: unknown): v is ShareSection {
  return typeof v === "string" && (SHARE_SECTION_IDS as string[]).includes(v);
}

export function isShareLevel(v: unknown): v is ShareLevel {
  return v === "none" || v === "view" || v === "edit";
}

export type ShareRow = { owner_id: string; member_id: string; section: ShareSection; can_edit: boolean };

/** Niveau de partage d'une ligne `member_shares` (absente = rien). */
export function levelFromRow(row: Pick<ShareRow, "can_edit"> | undefined): ShareLevel {
  if (!row) return "none";
  return row.can_edit ? "edit" : "view";
}

/** Réglages par défaut (profiles.share_defaults, ex. {"courses":"edit"}) → un niveau par section. */
export function parseShareDefaults(raw: unknown): Record<ShareSection, ShareLevel> {
  const out = { courses: "none", tasks: "none", finance: "none", notes: "none" } as Record<ShareSection, ShareLevel>;
  if (raw && typeof raw === "object") {
    for (const s of SHARE_SECTION_IDS) {
      const v = (raw as Record<string, unknown>)[s];
      if (v === "view" || v === "edit") out[s] = s === "finance" && v === "edit" ? "view" : v;
    }
  }
  return out;
}

/** Cookie : de qui consulte-t-on la finance (soi-même par défaut). */
export const FINANCE_OWNER_COOKIE = "flozea-finance-owner";
