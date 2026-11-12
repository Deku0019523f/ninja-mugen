import { G } from './ctx.js';
import { listMenu } from '../ui/menu.js';
import { sfx } from '../audio.js';
import { NODES } from '../story.js';

export default function sResult(d) {
  const run = G.run, arc = run.mode === 'arcade', sur = run.mode === 'survival', tour = run.mode === 'tournament', sty = run.mode === 'story';
  let title, sub;
  if (arc) { title = d.win ? 'FÉLICITATIONS !' : 'DÉFAITE'; sub = d.win ? `Vous avez vaincu l'Ultime Maître !<br>Score : <b>${run.score}</b>` : `Éliminé au combat ${run.fight + 1} / 8<br>Score : <b>${run.score}</b>`; }
  else if (tour) { title = d.win ? 'CHAMPION !' : 'ÉLIMINÉ'; sub = d.win ? 'Vous remportez le tournoi !' : `Éliminé en ${['huitième de finale', 'quart de finale', 'demi-finale', 'finale'][run.fight] || 'finale'}`; }
  else if (sty) { const r = d.story; title = r.win ? 'VICTOIRE !' : 'DÉFAITE'; sub = `<span class="stars">${[0, 1, 2].map((k) => (k < r.stars ? '★' : '☆')).join(' ')}</span>`; if (r.win) { const n = NODES[run.si]; sub += '<br>' + n.obj.map((o, k) => `${r.objs[k] ? '✔' : '✘'} ${o.t}`).join('<br>'); } }
  else if (sur) { title = 'FIN DE LA SÉRIE'; sub = `${run.fight} victoire${run.fight > 1 ? 's' : ''}<br>Score : <b>${run.score}</b>`; let best = 0; try { best = +localStorage.getItem('ninja-mugen-best') || 0; if (run.score > best) { localStorage.setItem('ninja-mugen-best', run.score); best = run.score; } } catch (e) { /* ignore */ } sub += `<br>Meilleur : ${best}`; }
  else { title = d.win ? 'VICTOIRE !' : 'DÉFAITE'; sub = `Manches : ${d.wins[0]} — ${d.wins[1]}`; }
  const gg = d.gain || (d.done && run.gain);
  if (gg && (gg.c || gg.g)) sub += `<br><span class="gain">+${gg.c} pièces${gg.g ? ` · +${gg.g} gemmes` : ''}</span>`;
  const items = [];
  if (sty) {
    if (d.story.next) items.push({ label: 'Combat suivant', ok: () => { sfx.ok(); G.go('story', { go: 1, diff: run.sd, i: run.si + 1 }); } });
    items.push({ label: 'Réessayer', ok: () => { sfx.ok(); G.go('vs'); } }, { label: 'Carte', ok: () => { sfx.ok(); G.go('story'); } }, { label: 'Menu principal', ok: () => { sfx.ok(); G.go('title'); } });
    return (listMenu(items, { title, sub, onBack: () => G.go('story') }), (d.win ? sfx.win : sfx.lose)());
  }
  if (tour) { items.push({ label: 'Nouveau tournoi', ok: () => { sfx.ok(); G.go('select'); } }, { label: 'Menu principal', ok: () => { sfx.ok(); G.go('title'); } }); return (listMenu(items, { title, sub, onBack: () => G.go('title') }), (d.win ? sfx.win : sfx.lose)()); }
  if (!arc && !sur) items.push({ label: 'Revanche', ok: () => { sfx.ok(); G.launch(); } });
  else items.push({ label: 'Rejouer le mode', ok: () => { sfx.ok(); G.go('select'); } });
  items.push({ label: 'Changer de combattants', ok: () => { sfx.ok(); G.go('select'); } }, { label: 'Menu principal', ok: () => { sfx.ok(); G.go('title'); } });
  listMenu(items, { title, sub, onBack: () => G.go('title') });
  (d.win ? sfx.win : sfx.lose)();
}
