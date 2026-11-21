// Casebook turnarounds (style D: pre-rendered 3D). Each species is a real 3D shape, rendered
// from a turning camera and crushed to a few dithered shades with a hard outline.
import { clamp, mix, scl, norm3, dot, quant, hash, tone, WHITE, BLACK } from './util.js';

export const TW = 128, TH = 72;
function smin(a, b, k) { const h = clamp(0.5 + 0.5 * (b - a) / k); return b + (a - b) * h - k * h * (1 - h); }
function sph(p, cx, cy, cz, r) { const x = p[0] - cx, y = p[1] - cy, z = p[2] - cz; return Math.sqrt(x * x + y * y + z * z) - r; }
function ell(p, cx, cy, cz, rx, ry, rz) { const x = p[0] - cx, y = p[1] - cy, z = p[2] - cz; const ax = x / rx, ay = y / ry, az = z / rz, bx = x / (rx * rx), by = y / (ry * ry), bz = z / (rz * rz); const k0 = Math.sqrt(ax * ax + ay * ay + az * az), k1 = Math.sqrt(bx * bx + by * by + bz * bz); return k1 === 0 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1; }
function cap(p, ax, ay, az, bx, by, bz, r) { const pax = p[0] - ax, pay = p[1] - ay, paz = p[2] - az, bax = bx - ax, bay = by - ay, baz = bz - az; const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz)); const x = pax - bax * h, y = pay - bay * h, z = paz - baz * h; return Math.sqrt(x * x + y * y + z * z) - r; }

