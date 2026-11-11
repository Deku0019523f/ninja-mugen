// Combo latéral « Paume » — ← / → + ○ (puis ← / → + ○ : Paume 2, puis le finisseur du personnage)
export default { id: 'palm', info: { name: 'Paume (chaîne latérale)', input: '← / → + ○, répété' }, pose: 'palm', su: 5, ac: 3, re: 10, dmg: 30, ox: 6, rx: 50, y0: 20, y1: 64, kb: 5, adv: 2, stun: 16, cancels: { side: 'palm2', punch: 'punch2', high: 'upper', low: 'shin' }, gain: 4, snd: 'punch' };
