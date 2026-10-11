# Site vitrine mobile : audit, corrections et mesures

Branche `claude/web-mobile-perf`, partie de la branche de production (`claude/modest-feynman-okaf3t`, déploiement Vercel `1521266`).
Ne touche ni `mobile/`, ni Supabase, ni les variables d'environnement, ni le déploiement.

## Causes réelles des lenteurs (classées par impact)

| # | Cause | Preuve |
|---|---|---|
| 1 | **Le hero était invisible tant que React n'avait pas démarré.** `FadeIn` rendait ses enfants en `opacity-0` dans le HTML et ne les affichait qu'après hydratation + IntersectionObserver. Titre, texte, boutons et aperçu de l'accueil restaient masqués (écran « vide ») pendant le téléchargement et l'exécution du JavaScript. Le premier élément visible était… le bandeau cookies. | Lighthouse : élément LCP = bandeau cookies, 3,5 s de « render delay » ; Playwright : opacité du titre à l'événement `load` = 0 |
| 2 | **Boucle `requestAnimationFrame` permanente** dans la frise (`TimelinePath`) : mesure de layout + `getTotalLength()` + `getPointAtLength()` à chaque image, dès l'ouverture de la page, même hors écran et sans mouvement. Idem pour la rotation du logo (`ConvergeStage`) qui continuait à re-rendre toutes les 2,8 s hors écran. | lecture du code (`components/marketing/wow-sections.tsx`) |
| 3 | **DOM dupliqué mobile / bureau** : la section figée et la frise envoyaient, hydrataient et mettaient en page les deux versions (une cachée en CSS) : 1 664 nœuds, dont ~490 inutiles sur téléphone. | comptage du DOM |
| 4 | **Effets visuels coûteux sur iPhone** : 12 halos `blur(90–120 px)` sur de grandes surfaces, animations de décor permanentes (`fx-drift`, `fx-gradient` qui anime `background-position`), `backdrop-filter` sur l'en-tête collant. | Lighthouse « non-composited animations », lecture du CSS |
| 5 | **Préchargement massif** : chaque lien entrant dans l'écran était préchargé (~40 Ko de RSC chacun ; le pied de page seul en déclenchait ~25 → ~1 Mo) ; le préchargement de `/signup` tirait en plus un bundle de 85 Ko pendant le chargement. | requêtes `_rsc=` dans Lighthouse |
| 6 | **Menu mobile** : `<details>` avec 3 catégories + 8 fonctionnalités + liens en double (les mêmes liens que la barre de bureau), dans une fenêtre de 75 vh ; l'état ouvert vit dans le DOM, il survit donc aux changements de page ; aucun verrouillage du défilement, pas de focus, pas d'Échap ; sous-menus de bureau ouverts au survol « collé » sur tablette. | lecture du code + test |
| 7 | **Police Geist** complète (70 Ko) pour un site en latin. | taille du fichier |
| 8 | **Petites cibles tactiles** (liens légaux du pied de page 20 px, drapeaux 28 px, lignes de FAQ 28 px, pastilles 32–34 px, bouton « OK » 32 px) ; contrastes insuffisants (texte gris sur halo bleu) ; liste `<ol>` invalide ; lien « En savoir plus » non descriptif. | Lighthouse accessibilité/SEO + scan Playwright |

## Ce qui a été changé

