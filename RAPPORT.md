# RAPPORT — Ninja Mugen

Mémoire du projet : à mettre à jour après chaque étape importante.

## Objectif
Jeu de combat 2D façon M.U.G.E.N en three.js : 56 combattants originaux (18 styles), 1v1 et 2v2, 6 décors, modes Arcade / Combat individuel / Survie / Entraînement, IA à 5 niveaux, 2 joueurs, manette et tactile (paysage). Direction en cours : schéma de commandes « Storm » (voir plan.md, phase 6).

## Stack et technologies
- JavaScript ES Modules (sans framework), rendu three.js 0.170 (caméra orthographique, sprites dessinés sur canvas, particules shader)
- Navigateur : `index.html` + importmap vers three via jsDelivr (CDN)
- Build : esbuild (`build.mjs`) → un seul fichier `dist/ninja-mugen.html` (three inclus, hors-ligne)
- Tests : simulation du moteur sans navigateur (`test/sim.mjs`, `phase3.mjs`, `support.mjs`, `chords.mjs`, `chakra.mjs`, Node)
- Hébergement : GitHub Pages (déploiement depuis la branche `main`, racine)

## Architecture et structure des fichiers
Voir `plan.md` (structure, flux des entrées, règles des coups / soutiens / chakra, IA, feuille de route, cahier des charges Storm).

## Fonctionnalités développées
- 56 personnages, 18 archétypes, combos, techniques, supers ; 6 décors ; 4 modes ; écrans séparés ; rendu large ; sons synthétisés
- Moteur : pas fixe 60 Hz, hitstop, buffer, annulations, roulade, garde auto, anti-infini, fondu de poses, latence des coups réduite (`TAP = 7`)
- Parade parfaite, projection, Spécial ↑ / ↓ ; IA : 4 personnalités, parade volontaire, soutiens, chakra
- **Soutiens (6.1)** : 2 par combattant, appel R1 / L1, présence 3 s, rappel 12 s, 3 comportements, HUD
- **Chakra et nouveau schéma (6.2)** : ○ attaque (↑ / ↓ / ←→ = uppercut / balayage / pied), ✕ saut, □ Shuriken, △ maintenu = charge, △+○ Ninjutsu, △△○ Technique ultime, △+✕ Chakra Dash (puis ○ ○ ○), △+□ Chakra Shuriken, R2 garde, R1 / L1 soutiens ; clavier J1 (ZQSD + F G R T H Y E Q), J2 (flèches + J K U I L O P N), manette PlayStation, boutons tactiles (losange + grille L1 R1 L2 R2) ; `js/game/chords.js` (détecteur de combinaisons) ; `js/techniques/chakra.js` ; état `charge` ; écrans Commandes / Sélection / Configuration mis à jour

## Fonctionnalités restantes
Voir `plan.md` : 6.1b-d, 6.2b-c, 6.3 à 6.6, phases 1 à 5.

## Modifications importantes
- 2026-11-07 : refonte multifichier, rendu large, `.nojekyll`, `plan.md`, phase 1, phase 3, latence, personnalités de l'IA, cahier des charges Storm.
- 2026-11-07/08 : 6.1 Soutiens (`support.js`, `world.js`, `match.js`, `ai.js`, `hud.js`, sélection, tactile).
- 2026-11-08 : **6.2 Chakra** — nouveaux : `js/game/chords.js`, `js/techniques/chakra.js`, `test/chords.mjs`, `test/chakra.mjs` ; modifiés : `fighter.js` (état charge, Shuriken, Chakra Dash / Shuriken), `moves.js` (BTN, getMove), `ai.js`, `match.js` (Chord par joueur humain), `input.js` (boutons physiques), `touch.js` / `css/touch.css` / `index.html` / `template.html` (△ □ ○ ✕ renommés tri sq o x ; grille L1 R1 L2 R2, `?v=5`), `sprites.js` (pose charge), `screens/controls.js` / `select.js` / `setup.js`, `package.json`.
- **Tout ceci a été écrit sans pouvoir lancer le jeu ni les tests** : à vérifier avec `npm test` puis en jeu. Les diffs de chaque commit ont été relus (seules les modifications prévues y figurent).

## Problèmes rencontrés et solutions
- **Écran tout noir sur GitHub Pages** : Jekyll ignore les fichiers en `_nom.js` → 404. Solution : `.nojekyll`.
- **Latence des coups normaux** (~3 frames) : réduite à 1 frame (`TAP = 7`).
- **Conflit de touches** : Y était le Super de J1 ; R1 / L1 sur E / Q ; L2 sur Y (inutilisé pour l'instant).
- **Choix de conception 6.2** : les combinaisons sont résolues dans `chords.js` (boutons physiques → actions internes) pour ne pas réécrire le moteur ; les tests du moteur (`sim.mjs`, `phase3.mjs`) restent valides car le vocabulaire interne est inchangé. Contrepartie : le joueur humain n'a plus accès à la Technique d'archétype, à la Frappe lourde ni au Pied aérien (voir plan.md).
- **Limite connue** : `ui/hud.js` affiche encore l'ancien texte de combos en mode Entraînement.

## Dépendances installées
- `three@^0.170.0` (dependencies)
- `esbuild@^0.24.0` (devDependencies)

## Commandes importantes
- `npm install` : installer les dépendances
- `npm run build` : régénérer `dist/ninja-mugen.html`
- `npm test` : les 5 fichiers de test (Node)
- `npm start` : serveur local (`npx serve .`)

## Variables d'environnement
Aucune.

## État actuel
Jouable. Phases 1, 3, 6.1 et 6.2 faites, non testées ; `dist/ninja-mugen.html` **pas régénéré** (lancer `npm run build`). Pour GitHub Pages, vider le cache (CSS / JS en `?v=5`).

## Prochaines étapes
- Lancer `npm test` ; en cas d'échec, envoyer la sortie (réglages : `CHARGE_RATE`, `TAP`, `PARRY`, `THROW_R` dans `fighter.js` ; `CHARGE_AFTER`, `ARM_WIN`, `TAP_WIN` dans `chords.js` ; `SUP_*` dans `support.js` ; coûts et portée dans `techniques/chakra.js`)
- Tester en jeu (mobile) : placement des 8 boutons tactiles, charge du chakra, △ + ○ au doigt entre deux boutons, Chakra Dash → ○ ○ ○
- Puis 6.3 (défense : R2 + ○, substitution L2, guard break, double saut), 6.4 (combos directionnels et aériens), 6.5, 6.6, et mise à jour du HUD d'entraînement
