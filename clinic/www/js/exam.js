// Exam room renderer (style A: lamp-lit sprites, plus style B stacked slices for eggs).
// Patients are built from shaded parts, relit every frame from the exam lamp, then snapped
// to a few shades per color. Signs of illness only show where the lamp is close.
import { clamp, mix, scl, norm3, dot, quant, hash, tone, WHITE, BLACK, line, text } from './util.js';
import { AILMENTS, SIGNS, CURSED_SIGNS } from './data.js';
import { ZONES_POS } from './patient.js';

export const EW = 160, EH = 100, TOP = 82, OX = 80;
const N = EW * EH;
export const PB = new Int16Array(N);   // which body part covers each pixel (-1 = none)
export const SB = new Int8Array(N);    // which visible sign is drawn at each pixel (-1 = none)
export const XB = new Int8Array(N);    // findings you can tap in X-ray, backlight, candle and root views
const NXb = new Float32Array(N), NYb = new Float32Array(N), NZb = new Float32Array(N), LXb = new Float32Array(N), LYb = new Float32Array(N);

const C = {
  leaf: [92, 168, 86], leafLight: [124, 198, 106], leafUnder: [168, 206, 150], stem: [70, 140, 70], pot: [196, 104, 72], potRim: [218, 132, 96],
  soil: [78, 54, 38], wetSoil: [42, 34, 36], fur: [158, 124, 92], furLight: [236, 226, 204], pink: [232, 132, 150],
  dark: [22, 16, 28], pale: [224, 212, 110], voidBody: [40, 22, 60], vein: [196, 90, 255],
};
export const signsOf = (p) => p.signs.map((k) => ({ kind: k, ...(SIGNS[p.sp][k] || CURSED_SIGNS[k] || {}) }));

/* ---------- the patients, as lists of shaded parts (drawn back to front) ---------- */
function partsFor(o) {
  const { p, t, lampX } = o, has = (k) => p.signs.includes(k), jit = o.stress > 70 ? Math.round(Math.sin(t * 40)) * 0.6 : 0;
  if (p.sp === 'gloop') {
    let s = Math.sin(t * 2.4) * 0.06;
    if (o.jig) { const dt = t - o.jig.t0; if (dt < 6) s += 0.2 * Math.exp(-dt / 2.2) * Math.sin(2 * Math.PI * dt / o.jig.period); }
    let rx = 24 * (1 + s), ry = 17 * (1 - s);
    if (has('sag')) { rx *= 1.14; ry *= 0.74; }
    const parts = [{ x: jit, y: -ry + 1, rx, ry, h: 0.9, mat: p.ail === 'void' ? 'void' : 'slime', wob: true }];
    if (has('bud')) parts.push({ x: rx - 2 + Math.sin(t * 7) * 0.8, y: -5, rx: 5.5, ry: 4.5, h: 0.9, mat: 'slime', bud: true });
    return parts;
  }
  if (p.sp === 'cat') {
    const flat = has('dull'), puff = has('puffed') ? 2 : 0, sw = Math.sin(t * 1.7) * (flat ? 0.4 : 2), slump = flat ? 3 : 0;
    const tail = [[16, -4], [20, -10], [22 + sw * 0.5, -17], [21 + sw, -24]].map(([x, y]) => ({ x: x + jit, y, rx: 3.6 + puff * 0.6, ry: 3.6 + puff * 0.6, h: 1, mat: 'cat', tail: true }));
    return [...tail,
      { x: -8 + jit, y: -45 + slump, rx: 4, ry: 6, h: 0.6, mat: 'cat' }, { x: 8 + jit, y: -45 + slump, rx: 4, ry: 6, h: 0.6, mat: 'cat' },
      { x: jit, y: -14, rx: 15 + puff, ry: 14 + puff, h: 0.9, mat: 'cat', fuzz: puff },
      { x: -6 + jit, y: -3, rx: 5, ry: 3.5, h: 1, mat: 'catLight' }, { x: 6 + jit, y: -3, rx: 5, ry: 3.5, h: 1, mat: 'catLight' },
      { x: jit, y: -34 + slump, rx: 12 + puff * 0.5, ry: 11 + puff * 0.5, h: 1, mat: 'cat', fuzz: puff, head: true },
      { x: jit, y: -29 + slump, rx: 5.5, ry: 4, h: 0.6, mat: 'catLight' }];
  }
  if (p.sp === 'fern') {
    const s = Math.sin(t * 1.3) * 1.5, d = has('droop') ? 4 : 0, unpot = o.mode === 'unpot';
    const leaves = [
      { x: -10 + s, y: -31 + d, rx: 9, ry: 4, h: 0.5, mat: 'leaf', leaf: 0 }, { x: 10 + s, y: -36 + d, rx: 9, ry: 4, h: 0.5, mat: 'leaf', leaf: 1 },
      { x: -7 + s * 1.3, y: -45 + d, rx: 7, ry: 3.5, h: 0.5, mat: 'leaf', leaf: 2 }, { x: 8 + s * 1.3, y: -49 + d, rx: 6, ry: 3, h: 0.5, mat: 'leaf', leaf: 3 },
      { x: s * 1.5, y: -55 + d, rx: 4, ry: 6, h: 0.5, mat: 'leaf', leaf: 4 }];
    const lift = unpot ? -6 : 0;
    const body = [{ x: jit, y: -26 + lift, rx: 3, ry: 10, h: 0.8, mat: 'stem' }];
    if (!unpot) body.push({ x: 0, y: -8, rx: 13, ry: 10, h: 0.9, mat: 'pot', clipTop: -15 }, { x: 0, y: -15, rx: 14, ry: 3, h: 0.5, mat: 'potRim' }, { x: 0, y: -15.5, rx: 11, ry: 1.8, h: 0.3, mat: 'soil' });
    return [...leaves.map((l) => ({ ...l, y: l.y + lift })), ...body, { x: s * 0.6 + jit, y: -38 + d * 0.5 + lift, rx: 6.5, ry: 6, h: 1, mat: 'leafLight', head: true }];
  }
  if (p.sp === 'moth') {
    const f = Math.sin(t * 9) * 0.18 + 0.85, dr = has('wingdroop') ? 5 : 0;
    const follow = p.ail === 'lampstruck' && !o.dim;
    const hx = follow ? clamp((lampX - OX) / 10, -4, 4) : clamp((lampX - OX) / 30, -1, 1);
    const br = 1 + 0.05 * Math.sin(2 * Math.PI * t * (p.R.breath || 25) / 60);
    return [
      { x: -15 + jit, y: -32 + dr, rx: 14, ry: 11 * f, h: 0.3, mat: 'wing', side: -1 }, { x: 15 + jit, y: -32 + dr, rx: 14, ry: 11 * f, h: 0.3, mat: 'wing', side: 1 },
      { x: -9, y: -3, rx: 3.5, ry: 4.5, h: 0.8, mat: 'fur' }, { x: 9, y: -3, rx: 3.5, ry: 4.5, h: 0.8, mat: 'fur' },
      { x: jit, y: -14, rx: 16 * br, ry: 11 * br, h: 0.9, mat: 'fur' },
      { x: jit, y: -22, rx: 13, ry: 6, h: 0.7, mat: 'furLight' },
      { x: hx + jit, y: -29, rx: 10, ry: 9, h: 1, mat: 'fur', head: true }];
  }
  return [];
}

