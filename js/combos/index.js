// Table des coups de base. Un fichier par combo : ajouter un fichier + une ligne ici suffit.
import punch1 from './punch1.js';
import punch2 from './punch2.js';
import punch3 from './punch3.js';
import kick from './kick.js';
import sweep from './sweep.js';
import upper from './upper.js';
import smash from './smash.js';
import apunch from './apunch.js';
import akick from './akick.js';

const LIST = [punch1, punch2, punch3, kick, sweep, upper, smash, apunch, akick];
export const MOVES = Object.fromEntries(LIST.map((m) => [m.id, m]));
export const COMBO_LIST = LIST.map((m) => m.info);
