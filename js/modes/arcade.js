// Mode ARCADE : 8 combats, le dernier contre l'Ultime Maître
import { STAGES } from '../stages/index.js';
import { randomTeam } from './util.js';

export default {
  id: 'arcade', label: 'ARCADE', desc: '8 combats contre l\'ordinateur, jusqu\'à l\'Ultime Maître.', series: true, manches: true, chrono: true,
  diffDesc: 'Niveau de départ : la difficulté monte à chaque combat.',
  next(run) {
    const i = run.fight, boss = i === 7;
    run.p2 = boss ? (run.fmt === 2 ? [55, 54] : [55]) : randomTeam(run.fmt, run.p1);
    run.curDiff = Math.min(5, run.diff + Math.floor(i / 3) + (boss ? 1 : 0)); run.stage = i % STAGES.length; run.title = boss ? 'COMBAT FINAL' : `COMBAT ${i + 1} / 8`;
  },
  finished: (run) => run.fight >= 8,
};
