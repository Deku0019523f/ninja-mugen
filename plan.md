# PLAN — Ninja Mugen

Ce fichier contient (1) la structure détaillée du projet, (2) la feuille de route des améliorations, (3) le cahier des charges du nouveau schéma de commandes « Storm » (phase 6). Cocher `[x]` au fur et à mesure ; le suivi détaillé est dans `RAPPORT.md`.

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
- 4 personnalités (`PERSONALITIES`) : `balanced` (défaut, utilisée par les tests), `rush`, `zoner`, `turtle`. Tirée au hasard pour chaque adversaire dans `Match.addFighter`.
- Parade volontaire : si un coup adverse s'active dans 1 à 3 frames, l'IA tape ↓ avec une probabilité selon le niveau (0 à 30 %), puis garde 9 frames.

---

# 2. Feuille de route (phases 0 à 5)

Règle : une phase = un commit poussé sur `main`, `npm test` doit passer, `RAPPORT.md` mis à jour.

## Phase 0 — Préparation
- [x] Correctif écran noir GitHub Pages (`.nojekyll`)
- [x] Lire le moteur : `fighter.js`, `match.js`, `world.js`, `ai.js`, `helpers.js`, `special.js`
- [x] Pas fixe 1/60 s : déjà en place
- [x] `test/phase3.mjs` ajouté (lancé par `npm test`)

## Phase 1 — Fluidité immédiate
- [x] Hitstop et buffer d'entrées : déjà présents
- [x] Tactile : délai ○ / ✕ réduit de 45 ms à 20 ms
- [x] Fondu entre poses ; tremblement du combattant touché
- [x] Latence des coups normaux : 3 frames -> 1 frame (`TAP = 7`) — **à confirmer par `npm test`**
- [ ] Tir immédiat d'un bouton maintenu
- [ ] Poses de coup : anticipation / dépassement ; hitstop plus long sur coups lourds

## Phase 2 — Performance mobile
- [ ] Cache de poses (ne redessiner que si la pose change) ; résolution adaptative ; interpolation du rendu ; réutilisation des matériaux d'effets

## Phase 3 — Techniques de combat (ancien schéma)
- [x] Spécial ↑/↓, parade parfaite, projection, IA (personnalités + parade)
- [ ] Variantes de la Technique, jauge de garde, combos aériens, annulations, dash/recul, 2v2, entraînement → **repris et redéfinis par la phase 6**

## Phase 4 — Visuel des personnages
- [ ] Ombrage à deux tons, contour coloré, torse formé et tenues, visage expressif, mouvement secondaire, squash & stretch, traînées, poses uniques

## Phase 5 — Effets et décors
- [ ] Étincelles d'impact, effet de parade, flash sur gros coups, avant-plan des décors, sprites 192 px (option)

---

# 3. Phase 6 — Schéma « Storm » (remplace les commandes actuelles)

## Décisions d'Alec (2026-11-07)
- Le nouveau schéma **remplace entièrement** les commandes actuelles (plus de Poing/Pied/Spécial/Technique/Super séparés).
- Clavier + manette, et **boutons tactiles ajoutés** pour R2, L2, R1, L1.
- On commence par **les soutiens + le combat en équipe**.

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

## 3.2 Correspondance proposition (modifiable dans Options)

| Action | Joueur 1 (clavier, touches physiques) | Joueur 2 | Manette (mapping standard) | Tactile |
|---|---|---|---|---|
| Déplacement / haut / bas | WASD (« ZQSD » en AZERTY) | Flèches | stick / croix | stick ou croix |
| ○ Attaque | F | J | bouton 1 | ○ |
| ✕ Saut | G | K | bouton 0 | ✕ |
| □ Shuriken | R | U | bouton 2 | □ |
| △ Chakra | T | I | bouton 3 | △ |
| R2 Garde | H | L | gâchette 7 | bouton ajouté |
| L2 Substitution | E | O | gâchette 6 | bouton ajouté |
| R1 Soutien 1 | Y | P | bouton 5 | bouton ajouté |
| L1 Soutien 2 | Q | N | bouton 4 | bouton ajouté |

Détection des enchaînements : △ maintenu + (○ / ✕ / □) = Ninjutsu / Chakra Dash / Chakra Shuriken ; △ tap, △ tap, ○ (fenêtre ~20 frames) = Ultime ; R2 maintenu + ○ = Projection.

