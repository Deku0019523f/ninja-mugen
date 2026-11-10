import { character } from '../_make.js';

// Oboro — Voile de Nuit
export default character({ name: 'Oboro', title: 'Voile de Nuit', arch: 'shadow', hair: 'swoop', hairColor: '#2a1a4a', skin: 'e', top: '#1a1a3a', accent: '#6a4ad8', extras: 'cape,mask,veil,coat', spd: 1.1, pow: 1.05, def: 1, spName: "Voile Traqueur", supName: "Nuit Sans Étoiles", proj: { homing: 0.15, dmg: 52 }, weapon: 'daggers', fx: ['#6a4ad8', '#d0b8ff'], ult: { kind: 'zone', w: 340, dmg: 15, life: 200 } });
