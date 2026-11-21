// The town at night (style E again: parallax layers). Storefronts you can walk up to.
import { mix, scl, hash, quant, WHITE, line } from './util.js';
import { rect, disc, ell, glow, bigText, bigWidth, sky, rain } from './scene.js';
import { PLACES } from './story.js';

export const TOW = 192, TOH = 108;
const FACADE_W = 62;

function label(fb, s, cx, y, c, glowC) {
  const x = Math.round(cx - bigWidth(s, 1) / 2);
  if (glowC) glow(fb, cx, y + 2, Math.max(14, s.length * 3), glowC, 0.25);
  bigText(fb, s, x, y, 1, c);
}
function facade(fb, kind, x, t, visited, sel) {
  const y0 = 40, h = 48, w = FACADE_W, L = x - w / 2;
  const win = (wx, wy, ww, wh, c) => { rect(fb, wx, wy, ww, wh, c); };
  switch (kind) {
    case 'park': {
      rect(fb, L, 80, w, 8, [44, 70, 48]);
      for (const [tx, ts] of [[L + 10, 1], [L + 44, 1.2]]) { rect(fb, tx, 62, 3, 18, [70, 50, 40]); ell(fb, tx + 1, 56, 10 * ts, 9 * ts, [40, 86, 56]); ell(fb, tx - 2, 52, 6 * ts, 5 * ts, [56, 110, 70]); }
      ell(fb, L + 30, 84, 12, 3, [60, 90, 150]); ell(fb, L + 28, 83, 4, 1, [140, 170, 230]);
      rect(fb, L + 30, 54, 2, 26, [60, 56, 70]); if (Math.sin(t * 7) > 0) glow(fb, L + 31, 54, 10, [255, 230, 160], 0.4);
      for (let k = 0; k < 5; k++) { const fx = L + 10 + hash(k, 3) * 40 + Math.sin(t + k) * 4, fy = 60 + hash(k, 4) * 18 + Math.cos(t * 1.3 + k) * 3; if (Math.sin(t * 3 + k * 2) > 0.2) fb.set(Math.round(fx), Math.round(fy), [230, 255, 140]); }
      label(fb, 'ELM PARK', x, 44, [200, 230, 190]);
      break;
    }
    case 'diner': {
      rect(fb, L + 2, y0 + 8, w - 4, h - 8, [176, 186, 196]); rect(fb, L + 2, y0 + 8, w - 4, 2, [220, 228, 236]);
      for (let k = 0; k < 4; k++) win(L + 6 + k * 13, y0 + 16, 10, 12, [250, 220, 150]);
      rect(fb, L + 2, y0 + 30, w - 4, 2, [200, 60, 60]); rect(fb, L + 24, y0 + 32, 12, 16, [80, 60, 60]);
      // the sign: half of DINER has burned out
      const dead = (i) => i >= 1 && i <= 3;
      const s = 'DINER', sx = Math.round(x - bigWidth(s, 1) / 2) + 4;
      glow(fb, x, y0 + 3, 22, [255, 120, 120], 0.2);
      bigText(fb, 'LAST STOP', Math.round(x - bigWidth('LAST STOP', 1) / 2), y0 - 4, 1, [255, 140, 140]);
      [...s].forEach((ch, i) => bigText(fb, ch, sx - 4 + i * 4, y0 + 2, 1, dead(i) && Math.sin(t * 11 + i) < 0.8 ? [90, 60, 60] : [255, 200, 120]));
      break;
    }
    case 'cards': {
      rect(fb, L + 4, y0, w - 8, h, [90, 70, 110]); rect(fb, L + 4, y0, w - 8, 9, [60, 44, 80]);
      label(fb, "LOU'S CARDS", x, y0 + 2, [250, 230, 140]);
      win(L + 8, y0 + 14, 30, 18, [240, 220, 170]);
      for (let k = 0; k < 8; k++) { const c = [[220, 70, 80], [80, 130, 220], [240, 200, 90], [110, 190, 120]][k % 4]; rect(fb, L + 10 + (k % 4) * 7, y0 + 16 + (k >> 2) * 8, 5, 7, c); }
      rect(fb, L + 42, y0 + 22, 12, 26, [60, 40, 50]); rect(fb, L + 44, y0 + 26, 8, 6, [240, 220, 170]);
      break;
    }
    case 'arcade': {
      rect(fb, L + 2, y0, w - 4, h, [36, 20, 60]);
      const k = 0.5 + 0.5 * Math.sin(t * 4);
      label(fb, 'PIXEL PALACE', x, y0 + 2, mix([255, 120, 255], WHITE, 0.3), [200, 80, 255]);
      win(L + 6, y0 + 14, 50, 20, [20, 14, 40]);
      // the Neon Bastion cabinet in the window
      rect(fb, L + 34, y0 + 16, 12, 18, [40, 40, 70]); rect(fb, L + 36, y0 + 18, 8, 7, mix([40, 220, 220], [200, 80, 255], k));
      for (let j = 0; j < 3; j++) fb.set(L + 37 + j * 3, y0 + 20 + ((j + Math.floor(t * 5)) % 3), WHITE);
      glow(fb, L + 40, y0 + 21, 12, mix([40, 220, 220], [200, 80, 255], k), 0.4);
      rect(fb, L + 10, y0 + 18, 12, 14, [70, 40, 90]); rect(fb, L + 12, y0 + 20, 8, 6, [250, 200, 80]);
      rect(fb, L + 24, y0 + 36, 14, 12, [60, 40, 80]);
      break;
    }
    case 'lanes': {
      rect(fb, L, y0 + 6, w, h - 6, [60, 50, 90]); rect(fb, L, y0 + 6, w, 3, [90, 70, 130]);
      // a giant pin on the roof
      const px = x + 18;
      for (let yy = -14; yy <= 6; yy++) { const ww = yy < -10 ? 2 : yy < -6 ? 1.5 : 2 + Math.sin((yy + 6) / 12 * Math.PI) * 3; rect(fb, px - ww, y0 + yy, ww * 2 + 1, 1, (yy === -7 || yy === -6) ? [230, 60, 60] : [245, 245, 250]); }
      label(fb, 'LUCKY STRIKE', x - 8, y0 + 12, [120, 240, 255], [80, 200, 255]);
      label(fb, 'LANES', x - 8, y0 + 19, [255, 230, 120]);
      win(L + 6, y0 + 28, 44, 12, mix([160, 80, 255], [80, 40, 160], 0.5 + 0.5 * Math.sin(t * 2)));
      rect(fb, L + 50, y0 + 28, 8, 20, [40, 30, 60]);
      break;
    }
    case 'petcorp': {
      rect(fb, L + 2, y0 - 4, w - 4, h + 4, [222, 230, 236]); rect(fb, L + 2, y0 - 4, w - 4, 10, [40, 140, 210]);
      label(fb, 'PETCORP', x, y0 - 2, WHITE);
      for (let k = 0; k < 3; k++) win(L + 8 + k * 16, y0 + 12, 12, 14, [40, 60, 80]);
      rect(fb, L + 24, y0 + 30, 14, 18, [180, 190, 200]);
      if (Math.sin(t * 0.8) > 0.3) glow(fb, L + w - 4, y0 + 30, 12, [255, 240, 200], 0.35);
      break;
    }
    case 'alley': {
      rect(fb, L, y0 - 10, 6, h + 10, [50, 44, 54]); rect(fb, L + w - 6, y0 - 10, 6, h + 10, [50, 44, 54]);
      rect(fb, L + 12, 70, 20, 14, [50, 80, 60]); rect(fb, L + 11, 68, 22, 3, [40, 64, 50]);
      rect(fb, L + 36, 74, 12, 10, [110, 80, 50]); rect(fb, L + 38, 66, 10, 8, [96, 70, 46]);
      for (let k = 0; k < 3; k++) { const gx = L + 40 + k * 2, gy = 66; if (hash(k, 2) > 0.3) { fb.set(gx, gy, [200, 255, 160]); } }
      if (Math.sin(t * 0.9) > 0.4) { fb.set(L + 20, 66, [255, 220, 90]); fb.set(L + 23, 66, [255, 220, 90]); }
      label(fb, 'ALLEY', x, 44, [160, 150, 170]);
      break;
    }
    default: break;
  }
  if (visited) { rect(fb, x - 3, 30, 7, 5, [40, 40, 50]); fb.set(x - 1, 32, [140, 240, 160]); fb.set(x, 33, [140, 240, 160]); fb.set(x + 1, 32, [140, 240, 160]); fb.set(x + 2, 31, [140, 240, 160]); }
  if (sel) { const ay = 28 + Math.round(Math.sin(t * 6) * 1.5); rect(fb, x - 2, ay, 5, 1, [255, 210, 90]); rect(fb, x - 1, ay + 1, 3, 1, [255, 210, 90]); fb.set(x, ay + 2, [255, 210, 90]); }
}

