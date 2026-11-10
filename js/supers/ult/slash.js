// Ultime « slash » : danse de coups — le combattant se téléporte autour de l'adversaire et le tranche de tous côtés
import { nearest, SUP_BASE } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_slash', pose: 'strike', su: 24, ac: u.ac ?? 54, re: 24, every: u.every ?? 6, dmg: u.dmg ?? 18, ox: -50, rx: 70, y0: 0, y1: 90, kb: 0, stun: 14, unblock: true, gain: 0,
  last: { dmg: u.last ?? 90, launch: { vx: 9, vy: 8 } }, snd: 'kick',
  onFire(f, w) { const e = nearest(f, w); f.lock = e && Math.abs(e.x - f.x) < 560 && e.hp > 0 ? e : null; f.fade = false; },
  onTick(f, w, k) {
    const e = f.lock; if (!e || e.hp <= 0) return;
    if (k % (u.every ?? 6) === 0) {
      const side = ((k / (u.every ?? 6)) | 0) % 2 ? 1 : -1; w.event({ t: 'puff', x: f.x, y: 40, color: (f.char.fx || ['#fff'])[0] });
      f.x = Math.max(-w.half, Math.min(w.half, e.x + side * 44)); f.face = -side; f.hitSet.clear();
      w.event({ t: 'fxflash', x: e.x, y: 30 + ((k * 7) % 50), s: 90, life: 7, color: (f.char.fx || ['#fff', '#fff'])[1] });
    }
    if (e.state === 'hit') e.x += (f.x + f.face * 40 - e.x) * 0.5;
  } });
