// Quêtes du jour (barre de paliers + liste) et Succès (progression cumulée). Récompenses en pièces et germes, jamais payantes.
import { G, el } from './ctx.js';
import { quests } from '../quests.js';
import { tabWindow, rw, toast } from '../ui/win.js';
import { sfx } from '../audio.js';

const GO = { fight: 'modes', win: 'modes', story: 'story', chest: 'shop', up: 'heroes', super: 'modes', hero: 'shop' };
export default function sQuests(d) {
  const w = tabWindow({
    tab: d && d.tab || 0,
    tabs: [['q', 'QUÊTES DU JOUR', () => quests.pending().q], ['a', 'SUCCÈS', () => quests.pending().a]],
    draw(id, body) {
      const rows = (list, claim) => list.map((q) => `<div class="qs"><div class="qs-r">${rw(q)}</div><div class="qs-m"><h4>${q.t}</h4><div class="qs-b"><i style="width:${q.v / q.n * 100}%"></i><span>${q.v}/${q.n}</span></div></div>${q.got ? '<button class="go done">✔</button>' : q.done ? `<button class="go ok" data-id="${q.id}">RÉCUPÉRER</button>` : `<button class="go" data-id="${q.id}" data-go="${GO[q.id] || 'modes'}">GO</button>`}</div>`).join('');
      const bind = (claim) => body.querySelectorAll('.go[data-id]').forEach((b) => { b.onclick = () => { if (b.classList.contains('ok')) { if (claim(b.dataset.id)) { sfx.win(); w.refresh(); toast(w.box, 'Récompense récupérée !'); } } else { sfx.ok(); G.go(b.dataset.go); } }; });
      if (id === 'q') {
        const p = quests.points(), ms = quests.miles(), max = ms[ms.length - 1].at;
        body.innerHTML = `<div class="ms"><div class="ms-h"><b>QUÊTES DU JOUR</b><small>${p}/${max} terminées · remise à zéro chaque jour</small></div><div class="ms-t"><div class="ms-bar"><i style="width:${Math.min(100, p / max * 100)}%"></i></div>${ms.map((m) => `<button class="ms-m${m.ok && !m.got ? ' now' : ''}${m.got ? ' got' : ''}" data-i="${m.i}" style="left:${m.at / max * 100}%"><span>${m.g ? `${m.g}<i class="ic gem"></i>` : `${m.c}<i class="ic gold"></i>`}</span>${m.got ? '<u>✔</u>' : ''}</button>`).join('')}</div></div><div class="qs-list tall">${rows(quests.daily())}</div>`;
        body.querySelectorAll('.ms-m.now').forEach((b) => { b.onclick = () => { if (quests.claimMile(+b.dataset.i)) { sfx.win(); w.refresh(); toast(w.box, 'Palier récupéré !'); } }; });
        bind((i) => quests.claim(i));
      } else {
        body.innerHTML = `<div class="qs-list tall">${rows(quests.achs())}</div>`; bind((i) => quests.claimAch(i));
      }
    },
  });
}
