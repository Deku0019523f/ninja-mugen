// ============================================================
//  ENTRÉES : clavier (2 joueurs), manettes, boutons tactiles — renvoie les boutons PHYSIQUES (schéma « Storm »).
//  Les combinaisons (△+○, △△○…) sont résolues par game/chords.js.
//  o = ○ attaque · x = ✕ saut · sq = □ shuriken · tri = △ chakra · r2 garde · l2 substitution · sup1 = R1 · sup2 = L1
// ============================================================
export const KEYMAPS = [
  { l: 'KeyA', r: 'KeyD', u: 'KeyW', d: 'KeyS', o: 'KeyF', x: 'KeyG', sq: 'KeyR', tri: 'KeyT', r2: 'KeyH', l2: 'KeyY', sup1: 'KeyE', sup2: 'KeyQ' },
  { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown', o: 'KeyJ', x: 'KeyK', sq: 'KeyU', tri: 'KeyI', r2: 'KeyL', l2: 'KeyO', sup1: 'KeyP', sup2: 'KeyN' },
];
export const ACTIONS = ['l', 'r', 'u', 'd', 'o', 'x', 'sq', 'tri', 'r2', 'l2', 'sup1', 'sup2'];
import { touch, initTouch } from './touch.js';
const down = new Set();
const menuQ = [];
const MENU_KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right', Enter: 'ok', Space: 'ok', KeyF: 'ok', Escape: 'pause', Backspace: 'back', KeyG: 'back', KeyQ: 'pgl', KeyE: 'pgr', PageUp: 'pgl', PageDown: 'pgr', Tab: 'alt' };
let padPrev = [];

export function initInput() {
  addEventListener('keydown', (e) => {
    if (/Arrow|Space|Tab/.test(e.code)) e.preventDefault();
    if (!e.repeat) { down.add(e.code); const m = MENU_KEYS[e.code]; if (m) menuQ.push(m); if (e.code === 'KeyP') menuQ.push('pause'); }
    else { const m = MENU_KEYS[e.code]; if (m && /up|down|left|right/.test(m)) menuQ.push(m); }
  });
  addEventListener('keyup', (e) => down.delete(e.code));
  addEventListener('blur', () => down.clear());
  initTouch();
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('is-touch');
}

export function readPlayer(i) {
  const km = KEYMAPS[i], o = {};
  for (const a of ACTIONS) o[a] = down.has(km[a]) ? 1 : 0;
  if (i === 0) for (const a of ACTIONS) if (touch[a]) o[a] = 1;
  const pads = (navigator.getGamepads && navigator.getGamepads()) || [], pad = [...pads].filter(Boolean)[i];
  if (pad) {
    const b = (n) => pad.buttons[n] && pad.buttons[n].pressed, ax = pad.axes;
    if (ax[0] < -0.5 || b(14)) o.l = 1; if (ax[0] > 0.5 || b(15)) o.r = 1; if (ax[1] < -0.6 || b(12)) o.u = 1; if (ax[1] > 0.6 || b(13)) o.d = 1;
    if (b(0)) o.x = 1; if (b(1)) o.o = 1; if (b(2)) o.sq = 1; if (b(3)) o.tri = 1;      // ✕ ○ □ △ (manette PlayStation)
    if (b(5)) o.sup1 = 1; if (b(4)) o.sup2 = 1; if (b(7)) o.r2 = 1; if (b(6)) o.l2 = 1;
  }
  if (o.l && o.r) o.l = o.r = 0;
  return o;
}

export function pollMenu() {
  const out = menuQ.splice(0);
  const pads = [...((navigator.getGamepads && navigator.getGamepads()) || [])].filter(Boolean);
  pads.forEach((p, i) => {
    const prev = padPrev[i] || {}, cur = { up: p.axes[1] < -0.6 || (p.buttons[12] && p.buttons[12].pressed), down: p.axes[1] > 0.6 || (p.buttons[13] && p.buttons[13].pressed), left: p.axes[0] < -0.6 || (p.buttons[14] && p.buttons[14].pressed), right: p.axes[0] > 0.6 || (p.buttons[15] && p.buttons[15].pressed), ok: p.buttons[0] && p.buttons[0].pressed, back: p.buttons[1] && p.buttons[1].pressed, pause: p.buttons[9] && p.buttons[9].pressed, pgl: p.buttons[4] && p.buttons[4].pressed, pgr: p.buttons[5] && p.buttons[5].pressed };
    for (const k of Object.keys(cur)) if (cur[k] && !prev[k]) out.push(k);
    padPrev[i] = cur;
  });
  return out;
}
export const isTouch = () => document.body.classList.contains('is-touch');
