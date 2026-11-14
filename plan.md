# PLAN — Ninja Mugen (feuille de route n°2 : modes, énergie, cartes et boutique)

Ce plan **remplace** le précédent (les 19 points sont terminés, l'historique reste dans git et `RAPPORT.md`). Demandes de l'auteur du 2026-11-14.

Cocher `[x]` au fur et à mesure ; le suivi détaillé va dans `RAPPORT.md`.

> Règles du dépôt : tout sur `main` · réponses en français · dessins et palette originaux (rien de repris du jeu de référence) · **jamais** d'achat en argent réel, de publicités, de roue de la chance, d'offres limitées ni d'énergie qui limite le nombre de parties. Les **coffres de ce plan s'achètent uniquement avec des germes gagnés en jouant** ; il n'existe aucun moyen d'obtenir des germes avec de l'argent réel.
> Travail en parallèle : d'autres sessions modifient le dépôt. Relire un fichier sur `main` avant de l'écrire.

---

## 1. Menus : modes retirés, multijoueur dans PvP
- [ ] 1.1 Retirer de la liste « Sélection du mode » (`js/screens/modes.js`) : **DUEL**, **ARCADE**, **SURVIE** (reste : HISTOIRE, TOURNOI, ENTRAÎNEMENT).
- [ ] 1.2 Retirer **MULTIJOUEUR** de cette liste : on n'y accède plus que par le bouton **PvP** de l'accueil (`js/screens/title.js`, déjà en place).
- [ ] 1.3 Nettoyer ce qui n'a plus de sens : entrées de `js/modes/index.js` (arcade, survival ; garder `single` tant que l'écran PvP / entraînement / tournoi s'en servent), récompenses, textes d'aide, tests (`test/*.mjs`), `README`.
- [ ] 1.4 Vérifier que les onglets ROSTER / RÈGLES / DÉCORS et le retour au menu fonctionnent encore pour Histoire, Tournoi, Entraînement et PvP.

## 2. Énergie de combat (remplace le chakra 0-100)
Barre d'énergie unique, affichée sous la vie. **Joueur : 150 max. IA : 300 max (le double).**
- [ ] 2.1 Passer la jauge de 100 à 150 pour le joueur et à 300 pour l'IA (`js/game/fighter.js`, `match.js`, `hud.js`) ; en PvP en ligne et en entraînement : 150 des deux côtés (pas d'avantage à l'IA).
- [ ] 2.2 Recharge : bouton **Charge** (maintenu, immobile, vulnérable) + gain léger en frappant / en se faisant toucher. L'IA se recharge au même rythme relatif (barre ×2, donc deux fois plus d'énergie à dépenser, pas une charge deux fois plus rapide en pourcentage).
- [ ] 2.3 Coûts (à équilibrer par test) : **Dash sur l'ennemi** 30 · **Lancer d'arme / sort** 25 · **Super 1** 50 · **Super 2 = 2 × Super 1 = 100** · attaque et bouclier : gratuits.
- [ ] 2.4 Refuser l'action si l'énergie est insuffisante (petit son + barre qui clignote), pour le joueur comme pour l'IA.
- [ ] 2.5 L'IA (`js/game/ai.js`) tient compte de son énergie : charge quand elle est loin, garde du Super 2 pour les ouvertures, difficulté Facile / Normal / Difficile inchangée en réactivité.
- [ ] 2.6 Adapter les capacités existantes qui lisent le chakra (Éveil, Chakra Dash, Chakra Shuriken, défense parfaite +12) à la nouvelle échelle ; relancer `test/sim.mjs`, `ai_all.mjs`, `awaken.mjs`, `combos.mjs`.

## 3. Commandes tactiles (nouvelle disposition)
- [ ] 3.1 **Zone gauche** : bouton **Charge d'énergie** (au-dessus) + **stick analogique** (déplacement, saut vers le haut, accroupi vers le bas).
- [ ] 3.2 **Zone droite** : **Attaque** (gros bouton), **Bouclier**, **Dash sur l'ennemi** (se précipite sur l'adversaire quelle que soit la distance, coûte de l'énergie), **Lancer** (arme ou sort), **Super 1**, **Super 2**.
- [ ] 3.3 Super 2 grisé avec cadenas tant que le héros n'est pas au niveau 10 (voir 6.4) ; chaque bouton affiche son coût d'énergie et se grise s'il est trop cher.
- [ ] 3.4 Mettre à jour `js/touch.js`, `index.html` / CSS tactile, l'écran COMMANDES (`js/screens/controls.js`, clavier et manette inclus) et la touche de chaque action.
- [ ] 3.5 Test sur écran de téléphone en paysage (captures Playwright) : pas de bouton sous les pouces, zones bien séparées.

