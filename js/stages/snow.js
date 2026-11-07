// Décor « Col Enneigé »
import { cv, grad, px, cloud, mountains, pine, groundTex } from './_draw.js';

export default {
  id: 'snow', name: 'Col Enneigé',
  build(r) {
    const sky = cv(320, 240); grad(sky[1], 320, 240, [[0, '#6a8ac0'], [.5, '#b8cce8'], [1, '#eef4fc']]);
    cloud(sky[1], 30, 40, 1.4, '#f4f8ff', '#cfdcf0'); cloud(sky[1], 200, 60, 1.1, '#f4f8ff', '#cfdcf0');
    const far = cv(500, 150), g1 = far[1]; mountains(g1, 500, 150, 130, '#98aed0', '#ffffff', r, 4);
    const mid = cv(560, 160), g2 = mid[1]; mountains(g2, 560, 160, 60, '#7a90b8', '#eef4ff', r, 8);
    for (let i = 0; i < 60; i++) pine(g2, i * 9.4 + r() * 6, 160, 24 + r() * 16, '#2a5a4a', '#3a7a62');
    for (let i = 0; i < 60; i++) px(g2, r() * 560, 108 + r() * 50, 6 + r() * 6, 2, 'rgba(255,255,255,.8)');
    const gr = groundTex(900, 56, '#f4f8ff', '#c8d8ec', ['#ffffff', '#b8cce4', '#dce8f6'], r, '#ffffff');
    return { sky: sky[0], far: far[0], mid: mid[0], ground: gr, horizon: 0.44, tint: '#fff', snow: true };
  },
};
