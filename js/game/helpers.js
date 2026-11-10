// Outils partagés par les techniques et les supers
import { ARCH } from '../archetypes/index.js';

export const nearest = (f, w) => w.nearestEnemy(f);
export const SUP_BASE = { cost: 50, super: true, snd: 'kick' };
export const projSize = (type, s) => ({
  orb: [s * 2, s * 2], spirit: [s * 2, s * 2], rock: [s * 2, s * 2], blade: [s * 2.4, s * 2.2], bolt: [s * 4, s * 1.5],
  needle: [s * 3, s * 1], wave: [s * 2.6, s * 2.2], cloud: [s * 2.4, s * 2.2],
}[type] || [s * 2, s * 2]);
export const rainType = (arch) => { const t = ARCH[arch].proj.type; return t === 'wave' || t === 'cloud' ? 'rock' : t === 'orb' ? 'rock' : t; };

// couleurs d'effets d'un personnage (sa fiche peut surcharger celles de son style)
export const fxCols = (ch) => ch.fx || [ARCH[ch.arch].c1, ARCH[ch.arch].c2];
// position de l'adversaire visé (ou un point devant le combattant)
export const targetX = (f, w, d = 150) => { const e = w.nearestEnemy(f); return e ? e.x : f.x + f.face * d; };
