// Exam room renderer (style A: lamp-lit sprites, plus style B stacked slices for eggs).
// Patients are built from shaded parts, relit every frame from the exam lamp, then snapped
// to a few shades per color. Signs of illness only show where the lamp is close.
import { clamp, mix, scl, norm3, dot, quant, hash, tone, WHITE, BLACK, bay, line } from './util.js';

export const EW = 160, EH = 100, TOP = 82, OX = 80;
const N = EW * EH;
export const PB = new Int16Array(N);   // which body part covers each pixel (-1 = none)
export const SB = new Int8Array(N);    // which sign is drawn at each pixel (-1 = none)
const NXb = new Float32Array(N), NYb = new Float32Array(N), NZb = new Float32Array(N), LXb = new Float32Array(N), LYb = new Float32Array(N);

const C = {
  leaf: [92, 168, 86], leafLight: [124, 198, 106], stem: [70, 140, 70], pot: [196, 104, 72], potRim: [218, 132, 96],
  soil: [78, 54, 38], wetSoil: [42, 34, 36], fur: [158, 124, 92], furLight: [236, 226, 204], pink: [232, 132, 150],
  dark: [22, 16, 28], pale: [224, 212, 110],
};

/* ---------- the patients, as lists of shaded parts (drawn back to front) ---------- */
function partsFor(sp, t, ail, lampX) {
  if (sp === 'gloop') {
    const s = Math.sin(t * 2.4), rx = 24 * (1 + 0.06 * s), ry = 17 * (1 - 0.06 * s);
    const parts = [{ x: 0, y: -ry + 1, rx, ry, h: 0.9, mat: 'slime', wob: true }];
    if (ail === 'split') parts.push({ x: 22 + Math.sin(t * 7) * 0.8, y: -5, rx: 5.5, ry: 4.5, h: 0.9, mat: 'slime' });
    return parts;
  }
  if (sp === 'cat') {
    const sw = Math.sin(t * 1.7) * (ail === 'grounded' ? 0.4 : 2), slump = ail === 'grounded' ? 3 : 0;
    const tail = [[16, -4], [20, -10], [22 + sw * 0.5, -17], [21 + sw, -24]].map(([x, y]) => ({ x, y, rx: 3.6, ry: 3.6, h: 1, mat: 'cat' }));
    return [...tail,
      { x: -8, y: -45 + slump, rx: 4, ry: 6, h: 0.6, mat: 'cat' }, { x: 8, y: -45 + slump, rx: 4, ry: 6, h: 0.6, mat: 'cat' },
      { x: 0, y: -14, rx: 15, ry: 14, h: 0.9, mat: 'cat' },
      { x: -6, y: -3, rx: 5, ry: 3.5, h: 1, mat: 'catLight' }, { x: 6, y: -3, rx: 5, ry: 3.5, h: 1, mat: 'catLight' },
      { x: 0, y: -34 + slump, rx: 12, ry: 11, h: 1, mat: 'cat' },
      { x: 0, y: -29 + slump, rx: 5.5, ry: 4, h: 0.6, mat: 'catLight' }];
  }
  if (sp === 'fern') {
    const s = Math.sin(t * 1.3) * 1.5, droop = ail === 'rot' ? 4 : 0;
    return [
      { x: -10 + s, y: -31 + droop, rx: 9, ry: 4, h: 0.5, mat: 'leaf' }, { x: 10 + s, y: -36 + droop, rx: 9, ry: 4, h: 0.5, mat: 'leaf' },
      { x: -7 + s * 1.3, y: -45 + droop, rx: 7, ry: 3.5, h: 0.5, mat: 'leaf' }, { x: 8 + s * 1.3, y: -49 + droop, rx: 6, ry: 3, h: 0.5, mat: 'leaf' },
      { x: s * 1.5, y: -55 + droop, rx: 4, ry: 6, h: 0.5, mat: 'leaf' },
      { x: 0, y: -26, rx: 3, ry: 10, h: 0.8, mat: 'stem' },
      { x: 0, y: -8, rx: 13, ry: 10, h: 0.9, mat: 'pot', clipTop: -15 },
      { x: 0, y: -15, rx: 14, ry: 3, h: 0.5, mat: 'potRim' }, { x: 0, y: -15.5, rx: 11, ry: 1.8, h: 0.3, mat: 'soil' },
      { x: s * 0.6, y: -38 + droop * 0.5, rx: 6.5, ry: 6, h: 1, mat: 'leafLight' }];
  }
  if (sp === 'moth') {
    const f = Math.sin(t * 9) * 0.18 + 0.85;
    const hx = ail === 'lampstruck' ? clamp((lampX - OX) / 10, -4, 4) : clamp((lampX - OX) / 30, -1, 1);
    return [
      { x: -15, y: -32, rx: 14, ry: 11 * f, h: 0.3, mat: 'wing' }, { x: 15, y: -32, rx: 14, ry: 11 * f, h: 0.3, mat: 'wing' },
      { x: -9, y: -3, rx: 3.5, ry: 4.5, h: 0.8, mat: 'fur' }, { x: 9, y: -3, rx: 3.5, ry: 4.5, h: 0.8, mat: 'fur' },
      { x: 0, y: -14, rx: 16, ry: 11, h: 0.9, mat: 'fur' },
      { x: 0, y: -22, rx: 13, ry: 6, h: 0.7, mat: 'furLight' },
      { x: hx, y: -29, rx: 10, ry: 9, h: 1, mat: 'fur', head: true }];
  }
  return [];
}

