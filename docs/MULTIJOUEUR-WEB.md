# Multijoueur dans le navigateur (WebRTC)

Dans un navigateur (GitHub Pages, `dist/ninja-mugen.html`, téléphone ou ordinateur), la recherche automatique de joueurs proches n'existe pas : le mode utilise **WebRTC avec un code de salon**.

1. **Hôte** : Multijoueur → *Créer un salon*. Un code de 5 caractères s'affiche.
2. **Invité** : Multijoueur → *Rejoindre un salon* → saisir le code → *Rejoindre*.
3. La suite est identique à la version Android : choix des combattants, de l'arène, combat en lockstep, coupure et reconnexion automatique (30 s).

* Le service public **PeerJS** (`0.peerjs.com`, script chargé depuis jsDelivr) ne sert qu'à mettre les deux appareils en relation ; ensuite les données passent directement d'un appareil à l'autre. Il faut donc **Internet** au moment de la connexion.
* Deux appareils derrière des réseaux très restrictifs (pare-feu d'entreprise, 4G à NAT symétrique) peuvent ne pas réussir la liaison directe : aucun serveur relais (TURN) n'est configuré.
* `?local` à la fin de l'adresse : transport de test BroadcastChannel (deux onglets du même navigateur, sans Internet).
* Test automatique : `node test/webrtc.mjs` (PeerJS imité en mémoire). **Non testé avec le vrai service PeerJS ni sur deux vrais appareils.**
