// Ultime « dive » : charge fulgurante à travers l'arène (invulnérable), plusieurs touches sur la trajectoire
import { SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_dive', pose: 'dash', su: 26, ac: u.ac ?? 34, re: 30, every: u.every ?? 4, dmg: u.dmg ?? 30, ox: -14, rx: 70, y0: 0, y1: 100, kb: 0, stun: 14, unblock: true, gain: 0, inv: 60, hop: u.hop ?? 0,
  last: { dmg: u.last ?? 100, launch: { vx: 8, vy: 9 } },
  onTick(f, w, k) { f.vx = f.face * (u.v ?? 18); f.fx = 'trail'; if (k % 3 === 0) w.event({ t: 'puff', x: f.x, y: 40 + f.y, color: (f.char.fx || ['#fff'])[0] }); } });
