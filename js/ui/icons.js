// Pictogrammes SVG (trait = currentColor) : touches de manette, flèches, icônes de menu.
const S = (b, v = 24) => `<svg viewBox="0 0 ${v} ${v}" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;

export const ICON = {
  o: S('<circle cx="12" cy="12" r="7.5"/>'),
  x: S('<path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/>'),
  sq: S('<rect x="5" y="5" width="14" height="14" rx="1.5"/>'),
  tri: S('<path d="M12 4.5l8 14H4z"/>'),
  right: S('<path d="M8 5l9 7-9 7z" fill="currentColor"/>'),
  up: S('<path d="M12 5l7 9H5z" fill="currentColor"/>'),
  down: S('<path d="M12 19l7-9H5z" fill="currentColor"/>'),
  left: S('<path d="M5 12l9-7v14z" fill="currentColor"/>'),
  plus: S('<path d="M12 6v12M6 12h12"/>'),
  back: S('<path d="M10 6l-6 6 6 6M4 12h16"/>'),
  chev: S('<path d="M9 5l7 7-7 7"/>'),
  swords: S('<path d="M4 4l9 9M20 4l-9 9M13 13l3 3-1.5 1.5-3-3M11 13l-3 3 1.5 1.5 3-3M3 21l3-3M21 21l-3-3"/>'),
  sword: S('<path d="M5 19L18 6l1-3-3 1L3 17l2 2zM4 20l3-3"/>'),
  shield: S('<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>'),
  pad: S('<path d="M7 8h10a4 4 0 014 4l1 5a2.5 2.5 0 01-4.5 1.5L16 16H8l-1.5 2.5A2.5 2.5 0 012 17l1-5a4 4 0 014-4zM8 10.5v3M6.5 12h3"/><circle cx="16" cy="11.5" r=".6"/><circle cx="18" cy="13" r=".6"/>'),
  sliders: S('<path d="M5 4v16M12 4v16M19 4v16M3 9h4M10 14h4M17 8h4"/>'),
  sound: S('<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5zM15.5 9a4 4 0 010 6M18 6.5a8 8 0 010 11"/>'),
  mute: S('<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5zM16 9.5l5 5M21 9.5l-5 5"/>'),
  dice: S('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1" fill="currentColor"/><circle cx="15" cy="9" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/><circle cx="9" cy="15" r="1.1" fill="currentColor"/><circle cx="15" cy="15" r="1.1" fill="currentColor"/>'),
  help: S('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.7-1.5 1.1-1.5 2.3M12 17.2v.1"/>'),
  warn: S('<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.4v.1"/>'),
  bolt: S('<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>'),
  key: S('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.1M11 10h.1M15 10h.1M7 14h10"/>'),
  touch: S('<path d="M9 11V5.5a1.5 1.5 0 013 0V11M12 11V9.5a1.5 1.5 0 013 0V12M15 12v-1a1.5 1.5 0 013 0v4.5c0 3-2 5-5 5h-1.5c-2 0-3.2-.9-4.2-2.3L5.5 14c-.6-1 .6-2 1.6-1.3L9 14V11"/>'),
  fist: S('<path d="M7 10V7.5a1.5 1.5 0 013 0V9M10 9V7a1.5 1.5 0 013 0v2M13 9V7.5a1.5 1.5 0 013 0V10M16 10V9a1.5 1.5 0 013 0v4c0 4-3 7-7 7s-6-2.5-6-5.5V12a1.5 1.5 0 013 0z"/>'),
  swirl: S('<path d="M12 12m-1.5 0a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0M12 6a6 6 0 016 6 4.5 4.5 0 01-4.5 4.5 3 3 0 01-3-3"/>'),
  net: S('<path d="M3 9a14 14 0 0118 0M6 12.5a9.5 9.5 0 0112 0M9 16a5 5 0 016 0"/><circle cx="12" cy="19.2" r="1.1" fill="currentColor"/>'),
  star: S('<path d="M12 3.5l2.6 5.6 6 .7-4.5 4.1 1.3 6L12 16.9 6.6 19.9l1.3-6L3.4 9.8l6-.7z"/>'),
  check: S('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
};

// Shuriken (curseur de menu) : fond de page en data-URI, utilisé par le CSS
export const SHURIKEN = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16 1l4.2 10.3L31 16l-10.8 4.7L16 31l-4.2-10.3L1 16l10.8-4.7z" fill="#ff7a1a" stroke="#ffd27a" stroke-width="1.4" stroke-linejoin="round"/><circle cx="16" cy="16" r="3.2" fill="#0a0c1c" stroke="#ffd27a" stroke-width="1.2"/></svg>');

// Pastille de touche : pic('o') → <span class="pic pic-o">…</span>
const LABELS = { l1: 'L1', r1: 'R1', l2: 'L2', r2: 'R2' };
export function pic(k) {
  if (ICON[k]) return `<span class="pic pic-${k}">${ICON[k]}</span>`;
  return `<span class="pic pic-txt">${LABELS[k] || k}</span>`;
}
// Combinaison : pics('tri', '+', 'o') → suite de pictos et de séparateurs
export function pics(...ks) { return ks.map((k) => (k === '+' || k === ',' ? `<span class="pic-sep">${k}</span>` : pic(k))).join(''); }
