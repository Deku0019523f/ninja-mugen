// ============================================================
//  PLANCHES DE SPRITES ANIMÉES (pixel art Craftpix) : un atlas PNG par personnage (assets/sprites/<id>.png),
//  une ligne par animation (idle, walk, jump, a1, a2, a3, hurt, dead, guard, spec, sup).
//  Si l'image n'est pas encore chargée (ou absente), drawFighter retombe sur le dessin vectoriel.
// ============================================================
import { SHEETS } from './sheetdata.js';

const FOOT_Y = 118;                     // ligne des pieds dans le canevas 128 × 128 (voir sprites.js)
const IMGS = new Map();
const imgOf = (id) => { let i = IMGS.get(id); if (!i) { i = new Image(); i.src = `assets/sprites/${id}.png`; i.onerror = () => { i.failed = true; }; IMGS.set(id, i); } return i; };
export const sheetReady = (ch) => { if (!ch.sheet || !SHEETS[ch.sheet]) return false; const i = imgOf(ch.sheet); return !!(i.complete && i.naturalWidth && !i.failed); };
export const onSheetLoad = (ch, fn) => { if (!ch.sheet) return; const i = imgOf(ch.sheet); if (!i.complete) i.addEventListener('load', fn, { once: true }); };

const A1 = new Set(['punch1', 'apunch', 'cjab', 'palm', 'dash', 'cdash']);
const A2 = new Set(['punch2', 'hook', 'shin', 'palm2', 'apunch2', 'rise', 'throw']);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// quelle ligne de l'atlas et quelle image pour l'état de combat de f ?
function pick(S, f, clock) {
  const R = S.rows, st = f.state, t = f.t;
  const loop = (r, fps = 8) => ({ r, i: Math.floor(clock / (60 / fps)) % R[r].n });
  const prog = (r, p) => ({ r, i: clamp(Math.floor(p * R[r].n), 0, R[r].n - 1) });
  switch (st) {
    case 'walk': return loop('walk', 10);
    case 'jump': { const n = R.jump.n; return { r: 'jump', i: clamp(Math.round((f.vy > 6 ? 0.1 : f.vy > 0 ? 0.3 : f.vy > -6 ? 0.55 : 0.8) * (n - 1)), 0, n - 1) }; }
    case 'block': case 'blockstun': return R.guard ? prog('guard', t < 6 ? 0.2 : 1) : { r: 'idle', i: 0 };
    case 'hit': return prog('hurt', t / 14);
    case 'launch': return { r: 'hurt', i: R.hurt.n - 1 };
    case 'down': case 'ko': return prog('dead', t / 26);
    case 'getup': return prog('dead', 1 - t / 16);
    case 'roll': return { r: 'jump', i: Math.floor(R.jump.n / 2) };
    case 'charge': return loop('idle', 8);
    case 'atk': {
      const m = f.move; if (!m) return loop('idle');
      const total = Math.max(1, m.su + m.ac + m.re), p = t / total;
      const id = m.id || '';
      let r = A1.has(id) ? 'a1' : A2.has(id) ? 'a2' : 'a3';
      if (m.super) r = R.sup ? 'sup' : R.spec ? 'spec' : 'a3';
      else if (id === 'special' || id === 'shuriken' || id === 'cshuriken') r = R.spec ? 'spec' : 'a1';
      if (!R[r]) r = R.a3 ? 'a3' : R.a2 ? 'a2' : 'a1';
      return prog(r, p);
    }
    default: return loop('idle', 8);
  }
}

// dessine le combattant (état de f) dans le canevas g ; rot / off : rotation et décalage de poseFor (chute, roulade)
export function drawSheetFighter(g, ch, f, rot, off, clock) {
  const S = SHEETS[ch.sheet], img = imgOf(ch.sheet), awake = !!(f && f.buff === 'awaken');
  const k = clamp(100 / S.bh, 0.85, 1.5);
  const { r, i } = f ? pick(S, f, clock) : { r: 'idle', i: Math.floor(clock / 7) % S.rows.idle.n };
  const row = S.rows[r] || S.rows.idle, idx = clamp(i, 0, row.n - 1), st = f && f.state;
  const keepRot = st === 'launch' || st === 'roll';
  const W = g.canvas.width, pad = (W - 128) / 2;      // canevas élargi (256) : marge pour les armes et les sauts
  g.clearRect(0, 0, W, W);
  g.save(); g.translate(pad, pad);
  if (keepRot && rot) { g.translate(64, FOOT_Y - 24); g.rotate(rot * Math.PI / 180); g.translate(-64, -(FOOT_Y - 24)); }
  g.imageSmoothingEnabled = false;
  if (awake) { g.shadowColor = '#ff1030'; g.shadowBlur = 8 + Math.sin(clock * 0.3) * 3; }
  const dw = row.fw * k, dh = row.fh * k, feet = row.fh === 128 ? S.feet : row.fh;
  g.drawImage(img, idx * row.fw, row.y, row.fw, row.fh, 64 - (row.fw === 128 ? S.cx : row.fw / 2) * k, FOOT_Y - feet * k + (keepRot ? 0 : off || 0), dw, dh);
  g.restore();
}

// recadrage du portrait (tête et buste du personnage au repos)
export function sheetPortraitBox(ch) { const S = SHEETS[ch.sheet], k = clamp(100 / S.bh, 0.85, 1.5), top = FOOT_Y - S.feet * k + (S.feet - S.bh) * k; return { x: 64 - 24, y: Math.max(0, top - 4), w: 48, h: 48 }; }
