# Distribuer Flozea sur iPhone (TestFlight) — pas à pas

Rien n'est publié ni payé automatiquement. Les étapes marquées 👤 nécessitent **vos** comptes ; je n'ai créé ni compte, ni
identifiant, ni certificat.

## 0. Pré-requis
| | |
|---|---|
| 👤 Apple Developer Program | 99 €/an, https://developer.apple.com/programs/ (obligatoire pour TestFlight et les widgets sur appareil réel) |
| 👤 Compte Expo (gratuit) | https://expo.dev — EAS Build a un quota gratuit ; les builds iOS peuvent être mis en file d'attente |
| Un iPhone sous iOS 17+ | les widgets exigent iOS 17 |
| Un Mac | **non requis** : EAS compile dans le cloud |

## 1. Identifiants à choisir (👤)
- **Bundle ID** : `com.flozea.app` est un identifiant **provisoire** (variable `IOS_BUNDLE_ID`). Il doit vous appartenir
  (ex. `com.votrenom.flozea`). Le widget utilise `<bundle id>.widget`, l'App Group est `group.<bundle id>` — tout est dérivé.
- **Team ID Apple** : developer.apple.com › Membership › Team ID → variable `APPLE_TEAM_ID`.

## 2. Variables d'environnement (valeurs publiques, jamais de clé service_role)
Dans `mobile/.env` pour le développement local (modèle : `mobile/.env.example`) **et** dans EAS (`eas env:create` ou expo.dev › Environment variables) :

| Variable | Valeur |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | la même que `NEXT_PUBLIC_SUPABASE_URL` du site |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | la même que `NEXT_PUBLIC_SUPABASE_ANON_KEY` du site |
| `IOS_BUNDLE_ID` | votre identifiant de bundle |
| `APPLE_TEAM_ID` | votre Team ID |
| `EAS_PROJECT_ID` | rempli par `eas init` |

Si une des deux premières manque, l'écran de connexion affiche « Configuration manquante » en nommant la variable.

## 3. Redirections Supabase (👤) — Authentication › URL Configuration
Ajouter à « Redirect URLs » : `flozea://auth-callback` (retour de la connexion Google et des liens de confirmation e-mail).
Google OAuth utilise le fournisseur déjà configuré pour le site ; vérifier que le client Google autorise le retour Supabase.

## 4. Premier build (depuis `mobile/`)
```bash
cd mobile
npm install
npm i -g eas-cli            # une fois
eas login                   # 👤 votre compte Expo
eas init                    # 👤 crée le projet EAS -> EAS_PROJECT_ID
eas build --profile development --platform ios   # 👤 demande vos identifiants Apple, crée certificats, profils, App Group, capacités
```
EAS crée/associe automatiquement : App ID de l'app et du widget, **App Group** `group.<bundle id>`, certificat de distribution,
profils de provisioning. Vous validez avec votre Apple ID (2FA). Installez ensuite le build sur votre iPhone
(`eas device:create` pour enregistrer l'appareil lors d'une distribution *internal*).

## 5. TestFlight
```bash
eas build --profile production --platform ios   # build App Store (numéro de build auto-incrémenté)
eas submit --profile production --platform ios  # 👤 envoie à App Store Connect
```
Avant : créer l'app dans **App Store Connect** (👤 Mes apps › + › Nouvelle app, même bundle ID). Puis TestFlight › groupe de
testeurs internes (jusqu'à 100, sans revue Apple) → vous recevez l'invitation dans l'app TestFlight.
Les testeurs *externes* demandent une courte revue Apple.

## 6. Avant une publication App Store (non nécessaire pour TestFlight interne)
- **Suppression de compte dans l'app** (guideline 5.1.1(v)) : à concevoir (voir `docs/ios-proposed-migrations.sql` §3).
- **Connexion Google** : l'App Store (guideline 4.8) peut exiger « Se connecter avec Apple » à côté de Google.
- **Politique de confidentialité** (URL publique) et fiche « Confidentialité de l'app » (e-mail, données financières saisies).
- Captures d'écran 6,7" / 6,1", description, catégorie, âge.
- Je ne publie rien sur l'App Store sans votre accord explicite.

## 7. Tests sur l'appareil à faire par vous
Voir `docs/ios-app-audit.md` §10 (liste complète). Particulièrement : widgets (ajout depuis l'écran d'accueil), notifications,
mode avion, deux appareils / site + iPhone.

## 8. Développement local
- `npm test` / `npm run typecheck` / `npm run export:ios` (validation du bundle JS sous Linux/macOS) dans `mobile/`.
- Les widgets et App Group **ne fonctionnent pas dans Expo Go** : utiliser un *development build* (`eas build --profile development`).
