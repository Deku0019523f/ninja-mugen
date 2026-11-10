import { character } from '../_make.js';

// Yoru — Chaîne Cramoisie (personnage créé d'après la planche de l'utilisateur : costume sombre, cravate rouge, cape, katana)
export default character({ name: 'Yoru', title: 'Chaîne Cramoisie', arch: 'shadow', hair: 'spiky', hairColor: '#1a1018', skin: 'e', top: '#3b2a46', accent: '#e0243c', extras: 'cape,coat', spd: 1.2, pow: 1.1, def: 0.95, spName: "Chaînes Écarlates", supName: "Exécution Cramoisie", proj: { dmg: 62 }, weapon: 'katana', reach: 1.1, fx: ['#e0243c', '#ffb0bc'], ult: { kind: 'slash', dmg: 19, last: 105 } });
