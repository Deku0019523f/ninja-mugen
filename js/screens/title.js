// Accueil : titre géant devant la lune, menu flottant à droite (DUEL en vedette), raccourcis discrets en bas.
import { G, el } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { ICON } from '../ui/icons.js';
import { drawPortrait } from '../render/sprites.js';
import { prog } from '../progress.js';
import { sfx } from '../audio.js';

const MOUNT = '<svg class="mount" viewBox="0 0 1200 140" preserveAspectRatio="none" aria-hidden="true"><path d="M0 140V92l110-46 100 40 130-62 120 70 120-44 130 50 130-72 130 66 110-40 120 48V140z"/></svg>';

export default function sTitle() {
  const S = G.S, root = el('div', 'home');
  root.innerHTML = `<div class="moon"></div>${MOUNT}
    <div class="home-l"><span class="tag">${ICON.bolt}MUGEN TOURNAMENT</span><h1>NINJA MUGEN</h1>
      <div class="home-meta"><b>${ROSTER.length} COMBATTANTS</b><i>·</i><span>TAG TEAM 2v2</span><i>·</i><span class="ok">● 1 À 2 JOUEURS</span></div></div>
    <div class="home-hero"><div class="hh-aura"></div><canvas width="200" height="200"></canvas><div class="hh-plate"></div></div>
    <div class="cur-chip home-cur"></div>
    <div class="home-r"></div>
    <div class="home-bar"></div>
    <div class="home-hint"><span>${ICON.key}FLÈCHES · ZQSD + ENTRÉE</span><span>${ICON.pad}MANETTE</span><span>${ICON.touch}TACTILE</span></div>`;
  const box = root.querySelector('.home-r');
  G.screenEl.appendChild(root);
  // héros mis en avant (le dernier combattant joué) + monnaies
  const hid = Math.min(ROSTER.length - 1, G.S.hero || 0), hc = ROSTER[hid];
  const hcv = root.querySelector('.home-hero canvas'); drawPortrait(hcv.getContext('2d'), hc, 200);
  root.querySelector('.hh-plate').innerHTML = `<b>${hc.name.toUpperCase()}</b><span>${hc.title || ''}</span><em>RANG ${prog.rank(hid)} · NIV ${prog.level(hid)}</em>`;
  root.querySelector('.home-hero').onclick = () => { sfx.ok(); G.go('heroes'); };
  root.querySelector('.home-cur').innerHTML = `<b>●</b> ${prog.coins} <b class="g">◆</b> ${prog.gems}`;
  // barre d'icônes en bas
  const bar = root.querySelector('.home-bar'), dl = prog.daily();
  [['star', 'HÉROS', 'heroes', false], ['dice', 'CADEAU', 'daily', dl.can], ['pad', 'COMMANDES', 'controls', false], ['sliders', 'OPTIONS', 'options', false]].forEach(([ic, lb, to, dot]) => {
    const b = el('button', 'hb' + (dot ? ' dot' : ''), `<span>${ICON[ic]}</span><em>${lb}</em>`); b.onclick = () => { sfx.ok(); G.go(to); }; bar.appendChild(b);
  });

  const play = (mode) => () => { sfx.ok(); G.mode = mode; G.go('select'); };
  const MAIN = () => [
    { icon: 'swords', label: `DUEL ${S.fmt}V${S.fmt}`, sub: S.vs === 'p2' ? 'VS J2' : 'VS IA', feat: true, ok: play('single') },
    { icon: 'star', label: 'ARCADE RUN', sub: '8 COMBATS', ok: play('arcade') },
    { icon: 'net', label: 'MULTIJOUEUR', sub: 'WI-FI · BLUETOOTH', ok: () => { sfx.ok(); G.mode = 'online'; G.go('online'); } },
    { icon: 'dice', label: 'AUTRES MODES', sub: '2 MODES', ok: () => { sfx.ok(); level = 1; idx = 0; build(); } },
  ];
  const MORE = () => [
    { icon: 'shield', label: 'SURVIE', sub: 'SÉRIE SANS FIN', ok: play('survival') },
    { icon: 'fist', label: 'ENTRAÎNEMENT', sub: 'MANNEQUIN', ok: play('training') },
    { icon: 'back', label: 'RETOUR', sub: '', ok: () => { sfx.back(); level = 0; idx = 3; build(); } },
  ];
  let level = 0, idx = 0, items = [], rows = [];
  const draw = () => rows.forEach((r, i) => r.classList.toggle('sel', i === idx));
  function build() {
    items = level ? MORE() : MAIN(); box.innerHTML = ''; box.classList.toggle('more', !!level);
    rows = items.map((it, i) => {
      const w = el('div', 'hmw' + (it.feat ? ' feat' : '')), r = el('div', 'hm cur');
      r.innerHTML = `<span class="hm-i">${ICON[it.icon]}</span><span class="hm-l">${it.label}</span>${it.sub ? `<span class="hm-s">${it.sub}</span>` : ''}`;
      r.onmouseenter = () => { if (idx !== i) { idx = i; draw(); } };
      r.onclick = () => { idx = i; it.ok(); };
      w.appendChild(r); box.appendChild(w); return r;
    });
    draw();
  }
  build();
  G.handler = (k) => {
    if (k === 'up') idx = (idx + items.length - 1) % items.length; else if (k === 'down') idx = (idx + 1) % items.length;
    else if (k === 'ok') return items[idx].ok();
    else if (k === 'back') { if (level) { sfx.back(); level = 0; idx = 3; build(); } return; }
    else return;
    sfx.ui(); draw();
  };
}
