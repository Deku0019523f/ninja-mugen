// ============================================================
//  FIGHTER : machine à états d'un combattant (logique pure, sans rendu)
//  États : idle walk jump block charge atk hit blockstun launch down getup ko intro win
// ============================================================
import { MOVES, BTN, getMove } from './moves.js';

const WALK = 2.6, BACK = 0.8, JUMPV = 11.8, GRAV = 0.5;
const ROLL_T = 24, ROLL_V = 7.2, ROLL_INV = 14;      // roulade : durée, vitesse, frames d'invulnérabilité
const PARRY = 6;        // parade parfaite : fenêtre (frames) après un appui sur ↓ / R2
const THROW_R = 52;     // projection : distance maximale (R2 + ○)
const CHARGE_RATE = 0.5;   // chakra gagné par frame en chargeant (△ maintenu) : 0 → 100 en ~3,5 s
const SUB_MAX = 3, SUB_REGEN = 300;     // substitution : réserve de charges, +1 charge toutes les 5 s
const GUARD_MAX = 100, GUARD_DECAY = 0.35, GUARD_PER_DMG = 0.55;   // jauge de garde : plafond, récupération par frame hors garde, usure par point de dégâts
const BREAK_STUN = 55;  // étourdissement après une garde brisée (frames)
// Coups normaux : le buffer vaut 8 à l'appui puis décroît d'1 par frame. Le coup part quand il est <= TAP.
// 7 = 1 frame après l'appui (le temps de détecter Poing+Pied simultanés) ; 5 = ancien réglage (3 frames).
const TAP = 7;

export class Fighter {
  constructor(char, team) {
    this.char = char; this.team = team; this.slot = 0; this.w = null;
    this.maxHp = Math.round(1000 * char.def);
    this.hp = this.maxHp; this.chi = 0;
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.face = 1; this.scale = 1;
    this.state = 'idle'; this.t = 0; this.stun = 0; this.move = null;
    this.hitSet = new Set(); this.connected = false; this.lock = null;
    this.buf = { punch: 0, kick: 0, special: 0, move2: 0, super: 0, sq: 0, cdash: 0, cshuriken: 0, sub: 0, throw: 0 };
    this.invuln = 0; this.combo = 0; this.juggle = 0; this.chain = 0; this.chainT = 0;
    this.buff = null; this.buffT = 0; this.dmgMul = 1; this.spdMul = char.spd; this.defMul = 1;
    this.fade = false; this.fx = null; this.dying = false; this.dead = false;
    this.infiniteChi = false; this.rounds = 0;
    this.parryT = 0; this.dPrev = false; this.dEdge = false; this.backT = 99;
    this.subCharges = SUB_MAX; this.subT = 0; this.guard = 0; this.airJumps = 0; this.uPrev = false; this.uEdge = false;
  }

  get alive() { return this.hp > 0; }
  get beamOn() { const m = this.move; return this.state === 'atk' && m && m.beam && this.t >= m.su && this.t < m.su + m.ac; }

  prepare(x, face, keepHp = false) {
    if (!keepHp) this.hp = this.maxHp;
    this.endBuff(); this.x = x; this.y = 0; this.vx = this.vy = 0; this.face = face;
    this.state = 'idle'; this.t = 0; this.move = null; this.invuln = 0; this.combo = 0; this.chain = 0; this.chainT = 0;
    this.dying = false; this.dead = false; this.fade = false; this.lock = null; this.juggle = 0;
    this.parryT = 0; this.dPrev = false; this.dEdge = false; this.backT = 99;
    this.subCharges = SUB_MAX; this.subT = 0; this.guard = 0; this.airJumps = 0; this.uPrev = false; this.uEdge = false;
    for (const b of BTN) this.buf[b] = 0;
  }

  setState(s) { this.state = s; this.t = 0; }
  go(s) { if (this.state !== s) this.setState(s); }
  free() { this.combo = 0; this.juggle = 0; this.setState(this.y > 0 ? 'jump' : 'idle'); }

