// Mode Histoire : 10 combats (2 boss) × 2 difficultés. Chaque combat : 1 étoile pour la victoire + 2 objectifs bonus.
const KEY = 'ninja-mugen-story';
export const DIFFS = [{ n: 'NORMAL', base: 3 }, { n: 'DIFFICILE', base: 4 }];
const O = {
  time: (v) => ({ k: 'time', v, t: `Gagner en moins de ${v >= 120 ? v / 60 + ' min' : v + ' s'}`, ok: (s) => s.sec <= v }),
  flaw: () => ({ k: 'flaw', t: 'Ne perdre aucune manche', ok: (s) => s.lost === 0 }),
  hp: (v) => ({ k: 'hp', v, t: `Finir avec plus de ${v} % de vie`, ok: (s) => s.hp * 100 > v }),
  combo: (v) => ({ k: 'combo', v, t: `Enchaîner un combo de ${v} coups`, ok: (s) => s.chain >= v }),
};
// [adversaire, décor, objectif A, objectif B, boss ?]
const RAW = [
  [3, 0, O.time(180), O.hp(40)], [9, 1, O.flaw(), O.combo(5)], [14, 2, O.time(150), O.hp(50)], [20, 3, O.combo(6), O.flaw()],
  [54, 4, O.time(180), O.hp(30), 1],
  [26, 5, O.time(150), O.combo(7)], [31, 6, O.flaw(), O.hp(50)], [38, 7, O.time(120), O.combo(8)], [44, 8, O.hp(60), O.flaw()],
  [55, 9, O.time(240), O.hp(40), 1],
];
export const NODES = RAW.map(([opp, stage, a, b, boss], i) => ({ i, opp, stage, obj: [a, b], boss: !!boss, name: boss ? (i === 4 ? 'GARDIEN DU SEUIL' : 'ULTIME MAÎTRE') : `COMBAT ${i + 1}` }));

let D = { s: {} };       // s['d0'] = [étoiles par nœud]
try { D = Object.assign(D, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* ignore */ }
// ancienne sauvegarde à 3 difficultés (Facile, Normal, Difficile) : Facile disparaît, Normal et Difficile se décalent
if (!D.v) { const o = D.s || {}; D.s = {}; if (o.d1) D.s.d0 = o.d1; if (o.d2) D.s.d1 = o.d2; D.v = 2; try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { /* ignore */ } }
const store = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { /* ignore */ } };

export const story = {
  stars: (d, i) => ((D.s['d' + d] || [])[i]) || 0,
  total: (d) => NODES.reduce((a, n) => a + story.stars(d, n.i), 0),
  cleared: (d, i) => story.stars(d, i) > 0,
  nodeOpen: (d, i) => story.diffOpen(d) && (i === 0 || story.cleared(d, i - 1)),
  diffOpen: (d) => d === 0 || story.cleared(d - 1, NODES.length - 1),
  diffLevel: (d, i) => Math.min(5, DIFFS[d].base + Math.floor(i / 4)),
  // fin d'un combat : calcule les étoiles, enregistre le meilleur résultat, renvoie les gains bonus
  finish(d, i, res) {
    const n = NODES[i], win = res.winner === 0, objs = n.obj.map((o) => win && o.ok(res.stats));
    const stars = win ? 1 + objs.filter(Boolean).length : 0, prev = story.stars(d, i);
    let c = 0, g = 0;
    if (stars > prev) {
      c = (stars - prev) * 40 * (n.boss ? 2 : 1); if (stars === 3) g = 2;
      (D.s['d' + d] = D.s['d' + d] || [])[i] = stars; store();
    }
    return { win, stars, objs, newStars: Math.max(0, stars - prev), c, g, next: win && i + 1 < NODES.length };
  },
};
