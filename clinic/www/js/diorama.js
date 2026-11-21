// Clinic overview (style C: tilt-shift diorama). The room is built from blocks and lit with
// real shadows; light through the window, a glow around bright lights, dust in the beam and
// blur at the top and bottom make it read like a tiny model.
import { clamp, mix, scl, norm3, dot, quant, hash, tone, WHITE, bay, boxBlur } from './util.js';

export const DW = 192, DH = 108;
const NX = 36, NY = 36, NZ = 23, S = 2.2, CX = 96, CY = 78, c45 = Math.SQRT1_2;
const CAM = norm3([0.612, 0.612, 0.5]);
const CACHE = new Map();
const SP_COLOR = { gloop: 'slime', cat: 'cat', fern: null, moth: null, pebble: 'egg' };
export const KENNEL_SPOTS = [[5.5, 9.5], [5.5, 18], [5.5, 26]];

const proj = (x, y, z) => { const X = x - 18, Y = y - 18, rx = (X - Y) * c45, ry = (X + Y) * c45; return [CX + rx * S, CY + (ry * 0.5 - z * 0.866) * S, ry * 0.866 + z * 0.5]; };

function build(th) {
  if (CACHE.has(th.id)) return CACHE.get(th.id);
  const W = DW, H = DH, amb = Math.max(th.ambLevel, 0.26);
  const g = new Uint8Array(NX * NY * NZ), I = (x, y, z) => (z * NY + y) * NX + x;
  const solid = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= NX || y >= NY || z >= NZ) ? 0 : g[I(x, y, z)];
  const put = (x0, x1, y0, y1, z0, z1, m) => { for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[I(x, y, z)] = m; };
  for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) g[I(x, y, 0)] = (((x >> 2) + (y >> 2)) & 1) ? 2 : 1;
  put(11, 26, 12, 26, 0, 0, 13);
  put(0, 1, 0, NY - 1, 0, 21, 3); put(0, NX - 1, 0, 1, 0, 21, 3);
  put(0, 1, 0, NY - 1, 1, 2, 4); put(0, NX - 1, 0, 1, 1, 2, 4);
  // window
  put(19, 29, 0, 1, 9, 17, 0);
  put(18, 18, 0, 1, 8, 18, 5); put(30, 30, 0, 1, 8, 18, 5); put(18, 30, 0, 1, 8, 8, 5); put(18, 30, 0, 1, 18, 18, 5);
  put(24, 24, 0, 1, 9, 17, 5); put(19, 29, 0, 1, 13, 13, 5); put(18, 30, 2, 2, 8, 8, 5);
  // the basement door, with a frame and a padlock
  put(3, 9, 2, 2, 1, 13, 5); put(4, 8, 2, 2, 1, 12, 18); put(7, 7, 3, 3, 6, 6, 6);
  // exam table
  for (const [x, y] of [[13, 15], [24, 15], [13, 23], [24, 23]]) put(x, x, y, y, 1, 6, 6);
  put(12, 25, 14, 24, 7, 8, 16);
  // kennels
  put(2, 9, 5, 30, 1, 1, 6); put(2, 9, 5, 30, 13, 13, 6);
  for (const yy of [5, 14, 22, 30]) put(2, 9, yy, yy, 1, 13, 6);
  for (let y = 6; y <= 29; y++) if (y % 2 === 0 && y !== 14 && y !== 22) put(9, 9, y, y, 2, 12, 7);
  put(9, 9, 6, 29, 7, 7, 7);
  // desk, heart monitor, keyboard
  put(19, 31, 2, 8, 6, 6, 8); put(19, 19, 2, 8, 1, 5, 8); put(31, 31, 2, 8, 1, 5, 8);
  put(22, 27, 3, 4, 7, 12, 17); put(23, 26, 4, 4, 8, 11, 9); put(22, 27, 6, 7, 7, 7, 6);
  // weight chart, poster
  put(11, 16, 2, 2, 14, 19, 12); put(2, 2, 8, 26, 16, 19, 12);
  // a potted plant in the far corner
  for (let z = 1; z <= 5; z++) for (let y = 31; y <= 35; y++) for (let x = 2; x <= 6; x++) if ((x - 4) ** 2 + (y - 33) ** 2 <= 5) g[I(x, y, z)] = 10;
  for (const [lx, ly, lz] of [[4, 33, 8], [2.5, 33, 10], [5.5, 32, 11], [4, 34.5, 12], [3, 31.5, 13], [5, 34, 14], [4, 32.5, 9.5]])
    for (let z = Math.floor(lz - 2); z <= lz + 2; z++) for (let y = Math.floor(ly - 2); y <= ly + 2; y++) for (let x = Math.floor(lx - 2); x <= lx + 2; x++)
      if ((x + 0.5 - lx) ** 2 + (y + 0.5 - ly) ** 2 + (z + 0.5 - lz) ** 2 < 3.3 && x >= 0 && y >= 0 && x < NX && y < NY && z < NZ) g[I(x, y, z)] = 11;
  // exam lamp on a stand
  put(27, 27, 26, 26, 1, 19, 6); put(26, 28, 25, 27, 1, 1, 6);
  for (let s = 0; s <= 1; s += 0.08) { const x = Math.round(27 - 5 * s), y = Math.round(26 - 8 * s); g[I(x, y, 19)] = 6; }
  put(21, 23, 17, 19, 19, 19, 6); g[I(22, 18, 18)] = 15;

  const Lw = norm3([0.25, -0.85, 0.62]), bulb = [22.5, 18.5, 18.5];
  const sunlit = (px, py, pz) => { for (let s = 0.3; s < 90; s += 0.5) { const x = px + Lw[0] * s, y = py + Lw[1] * s, z = pz + Lw[2] * s; if (y < 0) return 1; if (z >= 21.6 || x < 0 || x >= NX || y >= NY || z < 0) return 0; if (g[I(x | 0, y | 0, z | 0)]) return 0; } return 0; };
  const matColor = (m, x, y, z) => {
    switch (m) {
      case 1: return th.floor; case 2: return scl(th.floor, 0.86);
      case 3: return (z % 4 === 0 || (x + y) % 4 === 0) ? scl(th.wall, 0.88) : th.wall;
      case 4: return scl(mix(th.fabric, th.wall, 0.4), 0.8); case 5: return mix(th.steel, WHITE, 0.2); case 6: return th.steel; case 7: return scl(th.steel, 0.75);
      case 8: return mix([158, 112, 74], th.wall, 0.2); case 10: return [196, 104, 72]; case 11: return [92, 168, 86]; case 12: return th.paper;
      case 13: return ((x + y) % 4 === 0) ? mix(th.fabric, WHITE, 0.25) : th.fabric;
      case 16: return mix(th.steel, WHITE, 0.1); case 17: return [52, 58, 66];
      case 18: return (z % 3 === 0) ? [70, 46, 40] : [96, 64, 52];
      default: return th.steel;
    }
  };
  const col = new Float32Array(W * H * 3), zb = new Float32Array(W * H).fill(-1e9), mat = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = mix(scl(th.sky, 0.85), th.fog, quant(y / H, 6, x, y)); const i = (y * W + x) * 3; col[i] = c[0]; col[i + 1] = c[1]; col[i + 2] = c[2]; }
  const bulbC = scl(mix(th.key, WHITE, 0.6), 1.15), scrC = [8, 34, 28];
  for (let z = 0; z < NZ; z++) for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
    const m = g[I(x, y, z)]; if (!m) continue;
    if (solid(x + 1, y, z) && solid(x - 1, y, z) && solid(x, y + 1, z) && solid(x, y - 1, z) && solid(x, y, z + 1) && solid(x, y, z - 1)) continue;
    let n = [0, 0, 0], filled = 0;
    for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy && !dz) continue; if (solid(x + dx, y + dy, z + dz)) filled++; else { n[0] += dx; n[1] += dy; n[2] += dz; } }
    if (!n[0] && !n[1] && !n[2]) n = [0, 0, 1]; n = norm3(n);
    if (dot(n, CAM) < -0.25) continue;
    const p = [x + 0.5, y + 0.5, z + 0.5];
    const dw = dot(n, Lw), diffW = dw > 0 ? dw * sunlit(p[0] + n[0] * 0.6, p[1] + n[1] * 0.6, p[2] + n[2] * 0.6) : 0;
    const lp = [bulb[0] - p[0], bulb[1] - p[1], bulb[2] - p[2]], d2 = dot(lp, lp), diffL = Math.max(0, dot(n, norm3(lp))) / (1 + d2 / 320);
    const ao = clamp(1.2 - filled * 0.04, 0.45, 1);
    const lv = clamp((amb + (1 - amb) * (diffW + diffL)) * ao);
    const key = mix(th.key, th.win, diffW / (diffW + diffL + 1e-4));
    const base = matColor(m, x, y, z);
    const [sx, sy, dep] = proj(p[0], p[1], p[2]);
    const x0 = Math.floor(sx), y0 = Math.floor(sy);
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const px = x0 + ox, py = y0 + oy; if (px < 0 || py < 0 || px >= W || py >= H) continue; const i = py * W + px; if (dep <= zb[i]) continue;
      zb[i] = dep; mat[i] = m;
      const c = m === 15 ? bulbC : m === 9 ? scrC : tone(base, th, quant(lv, 6, px, py), key);
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    }
  }
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mat[y * W + x] === 9) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const scr = x1 >= 0 ? { x0, x1, y0, y1 } : null;
  const inSun = (x, y, z) => { if (x < 2 || y < 2 || x > 36 || y > 36 || z < 0.3 || z > 21.5) return 0; const s = (1 - y) / Lw[1], wx = x + Lw[0] * s, wz = z + Lw[2] * s; return (wx > 19 && wx < 30 && wz > 9 && wz < 18) ? 1 : 0; };
  const shaft = new Float32Array(W * H);
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const i = py * W + px, rx = (px + 0.5 - CX) / S, u = (py + 0.5 - CY) / S, D0 = zb[i] > -1e8 ? zb[i] : -30; let acc = 0;
    for (let D = D0 + 0.5; D < 34; D += 0.9) { const ry = 0.5 * u + 0.866 * D, z = -0.866 * u + 0.5 * D; acc += inSun((rx + ry) * c45 + 18, (ry - rx) * c45 + 18, z); }
    shaft[i] = acc;
  }
  const dust = []; for (let k = 1; dust.length < 46 && k < 6000; k++) { const p = [2 + hash(k, 1, 7) * 34, 2 + hash(k, 2, 7) * 34, 1 + hash(k, 3, 7) * 20]; if (inSun(p[0], p[1], p[2])) dust.push(p); }
  const r = { col, zb, mat, shaft, dust, inSun, Lw, bulb, scr };
  CACHE.set(th.id, r);
  return r;
}

