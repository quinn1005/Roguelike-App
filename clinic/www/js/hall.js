// Waiting room (style E: parallax layers). Flat painted layers slide at different speeds
// as the camera pans; owners wait in the chairs with their pets.
import { clamp, mix, tone, css, rgba, hash, WHITE, BLACK } from './util.js';

export const HW = 192, HH = 108;
export const SEATS = 8;
const SEAT_GAP = 26, SEAT_F = 0.72;
export const seatWorldX = (k) => (k - (SEATS - 1) / 2) * SEAT_GAP;

function look(name) {
  let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const r = (k) => hash(h, k, 77);
  const skins = [[238, 196, 160], [214, 160, 120], [170, 112, 76], [120, 80, 56], [248, 214, 184]];
  const hairs = [[50, 34, 30], [110, 70, 40], [200, 160, 90], [30, 30, 34], [180, 180, 186], [150, 60, 40]];
  const shirts = [[200, 90, 80], [90, 120, 190], [220, 190, 90], [120, 170, 110], [170, 110, 180], [230, 140, 70], [80, 160, 160]];
  return { skin: skins[Math.floor(r(1) * skins.length)], hair: hairs[Math.floor(r(2) * hairs.length)], shirt: shirts[Math.floor(r(3) * shirts.length)], kid: /age|Tobi/.test(name) };
}

function pet(R, T, th, sp, x, y, t, k) {
  const amb = th.ambLevel, L = (c, v) => T(c, amb + (1 - amb) * v), dk = css(mix(th.amb, BLACK, 0.6));
  if (sp === 'gloop') {
    const h = Math.round(Math.max(0, Math.sin(t * 3 + k)) * 2);
    R(x - 3, y - 4 - h, 7, 4, L(th.slime, 0.65)); R(x - 2, y - 5 - h, 5, 1, L(th.slime, 0.65)); R(x - 3, y - 1 - h, 7, 1, L(th.slime, 0.35));
    R(x - 1, y - 3 - h, 1, 1, dk); R(x + 2, y - 3 - h, 1, 1, dk);
  } else if (sp === 'cat') {
    R(x - 3, y - 4, 6, 4, L(th.cat, 0.6)); R(x - 2, y - 7, 5, 4, L(th.cat, 0.65)); R(x - 2, y - 8, 1, 1, L(th.cat, 0.6)); R(x + 2, y - 8, 1, 1, L(th.cat, 0.6));
    R(x - 1, y - 6, 1, 1, dk); R(x + 1, y - 6, 1, 1, dk);
    if (Math.sin(t * 7 + k) > 0.8) R(x - 3, y - 9, 1, 2, css(mix(th.key, WHITE, 0.6)));
  } else if (sp === 'fern') {
    const sw = Math.round(Math.sin(t * 2 + k)), leaf = L([92, 168, 86], 0.6);
    R(x - 2, y - 3, 5, 4, L([196, 104, 72], 0.5)); R(x + sw, y - 8, 1, 5, leaf); R(x - 2 + sw, y - 7, 2, 1, leaf); R(x + 1 + sw, y - 8, 2, 1, leaf); R(x + 1 + sw, y - 6, 2, 1, leaf);
  } else if (sp === 'moth') {
    const up = Math.sin(t * 14 + k) > 0, fur = L([158, 124, 92], 0.6), wing = L([214, 204, 172], 0.7);
    R(x - 2, y - 4, 5, 3, fur); R(x + 2, y - 5, 2, 2, fur);
    if (up) { R(x - 4, y - 7, 3, 3, wing); R(x + 1, y - 7, 3, 3, wing); } else { R(x - 5, y - 4, 3, 2, wing); R(x + 2, y - 4, 3, 2, wing); }
  } else if (sp === 'pebble') {
    const wb = (t % 3) < 0.4 ? Math.round(Math.sin(t * 40)) : 0, eg = L(th.egg, 0.6);
    R(x - 2 + wb, y - 6, 4, 6, eg); R(x - 3 + wb, y - 5, 6, 4, eg);
  }
}

