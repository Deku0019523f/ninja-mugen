// Cartes et coffres : une carte = des fragments d'UN personnage. Tirage pondéré par rang (plus le rang est haut, plus c'est rare).
// Les cartes S et SS ne sortent QUE des coffres de Tournoi (kind 'tournoi'). Fonction pure : le hasard est injecté (rnd) pour les tests.
import { ROSTER } from './data/roster.js';
import { rankOf } from './data/ranks.js';

export const WEIGHT = { E: 40, D: 25, C: 15, B: 10, A: 6, AA: 3 };          // coffres ordinaires (Histoire, boutique)
export const WEIGHT_TOURNOI = { S: 85, SS: 15 };                            // coffre de Tournoi : cartes S / SS uniquement
const AMOUNT = { E: [3, 5], D: [3, 5], C: [2, 4], B: [2, 4], A: [2, 3], AA: [1, 3], S: [2, 4], SS: [1, 2] };   // fragments par carte (min, max)

const byRank = () => { const m = {}; for (const c of ROSTER) (m[rankOf(c)] = m[rankOf(c)] || []).push(c.id); return m; };

// une carte : choisit un rang selon les poids, puis un personnage de ce rang (équiprobable)
export function drawCard(kind = 'normal', rnd = Math.random) {
  const W = kind === 'tournoi' ? WEIGHT_TOURNOI : WEIGHT, B = byRank();
  const ranks = Object.keys(W).filter((r) => B[r] && B[r].length);
  let t = ranks.reduce((a, r) => a + W[r], 0) * rnd(), rank = ranks[ranks.length - 1];
  for (const r of ranks) { if ((t -= W[r]) < 0) { rank = r; break; } }
  const ids = B[rank], id = ids[Math.min(ids.length - 1, Math.floor(rnd() * ids.length))], [lo, hi] = AMOUNT[rank];
  return { id, rank, n: lo + Math.min(hi - lo, Math.floor(rnd() * (hi - lo + 1))) };
}
// un coffre = n cartes (3 : on en choisit 1 ; 10 : on les garde toutes)
export const drawChest = (n = 3, kind = 'normal', rnd = Math.random) => Array.from({ length: n }, () => drawCard(kind, rnd));
