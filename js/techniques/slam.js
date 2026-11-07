// Technique « slam » (touche Technique, 15 chakra)
export default { id: 'slam', name: 'Impact', pose: 'leap', su: 8, ac: 60, re: 12, cost: 15, dmg: 70, ox: -6, rx: 40, y0: -10, y1: 52, launch: { vx: 3, vy: -4 }, landEnds: true, gain: 6, snd: 'kick',
  onFire(f) { f.vy = 10.5; f.vx = f.face * 5.5; },
  onLand(f, w) {
    for (const d of [-1, 1]) w.spawnProj(f, { type: 'wave', x: f.x + d * 20, y: 14, w: 40, h: 28, vx: d * 6, vy: 0, dmg: 50, life: 28, pierce: 0, stun: 18, kb: 4, launch: { vx: 2, vy: 6 }, gain: 3 });
    w.event({ t: 'quake', x: f.x });
  } };
