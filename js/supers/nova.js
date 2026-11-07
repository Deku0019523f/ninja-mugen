// Super attaque « nova » (touche Super, 50 chakra)
import { SUP_BASE } from '../game/helpers.js';

export default { ...SUP_BASE, id: 'nova', pose: 'super', su: 30, ac: 14, re: 30, aoe: true, dmg: 130, ox: 0, rx: 190, y0: -10, y1: 130, launch: { vx: 7, vy: 9 }, gain: 0,
  onFire(f, w) { w.event({ t: 'nova', x: f.x, y: 40, f }); } };
