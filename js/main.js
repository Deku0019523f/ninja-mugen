// ============================================================
//  MAIN : routeur d'écrans (menus), modes Arcade / Combat / Survie / Entraînement
// ============================================================
import { View } from './render/view.js';
import { STAGES } from './render/stages.js';
import { ROSTER, ARCH } from './data/roster.js';
import { MOVE2 } from './game/moves.js';
import { drawFighter, drawPortrait, poseFor } from './render/sprites.js';
import { Match } from './game/match.js';
import { Hud } from './ui/hud.js';
import { initInput, pollMenu, isTouch, KEYMAPS } from './input.js';
import { initAudio, sfx, setMuted, setMusic, setMusicMode, isMuted } from './audio.js';

const $ = (s) => document.querySelector(s);
const host = $('#view'), ui = $('#ui'), screenEl = $('#screen'), hudEl = $('#hud');
const view = new View(host);
const hud = new Hud(hudEl);
const DIFF = ['Novice', 'Facile', 'Normal', 'Difficile', 'Maître'];
const MODES = [
  { id: 'arcade', label: 'ARCADE', desc: '8 combats contre l\'ordinateur, jusqu\'à l\'Ultime Maître.' },
  { id: 'single', label: 'COMBAT INDIVIDUEL', desc: 'Un match libre : contre l\'ordinateur ou contre un ami.' },
  { id: 'survival', label: 'SURVIE', desc: 'Enchaînez les adversaires. Votre vie ne se régénère que peu.' },
  { id: 'training', label: 'ENTRAÎNEMENT', desc: 'Un mannequin, des super illimités : apprenez vos combos.' },
  { id: 'options', label: 'OPTIONS', desc: 'Son, musique et chrono.' },
  { id: 'controls', label: 'COMMANDES', desc: 'Clavier, manette et écran tactile.' },
];

// ------------------------------------------------------------ réglages persistants
let S = { fmt: 1, vs: 'cpu', diff: 3, need: 2, timer: 0, sound: true, music: true };
try { Object.assign(S, JSON.parse(localStorage.getItem('ninja-mugen') || '{}')); } catch (e) { /* ignore */ }
const save = () => { try { localStorage.setItem('ninja-mugen', JSON.stringify(S)); } catch (e) { /* ignore */ } };
setMuted(!S.sound); setMusic(S.music);

// ------------------------------------------------------------ mise à l'échelle de l'UI (espace 640x480)
function fit() {
  const b = view.box; if (!b) return;
  const s = b.w / 640;
  ui.style.cssText = `width:640px;height:480px;left:${b.l}px;top:${b.t}px;transform:scale(${s});transform-origin:0 0`;
}
view.resize(); fit(); addEventListener('resize', () => { view.resize(); fit(); });

// ------------------------------------------------------------ état
let screen = null, handler = null, match = null, run = null, ticker = null;
const clear = () => { screenEl.innerHTML = ''; ticker = null; };
const el = (tag, cls, html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };

function go(name, data) {
  screen = name; clear(); hudEl.style.display = 'none'; $('#touch').style.display = 'none';
  setMusicMode('menu');
  ({ title: sTitle, setup: sSetup, select: sSelect, stage: sStage, vs: sVs, options: sOptions, controls: sControls, result: sResult })[name](data);
}

