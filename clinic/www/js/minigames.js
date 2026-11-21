// Treatment mini-games. Each one draws into the 160x100 exam view and reports a score 0..1.
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
function frame(ctx, env, g, dim = 0.45) {
  ctx.putImageData(env.bg, 0, 0);
  ctx.fillStyle = `rgba(6,8,14,${dim})`; ctx.fillRect(0, 0, W, H);
}
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

/* ---------- remove the object ---------- */
function extract(env) {
  const path = [[84, 64], [110, 68], [126, 50], [100, 38], [124, 24], [156, 14]], half = 6.5, r = 3;
  const g = { time: 0, limit: 30, p: [84, 64], drag: false, hits: 0, cool: 0, flash: 0, title: 'Drag it out' };
  const nearest = (x, y) => { let best = null; for (let i = 1; i < path.length; i++) { const s = distToSeg(x, y, ...path[i - 1], ...path[i]); s.i = i; if (!best || s.d < best.d) best = s; } return best; };
  g.update = (dt) => { g.time += dt; g.cool = Math.max(0, g.cool - dt); g.flash = Math.max(0, g.flash - dt); if (g.time >= g.limit) g.finish(0.25); };
  g.pointer = (type, x, y) => {
    if (type === 'down' && dist(x, y, ...g.p) < 12 && g.cool <= 0) g.drag = true;
    if (type === 'up') g.drag = false;
    if (type === 'move' && g.drag) {
      const steps = Math.ceil(dist(x, y, ...g.p) / 1.5);
      for (let s = 0; s < steps; s++) {
        const nx = g.p[0] + (x - g.p[0]) / (steps - s), ny = g.p[1] + (y - g.p[1]) / (steps - s);
        const n = nearest(nx, ny);
        if (n.d > half - r) { g.hits++; g.cool = 0.5; g.flash = 0.3; g.drag = false; g.p = [n.x, n.y]; env.sfx('squelch'); env.buzz(40); break; }
        g.p = [nx, ny];
      }
      if (dist(...g.p, ...path[path.length - 1]) < 7) g.finish(clamp(1 - g.hits * 0.2));
    }
  };
  g.draw = (ctx) => {
    frame(ctx, env, g, 0.2);
    ctx.fillStyle = rgba(mix(env.body, [20, 10, 20], 0.55), 0.85); ctx.fillRect(0, 0, W, H);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = css(mix(env.body, [0, 0, 0], 0.7)); ctx.lineWidth = half * 2 + 3; ctx.beginPath(); path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    ctx.strokeStyle = css(g.flash > 0 ? [230, 90, 90] : mix(env.body, WHITE, 0.25)); ctx.lineWidth = half * 2; ctx.stroke();
    ctx.fillStyle = css(env.th.accent); ctx.fillRect(150, 8, 9, 12);
    drawObject(px(ctx), env.obj || 'sock', g.p[0], g.p[1], env.th.fabric, env.th.paper);
    if (!g.drag) { ctx.strokeStyle = css(WHITE); ctx.lineWidth = 1; ctx.strokeRect(Math.round(g.p[0]) - 6.5, Math.round(g.p[1]) - 7.5, 13, 14); }
    timerBar(ctx, g, env.th); banner(ctx, g.hits ? `OUCH X${g.hits}` : 'DRAG IT OUT', env.th);
  };
  return g;
}

