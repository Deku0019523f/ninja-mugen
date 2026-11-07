// Décor « Cratère du Volcan »
import { cv, grad, px, mountains, groundTex } from './_draw.js';

export default {
  id: 'volcano', name: 'Cratère du Volcan',
  build(r) {
    const sky = cv(320, 240); grad(sky[1], 320, 240, [[0, '#2a0808'], [.5, '#8a2412'], [1, '#ff8a2a']]);
    for (let i = 0; i < 30; i++) px(sky[1], r() * 320, 20 + r() * 150, 1 + r() * 2, 1 + r() * 2, 'rgba(255,200,80,.6)');
    const far = cv(500, 150), g1 = far[1]; mountains(g1, 500, 150, 130, '#3a1010', null, r, 4);
    g1.fillStyle = '#ff6a1a'; g1.beginPath(); g1.moveTo(240, 24); g1.lineTo(250, 40); g1.lineTo(236, 40); g1.fill();
    const mid = cv(560, 160), g2 = mid[1]; mountains(g2, 560, 160, 80, '#240808', null, r, 9);
    for (let i = 0; i < 10; i++) { px(g2, i * 56 + r() * 30, 140 + r() * 16, 30, 3, '#ff7a1a'); px(g2, i * 56 + r() * 30, 148, 20, 2, '#ffc040'); }
    const gr = groundTex(900, 56, '#3a2420', '#1a0e0c', ['#4a2e28', '#241410', '#5a3a30'], r, '#6a4a3a');
    const g3 = gr.getContext('2d'); for (let i = 0; i < 20; i++) { const x = r() * 900, y = 10 + r() * 40; px(g3, x, y, 8 + r() * 14, 1, '#ff6a1a'); px(g3, x + 1, y + 1, 6, 1, '#ffc040'); }
    return { sky: sky[0], far: far[0], mid: mid[0], ground: gr, horizon: 0.44, tint: '#ffe0d0', embers: true };
  },
};
