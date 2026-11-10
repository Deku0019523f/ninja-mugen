import { character } from '../_make.js';

// Gen — Vieux Maître
export default character({ name: 'Gen', title: 'Vieux Maître', arch: 'sage', hair: 'short', hairColor: '#d8d8d8', skin: 'b', top: '#5a7a5a', accent: '#c8b070', extras: 'beard,robe', spd: 0.9, pow: 1.15, def: 1.15, spName: "Sphère du Vieux Sage", supName: "Sagesse des Anciens", proj: { dmg: 74, size: 18 }, weapon: 'staff', reach: 1.2, fx: ['#e0c870', '#fff3c0'], ult: { kind: 'buff', buff: 'power', heal: 0.25, frames: 600 } });
