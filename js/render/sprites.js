// ============================================================
//  SPRITES : combattants dessinés en direct sur canvas 128x128 (squelette 2D)
//  Convention : angle 0 = vers le bas, + = vers l'avant (le personnage regarde à droite)
// ============================================================
import { hexShade } from '../data/roster.js';

export const SPR = 128, FOOT = 118;
const D2R = Math.PI / 180;
const OUT = '#14101c';
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => k * k * (3 - 2 * k);
const clamp01 = (k) => Math.max(0, Math.min(1, k));

const mix = (A, B, k) => {
  const o = {};
  for (const key of Object.keys(A)) {
    const a = A[key], b = B[key] ?? a;
    o[key] = Array.isArray(a) ? [lerp(a[0], b[0], k), lerp(a[1], b[1], k)] : lerp(a, b, k);
  }
  return o;
};

// pose = {hx, hy, lean, tilt, la:[bras arrière a,e], ra:[bras avant], ll:[jambe arrière a,k], rl:[jambe avant]}
const P = (hx, hy, lean, tilt, la, ra, ll, rl) => ({ hx, hy, lean, tilt, la, ra, ll, rl });
const STANCE = P(0, 3, 6, 0, [28, 95], [52, 80], [-16, 16], [22, 22]);

const KEY = {
  idle: STANCE,
  block: P(-2, 6, -4, 4, [60, 120], [70, 115], [-12, 25], [18, 28]),
  jump: P(0, 0, 4, 0, [40, 70], [70, 60], [-25, 40], [30, 50]),
  punch: { wind: P(-3, 3, -6, 0, [30, 95], [-25, 100], [-20, 20], [20, 20]), hit: P(4, 3, 12, 0, [30, 95], [92, 8], [-24, 22], [26, 14]) },
  punch2: { wind: P(-2, 3, -4, 0, [-25, 100], [40, 90], [-20, 20], [20, 20]), hit: P(5, 3, 14, 0, [95, 6], [40, 90], [-26, 20], [26, 14]) },
  punch3: { wind: P(-5, 4, -12, -3, [20, 100], [-35, 110], [-24, 24], [24, 24]), hit: P(8, 2, 22, 4, [20, 100], [100, 4], [-34, 18], [30, 8]) },
  kick: { wind: P(-4, 4, -10, 0, [40, 90], [60, 80], [-12, 30], [60, 100]), hit: P(-6, 0, -14, 0, [-30, 70], [80, 60], [-14, 8], [98, 4]) },
  sweep: { wind: P(-2, 14, -8, 0, [30, 80], [60, 70], [-30, 50], [40, 90]), hit: P(2, 22, 20, 0, [-10, 60], [70, 40], [-60, 80], [92, 4]) },
  upper: { wind: P(-2, 10, -10, 0, [30, 95], [-10, 90], [-20, 40], [26, 50]), hit: P(2, -3, 6, -6, [10, 100], [168, 10], [-6, 8], [8, 6]) },
  apunch: { wind: P(0, 0, 0, 0, [30, 80], [-20, 90], [-20, 30], [28, 40]), hit: P(2, 0, 14, 0, [30, 80], [92, 6], [-30, 40], [34, 36]) },
  akick: { wind: P(0, 0, -6, 0, [30, 80], [60, 70], [-16, 50], [50, 90]), hit: P(0, 0, -20, 0, [-40, 70], [60, 60], [-30, 30], [92, 6]) },
  smash: { wind: P(-6, 6, -18, -3, [-30, 90], [-40, 100], [-26, 24], [24, 24]), hit: P(8, 4, 26, 4, [100, 4], [104, 2], [-36, 16], [34, 10]) },
  cast: { wind: P(-4, 4, -8, 0, [-30, 60], [-20, 80], [-20, 25], [24, 22]), hit: P(4, 3, 8, 0, [75, 20], [92, 10], [-26, 20], [30, 24]) },
  dash: { wind: P(-6, 8, -20, 0, [-30, 70], [-10, 80], [-28, 30], [30, 40]), hit: P(6, 8, 36, 0, [-60, 40], [96, 4], [-70, 6], [20, 60]) },
  strike: { wind: P(-4, 6, -16, 0, [20, 90], [-30, 90], [-24, 30], [30, 30]), hit: P(6, 4, 22, 0, [30, 90], [96, 6], [-40, 14], [36, 18]) },
  leap: { wind: P(0, 8, -8, 0, [-20, 80], [-20, 80], [-20, 40], [24, 40]), hit: P(2, -2, 28, 0, [-70, 20], [-80, 10], [-30, 70], [60, 40]) },
  beam: { wind: P(-8, 6, -16, 0, [-40, 40], [-30, 70], [-30, 30], [24, 30]), hit: P(-2, 4, 4, 0, [92, 6], [96, 4], [-36, 18], [34, 20]) },
  barrage: { wind: P(-4, 4, -10, 0, [-20, 100], [-30, 100], [-24, 20], [24, 20]), hit: P(4, 3, 14, 0, [95, 8], [92, 8], [-26, 18], [28, 16]) },
  super: { wind: P(0, 8, -6, 0, [-50, 40], [-50, 40], [-26, 40], [26, 40]), hit: P(0, -2, 8, -4, [150, 20], [150, 20], [-14, 10], [14, 10]) },
  hit: P(-4, 2, -22, -10, [-40, 40], [-20, 50], [-8, 24], [20, 30]),
  launch: P(0, 0, -50, -18, [-100, 20], [-70, 40], [-30, 40], [30, 30]),
  getup: P(0, 12, 10, 0, [30, 80], [50, 60], [-30, 70], [40, 60]),
  intro: P(0, 3, 4, 0, [60, 120], [20, 130], [-14, 14], [18, 18]),
  win: P(0, 0, -4, -6, [150, 20], [170, 10], [-8, 10], [10, 10]),
};

