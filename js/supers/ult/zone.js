// Ultime « zone » : un champ persistant (brume, flammes, ténèbres…) recouvre l'adversaire et le ronge
import { SUP_BASE, targetX } from '../../game/helpers.js';

export default (u) => ({ ...SUP_BASE, id: 'ult_zone', pose: 'cast', su: 30, ac: 1, re: 28,
  onFire(f, w) {
    const x = Math.max(-w.half + 80, Math.min(w.half - 80, targetX(f, w, 200))), W = u.w ?? 300;
    w.spawnProj(f, { type: 'cloud', style: 'zone', x, y: 46, w: W, h: 96, vx: 0, vy: 0, dmg: u.dmg ?? 16, life: u.life ?? 180, pierce: 999, rehit: 10, stun: 12, kb: 0.4, gain: 1, big: false });
    w.event({ t: 'fxring', x, y: 6, s: W * 0.6, grow: 20, life: 22, color: (f.char.fx || ['#fff'])[0] }); w.event({ t: 'quake', x });
  } });
