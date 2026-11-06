// ============================================================
//  TABLE DES COUPS (en frames @60 Hz)
//  su = startup, ac = frames actives, re = récupération
//  Hitbox : de ox à rx devant le combattant, de y0 à y1 au-dessus des pieds
// ============================================================
import { ARCH } from '../data/roster.js';

export const BTN = ['punch', 'kick', 'special', 'move2', 'super'];

export const MOVES = {
  punch1: { pose: 'punch', su: 4, ac: 3, re: 9, dmg: 32, ox: 6, rx: 46, y0: 30, y1: 64, kb: 2.4, stun: 16, chain: 'punch2', gain: 4, snd: 'punch' },
  punch2: { pose: 'punch2', su: 4, ac: 3, re: 9, dmg: 36, ox: 6, rx: 46, y0: 30, y1: 64, kb: 2.6, stun: 16, chain: 'punch3', gain: 4, snd: 'punch' },
  punch3: { pose: 'punch3', su: 6, ac: 4, re: 16, dmg: 54, ox: 6, rx: 54, y0: 26, y1: 66, kb: 5, stun: 22, launch: { vx: 3.2, vy: 4.5 }, gain: 6, snd: 'kick' },
  kick: { pose: 'kick', su: 9, ac: 4, re: 15, dmg: 62, ox: 10, rx: 64, y0: 18, y1: 58, kb: 6, stun: 22, launch: { vx: 4, vy: 3 }, gain: 6, snd: 'kick' },
  sweep: { pose: 'sweep', su: 7, ac: 5, re: 17, dmg: 46, ox: 10, rx: 66, y0: 0, y1: 16, launch: { vx: 2.5, vy: 6 }, gain: 5, snd: 'kick' },
  upper: { pose: 'upper', su: 5, ac: 6, re: 20, dmg: 58, ox: 0, rx: 34, y0: 20, y1: 110, launch: { vx: 1.8, vy: 12.5 }, inv: 10, hop: 5, gain: 6, snd: 'kick' },
  apunch: { air: true, pose: 'apunch', su: 3, ac: 10, re: 4, dmg: 38, ox: 4, rx: 48, y0: 20, y1: 62, kb: 3, stun: 15, gain: 4, snd: 'punch' },
  akick: { air: true, pose: 'akick', su: 5, ac: 10, re: 5, dmg: 55, ox: 4, rx: 56, y0: -8, y1: 42, launch: { vx: 3.5, vy: -3 }, gain: 5, snd: 'kick' },
};

for (const [k, v] of Object.entries(MOVES)) v.id = k;

export const SPECIAL = { id: 'special', pose: 'cast', su: 13, ac: 1, re: 22, cost: 10, special: true,
  onFire(f, w) { fireSpecial(f, w); } };

const projSize = (type, s) => ({
  orb: [s * 2, s * 2], spirit: [s * 2, s * 2], rock: [s * 2, s * 2], blade: [s * 2.4, s * 2.2], bolt: [s * 4, s * 1.5],
  needle: [s * 3, s * 1], wave: [s * 2.6, s * 2.2], cloud: [s * 2.4, s * 2.2],
}[type] || [s * 2, s * 2]);

export function fireSpecial(f, w) {
  const p = ARCH[f.char.arch].proj, n = p.n || 1;
  for (let i = 0; i < n; i++) {
    const ang = n > 1 ? (i - (n - 1) / 2) * (p.spread || 10) * Math.PI / 180 : 0;
    const [pw, ph] = projSize(p.type, p.size);
    const y = p.type === 'wave' ? ph / 2 : p.type === 'cloud' ? 36 : 42 * f.scale;
    w.spawnProj(f, {
      type: p.type, x: f.x + f.face * 28 * f.scale, y, w: pw, h: ph,
      vx: f.face * p.speed * Math.cos(ang), vy: -Math.sin(ang) * p.speed * 0.6 + (p.vy || 0),
      dmg: p.dmg, life: p.life, pierce: p.pierce || 0, rehit: p.rehit || 999, grav: p.grav || 0, homing: p.homing || 0,
      stun: p.stun || 18, kb: p.kb ?? 4, launch: p.launch || null, explode: !!p.explode, gain: 3,
    });
  }
  w.event({ t: 'cast', x: f.x, y: 44, f });
}

// ---------- Techniques (touche Technique) ----------
const nearest = (f, w) => w.nearestEnemy(f);

