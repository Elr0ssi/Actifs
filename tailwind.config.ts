import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import colors from "tailwindcss/colors";

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
type Step = (typeof STEPS)[number];
type Palette = Record<Step, string>;

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
const scale = (name: string) => Object.fromEntries(STEPS.map((s) => [s, `rgb(var(--${name}-${s}) / <alpha-value>)`]));
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const pick = (p: Palette): Palette => Object.fromEntries(STEPS.map((s) => [s, (p as Record<number, string>)[s]])) as Palette;

/** Anciennes teintes terracotta, gardées comme choix d'accent. */
const TERRACOTTA: Palette = {
  50: "#fcf5f1", 100: "#f8e7df", 200: "#f0cdbd", 300: "#e3a88f", 400: "#d4825f",
  500: "#c4673f", 600: "#b05538", 700: "#914430", 800: "#74372a", 900: "#5e2f25", 950: "#3a1c15",
};

/** Accents proposés dans Paramètres ; `violet` est le thème par défaut. */
const ACCENTS = {
  violet: pick(colors.violet),
  ocean: pick(colors.blue),
  emerald: pick(colors.emerald),
  rose: pick(colors.rose),
  sunset: pick(colors.orange),
  terracotta: TERRACOTTA,
} as const;

/** Neutres : gris très légèrement froids en clair, bleu nuit en sombre (les classes restent `stone-*`). */
const NEUTRAL_LIGHT: Palette = pick(colors.zinc);
const NEUTRAL_DARK: Palette = {
  50: "#1a1d26", 100: "#21252f", 200: "#2c313d", 300: "#3b4152", 400: "#6d7589",
  500: "#8c94a7", 600: "#aab1c1", 700: "#c6cbd7", 800: "#dfe2ea", 900: "#f1f3f8", 950: "#fafbfd",
};

const HUES = {
  emerald: pick(colors.emerald),
  rose: pick(colors.rose),
  amber: pick(colors.amber),
  sky: pick(colors.sky),
  violet: pick(colors.violet),
};

/** Teintes de statut : on inverse l'échelle en mode sombre (fonds sombres, textes clairs). */
const invert = (p: Palette): Palette => ({
  50: p[950], 100: p[900], 200: p[800], 300: p[700], 400: p[600], 500: p[500],
  600: p[400], 700: p[300], 800: p[200], 900: p[100], 950: p[50],
});
/** Accent : le 600 reste vif en sombre, car il porte les boutons au texte blanc. */
const invertBrand = (p: Palette): Palette => ({ ...invert(p), 600: p[500], 400: p[400] });

const vars = (name: string, p: Palette) => Object.fromEntries(STEPS.map((s) => [`--${name}-${s}`, rgb(p[s])]));

const SURFACE_LIGHT = { "--canvas": "245 245 247", "--surface": "255 255 255", "--line": "228 228 233", "--ink": "24 24 27", "--onink": "255 255 255", "--shadow": "39 39 61" };
const SURFACE_DARK = { "--canvas": "11 13 18", "--surface": "21 24 32", "--line": "40 45 58", "--ink": "241 243 248", "--onink": "17 19 26", "--shadow": "0 0 0" };

const lightTheme = () => ({
  ...SURFACE_LIGHT,
  ...vars("stone", NEUTRAL_LIGHT),
  ...Object.assign({}, ...Object.entries(HUES).map(([n, p]) => vars(n, p))),
});
const darkTheme = () => ({
  ...SURFACE_DARK,
  ...vars("stone", NEUTRAL_DARK),
  ...Object.assign({}, ...Object.entries(HUES).map(([n, p]) => vars(n, invert(p)))),
});

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: scale("brand"),
        stone: scale("stone"),
        emerald: scale("emerald"),
        rose: scale("rose"),
        amber: scale("amber"),
        sky: scale("sky"),
        violet: scale("violet"),
        canvas: token("canvas"),
        surface: token("surface"),
        line: token("line"),
        ink: token("ink"),
        onink: token("onink"),
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgb(var(--shadow) / 0.05), 0 12px 32px -14px rgb(var(--shadow) / 0.16)",
        lift: "0 2px 4px rgb(var(--shadow) / 0.06), 0 22px 44px -16px rgb(var(--shadow) / 0.26)",
        glow: "0 10px 26px -8px rgb(var(--brand-500) / 0.6)",
      },
      borderRadius: { "4xl": "1.75rem" },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        fadeUp: { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        gradientShift: { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        pageIn: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "none" } },
        rise: { "0%": { opacity: "0", transform: "translateY(14px) scale(0.985)" }, "100%": { opacity: "1", transform: "none" } },
        pop: { "0%": { opacity: "0", transform: "scale(0.92)" }, "100%": { opacity: "1", transform: "none" } },
        modal: { "0%": { opacity: "0", transform: "translateY(16px) scale(0.97)" }, "100%": { opacity: "1", transform: "none" } },
        fade: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideIn: { "0%": { opacity: "0", transform: "translateX(28px)" }, "100%": { opacity: "1", transform: "none" } },
        grow: { "0%": { transform: "scaleX(0)" }, "100%": { transform: "scaleX(1)" } },
        draw: { "0%": { strokeDashoffset: "1" }, "100%": { strokeDashoffset: "0" } },
        orbA: { "0%,100%": { transform: "translate3d(0,0,0) scale(1)" }, "50%": { transform: "translate3d(4%,6%,0) scale(1.08)" } },
        orbB: { "0%,100%": { transform: "translate3d(0,0,0) scale(1)" }, "50%": { transform: "translate3d(-5%,-4%,0) scale(1.12)" } },
        check: { "0%": { transform: "scale(0.7)" }, "60%": { transform: "scale(1.15)" }, "100%": { transform: "scale(1)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.7s ease-out both",
        gradientShift: "gradientShift 8s ease infinite",
        pageIn: "pageIn 0.35s cubic-bezier(0.22,1,0.36,1) backwards",
        rise: "rise 0.6s cubic-bezier(0.22,1,0.36,1) backwards",
        pop: "pop 0.4s cubic-bezier(0.22,1,0.36,1) backwards",
        modal: "modal 0.28s cubic-bezier(0.22,1,0.36,1) backwards",
        fade: "fade 0.2s ease-out backwards",
        slideIn: "slideIn 0.32s cubic-bezier(0.22,1,0.36,1) backwards",
        grow: "grow 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s backwards",
        draw: "draw 1.3s cubic-bezier(0.22,1,0.36,1) 0.1s backwards",
        orbA: "orbA 22s ease-in-out infinite",
        orbB: "orbB 28s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      const accentSelectors: Record<string, Record<string, string>> = {};
      const darkAccentSelectors: Record<string, Record<string, string>> = {};
      const autoAccentSelectors: Record<string, Record<string, string>> = {};
      for (const [name, p] of Object.entries(ACCENTS)) {
        accentSelectors[`[data-accent="${name}"]`] = vars("brand", p);
        darkAccentSelectors[`.dark[data-accent="${name}"]`] = vars("brand", invertBrand(p));
        autoAccentSelectors[`.theme-auto[data-accent="${name}"]`] = vars("brand", invertBrand(p));
      }
      addBase({
        ":root": { ...lightTheme(), ...vars("brand", ACCENTS.violet) },
        ...accentSelectors,
        ".dark": darkTheme(),
        ...darkAccentSelectors,
        "@media (prefers-color-scheme: dark)": { ".theme-auto": darkTheme(), ...autoAccentSelectors },
      });
    }),
  ],
};
export default config;
