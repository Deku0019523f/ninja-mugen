// Simulation sans navigateur : vérifie que le moteur tourne, que tous les archétypes fonctionnent
import { World } from '../js/game/world.js';
import { Fighter } from '../js/game/fighter.js';
import { AI } from '../js/game/ai.js';
import { ROSTER, ARCH } from '../js/data/roster.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } };

ok(ROSTER.length >= 50, 'au moins 50 personnages (' + ROSTER.length + ')');
for (const c of ROSTER) ok(ARCH[c.arch], 'archétype inconnu ' + c.arch);

const used = {};
function duel(a, b, lv1, lv2, frames = 5400, seed = 1) {
  const w = new World(seed);
  const fa = w.add(new Fighter(ROSTER[a], 0)), fb = w.add(new Fighter(ROSTER[b], 1));
  fa.prepare(-120, 1); fb.prepare(120, -1);
  const ai = [new AI(lv1), new AI(lv2)];
  let f = 0, supers = 0, hits = 0;
  for (; f < frames; f++) {
    const inp = w.fighters.map((x, i) => ai[i].think(w, x));
    w.update(inp);
    for (const e of w.events) { if (e.t === 'super') supers++; if (e.t === 'hit') hits++; }
    w.events.length = 0;
    if (fa.dead || fb.dead) break;
    for (const x of w.fighters) { ok(Number.isFinite(x.x) && Number.isFinite(x.y) && Number.isFinite(x.hp), 'NaN détecté'); }
  }
  return { f, winner: fa.hp > fb.hp ? 0 : 1, hp: [Math.round(fa.hp), Math.round(fb.hp)], supers, hits, ko: fa.dead || fb.dead };
}

// 1) tous les archétypes s'affrontent
const archs = Object.keys(ARCH);
const rep = {};
for (const a of archs) {
  const ia = ROSTER.findIndex((c) => c.arch === a);
  const ib = ROSTER.findIndex((c) => c.arch === archs[(archs.indexOf(a) + 5) % archs.length]);
  const r = duel(ia, ib, 4, 4, 7200, 7 + ia);
  rep[a] = r; used[a] = r.hits;
  ok(r.hits > 5, a + ' : trop peu de coups (' + r.hits + ')');
}
console.table(Object.fromEntries(Object.entries(rep).map(([k, v]) => [k, { frames: v.f, ko: v.ko, hp0: v.hp[0], hp1: v.hp[1], supers: v.supers, hits: v.hits }])));

// 2) 2 contre 2
{
  const w = new World(99);
  const fs = [0, 5, 10, 20].map((id, i) => w.add(new Fighter(ROSTER[id], i < 2 ? 0 : 1)));
  fs[0].prepare(-200, 1); fs[1].prepare(-120, 1); fs[2].prepare(120, -1); fs[3].prepare(200, -1);
  const ai = fs.map(() => new AI(3));
  let n = 0;
  for (; n < 12000; n++) { w.update(w.fighters.map((x, i) => ai[i].think(w, x))); w.events.length = 0; if (w.teamSettled(0) || w.teamSettled(1)) break; }
  console.log('2v2 terminé en', n, 'frames — HP équipes', Math.round(w.teamHp(0)), Math.round(w.teamHp(1)));
  ok(n < 12000, '2v2 ne se termine pas');
}

// 3) niveaux de difficulté : le niveau 5 doit battre le niveau 1 la plupart du temps
let win5 = 0; const N = 12;
for (let i = 0; i < N; i++) { const r = duel(0, 5, 5, 1, 7200, 100 + i); if (r.winner === 0) win5++; }
console.log(`IA niv.5 vs niv.1 : ${win5}/${N} victoires`);
ok(win5 >= N * 0.6, 'la difficulté 5 devrait dominer la 1');


// 4) combos multi-boutons : on rejoue des séquences au frame près
{
  const run = (script, label, minHits) => {
    const w = new World(5), a = w.add(new Fighter(ROSTER[0], 0)), b = w.add(new Fighter(ROSTER[11], 1));
    a.prepare(-30, 1); b.prepare(10, -1); a.chi = 60;
    let hits = 0, f = 0; const last = Math.max(...script.map((s) => s[0])) + 90;
    for (; f < last; f++) {
      const inp = w.fighters.map(() => ({ l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0 }));
      for (const [t, ...keys] of script) if (f === t) for (const k of keys) inp[0][k] = 1;
      w.update(inp); for (const e of w.events) if (e.t === 'hit') hits++; w.events.length = 0;
    }
    console.log(label.padEnd(34), hits, 'coups, combo max', a.chain || b.combo, 'dégâts', Math.round(b.maxHp - b.hp));
    ok(hits >= minHits, label + ' : ' + hits + ' coups au lieu de ' + minHits);
  };
  run([[2, 'punch'], [9, 'punch'], [16, 'punch']], 'Poing·Poing·Poing', 3);
  run([[2, 'punch'], [9, 'punch'], [17, 'kick']], 'Poing·Poing·Pied', 3);
  run([[2, 'punch'], [9, 'kick']], 'Poing·Pied', 2);
  run([[2, 'punch', 'kick']], 'Poing+Pied (frappe lourde)', 1);
  run([[2, 'punch'], [9, 'punch', 'kick']], 'Poing·(Poing+Pied)', 2);
  run([[2, 'punch'], [8, 'punch'], [20, 'special']], 'Poing·Poing·Spécial', 3);
  run([[2, 'punch'], [8, 'super']], 'Poing·SUPER (annulation)', 2);
}

// 5) roulade : bas + direction (↙ ↘), invulnérable au début, ne se relance pas en maintenant
{
  const w = new World(3), a = w.add(new Fighter(ROSTER[0], 0)), b = w.add(new Fighter(ROSTER[11], 1));
  a.prepare(-100, 1); b.prepare(300, -1);
  const N = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0 };
  const x0 = a.x; let rolled = 0, inv = false;
  for (let f = 0; f < 60; f++) {
    w.update([{ ...N, d: 1, r: 1 }, N]);
    if (a.state === 'roll') { rolled++; if (a.invuln > 0) inv = true; }
  }
  console.log('Roulade avant'.padEnd(34), rolled, 'frames, déplacement', Math.round(a.x - x0));
  ok(rolled >= 20 && rolled <= 26, 'roulade : durée ' + rolled);
  ok(inv, 'roulade : invulnérabilité');
  ok(a.x - x0 > 100, 'roulade : déplacement vers l\'avant');
  const y0 = a.x; rolled = 0;
  for (let f = 0; f < 40; f++) { w.update([{ ...N, d: 1, l: 1 }, N]); if (a.state === 'roll') rolled++; }
  ok(rolled > 0 && a.x < y0, 'roulade arrière');
}

console.log(fails ? `\n${fails} échec(s)` : '\nTous les tests passent');
process.exit(fails ? 1 : 0);
