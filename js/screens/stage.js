// Choix du décor : vignettes 16:9 (vraies miniatures des décors), « Aléatoire » de même taille, bouton COMBATTRE !
import { G, el } from './ctx.js';
import { STAGES, buildStage } from '../stages/index.js';
import { ROSTER } from '../data/roster.js';
import { randomTeam } from '../modes/util.js';
import { ICON } from '../ui/icons.js';
import { pageHead } from '../ui/shell.js';
import { sfx } from '../audio.js';

// vignette d'un décor : ciel + montagnes + sol
function thumb(i) {
  const s = buildStage(i), cv = el('canvas'); cv.width = 240; cv.height = 135; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(s.sky, 0, 0, 240, 135); g.drawImage(s.far, -20, 40, 290, 70); g.drawImage(s.mid, -20, 62, 290, 56); g.drawImage(s.ground, 0, 108, 240, 27);
  return cv;
}

export default function sStage() {
  const COLS = 4; let idx = 0, tapNew = false;
  const wrap = el('div', 'stagewrap'), list = el('div', 'stages'), foot = el('div', 'stg-foot');
  const head = pageHead({ title: 'CHOISIR L\'ARÈNE', onBack: () => act('back'), right: `${STAGES.length} DÉCORS` });
  const cards = [...STAGES.map((s, i) => { const d = el('div', 'stg cur'); d.append(thumb(i), el('span', 'stg-tag', 'SÉLECTIONNÉ'), el('b', '', s.name)); return d; }),
    (() => { const d = el('div', 'stg rand cur'); d.innerHTML = `<span class="dice">${ICON.dice}</span><b>ALÉATOIRE</b>`; return d; })()];
  const rem = cards.length % COLS; if (rem) cards[cards.length - rem].style.gridColumnStart = 1 + (COLS - rem);   // dernière ligne centrée
  const name = el('div', 'stg-name'), go = el('button', 'btn-main', `<span>${ICON.swords}COMBATTRE !</span>`);
  foot.append(name, go); wrap.append(head, list, foot); G.screenEl.appendChild(wrap);
  cards.forEach((d, i) => {
    list.appendChild(d);
    d.onmouseenter = () => { if (idx !== i) { idx = i; sfx.ui(); draw(); } };
    d.onpointerdown = (e) => { tapNew = e.pointerType === 'touch' && idx !== i; };
    d.onclick = () => { if (tapNew) { tapNew = false; idx = i; sfx.ui(); return draw(); } idx = i; act('ok'); };
  });
  go.onclick = () => act('ok');
  const draw = () => { cards.forEach((c, i) => c.classList.toggle('sel', i === idx)); name.innerHTML = `Arène : <b>${idx === STAGES.length ? 'Aléatoire' : STAGES[idx].name}</b>`; };
  const act = (k) => {
    const n = cards.length, run = G.run;
    if (k === 'left') idx = (idx + n - 1) % n; else if (k === 'right') idx = (idx + 1) % n; else if (k === 'up') idx = (idx + n - COLS) % n; else if (k === 'down') idx = (idx + COLS) % n;
    else if (k === 'ok') { sfx.ok(); run.stage = idx === STAGES.length ? Math.floor(Math.random() * STAGES.length) : idx; if (G.mode === 'training') run.p2 = [Math.floor(Math.random() * ROSTER.length)]; else if (!run.p2.length) run.p2 = randomTeam(run.fmt, run.p1); return G.launch(); }
    else if (k === 'back') { sfx.back(); return G.go('select'); }
    else return;
    sfx.ui(); draw();
  };
  G.handler = act; draw();
}
