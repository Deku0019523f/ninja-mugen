# PLAN — Ninja Mugen

Ce fichier contient (1) la structure détaillée du projet, (2) la feuille de route des améliorations, (3) le cahier des charges du schéma de commandes « Storm » (phase 6). Cocher `[x]` au fur et à mesure ; le suivi détaillé est dans `RAPPORT.md`.

---

# 1. Structure du projet

```
index.html            page de dev (importmap three via CDN, charge js/main.js)
template.html         gabarit pour le build mono-fichier
build.mjs             esbuild -> dist/ninja-mugen.html (three + CSS inclus)
dist/                 jeu en un seul fichier, hors-ligne (a besoin de `npm run build` après chaque modification)
test/sim.mjs          simulation du moteur sans navigateur (actions internes punch/kick/special/move2/super)
test/phase3.mjs       latence, parade parfaite, projection, Spécial ↑/↓, personnalités de l'IA
test/support.mjs      soutiens (apparition, rappel, corps à corps, tir, interruption, IA)
test/chords.mjs       combinaisons de boutons (△+○, △△○, △+✕, △+□, charge, variantes de ○, R2)
test/chakra.mjs       charge du chakra, Shuriken, Chakra Shuriken, Chakra Dash
package.json          scripts build / test (les 5 fichiers de test) / start
README.md             présentation et commandes de jeu (à réécrire pour le nouveau schéma : 6.6)
RAPPORT.md            mémoire du projet
plan.md               ce fichier
.nojekyll             empêche Jekyll (GitHub Pages) d'ignorer les fichiers en _nom.js

css/
  base.css            plein écran paysage, #view, #ui, bouton retour/pause, message « tournez le téléphone »
  hud.css             barres de vie, chakra, chrono, combos, bannières
  menus.css           écrans et listes de menu
  touch.css           commandes tactiles (stick/croix, losange △ □ ○ ✕, grille L1 R1 L2 R2)

js/
  main.js             routeur d'écrans, lancement des matchs, pause, boucle principale
  input.js            clavier (2 joueurs), manette, tactile -> boutons PHYSIQUES (o x sq tri r2 l2 sup1 sup2 + directions)
  touch.js            stick analogique / croix, losange, boutons L1 R1 L2 R2
  audio.js            sons et musique synthétisés
  data/roster.js      agrégateur : ROSTER (56) + ARCH (18) + hexShade
  characters/<nom>/<nom>.js   un dossier par personnage (56) + index.js (ordre = identifiant) + _make.js (fabrique)
  archetypes/<style>.js       18 styles de combat (projectile, technique, super) + index.js
  combos/<coup>.js            un fichier par combo (poing 1-2-3, pied, balayage, uppercut, frappe lourde, projection, coups aériens)
  techniques/<nom>.js         techniques d'archétype (IA seulement) + special.js (Ninjutsu et variantes ↑/↓) + chakra.js (Shuriken, Chakra Shuriken, Chakra Dash)
  supers/<nom>.js             une super attaque par fichier (Technique ultime)
  stages/<nom>.js             un fichier par décor (forest, plains, desert, snow, night, volcano) + _draw.js + index.js
  modes/<mode>.js             arcade, single, survival, training + util.js + index.js
  screens/<écran>.js          title, setup, select (combattant + 2 soutiens), stage, vs, options, controls, result + ctx.js + index.js
  game/                       moteur : fighter (états), world, match, ai, chords (combinaisons), support (soutiens), moves (agrégateur), helpers
  render/                     sprites.js (squelette 2D + fondu de poses), view.js (three.js, caméra large 640->1200 x 480)
  ui/                         hud.js (barres, combos, soutiens), menu.js (liste de menu)
```

## Flux
`index.html` -> `js/main.js` -> `go('title')` -> écrans (`js/screens`) -> `G.launch()` -> `Match` (`js/game`) + `View` (`js/render`) + `Hud` (`js/ui`).
Entrées d'un joueur humain : `readPlayer()` (boutons physiques) -> `Chord.map()` (combinaisons) -> actions du moteur -> `Fighter`. L'IA et les soutiens produisent directement les actions du moteur.

