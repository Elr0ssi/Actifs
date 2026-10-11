# Flozea — application iPhone (Expo)

Application native iOS (React Native + TypeScript strict) branchée sur le même projet Supabase que le site.
Voir `../docs/ios-architecture.md` (architecture), `../docs/ios-app-audit.md` (audit) et `../docs/ios-testflight.md` (distribution).

```bash
cd mobile
cp .env.example .env     # puis renseigner EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY (valeurs publiques)
npm install
npm test                 # logique métier, synchronisation, confidentialité, rendu des écrans
npm run typecheck        # tsc --noEmit (strict)
npm run export:ios       # valide le bundle JS iOS
npx expo start --dev-client   # nécessite un development build (widgets impossibles dans Expo Go)
```

Dossiers : `app/` routes (expo-router) · `src/core` logique pure testée · `src/data` Supabase, cache, file d'écritures ·
`src/native` notifications et pont widgets · `src/ui` composants · `targets/widgets` extension WidgetKit (SwiftUI).
