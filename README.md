# Actifs

Hub personnel gratuit pour organiser tâches & projets, listes de courses partagées, recettes, routines, calendrier et finances — en couple ou seul(e).

## Stack

- Next.js 14 (App Router, Server Actions) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, RLS) — **projet Supabase dédié** (`actifs` / `kqmckpauxlujowqmheso`), entièrement séparé de tes autres projets Supabase
- Hébergement code : GitHub — déploiement recommandé : **Vercel** (connecté au repo GitHub, gratuit, gère le SSR/Server Actions de Next.js). GitHub Pages ne peut pas héberger ce site car il nécessite un serveur (auth, actions serveur) — seul le code source vit sur GitHub.

## Démarrer en local

```bash
npm install
cp .env.local.example .env.local   # déjà rempli avec le projet Supabase dédié à Actifs
npm run dev
```

## Déploiement (Vercel)

1. Importer le repo GitHub `Elr0ssi/Actifs` sur [vercel.com/new](https://vercel.com/new)
2. Ajouter les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Déployer — chaque push sur `main` republie automatiquement.

## Base de données

Projet Supabase 100% dédié à Actifs (aucune table partagée avec tes autres projets). Le schéma `public` contient toutes les tables (foyers, profils, projets, tâches, listes, recettes, routines, finances…), avec Row Level Security : chaque foyer ne voit que ses propres données. Un déclencheur crée automatiquement un foyer à l'inscription ; la fonction `join_household(code)` permet de rejoindre le foyer d'un·e partenaire via un code d'invitation (visible dans Paramètres).

## Fonctionnalités

- **Tâches & projets** : priorités, statuts, regroupement par projet
- **Listes** : checklists partagées par catégorie, import brut (colle un texte → checklist), articles cochés conservés dans la liste
- **Recettes** : ingrédients préréglés → génération en un clic d'une liste de courses, notes d'emplacement d'achat
- **Routines** : quotidiennes/hebdomadaires, cochables, visibles dans le calendrier et le dashboard
- **Calendrier** : routines, tâches, échéances financières ; calcul du cumul de charges/revenus entre deux dates
- **Finance** : charges récurrentes, revenus programmés, investissements, tableau de flux en direct sur 60 jours. La connexion bancaire directe nécessite un partenaire Open Banking agréé (Powens, Bridge…) — non branchée pour l'instant, la base est prête à l'accueillir.
