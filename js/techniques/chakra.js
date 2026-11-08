// Chakra : Shuriken (□, gratuit), Chakra Shuriken (△+□, 20 chakra), Chakra Dash (△+✕, 20 chakra) — communs à tous les personnages
const needle = (f, w, o = {}) => w.spawnProj(f, {
  type: 'needle', x: f.x + f.face * 24 * f.scale, y: f.y + 44 * f.scale, w: 28, h: 9, vx: f.face * 11, vy: 0,
  dmg: 22, life: 45, stun: 14, kb: 2.5, gain: 2, ...o,
});

export const SHURIKEN = { id: 'shuriken', pose: 'cast', su: 6, ac: 1, re: 12, special: true, onFire(f, w) { needle(f, w); } };

export const CHAKRA_SHURIKEN = {
  id: 'cshuriken', pose: 'cast', su: 9, ac: 1, re: 20, cost: 20, special: true,
  onFire(f, w) { for (const a of [-0.2, 0, 0.2]) needle(f, w, { vx: f.face * 10 * Math.cos(a), vy: 10 * Math.sin(a), dmg: 26, life: 55, homing: 0.03, stun: 18 }); },
};

// Fonce vers l'adversaire (invulnérable au départ) ; si l'adversaire est en l'air (lancé), le dash monte à sa poursuite, au sol comme en l'air.
// Après un coup au but, ○ enchaîne (Poing au sol, Poing aérien en l'air) : △ → ✕ → ○ ○ ○. Peut aussi prolonger un combo (annulation).
export const CHAKRA_DASH = {
  id: 'cdash', pose: 'dash', su: 3, ac: 12, re: 14, cost: 20, dmg: 36, ox: 0, rx: 46, y0: 10, y1: 72, stun: 24, kb: 2, gain: 5, inv: 8, snd: 'kick',
  cancels: { punch: 'punch1', high: 'upper', low: 'trip', side: 'palm2' },
  onTick(f, w) {
    f.vx = f.face * 13; f.fx = 'trail';
    const e = w.nearestEnemy(f);
    if (e && e.y > 25) f.vy = Math.max(-6, Math.min(11, (e.y + 30 - f.y) * 0.35));
  },
};
