// Ultime « clones » : quelques esprits / doubles puissants, à tête chercheuse
import { SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_clones', pose: 'super', su: 34, ac: 1, re: 30,
  onFire(f, w) {
    const n = u.n ?? 3;
    for (let i = 0; i < n; i++) w.spawnProj(f, { type: u.type ?? 'spirit', style: u.style, x: f.x + f.face * 20, y: 24 + (i * 70) / Math.max(1, n - 1 || 1) , w: u.size ?? 26, h: u.size ?? 26, vx: f.face * (5 + i * 0.6), vy: 0, dmg: u.dmg ?? 70, life: 170, homing: 0.1, stun: 22, kb: 4, launch: { vx: 3, vy: 5 }, gain: 3, big: true });
  } });
