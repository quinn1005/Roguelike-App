// Entry point: game loop, touch/mouse input, and glue between UI and the run.

import { Renderer } from './render.js';
import { UI } from './ui.js';
import { Run } from './game.js';
import { meta, saveMeta, clearRun } from './meta.js';
import { sfx, unlockAudio, setSfx } from './audio.js';
import { TS, T } from './sprites.js';
import { CPX } from './world.js';
import { SIDE_DIR } from './util.js';
import { TOWERS } from './defs.js';

const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);

const app = {
  run: null,
  view: { selected: null, buildType: null, ghost: null, shakeOn: true },
  autoTimer: 0,

  bindRun(run) {
    this.run = run;
    run.sfx = sfx;
    run.on('toast', ({ msg, color }) => ui.toast(msg, color));
    run.on('choice', (c) => ui.showChoice(c));
    run.on('build', () => { this.autoTimer = 2.5; ui.updateWaveButton(); });
    run.on('wave', () => ui.updateWaveButton());
    run.on('intro', (ids) => ui.showIntro(ids));
    run.on('over', (d) => { this.deselect(); ui.showGameOver(d); });
    this.deselect();
    ui.enterRun();
    $speed();
    this.centerCamera();
    this.autoTimer = 2.5;
  },

  newRun(commander, heat) {
    clearRun();
    ui.closeModal();
    this.bindRun(new Run({ commander, heat }));
    ui.toast('DEFEND THE CORE', '#2ef2ff');
  },

  continueRun(save) {
    try {
      this.bindRun(new Run({ save }));
      ui.toast('RUN RESUMED - WAVE ' + (save.wave + 1), '#2ef2ff');
    } catch (e) {
      console.error(e);
      clearRun();
      ui.toast('Save was corrupted, sorry!', '#ff2f5a');
      ui.showMenu();
    }
  },

  quitToMenu() {
    // The run was saved when the last wave ended (build phase).
    this.run = null;
    this.toMenu();
  },

  toMenu() {
    this.run = null;
    this.deselect();
    ui.closeModal();
    ui.showMenu();
  },

  centerCamera() {
    const w = this.run.world;
    renderer.cam.x = ((w.minCx + w.maxCx + 1) * CPX) / 2;
    renderer.cam.y = ((w.minCy + w.maxCy + 1) * CPX) / 2;
  },

  focusSlots() {
    renderer.cam.zoom = 1;
    this.centerCamera();
  },

  startWave() {
    const r = this.run;
    if (!r || r.phase !== 'build') return;
    r.startWave();
    ui.updateWaveButton();
  },

  selectBuild(tid) {
    const v = this.view;
    v.selected = null;
    ui.hidePanel();
    v.buildType = v.buildType === tid ? null : tid;
    v.ghost = null;
    ui.refreshTowerBar();
  },

  deselect() {
    const v = this.view;
    v.selected = null; v.buildType = null; v.ghost = null;
    ui.hidePanel();
    ui.refreshTowerBar();
  },

  upgrade(tw, branch) {
    if (this.run.upgrade(tw, branch)) ui.refreshPanel(true);
  },

  sell(tw) {
    this.run.sell(tw);
    this.deselect();
  },

  fullscreen() {
    const d = document.documentElement;
    const p = d.requestFullscreen ? d.requestFullscreen() : null;
    if (p && p.then) p.then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {});
  },

  tap(cx, cy) {
    const r = this.run;
    if (!r || r.phase === 'over') return;
    const [wx, wy] = renderer.screenToWorld(cx, cy);
    const tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
    const v = this.view;
    if (r.placing) {
      const ccx = Math.floor(wx / CPX), ccy = Math.floor(wy / CPX);
      for (const p of r.world.portals) {
        if (p.side === 'G') continue;
        const ch = r.world.chunks.get(p.ck);
        if (ch.cx + SIDE_DIR[p.side][0] === ccx && ch.cy + SIDE_DIR[p.side][1] === ccy) {
          r.placeChunk(p);
          return;
        }
      }
      return;
    }
    const tw = r.towerAt.get(tx + ',' + ty);
    if (tw) {
      v.buildType = null; v.ghost = null;
      v.selected = tw;
      ui.showPanel(tw);
      ui.refreshTowerBar();
      sfx('click');
      return;
    }
    if (r.world.tile(tx, ty) === T.CACHE) { r.salvage(tx, ty); return; }
    if (v.buildType) {
      if (v.ghost && v.ghost.x === tx && v.ghost.y === ty) {
        if (!r.canBuild(tx, ty)) { ui.toast("Can't build there", '#ff2f5a'); return; }
        if (r.gold < r.towerCost(v.buildType)) { ui.toast('Not enough credits', '#ff2f5a'); return; }
        r.build(v.buildType, tx, ty);
        v.ghost = null;
        ui.refreshTowerBar();
      } else if (r.canBuild(tx, ty)) {
        v.ghost = { x: tx, y: ty, type: v.buildType, def: TOWERS[v.buildType] };
        sfx('click');
      } else {
        v.ghost = null;
      }
      return;
    }
    this.deselect();
  },
};

