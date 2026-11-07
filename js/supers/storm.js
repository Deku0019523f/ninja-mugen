// Super attaque « storm » (touche Super, 50 chakra)
import { nearest, projSize, rainType, SUP_BASE } from '../game/helpers.js';

export default { ...SUP_BASE, id: 'storm', pose: 'super', su: 34, ac: 72, re: 20,
  onTick(f, w, k) {
    if (k % 3) return; const e = nearest(f, w); const cx = e ? e.x : f.x + f.face * 150;
    const type = rainType(f.char.arch), [pw, ph] = projSize(type, 12);
    w.spawnProj(f, { type, x: cx + (w.rnd() * 2 - 1) * 230, y: 340, w: pw, h: ph, vx: (w.rnd() * 2 - 1) * 1.2, vy: -9.5, dmg: 38, life: 70, launch: { vx: 2, vy: 6 }, stun: 18, gain: 3, rain: true });
  } };
