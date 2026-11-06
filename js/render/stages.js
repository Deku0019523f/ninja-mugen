// ============================================================
//  DÉCORS : 6 stages générés procéduralement (dessinés en demi-résolution = look pixel art)
//  Chaque stage = couches à parallaxe [{c, w, h, par, y, z}]
// ============================================================

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const grad = (g, w, h, stops) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => gr.addColorStop(p, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
const px = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

function cloud(g, x, y, s, col = '#fff', sh = '#dfeaf8') {
  g.fillStyle = sh; for (const [dx, dy, r] of [[0, 3, 9], [10, 0, 12], [22, 3, 9], [12, 6, 11]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s + 2, r * s, 0, 7); g.fill(); }
  g.fillStyle = col; for (const [dx, dy, r] of [[0, 2, 8], [10, -1, 11], [22, 2, 8]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); g.fill(); }
}
function mountains(g, w, base, hgt, col, snow, r, n) {
  for (let i = 0; i < n; i++) {
    const cx = (i + 0.5) * w / n + (r() - .5) * 20, h = hgt * (0.6 + r() * 0.5), hw = w / n * (0.75 + r() * 0.4);
    g.fillStyle = col; g.beginPath(); g.moveTo(cx - hw, base); g.lineTo(cx - hw * .08, base - h); g.lineTo(cx + hw * .1, base - h * 0.96); g.lineTo(cx + hw, base); g.fill();
    if (snow) { g.fillStyle = snow; g.beginPath(); g.moveTo(cx - hw * .08, base - h); g.lineTo(cx + hw * .1, base - h * .96); g.lineTo(cx + hw * .32, base - h * .62); g.lineTo(cx + hw * .12, base - h * .7); g.lineTo(cx, base - h * .55); g.lineTo(cx - hw * .14, base - h * .7); g.lineTo(cx - hw * .3, base - h * .6); g.fill(); }
  }
}
function pine(g, x, base, h, col, col2) {
  for (let i = 0; i < 4; i++) { const y = base - h + i * h * 0.22, w = 5 + i * 3.4; g.fillStyle = i % 2 ? col2 : col; g.beginPath(); g.moveTo(x, y); g.lineTo(x - w, y + h * 0.3); g.lineTo(x + w, y + h * 0.3); g.fill(); }
  px(g, x - 1, base - h * 0.12, 2, h * 0.12, '#4a3020');
}
function groundTex(w, h, base, dark, spots, r, rim) {
  const [c, g] = cv(w, h);
  grad(g, w, h, [[0, base], [1, dark]]);
  for (let i = 0; i < w * h / 40; i++) px(g, r() * w, r() * h, 1 + r() * 3, 1, spots[(r() * spots.length) | 0]);
  if (rim) px(g, 0, 0, w, 2, rim);
  return c;
}

// ---------------------------------------------------------------- stages
const mk = {
  forest(r) {
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
  plains(r) {
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
  desert(r) {
    const sky = cv(320, 240); grad(sky[1], 320, 240, [[0, '#d8602a'], [.45, '#f4a04a'], [1, '#ffe0a0']]);
    sky[1].fillStyle = '#fff4c0'; sky[1].beginPath(); sky[1].arc(220, 100, 26, 0, 7); sky[1].fill(); sky[1].fillStyle = 'rgba(255,244,192,.3)'; sky[1].beginPath(); sky[1].arc(220, 100, 40, 0, 7); sky[1].fill();
    const far = cv(500, 150), g1 = far[1]; g1.fillStyle = '#c8803a'; g1.beginPath(); g1.moveTo(0, 150); for (let x = 0; x <= 500; x += 10) g1.lineTo(x, 100 + Math.sin(x * 0.02) * 14 + Math.sin(x * 0.07) * 4); g1.lineTo(500, 150); g1.fill();
    const mid = cv(560, 160), g2 = mid[1]; g2.fillStyle = '#a8602a'; g2.beginPath(); g2.moveTo(0, 160); for (let x = 0; x <= 560; x += 10) g2.lineTo(x, 120 + Math.sin(x * 0.03 + 2) * 12); g2.lineTo(560, 160); g2.fill();
    for (const x of [90, 250, 420]) { px(g2, x, 60, 22, 100, '#8a4a20'); px(g2, x - 4, 56, 30, 10, '#9a5a28'); px(g2, x + 2, 66, 4, 94, '#a86a34'); }
    for (let i = 0; i < 6; i++) { const x = 40 + i * 95 + r() * 30; px(g2, x, 130, 3, 18, '#3a6a2a'); px(g2, x - 4, 134, 3, 8, '#3a6a2a'); px(g2, x + 3, 136, 3, 6, '#3a6a2a'); }
    const gr = groundTex(900, 56, '#e8b060', '#c88a3a', ['#f8cc80', '#b87a30', '#d8a050'], r, '#f8d48a');
    return { sky: sky[0], far: far[0], mid: mid[0], ground: gr, horizon: 0.44, tint: '#fff' };
  },
  snow(r) {
    const sky = cv(320, 240); grad(sky[1], 320, 240, [[0, '#6a8ac0'], [.5, '#b8cce8'], [1, '#eef4fc']]);
    cloud(sky[1], 30, 40, 1.4, '#f4f8ff', '#cfdcf0'); cloud(sky[1], 200, 60, 1.1, '#f4f8ff', '#cfdcf0');
    const far = cv(500, 150), g1 = far[1]; mountains(g1, 500, 150, 130, '#98aed0', '#ffffff', r, 4);
    const mid = cv(560, 160), g2 = mid[1]; mountains(g2, 560, 160, 60, '#7a90b8', '#eef4ff', r, 8);
    for (let i = 0; i < 60; i++) pine(g2, i * 9.4 + r() * 6, 160, 24 + r() * 16, '#2a5a4a', '#3a7a62');
    for (let i = 0; i < 60; i++) px(g2, r() * 560, 108 + r() * 50, 6 + r() * 6, 2, 'rgba(255,255,255,.8)');
    const gr = groundTex(900, 56, '#f4f8ff', '#c8d8ec', ['#ffffff', '#b8cce4', '#dce8f6'], r, '#ffffff');
    return { sky: sky[0], far: far[0], mid: mid[0], ground: gr, horizon: 0.44, tint: '#fff', snow: true };
  },
  night(r) {
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
  volcano(r) {
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
function poly2(g, pts, c) { g.fillStyle = c; g.beginPath(); g.moveTo(...pts[0]); pts.slice(1).forEach((p) => g.lineTo(...p)); g.fill(); }

export const STAGES = [
  { id: 'forest', name: 'Forêt Verdoyante' },
  { id: 'plains', name: 'Plaines des Cimes' },
  { id: 'desert', name: 'Désert Brûlant' },
  { id: 'snow', name: 'Col Enneigé' },
  { id: 'night', name: 'Temple de la Lune' },
  { id: 'volcano', name: 'Cratère du Volcan' },
];

export function buildStage(idx) {
  const def = STAGES[idx % STAGES.length];
  const s = mk[def.id](rng(1000 + idx * 77));
  return { ...def, ...s };
}
