// Décor « Désert Brûlant »
import { cv, grad, px, groundTex } from './_draw.js';

export default {
  id: 'desert', name: 'Désert Brûlant',
  build(r) {
    const sky = cv(320, 240); grad(sky[1], 320, 240, [[0, '#d8602a'], [.45, '#f4a04a'], [1, '#ffe0a0']]);
    sky[1].fillStyle = '#fff4c0'; sky[1].beginPath(); sky[1].arc(220, 100, 26, 0, 7); sky[1].fill(); sky[1].fillStyle = 'rgba(255,244,192,.3)'; sky[1].beginPath(); sky[1].arc(220, 100, 40, 0, 7); sky[1].fill();
    const far = cv(500, 150), g1 = far[1]; g1.fillStyle = '#c8803a'; g1.beginPath(); g1.moveTo(0, 150); for (let x = 0; x <= 500; x += 10) g1.lineTo(x, 100 + Math.sin(x * 0.02) * 14 + Math.sin(x * 0.07) * 4); g1.lineTo(500, 150); g1.fill();
    const mid = cv(560, 160), g2 = mid[1]; g2.fillStyle = '#a8602a'; g2.beginPath(); g2.moveTo(0, 160); for (let x = 0; x <= 560; x += 10) g2.lineTo(x, 120 + Math.sin(x * 0.03 + 2) * 12); g2.lineTo(560, 160); g2.fill();
    for (const x of [90, 250, 420]) { px(g2, x, 60, 22, 100, '#8a4a20'); px(g2, x - 4, 56, 30, 10, '#9a5a28'); px(g2, x + 2, 66, 4, 94, '#a86a34'); }
    for (let i = 0; i < 6; i++) { const x = 40 + i * 95 + r() * 30; px(g2, x, 130, 3, 18, '#3a6a2a'); px(g2, x - 4, 134, 3, 8, '#3a6a2a'); px(g2, x + 3, 136, 3, 6, '#3a6a2a'); }
    const gr = groundTex(900, 56, '#e8b060', '#c88a3a', ['#f8cc80', '#b87a30', '#d8a050'], r, '#f8d48a');
    return { sky: sky[0], far: far[0], mid: mid[0], ground: gr, horizon: 0.44, tint: '#fff' };
  },
};
