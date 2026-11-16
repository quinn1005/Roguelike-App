// Mint Condition: first slice (5 days). Screens, desk interaction, economy and story flow.
import { LINES, CARDS, DAYS, TOOLS, TIERS, RENT, FOOD, START_MONEY, MAX_CITATIONS, PACKS } from './data.js';
import { cardSVG, hitPoint, defectName, cardSize } from './cardsvg.js';
import { subsFrom, finalGrade, centerPct, gradeName, trueGrade } from './grading.js';
import { makeRng, makeSubmission, truthOf, makeInst, rollVariants, pickCard, pickQuality, cardValue, cardValueRaw, cardTitle, variantLabels, rarityName, blankInst, makeFake } from './gen.js';
import { storySubs, onStoryStamp, morningLetters, eveningEvents, dayName } from './story.js';
import { VERSION } from './version.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const app = $('#app');
const SAVE = 'mint-condition-save-v1';
const pad3 = (n) => String(n).padStart(3, '0');
const money = (n) => (n < 0 ? '−$' : '$') + Math.abs(Math.round(n));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmtG = (g) => (g % 1 ? g.toFixed(1) : String(g));
let S = null; // saved state
let D = null; // desk (shift) state

// ------------------------------------------------------------------ utilities
function toast(msg, cls = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + cls;
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
function save() { try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
function loadSave() { try { const s = localStorage.getItem(SAVE); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE); } catch (e) { /* ignore */ } }

const modals = [];
function modal(html, opts = {}) {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="panel ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(m);
  modals.push(m);
  m.close = () => { m.remove(); const i = modals.indexOf(m); if (i > -1) modals.splice(i, 1); if (opts.onClose) opts.onClose(); };
  if (opts.dismiss !== false) m.addEventListener('pointerdown', (e) => { if (e.target === m) m.close(); });
  return m;
}
function closeAllModals() { [...modals].forEach((m) => m.remove()); modals.length = 0; }

function letterHTML(l) {
  return `<div class="paper letter"><div class="from">${esc(l.from)}</div>${l.body.map((p) => `<p class="${/^[A-Z ]{4,20}$/.test(p) ? 'loud' : ''}">${esc(p)}</p>`).join('')}</div>`;
}

// Show a queue of letters/events one by one, then call done.
function runEvents(list, done) {
  if (!list.length) return done();
  const ev = list.shift();
  const choices = ev.choices || [{ id: 'ok', label: 'Continue' }];
  const m = modal(`${letterHTML(ev)}<div class="row">${choices.map((c) => {
    const broke = c.cost && S.money < c.cost;
    return `<button class="btn ${c.id === 'no' || c.id === 'ok' ? '' : 'primary'}" data-c="${c.id}" ${broke ? 'disabled' : ''}>${esc(c.label)}${broke ? ' (not enough money)' : ''}</button>`;
  }).join('')}</div>`, { dismiss: false });
  $$('[data-c]', m).forEach((b) => b.addEventListener('click', () => {
    const c = choices.find((x) => x.id === b.dataset.c);
    if (ev.id) S.flags[ev.id] = c.id;
    if (c.cost) S.money -= c.cost;
    if (ev.cost && ev.forced) S.money -= ev.cost;
    if (ev.gain) S.money += ev.gain;
    m.close();
    runEvents(list, done);
  }));
}

// ------------------------------------------------------------------ title
function showTitle() {
  closeAllModals();
  const saved = loadSave();
  const t = (l, n, v = {}) => { const i = blankInst(l, n); Object.assign(i.v, v); return cardSVG(i, { clean: true }); };
  app.innerHTML = `<div class="screen title-screen">
    <div class="title-cards">${t('ns', 1, { holo: true })}${t('gg', 1)}${t('bl', 1, { shadowless: true, first: true })}</div>
    <h1>Mint<span>Condition</span></h1>
    <p>You grade trading cards for a living. Every fake you catch costs someone. Every one you miss costs you.</p>
    <div class="title-actions">
      ${saved && saved.phase !== 'end' ? `<button class="btn primary" id="cont">Continue · ${dayName(saved.day)}</button>` : ''}
      <button class="btn ${saved && saved.phase !== 'end' ? '' : 'primary'}" id="new">New game</button>
    </div>
    <p class="mono" style="font-size:11px">v${VERSION} · First slice · 5 days · 3 card lines</p>
  </div>`;
  if ($('#cont')) $('#cont').onclick = () => { S = saved; resume(); };
  $('#new').onclick = () => {
    if (saved && saved.phase !== 'end') {
      const m = modal(`<h2>Start over?</h2><p>Your current week will be lost.</p><div class="row"><button class="btn" data-x>Keep playing</button><button class="btn danger" data-y>Start over</button></div>`);
      $('[data-x]', m).onclick = () => m.close();
      $('[data-y]', m).onclick = () => { m.close(); newGame(); };
    } else newGame();
  };
}

function resume() {
  if (S.phase === 'evening') return showCity();
  return showMorning();
}

function newGame() {
  const seed = Math.floor(Math.random() * 1e9);
  const R = makeRng(seed);
  const starter = [['bl', 1], ['gg', 2], ['ns', 4]].map(([l, n]) => makeInst(R, l, n, 'nice'));
  S = { v: 1, day: 1, money: START_MONEY, rent: RENT, citations: 0, flags: {}, collection: starter, seed, phase: 'morning', actions: 2, eve: null,
    stats: { graded: 0, correct: 0, cited: 0, earned: 0, bribes: 0 }, history: [] };
  save();
  showMorning();
}

// ------------------------------------------------------------------ morning
function showMorning() {
  closeAllModals();
  S.phase = 'morning';
  save();
  const cfg = DAYS[S.day - 1];
  const rules = DAYS.slice(0, S.day).flatMap((d, i) => d.rules.map((r) => ({ r, isNew: i === S.day - 1 && S.day > 1 })));
  const newTools = S.day > 1 ? cfg.tools.filter((t) => !DAYS[S.day - 2].tools.includes(t)) : [];
  const letters = morningLetters(S.day, S.flags, S);
  app.innerHTML = `<div class="screen scroll"><div class="memo-wrap">
    <div class="paper memo">
      <div class="head"><h2>GEMLINE AUTHENTICATION · BULLETIN</h2><span>${dayName(S.day)}, day ${S.day} of 5</span></div>
      <ol>${rules.map((x) => `<li class="${x.isNew ? 'new' : ''}">${x.isNew ? '<span class="tag">NEW</span>' : ''}${esc(x.r)}</li>`).join('')}</ol>
      <div class="stats"><span>QUOTA: ${cfg.quota} CARDS</span><span>LINES: ${cfg.lines.map((l) => LINES[l].name.toUpperCase()).join(', ')}</span>${newTools.length ? `<span>NEW TOOL: ${newTools.map((t) => TOOLS[t].name.toUpperCase()).join(', ')}</span>` : ''}<span>CITATIONS: ${S.citations}/${MAX_CITATIONS}</span><span>CASH: ${money(S.money)}</span>${S.day === 5 ? `<span>RENT DUE TONIGHT: ${money(S.rent)}</span>` : ''}</div>
    </div>
    ${letters.map(letterHTML).join('')}
    <button class="btn primary" id="go">Start the shift · 9:00</button>
    <button class="btn small" id="quit">Back to title</button>
  </div></div>`;
  $('#go').onclick = startShift;
  $('#quit').onclick = showTitle;
}

// ------------------------------------------------------------------ desk
const ICONS = {
  hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="9" height="13" rx="1.5"/><rect x="12" y="5" width="9" height="13" rx="1.5" stroke-dasharray="2 2"/><path d="M8 21h8M14 19l2 2-2 2"/></svg>',
  loupe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L21 21"/></svg>',
  ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>',
  uv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z"/></svg>',
  binder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h12"/></svg>',
};

function startShift() {
  closeAllModals();
  const cfg = DAYS[S.day - 1];
  const R = makeRng(S.seed + S.day * 7919);
  D = { cfg, R, story: storySubs(R, S.day, S.flags), served: 0, minute: 0, sub: null, face: 'front', tool: 'hand', uv: false, ruler: false, measured: false,
    found: new Set(), paid: {}, log: [], ended: false, coach: S.day === 1 ? 0 : -1, timer: null, busy: false };
  app.innerHTML = `<div class="screen desk">
    <div class="topbar">
      <span class="day">${dayName(S.day).slice(0, 3)}</span>
      <span class="chip clock" id="clock">9:00</span>
      <span class="chip" id="quota"></span>
      <span class="grow"></span>
      <span class="chip" id="cash"></span>
      <span class="chip" id="cites" title="Citations this week"></span>
      <button class="btn small" id="clockout" hidden>Clock out</button>
    </div>
    <div class="desk-main">
      <div class="stage-wrap" id="wrap">
        <div class="stage" id="stage"><div id="cardview" style="width:100%;height:100%"></div><div id="marks"></div>
          <div class="lens" id="lens" hidden><div class="inner" id="lensInner"></div><div class="cross"></div></div></div>
        <div class="coach" id="coach" hidden></div>
      </div>
      <aside class="side" id="side" data-tab="form">
        <div class="side-tabs" role="tablist"><button data-tab="form" aria-selected="true">Form</button><button data-tab="sheet" aria-selected="false">Worksheet</button></div>
        <div class="side-body"><div class="paper form" id="form"></div><div class="sheet-wrap"><div class="sheet" id="sheet"></div></div></div>
      </aside>
    </div>
    <div class="toolbar" id="toolbar">
      ${['hand', 'loupe', 'ruler', 'uv', 'binder'].map((t) => `<button class="tool" data-tool="${t}" ${cfg.tools.includes(t) ? '' : 'disabled title="Not issued yet"'}>${ICONS[t]}<span>${TOOLS[t].name}</span></button>`).join('')}
      <button class="verdict-btn" id="verdictBtn">VERDICT</button>
    </div>
  </div>`;
  $$('.side-tabs button').forEach((b) => b.onclick = () => {
    $('#side').dataset.tab = b.dataset.tab;
    $$('.side-tabs button').forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
  });
  $$('.tool').forEach((b) => b.onclick = () => useTool(b.dataset.tool));
  $('#verdictBtn').onclick = openVerdict;
  $('#clockout').onclick = () => {
    const m = modal(`<h2>Clock out early?</h2><p>You've met today's quota. The rest of the queue goes to Dot.</p><div class="row"><button class="btn" data-x>Keep working</button><button class="btn primary" data-y>Clock out</button></div>`);
    $('[data-x]', m).onclick = () => m.close();
    $('[data-y]', m).onclick = () => { m.close(); endShift(true); };
  };
  bindStage();
  window.addEventListener('resize', fitStage);
  window.addEventListener('keydown', onKey);
  nextCard();
  updateTop();
  D.timer = setInterval(tick, 1000);
}

function onKey(e) {
  if (!D || D.ended || modals.length) return;
  const k = e.key.toLowerCase();
  const map = { h: 'hand', l: 'loupe', r: 'ruler', u: 'uv', b: 'binder' };
  if (map[k] && D.cfg.tools.includes(map[k])) useTool(map[k]);
  if (k === 'f') flip();
  if (k === 'v' || k === 'enter') openVerdict();
}

function tick() {
  if (!D || D.ended || document.hidden || D.busy) return;
  if (modals.some((m) => m.dataset.pause)) return;
  addMinutes(1, true);
}
function addMinutes(n, quiet) {
  D.minute += n;
  if (!quiet) toast(`+${n} min`);
  updateTop();
  if (D.minute >= 480 && !D.ended) endShift(false);
}
function clockStr(m) { const h = 9 + Math.floor(m / 60), mm = m % 60; return `${h > 12 ? h - 12 : h}:${String(mm).padStart(2, '0')}${h >= 12 ? ' pm' : ' am'}`; }
function updateTop() {
  if (!$('#clock')) return;
  const c = $('#clock');
  c.textContent = clockStr(Math.min(D.minute, 480));
  c.classList.toggle('late', D.minute >= 420);
  $('#quota').textContent = `${D.served}/${D.cfg.quota} cards`;
  $('#cash').textContent = money(S.money);
  $('#cites').textContent = `⚠ ${S.citations}/${MAX_CITATIONS}`;
  $('#clockout').hidden = D.served < D.cfg.quota;
}

function nextCard() {
  const st = D.story.find((x) => x.at === D.served && !x.used);
  if (st) { st.used = true; D.sub = st.sub; } else D.sub = makeSubmission(D.R, D.cfg, S.day);
  D.face = 'front'; D.uv = false; D.ruler = false; D.measured = false; D.found = new Set(); D.paid = {};
  if (D.tool !== 'loupe') D.tool = 'hand';
  renderForm();
  renderCard(true);
  renderSheet();
  updateTools();
  coach();
}

function fitStage() {
  const wrap = $('#wrap'), stage = $('#stage');
  if (!wrap || !stage) return;
  const cs = getComputedStyle(wrap);
  const w = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const h = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const H = Math.max(120, Math.min(h, (w * 350) / 250));
  stage.style.height = H + 'px';
  stage.style.width = (H * 250) / 350 + 'px';
  renderMarks();
}

function renderCard(slideIn) {
  const inst = D.sub.inst;
  $('#cardview').innerHTML = cardSVG(inst, { face: D.face, uv: D.uv, ruler: D.ruler });
  $('#lensInner').innerHTML = cardSVG(inst, { face: D.face, uv: D.uv, micro: true });
  if (slideIn) { const cv = $('#cardview'); cv.classList.remove('slide-in'); void cv.offsetWidth; cv.classList.add('slide-in'); }
  fitStage();
}

function renderMarks() {
  const marks = $('#marks'), stage = $('#stage');
  if (!marks || !D || !D.sub) return;
  if (D.face !== 'front') { marks.innerHTML = ''; return; }
  const list = D.sub.inst.defects.filter((d) => D.found.has(d.id));
  marks.innerHTML = list.map((d, i) => { const [x, y] = hitPoint(d); return `<div class="tagmark" style="left:${(x / 250) * 100}%;top:${(y / 350) * 100}%">${i + 1}</div>`; }).join('');
}

function renderForm() {
  const f = D.sub.form, L = LINES[f.line];
  $('#form').innerHTML = `<div class="fhead"><span>GEMLINE · SUBMISSION</span><span>No. ${f.no}</span></div>
    <dl>
      <dt>Client</dt><dd>${esc(f.client)}</dd>
      <dt>Service</dt><dd>${TIERS[f.tier].name} · ${money(TIERS[f.tier].pay)}</dd>
      <dt>Card</dt><dd>${esc(f.name)}</dd>
      <dt>Set</dt><dd>${esc(L.name)} (${L.year})</dd>
      <dt>Number</dt><dd>${pad3(f.n)}/${pad3(L.total)}</dd>
      <dt>Variant</dt><dd>${f.claims.length ? esc(f.claims.join(', ')) : 'None claimed'}</dd>
      <dt>Declared</dt><dd>${esc(f.declared)}</dd>
    </dl>${f.note ? `<div class="note">${esc(f.note)}</div>` : ''}`;
}

function worksheet() {
  const inst = D.sub.inst;
  const found = inst.defects.filter((d) => D.found.has(d.id));
  const c = centerPct(inst.dx, inst.dy);
  const subs = subsFrom(found, D.measured ? c.worst : null);
  return { subs, grade: finalGrade(subs), found, c };
}

function renderSheet() {
  const w = worksheet();
  const cats = [['Corners', 'corners'], ['Edges', 'edges'], ['Surface', 'surface']];
  $('#sheet').innerHTML = `<h3>Worksheet</h3>
    <div class="subs">
      <span>Centering</span><span class="v">${D.measured ? fmtG(w.subs.centering) : '10?'}</span>
      <span class="dim">${D.measured ? `L/R ${Math.round(w.c.lr)}/${Math.round(100 - w.c.lr)} · T/B ${Math.round(w.c.tb)}/${Math.round(100 - w.c.tb)} · ${cardSize(D.sub.inst)}` : 'Not measured. Counts as 10.'}</span>
      ${cats.map(([n, k]) => `<span>${n}</span><span class="v">${fmtG(w.subs[k])}</span>`).join('')}
    </div>
    <div class="grade-big"><span class="num">${fmtG(w.grade)}</span><span class="nm">${gradeName(w.grade, w.subs)}</span></div>
    <ul class="taglist">${w.found.length ? w.found.map((d, i) => `<li>${i + 1}. <b>${defectName(d)}</b></li>`).join('') : '<li>No flaws tagged yet.</li>'}</ul>`;
}

function updateTools() {
  $$('.tool').forEach((b) => {
    const t = b.dataset.tool;
    const on = t === 'hand' || t === 'loupe' ? D.tool === t : t === 'ruler' ? D.ruler : t === 'uv' ? D.uv : false;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  const st = $('#stage');
  st.classList.toggle('tool-loupe', D.tool === 'loupe');
  st.classList.toggle('tool-hand', D.tool === 'hand');
}

function useTool(t) {
  if (!D || D.ended || D.busy) return;
  if (t === 'hand' || t === 'loupe') { D.tool = t; $('#lens').hidden = true; }
  if (t === 'ruler') {
    if (!D.paid.ruler) { D.paid.ruler = true; addMinutes(3); }
    D.ruler = !D.ruler; D.measured = true;
    renderCard(); renderSheet();
  }
  if (t === 'uv') {
    if (!D.paid.uv) { D.paid.uv = true; addMinutes(2); }
    D.uv = !D.uv;
    renderCard();
  }
  if (t === 'binder') {
    if (!D.paid.binder) { D.paid.binder = true; addMinutes(1); }
    openReference(D.sub.form.line, D.sub.form.n, D.cfg.lines);
  }
  updateTools();
  coach();
}

function flip() {
  const cv = $('#cardview');
  cv.classList.remove('flipping'); void cv.offsetWidth; cv.classList.add('flipping');
  setTimeout(() => { D.face = D.face === 'front' ? 'back' : 'front'; renderCard(); }, 170);
}

function bindStage() {
  const stage = $('#stage'), lens = $('#lens');
  let st = null;
  const pt = (e) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  const showLens = (p, touch) => {
    const Z = 3.2, R = 75;
    lens.hidden = false;
    lens.style.left = p.x - R + 'px';
    lens.style.top = p.y - R - (touch ? 95 : 0) + 'px';
    const inner = $('#lensInner');
    inner.style.width = p.w * Z + 'px'; inner.style.height = p.h * Z + 'px';
    inner.style.left = -(p.x * Z) + R + 'px'; inner.style.top = -(p.y * Z) + R + 'px';
  };
  stage.addEventListener('pointerdown', (e) => {
    if (!D || D.ended || D.busy) return;
    const p = pt(e);
    st = { x: p.x, y: p.y, t: Date.now(), moved: false, type: e.pointerType };
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    if (D.tool === 'loupe') showLens(p, e.pointerType !== 'mouse');
  });
  stage.addEventListener('pointermove', (e) => {
    if (!D || D.ended) return;
    const p = pt(e);
    if (st && Math.hypot(p.x - st.x, p.y - st.y) > 7) st.moved = true;
    if (D.tool === 'loupe' && (st || e.pointerType === 'mouse')) showLens(p, e.pointerType !== 'mouse');
  });
  const up = (e) => {
    if (!st) return;
    const p = pt(e);
    const tap = !st.moved && Date.now() - st.t < 600;
    if (tap && D.tool === 'hand') flip();
    if (D.tool === 'loupe') {
      if (tap) tagAt(p);
      else if (st.type !== 'mouse') tagAt(p, true); // lifting after a drag tags only if the crosshair is on a flaw
      if (st.type !== 'mouse') lens.hidden = true;
    }
    st = null;
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', () => { st = null; lens.hidden = true; });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') lens.hidden = true; });
  stage.addEventListener('contextmenu', (e) => e.preventDefault());
  requestAnimationFrame(fitStage);
}

function segDist(px, py, d) {
  const a = (d.ang || 0) * Math.PI / 180, l = 60;
  const x1 = d.x - Math.cos(a) * l, y1 = d.y - Math.sin(a) * l, x2 = d.x + Math.cos(a) * l, y2 = d.y + Math.sin(a) * l;
  const vx = x2 - x1, vy = y2 - y1, t = Math.max(0, Math.min(1, ((px - x1) * vx + (py - y1) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - (x1 + t * vx), py - (y1 + t * vy));
}

function tagAt(p, quiet) {
  if (D.face !== 'front') { toast('Tag flaws on the front. Flip the card back with the Hand.'); return; }
  const x = (p.x / p.w) * 250, y = (p.y / p.h) * 350;
  const inst = D.sub.inst;
  const R = { 1: 12, 2: 16, 3: 20 };
  let best = null, bd = 1e9;
  inst.defects.forEach((d) => {
    if (D.found.has(d.id)) return;
    if (inst.alt && inst.alt.kind === 'recolor' && inst.alt.hidden === d.id) return;
    const dist = d.kind === 'crease' ? segDist(x, y, d) : Math.hypot(x - hitPoint(d)[0], y - hitPoint(d)[1]);
    if (dist < R[d.sev] && dist < bd) { best = d; bd = dist; }
  });
  if (best) {
    D.found.add(best.id);
    toast(defectName(best) + ' tagged', 'good');
    renderMarks(); renderSheet();
    coach();
  } else {
    const already = inst.defects.some((d) => D.found.has(d.id) && Math.hypot(x - hitPoint(d)[0], y - hitPoint(d)[1]) < 16);
    if (already) { if (!quiet) toast('Already tagged.'); return; }
    if (quiet) return;
    const mm = document.createElement('div');
    mm.className = 'missmark';
    mm.style.left = (x / 250) * 100 + '%'; mm.style.top = (y / 350) * 100 + '%';
    $('#marks').appendChild(mm);
    setTimeout(() => mm.remove(), 900);
    toast('Nothing there. −1 min', 'bad');
    addMinutes(1, true);
  }
}

// Day 1 coaching on the training card.
function coach() {
  const el = $('#coach');
  if (!el || !D) return;
  if (D.coach < 0 || D.sub.story !== 'tutorial') { el.hidden = true; return; }
  if (D.coach === 1 && D.found.size >= 1) D.coach = 2;
  if (D.coach === 2 && D.measured) D.coach = 3;
  const steps = [
    '<b>1.</b> Read the submission form, then compare it with the card: name, number and claimed variant must all match. <button class="btn small primary" id="cnext">Got it</button>',
    '<b>2.</b> Pick the <b>Loupe</b>. Drag across the card to magnify it, and tap a flaw to tag it. Check all four corners, the edges and the surface. Misses cost a minute.',
    '<b>3.</b> Good. Keep hunting if you like, then use the <b>Ruler</b> to measure centering.',
    '<b>4.</b> Your <b>Worksheet</b> builds a grade from what you\'ve tagged and measured. When you\'re happy, press <b>Verdict</b>.',
  ];
  el.innerHTML = steps[D.coach];
  el.hidden = false;
  const n = $('#cnext');
  if (n) n.onclick = () => { D.coach = 1; coach(); };
}

// ------------------------------------------------------------------ reference binder
function openReference(line, n, lines) {
  let cur = { line, n: CARDS[line].some((c) => c.n === n) ? n : 1 };
  const m = modal(`<div class="row" style="justify-content:space-between;align-items:center"><h2>Reference binder</h2><button class="btn small" data-close>Close</button></div>
    <div class="shop-tabs" id="rtabs">${lines.map((l) => `<button data-l="${l}">${LINES[l].name}</button>`).join('')}</div>
    <div id="rbody"></div>`, { wide: true });
  // The clock keeps running while you read.
  $('[data-close]', m).onclick = () => m.close();
  const draw = () => {
    $$('#rtabs button', m).forEach((b) => b.setAttribute('aria-selected', b.dataset.l === cur.line ? 'true' : 'false'));
    const L = LINES[cur.line];
    const c = CARDS[cur.line].find((x) => x.n === cur.n);
    const off = blankInst(cur.line, cur.n);
    $('#rbody', m).innerHTML = `<div class="viewer">
      <div style="display:flex;gap:10px;flex:0 1 auto;margin:0 auto"><div style="width:min(190px,40vw)">${cardSVG(off, { clean: true })}</div><div style="width:min(190px,40vw)">${cardSVG(off, { clean: true, face: 'back' })}</div></div>
      <div class="info"><b style="font-family:var(--f-display);font-size:20px">${esc(c.full || c.name)}</b>
        <span class="mono">${L.setCode} · ${pad3(c.n)}/${pad3(L.total)} · ${rarityName(off)}</span>
        <ul style="margin:4px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:4px;color:var(--muted)">${L.notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    <div class="cardgrid" style="margin-top:12px">${CARDS[cur.line].map((x) => `<button class="cardcell ${x.n === cur.n ? 'picked' : ''}" data-n="${x.n}">${cardSVG(blankInst(cur.line, x.n), { clean: true })}<span>${pad3(x.n)} ${esc(x.name)}</span></button>`).join('')}</div>`;
    $$('[data-n]', m).forEach((b) => b.onclick = () => { cur.n = +b.dataset.n; draw(); });
  };
  $$('#rtabs button', m).forEach((b) => b.onclick = () => { cur = { line: b.dataset.l, n: 1 }; draw(); });
  draw();
}

// ------------------------------------------------------------------ verdict
function openVerdict() {
  if (!D || D.ended || D.busy || modals.length) return;
  const w = worksheet();
  let choice = null, grade = w.grade;
  const opts = [
    ['grade', 'GRADE', 'Authentic. Seal it with a grade.'],
    ['error', 'AUTHENTIC ERROR', 'A genuine misprint. Grade it and label it.'],
    ['altered', 'ALTERED', 'Trimmed, recolored or stamped after printing.'],
    ['counterfeit', 'COUNTERFEIT', 'Not a genuine card.'],
    ['return', 'RETURN TO CLIENT', 'The card does not match the form.'],
  ];
  const m = modal(`<h2>Verdict</h2>
    <div class="verdicts">${opts.map(([id, t, s], i) => `<button class="vopt ${i === 4 ? 'full' : ''}" data-v="${id}" aria-pressed="false"><b>${t}</b><small>${s}</small></button>`).join('')}</div>
    <div id="grow" hidden>
      <div class="stepper"><button data-d="-0.5" aria-label="Lower grade">−</button><span class="num" id="gnum"></span><button data-d="0.5" aria-label="Raise grade">+</button><span class="mono" id="gname" style="color:var(--muted);font-size:12px"></span></div>
      <p class="warnline" id="gwarn" hidden></p>
    </div>
    <div class="row"><button class="btn" data-back>Back to the card</button><button class="btn danger" data-stamp disabled>Stamp it</button></div>`);
  const sync = () => {
    $$('.vopt', m).forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === choice ? 'true' : 'false'));
    const needsGrade = choice === 'grade' || choice === 'error';
    $('#grow', m).hidden = !needsGrade;
    $('#gnum', m).textContent = fmtG(grade);
    $('#gname', m).textContent = gradeName(grade, grade === w.grade ? w.subs : null) + ` · worksheet says ${fmtG(w.grade)}`;
    const warn = $('#gwarn', m);
    warn.hidden = grade === w.grade;
    warn.textContent = grade > w.grade ? 'You are grading above your own worksheet.' : 'You are grading below your own worksheet.';
    $('[data-stamp]', m).disabled = !choice;
  };
  $$('.vopt', m).forEach((b) => b.onclick = () => { choice = b.dataset.v; sync(); });
  $$('[data-d]', m).forEach((b) => b.onclick = () => { grade = Math.max(1, Math.min(10, grade + parseFloat(b.dataset.d))); sync(); });
  $('[data-back]', m).onclick = () => m.close();
  $('[data-stamp]', m).onclick = () => { m.close(); stamp(choice, grade); };
  sync();
}

function stamp(verdict, grade) {
  D.busy = true;
  const sub = D.sub;
  const entry = { sub, verdict, grade: verdict === 'grade' || verdict === 'error' ? grade : null, truth: truthOf(sub) };
  D.log.push(entry);
  if (sub.story) onStoryStamp(sub, verdict, grade, S.flags);
  if (D.coach >= 0 && sub.story === 'tutorial') D.coach = -1;
  const label = { grade: 'GRADE ' + fmtG(grade), error: 'ERROR · ' + fmtG(grade), altered: 'ALTERED', counterfeit: 'COUNTERFEIT', return: 'RETURNED' }[verdict];
  const sa = document.createElement('div');
  sa.className = 'stamp-anim';
  sa.innerHTML = `<span>${label}</span>`;
  $('#stage').appendChild(sa);
  $('#lens').hidden = true;
  setTimeout(() => { const cv = $('#cardview'); if (cv) { cv.classList.add('slide-out'); } sa.remove(); }, 550);
  setTimeout(() => {
    if (!D || D.ended) return;
    $('#cardview').classList.remove('slide-out');
    D.served++;
    D.busy = false;
    $('#coach').hidden = true;
    nextCard();
    updateTop();
  }, 1000);
  addMinutes(2, true);
}

function endShift(early) {
  if (D.ended) return;
  D.ended = true;
  clearInterval(D.timer);
  window.removeEventListener('resize', fitStage);
  window.removeEventListener('keydown', onKey);
  closeAllModals();
  toast(early ? 'You clock out.' : 'Five o\'clock. Pens down.');
  setTimeout(showPayday, early ? 300 : 1100);
}

// ------------------------------------------------------------------ payday
function citeReason(e) {
  const ok = e.truth.ok, v = e.verdict;
  if (ok.includes('return') && v !== 'return') return 'Missed a form mismatch';
  if (ok.includes('counterfeit') && (v === 'grade' || v === 'error')) return 'Passed a counterfeit';
  if (ok.includes('altered') && (v === 'grade' || v === 'error')) return 'Passed an altered card';
  if ((ok.includes('altered') || ok.includes('counterfeit')) && (v === 'altered' || v === 'counterfeit')) return 'Wrong rejection: it was ' + (ok.includes('altered') ? 'altered' : 'counterfeit');
  if (v === 'counterfeit' || v === 'altered') return 'Rejected a genuine card';
  if (v === 'return') return 'Returned a card that matched its form';
  if (v === 'error' && ok.includes('grade')) return 'Labeled an error that isn\'t there';
  if (v === 'grade' && ok.includes('error')) return 'Missed a genuine misprint';
  return 'Wrong verdict';
}

function showPayday() {
  $('#toasts').innerHTML = '';
  const rows = [];
  let pay = 0, bonus = 0, cites = 0;
  D.log.forEach((e) => {
    const tierPay = TIERS[e.sub.form.tier].pay;
    pay += tierPay;
    const r = { name: cardTitle(e.sub.inst), verdict: e.verdict, grade: e.grade, pay: tierPay, story: e.sub.story };
    const walkIn = e.sub.story && e.sub.story !== 'tutorial';
    if (walkIn) r.res = 'story';
    else if (!e.truth.ok.includes(e.verdict)) { r.res = 'cite'; r.why = citeReason(e); cites++; }
    else if (e.grade != null && Math.abs(e.grade - e.truth.grade) >= 1) { r.res = 'cite'; r.why = `Graded ${fmtG(e.grade)}. It was a ${fmtG(e.truth.grade)}.`; cites++; }
    else { r.res = 'ok'; r.exact = e.grade == null || e.grade === e.truth.grade; if (r.exact) { bonus += 4; } }
    rows.push(r);
    S.history.push({ day: S.day, name: r.name, verdict: e.verdict, grade: e.grade, truth: e.truth.grade, ok: r.res === 'ok', story: walkIn ? e.sub.story : null });
  });
  const fines = Math.max(0, cites - 1) * 5;
  const short = Math.max(0, D.cfg.quota - D.served);
  const shortFine = short * 5;
  const rentDue = S.day === 5 ? S.rent : 0;
  const net = pay + bonus - fines - shortFine - FOOD;
  S.money += net;
  S.citations += cites;
  S.stats.graded += D.log.length;
  S.stats.correct += rows.filter((r) => r.res === 'ok').length;
  S.stats.cited += cites;
  S.stats.earned += pay + bonus;
  let rentLine = '';
  if (rentDue) {
    if (S.money >= rentDue) { S.money -= rentDue; S.flags.rent = 'paid'; rentLine = `<tr><td>Rent to Mr. Gaunt</td><td class="amt bad">−${money(rentDue)}</td></tr>`; }
    else { S.flags.rent = 'evicted'; rentLine = `<tr><td>Rent to Mr. Gaunt: <span class="cite">you are ${money(rentDue - S.money)} short</span></td><td class="amt bad">unpaid</td></tr>`; }
  }
  const vLabel = (r) => ({ grade: 'Grade ' + fmtG(r.grade), error: 'Error · ' + fmtG(r.grade), altered: 'Altered', counterfeit: 'Counterfeit', return: 'Returned' }[r.verdict]);
  app.innerHTML = `<div class="screen scroll"><div class="memo-wrap">
    <div class="paper ledger">
      <div class="memo"><div class="head" style="margin:-22px -22px 10px;padding:0 0 8px"><h2>PAYDAY · ${dayName(S.day).toUpperCase()}</h2><span>${D.served} of ${D.cfg.quota} cards</span></div></div>
      <table>
        ${rows.map((r) => `<tr><td>${esc(r.name)} · ${vLabel(r)}${r.res === 'cite' ? `<div class="cite">Citation: ${esc(r.why)}</div>` : ''}${r.res === 'ok' && r.exact ? '<div style="color:#2e7d4f;font-size:12px">Exact. +$4</div>' : ''}${r.res === 'story' ? '<div style="color:#7a6a50;font-size:12px">Walk-in. Skipped review.</div>' : ''}</td><td class="amt">+${money(r.pay)}</td></tr>`).join('') || '<tr><td>No cards graded.</td><td class="amt">$0</td></tr>'}
        ${bonus ? `<tr><td>Accuracy bonuses</td><td class="amt">+${money(bonus)}</td></tr>` : ''}
        ${cites ? `<tr><td>Citations: ${cites} (first one is a warning)</td><td class="amt bad">−${money(fines)}</td></tr>` : ''}
        ${short ? `<tr><td>Missed quota by ${short}</td><td class="amt bad">−${money(shortFine)}</td></tr>` : ''}
        <tr><td>Food</td><td class="amt bad">−${money(FOOD)}</td></tr>
        ${rentLine}
        <tr class="total"><td>Cash on hand</td><td class="amt">${money(S.money)}</td></tr>
      </table>
      <p class="mono" style="font-size:12px;color:var(--ink-soft);margin:10px 0 0">Citations this week: ${S.citations}/${MAX_CITATIONS}</p>
    </div>
    <button class="btn primary" id="home">${S.day === 5 ? 'Go home' : 'Go home'}</button>
  </div></div>`;
  $('#home').onclick = afterPayday;
  D = null;
}

function afterPayday() {
  if (S.citations >= MAX_CITATIONS) return gameOver('fired');
  const evs = eveningEvents(S.day, S.flags, S);
  app.innerHTML = '<div class="screen city"></div>';
  runEvents(evs, () => {
    if (S.day === 5) return finale();
    S.phase = 'evening';
    S.actions = 2;
    S.eve = null;
    save();
    showCity();
  });
}

// ------------------------------------------------------------------ evening city
function collectionValue() { return S.collection.reduce((s, i) => s + cardValue(i), 0); }

function showCity() {
  closeAllModals();
  $('#toasts').innerHTML = '';
  const a = S.actions;
  app.innerHTML = `<div class="screen city scroll"><div class="city-body">
    <div class="mono" style="color:var(--lamp);font-size:12px;letter-spacing:.14em">EVENING · ${dayName(S.day).toUpperCase()}</div>
    <h2>After five</h2>
    <p class="sub">${a ? `Time for ${a} more ${a === 1 ? 'thing' : 'things'} tonight.` : 'It\'s late.'} Cash ${money(S.money)}. Rent ${money(S.rent)} due Friday.</p>
    <div class="places">
      <button class="place" data-p="shop" ${a ? '' : 'disabled'}><b>Brick &amp; Mortar Cards</b><small>Packs, singles, and an owner who doesn't always know what he has.</small><span class="cost">1 action</span></button>
      <button class="place" data-p="bins" ${a ? '' : 'disabled'}><b>Night market bulk bins</b><small>$3 a dig, keep two. Mostly junk. Mostly.</small><span class="cost">1 action</span></button>
      <button class="place" data-p="diner" ${a ? '' : 'disabled'}><b>Extra shift at the Last Stop Diner</b><small>Cash in hand, no questions.</small><span class="cost">1 action · +$30</span></button>
      <button class="place" data-p="binder"><b>Your binder</b><small>${S.collection.length} cards · worth about ${money(collectionValue())}</small><span class="cost">free</span></button>
      <button class="place" data-p="sleep"><b>Go to bed</b><small>Theo is already asleep. Tomorrow is ${dayName(S.day + 1)}.</small><span class="cost">end the day</span></button>
    </div>
    <button class="btn small" id="quit">Save and quit to title</button>
  </div></div>`;
  $$('[data-p]').forEach((b) => b.onclick = () => {
    const p = b.dataset.p;
    if (p === 'shop') { S.actions--; save(); openShop(); }
    if (p === 'bins') { S.actions--; save(); openBins(); }
    if (p === 'diner') {
      S.actions--; S.money += 30; save();
      runEvents([{ from: 'Last Stop Diner', body: ['Six hours of fryer grease and regulars who tip in coins. The cook pays you thirty in cash and says you look like you haven\'t slept in a week.', 'He isn\'t wrong.'] }], showCity);
    }
    if (p === 'binder') openBinder();
    if (p === 'sleep') { S.day++; S.phase = 'morning'; S.eve = null; save(); showMorning(); }
  });
  $('#quit').onclick = () => { save(); showTitle(); };
}

// Cards that never get flagged in the city: you have to recognise them yourself.
function cityRng() { return makeRng(Math.floor(Math.random() * 1e9)); }

function eveStock() {
  if (S.eve && S.eve.day === S.day) return S.eve;
  const R = cityRng();
  const singles = [];
  for (let i = 0; i < 3; i++) {
    const line = R.pick(['gg', 'ns', 'bl']);
    const c = pickCard(R, line, { c: 3, u: 3, r: 2 });
    const inst = makeInst(R, line, c.n, pickQuality(R, -0.1));
    rollVariants(R, inst, { holoR: 0.5, holoU: 0.2, shadowless: 0.08 });
    singles.push({ inst, price: Math.max(2, Math.ceil(cardValue(inst) * 1.3)), label: 'Near mint' });
  }
  // The bargain: a chase variant the owner has misjudged.
  const bl = R() < 0.5;
  const inst = makeInst(R, bl ? 'bl' : 'gg', pickCard(R, bl ? 'bl' : 'gg').n, 'nice');
  if (bl) { inst.v.shadowless = true; inst.v.first = R() < 0.4; } else inst.v.noYellow = true;
  singles.splice(R.int(0, 3), 0, { inst, price: bl ? 4 : 3, label: bl ? 'Plain reprint' : 'Faded print?' });
  S.eve = { day: S.day, singles };
  return S.eve;
}

function cellHTML(inst, extra = '', cls = '') {
  return `<button class="cardcell ${cls}" ${extra}>${cardSVG(inst)}</button>`;
}

function openShop() {
  const stock = eveStock();
  let tab = 'packs';
  const m = modal(`<div class="row" style="justify-content:space-between;align-items:center"><h2>Brick &amp; Mortar Cards</h2><button class="btn small" data-close>Leave</button></div>
    <p style="margin:0;color:var(--muted)" id="shopcash"></p>
    <div class="shop-tabs"><button data-t="packs">Packs</button><button data-t="singles">Singles</button><button data-t="sell">Sell</button></div>
    <div id="sbody"></div>`, { wide: true, onClose: () => { save(); showCity(); } });
  $('[data-close]', m).onclick = () => m.close();
  const draw = () => {
    $('#shopcash', m).textContent = `Cash ${money(S.money)}. The owner, Lou, watches the door more than the counter.`;
    $$('[data-t]', m).forEach((b) => b.setAttribute('aria-selected', b.dataset.t === tab ? 'true' : 'false'));
    const body = $('#sbody', m);
    if (tab === 'packs') {
      body.innerHTML = `<div class="packs">${Object.entries(PACKS).map(([l, p]) => `<button class="packbtn" data-pack="${l}" ${S.money < p.price ? 'disabled' : ''}>${packSVG(l)}<b>${p.label}</b><span style="color:var(--muted)">${p.sub}</span><span class="mono" style="color:var(--lamp)">${money(p.price)}</span></button>`).join('')}</div>
        <p style="color:var(--muted);font-size:13px;margin:0">Five cards a pack: three commons, an uncommon, and a shot at a rare.</p>`;
      $$('[data-pack]', body).forEach((b) => b.onclick = () => { const l = b.dataset.pack; S.money -= PACKS[l].price; save(); openPack(l, draw); });
    }
    if (tab === 'singles') {
      body.innerHTML = `<p style="color:var(--muted);font-size:13px;margin:0">Lou prices by eye. Tap a card for a closer look.</p>
        <div class="cardgrid">${stock.singles.map((s, i) => s.sold ? '' : `<div class="cardcell" style="cursor:default"><button class="cardcell" data-look="${i}">${cardSVG(s.inst)}</button><span>${esc(cardTitle(s.inst))}</span><span class="price">${esc(s.label)} · ${money(s.price)}</span><button class="btn small primary" data-buy="${i}" ${S.money < s.price ? 'disabled' : ''}>Buy</button></div>`).join('') || '<p>Sold out.</p>'}</div>`;
      $$('[data-buy]', body).forEach((b) => b.onclick = () => { const s = stock.singles[+b.dataset.buy]; S.money -= s.price; s.sold = true; S.collection.push(s.inst); toast('Added to your binder', 'good'); save(); draw(); });
      $$('[data-look]', body).forEach((b) => b.onclick = () => viewer(stock.singles[+b.dataset.look].inst, { hideInfo: true }));
    }
    if (tab === 'sell') {
      const list = S.collection.map((inst, i) => ({ inst, i, v: Math.floor(cardValue(inst) * 0.5) })).sort((a, b) => b.v - a.v);
      body.innerHTML = `<p style="color:var(--muted);font-size:13px;margin:0">Lou pays half of what a card is worth. Cheap cards aren't worth his time.</p>
        <div class="cardgrid">${list.map((x) => `<div class="cardcell" style="cursor:default"><button class="cardcell" data-look="${x.i}">${cardSVG(x.inst)}</button><span>${esc(cardTitle(x.inst))}</span><button class="btn small" data-sell="${x.i}" ${x.v < 1 ? 'disabled' : ''}>${x.v < 1 ? 'No offer' : 'Sell ' + money(x.v)}</button></div>`).join('') || '<p>Your binder is empty.</p>'}</div>`;
      $$('[data-sell]', body).forEach((b) => b.onclick = () => {
        if (b.dataset.armed) { const idx = +b.dataset.sell; const inst = S.collection[idx]; S.money += Math.floor(cardValue(inst) * 0.5); S.collection.splice(idx, 1); toast('Sold', 'good'); save(); draw(); return; }
        b.dataset.armed = '1'; b.textContent = 'Tap again to sell'; b.classList.add('danger');
      });
      $$('[data-look]', body).forEach((b) => b.onclick = () => viewer(S.collection[+b.dataset.look]));
    }
  };
  $$('[data-t]', m).forEach((b) => b.onclick = () => { tab = b.dataset.t; draw(); });
  draw();
}

function packSVG(line) {
  const col = { gg: ['#ffd400', '#6b3fa0', '#1a1a1a'], ns: ['#ff4fd8', '#12002b', '#2ee6ff'], bl: ['#4fb3e8', '#1d4e75', '#ffffff'] }[line];
  const name = { gg: 'GRIM GROCERS', ns: 'NEON SAINTS', bl: 'BLOOMLINGS' }[line];
  return `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pk${line}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${col[0]}"/><stop offset=".5" stop-color="${col[1]}"/><stop offset="1" stop-color="${col[0]}"/></linearGradient></defs>
    <path d="M6 14L114 14L114 168L6 168Z" fill="url(#pk${line})"/>
    <path d="M6 14L12 6L18 14L24 6L30 14L36 6L42 14L48 6L54 14L60 6L66 14L72 6L78 14L84 6L90 14L96 6L102 14L108 6L114 14Z" fill="${col[1]}"/>
    <path d="M6 168L12 176L18 168L24 176L30 168L36 176L42 168L48 176L54 168L60 176L66 168L72 176L78 168L84 176L90 168L96 176L102 168L108 176L114 168Z" fill="${col[1]}"/>
    <rect x="6" y="14" width="108" height="14" fill="#000" opacity=".25"/>
    <rect x="16" y="70" width="88" height="34" rx="6" fill="${col[1]}" stroke="${col[2]}" stroke-width="2"/>
    <text x="60" y="${line === 'ns' ? 92 : 91}" text-anchor="middle" font-family="${line === 'ns' ? 'Monoton' : 'Fredoka'},sans-serif" font-weight="700" font-size="${line === 'ns' ? 9 : 11}" fill="${col[2] === '#1a1a1a' ? '#ffd400' : col[2]}">${name}</text>
    <text x="60" y="150" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="7" fill="#ffffff" opacity=".85">5 CARDS</text></svg>`;
}

function rollPack(line) {
  const R = cityRng();
  const slots = ['c', 'c', 'c', 'u', R() < 0.32 ? 'r' : 'u'];
  return slots.map((r) => {
    const opts = CARDS[line].filter((c) => c.r === r);
    const c = R.pick(opts.length ? opts : CARDS[line]);
    const inst = makeInst(R, line, c.n, pickQuality(R, -0.25));
    rollVariants(R, inst, { holoR: 0.35, holoU: 0.08, shadowless: 0, noYellow: 0.02 });
    return inst;
  });
}

function openPack(line, after) {
  const cards = rollPack(line);
  const m = modal(`<h2>${PACKS[line].label}</h2><div class="pack-stage" id="pstage">
      <p class="tear-hint">Drag across the top of the pack to tear it open. Go slowly.</p>
      <div class="pack-wrap" id="pack">${packSVG(line)}</div></div>`, { dismiss: false, onClose: after });
  const pack = $('#pack', m);
  let st = null;
  pack.addEventListener('pointerdown', (e) => {
    const r = pack.getBoundingClientRect();
    if (e.clientY - r.top > r.height * 0.3) return;
    st = { x: e.clientX, t: Date.now(), w: r.width };
    try { pack.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  pack.addEventListener('pointerup', (e) => {
    if (!st) return;
    const dist = Math.abs(e.clientX - st.x), dt = Date.now() - st.t;
    if (dist < st.w * 0.55) { st = null; toast('Drag all the way across.'); return; }
    if (dt < 260) {
      const front = cards[0];
      front.defects.push({ id: 90, cat: 'surface', sev: 3, kind: 'crease', x: 125, y: 175, ang: 12 });
      toast('Too fast. You creased the front card.', 'bad');
    }
    st = null;
    revealPack(m, cards, line);
  });
}

function revealPack(m, cards, line) {
  let i = 0;
  const body = $('#pstage', m);
  const show = () => {
    if (i >= cards.length) {
      body.innerHTML = `<div class="cardgrid" style="width:100%">${cards.map((c, k) => `<button class="cardcell" data-k="${k}">${cardSVG(c)}<span>${esc(cardTitle(c))}</span></button>`).join('')}</div>
        <button class="btn primary" data-done>Add all to binder</button>`;
      $$('[data-k]', body).forEach((b) => b.onclick = () => viewer(cards[+b.dataset.k]));
      $('[data-done]', body).onclick = () => { S.collection.push(...cards); save(); m.close(); };
      return;
    }
    const c = cards[i];
    const special = c.v.holo || c.v.noYellow || CARDS[line].find((x) => x.n === c.n).r === 'r';
    body.innerHTML = `<p class="tear-hint">${i + 1} of ${cards.length} · tap to flip the next card</p><div class="reveal ${special ? 'rare' : ''}">${cardSVG(c)}</div><p>${esc(cardTitle(c))}${variantLabels(c.v).length ? ' · ' + variantLabels(c.v).join(', ') : ''}</p>`;
    $('.reveal', body).onclick = () => { i++; show(); };
  };
  show();
}

function openBins() {
  let digs = 0, cards = [], picked = new Set();
  const m = modal(`<div class="row" style="justify-content:space-between;align-items:center"><h2>Night market bulk bins</h2><button class="btn small" data-close>Leave</button></div>
    <p style="margin:0;color:var(--muted)">A folding table under a tarp. Shoeboxes of loose cards, $3 a dig, keep two. The seller doesn't look at what you take.</p>
    <div id="bbody"></div>`, { wide: true, onClose: () => { save(); showCity(); } });
  $('[data-close]', m).onclick = () => m.close();
  const dig = () => {
    const R = cityRng();
    cards = [];
    picked = new Set();
    for (let k = 0; k < 10; k++) {
      const line = R.pick(['gg', 'ns', 'bl']);
      const c = pickCard(R, line, { c: 8, u: 3, r: 0.5 });
      const inst = makeInst(R, line, c.n, R() < 0.5 ? 'played' : 'beat');
      if (R() < 0.07) {
        if (line === 'gg') inst.v.noYellow = true;
        if (line === 'bl') { inst.v.shadowless = true; inst.v.first = R() < 0.4; }
        if (line === 'ns' && c.r !== 'c') inst.v.holo = true;
      }
      if (R() < 0.08) makeFake(R, inst, DAYS[4], [R.pick(['print', 'copyright', 'uv'])]);
      cards.push(inst);
    }
    digs++;
    draw();
  };
  const draw = () => {
    const body = $('#bbody', m);
    if (!cards.length) {
      body.innerHTML = `<button class="btn primary" data-dig ${S.money < 3 ? 'disabled' : ''}>Dig ($3)</button>`;
      $('[data-dig]', body).onclick = () => { S.money -= 3; dig(); };
      return;
    }
    body.innerHTML = `<p style="margin:0">Tap a card to look closer. Picked ${picked.size}/2.</p>
      <div class="cardgrid">${cards.map((c, k) => `<button class="cardcell ${picked.has(k) ? 'picked' : ''}" data-k="${k}">${cardSVG(c)}</button>`).join('')}</div>
      <div class="row"><button class="btn primary" data-keep ${picked.size ? '' : 'disabled'}>Keep ${picked.size || ''} and finish</button>${digs < 2 ? `<button class="btn" data-again ${S.money < 3 ? 'disabled' : ''}>Keep and dig again ($3)</button>` : ''}</div>`;
    $$('[data-k]', body).forEach((b) => b.onclick = () => {
      const k = +b.dataset.k;
      viewer(cards[k], { hideInfo: true, action: { label: picked.has(k) ? 'Put it back' : 'Keep this one', disabled: !picked.has(k) && picked.size >= 2, run: () => { picked.has(k) ? picked.delete(k) : picked.add(k); draw(); } } });
    });
    const keep = () => { picked.forEach((k) => S.collection.push(cards[k])); if (picked.size) toast(`${picked.size} added to your binder`, 'good'); };
    $('[data-keep]', body).onclick = () => { keep(); save(); m.close(); };
    const again = $('[data-again]', body);
    if (again) again.onclick = () => { keep(); S.money -= 3; dig(); };
  };
  draw();
}

// Big card viewer with flip. In the city you only see the card, not its labels.
function viewer(inst, o = {}) {
  let face = 'front';
  const m = modal(`<div class="viewer"><div class="big" id="vbig"></div><div class="info" id="vinfo"></div></div>
    <div class="row">${o.action ? `<button class="btn primary" data-act ${o.action.disabled ? 'disabled' : ''}>${esc(o.action.label)}</button>` : ''}<button class="btn" data-close>Close</button></div>`);
  const draw = () => {
    $('#vbig', m).innerHTML = cardSVG(inst, { face });
    const vl = variantLabels(inst.v);
    $('#vinfo', m).innerHTML = `<b style="font-family:var(--f-display);font-size:20px">${esc(cardTitle(inst))}</b>
      <span class="mono">${LINES[inst.line].name} · ${pad3(inst.n)}/${pad3(LINES[inst.line].total)} · ${rarityName(inst)}</span>
      ${o.hideInfo ? '<span style="color:var(--muted)">Tap the card to flip it. You\'ll have to judge it yourself.</span>' : `
        <div class="chips">${vl.map((x) => `<span class="chipv">${esc(x)}</span>`).join('')}${inst.fake ? '<span class="chipv" style="color:#ff8a7a">Counterfeit</span>' : ''}</div>
        <span>Condition: looks like about a ${fmtG(trueGrade(inst))}</span>
        <span>Worth about ${money(cardValue(inst))} raw</span>`}`;
  };
  $('#vbig', m).onclick = () => { face = face === 'front' ? 'back' : 'front'; draw(); };
  $('[data-close]', m).onclick = () => m.close();
  if (o.action) $('[data-act]', m).onclick = () => { m.close(); o.action.run(); };
  draw();
}

function openBinder() {
  let tab = 'gg';
  const m = modal(`<div class="row" style="justify-content:space-between;align-items:center"><h2>Your binder</h2><button class="btn small" data-close>Close</button></div>
    <p style="margin:0;color:var(--muted)" id="btotal"></p>
    <div class="shop-tabs">${Object.keys(LINES).map((l) => `<button data-t="${l}">${LINES[l].name}</button>`).join('')}</div>
    <div id="bb"></div>`, { wide: true });
  $('[data-close]', m).onclick = () => m.close();
  const draw = () => {
    $('#btotal', m).textContent = `${S.collection.length} cards · worth about ${money(collectionValue())}`;
    $$('[data-t]', m).forEach((b) => b.setAttribute('aria-selected', b.dataset.t === tab ? 'true' : 'false'));
    const owned = CARDS[tab].map((c) => {
      const copies = S.collection.filter((i) => i.line === tab && i.n === c.n);
      copies.sort((a, b) => cardValue(b) - cardValue(a));
      return { c, copies };
    });
    const have = owned.filter((o) => o.copies.length).length;
    $('#bb', m).innerHTML = `<p class="mono" style="margin:0;font-size:12px;color:var(--muted)">${have}/${CARDS[tab].length} in the set</p>
      <div class="cardgrid">${owned.map((o) => o.copies.length
        ? `<button class="cardcell" data-n="${o.c.n}">${cardSVG(o.copies[0])}${o.copies.length > 1 ? `<span class="badge">×${o.copies.length}</span>` : ''}<span>${pad3(o.c.n)} ${esc(o.c.name)}</span></button>`
        : `<div class="cardcell empty"><div class="slot">${pad3(o.c.n)}</div><span>${esc(o.c.name)}</span></div>`).join('')}</div>`;
    $$('[data-n]', m).forEach((b) => b.onclick = () => {
      const copies = S.collection.filter((i) => i.line === tab && i.n === +b.dataset.n).sort((a, c) => cardValue(c) - cardValue(a));
      if (copies.length === 1) return viewer(copies[0]);
      const mm = modal(`<h2>${esc(cardTitle(copies[0]))}</h2><div class="cardgrid">${copies.map((c, k) => `<button class="cardcell" data-k="${k}">${cardSVG(c)}<span class="price">${money(cardValue(c))}</span><span>${esc(variantLabels(c.v).join(', ') || 'Regular')}</span></button>`).join('')}</div><button class="btn" data-close>Close</button>`, { wide: true });
      $('[data-close]', mm).onclick = () => mm.close();
      $$('[data-k]', mm).forEach((x) => x.onclick = () => viewer(copies[+x.dataset.k]));
    });
  };
  $$('[data-t]', m).forEach((b) => b.onclick = () => { tab = b.dataset.t; draw(); });
  draw();
}

// ------------------------------------------------------------------ endings
function finale() {
  const f = S.flags, ev = [];
  const took = f.vince1 === 'took', took2 = f.vince2 === 'took';
  const bad = S.history.filter((h) => !h.ok && !h.story);
  if (took) {
    ev.push({ from: 'Director Pike\'s office, 5:40 p.m.', body: [
      'Pike has three of your slabs on his desk. One of them is the Ashowl you sealed as a 9.',
      '"This isn\'t a nine," he says. He doesn\'t raise his voice. He doesn\'t call security.',
      '"Carrow pays you. Fine. From Monday, Carrow pays me, through you. You\'ll keep grading his walk-ins. You\'ll keep the envelopes. Half of each one comes to this office."',
      'The audit report on his desk already says CLEAN. You realize the audit was never about the cards.',
    ] });
  } else if (bad.length >= 4) {
    ev.push({ from: 'Director Pike\'s office, 5:40 p.m.', body: [
      `Pike lays out ${Math.min(bad.length, 5)} of your slabs in a row. Every one of them is wrong.`,
      '"One more week like this," he says, "and you can go back to whatever you did before. I hear the diner is hiring."',
    ] });
  } else {
    ev.push({ from: 'Director Pike\'s office, 5:40 p.m.', body: [
      'Pike re-grades three of your slabs at his desk, slowly, with his own loupe.',
      '"Clean," he says, like the word costs him something. Then, without looking up: "Carrow\'s people have been asking about you. Whatever you\'re doing, keep doing it."',
    ] });
  }
  if (f.vince1 === 'refused' || (took && f.vince2 === 'refused')) {
    const best = [...S.collection].sort((a, b) => cardValue(b) - cardValue(a))[0];
    const body = ['When you get home the door is open. Not broken. Open. Someone had a key.', 'Your binder is on the kitchen floor, every page turned.'];
    if (best) {
      S.collection.splice(S.collection.indexOf(best), 1);
      body.push(`Your ${cardTitle(best)} is gone. Its sleeve is on the table, cut in half with scissors.`);
    }
    body.push('On Theo\'s pillow, face up: a Neon Saints card. Midnight Magnus. "The lights go out. So do you."', 'Theo is at the neighbor\'s. He doesn\'t know. You put the card in your pocket before you go and get him.');
    ev.push({ from: 'Home, 7:15 p.m.', body });
  }
  if (took && took2) ev.push({ from: 'Home, 7:15 p.m.', body: ['There is a new lock on your door. The key is taped to it, with a note: "For your protection. — V."', 'You don\'t have a copy. You never will.'] });
  if (f.mina === 'truth' && f.minaPay === 'yes') ev.push({ from: 'A letter, no stamp', body: ['Inside is a crayon drawing of a wrestler with a pink mohawk, and four words in careful handwriting:', '"Thank you for checking."', 'There is no return address. There doesn\'t need to be.'] });
  else if (f.mina === 'truth') ev.push({ from: 'Saturday paper, classifieds', body: ['Apartment for rent, Sorensen building, 3rd floor. Available immediately. Furniture included, if wanted.'] });
  else if (f.mina === 'lied') ev.push({ from: 'Three weeks later', body: ['The Thunder Mama sells at auction for $310. The buyer has it re-graded at Apex.', 'The lawyer\'s letter goes to Mina\'s mother. It names Gemline Authentication, and it names the grader.', 'Pike will want to see you about it.'] });
  if (f.inhaler === 'no') ev.push({ from: 'Theo', body: ['He doesn\'t talk about the hospital. He sleeps with the new inhaler under his pillow now, and checks it twice before school.'] });
  if (f.rent === 'evicted') ev.push({ from: 'Mr. Gaunt', body: ['He changes the locks at six. Your binder and Theo\'s school bag are on the landing, in a garbage bag.', '"I told you," he says through the door. "I don\'t care about the boy."'] });
  app.innerHTML = '<div class="screen city"></div>';
  runEvents(ev, endScreen);
}

function endScreen() {
  const f = S.flags;
  let title = 'Still Standing', line = 'You made it through your first week at Gemline. Barely, and not cleanly, but you made it.';
  if (f.rent === 'evicted') { title = 'Out on the Street'; line = 'You graded cards all week and still couldn\'t make rent. Gemline doesn\'t care where you sleep, as long as you\'re at your desk by nine.'; }
  else if (f.vince1 === 'took') { title = 'Bought and Paid For'; line = 'Carrow owns your grades. Pike owns you. The envelopes keep coming, and so do the walk-ins.'; }
  else if (f.vince1 === 'refused') { title = 'Clean Hands, Open Door'; line = 'You said no to Vince Carrow. Your grades are honest. Your door doesn\'t lock anymore.'; }
  S.phase = 'end';
  save();
  const acc = S.stats.graded ? Math.round((S.stats.correct / S.stats.graded) * 100) : 0;
  const best = [...S.collection].sort((a, b) => cardValue(b) - cardValue(a))[0];
  app.innerHTML = `<div class="screen end scroll">
    <div class="kicker">End of week one</div>
    <h1>${esc(title)}</h1>
    <p style="max-width:52ch;text-align:center;color:var(--muted)">${esc(line)}</p>
    <div class="paper ledger"><table>
      <tr><td>Cards graded</td><td class="amt">${S.stats.graded}</td></tr>
      <tr><td>Correct calls</td><td class="amt">${acc}%</td></tr>
      <tr><td>Citations</td><td class="amt">${S.citations}</td></tr>
      <tr><td>Cash</td><td class="amt">${money(S.money)}</td></tr>
      <tr><td>Binder</td><td class="amt">${S.collection.length} cards · ${money(collectionValue())}</td></tr>
      <tr><td>Best card</td><td class="amt">${best ? esc(cardTitle(best)) + (variantLabels(best.v).length ? ' (' + variantLabels(best.v).join(', ') + ')' : '') : 'none'}</td></tr>
      <tr><td>Mina's card</td><td class="amt">${{ truth: 'Told the truth', lied: 'Passed it', returned: 'Sent it back' }[f.mina] || 'Never saw it'}</td></tr>
      <tr><td>Vince Carrow</td><td class="amt">${f.vince1 === 'took' ? 'Took the money' : f.vince1 === 'refused' ? 'Refused' : 'Never met'}</td></tr>
    </table></div>
    <p style="max-width:52ch;text-align:center">This is the end of the first slice. Week two brings Moth &amp; Lantern, Tidebound and Rift Duelists, the tilt stand, the registry, and whatever Pike has planned for you.</p>
    <button class="btn primary" id="again">Start over</button>
  </div>`;
  $('#again').onclick = () => { clearSave(); showTitle(); };
}

function gameOver(kind) {
  S.phase = 'end';
  save();
  app.innerHTML = `<div class="screen end scroll">
    <div class="kicker">${dayName(S.day)}</div>
    <h1>Fired</h1>
    <p style="max-width:50ch;text-align:center;color:var(--muted)">Pike doesn't look up from his desk. "Clear your desk. Leave the loupe." Seven citations in a week. Somewhere across town, Mr. Gaunt is already looking for a new tenant.</p>
    <button class="btn primary" id="again">Start over</button>
  </div>`;
  $('#again').onclick = () => { clearSave(); showTitle(); };
}

showTitle();
