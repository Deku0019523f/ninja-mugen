// Ultime « rain » : pluie de projectiles qui tombent du ciel autour de l'adversaire
import { projSize, SUP_BASE, targetX } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_rain', pose: 'super', su: 34, ac: u.ac ?? 72, re: 20,
  onTick(f, w, k) {
    if (k % (u.every ?? 3)) return;
    const type = u.type ?? 'rock', [pw, ph] = projSize(type, u.size ?? 12), sp = u.speed ?? 9.5;
    w.spawnProj(f, { type, style: u.style, x: targetX(f, w) + (w.rnd() * 2 - 1) * (u.spread ?? 230), y: 340, w: pw, h: ph, vx: (w.rnd() * 2 - 1) * (u.drift ?? 1.2), vy: -sp,
      dmg: u.dmg ?? 38, life: Math.ceil(330 / sp), grav: 1e-6, launch: { vx: 2, vy: 6 }, stun: 18, gain: 3, rain: true, explode: !!u.explode });
  } });