- **Hero** : titre, texte, boutons visibles dès le HTML du serveur (plus aucun `FadeIn` dans le hero) ; l'aperçu entre par un déplacement de 14 px, jamais par l'opacité ; respecte `prefers-reduced-motion`.
- **`FadeIn`** : visible côté serveur ; une fois la page interactive, seuls les blocs *sous* l'écran sont masqués puis révélés (un seul `IntersectionObserver` partagé, aucun état React).
- **Animations** : la frise ne calcule que pendant un défilement visible ; le logo central ne tourne que visible et onglet actif ; les animations de décor permanentes sont coupées sous 1024 px ; plus de `will-change` permanent.
- **Halos** : `blur()` remplacé par des masques radiaux (`.glow-mask`), rendu quasi identique, coût très inférieur.
- **DOM** : la version « grand écran » de la section figée et de la frise n'est construite qu'à partir de 1024 px (hauteur réservée côté serveur : pas de saut) ; −430 nœuds sur téléphone. Sections sous l'écran en `content-visibility: auto`.
- **Liens** : préchargement au toucher / survol plutôt qu'à l'affichage (`components/marketing/link.tsx`).
- **Police** : Geist (SIL OFL, licence jointe) réduite au latin utilisé : 36 Ko, mêmes graisses 100–900 (`app/fonts.ts`).
- **En-tête** : pas de `backdrop-filter` sous 768 px.
- **Accessibilité / cibles tactiles / SEO** : cibles ≥ 44 px (menu, pied de page, drapeaux, FAQ — toute la ligne répond —, pastilles, bouton OK), contraste du texte sous le bouton principal, liste valide, lien « Politique de confidentialité », padding d'encoche en paysage, cookie notice au-dessus de la barre d'accueil iPhone.
- **SEO inchangé** : titres, descriptions, canonical, hreflang, JSON-LD et hiérarchie H1/H2/H3 identiques (comparés avant/après sur 7 pages) ; seuls 16 liens en double (copie mobile du menu) ont disparu du HTML.

## Nouveau menu mobile

`components/marketing/mobile-menu.tsx` (écrans < 768 px ; sur bureau la barre horizontale reste, avec ses sous-menus).

- **Un seul panneau plein écran**, absent du DOM tant qu'il est fermé.
- **Menu principal (3 entrées)** : *Fonctionnalités ›*, *Recettes et guides ›*, *Tarifs*. En bas, toujours visibles : *Connexion* (« Accéder à mon espace »), *Créer mon espace*, et les 4 langues.
- **Un seul sous-menu à la fois** : il *remplace* le menu principal (jamais empilé) ; bouton « ‹ Menu » pour revenir.
  - *Fonctionnalités* : « Toutes les fonctionnalités » puis les 3 univers (Agenda, Repas, Finances) avec leurs 8 pages.
  - *Recettes et guides* : Recettes, Idées de recettes, Guides, Outils gratuits (ces deux derniers n'étaient atteignables que par le pied de page / l'accueil).
- **Fermeture** : bouton ✕, Échap, clic sur un lien, changement de page (y compris retour arrière), passage à un écran large. Il ne se rouvre jamais tout seul et repart toujours du menu principal.
- **Défilement** de la page bloqué pendant l'ouverture, rendu à la fermeture ; focus piégé dans le panneau puis rendu au bouton ; `role="dialog" aria-modal`, `aria-expanded`, `aria-controls` ; cibles ≥ 44 px ; marges de zone sûre iPhone.
- L'en-tête mobile ne garde que : logo, « Créer mon espace » (à partir de 390 px) et le bouton menu. Le sélecteur de langue passe dans le menu (toujours dans l'en-tête sur bureau).

## Mesures

Outils : Lighthouse 12 (profil mobile par défaut : 1,6 Mbit/s, RTT 150 ms, CPU ×4), Chromium headless, serveur local `next start` du build de production, médiane de 3 exécutions, page d'accueil `/` (servie en anglais par l'en-tête `Accept-Language` de Lighthouse). **Ce n'est pas du CrUX / terrain, ni Safari iOS, ni Vercel avec CDN** : ce sont des mesures de laboratoire, utiles pour comparer l'avant et l'après sur la même machine, pas des Core Web Vitals réels. L'INP n'est pas mesurable en laboratoire sans interaction scénarisée (non mesuré).

