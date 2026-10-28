// Animated 32x64 pixel sprites for each commander, themed on their focus.
// Built with the shared paper-doll renderer; 4 idle frames each.

import { drawPerson, solid, SW, SH } from './chars.js';
import { makeCanvas } from './sprites.js';

const pinstripe = (base, line) => (x) => (x % 3 === 0 ? line : base);

function line(r, x0, y0, x1, y1, col, w = 1) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const t = n ? i / n : 0;
    r(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), w, w, col);
  }
}

const SPECS = {
  // Damage soldier: power armour, glowing visor, pulse rifle
  vanguard: (f) => ({
    top: solid('#1c2a4a'), sleeve: solid('#2a3f6e'), hand: '#1c2a4a', pants: solid('#1c2a4a'), shoes: '#111522',
    face: 'clean', hair: { style: 'short', color: '#2a2a2a', dark: '#151515', light: '#3a3a3a' },
    armL: 'front', armR: 'hold',
    topDetail: ({ r, b }) => {
      r(11, 20 + b, 10, 10, '#2a3f6e'); r(11, 20 + b, 10, 1, '#2ef2ff');
      r(15, 23 + b, 2, 3, '#2ef2ff'); r(9, 34, 14, 2, '#111522');
    },
    pantsDetail: ({ r }) => { r(11, 47, 3, 2, '#2a3f6e'); r(18, 47, 3, 2, '#2a3f6e'); },
    headwear: ({ r, b }) => {
      r(10, 2 + b, 12, 7, '#2a3f6e'); r(10, 2 + b, 12, 1, '#4a6aa8');
      r(10, 9 + b, 2, 4, '#2a3f6e'); r(20, 9 + b, 2, 4, '#2a3f6e');
      r(11, 9 + b, 10, 2, f % 2 ? '#2ef2ff' : '#1aa8c8');           // visor
    },
    front: ({ r, b }) => { line(r, 9, 32 + b, 30, 21 + b, '#3a3f4a', 2); r(12, 30 + b, 4, 2, '#22252e'); },
    glow: ({ r, b }) => { if (f % 2) { r(31, 20 + b, 1, 1, '#2ef2ff'); r(30, 20 + b, 1, 1, '#bff8ff'); } },
  }),
  // Builder: hard hat, hi-vis vest, sparking wrench
  engineer: (f) => ({
    top: solid('#5a6070'), forearm: solid('#f2c9a7'), cuff: '#5a6070', hand: '#c9a050',
    pants: solid('#2f4a7a'), shoes: '#3a2414',
    face: 'clean', hair: { style: 'short', color: '#6b4a2e', dark: '#4a3220', light: '#8a643e' },
    armL: 'hip', armR: 'up',
    topDetail: ({ r, b }) => {
      r(10, 19 + b, 5, 16, '#ff8a1f'); r(17, 19 + b, 5, 16, '#ff8a1f');
      r(10, 27 + b, 5, 1, '#ffe84a'); r(17, 27 + b, 5, 1, '#ffe84a');
      r(10, 31 + b, 5, 1, '#ffe84a'); r(17, 31 + b, 5, 1, '#ffe84a');
      r(9, 35, 14, 2, '#6b4a2e'); r(11, 35, 2, 3, '#9a9aa8'); r(19, 35, 1, 3, '#c0392b');
    },
    headwear: ({ r, b }) => {
      r(11, 2 + b, 10, 4, '#ffd23f'); r(9, 6 + b, 14, 1, '#e0b020');
      r(13, 2 + b, 3, 1, '#fff2a0'); r(15, 1 + b, 2, 1, '#ffd23f');
    },
    armRProp: ({ r, b }) => { r(24, 2 + b, 2, 6, '#9aa0b0'); r(23, 1 + b, 4, 1, '#9aa0b0'); r(23, -1 + b, 1, 2, '#9aa0b0'); r(26, -1 + b, 1, 2, '#9aa0b0'); },
    glow: ({ r, b }) => {
      if (f % 2) for (const [x, y] of [[22, 0], [27, 1], [21, 2], [28, -1 + 2]]) r(x, y + b, 1, 1, '#ffe84a');
    },
  }),
  // Frost mage: hooded ice robe, crystal staff, falling snow
  cryomancer: (f) => ({
    top: solid('#8fe8ff'), sleeve: solid('#6fc8e8'), coat: solid('#6fc8e8'), coatSplit: '#3f8fb0', hand: '#e8d4c8', pants: solid('#3f8fb0'),
    shoes: '#3f8fb0', skin: '#e8d4c8', skinD: '#c8b0a4', beard: '#e8f4ff', beardL: '#ffffff', brow: '#e8f4ff', eye: '#2ef2ff',
    face: 'beard', armL: 'hip', armR: 'up',
    topDetail: ({ r, b }) => { r(15, 18 + b, 2, 19 - b, '#3f8fb0'); r(9, 30 + b, 14, 1, '#e8f4ff'); },
    headwear: ({ r, b }) => {
      r(10, 2 + b, 12, 5, '#5fb8d8'); r(12, 1 + b, 8, 1, '#5fb8d8');
      r(9, 5 + b, 3, 13, '#5fb8d8'); r(20, 5 + b, 3, 13, '#5fb8d8');
      r(10, 6 + b, 1, 10, '#3f8fb0'); r(21, 6 + b, 1, 10, '#3f8fb0');
    },
    back: ({ r, b }) => { r(24, 3 + b, 2, 52, '#6b4a2e'); },
    glow: ({ r, b }) => {
      r(24, 0 + b, 2, 3, f % 2 ? '#bff8ff' : '#2ef2ff'); r(23, 1 + b, 4, 1, '#2ef2ff');
      for (let i = 0; i < 6; i++) r((i * 7 + 3) % 31, (i * 11 + f * 4) % 60, 1, 1, '#e8f4ff');
    },
  }),
  // Bio specialist: hazmat suit, gas mask, bubbling vial
  biotech: (f) => ({
    top: solid('#9be04a'), sleeve: solid('#8ad03a'), hand: '#1a1a1a', pants: solid('#8ad03a'), shoes: '#1a1a1a',
    face: 'none', armL: 'hip', armR: 'up',
    topDetail: ({ r, b }) => {
      r(15, 19 + b, 2, 18 - b, '#5f9a2a'); r(9, 35, 14, 1, '#5f9a2a');
      r(14, 23 + b, 4, 4, '#ffe84a'); r(15, 24 + b, 2, 2, '#1a1a1a');  // hazard badge
    },
    faceDetail: ({ r, b }) => {
      r(10, 4 + b, 12, 13, '#9be04a');
      r(12, 7 + b, 8, 4, '#1a2a2a'); r(13, 7 + b, 2, 1, '#6a8a8a');
      r(11, 12 + b, 3, 3, '#444450'); r(18, 12 + b, 3, 3, '#444450'); r(15, 12 + b, 2, 4, '#2a2a30');
    },
    armRProp: ({ r, b }) => { r(24, 1 + b, 3, 6, '#d0f0ff'); r(24, 3 + b, 3, 4, '#4dff8a'); r(25, 0 + b, 1, 1, '#9aa0b0'); },
    glow: ({ r, b }) => {
      r(25, (5 - f) + b, 1, 1, '#e8ffe8');
      r(24 + (f % 2) * 2, -1 + ((f + 2) % 4) + b, 1, 1, '#b6ff9a');
    },
  }),
  // Money: top hat, suit, monocle, flipping a gold coin
  tycoon: (f) => ({
    top: solid('#1a1a22'), hand: '#f0f0f0', pants: pinstripe('#1a1a22', '#2c2c38'), shoes: '#0c0c10',
    face: 'clean', hair: { style: 'short', color: '#9a9aa8', dark: '#6a6a78', light: '#c0c0cc' },
    armL: 'hip', armR: 'up',
    topDetail: ({ r, b }) => {
      r(14, 18 + b, 4, 8, '#f0f0f0'); r(15, 19 + b, 2, 8, '#ffd23f');
      r(12, 25 + b, 8, 10, '#7a5a10'); r(15, 25 + b, 2, 10, '#5a4008');
      r(14, 27 + b, 1, 1, '#ffd23f'); r(14, 30 + b, 1, 1, '#ffd23f'); r(17, 27 + b, 1, 1, '#ffd23f'); r(17, 30 + b, 1, 1, '#ffd23f');
    },
    faceDetail: ({ r, b }) => {
      r(12, 13 + b, 8, 1, '#5a5a66'); r(11, 12 + b, 1, 1, '#5a5a66'); r(20, 12 + b, 1, 1, '#5a5a66'); // waxed mustache
      r(16, 9 + b, 4, 1, '#ffd23f'); r(16, 11 + b, 4, 1, '#ffd23f'); r(16, 10 + b, 1, 1, '#ffd23f'); r(19, 10 + b, 1, 1, '#ffd23f'); // monocle
      r(19, 12 + b, 1, 4, '#ffd23f');
    },
    headwear: ({ r, b }) => { r(12, -1 + b, 8, 6, '#121218'); r(12, 4 + b, 8, 1, '#ffd23f'); r(10, 5 + b, 12, 1, '#121218'); },
    glow: ({ r, b }) => {
      const y = [3, -1, 1, 5][f], w = [3, 1, 3, 2][f];
      r(25 - (w >> 1), y + b, w, 3, '#ffd23f'); r(25 - (w >> 1), y + b, w, 1, '#fff2a0');
    },
  }),
  // Tank: heavy plate armour behind a tower shield
  warden: (f) => ({
    top: solid('#3d5a9a'), sleeve: solid('#4a6aa8'), hand: '#7a9ad8', pants: solid('#2f4a82'), shoes: '#1f2f5a',
    face: 'clean', hair: { style: 'short', color: '#4a3220', dark: '#2a1a10', light: '#6b4a2e' },
    armL: 'front', armR: 'down',
    topDetail: ({ r, b }) => { r(9, 19 + b, 14, 2, '#7a9ad8'); r(11, 22 + b, 10, 8, '#4a6aa8'); r(9, 35, 14, 2, '#1f2f5a'); },
    headwear: ({ r, b }) => {
      r(10, 3 + b, 12, 5, '#7a9ad8'); r(10, 8 + b, 2, 7, '#7a9ad8'); r(20, 8 + b, 2, 7, '#7a9ad8');
      r(15, 6 + b, 2, 6, '#7a9ad8'); r(14, 0 + b, 4, 3, '#ff2f5a'); r(13, 1 + b, 1, 2, '#ff2f5a');
    },
    front: ({ r, b }) => {
      r(3, 21 + b, 11, 26, '#c0c8d8'); r(4, 22 + b, 9, 24, '#1f4cc8');
      r(7, 30 + b, 3, 5, '#2ef2ff'); r(8, 29 + b, 1, 7, '#2ef2ff'); r(6, 32 + b, 5, 1, '#2ef2ff');
    },
    glow: ({ r, b }) => { const gy = 23 + f * 5; r(5, gy + b, 1, 2, '#ffffff'); r(6, gy + 2 + b, 1, 2, '#ffffff'); },
  }),
  // Crit gunner: cowboy hat, duster, magenta revolver
  gunslinger: (f) => ({
    top: solid('#2a2230'), sleeve: solid('#6b4226'), coat: solid('#6b4226'), coatSplit: '#2a2230', pants: solid('#2a2230'),
    shoes: '#3a2414', face: 'beard', beard: '#2a1a10', hair: { style: 'short', color: '#2a1a10', dark: '#1a0f08', light: '#3a2414' },
    armL: 'hip', armR: 'point',
    topDetail: ({ r, b }) => {
      r(9, 19 + b, 4, 18 - b, '#6b4226'); r(19, 19 + b, 4, 18 - b, '#6b4226');
      r(13, 17 + b, 6, 2, '#ff3df2'); r(15, 19 + b, 2, 2, '#ff3df2');      // bandana
      r(9, 34, 14, 1, '#3a2414'); r(15, 34, 2, 1, '#ffd23f');
    },
    headwear: ({ r, b }) => {
      r(7, 5 + b, 18, 1, '#5a3a1e'); r(6, 4 + b, 1, 1, '#5a3a1e'); r(25, 4 + b, 1, 1, '#5a3a1e');
      r(11, 1 + b, 10, 4, '#6b4426'); r(11, 4 + b, 10, 1, '#ff3df2'); r(14, 1 + b, 4, 1, '#5a3a1e');
    },
    armRProp: ({ r, b }) => { r(28, 18 + b, 4, 2, '#3a3a48'); r(29, 20 + b, 2, 2, '#6b4426'); r(31, 18 + b, 1, 1, '#ff3df2'); },
    glow: ({ r, b }) => {
      if (f === 2) { r(31, 16 + b, 1, 5, '#ffe84a'); r(30, 17 + b, 2, 3, '#ff3df2'); }
      if (f === 3) { r(30, 15 + b, 1, 1, '#c0c0cc'); r(31, 14 + b, 1, 1, '#9a9aa8'); }
    },
  }),
  // Reanimator: hooded robe, glowing skull, floating soul orb
  necromancer: (f) => ({
    top: solid('#2a1838'), sleeve: solid('#2a1838'), coat: solid('#2a1838'), coatSplit: '#120a18', hand: '#d8d8c8', pants: solid('#120a18'),
    shoes: '#120a18', face: 'none', armL: 'hip', armR: 'up',
    topDetail: ({ r, b }) => { r(15, 18 + b, 2, 19 - b, '#3a2050'); r(9, 30 + b, 14, 1, '#b6ff3d'); },
    faceDetail: ({ r, b }) => {
      r(12, 7 + b, 8, 9, '#e0e0d0'); r(13, 15 + b, 6, 2, '#e0e0d0');
      r(13, 9 + b, 2, 2, '#000000'); r(17, 9 + b, 2, 2, '#000000'); r(15, 12 + b, 2, 1, '#000000');
      for (let x = 13; x < 19; x += 2) r(x, 14 + b, 1, 2, '#6a6a5a');
    },
    headwear: ({ r, b }) => {
      r(9, 2 + b, 14, 5, '#3a2050'); r(11, 1 + b, 10, 1, '#3a2050');
      r(9, 5 + b, 3, 15, '#3a2050'); r(20, 5 + b, 3, 15, '#3a2050');
    },
    glow: ({ r, b }) => {
      r(13, 10 + b, 1, 1, '#b6ff3d'); r(18, 10 + b, 1, 1, '#b6ff3d');
      const oy = [2, 1, 0, 1][f];
      r(23, oy + b, 4, 4, '#b6ff3d'); r(24, oy + 1 + b, 2, 2, '#f0ffd0');
      r(22 + f, 6 - oy + b, 1, 1, '#7aff6a');
    },
  }),
};

