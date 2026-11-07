// Décors : un fichier par stage. buildStage(i) dessine les couches à parallaxe.
import { rng } from './_draw.js';
import forest from './forest.js';
import plains from './plains.js';
import desert from './desert.js';
import snow from './snow.js';
import night from './night.js';
import volcano from './volcano.js';

const LIST = [forest, plains, desert, snow, night, volcano];
export const STAGES = LIST.map(({ id, name }) => ({ id, name }));

export function buildStage(idx) {
  const i = idx % LIST.length, def = LIST[i];
  return { id: def.id, name: def.name, ...def.build(rng(1000 + i * 77)) };
}
