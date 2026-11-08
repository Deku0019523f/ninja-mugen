# PLAN — Ninja Mugen

Ce fichier contient (1) la structure détaillée du projet, (2) la feuille de route des améliorations, (3) le cahier des charges du schéma de commandes « Storm » (phase 6). Cocher `[x]` au fur et à mesure ; le suivi détaillé est dans `RAPPORT.md`.

> **Attention — travail en parallèle** : le dépôt est aussi modifié par une autre session (PR « UI refonte » du 2026-11-08 : `js/ui/icons.js`, `js/ui/shell.js`, écrans roster / règles / options / guide des combos, CSS ; écran de sélection façon Storm ; boutons tactiles L2 / R2 déplacés à gauche). Avant d'écrire un fichier existant, **le relire sur `main`** : un commit 6.4 a écrasé `js/screens/controls.js` par erreur (restauré depuis la PR dans le commit suivant). Les descriptions d'écrans et de disposition tactile ci-dessous datent d'avant cette refonte et sont à relire dans le code.

---

# 1. Structure du projet

```
index.html            page de dev (importmap three via CDN, charge js/main.js)
template.html         gabarit pour le build mono-fichier
build.mjs             esbuild -> dist/ninja-mugen.html (three + CSS inclus)
dist/                 jeu en un seul fichier, hors-ligne (a besoin de `npm run build` après chaque modification)
test/sim.mjs          simulation du moteur sans navigateur (actions internes punch/kick/special/move2/super)
test/phase3.mjs       latence, parade parfaite, projection (arrière + Poing), Spécial ↑/↓, personnalités de l'IA
test/support.mjs      soutiens (apparition, rappel, corps à corps, tir, interruption, IA)
test/chords.mjs       combinaisons de boutons (△+○, △△○, △+✕, △+□, charge, ○ + ↑ / ↓ / ←→, R2, R2+○, L2)
test/chakra.mjs       charge du chakra, Shuriken, Chakra Shuriken, Chakra Dash
test/defense.mjs      projection R2+○, double saut, substitution (esquive, sortie de combo, recharge), rupture de garde
test/combos.mjs       chaînes haute / basse / latérale, bifurcation, uppercut + Chakra Dash de poursuite, combo aérien
test/ai_all.mjs       couverture de l'IA : 8 combats IA contre IA, elle doit utiliser toutes les capacités du joueur
package.json          scripts build / test (les 8 fichiers de test) / start
README.md             présentation et commandes de jeu (à réécrire pour le nouveau schéma : 6.6)
RAPPORT.md            mémoire du projet
plan.md               ce fichier
.nojekyll             empêche Jekyll (GitHub Pages) d'ignorer les fichiers en _nom.js

css/                  base, hud, menus, touch (+ fichiers ajoutés par la refonte UI)

js/
  main.js             routeur d'écrans, lancement des matchs, pause, boucle principale
  input.js            clavier (2 joueurs), manette, tactile -> boutons PHYSIQUES (o x sq tri r2 l2 sup1 sup2 + directions)
  touch.js            stick analogique / croix, losange, boutons L1 R1 L2 R2
  audio.js            sons et musique synthétisés
  data/roster.js      agrégateur : ROSTER (56) + ARCH (18) + hexShade
  characters/<nom>/<nom>.js   un dossier par personnage (56) + index.js (ordre = identifiant) + _make.js (fabrique)
  archetypes/<style>.js       18 styles de combat (projectile, technique, super) + index.js
  combos/<coup>.js            un fichier par coup de base (voir « Chaînes de combos ») + index.js (liste + SIDE_FINISH)
  techniques/<nom>.js         techniques d'archétype (IA seulement) + special.js (Ninjutsu et variantes ↑/↓) + chakra.js (Shuriken, Chakra Shuriken, Chakra Dash)
  supers/<nom>.js             une super attaque par fichier (Technique ultime)
  stages/<nom>.js             un fichier par décor + _draw.js + index.js
  modes/<mode>.js             arcade, single, survival, training + util.js + index.js
  screens/<écran>.js          écrans (titre, configuration, sélection, décor, VS, options, guide des combos, résultat…) + ctx.js + index.js
  game/                       moteur : fighter (états), world, match, ai (niveaux + personnalités), chords (combinaisons), support (soutiens), moves (agrégateur), helpers
  render/                     sprites.js (squelette 2D + fondu de poses), view.js (three.js, caméra large 640->1200 x 480)
  ui/                         hud.js (barres, chakra, garde, substitution, combos, soutiens), menu.js, + icons.js et shell.js (refonte UI)
```