// ------------------------------------------------------------ composant liste de menu
function listMenu(items, { title, sub, onBack, desc } = {}) {
  let idx = 0;
  const wrap = el('div', 'panel');
  if (title) wrap.appendChild(el('h2', '', title));
  if (sub) wrap.appendChild(el('div', 'sub', sub));
  const list = el('div', 'list'); wrap.appendChild(list);
  const d = el('div', 'desc'); wrap.appendChild(d);
  screenEl.appendChild(wrap);
  const rows = items.map((it, i) => {
    const r = el('div', 'row'); r.innerHTML = `<span class="lb"></span><span class="val"></span>`;
    r.onmouseenter = () => { idx = i; draw(); };
    r.onclick = (e) => { idx = i; const rect = r.getBoundingClientRect(); if (it.left && e.clientX - rect.left < rect.width * 0.25) act('left'); else if (it.right && e.clientX - rect.left > rect.width * 0.75) act('right'); else act('ok'); };
    list.appendChild(r); return r;
  });
  const draw = () => rows.forEach((r, i) => {
    const it = items[i]; r.classList.toggle('sel', i === idx);
    r.querySelector('.lb').textContent = typeof it.label === 'function' ? it.label() : it.label;
    const v = it.get ? it.get() : ''; r.querySelector('.val').innerHTML = v ? (it.left ? '◀ ' : '') + v + (it.right ? ' ▶' : '') : '';
    if (i === idx) d.textContent = it.desc || desc || '';
  });
  const act = (k) => {
    const it = items[idx];
    if (k === 'up') idx = (idx + items.length - 1) % items.length;
    else if (k === 'down') idx = (idx + 1) % items.length;
    else if (k === 'left' && it.left) it.left();
    else if (k === 'right' && it.right) it.right();
    else if (k === 'ok') { if (it.ok) it.ok(); else if (it.right) it.right(); }
    else if (k === 'back') { if (onBack) { sfx.back(); onBack(); } return; }
    if (['up', 'down', 'left', 'right'].includes(k)) sfx.ui();
    draw();
  };
  handler = act; draw();
}

// ------------------------------------------------------------ écran titre / menu principal
function sTitle() {
  const logo = el('div', 'logo', '<small>MUGEN ARENA</small><h1>NINJA<br>MUGEN</h1><em>56 combattants · 1v1 · 2v2</em>');
  screenEl.appendChild(logo);
  listMenu(MODES.map((m) => ({ label: m.label, desc: m.desc, ok: () => { sfx.ok(); startMode(m.id); } })), {});
  screenEl.lastChild.classList.add('main');
  const f = el('div', 'foot', 'Flèches / ZQSD + Entrée · Manette et tactile pris en charge'); screenEl.appendChild(f);
}

let mode = 'arcade';
function startMode(id) {
  mode = id;
  if (id === 'options') return go('options');
  if (id === 'controls') return go('controls');
  go('setup');
}

// ------------------------------------------------------------ réglages du mode
function sSetup() {
  const m = MODES.find((x) => x.id === mode), items = [];
  const cyc = (key, arr) => ({ left: () => { const i = arr.indexOf(S[key]); S[key] = arr[(i + arr.length - 1) % arr.length]; save(); }, right: () => { const i = arr.indexOf(S[key]); S[key] = arr[(i + 1) % arr.length]; save(); } });
  if (mode !== 'training') items.push({ label: 'Format', get: () => (S.fmt === 1 ? '1 contre 1' : '2 contre 2'), desc: 'En 2 contre 2, vous choisissez 2 combattants ; votre partenaire est piloté par l\'IA.', ...cyc('fmt', [1, 2]) });
  if (mode === 'single') items.push({ label: 'Adversaire', get: () => (S.vs === 'cpu' ? 'Ordinateur' : 'Joueur 2'), desc: 'Joueur 2 : flèches + J K L I O. Joueur 1 : ZQSD + F G H T Y.', ...cyc('vs', ['cpu', 'p2']) });
  if (mode !== 'training') items.push({ label: 'Difficulté', get: () => `${S.diff} — ${DIFF[S.diff - 1]}`, desc: mode === 'arcade' ? 'Niveau de départ : la difficulté monte à chaque combat.' : mode === 'survival' ? 'Niveau de départ : +1 tous les 3 combats.' : 'Niveau de l\'ordinateur.', ...cyc('diff', [1, 2, 3, 4, 5]) });
  if (mode === 'single' || mode === 'arcade') items.push({ label: 'Manches', get: () => `Au meilleur de ${S.need * 2 - 1}`, desc: 'Nombre de manches pour gagner un match.', ...cyc('need', [1, 2, 3]) });
  if (mode === 'single' || mode === 'arcade') items.push({ label: 'Chrono', get: () => (S.timer ? S.timer + ' s' : '∞'), desc: 'Temps limité par manche, ou illimité (∞).', ...cyc('timer', [0, 60, 99]) });
  items.push({ label: '▶ CHOISIR LES COMBATTANTS', ok: () => { sfx.ok(); go('select'); } });
  listMenu(items, { title: m.label, onBack: () => go('title'), desc: m.desc });
}

