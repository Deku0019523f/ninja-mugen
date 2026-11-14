// ============================================================
//  HUD (DOM) : barres de vie angulaires, chakra, jauge de garde, charges de substitution, chrono ∞, combos, bannières,
//  cut-in super, soutiens R1 / L1
// ============================================================
import { ARCH, ROSTER } from '../data/roster.js';
import { SUPERS } from '../game/moves.js';
import { SUP_CD, supReady } from '../game/support.js';
import { drawPortrait } from '../render/sprites.js';
import { GROUND } from '../render/view.js';

const el = (tag, cls, html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };

export class Hud {
  constructor(root) { this.root = root; this.root.innerHTML = ''; this.built = false; this.bannerT = 0; this.cut = 0; this.combo = [0, 0]; this.comboT = [0, 0]; this.hpPrev = new WeakMap(); this.floats = 0; }

  build(match) {
    const w = match.world; this.root.innerHTML = ''; this.team = [];
    const top = el('div', 'hud-top'); this.root.appendChild(top);
    for (const t of [0, 1]) {
      const fs = w.team(t), box = el('div', `hud-team t${t}`);
      const pc = el('canvas', 'hud-portrait'); pc.width = pc.height = 40; drawPortrait(pc.getContext('2d'), fs[0].char, 40);
      const bars = el('div', 'hud-bars');
      const hp = el('div', 'bar hp'); hp.innerHTML = '<div class="ghost"></div><div class="fill"></div><div class="ticks"></div>';
      const chi = el('div', 'bar chi'); chi.innerHTML = '<div class="fill"></div><div class="lab">SOUFFLE</div>';
      // jauge de garde (orange → rouge) et charges de substitution (bûches)
      const gd = el('div', 'hud-guard'); gd.style.cssText = 'height:4px;margin-top:2px;background:#0d122c99;border:1px solid #ffffff22;overflow:hidden';
      const gdf = el('i'); gdf.style.cssText = 'display:block;height:100%;width:0;background:#ffb02e'; gd.appendChild(gdf);
      const chips = el('div', 'hud-skills');
      const chipEls = [['NINJUTSU', 10, 'x'], ['TECHNIQUE', 15, 'y'], ['ULTIME', 50, 'z']].map(([n, c]) => { const d = el('div', 'sk', `<i></i><b>${n[0]}</b>`); d.title = n; chips.appendChild(d); return { d, c }; });
      const pips = el('div', 'hud-pips'); pips.style.cssText = 'display:flex;gap:3px;margin-top:3px';
      const pipEls = [0, 1, 2].map(() => { const p = el('i'); p.style.cssText = 'width:12px;height:6px;border-radius:2px;background:#a87b4a;border:1px solid #ffffff44'; pips.appendChild(p); return p; });
      const names = el('div', 'names', fs.map((f) => `<span>${f.char.name.toUpperCase()}</span>`).join(''));
      const sub = el('div', 'subs'); const subEls = fs.length > 1 ? fs.map(() => { const s = el('div', 'sub'); s.innerHTML = '<div class="fill"></div>'; sub.appendChild(s); return s; }) : [];
      const wins = el('div', 'wins', '0');
      bars.append(hp, chi, chips, gd, pips, names, sub);
      // soutiens (R1 / L1) : portrait, délai de rappel, état
      const leader = fs[0], supEls = [];
      if (leader.sup && leader.sup.length) {
        const row = el('div', 'hud-sups'); row.style.cssText = 'display:flex;gap:4px;margin-top:3px';
        leader.sup.forEach((s, i) => {
          const b = el('div', 'hud-sup');
          const pc2 = el('canvas'); pc2.width = pc2.height = 26; pc2.className = 'sp'; drawPortrait(pc2.getContext('2d'), s.char, 26);
          const key = el('span', '', i === 0 ? 'R1' : 'L1'); key.className = 'k';
          const cd = el('i'); const num = el('em');
          b.append(pc2, cd, num, key); row.appendChild(b); supEls.push({ b, cd, num });
        });
        bars.appendChild(row);
      }
      box.append(pc, bars, wins); top.appendChild(box);
      this.team[t] = { chipEls, box, hp: hp.querySelector('.fill'), ghost: hp.querySelector('.ghost'), chi: chi.querySelector('.fill'), chiBar: chi, wins, subEls, supEls, leader, gdf, pipEls, ghostV: 1, fs };
      if (fs.length > 1) box.classList.add('duo');
    }
    this.timer = el('div', 'hud-timer', '∞'); top.appendChild(this.timer);
    this.comboEls = [0, 1].map((t) => { const c = el('div', `combo c${t}`); this.root.appendChild(c); return c; });
    this.msg = el('div', 'hud-msg'); this.root.appendChild(this.msg);
    this.cutEl = el('div', 'hud-cut'); this.root.appendChild(this.cutEl);
    this.flashEl = el('div', 'hud-flash'); this.root.appendChild(this.flashEl);
    this.hint = el('div', 'hud-hint', 'P : pause'); this.root.appendChild(this.hint);
    this.combos = el('div', 'hud-combos', '<b>COMMANDES</b><br>○ répété = combo · ↑+○ lanceur · ↓+○ balayage · ←/→+○ pied<br>□ shuriken · △ maintenu = charger le chakra<br>△+○ ninjutsu · △ △ ○ ultime · △+✕ Chakra Dash · △+□ Chakra Shuriken<br>R2 garde (tap = parade) · R2+○ projection · L2 substitution · ✕ ✕ double saut<br>R1 / L1 soutiens · R1+L1 ultime d\'équipe · vie &lt; 35 % : △ maintenu = Éveil'); this.root.appendChild(this.combos);
    this.fl = el('div', 'hud-floats'); this.root.appendChild(this.fl);
    this.dmg = el('div', 'hud-dmg'); this.root.appendChild(this.dmg);
    this.built = true; this.bm = match;
  }

