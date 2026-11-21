// Small math, color and pixel-buffer helpers shared by every renderer.
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const scl = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const mulc = (a, b, k) => [a[0] * b[0] / 255 * k, a[1] * b[1] / 255 * k, a[2] * b[2] / 255 * k];
export const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const css = (a) => `rgb(${clamp(a[0], 0, 255) | 0},${clamp(a[1], 0, 255) | 0},${clamp(a[2], 0, 255) | 0})`;
export const rgba = (a, al) => `rgba(${clamp(a[0], 0, 255) | 0},${clamp(a[1], 0, 255) | 0},${clamp(a[2], 0, 255) | 0},${al})`;
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm3 = (v) => { const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
export const WHITE = [255, 255, 255], BLACK = [0, 0, 0];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export const bay = (x, y) => BAYER[((y & 3) << 2) | (x & 3)];

// Snap a 0..1 light level to a few shades, with an ordered dither between them.
export function quant(t, levels, x, y, amt = 1) {
  const v = clamp(t) * (levels - 1) + (bay(x, y) - 0.5) * amt;
  return clamp(Math.round(v), 0, levels - 1) / (levels - 1);
}
export function hash(x, y, z = 0) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1440662683);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
// Pixel-art shading ramp: shadows lean toward the ambient hue, lights toward the key light.
export function tone(base, th, t, key) {
  key = key || th.key;
  const sh = mix(mulc(base, th.amb, 1.5), th.amb, 0.3);
  const li = mix(mulc(base, key, 1.12), key, 0.1);
  return mix(sh, li, t);
}
export function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class FB {
  constructor(w, h) { this.w = w; this.h = h; this.img = new ImageData(w, h); this.d = this.img.data; this.d.fill(255); }
  set(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; const i = (y * this.w + x) << 2, d = this.d; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; }
  add(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; const i = (y * this.w + x) << 2, d = this.d; d[i] += c[0]; d[i + 1] += c[1]; d[i + 2] += c[2]; }
  get(x, y) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return [0, 0, 0]; const i = (y * this.w + x) << 2, d = this.d; return [d[i], d[i + 1], d[i + 2]]; }
  blend(x, y, c, a) { if (a <= 0) return; const o = this.get(x, y); this.set(x, y, mix(o, c, a > 1 ? 1 : a)); }
  fill(c) { const d = this.d; for (let i = 0; i < d.length; i += 4) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; } }
}
export function line(fb, x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let k = 0; k < 400; k++) {
    fb.set(x0, y0, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
export function boxBlur(src, tmp, w, h, r) {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let a = 0, b = 0, c = 0, n = 0;
    for (let k = -r; k <= r; k++) { const xx = x + k < 0 ? 0 : x + k >= w ? w - 1 : x + k; const i = (y * w + xx) * 3; a += src[i]; b += src[i + 1]; c += src[i + 2]; n++; }
    const o = (y * w + x) * 3; tmp[o] = a / n; tmp[o + 1] = b / n; tmp[o + 2] = c / n;
  }
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
    let a = 0, b = 0, c = 0, n = 0;
    for (let k = -r; k <= r; k++) { const yy = y + k < 0 ? 0 : y + k >= h ? h - 1 : y + k; const i = (yy * w + x) * 3; a += tmp[i]; b += tmp[i + 1]; c += tmp[i + 2]; n++; }
    const o = (y * w + x) * 3; src[o] = a / n; src[o + 1] = b / n; src[o + 2] = c / n;
  }
}
// Tiny 3x5 pixel font for numbers and short labels drawn inside the game view.
const GLYPHS = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
  '5': '111100111001111', '6': '111100111101111', '7': '111001001010010', '8': '111101111101111', '9': '111101111001111',
  '.': '000000000000010', '°': '010101010000000', '$': '011110010011110', ':': '000010000010000', '-': '000000111000000',
  '+': '000010111010000', '/': '001001010100100', ' ': '000000000000000', '!': '010010010000010', '?': '111001011000010',
  'A': '010101111101101', 'B': '110101110101110', 'C': '011100100100011', 'D': '110101101101110', 'E': '111100110100111',
  'F': '111100110100100', 'G': '011100101101011', 'H': '101101111101101', 'I': '111010010010111', 'K': '101101110101101',
  'L': '100100100100111', 'M': '101111111101101', 'N': '110101101101101', 'O': '010101101101010', 'P': '110101110100100',
  'R': '110101110101101', 'S': '011100010001110', 'T': '111010010010010', 'U': '101101101101111', 'V': '101101101101010',
  'W': '101101111111101', 'X': '101101010101101', 'Y': '101101010010010', 'Z': '111001010100111',
};
export function text(fb, s, x, y, c) {
  s = String(s).toUpperCase();
  for (const ch of s) {
    const g = GLYPHS[ch];
    if (g) for (let i = 0; i < 15; i++) if (g[i] === '1') fb.set(x + (i % 3), y + ((i / 3) | 0), c);
    x += 4;
  }
}
export const textWidth = (s) => String(s).length * 4 - 1;
