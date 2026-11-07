// ============================================================
//  ROSTER : agrégateur. Les 56 combattants sont dans js/characters/<nom>/<nom>.js
//  et les 18 archétypes dans js/archetypes/<style>.js (un fichier chacun).
// ============================================================
import { ARCH } from '../archetypes/index.js';
import { CHARACTERS } from '../characters/index.js';

export { ARCH };
export const ROSTER = CHARACTERS.map((c, i) => ({ ...c, id: i, full: `${c.name} — ${c.title}` }));

export const hexShade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
};
