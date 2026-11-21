// Shared state and plumbing: the save, the current screen, the panel under the view,
// toasts, dialogs, buttons and small pixel icons.
import { FB, clamp } from './util.js';
import { sfx, unlock } from './audio.js';

export const $ = (s) => document.querySelector(s);
export const view = $('#view'), vctx = view.getContext('2d');
export const panel = $('#panel'), hud = $('#hud'), modal = $('#modal'), modalCard = $('#modal-card');
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const fmt = (m) => { const h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'PM' : 'AM', hh = ((h + 11) % 12) + 1; return `${hh}:${String(mm).padStart(2, '0')} ${ap}`; };
export const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n));

export const G = { S: null, scr: null, clock: 0, hudFn: null };
export const SAVE_KEY = 'ppc-save-v2';
export function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.S)); } catch (e) { /* storage may be full or blocked */ } }
export function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return s && s.v === 2 ? s : null; } catch (e) { return null; } }
export function oldSave() { try { return !!localStorage.getItem('ppc-save-v1'); } catch (e) { return false; } }

export function addMoney(n) { const S = G.S; S.money += n; if (n > 0) { S.stats.earned += n; S.today.earned += n; } else { S.stats.spent -= n; S.today.spent -= n; } renderHud(); }
export function addRep(n) { const S = G.S, before = S.rep; S.rep = clamp(S.rep + n, 0, 100); S.today.rep += S.rep - before; renderHud(); }

/* ---------- screens ---------- */
export function setScreen(s) {
  G.scr = s; s.last = -1;
  if (view.width !== s.w || view.height !== s.h) { view.width = s.w; view.height = s.h; }
  s.fb = s.canvas ? null : new FB(s.w, s.h);
  view.dataset.screen = s.kind;
  const st = $('#stage'); st.classList.remove('fade'); void st.offsetWidth; st.classList.add('fade');
  if (s.enter) s.enter();
  renderHud(); renderPanel();
}
export function renderHud() { if (G.hudFn) hud.innerHTML = G.hudFn(); }
export function renderPanel() { const keep = panel.scrollTop; panel.innerHTML = G.scr && G.scr.panel ? G.scr.panel() : ''; if (G.scr && G.scr.keepScroll) panel.scrollTop = keep; else panel.scrollTop = 0; }

/* ---------- actions from buttons ---------- */
export const ACT = {};
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  unlock(); const f = ACT[b.dataset.act]; if (f) { sfx('ui'); f(b.dataset, b); }
});

/* ---------- toast & modal ---------- */
let toastTimer = 0;
export function toast(msg, ms = 2800) {
  const el = $('#toast'); el.textContent = msg; el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.classList.remove('show'); el.hidden = true; }, ms);
}
export function openModal(html, cls = '') { modalCard.className = cls; modalCard.innerHTML = html; modal.hidden = false; modalCard.scrollTop = 0; }
export function closeModal() { modal.hidden = true; modalCard.innerHTML = ''; }
ACT.close = () => closeModal();
modal.addEventListener('click', (e) => { if (e.target === modal && !modalCard.classList.contains('sticky')) closeModal(); });

/* ---------- pixel icons, drawn once at start ---------- */
const ICONS = {
  coin: ['..####..', '.#oooo#.', '#oo##oo#', '#o#oo#o#', '#o#oo#o#', '#oo##oo#', '.#oooo#.', '..####..'],
  star: ['...#....', '...##...', '..####..', '########', '.######.', '..####..', '.##..##.', '#......#'],
  clock: ['..####..', '.#....#.', '#...#..#', '#...#..#', '#...###.', '#......#', '.#....#.', '..####..'],
  sun: ['#..#..#.', '.#....#.', '..####..', '#.####.#', '..####..', '.#....#.', '#..#..#.', '........'],
  rain: ['..####..', '.######.', '########', '.######.', '........', '.#..#..#', '#..#..#.', '........'],
  fog: ['........', '######..', '........', '.#######', '........', '#####...', '........', '..######'],
  heat: ['...#....', '..###...', '..###.#.', '.#####..', '.##o###.', '##ooo##.', '##ooo##.', '.#####..'],
  heart: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'],
  gear: ['...##...', '.######.', '.##..##.', '##....##', '##....##', '.##..##.', '.######.', '...##...'],
  moon: ['..###...', '.##.....', '##......', '##......', '##......', '.##.....', '..###...', '........'],
};
const ICON_COL = { coin: ['#f2b13a', '#ffe29a'], star: ['#ffd65a'], clock: ['#cfe4dd'], sun: ['#ffcc4d'], rain: ['#9ab8e8', '#cfe0ff'], fog: ['#b8c0c8'], heat: ['#ff7a4d', '#ffd25a'], heart: ['#ef6a7a'], gear: ['#b8c4c0'], moon: ['#e8e0ff'] };
export const ICON = {};
for (const [k, rows] of Object.entries(ICONS)) {
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; const x = c.getContext('2d');
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#' || ch === 'o') { x.fillStyle = ch === 'o' ? (ICON_COL[k][1] || ICON_COL[k][0]) : ICON_COL[k][0]; x.fillRect(i, j, 1, 1); } }));
  ICON[k] = c.toDataURL();
}
export const icon = (k, cls = '') => `<img class="ico ${cls}" src="${ICON[k]}" alt="">`;
