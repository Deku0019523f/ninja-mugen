# NINJA MUGEN — jeu de combat 2D en three.js

Jeu de combat façon M.U.G.E.N : 56 combattants **originaux** (18 styles de techniques), 1v1 et 2v2, 6 décors,
modes Arcade / Combat individuel / Survie / Entraînement, IA à 5 niveaux, 2 joueurs, manette et tactile.

## Lancer
- Jouer tout de suite : ouvrir `dist/ninja-mugen.html` (fichier unique, three.js inclus, hors-ligne).
- Développer : `npm install && npm run build` (régénère dist/) · `npm test` (simulation du moteur sans navigateur).

## Commandes

| | Joueur 1 | Joueur 2 |
|---|---|---|
| Déplacer / saut / garde | Q D / Z / S (touches physiques WASD) | Flèches |
| ○ Poing (×3 = combo) | F | J |
| ✕ Saut (double saut) | G | K |
| □ Shuriken | R | U |
| △ Chakra (maintenu = charge) | T | I |
| R2 garde / parade | H | L |
| L2 substitution | Y | O |
| R1 / L1 soutiens | E / Q | P / N |

Combos : ○○○ poings · △+○ Ninjutsu (10 chakra) · △▶△▶○ Technique ultime (50) · △+✕ Chakra Dash · △+□ Chakra Shuriken · R2+○ projection. Détail illustré dans le jeu (onglet TOUCHES : tactile, manette, clavier). Manette : ✕ ○ □ △ comme sur PlayStation. P / Échap : pause.

## Interface

Barre de navigation permanente (ACCUEIL · ROSTER · RÈGLES · DÉCORS · TOUCHES + son), voile sombre / flou derrière les menus, transition « coup de sabre », polices Rajdhani et Inter intégrées (hors-ligne). Tab = adversaire manuel / aléatoire dans ROSTER.

## Multijoueur local (Android)

Combat 1v1 entre deux téléphones via Google Nearby Connections (Wi-Fi / Bluetooth automatiques), application Android par Capacitor : voir [docs/MULTIJOUEUR.md](docs/MULTIJOUEUR.md).

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
js/net/                        multijoueur : lockstep, session, flow, transports (Nearby / test navigateur)
js/ui/                         hud.js (barres, combos) · menu.js (liste de menu) · shell.js (barre, voile, transition) · icons.js (pictogrammes SVG)
js/touch.js                    commandes tactiles : stick analogique ou croix + △ □ ○ ✕
js/input.js · js/audio.js      clavier / manette / tactile · sons et musique synthétisés
css/fonts|base|ui|shell|hud|menus|home|select|stage|controls|touch.css   styles par domaine
npm @fontsource (Rajdhani, Inter ; OFL) : intégrées en base64 par build.mjs
```
Tactile (paysage uniquement) : stick analogique flottant ou croix 8 directions (bouton ✚/🕹 ou Options),
↗ ↖ saut avant/arrière, ↘ ↙ roulade, □ poing, △ pied, ○ spécial, ✕ technique, □+△ frappe lourde, ○+✕ super.
