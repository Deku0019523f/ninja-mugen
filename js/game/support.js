// ============================================================
//  SOUTIENS (Support System) : 2 soutiens par combattant, appel R1 / L1.
//  Un soutien est un Fighter supplémentaire (support = true), hors-jeu tant qu'il n'est pas appelé.
//  À l'appel il apparaît SUP_STAY frames (3 s), attaque (corps à corps, tir ou interruption), puis repart.
//  Pendant sa présence il est invulnérable, ne pèse pas dans la barre de vie ni dans la condition de KO de l'équipe,
//  et ses coups traversent... ses adversaires uniquement : les soutiens adverses ne sont pas des cibles.
//  Hors-jeu = hp 0 + dead + x = OFF (invisible, ignoré par la caméra) + sauté par World.update (f.out).
// ============================================================
import { Fighter } from './fighter.js';

export const SUP_STAY = 180;    // présence : 3 s
export const SUP_CD = 720;      // délai avant rappel : 12 s (compté une fois le soutien reparti)
export const SUP_START = 240;   // délai initial en début de manche : 4 s
export const TEAM_COST = 60;    // ultime d'équipe (R1 + L1) : coût en chakra
const TEAM_STAY = 78, TEAM_FIRE = 22, TEAM_HIT = 48;   // présence, tirs des soutiens, frappe commune (frames)
const OFF = 99999;
const NEUTRAL = () => ({ l: 0, r: 0, u: 0, d: 0, punch: 0, kick: 0, special: 0, move2: 0, super: 0, sup1: 0, sup2: 0 });

export const supReady = (f, i) => !!(f.sup && f.sup[i] && f.sup[i].out && f.supCd[i] <= 0);

function bench(s) {
  s.out = true; s.hp = 0; s.dead = true; s.x = OFF; s.y = 0; s.vx = 0; s.vy = 0; s.move = null; s.state = 'idle'; s.t = 0;
}

// Crée les soutiens d'un combattant (chars = fiches de personnages, 2 maximum) et les met hors-jeu.
export function attachSupports(w, leader, chars) {
  leader.sup = []; leader.supCd = [SUP_START, SUP_START]; leader.supPrev = [0, 0];
  chars.slice(0, 2).forEach((c, i) => {
    const s = w.add(new Fighter(c, leader.team));
    s.support = true; s.owner = leader; s.supAge = 0; s.supT = 0; s.supMode = 'melee';
    bench(s);
    leader.sup[i] = s;
  });
  return leader.sup;
}

// Début de manche : tous les soutiens repartent, délais remis à zéro.
export function resetSupports(w) {
  for (const f of w.fighters) {
    if (f.sup) { f.supCd = [SUP_START, SUP_START]; f.supPrev = [0, 0]; f.teamT = 0; f.teamTgt = null; f.sup.forEach(bench); }
  }
}

function summon(w, leader, i) {
  const s = leader.sup[i], e = w.nearestEnemy(leader);
  let x = leader.x - leader.face * 45, mode = 'melee';
  if (e) {
    const dist = Math.abs(e.x - leader.x), dir = e.x >= leader.x ? 1 : -1;
    if (e.state === 'atk' && dist < 260) { mode = 'interrupt'; x = e.x - dir * 52; }   // coupe l'attaque en cours
    else if (dist > 220) mode = 'range';                                                  // tir à distance
  }
  x = Math.max(-w.half + 30, Math.min(w.half - 30, x));
  s.prepare(x, e ? (e.x >= x ? 1 : -1) : leader.face);
  s.out = false; s.supT = SUP_STAY; s.supAge = 0; s.supMode = mode;
  s.infiniteChi = true; s.invuln = 99999; s.dmgMul = 0.85;
  leader.supCd[i] = SUP_CD;
  w.event({ t: 'puff', x, y: 40, color: '#e8e8e8' });
  w.event({ t: 'summon', f: s });
}

// Ultime d'équipe : R1 + L1 ensemble. Les deux soutiens encadrent l'adversaire, tirent chacun leur technique, puis une frappe commune
// (indéfendable) l'envoie en l'air. Le combattant est invulnérable pendant l'appel.
function teamUlt(w, leader) {
  const e = w.nearestEnemy(leader); if (!e) return;
  leader.chi -= TEAM_COST;
  leader.sup.forEach((s, i) => {
    const side = i === 0 ? -1 : 1, x = Math.max(-w.half + 30, Math.min(w.half - 30, e.x + side * 85));
    s.prepare(x, side > 0 ? -1 : 1);
    s.out = false; s.supT = TEAM_STAY; s.supAge = 0; s.supMode = 'team';
    s.infiniteChi = true; s.invuln = 99999; s.dmgMul = 1;
    leader.supCd[i] = SUP_CD * 1.5;
    w.event({ t: 'puff', x, y: 40, color: '#e8e8e8' }); w.event({ t: 'summon', f: s });
  });
  leader.invuln = Math.max(leader.invuln, 30); leader.teamT = 1; leader.teamTgt = e;
  w.event({ t: 'fxring', x: leader.x, y: 40, s: 60, grow: 16, life: 22, color: (leader.char.fx || ['#fff', '#fff'])[0] });
  w.event({ t: 'team', f: leader });
}

