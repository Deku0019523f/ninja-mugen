import { character } from '../_make.js';

// Ryō — Œil du Faucon
export default character({ sheet: 'archer', name: 'Ryō', title: 'Œil du Faucon', arch: 'blade', hair: 'slick', hairColor: '#3a3a3a', skin: 'b', top: '#3a3a5a', accent: '#e0c060', extras: 'band,sash,wings,bandolier', spd: 1.15, pow: 1.1, def: 0.95, spName: "Serre du Faucon", supName: "Piqué Fatal", proj: { speed: 12, dmg: 56 }, weapon: 'nodachi', reach: 1.2, fx: ['#e0c060', '#ffffff'], ult: { kind: 'dive', dmg: 30, last: 110, v: 21 } });
