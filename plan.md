# PLAN — structure détaillée de Ninja Mugen

```
index.html            page de dev (importmap three via CDN, charge js/main.js)
template.html         gabarit pour le build mono-fichier
build.mjs             esbuild → dist/ninja-mugen.html (three + CSS inclus)
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
  stages/<nom>.js             un fichier par décor (forest, plains, desert, snow, night, volcano) + _draw.js (outils de dessin) + index.js
  modes/<mode>.js             arcade, single, survival, training + util.js + index.js
  screens/<écran>.js          title, setup, select, stage, vs, options, controls, result + ctx.js (état partagé) + index.js
  game/                       moteur : fighter (états), world, match, ai, moves (agrégateur), helpers
  render/                     sprites.js (squelette 2D), view.js (three.js, caméra large 640→1200 × 480)
  ui/                         hud.js (barres, combos), menu.js (liste de menu)
```

## Flux
`index.html` → `js/main.js` → `go('title')` → écrans (`js/screens`) → `G.launch()` → `Match` (`js/game`) + `View` (`js/render`) + `Hud` (`js/ui`).