## 4. Rangs et rareté des personnages
- [ ] 4.1 Chaque personnage reçoit un **rang fixe de E à SS** (`js/data/roster.js`) : E, D, C, B, A, AA, S, SS. Le rang ne dépend plus du niveau (le niveau 1-50 reste une progression à part). Remplace `prog.rank` actuel (qui se calculait d'après le niveau).
- [ ] 4.2 **Un seul personnage de départ**, de rang E, débloqué dès le premier lancement. Tous les autres sont verrouillés.
- [ ] 4.3 Plus le rang est haut, plus ses cartes sont **rares** : tirage pondéré (valeurs de départ, à ajuster) E 40 % · D 25 % · C 15 % · B 10 % · A 6 % · AA 3 % · S 0,9 % · SS 0,1 % dans les coffres ordinaires.
- [ ] 4.4 Les cartes **S et SS** ne viennent **que des victoires en Tournoi** (voir 5.3) ; elles sont exclues du tirage des coffres d'Histoire et de la boutique.
- [ ] 4.5 Badges de rang (images `assets/ui/rank_e.png` … `rank_ss.png`) sur les cartes, la fiche héros et les coffres.

## 5. Cartes, fragments et déblocage
- [ ] 5.1 **Carte = fragments d'un personnage** (ex. « Kaito ×3 »). Un personnage se débloque en réunissant ses fragments : 10 pour les rangs E à C, 20 pour A et AA, 30 pour S et SS (valeurs de départ). Au-delà du déblocage, les fragments en trop donnent des pièces.
- [ ] 5.2 **Mode Histoire** : à **chaque victoire** (première fois, ou à chaque victoire — à confirmer), un **coffre de 3 cartes** s'ouvre ; le joueur **en choisit 1**, qui donne les fragments de ce personnage. C'est la voie principale pour débloquer les héros, un par un.
- [ ] 5.3 **Mode Tournoi** : à chaque victoire du tournoi, un coffre de cartes **S / SS** (3 cartes, on en choisit 1).
- [ ] 5.4 Écran d'ouverture de coffre : 3 cartes face cachée, retournement, choix d'une carte, barre de fragments « 4/10 » qui se remplit, animation de déblocage « NOUVEAU ! ».
- [ ] 5.5 Écran HÉROS : héros verrouillés grisés avec cadenas et « x/10 fragments » ; impossible de les choisir tant qu'ils sont verrouillés. Sélection de héros (accueil, ROSTER, tournoi, PvP) limitée aux héros débloqués.
- [ ] 5.6 **Sauvegarde** (`js/progress.js`) : héros débloqués, fragments par héros, boîtes ouvertes ; **migration** des sauvegardes existantes (un héros déjà monté de niveau reste débloqué ; le héros de départ est le rang E).
- [ ] 5.7 Adversaires de l'IA, mode Histoire et Tournoi : l'IA peut utiliser tous les personnages, même verrouillés pour le joueur.

## 6. Progression de héros
- [ ] 6.1 Niveaux 1 à 50 et paliers 10 / 20 / 30 / 40 / 50 conservés.
- [ ] 6.2 Les pièces servent toujours à monter de niveau.
- [ ] 6.3 Affichage du rang fixe (E → SS) sur la fiche, à la place du rang qui dépendait du niveau.
- [ ] 6.4 **Super 2 débloqué au niveau 10** du héros : cadenas et message « Niveau 10 requis » avant ; le palier de niveau 10 l'indique explicitement dans le parchemin.

## 7. Boutique (germes)
Nouvel écran **BOUTIQUE**, accessible depuis l'accueil (onglets à gauche à la manière du jeu de référence : COFFRES · PIÈCES · FRAGMENTS).
- [ ] 7.1 **Coffre ×3** : **250 germes** → 3 cartes, on en choisit 1.
- [ ] 7.2 **Coffre ×10** : **700 germes** → 10 cartes, **on les garde toutes**.
- [ ] 7.3 **Germes → pièces** : conversion à taux fixe (valeur de départ : 1 germe = 40 pièces), par paliers 10 / 50 / 100 germes.
- [ ] 7.4 **Fragments contre germes** : acheter un fragment précis d'un personnage de son choix (prix selon le rang, valeurs de départ : E 20 · D 30 · C 45 · B 70 · A 100 · AA 150 germes ; S et SS non vendus, uniquement par le Tournoi).
- [ ] 7.5 Les germes se gagnent en jouant (victoires, Histoire, étoiles, cadeau quotidien) : revoir les gains (`prog.reward`, `DAILY`, `story.js`) pour que 250 germes restent atteignables sans tricher ni faire la même chose cent fois (ordre de grandeur visé : un coffre ×3 après 2 à 3 séances).
- [ ] 7.6 Confirmation avant tout achat, solde insuffisant géré, aucune offre limitée, aucune pub, aucun achat en argent réel.

## 8. Vérification finale
- [ ] 8.1 Tests automatiques : énergie (coûts, 150 / 300, refus), déblocage (fragments, migration de sauvegarde), tirages (rareté, pas de S/SS en coffre ordinaire), boutique (soldes), modes retirés.
- [ ] 8.2 Parcours complet testé par captures : nouvelle partie → 1 seul héros → Histoire → coffre → carte choisie → fragments → déblocage ; boutique ; PvP seul entrée du multijoueur ; combat avec les nouveaux boutons.
- [ ] 8.3 Mettre à jour `README.md` et `RAPPORT.md`.

---

## Ordre de réalisation
1 (menus, rapide) → 2 (énergie) → 3 (commandes) → 4 + 6 (rangs, niveau 10) → 5 (cartes, déblocage) → 7 (boutique) → 8.

## Hypothèses prises (à corriger si besoin)
1. « Arcane » = **Arcade**, « suivie » = **Survie**.
2. Le **rang est fixe par personnage** (E à SS), ce qui remplace le rang calculé d'après le niveau mis en place récemment.
3. « Boîte de 3 cartes / 10 cartes » = les coffres de ce plan ; ils s'achètent avec des germes, qui ne s'achètent pas avec de l'argent réel.
4. Les **valeurs chiffrées** (coûts d'énergie, fragments par déblocage, probabilités, prix) sont des points de départ à équilibrer pendant les tests.
5. L'IA a le double d'énergie **uniquement en solo** (Histoire, Tournoi, Entraînement) ; en PvP les deux joueurs ont 150.
