// Petits éléments d'interface partagés par l'accueil, les héros, les modes et le cadeau quotidien (style parchemin / or)
import { el } from '../screens/ctx.js';
import { prog } from '../progress.js';

export const LOCK = '<img src="assets/ui/lock.png" alt="" style="width:100%;height:100%;object-fit:contain">';
export const GIFT = '<img src="assets/ui/gift.png" alt="" style="width:100%;height:100%;object-fit:contain">';

// pastille de monnaie : icône + valeur (simple affichage ; le cadeau quotidien a son propre bouton)
export function pills() {
  const w = el('div', 'pills');
  w.innerHTML = `<div class="pill"><i class="ic gem"></i><b data-k="g">${prog.gems}</b></div><div class="pill"><i class="ic gold"></i><b data-k="c">${prog.coins}</b></div>`;
  w.refresh = () => { w.querySelector('[data-k=g]').textContent = prog.gems; w.querySelector('[data-k=c]').textContent = prog.coins; };
  return w;
}
// bouton retour carré (flèche double)
export const backBtn = (fn) => { const b = el('button', 'kit-back', '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 6L5 12l7 6zM20 6l-7 6 7 6z" fill="#fff"/></svg>'); b.onclick = fn; return b; };
