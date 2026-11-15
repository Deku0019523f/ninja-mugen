// Guide des commandes : onglets TACTILE / MANETTE / CLAVIER. TACTILE = les boutons réels et leurs coûts ; MANETTE et CLAVIER = deux cartes (attaques · défense), schéma, pictogrammes.
import { G, el } from './ctx.js';
import { KEYMAPS, setKey, resetKeys } from '../input.js';
import { isTouch } from '../input.js';
import { ICON, pic, pics } from '../ui/icons.js';
import { pageHead } from '../ui/shell.js';
import { sfx } from '../audio.js';

const chip = (cls, ...ks) => `<span class="chip ${cls}">${pics(...ks)}</span>`;
const txt = (cls, s) => `<span class="chip txt ${cls}">${s}</span>`;
const row = (label, sub, chips, hot = '') => `<div class="crow ${hot}"><div class="cl">${label}${sub ? `<small>${sub}</small>` : ''}</div><div class="cc">${chips}</div></div>`;

const ATTAQUES = row('Chaîne normale', 'Direct · Crochet · Lancer', chip('red', 'o', 'o', 'o'))
  + row('Chaîne haute', 'Uppercut, puis Saut montée : poursuite en l\'air, puis ○ ○ ○', chip('red', 'up', '+', 'o') + chip('red', 'up', '+', 'o'))
  + row('Chaîne basse', 'Jab bas · Tibia · Croc-en-jambe (fait tomber)', chip('red', 'down', '+', 'o') + chip('red', 'down', '+', 'o') + chip('red', 'down', '+', 'o'))
  + row('Chaîne latérale', 'Paume · Paume 2 · finisseur du personnage', chip('red', 'left', '+', 'o') + chip('red', 'left', '+', 'o') + chip('red', 'left', '+', 'o'))
  + row('Charger l\'énergie', 'Immobile, vulnérable', chip('gold', 'tri') + txt('gold', 'maintenu'))
  + row('Shuriken', '□ gratuit · △ + □ : 3 shurikens (20 énergie)', chip('grey', 'sq') + chip('gold', 'tri', '+', 'sq'))
  + row('Chakra Dash', '20 énergie · suit un adversaire lancé · puis ○ ○ ○', chip('gold', 'tri', '+', 'x'))
  + row('Ninjutsu spécial', '25 énergie · ↑ / ↓ = tir diagonal / bas', chip('cy', 'tri', '+', 'o'))
  + row('Technique ultime (Super 1)', '50 énergie', chip('fill', 'tri', 'right', 'tri', 'right', 'o'), 'hot')
  + row('Super 2', '100 énergie · niveau 10 requis', chip('fill', 'tri', 'right', 'tri', 'right', 'sq'), 'hot')
  + row('Éveil', 'Vie sous 35 % : maintenir △ jusqu\'à l\'énergie pleine · une fois par manche', chip('gold', 'tri') + txt('gold', 'maintenu'), 'hot');
const DEFENSE = row('Garde', 'Reculer face à un coup : garde auto', chip('grey', 'r2') + `<span class="or">ou</span>` + chip('grey', 'down'))
  + row('Parade parfaite (contre)', 'Juste avant l\'impact, sans dégâts', txt('gold', 'R2 timing serré'))
  + row('Permutation (bûche)', '3 charges, +1 toutes les 5 s', txt('cy', 'L2 à l\'impact'))
  + row('Projection', 'Passe la garde, au contact', chip('red', 'r2', '+', 'o'))
  + row('Roulade', '', chip('grey', 'down', '+', 'left') + chip('grey', 'down', '+', 'right'))
  + row('Double saut', 'En l\'air', chip('grey', 'x', 'x'))
  + row('Appel soutien ninja', '3 s d\'invulnérabilité, rappel 12 s', chip('cy', 'l1') + `<span class="or">ou</span>` + chip('cy', 'r1'))
  + row('Ultime d\'équipe', '60 énergie · les deux soutiens encadrent l\'adversaire', chip('cy', 'l1', '+', 'r1'), 'hot');
