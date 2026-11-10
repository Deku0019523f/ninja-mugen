// Ultime « bolts » : des éclairs frappent l'adversaire, l'un après l'autre, où qu'il aille
import { SUP_BASE, targetX } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_bolts', pose: 'super', su: 32, ac: (u.n ?? 8) * (u.gap ?? 7), re: 24,
  onTick(f, w, k) {
    if (k % (u.gap ?? 7)) return; const x = targetX(f, w) + (w.rnd() - .5) * (u.spread ?? 60);
    w.spawnProj(f, { type: 'bolt', style: u.style ?? 'lightning', x, y: 330, w: 22, h: 100, vx: 0, vy: -26, dmg: u.dmg ?? 44, life: 14, grav: 1e-6, stun: 20, kb: 1, launch: { vx: 1, vy: 6 }, gain: 3, rain: true });
    w.event({ t: 'fxflash', x, y: 8, s: 70, life: 8, color: (f.char.fx || ['#8ad0ff'])[0] });
  } });
