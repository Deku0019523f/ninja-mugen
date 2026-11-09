// ============================================================
//  SESSION RÉSEAU : salon (hôte / invité), échange du choix des combattants et de l'arène, lockstep du combat,
//  coupure et reprise. Indépendante du transport (Nearby Android ou BroadcastChannel de test) et du DOM.
//
//  États : idle → hosting | searching → connecting → lobby ⇄ reconnecting → closed
//  Messages texte :  F<frame>,<touches>,<ack>  entrées · H<frame>,<hash> contrôle de synchro · {json} le reste
//  Événements : hosts peer state phase pick start rematch rtt quality failed error reconnecting resumed desync closed
// ============================================================
import { Emitter } from './emitter.js';
import { Lockstep, pack, unpack, hashWorld } from './lockstep.js';

export const RECONNECT_MS = 30000;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const rid = () => Math.random().toString(36).slice(2, 8);
export const splitName = (raw) => { const i = raw.lastIndexOf('#'); return i < 0 ? { name: raw, tag: '' } : { name: raw.slice(0, i), tag: raw.slice(i + 1) }; };

export class NetSession extends Emitter {
  constructor(tr, name) {
    super(); this.tr = tr; this.name = name; this.sid = rid();
    this.role = null; this.state = 'idle'; this.prevState = null; this.phase = 'lobby'; this.connected = false;
    this.peer = null; this.expectSid = null; this.hostRaw = null; this.hosts = new Map();
    this.quality = null; this.rtt = 0; this.rtts = []; this.pingT = 0; this.resumeT = 0;
    this.ls = null; this.me = 0; this.delay = 4; this.cfg = null; this.pendingF = [];
    this.myPick = null; this.peerPick = null; this.rmMe = false; this.rmPeer = false; this.flowBound = false;
    this.stalled = 0;
    tr.on('found', (e) => this.onFound(e));
    tr.on('lost', (e) => { if (this.hosts.delete(e.id)) this.emit('hosts'); });
    tr.on('connected', (e) => this.onConnected(e));
    tr.on('disconnected', () => this.onDisconnected());
    tr.on('failed', () => this.onFailed());
    tr.on('message', (e) => this.onMessage(e.text));
    tr.on('quality', (e) => { this.quality = e.quality; this.emit('quality', e.quality); });
    tr.on('error', (e) => this.emit('error', e.message));
  }

  advName() { return `${this.name}#${this.sid}`; }
  setState(s) { this.state = s; this.emit('state', s); }
  linkLabel() {
    if (this.tr.kind === 'web') return 'TEST NAVIGATEUR';
    return { high: 'Wi-Fi', medium: 'Bluetooth', low: 'Bluetooth LE' }[this.quality] || 'Nearby';
  }

  // ---------------------------------------------------------- salon : création, recherche, connexion
  async host() {
    this.role = 'host'; this.me = 0; this.setState('hosting');
    try { await this.tr.init(); await this.tr.startHost(this.advName()); } catch (e) { this.setState('idle'); this.emit('error', String(e && e.message || e)); }
  }
  async search() {
    this.role = 'guest'; this.me = 1; this.hosts.clear(); this.setState('searching'); this.emit('hosts');
    try { await this.tr.init(); await this.tr.startSearch(); } catch (e) { this.setState('idle'); this.emit('error', String(e && e.message || e)); }
  }
  async join(id) {
    const h = this.hosts.get(id); if (!h) return;
    this.hostRaw = h.raw; this.setState('connecting');
    try { await this.tr.stopSearch(); await this.tr.connect(id, this.advName()); } catch (e) { this.emit('error', String(e && e.message || e)); this.onFailed(); }
  }
  onFound(e) {
    if (this.state === 'searching') { const { name } = splitName(e.name); this.hosts.set(e.id, { id: e.id, name, raw: e.name }); this.emit('hosts'); }
    else if (this.state === 'reconnecting' && this.role === 'guest' && e.name === this.hostRaw) this.tr.connect(e.id, this.advName()).catch(() => {});
  }
  onFailed() {
    if (this.state === 'connecting') { this.hosts.clear(); this.setState('searching'); this.tr.startSearch().catch(() => {}); this.emit('failed'); }
    else if (this.state === 'reconnecting') this.relink();
  }
  onConnected(e) {
    this.connected = true; this.q0 = e.quality; if (e.quality && e.quality !== 'unknown') { this.quality = e.quality; }
    Promise.resolve(this.tr.stopHost()).catch(() => {}); Promise.resolve(this.tr.stopSearch()).catch(() => {});
    this.sendJ({ t: 'hi', sid: this.sid, name: this.name, v: 1 });
  }
  onDisconnected() {
    this.connected = false;
    if (this.state === 'closed' || this.state === 'idle') return;
    if (!this.peer) { if (this.state === 'connecting') this.onFailed(); return; }
    if (this.state !== 'reconnecting') {
      this.prevState = this.state; this.setState('reconnecting'); this.emit('reconnecting', RECONNECT_MS);
      clearTimeout(this.resumeT); this.resumeT = setTimeout(() => this.close('timeout'), RECONNECT_MS);
    }
    this.relink();
  }
  // après une coupure : l'hôte ré-annonce son salon, l'invité le recherche (connexion automatique au même nom)
  async relink() {
    try { await this.tr.reset(); if (this.state !== 'reconnecting') return; if (this.role === 'host') await this.tr.startHost(this.advName()); else await this.tr.startSearch(); }
    catch (e) { /* on réessaie à la prochaine coupure / au timeout */ }
  }
  close(reason) {
    if (this.state === 'closed') return;
    clearTimeout(this.resumeT); clearInterval(this.pingT); this.setState('closed'); this.connected = false;
    Promise.resolve(this.tr.reset()).catch(() => {});
    this.emit('closed', reason);
  }
  leave() { if (this.state === 'closed') return; this.sendJ({ t: 'bye' }); this.close('self'); }