function matColor(mat, th, lx, ly, ail, x, y) {
  switch (mat) {
    case 'slime': return th.slime;
    case 'cat': { let c = th.cat; if (Math.sin(y * 1.15 + x * 0.25) > 0.62) c = scl(c, 0.7); return c; }
    case 'catLight': return mix(th.cat, WHITE, 0.45);
    case 'leaf': return ail === 'pale' ? mix(C.leaf, C.pale, Math.abs(lx) > 0.45 ? 0.75 : 0.3) : C.leaf;
    case 'leafLight': return ail === 'pale' ? mix(C.leafLight, C.pale, 0.35) : C.leafLight;
    case 'stem': return C.stem;
    case 'pot': return C.pot;
    case 'potRim': return C.potRim;
    case 'soil': return ail === 'rot' ? C.wetSoil : C.soil;
    case 'fur': return C.fur;
    case 'furLight': return C.furLight;
    case 'wing': {
      const r = Math.hypot(lx * 1.2, ly + 0.1);
      if (r < 0.22) return [74, 52, 62];
      if (r < 0.36) return [244, 216, 150];
      return mix(th.paper, [206, 196, 166], 0.5);
    }
    default: return [150, 150, 150];
  }
}
const GLOSSY = { slime: 1, pot: 1, potRim: 1, leafLight: 0.5 };

/* ---------- the room ---------- */
function drawRoom(fb, th, lampX, lampY, xray) {
  const amb = th.ambLevel;
  if (xray) {
    for (let y = 0; y < EH; y++) for (let x = 0; x < EW; x++) {
      let c = [10, 18, 40];
      if (x % 16 === 0 || y % 16 === 0) c = [16, 28, 58];
      fb.set(x, y, c);
    }
    return;
  }
  for (let y = 0; y < EH; y++) for (let x = 0; x < EW; x++) {
    let c, lv;
    if (y < TOP) {
      const grout = x % 10 === 0 || y % 8 === 0;
      let base = grout ? scl(th.wall, 0.72) : scl(th.wall, 0.94 + hash(x / 10 | 0, y / 8 | 0, 3) * 0.12);
      base = scl(base, 1 - clamp((y - 30) / 45) * 0.25 * (0.6 + hash(x >> 1, y >> 1, 9) * 0.4));
      // a weight chart and a cabinet on the wall
      if (x >= 8 && x < 26 && y >= 12 && y < 36) {
        base = (x === 8 || x === 25 || y === 12 || y === 35) ? scl(th.paper, 0.72) : th.paper;
        if (y > 16 && y < 33 && y % 3 === 0 && x > 10 && x < 23) base = scl(th.paper, 0.75);
        const gy = Math.round(30 - (x - 11) * 0.9 - Math.sin(x) * 1.5);
        if (x > 10 && x < 23 && y === gy) base = th.fabric;
      }
      if (x >= 128 && x < 152 && y >= 16 && y < 46) {
        base = scl(th.steel, 0.9);
        if (x === 128 || x === 151 || y === 16 || y === 45 || x === 140) base = scl(th.steel, 0.6);
        if ((x === 137 || x === 143) && y > 28 && y < 34) base = scl(th.steel, 1.2);
      }
      const dx = x - lampX, dy = y - lampY;
      lv = amb + (1 - amb) * 0.95 / (1 + (dx * dx + dy * dy * 1.6) / 1100);
      c = tone(base, th, quant(lv, 5, x, y));
    } else if (y <= TOP + 3) {
      const dx = x - lampX;
      lv = amb + (1 - amb) * (0.35 + 0.6 / (1 + dx * dx / 1400));
      c = tone(th.steel, th, quant(lv, 5, x, y));
      if (y === TOP && Math.abs(dx) < 5) c = mix(th.key, WHITE, 0.5);
    } else if (y <= TOP + 11) {
      lv = (amb + (1 - amb) * (0.15 + 0.3 / (1 + ((x - lampX) ** 2) / 2500))) * (1 - (y - TOP - 4) * 0.04);
      const base = (y === TOP + 7 && x > 70 && x < 90) ? scl(th.steel, 1.3) : th.steel;
      c = tone(base, th, quant(lv, 5, x, y));
      if (y === TOP + 4) c = scl(c, 0.7);
    } else {
      const leg = (x >= 30 && x < 34) || (x >= 126 && x < 130);
      lv = amb * (leg ? 1.5 : 1.1) + (1 - amb) * 0.1;
      c = tone(leg ? scl(th.steel, 0.8) : th.floor, th, quant(lv, 4, x, y));
    }
    fb.set(x, y, c);
  }
}
function drawLamp(fb, th, lampX, lampY) {
  const lx = Math.round(lampX), ly = Math.round(lampY);
  for (let y = 0; y < ly - 5; y++) fb.set(lx, y, tone(th.steel, th, 0.3));
  for (let dy = 0; dy < 5; dy++) { const hw = 2 + dy; for (let i = -hw; i <= hw; i++) fb.set(lx + i, ly - 5 + dy, tone(th.steel, th, i < 0 ? 0.6 : 0.3)); }
  for (let i = -4; i <= 4; i++) fb.set(lx + i, ly, mix(th.key, WHITE, 0.7));
  for (let y = ly - 14; y < ly + 26; y++) for (let x = lx - 26; x <= lx + 26; x++) {
    const r = Math.hypot(x - lx, (y - ly) * 0.9) / 26; if (r >= 1) continue;
    const k = quant((1 - r) * (1 - r), 4, x & 255, y & 255) * 0.45; if (k > 0) fb.add(x, y, scl(th.key, k));
  }
}
// How well the lamp lights a point (0 = dark, 1 = right under it).
export function lampVis(lampX, lampY, x, y) { return clamp((1 - Math.hypot(x - lampX, (y - lampY) * 0.8) / 34) * 1.5); }

