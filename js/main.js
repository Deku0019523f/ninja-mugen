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
import { G, el, save } from './screens/ctx.js';
import { SCREENS } from './screens/index.js';
import { MODES } from './modes/index.js';
import { shell } from './ui/shell.js';
import { prog } from './progress.js';
import { story } from './story.js';
import { showLoading } from './ui/loading.js';

const $ = (s) => document.querySelector(s);
const host = $('#view'), ui = $('#ui'), screenEl = $('#screen'), hudEl = $('#hud'), touchEl = $('#touch');
const view = new View(host), hud = new Hud(hudEl);
G.view = view; G.screenEl = screenEl; shell.mount(ui);
setMuted(!G.S.sound); setMusic(G.S.music);

// interface 480 px de haut × VW de large, mise à l'échelle pour remplir l'écran
function fit() { const b = view.box; if (b) shell.fit(b.vw); if (b) ui.style.cssText = `width:${b.vw}px;height:480px;left:${b.l}px;top:${b.t}px;transform:scale(${b.s});transform-origin:0 0`; }
view.resize(); fit(); addEventListener('resize', () => { view.resize(); fit(); });

const backBtn = $('#backbtn'), pauseBtn = $('#pausebtn');
let screen = null, match = null, bgWorld = null, bgT = 0;
backBtn.onclick = () => G.handler && G.handler('back');
const pauseOpen = () => pauseEl.style.display !== 'none';
pauseBtn.onclick = () => setPause(!pauseOpen());

// bandeau d'état réseau (reconnexion, synchronisation)
const netEl = el('div', 'netmsg'); ui.appendChild(netEl); let netTxt = null;
G.netStatus = (t) => { netTxt = t; netEl.textContent = t || ''; netEl.classList.toggle('on', !!t); };

function go(name, data) {
  const first = screen === null;
  if (G.onLeave) { const f = G.onLeave; G.onLeave = null; f(); }       // désabonne les écrans de leurs événements
  if (name === 'title') { if (G.net && G.net.state !== 'closed') G.net.leave(); G.net = null; if (G.mode === 'online') G.mode = 'single'; }
  if (name === 'title' || name === 'setup') { if (match) { match.destroy(); match = null; } bgWorld = null; G.run = null; }
  pauseBtn.style.display = 'none'; screen = name; G.cur = name;
  screenEl.innerHTML = ''; G.ticker = null; G.handler = null; hudEl.style.display = 'none'; touchEl.style.display = 'none';
  shell.setScreen(name); if (!first) shell.slash();
  backBtn.style.display = name === 'vs' || name === 'result' ? 'block' : 'none';    // les pages à barre ont leur propre bouton RETOUR
  setMusicMode('menu'); SCREENS[name](data);
}
G.go = go;

// ------------------------------------------------------------ Arcade / Survie / Tournoi : enchaînement d'adversaires
G.nextOpponent = () => { const m = MODES[G.run.mode]; m.next(G.run); go(m.bracket ? 'bracket' : 'vs'); };

// ------------------------------------------------------------ lancement d'un match
G.launch = () => {
  const run = G.run;
  screenEl.innerHTML = ''; G.ticker = null; G.handler = null; screen = 'fight';
  shell.setScreen('fight'); hudEl.style.display = 'block'; backBtn.style.display = 'none'; pauseBtn.style.display = 'block'; if (isTouch()) touchEl.style.display = 'block';
  const cfg = { mode: run.mode, fmt: run.fmt, vs: run.vs, diff: run.curDiff || run.diff, timer: run.timer, need: run.need, p1: run.p1, p2: run.p2, stage: run.stage, carry: run.carry, sup: !run.net && G.S.sup !== false && run.fmt === 1, sup1: run.sup1, sup2: run.sup2, seed: run.seed, net: run.net ? G.net : null, boost: !run.net && run.vs !== 'p2' && run.mode !== 'training' ? run.p1.map((id) => prog.stats(id)) : null };
  if (!run.net && run.p1 && run.p1.length) { G.S.hero = run.p1[0]; save(); }
  if (match) match.destroy();
  match = new Match(cfg, view, hud, onMatchEnd); hud.built = false;
  setMusicMode('fight'); initAudio(); pauseEl.style.display = 'none';
};

