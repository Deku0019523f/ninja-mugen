// Dash sur l'ennemi (bouton tactile) : fonce vers l'adversaire quelle que soit la distance, coûte 30 d'énergie.
// Même coup que le Chakra Dash, mais la course dure jusqu'au contact (au plus RUSH_MAX frames) et accélère avec la distance.
export const RUSH_COST = 30, RUSH_MAX = 46;
export const RUSH = {
  id: 'rush', pose: 'dash', su: 3, ac: RUSH_MAX, re: 14, cost: RUSH_COST, dmg: 34, ox: 0, rx: 46, y0: 10, y1: 72, stun: 24, kb: 2, gain: 5, inv: 10, snd: 'kick',
  cancels: { punch: 'punch1', high: 'upper', low: 'trip', side: 'palm2' },
  onTick(f, w) {
    const e = w.nearestEnemy(f);
    if (f.connected || !e) { f.vx *= 0.5; return; }          // contact : la course s'arrête (le coup a touché)
    const d = Math.abs(e.x - f.x);
    f.face = e.x > f.x ? 1 : -1;
    f.vx = f.face * Math.max(13, Math.min(26, d * 0.12 + 10)); f.fx = 'trail';
    if (e.y > 25) f.vy = Math.max(-6, Math.min(11, (e.y + 30 - f.y) * 0.35));
  },
};
