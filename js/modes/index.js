// Modes de jeu (un fichier chacun) + entrées Options / Commandes du menu principal
import arcade from './arcade.js';
import single from './single.js';
import survival from './survival.js';
import training from './training.js';
import online from './online.js';
import story from './story.js';
import tournament from './tournament.js';

export const MODES = { arcade, single, survival, training, online, story, tournament };
export const MENU = [
  arcade, single, survival, training,
  { id: 'options', label: 'OPTIONS', desc: 'Son, musique, commandes tactiles et plein écran.' },
  { id: 'controls', label: 'COMMANDES', desc: 'Clavier, manette et écran tactile.' },
];
