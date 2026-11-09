# RAPPORT — Ninja Mugen

Mémoire du projet : à mettre à jour après chaque étape importante.

## Objectif
Jeu de combat 2D façon M.U.G.E.N en three.js : 56 combattants originaux (18 styles), 1v1 et 2v2, 6 décors, modes Arcade / Combat individuel / Survie / Entraînement, IA à 5 niveaux, 2 joueurs, manette et tactile (paysage). Direction en cours : schéma de commandes « Storm » (voir plan.md, phase 6).

## Stack et technologies
- JavaScript ES Modules (sans framework), rendu three.js 0.170 (caméra orthographique, sprites dessinés sur canvas, particules shader)
- Navigateur : `index.html` + importmap vers three via jsDelivr (CDN)
- Build : esbuild (`build.mjs`) → un seul fichier `dist/ninja-mugen.html` (three inclus, hors-ligne)
- Tests : simulation du moteur sans navigateur (8 fichiers dans `test/`, lancés par `npm test`)
- Hébergement : GitHub Pages (déploiement depuis la branche `main`, racine)

## Architecture et structure des fichiers
Voir `plan.md` (structure, flux des entrées, chaînes de combos, règles des coups / défense / soutiens / chakra, IA, feuille de route, cahier des charges Storm).

## Fonctionnalités développées
- 56 personnages, 18 archétypes, techniques, supers ; 6 décors ; 4 modes ; rendu large ; sons synthétisés
- Moteur : pas fixe 60 Hz, hitstop, buffer, annulations, roulade, garde auto, anti-infini, fondu de poses, latence des coups réduite (`TAP = 7`)
- **Soutiens (6.1)**, **chakra et schéma de boutons (6.2)**, **défense (6.3)** : voir plan.md
- **Combos directionnels et aériens (6.4)** : ○ répété avec ↑ (uppercut puis bond de poursuite), ↓ (jab bas, tibia, croc-en-jambe qui fait tomber), ←/→ (paume, paume 2, finisseur par archétype), bifurcations entre chaînes, chaîne aérienne ○ ○ ○, Chakra Dash qui suit un adversaire lancé et qui prolonge un combo
- **IA complète** : elle utilise toutes les actions du joueur (chaînes, projection, Shuriken, Chakra Shuriken, Chakra Dash au sol / en l'air / en annulation, Ninjutsu, ultime, charge, garde, parade, roulade, substitution, double saut, soutiens) ; test de couverture `test/ai_all.mjs`

## Fonctionnalités restantes
Voir `plan.md` : 6.1b-d, 6.2b-c, 6.3b-c, 6.4b-e, 6.5, 6.6, phases 1 à 5.

## Modifications importantes
- 2026-11-07 : refonte multifichier, rendu large, `.nojekyll`, `plan.md`, phase 1, phase 3, latence, personnalités de l'IA, cahier des charges Storm.
- 2026-11-07/08 : 6.1 Soutiens ; 6.2 Chakra et nouveau schéma de boutons ; 6.3 Défense.
- 2026-11-08 : **6.4** — nouveaux : `js/combos/{cjab,shin,trip,palm,palm2,hook,rise,apunch2}.js`, `test/combos.mjs`, `test/ai_all.mjs` ; modifiés : `combos/{punch1,punch2,upper,apunch,index}.js`, `fighter.js` (actions `high` / `low` / `side`, annulations par touche, `AIRMAP`, Chakra Dash en l'air et en annulation), `moves.js` (BTN, finisseur `sidefin`), `chords.js` (↑ ↓ ←→ + ○), `techniques/chakra.js` (dash qui poursuit), `ai.js` (toutes les capacités), `test/chords.mjs`, `package.json`.
- **Tout ceci a été écrit sans pouvoir lancer le jeu ni les tests** : à vérifier avec `npm test` puis en jeu. Les diffs de chaque commit ont été relus.

## Travail en parallèle sur le même dépôt (à connaître)
- Une autre session a poussé : un écran de sélection façon Storm (82e0b03), des boutons tactiles L2 / R2 déplacés à gauche (f29a2c7) et une PR « UI refonte » (52de2ec : `js/ui/icons.js`, `js/ui/shell.js`, écrans roster / règles / options / guide des combos, CSS). Je n'ai pas relu ces fichiers en détail.
- **Incident** : mon commit 6.4 (b3081ff) a écrasé `js/screens/controls.js` (le guide des combos de la PR) par ma version plus simple. Restauré depuis la PR dans le commit suivant (f7f2c4d) avec les lignes d'attaques mises à jour. **À vérifier** : `js/screens/select.js`, `setup.js`, `ctx.js`, `hud.js`, `index.html`, `css/touch.css` ont pu être modifiés par l'autre session ; ma réécriture complète de fichiers (`push_files`) ne doit plus écraser un fichier sans l'avoir relu sur `main`.

- 2026-11-08/09 : **Refonte de l'interface** (maquettes + direction artistique) : barre de navigation (`js/ui/shell.js`), accueil, règles, roster à 4 colonnes avec aperçu animé et adversaire aléatoire par défaut (Tab / toucher pour choisir), décors 16:9, guide des combos à onglets, pause / résultat / VS restylés, polices Rajdhani + Inter (npm `@fontsource`, intégrées en base64 par `build.mjs`), `css/ui.css`, `js/ui/icons.js`. Moteur inchangé. Reste : HUD de combat à peine retouché (police des noms).

## Problèmes rencontrés et solutions
- **Écran tout noir sur GitHub Pages** : Jekyll ignore les fichiers en `_nom.js` → 404. Solution : `.nojekyll`.
- **Latence des coups normaux** (~3 frames) : réduite à 1 frame (`TAP = 7`).
- **Conflit de touches** : Y était le Super de J1 ; R1 / L1 sur E / Q ; L2 sur Y.
- **Choix de conception** : les combinaisons sont résolues dans `chords.js` (boutons physiques → actions internes) ; `sim.mjs` et `phase3.mjs` restent valides car le vocabulaire interne est inchangé. Le joueur n'a plus la Technique d'archétype ni la Frappe lourde.
- **Substitution** : utilise le buffer d'entrées (8 frames) pour pouvoir être pressée un peu avant l'impact, y compris pendant le hitstop.
- **Chaînes 6.4** : les annulations lisent le buffer (8 frames, conservé pendant le hitstop) ; en l'air, un coup de chaîne annulé est remplacé par son équivalent aérien (`AIRMAP`).

## Dépendances installées
- `three@^0.170.0` (dependencies)
- `esbuild@^0.24.0` (devDependencies)
- `@fontsource/rajdhani`, `@fontsource/inter` (devDependencies, polices intégrées au build)

## Commandes importantes
- `npm install` : installer les dépendances
- `npm run build` : régénérer `dist/ninja-mugen.html`
- `npm test` : les 8 fichiers de test (Node)
- `npm start` : serveur local (`npx serve .`)

## Variables d'environnement
Aucune.

## État actuel
Jouable. Phases 1, 3, 6.1 à 6.4 faites, non testées ; `dist/ninja-mugen.html` **pas régénéré** (lancer `npm install && npm run build`). Pour GitHub Pages, vider le cache (CSS / JS en `?v=7`).

## Prochaines étapes
- Lancer `npm test` ; en cas d'échec, envoyer la sortie. Les tests les plus fragiles (timings) : `test/combos.mjs` et `test/ai_all.mjs`.
- Tester en jeu : les 3 chaînes directionnelles, le bond de poursuite, le Chakra Dash qui suit, le comportement de l'IA
- Puis 6.5 (éveil, techniques d'équipe), 6.6 (remappage, README, tests réécrits), poses d'animation des nouveaux coups (phase 4)
