// Modes de jeu (un fichier chacun) + entrées Options / Commandes du menu principal
import arcade from './arcade.js';
import single from './single.js';
import survival from './survival.js';
import training from './training.js';

export const MODES = { arcade, single, survival, training };
export const MENU = [
  arcade, single, survival, training,
  { id: 'options', label: 'OPTIONS', desc: 'Son, musique, commandes tactiles et plein écran.' },
  { id: 'controls', label: 'COMMANDES', desc: 'Clavier, manette et écran tactile.' },
];
