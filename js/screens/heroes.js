// Fiches de héros : rang D/A/S, niveau 1-50, ATK / PV / critique, paliers de compétence (10/20/30/40/50). Tout est sauvegardé sur l'appareil.
import { G, el } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { drawPortrait } from '../render/sprites.js';
import { pageHead } from '../ui/shell.js';
import { prog, MAXLV, TIERS } from '../progress.js';
import { sfx } from '../audio.js';

const TIER_TXT = ['Ninjutsu +', 'Technique +', 'Ultime +', 'Éveil +', 'Maîtrise +'];

export default function sHeroes() {
  const veil = document.getElementById('veil'); if (veil) veil.className = 'on heavy';   // pas de barre d'onglets ici : on pose le voile nous-mêmes
  const wrap = el('div', 'heroes'), coin = el('div', 'cur-chip');
  wrap.appendChild(pageHead({ title: 'HÉROS', onBack: () => G.go('title'), right: coin }));
  const body = el('div', 'hr-body'), grid = el('div', 'hr-grid'), fiche = el('aside', 'plate cy hr-fiche');
  body.append(grid, fiche); wrap.appendChild(body); G.screenEl.appendChild(wrap);
  let sel = Math.min(ROSTER.length - 1, G.S.hero || 0);
  const cells = ROSTER.map((ch, i) => {
    const c = el('div', 'hr-c'), cv = el('canvas'); cv.width = cv.height = 56; drawPortrait(cv.getContext('2d'), ch, 56);
    const lv = el('i'); c.append(cv, lv); c.onclick = () => { sel = i; sfx.ui(); draw(); }; grid.appendChild(c); return { c, lv };
  });
  function draw() {
    coin.innerHTML = `<b>●</b> ${prog.coins} <b class="g">◆</b> ${prog.gems}`;
    cells.forEach((x, i) => { const id = i; x.c.classList.toggle('sel', i === sel); x.lv.textContent = `${prog.rank(id)} ${prog.level(id)}`; x.c.dataset.rank = prog.rank(id); });
    const ch = ROSTER[sel], l = prog.level(sel), st = prog.stats(sel), max = l >= MAXLV, cost = prog.cost(sel), can = !max && prog.coins >= cost;
    fiche.innerHTML = `<div class="hf-top"><canvas width="96" height="96"></canvas><div><h3>${ch.name.toUpperCase()}</h3><small>${ch.title || ''}</small><div class="rank r${prog.rank(sel)}">RANG ${prog.rank(sel)}</div></div></div>
      <div class="hf-lv">NIVEAU <b>${l}</b> / ${MAXLV}</div>
      <div class="hf-st"><span>ATK <b>${Math.round(st.atk * 100)}%</b></span><span>PV <b>${Math.round(st.hp * 100)}%</b></span><span>CRIT <b>${Math.round(st.crit * 100)}%</b></span></div>
      <div class="hf-tiers">${TIERS.map((t, i) => `<div class="${l >= t ? 'on' : ''}"><b>${t}</b><i>${TIER_TXT[i]}4%</i></div>`).join('')}</div>
      <button class="btn up ${can ? '' : 'dis'}">${max ? 'NIVEAU MAX' : `AMÉLIORER · ${cost} ●`}</button>
      <div class="hf-note">Les niveaux comptent contre l'ordinateur (pas en 2 joueurs ni en ligne).</div>`;
    drawPortrait(fiche.querySelector('canvas').getContext('2d'), ch, 96);
    fiche.querySelector('.up').onclick = up;
  }
  function up() { if (prog.upgrade(sel)) { sfx.ok(); draw(); } else sfx.back(); }
  const cols = () => Math.max(1, Math.floor(grid.clientWidth / 64));
  G.handler = (k) => {
    const n = ROSTER.length, c = cols();
    if (k === 'back') { sfx.back(); return G.go('title'); }
    if (k === 'ok') return up();
    if (k === 'left') sel = (sel + n - 1) % n; else if (k === 'right') sel = (sel + 1) % n;
    else if (k === 'up') sel = (sel - c + n) % n; else if (k === 'down') sel = (sel + c) % n; else return;
    sfx.ui(); draw(); cells[sel].c.scrollIntoView({ block: 'nearest' });
  };
  draw();
}
