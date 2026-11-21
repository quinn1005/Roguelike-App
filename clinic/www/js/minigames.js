// Treatment mini-games (and a few test and brewing games). Each draws into the 160x100
// view and reports a score 0..1. env.hard makes them tougher; env.bonus makes them easier.
import { clamp, mix, css, rgba, hash, WHITE, text, textWidth } from './util.js';
import { drawObject } from './exam.js';

const W = 160, H = 100;
const px = (ctx) => ({ set(x, y, c) { ctx.fillStyle = css(c); ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1); } });
const say = (ctx, s, x, y, c) => text(px(ctx), s, x, y, c);
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
function distToSeg(x, y, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, t = l2 ? clamp(((x - ax) * dx + (y - ay) * dy) / l2) : 0;
  return { d: Math.hypot(x - (ax + dx * t), y - (ay + dy * t)), x: ax + dx * t, y: ay + dy * t, t };
}
function resample(pts, step) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 1; k <= n; k++) out.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n]);
  }
  return out;
}
function heart(ctx, x, y, c, s = 1) {
  const rows = ['01100110', '11111111', '11111111', '01111110', '00111100', '00011000'];
  ctx.fillStyle = css(c);
  rows.forEach((r, j) => { for (let i = 0; i < 8; i++) if (r[i] === '1') ctx.fillRect(Math.round(x - 4 * s + i * s), Math.round(y - 3 * s + j * s), s, s); });
}
function frame(ctx, env, dim = 0.45) { if (env.bg) ctx.putImageData(env.bg, 0, 0); else { ctx.fillStyle = '#101418'; ctx.fillRect(0, 0, W, H); } ctx.fillStyle = `rgba(6,8,14,${dim})`; ctx.fillRect(0, 0, W, H); }
function timerBar(ctx, g, th) {
  const k = clamp(1 - g.time / g.limit);
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, 3);
  ctx.fillStyle = css(k > 0.3 ? th.accent : [230, 80, 70]); ctx.fillRect(0, 0, Math.round(W * k), 2);
}
function banner(ctx, s, th) {
  const w = textWidth(s) + 6, x = Math.round((W - w) / 2);
  ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(x, H - 11, w, 9);
  say(ctx, s, x + 3, H - 9, mix(th.accent, WHITE, 0.3));
}

