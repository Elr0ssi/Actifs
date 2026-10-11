import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { missingEnv } from "~/lib/env";
import { useAuth } from "~/auth/AuthProvider";
import { Button, Card, Field, Segmented, T } from "~/ui/kit";
import { useTheme } from "~/ui/theme";

export default function Login() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp, signInWithGoogle, status } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    const err = mode === "in" ? await signIn(email, password) : await signUp(email, password, name);
    setBusy(false);
    if (err) setMsg(err);
  };

  const missing = missingEnv();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.canvas }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24, gap: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", gap: 8 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: t.brand, alignItems: "center", justifyContent: "center", flexDirection: "row", flexWrap: "wrap", padding: 14, gap: 4 }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "rgba(255,255,255,.55)" }} />
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "rgba(255,255,255,.55)" }} />
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff" }} />
          </View>
          <T size={32} weight="800" style={{ letterSpacing: -0.8 }}>Flozea</T>
          <T color="sub" style={{ textAlign: "center" }}>Agenda, routines, courses et finances — au même endroit.</T>
        </View>

        {status === "misconfigured" ? (
          <Card tone="bad">
            <T weight="700" color="bad">Configuration manquante</T>
            <T size={13} color="bad">Définis dans mobile/.env (ou dans les variables EAS) : {missing.join(", ")}. Ce sont les valeurs publiques de ton projet Supabase.</T>
          </Card>
        ) : null}

        <Segmented value={mode} onChange={setMode} options={[{ value: "in", label: "Connexion" }, { value: "up", label: "Inscription" }]} />

        <View style={{ gap: 14 }}>
          {mode === "up" ? <Field label="Prénom" value={name} onChangeText={setName} autoCapitalize="words" textContentType="givenName" /> : null}
          <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" />
          <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry textContentType={mode === "in" ? "password" : "newPassword"} onSubmitEditing={submit} />
        </View>

        {msg ? <T size={13} color="bad">{msg}</T> : null}
        <Button title={mode === "in" ? "Se connecter" : "Créer mon compte"} onPress={submit} loading={busy} disabled={status === "misconfigured"} />
        <Button title="Continuer avec Google" kind="secondary" icon="globe" disabled={status === "misconfigured"} onPress={async () => { setMsg(null); const e = await signInWithGoogle(); if (e) setMsg(e); }} />
        <T size={12} color="muted" style={{ textAlign: "center" }}>Même compte que sur flozea.com : tes données se synchronisent automatiquement.</T>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
