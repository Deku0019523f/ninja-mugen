// Transport de TEST pour le navigateur / Node : deux onglets (ou deux instances) du même navigateur se trouvent via BroadcastChannel.
// Même interface que NearbyTransport : sert à développer et tester sans téléphone.
//  Événements : found{id,name} lost{id} pending{id,name} connected{id,name,quality} disconnected{id} message{id,text} quality failed error
import { Emitter } from './emitter.js';

export class WebTransport extends Emitter {
  static available() { return typeof BroadcastChannel !== 'undefined'; }
  constructor(channel = 'ninja-mugen-net') {
    super(); this.kind = 'web'; this.id = Math.random().toString(36).slice(2, 10);
    this.ch = new BroadcastChannel(channel); this.ch.onmessage = (e) => this.onMsg(e.data);
    this.peer = null; this.advName = null; this.searching = false; this.seen = new Map(); this.t1 = null; this.t2 = null;
    this.lag = 0;      // latence simulée (ms) pour les tests
  }
  async init() { return true; }
  post(m) { this.ch.postMessage({ ...m, from: this.id }); }

  async startHost(name) {
    this.advName = name; this.post({ k: 'adv', name });
    clearInterval(this.t1); this.t1 = setInterval(() => { if (this.advName && !this.peer) this.post({ k: 'adv', name: this.advName }); }, 700);
  }
  async stopHost() { this.advName = null; clearInterval(this.t1); }
  async startSearch() {
    this.searching = true; this.seen.clear(); this.post({ k: 'q' });
    clearInterval(this.t2);
    this.t2 = setInterval(() => {
      this.post({ k: 'q' }); const t = Date.now();
      for (const [id, s] of this.seen) if (t - s.t > 2600) { this.seen.delete(id); this.emit('lost', { id }); }
    }, 900);
  }
  async stopSearch() { this.searching = false; clearInterval(this.t2); this.seen.clear(); }
  async connect(id, name) { this.post({ k: 'req', to: id, name }); }
  send(text) { if (this.peer) this.post({ k: 'd', to: this.peer, text }); }
  async disconnect() { if (this.peer) this.post({ k: 'bye', to: this.peer }); this.peer = null; }
  async reset() { await this.stopHost(); await this.stopSearch(); await this.disconnect(); }
  close() { clearInterval(this.t1); clearInterval(this.t2); try { this.ch.close(); } catch (e) { /* ignore */ } }
  // test : simule une coupure franche des deux côtés
  simulateLoss() { const p = this.peer; if (!p) return; this.post({ k: 'cut', to: p }); this.peer = null; this.emit('disconnected', { id: p }); }

  onMsg(m) {
    if (m.from === this.id || (m.to && m.to !== this.id)) return;
    switch (m.k) {
      case 'q': if (this.advName && !this.peer) this.post({ k: 'adv', name: this.advName }); break;
      case 'adv': if (this.searching) { if (!this.seen.has(m.from)) this.emit('found', { id: m.from, name: m.name }); this.seen.set(m.from, { name: m.name, t: Date.now() }); } break;
      case 'req':
        if (this.advName && !this.peer) { this.peer = m.from; this.post({ k: 'ok', to: m.from, name: this.advName }); this.emit('pending', { id: m.from, name: m.name, digits: '0000' }); this.emit('connected', { id: m.from, name: m.name, quality: 'high' }); }
        else this.post({ k: 'no', to: m.from });
        break;
      case 'ok': this.peer = m.from; this.emit('connected', { id: m.from, name: m.name, quality: 'high' }); break;
      case 'no': this.emit('failed', { id: m.from, status: 'rejected' }); break;
      case 'd': if (m.from === this.peer) { if (this.lag) setTimeout(() => this.peer && this.emit('message', { id: m.from, text: m.text }), this.lag); else this.emit('message', { id: m.from, text: m.text }); } break;
      case 'bye': case 'cut': if (m.from === this.peer) { this.peer = null; this.emit('disconnected', { id: m.from }); } break;
      default:
    }
  }
}
