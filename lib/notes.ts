export type BlockType = "p" | "h1" | "h2" | "h3" | "todo" | "bullet" | "num" | "quote" | "callout" | "code" | "divider";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
}

export interface NoteMeta {
  id: string;
  parent_id: string | null;
  title: string;
  icon: string | null;
  pinned: boolean;
  updated_at: string;
  search: string;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export const emptyBlock = (type: BlockType = "p"): Block => ({ id: newId(), type, text: "" });

/** Texte brut de la note, utilisé pour la recherche. */
export function searchText(blocks: Block[]) {
  return blocks.map((b) => b.text).join(" ").replace(/[*_`~#>]/g, "").slice(0, 20000);
}

export function sanitizeBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];
  const types: BlockType[] = ["p", "h1", "h2", "h3", "todo", "bullet", "num", "quote", "callout", "code", "divider"];
  return raw.slice(0, 2000).map((b) => {
    const o = (b ?? {}) as Partial<Block>;
    return {
      id: typeof o.id === "string" && o.id ? o.id.slice(0, 24) : newId(),
      type: types.includes(o.type as BlockType) ? (o.type as BlockType) : "p",
      text: typeof o.text === "string" ? o.text.slice(0, 50000) : "",
      ...(o.type === "todo" ? { checked: !!o.checked } : {}),
    };
  });
}

export const BLOCK_MENU: { type: BlockType; label: string; hint: string; keys: string }[] = [
  { type: "p", label: "Texte", hint: "Un paragraphe simple", keys: "texte paragraphe" },
  { type: "h1", label: "Titre 1", hint: "# ", keys: "titre h1 heading" },
  { type: "h2", label: "Titre 2", hint: "## ", keys: "titre h2 heading" },
  { type: "h3", label: "Titre 3", hint: "### ", keys: "titre h3 heading" },
  { type: "todo", label: "À cocher", hint: "[] ", keys: "todo tache checkbox cocher" },
  { type: "bullet", label: "Liste à puces", hint: "- ", keys: "liste puces bullet" },
  { type: "num", label: "Liste numérotée", hint: "1. ", keys: "liste numerotee number" },
  { type: "quote", label: "Citation", hint: "> ", keys: "citation quote" },
  { type: "callout", label: "Encadré", hint: "!  ", keys: "encadre callout info" },
  { type: "code", label: "Code", hint: "```", keys: "code bloc" },
  { type: "divider", label: "Séparateur", hint: "---", keys: "separateur ligne divider" },
];

/** Raccourcis Markdown tapés en début de bloc : renvoie le nouveau type et le texte restant. */
export function markdownShortcut(text: string): { type: BlockType; text: string; checked?: boolean } | null {
  const m = /^(#{1,3}) ([\s\S]*)$/.exec(text);
  if (m) return { type: (`h${m[1].length}` as BlockType), text: m[2] };
  if (/^\[( |x)?\] /.test(text)) return { type: "todo", text: text.replace(/^\[( |x)?\] /, ""), checked: text.startsWith("[x]") };
  if (/^[-*+] /.test(text)) return { type: "bullet", text: text.slice(2) };
  if (/^\d+\. /.test(text)) return { type: "num", text: text.replace(/^\d+\. /, "") };
  if (text.startsWith("> ")) return { type: "quote", text: text.slice(2) };
  if (text.startsWith("! ")) return { type: "callout", text: text.slice(2) };
  if (text.startsWith("```")) return { type: "code", text: text.slice(3) };
  if (text === "---") return { type: "divider", text: "" };
  return null;
}
