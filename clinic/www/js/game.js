// Pixel Pet Clinic: boot, the title screen, the HUD and the main loop.
import { THEMES } from './themes.js';
import { WEEK, WEATHER } from './story.js';
import { renderDiorama, prewarm } from './diorama.js';
import { TIW, TIH, renderTitle } from './title.js';
import { sfx, unlock, music, ambience, isMuted } from './audio.js';
import { VERSION } from './version.js';
import { G, ACT, view, vctx, esc, fmt, money, load, oldSave, setScreen, renderHud, icon } from './core.js';
import { newGame, startDay, hubScreen, hallScreen } from './day.js';
import './evening.js';
import './weekend.js';

/* ---------- HUD ---------- */
G.hudFn = () => {
  const S = G.S;
  if (!S || (G.scr && G.scr.kind === 'title')) return `<span class="brand">PIXEL PET CLINIC</span><span class="sp"></span><button class="iconbtn" data-act="settings" aria-label="Settings">${icon('gear')}</button>`;
  const d = WEEK[Math.min(S.day, 5)], w = d.weather, wi = { clear: 'sun', rain: 'rain', fog: 'fog', heat: 'heat' }[w];
  const clock = S.phase === 'open' || G.scr.kind === 'exam' || G.scr.kind === 'game' ? fmt(S.minute) : S.phase === 'morning' ? 'MORNING' : S.phase === 'weekend' ? 'FAIR DAY' : S.phase === 'final' ? 'NIGHT' : 'EVENING';
  return `<span class="day">${d.short}</span><span class="wx" title="${WEATHER[w].name}">${icon(S.phase === 'evening' || S.phase === 'final' ? 'moon' : wi)}</span><span class="clock">${clock}</span><span class="cash">${icon('coin')}${money(S.money)}</span><span class="rep" title="Reputation">${icon('star')}${Math.round(S.rep)}</span><span class="sp"></span><button class="iconbtn" data-act="settings" aria-label="Settings">${icon('gear')}</button>`;
};

/* ---------- title ---------- */
function titleScreen() {
  const saved = load();
  return {
    kind: 'title', w: TIW, h: TIH, fps: 30,
    enter() { music('title'); ambience('night'); },
    draw(fb, t) { renderTitle(fb, t); },
    pointer(type) { if (type === 'tap') { unlock(); music('title'); sfx('pop'); } },
    panel() {
      const S = saved;
      return `<div class="title"><p class="sub">A vet sim for very strange pets · week one demo · v${VERSION}</p>
        <p>You've inherited a run-down clinic for creatures no other vet will touch. Examine them under the lamp, run the right tests, work out what's really wrong, and make rent by Friday.</p>
        <div class="btns col">${S ? `<button class="primary" data-act="continue">Continue: ${WEEK[Math.min(S.day, 5)].name}, ${money(S.money)}</button>` : ''}
        <button class="${S ? '' : 'primary'}" data-act="newgame">${S ? 'Start a new week' : 'Start the week'}</button>
        <button data-act="settings">Settings</button></div>
        ${oldSave() && !S ? '<p class="fine">This version has a lot of new medicine in it, so saves from the first demo can\'t carry over.</p>' : ''}
        <p class="fine">Tip: drag across a patient to move the exam lamp. Signs of illness only show where the light is close.</p></div>`;
    },
  };
}
ACT.newgame = () => { unlock(); sfx('start'); newGame(); setScreen(hubScreen('morning')); };
ACT.continue = () => {
  unlock(); sfx('start'); G.S = load(); if (!G.S) return ACT.newgame();
  const S = G.S;
  if (S.phase === 'open') setScreen(hallScreen());
  else if (S.phase === 'weekend') setScreen(G.weekendScreen());
  else setScreen(hubScreen(S.phase === 'final' ? 'final' : S.phase));
};
ACT.title = () => setScreen(titleScreen());
G.labDraw = (fb, t) => renderDiorama(fb, t, THEMES.night, { kennel: G.S.kennel });

/* ---------- loop ---------- */
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now; G.clock += dt;
  const s = G.scr;
  if (s) {
    if (s.update) s.update(dt);
    if (G.clock - s.last >= 1 / s.fps - 0.004) {
      s.last = G.clock;
      try { if (s.canvas) s.draw(vctx, G.clock); else { s.draw(s.fb, G.clock); vctx.putImageData(s.fb.img, 0, 0); } }
      catch (err) { console.error(err); }
    }
  }
  requestAnimationFrame(loop);
}

/* ---------- pointer input on the view ---------- */
let ptr = null;
const toView = (e) => { const r = view.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * view.width, (e.clientY - r.top) / r.height * view.height]; };
view.addEventListener('pointerdown', (e) => { unlock(); const [x, y] = toView(e); ptr = { x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false, lx: x, ly: y }; try { view.setPointerCapture(e.pointerId); } catch (_) { /* fine */ } if (G.scr && G.scr.pointer) G.scr.pointer('down', x, y, ptr); });
view.addEventListener('pointermove', (e) => { const [x, y] = toView(e); if (ptr && Math.hypot(e.clientX - ptr.x0, e.clientY - ptr.y0) > 6) ptr.moved = true; if (G.scr && G.scr.pointer) G.scr.pointer('move', x, y, ptr, e); if (ptr) { ptr.lx = x; ptr.ly = y; } });
const up = (e) => { const [x, y] = toView(e); if (ptr && G.scr && G.scr.pointer) { G.scr.pointer('up', x, y, ptr); if (!ptr.moved && performance.now() - ptr.t0 < 500) G.scr.pointer('tap', x, y, ptr); } ptr = null; };
view.addEventListener('pointerup', up); view.addEventListener('pointercancel', () => { ptr = null; });
document.addEventListener('pointerdown', () => unlock(), { once: true });

/* ---------- boot ---------- */
for (const k of ['morning', 'night', 'cursed']) setTimeout(() => prewarm(THEMES[k]), 80);
setScreen(titleScreen());
requestAnimationFrame(loop);
window.__ppc = { G, ACT, setScreen, hubScreen, hallScreen, startDay };
