// État partagé entre les écrans (réglages, partie en cours, routeur)
export const DIFF = ['Novice', 'Facile', 'Normal', 'Difficile', 'Maître'];
export const G = {
  S: { fmt: 1, vs: 'cpu', diff: 3, need: 2, timer: 0, sound: true, music: true, sup: true },
  run: null, mode: 'arcade', handler: null, ticker: null, screenEl: null, view: null,
  go: () => {}, launch: () => {}, nextOpponent: () => {},
};
try { Object.assign(G.S, JSON.parse(localStorage.getItem('ninja-mugen') || '{}')); } catch (e) { /* ignore */ }
export const save = () => { try { localStorage.setItem('ninja-mugen', JSON.stringify(G.S)); } catch (e) { /* ignore */ } };
export const el = (tag, cls, html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
