// BOUTIQUE (germes) : COFFRES · PIÈCES · FRAGMENTS. Les germes se gagnent en jouant ; rien ne s'achète avec de l'argent réel.
import { G, el } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { drawPortrait } from '../render/sprites.js';
import { backBtn, pills } from '../ui/kit.js';
import { prog, GEM_COINS } from '../progress.js';
import { drawChest } from '../cards.js';
import { RANKS } from '../data/ranks.js';
import { sfx } from '../audio.js';

export const BOX3 = 250, BOX10 = 700;   // prix en germes
const CSS = `.shp{position:absolute;inset:0;display:flex;flex-direction:column;background:radial-gradient(#3a2414,#120a05);color:#fff;font-family:var(--f-ui,sans-serif)}
.shp-top{display:flex;align-items:center;gap:10px;padding:8px 12px}.shp-top h2{margin:0;flex:1;font-size:22px;letter-spacing:2px;-webkit-text-stroke:3px #1a0f05;paint-order:stroke fill}
.shp-body{flex:1;display:flex;min-height:0}
.shp-tabs{display:flex;flex-direction:column;gap:8px;padding:8px;width:96px}
.shp-tabs button{padding:10px 4px;border-radius:10px;border:2px solid #8a5a22;background:#2a1608;color:#fff;font:800 12px var(--f-ui,sans-serif);cursor:pointer}
.shp-tabs button.on{border-color:#f3b61f;background:linear-gradient(#e8a21a,#a35d0c);-webkit-text-stroke:1.5px #1a0f05;paint-order:stroke fill}
.shp-main{flex:1;overflow:auto;padding:8px 12px;display:flex;gap:12px;flex-wrap:wrap;align-content:flex-start}
.shp-it{width:210px;border-radius:14px;border:2px solid #f3b61f;background:linear-gradient(#5a3a1c,#2a1608);padding:10px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.shp-it img{width:84px;height:84px;object-fit:contain}.shp-it b{font-size:15px}.shp-it small{font-size:11px;opacity:.85;min-height:28px}
.shp-buy{display:flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;border:2px solid #fff;background:linear-gradient(#3fb86a,#1e7a40);color:#fff;font:800 15px var(--f-ui,sans-serif);cursor:pointer}
.shp-buy.dis{filter:grayscale(1);opacity:.55}.shp-buy .ic{width:20px;height:20px}
.shp-frg{display:flex;gap:8px;flex-wrap:wrap;width:100%}.shp-hero{width:120px;border-radius:10px;border:2px solid #8a5a22;background:#2a1608;padding:6px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px;text-align:center}
.shp-hero canvas{width:56px;height:56px;border-radius:8px;background:#0006}.shp-hero .rk{width:24px;height:24px}
.shp-hero .bar{width:100%;height:8px;border-radius:4px;background:#000a;overflow:hidden}.shp-hero .bar i{display:block;height:100%;background:linear-gradient(#6df,#28a)}
.shp-rk{width:100%;display:flex;gap:6px;flex-wrap:wrap}.shp-rk button{padding:4px 10px;border-radius:8px;border:2px solid #8a5a22;background:#2a1608;color:#fff;font:800 12px var(--f-ui,sans-serif);cursor:pointer}.shp-rk button.on{border-color:#f3b61f;background:#a35d0c}
.shp-msg{position:absolute;left:0;right:0;bottom:14px;text-align:center;font-weight:800;pointer-events:none}
.shp-md{position:absolute;inset:0;background:#000b;display:flex;align-items:center;justify-content:center}
.shp-md>div{width:min(360px,90%);border-radius:14px;border:3px solid #f3b61f;background:linear-gradient(#5a3a1c,#2a1608);padding:16px;text-align:center;display:flex;flex-direction:column;gap:12px}
.shp-md .r{display:flex;gap:10px;justify-content:center}.shp-md button{padding:8px 22px;border-radius:10px;border:2px solid #fff;font:800 15px var(--f-ui,sans-serif);color:#fff;cursor:pointer}`;
const GEM = '<i class="ic gem"></i>';

