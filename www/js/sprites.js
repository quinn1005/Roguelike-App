// All art is generated in code: pixel patterns (strings) are rasterized into
// small offscreen canvases, and tiles/effects are drawn procedurally.

export const TS = 16; // tile size in world pixels

export const PAL = {
  k: '#07061a', d: '#161a36', m: '#2c3566', l: '#5664a8', w: '#e6f6ff',
  c: '#2ef2ff', C: '#0e8aa8', p: '#ff3df2', P: '#9a1a92', y: '#ffe84a',
  o: '#ff8a1f', r: '#ff2f5a', R: '#8a1034', g: '#4dff8a', G: '#129648',
  b: '#3d7bff', B: '#1a3a9a', v: '#a466ff', V: '#4b2a9a',
};

// Map sectors (every 10 waves) shift the neon palette of newly built chunks.
export const SECTORS = [
  { name: 'Magenta Rim', grid: '#16234f', path: '#ff3df2', pathDark: '#2a0a33', accent: '#2ef2ff', ground: '#0a0e22' },
  { name: 'Cyan Drift', grid: '#1e1650', path: '#2ef2ff', pathDark: '#062a36', accent: '#ff3df2', ground: '#0c0a24' },
  { name: 'Toxic Belt', grid: '#0f3030', path: '#4dff8a', pathDark: '#082e1a', accent: '#ffe84a', ground: '#071614' },
  { name: 'Solar Forge', grid: '#361a1a', path: '#ff8a1f', pathDark: '#331506', accent: '#ff2f5a', ground: '#160a0a' },
  { name: 'Void Reach', grid: '#271c48', path: '#a466ff', pathDark: '#1c0d40', accent: '#4dff8a', ground: '#0d0920' },
];

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
export function shade(hex, f) {
  const [r, g, b] = hexToRgb(hex);
  if (f >= 0) return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
  return rgbToHex(r * (1 + f), g * (1 + f), b * (1 + f));
}
export function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// rows: array of strings. mirror: 'h' mirrors columns, 'v' mirrors rows, 'hv' both.
export function expand(rows, mirror) {
  let out = rows.slice();
  if (mirror && mirror.includes('h')) out = out.map((r) => r + r.split('').reverse().join(''));
  if (mirror && mirror.includes('v')) out = out.concat(out.slice().reverse());
  return out;
}

export function raster(rows, accent = '#2ef2ff', scale = 1) {
  const h = rows.length, w = rows[0].length;
  const [c, ctx] = makeCanvas(w * scale, h * scale);
  const map = { ...PAL, a: accent, A: shade(accent, -0.45), h: shade(accent, 0.55) };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === ' ' || !map[ch]) continue;
      ctx.fillStyle = map[ch];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return c;
}

// ---------- Tower art ----------

const BASE_Q = [
  '..kkkkkk',
  '.kmmmmmm',
  'kmllllll',
  'kmlAdddd',
  'kmlddddd',
  'kmlddddd',
  'kmlddddd',
  'kmlddddd',
];

const HEADS = {
  blaster: ['............', '..kkkk......', '.kmmmmkkkkkk', '.kmaaAwwwwwk', '.kmahAkkkkkk', '.kmhhmk.....'],
  cannon: ['............', '...kkkkk....', '..kAaaaAk...', '.kAahhaaAkkk', '.kahwhaaAmmk', '.kaahhaaAllk'],
  cryo: ['............', '..kk...kkk..', '.kAak.kahwk.', '.kaamkkaakk.', '..kamhhhwwk.', '..kmhwwwwwck'],
  tesla: ['....kkkk....', '..kkAaaAkk..', '.kAaahhaaAk.', '.kaahwwhaak.', 'kAahwwwwhaAk', 'kaahwwwwhaak'],
  nanite: ['............', '...kkk......', '..kAaAk.kk..', '.kAaaaAkmmkk', '.kaahaaammlk', '.kahwhakkkak'],
  railgun: ['............', '............', '.kkk........', 'kAaakkkkkkkk', 'kaahmmmmmmmk', 'kahwhaaaaaak'],
  drone: ['kkkkkkkkkkkk', 'kmmmmmmmmmmk', 'kmAaaAAaaAmk', 'kmakkkkkkamk', 'kmakhwwhkamk', 'kmakwwwwkamk'],
  miner: ['....kkkk....', '...kaaaak...', '..kahyyhak..', '.kkahyyhakk.', 'kmmkaaaakmmk', 'kmlkkhhkklmk'],
  amplifier: ['.....kk.....', '....kwwk....', '...kahhak...', '..kAahhaAk..', '.kAaawwaaAk.', 'kAaawwwwaaAk'],
  mortar: ['............', '..kkkkkk....', '.kAaaaaAkkk.', '.kaammaaAmmk', '.kamkkmaAkdk', '.kamkkmaAkdk'],
  laser: ['............', '..kkkk......', '.kAaaAkk....', '.kaahhaAkkkk', '.kahwwhaammk', '.kahwwhaawwk'],
  reclaimer: ['...kkkkkk...', '..kVvvvvVk..', '.kVvvvvvvVk.', '.kvaawwaavk.', '.kvawkkwavk.', '..kvvvvvvk..'],
};

