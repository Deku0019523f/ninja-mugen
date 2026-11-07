// Décor « Temple de la Lune »
import { cv, grad, px, mountains, pine, groundTex, poly2 } from './_draw.js';

export default {
  id: 'night', name: 'Temple de la Lune',
  build(r) {
    const sky = cv(320, 240); grad(sky[1], 320, 240, [[0, '#0a0a2a'], [.55, '#2a2060'], [1, '#6a4a8a']]);
    for (let i = 0; i < 90; i++) px(sky[1], r() * 320, r() * 140, 1, 1, ['#fff', '#cfe0ff', '#ffe8c0'][(r() * 3) | 0]);
    sky[1].fillStyle = 'rgba(255,250,220,.15)'; sky[1].beginPath(); sky[1].arc(110, 80, 52, 0, 7); sky[1].fill();
    sky[1].fillStyle = '#fff8d8'; sky[1].beginPath(); sky[1].arc(110, 80, 34, 0, 7); sky[1].fill();
    sky[1].fillStyle = '#e8dcb0'; for (const [x, y, rr] of [[100, 70, 6], [124, 90, 5], [112, 64, 3]]) { sky[1].beginPath(); sky[1].arc(x, y, rr, 0, 7); sky[1].fill(); }
    const far = cv(500, 150), g1 = far[1]; mountains(g1, 500, 150, 90, '#1e1a48', null, r, 6);
    const mid = cv(560, 160), g2 = mid[1];
    for (const x of [120, 340, 470]) { px(g2, x, 70, 60, 90, '#14102e'); poly2(g2, [[x - 10, 72], [x + 30, 40], [x + 70, 72]], '#1c1640'); poly2(g2, [[x + 6, 70], [x + 30, 50], [x + 54, 70]], '#14102e'); for (let k = 0; k < 3; k++) px(g2, x + 10 + k * 18, 94, 6, 10, '#ffc860'); }
    for (let i = 0; i < 40; i++) pine(g2, i * 14 + r() * 8, 160, 30 + r() * 12, '#0e1a2a', '#14283a');
    const gr = groundTex(900, 56, '#5a5a78', '#2a2a44', ['#6a6a8a', '#3a3a58', '#4a4a6a'], r, '#8a8aa8');
    const g3 = gr.getContext('2d'); for (let i = 0; i < 38; i++) px(g3, i * 24 + r() * 8, 14 + r() * 30, 14, 1, '#25253e');
    return { sky: sky[0], far: far[0], mid: mid[0], ground: gr, horizon: 0.44, tint: '#e6e6ff' };
  },
};
