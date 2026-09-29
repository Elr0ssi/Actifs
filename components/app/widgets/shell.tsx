"use client";

import { createContext, useContext } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/app/icons";
import { cx } from "@/lib/utils";
import type { WidgetSize } from "@/lib/widgets/registry";

export const WidgetSizeContext = createContext<WidgetSize>("m");
/** "dashboard" = tableau de bord général : seul endroit où les widgets renvoient vers leur section. */
export const WidgetPageContext = createContext<string>("section");

export function WidgetShell({
  icon,
  title,
  subtitle,
  href,
  hrefLabel = "Voir tout",
  right,
  children,
  className,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const compact = useContext(WidgetSizeContext) === "s";
  const showLink = useContext(WidgetPageContext) === "dashboard";
  return (
    <section className={cx("card flex h-full min-w-0 flex-col p-4", className)}>
      <header className="mb-3 flex flex-wrap items-start justify-between gap-x-2 gap-y-2">
        <div className="flex min-w-[9rem] flex-1 items-start gap-2.5">
          <span className="mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Icon name={icon} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-semibold text-stone-900">{title}</h2>
            {subtitle && <p className="truncate text-[11px] text-stone-400">{subtitle}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {right}
          {href && showLink && (
            <Link href={href} className={cx("btn-ghost", compact && "px-1.5")} title={hrefLabel}>
              {!compact && hrefLabel} <Icon name="chevronRight" className="h-3 w-3" />
            </Link>
          )}
        </div>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-stone-50 px-3 py-4 text-center text-xs text-stone-400">{children}</p>;
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button key={o.v} type="button" data-active={value === o.v} onClick={() => onChange(o.v)}>
          {o.l}
        </button>
      ))}
    </div>
  );
}
