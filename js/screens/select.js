import { G, el } from './ctx.js';
import { ROSTER, ARCH } from '../data/roster.js';
import { MOVE2 } from '../game/moves.js';
import { drawFighter, drawPortrait, poseFor } from '../render/sprites.js';
import { MODES } from '../modes/index.js';
import { sfx } from '../audio.js';

export default function sSelect() {
  const S = G.S, mode = G.mode, m = MODES[mode];
  const fmt = m.solo ? 1 : S.fmt, humanP2 = mode === 'single' && S.vs === 'p2';
  const slots = []; for (let i = 0; i < fmt; i++) slots.push({ who: 'JOUEUR 1', t: 0 });
  if (humanP2) for (let i = 0; i < fmt; i++) slots.push({ who: 'JOUEUR 2', t: 1 });
  else if (mode === 'single' || mode === 'training') for (let i = 0; i < fmt; i++) slots.push({ who: 'ADVERSAIRE', t: 1 });
  const picks = []; let cur = 0;
  const COLS = 10, N = ROSTER.length;
  const cell = Math.max(32, Math.min(50, Math.floor((G.view.vw - 120 - 26 - 22 - 230) / COLS) - 4));
  const wrap = el('div', 'select'); wrap.style.setProperty('--cell', cell + 'px');
  const left = el('div', 'sel-left'), head = el('div', 'sel-head'), grid = el('div', 'grid'), side = el('div', 'side');
  left.append(head, grid); wrap.append(left, side); G.screenEl.appendChild(wrap);
  let tapNew = false;
  const cells = ROSTER.map((c, i) => {
    const d = el('div', 'cell'); const cv = el('canvas'); cv.width = cv.height = 48; drawPortrait(cv.getContext('2d'), c, 48); d.appendChild(cv);
    d.onmouseenter = () => { cur = i; draw(); };
    d.onpointerdown = (e) => { tapNew = e.pointerType === 'touch' && cur !== i; };   // tactile : 1er appui = aperçu, 2e = valider
    d.onclick = () => { if (tapNew) { tapNew = false; cur = i; return draw(); } cur = i; act('ok'); };
    grid.appendChild(d); return d;
  });
  const rnd = el('div', 'cell', '?'); rnd.onclick = () => { cur = Math.floor(Math.random() * N); act('ok'); }; grid.appendChild(rnd);
  side.innerHTML = '<canvas class="prev" width="128" height="128"></canvas><div class="nm"></div><div class="ti"></div><div class="st"></div><div class="tc"></div><div class="ok">VALIDER ▶</div>';
  side.querySelector('.ok').onclick = () => act('ok');
  const pv = side.querySelector('.prev').getContext('2d');
  const draw = () => {
    cells.forEach((c, i) => { c.classList.toggle('sel', i === cur); c.classList.toggle('picked', picks.indexOf(i) >= 0); });
    const s = slots[picks.length];
    head.innerHTML = s ? `<b>${s.who}</b> — choisissez ${fmt > 1 ? 'combattant ' + ((picks.filter((_, k) => slots[k].t === s.t).length) + 1) + '/' + fmt : 'votre combattant'}` : '';
    const c = ROSTER[cur], a = ARCH[c.arch], m2 = MOVE2[a.m2];
    side.querySelector('.nm').textContent = c.name.toUpperCase(); side.querySelector('.ti').textContent = c.title;
    const bar = (l, v) => `<div class="b"><span>${l}</span><i><u style="width:${Math.min(100, v * 70)}%"></u></i></div>`;
    side.querySelector('.st').innerHTML = bar('Vitesse', c.spd) + bar('Puissance', c.pow) + bar('Défense', c.def);
    side.querySelector('.tc').innerHTML = `<div><em>${a.label}</em></div><div>⚡ ${a.spName}</div><div>✦ ${m2.name}</div><div>★ ${a.supName}</div>`;
  };
  const act = (k) => {
    const n = ROSTER.length;
    if (k === 'left') cur = (cur + n - 1) % n; else if (k === 'right') cur = (cur + 1) % n;
    else if (k === 'up') cur = (cur - COLS + n) % n; else if (k === 'down') cur = (cur + COLS) % n;
    else if (k === 'ok') { sfx.ok(); picks.push(cur); if (picks.length === slots.length) return finish(); return draw(); }
    else if (k === 'back') { sfx.back(); if (picks.length) { picks.pop(); return draw(); } return G.go('setup'); }
    sfx.ui(); draw();
  };
  const finish = () => {
    const p1 = picks.filter((_, k) => slots[k].t === 0), p2h = picks.filter((_, k) => slots[k].t === 1);
    G.run = { mode, fmt, vs: humanP2 ? 'p2' : 'cpu', diff: S.diff, need: m.series || m.solo ? 1 : S.need, timer: m.chrono ? S.timer : 0, p1, p2: p2h, wins: 0, fight: 0, carry: null, score: 0 };
    if (!m.series) return G.go('stage');
    G.nextOpponent();
  };
  G.ticker = () => { const c = ROSTER[cur], t = performance.now() / 16, f = { state: 'idle', t: 0, vx: 0, move: null, vy: 0 }; const { pose } = poseFor(f, t); drawFighter(pv, c, pose, { clock: t }); };
  G.handler = act; draw();
}
