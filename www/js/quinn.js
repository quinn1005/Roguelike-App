// "Made by Quinn" badge for the main menu: an animated 32x64 pixel sprite of
// the developer. Tapping him plays a random outfit change or animation; a new
// one can only start after the current one has finished.

import { drawPerson, solid, plaid, SW, SH } from './chars.js';
import { sfx } from './audio.js';

const SKIN = '#f2c9a7';
const HAIR = { style: 'long', color: '#5e3f26', dark: '#3e2817', light: '#8a643e', part: true };

const khakiDetail = ({ r }) => {
  r(10, 37, 12, 1, '#6a5b33');
  r(15, 41, 2, 7, '#6a5b33');
  r(10, 44, 2, 5, '#6a5b33'); r(20, 44, 2, 5, '#6a5b33');
  r(10, 44, 2, 1, '#a8955e'); r(20, 44, 2, 1, '#a8955e');
  r(12, 49, 1, 6, '#a8955e'); r(19, 49, 1, 6, '#a8955e');
};

const OUTFITS = {
  // red & black flannel, sleeves rolled up, white undershirt
  flannel: {
    top: plaid('#c62828', '#7a1a1a', '#1a1214'),
    topDetail: ({ r, b }) => {
      r(14, 18 + b, 4, 19 - b, '#f2f2f2');      // white undershirt
      r(14, 18 + b, 1, 19 - b, '#cfcfd8');
      r(15, 18 + b, 2, 1, '#d9a285');           // neckline
      r(13, 18 + b, 1, 3, '#7a1a1a'); r(18, 18 + b, 1, 3, '#7a1a1a'); // collar
      r(13, 21 + b, 1, 15 - b, '#1a1214'); r(18, 21 + b, 1, 15 - b, '#1a1214'); // open placket
    },
    forearm: solid(SKIN), cuff: '#7a1a1a', bracelets: ['#c0392b', '#2f9e9e', '#c0392b'],
    pants: solid('#8c7a48'), pantsDetail: khakiDetail,
  },
  // Halloween: all-black plague doctor with a little hat
  plague: {
    top: solid('#16141b'), sleeve: solid('#16141b'), coat: solid('#16141b'), coatSplit: '#0b0a0e',
    hand: '#0e0c12', pants: solid('#121016'), shoes: '#0b0a0e', shoesL: '#22202a',
    face: 'none',
    topDetail: ({ r, b }) => {
      r(9, 19 + b, 14, 1, '#24212b');            // shoulder cape edge
      r(12, 30 + b, 8, 1, '#2c2836');            // belt
      r(15, 30 + b, 2, 1, '#5a5566');
    },
    faceDetail: ({ r, b }) => {
      r(11, 6 + b, 10, 11, '#2a2632');           // leather mask
      r(11, 6 + b, 10, 1, '#3c3746');
      r(12, 9 + b, 2, 2, '#56606e'); r(18, 9 + b, 2, 2, '#56606e'); // goggles
      r(11, 9 + b, 1, 2, '#0e0c12'); r(14, 9 + b, 1, 2, '#0e0c12'); r(17, 9 + b, 1, 2, '#0e0c12'); r(20, 9 + b, 1, 2, '#0e0c12');
      r(12, 9 + b, 1, 1, '#c8d0dc'); r(18, 9 + b, 1, 1, '#c8d0dc');
    },
    headwear: ({ r, b }) => {
      // long beak sweeping down to the right (drawn over the hair)
      r(14, 12 + b, 4, 1, '#3a3644'); r(15, 13 + b, 5, 1, '#3a3644');
      r(16, 14 + b, 6, 1, '#3a3644'); r(18, 15 + b, 5, 1, '#3a3644');
      r(20, 16 + b, 3, 1, '#3a3644'); r(22, 17 + b, 1, 1, '#3a3644');
      r(15, 12 + b, 3, 1, '#5e5870'); r(17, 13 + b, 3, 1, '#5e5870'); r(19, 14 + b, 3, 1, '#5e5870'); r(21, 15 + b, 2, 1, '#5e5870');
      r(10, 4 + b, 12, 1, '#0f0d12');            // brim
      r(12, 0 + b, 8, 4, '#1a1820');             // little top hat
      r(12, 3 + b, 8, 1, '#2c2836');
    },
  },
  // Spider-Man shirt and pajama pants
  spidey: {
    top: (x, y) => (x <= 10 || x >= 21 ? '#1f4cc8' : (x + y) % 6 === 0 || (x - y + 60) % 6 === 0 ? '#5a0c0c' : '#e0302a'),
    sleeve: (x, y) => ((x + y) % 6 === 0 || (x - y + 60) % 6 === 0 ? '#5a0c0c' : '#e0302a'),
    topDetail: ({ r, b }) => {
      r(15, 23 + b, 2, 1, '#0c0c10'); r(15, 24 + b, 2, 3, '#0c0c10');  // spider logo
      r(13, 23 + b, 1, 1, '#0c0c10'); r(18, 23 + b, 1, 1, '#0c0c10');
      r(14, 24 + b, 1, 1, '#0c0c10'); r(17, 24 + b, 1, 1, '#0c0c10');
      r(14, 26 + b, 1, 1, '#0c0c10'); r(17, 26 + b, 1, 1, '#0c0c10');
      r(13, 27 + b, 1, 1, '#0c0c10'); r(18, 27 + b, 1, 1, '#0c0c10');
    },
    pants: (x, y) => ((x + y) % 5 === 0 || (x - y + 70) % 5 === 0 ? '#c62828' : '#1f4cc8'),
    pantsDetail: ({ r }) => {
      for (const [x, y] of [[12, 40], [18, 45], [12, 51], [19, 53]]) { // little spidey-mask prints
        r(x, y, 2, 2, '#d32f2f'); r(x, y, 1, 1, '#ffffff'); r(x + 1, y, 1, 1, '#ffffff');
      }
    },
    shoes: '#2a2a36',
  },
};

