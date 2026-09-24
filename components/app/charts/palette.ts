// Validated categorical palette (dataviz skill) — passes CVD + normal-vision
// separation checks in both light and dark mode. Order is the safety
// mechanism: keep it fixed, never cycle/reassign per filter.
export const CATEGORICAL = [
  { light: "#2a78d6", dark: "#3987e5", name: "blue" },
  { light: "#eb6834", dark: "#d95926", name: "orange" },
  { light: "#1baf7a", dark: "#199e70", name: "aqua" },
  { light: "#eda100", dark: "#c98500", name: "yellow" },
  { light: "#e87ba4", dark: "#d55181", name: "magenta" },
  { light: "#4a3aa7", dark: "#9085e9", name: "violet" },
] as const;

export const FOLD_OTHER = { light: "#898781", dark: "#898781", name: "gray" };

export function categoryColor(index: number) {
  return index < CATEGORICAL.length ? CATEGORICAL[index] : FOLD_OTHER;
}

export const INCOME_COLOR = { light: "#059669", dark: "#34d399" };
export const EXPENSE_COLOR = { light: "#e11d48", dark: "#fb7185" };
