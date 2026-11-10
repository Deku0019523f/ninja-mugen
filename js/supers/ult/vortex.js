// Ultime « vortex » : aspire l'adversaire dans un tourbillon, le frappe en boucle puis le projette
import { nearest, SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_vortex', pose: 'cast', su: 28, ac: u.ac ?? 54, re: 26, every: u.every ?? 5, dmg: u.dmg ?? 16, ox: -10, rx: 110, y0: 0, y1: 110, kb: 0, stun: 14, unblock: true, gain: 0,
  last: { dmg: u.last ?? 80, launch: { vx: 9, vy: 10 } },
  onFire(f, w) { const e = nearest(f, w); f.lock = e && Math.abs(e.x - f.x) < 420 && e.hp > 0 ? e : null; },
  onTick(f, w, k) {
    const e = f.lock, cx = f.x + f.face * 70;
    if (e && e.hp > 0) { e.x += (cx - e.x) * 0.18; if (e.y <= 0 && e.state === 'hit') e.vx = 0; }
    if (k % 3 === 0) {
      const a = k * 0.45, r = 48 + (k % 9) * 4;
      w.spawnProj(f, { type: 'blade', style: u.style, x: cx + Math.cos(a) * r, y: 40 + Math.sin(a * 1.3) * 34 + 20, w: 34, h: 30, vx: -Math.sin(a) * 3 * (k % 6 ? 1 : -1) || 1, vy: 0, life: 14, fxOnly: true, dmg: 0 });
      w.event({ t: 'fxburst', x: cx, y: 40, n: 3, color: (f.char.fx || ['#fff'])[0], sp: 5, life: 18, size: 9, g: 0 });
    }
  } });
