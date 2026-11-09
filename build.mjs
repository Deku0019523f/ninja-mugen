// Assemble tout (three.js inclus) en UN SEUL fichier HTML : dist/ninja-mugen.html
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
export const CSS = ['fonts', 'base', 'ui', 'shell', 'hud', 'menus', 'home', 'select', 'stage', 'controls', 'touch'];
const r = await build({ entryPoints: ['js/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020', write: false, legalComments: 'none' });
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
// polices : les fichiers woff2 sont intégrés en base64 pour garder un seul fichier hors-ligne
const fonts = readFileSync('css/fonts.css', 'utf8').replace(/url\(\.\.\/(node_modules\/[\w@./-]+)\)/g, (_, f) => `url(data:font/woff2;base64,${readFileSync(f).toString('base64')})`);
const css = [fonts, ...CSS.slice(1).map((n) => readFileSync(`css/${n}.css`, 'utf8'))].join('\n');
const html = readFileSync('template.html', 'utf8').replace('/*CSS*/', () => css).replace('/*JS*/', () => js);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/ninja-mugen.html', html);
console.log('dist/ninja-mugen.html', (html.length / 1024).toFixed(0), 'Ko');
