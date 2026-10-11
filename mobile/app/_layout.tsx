import "react-native-url-polyfill/auto";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setUiLocale } from "@/lib/i18n";
import { AuthProvider, useAuth } from "~/auth/AuthProvider";
import { DataProvider, useData } from "~/data/DataProvider";
import { Loading } from "~/ui/kit";
import { ThemeContext, makeTheme, useSystemDark } from "~/ui/theme";

setUiLocale("fr");
void SplashScreen.preventAutoHideAsync();

function Gate() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const inAuth = segments[0] === "(auth)";

  useEffect(() => {
    if (status === "loading") return;
    void SplashScreen.hideAsync();
    if (status === "signedIn" && inAuth) router.replace("/");
    if ((status === "signedOut" || status === "misconfigured") && !inAuth) router.replace("/login");
  }, [status, inAuth, router]);

  // Toucher une notification locale ouvre l'écran correspondant (flozea://tasks, flozea://routines).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((r) => {
      const url = r.notification.request.content.data?.url;
      if (typeof url === "string" && url.startsWith("flozea://")) router.push(("/" + url.slice("flozea://".length)) as never);
    });
    return () => sub.remove();
  }, [router]);

  if (status === "loading") return <Loading />;
  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
    </Stack>
  );
}

function Themed({ children }: { children: React.ReactNode }) {
  const { settings } = useData();
  const dark = useSystemDark();
  const theme = makeTheme(dark, settings.accent);
  return (
    <ThemeContext.Provider value={theme}>
      <StatusBar style={dark ? "light" : "dark"} />
      {children}
    </ThemeContext.Provider>
  );
}

export default function Root() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <Themed>
            <Gate />
          </Themed>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
