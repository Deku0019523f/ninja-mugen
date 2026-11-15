// Progression du joueur (sauvegardée sur l'appareil) : pièces, germes, niveau de chaque héros, héros débloqués et fragments, récompense quotidienne.
import { ROSTER } from './data/roster.js';
import { rankOf, NEED, STARTER } from './data/ranks.js';
const KEY = 'ninja-mugen-prog';
export const MAXLV = 50, TIERS = [10, 20, 30, 40, 50];
export const DAILY = [{ c: 100 }, { c: 150 }, { c: 200 }, { c: 250, g: 2 }, { c: 300 }, { c: 400, g: 3 }, { c: 600, g: 10 }];
export const FRAG_COINS = 15, GEM_COINS = 40;   // un fragment en trop vaut 15 pièces ; 1 germe = 40 pièces
export const FRAG_PRICE = { E: 20, D: 30, C: 45, B: 70, A: 100, AA: 150 };   // prix d'un fragment en germes (S et SS : jamais vendus)
const DEF = () => ({ coins: 300, gems: 5, lvl: {}, open: {}, frag: {}, won: {}, boxes: 0, day: 0, last: '' });
let P = DEF();
try { P = Object.assign(DEF(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* ignore */ }
// migration : une ancienne sauvegarde garde débloqués les héros déjà montés de niveau ; le héros de départ (rang E) l'est toujours
if (!P.v || P.v < 2) {   // (DEF() n'a pas de version : une sauvegarde sans « v » vient de l'ancien système)
  for (const k in P.lvl) if (P.lvl[k] > 1) P.open[k] = true; P.v = 2; }
P.open = P.open || {}; P.frag = P.frag || {}; P.won = P.won || {}; P.open[STARTER] = true;
const store = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* ignore */ } };

const ymd = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const today = () => ymd(new Date()), yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return ymd(d); };

export const prog = {
  get coins() { return P.coins; }, get gems() { return P.gems; },
  level: (id) => Math.min(MAXLV, Math.max(1, P.lvl[id] || 1)),
  tiers: (id) => TIERS.filter((t) => prog.level(id) >= t).length,
  rank: (id) => rankOf(ROSTER[id] || {}),   // rang FIXE du personnage, E → SS (indépendant de son niveau)
  need: (id) => NEED[prog.rank(id)],
  unlocked: (id) => !!P.open[id],
  frags: (id) => P.frag[id] || 0,
  unlockedIds: () => ROSTER.filter((c) => P.open[c.id]).map((c) => c.id),
  // ajoute des fragments d'un personnage : débloque à la quantité requise ; les fragments en trop (ou déjà débloqué) donnent des pièces
  addFrag(id, n) {
    const need = prog.need(id), had = P.open[id]; let over = 0;
    if (had) over = n; else { const t = (P.frag[id] || 0) + n; P.frag[id] = Math.min(need, t); over = Math.max(0, t - need); if (t >= need) P.open[id] = true; }
    P.coins += over * FRAG_COINS; store();
    return { id, n, now: !had && !!P.open[id], over, coins: over * FRAG_COINS };
  },
  // coffre d'Histoire : une seule fois par niveau et par difficulté (renvoie true la première fois)
  firstWin(key) { if (P.won[key]) return false; P.won[key] = 1; store(); return true; },
  spendGems(n) { if (P.gems < n) return false; P.gems -= n; store(); return true; },
  convert(gems) { if (!prog.spendGems(gems)) return 0; P.coins += gems * GEM_COINS; store(); return gems * GEM_COINS; },
  fragPrice: (id) => FRAG_PRICE[prog.rank(id)] || 0,
  buyFrag(id) { const pr = prog.fragPrice(id); if (!pr || P.open[id] || !prog.spendGems(pr)) return null; return prog.addFrag(id, 1); },
  boxOpened() { P.boxes++; store(); },
  // multiplicateurs appliqués au combattant : ATK, PV, taux de critique (les paliers ajoutent +4 % d'ATK chacun)
  stats(id, lv) { const l = lv || prog.level(id), t = TIERS.filter((x) => l >= x).length; return { lvl: l, atk: (1 + 0.025 * (l - 1)) * (1 + 0.04 * t), hp: 1 + 0.03 * (l - 1), crit: 0.05 + 0.004 * (l - 1) }; },
  power() { let p = 0; for (const k in P.lvl) p += P.lvl[k] * 10 + TIERS.filter((x) => P.lvl[k] >= x).length * 50; return 500 + p; },
  cost: (id) => 80 + prog.level(id) * 40,
  upgrade(id) { const c = prog.cost(id); if (prog.level(id) >= MAXLV || P.coins < c) return false; P.coins -= c; P.lvl[id] = prog.level(id) + 1; store(); return true; },
  add(c = 0, g = 0) { P.coins += c; P.gems += g; store(); },
  // gains de fin de combat (germes : un coffre ×3 à 250 s'obtient en 2 à 3 séances de jeu)
  reward(win, big) { const c = win ? (big ? 150 : 60) : 20, g = win ? (big ? 12 : 5) : 0;  prog.add(c, g); return { c, g }; },
  // cadeau quotidien : série sur 7 jours (la série repart de zéro si un jour est manqué)
  daily() {
    if (P.last !== today() && P.last !== yesterday() && P.last !== '') P.day = 0;
    return { day: P.day, can: P.last !== today() };
  },
  claim() { const d = prog.daily(); if (!d.can) return null; const r = DAILY[d.day]; prog.add(r.c, r.g || 0); P.day = (d.day + 1) % 7; P.last = today(); store(); return r; },
};
