import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { SymbolView, type SFSymbol } from "expo-symbols";
import { useData } from "~/data/DataProvider";
import { radius, space, useTheme } from "./theme";

export const haptic = () => void Haptics.selectionAsync().catch(() => undefined);

/* ---------- Texte ---------- */
export function T({ children, size = 15, weight = "400", color, style, numberOfLines }: { children?: React.ReactNode; size?: number; weight?: TextStyle["fontWeight"]; color?: "ink" | "sub" | "muted" | "brand" | "ok" | "bad" | "warn" | string; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  const t = useTheme();
  const c = color === undefined || color === "ink" ? t.ink : color === "sub" ? t.sub : color === "muted" ? t.muted : color === "brand" ? t.brandText : color === "ok" ? t.ok : color === "bad" ? t.bad : color === "warn" ? t.warn : color;
  return <Text numberOfLines={numberOfLines} style={[{ fontSize: size, fontWeight: weight, color: c }, style]}>{children}</Text>;
}
export const H1 = ({ children }: { children: React.ReactNode }) => <T size={28} weight="800" style={{ letterSpacing: -0.5 }}>{children}</T>;
export const H2 = ({ children }: { children: React.ReactNode }) => <T size={18} weight="700">{children}</T>;
export const Label = ({ children }: { children: React.ReactNode }) => <T size={12} weight="600" color="muted" style={{ textTransform: "uppercase", letterSpacing: 0.8 }}>{children}</T>;

/* ---------- Icônes (SF Symbols natifs) ---------- */
export function Icon({ name, size = 20, color }: { name: SFSymbol; size?: number; color?: string }) {
  const t = useTheme();
  return <SymbolView name={name} size={size} tintColor={color ?? t.sub} resizeMode="scaleAspectFit" />;
}

/* ---------- Écran ---------- */
export function Screen({ children, scroll = true, onRefresh, padBottom = 24 }: { children: React.ReactNode; scroll?: boolean; onRefresh?: () => Promise<void> | void; padBottom?: number }) {
  const t = useTheme();
  const { syncing } = useData();
  const [pulling, setPulling] = useState(false);
  const inner = { padding: space.lg, paddingBottom: padBottom, gap: space.lg } as const;
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: t.canvas }, inner]}>{children}</View>;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.canvas }}
      contentContainerStyle={inner}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={pulling && syncing} tintColor={t.brand} onRefresh={async () => { setPulling(true); await onRefresh(); setPulling(false); }} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}

/* ---------- Carte ---------- */
export function Card({ children, style, onPress, tone }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; tone?: "brand" | "ok" | "bad" | "warn" }) {
  const t = useTheme();
  const bg = tone === "brand" ? t.brandSoft : tone === "ok" ? t.okSoft : tone === "bad" ? t.badSoft : tone === "warn" ? t.warnSoft : t.surface;
  const base: ViewStyle = { backgroundColor: bg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: t.line, padding: space.lg, gap: space.sm };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return <Pressable onPress={() => { haptic(); onPress(); }} style={({ pressed }) => [base, pressed && { opacity: 0.7 }, style]}>{children}</Pressable>;
}

/* ---------- Boutons ---------- */
export function Button({ title, onPress, kind = "primary", disabled, loading, icon, small }: { title: string; onPress: () => void; kind?: "primary" | "secondary" | "danger" | "ghost"; disabled?: boolean; loading?: boolean; icon?: SFSymbol; small?: boolean }) {
  const t = useTheme();
  const bg = kind === "primary" ? t.brand : kind === "danger" ? t.bad : kind === "secondary" ? t.surface : "transparent";
  const fg = kind === "primary" || kind === "danger" ? t.onBrand : kind === "ghost" ? t.brandText : t.ink;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => { haptic(); onPress(); }}
      style={({ pressed }) => [{ backgroundColor: bg, borderRadius: radius.md, paddingVertical: small ? 8 : 13, paddingHorizontal: small ? 12 : 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 }, kind === "secondary" && { borderWidth: 1, borderColor: t.line }]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={small ? 15 : 18} color={fg} /> : null}
      <T size={small ? 13 : 16} weight="600" color={fg}>{title}</T>
    </Pressable>
  );
}

export function IconButton({ name, onPress, label, color }: { name: SFSymbol; onPress: () => void; label: string; color?: string }) {
  return (
    <Pressable accessibilityLabel={label} hitSlop={10} onPress={() => { haptic(); onPress(); }} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 6 })}>
      <Icon name={name} size={22} color={color} />
    </Pressable>
  );
}

