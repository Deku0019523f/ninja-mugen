// Écran de chargement : lune rouge, combattants en pleine action, barre « CHARGEMENT » en bas (dessiné à partir de nos propres combattants).
import { ROSTER } from '../data/roster.js';
import { drawFighter, poseFor } from '../render/sprites.js';

// [id, x %, y %, taille px, lueur]
const CAST = [[55, 50, 52, 250, '#ff2a2a'], [0, 31, 28, 170, '#ffb02e'], [5, 17, 62, 150, '#ff6a9a'], [12, 29, 78, 150, '#ffe14a'], [20, 70, 24, 170, '#4adfff'], [33, 86, 56, 160, '#ff4adf'], [44, 69, 76, 150, '#4a9aff']];

export function showLoading(ui, ms = 1900) {
  const root = document.createElement('div'); root.className = 'loading';
  root.innerHTML = '<i class="moon"></i><i class="spk l"></i><i class="spk r"></i><div class="ld-cast"></div><div class="ld-ver">v1.0</div><div class="ld-bar"><i></i><b>CHARGEMENT</b></div>';
  const cast = root.querySelector('.ld-cast'), cvs = [];
  for (const [id, x, y, s, glow] of CAST) {
    const c = document.createElement('canvas'); c.width = c.height = 256; c.style.cssText = `left:${x}%;top:${y}%;width:${s}px;height:${s}px;filter:drop-shadow(0 0 10px ${glow}) drop-shadow(0 0 22px ${glow}aa)`;
    cast.appendChild(c); cvs.push([c.getContext('2d'), ROSTER[Math.min(id, ROSTER.length - 1)]]);
  }
  ui.appendChild(root);
  const t0 = performance.now(), fill = root.querySelector('.ld-bar i'); let done = false;
  const end = () => { if (done) return; done = true; root.classList.add('out'); setTimeout(() => root.remove(), 400); };
  root.onclick = end;
  (function tick() {
    if (done) return;
    const dt = performance.now() - t0, t = dt / 16;
    cvs.forEach(([g, ch], i) => { const { pose } = poseFor({ state: 'idle', t: 0, vx: 0, vy: 0, move: null }, t + i * 11); g.setTransform(2, 0, 0, 2, 0, 0); drawFighter(g, ch, pose, { clock: t + i * 11 }); });
    fill.style.width = Math.min(100, dt / ms * 100) + '%';
    if (dt > ms) return end();
    requestAnimationFrame(tick);
  })();
}
