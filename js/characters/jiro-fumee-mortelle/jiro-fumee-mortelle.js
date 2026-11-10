import { character } from '../_make.js';

// Jirō — Fumée Mortelle
export default character({ name: 'Jirō', title: 'Fumée Mortelle', arch: 'poison', hair: 'slick', hairColor: '#3a2a4a', skin: 'b', top: '#4a2f6a', accent: '#8ae04a', extras: 'mask,coat', spd: 1.05, pow: 0.95, def: 1, spName: "Brume Mortelle", supName: "Nuée d'Acide Noir", proj: { dmg: 20, size: 28 }, weapon: 'flasks', fx: ['#9ae04a', '#d8ff90'], ult: { kind: 'zone', w: 320, dmg: 14, life: 200 } });
