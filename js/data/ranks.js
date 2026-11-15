// Rang FIXE de chaque personnage (E → SS), clé = « Nom — Titre ». Il ne dépend pas du niveau (1-50) du héros.
// Plus le rang est haut, plus les cartes du personnage sont rares (js/cards.js). Un personnage ajouté plus tard sans entrée ici
// reçoit un rang calculé d'après ses stats (voir rankOf).
export const RANKS = ['E', 'D', 'C', 'B', 'A', 'AA', 'S', 'SS'];
// fragments à réunir pour débloquer un personnage (valeurs de départ, à équilibrer)
export const NEED = { E: 10, D: 10, C: 10, B: 15, A: 20, AA: 20, S: 30, SS: 30 };
const TABLE = {
  "Kaito — Apprenti": 'E',
  "Momo — Petit Génie": 'E',
  "Wakaba — Jeune Pousse": 'E',
  "Haruto — Marionnettiste": 'E',
  "Jirō — Fumée Mortelle": 'E',
  "Emi — Vague Cristalline": 'E',
  "Ume — Fleur de Cerisier": 'E',
  "Hana — Guérisseuse": 'E',
  "Mei — Alchimiste": 'E',
  "Tomo — Gardien du Brouillard": 'D',
  "Nao — Ombre Silencieuse": 'D',
  "Saya — Danseuse de l'Éventail": 'D',
  "Noa — Esprit Libre": 'D',
  "Yuna — Reine des Insectes": 'D',
  "Mizuki — Sage de l'Eau": 'D',
  "Ayame — Cristal de Glace": 'D',
  "Kagami — Miroir Brisé": 'D',
  "Kenji — Le Stratège": 'C',
  "Sora — Pilote du Ciel": 'C',
  "Raku — Maître des Pantins": 'C',
  "Oboro — Voile de Nuit": 'C',
  "Ibuki — Mur de Pierre": 'C',
  "Shō — Maître Éclair": 'C',
  "Tsubasa — Lame de Tempête": 'C',
  "Gorō — Le Sable Rouge": 'C',
  "Ryō — Œil du Faucon": 'B',
  "Ren — Le Vengeur": 'B',
  "Akira — Danse des Lames": 'B',
  "Kuro — Griffe Nocturne": 'B',
  "Hiro — Tonnerre Rouge": 'B',
  "Hikari — Déesse Lumineuse": 'B',
  "Shiro — Moine Radieux": 'B',
  "Ranmaru — Explosion Pure": 'B',
  "Shin — Maître des Os": 'A',
  "Gen — Vieux Maître": 'A',
  "Vikir — le Maudit": 'A',
  "Ren — Œil Écarlate": 'A',
  "Takumi — Artiste Explosif": 'A',
  "Ikki — Roi des Flammes": 'A',
  "Reiji — Seigneur du Feu": 'A',
  "Zen — Sage Immobile": 'A',
  "Ginjirō — Le Faucheur": 'AA',
  "Ren — Ange Noir": 'AA',
  "Yoshi — Bête Sauvage": 'AA',
  "Natsu — Soleil Ardent": 'AA',
  "Hana — Poing d'Acier": 'AA',
  "Bakuto — Roi du Chaos": 'AA',
  "Tarō — Géant Gentil": 'AA',
  "Kazuma — Poing de Fer": 'S',
  "Daichi — Le Colosse": 'S',
  "Ōkami — Alpha": 'S',
  "Yami — Seigneur des Ténèbres": 'S',
  "Kaito — Ermite": 'S',
  "Kaito — Légende": 'S',
  "Kaito — Furie": 'SS',
  "Kaito — Dernier Combat": 'SS',
  "Mugen — Ultime Maître": 'SS',
};
export function rankOf(ch) {
  const r = TABLE[ch.full || `${ch.name} — ${ch.title}`]; if (r) return r;
  const s = (ch.pow || 1) + 0.6 * (ch.def || 1) + 0.6 * (ch.spd || 1);   // ~2,1 (faible) … 3,1 (très fort)
  return RANKS[Math.max(0, Math.min(5, Math.floor((s - 2.1) / 0.17)))];     // jamais S / SS par calcul : ces rangs sont décidés à la main
}
export const STARTER = 0;   // héros de départ : Kaito Apprenti (rang E)
