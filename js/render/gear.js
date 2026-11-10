// ============================================================
//  GEAR : armes tenues en main, tenues, ailes, queues, accessoires de tête.
//  Tout est dessiné sur le canvas du sprite (128x128) ; angle 0 = vers le bas, + = vers l'avant.
//  Les armes se dessinent dans un repère local : +x = direction de l'avant-bras, +y = « dessous ».
// ============================================================
import { hexShade } from '../data/roster.js';

const D2R = Math.PI / 180, OUT = '#14101c', TAU = Math.PI * 2;
const poly = (g, pts, fill, stroke = OUT, lw = 1.2) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } };
const metal = (g, y0, y1, hi = '#f6f8ff', mid = '#aab2c8', lo = '#5c6480') => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, hi); gr.addColorStop(0.5, mid); gr.addColorStop(1, lo); return gr; };
const rect = (g, x, y, w, h, fill, stroke = OUT) => { g.fillStyle = fill; g.fillRect(x, y, w, h); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.strokeRect(x, y, w, h); } };
const line = (g, x0, y0, x1, y1, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
const wrap = (g, x0, x1, w, c1, c2) => { rect(g, x0, -w / 2, x1 - x0, w, c1); g.strokeStyle = c2; g.lineWidth = 1; for (let x = x0 + 2; x < x1; x += 3.4) { g.beginPath(); g.moveTo(x, -w / 2); g.lineTo(x + 1.6, w / 2); g.stroke(); } };

// lame générique : longueur, largeur, courbure (en +y), pointe
function blade(g, from, len, w, curve = 0, tip = 6) {
  const gr = metal(g, -w, w);
  const top = [[from, -w], [from + len * 0.5, -w - curve * 0.6], [from + len - tip, -w * 0.9 - curve], [from + len, -curve * 0.7 + 0.4]];
  const bot = [[from + len - tip * 0.7, w * 0.3 - curve * 0.7], [from + len * 0.5, w * 0.7 - curve * 0.3], [from, w * 0.8]];
  poly(g, [...top, ...bot], gr);
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(from + 2, -w + 0.6); g.quadraticCurveTo(from + len * 0.5, -w - curve * 0.6 + 0.4, from + len - tip, -w * 0.9 - curve + 0.4); g.stroke();
  g.strokeStyle = 'rgba(70,80,110,.55)'; g.lineWidth = 0.8; g.setLineDash([2, 2]); g.beginPath(); g.moveTo(from + 3, w * 0.35); g.quadraticCurveTo(from + len * 0.5, w * 0.35 - curve * 0.4, from + len - tip - 2, -curve * 0.6 + 0.8); g.stroke(); g.setLineDash([]);
}
const guard = (g, x, ch, r = 4.4) => { g.fillStyle = hexShade(ch.acc, -0.1); g.strokeStyle = OUT; g.lineWidth = 1; g.beginPath(); g.ellipse(x, 0, 1.8, r, 0, 0, TAU); g.fill(); g.stroke(); };

// ---------- armes : chacune dessinée avec la main en (0,0)
const W = {
  katana(g, ch) { wrap(g, -9, 3, 3.4, '#2a2230', hexShade(ch.acc, 0.1)); guard(g, 4, ch); blade(g, 5, 50, 1.9, 2.4, 7); },
  nodachi(g, ch) { wrap(g, -12, 3, 3.4, '#2a2230', hexShade(ch.acc, 0.1)); guard(g, 4, ch, 5); blade(g, 5, 70, 2.2, 3.4, 8); },
  claymore(g, ch) { wrap(g, -12, 3, 3.8, '#3a2a20', hexShade(ch.acc, 0.1)); g.fillStyle = hexShade(ch.acc, 0.05); g.strokeStyle = OUT; g.lineWidth = 1; g.fillRect(3, -7, 3.4, 14); g.strokeRect(3, -7, 3.4, 14); blade(g, 6, 58, 4.6, 0.6, 9); g.fillStyle = 'rgba(40,50,80,.4)'; g.fillRect(10, -0.9, 40, 1.8); },
  spear(g, ch) { rect(g, -30, -1.5, 76, 3, '#7a5a34'); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-28, -0.6); g.lineTo(44, -0.6); g.stroke(); poly(g, [[44, -2], [52, -5.4], [70, 0], [52, 5.4], [44, 2]], metal(g, -5, 5)); poly(g, [[43, -2.2], [37, -7], [40, 0], [37, 7], [43, 2.2]], ch.acc, OUT, 0.9); },
  scythe(g, ch) { rect(g, -26, -1.5, 66, 3, '#5a4a40'); rect(g, 12, -2.6, 2.6, 5.2, hexShade(ch.acc, -0.2)); poly(g, [[38, -2], [46, -10], [58, -14], [74, -8], [62, -9], [50, -4], [42, 2]], metal(g, -14, 2), OUT, 1.2); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1; g.beginPath(); g.moveTo(48, -10); g.quadraticCurveTo(60, -14, 72, -8.4); g.stroke(); },
  daggers(g, ch) { wrap(g, -6, 2, 3, '#2a2230', ch.acc); guard(g, 3, ch, 3.2); blade(g, 4, 20, 1.6, 0.8, 5); g.strokeStyle = ch.acc; g.lineWidth = 1.4; g.beginPath(); g.arc(-8.5, 0, 2.4, 0, TAU); g.stroke(); },
  bo(g, ch) { rect(g, -32, -1.9, 76, 3.8, '#8a5e30'); g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(-30, -1.5, 72, 1); rect(g, -34, -2.2, 4, 4.4, '#9aa0b0'); rect(g, 42, -2.2, 4, 4.4, '#9aa0b0'); rect(g, 8, -2.2, 2.4, 4.4, ch.acc); },
  staff(g, ch) { rect(g, -30, -1.6, 72, 3.2, '#6a4a2a'); g.strokeStyle = '#d8c070'; g.lineWidth = 2; g.beginPath(); g.arc(44, 0, 6.4, 0, TAU); g.stroke(); for (let i = 0; i < 3; i++) { g.fillStyle = '#d8c070'; g.beginPath(); g.arc(44 + 6.4 * Math.cos(i * 2.1 + 0.6), 6.4 * Math.sin(i * 2.1 + 0.6), 1.5, 0, TAU); g.fill(); } g.fillStyle = hexShade(ch.acc, 0.2); g.beginPath(); g.arc(44, 0, 2.6, 0, TAU); g.fill(); },
  hammer(g, ch) { rect(g, -12, -1.9, 50, 3.8, '#6a4a2a'); rect(g, 36, -10, 20, 20, metal(g, -10, 10, '#d8dce8', '#8a90a8', '#4a5068')); g.strokeStyle = hexShade(ch.acc, 0.1); g.lineWidth = 2; g.strokeRect(38, -8, 16, 16); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(40, -8, 12, 2); },
  axe(g, ch) { rect(g, -14, -1.8, 56, 3.6, '#6a4a2a'); poly(g, [[34, -3], [40, -16], [54, -20], [56, 0], [54, 20], [40, 16], [34, 3]], metal(g, -18, 18), OUT, 1.3); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(54, -19); g.lineTo(56, 0); g.lineTo(54, 19); g.stroke(); },
  fan(g, ch, clock) { const sw = Math.sin(clock * 0.2) * 0.04; g.save(); g.rotate(sw); g.fillStyle = hexShade(ch.acc, 0); g.strokeStyle = OUT; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 26, -1.2, 1.2); g.closePath(); g.fill(); g.stroke(); g.fillStyle = hexShade(ch.top, 0.1); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 20, -1.2, 1.2); g.closePath(); g.fill(); g.strokeStyle = 'rgba(40,20,20,.7)'; g.lineWidth = 0.9; for (let a = -1.0; a <= 1.01; a += 0.4) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); g.stroke(); } g.strokeStyle = hexShade(ch.acc, 0.4); g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, 26, -1.2, 1.2); g.stroke(); g.restore(); },
  nunchaku(g, ch, clock) { rect(g, -6, -1.8, 20, 3.6, '#4a3020'); const a = Math.sin(clock * 0.3) * 0.5 + 0.9; g.strokeStyle = '#b0b4c0'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(14, 0); g.lineTo(14 + 8 * Math.cos(a * 0.5), 8 * Math.sin(a * 0.5)); g.stroke(); g.save(); g.translate(14 + 8 * Math.cos(a * 0.5), 8 * Math.sin(a * 0.5)); g.rotate(a); rect(g, 0, -1.8, 22, 3.6, '#4a3020'); g.restore(); },
  claws(g, ch) { rect(g, -2, -4.2, 8, 8.4, metal(g, -4, 4, '#c8ccd8', '#808898', '#444a5c')); for (let i = -1; i <= 1; i++) { poly(g, [[6, i * 3 - 1.1], [26 + (1 - Math.abs(i)) * 5, i * 4.2], [6, i * 3 + 1.1]], metal(g, -4, 4), OUT, 0.9); } },
  gauntlet(g, ch) { g.fillStyle = metal(g, -6, 6, '#e0e4ee', '#8c94aa', '#4a5068'); g.strokeStyle = OUT; g.lineWidth = 1.2; g.beginPath(); g.roundRect(-6, -6.2, 15, 12.4, 3); g.fill(); g.stroke(); g.fillStyle = hexShade(ch.acc, 0.1); g.fillRect(-6, -2, 5, 4); for (let i = -1; i <= 1; i++) { g.fillStyle = '#dfe3ee'; g.beginPath(); g.arc(9.5, i * 3.4, 1.7, 0, TAU); g.fill(); } },
  kusarigama(g, ch, clock) { rect(g, -8, -1.6, 34, 3.2, '#5a4030'); poly(g, [[24, -2], [28, -10], [40, -14], [46, -6], [36, -8], [30, -3], [27, 2]], metal(g, -14, 2)); g.strokeStyle = '#9aa0b0'; g.lineWidth = 1.2; g.setLineDash([2, 1.6]); g.beginPath(); g.moveTo(-4, 4); g.quadraticCurveTo(-16, 16 + Math.sin(clock * 0.25) * 4, -26, 12 + Math.sin(clock * 0.25 + 1) * 5); g.stroke(); g.setLineDash([]); g.fillStyle = '#6a7088'; g.beginPath(); g.arc(-26, 12 + Math.sin(clock * 0.25 + 1) * 5, 3.4, 0, TAU); g.fill(); g.stroke(); },
  trident(g, ch) { rect(g, -30, -1.5, 72, 3, '#5a6a80'); for (const [dy, l] of [[-6, 16], [0, 22], [6, 16]]) poly(g, [[40, dy - 1.4], [40 + l, dy], [40, dy + 1.4]], metal(g, -6, 6)); g.strokeStyle = '#9aa0b0'; g.lineWidth = 2; g.beginPath(); g.moveTo(40, -6); g.lineTo(40, 6); g.stroke(); },
  brush(g, ch) { rect(g, -20, -1.6, 60, 3.2, '#6a4a2a'); g.fillStyle = '#16121a'; g.beginPath(); g.moveTo(40, -3.4); g.quadraticCurveTo(58, -4, 66, 0); g.quadraticCurveTo(58, 4, 40, 3.4); g.closePath(); g.fill(); g.fillStyle = ch.acc; g.beginPath(); g.moveTo(58, -2); g.quadraticCurveTo(66, 0, 58, 2); g.fill(); },
  flasks(g, ch) { g.fillStyle = 'rgba(200,230,255,.75)'; g.strokeStyle = OUT; g.lineWidth = 1; g.beginPath(); g.moveTo(2, -3); g.lineTo(8, -3); g.lineTo(8, 0); g.lineTo(12, 6); g.lineTo(-2, 6); g.lineTo(2, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = ch.acc; g.beginPath(); g.moveTo(-1, 3.4); g.lineTo(11, 3.4); g.lineTo(12, 6); g.lineTo(-2, 6); g.fill(); rect(g, 3, -5, 4, 2, '#8a6a40'); },
  chain(g, ch, clock) { for (let i = 0; i < 6; i++) { g.strokeStyle = '#a8aebe'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(4 + i * 5, Math.sin(clock * 0.2 + i * 0.7) * 3, 3, 1.8, 0, 0, TAU); g.stroke(); } poly(g, [[34, -2], [44, -5], [50, 0], [44, 5], [34, 2]], metal(g, -5, 5)); },
  scroll(g, ch) { rect(g, 0, -4, 20, 8, '#e8d8b0'); rect(g, -1, -5, 3, 10, '#a05a3a'); rect(g, 18, -5, 3, 10, '#a05a3a'); g.fillStyle = '#a02020'; g.fillRect(8, -1, 4, 2); },
};
W.dagger = W.daggers;