function $speed() { document.getElementById('btn-speed').textContent = (app.run ? app.run.speed : 1) + 'x'; }

const ui = new UI(app);
setSfx(meta.settings.sfx);

// ---------- input ----------
const pointers = new Map();
let moved = false;
let pinchBase = 0;
let lastMid = null;

function mid() {
  const ps = [...pointers.values()];
  return [(ps[0].x + ps[1].x) / 2, (ps[0].y + ps[1].y) / 2, Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y)];
}

canvas.addEventListener('pointerdown', (e) => {
  unlockAudio();
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
  if (pointers.size === 1) moved = false;
  if (pointers.size === 2) { const m = mid(); pinchBase = m[2]; lastMid = m; moved = true; }
});

canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId);
  if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY;
  if (!app.run) return;
  if (pointers.size === 1) {
    if (!moved && Math.hypot(p.x - p.sx, p.y - p.sy) > 10) moved = true;
    if (moved) {
      renderer.cam.x -= dx / renderer.cssScale;
      renderer.cam.y -= dy / renderer.cssScale;
      renderer.clampCam(app.run.world);
    }
  } else if (pointers.size === 2) {
    const m = mid();
    renderer.cam.x -= (m[0] - lastMid[0]) / renderer.cssScale;
    renderer.cam.y -= (m[1] - lastMid[1]) / renderer.cssScale;
    lastMid = m;
    const ratio = m[2] / pinchBase;
    if (ratio > 1.45 && renderer.cam.zoom < 3) { renderer.cam.zoom++; pinchBase = m[2]; }
    if (ratio < 0.69 && renderer.cam.zoom > 1) { renderer.cam.zoom--; pinchBase = m[2]; }
    renderer.clampCam(app.run.world);
  }
});

function endPointer(e) {
  const p = pointers.get(e.pointerId);
  if (!p) return;
  pointers.delete(e.pointerId);
  if (!moved && pointers.size === 0 && e.type === 'pointerup') app.tap(e.clientX, e.clientY);
  if (pointers.size === 1) { const q = [...pointers.values()][0]; q.sx = q.x; q.sy = q.y; }
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (!app.run) return;
  renderer.cam.zoom = Math.max(1, Math.min(3, renderer.cam.zoom + (e.deltaY < 0 ? 1 : -1)));
}, { passive: false });

window.addEventListener('keydown', (e) => {
  const r = app.run;
  if (!r) return;
  if (e.code === 'Space') { e.preventDefault(); app.startWave(); }
  if (e.key === 'Escape') app.deselect();
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 9) { const t = r.availableTowers()[n - 1]; if (t) app.selectBuild(t); }
});

window.addEventListener('resize', () => renderer.resize());
// Inside the Android app, hide the status bar for a fullscreen game.
try { const sb = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar; if (sb) sb.hide().catch(() => {}); } catch (e) { /* not native */ }
document.addEventListener('pointerdown', unlockAudio, { once: true });

document.addEventListener('visibilitychange', () => {
  if (document.hidden && app.run && app.run.phase === 'wave' && !app.run.paused) ui.showPause();
});

// Android back button: open the pause menu instead of leaving the app.
history.pushState({ nb: 1 }, '');
window.addEventListener('popstate', () => {
  history.pushState({ nb: 1 }, '');
  if (app.run && app.run.phase !== 'over') {
    if (app.run.paused) { app.run.paused = false; ui.closeModal(); } else ui.showPause();
  } else if (!app.run) ui.showMenu();
});

// ---------- loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const r = app.run;
  app.view.shakeOn = meta.settings.shake;
  if (r) {
    r.update(dt);
    if (app.view.selected && !r.towers.includes(app.view.selected)) app.deselect();
    if (r.phase === 'build' && meta.settings.autoWave && !r.paused) {
      app.autoTimer -= dt;
      if (app.autoTimer <= 0) app.startWave();
    }
    ui.updateHud();
  } else {
    renderer.cam.x += dt * 8;
  }
  renderer.draw(r, app.view);
  requestAnimationFrame(frame);
}

document.fonts.load('8px "PressStart"').catch(() => {}).finally(() => {
  ui.showMenu();
  requestAnimationFrame(frame);
});

window.__app = app;
window.__renderer = renderer;
