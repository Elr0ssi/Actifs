# Audit du projet Flozea en vue de l'application iPhone native

> Audit réalisé sur le code réel du dépôt (`Elr0ssi/Actifs`) et sur les **métadonnées** (lecture seule) du projet Supabase `kqmckpauxlujowqmheso`. Aucune donnée utilisateur n'a été lue, aucune table n'a été modifiée.
> Légende : ✅ vérifié dans le code · ⚠️ point d'attention · ❌ absent.

## 1. Architecture actuelle

| Sujet | Constat |
|---|---|
| Framework | ✅ Next.js **14.2.35**, App Router, Server Actions, `middleware.ts` (locale + session Supabase) |
| React / TS | ✅ React **18.3.1**, TypeScript 5 `strict` |
| Style | ✅ Tailwind 3.4 (palette pilotée par variables CSS : accent + clair/sombre) |
| Gestionnaire de paquets | ✅ npm (`package-lock.json`) |
| Dépendances notables | `@supabase/ssr`, `@supabase/supabase-js`, `date-fns`, `clsx`, `geist`, `@vercel/analytics` |
| Hébergement | ⚠️ `README.md` et `vercel.json` (région `lhr1`) indiquent **Vercel** ; vous parlez de **Hostinger**. Un Next.js avec Server Actions + middleware ne tourne pas sur un hébergement statique Hostinger. À clarifier (cela n'empêche pas l'appli mobile : elle ne dépend que de Supabase). |
| Base de données | ✅ Supabase (projet `kqmckpauxlujowqmheso`, eu-west-2). L'autre projet du compte (`umqksphaqhyairdchcxk`) n'a aucun lien et n'est pas touché. |
| Données | ✅ Toutes les requêtes passent par `@supabase/ssr` avec la clé **anon** + cookie de session ; la sécurité repose sur la **RLS**. Aucune clé `service_role` dans le code (recherche exhaustive). |
| Migrations | ⚠️ **Aucun dossier de migrations dans le dépôt** : le schéma n'existe que dans Supabase. Rien ne le recrée à partir du Git. |
| Realtime | ❌ Aucun usage dans le code, et **aucune table dans la publication `supabase_realtime`**. |
| Notifications | ❌ Aucune (ni web push, ni service worker, ni e-mail applicatif). |
| PWA | `app/manifest.ts` existe (métadonnées d'installation web), pas de service worker. Non utilisé pour l'app native. |

### Structure du dépôt
- `app/(site)/[lang]/…` : site vitrine localisé (fr/en/es/de), SEO, recettes, idées, FAQ.
- `app/(main)/…` : connexion/inscription et application connectée sous `/app` (tableau de bord, `tasks`, `calendar`, `finance`, `lists`, `notes`, `settings`).
- `app/api/calendar/[token]` (flux iCal via RPC `calendar_feed`), `app/api/wallet/[token]` (réception de paiements Apple Wallet via RPC `ingest_wallet_txn`), `app/auth/callback` (échange du code OAuth Google).
- `components/` : UI web (React DOM + Tailwind) → **non réutilisable en natif**.
- `lib/` : logique ; une grande partie est **TypeScript pur** (voir §3).

## 2. Inventaire réel des fonctionnalités (vérifié dans le code)

| Domaine | Présent | Détail vérifié |
|---|---|---|
| Authentification | ✅ | e-mail + mot de passe (`signInWithPassword`, `signUp` avec `display_name`), déconnexion, Google OAuth (`app/auth/callback` → `exchangeCodeForSession`), changement de mot de passe. Trigger `on_auth_user_created` → `handle_new_user()` crée profil + foyer. |
| Foyer partagé | ✅ | `households` + `invite_code`, RPC `join_household(code)`. Tout est cloisonné par `household_id`. |
| Tâches | ✅ | `tasks` (priorité low/medium/high, statut todo/doing/done, `due_date`, `due_time`, `due_end`, projet, description). Projets (`projects`, archivage). Création, édition, suppression, cocher. |
| Routines | ✅ | `routines` (`frequency` daily/weekly, `days_of_week` 0=dimanche…6, archivage `active`, suppression définitive) + `routine_logs` (une ligne par routine/jour/utilisateur, upsert sur `routine_id,log_date,user_id`). Série (« streak ») : `routineStreak`. |
| Objectifs | ⚠️ | Il n'existe **pas** de module « Objectifs » générique. Ce qui existe : objectifs d'épargne / investissement (`households.savings_goal`, `investment_goal`), mode d'épargne (`savings_mode`: fixed/percent), progression des projets (tâches faites / total). |
| Agenda / calendrier | ✅ | Tâches avec heure (grille semaine/jour/mois), routines cochables, flux iCal en lecture seule. Pas de table « événements » distincte : un événement = une tâche avec `due_time`/`due_end`. |
| Finances | ✅ | Moteur complet `lib/finance-engine.ts` : opérations récurrentes (revenus, charges fixes, variables, épargne), consommation quotidienne via paiements carte (`transactions`), soldes par compte (Courant / Épargne / Investissement via `balance_entries`), reste à vivre, solde projeté, enveloppes, règle week-end, report/saut d'occurrences, impôts (`tax-fr.ts`). |
| Budgets | ✅ | `variable_budgets` (enveloppes), `getMonthlyBudget`, `getEnvelopes` (absorption des paiements carte par les budgets variables). |
| Revenus | ✅ | `incomes` (récurrents ou non, statut, règle week-end). |
| Comptes & épargne | ✅ | `balance_entries.account`, objectifs, investissements (`investments`). |
| Opérations | ✅ | `recurring_charges` + `incomes` + `transactions`. |
| Courses | ✅ | `lists` (type generic/shopping/recipe), `list_items` (quantités normalisées, prix, `ingredient_id`), `item_locations` (rayons), composition d'une liste depuis des recettes (`list_recipes`, quantités par personne). |
| Recettes | ✅ | `recipes` + `recipe_items` (qty/unité analysées par `ingredient-parse.ts`), favoris, import depuis le catalogue d'inspiration (`source_slug`). |
| Menu / planning repas | ✅ | `menu_items` (`day`, `slot` midi/soir, `servings`). |
| Notes | ✅ | `notes` (pages hiérarchiques, `blocks` JSON), `vocab_words`. |
| Banque | ⚠️ | Connexion bancaire « en développement » (`bank_connections`) ; l'ingestion réelle passe par Apple Wallet (`wallet_token`). |
| Tableau de bord | ✅ | Système de **widgets web** configurables (27 types, tailles s/m/l/xl) sauvegardés dans `profiles.widget_layouts`. |
| Paramètres | ✅ | Profil, foyer, langue (cookie `flozea-lang`), apparence (thème + accent), jetons iCal / Wallet. |

### Navigation web (référence pour l'app)
Tableau de bord · Tâches (liste, calendrier, routines) · Finance (vue d'ensemble, calendrier, opérations, budgets, paiements, comptes, impôts) · Listes (mes listes, recettes, ingrédients) · Notes · Paramètres.

## 3. Matrice de réutilisation web → natif

| Élément | Réutilisable tel quel en natif ? | Décision |
|---|---|---|
| `lib/finance-engine.ts` (516 l., pur) | ✅ oui (n'importe que `lib/i18n`) | **Partagé** (alias Metro vers la racine) |
| `lib/i18n/index.ts` (types + `translate`, tableaux de jours/mois) | ✅ pur | Partagé (le mobile appelle `setUiLocale`) |
| `lib/shopping.ts`, `lib/packs.ts`, `lib/ingredient-parse.ts`, `lib/notes.ts`, `lib/tax-fr.ts`, `lib/wallet.ts`, `lib/finance.ts`, `lib/types.ts` | ✅ purs | Partagés |
| `lib/utils.ts` | ⚠️ `todayISO()` utilise **UTC** (voir §5, bug de fuseau) | Le mobile a sa propre date locale ; `formatEUR`/`cx` partagés si besoin |
| `lib/data/finance.ts`, `lib/data/widgets.ts`, `lib/data/context.ts` | ❌ liés à `react.cache` + client Supabase serveur + cookies | La partie « lignes SQL → `FinOp` » est extraite dans un module pur partagé (`lib/finance-load.ts`) ; les requêtes sont réécrites côté mobile |
| `lib/supabase/{client,server,middleware}.ts` | ❌ `@supabase/ssr`, `next/headers`, cookies | Remplacés par `@supabase/supabase-js` + stockage sécurisé iOS |
| Server Actions (`'use server'`, `revalidatePath`) | ❌ | Remplacées par des mutations directes Supabase (anon + session), mêmes règles de validation |
| `components/**` (React DOM, Tailwind, `next/*`) | ❌ | Réécrits en React Native avec les mêmes tokens de couleur |
| `lib/widgets/registry.ts` | ⚠️ importe un type d'icône web | Non utilisé (les widgets iOS sont natifs) |
| `lib/marketing/**`, `lib/i18n/dict/*` | ❌ / ⚠️ | Contenu vitrine : hors périmètre |

## 4. Base de données, RLS, fonctions (métadonnées Supabase)

**27 tables publiques, RLS activée sur toutes** : `balance_entries, bank_connections, finance_categories, forecast_snapshots, households, incomes, ingredient_prices, ingredients, investments, item_locations, list_items, list_recipes, lists, menu_items, notes, profiles, projects, recipe_items, recipes, recurring_charges, routine_logs, routines, tasks, tax_profiles, transactions, variable_budgets, vocab_words`.

- **Modèle d'isolation** : politiques `household_id = current_household_id()` (fonction `SECURITY DEFINER` qui lit le foyer du profil de `auth.uid()`), tables enfants via `EXISTS` sur le parent. Ingrédients/prix « globaux » lisibles quand `household_id IS NULL`. Cet isolement est identique pour le web et le mobile puisque les deux utilisent la clé anon + JWT utilisateur.
- **Fonctions `SECURITY DEFINER` exposées** : `join_household(code)`, `ingest_wallet_txn(token, …)`, `calendar_feed(token)` (anon + authenticated, protégées par jeton), `handle_new_user()` (trigger), `current_household_id()`.
- ⚠️ `tax_profiles` et `vocab_words` : politiques sans `WITH CHECK` (un utilisateur pourrait écrire une ligne vers un autre foyer s'il connaît son UUID). Non exploitable facilement (UUID), mais à corriger par migration validée — **non appliquée**.
- ⚠️ `households` contient `ical_token` et `wallet_token` (secrets de flux) lisibles par tout membre du foyer : l'app mobile ne doit ni les journaliser ni les mettre en cache hors Keychain ; le cache hors-ligne les exclut.
- **Realtime** : publication vide. Pour une mise à jour instantanée web ↔ mobile il faudrait `alter publication supabase_realtime add table …` (migration à **valider par vous**, non appliquée). En attendant : rafraîchissement à l'ouverture, au retour au premier plan, au pull-to-refresh et après chaque mutation.

## 5. Dates, fuseaux, routines récurrentes
- Les dates métier sont des chaînes `YYYY-MM-DD` (type SQL `date`), sans fuseau. Les heures sont `time` sans fuseau (heure murale).
- Le moteur financier calcule en UTC sur ces chaînes (`toMs`, `addDays`) : correct tant que la « date du jour » fournie est la date **locale** de l'utilisateur.
- ⚠️ **Bug existant côté web** : `todayISO()` = `new Date().toISOString().slice(0,10)` donne la date **UTC**. En France, entre 00:00 et 01:00/02:00 la date du jour est celle de la veille (tâches « du jour », routines, solde). Le mobile utilise la date **locale de l'appareil** (`localISO`). Le correctif web est volontairement **non appliqué** (hors périmètre, pour ne pas modifier le site) — à décider.
- Routines : `scheduledOn(r, d)` = quotidienne, ou hebdomadaire avec `days_of_week` contenant le jour (0 = dimanche, `getUTCDay`). Une routine n'est due qu'à partir de sa date de création (utilisé pour la série).
- Cohérence `routine_logs` : un log « fait » = ligne `done=true` ; « défaire » = suppression de la ligne de l'utilisateur courant.

## 6. Dépendances web-only et compatibilité Expo / React Native

| Dépendance / API | Compatible RN ? | Remplacement |
|---|---|---|
| `next/*`, `react-dom`, Tailwind, `geist`, `@vercel/analytics` | ❌ | Non utilisés par le mobile |
| `@supabase/ssr` | ❌ (cookies) | `@supabase/supabase-js` + adaptateur `expo-secure-store` |
| `Intl.NumberFormat` / `toLocaleDateString` | ✅ (Hermes, Intl intégré) | tel quel |
| `date-fns` | ✅ | optionnel |
| `Buffer` (dans `getSessionUser`) | ❌ | non utilisé côté mobile (la session vient de supabase-js) |
| `window`, `localStorage`, `document` | ❌ | AsyncStorage / SecureStore |

Aucun bloqueur majeur : le métier est dans Supabase + du TypeScript pur. Les points durs sont **WidgetKit** (Swift obligatoire, non testable hors Mac/iPhone) et la **distribution** (compte Apple Developer payant, EAS).

## 7. Sécurité des données financières
- Clé **anon** uniquement (publique par conception) ; toute la protection est la RLS. La clé `service_role` ne doit **jamais** entrer dans l'app mobile (confirmé : jamais utilisée dans le dépôt).
- Session mobile stockée dans le **Keychain iOS** (`expo-secure-store`) ; le cache hors-ligne contient des données financières → stocké dans le sandbox de l'app (protégé par le chiffrement iOS de l'appareil), effaçable à la déconnexion.
- Widgets : l'extension lit un instantané partagé via **App Group** ; option « masquer les montants » pour que l'écran verrouillé n'expose pas les finances.
- `.env.local` existe en local (non versionné) ; l'app mobile n'a besoin que de `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` (valeurs publiques identiques à `NEXT_PUBLIC_*`).

## 8. Architecture cible

**Choix : ajout d'un dossier `mobile/` dans le dépôt existant (monorepo léger), le site web reste à la racine, intact.**

Pourquoi : déplacer le site vers `web/` casserait la configuration de déploiement (Vercel/Hostinger, racine du projet) — exactement ce qu'il faut éviter. Un dépôt séparé dupliquerait la logique financière (risque de divergence). `mobile/` + alias Metro vers `lib/` partage le code sans rien déplacer.

```
/                      ← site Next.js (inchangé, déploiement inchangé)
├─ lib/                ← logique pure partagée (finance-engine, shopping, i18n…)
├─ mobile/             ← application Expo (iOS) — nouveau
│  ├─ app/             ← routes expo-router (onglets)
│  ├─ src/             ← data (Supabase), cache hors-ligne, UI, notifications, widgets
│  ├─ targets/widgets/ ← extension WidgetKit (SwiftUI) via @bacons/apple-targets
│  └─ eas.json, app.config.ts
└─ docs/               ← audit, architecture, guide TestFlight
```

- Le web exclut `mobile/` de son `tsconfig.json` / ESLint : le build Next n'est pas affecté.
- Alias : `@/…` (racine, code partagé, compatible avec le code web existant) et `~/…` (code propre au mobile).
- Données : client `supabase-js` (anon + session utilisateur) ; repli lecture hors-ligne (cache), file d'attente d'écritures idempotentes ; rafraîchissement (focus, retour premier plan, pull-to-refresh, minuteur) ; Realtime activable plus tard après migration validée.
- Widgets : l'app écrit un **instantané JSON** dans l'App Group (`UserDefaults(suiteName:)` via `ExtensionStorage`) et demande `reloadAllTimelines()` ; l'extension SwiftUI ne fait aucun appel réseau avec des secrets.
- Notifications : locales (`expo-notifications`), recalculées à chaque synchronisation.
- Build : EAS Build (profils development / preview / production), TestFlight via EAS Submit — **non déclenchés sans votre accord**.

## 9. Plan de migration (phases)
1. Audit (ce document) ✔
2. Socle `mobile/` + alias partagés + garde-fous web ✔
3. Auth + navigation + écrans (tableau de bord, tâches, routines, agenda, finances, courses, recettes, repas, réglages)
4. Couche données : cache, file d'attente, rafraîchissement
5. Widgets WidgetKit (5 familles)
6. Notifications locales
7. EAS / TestFlight (documentation + config)
8. Tests unitaires (moteur finance, routines, file d'attente, notifications, isolation) et validations d'export

## 10. Liste de tests manuels (sur iPhone, à faire par vous)
1. Connexion avec un compte existant du site : mêmes tâches/routines/finances visibles.
2. Créer une tâche sur iPhone → visible sur le site après rafraîchissement ; inverse idem.
3. Cocher une routine sur iPhone → coche visible sur le site, série correcte.
4. Mode avion : lecture du cache, création en attente, resynchronisation au retour réseau, pas de doublon.
5. Reste à vivre / solde projeté identiques à la page Finance du site pour une même date.
6. Courses : cocher un article, retrouver l'état sur le site.
7. Widgets : ajout de chaque widget, mise à jour après modification dans l'app, option « masquer les montants », comportement écran verrouillé.
8. Notifications : autorisation iOS, rappel de tâche, rappel de routine, heures calmes.
9. Déconnexion : cache et instantané des widgets effacés.
10. Deux comptes de foyers différents : aucune fuite de données entre eux.

## 11. Blocages et décisions à prendre
| # | Sujet | Statut |
|---|---|---|
| B1 | Compte **Apple Developer** (99 €/an) + identifiant de bundle + compte Expo/EAS | À faire par vous (aucune dépense engagée) |
| B2 | **Realtime** : migration d'ajout de tables à `supabase_realtime` | Proposée, non appliquée — votre validation |
| B3 | Durcissement RLS `tax_profiles` / `vocab_words` (`WITH CHECK`) | Proposé, non appliqué |
| B4 | URL de redirection Supabase pour l'OAuth Google mobile (schéma `flozea://`) | À ajouter dans Supabase > Auth > URL Configuration |
| B5 | Hébergement : Vercel (README) ou Hostinger ? | À clarifier, sans impact sur le mobile |
| B6 | WidgetKit : code Swift **compilable uniquement sur Mac / EAS** — non vérifiable dans ce conteneur Linux | Compilation et test réels via EAS puis iPhone |
| B7 | Bug `todayISO()` (UTC) côté site | Signalé, non corrigé |

---

## Annexe — suite donnée à cet audit
- Architecture retenue et fonctionnement : `docs/ios-architecture.md`
- Distribution (Apple Developer, EAS, TestFlight) : `docs/ios-testflight.md`
- Migrations Supabase proposées (non appliquées) : `docs/ios-proposed-migrations.sql`
- Point additionnel pour une publication App Store (pas pour TestFlight) : suppression de compte dans l'app et
  « Se connecter avec Apple » (voir `docs/ios-testflight.md` §6).
