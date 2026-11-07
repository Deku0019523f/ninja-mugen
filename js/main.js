// ============================================================
//  MAIN : routeur d'écrans, lancement des matchs, pause, boucle principale
//  Les écrans sont dans js/screens/, les modes de jeu dans js/modes/ (un fichier chacun).
// ============================================================
import { View } from './render/view.js';
import { STAGES } from './stages/index.js';
import { ROSTER } from './data/roster.js';
import { Match } from './game/match.js';
import { Hud } from './ui/hud.js';
import { initInput, pollMenu, isTouch } from './input.js';
import { initAudio, sfx, setMuted, setMusic, setMusicMode } from './audio.js';
import { G, el } from './screens/ctx.js';
import { SCREENS } from './screens/index.js';
import { MODES } from './modes/index.js';

const $ = (s) => document.querySelector(s);
const host = $('#view'), ui = $('#ui'), screenEl = $('#screen'), hudEl = $('#hud'), touchEl = $('#touch');
const view = new View(host), hud = new Hud(hudEl);
G.view = view; G.screenEl = screenEl;
setMuted(!G.S.sound); setMusic(G.S.music);

// interface 480 px de haut × VW de large, mise à l'échelle pour remplir l'écran
function fit() { const b = view.box; if (b) ui.style.cssText = `width:${b.vw}px;height:480px;left:${b.l}px;top:${b.t}px;transform:scale(${b.s});transform-origin:0 0`; }
view.resize(); fit(); addEventListener('resize', () => { view.resize(); fit(); });

const backBtn = $('#backbtn'), pauseBtn = $('#pausebtn');
let screen = null, match = null, bgWorld = null, bgT = 0;
backBtn.onclick = () => G.handler && G.handler('back');
pauseBtn.onclick = () => setPause(!match?.paused);

function go(name, data) {
  if (name === 'title' || name === 'setup') { if (match) { match.destroy(); match = null; } bgWorld = null; }
  pauseBtn.style.display = 'none'; screen = name; backBtn.style.display = name === 'title' || name === 'fight' ? 'none' : 'block';
  screenEl.innerHTML = ''; G.ticker = null; G.handler = null; hudEl.style.display = 'none'; touchEl.style.display = 'none';
  setMusicMode('menu'); SCREENS[name](data);
}
G.go = go;

// ------------------------------------------------------------ Arcade / Survie : enchaînement d'adversaires
G.nextOpponent = () => { MODES[G.run.mode].next(G.run); go('vs'); };

// ------------------------------------------------------------ lancement d'un match
G.launch = () => {
  const run = G.run;
  screenEl.innerHTML = ''; G.ticker = null; G.handler = null; screen = 'fight';
  hudEl.style.display = 'block'; backBtn.style.display = 'none'; pauseBtn.style.display = 'block'; if (isTouch()) touchEl.style.display = 'block';
  const cfg = { mode: run.mode, fmt: run.fmt, vs: run.vs, diff: run.curDiff || run.diff, timer: run.timer, need: run.need, p1: run.p1, p2: run.p2, stage: run.stage, carry: run.carry, sup: G.S.sup !== false && run.fmt === 1, sup1: run.sup1, sup2: run.sup2 };
  if (match) match.destroy();
  match = new Match(cfg, view, hud, onMatchEnd); hud.built = false;
  setMusicMode('fight'); initAudio(); pauseEl.style.display = 'none';
};

function onMatchEnd(res) {
  const m = match, run = G.run, mode = MODES[run.mode]; match = null; bgWorld = null; hud.built = false; setMusicMode('menu');
  if (mode.series) {
    if (res.winner !== 0) return go('result', { done: true, win: false });
    run.fight++; run.score += 1000 + run.fight * 250; if (mode.onWin) mode.onWin(run, res, m);
    if (mode.finished(run)) return go('result', { done: true, win: true });
    return G.nextOpponent();
  }
  go('result', { done: false, win: res.winner === 0, wins: res.wins });
}

// ------------------------------------------------------------ pause
const pauseEl = el('div', 'pause'); ui.appendChild(pauseEl); pauseEl.style.display = 'none';
function setPause(on) {
  if (!match) return; match.paused = on; pauseEl.style.display = on ? 'flex' : 'none';
  if (!on) { G.handler = null; return; }
  pauseEl.innerHTML = '<div class="panel"><h2>PAUSE</h2><div class="list"></div></div>';
  const list = pauseEl.querySelector('.list'); let idx = 0;
  const items = [['Reprendre', () => setPause(false)], ['Recommencer', () => { setPause(false); G.launch(); }], ['Quitter vers le menu', () => { setPause(false); match.destroy(); match = null; bgWorld = null; go('title'); }]];
  const rows = items.map(([l, fn], i) => { const r = el('div', 'row', `<span class="lb">${l}</span>`); r.onclick = () => { idx = i; fn(); }; r.onmouseenter = () => { idx = i; dr(); }; list.appendChild(r); return r; });
  const dr = () => rows.forEach((r, i) => r.classList.toggle('sel', i === idx)); dr();
  G.handler = (k) => { if (k === 'up') idx = (idx + 2) % 3; else if (k === 'down') idx = (idx + 1) % 3; else if (k === 'ok') return items[idx][1](); else if (k === 'back' || k === 'pause') return setPause(false); sfx.ui(); dr(); };
}

// ------------------------------------------------------------ boucle principale
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  for (const k of pollMenu()) {
    initAudio();
    if (screen === 'fight') { if (k === 'pause') setPause(!match?.paused); else if (match && match.paused && G.handler) G.handler(k); }
    else if (G.handler) G.handler(k === 'pause' ? 'back' : k);
  }
  if (G.ticker) G.ticker();
  if (match) match.frame(dt); else if (screen !== 'fight') idleBg(dt);
  requestAnimationFrame(loop);
}

// décor animé derrière les menus
function idleBg(dt) {
  if (!bgWorld) { bgWorld = { fighters: [], projs: [], events: [] }; view.setStage(Math.floor(Math.random() * STAGES.length)); view.setFighters(bgWorld); bgT = 0; }
  bgT += dt; view.camX = Math.sin(bgT * 0.25) * 120; view.render(bgWorld, dt);
}

initInput();
// plein écran + paysage au premier toucher (doit être un « geste » : on utilise click)
addEventListener('click', () => { initAudio(); if (isTouch() && !document.fullscreenElement) { try { const r = document.documentElement.requestFullscreen?.(); r && r.then(() => window.screen.orientation?.lock?.('landscape').catch(() => {})).catch(() => {}); } catch (e) { /* ignore */ } } }, { once: true });
go('title');
requestAnimationFrame(loop);
window.__ninja = { view, go: (...a) => go(...a), get match() { return match; }, setMode: (m) => { G.mode = m; }, ROSTER, G };
