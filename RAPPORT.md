# RAPPORT — Ninja Mugen

Mémoire du projet : à mettre à jour après chaque étape importante.

## Objectif
Jeu de combat 2D façon M.U.G.E.N en three.js : 56 combattants originaux (18 styles), 1v1 et 2v2, 6 décors, modes Arcade / Combat individuel / Survie / Entraînement, IA à 5 niveaux, 2 joueurs, manette et tactile (paysage).

## Stack et technologies
- JavaScript ES Modules (sans framework), rendu three.js 0.170 (caméra orthographique, sprites dessinés sur canvas, particules shader)
- Navigateur : `index.html` + importmap vers three via jsDelivr (CDN)
- Build : esbuild (`build.mjs`) → un seul fichier `dist/ninja-mugen.html` (three inclus, hors-ligne)
- Tests : simulation du moteur sans navigateur (`test/sim.mjs`, `test/phase3.mjs`, Node)
- Hébergement : GitHub Pages (déploiement depuis la branche `main`, racine)

## Architecture et structure des fichiers
Voir `plan.md` (structure détaillée + constat sur le moteur + règles des nouveaux coups + IA + feuille de route).

## Fonctionnalités développées
- 56 personnages (un dossier chacun), 18 archétypes, combos, techniques, supers (un fichier chacun)
- 6 décors procéduraux à parallaxe
- 4 modes de jeu, écrans séparés (titre, réglages, sélection, décor, VS, options, commandes, résultat)
- Clavier 2 joueurs, manette, commandes tactiles (stick analogique ou croix + boutons)
- Rendu large : caméra dynamique 640→1200 × 480
- Sons et musique synthétisés (WebAudio)
- Moteur : pas fixe 60 Hz, hitstop, buffer d'entrées 8 frames, annulations, roulade, garde auto, anti-infini
- Fondu entre poses (2 à 4 frames) et tremblement du combattant touché
- Latence des coups normaux réduite de 3 à 1 frame (`TAP = 7`)
- Parade parfaite (tap ↓), projection (arrière + Poing au contact), Spécial ↑ (diagonale) et ↓ (tir bas), écran Commandes mis à jour
- IA : 4 personnalités tirées au hasard par adversaire, parade volontaire, usage de la projection et des Spéciaux ↑/↓

## Fonctionnalités restantes
Voir les phases 1 à 5 de `plan.md` (cases non cochées).

## Modifications importantes
- 2026-11-07 : refonte multifichier (stages, écrans, modes, CSS par domaine), rendu large, commandes tactiles.
- 2026-11-07 : ajout de `.nojekyll` (voir problèmes).
- 2026-11-07 : `plan.md` avec feuille de route (fluidité, techniques, visuel).
- 2026-11-07 : phase 1 — `js/input.js` (délai ○/✕ 45→20 ms), `js/render/sprites.js` (`poseFor` = pose brute + fondu ; tremblement hit/blockstun).
- 2026-11-07 : phase 3 — `js/game/fighter.js` (parry, throw, variantes), `js/combos/throw.js`, `js/techniques/special.js`, `js/game/moves.js`, `js/game/ai.js`, `js/screens/controls.js`, `test/phase3.mjs`, `package.json`.
- 2026-11-07 : latence des coups normaux (`TAP` dans `fighter.js`), personnalités et parade de l'IA (`ai.js`, `match.js`), tests ajoutés (latence, personnalités).
- **Tout ceci a été écrit sans pouvoir lancer le jeu ni les tests** : à vérifier avec `npm test` puis en jeu. Les diffs du dernier commit ont été relus (seules les modifications prévues y figurent).

## Problèmes rencontrés et solutions
- **Écran tout noir sur GitHub Pages** (le jeu marchait en local / via `dist/`) : GitHub Pages passe par Jekyll, qui ignore tout fichier ou dossier dont le nom commence par `_`. `js/stages/_draw.js` et `js/characters/_make.js` renvoyaient donc 404, ce qui cassait tout le graphe de modules (page vide, aucun menu). Solution : fichier vide `.nojekyll` à la racine.
- **Latence des coups normaux** (~3 frames, `buf <= 5`) : réduite à 1 frame (`TAP = 7`). Contrepartie : Poing+Pied à plus d'1 frame d'écart ne donne plus la frappe lourde (Poing puis Pied à la place).

## Dépendances installées
- `three@^0.170.0` (dependencies)
- `esbuild@^0.24.0` (devDependencies)

## Commandes importantes
- `npm install` : installer les dépendances
- `npm run build` : régénérer `dist/ninja-mugen.html`
- `npm test` : `test/sim.mjs` puis `test/phase3.mjs` (Node)
- `npm start` : serveur local (`npx serve .`)

## Variables d'environnement
Aucune.

## État actuel
Jouable. Phases 1 et 3 en grande partie faites, non testées ; `dist/ninja-mugen.html` **pas régénéré** depuis ces modifications (lancer `npm run build`).

## Prochaines étapes
- Lancer `npm test` : si un test échoue (`sim.mjs` ou `phase3.mjs`), envoyer la sortie ; réglages : `TAP`, `PARRY`, `THROW_R` en haut de `fighter.js`, `PARRY_CH` et `PERSONALITIES` dans `ai.js`
- Tester en jeu (mobile et PC) : latence des coups, parade, projection, Spécial ↑/↓, fondu de poses, délai tactile, équilibre des personnalités de l'IA
- Puis : jauge de garde (avec HUD), variantes de la Technique, 2v2, visuel (phases 4-5), performance (phase 2)
