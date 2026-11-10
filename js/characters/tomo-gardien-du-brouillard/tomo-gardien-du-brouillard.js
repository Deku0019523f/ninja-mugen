import { character } from '../_make.js';

// Tomo — Gardien du Brouillard
export default character({ name: 'Tomo', title: 'Gardien du Brouillard', arch: 'ice', hair: 'hood', hairColor: '#cfd8e8', skin: 'e', top: '#6a7a98', accent: '#e8f0ff', extras: 'mask,coat,fur', spd: 1, pow: 0.95, def: 1.15, spName: "Brume Glacée", supName: "Linceul de Givre", proj: { n: 3, spread: 20, dmg: 28 }, weapon: 'claymore', reach: 1.15, fx: ['#cfd8e8', '#ffffff'], ult: { kind: 'zone', w: 340, dmg: 14, life: 210 } });
