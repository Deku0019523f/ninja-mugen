# NINJA MUGEN — jeu de combat 2D en three.js

Jeu de combat façon M.U.G.E.N : 56 combattants **originaux** (18 styles de techniques), 1v1 et 2v2, 6 décors,
modes Arcade / Combat individuel / Survie / Entraînement, IA à 5 niveaux, 2 joueurs, manette et tactile.

## Lancer
- Jouer tout de suite : ouvrir `dist/ninja-mugen.html` (fichier unique, three.js inclus, hors-ligne).
- Développer : `npm install && npm run build` (régénère dist/) · `npm test` (simulation du moteur sans navigateur).

## Commandes
| | Joueur 1 | Joueur 2 |
|---|---|---|
| Déplacer / saut / garde | Q D / Z / S (WASD) | Flèches |
| Poing (×3 = combo) | F | J |
| Pied | G | K |
| Spécial (10 chakra) | H | L |
| Technique (15) | T | I |
| SUPER (50) | Y | O |
↓+Poing = uppercut · ↓+Pied = balayage · reculer face à un coup = garde auto · P/Échap = pause.
Manette : X poing, A pied, B spécial, Y technique, R1 super.

## Structure
```
js/characters/<nom>/<nom>.js   UN DOSSIER PAR PERSONNAGE (56) + index.js (ordre = identifiant)
js/archetypes/<style>.js       18 styles de combat (projectile, technique, super) + index.js
js/combos/<coup>.js            UN FICHIER PAR COMBO (poing 1-2-3, pied, balayage, uppercut, frappe lourde, coups aériens)
js/techniques/<nom>.js         un fichier par technique (touche Technique) + special.js (touche Spécial)
js/supers/<nom>.js             un fichier par super attaque
js/stages/<nom>.js             un fichier par décor (6) + _draw.js (outils de dessin)
js/modes/<mode>.js             un fichier par mode (arcade, combat individuel, survie, entraînement)
js/screens/<écran>.js          un fichier par écran (titre, réglages, sélection, décor, VS, options, commandes, résultat)
js/game/                       moteur : fighter (états), world, match, ai, moves (agrégateur), helpers
js/render/                     sprites.js (squelette 2D) · view.js (three.js, caméra large 640→1200 × 480)
js/ui/                         hud.js (barres, combos) · menu.js (liste de menu)
js/touch.js                    commandes tactiles : stick analogique ou croix + △ □ ○ ✕
js/input.js · js/audio.js      clavier / manette / tactile · sons et musique synthétisés
css/base|hud|menus|touch.css   styles par domaine
```
Tactile (paysage uniquement) : stick analogique flottant ou croix 8 directions (bouton ✚/🕹 ou Options),
↗ ↖ saut avant/arrière, ↘ ↙ roulade, □ poing, △ pied, ○ spécial, ✕ technique, □+△ frappe lourde, ○+✕ super.
