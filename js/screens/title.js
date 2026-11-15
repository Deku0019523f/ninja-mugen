// Accueil : le héros choisi au centre sur son socle, profil et monnaies en haut, boutons en bas, gros bouton COMBAT.
import { G, el, save } from './ctx.js';
import { ROSTER } from '../data/roster.js';
import { ICON } from '../ui/icons.js';
import { drawFighter, drawPortrait, poseFor } from '../render/sprites.js';
import { prog } from '../progress.js';
import { quests } from '../quests.js';
import { tabWindow } from '../ui/win.js';
import { pills, GIFT } from '../ui/kit.js';
import { setMuted, setMusic, initAudio, sfx } from '../audio.js';

export default function sTitle() {
  const hid = Math.min(ROSTER.length - 1, G.S.hero || 0), hc = ROSTER[hid], dl = prog.daily(), pq = quests.pending(), nGift = (dl.can ? 1 : 0) + pq.o, nQ = pq.q + pq.a;
  const root = el('div', 'home');
  root.innerHTML = `<div class="hm-logo">NINJA MUGEN</div>
    <div class="hm-prof"><canvas class="pf-av" width="56" height="56"></canvas><div><b>${(G.S.name || 'Ninja').replace(/</g, '')}</b><span>${ICON.sword} ${prog.power()}</span></div></div>
    <div class="hm-cur"></div>
    <div class="hm-left"><button class="tile" data-to="daily"><span>${GIFT}</span><em>CADEAU</em>${nGift ? `<i class="nb">${nGift}</i>` : ''}</button><button class="tile" data-to="quests"><span><svg viewBox="0 0 40 40" width="52" height="52"><rect x="7" y="5" width="26" height="30" rx="3" fill="#f4dfab" stroke="#3a2410" stroke-width="2.5"/><path d="M12 13h16M12 19h16M12 25h10" stroke="#8a5a22" stroke-width="2.5" stroke-linecap="round"/><path d="M22 28l4 4 8-9" fill="none" stroke="#2fb818" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><em>QUÊTES</em>${nQ ? `<i class="nb">${nQ}</i>` : ''}</button></div>
    <div class="plat p2"><i>2</i></div><div class="plat p3"><i>3</i></div>
    <div class="hm-hero"><div class="plat"><i>1</i></div><canvas width="256" height="256"></canvas></div>
    <div class="hm-bar"></div>
    <button class="hm-start" style="width:100px;height:auto;bottom:16px"><img src="assets/ui/btn_start.png" alt="START" style="width:100%;height:auto;display:block;filter:drop-shadow(0 4px 6px #000a)"></button>`;
  G.screenEl.appendChild(root);
  drawPortrait(root.querySelector('.pf-av').getContext('2d'), hc, 56);
  root.querySelector('.hm-cur').appendChild(pills());
  root.querySelectorAll('.tile').forEach((t) => { t.onclick = () => { sfx.ok(); G.go(t.dataset.to); }; });

  // héros animé (repos) — rendu à 2× pour rester net
  const cv = root.querySelector('.hm-hero canvas'), g = cv.getContext('2d');
  G.ticker = () => {
    const t = performance.now() / 16, { pose } = poseFor({ state: 'idle', t: 0, vx: 0, vy: 0, move: null }, t);
    g.setTransform(2, 0, 0, 2, 0, 0); drawFighter(g, hc, pose, { clock: t });
  };

  // barre d'icônes en bas à gauche : un bouton = une option (les modes de jeu sont tous dans COMBAT)
  const bar = root.querySelector('.hm-bar'); bar.style.bottom = '14px';
  // HEROES et PVP (multijoueur) : badges image de la planche (le texte est dans l'image) ; les autres gardent l'icône dessinée
  [['assets/ui/btn_heroes.png', 'HÉROS', () => G.go('heroes')], ['assets/ui/btn_pvp.png', 'MULTIJOUEUR', () => { G.mode = 'online'; G.go('online'); }], ['assets/ui/chest.png', 'BOUTIQUE', () => G.go('shop')], ['pad', 'COMMANDES', () => G.go('controls')], ['sliders', 'RÉGLAGES', () => settings()]].forEach(([ic, lb, fn]) => {
    const img = ic.startsWith('assets/'), b = el('button', 'dia' + (img ? ' dia-img' : ''), img ? `<img src="${ic}" alt="${lb}" style="width:64px;height:auto;display:block;filter:drop-shadow(0 3px 3px #000a)">` : `<span class="dm"><i>${ICON[ic]}</i></span><em>${lb}</em>`);
    b.onclick = () => { sfx.ok(); fn(); }; bar.appendChild(b);
  });
  const start = () => { sfx.ok(); G.go('modes'); };
  root.querySelector('.hm-start').onclick = start;

  // fenêtre de réglages : profil, sons, musique (seul endroit où ils se règlent)
  function settings() {
    const S = G.S;
    let name = (S.name || 'Ninja').replace(/"/g, '');
    const close = () => { const v = name.trim(); if (v) S.name = v.slice(0, 14); save(); win.m.remove(); G.handler = main; if (v) root.querySelector('.hm-prof b').textContent = S.name; };
    const win = tabWindow({ wide: false, tabs: [['s', 'RÉGLAGES', null]], close, draw(id, body) {
      body.innerHTML = `<div class="st-prof"><div class="st-av"><canvas width="72" height="72"></canvas></div><label class="st-nm"><input maxlength="14" value="${name}"><i>✎</i></label></div>
        <div class="st-row"><span class="mi">${ICON.sound}</span><b>Effets sonores</b><button class="sw${S.sound ? ' on' : ''}" data-k="sound"><i></i></button></div>
        <div class="st-row"><span class="mi">${ICON.swirl}</span><b>Musique</b><button class="sw${S.music ? ' on' : ''}" data-k="music"><i></i></button></div>
        <div class="st-row"><span class="mi">🌐</span><b>Langue</b><select class="st-lg"><option>Français</option></select></div>`;
      drawPortrait(body.querySelector('canvas').getContext('2d'), hc, 72);
      body.querySelector('input').oninput = (e) => { name = e.target.value; };
      body.querySelectorAll('.sw').forEach((b) => { b.onclick = () => { const k = b.dataset.k; S[k] = !S[k]; b.classList.toggle('on', S[k]); save(); setMuted(!S.sound); setMusic(S.music); initAudio(); sfx.ok(); }; });
    } });
    win.m.querySelector('.mx').onclick = () => { sfx.back(); close(); };
    G.handler = (k) => { if (k === 'back') close(); };
  }
  const main = (k) => { if (k === 'ok') start(); else if (k === 'left' || k === 'right') { sfx.ui(); G.go('heroes'); } };
  G.handler = main;
}
