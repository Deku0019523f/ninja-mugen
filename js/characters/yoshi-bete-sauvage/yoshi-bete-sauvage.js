import { character } from '../_make.js';

// Yoshi — Bête Sauvage
export default character({ name: 'Yoshi', title: 'Bête Sauvage', arch: 'fury', hair: 'wild', hairColor: '#6a3a1a', skin: 'd', top: '#7a4a1a', accent: '#e8c070', extras: 'markings,ears,tail,fur', spd: 1.15, pow: 1.2, def: 0.95, spName: "Croc Sauvage", supName: "Frénésie Sauvage", proj: { dmg: 60, speed: 9 }, weapon: 'claws', reach: 0.95, fx: ['#e8c070', '#ffffff'], ult: { kind: 'grab', dmg: 24, last: 120 } });
