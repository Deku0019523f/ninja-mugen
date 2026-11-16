# PLAN — Ninja Mugen (feuille de route n°2 : modes, énergie, cartes et boutique)

Ce plan **remplace** le précédent (les 19 points sont terminés, l'historique reste dans git et `RAPPORT.md`). Demandes de l'auteur du 2026-11-14.

Cocher `[x]` au fur et à mesure ; le suivi détaillé va dans `RAPPORT.md`.

> Règles du dépôt : tout sur `main` · réponses en français · dessins et palette originaux (rien de repris du jeu de référence) · **jamais** d'achat en argent réel, de publicités, de roue de la chance, d'offres limitées ni d'énergie qui limite le nombre de parties. Les **coffres de ce plan s'achètent uniquement avec des germes gagnés en jouant** ; il n'existe aucun moyen d'obtenir des germes avec de l'argent réel.
> Travail en parallèle : d'autres sessions modifient le dépôt. Relire un fichier sur `main` avant de l'écrire.

---

## 1. Menus : modes retirés, multijoueur dans PvP
- [x] 1.1 Retirer de la liste « Sélection du mode » (`js/screens/modes.js`) : **DUEL**, **ARCADE**, **SURVIE** (reste : HISTOIRE, TOURNOI, ENTRAÎNEMENT).
- [x] 1.2 Retirer **MULTIJOUEUR** de cette liste : on n'y accède plus que par le bouton **PvP** de l'accueil (`js/screens/title.js`, déjà en place).
- [x] 1.3 Nettoyer ce qui n'a plus de sens : entrées de `js/modes/index.js` (arcade, survival ; garder `single` tant que l'écran PvP / entraînement / tournoi s'en servent), récompenses, textes d'aide, tests (`test/*.mjs`), `README`.
- [x] 1.4 **Retirer la difficulté Facile** : il ne reste que **Normal** et **Difficile** (mode Histoire, réglages de l'IA, écrans RÈGLES / VS, `js/story.js`, `js/game/ai.js`, tests `ai_all.mjs`, textes d'aide). Les sauvegardes qui avaient la difficulté Facile passent en Normal.
- [x] 1.5 Vérifier que les onglets ROSTER / RÈGLES / DÉCOR et le retour au menu fonctionnent encore pour Histoire, Tournoi, Entraînement et PvP.

## 2. Énergie de combat (remplace le chakra 0-100)
Barre d'énergie unique, affichée sous la vie. **Joueur : 150 max. IA : 300 max (le double).**
- [x] 2.1 Passer la jauge de 100 à 150 pour le joueur et à 300 pour l'IA (`js/game/fighter.js`, `match.js`, `hud.js`) ; en PvP en ligne et en entraînement : 150 des deux côtés (pas d'avantage à l'IA).
- [x] 2.2 Recharge : bouton **Charge** (maintenu, immobile, vulnérable) + gain léger en frappant / en se faisant toucher. L'IA se recharge au même rythme relatif (barre ×2, donc deux fois plus d'énergie à dépenser, pas une charge deux fois plus rapide en pourcentage).
- [x] 2.3 Coûts (à équilibrer par test) : **Dash sur l'ennemi** 30 · **Lancer d'arme / sort** 25 · **Super 1** 50 · **Super 2 = 2 × Super 1 = 100** · attaque et bouclier : gratuits.
- [x] 2.4 Refuser l'action si l'énergie est insuffisante (petit son + barre qui clignote), pour le joueur comme pour l'IA.
- [x] 2.5 L'IA (`js/game/ai.js`) tient compte de son énergie : charge quand elle est loin, garde du Super 2 pour les ouvertures, difficultés Normal / Difficile inchangées en réactivité.
- [x] 2.6 Adapter les capacités existantes qui lisent le chakra (Éveil, Chakra Dash, Chakra Shuriken, défense parfaite +12) à la nouvelle échelle ; relancer `test/sim.mjs`, `ai_all.mjs`, `awaken.mjs`, `combos.mjs`.

