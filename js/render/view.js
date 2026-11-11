// ============================================================
//  VIEW : rendu three.js (caméra orthographique, parallaxe, sprites, particules)
// ============================================================
import * as THREE from 'three';
import { ARCH } from '../data/roster.js';
import { SPR, drawFighter, poseFor } from './sprites.js';
import { buildStage } from '../stages/index.js';
import { projFrames, pillarTex, haloTex, ringTex, flareTex, slashTex, beamTexture, beamCore, FRAMES_N } from './fx.js';

// couleurs d'effets d'un personnage (sa fiche peut surcharger celles de son style)
export const colsOf = (ch) => { const a = ARCH[ch.arch]; return ch.fx || [a.c1, a.c2]; };

export let VW = 640;           // largeur logique : 640 à 1200 selon le format de l'écran (hauteur fixe 480)
export const VH = 480, GROUND = -150;
const tex = (c, nearest = true) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (nearest) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; } t.generateMipmaps = false; return t; };
const c2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const col = (h) => new THREE.Color(h);

const shadowTex = (() => { const [c, g] = c2(64, 16); const gr = g.createRadialGradient(32, 8, 0, 32, 8, 32); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.scale(1, .25); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); g.restore(); return tex(c, false); })();
const auraTex = (() => { const [c, g] = c2(128, 128); const gr = g.createRadialGradient(64, 64, 8, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return tex(c, false); })();

// ---------- particules (Points + shader)
class Particles {
  constructor(scene, N = 700, blend = THREE.AdditiveBlending) {
    this.N = N; this.p = []; this.scale = 1;
    const geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(N * 3); this.cols = new Float32Array(N * 4); this.sz = new Float32Array(N);
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(this.cols, 4)); geo.setAttribute('size', new THREE.BufferAttribute(this.sz, 1));
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: blend, uniforms: { uS: { value: 1 } },
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
    this.cam = new THREE.OrthographicCamera(-VW / 2, VW / 2, VH / 2, -VH / 2, -50, 50); this.vw = VW;
    this.camX = 0; this.shake = 0; this.zoom = 1; this.clock = 0; this.punch = 0; this.focus = null; this.focusT = 0; this.amb = 0;
    this.layers = []; this.fs = []; this.pm = new Map(); this.fx = [];
    this.parts = new Particles(this.scene);
    this.smoke = new Particles(this.scene, 320, THREE.NormalBlending); this.smoke.pts.position.z = 5.5;
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.flash = 0; this.dark = 0;
    this.dim = new THREE.Mesh(new THREE.PlaneGeometry(1200 * 3, VH * 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false }));
    this.dim.position.z = 4.5; this.scene.add(this.dim);
    this.resize(); addEventListener('resize', () => this.resize());
  }
  resize() {
    const W = this.host.clientWidth || innerWidth, H = this.host.clientHeight || innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    VW = Math.round(Math.max(640, Math.min(1200, W / (H / VH))));      // on remplit l'écran en largeur (jusqu à 1200)
    const s = Math.min(H / VH, W / VW), w = Math.floor(VW * s), h = Math.floor(VH * s);
    this.vw = VW; this.cam.left = -VW / 2; this.cam.right = VW / 2; this.cam.updateProjectionMatrix();
    this.r.setPixelRatio(dpr); this.r.setSize(w, h, true);
    this.r.domElement.style.cssText = `width:${w}px;height:${h}px;position:absolute;left:${(W - w) / 2}px;top:${(H - h) / 2}px`;
    this.pxScale = h / VH * dpr; this.parts.mat.uniforms.uS.value = this.pxScale; this.smoke.mat.uniforms.uS.value = this.pxScale;
    this.box = { w, h, l: (W - w) / 2, t: (H - h) / 2, s, vw: VW };
    this.host.style.setProperty('--u', s + 'px');
  }

  setStage(idx) {
    for (const l of this.layers) { this.root.remove(l.mesh); l.mesh.material.map.dispose(); l.mesh.material.dispose(); }
    this.layers = []; this.stage = buildStage(idx);
    const S = this.stage, hz = GROUND + 150;       // horizon : bas des montagnes
    const add = (c, w, h, par, y, z, scale = 2) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(c.width * scale, c.height * scale), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, depthWrite: false }));
      m.position.set(0, y, z); this.root.add(m); this.layers.push({ mesh: m, par, bw: c.width * scale });
    };
    add(S.sky, 0, 0, 1, 0, -10, 2);
    add(S.far, 0, 0, .86, GROUND + 175 - 90 + 20, -9, 2);
    add(S.mid, 0, 0, .55, GROUND + 160 - 80 + 12, -8, 2);
    add(S.ground, 0, 0, 0, GROUND - 56, -7, 2);
    // lisière sombre sous le sol
    this.tint = S.tint; this.rain = !!S.snow; this.embers = !!S.embers; this.amb = idx;
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
    m.position.set(x, y, 5); m.rotation.z = opts.rot ?? 0; this.root.add(m); this.fx.push({ m, life, max: life, grow: opts.grow ?? 0, op: opts.op ?? 1, rot: opts.rot ?? 0 });
  }

  // événements du moteur → effets visuels
  handle(e) {
    const P = this.parts, SM = this.smoke, gy = (y) => GROUND + y;
    const cf = (f) => (f ? colsOf(f.char) : ['#ffb02a', '#fff2a0']);
    switch (e.t) {
      case 'hit': {
        const [c1, c2] = cf(e.att), big = e.big, x = e.x, y = gy(e.y);
        if (big) this.punch = Math.max(this.punch, 0.06);
        P.burst(x, y, big ? 22 : 10, '#fff2a0', big ? 7 : 4.5, 22, big ? 13 : 8, 0.22); P.burst(x, y, big ? 12 : 5, c1, 3.5, 22, 10, 0.12);
        for (let i = 0; i < (big ? 8 : 4); i++) { const a = (e.dir > 0 ? 0 : Math.PI) + (Math.random() - .5) * 1.6; P.emit({ x, y, vx: Math.cos(a) * (6 + Math.random() * 6), vy: Math.sin(a) * (6 + Math.random() * 6) * .6, life: 14, size: 5, c: [1, 1, .85], drag: .88, g: .1 }); }
        this.fxSprite(flareTex, big ? 120 : 76, big ? 120 : 76, x, y, c2, big ? 9 : 6, { grow: 3, rot: Math.random() * 3 });
        this.fxSprite(ringTex, 30, 30, x, y, c1, big ? 10 : 7, { grow: big ? 16 : 10, op: .8 });
        this.shake = Math.max(this.shake, big ? 5 : 2); break; }
      case 'block': P.burst(e.x, gy(e.y), 8, '#9ad0ff', 3, 16, 8, 0); this.fxSprite(ringTex, 34, 34, e.x, gy(e.y), '#9ad0ff', 9, { grow: 8, op: .8 }); this.shake = Math.max(this.shake, 1); break;
      case 'clash': P.burst(e.x, gy(e.y), 14, '#ffffff', 5, 18, 9, 0); this.fxSprite(ringTex, 50, 50, e.x, gy(e.y), '#ffe8a0', 12, { grow: 6 }); this.fxSprite(flareTex, 90, 90, e.x, gy(e.y), '#ffffff', 8, { grow: 4 }); break;
      case 'boom': {
        const [c1, c2] = cf(e.f), x = e.x, y = gy(e.y);
        this.fxSprite(haloTex, 190, 190, x, y, c1, 18, { grow: 9, op: .9 }); this.fxSprite(flareTex, 140, 140, x, y, c2, 12, { grow: 7 });
        this.fxSprite(ringTex, 60, 60, x, y, c2, 18, { grow: 14 });
        P.burst(x, y, 30, c1, 8, 32, 17, 0.12); P.burst(x, y, 16, '#fff6c0', 5, 24, 11, 0); P.burst(x, y, 18, c2, 10, 40, 5, 0.3);
        for (let i = 0; i < 12; i++) SM.emit({ x: x + (Math.random() - .5) * 40, y: y + (Math.random() - .3) * 30, vx: (Math.random() - .5) * 2.4, vy: .6 + Math.random() * 1.6, life: 52 + Math.random() * 26, size: 22 + Math.random() * 20, grow: .5, c: [.16, .14, .13], drag: .97 });
        this.shake = Math.max(this.shake, 7); break; }
      case 'land': P.burst(e.x, gy(2), e.big ? 14 : 5, '#cdbd9a', e.big ? 3 : 1.6, 24, 9, 0.02); if (e.big) for (let i = 0; i < 5; i++) SM.emit({ x: e.x + (Math.random() - .5) * 30, y: gy(4), vx: (Math.random() - .5) * 3, vy: .4 + Math.random() * .6, life: 34, size: 18, grow: .5, c: [.5, .45, .36], drag: .94 }); break;
      case 'jump': P.burst(e.x, gy(2), 4, '#cdbd9a', 1.5, 18, 7, 0.02); break;
      case 'quake': P.burst(e.x, gy(4), 16, '#a8885a', 4, 28, 10, 0.2); for (let i = 0; i < 8; i++) SM.emit({ x: e.x + (Math.random() - .5) * 50, y: gy(6), vx: (Math.random() - .5) * 3, vy: .5 + Math.random(), life: 40, size: 22, grow: .6, c: [.42, .36, .28], drag: .95 }); this.shake = Math.max(this.shake, 5); break;
      case 'puff': P.burst(e.x, gy(e.y), 16, e.color, 3, 22, 14, 0); for (let i = 0; i < 4; i++) SM.emit({ x: e.x, y: gy(e.y), vx: (Math.random() - .5) * 2, vy: Math.random(), life: 30, size: 18, grow: .5, c: [.3, .3, .34], drag: .95 }); break;
      case 'cast': { const [c1, c2] = cf(e.f); P.burst(e.x + e.f.face * 26, gy(e.y), 9, c1, 3, 14, 10, 0); this.fxSprite(flareTex, 54, 54, e.x + e.f.face * 28, gy(e.y), c2, 9, { grow: 3 }); break; }
      case 'swing': if (e.f && e.f.char.weapon) this.slash(e.f, e.m); break;
      case 'ko': this.shake = 9; this.flash = 0.55; this.punch = 0.38; this.focus = e.f.x; this.focusT = 90; break;
      case 'buff': { const [c1] = cf(e.f); P.burst(e.f.x, gy(40), 30, c1, 5, 34, 14, -0.05); this.fxSprite(ringTex, 80, 80, e.f.x, gy(40), c1, 24, { grow: 10 }); break; }
      case 'super': { this.punch = Math.max(this.punch, 0.2); this.focus = e.f.x; this.focusT = 50; const [c1, c2] = cf(e.f); this.dark = 34; this.superCol = c1; this.fxSprite(ringTex, 60, 60, e.f.x, gy(40), c2, 30, { grow: 14 }); this.fxSprite(haloTex, 140, 140, e.f.x, gy(44), c1, 34, { grow: 5, op: .8 }); break; }
      case 'nova': { this.punch = Math.max(this.punch, 0.26); this.focus = e.f.x; this.focusT = 40; const [c1, c2] = cf(e.f); const x = e.x, y = gy(e.y); this.fxSprite(ringTex, 100, 100, x, y, c2, 22, { grow: 22 }); this.fxSprite(ringTex, 60, 60, x, y, c1, 28, { grow: 30 }); this.fxSprite(haloTex, 200, 200, x, y, c1, 24, { grow: 14 }); this.fxSprite(flareTex, 170, 170, x, y, c2, 16, { grow: 10 }); P.burst(x, y, 50, c1, 10, 36, 16, 0); P.burst(x, y, 24, c2, 14, 40, 6, 0.2); this.shake = 10; this.flash = .5; break; }
      case 'awaken': { this.punch = Math.max(this.punch, 0.3); this.focus = e.f.x; this.focusT = 60; const [c1, c2] = cf(e.f); this.fxSprite(haloTex, 240, 240, e.f.x, gy(44), c1, 40, { grow: 10, op: .9 }); this.fxSprite(ringTex, 70, 70, e.f.x, gy(40), c2, 34, { grow: 24 }); P.burst(e.f.x, gy(30), 40, c1, 6, 46, 14, -0.04); this.dark = 24; this.superCol = c1; this.shake = 8; break; }
      case 'team': { const [c1, c2] = cf(e.f); this.fxSprite(ringTex, 90, 90, e.f.x, gy(40), c1, 26, { grow: 22 }); this.fxSprite(flareTex, 150, 150, e.f.x, gy(40), c2, 14, { grow: 8 }); this.dark = 22; this.superCol = c1; break; }
      case 'fxring': this.fxSprite(ringTex, e.s || 60, e.s || 60, e.x, gy(e.y), e.color, e.life || 20, { grow: e.grow || 14, op: .9 }); break;
      case 'fxflash': this.fxSprite(flareTex, e.s || 120, e.s || 120, e.x, gy(e.y), e.color, e.life || 10, { grow: 6 }); this.fxSprite(haloTex, (e.s || 120) * 1.4, (e.s || 120) * 1.4, e.x, gy(e.y), e.color, e.life || 10, { grow: 6, op: .8 }); break;
      case 'fxburst': P.burst(e.x, gy(e.y), e.n || 20, e.color, e.sp || 6, e.life || 28, e.size || 10, e.g ?? 0.1); break;
      default: break;
    }
  }

  // arc de lame : traé qui accompagne les coups des personnages armés
  slash(f, m) {
    const R2 = Math.random;
    const [c1, c2] = colsOf(f.char), big = m && (m.super || m.id === 'smash' || m.id === 'punch3' || m.id === 'kick' || m.id === 'sweep' || m.id === 'upper');
    const ang = m && m.id === 'upper' ? 1.1 : m && m.id === 'sweep' ? -0.7 : m && (m.id === 'akick' || m.id === 'apunch') ? -0.4 : (Math.random() - .5) * 0.5;
    const L = (m && m.rx ? Math.min(150, m.rx + 28) : 90) * f.scale * (f.char.reach || 1), x = f.x + f.face * L * 0.5, y = GROUND + f.y + 46 * f.scale;
    const mt = new THREE.Mesh(new THREE.PlaneGeometry(L, big ? 66 : 44), new THREE.MeshBasicMaterial({ map: slashTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: col(c2), opacity: .95 }));
    mt.position.set(x, y, 4.6); mt.scale.x = f.face; mt.rotation.z = ang * f.face; this.root.add(mt);
    this.fx.push({ m: mt, life: big ? 9 : 7, max: big ? 9 : 7, grow: 0, op: .95, rot: 0, slash: true });
    // seconde couche plus large dans la couleur principale, puis gerbe propre à l'élément du style
    const m2 = new THREE.Mesh(new THREE.PlaneGeometry(L * 1.25, big ? 96 : 64), new THREE.MeshBasicMaterial({ map: slashTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: col(c1), opacity: .6 }));
    m2.position.set(x, y, 4.5); m2.scale.x = f.face; m2.rotation.z = ang * f.face; this.root.add(m2);
    this.fx.push({ m: m2, life: big ? 12 : 9, max: big ? 12 : 9, grow: 0, op: .6, rot: 0, slash: true });
    const A = f.char.arch, el = ['fire', 'lava', 'sun'].includes(A) ? 'fire' : ['water', 'ice', 'frost'].includes(A) ? 'water' : ['lightning', 'light'].includes(A) ? 'spark' : null;
    if (el) for (let i = 0; i < (big ? 10 : 5); i++) this.parts.emit({ x: x + f.face * (L * (R2() - .2)), y: y + (R2() - .5) * 40, vx: f.face * (1 + R2() * 3), vy: el === 'fire' ? .8 + R2() * 2 : (R2() - .5) * 3, life: 18 + R2() * 10, size: 5 + R2() * 5, c: el === 'fire' ? [1, .6, .15] : el === 'water' ? [.6, .9, 1] : [1, 1, .6], drag: .93, g: el === 'water' ? .1 : 0 });
    this.parts.burst(x + f.face * L * 0.35, y, 3, c1, 3, 12, 6, 0);
  }

  syncProj(world) {
    const seen = new Set(), DIR = new Set(['lightning', 'light', 'bone', 'puppet', 'blade', 'wind', 'fury', 'shadow', 'fire', 'water', 'ice', 'orb', 'brawler']);
    for (const p of world.projs) {
      seen.add(p.id);
      const ch = p.owner.char, [c1, c2] = colsOf(ch);
      let style = p.style || (p.type === 'needle' ? (['bone', 'ice', 'puppet'].includes(ch.arch) ? ch.arch : 'puppet') : p.type === 'rock' ? 'earth' : p.type === 'bolt' && !['lightning', 'light'].includes(ch.arch) ? 'lightning' : ch.arch);
      if (p.type === 'shock') style = 'shock';
      let o = this.pm.get(p.id);
      if (!o) {
        const solid = p.type === 'pillar' || ['earth', 'sand', 'bone', 'puppet', 'ice', 'art'].includes(style);
        const frames = p.type === 'pillar' ? [pillarTex(ch.arch, c1, c2)] : p.type === 'shock' ? null : projFrames(style, c1, c2);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: frames ? frames[0] : flareTex, transparent: true, depthWrite: false, blending: solid || p.type === 'pillar' ? THREE.NormalBlending : THREE.AdditiveBlending, color: p.type === 'shock' ? col(c2) : 0xffffff }));
        m.position.z = 2; this.root.add(m);
        const h = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: col(c1), opacity: .55 }));
        h.position.z = 1.9; if (p.type === 'pillar' || p.type === 'shock' || style === 'poison' || style === 'zone') h.visible = false; this.root.add(h);
        o = { m, h, frames, style, dir: Math.sign(p.vx) || p.owner.face }; this.pm.set(p.id, o);
      }
      const sc = p.big ? 1.6 : 1, dir = Math.sign(p.vx || o.dir) || 1;
      if (o.frames && o.frames.length > 1) o.m.material.map = o.frames[Math.floor(p.age / 2) % o.frames.length];
      const pulse = 1 + Math.sin(p.age * 0.5) * 0.05;
      let w = p.w * 1.5 * sc, h = p.h * 1.5 * sc;
      if (p.type === 'shock') { w = p.w * (1 + p.age * 0.1); h = p.h * (1 + p.age * 0.1); o.m.material.opacity = Math.max(0, 1 - p.age / 6); }
      const vert = DIR.has(o.style) && Math.abs(p.vx) <= 0.3 && Math.abs(p.vy) > 2;
      o.m.scale.set(w * pulse * (DIR.has(o.style) && !vert ? dir : 1), h * pulse, 1);
      o.m.position.set(p.x, GROUND + p.y, 2);
      o.m.rotation.z = 0;
      if (o.style === 'earth' && p.type !== 'pillar') o.m.rotation.z = -p.age * 0.2 * o.dir;
      else if (vert) o.m.rotation.z = p.vy < 0 ? -Math.PI / 2 : Math.PI / 2;
      else if (DIR.has(o.style) && Math.abs(p.vy) > 0.4 && Math.abs(p.vx) > 0.3) o.m.rotation.z = Math.atan2(p.vy, Math.abs(p.vx)) * dir;
      if (p.type === 'pillar') { const k = Math.min(1, p.age / 6); o.m.scale.set(p.w * 1.5, p.h * k, 1); o.m.position.y = GROUND + (p.h * k) / 2; }
      o.h.position.set(p.x, GROUND + p.y, 1.9); const hs = Math.max(p.w, p.h) * 2.6 * sc * (1 + Math.sin(p.age * 0.4) * 0.08); o.h.scale.set(hs, hs, 1);
      if (this.parts && p.age % 2 === 0 && p.type !== 'pillar' && p.type !== 'shock') {
        const c = col(c1), c_ = col(c2), n = ['fire', 'orb', 'art', 'sage'].includes(o.style) ? 2 : 1;
        for (let i = 0; i < n; i++) this.parts.emit({ x: p.x - p.vx * (2 + i * 2), y: GROUND + p.y + (Math.random() - .5) * p.h * .5, vx: -p.vx * 0.12, vy: (Math.random() - .3) * .8, life: 16, size: Math.max(5, p.h * .45), c: i ? [c_.r, c_.g, c_.b] : [c.r, c.g, c.b], drag: .9 });
        if (['fire', 'art', 'poison', 'shadow'].includes(o.style) && this.smoke && p.age % 4 === 0) this.smoke.emit({ x: p.x - p.vx * 3, y: GROUND + p.y, vx: -p.vx * 0.05, vy: .4, life: 30, size: p.h * .7, grow: .5, c: o.style === 'poison' ? [.2, .32, .1] : o.style === 'shadow' ? [.12, .06, .2] : [.2, .17, .15], drag: .96 });
        if (['lightning', 'light'].includes(o.style) && p.age % 3 === 0) this.parts.burst(p.x, GROUND + p.y, 1, c2, 3, 8, 4, 0);
      }
    }
    for (const [id, o] of this.pm) if (!seen.has(id)) { this.root.remove(o.m, o.h); o.m.material.dispose(); o.h.material.dispose(); this.pm.delete(id); }
  }

  // faisceaux : 3 couches (halo, plasma qui défile, cœur blanc) + flare d'origine et d'impact
  syncBeams(world) {
    this.beamPool = this.beamPool || [];
    let i = 0;
    for (const f of world.fighters) if (f.beamOn) {
      let b = this.beamPool[i];
      if (!b) {
        const mkL = (map, bl = THREE.AdditiveBlending) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, blending: bl })); m.position.z = 3; this.root.add(m); return m; };
        const plasma = beamTexture();
        b = { outer: mkL(beamCore), mid: mkL(plasma), core: mkL(beamCore), a: mkL(flareTex), z: mkL(flareTex), plasma }; this.beamPool.push(b);
      }
      const [c1, c2] = colsOf(f.char), s = f.scale, len = f.move.rx * s, k = Math.min(1, (f.t - f.move.su) / 6), fl = 1 + Math.sin(f.t * 1.7) * 0.12;
      const h = (f.move.bh || 60) * s * fl * k, cx = f.x + f.face * (len / 2 + 10), cy = GROUND + f.y + 40 * s;
      for (const m of [b.outer, b.mid, b.core, b.a, b.z]) m.visible = true;
      b.outer.scale.set(len, h * 2.1, 1); b.outer.position.set(cx, cy, 2.9); b.outer.material.color.set(c1); b.outer.material.opacity = .55;
      b.plasma.repeat.x = Math.max(1, len / 160); b.plasma.offset.x = -this.clock * 0.045 * (f.face > 0 ? 1 : -1);
      b.mid.scale.set(len * f.face, h * 1.25, 1); b.mid.position.set(cx, cy, 3); b.mid.material.color.set(c2); b.mid.material.opacity = .95;
      b.core.scale.set(len, h * 0.45, 1); b.core.position.set(cx, cy, 3.1); b.core.material.color.set('#ffffff'); b.core.material.opacity = 1;
      const fs = (90 + Math.sin(f.t * 1.9) * 14) * s * k;
      b.a.scale.set(fs, fs, 1); b.a.position.set(f.x + f.face * 24 * s, cy, 3.2); b.a.material.color.set(c2); b.a.rotation.z = f.t * 0.2;
      b.z.scale.set(fs * 1.5, fs * 1.5, 1); b.z.position.set(f.x + f.face * (len + 6), cy, 3.2); b.z.material.color.set(c1); b.z.rotation.z = -f.t * 0.15;
      if (f.t % 2 === 0) { const x = f.x + f.face * (30 + Math.random() * len); this.parts.burst(x, cy + (Math.random() - .5) * h, 1, Math.random() > .5 ? c1 : c2, 2.4, 14, 11, 0); }
      if (f.t % 3 === 0) this.parts.emit({ x: f.x + f.face * (len + 6), y: cy + (Math.random() - .5) * h, vx: f.face * (2 + Math.random() * 3), vy: (Math.random() - .5) * 5, life: 18, size: 6, c: [1, .95, .8], drag: .93, g: .12 });
      if (f.t % 5 === 0 && this.smoke) this.smoke.emit({ x: f.x + f.face * (len + 6), y: GROUND + 4, vx: (Math.random() - .5) * 2, vy: .7, life: 34, size: 20, grow: .5, c: [.28, .24, .22], drag: .95 });
      i++;
    }
    for (; i < this.beamPool.length; i++) for (const m of [this.beamPool[i].outer, this.beamPool[i].mid, this.beamPool[i].core, this.beamPool[i].a, this.beamPool[i].z]) m.visible = false;
  }

  render(world, dt, camHint) {
    this.clock += dt * 60;
    // caméra : suit le milieu des combattants vivants
    const alive = world.fighters.filter((f) => f.hp > 0 || !f.dead);
    if (alive.length) {
      let mn = 1e9, mx = -1e9; for (const f of alive) { mn = Math.min(mn, f.x); mx = Math.max(mx, f.x); }
      const lim = Math.max(0, world.half + 30 - VW / 2 / this.zoom); this.lim = lim; const tx = Math.max(-lim, Math.min(lim, (mn + mx) / 2));
      const fx = this.focusT > 0 && this.focus != null ? Math.max(-lim, Math.min(lim, this.focus)) : tx;
      this.camX += (fx - this.camX) * Math.min(1, dt * (this.focusT > 0 ? 5 : 7));
      const need = (mx - mn) + 260, tz = Math.max(1, Math.min(1.12, 640 / need));
      this.zoom += (tz + this.punch - this.zoom) * Math.min(1, dt * 5);
      if (this.focusT > 0) this.focusT -= dt * 60;
      this.punch *= Math.pow(0.965, dt * 60);
    }
    const sx = this.shake > 0.2 ? (Math.random() - .5) * this.shake * 2 : 0, sy = this.shake > 0.2 ? (Math.random() - .5) * this.shake * 2 : 0;
    this.shake *= Math.pow(0.86, dt * 60);
    const cx = this.camX + sx, cyc = sy;
    this.cam.zoom = this.zoom; this.cam.position.set(cx, cyc + (this.zoom - 1) * 90, 10); this.cam.updateProjectionMatrix();
    for (const l of this.layers) { l.mesh.position.x = this.camX * l.par; const need = (VW + 2 * (this.lim || 0) * (1 - l.par)) + 12, k = Math.max(1, need / l.bw); l.mesh.scale.x = k; if (l === this.layers[0]) l.mesh.scale.y = k; }
    this.layers[0].mesh.position.y = 0 + (this.zoom - 1) * -90;
    for (const o of this.fs) {
      const f = o.f, { pose, rot, off } = poseFor(f, this.clock + f.slot * 9);
      drawFighter(o.g, f.char, pose, { rot, off, f, clock: this.clock });
      o.tex.needsUpdate = true;
      const s = f.scale;
      // étirement / écrasement (anticipation, coup, impact reçu)
      let kx = 1, ky = 1;
      if (f.state === 'atk' && f.move) { const su = Math.max(1, f.move.su), t = f.t; if (t < su) { kx = 1 - 0.07 * (t / su); ky = 1 + 0.06 * (t / su); } else if (t < su + 4) { kx = 1.12; ky = 0.94; } }
      else if (f.state === 'hit' && f.t < 5) { kx = 0.9; ky = 1.08; }
      else if (f.state === 'jump' && f.vy > 4) { kx = 0.95; ky = 1.06; }
      o.mesh.scale.set(s * f.face * kx, s * ky, 1);
      o.mesh.position.x = f.x; o.mesh.position.y = GROUND + f.y + 54 * s;
      o.mesh.material.opacity = f.fade ? 0.25 : (f.invuln > 0 && f.state === 'getup' ? (Math.floor(this.clock / 3) % 2 ? .5 : 1) : 1);
      o.shadow.position.x = f.x; o.shadow.position.y = GROUND - 3; const ss = Math.max(.4, 1 - f.y / 220) * s; o.shadow.scale.set(ss, ss, 1);
      const buffed = !!f.buff; const [fc1] = colsOf(f.char), a = { c1: fc1 };
      // aura : discrète en permanence (couleur du personnage), plus vive en attaque spéciale, éclatante sous Éveil / ultime
      const big = buffed || (f.state === 'atk' && f.move && f.move.super), cast = f.state === 'atk' && f.move && (f.move.special || f.move.beam), charge = f.state === 'charge';
      o.aura.visible = f.hp > 0 || !f.dead;
      if (o.aura.visible) { o.aura.position.x = f.x; o.aura.position.y = GROUND + f.y + 44 * s; const k = big ? 1.25 : cast || charge ? 1.05 : 0.8; o.aura.scale.set(s * k * (1 + Math.sin(this.clock * .3) * .08), s * k, 1); o.aura.material.color.set(a.c1); o.aura.material.opacity = big ? .9 : cast || charge ? .55 : .16; }
      if (f.fx === 'trail' && Math.floor(this.clock) % 2 === 0) { const c = col(a.c1); this.parts.emit({ x: f.x - f.face * 12, y: GROUND + f.y + 30, vx: -f.face * 1.5, vy: 0, life: 14, size: 22, c: [c.r, c.g, c.b], drag: .9 }); }
      if (f.buff === 'power' && Math.floor(this.clock) % 3 === 0) { const c = col(a.c1); this.parts.emit({ x: f.x + (Math.random() - .5) * 20, y: GROUND + f.y + 10, vx: 0, vy: 1.8, life: 24, size: 9, c: [c.r, c.g, c.b], drag: 1 }); }
    }
    this.syncProj(world); this.syncBeams(world);
    for (const e of this.fx) { e.life -= dt * 60; const k = 1 - e.life / e.max; if (e.slash) { e.m.material.opacity = Math.max(0, e.op * (1 - k * k)); e.m.scale.y = 1 - k * .5; } else { e.m.scale.x = e.m.scale.y = 1 + k * e.grow * .12; e.m.material.opacity = Math.max(0, e.op * (1 - k)); } }
    this.fx = this.fx.filter((e) => { if (e.life <= 0) { this.root.remove(e.m); e.m.material.dispose(); return false; } return true; });
    // ambiance (neige / braises)
    if (this.rain && Math.random() < .6) this.parts.emit({ x: this.camX + (Math.random() - .5) * 700, y: 260, vx: -0.4 + Math.random() * .4, vy: -1.1 - Math.random(), life: 260, size: 5, c: [1, 1, 1], drag: 1 });
    if (this.embers && Math.random() < .4) this.parts.emit({ x: this.camX + (Math.random() - .5) * 700, y: GROUND - 20, vx: Math.random() - .5, vy: .8 + Math.random(), life: 120, size: 6, c: [1, .55, .15], drag: 1 });
    // ambiance par décor : pétales (forêt), pollen et herbe (plaines), sable soufflé (désert), lucioles (temple)
    const R = Math.random, ax = () => this.camX + (R() - .5) * 760;
    if (this.amb === 0 && R() < .22) this.parts.emit({ x: ax(), y: 250, vx: .5 + R() * .6, vy: -.5 - R() * .5, life: 300, size: 6 + R() * 4, c: R() < .6 ? [1, .72, .8] : [.7, 1, .5], drag: 1 });
    if (this.amb === 1 && R() < .2) this.parts.emit({ x: ax(), y: GROUND + 10 + R() * 200, vx: 1.2 + R(), vy: .15 * (R() - .5), life: 200, size: 4, c: [1, 1, .8], drag: 1 });
    if (this.amb === 2 && R() < .5) this.parts.emit({ x: this.camX - 380, y: GROUND + R() * 180, vx: 4 + R() * 3, vy: (R() - .5) * .5, life: 170, size: 5, c: [.95, .78, .5], drag: 1 });
    if (this.amb === 4 && R() < .15) this.parts.emit({ x: ax(), y: GROUND + 10 + R() * 220, vx: (R() - .5) * .4, vy: (R() - .5) * .4, life: 220, size: 6, c: [.7, .85, 1], drag: 1 });
    this.parts.update(dt); this.smoke.update(dt);
    // super : assombrissement
    this.dim.position.x = this.camX;
    if (this.dark > 0) { this.dark -= dt * 60; this.dim.material.opacity = Math.min(.55, this.dark / 20); } else this.dim.material.opacity = 0;
    this.r.render(this.scene, this.cam);
  }
}
