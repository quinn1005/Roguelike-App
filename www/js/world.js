// The map is a growing grid of 7x7-tile chunks attached to each other in a tree
// rooted at the core chunk. Enemies spawn from "portals" (open exits at the
// edge of the map) and follow routes back down the tree to the core.

import { T, TS, isPath, drawTile, SECTORS, makeCanvas } from './sprites.js';
import { mulberry32, randInt, pick, shuffle, weightedPick, SIDE_DIR, OPP } from './util.js';
import { CHUNK_MODS } from './defs.js';

export const CS = 7;
export const CPX = CS * TS;
const EXIT = { N: [3, 0], E: [6, 3], S: [3, 6], W: [0, 3] };
const INWARD = { N: [0, 1], S: [0, -1], E: [-1, 0], W: [1, 0] };

// Canonical frame: entry on W, forward E, left N, right S.
const SIDE_MAP = {
  W: { W: 'W', E: 'E', N: 'N', S: 'S' },
  N: { W: 'N', E: 'S', N: 'E', S: 'W' },
  E: { W: 'E', E: 'W', N: 'S', S: 'N' },
  S: { W: 'S', E: 'N', N: 'W', S: 'E' },
};
function xform(entry, u, v) {
  switch (entry) {
    case 'N': return [6 - v, u];
    case 'E': return [6 - u, 6 - v];
    case 'S': return [v, 6 - u];
    default: return [u, v];
  }
}

function lconnect(rng, out, a, b) {
  let [x, y] = a;
  const [bx, by] = b;
  const hFirst = rng() < 0.5;
  const stepX = () => { while (x !== bx) { x += Math.sign(bx - x); out.push([x, y]); } };
  const stepY = () => { while (y !== by) { y += Math.sign(by - y); out.push([x, y]); } };
  if (hFirst) { stepX(); stepY(); } else { stepY(); stepX(); }
}

function polyRoute(rng, pts) {
  const raw = [pts[0].slice()];
  for (let i = 1; i < pts.length; i++) {
    const last = raw[raw.length - 1];
    if (last[0] === pts[i][0] && last[1] === pts[i][1]) continue;
    lconnect(rng, raw, last, pts[i]);
  }
  // Remove dead-end spikes where the path doubles back on itself (A-B-A).
  const out = [];
  for (const p of raw) {
    const prev = out[out.length - 2];
    if (prev && prev[0] === p[0] && prev[1] === p[1]) out.pop();
    else out.push(p);
  }
  return out;
}

const CANON_OUT = { F: 'E', L: 'N', R: 'S' };

// Generates canonical routes for an archetype (entry W).
function canonicalRoutes(rng, arch, flip) {
  const routes = {};
  const outs = arch.outs.map((o) => (flip && o !== 'F' ? (o === 'L' ? 'R' : 'L') : o)).map((o) => CANON_OUT[o]);
  const entryPts = [[0, 3], [1, 3]];
  for (const s of outs) {
    const ex = EXIT[s];
    const inw = [ex[0] + INWARD[s][0], ex[1] + INWARD[s][1]];
    const alts = [];
    if (arch.braid) {
      // two lanes forming a loop: one above, one below the centre line
      for (const band of [[1, 2], [4, 5]]) {
        const v = randInt(rng, band[0], band[1]);
        alts.push(polyRoute(rng, [ex, inw, [5, v], [1, v], ...entryPts.slice().reverse()]));
      }
    } else if (arch.wps >= 3) {
      const up = rng() < 0.5;
      const wps = [[5, up ? 1 : 5], [3, up ? 5 : 1], [1, up ? 1 : 5]];
      if (s !== 'E') wps.shift();
      alts.push(polyRoute(rng, [ex, inw, ...wps, ...entryPts.slice().reverse()]));
    } else {
      const wp = [randInt(rng, 2, 4), randInt(rng, 1, 5)];
      alts.push(polyRoute(rng, [ex, inw, wp, ...entryPts.slice().reverse()]));
    }
    routes[s] = alts;
  }
  if (!outs.length) routes._stub = [[[2, 3], [1, 3], [0, 3]]];
  return routes;
}

// Build a chunk's tile data. blocked(side) says if an actual side can't be an exit.
export function genChunk({ arch, mods, sector, seed, entry, blocked = () => false }) {
  const rng = mulberry32(seed);
  const flip = arch.flip && rng() < 0.5;
  const canon = canonicalRoutes(rng, arch, flip);
  const tiles = new Uint8Array(CS * CS).fill(T.GROUND);
  const routes = {};
  const outs = [];
  for (const cs of Object.keys(canon)) {
    if (cs === '_stub') {
      for (const r of canon._stub) for (const [u, v] of r) { const [x, y] = xform(entry, u, v); tiles[y * CS + x] = T.PATH; }
      continue;
    }
    const side = SIDE_MAP[entry][cs];
    if (blocked(side)) continue;
    outs.push(side);
    routes[side] = canon[cs].map((r) => r.map(([u, v]) => xform(entry, u, v)));
    for (const r of routes[side]) for (const [x, y] of r) tiles[y * CS + x] = T.PATH;
  }
  applyMods(rng, tiles, mods);
  return { entry, outs, routes, tiles, sector, arch: arch.id, mods: mods.slice() };
}