function matColor(mat, th, lx, ly, o, x, y, part) {
  const p = o.p, has = (k) => p.signs.includes(k);
  switch (mat) {
    case 'slime': {
      let c = th.slime;
      if (has('discolor') && hash(x >> 1, y >> 1, 11) > 0.55 && lx < -0.1) c = mix(c, [150, 140, 110], 0.55);
      return c;
    }
    case 'void': return C.voidBody;
    case 'cat': { let c = th.cat; if (part.tail && ((x + y) >> 2) & 1) c = scl(c, 0.72); if (part.head && ly < -0.55 && Math.abs(lx) < 0.3 && (x & 1)) c = scl(c, 0.78); if (has('bald') && Math.hypot(x - OX - 9, y - TOP + 12) < 4.5) c = [216, 160, 150]; return c; }
    case 'catLight': return mix(th.cat, WHITE, 0.45);
    case 'leaf': {
      if (o.flipped && o.flipped.has(part.leaf)) return C.leafUnder;
      return has('pale') ? mix(C.leaf, C.pale, Math.abs(lx) > 0.45 ? 0.75 : 0.3) : C.leaf;
    }
    case 'leafLight': return has('pale') ? mix(C.leafLight, C.pale, 0.35) : C.leafLight;
    case 'stem': return C.stem;
    case 'pot': return C.pot;
    case 'potRim': return C.potRim;
    case 'soil': return p.ail === 'rot' ? C.wetSoil : C.soil;
    case 'fur': return C.fur;
    case 'furLight': return C.furLight;
    case 'wing': {
      if (has('torn') && part.side === 1 && lx > 0.1 && Math.abs(ly - lx * 0.6) < 0.09) return null;
      if (has('bald') && part.side === 1 && Math.hypot(lx + 0.3, ly + 0.5) < 0.3) return mix(th.paper, [255, 255, 255], 0.4);
      const r = Math.hypot(lx * 1.2, ly + 0.1);
      if (r < 0.22) return [74, 52, 62];
      if (r < 0.36) return [244, 216, 150];
      return mix(th.paper, [206, 196, 166], 0.5);
    }
    default: return [150, 150, 150];
  }
}
const GLOSSY = { slime: 1, pot: 1, potRim: 1, leafLight: 0.5, void: 0.6 };

/* ---------- rooms ---------- */
function drawRoom(fb, o, amb) {
  const { th, lampX, lampY, room } = o, dark = o.mode === 'xray' || o.mode === 'candle' || o.mode === 'backlight';
  if (o.mode === 'xray') {
    for (let y = 0; y < EH; y++) for (let x = 0; x < EW; x++) fb.set(x, y, (x % 16 === 0 || y % 16 === 0) ? [16, 28, 58] : [10, 18, 40]);
    return;
  }
  for (let y = 0; y < EH; y++) for (let x = 0; x < EW; x++) {
    let c, lv, base;
    const dx = x - lampX, dy = y - lampY;
    const lamp = dark ? 0 : (o.dim ? 0.45 : 0.95) / (1 + (dx * dx + dy * dy * 1.6) / (o.dim ? 500 : 1100));
    if (y < TOP) {
      base = wallColor(room, th, x, y, o.t);
      lv = amb + (1 - amb) * lamp;
      c = tone(base, th, quant(lv, 5, x, y));
      if (room === 'lanes' && (x + y * 3) % 23 === 0 && hash(x, y, 3) > 0.5) c = mix(c, [255, 120, 255], 0.6);
    } else if (y <= TOP + 3) {
      const top = room === 'cards' ? [150, 104, 70] : room === 'lanes' ? [70, 60, 90] : room === 'show' ? [190, 60, 60] : th.steel;
      lv = amb + (1 - amb) * (dark ? 0.1 : (0.35 + 0.6 / (1 + dx * dx / 1400)) * (o.dim ? 0.5 : 1));
      c = tone(top, th, quant(lv, 5, x, y));
      if (!dark && !o.dim && y === TOP && Math.abs(dx) < 5) c = mix(th.key, WHITE, 0.5);
    } else if (y <= TOP + 11) {
      const front = room === 'cards' ? [120, 80, 54] : room === 'lanes' ? [50, 44, 70] : room === 'show' ? [230, 220, 200] : th.steel;
      lv = (amb + (1 - amb) * (dark ? 0.05 : (0.15 + 0.3 / (1 + dx * dx / 2500)) * (o.dim ? 0.5 : 1))) * (1 - (y - TOP - 4) * 0.04);
      base = (room === 'clinic' || !room) && y === TOP + 7 && x > 70 && x < 90 ? scl(front, 1.3) : front;
      if (room === 'show' && ((x >> 3) & 1)) base = [200, 70, 70];
      c = tone(base, th, quant(lv, 5, x, y));
      if (y === TOP + 4) c = scl(c, 0.7);
    } else {
      const leg = (room === 'clinic' || !room) && ((x >= 30 && x < 34) || (x >= 126 && x < 130));
      lv = amb * (leg ? 1.5 : 1.1) + (1 - amb) * (dark ? 0 : 0.1);
      c = tone(leg ? scl(th.steel, 0.8) : room === 'lanes' ? [60, 46, 40] : th.floor, th, quant(lv, 4, x, y));
    }
    fb.set(x, y, c);
  }
}
function wallColor(room, th, x, y, t) {
  if (room === 'cards') {
    // shelves of card boxes and a poster
    const shelf = y % 18 === 17;
    if (shelf) return [120, 84, 60];
    if (x >= 8 && x < 30 && y >= 8 && y < 34) { if (x === 8 || x === 29 || y === 8 || y === 33) return [40, 30, 30]; return y < 20 ? [230, 120, 80] : [250, 220, 120]; }
    const box = Math.floor(x / 7) + Math.floor(y / 18) * 31, k = hash(box, 5, 2);
    if (x % 7 === 0) return [60, 46, 40];
    return k < 0.25 ? [200, 80, 90] : k < 0.5 ? [80, 130, 200] : k < 0.75 ? [230, 200, 90] : [110, 180, 120];
  }
  if (room === 'lanes') {
    // dark alley wall with lanes in perspective and blacklit pins at the back
    if (y < 30) { const g = (x + Math.floor(t * 20)) % 40 < 3 ? [180, 80, 255] : [40, 26, 70]; return y % 6 === 0 ? [60, 40, 110] : g; }
    const lane = Math.floor((x - 80) / ((y - 20) * 0.5 + 1));
    if (y > 34 && y < 42 && x % 8 > 3 && x % 8 < 6) return [240, 240, 255];
    return (lane & 1) ? [96, 70, 52] : [110, 82, 60];
  }
  if (room === 'show') {
    // a striped fair tent with bunting
    if (y < 10) return ((x >> 2) & 1) ? [240, 220, 120] : [90, 160, 220];
    if (y < 14 && ((x + y * 2) % 12 < 6)) return (Math.floor(x / 12) & 1) ? [230, 80, 80] : [80, 200, 140];
    return ((x >> 4) & 1) ? [236, 226, 210] : [220, 90, 90];
  }
  // the clinic: tiles, a weight chart, a cabinet and a framed graded card
  const grout = x % 10 === 0 || y % 8 === 0;
  let base = grout ? scl(th.wall, 0.72) : scl(th.wall, 0.94 + hash(x / 10 | 0, y / 8 | 0, 3) * 0.12);
  base = scl(base, 1 - clamp((y - 30) / 45) * 0.25 * (0.6 + hash(x >> 1, y >> 1, 9) * 0.4));
  if (x >= 8 && x < 26 && y >= 12 && y < 36) {
    base = (x === 8 || x === 25 || y === 12 || y === 35) ? scl(th.paper, 0.72) : th.paper;
    if (y > 16 && y < 33 && y % 3 === 0 && x > 10 && x < 23) base = scl(th.paper, 0.75);
    const gy = Math.round(30 - (x - 11) * 0.9 - Math.sin(x) * 1.5);
    if (x > 10 && x < 23 && y === gy) base = th.fabric;
  }
  if (x >= 30 && x < 38 && y >= 14 && y < 26) {
    // a slabbed card someone gave Dr. Okafor: GEMLINE 10
    base = (x === 30 || x === 37 || y === 14 || y === 25) ? [200, 206, 214] : y < 17 ? [200, 50, 50] : [220, 210, 180];
    if (y >= 18 && y < 24 && x > 31 && x < 36) base = [120, 170, 110];
  }
  if (x >= 128 && x < 152 && y >= 16 && y < 46) {
    base = scl(th.steel, 0.9);
    if (x === 128 || x === 151 || y === 16 || y === 45 || x === 140) base = scl(th.steel, 0.6);
    if ((x === 137 || x === 143) && y > 28 && y < 34) base = scl(th.steel, 1.2);
  }
  return base;
}
function drawLamp(fb, o) {
  const { th, lampX, lampY } = o, lx = Math.round(lampX), ly = Math.round(lampY), k0 = o.dim ? 0.18 : 0.45;
  for (let y = 0; y < ly - 5; y++) fb.set(lx, y, tone(th.steel, th, 0.3));
  for (let dy = 0; dy < 5; dy++) { const hw = 2 + dy; for (let i = -hw; i <= hw; i++) fb.set(lx + i, ly - 5 + dy, tone(th.steel, th, i < 0 ? 0.6 : 0.3)); }
  for (let i = -4; i <= 4; i++) fb.set(lx + i, ly, mix(th.key, WHITE, o.dim ? 0.3 : 0.7));
  for (let y = ly - 14; y < ly + 26; y++) for (let x = lx - 26; x <= lx + 26; x++) {
    const r = Math.hypot(x - lx, (y - ly) * 0.9) / 26; if (r >= 1) continue;
    const k = quant((1 - r) * (1 - r), 4, x & 255, y & 255) * k0; if (k > 0) fb.add(x, y, scl(th.key, k));
  }
}
// How well the lamp lights a point (0 = dark, 1 = right under it).
export function lampVis(lampX, lampY, x, y, dim) { return clamp((1 - Math.hypot(x - lampX, (y - lampY) * 0.8) / (dim ? 22 : 34)) * 1.5); }

