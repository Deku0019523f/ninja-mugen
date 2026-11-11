// ============================================================
//  MATCH : manches, chrono, KO, entraînement. Pilote le World + la View + le HUD.
// ============================================================
import { World, NOIN } from './world.js';
import { Fighter } from './fighter.js';
import { AI, PERSONALITIES } from './ai.js';
import { Chord } from './chords.js';
import { attachSupports, resetSupports, callSupports, tickSupports, SupportAI } from './support.js';
import { ROSTER } from '../data/roster.js';
import { randomTeam } from '../modes/util.js';
import { readPlayer } from '../input.js';
import { playEvent, sfx } from '../audio.js';

const DT = 1 / 60;
const PERS = Object.keys(PERSONALITIES);
const pickPersonality = () => PERS[(Math.random() * PERS.length) | 0];   // chaque adversaire IA a un style de jeu aléatoire

export class Match {
  // cfg : { mode, fmt, vs, diff, timer, need, p1:[ids], p2:[ids], stage, carry?, sup?, sup1?:[ids], sup2?:[ids] }
  constructor(cfg, view, hud, onEnd) {
    this.cfg = cfg; this.view = view; this.hud = hud; this.onEnd = onEnd;
    this.world = new World(cfg.seed != null ? cfg.seed : (Math.random() * 1e9) | 0);
    this.net = cfg.net || null; this.readLocal = cfg.readLocal || (() => readPlayer(0)); this.nf = 0; this.used = null; this.stalled = 0;   // multijoueur : session lockstep, n° de la prochaine frame de combat
    this.ctrl = []; this.wins = [0, 0]; this.round = 0; this.acc = 0; this.finished = false; this.paused = false;
    cfg.p1.forEach((id, i) => this.addFighter(id, 0, i, cfg.p1.length));
    cfg.p2.forEach((id, i) => this.addFighter(id, 1, i, cfg.p2.length));
    if (cfg.sup && cfg.fmt === 1) { this.addSupports(0, cfg.sup1); this.addSupports(1, cfg.sup2); }   // soutiens R1 / L1 : 1 contre 1 uniquement
    if (cfg.mode === 'training') { this.world.fighters[0].infiniteChi = true; }
    if (cfg.carry) cfg.carry.forEach((hp, i) => { if (this.world.fighters[i] && hp != null) this.world.fighters[i].hp = Math.max(1, hp); });
    view.setStage(cfg.stage); view.setFighters(this.world); view.camX = 0;
    this.keepHp = !!cfg.carry; this.drawCount = 0;
    this.startRound();
  }

  addFighter(id, team, idx) {
    const f = this.world.add(new Fighter(ROSTER[id], team));
    const c = this.cfg;
    let ctl;
    if (c.vs === 'net') ctl = { k: 'net', p: team, chord: new Chord() };      // multijoueur : entrées des deux joueurs échangées par le réseau
    else if (c.mode === 'training') ctl = team === 0 ? { k: 'h', p: 0, chord: new Chord() } : { k: 'dummy' };
    else if (team === 0 && idx === 0) ctl = { k: 'h', p: 0, chord: new Chord() };
    else if (team === 1 && idx === 0 && c.vs === 'p2') ctl = { k: 'h', p: 1, chord: new Chord() };
    else ctl = { k: 'ai', ai: new AI(team === 0 ? Math.max(2, c.diff) : c.diff, pickPersonality()) };
    this.ctrl[f.slot] = ctl;
    return f;
  }

  // Soutiens d'un camp : ceux choisis, sinon 2 au hasard si le combattant est piloté par l'IA (rien pour le mannequin d'entraînement).
  addSupports(team, ids) {
    const leader = this.world.team(team)[0]; if (!leader) return;
    const ctl = this.ctrl[leader.slot];
    let list = ids && ids.length ? ids : null;
    if (!list && ctl && ctl.k === 'ai') list = randomTeam(2, [...this.cfg.p1, ...this.cfg.p2, ...(this.cfg.sup1 || [])]);
    if (!list) return;
    const sups = attachSupports(this.world, leader, list.map((id) => ROSTER[id]));
    for (const s of sups) this.ctrl[s.slot] = { k: 'sup', ai: new SupportAI() };
  }

  startRound() {
    this.round++; this.phase = 'intro'; this.pt = 0; this.timeLeft = this.cfg.timer ? this.cfg.timer * 60 : 0;
    const w = this.world; w.projs = []; w.events = []; w.hitstop = 0;
    for (const t of [0, 1]) {
      const m = w.team(t);
      m.forEach((f, i) => { f.prepare((t ? 1 : -1) * (150 + i * 70), t ? -1 : 1, this.keepHp && this.round === 1); f.introPose = true; f.winPose = false; if (this.cfg.mode !== 'training') f.chi = this.round === 1 ? f.chi : f.chi; });
    }
    resetSupports(w);
    this.keepHp = false; this.speed = 1; this.said = 0;
    this.hud.banner('', 0);
  }

