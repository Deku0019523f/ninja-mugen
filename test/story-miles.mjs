// Paliers d'étoiles de l'Histoire : bloqué avant le seuil, récupérable une seule fois
globalThis.localStorage = { d: {}, getItem(k) { return this.d[k] ?? null; }, setItem(k, v) { this.d[k] = String(v); } };
localStorage.setItem('ninja-mugen-story', JSON.stringify({ v: 2, s: { d0: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], d1: [3, 0, 0, 0, 0, 0, 0, 0, 0, 0] } }));
const { story, MILES } = await import('../js/story.js');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('ÉCHEC', m); } };
ok(story.sum() === 33, 'total 33');
const m = story.miles(); ok(m[0].ok && m[1].ok && m[2].ok && !m[3].ok, 'paliers 10/20/30 ouverts, 40 fermé');
ok(story.claimMile(3) === null, 'palier fermé refusé');
ok(story.claimMile(0) && story.claimMile(0) === null, 'récupéré une seule fois');
ok(story.miles()[0].got, 'marqué récupéré');
ok(MILES[MILES.length - 1].at === 60, 'dernier palier = 60 étoiles (max)');
console.log(bad ? 'ÉCHECS ' + bad : 'story-miles OK'); process.exit(bad ? 1 : 0);
