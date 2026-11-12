import { character } from '../_make.js';

// Sora — Pilote du Ciel
export default character({ sheet: 'windhash', name: 'Sora', title: 'Pilote du Ciel', arch: 'wind', hair: 'spiky', hairColor: '#4aa8ff', skin: 'a', top: '#2a6ac8', accent: '#ffffff', extras: 'band,goggles,wings', spd: 1.25, pow: 1, def: 0.9, spName: "Rafale du Ciel", supName: "Looping Mortel", proj: { speed: 10, dmg: 50 }, weapon: 'spear', reach: 1.2, fx: ['#4aa8ff', '#ffffff'], ult: { kind: 'dive', dmg: 28, last: 100, v: 22 } });
