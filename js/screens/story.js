// Carte du mode Histoire : 2 difficultés, 10 nœuds reliés, fiche du combat avec les objectifs bonus.
import { G, el } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { drawPortrait } from '../render/sprites.js';
import { backBtn, pills, LOCK } from '../ui/kit.js';
import { story, NODES, DIFFS } from '../story.js';
import { prog } from '../progress.js';
import { sfx } from '../audio.js';

// bonus avant combat (au choix, payé en pièces) : aucun → +50 % dégâts → +50 % PV → jauge pleine
const PRE = [null, { k: 'dmg', t: '+50 % dégâts' }, { k: 'hp', t: '+50 % PV' }, { k: 'chi', t: 'Jauge pleine' }], PRE_COST = 150;
const STAR = (on) => `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2l3 7 7 .6-5.4 4.8 1.7 7.4L12 17.8 5.7 21.8l1.7-7.4L2 9.6 9 9z" fill="${on ? '#ffd24a' : '#2a1a08'}" stroke="#2a1a08" stroke-width="1.6"/></svg>`;
// paliers d'étoiles (récompenses gratuites)
const CSS = `.st-ms{position:absolute;right:14px;top:58px;display:flex;align-items:center;gap:5px}.st-ms small{font:800 14px var(--f-ui);color:#ffd24a;-webkit-text-stroke:2px #1a0f05;paint-order:stroke fill;margin-right:4px}
.st-m{position:relative;width:62px;padding:2px 0 3px;border-radius:5px;border:3px solid #1a0f05;background:linear-gradient(#6a4a2a,#3a2210);color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;font:800 11px var(--f-ui)}
.st-m b{font-size:12px;color:#ffd24a}.st-m span{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;gap:3px;font-size:10px;line-height:13px;white-space:nowrap}.st-m span i{display:inline-block;vertical-align:middle;margin-left:2px}.st-m .ic{width:11px;height:11px;margin-left:-1px}
.st-m.now{background:linear-gradient(#ffd24a,#d88a0a);color:#3a2410;animation:stp 1s ease-in-out infinite}.st-m.now b{color:#3a2410}
.st-m.got{filter:grayscale(.8);opacity:.6}.st-m u{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:900 24px var(--f-ui);color:#6cf040;-webkit-text-stroke:2px #1a4a0a;text-decoration:none}
.st-hw{position:absolute;left:3%;right:3%;top:112px;height:196px;pointer-events:none;overflow:visible}
.st-hero{position:absolute;width:46px;height:46px;margin:-78px 0 0 -23px;transition:left .45s cubic-bezier(.3,1.4,.5,1),top .45s cubic-bezier(.3,1.4,.5,1);z-index:3;filter:drop-shadow(0 3px 2px #000a);animation:sthop 1s ease-in-out infinite}
@keyframes sthop{50%{transform:translateY(-5px)}}
.st-n.sel::before{content:'';position:absolute;inset:-9px;border-radius:50%;border:3px solid #ffd24a;animation:string 1.2s ease-out infinite;pointer-events:none}
@keyframes string{0%{transform:scale(.85);opacity:1}100%{transform:scale(1.35);opacity:0}}
.st-ff{position:absolute;width:5px;height:5px;border-radius:50%;background:#ffe9a0;box-shadow:0 0 8px 3px #ffd24a99;opacity:0;animation:stff 6s ease-in-out infinite}
@keyframes stff{0%,100%{opacity:0;transform:translate(0,0)}30%,70%{opacity:.9}50%{transform:translate(14px,-22px)}}`;
// positions des nœuds sur la carte (en % de la largeur / hauteur de la zone)
const POS = [[10, 68], [30, 34], [50, 70], [70, 36], [90, 62]];     // 5 nœuds par chapitre (le dernier chapitre de chaque difficulté finit par un boss)
// 4 chapitres : 2 par difficulté, un décor (ciel) chacun
const CH = [{ d: 0, k: 0, name: 'RUELLE DES CONTENEURS', img: 'city1' }, { d: 0, k: 1, name: 'BOULEVARD NÉON', img: 'city3' }, { d: 1, k: 0, name: 'RUE DE LA TAVERNE', img: 'city2' }, { d: 1, k: 1, name: 'CRÉPUSCULE ÉTOILÉ', img: 'ocean5' }];
const chOpen = (c) => story.nodeOpen(CH[c].d, CH[c].k * 5);
const chStars = (c) => { let t = 0; for (let i = 0; i < 5; i++) t += story.stars(CH[c].d, CH[c].k * 5 + i); return t; };
const CSS2 = `.st-tab.ch{height:40px;padding:0 8px;font-size:13px;line-height:14px;text-align:left;position:relative}.st-tab.ch small{display:block;margin:0;font-size:11px}
.st-tab.ch.on::after{content:'';position:absolute;inset:-6px;border-radius:8px;border:3px solid #ffd24a;animation:string 1.4s ease-out infinite;pointer-events:none}
.st-tabs{gap:6px}.st-map{border-radius:10px;border:3px solid #1a0f05;box-shadow:0 0 0 2px #8a5a22 inset;background-size:cover!important}.st-map.lockc{filter:grayscale(.9) brightness(.7)}
.st-cap{position:absolute;left:12px;top:8px;font:900 16px var(--f-ui);color:#fff;-webkit-text-stroke:3px #1a0f05;paint-order:stroke fill;letter-spacing:1px;pointer-events:none}
.st-chest{position:absolute;right:10px;top:8px;display:flex;align-items:center;gap:5px;padding:4px 9px;border-radius:7px;border:3px solid #1a0f05;background:linear-gradient(#6a4a2a,#3a2210);color:#fff;font:800 12px var(--f-ui);cursor:pointer;z-index:4}.st-chest.now{background:linear-gradient(#ffd24a,#d88a0a);color:#3a2410;animation:stp 1s ease-in-out infinite}.st-chest.got{filter:grayscale(.8);opacity:.6}.st-chest svg{width:22px;height:22px}
.st-pre{margin-top:4px;padding:3px 8px;border-radius:6px;border:2px solid #5a3a18;background:#0003;color:#3a2410;font:800 11px var(--f-ui);cursor:pointer}.st-pre.on{background:#ffd24a}
.st-warn{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:8px 18px;border-radius:8px;background:#000d;color:#fff;font:800 15px var(--f-ui);z-index:6;pointer-events:none}`;

