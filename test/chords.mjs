// Tests du détecteur de combinaisons (boutons physiques -> actions du moteur)
import { Chord } from '../js/game/chords.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } };
const R = (o = {}) => ({ l: 0, r: 0, u: 0, d: 0, o: 0, x: 0, sq: 0, tri: 0, r2: 0, l2: 0, sup1: 0, sup2: 0, ...o });

// 1) ○ seul : un Poing, une seule impulsion (pas de répétition en maintenant)
{
  const c = new Chord(); const a = c.map(R({ o: 1 })), b = c.map(R({ o: 1 }));
  ok(a.punch === 1 && a.kick === 0, '○ : doit donner un Poing');
  ok(b.punch === 0, '○ maintenu : pas de répétition');
}
// 2) △ maintenu puis ○ : Ninjutsu, sans Poing
{
  const c = new Chord(); c.map(R({ tri: 1 })); c.map(R({ tri: 1 })); c.map(R({ tri: 1 }));
  const a = c.map(R({ tri: 1, o: 1 }));
  ok(a.special === 1 && a.punch === 0 && a.super === 0, '△+○ : Ninjutsu attendu');
}
// 3) △ → △ → ○ : Technique ultime
{
  const c = new Chord(); c.map(R({ tri: 1 })); c.map(R()); c.map(R({ tri: 1 }));
  const a = c.map(R({ tri: 1, o: 1 }));
  ok(a.super === 1 && a.special === 0, '△△○ : Technique ultime attendue');
}
// 4) △ + ✕ : Chakra Dash, sans saut (même en maintenant ✕)
{
  const c = new Chord(); c.map(R({ tri: 1 }));
  const a = c.map(R({ tri: 1, x: 1 })), b = c.map(R({ tri: 1, x: 1 }));
  ok(a.cdash === 1 && a.u === 0 && b.u === 0 && b.cdash === 0, '△+✕ : Chakra Dash sans saut');
}
// 5) △ + □ : Chakra Shuriken ; □ seul : Shuriken
{
  const c = new Chord(); c.map(R({ tri: 1 }));
  const a = c.map(R({ tri: 1, sq: 1 }));
  ok(a.cshuriken === 1 && a.sq === 0, '△+□ : Chakra Shuriken');
  const d = new Chord(); const b = d.map(R({ sq: 1 }));
  ok(b.sq === 1 && b.cshuriken === 0, '□ : Shuriken');
}
// 6) charge : △ maintenu ≥ 6 frames
{
  const c = new Chord(); let out;
  for (let i = 1; i <= 8; i++) { out = c.map(R({ tri: 1 })); if (i === 3) ok(out.charge === 0, '△ : pas de charge avant 6 frames'); }
  ok(out.charge === 1, '△ maintenu : charge attendue');
}
// 7) chaînes directionnelles de ○ : ↑ = high, ↓ = low, ←/→ = side (une impulsion, sans Poing)
{
  const c = new Chord(); const a = c.map(R({ u: 1, o: 1 }));
  ok(a.high === 1 && a.punch === 0 && a.low === 0 && a.side === 0, '↑+○ : chaîne haute');
  const d = new Chord(); const e = d.map(R({ d: 1, o: 1 }));
  ok(e.low === 1 && e.punch === 0 && e.high === 0, '↓+○ : chaîne basse');
  const f = new Chord(); const g = f.map(R({ r: 1, o: 1 })), g2 = new Chord().map(R({ l: 1, o: 1 }));
  ok(g.side === 1 && g2.side === 1 && g.punch === 0, '←/→+○ : chaîne latérale');
  const h = new Chord(); h.map(R({ u: 1, o: 1 })); const h2 = h.map(R({ u: 1, o: 1 }));
  ok(h2.high === 0, '○ maintenu : pas de répétition');
  const i = new Chord(); i.map(R({ u: 1, o: 1 })); i.map(R({ u: 1 })); const i2 = i.map(R({ u: 1, o: 1 }));
  ok(i2.high === 1, '○ relaché puis pressé à nouveau : nouvelle impulsion');
}
// 8) R2 = garde ; ✕ = saut
{
  const c = new Chord(); const a = c.map(R({ r2: 1 })), b = new Chord().map(R({ x: 1 }));
  ok(a.d === 1 && a.guard === 1, 'R2 : garde');
  ok(b.u === 1, '✕ : saut');
}
// 9) △ relâché depuis peu puis ○ : toujours Ninjutsu
{
  const c = new Chord(); c.map(R({ tri: 1 })); c.map(R());
  const a = c.map(R({ o: 1 }));
  ok(a.special === 1, '△ puis ○ dans la foulée : Ninjutsu');
}
// 10) R2 + ○ : projection, sans Poing ni chaîne
{
  const c = new Chord(); c.map(R({ r2: 1 }));
  const a = c.map(R({ r2: 1, o: 1 })), b = c.map(R({ r2: 1, o: 1 }));
  ok(a.throw === 1 && a.punch === 0 && a.low === 0 && b.throw === 0, 'R2+○ : projection (une impulsion)');
}
// 11) L2 : substitution en impulsion (pas de répétition en maintenant)
{
  const c = new Chord(); const a = c.map(R({ l2: 1 })), b = c.map(R({ l2: 1 }));
  ok(a.sub === 1 && b.sub === 0, 'L2 : une seule impulsion');
}

console.log(fails ? '\n' + fails + ' échec(s) (combinaisons)' : '\nCombinaisons : tous les tests passent');
process.exit(fails ? 1 : 0);
