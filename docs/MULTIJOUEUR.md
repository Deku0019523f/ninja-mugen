# Multijoueur local — Google Nearby Connections + Capacitor

Combat **1 contre 1** entre deux téléphones Android proches, sans serveur ni Internet.

## Ce qui est fait

| Besoin | Réalisation |
|---|---|
| Création de salon | Écran **MULTIJOUEUR → Créer un salon** : l'hôte « annonce » son salon (`startAdvertising`). Pseudo auto `NINJA-XXXX`. |
| Recherche automatique | **Rejoindre un salon** : découverte continue (`startDiscovery`), la liste se met à jour toute seule (salons trouvés / perdus). |
| Wi-Fi / Bluetooth | **Choisis automatiquement par Nearby** : BLE / Bluetooth pour se trouver, puis montée en débit vers le Wi-Fi (LAN ou point d'accès Wi-Fi Direct). L'API ne permet pas de forcer un mode. L'écran de la salle affiche la liaison réellement obtenue (Wi-Fi, Bluetooth, Bluetooth LE) et le ping. |
| Sélection des personnages | Chaque joueur choisit son combattant sur l'écran Roster ; le choix de l'autre apparaît (« A fait son choix »). Le combattant adverse reste secret jusqu'au combat. |
| Choix des arènes | L'hôte choisit l'arène (ou aléatoire) ; l'invité attend. |
| Combat 1v1 | Hôte = joueur 1 (gauche), invité = joueur 2. Manches, chrono 99 s, KO identiques au jeu solo. Pas de soutiens en ligne. |
| Synchronisation des combos et techniques | **Lockstep par entrées** : seules les touches (12 bits / frame) sont échangées ; chaque téléphone exécute le même moteur déterministe (graine commune). Combos, chaînes, Ninjutsu, ultimes, chakra, garde… sont donc identiques sans rien d'autre à synchroniser. |
| Contrôle de synchro | Toutes les 60 frames, hash de l'état du monde comparé. Divergence → partie interrompue proprement. |
| Déconnexion | Le combat se met en attente (« Connexion perdue — reconnexion… 28 s »). Hors combat : retour au salon. |
| Reconnexion | L'hôte ré-annonce, l'invité le retrouve **par son nom** et se reconnecte seul (30 s max). Les frames perdues sont renvoyées (accusés de réception) : le combat reprend **exactement** là où il s'était arrêté. Au-delà de 30 s : fin de partie. |
| Revanche | Les deux joueurs doivent accepter ; l'hôte relance avec une nouvelle graine. |

## Architecture

```
js/net/lockstep.js   noyau pur : délai d'entrée, frames, accusés, reprise, hash de synchro
js/net/session.js    salon, messages, ping, reconnexion, interface utilisée par Match
js/net/flow.js       enchaînement des écrans sur les deux appareils (select → arène → combat → revanche)
js/net/nearby.js     transport RÉEL (plugin Capacitor NearbyConnections)
js/net/web.js        transport de TEST (BroadcastChannel : deux onglets du navigateur)
js/screens/online.js salon : hub · salon ouvert · recherche · connexion · salle · attente
js/screens/onlineResult.js  fin de combat en ligne
capacitor/           plugin Android (Java) + MainActivity + permissions + capacitor.config.json
test/net.mjs         2 appareils simulés : synchro, coupure/reprise, désynchro
```

### Lockstep en 4 lignes
* La touche lue à la frame *f* s'applique à la frame *f + délai* (3 à 12 frames, choisi par l'hôte d'après le **ping mesuré** ; sinon d'après la qualité de liaison).
* Le moteur n'avance à la frame *f* que si les touches des deux joueurs pour *f* sont arrivées, sinon il attend (jamais de saut ni de rattrapage brutal).
* Chaque paquet `F<frame>,<touches>,<ack>` porte l'accusé de réception : après une coupure on renvoie seulement ce qui manque.
* Le hasard du moteur (`World.rnd`, graine commune), les phases (intro / combat / KO) et les compteurs de frames sont identiques des deux côtés.

### Messages
`F<frame>,<bits>,<ack>` entrées · `H<frame>,<hash>` contrôle · JSON `hi` (présentation) · `rs` (reprise) · `pg`/`po` (ping) · `ph` (changement d'étape) · `pick` · `start` (config + graine) · `rm` (revanche) · `bye`.

## Application Android avec Capacitor (manuel)

Prérequis : Node 18+, Android Studio (SDK 34), un téléphone Android avec Google Play Services.

```bash
# 1. dans le dossier du jeu
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build:app                      # génère dist/ninja-mugen.html puis www/index.html

# 2. projet Android (une seule fois)
cp capacitor/capacitor.config.json .
npx cap add android

# 3. plugin Nearby
mkdir -p android/app/src/main/java/com/ninjamugen/app
cp capacitor/android/NearbyConnectionsPlugin.java android/app/src/main/java/com/ninjamugen/app/
cp capacitor/android/MainActivity.java            android/app/src/main/java/com/ninjamugen/app/   # remplace celui généré
```

4. **android/app/build.gradle** → dans `dependencies { … }` ajouter :
   `implementation 'com.google.android.gms:play-services-nearby:19.3.0'`
5. **android/app/src/main/AndroidManifest.xml** → coller le contenu de `capacitor/android/AndroidManifest.permissions.xml` avant `<application>` et ajouter `android:screenOrientation="sensorLandscape"` à l'`<activity>`.
6. Vérifier `android/variables.gradle` : `minSdkVersion` ≥ 23, `compileSdkVersion` ≥ 34.

```bash
npx cap sync android
npx cap open android      # Android Studio : brancher le téléphone, ▶ Run (ou Build > Build APK)
```

À chaque modification du jeu : `npm run build:app && npx cap sync android`.

**Si `com.ninjamugen.app` change** (autre `appId`) : adapter la ligne `package` des deux fichiers Java et leur dossier.

### Tester à deux
Installer l'APK sur **2 téléphones**, activer **Bluetooth, Wi-Fi et localisation** des deux côtés, accepter les permissions au premier clic sur « Créer / Rejoindre ». Téléphone A : *Multijoueur → Créer un salon*. Téléphone B : *Multijoueur → Rejoindre un salon* → toucher le salon → l'hôte lance la sélection.

### Tester sans téléphone
`npm start`, ouvrir le jeu dans **deux onglets** : mode « TEST NAVIGATEUR » (BroadcastChannel), mêmes écrans et même lockstep. `npm test` exécute `test/net.mjs` (2 appareils simulés, latence, coupure, désynchro).

## Limites connues (à savoir)
* **Pas testé sur de vrais téléphones ici** : le plugin Java et l'application Android n'ont pas pu être compilés dans cet environnement. Le noyau réseau, lui, est testé de bout en bout par `test/net.mjs` sur un transport simulé.
* Wi-Fi / Bluetooth ne se choisissent pas : Nearby décide (et monte en débit tout seul). La liaison obtenue est affichée.
* Le déterminisme suppose le même moteur JavaScript des deux côtés (WebView Chromium d'Android). Le hash de contrôle détecte toute dérive et interrompt la partie au lieu de la laisser diverger.
* Sur liaison Bluetooth seule (pas de montée Wi-Fi), le ping est plus élevé : le délai d'entrée augmente automatiquement (jusqu'à 12 frames ≈ 0,2 s).
* Un seul adversaire par salon (stratégie `P2P_POINT_TO_POINT`). Passer à `P2P_CLUSTER` (option `strategy` de `NearbyTransport`) si la découverte est capricieuse sur certains appareils.
* Pas de pause en ligne : le menu se superpose sans arrêter le combat.
