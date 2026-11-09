// Sélection des combattants : grille paginée à gauche, aperçu animé au centre (socle, ombre, aura de chakra),
// fiche (style · jutsu · ultime) en bas, panneau ADVERSAIRE à droite. Soutiens R1 / L1 en haut de chaque aperçu.
// Clavier : flèches, Q / E (page), Entrée (valider), Tab (adversaire manuel / aléatoire), Échap (retour).
import { G, el } from './ctx.js';
import { ROSTER, ARCH } from '../data/roster.js';
import { drawFighter, drawPortrait, poseFor } from '../render/sprites.js';
import { MODES } from '../modes/index.js';
import { ICON } from '../ui/icons.js';
import { pageHead } from '../ui/shell.js';
import { flow } from '../net/flow.js';
import { sfx } from '../audio.js';

export default function sSelect() {
  const S = G.S, mode = G.mode, m = MODES[mode];
  const compact = G.view.vw < 820, COLS = compact ? 3 : 4, ROWS = 4, PER = COLS * ROWS;
  const fmt = m.solo ? 1 : S.fmt, humanP2 = mode === 'single' && S.vs === 'p2';
  const online = mode === 'online';
  const useSup = S.sup !== false && fmt === 1 && !online;                 // soutiens R1 / L1 : 2 par joueur, en 1 contre 1
  const canPickOpp = !humanP2 && (mode === 'single' || mode === 'training');   // adversaire CPU : aléatoire par défaut, choisissable
  let oppManual = false;
  const mkSlots = () => {
    const s = [], side = (who, t) => { for (let i = 0; i < fmt; i++) s.push({ who, t, kind: 'main' }); if (useSup) for (let i = 1; i <= 2; i++) s.push({ who, t, kind: 'sup', n: i }); };
    side('JOUEUR 1', 0);
    if (humanP2) side('JOUEUR 2', 1);
    else if (canPickOpp && oppManual) for (let i = 0; i < fmt; i++) s.push({ who: 'ADVERSAIRE', t: 1, kind: 'main' });
    return s;
  };
  let slots = mkSlots();
  const p1Count = slots.length;
  const picks = [], N = ROSTER.length, TOTAL = N + 1, PAGES = Math.ceil(TOTAL / PER);   // + case « aléatoire »
  const curs = [0, Math.min(N - 1, 9)];
  // prénoms en double (plusieurs « Kaito ») : numérotés dans la grille, le détail est dans la fiche
  const seen = {}, count = {}; ROSTER.forEach((c) => { count[c.name] = (count[c.name] || 0) + 1; });
  const tag = ROSTER.map((c) => (count[c.name] > 1 ? `${c.name.toUpperCase()} ${(seen[c.name] = (seen[c.name] || 0) + 1)}` : c.name.toUpperCase()));

  // ---------- squelette
  const wrap = el('div', 'select' + (compact ? ' compact' : ''));
  const portraits = [];
  const portrait = (i) => { if (!portraits[i]) { const c = el('canvas'); c.width = c.height = 48; drawPortrait(c.getContext('2d'), ROSTER[i], 48); portraits[i] = c; } return portraits[i]; };
  const head = pageHead({ title: 'SÉLECTIONNEZ LE COMBATTANT', sub: '', onBack: () => act('back'), right: '' });
  const bRnd = el('button', 'btn alt', ICON.dice + '<span>ALÉATOIRE</span>'); head.querySelector('.r').appendChild(bRnd);
  const sub = head.querySelector('h2 small') || head.querySelector('h2').appendChild(el('small'));
  const body = el('div', 'sel-body');

  // grille (gauche)
  const left = el('section', 'sel-grid plate org');
  const gh = el('div', 'sg-h', '<span class="who"></span><span class="pgno"></span>'), grid = el('div', 'sgrid'); grid.style.setProperty('--cols', COLS);
  const cells = []; let tapNew = false;
  for (let j = 0; j < PER; j++) {
    const d = el('div', 'cell'), cv = el('canvas'), nm = el('span', 'cn'); cv.width = cv.height = 48; d.append(cv, nm); d.cv = cv; d.nm = nm;
    d.onmouseenter = () => { if (d.idx < TOTAL && activeT() !== null && curs[activeT()] !== d.idx) { curs[activeT()] = d.idx; sfx.ui(); draw(); } };
    d.onpointerdown = (e) => { tapNew = e.pointerType === 'touch' && curs[activeT()] !== d.idx; };    // tactile : 1er appui = aperçu, 2e = valider
    d.onclick = () => { const t = activeT(); if (t === null || d.idx >= TOTAL) return; if (tapNew) { tapNew = false; curs[t] = d.idx; sfx.ui(); return draw(); } curs[t] = d.idx; act('ok'); };
    cells.push(d); grid.appendChild(d);
  }
  const pgr = el('div', 'pgr'), bPl = el('button', 'btn', ICON.left), bPr = el('button', 'btn', ICON.right), pgl = el('span', 'pgl', 'PAGE');
  pgr.append(bPl, pgl, bPr); bPl.onclick = () => act('pgl'); bPr.onclick = () => act('pgr');
  left.append(gh, grid, pgr);

  // centre : aperçus + fiche
  const mid = el('section', 'sel-mid'), stage = el('div', 'sel-stage'), figs = [], tops = [];
  for (const t of [0, 1]) {
    const side = el('div', 'fside s' + t), top = el('div', 'tg'), fig = el('div', 'fig');
    fig.innerHTML = '<div class="aura"></div><div class="plat"></div><div class="shadow"></div><div class="parts">' + '<i></i>'.repeat(7) + '</div><canvas width="128" height="128"></canvas><div class="tomb"><b>?</b></div><span class="ptag"></span>';
    side.append(top, fig); stage.appendChild(side); tops.push(top); figs.push({ fig, cv: fig.querySelector('canvas'), tomb: fig.querySelector('.tomb'), ptag: fig.querySelector('.ptag') });
    if (t === 0) stage.appendChild(el('div', 'vsx', 'VS'));
  }
  const info = el('div', 'info plate');
  info.innerHTML = '<div class="inf-h"><div><div class="nm"></div><div class="ti"></div></div><div class="inf-r"><span class="tag org"></span><div class="mst"></div></div></div><div class="sks"></div>';
  mid.append(stage, info);

  // droite : adversaire
  const right = el('aside', 'sel-right plate cy');
  right.innerHTML = '<div class="plate-h cy"><span class="rt">ADVERSAIRE</span><span class="tag rtag"></span></div><div class="rcard"></div>';
  const rcard = right.querySelector('.rcard'), bOk = el('button', 'btn-main'), btxt = el('span'); bOk.appendChild(btxt); right.appendChild(bOk);
  bOk.onclick = () => act('ok'); bRnd.onclick = () => { const t = activeT(); if (t !== null) { curs[t] = N; act('ok'); } };
  right.querySelector('.rcard').onclick = () => { if (canPickOpp) act('alt'); };
  body.append(left, mid, right); wrap.append(head, body); G.screenEl.appendChild(wrap);

  // ---------- état
  const slotNow = () => slots[picks.length];
  const activeT = () => { const s = slotNow(); return s ? s.t : null; };
  const mainsOf = (t) => picks.filter((_, k) => slots[k] && slots[k].t === t && slots[k].kind === 'main');
  const shown = (t) => ({ i: curs[t], rnd: curs[t] >= N });
  const lab = (t) => (t === 0 ? (online ? 'VOUS' : 'P1') : humanP2 ? 'P2' : online ? 'ADV' : 'CPU');
  const bar = (l, v) => `<span>${l}<i><u style="width:${Math.min(100, v * 70)}%"></u></i></span>`;

  const rebuildTops = () => {
    tops.forEach((g, t) => {
      g.innerHTML = ''; const sl = slots.filter((s) => s.t === t && (useSup ? s.kind === 'sup' : fmt > 1));
      g.sl = sl; g.els = [];
      if (!sl.length) return;
      g.appendChild(el('div', 'tl', useSup ? 'SOUTIENS' : 'ÉQUIPE'));
      const row = el('div', 'tr'); g.appendChild(row);
      sl.forEach((s) => { const e = el('div', 'slot'); e.innerHTML = '<canvas width="48" height="48"></canvas><i>' + (useSup ? (s.n === 1 ? 'R1' : 'L1') : '') + '</i>'; row.appendChild(e); g.els.push(e); });
    });
  };

  const draw = () => {
    const at = activeT(), s = slotNow(), t0 = at === null ? 0 : at;
    // grille
    const pg = Math.floor(curs[t0] / PER);
    wrap.classList.toggle('p2on', t0 === 1);
    left.classList.toggle('org', t0 === 0); left.classList.toggle('cy', t0 === 1);
    gh.querySelector('.who').textContent = online ? 'ROSTER' : 'ROSTER ' + lab(t0); gh.querySelector('.pgno').textContent = (pg + 1) + '/' + PAGES; pgl.textContent = 'PAGE';
    cells.forEach((d, j) => {
      const idx = pg * PER + j; d.idx = idx; const g = d.cv.getContext('2d'); g.clearRect(0, 0, 48, 48);
      d.classList.toggle('void', idx >= TOTAL); d.classList.toggle('rnd', idx === N);
      if (idx < N) { g.drawImage(portrait(idx), 0, 0); d.nm.textContent = tag[idx]; d.style.setProperty('--ac', ARCH[ROSTER[idx].arch].c1); }
      else if (idx === N) { g.fillStyle = '#a9b4e8'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.fillText('?', 24, 35); d.nm.textContent = 'ALÉA.'; d.style.setProperty('--ac', '#a9b4e8'); }
      d.classList.toggle('sel', idx === curs[t0]); d.classList.toggle('picked', idx < N && picks.indexOf(idx) >= 0);
    });
    sub.textContent = online ? 'CHOISISSEZ VOTRE COMBATTANT' : !s ? '' : s.kind === 'sup' ? `${s.who} ACTIF · SOUTIEN ${s.n}/2 (${s.n === 1 ? 'R1' : 'L1'})` : `${s.who} ACTIF` + (fmt > 1 ? ` · COMBATTANT ${mainsOf(s.t).length + 1}/${fmt}` : '');
    // soutiens / équipe
    tops.forEach((g, t) => g.sl && g.sl.forEach((sl, k) => {
      const e = g.els[k], idx = (() => { let n = -1; for (let q = 0; q < picks.length; q++) if (slots[q] === sl) n = picks[q]; return n; })();
      const c = e.querySelector('canvas').getContext('2d'); c.clearRect(0, 0, 48, 48); if (idx >= 0) c.drawImage(portrait(idx), 0, 0);
      e.classList.toggle('cur', slotNow() === sl); e.classList.toggle('full', idx >= 0);
      if (!useSup) e.querySelector('i').textContent = idx >= 0 ? ROSTER[idx].name : '';
    }));
    // aperçus
    for (const t of [0, 1]) {
      const { i, rnd } = shown(t), c = rnd ? null : ROSTER[i], a = c && ARCH[c.arch];
      const started = at === t || mainsOf(t).length > 0, f = figs[t], real = started && !rnd;
      const has = t === 0 || humanP2 || (canPickOpp && oppManual);       // côté dont le combattant est choisi ici
      f.cv.style.display = (has && started) ? 'block' : 'none'; f.tomb.style.display = (has && started) ? 'none' : 'flex';
      f.tomb.firstChild.textContent = '?';
      f.fig.classList.toggle('sil', has && started && rnd); f.fig.classList.toggle('dim', at !== t);
      f.fig.style.setProperty('--c1', a && real ? a.c1 : t === 0 ? '#ff7a1a' : '#38e0ff');
      f.ptag.textContent = lab(t);
      if (!has) f.fig.classList.add('rand'); else f.fig.classList.remove('rand');
    }
    // fiche du côté actif
    const { i, rnd } = shown(t0), c = rnd ? null : ROSTER[i], a = c && ARCH[c.arch];
    info.classList.toggle('cy', t0 === 1); info.classList.toggle('org', t0 === 0);
    info.querySelector('.nm').textContent = rnd ? 'ALÉATOIRE' : c.name.toUpperCase();
    info.querySelector('.ti').textContent = rnd ? 'Un combattant tiré au sort' : c.title;
    const tg = info.querySelector('.tag'); tg.textContent = rnd ? 'MYSTÈRE' : a.label.toUpperCase(); tg.style.setProperty('--tc', a ? a.c1 : '#a9b4e8');
    info.querySelector('.mst').innerHTML = c ? bar('VIT', c.spd) + bar('PUI', c.pow) + bar('DÉF', c.def) : '';
    const sk = (cls, icon, k, v, col) => `<div class="sk ${cls}" style="--sc:${col}"><span class="si">${ICON[icon]}</span><div><em>${k}</em><b>${v}</b></div></div>`;
    info.querySelector('.sks').innerHTML = sk('st', 'fist', 'STYLE', a ? a.label : '???', a ? a.c1 : '#6a76b0') + sk('jt', 'swirl', 'JUTSU (10 CK)', a ? a.spName : '???', '#38e0ff') + sk('ul', 'star', 'ULTIME (50 CK)', a ? a.supName : '???', '#ff5c78');
    drawRight(); drawBtn();
  };

  const drawRight = () => {
    right.querySelector('.rt').textContent = humanP2 ? 'JOUEUR 2' : 'ADVERSAIRE';
    const tg = right.querySelector('.rtag'); tg.textContent = online ? G.net.linkLabel().toUpperCase() : humanP2 ? 'J2' : `CPU NV.${S.diff}`; tg.style.setProperty('--tc', 'var(--cy)');
    if (online) { const pk = G.net.peerPick != null, nm = G.net.peer.name.toUpperCase(); rcard.className = 'rcard on'; rcard.innerHTML = `<div class="rq">${pk ? ICON.check : '?'}</div><div class="rn">${nm}</div><div class="rs">${pk ? 'A fait son choix.' : 'Choisit son combattant…'}</div>`; return; }
    const t = 1, { i, rnd } = shown(t), started = activeT() === t || mainsOf(t).length > 0;
    if (humanP2 || (canPickOpp && oppManual)) {
      const c = !rnd && started ? ROSTER[i] : null;
      rcard.className = 'rcard on';
      rcard.innerHTML = c ? `<div class="rp"><canvas width="48" height="48"></canvas></div><div class="rn">${c.name.toUpperCase()}</div><div class="rs">${c.title}</div>` + (canPickOpp ? '<div class="rh">Toucher pour repasser en aléatoire</div>' : '')
        : `<div class="rq">?</div><div class="rn">${rnd && started ? 'ALÉATOIRE' : 'EN ATTENTE'}</div><div class="rs">${humanP2 ? 'Le joueur 2 choisit après le joueur 1.' : 'Choisissez son combattant dans la grille.'}</div>` + (canPickOpp ? '<div class="rh">Toucher pour repasser en aléatoire</div>' : '');
      if (c) { const g = rcard.querySelector('canvas').getContext('2d'); g.drawImage(portrait(i), 0, 0); }
    } else {
      rcard.className = 'rcard' + (canPickOpp ? ' tap' : '');
      rcard.innerHTML = canPickOpp ? `<div class="rq">?</div><div class="rn">ALÉATOIRE</div><div class="rs">Sélection automatique au coup d'envoi.</div><div class="rh">${compact ? 'Toucher pour choisir' : 'Toucher (ou Tab) pour choisir'}</div>`
        : `<div class="rq">${ICON.swords}</div><div class="rn">ORDINATEUR</div><div class="rs">${mode === 'arcade' ? '8 combats : adversaires imposés, jusqu\'à l\'Ultime Maître.' : 'Adversaires imposés à chaque combat.'}</div>`;
    }
  };
  const drawBtn = () => {
    const last = picks.length === slots.length - 1, s = slotNow();
    btxt.innerHTML = !last || online ? `VALIDER${ICON.chev}` : m.series ? `COMMENCER${ICON.chev}` : `CHOISIR DÉCOR${ICON.chev}`;
    bOk.title = s ? '' : '';
  };

  const toggleOpp = () => {
    oppManual = !oppManual; picks.length = Math.min(picks.length, p1Count); slots = mkSlots(); rebuildTops(); sfx.ui(); draw();
  };

  const act = (k) => {
    const at = activeT(); if (at === null) return;
    let c = curs[at];
    if (k === 'left') c = (c + TOTAL - 1) % TOTAL; else if (k === 'right') c = (c + 1) % TOTAL;
    else if (k === 'up') c = (c - COLS + TOTAL) % TOTAL; else if (k === 'down') c = (c + COLS) % TOTAL;
    else if (k === 'pgl' || k === 'pgr') { const pg = (Math.floor(c / PER) + (k === 'pgl' ? PAGES - 1 : 1)) % PAGES; c = Math.min(TOTAL - 1, pg * PER + (c % PER)); }
    else if (k === 'alt') { if (canPickOpp) toggleOpp(); return; }
    else if (k === 'ok') {
      sfx.ok(); if (c >= N) c = Math.floor(Math.random() * N);
      curs[at] = c; picks.push(c);
      if (picks.length === slots.length) return finish(); return draw();
    }
    else if (k === 'back') { sfx.back(); if (picks.length) { const l = picks.pop(); curs[slots[picks.length].t] = l; return draw(); } return G.go(online ? 'online' : 'title'); }
    else return;
    curs[at] = c; sfx.ui(); draw();
  };
  const finish = () => {
    if (online) return flow.picked(picks[0]);
    const pick = (t, kind) => picks.filter((_, k) => slots[k].t === t && slots[k].kind === kind);
    const p1 = pick(0, 'main'), p2h = pick(1, 'main'), sup1 = pick(0, 'sup'), sup2 = pick(1, 'sup');
    G.run = { mode, fmt, vs: humanP2 ? 'p2' : 'cpu', diff: S.diff, need: m.series || m.solo ? 1 : S.need, timer: m.chrono ? S.timer : 0, p1, p2: p2h, sup1, sup2: humanP2 ? sup2 : null, wins: 0, fight: 0, carry: null, score: 0 };
    if (!m.series) return G.go('stage');
    G.nextOpponent();
  };
  const ctx = figs.map((f) => f.cv.getContext('2d'));
  G.ticker = () => {
    const t = performance.now() / 16, f = { state: 'idle', t: 0, vx: 0, move: null, vy: 0 }; const { pose } = poseFor(f, t);
    for (const k of [0, 1]) { if (figs[k].cv.style.display === 'none') continue; const { i, rnd } = shown(k); ctx[k].clearRect(0, 0, 128, 128); drawFighter(ctx[k], ROSTER[rnd ? 0 : i], pose, { clock: t }); }
  };
  if (online) G.onLeave = G.net.on('pick', draw);
  G.handler = act; rebuildTops(); draw();
}
