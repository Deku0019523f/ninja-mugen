// Composant « liste de menu » (clavier, manette, souris et tactile).
// Deux présentations : page (en-tête RETOUR / titre, lignes à gauche, description à droite) ou panneau centré (résultat, pause).
import { G, el } from '../screens/ctx.js';
import { sfx } from '../audio.js';
import { ICON } from './icons.js';
import { pageHead } from './shell.js';

export function listMenu(items, { title, sub, onBack, desc, cls = '', page = false, tag = '' } = {}) {
  let idx = 0;
  const wrap = el('div', page ? 'lm page ' + cls : 'panel ' + cls);
  let list, d, dl;
  if (page) {
    wrap.appendChild(pageHead({ title, onBack: onBack && (() => act('back')), right: tag }));
    const body = el('div', 'lm-body'), side = el('aside', 'plate cy lm-side');
    list = el('div', 'list'); dl = el('h4'); d = el('p', 'desc'); side.append(dl, d); body.append(list, side); wrap.appendChild(body);
  } else {
    if (title) wrap.appendChild(el('h2', '', title));
    if (sub) wrap.appendChild(el('div', 'sub', sub));
    list = el('div', 'list'); d = el('div', 'desc'); wrap.append(list, d);
  }
  G.screenEl.appendChild(wrap);
  const rows = items.map((it, i) => {
    const r = el('div', 'row cur' + (it.go ? ' go' : ''));
    r.innerHTML = '<span class="lb"></span><span class="val"><b class="ch l">' + ICON.left + '</b><span class="v"></span><b class="ch r">' + ICON.right + '</b></span>';
    r.onmouseenter = () => { if (idx !== i) { idx = i; draw(); } };
    r.onclick = () => { idx = i; act('ok'); };
    r.querySelector('.ch.l').onclick = (e) => { e.stopPropagation(); idx = i; act('left'); };
    r.querySelector('.ch.r').onclick = (e) => { e.stopPropagation(); idx = i; act('right'); };
    list.appendChild(r); return r;
  });
  const draw = () => rows.forEach((r, i) => {
    const it = items[i]; r.classList.toggle('sel', i === idx);
    const lab = typeof it.label === 'function' ? it.label() : it.label;
    r.querySelector('.lb').innerHTML = it.go ? lab + ICON.chev : lab;
    const v = it.get ? it.get() : '', val = r.querySelector('.val');
    val.style.display = v ? 'flex' : 'none'; r.querySelector('.v').innerHTML = v;
    r.querySelector('.ch.l').style.visibility = it.left ? 'visible' : 'hidden'; r.querySelector('.ch.r').style.visibility = it.right ? 'visible' : 'hidden';
    if (i === idx) { if (dl) dl.textContent = lab.replace(/^▶\s*/, ''); d.textContent = it.desc || desc || ''; }
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
  G.handler = act; draw();
  return wrap;
}