const TACT = [
  ['STICK', 'Gauche : avancer / reculer · ↑ saut (double saut en l\'air) · ↓ garde · ↓ + côté = roulade', ''],
  ['CHARGE', 'Maintenir, immobile et vulnérable : recharge l\'énergie', '0'],
  ['ATTAQUE', 'Appuyer en rafale = chaîne · avec le stick ↑ haute, ↓ basse, ← → latérale', ''],
  ['BOUCLIER', 'Garde · juste avant l\'impact = parade parfaite · + ATTAQUE = projection', ''],
  ['DASH', 'Fonce sur l\'adversaire, où qu\'il soit', '30'],
  ['LANCER', 'Shuriken ou sort · avec le stick ↑ / ↓ : tir diagonal / bas', '25'],
  ['SUPER 1', 'Technique ultime', '50'],
  ['SUPER 2', 'Débloqué au niveau 10 du héros', '100'],
].map(([n, d, c]) => `<div class="trow"><b>${n}</b><span>${d}</span>${c ? `<i>${c} ⚡</i>` : '<i></i>'}</div>`).join('');
const WARN = `<div class="warn">${ICON.warn}<span><b>Brise-garde :</b> chaque coup encaissé en garde remplit la jauge orange ; pleine, la garde casse et vous êtes étourdi.</span></div>`;

// schémas SVG (touches dessinées en trait, étiquettes de zone)
const SYM = { tri: 'M0-5.2L5.4 4.2H-5.4Z', sq: 'M-4.6-4.6h9.2v9.2h-9.2Z', o: 'M-5 0a5 5 0 1010 0a5 5 0 10-10 0', x: 'M-4.6-4.6l9.2 9.2M4.6-4.6l-9.2 9.2' };
const btn = (k, x, y) => `<g transform="translate(${x} ${y})"><circle r="11.5" class="sb"/><path d="${SYM[k]}" class="sy"/></g>`;
const pill = (t, x, y, w = 28) => `<g transform="translate(${x} ${y})"><rect width="${w}" height="13" rx="4" class="sp"/><text x="${w / 2}" y="9.8" text-anchor="middle">${t}</text></g>`;
const dot = (x, y, r, t, c, cost) => `<g transform="translate(${x} ${y})"><circle r="${r}" class="sb"/><text y="3" text-anchor="middle" style="font-size:${r > 12 ? 6 : 5}px">${t}</text>${cost ? `<text x="${r - 1}" y="${-r + 3}" text-anchor="middle" class="cap">${cost}</text>` : ''}</g>`;
const phoneSvg = () => `<svg viewBox="0 0 230 150" class="sch"><rect x="4" y="14" width="222" height="122" rx="16" class="sd"/><rect x="11" y="21" width="208" height="108" rx="9" class="ss"/>
  <circle cx="52" cy="98" r="22" class="sr"/><circle cx="52" cy="98" r="9" class="sk"/>${pill('CHARGE', 34, 52, 36)}
  ${dot(190, 98, 15, 'ATTAQUE')}${dot(156, 108, 11, 'BOUCL.')}${dot(150, 80, 10, 'DASH', '', 30)}${dot(194, 66, 10, 'LANCER', '', 25)}${pill('SUPER 2 · 100', 100, 28, 58)}${pill('SUPER 1 · 50', 164, 28, 50)}
  <text x="52" y="128" text-anchor="middle" class="cap">DÉPLACEMENT</text></svg>`;
const padSvg = () => `<svg viewBox="0 0 230 150" class="sch"><path class="sd" d="M62 44C36 44 20 64 15 98c-3 24 6 38 22 33 12-4 18-17 30-25h96c12 8 18 21 30 25 16 5 25-9 22-33-5-34-21-54-47-54z"/>
  <path class="sp2" d="M52 34h26v7H52zM152 34h26v7h-26z"/>${pill('L2', 50, 12)}${pill('L1', 50, 25, 28)}${pill('R2', 152, 12)}${pill('R1', 152, 25, 28)}
  <path class="dp" d="M54 62h8v-7h8v7h8v8h-8v7h-8v-7h-8z"/><circle cx="96" cy="96" r="11" class="sr"/><circle cx="134" cy="96" r="11" class="sr"/>
  ${btn('tri', 172, 56)}${btn('sq', 152, 76)}${btn('o', 192, 76)}${btn('x', 172, 96)}
  <text x="66" y="52" text-anchor="middle" class="cap">DIRECTION</text><text x="172" y="42" text-anchor="middle" class="cap">ATTAQUES</text></svg>`;