## Moteur (constat après lecture de game/)
- `Match.frame` : accumulateur à pas fixe 1/60 s (`DT`), `speed` pour le ralenti de KO
- `World.update` : `hitstop` gèle la simulation (les entrées continuent d'être bufferisées)
- `Fighter` : `buf` = buffer d'entrées de 8 frames (`BTN` dans moves.js) ; annulations après un coup au but ; roulade (bas + direction), garde automatique, relevé (invuln 22), anti-infini (`combo` réduit les dégâts de 7 % par coup, min 30 %), `juggle` max 3
- Hitstop actuel : garde 3, coup 4, gros coup 7, KO 16, super 34 frames ; parade parfaite 9
- **Coups normaux** : le coup part quand le buffer est <= `TAP` (fighter.js). `TAP = 7` : 1 frame après l'appui.
- **Vocabulaire interne des actions** (reste valide pour l'IA et les tests) : `l r u d punch kick special move2 super sq cdash cshuriken charge sup1 sup2`.

## Règles des nouveaux coups (phase 3)
- **Parade parfaite** : appui frais sur ↓ **ou R2** -> fenêtre de 6 frames (`parryT`). Coup non-super de face pendant la garde : 0 dégât, +12 chakra, hitstop 9, l'attaquant au corps à corps passe en `hit` 22 frames.
- **Projection** : arrière (mémorisé 8 frames) + Poing (← + ○), adversaire au sol à moins de 52 px. `unblock`, `ground`. La roulade l'esquive.
- **Spécial / Ninjutsu ↑ / ↓** : tir en diagonale / tir bas ; 90 % des dégâts, un seul projectile.

## Règles des soutiens (6.1)
- 2 soutiens par combattant, choisis après le combattant ; l'IA en tire 2 au hasard. Réglage « Soutiens : Oui / Non » ; **1 contre 1 uniquement**.
- Appel : **R1 = soutien 1, L1 = soutien 2** — clavier J1 : E / Q, J2 : P / N ; manette R1 / L1 ; tactile : boutons L1 R1.
- Présence 3 s (`SUP_STAY`), invulnérable ; rappel 12 s (`SUP_CD`, compté une fois parti) ; 4 s (`SUP_START`) en début de manche.
- Comportements (`support.js`) : **interrupt**, **range**, **melee** ; dégâts × 0,85. Les soutiens ne sont pas des cibles, ne comptent pas dans la barre de vie ni le KO.
- HUD : deux vignettes sous la barre de chakra (jaune = prêt, bleu = présent, gris = recharge).

## Règles du chakra et des combinaisons (6.2)
- **△ maintenu** (6 frames) : charge (`state = 'charge'`), +0,5 chakra / frame (~3,5 s de 0 à 100), immobile et vulnérable ; annulée par la garde automatique, un saut, un coup.
- **□** : Shuriken (gratuit, 22 dégâts, récupération 12 frames), au sol et en l'air.
- **△ + ○** : Ninjutsu = Spécial de l'archétype (10 chakra, ↑ / ↓ en plus = tir diagonal / bas). **△ → △ → ○** (deux appuis dans 30 frames) : Technique ultime = Super de l'archétype (50 chakra, cinématique).
- **△ + ✕** : Chakra Dash (20 chakra, invulnérable 8 frames, fonce à 13 px/frame sur ~12 frames, 36 dégâts) ; après un coup au but, ○ enchaîne un Poing (△ → ✕ → ○ ○ ○). **△ + □** : Chakra Shuriken (20 chakra, 3 shurikens à tête chercheuse).
- « △ + bouton » vaut aussi dans les 8 frames qui suivent le relâchement de △.
- **○** (impulsion, pas de répétition en maintenant) : Poing ; **↑ + ○** uppercut (lanceur) ; **↓ + ○** balayage ; **← / → + ○** coup de pied. **✕** = saut. **R2** = garde (↓ aussi). **L2** : pas encore utilisé.
- **Perdu pour le joueur humain avec le nouveau schéma** (toujours utilisé par l'IA) : Technique d'archétype (`move2`), Frappe lourde (Poing + Pied), Pied aérien (`akick`), balayage en l'air ; le Pied sert seulement via ←/→ + ○.

## IA
- 5 niveaux ; 4 personnalités tirées au hasard (`balanced`, `rush`, `zoner`, `turtle`) ; parade volontaire ; projection ; Spéciaux ↑/↓ ; appel des soutiens ; **chakra** : charge quand l'adversaire est loin (« charge »), Shuriken et Chakra Dash à distance moyenne.

---

# 2. Feuille de route (phases 0 à 5)

Règle : une phase = un commit poussé sur `main`, `npm test` doit passer, `RAPPORT.md` mis à jour.

## Phase 0 — Préparation
- [x] Correctif écran noir GitHub Pages (`.nojekyll`) ; moteur lu ; tests lancés par `npm test`

## Phase 1 — Fluidité immédiate
- [x] Tactile, fondu entre poses, tremblement du touché, latence des coups normaux (`TAP = 7`) — **à confirmer par `npm test`**
- [ ] Poses de coup (anticipation / dépassement), hitstop plus long sur coups lourds

## Phase 2 — Performance mobile
- [ ] Cache de poses ; résolution adaptative ; interpolation du rendu ; réutilisation des matériaux d'effets

## Phase 3 — Techniques de combat (ancien schéma)
- [x] Spécial ↑/↓, parade parfaite, projection, IA → le reste est **repris par la phase 6**

## Phase 4 — Visuel des personnages
- [ ] Ombrage à deux tons, contour coloré, torse formé et tenues, visage expressif, mouvement secondaire, squash & stretch, traînées, poses uniques, effet visuel de charge du chakra

## Phase 5 — Effets et décors
- [ ] Étincelles d'impact, effet de parade, flash sur gros coups, avant-plan des décors, sprites 192 px (option)

---

# 3. Phase 6 — Schéma « Storm » (remplace les commandes actuelles)

## Décisions d'Alec (2026-11-07)
- Le nouveau schéma **remplace entièrement** les commandes actuelles.
- Clavier + manette, et **boutons tactiles ajoutés** pour R2, L2, R1, L1.
- On commence par **les soutiens + le combat en équipe**, puis le chakra.

## 3.1 Boutons et fonctions

| Bouton | Fonction |
|---|---|
| ○ | Attaque principale |
| ✕ | Saut (double saut : ✕ puis ✕) |
| □ | Shuriken |
| △ (maintenu) | Charger le chakra |
| △ + ○ | Ninjutsu |
| △ → △ → ○ | Technique ultime (animation cinématique) |
| △ + ✕ | Chakra Dash |
| △ + □ | Chakra Shuriken |
| R2 | Garde |
| R2 + ○ | Projection |
| L2 | Substitution |
| R1 / L1 | Appel des soutiens (le coéquipier apparaît 3 s pour lancer une attaque) |

## 3.2 Correspondance clavier / manette / tactile (en place)

| Action | Joueur 1 (touches physiques) | Joueur 2 | Manette PlayStation | Tactile |
|---|---|---|---|---|
| Déplacement | WASD (« ZQSD » en AZERTY) | Flèches | stick / croix | stick ou croix |
| ○ Attaque | F | J | bouton 1 | ○ |
| ✕ Saut | G | K | bouton 0 | ✕ |
| □ Shuriken | R | U | bouton 2 | □ |
| △ Chakra | T | I | bouton 3 | △ |
| R2 Garde | H | L | gâchette 7 | R2 |
| L2 Substitution (pas encore active) | Y | O | gâchette 6 | L2 |
| R1 Soutien 1 | E | P | bouton 5 | R1 |
| L1 Soutien 2 | Q | N | bouton 4 | L1 |

## 3.3 Combos directionnels (○ répété avec le stick gauche)
- Première version en place (6.2) : ↑+○ uppercut, ↓+○ balayage, ←/→+○ coup de pied (traduits vers les coups existants dans `chords.js`).
- À faire (6.4) : vraies séquences répétées par direction (« ↑ + ○ répété », « ↓ + ○ répété »), projections différentes (lancer dans les airs, repousser, faire tomber), variantes par personnage / archétype pour ←/→.

## 3.4 Combo aérien
Projeter l'adversaire en l'air, le poursuivre (✕ puis double saut), enchaîner les attaques, terminer par une technique spéciale si le chakra le permet.

## 3.5 Chakra Dash Combo
△ (charger) → ✕ (Chakra Dash) → ○ ○ ○ : **en place** au sol (6.2). À faire : poursuivre un adversaire en l'air (6.4).

## 3.6 Techniques spéciales
- **Ninjutsu** (△+○), **Technique ultime** (△△○) : en place (6.2), basés sur le Spécial / Super de l'archétype.
- **Éveil / Awakening** : activé quand les conditions de combat sont réunies ; changement de forme et de capacités (le système `buff` giant / power sert de base) — 6.5.
- **Technique ultime d'équipe** : attaque combinée avec les soutiens — 6.5.

## 3.7 Mécaniques défensives
- Garde R2 : en place (mêmes règles que ↓, parade parfaite incluse). Projection R2 + ○, substitution L2, double saut, guard break : 6.3.
- **Substitution Jutsu** : L2 au moment d'un impact remplace le personnage par une bûche, réapparition ailleurs. **Réserve limitée qui se recharge** (proposition : 3 charges, +1 toutes les 5 s).
- **Guard Break** : jauge de garde ; si elle se vide, la garde est brisée et l'adversaire enchaîne (affichage HUD).

## 3.8 Système de soutien
Selon la section « Règles des soutiens (6.1) ». Reste : protéger le joueur, prolonger un combo, techniques combinées.

## 3.9 Étapes (du plus dur au plus simple)
- [x] **6.1 Soutiens** (première version) — non testé en jeu
  - [ ] 6.1b Soutien qui protège / prolonge un combo ; 6.1c techniques d'équipe ; 6.1d retirer le 2v2 simultané
- [x] **6.2 Chakra + nouveau schéma de boutons** (△ charge, Chakra Dash, Chakra Shuriken, Shuriken, Ninjutsu, Ultime, ○ ✕ □ R2 R1 L1 sur clavier / manette / tactile, IA, écrans) — non testé en jeu
  - [ ] 6.2b Effet visuel de la charge (aura), jauge de chakra qui indique les coûts (10 / 20 / 50), HUD d'entraînement à mettre à jour (`ui/hud.js` affiche encore l'ancien texte de combos)
  - [ ] 6.2c Équilibrage : coût du Ninjutsu (10 aujourd'hui, 25 envisagé), vitesse de charge, portée du Chakra Dash
- [ ] 6.3 Défense : projection R2+○, substitution L2 avec réserve, guard break + HUD, double saut
- [ ] 6.4 Combos directionnels (○ répété par direction) et combos aériens (poursuite, Chakra Dash en l'air), retour d'une frappe lourde
- [ ] 6.5 Éveil et techniques ultimes d'équipe
- [ ] 6.6 Écran Commandes final, options de remappage, tests de `sim.mjs` / `phase3.mjs` réécrits avec les nouvelles actions, README

## Points à trancher en cours de route
- Quels coups précis pour ←/→ + ○ par personnage ou par archétype ?
- Les Techniques d'archétype (`move2` : dash, teleport, pillar, leap, slam, uppercut) : les supprimer, les rattacher au Chakra Dash, ou en faire des variantes du Ninjutsu ?
- Durée de présence (3 s) et rappel (12 s) des soutiens ; coûts du chakra : à régler en jeu.