// state: { seats: [{owner, sp, selected}|null], cam (pan offset), t }
export function renderHall(ctx, t, th, state) {
  const W = HW, H = HH, amb = th.ambLevel, cam = state.cam || 0;
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const T = (base, k) => css(tone(base, th, clamp(k)));
  const span = (f, period, pad, fn) => { const off = cam * f, k0 = Math.floor((off - W / 2 - pad) / period), k1 = Math.ceil((off + W / 2 + pad) / period); for (let k = k0; k <= k1; k++) fn(k, k * period - off + W / 2); };
  ctx.globalCompositeOperation = 'source-over';
  const g = ctx.createLinearGradient(0, 0, 0, 72); g.addColorStop(0, css(th.sky)); g.addColorStop(1, css(mix(th.sky, th.fog, 0.7))); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 72);
  const mx = Math.round(150 - cam * 0.03);
  for (let dy = -5; dy <= 5; dy++) { const hw = Math.round(Math.sqrt(25 - dy * dy)); R(mx - hw, 22 + dy, hw * 2, 1, css(th.win)); }
  span(0.12, 20, 30, (k, x) => {
    const h = 18 + hash(k, 1, 5) * 26, w = 13 + Math.round(hash(k, 2, 5) * 6), top = Math.round(66 - h), left = Math.round(x - w / 2);
    R(left, top, w, 72 - top, css(mix(th.sky, th.fog, 0.45)));
    for (let j = 0, wy = top + 3; wy < 66; wy += 4, j++) for (let i = 0, wx = left + 2; wx < left + w - 2; wx += 3, i++) if (hash(k * 31 + i, j, 9) > 0.62) R(wx, wy, 1, 2, css(mix(th.key, th.sky, 0.35)));
  });
  ctx.beginPath(); ctx.rect(0, 0, W, 72); const wins = [];
  span(0.45, 64, 40, (k, x) => { wins.push(Math.round(x)); ctx.rect(Math.round(x) - 14, 14, 28, 26); });
  ctx.fillStyle = T(th.wall, amb + (1 - amb) * 0.45); ctx.fill('evenodd');
  R(0, 52, W, 20, T(mix(th.wall, th.fabric, 0.35), amb + (1 - amb) * 0.3)); R(0, 52, W, 1, T(th.wall, amb + (1 - amb) * 0.7));
  const fr = T(th.steel, amb + (1 - amb) * 0.6);
  for (const x of wins) { R(x - 15, 13, 30, 1, fr); R(x - 15, 40, 30, 2, fr); R(x - 15, 13, 1, 28, fr); R(x + 14, 13, 1, 28, fr); R(x, 14, 1, 26, fr); R(x - 14, 26, 28, 1, fr); }
  span(0.45, 64, 40, (k, x) => {
    const dx = Math.round(x + 32), dc = T(mix(th.steel, th.wall, 0.4), amb + (1 - amb) * 0.4), ec = T(th.steel, amb + (1 - amb) * 0.75);
    R(dx - 10, 28, 20, 44, dc); R(dx - 11, 27, 22, 1, ec); R(dx - 11, 27, 1, 45, ec); R(dx + 10, 27, 1, 45, ec); R(dx - 3, 34, 6, 6, T(th.win, 0.55)); R(dx + 6, 50, 2, 1, ec);
    R(dx - 8, 21, 16, 5, css(th.accent)); for (let j = 0; j < 4; j++) R(dx - 6 + j * 3, 23, 2, 1, css(mix(th.accent, BLACK, 0.6)));
  });
  ctx.fillStyle = rgba(th.fog, 0.22); ctx.fillRect(0, 0, W, 72);
  R(0, 0, W, 6, T(th.wall, amb * 0.8));
  const cones = [], flick = th.id === 'night' || th.id === 'cursed';
  span(0.6, 48, 40, (k, x) => {
    const off = flick && ((k % 3 + 3) % 3 === 1) && hash(Math.floor(t * 10), k, 3) < 0.25;
    R(x - 10, 3, 20, 2, off ? T(th.steel, 0.2) : css(mix(th.key, WHITE, 0.5))); if (!off) cones.push(x);
  });
  for (let y = 72; y < H; y++) { const v = (y - 72) / 36; R(0, y, W, 1, T(th.floor, amb + (1 - amb) * (0.25 + 0.4 * v))); }
  const seam = T(th.floor, amb + (1 - amb) * 0.12);
  for (const y of [73, 75, 78, 82, 87, 93, 100]) R(0, y, W, 1, seam);
  ctx.fillStyle = seam;
  for (let y = 72; y < H; y++) { const v = (y - 72) / 36, s = 0.5 + 1.3 * v, off = cam * s, per = 16 * s, k0 = Math.floor((off - W / 2) / per) - 1, k1 = k0 + Math.ceil(W / per) + 2; for (let k = k0; k <= k1; k++) ctx.fillRect(Math.round(k * per - off + W / 2), y, 1, 1); }
  // chairs, owners and pets
  const hits = [];
  for (let k = 0; k < SEATS; k++) {
    const x = Math.round(seatWorldX(k) - cam * SEAT_F + W / 2), occ = state.seats[k];
    if (x < -20 || x > W + 20) continue;
    const c1 = T(th.fabric, amb + (1 - amb) * 0.5), c2 = T(th.fabric, amb + (1 - amb) * 0.25), lg = T(th.steel, 0.4);
    R(x - 6, 58, 12, 9, c1); R(x + 4, 58, 2, 9, c2); R(x - 7, 67, 14, 3, c1); R(x - 7, 69, 14, 1, c2); R(x - 6, 70, 1, 5, lg); R(x + 5, 70, 1, 5, lg);
    if (!occ) continue;
    const lk = look(occ.owner), kid = lk.kid ? 4 : 0, bob = Math.round(Math.sin(t * 1.5 + k) * 0.5);
    R(x - 4, 54 + kid, 8, 13 - kid, T(lk.shirt, amb + (1 - amb) * 0.5)); R(x + 2, 54 + kid, 2, 13 - kid, T(lk.shirt, amb + (1 - amb) * 0.25));
    R(x - 3, 47 + kid + bob, 6, 7, T(lk.skin, amb + (1 - amb) * 0.6)); R(x - 3, 46 + kid + bob, 6, 2, T(lk.hair, 0.4)); R(x - 4, 67, 8, 2, T([60, 64, 90], 0.4));
    R(x - 2, 49 + kid + bob, 1, 1, '#1a1020'); R(x + 1, 49 + kid + bob, 1, 1, '#1a1020');
    pet(R, T, th, occ.sp, x, 63, t, k);
    if (occ.waitLong) { R(x + 5, 43 + kid, 3, 3, css([230, 80, 70])); R(x + 6, 44 + kid, 1, 1, '#fff'); }
    if (occ.selected) { const ay = 36 + kid + Math.round(Math.sin(t * 6) * 1.5); R(x - 2, ay, 5, 1, css(th.accent)); R(x - 1, ay + 1, 3, 1, css(th.accent)); R(x, ay + 2, 1, 1, css(th.accent)); }
    hits.push({ k, x0: x - 8, x1: x + 8, y0: 40, y1: 76 });
  }
  // the clinic's own Gloop, Mop, hopping around the floor
  {
    const mxw = Math.sin(t * 0.21) * 120, sx = Math.round(mxw - cam + W / 2), by = 99;
    const ph = (t * 2.2) % 1, h = Math.round(Math.sin(ph * Math.PI) * 5), sq = h < 1 ? 1 : 0, w = 8 + sq * 2, hh = 6 - sq, y = by - h - hh;
    const c = css(tone(th.slime, th, 0.7)), cd = css(tone(th.slime, th, 0.35)), ch = css(mix(th.key, WHITE, 0.5));
    R(sx - 4, by, 8, 1, 'rgba(0,0,0,.35)'); R(sx - w / 2 + 1, y, w - 2, 1, c); R(sx - w / 2, y + 1, w, hh - 1, c); R(sx - w / 2, y + hh - 2, w, 2, cd); R(sx - w / 2 + 2, y + 1, 2, 1, ch); R(sx + 1, y + 2, 1, 2, '#101018'); R(sx + 3, y + 2, 1, 2, '#101018');
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const x of cones) {
    ctx.beginPath(); ctx.moveTo(x - 10, 5); ctx.lineTo(x + 10, 5); ctx.lineTo(x + 30, H); ctx.lineTo(x - 30, H); ctx.closePath(); ctx.fillStyle = rgba(th.key, 0.07); ctx.fill();
    ctx.fillStyle = rgba(th.key, 0.1); ctx.fillRect(Math.round(x) - 3, 74, 6, 22);
    const rg = ctx.createRadialGradient(x, 6, 0, x, 6, 30); rg.addColorStop(0, rgba(th.key, 0.16)); rg.addColorStop(1, rgba(th.key, 0)); ctx.fillStyle = rg; ctx.fillRect(x - 30, 0, 60, 40);
  }
  ctx.globalCompositeOperation = 'source-over';
  span(1.7, 170, 60, (k, x) => {
    x += 85;
    const dk = css(mix(th.fog, BLACK, 0.6)), sw = Math.sin(t * 0.8 + k) * 1.5; ctx.fillStyle = dk;
    ctx.beginPath(); ctx.ellipse(x + sw, 100, 9, 22, -0.4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 10 + sw, 104, 8, 20, 0.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x - 8, 106, 7, 18, -0.9, 0, 7); ctx.fill();
    R(x - 8, 98, 16, 10, dk);
  });
  const vg = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 120); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  return hits;
}
