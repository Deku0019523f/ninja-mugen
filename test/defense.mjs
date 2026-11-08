// Tests de la défense : projection R2+○, double saut, substitution, rupture de garde
import { World } from '../js/game/world.js';
import { Fighter } from '../js/game/fighter.js';
import { ROSTER } from '../js/data/roster.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } };
const N = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0, sq: 0, cdash: 0, cshuriken: 0, charge: 0, sub: 0, throw: 0 };
const duo = (xa, xb) => {
  const w = new World(9), a = w.add(new Fighter(ROSTER[0], 0)), b = w.add(new Fighter(ROSTER[11], 1));
  a.prepare(xa, 1); b.prepare(xb, -1);
  return { w, a, b };
};
// script(f, inp) remplit les entrées ; hook(f, events) est appelé après chaque frame
const play = (w, frames, script, hook) => {
  for (let f = 0; f < frames; f++) {
    const inp = [{ ...N }, { ...N }];
    script(f, inp);
    w.update(inp);
    if (hook) hook(f, w.events);
    w.events.length = 0;
  }
};

// 1) projection R2 + ○ : traverse la garde au contact
{
  const { w, b } = duo(-15, 25); let hits = 0;
  play(w, 70, (f, i) => { if (f === 2) i[0].throw = 1; i[1].d = 1; }, (f, ev) => { for (const e of ev) if (e.t === 'hit') hits++; });
  console.log('Projection R2+○'.padEnd(34), hits, 'coup(s), PV défenseur', Math.round(b.hp), '/', b.maxHp);
  ok(hits >= 1 && b.hp < b.maxHp - 20, 'projection : doit traverser la garde (PV ' + Math.round(b.hp) + ')');
}
// 2) projection à distance : simple Poing, sans erreur
{
  const { w, a } = duo(-200, 200); let saw = false;
  play(w, 30, (f, i) => { if (f === 2) i[0].throw = 1; }, () => { if (a.move && a.move.id === 'punch1') saw = true; });
  ok(saw, 'projection à distance : un Poing doit partir');
}
// 3) double saut : un 2e appui en l'air monte plus haut ; pas de 3e saut
const apex = (presses) => {
  const { w, a } = duo(-300, 300); let m = 0;
  play(w, 80, (f, i) => { if (presses.includes(f)) i[0].u = 1; }, () => { m = Math.max(m, a.y); });
  return m;
};
{
  const one = apex([2]), two = apex([2, 14]), three = apex([2, 14, 26]);
  console.log('Double saut'.padEnd(34), 'sommet', Math.round(one), '->', Math.round(two), '->', Math.round(three));
  ok(two > one + 30, 'double saut : doit monter plus haut (' + Math.round(one) + ' -> ' + Math.round(two) + ')');
  ok(Math.abs(three - two) < 5, 'double saut : pas de 3e saut (' + Math.round(two) + ' -> ' + Math.round(three) + ')');
}
// 4) substitution juste avant l'impact : le coup tombe sur la bûche
{
  const { w, a, b } = duo(-25, 25); let hits = 0, subs = 0;
  play(w, 40, (f, i) => { if (f === 2) i[1].punch = 1; if (f === 5) i[0].sub = 1; }, (f, ev) => { for (const e of ev) { if (e.t === 'hit') hits++; if (e.t === 'sub') subs++; } });
  console.log('Substitution (esquive)'.padEnd(34), 'PV', Math.round(a.hp), '/', a.maxHp, ', charges', a.subCharges, ', x', Math.round(a.x));
  ok(subs === 1 && hits === 0 && a.hp === a.maxHp, 'substitution : le coup doit être esquivé (coups ' + hits + ', substitutions ' + subs + ')');
  ok(a.subCharges === 2, 'substitution : doit coûter 1 charge (' + a.subCharges + ')');
  ok(a.x > b.x, 'substitution : doit réapparaître derrière l\u0027attaquant (x ' + Math.round(a.x) + ')');
}
// 5) substitution pour sortir d'un combo (après avoir été touché)
{
  const { w, a } = duo(-25, 25);
  play(w, 30, (f, i) => { if (f === 2) i[1].punch = 1; if (f === 10) i[0].sub = 1; });
  console.log('Substitution (sortie de combo)'.padEnd(34), 'PV', Math.round(a.hp), ', charges', a.subCharges, ', état', a.state);
  ok(a.hp < a.maxHp, 'sortie de combo : le premier coup doit toucher');
  ok(a.subCharges === 2 && a.state !== 'hit', 'sortie de combo : doit s\u0027échapper (charges ' + a.subCharges + ', état ' + a.state + ')');
}
// 6) sans charge : la substitution ne fait rien ; la réserve se recharge
{
  const { w, a } = duo(-25, 25);
  a.subCharges = 0;
  play(w, 40, (f, i) => { if (f === 2) i[1].punch = 1; if (f === 5) i[0].sub = 1; });
  ok(a.hp < a.maxHp, 'sans charge : le coup doit toucher');
  const d2 = duo(-300, 300); d2.a.subCharges = 0;
  play(d2.w, 320, () => {});
  console.log('Recharge de la substitution'.padEnd(34), 'charges après 320 frames :', d2.a.subCharges);
  ok(d2.a.subCharges >= 1, 'recharge : +1 charge toutes les 5 s (' + d2.a.subCharges + ')');
}
// 7) rupture de garde : trop de coups encaissés en garde
{
  const { w, a } = duo(-25, 25); let breaks = 0;
  play(w, 500, (f, i) => { i[0].d = 1; i[1].l = 1; if (f >= 2 && f % 18 === 2) i[1].punch = 1; }, (f, ev) => { for (const e of ev) if (e.t === 'break') breaks++; });
  console.log('Rupture de garde'.padEnd(34), breaks, 'rupture(s), jauge', Math.round(a.guard), ', PV', Math.round(a.hp), '/', a.maxHp);
  ok(breaks >= 1, 'rupture de garde : la garde doit finir par casser (' + breaks + ')');
}

console.log(fails ? '\n' + fails + ' échec(s) (défense)' : '\nDéfense : tous les tests passent');
process.exit(fails ? 1 : 0);
