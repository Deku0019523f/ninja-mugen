// ============================================================
//  TABLE DES COUPS (en frames @60 Hz) — agrégateur
//  su = startup, ac = frames actives, re = récupération
//  Hitbox : de ox à rx devant le combattant, de y0 à y1 au-dessus des pieds
//  Les coups vivent dans leurs dossiers : combos/ techniques/ supers/ (un fichier chacun)
// ============================================================
import { ARCH } from '../archetypes/index.js';
import { MOVES, COMBO_LIST } from '../combos/index.js';
import { SPECIAL, SPECIAL_UP, SPECIAL_DOWN, fireSpecial } from '../techniques/special.js';
import { SHURIKEN, CHAKRA_SHURIKEN, CHAKRA_DASH } from '../techniques/chakra.js';
import { MOVE2 } from '../techniques/index.js';
import { SUPERS } from '../supers/index.js';

// Boutons mémorisés (buffer de 8 frames) : sq = Shuriken (□), cdash = Chakra Dash, cshuriken = Chakra Shuriken,
// sub = substitution (L2, mémorisée pour être pressée un peu avant l'impact), throw = projection (R2 + ○)
export const BTN = ['punch', 'kick', 'special', 'move2', 'super', 'sq', 'cdash', 'cshuriken', 'sub', 'throw'];
export { MOVES, COMBO_LIST, SPECIAL, MOVE2, SUPERS, fireSpecial };

export function getMove(f, key) {
  if (key === 'special') return SPECIAL;
  if (key === 'special_up') return SPECIAL_UP;
  if (key === 'special_down') return SPECIAL_DOWN;
  if (key === 'shuriken') return SHURIKEN;
  if (key === 'cshuriken') return CHAKRA_SHURIKEN;
  if (key === 'cdash') return CHAKRA_DASH;
  const a = ARCH[f.char.arch];
  if (key === 'move2') return MOVE2[a.m2];
  if (key === 'super') return SUPERS[a.sup];
  return MOVES[key];
}