## 3. Commandes tactiles (nouvelle disposition)
- [x] 3.1 **Zone gauche** : bouton **Charge d'énergie** (au-dessus) + **stick analogique** (déplacement, saut vers le haut, accroupi vers le bas).
- [x] 3.2 **Zone droite** : **Attaque** (gros bouton), **Bouclier**, **Dash sur l'ennemi** (se précipite sur l'adversaire quelle que soit la distance, coûte de l'énergie), **Lancer** (arme ou sort), **Super 1**, **Super 2**.
- [x] 3.3 Super 2 grisé avec cadenas tant que le héros n'est pas au niveau 10 (voir 6.4) ; chaque bouton affiche son coût d'énergie et se grise s'il est trop cher.
- [x] 3.4 Mettre à jour `js/touch.js`, `index.html` / CSS tactile, l'écran COMMANDES (`js/screens/controls.js`, clavier et manette inclus) et la touche de chaque action.
- [x] 3.5 Test sur écran de téléphone en paysage (captures Playwright) : pas de bouton sous les pouces, zones bien séparées.

## 4. Rangs et rareté des personnages
- [x] 4.1 Chaque personnage reçoit un **rang fixe de E à SS** (`js/data/roster.js`) : E, D, C, B, A, AA, S, SS. Le rang ne dépend plus du niveau (le niveau 1-50 reste une progression à part). Remplace `prog.rank` actuel (qui se calculait d'après le niveau).
- [x] 4.2 **Un seul personnage de départ**, de rang E, débloqué dès le premier lancement. Tous les autres sont verrouillés.
- [x] 4.3 Plus le rang est haut, plus ses cartes sont **rares** : tirage pondéré (valeurs de départ, à ajuster) E 40 % · D 25 % · C 15 % · B 10 % · A 6 % · AA 3 % · S 0,9 % · SS 0,1 % dans les coffres ordinaires.
- [x] 4.4 Les cartes **S et SS** ne viennent **que des victoires en Tournoi** (voir 5.3) ; elles sont exclues du tirage des coffres d'Histoire et de la boutique.
- [x] 4.5 Badges de rang (images `assets/ui/rank_e.png` … `rank_ss.png`) sur les cartes, la fiche héros et les coffres.

## 5. Cartes, fragments et déblocage
- [x] 5.1 **Carte = fragments d'un personnage** (ex. « Kaito ×3 »). Un personnage se débloque en réunissant ses fragments : 10 pour les rangs E à C, 20 pour A et AA, 30 pour S et SS (valeurs de départ). Au-delà du déblocage, les fragments en trop donnent des pièces.
- [x] 5.2 **Mode Histoire** : à la **première victoire de chaque niveau, en Normal et en Difficile** (une fois par niveau et par difficulté, jamais en rejouant), un **coffre de 3 cartes** s'ouvre ; le joueur **en choisit 1**, qui donne les fragments de ce personnage. C'est la voie principale pour débloquer les héros, un par un.
- [x] 5.3 **Mode Tournoi** : à chaque victoire du tournoi, un coffre de cartes **S / SS** (3 cartes, on en choisit 1).
- [x] 5.4 Écran d'ouverture de coffre : 3 cartes face cachée, retournement, choix d'une carte, barre de fragments « 4/10 » qui se remplit, animation de déblocage « NOUVEAU ! ».
- [x] 5.5 Écran HÉROS : héros verrouillés grisés avec cadenas et « x/10 fragments » ; impossible de les choisir tant qu'ils sont verrouillés. Sélection de héros (accueil, ROSTER, tournoi, PvP) limitée aux héros débloqués.
- [x] 5.6 **Sauvegarde** (`js/progress.js`) : héros débloqués, fragments par héros, niveaux d'Histoire déjà gagnés par difficulté (pour ne donner le coffre qu'une fois), boîtes ouvertes ; **migration** des sauvegardes existantes (un héros déjà monté de niveau reste débloqué ; le héros de départ est le rang E).
- [x] 5.7 Adversaires de l'IA, mode Histoire et Tournoi : l'IA peut utiliser tous les personnages, même verrouillés pour le joueur.