function onMatchEnd(res) {
  const m = match, run = G.run, mode = MODES[run.mode]; match = null; bgWorld = null; hud.built = false; setMusicMode('menu');
  if (run.mode === 'online') { G.net.endMatch(); return go('onlineResult', { win: res.winner === G.net.me, wins: res.wins }); }
  let gain = null;
  if (run.vs !== 'p2' && run.mode !== 'training') { gain = prog.reward(res.winner === 0, !!run.big || (mode.series && run.fight >= (run.mode === 'tournament' ? 3 : 7))); run.gain = run.gain || { c: 0, g: 0 }; run.gain.c += gain.c; run.gain.g += gain.g; }
  if (mode.series) {
    if (res.winner !== 0) return go('result', { done: true, win: false });
    run.fight++; run.score += 1000 + run.fight * 250; if (mode.onWin) mode.onWin(run, res, m);
    if (mode.finished(run)) return go('result', { done: true, win: true });
    return G.nextOpponent();
  }
  if (run.mode === 'story') { const sr = story.finish(run.sd, run.si, res); if (sr.c || sr.g) { prog.add(sr.c, sr.g); gain = { c: (gain ? gain.c : 0) + sr.c, g: (gain ? gain.g : 0) + sr.g }; } return go('result', { done: false, win: sr.win, wins: res.wins, gain, story: sr }); }
  go('result', { done: false, win: res.winner === 0, wins: res.wins, gain });
}

// ------------------------------------------------------------ pause
const pauseEl = el('div', 'pause'); ui.appendChild(pauseEl); pauseEl.style.display = 'none';
function setPause(on) {
  if (!match) return; const net = !!match.net; if (!net) match.paused = on; pauseEl.style.display = on ? 'flex' : 'none';   // en ligne, le combat ne s'arrête pas : le menu est seulement superposé
  if (!on) { G.handler = null; return; }
  pauseEl.innerHTML = `<div class="panel"><h2>${net ? 'MENU' : 'PAUSE'}</h2><div class="list"></div></div>`;
  const list = pauseEl.querySelector('.list'); let idx = 0;
  const quit = () => { setPause(false); match.destroy(); match = null; bgWorld = null; go('title'); };
  const items = net ? [['Reprendre', () => setPause(false)], ['Quitter la partie', quit]]
    : [['Reprendre', () => setPause(false)], ['Recommencer', () => { setPause(false); G.launch(); }], ['Quitter vers le menu', quit]];
  const rows = items.map(([l, fn], i) => { const r = el('div', 'row', `<span class="lb">${l}</span>`); r.onclick = () => { idx = i; fn(); }; r.onmouseenter = () => { idx = i; dr(); }; list.appendChild(r); return r; });
  const dr = () => rows.forEach((r, i) => r.classList.toggle('sel', i === idx)); dr();
  G.handler = (k) => { const n = items.length; if (k === 'up') idx = (idx + n - 1) % n; else if (k === 'down') idx = (idx + 1) % n; else if (k === 'ok') return items[idx][1](); else if (k === 'back' || k === 'pause') return setPause(false); sfx.ui(); dr(); };
}

// ------------------------------------------------------------ boucle principale
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  for (const k of pollMenu()) {
    initAudio();
    if (screen === 'fight') { if (k === 'pause') setPause(!pauseOpen()); else if (match && (match.paused || pauseOpen()) && G.handler) G.handler(k); }
    else if (G.handler) G.handler(k === 'pause' ? 'back' : k);
  }
  if (G.ticker) G.ticker();
  if (match && match.net && G.net && G.net.state !== 'reconnecting') G.netStatus(match.stalled > 30 ? 'Synchronisation avec l\'adversaire…' : null);
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
go('title'); showLoading(ui);
requestAnimationFrame(loop);
window.__ninja = { view, go: (...a) => go(...a), get match() { return match; }, setMode: (m) => { G.mode = m; }, ROSTER, G };
