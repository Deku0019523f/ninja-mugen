# PLAN — Ninja Mugen

Ce fichier contient (1) la structure détaillée du projet et (2) la feuille de route des améliorations. Cocher `[x]` au fur et à mesure ; le suivi détaillé est dans `RAPPORT.md`.

---

# 1. Structure du projet

```
index.html            page de dev (importmap three via CDN, charge js/main.js)
template.html         gabarit pour le build mono-fichier
build.mjs             esbuild -> dist/ninja-mugen.html (three + CSS inclus)
dist/                 jeu en un seul fichier, hors-ligne
test/sim.mjs          simulation du moteur sans navigateur
test/phase3.mjs       tests latence, parade parfaite, projection, Spécial ↑/↓, personnalités de l'IA
package.json          scripts build / test (sim + phase3) / start
README.md             présentation et commandes de jeu
RAPPORT.md            mémoire du projet
plan.md               ce fichier
.nojekyll             empêche Jekyll (GitHub Pages) d'ignorer les fichiers en _nom.js

css/
  base.css            plein écran paysage, #view, #ui, bouton retour/pause, message « tournez le téléphone »
  hud.css             barres de vie, chakra, chrono, combos, bannières
  menus.css           écrans et listes de menu
  touch.css           commandes tactiles

js/
  main.js             routeur d'écrans, lancement des matchs, pause, boucle principale
  input.js            clavier (2 joueurs), manette, lecture des commandes
  touch.js            stick analogique / croix, boutons △ □ ○ ✕
  audio.js            sons et musique synthétisés
  data/roster.js      agrégateur : ROSTER (56) + ARCH (18) + hexShade
  characters/<nom>/<nom>.js   un dossier par personnage (56) + index.js (ordre = identifiant) + _make.js (fabrique)
  archetypes/<style>.js       18 styles de combat (projectile, technique, super) + index.js
  combos/<coup>.js            un fichier par combo (poing 1-2-3, pied, balayage, uppercut, frappe lourde, projection, coups aériens)
  techniques/<nom>.js         une technique par fichier (touche Technique) + special.js (touche Spécial et variantes ↑/↓)
  supers/<nom>.js             une super attaque par fichier
  stages/<nom>.js             un fichier par décor (forest, plains, desert, snow, night, volcano) + _draw.js + index.js
  modes/<mode>.js             arcade, single, survival, training + util.js + index.js
  screens/<écran>.js          title, setup, select, stage, vs, options, controls, result + ctx.js (état partagé) + index.js
  game/                       moteur : fighter (états), world, match, ai (niveaux + personnalités), moves (agrégateur), helpers
  render/                     sprites.js (squelette 2D + fondu de poses), view.js (three.js, caméra large 640->1200 x 480)
  ui/                         hud.js (barres, combos), menu.js (liste de menu)
```

## Flux
`index.html` -> `js/main.js` -> `go('title')` -> écrans (`js/screens`) -> `G.launch()` -> `Match` (`js/game`) + `View` (`js/render`) + `Hud` (`js/ui`).

## Moteur (constat après lecture de game/)
- `Match.frame` : accumulateur à pas fixe 1/60 s (`DT`), `speed` pour le ralenti de KO
- `World.update` : `hitstop` gèle la simulation (les entrées continuent d'être bufferisées)
- `Fighter` : `buf` = buffer d'entrées de 8 frames ; annulations après un coup au but ; roulade (bas + direction), garde automatique, relevé (invuln 22), anti-infini (`combo` réduit les dégâts de 7 % par coup, min 30 %), `juggle` max 3
- Hitstop actuel : garde 3, coup 4, gros coup 7, KO 16, super 34 frames ; parade parfaite 9
- **Coups normaux** : le buffer vaut 8 à l'appui puis décroît ; le coup part quand il est <= `TAP` (fighter.js). `TAP = 7` : 1 frame après l'appui (avant : 5, soit 3 frames). Un bouton maintenu ne tire qu'après relâchement (inchangé). Poing+Pied avec plus d'1 frame d'écart donne désormais Poing puis Pied (enchaîné) au lieu de la frappe lourde.

## Règles des nouveaux coups (phase 3)
- **Parade parfaite** : appui frais sur ↓ -> fenêtre de 6 frames (`parryT`). Si un coup non-super arrive de face pendant la garde : 0 dégât, +12 chakra, hitstop 9, l'attaquant au corps à corps passe en `hit` 22 frames. Événement `clash` avec `parry: true`. Maintenir ↓ ne suffit pas ; reculer (garde automatique) ne déclenche pas la parade.
- **Projection** : arrière (mémorisé 8 frames, `backT`) + Poing, adversaire au sol à moins de 52 px. `unblock`, `ground`. La roulade l'esquive (invulnérable).
- **Spécial ↑ / ↓** : ↑ = tir en diagonale ascendante (anti-aérien), ↓ = tir bas rasant ; 90 % des dégâts, un seul projectile.

## IA
- 5 niveaux (`REACT`, `BLOCK`, `CHAIN`, `AGGR`, `PARRY_CH` dans ai.js)
- 4 personnalités (`PERSONALITIES`) : `balanced` (défaut, utilisée par les tests), `rush` (agressif, projections), `zoner` (tirs, garde ses distances), `turtle` (défensif, parades). Tirée au hasard pour chaque adversaire dans `Match.addFighter`.
- Parade volontaire : si un coup adverse s'active dans 1 à 3 frames, l'IA tape ↓ avec une probabilité selon le niveau (0 à 30 %), puis garde 9 frames.

---

# 2. Feuille de route

Règle : une phase = un commit poussé sur `main`, `npm test` doit passer, `RAPPORT.md` mis à jour.

## Phase 0 — Préparation
- [x] Correctif écran noir GitHub Pages (`.nojekyll`)
- [x] Lire le moteur : `fighter.js`, `match.js`, `world.js`, `ai.js`, `helpers.js`, `special.js` (reste : archetypes autres que fire/brawler, techniques, supers)
- [x] Pas fixe 1/60 s : déjà en place (accumulateur dans `Match.frame`)
- [x] `test/phase3.mjs` ajouté (lancé par `npm test`)

## Phase 1 — Fluidité immédiate
- [x] **Hitstop** : déjà présent (voir ci-dessus)
- [x] **Buffer d'entrées** : déjà présent (8 frames)
- [x] **Tactile** : délai de validation ○ / ✕ réduit de 45 ms à 20 ms
- [x] **Fondu entre poses** : 4 frames entre états, 2 frames vers une attaque, pas de fondu vers les réactions
- [x] **Tremblement du combattant touché** pendant le hitstop
- [x] **Latence des coups normaux** : 3 frames -> 1 frame (`TAP = 7`) ; `test/sim.mjs` non modifié, ses scénarios restent valides d'après analyse mais **à confirmer en lançant `npm test`**
- [ ] Tir immédiat d'un bouton maintenu (aujourd'hui : seulement après relâchement)
- [ ] **Poses de coup** : anticipation avant les coups lourds, léger dépassement à l'impact
- [ ] Hitstop plus long sur les coups lourds et le dernier coup d'un combo (réglage à tester en jeu)

