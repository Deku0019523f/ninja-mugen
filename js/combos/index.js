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
import throwMove from './throw.js';
import cjab from './cjab.js';
import shin from './shin.js';
import trip from './trip.js';
import palm from './palm.js';
import palm2 from './palm2.js';
import hook from './hook.js';
import rise from './rise.js';
import apunch2 from './apunch2.js';

const LIST = [punch1, punch2, punch3, kick, sweep, upper, smash, apunch, akick, throwMove, cjab, shin, trip, palm, palm2, hook, rise, apunch2];
export const MOVES = Object.fromEntries(LIST.map((m) => [m.id, m]));
export const COMBO_LIST = LIST.map((m) => m.info);

// Finisseur de la chaîne latérale (← / → + ○ × 3) selon l'archétype : Crochet repoussant ou Coup de pied (défaut)
export const SIDE_FINISH = { brawler: 'hook', fury: 'hook', earth: 'hook', bone: 'hook', blade: 'hook', sand: 'hook' };