/* ---------- blob patients ---------- */
function renderBlob(fb, o) {
  const { sp, ail, t, th, lampX, lampY, xray } = o, amb = th.ambLevel;
  const parts = partsFor(sp, t, ail, lampX);
  PB.fill(-1);
  parts.forEach((p, pi) => {
    const cx = OX + p.x, cy = TOP + p.y;
    for (let y = Math.floor(cy - p.ry - 1); y <= Math.ceil(cy + p.ry + 1); y++) {
      if (y < 0 || y >= TOP) continue;
      if (p.clipTop != null && y < TOP + p.clipTop) continue;
      for (let x = Math.floor(cx - p.rx - 1); x <= Math.ceil(cx + p.rx + 1); x++) {
        if (x < 0 || x >= EW) continue;
        let nx = (x + 0.5 - cx) / p.rx, ny = (y + 0.5 - cy) / p.ry;
        if (p.wob) { const ang = Math.atan2(ny, nx), w = 1 + 0.035 * Math.sin(ang * 4 + t * 3) + 0.02 * Math.sin(ang * 7 - t * 5); nx /= w; ny /= w; }
        const d = nx * nx + ny * ny; if (d >= 1) continue;
        const i = y * EW + x, nz = Math.sqrt(1 - d), n = norm3([nx * p.h, ny * p.h, nz]);
        PB[i] = pi; NXb[i] = n[0]; NYb[i] = n[1]; NZb[i] = n[2]; LXb[i] = nx; LYb[i] = ny;
      }
    }
  });
  const away = Math.sign(lampX - OX) || 1;
  for (let y = 0; y < TOP; y++) for (let x = 0; x < EW; x++) {
    const i = y * EW + x, pi = PB[i]; if (pi < 0) continue;
    const p = parts[pi], n = [NXb[i], NYb[i], NZb[i]];
    const edge = (x === 0 || PB[i - 1] < 0) || (x === EW - 1 || PB[i + 1] < 0) || (y === 0 || PB[i - EW] < 0) || (PB[i + EW] < 0 && y + 1 < TOP);
    const over = !edge && ((PB[i - 1] >= 0 && PB[i - 1] < pi) || (PB[i + 1] >= 0 && PB[i + 1] < pi) || (PB[i - EW] >= 0 && PB[i - EW] < pi) || (PB[i + EW] >= 0 && PB[i + EW] < pi));
    if (xray) {
      let c = mix([28, 56, 108], [120, 168, 228], quant(0.25 + (1 - n[2]) * 0.6, 4, x, y));
      if (edge) c = [170, 210, 255];
      fb.set(x, y, c);
      continue;
    }
    const L = norm3([lampX - x, lampY - y, 26]);
    const dif = Math.max(0, dot(n, L)), fall = clamp(1.5 / (1 + ((x - lampX) ** 2 + (y - lampY) ** 2) / 5000));
    let lv = amb + (1 - amb) * (0.18 + 0.82 * dif) * fall;
    if (y > TOP - 3) lv *= 0.82;
    const base = matColor(p.mat, th, LXb[i], LYb[i], ail, x, y);
    let c = tone(base, th, quant(lv, 5, x, y));
    if (-NXb[i] * away > 0.55 && NZb[i] < 0.6 && NYb[i] < 0.4) c = mix(c, th.rim, 0.4);
    const g = GLOSSY[p.mat];
    if (g) {
      const H = norm3([L[0], L[1], L[2] + 1]), s = Math.pow(Math.max(0, dot(n, H)), 36) * g;
      if (s > 0.5) c = mix(th.key, WHITE, 0.65); else if (s > 0.22) c = mix(c, th.key, 0.45);
    }
    if (edge) c = scl(tone(base, th, quant(lv * 0.6, 5, x, y)), 0.55);
    else if (over) c = scl(c, 0.78);
    fb.set(x, y, c);
  }
  if (!xray) drawDetails(fb, o, parts);
  else drawXrayInside(fb, o, parts);
  return parts;
}

