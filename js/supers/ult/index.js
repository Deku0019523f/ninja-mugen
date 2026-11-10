// Fabrique l'ultime d'un personnage à partir de sa recette (char.ult = { kind, ... }). Un fichier par famille d'ultime.
import ray from './ray.js'; import rain from './rain.js'; import blast from './blast.js'; import rush from './rush.js'; import slash from './slash.js';
import meteor from './meteor.js'; import eruption from './eruption.js'; import vortex from './vortex.js'; import wave from './wave.js'; import swarm from './swarm.js';
import bolts from './bolts.js'; import clones from './clones.js'; import buff from './buff.js'; import grab from './grab.js'; import dive from './dive.js'; import zone from './zone.js';

export const KINDS = { ray, rain, blast, rush, slash, meteor, eruption, vortex, wave, swarm, bolts, clones, buff, grab, dive, zone };
const cache = new WeakMap();
export function ultOf(ch) {
  if (!ch.ult || !KINDS[ch.ult.kind]) return null;
  let m = cache.get(ch); if (!m) { m = KINDS[ch.ult.kind](ch.ult, ch); cache.set(ch, m); }
  return m;
}