/* ---------- blob patients ---------- */
function renderBlob(fb, o, amb) {
  const { p, t, th, lampX, lampY } = o, mode = o.mode;
  const parts = partsFor(o);
  PB.fill(-1);
  parts.forEach((pt, pi) => {
    const cx = OX + pt.x, cy = TOP + pt.y;
    for (let y = Math.floor(cy - pt.ry - 2); y <= Math.ceil(cy + pt.ry + 2); y++) {
      if (y < 0 || y >= TOP) continue;
      if (pt.clipTop != null && y < TOP + pt.clipTop) continue;
      for (let x = Math.floor(cx - pt.rx - 2); x <= Math.ceil(cx + pt.rx + 2); x++) {
        if (x < 0 || x >= EW) continue;
        let nx = (x + 0.5 - cx) / pt.rx, ny = (y + 0.5 - cy) / pt.ry;
        if (pt.wob) { const ang = Math.atan2(ny, nx), w = 1 + 0.035 * Math.sin(ang * 4 + t * 3) + 0.02 * Math.sin(ang * 7 - t * 5); nx /= w; ny /= w; }
        let d = nx * nx + ny * ny;
        if (pt.fuzz && d > 0.8 && d < 1.12 && hash(x, y, Math.floor(t * 6)) > 0.5) d = 0.95;
        if (d >= 1) continue;
        if (pt.mat === 'wing' && matColor('wing', th, nx, ny, o, x, y, pt) === null) continue;
        const i = y * EW + x, nz = Math.sqrt(1 - Math.min(d, 0.999)), n = norm3([nx * pt.h, ny * pt.h, nz]);
        PB[i] = pi; NXb[i] = n[0]; NYb[i] = n[1]; NZb[i] = n[2]; LXb[i] = nx; LYb[i] = ny;
      }
    }
  });
  const away = Math.sign(lampX - OX) || 1;
  const back = mode === 'backlight';
  for (let y = 0; y < TOP; y++) for (let x = 0; x < EW; x++) {
    const i = y * EW + x, pi = PB[i]; if (pi < 0) continue;
    const pt = parts[pi], n = [NXb[i], NYb[i], NZb[i]];
    const edge = (x === 0 || PB[i - 1] < 0) || (x === EW - 1 || PB[i + 1] < 0) || (y === 0 || PB[i - EW] < 0) || (PB[i + EW] < 0 && y + 1 < TOP);
    const over = !edge && ((PB[i - 1] >= 0 && PB[i - 1] < pi) || (PB[i + 1] >= 0 && PB[i + 1] < pi) || (PB[i - EW] >= 0 && PB[i - EW] < pi) || (PB[i + EW] >= 0 && PB[i + EW] < pi));
    if (mode === 'xray') {
      let c = mix([28, 56, 108], [120, 168, 228], quant(0.25 + (1 - n[2]) * 0.6, 4, x, y));
      if (edge) c = [170, 210, 255];
      fb.set(x, y, c); continue;
    }
    const base = matColor(pt.mat, th, LXb[i], LYb[i], o, x, y, pt) || [0, 0, 0];
    if (back) {
      // lit from behind: thin edges glow, thick middles glow less
      const thick = n[2];
      let c = mix(scl(base, 1.25), mix(base, [255, 250, 220], 0.5), quant(1 - thick * 0.55, 4, x, y));
      if (pt.mat === 'void') c = mix([20, 8, 30], C.vein, hash(x, y, 4) > 0.86 ? 0.6 : 0);
      if (edge) c = scl(c, 0.6);
      fb.set(x, y, c); continue;
    }
    const L = norm3([lampX - x, lampY - y, 26]);
    const dif = Math.max(0, dot(n, L)), fall = clamp((o.dim ? 0.8 : 1.5) / (1 + ((x - lampX) ** 2 + (y - lampY) ** 2) / (o.dim ? 2200 : 5000)));
    let lv = amb + (1 - amb) * (0.18 + 0.82 * dif) * fall;
    if (y > TOP - 3) lv *= 0.82;
    let c = tone(base, th, quant(lv, 5, x, y));
    if (-NXb[i] * away > 0.55 && NZb[i] < 0.6 && NYb[i] < 0.4) c = mix(c, th.rim, 0.4);
    const g = GLOSSY[pt.mat];
    if (g) {
      const H = norm3([L[0], L[1], L[2] + 1]), s = Math.pow(Math.max(0, dot(n, H)), 36) * g * (o.p.signs.includes('shine') ? 1.4 : 1);
      if (s > 0.5) c = mix(th.key, WHITE, 0.65); else if (s > 0.22) c = mix(c, th.key, 0.45);
    }
    if (pt.mat === 'void') { const near = lampVis(lampX, lampY, x, y, o.dim); if (hash(x >> 1, y, 8) > 0.82 || Math.abs(Math.sin(x * 0.4 + y * 0.3 + t)) < 0.06) c = mix(c, C.vein, 0.5 + 0.5 * near); }
    if (edge) c = scl(tone(base, th, quant(lv * 0.6, 5, x, y)), 0.55);
    else if (over) c = scl(c, 0.78);
    fb.set(x, y, c);
  }
  return parts;
}

