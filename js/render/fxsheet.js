// ============================================================
//  EFFETS DE SORTS EN PLANCHES (Craftpix : Free Pixel Magic Sprite Effects, Fire / Water Spell Effects) → textures three.js.
//  Chargement paresseux : tant qu'une image n'est pas arrivée, fxFrames renvoie null et view.js garde l'effet vectoriel.
// ============================================================
import * as THREE from 'three';
import { FXS } from './sheetdata.js';

const cache = new Map();
function build(id, src, m, pixel) {
  let c = cache.get(id); if (c) return c.frames;
  c = { frames: null }; cache.set(id, c);
  const img = new Image(); img.onload = () => {
    c.frames = Array.from({ length: m.n }, (_, i) => {
      const cv = document.createElement('canvas'); cv.width = m.fw; cv.height = m.fh;
      cv.getContext('2d').drawImage(img, i * m.fw, m.y || 0, m.fw, m.fh, 0, 0, m.fw, m.fh);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      if (pixel) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
      return t;
    });
  };
  img.onerror = () => { /* image absente : on garde le dessin vectoriel */ };
  img.src = src; return null;
}
export const fxFrames = (key) => FXS[key] ? build('fx:' + key, `assets/fx/${key}.png`, FXS[key], key.startsWith('magic_') || key.startsWith('pj_')) : null;
export const fxAspect = (key) => FXS[key].fw / FXS[key].fh;

// quel sprite pour ce projectile ? { frames, aspect } ou null (→ effet vectoriel)
export function projSprite(p, ch, style) {
  if (p.type === 'pillar' || p.type === 'shock' || p.type === 'rock') return null;
  if (ch.sheet && FXS['pj_' + ch.sheet]) { const k = 'pj_' + ch.sheet, f = fxFrames(k); return f ? { frames: f, aspect: fxAspect(k) } : null; }
  const el = style === 'fire' ? 'fire' : style === 'water' ? 'water' : null; if (!el) return null;
  const key = el + (p.big ? '_ball' : p.type === 'needle' ? '_arrow' : '_spell'), f = fxFrames(key);
  return f ? { frames: f, aspect: fxAspect(key) } : null;
}
export const preloadFx = () => { for (const k of Object.keys(FXS)) fxFrames(k); };
