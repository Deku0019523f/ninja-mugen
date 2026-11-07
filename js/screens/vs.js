import { G, el, DIFF } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { drawPortrait } from '../render/sprites.js';
import { sfx } from '../audio.js';

export default function sVs() {
  const run = G.run, wrap = el('div', 'vs');
  const side = (ids, cls) => `<div class="vs-side ${cls}">${ids.map((id) => `<div class="vs-c"><canvas width="64" height="64" data-id="${id}"></canvas><b>${ROSTER[id].name.toUpperCase()}</b><i>${ROSTER[id].title}</i></div>`).join('')}</div>`;
  wrap.innerHTML = `<div class="vs-title">${run.title}</div><div class="vs-row">${side(run.p1, 'l')}<div class="vs-x">VS</div>${side(run.p2, 'r')}</div><div class="vs-diff">Niveau de l'adversaire : ${DIFF[run.curDiff - 1]}</div><div class="foot">Entrée ou toucher l'écran pour combattre</div>`;
  G.screenEl.appendChild(wrap);
  wrap.querySelectorAll('canvas').forEach((c) => { c.width = c.height = 96; drawPortrait(c.getContext('2d'), ROSTER[+c.dataset.id], 96); });
  const t0 = performance.now();
  G.handler = (k) => { if (k === 'ok' || k === 'back') { sfx.ok(); G.launch(); } };
  G.ticker = () => { if (performance.now() - t0 > 3200) { G.ticker = null; G.launch(); } };
  wrap.onclick = () => G.handler('ok');
}
