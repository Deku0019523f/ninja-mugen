// Combo « Uppercut » — ↑ + ○ (puis ↑ + ○ : Saut montée) : lance l'adversaire dans les airs
export default { id: 'upper', info: { name: 'Uppercut (lanceur)', input: '↑ + ○' }, pose: 'upper', su: 5, ac: 6, re: 20, dmg: 58, ox: 0, rx: 34, y0: 20, y1: 110, launch: { vx: 1.8, vy: 12.5 }, inv: 10, hop: 5, cancels: { high: 'rise' }, gain: 6, snd: 'kick' };
