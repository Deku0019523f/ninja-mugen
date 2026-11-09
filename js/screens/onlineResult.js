// Fin d'un combat en ligne : revanche (les deux joueurs doivent accepter), changer de combattants (hôte), quitter
import { G } from './ctx.js';
import { listMenu } from '../ui/menu.js';
import { flow } from '../net/flow.js';
import { sfx } from '../audio.js';

export default function sOnlineResult(d) {
  const net = G.net, host = net.role === 'host', opp = net.peer ? net.peer.name : 'adversaire';
  const items = [];
  items.push({ label: d.waiting ? 'Revanche — en attente…' : 'Revanche', ok: () => { sfx.ok(); if (!d.waiting) { flow.rematch(); G.go('onlineResult', { ...d, waiting: true }); } } });
  if (host) items.push({ label: 'Changer de combattants', ok: () => { sfx.ok(); net.setPhase('select'); } });
  items.push({ label: 'Quitter le salon', ok: () => { sfx.ok(); net.leave(); G.go('title'); } });
  const off = net.on('rematch', () => { if (!d.waiting) G.go('onlineResult', d); });
  G.onLeave = off;
  listMenu(items, { title: d.win ? 'VICTOIRE !' : 'DÉFAITE', sub: `Manches : ${d.wins[net.me]} — ${d.wins[1 - net.me]}<br>contre <b>${opp}</b>` + (net.rmPeer ? '<br>L\'adversaire veut une revanche' : ''), onBack: () => { net.leave(); G.go('title'); } });
  (d.win ? sfx.win : sfx.lose)();
}
