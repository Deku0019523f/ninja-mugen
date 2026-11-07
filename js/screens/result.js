import { G } from './ctx.js';
import { listMenu } from '../ui/menu.js';
import { sfx } from '../audio.js';

export default function sResult(d) {
  const run = G.run, arc = run.mode === 'arcade', sur = run.mode === 'survival';
  let title, sub;
  if (arc) { title = d.win ? 'FÉLICITATIONS !' : 'DÉFAITE'; sub = d.win ? `Vous avez vaincu l'Ultime Maître !<br>Score : <b>${run.score}</b>` : `Éliminé au combat ${run.fight + 1} / 8<br>Score : <b>${run.score}</b>`; }
  else if (sur) { title = 'FIN DE LA SÉRIE'; sub = `${run.fight} victoire${run.fight > 1 ? 's' : ''}<br>Score : <b>${run.score}</b>`; let best = 0; try { best = +localStorage.getItem('ninja-mugen-best') || 0; if (run.score > best) { localStorage.setItem('ninja-mugen-best', run.score); best = run.score; } } catch (e) { /* ignore */ } sub += `<br>Meilleur : ${best}`; }
  else { title = d.win ? 'VICTOIRE !' : 'DÉFAITE'; sub = `Manches : ${d.wins[0]} — ${d.wins[1]}`; }
  const items = [];
  if (!arc && !sur) items.push({ label: 'Revanche', ok: () => { sfx.ok(); G.launch(); } });
  else items.push({ label: 'Rejouer le mode', ok: () => { sfx.ok(); G.go('select'); } });
  items.push({ label: 'Changer de combattants', ok: () => { sfx.ok(); G.go('select'); } }, { label: 'Menu principal', ok: () => { sfx.ok(); G.go('title'); } });
  listMenu(items, { title, sub, onBack: () => G.go('title') });
  (d.win ? sfx.win : sfx.lose)();
}
