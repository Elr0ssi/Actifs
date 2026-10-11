import type { ExpoConfig } from "expo/config";

// Identifiant de bundle PROVISOIRE : à remplacer par celui que vous réservez sur developer.apple.com.
// Il détermine aussi l'App Group partagé avec les widgets (group.<bundle id>).
const bundleId = process.env.IOS_BUNDLE_ID || "com.flozea.app";

const config: ExpoConfig = {
  name: "Flozea",
  slug: "flozea",
  scheme: "flozea",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  ios: {
    bundleIdentifier: bundleId,
    supportsTablet: false,
    buildNumber: "1",
    appleTeamId: process.env.APPLE_TEAM_ID || undefined,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleDisplayName: "Flozea",
    },
    entitlements: {
      "com.apple.security.application-groups": [`group.${bundleId}`],
    },
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    "expo-dev-client",
    ["expo-splash-screen", { image: "./assets/splash.png", backgroundColor: "#6d28d9", imageWidth: 200 }],
    ["expo-notifications", { color: "#6d28d9" }],
    "@bacons/apple-targets",
  ],
  experiments: { typedRoutes: false },
  extra: {
    appGroup: `group.${bundleId}`,
    eas: process.env.EAS_PROJECT_ID ? { projectId: process.env.EAS_PROJECT_ID } : undefined,
  },
};

export default config;
