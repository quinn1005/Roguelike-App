// Mint Condition: first slice (5 days). Screens, desk interaction, economy and story flow.
import { LINES, CARDS, DAYS, TOOLS, TIERS, RENT, FOOD, START_MONEY, MAX_CITATIONS, PACKS } from './data.js';
import { cardSVG, hitPoint, defectName, cardSize, copyrightText } from './cardsvg.js';
import { subsFrom, finalGrade, centerPct, gradeName, trueGrade } from './grading.js';
import { makeRng, makeSubmission, truthOf, makeInst, rollVariants, pickCard, pickQuality, cardValue, cardValueRaw, cardTitle, variantLabels, rarityName, blankInst, makeFake } from './gen.js';
import { storySubs, onStoryStamp, morningLetters, eveningEvents, dayName } from './story.js';
import { VERSION } from './version.js';
import { unlockAudio, setScene, sfx, toggleMute, isMuted, duck } from './audio.js';
import { streetSVG, shopSVG, marketSVG, dinerSVG, homeSVG, louLine, sellerLine, salLine, rumor, theoLine } from './scenes.js';

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
  setScene('story');
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
  setScene('title');
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
  setScene('morning');
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


const TIPS = {
  2: '<b>New: UV lamp.</b> Old genuine stock stays dull under it. Fakes on modern paper glow bright. Bloomlings are in the queue now too: check the reference notes.',
  3: '<b>New rules.</b> Flip every card: counterfeit backs are turning up. Under UV, touch-up ink glows in patches. Stamp plus shadow on a Bloomling means altered.',
  4: '<b>Trimmed cards are going around.</b> The Ruler shows card size as well as centering. Anything under 2.50 × 3.50 in has been cut.',
  5: '<b>Audit day.</b> Everything you stamp today will be checked against your week.',
};

function startShift() {
  closeAllModals();
  const cfg = DAYS[S.day - 1];
  const R = makeRng(S.seed + S.day * 7919);
  D = { cfg, R, story: storySubs(R, S.day, S.flags), served: 0, minute: 0, sub: null, face: 'front', tool: 'hand', uv: false, ruler: false, measured: false,
    found: new Set(), paid: {}, log: [], ended: false, cites: 0, tip: TIPS[S.day] || null, coach: S.day === 1 ? 0 : -1, timer: null, busy: false };
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
      <div class="panels" id="side" data-tab="form">
        <div class="side-tabs" role="tablist"><button data-tab="form" aria-selected="true">Form</button><button data-tab="sheet" aria-selected="false">Worksheet</button><button class="close" id="sideClose" aria-label="Close">✕</button></div>
        <div class="paper form" id="form"></div>
        <div class="sheet" id="sheet"></div>
      </div>
      <div class="stage-wrap" id="wrap">
        <div class="stage" id="stage"><div id="cardview" style="width:100%;height:100%"></div><div id="marks"></div>
          <div class="lens" id="lens" hidden><div class="inner" id="lensInner"></div><div class="cross"></div></div></div>
        <div class="facetag" id="facetag">FRONT</div>
        <div class="coach" id="coach" hidden></div>
      </div>
    </div>
    <button class="infostrip" id="strip" aria-label="Show the form and worksheet"></button>
    <div class="toolbar" id="toolbar">
      ${['hand', 'loupe', 'ruler', 'uv', 'binder'].map((t) => `<button class="tool" data-tool="${t}" ${cfg.tools.includes(t) ? '' : 'disabled title="Not issued yet"'}>${ICONS[t]}<span>${TOOLS[t].name}</span></button>`).join('')}
      <button class="verdict-btn" id="verdictBtn">VERDICT</button>
    </div>
  </div>`;
  $$('.side-tabs button[data-tab]').forEach((b) => b.onclick = () => {
    $('#side').dataset.tab = b.dataset.tab;
    $$('.side-tabs button[data-tab]').forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
  });
  $('#strip').onclick = () => { $('#side').classList.toggle('open'); sfx('ui'); };
  $('#sideClose').onclick = () => $('#side').classList.remove('open');
  setScene('desk');
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
  if (D.minute >= 420 && !D.ended) setScene('deskLate');
  $('#quota').textContent = `${D.served}/${D.cfg.quota}`;
  $('#quota').title = 'Cards graded / quota';
  $('#cash').textContent = money(S.money);
  $('#cites').textContent = `⚠ ${S.citations + D.cites}/${MAX_CITATIONS}`;
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
  const tb = $('#toolbar');
  if (tb) document.documentElement.style.setProperty('--tbh', tb.offsetHeight + 'px');
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
  const list = D.sub.inst.defects.filter((d) => D.found.has(d.id));
  marks.innerHTML = list.map((d, i) => {
    if ((d.face || 'front') !== D.face) return '';
    const [x, y] = hitPoint(d);
    return `<div class="tagmark" style="left:${(x / 250) * 100}%;top:${(y / 350) * 100}%">${i + 1}</div>`;
  }).join('');
  const ft = $('#facetag');
  if (ft) ft.textContent = D.face === 'front' ? 'FRONT' : 'BACK';
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
  renderStrip();
}

// Phone-sized summary of the form and the worksheet, under the card.
function renderStrip() {
  const el = $('#strip');
  if (!el || !D || !D.sub) return;
  const f = D.sub.form, L = LINES[f.line], w = worksheet();
  el.innerHTML = `<span class="s-main"><b>${esc(f.name)}</b><span>${L.setCode} ${pad3(f.n)} · ${f.claims.length ? esc(f.claims.join(', ')) : 'No variant claimed'}${f.note ? ' · <i>note attached</i>' : ''}</span></span>
    <span class="s-grade"><b>${fmtG(w.grade)}</b><small>${D.measured ? '' : 'ctr? · '}${w.found.length} tagged</small></span><span class="s-chev" aria-hidden="true">⌃</span>`;
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
    <ul class="taglist">${w.found.length ? w.found.map((d, i) => `<li>${i + 1}. <b>${defectName(d)}</b></li>`).join('') : '<li>No flaws tagged yet. Check both sides.</li>'}</ul>`;
  renderStrip();
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
  sfx('tool');
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
  sfx('flip');
  const cv = $('#cardview');
  cv.classList.remove('flipping'); void cv.offsetWidth; cv.classList.add('flipping');
  setTimeout(() => { D.face = D.face === 'front' ? 'back' : 'front'; renderCard(); }, 170);
}