// ---------------- props ----------------
function circle(r, cx, cy, rad, col) {
  for (let y = Math.floor(cy - rad); y <= cy + rad; y++) {
    for (let x = Math.floor(cx - rad); x <= cx + rad; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= rad * rad) r(x, y, 1, 1, col);
    }
  }
}

function guitarNeck(r, oy, wood, fret) {
  // neck from the body up to the fretting hand
  for (let i = 0; i <= 12; i++) {
    const x = 17 + i, y = Math.round(30 - i * 0.5) + oy;
    r(x, y, 1, 2, wood);
    if (i % 3 === 1) r(x, y, 1, 1, fret);
  }
  r(29, 22 + oy, 3, 3, wood);          // headstock
  r(30, 22 + oy, 1, 1, '#d0d0d0'); r(31, 23 + oy, 1, 1, '#d0d0d0');
}

const electric = (oy) => ({ r }) => {
  // blue & black bullseye body
  const cx = 12, cy = 32 + oy;
  for (let y = cy - 6; y <= cy + 6; y++) {
    for (let x = cx - 6; x <= cx + 6; x++) {
      const d = Math.hypot(x - cx, (y - cy) * 1.05);
      const top = Math.hypot(x - (cx + 2), y - (cy - 4));
      if (d > 5.6 && top > 3.2) continue;
      const ring = Math.floor(Math.min(d, 5.5) / 1.4);
      r(x, y, 1, 1, ring % 2 ? '#0d0f1a' : '#2f6fe0');
    }
  }
  r(cx, cy, 1, 1, '#9cc8ff');
  guitarNeck(r, oy, '#141418', '#9aa0b0');
  r(13, 30 + oy, 3, 1, '#e8e8e8'); r(11, 33 + oy, 3, 1, '#e8e8e8'); // pickups
};

const acoustic = (oy) => ({ r }) => {
  // black body with a red outline
  circle(r, 12, 33 + oy, 5.6, '#c62828');
  circle(r, 14, 28.5 + oy, 4.2, '#c62828');
  circle(r, 12, 33 + oy, 4.7, '#121014');
  circle(r, 14, 28.5 + oy, 3.3, '#121014');
  circle(r, 13.5, 30 + oy, 1.8, '#c62828');
  circle(r, 13.5, 30 + oy, 1.1, '#020203');
  r(10, 35 + oy, 3, 1, '#3a2a20');      // bridge
  guitarNeck(r, oy, '#1a1416', '#c62828');
};

const vapeProp = (lit) => (P, pose) => {
  const [hx, hy] = pose.hand;
  const { r, b } = P;
  r(hx + 1, hy - 4 + b, 2, 5, '#22c3ee');           // Fogger-style disposable
  r(hx + 1, hy - 4 + b, 2, 2, '#ff4fa0');
  r(hx + 1, hy - 5 + b, 2, 1, '#f0f0f0');           // mouthpiece
  if (lit) r(hx + 2, hy + b, 1, 1, '#ffffff');
};

