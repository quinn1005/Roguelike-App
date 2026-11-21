// Drawing helpers for hand-built scenes (title screen, town street, polaroids).
import { clamp, mix, scl, quant, hash, text, WHITE } from './util.js';

export function rect(fb, x, y, w, h, c) { x = Math.round(x); y = Math.round(y); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) fb.set(x + i, y + j, c); }
export function disc(fb, cx, cy, r, c) { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) fb.set(x, y, c); }
export function ell(fb, cx, cy, rx, ry, c) { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1) fb.set(x, y, c); }
// Soft light: adds a dithered glow.
export function glow(fb, cx, cy, r, c, k = 0.6) {
  for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
    const d = Math.hypot(x - cx, y - cy) / r; if (d >= 1) continue;
    const a = quant((1 - d) * (1 - d), 4, x & 255, y & 255) * k; if (a > 0) fb.add(x, y, scl(c, a));
  }
}
// The tiny pixel font, scaled up, with an outline.
export function bigText(fb, s, x, y, scale, c, outline) {
  const plot = (px, py, col) => rect(fb, px, py, scale, scale, col);
  const draw = (ox, oy, col) => text({ set: (px, py) => plot(x + (px - x) * scale + ox, y + (py - y) * scale + oy, col) }, s, x, y, col);
  if (outline) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]]) draw(dx * scale / 2 + dx, dy * scale / 2 + dy, outline);
  draw(0, 0, c);
}
export const bigWidth = (s, scale) => (String(s).length * 4 - 1) * scale;
export function sky(fb, w, h, top, bottom, stars = 0, t = 0) {
  for (let y = 0; y < h; y++) { const c = mix(top, bottom, quant(y / h, 7, 0, y)); for (let x = 0; x < w; x++) fb.set(x, y, c); }
  for (let k = 0; k < stars; k++) { const x = Math.floor(hash(k, 1, 9) * w), y = Math.floor(hash(k, 2, 9) * h * 0.5); if (Math.sin(t * 2 + k) > -0.3) fb.set(x, y, mix(WHITE, top, hash(k, 3) * 0.5)); }
}
export function rain(fb, w, h, t, c = [150, 180, 230]) {
  for (let k = 0; k < 70; k++) { const x = Math.floor((hash(k, 1, 3) * w + t * 30) % w), y0 = (hash(k, 2, 3) * h + t * 160) % h; for (let j = 0; j < 3; j++) fb.blend(x - j, Math.floor(y0) + j * 2, c, 0.45); }
}
export const clampi = (v, a, b) => Math.round(clamp(v, a, b));