function bindStage() {
  const stage = $('#stage'), lens = $('#lens');
  let st = null;
  const pt = (e) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  // The lens floats above a finger. Near the top of the screen it moves to the
  // side instead, and it is always kept fully on screen.
  const showLens = (p, touch) => {
    const Z = 3.2, R = 75, r = stage.getBoundingClientRect();
    lens.hidden = false;
    let cx = p.x, cy = touch ? p.y - 95 : p.y;
    if (touch && r.top + cy - R < 6) { cy = p.y; cx = p.x + (p.x > p.w / 2 ? -110 : 110); }
    const vx = Math.min(Math.max(r.left + cx, R + 4), window.innerWidth - R - 4);
    const vy = Math.min(Math.max(r.top + cy, R + 4), window.innerHeight - R - 4);
    lens.style.left = vx - r.left - R + 'px';
    lens.style.top = vy - r.top - R + 'px';
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
  const x = (p.x / p.w) * 250, y = (p.y / p.h) * 350;
  const inst = D.sub.inst;
  const R = { 1: 12, 2: 16, 3: 20 };
  const onFace = (d) => (d.face || 'front') === D.face;
  let best = null, bd = 1e9;
  inst.defects.forEach((d) => {
    if (D.found.has(d.id) || !onFace(d)) return;
    if (inst.alt && inst.alt.kind === 'recolor' && inst.alt.hidden === d.id) return;
    const dist = d.kind === 'crease' ? segDist(x, y, d) : Math.hypot(x - hitPoint(d)[0], y - hitPoint(d)[1]);
    if (dist < R[d.sev] && dist < bd) { best = d; bd = dist; }
  });
  if (best) {
    D.found.add(best.id);
    sfx('tag');
    toast(defectName(best) + ' tagged', 'good');
    renderMarks(); renderSheet();
    coach();
  } else {
    const already = inst.defects.some((d) => D.found.has(d.id) && onFace(d) && Math.hypot(x - hitPoint(d)[0], y - hitPoint(d)[1]) < 16);
    if (already) { if (!quiet) toast('Already tagged.'); return; }
    if (quiet) return;
    sfx('miss');
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
  if (D.tip && D.served === 0 && !D.tipSeen) {
    el.innerHTML = `${D.tip} <button class="btn small primary" id="cnext">Got it</button>`;
    el.hidden = false;
    $('#cnext').onclick = () => { D.tipSeen = true; el.hidden = true; };
    return;
  }
  if (D.coach < 0 || D.sub.story !== 'tutorial') { el.hidden = true; return; }
  if (D.coach === 1 && D.found.size >= 1) D.coach = 2;
  if (D.coach === 2 && D.measured) D.coach = 3;
  const steps = [
    '<b>1.</b> Read the submission form, then compare it with the card: name, number and claimed variant must all match. <button class="btn small primary" id="cnext">Got it</button>',
    '<b>2.</b> Pick the <b>Loupe</b>. Drag across the card to magnify it, and tap a flaw to tag it. Check all four corners, the edges and the surface. Misses cost a minute.',
    '<b>3.</b> Good. Now flip the card with the <b>Hand</b>: the back has its own flaws. Then measure centering with the <b>Ruler</b>.',
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
    <div class="shop-tabs" id="rtabs"><button data-l="rules">Rules</button>${lines.map((l) => `<button data-l="${l}">${LINES[l].name}</button>`).join('')}</div>
    <div id="rbody"></div>`, { wide: true });
  // The clock keeps running while you read.
  $('[data-close]', m).onclick = () => m.close();
  const draw = () => {
    $$('#rtabs button', m).forEach((b) => b.setAttribute('aria-selected', b.dataset.l === cur.line ? 'true' : 'false'));
    if (cur.line === 'rules') {
      const rules = DAYS.slice(0, S.day).flatMap((d) => d.rules);
      $('#rbody', m).innerHTML = `<div class="paper memo" style="max-width:none"><div class="head"><h2>STANDING RULES</h2><span>${dayName(S.day)}</span></div><ol>${rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ol></div>`;
      return;
    }
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
  const entry = { sub, verdict, grade: verdict === 'grade' || verdict === 'error' ? grade : null, truth: truthOf(sub), found: [...D.found], measured: D.measured, sheet: worksheet().grade };
  judge(entry);
  D.log.push(entry);
  if (entry.res === 'cite') { D.cites++; setTimeout(() => citationSlip(entry), 650); }
  if (sub.story) onStoryStamp(sub, verdict, grade, S.flags);
  if (D.coach >= 0 && sub.story === 'tutorial') D.coach = -1;
  const label = { grade: 'GRADE ' + fmtG(grade), error: 'ERROR · ' + fmtG(grade), altered: 'ALTERED', counterfeit: 'COUNTERFEIT', return: 'RETURNED' }[verdict];
  const sa = document.createElement('div');
  sa.className = 'stamp-anim';
  sfx('stamp');
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


// Decide whether a stamped verdict was right. Walk-ins skip review.
function judge(e) {
  if (e.sub.story && e.sub.story !== 'tutorial') { e.res = 'story'; return e; }
  if (!e.truth.ok.includes(e.verdict)) { e.res = 'cite'; e.why = citeReason(e); e.detail = citeDetail(e); }
  else if (e.grade != null && Math.abs(e.grade - e.truth.grade) >= 1) { e.res = 'cite'; e.why = `Graded ${fmtG(e.grade)}. It was a ${fmtG(e.truth.grade)}.`; e.detail = gradeDetail(e); }
  else { e.res = 'ok'; e.exact = e.grade == null || e.grade === e.truth.grade; }
  return e;
}

const FAKE_TELL = {
  print: () => 'The print is smeared under the loupe. No clean dot rosette.',
  copyright: (inst) => `The footer reads "${copyrightText(inst)}". It should read "${LINES[inst.line].copyright}".`,
  uv: () => 'It\'s printed on modern paper. It glows under the UV lamp.',
  swirl: () => 'The holo swirl turns counter-clockwise. Genuine swirls turn clockwise.',
  back: () => 'The back is wrong. Compare it with the reference binder.',
};
const ALT_TELL = {
  stamp: '1st Edition stamp on a print with a drop shadow. Real 1st Editions are shadowless.',
  recolor: 'A damaged spot was inked over. It glows in a patch under the UV lamp.',
  trim: 'It measures 2.46 × 3.44 in. Someone trimmed the edges.',
};

function citeDetail(e) {
  const { inst, form } = e.sub, ok = e.truth.ok, v = e.verdict;
  if (ok.includes('return') && v !== 'return') {
    if (e.sub.mismatch === 'name') return `The form says ${form.name}. The card is ${cardTitle(inst)}.`;
    if (e.sub.mismatch === 'number') return `The form says No. ${pad3(form.n)}. The card is No. ${pad3(inst.n)}.`;
    const extra = form.claims.filter((c) => !variantLabels(inst.v).includes(c));
    return `The form claims ${extra.join(', ') || 'a variant'}. The card isn't.`;
  }
  if (ok.includes('counterfeit') && v !== 'counterfeit') return inst.fake.kinds.map((k) => FAKE_TELL[k](inst)).join(' ');
  if (ok.includes('altered') && v !== 'altered') return ALT_TELL[inst.alt.kind];
  if (v === 'counterfeit' || v === 'altered') return 'Nothing on it was fake or tampered with.';
  if (v === 'return') return 'Name, number and variant all matched the form.';
  if (v === 'error' && !inst.v.noYellow) return 'The inks are normal. It isn\'t a misprint.';
  if (v === 'grade' && inst.v.noYellow) return 'The yellow ink layer is missing: white where yellow should be, cyan greens, pink reds. That\'s a genuine error.';
  return '';
}

function gradeDetail(e) {
  const inst = e.sub.inst;
  const out = [];
  if (e.grade !== e.sheet) out.push(e.grade > e.sheet ? `You graded above your own worksheet (${fmtG(e.sheet)}).` : `You graded below your own worksheet (${fmtG(e.sheet)}).`);
  const missed = inst.defects.filter((d) => !e.found.includes(d.id) && !(inst.alt && inst.alt.hidden === d.id));
  if (missed.length) out.push('Missed: ' + missed.slice(0, 3).map(defectName).join(', ') + (missed.length > 3 ? ` and ${missed.length - 3} more` : '') + '.');
  const c = centerPct(inst.dx, inst.dy);
  if (!e.measured && c.worst > 55.5) out.push(`Centering was never measured. It was ${Math.round(Math.max(c.lr, 100 - c.lr))}/${Math.round(Math.min(c.lr, 100 - c.lr))}.`);
  return out.join(' ');
}

function citationSlip(e) {
  sfx('citation');
  const wrap = $('#wrap');
  if (!wrap || !D || D.ended) return;
  const old = $('.citation', wrap); if (old) old.remove();
  const el = document.createElement('button');
  el.className = 'citation';
  el.innerHTML = `<span class="ch">CITATION · ${esc(cardTitle(e.sub.inst))}</span><b>${esc(e.why)}</b>${e.detail ? `<span>${esc(e.detail)}</span>` : ''}<small>Tap to dismiss</small>`;
  el.onclick = () => el.remove();
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 9000);
  updateTop();
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
  setScene('payday');
  $('#toasts').innerHTML = '';
  const rows = [];
  let pay = 0, bonus = 0, cites = 0;
  D.log.forEach((e) => {
    const tierPay = TIERS[e.sub.form.tier].pay;
    pay += tierPay;
    const r = { name: cardTitle(e.sub.inst), verdict: e.verdict, grade: e.grade, pay: tierPay, story: e.sub.story };
    const walkIn = e.res === 'story';
    r.res = e.res; r.why = e.why; r.exact = e.exact;
    if (e.res === 'cite') cites++;
    if (e.res === 'ok' && e.exact) bonus += 4;
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

// The evening clock: each stop takes a couple of hours.
function eveClock() {
  const m = 17 * 60 + 40 + (2 - S.actions) * 130;
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return `${h > 12 ? h - 12 : h}:${String(mm).padStart(2, '0')} ${h >= 12 && h < 24 ? 'pm' : 'am'}`;
}

function travel(text, then, ms = 1100) {
  sfx('step');
  const t = document.createElement('div');
  t.className = 'travel';
  t.innerHTML = `<div class="travel-rain"></div><p>${esc(text)}</p><div class="steps"><span></span><span></span><span></span></div>`;
  document.body.appendChild(t);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => { then(); t.classList.add('out'); setTimeout(() => t.remove(), 350); }, reduce ? 250 : ms);
}

const PLACES = {
  shop: { name: 'Brick & Mortar Cards', blurb: 'Packs, singles, and Lou, who doesn\'t always know what he has.', walk: 'Walking two blocks to Brick & Mortar Cards…' },
  market: { name: 'The night market', blurb: 'Bulk bins under a tarp. $3 a dig, keep two.', walk: 'Cutting through the alley to the night market…' },
  diner: { name: 'Last Stop Diner', blurb: 'Four hours, cash in hand. People talk while you pour coffee.', walk: 'Catching the 41 bus to the Last Stop Diner…' },
  home: { name: 'Home', blurb: 'Theo, your binder, and bed.', walk: 'Climbing three flights of stairs…' },
};

function showCity() {
  setScene('street');
  closeAllModals();
  $('#toasts').innerHTML = '';
  S.phase = 'evening';
  save();
  const a = S.actions;
  const open = { shop: a > 0, market: a > 0, diner: a > 0 };
  app.innerHTML = `<div class="screen street-screen">
    <div class="street-scene">${streetSVG(open, S.flags, S.day)}</div>
    <div class="street-panel scroll">
      <div class="loc-head"><div><div class="kicker">${eveClock()} · ${dayName(S.day).toUpperCase()} NIGHT</div><h2>Outside Gemline</h2></div><span class="chip mono">${money(S.money)}</span></div>
      <p class="sub">${a ? `Rain. You have time for ${a} more ${a === 1 ? 'stop' : 'stops'} tonight.` : 'Everything is closing. Time to go home.'} Rent ${money(S.rent)} is due Friday.</p>
      <div class="places compact">${Object.entries(PLACES).map(([k, p]) => `<button class="place" data-p="${k}" ${k !== 'home' && !a ? 'disabled' : ''}><b>${esc(p.name)}</b><small>${esc(p.blurb)}</small><span class="cost">${k === 'home' ? 'free' : a ? 'uses one stop' : 'closed'}</span></button>`).join('')}</div>
      <button class="btn small" id="quit">Save and quit to title</button>
    </div>
  </div>`;
  $$('[data-p]').forEach((b) => b.onclick = () => go(b.dataset.p));
  $$('.street .hot').forEach((g) => g.addEventListener('click', () => go(g.dataset.place)));
  $('#quit').onclick = () => { save(); showTitle(); };
}

function go(p) {
  if (p !== 'home' && !S.actions) { toast('It\'s too late for that tonight.'); return; }
  travel(PLACES[p].walk, () => {
    if (p !== 'home') { S.actions--; save(); }
    ({ shop: showShop, market: showMarket, diner: showDiner, home: showHome })[p]();
  });
}

function leaveTo(text = 'Back out into the rain…') { travel(text, showCity, 650); }

function locScreen(cls, svg, kicker, title, speaker, line, leaveLabel = 'Leave') {
  closeAllModals();
  $('#toasts').innerHTML = '';
  app.innerHTML = `<div class="screen loc ${cls}">
    <div class="scene">${svg}</div>
    <div class="loc-body scroll">
      <div class="loc-head"><div><div class="kicker">${kicker}</div><h2>${title}</h2></div><button class="btn small" id="leave">${leaveLabel}</button></div>
      ${line ? `<p class="speech">${speaker ? `<b>${esc(speaker)}</b>` : ''}${esc(line)}</p>` : ''}
      <div id="locbody"></div>
    </div>
  </div>`;
  return $('#locbody');
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

function showShop() {
  setScene('shop');
  sfx('bell');
  const stock = eveStock();
  let tab = 'packs';
  const root = locScreen('loc-shop', shopSVG(), `${eveClock()} · BRICK & MORTAR CARDS`, 'Lou\'s counter', 'Lou', louLine(S.flags, S.day));
  root.innerHTML = `<p style="margin:0;color:var(--muted)" id="shopcash"></p>
    <div class="shop-tabs"><button data-t="packs">Packs</button><button data-t="singles">Under the glass</button><button data-t="sell">Sell to Lou</button></div>
    <div id="sbody"></div>`;
  $('#leave').onclick = () => { save(); leaveTo(); };
  const draw = () => {
    $('#shopcash').textContent = `Cash ${money(S.money)}.`;
    $$('[data-t]', root).forEach((b) => b.setAttribute('aria-selected', b.dataset.t === tab ? 'true' : 'false'));
    const body = $('#sbody');
    if (tab === 'packs') {
      body.innerHTML = `<div class="packs">${Object.entries(PACKS).map(([l, p]) => `<button class="packbtn" data-pack="${l}" ${S.money < p.price ? 'disabled' : ''}>${packSVG(l)}<b>${p.label}</b><span style="color:var(--muted)">${p.sub}</span><span class="mono" style="color:var(--lamp)">${money(p.price)}</span></button>`).join('')}</div>
        <p style="color:var(--muted);font-size:13px;margin:0">Five cards a pack: three commons, an uncommon, and a shot at a rare.</p>`;
      $$('[data-pack]', body).forEach((b) => b.onclick = () => { const l = b.dataset.pack; S.money -= PACKS[l].price; save(); openPack(l, draw); });
    }
    if (tab === 'singles') {
      body.innerHTML = `<p style="color:var(--muted);font-size:13px;margin:0">Lou prices by eye, and his eyes are tired. Tap a card for a closer look.</p>
        <div class="cardgrid">${stock.singles.map((x, i) => x.sold ? '' : `<div class="cardcell" style="cursor:default"><button class="cardcell" data-look="${i}">${cardSVG(x.inst)}</button><span>${esc(cardTitle(x.inst))}</span><span class="price">${esc(x.label)} · ${money(x.price)}</span><button class="btn small primary" data-buy="${i}" ${S.money < x.price ? 'disabled' : ''}>Buy</button></div>`).join('') || '<p>Sold out.</p>'}</div>`;
      $$('[data-buy]', body).forEach((b) => b.onclick = () => { const x = stock.singles[+b.dataset.buy]; S.money -= x.price; x.sold = true; S.collection.push(x.inst); sfx('cash'); toast('Added to your binder', 'good'); save(); draw(); });
      $$('[data-look]', body).forEach((b) => b.onclick = () => viewer(stock.singles[+b.dataset.look].inst, { hideInfo: true }));
    }
    if (tab === 'sell') {
      const list = S.collection.map((inst, i) => ({ inst, i, v: Math.floor(cardValue(inst) * 0.5) })).sort((a, b) => b.v - a.v);
      body.innerHTML = `<p style="color:var(--muted);font-size:13px;margin:0">Lou pays half of what a card is worth. Cheap cards aren't worth his time.</p>
        <div class="cardgrid">${list.map((x) => `<div class="cardcell" style="cursor:default"><button class="cardcell" data-look="${x.i}">${cardSVG(x.inst)}</button><span>${esc(cardTitle(x.inst))}</span><button class="btn small" data-sell="${x.i}" ${x.v < 1 ? 'disabled' : ''}>${x.v < 1 ? 'No offer' : 'Sell ' + money(x.v)}</button></div>`).join('') || '<p>Your binder is empty.</p>'}</div>`;
      $$('[data-sell]', body).forEach((b) => b.onclick = () => {
        if (b.dataset.armed) { const idx = +b.dataset.sell; const inst = S.collection[idx]; S.money += Math.floor(cardValue(inst) * 0.5); S.collection.splice(idx, 1); sfx('cash'); toast('Sold', 'good'); save(); draw(); return; }
        b.dataset.armed = '1'; b.textContent = 'Tap again to sell'; b.classList.add('danger');
      });
      $$('[data-look]', body).forEach((b) => b.onclick = () => viewer(S.collection[+b.dataset.look]));
    }
  };
  $$('[data-t]', root).forEach((b) => b.onclick = () => { tab = b.dataset.t; draw(); });
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

// ------------------------------------------------------------------ pack opening
// 1 common · 2 uncommon · 3 rare or holo · 4 chase variant
function rank(inst) {
  const r = CARDS[inst.line].find((x) => x.n === inst.n).r;
  let k = r === 'r' ? 3 : r === 'u' ? 2 : 1;
  if (inst.v.holo) k = Math.max(k, 3);
  if (inst.v.noYellow || inst.v.first || inst.v.shadowless) k = 4;
  return k;
}
function rankLabel(inst) {
  if (inst.v.noYellow) return 'MISPRINT!';
  if (inst.v.first) return '1ST EDITION!';
  if (inst.v.shadowless) return 'SHADOWLESS!';
  const r = CARDS[inst.line].find((x) => x.n === inst.n).r;
  if (inst.v.holo) return r === 'r' ? 'HOLO RARE!' : 'HOLO!';
  return r === 'r' ? 'RARE!' : r === 'u' ? 'Uncommon' : 'Common';
}

function particles(host, k) {
  const cols = k >= 4 ? ['#ff4fd8', '#2ee6ff', '#ffe45c', '#3fe08a', '#ffffff'] : k === 3 ? ['#f2c46d', '#fff3c4', '#ffffff'] : ['#9fd4ff', '#ffffff'];
  const n = k >= 4 ? 70 : k === 3 ? 44 : 16;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('span');
    p.className = 'pt';
    const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * (k >= 3 ? 260 : 120);
    p.style.setProperty('--dx', Math.cos(a) * d + 'px');
    p.style.setProperty('--dy', Math.sin(a) * d + 'px');
    p.style.setProperty('--c', cols[i % cols.length]);
    p.style.setProperty('--s', (3 + Math.random() * 6) + 'px');
    p.style.animationDelay = Math.random() * 0.12 + 's';
    host.appendChild(p);
    setTimeout(() => p.remove(), 1600);
  }
}

function openPack(line, after) {
  duck(true);
  const cards = rollPack(line).sort((a, b) => rank(a) - rank(b));
  const owned = new Set(S.collection.map((x) => x.line + ':' + x.n));
  const ov = document.createElement('div');
  ov.className = 'packopen';
  ov.innerHTML = `<div class="po-rays"></div>
    <div class="po-top"><span class="kicker">${esc(PACKS[line].label)}</span><span class="mono" id="poCount"></span><button class="btn small" id="poSkip" hidden>Reveal all</button></div>
    <div class="po-stage" id="poStage">
      <div class="po-pack" id="poPack">
        <div class="po-body">${packSVG(line)}</div>
        <div class="po-strip">${packSVG(line)}</div>
        <div class="po-seam"><div class="po-cut" id="poCut"></div></div>
        <div class="po-light"></div>
      </div>
    </div>
    <p class="po-hint" id="poHint">Drag along the top seam to tear it open. <span>Slowly.</span></p>
    <div class="po-tray" id="poTray"></div>`;
  document.body.appendChild(ov);
  const pack = $('#poPack', ov), cut = $('#poCut', ov);
  let st = null, done = false, last = 0;
  pack.addEventListener('pointerdown', (e) => {
    if (done) return;
    const r = pack.getBoundingClientRect();
    if (e.clientY - r.top > r.height * 0.4) { pack.classList.remove('wiggle'); void pack.offsetWidth; pack.classList.add('wiggle'); sfx('rustle'); return; }
    st = { x0: e.clientX, t0: Date.now(), w: r.width, max: 0 };
    try { pack.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    sfx('rustle');
  });
  pack.addEventListener('pointermove', (e) => {
    if (!st || done) return;
    const prog = Math.min(1, Math.abs(e.clientX - st.x0) / (st.w * 0.8));
    if (prog > st.max) {
      const now = Date.now();
      if (now - last > 35) { sfx('tear', { v: Math.min(1, (prog - st.max) * 8) }); last = now; }
      st.max = prog;
      cut.style.transform = `scaleX(${prog})`;
      cut.style.transformOrigin = e.clientX >= st.x0 ? 'left' : 'right';
      pack.style.setProperty('--tilt', (prog * 4 * (e.clientX >= st.x0 ? 1 : -1)) + 'deg');
    }
    if (st.max >= 1) finishTear();
  });
  pack.addEventListener('pointerup', () => { if (!done && st && st.max < 1) { cut.style.transform = 'scaleX(0)'; pack.style.setProperty('--tilt', '0deg'); toast('Drag all the way along the seam.'); } st = null; });
  const finishTear = () => {
    done = true;
    const fast = Date.now() - st.t0 < 260;
    st = null;
    if (fast) {
      cards[0].defects.push({ id: 90, cat: 'surface', sev: 3, kind: 'crease', x: 125, y: 175, ang: 12, face: 'front' });
      sfx('crunch');
      toast('Too fast. You creased a card.', 'bad');
    }
    sfx('rip');
    pack.classList.add('torn');
    $('#poHint', ov).textContent = '';
    setTimeout(() => { sfx('whoosh'); revealPack(ov, cards, owned, after); }, 900);
  };
}

function revealPack(ov, cards, owned, after) {
  const stage = $('#poStage', ov), tray = $('#poTray', ov), hint = $('#poHint', ov), count = $('#poCount', ov);
  let i = 0, phase = 'ready', busy = false;
  const skip = $('#poSkip', ov);
  skip.hidden = false;
  const show = () => {
    count.textContent = `${i + 1} / ${cards.length}`;
    const c = cards[i], k = rank(c);
    stage.innerHTML = `<div class="po-stack">${cards.slice(i + 1).map((_, n) => `<div class="po-under" style="--n:${n + 1}"></div>`).join('')}</div>
      <div class="po-card enter k${k}" id="poCard"><div class="po-flip"><div class="po-face back">${cardSVG(c, { face: 'back' })}</div><div class="po-face front">${cardSVG(c)}${c.v.holo || k >= 4 ? '<div class="po-holo"></div>' : ''}</div></div></div>
      <div class="po-banner" id="poBanner"></div>`;
    hint.textContent = 'Tap to flip';
    phase = 'ready';
    ov.classList.remove('rays-on', 'r3', 'r4');
    $('#poCard', ov).onclick = tapCard;
  };
  const flipNow = () => {
    const c = cards[i], k = rank(c), card = $('#poCard', ov);
    card.classList.remove('charging');
    card.classList.add('flipped');
    sfx('whoosh');
    const isNew = !owned.has(c.line + ':' + c.n);
    if (isNew) owned.add(c.line + ':' + c.n);
    setTimeout(() => {
      const b = $('#poBanner', ov);
      b.innerHTML = `<b>${esc(rankLabel(c))}</b><span>${esc(cardTitle(c))}${isNew ? ' <em>NEW</em>' : ''}</span>`;
      b.className = `po-banner show k${k}`;
      if (k === 1) sfx('common');
      if (k === 2) { sfx('uncommon'); particles(stage, 2); }
      if (k >= 3) {
        sfx('impact'); setTimeout(() => sfx('sparkle'), 120);
        if (c.v.holo) setTimeout(() => sfx('holo'), 250);
        if (k >= 4) setTimeout(() => sfx('fanfare'), 380);
        ov.classList.add('rays-on', k >= 4 ? 'r4' : 'r3');
        particles(stage, k);
        ov.classList.remove('shake'); void ov.offsetWidth; ov.classList.add('shake');
      }
      phase = 'shown'; busy = false;
      hint.textContent = i < cards.length - 1 ? 'Tap for the next card' : 'Tap to see your pull';
    }, 330);
  };
  function tapCard() {
    if (busy) return;
    const c = cards[i], k = rank(c), card = $('#poCard', ov);
    if (phase === 'ready') {
      busy = true;
      if (k >= 3) {
        card.classList.add('charging', 'c' + k);
        hint.textContent = k >= 4 ? 'Something is very wrong with this card…' : 'This one feels different…';
        sfx('riser');
        setTimeout(flipNow, 1050);
      } else flipNow();
      return;
    }
    if (phase === 'shown') {
      const t = document.createElement('div');
      t.className = 'po-thumb k' + k;
      t.innerHTML = cardSVG(c);
      tray.appendChild(t);
      card.classList.add('leave');
      sfx('ui');
      busy = true;
      setTimeout(() => { busy = false; i++; if (i < cards.length) show(); else summary(); }, 260);
    }
  }
  const summary = () => {
    skip.hidden = true;
    ov.classList.remove('rays-on', 'r3', 'r4');
    count.textContent = '';
    tray.innerHTML = '';
    const total = cards.reduce((a, c) => a + cardValue(c), 0);
    const best = cards[cards.length - 1];
    stage.innerHTML = `<div class="po-fan">${cards.map((c, n) => `<button class="po-fcard k${rank(c)}" style="--i:${n};--r:${(n - (cards.length - 1) / 2) * 9}deg;--y:${Math.abs(n - (cards.length - 1) / 2) * 12}px" data-k="${n}">${cardSVG(c)}</button>`).join('')}</div>`;
    hint.innerHTML = `Worth about <b>${money(total)}</b>. Best pull: ${esc(cardTitle(best))}${variantLabels(best.v).length ? ' (' + esc(variantLabels(best.v).join(', ')) + ')' : ''}.`;
    const btn = document.createElement('button');
    btn.className = 'btn primary po-done';
    btn.textContent = 'Add to binder';
    hint.after(btn);
    $$('[data-k]', stage).forEach((b) => b.onclick = () => viewer(cards[+b.dataset.k]));
    btn.onclick = () => {
      S.collection.push(...cards);
      save();
      sfx('collect');
      ov.classList.add('closing');
      duck(false);
      setTimeout(() => { ov.remove(); if (after) after(); }, 300);
    };
  };
  skip.onclick = () => { if (busy) return; summary(); };
  show();
}

function showMarket() {
  setScene('market');
  let digs = 0, cards = [], picked = new Set();
  const root = locScreen('loc-market', marketSVG(), `${eveClock()} · THE NIGHT MARKET`, 'Under the tarp', '', sellerLine());
  const keep = () => { picked.forEach((k) => S.collection.push(cards[k])); if (picked.size) toast(`${picked.size} added to your binder`, 'good'); picked = new Set(); };
  $('#leave').onclick = () => { keep(); save(); leaveTo(); };
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
    if (!cards.length) {
      root.innerHTML = `<p style="margin:0;color:var(--muted)">Cash ${money(S.money)}. Shoeboxes of loose cards, most of them soft at the corners. Somebody's childhood, sold by the pound.</p>
        <button class="btn primary" data-dig ${S.money < 3 ? 'disabled' : ''}>Dig through a box ($3)</button>`;
      $('[data-dig]', root).onclick = () => { S.money -= 3; dig(); };
      return;
    }
    root.innerHTML = `<p style="margin:0">Tap a card to look closer. Kept ${picked.size}/2.</p>
      <div class="cardgrid">${cards.map((c, k) => `<button class="cardcell ${picked.has(k) ? 'picked' : ''}" data-k="${k}">${cardSVG(c)}</button>`).join('')}</div>
      <div class="row"><button class="btn primary" data-keep ${picked.size ? '' : 'disabled'}>Take ${picked.size || ''} and stop digging</button>${digs < 2 ? `<button class="btn" data-again ${S.money < 3 ? 'disabled' : ''}>Take them and dig again ($3)</button>` : ''}</div>`;
    $$('[data-k]', root).forEach((b) => b.onclick = () => {
      const k = +b.dataset.k;
      viewer(cards[k], { hideInfo: true, action: { label: picked.has(k) ? 'Put it back' : 'Keep this one', disabled: !picked.has(k) && picked.size >= 2, run: () => { picked.has(k) ? picked.delete(k) : picked.add(k); draw(); } } });
    });
    $('[data-keep]', root).onclick = () => { keep(); cards = []; save(); root.innerHTML = '<p style="margin:0;color:var(--muted)">You tuck the cards inside your jacket, away from the rain.</p>'; };
    const again = $('[data-again]', root);
    if (again) again.onclick = () => { keep(); S.money -= 3; dig(); };
  };
  draw();
}

function showDiner() {
  setScene('diner');
  const root = locScreen('loc-diner', dinerSVG(), `${eveClock()} · LAST STOP DINER`, 'Behind the counter', 'Sal', salLine());
  let worked = false;
  $('#leave').onclick = () => { if (!worked) toast('You leave without working. The bus fare was for nothing.'); save(); leaveTo(); };
  root.innerHTML = `<p style="margin:0;color:var(--muted)">Four hours. Thirty dollars cash, plus whatever the regulars leave on the counter. People talk around a waiter like he isn't there.</p>
    <button class="btn primary" id="work">Put on the apron</button>`;
  $('#work').onclick = () => {
    root.innerHTML = `<div class="shiftbar"><div class="fill"></div></div><p class="mono" id="orders" style="margin:0;color:var(--muted)">Coffee for table six…</p>`;
    const msgs = ['Coffee for table six…', 'Two eggs, burnt on purpose…', 'Mopping up after a fight about a parking spot…', 'Refilling the ketchup nobody asked for…', 'Last orders…'];
    let k = 0;
    const iv = setInterval(() => { k++; const o = $('#orders'); if (o) o.textContent = msgs[Math.min(k, msgs.length - 1)]; }, 420);
    setTimeout(() => {
      clearInterval(iv);
      worked = true;
      const tips = Math.floor(Math.random() * 11);
      S.money += 30 + tips;
      sfx('cash');
      save();
      root.innerHTML = `<div class="paper letter"><div class="from">Overheard while pouring coffee</div><p>${esc(rumor(S.day, S.flags))}</p></div>
        <p style="margin:0">Sal counts out <b>${money(30)}</b> and pushes the tip jar across: <b>${money(tips)}</b>. Cash ${money(S.money)}.</p>
        <button class="btn primary" id="out">Hang up the apron</button>`;
      $('#out').onclick = () => leaveTo('Waiting for the last bus home…');
    }, 2200);
  };
}

function showHome() {
  setScene('home');
  const root = locScreen('loc-home', homeSVG(S.flags, S.day), `${eveClock()} · APARTMENT 3F`, 'Home', '', theoLine(S.flags, S.day), 'Head back out');
  $('#leave').onclick = () => { if (!S.actions) { toast('Everything is closed.'); return; } leaveTo('Back down the stairs…'); };
  root.innerHTML = `<div class="places compact">
      <button class="place" id="binder"><b>Your binder</b><small>${S.collection.length} cards · worth about ${money(collectionValue())}</small><span class="cost">free</span></button>
      <button class="place" id="sleep"><b>Go to sleep</b><small>Tomorrow is ${dayName(S.day + 1)}.${S.actions ? ` You still have time for ${S.actions} more ${S.actions === 1 ? 'stop' : 'stops'}.` : ''}</small><span class="cost">end the day</span></button>
    </div>`;
  if (!S.actions) $('#leave').disabled = true;
  $('#binder').onclick = openBinder;
  $('#sleep').onclick = () => travel('Lights out. The rain doesn\'t stop.', () => { S.day++; S.phase = 'morning'; S.eve = null; save(); showMorning(); }, 1400);
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
  setScene('end');
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
  setScene('end');
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

// Sound starts on the first tap (browsers block audio until then).
document.addEventListener('pointerdown', unlockAudio, true);
document.addEventListener('keydown', unlockAudio, true);
const soundBtn = document.createElement('button');
soundBtn.id = 'sound';
const drawSound = () => {
  soundBtn.setAttribute('aria-label', isMuted() ? 'Turn sound on' : 'Turn sound off');
  soundBtn.innerHTML = isMuted()
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
};
soundBtn.onclick = () => { unlockAudio(); toggleMute(); drawSound(); };
drawSound();
document.body.appendChild(soundBtn);

showTitle();
