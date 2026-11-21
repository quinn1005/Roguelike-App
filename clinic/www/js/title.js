// The title screen: the clinic at dusk, with a few of its patients making themselves at home.
import { mix, scl, hash, quant, WHITE, line } from './util.js';
import { rect, disc, ell, glow, bigText, bigWidth, sky } from './scene.js';

export const TIW = 192, TIH = 108;
const BRICK = [150, 78, 64], BRICK2 = [126, 64, 54], ROOF = [62, 48, 70], WARM = [255, 206, 120], NEON = [255, 110, 170], TEAL = [120, 240, 210];

export function renderTitle(fb, t) {
  const W = TIW, H = TIH;
  sky(fb, W, H, [34, 26, 70], [236, 130, 120], 40, t);
  // the sun just gone, a big soft moon
  glow(fb, 160, 22, 26, [255, 210, 230], 0.35); disc(fb, 160, 22, 6, [255, 244, 236]); disc(fb, 162, 21, 5.5, [244, 226, 228]);
  // far town
  for (let k = 0; k < 14; k++) { const x = k * 15 - 6, h = 22 + hash(k, 4) * 20; rect(fb, x, 76 - h, 14, h, [70, 48, 92]); for (let j = 0; j < 5; j++) if (hash(k, j, 5) > 0.55) rect(fb, x + 3 + (j % 2) * 6, 76 - h + 4 + j * 5, 2, 2, [250, 200, 130]); }
  // street and sidewalk
  rect(fb, 0, 88, W, 20, [56, 52, 72]); rect(fb, 0, 86, W, 2, [120, 110, 130]);
  for (let x = (Math.floor(t * 6) % 16) - 16; x < W; x += 16) rect(fb, x, 98, 8, 1, [190, 180, 140]);
  // the clinic: brick, a warm window, a door, a striped awning
  const bx = 52, by = 36, bw = 88, bh = 50;
  for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) fb.set(x, y, ((y - by) % 4 === 3 || ((x - bx + ((y - by) >> 2) * 3) % 8 === 0)) ? BRICK2 : BRICK);
  for (let i = 0; i < bw + 8; i++) { const yy = by - 10 + Math.round(Math.abs(i - (bw + 8) / 2) * 0.12); rect(fb, bx - 4 + i, yy, 1, 10 - Math.round(Math.abs(i - (bw + 8) / 2) * 0.12), ROOF); }
  // the sign board and neon letters
  rect(fb, bx + 4, by + 2, bw - 8, 13, [30, 22, 40]);
  const flick = Math.sin(t * 13) > 0.92 ? 1 : 0;
  const sign = 'VET', sx = bx + (bw - bigWidth(sign, 2)) / 2;
  glow(fb, bx + bw / 2, by + 8, 34, NEON, 0.22);
  bigText(fb, sign, sx, by + 4, 2, flick ? [120, 60, 90] : mix(NEON, WHITE, 0.35));
  // window with the exam lamp glowing inside
  rect(fb, bx + 8, by + 20, 34, 22, [70, 40, 30]); rect(fb, bx + 9, by + 21, 32, 20, mix(WARM, [255, 170, 90], 0.3));
  glow(fb, bx + 25, by + 26, 16, WARM, 0.5); rect(fb, bx + 24, by + 21, 1, 3, [80, 70, 70]); rect(fb, bx + 21, by + 24, 7, 2, [200, 200, 210]);
  rect(fb, bx + 25, by + 21, 1, 20, [70, 40, 30]); rect(fb, bx + 9, by + 31, 32, 1, [70, 40, 30]);
  // fern in the window box, waving
  rect(fb, bx + 8, by + 42, 34, 3, [120, 70, 50]);
  for (let k = 0; k < 5; k++) { const lx = bx + 12 + k * 6, sw = Math.round(Math.sin(t * 2 + k) * 1.5); line(fb, lx, by + 42, lx + sw, by + 36, [70, 150, 70]); ell(fb, lx + sw, by + 36, 3, 1.6, [100, 186, 96]); }
  { const fx = bx + 24 + Math.round(Math.sin(t * 2) * 1.5); disc(fb, fx, by + 34, 3, [124, 198, 106]); fb.set(fx - 1, by + 34, [20, 14, 28]); fb.set(fx + 1, by + 34, [20, 14, 28]); }
  // door
  rect(fb, bx + 54, by + 22, 20, 28, [70, 44, 40]); rect(fb, bx + 56, by + 24, 16, 26, [110, 64, 52]); rect(fb, bx + 58, by + 27, 12, 8, mix(WARM, [255, 255, 255], 0.2)); fb.set(bx + 70, by + 38, [230, 200, 120]);
  rect(fb, bx + 56, by + 46, 16, 1, [80, 50, 40]);
  // the OPEN sign
  rect(fb, bx + 60, by + 36, 8, 3, (Math.floor(t * 2) & 1) ? [255, 120, 120] : [200, 80, 90]);
  // mailbox with an egg in a nest that wobbles
  rect(fb, 30, 74, 2, 14, [90, 80, 90]); rect(fb, 25, 68, 12, 7, [70, 110, 160]); rect(fb, 25, 67, 12, 1, [100, 140, 190]);
  { const wob = (t % 3) < 0.5 ? Math.round(Math.sin(t * 30)) : 0; ell(fb, 31 + wob * 0.5, 64, 3, 4, [226, 210, 180]); fb.set(30 + wob, 62, [255, 255, 240]); rect(fb, 27, 66, 9, 2, [140, 100, 60]); }
  // the streetlamp, and a Mothhound who cannot look away from it
  rect(fb, 162, 50, 2, 38, [60, 56, 70]); rect(fb, 158, 48, 10, 3, [60, 56, 70]); glow(fb, 163, 52, 22, [255, 230, 160], 0.6); rect(fb, 160, 51, 6, 1, [255, 250, 220]);
  {
    const a = t * 2.4, mx = 163 + Math.cos(a) * 12, my = 56 + Math.sin(a) * 5, f = Math.sin(t * 18) > 0;
    ell(fb, mx - 4, my - (f ? 2 : 0), 4, f ? 3 : 2, [230, 220, 190]); ell(fb, mx + 4, my - (f ? 2 : 0), 4, f ? 3 : 2, [230, 220, 190]);
    ell(fb, mx, my + 1, 3, 2, [158, 124, 92]); fb.set(Math.round(mx - 1), Math.round(my), [20, 14, 28]); fb.set(Math.round(mx + 1), Math.round(my), [20, 14, 28]);
  }
  // a Static Cat on the roof, crackling
  {
    const cx = 120, cy = by - 9;
    ell(fb, cx, cy, 5, 4, [234, 226, 200]); disc(fb, cx - 3, cy - 4, 3.2, [234, 226, 200]); fb.set(cx - 5, cy - 8, [234, 226, 200]); fb.set(cx - 2, cy - 8, [234, 226, 200]);
    fb.set(cx - 4, cy - 4, [20, 14, 28]); fb.set(cx - 2, cy - 4, [20, 14, 28]);
    const tail = Math.sin(t * 3) * 2; line(fb, cx + 5, cy + 1, cx + 9, cy - 4 + tail, [234, 226, 200]);
    if (Math.sin(t * 9) > 0.6) { line(fb, cx - 7, cy - 9, cx - 4, cy - 12, WHITE); line(fb, cx - 1, cy - 9, cx + 2, cy - 13, TEAL); }
  }
  // Mop the Gloop bouncing on the doorstep
  {
    const ph = (t * 1.6) % 1, h = Math.sin(ph * Math.PI) * 7, sq = h < 1 ? 1.2 : 1, gx = bx + 64, gy = 86 - h;
    for (let y = -7; y <= 0; y++) for (let x = -9; x <= 9; x++) { const nx = x / (8 * sq), ny = (y + 3.5) / (4.5 / sq); if (nx * nx + ny * ny < 1) fb.set(gx + x, Math.round(gy + y), quant(0.5 - nx * 0.4 - ny * 0.4, 3, x & 255, y & 255) > 0.6 ? [190, 250, 170] : [134, 224, 124]); }
    fb.set(gx - 3, Math.round(gy - 5), [20, 14, 28]); fb.set(gx + 3, Math.round(gy - 5), [20, 14, 28]); fb.set(gx - 2, Math.round(gy - 6), WHITE); fb.set(gx + 4, Math.round(gy - 6), WHITE);
    fb.set(gx, Math.round(gy - 3), [20, 14, 28]);
    rect(fb, gx - 6, 87, 12, 1, [40, 36, 54]);
  }
  // the logo
  const bob = Math.round(Math.sin(t * 2) * 1.5);
  const t1 = 'PIXEL PET', t2 = 'CLINIC';
  bigText(fb, t1, Math.round((W - bigWidth(t1, 2)) / 2), 4 + bob, 2, [255, 236, 170], [60, 30, 70]);
  bigText(fb, t2, Math.round((W - bigWidth(t2, 3)) / 2), 16 + bob, 3, mix(TEAL, WHITE, 0.2), [40, 26, 70]);
  // sparkles around the logo
  for (let k = 0; k < 6; k++) { const ph = (t * 0.7 + k / 6) % 1, x = 30 + hash(k, 8) * 132, y = 6 + hash(k, 9) * 28; if (ph < 0.3) { const c = mix(WHITE, NEON, ph * 2); fb.set(Math.round(x), Math.round(y), c); fb.set(Math.round(x) - 1, Math.round(y), scl(c, 0.6)); fb.set(Math.round(x) + 1, Math.round(y), scl(c, 0.6)); fb.set(Math.round(x), Math.round(y) - 1, scl(c, 0.6)); fb.set(Math.round(x), Math.round(y) + 1, scl(c, 0.6)); } }
}
