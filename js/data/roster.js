// ============================================================
//  ROSTER : archétypes de techniques + 56 combattants ORIGINAUX
// ============================================================
// Chaque archétype définit : projectile (touche Spécial), mouvement (touche Technique)
// et super attaque (touche Super). Les combattants ne sont que des variations
// (apparence, stats) autour de ces archétypes.

export const ARCH = {
  brawler: { label: 'Combattant', c1: '#ffb23a', c2: '#fff0a0', spName: 'Onde de Choc', m2: 'dash', sup: 'barrage', supName: 'Pluie de Poings',
    proj: { type: 'orb', speed: 7.5, dmg: 46, size: 11, life: 50, n: 1 } },
  sage: { label: 'Ermite', c1: '#ff9a2a', c2: '#ffe8a0', spName: 'Sphère Spirale', m2: 'uppercut', sup: 'transform', supName: 'Mode Ermite',
    proj: { type: 'orb', speed: 6, dmg: 70, size: 17, life: 70, n: 1, launch: { vx: 4, vy: 5 } } },
  fury: { label: 'Bête', c1: '#ff4a1a', c2: '#ffd23a', spName: 'Griffe Bestiale', m2: 'dash', sup: 'transform', supName: 'Fureur Déchaînée',
    proj: { type: 'wave', speed: 8, dmg: 62, size: 14, life: 60, n: 1, launch: { vx: 3, vy: 6 } } },
  fire: { label: 'Feu', c1: '#ff6a1a', c2: '#ffe05a', spName: 'Boule de Feu', m2: 'dash', sup: 'beam', supName: 'Grand Brasier',
    proj: { type: 'orb', speed: 7, dmg: 66, size: 15, life: 80, n: 1, launch: { vx: 3, vy: 4 } } },
  wind: { label: 'Vent', c1: '#7affc8', c2: '#e8fff6', spName: 'Lame de Vent', m2: 'uppercut', sup: 'storm', supName: 'Tempête Tranchante',
    proj: { type: 'blade', speed: 9, dmg: 52, size: 14, life: 70, n: 1, pierce: 99 } },
  lightning: { label: 'Foudre', c1: '#8ad0ff', c2: '#ffffff', spName: 'Éclair Rapide', m2: 'teleport', sup: 'barrage', supName: 'Mille Éclairs',
    proj: { type: 'bolt', speed: 13, dmg: 58, size: 10, life: 40, n: 1, stun: 22 } },
  water: { label: 'Eau', c1: '#3a9aff', c2: '#c8f0ff', spName: 'Vague Déferlante', m2: 'slam', sup: 'nova', supName: 'Raz-de-Marée',
    proj: { type: 'wave', speed: 6.5, dmg: 58, size: 16, life: 80, n: 1, launch: { vx: 3, vy: 7 } } },
  earth: { label: 'Terre', c1: '#b0803a', c2: '#e8d098', spName: 'Rocher Lancé', m2: 'pillar', sup: 'giant', supName: 'Golem Colossal',
    proj: { type: 'rock', speed: 6.5, dmg: 74, size: 15, life: 70, n: 1, grav: 0.18, vy: 4, launch: { vx: 4, vy: 5 } } },
  shadow: { label: 'Ombre', c1: '#8a5cff', c2: '#d8c8ff', spName: 'Esprit Traqueur', m2: 'teleport', sup: 'clones', supName: 'Légion d\'Ombres',
    proj: { type: 'spirit', speed: 4.5, dmg: 50, size: 12, life: 110, n: 1, homing: 0.12 } },
  sand: { label: 'Sable', c1: '#d8b060', c2: '#fff0c0', spName: 'Mur de Sable', m2: 'pillar', sup: 'nova', supName: 'Tombeau du Désert',
    proj: { type: 'wave', speed: 5.5, dmg: 54, size: 18, life: 90, n: 1, launch: { vx: 2, vy: 8 } } },
  poison: { label: 'Poison', c1: '#9ae04a', c2: '#e8ffb8', spName: 'Nuage Toxique', m2: 'leap', sup: 'storm', supName: 'Pluie Acide',
    proj: { type: 'cloud', speed: 3.2, dmg: 18, size: 26, life: 110, n: 1, pierce: 99, rehit: 12, stun: 14, kb: 0.6 } },
  blade: { label: 'Lame', c1: '#d8e0ff', c2: '#ffffff', spName: 'Taillade Spectrale', m2: 'dash', sup: 'barrage', supName: 'Danse des Cent Lames',
    proj: { type: 'blade', speed: 11, dmg: 60, size: 13, life: 60, n: 1, pierce: 99 } },
  swarm: { label: 'Essaim', c1: '#6bd64a', c2: '#d8ffb0', spName: 'Essaim Vorace', m2: 'leap', sup: 'clones', supName: 'Nuée Infinie',
    proj: { type: 'spirit', speed: 5, dmg: 24, size: 8, life: 90, n: 3, spread: 22, homing: 0.08 } },
  bone: { label: 'Os', c1: '#e8e8d0', c2: '#ffffff', spName: 'Pics Osseux', m2: 'pillar', sup: 'storm', supName: 'Forêt d\'Os',
    proj: { type: 'needle', speed: 10, dmg: 28, size: 7, life: 55, n: 3, spread: 12 } },
  art: { label: 'Explosif', c1: '#ffd23a', c2: '#ff5a2a', spName: 'Bombe d\'Argile', m2: 'leap', sup: 'giant', supName: 'Chef-d\'œuvre Géant',
    proj: { type: 'orb', speed: 5.5, dmg: 40, size: 12, life: 70, n: 1, grav: 0.1, vy: 3, explode: true } },
  ice: { label: 'Glace', c1: '#a8e8ff', c2: '#ffffff', spName: 'Éclats de Glace', m2: 'slam', sup: 'nova', supName: 'Âge Glaciaire',
    proj: { type: 'needle', speed: 9, dmg: 30, size: 8, life: 60, n: 3, spread: 16 } },
  light: { label: 'Lumière', c1: '#fff08a', c2: '#ffffff', spName: 'Lance Radieuse', m2: 'teleport', sup: 'beam', supName: 'Rayon Solaire',
    proj: { type: 'bolt', speed: 11, dmg: 56, size: 11, life: 55, n: 1, pierce: 1 } },
  puppet: { label: 'Marionnettes', c1: '#d89a6a', c2: '#fff0d8', spName: 'Aiguilles Mécaniques', m2: 'leap', sup: 'clones', supName: 'Armée de Pantins',
    proj: { type: 'needle', speed: 9, dmg: 26, size: 7, life: 55, n: 5, spread: 9 } },
};

