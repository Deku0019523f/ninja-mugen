const { chromium } = require('playwright');
(async () => {
const out = process.argv[2];
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 800, height: 600 } });
const errs = []; p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await p.goto('file:///home/claude/ninja-mugen/dist/ninja-mugen.html');
await p.waitForTimeout(1200);
await p.screenshot({ path: out + '/1-title.png' });
const key = async (k, n = 1) => { for (let i = 0; i < n; i++) { await p.keyboard.press(k); await p.waitForTimeout(80); } };
await key('Enter'); await p.waitForTimeout(300);               // arcade setup
await p.screenshot({ path: out + '/2-setup.png' });
await key('ArrowDown', 4); await key('Enter'); await p.waitForTimeout(300);   // select
await key('ArrowRight', 2);
await p.screenshot({ path: out + '/3-select.png' });
await key('Enter'); await p.waitForTimeout(400);
await p.screenshot({ path: out + '/4-vs.png' });
await key('Enter'); await p.waitForTimeout(4200);
await p.screenshot({ path: out + '/5-fight0.png' });
await p.keyboard.down('KeyD'); await p.waitForTimeout(900); await p.keyboard.up('KeyD');
for (let i = 0; i < 6; i++) { await p.keyboard.press('KeyF'); await p.waitForTimeout(120); }
await p.keyboard.press('KeyH'); await p.waitForTimeout(250);
await p.screenshot({ path: out + '/6-fight1.png' });
await p.waitForTimeout(1500);
await p.screenshot({ path: out + '/7-fight2.png' });
console.log(errs.length ? errs.join('\n') : 'no errors');
await b.close();

})();
