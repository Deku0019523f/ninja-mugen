// Super attaque « beam » (touche Super, 50 chakra)
import { SUP_BASE } from '../game/helpers.js';

export default { ...SUP_BASE, id: 'beam', pose: 'beam', su: 34, ac: 54, re: 30, every: 6, dmg: 22, ox: 10, rx: 440, y0: 8, y1: 70, kb: 0.4, stun: 12, beam: true, gain: 0,
  last: { dmg: 70, launch: { vx: 8, vy: 8 } } };
