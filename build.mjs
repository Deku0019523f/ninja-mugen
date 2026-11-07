// Assemble tout (three.js inclus) en UN SEUL fichier HTML : dist/ninja-mugen.html
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const r = await build({ entryPoints: ['js/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020', write: false, legalComments: 'none' });
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = ['base', 'hud', 'menus', 'touch'].map((n) => readFileSync(`css/${n}.css`, 'utf8')).join('\n');
const html = readFileSync('template.html', 'utf8').replace('/*CSS*/', () => css).replace('/*JS*/', () => js);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/ninja-mugen.html', html);
console.log('dist/ninja-mugen.html', (html.length / 1024).toFixed(0), 'Ko');