function walkPose(t) {
  const s = Math.sin(t * 0.28), c = Math.cos(t * 0.28);
  return P(0, 3 + Math.abs(c) * 1.5, 8, 0, [30 - s * 30, 90], [50 + s * 30, 80], [-s * 40, 18 + Math.max(0, c) * 24], [s * 40, 18 + Math.max(0, -c) * 24]);
}
function idlePose(t) {
  const b = Math.sin(t * 0.1);
  return { ...STANCE, hy: 3 + b * 1.1, la: [28 + b * 3, 95], ra: [52 - b * 3, 80], lean: 6 + b };
}

// ---- pose brute selon l'état du combattant (sans fondu)
function rawPose(f, clock) {
  const t = f.t, st = f.state;
  let rot = 0, off = 0, pose;
  // petit tremblement du combattant touché (le temps ne passe pas pendant le hitstop : t reste figé, clock avance)
  const shake = (amp) => Math.sin(clock * 2.6) * amp;
  switch (st) {
    case 'walk': pose = walkPose(clock); if (f.vx * f.face < 0) pose = { ...pose, lean: 2 }; break;
    case 'jump': pose = f.vy > 0 ? KEY.jump : { ...KEY.jump, la: [60, 60], ra: [80, 50], ll: [-10, 30], rl: [14, 30] }; break;
    case 'block': pose = KEY.block; break;
    case 'charge': pose = { ...STANCE, hy: 12 + Math.sin(clock * 0.5) * 0.8, lean: 2, la: [-50, 70], ra: [-40, 70], ll: [-30, 40], rl: [30, 40] }; break;   // chakra : accroupi, bras en arrière
    case 'blockstun': pose = { ...KEY.block, hx: -2 + (t < 5 ? shake(1.5) : 0) }; break;
    case 'hit': pose = KEY.hit; if (t < 4) pose = { ...KEY.hit, lean: -30 }; if (t < 6) pose = { ...pose, hx: pose.hx + shake(2.5) }; break;
    case 'launch': pose = KEY.launch; rot = -clamp01((Math.abs(f.vy) < 3 ? 0.5 : f.vy > 0 ? 0.25 : 0.75)) * 150 * (f.vy > 0 ? 0.6 : 1); break;
    case 'down': case 'ko': pose = KEY.launch; rot = -88; off = 2; break;
    case 'getup': pose = KEY.getup; rot = -88 * (1 - clamp01(t / 14)); break;
    case 'roll': pose = KEY.getup; rot = clamp01(t / 22) * 360 * (f.rollDir === f.face ? 1 : -1); off = 6; break;
    case 'atk': pose = attackPose(f, t); break;
    default: pose = f.winPose ? KEY.win : f.introPose ? KEY.intro : idlePose(clock);
  }
  return { pose, rot, off };
}

