// ============================================================
//  FX : textures de techniques « réalistes » générées sur canvas (plusieurs images animées par style),
//  faisceaux texturés, halos. Un style graphique par archétype ; couleurs reprises du personnage.
//  Les projectiles regardent vers la droite (+x) ; la vue les retourne selon la direction.
// ============================================================
import * as THREE from 'three';

const S = 128, FRAMES = 6;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; };
const rng = (seed) => { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgba = (hex, a) => { const [r, g, b] = rgb(hex); return `rgba(${r},${g},${b},${a})`; };
const TAU = Math.PI * 2;

export const mkTex = (c, nearest = false) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (nearest) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; } t.generateMipmaps = false; return t; };

// ---- briques de dessin
const glow = (g, x, y, r, color, a = 1) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(color, a)); gr.addColorStop(0.45, rgba(color, a * 0.35)); gr.addColorStop(1, rgba(color, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
const drop = (g, x, y, r, len, color, a) => {      // goutte allongée vers la gauche (traînée)
  const gr = g.createLinearGradient(x, 0, x - len, 0); gr.addColorStop(0, rgba(color, a)); gr.addColorStop(1, rgba(color, 0));
  g.fillStyle = gr; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x - len * 0.6, y - r * 0.9, x - len, y); g.quadraticCurveTo(x - len * 0.6, y + r * 0.9, x, y + r); g.closePath(); g.fill();
};
const spark = (g, x, y, r, color) => { glow(g, x, y, r * 2, color, 0.9); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, Math.max(0.6, r * 0.35), 0, TAU); g.fill(); };
const star = (g, x, y, r, a = 1) => {                // éclat en croix (lens flare)
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,255,255,${a})`;
  for (const [w, h] of [[r * 2.4, r * 0.18], [r * 0.18, r * 1.7]]) { g.beginPath(); g.ellipse(x, y, w, h, 0, 0, TAU); g.fill(); }
  g.restore();
};

// ---- un dessinateur par style : (g, p) avec p = {t: 0..1 (phase), r: rng, c1, c2, f: n° d'image}
const DRAW = {
  fire(g, p) {                                         // boule de feu avec queue de flammes
    const { t, r, c1, c2 } = p; g.globalCompositeOperation = 'lighter';
    glow(g, 84, 64, 58, c1, 0.55);
    for (let i = 0; i < 16; i++) { const k = i / 15, x = 80 - k * 66, y = 64 + Math.sin(t * TAU + i * 1.3) * (4 + k * 10) + (r() - 0.5) * 8; drop(g, x + 12, y, 20 * (1 - k * 0.55), 34, i % 3 ? c1 : c2, 0.55 * (1 - k * 0.5)); }
    for (let i = 0; i < 7; i++) { const a = r() * TAU, d = 14 + r() * 18; drop(g, 84 + Math.cos(a) * d * 0.6, 64 + Math.sin(a) * d, 9, 26, c1, 0.5); }
    glow(g, 88, 64, 30, c2, 0.95); glow(g, 90, 64, 18, '#ffffff', 1);
    for (let i = 0; i < 9; i++) spark(g, 20 + r() * 80, 64 + (r() - 0.5) * 46, 1.4 + r() * 1.6, c2);
  },
  sage(g, p) {                                         // sphère spirale (rasengan)
    const { t, c1, c2 } = p; g.globalCompositeOperation = 'lighter'; const cx = 64, cy = 64;
    glow(g, cx, cy, 62, c1, 0.5);
    const gr = g.createRadialGradient(cx, cy, 2, cx, cy, 32); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, rgba(c2, 0.9)); gr.addColorStop(1, rgba(c1, 0.15)); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, 32, 0, TAU); g.fill();
    for (let k = 0; k < 6; k++) { g.strokeStyle = `rgba(255,255,255,${0.55 - k * 0.05})`; g.lineWidth = 2.2; g.beginPath(); for (let a = 0; a < 5.2; a += 0.12) { const rr = 3 + a * 5.6, ang = a + t * TAU + (k * TAU) / 6; const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr; a ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.strokeStyle = rgba(c1, 0.8); g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 33 + Math.sin(t * TAU) * 1.5, 0, TAU); g.stroke();
  },
  art(g, p) {                                          // bombe d'argile fissurée, mèche qui crépite
    const { t, r, c1, c2 } = p; const cx = 66, cy = 68;
    glow(g, cx, cy, 50, c1, 0.35); g.globalCompositeOperation = 'source-over';
    const gr = g.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, 28); gr.addColorStop(0, '#7a5a3a'); gr.addColorStop(1, '#2a1c10'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, 27, 0, TAU); g.fill();
    g.strokeStyle = '#120a04'; g.lineWidth = 2; g.stroke();
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(c1, 0.9); g.lineWidth = 2; const rr = rng(7);
    for (let i = 0; i < 5; i++) { let x = cx, y = cy, a = rr() * TAU; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 4; s++) { a += (rr() - 0.5) * 1.2; x += Math.cos(a) * 7; y += Math.sin(a) * 7; g.lineTo(x, y); } g.stroke(); }
    glow(g, cx, cy, 20, c1, 0.5 + 0.2 * Math.sin(t * TAU));
    g.strokeStyle = '#d8c8a0'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + 6, cy - 26); g.quadraticCurveTo(cx + 14, cy - 36, cx + 8, cy - 42); g.stroke();
    spark(g, cx + 8, cy - 42, 4 + r() * 3, c2); for (let i = 0; i < 6; i++) spark(g, cx + 8 + (r() - 0.5) * 20, cy - 42 + (r() - 0.7) * 16, 1 + r(), c2);
  },
  brawler(g, p) {                                      // onde de choc : arcs concentriques
    const { t, c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 74, 64, 56, c1, 0.5);
    for (let i = 0; i < 4; i++) { const rr = 14 + i * 13 + ((t * 13) % 13), a = 1 - (rr / 70); g.strokeStyle = rgba(i % 2 ? c1 : c2, Math.max(0.1, a)); g.lineWidth = 6 - i; g.beginPath(); g.arc(50, 64, rr, -1.05, 1.05); g.stroke(); }
    glow(g, 78, 64, 20, '#ffffff', 0.9); glow(g, 78, 64, 30, c2, 0.8);
  },
  lightning(g, p) {                                    // éclair ramifié
    const { r, c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 64, 64, 60, c1, 0.4); g.lineJoin = 'round'; g.lineCap = 'round';
    const path = []; let y = 64; for (let x = 4; x <= 124; x += 10) { y += (r() - 0.5) * 26; y = Math.max(34, Math.min(94, y)); path.push([x, y]); }
    const draw = (pts, w, col, blur) => { g.shadowColor = c1; g.shadowBlur = blur; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([x, yy], i) => (i ? g.lineTo(x, yy) : g.moveTo(x, yy))); g.stroke(); g.shadowBlur = 0; };
    const branches = [];
    for (let b = 0; b < 3; b++) { const i = 2 + Math.floor(r() * (path.length - 4)), [x0, y0] = path[i], dir = r() > 0.5 ? 1 : -1, bp = [[x0, y0]]; let xx = x0, yy = y0; for (let s = 0; s < 3; s++) { xx += 9 + r() * 6; yy += dir * (6 + r() * 12); bp.push([xx, yy]); } branches.push(bp); }
    draw(path, 7, rgba(c1, 0.55), 14); for (const bp of branches) draw(bp, 3, rgba(c1, 0.7), 8);
    draw(path, 3.2, c2, 6); draw(path, 1.4, '#ffffff', 0); for (const bp of branches) draw(bp, 1, '#ffffff', 0);
    glow(g, 118, path[path.length - 1][1], 14, '#ffffff', 0.8);
  },
  light(g, p) {                                        // lance de lumière
    const { t, c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 84, 64, 58, c1, 0.5);
    const gr = g.createLinearGradient(8, 0, 118, 0); gr.addColorStop(0, rgba(c1, 0)); gr.addColorStop(0.7, rgba(c2, 0.9)); gr.addColorStop(1, '#ffffff'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(8, 64); g.lineTo(86, 58); g.lineTo(122, 64); g.lineTo(86, 70); g.closePath(); g.fill();
    glow(g, 100, 64, 22, '#ffffff', 0.9); star(g, 100, 64, 22 + Math.sin(t * TAU) * 3);
    for (let i = 0; i < 5; i++) spark(g, 16 + i * 14, 64 + Math.sin(t * TAU + i) * 5, 1.5, c2);
  },
  ice(g, p) {                                          // gerbe de cristaux facettés
    const { r, c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 70, 64, 54, c1, 0.4); g.globalCompositeOperation = 'source-over';
    const shard = (x, y, len, w, ang) => {
      g.save(); g.translate(x, y); g.rotate(ang);
      const gr = g.createLinearGradient(0, -w, 0, w); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, c2); gr.addColorStop(1, c1);
      g.fillStyle = gr; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-len * 0.4, 0); g.lineTo(-len * 0.1, -w); g.lineTo(len * 0.6, 0); g.lineTo(-len * 0.1, w); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(-len * 0.1, -w); g.lineTo(len * 0.6, 0); g.lineTo(len * 0.1, -w * 0.1); g.closePath(); g.fill(); g.restore();
    };
    shard(60, 64, 78, 15, 0); shard(52, 46, 52, 10, -0.28); shard(52, 82, 52, 10, 0.28); shard(38, 64, 36, 7, 0.1);
    g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 10; i++) spark(g, 14 + r() * 70, 64 + (r() - 0.5) * 50, 1 + r() * 1.5, '#ffffff');
  },
  bone(g, p) {                                         // pointe d'os
    const { c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 64, 64, 40, c1, 0.25); g.globalCompositeOperation = 'source-over';
    const gr = g.createLinearGradient(0, 56, 0, 72); gr.addColorStop(0, '#fffff0'); gr.addColorStop(0.55, c1); gr.addColorStop(1, '#8a8870'); g.fillStyle = gr; g.strokeStyle = '#3a382a'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(8, 60); g.arc(10, 58, 5, 1.2, 4.6); g.lineTo(34, 59); g.lineTo(122, 64); g.lineTo(34, 69); g.lineTo(14, 70); g.arc(10, 70, 5, 4.6, 7.9); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(36, 60, 56, 1.6); g.fillStyle = c2; g.globalAlpha = 0.5; g.fillRect(40, 66, 40, 1.2); g.globalAlpha = 1;
  },
  puppet(g, p) {                                       // aiguille d'acier + fil
    const { c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 100, 64, 26, c2, 0.35);
    g.strokeStyle = rgba(c1, 0.4); g.lineWidth = 1; g.beginPath(); g.moveTo(0, 64); g.lineTo(34, 64); g.stroke();
    g.globalCompositeOperation = 'source-over'; const gr = g.createLinearGradient(0, 61, 0, 67); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#aab0c0'); gr.addColorStop(1, '#4a5060'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(30, 62); g.lineTo(116, 63.6); g.lineTo(124, 64); g.lineTo(116, 64.4); g.lineTo(30, 66); g.closePath(); g.fill();
    g.fillStyle = c1; g.fillRect(24, 61, 10, 5); g.globalCompositeOperation = 'lighter'; star(g, 112, 64, 7, 0.9);
  },
  blade(g, p) {                                        // croissant d'acier tranchant
    const { t, c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 64, 64, 58, c1, 0.3);
    const crescent = (R, th, col, a) => { g.fillStyle = rgba(col, a); g.beginPath(); g.arc(18, 64, R, -1.15, 1.15); g.arc(18 + th, 64, R - 3, 1.15, -1.15, true); g.closePath(); g.fill(); };
    crescent(104, 26, c1, 0.5); crescent(104, 18, c2, 0.8); crescent(104, 9, '#ffffff', 1);
    g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.beginPath(); g.arc(18, 64, 103, -1.1, 1.1); g.stroke();
    for (let i = 0; i < 4; i++) spark(g, 100 + Math.cos(t * TAU + i) * 5, 28 + i * 24, 1.6, '#ffffff');
  },
  wind(g, p) {                                         // croissant de vent + filets d'air
    const { t, r, c1, c2 } = p; g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const y = 20 + i * 11 + Math.sin(t * TAU + i) * 3; g.strokeStyle = rgba(i % 2 ? c1 : c2, 0.25); g.lineWidth = 1.6; g.beginPath(); g.moveTo(10 + r() * 30, y); g.quadraticCurveTo(60, y + (i - 4) * 3, 100 + r() * 20, 64 + (y - 64) * 0.4); g.stroke(); }
    const crescent = (R, th, col, a) => { g.fillStyle = rgba(col, a); g.beginPath(); g.arc(14, 64, R, -1.1, 1.1); g.arc(14 + th, 64, R - 2, 1.1, -1.1, true); g.closePath(); g.fill(); };
    crescent(104, 30, c1, 0.35); crescent(104, 16, c2, 0.7); crescent(104, 6, '#ffffff', 0.95);
  },
  water(g, p) {                                        // vague déferlante avec écume
    const { t, r, c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 64, 70, 54, c1, 0.3); g.globalCompositeOperation = 'source-over';
    const gr = g.createLinearGradient(0, 14, 0, 120); gr.addColorStop(0, c2); gr.addColorStop(0.45, c1); gr.addColorStop(1, '#0a2a5a'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(10, 118); g.bezierCurveTo(12, 70, 34, 18, 84, 16 + Math.sin(t * TAU) * 2); g.bezierCurveTo(110, 14, 122, 34, 112, 50); g.bezierCurveTo(98, 36, 76, 40, 70, 70); g.bezierCurveTo(66, 92, 70, 108, 80, 118); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(30, 60); g.bezierCurveTo(40, 34, 64, 22, 98, 24); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 16; i++) { g.beginPath(); g.arc(88 + (r() - 0.3) * 40, 24 + (r() - 0.4) * 30, 1 + r() * 3, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(24, 96); g.bezierCurveTo(26, 64, 40, 40, 56, 34); g.bezierCurveTo(46, 54, 44, 80, 48, 100); g.closePath(); g.fill();
  },
  sand(g, p) {                                         // vague de sable granuleuse
    const { t, r, c1, c2 } = p; g.globalCompositeOperation = 'source-over';
    const gr = g.createLinearGradient(0, 20, 0, 120); gr.addColorStop(0, c2); gr.addColorStop(1, c1); g.fillStyle = gr;
    g.beginPath(); g.moveTo(8, 118); g.bezierCurveTo(14, 64, 40, 22, 90, 24); g.bezierCurveTo(112, 26, 122, 44, 114, 62); g.bezierCurveTo(96, 50, 74, 56, 72, 84); g.bezierCurveTo(70, 100, 76, 110, 84, 118); g.closePath(); g.fill();
    for (let i = 0; i < 260; i++) { const x = 8 + r() * 112, y = 20 + r() * 98; g.fillStyle = r() > 0.5 ? rgba(c2, 0.7) : rgba('#5a4018', 0.5); g.fillRect(x, y, 1.4, 1.4); }
    g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 22; i++) { g.fillStyle = rgba(c2, 0.5); g.beginPath(); g.arc(100 + (r() - 0.2) * 28, 24 + r() * 60 + Math.sin(t * TAU + i) * 3, 1 + r() * 1.8, 0, TAU); g.fill(); }
  },
  earth(g, p) {                                        // rocher facetté
    const { r, c1, c2 } = p; g.globalCompositeOperation = 'source-over'; const cx = 64, cy = 64, N = 9, pts = [];
    for (let i = 0; i < N; i++) { const a = (i / N) * TAU, rr = 34 + r() * 14; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    g.fillStyle = '#1c140c'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + 1, y + 1.5) : g.moveTo(x + 1, y + 1.5))); g.fill();
    for (let i = 0; i < N; i++) { const a = pts[i], b = pts[(i + 1) % N]; const k = (i % 3) / 2; g.fillStyle = k < 0.4 ? c2 : k < 0.8 ? c1 : '#5a4020'; g.beginPath(); g.moveTo(cx - 4, cy - 4); g.lineTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1.2; g.stroke(); }
    g.strokeStyle = 'rgba(20,10,0,.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(cx - 14, cy - 18); g.lineTo(cx - 4, cy - 2); g.lineTo(cx + 12, cy + 4); g.stroke();
    g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { g.fillStyle = rgba(c2, 0.3); g.beginPath(); g.arc(10 + r() * 30, 30 + r() * 70, 2 + r() * 3, 0, TAU); g.fill(); }
  },
  poison(g, p) {                                       // nuage toxique avec bulles
    const { t, r, c1, c2 } = p; g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + t * 0.6, d = 14 + (i % 4) * 7, x = 64 + Math.cos(a) * d * 1.5, y = 64 + Math.sin(a) * d, rr = 16 + (i % 3) * 5; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, rgba(i % 2 ? c1 : c2, 0.5)); gr.addColorStop(1, rgba(c1, 0)); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    glow(g, 64, 64, 34, c1, 0.45); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(c2, 0.8); g.lineWidth = 1.2;
    for (let i = 0; i < 9; i++) { const bx = 26 + r() * 76, by = 30 + r() * 68; g.beginPath(); g.arc(bx, by, 2 + r() * 4, 0, TAU); g.stroke(); }
  },
  shadow(g, p) {                                       // esprit : tête spectrale + queue fumeuse
    const { t, r, c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 84, 64, 52, c1, 0.5);
    for (let i = 0; i < 12; i++) { const k = i / 11, x = 78 - k * 62, y = 64 + Math.sin(t * TAU + i * 0.9) * (3 + k * 14); const rr = 17 * (1 - k * 0.7); const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, rgba(c1, 0.55 * (1 - k * 0.6))); gr.addColorStop(1, rgba(c1, 0)); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    g.globalCompositeOperation = 'source-over'; const gr = g.createRadialGradient(88, 60, 2, 88, 62, 20); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, c2); gr.addColorStop(1, rgba(c1, 0.6)); g.fillStyle = gr;
    g.beginPath(); g.arc(88, 60, 18, Math.PI, 0); g.lineTo(106, 80); g.lineTo(98, 74); g.lineTo(90, 82); g.lineTo(82, 74); g.lineTo(74, 80); g.closePath(); g.fill();
    g.fillStyle = '#10081c'; g.beginPath(); g.ellipse(84, 58, 3, 4.6, 0, 0, TAU); g.ellipse(96, 58, 3, 4.6, 0, 0, TAU); g.fill(); g.fillStyle = c1; g.beginPath(); g.ellipse(84, 58, 1.2, 2, 0, 0, TAU); g.ellipse(96, 58, 1.2, 2, 0, 0, TAU); g.fill();
    g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) spark(g, 10 + r() * 60, 64 + (r() - 0.5) * 40, 1.2 + r(), c2);
  },
  swarm(g, p) {                                        // essaim d'insectes / pétales lumineux
    const { t, r, c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 64, 64, 56, c1, 0.28);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + t * TAU * 0.5, d = 8 + (i % 3) * 13, x = 64 + Math.cos(a) * d * 1.6, y = 64 + Math.sin(a) * d, fl = Math.sin(t * TAU * 3 + i) * 0.7;
      glow(g, x, y, 12, c1, 0.5); g.fillStyle = rgba(c2, 0.7); g.beginPath(); g.ellipse(x - 2, y - 4, 7, 3 + fl * 2, -0.5, 0, TAU); g.ellipse(x - 2, y + 4, 7, 3 - fl * 2, 0.5, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, y, 3.2, 1.8, 0, 0, TAU); g.fill();
    }
  },
  fury(g, p) {                                         // triple griffure
    const { t, c1, c2 } = p; g.globalCompositeOperation = 'lighter'; glow(g, 70, 64, 56, c1, 0.35);
    for (let i = -1; i <= 1; i++) {
      const ox = i * 10, oy = i * 26; g.save(); g.translate(ox, oy);
      for (const [w, col, a] of [[11, c1, 0.55], [6, c2, 0.85], [2.4, '#ffffff', 1]]) { g.strokeStyle = rgba(col, a); g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(24, 20); g.quadraticCurveTo(66, 44, 112, 108 - Math.abs(i) * 6); g.stroke(); }
      g.restore();
    }
    for (let i = 0; i < 6; i++) spark(g, 30 + i * 14, 30 + i * 12 + Math.sin(t * TAU + i) * 4, 1.4, c2);
  },
};
DRAW.zone = DRAW.poison; DRAW.orb = DRAW.fire; DRAW.shock = DRAW.brawler;

const cache = new Map();
// renvoie un tableau de textures animées pour un style donné
export function projFrames(style, c1, c2) {
  const key = style + c1 + c2; if (cache.has(key)) return cache.get(key);
  const fn = DRAW[style] || DRAW.orb, out = [];
  for (let f = 0; f < FRAMES; f++) {
    const [c, g] = mk(S, S); g.lineCap = 'round'; g.lineJoin = 'round';
    fn(g, { t: f / FRAMES, r: rng(hash(style + f)), c1, c2, f });
    out.push(mkTex(c));
  }
  cache.set(key, out); return out;
}

// ---- piliers (éruption) : roche ou cristal / os selon le style
export function pillarTex(style, c1, c2) {
  const key = 'pillar' + style + c1 + c2; if (cache.has(key)) return cache.get(key);
  const [c, g] = mk(64, 128), r = rng(hash(key)); const crystal = style === 'ice' || style === 'light';
  const gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, crystal ? c1 : '#2a1d10'); gr.addColorStop(0.45, crystal ? c2 : c1); gr.addColorStop(1, crystal ? c1 : '#3a2a16'); g.fillStyle = gr; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(4, 128); g.lineTo(8, 40); g.lineTo(crystal ? 32 : 18, 4); g.lineTo(crystal ? 32 : 30, crystal ? 4 : 26); g.lineTo(crystal ? 32 : 44, crystal ? 4 : 2); g.lineTo(56, 40); g.lineTo(60, 128); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.moveTo(14, 128); g.lineTo(16, 44); g.lineTo(30, 12); g.lineTo(30, 128); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(10 + r() * 44, 20 + r() * 90); g.lineTo(10 + r() * 44, 20 + r() * 100); g.stroke(); }
  const t = mkTex(c); cache.set(key, t); return t;
}

// ---- halo, anneau, onde de choc, fumée, flash
export const haloTex = (() => { const [c, g] = mk(128, 128); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(0.6, 'rgba(255,255,255,.14)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return mkTex(c); })();
export const ringTex = (() => { const [c, g] = mk(128, 128); g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 56, 0, TAU); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 14; g.beginPath(); g.arc(64, 64, 52, 0, TAU); g.stroke(); const gr = g.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.85, 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return mkTex(c); })();
export const flareTex = (() => { const [c, g] = mk(128, 128); glow(g, 64, 64, 60, '#ffffff', 0.9); star(g, 64, 64, 32, 1); return mkTex(c); })();
export const slashTex = (() => { const [c, g] = mk(128, 64); const gr = g.createLinearGradient(0, 0, 128, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,.85)'); gr.addColorStop(1, '#fff'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 56); g.quadraticCurveTo(70, 52, 126, 6); g.quadraticCurveTo(80, 36, 0, 60); g.closePath(); g.fill(); return mkTex(c); })();

// ---- faisceau : texture plasma 256x64 qui défile (répétée), dégradé vertical
export function beamTexture() {
  const [c, g] = mk(256, 64), r = rng(99);
  for (let y = 0; y < 64; y++) { const d = Math.abs(y - 31.5) / 32, a = Math.pow(1 - d, 1.4); g.fillStyle = `rgba(255,255,255,${a * 0.55})`; g.fillRect(0, y, 256, 1); }
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) { const y = 10 + r() * 44, x = r() * 256, w = 24 + r() * 90, a = 0.16 + r() * 0.3; const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x, y, w, 1.6 + r() * 2.2); if (x + w > 256) g.fillRect(x - 256, y, w, 2); }
  const t = mkTex(c); t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
export const beamCore = (() => { const [c, g] = mk(8, 64); const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.35, 'rgba(255,255,255,.8)'); gr.addColorStop(0.5, '#fff'); gr.addColorStop(0.65, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 64); return mkTex(c); })();

// ---- coup d'arme : arc tranchant (à tracer à l'écran)
export const FRAMES_N = FRAMES;