// Each species: d(p,T) gives the distance, m(p,T,th) the color at a hit point.
const SDF = {
  cat: {
    d(p, T) {
      let d = ell(p, 0, 0.47, 0, 0.40, 0.46, 0.34);
      d = smin(d, sph(p, 0, 1.02, 0.10, 0.31), 0.12);
      d = smin(d, ell(p, 0.17, 1.31, 0.07, 0.09, 0.17, 0.06), 0.05);
      d = smin(d, ell(p, -0.17, 1.31, 0.07, 0.09, 0.17, 0.06), 0.05);
      d = smin(d, sph(p, 0.15, 0.08, 0.27, 0.11), 0.07);
      d = smin(d, sph(p, -0.15, 0.08, 0.27, 0.11), 0.07);
      d = smin(d, sph(p, 0, 0.94, 0.37, 0.10), 0.06);
      d = smin(d, cap(p, 0.05, 0.12, -0.30, 0.36 + 0.12 * Math.sin(T * 0.5), 0.58, -0.46, 0.07), 0.08);
      return d + 0.008 * Math.sin(p[0] * 31 + T) * Math.sin(p[1] * 29 - T * 0.7) * Math.sin(p[2] * 33);
    },
    m(p, T, th) {
      for (const s of [-1, 1]) { const qx = p[0] - 0.117 * s, qy = p[1] - 1.057, qz = p[2] - 0.385; if (qx * qx + qy * qy + qz * qz < 0.0056) return Math.abs(qx) < 0.017 ? [16, 10, 24] : [228, 186, 76]; }
      { const qy = p[1] - 0.985, qz = p[2] - 0.462; if (p[0] * p[0] + qy * qy + qz * qz < 0.001) return [230, 120, 140]; }
      let c = th.cat;
      if (p[1] > 0.2 && p[1] < 1.25 && p[2] < 0.12 && Math.sin(p[1] * 26 + Math.sin(p[0] * 7) * 1.4) > 0.5) c = scl(c, 0.66);
      if (p[2] > 0.2 && p[1] < 0.86 && p[1] > 0.15 && Math.abs(p[0]) < 0.2) c = mix(c, [255, 248, 236], 0.3);
      return c;
    },
  },
  gloop: {
    d(p, T) { const s = Math.sin(T * 0.5) * 0.05; return Math.max(ell(p, 0, 0.42, 0, 0.62 * (1 + s), 0.44 * (1 - s), 0.55 * (1 + s)), -p[1]); },
    m(p, T, th) { for (const s of [-1, 1]) { const qx = p[0] - 0.2 * s, qy = p[1] - 0.55, qz = p[2] - 0.47; if (qx * qx + qy * qy + qz * qz < 0.008) return qy > 0.03 && qx < 0 ? WHITE : [20, 14, 28]; } return th.slime; },
  },
  pebble: {
    d(p, T) { const k = 1 - 0.14 * (p[1] - 0.62) / 0.55; const q = [p[0] / k, p[1], p[2] / k]; return Math.min(ell(q, 0, 0.66, 0, 0.36, 0.52, 0.36) * k, ell(p, 0, 0.08, 0, 0.62, 0.12, 0.62)); },
    m(p, T, th) { if (p[1] < 0.18) return ((Math.floor(p[0] * 10) + Math.floor(p[2] * 10)) & 1) ? th.fabric : scl(th.fabric, 0.82); return hash(Math.floor(p[0] * 40), Math.floor(p[1] * 40), Math.floor(p[2] * 40)) > 0.9 ? scl(th.egg, 0.6) : th.egg; },
  },
  fern: {
    d(p, T) {
      const r = Math.sqrt(p[0] * p[0] + p[2] * p[2]), rr = 0.26 + 0.1 * clamp(p[1] / 0.5);
      let d = Math.max(r - rr, Math.abs(p[1] - 0.25) - 0.25);
      const sw = Math.sin(T * 0.6) * 0.04;
      d = Math.min(d, cap(p, 0, 0.45, 0, sw, 0.95, 0, 0.05));
      d = smin(d, sph(p, sw, 0.98, 0.04, 0.17), 0.04);
      for (const [x, y, z] of [[0.3, 0.8, 0], [-0.3, 0.86, 0.05], [0, 0.78, 0.3], [0.05, 0.9, -0.3], [0.2, 1.18, 0.12], [-0.18, 1.22, -0.1]]) d = Math.min(d, ell(p, x + sw, y, z, Math.abs(x) > 0.1 ? 0.24 : 0.12, 0.045, Math.abs(z) > 0.1 ? 0.24 : 0.12));
      return d;
    },
    m(p, T, th) {
      const sw = Math.sin(T * 0.6) * 0.04;
      if (p[1] < 0.5) return p[1] > 0.47 ? [70, 48, 36] : (p[1] > 0.44 ? [218, 132, 96] : [196, 104, 72]);
      for (const s of [-1, 1]) { const qx = p[0] - sw - 0.06 * s, qy = p[1] - 1.0, qz = p[2] - 0.19; if (qx * qx + qy * qy + qz * qz < 0.0018) return [20, 14, 28]; }
      const db = sph(p, sw, 0.98, 0.04, 0.17); return db < 0.02 ? [124, 198, 106] : [92, 168, 86];
    },
  },
  moth: {
    d(p, T) {
      const f = Math.sin(T * 3) * 0.08;
      let d = ell(p, 0, 0.38, 0, 0.32, 0.26, 0.42);
      d = smin(d, sph(p, 0, 0.64, 0.34, 0.2), 0.08);
      d = smin(d, ell(p, 0, 0.55, 0.16, 0.3, 0.14, 0.2), 0.06);
      for (const s of [-1, 1]) {
        d = Math.min(d, ell(p, s * 0.4, 0.78 + f, -0.05, 0.4, 0.3, 0.04));
        d = Math.min(d, cap(p, s * 0.18, 0.2, 0.2, s * 0.18, 0, 0.22, 0.05));
        d = Math.min(d, cap(p, s * 0.18, 0.2, -0.2, s * 0.18, 0, -0.22, 0.05));
        d = Math.min(d, cap(p, s * 0.06, 0.8, 0.38, s * 0.16, 1.02, 0.44, 0.015));
      }
      return d;
    },
    m(p, T, th) {
      for (const s of [-1, 1]) { const qx = p[0] - 0.09 * s, qy = p[1] - 0.67, qz = p[2] - 0.5; if (qx * qx + qy * qy + qz * qz < 0.005) return qy > 0.02 ? WHITE : [20, 14, 28]; }
      if (Math.abs(p[2] + 0.05) < 0.06 && Math.abs(p[0]) > 0.12 && p[1] > 0.5) { const r = Math.hypot(Math.abs(p[0]) - 0.45, p[1] - 0.8); return r < 0.07 ? [74, 52, 62] : r < 0.12 ? [244, 216, 150] : mix(th.paper, [206, 196, 166], 0.5); }
      if (p[1] > 0.45 && p[2] > 0.0 && p[2] < 0.32 && p[1] < 0.64) return [236, 226, 204];
      return [158, 124, 92];
    },
  },
};

