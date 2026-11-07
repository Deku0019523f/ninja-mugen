// ============================================================
//  HUD (DOM) : barres de vie angulaires, chakra, chrono ∞, combos, bannières, cut-in super, soutiens R1 / L1
// ============================================================
import { ARCH, ROSTER } from '../data/roster.js';
import { SUPERS } from '../game/moves.js';
import { SUP_CD, supReady } from '../game/support.js';
import { drawPortrait } from '../render/sprites.js';

const el = (tag, cls, html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };

export class Hud {
  constructor(root) { this.root = root; this.root.innerHTML = ''; this.built = false; this.bannerT = 0; this.cut = 0; this.combo = [0, 0]; this.comboT = [0, 0]; }

  build(match) {
    const w = match.world; this.root.innerHTML = ''; this.team = [];
    const top = el('div', 'hud-top'); this.root.appendChild(top);
    for (const t of [0, 1]) {
      const fs = w.team(t), box = el('div', `hud-team t${t}`);
      const pc = el('canvas', 'hud-portrait'); pc.width = pc.height = 40; drawPortrait(pc.getContext('2d'), fs[0].char, 40);
      const bars = el('div', 'hud-bars');
      const hp = el('div', 'bar hp'); hp.innerHTML = '<div class="ghost"></div><div class="fill"></div><div class="ticks"></div>';
      const chi = el('div', 'bar chi'); chi.innerHTML = '<div class="fill"></div><div class="lab">SUPER</div>';
      const names = el('div', 'names', fs.map((f) => `<span>${f.char.name.toUpperCase()}</span>`).join(''));
      const sub = el('div', 'subs'); const subEls = fs.length > 1 ? fs.map(() => { const s = el('div', 'sub'); s.innerHTML = '<div class="fill"></div>'; sub.appendChild(s); return s; }) : [];
      const wins = el('div', 'wins', '0');
      bars.append(hp, chi, names, sub);
      // soutiens (R1 / L1) : portrait, délai de rappel, état
      const leader = fs[0], supEls = [];
      if (leader.sup && leader.sup.length) {
        const row = el('div', 'hud-sups'); row.style.cssText = 'display:flex;gap:4px;margin-top:3px';
        leader.sup.forEach((s, i) => {
          const b = el('div', 'hud-sup'); b.style.cssText = 'position:relative;width:30px;height:34px;border:2px solid #555;border-radius:4px;background:#0d122ccc;overflow:hidden';
          const pc2 = el('canvas'); pc2.width = pc2.height = 26; pc2.style.cssText = 'display:block;margin:0 auto'; drawPortrait(pc2.getContext('2d'), s.char, 26);
          const key = el('span', '', i === 0 ? 'R1' : 'L1'); key.style.cssText = 'position:absolute;right:1px;top:0;font:700 8px sans-serif;color:#fff;text-shadow:0 0 2px #000';
          const cd = el('i'); cd.style.cssText = 'position:absolute;left:0;bottom:0;height:4px;width:0;background:#ffe066';
          b.append(pc2, key, cd); row.appendChild(b); supEls.push({ b, cd });
        });
        bars.appendChild(row);
      }
      box.append(pc, bars, wins); top.appendChild(box);
      this.team[t] = { box, hp: hp.querySelector('.fill'), ghost: hp.querySelector('.ghost'), chi: chi.querySelector('.fill'), chiBar: chi, wins, subEls, supEls, leader, ghostV: 1, fs };
      if (fs.length > 1) box.classList.add('duo');
    }
    this.timer = el('div', 'hud-timer', '∞'); top.appendChild(this.timer);
    this.comboEls = [0, 1].map((t) => { const c = el('div', `combo c${t}`); this.root.appendChild(c); return c; });
    this.msg = el('div', 'hud-msg'); this.root.appendChild(this.msg);
    this.cutEl = el('div', 'hud-cut'); this.root.appendChild(this.cutEl);
    this.flashEl = el('div', 'hud-flash'); this.root.appendChild(this.flashEl);
    this.hint = el('div', 'hud-hint', 'P : pause'); this.root.appendChild(this.hint);
    this.combos = el('div', 'hud-combos', '<b>COMBOS</b><br>Poing · Poing · Poing = enchaînement + lancer<br>Poing · Poing · <b>Pied</b> = finisseur<br><b>Poing + Pied</b> ensemble = Frappe lourde (brise la garde)<br>Après un coup : <b>Spécial</b> / <b>Technique</b> / <b>SUPER</b><br>↓+Poing (uppercut) puis sauter + Poing/Pied = combo aérien'); this.root.appendChild(this.combos);
    this.dmg = el('div', 'hud-dmg'); this.root.appendChild(this.dmg);
    this.built = true; this.bm = match;
  }

