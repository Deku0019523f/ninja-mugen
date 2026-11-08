// ============================================================
//  IA : 5 niveaux de difficulté + 4 personnalités. Produit les mêmes entrées qu'un joueur.
// ============================================================
import { supReady } from './support.js';

const NEUTRAL = () => ({ l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0, sq: 0, cdash: 0, cshuriken: 0, charge: 0, sup1: 0, sup2: 0 });
const REACT = [46, 34, 24, 15, 8];
const BLOCK = [0.04, 0.18, 0.38, 0.6, 0.82];
const CHAIN = [0.35, 0.55, 0.7, 0.85, 0.95];
const AGGR = [0.35, 0.5, 0.62, 0.78, 0.9];
const PARRY_CH = [0, 0.05, 0.12, 0.2, 0.3];   // chance de parade volontaire par niveau

// aggr : bonus d'agressivité · block / sp / parry / throw : multiplicateurs · keepAway : garde ses distances
export const PERSONALITIES = {
  balanced: { aggr: 0, block: 1, sp: 1, parry: 1, throw: 1, keepAway: false },
  rush: { aggr: 0.1, block: 0.7, sp: 0.8, parry: 0.8, throw: 1.6, keepAway: false },
  zoner: { aggr: -0.05, block: 1, sp: 1.5, parry: 1, throw: 0.6, keepAway: true },
  turtle: { aggr: -0.15, block: 1.25, sp: 0.9, parry: 1.6, throw: 1, keepAway: false },
};

export class AI {
  constructor(level = 3, personality = 'balanced') {
    this.lv = Math.max(1, Math.min(5, level)); this.plan = null; this.t = 0; this.until = 0; this.holdD = 0;
    this.P = PERSONALITIES[personality] || PERSONALITIES.balanced;
  }

  think(w, f) {
    const inp = NEUTRAL();
    const e = w.nearestEnemy(f);
    if (!e || f.hp <= 0) return inp;
    const L = this.lv - 1, R = () => w.rnd();
    const dx = e.x - f.x, dist = Math.abs(dx), dir = dx >= 0 ? 1 : -1;

    // appel des soutiens (R1 / L1) : plus volontiers quand on est en difficulté
    if (f.sup) {
      const stunned = f.state === 'hit' || f.state === 'launch' || f.state === 'blockstun';
      const pc = stunned ? 0.05 : 0.003 + 0.0015 * L;
      for (let i = 0; i < 2; i++) if (supReady(f, i) && R() < pc) { inp[i === 0 ? 'sup1' : 'sup2'] = 1; break; }
    }

    if (f.state === 'atk') {                       // combos automatiques
      const m = f.move;
      if (m && f.connected && !m.special && !m.super) {
        const r = R();
        if (f.y <= 0 && f.chi >= 50 && r < 0.03 * this.lv) inp.super = 1;
        else if (f.chi >= 10 && r < 0.03 * this.lv) inp.special = 1;
        else if (m.cancels && R() < CHAIN[L]) {
          if (m.id && f.y <= 0 && R() < 0.12 * this.lv / 2) { inp.punch = 1; inp.kick = 1; }
          else { const ks = Object.keys(m.cancels); inp[ks[(R() * ks.length) | 0]] = 1; }
        }
      }
      return inp;
    }
    if (f.y > 0) {                                  // en l'air
      if (dist < 90 && R() < 0.12) inp[R() < 0.5 ? 'kick' : 'punch'] = 1;
      return inp;
    }
    if (f.state !== 'idle' && f.state !== 'walk' && f.state !== 'block' && f.state !== 'charge') return inp;

    // parade volontaire : tape ↓ 1 à 3 frames avant l'activation d'un coup adverse, puis garde quelques frames
    if (this.holdD > 0) { this.holdD--; inp.d = 1; return inp; }
    if (e.state === 'atk' && e.move && e.move.dmg !== undefined && !e.move.super && !e.move.unblock && dist < 120) {
      const rem = e.move.su - e.t;
      if (rem >= 1 && rem <= 3 && R() < PARRY_CH[L] * this.P.parry) { this.holdD = 9; inp.d = 1; return inp; }
    }

    this.t++;
    if (!this.plan || this.t >= this.until) { this.decide(w, f, e, dist, dir, L, R); this.t = 0; }
    const p = this.plan;
    if (!p) return inp;
    switch (p.k) {
      case 'approach': inp[dir > 0 ? 'r' : 'l'] = 1; break;
      case 'retreat': inp[dir > 0 ? 'l' : 'r'] = 1; break;
      case 'block': inp.d = 1; break;
      case 'charge': inp.charge = 1; break;
      case 'jump': if (!p.done) { inp.u = 1; inp[p.dirv > 0 ? 'r' : 'l'] = 1; p.done = true; } break;
      case 'press': if (!p.done) { inp[p.key] = 1; if (p.down) inp.d = 1; if (p.up) inp.u = 1; if (p.back) inp[dir > 0 ? 'l' : 'r'] = 1; p.done = true; } break;
      default: break;
    }
    return inp;
  }

