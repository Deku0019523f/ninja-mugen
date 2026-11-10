// Ultime « rush » : fond sur l'adversaire et le martèle (rafale de coups, puis coup final qui l'envoie valser)
import { nearest, SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_rush', pose: 'barrage', su: 26, ac: u.ac ?? 48, re: 24, every: u.every ?? 6, dmg: u.dmg ?? 26, ox: -40, rx: 74, y0: 0, y1: 90, kb: 0, stun: 16, unblock: true, gain: 0,
  last: { dmg: u.last ?? 80, launch: { vx: 8, vy: 9 } },
  onFire(f, w) { const e = nearest(f, w); if (e && Math.abs(e.x - f.x) < 540 && e.hp > 0) { const d = Math.sign(e.x - f.x) || f.face; f.face = d; f.x = e.x - d * 40; f.lock = e; } else f.lock = null; },
  onTick(f, w, k) {
    if (f.lock && f.lock.hp > 0 && f.lock.state === 'hit') { f.lock.x = f.x + f.face * 40; if (k % (u.every ?? 6) === 0) w.event({ t: 'fxflash', x: f.lock.x, y: 30 + (k % 3) * 22, s: 60, life: 6, color: (f.char.fx || ['#fff'])[k % 2 ? 0 : 1] || '#fff' }); }
  } });