const towerCache = new Map();
export function towerSprites(def) {
  if (towerCache.has(def.id)) return towerCache.get(def.id);
  const base = raster(expand(BASE_Q, 'hv'), def.color);
  const head = raster(expand(HEADS[def.id], 'v'), def.color);
  // icon: base + head composite, upscaled for UI
  const [ic, ictx] = makeCanvas(16, 16);
  ictx.drawImage(base, 0, 0);
  ictx.drawImage(head, 2, 2);
  const [big, bctx] = makeCanvas(48, 48);
  bctx.drawImage(ic, 0, 0, 48, 48);
  const out = { base, head, icon: ic, iconUrl: big.toDataURL() };
  towerCache.set(def.id, out);
  return out;
}

// ---------- Enemy art (left halves, mirrored horizontally) ----------

const ENEMY_PAT = {
  crawler: {
    a: ['......', '..k...', '...k..', '..kkkk', '.krrrr', '.krwkr', 'krrrrr', 'krkrrr', 'krkRRR', 'k.k...', '...kk.', '......'],
    b: { 9: '..k...', 10: '.k....' },
  },
  scout: {
    a: ['......', '......', '.....k', '....ky', '...kyy', '..kyyw', 'kkyyyy', 'kyykyy', '.kk.ky', '....kk', '......', '......'],
    b: { 8: 'kkk.ky' },
  },
  tank: {
    a: ['..kkkk', '.kbbbb', 'kbBBBB', 'kbBwkB', 'kbBBBB', 'kllbbb', 'klmmmm', 'klmkkk', 'klmmmm', 'kkmmmm', 'kmkmkm', 'kkkkkk'],
    b: { 10: 'kkmkmk' },
  },
  swarm: {
    a: ['......', '......', '......', '....k.', '...kgg', '..kggg', '..kgwk', '..kggg', '...kGg', '..k.k.', '......', '......'],
    b: { 9: '...k.k' },
  },
  aegis: {
    a: ['...kkk', '..kvvv', '.kvVVv', '.kvwkV', 'kvvVVv', 'kvVvvv', 'kVkvvv', 'kV.kvv', 'kk..kv', '....kk', '......', '......'],
    b: { 8: '.kk.kv' },
  },
  medic: {
    a: ['..kkkk', '.kwwww', 'kwwwgg', 'kwwwgg', 'kwgggg', 'kwgggg', 'kwwwgg', 'kwwwgg', '.kwwww', '..kkkk', '...k..', '..k...'],
    b: { 10: '..k...', 11: '...k..' },
  },
  splitter: {
    a: ['......', '...kkk', '..kooo', '.kooyo', '.kowko', 'kooooo', 'kooook', 'koooko', '.kooko', '..kook', '...kkk', '......'],
    b: { 1: '......', 2: '...kkk' },
  },
  splitling: {
    a: ['......', '......', '......', '......', '....kk', '...koo', '..kowk', '..kooo', '...koo', '....kk', '......', '......'],
    b: { 9: '...k.k' },
  },
  phantom: {
    a: ['...kkk', '..kppp', '.kpppp', '.kpwkp', '.kpwkp', 'kppppp', 'kppppp', 'kppppp', 'kpPpPp', 'kPkPkP', 'k.k.k.', '......'],
    b: { 9: 'kPPkPk', 10: '.k.k.k' },
  },
  wasp: {
    a: ['kk....', 'kwk...', 'kwwk..', '.kwwkk', '..kkyy', '...kyk', '...kyy', '...kkk', '...kyy', '....ky', '.....k', '......'],
    b: { 0: '......', 1: '......', 2: 'kkk...', 3: 'kwwkkk' },
  },
  husk: { // reclaimed ally
    a: ['......', '...kkk', '..kggg', '.kgwkg', '.kgggg', '..kGgg', '.kgGGg', 'kg.kgg', 'k..kGg', '...k.k', '......', '......'],
    b: { 9: '..k..k' },
  },
};

