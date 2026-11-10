import { character } from '../_make.js';

// Ayame — Cristal de Glace
export default character({ name: 'Ayame', title: 'Cristal de Glace', arch: 'ice', hair: 'long', hairColor: '#bfe9ff', skin: 'e', top: '#7ec8f0', accent: '#ffffff', extras: 'veil,ribbon', spd: 1, pow: 1, def: 1.1, spName: "Lance de Givre", supName: "Palais de Cristal", proj: { n: 4, spread: 12, dmg: 27 }, weapon: 'fan', fx: ['#8fdcff', '#ffffff'], ult: { kind: 'rain', type: 'needle', style: 'ice', size: 8, dmg: 30, every: 2 } });
