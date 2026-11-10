import { character } from '../_make.js';

// Yuna — Reine des Insectes
export default character({ name: 'Yuna', title: 'Reine des Insectes', arch: 'swarm', hair: 'buns', hairColor: '#2a2a3a', skin: 'a', top: '#3a3a52', accent: '#6bd64a', extras: 'mask,antenna,wings', spd: 1.05, pow: 1, def: 1.05, spName: "Essaim Royal", supName: "Nuée Infinie Royale", proj: { n: 4, spread: 18, dmg: 24 }, weapon: 'daggers', fx: ['#6bd64a', '#d8ff90'], ult: { kind: 'swarm', n: 20, type: 'spirit', style: 'swarm', size: 7, dmg: 18 } });