## 6. Progression de héros
- [x] 6.1 Niveaux 1 à 50 et paliers 10 / 20 / 30 / 40 / 50 conservés.
- [x] 6.2 Les pièces servent toujours à monter de niveau.
- [x] 6.3 Affichage du rang fixe (E → SS) sur la fiche, à la place du rang qui dépendait du niveau.
- [ ] 6.4 **Super 2 débloqué au niveau 10** du héros : cadenas et message « Niveau 10 requis » avant ; le palier de niveau 10 l'indique explicitement dans le parchemin.

## 7. Boutique (germes)
Nouvel écran **BOUTIQUE**, accessible depuis l'accueil (onglets à gauche à la manière du jeu de référence : COFFRES · PIÈCES · FRAGMENTS).
- [x] 7.1 **Coffre ×3** : **250 germes** → 3 cartes, on en choisit 1.
- [x] 7.2 **Coffre ×10** : **700 germes** → 10 cartes, **on les garde toutes**.
- [x] 7.3 **Germes → pièces** : conversion à taux fixe (valeur de départ : 1 germe = 40 pièces), par paliers 10 / 50 / 100 germes.
- [x] 7.4 **Fragments contre germes** : acheter un fragment précis d'un personnage de son choix (prix selon le rang, valeurs de départ : E 20 · D 30 · C 45 · B 70 · A 100 · AA 150 germes ; S et SS non vendus, uniquement par le Tournoi).
- [ ] 7.5 Les germes se gagnent en jouant (victoires, Histoire, étoiles, cadeau quotidien) : revoir les gains (`prog.reward`, `DAILY`, `story.js`) pour que 250 germes restent atteignables sans tricher ni faire la même chose cent fois (ordre de grandeur visé : un coffre ×3 après 2 à 3 séances).
- [x] 7.6 Confirmation avant tout achat, solde insuffisant géré, aucune offre limitée, aucune pub, aucun achat en argent réel.

## 8. Vérification finale
- [x] 8.1 Tests automatiques : énergie (coûts, 150 / 300, refus), déblocage (fragments, migration de sauvegarde), tirages (rareté, pas de S/SS en coffre ordinaire), boutique (soldes), modes retirés.
- [x] 8.2 Parcours complet testé par captures : nouvelle partie → 1 seul héros → Histoire → coffre → carte choisie → fragments → déblocage ; boutique ; PvP seul entrée du multijoueur ; combat avec les nouveaux boutons.
- [x] 8.3 Mettre à jour `README.md` et `RAPPORT.md`.

---

## 9. Idées issues de la vidéo de référence (carte Histoire d'un jeu Demon Slayer, analysée le 2026-11-14)
Ce sont des propositions : rien n'est décidé ni commencé. À valider une par une avant de coder.

### 9.1 Interface et design
- [x] 9.1.1 **Carte de campagne illustrée** pour le mode Histoire : un décor par chapitre (les 8 arènes image), des nœuds de niveaux numérotés, des badges BOSS, des coffres cadeaux.
- [x] 9.1.2 **Barre de chapitres** en bas : anneau doré sur le chapitre actif, chapitres suivants grisés avec cadenas.
- [x] 9.1.3 **Fiche de niveau en parchemin** : difficulté (Normal / Difficile), récompense, bouton COMBAT avec coût en énergie, objectifs d'étoiles. — fait sans coût d'énergie (pas de ressource d'énergie à dépenser)
- [x] 9.1.4 **Barre de ressources unifiée** (énergie, germes, pièces) sur tous les écrans, avec icône d'énergie à créer. — barre germes / pièces sur les écrans ; pas d'icône d'énergie (la ressource n'existe pas)
- [x] 9.1.5 **Popups harmonisées** (bandeau doré, boutons Annuler / OK) avec les cadres de la 2ᵉ planche UI, encore inutilisés ; message « Termine le chapitre précédent ». — fenêtres à onglets et messages « Termine le chapitre précédent » faits ; cadres de la 2ᵉ planche non utilisés

