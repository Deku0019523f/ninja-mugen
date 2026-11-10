// Chaque ultime de chaque personnage doit se lancer sans erreur et infliger des dégâts
import { World } from '../js/game/world.js';
import { Fighter } from '../js/game/fighter.js';
import { ROSTER } from '../js/data/roster.js';
import { ultOf } from '../js/supers/ult/index.js';
const N = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0, sup1: 0, sup2: 0 };
let fails = 0; const bad = [];
for (const ch of ROSTER) {
  try {
    const w = new World(7), a = w.add(new Fighter(ch, 0)), b = w.add(new Fighter(ROSTER[0], 1));
    a.prepare(-120, 1); b.prepare(120, -1); a.chi = 100;
    const hp0 = b.hp, ev = new Set(); let used = false;
    for (let f = 0; f < 420; f++) {
      const inp = [{ ...N }, { ...N }]; if (f === 5) inp[0].super = 1;
      w.update(inp); for (const e of w.events) ev.add(e.t); w.events.length = 0;
      if (a.state === 'atk' && a.move?.super) used = true;
    }
    const m = ultOf(ch);
    if (!m) bad.push(ch.name + ': pas d\'ult');
    else if (!used) bad.push(ch.name + ': ult non lancé (' + ch.ult.kind + ')');
    else if (b.hp >= hp0 && !['buff', 'blast'].includes(ch.ult.kind)) bad.push(ch.name + ': aucun dégât (' + ch.ult.kind + ')');
  } catch (e) { bad.push(ch.name + ': EXC ' + e.message); }
}
console.log(bad.length ? bad.join('\n') : 'Tous les ultimes OK (' + ROSTER.length + ')'); process.exit(bad.length ? 1 : 0);
