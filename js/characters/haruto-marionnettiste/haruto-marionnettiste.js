import { character } from '../_make.js';

// Haruto — Marionnettiste
export default character({ name: 'Haruto', title: 'Marionnettiste', arch: 'puppet', hair: 'short', hairColor: '#8a2a2a', skin: 'b', top: '#3a2a2a', accent: '#a05a3a', extras: 'hat,marionette', spd: 1, pow: 0.95, def: 1, spName: "Fils Tranchants", supName: "Théâtre de Marionnettes", proj: { n: 5, spread: 8 }, weapon: 'scroll', fx: ['#b05a3a', '#ffd0a0'], ult: { kind: 'clones', n: 3, type: 'spirit', dmg: 64 } });