function eye(fb, ex, ey, c, blink, look, big) {
  if (blink) { for (let i = -2; i <= 2; i++) fb.set(ex + i, ey, c); return; }
  const rows = big ? [[-2, 1], [-1, 2], [0, 2], [1, 2], [2, 1]] : [[-1, 1], [0, 1], [1, 1]];
  for (const [dy, hw] of rows) for (let i = -hw; i <= hw; i++) fb.set(ex + i, ey + dy, c);
  fb.set(ex - 1 + look, ey - 1, WHITE);
}
function drawDetails(fb, o, parts) {
  const { p, t, th, lampX } = o, has = (k) => p.signs.includes(k);
  const blink = (t % 3.7) < 0.13, eyeC = mix(th.amb, BLACK, 0.7);
  const happy = o.happy;
  if (p.sp === 'gloop') {
    const b = parts[0], cx = OX + b.x, cy = TOP + b.y, look = clamp(Math.round((lampX - cx) / 25), -1, 1);
    if (p.ail === 'void') { for (const s of [-8, 8]) { fb.set(Math.round(cx + s), Math.round(cy - 3), C.vein); fb.set(Math.round(cx + s + 1), Math.round(cy - 3), C.vein); } return; }
    eye(fb, Math.round(cx - 8 + look), Math.round(cy - 3), eyeC, blink, look, true);
    eye(fb, Math.round(cx + 8 + look), Math.round(cy - 3), eyeC, blink, look, true);
    const mx = Math.round(cx), my = Math.round(cy + 3);
    if (happy) { fb.set(mx - 2, my, eyeC); fb.set(mx - 1, my + 1, eyeC); fb.set(mx, my + 1, eyeC); fb.set(mx + 1, my + 1, eyeC); fb.set(mx + 2, my, eyeC); }
    else if (p.ail === 'reflux') { for (let i = -3; i <= 3; i++) fb.set(mx + i, my + (i & 1), eyeC); }
    else if (p.ail === 'split' || o.stress > 70) { fb.set(mx - 1, my + 1, eyeC); fb.set(mx, my, eyeC); fb.set(mx + 1, my + 1, eyeC); }
    else { fb.set(mx - 1, my, eyeC); fb.set(mx, my + 1, eyeC); fb.set(mx + 1, my, eyeC); }
  } else if (p.sp === 'cat') {
    const slump = has('dull') ? 3 : 0, ey = TOP - 35 + slump, jx = parts[parts.length - 1].x;
    const iris = p.ail === 'overcharge' ? mix(th.rim, WHITE, 0.4) : p.ail === 'shadow' ? [150, 120, 255] : [228, 186, 76];
    for (const sx of [-5, 5]) {
      const ex = Math.round(OX + sx + jx);
      if (blink || happy) { for (let i = -2; i <= 2; i++) fb.set(ex + i, ey + (happy && Math.abs(i) < 2 ? -1 : 0), eyeC); continue; }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) if (!(Math.abs(dx) === 2 && dy !== 0)) fb.set(ex + dx, ey + dy, iris);
      fb.set(ex, ey - 1, eyeC); fb.set(ex, ey, eyeC); fb.set(ex, ey + 1, eyeC);
      if (slump) for (let dx = -2; dx <= 2; dx++) fb.set(ex + dx, ey - 1, scl(th.cat, 0.6));
    }
    const X = Math.round(OX + jx);
    fb.set(X, TOP - 31 + slump, C.pink); fb.set(X - 1, TOP - 31 + slump, C.pink);
    fb.set(X - 2, TOP - 29 + slump, eyeC); fb.set(X - 1, TOP - 28 + slump, eyeC); fb.set(X, TOP - 29 + slump, eyeC); fb.set(X + 1, TOP - 28 + slump, eyeC);
    for (const s of [-1, 1]) { line(fb, X + s * 5, TOP - 30 + slump, X + s * 12, TOP - 31 + slump, [214, 214, 220]); line(fb, X + s * 5, TOP - 29 + slump, X + s * 12, TOP - 28 + slump, [214, 214, 220]); }
    for (const s of [-1, 1]) { fb.set(X + s * 8, TOP - 46 + slump, C.pink); fb.set(X + s * 8, TOP - 45 + slump, C.pink); }
  } else if (p.sp === 'fern') {
    const b = parts.find((q) => q.head), cx = OX + b.x, cy = TOP + b.y;
    const sad = has('droop') || has('pale');
    for (const s of [-1, 1]) { const ex = Math.round(cx + s * 2.5), ey = Math.round(cy - 1); if (blink) { fb.set(ex, ey, eyeC); fb.set(ex + 1, ey, eyeC); } else { fb.set(ex, ey, eyeC); fb.set(ex, ey + 1, eyeC); fb.set(ex + 1, ey + 1, eyeC); fb.set(ex + 1, ey, WHITE); } }
    const my = Math.round(cy + 3), mx = Math.round(cx);
    if (sad && !happy) { fb.set(mx - 1, my + 1, eyeC); fb.set(mx, my, eyeC); fb.set(mx + 1, my + 1, eyeC); } else { fb.set(mx - 1, my, eyeC); fb.set(mx, my + 1, eyeC); fb.set(mx + 1, my, eyeC); }
  } else if (p.sp === 'moth') {
    const h = parts.find((q) => q.head), hx = OX + h.x, hy = TOP + h.y;
    for (const s of [-1, 1]) {
      line(fb, hx + s * 3, hy - 8, hx + s * 9, hy - 18, [90, 70, 60]);
      for (let k = 0; k < 4; k++) fb.set(hx + s * (7 + k * 0.6), hy - 16 + k, [120, 96, 80]);
      const ex = Math.round(hx + s * 4), ey = Math.round(hy - 1);
      for (let dy = -2; dy <= 1; dy++) for (let dx = -2; dx <= 1; dx++) if (!(Math.abs(dx + 0.5) > 1.6 && Math.abs(dy + 0.5) > 1.6)) fb.set(ex + dx, ey + dy, eyeC);
      if (p.ail === 'lampstruck' && !o.dim) { const k = (Math.floor(t * 8) % 3); fb.set(ex - 1 + (k === 1 ? 1 : 0), ey - 1, th.key); fb.set(ex, ey, mix(th.key, WHITE, 0.5)); fb.set(ex - 2 + k, ey + 1, th.key); }
      else if (!blink) { fb.set(ex - 1, ey - 1, WHITE); fb.set(ex, ey - 1, WHITE); }
    }
    fb.set(hx, hy + 3, eyeC); fb.set(hx - 1, hy + 4, eyeC); fb.set(hx + 1, hy + 4, eyeC);
  }
  // stressed patients sweat
  if (o.stress > 70) {
    const top = PBtop();
    for (let k = 0; k < 2; k++) { const ph = (t * 1.5 + k * 0.5) % 1, x = top[0] + (k ? 9 : -9), y = top[1] + 2 + ph * 6; fb.set(Math.round(x), Math.round(y), [150, 200, 255]); fb.set(Math.round(x), Math.round(y) + 1, [110, 170, 240]); }
  }
}
function PBtop() { for (let y = 0; y < TOP; y++) for (let x = 0; x < EW; x++) if (PB[y * EW + x] >= 0) return [x, y]; return [OX, TOP - 30]; }

