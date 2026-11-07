import { G, el } from './ctx.js';
import { listMenu } from '../ui/menu.js';
import { MENU } from '../modes/index.js';
import { sfx } from '../audio.js';

export default function sTitle() {
  G.screenEl.appendChild(el('div', 'logo', '<small>MUGEN ARENA</small><h1>NINJA<br>MUGEN</h1><em>56 combattants · 1v1 · 2v2</em>'));
  listMenu(MENU.map((m) => ({ label: m.label, desc: m.desc, ok: () => { sfx.ok(); G.mode = m.id; G.go(m.id === 'options' ? 'options' : m.id === 'controls' ? 'controls' : 'setup'); } })), { cls: 'main' });
  G.screenEl.appendChild(el('div', 'foot', 'Flèches / ZQSD + Entrée · Manette et tactile pris en charge'));
}
