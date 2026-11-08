// ============================================================
//  COMBINAISONS DE BOUTONS (schéma « Storm ») : traduit les boutons physiques en actions du moteur.
//  Entrées brutes : l r u d  o (○)  x (✕)  sq (□)  tri (△)  r2  l2  sup1 (R1)  sup2 (L1)
//  Sorties : les actions du moteur (punch high low side special super sq cdash cshuriken charge throw sub d u l r sup1 sup2 …)
//
//   ○            attaque : ○ seul = chaîne normale ; ↑+○ = chaîne haute (uppercut, lance dans les airs) ;
//                ↓+○ = chaîne basse (jab bas, tibia, croc-en-jambe) ; ←/→+○ = chaîne latérale (paume, paume 2, finisseur du personnage)
//   R2 + ○       projection (au contact ; sinon simple Poing)
//   ✕            saut (comme ↑) ; un 2e appui en l'air = double saut
//   □            Shuriken
//   △ maintenu   charge le chakra (après CHARGE_AFTER frames)
//   △ + ○        Ninjutsu (spécial)         △ → △ → ○   Technique ultime (super)
//   △ + ✕        Chakra Dash               △ + □        Chakra Shuriken
//   R2           garde (un appui bref = parade parfaite)      L2   substitution (impulsion)
//  « △ + X » vaut aussi quand △ vient d'être relâché (ARM_WIN frames) : △ → ✕ → ○ …
//  La direction est lue au moment de l'appui sur ○ : chaque ○ d'une chaîne peut bifurquer vers une autre chaîne.
// ============================================================
export const TAP_WIN = 30;       // deux appuis sur △ dans cette fenêtre (frames) avant ○ = Technique ultime
export const ARM_WIN = 8;        // △ relâché depuis moins de ARM_WIN frames compte encore comme « armé »
export const CHARGE_AFTER = 6;   // frames de △ maintenu avant de charger

export class Chord {
  constructor() { this.f = 0; this.prev = {}; this.taps = []; this.triT = 0; this.relF = -99; this.xUsed = false; }

  map(raw) {
    const f = ++this.f, p = this.prev, edge = (k) => !!raw[k] && !p[k];
    const out = {
      l: raw.l ? 1 : 0, r: raw.r ? 1 : 0, u: raw.u || raw.x ? 1 : 0, d: raw.d || raw.r2 ? 1 : 0,
      punch: 0, kick: 0, high: 0, low: 0, side: 0, special: 0, move2: 0, super: 0, sq: 0, cdash: 0, cshuriken: 0, charge: 0, throw: 0,
      sup1: raw.sup1 ? 1 : 0, sup2: raw.sup2 ? 1 : 0, guard: raw.r2 ? 1 : 0, sub: edge('l2') ? 1 : 0,
    };

    if (edge('tri')) this.taps.push(f);
    if (p.tri && !raw.tri) this.relF = f;
    this.triT = raw.tri ? this.triT + 1 : 0;
    this.taps = this.taps.filter((t) => f - t <= TAP_WIN);
    if (!raw.x) this.xUsed = false;

    const armed = !!raw.tri || f - this.relF <= ARM_WIN;
    let chord = false;
    if (armed) {
      if (edge('o')) { if (this.taps.length >= 2) out.super = 1; else out.special = 1; chord = true; }
      else if (edge('x')) { out.cdash = 1; this.xUsed = true; chord = true; }
      else if (edge('sq')) { out.cshuriken = 1; chord = true; }
      if (chord) this.taps = [];
    }
    if (!chord) {
      if (edge('o')) {
        if (raw.r2) out.throw = 1;                  // R2 + ○ : projection
        else if (raw.u) out.high = 1;               // ↑ + ○ : chaîne haute
        else if (raw.d) out.low = 1;                // ↓ + ○ : chaîne basse
        else if (raw.l || raw.r) out.side = 1;      // ← / → + ○ : chaîne latérale
        else out.punch = 1;
      } else if (edge('sq')) out.sq = 1;
      if (raw.tri && this.triT >= CHARGE_AFTER) out.charge = 1;
    }
    if (this.xUsed && raw.x) out.u = raw.u ? 1 : 0;                              // ✕ consommé par le Chakra Dash : pas de saut
    this.prev = { ...raw };
    return out;
  }
}
