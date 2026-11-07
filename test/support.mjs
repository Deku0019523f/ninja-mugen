// Tests du système de soutiens (R1 / L1)
import { World } from '../js/game/world.js';
import { Fighter } from '../js/game/fighter.js';
import { AI } from '../js/game/ai.js';
import { ROSTER } from '../js/data/roster.js';
import { attachSupports, callSupports, tickSupports, SupportAI, SUP_STAY, supReady } from '../js/game/support.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } };
const N = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0, sup1: 0, sup2: 0 };

function setup(xa, xb) {
  const w = new World(21), a = w.add(new Fighter(ROSTER[0], 0)), b = w.add(new Fighter(ROSTER[11], 1));
  a.prepare(xa, 1); b.prepare(xb, -1);
  const sa = attachSupports(w, a, [ROSTER[3], ROSTER[5]]);
  a.supCd = [0, 0];
  const ais = new Map(); sa.forEach((s) => ais.set(s.slot, new SupportAI()));
  return { w, a, b, sa, ais };
}
// boucle fidèle à Match.step : entrées des soutiens, appels, mise à jour, chronomètres
function run(env, frames, script, onEvent) {
  const { w, ais } = env;
  for (let f = 0; f < frames; f++) {
    const inp = w.fighters.map(() => ({ ...N }));
    script(f, inp);
    for (const x of w.fighters) if (x.support && ais.has(x.slot)) Object.assign(inp[x.slot], ais.get(x.slot).think(w, x));
    callSupports(w, inp);
    const ran = w.update(inp);
    if (ran) tickSupports(w);
    if (onEvent) for (const e of w.events) onEvent(e, f);
    w.events.length = 0;
  }
}

// 1) les soutiens sont hors-jeu et ne comptent pas dans l'équipe
{
  const { w, a, b, sa } = setup(-100, -20);
  ok(sa.length === 2 && sa.every((s) => s.out && s.hp === 0), 'soutiens : doivent être hors-jeu au départ');
  ok(w.team(0).length === 1 && w.teamHp(0) === a.maxHp, 'soutiens : ne comptent pas dans l\u0027équipe');
  ok(!w.enemiesOf(a).includes(sa[0]) && w.nearestEnemy(a) === b, 'soutiens : ne sont pas des cibles');
  console.log('Soutiens hors-jeu'.padEnd(34), sa.length, 'soutiens, équipe =', w.team(0).length);
}
// 2) appel R1 : apparition, délai de rappel, départ après 3 s
{
  const env = setup(-100, -20), { a, sa } = env; let summons = 0, appeared = false;
  run(env, SUP_STAY + 40, (f, i) => { if (f === 3 || f === 10) i[a.slot].sup1 = 1; }, (e) => { if (e.t === 'summon') summons++; });
  // à ce stade le soutien est reparti
  ok(summons === 1, 'appel : un seul soutien malgré 2 appuis (' + summons + ')');
  ok(sa[0].out === true, 'appel : le soutien doit repartir après 3 s');
  ok(a.supCd[0] > 600 && !supReady(a, 0), 'appel : délai de rappel en cours (' + a.supCd[0] + ')');
  ok(supReady(a, 1), 'appel : le soutien 2 reste disponible');
  const env2 = setup(-100, -20); run(env2, 6, (f, i) => { if (f === 3) i[env2.a.slot].sup1 = 1; }, () => { appeared = true; });
  ok(env2.sa[0].out === false && env2.sa[0].hp > 0, 'appel : le soutien doit être présent');
  console.log('Appel R1'.padEnd(34), summons, 'apparition(s), délai restant', a.supCd[0], appeared ? '' : '');
}
// 3) corps à corps : le soutien frappe l'adversaire, pas son propre chef
{
  const env = setup(-100, -20), { a, b } = env;
  run(env, SUP_STAY, (f, i) => { if (f === 3) i[a.slot].sup1 = 1; });
  console.log('Soutien corps à corps'.padEnd(34), 'PV adversaire', Math.round(b.hp), '/', b.maxHp, ', PV chef', Math.round(a.hp));
  ok(b.hp < b.maxHp, 'corps à corps : le soutien doit toucher l\u0027adversaire');
  ok(a.hp === a.maxHp, 'corps à corps : le chef ne doit pas être touché');
}
// 4) tir à distance : un projectile appartenant au soutien
{
  const env = setup(-100, 330), { a, sa } = env; let proj = false;
  run(env, 60, (f, i) => { if (f === 3) i[a.slot].sup1 = 1; if (env.w.projs.some((p) => p.owner === sa[0])) proj = true; });
  console.log('Soutien à distance'.padEnd(34), 'mode', sa[0].supMode, ', projectile', proj);
  ok(sa[0].supMode === 'range', 'distance : mode range attendu (' + sa[0].supMode + ')');
  ok(proj, 'distance : le soutien doit tirer un projectile');
}
// 5) interruption : l'adversaire lance une frappe lourde, le soutien la coupe
{
  const env = setup(-30, 30), { a, b, sa } = env;
  run(env, 60, (f, i) => { if (f === 2) { i[b.slot].punch = 1; i[b.slot].kick = 1; } if (f === 4) i[a.slot].sup1 = 1; });
  console.log('Soutien interruption'.padEnd(34), 'mode', sa[0].supMode, ', PV chef', Math.round(a.hp), '/', a.maxHp, ', PV adversaire', Math.round(b.hp));
  ok(sa[0].supMode === 'interrupt', 'interruption : mode interrupt attendu (' + sa[0].supMode + ')');
  ok(b.hp < b.maxHp, 'interruption : le soutien doit toucher l\u0027adversaire');
  ok(a.hp === a.maxHp, 'interruption : le chef ne doit pas subir la frappe lourde (' + Math.round(a.hp) + ')');
}
// 6) deux IA avec soutiens : appels spontanés, aucune valeur aberrante
{
  const w = new World(33), a = w.add(new Fighter(ROSTER[0], 0)), b = w.add(new Fighter(ROSTER[11], 1));
  a.prepare(-150, 1); b.prepare(150, -1);
  attachSupports(w, a, [ROSTER[3], ROSTER[5]]); attachSupports(w, b, [ROSTER[7], ROSTER[9]]);
  const ai = new Map([[a.slot, new AI(4)], [b.slot, new AI(4)]]), sai = new Map();
  for (const f of w.fighters) if (f.support) sai.set(f.slot, new SupportAI());
  let summons = 0, finite = true;
  for (let f = 0; f < 3600; f++) {
    const inp = w.fighters.map((x) => (x.support ? sai.get(x.slot).think(w, x) : ai.get(x.slot).think(w, x)));
    callSupports(w, inp);
    const ran = w.update(inp);
    if (ran) tickSupports(w);
    for (const e of w.events) if (e.t === 'summon') summons++;
    w.events.length = 0;
    if (![a.x, b.x, a.hp, b.hp].every(Number.isFinite)) finite = false;
  }
  console.log('IA avec soutiens'.padEnd(34), summons, 'appel(s) en 3600 frames');
  ok(summons >= 1, 'IA : au moins un appel de soutien en 3600 frames');
  ok(finite, 'IA : valeurs non finies');
}

console.log(fails ? '\n' + fails + ' échec(s) (soutiens)' : '\nSoutiens : tous les tests passent');
process.exit(fails ? 1 : 0);
