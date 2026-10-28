// Shared "paper doll" renderer for the 32x64 character sprites (Quinn and the
// commanders). A body is assembled from layers: back props, legs, torso, head,
// hair, headwear, front props and posed arms, then outlined automatically.

import { makeCanvas } from './sprites.js';

export const SW = 32, SH = 64;
export const OUTLINE = '#0b0710';

export const solid = (c) => () => c;

// Buffalo-check flannel: 2px blocks of red / dark red / black.
export const plaid = (red, mid, black) => (x, y) => {
  const a = (x >> 1) & 1, b = (y >> 1) & 1;
  return a && b ? black : a || b ? mid : red;
};

// A base colour crossed by thin grid lines (spider-web print, quilting...).
export const grid = (base, line, step = 3) => (x, y) => (x % step === 0 || y % step === 0 ? line : base);

// Arm poses as rectangles relative to the shoulder. Each pose lists sleeve
// rects (upper), forearm rects (fore), the wrist band and the hand.
const ARMS = {
  R: {
    down: { cuff: [23, 27, 2, 1], upper: [[23, 19, 2, 8]], fore: [[23, 27, 2, 7]], wrist: [23, 34, 2, 1], hand: [23, 35, 2, 3] },
    waveA: { cuff: [24, 19, 3, 1], upper: [[22, 19, 4, 3]], fore: [[24, 13, 3, 7]], wrist: [24, 12, 3, 1], hand: [24, 7, 3, 5], fingers: [[24, 6, 3, 1]] },
    waveB: { cuff: [25, 19, 3, 1], upper: [[22, 19, 4, 3]], fore: [[25, 15, 3, 5], [26, 13, 3, 3]], wrist: [26, 12, 3, 1], hand: [27, 7, 3, 5], fingers: [[27, 6, 3, 1]] },
    point: { cuff: [26, 19, 1, 3], upper: [[22, 19, 4, 3]], fore: [[26, 19, 4, 3]], wrist: [29, 19, 1, 3], hand: [30, 19, 2, 3] },
    up: { cuff: [24, 19, 2, 1], upper: [[22, 19, 3, 3]], fore: [[24, 11, 2, 9]], wrist: [24, 10, 2, 1], hand: [24, 7, 2, 3] },
    neck: { cuff: [24, 24, 1, 3], upper: [[22, 19, 3, 6]], fore: [[24, 24, 4, 3]], wrist: [28, 24, 1, 3], hand: [29, 23, 2, 4] },
    mouth: { cuff: [20, 25, 3, 1], upper: [[22, 19, 2, 7]], fore: [[20, 22, 3, 4], [19, 18, 2, 4]], wrist: [19, 17, 2, 1], hand: [18, 14, 3, 3] },
    front: { cuff: [23, 26, 1, 3], upper: [[22, 19, 2, 7]], fore: [[20, 26, 4, 3]], wrist: [19, 26, 1, 3], hand: [17, 26, 2, 3] },
    hold: { cuff: [23, 26, 1, 2], upper: [[23, 19, 2, 7]], fore: [[23, 26, 4, 2]], wrist: [27, 26, 1, 2], hand: [28, 25, 2, 3] },
  },
  L: {
    down: { cuff: [7, 27, 2, 1], upper: [[7, 19, 2, 8]], fore: [[7, 27, 2, 7]], wrist: [7, 34, 2, 1], hand: [7, 35, 2, 3] },
    strumA: { cuff: [8, 27, 1, 3], upper: [[7, 19, 2, 8]], fore: [[8, 27, 4, 3]], wrist: [12, 27, 1, 3], hand: [13, 27, 2, 3] },
    strumB: { cuff: [8, 29, 1, 3], upper: [[7, 19, 2, 8]], fore: [[8, 29, 4, 3]], wrist: [12, 29, 1, 3], hand: [13, 30, 2, 3] },
    front: { cuff: [8, 26, 1, 3], upper: [[7, 19, 2, 7]], fore: [[8, 26, 4, 3]], wrist: [12, 26, 1, 3], hand: [13, 26, 2, 3] },
    hip: { cuff: [7, 26, 1, 2], upper: [[7, 19, 2, 7]], fore: [[7, 26, 3, 2]], wrist: [9, 28, 1, 2], hand: [10, 28, 2, 3] },
    out: { cuff: [4, 20, 1, 3], upper: [[5, 20, 4, 3]], fore: [[2, 20, 3, 3]], wrist: [1, 20, 1, 3], hand: [0, 20, 1, 3] },
  },
};

