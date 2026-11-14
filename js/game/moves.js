// ============================================================
//  TABLE DES COUPS (en frames @60 Hz) — agrégateur
//  su = startup, ac = frames actives, re = récupération
//  Hitbox : de ox à rx devant le combattant, de y0 à y1 au-dessus des pieds
//  Les coups vivent dans leurs dossiers : combos/ techniques/ supers/ (un fichier chacun)
// ============================================================
import { ARCH } from '../archetypes/index.js';
import { MOVES, COMBO_LIST, SIDE_FINISH } from '../combos/index.js';
import { SPECIAL, SPECIAL_UP, SPECIAL_DOWN, fireSpecial } from '../techniques/special.js';
import { SHURIKEN, CHAKRA_SHURIKEN, CHAKRA_DASH } from '../techniques/chakra.js';
import { MOVE2 } from '../techniques/index.js';
import { RUSH } from '../techniques/rush.js';
import { SUPERS } from '../supers/index.js';
import { ultOf } from '../supers/ult/index.js';

// Boutons mémorisés (buffer de 8 frames) : sq = Shuriken (□), cdash = Chakra Dash, cshuriken = Chakra Shuriken,
// sub = substitution (L2), throw = projection (R2 + ○), high / low / side = ○ avec ↑ / ↓ / ←→ (chaînes directionnelles)
export const BTN = ['punch', 'kick', 'special', 'move2', 'super', 'super2', 'rush', 'sq', 'cdash', 'cshuriken', 'sub', 'throw', 'high', 'low', 'side'];
export const SUPER2_COST = 100;
export { MOVES, COMBO_LIST, SPECIAL, MOVE2, SUPERS, fireSpecial };

export function getMove(f, key) {
  if (key === 'special') return SPECIAL;
  if (key === 'special_up') return SPECIAL_UP;
  if (key === 'special_down') return SPECIAL_DOWN;
  if (key === 'shuriken') return SHURIKEN;
  if (key === 'cshuriken') return CHAKRA_SHURIKEN;
  if (key === 'cdash') return CHAKRA_DASH;
  if (key === 'rush') return RUSH;
  if (key === 'super2') { const b = getMove(f, 'super'); return b && { ...b, cost: SUPER2_COST, s2: true }; }   // Super 2 : le Super 1 renforcé (×1,6 de dégâts), 2 × son coût
  if (key === 'sidefin') return MOVES[SIDE_FINISH[f.char.arch] || 'kick'];   // finisseur de la chaîne latérale : selon le personnage
  const a = ARCH[f.char.arch];
  if (key === 'move2') return MOVE2[a.m2];
  if (key === 'super') return ultOf(f.char) || SUPERS[a.sup];
  return MOVES[key];
}
