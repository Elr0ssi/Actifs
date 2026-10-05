import Link from "next/link";
import { cx } from "@/lib/utils";
import { Float, InView } from "@/components/marketing/fx";

/** Bandeau d'appel à l'action avec dégradé animé et éléments flottants. */
export function CtaBanner({ title, text, primary = { href: "/signup", label: "Créer mon espace" }, secondary, className }: { title: string; text: string; primary?: { href: string; label: string }; secondary?: { href: string; label: string }; className?: string }) {
  const floaters = [["📅", "left-[6%] top-[18%]", 0, 7], ["💶", "right-[8%] top-[14%]", 1.2, 6], ["🛒", "left-[14%] bottom-[14%]", 2, 8], ["✅", "right-[16%] bottom-[16%]", 0.6, 6.5], ["🍝", "left-[48%] top-[8%]", 1.6, 9]] as const;
  return (
    <section className={cx("relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-violet-700 to-brand-900 px-6 py-16 text-center text-white sm:px-12", className)}>
      <div className="fx-gradient pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.0),rgba(255,255,255,0.14),rgba(255,255,255,0.0))]" aria-hidden />
      {floaters.map(([e, pos, d, t]) => (
        <Float key={e} delay={d} duration={t} amp={14} rot={6} className={cx("pointer-events-none absolute hidden text-3xl opacity-70 sm:block", pos)}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">{e}</span>
        </Float>
      ))}
      <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="relative mx-auto mt-3 max-w-xl text-brand-100">{text}</p>
      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link href={primary.href} className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-lift transition hover:-translate-y-0.5 hover:bg-brand-50">{primary.label}</Link>
        {secondary && <Link href={secondary.href} className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">{secondary.label}</Link>}
      </div>
    </section>
  );
}

/** Parcours animé : une impulsion voyage d'une étape à la suivante, chaque pastille pulse à son tour. */
export function FlowChain({ steps }: { steps: { icon: string; title: string; sub: string; tone: string }[] }) {
  return (
    <InView>
      <div className="relative">
        <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-8 hidden h-1 md:block" aria-hidden>
          <span className="block h-full rounded-full bg-gradient-to-r from-amber-300 via-sky-300 to-brand-400 opacity-50" />
          <span className="fx-travel absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lift ring-4 ring-brand-300/60" />
        </div>
        <ol className="grid gap-2 md:grid-cols-4 md:gap-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex flex-col items-center text-center">
              <span className="fx-in relative flex h-16 w-16 items-center justify-center" style={{ "--d": `${i * 0.18}s` } as React.CSSProperties}>
                <span className={cx("fx-ring absolute inset-0 rounded-full bg-gradient-to-br opacity-40", s.tone)} style={{ "--d": `${i * 0.6}s` } as React.CSSProperties} />
                <span className={cx("relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-2xl text-white shadow-lift ring-4 ring-canvas", s.tone)}>{s.icon}</span>
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-onink ring-2 ring-canvas">{i + 1}</span>
              </span>
              <p className="mt-4 font-semibold text-stone-900">{s.title}</p>
              <p className="mt-1 max-w-[14rem] text-sm leading-relaxed text-stone-500">{s.sub}</p>
              {i < steps.length - 1 && <span className="my-4 text-xl text-brand-300 md:hidden" aria-hidden>↓</span>}
            </li>
          ))}
        </ol>
      </div>
    </InView>
  );
}

/** Pastille numérotée reliée à la suivante : parcours en étapes. */
export function StepsRail({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <InView>
      <ol className="relative grid gap-6 md:grid-cols-4">
        <span className="pointer-events-none absolute left-[12%] right-[12%] top-6 hidden h-0.5 bg-stone-200 md:block" aria-hidden>
          <span className="fx-bar block h-full w-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ "--d": "0.3s" } as React.CSSProperties} />
        </span>
        {steps.map((s, i) => (
          <li key={s.title} className="relative text-center md:px-2">
            <span className="fx-in relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-lift ring-4 ring-canvas" style={{ "--d": `${0.15 * i}s` } as React.CSSProperties}>{i + 1}</span>
            <h3 className="mt-3 font-semibold text-stone-900">{s.title}</h3>
            <p className="mx-auto mt-1 max-w-[16rem] text-sm leading-relaxed text-stone-600">{s.text}</p>
          </li>
        ))}
      </ol>
    </InView>
  );
}

const BLOB = {
  violet: ["bg-violet-300/45", "bg-brand-200/60"],
  emerald: ["bg-emerald-300/40", "bg-teal-200/50"],
  amber: ["bg-amber-300/40", "bg-orange-200/50"],
  sky: ["bg-sky-300/40", "bg-indigo-200/50"],
  rose: ["bg-rose-300/35", "bg-fuchsia-200/50"],
} as const;
export type AmbienceTone = keyof typeof BLOB;

const EMOJI_POS = ["left-[4%] top-[12%]", "right-[5%] top-[18%]", "left-[9%] bottom-[12%]", "right-[10%] bottom-[16%]", "left-[46%] top-[4%]"];

/** Décor d'ambiance d'une section : halos qui dérivent, motif de points et petits éléments qui flottent. */
export function Ambience({ tone, emojis = [], dots = true }: { tone: AmbienceTone; emojis?: string[]; dots?: boolean }) {
  const [a, b] = BLOB[tone];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_78%,transparent)]" aria-hidden>
      {dots && <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(rgb(120_113_108/0.18)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_30%,transparent_100%)]" />}
      <div className={cx("fx-drift absolute -left-24 top-[10%] h-72 w-72 rounded-full blur-3xl", a)} />
      <div className={cx("fx-drift absolute -right-24 bottom-[5%] h-80 w-80 rounded-full blur-3xl", b)} style={{ "--d": "-6s", "--t": "22s" } as React.CSSProperties} />
      {emojis.map((e, i) => (
        <Float key={e + i} delay={i * 0.9} duration={6 + (i % 3) * 1.5} amp={14} rot={i % 2 ? -8 : 8} className={cx("absolute hidden text-3xl opacity-60 md:block", EMOJI_POS[i % EMOJI_POS.length])}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/60 shadow-soft backdrop-blur">{e}</span>
        </Float>
      ))}
    </div>
  );
}