/* ---------- give a pill ---------- */
function pill(env) {
  const g = { time: 0, limit: 25, ph: 0, speed: 2.4, throws: [], succ: 0, miss: 0, title: 'Throw the pill' };
  const open = () => Math.max(0, Math.sin(g.ph));
  g.update = (dt) => {
    g.time += dt; g.ph += dt * g.speed;
    if (Math.sin(g.ph) < -0.95) g.speed = 1.8 + hash(Math.floor(g.ph), 3) * 2.6;
    for (const p of g.throws) {
      if (p.done) continue; p.t += dt;
      if (!p.judged && p.t >= 0.42) { p.judged = true; if (open() > 0.5) { p.ok = true; g.succ++; env.sfx('pop'); } else { p.ok = false; g.miss++; env.sfx('thud'); env.buzz(30); } }
      if (p.t > 0.9) p.done = true;
    }
    if (g.succ >= 2 && g.throws.every((p) => p.done)) g.finish(clamp(1 - g.miss * 0.2, 0.2, 1));
    else if (g.time >= g.limit || (g.throws.length >= 6 && g.throws.every((p) => p.done))) g.finish(0.25 * g.succ);
  };
  g.pointer = (type) => { if (type === 'down' && g.throws.filter((p) => !p.done).length < 1 && g.throws.length < 6) { g.throws.push({ t: 0 }); env.sfx('tap'); } };
  g.draw = (ctx) => {
    ctx.fillStyle = css(mix(env.th.wall, [0, 0, 0], 0.45)); ctx.fillRect(0, 0, W, H);
    const c = env.body, cx = 80, cy = 48;
    for (let y = -40; y <= 40; y++) for (let x = -56; x <= 56; x++) { const d = x * x / 3136 + y * y / 1600; if (d < 1) { const lv = 0.55 + 0.45 * (-x * 0.006 - y * 0.012 + 0.6 * Math.sqrt(1 - d)); ctx.fillStyle = css(mix(mix(c, [0, 0, 0], 0.5), mix(c, WHITE, 0.25), clamp(lv))); ctx.fillRect(cx + x, cy + y, 1, 1); } }
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
    timerBar(ctx, g, env.th);
    say(ctx, `${g.succ}/2`, 4, 6, WHITE);
    banner(ctx, 'TAP WHEN OPEN', env.th);
  };
  return g;
}

/* ---------- calm and play ---------- */
function calm(env) {
  const beats = []; let tb = 1.4;
  for (let i = 0; i < 8; i++) { beats.push({ t: tb, res: 0 }); tb += 0.75 + hash(i, 9) * 0.35; }
  const g = { time: 0, limit: tb + 0.8, good: 0, extra: 0, pulse: 0, title: 'Calm and play' };
  g.update = (dt) => {
    g.time += dt; g.pulse = Math.max(0, g.pulse - dt * 3);
    for (const b of beats) if (!b.res && g.time > b.t + 0.22) { b.res = -1; env.sfx('thud'); }
    if (g.time >= g.limit) g.finish(clamp(g.good / 8 - g.extra * 0.04));
  };
  g.pointer = (type) => {
    if (type !== 'down') return;
    const b = beats.find((bb) => !bb.res && Math.abs(g.time - bb.t) < 0.22);
    if (b) { b.res = 1; g.good++; g.pulse = 1; env.sfx('heart'); env.buzz(15); } else { g.extra++; env.sfx('tap'); }
  };
  g.draw = (ctx) => {
    frame(ctx, env, g, 0.55);
    const cx = 80, cy = 50, calmK = g.good / 8;
    ctx.strokeStyle = css(mix(env.th.accent, WHITE, 0.3)); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 7); ctx.stroke();
    for (const b of beats) {
      if (b.res) continue; const dt = b.t - g.time; if (dt > 1.1 || dt < -0.25) continue;
      const r = 12 + dt * 38; ctx.strokeStyle = css(Math.abs(dt) < 0.22 ? [130, 240, 160] : WHITE); ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, r), 0, 7); ctx.stroke();
    }
    heart(ctx, cx, cy, mix([230, 80, 90], [255, 170, 180], g.pulse), 2);
    beats.forEach((b, i) => { ctx.fillStyle = b.res > 0 ? '#7fe89a' : b.res < 0 ? '#e85050' : 'rgba(255,255,255,.35)'; ctx.fillRect(48 + i * 8, 86, 5, 3); });
    ctx.fillStyle = css(mix([230, 80, 80], [120, 220, 140], calmK)); ctx.fillRect(4, 8, 4, Math.round(70 * (1 - calmK)) + 2);
    timerBar(ctx, g, env.th); banner(ctx, 'TAP ON THE BEAT', env.th);
  };
  return g;
}