### 9.2 Modes de jeu
- [x] 9.2.1 **Objectifs 3 étoiles** par niveau : gagner · finir en moins de 3 minutes · ne perdre aucun équipier (à adapter au 2v2).
- [x] 9.2.2 **Bonus avant combat** au choix (+50 % dégâts, +50 % PV, jauge pleine), à équilibrer avec le coût en énergie. — fait : +50 % dégâts / +50 % PV / jauge pleine, 150 pièces
- [x] 9.2.3 **Niveaux de boss** de fin de chapitre, avec un affrontement spécial. — boss aux niveaux 5 et 10 (icône ☠, récompense double)
- [x] 9.2.4 Chapitres verrouillés tant que le précédent n'est pas fini ; relier `story`, `bracket` et `daily` à cette progression. — chapitres verrouillés faits ; `bracket` et `daily` laissés séparés

### 9.3 Fonctionnalités
- [x] 9.3.1 **Récompenses par paliers d'étoiles** (15 / 30 / 45 / 60 / 75 étoiles) : pièces, germes, fragments. Pas de piste premium payante (cf. 7.6). — paliers 10 / 20 / 30 / 40 / 50 / 60 ★ (60 étoiles max)
- [x] 9.3.2 **Coffres sur la carte**, ramassés une fois par chapitre (lien avec 5.2). — un coffre par chapitre, 5 niveaux à terminer (`test/story-chest.mjs`)

### 9.4 Animations
- [x] 9.4.1 Anneau doré pulsant sur le niveau ou chapitre actif.
- [x] 9.4.2 Mini-sprite du héros choisi qui se déplace de nœud en nœud sur la carte.
- [x] 9.4.3 Popups en zoom avec rebond ; étoiles qui s'allument une par une en fin de combat ; pluie de pièces et de germes à la collecte.
- [x] 9.4.4 Légère parallaxe, brume ou lucioles sur le fond de carte.

### 9.5 Ordre conseillé
9.1.1 + 9.1.2 (carte) → 9.1.3 + 9.2.1 (fiche et étoiles) → 9.1.4 + 9.1.5 (ressources, popups) → 9.3.1 → 9.4.

## 10. Nouveautés déjà faites (assets et habillage)
- [x] 13 personnages animés en sprites pixel-art (dont Reiji, Sora, Daichi, Mei) et 8 arènes image (city1–4, ocean1/5/6/7) ; `assets/LICENCES.md` mis à jour (plusieurs licences « à vérifier »).
- [x] Icônes et badges de la planche UI 1 : pièce, gemme, cadenas, cadeau, icônes de stats ; badges START / HEROES / PVP sur l'accueil (PVP ouvre le mode en ligne).
- [x] Fond d'accueil généré (`assets/ui/home_bg.png`) ; affichage Home / Héros corrigé pour les sprites ; portraits recadrés par mesure des pixels.
- [x] Habillage image des boutons tactiles (planche UI 2 : `t_*.png`, `css/touch.css`).
- [ ] À vérifier sur appareil : habillage tactile en plein combat, écrans Héros et sélection, animations de garde, mort et Éveil.
- [ ] Non utilisé pour l'instant : cadres de portrait, barres de vie, pause et flèches de la planche 2 ; `Characters.zip` (526 images, portraits possibles pour les 43 personnages sans sprite) ; lanternes du fond d'accueil qui recouvrent les pastilles de monnaie.

---

## Ordre de réalisation
1 (menus, rapide) → 2 (énergie) → 3 (commandes) → 4 + 6 (rangs, niveau 10) → 5 (cartes, déblocage) → 7 (boutique) → 8.

## Hypothèses prises (à corriger si besoin)
1. « Arcane » = **Arcade**, « suivie » = **Survie**.
2. Le **rang est fixe par personnage** (E à SS), ce qui remplace le rang calculé d'après le niveau mis en place récemment.
3. « Boîte de 3 cartes / 10 cartes » = les coffres de ce plan ; ils s'achètent avec des germes, qui ne s'achètent pas avec de l'argent réel.
4. Les **valeurs chiffrées** (coûts d'énergie, fragments par déblocage, probabilités, prix) sont des points de départ à équilibrer pendant les tests.
5. Coffre d'Histoire : **première victoire seulement**, en Normal et Difficile (précisé par l'auteur le 2026-11-14) ; la difficulté Facile est supprimée.
6. L'IA a le double d'énergie **uniquement en solo** (Histoire, Tournoi, Entraînement) ; en PvP les deux joueurs ont 150.