// ---- fondu entre poses : quand l'état (ou le coup) change, on interpole 2 à 4 frames depuis la dernière pose affichée.
//      Pas de fondu vers les réactions (touché, garde brisée, chute) : elles doivent claquer.
const SNAP = new Set(['hit', 'blockstun', 'launch', 'down', 'ko']);
const memo = new WeakMap();
export function poseFor(f, clock) {
  const r = rawPose(f, clock);
  let m = memo.get(f);
  if (!m) { m = { sig: '', last: null, lastRot: 0, from: null, bt: 0, len: 4, clock }; memo.set(f, m); }
  const dt = Math.max(0, Math.min(6, clock - m.clock)); m.clock = clock;
  const sig = f.state + ':' + (f.move ? (f.move.id || f.move.pose || '') : '');
  if (sig !== m.sig) {
    m.sig = sig;
    if (m.last && !r.rot && !m.lastRot && !SNAP.has(f.state)) { m.from = m.last; m.len = f.state === 'atk' ? 2 : 4; m.bt = m.len; } else m.from = null;
  }
  let pose = r.pose;
  if (m.from && m.bt > 0) {
    pose = mix(m.from, r.pose, ease(clamp01(1 - m.bt / m.len)));
    m.bt -= dt; if (m.bt <= 0) m.from = null;
  }
  m.last = pose; m.lastRot = r.rot;
  return { pose, rot: r.rot, off: r.off };
}

function attackPose(f, t) {
  const m = f.move;
  if (!m) return idlePose(t);
  const K = KEY[m.pose] || KEY.punch;
  if (!K.wind) return K;
  const su = Math.max(1, m.su), end = m.su + m.ac;
  if (t < su) return mix(STANCE, K.wind, ease(clamp01(t / su)));
  if (t < end) return K.hit;
  return mix(K.hit, STANCE, ease(clamp01((t - end) / Math.max(1, m.re))));
}

// ---------------------------------------------------------- dessin
const seg = (g, x, y, a, len) => [x + Math.sin(a * D2R) * len, y + Math.cos(a * D2R) * len];