  hurt() {
    const s = this.scale, lying = this.state === 'down' || this.state === 'ko';
    const hh = lying ? 20 : this.state === 'block' ? 58 : 70;
    return { x0: this.x - 14 * s, x1: this.x + 14 * s, y0: this.y, y1: this.y + hh * s };
  }

  setBuff(kind, frames) {
    this.endBuff(); this.buff = kind; this.buffT = frames;
    if (kind === 'giant') { this.scale = 1.7; this.dmgMul = 1.4; this.spdMul = this.char.spd * 0.85; this.defMul = 1.4; }
    else { this.dmgMul = 1.35; this.spdMul = this.char.spd * 1.25; this.defMul = 1.1; }
    this.w.event({ t: 'buff', f: this });
  }
  endBuff() { this.buff = null; this.buffT = 0; this.scale = 1; this.dmgMul = 1; this.spdMul = this.char.spd; this.defMul = 1; }

  take(b, cost = 0) {
    if (this.buf[b] > 0 && this.chi >= cost) { this.buf[b] = 0; return true; }
    return false;
  }

  // ---------------------------------------------------------- frame
  feed(inp, frozen = false) { for (const b of BTN) this.buf[b] = inp[b] ? 8 : frozen ? this.buf[b] : Math.max(0, this.buf[b] - 1); }

  update(w, inp) {
    this.t++;
    this.feed(inp);
    if (this.invuln > 0) this.invuln--;
    if (this.chainT > 0 && --this.chainT === 0) this.chain = 0;
    this.fx = null;
    // front montant de ↓ / R2 (parade parfaite), de ↑ / ✕ (double saut) et mémoire du « arrière » (projection de l'IA)
    this.dEdge = !!inp.d && !this.dPrev; this.dPrev = !!inp.d;
    this.uEdge = !!inp.u && !this.uPrev; this.uPrev = !!inp.u;
    const dirIn = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
    if (dirIn !== 0 && dirIn !== this.face) this.backT = 0; else this.backT = Math.min(99, this.backT + 1);
    if (this.parryT > 0) this.parryT--;
    // substitution : la réserve se recharge ; hors garde la jauge de garde se vide
    if (this.subCharges < SUB_MAX) { if (++this.subT >= SUB_REGEN) { this.subCharges++; this.subT = 0; } } else this.subT = 0;
    if (this.guard > 0 && this.state !== 'block' && this.state !== 'blockstun') this.guard = Math.max(0, this.guard - GUARD_DECAY);
    // substitution (L2) pour s'échapper d'un combo : étourdi, bloqué ou projeté
    if (this.buf.sub > 0 && this.subCharges > 0 && this.hp > 0 && !this.dying && (this.state === 'hit' || this.state === 'launch' || this.state === 'blockstun')) this.substitute(w, w.nearestEnemy(this));
    if (this.buff) {
      if (this.buff === 'power' && this.hp > 0) this.hp = Math.min(this.maxHp, this.hp + 0.12);
      if (--this.buffT <= 0) this.endBuff();
    }
    this.chi = this.infiniteChi ? 100 : Math.min(100, this.chi + 0.035);

    const rollNow = inp.d && (inp.l ? 1 : 0) !== (inp.r ? 1 : 0) ? (inp.r ? 1 : -1) : 0;   // ↙ / ↘ (bas + direction)
    this.rollEdge = rollNow !== 0 && rollNow !== this.rollPrev;
    switch (this.state) {
      case 'idle': case 'walk': case 'jump': case 'block': case 'charge': this.control(w, inp); break;
      case 'roll':
        this.vx = this.rollDir * (this.t < ROLL_T - 6 ? ROLL_V : ROLL_V * 0.4);
        if (this.t >= ROLL_T) this.free();
        break;
      case 'atk': this.runMove(w); break;
      case 'hit': case 'blockstun': if (this.t >= this.stun) this.free(); break;
      case 'down': if (this.t >= 34) { this.setState('getup'); this.invuln = Math.max(this.invuln, 22); } break;
      case 'getup': if (this.t >= 14) this.free(); break;
      default: break;
    }
    this.rollPrev = rollNow;
    this.physics(w);
  }