const BOSS_PAT = {
  bulwark: ['....kkkkkk', '...kbbbbbb', '..kbBBBBBB', '..kbBkkkkk', '.kbBkcccwc', '.kbBkcccwc', '.kbBBkkkkk', 'kbbBBBBBBB', 'kllmmmmmmm', 'klmmBBBBBB', 'klmBbbbbbb', 'klmBbyyyby', 'klmBbbbbbb', 'klmmBBBBBB', 'kllmmmmmmm', 'kkllmmmmmm', 'kmkkmkmkmk', 'kmmkmmkmmk', 'kkkkkkkkkk', '..........'],
  hive: ['..........', '....kkkkkk', '...kgggggg', '..kgGGgggg', '.kgGkkGGgg', '.kgGkwkGgg', 'kgGGkkGGgg', 'kgggGGgggg', 'kgGgggggGG', 'kgGGgggGkk', 'kggGGGGGkw', 'kgggggggkk', '.kgGggggGG', '.kgGGgGGgg', '..kggGggGg', '..kgk.kgk.', '..kk..kgk.', '..k....kk.', '..........', '..........'],
  disruptor: ['........kk', '.......kyy', '........k.', '....kkkkkk', '...kmmmmmm', '..kmllllll', '..kmlkkkkk', '..kmlkppwp', '..kmlkkkkk', '.kkmllllll', 'kpkmmmmmmm', 'kpkmdddddd', 'kpkmdyydyy', 'kpkmdddddd', '.kkmmmmmmm', '...kmk..km', '...kmk..km', '..kkmk..km', '..kkkk..kk', '..........'],
  stalker: ['k.........', 'kpk.......', '.kpk...kkk', '..kpk.kppp', '...kpkpPPP', '....kpPkwk', '....kpPkwk', '...kppPPPP', '..kpPPpppp', '.kpPkkPPPP', 'kpPk.kpppp', 'kPk..kPPPP', 'kk...kpppp', '.....kPkkP', '....kPk.kP', '...kPk..kP', '..kPk...kP', '..kk....kk', '..........', '..........'],
  leviathan: ['..........', '..........', 'k.........', 'kck.......', 'kcCk......', '.kcCk...kk', '.kcCCk.kvv', '..kcCCkvvv', '..kcCCvvVV', '...kcCvVwk', '...kcCvVwk', '....kcvvVV', '....kcvvvv', '.....kcvVv', '......kvvv', '.......kvV', '........kv', '.........k', '..........', '..........'],
};

const enemyCache = new Map();
export function enemySprite(id, frame, tint) {
  const key = id + frame + (tint || '');
  if (enemyCache.has(key)) return enemyCache.get(key);
  let rows;
  if (BOSS_PAT[id]) {
    rows = BOSS_PAT[id].slice();
    if (frame) rows = rows.map((r, i) => (i >= 15 ? r.replace(/k/g, (m, j) => (j % 2 ? 'k' : 'm')) : r));
  } else {
    const p = ENEMY_PAT[id];
    rows = p.a.slice();
    if (frame && p.b) for (const i in p.b) rows[i] = p.b[i];
  }
  let c = raster(expand(rows, 'h'));
  if (tint) {
    const [t, tctx] = makeCanvas(c.width, c.height);
    tctx.drawImage(c, 0, 0);
    tctx.globalCompositeOperation = 'source-atop';
    tctx.fillStyle = tint;
    tctx.fillRect(0, 0, c.width, c.height);
    c = t;
  }
  enemyCache.set(key, c);
  return c;
}

