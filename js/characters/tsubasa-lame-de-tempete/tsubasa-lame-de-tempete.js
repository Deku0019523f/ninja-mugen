import { character } from '../_make.js';

// Tsubasa — Lame de Tempête
export default character({ sheet: 'ronin', name: 'Tsubasa', title: 'Lame de Tempête', arch: 'wind', hair: 'pony', hairColor: '#2a8a6a', skin: 'b', top: '#2a8a6a', accent: '#e0f0d0', extras: 'sash,kimono', spd: 1.25, pow: 1.05, def: 0.9, spName: "Lame de Tempête", supName: "Cyclone d'Acier", proj: { speed: 11, dmg: 54 }, weapon: 'katana', reach: 1.1, fx: ['#6ae8b0', '#ffffff'], ult: { kind: 'wave', n: 3, dmg: 56, style: 'wind' } });
