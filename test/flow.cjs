const { chromium } = require('playwright');
(async () => {
const out = process.argv[2];
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 800, height: 600 } });
const errs = []; p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await p.goto('file:///home/claude/ninja-mugen/dist/ninja-mugen.html'); await p.waitForTimeout(800);
const key = async (k, n = 1) => { for (let i = 0; i < n; i++) { await p.keyboard.press(k); await p.waitForTimeout(70); } };
await key('Enter'); await key('ArrowDown', 4); await key('Enter'); await key('Enter'); await p.waitForTimeout(300); await key('Enter'); await p.waitForTimeout(3500);
let shots = 0;
for (let i = 0; i < 400; i++) {
  const st = await p.evaluate(() => { const m = window.__ninja.match; if (!m) return null; const w = m.world; if (m.phase === 'fight') w.team(1).forEach((f) => { if (f.hp > 8) f.hp = 8; }); return { phase: m.phase, wins: m.wins, round: m.round }; });
  if (!st) { const t = await p.evaluate(() => document.querySelector('#screen').innerText.slice(0, 80).replace(/\n/g, ' | ')); console.log('screen:', t); if (/VS|COMBAT 2/.test(t) || /FÉLICIT|DÉFAITE/.test(t)) { await p.screenshot({ path: out + '/f-next.png' }); break; } await p.waitForTimeout(300); continue; }
  if (st.phase === 'ko' && shots === 0) { await p.waitForTimeout(250); await p.screenshot({ path: out + '/f-ko.png' }); shots++; }
  if (st.phase === 'fight') { await p.keyboard.down('KeyD'); await p.keyboard.press('KeyF'); await p.waitForTimeout(60); await p.keyboard.press('KeyG'); await p.keyboard.up('KeyD'); }
  await p.waitForTimeout(120);
  if (i % 40 === 0) console.log(JSON.stringify(st));
}
console.log(errs.length ? errs.join('\n') : 'no errors');
await b.close();
})();
