// Super attaque « giant » (touche Super, 50 chakra)
import { SUP_BASE } from '../game/helpers.js';

export default { ...SUP_BASE, id: 'giant', pose: 'super', su: 34, ac: 1, re: 20, onFire(f) { f.setBuff('giant', 600); } };
