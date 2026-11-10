// ============================================================
//  WORLD : combattants + projectiles + événements (logique pure)
//  Les soutiens (f.support) sont des combattants à part : ils ne sont pas des cibles (enemiesOf / nearestEnemy),
//  ne comptent pas dans l'équipe (team), ne se bousculent pas (separate) ; hors-jeu (f.out) ils ne sont pas mis à jour.
// ============================================================
export const HALF = 640;      // demi-largeur de l'arène
export const MAXD = 560;      // écart maximum entre deux combattants
export const NOIN = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0 };

const overlap = (a, b) => !(a.x1 < b.x0 || a.x0 > b.x1 || a.y1 < b.y0 || a.y0 > b.y1);

export class World {
  constructor(seed = 12345) {
    this.fighters = []; this.projs = []; this.events = [];
    this.hitstop = 0; this.frame = 0; this.half = HALF; this.pid = 0; this._s = seed >>> 0;
  }
  rnd() { // mulberry32
    let t = (this._s += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  event(e) { this.events.push(e); }
  add(f) { f.slot = this.fighters.length; f.w = this; this.fighters.push(f); return f; }

  enemiesOf(f) { return this.fighters.filter((e) => e.team !== f.team && e.hp > 0 && !e.support); }
  nearestEnemy(f) {
    let best = null, bd = 1e9;
    for (const e of this.fighters) {
      if (e.team === f.team || e.hp <= 0 || e.support) continue;
      const d = Math.abs(e.x - f.x);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  team(t) { return this.fighters.filter((f) => f.team === t && !f.support); }
  teamHp(t) { return this.team(t).reduce((s, f) => s + Math.max(0, f.hp), 0); }
  teamMax(t) { return this.team(t).reduce((s, f) => s + f.maxHp, 0); }
  teamDown(t) { return this.team(t).every((f) => f.hp <= 0); }
  teamSettled(t) { return this.team(t).every((f) => f.hp <= 0 && f.dead); }

  threatNear(f) {
    for (const e of this.fighters) if (e.team !== f.team && e.hp > 0 && e.state === 'atk' && Math.abs(e.x - f.x) < 150 && (f.x - e.x) * e.face > 0) return true;
    for (const p of this.projs) if (p.team !== f.team && Math.abs(p.x - f.x) < 150 && (f.x - p.x) * p.vx > 0) return true;
    return false;
  }

  spawnProj(owner, d) {
    const p = {
      id: ++this.pid, owner, team: owner.team, type: 'orb', x: 0, y: 40, w: 20, h: 20, vx: 0, vy: 0,
      dmg: 40, life: 60, pierce: 0, rehit: 999, grav: 0, homing: 0, stun: 18, kb: 4, launch: null, unblock: false,
      explode: false, gain: 3, age: 0, dead: false, cd: new Map(), ...d,
    };
    this.projs.push(p);
    return p;
  }

  update(inputs) {
    if (this.hitstop > 0) { this.hitstop--; for (const f of this.fighters) if (!f.out) f.feed(inputs[f.slot] || NOIN, true); return false; }
    this.frame++;
    for (const f of this.fighters) if (!f.out) f.update(this, inputs[f.slot] || NOIN);
    this.updateProjs();
    this.separate();
    return true;
  }

  updateProjs() {
    for (const p of this.projs) {
      p.age++;
      if (p.homing) {
        const e = this.nearestEnemy(p.owner);
        if (e) {
          const dx = e.x - p.x, dy = e.y + 36 - p.y, d = Math.hypot(dx, dy) || 1, sp = Math.max(4, Math.hypot(p.vx, p.vy));
          p.vx += (dx / d * sp - p.vx) * p.homing; p.vy += (dy / d * sp - p.vy) * p.homing;
        }
      }
      p.vy -= p.grav; p.x += p.vx; p.y += p.vy; p.life--;
      for (const [k, v] of p.cd) p.cd.set(k, v - 1);
      const box = { x0: p.x - p.w / 2, x1: p.x + p.w / 2, y0: p.y - p.h / 2, y1: p.y + p.h / 2 };
      for (const e of (p.fxOnly ? [] : this.enemiesOf(p.owner))) {
        if ((p.cd.get(e.slot) || 0) > 0) continue;
        if (!overlap(box, e.hurt())) continue;
        const r = e.receive(p.owner, p, p.x - Math.sign(p.vx || 1) * 6, this);
        if (r === 'miss') continue;
        p.cd.set(e.slot, p.rehit);
        if (r === 'hit' || r === 'ko') p.owner.connected = true;
        if (p.pierce <= 0) { p.dead = true; break; }
        p.pierce--;
      }
      if (!p.dead && p.grav && p.y - p.h / 2 <= 0) p.dead = true;
      if (!p.dead && (p.life <= 0 || Math.abs(p.x) > this.half + 340)) p.dead = true;
      if (p.dead && p.explode) this.explode(p);
    }
    // choc de projectiles
    const ps = this.projs;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j];
      if (a.dead || b.dead || a.team === b.team || a.rain || b.rain || a.fxOnly || b.fxOnly || a.type === 'pillar' || b.type === 'pillar' || a.type === 'shock' || b.type === 'shock') continue;
      if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2) {
        const lo = a.dmg <= b.dmg ? a : b, hi = lo === a ? b : a;
        lo.dead = true; hi.dmg -= lo.dmg * 0.5; if (hi.dmg < 12 || Math.abs(a.dmg - b.dmg) < 8) hi.dead = true;
        this.event({ t: 'clash', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        if (lo.explode) this.explode(lo); if (hi.dead && hi.explode) this.explode(hi);
      }
    }
    this.projs = this.projs.filter((p) => !p.dead);
  }

  explode(p) {
    if (p.exploded) return; p.exploded = true;
    this.spawnProj(p.owner, { type: 'shock', x: p.x, y: Math.max(40, p.y), w: 120, h: 120, vx: 0, vy: 0, dmg: 55, life: 5, pierce: 99, rehit: 999, launch: { vx: 4, vy: 6 }, stun: 20, gain: 2 });
    this.event({ t: 'boom', x: p.x, y: Math.max(30, p.y), f: p.owner });
  }

  separate() {
    const fs = this.fighters;
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
      const a = fs[i], b = fs[j];
      if (a.team === b.team || a.hp <= 0 || b.hp <= 0 || a.support || b.support) continue;
      if (a.y > 50 || b.y > 50 || a.state === 'down' || b.state === 'down') continue;
      const min = (14 * a.scale + 14 * b.scale) * 1.15, dx = b.x - a.x, over = min - Math.abs(dx);
      if (over > 0) {
        const s = dx >= 0 ? 1 : -1; let pa = over / 2, pb = over / 2;
        if (a.x - pa < -this.half) { pb += pa; pa = 0; } if (a.x + pa > this.half) { pb += pa; pa = 0; }
        if (b.x + pb > this.half) { pa += pb; pb = 0; } if (b.x - pb < -this.half) { pa += pb; pb = 0; }
        a.x -= s * pa; b.x += s * pb;
      }
    }
    const alive = fs.filter((f) => f.hp > 0 && !f.support);
    if (alive.length > 1) {
      let mn = 1e9, mx = -1e9; for (const f of alive) { mn = Math.min(mn, f.x); mx = Math.max(mx, f.x); }
      if (mx - mn > MAXD) { const c = (mn + mx) / 2; for (const f of alive) f.x = Math.max(c - MAXD / 2, Math.min(c + MAXD / 2, f.x)); }
    }
  }
}