  banner(txt, frames) {
    const m = /^MANCHE/.test(txt) ? 'READY ?' : { 'COMBAT !': 'FIGHT !', 'K.O. !': 'K.O. !', 'TEMPS ÉCOULÉ': 'TIME UP' }[txt];
    if (m) txt = m; else if (/ GAGNE !$/.test(txt)) txt = 'YOU WIN !'; if (this.msg) this.msg.classList.toggle('lose', txt === 'YOU LOSE'); this.bannerT = frames; this.bannerTxt = txt; if (this.msg) { this.msg.textContent = txt; this.msg.classList.remove('pop'); void this.msg.offsetWidth; if (txt) this.msg.classList.add('pop'); this.msg.style.opacity = txt ? 1 : 0; } }

  event(e) {
    if (e.t === 'super') {
      const a = ARCH[e.f.char.arch], s = SUPERS[a.sup];
      this.cutEl.innerHTML = `<div class="cut-name">${e.f.char.name.toUpperCase()}</div><div class="cut-tech" style="color:${a.c1}">${e.f.char.supName || a.supName}</div>`;
      this.cutEl.style.setProperty('--c', a.c1); this.cutEl.classList.remove('go'); void this.cutEl.offsetWidth; this.cutEl.classList.add('go'); void s;
    }
    if (e.t === 'ko' || e.t === 'nova' || e.t === 'break') { this.flashEl.classList.remove('go'); void this.flashEl.offsetWidth; this.flashEl.classList.add('go'); }
  }

  // chiffres de dégâts flottants : on lit la perte de PV de chaque combattant d'une image à l'autre
  floatNums(match) {
    const v = match.view, w = match.world, b = v && v.box; if (!b || !v.cam) return;
    const cam = v.cam;
    for (const f of w.fighters) {
      const prev = this.hpPrev.get(f); this.hpPrev.set(f, f.hp);
      if (prev === undefined || f.hp >= prev - 0.5 || this.floats > 14) continue;
      const d = Math.round(prev - f.hp), crit = d >= 70;
      const x = b.vw / 2 + (f.x - cam.position.x) * cam.zoom, y = 240 - (GROUND + f.y + 74 * f.scale - cam.position.y) * cam.zoom;   // le HUD est en unités logiques (zoom CSS = b.s)
      const n = el('span', 'dn' + (crit ? ' crit' : '') + (f.team === 0 ? ' mine' : ''), String(d));
      n.style.left = (x + (Math.random() * 24 - 12)) + 'px'; n.style.top = y + 'px';
      this.fl.appendChild(n); this.floats++;
      setTimeout(() => { n.remove(); this.floats--; }, 900);
    }
  }

