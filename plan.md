# PLAN — Ninja Mugen

Ce fichier contient (1) la structure détaillée du projet, (2) la feuille de route des améliorations, (3) le cahier des charges du nouveau schéma de commandes « Storm » (phase 6). Cocher `[x]` au fur et à mesure ; le suivi détaillé est dans `RAPPORT.md`.

---

# 1. Structure du projet

```
index.html            page de dev (importmap three via CDN, charge js/main.js)
template.html         gabarit pour le build mono-fichier
build.mjs             esbuild -> dist/ninja-mugen.html (three + CSS inclus)
dist/                 jeu en un seul fichier, hors-ligne (a besoin de `npm run build` après chaque modification)
test/sim.mjs          simulation du moteur sans navigateur
test/phase3.mjs       tests latence, parade parfaite, projection, Spécial ↑/↓, personnalités de l'IA
test/support.mjs      tests des soutiens (apparition, rappel, corps à corps, tir, interruption, IA)
package.json          scripts build / test (sim + phase3 + support) / start
README.md             présentation et commandes de jeu
RAPPORT.md            mémoire du projet
plan.md               ce fichier
.nojekyll             empêche Jekyll (GitHub Pages) d'ignorer les fichiers en _nom.js

css/
  base.css            plein écran paysage, #view, #ui, bouton retour/pause, message « tournez le téléphone »
  hud.css             barres de vie, chakra, chrono, combos, bannières
  menus.css           écrans et listes de menu
  touch.css           commandes tactiles (stick/croix, losange, R1/L1)

js/
  main.js             routeur d'écrans, lancement des matchs, pause, boucle principale
  input.js            clavier (2 joueurs), manette, lecture des commandes
  touch.js            stick analogique / croix, boutons △ □ ○ ✕, boutons R1 / L1
  audio.js            sons et musique synthétisés
  data/roster.js      agrégateur : ROSTER (56) + ARCH (18) + hexShade
  characters/<nom>/<nom>.js   un dossier par personnage (56) + index.js (ordre = identifiant) + _make.js (fabrique)
  archetypes/<style>.js       18 styles de combat (projectile, technique, super) + index.js
  combos/<coup>.js            un fichier par combo (poing 1-2-3, pied, balayage, uppercut, frappe lourde, projection, coups aériens)
  techniques/<nom>.js         une technique par fichier (touche Technique) + special.js (touche Spécial et variantes ↑/↓)
  supers/<nom>.js             une super attaque par fichier
  stages/<nom>.js             un fichier par décor (forest, plains, desert, snow, night, volcano) + _draw.js + index.js
  modes/<mode>.js             arcade, single, survival, training + util.js + index.js
  screens/<écran>.js          title, setup, select (combattant + 2 soutiens), stage, vs, options, controls, result + ctx.js (état partagé) + index.js
  game/                       moteur : fighter (états), world, match, ai (niveaux + personnalités), support (soutiens), moves (agrégateur), helpers
  render/                     sprites.js (squelette 2D + fondu de poses), view.js (three.js, caméra large 640->1200 x 480)
  ui/                         hud.js (barres, combos, soutiens), menu.js (liste de menu)
```

## Flux
`index.html` -> `js/main.js` -> `go('title')` -> écrans (`js/screens`) -> `G.launch()` -> `Match` (`js/game`) + `View` (`js/render`) + `Hud` (`js/ui`).