## Flux
`index.html` -> `js/main.js` -> `go('title')` -> écrans (`js/screens`) -> `G.launch()` -> `Match` (`js/game`) + `View` (`js/render`) + `Hud` (`js/ui`).
Entrées d'un joueur humain : `readPlayer()` (boutons physiques) -> `Chord.map()` (combinaisons) -> actions du moteur -> `Fighter`. L'IA et les soutiens produisent directement les actions du moteur.

## Moteur (constat après lecture de game/)
- `Match.frame` : accumulateur à pas fixe 1/60 s (`DT`), `speed` pour le ralenti de KO
- `World.update` : `hitstop` gèle la simulation (les entrées continuent d'être bufferisées, y compris pendant le gel)
- `Fighter` : `buf` = buffer d'entrées de 8 frames (`BTN` dans moves.js) ; annulations après un coup au but ; roulade (bas + direction), garde automatique, relevé (invuln 22), anti-infini (`combo` réduit les dégâts de 7 % par coup, min 30 %), `juggle` max 3
- Hitstop actuel : garde 3, coup 4, gros coup 7, KO 16, super 34 frames ; parade parfaite 9
- **Coups normaux** : le coup part quand le buffer est <= `TAP` (fighter.js). `TAP = 7` : 1 frame après l'appui. Les actions directionnelles `high` / `low` / `side` partent immédiatement.
- **Vocabulaire interne des actions** (valide pour l'IA et les tests) : `l r u d punch kick high low side special move2 super sq cdash cshuriken charge sub throw sup1 sup2`.

## Chaînes de combos (6.4)
La direction est lue au moment de chaque appui sur ○ (`chords.js`) ; chaque ○ d'une chaîne peut bifurquer vers une autre chaîne (champ `cancels` de chaque coup, clés `punch kick high low side`).

| Chaîne | Entrée | Coups (dégâts) | Effet |
|---|---|---|---|
| Normale | ○ ○ ○ | `punch1` 32 → `punch2` 36 → `punch3` 54 | lance à la fin |
| Haute | ↑+○ ↑+○ | `upper` 58 (lanceur, vy 12,5) → `rise` 40 (bond aérien à la poursuite) → ○ aérien | lance dans les airs |
| Basse | ↓+○ ×3 | `cjab` 24 → `shin` 30 → `trip` 44 | fait tomber |
| Latérale | ←/→+○ ×3 | `palm` 30 → `palm2` 34 → finisseur `sidefin` | repousse |
| Aérienne | ○ ○ ○ en l'air | `apunch` 38 → `apunch2` 34 → `akick` 55 | spike |

- Finisseur latéral par archétype (`SIDE_FINISH`) : `hook` (58, repousse loin) pour brawler, fury, earth, bone, blade, sand ; `kick` (62) pour les autres.
- Bifurcations : `punch1` accepte `high` (→ `upper`), `low` (→ `shin`), `side` (→ `palm2`) ; `punch2` : `high`, `low` (→ `trip`), `side` (→ finisseur) ; `cjab`, `shin`, `palm`, `palm2` bifurquent de même.
- En l'air, un coup de chaîne annulé est remplacé par son équivalent aérien (`AIRMAP` dans fighter.js).
- **Chakra Dash de poursuite** : si l'adversaire est en l'air (y > 25), le dash monte à sa hauteur (vy suit y + 30) ; utilisable en l'air et comme annulation après n'importe quel coup au but (`B.cdash`, 20 chakra) ; après lui, ○ enchaine un Poing (aérien si en l'air).
- **Non restauré pour le joueur** : la Frappe lourde (Poing + Pied) — le brise-garde passe par la jauge de garde.

## Règles des coups et de la défense
- **Parade parfaite** : appui frais sur ↓ **ou R2** -> fenêtre de 6 frames (`parryT`). Coup non-super de face pendant la garde : 0 dégât, +12 chakra, -25 de jauge de garde, hitstop 9, l'attaquant au corps à corps passe en `hit` 22 frames.
- **Projection** : **R2 + ○** (action `throw`) : au contact (< 52 px, adversaire au sol) coup `throw` (70 dégâts, `unblock`, `ground`) ; sinon simple Poing. L'IA utilise maintenant aussi l'action `throw`. La roulade et la substitution l'esquivent.
- **Spécial / Ninjutsu ↑ / ↓** : tir en diagonale / tir bas ; 90 % des dégâts, un seul projectile.
- **Substitution (L2)** : réserve de 3 charges, +1 toutes les 300 frames (5 s). Action mémorisée 8 frames : pressée juste avant un impact, le coup tombe sur la bûche (`receive` renvoie `miss`) ; pressée pendant `hit`, `launch` ou `blockstun`, elle sort du combo. Réapparition 70 px derrière l'attaquant, au sol, invulnérable 22 frames, jauge de garde remise à 0.
- **Garde brisée** : chaque coup bloqué ajoute `dégâts x 0,55` à la jauge (`guard`, max 100) ; hors garde elle baisse de 0,35 par frame. Pleine : le coup passe, étourdissement 55 frames, jauge à 0, événements `break` et `clash`. Les coups `unblock` ne la remplissent pas.
- **Double saut** : nouvel appui sur ↑ / ✕ en l'air (`uEdge`), une fois par saut (`airJumps`), vitesse × 0,88.

## Règles des soutiens (6.1)
- 2 soutiens par combattant, choisis après le combattant ; l'IA en tire 2 au hasard. Réglage « Soutiens : Oui / Non » ; **1 contre 1 uniquement**.
- Appel : **R1 = soutien 1, L1 = soutien 2** — clavier J1 : E / Q, J2 : P / N ; manette R1 / L1 ; tactile : boutons L1 R1.
- Présence 3 s (`SUP_STAY`), invulnérable ; rappel 12 s (`SUP_CD`) ; 4 s (`SUP_START`) en début de manche.
- Comportements (`support.js`) : **interrupt**, **range**, **melee** ; dégâts × 0,85. Ne sont pas des cibles, ne comptent pas dans la barre de vie ni le KO.

## Règles du chakra et des combinaisons (6.2)
- **△ maintenu** (6 frames) : charge, +0,5 chakra / frame, immobile et vulnérable.
- **□** : Shuriken (gratuit, 22 dégâts), au sol et en l'air. **△ + □** : Chakra Shuriken (20 chakra, 3 shurikens à tête chercheuse).
- **△ + ○** : Ninjutsu = Spécial de l'archétype (10 chakra). **△ → △ → ○** : Technique ultime = Super de l'archétype (50 chakra, cinématique).
- **△ + ✕** : Chakra Dash (20 chakra, invulnérable 8 frames, 13 px/frame sur ~12 frames, 36 dégâts). « △ + bouton » vaut aussi dans les 8 frames qui suivent le relâchement de △.
- **✕** = saut. **R2** = garde (↓ aussi).
- **Perdu pour le joueur humain** (toujours utilisé par l'IA) : Technique d'archétype (`move2`), Frappe lourde, `kick`/`sweep` comme boutons.

## IA (6.4 : elle utilise toutes les capacités du joueur)
- 5 niveaux ; 4 personnalités tirées au hasard (`balanced`, `rush`, `zoner`, `turtle`).
- Au sol : chaîne normale 32 %, latérale 12 %, basse 10 %, haute 8 % (au contact) ; haute en anti-aérien ; projection contre un adversaire qui garde (30 à 62 % selon niveau) et au hasard au contact ; Shuriken, Chakra Dash et Chakra Shuriken à distance moyenne ; Ninjutsu ↑ / ↓ ; Technique ultime ; charge quand l'adversaire est loin ; garde ; parade volontaire ; **roulade** pour éviter une menace (3 à 14 %) ; substitution ; soutiens.
- Pendant un combo : enchaine les chaînes via `cancels` (toutes les touches), Chakra Dash, Ninjutsu, Technique ultime.
- En l'air : **double saut**, **Chakra Dash de poursuite**, coups aériens, Shuriken, Chakra Shuriken.
- `test/ai_all.mjs` vérifie que 15 capacités sont utilisées au moins une fois sur 8 combats de 6000 frames.

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
- [ ] Ombrage à deux tons, contour coloré, torse formé et tenues, visage expressif, mouvement secondaire, squash & stretch, traînées, poses uniques, aura de charge du chakra, vraie bûche de substitution, effet du double saut, **poses propres aux nouveaux coups** (cjab, shin, trip, palm, palm2, hook, rise, apunch2 réutilisent des poses existantes)

## Phase 5 — Effets et décors
- [ ] Étincelles d'impact, effet de parade et de garde brisée, flash sur gros coups, avant-plan des décors, sprites 192 px (option)

---

# 3. Phase 6 — Schéma « Storm » (remplace les commandes actuelles)

## Décisions d'Alec (2026-11-07 / 08)
- Le nouveau schéma **remplace entièrement** les commandes actuelles.
- Clavier + manette, et **boutons tactiles ajoutés** pour R2, L2, R1, L1.
- On commence par les soutiens, puis le chakra, puis la défense, puis les combos.
- **L'IA doit pouvoir faire tout ce que fait le joueur** (2026-11-08).

## 3.1 Boutons et fonctions

| Bouton | Fonction |
|---|---|
| ○ | Attaque principale (chaînes normale / haute / basse / latérale selon la direction) |
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

## 3.2 Correspondance clavier / manette / tactile

| Action | Joueur 1 (touches physiques) | Joueur 2 | Manette PlayStation | Tactile |
|---|---|---|---|---|
| Déplacement | WASD (« ZQSD » en AZERTY) | Flèches | stick / croix | stick ou croix |
| ○ Attaque | F | J | bouton 1 | ○ |
| ✕ Saut | G | K | bouton 0 | ✕ |
| □ Shuriken | R | U | bouton 2 | □ |
| △ Chakra | T | I | bouton 3 | △ |
| R2 Garde | H | L | gâchette 7 | R2 |
| L2 Substitution | Y | O | gâchette 6 | L2 |
| R1 Soutien 1 | E | P | bouton 5 | R1 |
| L1 Soutien 2 | Q | N | bouton 4 | L1 |

(La disposition tactile de L2 / R2 a été modifiée depuis : voir `index.html` et `css/touch.css`.)

## 3.3 Combos directionnels — **en place (6.4)**
Voir « Chaînes de combos ». Reste : variantes latérales plus nombreuses par personnage (aujourd'hui 2 finisseurs : `hook` ou `kick`).

## 3.4 Combo aérien — **en place (6.4)**
↑+○ ↑+○ : uppercut puis bond de poursuite, ○ ○ ○ en l'air, Chakra Dash qui suit l'adversaire lancé, double saut. Reste : poursuite après la chaîne normale (`punch3` lance peu), techniques spéciales de fin de combo automatiques.

## 3.5 Chakra Dash Combo — **en place**
△ → ✕ → ○ ○ ○, au sol et en l'air, et en annulation d'un combo.

## 3.6 Techniques spéciales
- **Ninjutsu**, **Technique ultime** : en place (archétype).
- **Éveil / Awakening** : changement de forme et de capacités quand les conditions de combat sont réunies (le système `buff` giant / power sert de base) — 6.5.
- **Technique ultime d'équipe** : attaque combinée avec les soutiens — 6.5.

## 3.7 Mécaniques défensives — **en place (6.3)**
Garde R2, projection R2+○, substitution L2, garde brisée, double saut.

## 3.8 Système de soutien
Selon « Règles des soutiens (6.1) ». Reste : protéger le joueur, prolonger un combo, techniques combinées.

## 3.9 Étapes
- [x] **6.1 Soutiens** — non testé en jeu ; [ ] 6.1b protéger / prolonger un combo ; 6.1c techniques d'équipe ; 6.1d retirer le 2v2 simultané
- [x] **6.2 Chakra + nouveau schéma de boutons** — non testé en jeu ; [ ] 6.2b aura de charge, jauge de chakra avec coûts ; 6.2c équilibrage
- [x] **6.3 Défense** — non testé en jeu ; [ ] 6.3b vraie bûche visible ; 6.3c équilibrage (usure de la garde, substitution gratuite en combo)
- [x] **6.4 Combos directionnels et aériens + IA complète** — non testé en jeu
  - [ ] 6.4b Poses d'animation propres aux 8 nouveaux coups ; 6.4c plus de finisseurs latéraux par archétype ; 6.4d équilibrage des dégâts des chaînes ; 6.4e l'IA devrait aussi enchainer volontairement une chaîne donnée (aujourd'hui : choix aléatoire parmi les annulations)
- [ ] 6.5 Éveil et techniques ultimes d'équipe
- [ ] 6.6 Options de remappage, tests de `sim.mjs` / `phase3.mjs` réécrits avec les nouvelles actions, README, retour de la Frappe lourde si souhaité

## Points à trancher en cours de route
- Les Techniques d'archétype (`move2`) : les supprimer, les rattacher au Chakra Dash, ou en faire des variantes du Ninjutsu ? (le joueur n'y a plus accès ; l'IA les utilise encore)
- Durée de présence (3 s) et rappel (12 s) des soutiens ; coûts du chakra ; substitution ; dégâts des chaînes : à régler en jeu.