  control(w, inp) {
    const e = w.nearestEnemy(this);
    const air = this.y > 0;
    if (!air && e && Math.abs(e.x - this.x) > 4) this.face = e.x > this.x ? 1 : -1;
    const dir = (inp.r ? 1 : 0) - (inp.l ? 1 : 0), spd = WALK * this.spdMul;

    if (air) {
      this.go('jump');
      // double saut : ✕ puis ✕ (nouvel appui en l'air)
      if (this.uEdge && this.airJumps < 1 && !this.dying) {
        this.airJumps++; this.vy = JUMPV * 0.88; this.vx = dir * spd * 1.15;
        w.event({ t: 'jump', x: this.x }); w.event({ t: 'puff', x: this.x, y: this.y + 10, color: '#cfe8ff' });
        return;
      }
      if (this.take('punch')) return this.startMove('apunch');
      if (this.take('kick')) return this.startMove('akick');
      if (this.take('cshuriken', 20)) return this.startMove('cshuriken');
      if (this.take('special', 10)) return this.startMove('special');
      if (this.take('sq')) return this.startMove('shuriken');
      return;
    }
    if (this.take('super', 50)) return this.startMove('super');
    if (this.take('move2', 15)) return this.startMove('move2');
    if (this.take('cdash', 20)) return this.startMove('cdash');           // Chakra Dash (△ + ✕)
    if (this.take('cshuriken', 20)) return this.startMove('cshuriken');   // Chakra Shuriken (△ + □)
    // Spécial / Ninjutsu : ↑ = tir en diagonale (anti-aérien), ↓ = tir bas, sinon tir normal
    if (this.take('special', 10)) return this.startMove(inp.u ? 'special_up' : inp.d ? 'special_down' : 'special');
    if (this.buf.punch > 0 && this.buf.kick > 0) { this.buf.punch = this.buf.kick = 0; return this.startMove('smash'); }
    // Projection (R2 + ○) : au contact elle passe la garde (adversaire au sol ; la roulade ou la substitution l'esquivent), sinon simple Poing
    if (this.buf.throw > 0 && this.take('throw')) return this.startMove(e && e.y <= 0 && Math.abs(e.x - this.x) < THROW_R ? 'throw' : 'punch1');
    // Projection de l'IA : arrière + Poing au contact
    if (this.backT <= 8 && this.buf.punch > 0 && this.buf.punch <= TAP && e && e.y <= 0 && Math.abs(e.x - this.x) < THROW_R && this.take('punch')) return this.startMove('throw');
    if (this.buf.punch > 0 && this.buf.punch <= TAP && this.take('punch')) return this.startMove(inp.d ? 'upper' : 'punch1');
    if (this.buf.kick > 0 && this.buf.kick <= TAP && this.take('kick')) return this.startMove(inp.d ? 'sweep' : 'kick');
    if (this.take('sq')) return this.startMove('shuriken');                // Shuriken (□)

    if (this.rollEdge && dir) {                       // roulade vers l'avant / l'arrière
      this.rollDir = dir; this.setState('roll'); this.invuln = Math.max(this.invuln, ROLL_INV); this.combo = 0;
      w.event({ t: 'jump', x: this.x }); return;
    }
    const back = dir !== 0 && dir !== this.face;
    if (inp.d || (back && w.threatNear(this))) {
      if (inp.d && this.dEdge) this.parryT = PARRY;   // appui frais sur ↓ / R2 : fenêtre de parade parfaite
      this.go('block'); this.vx *= 0.6; return;
    }
    if (inp.u) { this.airJumps = 0; this.vy = JUMPV; this.vx = dir * spd * 1.15; this.setState('jump'); w.event({ t: 'jump', x: this.x }); return; }
    if (inp.charge) {                                  // △ maintenu : charge le chakra (immobile, vulnérable)
      this.vx *= 0.6; this.go('charge'); this.chi = Math.min(100, this.chi + CHARGE_RATE);
      if (this.t % 8 === 1) w.event({ t: 'puff', x: this.x, y: 14, color: '#6cf' });
      return;
    }
    if (dir) { this.vx = dir * spd * (dir === this.face ? 1 : BACK); this.go('walk'); }
    else { this.vx *= 0.6; this.go('idle'); }
  }

