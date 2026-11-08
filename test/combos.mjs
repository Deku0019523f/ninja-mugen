// Tests des chaînes de combos directionnelles et de la poursuite aérienne
import { World } from '../js/game/world.js';
import { Fighter } from '../js/game/fighter.js';
import { ROSTER } from '../js/data/roster.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } };
const N = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, high: 0, low: 0, side: 0, special: 0, move2: 0, super: 0, sq: 0, cdash: 0, cshuriken: 0, charge: 0, sub: 0, throw: 0 };
// Kaito (brawler : finisseur latéral = Crochet repoussant) contre Daichi
const duo = () => {
  const w = new World(5), a = w.add(new Fighter(ROSTER[0], 0)), b = w.add(new Fighter(ROSTER[11], 1));
  a.prepare(-25, 1); b.prepare(25, -1);
  return { w, a, b };
};
// Les appuis sont mémorisés 8 frames (y compris pendant le hitstop) : on appuie assez tôt pour que l'annulation les trouve.
const run = (script, frames, a, b, w) => {
  const ids = new Set(); let hits = 0, maxY = 0, sawLaunch = false, sawDown = false;
  for (let f = 0; f < frames; f++) {
    const inp = [{ ...N }, { ...N }];
    script(f, inp);
    w.update(inp);
    if (a.move) ids.add(a.move.id);
    if (b.state === 'launch') sawLaunch = true;
    if (b.state === 'down') sawDown = true;
    maxY = Math.max(maxY, b.y);
    for (const e of w.events) if (e.t === 'hit') hits++;
    w.events.length = 0;
  }
  return { ids, hits, maxY, sawLaunch, sawDown };
};

// 1) chaîne haute : ↑+○ uppercut, ↑+○ Saut montée (aérien)
{
  const { w, a, b } = duo();
  const r = run((f, i) => { if (f === 2 || f === 8) i[0].high = 1; }, 70, a, b, w);
  console.log('Chaîne haute'.padEnd(34), [...r.ids].join(' > '), '|', r.hits, 'coup(s), hauteur max', Math.round(r.maxY));
  ok(r.ids.has('upper') && r.ids.has('rise'), 'chaîne haute : uppercut puis saut montée attendus (' + [...r.ids] + ')');
  ok(r.hits >= 2 && r.maxY > 30, 'chaîne haute : l\u0027adversaire doit être lancé et touché deux fois (coups ' + r.hits + ', hauteur ' + Math.round(r.maxY) + ')');
}
// 2) chaîne basse : jab bas, tibia, croc-en-jambe (fait tomber)
{
  const { w, a, b } = duo();
  const r = run((f, i) => { if (f === 2 || f === 6 || f === 12) i[0].low = 1; }, 90, a, b, w);
  console.log('Chaîne basse'.padEnd(34), [...r.ids].join(' > '), '|', r.hits, 'coup(s), chute', r.sawDown);
  ok(r.ids.has('cjab') && r.ids.has('shin') && r.ids.has('trip'), 'chaîne basse : jab bas, tibia, croc-en-jambe attendus (' + [...r.ids] + ')');
  ok(r.hits >= 3 && (r.sawLaunch || r.sawDown), 'chaîne basse : 3 coups et l\u0027adversaire doit tomber (coups ' + r.hits + ')');
}
// 3) chaîne latérale : paume, paume 2, finisseur du personnage (Crochet repoussant pour un brawler)
{
  const { w, a, b } = duo();
  const r = run((f, i) => { if (f === 2 || f === 9 || f === 16) i[0].side = 1; }, 100, a, b, w);
  console.log('Chaîne latérale'.padEnd(34), [...r.ids].join(' > '), '|', r.hits, 'coup(s)');
  ok(r.ids.has('palm') && r.ids.has('palm2') && r.ids.has('hook'), 'chaîne latérale : paume, paume 2, crochet attendus (' + [...r.ids] + ')');
  ok(r.hits >= 3, 'chaîne latérale : 3 coups attendus (' + r.hits + ')');
}
// 4) bifurcation : ○ ○ puis ↑+○ lance l'adversaire (uppercut)
{
  const { w, a, b } = duo();
  const r = run((f, i) => { if (f === 2 || f === 8) i[0].punch = 1; if (f === 14) i[0].high = 1; }, 90, a, b, w);
  console.log('Bifurcation ○ ○ ↑○'.padEnd(34), [...r.ids].join(' > '), '|', r.hits, 'coup(s)');
  ok(r.ids.has('punch1') && r.ids.has('upper'), 'bifurcation : Direct puis uppercut attendus (' + [...r.ids] + ')');
}
// 5) poursuite : uppercut puis Chakra Dash qui monte à la poursuite de l'adversaire lancé
{
  const { w, a, b } = duo(); a.chi = 60;
  const r = run((f, i) => { if (f === 2) i[0].high = 1; if (f === 8) i[0].cdash = 1; }, 70, a, b, w);
  console.log('Uppercut + Chakra Dash'.padEnd(34), [...r.ids].join(' > '), '|', r.hits, 'coup(s), chakra', a.chi.toFixed(1));
  ok(r.ids.has('upper') && r.ids.has('cdash'), 'poursuite : uppercut puis Chakra Dash attendus (' + [...r.ids] + ')');
  ok(r.hits >= 2, 'poursuite : le Chakra Dash doit toucher l\u0027adversaire lancé (coups ' + r.hits + ')');
}
// 6) combo aérien : en l'air, ○ ○ enchaînent Poing aérien puis Poing aérien 2
{
  const { w, a, b } = duo(); b.x = 120; a.x = 80;
  // a saute, puis frappe en l'air l'adversaire (placé à portée) deux fois de suite
  b.prepare(120, -1); a.prepare(75, 1);
  const r = run((f, i) => { if (f === 2) i[0].u = 1; if (f === 10 || f === 14 || f === 20) i[0].punch = 1; }, 60, a, b, w);
  console.log('Combo aérien ○ ○'.padEnd(34), [...r.ids].join(' > '), '|', r.hits, 'coup(s)');
  ok(r.ids.has('apunch'), 'combo aérien : Poing aérien attendu (' + [...r.ids] + ')');
}

console.log(fails ? '\n' + fails + ' échec(s) (combos)' : '\nCombos : tous les tests passent');
process.exit(fails ? 1 : 0);
