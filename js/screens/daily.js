// Cadeau : onglet CADEAU QUOTIDIEN (série de 7 jours) et onglet RÉCOMPENSE EN LIGNE (temps de jeu du jour). Tout est gratuit, rien ne s'achète.
import { G, el } from './ctx.js';
import { prog, DAILY } from '../progress.js';
import { quests } from '../quests.js';
import { GIFT } from '../ui/kit.js';
import { tabWindow, rw, toast } from '../ui/win.js';
import { sfx } from '../audio.js';

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
export default function sDaily(d) {
  let timer = 0;
  const w = tabWindow({
    tab: d && d.tab || 0,
    tabs: [['d', 'CADEAU QUOTIDIEN', () => (prog.daily().can ? 1 : 0)], ['o', 'RÉCOMPENSE EN LIGNE', () => quests.pending().o]],
    draw(id, body) {
      clearInterval(timer);
      if (id === 'd') {
        const dl = prog.daily(), cell = (r, i) => `<div class="gd${i < dl.day ? ' done' : ''}${i === dl.day && dl.can ? ' now' : ''}"><small>Jour ${i + 1}</small><span class="gi">${r.g && !r.c ? '<i class="ic gem"></i>' : '<i class="ic gold"></i>'}</span><div class="gq">${rw(r)}</div>${i < dl.day ? '<u>✔</u>' : ''}</div>`;
        body.innerHTML = `<div class="gd-wrap"><div class="gd-grid">${DAILY.slice(0, 6).map(cell).join('')}</div><div class="gd-big">${cell(DAILY[6], 6)}<em class="gb">${GIFT}</em></div></div><button class="more gd-go${dl.can ? '' : ' dis'}">${dl.can ? 'RÉCUPÉRER' : 'REVENEZ DEMAIN'}</button><p class="dq-note">La série repart de zéro si vous manquez un jour.</p>`;
        body.querySelector('.gd-go').onclick = () => { const r = prog.claim(); if (r) { sfx.win(); w.refresh(); toast(w.box, 'Récompense récupérée !'); } else sfx.back(); };
        G.handler = (k) => { if (k === 'ok') body.querySelector('.gd-go').click(); else if (k === 'back') { sfx.back(); G.go('title'); } else if (k === 'left' || k === 'right') { w.tab = 1; sfx.ui(); w.refresh(); } };
      } else {
        const paint = () => {
          const o = quests.online();
          body.innerHTML = `<p class="ol-rst">Votre temps de jeu aujourd'hui : <u>${mmss(o.sec)}</u></p><div class="ol-row">${o.list.map((c, i) => `<div class="ol-c${c.ok ? ' now' : ''}${c.got ? ' got' : ''}"><em>${i + 1}</em><div class="ol-r">${rw(c)}</div>${c.got ? '<u>✔</u>' : c.ok ? '<button class="go ok" data-i="' + i + '">RÉCUPÉRER</button>' : `<span class="ol-t">${mmss(c.left)}</span>`}</div>${i < o.list.length - 1 ? '<i class="ol-a">›</i>' : ''}`).join('')}</div><p class="dq-note">Plus vous jouez aujourd'hui, plus les paliers s'ouvrent.</p>`;
          body.querySelectorAll('.go.ok').forEach((b) => { b.onclick = () => { if (quests.claimOnline(+b.dataset.i)) { sfx.win(); w.refresh(); toast(w.box, 'Récompense récupérée !'); } }; });
        };
        paint(); timer = setInterval(() => { if (!body.isConnected) return clearInterval(timer); const o = quests.online(); if (!body.querySelector('.go.ok') || true) { const c = body.querySelector('.ol-rst u'); if (c) c.textContent = mmss(o.sec); body.querySelectorAll('.ol-t').forEach((t, k) => { const cell = o.list.filter((x) => !x.ok)[k]; if (cell) t.textContent = mmss(cell.left); }); if (o.list.some((x, i) => x.ok && !x.got && !body.querySelector(`.go[data-i="${i}"]`) && !body.querySelectorAll('.ol-c')[i].classList.contains('got'))) paint(); } }, 1000);
        G.handler = (k) => { if (k === 'back') { sfx.back(); G.go('title'); } else if (k === 'left' || k === 'right') { w.tab = 0; sfx.ui(); w.refresh(); } };
      }
    },
  });
}