/* ---------- inside views: X-ray, backlight, candle, roots ---------- */
const mark = (buf, x, y, v, r = 0) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const xx = Math.round(x) + dx, yy = Math.round(y) + dy; if (xx >= 0 && yy >= 0 && xx < EW && yy < EH) buf[yy * EW + xx] = v; } };
const onBody = (x, y) => x >= 0 && y >= 0 && x < EW && y < TOP && PB[y * EW + x] >= 0;
function drawInside(fb, o, parts) {
  const { p, t, mode } = o, A = AILMENTS[p.ail];
  const W = mode === 'xray' ? [236, 246, 255] : [30, 26, 40], D = [40, 70, 120];
  const P = (x, y, c = W, find = true) => { x = Math.round(x); y = Math.round(y); if (onBody(x, y)) { fb.set(x, y, c); if (find) mark(XB, x, y, 1, 1); } };
  const kind = mode === 'backlight' ? A.backlight : A.xray;
  if (p.sp === 'gloop') {
    const b = parts[0], cx = OX + b.x + 6, cy = TOP + b.y + 5;
    if (kind === 'object') { drawObject({ set: (x, y, c) => P(x, y, c) }, p.obj || 'sock', cx, cy, W, mode === 'xray' ? [190, 210, 240] : [60, 50, 70]); }
    if (kind === 'mass') for (let y = -6; y <= 6; y++) for (let x = -7; x <= 7; x++) { const d = (x * x) / 49 + (y * y) / 36; if (d < 1 && (d < 0.7 || hash(x, y, Math.floor(t * 4)) > 0.5)) P(cx - 4 + x, cy - 2 + y, mode === 'xray' ? mix(W, D, d * 0.6) : mix([40, 34, 50], [90, 110, 90], d)); }
    if (kind === 'bubbles') for (let k = 0; k < 14; k++) { const bx = OX - 16 + hash(k, 1) * 32, by = TOP - 30 + ((hash(k, 2) * 26 + t * 4) % 26); for (let a = 0; a < 6; a++) P(bx + Math.cos(a) * 1.6, by + Math.sin(a) * 1.6, mode === 'xray' ? W : [255, 255, 230]); }
    if (kind === 'split') { for (let y = -10; y < 4; y++) P(OX + 6 + Math.sin(y * 0.6 + t * 3), TOP - 14 + y, mode === 'xray' ? W : [40, 70, 40]); }
    if (kind === 'void') for (let y = 0; y < TOP; y++) for (let x = 0; x < EW; x++) if (onBody(x, y)) { fb.set(x, y, mode === 'xray' ? [8, 14, 34] : [10, 4, 16]); mark(XB, x, y, 1); }
  }
  if (p.sp === 'cat' || p.sp === 'moth') {
    if (mode !== 'xray') return;
    const top = p.sp === 'cat' ? -34 : -29, slump = p.signs.includes('dull') ? 3 : 0, S = (x, y) => P(x, y, W, false);
    for (let a = 0; a < 50; a++) S(OX + Math.cos(a / 8) * 7, TOP + top + slump + Math.sin(a / 8) * 6);
    for (let y = top + 8; y < -4; y++) S(OX + Math.round(Math.sin(y * 0.2)), TOP + y);
    for (let r = 0; r < 4; r++) { const ry = TOP - 22 + r * 4; for (let k = 2; k < 10 - r; k++) { S(OX - k, ry + (k >> 2)); S(OX + k, ry + (k >> 2)); } }
    if (p.sp === 'cat') for (let k = 0; k < 4; k++) S(OX + 16 + k * 2, TOP - 4 - k * 6);
    if (kind === 'hairball') { const big = p.ball === 'large' ? 1.7 : 1; for (let k = 0; k < 80; k++) { const a = k * 0.7, r = (2 + (k % 5)) * big; P(OX - 2 + Math.cos(a) * r * 0.9, TOP - 12 + Math.sin(a * 1.3) * r * 0.7, [255, 240, 200]); } }
    if (kind === 'static') for (let y = 0; y < TOP; y++) for (let x = 0; x < EW; x++) if (onBody(x, y) && hash(x, y, Math.floor(t * 15)) > 0.45) { fb.set(x, y, W); mark(XB, x, y, 1); }
    if (p.sp === 'moth') for (const s of [-1, 1]) for (let a = 0; a < 30; a++) {
      const lx = OX + s * 6 + Math.cos(a / 4.8) * 4, ly = TOP - 15 + Math.sin(a / 4.8) * 3;
      P(lx, ly, [150, 200, 255], false);
      if (kind === 'cloudy') for (let k = 0; k < 6; k++) if (hash(a, k, s + 5) > 0.4) P(lx + ((k % 3) - 1) * s, ly + (k > 2 ? 1 : -1), [210, 220, 235]);
    }
  }
  if (p.sp === 'fern' && mode === 'xray') {
    const rot = kind === 'rootsRot';
    for (let k = 0; k < 7; k++) { let x = OX - 6 + k * 2, y = TOP - 15; for (let s = 0; s < 14; s++) { x += (hash(k, s, 3) - 0.5) * 2; y += 1; P(x, y, rot && hash(k, s, 8) > 0.45 ? D : W, rot); } }
    if (rot) for (let k = 0; k < 6; k++) { const bx = OX - 8 + hash(k, 4) * 16, by = TOP - 10 + hash(k, 5) * 8; for (let a = 0; a < 9; a++) P(bx + (a % 3), by + ((a / 3) | 0), [20, 36, 70]); }
  }
}
function drawRoots(fb, o) {
  const A = AILMENTS[o.p.ail], kind = A.roots || 'healthy';
  const col = kind === 'rot' ? [70, 44, 34] : kind === 'dry' ? [214, 196, 150] : [236, 222, 190];
  const cy = TOP - 18;
  for (let k = 0; k < 11; k++) {
    let x = OX - 8 + k * 1.6, y = cy;
    for (let s = 0; s < 20; s++) {
      x += (hash(k, s, 3) - 0.5) * 2.2; y += 1; if (y >= TOP) break;
      let c = col;
      if (kind === 'rot' && hash(k, s, 8) > 0.5) c = [40, 30, 28];
      if (kind === 'dry' && hash(k, s, 8) > 0.7) { continue; }
      fb.set(Math.round(x), y, c); mark(XB, x, y, 1, 1);
      if (kind === 'threads' && hash(k, s, 9) > 0.6) { fb.set(Math.round(x) + 1, y, WHITE); fb.set(Math.round(x) - 1, y - 1, [250, 250, 250]); }
    }
  }
  // the soil clump
  for (let y = cy - 2; y < cy + 4; y++) for (let x = OX - 9; x <= OX + 9; x++) if ((x - OX) ** 2 / 81 + (y - cy - 1) ** 2 / 9 < 1) fb.set(x, y, kind === 'rot' ? C.wetSoil : C.soil);
}
function drawCandle(fb, o) {
  // a dark room, the egg held up to a bright light
  const { p, t } = o, A = AILMENTS[p.ail], kind = A.candle || 'healthy', cx = OX, cy = TOP - 26;
  for (let y = 0; y < EH; y++) for (let x = 0; x < EW; x++) {
    const nx = (x + 0.5 - cx) / 13, ny = (y + 0.5 - cy) / 18, d = nx * nx + ny * ny;
    if (d < 1) {
      PB[y * EW + x] = 0;
      let c = mix([255, 210, 120], [200, 90, 30], quant(Math.sqrt(d), 5, x, y));
      if (kind === 'solid') c = d > 0.9 ? [180, 80, 20] : [16, 10, 8];
      if (kind === 'thin' && hash(x >> 1, y >> 1, 5) > 0.7) { c = [255, 240, 200]; mark(XB, x, y, 1); }
      fb.set(x, y, c);
      if (kind === 'solid') mark(XB, x, y, 1);
    } else fb.set(x, y, d < 1.5 ? [40, 20, 10] : [6, 4, 8]);
  }
  if (kind === 'solid') return;
  const moving = kind !== 'still', big = kind === 'big' ? 1.6 : 1, wig = moving ? Math.sin(t * (kind === 'big' ? 6 : 2)) * 0.8 : 0;
  for (let a = 0; a < 70; a++) { const r = (6 - a / 30) * big; const x = cx + Math.cos(a / 7) * r + wig, y = cy + 2 + Math.sin(a / 7) * r * 1.1; fb.set(Math.round(x), Math.round(y), [90, 30, 10]); mark(XB, x, y, 1, 1); }
  for (let a = 0; a < 20; a++) { const x = cx + 3 * big + Math.cos(a / 3) * 2.4 * big + wig, y = cy - 5 * big + Math.sin(a / 3) * 2.4 * big; fb.set(Math.round(x), Math.round(y), [90, 30, 10]); mark(XB, x, y, 1, 1); }
  if (kind === 'crack') { for (let x = -8; x <= 6; x++) { const y = cy - 6 + Math.round(Math.sin(x * 1.1) * 1.5); fb.set(cx + x, y, [255, 255, 230]); fb.set(cx + x, y + 1, [255, 230, 160]); mark(XB, cx + x, y, 1, 1); } }
}

