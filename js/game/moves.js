// ============================================================
//  TABLE DES COUPS (en frames @60 Hz) — agrégateur
//  su = startup, ac = frames actives, re = récupération
//  Hitbox : de ox à rx devant le combattant, de y0 à y1 au-dessus des pieds
//  Les coups vivent dans leurs dossiers : combos/ techniques/ supers/ (un fichier chacun)
// ============================================================
import { ARCH } from '../archetypes/index.js';
import { MOVES, COMBO_LIST } from '../combos/index.js';
import { SPECIAL, fireSpecial } from '../techniques/special.js';
import { MOVE2 } from '../techniques/index.js';
import { SUPERS } from '../supers/index.js';

export const BTN = ['punch', 'kick', 'special', 'move2', 'super'];
export { MOVES, COMBO_LIST, SPECIAL, MOVE2, SUPERS, fireSpecial };

export function getMove(f, key) {
  if (key === 'special') return SPECIAL;
  const a = ARCH[f.char.arch];
  if (key === 'move2') return MOVE2[a.m2];
  if (key === 'super') return SUPERS[a.sup];
  return MOVES[key];
}
