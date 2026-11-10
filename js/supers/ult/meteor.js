// Ultime « meteor » : de gros projectiles explosifs s'abattent en diagonale sur l'adversaire
import { projSize, SUP_BASE, targetX } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_meteor', pose: 'super', su: 34, ac: (u.n ?? 4) * (u.gap ?? 14), re: 26,
  onTick(f, w, k) {
    if (k % (u.gap ?? 14)) return;
    const [pw, ph] = projSize('orb', u.size ?? 18), tx = targetX(f, w) + (w.rnd() - .5) * (u.spread ?? 120), T = 58, sx = tx - f.face * 190;
    w.spawnProj(f, { type: 'orb', style: u.style, x: sx, y: 390, w: pw, h: ph, vx: (tx - sx) / T, vy: -(390 - 18) / T, dmg: u.dmg ?? 70, life: T + 8, grav: 1e-6, explode: true, big: true, rain: true, stun: 22, gain: 3, launch: { vx: 3, vy: 7 } });
  } });