/* ---------- remove the object (tongs or surgery) ---------- */
function extract(env) {
  const easy = [[84, 64], [110, 68], [126, 50], [100, 38], [124, 24], [156, 14]];
  const hardP = [[84, 64], [108, 72], [128, 62], [112, 50], [90, 44], [104, 30], [128, 36], [140, 20], [156, 12]];
  const path = env.hard ? hardP : easy, half = env.hard ? 5.2 : 6.5, r = 3;
  const g = { time: 0, limit: env.hard ? 40 : 30, p: [...path[0]], drag: false, hits: 0, cool: 0, flash: 0 };
  const nearest = (x, y) => { let best = null; for (let i = 1; i < path.length; i++) { const s = distToSeg(x, y, ...path[i - 1], ...path[i]); if (!best || s.d < best.d) best = s; } return best; };
  g.update = (dt) => { g.time += dt; g.cool = Math.max(0, g.cool - dt); g.flash = Math.max(0, g.flash - dt); if (g.time >= g.limit) g.finish(0.25); };
  // Relative dragging, like a trackpad: put your finger anywhere and the object moves by
  // however far your finger moves, so your finger never covers the object or the path.
  g.pointer = (type, x, y) => {
    if (type === 'down' && g.cool <= 0) { g.drag = true; g.last = [x, y]; }
    if (type === 'up') g.drag = false;
    if (type === 'move' && g.drag) {
      const tx = clamp(g.p[0] + (x - g.last[0]), 0, W), ty = clamp(g.p[1] + (y - g.last[1]), 0, H);
      g.last = [x, y];
      const steps = Math.ceil(dist(tx, ty, ...g.p) / 1.5);
      for (let s = 0; s < steps; s++) {
        const nx = g.p[0] + (tx - g.p[0]) / (steps - s), ny = g.p[1] + (ty - g.p[1]) / (steps - s);
        const n = nearest(nx, ny);
        if (n.d > half - r) { g.hits++; g.cool = 0.5; g.flash = 0.3; g.drag = false; g.p = [n.x, n.y]; env.sfx('squelch'); env.buzz(40); break; }
        g.p = [nx, ny];
      }
      if (dist(...g.p, ...path[path.length - 1]) < 7) g.finish(clamp(1 - g.hits * (env.hard ? 0.15 : 0.2)));
    }
  };
  g.draw = (ctx) => {
    frame(ctx, env, 0.2);
    ctx.fillStyle = rgba(mix(env.body, [20, 10, 20], 0.55), 0.85); ctx.fillRect(0, 0, W, H);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = css(mix(env.body, [0, 0, 0], 0.7)); ctx.lineWidth = half * 2 + 3; ctx.beginPath(); path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    ctx.strokeStyle = css(g.flash > 0 ? [230, 90, 90] : mix(env.body, WHITE, 0.25)); ctx.lineWidth = half * 2; ctx.stroke();
    ctx.fillStyle = css(env.th.accent); ctx.fillRect(150, 6, 9, 12);
    drawObject(px(ctx), env.obj || 'sock', g.p[0], g.p[1], env.obj === 'hairball' ? [200, 190, 170] : env.obj === 'pin' ? [245, 245, 250] : env.th.fabric, env.obj === 'pin' ? [220, 60, 60] : env.th.paper);
    // a bright ring so the object is easy to keep track of, and an arrow showing the way out
    ctx.strokeStyle = css(g.drag ? env.th.accent : WHITE); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(Math.round(g.p[0]) + 0.5, Math.round(g.p[1]) + 0.5, 9 + (g.drag ? 0 : Math.sin(g.time * 6)), 0, 7); ctx.stroke();
    const [ex, ey] = path[path.length - 1]; ctx.fillStyle = css(WHITE); ctx.beginPath(); ctx.moveTo(ex + 2, ey); ctx.lineTo(ex - 5, ey - 4); ctx.lineTo(ex - 5, ey + 4); ctx.fill();
    timerBar(ctx, g, env.th); banner(ctx, g.hits ? `OUCH X${g.hits}` : g.drag ? (env.hard ? 'CAREFUL...' : 'TO THE ARROW') : 'DRAG ANYWHERE', env.th);
  };
  return g;
}

