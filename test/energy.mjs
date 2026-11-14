// Tests de l'énergie : barre de 150 (300 pour l'IA solo), recharge par △ maintenu, refus quand il n'y en a pas assez
import { World } from '../js/game/world.js';
import { Fighter } from '../js/game/fighter.js';
import { ROSTER } from '../js/data/roster.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } };
const N = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0, sup1: 0, sup2: 0, charge: 0 };
function setup() { const w = new World(5), a = w.add(new Fighter(ROSTER[0], 0)), b = w.add(new Fighter(ROSTER[11], 1)); a.prepare(-150, 1); b.prepare(150, -1); return { w, a, b }; }
function run(env, frames, script) { const { w } = env; const ev = []; for (let f = 0; f < frames; f++) { const inp = w.fighters.map(() => ({ ...N })); script && script(f, inp); w.update(inp); ev.push(...w.events); w.events.length = 0; } return ev; }

// 1) tailles de barre par défaut ; l'IA solo a le double (réglé par Match)
{
  const { a, b } = setup();
  ok(a.maxChi === 150, 'joueur : 150 par défaut');
  b.maxChi = 300; ok(b.maxChi === 2 * a.maxChi, 'IA : le double du joueur');
}
// 2) charge : monte jusqu'au plafond, sans le dépasser ; la barre de l'IA monte aussi vite en proportion
{
  const env = setup(); env.b.maxChi = 300;
  const f = (f, inp) => { inp[0].charge = 1; inp[1].charge = 1; };
  run(env, 400, f);
  ok(env.a.chi <= 150 && env.a.chi >= 149, `joueur plein à 150 (${env.a.chi.toFixed(1)})`);
  ok(env.b.chi <= 300 && env.b.chi >= 299, `IA pleine à 300 (${env.b.chi.toFixed(1)})`);
}
// 3) action trop chère : refusée, énergie intacte, signal « nochi » une seule fois dans la fenêtre de refus
{
  const env = setup(); env.a.chi = 20;
  const ev = run(env, 20, (f, inp) => { if (f === 2) inp[0].super = 1; });
  ok(env.a.chi >= 20 && env.a.state !== 'atk', 'super refusé à 20 d\'énergie');
  ok(ev.filter((e) => e.t === 'nochi').length === 1, 'un seul signal de refus');
}
// 4) action payable : l'énergie est dépensée
{
  const env = setup(); env.a.chi = 120;
  run(env, 12, (f, inp) => { if (f === 2) inp[0].super = 1; });
  ok(env.a.chi < 120 - 40, `super payé (${env.a.chi.toFixed(1)})`);
}
// 5) Dash sur l'ennemi : coûte 30, rejoint l'adversaire même très loin ; refusé sans énergie
{
  const env = setup(); env.a.prepare(-400, 1); env.b.prepare(400, -1); env.a.chi = 100;
  const d0 = Math.abs(env.b.x - env.a.x);
  run(env, 60, (f, inp) => { if (f === 2) inp[0].rush = 1; });
  ok(env.a.chi < 100 - 18 && env.a.chi > 100 - 40, `dash payé ~30 (${env.a.chi.toFixed(1)})`);
  ok(Math.abs(env.b.x - env.a.x) < d0 - 400 || env.b.hp < env.b.maxHp, 'le dash rejoint l\'ennemi lointain');
  const e2 = setup(); e2.a.chi = 20; run(e2, 20, (f, inp) => { if (f === 2) inp[0].rush = 1; });
  ok(e2.a.chi >= 20 && e2.a.state !== 'atk', 'dash refusé à 20 d\'énergie');
}
// 6) Super 2 : 100 d'énergie, verrouillé sous le niveau 10 (héros suivi), plus fort que le Super 1
{
  const lost = (lvl, key) => { const e = setup(); e.a.chi = 150; if (lvl) e.a.lv = { lvl }; run(e, 14, (f, inp) => { if (f === 2) inp[0][key] = 1; }); return 150 - e.a.chi; };
  ok(lost(9, 'super2') < 5, 'Super 2 verrouillé au niveau 9');
  const c = lost(10, 'super2'); ok(c > 95 && c < 110, `Super 2 coûte 100 au niveau 10 (${c.toFixed(1)})`);
  ok(lost(0, 'super2') > 95, 'Super 2 disponible sans niveau suivi (PvP)');
}
console.log(fails ? `${fails} échec(s)` : 'Énergie : tous les tests passent');
process.exit(fails ? 1 : 0);
