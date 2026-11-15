// Ouverture de coffre : cartes face cachée, on les retourne. Mode 'pick' : 3 cartes, on en CHOISIT 1 (les autres restent perdues).
// Mode 'all' : 10 cartes, on les GARDE toutes. Chaque carte donne des fragments d'un personnage (barre « x/10 », « NOUVEAU ! » au déblocage).
import { G, el } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { drawPortrait } from '../render/sprites.js';
import { prog } from '../progress.js';
import { sfx } from '../audio.js';

const CSS = `.chs{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:radial-gradient(#2c1a3a,#0b0714);color:#fff;font-family:var(--f-ui,sans-serif)}
.chs h2{margin:0;font-size:22px;letter-spacing:2px;-webkit-text-stroke:3px #1a0f05;paint-order:stroke fill}
.chs p{margin:0;font-size:13px;opacity:.85}
.chs-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;max-width:96%;max-height:62vh;overflow:auto;padding:6px}
.cd{width:104px;height:150px;perspective:700px;cursor:pointer;flex:0 0 auto}
.cd>div{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}
.cd.up>div{transform:rotateY(180deg)}
.cd .f,.cd .b{position:absolute;inset:0;border-radius:10px;backface-visibility:hidden;border:3px solid #f3b61f;box-sizing:border-box;overflow:hidden}
.cd .b{background:repeating-linear-gradient(45deg,#5a2a7a 0 8px,#3b1a55 8px 16px);display:flex;align-items:center;justify-content:center;font-size:34px}
.cd .f{transform:rotateY(180deg);background:linear-gradient(#3a2b5a,#17102b);display:flex;flex-direction:column;align-items:center;padding:4px 3px;gap:1px}
.cd .f canvas{width:70px;height:70px;border-radius:8px;background:#0006}
.cd .f b{font-size:12px;line-height:1.1;text-align:center}.cd .f small{font-size:9px;opacity:.8;text-align:center;line-height:1.1}
.cd .f .n{font-size:18px;font-weight:900;color:#ffe066}
.cd .f img.rk{position:absolute;left:-2px;top:-2px;width:30px;height:30px}
.cd .bar{width:90%;height:9px;border-radius:5px;background:#000a;border:1px solid #ffffff55;overflow:hidden;margin-top:auto}
.cd .bar i{display:block;height:100%;background:linear-gradient(#6df,#28a)}
.cd .tx{font-size:9px;font-weight:800;margin-bottom:2px}
.cd .nw{position:absolute;right:-2px;top:-2px;background:#e8342a;color:#fff;font-size:10px;font-weight:900;padding:2px 5px;border-radius:6px;transform:rotate(8deg)}
.cd.lost{opacity:.35;filter:grayscale(.7)}.cd.pk{outline:3px solid #6df;border-radius:12px}
.chs.x10{gap:4px}.x10 .chs-row{max-height:none;gap:6px;padding:2px}.x10 .cd{width:96px;height:118px}.x10 .cd .f canvas{width:46px;height:46px}.x10 .cd .f b{font-size:11px}.x10 .cd .f .n{font-size:15px}.x10 .cd .f small{display:none}
.chs-ok{padding:8px 26px;border-radius:10px;border:2px solid #f3b61f;background:linear-gradient(#e8a21a,#a35d0c);color:#fff;font:800 16px var(--f-ui,sans-serif);cursor:pointer;-webkit-text-stroke:2px #1a0f05;paint-order:stroke fill}`;

export default function sChest(d) {
  const cards = d.cards, all = d.mode === 'all', root = el('div', 'chs' + (all ? ' x10' : ''));
  const st = document.createElement('style'); st.textContent = CSS; root.appendChild(st);
  const h = el('h2', '', d.title || 'COFFRE'), sub = el('p', '', all ? 'Touche une carte pour la retourner (ou OUVRIR TOUT).' : 'Choisis UNE carte : elle te donne ses fragments.');
  const row = el('div', 'chs-row'), ok = el('button', 'chs-ok', all ? 'OUVRIR TOUT' : '…'); ok.style.display = all ? '' : 'none';
  root.append(h, sub, row, ok); G.screenEl.appendChild(root);
  const done = () => { sfx.ok(); G.go(d.back || 'title', d.backData); };
  let opened = 0, finished = false;
  const els = cards.map((c, i) => {
    const ch = ROSTER[c.id], e = el('div', 'cd'), inner = el('div'); const f = el('div', 'f'), b = el('div', 'b', '✦');
    const cv = el('canvas'); cv.width = cv.height = 70; drawPortrait(cv.getContext('2d'), ch, 70);
    const rk = el('img', 'rk'); rk.src = `assets/ui/rank_${c.rank.toLowerCase()}.png`; rk.alt = c.rank;
    f.append(cv, rk, el('b', '', ch.name), el('small', '', ch.title || ''), el('span', 'n', `×${c.n}`)); inner.append(f, b); e.appendChild(inner); row.appendChild(e);
    return { e, f, c };
  });
  // applique les fragments de la carte et affiche la barre de progression
  function give(x) {
    const r = prog.addFrag(x.c.id, x.c.n), need = prog.need(x.c.id), have = prog.unlocked(x.c.id) ? need : prog.frags(x.c.id);
    const bar = el('div', 'bar', `<i style="width:${Math.round(have / need * 100)}%"></i>`), tx = el('div', 'tx', r.now ? 'DÉBLOQUÉ !' : r.over > 0 && !r.now && have >= need && r.coins ? `+${r.coins} pièces` : `${have}/${need}`);
    x.f.append(tx, bar); if (r.now) x.f.appendChild(el('span', 'nw', 'NOUVEAU !'));
    if (r.now) sfx.win(); else sfx.ui();
  }
  function flip(x) { x.e.classList.add('up'); }
  function finish() { finished = true; ok.textContent = 'OK'; ok.style.display = ''; ok.onclick = done; sub.textContent = all ? 'Toutes les cartes sont à toi.' : 'Fragments ajoutés.'; }
  els.forEach((x) => { x.e.onclick = () => {
    if (finished || x.e.classList.contains('up')) return;
    if (all) { flip(x); give(x); if (++opened === els.length) finish(); return; }
    // coffre ×3 : un seul choix, les autres cartes se retournent grisées
    x.e.classList.add('pk'); flip(x); give(x);
    els.forEach((y) => { if (y !== x) setTimeout(() => { y.e.classList.add('up', 'lost'); }, 500); });
    finish();
  }; });
  if (all) ok.onclick = () => { els.forEach((x, i) => { if (!x.e.classList.contains('up')) setTimeout(() => { if (!x.e.classList.contains('up')) { flip(x); give(x); if (++opened === els.length) finish(); } }, i * 220); }); ok.style.display = 'none'; };
  G.handler = (k) => { if (k === 'ok' && finished) done(); };
}