// ---------- Glow sprites (quantized radial falloff for a pixel look) ----------
const glowCache = new Map();
export function glow(r, color) {
  const key = r + color;
  if (glowCache.has(key)) return glowCache.get(key);
  const s = r * 2 + 1;
  const [c, ctx] = makeCanvas(s, s);
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const d = Math.hypot(x - r, y - r) / r;
      if (d > 1) continue;
      const a = Math.round((1 - d) * (1 - d) * 4) / 4; // 4 bands
      if (a <= 0) continue;
      ctx.fillStyle = rgba(color, a * 0.55);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  glowCache.set(key, c);
  return c;
}

// ---------- Tiles ----------

export const T = { VOID: 0, GROUND: 1, PATH: 2, ROCK: 3, HIGH: 4, CACHE: 5, NODE: 6, CORE: 7, SLUDGE: 8 };
export const isPath = (t) => t === T.PATH || t === T.SLUDGE || t === T.CORE;
export const isBuildable = (t) => t === T.GROUND || t === T.HIGH || t === T.NODE;

function hash(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function px(ctx, x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); }

// Draw one tile at (ox, oy) in ctx. neighbors(dx,dy) -> tile type.
export function drawTile(ctx, t, ox, oy, wx, wy, sec, nb) {
  const r = hash(wx, wy);
  const g = sec.ground;
  if (t === T.GROUND || t === T.NODE || t === T.CACHE || t === T.HIGH || t === T.ROCK) {
    px(ctx, ox, oy, 16, 16, g);
    // panel seams
    px(ctx, ox, oy, 16, 1, shade(sec.grid, -0.2));
    px(ctx, ox, oy, 1, 16, shade(sec.grid, -0.2));
    if (r < 0.3) { px(ctx, ox + 3, oy + 3, 1, 1, sec.grid); px(ctx, ox + 12, oy + 12, 1, 1, sec.grid); }
    else if (r < 0.45) { px(ctx, ox + 2, oy + 8, 12, 1, shade(g, 0.05)); }
    else if (r < 0.52) { px(ctx, ox + 6, oy + 5, 4, 4, shade(g, 0.06)); px(ctx, ox + 7, oy + 6, 2, 2, rgba(sec.accent, 0.25)); }
  }
  if (t === T.HIGH) {
    px(ctx, ox + 1, oy + 1, 14, 14, shade(sec.grid, 0.15));
    px(ctx, ox + 1, oy + 1, 14, 1, shade(sec.grid, 0.5));
    px(ctx, ox + 1, oy + 1, 1, 14, shade(sec.grid, 0.4));
    px(ctx, ox + 1, oy + 14, 14, 1, shade(sec.grid, -0.5));
    px(ctx, ox + 14, oy + 1, 1, 14, shade(sec.grid, -0.4));
    // chevrons
    for (let i = 0; i < 3; i++) {
      px(ctx, ox + 4 + i * 3, oy + 7, 2, 1, rgba(sec.accent, 0.6));
      px(ctx, ox + 5 + i * 3, oy + 8, 1, 1, rgba(sec.accent, 0.6));
    }
  } else if (t === T.ROCK) {
    // asteroid / crystal outcrop
    const base = '#2a2147', hi = '#4a3d7a', lo = '#140f2a';
    px(ctx, ox + 3, oy + 4, 10, 9, base);
    px(ctx, ox + 2, oy + 6, 12, 5, base);
    px(ctx, ox + 4, oy + 3, 7, 1, base);
    px(ctx, ox + 4, oy + 4, 4, 2, hi);
    px(ctx, ox + 3, oy + 6, 2, 2, hi);
    px(ctx, ox + 3, oy + 12, 10, 1, lo);
    px(ctx, ox + 12, oy + 7, 2, 5, lo);
    if (r > 0.5) { // crystal shard
      px(ctx, ox + 9, oy + 1, 2, 6, sec.accent);
      px(ctx, ox + 10, oy + 1, 1, 6, shade(sec.accent, 0.6));
      px(ctx, ox + 8, oy + 4, 1, 3, shade(sec.accent, -0.4));
    } else {
      px(ctx, ox + 8, oy + 8, 2, 2, lo);
      px(ctx, ox + 6, oy + 10, 1, 1, lo);
    }
  } else if (t === T.CACHE) {
    px(ctx, ox + 3, oy + 5, 10, 8, '#3b2a12');
    px(ctx, ox + 3, oy + 5, 10, 1, '#8a6a2a');
    px(ctx, ox + 3, oy + 12, 10, 1, '#1a1206');
    px(ctx, ox + 7, oy + 5, 2, 8, '#6a4d1a');
    px(ctx, ox + 4, oy + 7, 2, 1, '#ffe84a');
  } else if (t === T.NODE) {
    px(ctx, ox + 4, oy + 4, 8, 8, shade(sec.grid, -0.2));
    px(ctx, ox + 5, oy + 3, 6, 10, shade(sec.grid, -0.2));
    px(ctx, ox + 3, oy + 5, 10, 6, shade(sec.grid, -0.2));
    px(ctx, ox + 6, oy + 6, 4, 4, rgba('#ffe84a', 0.7));
    px(ctx, ox + 7, oy + 7, 2, 2, '#fff7c0');
  } else if (t === T.PATH || t === T.SLUDGE || t === T.CORE) {
    const dark = sec.pathDark, edge = sec.path;
    px(ctx, ox, oy, 16, 16, dark);
    // subtle centerline
    px(ctx, ox + 7, oy + 7, 2, 2, rgba(edge, 0.3));
    const sides = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (const [dx, dy] of sides) {
      const n = nb(dx, dy);
      if (isPath(n)) {
        // flow strip toward neighbor
        if (dx) px(ctx, ox + (dx > 0 ? 9 : 0), oy + 7, 7, 2, rgba(edge, 0.18));
        else px(ctx, ox + 7, oy + (dy > 0 ? 9 : 0), 2, 7, rgba(edge, 0.18));
        continue;
      }
      // bright rim
      if (dy === -1) { px(ctx, ox, oy, 16, 1, edge); px(ctx, ox, oy + 1, 16, 1, rgba(edge, 0.35)); }
      if (dy === 1) { px(ctx, ox, oy + 15, 16, 1, edge); px(ctx, ox, oy + 14, 16, 1, rgba(edge, 0.35)); }
      if (dx === -1) { px(ctx, ox, oy, 1, 16, edge); px(ctx, ox + 1, oy, 1, 16, rgba(edge, 0.35)); }
      if (dx === 1) { px(ctx, ox + 15, oy, 1, 16, edge); px(ctx, ox + 14, oy, 1, 16, rgba(edge, 0.35)); }
    }
    if (t === T.SLUDGE) {
      px(ctx, ox + 2, oy + 2, 12, 12, 'rgba(60,255,120,0.28)');
      px(ctx, ox + 4, oy + 5, 2, 2, 'rgba(160,255,190,0.7)');
      px(ctx, ox + 10, oy + 9, 2, 2, 'rgba(160,255,190,0.6)');
      px(ctx, ox + 7, oy + 12, 1, 1, 'rgba(160,255,190,0.8)');
    }
  }
}

// Core crystal (32x32 incl. glow handled elsewhere)
export const CORE_ROWS = expand([
  '.......k',
  '......kc',
  '.....kcw',
  '....kcCw',
  '...kcCcw',
  '..kcCcch',
  '.kcCcchw',
  'kmmmmmmm',
], 'hv');

let coreSprite;
export function coreArt() {
  if (!coreSprite) coreSprite = raster(CORE_ROWS, '#2ef2ff');
  return coreSprite;
}

// small generic 5x5-ish icons for UI text (heart, coin, shard)
export function uiIcon(kind) {
  const pats = {
    coin: ['.kkk.', 'kyyyk', 'kyoyk', 'kyyyk', '.kkk.'],
    heart: ['kk.kk', 'krkrk', 'krrrk', '.krk.', '..k..'],
    shard: ['..k..', '.kpk.', 'kpwpk', '.kpk.', '..k..'],
    wave: ['.....', 'k.k.k', 'ckckc', 'c.c.c', '.....'],
  };
  const c = raster(pats[kind]);
  const [big, b] = makeCanvas(15, 15);
  b.drawImage(c, 0, 0, 15, 15);
  return big.toDataURL();
}