export const WEAPONS = Object.keys(W);

// ---- arme tenue en main : (x,y) = main ; deg = direction de l'avant-bras ; back = main arrière
export function drawWeapon(g, kind, x, y, deg, ch, clock, back = false) {
  const fn = W[kind]; if (!fn) return;
  const th = Math.atan2(Math.cos(deg * D2R), Math.sin(deg * D2R));
  g.save(); g.translate(x, y); g.rotate(th);
  if (back) g.globalAlpha = 0.92;
  fn(g, ch, clock);
  g.restore();
}

// ---- éléments derrière le corps
export function drawBackGear(g, ch, c) {
  const ex = ch.ex, { sx, sy, hx, hy, clock } = c, wav = Math.sin(clock * 0.15);
  if (ex.includes('wings')) {
    const fl = Math.sin(clock * 0.12) * 5, col = ch.wc || hexShade(ch.acc, -0.5);
    for (const k of [0, 1]) {
      g.save(); g.translate(sx - 3, sy + 4); g.rotate((-30 - k * 14 + fl * (k ? -1 : 1)) * D2R);
      for (let i = 0; i < 6; i++) { const a = (-70 + i * 22) * D2R; const L = 38 - i * 2.4 - k * 5; poly(g, [[0, 0], [Math.cos(a - 0.12) * L * 0.9, Math.sin(a - 0.12) * L * 0.9], [Math.cos(a) * L, Math.sin(a) * L], [Math.cos(a + 0.12) * L * 0.9, Math.sin(a + 0.12) * L * 0.9]], i % 2 ? col : hexShade(col, 0.15), OUT, 1); }
      g.restore();
    }
  }
  if (ex.includes('tail')) {
    const sw = Math.sin(clock * 0.14) * 6, x0 = hx - 4, y0 = hy + 2;
    g.beginPath(); g.moveTo(x0, y0 - 3); g.bezierCurveTo(x0 - 18, y0 - 6 + sw, x0 - 30, y0 + 6 + sw, x0 - 32 - sw * 0.4, y0 - 14 + sw); g.bezierCurveTo(x0 - 24, y0 + 12, x0 - 12, y0 + 10, x0 - 2, y0 + 4); g.closePath();
    g.fillStyle = ch.hc; g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.3; g.stroke();
    g.fillStyle = hexShade(ch.hc, 0.45); g.beginPath(); g.arc(x0 - 32 - sw * 0.4, y0 - 14 + sw, 4.4, 0, TAU); g.fill();
  }
  if (ex.includes('marionette')) {
    const mx = sx - 30, my = sy - 18 + Math.sin(clock * 0.1) * 4, sw = Math.sin(clock * 0.2) * 5;
    g.strokeStyle = OUT; g.lineWidth = 1; g.beginPath(); g.moveTo(mx, my + 5); g.lineTo(mx - 1, my + 18); g.moveTo(mx, my + 8); g.lineTo(mx - 6 + sw * 0.4, my + 14); g.moveTo(mx, my + 8); g.lineTo(mx + 6 - sw * 0.4, my + 14); g.moveTo(mx - 1, my + 18); g.lineTo(mx - 5 - sw * 0.5, my + 26); g.moveTo(mx - 1, my + 18); g.lineTo(mx + 3 + sw * 0.5, my + 26); g.stroke();
    g.fillStyle = '#e8c8a0'; g.strokeStyle = OUT; g.beginPath(); g.arc(mx, my, 5, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = ch.acc; g.fillRect(mx - 4, my + 4, 8, 10); g.fillStyle = '#16121a'; g.fillRect(mx - 2.4, my - 1, 1.6, 1.6); g.fillRect(mx + 1, my - 1, 1.6, 1.6);
  }
  if (ex.includes('robe')) {   // pan arrière de la robe
    poly(g, [[hx - 8, hy - 2], [hx - 14 + wav, hy + 24], [hx + 2, hy + 24], [hx + 6, hy - 2]], hexShade(ch.top, -0.25));
  }
}

// ---- tenues par-dessus le torse (avant la jambe avant)
export function drawTorsoGear(g, ch, c) {
  const ex = ch.ex, { sx, sy, hx, hy, lx, ly, clock } = c, nx = ly, ny = lx;
  const at = (k, o) => [hx + (sx - hx) * k + nx * o, hy + (sy - hy) * k + ny * o];
  const wav = Math.sin(clock * 0.16) * 2;
  if (ex.includes('armor')) {
    const a = at(0.2, -8), b = at(0.2, 8), cc = at(0.95, 8), d = at(0.95, -8);
    poly(g, [a, b, cc, d], metal(g, Math.min(a[1], d[1]), Math.max(b[1], cc[1]), '#c8ccd8', hexShade(ch.acc, -0.05), '#4a5068'));
    const m1 = at(0.55, -7), m2 = at(0.55, 7); line(g, m1[0], m1[1], m2[0], m2[1], 1, 'rgba(20,20,40,.6)');
    const e1 = at(0.5, 0), e2 = at(0.88, 0); line(g, e1[0], e1[1], e2[0], e2[1], 1.6, hexShade(ch.acc, 0.3));
  }
  if (ex.includes('coat')) { poly(g, [[hx - 7, hy - 3], [hx - 12 + wav, hy + 18], [hx + 2 + wav, hy + 20], [hx + 8, hy - 3]], hexShade(ch.top, -0.12)); line(g, hx + 1, hy - 2, hx + 1 + wav * 0.5, hy + 19, 1, ch.acc); }
  if (ex.includes('robe')) { poly(g, [[hx - 8, hy - 3], [hx - 13 + wav, hy + 22], [hx + 6 + wav, hy + 23], [hx + 8, hy - 3]], ch.top); line(g, hx - 12 + wav, hy + 21, hx + 6 + wav, hy + 22, 2.4, ch.acc); line(g, hx + 1, hy - 2, hx + 1 + wav * 0.6, hy + 21, 1, hexShade(ch.top, -0.35)); }
  if (ex.includes('fur')) { for (let i = -2; i <= 2; i++) { const p = at(1, i * 3.2); g.fillStyle = i % 2 ? '#f0ece4' : '#d8d2c6'; g.strokeStyle = OUT; g.lineWidth = 0.8; g.beginPath(); g.arc(p[0], p[1] + 1, 4.2, 0, TAU); g.fill(); g.stroke(); } }
  if (ex.includes('vest')) { const a = at(0.15, -6.4), b = at(0.15, 6.4), cc = at(0.92, 6.4), d = at(0.92, -6.4); poly(g, [a, b, cc, d], hexShade(ch.acc, -0.35)); const m1 = at(0.15, 0), m2 = at(0.92, 0); line(g, m1[0], m1[1], m2[0], m2[1], 1, OUT); for (let k = 0.3; k < 0.9; k += 0.2) { const p = at(k, 2.4); g.fillStyle = hexShade(ch.acc, 0.3); g.fillRect(p[0] - 1, p[1] - 1, 2, 2); } }
  if (ex.includes('kimono')) { const a = at(0.95, -7), b = at(0.2, 7), m = at(0.3, 0); line(g, a[0], a[1], b[0], b[1], 2.4, hexShade(ch.acc, 0.1)); line(g, hx - 6 * ly, hy - 6 * lx, hx + 6 * ly, hy + 6 * lx, 4, ch.acc); }
  if (ex.includes('bandolier')) { const a = at(0.95, 6), b = at(0.2, -6); line(g, a[0], a[1], b[0], b[1], 3.4, '#3a2a20'); for (let k = 0.3; k < 0.9; k += 0.15) { const p = [a[0] + (b[0] - a[0]) * (k - 0.2) / 0.7, a[1] + (b[1] - a[1]) * (k - 0.2) / 0.7]; g.fillStyle = '#d8a850'; g.fillRect(p[0] - 1, p[1] - 1.4, 2.2, 2.8); } }
}

// ---- éléments sur les bras (après le bras avant)
export function drawArmGear(g, ch, c, front) {
  const ex = ch.ex;
  const [hx_, hy_, kx, ky] = front ? c.ra : c.la;
  if (ex.includes('bandage')) { for (let k = 0.2; k < 1; k += 0.25) { const x = kx + (hx_ - kx) * k, y = ky + (hy_ - ky) * k; line(g, x - 2.6, y - 1.6, x + 2.6, y + 1.6, 1.8, '#efe8d8'); } }
  if (ex.includes('bracers')) { const x = kx + (hx_ - kx) * 0.6, y = ky + (hy_ - ky) * 0.6; g.fillStyle = hexShade(ch.acc, -0.1); g.strokeStyle = OUT; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 3.6, 0, TAU); g.fill(); g.stroke(); }
}

