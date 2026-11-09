// Multijoueur : deux Match + deux sessions reliés par WebTransport (BroadcastChannel). Vérifie :
//  1) synchro parfaite : l'état du monde (hash) est identique à CHAQUE frame sur les deux appareils, avec latence simulée ;
//  2) coupure en plein combat : reconnexion automatique, reprise exacte, états toujours identiques ;
//  3) une désynchronisation provoquée est bien détectée ;
//  4) la sérialisation des touches (pack / unpack) est sans perte.
globalThis.document = { body: { classList: { contains: () => false, add() {} } }, getElementById: () => null, querySelector: () => null };
const { WebTransport } = await import('../js/net/web.js');
const { NetSession } = await import('../js/net/session.js');
const { Match } = await import('../js/game/match.js');
const { hashWorld, pack, unpack, KEYS } = await import('../js/net/lockstep.js');

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } else console.log('  ok  ', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (f, ms = 8000, what = '') => { const t = Date.now(); while (!f()) { if (Date.now() - t > ms) throw new Error('délai dépassé : ' + what); await sleep(5); } };

// 4) pack / unpack
{ let good = true; for (let i = 0; i < 4096; i++) { const o = {}; KEYS.forEach((k, j) => { o[k] = (i >> j) & 1; }); const u = unpack(pack(o)); if (KEYS.some((k) => u[k] !== o[k])) good = false; } ok(good, 'pack / unpack : 4096 combinaisons de touches sans perte'); }

const rng = (seed) => { let s = seed >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
const bot = (seed) => { const r = rng(seed); let cur = {}, t = 0; return () => { if (--t <= 0) { t = 3 + ((r() * 12) | 0); cur = {}; for (const k of ['l', 'r', 'u', 'd', 'o', 'x', 'sq', 'tri', 'r2', 'l2']) cur[k] = r() < (k === 'o' ? 0.4 : 0.12) ? 1 : 0; if (cur.l && cur.r) cur.r = 0; } return { ...cur }; }; };
const view = { setStage() {}, setFighters() {}, render() {}, handle() {}, camX: 0, flash: 0 };
const hud = { banner() {}, event() {}, update() {}, built: false };

async function scenario(name, { loss = false, tamper = false, lag = 6, frames = 4000 }) {
  console.log('\n— ' + name);
  const ch = 'test-' + name, ta = new WebTransport(ch), tb = new WebTransport(ch); ta.lag = tb.lag = lag;
  const A = new NetSession(ta, 'Alpha'), B = new NetSession(tb, 'Bravo');
  const ev = { A: { re: 0, res: 0, desync: 0 }, B: { re: 0, res: 0, desync: 0 } };
  for (const [k, S] of [['A', A], ['B', B]]) { S.on('reconnecting', () => ev[k].re++); S.on('resumed', () => ev[k].res++); S.on('desync', () => ev[k].desync++); }
  await A.host(); await B.search();
  await until(() => B.hosts.size > 0, 5000, 'salon trouvé'); ok(B.hosts.size === 1 && [...B.hosts.values()][0].name === 'Alpha', 'le salon de l\'hôte est trouvé par la recherche automatique');
  await B.join([...B.hosts.keys()][0]);
  await until(() => A.state === 'lobby' && B.state === 'lobby', 5000, 'connexion'); ok(A.peer.name === 'Bravo' && B.peer.name === 'Alpha', 'connexion établie, noms échangés');

  const hist = { A: new Map(), B: new Map() }, M = {}, done = { A: false, B: false };
  const mk = (k, S, seed) => (cfg) => {
    const orig = S.afterFrame.bind(S); S.afterFrame = (f, w) => { hist[k].set(f, hashWorld(w)); orig(f, w); };
    M[k] = new Match({ mode: 'online', fmt: 1, vs: 'net', diff: 3, timer: cfg.timer, need: cfg.need, p1: cfg.p1, p2: cfg.p2, stage: cfg.stage, sup: false, seed: cfg.seed, net: S, readLocal: bot(seed) }, view, hud, () => { done[k] = true; });
  };
  A.on('start', mk('A', A, 11)); B.on('start', mk('B', B, 22));
  A.startMatch({ stage: 0, p1: [5], p2: [17], timer: 99, need: 2 });
  await until(() => M.A && M.B, 3000, 'match démarré des deux côtés');
  ok(M.A.world._s === M.B.world._s && A.cfg.seed === B.cfg.seed, 'même graine du hasard et même configuration des deux côtés');

  let cut = false, tampered = false, i = 0;
  for (; i < frames && !(done.A && done.B); i++) {
    M.A.frame(1 / 60); M.B.frame(1 / 60);
    if (loss && !cut && M.A.nf > 400) { cut = true; ta.simulateLoss(); }
    if (tamper && !tampered && M.A.nf > 200) { tampered = true; M.B.world.fighters[0].hp -= 3; }
    if (tamper && (ev.A.desync || ev.B.desync)) break;
    await sleep(1);
  }
  const common = [...hist.A.keys()].filter((f) => hist.B.has(f));
  const diff = common.filter((f) => hist.A.get(f) !== hist.B.get(f));
  const mx = M.A.world.fighters.some((f) => f.hp < f.maxHp);
  if (tamper) {
    ok(ev.A.desync + ev.B.desync > 0, 'la désynchronisation provoquée est détectée (' + (ev.A.desync + ev.B.desync) + ' alerte(s))');
  } else {
    ok(common.length > 600, common.length + ' frames de combat comparées sur les deux appareils');
    ok(diff.length === 0, 'état du monde identique à chaque frame' + (diff.length ? ' (1re divergence : frame ' + diff[0] + ')' : ''));
    ok(ev.A.desync + ev.B.desync === 0, 'aucune désynchronisation signalée');
    ok(mx, 'le combat a bien eu lieu (des coups ont porté)');
  }
  if (loss) ok(ev.A.re >= 1 && ev.B.re >= 1 && ev.A.res >= 1 && ev.B.res >= 1, 'coupure détectée puis reprise automatique des deux côtés (A ' + ev.A.re + '/' + ev.A.res + ', B ' + ev.B.re + '/' + ev.B.res + ')');
  console.log('   frames simulées :', M.A.nf, '/', M.B.nf, '· manches', M.A.wins, M.B.wins);
  A.close('test'); B.close('test'); ta.close(); tb.close();
}

await scenario('synchro', { frames: 14000 });
await scenario('coupure', { loss: true });
await scenario('desync', { tamper: true });
console.log(fails ? `\n${fails} échec(s) (réseau)` : '\nRéseau : tous les tests passent');
process.exit(fails ? 1 : 0);
