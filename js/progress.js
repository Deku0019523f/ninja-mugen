// Progression du joueur (sauvegardée sur l'appareil) : pièces, gemmes, niveau de chaque héros, récompense quotidienne.
const KEY = 'ninja-mugen-prog';
export const MAXLV = 50, TIERS = [10, 20, 30, 40, 50];
export const DAILY = [{ c: 100 }, { c: 150 }, { c: 200 }, { c: 250, g: 2 }, { c: 300 }, { c: 400, g: 3 }, { c: 600, g: 10 }];
const DEF = () => ({ coins: 300, gems: 5, lvl: {}, day: 0, last: '' });
let P = DEF();
try { P = Object.assign(DEF(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* ignore */ }
const store = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* ignore */ } };

const ymd = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const today = () => ymd(new Date()), yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return ymd(d); };

export const prog = {
  get coins() { return P.coins; }, get gems() { return P.gems; },
  level: (id) => Math.min(MAXLV, Math.max(1, P.lvl[id] || 1)),
  tiers: (id) => TIERS.filter((t) => prog.level(id) >= t).length,
  rank: (id) => { const l = prog.level(id); return l >= 50 ? 'SS' : l >= 45 ? 'S' : l >= 40 ? 'AA' : l >= 30 ? 'A' : l >= 20 ? 'B' : l >= 10 ? 'C' : l >= 5 ? 'D' : 'E'; },   // E→SS selon le niveau
  // multiplicateurs appliqués au combattant : ATK, PV, taux de critique (les paliers ajoutent +4 % d'ATK chacun)
  stats(id, lv) { const l = lv || prog.level(id), t = TIERS.filter((x) => l >= x).length; return { lvl: l, atk: (1 + 0.025 * (l - 1)) * (1 + 0.04 * t), hp: 1 + 0.03 * (l - 1), crit: 0.05 + 0.004 * (l - 1) }; },
  power() { let p = 0; for (const k in P.lvl) p += P.lvl[k] * 10 + TIERS.filter((x) => P.lvl[k] >= x).length * 50; return 500 + p; },
  cost: (id) => 80 + prog.level(id) * 40,
  upgrade(id) { const c = prog.cost(id); if (prog.level(id) >= MAXLV || P.coins < c) return false; P.coins -= c; P.lvl[id] = prog.level(id) + 1; store(); return true; },
  add(c = 0, g = 0) { P.coins += c; P.gems += g; store(); },
  // gains de fin de combat
  reward(win, big) { const c = win ? (big ? 150 : 60) : 20, g = win ? (big ? 3 : 1) : 0; prog.add(c, g); return { c, g }; },
  // cadeau quotidien : série sur 7 jours (la série repart de zéro si un jour est manqué)
  daily() {
    if (P.last !== today() && P.last !== yesterday() && P.last !== '') P.day = 0;
    return { day: P.day, can: P.last !== today() };
  },
  claim() { const d = prog.daily(); if (!d.can) return null; const r = DAILY[d.day]; prog.add(r.c, r.g || 0); P.day = (d.day + 1) % 7; P.last = today(); store(); return r; },
};
