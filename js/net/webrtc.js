// Transport WEB : WebRTC via PeerJS (service public de mise en relation, puis liaison directe entre les deux appareils).
// Pas de recherche automatique possible dans un navigateur : l'hôte affiche un CODE de salon (5 caractères), l'invité le saisit.
// Même interface que NearbyConnectionsTransport / WebTransport :
//  Événements : found{id,name} lost{id} pending{id,name} connected{id,name,quality} disconnected{id} message{id,text} failed error code{code}
import { Emitter } from './emitter.js';

const PEER_SRC = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
const PREFIX = 'ninjamugen-';
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';        // sans 0 O 1 I L
const SILENCE_MS = 7000;                                // aucun message reçu pendant ce temps : liaison considérée coupée
const CONNECT_MS = 12000;

export const newCode = () => { let s = ''; for (let i = 0; i < 5; i++) s += ALPHA[(Math.random() * ALPHA.length) | 0]; return s; };
export const cleanCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);

let loading = null;
const loadPeer = () => {
  if (globalThis.Peer) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = PEER_SRC; s.async = true;
    s.onload = () => (globalThis.Peer ? res() : rej(new Error('PeerJS indisponible')));
    s.onerror = () => { loading = null; rej(new Error('Service de connexion injoignable : Internet est nécessaire en version web')); };
    document.head.appendChild(s);
  });
  return loading;
};

export class WebRtcTransport extends Emitter {
  static available() { return typeof RTCPeerConnection !== 'undefined' && typeof document !== 'undefined'; }
  constructor() {
    super(); this.kind = 'webrtc'; this.code = newCode(); this.watch = null;
    this.hp = null; this.gp = null; this.conn = null; this.peer = null; this.advName = null;
    this.everConnected = false; this.opened = false; this.tw = null; this.dog = null; this.to = null; this.gpP = null; this.lastRx = 0; this._init = null;
  }
  init() { return (this._init ||= loadPeer().catch((e) => { this._init = null; throw e; })); }

  // ------------------------------------------------------------ hôte : salon identifié par un code
  async startHost() { await this.init(); if (!this.hp || this.hp.destroyed) await this.openHost(); }
  openHost(tries = 0) {
    return new Promise((res, rej) => {
      const p = new globalThis.Peer(PREFIX + this.code); this.hp = p;
      p.on('open', () => { this.opened = true; res(); });
      p.on('connection', (c) => this.onIncoming(c));
      p.on('error', (e) => {
        if (e.type === 'unavailable-id' && tries < 10) {
          try { p.destroy(); } catch (x) { /* ignore */ }
          if (!this.opened) { this.code = newCode(); this.emit('code', { code: this.code }); }   // code déjà pris : on en tire un autre
          setTimeout(() => this.openHost(tries + 1).then(res, rej), this.opened ? 1200 : 0);    // reconnexion : l'ancien identifiant se libère
          return;
        }
        if (!this.opened) { this.emit('error', { message: 'Création du salon impossible (' + e.type + ')' }); rej(e); }
      });
    });
  }
  onIncoming(c) {
    if (this.conn) { const kill = () => { try { c.close(); } catch (x) { /* ignore */ } }; if (c.open) kill(); else c.on('open', kill); return; }
    this.bind(c);
  }
  async stopHost() { /* le Peer reste vivant : le détruire fermerait la liaison */ }

  // ------------------------------------------------------------ invité : saisie du code
  async startSearch() {
    clearInterval(this.tw);
    if (!this.watch) return;
    const f = () => this.emit('found', { id: this.watch, name: 'Salon ' + this.watch });
    f();
    if (this.everConnected) this.tw = setInterval(f, 2000);      // reconnexion : on retente jusqu'au retour de l'hôte
  }
  async stopSearch() { clearInterval(this.tw); }
  setCode(code) {
    code = cleanCode(code); if (code.length !== 5) return false;
    this.watch = code; this.startSearch(); return true;
  }
  async connect(id) {
    await this.init();
    if (this.conn) return;
    const gp = await this.ensureGuest();
    if (this.conn) return;
    const c = gp.connect(PREFIX + id, { reliable: true });
    this.bind(c);
    clearTimeout(this.to);
    this.to = setTimeout(() => { if (this.conn === c && !c.open) { this.drop(c); this.emit('failed', { id, status: 'timeout' }); } }, CONNECT_MS);
  }
  ensureGuest() {
    if (this.gp && !this.gp.destroyed && this.gp.open) return Promise.resolve(this.gp);
    if (this.gpP) return this.gpP;
    return (this.gpP = new Promise((res, rej) => {
      const p = new globalThis.Peer(); this.gp = p; let ready = false;
      p.on('open', () => { ready = true; this.gpP = null; res(p); });
      p.on('error', (e) => {
        if (e.type === 'peer-unavailable') { const c = this.conn; if (c) this.drop(c); this.emit('failed', { id: '', status: 'unavailable' }); }
        else if (!ready) { this.gpP = null; this.emit('error', { message: 'Connexion au service impossible (' + e.type + ')' }); rej(e); }
      });
    }));
  }

  // ------------------------------------------------------------ liaison de données
  bind(c) {
    this.conn = c;
    const ready = () => {
      if (this.conn !== c) return;
      clearTimeout(this.to); this.peer = c.peer; this.everConnected = true; this.lastRx = Date.now();
      clearInterval(this.dog); this.dog = setInterval(() => { if (this.conn === c && Date.now() - this.lastRx > SILENCE_MS) { this.drop(c); this.emit('disconnected', { id: c.peer }); } }, 1000);
      this.emit('pending', { id: c.peer, name: '?', digits: '' });
      this.emit('connected', { id: c.peer, name: '?', quality: 'high' });
    };
    if (c.open) ready(); else c.on('open', ready);
    c.on('data', (d) => { if (c === this.conn && typeof d === 'string') { this.lastRx = Date.now(); this.emit('message', { id: c.peer, text: d }); } });
    const lost = () => { if (this.conn !== c) return; const was = this.peer; this.drop(c); if (was) this.emit('disconnected', { id: was }); };
    c.on('close', lost); c.on('error', lost);
  }
  drop(c) { if (this.conn === c) { this.conn = null; this.peer = null; } clearInterval(this.dog); clearTimeout(this.to); try { c.close(); } catch (x) { /* ignore */ } }
  send(text) { if (this.conn && this.conn.open) { try { this.conn.send(text); } catch (x) { /* ignore */ } } }
  async disconnect() { if (this.conn) this.drop(this.conn); }
  async reset() {
    clearInterval(this.tw); clearInterval(this.dog); clearTimeout(this.to);
    if (this.conn) this.drop(this.conn);
    this.gpP = null;
    for (const k of ['hp', 'gp']) { const p = this[k]; this[k] = null; if (p) { try { p.destroy(); } catch (x) { /* ignore */ } } }
  }
  close() { this.reset(); }
}