/* ---------- Pastille / segments ---------- */
export function Chip({ label, active, onPress, color }: { label: string; active?: boolean; onPress?: () => void; color?: string }) {
  const t = useTheme();
  const bg = active ? (color ?? t.brand) : t.surface;
  return (
    <Pressable onPress={onPress ? () => { haptic(); onPress(); } : undefined} style={{ backgroundColor: bg, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 13, borderWidth: 1, borderColor: active ? bg : t.line }}>
      <T size={13} weight="600" color={active ? t.onBrand : t.sub}>{label}</T>
    </Pressable>
  );
}

export function Segmented<V extends string>({ value, options, onChange }: { value: V; options: { value: V; label: string }[]; onChange: (v: V) => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", backgroundColor: t.dark ? t.surface : "#e9e9ee", borderRadius: radius.md, padding: 3 }}>
      {options.map((o) => (
        <Pressable key={o.value} onPress={() => { haptic(); onChange(o.value); }} style={{ flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: radius.md - 3, backgroundColor: o.value === value ? (t.dark ? t.line : "#fff") : "transparent" }}>
          <T size={13} weight="600" color={o.value === value ? t.ink : t.sub}>{o.label}</T>
        </Pressable>
      ))}
    </View>
  );
}

/* ---------- Barre de progression ---------- */
export function Progress({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: t.dark ? t.line : "#ececf1", overflow: "hidden" }}>
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height, backgroundColor: color ?? t.brand }} />
    </View>
  );
}

/* ---------- Case à cocher ---------- */
export function Check({ checked, onPress, color, label }: { checked: boolean; onPress: () => void; color?: string; label: string }) {
  const t = useTheme();
  const c = color ?? t.brand;
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label} hitSlop={8} onPress={() => { haptic(); onPress(); }}>
      <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: checked ? c : t.muted, backgroundColor: checked ? c : "transparent", alignItems: "center", justifyContent: "center" }}>
        {checked ? <Icon name="checkmark" size={14} color="#fff" /> : null}
      </View>
    </Pressable>
  );
}

/* ---------- Champ ---------- */
export function Field({ label, ...props }: TextInputProps & { label?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        placeholderTextColor={t.muted}
        style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: t.ink }}
        {...props}
      />
    </View>
  );
}

/* ---------- Feuille modale ---------- */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.canvas }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: space.lg, paddingBottom: space.sm }}>
          <T size={20} weight="700">{title}</T>
          <IconButton name="xmark.circle.fill" label="Fermer" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ---------- États ---------- */
export function Empty({ icon = "tray", title, hint }: { icon?: SFSymbol; title: string; hint?: string }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: space.xl, gap: 6 }}>
      <Icon name={icon} size={30} />
      <T weight="600" color="sub">{title}</T>
      {hint ? <T size={13} color="muted" style={{ textAlign: "center" }}>{hint}</T> : null}
    </View>
  );
}

export function Row({ children, style, onPress, onLongPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; onLongPress?: () => void }) {
  const inner = <View style={[{ flexDirection: "row", alignItems: "center", gap: space.md }, style]}>{children}</View>;
  return onPress || onLongPress ? <Pressable onPress={onPress} onLongPress={onLongPress}>{inner}</Pressable> : inner;
}

export const Divider = () => {
  const t = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.line }} />;
};

/** Bandeau d'état de synchronisation (hors-ligne, écritures en attente, erreurs). */
export function SyncBanner() {
  const t = useTheme();
  const { online, pending, rejected, error, syncing } = useData();
  const msg = rejected.length ? `${rejected.length} modification${rejected.length > 1 ? "s" : ""} refusée${rejected.length > 1 ? "s" : ""} par le serveur` : !online ? (pending ? `Hors-ligne · ${pending} modification${pending > 1 ? "s" : ""} en attente` : "Hors-ligne · données enregistrées sur l'appareil") : pending ? `Envoi de ${pending} modification${pending > 1 ? "s" : ""}…` : error ? "Synchronisation impossible pour le moment" : syncing ? null : null;
  if (!msg) return null;
  const bad = rejected.length > 0 || !!error;
  return (
    <View style={{ backgroundColor: bad ? t.badSoft : t.warnSoft, borderRadius: radius.md, padding: space.md, flexDirection: "row", gap: 8, alignItems: "center" }}>
      <Icon name={online ? "arrow.triangle.2.circlepath" : "wifi.slash"} size={16} color={bad ? t.bad : t.warn} />
      <T size={13} weight="600" color={bad ? t.bad : t.warn} style={{ flex: 1 }}>{msg}</T>
    </View>
  );
}

export function Loading() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.canvas }}>
      <ActivityIndicator color={t.brand} />
    </View>
  );
}