  // ---------------------------------------------------------- messages
  raw(s) { if (this.connected) this.tr.send(s); }
  sendJ(o) { this.raw(JSON.stringify(o)); }
  onMessage(text) {
    const c = text[0];
    if (c === 'F') { const [f, b, a] = text.slice(1).split(',').map(Number); if (this.ls) this.ls.onFrame(f, b, a); else this.pendingF.push(text); return; }
    if (c === 'H') { const [f, h] = text.slice(1).split(',').map(Number); if (this.ls) { const r = this.ls.onHash(f, h); if (r) this.onDesync(r); } return; }
    let m; try { m = JSON.parse(text); } catch (e) { return; }
    switch (m.t) {
      case 'hi': return this.onHi(m);
      case 'rs': if (this.ls) for (const s of this.ls.resumePackets(m.have)) this.raw(s); return;
      case 'pg': return this.sendJ({ t: 'po', ts: m.ts });
      case 'po': return this.onPong(m.ts);
      case 'ph': this.emit('phase', m.s); return;
      case 'pick': this.peerPick = m.id; this.emit('pick', m.id); return;
      case 'rm': this.rmPeer = true; this.emit('rematch'); return;
      case 'start': return this.beginMatch(m.cfg);
      case 'bye': return this.close('peer');
      default:
    }
  }
  onHi(m) {
    if (this.expectSid && m.sid !== this.expectSid) { this.sendJ({ t: 'bye' }); this.tr.disconnect(); return; }   // autre joueur que celui de la partie
    const again = this.state === 'reconnecting';
    this.peer = { sid: m.sid, name: m.name }; this.expectSid = m.sid;
    clearInterval(this.pingT); this.pingT = setInterval(() => { if (this.connected) this.sendJ({ t: 'pg', ts: now() }); }, 1000);
    if (again) {
      clearTimeout(this.resumeT); this.setState(this.prevState || 'lobby');
      this.sendJ({ t: 'rs', have: this.ls ? this.ls.have : -1 });
      if (!this.ls) { this.myPick = this.peerPick = null; }
      this.emit('resumed');
    } else { this.phase = 'lobby'; this.setState('lobby'); this.emit('peer', this.peer); }
  }
  onPong(ts) {
    const r = now() - ts; this.rtts.push(r); if (this.rtts.length > 5) this.rtts.shift();
    this.rtt = this.rtts.reduce((a, b) => a + b, 0) / this.rtts.length; this.emit('rtt', this.rtt);
  }
  // délai d'entrée (frames) : ping mesuré, sinon qualité de la liaison
  chooseDelay() {
    if (this.rtts.length) return Math.min(12, Math.max(3, Math.ceil(this.rtt / 16.7) + 2));
    return { high: 4, medium: 7, low: 10 }[this.quality] || 5;
  }

  // ---------------------------------------------------------- étapes du salon
  setPhase(s) { this.sendJ({ t: 'ph', s }); this.emit('phase', s); }
  setPick(id) { this.myPick = id; this.sendJ({ t: 'pick', id }); }
  rematch() { this.rmMe = true; this.sendJ({ t: 'rm' }); }

  // ---------------------------------------------------------- combat
  // hôte : choisit graine, délai, combattants, arène ; l'invité reçoit la même configuration
  startMatch({ stage, p1, p2, timer = 99, need = 2 }) {
    const cfg = { seed: (Math.random() * 1e9) | 0, stage, p1, p2, delay: this.chooseDelay(), timer, need };
    this.sendJ({ t: 'start', cfg }); this.beginMatch(cfg);
  }
  beginMatch(cfg) {
    this.cfg = cfg; this.delay = cfg.delay; this.phase = 'match'; this.rmMe = this.rmPeer = false; this.stalled = 0;
    this.ls = new Lockstep({ me: this.me, delay: cfg.delay, send: (s) => this.raw(s) });
    for (const s of this.pendingF.splice(0)) this.onMessage(s);
    this.emit('start', cfg);
  }
  endMatch() { this.ls = null; this.phase = 'lobby'; this.myPick = this.peerPick = null; }

  // interface utilisée par Match
  ready(f) { return !!this.ls && this.ls.ready(f); }
  capture(f, raw) { this.ls.capture(f, pack(raw)); }
  get(p, f) { return unpack(this.ls.get(p, f)); }
  consume(f) { this.ls.consume(f); }
  afterFrame(f, world) {
    if (f % 60 !== 59) return;
    const h = hashWorld(world); this.raw(`H${f},${h}`);
    const r = this.ls.noteHash(f, h); if (r) this.onDesync(r);
  }
  onDesync(r) { this.emit('desync', r); }
}
