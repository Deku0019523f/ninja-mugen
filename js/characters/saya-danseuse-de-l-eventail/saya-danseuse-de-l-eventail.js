import { character } from '../_make.js';

// Saya — Danseuse de l'Éventail
export default character({ name: 'Saya', title: 'Danseuse de l\'Éventail', arch: 'wind', hair: 'pony', hairColor: '#c870ff', skin: 'a', top: '#7a3ab8', accent: '#ffe0ff', extras: 'sash,kimono,flower', spd: 1.2, pow: 0.95, def: 0.95, spName: "Éventail Tranchant", supName: "Danse des Tempêtes", proj: { dmg: 50, speed: 10 }, weapon: 'fan', weapon2: 'fan', fx: ['#c870ff', '#ffe0ff'], ult: { kind: 'wave', n: 3, dmg: 56, style: 'wind' } });
