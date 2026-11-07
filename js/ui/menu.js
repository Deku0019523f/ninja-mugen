// Composant « liste de menu » (clavier, manette, souris et tactile)
import { G, el } from '../screens/ctx.js';
import { sfx } from '../audio.js';

export function listMenu(items, { title, sub, onBack, desc, cls = '' } = {}) {
  let idx = 0;
  const wrap = el('div', 'panel ' + cls);
  if (title) wrap.appendChild(el('h2', '', title));
  if (sub) wrap.appendChild(el('div', 'sub', sub));
  const list = el('div', 'list'); wrap.appendChild(list);
  const d = el('div', 'desc'); wrap.appendChild(d);
  G.screenEl.appendChild(wrap);
  const rows = items.map((it, i) => {
    const r = el('div', 'row'); r.innerHTML = '<span class="lb"></span><span class="val"></span>';
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
  G.handler = act; draw();
  return wrap;
}
