// Super attaque « barrage » (touche Super, 50 chakra)
import { nearest, SUP_BASE } from '../game/helpers.js';

export default { ...SUP_BASE, id: 'barrage', pose: 'barrage', su: 26, ac: 48, re: 24, every: 6, dmg: 26, ox: -40, rx: 74, y0: 0, y1: 90, kb: 0, stun: 16, unblock: true, gain: 0,
  last: { dmg: 80, launch: { vx: 8, vy: 9 } },
  onFire(f, w) {
    const e = nearest(f, w);
    if (e && Math.abs(e.x - f.x) < 540 && e.hp > 0) { const d = Math.sign(e.x - f.x) || f.face; f.face = d; f.x = e.x - d * 40; f.lock = e; } else f.lock = null;
  },
  onTick(f) { if (f.lock && f.lock.hp > 0 && f.lock.state === 'hit') f.lock.x = f.x + f.face * 40; } };
