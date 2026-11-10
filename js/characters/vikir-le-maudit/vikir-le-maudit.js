// Vikir le Maudit : épéiste en costume sombre, katana au côté. Son ultime « Éveil de l'Épée Maudite Beelzebub » libère la lame :
// puissance, vitesse et allonge accrues, soin continu, aura rouge sang pendant une douzaine de secondes. Apparence tirée de la planche de l'auteur.
import { character } from '../_make.js';
import { VIKIR } from './sprite.js';

export default character({ name: 'Vikir', title: 'le Maudit', arch: 'shadow', hair: 'spiky', hairColor: '#1a1018', skin: 'e', top: '#2a1f36', accent: '#e0243c',
  extras: 'cape,coat', spd: 1.15, pow: 1.15, def: 0.95, spName: 'Entaille Maudite', supName: "Éveil de l'Épée Maudite Beelzebub",
  proj: { dmg: 62 }, weapon: 'katana', reach: 1.15, fx: ['#e0243c', '#ff8a9a'], sprite: VIKIR,
  ult: { kind: 'buff', buff: 'awaken', frames: 780, heal: 0.15 } });
