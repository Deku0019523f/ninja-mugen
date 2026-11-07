import { G, el } from './ctx.js';
import { KEYMAPS } from '../input.js';
import { COMBO_LIST } from '../game/moves.js';
import { sfx } from '../audio.js';

export default function sControls() {
  const name = (c) => ({ ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' }[c] || c.replace('Key', ''));
  const row = (l, i) => `<tr><td>${l}</td>${[0, 1].map((p) => `<td>${name(KEYMAPS[p][i])}</td>`).join('')}</tr>`;
  const w = el('div', 'panel ctrl');
  w.innerHTML = `<h2>COMMANDES</h2>
  <table><tr><th>Clavier</th><th>Joueur 1</th><th>Joueur 2</th></tr>
  ${row('Gauche', 'l')}${row('Droite', 'r')}${row('Saut', 'u')}${row('Garde (accroupi)', 'd')}${row('Poing', 'punch')}${row('Pied', 'kick')}${row('Frappe lourde', 'smash')}${row('Spécial (10 chakra)', 'special')}${row('Technique (15)', 'move2')}${row('SUPER (50)', 'super')}</table>
  <div class="tips">
    <h3>TACTILE (paysage)</h3><ul>
      <li>Gauche : <b>stick analogique</b> ou <b>croix</b> (bouton ✚ / 🕹 pour changer)</li>
      <li>↗ ↖ : saut avant / arrière · ↘ ↙ : roulade avant / arrière · ▼ : garde</li>
      <li><b>□</b> Poing · <b>△</b> Pied · <b>○</b> Spécial · <b>✕</b> Technique</li>
      <li><b>□+△</b> Frappe lourde · <b>○+✕</b> SUPER (un doigt entre les deux boutons suffit)</li></ul>
    <h3>COMBOS</h3><ul>${COMBO_LIST.map((c) => `<li><b>${c.name}</b> : ${c.input}</li>`).join('')}
      <li>Après un coup qui touche : enchaînez <b>Spécial</b>, <b>Technique</b> ou <b>SUPER</b> (annulation)</li></ul>
    <h3>ASTUCES</h3><ul><li>Reculer face à un coup : garde automatique</li><li>Bas + gauche/droite : roulade esquive</li><li>Le chakra se recharge en frappant et en encaissant</li>
      <li><b>Parade parfaite</b> : tapez ↓ juste avant l'impact (quelques images) : aucun dégât, +chakra, l'adversaire est déséquilibré. Maintenir ↓ ne suffit pas.</li>
      <li><b>↑ + Spécial</b> : tir en diagonale (anti-aérien) · <b>↓ + Spécial</b> : tir bas rasant</li>
      <li>P / Échap : pause · Manette : X poing, A pied, B spécial, Y technique, R1 super</li></ul>
  </div><div class="foot">Échap / G ou toucher « Retour » : revenir</div>`;
  G.screenEl.appendChild(w); G.handler = (k) => { if (k === 'back' || k === 'ok') { sfx.back(); G.go('title'); } };
}