  banner(txt, frames) { this.bannerT = frames; this.bannerTxt = txt; if (this.msg) { this.msg.textContent = txt; this.msg.classList.remove('pop'); void this.msg.offsetWidth; if (txt) this.msg.classList.add('pop'); this.msg.style.opacity = txt ? 1 : 0; } }

  event(e) {
    if (e.t === 'super') {
      const a = ARCH[e.f.char.arch], s = SUPERS[a.sup];
      this.cutEl.innerHTML = `<div class="cut-name">${e.f.char.name.toUpperCase()}</div><div class="cut-tech" style="color:${a.c1}">${a.supName}</div>`;
      this.cutEl.style.setProperty('--c', a.c1); this.cutEl.classList.remove('go'); void this.cutEl.offsetWidth; this.cutEl.classList.add('go'); void s;
    }
    if (e.t === 'ko' || e.t === 'nova') { this.flashEl.classList.remove('go'); void this.flashEl.offsetWidth; this.flashEl.classList.add('go'); }
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
      const lead = T.fs.find((f) => f.hp > 0) || T.fs[0], hum = T.fs.find((f) => match.ctrl[f.slot].k === 'h') || lead;
      const chi = hum.chi; T.chi.style.width = chi + '%'; T.chiBar.classList.toggle('ready', chi >= 50);
      T.wins.textContent = match.wins[t];
      T.subEls.forEach((s, i) => { s.firstChild.style.width = Math.max(0, T.fs[i].hp / T.fs[i].maxHp * 100) + '%'; s.classList.toggle('dead', T.fs[i].hp <= 0); });
      T.supEls.forEach((s, i) => {
        const sp = T.leader.sup[i], on = !sp.out, ready = supReady(T.leader, i);
        s.b.style.borderColor = on ? '#6cf' : ready ? '#ffe066' : '#555'; s.b.style.opacity = on || ready ? 1 : 0.55;
        s.cd.style.width = on ? '100%' : Math.round((1 - Math.max(0, T.leader.supCd[i]) / SUP_CD) * 100) + '%'; s.cd.style.background = on ? '#6cf' : '#ffe066';
      });
      // combo affiché du côté de la victime
      let best = 0; for (const f of T.fs) if (f.chainT > 0) best = Math.max(best, f.chain);
      const ce = this.comboEls[1 - t];
      if (best >= 2) { this.combo[t] = best; this.comboT[t] = 70; } else if (this.comboT[t] > 0) this.comboT[t]--;
      if (this.comboT[t] > 0 && this.combo[t] >= 2) { const txt = `<b>${this.combo[t]}</b> HITS`; if (ce.innerHTML !== txt) { ce.innerHTML = txt; ce.classList.remove('pop'); void ce.offsetWidth; ce.classList.add('pop'); } ce.style.opacity = 1; } else ce.style.opacity = 0;
    }
    if (match.cfg.mode === 'training') {
      const d = w.team(1)[0]; this.dmg.textContent = `Dégâts du dernier combo : ${Math.round(d.maxHp - d.hp)}`;
      this.dmg.style.display = 'block'; this.combos.style.display = 'block';
    }
  }
}
