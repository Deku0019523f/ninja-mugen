// Ultime « grab » : saisie en plusieurs temps — se colle à l'adversaire, l'enchaîne, puis l'écrase au sol
import { nearest, SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_grab', pose: 'smash', su: 30, ac: u.ac ?? 42, re: 30, every: u.every ?? 7, dmg: u.dmg ?? 22, ox: -30, rx: 56, y0: 0, y1: 90, kb: 0, stun: 16, unblock: true, gain: 0,
  last: { dmg: u.last ?? 110, launch: { vx: 3, vy: -13 } },
  onFire(f, w) { const e = nearest(f, w); if (e && Math.abs(e.x - f.x) < 520 && e.hp > 0) { const d = Math.sign(e.x - f.x) || f.face; f.face = d; f.x = e.x - d * 36; f.lock = e; w.event({ t: 'puff', x: f.x, y: 40, color: (f.char.fx || ['#fff'])[0] }); } else f.lock = null; },
  onTick(f, w, k) {
    const e = f.lock; if (!e || e.hp <= 0) return; e.x = f.x + f.face * 36;
    if (k % (u.every ?? 7) === 0) { w.event({ t: 'fxflash', x: e.x, y: 40, s: 80, life: 6, color: (f.char.fx || ['#fff', '#fff'])[1] }); w.event({ t: 'fxring', x: e.x, y: 40, s: 30, grow: 10, life: 10, color: (f.char.fx || ['#fff'])[0] }); }
  } });
