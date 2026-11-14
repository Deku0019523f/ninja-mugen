// Accueil : le héros choisi au centre sur son socle, profil et monnaies en haut, boutons en bas, gros bouton COMBAT.
import { G, el, save } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { ICON } from '../ui/icons.js';
import { drawFighter, drawPortrait, poseFor } from '../render/sprites.js';
import { prog } from '../progress.js';
import { pills, GIFT } from '../ui/kit.js';
import { setMuted, setMusic, initAudio, sfx } from '../audio.js';
import { getPadMode, setPadMode } from '../touch.js';

export default function sTitle() {
  const hid = Math.min(ROSTER.length - 1, G.S.hero || 0), hc = ROSTER[hid], dl = prog.daily();
  const root = el('div', 'home');
  root.innerHTML = `<div class="hm-logo">NINJA MUGEN</div>
    <div class="hm-prof"><canvas class="pf-av" width="56" height="56"></canvas><div><b>${(G.S.name || 'Ninja').replace(/</g, '')}</b><span>${ICON.sword} ${prog.power()}</span></div></div>
    <div class="hm-cur"></div>
    <div class="hm-left"><button class="tile${dl.can ? ' dot' : ''}" data-to="daily"><span>${GIFT}</span><em>CADEAU</em></button></div>
    <div class="plat p2"><i>2</i></div><div class="plat p3"><i>3</i></div>
    <div class="hm-hero"><div class="plat"><i>1</i></div><canvas width="256" height="256"></canvas></div>
    <div class="hm-bar"></div>
    <button class="hm-start" style="width:100px;height:auto;bottom:16px"><img src="assets/ui/btn_start.png" alt="START" style="width:100%;height:auto;display:block;filter:drop-shadow(0 4px 6px #000a)"></button>`;
  G.screenEl.appendChild(root);
  drawPortrait(root.querySelector('.pf-av').getContext('2d'), hc, 56);
  root.querySelector('.hm-cur').appendChild(pills());
  root.querySelector('.tile').onclick = () => { sfx.ok(); G.go('daily'); };

  // héros animé (repos) — rendu à 2× pour rester net
  const cv = root.querySelector('.hm-hero canvas'), g = cv.getContext('2d');
  G.ticker = () => {
    const t = performance.now() / 16, { pose } = poseFor({ state: 'idle', t: 0, vx: 0, vy: 0, move: null }, t);
    g.setTransform(2, 0, 0, 2, 0, 0); drawFighter(g, hc, pose, { clock: t });
  };

  // barre d'icônes en bas à gauche : un bouton = une option (les modes de jeu sont tous dans COMBAT)
  const bar = root.querySelector('.hm-bar'); bar.style.bottom = '14px';
  // HEROES et PVP (multijoueur) : badges image de la planche (le texte est dans l'image) ; les autres gardent l'icône dessinée
  [['assets/ui/btn_heroes.png', 'HÉROS', () => G.go('heroes')], ['assets/ui/btn_pvp.png', 'MULTIJOUEUR', () => { G.mode = 'online'; G.go('online'); }], ['pad', 'COMMANDES', () => G.go('controls')], ['sliders', 'RÉGLAGES', () => settings()]].forEach(([ic, lb, fn]) => {
    const img = ic.startsWith('assets/'), b = el('button', 'dia' + (img ? ' dia-img' : ''), img ? `<img src="${ic}" alt="${lb}" style="width:64px;height:auto;display:block;filter:drop-shadow(0 3px 3px #000a)">` : `<span class="dm"><i>${ICON[ic]}</i></span><em>${lb}</em>`);
    b.onclick = () => { sfx.ok(); fn(); }; bar.appendChild(b);
  });
  const start = () => { sfx.ok(); G.go('modes'); };
  root.querySelector('.hm-start').onclick = start;

  // fenêtre de réglages : profil, sons, musique, commande tactile, plein écran (seul endroit où ils se règlent)
  function settings() {
    const S = G.S, m = el('div', 'modal');
    m.innerHTML = `<div class="mbox"><div class="mhead"><b>RÉGLAGES</b><button class="mx">✕</button></div>
      <div class="mbody parch"><div class="mprof"><canvas width="64" height="64"></canvas><label><input maxlength="14" value="${(S.name || 'Ninja').replace(/"/g, '')}"></label></div>
        <div class="mrow"><span class="mi">${ICON.sound}</span><b>EFFETS SONORES</b><button class="sw${S.sound ? ' on' : ''}" data-k="sound"><i></i></button></div>
        <div class="mrow"><span class="mi">${ICON.swirl}</span><b>MUSIQUE</b><button class="sw${S.music ? ' on' : ''}" data-k="music"><i></i></button></div>
        <div class="mrow"><span class="mi">${ICON.touch}</span><b>COMMANDE TACTILE</b><button class="padsel">${getPadMode() === 'stick' ? 'ANALOGIQUE' : 'CROIX'}</button></div>${document.fullscreenEnabled ? `<div class="mrow"><span class="mi">${ICON.help}</span><b>PLEIN ÉCRAN</b><button class="sw${document.fullscreenElement ? ' on' : ''}" data-k="full"><i></i></button></div>` : ''}</div></div>`;
    root.appendChild(m);
    drawPortrait(m.querySelector('canvas').getContext('2d'), hc, 64);
    const close = () => { const v = m.querySelector('input').value.trim(); if (v) S.name = v.slice(0, 14); save(); m.remove(); G.handler = main; if (v) { root.querySelector('.hm-prof b').textContent = S.name; } };
    m.querySelector('.mx').onclick = () => { sfx.back(); close(); };
    m.onclick = (e) => { if (e.target === m) close(); };
    m.querySelectorAll('.sw').forEach((b) => { b.onclick = () => {
      const k = b.dataset.k;
      if (k === 'full') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().then(() => window.screen.orientation?.lock?.('landscape').catch(() => {})).catch(() => {}); b.classList.toggle('on'); sfx.ok(); return; }
      S[k] = !S[k]; b.classList.toggle('on', S[k]); save(); setMuted(!S.sound); setMusic(S.music); initAudio(); sfx.ok();
    }; });
    const pad = m.querySelector('.padsel'); if (pad) pad.onclick = () => { setPadMode(getPadMode() === 'stick' ? 'dpad' : 'stick'); pad.textContent = getPadMode() === 'stick' ? 'ANALOGIQUE' : 'CROIX'; sfx.ok(); };
    G.handler = (k) => { if (k === 'back' || k === 'ok') close(); };
  }
  const main = (k) => { if (k === 'ok') start(); else if (k === 'left' || k === 'right') { sfx.ui(); G.go('heroes'); } };
  G.handler = main;
}