/* ---------- seal the crack ---------- */
function stitch(env) {
  const raw = [[34, 54], [48, 44], [62, 58], [76, 46], [90, 60], [104, 46], [126, 54]], pts = resample(raw, 2);
  const g = { time: 0, limit: 20, i: 0, tracing: false, slips: 0, cool: 0, title: 'Seal the crack' };
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
    ctx.fillStyle = css(mix(env.body, [0, 0, 0], 0.15)); ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 2) for (let x = (y >> 1) & 1; x < W; x += 3) if (hash(x, y, 5) > 0.8) { ctx.fillStyle = css(mix(env.body, [0, 0, 0], 0.35)); ctx.fillRect(x, y, 1, 1); }
    ctx.strokeStyle = '#2a1820'; ctx.lineWidth = 2; ctx.beginPath(); raw.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    ctx.fillStyle = css(env.th.accent);
    for (let k = 0; k <= g.i; k += 3) { const [x, y] = pts[k]; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 1); ctx.fillRect(Math.round(x), Math.round(y) - 3, 1, 5); }
    const [sx, sy] = pts[g.i]; ctx.fillStyle = '#5ef08a'; ctx.fillRect(Math.round(sx) - 2, Math.round(sy) - 2, 5, 5);
    const [ex, ey] = pts[pts.length - 1]; ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(ex) - 1, Math.round(ey) - 1, 3, 3);
    timerBar(ctx, g, env.th); banner(ctx, g.slips ? `SLIPS X${g.slips}` : 'TRACE THE CRACK', env.th);
  };
  return g;
}

/* ---------- pick them off (sparks or mites) ---------- */
function zap(env) {
  const pts = env.points && env.points.length ? env.points : [[80, 50]], total = 12, isMite = env.ail !== 'overcharge';
  const g = { time: 0, limit: total * 0.55 + 3, targets: [], spawned: 0, hits: 0, title: 'Pick them off' };
  g.update = (dt) => {
    g.time += dt;
    if (g.spawned < total && g.time > 0.6 + g.spawned * 0.55) { const p = pts[Math.floor(hash(g.spawned, 77) * pts.length)]; g.targets.push({ x: p[0], y: p[1], t: 0, res: 0 }); g.spawned++; }
    for (const tg of g.targets) { tg.t += dt; if (!tg.res && tg.t > 1.4) tg.res = -1; }
    if (g.spawned >= total && g.targets.every((tg) => tg.res)) g.finish(g.hits / total);
    else if (g.time >= g.limit) g.finish(g.hits / total);
  };
  g.pointer = (type, x, y) => {
    if (type !== 'down') return;
    let best = null; for (const tg of g.targets) if (!tg.res && dist(x, y, tg.x, tg.y) < 9 && (!best || dist(x, y, tg.x, tg.y) < dist(x, y, best.x, best.y))) best = tg;
    if (best) { best.res = 1; g.hits++; env.sfx(isMite ? 'pop' : 'zap'); env.buzz(10); }
  };
  g.draw = (ctx) => {
    frame(ctx, env, g, 0.35);
    for (const tg of g.targets) {
      if (tg.res) continue;
      const k = 1 - tg.t / 1.4, x = Math.round(tg.x + (isMite ? Math.sin(tg.t * 9) * 2 : 0)), y = Math.round(tg.y + (isMite ? Math.cos(tg.t * 7) : 0));
      ctx.strokeStyle = rgba(env.th.accent, 0.5 * k); ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, 6, 0, 7); ctx.stroke();
      if (isMite) { ctx.fillStyle = '#24161a'; ctx.fillRect(x - 1, y - 1, 3, 2); ctx.fillStyle = '#5a3028'; ctx.fillRect(x - 2, y, 1, 1); ctx.fillRect(x + 2, y, 1, 1); ctx.fillRect(x - 2, y - 2, 1, 1); ctx.fillRect(x + 2, y - 2, 1, 1); }
      else { const f = Math.floor(g.time * 14) & 1; ctx.fillStyle = f ? '#fff' : css(mix(env.th.key, WHITE, 0.5)); ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x, y - 2, 1, 5); if (f) { ctx.fillRect(x - 1, y - 1, 1, 1); ctx.fillRect(x + 1, y + 1, 1, 1); } }
    }
    timerBar(ctx, g, env.th); say(ctx, `${g.hits}/${total}`, 4, 6, WHITE); banner(ctx, isMite ? 'TAP THE MITES' : 'TAP THE SPARKS', env.th);
  };
  return g;
}

