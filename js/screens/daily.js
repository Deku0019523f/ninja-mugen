// Récompense quotidienne : 7 jours de série, une récompense par jour.
import { G, el } from './ctx.js';
import { pageHead } from '../ui/shell.js';
import { prog, DAILY } from '../progress.js';
import { sfx } from '../audio.js';

export default function sDaily() {
  const veil = document.getElementById('veil'); if (veil) veil.className = 'on blur';   // pas de barre d'onglets ici : on pose le voile nous-mêmes
  const wrap = el('div', 'daily'), coin = el('div', 'cur-chip');
  wrap.appendChild(pageHead({ title: 'RÉCOMPENSE QUOTIDIENNE', onBack: () => G.go('title'), right: coin }));
  const row = el('div', 'dl-row'), btn = el('button', 'btn dl-go'), note = el('div', 'dl-note');
  wrap.append(row, btn, note); G.screenEl.appendChild(wrap);
  function draw() {
    coin.innerHTML = `<b>●</b> ${prog.coins} <b class="g">◆</b> ${prog.gems}`;
    const d = prog.daily();
    row.innerHTML = DAILY.map((r, i) => `<div class="dl-d ${i < d.day ? 'done' : ''} ${i === d.day && d.can ? 'now' : ''}"><small>JOUR ${i + 1}</small><b>${r.c}<em>●</em></b>${r.g ? `<b class="g">${r.g}<em>◆</em></b>` : '<b class="g">&nbsp;</b>'}<i>${i < d.day ? '✔' : ''}</i></div>`).join('');
    btn.textContent = d.can ? 'RÉCUPÉRER' : 'REVENEZ DEMAIN'; btn.classList.toggle('dis', !d.can);
    note.textContent = d.can ? 'Connectez-vous chaque jour : la série repart de zéro si vous manquez un jour.' : 'Récompense du jour récupérée.';
  }
  const claim = () => { if (prog.claim()) { sfx.win(); draw(); } else sfx.back(); };
  btn.onclick = claim;
  G.handler = (k) => { if (k === 'back') { sfx.back(); G.go('title'); } else if (k === 'ok') claim(); };
  draw();
}
