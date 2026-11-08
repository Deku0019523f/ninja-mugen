// Tests du chakra : charge, Shuriken, Chakra Shuriken, Chakra Dash
import { World } from '../js/game/world.js';
import { Fighter } from '../js/game/fighter.js';
import { ROSTER } from '../js/data/roster.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } };
const N = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0, sq: 0, cdash: 0, cshuriken: 0, charge: 0 };
const duo = (xa, xb) => {
  const w = new World(7), a = w.add(new Fighter(ROSTER[0], 0)), b = w.add(new Fighter(ROSTER[11], 1));
  a.prepare(xa, 1); b.prepare(xb, -1);
  return { w, a, b };
};
const play = (w, frames, script, onFrame) => {
  for (let f = 0; f < frames; f++) {
    const inp = [{ ...N }, { ...N }];
    script(f, inp);
    w.update(inp);
    if (onFrame) onFrame(f);
    w.events.length = 0;
  }
};

// 1) charge : le chakra monte et le combattant est en état charge
{
  const { w, a } = duo(-200, 200); a.chi = 0;
  play(w, 60, (f, i) => { i[0].charge = 1; });
  console.log('Charge du chakra'.padEnd(34), 'chakra', a.chi.toFixed(1), ', état', a.state);
  ok(a.chi > 25, 'charge : le chakra doit monter (' + a.chi.toFixed(1) + ')');
  ok(a.state === 'charge', 'charge : état charge attendu (' + a.state + ')');
}
// 2) Shuriken (□) : un projectile gratuit
{
  const { w, a } = duo(-300, 300); a.chi = 0; let n = 0;
  play(w, 40, (f, i) => { if (f === 2) i[0].sq = 1; }, () => { n = Math.max(n, w.projs.filter((p) => p.owner === a && p.type === 'needle').length); });
  console.log('Shuriken'.padEnd(34), n, 'projectile(s), chakra', a.chi.toFixed(2));
  ok(n === 1, 'shuriken : 1 projectile attendu (' + n + ')');
  ok(a.chi < 5, 'shuriken : doit être gratuit (' + a.chi.toFixed(2) + ')');
}
// 3) Chakra Shuriken : 3 projectiles pour 20 chakra
{
  const { w, a } = duo(-300, 300); a.chi = 60; let n = 0;
  play(w, 40, (f, i) => { if (f === 2) i[0].cshuriken = 1; }, () => { n = Math.max(n, w.projs.filter((p) => p.owner === a).length); });
  console.log('Chakra Shuriken'.padEnd(34), n, 'projectile(s), chakra', a.chi.toFixed(1));
  ok(n === 3, 'chakra shuriken : 3 projectiles attendus (' + n + ')');
  ok(a.chi < 45, 'chakra shuriken : doit coûter 20 chakra (' + a.chi.toFixed(1) + ')');
}
// 4) Chakra Dash : fonce, touche, puis ○ enchaîne un Poing
{
  const { w, a, b } = duo(-150, -60); a.chi = 60; let sawPunch = false;
  play(w, 40, (f, i) => { if (f === 2) i[0].cdash = 1; if (f === 12) i[0].punch = 1; }, () => { if (a.move && a.move.id === 'punch1') sawPunch = true; });
  console.log('Chakra Dash'.padEnd(34), 'PV adversaire', Math.round(b.hp), '/', b.maxHp, ', chakra', a.chi.toFixed(1), ', enchaîne ○ :', sawPunch);
  ok(b.hp < b.maxHp, 'chakra dash : doit toucher l\u0027adversaire');
  ok(a.chi < 55, 'chakra dash : doit coûter 20 chakra (' + a.chi.toFixed(1) + ')');
  ok(sawPunch, 'chakra dash : ○ après le coup doit enchaîner un Poing');
}
// 5) pas assez de chakra : rien ne part
{
  const { w, a } = duo(-300, 300); a.chi = 5; let n = 0;
  play(w, 30, (f, i) => { if (f === 2) i[0].cshuriken = 1; }, () => { n = Math.max(n, w.projs.length); });
  ok(n === 0, 'chakra insuffisant : aucun projectile attendu (' + n + ')');
}

console.log(fails ? '\n' + fails + ' échec(s) (chakra)' : '\nChakra : tous les tests passent');
process.exit(fails ? 1 : 0);
