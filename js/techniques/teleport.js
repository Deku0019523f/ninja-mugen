// Technique « teleport » (touche Technique, 15 chakra)
import { nearest } from '../game/helpers.js';
import { ARCH } from '../archetypes/index.js';

export default { id: 'teleport', name: 'Pas Fantôme', pose: 'strike', su: 14, ac: 5, re: 14, cost: 15, dmg: 66, ox: 0, rx: 56, y0: 10, y1: 66, launch: { vx: 5, vy: 5 }, gain: 6, snd: 'kick',
  onStart(f) { f.fade = true; f.invuln = Math.max(f.invuln, 14); },
  onFire(f, w) {
    f.fade = false; const e = nearest(f, w);
    if (e) { const side = f.x < e.x ? 1 : -1; f.x = Math.max(-w.half, Math.min(w.half, e.x + side * 46)); f.face = -side; }
    w.event({ t: 'puff', x: f.x, y: 40, color: ARCH[f.char.arch].c1 });
  } };
