import { character } from '../_make.js';

// Takumi — Artiste Explosif
export default character({ name: 'Takumi', title: 'Artiste Explosif', arch: 'art', hair: 'wild', hairColor: '#ffd86b', skin: 'a', top: '#2a2a2a', accent: '#d83030', extras: 'goggles,vest', spd: 1, pow: 1.25, def: 0.95, spName: "Sculpture Explosive", supName: "Chef-d'œuvre Dévastateur", proj: { dmg: 46, size: 13 }, weapon: 'brush', fx: ['#ffd86b', '#d83030'], ult: { kind: 'rain', type: 'orb', size: 11, dmg: 36, every: 3, explode: true } });
