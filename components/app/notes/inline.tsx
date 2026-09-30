import { Fragment } from "react";

const RULES: { re: RegExp; render: (m: RegExpExecArray, key: number) => React.ReactNode }[] = [
  { re: /`([^`]+)`/, render: (m, k) => <code key={k} className="rounded bg-stone-100 px-1 py-px font-mono text-[0.85em] text-brand-700">{m[1]}</code> },
  { re: /\*\*([^*]+)\*\*/, render: (m, k) => <strong key={k} className="font-semibold">{Inline({ text: m[1] })}</strong> },
  { re: /~~([^~]+)~~/, render: (m, k) => <del key={k} className="text-stone-400">{Inline({ text: m[1] })}</del> },
  { re: /\*([^*\s][^*]*)\*/, render: (m, k) => <em key={k}>{Inline({ text: m[1] })}</em> },
  { re: /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/, render: (m, k) => <a key={k} href={m[2]} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-brand-600 underline underline-offset-2">{m[1]}</a> },
  { re: /(https?:\/\/[^\s)]+)/, render: (m, k) => <a key={k} href={m[1]} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-brand-600 underline underline-offset-2">{m[1]}</a> },
];

/** Rendu Markdown en ligne (gras, italique, code, lien), sans HTML brut : tout passe par des éléments React. */
export function Inline({ text }: { text: string }): JSX.Element {
  const out: React.ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest) {
    let best: { idx: number; m: RegExpExecArray; render: (typeof RULES)[number]["render"] } | null = null;
    for (const r of RULES) {
      const m = r.re.exec(rest);
      if (m && (!best || m.index < best.idx)) best = { idx: m.index, m, render: r.render };
    }
    if (!best) {
      out.push(rest);
      break;
    }
    if (best.idx > 0) out.push(rest.slice(0, best.idx));
    out.push(best.render(best.m, key++));
    rest = rest.slice(best.idx + best.m[0].length);
  }
  return <>{out.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</>;
}
