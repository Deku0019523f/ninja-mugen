import { G } from './ctx.js';
import { listMenu } from '../ui/menu.js';
import { sfx } from '../audio.js';
import { NODES } from '../story.js';

// fin d'un combat d'Histoire : les étoiles s'allument une par une, pluie de pièces / germes si gain
const FX = `.panel .stars i{font-style:normal;display:inline-block;color:#4a3a22;transition:none}.panel .stars i.on{color:#ffd24a;animation:rsp .5s cubic-bezier(.2,1.8,.4,1)}
@keyframes rsp{0%{transform:scale(2.4);opacity:0}100%{transform:scale(1);opacity:1}}
.rs-rain{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:30}.rs-rain i{position:absolute;top:-30px;width:22px;height:22px;animation:rsf 1.6s ease-in forwards}
@keyframes rsf{to{transform:translateY(480px) rotate(360deg)}}`;
function celebrate(stars, gain) {
  const panel = document.querySelector('.panel .stars'); if (!panel) return;
  const st = document.createElement('style'); st.textContent = FX; panel.parentNode.appendChild(st);
  panel.innerHTML = [0, 1, 2].map((k) => `<i>${k < stars ? '★' : '☆'}</i>`).join(' ');
  panel.querySelectorAll('i').forEach((e, k) => { if (k < stars) setTimeout(() => { if (!e.isConnected) return; e.classList.add('on'); sfx.ui(); }, 350 + k * 450); });
  if (gain && (gain.c || gain.g)) setTimeout(() => {
    const rain = document.createElement('div'); rain.className = 'rs-rain';
    for (let k = 0; k < 22; k++) { const c = document.createElement('i'); c.className = 'ic ' + (gain.g && k % 4 === 0 ? 'gem' : 'gold'); c.style.left = (Math.random() * 96) + '%'; c.style.animationDelay = (Math.random() * 0.9) + 's'; rain.appendChild(c); }
    G.screenEl.appendChild(rain); setTimeout(() => rain.remove(), 3000);
  }, 350 + stars * 450);
}

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
    listMenu(items, { title, sub, onBack: () => G.go('story') }); (d.win ? sfx.win : sfx.lose)(); return celebrate(d.story.stars, d.gain);
  }
  if (tour) { items.push({ label: 'Nouveau tournoi', ok: () => { sfx.ok(); G.go('select'); } }, { label: 'Menu principal', ok: () => { sfx.ok(); G.go('title'); } }); return (listMenu(items, { title, sub, onBack: () => G.go('title') }), (d.win ? sfx.win : sfx.lose)()); }
  if (!arc && !sur) items.push({ label: 'Revanche', ok: () => { sfx.ok(); G.launch(); } });
  else items.push({ label: 'Rejouer le mode', ok: () => { sfx.ok(); G.go('select'); } });
  items.push({ label: 'Changer de combattants', ok: () => { sfx.ok(); G.go('select'); } }, { label: 'Menu principal', ok: () => { sfx.ok(); G.go('title'); } });
  listMenu(items, { title, sub, onBack: () => G.go('title') });
  (d.win ? sfx.win : sfx.lose)();
}