/* ---------- give a pill ---------- */
function pill(env) {
  const need = env.hard ? 3 : 2;
  const g = { time: 0, limit: 25, ph: 0, speed: 2.4, throws: [], succ: 0, miss: 0 };
  const open = () => Math.max(0, Math.sin(g.ph));
  g.update = (dt) => {
    g.time += dt; g.ph += dt * g.speed;
    if (Math.sin(g.ph) < -0.95) g.speed = 1.8 + hash(Math.floor(g.ph), 3) * (env.hard ? 3.4 : 2.6);
    for (const p of g.throws) {
      if (p.done) continue; p.t += dt;
      if (!p.judged && p.t >= 0.42) { p.judged = true; if (open() > (env.bonus ? 0.35 : 0.5)) { p.ok = true; g.succ++; env.sfx('pop'); } else { p.ok = false; g.miss++; env.sfx('thud'); env.buzz(30); } }
      if (p.t > 0.9) p.done = true;
    }
    if (g.succ >= need && g.throws.every((p) => p.done)) g.finish(clamp(1 - g.miss * 0.2, 0.2, 1));
    else if (g.time >= g.limit || (g.throws.length >= need + 4 && g.throws.every((p) => p.done))) g.finish(0.25 * g.succ / need * 2);
  };
  g.pointer = (type) => { if (type === 'down' && !g.throws.some((p) => !p.done) && g.throws.length < need + 4) { g.throws.push({ t: 0 }); env.sfx('tap'); } };
  g.draw = (ctx) => {
    ctx.fillStyle = css(mix(env.th.wall, [0, 0, 0], 0.45)); ctx.fillRect(0, 0, W, H);
    const c = env.body, cx = 80, cy = 48;
    for (let y = -40; y <= 40; y++) for (let x = -56; x <= 56; x++) { const d = x * x / 3136 + y * y / 1600; if (d < 1) { const lv = 0.55 + 0.45 * (-x * 0.006 - y * 0.012 + 0.6 * Math.sqrt(1 - d)); ctx.fillStyle = css(mix(mix(c, [0, 0, 0], 0.5), mix(c, WHITE, 0.25), clamp(Math.round(lv * 4) / 4))); ctx.fillRect(cx + x, cy + y, 1, 1); } }
    for (const s of [-1, 1]) { ctx.fillStyle = '#140c1a'; ctx.fillRect(cx + s * 18 - 3, cy - 14, 7, 9); ctx.fillStyle = '#fff'; ctx.fillRect(cx + s * 18 - 2, cy - 13, 2, 2); }
    const o = open(), mh = Math.round(2 + o * 14);
    ctx.fillStyle = '#2a0f1a'; ctx.fillRect(cx - 12, cy + 12 - mh / 2, 24, mh);
    ctx.fillStyle = '#d0506a'; if (mh > 6) ctx.fillRect(cx - 6, cy + 10 + mh / 2 - 3, 12, 3);
    for (const p of g.throws) {
      if (p.done) continue;
      let x, y;
      if (p.t < 0.42) { const k = p.t / 0.42; x = 80; y = 94 - k * 32 - Math.sin(k * Math.PI) * 18; }
      else if (p.ok) { x = 80; y = 62 + (p.t - 0.42) * 30; if (p.t > 0.55) continue; }
      else { const k = (p.t - 0.42) / 0.5; x = 80 + k * 50; y = 62 + k * k * 40 - Math.sin(k * Math.PI) * 10; }
      ctx.fillStyle = '#f4f0e8'; ctx.fillRect(Math.round(x) - 3, Math.round(y) - 1, 6, 3); ctx.fillStyle = css(env.th.accent); ctx.fillRect(Math.round(x), Math.round(y) - 1, 3, 3);
    }
    if (!g.throws.some((p) => !p.done)) { ctx.fillStyle = '#f4f0e8'; ctx.fillRect(77, 93, 6, 3); ctx.fillStyle = css(env.th.accent); ctx.fillRect(80, 93, 3, 3); }
    timerBar(ctx, g, env.th); say(ctx, `${g.succ}/${need}`, 4, 6, WHITE); banner(ctx, 'TAP WHEN OPEN', env.th);
  };
  return g;
}

/* ---------- calm and play ---------- */
function calm(env) {
  const beats = [], n = env.hard ? 10 : 8, gap = env.hard ? 0.62 : 0.75, win = env.bonus ? 0.3 : 0.22; let tb = 1.4;
  for (let i = 0; i < n; i++) { beats.push({ t: tb, res: 0 }); tb += gap + hash(i, 9) * 0.35; }
  const g = { time: 0, limit: tb + 0.8, good: 0, extra: 0, pulse: 0, beats };
  g.update = (dt) => {
    g.time += dt; g.pulse = Math.max(0, g.pulse - dt * 3);
    for (const b of beats) if (!b.res && g.time > b.t + win) { b.res = -1; env.sfx('thud'); }
    if (g.time >= g.limit) g.finish(clamp(g.good / n - g.extra * 0.04));
  };
  g.pointer = (type) => {
    if (type !== 'down') return;
    const b = beats.find((bb) => !bb.res && Math.abs(g.time - bb.t) < win);
    if (b) { b.res = 1; g.good++; g.pulse = 1; env.sfx('heart'); env.buzz(15); } else { g.extra++; env.sfx('tap'); }
  };
  g.draw = (ctx) => {
    frame(ctx, env, env.dark ? 0.85 : 0.55);
    const cx = 80, cy = 50, calmK = g.good / n;
    ctx.strokeStyle = css(mix(env.th.accent, WHITE, 0.3)); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 7); ctx.stroke();
    for (const b of beats) {
      if (b.res) continue; const dt = b.t - g.time; if (dt > 1.1 || dt < -0.25) continue;
      const r = 12 + dt * 38; ctx.strokeStyle = css(Math.abs(dt) < win ? [130, 240, 160] : WHITE); ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, r), 0, 7); ctx.stroke();
    }
    heart(ctx, cx, cy, mix([230, 80, 90], [255, 170, 180], g.pulse), 2);
    beats.forEach((b, i) => { ctx.fillStyle = b.res > 0 ? '#7fe89a' : b.res < 0 ? '#e85050' : 'rgba(255,255,255,.35)'; ctx.fillRect(80 - n * 4 + i * 8, 86, 5, 3); });
    ctx.fillStyle = css(mix([230, 80, 80], [120, 220, 140], calmK)); ctx.fillRect(4, 8, 4, Math.round(70 * (1 - calmK)) + 2);
    timerBar(ctx, g, env.th); banner(ctx, 'TAP ON THE BEAT', env.th);
  };
  return g;
}