function eye(fb, ex, ey, c, blink, look, big) {
  if (blink) { for (let i = -2; i <= 2; i++) fb.set(ex + i, ey, c); return; }
  const rows = big ? [[-2, 1], [-1, 2], [0, 2], [1, 2], [2, 1]] : [[-1, 1], [0, 1], [1, 1]];
  for (const [dy, hw] of rows) for (let i = -hw; i <= hw; i++) fb.set(ex + i, ey + dy, c);
  fb.set(ex - 1 + look, ey - 1, WHITE);
}
function drawDetails(fb, o, parts) {
  const { sp, ail, t, th, lampX } = o;
  const blink = (t % 3.7) < 0.13, eyeC = mix(th.amb, BLACK, 0.7);
  if (sp === 'gloop') {
    const b = parts[0], cx = OX + b.x, cy = TOP + b.y, look = clamp(Math.round((lampX - cx) / 25), -1, 1);
    eye(fb, Math.round(cx - 8 + look), Math.round(cy - 3), eyeC, blink, look, true);
    eye(fb, Math.round(cx + 8 + look), Math.round(cy - 3), eyeC, blink, look, true);
    const mx = Math.round(cx), my = Math.round(cy + 3);
    if (ail === 'reflux') { for (let i = -3; i <= 3; i++) fb.set(mx + i, my + (i & 1), eyeC); }
    else if (ail === 'split') { fb.set(mx - 1, my + 1, eyeC); fb.set(mx, my, eyeC); fb.set(mx + 1, my + 1, eyeC); }
    else { fb.set(mx - 1, my, eyeC); fb.set(mx, my + 1, eyeC); fb.set(mx + 1, my, eyeC); }
  } else if (sp === 'cat') {
    const slump = ail === 'grounded' ? 3 : 0, ey = TOP - 35 + slump;
    const iris = ail === 'overcharge' ? mix(th.rim, WHITE, 0.4) : [228, 186, 76];
    for (const sx of [-5, 5]) {
      const ex = OX + sx;
      if (blink) { for (let i = -2; i <= 2; i++) fb.set(ex + i, ey, eyeC); continue; }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) if (!(Math.abs(dx) === 2 && dy !== 0)) fb.set(ex + dx, ey + dy, iris);
      fb.set(ex, ey - 1, eyeC); fb.set(ex, ey, eyeC); fb.set(ex, ey + 1, eyeC);
      if (ail === 'grounded') for (let dx = -2; dx <= 2; dx++) fb.set(ex + dx, ey - 1, scl(th.cat, 0.6));
    }
    fb.set(OX, TOP - 31 + slump, C.pink); fb.set(OX - 1, TOP - 31 + slump, C.pink);
    fb.set(OX - 2, TOP - 29 + slump, eyeC); fb.set(OX - 1, TOP - 28 + slump, eyeC); fb.set(OX, TOP - 29 + slump, eyeC); fb.set(OX + 1, TOP - 28 + slump, eyeC);
    for (const s of [-1, 1]) { line(fb, OX + s * 5, TOP - 30 + slump, OX + s * 12, TOP - 31 + slump, [214, 214, 220]); line(fb, OX + s * 5, TOP - 29 + slump, OX + s * 12, TOP - 28 + slump, [214, 214, 220]); }
    for (const s of [-1, 1]) { fb.set(OX + s * 8, TOP - 46 + slump, C.pink); fb.set(OX + s * 8, TOP - 45 + slump, C.pink); }
  } else if (sp === 'fern') {
    const b = parts[parts.length - 1], cx = OX + b.x, cy = TOP + b.y;
    const sad = ail === 'rot' || ail === 'pale';
    for (const s of [-1, 1]) { const ex = Math.round(cx + s * 2.5), ey = Math.round(cy - 1); if (blink) { fb.set(ex, ey, eyeC); fb.set(ex + 1, ey, eyeC); } else { fb.set(ex, ey, eyeC); fb.set(ex, ey + 1, eyeC); fb.set(ex + 1, ey + 1, eyeC); fb.set(ex + 1, ey, WHITE); } }
    const my = Math.round(cy + 3), mx = Math.round(cx);
    if (sad) { fb.set(mx - 1, my + 1, eyeC); fb.set(mx, my, eyeC); fb.set(mx + 1, my + 1, eyeC); } else { fb.set(mx - 1, my, eyeC); fb.set(mx, my + 1, eyeC); fb.set(mx + 1, my, eyeC); }
  } else if (sp === 'moth') {
    const h = parts.find((p) => p.head), hx = OX + h.x, hy = TOP + h.y;
    for (const s of [-1, 1]) {
      line(fb, hx + s * 3, hy - 8, hx + s * 9, hy - 18, [90, 70, 60]);
      for (let k = 0; k < 4; k++) fb.set(hx + s * (7 + k * 0.6), hy - 16 + k, [120, 96, 80]);
      const ex = Math.round(hx + s * 4), ey = Math.round(hy - 1);
      for (let dy = -2; dy <= 1; dy++) for (let dx = -2; dx <= 1; dx++) if (!(Math.abs(dx + 0.5) > 1.6 && Math.abs(dy + 0.5) > 1.6)) fb.set(ex + dx, ey + dy, eyeC);
      if (ail === 'lampstruck') { const k = (Math.floor(t * 8) % 3); fb.set(ex - 1 + (k === 1 ? 1 : 0), ey - 1, th.key); fb.set(ex, ey, mix(th.key, WHITE, 0.5)); fb.set(ex - 2 + k, ey + 1, th.key); }
      else if (!blink) { fb.set(ex - 1, ey - 1, WHITE); fb.set(ex, ey - 1, WHITE); }
    }
    fb.set(hx, hy + 3, eyeC); fb.set(hx - 1, hy + 4, eyeC); fb.set(hx + 1, hy + 4, eyeC);
  }
}

