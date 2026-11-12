// Récompense quotidienne : fenêtre parchemin, 7 jours de série.
import { G, el } from './ctx.js';
import { prog, DAILY } from '../progress.js';
import { GIFT } from '../ui/kit.js';
import { sfx } from '../audio.js';

export default function sDaily() {
  const root = el('div', 'dq modal');
  root.innerHTML = `<div class="mbox wide"><div class="mhead"><b>RÉCOMPENSE QUOTIDIENNE</b><button class="mx">✕</button></div><div class="mbody parch"><div class="dq-row"></div><button class="dq-go"></button><p class="dq-note"></p></div></div>`;
  G.screenEl.appendChild(root);
  const row = root.querySelector('.dq-row'), btn = root.querySelector('.dq-go'), note = root.querySelector('.dq-note');
  function draw() {
    const d = prog.daily();
    row.innerHTML = DAILY.map((r, i) => `<div class="dq-d${i < d.day ? ' done' : ''}${i === d.day && d.can ? ' now' : ''}${i === 6 ? ' big' : ''}"><small>JOUR ${i + 1}</small><span>${GIFT}</span><b>${r.c}<i class="ic gold"></i></b>${r.g ? `<b class="g">${r.g}<i class="ic gem"></i></b>` : ''}${i < d.day ? '<u>✔</u>' : ''}</div>`).join('');
    btn.textContent = d.can ? 'RÉCUPÉRER' : 'REVENEZ DEMAIN'; btn.classList.toggle('dis', !d.can);
    note.textContent = d.can ? 'Connectez-vous chaque jour : la série repart de zéro si vous manquez un jour.' : `Vous avez ${prog.coins} pièces et ${prog.gems} gemmes.`;
  }
  const back = () => { sfx.back(); G.go('title'); };
  const claim = () => { if (prog.claim()) { sfx.win(); draw(); } else sfx.back(); };
  btn.onclick = claim; root.querySelector('.mx').onclick = back; root.onclick = (e) => { if (e.target === root) back(); };
  G.handler = (k) => { if (k === 'back') back(); else if (k === 'ok') claim(); };
  draw();
}
