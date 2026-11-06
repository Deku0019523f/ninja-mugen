const { chromium } = require('playwright');
(async () => {
const out = process.argv[2];
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 960, height: 720 } });
const errs = []; p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await p.goto('file:///home/claude/ninja-mugen/dist/ninja-mugen.html'); await p.waitForTimeout(800);
const key = async (k, n = 1) => { for (let i = 0; i < n; i++) { await p.keyboard.press(k); await p.waitForTimeout(70); } };
const spam = async (ms, keys) => { const t0 = Date.now(); let i = 0; while (Date.now() - t0 < ms) { const k = keys[i++ % keys.length]; await p.keyboard.down(k); await p.waitForTimeout(40); await p.keyboard.up(k); } };
// 2v2 arcade
await key('Enter'); await key('ArrowRight');                 // format 2v2
await key('ArrowDown', 4); await key('Enter'); await p.waitForTimeout(200);
await key('Enter'); await key('ArrowRight', 5); await key('Enter');  // 2 picks
await p.waitForTimeout(300); await key('Enter'); await p.waitForTimeout(4500);
await p.keyboard.down('KeyD'); await p.waitForTimeout(600); await p.keyboard.up('KeyD');
await spam(5000, ['KeyF','KeyF','KeyG','KeyH','KeyT','KeyY','KeyD','KeyW']);
await p.screenshot({ path: out + '/m1-2v2.png' });
await spam(6000, ['KeyY','KeyF','KeyG','KeyH','KeyD','KeyT']);
await p.screenshot({ path: out + '/m2-2v2b.png' });
// pause + quit
await key('KeyP'); await p.waitForTimeout(200); await p.screenshot({ path: out + '/m3-pause.png' });
await key('ArrowDown', 2); await key('Enter'); await p.waitForTimeout(500);
// training
await key('ArrowDown', 3); await key('Enter'); await p.waitForTimeout(200);      // mode 4 => training
await key('Enter'); await p.waitForTimeout(200);                                 // choose fighters
await key('Enter'); await p.waitForTimeout(200);                                 // pick
await key('Enter'); await p.waitForTimeout(200);                                 // stage
await p.waitForTimeout(3500);
await spam(4000, ['KeyY','KeyF','KeyF','KeyG','KeyH','KeyD']);
await p.screenshot({ path: out + '/m4-training.png' });
console.log(errs.length ? errs.join('\n') : 'no errors');
await b.close();
})();
