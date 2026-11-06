// ============================================================
//  ENTRÉES : clavier (2 joueurs), manettes, boutons tactiles
// ============================================================
export const KEYMAPS = [
  { l: 'KeyA', r: 'KeyD', u: 'KeyW', d: 'KeyS', punch: 'KeyF', kick: 'KeyG', special: 'KeyH', move2: 'KeyT', super: 'KeyY', smash: 'KeyR' },
  { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown', punch: 'KeyJ', kick: 'KeyK', special: 'KeyL', move2: 'KeyI', super: 'KeyO', smash: 'KeyU' },
];
export const ACTIONS = ['l', 'r', 'u', 'd', 'punch', 'kick', 'special', 'move2', 'super'];
const down = new Set(), touch = { l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0, smash: 0 }, touchT = {};
const menuQ = [];
const MENU_KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right', Enter: 'ok', Space: 'ok', KeyF: 'ok', Escape: 'pause', Backspace: 'back', KeyG: 'back' };
let padPrev = [];

export function initInput() {
  addEventListener('keydown', (e) => {
    if (/Arrow|Space/.test(e.code)) e.preventDefault();
    if (!e.repeat) { down.add(e.code); const m = MENU_KEYS[e.code]; if (m) menuQ.push(m); if (e.code === 'KeyP') menuQ.push('pause'); }
    else { const m = MENU_KEYS[e.code]; if (m && /up|down|left|right/.test(m)) menuQ.push(m); }
  });
  addEventListener('keyup', (e) => down.delete(e.code));
  addEventListener('blur', () => down.clear());
  const btns = document.querySelectorAll('#touch [data-a]');
  const set = (el, v) => { const a = el.dataset.a; if (v && !touch[a]) touchT[a] = performance.now(); touch[a] = v; el.classList.toggle('on', !!v); };
  btns.forEach((el) => {
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); set(el, 1); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((n) => el.addEventListener(n, () => set(el, 0)));
  });
  // croix directionnelle 8 sens : ↖ ↗ = saut avant/arrière, ↙ ↘ = roulade avant/arrière
  const pad = document.getElementById('dpad');
  if (pad) {
    const cells = [...pad.querySelectorAll('[data-d]')];
    const apply = (dx, dy) => {
      const r = Math.hypot(dx, dy), box = pad.getBoundingClientRect();
      let l = 0, rr = 0, u = 0, d = 0;
      if (r > box.width * 0.12) {
        const a = Math.atan2(dy, dx) * 180 / Math.PI;            // 0° = droite, 90° = bas
        if (Math.abs(a) < 67.5) rr = 1; if (Math.abs(a) > 112.5) l = 1;
        if (a < -22.5 && a > -157.5) u = 1; if (a > 22.5 && a < 157.5) d = 1;
      }
      touch.l = l; touch.r = rr; touch.u = u; touch.d = d;
      const key = (u ? 'u' : d ? 'd' : '') + (l ? 'l' : rr ? 'r' : '');
      const k2 = key === 'ul' ? 'ul' : key === 'ur' ? 'ur' : key === 'dl' ? 'dl' : key === 'dr' ? 'dr' : key;
      cells.forEach((c) => c.classList.toggle('on', c.dataset.d === k2));
    };
    const move = (e) => { const b = pad.getBoundingClientRect(); apply(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2)); };
    pad.addEventListener('pointerdown', (e) => { e.preventDefault(); pad.setPointerCapture(e.pointerId); move(e); });
    pad.addEventListener('pointermove', (e) => { if (pad.hasPointerCapture(e.pointerId)) move(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((n) => pad.addEventListener(n, () => apply(0, 0)));
  }
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('is-touch');
}

export function readPlayer(i) {
  const km = KEYMAPS[i], o = {};
  for (const a of ACTIONS) o[a] = down.has(km[a]) ? 1 : 0;
  if (i === 0) {
    for (const a of ['l', 'r', 'u', 'd', 'punch', 'kick']) if (touch[a]) o[a] = 1;
    // ○ et ✕ ensemble = SUPER ; sinon on attend ~55 ms pour laisser le temps d'appuyer sur les deux
    const now = performance.now();
    if (touch.special && touch.move2) o.super = 1;
    else {
      if (touch.special && now - touchT.special > 55) o.special = 1;
      if (touch.move2 && now - touchT.move2 > 55) o.move2 = 1;
    }
  }
  if (down.has(km.smash) || (i === 0 && touch.smash)) o.punch = o.kick = 1;
  const pads = (navigator.getGamepads && navigator.getGamepads()) || [], pad = [...pads].filter(Boolean)[i];
  if (pad) {
    const b = (n) => pad.buttons[n] && pad.buttons[n].pressed, ax = pad.axes;
    if (ax[0] < -0.5 || b(14)) o.l = 1; if (ax[0] > 0.5 || b(15)) o.r = 1; if (ax[1] < -0.6 || b(12)) o.u = 1; if (ax[1] > 0.6 || b(13)) o.d = 1;
    if (b(2)) o.punch = 1; if (b(0)) o.kick = 1; if (b(1)) o.special = 1; if (b(3)) o.move2 = 1; if (b(5) || b(7)) o.super = 1;
  }
  if (o.l && o.r) o.l = o.r = 0;
  return o;
}

export function pollMenu() {
  const out = menuQ.splice(0);
  const pads = [...((navigator.getGamepads && navigator.getGamepads()) || [])].filter(Boolean);
  pads.forEach((p, i) => {
    const prev = padPrev[i] || {}, cur = { up: p.axes[1] < -0.6 || (p.buttons[12] && p.buttons[12].pressed), down: p.axes[1] > 0.6 || (p.buttons[13] && p.buttons[13].pressed), left: p.axes[0] < -0.6 || (p.buttons[14] && p.buttons[14].pressed), right: p.axes[0] > 0.6 || (p.buttons[15] && p.buttons[15].pressed), ok: p.buttons[0] && p.buttons[0].pressed, back: p.buttons[1] && p.buttons[1].pressed, pause: p.buttons[9] && p.buttons[9].pressed };
    for (const k of Object.keys(cur)) if (cur[k] && !prev[k]) out.push(k);
    padPrev[i] = cur;
  });
  return out;
}
export const isTouch = () => document.body.classList.contains('is-touch');
