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
js/data/roster.js     56 combattants + 18 archétypes (projectile / technique / super)
js/game/moves.js      table des coups (frames de startup/actif/récupération, hitbox)
js/game/fighter.js    machine à états, dégâts, garde, jonglage, buffs (géant, mode puissance)
js/game/world.js      combattants, projectiles, collisions, séparation, caméra-limite
js/game/ai.js         IA 5 niveaux (réaction, garde, combos, supers)
js/game/match.js      manches, chrono, KO au ralenti, entraînement
js/render/sprites.js  squelette 2D dessiné en direct (poses, cheveux, accessoires)
js/render/stages.js   6 décors procéduraux à parallaxe
js/render/view.js     scène three.js : caméra ortho, sprites, projectiles, particules, rayons
js/ui/hud.js          barres de vie angulaires, chakra, combos, cut-in des supers
js/main.js            menus, sélection, arcade / survie, pause
js/audio.js, input.js sons + musique synthétisés, clavier / manette / tactile
```
