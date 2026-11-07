// Mode SURVIE : enchaînez les adversaires, la vie ne se régénère que peu
import { STAGES } from '../stages/index.js';
import { randomTeam } from './util.js';

export default {
  id: 'survival', label: 'SURVIE', desc: 'Enchaînez les adversaires. Votre vie ne se régénère que peu.', series: true,
  diffDesc: 'Niveau de départ : +1 tous les 3 combats.',
  next(run) {
    const i = run.fight;
    run.p2 = randomTeam(run.fmt, run.p1); run.curDiff = Math.min(5, run.diff + Math.floor(i / 3)); run.stage = Math.floor(Math.random() * STAGES.length); run.title = `SÉRIE : ${i} VICTOIRE${i > 1 ? 'S' : ''}`;
  },
  onWin(run, res, m) { run.carry = res.carry.map((hp, i) => Math.min(m.world.fighters[i].maxHp, hp + m.world.fighters[i].maxHp * 0.3)); },
  finished: () => false,
};
