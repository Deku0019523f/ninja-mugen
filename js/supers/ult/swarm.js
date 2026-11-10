// Ultime « swarm » : nuée de projectiles à tête chercheuse tirés en éventail
import { projSize, SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_swarm', pose: 'super', su: 32, ac: (u.n ?? 12) * 3, re: 24,
  onTick(f, w, k) {
    if (k % 3) return; const i = k / 3, n = u.n ?? 12, a = (i / n - 0.5) * 1.6, [pw, ph] = projSize(u.type ?? 'spirit', u.size ?? 9);
    w.spawnProj(f, { type: u.type ?? 'spirit', style: u.style, x: f.x + f.face * 20, y: 50 + Math.sin(i) * 14, w: pw, h: ph, vx: f.face * 6 * Math.cos(a), vy: 6 * Math.sin(a) + 1, dmg: u.dmg ?? 24, life: 130, homing: u.homing ?? 0.1, stun: 16, kb: 2, launch: { vx: 2, vy: 4 }, gain: 2 });
  } });
