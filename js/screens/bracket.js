// Arbre du tournoi à 16 : deux moitiés (gauche / droite) qui convergent vers le médaillon CHAMPION au centre.
import { G, el } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { drawPortrait } from '../render/sprites.js';
import { backBtn, pills } from '../ui/kit.js';
import tour from '../modes/tournament.js';
import { sfx } from '../audio.js';

const SZ = [36, 40, 44, 48];   // taille des cases par tour (16 → 2)
export default function sBracket() {
  const run = G.run, me = run.p1[0], r = run.fight, br = run.br, root = el('div', 'bkt'), top = el('div', 'kit-top');
  top.append(backBtn(() => { sfx.back(); G.go('title'); }), el('h2', '', 'TOURNOI'), pills());
  const grid = el('div', 'br-grid'); root.append(top, el('div', 'br-rib', `<b>ROUND : ${tour.label[r]}</b>`), grid);
  G.screenEl.appendChild(root);
  const W = grid.clientWidth || 940, H = grid.clientHeight || 330, cols = 9, cx = (c) => (W / cols) * (c + 0.5);
  // colonne c (0..8) → [tour, moitié]; position verticale = moyenne des enfants
  const colInfo = (c) => (c < 4 ? { rd: c, half: 0 } : c === 4 ? { rd: 4, half: 0 } : { rd: 8 - c, half: 1 });
  const yOf = {}; const key = (rd, k) => rd + ':' + k;
  for (let k = 0; k < 8; k++) { yOf[key(0, k)] = H * (k + 0.5) / 8; yOf[key(0, 8 + k)] = H * (k + 0.5) / 8; }
  for (let rd = 1; rd <= 3; rd++) for (let k = 0; k < 16 >> rd; k++) yOf[key(rd, k)] = (yOf[key(rd - 1, 2 * k)] + yOf[key(rd - 1, 2 * k + 1)]) / 2;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'br-lines'); grid.appendChild(svg);
  const cell = (id, rd, x, y, extra = '') => {
    const sz = rd === 4 ? 64 : SZ[rd], c = el('div', 'br-c' + (id === me ? ' me' : '') + (id == null ? ' q' : '') + extra);
    c.style.cssText = `left:${x - sz / 2}px;top:${y - sz / 2}px;width:${sz}px;height:${sz}px`;
    if (id != null) { const cv = el('canvas'); cv.width = cv.height = 48; drawPortrait(cv.getContext('2d'), ROSTER[id], 48); c.appendChild(cv); } else c.innerHTML = '<i>?</i>';
    grid.appendChild(c); return c;
  };
  const line = (x1, y1, x2, y2, on) => { const xm = (x1 + x2) / 2, p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', `M${x1} ${y1}H${xm}V${y2}H${x2}`); p.setAttribute('class', on ? 'on' : ''); svg.appendChild(p); };
  for (let c = 0; c < cols; c++) {
    if (c === 4) continue;
    const { rd, half } = colInfo(c), n = 16 >> rd, per = n / 2, x = cx(c), edge = (SZ[rd] || 48) / 2 + 2;
    for (let j = 0; j < per; j++) {
      const k = half * per + j, id = br[rd] ? br[rd][k] : null, y = yOf[key(rd, k)];
      const lost = id != null && br[rd + 1] && br[rd + 1].length && !br[rd + 1].includes(id);
      const now = rd === r && id != null && br[rd].indexOf(me) >> 1 === k >> 1;
      cell(id, rd, x, y, (lost ? ' lost' : '') + (now ? ' now' : ''));
      // trait vers le parent (colonne plus proche du centre ; la demi-finale rejoint le médaillon)
      const px = half === 0 ? cx(c + 1) : cx(c - 1), pk = k >> 1, py = rd < 3 ? yOf[key(rd + 1, pk)] : H * 0.42;
      const s = half === 0 ? 1 : -1, pe = rd < 3 ? ((SZ[rd + 1] || 48) / 2 + 2) : 34;
      const won = id != null && br[rd + 1] && br[rd + 1].includes(id);
      line(x + s * edge, y, px - s * pe, py, won);
    }
  }
  const champ = br[4] && br[4][0] != null ? br[4][0] : null;
  cell(champ, 4, cx(4), H * 0.42, ' champ');
  grid.appendChild(el('div', 'br-champ', 'CHAMPION'));
  const mk = grid.querySelector('.br-c.me.now'); if (mk) { const a = el('div', 'br-arrow', '»'); a.style.left = (parseFloat(mk.style.left) - 20) + 'px'; a.style.top = (parseFloat(mk.style.top) + 4) + 'px'; grid.appendChild(a); }
  const go = el('button', 'next br-go', 'COMBATTRE'); go.onclick = () => { sfx.ok(); G.go('vs'); }; root.appendChild(go);
  G.handler = (k) => { if (k === 'ok') { sfx.ok(); G.go('vs'); } else if (k === 'back') { sfx.back(); G.go('title'); } };
}