const cache = new Map();
export function commanderFrame(id, f) {
  const key = id + f;
  if (cache.has(key)) return cache.get(key);
  const spec = SPECS[id] ? SPECS[id](f) : SPECS.vanguard(f);
  const c = drawPerson({ ...spec, b: f % 2 });
  cache.set(key, c);
  return c;
}

// Easter-egg effects when a commander sprite is tapped (canvas is 48x64,
// sprite drawn at x=8). Each returns particles to spawn at time t.
const EGG = {
  vanguard: (t, add) => { if (Math.random() < 0.5) { add({ x: 40, y: 22 + Math.random() * 2, vx: 60, vy: 0, col: '#2ef2ff', life: 0.3 }); add({ x: 39, y: 21, col: '#ffffff', life: 0.06, size: 2 }); } },
  engineer: (t, add) => { for (let i = 0; i < 2; i++) add({ x: 33, y: 2, vx: (Math.random() - 0.5) * 40, vy: -Math.random() * 30, g: 60, col: Math.random() < 0.5 ? '#ffe84a' : '#ff8a1f', life: 0.8 }); },
  cryomancer: (t, add) => { add({ x: Math.random() * 48, y: -2, vx: (Math.random() - 0.5) * 6, vy: 18 + Math.random() * 10, col: '#e8f4ff', life: 3 }); if (Math.random() < 0.3) add({ x: 33, y: 1, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, col: '#2ef2ff', life: 0.5 }); },
  biotech: (t, add) => { add({ x: 32 + Math.random() * 4, y: 4, vx: (Math.random() - 0.5) * 10, vy: -10 - Math.random() * 10, col: Math.random() < 0.5 ? '#4dff8a' : '#b6ff9a', life: 1.2, size: Math.random() < 0.4 ? 2 : 1 }); },
  tycoon: (t, add) => { for (let i = 0; i < 2; i++) add({ x: Math.random() * 46, y: -3, vx: 0, vy: 20 + Math.random() * 20, g: 30, col: '#ffd23f', life: 3, coin: true }); },
  warden: (t, add) => { if (Math.random() < 0.25) add({ ring: true, x: 16, y: 34, r: 2, vr: 30, col: '#2ef2ff', life: 0.6 }); },
  gunslinger: (t, add) => { if (Math.floor(t * 4) % 2 === 0 && Math.random() < 0.4) { add({ x: 40, y: 19, vx: 80, vy: (Math.random() - 0.5) * 6, col: '#ff3df2', life: 0.3 }); add({ x: 39, y: 17, col: '#ffe84a', life: 0.06, size: 3 }); } },
  necromancer: (t, add) => { const a = t * 6; add({ x: 16 + Math.cos(a) * 14, y: 30 + Math.sin(a) * 18, vx: 0, vy: -6, col: '#b6ff3d', life: 0.6, size: 2 }); },
};