export default function sShop(d = {}) {
  let tab = d.tab || 'box', fr = 'E';
  const root = el('div', 'shp'), cur = pills(), top = el('div', 'shp-top'), body = el('div', 'shp-body'), tabs = el('div', 'shp-tabs'), main = el('div', 'shp-main');
  const st = document.createElement('style'); st.textContent = CSS; root.appendChild(st);
  top.append(backBtn(() => { sfx.back(); G.go('title'); }), el('h2', '', 'BOUTIQUE'), cur);
  body.append(tabs, main); root.append(top, body); G.screenEl.appendChild(root);
  const msg = (t) => { const m = el('div', 'shp-msg', t); root.appendChild(m); setTimeout(() => m.remove(), 1600); };
  // fenêtre de confirmation avant tout achat
  function confirm(text, price, go) {
    const m = el('div', 'shp-md', `<div><b>${text}</b><span>Coût : ${price} ${GEM} (tu as ${prog.gems})</span><div class="r"><button style="background:#7a2a2a" data-n>ANNULER</button><button style="background:#1e7a40" data-y>ACHETER</button></div></div>`);
    m.querySelector('[data-n]').onclick = () => { sfx.back(); m.remove(); };
    m.querySelector('[data-y]').onclick = () => { m.remove(); go(); };
    root.appendChild(m);
  }
  const item = (img, title, sub, price, onBuy) => {
    const it = el('div', 'shp-it', `<img src="${img}" alt=""><b>${title}</b><small>${sub}</small>`), b = el('button', 'shp-buy' + (prog.gems < price ? ' dis' : ''), `${GEM}<span>${price}</span>`);
    b.onclick = () => { if (prog.gems < price) { sfx.back(); return msg('Pas assez de germes'); } sfx.ok(); onBuy(); };
    it.appendChild(b); return it;
  };
  const open = (n, mode, title) => { prog.boxOpened(); G.go('chest', { cards: drawChest(n, 'normal'), mode, title, back: 'shop', backData: { tab: 'box' } }); };
  function draw() {
    cur.refresh(); tabs.innerHTML = ''; main.innerHTML = '';
    [['box', 'COFFRES'], ['coin', 'PIÈCES'], ['frag', 'FRAGMENTS']].forEach(([k, l]) => { const b = el('button', k === tab ? 'on' : '', l); b.onclick = () => { tab = k; sfx.ui(); draw(); }; tabs.appendChild(b); });
    if (tab === 'box') {
      main.append(
        item('assets/ui/chest.png', 'COFFRE ×3', '3 cartes : tu en choisis 1.', BOX3, () => confirm('Acheter un coffre ×3 ?', BOX3, () => { if (prog.spendGems(BOX3)) open(3, 'pick', 'COFFRE ×3'); })),
        item('assets/ui/chest.png', 'COFFRE ×10', '10 cartes : tu les gardes toutes.', BOX10, () => confirm('Acheter un coffre ×10 ?', BOX10, () => { if (prog.spendGems(BOX10)) open(10, 'all', 'COFFRE ×10'); })),
        el('p', '', 'Les cartes S et SS ne sortent que des victoires en Tournoi. Les germes se gagnent en jouant.'));
    } else if (tab === 'coin') {
      [10, 50, 100].forEach((g) => main.appendChild(item('assets/ui/coin.png', `${g * GEM_COINS} pièces`, `Convertit ${g} germes en pièces (1 germe = ${GEM_COINS} pièces).`, g, () => confirm(`Convertir ${g} germes en ${g * GEM_COINS} pièces ?`, g, () => { prog.convert(g); sfx.win(); msg(`+${g * GEM_COINS} pièces`); draw(); }))));
    } else {
      const rk = el('div', 'shp-rk'); ['E', 'D', 'C', 'B', 'A', 'AA'].forEach((r) => { const b = el('button', r === fr ? 'on' : '', r); b.onclick = () => { fr = r; sfx.ui(); draw(); }; rk.appendChild(b); });
      main.append(rk, el('p', '', 'Achète 1 fragment du personnage de ton choix. S et SS : uniquement par le Tournoi.'));
      const list = el('div', 'shp-frg'); main.appendChild(list);
      ROSTER.filter((c) => prog.rank(c.id) === fr).forEach((c) => {
        const u = prog.unlocked(c.id), need = prog.need(c.id), have = u ? need : prog.frags(c.id), pr = prog.fragPrice(c.id);
        const h = el('div', 'shp-hero'), cv = el('canvas'); cv.width = cv.height = 56; drawPortrait(cv.getContext('2d'), c, 56);
        h.append(cv, el('b', '', c.name), el('small', '', c.title || ''), el('div', 'bar', `<i style="width:${Math.round(have / need * 100)}%"></i>`), el('span', '', u ? 'Débloqué' : `${have}/${need}`));
        if (!u) { const b = el('button', 'shp-buy' + (prog.gems < pr ? ' dis' : ''), `${GEM}<span>${pr}</span>`); b.onclick = () => { if (prog.gems < pr) { sfx.back(); return msg('Pas assez de germes'); } confirm(`1 fragment de ${c.name} (${c.title})`, pr, () => { const r = prog.buyFrag(c.id); if (r) { sfx.win(); msg(r.now ? `${c.name} débloqué !` : '+1 fragment'); } draw(); }); }; h.appendChild(b); }
        list.appendChild(h);
      });
    }
  }
  G.handler = (k) => { if (k === 'back') { sfx.back(); G.go('title'); } };
  draw();
}
