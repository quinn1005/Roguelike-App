// "Made by Quinn" badge: a hand-placed 32x64 pixel sprite of the developer,
// waving, with a breathing bob, hair sway and blink. Drawn in code like the
// rest of the game's art.

import { makeCanvas } from './sprites.js';

const C = {
  hair: '#5e3f26', hairD: '#3e2817', hairL: '#8a643e',
  skin: '#f2c9a7', skinD: '#d9a285', lip: '#b8806a',
  beard: '#4f3420', beardL: '#6b4a2e', eye: '#2a1d14',
  shirt: '#17141f', shirtL: '#2c2739',
  pur: '#8b5cf6', purD: '#5b3aa8', purL: '#c4a8ff', lime: '#b5e35a', white: '#f4f0ff',
  pants: '#8c7a48', pantsD: '#6a5b33', pantsL: '#a8955e',
  shoe: '#242428', shoeL: '#45454d',
  red: '#c0392b', teal: '#2f9e9e', band: '#6b4a2e',
  outline: '#0b0710',
};

const W = 32, H = 64;

function drawFrame(f) {
  const [c, ctx] = makeCanvas(W, H);
  const r = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };
  const b = f % 2;            // breathing bob for the upper body
  const sway = f === 1 || f === 2 ? 1 : 0;
  const blink = f === 3;
  const waveUp = f % 2 === 0;

  // ---- back hair (behind the body) ----
  r(9, 6 + b, 14, 22, C.hairD);

  // ---- legs: khaki cargo pants ----
  r(10, 37, 12, 11, C.pants);
  r(10, 48, 5, 8, C.pants); r(17, 48, 5, 8, C.pants);
  r(10, 37, 12, 1, C.pantsD);                      // waistband
  r(15, 41, 2, 7, C.pantsD);                       // fly / inner shade
  r(10, 44, 2, 5, C.pantsD); r(20, 44, 2, 5, C.pantsD); // cargo pockets
  r(10, 44, 2, 1, C.pantsL); r(20, 44, 2, 1, C.pantsL);
  r(12, 49, 1, 6, C.pantsL); r(19, 49, 1, 6, C.pantsL); // creases
  // shoes
  r(9, 56, 6, 3, C.shoe); r(17, 56, 6, 3, C.shoe);
  r(9, 56, 6, 1, C.shoeL); r(17, 56, 6, 1, C.shoeL);

  // ---- torso: black long-sleeve tee ----
  r(10, 18 + b, 12, 1, C.shirt);
  r(9, 19 + b, 14, 18 - b, C.shirt);
  r(9, 19 + b, 1, 18 - b, C.shirtL);
  // lime lettering across the chest
  for (let x = 12; x <= 19; x += 2) r(x, 20 + b, 1, 1, C.lime);
  for (let x = 13; x <= 19; x += 3) r(x, 21 + b, 1, 1, C.lime);
  // purple monster graphic
  const g = 22 + b;
  r(14, g, 4, 1, C.pur);
  r(13, g + 1, 6, 1, C.pur);
  r(12, g + 2, 8, 4, C.pur);
  r(12, g + 2, 8, 1, C.purL);
  r(13, g + 3, 2, 1, C.white); r(17, g + 3, 2, 1, C.white);   // eyes
  r(14, g + 4, 1, 1, C.white); r(17, g + 4, 1, 1, C.white);
  r(13, g + 5, 6, 1, C.purD);                                    // mouth
  r(13, g + 5, 1, 1, C.white); r(15, g + 5, 1, 1, C.white); r(17, g + 5, 1, 1, C.white);
  r(11, g + 6, 10, 5, C.purD);                                   // body
  r(12, g + 6, 3, 2, C.pur); r(17, g + 6, 3, 2, C.pur);          // shoulders
  r(16, g + 6, 1, 3, C.lime);                                    // tongue
  r(12, g + 9, 2, 2, C.pur); r(18, g + 9, 2, 2, C.pur);

  // ---- left arm (viewer's left): hangs down with bracelets ----
  r(7, 19 + b, 2, 15, C.shirt);
  r(7, 19 + b, 1, 15, C.shirtL);
  r(7, 34 + b, 2, 1, C.band);
  r(7, 35 + b, 1, 1, C.red); r(8, 35 + b, 1, 1, C.teal);
  r(7, 36 + b, 2, 3, C.skin); r(8, 38 + b, 1, 1, C.skinD);

  // ---- right arm (viewer's right): waving ----
  r(22, 19 + b, 4, 3, C.shirt);                // upper arm out to the side
  if (waveUp) {
    r(24, 12 + b, 3, 8, C.shirt);              // forearm straight up
    r(24, 12 + b, 1, 8, C.shirtL);
    r(24, 11 + b, 3, 1, C.red); r(25, 11 + b, 1, 1, C.teal);
    r(24, 7 + b, 3, 4, C.skin);                // hand
    r(24, 6 + b, 3, 1, C.skin); r(25, 6 + b, 1, 1, C.skinD); r(27, 8 + b, 1, 2, C.skin); // fingers + thumb
    r(25, 9 + b, 1, 1, C.skinD);
  } else {
    r(25, 15 + b, 3, 5, C.shirt);              // forearm tilted outward
    r(26, 12 + b, 3, 4, C.shirt);
    r(26, 11 + b, 3, 1, C.red); r(27, 11 + b, 1, 1, C.teal);
    r(27, 7 + b, 3, 4, C.skin);
    r(27, 6 + b, 3, 1, C.skin); r(28, 6 + b, 1, 1, C.skinD); r(26, 9 + b, 1, 2, C.skin);
    r(28, 9 + b, 1, 1, C.skinD);
  }

  // ---- head ----
  r(14, 16 + b, 4, 3, C.skinD);                // neck
  r(11, 6 + b, 10, 9, C.skin);                 // face
  r(12, 15 + b, 8, 2, C.skin);                 // jaw
  // brows + eyes (looking slightly down)
  r(12, 9 + b, 3, 1, C.hairD); r(17, 9 + b, 3, 1, C.hairD);
  if (blink) { r(13, 10 + b, 2, 1, C.skinD); r(17, 10 + b, 2, 1, C.skinD); }
  else { r(13, 10 + b, 2, 1, C.eye); r(17, 10 + b, 2, 1, C.eye); r(13, 11 + b, 2, 1, C.skinD); r(17, 11 + b, 2, 1, C.skinD); }
  // nose
  r(15, 11 + b, 1, 2, C.skinD); r(16, 12 + b, 1, 1, C.skinD);
  // beard + mustache
  r(11, 11 + b, 1, 4, C.beard); r(20, 11 + b, 1, 4, C.beard);   // sideburns
  r(13, 13 + b, 6, 1, C.beard);                                  // mustache
  r(14, 14 + b, 4, 1, C.lip);                                    // mouth
  r(12, 14 + b, 2, 2, C.beard); r(18, 14 + b, 2, 2, C.beard);
  r(13, 15 + b, 6, 2, C.beard);                                  // chin
  r(14, 17 + b, 4, 1, C.beard);
  r(15, 15 + b, 2, 1, C.beardL);

  // ---- hair: centre part, long and straight past the shoulders ----
  r(12, 3 + b, 8, 1, C.hair);
  r(11, 4 + b, 10, 1, C.hair);
  r(10, 5 + b, 12, 2, C.hair);
  r(10, 7 + b, 2, 1, C.hair); r(20, 7 + b, 2, 1, C.hair);
  r(15, 4 + b, 1, 3, C.hairD);                 // centre part
  r(13, 4 + b, 2, 1, C.hairL); r(17, 4 + b, 2, 1, C.hairL);
  // strands framing the face and falling over the chest
  r(9, 7 + b, 3, 19, C.hair); r(20, 7 + b, 3, 19, C.hair);
  r(10, 8 + b, 1, 16, C.hairL); r(21, 8 + b, 1, 16, C.hairL);
  r(11, 12 + b, 1, 10, C.hairD); r(20, 12 + b, 1, 10, C.hairD);
  // tips sway
  r(9 + sway, 26 + b, 3, 3, C.hair); r(10 + sway, 29 + b, 2, 2, C.hair);
  r(20 + sway, 26 + b, 3, 3, C.hair); r(20 + sway, 29 + b, 2, 2, C.hair);
  r(10 + sway, 26 + b, 1, 3, C.hairL);

  // ---- automatic 1px outline around the silhouette ----
  const img = ctx.getImageData(0, 0, W, H);
  const a = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : img.data[(y * W + x) * 4 + 3]);
  ctx.fillStyle = C.outline;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (a(x, y)) continue;
      if (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1)) ctx.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

let frames = null;
export function quinnFrames() {
  if (!frames) frames = [0, 1, 2, 3].map(drawFrame);
  return frames;
}

// Builds the animated badge element for the main menu.
export function quinnBadge() {
  const wrap = document.createElement('div');
  wrap.className = 'quinn';
  const [cv, ctx] = makeCanvas(W, H);
  cv.className = 'px';
  const label = document.createElement('div');
  label.className = 'quinn-label';
  label.innerHTML = 'MADE BY<br><span>QUINN</span>';
  wrap.append(cv, label);
  const fr = quinnFrames();
  const seq = [0, 1, 2, 1, 0, 1, 2, 3]; // frame 3 blinks once per cycle
  let i = 0;
  const tick = () => {
    if (!wrap.isConnected && i > 0) return;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(fr[seq[i % seq.length]], 0, 0);
    i++;
    setTimeout(tick, seq[(i - 1) % seq.length] === 3 ? 160 : 320);
  };
  tick();
  return wrap;
}