  update(match) {
    if (!this.built || this.bm !== match) this.build(match);
    const w = match.world;
    if (this.bannerT > 0 && --this.bannerT === 0) this.msg.style.opacity = 0;
    this.timer.textContent = match.cfg.timer ? Math.ceil(match.timeLeft / 60) : '∞';
    for (const t of [0, 1]) {
      const T = this.team[t], hp = w.teamHp(t), mx = w.teamMax(t), p = Math.max(0, hp / mx);
      T.hp.style.width = (p * 100) + '%';
      T.ghostV = T.ghostV > p ? Math.max(p, T.ghostV - 0.006) : p; T.ghost.style.width = (T.ghostV * 100) + '%';
      T.box.classList.toggle('low', p < 0.25 && p > 0);
      const lead = T.fs.find((f) => f.hp > 0) || T.fs[0], hum = T.fs.find((f) => ['h', 'net'].includes(match.ctrl[f.slot].k)) || lead;
      const chi = hum.chi; T.chi.style.width = (chi / hum.maxChi * 100) + '%'; T.chiBar.classList.toggle('ready', chi >= 50); T.chiBar.style.outline = hum.denyT > 0 && (hum.denyT >> 2) % 2 ? '2px solid #f33' : '';   // énergie insuffisante : contour rouge clignotant
      T.gdf.style.width = Math.min(100, hum.guard) + '%'; T.gdf.style.background = hum.guard > 70 ? '#ff4a3a' : '#ffb02e';
      T.pipEls.forEach((pp, i) => { pp.style.opacity = i < hum.subCharges ? 1 : 0.2; });
      T.wins.textContent = match.wins[t];
      T.chipEls.forEach((k) => { const q = Math.min(1, chi / k.c); k.d.style.setProperty('--p', Math.round((1 - q) * 360) + 'deg'); k.d.classList.toggle('rdy', chi >= k.c); });
      T.subEls.forEach((s, i) => { s.firstChild.style.width = Math.max(0, T.fs[i].hp / T.fs[i].maxHp * 100) + '%'; s.classList.toggle('dead', T.fs[i].hp <= 0); });
      T.supEls.forEach((s, i) => {
        const sp = T.leader.sup[i], on = !sp.out, ready = supReady(T.leader, i);
        const left = Math.max(0, T.leader.supCd[i]);
        s.b.classList.toggle('on', on); s.b.classList.toggle('ready', !on && ready);
        s.cd.style.setProperty('--p', on ? 0 : Math.round(left / SUP_CD * 360) + 'deg');   // disque noir qui se vide
        s.num.textContent = !on && !ready && left > 0 ? Math.ceil(left / 60) : '';
      });
      // combo affiché du côté de l'attaquant
      let best = 0; for (const f of T.fs) if (f.chainT > 0) best = Math.max(best, f.chain);
      const ce = this.comboEls[t];
      if (best >= 2) { this.combo[t] = best; this.comboT[t] = 70; } else if (this.comboT[t] > 0) this.comboT[t]--;
      if (this.comboT[t] > 0 && this.combo[t] >= 2) { const txt = `<small>hit</small><b>${String(this.combo[t]).padStart(2, '0')}</b>`; if (ce.innerHTML !== txt) { ce.innerHTML = txt; ce.classList.remove('pop'); void ce.offsetWidth; ce.classList.add('pop'); } ce.style.opacity = 1; } else ce.style.opacity = 0;
    }
    this.floatNums(match);
    if (match.cfg.mode === 'training') {
      const d = w.team(1)[0]; this.dmg.textContent = `Dégâts du dernier combo : ${Math.round(d.maxHp - d.hp)}`;
      this.dmg.style.display = 'block'; this.combos.style.display = 'block';
    }
  }
}