/* ---------- signs you can spot with the lamp ---------- */
function drawSigns(fb, o, parts) {
  const { p, t, th, lampX, lampY, found } = o;
  signsOf(p).forEach((s, si) => {
    if (p.sp === 'pebble') return;
    if (s.kind === 'glazed' && o.dim) return;
    let px = OX + (s.x || 0), py = TOP + (s.y || 0);
    if (s.kind === 'bud') { const b = parts.find((q) => q.bud); if (b) { px = OX + b.x; py = TOP + b.y; } }
    const vis = s.always ? 1 : lampVis(lampX, lampY, px, py, o.dim);
    if (vis < 0.3) return;
    const m = (x, y, r = 1) => mark(SB, x, y, si, r);
    const k = clamp((vis - 0.3) / 0.5);
    const B = (x, y, c, a) => { x = Math.round(x); y = Math.round(y); if (onBody(x, y)) { fb.blend(x, y, c, a); m(x, y, 0); } };
    switch (s.kind) {
      case 'lump':
        for (let y = -5; y <= 5; y++) for (let x = -7; x <= 7; x++) if (x * x / 49 + y * y / 25 < 1) B(px + x, py + y, mix(th.slime, [30, 40, 30], 0.6), 0.45 * k);
        break;
      case 'cloudy':
        for (let y = -7; y <= 7; y++) for (let x = -10; x <= 10; x++) if (x * x / 100 + y * y / 49 < 1 && hash(x + px, y + py, 6) > 0.35) B(px + x, py + y, [236, 236, 226], 0.4 * k);
        break;
      case 'discolor':
        for (let y = -5; y <= 5; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y < 30) { if (hash(px + x, py + y, 2) > 0.5) B(px + x, py + y, [140, 130, 100], 0.5 * k); else m(px + x, py + y, 0); }
        break;
      case 'drip':
        for (let x = -5; x <= 5; x++) { fb.blend(px + x, TOP, th.slime, 0.8 * k); fb.blend(px + x, TOP + 1, scl(th.slime, 0.7), 0.6 * k); m(px + x, TOP, 1); }
        break;
      case 'shine':
        for (let x = -3; x <= 3; x++) B(px + x, py - Math.abs(x) * 0.4, WHITE, 0.6 * k);
        break;
      case 'bubbles':
        for (let b = 0; b < 6; b++) {
          const bx = px + ((b * 7) % 13) - 6, by = py + 6 - ((t * 7 + b * 3.3) % 14);
          for (let a = 0; a < 8; a++) B(bx + Math.cos(a * 0.8) * 1.5, by + Math.sin(a * 0.8) * 1.5, WHITE, 0.7 * k);
          m(bx, by, 2);
        }
        break;
      case 'bud': {
        const pulse = 0.5 + 0.5 * Math.sin(t * 6);
        for (let y = -6; y <= 6; y++) for (let x = -7; x <= 7; x++) if (onBody(px + x, py + y) && x * x + y * y < 40) { if (x * x + y * y > 18) fb.blend(px + x, py + y, th.rim, 0.5 * k * pulse); m(px + x, py + y, 0); }
        break;
      }
      case 'sag': case 'puffed': case 'droop': case 'wingdroop':
        for (let y = -6; y <= 6; y++) for (let x = -12; x <= 12; x++) if (onBody(px + x, py + y)) m(px + x, py + y, 0);
        break;
      case 'sparks': {
        const f = Math.floor(t * 12), n = p.quirk === 'sparks' ? 1 : 3;
        for (let b = 0; b < n; b++) {
          let x = px - 9, y = py + (b - 1) * 2;
          for (let j = 0; j < 6; j++) { const nx = x + 3, ny = py + (hash(f, b, j) - 0.5) * 6; line(fb, x, y, nx, ny, j & 1 ? WHITE : mix(th.key, WHITE, 0.5)); m(nx, ny, 2); x = nx; y = ny; }
        }
        break;
      }
      case 'fluff':
        for (let y = -1; y <= 1; y++) for (let x = -2; x <= 2; x++) if (hash(x, y, 7) > 0.25) { fb.blend(px + x, py + y, [196, 196, 206], 0.9 * k); m(px + x, py + y, 1); }
        break;
      case 'drool':
        for (let y = 0; y < 3 + Math.round((t * 2) % 3); y++) { fb.blend(px, py + y, [200, 230, 255], 0.8 * k); m(px, py + y, 1); }
        break;
      case 'dull':
        for (let y = -9; y <= 9; y++) for (let x = -11; x <= 11; x++) if (onBody(px + x, py + y) && x * x / 121 + y * y / 81 < 1) { if (hash(px + x, py + y, 4) > 0.6) fb.blend(px + x, py + y, [130, 130, 136], 0.55 * k); m(px + x, py + y, 0); }
        break;
      case 'bald':
        for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (x * x + y * y < 22 && onBody(px + x, py + y)) { if (p.sp === 'cat' && hash(x, y, 2) > 0.7) fb.blend(px + x, py + y, [60, 40, 40], 0.6 * k); m(px + x, py + y, 0); }
        break;
      case 'soggy':
        for (let y = -4; y <= 3; y++) for (let x = -10; x <= 10; x++) B(px + x, py + y, [40, 52, 86], 0.45 * k);
        for (let d = 0; d < 3; d++) { const dx = px - 6 + d * 6, dy = Math.round(py + 2 + ((t * 10 + d * 4) % 7)); fb.blend(dx, dy, [120, 170, 240], k); fb.blend(dx, dy + 1, [80, 130, 220], k); m(dx, dy, 1); }
        break;
      case 'mites':
        if (vis < 0.6) return;
        for (let mm = 0; mm < 7; mm++) {
          const a = t * (1.5 + mm * 0.3) + mm * 2, x = Math.round(px + Math.cos(a) * (3 + mm % 3) + (mm - 3) * 1.5), y = Math.round(py + Math.sin(a * 1.3) * 2);
          if (onBody(x, y)) { fb.set(x, y, [36, 24, 24]); if (mm & 1) fb.set(x + 1, y, [80, 40, 30]); m(x, y, 2); }
        }
        break;
      case 'pale':
        for (let y = -5; y <= 5; y++) for (let x = -10; x <= 10; x++) if (onBody(px + x, py + y)) { if (Math.abs(x) > 5) fb.blend(px + x, py + y, [240, 226, 120], 0.35 * k); m(px + x, py + y, 0); }
        break;
      case 'spots':
        for (let d = 0; d < 6; d++) { const x = px + Math.round((hash(d, 1, 4) - 0.5) * 14), y = py + Math.round((hash(d, 2, 4) - 0.5) * 6); if (onBody(x, y)) { fb.blend(x, y, [110, 70, 40], 0.85 * k); fb.blend(x + 1, y, [130, 84, 50], 0.6 * k); m(x, y, 1); } }
        break;
      case 'mold':
        for (let x = -10; x <= 10; x++) if (hash(x, 3, 6) > 0.4) { fb.blend(px + x, py + (hash(x, 1) > 0.5 ? 0 : -1), [240, 240, 236], 0.85 * k); m(px + x, py, 1); }
        break;
      case 'dust':
        for (let d = 0; d < 7; d++) { const ph = (t * 0.8 + d / 7) % 1, x = Math.round(px - 3 - ph * 14 + Math.sin(d) * 3), y = Math.round(py - 2 - ph * 8 + Math.cos(d * 2) * 2); fb.blend(x, y, [210, 204, 190], (1 - ph) * k); fb.blend(x + 1, y, [190, 184, 170], (1 - ph) * 0.6 * k); m(x, y, 2); }
        break;
      case 'torn':
        for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) m(px + x, py + y, 0);
        break;
      case 'glazed':
        for (let y = -4; y <= 3; y++) for (let x = -9; x <= 9; x++) m(px + x + Math.round(clamp((lampX - OX) / 10, -4, 4)), py + y, 0);
        break;
      case 'void':
        for (let y = -14; y <= 12; y++) for (let x = -22; x <= 22; x++) if (onBody(px + x, py + y)) m(px + x, py + y, 0);
        break;
      case 'shadow': {
        // the cat's shadow, cast on the wall, doing its own thing
        const sx = px + Math.sin(t * 0.7) * 8, sy = py + Math.sin(t * 1.3) * 3;
        for (let y = -16; y <= 16; y++) for (let x = -12; x <= 12; x++) {
          const body = (x * x) / 144 + ((y - 4) * (y - 4)) / 144 < 1, head = (x * x) / 64 + ((y + 12) * (y + 12)) / 49 < 1, ear = Math.abs(Math.abs(x) - 6) < 2 && y < -17 + Math.abs(x) * 0.2;
          if ((body || head || ear) && PB[(Math.round(sy + y)) * EW + Math.round(sx + x)] < 0) { fb.blend(sx + x, sy + y, [20, 14, 30], 0.75); m(sx + x, sy + y, 0); }
        }
        fb.set(Math.round(sx - 3), Math.round(sy - 12), [180, 140, 255]); fb.set(Math.round(sx + 3), Math.round(sy - 12), [180, 140, 255]);
        break;
      }
      default: break;
    }
    if (found && found.has(s.kind)) {
      const r = 6, a = th.accent;
      for (const [cx, cy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) { fb.set(px + cx, py + cy, a); fb.set(px + cx + Math.sign(-cx), py + cy, a); fb.set(px + cx, py + cy + Math.sign(-cy), a); }
    }
  });
  // flipped leaves show what's on the underside
  if (o.flipped && o.flipped.size) parts.forEach((pt) => {
    if (pt.leaf == null || !o.flipped.has(pt.leaf)) return;
    const cx = OX + pt.x, cy = TOP + pt.y;
    for (let j = 0; j < 7; j++) {
      const x = Math.round(cx + (hash(j, pt.leaf, 3) - 0.5) * pt.rx * 1.4 + (p.under === 'mites' ? Math.sin(t * 3 + j) : 0)), y = Math.round(cy + (hash(j, pt.leaf, 4) - 0.5) * pt.ry);
      if (p.under === 'mites') { fb.set(x, y, [40, 26, 26]); mark(XB, x, y, 1, 2); }
      else if (p.under === 'blackspots' && j < 4) { fb.set(x, y, [24, 20, 20]); fb.set(x + 1, y, [40, 34, 30]); mark(XB, x, y, 1, 2); }
    }
  });
}
export function drawObject(fb, obj, cx, cy, c, c2) {
  cx = Math.round(cx); cy = Math.round(cy); c2 = c2 || c;
  if (obj === 'sock') {
    for (let y = -6; y < 3; y++) for (let x = 0; x < 4; x++) fb.set(cx + x - 2, cy + y, ((y + 6) >> 1) & 1 ? c : c2);
    for (let y = 3; y < 6; y++) for (let x = 0; x < 8; x++) fb.set(cx + x - 2, cy + y, c);
  } else if (obj === 'keys') {
    for (let a = 0; a < 20; a++) fb.set(Math.round(cx - 3 + Math.cos(a / 3.2) * 3), Math.round(cy - 2 + Math.sin(a / 3.2) * 3), c);
    line(fb, cx, cy, cx + 6, cy + 4, c); fb.set(cx + 5, cy + 5, c); fb.set(cx + 4, cy + 4, c2);
    line(fb, cx - 1, cy + 1, cx + 1, cy + 7, c2);
  } else if (obj === 'spoon') {
    for (let y = -3; y <= 3; y++) for (let x = -2; x <= 2; x++) if (x * x / 5 + y * y / 10 < 1) fb.set(cx + x, cy + y - 3, c);
    line(fb, cx, cy + 1, cx + 2, cy + 8, c);
  } else if (obj === 'pin') {
    // a bowling pin: neck, belly, two red stripes
    for (let y = -8; y <= 7; y++) { const w = y < -5 ? 1.5 : y < -2 ? 1 : 1 + Math.sin((y + 2) / 9 * Math.PI) * 2.5; for (let x = -Math.round(w); x <= Math.round(w); x++) fb.set(cx + x, cy + y, (y === -3 || y === -2) ? c2 : c); }
  } else if (obj === 'hairball') {
    for (let k = 0; k < 50; k++) { const a = k * 0.7, r = 1 + (k % 4); fb.set(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a * 1.3) * r * 0.8), k & 1 ? c : c2); }
  }
}