export default function sStory(d0) {
  let diff = G.run && G.run.mode === 'story' ? G.run.sd : 0, sel = G.run && G.run.mode === 'story' ? G.run.si : 0;
  if (d0 && d0.go) { diff = d0.diff; sel = d0.i; }
  const root = el('div', 'st'), top = el('div', 'kit-top'), cur = pills(() => G.go('daily'));
  top.append(backBtn(() => { sfx.back(); G.go('modes'); }), el('h2', '', 'HISTOIRE'), cur);
  const tabs = el('div', 'st-tabs'), ms = el('div', 'st-ms'), map = el('div', 'st-map'), card = el('div', 'st-card parch');
  root.append(top, tabs, ms, map, card); const stl = document.createElement('style'); stl.textContent = CSS + CSS2; root.appendChild(stl); const hw = el('div', 'st-hw'), hcv = el('canvas', 'st-hero'); hcv.width = hcv.height = 46; hw.appendChild(hcv); root.appendChild(hw);
  for (let k = 0; k < 14; k++) { const f = el('i', 'st-ff'); f.style.cssText = `left:${(k * 37 + 5) % 100}%;top:${(k * 53 + 10) % 90}%;animation-delay:${(k * 0.7) % 6}s`; hw.appendChild(f); }
  G.screenEl.appendChild(root);
  let pre = 0;
  const hero = Math.min(ROSTER.length - 1, G.S.hero || 0);

  function draw() {
    cur.refresh();
    tabs.innerHTML = '';
    const cc = diff * 2 + (sel >= 5 ? 1 : 0), base = (cc % 2) * 5;
    CH.forEach((c, i) => { const open = chOpen(i), b = el('button', 'st-tab ch' + (i === cc ? ' on' : '') + (open ? '' : ' lock'), open ? `CH.${i + 1} ${DIFFS[c.d].n.slice(0, 4)}.<small>★ ${chStars(i)}/15</small>` : `<i>${LOCK}</i>CH.${i + 1}<small>${DIFFS[c.d].n.slice(0, 4)}.</small>`);
      b.onclick = () => { if (!open) { sfx.back(); const w = el('div', 'st-warn', 'Termine le chapitre précédent'); root.appendChild(w); setTimeout(() => w.remove(), 1600); return; } diff = c.d; sel = c.k * 5; for (let k = 0; k < 5; k++) if (story.nodeOpen(diff, c.k * 5 + k) && !story.cleared(diff, c.k * 5 + k)) { sel = c.k * 5 + k; break; } sfx.ui(); draw(); }; tabs.appendChild(b); });
    ms.innerHTML = `<small>★ ${story.sum()}/60</small>`;
    story.miles().forEach((m) => {
      const b = el('button', 'st-m' + (m.got ? ' got' : m.ok ? ' now' : ''), `<b>${m.at}★</b><span>${m.c ? `${m.c}<i class="ic gold"></i>` : ''}${m.g ? `${m.g}<i class="ic gem"></i>` : ''}</span>${m.got ? '<u>✔</u>' : ''}`);
      b.onclick = () => { if (m.ok && !m.got) { const r = story.claimMile(m.i); if (r) { prog.add(r.c || 0, r.g || 0); sfx.win(); draw(); } } else sfx.back(); };
      ms.appendChild(b);
    });
    map.style.background = `linear-gradient(#0006,#000a),url(assets/stages/${CH[cc].img}_sky.png) center/cover`; map.classList.toggle('lockc', !chOpen(cc));
    map.innerHTML = `<div class="st-cap">${CH[cc].name}</div>` + '<svg class="st-path" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="' + POS.map(([x, y]) => `${x},${y}`).join(' ') + '"/></svg>';
    // coffre du chapitre : se débloque quand les 5 niveaux sont terminés, une seule récupération
    const ck = story.chest(cc), cb = el('button', 'st-chest' + (ck.got ? ' got' : ck.ok ? ' now' : ''), `<svg viewBox="0 0 24 24"><rect x="2" y="9" width="20" height="12" rx="2" fill="#8a5a22" stroke="#1a0f05" stroke-width="1.8"/><path d="M2 9a10 6 0 0 1 20 0z" fill="#b07a32" stroke="#1a0f05" stroke-width="1.8"/><rect x="10" y="11" width="4" height="5" fill="#ffd24a" stroke="#1a0f05"/></svg>${ck.got ? '✔' : `${ck.c}<i class="ic gold"></i>${ck.g}<i class="ic gem"></i>`}`);
    cb.onclick = () => { const r = ck.ok && !ck.got && story.claimChest(cc); if (r) { prog.add(r.c, r.g); sfx.win(); draw(); } else { sfx.back(); const w = el('div', 'st-warn', ck.got ? 'Coffre déjà récupéré' : 'Termine les 5 niveaux du chapitre'); root.appendChild(w); setTimeout(() => w.remove(), 1600); } };
    map.appendChild(cb);
    NODES.slice(base, base + 5).forEach((n) => {
      const open = story.nodeOpen(diff, n.i), s = story.stars(diff, n.i), b = el('button', 'st-n' + (n.boss ? ' boss' : '') + (n.i === sel ? ' sel' : '') + (open ? '' : ' lock') + (s ? ' done' : ''));
      b.style.left = POS[n.i - base][0] + '%'; b.style.top = POS[n.i - base][1] + '%';
      b.innerHTML = open ? `<em>${n.boss ? '☠' : n.i + 1}</em><span>${[0, 1, 2].map((k) => STAR(k < s)).join('')}</span>` : `<em class="lk">${LOCK}</em>`;
      b.onclick = () => { sel = n.i; sfx.ui(); draw(); }; map.appendChild(b);
    });
    const n = NODES[sel], open = story.nodeOpen(diff, sel), s = story.stars(diff, sel), lv = story.diffLevel(diff, sel);
    card.innerHTML = `<canvas width="72" height="72"></canvas><div class="sc-i"><h3>${n.name}${n.boss ? ' <u>BOSS</u>' : ''}</h3><p>${ROSTER[n.opp].name.toUpperCase()} · niveau ${lv}/5</p>
      <ul><li class="${s ? 'ok' : ''}"><i>${STAR(s >= 1)}</i>Remporter le combat</li>${n.obj.map((o, k) => `<li class="${s > k + 1 ? 'ok' : ''}"><i>${STAR(s > k + 1)}</i>${o.t}</li>`).join('')}</ul></div>
      <div class="sc-r"><small>Récompense par étoile</small><b>${n.boss ? 80 : 40}<i class="ic gold"></i></b><button class="pre${pre ? ' on' : ''} st-pre">${pre ? PRE[pre].t + ` (−${PRE_COST}` : 'Bonus : aucun (150'}<i class="ic gold"></i>)</button></div><button class="next">${open ? 'COMBATTRE' : 'VERROUILLÉ'}</button>`;
    card.querySelector('.st-pre').onclick = () => { pre = (pre + 1) % PRE.length; sfx.ui(); draw(); };
    drawPortrait(card.querySelector('canvas').getContext('2d'), ROSTER[n.opp], 72);
    if (!hcv.dataset.d) { hcv.dataset.d = 1; drawPortrait(hcv.getContext('2d'), ROSTER[hero], 46); }
    hcv.style.left = POS[sel - base][0] + '%'; hcv.style.top = POS[sel - base][1] + '%';
    const bt = card.querySelector('.next'); bt.classList.toggle('dis', !open); bt.onclick = fight;
  }
  function fight() {
    if (!story.nodeOpen(diff, sel)) return sfx.back();
    if (pre && prog.coins < PRE_COST) { pre = 0; sfx.back(); const w = el('div', 'st-warn', 'Pas assez de pièces pour le bonus'); root.appendChild(w); setTimeout(() => w.remove(), 1600); return draw(); }
    if (pre) prog.add(-PRE_COST, 0);
    const n = NODES[sel], opp = n.opp === hero ? (n.opp + 1) % ROSTER.length : n.opp;
    G.mode = 'story'; sfx.ok();
    G.run = { mode: 'story', fmt: 1, vs: 'cpu', diff: story.diffLevel(diff, sel), curDiff: story.diffLevel(diff, sel), need: 2, timer: 0, p1: [hero], p2: [opp], sup1: null, sup2: null, wins: 0, fight: 0, carry: null, score: 0, stage: n.stage, title: `${DIFFS[diff].n} · ${n.name}`, sd: diff, si: sel, big: n.boss, pre: pre ? PRE[pre].k : null };
    G.go('vs');
  }
  G.handler = (k) => {
    if (k === 'left') sel = Math.max(0, sel - 1); else if (k === 'right') sel = Math.min(NODES.length - 1, sel + 1);
    else if (k === 'up' || k === 'down') { const d = Math.max(0, Math.min(DIFFS.length - 1, diff + (k === 'down' ? 1 : -1))); if (d === diff || !story.diffOpen(d)) return; diff = d; sel = 0; }
    else if (k === 'ok') return fight(); else if (k === 'back') { sfx.back(); return G.go('modes'); } else return;
    sfx.ui(); draw();
  };
  draw();
}
