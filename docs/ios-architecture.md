# Application iPhone Flozea — architecture

Application **native** (Expo / React Native / TypeScript strict) : pas une PWA, pas une WebView.
Elle vit dans `mobile/` du même dépôt et parle **directement au même projet Supabase** que le site
(`kqmckpauxlujowqmheso`), avec les mêmes comptes et les mêmes données. Le site (racine du dépôt) n'a pas été déplacé
et son déploiement n'est pas modifié.

## Schéma

```
 iPhone (Expo)                              Site (Next.js, inchangé)
 ┌────────────────────────────┐             ┌──────────────────────┐
 │ Écrans RN  ←→  DataProvider│             │ Server Actions       │
 │  cache (AsyncStorage)      │             └─────────┬────────────┘
 │  file d'écritures          │                       │
 │  supabase-js (clé anon)    │──── HTTPS ────────────┤
 └─────────┬──────────────────┘                       ▼
           │ App Group (UserDefaults)         Supabase (Postgres + RLS + Auth)
           ▼
 Widgets WidgetKit (SwiftUI, sans réseau)
```

## Code partagé (sans rien déplacer)
Metro / TypeScript résolvent `@/…` vers la racine du dépôt (voir `mobile/metro.config.js`, `mobile/tsconfig.json`) :

| Module du site réutilisé | Usage mobile |
|---|---|
| `lib/finance-engine.ts` | récurrences, soldes, reste à vivre, enveloppes — **identique au site** |
| `lib/finance-load.ts` (nouveau, extrait de `lib/data/finance.ts`) | lignes SQL → état financier ; le site l'utilise aussi |
| `components/app/widgets/helpers.ts` | `scheduledOn`, `routineStreak`, priorités |
| `lib/types.ts`, `lib/wallet.ts` (`parseAmount`), `lib/utils.ts` (`formatEUR`), `lib/i18n` | types, formats |

Tout le reste du mobile est propre à `mobile/` (UI native, stockage, réseau, notifications, widgets).
`mobile/` est exclu du `tsconfig.json` et d'ESLint du site : le build Next.js n'est pas affecté.

## Synchronisation (même compte, mêmes données)
- **Lecture** : `mobile/src/data/fetch.ts` — mêmes tables et mêmes fenêtres de dates que le tableau de bord du site, toutes
  filtrées par `household_id`; la RLS de Supabase reste la protection réelle. Les jetons `ical_token` / `wallet_token`
  du foyer **ne sont jamais lus**.
- **Écriture** : chaque action est une opération idempotente (`upsert` avec identifiant généré sur l'appareil, `patch` champ
  par champ, `delete`) ajoutée à une **file** puis envoyée immédiatement (`src/data/DataProvider.tsx`).
  Hors-ligne, la file est conservée (AsyncStorage) et partie au retour du réseau, sans doublon possible au rejeu.
- **Affichage** : état serveur + écritures en attente rejouées par-dessus (`core/outbox.ts`) → l'interface réagit tout de suite.
- **Conflits** : dernier écrit gagne, champ par champ (un patch ne touche que ses champs) ; une suppression l'emporte ;
  une écriture refusée par le serveur (RLS, contrainte) est abandonnée, signalée par un bandeau, et l'état serveur fait foi.
- **Mise à jour depuis le site** : relecture à l'ouverture, au retour au premier plan (si > 15 s), au retour du réseau,
  toutes les 90 s au premier plan et au tirage vers le bas. **Pas de Realtime** : aucune table n'est publiée dans
  `supabase_realtime` (voir `docs/ios-proposed-migrations.sql`, non appliqué).
- **Fuseaux** : les dates métier sont des `AAAA-MM-JJ` en **heure locale de l'appareil** (`core/dates.ts`) ; le site utilise
  l'UTC pour « aujourd'hui » (écart de 1–2 h après minuit en France, voir audit §5).

## Sécurité
- Seules l'URL et la clé **anon** publiques sont embarquées (`EXPO_PUBLIC_*`). Jamais de `service_role`
  (un test automatique le vérifie : `mobile/__tests__/sync.test.ts`).
- Session dans le Keychain iOS (`expo-secure-store`, découpée en morceaux). Cache hors-ligne dans le bac à sable de l'app.
- Déconnexion : cache, file, instantané des widgets et notifications planifiées sont effacés.
- Aucune migration, aucune table créée ni modifiée dans Supabase.

## Widgets (WidgetKit)
`mobile/targets/widgets/` (SwiftUI) via `@bacons/apple-targets` : 5 widgets — **Routines** (S, M, cercle écran verrouillé),
**Tâches** (S, M, L, rectangle écran verrouillé), **Finances** (S, M), **Courses** (S, M, L), **Planning** (M, L).
- L'app écrit un instantané JSON (`core/snapshot.ts`) dans l'App Group `group.<bundle id>` puis appelle `reloadAllTimelines`.
  L'extension ne fait **aucun appel réseau** et ne possède aucune clé.
- **Confidentialité** : Réglages › Widgets › « Masquer les montants » → l'instantané ne contient plus aucun chiffre financier
  (vérifié par test). Les widgets finances n'existent pas sur l'écran verrouillé.
- **Limites iOS** : le système décide du rythme réel de rafraîchissement (budget limité) ; un widget peut avoir quelques
  minutes de retard et affiche « Ouvre Flozea pour actualiser » si l'instantané date de la veille. Un tap ouvre l'app sur
  l'écran correspondant (`flozea://tasks`, `/routines`, `/finance`, `/agenda`, `/lists/<id>`). Pas de widget interactif
  (cocher depuis le widget demanderait un réseau + un secret dans l'extension : volontairement écarté).
- **Prérequis** : iOS 17+ pour les widgets. Impossible à tester dans Expo Go : build de développement ou TestFlight.

## Notifications
Locales uniquement (`expo-notifications`) — aucun serveur de push, aucun coût. Plan calculé par une fonction pure testée
(`core/notify-plan.ts`) à chaque changement de données : rappel d'une tâche à heure fixe (X min avant), rappel matinal des
tâches du jour sans heure, rappel quotidien des routines restantes ; interrupteurs par type, **heures calmes** (alerte
repoussée à la fin de la plage), autorisation iOS demandée depuis les Réglages, repli vers les Réglages iOS si refusée.
Limite iOS de 64 notifications planifiées respectée (60 max, 7 jours d'horizon).
Les rappels sont recalculés quand l'app s'ouvre ou se synchronise : si aucune ouverture pendant plus de 7 jours, ils s'arrêtent.

## Ce qui est volontairement hors de l'app (pour l'instant)
Notes, vocabulaire, impôts, connexion bancaire, jetons Wallet/iCal, import du catalogue de recettes d'inspiration,
composition de liste depuis des recettes avec quantités par personne (les ingrédients sont ajoutés tels quels),
gestion des projets, widgets configurables du tableau de bord web.
