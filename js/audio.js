// ============================================================
//  AUDIO : effets + musique entièrement synthétisés (WebAudio, aucun fichier)
// ============================================================
let ctx = null, master = null, musicGain = null, muted = false, musicOn = true, timer = null, step = 0, mode = 'menu';

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ctx.destination);
  musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
  startMusic();
}
export const setMuted = (m) => { muted = m; if (master) master.gain.value = m ? 0 : 0.5; };
export const setMusic = (on) => { musicOn = on; if (musicGain) musicGain.gain.value = on ? 0.16 : 0; };
export const isMuted = () => muted;

function noise(dur, type = 'lowpass', f0 = 2000, f1 = 200, vol = 0.5) {
  if (!ctx) return; const n = ctx.sampleRate * dur, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(); s.buffer = b; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f0, ctx.currentTime); fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1), ctx.currentTime + dur);
  const g = ctx.createGain(); g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  s.connect(fl); fl.connect(g); g.connect(master); s.start();
}
function tone(f0, f1, dur, type = 'square', vol = 0.3, dest = null, when = 0) {
  if (!ctx) return; const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.02);
}

export const sfx = {
  punch() { noise(0.09, 'bandpass', 1800, 600, 0.55); tone(180, 60, 0.08, 'square', 0.25); },
  kick() { noise(0.14, 'lowpass', 1500, 120, 0.7); tone(140, 40, 0.14, 'sawtooth', 0.35); },
  swing() { noise(0.12, 'bandpass', 900, 2600, 0.12); },
  block() { tone(900, 500, 0.06, 'square', 0.18); noise(0.05, 'highpass', 3000, 3000, 0.25); },
  cast() { tone(300, 900, 0.22, 'sawtooth', 0.15); noise(0.2, 'bandpass', 600, 3000, 0.15); },
  super() { tone(120, 700, 0.8, 'sawtooth', 0.25); tone(240, 1400, 0.8, 'square', 0.1); noise(0.7, 'bandpass', 400, 4000, 0.25); },
  ko() { noise(0.7, 'lowpass', 1800, 60, 0.9); tone(90, 25, 0.7, 'sawtooth', 0.5); },
  boom() { noise(0.5, 'lowpass', 1400, 60, 0.8); tone(100, 30, 0.4, 'sawtooth', 0.4); },
  land() { noise(0.1, 'lowpass', 500, 80, 0.3); },
  jump() { tone(300, 520, 0.08, 'square', 0.08); },
  quake() { noise(0.35, 'lowpass', 400, 50, 0.6); },
  buff() { tone(200, 800, 0.5, 'triangle', 0.3); },
  clash() { tone(1200, 400, 0.1, 'square', 0.2); noise(0.08, 'highpass', 4000, 4000, 0.3); },
  ui() { tone(660, 880, 0.06, 'square', 0.12); },
  ok() { tone(520, 1040, 0.12, 'square', 0.15); tone(780, 1560, 0.12, 'square', 0.1, null, 0.06); },
  back() { tone(500, 300, 0.1, 'square', 0.12); },
  round() { tone(220, 220, 0.25, 'square', 0.2); },
  fight() { tone(330, 660, 0.4, 'sawtooth', 0.25); noise(0.3, 'bandpass', 800, 2500, 0.2); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.22, 'square', 0.18, null, i * 0.13)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, f * 0.98, 0.3, 'triangle', 0.25, null, i * 0.18)); },
};

export function playEvent(e) {
  switch (e.t) {
    case 'hit': sfx[e.snd === 'kick' || e.big ? 'kick' : 'punch'](); break;
    case 'swing': sfx.swing(); break;
    case 'block': sfx.block(); break;
    case 'nochi': if (e.f.team === 0) sfx.back(); break;
    case 'cast': sfx.cast(); break;
    case 'ko': sfx.ko(); break;
    case 'boom': sfx.boom(); break;
    case 'land': if (e.big) sfx.land(); break;
    case 'jump': sfx.jump(); break;
    case 'quake': sfx.quake(); break;
    case 'buff': sfx.buff(); break;
    case 'clash': sfx.clash(); break;
    case 'super': sfx.super(); break;
    case 'nova': sfx.boom(); break;
    default: break;
  }
}

// ---- musique : boucle pentatonique (menu calme / combat nerveux)
const NOTES = [0, 3, 5, 7, 10, 12, 15, 17];
const BASS = [0, 0, -2, -2, -5, -5, -2, -2];
export function setMusicMode(m) { mode = m; }
function startMusic() {
  if (timer) return;
  timer = setInterval(() => {
    if (!ctx || !musicOn || muted) return;
    const fight = mode === 'fight', t = step++;
    const root = 57 + (fight ? 0 : -5), f = (n) => 440 * Math.pow(2, (n - 69) / 12);
    if (t % (fight ? 2 : 4) === 0) tone(f(root - 12 + BASS[(t >> 1) % 8]), f(root - 12 + BASS[(t >> 1) % 8]) * 0.99, fight ? 0.22 : 0.5, 'triangle', 0.5, musicGain);
    const idx = fight ? (t * 3 + (t >> 2)) % 8 : (t * 5) % 8;
    if (fight ? t % 2 === 1 || t % 4 === 0 : t % 2 === 0) tone(f(root + 12 + NOTES[idx]), f(root + 12 + NOTES[idx]), fight ? 0.14 : 0.3, 'square', fight ? 0.16 : 0.1, musicGain);
    if (fight && t % 4 === 0) noise(0.05, 'highpass', 6000, 6000, 0.1);
  }, 150);
}