/* ---------- trace a line: patch, trim, peel, sew a shadow back on ---------- */
function trace(env) {
  let raw;
  if (env.variant === 'shadow') { raw = []; for (let a = 0; a <= 26; a++) { const t = a / 26 * Math.PI * 1.7 + 0.6; raw.push([80 + Math.cos(t) * 34, 50 + Math.sin(t) * 26]); } }
  else if (env.variant === 'peel') { raw = []; for (let a = 0; a <= 20; a++) { const x = 40 + a * 4; raw.push([x, 50 + ((a & 1) ? -5 : 5)]); } }
  else raw = env.hard ? [[24, 54], [36, 42], [48, 58], [60, 40], [72, 60], [84, 44], [96, 60], [108, 42], [120, 58], [136, 48]] : [[34, 54], [48, 44], [62, 58], [76, 46], [90, 60], [104, 46], [126, 54]];
  const pts = resample(raw, 2);
  const g = { time: 0, limit: env.hard ? 24 : 20, i: 0, tracing: false, slips: 0, cool: 0 };
  g.update = (dt) => { g.time += dt; g.cool = Math.max(0, g.cool - dt); if (g.time >= g.limit) g.finish(0.35 * g.i / pts.length); };
  g.pointer = (type, x, y) => {
    if (type === 'down' && dist(x, y, ...pts[g.i]) < 10) g.tracing = true;
    if (type === 'up') g.tracing = false;
    if (type === 'move' && g.tracing) {
      while (g.i < pts.length - 1 && dist(x, y, ...pts[g.i + 1]) < 7) g.i++;
      if (dist(x, y, ...pts[g.i]) > 11 && g.cool <= 0) { g.slips++; g.cool = 0.4; g.tracing = false; env.sfx('thud'); env.buzz(30); }
      if (g.i >= pts.length - 1) g.finish(clamp(1 - g.slips * 0.15 - Math.max(0, g.time - 9) * 0.04, 0.2, 1));
    }
  };
  g.draw = (ctx) => {
    if (env.variant === 'shadow') { frame(ctx, env, 0.6); }
    else {
      ctx.fillStyle = css(mix(env.body, [0, 0, 0], 0.15)); ctx.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += 2) for (let x = (y >> 1) & 1; x < W; x += 3) if (hash(x, y, 5) > 0.8) { ctx.fillStyle = css(mix(env.body, [0, 0, 0], 0.35)); ctx.fillRect(x, y, 1, 1); }
    }
    ctx.strokeStyle = env.variant === 'shadow' ? '#b48cff' : '#2a1820'; ctx.lineWidth = 2; ctx.setLineDash(env.variant === 'shadow' ? [2, 2] : []);
    ctx.beginPath(); raw.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = css(env.th.accent);
    for (let k = 0; k <= g.i; k += 3) { const [x, y] = pts[k]; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 1); ctx.fillRect(Math.round(x), Math.round(y) - 3, 1, 5); }
    const [sx, sy] = pts[g.i]; ctx.fillStyle = '#5ef08a'; ctx.fillRect(Math.round(sx) - 2, Math.round(sy) - 2, 5, 5);
    const [ex, ey] = pts[pts.length - 1]; ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(ex) - 1, Math.round(ey) - 1, 3, 3);
    timerBar(ctx, g, env.th); banner(ctx, g.slips ? `SLIPS X${g.slips}` : env.variant === 'shadow' ? 'SEW IT BACK ON' : env.variant === 'peel' ? 'PEEL GENTLY' : 'TRACE THE LINE', env.th);
  };
  return g;
}

