// ============================================================
//  VIEW : rendu three.js (caméra orthographique, parallaxe, sprites, particules)
// ============================================================
import * as THREE from 'three';
import { ARCH } from '../data/roster.js';
import { SPR, drawFighter, poseFor } from './sprites.js';
import { buildStage } from './stages.js';

export const VW = 640, VH = 480, GROUND = -150;
const tex = (c, nearest = true) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (nearest) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; } t.generateMipmaps = false; return t; };
const c2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const col = (h) => new THREE.Color(h);

// ---------- textures de projectiles (cache)
const cache = new Map();
function projTex(type, c1, c2c) {
  const key = type + c1 + c2c; if (cache.has(key)) return cache.get(key);
  const [c, g] = c2(64, 64); const cx = 32, cy = 32;
  const glow = (r, a, color) => { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(0, 0, 64, 64); g.globalAlpha = 1; };
  switch (type) {
    case 'orb': case 'shock': glow(32, .8, c1); glow(20, 1, c2c); g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, 8, 0, 7); g.fill();
      g.strokeStyle = c2c; g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx, cy, 11 + i * 4, i * 2, i * 2 + 2.2); g.stroke(); } break;
    case 'spirit': glow(32, .7, c1); glow(16, 1, c2c); g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy - 3, 8, 0, 7); g.fill(); g.fillStyle = c1; g.fillRect(cx - 9, cy - 1, 18, 9); g.fillStyle = '#222'; g.fillRect(cx - 5, cy - 5, 3, 3); g.fillRect(cx + 2, cy - 5, 3, 3); break;
    case 'rock': g.fillStyle = '#2a2218'; g.beginPath(); g.moveTo(8, 30); g.lineTo(20, 8); g.lineTo(44, 12); g.lineTo(56, 34); g.lineTo(40, 56); g.lineTo(16, 50); g.fill(); g.fillStyle = c1; g.beginPath(); g.moveTo(12, 30); g.lineTo(22, 12); g.lineTo(42, 16); g.lineTo(52, 34); g.lineTo(38, 52); g.lineTo(18, 46); g.fill(); g.fillStyle = c2c; g.fillRect(24, 20, 10, 6); break;
    case 'blade': glow(32, .5, c1); g.strokeStyle = c2c; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(10, cy, 40, -0.9, 0.9); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(10, cy, 40, -0.85, 0.85); g.stroke(); break;
    case 'bolt': glow(32, .5, c1); g.strokeStyle = '#fff'; g.lineWidth = 4; g.lineJoin = 'round'; g.beginPath(); g.moveTo(0, 32); for (let x = 6; x < 64; x += 8) g.lineTo(x, 32 + (x % 16 ? -10 : 10)); g.stroke(); g.strokeStyle = c1; g.lineWidth = 2; g.stroke(); break;
    case 'needle': g.fillStyle = c2c; g.beginPath(); g.moveTo(2, 32); g.lineTo(54, 28); g.lineTo(62, 32); g.lineTo(54, 36); g.fill(); g.fillStyle = c1; g.fillRect(2, 30, 40, 4); break;
    case 'wave': glow(32, .5, c1); g.fillStyle = c1; g.beginPath(); g.moveTo(4, 58); g.quadraticCurveTo(10, 6, 58, 14); g.quadraticCurveTo(32, 26, 36, 58); g.fill(); g.fillStyle = c2c; g.beginPath(); g.moveTo(14, 52); g.quadraticCurveTo(18, 18, 52, 18); g.quadraticCurveTo(30, 28, 30, 52); g.fill(); break;
    case 'cloud': for (let i = 0; i < 6; i++) { g.globalAlpha = .55; g.fillStyle = i % 2 ? c1 : c2c; g.beginPath(); g.arc(14 + (i * 37) % 38, 20 + (i * 23) % 26, 12 + (i % 3) * 3, 0, 7); g.fill(); } g.globalAlpha = 1; break;
    case 'pillar': g.fillStyle = '#241a10'; g.beginPath(); g.moveTo(6, 64); g.lineTo(10, 14); g.lineTo(20, 4); g.lineTo(32, 16); g.lineTo(44, 2); g.lineTo(54, 14); g.lineTo(58, 64); g.fill(); g.fillStyle = c1; g.beginPath(); g.moveTo(12, 64); g.lineTo(14, 18); g.lineTo(21, 9); g.lineTo(32, 20); g.lineTo(43, 7); g.lineTo(50, 18); g.lineTo(52, 64); g.fill(); g.fillStyle = c2c; g.fillRect(20, 20, 6, 44); break;
    default: glow(32, 1, c1);
  }
  const t = tex(c, false); cache.set(key, t); return t;
}
const beamTex = (() => { const [c, g] = c2(8, 64); const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.3, 'rgba(255,255,255,.7)'); gr.addColorStop(.5, '#fff'); gr.addColorStop(.7, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 64); return tex(c, false); })();
const ringTex = (() => { const [c, g] = c2(128, 128); g.strokeStyle = '#fff'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 54, 0, 7); g.stroke(); const gr = g.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.85, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return tex(c, false); })();
const shadowTex = (() => { const [c, g] = c2(64, 16); const gr = g.createRadialGradient(32, 8, 0, 32, 8, 32); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.scale(1, .25); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); g.restore(); return tex(c, false); })();
const auraTex = (() => { const [c, g] = c2(128, 128); const gr = g.createRadialGradient(64, 64, 8, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return tex(c, false); })();

// ---------- particules (Points + shader)
class Particles {
  constructor(scene, N = 700) {
    this.N = N; this.p = []; this.scale = 1;
    const geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(N * 3); this.cols = new Float32Array(N * 4); this.sz = new Float32Array(N);
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(this.cols, 4)); geo.setAttribute('size', new THREE.BufferAttribute(this.sz, 1));
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uS: { value: 1 } },
      vertexShader: 'attribute float size; attribute vec4 color; varying vec4 vC; uniform float uS; void main(){ vC=color; gl_PointSize=size*uS; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'varying vec4 vC; void main(){ float d=length(gl_PointCoord-.5)*2.; float a=smoothstep(1.,.2,d); gl_FragColor=vec4(vC.rgb,vC.a*a); }',
    });
    this.pts = new THREE.Points(geo, this.mat); this.pts.frustumCulled = false; this.pts.position.z = 6; scene.add(this.pts); this.geo = geo;
  }
  emit(o) { if (this.p.length < this.N) this.p.push({ x: 0, y: 0, vx: 0, vy: 0, life: 30, size: 8, grow: 0, g: 0, drag: .96, c: [1, 1, 1], ...o, max: o.life ?? 30 }); }
  burst(x, y, n, color, sp = 4, life = 24, size = 8, g = 0.15) {
    const c = col(color);
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = sp * (.3 + Math.random()); this.emit({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: life * (.6 + Math.random() * .6), size: size * (.5 + Math.random()), g, c: [c.r, c.g, c.b] }); }
  }
  update(dt) {
    const k = dt * 60;
    for (const p of this.p) { p.life -= k; p.vy -= p.g * k; p.vx *= Math.pow(p.drag, k); p.vy *= Math.pow(p.drag, k); p.x += p.vx * k; p.y += p.vy * k; p.size += p.grow * k; }
    this.p = this.p.filter((p) => p.life > 0);
    this.p.forEach((p, i) => { const a = Math.max(0, p.life / p.max); this.pos.set([p.x, p.y, 0], i * 3); this.cols.set([p.c[0], p.c[1], p.c[2], a], i * 4); this.sz[i] = p.size * Math.max(.2, a); });
    this.geo.setDrawRange(0, this.p.length);
    for (const a of ['position', 'color', 'size']) this.geo.attributes[a].needsUpdate = true;
  }
}