## Moteur (constat après lecture de game/)
- `Match.frame` : accumulateur à pas fixe 1/60 s (`DT`), `speed` pour le ralenti de KO
- `World.update` : `hitstop` gèle la simulation (les entrées continuent d'être bufferisées)
- `Fighter` : `buf` = buffer d'entrées de 8 frames ; annulations après un coup au but ; roulade (bas + direction), garde automatique, relevé (invuln 22), anti-infini (`combo` réduit les dégâts de 7 % par coup, min 30 %), `juggle` max 3
- Hitstop actuel : garde 3, coup 4, gros coup 7, KO 16, super 34 frames ; parade parfaite 9
- **Coups normaux** : le coup part quand le buffer est <= `TAP` (fighter.js). `TAP = 7` : 1 frame après l'appui (avant : 5, soit 3 frames). Un bouton maintenu ne tire qu'après relâchement.

## Règles des nouveaux coups (phase 3)
- **Parade parfaite** : appui frais sur ↓ -> fenêtre de 6 frames (`parryT`). Coup non-super de face pendant la garde : 0 dégât, +12 chakra, hitstop 9, l'attaquant au corps à corps passe en `hit` 22 frames. Événement `clash` avec `parry: true`.
- **Projection** : arrière (mémorisé 8 frames, `backT`) + Poing, adversaire au sol à moins de 52 px. `unblock`, `ground`. La roulade l'esquive.
- **Spécial ↑ / ↓** : tir en diagonale (anti-aérien) / tir bas rasant ; 90 % des dégâts, un seul projectile.

## Règles des soutiens (6.1)
- 2 soutiens par combattant, choisis après le combattant (écran de sélection) ; l'IA en tire 2 au hasard. Réglage « Soutiens : Oui / Non » dans l'écran de configuration ; **1 contre 1 uniquement** (indisponible en 2 contre 2).
- Appel : **R1 = soutien 1, L1 = soutien 2** — clavier J1 : **E / Q**, J2 : **P / N** ; manette : R1 / L1 (le Super de la manette passe sur R2) ; tactile : deux boutons au-dessus du losange.
- Présence 3 s (`SUP_STAY` = 180 frames), invulnérable, ne bouscule personne ; délai de rappel 12 s (`SUP_CD` = 720, compté une fois le soutien reparti) ; 4 s (`SUP_START`) au début de chaque manche.
- Trois comportements choisis à l'appel (`support.js`) : **interrupt** (l'adversaire est en train d'attaquer à moins de 260 px : le soutien apparaît devant lui et frappe tout de suite), **range** (adversaire à plus de 220 px : 2 tirs de Spécial), **melee** (marche vers l'adversaire et enchaîne les Poings). Dégâts × 0,85.
- Les soutiens ne sont pas des cibles (les coups adverses les traversent), ne comptent pas dans la barre de vie ni dans le KO (`World.team` les exclut). Hors-jeu = `hp 0`, `dead`, `x = 99999`, ignorés par `World.update` (`f.out`).
- HUD : deux vignettes sous la barre de chakra (bord jaune = prêt, bleu = présent, gris = en recharge, jauge de recharge).
- IA : appelle les soutiens (0,3 à 0,9 % par frame une fois prêts, 5 % quand elle est touchée).

## IA
- 5 niveaux (`REACT`, `BLOCK`, `CHAIN`, `AGGR`, `PARRY_CH` dans ai.js)
- 4 personnalités (`PERSONALITIES`) : `balanced` (défaut, utilisée par les tests), `rush`, `zoner`, `turtle`. Tirée au hasard pour chaque adversaire dans `Match.addFighter`.
- Parade volontaire : si un coup adverse s'active dans 1 à 3 frames, l'IA tape ↓ avec une probabilité selon le niveau (0 à 30 %), puis garde 9 frames.

---

# 2. Feuille de route (phases 0 à 5)

Règle : une phase = un commit poussé sur `main`, `npm test` doit passer, `RAPPORT.md` mis à jour.

## Phase 0 — Préparation
- [x] Correctif écran noir GitHub Pages (`.nojekyll`)
- [x] Lire le moteur ; pas fixe 1/60 s déjà en place ; `test/phase3.mjs` et `test/support.mjs` lancés par `npm test`

## Phase 1 — Fluidité immédiate
- [x] Hitstop et buffer d'entrées : déjà présents
- [x] Tactile : délai ○ / ✕ réduit de 45 ms à 20 ms ; fondu entre poses ; tremblement du combattant touché
- [x] Latence des coups normaux : 3 frames -> 1 frame (`TAP = 7`) — **à confirmer par `npm test`**
- [ ] Tir immédiat d'un bouton maintenu ; poses de coup (anticipation / dépassement) ; hitstop plus long sur coups lourds

## Phase 2 — Performance mobile
- [ ] Cache de poses ; résolution adaptative ; interpolation du rendu ; réutilisation des matériaux d'effets

## Phase 3 — Techniques de combat (ancien schéma)
- [x] Spécial ↑/↓, parade parfaite, projection, IA (personnalités + parade)
- [ ] Reste → **repris et redéfini par la phase 6**

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

## 3.2 Correspondance clavier / manette / tactile (modifiable dans Options)

| Action | Joueur 1 (clavier, touches physiques) | Joueur 2 | Manette (mapping standard) | Tactile |
|---|---|---|---|---|
| Déplacement / haut / bas | WASD (« ZQSD » en AZERTY) | Flèches | stick / croix | stick ou croix |
| ○ Attaque | F | J | bouton 1 | ○ |
| ✕ Saut | G | K | bouton 0 | ✕ |
| □ Shuriken | R | U | bouton 2 | □ |
| △ Chakra | T | I | bouton 3 | △ |
| R2 Garde | H | L | gâchette 7 | bouton à ajouter |
| L2 Substitution | Y | O | gâchette 6 | bouton à ajouter |
| **R1 Soutien 1 (fait)** | **E** | **P** | **bouton 5** | **bouton R1 (fait)** |
| **L1 Soutien 2 (fait)** | **Q** | **N** | **bouton 4** | **bouton L1 (fait)** |