/* ---------- pick them off: sparks, mites, or one hot spot ---------- */
function zap(env) {
  const pts = env.points && env.points.length ? env.points : [[80, 50]], total = env.hard ? 15 : 12, isMite = env.kind === 'mites';
  const life = env.bonus ? 1.9 : 1.4, gap = env.hard ? 0.45 : 0.55, spot = env.hotspot;
  const g = { time: 0, limit: total * gap + 3, targets: [], spawned: 0, hits: 0 };
  g.update = (dt) => {
    g.time += dt;
    if (g.spawned < total && g.time > 0.6 + g.spawned * gap) {
      let p = pts[Math.floor(hash(g.spawned, 77) * pts.length)];
      if (spot) p = [spot[0] + (hash(g.spawned, 5) - 0.5) * 18, spot[1] + (hash(g.spawned, 6) - 0.5) * 14];
      g.targets.push({ x: p[0], y: p[1], t: 0, res: 0 }); g.spawned++;
    }
    for (const tg of g.targets) { tg.t += dt; if (!tg.res && tg.t > life) tg.res = -1; }
    if (g.spawned >= total && g.targets.every((tg) => tg.res)) g.finish(g.hits / total);
    else if (g.time >= g.limit) g.finish(g.hits / total);
  };
  g.pointer = (type, x, y) => {
    if (type !== 'down') return;
    let best = null; for (const tg of g.targets) if (!tg.res && dist(x, y, tg.x, tg.y) < 9 && (!best || dist(x, y, tg.x, tg.y) < dist(x, y, best.x, best.y))) best = tg;
    if (best) { best.res = 1; g.hits++; env.sfx(isMite ? 'pop' : 'zap'); env.buzz(10); }
  };
  g.draw = (ctx) => {
    frame(ctx, env, 0.35);
    if (spot) { ctx.strokeStyle = rgba([255, 90, 80], 0.5 + 0.3 * Math.sin(g.time * 8)); ctx.beginPath(); ctx.arc(spot[0], spot[1], 12, 0, 7); ctx.stroke(); }
    for (const tg of g.targets) {
      if (tg.res) continue;
      const k = 1 - tg.t / life, x = Math.round(tg.x + (isMite ? Math.sin(tg.t * 9) * 2 : 0)), y = Math.round(tg.y + (isMite ? Math.cos(tg.t * 7) : 0));
      ctx.strokeStyle = rgba(env.th.accent, 0.5 * k); ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, 6, 0, 7); ctx.stroke();
      if (isMite) { ctx.fillStyle = '#24161a'; ctx.fillRect(x - 1, y - 1, 3, 2); ctx.fillStyle = '#5a3028'; ctx.fillRect(x - 2, y, 1, 1); ctx.fillRect(x + 2, y, 1, 1); ctx.fillRect(x - 2, y - 2, 1, 1); ctx.fillRect(x + 2, y - 2, 1, 1); }
      else { const f = Math.floor(g.time * 14) & 1; ctx.fillStyle = f ? '#fff' : css(mix(env.th.key, WHITE, 0.5)); ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x, y - 2, 1, 5); if (f) { ctx.fillRect(x - 1, y - 1, 1, 1); ctx.fillRect(x + 1, y + 1, 1, 1); } }
    }
    timerBar(ctx, g, env.th); say(ctx, `${g.hits}/${total}`, 4, 6, WHITE); banner(ctx, isMite ? 'TAP THE MITES' : 'TAP THE SPARKS', env.th);
  };
  return g;
}