  inputs() {
    const net = this.net, live = !!net && this.phase === 'fight';
    if (live) net.capture(this.nf + net.delay, this.readLocal());     // ma touche d'aujourd'hui s'applique dans `delay` frames
    const out = this.world.fighters.map((f, i) => {
      const c = this.ctrl[i];
      if (this.phase !== 'fight' || !c) return NOIN;
      if (c.k === 'net') return c.chord.map(net.get(c.p, this.nf));
      if (c.k === 'h') return c.chord.map(readPlayer(c.p));   // boutons physiques → actions du moteur (combinaisons △…)
      if (c.k === 'ai') return c.ai.think(this.world, f);
      if (c.k === 'sup') return c.ai.think(this.world, f);
      return NOIN;
    });
    if (live) { net.consume(this.nf); this.used = this.nf++; }
    return out;
  }

  step() {
    // multijoueur : on n'avance que si les entrées des deux joueurs pour cette frame sont arrivées (sinon on attend)
    if (this.net && this.phase === 'fight' && !this.net.ready(this.nf)) { this.stalled++; return; }
    this.stalled = 0;
    const w = this.world, t = ++this.pt;
    if (this.phase === 'intro') {
      if (t === 12) { this.hud.banner(this.cfg.mode === 'training' ? 'ENTRAÎNEMENT' : `MANCHE ${this.round}`, 80); sfx.round(); }
      if (t === 88) { this.hud.banner('COMBAT !', 50); sfx.fight(); w.fighters.forEach((f) => (f.introPose = false)); }
      if (t >= 105) { this.phase = 'fight'; this.pt = 0; }
    } else if (this.phase === 'fight') {
      if (this.timeLeft > 0 && --this.timeLeft === 0) return this.timeUp();
      for (const tm of [0, 1]) if (w.teamDown(tm) && this.cfg.mode !== 'training') return this.ko(tm === 0 ? 1 : 0);
      if (this.cfg.mode === 'training') {
        const d = w.team(1)[0]; if (d.hp <= 0 && d.dead && ++this.revive > 40) { d.prepare(150, -1); this.revive = 0; }
        for (const f of w.fighters) if (f.state === 'idle' && f.hp < f.maxHp && f.combo === 0 && this.pt % 120 === 0 && !f.support) f.hp = Math.min(f.maxHp, f.hp + 200);
        this.revive = this.revive || 0;
      }
    } else if (this.phase === 'ko') {
      if (t > 40) this.speed = 1;
      const lose = w.team(1 - this.winTeam);
      if ((lose.every((f) => f.dead) && t > 70) || t > 170) { this.phase = 'result'; this.pt = 0; this.afterKo(); }
    } else if (this.phase === 'result') {
      if (t === 20 && this.roundEndMsg) this.hud.banner(this.roundEndMsg, 110);
      if (t > 150) this.nextRound();
    }
    const inp = this.inputs();
    if (this.phase === 'fight') callSupports(w, inp);
    const ran = w.update(inp);
    if (this.used != null) { this.net.afterFrame(this.used, w); this.used = null; }
    if (ran) tickSupports(w);
    for (const e of w.events) { playEvent(e); this.view.handle(e); this.hud.event(e); }
    w.events.length = 0;
  }

  ko(winTeam) {
    this.winTeam = winTeam; this.phase = 'ko'; this.pt = 0; this.speed = 0.35;
    this.hud.banner('K.O. !', 100); this.view.flash = 0.6;
  }
  timeUp() {
    const w = this.world, a = w.teamHp(0) / w.teamMax(0), b = w.teamHp(1) / w.teamMax(1);
    this.hud.banner('TEMPS ÉCOULÉ', 90);
    if (Math.abs(a - b) < 0.001) { this.winTeam = -1; } else this.winTeam = a > b ? 0 : 1;
    this.phase = 'ko'; this.pt = 60; this.speed = 1;
    this.world.team(1 - Math.max(0, this.winTeam)).forEach(() => 0);
  }
  afterKo() {
    const w = this.world;
    if (this.winTeam < 0) { this.roundEndMsg = 'DRAW'; this.drawCount++; if (this.drawCount > 2) { this.winTeam = 0; this.wins[0]++; } return; }
    this.wins[this.winTeam]++;
    w.team(this.winTeam).forEach((f) => { if (f.hp > 0) { f.winPose = true; f.state = 'idle'; } });
    const duo = this.cfg.vs === 'p2' || this.cfg.vs === 'net' || this.cfg.mode === 'training';
    this.roundEndMsg = duo ? (this.winTeam === 0 ? 'P1 WIN !' : 'P2 WIN !') : (this.winTeam === 0 ? 'YOU WIN !' : 'YOU LOSE');
    (this.winTeam === 0 ? sfx.win : sfx.lose)();
  }
  nextRound() {
    const need = this.cfg.need;
    if (this.wins[0] >= need || this.wins[1] >= need) {
      this.finished = true;
      const carry = this.world.team(0).map((f) => Math.max(1, f.hp));
      this.onEnd({ winner: this.wins[0] >= need ? 0 : 1, wins: [...this.wins], carry });
    } else this.startRound();
  }

  frame(dt) {
    if (this.finished) return;
    if (!this.paused) {
      this.acc += Math.min(dt, 0.1) * this.speed;
      while (this.acc >= DT && !this.finished) { this.acc -= DT; this.step(); }
    }
    this.view.render(this.world, this.paused ? 0 : dt * this.speed, null);
    this.hud.update(this);
  }
  destroy() { this.finished = true; }
}
