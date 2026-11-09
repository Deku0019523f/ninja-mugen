// Déroulé d'une partie en ligne côté interface : salon → choix des combattants → arène (hôte) → combat → revanche.
// Écoute la session (indépendamment de l'écran affiché) et pilote les changements d'écran des deux appareils.
import { G } from '../screens/ctx.js';
import { shell } from '../ui/shell.js';

let cdT = 0;
export const flow = {
  bind(net) {
    if (net.flowBound) return; net.flowBound = true; G.net = net;
    net.on('phase', (s) => {
      net.advanced = false;
      if (s === 'select') { net.myPick = net.peerPick = null; G.mode = 'online'; G.go('select'); }
      else if (s === 'stage') { if (net.role === 'host') G.go('stage'); else G.go('online', { view: 'wait', text: 'L\'hôte choisit l\'arène…' }); }
      else if (s === 'lobby') { G.mode = 'online'; G.go('online', { view: 'lobby' }); }
    });
    net.on('pick', () => this.advance());
    net.on('rematch', () => this.advanceRematch());
    net.on('start', (cfg) => {
      G.mode = 'online';
      G.run = { mode: 'online', fmt: 1, vs: 'net', diff: 3, need: cfg.need, timer: cfg.timer, p1: cfg.p1, p2: cfg.p2, sup1: null, sup2: null, stage: cfg.stage, seed: cfg.seed, wins: 0, fight: 0, carry: null, score: 0, net: true };
      G.netStatus(null); G.launch();
    });
    net.on('reconnecting', (ms) => {
      const t0 = Date.now(); clearInterval(cdT);
      const upd = () => G.netStatus(`Connexion perdue — reconnexion… ${Math.max(0, Math.ceil((ms - (Date.now() - t0)) / 1000))} s`);
      upd(); cdT = setInterval(upd, 500);
    });
    net.on('resumed', () => { clearInterval(cdT); G.netStatus(null); shell.toast('Connexion rétablie'); if (!net.ls) G.go('online', { view: 'lobby' }); });
    net.on('desync', () => net.close('desync'));
    net.on('closed', (why) => {
      clearInterval(cdT); G.netStatus(null);
      if (why === 'self') return;
      G.go('title');
      shell.toast(why === 'desync' ? 'Désynchronisation détectée : partie interrompue' : why === 'timeout' ? 'Adversaire injoignable : partie terminée' : 'L\'adversaire a quitté la partie');
    });
  },
  // choix du combattant local validé
  picked(id) { const n = G.net; n.setPick(id); this.advance(); },
  advance() {
    const n = G.net; if (!n || n.myPick == null) return;
    if (n.peerPick == null) { G.go('online', { view: 'wait', text: `En attente de ${n.peer.name}…`, cancel: 'select' }); return; }
    if (n.advanced) return; n.advanced = true;
    if (n.role === 'host') n.setPhase('stage'); else G.go('online', { view: 'wait', text: 'L\'hôte choisit l\'arène…' });
  },
  stagePicked(i) { const n = G.net; n.startMatch({ stage: i, p1: [n.myPick], p2: [n.peerPick] }); },
  backToSelect() { const n = G.net; n.setPhase('select'); },
  rematch() { const n = G.net; n.rematch(); this.advanceRematch(); },
  advanceRematch() { const n = G.net; if (n.rmMe && n.rmPeer && n.role === 'host') n.startMatch({ stage: n.cfg.stage, p1: n.cfg.p1, p2: n.cfg.p2, timer: n.cfg.timer, need: n.cfg.need }); },
};
