// ============================================================
//  COMMANDES TACTILES façon manette (paysage)
//  Gauche : stick analogique flottant OU croix 8 directions (au choix, mémorisé)
//  Droite : △ (tri) □ (sq) ○ (o) ✕ (x) en losange ; un doigt entre deux boutons appuie sur les deux (△+○ = Ninjutsu…)
//  Au-dessus du losange : L1 R1 (soutiens) et L2 R2 (substitution, garde)
// ============================================================
export const touch = { l: 0, r: 0, u: 0, d: 0, o: 0, x: 0, sq: 0, tri: 0, r2: 0, l2: 0, sup1: 0, sup2: 0 };
const KEY = 'ninja-mugen-pad';
let mode = 'stick';
try { mode = localStorage.getItem(KEY) === 'dpad' ? 'dpad' : 'stick'; } catch (e) { /* ignore */ }
let apply = () => {};
export const getPadMode = () => mode;
export function setPadMode(m) { mode = m === 'dpad' ? 'dpad' : 'stick'; try { localStorage.setItem(KEY, mode); } catch (e) { /* ignore */ } apply(); }

// vecteur → 8 directions (secteurs de 25° / 65°)
function dirs(dx, dy, R) {
  const r = Math.hypot(dx, dy); touch.l = touch.r = touch.u = touch.d = 0;
  if (r < R * 0.22) return '';
  const a = Math.atan2(dy, dx) * 180 / Math.PI, ax = Math.abs(a), v = ax > 25 && ax < 155 ? (a < 0 ? 'u' : 'd') : '';
  const fa = ax > 90 ? 180 - ax : ax, h = fa < 65 ? (ax > 90 ? 'l' : 'r') : '';
  const useV = fa > 25 ? v : '';
  if (h === 'l') touch.l = 1; if (h === 'r') touch.r = 1; if (useV === 'u') touch.u = 1; if (useV === 'd') touch.d = 1;
  return useV + h;
}

export function initTouch() {
  const $ = (s) => document.querySelector(s);
  const zone = $('#padzone'), stick = $('#stick'), knob = stick.querySelector('.knob'), dpad = $('#dpad'), acts = $('#acts');
  const cells = [...dpad.querySelectorAll('[data-d]')];
  let pid = null, cx = 0, cy = 0, R = 1;
  const rect = (e) => e.getBoundingClientRect();

  apply = () => {
    stick.style.display = mode === 'stick' ? 'block' : 'none'; dpad.style.display = mode === 'dpad' ? 'grid' : 'none';
    release();
  };
  const release = () => {
    pid = null; dirs(0, 0, 1); knob.style.transform = ''; stick.classList.remove('act'); dpad.classList.remove('act');
    stick.style.left = stick.style.bottom = ''; cells.forEach((c) => c.classList.remove('on'));
  };
  const move = (e) => {
    const dx = e.clientX - cx, dy = e.clientY - cy;
    const k = dirs(dx, dy, R), m = Math.min(1, Math.hypot(dx, dy) / R), a = Math.atan2(dy, dx);
    if (mode === 'stick') knob.style.transform = `translate(${Math.cos(a) * m * R * 0.55}px,${Math.sin(a) * m * R * 0.55}px)`;
    else cells.forEach((c) => c.classList.toggle('on', c.dataset.d === k));
  };
  zone.addEventListener('pointerdown', (e) => {
    if (pid !== null) return; e.preventDefault(); zone.setPointerCapture(e.pointerId); pid = e.pointerId;
    if (mode === 'stick') {
      R = rect(stick).width / 2;
      // le stick se recentre sous le pouce (limité à la zone)
      const z = rect(zone); const x = Math.max(z.left + R, Math.min(z.right - R, e.clientX)), y = Math.max(z.top + R, Math.min(z.bottom - R, e.clientY));
      stick.style.left = (x - R - z.left) + 'px'; stick.style.bottom = (z.bottom - y - R) + 'px'; cx = x; cy = y; stick.classList.add('act');
    } else { const b = rect(dpad); R = b.width / 2; cx = b.left + R; cy = b.top + b.height / 2; dpad.classList.add('act'); }
    move(e);
  });
  zone.addEventListener('pointermove', (e) => { if (e.pointerId === pid) move(e); });
  ['pointerup', 'pointercancel'].forEach((n) => zone.addEventListener(n, (e) => { if (e.pointerId === pid) release(); }));

  // boutons d'action : tous les boutons proches d'un doigt sont pressés
  const btns = [...acts.querySelectorAll('[data-a]')], ptr = new Map();
  const refresh = () => {
    const bs = rect(btns[0]).width, hit = new Set();
    for (const p of ptr.values()) for (const b of btns) { const r = rect(b); if (Math.hypot(p.x - (r.left + r.width / 2), p.y - (r.top + r.height / 2)) < bs * 0.78) hit.add(b.dataset.a); }
    for (const b of btns) { const a = b.dataset.a, v = hit.has(a) ? 1 : 0; touch[a] = v; b.classList.toggle('on', !!v); }
  };
  acts.addEventListener('pointerdown', (e) => { e.preventDefault(); acts.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); refresh(); });
  acts.addEventListener('pointermove', (e) => { if (ptr.has(e.pointerId)) { ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); refresh(); } });
  ['pointerup', 'pointercancel'].forEach((n) => acts.addEventListener(n, (e) => { ptr.delete(e.pointerId); refresh(); }));

  // L1 / R1 / L2 / R2 : boutons indépendants (soutiens, substitution, garde)
  const sups = $('#sups');
  if (sups) {
    for (const b of sups.querySelectorAll('[data-s]')) {
      const a = b.dataset.s, set = (v) => { touch[a] = v; b.classList.toggle('on', !!v); };
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); set(1); });
      ['pointerup', 'pointercancel'].forEach((n) => b.addEventListener(n, () => set(0)));
    }
  }
  apply();
}
