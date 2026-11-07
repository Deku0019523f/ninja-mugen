// Super attaque « clones » (touche Super, 50 chakra)
import { SUP_BASE } from '../game/helpers.js';

export default { ...SUP_BASE, id: 'clones', pose: 'super', su: 34, ac: 1, re: 30,
  onFire(f, w) {
    for (let i = 0; i < 3; i++) w.spawnProj(f, { type: 'spirit', x: f.x + f.face * 20, y: 30 + i * 28, w: 26, h: 26, vx: f.face * 6, vy: 0, dmg: 70, life: 150, homing: 0.1, stun: 22, kb: 4, launch: { vx: 3, vy: 5 }, gain: 3, big: true });
  } };
