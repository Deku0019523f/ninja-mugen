import { character } from '../_make.js';

// Kazuma — Poing de Fer
export default character({ sheet: 'fighter', name: 'Kazuma', title: 'Poing de Fer', arch: 'brawler', hair: 'mohawk', hairColor: '#2a2a2a', skin: 'c', top: '#a82a2a', accent: '#ffd23a', extras: 'band,pauldron,bracers', spd: 0.95, pow: 1.3, def: 1.1, spName: "Choc de Fer", supName: "Marteau de Fer", proj: { dmg: 52, size: 13 }, weapon: 'gauntlet', weapon2: 'gauntlet', fx: ['#ffd23a', '#ffffff'], ult: { kind: 'rush', dmg: 28, last: 95, every: 5 } });
