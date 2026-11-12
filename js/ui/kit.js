// Petits éléments d'interface partagés par l'accueil, les héros, les modes et le cadeau quotidien (style parchemin / or)
import { el } from '../screens/ctx.js';
import { prog } from '../progress.js';

export const LOCK = '<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="5" y="10" width="14" height="11" rx="2" fill="#f3e3b0" stroke="#2a1a08" stroke-width="2"/><path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke="#2a1a08" stroke-width="2.4"/></svg>';
export const GIFT = '<svg viewBox="0 0 48 48" width="100%" height="100%"><rect x="6" y="20" width="36" height="22" rx="3" fill="#e0402f" stroke="#2a1a08" stroke-width="2.5"/><rect x="4" y="14" width="40" height="9" rx="2" fill="#ff6a4a" stroke="#2a1a08" stroke-width="2.5"/><rect x="21" y="14" width="6" height="28" fill="#ffd44a" stroke="#2a1a08" stroke-width="1.5"/><path d="M24 14c-6-9-14-4-9 0M24 14c6-9 14-4 9 0" fill="none" stroke="#2a1a08" stroke-width="2.5"/></svg>';

// pastille de monnaie : icône + valeur + bouton « + »
export function pills(onPlus) {
  const w = el('div', 'pills');
  w.innerHTML = `<div class="pill"><i class="ic gem"></i><b data-k="g">${prog.gems}</b><button class="plus">+</button></div><div class="pill"><i class="ic gold"></i><b data-k="c">${prog.coins}</b><button class="plus">+</button></div>`;
  w.querySelectorAll('.plus').forEach((b) => { b.onclick = onPlus || null; });
  w.refresh = () => { w.querySelector('[data-k=g]').textContent = prog.gems; w.querySelector('[data-k=c]').textContent = prog.coins; };
  return w;
}
// bouton retour carré (flèche double)
export const backBtn = (fn) => { const b = el('button', 'kit-back', '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 6L5 12l7 6zM20 6l-7 6 7 6z" fill="#fff"/></svg>'); b.onclick = fn; return b; };