/* ---------- X-ray views ---------- */
function drawXrayInside(fb, o, parts) {
  const { sp, ail, t, obj } = o, xk = o.xk, W = [236, 246, 255], D = [40, 70, 120];
  const on = (x, y) => x >= 0 && y >= 0 && x < EW && y < TOP && PB[y * EW + x] >= 0;
  const P = (x, y, c = W) => { if (on(x, y)) fb.set(x, y, c); };
  if (sp === 'gloop') {
    const b = parts[0], cx = OX + b.x + 6, cy = TOP + b.y + 5;
    if (xk === 'object') drawObject(fb, obj || 'sock', cx, cy, W);
    if (xk === 'bubbles') for (let k = 0; k < 14; k++) { const bx = OX - 16 + hash(k, 1) * 32, by = TOP - 30 + ((hash(k, 2) * 26 + t * 4) % 26); for (let a = 0; a < 6; a++) P(Math.round(bx + Math.cos(a) * 1.6), Math.round(by + Math.sin(a) * 1.6)); }
    if (xk === 'plain') for (let a = 0; a < 40; a++) P(Math.round(OX + Math.cos(a) * 6), Math.round(TOP - 16 + Math.sin(a) * 4), [150, 190, 240]);
  }
  if (sp === 'cat' || sp === 'moth') {
    const top = sp === 'cat' ? -34 : -29, slump = ail === 'grounded' ? 3 : 0;
    for (let a = 0; a < 50; a++) P(Math.round(OX + Math.cos(a / 8) * 7), Math.round(TOP + top + slump + Math.sin(a / 8) * 6));
    for (let y = top + 8; y < -4; y++) P(OX + Math.round(Math.sin(y * 0.2)), TOP + y);
    for (let r = 0; r < 4; r++) { const ry = TOP - 22 + r * 4; for (let k = 2; k < 10 - r; k++) { P(OX - k, ry + (k >> 2)); P(OX + k, ry + (k >> 2)); } }
    if (sp === 'cat') for (let k = 0; k < 4; k++) P(OX + 16 + k * 2, TOP - 4 - k * 6);
    if (xk === 'hairball') for (let k = 0; k < 60; k++) { const a = k * 0.7, r = 2 + (k % 5); P(Math.round(OX - 2 + Math.cos(a) * r * 0.9), Math.round(TOP - 12 + Math.sin(a * 1.3) * r * 0.7), [255, 240, 200]); }
    if (xk === 'static') for (let y = 0; y < TOP; y++) for (let x = 0; x < EW; x++) if (on(x, y) && hash(x, y, Math.floor(t * 15)) > 0.45) fb.set(x, y, W);
    if (sp === 'moth') for (const s of [-1, 1]) for (let a = 0; a < 30; a++) {
      const lx = Math.round(OX + s * 6 + Math.cos(a / 4.8) * 4), ly = Math.round(TOP - 15 + Math.sin(a / 4.8) * 3);
      P(lx, ly, [150, 200, 255]);
      if (xk === 'cloudy') for (let k = 0; k < 6; k++) if (hash(a, k, s + 5) > 0.4) P(lx + ((k % 3) - 1) * s, ly + (k > 2 ? 1 : -1), [210, 220, 235]);
    }
  }
  if (sp === 'fern') {
    const rot = xk === 'rootsRot';
    for (let k = 0; k < 7; k++) {
      let x = OX - 6 + k * 2, y = TOP - 15;
      for (let s = 0; s < 14; s++) { x += (hash(k, s, 3) - 0.5) * 2; y += 1; const c = rot && hash(k, s, 8) > 0.45 ? D : W; P(Math.round(x), y, c); }
    }
    if (rot) for (let k = 0; k < 6; k++) { const bx = OX - 8 + hash(k, 4) * 16, by = TOP - 10 + hash(k, 5) * 8; for (let a = 0; a < 9; a++) P(Math.round(bx + (a % 3)), Math.round(by + ((a / 3) | 0)), [20, 36, 70]); }
  }
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
  } else if (obj === 'hairball') {
    for (let k = 0; k < 50; k++) { const a = k * 0.7, r = 1 + (k % 4); fb.set(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a * 1.3) * r * 0.8), k & 1 ? c : c2); }
  }
}