  decide(w, f, e, dist, dir, L, R) {
    const P = this.P;
    const set = (k, dur, extra = {}) => { this.plan = { k, ...extra }; this.until = dur; };
    const react = REACT[L] + Math.floor(R() * 10);
    const aggr = Math.min(0.97, Math.max(0.1, AGGR[L] + P.aggr)), blk = Math.min(0.95, BLOCK[L] * P.block);
    if (w.threatNear(f) && R() < blk) return set('block', 16 + Math.floor(R() * 12));
    if (e.y > 25 && dist < 110 && R() < 0.2 + L * 0.1) return set('press', 14, { key: 'punch', down: true });
    if (e.y > 40 && dist > 70 && dist < 320 && f.chi >= 10 && R() < 0.15 + L * 0.08) return set('press', 16, { key: 'special', up: true });   // tir anti-aérien
    if (f.chi >= 50 && R() < 0.1 + L * 0.06 && dist < 420) return set('press', 40, { key: 'super' });
    if (R() > aggr) return set(R() < 0.5 ? 'retreat' : 'wait', react);
    if (P.keepAway && dist < 140 && R() < 0.35) return set('retreat', react);   // zoner : garde ses distances
    if (dist > 220 && f.chi < 60 && R() < 0.1) return set('charge', 40 + Math.floor(R() * 40));   // recharge le chakra quand l'adversaire est loin

    if (dist > 300) {
      const r = R();
      if (r < 0.3 * P.sp && f.chi >= 10) return set('press', react + 10, { key: 'special', down: R() < 0.25 });
      if (r < 0.4) return set('jump', react + 20, { dirv: dir });
      return set('approach', react + 10);
    }
    if (dist > 120) {
      const q = R();
      if (q < 0.12) return set('press', react + 4, { key: 'sq' });                                   // Shuriken
      if (q < 0.2 && f.chi >= 20) return set('press', react + 6, { key: 'cdash' });                // Chakra Dash pour fermer la distance
      const r = R();
      if (r < 0.22 * P.sp && f.chi >= 10) return set('press', react + 8, { key: 'special', down: R() < 0.3 });
      if (r < 0.42 && f.chi >= 15) return set('press', react + 12, { key: 'move2' });
      if (r < 0.5) return set('jump', react + 20, { dirv: dir });
      return set('approach', react);
    }
    if (dist < 52 && R() < (0.1 + L * 0.06) * P.throw) return set('press', react + 4, { key: 'punch', back: true });   // projection
    const r = R();
    if (r < 0.46) return set('press', react, { key: 'punch' });
    if (r < 0.64) return set('press', react + 6, { key: 'kick' });
    if (r < 0.72) return set('press', react + 8, { key: 'kick', down: true });
    if (r < 0.8 && f.chi >= 15) return set('press', react + 8, { key: 'move2' });
    if (r < 0.9) return set('block', 14);
    return set('retreat', react);
  }
}
