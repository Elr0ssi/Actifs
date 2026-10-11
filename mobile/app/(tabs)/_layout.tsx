import React from "react";
import { Tabs } from "expo-router";
import { SymbolView, type SFSymbol } from "expo-symbols";
import { useTheme } from "~/ui/theme";

const icon = (name: SFSymbol) => ({ color, size }: { color: import("react-native").ColorValue; size: number }) => <SymbolView name={name} size={size} tintColor={color} resizeMode="scaleAspectFit" />;

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.brand,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line },
        headerStyle: { backgroundColor: t.canvas },
        headerTitleStyle: { color: t.ink },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Aujourd'hui", tabBarIcon: icon("sun.max") }} />
      <Tabs.Screen name="tasks" options={{ title: "Tâches", tabBarIcon: icon("checklist") }} />
      <Tabs.Screen name="finance" options={{ title: "Finances", tabBarIcon: icon("eurosign.circle") }} />
      <Tabs.Screen name="courses" options={{ title: "Courses", tabBarIcon: icon("cart") }} />
      <Tabs.Screen name="more" options={{ title: "Plus", tabBarIcon: icon("ellipsis.circle") }} />
    </Tabs>
  );
}
