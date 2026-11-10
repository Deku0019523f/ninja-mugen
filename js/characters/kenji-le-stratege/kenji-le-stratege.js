import { character } from '../_make.js';

// Kenji — Le Stratège
export default character({ name: 'Kenji', title: 'Le Stratège', arch: 'shadow', hair: 'topknot', hairColor: '#2a1d14', skin: 'b', top: '#3b5a3b', accent: '#d6c27a', extras: 'eyepatch,coat', spd: 1.05, pow: 1, def: 1.1, spName: "Ombre Calculée", supName: "Échiquier d'Ombres", proj: { homing: 0.16 }, weapon: 'scroll', fx: ['#d6c27a', '#ffffff'], ult: { kind: 'clones', n: 4, type: 'spirit', dmg: 52 } });
