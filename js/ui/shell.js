// « Shell » : barre de navigation permanente (ACCUEIL · ROSTER · RÈGLES · DÉCORS · TOUCHES + son), voile derrière les menus,
// transition « coup de sabre », bulle d'info. Les écrans se dessinent dans #screen, juste sous la barre.
import { G, el, save } from '../screens/ctx.js';
import { MODES } from '../modes/index.js';
import { ICON, SHURIKEN } from './icons.js';
import { sfx, setMuted, setMusic, initAudio } from '../audio.js';

const TABS = [['accueil', 'ACCUEIL', 'title'], ['roster', 'ROSTER', 'select'], ['regles', 'RÈGLES', 'setup'], ['decors', 'DÉCORS', 'stage'], ['touches', 'TOUCHES', 'controls']];
// écran → [onglet actif, style du voile]. Les écrans absents (accueil, vs, résultat, combat…) n'ont pas de barre.
const SCREEN = { select: ['roster', 'on heavy'], setup: ['regles', 'on blur'], stage: ['decors', 'on heavy'], controls: ['touches', 'on blur'], options: [null, 'on blur'] };
const VEIL_ONLY = { title: 'on', modes: 'on', heroes: 'on heavy', daily: 'on blur', result: 'on blur', online: 'on blur', onlineResult: 'on blur' };

let ui, bar, veil, slashEl, toastEl, tabEls = {}, snd, hideT = 0, slashT = 0;

// Un onglet est grisé quand l'écran n'a pas de sens sans l'état précédent (décor = après le choix des combattants).
function tabState(id) {
  if (id !== 'decors') return { ok: true };
  const run = G.run;
  if (!run || !run.p1 || !run.p1.length) return { ok: false, why: 'Choisissez d\'abord vos combattants dans ROSTER.' };
  if (MODES[run.mode].series) return { ok: false, why: 'Le décor est imposé dans ce mode.' };
  return { ok: true };
}

function toast(msg) {
  toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(hideT); hideT = setTimeout(() => toastEl.classList.remove('on'), 2200);
}

function sndIcon() { snd.innerHTML = (G.S.sound || G.S.music) ? ICON.sound : ICON.mute; snd.classList.toggle('off', !(G.S.sound || G.S.music)); }

export const shell = {
  mount(uiEl) {
    ui = uiEl;
    document.documentElement.style.setProperty('--shuriken', `url("${SHURIKEN}")`);
    veil = el('div'); veil.id = 'veil'; document.body.insertBefore(veil, ui);
    bar = el('div'); bar.id = 'shell';
    bar.innerHTML = `<div class="sh-brand"><span class="sh-logo">${ICON.bolt}</span><span class="sh-name">NINJA MUGEN</span></div><nav class="sh-tabs"></nav><button class="sh-snd" aria-label="Son"></button>`;
    const nav = bar.querySelector('.sh-tabs');
    for (const [id, label, screen] of TABS) {
      const t = el('button', 'sh-tab', label); t.dataset.tab = id;
      t.onclick = () => {
        const st = tabState(id); if (!st.ok) { sfx.back(); return toast(st.why); }
        if (G.cur === screen) return; sfx.ok(); G.go(screen);
      };
      nav.appendChild(t); tabEls[id] = t;
    }
    snd = bar.querySelector('.sh-snd');
    snd.onclick = () => { const on = !(G.S.sound || G.S.music); G.S.sound = G.S.music = on; save(); setMuted(!G.S.sound); setMusic(G.S.music); initAudio(); sndIcon(); if (on) sfx.ok(); };
    sndIcon();
    slashEl = el('div'); slashEl.id = 'slash'; slashEl.innerHTML = '<i></i><b></b>';
    toastEl = el('div', 'toast');
    ui.append(bar, slashEl, toastEl);
  },

  // appelé par le routeur à chaque changement d'écran
  setScreen(name) {
    const def = SCREEN[name], online = G.mode === 'online' && (name === 'select' || name === 'stage');   // en ligne : pas d'onglets (ils casseraient la partie)
    ui.classList.toggle('shelled', !!def && !online);
    bar.style.display = def && !online ? 'flex' : 'none';
    const v = def ? def[1] : VEIL_ONLY[name];
    veil.className = v || '';
    for (const [id] of TABS) { const t = tabEls[id]; t.classList.toggle('on', !!def && def[0] === id); t.classList.toggle('dis', !tabState(id).ok); }
    sndIcon();
  },

  fit(vw) { ui.classList.toggle('compact', vw < 820); },

  slash() {
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    slashEl.classList.remove('go'); void slashEl.offsetWidth; slashEl.classList.add('go');
    clearTimeout(slashT); slashT = setTimeout(() => slashEl.classList.remove('go'), 380);
  },
  toast,
};

// En-tête de page : bouton retour | titre (+ sous-titre) | zone libre à droite
export function pageHead({ title, sub = '', onBack, right = '' }) {
  const h = el('div', 'pg-head'), l = el('div', 'l'), c = el('h2'), r = el('div', 'r');
  c.innerHTML = title + (sub ? `<small>${sub}</small>` : '');
  if (onBack) { const b = el('button', 'btn', ICON.back + '<span>RETOUR</span>'); b.onclick = onBack; l.appendChild(b); }
  if (typeof right === 'string') r.innerHTML = right; else if (right) r.appendChild(right);
  h.append(l, c, r); return h;
}