export class View {
  constructor(host) {
    this.host = host;
    this.r = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    this.r.setClearColor(0x000000);
    host.appendChild(this.r.domElement);
    this.scene = new THREE.Scene();
    this.cam = new THREE.OrthographicCamera(-VW / 2, VW / 2, VH / 2, -VH / 2, -50, 50);
    this.camX = 0; this.shake = 0; this.zoom = 1; this.clock = 0;
    this.layers = []; this.fs = []; this.pm = new Map(); this.fx = [];
    this.parts = new Particles(this.scene);
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.flash = 0; this.dark = 0;
    this.dim = new THREE.Mesh(new THREE.PlaneGeometry(VW * 3, VH * 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false }));
    this.dim.position.z = 4.5; this.scene.add(this.dim);
    this.resize(); addEventListener('resize', () => this.resize());
  }
  resize() {
    const W = this.host.clientWidth || innerWidth, H = this.host.clientHeight || innerHeight;
    const s = Math.min(W / VW, H / VH), w = Math.floor(VW * s), h = Math.floor(VH * s);
    this.r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); this.r.setSize(w, h, true);
    this.r.domElement.style.cssText = `width:${w}px;height:${h}px;position:absolute;left:${(W - w) / 2}px;top:${(H - h) / 2}px`;
    this.pxScale = h / VH * Math.min(devicePixelRatio || 1, 2); this.parts.mat.uniforms.uS.value = this.pxScale;
    this.box = { w, h, l: (W - w) / 2, t: (H - h) / 2 };
    this.host.style.setProperty('--u', (w / VW) + 'px'); this.host.style.setProperty('--bw', w + 'px'); this.host.style.setProperty('--bh', h + 'px');
  }

  setStage(idx) {
    for (const l of this.layers) { this.root.remove(l.mesh); l.mesh.material.map.dispose(); l.mesh.material.dispose(); }
    this.layers = []; this.stage = buildStage(idx);
    const S = this.stage, hz = GROUND + 150;       // horizon : bas des montagnes
    const add = (c, w, h, par, y, z, scale = 2) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(c.width * scale, c.height * scale), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, depthWrite: false }));
      m.position.set(0, y, z); this.root.add(m); this.layers.push({ mesh: m, par });
    };
    add(S.sky, 0, 0, 1, 0, -10, 2);
    add(S.far, 0, 0, .86, GROUND + 175 - 90 + 20, -9, 2);
    add(S.mid, 0, 0, .55, GROUND + 160 - 80 + 12, -8, 2);
    add(S.ground, 0, 0, 0, GROUND - 56, -7, 2);
    // lisière sombre sous le sol
    this.tint = S.tint; this.rain = !!S.snow; this.embers = !!S.embers;
    this.root.children.forEach((m) => m.material && m.material.color && m.material.color.set(S.tint));
  }

  setFighters(world) {
    for (const o of this.fs) { this.root.remove(o.mesh, o.shadow, o.aura); o.tex.dispose(); }
    this.fs = world.fighters.map((f) => {
      const [c, g] = c2(SPR, SPR); const t = tex(c);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SPR, SPR), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(60, 15), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
      const aura = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), new THREE.MeshBasicMaterial({ map: auraTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
      mesh.position.z = 1 + f.slot * 0.01; shadow.position.z = 0.5; aura.position.z = 0.9;
      this.root.add(shadow, aura, mesh);
      return { f, c, g, tex: t, mesh, shadow, aura };
    });
  }

  fxSprite(t, w, h, x, y, color, life, opts = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: col(color), opacity: opts.op ?? 1 }));
    m.position.set(x, y, 5); this.root.add(m); this.fx.push({ m, life, max: life, grow: opts.grow ?? 0, op: opts.op ?? 1, rot: opts.rot ?? 0 });
  }

  // événements du moteur → effets visuels
  handle(e) {
    const P = this.parts, gy = (y) => GROUND + y;
    switch (e.t) {
      case 'hit': P.burst(e.x, gy(e.y), e.big ? 18 : 9, '#fff2a0', e.big ? 6 : 4, 22, e.big ? 14 : 9, 0.2); P.burst(e.x, gy(e.y), e.big ? 8 : 4, '#ff8a2a', 3, 20, 10, 0.1);
        this.fxSprite(projTex('orb', '#ffd23a', '#ffffff'), e.big ? 70 : 44, e.big ? 70 : 44, e.x, gy(e.y), '#ffffff', 7, { grow: 5 }); this.shake = Math.max(this.shake, e.big ? 5 : 2); break;
      case 'block': P.burst(e.x, gy(e.y), 8, '#9ad0ff', 3, 16, 8, 0); this.shake = Math.max(this.shake, 1); break;
      case 'clash': P.burst(e.x, gy(e.y), 14, '#ffffff', 5, 18, 9, 0); this.fxSprite(ringTex, 50, 50, e.x, gy(e.y), '#ffe8a0', 12, { grow: 6 }); break;
      case 'boom': P.burst(e.x, gy(e.y), 26, '#ff9a2a', 7, 30, 16, 0.1); P.burst(e.x, gy(e.y), 14, '#ffee90', 4, 24, 12, 0); this.fxSprite(ringTex, 60, 60, e.x, gy(e.y), '#ffa040', 16, { grow: 9 }); this.shake = Math.max(this.shake, 6); break;
      case 'land': P.burst(e.x, gy(2), e.big ? 14 : 5, '#cdbd9a', e.big ? 3 : 1.6, 24, 9, 0.02); break;
      case 'jump': P.burst(e.x, gy(2), 4, '#cdbd9a', 1.5, 18, 7, 0.02); break;
      case 'quake': P.burst(e.x, gy(4), 16, '#a8885a', 4, 28, 10, 0.2); this.shake = Math.max(this.shake, 5); break;
      case 'puff': P.burst(e.x, gy(e.y), 16, e.color, 3, 22, 14, 0); break;
      case 'cast': { const a = ARCH[e.f.char.arch]; P.burst(e.x + e.f.face * 26, gy(e.y), 8, a.c1, 3, 14, 10, 0); break; }
      case 'whoosh': break;
      case 'ko': this.shake = 9; this.flash = 0.55; break;
      case 'buff': { const a = ARCH[e.f.char.arch]; P.burst(e.f.x, gy(40), 30, a.c1, 5, 34, 14, -0.05); this.fxSprite(ringTex, 80, 80, e.f.x, gy(40), a.c1, 24, { grow: 10 }); break; }
      case 'super': { const a = ARCH[e.f.char.arch]; this.dark = 34; this.superCol = a.c1; this.fxSprite(ringTex, 60, 60, e.f.x, gy(40), a.c2, 30, { grow: 14 }); break; }
      case 'nova': { const a = ARCH[e.f.char.arch]; this.fxSprite(ringTex, 100, 100, e.x, gy(e.y), a.c2, 22, { grow: 22 }); this.fxSprite(projTex('orb', a.c1, a.c2), 160, 160, e.x, gy(e.y), a.c1, 18, { grow: 16 }); P.burst(e.x, gy(e.y), 40, a.c1, 9, 34, 16, 0); this.shake = 10; this.flash = .5; break; }
      default: break;
    }
  }

  syncProj(world) {
    const seen = new Set();
    for (const p of world.projs) {
      seen.add(p.id);
      let o = this.pm.get(p.id);
      if (!o) {
        const a = ARCH[p.owner.char.arch];
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: projTex(p.type, a.c1, a.c2), transparent: true, depthWrite: false, blending: p.type === 'rock' || p.type === 'pillar' ? THREE.NormalBlending : THREE.AdditiveBlending }));
        m.position.z = 2; this.root.add(m); o = { m, dir: Math.sign(p.vx) || p.owner.face }; this.pm.set(p.id, o);
      }
      const sc = p.big ? 1.6 : 1, wob = 1 + Math.sin(p.age * 0.6) * 0.06;
      const w = p.type === 'shock' ? p.w : p.w * 1.25 * sc, h = p.type === 'shock' ? p.h : p.h * 1.25 * sc;
      o.m.scale.set(w * wob * (p.type === 'wave' || p.type === 'blade' ? Math.sign(p.vx || o.dir) : 1), h, 1);
      o.m.position.set(p.x, GROUND + p.y, 2);
      if (p.type === 'rock') o.m.rotation.z = -p.age * 0.2 * o.dir;
      if (p.type === 'needle' || p.type === 'bolt') o.m.rotation.z = Math.atan2(p.vy, Math.abs(p.vx) || 1) * Math.sign(p.vx || 1) * (p.vx < 0 ? -1 : 1) * (p.vx < 0 ? -1 : 1);
      if (p.type === 'pillar') { const k = Math.min(1, p.age / 6); o.m.scale.set(p.w * 1.4, p.h * k, 1); o.m.position.y = GROUND + (p.h * k) / 2; }
      if (this.parts && p.age % 2 === 0 && p.type !== 'pillar' && p.type !== 'shock') { const a = ARCH[p.owner.char.arch], c = col(a.c1); this.parts.emit({ x: p.x - p.vx * 2, y: GROUND + p.y, vx: -p.vx * 0.1, vy: 0, life: 14, size: Math.max(6, p.h * .5), c: [c.r, c.g, c.b], drag: .9 }); }
    }
    for (const [id, o] of this.pm) if (!seen.has(id)) { this.root.remove(o.m); o.m.material.dispose(); this.pm.delete(id); }
  }

  syncBeams(world) {
    this.beamM = this.beamM || (() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.position.z = 3; this.root.add(m); return m; })();
    this.beamMs = this.beamMs || [];
    let i = 0;
    for (const f of world.fighters) if (f.beamOn) {
      let m = this.beamMs[i];
      if (!m) { m = this.beamM.clone(); m.material = this.beamM.material.clone(); this.root.add(m); this.beamMs.push(m); }
      const len = f.move.rx * f.scale, h = (60 + Math.sin(f.t * 1.3) * 12) * f.scale;
      m.visible = true; m.scale.set(len, h, 1); m.material.color.set(ARCH[f.char.arch].c2); m.position.set(f.x + f.face * (len / 2 + 10), GROUND + f.y + 40 * f.scale, 3);
      if (f.t % 2 === 0) this.parts.burst(f.x + f.face * (30 + Math.random() * len), GROUND + f.y + 40, 1, ARCH[f.char.arch].c1, 2, 14, 12, 0);
      i++;
    }
    for (; i < this.beamMs.length; i++) this.beamMs[i].visible = false;
    this.beamM.visible = false;
  }

  render(world, dt, camHint) {
    this.clock += dt * 60;
    // caméra : suit le milieu des combattants vivants
    const alive = world.fighters.filter((f) => f.hp > 0 || !f.dead);
    if (alive.length) {
      let mn = 1e9, mx = -1e9; for (const f of alive) { mn = Math.min(mn, f.x); mx = Math.max(mx, f.x); }
      const lim = Math.max(0, world.half + 30 - VW / 2 / this.zoom), tx = Math.max(-lim, Math.min(lim, (mn + mx) / 2));
      this.camX += (tx - this.camX) * Math.min(1, dt * 7);
      const need = (mx - mn) + 260, tz = Math.max(1, Math.min(1.12, VW / need));
      this.zoom += (tz - this.zoom) * Math.min(1, dt * 4);
    }
    const sx = this.shake > 0.2 ? (Math.random() - .5) * this.shake * 2 : 0, sy = this.shake > 0.2 ? (Math.random() - .5) * this.shake * 2 : 0;
    this.shake *= Math.pow(0.86, dt * 60);
    const cx = this.camX + sx, cyc = sy;
    this.cam.zoom = this.zoom; this.cam.position.set(cx, cyc + (this.zoom - 1) * 90, 10); this.cam.updateProjectionMatrix();
    for (const l of this.layers) l.mesh.position.x = this.camX * l.par;
    this.layers[0].mesh.position.y = 0 + (this.zoom - 1) * -90;
    for (const o of this.fs) {
      const f = o.f, { pose, rot, off } = poseFor(f, this.clock + f.slot * 9);
      drawFighter(o.g, f.char, pose, { rot, off, f, clock: this.clock });
      o.tex.needsUpdate = true;
      const s = f.scale;
      o.mesh.scale.set(s * f.face, s, 1);
      o.mesh.position.x = f.x; o.mesh.position.y = GROUND + f.y + 54 * s;
      o.mesh.material.opacity = f.fade ? 0.25 : (f.invuln > 0 && f.state === 'getup' ? (Math.floor(this.clock / 3) % 2 ? .5 : 1) : 1);
      o.shadow.position.x = f.x; o.shadow.position.y = GROUND - 3; const ss = Math.max(.4, 1 - f.y / 220) * s; o.shadow.scale.set(ss, ss, 1);
      const buffed = !!f.buff; const a = ARCH[f.char.arch];
      o.aura.visible = buffed || (f.state === 'atk' && f.move && f.move.super);
      if (o.aura.visible) { o.aura.position.x = f.x; o.aura.position.y = GROUND + f.y + 44 * s; o.aura.scale.set(s * (1 + Math.sin(this.clock * .3) * .08), s, 1); o.aura.material.color.set(a.c1); o.aura.material.opacity = .85; }
      if (f.fx === 'trail' && Math.floor(this.clock) % 2 === 0) { const c = col(a.c1); this.parts.emit({ x: f.x - f.face * 12, y: GROUND + f.y + 30, vx: -f.face * 1.5, vy: 0, life: 14, size: 22, c: [c.r, c.g, c.b], drag: .9 }); }
      if (f.buff === 'power' && Math.floor(this.clock) % 3 === 0) { const c = col(a.c1); this.parts.emit({ x: f.x + (Math.random() - .5) * 20, y: GROUND + f.y + 10, vx: 0, vy: 1.8, life: 24, size: 9, c: [c.r, c.g, c.b], drag: 1 }); }
    }
    this.syncProj(world); this.syncBeams(world);
    for (const e of this.fx) { e.life -= dt * 60; const k = 1 - e.life / e.max; e.m.scale.x = e.m.scale.y = 1 + k * e.grow * .12; e.m.material.opacity = Math.max(0, e.op * (1 - k)); }
    this.fx = this.fx.filter((e) => { if (e.life <= 0) { this.root.remove(e.m); e.m.material.dispose(); return false; } return true; });
    // ambiance (neige / braises)
    if (this.rain && Math.random() < .6) this.parts.emit({ x: this.camX + (Math.random() - .5) * 700, y: 260, vx: -0.4 + Math.random() * .4, vy: -1.1 - Math.random(), life: 260, size: 5, c: [1, 1, 1], drag: 1 });
    if (this.embers && Math.random() < .4) this.parts.emit({ x: this.camX + (Math.random() - .5) * 700, y: GROUND - 20, vx: Math.random() - .5, vy: .8 + Math.random(), life: 120, size: 6, c: [1, .55, .15], drag: 1 });
    this.parts.update(dt);
    // super : assombrissement
    this.dim.position.x = this.camX;
    if (this.dark > 0) { this.dark -= dt * 60; this.dim.material.opacity = Math.min(.55, this.dark / 20); } else this.dim.material.opacity = 0;
    this.r.render(this.scene, this.cam);
  }
}