const HIT = new Uint8Array(TW * TH);
export function renderTurntable(fb, sp, t, th) {
  const W = TW, H = TH, amb = th.ambLevel, SC = 33, CX = 64, GY = 64, S = SDF[sp] || SDF.gloop;
  const a = t * 0.85, ca = Math.cos(a), sa = Math.sin(a), P = 0.3, cp = Math.cos(P), sp2 = Math.sin(P);
  const dW = [0, -sp2, cp], dL = [dW[0] * ca - dW[2] * sa, dW[1], dW[0] * sa + dW[2] * ca], vW = [0, sp2, -cp];
  const L1 = norm3([-0.5, 0.75, -0.6]), L2 = norm3([0.75, 0.3, 0.7]), T = t * 5, e = 0.0035;
  const K = [[1, -1, -1], [-1, -1, 1], [-1, 1, -1], [1, 1, 1]];
  HIT.fill(0);
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const u = (px + 0.5 - CX) / SC, v = (GY - (py + 0.5)) / SC, oW = [u, v * cp + 3 * sp2, v * sp2 - 3 * cp];
    const oL = [oW[0] * ca - oW[2] * sa, oW[1], oW[0] * sa + oW[2] * ca];
    const ox = oL[0], oy = oL[1] - 0.72, oz = oL[2], b = ox * dL[0] + oy * dL[1] + oz * dL[2], disc = b * b - (ox * ox + oy * oy + oz * oz - 0.96);
    let c = null;
    if (disc > 0) {
      const sq = Math.sqrt(disc); let s = -b - sq; const end = -b + sq;
      for (let k = 0; k < 64 && s < end; k++) {
        const p = [oL[0] + dL[0] * s, oL[1] + dL[1] * s, oL[2] + dL[2] * s], dd = S.d(p, T);
        if (dd < 0.002) {
          let nL = [0, 0, 0]; for (const kk of K) { const f = S.d([p[0] + kk[0] * e, p[1] + kk[1] * e, p[2] + kk[2] * e], T); nL[0] += kk[0] * f; nL[1] += kk[1] * f; nL[2] += kk[2] * f; }
          nL = norm3(nL); const n = norm3([nL[0] * ca + nL[2] * sa, nL[1], -nL[0] * sa + nL[2] * ca]);
          const lv = amb + (1 - amb) * Math.max(0, dot(n, L1));
          c = tone(S.m(p, T, th), th, quant(lv, 6, px, py));
          const r = Math.max(0, dot(n, L2)) * (1 - Math.max(0, dot(n, vW))); if (r > 0.28) c = mix(c, th.rim, 0.55);
          HIT[py * W + px] = 1; break;
        }
        s += Math.max(dd, 0.003);
      }
    }
    if (!c) {
      const gs = oW[1] / sp2, gx = oW[0], gz = oW[2] + cp * gs; let base, lv;
      if (gz < 1.5) {
        const gr = Math.sqrt(gx * gx + gz * gz);
        if (gr < 0.95) { base = th.steel; lv = amb + (1 - amb) * 0.5; const f = ((((Math.atan2(gz, gx) - a) / (2 * Math.PI)) * 16) % 1 + 1) % 1; if (gr > 0.8 && f < 0.14) base = scl(th.steel, 0.55); if (gr > 0.9) lv += 0.15; }
        else { base = th.floor; lv = amb + (1 - amb) * Math.max(0, 0.42 - gz * 0.12); }
        const sh = gx * gx / 0.25 + gz * gz / 0.2; if (sh < 1) lv *= 0.45 + 0.55 * sh;
      } else { base = th.wall; lv = amb + (1 - amb) * (0.12 + 0.22 * Math.min(1, v / 2)); }
      c = tone(base, th, quant(lv, 5, px, py));
    }
    fb.set(px, py, c);
  }
  const oc = mix(th.amb, BLACK, 0.6);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (HIT[i]) continue;
    if ((x > 0 && HIT[i - 1]) || (x < W - 1 && HIT[i + 1]) || (y > 0 && HIT[i - W]) || (y < H - 1 && HIT[i + W])) fb.set(x, y, oc);
  }
}