// ---- accessoires de tête (repère local de la tête : visage vers +x). phase 'pre' = derrière la tête, 'post' = au-dessus des cheveux
export function drawHeadGear(g, ch, phase, clock) {
  const ex = ch.ex, hc = ch.hc, w = Math.sin(clock * 0.18);
  if (phase === 'pre') {
    if (ex.includes('halo')) { g.strokeStyle = 'rgba(255,240,160,.95)'; g.lineWidth = 2.6; g.beginPath(); g.ellipse(-2, -18, 11, 3.2, -0.1, 0, TAU); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.stroke(); }
    return;
  }
  if (ex.includes('ears')) { for (const [x, a] of [[-4, -0.25], [4, 0.15]]) { g.save(); g.translate(x, -8); g.rotate(a); poly(g, [[-4, 0], [0, -12], [4, 0]], hc); poly(g, [[-2, -1], [0, -8], [2, -1]], hexShade(ch.acc, 0.2), null); g.restore(); } }
  if (ex.includes('crown')) { for (let i = -2; i <= 2; i++) { const x = i * 3.6, h = 8 - Math.abs(i) * 1.4 + Math.sin(clock * 0.25 + i) * 1.2; poly(g, [[x - 2, -9], [x, -9 - h], [x + 2, -9]], i % 2 ? '#ff8a1a' : '#ffd23a', null); poly(g, [[x - 1, -9], [x, -9 - h * 0.55], [x + 1, -9]], '#fff2a0', null); } }
  if (ex.includes('goggles')) { g.fillStyle = ch.acc; g.fillRect(-10, -8.6, 21, 2.2); g.fillStyle = 'rgba(120,200,255,.85)'; g.strokeStyle = OUT; g.lineWidth = 1; g.beginPath(); g.arc(-6, -11, 4.4, 0, TAU); g.arc(3, -11.4, 4.4, 0, TAU); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(-8, -13, 2, 1.4); g.fillRect(1, -13.4, 2, 1.4); }
  if (ex.includes('ribbon')) { poly(g, [[-9, -7], [-16 - w, -12], [-15, -5], [-9, -6]], ch.acc); poly(g, [[-9, -7], [-17 - w, -3], [-14, -1], [-9, -6]], hexShade(ch.acc, -0.2)); dot(g, -9, -6.6, 2, hexShade(ch.acc, 0.2)); }
  if (ex.includes('flower')) { for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; g.fillStyle = i % 2 ? '#ffd0e0' : '#ff9ac0'; g.beginPath(); g.arc(-3 + Math.cos(a) * 3, -11 + Math.sin(a) * 3, 2.4, 0, TAU); g.fill(); } g.fillStyle = '#ffe066'; g.beginPath(); g.arc(-3, -11, 1.8, 0, TAU); g.fill(); }
  if (ex.includes('sprout')) { g.strokeStyle = '#2a7a2a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -11); g.quadraticCurveTo(1, -17, 4, -19); g.stroke(); for (const [dx, a] of [[-1, 2.6], [4, 0.2]]) { g.save(); g.translate(1 + dx, -17); g.rotate(a); g.fillStyle = '#6ae04a'; g.strokeStyle = OUT; g.lineWidth = 0.8; g.beginPath(); g.ellipse(4, 0, 5, 2.6, 0, 0, TAU); g.fill(); g.stroke(); g.restore(); } }
  if (ex.includes('veil')) { g.fillStyle = hexShade(ch.acc, 0.1); g.globalAlpha = 0.9; g.beginPath(); g.moveTo(-1, 1); g.lineTo(11, 1.6); g.lineTo(10, 9); g.lineTo(0, 10); g.closePath(); g.fill(); g.globalAlpha = 1; line(g, -1, 1, 11, 1.6, 1, OUT); }
  if (ex.includes('antenna')) { for (const [x, a] of [[2, 0.2], [6, 0.6]]) { g.strokeStyle = hexShade(hc, 0.1); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, -10); g.quadraticCurveTo(x + 3 + a * 3 + w, -18, x + 6 + a * 4, -20 - a * 2); g.stroke(); g.fillStyle = ch.acc; g.beginPath(); g.arc(x + 6 + a * 4, -20 - a * 2, 1.6, 0, TAU); g.fill(); } }
  if (ex.includes('shades')) { g.fillStyle = '#10101a'; g.fillRect(1, -4, 10, 4); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(2, -3.4, 2.4, 1); g.strokeStyle = '#10101a'; g.lineWidth = 1; g.beginPath(); g.moveTo(1, -2); g.lineTo(-8, -3.4); g.stroke(); }
  if (ex.includes('bandana')) { g.fillStyle = ch.acc; g.beginPath(); g.moveTo(-10, -7); g.lineTo(11, -7.6); g.lineTo(11, -3.6); g.lineTo(-10, -3); g.closePath(); g.fill(); poly(g, [[-10, -5], [-17 - w, -3], [-15, -8]], ch.acc); g.strokeStyle = OUT; g.lineWidth = 0.9; g.strokeRect(-10, -7.4, 21, 3.6); }
  if (ex.includes('kabuto')) { poly(g, [[-11, -2], [-11, -10], [-4, -16], [8, -14], [12, -7], [12, -3], [5, -8], [-3, -7]], metal(g, -16, -2, '#b8bcc8', hexShade(ch.acc, -0.1), '#3a4058')); poly(g, [[-3, -15], [0, -26], [3, -14]], hexShade(ch.acc, 0.2)); }
}
function dot(g, x, y, r, c) { g.fillStyle = OUT; g.beginPath(); g.arc(x, y, r + 1, 0, TAU); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