/* ---------- rub: dry roots, soak a dried-out patient, brush off old scales ---------- */
function rub(env) {
  const mode = env.variant || 'dry';
  const cols = 15, rows = 8, x0 = 35, y0 = 34, cw = 6, ch = 6, v = new Float32Array(cols * rows);
  for (let i = 0; i < v.length; i++) v[i] = 0.75 + hash(i, 4) * 0.25;
  const rate = (env.bonus ? 0.04 : 0.02) * (env.hard ? 0.75 : 1);
  const g = { time: 0, limit: env.hard ? 18 : 15, down: false, last: null };
  const doneFrac = () => v.reduce((a, w) => a + (w < 0.15 ? 1 : 0), 0) / v.length;
  g.update = (dt) => { g.time += dt; if (doneFrac() >= 0.92) g.finish(clamp(1 - Math.max(0, g.time - 8) * 0.05, 0.5, 1)); else if (g.time >= g.limit) g.finish(doneFrac() * 0.8); };
  g.pointer = (type, x, y) => {
    if (type === 'down') { g.down = true; g.last = [x, y]; }
    if (type === 'up') g.down = false;
    if (type === 'move' && g.down) {
      const m = g.last ? dist(x, y, ...g.last) : 0; g.last = [x, y];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const cx = x0 + i * cw + 3, cy = y0 + j * ch + 3; if (dist(x, y, cx, cy) < 10) v[j * cols + i] = Math.max(0, v[j * cols + i] - rate * m); }
      if (Math.random() < 0.15) env.sfx('page');
    }
  };
  const look = {
    dry: { bg: '#2a1c16', done: [120, 84, 56], undone: [40, 50, 78], fleck: [226, 206, 160], label: 'RUB TO DRY' },
    wet: { bg: '#1c2a24', done: mix(env.body, WHITE, 0.15), undone: [150, 140, 110], fleck: [255, 255, 255], label: 'RUB TO SOAK' },
    brush: { bg: '#1f1a24', done: [236, 226, 200], undone: [120, 110, 100], fleck: [200, 190, 170], label: 'BRUSH IT OFF' },
  }[mode];
  g.draw = (ctx) => {
    ctx.fillStyle = look.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#c4684a'; if (mode === 'dry') { ctx.fillRect(28, 26, 104, 4); ctx.fillRect(28, 84, 104, 4); }
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const w = v[j * cols + i], x = x0 + i * cw, y = y0 + j * ch;
      ctx.fillStyle = css(mix(look.done, look.undone, w)); ctx.fillRect(x, y, cw, ch);
      if (hash(i, j, 2) > 0.5) { ctx.fillStyle = css(mix(look.fleck, look.undone, w)); ctx.fillRect(x + 2, y + (i & 3), 1, 3); }
      if (mode === 'dry' && w > 0.5 && hash(i, j, Math.floor(g.time * 3)) > 0.85) { ctx.fillStyle = '#8fb8ff'; ctx.fillRect(x + 3, y + 3, 1, 1); }
    }
    timerBar(ctx, g, env.th); say(ctx, `${Math.round(doneFrac() * 100)}%`, 4, 6, WHITE); banner(ctx, look.label, env.th);
  };
  return g;
}

/* ---------- brewing: keep the heat in the right band ---------- */
function brew(env) {
  const band = env.method === 'steep' ? [0.25, 0.45] : env.method === 'simmer' ? [0.65, 0.85] : null;
  const g = { time: 0, limit: 8, heat: 0, hold: false, inBand: 0, beats: 0, good: 0, next: 0.8 };
  g.update = (dt) => {
    g.time += dt;
    if (band) { g.heat = clamp(g.heat + (g.hold ? 0.55 : -0.35) * dt); if (g.heat >= band[0] && g.heat <= band[1]) g.inBand += dt; }
    else if (g.time > g.next + 0.3) { g.next += 0.8; g.beats++; }
    if (g.time >= g.limit) g.finish(band ? clamp(g.inBand / (g.limit - 1.2)) : clamp(g.good / 9));
  };
  g.pointer = (type) => {
    if (band) { if (type === 'down') g.hold = true; if (type === 'up') g.hold = false; return; }
    if (type === 'down') { if (Math.abs(g.time - g.next) < 0.18) { g.good++; g.next += 0.8; env.sfx('tap'); } else env.sfx('thud'); }
  };
  g.draw = (ctx) => {
    ctx.fillStyle = '#1a1420'; ctx.fillRect(0, 0, W, H);
    // the pot
    ctx.fillStyle = '#5a4a60'; ctx.fillRect(54, 46, 52, 36); ctx.fillStyle = '#7a6880'; ctx.fillRect(50, 44, 60, 4);
    const liquid = mix([120, 200, 140], [255, 170, 90], g.heat);
    ctx.fillStyle = css(liquid); ctx.fillRect(56, 48, 48, 6);
    for (let k = 0; k < 6; k++) if ((g.time * 3 + k) % 1 < g.heat) { ctx.fillStyle = '#fff'; ctx.fillRect(58 + k * 8, 46 - ((g.time * 10 + k * 3) % 8), 2, 2); }
    // flame
    const fl = band ? g.heat : 0.4;
    for (let k = 0; k < 8; k++) { ctx.fillStyle = css(mix([255, 200, 80], [255, 80, 40], hash(k, Math.floor(g.time * 10)))); ctx.fillRect(60 + k * 5, 86 - Math.round(fl * 6 * hash(k, Math.floor(g.time * 8), 3)), 3, 2 + Math.round(fl * 4)); }
    if (band) {
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(130, 10, 10, 80);
      ctx.fillStyle = 'rgba(120,240,150,.5)'; ctx.fillRect(130, 90 - band[1] * 80, 10, (band[1] - band[0]) * 80);
      ctx.fillStyle = css(env.th.accent); ctx.fillRect(127, Math.round(90 - g.heat * 80), 16, 2);
    } else {
      const ph = (g.time - g.next + 0.8) / 0.8; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(80, 30, Math.max(1, 4 + (1 - ph) * 14), 0, 7); ctx.stroke();
      ctx.strokeStyle = css(env.th.accent); ctx.beginPath(); ctx.arc(80, 30, 4, 0, 7); ctx.stroke();
    }
    timerBar(ctx, g, env.th); banner(ctx, band ? 'HOLD TO HEAT' : 'TAP TO GRIND', env.th);
  };
  return g;
}

