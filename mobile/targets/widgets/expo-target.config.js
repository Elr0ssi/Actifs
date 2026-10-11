/**
 * Extension WidgetKit de Flozea (plugin @bacons/apple-targets).
 * - Les widgets lisent un instantané JSON écrit par l'app dans l'App Group `group.<bundle id>`.
 * - Le plugin recopie automatiquement l'App Group déclaré dans app.config.ts (ios.entitlements).
 * - iOS 17 minimum pour les widgets (API containerBackground).
 * @type {import('@bacons/apple-targets/app.plugin').Config}
 */
module.exports = {
  type: "widget",
  name: "FlozeaWidgets",
  displayName: "Flozea",
  deploymentTarget: "17.0",
  icon: "../../assets/icon.png",
  colors: {
    $accent: "#7c3aed",
    $widgetBackground: { light: "#ffffff", dark: "#151820" },
    brand: { light: "#7c3aed", dark: "#8b5cf6" },
    brandSoft: { light: "#f5f3ff", dark: "#1d1a33" },
    meal: { light: "#ea580c", dark: "#fb923c" },
    money: { light: "#2563eb", dark: "#60a5fa" },
    good: { light: "#059669", dark: "#34d399" },
    bad: { light: "#e11d48", dark: "#fb7185" },
  },
};