/* ---------- eggs: stacked voxel slices you can turn ---------- */
const EGG_CACHE = new Map();
function buildEgg(p, th) {
  const has = (k) => p.signs.includes(k), key = p.ail + p.signs.join() + th.id; if (EGG_CACHE.has(key)) return EGG_CACHE.get(key);
  const R = 13, NZ = 30, rock = p.ail === 'rock';
  const mat = (x, y, z) => {
    if (z < 0) return 0;
    const r = Math.hypot(x, y);
    if (z <= 5 && r < 12) { const rr = r / 12, top = 5 * Math.sqrt(Math.max(0, 1 - rr ** 4)); if (z <= top) return 4; }
    const zz = (z - 15.5) / 10.5;
    if (Math.abs(zz) < 1) {
      const rxy = (rock ? 7.4 : 6.8) * (1 - (rock ? 0.05 : 0.16) * zz) * (rock ? 1 + 0.08 * Math.sin(Math.atan2(y, x) * 3 + z * 0.4) : 1);
      if ((x * x + y * y) / (rxy * rxy) + zz * zz < 1) {
        if (has('crack') && y > 2 && Math.abs(z - (18 + 1.8 * Math.sin(x * 1.1 + 1))) < 0.7) return 7;
        if (has('frost') && zz > 0.55 && hash(x, y, z) > 0.35) return 8;
        if (has('moss') && zz < -0.25 && hash(x, y, z) > 0.55) return 9;
        if (has('spots') && hash(x, y, z + 40) > 0.86) return 10;
        if (has('chip') && x > 3 && y < -2 && Math.abs(zz - 0.2) < 0.15) return 0;
        if (has('glow') && hash(x, y, z + 9) > 0.8) return 11;
        return hash(x, y, z) > 0.92 ? 6 : 5;
      }
    }
    return 0;
  };
  const vox = [];
  for (let z = 0; z < NZ; z++) for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
    const m = mat(x, y, z); if (!m) continue;
    let exposed = false, n = [0, 0, 0];
    for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy && !dz) continue;
      if (!mat(x + dx, y + dy, z + dz)) { n[0] += dx; n[1] += dy; n[2] += dz; if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) === 1) exposed = true; }
    }
    if (!exposed) continue;
    if (!n[0] && !n[1] && !n[2]) n = [0, 0, 1];
    n = norm3(n);
    const eggC = rock ? [150, 146, 140] : th.egg;
    const base = m === 4 ? ((((x >> 1) + (y >> 1) + z) & 1) ? th.fabric : scl(th.fabric, 0.82)) : m === 6 ? scl(eggC, 0.6) : eggC;
    vox.push({ x, y, z, nx: n[0], ny: n[1], nz: n[2], m, base });
  }
  EGG_CACHE.set(key, vox);
  return vox;
}
const ZB = new Float32Array(N);
const EGG_SIGN = { 7: 'crack', 8: 'frost', 9: 'moss', 10: 'spots', 11: 'glow' };
function renderEgg(fb, o, amb) {
  const { p, t, th, lampX, lampY, found } = o, S = 1.8, CX = OX, CY = TOP + 1;
  PB.fill(-1); ZB.fill(-1e9);
  if (o.mode === 'xray') {
    const A = AILMENTS[p.ail];
    for (let y = 0; y < TOP; y++) for (let x = 0; x < EW; x++) {
      const nx = (x + 0.5 - OX) / 12.5, ny = (y + 0.5 - (TOP - 27)) / 18; const d = nx * nx + ny * ny;
      if (d < 1) { PB[y * EW + x] = 0; fb.set(x, y, A.xray === 'solid' ? [226, 236, 250] : d > 0.82 ? [170, 210, 255] : mix([28, 56, 108], [90, 140, 210], 1 - d)); if (A.xray === 'solid') mark(XB, x, y, 1); }
    }
    if (A.xray !== 'solid') {
      const big = A.xray === 'big' ? 1.6 : 1, beat = (t % 1) < 0.12 && p.R.hr > 50, c = beat ? WHITE : [200, 225, 255];
      for (let a = 0; a < 70; a++) { const r = (6 - a / 30) * big, x = OX + Math.cos(a / 7) * r, y = TOP - 26 + Math.sin(a / 7) * r * 1.1; fb.set(Math.round(x), Math.round(y), c); mark(XB, x, y, 1, 1); }
      for (let a = 0; a < 20; a++) fb.set(Math.round(OX + 3 * big + Math.cos(a / 3) * 2.4 * big), Math.round(TOP - 26 - 7 * big + Math.sin(a / 3) * 2.4 * big), c);
    }
    return;
  }
  if (o.mode === 'candle') return drawCandle(fb, o);
  const vox = buildEgg(p, th), a = o.spin || 0, ca = Math.cos(a), sa = Math.sin(a);
  const L = norm3([(lampX - OX) / 30, 0.6, clamp((TOP - lampY) / 40, 0.2, 1.2)]), LR = norm3([0.5, -0.8, 0.35]);
  const lightK = clamp(1.4 / (1 + ((lampX - OX) ** 2 + (lampY - (TOP - 25)) ** 2) / 4000), 0.35, 1) * (o.dim ? 0.6 : 1);
  const signIdx = {}; signsOf(p).forEach((s, i) => { signIdx[s.kind] = i; });
  const SC = { 7: [30, 20, 26], 8: [226, 240, 255], 9: [96, 150, 70], 10: [96, 70, 50], 11: [255, 220, 140] };
  const jit = o.stress > 70 ? Math.sin(t * 40) * 0.6 : 0;
  for (const v of vox) {
    const rx = v.x * ca - v.y * sa, ry = v.x * sa + v.y * ca, nrx = v.nx * ca - v.ny * sa, nry = v.nx * sa + v.ny * ca;
    if (nry * 0.866 + v.nz * 0.5 < -0.3) continue;
    const sx = CX + rx * S + jit, sy = CY + (ry * 0.5 - v.z * 0.866) * S, dep = ry * 0.866 + v.z * 0.5;
    const n = [nrx, nry, v.nz], dif = Math.max(0, dot(n, L)), rim = Math.max(0, dot(n, LR));
    const lv = amb + (1 - amb) * dif * lightK, x0 = Math.floor(sx), y0 = Math.floor(sy);
    for (let oy = 0; oy < 2; oy++) for (let ox = 0; ox < 2; ox++) {
      const px = x0 + ox, py = y0 + oy; if (px < 0 || py < 0 || px >= EW || py >= TOP + 3) continue;
      const i = py * EW + px; if (dep <= ZB[i]) continue; ZB[i] = dep; PB[i] = v.m >= 5 ? 1 : 0;
      let c = tone(v.base, th, quant(lv, 5, px, py));
      SB[i] = -1;
      if (v.m >= 7) {
        const vis = v.m === 11 ? 1 : lampVis(lampX, lampY, px, py, o.dim);
        if (vis > 0.3) { c = mix(c, SC[v.m], clamp((vis - 0.3) / 0.4) * (v.m === 7 ? 1 : 0.8)); const k = EGG_SIGN[v.m]; if (signIdx[k] != null) SB[i] = signIdx[k]; }
      }
      if (rim > 0.55 && v.m < 7) c = mix(c, th.rim, 0.35);
      fb.set(px, py, c);
    }
  }
  const oc = mix(th.amb, BLACK, 0.6);
  for (let y = 1; y < TOP + 3; y++) for (let x = 1; x < EW - 1; x++) {
    const i = y * EW + x; if (ZB[i] > -1e8) continue;
    if (ZB[i - 1] > -1e8 || ZB[i + 1] > -1e8 || ZB[i - EW] > -1e8 || (y < TOP + 2 && ZB[i + EW] > -1e8)) fb.set(x, y, oc);
  }
  if (found && found.size) { const a2 = th.accent; let k = 0; for (const f of found) { for (let i = -2; i <= 2; i++) fb.set(OX - 12 + k * 6 + i, TOP - 52, a2); k++; } }
}