// ------------------------------------------------------------ sélection des personnages
function sSelect() {
  const fmt = mode === 'training' ? 1 : S.fmt, humanP2 = mode === 'single' && S.vs === 'p2';
  const slots = []; for (let i = 0; i < fmt; i++) slots.push({ who: 'JOUEUR 1', t: 0 });
  if (humanP2) for (let i = 0; i < fmt; i++) slots.push({ who: 'JOUEUR 2', t: 1 });
  else if (mode === 'single' || mode === 'training') for (let i = 0; i < fmt; i++) slots.push({ who: 'ADVERSAIRE', t: 1 });
  const picks = []; let cur = 0;
  const COLS = 8, N = ROSTER.length;
  const wrap = el('div', 'select');
  const head = el('div', 'sel-head'); const grid = el('div', 'grid'); const side = el('div', 'side');
  wrap.append(head, grid, side); screenEl.appendChild(wrap);
  const cells = ROSTER.map((c, i) => {
    const d = el('div', 'cell'); const cv = el('canvas'); cv.width = cv.height = 48; drawPortrait(cv.getContext('2d'), c, 48); d.appendChild(cv);
    d.onmouseenter = () => { cur = i; draw(); }; d.onclick = () => { cur = i; act('ok'); };
    grid.appendChild(d); return d;
  });
  cells.push(); const rnd = el('div', 'cell rand', '?'); rnd.onclick = () => { cur = Math.floor(Math.random() * N); act('ok'); }; grid.appendChild(rnd);
  side.innerHTML = '<canvas class="prev" width="128" height="128"></canvas><div class="nm"></div><div class="ti"></div><div class="st"></div><div class="tc"></div>';
  const pv = side.querySelector('.prev').getContext('2d');
  const draw = () => {
    cells.forEach((c, i) => { c.classList.toggle('sel', i === cur); const k = picks.indexOf(i); c.classList.toggle('picked', k >= 0); });
    const s = slots[picks.length];
    head.innerHTML = s ? `<b>${s.who}</b> — choisissez ${fmt > 1 ? 'combattant ' + ((picks.filter((_, k) => slots[k].t === s.t).length) + 1) + '/' + fmt : 'votre combattant'}` : '';
    const c = ROSTER[cur], a = ARCH[c.arch], m2 = MOVE2[a.m2];
    side.querySelector('.nm').textContent = c.name.toUpperCase(); side.querySelector('.ti').textContent = c.title;
    const bar = (l, v) => `<div class="b"><span>${l}</span><i><u style="width:${Math.min(100, v * 70)}%"></u></i></div>`;
    side.querySelector('.st').innerHTML = bar('Vitesse', c.spd) + bar('Puissance', c.pow) + bar('Défense', c.def);
    side.querySelector('.tc').innerHTML = `<div><em>${a.label}</em></div><div>⚡ ${a.spName}</div><div>✦ ${m2.name}</div><div>★ ${a.supName}</div>`;
  };
  const act = (k) => {
    const n = ROSTER.length;
    if (k === 'left') cur = (cur + n - 1) % n; else if (k === 'right') cur = (cur + 1) % n;
    else if (k === 'up') cur = (cur - COLS + n) % n; else if (k === 'down') cur = (cur + COLS) % n;
    else if (k === 'ok') {
      sfx.ok(); picks.push(cur);
      if (picks.length === slots.length) return finish();
      return draw();
    } else if (k === 'back') { sfx.back(); if (picks.length) { picks.pop(); return draw(); } return go('setup'); }
    sfx.ui(); draw();
  };
  const finish = () => {
    const p1 = picks.filter((_, k) => slots[k].t === 0), p2h = picks.filter((_, k) => slots[k].t === 1);
    run = { mode, fmt, vs: humanP2 ? 'p2' : 'cpu', diff: S.diff, need: mode === 'survival' || mode === 'training' ? 1 : S.need, timer: mode === 'single' || mode === 'arcade' ? S.timer : 0, p1, p2: p2h, wins: 0, fight: 0, carry: null, score: 0 };
    if (mode === 'single' || mode === 'training') return go('stage');
    nextOpponent();
  };
  ticker = () => { const c = ROSTER[cur]; const t = performance.now() / 16; const f = { state: 'idle', t: 0, vx: 0, move: null, vy: 0 }; const { pose } = poseFor(f, t); drawFighter(pv, c, pose, { clock: t }); };
  handler = act; draw();
}

