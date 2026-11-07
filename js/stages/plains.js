// Décor « Plaines des Cimes »
import { cv, grad, px, cloud, mountains, pine, groundTex } from './_draw.js';

export default {
  id: 'plains', name: 'Plaines des Cimes',
  build(r) {
    const sky = cv(320, 240); grad(sky[1], 320, 240, [[0, '#1a5adb'], [.5, '#4aa2f0'], [1, '#bfe4fa']]);
    cloud(sky[1], 60, 62, 1.3); cloud(sky[1], 240, 40, 1.1); cloud(sky[1], 290, 90, .8);
    const far = cv(500, 150), g1 = far[1]; mountains(g1, 500, 150, 120, '#7a98c8', '#f4f8ff', r, 5);
    const mid = cv(560, 160), g2 = mid[1]; mountains(g2, 560, 160, 70, '#4a6aa8', null, r, 7);
    for (let i = 0; i < 70; i++) pine(g2, i * 8 + r() * 6, 160, 26 + r() * 14, '#1f6a4a', '#2a8a5a');
    px(g2, 0, 150, 560, 10, '#2f7a3a');
    const gr = groundTex(900, 56, '#5aa42a', '#3a7a1a', ['#7ac43a', '#2f6a18', '#8ad44a'], r, '#a8e060');
    const g3 = gr.getContext('2d'); for (let i = 0; i < 200; i++) px(g3, r() * 900, r() * 40, 1, 2 + r() * 4, ['#4a9020', '#9ae050'][(r() * 2) | 0]);
    px(g3, 0, 44, 900, 12, '#4a4228'); for (let i = 0; i < 50; i++) { g3.fillStyle = ['#6a5a34', '#8a7a48', '#3a321c'][(r() * 3) | 0]; g3.beginPath(); g3.arc(i * 18 + r() * 8, 50, 6 + r() * 4, 0, 7); g3.fill(); }
    return { sky: sky[0], far: far[0], mid: mid[0], ground: gr, horizon: 0.46, tint: '#fff' };
  },
};