export function armRects(side, pose) { return ARMS[side][pose] || ARMS[side].down; }

function fillP(ctx, x, y, w, h, paint) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      ctx.fillStyle = paint(x + i, y + j);
      ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
}

// Draws one character frame. `s` describes outfit, colours, pose and extras.
export function drawPerson(s) {
  const [c, ctx] = makeCanvas(SW, SH);
  const b = s.b || 0;
  const r = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };
  const P = { ctx, r, fill: (x, y, w, h, paint) => fillP(ctx, x, y, w, h, paint), b };
  const skin = s.skin || '#f2c9a7', skinD = s.skinD || '#d9a285';

  if (s.back) s.back(P);
  // back hair
  if (s.hair && s.hair.style === 'long') r(9, 6 + b, 14, 22, s.hair.dark);

  // legs
  if (!s.noLegs) {
    const pants = s.pants || solid('#8c7a48');
    fillP(ctx, 10, 37, 12, 11, pants);
    fillP(ctx, 10, 48, 5, 8, pants);
    fillP(ctx, 17, 48, 5, 8, pants);
    if (s.pantsDetail) s.pantsDetail(P);
    r(9, 56, 6, 3, s.shoes || '#242428'); r(17, 56, 6, 3, s.shoes || '#242428');
    r(9, 56, 6, 1, s.shoesL || '#45454d'); r(17, 56, 6, 1, s.shoesL || '#45454d');
  }

  // torso
  const top = s.top || solid('#17141f');
  fillP(ctx, 10, 18 + b, 12, 1, top);
  fillP(ctx, 9, 19 + b, 14, 18 - b, top);
  if (s.coat) { // long coat over the legs
    fillP(ctx, 9, 37, 14, 15, s.coat);
    r(15, 40, 2, 12, s.coatSplit || '#000000');
  }
  if (s.topDetail) s.topDetail(P);

  if (s.mid) s.mid(P); // props held against the body (guitars)

  // head
  if (!s.noHead) {
    r(14, 16 + b, 4, 3, skinD);
    r(11, 6 + b, 10, 9, skin);
    r(12, 15 + b, 8, 2, skin);
    if (s.face !== 'none') {
      const look = s.lookDown ? 1 : 0;
      r(12, 9 + b, 3, 1, s.brow || '#3e2817'); r(17, 9 + b, 3, 1, s.brow || '#3e2817');
      if (s.blink) { r(13, 10 + b + look, 2, 1, skinD); r(17, 10 + b + look, 2, 1, skinD); }
      else {
        r(13, 10 + b + look, 2, 1, s.eye || '#2a1d14'); r(17, 10 + b + look, 2, 1, s.eye || '#2a1d14');
        if (!look) { r(13, 11 + b, 2, 1, skinD); r(17, 11 + b, 2, 1, skinD); }
      }
      r(15, 11 + b, 1, 2, skinD); r(16, 12 + b, 1, 1, skinD);
      if (s.face === 'beard') {
        const bd = s.beard || '#4f3420';
        r(11, 11 + b, 1, 4, bd); r(20, 11 + b, 1, 4, bd);
        r(13, 13 + b, 6, 1, bd);
        r(14, 14 + b, 4, 1, s.lip || '#b8806a');
        r(12, 14 + b, 2, 2, bd); r(18, 14 + b, 2, 2, bd);
        r(13, 15 + b, 6, 2, bd); r(14, 17 + b, 4, 1, bd);
        r(15, 15 + b, 2, 1, s.beardL || '#6b4a2e');
      } else {
        r(14, 14 + b, 4, 1, s.lip || '#b8806a');
      }
    }
    if (s.faceDetail) s.faceDetail(P);
  }

  // hair
  const h = s.hair;
  if (h && h.style !== 'none') {
    r(12, 3 + b, 8, 1, h.color); r(11, 4 + b, 10, 1, h.color); r(10, 5 + b, 12, 2, h.color);
    r(10, 7 + b, 2, 1, h.color); r(20, 7 + b, 2, 1, h.color);
    if (h.part) r(15, 4 + b, 1, 3, h.dark);
    r(13, 4 + b, 2, 1, h.light); r(17, 4 + b, 2, 1, h.light);
    if (h.style === 'long') {
      const sw = s.sway || 0;
      r(9, 7 + b, 3, 19, h.color); r(20, 7 + b, 3, 19, h.color);
      r(10, 8 + b, 1, 16, h.light); r(21, 8 + b, 1, 16, h.light);
      r(11, 12 + b, 1, 10, h.dark); r(20, 12 + b, 1, 10, h.dark);
      r(9 + sw, 26 + b, 3, 3, h.color); r(10 + sw, 29 + b, 2, 2, h.color);
      r(20 + sw, 26 + b, 3, 3, h.color); r(20 + sw, 29 + b, 2, 2, h.color);
      r(10 + sw, 26 + b, 1, 3, h.light);
    } else if (h.style === 'short') {
      r(10, 7 + b, 1, 3, h.color); r(21, 7 + b, 1, 3, h.color);
    }
  }
  if (s.headwear) s.headwear(P);

  // arms (drawn last so poses cross in front of hair and body)
  for (const side of ['L', 'R']) {
    const pose = armRects(side, (side === 'L' ? s.armL : s.armR) || 'down');
    const sleeve = s.sleeve || top;
    for (const [x, y, w, hh] of pose.upper) fillP(ctx, x, y + b, w, hh, sleeve);
    for (const [x, y, w, hh] of pose.fore) fillP(ctx, x, y + b, w, hh, s.forearm || sleeve);
    if (s.cuff) { const [x, y, w, hh] = pose.cuff; r(x, y + b, w, hh, s.cuff); }
    const [wx, wy, ww, wh] = pose.wrist;
    if (s.bracelets && side === (s.braceletSide || 'L')) {
      for (let i = 0; i < Math.max(ww, wh); i++) r(wx + (ww > 1 ? i : 0), wy + b + (wh > 1 ? i : 0), 1, 1, s.bracelets[i % s.bracelets.length]);
    } else r(wx, wy + b, ww, wh, s.wristColor || (s.forearm ? s.forearm(0, 0) : sleeve(0, 0)));
    const [hx, hy, hw, hh] = pose.hand;
    r(hx, hy + b, hw, hh, s.hand || skin);
    if (pose.fingers) for (const [fx, fy, fw, fh] of pose.fingers) r(fx, fy + b, fw, fh, s.hand || skin);
    if (side === 'R' && s.armRProp) s.armRProp(P, pose);
    if (side === 'L' && s.armLProp) s.armLProp(P, pose);
  }
  if (s.front) s.front(P);

  outline(ctx);
  if (s.glow) s.glow(P); // unoutlined effects (glows, sparks)
  return c;
}

export function outline(ctx, col = OUTLINE) {
  const img = ctx.getImageData(0, 0, SW, SH);
  const a = (x, y) => (x < 0 || y < 0 || x >= SW || y >= SH ? 0 : img.data[(y * SW + x) * 4 + 3]);
  ctx.fillStyle = col;
  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      if (a(x, y)) continue;
      if (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1)) ctx.fillRect(x, y, 1, 1);
    }
  }
}
