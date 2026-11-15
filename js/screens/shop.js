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
.shp-top{display:flex;align-items:center;gap:10px;padding:6px 12px;height:44px;box-sizing:border-box}.shp-top h2{margin:0;flex:1;font-size:22px;letter-spacing:2px;-webkit-text-stroke:3px #1a0f05;paint-order:stroke fill}
.shp-body{flex:1;display:flex;min-height:0}
.shp-tabs{display:flex;flex-direction:column;justify-content:center;gap:10px;padding:6px 10px 6px 14px;width:84px}
.shp-tabs button{position:relative;width:70px;height:70px;padding:0;border:0;background:none;color:#fff;cursor:pointer;font:800 10px var(--f-ui,sans-serif);-webkit-text-stroke:2px #1a0f05;paint-order:stroke fill}
.shp-tabs button::before{content:'';position:absolute;left:11px;top:11px;width:48px;height:48px;transform:rotate(45deg);border:3px solid #1a0f05;border-radius:4px;background:linear-gradient(#6a4a2a,#3a2210);box-shadow:0 0 0 2px #8a5a22}
.shp-tabs button.on::before{background:linear-gradient(#ffd24a,#d88a0a);box-shadow:0 0 0 2px #fff4c0,0 0 14px #ff9a1f}
.shp-tabs button span{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:1px}.shp-tabs button img{width:22px;height:22px;object-fit:contain}
.shp-main{flex:1;overflow:auto;padding:6px 14px 8px 6px;display:flex;flex-direction:column;gap:8px}
.shp-ban{display:flex;align-items:center;gap:10px;font:800 13px var(--f-ui,sans-serif)}.shp-ban b{flex:1;font-size:15px}
.shp-reset{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:6px;border:3px solid #1a0f05;background:linear-gradient(#58b0f0,#1a68b8);color:#fff;font:900 14px var(--f-ui,sans-serif);cursor:pointer;-webkit-text-stroke:2px #0a2a58;paint-order:stroke fill}.shp-reset .ic{width:18px;height:18px}
.shp-offers{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.shp-off{position:relative;border-radius:6px;border:3px solid #1a1a2a;background:linear-gradient(#fff8e4,#f3e2b4);color:#3a2410;display:flex;flex-direction:column;align-items:center;gap:3px;padding:0 4px 6px;overflow:hidden;text-align:center}
.shp-off>small{align-self:stretch;margin:0 -4px;padding:2px 0;background:linear-gradient(#58b0f0,#1a68b8);color:#fff;font:800 12px var(--f-ui,sans-serif);-webkit-text-stroke:2px #0a2a58;paint-order:stroke fill;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.shp-off canvas{width:64px;height:64px;border-radius:6px;background:#0003}.shp-off .rk{position:absolute;left:3px;top:24px;width:24px;height:24px}
.shp-off .bar{align-self:stretch;position:relative;height:14px;border-radius:7px;background:#3a2a1a;overflow:hidden;border:2px solid #1a0f05}.shp-off .bar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(#6df,#28a)}.shp-off .bar u{position:relative;display:block;font:800 10px/10px var(--f-ui,sans-serif);color:#fff;text-decoration:none;-webkit-text-stroke:2px #1a0f05;paint-order:stroke fill}
.shp-off.sold{filter:grayscale(1) brightness(.7)}.shp-off.sold::after{content:'✔';position:absolute;inset:18px 0 0;display:flex;align-items:center;justify-content:center;font:900 44px var(--f-ui,sans-serif);color:#6cf040;-webkit-text-stroke:3px #1a4a0a}
.shp-buy{display:flex;align-items:center;justify-content:center;gap:5px;min-width:66px;padding:4px 10px;border-radius:5px;border:3px solid #1a0f05;background:linear-gradient(#5cf03a,#1fb81a);color:#fff;font:900 14px var(--f-ui,sans-serif);cursor:pointer;-webkit-text-stroke:2px #0a3a0a;paint-order:stroke fill}
.shp-buy.dis{filter:grayscale(1);opacity:.6}.shp-buy .ic{width:18px;height:18px}
.shp-sc{display:flex;gap:14px;justify-content:center;align-items:stretch}
.shp-pan{width:250px;border-radius:8px;border:3px solid #1a0f05;background:linear-gradient(#e8d2a0,#c8a468);color:#3a2410;display:flex;flex-direction:column;align-items:center;gap:6px;padding:0 10px 10px;box-shadow:0 0 0 3px #8a5a22}
.shp-pan>h3{align-self:stretch;margin:0 -10px;padding:5px 0;text-align:center;font:900 16px var(--f-ui,sans-serif);color:#fff;background:linear-gradient(#58b0f0,#1a68b8);-webkit-text-stroke:3px #0a2a58;paint-order:stroke fill;letter-spacing:1px}.shp-pan.ep>h3{background:linear-gradient(#b068f0,#6a2ab8);-webkit-text-stroke-color:#2a0a58}
.shp-pan img{width:86px;height:86px;object-fit:contain}.shp-pan small{font:700 12px var(--f-ui,sans-serif);text-align:center;min-height:30px}
.shp-it{width:210px;border-radius:8px;border:3px solid #1a0f05;background:linear-gradient(#e8d2a0,#c8a468);color:#3a2410;padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}.shp-it img{width:64px;height:64px;object-fit:contain}.shp-it b{font-size:15px}.shp-it small{font-size:11px;min-height:28px}
.shp-grid{display:flex;gap:10px;flex-wrap:wrap}.shp-note{font:600 12px var(--f-ui,sans-serif);opacity:.8;margin:0;text-align:center}
.shp-frg{display:flex;gap:8px;flex-wrap:wrap;width:100%}.shp-hero{width:112px;border-radius:6px;border:3px solid #1a1a2a;background:linear-gradient(#fff8e4,#f3e2b4);color:#3a2410;padding:4px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px;text-align:center}
.shp-hero canvas{width:52px;height:52px;border-radius:6px;background:#0003}.shp-hero .bar{width:100%;height:8px;border-radius:4px;background:#3a2a1a;overflow:hidden}.shp-hero .bar i{display:block;height:100%;background:linear-gradient(#6df,#28a)}
.shp-rk{width:100%;display:flex;gap:6px;flex-wrap:wrap}.shp-rk button{padding:4px 12px;border-radius:5px;border:3px solid #1a0f05;background:#6a4a2a;color:#fff;font:800 12px var(--f-ui,sans-serif);cursor:pointer}.shp-rk button.on{background:linear-gradient(#ffd24a,#d88a0a);color:#3a2410}
.shp-msg{position:absolute;left:0;right:0;bottom:14px;text-align:center;font-weight:800;pointer-events:none;text-shadow:0 2px 4px #000}
.shp-md{position:absolute;inset:0;background:#000b;display:flex;align-items:center;justify-content:center;z-index:5}
.shp-md>div{width:min(360px,90%);border-radius:8px;border:3px solid #1a0f05;background:linear-gradient(#fff4d6,#f4dfab);color:#3a2410;padding:16px;text-align:center;display:flex;flex-direction:column;gap:12px;box-shadow:0 0 0 3px #f3b61f}
.shp-md .r{display:flex;gap:10px;justify-content:center}.shp-md button{padding:8px 22px;border-radius:6px;border:3px solid #1a0f05;font:900 15px var(--f-ui,sans-serif);color:#fff;cursor:pointer}`;
const GEM = '<i class="ic gem"></i>';

const OFF_KEY = 'ninja-mugen-offers', RESET_COST = 250, today = () => new Date().toISOString().slice(0, 10);
let O = { day: '', n: 0, sold: [], free: false };
try { O = Object.assign(O, JSON.parse(localStorage.getItem(OFF_KEY) || '{}')); } catch (e) { /* ignore */ }
const saveO = () => { try { localStorage.setItem(OFF_KEY, JSON.stringify(O)); } catch (e) { /* ignore */ } };
// six offres du jour : fragments de héros pas encore débloqués (rangs E à AA), tirées au sort selon la date ; un seul fragment est gratuit
function offers() {
  if (O.day !== today()) { O = { day: today(), n: 0, sold: [], free: false }; saveO(); }
  let h = 0; for (const ch of O.day + ':' + O.n) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { h = (h + 0x6D2B79F5) >>> 0; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pool = ROSTER.filter((c) => !prog.unlocked(c.id) && prog.fragPrice(c.id)).map((c) => c.id), out = [];
  while (out.length < 6 && pool.length) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  return out;
}
const byId = (id) => ROSTER.find((c) => c.id === id);

export default function sShop(d = {}) {
  let tab = d.tab || 'offer', fr = 'E';
  const root = el('div', 'shp'), cur = pills(), top = el('div', 'shp-top'), body = el('div', 'shp-body'), tabs = el('div', 'shp-tabs'), main = el('div', 'shp-main');
  const st = document.createElement('style'); st.textContent = CSS; root.appendChild(st);
  top.append(backBtn(() => { sfx.back(); G.go('title'); }), el('h2', '', 'BOUTIQUE'), cur);
  body.append(tabs, main); root.append(top, body); G.screenEl.appendChild(root);
  const msg = (t) => { const m = el('div', 'shp-msg', t); root.appendChild(m); setTimeout(() => m.remove(), 1600); };
  function confirm(text, price, go) {
    const m = el('div', 'shp-md', `<div><b>${text}</b><span>Coût : ${price} ${GEM} (tu as ${prog.gems})</span><div class="r"><button style="background:#a83a3a" data-n>ANNULER</button><button style="background:#1e9a40" data-y>ACHETER</button></div></div>`);
    m.querySelector('[data-n]').onclick = () => { sfx.back(); m.remove(); };
    m.querySelector('[data-y]').onclick = () => { m.remove(); go(); };
    root.appendChild(m);
  }
  const panel = (cls, img, title, sub, price, onBuy) => {
    const it = el('div', 'shp-pan ' + cls, `<h3>${title}</h3><img src="${img}" alt=""><small>${sub}</small>`), b = el('button', 'shp-buy' + (prog.gems < price ? ' dis' : ''), `${GEM}<span>${price}</span>`);
    b.onclick = () => { if (prog.gems < price) { sfx.back(); return msg('Pas assez de germes'); } sfx.ok(); onBuy(); };
    it.appendChild(b); return it;
  };
  const item = (img, title, sub, price, onBuy) => {
    const it = el('div', 'shp-it', `<img src="${img}" alt=""><b>${title}</b><small>${sub}</small>`), b = el('button', 'shp-buy' + (prog.gems < price ? ' dis' : ''), `${GEM}<span>${price}</span>`);
    b.onclick = () => { if (prog.gems < price) { sfx.back(); return msg('Pas assez de germes'); } sfx.ok(); onBuy(); };
    it.appendChild(b); return it;
  };
  const open = (n, mode, title) => { prog.boxOpened(); G.go('chest', { cards: drawChest(n, 'normal'), mode, title, back: 'shop', backData: { tab: 'box' } }); };
  const rk = (id) => prog.rank(id).toLowerCase();
  function offerCard(id, i) {
    const c = byId(id), u = prog.unlocked(id), need = prog.need(id), have = u ? need : prog.frags(id), pr = i === 0 ? 0 : prog.fragPrice(id), sold = O.sold.includes(id) || (i === 0 && O.free);
    const h = el('div', 'shp-off' + (sold ? ' sold' : ''), `<small>${c.name}</small><img class="rk" src="assets/ui/rank_${rk(id)}.png" alt="">`), cv = el('canvas'); cv.width = cv.height = 64; drawPortrait(cv.getContext('2d'), c, 64);
    h.append(cv, el('div', 'bar', `<i style="width:${Math.round(have / need * 100)}%"></i><u>${have}/${need}</u>`));
    const b = el('button', 'shp-buy' + (!sold && prog.gems < pr ? ' dis' : ''), pr ? `${GEM}<span>${pr}</span>` : 'GRATUIT');
    b.onclick = () => {
      if (sold) return sfx.back();
      if (pr && prog.gems < pr) { sfx.back(); return msg('Pas assez de germes'); }
      const buy = () => { if (pr && !prog.spendGems(pr)) return; const r = prog.addFrag(id, 1); if (i === 0) O.free = true; else O.sold.push(id); saveO(); sfx.win(); msg(r && r.now ? `${c.name} débloqué !` : '+1 fragment'); draw(); };
      if (pr) confirm(`1 fragment de ${c.name} (${c.title || ''})`, pr, buy); else buy();
    };
    if (!sold) h.appendChild(b);
    return h;
  }
  let tmr = 0;
  function draw() {
    clearInterval(tmr); cur.refresh(); tabs.innerHTML = ''; main.innerHTML = '';
    [['offer', 'OFFRES', 'assets/ui/gift.png'], ['box', 'COFFRES', 'assets/ui/chest.png'], ['coin', 'PIÈCES', 'assets/ui/coin.png'], ['frag', 'FRAGMENTS', 'assets/ui/star.png']].forEach(([k, l, im]) => { const b = el('button', k === tab ? 'on' : '', `<span><img src="${im}" alt="">${l}</span>`); b.onclick = () => { tab = k; sfx.ui(); draw(); }; tabs.appendChild(b); });
    if (tab === 'offer') {
      const ids = offers(), rs = el('button', 'shp-reset', `ACTUALISER ${GEM}<span>${RESET_COST}</span>`);
      rs.onclick = () => { if (prog.gems < RESET_COST) { sfx.back(); return msg('Pas assez de germes'); } confirm('Actualiser les offres du jour ?', RESET_COST, () => { if (prog.spendGems(RESET_COST)) { O.n++; O.sold = []; saveO(); sfx.ok(); draw(); } }); };
      const left = () => { const n = new Date(), e = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), s = Math.max(0, Math.floor((e - n) / 1000)); return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
      const ban = el('div', 'shp-ban', `<b>OFFRES DU JOUR</b><span>Nouvelles offres dans <u>${left()}</u></span>`); ban.appendChild(rs);
      const g = el('div', 'shp-offers'); ids.forEach((id, i) => g.appendChild(offerCard(id, i)));
      main.append(ban, g, el('p', 'shp-note', ids.length ? 'Un fragment gratuit chaque jour. Les germes se gagnent en jouant.' : 'Tous les héros sont débloqués !'));
      tmr = setInterval(() => { if (!root.isConnected) return clearInterval(tmr); const u = ban.querySelector('u'); if (u) u.textContent = left(); }, 1000);
    } else if (tab === 'box') {
      const sc = el('div', 'shp-sc');
      sc.append(
        panel('', 'assets/ui/chest.png', 'COFFRE ×3', '3 cartes : tu en choisis 1.', BOX3, () => confirm('Acheter un coffre ×3 ?', BOX3, () => { if (prog.spendGems(BOX3)) open(3, 'pick', 'COFFRE ×3'); })),
        panel('ep', 'assets/ui/chest.png', 'COFFRE ×10', '10 cartes : tu les gardes toutes.', BOX10, () => confirm('Acheter un coffre ×10 ?', BOX10, () => { if (prog.spendGems(BOX10)) open(10, 'all', 'COFFRE ×10'); })));
      main.append(sc, el('p', 'shp-note', 'Les cartes S et SS ne sortent que des victoires en Tournoi. Les germes se gagnent en jouant.'));
    } else if (tab === 'coin') {
      const g = el('div', 'shp-grid'); main.appendChild(g);
      [10, 50, 100].forEach((n) => g.appendChild(item('assets/ui/coin.png', `${n * GEM_COINS} pièces`, `Convertit ${n} germes en pièces (1 germe = ${GEM_COINS} pièces).`, n, () => confirm(`Convertir ${n} germes en ${n * GEM_COINS} pièces ?`, n, () => { prog.convert(n); sfx.win(); msg(`+${n * GEM_COINS} pièces`); draw(); }))));
    } else {
      const r = el('div', 'shp-rk'); ['E', 'D', 'C', 'B', 'A', 'AA'].forEach((x) => { const b = el('button', x === fr ? 'on' : '', x); b.onclick = () => { fr = x; sfx.ui(); draw(); }; r.appendChild(b); });
      main.append(r, el('p', 'shp-note', 'Achète 1 fragment du personnage de ton choix. S et SS : uniquement par le Tournoi.'));
      const list = el('div', 'shp-frg'); main.appendChild(list);
      ROSTER.filter((c) => prog.rank(c.id) === fr).forEach((c) => {
        const u = prog.unlocked(c.id), need = prog.need(c.id), have = u ? need : prog.frags(c.id), pr = prog.fragPrice(c.id);
        const h = el('div', 'shp-hero'), cv = el('canvas'); cv.width = cv.height = 52; drawPortrait(cv.getContext('2d'), c, 52);
        h.append(cv, el('b', '', c.name), el('div', 'bar', `<i style="width:${Math.round(have / need * 100)}%"></i>`), el('span', '', u ? 'Débloqué' : `${have}/${need}`));
        if (!u) { const b = el('button', 'shp-buy' + (prog.gems < pr ? ' dis' : ''), `${GEM}<span>${pr}</span>`); b.onclick = () => { if (prog.gems < pr) { sfx.back(); return msg('Pas assez de germes'); } confirm(`1 fragment de ${c.name} (${c.title})`, pr, () => { const q = prog.buyFrag(c.id); if (q) { sfx.win(); msg(q.now ? `${c.name} débloqué !` : '+1 fragment'); } draw(); }); }; h.appendChild(b); }
        list.appendChild(h);
      });
    }
  }
  G.handler = (k) => { if (k === 'back') { sfx.back(); G.go('title'); } };
  draw();
}
