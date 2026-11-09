// Transport WebRTC (code de salon) : PeerJS est remplacé par une imitation en mémoire. Vérifie : code unique, connexion par code,
// salon introuvable, échange des messages, coupure puis reconnexion automatique (hôte qui reprend le même code).
globalThis.document = {};
globalThis.RTCPeerConnection = function () {};
const reg = new Map();
const tick = (f) => setTimeout(f, 2);
class Ev { constructor() { this.h = {}; } on(e, f) { (this.h[e] ||= []).push(f); } emit(e, ...a) { for (const f of this.h[e] || []) f(...a); } }
class Conn extends Ev {
  constructor(peer) { super(); this.peer = peer; this.open = false; this.other = null; }
  send(d) { const o = this.other; if (this.open && o) tick(() => o.open && o.emit('data', d)); }
  close() { if (!this.open) return; this.open = false; const o = this.other; tick(() => { if (o && o.open) { o.open = false; o.emit('close'); } }); }
}
globalThis.Peer = class Peer extends Ev {
  constructor(id) {
    super(); this.id = id || 'anon-' + Math.random().toString(36).slice(2, 8); this.destroyed = false; this.open = false; this.conns = [];
    tick(() => { if (reg.has(this.id)) return this.emit('error', { type: 'unavailable-id' }); reg.set(this.id, this); this.open = true; this.emit('open', this.id); });
  }
  connect(id) {
    const a = new Conn(id);
    tick(() => {
      const t = reg.get(id); if (!t) return this.emit('error', { type: 'peer-unavailable' });
      const b = new Conn(this.id); a.other = b; b.other = a; this.conns.push(a); t.conns.push(b);
      t.emit('connection', b); tick(() => { a.open = b.open = true; a.emit('open'); b.emit('open'); });
    });
    return a;
  }
  destroy() { this.destroyed = true; this.open = false; if (reg.get(this.id) === this) reg.delete(this.id); for (const c of this.conns) c.close(); }
};
const { WebRtcTransport, cleanCode } = await import('../js/net/webrtc.js');
const { NetSession } = await import('../js/net/session.js');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } else console.log('  ok  ', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (f, ms = 8000, w = '') => { const t = Date.now(); while (!f()) { if (Date.now() - t > ms) throw new Error('délai dépassé : ' + w); await sleep(5); } };

ok(cleanCode(' ab-c1d2e9 ') === 'ABC1D', 'cleanCode : majuscules, 5 caractères, sans symboles');
const ta = new WebRtcTransport(), tb = new WebRtcTransport();
ok(/^[A-Z2-9]{5}$/.test(ta.code) && ta.code !== tb.code, 'code de salon de 5 caractères');
const A = new NetSession(ta, 'Alpha'), B = new NetSession(tb, 'Bravo');
const ev = { A: { re: 0, res: 0 }, B: { re: 0, res: 0 } }; const msgs = [];
for (const [k, S] of [['A', A], ['B', B]]) { S.on('reconnecting', () => ev[k].re++); S.on('resumed', () => ev[k].res++); }
A.on('phase', (s) => msgs.push(s));
await A.host(); await B.search();
ok(tb.setCode('ZZZZZ') && (await until(() => B.hosts.size === 1), true), 'un code saisi apparaît comme salon');
const fail = new Promise((r) => B.on('failed', r)); B.join('ZZZZZ'); await fail;
ok(B.state === 'searching', 'salon introuvable : retour à la recherche');
tb.setCode(ta.code); await B.join(ta.code);
await until(() => A.state === 'lobby' && B.state === 'lobby', 5000, 'connexion');
ok(A.peer.name === 'Bravo' && B.peer.name === 'Alpha', 'connexion par code, noms échangés');
ok(B.linkLabel() === 'INTERNET (WEBRTC)', 'liaison affichée : ' + B.linkLabel());
B.setPhase('select'); await sleep(30); ok(msgs.includes('select'), 'les messages passent entre les deux appareils');
// coupure franche côté invité puis reprise automatique
tb.conn.close(); tb.conn && tb.drop(tb.conn); tb.emit('disconnected', { id: 'x' });
await until(() => ev.A.re >= 1 && ev.B.re >= 1, 5000, 'coupure détectée');
await until(() => ev.A.res >= 1 && ev.B.res >= 1, 15000, 'reprise');
ok(A.state === 'lobby' && B.state === 'lobby', 'reconnexion automatique au même salon (A ' + ev.A.re + '/' + ev.A.res + ', B ' + ev.B.re + '/' + ev.B.res + ')');
B.setPhase('stage'); await sleep(30); ok(msgs.includes('stage'), 'les messages circulent après la reconnexion');
A.close('test'); B.close('test');
console.log(fails ? `\n${fails} échec(s) (WebRTC)` : '\nWebRTC : tous les tests passent');
process.exit(fails ? 1 : 0);