export const MOVE2 = {
  dash: { id: 'dash', name: 'Charge', pose: 'dash', su: 7, ac: 14, re: 14, cost: 15, dmg: 68, ox: 0, rx: 52, y0: 10, y1: 66, launch: { vx: 4.5, vy: 6 }, gain: 6, snd: 'kick',
    onTick(f) { f.vx = f.face * 12.5; f.fx = 'trail'; } },
  teleport: { id: 'teleport', name: 'Pas Fantôme', pose: 'strike', su: 14, ac: 5, re: 14, cost: 15, dmg: 66, ox: 0, rx: 56, y0: 10, y1: 66, launch: { vx: 5, vy: 5 }, gain: 6, snd: 'kick',
    onStart(f) { f.fade = true; f.invuln = Math.max(f.invuln, 14); },
    onFire(f, w) {
      f.fade = false; const e = nearest(f, w);
      if (e) { const side = f.x < e.x ? 1 : -1; f.x = Math.max(-w.half, Math.min(w.half, e.x + side * 46)); f.face = -side; }
      w.event({ t: 'puff', x: f.x, y: 40, color: ARCH[f.char.arch].c1 });
    } },
  uppercut: { id: 'uppercut', name: 'Remontée', pose: 'upper', su: 6, ac: 14, re: 24, cost: 15, dmg: 84, ox: 0, rx: 38, y0: 10, y1: 125, launch: { vx: 2, vy: 13 }, inv: 14, gain: 8, snd: 'kick',
    onFire(f) { f.vy = 11.5; f.vx = f.face * 1.5; } },
  pillar: { id: 'pillar', name: 'Éruption', pose: 'cast', su: 16, ac: 1, re: 24, cost: 15, snd: 'kick',
    onFire(f, w) {
      const e = nearest(f, w); const tx = e && Math.abs(e.x - f.x) < 420 ? e.x : f.x + f.face * 170;
      w.spawnProj(f, { type: 'pillar', x: tx, y: 70, w: 38, h: 140, vx: 0, vy: 0, dmg: 80, life: 24, pierce: 99, rehit: 999, stun: 20, kb: 0, launch: { vx: 0, vy: 11 }, gain: 6 });
      w.event({ t: 'quake', x: tx });
    } },
  leap: { id: 'leap', name: 'Bond Écrasant', pose: 'leap', su: 8, ac: 60, re: 8, cost: 15, dmg: 72, ox: -6, rx: 40, y0: -10, y1: 52, launch: { vx: 3, vy: -4 }, landEnds: true, gain: 6, snd: 'kick',
    onFire(f) { f.vy = 10; f.vx = f.face * 6.5; } },
  slam: { id: 'slam', name: 'Impact', pose: 'leap', su: 8, ac: 60, re: 12, cost: 15, dmg: 70, ox: -6, rx: 40, y0: -10, y1: 52, launch: { vx: 3, vy: -4 }, landEnds: true, gain: 6, snd: 'kick',
    onFire(f) { f.vy = 10.5; f.vx = f.face * 5.5; },
    onLand(f, w) {
      const t = ARCH[f.char.arch];
      for (const d of [-1, 1]) w.spawnProj(f, { type: 'wave', x: f.x + d * 20, y: 14, w: 40, h: 28, vx: d * 6, vy: 0, dmg: 50, life: 28, pierce: 0, stun: 18, kb: 4, launch: { vx: 2, vy: 6 }, gain: 3 });
      w.event({ t: 'quake', x: f.x }); void t;
    } },
};

// ---------- Super attaques ----------
const SUP_BASE = { cost: 50, super: true, snd: 'kick' };
const rainType = (arch) => { const t = ARCH[arch].proj.type; return t === 'wave' || t === 'cloud' ? 'rock' : t === 'orb' ? 'rock' : t; };

export const SUPERS = {
  beam: { ...SUP_BASE, id: 'beam', pose: 'beam', su: 34, ac: 54, re: 30, every: 6, dmg: 22, ox: 10, rx: 440, y0: 8, y1: 70, kb: 0.4, stun: 12, beam: true, gain: 0,
    last: { dmg: 70, launch: { vx: 8, vy: 8 } } },
  barrage: { ...SUP_BASE, id: 'barrage', pose: 'barrage', su: 26, ac: 48, re: 24, every: 6, dmg: 26, ox: -40, rx: 74, y0: 0, y1: 90, kb: 0, stun: 16, unblock: true, gain: 0,
    last: { dmg: 80, launch: { vx: 8, vy: 9 } },
    onFire(f, w) {
      const e = nearest(f, w);
      if (e && Math.abs(e.x - f.x) < 540 && e.hp > 0) { const d = Math.sign(e.x - f.x) || f.face; f.face = d; f.x = e.x - d * 40; f.lock = e; } else f.lock = null;
    },
    onTick(f) { if (f.lock && f.lock.hp > 0 && f.lock.state === 'hit') f.lock.x = f.x + f.face * 40; } },
  nova: { ...SUP_BASE, id: 'nova', pose: 'super', su: 30, ac: 14, re: 30, aoe: true, dmg: 130, ox: 0, rx: 190, y0: -10, y1: 130, launch: { vx: 7, vy: 9 }, gain: 0,
    onFire(f, w) { w.event({ t: 'nova', x: f.x, y: 40, f }); } },
  storm: { ...SUP_BASE, id: 'storm', pose: 'super', su: 34, ac: 72, re: 20,
    onTick(f, w, k) {
      if (k % 3) return; const e = nearest(f, w); const cx = e ? e.x : f.x + f.face * 150;
      const type = rainType(f.char.arch), [pw, ph] = projSize(type, 12);
      w.spawnProj(f, { type, x: cx + (w.rnd() * 2 - 1) * 230, y: 340, w: pw, h: ph, vx: (w.rnd() * 2 - 1) * 1.2, vy: -9.5, dmg: 38, life: 70, launch: { vx: 2, vy: 6 }, stun: 18, gain: 3, rain: true });
    } },
  clones: { ...SUP_BASE, id: 'clones', pose: 'super', su: 34, ac: 1, re: 30,
    onFire(f, w) {
      for (let i = 0; i < 3; i++) w.spawnProj(f, { type: 'spirit', x: f.x + f.face * 20, y: 30 + i * 28, w: 26, h: 26, vx: f.face * 6, vy: 0, dmg: 70, life: 150, homing: 0.1, stun: 22, kb: 4, launch: { vx: 3, vy: 5 }, gain: 3, big: true });
    } },
  giant: { ...SUP_BASE, id: 'giant', pose: 'super', su: 34, ac: 1, re: 20, onFire(f) { f.setBuff('giant', 600); } },
  transform: { ...SUP_BASE, id: 'transform', pose: 'super', su: 34, ac: 1, re: 20, onFire(f) { f.setBuff('power', 720); } },
};

export function getMove(f, key) {
  if (key === 'special') return SPECIAL;
  const a = ARCH[f.char.arch];
  if (key === 'move2') return MOVE2[a.m2];
  if (key === 'super') return SUPERS[a.sup];
  return MOVES[key];
}