const F = new Float32Array(DW * DH * 3), Z = new Float32Array(DW * DH);
const BW = DW >> 1, BH = DH >> 1, B = new Float32Array(BW * BH * 3), BT = new Float32Array(BW * BH * 3);
const T2 = new Float32Array(DW * DH * 3), TT = new Float32Array(DW * DH * 3);

// Small voxel blobs: the mascot on the table and the patients in the kennels.
function blob(th, cx, cy, cz, rxy, rz, color, amb, bulb, Lw, opts = {}) {
  for (let z = Math.floor(cz - rz); z <= cz + rz; z++) for (let y = Math.floor(cy - rxy); y <= cy + rxy; y++) for (let x = Math.floor(cx - rxy); x <= cx + rxy; x++) {
    const dx = (x + 0.5 - cx) / rxy, dy = (y + 0.5 - cy) / rxy, dz = (z + 0.5 - cz) / rz, e = dx * dx + dy * dy + dz * dz; if (e > 1 || e < 0.4) continue;
    const n = norm3([dx / rxy, dy / rxy, dz / rz]), fx = dot(n, CAM); if (fx < 0) continue;
    const p = [x + 0.5, y + 0.5, z + 0.5], lb = norm3([bulb[0] - p[0], bulb[1] - p[1], bulb[2] - p[2]]);
    const lv = amb + (1 - amb) * (0.2 + 0.35 * Math.max(0, dot(n, Lw)) + 0.7 * Math.max(0, dot(n, lb)));
    const side = dx - dy, eye = opts.eyes && dz > 0.12 && dz < 0.5 && fx > 0.78 && Math.abs(Math.abs(side) - 0.42) < 0.13;
    const [sx, sy, dep] = proj(p[0], p[1], p[2]), x0 = Math.floor(sx), y0 = Math.floor(sy);
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const px = x0 + ox, py = y0 + oy; if (px < 0 || py < 0 || px >= DW || py >= DH) continue; const i = py * DW + px; if (dep <= Z[i]) continue; Z[i] = dep;
      const c = eye ? [20, 14, 28] : tone(color, th, quant(lv, 6, px, py));
      F[i * 3] = c[0]; F[i * 3 + 1] = c[1]; F[i * 3 + 2] = c[2];
    }
  }
}
const SPC = { gloop: (th) => th.slime, cat: (th) => th.cat, fern: () => [92, 168, 86], moth: () => [176, 150, 120], pebble: (th) => th.egg };

