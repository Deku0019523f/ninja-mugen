// Sélection du mode : liste à gauche, parchemin à droite (description, récompenses, SUIVANT).
import { G, el } from './ctx.js';
import { backBtn, pills } from '../ui/kit.js';
import { ICON } from '../ui/icons.js';
import { sfx } from '../audio.js';

const play = (mode) => () => { G.mode = mode; G.go('select'); };
export const MODE_LIST = [
  { id: 'single', label: 'DUEL', icon: 'swords', desc: 'Un match libre contre l\'ordinateur ou contre un ami sur le même écran. Réglez le format, la difficulté et le décor.', rew: ['+60 pièces par victoire', '+1 gemme par victoire'], go: play('single') },
  { id: 'arcade', label: 'ARCADE', icon: 'star', desc: '8 combats d\'affilée contre l\'ordinateur, jusqu\'à l\'Ultime Maître. La difficulté monte à chaque combat.', rew: ['+60 pièces par victoire', '+150 pièces et +3 gemmes au combat final'], go: play('arcade') },
  { id: 'survival', label: 'SURVIE', icon: 'shield', desc: 'Enchaînez les adversaires sans fin. Votre vie ne se régénère que peu entre deux combats : jusqu\'où irez-vous ?', rew: ['+60 pièces par victoire', '+1 gemme par victoire'], go: play('survival') },
  { id: 'training', label: 'ENTRAÎNEMENT', icon: 'fist', desc: 'Un mannequin et du chakra infini pour apprendre les combos, les ninjutsus et les ultimes.', rew: ['Aucune récompense'], go: play('training') },
  { id: 'online', label: 'MULTIJOUEUR', icon: 'net', desc: 'Affrontez un ami en Wi-Fi, en Bluetooth ou sur internet avec un code de salle à 5 caractères.', rew: ['Aucune récompense'], go: () => { G.mode = 'online'; G.go('online'); } },
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
    card.innerHTML = `<div class="rib"><b>${m.label}</b></div><div class="md-in"><p>${m.desc}</p><h4>RÉCOMPENSES</h4><div class="rews">${m.rew.map((t) => `<div class="rw"><i class="ic ${/gemme/.test(t) ? 'gem' : /pièces/.test(t) ? 'gold' : 'none'}"></i><span>${t}</span></div>`).join('')}</div></div><button class="next">SUIVANT</button>`;
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
