# PLAN — Ninja Mugen

Ce fichier contient (1) la structure détaillée du projet et (2) la feuille de route des améliorations. Cocher `[x]` au fur et à mesure ; le suivi détaillé est dans `RAPPORT.md`.

---

# 1. Structure du projet

```
index.html            page de dev (importmap three via CDN, charge js/main.js)
template.html         gabarit pour le build mono-fichier
build.mjs             esbuild -> dist/ninja-mugen.html (three + CSS inclus)
dist/                 jeu en un seul fichier, hors-ligne
test/sim.mjs          simulation du moteur sans navigateur (npm test)
package.json          scripts build / test / start
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
  combos/<coup>.js            un fichier par combo (poing 1-2-3, pied, balayage, uppercut, frappe lourde, coups aériens)
  techniques/<nom>.js         une technique par fichier (touche Technique) + special.js (touche Spécial)
  supers/<nom>.js             une super attaque par fichier
  stages/<nom>.js             un fichier par décor (forest, plains, desert, snow, night, volcano) + _draw.js + index.js
  modes/<mode>.js             arcade, single, survival, training + util.js + index.js
  screens/<écran>.js          title, setup, select, stage, vs, options, controls, result + ctx.js (état partagé) + index.js
  game/                       moteur : fighter (états), world, match, ai, moves (agrégateur), helpers
  render/                     sprites.js (squelette 2D), view.js (three.js, caméra large 640->1200 x 480)
  ui/                         hud.js (barres, combos), menu.js (liste de menu)
```

## Flux
`index.html` -> `js/main.js` -> `go('title')` -> écrans (`js/screens`) -> `G.launch()` -> `Match` (`js/game`) + `View` (`js/render`) + `Hud` (`js/ui`).

---

# 2. Feuille de route

Règle : une phase = un commit poussé sur `main`, `npm test` doit passer, `RAPPORT.md` mis à jour.

## Phase 0 — Préparation
- [x] Correctif écran noir GitHub Pages (`.nojekyll`)
- [ ] Lire le moteur : `game/fighter.js`, `match.js`, `world.js`, `ai.js`, `helpers.js`
- [ ] Vérifier que la logique tourne à pas fixe 1/60 s (sinon accumulateur)
- [ ] Étendre `test/sim.mjs` pour couvrir hitstop, buffer et nouvelles techniques

## Phase 1 — Fluidité immédiate
- [ ] **Hitstop** : gel des deux combattants 3 à 6 frames par coup (plus long : coup lourd, super, KO)
- [ ] **Buffer d'entrées** : mémoriser la dernière touche 6 à 8 frames et la jouer dès que le combattant peut agir
- [ ] **Tactile** : supprimer le délai de 45 ms sur ○ et ✕ (déclencher tout de suite ; promouvoir en super si l'autre bouton arrive sous 3 frames)
- [ ] **Fondu entre poses** : 3 à 4 frames entre états (marche/saut/garde/coup)
- [ ] **Poses de coup** : anticipation avant les coups lourds, léger dépassement à l'impact

## Phase 2 — Performance mobile
- [ ] Ne redessiner le canvas d'un combattant que si sa pose a changé (cache de poses / atlas par personnage)
- [ ] Résolution adaptative (`devicePixelRatio` selon les FPS mesurés)
- [ ] Pas fixe 60 Hz avec accumulateur et interpolation du rendu
- [ ] Réutiliser les matériaux/maillages des effets (moins d'allocations par frame)

## Phase 3 — Techniques de combat
- [ ] **Variantes directionnelles** : ↓+○ et ↑+○ (spéciaux), ↓+✕ et ↑+✕ (techniques)
- [ ] **Défense** : dégâts réduits sur garde, jauge de garde et bris de garde, **parade parfaite** (gain de chakra + contre)
- [ ] **Projection** (saisie) qui bat la garde, esquive par roulade
- [ ] **Combos aériens** : réduction des dégâts par coup (anti-infini), rebond sol/mur
- [ ] **Annulations** : saut / dash / roulade annulant la fin d'un coup ; burst (coût chakra) pour sortir d'un combo
- [ ] **Dash et recul rapide** (recul avec courte invincibilité)
- [ ] **2v2** : changement de partenaire en combat, attaque d'appui
- [ ] **IA** : personnalités (agressive, défensive, piégeuse), temps de réaction selon le niveau
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
- [ ] Image blanche d'une frame sur les gros coups
- [ ] Calque d'avant-plan dans les décors (herbes, brume, flocons) et éclairage réactif aux supers
- [ ] Option : sprites 128 -> 192 px (si les perfs mobiles le permettent)

## Critères de validation
- `npm test` passe, `npm run build` régénère `dist/`
- Menu et combat fonctionnent sur GitHub Pages (page rechargée sans cache)
- 60 FPS stables sur un téléphone moyen en 2v2