const keyName = (c) => ({ ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' }[c] || c.replace('Key', ''));
const keyTable = () => {
  const L = [['Gauche', 'l'], ['Droite', 'r'], ['Saut (haut)', 'u'], ['Garde (bas)', 'd'], ['o', 'o'], ['x', 'x'], ['sq', 'sq'], ['tri', 'tri'], ['r2', 'r2'], ['l2', 'l2'], ['r1', 'sup1'], ['l1', 'sup2'], ['Dash ennemi', 'rush'], ['Super 1', 's1'], ['Super 2', 's2']];
  return `<table class="kt"><tr><th></th><th>JOUEUR 1</th><th>JOUEUR 2</th></tr>${L.map(([l, i]) => `<tr><td>${ICON[l] || /^[lr][12]$/.test(l) ? pic(l) : l}</td>${[0, 1].map((p) => `<td><kbd style="cursor:pointer" data-p="${p}" data-a="${i}" title="Cliquer pour changer la touche">${keyName(KEYMAPS[p][i])}</kbd></td>`).join('')}</tr>`).join('')}</table><p class="kn">Cliquez sur une touche pour la changer. Sur un clavier AZERTY, W A S D = Z Q S D.</p>`;
};

export default function sControls() {
  const TABS = [['tactile', 'TACTILE'], ['manette', 'MANETTE'], ['clavier', 'CLAVIER']];
  let tab = isTouch() ? 'tactile' : 'clavier';
  const wrap = el('div', 'ctl'), seg = el('div', 'seg');
  const segEls = TABS.map(([id, l]) => { const b = el('b', '', l); b.onclick = () => { tab = id; sfx.ui(); draw(); }; seg.appendChild(b); return b; });
  const head = pageHead({ title: 'GUIDE DES COMMANDES', onBack: () => act('back'), right: seg });
  const body = el('div', 'ctl-body'), foot = el('div', 'ctl-foot');
  const cA = el('section', 'plate gold card'), cC = el('section', 'ctl-mid'), cD = el('section', 'plate cy card');
  cA.innerHTML = `<div class="plate-h gold">${ICON.sword}<span>ATTAQUES &amp; COMBOS</span></div><div class="cbody">${ATTAQUES}</div>`;
  cD.innerHTML = `<div class="plate-h cy">${ICON.shield}<span>DÉFENSE &amp; TÉLÉPORTATION</span></div><div class="cbody">${DEFENSE}${WARN}</div>`;
  const cT = el('section', 'plate gold card ctl-tact');
  cT.innerHTML = `<div class="plate-h gold">${ICON.touch}<span>COMMANDES TACTILES</span></div><div class="tbody"><div class="tsch">${phoneSvg()}</div><div class="tlist">${TACT}</div></div>`;
  body.append(cA, cC, cD, cT); wrap.append(head, body, foot); G.screenEl.appendChild(wrap);

  const draw = () => {
    segEls.forEach((b, i) => b.classList.toggle('on', TABS[i][0] === tab));
    const tact = tab === 'tactile'; body.classList.toggle('tact', tact);
    cC.innerHTML = tab === 'manette' ? padSvg() + '<p>✕ ○ □ △ comme sur PlayStation.</p>'.replace('✕ ○ □ △', 'Boutons ✕ ○ □ △') : keyTable();
    cC.classList.toggle('keys', tab === 'clavier');
    cC.querySelectorAll('kbd[data-a]').forEach((k) => { k.onclick = () => {
      k.textContent = '…'; k.classList.add('wait'); sfx.ui();
      const cap = (e) => { e.preventDefault(); e.stopImmediatePropagation(); removeEventListener('keydown', cap, true); if (e.code !== 'Escape') setKey(+k.dataset.p, k.dataset.a, e.code); draw(); };
      addEventListener('keydown', cap, true);
    }; });
    foot.innerHTML = tab === 'tactile' ? '<span>Le stick apparaît sous ton pouce gauche · plusieurs doigts = plusieurs boutons</span><span>Boutons grisés : pas assez d\'énergie</span>'
      : tab === 'manette' ? '<span>R1 / L1 soutiens · R2 garde · L2 substitution · L3 dash sur l\'ennemi · R3 Super 1 · △ △ □ Super 2</span><span>Croix ou stick gauche pour bouger</span>' : '<span>P ou Échap : pause en combat</span><span><b class="rk" style="cursor:pointer;text-decoration:underline">Réinitialiser les touches</b></span>';
    const rk = foot.querySelector('.rk'); if (rk) rk.onclick = () => { resetKeys(); sfx.ui(); draw(); };
  };
  const act = (k) => {
    if (k === 'back') { sfx.back(); return G.go('title'); }
    if (k === 'left' || k === 'pgl' || k === 'right' || k === 'pgr') { const i = TABS.findIndex((t) => t[0] === tab), n = (i + (k === 'left' || k === 'pgl' ? TABS.length - 1 : 1)) % TABS.length; tab = TABS[n][0]; sfx.ui(); draw(); }
  };
  G.handler = act; draw();
}