| Accueil | Avant (prod `1521266`) | Après |
|---|---|---|
| **Lighthouse performance (simulé)** | 82 | **93** (91–95 selon les passes) |
| LCP (simulé) | 3,998 s | 2,74 s |
| FCP (simulé) | 1,38 s | 1,38 s |
| TBT (simulé) | 251 ms | ~120–250 ms (bruité) |
| CLS | 0 | 0 |
| Poids transféré / requêtes | 411 Ko / 27 | **251 Ko / 20** |
| Accessibilité / SEO / Bonnes pratiques | 88 / 92 / 96 | **96 / 100** / 96 |
| **Lighthouse (throttling appliqué, CDP)** : perf / FCP / LCP / Speed Index | 78 / 2,70 s / **3,91 s** / 4,19 s | 86 / 2,58 s / **2,58 s** / 2,65 s |
| CLS (throttling appliqué) | 0 | 0,065 (< 0,1 : léger décalage au changement de police sur connexion lente) |
| **Playwright, iPhone 14, CPU ×4, 9 Mbit/s, RTT 70 ms** : FCP / LCP | 840 ms / 1 676 ms | **~600 ms / ~600 ms** |
| Opacité du titre à l'événement `load` | 0 (invisible) | 1 |

Autres pages (Lighthouse simulé, perf avant → après) : Fonctionnalités 95 → 96, Tarifs 92 → 96, Recettes 92 → 92.

Limites à connaître : le LCP « simulé » de l'accueil reste au-dessus de 2,5 s (le modèle de Lighthouse ajoute ~1,3 s entre FCP et LCP sur toutes les pages, y compris les pages légères) ; en throttling appliqué LCP = FCP = 2,58 s, la marge restante est le HTML (≈70 Ko compressés) + le CSS bloquant (21 Ko) sur le profil 1,6 Mbit/s. Le TBT en throttling appliqué est resté du même ordre (≈ 230–300 ms), dominé par l'hydratation React de la page. Le déploiement Vercel (HTTP/2, Brotli, CDN) devrait être plus rapide que ces mesures locales, mais n'a pas été mesuré.

## Contrôles automatisés

`node scripts/qa-mobile.mjs` (serveur `next start` lancé, Playwright installé ; `QA_URL` pour changer l'adresse) : 26 pages × 3 iPhone (375/390/430) sans débordement horizontal, sans erreur de console ni requête en échec, un seul `h1` ; menu mobile (ouverture, un seul niveau visible, retour, fermeture par Échap/lien/retour arrière/redimensionnement, défilement rendu, focus, cibles ≥ 40 px, aucun lien en double) ; navigation au clavier / survol sur bureau ; section figée et frise sur bureau (3 onglets, changement au défilement) et absence de leur version bureau sur téléphone ; titre visible au `load` et CLS < 0,1. Limite : Chromium, pas WebKit/Safari (taille d'écran, tactile et user-agent d'iPhone émulés).

`npm run lint` est cassé sur la branche de production elle-même (`eslint.config.mjs` est au format ESLint 9 alors que `eslint@8` est installé) : ESLint a été exécuté avec une configuration temporaire `next/core-web-vitals` sur le code modifié (0 erreur, 1 avertissement existant dans `shopping-tool.tsx`). Non corrigé ici (changement de version hors périmètre).

## Tester sur votre iPhone avant toute mise en production

1. Ouvrir la PR : Vercel crée un déploiement de prévisualisation (lien dans la PR) — **ne rien promouvoir en production**.
2. Sur iPhone (Safari), ouvrir le lien : l'accueil doit afficher le titre immédiatement ; toucher ☰ → menu plein écran ; *Fonctionnalités ›* → liste, « ‹ Menu » pour revenir ; choisir une page : le menu se ferme et la page défile normalement ; revenir en arrière : le menu reste fermé.
3. Faire défiler l'accueil entièrement (frise, sections, FAQ) : pas de saccade ; changer de langue via le menu.
4. Refaire sur Chrome iOS et sur un téléphone Android si possible ; vérifier le mode réduction des animations (Réglages › Accessibilité › Animations réduites).
5. Vérifier que la connexion/inscription et l'app (`/app`) fonctionnent comme avant (identifiants réels : non testés ici).