  startMove(key) {
    const m = getMove(this, key);
    if (!m) return false;
    if (m.cost) { if (this.chi < m.cost) return false; this.chi -= m.cost; }
    this.move = m; this.setState('atk'); this.hitSet.clear(); this.connected = false; this.lock = null;
    if (m.inv) this.invuln = Math.max(this.invuln, m.inv);
    if (m.super) {
      this.invuln = Math.max(this.invuln, m.su + 4);
      this.w.hitstop = 34;
      this.w.event({ t: 'super', f: this });
    }
    if (m.onStart) m.onStart(this, this.w);
    if (m.pose === 'cast' || m.pose === 'dash') this.w.event({ t: 'whoosh', x: this.x });
    return true;
  }

  endMove() { this.move = null; this.fade = false; this.lock = null; this.free(); }

  runMove(w) {
    const m = this.move, t = this.t;
    if (!m) return this.free();
    if (t === m.su) {
      if (m.hop) this.vy = m.hop;
      if (m.adv && this.y <= 0) this.vx += this.face * m.adv;
      if (m.onFire) m.onFire(this, w);
      if (m.snd) w.event({ t: 'swing', x: this.x, snd: m.snd });
    }
    const k = t - m.su;
    if (k >= 0 && k < m.ac) {
      if (m.every && k % m.every === 0) this.hitSet.clear();
      if (m.onTick) m.onTick(this, w, k);
      if (m.dmg !== undefined) this.checkHits(w, m, k);
    }
    // fin anticipée à l'atterrissage
    if ((m.landEnds || m.air) && this.y <= 0 && this.vy <= 0 && t > m.su + 2 && k < m.ac) {
      if (m.onLand) m.onLand(this, w);
      this.t = m.su + m.ac;
    }
    // annulations : après un coup au but, on enchaîne avec un AUTRE bouton
    if (this.connected && !m.special && !m.super && !m.landEnds && !m.beam && t >= m.su + 1) {
      const B = this.buf, ground = this.y <= 0;
      if (ground && B.super > 0 && this.chi >= 50) { B.super = 0; return void this.startMove('super'); }
      if (ground && B.move2 > 0 && this.chi >= 15) { B.move2 = 0; return void this.startMove('move2'); }
      if (B.special > 0 && this.chi >= 10) { B.special = 0; return void this.startMove('special'); }
      if (ground && m.id !== 'smash' && B.punch > 0 && B.kick > 0) { B.punch = B.kick = 0; return void this.startMove('smash'); }
      const c = m.cancels;
      if (c) {
        if (B.punch > 0 && c.punch) { B.punch = 0; return void this.startMove(c.punch); }
        if (B.kick > 0 && c.kick) { B.kick = 0; return void this.startMove(c.kick); }
      }
    }
    if (this.t >= m.su + m.ac + m.re) this.endMove();
  }

  checkHits(w, m, k) {
    const s = this.scale;
    let x0, x1;
    if (m.aoe) { x0 = this.x - m.rx * s; x1 = this.x + m.rx * s; }
    else { const a = this.x + this.face * m.ox * s, b = this.x + this.face * m.rx * s; x0 = Math.min(a, b); x1 = Math.max(a, b); }
    const y0 = this.y + m.y0 * s, y1 = this.y + m.y1 * s;
    let d = m;
    if (m.every && m.last && k >= Math.floor((m.ac - 1) / m.every) * m.every) d = { ...m, ...m.last };
    for (const e of w.enemiesOf(this)) {
      if (this.hitSet.has(e.slot)) continue;
      const h = e.hurt();
      if (x1 < h.x0 || x0 > h.x1 || y1 < h.y0 || y0 > h.y1) continue;
      const r = e.receive(this, d, this.x, w);
      if (r === 'miss') continue;
      this.hitSet.add(e.slot);
      if (r === 'hit' || r === 'ko') this.connected = true;
    }
  }

