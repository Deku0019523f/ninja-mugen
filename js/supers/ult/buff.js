// Ultime « buff » : transformation (géant ou puissance) avec onde de choc et, au choix, soin
import { SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_buff', pose: 'super', su: 34, ac: 1, re: 20,
  onFire(f, w) {
    f.setBuff(u.buff ?? 'power', u.frames ?? 720);
    if (u.heal) f.hp = Math.min(f.maxHp, f.hp + f.maxHp * u.heal);
    w.event({ t: 'fxring', x: f.x, y: 40, s: 90, grow: 26, life: 26, color: (f.char.fx || ['#fff'])[0] }); w.event({ t: 'fxflash', x: f.x, y: 50, s: 150, life: 14, color: (f.char.fx || ['#fff', '#fff'])[1] });
  } });