const busterProp = (P) => {
  const { r, b } = P;
  r(24, 18 + b, 7, 5, '#2f6fe0');
  r(24, 18 + b, 7, 1, '#7fc4ff');
  r(26, 18 + b, 1, 5, '#7fc4ff');
  r(30, 19 + b, 2, 3, '#1a3a8a');
  r(31, 20 + b, 1, 1, '#0a0a14');
};

const gameboyProp = (frame) => ({ r, b }) => {
  r(13, 21 + b, 7, 9, '#c8c4bc');
  r(14, 22 + b, 5, 3, '#4a4a58');
  r(15, 22 + b, 3, 3, frame % 2 ? '#9bbc0f' : '#8bac0f');
  r(15 + (frame % 3), 23 + b, 1, 1, '#306230');
  r(14, 26 + b, 1, 2, '#2a2a30'); r(13, 26 + b, 3, 1, '#2a2a30');
  r(18, 26 + b, 1, 1, frame % 4 === 1 ? '#ff6aa0' : '#a2185a');
  r(17, 27 + b, 1, 1, frame % 4 === 3 ? '#ff6aa0' : '#a2185a');
};

// ---------------- sprite cache ----------------
const cache = new Map();
function quinnSprite(o) {
  const key = [o.outfit, o.armL, o.armR, o.b, o.sway, o.blink, o.lookDown, o.prop, o.propY, o.frame].join('|');
  if (cache.has(key)) return cache.get(key);
  const of = OUTFITS[o.outfit];
  const spec = {
    ...of, b: o.b, sway: o.sway, blink: o.blink, lookDown: o.lookDown,
    skin: SKIN, hair: HAIR, face: of.face || 'beard', armL: o.armL || 'down', armR: o.armR || 'down',
  };
  if (o.prop === 'eguitar') spec.mid = electric(o.propY || 0);
  if (o.prop === 'aguitar') spec.mid = acoustic(o.propY || 0);
  if (o.prop === 'vape' || o.prop === 'vapeLit') spec.armRProp = vapeProp(o.prop === 'vapeLit');
  if (o.prop === 'buster') spec.armRProp = busterProp;
  if (o.prop === 'gameboy') spec.front = gameboyProp(o.frame || 0);
  const c = drawPerson(spec);
  if (cache.size > 400) cache.clear();
  cache.set(key, c);
  return c;
}

// Exposed for previews/tests.
export function quinnFrames(outfit = 'flannel') {
  return [0, 1, 2, 3].map((f) => quinnSprite({ outfit, b: f % 2, sway: f === 1 || f === 2 ? 1 : 0, blink: f === 3, armR: f % 2 ? 'waveB' : 'waveA' }));
}

// ---------------- easter egg events ----------------
const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));

const EVENTS = {
  plague: { dur: 1.4, outfit: 'plague', name: 'Plague Doctor' },
  spidey: { dur: 1.4, outfit: 'spidey', name: 'Spidey PJs' },
  flannel: { dur: 1.4, outfit: 'flannel', name: 'Flannel' },
  eguitar: { dur: 4.6 }, aguitar: { dur: 4.6 }, vape: { dur: 4.4 }, buster: { dur: 3.2 },
  web: { dur: 3.4 }, gameboy: { dur: 5.2 }, portal: { dur: 2.8 },
};