  // ---------------------------------------------------------- substitution (L2)
  // Une bûche prend le coup : le combattant réapparaît derrière l'attaquant, brièvement invulnérable. Coûte 1 charge.
  substitute(w, att) {
    this.buf.sub = 0; this.subCharges--; this.subT = 0; this.guard = 0;
    const ox = this.x, oy = this.y;
    const nx = att ? att.x - att.face * 70 : this.x - this.face * 70;
    this.x = Math.max(-w.half + 20, Math.min(w.half - 20, nx));
    if (att) this.face = att.x >= this.x ? 1 : -1;
    this.y = 0; this.vx = 0; this.vy = 0; this.move = null; this.fade = false; this.lock = null; this.combo = 0; this.juggle = 0;
    this.setState('idle'); this.invuln = Math.max(this.invuln, 22);
    w.event({ t: 'puff', x: ox, y: oy + 40, color: '#a87b4a' });
    w.event({ t: 'puff', x: this.x, y: 40, color: '#e8e8e8' });
    w.event({ t: 'sub', x: this.x, f: this });
  }

  // ---------------------------------------------------------- parade parfaite
  // Le défenseur a tapé ↓ / R2 juste avant l'impact : aucun dégât, +12 chakra, -25 de jauge de garde, l'attaquant (corps à corps) est déséquilibré.
  parry(att, d, w) {
    this.parryT = 0; this.chi = Math.min(100, this.chi + 12); this.vx = 0; this.guard = Math.max(0, this.guard - 25);
    if (!d.owner && att.state === 'atk') {
      const away = att.x <= this.x ? -1 : 1;
      att.move = null; att.fade = false; att.lock = null; att.connected = false;
      att.setState('hit'); att.stun = 22; att.vx = away * 2.5;
    }
    w.event({ t: 'clash', x: this.x + this.face * 16, y: this.y + 44, parry: true });
    w.hitstop = Math.max(w.hitstop, 9);
    return 'parry';
  }