// ------------------------------------------------------------ choix du décor
function sStage() {
  let idx = 0; const wrap = el('div', 'panel');
  wrap.innerHTML = '<h2>CHOISIR LE DÉCOR</h2>';
  const list = el('div', 'stages'); wrap.appendChild(list); screenEl.appendChild(wrap);
  const names = [...STAGES.map((s) => s.name), 'ALÉATOIRE'];
  const cards = names.map((n, i) => { const d = el('div', 'stg', n); d.dataset.i = i; d.onmouseenter = () => { idx = i; draw(); }; d.onclick = () => { idx = i; act('ok'); }; list.appendChild(d); return d; });
  const draw = () => cards.forEach((c, i) => c.classList.toggle('sel', i === idx));
  const act = (k) => {
    const n = names.length;
    if (k === 'left') idx = (idx + n - 1) % n; else if (k === 'right') idx = (idx + 1) % n; else if (k === 'up') idx = (idx + n - 3) % n; else if (k === 'down') idx = (idx + 3) % n;
    else if (k === 'ok') { sfx.ok(); run.stage = idx === STAGES.length ? Math.floor(Math.random() * STAGES.length) : idx; if (mode === 'training') run.p2 = [Math.floor(Math.random() * ROSTER.length)]; else if (!run.p2.length) run.p2 = randomTeam(run.fmt, run.p1); return launch(); }
    else if (k === 'back') { sfx.back(); return go('select'); }
    sfx.ui(); draw();
  };
  handler = act; draw();
}

const randomTeam = (n, avoid = []) => { const out = []; while (out.length < n) { const r = Math.floor(Math.random() * ROSTER.length); if (!out.includes(r) && !avoid.includes(r)) out.push(r); } return out; };

// ------------------------------------------------------------ Arcade / Survie : enchaînement d'adversaires
function nextOpponent() {
  const arcade = run.mode === 'arcade', i = run.fight;
  if (arcade) {
    const boss = i === 7; run.p2 = boss ? (run.fmt === 2 ? [55, 54] : [55]) : randomTeam(run.fmt, run.p1);
    run.curDiff = Math.min(5, run.diff + Math.floor(i / 3) + (boss ? 1 : 0)); run.stage = i % STAGES.length; run.title = boss ? 'COMBAT FINAL' : `COMBAT ${i + 1} / 8`;
  } else {
    run.p2 = randomTeam(run.fmt, run.p1); run.curDiff = Math.min(5, run.diff + Math.floor(i / 3)); run.stage = Math.floor(Math.random() * STAGES.length); run.title = `SÉRIE : ${i} VICTOIRE${i > 1 ? 'S' : ''}`;
  }
  go('vs');
}

function sVs() {
  const wrap = el('div', 'vs');
  const side = (ids, cls) => `<div class="vs-side ${cls}">${ids.map((id) => `<div class="vs-c"><canvas width="64" height="64" data-id="${id}"></canvas><b>${ROSTER[id].name.toUpperCase()}</b><i>${ROSTER[id].title}</i></div>`).join('')}</div>`;
  wrap.innerHTML = `<div class="vs-title">${run.title}</div><div class="vs-row">${side(run.p1, 'l')}<div class="vs-x">VS</div>${side(run.p2, 'r')}</div><div class="vs-diff">Niveau de l'adversaire : ${DIFF[run.curDiff - 1]}</div><div class="foot">Entrée pour combattre</div>`;
  screenEl.appendChild(wrap);
  wrap.querySelectorAll('canvas').forEach((c) => { c.width = c.height = 96; drawPortrait(c.getContext('2d'), ROSTER[+c.dataset.id], 96); });
  const t0 = performance.now();
  handler = (k) => { if (k === 'ok' || (k === 'back')) { sfx.ok(); launch(); } };
  ticker = () => { if (performance.now() - t0 > 3200) { ticker = null; launch(); } };
  wrap.onclick = () => handler('ok');
}

