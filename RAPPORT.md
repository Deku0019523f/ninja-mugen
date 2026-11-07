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
Voir `plan.md` (structure détaillée).

## Fonctionnalités développées
- 56 personnages (un dossier chacun), 18 archétypes, combos, techniques, supers (un fichier chacun)
- 6 décors procéduraux à parallaxe
- 4 modes de jeu, écrans séparés (titre, réglages, sélection, décor, VS, options, commandes, résultat)
- Clavier 2 joueurs, manette, commandes tactiles (stick analogique ou croix + boutons)
- Rendu large : caméra dynamique 640→1200 × 480
- Sons et musique synthétisés (WebAudio)

## Fonctionnalités restantes
- À définir par Alec.

## Modifications importantes
- 2026-11-07 : refonte multifichier (stages, écrans, modes, CSS par domaine), rendu large, commandes tactiles.
- 2026-11-07 : ajout de `.nojekyll` (voir problèmes).

## Problèmes rencontrés et solutions
- **Écran tout noir sur GitHub Pages** (le jeu marchait en local / via `dist/`) : GitHub Pages passe par Jekyll, qui ignore tout fichier ou dossier dont le nom commence par `_`. `js/stages/_draw.js` et `js/characters/_make.js` renvoyaient donc 404, ce qui cassait tout le graphe de modules (page vide, aucun menu). Solution : fichier vide `.nojekyll` à la racine. Si on ajoute un jour d'autres fichiers en `_nom.js`, ils fonctionneront aussi.

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
Jouable. Correctif `.nojekyll` poussé ; la page GitHub Pages doit être rechargée après le redéploiement (1 à 2 minutes).

## Prochaines étapes
- Vérifier sur mobile que le menu s'affiche après redéploiement (recharger sans cache)
- Tester les 4 modes et les commandes tactiles en paysage
