// Multijoueur local : accueil (créer / rejoindre), salon d'attente, recherche de salons proches, salle (liaison, ping), attente.
// Vues : hub · host · search · connecting · lobby · wait   (G.go('online', { view, text, cancel }))
import { G, el, save } from './ctx.js';
import { ICON } from '../ui/icons.js';
import { pageHead } from '../ui/shell.js';
import { sfx } from '../audio.js';
import { createTransport } from '../net/index.js';
import { NetSession } from '../net/session.js';
import { flow } from '../net/flow.js';

const playerName = () => {
  if (!G.S.pname) { G.S.pname = 'NINJA-' + Math.random().toString(16).slice(2, 6).toUpperCase(); save(); }
  return G.S.pname;
};
const alive = () => G.net && G.net.state !== 'closed' && G.net.state !== 'idle';

export default function sOnline(d = {}) {
  let view = d.view || 'hub', err = '', idx = 0, items = [];
  let net = alive() ? G.net : null;
  const root = el('div', 'ol'), body = el('div', 'ol-body');
  const titles = { hub: 'MULTIJOUEUR LOCAL', host: 'VOTRE SALON', search: 'SALONS PROCHES', connecting: 'CONNEXION', lobby: 'SALLE DE COMBAT', wait: 'EN ATTENTE' };
  const head = pageHead({ title: titles[view], onBack: () => act('back') });
  root.append(head, body); G.screenEl.appendChild(root);
  const offs = []; G.onLeave = () => offs.forEach((f) => f());

  const ensure = () => {
    if (!net) { net = new NetSession(createTransport(), playerName()); flow.bind(net); G.net = net; bindNet(); }
    return net;
  };
  const bindNet = () => {
    const on = (e, f) => offs.push(net.on(e, f));
    on('hosts', () => { if (view === 'search') render(); });
    on('peer', () => { view = 'lobby'; sfx.ok(); render(); });
    on('rtt', () => { if (view === 'lobby') updateStats(); });
    on('quality', () => { if (view === 'lobby') render(); });
    on('failed', () => { err = 'Connexion impossible, nouvelle recherche…'; render(); });
    on('error', (m) => { err = m; if (['host', 'search'].includes(view) && net.state === 'idle') view = 'hub'; render(); });
  };
  if (net) bindNet();

  const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;
  const radar = (txt) => `<div class="radar"><i></i><i></i><i></i><span>${ICON.net}</span></div><div class="rd-t">${txt}</div>`;
  const card = (cls, ic, t, s, fn) => { const c = el('div', 'ol-card cur ' + cls, `<span class="oc-i">${ICON[ic]}</span><div><b>${t}</b><small>${s}</small></div>`); c.fn = fn; return c; };
  const btn = (txt, fn, cls = 'btn') => { const b = el('button', cls + ' cur', `<span>${txt}</span>`); b.fn = fn; return b; };

  function updateStats() {
    const r = body.querySelector('.ping'); if (r) r.textContent = net && net.rtt ? Math.round(net.rtt) + ' ms' : '…';
  }

  function render() {
    body.innerHTML = ''; items = [];
    const add = (e) => { items.push(e); e.onclick = () => { idx = items.indexOf(e); e.fn(); }; e.onmouseenter = () => { idx = items.indexOf(e); mark(); }; return e; };
    const errEl = err ? `<div class="ol-err">${ICON.warn}<span>${err}</span></div>` : '';
    head.querySelector('h2').firstChild.textContent = titles[view];
    if (view === 'hub') {
      const wrap = el('div', 'ol-hub');
      wrap.append(add(card('org', 'swords', 'CRÉER UN SALON', 'Devenez l\'hôte : les joueurs proches vous trouvent', () => { sfx.ok(); err = ''; view = 'host'; ensure().host(); render(); })),
        add(card('cy', 'net', 'REJOINDRE UN SALON', 'Recherche automatique des salons proches', () => { sfx.ok(); err = ''; view = 'search'; ensure().search(); render(); })));
      body.append(wrap, el('div', 'ol-foot', `${ICON.net}<span>${window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform() ? 'Google Nearby : Wi-Fi, point d\'accès et Bluetooth choisis automatiquement' : 'Mode test navigateur (BroadcastChannel) : ouvrez le jeu dans deux onglets'} · Pseudo <b>${playerName()}</b></span>`));
      if (err) body.insertAdjacentHTML('beforeend', errEl);
    } else if (view === 'host') {
      body.append(el('div', 'ol-mid', radar(`Salon <b>${playerName()}</b> ouvert<br><small>En attente d'un adversaire proche…</small>`) + errEl), add(btn('ANNULER', () => act('back'))));
    } else if (view === 'search') {
      const left = el('div', 'ol-l', radar('Recherche de salons proches…') + errEl), list = el('div', 'ol-list');
      const hs = [...net.hosts.values()];
      if (!hs.length) list.innerHTML = '<div class="ol-empty">Aucun salon trouvé pour l\'instant.<br><small>L\'hôte doit avoir choisi « Créer un salon ». Bluetooth et Wi-Fi activés des deux côtés.</small></div>';
      for (const h of hs) list.appendChild(add(el('div', 'ol-host cur', `<span class="oc-i">${ICON.swords}</span><b>${h.name}</b><i>REJOINDRE${ICON.chev}</i>`)));
      hs.forEach((h, i) => { const e = items[i]; e.fn = () => { sfx.ok(); err = ''; view = 'connecting'; net.join(h.id); render(); }; });
      const row = el('div', 'ol-row'); row.append(left, list);
      body.append(row, add(btn('ANNULER', () => act('back'))));
    } else if (view === 'connecting') {
      body.append(el('div', 'ol-mid', radar('Connexion au salon…') + errEl), add(btn('ANNULER', () => act('back'))));
    } else if (view === 'lobby') {
      const me = net.name, pe = net.peer ? net.peer.name : '?', host = net.role === 'host';
      const a = host ? me : pe, b = host ? pe : me;
      body.append(el('div', 'ol-vs', `<div class="plate org ol-p"><small>HÔTE · J1</small><b>${a}</b></div><div class="ol-x">VS</div><div class="plate cy ol-p"><small>INVITÉ · J2</small><b>${b}</b></div>`),
        el('div', 'ol-stats', kv('Liaison', net.linkLabel()) + kv('Ping', '<span class="ping">' + (net.rtt ? Math.round(net.rtt) + ' ms' : '…') + '</span>')));
      if (host) { const g = el('button', 'btn-main cur', `<span>${ICON.swords}CHOISIR LES COMBATTANTS</span>`); g.fn = () => { sfx.ok(); net.setPhase('select'); }; body.append(add(g)); }
      else body.append(el('div', 'ol-wait', 'En attente de l\'hôte…'));
      body.append(add(btn('QUITTER LE SALON', () => act('back'))));
      if (err) body.insertAdjacentHTML('beforeend', errEl);
    } else if (view === 'wait') {
      body.append(el('div', 'ol-mid', radar(d.text || 'En attente…')));
      if (d.cancel === 'select') body.append(add(btn('CHANGER DE CHOIX', () => { G.net.setPick(null); G.go('select'); })));
      else body.append(add(btn('QUITTER LE SALON', () => act('back'))));
    }
    idx = Math.min(idx, Math.max(0, items.length - 1)); mark();
  }
  const mark = () => items.forEach((e, i) => e.classList.toggle('sel', i === idx));

  function act(k) {
    if (k === 'back') {
      sfx.back();
      if (view === 'hub' || !net) return G.go('title');
      if (view === 'wait' && d.cancel === 'select') { G.net.setPick(null); return G.go('select'); }
      net.leave(); net = null; G.net = null; return G.go('online');
    }
    if (k === 'up' || k === 'left') idx = (idx + items.length - 1) % items.length;
    else if (k === 'down' || k === 'right') idx = (idx + 1) % items.length;
    else if (k === 'ok') { if (items[idx]) items[idx].fn(); return; }
    else return;
    sfx.ui(); mark();
  }
  G.handler = act; render();
}
