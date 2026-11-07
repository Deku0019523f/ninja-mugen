// Technique « uppercut » (touche Technique, 15 chakra)
export default { id: 'uppercut', name: 'Remontée', pose: 'upper', su: 6, ac: 14, re: 24, cost: 15, dmg: 84, ox: 0, rx: 38, y0: 10, y1: 125, launch: { vx: 2, vy: 13 }, inv: 14, gain: 8, snd: 'kick',
  onFire(f) { f.vy = 11.5; f.vx = f.face * 1.5; } };