// ------------------------------------------------------------ lancement d'un match
function launch() {
  clear(); screen = 'fight'; handler = null; screenEl.innerHTML = '';
  hudEl.style.display = 'block'; if (isTouch()) $('#touch').style.display = 'block';
  const cfg = { mode: run.mode, fmt: run.fmt, vs: run.vs, diff: run.curDiff || run.diff, timer: run.timer, need: run.need, p1: run.p1, p2: run.p2, stage: run.stage, carry: run.carry };
  if (match) match.destroy();
  match = new Match(cfg, view, hud, onMatchEnd); hud.built = false;
  setMusicMode('fight'); initAudio();
  pauseEl.style.display = 'none';
}

function onMatchEnd(res) {
  const m = match; match = null; bgWorld = null; hud.built = false; setMusicMode('menu');
  if (run.mode === 'survival' || run.mode === 'arcade') {
    if (res.winner === 0) {
      run.fight++; run.score += 1000 + run.fight * 250;
      if (run.mode === 'survival') run.carry = res.carry.map((hp, i) => Math.min(m.world.fighters[i].maxHp, hp + m.world.fighters[i].maxHp * 0.3));
      if (run.mode === 'arcade' && run.fight >= 8) return go('result', { done: true, win: true });
      return nextOpponent();
    }
    return go('result', { done: true, win: false });
  }
  go('result', { done: false, win: res.winner === 0, wins: res.wins });
}

// ------------------------------------------------------------ résultat
function sResult(d) {
  const arc = run.mode === 'arcade', sur = run.mode === 'survival';
  let title, sub;
  if (arc) { title = d.win ? 'FÉLICITATIONS !' : 'DÉFAITE'; sub = d.win ? `Vous avez vaincu l'Ultime Maître !<br>Score : <b>${run.score}</b>` : `Éliminé au combat ${run.fight + 1} / 8<br>Score : <b>${run.score}</b>`; }
  else if (sur) { title = 'FIN DE LA SÉRIE'; sub = `${run.fight} victoire${run.fight > 1 ? 's' : ''}<br>Score : <b>${run.score}</b>`; let best = 0; try { best = +localStorage.getItem('ninja-mugen-best') || 0; if (run.score > best) { localStorage.setItem('ninja-mugen-best', run.score); best = run.score; } } catch (e) { /* ignore */ } sub += `<br>Meilleur : ${best}`; }
  else { title = d.win ? 'VICTOIRE !' : 'DÉFAITE'; sub = `Manches : ${d.wins[0]} — ${d.wins[1]}`; }
  const items = [];
  if (!arc && !sur) items.push({ label: 'Revanche', ok: () => { sfx.ok(); launch(); } });
  else items.push({ label: 'Rejouer le mode', ok: () => { sfx.ok(); go('select'); } });
  items.push({ label: 'Changer de combattants', ok: () => { sfx.ok(); go('select'); } }, { label: 'Menu principal', ok: () => { sfx.ok(); go('title'); } });
  listMenu(items, { title, sub, onBack: () => go('title') });
  (d.win ? sfx.win : sfx.lose)();
}

// ------------------------------------------------------------ options & commandes
function sOptions() {
  listMenu([
    { label: 'Effets sonores', get: () => (S.sound ? 'Activés' : 'Coupés'), left: tog('sound'), right: tog('sound') },
    { label: 'Musique', get: () => (S.music ? 'Activée' : 'Coupée'), left: tog('music'), right: tog('music') },
    { label: 'Retour', ok: () => go('title') },
  ], { title: 'OPTIONS', onBack: () => go('title') });
  function tog(k) { return () => { S[k] = !S[k]; save(); setMuted(!S.sound); setMusic(S.music); initAudio(); }; }
}

