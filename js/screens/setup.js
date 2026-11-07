import { G, DIFF, save } from './ctx.js';
import { listMenu } from '../ui/menu.js';
import { MODES } from '../modes/index.js';
import { sfx } from '../audio.js';

export default function sSetup() {
  const S = G.S, m = MODES[G.mode], items = [];
  const cyc = (key, arr) => ({ left: () => { const i = arr.indexOf(S[key]); S[key] = arr[(i + arr.length - 1) % arr.length]; save(); }, right: () => { const i = arr.indexOf(S[key]); S[key] = arr[(i + 1) % arr.length]; save(); } });
  if (!m.solo) items.push({ label: 'Format', get: () => (S.fmt === 1 ? '1 contre 1' : '2 contre 2'), desc: 'En 2 contre 2, vous choisissez 2 combattants ; votre partenaire est piloté par l\'IA.', ...cyc('fmt', [1, 2]) });
  if (!m.solo) items.push({ label: 'Soutiens', get: () => (S.fmt === 2 ? 'Indisponibles en 2 contre 2' : S.sup === false ? 'Non' : 'Oui'), desc: 'Choisissez 2 soutiens en plus de votre combattant. R1 / L1 (E / Q au clavier) les appellent 3 secondes ; délai de rappel 12 s.', ...cyc('sup', [true, false]) });
  if (m.versus) items.push({ label: 'Adversaire', get: () => (S.vs === 'cpu' ? 'Ordinateur' : 'Joueur 2'), desc: 'Joueur 2 : flèches + J K L I O. Joueur 1 : ZQSD + F G H T Y.', ...cyc('vs', ['cpu', 'p2']) });
  if (!m.solo) items.push({ label: 'Difficulté', get: () => `${S.diff} — ${DIFF[S.diff - 1]}`, desc: m.diffDesc, ...cyc('diff', [1, 2, 3, 4, 5]) });
  if (m.manches) items.push({ label: 'Manches', get: () => `Au meilleur de ${S.need * 2 - 1}`, desc: 'Nombre de manches pour gagner un match.', ...cyc('need', [1, 2, 3]) });
  if (m.chrono) items.push({ label: 'Chrono', get: () => (S.timer ? S.timer + ' s' : '∞'), desc: 'Temps limité par manche, ou illimité (∞).', ...cyc('timer', [0, 60, 99]) });
  items.push({ label: '▶ CHOISIR LES COMBATTANTS', ok: () => { sfx.ok(); G.go('select'); } });
  listMenu(items, { title: m.label, onBack: () => G.go('title'), desc: m.desc });
}
