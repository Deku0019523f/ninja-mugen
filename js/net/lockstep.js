// ============================================================
//  LOCKSTEP : verrouillage par entrées. Chaque appareil simule le MÊME combat ; seules les touches (12 bits par frame)
//  sont échangées. Module pur (ni DOM ni réseau) : testé par test/net.mjs.
//
//  - L'entrée locale lue à la frame f est appliquée à la frame f + delay (le « délai d'entrée » laisse le temps au paquet d'arriver).
//  - Le moteur n'avance à la frame f que si les entrées des DEUX joueurs pour f sont connues (sinon il attend : « stall »).
//  - Chaque paquet porte l'accusé de réception (« have » = plus haute frame distante reçue sans trou) : après une coupure,
//    on renvoie exactement les frames que le pair n'a pas reçues, puis la partie reprend là où elle s'était arrêtée.
//  - Toutes les 60 frames, un hash de l'état du monde est comparé pour détecter une désynchronisation.
// ============================================================
export const KEYS = ['l', 'r', 'u', 'd', 'o', 'x', 'sq', 'tri', 'r2', 'l2', 'sup1', 'sup2'];
export const pack = (raw) => { let b = 0; for (let i = 0; i < KEYS.length; i++) if (raw[KEYS[i]]) b |= 1 << i; return b; };
export const unpack = (b) => { const o = {}; for (let i = 0; i < KEYS.length; i++) o[KEYS[i]] = (b >> i) & 1; return o; };

// Empreinte de l'état du monde (positions, vie, chakra, états, graine du hasard…)
export function hashWorld(w) {
  let h = 0x811c9dc5;
  const mix = (n) => { h ^= (n | 0); h = Math.imul(h, 16777619) >>> 0; };
  mix(w.frame); mix(w._s | 0); mix(w.projs.length); mix(w.hitstop);
  for (const f of w.fighters) {
    mix(Math.round(f.x * 64)); mix(Math.round(f.y * 64)); mix(Math.round(f.vx * 64)); mix(Math.round(f.hp * 16)); mix(Math.round(f.chi * 16));
    mix(f.face); mix(f.t); for (let i = 0; i < f.state.length; i++) mix(f.state.charCodeAt(i));
  }
  return h >>> 0;
}

export class Lockstep {
  // me : 0 (hôte, équipe 0) ou 1 (invité, équipe 1) · delay : délai d'entrée en frames · send(texte) : envoi brut au pair
  constructor({ me, delay, send }) {
    this.me = me; this.delay = delay; this.send = send;
    this.fr = [new Map(), new Map()];
    for (let f = 0; f < delay; f++) { this.fr[0].set(f, 0); this.fr[1].set(f, 0); }   // frames 0 … delay-1 : aucune touche
    this.have = delay - 1;        // plus haute frame distante reçue sans trou
    this.peerAck = delay - 1;     // plus haute de mes frames dont le pair a accusé réception
    this.last = delay - 1;        // plus haute frame locale capturée
    this.hl = new Map(); this.hr = new Map();
    this.desync = null;
  }
  ready(f) { return this.fr[0].has(f) && this.fr[1].has(f); }
  get(p, f) { return this.fr[p].get(f) | 0; }

  capture(f, bits) {
    if (this.fr[this.me].has(f)) return;
    this.fr[this.me].set(f, bits); if (f > this.last) this.last = f;
    this.send(`F${f},${bits},${this.have}`);
  }
  onFrame(f, bits, ack) {
    const o = 1 - this.me;
    if (f > this.have && !this.fr[o].has(f)) this.fr[o].set(f, bits);
    while (this.fr[o].has(this.have + 1)) this.have++;
    if (ack > this.peerAck) this.peerAck = ack;
  }
  // frame f consommée par le moteur : on libère la mémoire (mes frames restent tant que le pair ne les a pas confirmées)
  consume(f) {
    this.fr[1 - this.me].delete(f);
    const lim = Math.min(f, this.peerAck);
    for (const k of this.fr[this.me].keys()) { if (k <= lim) this.fr[this.me].delete(k); else break; }
  }
  // après une reconnexion : paquets à renvoyer (mes frames que le pair n'a pas)
  resumePackets(peerHave) {
    const out = [];
    for (let f = Math.max(peerHave + 1, 0); f <= this.last; f++) if (this.fr[this.me].has(f)) out.push(`F${f},${this.fr[this.me].get(f)},${this.have}`);
    if (peerHave > this.peerAck) this.peerAck = peerHave;
    return out;
  }

  // détection de désynchronisation : retourne null ou { f, mine, theirs }
  noteHash(f, h) { this.hl.set(f, h); return this.cmp(f); }
  onHash(f, h) { this.hr.set(f, h); return this.cmp(f); }
  cmp(f) {
    if (!this.hl.has(f) || !this.hr.has(f)) return null;
    const a = this.hl.get(f), b = this.hr.get(f); this.hl.delete(f); this.hr.delete(f);
    if (a !== b) { this.desync = { f, mine: a, theirs: b }; return this.desync; }
    return null;
  }
}