## Phase 2 — Performance mobile
- [ ] Ne redessiner le canvas d'un combattant que si sa pose a changé (cache de poses / atlas par personnage)
- [ ] Résolution adaptative (`devicePixelRatio` selon les FPS mesurés)
- [ ] Interpolation du rendu entre deux pas de simulation
- [ ] Réutiliser les matériaux/maillages des effets (moins d'allocations par frame)

## Phase 3 — Techniques de combat
- [x] **Spécial ↓ et ↑** (tir bas / diagonale anti-aérien)
- [ ] Variantes ↓/↑ de la **Technique** (✕) : à définir par technique (dash, teleport, uppercut, pillar, leap, slam)
- [x] **Parade parfaite** (tap ↓) avec gain de chakra et contre
- [ ] **Jauge de garde** et bris de garde (nécessite un affichage dans `ui/hud.js` + `css/hud.css`)
- [x] **Projection** (arrière + Poing au contact), esquivable par roulade
- [ ] **Combos aériens** : rebond sol/mur (l'anti-infini existe déjà)
- [ ] **Annulations** supplémentaires : saut / dash annulant la fin d'un coup ; burst (coût chakra) pour sortir d'un combo
- [ ] **Dash et recul rapide** (recul avec courte invincibilité)
- [ ] **2v2** : changement de partenaire en combat, attaque d'appui
- [x] **IA** : personnalités (balanced, rush, zoner, turtle), parade volontaire, projection, Spécial ↑/↓
- [ ] IA : parer les projectiles, punir les coups à vide
- [ ] **Entraînement** : affichage des hitbox, frames de départ/récupération, dummy enregistrement/lecture

## Phase 4 — Visuel des personnages
- [ ] Ombrage à deux tons (côté clair / sombre) et liseré lumineux
- [ ] Contour coloré teinté selon le vêtement
- [ ] Torse mieux formé (épaules, taille) et tenues variées (robe, veste, armure légère, sans manches)
- [ ] Visage : clignement, douleur, rage, victoire, bouche ouverte en spécial
- [ ] Mouvement secondaire : cheveux/écharpe/cape avec ressort réagissant à la vitesse
- [ ] Squash & stretch (atterrissage / saut)
- [ ] Traînées de mouvement (arc d'épée, images rémanentes de dash)
- [ ] Poses uniques (intro, victoire, attente) au moins pour Kaito, Ren, Mugen, puis le reste

## Phase 5 — Effets et décors
- [ ] Étincelles d'impact et lignes de vitesse aux couleurs de l'archétype
- [ ] Effet visuel propre à la parade parfaite (aujourd'hui : réutilise l'effet `clash`)
- [ ] Image blanche d'une frame sur les gros coups
- [ ] Calque d'avant-plan dans les décors (herbes, brume, flocons) et éclairage réactif aux supers
- [ ] Option : sprites 128 -> 192 px (si les perfs mobiles le permettent)

## Critères de validation
- `npm test` passe, `npm run build` régénère `dist/`
- Menu et combat fonctionnent sur GitHub Pages (page rechargée sans cache)
- 60 FPS stables sur un téléphone moyen en 2v2
