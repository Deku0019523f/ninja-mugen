import { G, el } from './ctx.js';
import { STAGES, buildStage } from '../stages/index.js';
import { ROSTER } from '../data/roster.js';
import { randomTeam } from '../modes/util.js';
import { sfx } from '../audio.js';

// vignette d'un décor : ciel + montagnes + sol
function thumb(i) {
  const s = buildStage(i), cv = el('canvas'); cv.width = 240; cv.height = 135; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(s.sky, 0, 0, 240, 135); g.drawImage(s.far, -20, 40, 290, 70); g.drawImage(s.mid, -20, 62, 290, 56); g.drawImage(s.ground, 0, 108, 240, 27);
  return cv;
}

export default function sStage() {
  let idx = 0; const wrap = el('div', 'stagewrap'); wrap.innerHTML = '<h2>CHOISIR LE DÉCOR</h2>';
  const list = el('div', 'stages'); wrap.appendChild(list); G.screenEl.appendChild(wrap);
  let tapNew = false;
  const cards = [...STAGES.map((s, i) => { const d = el('div', 'stg'); d.append(thumb(i), el('b', '', s.name)); return d; }), el('div', 'stg rand', '? ALÉATOIRE')];
  cards.forEach((d, i) => {
    d.onmouseenter = () => { idx = i; draw(); };
    d.onpointerdown = (e) => { tapNew = e.pointerType === 'touch' && idx !== i; };
    d.onclick = () => { if (tapNew) { tapNew = false; idx = i; return draw(); } idx = i; act('ok'); };
    list.appendChild(d);
  });
  const draw = () => cards.forEach((c, i) => c.classList.toggle('sel', i === idx));
  const act = (k) => {
    const n = cards.length, run = G.run;
    if (k === 'left') idx = (idx + n - 1) % n; else if (k === 'right') idx = (idx + 1) % n; else if (k === 'up') idx = (idx + n - 4) % n; else if (k === 'down') idx = (idx + 4) % n;
    else if (k === 'ok') { sfx.ok(); run.stage = idx === STAGES.length ? Math.floor(Math.random() * STAGES.length) : idx; if (G.mode === 'training') run.p2 = [Math.floor(Math.random() * ROSTER.length)]; else if (!run.p2.length) run.p2 = randomTeam(run.fmt, run.p1); return G.launch(); }
    else if (k === 'back') { sfx.back(); return G.go('select'); }
    sfx.ui(); draw();
  };
  G.handler = act; draw();
}
