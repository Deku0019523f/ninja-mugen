// Tests phase 3 : parade parfaite, projection, variantes directionnelles du spécial
import { World } from '../js/game/world.js';
import { Fighter } from '../js/game/fighter.js';
import { ROSTER } from '../js/data/roster.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } };
const N = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0 };
const duo = (xa, xb) => {
  const w = new World(11), a = w.add(new Fighter(ROSTER[0], 0)), b = w.add(new Fighter(ROSTER[11], 1));
  a.prepare(xa, 1); b.prepare(xb, -1);
  return { w, a, b };
};
const play = (w, frames, script, onEvent) => {
  for (let f = 0; f < frames; f++) {
    const inp = [{ ...N }, { ...N }];
    script(f, inp);
    w.update(inp);
    if (onEvent) for (const e of w.events) onEvent(e, f);
    w.events.length = 0;
  }
};

// 1) parade parfaite : ↓ tapé juste avant l'impact
{
  const { w, a, b } = duo(-25, 25); let parries = 0, aState = '';
  play(w, 40, (f, i) => { if (f === 2) i[0].punch = 1; if (f >= 5) i[1].d = 1; }, (e) => { if (e.t === 'clash' && e.parry) { parries++; aState = a.state; } });
  console.log('Parade parfaite'.padEnd(34), parries, 'parade(s), PV défenseur', Math.round(b.hp), '/', b.maxHp, ', attaquant :', aState);
  ok(parries === 1, 'parade parfaite : ' + parries + ' parade(s) au lieu de 1');
  ok(b.hp === b.maxHp, 'parade parfaite : aucun dégât');
  ok(aState === 'hit', 'parade parfaite : attaquant déséquilibré (' + aState + ')');
}
// 2) garde maintenue depuis longtemps : garde normale, pas de parade
{
  const { w, a, b } = duo(-25, 25); let parries = 0, blocks = 0;
  play(w, 60, (f, i) => { if (f === 22) i[0].punch = 1; i[1].d = 1; }, (e) => { if (e.t === 'clash' && e.parry) parries++; if (e.t === 'block') blocks++; });
  console.log('Garde maintenue'.padEnd(34), parries, 'parade(s),', blocks, 'garde(s), PV défenseur', Math.round(b.hp));
  ok(parries === 0, 'garde maintenue : ne doit pas parer (' + parries + ')');
  ok(blocks >= 1, 'garde maintenue : doit bloquer');
  ok(b.hp < b.maxHp, 'garde maintenue : dégâts de garde');
  void a;
}
// 3) projection : arrière + Poing au contact traverse la garde
{
  const { w, b } = duo(-15, 25); let hits = 0;
  play(w, 70, (f, i) => { if (f === 2) { i[0].l = 1; i[0].punch = 1; } i[1].d = 1; }, (e) => { if (e.t === 'hit') hits++; });
  console.log('Projection vs garde'.padEnd(34), hits, 'coup(s), PV défenseur', Math.round(b.hp), '/', b.maxHp);
  ok(hits >= 1 && b.hp < b.maxHp - 20, 'projection : doit traverser la garde (PV ' + Math.round(b.hp) + ')');
}
// 4) projection esquivée par la roulade (invulnérable)
{
  const { w, b } = duo(-15, 25); let hits = 0;
  play(w, 70, (f, i) => { if (f === 2) { i[0].l = 1; i[0].punch = 1; } if (f === 8) { i[1].d = 1; i[1].r = 1; } }, (e) => { if (e.t === 'hit') hits++; });
  console.log('Projection vs roulade'.padEnd(34), hits, 'coup(s), PV défenseur', Math.round(b.hp), '/', b.maxHp);
  ok(hits === 0 && b.hp === b.maxHp, 'projection : la roulade doit l\u0027esquiver');
}
// 5) Spécial ↓ (tir bas) et ↑ (diagonale)
for (const [key, label, test] of [
  ['d', 'Spécial ↓ : tir bas', (p) => p.y < 30 && Math.abs(p.vy) < 0.01],
  ['u', 'Spécial ↑ : diagonale', (p) => p.vy > 1],
]) {
  const { w, a } = duo(-300, 300); a.chi = 60;
  let p0 = null;
  for (let f = 0; f < 40 && !p0; f++) {
    const inp = [{ ...N }, { ...N }];
    if (f === 2) { inp[0].special = 1; inp[0][key] = 1; }
    w.update(inp); w.events.length = 0;
    if (w.projs.length) p0 = { y: w.projs[0].y, vy: w.projs[0].vy, vx: w.projs[0].vx };
  }
  console.log(label.padEnd(34), p0 ? 'y=' + Math.round(p0.y) + ' vy=' + p0.vy.toFixed(2) : 'aucun projectile');
  ok(p0 && test(p0), label + ' : trajectoire inattendue');
}

console.log(fails ? '\n' + fails + ' échec(s) (phase 3)' : '\nPhase 3 : tous les tests passent');
process.exit(fails ? 1 : 0);
