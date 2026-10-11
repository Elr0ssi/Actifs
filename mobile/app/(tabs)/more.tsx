import React from "react";
import { useRouter } from "expo-router";
import type { SFSymbol } from "expo-symbols";
import { Card, Icon, Row, Screen, SyncBanner, T } from "~/ui/kit";
import { useTheme } from "~/ui/theme";
import { useData } from "~/data/DataProvider";

const ITEMS: { href: string; title: string; hint: string; icon: SFSymbol }[] = [
  { href: "/routines", title: "Routines", hint: "Tes habitudes, jour par jour", icon: "arrow.triangle.2.circlepath" },
  { href: "/agenda", title: "Agenda", hint: "Rendez-vous, tâches et repas de la semaine", icon: "calendar" },
  { href: "/meals", title: "Menu de la semaine", hint: "Planifie tes repas midi et soir", icon: "fork.knife" },
  { href: "/recipes", title: "Recettes", hint: "Tes recettes, ajout aux courses", icon: "book" },
  { href: "/settings", title: "Réglages", hint: "Compte, notifications, widgets, synchronisation", icon: "gearshape" },
];

export default function More() {
  const t = useTheme();
  const router = useRouter();
  const { syncing } = useData();
  return (
    <Screen>
      <SyncBanner />
      {ITEMS.map((i) => (
        <Card key={i.href} onPress={() => router.push(i.href as never)}>
          <Row>
            <Icon name={i.icon} size={24} color={t.brand} />
            <Row style={{ flex: 1 }}>
              <T weight="700" size={17} style={{ flex: 1 }}>{i.title}</T>
              <Icon name="chevron.right" size={14} />
            </Row>
          </Row>
          <T size={13} color="sub">{i.hint}</T>
        </Card>
      ))}
      {syncing ? <T size={12} color="muted" style={{ textAlign: "center" }}>Synchronisation…</T> : null}
    </Screen>
  );
}
