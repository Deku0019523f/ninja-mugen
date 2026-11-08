import { G, save } from './ctx.js';
import { listMenu } from '../ui/menu.js';
import { setMuted, setMusic, initAudio } from '../audio.js';
import { getPadMode, setPadMode } from '../touch.js';

export default function sOptions() {
  const S = G.S, tog = (k) => () => { S[k] = !S[k]; save(); setMuted(!S.sound); setMusic(S.music); initAudio(); };
  const items = [
    { label: 'Effets sonores', get: () => (S.sound ? 'Activés' : 'Coupés'), left: tog('sound'), right: tog('sound') },
    { label: 'Musique', get: () => (S.music ? 'Activée' : 'Coupée'), left: tog('music'), right: tog('music') },
    { label: 'Commande tactile', get: () => (getPadMode() === 'stick' ? 'Analogique' : 'Croix'), desc: 'Gauche de l\'écran : stick analogique ou croix directionnelle. Modifiable aussi en combat avec le bouton ✚ / 🕹.', left: () => setPadMode(getPadMode() === 'stick' ? 'dpad' : 'stick'), right: () => setPadMode(getPadMode() === 'stick' ? 'dpad' : 'stick') },
  ];
  if (document.fullscreenEnabled) items.push({ label: 'Plein écran', get: () => (document.fullscreenElement ? 'Oui' : 'Non'), desc: 'Masque la barre du navigateur pour agrandir le jeu.', right: () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().then(() => window.screen.orientation?.lock?.('landscape').catch(() => {})).catch(() => {}); setTimeout(() => G.go('options'), 350); } });
  
  listMenu(items, { page: true, title: 'OPTIONS', onBack: () => G.go('title') });
}