// state: { cam, sel (place id), visited:Set, rain }
export function renderTown(fb, t, th, state) {
  const W = TOW, H = TOH, cam = state.cam || 0;
  sky(fb, W, H, [14, 12, 34], [54, 40, 80], 50, t);
  disc(fb, 30 - cam * 0.03, 16, 5, [240, 236, 220]);
  for (let k = -3; k < 20; k++) { const x = k * 16 - (cam * 0.25) % 16 - ((cam * 0.25) / 16 | 0) * 0, h = 16 + hash(k + Math.floor(cam * 0.25 / 16), 3) * 22; rect(fb, x, 70 - h, 15, h, [34, 28, 56]); }
  rect(fb, 0, 86, W, 2, [96, 90, 110]); rect(fb, 0, 88, W, 20, [40, 38, 52]);
  for (let x = Math.floor(-((cam) % 20)) - 20; x < W; x += 20) rect(fb, x, 98, 10, 1, [120, 116, 90]);
  const hits = [];
  for (const p of PLACES) {
    const x = Math.round(p.x - cam + W / 2);
    if (x < -FACADE_W || x > W + FACADE_W) continue;
    facade(fb, p.kind, x, t, state.visited && state.visited.has(p.id), state.sel === p.id);
    hits.push({ id: p.id, x0: x - FACADE_W / 2, x1: x + FACADE_W / 2 });
  }
  // streetlamps in front
  for (let k = -2; k < 8; k++) {
    const x = Math.round(k * 70 - (cam * 1.3) % 70 + 20);
    rect(fb, x, 52, 2, 46, [30, 28, 40]); rect(fb, x - 3, 50, 8, 3, [30, 28, 40]);
    glow(fb, x + 1, 53, 18, [255, 220, 150], 0.45); rect(fb, x - 1, 52, 4, 1, [255, 240, 200]);
  }
  // you, with your lamp
  {
    const x = W / 2, y = 96, step = Math.floor(t * 4) % 2;
    rect(fb, x - 2, y - 14, 5, 8, [240, 240, 236]); rect(fb, x - 2, y - 6, 2, 6, [60, 60, 90]); rect(fb, x + 1, y - 6 + step, 2, 6 - step, [60, 60, 90]);
    rect(fb, x - 2, y - 19, 5, 5, [226, 176, 138]); rect(fb, x - 2, y - 20, 5, 2, [60, 40, 36]);
    rect(fb, x + 3, y - 10, 1, 4, [80, 80, 90]); glow(fb, x + 4, y - 6, 10, [255, 230, 160], 0.5); rect(fb, x + 3, y - 6, 3, 2, [255, 240, 180]);
  }
  if (state.rain) rain(fb, W, H, t);
  return hits;
}
