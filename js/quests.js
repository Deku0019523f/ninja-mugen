// Quêtes du jour, succès et récompense « en ligne » (temps de jeu). Aucune pub, aucun achat : tout se gagne en jouant.
import { prog } from './progress.js';
const KEY = 'ninja-mugen-quests';
export const DAILYQ = [
  { id: 'fight', t: 'Jouer 5 combats', n: 5, c: 300 },
  { id: 'win', t: 'Gagner 3 combats', n: 3, c: 500 },
  { id: 'story', t: "Gagner un niveau d'Histoire", n: 1, c: 400 },
  { id: 'chest', t: 'Ouvrir 1 coffre', n: 1, g: 6 },
  { id: 'up', t: 'Monter un héros de niveau', n: 1, c: 300 },
  { id: 'super', t: 'Placer 2 Supers', n: 2, g: 6 },
];
export const MILES = [{ at: 2, g: 5 }, { at: 3, g: 8 }, { at: 4, g: 10 }, { at: 5, g: 15 }, { at: 6, c: 1000, g: 20 }];     // points = quêtes terminées
export const ACHS = [
  { id: 'win', t: 'Gagner 25 combats', n: 25, g: 20 }, { id: 'story', t: "Gagner 10 niveaux d'Histoire", n: 10, g: 20 },
  { id: 'chest', t: 'Ouvrir 10 coffres', n: 10, g: 20 }, { id: 'up', t: 'Monter des héros de 20 niveaux', n: 20, g: 25 },
  { id: 'hero', t: 'Débloquer 5 héros', n: 5, g: 30, live: () => prog.unlockedIds().length },
];
export const ONLINE = [{ m: 2, c: 150 }, { m: 5, g: 4 }, { m: 10, c: 400 }, { m: 20, g: 8 }, { m: 30, c: 800, g: 8 }];   // minutes jouées aujourd'hui
const day = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
let D = { day: day(), c: {}, cl: {}, ms: {}, ach: {}, acl: {}, sec: 0, on: {} };
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) D = Object.assign(D, s); } catch (e) { /* ignore */ }
const store = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { /* ignore */ } };
const roll = () => { if (D.day !== day()) { D.day = day(); D.c = {}; D.cl = {}; D.ms = {}; D.sec = 0; D.on = {}; store(); } };
const pay = (r) => prog.add(r.c || 0, r.g || 0);

export const quests = {
  track(id, n = 1) {
    roll(); const q = DAILYQ.find((x) => x.id === id); if (q) D.c[id] = Math.min(q.n, (D.c[id] || 0) + n);
    D.ach[id] = (D.ach[id] || 0) + n; store();
  },
  tick(s = 1) { roll(); D.sec += s; if (D.sec % 15 === 0) store(); },        // temps de jeu du jour, en secondes
  daily() { roll(); return DAILYQ.map((q) => ({ ...q, v: D.c[q.id] || 0, done: (D.c[q.id] || 0) >= q.n, got: !!D.cl[q.id] })); },
  claim(id) { roll(); const q = this.daily().find((x) => x.id === id); if (!q || !q.done || q.got) return null; D.cl[id] = 1; pay(q); store(); return q; },
  points() { return this.daily().filter((q) => q.done).length; },
  miles() { roll(); const p = this.points(); return MILES.map((m, i) => ({ ...m, i, ok: p >= m.at, got: !!D.ms[i] })); },
  claimMile(i) { const m = this.miles()[i]; if (!m || !m.ok || m.got) return null; D.ms[i] = 1; pay(m); store(); return m; },
  achs() { return ACHS.map((a) => { const v = Math.min(a.n, a.live ? a.live() : D.ach[a.id] || 0); return { ...a, v, done: v >= a.n, got: !!D.acl[a.id] }; }); },
  claimAch(id) { const a = this.achs().find((x) => x.id === id); if (!a || !a.done || a.got) return null; D.acl[id] = 1; pay(a); store(); return a; },
  online() { roll(); const m = Math.floor(D.sec / 60); return { sec: D.sec, min: m, list: ONLINE.map((o, i) => ({ ...o, i, ok: m >= o.m, got: !!D.on[i], left: Math.max(0, o.m * 60 - D.sec) })) }; },
  claimOnline(i) { const o = this.online().list[i]; if (!o || !o.ok || o.got) return null; D.on[i] = 1; pay(o); store(); return o; },
  // nombre de récompenses à récupérer (pastilles rouges)
  pending() { return { q: this.daily().filter((x) => x.done && !x.got).length + this.miles().filter((m) => m.ok && !m.got).length, a: this.achs().filter((x) => x.done && !x.got).length, o: this.online().list.filter((o) => o.ok && !o.got).length }; },
};
setInterval(() => { if (!document.hidden) quests.tick(1); }, 1000);
