// Ultime « ray » : faisceau soutenu devant soi (longueur, épaisseur, dégâts réglables)
import { SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_ray', pose: 'beam', su: u.su ?? 34, ac: u.ac ?? 54, re: 30, every: u.every ?? 6, dmg: u.dmg ?? 22, ox: 10, rx: u.len ?? 440,
  y0: 40 - (u.bh ?? 60) / 2, y1: 40 + (u.bh ?? 60) / 2, kb: 0.4, stun: 12, beam: true, bh: u.bh ?? 60, gain: 0, last: { dmg: u.last ?? 70, launch: { vx: 8, vy: 8 } } });