Note : R1 / L1 ont été placés sur E / Q (et non Y / Q comme proposé d'abord) parce que Y est encore le Super de l'ancien schéma ; L2 prendra Y quand l'ancien Super disparaîtra. Sur la manette, le Super est passé de R1/R2 à R2 seul.

Détection des enchaînements : △ maintenu + (○ / ✕ / □) = Ninjutsu / Chakra Dash / Chakra Shuriken ; △ tap, △ tap, ○ (fenêtre ~20 frames) = Ultime ; R2 maintenu + ○ = Projection.

## 3.3 Combos directionnels (○ répété avec le stick gauche)
- ○ répété : combo normal · ↑ + ○ répété : variante haute · ↓ + ○ répété : variante basse · ← ou → + ○ : variante directionnelle selon le personnage
- Les variantes ont des projections différentes : lancer dans les airs, repousser, faire tomber.
- Traduction avec le moteur actuel : ↑+○ = `upper`, ↓+○ = `sweep`, ←/→+○ = `kick` (variante par archétype à définir). L'ancien Pied n'existe plus comme bouton.

## 3.4 Combo aérien
Projeter l'adversaire en l'air, le poursuivre (✕ puis double saut), enchaîner les attaques, terminer par une technique spéciale si le chakra le permet.

## 3.5 Chakra Dash Combo
△ (charger) → ✕ (Chakra Dash : fonce vers l'adversaire, peut servir à le poursuivre) → ○ ○ ○.

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
- **Guard Break** : si la garde encaisse trop d'attaques, elle est brisée ; l'adversaire en profite pour lancer un combo (jauge de garde + affichage HUD).

## 3.8 Système de soutien (Support System)
Le joueur sélectionne **deux personnages de soutien**. Ils peuvent : attaquer l'adversaire, prolonger un combo, interrompre une attaque ennemie, protéger le joueur, participer à certaines techniques combinées. (Règles implémentées : voir « Règles des soutiens (6.1) » plus haut.)

## 3.9 Architecture
- `js/input.js` traduit les boutons en actions logiques. Pour l'instant les anciennes actions (`punch kick special move2 super`) coexistent avec `sup1 sup2` ; elles seront remplacées par `o x sq tri r2 l2` (6.2 à 6.4) et `test/sim.mjs`, `test/phase3.mjs` réécrits.
- **Soutiens** = `Fighter` supplémentaires de l'équipe (`support: true`), voir `js/game/support.js`.
- Le format 2v2 simultané existe encore ; il sera retiré quand l'équipe « 1 combattant + 2 soutiens » sera validée en jeu.

## 3.10 Étapes (du plus dur au plus simple, selon la demande)
- [x] **6.1 Soutiens (première version)** : sélection de 2 soutiens, R1/L1 (clavier, manette, tactile), présence 3 s, rappel 12 s, 3 comportements, IA, HUD, tests — **non testé en jeu**
  - [ ] 6.1b Soutien qui « protège » le joueur (bouclier / garde du combattant) et qui prolonge un combo en cours
  - [ ] 6.1c Techniques d'équipe (attaque combinée) ; soutiens en mode Entraînement (dummy sans soutien)
  - [ ] 6.1d Retirer le 2v2 simultané une fois l'équipe validée
- [ ] 6.2 Chakra : △ charge, Chakra Dash, Chakra Shuriken, Ninjutsu (△+○), Ultime (△△○), Shuriken (□)
- [ ] 6.3 Défense : R2 garde, projection R2+○, substitution L2 avec réserve, guard break + HUD, double saut
- [ ] 6.4 Combos directionnels (○ + direction) et combos aériens
- [ ] 6.5 Éveil et techniques ultimes d'équipe
- [ ] 6.6 Nouveau tactile (R2/L2), écran Commandes, options de remappage, tests réécrits, README

## Points à trancher en cours de route
- Quels coups précis pour ←/→ + ○ par personnage ou par archétype ?
- Durée de présence (3 s) et délai de rappel (12 s) des soutiens : à régler en jeu.
- Coût en chakra du Ninjutsu, du Chakra Dash et de l'Ultime ; vitesse de charge du △.
