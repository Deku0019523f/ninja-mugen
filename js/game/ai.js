// ============================================================
//  IA : 5 niveaux de difficulté. Produit les mêmes entrées qu'un joueur.
// ============================================================
const NEUTRAL = () => ({ l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0 });
const REACT = [46, 34, 24, 15, 8];
const BLOCK = [0.04, 0.18, 0.38, 0.6, 0.82];
const CHAIN = [0.35, 0.55, 0.7, 0.85, 0.95];
const AGGR = [0.35, 0.5, 0.62, 0.78, 0.9];

export class AI {
  constructor(level = 3) { this.lv = Math.max(1, Math.min(5, level)); this.plan = null; this.t = 0; this.until = 0; }

  think(w, f) {
    const inp = NEUTRAL();
    const e = w.nearestEnemy(f);
    if (!e || f.hp <= 0) return inp;
    const L = this.lv - 1, R = () => w.rnd();
    const dx = e.x - f.x, dist = Math.abs(dx), dir = dx >= 0 ? 1 : -1;

    if (f.state === 'atk') {                       // combos automatiques
      const m = f.move;
      if (m && f.connected) {
        if (m.chain && R() < CHAIN[L]) inp.punch = 1;
        else if (!m.special && !m.super && m.id && f.chi >= 10 && R() < 0.04 * this.lv) inp.special = 1;
      }
      return inp;
    }
    if (f.y > 0) {                                  // en l'air
      if (dist < 90 && R() < 0.12) inp[R() < 0.5 ? 'kick' : 'punch'] = 1;
      return inp;
    }
    if (f.state !== 'idle' && f.state !== 'walk' && f.state !== 'block') return inp;

    this.t++;
    if (!this.plan || this.t >= this.until) { this.decide(w, f, e, dist, dir, L, R); this.t = 0; }
    const p = this.plan;
    if (!p) return inp;
    switch (p.k) {
      case 'approach': inp[dir > 0 ? 'r' : 'l'] = 1; break;
      case 'retreat': inp[dir > 0 ? 'l' : 'r'] = 1; break;
      case 'block': inp.d = 1; break;
      case 'jump': if (!p.done) { inp.u = 1; inp[p.dirv > 0 ? 'r' : 'l'] = 1; p.done = true; } break;
      case 'press': if (!p.done) { inp[p.key] = 1; if (p.down) inp.d = 1; p.done = true; } break;
      default: break;
    }
    return inp;
  }

  decide(w, f, e, dist, dir, L, R) {
    const set = (k, dur, extra = {}) => { this.plan = { k, ...extra }; this.until = dur; };
    const react = REACT[L] + Math.floor(R() * 10);
    if (w.threatNear(f) && R() < BLOCK[L]) return set('block', 16 + Math.floor(R() * 12));
    if (e.y > 25 && dist < 110 && R() < 0.2 + L * 0.1) return set('press', 14, { key: 'punch', down: true });
    if (f.chi >= 50 && R() < 0.1 + L * 0.06 && dist < 420) return set('press', 40, { key: 'super' });
    if (R() > AGGR[L]) return set(R() < 0.5 ? 'retreat' : 'wait', react);

    if (dist > 300) {
      const r = R();
      if (r < 0.3 && f.chi >= 10) return set('press', react + 10, { key: 'special' });
      if (r < 0.4) return set('jump', react + 20, { dirv: dir });
      return set('approach', react + 10);
    }
    if (dist > 120) {
      const r = R();
      if (r < 0.22 && f.chi >= 10) return set('press', react + 8, { key: 'special' });
      if (r < 0.42 && f.chi >= 15) return set('press', react + 12, { key: 'move2' });
      if (r < 0.5) return set('jump', react + 20, { dirv: dir });
      return set('approach', react);
    }
    const r = R();
    if (r < 0.46) return set('press', react, { key: 'punch' });
    if (r < 0.64) return set('press', react + 6, { key: 'kick' });
    if (r < 0.72) return set('press', react + 8, { key: 'kick', down: true });
    if (r < 0.8 && f.chi >= 15) return set('press', react + 8, { key: 'move2' });
    if (r < 0.9) return set('block', 14);
    return set('retreat', react);
  }
}
