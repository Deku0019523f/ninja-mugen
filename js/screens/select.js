// Sélection des combattants façon « Storm » : grille J1 à gauche, grille J2 à droite, grands portraits au centre,
// soutiens en haut, 3 techniques en bas. L1 / R1 (Q / E, PageHaut / PageBas) changent de page.
import { G, el } from './ctx.js';
import { ROSTER, ARCH } from '../data/roster.js';
import { drawFighter, drawPortrait, poseFor } from '../render/sprites.js';
import { MODES } from '../modes/index.js';
import { sfx } from '../audio.js';

const COLS = 3, ROWS = 6, PER = COLS * ROWS;

export default function sSelect() {
  const S = G.S, mode = G.mode, m = MODES[mode];
  const fmt = m.solo ? 1 : S.fmt, humanP2 = mode === 'single' && S.vs === 'p2';
  const useSup = S.sup !== false && fmt === 1;       // soutiens R1 / L1 : 2 par joueur, en 1 contre 1
  const slots = [];
  const addSide = (who, t) => { for (let i = 0; i < fmt; i++) slots.push({ who, t, kind: 'main' }); if (useSup) for (let i = 1; i <= 2; i++) slots.push({ who, t, kind: 'sup', n: i }); };
  addSide('JOUEUR 1', 0);
  if (humanP2) addSide('JOUEUR 2', 1);
  else if (mode === 'single' || mode === 'training') for (let i = 0; i < fmt; i++) slots.push({ who: 'ADVERSAIRE', t: 1, kind: 'main' });
  const hasP2 = slots.some((s) => s.t === 1);
  const picks = [], N = ROSTER.length, TOTAL = N + 1, PAGES = Math.ceil(TOTAL / PER);   // + case « aléatoire »
  const curs = [0, Math.min(N - 1, 9)];

  // ---------- squelette
  const cell = 50, wrap = el('div', 'select');
  const cl = 3 * cell + 46, wc = Math.max(240, G.view.vw - 2 * cl);
  wrap.classList.toggle('compact', wc < 420); wrap.style.setProperty('--cell', cell + 'px'); wrap.style.setProperty('--cl', cl + 'px');
  wrap.style.setProperty('--art', Math.round(Math.max(130, Math.min(250, wc * 0.5))) + 'px'); wrap.style.setProperty('--nm', Math.round(Math.max(16, Math.min(30, wc / 15))) + 'px');
  const portraits = [];
  const portrait = (i) => { if (!portraits[i]) { const c = el('canvas'); c.width = c.height = 48; drawPortrait(c.getContext('2d'), ROSTER[i], 48); portraits[i] = c; } return portraits[i]; };

  const S_ = [0, 1].map((t) => {
    const o = { t };
    if (t === 1 && !hasP2) return o;
    o.box = el('div', 'ss s' + t);
    o.grid = el('div', 'sgrid'); o.box.appendChild(o.grid);
    o.cells = []; let tapNew = false;
    for (let j = 0; j < PER; j++) {
      const d = el('div', 'cell'), cv = el('canvas'); cv.width = cv.height = 48; d.appendChild(cv); d.cv = cv;
      d.onmouseenter = () => { if (activeT() === t && o.cells[j].idx < TOTAL) { curs[t] = o.cells[j].idx; draw(); } };
      d.onpointerdown = (e) => { tapNew = e.pointerType === 'touch' && curs[t] !== d.idx; };    // tactile : 1er appui = aperçu, 2e = valider
      d.onclick = () => { if (activeT() !== t || d.idx >= TOTAL) return; if (tapNew) { tapNew = false; curs[t] = d.idx; return draw(); } curs[t] = d.idx; act('ok'); };
      o.cells.push(d); o.grid.appendChild(d);
    }
    o.pgr = el('div', 'pgr'); o.pgr.innerHTML = '<b class="l">L1</b><span class="dots">' + '<span></span>'.repeat(PAGES) + '</span><b class="r">R1</b>';
    o.pgr.querySelector('.l').onclick = () => activeT() === t && act('pgl'); o.pgr.querySelector('.r').onclick = () => activeT() === t && act('pgr');
    o.box.appendChild(o.pgr); o.lastPage = -1;
    return o;
  });

  const sc = el('div', 'sc');
  const tops = el('div', 'tops'), prompt = el('div', 'prompt'), arts = [], plates = [], sks = [];
  const topSlots = [0, 1].map((t) => {
    const g = el('div', 'tg t' + t), lab = el('div', 'tl'), row = el('div', 'tr'); g.append(lab, row);
    const sl = slots.filter((s) => s.t === t && (useSup ? s.kind === 'sup' : fmt > 1));
    lab.textContent = !sl.length ? '' : useSup ? 'SOUTIENS' : 'ÉQUIPE';
    const els = sl.map((s) => { const e = el('div', 'slot'); e.innerHTML = '<canvas width="48" height="48"></canvas><i></i>'; if (useSup) e.querySelector('i').textContent = s.n === 1 ? 'R1' : 'L1'; row.appendChild(e); return e; });
    return { g, sl, els };
  });
  tops.append(topSlots[0].g, topSlots[1].g);
  sc.append(tops, prompt);
  for (const t of [0, 1]) {
    const art = el('div', 'art a' + t), cv = el('canvas'); cv.width = cv.height = 128; art.appendChild(cv); art.cv = cv; art.q = el('div', 'q', '?'); art.appendChild(art.q); arts.push(art);
    const np = el('div', 'np n' + t); np.innerHTML = '<span class="pl"></span><div class="nm"></div><div class="ti"></div><div class="mst"></div>'; plates.push(np);
    const sk = el('div', 'sks k' + t); sks.push(sk);
    sc.append(art, np, sk);
  }
  if (!hasP2) {   // modes en série / entraînement : l'adversaire n'est pas choisi ici
    const card = el('div', 'rcard'); card.innerHTML = `<h3>${m.label}</h3><p>${m.desc}</p><p class="rq">Adversaires : l'ordinateur</p>`; sc.appendChild(card);
    arts[1].style.display = plates[1].style.display = sks[1].style.display = 'none';
  }
  const foot = el('div', 'sfoot');
  const bOk = el('button', 'sbtn ok', 'VALIDER ▶'), bRnd = el('button', 'sbtn', '? ALÉATOIRE'), kh = el('span', 'kh', '◀ ▶ ▲ ▼ choisir · Q / E page · Entrée valider · Échap retour');
  bOk.onclick = () => act('ok'); bRnd.onclick = () => { if (activeT() !== null) { curs[activeT()] = N; act('ok'); } };
  foot.append(bRnd, bOk, kh);
  wrap.append(sc); for (const o of S_) if (o.box) wrap.appendChild(o.box); wrap.appendChild(foot); G.screenEl.appendChild(wrap);

  // ---------- état
  const slotNow = () => slots[picks.length];
  const activeT = () => { const s = slotNow(); return s ? s.t : null; };
  const mainsOf = (t) => picks.filter((_, k) => slots[k].t === t && slots[k].kind === 'main');
  const shown = (t) => ({ i: curs[t], rnd: curs[t] >= N });
  const label = (t) => { const s = slots.find((x) => x.t === t); return !s ? 'CPU' : s.who === 'JOUEUR 1' ? 'P1' : s.who === 'JOUEUR 2' ? 'P2' : 'CPU'; };
  const bar = (l, v) => `<span>${l}<i><u style="width:${Math.min(100, v * 70)}%"></u></i></span>`;

  const draw = () => {
    const at = activeT(), s = slotNow();
    for (const o of S_) {
      if (!o.box) continue; const t = o.t, pg = Math.floor(curs[t] / PER);
      o.box.classList.toggle('on', at === t); o.box.classList.toggle('off', at !== t);
      if (o.lastPage !== pg) {
        o.lastPage = pg;
        o.cells.forEach((d, j) => { const idx = pg * PER + j; d.idx = idx; const g = d.cv.getContext('2d'); g.clearRect(0, 0, 48, 48); d.classList.toggle('void', idx >= TOTAL); d.classList.toggle('rnd', idx === N); if (idx < N) g.drawImage(portrait(idx), 0, 0); else if (idx === N) { g.fillStyle = '#889'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.fillText('?', 24, 35); } });
        o.pgr.querySelectorAll('.dots span').forEach((d, k) => d.classList.toggle('on', k === pg));
      }
      o.cells.forEach((d) => { d.classList.toggle('sel', d.idx === curs[t]); d.classList.toggle('picked', d.idx < N && picks.indexOf(d.idx) >= 0); });
    }
    prompt.innerHTML = !s ? '' : s.kind === 'sup'
      ? `<b>${s.who}</b> — choisissez le <b>soutien ${s.n}/2</b> (${s.n === 1 ? 'R1' : 'L1'})`
      : `<b>${s.who}</b> — choisissez ${fmt > 1 ? 'combattant ' + (mainsOf(s.t).length + 1) + '/' + fmt : s.who === 'ADVERSAIRE' ? 'son adversaire' : 'votre combattant'}`;
    // soutiens / équipe
    topSlots.forEach((ts, t) => ts.sl.forEach((sl, k) => {
      const e = ts.els[k], idx = (() => { let n = -1; for (let q = 0; q < picks.length; q++) if (slots[q] === sl) n = picks[q]; return n; })();
      const g = e.querySelector('canvas').getContext('2d'); g.clearRect(0, 0, 48, 48); if (idx >= 0) g.drawImage(portrait(idx), 0, 0);
      e.classList.toggle('cur', slotNow() === sl); e.classList.toggle('full', idx >= 0);
      if (!useSup) e.querySelector('i').textContent = idx >= 0 ? ROSTER[idx].name : '';
    }));
    // grands portraits, nom, techniques
    for (const t of [0, 1]) {
      if (t === 1 && !hasP2) continue;
      const { i, rnd } = shown(t), c = rnd ? null : ROSTER[i], a = c && ARCH[c.arch], started = at === t || mainsOf(t).length > 0, np = plates[t], sk = sks[t];
      arts[t].classList.toggle('sil', !started || rnd); arts[t].q.style.display = (!started || rnd) ? 'block' : 'none'; arts[t].classList.toggle('dim', at !== t);
      np.classList.toggle('dim', at !== t);
      np.querySelector('.pl').textContent = label(t);
      np.querySelector('.nm').textContent = rnd ? 'ALÉATOIRE' : !started ? '???' : c.name.toUpperCase();
      np.querySelector('.ti').textContent = rnd ? 'Un combattant tiré au sort' : !started ? '' : c.title;
      np.querySelector('.mst').innerHTML = c && started ? bar('VIT', c.spd) + bar('PUI', c.pow) + bar('DÉF', c.def) : '';
      sk.style.setProperty('--c1', a ? a.c1 : '#556'); sk.style.setProperty('--c2', a ? a.c2 : '#334');
      const row = (k, v) => `<div class="sk"><em>${k}</em><b>${v}</b></div>`;
      sk.innerHTML = a && started ? row('STYLE', a.label) + row('NINJUTSU', c.spName || a.spName) + row('ULTIME', c.supName || a.supName) : row('STYLE', '???') + row('NINJUTSU', '???') + row('ULTIME', '???');
    }
  };

  const act = (k) => {
    const at = activeT(); if (at === null) return;
    let c = curs[at];
    if (k === 'left') c = (c + TOTAL - 1) % TOTAL; else if (k === 'right') c = (c + 1) % TOTAL;
    else if (k === 'up') c = (c - COLS + TOTAL) % TOTAL; else if (k === 'down') c = (c + COLS) % TOTAL;
    else if (k === 'pgl' || k === 'pgr') { const pg = (Math.floor(c / PER) + (k === 'pgl' ? PAGES - 1 : 1)) % PAGES; c = Math.min(TOTAL - 1, pg * PER + (c % PER)); }
    else if (k === 'ok') {
      sfx.ok(); if (c >= N) c = Math.floor(Math.random() * N);
      curs[at] = c; picks.push(c); const nx = activeT(); if (nx !== null && nx !== at) { /* l'autre camp prend la main */ }
      if (picks.length === slots.length) return finish(); return draw();
    }
    else if (k === 'back') { sfx.back(); if (picks.length) { const l = picks.pop(); curs[slots[picks.length].t] = l; return draw(); } return G.go('setup'); }
    else return;
    curs[at] = c; sfx.ui(); draw();
  };
  const finish = () => {
    const pick = (t, kind) => picks.filter((_, k) => slots[k].t === t && slots[k].kind === kind);
    const p1 = pick(0, 'main'), p2h = pick(1, 'main'), sup1 = pick(0, 'sup'), sup2 = pick(1, 'sup');
    G.run = { mode, fmt, vs: humanP2 ? 'p2' : 'cpu', diff: S.diff, need: m.series || m.solo ? 1 : S.need, timer: m.chrono ? S.timer : 0, p1, p2: p2h, sup1, sup2: humanP2 ? sup2 : null, wins: 0, fight: 0, carry: null, score: 0 };
    if (!m.series) return G.go('stage');
    G.nextOpponent();
  };
  const ctx = arts.map((a) => a.cv.getContext('2d'));
  G.ticker = () => {
    const t = performance.now() / 16, f = { state: 'idle', t: 0, vx: 0, move: null, vy: 0 }; const { pose } = poseFor(f, t);
    for (const k of [0, 1]) { if (k === 1 && !hasP2) continue; const { i, rnd } = shown(k); ctx[k].clearRect(0, 0, 128, 128); drawFighter(ctx[k], ROSTER[rnd ? 0 : i], pose, { clock: t }); }
  };
  G.handler = act; draw();
}
