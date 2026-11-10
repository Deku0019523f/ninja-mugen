import { character } from '../_make.js';

// Tarō — Géant Gentil
export default character({ name: 'Tarō', title: 'Géant Gentil', arch: 'earth', hair: 'short', hairColor: '#3a2a1a', skin: 'd', top: '#8a5a2a', accent: '#e0c080', extras: 'pauldron,armor,fur', spd: 0.8, pow: 1.25, def: 1.3, spName: "Rocher Bienveillant", supName: "Étreinte du Géant", proj: { dmg: 78, size: 17 }, weapon: 'hammer', reach: 1.1, fx: ['#b09060', '#f0d8a0'], ult: { kind: 'buff', buff: 'giant', frames: 720, heal: 0.15 } });
