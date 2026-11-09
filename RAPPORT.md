# RAPPORT — Ninja Mugen

Mémoire du projet : à mettre à jour après chaque étape importante.

## Objectif
Jeu de combat 2D façon M.U.G.E.N en three.js : 56 combattants originaux (18 styles), 1v1 et 2v2, 6 décors, modes Arcade / Combat individuel / Survie / Entraînement, IA à 5 niveaux, 2 joueurs, manette et tactile (paysage). Direction en cours : schéma de commandes « Storm » (voir plan.md, phase 6).

## Stack et technologies
- JavaScript ES Modules (sans framework), rendu three.js 0.170 (caméra orthographique, sprites dessinés sur canvas, particules shader)
- Navigateur : `index.html` + importmap vers three via jsDelivr (CDN)
- Build : esbuild (`build.mjs`) → un seul fichier `dist/ninja-mugen.html` (three inclus, hors-ligne)
- Tests : simulation du moteur sans navigateur (`test/sim.mjs`, `phase3.mjs`, `support.mjs`, `chords.mjs`, `chakra.mjs`, `defense.mjs`, Node)
- Hébergement : GitHub Pages (déploiement depuis la branche `main`, racine)

## Architecture et structure des fichiers
Voir `plan.md` (structure, flux des entrées, règles des coups / défense / soutiens / chakra, IA, feuille de route, cahier des charges Storm).

## Fonctionnalités développées
- 56 personnages, 18 archétypes, combos, techniques, supers ; 6 décors ; 4 modes ; écrans séparés ; rendu large ; sons synthétisés
- Moteur : pas fixe 60 Hz, hitstop, buffer, annulations, roulade, garde auto, anti-infini, fondu de poses, latence des coups réduite (`TAP = 7`)
- IA : 4 personnalités, parade volontaire, soutiens, chakra, substitution
- **Soutiens (6.1)** : 2 par combattant, appel R1 / L1, présence 3 s, rappel 12 s, 3 comportements, HUD
- **Chakra et nouveau schéma (6.2)** : ○ ✕ □ △ R2 L2 R1 L1 sur clavier / manette / tactile ; △ maintenu = charge, △+○ Ninjutsu, △△○ Technique ultime, △+✕ Chakra Dash, △+□ Chakra Shuriken, □ Shuriken ; `js/game/chords.js`, `js/techniques/chakra.js`
- **Défense (6.3)** : parade parfaite (tap R2 / ↓), projection R2+○, substitution L2 (3 charges, +1 / 5 s ; esquive ou sortie de combo), garde brisée (jauge de garde, étourdissement 55 frames), double saut (✕ ✕) ; HUD : jauge de garde orange → rouge et 3 pastilles marron sous la barre de chakra ; texte d'aide du mode Entraînement mis à jour

## Fonctionnalités restantes
Voir `plan.md` : 6.1b-d, 6.2b-c, 6.3b-c, 6.4 à 6.6, phases 1 à 5.

## Modifications importantes
- 2026-11-07 : refonte multifichier, rendu large, `.nojekyll`, `plan.md`, phase 1, phase 3, latence, personnalités de l'IA, cahier des charges Storm.
- 2026-11-07/08 : 6.1 Soutiens ; 6.2 Chakra et nouveau schéma de boutons.
- 2026-11-08 : **6.3 Défense** — modifiés : `fighter.js` (`substitute`, `guard`, `airJumps`, action `throw`, front montant de ↑), `moves.js` (BTN + `sub`, `throw`), `chords.js` (R2+○ → `throw`, L2 en impulsion), `ai.js` (substitution), `ui/hud.js` (jauge de garde, pastilles, texte d'aide), `screens/controls.js`, `package.json` ; nouveau : `test/defense.mjs` ; `test/chords.mjs` étendu.
- **Tout ceci a été écrit sans pouvoir lancer le jeu ni les tests** : à vérifier avec `npm test` puis en jeu. Les diffs de chaque commit ont été relus (seules les modifications prévues y figurent).

- 2026-11-08 : **Refonte de l'interface** (inspirée des maquettes + document de direction artistique) : barre de navigation (`js/ui/shell.js`), accueil, règles, roster à 4 colonnes avec aperçu animé et adversaire aléatoire par défaut (Tab / toucher pour choisir), décors 16:9, guide des combos à onglets avec schémas, pause / résultat / VS restylés, polices intégrées, composants `css/ui.css`, pictogrammes `js/ui/icons.js`. Le moteur n'a pas été touché ; `npm test` passe. Écrans vérifiés par captures (800×360, 800×600). Reste : HUD de combat à peine retouché (police et noms).

## Problèmes rencontrés et solutions
- **Écran tout noir sur GitHub Pages** : Jekyll ignore les fichiers en `_nom.js` → 404. Solution : `.nojekyll`.
- **Latence des coups normaux** (~3 frames) : réduite à 1 frame (`TAP = 7`).
- **Conflit de touches** : Y était le Super de J1 ; R1 / L1 sur E / Q ; L2 sur Y.
- **Choix de conception 6.2** : les combinaisons sont résolues dans `chords.js` (boutons physiques → actions internes) pour ne pas réécrire le moteur ; `sim.mjs` et `phase3.mjs` restent valides. Contrepartie : le joueur humain n'a plus accès à la Technique d'archétype, à la Frappe lourde ni au Pied aérien.
- **Choix de conception 6.3** : la substitution utilise le buffer d'entrées (8 frames) pour pouvoir être pressée un peu avant l'impact, y compris pendant le hitstop ; la projection du joueur est l'action `throw` (R2+○), celle de l'IA reste arrière + Poing.

## Dépendances installées
- `three@^0.170.0` (dependencies)
- `esbuild@^0.24.0` (devDependencies)
- `@fontsource/rajdhani`, `@fontsource/inter` (devDependencies, polices intégrées au build)

## Commandes importantes
- `npm install` : installer les dépendances
- `npm run build` : régénérer `dist/ninja-mugen.html`
- `npm test` : les 6 fichiers de test (Node)
- `npm start` : serveur local (`npx serve .`)

## Variables d'environnement
Aucune.

## État actuel
Jouable. Phases 1, 3, 6.1, 6.2 et 6.3 faites, non testées ; `dist/ninja-mugen.html` **pas régénéré** (lancer `npm install && npm run build`). Pour GitHub Pages, vider le cache (CSS / JS en `?v=7`).

## Prochaines étapes
- Lancer `npm test` ; en cas d'échec, envoyer la sortie (réglages : `SUB_MAX` / `SUB_REGEN` / `GUARD_*` / `BREAK_STUN` / `CHARGE_RATE` / `TAP` / `PARRY` / `THROW_R` dans `fighter.js` ; `SUB_CH` / `PARRY_CH` dans `ai.js` ; `CHARGE_AFTER` / `ARM_WIN` / `TAP_WIN` dans `chords.js` ; `SUP_*` dans `support.js` ; coûts dans `techniques/chakra.js`)
- Tester en jeu (mobile) : placement des 8 boutons tactiles, L2 au bon moment, jauge de garde, double saut
- Puis 6.4 (combos directionnels et aériens), 6.5 (éveil, techniques d'équipe), 6.6 (remappage, README, tests réécrits), phase 4 (visuel : vraie bûche, aura de charge)
