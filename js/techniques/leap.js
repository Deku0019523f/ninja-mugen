// Technique « leap » (touche Technique, 15 chakra)
export default { id: 'leap', name: 'Bond Écrasant', pose: 'leap', su: 8, ac: 60, re: 8, cost: 15, dmg: 72, ox: -6, rx: 40, y0: -10, y1: 52, launch: { vx: 3, vy: -4 }, landEnds: true, gain: 6, snd: 'kick',
  onFire(f) { f.vy = 10; f.vx = f.face * 6.5; } };
