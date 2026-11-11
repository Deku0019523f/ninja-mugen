// Tests de l'Éveil (△ maintenu, chakra plein, vie < 35 %) et de l'ultime d'équipe (R1 + L1)
import { World } from '../js/game/world.js';
import { Fighter } from '../js/game/fighter.js';
import { ROSTER } from '../js/data/roster.js';
import { attachSupports, callSupports, tickSupports, SupportAI, supReady, TEAM_COST } from '../js/game/support.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } };
const N = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0, sup1: 0, sup2: 0, charge: 0 };
function setup(withSup = false) {
  const w = new World(5), a = w.add(new Fighter(ROSTER[0], 0)), b = w.add(new Fighter(ROSTER[11], 1));
  a.prepare(-150, 1); b.prepare(150, -1);
  let sa = [], ais = new Map();
  if (withSup) { sa = attachSupports(w, a, [ROSTER[3], ROSTER[5]]); a.supCd = [0, 0]; sa.forEach((s) => ais.set(s.slot, new SupportAI())); }
  return { w, a, b, sa, ais };
}
function run(env, frames, script) {
  const { w, ais } = env;
  for (let f = 0; f < frames; f++) {
    const inp = w.fighters.map(() => ({ ...N }));
    script && script(f, inp);
    for (const x of w.fighters) if (x.support && ais.has(x.slot)) Object.assign(inp[x.slot], ais.get(x.slot).think(w, x));
    callSupports(w, inp);
    if (w.update(inp)) tickSupports(w);
    w.events.length = 0;
  }
}

// 1) Éveil : refusé en pleine forme, accordé sous 35 % de vie avec le chakra plein, une seule fois par manche
{
  const e = setup();
  run(e, 260, (f, i) => { i[0].charge = 1; });
  ok(!e.a.buff && e.a.chi >= 99, 'Éveil : ne doit pas se déclencher en pleine forme');
  e.a.hp = e.a.maxHp * 0.3;
  run(e, 20, (f, i) => { i[0].charge = 1; });
  ok(e.a.buff === 'awaken' && e.a.awakened, 'Éveil : doit se déclencher (vie < 35 %, chakra plein)');
  ok(e.a.dmgMul > 1.4 && e.a.chi < 5, 'Éveil : bonus de dégâts, chakra consommé');
  const hp0 = e.a.hp; run(e, 60);
  ok(e.a.hp > hp0, 'Éveil : soin continu');
  e.a.endBuff(); e.a.chi = 100; e.a.hp = e.a.maxHp * 0.2;
  run(e, 20, (f, i) => { i[0].charge = 1; });
  ok(!e.a.buff, 'Éveil : une seule fois par manche');
  e.a.prepare(-150, 1); ok(!e.a.awakened, 'Éveil : réarmé à la manche suivante');
  console.log('Éveil'.padEnd(34), 'OK');
}
// 2) Ultime d'équipe : R1 + L1, coût en chakra, deux soutiens, frappe commune qui lance l'adversaire
{
  const e = setup(true), { a, b, sa } = e;
  a.chi = 100; let hitHp = b.hp, launched = false, both = false;
  for (let f = 0; f < 140; f++) {
    const inp = e.w.fighters.map(() => ({ ...N }));
    if (f === 3) { inp[0].sup1 = 1; inp[0].sup2 = 1; }
    for (const x of e.w.fighters) if (x.support) Object.assign(inp[x.slot], e.ais.get(x.slot).think(e.w, x));
    callSupports(e.w, inp); if (e.w.update(inp)) tickSupports(e.w);
    if (sa.every((s) => !s.out)) both = true;
    if (b.state === 'launch') launched = true; e.w.events.length = 0;
  }
  ok(both, 'Équipe : les deux soutiens doivent apparaître ensemble');
  ok(a.chi <= 100 - TEAM_COST + 5, 'Équipe : doit coûter du chakra');
  ok(b.hp < hitHp - 150 && launched, 'Équipe : forts dégâts et adversaire lancé (' + Math.round(hitHp - b.hp) + ')');
  ok(sa.every((s) => s.out), 'Équipe : les soutiens repartent');
  console.log('Ultime equipe'.padEnd(34), 'dégâts', Math.round(hitHp - b.hp));
  // sans assez de chakra : pas d'ultime d'équipe (un simple appel de soutien)
  const e2 = setup(true); e2.a.chi = 10;
  run(e2, 6, (f, i) => { if (f === 2) { i[0].sup1 = 1; i[0].sup2 = 1; } });
  ok(e2.sa.every((s) => s.supMode !== 'team'), 'Équipe : refusée sans chakra');
}
console.log(fails ? `${fails} échec(s)` : 'Tous les tests passent.');
process.exit(fails ? 1 : 0);