// An animated <canvas> for menus; tap it for an easter egg. Stops itself
// once removed from the page.
export function commanderCanvas(id) {
  const W = 48;
  const [c, ctx] = makeCanvas(W, SH);
  c.className = 'px cmd-sprite';
  let egg = -1, parts = [], last = performance.now(), idle = 0;
  c.addEventListener('click', (ev) => { ev.stopPropagation(); if (egg < 0) egg = 0; });
  const add = (p) => { if (parts.length < 120) parts.push({ vx: 0, vy: 0, ...p, max: p.life }); };
  const tick = (now) => {
    if (!c.isConnected && idle > 0.5) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; idle += dt;
    ctx.clearRect(0, 0, W, SH);
    let f = Math.floor(idle / 0.3) % 4;
    let dx = 8, dy = 0;
    if (egg >= 0) {
      egg += dt;
      f = Math.floor(egg / 0.12) % 4;
      if (id === 'warden' || id === 'vanguard') dx = 8 + (Math.floor(egg * 20) % 2);
      if (id === 'necromancer') dy = -Math.round(Math.sin(egg * 4) * 2);
      (EGG[id] || EGG.vanguard)(egg, add);
      if (egg > 1.6) egg = -1;
    }
    ctx.drawImage(commanderFrame(id, f), dx, dy);
    if (id === 'cryomancer' && egg >= 0) { ctx.globalAlpha = 0.25; ctx.fillStyle = '#8fe8ff'; ctx.fillRect(dx, 0, SW, SH); ctx.globalAlpha = 1; }
    for (const p of parts) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt;
      ctx.globalAlpha = Math.max(0, Math.min(1, (p.life / p.max) * 2));
      ctx.fillStyle = p.col;
      if (p.ring) {
        p.r += p.vr * dt;
        for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2; ctx.fillRect(Math.round(p.x + Math.cos(a) * p.r) + dx - 8, Math.round(p.y + Math.sin(a) * p.r), 1, 1); }
      } else if (p.coin) {
        const w = Math.floor(p.y / 3) % 3 === 0 ? 1 : 3;
        ctx.fillRect(Math.round(p.x) + (3 - w) / 2, Math.round(p.y), w, 3);
      } else ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size || 1, p.size || 1);
    }
    ctx.globalAlpha = 1;
    parts = parts.filter((p) => p.life > 0 && p.y < SH + 4);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return c;
}