/* ---------- dry the roots ---------- */
function scrub(env) {
  const cols = 15, rows = 8, x0 = 35, y0 = 34, cw = 6, ch = 6, wet = new Float32Array(cols * rows).fill(1);
  for (let i = 0; i < wet.length; i++) wet[i] = 0.75 + hash(i, 4) * 0.25;
  const g = { time: 0, limit: 15, down: false, last: null, title: 'Dry the roots' };
  const dryFrac = () => wet.reduce((a, w) => a + (w < 0.15 ? 1 : 0), 0) / wet.length;
  g.update = (dt) => { g.time += dt; if (dryFrac() >= 0.92) g.finish(clamp(1 - Math.max(0, g.time - 8) * 0.05, 0.5, 1)); else if (g.time >= g.limit) g.finish(dryFrac() * 0.8); };
  g.pointer = (type, x, y) => {
    if (type === 'down') { g.down = true; g.last = [x, y]; }
    if (type === 'up') g.down = false;
    if (type === 'move' && g.down) {
      const m = g.last ? dist(x, y, ...g.last) : 0; g.last = [x, y];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const cx = x0 + i * cw + 3, cy = y0 + j * ch + 3; if (dist(x, y, cx, cy) < 10) wet[j * cols + i] = Math.max(0, wet[j * cols + i] - 0.02 * m); }
      if (Math.random() < 0.15) env.sfx('page');
    }
  };
  g.draw = (ctx) => {
    ctx.fillStyle = '#2a1c16'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#c4684a'; ctx.fillRect(28, 26, 104, 4); ctx.fillRect(28, 84, 104, 4);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const w = wet[j * cols + i], x = x0 + i * cw, y = y0 + j * ch;
      ctx.fillStyle = css(mix([120, 84, 56], [40, 50, 78], w)); ctx.fillRect(x, y, cw, ch);
      if (hash(i, j, 2) > 0.5) { ctx.fillStyle = css(mix([226, 206, 160], [70, 70, 90], w)); ctx.fillRect(x + 2, y + (i & 3), 1, 3); }
      if (w > 0.5 && hash(i, j, Math.floor(g.time * 3)) > 0.85) { ctx.fillStyle = '#8fb8ff'; ctx.fillRect(x + 3, y + 3, 1, 1); }
    }
    timerBar(ctx, g, env.th); say(ctx, `${Math.round(dryFrac() * 100)}%`, 4, 6, WHITE); banner(ctx, 'RUB TO DRY', env.th);
  };
  return g;
}

const MAKERS = { extract, pill, calm, stitch, zap, scrub };
export function makeMinigame(kind, env) {
  const g = MAKERS[kind](env);
  g.done = false; g.score = 0; g.after = 0;
  g.finish = (s) => { if (g.done) return; g.done = true; g.score = clamp(s); env.sfx(g.score >= 0.5 ? 'good' : 'bad'); };
  const base = g.draw;
  g.draw = (ctx) => {
    base(ctx);
    if (g.done) {
      const s = g.score >= 0.85 ? 'GREAT!' : g.score >= 0.5 ? 'GOOD' : g.score >= 0.3 ? 'SHAKY' : 'POOR';
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 40, W, 16);
      say(ctx, s, Math.round((W - textWidth(s)) / 2), 45, g.score >= 0.5 ? [140, 240, 160] : [240, 120, 110]);
    }
  };
  return g;
}