/* ---------- signs you can spot with the lamp ---------- */
function drawSigns(fb, o, parts) {
  const { ail, t, th, lampX, lampY, found, AIL } = o;
  (AIL.signs || []).forEach((s, si) => {
    if (s.kind === 'frost' || s.kind === 'crack' || s.kind === 'moss') return;
    let px = OX + s.x, py = TOP + s.y;
    if (s.kind === 'bud') { const b = parts[1]; if (b) { px = OX + b.x; py = TOP + b.y; } }
    const vis = s.always ? 1 : lampVis(lampX, lampY, px, py);
    if (vis < 0.3) return;
    const mark = (x, y, r = 1) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < EW && yy < EH) SB[yy * EW + xx] = si; } };
    const inBody = (x, y) => x >= 0 && y >= 0 && x < EW && y < TOP && PB[y * EW + x] >= 0;
    const k = clamp((vis - 0.3) / 0.5);
    if (s.kind === 'lump') {
      for (let y = -5; y <= 5; y++) for (let x = -7; x <= 7; x++) if (x * x / 49 + y * y / 25 < 1 && inBody(px + x, py + y)) { fb.blend(px + x, py + y, mix(th.slime, WHITE, 0.4), 0.3 * k); mark(px + x, py + y, 0); }
      drawObjectFaint(fb, o.obj || 'sock', px, py, th, 0.45 * k);
    } else if (s.kind === 'bubbles') {
      for (let b = 0; b < 6; b++) {
        const bx = px + ((b * 7) % 13) - 6, by = py + 6 - ((t * 7 + b * 3.3) % 14);
        for (let a = 0; a < 8; a++) { const x = Math.round(bx + Math.cos(a * 0.8) * 1.5), y = Math.round(by + Math.sin(a * 0.8) * 1.5); if (inBody(x, y)) fb.blend(x, y, WHITE, 0.7 * k); }
        mark(Math.round(bx), Math.round(by), 2);
      }
    } else if (s.kind === 'bud') {
      const pulse = 0.5 + 0.5 * Math.sin(t * 6);
      for (let y = -6; y <= 6; y++) for (let x = -7; x <= 7; x++) if (inBody(px + x, py + y) && x * x + y * y < 40) { if (x * x + y * y > 18) fb.blend(px + x, py + y, th.rim, 0.5 * k * pulse); mark(px + x, py + y, 0); }
    } else if (s.kind === 'sparks') {
      const f = Math.floor(t * 12);
      for (let b = 0; b < 3; b++) {
        let x = px - 9, y = py + (b - 1) * 2;
        for (let j = 0; j < 6; j++) { const nx = x + 3, ny = py + (hash(f, b, j) - 0.5) * 6; line(fb, x, y, nx, ny, j & 1 ? WHITE : mix(th.key, WHITE, 0.5)); mark(Math.round(nx), Math.round(ny), 2); x = nx; y = ny; }
      }
    } else if (s.kind === 'fluff') {
      for (let y = -1; y <= 1; y++) for (let x = -2; x <= 2; x++) if (hash(x, y, 7) > 0.25) { fb.blend(px + x, py + y, [196, 196, 206], 0.9 * k); mark(px + x, py + y, 1); }
    } else if (s.kind === 'dull') {
      for (let y = -9; y <= 9; y++) for (let x = -11; x <= 11; x++) if (inBody(px + x, py + y) && x * x / 121 + y * y / 81 < 1) { if (hash(px + x, py + y, 4) > 0.6) fb.blend(px + x, py + y, [130, 130, 136], 0.55 * k); mark(px + x, py + y, 0); }
    } else if (s.kind === 'soggy') {
      for (let y = -4; y <= 3; y++) for (let x = -10; x <= 10; x++) if (inBody(px + x, py + y)) { fb.blend(px + x, py + y, [40, 52, 86], 0.45 * k); mark(px + x, py + y, 0); }
      for (let d = 0; d < 3; d++) { const dx = px - 6 + d * 6, dy = py + 2 + ((t * 10 + d * 4) % 7); fb.blend(dx, Math.round(dy), [120, 170, 240], k); fb.blend(dx, Math.round(dy) + 1, [80, 130, 220], k); mark(dx, Math.round(dy), 1); }
    } else if (s.kind === 'mites') {
      if (vis < 0.6) return;
      for (let m = 0; m < 7; m++) {
        const a = t * (1.5 + m * 0.3) + m * 2, x = Math.round(px + Math.cos(a) * (3 + m % 3) + (m - 3) * 1.5), y = Math.round(py + Math.sin(a * 1.3) * 2);
        if (inBody(x, y)) { fb.set(x, y, [36, 24, 24]); if (m & 1) fb.set(x + 1, y, [80, 40, 30]); mark(x, y, 2); }
      }
    } else if (s.kind === 'pale') {
      for (let y = -5; y <= 5; y++) for (let x = -10; x <= 10; x++) if (inBody(px + x, py + y)) { if (Math.abs(x) > 5) fb.blend(px + x, py + y, [240, 226, 120], 0.35 * k); mark(px + x, py + y, 0); }
    } else if (s.kind === 'dust') {
      for (let d = 0; d < 7; d++) { const ph = (t * 0.8 + d / 7) % 1, x = Math.round(px - 3 - ph * 14 + Math.sin(d) * 3), y = Math.round(py - 2 - ph * 8 + Math.cos(d * 2) * 2); fb.blend(x, y, [210, 204, 190], (1 - ph) * k); fb.blend(x + 1, y, [190, 184, 170], (1 - ph) * 0.6 * k); mark(x, y, 2); }
    } else if (s.kind === 'glazed') {
      for (let y = -4; y <= 3; y++) for (let x = -9; x <= 9; x++) { const xx = px + x + Math.round(clamp((lampX - OX) / 10, -4, 4)), yy = py + y; if (xx >= 0 && xx < EW && yy >= 0 && yy < EH) SB[yy * EW + xx] = si; }
    }
    if (found && found.has(si)) {
      const r = 6, a = th.accent;
      for (const [cx, cy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) { fb.set(px + cx, py + cy, a); fb.set(px + cx + Math.sign(-cx), py + cy, a); fb.set(px + cx, py + cy + Math.sign(-cy), a); }
    }
  });
}
function drawObjectFaint(fb, obj, x, y, th, a) {
  const tmp = { set: (xx, yy, c) => { xx = Math.floor(xx); yy = Math.floor(yy); if (xx >= 0 && yy >= 0 && xx < EW && yy < TOP && PB[yy * EW + xx] >= 0) fb.blend(xx, yy, c, a); } };
  drawObject(tmp, obj, x, y, th.fabric, th.paper);
}

