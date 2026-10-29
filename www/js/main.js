// Entry point: game loop, touch/mouse input, and glue between UI and the run.

import { Renderer } from './render.js';
import { UI } from './ui.js';
import { Run } from './game.js';
import { meta, saveMeta, clearRun } from './meta.js';
import { sfx, unlockAudio, setSfx, audioCtx } from './audio.js';
import { playTrack, musicBeats, setMusic, setMusicMode, MENU_TRACK } from './music.js';
import { TS, T } from './sprites.js';
import { CPX } from './world.js';
import { SIDE_DIR } from './util.js';
import { TOWERS } from './defs.js';
import { haptic } from './haptics.js';

const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);

const app = {
  run: null,
  view: { selected: null, buildType: null, ghost: null, shakeOn: true },
  autoTimer: 0,

  bindRun(run) {
    this.run = run;
    run.sfx = sfx;
    run.haptic = haptic;
    run.on('toast', ({ msg, color }) => ui.toast(msg, color));
    run.on('choice', (c) => ui.showChoice(c));
    run.on('build', () => { this.autoTimer = 2.5; ui.updateWaveButton(); });
    run.on('wave', () => ui.updateWaveButton());
    run.on('intro', (ids) => ui.showIntro(ids));
    run.on('over', (d) => { this.deselect(); ui.showGameOver(d); });
    run.on('drop', (kind) => ui.dropBanner(kind));
    run.onTrack = (tr) => playTrack(tr, 0);
    run.beatSrc = () => (this.run === run ? musicBeats() : null);
    this.deselect();
    ui.enterRun();
    $speed();
    this.centerCamera();
    this.autoTimer = 2.5;
  },

  newRun(commander, heat, mutators = []) {
    clearRun();
    ui.closeModal();
    this.bindRun(new Run({ commander, heat, mutators }));
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
    playTrack(MENU_TRACK, 0);
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
    v.selected = null; v.rock = null; v.relocate = null;
    ui.hidePanel();
    v.buildType = v.buildType === tid ? null : tid;
    v.ghost = null;
    ui.refreshTowerBar();
  },

  deselect() {
    const v = this.view;
    v.selected = null; v.buildType = null; v.ghost = null; v.rock = null; v.relocate = null;
    ui.hidePanel();
    ui.refreshTowerBar();
  },

  // ---- chunk relocation ----
  toggleRelocate() {
    if (this.view.relocate) return this.cancelRelocate();
    this.deselect();
    this.view.relocate = { first: null, swapFrom: null };
    ui.toast('TAP A GLOWING CHUNK TO MOVE IT', '#2ef2ff');
  },
  cancelRelocate() { this.view.relocate = null; ui.hidePanel(); },
  rotateChunk(ch) { if (this.run.rotateChunk(ch)) { ui.toast('CHUNK ROTATED', '#2ef2ff'); } this.cancelRelocate(); },
  beginSwap(ch) { this.view.relocate = { first: ch, swapFrom: ch }; ui.hidePanel(); ui.toast('NOW TAP ANOTHER GLOWING CHUNK', '#ff3df2'); },

  // ---- counter-raids ----
  beginRaid(portal) {
    this.deselect();
    this.view.raidSel = { portal, squad: [] };
    ui.showRaidPanel();
    ui.toast('TAP UP TO 5 TOWERS FOR THE STRIKE SQUAD', '#ff3df2');
  },
  cancelRaid() { this.view.raidSel = null; ui.hidePanel(); },
  launchRaid() {
    const sel = this.view.raidSel;
    if (sel && this.run.launchRaid(sel.portal, sel.squad)) { this.view.raidSel = null; ui.hidePanel(); }
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

  tap(cx, cy, judge = null) {
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
    if (v.relocate) {
      const ch = r.world.get(Math.floor(wx / CPX), Math.floor(wy / CPX));
      if (!ch || !r.canRelocate(ch)) return;
      if (v.relocate.swapFrom) {
        if (ch !== v.relocate.swapFrom && r.swapChunks(v.relocate.swapFrom, ch)) ui.toast('CHUNKS SWAPPED', '#ff3df2');
        this.cancelRelocate();
      } else { v.relocate.first = ch; ui.showChunkPanel(ch); }
      return;
    }
    if (v.raidSel) {
      const t = r.towerAt.get(tx + ',' + ty);
      if (!t) return;
      const sq = v.raidSel.squad, i = sq.indexOf(t);
      if (i >= 0) sq.splice(i, 1); else if (sq.length < 5) sq.push(t); else ui.toast('SQUAD IS FULL (5)', '#ff2f5a');
      sfx('click');
      ui.showRaidPanel();
      return;
    }
    const tw = r.towerAt.get(tx + ',' + ty);
    // Tower Accent: an on-beat tap on a tower during a wave fires a charged shot.
    if (tw && judge && meta.settings.accents !== false && !v.buildType && r.canAccent(tw) && judge.grade !== 'miss') {
      if (r.accent(tw, judge.grade)) return;
    }
    if (tw) {
      v.buildType = null; v.ghost = null; v.rock = null;
      v.selected = tw;
      ui.showPanel(tw);
      ui.refreshTowerBar();
      sfx('click');
      return;
    }
    if (r.world.tile(tx, ty) === T.CACHE) { r.salvage(tx, ty); return; }
    if (!v.buildType && r.world.tile(tx, ty) === T.ROCK) { this.deselect(); v.rock = { x: tx, y: ty }; ui.showRockPanel(tx, ty); sfx('click'); return; }
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
app.ui = ui;
setSfx(meta.settings.sfx);
setMusic(meta.settings.music !== false);
setMusicMode((cyc) => (app.run ? app.run.beatMode(cyc) : 'normal'));

// ---------- input ----------
const pointers = new Map();
let moved = false;
let pinchBase = 0;
let lastMid = null;
let slashing = false;
const view = () => app.view;

function mid() {
  const ps = [...pointers.values()];
  return [(ps[0].x + ps[1].x) / 2, (ps[0].y + ps[1].y) / 2, Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y)];
}

canvas.addEventListener('pointerdown', (e) => {
  unlockAudio();
  canvas.setPointerCapture(e.pointerId);
  const r = app.run;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, judge: r ? r.judgeBeat() : null });
  if (pointers.size === 1) { moved = false; slashing = !!(r && r.inDrop && r.slashesLeft > 0); }
  if (pointers.size > 1) slashing = false;
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
    if (moved && slashing) { view().slashTrail = [p.sx, p.sy, p.x, p.y]; return; }
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
  if (slashing && moved && pointers.size === 0 && e.type === 'pointerup' && app.run) {
    const [x1, y1] = renderer.screenToWorld(p.sx, p.sy), [x2, y2] = renderer.screenToWorld(e.clientX, e.clientY);
    app.run.slash(x1, y1, x2, y2, app.run.judgeBeat().grade);
  }
  view().slashTrail = null;
  if (!moved && pointers.size === 0 && e.type === 'pointerup') app.tap(e.clientX, e.clientY, p.judge);
  if (pointers.size === 0) slashing = false;
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
// Music starts on the first touch (browsers block audio until then).
document.addEventListener('pointerdown', () => { unlockAudio(); startMusic(); }, { once: true });
function startMusic() {
  const ac = audioCtx();
  if (!ac || ac.state !== 'running' || musicBeats() !== null) return;
  if (app.run) playTrack(app.run.track, app.run.beatPos); else playTrack(MENU_TRACK, 0);
}

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
  app.view.glowOn = meta.settings.glow !== false;
  startMusic();
  if (r) {
    const ac = audioCtx();
    r.beatLatency = (ac ? (ac.outputLatency || ac.baseLatency || 0) * 1000 : 0) + (meta.settings.beatOffset || 0);
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
