// Ultime « eruption » : une ligne de piliers jaillit du sol, de plus en plus loin, jusqu'à l'adversaire et au-delà
import { SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_eruption', pose: 'super', su: 30, ac: (u.n ?? 6) * (u.gap ?? 7), re: 26,
  onTick(f, w, k) {
    if (k % (u.gap ?? 7)) return; const i = k / (u.gap ?? 7), x = Math.max(-w.half, Math.min(w.half, f.x + f.face * (50 + i * (u.step ?? 55))));
    w.spawnProj(f, { type: 'pillar', x, y: 70, w: 40, h: u.h ?? 150, vx: 0, vy: 0, dmg: u.dmg ?? 60, life: 22, pierce: 99, rehit: 999, stun: 20, kb: 0, launch: { vx: 0, vy: 11 }, gain: 4 });
    w.event({ t: 'quake', x });
  } });
