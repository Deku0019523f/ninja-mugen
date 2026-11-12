import { character } from '../_make.js';

// Mugen — Ultime Maître
export default character({ sheet: 'commander', name: 'Mugen', title: 'Ultime Maître', arch: 'sage', hair: 'spiky', hairColor: '#ffffff', skin: 'a', top: '#2a2a2a', accent: '#ffd23a', extras: 'cape,band,beard,robe,halo', spd: 1.2, pow: 1.3, def: 1.2, spName: "Sphère du Maître", supName: "Mode Mugen", proj: { dmg: 78, size: 19 }, weapon: 'staff', reach: 1.2, fx: ['#ffd23a', '#ffffff'], ult: { kind: 'ray', len: 600, bh: 90, dmg: 28, last: 130 } });
