// Héros : le héros choisi en grand, bande de cartes en bas (rang D/A/S), parchemin à droite (niveau, stats, paliers, amélioration).
import { G, el, save } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { drawFighter, drawPortrait, poseFor } from '../render/sprites.js';
import { backBtn, pills, LOCK } from '../ui/kit.js';
import { prog, MAXLV, TIERS } from '../progress.js';
import { sfx } from '../audio.js';

const TIER_TXT = ['Ninjutsu', 'Technique', 'Ultime', 'Éveil', 'Maîtrise'];

export default function sHeroes() {
  const root = el('div', 'hr'), top = el('div', 'kit-top'), cur = pills();
  top.append(backBtn(() => { sfx.back(); G.go('title'); }), el('h2', '', 'HÉROS'), cur); root.appendChild(top);
  const stage = el('div', 'hr-stage', '<canvas width="256" height="256"></canvas><div class="hr-plate"></div>'), panel = el('aside', 'parch hr-panel'), strip = el('div', 'hr-strip'); strip.style.cssText = 'height:124px;padding-top:22px';   // place pour les badges de rang (sinon coupés)
  root.append(stage, panel, strip); G.screenEl.appendChild(root);
  let sel = Math.min(ROSTER.length - 1, G.S.hero || 0);
  const cards = ROSTER.map((ch, i) => {
    const c = el('div', 'hc'), cv = el('canvas'); cv.width = cv.height = 64; drawPortrait(cv.getContext('2d'), ch, 64);
    const bd = el('i', 'bd'), lv = el('em'), one = el('u', 'one', '1');
    c.append(cv, bd, lv, one); c.onclick = () => { sel = i; sfx.ui(); draw(); }; strip.appendChild(c); return { c, bd, lv, one };
  });
  const g = stage.querySelector('canvas').getContext('2d');
  let cur_ch = ROSTER[sel];
  G.ticker = () => { const t = performance.now() / 16, { pose } = poseFor({ state: 'idle', t: 0, vx: 0, vy: 0, move: null }, t); g.setTransform(2, 0, 0, 2, 0, 0); drawFighter(g, cur_ch, pose, { clock: t }); };

  function draw() {
    cur.refresh(); cur_ch = ROSTER[sel];
    const chosen = (G.S.hero || 0) === sel;
    cards.forEach((x, i) => { x.c.classList.toggle('sel', i === sel); x.c.dataset.rank = prog.rank(i); x.bd.textContent = prog.rank(i); x.lv.textContent = `Nv ${prog.level(i)}`; x.one.style.display = (G.S.hero || 0) === i ? 'flex' : 'none'; });
    const ch = ROSTER[sel], l = prog.level(sel), st = prog.stats(sel), nx = prog.stats(sel, Math.min(MAXLV, l + 1)), max = l >= MAXLV, cost = prog.cost(sel), can = !max && prog.coins >= cost;
    stage.querySelector('.hr-plate').innerHTML = `<i class="rkb r${prog.rank(sel)}">${prog.rank(sel)}</i><b>${ch.name.toUpperCase()}</b><small>${ch.title || ''}</small>`;
    const d = (a, b, f) => (max ? '' : `<u>+${f(b - a)}</u>`);
    panel.innerHTML = `<div class="pn-lv"><i class="drop"></i><b>Niveau ${l}/${MAXLV}</b></div>
      <div class="pn-st">
        <div><i class="ico atk"></i><span>ATK</span><b>${Math.round(st.atk * 100)}%${d(st.atk, nx.atk, (v) => Math.max(1, Math.round(v * 100)) + '%')}</b></div>
        <div><i class="ico hp"></i><span>PV</span><b>${Math.round(st.hp * 100)}%${d(st.hp, nx.hp, (v) => Math.round(v * 100) + '%')}</b></div>
        <div><i class="ico cd"></i><span>DÉGÂTS CRIT</span><b>160%</b></div>
        <div><i class="ico cr"></i><span>TAUX CRIT</span><b>${(st.crit * 100).toFixed(1)}%${d(st.crit, nx.crit, (v) => (v * 100).toFixed(1) + '%')}</b></div>
      </div>
      <div class="pn-t"><b>PALIERS</b><small>chacun : +4 % d'ATK</small></div>
      <div class="pn-un">${TIERS.map((t, i) => `<div class="${l >= t ? 'on' : ''}" title="${TIER_TXT[i]}"><span>Lv${t}</span><em>${l >= t ? '✔' : LOCK}</em></div>`).join('')}</div>
      <div class="pn-bt"><button class="b-sel${chosen ? ' on' : ''}">${chosen ? 'Sélectionné' : 'CHOISIR'}</button><button class="b-up${can ? '' : ' dis'}">${max ? 'NIVEAU MAX' : `<b>${cost}</b><i class="ic gold"></i>`}</button></div>`;
    panel.querySelector('.b-sel').onclick = choose; panel.querySelector('.b-up').onclick = up;
  }
  function choose() { if ((G.S.hero || 0) !== sel) { G.S.hero = sel; save(); sfx.ok(); draw(); } }
  function up() { if (prog.upgrade(sel)) { sfx.win(); draw(); } else sfx.back(); }
  G.handler = (k) => {
    const n = ROSTER.length;
    if (k === 'back') { sfx.back(); return G.go('title'); }
    if (k === 'ok') return (G.S.hero || 0) !== sel ? choose() : up();
    if (k === 'left') sel = (sel + n - 1) % n; else if (k === 'right') sel = (sel + 1) % n; else return;
    sfx.ui(); draw(); cards[sel].c.scrollIntoView({ block: 'nearest', inline: 'center' });
  };
  draw(); setTimeout(() => cards[sel].c.scrollIntoView({ block: 'nearest', inline: 'center' }), 30);
}
