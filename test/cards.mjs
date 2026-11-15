// Tests : rangs fixes, cartes et coffres (rareté, S/SS réservés au Tournoi), déblocage par fragments, migration de sauvegarde, boutique (soldes)
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('ÉCHEC:', m); } };
const mem = {}; globalThis.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
// ancienne sauvegarde (sans version) : le héros 7 était monté au niveau 3
mem['ninja-mugen-prog'] = JSON.stringify({ coins: 500, gems: 1000, lvl: { 7: 3 }, day: 0, last: '' });
const { prog, GEM_COINS, FRAG_COINS } = await import('../js/progress.js');
const { drawCard, drawChest } = await import('../js/cards.js');
const { ROSTER } = await import('../js/data/roster.js');
const { RANKS, NEED, STARTER } = await import('../js/data/ranks.js');

// 1) rangs fixes
ok(ROSTER.every((c) => RANKS.includes(prog.rank(c.id))), 'chaque personnage a un rang E → SS');
ok(prog.rank(STARTER) === 'E', 'le héros de départ est de rang E');
for (const r of RANKS) ok(ROSTER.some((c) => prog.rank(c.id) === r), `au moins un personnage de rang ${r}`);
// 2) migration : héros de départ + héros déjà monté de niveau débloqués, les autres verrouillés ; le rang ne dépend plus du niveau
ok(prog.unlockedIds().length === 2 && prog.unlocked(STARTER) && prog.unlocked(7), 'migration : départ + héros niveau 3');
const r7 = prog.rank(7); prog.upgrade(7); ok(prog.rank(7) === r7, 'le niveau ne change pas le rang');
// 3) tirages : poids respectés, pas de S/SS dans un coffre ordinaire, Tournoi = S/SS uniquement
let seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const cnt = {}; for (let i = 0; i < 20000; i++) { const c = drawCard('normal', rnd); cnt[c.rank] = (cnt[c.rank] || 0) + 1; }
ok(!cnt.S && !cnt.SS, 'aucune carte S / SS dans un coffre ordinaire');
ok(cnt.E > cnt.D && cnt.D > cnt.C && cnt.C > cnt.B && cnt.B > cnt.A && cnt.A > cnt.AA, `plus le rang est haut, plus c'est rare (${JSON.stringify(cnt)})`);
ok(Math.abs(cnt.E / 20000 - 0.4) < 0.02, 'E ≈ 40 %');
ok(drawChest(3, 'tournoi', rnd).every((c) => c.rank === 'S' || c.rank === 'SS'), 'coffre de Tournoi : S / SS uniquement');
ok(drawChest(10, 'normal', rnd).length === 10 && drawChest(3).length === 3, 'coffres de 3 et de 10 cartes');
// 4) fragments : déblocage à la quantité requise, surplus converti en pièces, héros déjà débloqué = pièces
const id = ROSTER.findIndex((c, i) => prog.rank(i) === 'D' && !prog.unlocked(i)), need = NEED.D;
let r = prog.addFrag(id, need - 2); ok(!r.now && !prog.unlocked(id) && prog.frags(id) === need - 2, 'pas encore débloqué');
const c0 = prog.coins; r = prog.addFrag(id, 5); ok(r.now && prog.unlocked(id) && r.over === 3 && prog.coins === c0 + 3 * FRAG_COINS, 'déblocage + surplus en pièces');
const c1 = prog.coins; prog.addFrag(id, 2); ok(prog.coins === c1 + 2 * FRAG_COINS, 'héros débloqué : fragments → pièces');
// 5) coffre d'Histoire : une seule fois par niveau et par difficulté
ok(prog.firstWin('0:3') === true && prog.firstWin('0:3') === false && prog.firstWin('1:3') === true, 'premier succès seulement, par difficulté');
// 6) boutique : soldes, conversion, achat de fragment
const g0 = prog.gems; ok(prog.convert(10) === 10 * GEM_COINS && prog.gems === g0 - 10, 'conversion germes → pièces');
ok(prog.spendGems(10 ** 9) === false && prog.gems === g0 - 10, 'solde insuffisant refusé');
const idB = ROSTER.findIndex((c, i) => prog.rank(i) === 'B' && !prog.unlocked(i)), g1 = prog.gems;
ok(prog.fragPrice(idB) === 70 && prog.buyFrag(idB).n === 1 && prog.gems === g1 - 70 && prog.frags(idB) === 1, 'achat d\'un fragment B = 70 germes');
const idS = ROSTER.findIndex((c, i) => prog.rank(i) === 'S'); ok(prog.fragPrice(idS) === 0 && prog.buyFrag(idS) === null, 'fragments S / SS non vendus');
console.log(fails ? `${fails} échec(s)` : 'Cartes et boutique : tous les tests passent');
process.exit(fails ? 1 : 0);
