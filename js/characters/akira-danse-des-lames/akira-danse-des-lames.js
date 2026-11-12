import { character } from '../_make.js';

// Akira — Danse des Lames
export default character({ sheet: 'samurai', name: 'Akira', title: 'Danse des Lames', arch: 'blade', hair: 'pony', hairColor: '#d9d9e8', skin: 'e', top: '#4a4a66', accent: '#c0c0d8', extras: 'sash,kimono', spd: 1.25, pow: 1.1, def: 0.85, spName: "Croissant Argenté", supName: "Danse des Mille Éclats", proj: { speed: 12, dmg: 58 }, weapon: 'katana', weapon2: 'katana', reach: 1.1, fx: ['#c8d4ff', '#ffffff'], ult: { kind: 'slash', dmg: 16, last: 100 } });
