// Fenêtre à onglets (façon fiche jaune : onglets bruns sur l'en-tête, croix rouge) partagée par Cadeau, Quêtes et Réglages
import { G, el } from '../screens/ctx.js';
import { sfx } from '../audio.js';

export const rw = (r) => `${r.c ? `<span class="wr">${r.c}<i class="ic gold"></i></span>` : ''}${r.g ? `<span class="wr g">${r.g}<i class="ic gem"></i></span>` : ''}`;
export const toast = (box, txt) => { let t = box.querySelector('.wtoast'); if (!t) { t = el('div', 'wtoast'); box.appendChild(t); } t.textContent = txt; t.classList.remove('go'); void t.offsetWidth; t.classList.add('go'); };

// tabs : [[id, libellé, nbPastilles()]] ; draw(tabId, body, win) remplit le corps ; close() ferme (retour à l'accueil par défaut)
export function tabWindow({ tabs, tab = 0, draw, wide = true, close = () => G.go('title') }) {
  const m = el('div', 'modal'), box = el('div', 'mbox' + (wide ? ' wide' : '')), head = el('div', 'mhead tabs'), body = el('div', 'mbody parch qbody');
  const x = el('button', 'mx', '✕'); head.appendChild(x); box.append(head, body); m.appendChild(box); G.screenEl.appendChild(m);
  const win = { m, box, body, tab, refresh() {
    head.querySelectorAll('.mtab').forEach((b) => b.remove());
    tabs.forEach(([id, label, badge], i) => { const b = el('button', 'mtab' + (i === win.tab ? ' on' : ''), label); const n = badge ? badge() : 0; if (n) b.appendChild(el('i', 'nb', n)); b.onclick = () => { win.tab = i; sfx.ui(); win.refresh(); }; head.insertBefore(b, x); });
    body.innerHTML = ''; draw(tabs[win.tab][0], body, win);
  } };
  const out = () => { sfx.back(); close(); };
  x.onclick = out; m.onclick = (e) => { if (e.target === m) out(); };
  G.handler = (k) => { if (k === 'back') out(); else if (k === 'left') { win.tab = (win.tab + tabs.length - 1) % tabs.length; sfx.ui(); win.refresh(); } else if (k === 'right') { win.tab = (win.tab + 1) % tabs.length; sfx.ui(); win.refresh(); } };
  win.refresh(); return win;
}
