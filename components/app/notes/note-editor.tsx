"use client";

import { useT } from "@/components/i18n/provider";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createNote, deleteNote, saveNote, togglePin } from "@/app/app/notes/pages/actions";
import { Icon } from "@/components/app/icons";
import { Inline } from "@/components/app/notes/inline";
import { cx } from "@/lib/utils";
import { BLOCK_MENU, emptyBlock, markdownShortcut, type Block, type BlockType } from "@/lib/notes";

const EMOJIS = ["📝", "📚", "💡", "✅", "🎯", "🏠", "🛒", "🍳", "💶", "✈️", "🏋️", "🎬", "🎵", "💼", "❤️", "⭐", "🔥", "🌱", "📅", "🧠"];
const LISTY: BlockType[] = ["todo", "bullet", "num"];

interface Props {
  id: string;
  initialTitle: string;
  initialIcon: string | null;
  initialBlocks: Block[];
  pinned: boolean;
  trail: { id: string; title: string; icon: string | null }[];
  children: { id: string; title: string; icon: string | null }[];
}

type Status = "saved" | "dirty" | "saving";

export function NoteEditor({ id, initialTitle, initialIcon, initialBlocks, pinned, trail, children: subPages }: Props) {
  const tr = useT();
  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState<string | null>(initialIcon);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks.length ? initialBlocks : [emptyBlock()]);
  const [status, setStatus] = useState<Status>("saved");
  const [focus, setFocus] = useState<{ id: string; pos: number } | null>(null);
  const [menu, setMenu] = useState<{ id: string; q: string; index: number } | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(pinned);
  const first = useRef(true);
  const latest = useRef({ title, icon, blocks });
  latest.current = { title, icon, blocks };

  const flush = useCallback(async () => {
    setStatus("saving");
    const r = await saveNote(id, latest.current);
    setStatus(r?.ok === false ? "dirty" : "saved");
  }, [id]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setStatus("dirty");
    const t = setTimeout(flush, 800);
    return () => clearTimeout(t);
  }, [title, icon, blocks, flush]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (status !== "saved") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  const patch = (bid: string, p: Partial<Block>) => setBlocks((bs) => bs.map((b) => (b.id === bid ? { ...b, ...p } : b)));

  const change = (b: Block, text: string) => {
    if (b.type === "p") {
      const sc = markdownShortcut(text);
      if (sc) {
        if (sc.type === "divider") {
          const next = emptyBlock();
          setBlocks((bs) => bs.flatMap((x) => (x.id === b.id ? [{ ...x, type: "divider" as const, text: "" }, next] : [x])));
          setFocus({ id: next.id, pos: 0 });
        } else {
          patch(b.id, { type: sc.type, text: sc.text, ...(sc.type === "todo" ? { checked: !!sc.checked } : {}) });
          setFocus({ id: b.id, pos: sc.text.length });
        }
        setMenu(null);
        return;
      }
    }
    patch(b.id, { text });
    if (text.startsWith("/") && !text.includes(" ") && b.type !== "code") setMenu({ id: b.id, q: text.slice(1), index: 0 });
    else setMenu(null);
  };

  const options = (q: string) => {
    const f = q.toLowerCase();
    return BLOCK_MENU.filter((o) => !f || o.label.toLowerCase().includes(f) || o.keys.includes(f));
  };

  const applyType = (bid: string, type: BlockType) => {
    if (type === "divider") {
      const next = emptyBlock();
      setBlocks((bs) => bs.flatMap((x) => (x.id === bid ? [{ ...x, type, text: "" }, next] : [x])));
      setFocus({ id: next.id, pos: 0 });
    } else {
      patch(bid, { type, text: "", ...(type === "todo" ? { checked: false } : {}) });
      setFocus({ id: bid, pos: 0 });
    }
    setMenu(null);
  };

  const insertAfter = (b: Block, text = "") => {
    const type: BlockType = LISTY.includes(b.type) ? b.type : "p";
    const next = { ...emptyBlock(type), text };
    setBlocks((bs) => {
      const i = bs.findIndex((x) => x.id === b.id);
      return [...bs.slice(0, i + 1), next, ...bs.slice(i + 1)];
    });
    setFocus({ id: next.id, pos: 0 });
  };

  const remove = (bid: string, focusPrev = true) => {
    setBlocks((bs) => {
      if (bs.length === 1) return [emptyBlock()];
      const i = bs.findIndex((x) => x.id === bid);
      const prev = bs[i - 1] ?? bs[i + 1];
      if (focusPrev && prev) setFocus({ id: prev.id, pos: prev.text.length });
      return bs.filter((x) => x.id !== bid);
    });
  };

  const move = (bid: string, delta: number) =>
    setBlocks((bs) => {
      const i = bs.findIndex((x) => x.id === bid);
      const j = i + delta;
      if (j < 0 || j >= bs.length) return bs;
      const copy = [...bs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, b: Block, i: number) => {
    const el = e.currentTarget;
    if (menu?.id === b.id) {
      const opts = options(menu.q);
      if (e.key === "ArrowDown") { e.preventDefault(); setMenu({ ...menu, index: (menu.index + 1) % Math.max(opts.length, 1) }); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setMenu({ ...menu, index: (menu.index - 1 + opts.length) % Math.max(opts.length, 1) }); return; }
      if (e.key === "Enter" && opts[menu.index]) { e.preventDefault(); applyType(b.id, opts[menu.index].type); return; }
      if (e.key === "Escape") { setMenu(null); return; }
    }
    if (e.key === "Enter" && !e.shiftKey && b.type !== "code") {
      e.preventDefault();
      if (LISTY.includes(b.type) && b.text === "") {
        patch(b.id, { type: "p" });
        return;
      }
      const pos = el.selectionStart;
      const head = b.text.slice(0, pos);
      const tail = b.text.slice(el.selectionEnd);
      patch(b.id, { text: head });
      insertAfter({ ...b, text: head }, tail);
      return;
    }
    if (e.key === "Backspace" && el.selectionStart === 0 && el.selectionEnd === 0) {
      if (b.type !== "p") {
        e.preventDefault();
        patch(b.id, { type: "p" });
      } else if (i > 0) {
        e.preventDefault();
        const prev = blocks[i - 1];
        if (prev.type === "divider" || b.text === "") remove(b.id);
        else {
          setBlocks((bs) => bs.filter((x) => x.id !== b.id).map((x) => (x.id === prev.id ? { ...x, text: x.text + b.text } : x)));
          setFocus({ id: prev.id, pos: prev.text.length });
        }
      }
      return;
    }
    if (e.key === "ArrowUp" && el.selectionStart === 0 && i > 0) { e.preventDefault(); setFocus({ id: blocks[i - 1].id, pos: blocks[i - 1].text.length }); }
    if (e.key === "ArrowDown" && el.selectionStart === b.text.length && i < blocks.length - 1) { e.preventDefault(); setFocus({ id: blocks[i + 1].id, pos: 0 }); }
    if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "i")) {
      e.preventDefault();
      const mark = e.key === "b" ? "**" : "*";
      const { selectionStart: s, selectionEnd: en } = el;
      const text = b.text.slice(0, s) + mark + b.text.slice(s, en) + mark + b.text.slice(en);
      patch(b.id, { text });
      setFocus({ id: b.id, pos: s === en ? s + mark.length : en + mark.length * 2 });
    }
  };

  const numberOf = (i: number) => {
    let n = 1;
    for (let k = i - 1; k >= 0 && blocks[k].type === "num"; k--) n++;
    return n;
  };

  return (
    <div className="card mx-auto max-w-3xl px-5 pb-16 pt-5 sm:px-10 sm:pt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
        <nav className="flex min-w-0 flex-wrap items-center gap-1">
          <Link href="/app/notes/pages" className="rounded px-1 py-0.5 hover:bg-stone-100 hover:text-stone-700 lg:hidden">{tr("← Toutes les pages")}</Link>
          {trail.map((t) => (
            <span key={t.id} className="flex items-center gap-1">
              <Link href={`/app/notes/pages/${t.id}`} className="max-w-[140px] truncate rounded px-1 py-0.5 hover:bg-stone-100 hover:text-stone-700">{t.icon || "📄"} {t.title || tr("Sans titre")}</Link>
              <span>/</span>
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <span className="mr-1">{status === "saved" ? tr("Enregistré") : status === "saving" ? tr("Enregistrement…") : tr("Modifications non enregistrées")}</span>
          <button type="button" title={isPinned ? tr("Désépingler") : tr("Épingler")} onClick={() => { setIsPinned(!isPinned); void togglePin(id, !isPinned); }} className={cx("rounded-md px-1.5 py-1 text-sm hover:bg-stone-100", isPinned ? "text-brand-600" : "text-stone-400")}>{isPinned ? "★" : "☆"}</button>
          <form action={createNote.bind(null, id)}><button title={tr("Nouvelle sous-page")} className="rounded-md p-1.5 hover:bg-stone-100 hover:text-stone-700"><Icon name="plus" className="h-3.5 w-3.5" /></button></form>
          <form action={deleteNote.bind(null, id)} onSubmit={(e) => { if (!confirm("Supprimer cette page et ses sous-pages ?")) e.preventDefault(); }}>
            <button title={tr("Supprimer")} className="rounded-md p-1.5 hover:bg-rose-500/10 hover:text-rose-600"><Icon name="close" className="h-3.5 w-3.5" /></button>
          </form>
        </div>
      </div>

      <div className="relative">
        <button type="button" onClick={() => setEmojiOpen(!emojiOpen)} className="mb-1 rounded-lg px-1 text-5xl leading-none hover:bg-stone-100" title={tr("Changer l'icône")}>{icon || "📄"}</button>
        {emojiOpen && (
          <div className="absolute left-0 top-14 z-20 grid w-64 grid-cols-7 gap-1 rounded-xl border border-line bg-surface p-2 shadow-xl">
            {EMOJIS.map((e) => <button key={e} type="button" onClick={() => { setIcon(e); setEmojiOpen(false); }} className="rounded-md p-1 text-xl hover:bg-stone-100">{e}</button>)}
            <button type="button" onClick={() => { setIcon(null); setEmojiOpen(false); }} className="col-span-7 rounded-md py-1 text-[11px] text-stone-400 hover:bg-stone-100">{tr("Retirer l'icône")}</button>
          </div>
        )}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setFocus({ id: blocks[0].id, pos: 0 }); } }}
        placeholder={tr("Sans titre")}
        autoFocus={!initialTitle && initialBlocks.length === 0}
        className="w-full bg-transparent text-3xl font-bold tracking-tight text-stone-900 outline-none placeholder:text-stone-300 sm:text-4xl"
      />

      <div className="mt-4">
        {blocks.map((b, i) => (
          <BlockRow
            key={b.id}
            block={b}
            number={b.type === "num" ? numberOf(i) : 0}
            focused={focus?.id === b.id ? focus.pos : null}
            onFocusDone={() => setFocus(null)}
            onRequestFocus={(pos) => setFocus({ id: b.id, pos })}
            onChange={(t) => change(b, t)}
            onKeyDown={(e) => onKeyDown(e, b, i)}
            onCheck={(v) => patch(b.id, { checked: v })}
            onMove={(d) => move(b.id, d)}
            onDelete={() => remove(b.id, false)}
            onBlur={() => setMenu((m) => (m?.id === b.id ? null : m))}
            menu={menu?.id === b.id ? { options: options(menu.q), index: menu.index } : null}
            onPick={(t) => applyType(b.id, t)}
            placeholder={blocks.length === 1 && i === 0 ? tr("Écris quelque chose, ou tape « / » pour les commandes…") : ""}
          />
        ))}
        <button type="button" onClick={() => { const nb = emptyBlock(); setBlocks((bs) => [...bs, nb]); setFocus({ id: nb.id, pos: 0 }); }} className="mt-2 min-h-[56px] w-full cursor-text rounded-lg text-left text-sm text-transparent hover:text-stone-300" aria-label={tr("Ajouter un bloc à la fin")}>
          {tr("+ Cliquer pour ajouter un bloc")}</button>
      </div>

      {subPages.length > 0 && (
        <div className="mt-6 border-t border-line pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">{tr("Sous-pages")}</p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {subPages.map((s) => (
              <Link key={s.id} href={`/app/notes/pages/${s.id}`} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-stone-700 hover:border-brand-300 hover:bg-brand-50/50">
                <span>{s.icon || "📄"}</span><span className="truncate">{s.title || tr("Sans titre")}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface RowProps {
  block: Block;
  number: number;
  focused: number | null;
  placeholder: string;
  menu: { options: typeof BLOCK_MENU; index: number } | null;
  onFocusDone: () => void;
  onRequestFocus: (pos: number) => void;
  onChange: (t: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCheck: (v: boolean) => void;
  onMove: (d: number) => void;
  onDelete: () => void;
  onBlur: () => void;
  onPick: (t: BlockType) => void;
}

const TEXT_STYLE: Record<BlockType, string> = {
  p: "text-[15px] leading-7",
  h1: "mt-5 text-[1.9rem] font-bold leading-9 tracking-tight",
  h2: "mt-4 text-2xl font-bold leading-8 tracking-tight",
  h3: "mt-3 text-xl font-semibold leading-7",
  todo: "text-[15px] leading-7",
  bullet: "text-[15px] leading-7",
  num: "text-[15px] leading-7",
  quote: "border-l-4 border-brand-400 pl-4 text-[15px] italic leading-7 text-stone-600",
  callout: "rounded-xl bg-brand-50 px-4 py-3 text-[15px] leading-7",
  code: "rounded-xl bg-stone-100 px-4 py-3 font-mono text-[13px] leading-6",
  divider: "",
};

function BlockRow({ block: b, number, focused, placeholder, menu, onFocusDone, onRequestFocus, onChange, onKeyDown, onCheck, onMove, onDelete, onBlur, onPick }: RowProps) {
  const tr = useT();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [handle, setHandle] = useState(false);

  const fit = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (focused === null) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    const p = Math.min(focused, el.value.length);
    el.setSelectionRange(p, p);
    onFocusDone();
  });
  useEffect(fit, [b.text, b.type, focused]);

  const isFocusedEditor = focused !== null;
  const [editing, setEditing] = useState(false);
  const showEditor = editing || isFocusedEditor || b.text === "";

  const marker =
    b.type === "todo" ? (
      <input type="checkbox" checked={!!b.checked} onChange={(e) => onCheck(e.target.checked)} className="mr-2.5 mt-2 h-4 w-4 shrink-0" />
    ) : b.type === "bullet" ? (
      <span className="mr-2.5 w-4 shrink-0 text-center text-lg leading-7 text-stone-500">•</span>
    ) : b.type === "num" ? (
      <span className="mr-2 w-5 shrink-0 text-right text-[15px] leading-7 text-stone-500">{number}.</span>
    ) : null;

  return (
    <div className="group relative flex items-start" onMouseLeave={() => setHandle(false)}>
      <div className="absolute -left-9 top-1 hidden items-center opacity-0 transition group-hover:opacity-100 focus-within:opacity-100 sm:flex">
        <button type="button" onClick={() => setHandle(!handle)} className="rounded p-1 text-stone-300 hover:bg-stone-100 hover:text-stone-600" aria-label={tr("Options du bloc")}><Icon name="drag" className="h-3.5 w-3.5" /></button>
        {handle && (
          <div className="absolute left-7 top-0 z-20 w-36 rounded-xl border border-line bg-surface p-1 text-xs shadow-xl">
            <button type="button" onClick={() => { onMove(-1); setHandle(false); }} className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-stone-100">{tr("↑ Monter")}</button>
            <button type="button" onClick={() => { onMove(1); setHandle(false); }} className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-stone-100">{tr("↓ Descendre")}</button>
            <button type="button" onClick={onDelete} className="block w-full rounded-lg px-2 py-1.5 text-left text-rose-600 hover:bg-rose-500/10">{tr("Supprimer")}</button>
          </div>
        )}
      </div>

      {b.type === "divider" ? (
        <button type="button" onClick={onDelete} className="my-3 block w-full" aria-label={tr("Séparateur")}><hr className="border-line" /></button>
      ) : (
        <div className={cx("flex min-w-0 flex-1 items-start", b.type === "callout" && "gap-2")}>
          {marker}
          <div className={cx("relative min-w-0 flex-1", TEXT_STYLE[b.type], b.type === "todo" && b.checked && "text-stone-400 line-through")}>
            {showEditor ? (
              <textarea
                ref={ref}
                rows={1}
                value={b.text}
                spellCheck
                placeholder={placeholder || (b.type.startsWith("h") ? tr("Titre") : "")}
                onFocus={() => setEditing(true)}
                onBlur={() => { setEditing(false); onBlur(); }}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                className="block w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-stone-300"
              />
            ) : (
              <div className="min-h-[1.75em] cursor-text whitespace-pre-wrap break-words" onClick={() => { setEditing(true); onRequestFocus(b.text.length); }}>
                {b.type === "code" ? b.text : <Inline text={b.text} />}
              </div>
            )}
            {menu && (
              <div className="absolute left-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-xl border border-line bg-surface p-1 text-sm shadow-xl">
                {menu.options.length === 0 && <p className="px-3 py-2 text-xs text-stone-400">{tr("Aucun bloc trouvé")}</p>}
                {menu.options.map((o, i) => (
                  <button
                    key={o.type}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); onPick(o.type); }}
                    className={cx("flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-[13px] font-normal not-italic", i === menu.index ? "bg-brand-50 text-brand-700" : "text-stone-700 hover:bg-stone-100")}
                  >
                    <span>{o.label}</span>
                    <span className="font-mono text-[11px] text-stone-400">{o.hint.trim()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
