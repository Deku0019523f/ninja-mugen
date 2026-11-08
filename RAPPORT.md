# RAPPORT — Ninja Mugen

Mémoire du projet : à mettre à jour après chaque étape importante.

## Objectif
Jeu de combat 2D façon M.U.G.E.N en three.js : 56 combattants originaux (18 styles), 1v1 et 2v2, 6 décors, modes Arcade / Combat individuel / Survie / Entraînement, IA à 5 niveaux, 2 joueurs, manette et tactile (paysage). Direction en cours : schéma de commandes « Storm » (voir plan.md, phase 6).

## Stack et technologies
- JavaScript ES Modules (sans framework), rendu three.js 0.170 (caméra orthographique, sprites dessinés sur canvas, particules shader)
- Navigateur : `index.html` + importmap vers three via jsDelivr (CDN)
- Build : esbuild (`build.mjs`) → un seul fichier `dist/ninja-mugen.html` (three inclus, hors-ligne)
- Tests : simulation du moteur sans navigateur (`test/sim.mjs`, `test/phase3.mjs`, `test/support.mjs`, Node)
- Hébergement : GitHub Pages (déploiement depuis la branche `main`, racine)

## Architecture et structure des fichiers
Voir `plan.md` (structure détaillée, constat sur le moteur, règles des nouveaux coups et des soutiens, IA, feuille de route, cahier des charges Storm).

## Fonctionnalités développées
- 56 personnages, 18 archétypes, combos, techniques, supers (un fichier chacun) ; 6 décors ; 4 modes de jeu ; écrans séparés
- Clavier 2 joueurs, manette, commandes tactiles ; rendu large ; sons et musique synthétisés
- Moteur : pas fixe 60 Hz, hitstop, buffer d'entrées, annulations, roulade, garde auto, anti-infini, fondu de poses, latence des coups réduite (`TAP = 7`)
- Parade parfaite (tap ↓), projection (arrière + Poing), Spécial ↑ / ↓
- IA : 4 personnalités, parade volontaire, projection, Spéciaux ↑/↓, appel des soutiens
- **Soutiens (6.1)** : 2 soutiens par combattant (sélection après le combattant, réglage Oui/Non dans la configuration), appel R1 / L1 (E / Q au clavier J1, P / N J2, boutons manette R1 / L1, boutons tactiles), présence 3 s, rappel 12 s, comportements interrupt / range / melee, vignettes HUD, 1 contre 1 uniquement

## Fonctionnalités restantes
Voir `plan.md` : phase 6 (6.1b à 6.6), phases 1 à 5.

## Modifications importantes
- 2026-11-07 : refonte multifichier (stages, écrans, modes, CSS par domaine), rendu large, commandes tactiles.
- 2026-11-07 : `.nojekyll` ; `plan.md` (feuille de route) ; phase 1 (`input.js` délai 20 ms, `sprites.js` fondu de poses) ; phase 3 (parade, projection, Spécial ↑/↓) ; latence `TAP` ; personnalités de l'IA.
- 2026-11-07 : cahier des charges Storm dans `plan.md` ; décisions d'Alec : remplacement complet des commandes, boutons tactiles ajoutés, commencer par les soutiens.
- 2026-11-07/08 : **6.1 Soutiens** — nouveaux/modifiés : `js/game/support.js` (nouveau), `world.js` (soutiens exclus des cibles/équipe/bousculade, hors-jeu sauté), `match.js`, `ai.js`, `input.js`, `touch.js`, `css/touch.css`, `index.html` / `template.html` (boutons R1/L1, `?v=4`), `ui/hud.js`, `screens/select.js` / `setup.js` / `ctx.js` / `controls.js`, `main.js`, `test/support.mjs`, `package.json`.
- **Tout ceci a été écrit sans pouvoir lancer le jeu ni les tests** : à vérifier avec `npm test` puis en jeu. Les diffs des commits ont été relus (seules les modifications prévues y figurent).

## Problèmes rencontrés et solutions
- **Écran tout noir sur GitHub Pages** : Jekyll ignore les fichiers en `_nom.js` (`js/stages/_draw.js`, `js/characters/_make.js`) → 404, graphe de modules cassé. Solution : `.nojekyll` à la racine.
- **Latence des coups normaux** (~3 frames) : réduite à 1 frame (`TAP = 7`). Contrepartie : Poing+Pied à plus d'1 frame d'écart donne Poing puis Pied.
- **Conflit de touches** pour R1 / L1 : Y était déjà le Super de J1 ; choix de E / Q (J1) et P / N (J2). La manette passe le Super sur R2 seul.

## Dépendances installées
- `three@^0.170.0` (dependencies)
- `esbuild@^0.24.0` (devDependencies)

## Commandes importantes
- `npm install` : installer les dépendances
- `npm run build` : régénérer `dist/ninja-mugen.html`
- `npm test` : `test/sim.mjs`, `test/phase3.mjs`, `test/support.mjs` (Node)
- `npm start` : serveur local (`npx serve .`)

## Variables d'environnement
Aucune.

## État actuel
Jouable. Phases 1, 3 et 6.1 en grande partie faites, non testées ; `dist/ninja-mugen.html` **pas régénéré** depuis ces modifications (lancer `npm run build`). Pour GitHub Pages, vider le cache (les CSS/JS passent en `?v=4`).

## Prochaines étapes
- Lancer `npm test` ; en cas d'échec, envoyer la sortie (réglages : `SUP_STAY` / `SUP_CD` / `SUP_START` dans `support.js`, `TAP`, `PARRY`, `THROW_R` dans `fighter.js`, `PARRY_CH` / `PERSONALITIES` dans `ai.js`)
- Tester en jeu (mobile) : placement des boutons R1 / L1, vignettes HUD, comportement des 3 modes de soutien
- Puis 6.2 (chakra : △, Chakra Dash, Chakra Shuriken, Ninjutsu, Ultime, Shuriken), 6.3 (défense : R2, substitution, guard break), 6.4 (combos directionnels et aériens), 6.5, 6.6
