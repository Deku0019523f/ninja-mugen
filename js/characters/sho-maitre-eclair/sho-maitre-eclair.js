import { character } from '../_make.js';

// Shō — Maître Éclair
export default character({ sheet: 'lightning', name: 'Shō', title: 'Maître Éclair', arch: 'lightning', hair: 'short', hairColor: '#ffe45a', skin: 'b', top: '#2a5ad8', accent: '#ffffff', extras: 'band,beard,robe', spd: 1.3, pow: 1, def: 0.9, spName: "Éclair du Maître", supName: "Orage Foudroyant", proj: { speed: 15, dmg: 56 }, weapon: 'bo', reach: 1.2, fx: ['#ffe45a', '#ffffff'], ult: { kind: 'bolts', n: 10, dmg: 42, gap: 6 } });