// o: { kennel: [{sp}], cursed: bool, mascot: bool }
export function renderDiorama(fb, t, th, o = {}) {
  const W = DW, H = DH, r = build(th), { col, zb, mat, shaft, dust, inSun, Lw, bulb, scr } = r, amb = Math.max(th.ambLevel, 0.26);
  F.set(col); Z.set(zb);
  if (scr) {
    const ekg = (x) => { x = ((x % 1) + 1) % 1; if (x < 0.4) return 0; if (x < 0.45) return -0.2; if (x < 0.52) return 1; if (x < 0.58) return -0.7; if (x < 0.75) return 0.15; return 0; };
    for (let y = scr.y0; y <= scr.y1; y++) for (let x = scr.x0; x <= scr.x1; x++) {
      const i = y * W + x; if (mat[i] !== 9) continue;
      const u = (x - scr.x0) / (scr.x1 - scr.x0 + 1), v = (y - scr.y0 + 0.5) / (scr.y1 - scr.y0 + 1);
      const on = Math.abs(v - (0.6 - ekg(u * 1.3 - t * 0.6) * 0.4)) < 0.17, c = on ? [120, 255, 170] : [8, 34 + 12 * Math.sin(t * 3), 28];
      F[i * 3] = c[0]; F[i * 3 + 1] = c[1]; F[i * 3 + 2] = c[2];
    }
  }
  if (o.cursed) {
    const k = 0.5 + 0.5 * Math.sin(t * 3);
    for (let i = 0; i < W * H; i++) if (mat[i] === 18) { const x = i % W, y = (i / W) | 0; const edge = mat[i - 1] !== 18 || mat[i + 1] !== 18 || mat[i - W] !== 18 || mat[i + W] !== 18; if (edge) { F[i * 3] += 140 * k; F[i * 3 + 1] += 40 * k; F[i * 3 + 2] += 220 * k; } }
  }
  if (o.mascot !== false) {
    const ph = (t * 1.5) % 1, h = 4 * ph * (1 - ph) * 3.2, sq = h < 0.7 ? 1 + 0.28 * (1 - h / 0.7) : 1;
    const rxy = 3.5 * Math.sqrt(sq), rz = 3.1 / sq, gx = 17.5, gy = 19.5;
    const [sx0, sy0] = proj(gx, gy, 9), rr = rxy * S * (1.15 - h * 0.07);
    for (let py = Math.floor(sy0 - rr * 0.5 - 1); py <= sy0 + rr * 0.5 + 1; py++) for (let px = Math.floor(sx0 - rr - 1); px <= sx0 + rr + 1; px++) {
      if (px < 0 || py < 0 || px >= W || py >= H) continue; const i = py * W + px; if (mat[i] !== 16) continue;
      const ex = (px + 0.5 - sx0) / rr, ey = (py + 0.5 - sy0) / (rr * 0.5), e = ex * ex + ey * ey;
      if (e < 1 && (e < 0.7 || bay(px, py) > 0.5)) { F[i * 3] *= 0.55; F[i * 3 + 1] *= 0.55; F[i * 3 + 2] *= 0.6; }
    }
    blob(th, gx, gy, 9 + rz + h, rxy, rz, th.slime, amb, bulb, Lw, { eyes: true });
  }
  (o.kennel || []).slice(0, 3).forEach((k, i) => {
    const [kx, ky] = KENNEL_SPOTS[i], bob = Math.sin(t * 2 + i) * 0.3;
    const c = (SPC[k.sp] || SPC.gloop)(th);
    if (k.sp === 'pebble') blob(th, kx, ky, 2 + 3.1 + (Math.sin(t * 9) > 0.95 ? 0.4 : 0), 2.3, 3.1, c, amb, bulb, Lw);
    else blob(th, kx, ky, 2 + 2.6 + bob, 2.8, 2.6, c, amb, bulb, Lw, { eyes: true });
  });
  const pulse = (th.id === 'morning' ? 0.006 : 0.011) * (0.9 + 0.1 * Math.sin(t * 0.7));
  for (let i = 0; i < W * H; i++) { const s = shaft[i]; if (s > 0) { const k = Math.min(s, 14) * pulse; F[i * 3] += th.win[0] * k; F[i * 3 + 1] += th.win[1] * k; F[i * 3 + 2] += th.win[2] * k; } }
  dust.forEach((p, j) => {
    const q = [p[0] + Math.sin(t * 0.3 + j) * 0.8, p[1] + Math.cos(t * 0.25 + j * 1.3) * 0.8, p[2] + Math.sin(t * 0.2 + j * 2) * 0.9];
    if (!inSun(q[0], q[1], q[2])) return; const [sx, sy, dep] = proj(q[0], q[1], q[2]), px = Math.floor(sx), py = Math.floor(sy);
    if (px < 0 || py < 0 || px >= W || py >= H) return; const i = py * W + px; if (Z[i] > dep) return;
    const k = 0.35 + 0.35 * Math.sin(t * 2 + j * 1.7); F[i * 3] += th.win[0] * k; F[i * 3 + 1] += th.win[1] * k; F[i * 3 + 2] += th.win[2] * k;
  });
  const bloomT = th.id === 'morning' ? 238 : 212;
  for (let by = 0; by < BH; by++) for (let bx = 0; bx < BW; bx++) {
    let rr = 0, gg = 0, bb = 0; for (let oy = 0; oy < 2; oy++) for (let ox = 0; ox < 2; ox++) { const i = ((by * 2 + oy) * W + bx * 2 + ox) * 3; rr += F[i]; gg += F[i + 1]; bb += F[i + 2]; }
    rr /= 4; gg /= 4; bb /= 4; const lum = 0.3 * rr + 0.59 * gg + 0.11 * bb, k = Math.max(0, (lum - bloomT) / (255 - bloomT)); const oo = (by * BW + bx) * 3; B[oo] = rr * k; B[oo + 1] = gg * k; B[oo + 2] = bb * k;
  }
  boxBlur(B, BT, BW, BH, 2); boxBlur(B, BT, BW, BH, 2);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 3, oo = ((y >> 1) * BW + (x >> 1)) * 3; F[i] += B[oo] * 0.7; F[i + 1] += B[oo + 1] * 0.7; F[i + 2] += B[oo + 2] * 0.7; }
  T2.set(F); boxBlur(T2, TT, W, H, 2); boxBlur(T2, TT, W, H, 1);
  const d = fb.d;
  for (let y = 0; y < H; y++) {
    let k = clamp((Math.abs(y - 58) - 20) / 30); k = k * k * (3 - 2 * k);
    for (let x = 0; x < W; x++) { const i = (y * W + x) * 3, oo = (y * W + x) * 4; d[oo] = F[i] + (T2[i] - F[i]) * k; d[oo + 1] = F[i + 1] + (T2[i + 1] - F[i + 1]) * k; d[oo + 2] = F[i + 2] + (T2[i + 2] - F[i + 2]) * k; }
  }
}
// Build a theme's room ahead of time (it takes a moment on slow phones).
export function prewarm(th) { build(th); }
