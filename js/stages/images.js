// Décors à images (assets/stages/<id>_sky.png, <id>_ground.png) : rues de ville et ciels. Si l'image manque, un dégradé / un sol dessiné la remplace.
import { cv, grad, groundTex } from './_draw.js';

const IM = {};
const load = (src) => { if (!IM[src]) { const i = new Image(); i.src = src; IM[src] = i; } return IM[src]; };
const ready = (i) => !!(i && i.complete && i.naturalWidth > 0);

function make({ id, name, sky, ground, stone }) {
  return {
    id, name,
    build(r) {
      const [sc, sg] = cv(427, 240); grad(sg, 427, 240, sky);
      const si = load(`assets/stages/${id}_sky.png`); if (ready(si)) sg.drawImage(si, 0, 0, 427, 240);
      const gc = groundTex(900, 56, stone[0], stone[1], stone[2], r, stone[3]);
      if (ground) { const gi = load(`assets/stages/${id}_ground.png`); if (ready(gi)) gc.getContext('2d').drawImage(gi, 0, 0, 900, 56); }
      return { sky: sc, far: cv(2, 2)[0], mid: cv(2, 2)[0], ground: gc, horizon: 0.46, tint: '#fff' };
    },
  };
}

const ROAD = ['#4a4a52', '#26262e', ['#5a5a64', '#3a3a44', '#6a6a74'], '#8a8a94'];
const SKYFLOOR = ['#9aa4b8', '#5a6478', ['#b4bed2', '#4a5468', '#c8d2e6'], '#eef3ff'];

export const IMAGE_STAGES = [
  make({ id: 'city1', name: 'Ruelle des Conteneurs', sky: [[0, '#6a6a40'], [1, '#2a2a30']], ground: true, stone: ROAD }),
  make({ id: 'city2', name: 'Rue de la Taverne', sky: [[0, '#4a5a4a'], [1, '#2a2a30']], ground: true, stone: ROAD }),
  make({ id: 'city3', name: 'Boulevard Néon', sky: [[0, '#3a2a5a'], [1, '#1a1a2a']], ground: true, stone: ROAD }),
  make({ id: 'city4', name: 'Place du Café', sky: [[0, '#a04a1a'], [1, '#4a2a1a']], ground: true, stone: ROAD }),
  make({ id: 'ocean1', name: 'Ciel d\'Azur', sky: [[0, '#4a86c8'], [1, '#bcd8f0']], ground: false, stone: SKYFLOOR }),
  make({ id: 'ocean5', name: 'Crépuscule Étoilé', sky: [[0, '#2a3a6a'], [1, '#6a5a8a']], ground: false, stone: SKYFLOOR }),
  make({ id: 'ocean6', name: 'Ciel d\'Orage', sky: [[0, '#10183a'], [1, '#0a2a6a']], ground: false, stone: SKYFLOOR }),
  make({ id: 'ocean7', name: 'Falaise Venteuse', sky: [[0, '#9ab8d8'], [1, '#d8d8e0']], ground: false, stone: SKYFLOOR }),
];

// charge les images dès le démarrage pour qu'elles soient prêtes au premier combat
export function preloadStages() { for (const s of IMAGE_STAGES) { load(`assets/stages/${s.id}_sky.png`); if (s.id.startsWith('city')) load(`assets/stages/${s.id}_ground.png`); } }