function applyMods(rng, tiles, mods) {
  const ground = () => {
    const out = [];
    for (let i = 0; i < tiles.length; i++) if (tiles[i] === T.GROUND) out.push(i);
    return shuffle(rng, out);
  };
  const place = (n, t) => { const g = ground(); for (let i = 0; i < n && i < g.length; i++) tiles[g[i]] = t; };
  place(randInt(rng, 1, 3), T.ROCK);
  for (const m of mods) {
    if (m === 'rocks') place(randInt(rng, 4, 6), T.ROCK);
    if (m === 'cache') place(randInt(rng, 1, 2), T.CACHE);
    if (m === 'node') place(randInt(rng, 1, 2), T.NODE);
    if (m === 'high') {
      const g = ground();
      if (!g.length) continue;
      let cells = [g[0]];
      const want = randInt(rng, 3, 5);
      for (let k = 0; k < 20 && cells.length < want; k++) {
        const c = pick(rng, cells);
        const x = c % CS, y = (c / CS) | 0;
        const [dx, dy] = pick(rng, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= CS || ny >= CS) continue;
        const ni = ny * CS + nx;
        if (tiles[ni] === T.GROUND && !cells.includes(ni)) cells.push(ni);
      }
      for (const c of cells) tiles[c] = T.HIGH;
    }
    if (m === 'sludge') {
      const p = [];
      for (let i = 0; i < tiles.length; i++) {
        const x = i % CS, y = (i / CS) | 0;
        if (tiles[i] === T.PATH && x > 0 && y > 0 && x < CS - 1 && y < CS - 1) p.push(i);
      }
      shuffle(rng, p);
      const n = randInt(rng, 4, 6);
      for (let i = 0; i < n && i < p.length; i++) tiles[p[i]] = T.SLUDGE;
    }
  }
}

export function rollChunkMods(rng, n) {
  const pool = CHUNK_MODS.slice();
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    const m = weightedPick(rng, pool);
    out.push(m.id);
    pool.splice(pool.indexOf(m), 1);
  }
  return out;
}

export class World {
  constructor() {
    this.chunks = new Map();
    this.portals = [];
    this.sealed = [];
    this.minCx = 0; this.maxCx = 0; this.minCy = 0; this.maxCy = 0;
  }

  static key(cx, cy) { return cx + ',' + cy; }
  get(cx, cy) { return this.chunks.get(World.key(cx, cy)); }

  tile(x, y) {
    const cx = Math.floor(x / CS), cy = Math.floor(y / CS);
    const ch = this.get(cx, cy);
    if (!ch) return T.VOID;
    return ch.tiles[(y - cy * CS) * CS + (x - cx * CS)];
  }

  setTile(x, y, t) {
    const cx = Math.floor(x / CS), cy = Math.floor(y / CS);
    const ch = this.get(cx, cy);
    if (!ch) return;
    ch.tiles[(y - cy * CS) * CS + (x - cx * CS)] = t;
    ch.canvas = null;
  }

  createCore() {
    const side = 'E';
    const tiles = new Uint8Array(CS * CS).fill(T.GROUND);
    const ex = EXIT[side];
    const route = polyRoute(mulberry32(7), [ex, [ex[0] + INWARD[side][0], ex[1] + INWARD[side][1]], [3, 3]]);
    for (const [x, y] of route) tiles[y * CS + x] = T.PATH;
    tiles[3 * CS + 3] = T.CORE;
    tiles[1 * CS + 1] = T.ROCK; tiles[5 * CS + 1] = T.ROCK;
    this.add({ cx: 0, cy: 0, entry: null, outs: [side], routes: { [side]: [route] }, tiles, sector: 0, arch: 'core', mods: [], parent: null, parentSide: null });
  }

  add(ch) {
    this.chunks.set(World.key(ch.cx, ch.cy), ch);
    this.minCx = Math.min(this.minCx, ch.cx); this.maxCx = Math.max(this.maxCx, ch.cx);
    this.minCy = Math.min(this.minCy, ch.cy); this.maxCy = Math.max(this.maxCy, ch.cy);
    // neighbors need their edges redrawn
    for (const s of Object.keys(SIDE_DIR)) {
      const n = this.get(ch.cx + SIDE_DIR[s][0], ch.cy + SIDE_DIR[s][1]);
      if (n) n.canvas = null;
    }
    this.computePortals();
  }

  // Attach a new chunk through a portal.
  attach(portal, arch, mods, sector, seed) {
    const parent = this.chunks.get(portal.ck);
    const [dx, dy] = SIDE_DIR[portal.side];
    const cx = parent.cx + dx, cy = parent.cy + dy;
    const entry = OPP[portal.side];
    const blocked = (s) => !!this.get(cx + SIDE_DIR[s][0], cy + SIDE_DIR[s][1]);
    const data = genChunk({ arch, mods, sector, seed, entry, blocked });
    const ch = { cx, cy, ...data, parent: portal.ck, parentSide: portal.side };
    this.add(ch);
    if (!this.portals.length) {
      // Never leave the map without a spawn: open a warp gate in this chunk.
      ch.gate = true;
      const r = polyRoute(mulberry32(seed + 1), [[3, 3], ...this._toEntry(entry)]);
      ch.routes.G = [r];
      for (const [x, y] of r) if (!isPath(ch.tiles[y * CS + x])) ch.tiles[y * CS + x] = T.PATH;
      ch.canvas = null;
      this.computePortals();
    }
    return ch;
  }

