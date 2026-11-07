// Fabrique un combattant à partir de sa fiche (apparence + stats). Chaque personnage a son dossier.
const SKIN = { a: '#f6d1b0', b: '#e8b48a', c: '#c98f62', d: '#8d5a3b', e: '#f3e0cf' };

export const character = ({ name, title, arch, hair, hairColor, skin, top, accent, extras = '', spd = 1, pow = 1, def = 1 }) =>
  ({ name, title, arch, hair, hc: hairColor, skin: SKIN[skin], top, acc: accent, ex: extras.split(',').filter(Boolean), spd, pow, def });
