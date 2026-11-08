// Couverture de l'IA : sur de nombreux combats IA contre IA, elle doit utiliser TOUTES les capacités du joueur
import { World } from '../js/game/world.js';
import { Fighter } from '../js/game/fighter.js';
import { AI } from '../js/game/ai.js';
import { ROSTER } from '../js/data/roster.js';

const PERS = ['balanced', 'rush', 'zoner', 'turtle'];
const seen = {};
const mark = (k) => { seen[k] = (seen[k] || 0) + 1; };
const MATCHES = 8, FRAMES = 6000;

for (let m = 0; m < MATCHES; m++) {
  const w = new World(100 + m), a = w.add(new Fighter(ROSTER[(m * 7) % ROSTER.length], 0)), b = w.add(new Fighter(ROSTER[(m * 11 + 5) % ROSTER.length], 1));
  a.prepare(-150, 1); b.prepare(150, -1);
  const ai = [new AI(5, PERS[m % 4]), new AI(4, PERS[(m + 1) % 4])];
  const prev = [null, null];
  for (let f = 0; f < FRAMES; f++) {
    w.update(w.fighters.map((x, i) => ai[i].think(w, x)));
    w.fighters.forEach((x, i) => {
      if (x.state === 'charge') mark('charge');
      if (x.state === 'roll') mark('roll');
      if (x.airJumps > 0) mark('doublejump');
      if (x.state === 'atk' && x.move && x.move !== prev[i]) { mark('move:' + x.move.id); if (x.move.super) mark('super'); }
      prev[i] = x.state === 'atk' ? x.move : null;
    });
    for (const e of w.events) { if (e.t === 'sub') mark('sub'); if (e.t === 'clash' && e.parry) mark('parry'); if (e.t === 'break') mark('break'); }
    w.events.length = 0;
    if ((a.hp <= 0 && a.dead) || (b.hp <= 0 && b.dead)) { a.prepare(-150, 1); b.prepare(150, -1); }
  }
}

const has = (...keys) => keys.some((k) => seen[k] > 0);
const REQUIRED = [
  ['charge du chakra', ['charge']],
  ['Shuriken', ['move:shuriken']],
  ['Chakra Shuriken', ['move:cshuriken']],
  ['Chakra Dash', ['move:cdash']],
  ['Ninjutsu (Spécial)', ['move:special', 'move:special_up', 'move:special_down']],
  ['Technique ultime', ['super']],
  ['projection', ['move:throw']],
  ['chaîne normale', ['move:punch1']],
  ['chaîne haute (uppercut)', ['move:upper']],
  ['chaîne basse', ['move:cjab']],
  ['chaîne latérale', ['move:palm']],
  ['enchaînement de combo', ['move:punch2', 'move:shin', 'move:palm2', 'move:trip', 'move:rise', 'move:kick']],
  ['substitution', ['sub']],
  ['double saut', ['doublejump']],
  ['roulade', ['roll']],
];
let fails = 0;
for (const [label, keys] of REQUIRED) {
  const n = keys.reduce((s, k) => s + (seen[k] || 0), 0);
  console.log(label.padEnd(34), n);
  if (!has(...keys)) { fails++; console.error('ÉCHEC: l\u0027IA n\u0027utilise jamais : ' + label); }
}
console.log('parades parfaites'.padEnd(34), seen.parry || 0, '(information)');
console.log('gardes brisées'.padEnd(34), seen.break || 0, '(information)');

console.log(fails ? '\n' + fails + ' capacité(s) jamais utilisée(s) par l\u0027IA' : '\nIA : toutes les capacités sont utilisées');
process.exit(fails ? 1 : 0);