/* ---------- particles and overlays ---------- */
function drawParticles(fb, o) {
  for (const q of o.particles || []) {
    const c = q.kind === 'spark' ? (q.life > 0.15 ? WHITE : mix(o.th.key, WHITE, 0.5)) : q.kind === 'note' ? o.th.accent : [150, 200, 255];
    fb.set(q.x, q.y, c); if (q.kind === 'spark') { fb.set(q.x + 1, q.y, c); fb.set(q.x, q.y - 1, c); }
  }
  if (o.mode === 'volt' && o.p.sp === 'cat') {
    for (const [z, [zx, zy]] of Object.entries(ZONES_POS.cat)) {
      const x = OX + zx, y = TOP + zy, v = o.voltRead && o.voltRead[z];
      const rc = v == null ? (Math.floor(o.t * 3) & 1 ? [255, 255, 255] : o.th.accent) : v > 40 || v < 0 ? [255, 90, 80] : [120, 240, 150];
      for (let a = 0; a < 16; a++) { const ax = Math.round(x + Math.cos(a / 2.55) * 4), ay = Math.round(y + Math.sin(a / 2.55) * 4); fb.set(ax + 1, ay + 1, [20, 14, 28]); fb.set(ax, ay, rc); }
      fb.set(x, y, rc);
      if (v != null) { const s = `${v}V`; for (let yy = y - 11; yy < y - 4; yy++) for (let xx = x - 1; xx < x + s.length * 4; xx++) fb.blend(xx, yy, [0, 0, 0], 0.6); text(fb, s, x, y - 10, WHITE); }
    }
  }
}

/* ---------- entry point ---------- */
// o: { p, t, th, lampX, lampY, mode, dim, found:Set(kinds), flipped:Set, spin, room, jig, particles, stress, voltRead, happy }
export function renderExam(fb, o) {
  const amb = o.mode === 'candle' || o.mode === 'backlight' ? 0.05 : o.dim ? o.th.ambLevel * 0.45 : o.th.ambLevel;
  drawRoom(fb, o, amb);
  SB.fill(-1); XB.fill(-1);
  let parts = null;
  if (o.mode === 'backlight') {
    // a bright light behind the patient
    for (let y = 0; y < TOP; y++) for (let x = 0; x < EW; x++) { const r = Math.hypot(x - OX, (y - (TOP - 18)) * 1.3) / 40; if (r < 1) fb.add(x, y, scl([255, 240, 200], (1 - r) * (1 - r) * 0.9)); }
  }
  if (o.p.sp === 'pebble') renderEgg(fb, o, amb);
  else {
    parts = renderBlob(fb, o, amb);
    if (o.mode === 'unpot') drawRoots(fb, o);
    if (o.mode === 'xray' || o.mode === 'backlight') drawInside(fb, o, parts);
    else { drawDetails(fb, o, parts); drawSigns(fb, o, parts); }
  }
  if (o.p.sp === 'pebble' && !o.mode) drawSigns(fb, o, parts || []);
  drawParticles(fb, o);
  if (!o.mode && !o.noLamp) drawLamp(fb, o);
  else if ((o.mode === 'flip' || o.mode === 'volt' || o.mode === 'unpot') && !o.noLamp) drawLamp(fb, o);
  return parts;
}
// Which sign (if any) is near a tap: returns the sign kind or null.
export function signAt(p, x, y, r = 3) {
  const list = signsOf(p);
  for (let d = 0; d <= r; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
    const xx = Math.round(x) + dx, yy = Math.round(y) + dy;
    if (xx < 0 || yy < 0 || xx >= EW || yy >= EH) continue;
    const s = SB[yy * EW + xx]; if (s >= 0 && list[s]) return list[s].kind;
  }
  return null;
}
export function findingAt(x, y, r = 3) {
  for (let d = 0; d <= r; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
    const xx = Math.round(x) + dx, yy = Math.round(y) + dy;
    if (xx >= 0 && yy >= 0 && xx < EW && yy < EH && XB[yy * EW + xx] >= 0) return true;
  }
  return false;
}
export function hasFindings() { for (let i = 0; i < N; i++) if (XB[i] >= 0) return true; return false; }
export function bodyAt(x, y) { x = Math.round(x); y = Math.round(y); return x >= 0 && y >= 0 && x < EW && y < EH && PB[y * EW + x] >= 0; }
export function partAt(parts, x, y) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= EW || y >= EH) return null; const i = PB[y * EW + x]; return i >= 0 && parts ? parts[i] : null; }
// Random points on the patient's body, for mini-games.
export function bodyPoints(n, seed = 1) {
  const pts = []; let k = 0;
  while (pts.length < n && k < 20000) { k++; const x = Math.floor(hash(k, seed, 1) * EW), y = Math.floor(hash(k, seed, 2) * TOP); if (PB[y * EW + x] >= 0) pts.push([x, y]); }
  return pts;
}
