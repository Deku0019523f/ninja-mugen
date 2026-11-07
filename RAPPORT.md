# RAPPORT — Ninja Mugen

Mémoire du projet : à mettre à jour après chaque étape importante.

## Objectif
Jeu de combat 2D façon M.U.G.E.N en three.js : 56 combattants originaux (18 styles), 1v1 et 2v2, 6 décors, modes Arcade / Combat individuel / Survie / Entraînement, IA à 5 niveaux, 2 joueurs, manette et tactile (paysage).

## Stack et technologies
- JavaScript ES Modules (sans framework), rendu three.js 0.170 (caméra orthographique, sprites dessinés sur canvas, particules shader)
- Navigateur : `index.html` + importmap vers three via jsDelivr (CDN)
- Build : esbuild (`build.mjs`) → un seul fichier `dist/ninja-mugen.html` (three inclus, hors-ligne)
- Tests : simulation du moteur sans navigateur (`test/sim.mjs`, Node)
- Hébergement : GitHub Pages (déploiement depuis la branche `main`, racine)

## Architecture et structure des fichiers
Voir `plan.md` (structure détaillée + constat sur le moteur + feuille de route).

## Fonctionnalités développées
- 56 personnages (un dossier chacun), 18 archétypes, combos, techniques, supers (un fichier chacun)
- 6 décors procéduraux à parallaxe
- 4 modes de jeu, écrans séparés (titre, réglages, sélection, décor, VS, options, commandes, résultat)
- Clavier 2 joueurs, manette, commandes tactiles (stick analogique ou croix + boutons)
- Rendu large : caméra dynamique 640→1200 × 480
- Sons et musique synthétisés (WebAudio)
- Moteur : pas fixe 60 Hz, hitstop, buffer d'entrées 8 frames, annulations, roulade, garde auto, anti-infini
- Fondu entre poses (2 à 4 frames) et tremblement du combattant touché (2026-11-07)

## Fonctionnalités restantes
Voir les phases 1 à 5 de `plan.md` (cases non cochées).

## Modifications importantes
- 2026-11-07 : refonte multifichier (stages, écrans, modes, CSS par domaine), rendu large, commandes tactiles.
- 2026-11-07 : ajout de `.nojekyll` (voir problèmes).
- 2026-11-07 : `plan.md` avec feuille de route (fluidité, techniques, visuel).
- 2026-11-07 : phase 1 — `js/input.js` (délai ○/✕ 45→20 ms), `js/render/sprites.js` (`poseFor` = pose brute + fondu ; tremblement hit/blockstun). **Non testé en navigateur** au moment de l'écriture : à vérifier en jeu.

## Problèmes rencontrés et solutions
- **Écran tout noir sur GitHub Pages** (le jeu marchait en local / via `dist/`) : GitHub Pages passe par Jekyll, qui ignore tout fichier ou dossier dont le nom commence par `_`. `js/stages/_draw.js` et `js/characters/_make.js` renvoyaient donc 404, ce qui cassait tout le graphe de modules (page vide, aucun menu). Solution : fichier vide `.nojekyll` à la racine.

## Dépendances installées
- `three@^0.170.0` (dependencies)
- `esbuild@^0.24.0` (devDependencies)

## Commandes importantes
- `npm install` : installer les dépendances
- `npm run build` : régénérer `dist/ninja-mugen.html`
- `npm test` : simulation du moteur (Node)
- `npm start` : serveur local (`npx serve .`)

## Variables d'environnement
Aucune.

## État actuel
Jouable. Phase 1 (fluidité) en partie faite ; `dist/ninja-mugen.html` **pas régénéré** depuis ces modifications (lancer `npm run build`).

## Prochaines étapes
- Tester en jeu (mobile et PC) le fondu de poses et le délai tactile ; régler `PAIR_DELAY` (input.js) et la durée de fondu (sprites.js) si besoin
- Lancer `npm test` et `npm run build`
- Phase 2 (performance) puis phase 3 (techniques)