function sControls() {
  const k = (c) => c.replace('Key', '').replace('Arrow', '→↑↓←'.includes('') ? '' : '');
  const name = (c) => ({ ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' }[c] || c.replace('Key', ''));
  void k;
  const row = (l, i) => `<tr><td>${l}</td>${[0, 1].map((p) => `<td>${name(KEYMAPS[p][i])}</td>`).join('')}</tr>`;
  const w = el('div', 'panel ctrl');
  w.innerHTML = `<h2>COMMANDES</h2><table><tr><th></th><th>Joueur 1</th><th>Joueur 2</th></tr>
  ${row('Gauche', 'l')}${row('Droite', 'r')}${row('Saut', 'u')}${row('Garde (accroupi)', 'd')}${row('Poing — 3 coups = combo', 'punch')}${row('Pied', 'kick')}${row('Spécial (10 chakra)', 'special')}${row('Technique (15)', 'move2')}${row('SUPER (50)', 'super')}</table>
  <ul><li>↓ + Poing : <b>Uppercut</b> · ↓ + Pied : <b>Balayage</b></li><li>Reculer face à un coup : <b>garde automatique</b></li><li>Dans les airs : Poing / Pied / Spécial</li><li>Le chakra se recharge en frappant et en encaissant.</li><li>P ou Échap : pause · Manette : X poing, A pied, B spécial, Y technique, R1 super</li></ul><div class="foot">Échap / G : retour</div>`;
  screenEl.appendChild(w); handler = (k2) => { if (k2 === 'back' || k2 === 'ok') { sfx.back(); go('title'); } };
}

// ------------------------------------------------------------ pause
const pauseEl = el('div', 'pause'); ui.appendChild(pauseEl); pauseEl.style.display = 'none';
function setPause(on) {
  if (!match) return; match.paused = on; pauseEl.style.display = on ? 'flex' : 'none';
  if (on) {
    pauseEl.innerHTML = '<div class="panel"><h2>PAUSE</h2><div class="list"></div></div>';
    const list = pauseEl.querySelector('.list'); let idx = 0;
    const items = [['Reprendre', () => setPause(false)], ['Recommencer', () => { setPause(false); launch(); }], ['Quitter vers le menu', () => { setPause(false); match.destroy(); match = null; bgWorld = null; go('title'); }]];
    const rows = items.map(([l, fn], i) => { const r = el('div', 'row', `<span class="lb">${l}</span>`); r.onclick = () => { idx = i; fn(); }; r.onmouseenter = () => { idx = i; dr(); }; list.appendChild(r); return r; });
    const dr = () => rows.forEach((r, i) => r.classList.toggle('sel', i === idx)); dr();
    handler = (k) => { if (k === 'up') idx = (idx + 2) % 3; else if (k === 'down') idx = (idx + 1) % 3; else if (k === 'ok') return items[idx][1](); else if (k === 'back' || k === 'pause') return setPause(false); sfx.ui(); dr(); };
  } else handler = null;
}

// ------------------------------------------------------------ boucle principale
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  for (const k of pollMenu()) {
    initAudio();
    if (screen === 'fight') { if (k === 'pause') setPause(!match?.paused); else if (match && match.paused && handler) handler(k); }
    else if (handler) handler(k === 'pause' ? 'back' : k);
  }
  if (ticker) ticker();
  if (match) match.frame(dt);
  else if (screen !== 'fight') { idleBg(dt); }
  requestAnimationFrame(loop);
}

// décor animé derrière les menus
let bgWorld = null;
function idleBg(dt) {
  if (!bgWorld) { bgWorld = { fighters: [], projs: [], events: [] }; view.setStage(Math.floor(Math.random() * STAGES.length)); view.setFighters(bgWorld); bgT = 0; }
  bgT += dt; view.camX = Math.sin(bgT * 0.25) * 120; view.render(bgWorld, dt);
}
let bgT = 0;
const _go = go; // réinitialise le fond quand on revient au menu
// eslint-disable-next-line no-func-assign
go = function (n, d) { if (n === 'title' || n === 'setup') { if (match) { match.destroy(); match = null; } bgWorld = null; } _go(n, d); };

initInput();
addEventListener('pointerdown', () => initAudio(), { once: true });
go('title');
requestAnimationFrame(loop);
window.__ninja = { view, go: (...a) => go(...a), get match() { return match; }, setMode: (m) => { mode = m; }, ROSTER };
