// ============================================================
//  IA : 5 niveaux de difficulté + 4 personnalités. Produit les mêmes entrées qu'un joueur et utilise TOUTES ses actions :
//  chaînes ○ (normale, haute, basse, latérale), projection, Shuriken, Chakra Shuriken, Chakra Dash (au sol, en l'air, en annulation),
//  Ninjutsu ↑/↓, Technique ultime, charge du chakra, garde, parade, roulade, substitution, double saut, soutiens.
// ============================================================
import { supReady, TEAM_COST } from './support.js';

const NEUTRAL = () => ({ l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, high: 0, low: 0, side: 0, special: 0, move2: 0, super: 0, sq: 0, cdash: 0, cshuriken: 0, charge: 0, sub: 0, throw: 0, sup1: 0, sup2: 0 });
const REACT = [46, 34, 24, 15, 8];
const BLOCK = [0.04, 0.18, 0.38, 0.6, 0.82];
const CHAIN = [0.35, 0.55, 0.7, 0.85, 0.95];
const AGGR = [0.35, 0.5, 0.62, 0.78, 0.9];
const PARRY_CH = [0, 0.05, 0.12, 0.2, 0.3];   // chance de parade volontaire par niveau
const SUB_CH = [0, 0.02, 0.05, 0.08, 0.12];   // chance par frame de substituer un coup sur le point de toucher
const ROLL_CH = [0, 0.03, 0.06, 0.1, 0.14];   // chance de rouler pour éviter une menace

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

    // ultime d'équipe : les deux soutiens prêts et assez de chakra
    if (f.sup && f.chi >= TEAM_COST && supReady(f, 0) && supReady(f, 1) && dist < 420 && R() < 0.003 * (1 + L)) { inp.sup1 = 1; inp.sup2 = 1; }

    // substitution (L2) : esquive un coup sur le point de toucher, ou s'échappe d'un combo
    if (f.subCharges > 0) {
      if ((f.state === 'hit' || f.state === 'launch') && R() < 0.004 * L) inp.sub = 1;
      else if (e.state === 'atk' && e.move && e.move.dmg !== undefined && dist < 120) {
        const rem = e.move.su - e.t;
        if (rem >= 0 && rem <= 4 && R() < SUB_CH[L]) inp.sub = 1;
      }
    }

    if (f.state === 'atk') {                       // enchaînements : chaînes de ○, Chakra Dash, Ninjutsu, Technique ultime
      const m = f.move;
      if (m && f.connected && !m.special && !m.super) {
        const r = R();
        if (f.y <= 0 && f.chi >= 50 && r < 0.03 * this.lv) inp.super = 1;
        else if (f.chi >= 20 && r < 0.025 * this.lv) inp.cdash = 1;       // Chakra Dash : prolonge ou poursuit
        else if (f.chi >= 10 && r < 0.03 * this.lv) inp.special = 1;
        else if (m.cancels && R() < CHAIN[L]) {
          if (m.id && f.y <= 0 && R() < 0.12 * this.lv / 2) { inp.punch = 1; inp.kick = 1; }
          else { const ks = Object.keys(m.cancels); inp[ks[(R() * ks.length) | 0]] = 1; }
        }
      }
      return inp;
    }
    if (f.y > 0) {                                  // en l'air : double saut, Chakra Dash de poursuite, coups aériens, tirs
      if (f.airJumps < 1 && f.vy < 4 && (e.y - f.y > 50 || dist > 160) && R() < 0.05) inp.u = 1;
      else if (f.chi >= 20 && dist < 320 && (e.y > 25 || dist > 130) && R() < 0.03 + 0.015 * L) inp.cdash = 1;
      else if (dist < 100 && R() < 0.2) inp[R() < 0.6 ? 'punch' : 'low'] = 1;
      else if (dist > 140 && f.chi >= 20 && R() < 0.02) inp.cshuriken = 1;
      else if (dist > 120 && R() < 0.03) inp.sq = 1;
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
      case 'roll': if (!p.done) { inp.d = 1; inp[p.dirv > 0 ? 'r' : 'l'] = 1; p.done = true; } break;
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
    const threat = w.threatNear(f);
    if (threat && R() < ROLL_CH[L]) return set('roll', 10, { dirv: R() < 0.5 ? dir : -dir });   // roulade : passe sous le coup ou s'en éloigne
    if (threat && R() < blk) return set('block', 16 + Math.floor(R() * 12));
    if (e.y > 25 && dist < 110 && R() < 0.2 + L * 0.1) return set('press', 14, { key: 'high' });   // anti-aérien : chaîne haute (uppercut)
    if (e.y > 40 && dist > 70 && dist < 320 && f.chi >= 10 && R() < 0.15 + L * 0.08) return set('press', 16, { key: 'special', up: true });   // Ninjutsu ↑ anti-aérien
    if (f.chi >= 50 && R() < 0.1 + L * 0.06 && dist < 420) return set('press', 40, { key: 'super' });
    // adversaire qui garde au contact : la projection passe la garde
    if ((e.state === 'block' || e.state === 'blockstun') && dist < 56 && R() < (0.3 + L * 0.08) * P.throw) return set('press', react + 2, { key: 'throw' });
    if (R() > aggr) return set(R() < 0.5 ? 'retreat' : 'wait', react);
    if (P.keepAway && dist < 140 && R() < 0.35) return set('retreat', react);   // zoner : garde ses distances
    if (f.awakenReady && dist > 110 && R() < 0.5) return set('charge', 90);   // Éveil : charge jusqu'au chakra plein
    if (dist > 220 && f.chi < 60 && R() < 0.1) return set('charge', 40 + Math.floor(R() * 40));   // recharge le chakra quand l'adversaire est loin

    if (dist > 300) {
      const r = R();
      if (r < 0.3 * P.sp && f.chi >= 10) return set('press', react + 10, { key: 'special', down: R() < 0.25 });
      if (r < 0.4) return set('jump', react + 20, { dirv: dir });
      return set('approach', react + 10);
    }
    if (dist > 120) {
      const q = R();
      if (q < 0.10) return set('press', react + 4, { key: 'sq' });                                              // Shuriken
      if (q < 0.16 && f.chi >= 20) return set('press', react + 6, { key: 'cdash' });                           // Chakra Dash pour fermer la distance
      if (q < 0.21 && f.chi >= 20) return set('press', react + 6, { key: 'cshuriken' });                       // Chakra Shuriken
      const r = R();
      if (r < 0.22 * P.sp && f.chi >= 10) return set('press', react + 8, { key: 'special', down: R() < 0.3 });
      if (r < 0.42 && f.chi >= 15) return set('press', react + 12, { key: 'move2' });
      if (r < 0.5) return set('jump', react + 20, { dirv: dir });
      return set('approach', react);
    }
    if (dist < 52 && R() < (0.06 + L * 0.03) * P.throw) return set('press', react + 4, { key: 'throw' });   // projection
    const r = R();
    if (r < 0.32) return set('press', react, { key: 'punch' });                                                // chaîne normale
    if (r < 0.44) return set('press', react + 4, { key: 'side' });                                             // chaîne latérale
    if (r < 0.54) return set('press', react + 4, { key: 'low' });                                              // chaîne basse
    if (r < 0.62) return set('press', react + 6, { key: 'high' });                                             // chaîne haute
    if (r < 0.68) return set('press', react + 6, { key: 'kick' });
    if (r < 0.74 && f.chi >= 15) return set('press', react + 8, { key: 'move2' });
    if (r < 0.90) return set('block', 14);
    return set('retreat', react);
  }
}
