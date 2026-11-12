// Carte du mode Histoire : 3 difficultés, 10 nœuds reliés, fiche du combat avec les objectifs bonus.
import { G, el } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { drawPortrait } from '../render/sprites.js';
import { backBtn, pills, LOCK } from '../ui/kit.js';
import { story, NODES, DIFFS } from '../story.js';
import { sfx } from '../audio.js';

const STAR = (on) => `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2l3 7 7 .6-5.4 4.8 1.7 7.4L12 17.8 5.7 21.8l1.7-7.4L2 9.6 9 9z" fill="${on ? '#ffd24a' : '#2a1a08'}" stroke="#2a1a08" stroke-width="1.6"/></svg>`;
// positions des nœuds sur la carte (en % de la largeur / hauteur de la zone)
const POS = [[6, 70], [15, 38], [25, 72], [35, 40], [45, 70], [55, 38], [65, 72], [75, 40], [85, 70], [94, 36]];

export default function sStory(d0) {
  let diff = G.run && G.run.mode === 'story' ? G.run.sd : 0, sel = G.run && G.run.mode === 'story' ? G.run.si : 0;
  if (d0 && d0.go) { diff = d0.diff; sel = d0.i; }
  const root = el('div', 'st'), top = el('div', 'kit-top'), cur = pills(() => G.go('daily'));
  top.append(backBtn(() => { sfx.back(); G.go('modes'); }), el('h2', '', 'HISTOIRE'), cur);
  const tabs = el('div', 'st-tabs'), map = el('div', 'st-map'), card = el('div', 'st-card parch');
  root.append(top, tabs, map, card); G.screenEl.appendChild(root);
  const hero = Math.min(ROSTER.length - 1, G.S.hero || 0);

  function draw() {
    cur.refresh();
    tabs.innerHTML = '';
    DIFFS.forEach((df, d) => { const open = story.diffOpen(d), b = el('button', 'st-tab' + (d === diff ? ' on' : '') + (open ? '' : ' lock'), open ? `${df.n} <small>★ ${story.total(d)}/30</small>` : `<i>${LOCK}</i>${df.n}`); b.onclick = () => { if (!open) { sfx.back(); return; } diff = d; sel = 0; sfx.ui(); draw(); }; tabs.appendChild(b); });
    map.innerHTML = '<svg class="st-path" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="' + POS.map(([x, y]) => `${x},${y}`).join(' ') + '"/></svg>';
    NODES.forEach((n) => {
      const open = story.nodeOpen(diff, n.i), s = story.stars(diff, n.i), b = el('button', 'st-n' + (n.boss ? ' boss' : '') + (n.i === sel ? ' sel' : '') + (open ? '' : ' lock') + (s ? ' done' : ''));
      b.style.left = POS[n.i][0] + '%'; b.style.top = POS[n.i][1] + '%';
      b.innerHTML = open ? `<em>${n.boss ? '☠' : n.i + 1}</em><span>${[0, 1, 2].map((k) => STAR(k < s)).join('')}</span>` : `<em class="lk">${LOCK}</em>`;
      b.onclick = () => { sel = n.i; sfx.ui(); draw(); }; map.appendChild(b);
    });
    const n = NODES[sel], open = story.nodeOpen(diff, sel), s = story.stars(diff, sel), lv = story.diffLevel(diff, sel);
    card.innerHTML = `<canvas width="72" height="72"></canvas><div class="sc-i"><h3>${n.name}${n.boss ? ' <u>BOSS</u>' : ''}</h3><p>${ROSTER[n.opp].name.toUpperCase()} · niveau ${lv}/5</p>
      <ul><li class="${s ? 'ok' : ''}"><i>${STAR(s >= 1)}</i>Remporter le combat</li>${n.obj.map((o, k) => `<li class="${s > k + 1 ? 'ok' : ''}"><i>${STAR(s > k + 1)}</i>${o.t}</li>`).join('')}</ul></div>
      <div class="sc-r"><small>Récompense par étoile</small><b>${n.boss ? 80 : 40}<i class="ic gold"></i></b></div><button class="next">${open ? 'COMBATTRE' : 'VERROUILLÉ'}</button>`;
    drawPortrait(card.querySelector('canvas').getContext('2d'), ROSTER[n.opp], 72);
    const bt = card.querySelector('.next'); bt.classList.toggle('dis', !open); bt.onclick = fight;
  }
  function fight() {
    if (!story.nodeOpen(diff, sel)) return sfx.back();
    const n = NODES[sel], opp = n.opp === hero ? (n.opp + 1) % ROSTER.length : n.opp;
    G.mode = 'story'; sfx.ok();
    G.run = { mode: 'story', fmt: 1, vs: 'cpu', diff: story.diffLevel(diff, sel), curDiff: story.diffLevel(diff, sel), need: 2, timer: 0, p1: [hero], p2: [opp], sup1: null, sup2: null, wins: 0, fight: 0, carry: null, score: 0, stage: n.stage, title: `${DIFFS[diff].n} · ${n.name}`, sd: diff, si: sel, big: n.boss };
    G.go('vs');
  }
  G.handler = (k) => {
    if (k === 'left') sel = Math.max(0, sel - 1); else if (k === 'right') sel = Math.min(NODES.length - 1, sel + 1);
    else if (k === 'up' || k === 'down') { const d = Math.max(0, Math.min(2, diff + (k === 'down' ? 1 : -1))); if (d === diff || !story.diffOpen(d)) return; diff = d; sel = 0; }
    else if (k === 'ok') return fight(); else if (k === 'back') { sfx.back(); return G.go('modes'); } else return;
    sfx.ui(); draw();
  };
  draw();
}
