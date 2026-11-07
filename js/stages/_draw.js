// Outils de dessin partagés par les décors (pixel art procédural)
export function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

export const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
export const grad = (g, w, h, stops) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => gr.addColorStop(p, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
export const px = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

export function cloud(g, x, y, s, col = '#fff', sh = '#dfeaf8') {
  g.fillStyle = sh; for (const [dx, dy, r] of [[0, 3, 9], [10, 0, 12], [22, 3, 9], [12, 6, 11]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s + 2, r * s, 0, 7); g.fill(); }
  g.fillStyle = col; for (const [dx, dy, r] of [[0, 2, 8], [10, -1, 11], [22, 2, 8]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); g.fill(); }
}
export function mountains(g, w, base, hgt, col, snow, r, n) {
  for (let i = 0; i < n; i++) {
    const cx = (i + 0.5) * w / n + (r() - .5) * 20, h = hgt * (0.6 + r() * 0.5), hw = w / n * (0.75 + r() * 0.4);
    g.fillStyle = col; g.beginPath(); g.moveTo(cx - hw, base); g.lineTo(cx - hw * .08, base - h); g.lineTo(cx + hw * .1, base - h * 0.96); g.lineTo(cx + hw, base); g.fill();
    if (snow) { g.fillStyle = snow; g.beginPath(); g.moveTo(cx - hw * .08, base - h); g.lineTo(cx + hw * .1, base - h * .96); g.lineTo(cx + hw * .32, base - h * .62); g.lineTo(cx + hw * .12, base - h * .7); g.lineTo(cx, base - h * .55); g.lineTo(cx - hw * .14, base - h * .7); g.lineTo(cx - hw * .3, base - h * .6); g.fill(); }
  }
}
export function pine(g, x, base, h, col, col2) {
  for (let i = 0; i < 4; i++) { const y = base - h + i * h * 0.22, w = 5 + i * 3.4; g.fillStyle = i % 2 ? col2 : col; g.beginPath(); g.moveTo(x, y); g.lineTo(x - w, y + h * 0.3); g.lineTo(x + w, y + h * 0.3); g.fill(); }
  px(g, x - 1, base - h * 0.12, 2, h * 0.12, '#4a3020');
}
export function groundTex(w, h, base, dark, spots, r, rim) {
  const [c, g] = cv(w, h);
  grad(g, w, h, [[0, base], [1, dark]]);
  for (let i = 0; i < w * h / 40; i++) px(g, r() * w, r() * h, 1 + r() * 3, 1, spots[(r() * spots.length) | 0]);
  if (rim) px(g, 0, 0, w, 2, rim);
  return c;
}

export function poly2(g, pts, c) { g.fillStyle = c; g.beginPath(); g.moveTo(...pts[0]); pts.slice(1).forEach((p) => g.lineTo(...p)); g.fill(); }
