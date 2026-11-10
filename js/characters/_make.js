// Fabrique un combattant à partir de sa fiche (apparence + stats + style de combat). Chaque personnage a son dossier.
//  weapon / weapon2 : arme tenue (main avant / arrière) · reach : allonge des coups normaux · fx : [couleur 1, couleur 2] de ses techniques
//  ult : recette de l'ultime (voir js/supers/ult/) · wc : couleur des ailes · sprite : {w,h,src} corps dessiné à partir d'une image
const SKIN = { a: '#f6d1b0', b: '#e8b48a', c: '#c98f62', d: '#8d5a3b', e: '#f3e0cf' };

export const character = ({ name, title, arch, hair, hairColor, skin, top, accent, extras = '', spd = 1, pow = 1, def = 1, spName, supName, proj, weapon, weapon2, reach, fx, ult, wc, sprite }) =>
  ({ name, title, arch, hair, hc: hairColor, skin: SKIN[skin], top, acc: accent, ex: extras.split(',').filter(Boolean), spd, pow, def, spName, supName, proj, weapon, weapon2, reach, fx, ult, wc, sprite });
