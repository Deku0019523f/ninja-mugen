// Coffres de chapitre et bonus avant combat (match)
globalThis.localStorage = { d: {}, getItem(k) { return this.d[k] ?? null; }, setItem(k, v) { this.d[k] = String(v); } };
localStorage.setItem('ninja-mugen-story', JSON.stringify({ v: 2, s: { d0: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0] } }));
const { story } = await import('../js/story.js');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('ÉCHEC', m); } };
ok(story.chest(0).ok && !story.chest(1).ok, 'chapitre 1 fini, chapitre 2 non');
ok(story.claimChest(1) === null, 'coffre fermé refusé');
const r = story.claimChest(0); ok(r && r.c === 150 && r.g === 4, 'récompense du chapitre 1');
ok(story.claimChest(0) === null && story.chest(0).got, 'une seule fois');
ok(story.chest(3).c === 450, 'récompense croissante');
console.log(bad ? 'ÉCHECS ' + bad : 'story-chest OK'); process.exit(bad ? 1 : 0);