## 3.3 Combos directionnels (○ répété avec le stick gauche)
- ○ répété : combo normal
- ↑ + ○ répété : variante haute (lanceur, anti-aérien)
- ↓ + ○ répété : variante basse (balayage, fait tomber)
- ← ou → + ○ : variante directionnelle selon le personnage
- Les variantes ont des projections différentes : lancer dans les airs, repousser, faire tomber.
- Traduction avec le moteur actuel : ↑+○ = `upper`, ↓+○ = `sweep`, ←/→+○ = `kick` (variante par archétype à définir). L'ancien Pied n'existe plus comme bouton.

## 3.4 Combo aérien
Projeter l'adversaire en l'air, le poursuivre (✕ puis double saut), enchaîner les attaques, terminer par une technique spéciale si les conditions le permettent (chakra suffisant).

## 3.5 Chakra Dash Combo
△ (charger) → ✕ (Chakra Dash : fonce vers l'adversaire, peut servir à le poursuivre) → ○ ○ ○. Le Chakra Dash peut prolonger certaines séquences.

## 3.6 Techniques spéciales
- **Ninjutsu** (△+○) : propre à chaque personnage (aujourd'hui : le « Spécial » de l'archétype).
- **Technique ultime** (△△○) : animation cinématique (aujourd'hui : le « Super » de l'archétype).
- **Éveil / Awakening** : activé quand les conditions de combat sont réunies ; changement de forme et de capacités (le système `buff` existant — giant / power — sert de base).
- **Technique ultime d'équipe** : attaque combinée avec les soutiens.

## 3.7 Mécaniques défensives
| Mécanique | Commande | Fonction |
|---|---|---|
| Garde | R2 | Bloquer |
| Substitution | L2 | Échapper à une attaque au moment de l'impact |
| Projection | R2 + ○ | Attraper et projeter |
| Double saut | ✕ puis ✕ | Sauter deux fois |

- **Substitution Jutsu** : L2 au moment d'un impact remplace le personnage par une bûche, réapparition ailleurs. **Réserve limitée qui se recharge progressivement** (proposition : 3 charges, +1 toutes les 5 s).
- **Guard Break** : si la garde encaisse trop d'attaques, elle est brisée ; l'adversaire en profite pour lancer un combo. (jauge de garde + affichage HUD)

## 3.8 Système de soutien (Support System)
Le joueur sélectionne **deux personnages de soutien**. Ils peuvent : attaquer l'adversaire, prolonger un combo, interrompre une attaque ennemie, protéger le joueur, participer à certaines techniques combinées.

## 3.9 Architecture proposée (pour limiter les régressions)
- `js/input.js` traduit les nouveaux boutons en actions logiques : `o x sq tri r2 l2 r1 l1` + directions ; le moteur reçoit ces actions. Les anciens noms (`punch kick special move2 super`) sont supprimés au fur et à mesure ; `test/sim.mjs` et `test/phase3.mjs` sont réécrits avec les nouvelles actions.
- **Soutiens** = `Fighter` supplémentaires de l'équipe, marqués `support: true`, hors écran tant qu'ils ne sont pas appelés ; à l'appel (R1/L1) ils apparaissent, jouent une attaque (selon leur archétype) pendant 3 s, puis repartent ; cooldown par soutien. Ils ne comptent pas dans la barre de vie ni dans la condition de KO de l'équipe. Le format 2v2 simultané actuel est remplacé par « équipe » = 1 combattant + 2 soutiens.
- Écran de sélection : choix du combattant puis de 2 soutiens ; l'IA choisit ses soutiens au hasard.

## 3.10 Étapes (du plus dur au plus simple, selon la demande)
- [ ] **6.1 Soutiens + combat en équipe** (R1/L1, sélection de 2 soutiens, IA, tests)
- [ ] 6.2 Chakra : △ charge, Chakra Dash, Chakra Shuriken, Ninjutsu (△+○), Ultime (△△○), Shuriken (□)
- [ ] 6.3 Défense : R2 garde, projection R2+○, substitution L2 avec réserve, guard break + HUD, double saut
- [ ] 6.4 Combos directionnels (○ + direction) et combos aériens
- [ ] 6.5 Éveil et techniques ultimes d'équipe
- [ ] 6.6 Nouveau tactile (boutons R2/L2/R1/L1), écran Commandes, options de remappage, tests réécrits, README

## Points à trancher en cours de route
- Quels coups précis pour ←/→ + ○ par personnage ou par archétype ?
- Durée de présence (3 s), cooldown des soutiens, comportement des soutiens (attaque unique, ou action selon la situation : prolonger un combo / interrompre / protéger).
- Coût en chakra du Ninjutsu, du Chakra Dash et de l'Ultime ; vitesse de charge du △.
