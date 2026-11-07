// Décor « Forêt Verdoyante »
import { cv, grad, px, cloud, groundTex } from './_draw.js';

export default {
  id: 'forest', name: 'Forêt Verdoyante',
  build(r) {
    const sky = cv(320, 240); grad(sky[1], 320, 240, [[0, '#7bc6f0'], [.5, '#bfe6f4'], [1, '#e6f6e0']]);
    cloud(sky[1], 40, 30, 1.1); cloud(sky[1], 210, 18, 0.9);
    const far = cv(500, 150), g1 = far[1];
    for (let i = 0; i < 40; i++) { const x = r() * 500, y = 60 + r() * 50; g1.fillStyle = ['#2f6a2a', '#3a7a30', '#2a5a28'][(r() * 3) | 0]; g1.beginPath(); g1.arc(x, y, 22 + r() * 18, 0, 7); g1.fill(); }
    px(g1, 0, 100, 500, 50, '#265a24');
    const mid = cv(560, 160), g2 = mid[1];
    for (let i = 0; i < 18; i++) { const x = i * 31 + r() * 14; px(g2, x, 52, 7, 108, '#5a3a24'); px(g2, x, 52, 2, 108, '#7a5232'); px(g2, x + 5, 52, 2, 108, '#40281a'); }
    for (let i = 0; i < 46; i++) { const x = r() * 560, y = r() * 50 + 6; g2.fillStyle = ['#43a02f', '#58b83a', '#37862a', '#6cc944'][(r() * 4) | 0]; g2.beginPath(); g2.arc(x, y, 18 + r() * 20, 0, 7); g2.fill(); }
    for (let i = 0; i < 14; i++) { g2.fillStyle = '#3a7a2a'; g2.beginPath(); g2.arc(r() * 560, 150, 8 + r() * 10, Math.PI, 0); g2.fill(); }
    const gr = groundTex(900, 56, '#b8905a', '#8a6a3c', ['#cfa870', '#7a5a30', '#a07a48'], r, '#7ab040');
    for (let i = 0; i < 90; i++) { const x = r() * 900; px(gr.getContext('2d'), x, 0, 1, 3 + r() * 3, ['#5aa030', '#7ac040'][(r() * 2) | 0]); }
    return { sky: sky[0], far: far[0], mid: mid[0], ground: gr, horizon: 0.44, tint: '#fff' };
  },
};