function limb(g, x, y, a1, a2, l1, l2, w, col) {
  const [kx, ky] = seg(g, x, y, a1, l1);
  const [ex, ey] = seg(g, kx, ky, a2, l2);
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = OUT; g.lineWidth = w + 2.4; g.beginPath(); g.moveTo(x, y); g.lineTo(kx, ky); g.lineTo(ex, ey); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(kx, ky); g.lineTo(ex, ey); g.stroke();
  return [ex, ey, kx, ky];
}
const dot = (g, x, y, r, col) => { g.fillStyle = OUT; g.beginPath(); g.arc(x, y, r + 1.1, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
const poly = (g, pts, fill, stroke = OUT) => {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath();
  g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.3; g.lineJoin = 'round'; g.stroke(); }
};

function drawHair(g, ch, cx, cy, tiltDeg, front) {
  const hc = ch.hc, dk = hexShade(hc, -0.3), r = 10;
  g.save(); g.translate(cx, cy); g.rotate(tiltDeg * D2R);
  const S = ch.hair, pl = (pts, c = hc) => poly(g, pts, c);
  if (!front) {                                   // derrière la tête
    if (S === 'long') pl([[-9, -4], [-13, 14], [-8, 22], [-2, 16], [4, 0]], dk);
    if (S === 'pony') pl([[-9, -6], [-18, 2], [-17, 14], [-11, 8], [-7, 0]], dk);
    if (S === 'topknot') {}
    if (S === 'wild') pl([[-9, -8], [-19, -10], [-14, -2], [-21, 4], [-12, 6], [-14, 14], [-6, 6]], dk);
    if (S === 'hood') pl([[-10, -8], [-14, 6], [-6, 14], [4, 8]], dk);
    if (S === 'buns') { dot(g, -8, -11, 4.2, hc); dot(g, 1, -14, 4.2, hc); }
    return g.restore();
  }
  switch (S) {
    case 'spiky': pl([[-10, -1], [-15, -8], [-9, -8], [-12, -17], [-5, -12], [-3, -21], [2, -13], [7, -19], [8, -10], [13, -9], [10, -1], [9, -4], [-2, -6]]); break;
    case 'wild': pl([[-10, 0], [-14, -10], [-8, -9], [-9, -19], [-2, -13], [2, -22], [6, -13], [13, -17], [11, -8], [14, -2], [8, -5], [-1, -7]]); break;
    case 'slick': pl([[-10, 0], [-10, -9], [-3, -14], [6, -12], [11, -6], [10, -2], [4, -8], [-4, -7]]); break;
    case 'long': pl([[-10, 2], [-11, -9], [-3, -14], [7, -12], [11, -5], [11, -1], [4, -8], [-3, -6]]); break;
    case 'bob': pl([[-11, 8], [-11, -8], [-3, -14], [7, -12], [11, -5], [11, -1], [4, -7], [-3, -6], [-5, 8]]); break;
    case 'topknot': pl([[-10, -1], [-9, -9], [-2, -12], [7, -10], [10, -3], [4, -7], [-3, -6]]); dot(g, 0, -16, 4, hc); break;
    case 'pony': case 'short': pl([[-10, 0], [-10, -9], [-3, -13], [7, -12], [11, -6], [11, -2], [4, -7], [-3, -6]]); break;
    case 'buns': pl([[-10, 0], [-10, -8], [-3, -12], [7, -11], [11, -5], [11, -1], [4, -7], [-3, -6]]); break;
    case 'mohawk': pl([[-8, -6], [-6, -16], [-2, -12], [1, -20], [4, -12], [8, -17], [8, -6], [2, -9]]); break;
    case 'hood': pl([[-11, 4], [-11, -9], [-2, -15], [9, -12], [12, -4], [11, 4], [6, -3], [-2, -8], [-6, -3]], hexShade(ch.top, -0.2)); break;
    default: break;                                 // chauve
  }
  g.restore();
}

function drawHead(g, ch, cx, cy, tilt, f) {
  drawHair(g, ch, cx, cy, tilt, false);
  g.save(); g.translate(cx, cy); g.rotate(tilt * D2R);
  dot(g, 0, 0, 9.6, ch.skin);
  const hurt = f && (f.state === 'hit' || f.state === 'launch' || f.state === 'down' || f.state === 'ko');
  if (!ch.ex.includes('mask') || ch.arch === 'shadow' || true) {
    g.fillStyle = '#fff'; g.fillRect(1.5, -2.8, 4.6, 4.4); g.fillRect(6.6, -2.4, 3.2, 4);
    g.fillStyle = hurt ? '#9a1c1c' : '#1b1426';
    if (f && f.state === 'ko') { g.strokeStyle = OUT; g.lineWidth = 1; g.beginPath(); g.moveTo(2, -2); g.lineTo(5, 1); g.moveTo(5, -2); g.lineTo(2, 1); g.stroke(); }
    else { g.fillRect(3.6, -1.8, 2.4, 3); g.fillRect(7.6, -1.4, 2, 2.6); }
    g.strokeStyle = OUT; g.lineWidth = 1; g.beginPath(); g.moveTo(1, -4.6); g.lineTo(6, -4.2); g.moveTo(6.8, -3.8); g.lineTo(10, -3.2); g.stroke();
    g.fillStyle = '#7a2a2a'; g.fillRect(5, 5, hurt ? 3.5 : 3, hurt ? 2.6 : 1.1);
  }
  const ex = ch.ex;
  if (ex.includes('mask')) { poly(g, [[0, 2.4], [10, 1.6], [9, 8], [2, 9.4]], hexShade(ch.acc, -0.2)); }
  if (ex.includes('glasses')) { g.strokeStyle = '#222'; g.lineWidth = 1.2; g.strokeRect(1.4, -3.8, 4.6, 4.8); g.strokeRect(6.6, -3.4, 3.8, 4.4); g.fillStyle = 'rgba(160,220,255,.5)'; g.fillRect(1.4, -3.8, 4.6, 4.8); }
  if (ex.includes('horn')) { poly(g, [[-2, -9], [-5, -20], [3, -10]], '#f4ecd8'); }
  drawHair(g, ch, 0, 0, 0, true);
  if (ex.includes('band')) { g.fillStyle = ch.acc; g.fillRect(-10, -6.4, 21, 3.6); g.fillStyle = '#d8d8e8'; g.fillRect(1, -6.2, 6, 3.2); g.fillStyle = '#555'; g.fillRect(2.4, -5.6, 3.2, 2); g.strokeStyle = OUT; g.lineWidth = 0.8; g.strokeRect(-10, -6.4, 21, 3.6); poly(g, [[-10, -5], [-17, -2], [-14, -7]], ch.acc); }
  if (ex.includes('hat')) { poly(g, [[-15, -7], [-6, -15], [6, -15], [15, -7], [6, -9], [-6, -9]], '#e0c070'); }
  g.restore();
}

export function drawFighter(g, ch, pose, opt = {}) {
  const { rot = 0, off = 0, f = null, clock = 0 } = opt;
  g.clearRect(0, 0, SPR, SPR);
  g.save();
  if (rot) { g.translate(64, FOOT - 22); g.rotate(rot * D2R); g.translate(-64, -(FOOT - 22) + off); }
  const A = pose, top = ch.top, topD = hexShade(top, -0.3), pants = hexShade(ch.acc, -0.45), skin = ch.skin;
  const hx = 62 + A.hx, hy = FOOT - 24 + A.hy;
  const sh = seg(g, hx, hy, 180 - A.lean * 1, 0);           // placeholder
  const lx = Math.sin(A.lean * D2R), ly = Math.cos(A.lean * D2R);
  const sx = hx + lx * 21, sy = hy - ly * 21;               // épaule
  const hdx = sx + Math.sin((A.lean + A.tilt) * D2R) * 12, hdy = sy - Math.cos((A.lean + A.tilt) * D2R) * 12;
  void sh;

  // cape / écharpe (derrière)
  const wav = Math.sin(clock * 0.15) * 3;
  if (ch.ex.includes('cape')) poly(g, [[sx - 2, sy], [sx - 18 - wav, sy + 16], [sx - 22 - wav * 1.5, sy + 34], [hx - 8, hy + 8], [sx + 3, sy + 8]], hexShade(ch.acc, -0.1));
  if (ch.ex.includes('scarf')) poly(g, [[sx - 2, sy - 2], [sx - 20 - wav * 2, sy + 4], [sx - 24 - wav * 2, sy + 9], [sx - 4, sy + 4]], ch.acc);
  if (ch.ex.includes('sword')) { g.strokeStyle = OUT; g.lineWidth = 4; g.beginPath(); g.moveTo(hx - 6, hy + 6); g.lineTo(sx + 10, sy - 18); g.stroke(); g.strokeStyle = '#dfe6ff'; g.lineWidth = 2; g.stroke(); }
  drawHair(g, ch, hdx, hdy, A.lean + A.tilt, false);

  // bras arrière + jambe arrière
  const la = limb(g, sx, sy + 2, A.la[0], A.la[0] + A.la[1], 10, 10, 5.4, topD); dot(g, la[0], la[1], 2.8, skin);
  const ll = limb(g, hx, hy, A.ll[0], A.ll[0] - A.ll[1], 12, 12, 6.4, hexShade(pants, -0.15)); dot(g, ll[0], ll[1], 3.4, '#2a2230');

  // torse
  g.strokeStyle = OUT; g.lineWidth = 15.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(sx, sy); g.stroke();
  g.strokeStyle = top; g.lineWidth = 12.6; g.beginPath(); g.moveTo(hx, hy); g.lineTo(sx, sy); g.stroke();
  g.strokeStyle = ch.acc; g.lineWidth = 3; g.beginPath(); g.moveTo(hx - 6 * ly, hy - 6 * lx); g.lineTo(hx + 6 * ly, hy + 6 * lx); g.stroke();   // ceinture
  g.strokeStyle = hexShade(top, .3); g.lineWidth = 1.4; g.beginPath(); g.moveTo(sx + 2 * ly, sy + 2 * lx); g.lineTo(hx + 2 * ly, hy + 2 * lx); g.stroke();

  // jambe avant
  const rl = limb(g, hx, hy, A.rl[0], A.rl[0] - A.rl[1], 12, 12, 6.8, pants); dot(g, rl[0] + 1.5, rl[1], 3.8, '#2a2230');

  // tête
  drawHead(g, ch, hdx, hdy, A.lean + A.tilt, f);

  // bras avant (+ bâton)
  const ra = limb(g, sx, sy + 2, A.ra[0], A.ra[0] + A.ra[1], 10, 10, 5.8, top);
  dot(g, ra[0], ra[1], 3, skin);
  if (ch.ex.includes('staff')) { g.strokeStyle = OUT; g.lineWidth = 4; g.beginPath(); g.moveTo(ra[0] - 4, ra[1] + 34); g.lineTo(ra[0] + 4, ra[1] - 34); g.stroke(); g.strokeStyle = '#b8864a'; g.lineWidth = 2; g.stroke(); }
  g.restore();
}

// portrait carré (sélection de personnage)
export function drawPortrait(g, ch, size = 64) {
  const c = document.createElement('canvas'); c.width = c.height = SPR;
  const gg = c.getContext('2d');
  drawFighter(gg, ch, KEY.intro, { clock: 0 });
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, size, size);
  g.drawImage(c, 28, 20, 74, 74, 0, 0, size, size);
}
