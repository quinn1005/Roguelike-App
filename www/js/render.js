// Renders the world into a low-resolution buffer which is then scaled up with
// nearest-neighbour filtering, so everything (even effects) stays pixelated.

import { TS, T, SECTORS, makeCanvas, glow, towerSprites, enemySprite, coreArt, rgba, shade } from './sprites.js';
import { CS, CPX, World } from './world.js';
import { SIDE_DIR } from './util.js';
import { DTYPE_COLOR, ELITE_MODS, VETERANCY, RELIC_BY_ID } from './defs.js';

const FONT = '8px "PressStart", monospace';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    [this.buf, this.b] = makeCanvas(10, 10);
    this.cam = { x: 56, y: 56, zoom: 1 };
    this.stars = [];
    for (let i = 0; i < 160; i++) this.stars.push({ x: Math.random(), y: Math.random(), d: 0.05 + Math.random() * 0.25, c: Math.random() < 0.15 ? '#ff3df2' : Math.random() < 0.3 ? '#2ef2ff' : '#8a9ad8', t: Math.random() * 6 });
    this.routeCache = null;
    [this.gcv, this.gctx] = makeCanvas(10, 10);
    this.gctx.imageSmoothingEnabled = true;
    // Bloom needs canvas filters; skip it on WebViews that ignore them.
    this.gctx.filter = 'blur(1px)';
    this.bloomOk = this.gctx.filter === 'blur(1px)';
    this.gctx.filter = 'none';
    this.resize();
  }

  // Soft, dithered nebula clouds drawn once per resize (low res for a pixel look).
  makeNebula() {
    const W = Math.ceil((this.bw + 160) / 3), H = Math.ceil((this.bh + 160) / 3);
    const [c, ctx] = makeCanvas(W, H);
    const cols = ['#ff3df2', '#2ef2ff', '#a466ff', '#3d7bff', '#ff3df2'];
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 9; i++) {
      const x = rnd() * W, y = rnd() * H, r = (0.25 + rnd() * 0.35) * Math.max(W, H);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(cols[i % cols.length], 0.16));
      g.addColorStop(1, rgba(cols[i % cols.length], 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    const img = ctx.getImageData(0, 0, W, H), d = img.data;
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const th = (bayer[(y % 4) * 4 + (x % 4)] / 16) * 24;
        d[i + 3] = Math.floor((d[i + 3] + th) / 24) * 24;
      }
    }
    ctx.putImageData(img, 0, 0);
    this.nebula = c;
  }

  drawNebula(px, py) {
    if (!this.nebula) return;
    const b = this.b;
    const W = this.nebula.width * 3, H = this.nebula.height * 3;
    const x = -((px % 160) + 160) % 160, y = -((py % 160) + 160) % 160;
    b.drawImage(this.nebula, Math.round(x), Math.round(y), W, H);
  }

  // Synthwave horizon behind the menus.
  drawMenuBg(time) {
    const b = this.b, W = this.bw, H = this.bh;
    const hz = Math.round(H * 0.64);
    // sun
    const cx = Math.round(W * 0.5), r = Math.round(H * 0.22);
    for (let y = -r; y <= 0; y++) {
      const t = (y + r) / r;
      if (y > -r * 0.55 && Math.floor((y + time * 6) / 3) % 3 === 0) continue;
      const w = Math.round(Math.sqrt(r * r - y * y));
      b.fillStyle = t < 0.5 ? '#ffd23f' : t < 0.75 ? '#ff8a1f' : '#ff3df2';
      b.globalAlpha = 0.55;
      b.fillRect(cx - w, hz + y, w * 2, 1);
    }
    b.globalAlpha = 1;
    // ground
    b.fillStyle = '#07051a'; b.fillRect(0, hz, W, H - hz);
    b.fillStyle = '#ff3df2'; b.fillRect(0, hz, W, 1);
    b.globalAlpha = 0.25; b.fillRect(0, hz - 1, W, 1); b.globalAlpha = 1;
    // receding horizontal lines
    const n = 10;
    for (let k = 0; k < n; k++) {
      const f = ((k + (time * 0.6) % 1) / n);
      const y = hz + Math.round((H - hz) * f * f);
      b.globalAlpha = 0.15 + 0.6 * f;
      b.fillStyle = '#ff3df2';
      b.fillRect(0, y, W, 1);
    }
    // converging vertical lines
    for (let i = -14; i <= 14; i++) {
      b.globalAlpha = 0.45 - Math.abs(i) * 0.02;
      this.pixLine(cx + i * 6, hz, cx + i * 70, H, '#c02fd8');
    }
    b.globalAlpha = 1;
  }

  bloom() {
    if (!this.bloomOk) return;
    const g = this.gctx, gw = this.gcv.width, gh = this.gcv.height;
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, gw, gh);
    g.filter = 'brightness(0.85) contrast(2.6) blur(2px)';
    g.drawImage(this.buf, 0, 0, gw, gh);
    g.filter = 'none';
    const b = this.b;
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.globalCompositeOperation = 'lighter';
    b.globalAlpha = 0.5;
    b.imageSmoothingEnabled = true;
    b.drawImage(this.gcv, 0, 0, this.bw, this.bh);
    b.imageSmoothingEnabled = false;
    b.globalAlpha = 1;
    b.globalCompositeOperation = 'source-over';
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(window.innerWidth * dpr), h = Math.floor(window.innerHeight * dpr);
    this.canvas.width = w; this.canvas.height = h;
    this.ps = Math.max(1, Math.round(h / 250));
    this.bw = Math.ceil(w / this.ps); this.bh = Math.ceil(h / this.ps);
    this.buf.width = this.bw; this.buf.height = this.bh;
    this.b.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.dpr = dpr;
    this.gcv.width = Math.ceil(this.bw / 2); this.gcv.height = Math.ceil(this.bh / 2);
    this.gctx.imageSmoothingEnabled = true;
    this.makeNebula();
  }

  screenToWorld(cx, cy) {
    const bx = (cx * this.dpr) / this.ps, by = (cy * this.dpr) / this.ps;
    return [(bx - this.bw / 2) / this.cam.zoom + this.cam.x, (by - this.bh / 2) / this.cam.zoom + this.cam.y];
  }

  // CSS pixels per world pixel (for input thresholds)
  get cssScale() { return (this.ps * this.cam.zoom) / this.dpr; }

  clampCam(world) {
    const m = 48;
    const minX = world.minCx * CPX - m, maxX = (world.maxCx + 1) * CPX + m;
    const minY = world.minCy * CPX - m, maxY = (world.maxCy + 1) * CPX + m;
    this.cam.x = Math.max(minX, Math.min(maxX, this.cam.x));
    this.cam.y = Math.max(minY, Math.min(maxY, this.cam.y));
  }

  draw(run, view) {
    const b = this.b, cam = this.cam, z = cam.zoom;
    const time = performance.now() / 1000;
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.globalAlpha = 1;
    b.globalCompositeOperation = 'source-over';
    b.fillStyle = '#04040c';
    b.fillRect(0, 0, this.bw, this.bh);
    this.drawNebula(cam.x * 0.15, cam.y * 0.15);
    this.drawStars(time);
    if (!run) {
      this.drawMenuBg(time);
      if (view && view.glowOn) this.bloom();
      this.blit();
      return;
    }

    let sx = 0, sy = 0;
    if (run.shake > 0 && view.shakeOn) { sx = (Math.random() - 0.5) * run.shake; sy = (Math.random() - 0.5) * run.shake; }
    const ox = Math.round(this.bw / 2 - cam.x * z + sx), oy = Math.round(this.bh / 2 - cam.y * z + sy);
    b.setTransform(z, 0, 0, z, ox, oy);
    this.ox = ox; this.oy = oy;

    const world = run.world;
    // chunks + platform undersides
    for (const ch of world.chunks.values()) {
      const x = ch.cx * CPX, y = ch.cy * CPX;
      if (!world.get(ch.cx, ch.cy + 1)) {
        const shades = ['#1c1a3c', '#16142f', '#110f26', '#0d0b1e', '#0a0918', '#070612'];
        for (let k = 0; k < shades.length; k++) { b.fillStyle = shades[k]; b.fillRect(x + (k > 3 ? 2 : 0), y + CPX + k, CPX - (k > 3 ? 4 : 0), 1); }
        const sec = SECTORS[ch.sector % SECTORS.length];
        for (let k = 0; k < 3; k++) {
          const lx = x + 18 + k * 38;
          b.fillStyle = (Math.floor(time * 2 + k + ch.cx) % 3 === 0) ? sec.accent : shade(sec.accent, -0.6);
          b.fillRect(lx, y + CPX + 2, 2, 1);
        }
      }
      b.drawImage(world.chunkCanvas(ch), x, y);
      const sec2 = SECTORS[ch.sector % SECTORS.length];
      b.fillStyle = shade(sec2.grid, 0.45);
      if (!world.get(ch.cx, ch.cy - 1)) b.fillRect(x, y, CPX, 1);
      if (!world.get(ch.cx - 1, ch.cy)) b.fillRect(x, y, 1, CPX);
      b.fillStyle = shade(sec2.grid, -0.4);
      if (!world.get(ch.cx + 1, ch.cy)) b.fillRect(x + CPX - 1, y, 1, CPX);
    }
    this.drawTileAnims(run, time);
    this.drawFlow(run, time);
    this.drawPortals(run, time);
    this.drawCore(run, time);
    if (run.placing) this.drawSlots(run, time);
    if (view.relocate) this.drawRelocate(run, view, time);
    this.drawRaid(run, view, time);
    if (view.rock) {
      const rx = view.rock.x * TS, ry = view.rock.y * TS, sel = Math.floor(time * 4) % 2;
      b.fillStyle = '#ff8a1f';
      b.fillRect(rx - sel, ry - sel, 16 + sel * 2, 1); b.fillRect(rx - sel, ry + 15 + sel, 16 + sel * 2, 1);
      b.fillRect(rx - sel, ry - sel, 1, 16 + sel * 2); b.fillRect(rx + 15 + sel, ry - sel, 1, 16 + sel * 2);
    }

    // fields
    for (const f of run.fields) {
      b.globalAlpha = 0.25 + 0.15 * Math.sin(time * 20 + f.x);
      this.pixelDisc(f.x, f.y, f.r, '#ff5a1f');
      b.globalAlpha = 1;
    }

    for (const h of run.holes || []) this.drawHole(h, time);

    // range rings
    if (view.selected) this.dotCircle(view.selected.x, view.selected.y, view.selected.stats.range, view.selected.def.color, time);
    if (view.selected && view.selected.stats.minRange) this.dotCircle(view.selected.x, view.selected.y, view.selected.stats.minRange, '#ff2f5a', time);
    if (view.ghost) this.drawGhost(run, view.ghost, time);

    this.drawTowers(run, view, time);
    this.drawUnits(run, time);
    this.drawEnemies(run, time);
    this.drawProjectiles(run);
    this.drawFx(run, time);
    if (view.slashTrail) {
      const [ax, ay] = this.screenToWorld(view.slashTrail[0], view.slashTrail[1]);
      const [bx, by] = this.screenToWorld(view.slashTrail[2], view.slashTrail[3]);
      const n = Math.max(2, Math.floor(Math.hypot(bx - ax, by - ay) / 3));
      b.fillStyle = Math.floor(time * 12) % 2 ? '#ff3df2' : '#ffffff';
      for (let i = 0; i <= n; i++) b.fillRect(Math.round(ax + (bx - ax) * i / n), Math.round(ay + (by - ay) * i / n), 1, 1);
    }

    if (view.glowOn) this.bloom();
    // world-anchored text at buffer resolution
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.font = FONT;
    b.textAlign = 'center';
    b.textBaseline = 'middle';
    for (const t of run.fx.texts) {
      const [x, y] = this.toBuf(t.x, t.y);
      b.globalAlpha = Math.min(1, t.life / t.max * 2);
      b.fillStyle = '#000';
      b.fillText(t.text, Math.round(x) + 1, Math.round(y) + 1);
      b.fillStyle = t.color;
      b.fillText(t.text, Math.round(x), Math.round(y));
    }
    b.globalAlpha = 1;
    this.blit();
  }

  toBuf(wx, wy) { return [wx * this.cam.zoom + this.ox, wy * this.cam.zoom + this.oy]; }

  blit() {
    this.ctx.drawImage(this.buf, 0, 0, this.bw * this.ps, this.bh * this.ps);
  }

  drawStars(time) {
    const b = this.b;
    for (const s of this.stars) {
      const x = ((s.x * this.bw - this.cam.x * s.d) % this.bw + this.bw) % this.bw;
      const y = ((s.y * this.bh - this.cam.y * s.d) % this.bh + this.bh) % this.bh;
      const tw = Math.sin(time * 2 + s.t);
      b.fillStyle = s.c;
      b.globalAlpha = 0.3 + 0.35 * (tw + 1) * s.d * 3;
      b.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
    b.globalAlpha = 1;
  }

  glowAt(x, y, r, color, a = 1) {
    const g = glow(r, color);
    const b = this.b;
    const prev = b.globalCompositeOperation;
    b.globalCompositeOperation = 'lighter';
    b.globalAlpha = a;
    b.drawImage(g, Math.round(x - r), Math.round(y - r));
    b.globalAlpha = 1;
    b.globalCompositeOperation = prev;
  }

  dotCircle(x, y, r, color, time) {
    const b = this.b;
    b.fillStyle = color;
    const n = Math.max(12, Math.floor((r * 2 * Math.PI) / 4));
    const off = time * 0.5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + off;
      b.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 1, 1);
    }
    b.globalAlpha = 0.07;
    this.pixelDisc(x, y, r, color);
    b.globalAlpha = 1;
  }

  pixelDisc(x, y, r, color) {
    const b = this.b;
    b.fillStyle = color;
    b.beginPath();
    b.arc(x, y, r, 0, Math.PI * 2);
    b.fill();
  }

  ringOutline(x, y, r, color) {
    const b = this.b;
    b.fillStyle = color;
    const n = Math.max(10, Math.floor(r * 2 * Math.PI / 1.5));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      b.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 1, 1);
    }
  }

  drawTileAnims(run, time) {
    const b = this.b;
    for (const ch of run.world.chunks.values()) {
      const sec = SECTORS[ch.sector % SECTORS.length];
      for (let i = 0; i < ch.tiles.length; i++) {
        const t = ch.tiles[i];
        if (t !== T.NODE && t !== T.CACHE) continue;
        const x = (ch.cx * CS + (i % CS)) * TS, y = (ch.cy * CS + Math.floor(i / CS)) * TS;
        if (t === T.NODE) this.glowAt(x + 8, y + 8, 7, '#ffe84a', 0.5 + 0.4 * Math.sin(time * 3 + i));
        if (t === T.CACHE && Math.floor(time * 3 + i) % 2) { b.fillStyle = sec.accent; b.fillRect(x + 4, y + 7, 2, 1); this.glowAt(x + 8, y + 8, 6, '#ffe84a', 0.4); }
      }
    }
  }

  // Animated energy pellets flowing from portals toward the core.
  drawFlow(run, time) {
    const w = run.world;
    if (!this.routeCache || this.routeCache.portals !== w.portals) {
      const rng = () => 0;
      this.routeCache = { portals: w.portals, routes: w.portals.map((p) => w.route(p, rng)) };
    }
    const b = this.b;
    for (const r of this.routeCache.routes) {
      const len = r.length;
      for (let k = 0; k < len; k += 3) {
        const f = (time * 2.5 + k) % len;
        const i = Math.floor(f), t = f - i;
        if (i + 1 >= len) continue;
        const x = (r[i][0] + (r[i + 1][0] - r[i][0]) * t) * TS + 8;
        const y = (r[i][1] + (r[i + 1][1] - r[i][1]) * t) * TS + 8;
        const ch = w.get(Math.floor(r[i][0] / CS), Math.floor(r[i][1] / CS));
        const col = ch ? SECTORS[ch.sector % SECTORS.length].path : '#ff3df2';
        b.fillStyle = col;
        b.globalAlpha = 0.55;
        b.fillRect(Math.round(x) - 1, Math.round(y), 2, 1);
        b.fillRect(Math.round(x), Math.round(y) - 1, 1, 2);
      }
    }
    b.globalAlpha = 1;
  }

  drawPortals(run, time) {
    const b = this.b;
    for (const p of run.world.portals) {
      let x = p.tx * TS + 8, y = p.ty * TS + 8;
      if (p.side !== 'G') { x += SIDE_DIR[p.side][0] * 12; y += SIDE_DIR[p.side][1] * 12; }
      this.glowAt(x, y, 14, '#ff2f5a', 0.6 + 0.3 * Math.sin(time * 4));
      for (let k = 0; k < 10; k++) {
        const a = time * 3 + (k / 10) * Math.PI * 2;
        const r = 5 + Math.sin(time * 5 + k) * 1.5;
        b.fillStyle = k % 2 ? '#ff3df2' : '#ff2f5a';
        b.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.8), 1, 1);
      }
      b.fillStyle = '#ffffff';
      b.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    for (const s of run.world.sealed) {
      const x = s.tx * TS, y = s.ty * TS;
      b.fillStyle = '#5664a8';
      const [dx, dy] = SIDE_DIR[s.side];
      if (dx) b.fillRect(x + (dx > 0 ? 13 : 0), y + 1, 3, 14); else b.fillRect(x + 1, y + (dy > 0 ? 13 : 0), 14, 3);
      b.fillStyle = '#ffe84a';
      if (dx) b.fillRect(x + (dx > 0 ? 14 : 1), y + 7, 1, 2); else b.fillRect(x + 7, y + (dy > 0 ? 14 : 1), 2, 1);
    }
  }

  drawCore(run, time) {
    const b = this.b;
    const x = 3 * TS + 8, y = 3 * TS + 8;
    // The core thumps on every beat of the music, and turns magenta on a drop.
    const kick = run.beatPos != null ? Math.pow(1 - (run.beatPos % 1), 3) : 0;
    const pulse = 0.5 + 0.25 * Math.sin(time * 2.5) + 0.5 * kick;
    this.glowAt(x, y, 22 + Math.round(kick * 6), run.inDrop ? '#ff3df2' : run.breakdown ? '#ff2f5a' : '#2ef2ff', pulse);
    const bob = Math.round(Math.sin(time * 2) * 1);
    b.drawImage(coreArt(), x - 8, y - 9 + bob);
    // rotating segmented shield ring
    b.fillStyle = '#2ef2ff';
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2 + time * 0.8;
      if (i % 12 > 7) continue;
      b.globalAlpha = 0.35 + 0.25 * Math.sin(time * 3 + i);
      b.fillRect(Math.round(x + Math.cos(a) * 15), Math.round(y + Math.sin(a) * 15), 1, 1);
    }
    b.globalAlpha = 1;
    // hp arc
    const frac = run.coreHp / run.maxCore;
    const n = 24;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      b.fillStyle = i / n < frac ? (frac > 0.3 ? '#2ef2ff' : '#ff2f5a') : '#1a1f3a';
      b.fillRect(Math.round(x + Math.cos(a) * 11), Math.round(y + Math.sin(a) * 11), 1, 1);
    }
  }

  // Outlines chunks that can be rotated or swapped; the picked one pulses magenta.
  // Counter-raid markers: squad picks, the target portal, and the empty
  // tiles the squad will return to (faint ghosts of the absent towers).
  drawRaid(run, view, time) {
    const b = this.b;
    const blink = Math.floor(time * 6) % 2;
    const sel = view.raidSel;
    const target = sel ? sel.portal : run.raid;
    if (target) {
      const x = target.tx * TS + 8, y = target.ty * TS + 8;
      this.glowAt(x, y, 18, '#ff3df2', 0.5 + 0.3 * Math.sin(time * 6));
      this.dotCircle(x, y, 14, '#ff3df2', time * 3);
    }
    if (sel) for (const tw of sel.squad) {
      const x = tw.tx * TS, y = tw.ty * TS;
      b.fillStyle = blink ? '#ff3df2' : '#ffffff';
      for (const [dx, dy] of [[0, 0], [12, 0], [0, 12], [12, 12]]) { b.fillRect(x + dx, y + dy + (dy ? 3 : 0), 4, 1); b.fillRect(x + dx + (dx ? 3 : 0), y + dy, 1, 4); }
    }
    if (run.raid) for (const tw of run.raid.squad) {
      const sp = towerSprites(tw.def, tw.level, tw.branch);
      b.globalAlpha = 0.18 + 0.08 * Math.sin(time * 3 + tw.id);
      b.drawImage(sp.base, tw.tx * TS, tw.ty * TS);
      b.drawImage(sp.head, tw.tx * TS + 2, tw.ty * TS + 2);
      b.globalAlpha = 1;
      this.dotCircle(tw.tx * TS + 8, tw.ty * TS + 8, 8, '#ff3df2', time);
    }
  }

  drawRelocate(run, view, time) {
    const b = this.b;
    for (const ch of run.world.chunks.values()) {
      if (!run.canRelocate(ch)) continue;
      const x = ch.cx * CPX, y = ch.cy * CPX;
      const picked = view.relocate.first === ch;
      b.fillStyle = picked ? '#ff3df2' : '#2ef2ff';
      b.globalAlpha = picked ? 0.25 + 0.15 * Math.sin(time * 6) : 0.08;
      b.fillRect(x + 1, y + 1, CPX - 2, CPX - 2);
      b.globalAlpha = 1;
      for (let i = 0; i < CPX; i += 4) {
        b.fillRect(x + i, y, 2, 1); b.fillRect(x + i, y + CPX - 1, 2, 1);
        b.fillRect(x, y + i, 1, 2); b.fillRect(x + CPX - 1, y + i, 1, 2);
      }
    }
  }

  drawSlots(run, time) {
    const b = this.b;
    const seen = new Set();
    for (const p of run.world.portals) {
      if (p.side === 'G') continue;
      const ch = run.world.chunks.get(p.ck);
      const cx = ch.cx + SIDE_DIR[p.side][0], cy = ch.cy + SIDE_DIR[p.side][1];
      const k = cx + ',' + cy;
      if (seen.has(k)) continue;
      seen.add(k);
      const x = cx * CPX, y = cy * CPX;
      const a = 0.35 + 0.25 * Math.sin(time * 4);
      b.globalAlpha = a * 0.4;
      b.fillStyle = '#2ef2ff';
      b.fillRect(x + 2, y + 2, CPX - 4, CPX - 4);
      b.globalAlpha = 1;
      b.fillStyle = '#2ef2ff';
      for (let i = 0; i < CPX; i += 4) {
        b.fillRect(x + i, y, 2, 1); b.fillRect(x + i, y + CPX - 1, 2, 1);
        b.fillRect(x, y + i, 1, 2); b.fillRect(x + CPX - 1, y + i, 1, 2);
      }
      b.fillStyle = '#ffffff';
      b.fillRect(x + CPX / 2 - 6, y + CPX / 2 - 1, 12, 2);
      b.fillRect(x + CPX / 2 - 1, y + CPX / 2 - 6, 2, 12);
    }
  }

  drawGhost(run, g, time) {
    const b = this.b;
    const x = g.x * TS, y = g.y * TS;
    const ok = run.canBuild(g.x, g.y) && run.gold >= run.towerCost(g.type);
    const def = g.def;
    let range = def.range;
    if (run.world.tile(g.x, g.y) === T.HIGH) range *= 1.25;
    range *= 1 + run.mods.range;
    if (range) this.dotCircle(x + 8, y + 8, range, ok ? def.color : '#ff2f5a', time);
    const sp = towerSprites(def);
    b.globalAlpha = 0.65;
    b.drawImage(sp.base, x, y);
    b.drawImage(sp.head, x + 2, y + 2);
    b.globalAlpha = 1;
    b.fillStyle = ok ? '#4dff8a' : '#ff2f5a';
    b.fillRect(x, y, 3, 1); b.fillRect(x, y, 1, 3);
    b.fillRect(x + 13, y, 3, 1); b.fillRect(x + 15, y, 1, 3);
    b.fillRect(x, y + 15, 3, 1); b.fillRect(x, y + 13, 1, 3);
    b.fillRect(x + 13, y + 15, 3, 1); b.fillRect(x + 15, y + 13, 1, 3);
  }

  drawTowers(run, view, time) {
    const b = this.b;
    for (const tw of run.towers) {
      const sp = towerSprites(tw.def, tw.level, tw.branch, (run.skins && run.skins[tw.type]) || 'default');
      if (tw.level >= 3) this.glowAt(tw.tx * TS + 8, tw.ty * TS + 8, tw.level >= 4 ? 10 : 7, sp.color, tw.level >= 4 ? 0.45 + 0.15 * Math.sin(time * 3 + tw.id) : 0.25);
      if (run.inDrop && tw.def.dmg) this.glowAt(tw.tx * TS + 8, tw.ty * TS + 8, 11, '#ff3df2', 0.35 + 0.35 * Math.pow(1 - (run.beatPos % 1), 2));
      const x = tw.tx * TS, y = tw.ty * TS;
      const off = tw.disabled > 0 && Math.floor(time * 10) % 2;
      b.drawImage(sp.base, x, y);
      if (tw.def.rotates === false) {
        let bob = 0;
        if (tw.def.buff || tw.def.revive) bob = Math.round(Math.sin(time * 3 + tw.id) * 1);
        b.drawImage(sp.head, x + 2, y + 2 + bob);
      } else {
        const rec = (tw.recoil || 0);
        tw.recoil = Math.max(0, rec - 0.15);
        b.save();
        b.translate(x + 8, y + 8);
        b.rotate(Math.round(tw.angle / (Math.PI / 8)) * (Math.PI / 8));
        b.drawImage(sp.head, -6 - Math.round(rec * 2), -6);
        b.restore();
      }
      // level pips + branch mark
      if (!tw.branch) for (let l = 0; l < Math.min(3, tw.level); l++) { b.fillStyle = tw.level >= 3 ? '#ffffff' : tw.def.color; b.fillRect(x + 4 + l * 3, y + 14, 2, 1); }
      if (tw.branch) { b.fillStyle = sp.color; b.fillRect(x + 6, y + 14, 4, 1); b.fillStyle = '#ffffff'; b.fillRect(x + 7, y + 14, 2, 1); }
      if (tw.buffed) { b.fillStyle = '#a466ff'; b.fillRect(x + 1, y + 1, 1, 2); b.fillRect(x, y + 2, 3, 1); }
      if (off) { b.globalAlpha = 0.6; b.fillStyle = '#000'; b.fillRect(x + 1, y + 1, 14, 14); b.globalAlpha = 1; }
      if (tw.disabled > 0) { b.fillStyle = '#ffe84a'; b.fillRect(x + 7 + Math.round(Math.random() * 4 - 2), y + 2, 1, 3); }
      if (tw.vet) { // veterancy chevrons
        const v = VETERANCY[tw.vet - 1];
        b.fillStyle = '#000'; b.fillRect(x, y + 1, 4, tw.vet * 2 + 1);
        b.fillStyle = v.color;
        for (let k = 0; k < tw.vet; k++) { b.fillRect(x + 1, y + 2 + k * 2, 1, 1); b.fillRect(x + 2, y + 3 + k * 2, 1, 1); b.fillRect(x + 3, y + 2 + k * 2, 1, 1); }
      }
      if (tw.relic) { // relic gem
        const rc = RELIC_BY_ID[tw.relic].color;
        b.fillStyle = '#000'; b.fillRect(x + 11, y, 5, 5);
        b.fillStyle = rc; b.fillRect(x + 12, y + 1, 3, 3);
        b.fillStyle = '#ffffff'; b.fillRect(x + 12, y + 1, 1, 1);
      }
      // idle glows
      if (tw.type === 'tesla') this.glowAt(x + 8, y + 8, 7, '#ffe84a', 0.3 + 0.2 * Math.sin(time * 6 + tw.id));
      if (tw.def.income) this.glowAt(x + 8, y + 8, 6, '#ffd23f', 0.3);
      if (tw.def.fused) this.glowAt(x + 8, y + 8, 10, sp.color, 0.35 + 0.25 * Math.sin(time * 4 + tw.id));
      if (tw.def.buff) { this.glowAt(x + 8, y + 5, 6, '#a466ff', 0.5); this.ringOutline(x + 8, y + 8, 3 + ((time * 8 + tw.id) % 6), rgba('#a466ff', 0.5)); }
      if (tw.type === 'reclaimer') this.glowAt(x + 8, y + 8, 7, '#b6ff3d', 0.35);
      if (view.selected === tw) {
        b.fillStyle = '#ffffff';
        const s = Math.floor(time * 4) % 2;
        b.fillRect(x - s, y - s, 3, 1); b.fillRect(x - s, y - s, 1, 3);
        b.fillRect(x + 13 + s, y - s, 3, 1); b.fillRect(x + 15 + s, y - s, 1, 3);
        b.fillRect(x - s, y + 15 + s, 3, 1); b.fillRect(x - s, y + 13 + s, 1, 3);
        b.fillRect(x + 13 + s, y + 15 + s, 3, 1); b.fillRect(x + 15 + s, y + 13 + s, 1, 3);
      }
      // laser beams
      if (tw.beam && tw.beam.length) {
        for (const [e, mult, from] of tw.beam) {
          const sx2 = from ? from.x : tw.x + Math.cos(tw.angle) * 7, sy2 = from ? from.y : tw.y + Math.sin(tw.angle) * 7;
          const wdt = mult > 3 ? 2 : 1;
          b.strokeStyle = tw.def.color;
          b.globalAlpha = 0.5 + Math.random() * 0.3;
          b.lineWidth = wdt + 1;
          b.beginPath(); b.moveTo(sx2, sy2); b.lineTo(e.x, e.y); b.stroke();
          b.globalAlpha = 1;
          b.strokeStyle = '#ffffff'; b.lineWidth = 0.6;
          b.beginPath(); b.moveTo(sx2, sy2); b.lineTo(e.x, e.y); b.stroke();
          this.glowAt(e.x, e.y, 4 + Math.round(mult), tw.def.color, 0.8);
        }
      }
    }
  }

  drawUnits(run, time) {
    const b = this.b;
    for (const u of run.units) {
      if (u.kind === 'drone') {
        const x = Math.round(u.x), y = Math.round(u.y + Math.sin(u.anim * 6) * 1 - 3);
        b.fillStyle = 'rgba(0,0,0,0.4)'; b.fillRect(x - 2, Math.round(u.y) + 2, 4, 1);
        b.fillStyle = '#07061a'; b.fillRect(x - 3, y - 1, 7, 3); b.fillRect(x - 1, y - 3, 3, 7);
        b.fillStyle = '#3d7bff'; b.fillRect(x - 2, y, 5, 1); b.fillRect(x, y - 2, 1, 5);
        b.fillStyle = Math.floor(u.anim * 4) % 2 ? '#ffffff' : '#2ef2ff'; b.fillRect(x, y, 1, 1);
      } else {
        const spr = enemySprite('husk', Math.floor(u.anim * 4) % 2);
        b.globalAlpha = 0.85;
        b.drawImage(spr, Math.round(u.x - 6), Math.round(u.y - 8));
        b.globalAlpha = 1;
        this.glowAt(u.x, u.y - 2, 5, '#b6ff3d', 0.3);
      }
    }
  }

  bar(x, y, w, frac, col, back = '#2a0a18') {
    const b = this.b;
    b.fillStyle = '#000'; b.fillRect(x - 1, y - 1, w + 2, 3);
    b.fillStyle = back; b.fillRect(x, y, w, 1);
    b.fillStyle = col; b.fillRect(x, y, Math.max(0, Math.round(w * frac)), 1);
  }

  drawEnemies(run, time) {
    const b = this.b;
    const sorted = run.enemies.slice().sort((a, c) => (a.flying - c.flying) || (a.y - c.y));
    for (const e of sorted) {
      const frame = Math.floor(e.anim * (e.boss ? 3 : 5)) % 2;
      // Enemies caught in a black hole shrink, tint violet and orbit the core.
      const held = e.held > 0;
      const spr = enemySprite(e.sprite || e.type, frame, held ? '#b36bff' : e.hitFlash > 0 ? '#ffffff' : (e.tint || null));
      const scale = (e.scale || (e.elite === 'giant' ? 1.5 : 1)) * (held ? 0.55 : 1);
      const w = spr.width * scale, h = spr.height * scale;
      const lift = e.flying ? 6 + Math.sin(e.anim * 4) * 1.5 : 0;
      const ox = held ? Math.cos(time * 9 + e.id) * 4 : 0, oy = held ? Math.sin(time * 9 + e.id) * 3 : 0;
      const x = Math.round(e.x + ox - w / 2), y = Math.round(e.y + oy - h / 2 - 2 - lift);
      b.fillStyle = 'rgba(0,0,0,0.4)';
      if (e.flying) b.fillRect(Math.round(e.x - w / 4), Math.round(e.y + 2), Math.round(w / 2), 2);
      else { b.fillRect(Math.round(e.x - w / 3), Math.round(y + h - 2), Math.round((w * 2) / 3), 1); b.fillRect(Math.round(e.x - w / 4), Math.round(y + h - 1), Math.round(w / 2), 1); }
      let alpha = 1;
      if (e.cloaked) alpha = 0.3 + 0.1 * Math.sin(time * 8);
      if (e.phased) alpha = 0.25;
      if (held) alpha *= 0.8;
      b.globalAlpha = alpha;
      if (e.boss) this.glowAt(e.x, e.y - lift, 18, e.def.shieldType ? DTYPE_COLOR[e.weak] : '#ff2f5a', 0.5);
      if (e.mini) this.glowAt(e.x, e.y - lift, 14, '#ffd23f', 0.45);
      if (e.corrupted) this.glowAt(e.x, e.y - lift, 7, '#ff0090', 0.35);
      b.drawImage(spr, x, y, w, h);
      if (e.elite && !e.cloaked) {
        b.globalAlpha = 0.5 + 0.3 * Math.sin(time * 6);
        b.fillStyle = ELITE_MODS[e.elite].tint;
        b.fillRect(x, y + h - 1, w, 1);
        b.fillRect(x, y, w, 1);
      }
      b.globalAlpha = 1;
      // statuses
      if (e.slowT > 0 || e.freeze > 0) {
        b.fillStyle = e.freeze > 0 ? 'rgba(180,240,255,0.55)' : 'rgba(143,232,255,0.6)';
        if (e.freeze > 0) b.fillRect(x, y, w, h);
        else { b.fillRect(x + 1, y + h - 2, 2, 1); b.fillRect(x + w - 3, y + 2, 1, 1); }
      }
      if (e.poisonT > 0 && Math.random() < 0.15) run.particle(e.x + (Math.random() - 0.5) * 6, e.y, '#4dff8a', 0, -15, 0.5);
      if (e.shock > 0 && Math.random() < 0.2) run.particle(e.x + (Math.random() - 0.5) * 8, e.y - 4 + (Math.random() - 0.5) * 6, '#ffe84a', 0, 0, 0.1);
      if (e.stun > 0) { b.fillStyle = '#ffe84a'; b.fillRect(Math.round(e.x + Math.cos(time * 10) * 4), y - 2, 1, 1); }
      if (e.shield > 0) {
        const col = e.def.shieldType ? DTYPE_COLOR[e.weak] : '#2ef2ff';
        b.globalAlpha = 0.5 + 0.2 * Math.sin(time * 5);
        this.ringOutline(e.x, e.y - 2 - lift, e.size + 2, col);
        b.globalAlpha = 1;
      }
      // bars
      const bw = e.boss ? 22 : e.mini ? 18 : 10;
      if (e.hp < e.maxHp || e.boss || e.mini) this.bar(Math.round(e.x - bw / 2), y - 3, bw, e.hp / e.maxHp, e.boss ? '#ff2f5a' : e.mini ? '#ffd23f' : '#4dff8a');
      if (e.maxShield > 0 && e.shield > 0) this.bar(Math.round(e.x - bw / 2), y - 5, bw, e.shield / e.maxShield, '#2ef2ff', '#062030');
    }
  }

  // A black hole: soft violet halo, spiral arms of dithered dust turning inward,
  // and a pitch-black core with a bright event-horizon rim. Grows in, shrinks out.
  drawHole(h, time) {
    const b = this.b;
    const age = h.max - h.t;
    const k = Math.min(1, age / 0.2, h.t / 0.25);
    const r = h.r * Math.max(0.05, k);
    b.globalAlpha = 0.18;
    this.pixelDisc(h.x, h.y, r, h.color);
    b.globalAlpha = 0.3;
    this.pixelDisc(h.x, h.y, r * 0.7, '#4b2a9a');
    b.globalAlpha = 1;
    for (let arm = 0; arm < 3; arm++) {
      for (let i = 0; i < 14; i++) {
        const f = i / 14;
        const a = h.spin * 4 + arm * (Math.PI * 2 / 3) + f * 3.2;
        const d = r * (1 - f * 0.75);
        b.fillStyle = i % 3 === 0 ? '#ffffff' : i % 2 ? h.color : '#ff3df2';
        b.globalAlpha = 0.35 + f * 0.6;
        b.fillRect(Math.round(h.x + Math.cos(a) * d), Math.round(h.y + Math.sin(a) * d), 1, 1);
      }
    }
    b.globalAlpha = 1;
    this.glowAt(h.x, h.y, r * 0.9, h.color, 0.5);
    const core = Math.max(1, r * 0.38);
    this.ringOutline(h.x, h.y, core + 1, Math.floor(time * 12) % 2 ? '#ffffff' : h.color);
    this.pixelDisc(h.x, h.y, core, '#000000');
  }

  drawProjectiles(run) {
    const b = this.b;
    for (const p of run.projectiles) {
      if (p.t !== undefined && p.t < 0) continue;
      const x = Math.round(p.x), y = Math.round(p.y);
      if (p.kind === 'bolt') {
        this.glowAt(x, y, 3, p.color, 0.8);
        b.fillStyle = p.color;
        for (let k = 1; k <= 4; k++) { b.globalAlpha = 1 - k * 0.22; b.fillRect(Math.round(x - p.vx * 0.008 * k), Math.round(y - p.vy * 0.008 * k), 1, 1); }
        b.globalAlpha = 1;
        b.fillStyle = '#ffffff'; b.fillRect(x, y, 1, 1);
      } else if (p.kind === 'hole') {
        const hgt = Math.round(p.h || 0);
        b.fillStyle = 'rgba(0,0,0,0.4)'; b.fillRect(x - 1, y + 1, 3, 1);
        this.glowAt(x, y - hgt, 6, p.color, 0.9);
        b.fillStyle = p.color; b.fillRect(x - 2, y - hgt - 1, 5, 3); b.fillRect(x - 1, y - hgt - 2, 3, 5);
        b.fillStyle = '#000000'; b.fillRect(x - 1, y - hgt - 1, 3, 3);
      } else if (p.kind === 'orb') {
        this.glowAt(x, y, 4, '#b6ff3d', 0.8);
        b.fillStyle = '#e8ffc0'; b.fillRect(x - 1, y - 1, 2, 2);
      } else {
        const hgt = Math.round(p.h || 0);
        b.fillStyle = 'rgba(0,0,0,0.4)'; b.fillRect(x - 1, y + 1, 3, 1);
        const r = p.kind === 'mortar' ? 2 : p.mini ? 1 : 2;
        this.glowAt(x, y - hgt, r + 3, p.color, 0.8);
        b.fillStyle = p.color; b.fillRect(x - r + 1, y - hgt - r + 1, r * 2 - 1, r * 2 - 1);
        b.fillStyle = '#ffffff'; b.fillRect(x, y - hgt, 1, 1);
      }
    }
  }

  drawFx(run, time) {
    const b = this.b;
    for (const l of run.fx.lines) {
      b.globalAlpha = Math.min(1, l.life * 8);
      if (l.kind === 'chain') {
        const segs = 5;
        let px = l.x1, py = l.y1;
        b.fillStyle = l.color;
        for (let i = 1; i <= segs; i++) {
          const t = i / segs;
          const nx = l.x1 + (l.x2 - l.x1) * t + (i < segs ? (Math.random() - 0.5) * 6 : 0);
          const ny = l.y1 + (l.y2 - l.y1) * t + (i < segs ? (Math.random() - 0.5) * 6 : 0);
          this.pixLine(px, py, nx, ny, l.color);
          this.pixLine(px + 1, py, nx + 1, ny, i % 2 ? '#ffffff' : l.color);
          px = nx; py = ny;
        }
        this.glowAt(l.x2, l.y2, 5, l.color, 0.7);
      } else if (l.kind === 'slash') {
        const k = l.life / 0.45;
        b.strokeStyle = l.color; b.lineWidth = 2 + 4 * k;
        b.beginPath(); b.moveTo(l.x1, l.y1); b.lineTo(l.x2, l.y2); b.stroke();
        b.strokeStyle = '#ffffff'; b.lineWidth = 1 + k;
        b.beginPath(); b.moveTo(l.x1, l.y1); b.lineTo(l.x2, l.y2); b.stroke();
        this.glowAt((l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2, 16, l.color, 0.6 * k);
      } else {
        b.strokeStyle = l.color; b.lineWidth = 3 * l.life * 4;
        b.beginPath(); b.moveTo(l.x1, l.y1); b.lineTo(l.x2, l.y2); b.stroke();
        b.strokeStyle = '#ffffff'; b.lineWidth = 1;
        b.beginPath(); b.moveTo(l.x1, l.y1); b.lineTo(l.x2, l.y2); b.stroke();
      }
    }
    b.globalAlpha = 1;
    for (const r of run.fx.rings) {
      const k = 1 - r.life / r.max;
      b.globalAlpha = r.life / r.max;
      this.ringOutline(r.x, r.y, r.r * (0.4 + 0.6 * k), r.color);
    }
    b.globalAlpha = 1;
    for (const p of run.fx.particles) {
      b.globalAlpha = Math.min(1, (p.life / p.max) * 1.5);
      b.fillStyle = p.color;
      b.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    b.globalAlpha = 1;
  }

  pixLine(x0, y0, x1, y1, col) {
    const b = this.b;
    b.fillStyle = col;
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      b.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 1, 1);
    }
  }
}
