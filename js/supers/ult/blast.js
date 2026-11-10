// Ultime « blast » : explosion autour du combattant (peut soigner)
import { SUP_BASE } from '../../game/helpers.js';

export default (u, ch) => ({ ...SUP_BASE, id: 'ult_blast', pose: 'super', su: u.su ?? 30, ac: 14, re: 30, aoe: true, dmg: u.dmg ?? 130, ox: 0, rx: u.rx ?? 190, y0: -10, y1: 130, launch: { vx: 7, vy: 9 }, gain: 0,
  onFire(f, w) {
    w.event({ t: 'nova', x: f.x, y: 40, f });
    for (let i = 1; i <= (u.rings ?? 2); i++) w.event({ t: 'fxring', x: f.x, y: 40, s: 50 + i * 30, grow: 20 + i * 8, life: 20 + i * 6, color: (f.char.fx || ['#fff', '#fff'])[i % 2] });
    if (u.heal) { f.hp = Math.min(f.maxHp, f.hp + f.maxHp * u.heal); w.event({ t: 'buff', f }); }
  } });
