// Technique « pillar » (touche Technique, 15 chakra)
import { nearest } from '../game/helpers.js';

export default { id: 'pillar', name: 'Éruption', pose: 'cast', su: 16, ac: 1, re: 24, cost: 15, snd: 'kick',
  onFire(f, w) {
    const e = nearest(f, w); const tx = e && Math.abs(e.x - f.x) < 420 ? e.x : f.x + f.face * 170;
    w.spawnProj(f, { type: 'pillar', x: tx, y: 70, w: 38, h: 140, vx: 0, vy: 0, dmg: 80, life: 24, pierce: 99, rehit: 999, stun: 20, kb: 0, launch: { vx: 0, vy: 11 }, gain: 6 });
    w.event({ t: 'quake', x: tx });
  } };
