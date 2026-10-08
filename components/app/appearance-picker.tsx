"use client";

import { useT } from "@/components/i18n/provider";
import { useState, useTransition } from "react";
import { setAppearance } from "@/app/app/settings/actions";
import { ACCENT_CHOICES, THEME_MODES, type Accent, type ThemeMode } from "@/lib/theme";
import { Icon, type IconName } from "@/components/app/icons";
import { cx } from "@/lib/utils";

const MODE_ICON: Record<ThemeMode, IconName> = { light: "sun", dark: "moon", auto: "sparkle" };

/** Mode d'affichage et couleur d'accent : appliqués tout de suite, mémorisés sur cet appareil. */
export function AppearancePicker({ mode, accent }: { mode: ThemeMode; accent: Accent }) {
  const tr = useT();
  const [m, setM] = useState(mode);
  const [a, setA] = useState(accent);
  const [pending, start] = useTransition();

  const pickMode = (v: ThemeMode) => {
    setM(v);
    start(() => setAppearance(v, null));
  };
  const pickAccent = (v: Accent) => {
    setA(v);
    start(() => setAppearance(null, v));
  };

  return (
    <div className={cx("space-y-5", pending && "opacity-80")}>
      <div>
        <p className="label mb-2">{tr("Mode")}</p>
        <div className="grid grid-cols-3 gap-2">
          {THEME_MODES.map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => pickMode(t.v)}
              aria-pressed={m === t.v}
              className={cx(
                "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-medium transition duration-200",
                m === t.v ? "border-brand-400 bg-brand-500/10 text-brand-800 shadow-sm" : "border-line bg-surface text-stone-600 hover:border-stone-300"
              )}
            >
              <Icon name={MODE_ICON[t.v]} className="h-5 w-5" />
              {t.l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label mb-2">{tr("Couleur d'accent")}</p>
        <div className="flex flex-wrap gap-3">
          {ACCENT_CHOICES.map((c) => (
            <button
              key={c.v}
              type="button"
              onClick={() => pickAccent(c.v)}
              aria-pressed={a === c.v}
              aria-label={c.l}
              title={c.l}
              className="group flex flex-col items-center gap-1.5"
            >
              <span
                className={cx("flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm ring-offset-2 ring-offset-surface transition duration-200 group-hover:scale-110", a === c.v && "ring-2 ring-stone-900/60 dark:ring-white/70")}
                style={{ background: `linear-gradient(135deg, ${c.swatch}, ${c.swatch}cc)` }}
              >
                {a === c.v && <span className="text-sm">✓</span>}
              </span>
              <span className="text-[10px] text-stone-500">{c.l}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
