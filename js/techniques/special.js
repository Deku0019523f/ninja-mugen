// Spécial (touche Spécial, 10 chakra) : projectile propre à l'archetype du combattant
import { ARCH } from '../archetypes/index.js';
import { projSize } from '../game/helpers.js';

export function fireSpecial(f, w) {
  const p = ARCH[f.char.arch].proj, n = p.n || 1;
  for (let i = 0; i < n; i++) {
    const ang = n > 1 ? (i - (n - 1) / 2) * (p.spread || 10) * Math.PI / 180 : 0;
    const [pw, ph] = projSize(p.type, p.size);
    const y = p.type === 'wave' ? ph / 2 : p.type === 'cloud' ? 36 : 42 * f.scale;
    w.spawnProj(f, {
      type: p.type, x: f.x + f.face * 28 * f.scale, y, w: pw, h: ph,
      vx: f.face * p.speed * Math.cos(ang), vy: -Math.sin(ang) * p.speed * 0.6 + (p.vy || 0),
      dmg: p.dmg, life: p.life, pierce: p.pierce || 0, rehit: p.rehit || 999, grav: p.grav || 0, homing: p.homing || 0,
      stun: p.stun || 18, kb: p.kb ?? 4, launch: p.launch || null, explode: !!p.explode, gain: 3,
    });
  }
  w.event({ t: 'cast', x: f.x, y: 44, f });
}

export const SPECIAL = { id: 'special', pose: 'cast', su: 9, ac: 1, re: 22, cost: 10, special: true, onFire(f, w) { fireSpecial(f, w); } };