export function quinnBadge() {
  const root = document.createElement('div');
  root.className = 'quinn';
  const cv = document.createElement('canvas');
  cv.className = 'quinn-stage';
  const hit = document.createElement('div');
  hit.className = 'quinn-hit';
  const label = document.createElement('div');
  label.className = 'quinn-label';
  label.innerHTML = 'MADE BY<br><span>QUINN</span>';
  root.append(cv, hit, label);

  const ctx = cv.getContext('2d');
  const st = { outfit: 'flannel', ev: null, t: 0, last: null, fx: [], idle: 0 };

  const layout = () => {
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.floor(window.innerWidth * dpr);
    cv.height = Math.floor(window.innerHeight * dpr);
    st.dpr = dpr;
    st.k = Math.max(1, Math.round(1.5 * dpr));
    const sl = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sl')) || 0;
    st.ox = Math.round((6 + sl) * dpr);
    st.oy = cv.height - Math.round(4 * dpr) - SH * st.k;
    const css = st.k / dpr;
    hit.style.left = 6 + sl + 'px';
    hit.style.width = SW * css + 'px';
    hit.style.height = SH * css + 'px';
    label.style.left = 6 + sl + SW * css + 4 + 'px';
  };
  layout();
  window.addEventListener('resize', layout);

  // sprite-space helpers (1 unit = one sprite pixel, origin = sprite top-left)
  const wideRight = () => (cv.width - st.ox) / st.k;
  const topY = () => -st.oy / st.k;

  const play = (id) => {
    if (st.ev) return false; // locked until the current one finishes
    st.ev = id; st.t = 0; st.last = id; st.fired = {};
    if (EVENTS[id].outfit) sfx('poof');
    return true;
  };
  root.play = play; // used by tests
  hit.addEventListener('click', (e) => {
    e.stopPropagation();
    const pool = Object.keys(EVENTS).filter((id) => {
      if (id === st.last) return false;
      const ev = EVENTS[id];
      if (ev.outfit) return ev.outfit !== st.outfit && (id !== 'flannel' || st.outfit !== 'flannel');
      return true;
    });
    play(pool[Math.floor(Math.random() * pool.length)]);
  });

  const once = (key, fn) => { if (!st.fired[key]) { st.fired[key] = 1; fn(); } };
  const puff = (x, y, n, col, spread = 6) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * spread;
      st.fx.push({ kind: 'puff', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, r: 1.5 + Math.random() * 2, life: 0.6 + Math.random() * 0.5, max: 1.1, col });
    }
  };

  // Returns sprite options + positioning for the current moment.
  function frameState(t, idleT) {
    const f = Math.floor(idleT / 0.32);
    const base = {
      outfit: st.outfit, b: f % 2, sway: (f % 4 === 1 || f % 4 === 2) ? 1 : 0, blink: f % 8 === 7,
      armR: f % 2 ? 'waveB' : 'waveA', armL: 'down', dy: 0, clip: null,
    };
    const id = st.ev;
    if (!id) return base;
    const ev = EVENTS[id];
    const o = { ...base, armR: 'down' };

    if (ev.outfit) {
      once('cloud', () => puff(16, 34, 40, '#e8e0f0', 14));
      if (t > 0.35) { st.outfit = ev.outfit; o.outfit = ev.outfit; }
      if (t > 0.25 && t < 1.2 && Math.random() < 0.4) st.fx.push({ kind: 'spark', x: 4 + Math.random() * 24, y: 4 + Math.random() * 56, life: 0.4, max: 0.4, col: ['#ff3df2', '#2ef2ff', '#ffe84a'][Math.floor(Math.random() * 3)] });
      o.armR = t > 0.6 ? (f % 2 ? 'waveB' : 'waveA') : 'down';
      return o;
    }
    if (id === 'eguitar' || id === 'aguitar') {
      o.prop = id;
      if (t < 0.6) { o.propY = Math.round(lerp(14, 0, t / 0.6)); }
      else if (t < 3.8) {
        o.armR = 'neck';
        const s = Math.floor((t - 0.6) / 0.12);
        o.armL = s % 2 ? 'strumB' : 'strumA';
        if (s % 2 === 0) once('s' + s, () => { sfx(id === 'eguitar' ? 'strumE' : 'strumA'); if (s % 4 === 0) st.fx.push({ kind: 'note', x: 18 + Math.random() * 6, y: 26, vy: -14, vx: 4 + Math.random() * 6, life: 1.4, max: 1.4, col: id === 'eguitar' ? '#5fb0ff' : '#ff5a5a' }); });
      } else o.propY = Math.round(lerp(0, 14, (t - 3.8) / 0.6));
      return o;
    }
    if (id === 'vape') {
      if (t < 0.4) { o.armR = 'hold'; o.prop = 'vape'; }
      else if (t < 1.7) { o.armR = 'mouth'; o.prop = t > 0.6 ? 'vapeLit' : 'vape'; o.blink = t > 0.8; }
      else if (t < 2.1) { o.armR = 'hold'; o.prop = 'vape'; }
      if (t > 1.8) once('exhale', () => sfx('puff'));
      if (t > 1.8 && t < 3.3) {
        const k = Math.floor((t - 1.8) / 0.1);
        once('p' + k, () => st.fx.push({ kind: 'smoke', x: 16, y: 14 + o.b, vx: 8 + Math.random() * 6, vy: -6 - Math.random() * 5, r: 1.5, grow: 4 + Math.random() * 3, life: 1.6, max: 1.6 }));
      }
      return o;
    }
    if (id === 'buster') {
      o.armR = 'point'; o.prop = t > 0.3 && t < 2.6 ? 'buster' : undefined;
      once('mk', () => puff(28, 20, 10, '#7fc4ff', 6));
      for (const at of [0.8, 1.25, 1.7]) {
        if (t > at) once('b' + at, () => { sfx('buster'); st.fx.push({ kind: 'pellet', x: 32, y: 20.5 + o.b, vx: 240, life: 9, max: 9 }); });
      }
      if (t > 2.6) { once('mk2', () => puff(28, 20, 10, '#7fc4ff', 6)); o.armR = 'down'; }
      return o;
    }
    if (id === 'web') {
      o.armR = t < 2.9 ? 'point' : 'down';
      for (const at of [0.4, 1.2, 2.0]) {
        if (t > at) once('w' + at, () => {
          sfx('thwip');
          st.fx.push({ kind: 'web', x: 31, y: 20 + o.b, tx: wideRight() - 6 - Math.random() * 40, ty: -10 - Math.random() * 40 + Math.random() * 50, life: 1.0, max: 1.0 });
        });
      }
      return o;
    }
    if (id === 'gameboy') {
      if (t < 0.4 || t > 4.8) { o.armR = 'down'; return o; }
      o.armR = 'front'; o.armL = 'front'; o.prop = 'gameboy'; o.lookDown = true; o.b = 0;
      o.frame = Math.floor(t / 0.18);
      once('g' + Math.floor(t / 0.45), () => { if (Math.random() < 0.7) sfx('gbBeep'); });
      return o;
    }
    if (id === 'portal') {
      if (t < 0.35) {
        o.portalA = lerp(0, 1, t / 0.3);
      } else if (t < 1.05) {
        once('pa', () => sfx('portal'));
        o.portalA = 1; o.dy = 64 * ((t - 0.35) / 0.7) ** 2; o.clip = { maxY: 59 };
      } else if (t < 1.25) {
        o.portalA = lerp(1, 0, (t - 1.05) / 0.2); o.hidden = true;
        o.portalB = lerp(0, 1, (t - 1.05) / 0.2);
      } else if (t < 2.05) {
        once('pb', () => sfx('portal'));
        o.portalB = 1;
        const s2 = (t - 1.25) / 0.8;
        const startY = topY() - 60;
        o.dy = lerp(startY, 0, s2 * s2);
        o.clip = { minY: topY() + 5 };
      } else {
        once('land', () => puff(16, 60, 12, '#c8c0d8', 8));
        o.portalB = lerp(1, 0, (t - 2.05) / 0.3);
      }
      return o;
    }
    return o;
  }

  function drawFx(dt) {
    const k = st.k;
    for (const p of st.fx) {
      p.life -= dt;
      if (p.vx) p.x += p.vx * dt;
      if (p.vy) p.y += p.vy * dt;
      const a = Math.max(0, Math.min(1, p.life / p.max * 1.5));
      ctx.globalAlpha = a;
      if (p.kind === 'puff') {
        p.vx *= 0.95; p.vy *= 0.95;
        ctx.fillStyle = p.col; const rr = p.r * (1.6 - a * 0.6);
        ctx.fillRect(Math.round(p.x - rr), Math.round(p.y - rr), Math.ceil(rr * 2), Math.ceil(rr * 2));
      } else if (p.kind === 'smoke') {
        const rr = p.r + p.grow * (1 - p.life / p.max);
        ctx.globalAlpha = a * 0.75;
        ctx.fillStyle = '#e6e6ee';
        ctx.fillRect(Math.round(p.x - rr), Math.round(p.y - rr * 0.7), Math.ceil(rr * 2), Math.ceil(rr * 1.4));
        ctx.fillStyle = '#c4c4d0';
        ctx.fillRect(Math.round(p.x - rr * 0.6), Math.round(p.y), Math.ceil(rr * 1.2), Math.ceil(rr * 0.6));
      } else if (p.kind === 'spark') {
        ctx.fillStyle = p.col; ctx.fillRect(Math.round(p.x), Math.round(p.y) - 1, 1, 3); ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y), 3, 1);
      } else if (p.kind === 'note') {
        const x = Math.round(p.x), y = Math.round(p.y);
        ctx.fillStyle = p.col;
        ctx.fillRect(x, y, 2, 2); ctx.fillRect(x + 1, y - 4, 1, 4); ctx.fillRect(x + 2, y - 4, 2, 1);
      } else if (p.kind === 'pellet') {
        ctx.globalAlpha = 1;
        const x = Math.round(p.x), y = Math.round(p.y);
        ctx.fillStyle = '#fff36a'; ctx.fillRect(x - 2, y - 1, 5, 3); ctx.fillRect(x - 1, y - 2, 3, 5);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y - 1, 2, 2);
        if (p.x > wideRight() + 6) p.life = 0;
      } else if (p.kind === 'web') {
        const age = 1 - p.life / p.max;
        const ext = Math.min(1, age / 0.2);
        const ex = p.x + (p.tx - p.x) * ext, ey = p.y + (p.ty - p.y) * ext;
        const n = Math.ceil(Math.hypot(ex - p.x, ey - p.y));
        ctx.fillStyle = '#f4f4f8';
        for (let i = 0; i <= n; i++) {
          const q = i / Math.max(1, n);
          ctx.fillRect(Math.round(p.x + (ex - p.x) * q), Math.round(p.y + (ey - p.y) * q + Math.sin(q * 20) * 0.4), 1, 1);
        }
        if (ext >= 1) { // splat
          ctx.fillStyle = '#f4f4f8';
          for (let s = 0; s < 8; s++) {
            const ang = (s / 8) * Math.PI * 2;
            for (let d = 0; d < 6; d++) ctx.fillRect(Math.round(ex + Math.cos(ang) * d), Math.round(ey + Math.sin(ang) * d), 1, 1);
          }
          for (const rad of [3, 5]) for (let s = 0; s < 16; s++) { const ang = (s / 16) * Math.PI * 2; ctx.fillRect(Math.round(ex + Math.cos(ang) * rad), Math.round(ey + Math.sin(ang) * rad), 1, 1); }
        }
      }
    }
    ctx.globalAlpha = 1;
    st.fx = st.fx.filter((p) => p.life > 0);
    void k;
  }

  function portal(cx, cy, w, inner, outer) {
    if (w <= 0) return;
    const hw = 11 * w, hh = 3 * w;
    for (let y = -hh; y <= hh; y++) {
      for (let x = -hw; x <= hw; x++) {
        const d = (x / hw) ** 2 + (y / Math.max(1, hh)) ** 2;
        if (d > 1) continue;
        ctx.fillStyle = d > 0.6 ? outer : d > 0.35 ? inner : '#0a0a14';
        ctx.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
      }
    }
  }

  let last = performance.now();
  const loop = (now) => {
    if (!root.isConnected) { window.removeEventListener('resize', layout); return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    st.idle += dt;
    if (st.ev) {
      st.t += dt;
      if (st.t >= EVENTS[st.ev].dur) {
        // stay locked until every Mega Man pellet has left the screen
        if (st.ev === 'buster' && st.fx.some((p) => p.kind === 'pellet')) st.t = EVENTS.buster.dur - 0.01;
        else st.ev = null;
      }
    }
    const o = frameState(st.t, st.idle);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(st.k, 0, 0, st.k, st.ox, st.oy);
    if (o.portalA) portal(16, 60, o.portalA, '#6fd0ff', '#1e7bff');
    if (o.portalB) portal(16, topY() + 5, o.portalB, '#ffc070', '#ff7a1a');
    if (!o.hidden) {
      const spr = quinnSprite(o);
      ctx.save();
      if (o.clip) {
        ctx.beginPath();
        const y0 = o.clip.minY != null ? o.clip.minY : -1e4, y1 = o.clip.maxY != null ? o.clip.maxY : 1e4;
        ctx.rect(-50, y0, 200, y1 - y0);
        ctx.clip();
      }
      ctx.drawImage(spr, 0, Math.round(o.dy || 0));
      ctx.restore();
      if (o.prop === 'buster' && st.t > 0.6 && st.t < 2.0) { // charge glow
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(st.t * 30);
        ctx.fillStyle = '#fff36a'; ctx.fillRect(31, 19 + o.b, 2, 3);
        ctx.globalAlpha = 1;
      }
    }
    if (o.portalA) { // front lip of the floor portal over the sinking body
      ctx.fillStyle = '#1e7bff'; ctx.fillRect(16 - 11 * o.portalA, 60, 22 * o.portalA, 1);
    }
    drawFx(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return root;
}