  // ---------------------------------------------------------- dégâts
  receive(att, d, srcX, w) {
    if (this.state === 'ko' || this.dead || this.hp <= 0 && this.state !== 'launch') return 'miss';
    if (this.invuln > 0 || this.state === 'down' || this.state === 'getup') return 'miss';
    if (d.ground && this.y > 0) return 'miss';        // la projection ne touche pas un adversaire en l'air
    // substitution (L2) pressée juste avant l'impact : le coup tombe sur la bûche
    if (this.buf.sub > 0 && this.subCharges > 0) { this.substitute(w, att); return 'miss'; }
    const dir = this.x >= srcX ? 1 : -1;
    const front = (srcX - this.x) * this.face > 0;
    const guarding = this.state === 'block' || this.state === 'blockstun';
    if (guarding && front && !d.unblock && this.y <= 0) {
      if (this.state === 'block' && this.parryT > 0 && !d.super) return this.parry(att, d, w);
      this.guard += d.dmg * GUARD_PER_DMG;
      if (this.guard < GUARD_MAX) {
        this.hp -= Math.min(d.dmg * 0.08, Math.max(0, this.hp - 1));
        this.chi = Math.min(100, this.chi + 2.5); att.chi = Math.min(100, att.chi + 1);
        this.setState('blockstun'); this.stun = Math.max(9, (d.stun || 14) * 0.6);
        this.vx = dir * ((d.kb || 3) * 1.1 + 1);
        w.event({ t: 'block', x: this.x + this.face * 16, y: this.y + 40 });
        w.hitstop = Math.max(w.hitstop, 3);
        return 'block';
      }
      // garde brisée : le coup passe et le combattant reste étourdi (l'adversaire enchaîne)
      this.guard = 0;
      d = { ...d, stun: Math.max(d.stun || 16, BREAK_STUN), launch: null };
      w.event({ t: 'break', x: this.x + this.face * 16, y: this.y + 44 });
      w.event({ t: 'clash', x: this.x + this.face * 16, y: this.y + 44 });
    }
    const armored = this.state === 'atk' && this.move && this.move.super && this.t >= this.move.su;
    const sc = Math.max(0.3, 1 - 0.07 * this.combo);
    const dmg = d.dmg * sc * att.dmgMul * att.char.pow / this.defMul;
    this.hp -= dmg; this.combo++;
    att.chain = att.chainT > 0 ? att.chain + 1 : 1; att.chainT = 90; att.lastTarget = this;
    att.chi = Math.min(100, att.chi + (d.gain ?? 4)); this.chi = Math.min(100, this.chi + 3);
    let launch = d.launch;
    if (this.state === 'launch') { this.juggle++; if (this.juggle > 3) launch = { vx: (launch && launch.vx) || 2, vy: -2 }; }
    const big = !!launch || dmg > 55;
    w.event({ t: 'hit', x: this.x, y: this.y + 40 * this.scale, big, snd: d.snd, dir });
    w.hitstop = Math.max(w.hitstop, big ? 7 : 4);
    if (this.hp <= 0) {
      this.hp = 0; this.dying = true; this.move = null; this.fade = false;
      const L = launch || { vx: 6, vy: 8 };
      this.setState('launch'); this.vx = dir * Math.max(5, L.vx); this.vy = Math.max(7, L.vy); this.y = Math.max(this.y, 0.01);
      w.hitstop = 16; w.event({ t: 'ko', f: this });
      return 'ko';
    }
    if (armored) return 'hit';
    this.move = null; this.fade = false; this.lock = null;
    if (launch || this.y > 0) {
      const L = launch || { vx: d.kb || 2, vy: 3 };
      this.setState('launch'); this.vx = dir * L.vx; this.vy = L.vy;
      if (this.y <= 0) { this.y = 0.01; this.vy = Math.max(this.vy, 3); }
    } else {
      this.setState('hit'); this.stun = d.stun || 16; this.vx = dir * (d.kb || 2.5);
    }
    return 'hit';
  }

  // ---------------------------------------------------------- physique
  physics(w) {
    const wasAir = this.y > 0 || this.vy !== 0;
    if (wasAir) this.vy -= GRAV;
    this.x += this.vx; this.y += this.vy;
    if (this.y <= 0 && wasAir) {
      this.y = 0; const fell = this.vy < 0; this.vy = 0;
      if (fell) this.landed(w);
    }
    if (this.y === 0) {
      const st = this.state;
      if (st === 'hit' || st === 'blockstun' || st === 'down' || st === 'getup' || st === 'ko') this.vx *= 0.82;
      else if (st === 'atk') { if (!(this.move && this.move.onTick && this.move.id === 'dash')) this.vx *= 0.8; }
      else if (st !== 'walk' && st !== 'jump' && st !== 'roll') this.vx *= 0.7;
    }
    if (this.x < -w.half) { this.x = -w.half; this.vx = 0; }
    if (this.x > w.half) { this.x = w.half; this.vx = 0; }
  }

  landed(w) {
    this.airJumps = 0;
    w.event({ t: 'land', x: this.x, big: this.state === 'launch' });
    if (this.state === 'launch') {
      if (this.dying) { this.setState('ko'); this.dead = true; this.vx *= 0.5; w.event({ t: 'quake', x: this.x }); }
      else { this.setState('down'); this.combo = 0; this.juggle = 0; }
    } else if (this.state === 'jump') { this.setState('idle'); this.vx *= 0.4; }
  }
}