// Déroulé de l'ultime d'équipe (appelé à chaque frame simulée)
function tickTeam(w, f) {
  if (!f.teamT) return;
  const e = f.teamTgt, t = f.teamT++;
  if (!e || e.hp <= 0 || t > TEAM_HIT + 14) { f.teamT = 0; f.teamTgt = null; return; }
  if (t === TEAM_FIRE) {
    for (const s of f.sup) {
      if (s.out) continue;
      const dir = e.x >= s.x ? 1 : -1, ch = s.char;
      w.spawnProj(s, { type: 'orb', style: ch.arch, x: s.x + dir * 24, y: 52, w: 26, h: 26, vx: dir * 11, vy: 0, dmg: 62, life: 40, stun: 22, kb: 5, launch: { vx: 3, vy: 6 }, gain: 0 });
      w.event({ t: 'cast', f: s, x: s.x, y: 52 });
    }
  }
  if (t === TEAM_HIT) {
    const dir = e.x >= f.x ? 1 : -1;
    w.event({ t: 'nova', x: e.x, y: 50, f });
    for (const s of f.sup) if (!s.out) w.event({ t: 'fxflash', x: s.x, y: 50, s: 100, color: (s.char.fx || ['#fff', '#fff'])[1] });
    w.hitstop = Math.max(w.hitstop, 14);
    e.receive(f, { dmg: 150, unblock: true, launch: { vx: dir * 7, vy: 12 }, stun: 40, gain: 0, snd: 'kick' }, f.x, w);
    f.teamT = 0; f.teamTgt = null;
  }
}

// Appels R1 / L1 (front montant) — à appeler avant World.update, avec les entrées de la frame.
export function callSupports(w, inputs) {
  for (const f of w.fighters) {
    if (!f.sup) continue;
    const inp = inputs[f.slot]; if (!inp) continue;
    // R1 + L1 ensemble (ou second bouton pressé juste après le premier) : ultime d'équipe
    const okTeam = (i) => supReady(f, i) || (f.sup[i] && !f.sup[i].out && f.sup[i].supAge <= 10);
    if (inp.sup1 && inp.sup2 && (!f.supPrev[0] || !f.supPrev[1]) && f.chi >= TEAM_COST && f.sup.length === 2 && okTeam(0) && okTeam(1) && f.hp > 0 && f.state !== 'ko' && !f.teamT) {
      teamUlt(w, f); f.supPrev = [1, 1]; continue;
    }
    for (let i = 0; i < 2; i++) {
      const down = i === 0 ? inp.sup1 : inp.sup2;
      if (down && !f.supPrev[i] && f.hp > 0 && f.state !== 'ko' && supReady(f, i)) summon(w, f, i);
      f.supPrev[i] = down ? 1 : 0;
    }
  }
}

// Chronomètres : présence des soutiens, délai de rappel (ne décompte que lorsque le soutien est parti).
export function tickSupports(w) {
  for (const f of w.fighters) {
    if (f.sup) tickTeam(w, f);
    if (f.sup) for (let i = 0; i < 2; i++) if (f.sup[i] && f.sup[i].out && f.supCd[i] > 0) f.supCd[i]--;
    if (f.support && !f.out) {
      f.supAge++;
      if (--f.supT <= 0) { w.event({ t: 'puff', x: f.x, y: 40, color: '#e8e8e8' }); bench(f); }
    }
  }
}

// IA des soutiens : interruption immédiate, tir à distance, ou corps à corps (marche + enchaînement de Poings).
export class SupportAI {
  think(w, f) {
    const inp = NEUTRAL();
    if (f.out || f.supMode === 'team') return inp;    // ultime d'équipe : les soutiens sont pilotés par tickTeam
    const e = w.nearestEnemy(f);
    if (!e) return inp;
    const dx = e.x - f.x, dist = Math.abs(dx), dir = dx >= 0 ? 1 : -1, age = f.supAge;
    if (f.state === 'atk') { if (f.connected && f.supMode !== 'range' && age % 4 === 0) inp.punch = 1; return inp; }   // enchaîne après un coup au but
    if (f.state !== 'idle' && f.state !== 'walk') return inp;
    if (f.supMode === 'interrupt') { if (age === 1) { inp.punch = 1; return inp; } }
    else if (age < 10) return inp;                                                                                    // le temps d'apparaître
    if (f.supMode === 'range') {
      if (age === 10 || age === 70) inp.special = 1;
      else if (dist < 120) inp[dir > 0 ? 'l' : 'r'] = 1;                                                              // garde ses distances
      return inp;
    }
    if (dist > 50) inp[dir > 0 ? 'r' : 'l'] = 1;
    else if (age % 8 === 0) inp.punch = 1;
    return inp;
  }
}
