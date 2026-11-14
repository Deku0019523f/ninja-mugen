// Sélection du mode : liste à gauche, parchemin à droite (description, récompenses, SUIVANT).
import { G, el } from './ctx.js';
import { backBtn, pills } from '../ui/kit.js';
import { ICON } from '../ui/icons.js';
import { sfx } from '../audio.js';

const play = (mode) => () => { G.mode = mode; G.go('select'); };
export const MODE_LIST = [
  { id: 'story', label: 'HISTOIRE', icon: 'bolt', desc: '10 combats avec 2 boss, sur 2 difficultés. Remplissez les objectifs bonus pour gagner des étoiles.', rew: [['gold', '40', 'par étoile'], ['gem', '2', '3 étoiles'], ['gold', '60', 'par victoire']], go: () => { G.mode = 'story'; G.go('story'); } },
  { id: 'tournament', label: 'TOURNOI', icon: 'shield', desc: 'Seize combattants, un arbre à élimination directe : huitièmes, quarts, demi-finales, finale. Une défaite et c\'est fini.', rew: [['gold', '60', 'par victoire'], ['gold', '150', 'la coupe'], ['gem', '3', 'la coupe']], go: play('tournament') },
  { id: 'training', label: 'ENTRAÎNEMENT', icon: 'fist', desc: 'Un mannequin et du chakra infini pour apprendre les combos, les ninjutsus et les ultimes.', rew: [], go: play('training') },
];

export default function sModes() {
  const root = el('div', 'md'), top = el('div', 'kit-top');
  const cur = pills(() => G.go('daily'));
  top.append(backBtn(() => { sfx.back(); G.go('title'); }), el('h2', '', 'SÉLECTION DU MODE'), cur); root.appendChild(top);
  const list = el('div', 'md-list'), card = el('div', 'md-card'); root.append(list, card); G.screenEl.appendChild(root);
  let sel = Math.max(0, MODE_LIST.findIndex((m) => m.id === G.mode));
  const rows = MODE_LIST.map((m, i) => { const r = el('button', 'md-b', `<span class="ic">${ICON[m.icon]}</span><b>${m.label}</b>`); r.onclick = () => { sel = i; sfx.ui(); draw(); }; list.appendChild(r); return r; });
  function draw() {
    rows.forEach((r, i) => r.classList.toggle('sel', i === sel));
    const m = MODE_LIST[sel];
    card.innerHTML = `<i class="beam"></i><i class="flag l"></i><i class="flag r"></i><div class="rib"><b>${m.label}</b></div><div class="md-in"><p>${m.desc}</p></div><div class="rewbar"><h4>RÉCOMPENSES</h4><div class="tiles">${m.rew.length ? m.rew.map(([k, n, t]) => `<div class="rtl"><span><i class="ic ${k}"></i><em>×${n}</em></span><small>${t}</small></div>`).join('') : '<div class="none">Aucune récompense</div>'}</div></div><button class="next">SUIVANT</button>`;
    card.querySelector('.next').onclick = go;
  }
  const go = () => { sfx.ok(); MODE_LIST[sel].go(); };
  G.handler = (k) => {
    const n = MODE_LIST.length;
    if (k === 'up') sel = (sel + n - 1) % n; else if (k === 'down') sel = (sel + 1) % n;
    else if (k === 'ok') return go(); else if (k === 'back') { sfx.back(); return G.go('title'); } else return;
    sfx.ui(); draw();
  };
  draw();
}