/* ---------- eggs: stacked voxel slices you can turn ---------- */
const EGG_CACHE = new Map();
function buildEgg(ail, th) {
  const key = ail + th.id; if (EGG_CACHE.has(key)) return EGG_CACHE.get(key);
  const R = 13, NZ = 30, rock = ail === 'rock';
  const mat = (x, y, z) => {
    if (z < 0) return 0;
    const r = Math.hypot(x, y);
    if (z <= 5 && r < 12) { const rr = r / 12, top = 5 * Math.sqrt(Math.max(0, 1 - rr ** 4)); if (z <= top) return 4; }
    const zz = (z - 15.5) / 10.5;
    if (Math.abs(zz) < 1) {
      const rxy = (rock ? 7.4 : 6.8) * (1 - (rock ? 0.05 : 0.16) * zz) * (rock ? 1 + 0.08 * Math.sin(Math.atan2(y, x) * 3 + z * 0.4) : 1);
      if ((x * x + y * y) / (rxy * rxy) + zz * zz < 1) {
        if (ail === 'cracked' && y > 2 && Math.abs(z - (18 + 1.8 * Math.sin(x * 1.1 + 1))) < 0.7) return 7;
        if (ail === 'cold' && zz > 0.55 && hash(x, y, z) > 0.35) return 8;
        if (rock && zz < -0.25 && hash(x, y, z) > 0.55) return 9;
        return hash(x, y, z) > 0.88 ? 6 : 5;
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
function renderEgg(fb, o) {
  const { ail, t, th, lampX, lampY, xray, found } = o, amb = th.ambLevel, S = 1.8, CX = OX, CY = TOP + 1;
  PB.fill(-1); ZB.fill(-1e9);
  if (xray) {
    for (let y = 0; y < TOP; y++) for (let x = 0; x < EW; x++) {
      const nx = (x + 0.5 - OX) / 12.5, ny = (y + 0.5 - (TOP - 27)) / 18; const d = nx * nx + ny * ny;
      if (d < 1) { PB[y * EW + x] = 0; fb.set(x, y, ail === 'rock' ? [226, 236, 250] : d > 0.82 ? [170, 210, 255] : mix([28, 56, 108], [90, 140, 210], 1 - d)); }
    }
    if (ail !== 'rock') {
      const beat = (t % 1) < 0.12 ? 1 : 0, c = beat && ail !== 'cold' ? WHITE : [200, 225, 255];
      for (let a = 0; a < 70; a++) { const r = 6 - a / 30; fb.set(Math.round(OX + Math.cos(a / 7) * r), Math.round(TOP - 26 + Math.sin(a / 7) * r * 1.1), c); }
      for (let a = 0; a < 20; a++) fb.set(Math.round(OX + 3 + Math.cos(a / 3) * 2.4), Math.round(TOP - 33 + Math.sin(a / 3) * 2.4), c);
      if (ail === 'cracked') line(fb, OX - 6, TOP - 33, OX + 4, TOP - 30, [10, 18, 40]);
    }
    return;
  }
  const vox = buildEgg(ail, th), a = o.spin || 0, ca = Math.cos(a), sa = Math.sin(a);
  const L = norm3([(lampX - OX) / 30, 0.6, clamp((TOP - lampY) / 40, 0.2, 1.2)]), LR = norm3([0.5, -0.8, 0.35]);
  const lightK = clamp(1.4 / (1 + ((lampX - OX) ** 2 + (lampY - (TOP - 25)) ** 2) / 4000), 0.35, 1);
  const crackC = [30, 20, 26], frostC = [226, 240, 255], mossC = [96, 150, 70];
  for (const v of vox) {
    const rx = v.x * ca - v.y * sa, ry = v.x * sa + v.y * ca, nrx = v.nx * ca - v.ny * sa, nry = v.nx * sa + v.ny * ca;
    if (nry * 0.866 + v.nz * 0.5 < -0.3) continue;
    const sx = CX + rx * S, sy = CY + (ry * 0.5 - v.z * 0.866) * S, dep = ry * 0.866 + v.z * 0.5;
    const n = [nrx, nry, v.nz], dif = Math.max(0, dot(n, L)), rim = Math.max(0, dot(n, LR));
    const lv = amb + (1 - amb) * dif * lightK, x0 = Math.floor(sx), y0 = Math.floor(sy);
    for (let oy = 0; oy < 2; oy++) for (let ox = 0; ox < 2; ox++) {
      const px = x0 + ox, py = y0 + oy; if (px < 0 || py < 0 || px >= EW || py >= TOP + 3) continue;
      const i = py * EW + px; if (dep <= ZB[i]) continue; ZB[i] = dep; PB[i] = v.m >= 5 ? 1 : 0;
      let c = tone(v.base, th, quant(lv, 5, px, py));
      if (v.m >= 7) {
        const vis = lampVis(lampX, lampY, px, py);
        SB[i] = -1;
        if (vis > 0.3) {
          const sc = v.m === 7 ? crackC : v.m === 8 ? frostC : mossC;
          c = mix(c, sc, clamp((vis - 0.3) / 0.4) * (v.m === 7 ? 1 : 0.8));
          SB[i] = 0;
        }
      } else SB[i] = -1;
      if (rim > 0.55 && v.m < 7) c = mix(c, th.rim, 0.35);
      fb.set(px, py, c);
    }
  }
  const oc = mix(th.amb, BLACK, 0.6);
  for (let y = 1; y < TOP + 3; y++) for (let x = 1; x < EW - 1; x++) {
    const i = y * EW + x; if (ZB[i] > -1e8) continue;
    if (ZB[i - 1] > -1e8 || ZB[i + 1] > -1e8 || ZB[i - EW] > -1e8 || (y < TOP + 2 && ZB[i + EW] > -1e8)) fb.set(x, y, oc);
  }
  if (found && found.has(0)) {
    // mark where the sign was found with a small bracket at the top of the egg
    const a2 = th.accent; for (let i = -3; i <= 3; i++) fb.set(OX + i, TOP - 52, a2);
  }
}

/* ---------- entry point ---------- */
// o: { sp, ail, AIL, t, th, lampX, lampY, xray, found:Set, spin, obj, xk }
export function renderExam(fb, o) {
  drawRoom(fb, o.th, o.lampX, o.lampY, o.xray);
  SB.fill(-1);
  let parts = null;
  if (o.sp === 'pebble') renderEgg(fb, o);
  else { parts = renderBlob(fb, o); if (!o.xray) drawSigns(fb, o, parts); }
  if (!o.xray && !o.noLamp) drawLamp(fb, o.th, o.lampX, o.lampY);
  return parts;
}
// Which sign (if any) is near a tap. Returns the sign index or -1.
export function signAt(x, y, r = 3) {
  for (let d = 0; d <= r; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
    const xx = Math.round(x) + dx, yy = Math.round(y) + dy;
    if (xx < 0 || yy < 0 || xx >= EW || yy >= EH) continue;
    const s = SB[yy * EW + xx]; if (s >= 0) return s;
  }
  return -1;
}
export function bodyAt(x, y) { x = Math.round(x); y = Math.round(y); return x >= 0 && y >= 0 && x < EW && y < EH && PB[y * EW + x] >= 0; }
// Random points on the patient's body, for mini-games.
export function bodyPoints(n, seed = 1) {
  const pts = []; let k = 0;
  while (pts.length < n && k < 20000) { k++; const x = Math.floor(hash(k, seed, 1) * EW), y = Math.floor(hash(k, seed, 2) * TOP); if (PB[y * EW + x] >= 0) pts.push([x, y]); }
  return pts;
}
