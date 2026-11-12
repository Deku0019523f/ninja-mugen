import { character } from '../_make.js';

// Daichi — Le Colosse
export default character({ sheet: 'crystal', name: 'Daichi', title: 'Le Colosse', arch: 'earth', hair: 'bald', hairColor: '#000000', skin: 'c', top: '#9a6a2a', accent: '#4a3010', extras: 'scarf,beard,pauldron,armor', spd: 0.85, pow: 1.25, def: 1.3, spName: "Éboulement", supName: "Colosse de Granit", proj: { dmg: 80, speed: 6 }, weapon: 'hammer', reach: 1.15, fx: ['#a07a48', '#e0c080'], ult: { kind: 'eruption', n: 8, dmg: 62 } });