const SK = { a: '#f6d1b0', b: '#e8b48a', c: '#c98f62', d: '#8d5a3b', e: '#f3e0cf' };

// nom, titre, archétype, coiffure, couleur cheveux, peau, tenue, accent, accessoires, vitesse, puissance, défense
const R = (name, title, arch, hair, hc, sk, top, acc, ex = '', spd = 1, pow = 1, def = 1) =>
  ({ name, title, arch, hair, hc, skin: SK[sk], top, acc, ex: ex.split(',').filter(Boolean), spd, pow, def });

export const ROSTER = [
  R('Kaito', 'Apprenti', 'brawler', 'spiky', '#ffd23a', 'a', '#ff8a1c', '#2a3f9a', 'band', 1.05, 1, 1),
  R('Kaito', 'Ermite', 'sage', 'spiky', '#ffb02a', 'a', '#c8501a', '#2b2b2b', 'cape,band', 1, 1.1, 1),
  R('Kaito', 'Furie', 'fury', 'wild', '#ffcf3a', 'a', '#e2531a', '#ff3b1a', '', 1.15, 1.2, .9),
  R('Kaito', 'Légende', 'wind', 'spiky', '#ffe45a', 'a', '#f0a020', '#ffffff', 'cape,band', 1.1, 1.15, 1.05),
  R('Kaito', 'Dernier Combat', 'light', 'spiky', '#ffe45a', 'a', '#2b2b3a', '#ffd23a', 'band', 1.1, 1.1, 1),
  R('Ren', 'Le Vengeur', 'lightning', 'slick', '#1a1a2e', 'e', '#2b3a6e', '#c9d4ff', '', 1.1, 1.05, .95),
  R('Ren', 'Œil Écarlate', 'fire', 'slick', '#14141f', 'e', '#1c1c2c', '#d02828', 'cape', 1.05, 1.15, .95),
  R('Ren', 'Ange Noir', 'shadow', 'long', '#101018', 'e', '#232336', '#8a5cff', 'mask', 1.15, 1.1, .9),
  R('Hana', 'Poing d\'Acier', 'brawler', 'bob', '#ff8fb5', 'a', '#d83a5a', '#ffffff', 'band', 1, 1.2, 1),
  R('Hana', 'Guérisseuse', 'light', 'bob', '#ff8fb5', 'a', '#e8718f', '#fff3f6', 'band', 1.05, .9, 1.1),
  R('Kenji', 'Le Stratège', 'shadow', 'topknot', '#2a1d14', 'b', '#3b5a3b', '#d6c27a', '', .95, 1, 1),
  R('Daichi', 'Le Colosse', 'earth', 'bald', '#000000', 'c', '#9a6a2a', '#4a3010', 'scarf', .8, 1.3, 1.4),
  R('Mizuki', 'Sage de l\'Eau', 'water', 'long', '#6bd6ff', 'e', '#2a7bd0', '#bfefff', '', 1, 1, 1),
  R('Akira', 'Danse des Lames', 'blade', 'pony', '#d9d9e8', 'e', '#4a4a66', '#c0c0d8', 'sword', 1.2, 1.1, .9),
  R('Haruto', 'Marionnettiste', 'puppet', 'short', '#8a2a2a', 'b', '#3a2a2a', '#a05a3a', 'hat', 1, 1, 1),
  R('Yuna', 'Reine des Insectes', 'swarm', 'buns', '#2a2a3a', 'a', '#3a3a52', '#6bd64a', 'mask', 1.1, .95, .9),
  R('Shin', 'Maître des Os', 'bone', 'mohawk', '#e8e8e8', 'e', '#d8d8c8', '#6a6a58', '', 1, 1.15, 1),
  R('Takumi', 'Artiste Explosif', 'art', 'wild', '#ffd86b', 'a', '#2a2a2a', '#d83030', '', 1.05, 1.1, .9),
  R('Gorō', 'Le Sable Rouge', 'sand', 'short', '#a02828', 'e', '#b8803a', '#703a1a', 'band', .95, 1.1, 1.1),
  R('Ayame', 'Cristal de Glace', 'ice', 'long', '#bfe9ff', 'e', '#7ec8f0', '#ffffff', '', 1.1, 1, .95),
  R('Jirō', 'Fumée Mortelle', 'poison', 'slick', '#3a2a4a', 'b', '#4a2f6a', '#8ae04a', 'mask', 1, 1.1, 1),
  R('Tsubasa', 'Lame de Tempête', 'wind', 'pony', '#2a8a6a', 'b', '#2a8a6a', '#e0f0d0', 'sword', 1.2, 1, .95),
  R('Kuro', 'Griffe Nocturne', 'fury', 'wild', '#14141c', 'c', '#2a2a38', '#ff5a1a', '', 1.2, 1.15, .9),
  R('Shiro', 'Moine Radieux', 'light', 'bald', '#000000', 'b', '#f0d878', '#a05a1a', 'scarf', .95, 1, 1.2),
  R('Momo', 'Petit Génie', 'puppet', 'buns', '#ff9a3a', 'a', '#4a9ad8', '#ffd23a', 'glasses', 1.1, .85, .9),
  R('Hiro', 'Tonnerre Rouge', 'lightning', 'spiky', '#d83a3a', 'a', '#2a2a2a', '#ffd23a', 'band', 1.15, 1.15, .85),
  R('Nao', 'Ombre Silencieuse', 'shadow', 'hood', '#1a1a1a', 'e', '#2f2f45', '#b0b0d0', 'mask', 1.2, 1, .85),
  R('Reiji', 'Seigneur du Feu', 'fire', 'topknot', '#5a1a1a', 'b', '#c82a1a', '#ffcf3a', 'cape', 1, 1.2, 1),
  R('Saya', 'Danseuse de l\'Éventail', 'wind', 'pony', '#c870ff', 'a', '#7a3ab8', '#ffe0ff', '', 1.15, .95, .95),
  R('Ibuki', 'Mur de Pierre', 'earth', 'short', '#5a4a3a', 'c', '#6a5a40', '#c0a060', 'scarf', .85, 1.1, 1.3),
  R('Kazuma', 'Poing de Fer', 'brawler', 'mohawk', '#2a2a2a', 'c', '#a82a2a', '#ffd23a', 'band', 1, 1.25, 1.05),
  R('Emi', 'Vague Cristalline', 'water', 'bob', '#3a8aff', 'a', '#3a7ad8', '#e0f0ff', '', 1.05, 1, 1),
  R('Ryō', 'Œil du Faucon', 'blade', 'slick', '#3a3a3a', 'b', '#3a3a5a', '#e0c060', 'sword,band', 1.1, 1.1, 1),
  R('Tomo', 'Gardien du Brouillard', 'ice', 'hood', '#cfd8e8', 'e', '#6a7a98', '#e8f0ff', 'mask', 1, 1, 1.1),
  R('Yoshi', 'Bête Sauvage', 'fury', 'wild', '#6a3a1a', 'd', '#7a4a1a', '#e8c070', '', 1.1, 1.2, 1.1),
  R('Raku', 'Maître des Pantins', 'puppet', 'topknot', '#3a1a3a', 'b', '#5a2a5a', '#d8a0d8', 'hat', 1, 1.05, 1),
  R('Zen', 'Sage Immobile', 'sage', 'bald', '#000000', 'c', '#e8a030', '#5a2a10', 'cape', .9, 1.2, 1.1),
  R('Natsu', 'Soleil Ardent', 'fire', 'spiky', '#ff6a2a', 'a', '#ff4a1a', '#ffe05a', 'band', 1.1, 1.1, .95),
  R('Mei', 'Alchimiste', 'poison', 'buns', '#4a1a4a', 'a', '#6a3a8a', '#c8f060', 'glasses', 1.05, 1, .95),
  R('Shō', 'Maître Éclair', 'lightning', 'short', '#ffe45a', 'b', '#2a5ad8', '#ffffff', 'band', 1.2, 1, .9),
  R('Tarō', 'Géant Gentil', 'earth', 'short', '#3a2a1a', 'd', '#8a5a2a', '#e0c080', '', .75, 1.3, 1.5),
  R('Noa', 'Esprit Libre', 'wind', 'bob', '#7ad8c8', 'a', '#3aa898', '#ffffff', '', 1.15, 1, 1),
  R('Ume', 'Fleur de Cerisier', 'swarm', 'long', '#ff9ac8', 'a', '#e870a8', '#fff0f8', '', 1.1, .95, .95),
  R('Oboro', 'Voile de Nuit', 'shadow', 'long', '#2a1a4a', 'e', '#1a1a3a', '#6a4ad8', 'cape,mask', 1.15, 1.1, .9),
  R('Ginjirō', 'Le Faucheur', 'blade', 'slick', '#8a8a9a', 'e', '#2a2a3a', '#d8d8e8', 'sword,scarf', 1, 1.2, 1),
  R('Ranmaru', 'Explosion Pure', 'art', 'spiky', '#ff4aa8', 'a', '#3a3a3a', '#ff4aa8', '', 1, 1.2, .9),
  R('Ikki', 'Roi des Flammes', 'fire', 'mohawk', '#ff7a1a', 'c', '#7a1a1a', '#ffb02a', 'scarf', 1.05, 1.15, 1),
  R('Wakaba', 'Jeune Pousse', 'brawler', 'bob', '#7ad84a', 'a', '#4aa83a', '#ffffff', 'band', 1.2, .9, .9),
  R('Yami', 'Seigneur des Ténèbres', 'shadow', 'long', '#0a0a10', 'e', '#14141c', '#c02aff', 'cape', 1, 1.3, 1),
  R('Hikari', 'Déesse Lumineuse', 'light', 'long', '#fff3b0', 'e', '#f8f0d8', '#ffd23a', 'cape', 1.1, 1.15, 1),
  R('Gen', 'Vieux Maître', 'sage', 'short', '#d8d8d8', 'b', '#5a7a5a', '#c8b070', 'staff', .9, 1.1, 1.1),
  R('Sora', 'Pilote du Ciel', 'wind', 'spiky', '#4aa8ff', 'a', '#2a6ac8', '#ffffff', 'band', 1.2, 1, .95),
  R('Kagami', 'Miroir Brisé', 'ice', 'slick', '#9ad8ff', 'e', '#2a4a8a', '#d8f0ff', '', 1.1, 1.05, 1),
  R('Bakuto', 'Roi du Chaos', 'fury', 'wild', '#ff2a2a', 'c', '#3a1a1a', '#ffcf3a', 'horn', 1.1, 1.3, .95),
  R('Ōkami', 'Alpha', 'fury', 'wild', '#c8c8d8', 'e', '#4a4a58', '#e8e8f8', '', 1.2, 1.2, 1),
  R('Mugen', 'Ultime Maître', 'sage', 'spiky', '#ffffff', 'a', '#2a2a2a', '#ffd23a', 'cape,band', 1.15, 1.3, 1.1),
].map((c, i) => ({ ...c, id: i, full: `${c.name} — ${c.title}` }));

export const hexShade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
};