/* ---------- counting breaths (a test, not a treatment) ---------- */
function breath(env) {
  const g = { time: 0, limit: 10, taps: 0, flash: 0 };
  g.update = (dt) => { g.time += dt; g.flash = Math.max(0, g.flash - dt * 4); if (g.time >= g.limit) g.finish(1); };
  g.pointer = (type) => { if (type === 'down') { g.taps++; g.flash = 1; env.sfx('tap'); } };
  g.draw = (ctx) => {
    ctx.fillStyle = '#20242a'; ctx.fillRect(0, 0, W, H);
    const k = Math.sin(2 * Math.PI * g.time * env.rate / 60), r = 26 + k * 3;
    ctx.fillStyle = css(mix([150, 120, 92], [190, 160, 130], (k + 1) / 2));
    ctx.beginPath(); ctx.ellipse(80, 56, r * 1.3, r, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#ece2cc'; ctx.beginPath(); ctx.ellipse(80, 40, r * 0.9, 8, 0, 0, 7); ctx.fill();
    if (g.flash > 0) { ctx.fillStyle = rgba([255, 255, 255], g.flash * 0.3); ctx.fillRect(0, 0, W, H); }
    timerBar(ctx, g, env.th); say(ctx, `${g.taps}`, 4, 6, WHITE); banner(ctx, 'TAP EACH BREATH IN', env.th);
  };
  return g;
}

const MAKERS = { extract, surgery: (e) => extract({ ...e, hard: true }), pill, calm, stitch: trace, trim: (e) => trace({ ...e, variant: 'trim' }), peel: (e) => trace({ ...e, variant: 'peel' }),
  zap, hotspot: zap, dry: (e) => rub({ ...e, variant: 'dry' }), wet: (e) => rub({ ...e, variant: 'wet' }), brush: (e) => rub({ ...e, variant: 'brush' }), brew, breath };
export function makeMinigame(kind, env) {
  const g = MAKERS[kind](env);
  g.done = false; g.score = 0; g.kind = kind;
  g.finish = (s) => { if (g.done) return; g.done = true; g.score = clamp(s); if (kind !== 'breath') env.sfx(g.score >= 0.5 ? 'good' : 'bad'); };
  const base = g.draw;
  g.draw = (ctx) => {
    base(ctx);
    if (g.done && kind !== 'breath') {
      const s = g.score >= 0.85 ? 'GREAT!' : g.score >= 0.5 ? 'GOOD' : g.score >= 0.3 ? 'SHAKY' : 'POOR';
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 40, W, 16);
      say(ctx, s, Math.round((W - textWidth(s)) / 2), 45, g.score >= 0.5 ? [140, 240, 160] : [240, 120, 110]);
    }
  };
  return g;
}
