// Ultime « wave » : des vagues géantes qui balaient l'arène (traversent tout)
import { SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_wave', pose: 'super', su: 32, ac: (u.n ?? 3) * (u.gap ?? 16), re: 26,
  onTick(f, w, k) {
    if (k % (u.gap ?? 16)) return; const s = (u.size ?? 40) * (1 + (k / (u.gap ?? 16)) * 0.1), h = s * 2.2;
    w.spawnProj(f, { type: 'wave', style: u.style, x: f.x + f.face * 30, y: h / 2, w: s * 2.4, h, vx: f.face * (u.speed ?? 7), vy: 0, dmg: u.dmg ?? 60, life: 110, pierce: 99, rehit: 999, stun: 20, kb: 2, launch: { vx: 4, vy: 9 }, gain: 4, big: true });
    w.event({ t: 'quake', x: f.x + f.face * 40 });
  } });
