/**
 * Connexion bancaire directe : offre à 3 € / mois, encore en développement.
 * Verrouillée pour tout le monde sauf les profils listés dans BANK_BETA_EMAILS (adresses séparées par des virgules, variable d'environnement serveur).
 */
export function isBankBeta(email: string | null | undefined) {
  if (!email) return false;
  const allowed = (process.env.BANK_BETA_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

/** Vrai quand un fournisseur de connexion bancaire est configuré côté serveur (clés API présentes). */
export function bankProviderConfigured() {
  return Boolean(process.env.BANK_PROVIDER_APP_ID && process.env.BANK_PROVIDER_KEY);
}
