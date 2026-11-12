// Mode TOURNOI : 16 combattants, huitièmes → quarts → demi → finale. L'arbre est affiché avant chaque combat.
import { STAGES } from '../stages/index.js';
import { ROSTER } from '../data/roster.js';
import { randomTeam } from './util.js';

const TITLES = ['HUITIÈME DE FINALE', 'QUART DE FINALE', 'DEMI-FINALE', 'FINALE'], LABEL = ['1-16', '1-8', '1-4', '1-2'];
export default {
  id: 'tournament', label: 'TOURNOI', desc: '16 combattants, un arbre à élimination directe : gagnez 4 combats pour devenir champion.', series: true, bracket: true, manches: false, chrono: false,
  diffDesc: 'Niveau de départ : +1 à chaque tour.',
  next(run) {
    const me = run.p1[0];
    if (!run.br) {
      const ids = [me, ...randomTeam(15, run.p1)]; for (let i = ids.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [ids[i], ids[j]] = [ids[j], ids[i]]; }
      run.br = [ids];
    }
    const r = run.fight, row = run.br[r], pos = row.indexOf(me), opp = row[pos ^ 1];
    run.p2 = run.fmt === 2 ? [opp, randomTeam(1, [...run.p1, ...row])[0]] : [opp];
    run.curDiff = Math.min(5, run.diff + Math.floor(r * 0.75)); run.stage = (r * 3 + pos) % STAGES.length; run.title = TITLES[r];
  },
  // après ma victoire : les autres matchs du tour se jouent « en coulisses »
  onWin(run) {
    const me = run.p1[0], row = run.br[run.fight - 1], nxt = [];
    for (let k = 0; k < row.length; k += 2) { const a = row[k], b = row[k + 1]; nxt.push(a === me || b === me ? me : (Math.random() < 0.5 ? a : b)); }
    run.br[run.fight] = nxt;
  },
  finished: (run) => run.fight >= 4,
  rounds: TITLES, label: LABEL,
  name: (id) => ROSTER[id].name,
};