  _toEntry(entry) {
    const e = EXIT[entry];
    return [[e[0] + INWARD[entry][0], e[1] + INWARD[entry][1]], e];
  }

  computePortals() {
    this.portals = [];
    this.sealed = [];
    for (const [k, ch] of this.chunks) {
      for (const s of ch.outs) {
        const [dx, dy] = SIDE_DIR[s];
        const n = this.get(ch.cx + dx, ch.cy + dy);
        const [lx, ly] = EXIT[s];
        const tx = ch.cx * CS + lx, ty = ch.cy * CS + ly;
        if (!n) this.portals.push({ ck: k, side: s, tx, ty });
        else if (!(n.parent === k && n.parentSide === s)) this.sealed.push({ ck: k, side: s, tx, ty });
      }
      if (ch.gate) this.portals.push({ ck: k, side: 'G', tx: ch.cx * CS + 3, ty: ch.cy * CS + 3 });
    }
  }

  // Full tile route from a portal to the core, choosing random alternatives.
  route(portal, rng) {
    const out = [];
    let ch = this.chunks.get(portal.ck);
    let key = portal.side;
    for (let guard = 0; ch && guard < 999; guard++) {
      const alts = ch.routes[key];
      if (!alts) break;
      const r = alts[Math.floor(rng() * alts.length)];
      for (const [lx, ly] of r) out.push([ch.cx * CS + lx, ch.cy * CS + ly]);
      if (!ch.parent) break;
      key = ch.parentSide;
      ch = this.chunks.get(ch.parent);
    }
    return out;
  }

  isPortalTile(x, y) {
    return this.portals.some((p) => p.tx === x && p.ty === y && p.side !== 'G');
  }

  chunkCanvas(ch) {
    if (ch.canvas) return ch.canvas;
    const [c, ctx] = makeCanvas(CPX, CPX);
    const sec = SECTORS[ch.sector % SECTORS.length];
    const portalSides = this.portals.filter((p) => p.ck === World.key(ch.cx, ch.cy)).map((p) => p.side);
    for (let ly = 0; ly < CS; ly++) {
      for (let lx = 0; lx < CS; lx++) {
        const t = ch.tiles[ly * CS + lx];
        const wx = ch.cx * CS + lx, wy = ch.cy * CS + ly;
        const nb = (dx, dy) => {
          const nt = this.tile(wx + dx, wy + dy);
          if (nt === T.VOID) {
            for (const s of portalSides) {
              const e = EXIT[s];
              if (s !== 'G' && e[0] === lx && e[1] === ly && SIDE_DIR[s][0] === dx && SIDE_DIR[s][1] === dy) return T.PATH;
            }
          }
          return nt;
        };
        drawTile(ctx, t, lx * TS, ly * TS, wx, wy, sec, nb);
      }
    }
    // chunk seam outline
    ctx.fillStyle = sec.grid;
    ctx.fillRect(0, 0, CPX, 1); ctx.fillRect(0, 0, 1, CPX);
    ch.canvas = c;
    return c;
  }

  serialize() {
    return [...this.chunks.values()].map((c) => ({
      cx: c.cx, cy: c.cy, entry: c.entry, outs: c.outs, routes: c.routes, tiles: Array.from(c.tiles),
      sector: c.sector, arch: c.arch, mods: c.mods, parent: c.parent, parentSide: c.parentSide, gate: !!c.gate,
    }));
  }

  static deserialize(arr) {
    const w = new World();
    for (const c of arr) {
      const ch = { ...c, tiles: Uint8Array.from(c.tiles) };
      w.chunks.set(World.key(c.cx, c.cy), ch);
      w.minCx = Math.min(w.minCx, c.cx); w.maxCx = Math.max(w.maxCx, c.cx);
      w.minCy = Math.min(w.minCy, c.cy); w.maxCy = Math.max(w.maxCy, c.cy);
    }
    w.computePortals();
    return w;
  }
}

// Preview canvas for a chunk choice card.
export function previewCanvas(data) {
  const [c, ctx] = makeCanvas(CPX, CPX);
  const sec = SECTORS[data.sector % SECTORS.length];
  for (let ly = 0; ly < CS; ly++) {
    for (let lx = 0; lx < CS; lx++) {
      const t = data.tiles[ly * CS + lx];
      const nb = (dx, dy) => {
        const nx = lx + dx, ny = ly + dy;
        if (nx < 0 || ny < 0 || nx >= CS || ny >= CS) return isPath(t) ? T.PATH : T.VOID;
        return data.tiles[ny * CS + nx];
      };
      drawTile(ctx, t, lx * TS, ly * TS, lx, ly, sec, nb);
    }
  }
  return c;
}
