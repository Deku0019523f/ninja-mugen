import { G, el } from './ctx.js';
import { KEYMAPS } from '../input.js';
import { sfx } from '../audio.js';

export default function sControls() {
  const name = (c) => ({ ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' }[c] || c.replace('Key', ''));
  const row = (l, i) => `<tr><td>${l}</td>${[0, 1].map((p) => `<td>${name(KEYMAPS[p][i])}</td>`).join('')}</tr>`;
  const w = el('div', 'panel ctrl');
  w.innerHTML = `<h2>COMMANDES</h2>
  <table><tr><th>Clavier</th><th>Joueur 1</th><th>Joueur 2</th></tr>
  ${row('Gauche', 'l')}${row('Droite', 'r')}${row('Haut (saut)', 'u')}${row('Bas (garde)', 'd')}${row('○ Attaque', 'o')}${row('✕ Saut (double saut)', 'x')}${row('□ Shuriken', 'sq')}${row('△ Chakra', 'tri')}${row('R2 Garde', 'r2')}${row('L2 Substitution', 'l2')}${row('R1 Soutien 1', 'sup1')}${row('L1 Soutien 2', 'sup2')}</table>
  <div class="tips">
    <h3>TACTILE (paysage)</h3><ul>
      <li>Gauche : <b>stick analogique</b> ou <b>croix</b> (bouton ✚ / 🕹 pour changer)</li>
      <li>Droite : <b>○</b> attaque · <b>✕</b> saut · <b>□</b> shuriken · <b>△</b> chakra — un doigt entre deux boutons appuie sur les deux (△+○…)</li>
      <li>Au-dessus : <b>L1 / R1</b> soutiens · <b>L2</b> substitution · <b>R2</b> garde</li></ul>
    <h3>COMBOS (○ répété ; la direction est lue à chaque ○)</h3><ul>
      <li><b>○ ○ ○</b> : chaîne normale (Direct, Crochet, Lancer)</li>
      <li><b>↑ + ○</b> : uppercut (lance dans les airs) → <b>↑ + ○</b> : Saut montée, vous bondissez à sa poursuite → <b>○ ○ ○</b> en l'air (Poing aérien, Poing aérien 2, Pied aérien)</li>
      <li><b>↓ + ○ ○ ○</b> : chaîne basse (Direct accroupi, Tibia, Croc-en-jambe qui fait tomber)</li>
      <li><b>← / → + ○ ○ ○</b> : chaîne latérale (Paume, Paume 2, puis le finisseur du personnage : Crochet repoussant ou Coup de pied)</li>
      <li>On peut bifurquer entre chaînes : par exemple ○ ○ puis ↑ + ○ pour lancer l'adversaire</li>
      <li><b>△ maintenu</b> : charger le chakra (immobile, vulnérable)</li>
      <li><b>△ + ○</b> : Ninjutsu (10 chakra ; ↑ / ↓ en plus = tir diagonal / bas) · <b>△ → △ → ○</b> : Technique ultime (50 chakra)</li>
      <li><b>△ + ✕</b> : Chakra Dash (20), fonce et suit un adversaire lancé en l'air ; enchaînez <b>○ ○ ○</b>. Utilisable aussi en l'air et pour prolonger un combo · <b>△ + □</b> : Chakra Shuriken (20, 3 shurikens)</li>
      <li><b>R2 + ○</b> au contact : projection (passe la garde, adversaire au sol ; la roulade ou la substitution l'esquivent)</li></ul>
    <h3>DÉFENSE</h3><ul>
      <li><b>R2</b> (ou ↓) : garde · reculer face à un coup : garde automatique · ↓ + gauche/droite : roulade</li>
      <li><b>Parade parfaite</b> : tapez R2 (ou ↓) juste avant l'impact : aucun dégât, +chakra, l'adversaire est déséquilibré. Maintenir ne suffit pas.</li>
      <li><b>Garde brisée</b> : chaque coup encaissé en garde remplit la jauge orange sous le chakra ; pleine, la garde casse et vous restez étourdi. Elle se vide hors garde.</li>
      <li><b>Substitution (L2)</b> : appuyez juste avant l'impact (ou pendant un combo) : une bûche prend le coup et vous réapparaissez derrière l'adversaire. 3 charges (pastilles marron), +1 toutes les 5 s.</li>
      <li><b>Double saut</b> : ✕ puis ✕ (ou ↑ puis ↑) en l'air</li>
      <li><b>Soutiens</b> : appel 3 s (invulnérables), rappel au bout de 12 s. Ils interrompent une attaque, tirent de loin ou enchaînent au corps à corps.</li>
      <li>P / Échap : pause · Manette : ✕ ○ □ △ comme sur PlayStation, R1 / L1 soutiens, R2 garde, L2 substitution</li></ul>
  </div><div class="foot">Échap / G ou toucher « Retour » : revenir</div>`;
  G.screenEl.appendChild(w); G.handler = (k) => { if (k === 'back' || k === 'ok') { sfx.back(); G.go('title'); } };
}
