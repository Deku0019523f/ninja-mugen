// Technique « dash » (touche Technique, 15 chakra)
export default { id: 'dash', name: 'Charge', pose: 'dash', su: 7, ac: 14, re: 14, cost: 15, dmg: 68, ox: 0, rx: 52, y0: 10, y1: 66, launch: { vx: 4.5, vy: 6 }, gain: 6, snd: 'kick',
  onTick(f) { f.vx = f.face * 12.5; f.fx = 'trail'; } };
