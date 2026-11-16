// Mint Condition: five weeks at Gemline Authentication.
// Screens, desk interaction, economy, meters, collecting and story flow.
import { LINES, CARDS, DAYS, TOOLS, TIERS, FOOD, START_MONEY, MAX_CITATIONS, PACKS, weekOf, LAST_DAY, WEEKS } from './data.js';
import { cardSVG, hitPoint, defectName, cardSize, copyrightText, cardWeight, extraReadings, icStats } from './cardsvg.js';
import { subsFrom, finalGrade, centerPct, gradeName, trueGrade } from './grading.js';
import { makeRng, makeSubmission, truthOf, makeInst, rollVariants, pickCard, pickQuality, cardValue, cardTitle, variantLabels, rarityName, blankInst, makeFake, setMarket } from './gen.js';
import { storySubs, onStoryStamp, morningLetters, eveningEvents, weekendEvents, dayName, isFriday, isMonday, CLUES, ENDINGS, pickEndingChoices, evidenceCount } from './story.js';
import { VERSION } from './version.js';
import { unlockAudio, setScene, sfx, toggleMute, isMuted, duck, setVolumes } from './audio.js';
import { streetSVG, shopSVG, marketSVG, dinerSVG, homeSVG, louLine, sellerLine, salLine, rumor, theoLine } from './scenes.js';
import { slabHTML } from './slab.js';
import { packSVG } from './packs.js';
import { cardFilter, spareUids } from './filters.js';
import { initCollect, showApex, showAuction } from './collect.js';
import { CODEX, ACHIEVEMENTS, achievements, unlockAch, getSettings, setSetting, SPEEDS } from './extras.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const app = $('#app');
const SAVE = 'mint-condition-save-v2';
const pad3 = (n) => String(n).padStart(3, '0');
const money = (n) => (n < 0 ? '−$' : '$') + Math.abs(Math.round(n));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmtG = (g) => (g % 1 ? g.toFixed(1) : String(g));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let S = null; // saved state
let D = null; // desk (shift) state

// ------------------------------------------------------------------ utilities
function toast(msg, cls = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + cls;
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 2600);
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
  return `<div class="paper letter"><div class="from">${esc(l.from)}</div>${l.body.map((p) => `<p class="${/^[A-Z ·.]{4,40}$/.test(p) ? 'loud' : ''}">${esc(p)}</p>`).join('')}</div>`;
}

function meters(delta) {
  if (!delta) return;
  if (delta.rep) S.rep = clamp(S.rep + delta.rep, 0, 100);
  if (delta.sus) S.sus = clamp(S.sus + delta.sus, 0, 100);
  if (delta.integ) S.integ = clamp(S.integ + delta.integ, -100, 100);
}

function achieve(id) {
  const a = unlockAch(id);
  if (a) { toast(`Achievement: ${a[1]}`, 'good'); sfx('collect'); }
}
function learn(key) {
  if (!CODEX[key] || S.codex[key]) return;
  S.codex[key] = true;
  toast(`Codex: ${CODEX[key].name}`, 'good');
  if (Object.keys(S.codex).length >= 20) achieve('codex');
}
function learnInst(inst) {
  Object.keys(inst.v || {}).forEach((k) => { if (inst.v[k] && CODEX[k] && k !== 'holo' && k !== 'first' && k !== 'gold' && k !== 'serial') learn(k); });
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
  $$('[data-c]', m).forEach((b) => b.onclick = () => {
    const c = choices.find((x) => x.id === b.dataset.c);
    if (ev.id) S.flags[ev.id] = c.id;
    if (c.cost) S.money -= c.cost;
    if (c.gain) S.money += c.gain;
    meters(c);
    if (ev.cost) S.money -= ev.cost;
    if (ev.gain) S.money += ev.gain;
    meters(ev);
    if (ev.evidence) S.flags[ev.evidence] = true;
    if (ev.id === 'minaPay' && c.id === 'yes') achieve('mina');
    m.close();
    runEvents(list, done);
  });
}

// ------------------------------------------------------------------ title, settings, codex, achievements
function showTitle() {
  setScene('title');
  closeAllModals();
  const saved = loadSave();
  const live = saved && saved.phase !== 'end';
  const t = (l, n, v = {}) => { const i = blankInst(l, n); Object.assign(i.v, v); return cardSVG(i, { clean: true }); };
  app.innerHTML = `<div class="screen title-screen scroll">
    <div class="title-cards">${t('ns', 1, { holo: true })}${t('gg', 1)}${t('rd', 1, { secret: true })}</div>
    <h1>Mint<span>Condition</span></h1>
    <p>You grade trading cards for a living. Every fake you catch costs someone. Every one you miss costs you.</p>
    <div class="title-actions">
      ${live ? `<button class="btn primary" id="cont">Continue · Week ${Math.ceil(saved.day / 5)}, ${dayName(saved.day)}</button>` : ''}
      <button class="btn ${live ? '' : 'primary'}" id="new">New game</button>
      <div class="row" style="justify-content:center"><button class="btn small" id="ach">Achievements</button><button class="btn small" id="set">Settings</button></div>
    </div>
    <p class="mono" style="font-size:11px">v${VERSION} · 5 weeks · 11 card lines</p>
  </div>`;
  if ($('#cont')) $('#cont').onclick = () => { S = migrate(saved); resume(); };
  $('#new').onclick = () => {
    if (live) {
      const m = modal(`<h2>Start over?</h2><p>Your current run will be lost. Achievements are kept.</p><div class="row"><button class="btn" data-x>Keep playing</button><button class="btn danger" data-y>Start over</button></div>`);
      $('[data-x]', m).onclick = () => m.close();
      $('[data-y]', m).onclick = () => { m.close(); newGame(); };
    } else newGame();
  };
  $('#ach').onclick = showAchievements;
  $('#set').onclick = showSettings;
}

function showSettings() {
  const st = getSettings();
  const m = modal(`<h2>Settings</h2>
    <label class="setrow"><span>Music</span><input type="range" id="sMusic" min="0" max="1" step="0.05" value="${st.music}"></label>
    <label class="setrow"><span>Sound effects</span><input type="range" id="sSfx" min="0" max="1" step="0.05" value="${st.sfx}"></label>
    <div class="setrow"><span>Shift speed</span><div class="shop-tabs" id="sSpeed">${Object.entries(SPEEDS).map(([k, v]) => `<button data-sp="${k}" aria-selected="${st.speed === k}">${v.label}</button>`).join('')}</div></div>
    <p style="margin:0;color:var(--muted);font-size:13px">Shift speed changes how fast the clock runs at the desk. Relaxed gives you about 12 minutes a shift, Fast about 5.</p>
    <button class="btn primary" data-x>Done</button>`);
  const vol = () => { const s = setSetting('music', +$('#sMusic', m).value); setSetting('sfx', +$('#sSfx', m).value); setVolumes(s.music, getSettings().sfx); };
  $('#sMusic', m).oninput = vol;
  $('#sSfx', m).oninput = () => { vol(); sfx('tag'); };
  $$('[data-sp]', m).forEach((b) => b.onclick = () => { setSetting('speed', b.dataset.sp); $$('[data-sp]', m).forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false')); if (D && D.timer) { clearInterval(D.timer); D.timer = setInterval(tick, SPEEDS[b.dataset.sp].ms); } });
  $('[data-x]', m).onclick = () => m.close();
}

function showAchievements() {
  const got = achievements();
  const m = modal(`<h2>Achievements</h2><p style="margin:0;color:var(--muted)">${Object.keys(got).length} of ${ACHIEVEMENTS.length}. Kept across runs.</p>
    <div class="achlist">${ACHIEVEMENTS.map(([id, n, d]) => `<div class="ach ${got[id] ? 'got' : ''}"><b>${got[id] ? '★' : '☆'} ${esc(n)}</b><span>${esc(d)}</span></div>`).join('')}</div>
    <button class="btn" data-x>Close</button>`, { wide: true });
  $('[data-x]', m).onclick = () => m.close();
}

function codexHTML() {
  const cats = {};
  Object.entries(CODEX).forEach(([k, c]) => { (cats[c.cat] = cats[c.cat] || []).push([k, c]); });
  return `<p style="margin:0;color:var(--muted)">${Object.keys(S.codex).length} of ${Object.keys(CODEX).length} learned. Entries unlock when you catch a tell, get cited for one, or find a chase version.</p>
    ${Object.entries(cats).map(([cat, list]) => `<h3 class="sub-h">${esc(cat)}</h3><div class="codex">${list.map(([k, c]) => S.codex[k]
      ? `<div class="cx"><b>${esc(c.name)}</b><span class="mono">${esc(c.tool)}</span><p>${esc(c.text)}</p></div>`
      : '<div class="cx locked"><b>???</b><p>Not learned yet.</p></div>').join('')}</div>`).join('')}`;
}
function showCodex() {
  const m = modal(`<div class="row" style="justify-content:space-between;align-items:center"><h2>Codex</h2><button class="btn small" data-x>Close</button></div>${codexHTML()}`, { wide: true });
  $('[data-x]', m).onclick = () => m.close();
}

// ------------------------------------------------------------------ new game and saves
function freshState() {
  const seed = Math.floor(Math.random() * 1e9);
  const R = makeRng(seed);
  const starter = [['bl', 1], ['gg', 2], ['ns', 4]].map(([l, n]) => makeInst(R, l, n, 'nice'));
  return { v: 2, day: 1, money: START_MONEY, rent: WEEKS[0].rent, citations: 0, flags: {}, collection: starter, seed, phase: 'morning', actions: 2, eve: null,
    rep: 50, sus: 0, integ: 0, fakes: [], apex: [], graded: [], pop: {}, codex: {}, sets: {}, clues: 0, weekend: false, shift: null,
    stats: { graded: 0, correct: 0, cited: 0, earned: 0, fakesCaught: 0 }, history: [] };
}
function migrate(s) { return { ...freshState(), ...s }; }
function newGame() { S = freshState(); save(); showMorning(); }

function resume() {
  setMarket(weekOf(S.day).market, S.pop);
  if (S.phase === 'shift' && S.shift) return startShift(true);
  if (S.phase === 'evening') return showCity();
  return showMorning();
}

// ------------------------------------------------------------------ morning
function meterHTML() {
  const bar = (n, v, cls) => `<div class="meter ${cls}"><span>${n}</span><div><i style="width:${v}%"></i></div><b>${Math.round(v)}</b></div>`;
  return `<div class="meters">${bar('Reputation', S.rep, 'rep')}${bar('Suspicion', S.sus, 'sus')}</div>`;
}

function showMorning() {
  setScene('morning');
  closeAllModals();
  S.phase = 'morning';
  S.shift = null;
  const wk = weekOf(S.day);
  if (isMonday(S.day) && S.day > 1 && !S.flags['monday' + S.day]) {
    S.flags['monday' + S.day] = true;
    S.citations = 0;
    S.sus = clamp(S.sus - 5, 0, 100);
  }
  S.rent = wk.rent;
  setMarket(wk.market, S.pop);
  save();
  const cfg = DAYS[S.day - 1];
  const prev = S.day > 1 ? DAYS[S.day - 2] : null;
  const fresh = cfg.rules.map((r) => ({ r, isNew: true }));
  const newTools = prev ? cfg.tools.filter((t) => !prev.tools.includes(t)) : [];
  const newLines = prev ? cfg.lines.filter((l) => !prev.lines.includes(l)) : cfg.lines;
  const letters = morningLetters(S.day, S.flags, S);
  app.innerHTML = `<div class="screen scroll"><div class="memo-wrap">
    ${isMonday(S.day) ? `<div class="weekcard"><span class="kicker">Week ${wk.n} of 5</span><b>${esc(wk.name)}</b></div>` : ''}
    <div class="paper memo">
      <div class="head"><h2>GEMLINE AUTHENTICATION · BULLETIN</h2><span>Week ${wk.n} · ${dayName(S.day)}</span></div>
      ${fresh.length ? `<ol>${fresh.map((x) => `<li class="new"><span class="tag">NEW</span>${esc(x.r)}</li>`).join('')}</ol>` : '<p style="margin:0">No new rules today. All standing rules apply (Reference → Rules).</p>'}
      <div class="stats"><span>QUOTA: ${cfg.quota} CARDS</span>${newLines.length ? `<span>NEW LINE: ${newLines.map((l) => LINES[l].name.toUpperCase()).join(', ')}</span>` : ''}${newTools.length ? `<span>NEW TOOL: ${newTools.map((t) => TOOLS[t].name.toUpperCase()).join(', ')}</span>` : ''}<span>CITATIONS THIS WEEK: ${S.citations}/${MAX_CITATIONS}</span><span>CASH: ${money(S.money)}</span><span>RENT ${isFriday(S.day) ? 'DUE TONIGHT' : 'FRIDAY'}: ${money(S.rent)}</span>${wk.pay !== 1 ? `<span>PAY RATE: ${Math.round(wk.pay * 100)}%</span>` : ''}</div>
      ${meterHTML()}
    </div>
    ${letters.map(letterHTML).join('')}
    <button class="btn primary" id="go">Start the shift · 9:00</button>
    <div class="row" style="justify-content:center"><button class="btn small" id="cdx">Codex</button><button class="btn small" id="quit">Save and quit</button></div>
  </div></div>`;
  $('#go').onclick = () => startShift(false);
  $('#cdx').onclick = showCodex;
  $('#quit').onclick = showTitle;
}

// ------------------------------------------------------------------ desk
const ICONS = {
  hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="9" height="13" rx="1.5"/><rect x="12" y="5" width="9" height="13" rx="1.5" stroke-dasharray="2 2"/><path d="M8 21h8M14 19l2 2-2 2"/></svg>',
  loupe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L21 21"/></svg>',
  micro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 3h4v6l-2 2-2-2z"/><path d="M11 11v4M6 21h12M8 21a7 7 0 0 1 3-6M15 13a5 5 0 0 1 2 8"/></svg>',
  ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>',
  uv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z"/></svg>',
  tilt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20h16M7 20l3-6M17 20l-3-6"/><rect x="6" y="3" width="10" height="11" rx="1" transform="rotate(-12 11 8)"/></svg>',
  water: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12z"/></svg>',
  registry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4M6 8h7M6 11h10"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="14" width="18" height="6" rx="1"/><path d="M6 14l1-4h10l1 4M9 17h6"/></svg>',
  light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M7 9h10M7 12h10M7 15h6"/></svg>',
  binder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h12"/></svg>',
};
const TOOL_ORDER = ['hand', 'loupe', 'micro', 'ruler', 'uv', 'tilt', 'light', 'water', 'scale', 'registry', 'binder'];

const TIPS = {
  2: '<b>New: UV lamp.</b> Old genuine stock stays dull. Fakes on modern paper glow bright. Bloomlings are in the queue now: read their reference notes.',
  3: '<b>New rules.</b> Flip every card. Under UV, touch-up ink glows in patches. Stamp plus shadow on a Bloomling means altered.',
  4: '<b>Trimmed cards are going around.</b> The Ruler shows card size as well as centering.',
  6: '<b>New: tilt stand and Moth &amp; Lantern.</b> Every genuine Moth &amp; Lantern card has hidden ink under UV. The tilt stand makes holograms shift.',
  7: '<b>New: dropper and Tidebound.</b> Tap a drop of water onto a Tidebound card: it beads on real stock. Never use it on any other line.',
  8: '<b>New: registry and Rift Duelists.</b> The hex hologram must shift color on the tilt stand. The registry shows population reports and serials.',
  11: '<b>The Boom.</b> VIP walk-ins pay well. New: scale and Grimoire Accord. Measure Alpha corners with the ruler: all four should match.',
  12: '<b>New: microscope and Hollow Pantheon.</b> Tarnished leaf means a 1987 first print. Genuine leaf shows flakes under the microscope.',
  13: '<b>Ring forgeries.</b> Check the microprint along the bottom border with the microscope. New: light box and Ironclad Derby.',
  16: '<b>The Crash.</b> Pay is down a quarter. New: Cryptid Field Notes. Look up serials on the registry.',
  17: '<b>New: Starpost.</b> The ruler counts perforations. An upside-down center is a genuine error.',
  25: '<b>Final audit.</b> Everything you stamp today counts.',
};

function startShift(resuming) {
  closeAllModals();
  const cfg = DAYS[S.day - 1];
  setMarket(weekOf(S.day).market, S.pop);
  const sh = resuming ? S.shift : null;
  const R = makeRng(S.seed + S.day * 7919, sh ? sh.rng : undefined);
  D = { cfg, R, story: sh ? sh.story : storySubs(R, S.day, S.flags), served: sh ? sh.served : 0, minute: sh ? sh.minute : 0, sub: null,
    face: 'front', tool: 'hand', uv: false, ruler: false, tilt: false, light: false, water: [], measured: false, weighed: false, registry: null,
    found: new Set(), paid: {}, log: sh ? sh.log : [], ended: false, cites: sh ? sh.cites : 0, tip: TIPS[S.day] || null, tipSeen: sh ? true : false,
    coach: S.day === 1 && !sh ? 0 : -1, timer: null, busy: false, ticks: 0 };
  S.phase = 'shift';
  const tools = TOOL_ORDER.filter((t) => cfg.tools.includes(t));
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
      <div class="tools-scroll">${tools.map((t) => `<button class="tool" data-tool="${t}" title="${esc(TOOLS[t].desc)}">${ICONS[t]}<span>${TOOLS[t].name}</span></button>`).join('')}</div>
      <button class="verdict-btn" id="verdictBtn">VERDICT</button>
    </div>
  </div>`;
  $$('.side-tabs button[data-tab]').forEach((b) => b.onclick = () => {
    $('#side').dataset.tab = b.dataset.tab;
    $$('.side-tabs button[data-tab]').forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
  });
  $('#strip').onclick = () => { $('#side').classList.toggle('open'); sfx('ui'); };
  $('#sideClose').onclick = () => $('#side').classList.remove('open');
  setScene(D.minute >= 420 ? 'deskLate' : 'desk');
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
  if (sh && sh.sub) { D.sub = sh.sub; resetCard(); (sh.found || []).forEach((id) => D.found.add(id)); D.measured = !!sh.measured; renderAll(true); } else nextCard();
  updateTop();
  D.timer = setInterval(tick, SPEEDS[getSettings().speed].ms);
  saveShift();
}

function saveShift() {
  if (!D || D.ended) return;
  S.phase = 'shift';
  S.shift = { rng: D.R.state(), story: D.story, served: D.served, minute: D.minute, log: D.log, cites: D.cites, sub: D.sub, found: [...D.found], measured: D.measured };
  save();
}

function onKey(e) {
  if (!D || D.ended || modals.length) return;
  const k = e.key.toLowerCase();
  const map = { h: 'hand', l: 'loupe', m: 'micro', r: 'ruler', u: 'uv', t: 'tilt', b: 'binder', w: 'water', s: 'scale', g: 'registry', x: 'light' };
  if (map[k] && D.cfg.tools.includes(map[k])) useTool(map[k]);
  if (k === 'f') flip();
  if (k === 'v' || k === 'enter') openVerdict();
}

function tick() {
  if (!D || D.ended || document.hidden || D.busy) return;
  if (modals.some((m) => m.dataset.pause)) return;
  addMinutes(1, true);
  if (++D.ticks % 10 === 0) saveShift();
}
function addMinutes(n, quiet) {
  D.minute += n;
  if (!quiet) toast(`+${n} min`);
  updateTop();
  if (D.minute >= 480 && !D.ended) endShift(false);
}
function clockStr(m) { const h = 9 + Math.floor(m / 60), mm = m % 60; return `${h > 12 ? h - 12 : h}:${String(mm).padStart(2, '0')}${h >= 12 ? ' pm' : ' am'}`; }
function updateTop() {
  if (!$('#clock') || !D) return;
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

function resetCard() {
  D.face = 'front'; D.uv = false; D.ruler = false; D.tilt = false; D.light = false; D.water = []; D.damaged = false;
  D.measured = false; D.weighed = false; D.registry = null; D.found = new Set(); D.paid = {};
  if (D.tool !== 'loupe' && D.tool !== 'micro') D.tool = 'hand';
}

function nextCard() {
  const st = D.story.find((x) => x.at === D.served && !x.used);
  if (st) { st.used = true; D.sub = st.sub; } else D.sub = makeSubmission(D.R, D.cfg, S.day, { rep: S.rep });
  resetCard();
  renderAll(true);
}
function renderAll(slideIn) {
  renderForm();
  renderCard(slideIn);
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

function viewOpts(extra = {}) {
  return { face: D.face, uv: D.uv, ruler: D.ruler, tilt: D.tilt, light: D.light, water: D.face === 'front' ? D.water : [], ...extra };
}
function renderCard(slideIn) {
  const inst = D.sub.inst;
  $('#cardview').innerHTML = cardSVG(inst, viewOpts());
  $('#lensInner').innerHTML = cardSVG(inst, viewOpts({ ruler: false, micro: true, microprint: D.tool === 'micro' }));
  if (slideIn) { const cv = $('#cardview'); cv.classList.remove('slide-in'); void cv.offsetWidth; cv.classList.add('slide-in'); }
  fitStage();
  checkClue();
}

// Ghost Print clues reveal themselves when you look the right way.
function checkClue() {
  const c = D.sub.inst.clue;
  if (!c || S.flags['clue_' + c]) return;
  const hit = (c === 'uv' && D.uv && D.face === 'front') || (c === 'light' && D.light) || (c === 'back' && D.face === 'back') || (c === 'registry' && D.registry);
  if (!hit) return;
  S.flags['clue_' + c] = true;
  S.clues = (S.clues || 0) + 1;
  sfx('sparkle');
  const info = CLUES[c];
  setTimeout(() => {
    const m = modal(`${letterHTML({ from: info.title, body: [...info.body, `(Clue ${S.clues} of 4. Ellis Marsh's Ghost Print is out there.)`] })}<button class="btn primary" data-x>Keep it in mind</button>`);
    m.dataset.pause = '1';
    $('[data-x]', m).onclick = () => m.close();
  }, 300);
}

function renderMarks() {
  const marks = $('#marks');
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
      <dt>Service</dt><dd>${TIERS[f.tier].name} · ${money(payFor(f.tier))}</dd>
      <dt>Card</dt><dd>${esc(f.name)}</dd>
      <dt>Set</dt><dd>${esc(L.name)} (${L.year})</dd>
      <dt>Number</dt><dd>${pad3(f.n)}/${pad3(L.total)}</dd>
      <dt>Variant</dt><dd>${f.claims.length ? esc(f.claims.join(', ')) : 'None claimed'}</dd>
      <dt>Declared</dt><dd>${esc(f.declared)}</dd>
    </dl>${f.note ? `<div class="note">${esc(f.note)}</div>` : ''}`;
  renderStrip();
}

function renderStrip() {
  const el = $('#strip');
  if (!el || !D || !D.sub) return;
  const f = D.sub.form, L = LINES[f.line], w = worksheet();
  el.innerHTML = `<span class="s-main"><b>${esc(f.name)}</b><span>${esc(L.setCode)} ${pad3(f.n)} · ${f.claims.length ? esc(f.claims.join(', ')) : 'No variant claimed'}${f.note ? ' · <i>note attached</i>' : ''}</span></span>
    <span class="s-grade"><b>${fmtG(w.grade)}</b><small>${D.measured ? '' : 'ctr? · '}${w.found.length} tagged</small></span><span class="s-chev" aria-hidden="true">⌃</span>`;
}

function worksheet() {
  const inst = D.sub.inst;
  const found = inst.defects.filter((d) => D.found.has(d.id));
  const c = centerPct(inst.dx, inst.dy);
  const subs = subsFrom(found, D.measured ? c.worst : null);
  return { subs, grade: finalGrade(subs), found, c };
}

function readings() {
  const inst = D.sub.inst, out = [];
  if (D.measured) { out.push(['Size', cardSize(inst)]); extraReadings(inst).forEach((t) => out.push(['Ruler', t])); }
  if (D.weighed) out.push(['Weight', `${cardWeight(inst)} (ref ${LINES[inst.line].weight.toFixed(2)} g)`]);
  if (D.water.length) out.push(['Water', inst.line === 'tb' && !(inst.fake && inst.fake.kinds.includes('absorb')) ? 'Beaded on the surface' : 'Soaked in and stained']);
  if (D.registry) out.push(['Registry', D.registry]);
  return out;
}

function renderSheet() {
  const w = worksheet();
  const cats = [['Corners', 'corners'], ['Edges', 'edges'], ['Surface', 'surface']];
  const rd = readings();
  $('#sheet').innerHTML = `<h3>Worksheet</h3>
    <div class="subs">
      <span>Centering</span><span class="v">${D.measured ? fmtG(w.subs.centering) : '10?'}</span>
      <span class="dim">${D.measured ? `L/R ${Math.round(w.c.lr)}/${Math.round(100 - w.c.lr)} · T/B ${Math.round(w.c.tb)}/${Math.round(100 - w.c.tb)}` : 'Not measured. Counts as 10.'}</span>
      ${cats.map(([n, k]) => `<span>${n}</span><span class="v">${fmtG(w.subs[k])}</span>`).join('')}
    </div>
    <div class="grade-big"><span class="num">${fmtG(w.grade)}</span><span class="nm">${gradeName(w.grade, w.subs)}</span></div>
    ${rd.length ? `<dl class="readings">${rd.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}
    <ul class="taglist">${w.found.length ? w.found.map((d, i) => `<li>${i + 1}. <b>${defectName(d)}</b></li>`).join('') : '<li>No flaws tagged yet. Check both sides.</li>'}</ul>`;
  renderStrip();
}

function updateTools() {
  $$('.tool').forEach((b) => {
    const t = b.dataset.tool;
    const on = ['hand', 'loupe', 'micro', 'water'].includes(t) ? D.tool === t : t === 'ruler' ? D.ruler : t === 'uv' ? D.uv : t === 'tilt' ? D.tilt : t === 'light' ? D.light : false;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  const st = $('#stage');
  st.classList.toggle('tool-loupe', D.tool === 'loupe' || D.tool === 'micro' || D.tool === 'water');
  st.classList.toggle('tool-hand', D.tool === 'hand');
}

function payTool(t) {
  const cost = TOOLS[t].cost || 0;
  if (cost && !D.paid[t]) { D.paid[t] = true; addMinutes(cost); }
}

function useTool(t) {
  if (!D || D.ended || D.busy) return;
  sfx('tool');
  if (['hand', 'loupe', 'micro', 'water'].includes(t)) {
    D.tool = t; $('#lens').hidden = true;
    if (t === 'micro' || t === 'loupe') renderCard();
    if (t === 'water') toast(D.sub.inst.line === 'tb' ? 'Tap the card to place a drop.' : 'Careful: water only belongs on Tidebound cards.');
  }
  if (t === 'ruler') { payTool(t); D.ruler = !D.ruler; D.measured = true; renderCard(); renderSheet(); }
  if (t === 'uv') { payTool(t); D.uv = !D.uv; if (D.uv) D.light = false; renderCard(); }
  if (t === 'tilt') { payTool(t); D.tilt = !D.tilt; renderCard(); }
  if (t === 'light') { payTool(t); D.light = !D.light; if (D.light) D.uv = false; renderCard(); }
  if (t === 'scale') { payTool(t); D.weighed = true; toast(`Scale: ${cardWeight(D.sub.inst)}. Reference ${LINES[D.sub.inst.line].weight.toFixed(2)} g.`); renderSheet(); }
  if (t === 'registry') { payTool(t); openRegistry(); }
  if (t === 'binder') { payTool(t); openReference(D.sub.form.line, D.sub.form.n, D.cfg.lines); }
  updateTools();
  coach();
}

function flip() {
  sfx('flip');
  const cv = $('#cardview');
  cv.classList.remove('flipping'); void cv.offsetWidth; cv.classList.add('flipping');
  setTimeout(() => { D.face = D.face === 'front' ? 'back' : 'front'; renderCard(); renderMarks(); }, 170);
}

function bindStage() {
  const stage = $('#stage'), lens = $('#lens');
  let st = null;
  const pt = (e) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  const lensOn = () => D.tool === 'loupe' || D.tool === 'micro';
  const showLens = (p, touch) => {
    const Z = D.tool === 'micro' ? 7 : 3.2, R = 75, r = stage.getBoundingClientRect();
    lens.hidden = false;
    lens.classList.toggle('micro', D.tool === 'micro');
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
    if (lensOn()) showLens(p, e.pointerType !== 'mouse');
  });
  stage.addEventListener('pointermove', (e) => {
    if (!D || D.ended) return;
    const p = pt(e);
    if (st && Math.hypot(p.x - st.x, p.y - st.y) > 7) st.moved = true;
    if (lensOn() && (st || e.pointerType === 'mouse')) showLens(p, e.pointerType !== 'mouse');
  });
  const up = (e) => {
    if (!st) return;
    const p = pt(e);
    const tap = !st.moved && Date.now() - st.t < 600;
    if (tap && D.tool === 'hand') flip();
    if (tap && D.tool === 'water') placeDrop(p);
    if (lensOn()) {
      if (tap) tagAt(p);
      else if (st.type !== 'mouse') tagAt(p, true);
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

function placeDrop(p) {
  if (D.face !== 'front') { toast('Turn the card face up first.'); return; }
  payTool('water');
  const inst = D.sub.inst;
  D.water.push({ x: Math.round((p.x / p.w) * 250), y: Math.round((p.y / p.h) * 350) });
  const beads = inst.line === 'tb' && !(inst.fake && inst.fake.kinds.includes('absorb'));
  if (!beads && !inst.fake) { D.damaged = true; toast('The ink runs. That was a client\'s card.', 'bad'); sfx('miss'); }
  else toast(beads ? 'The drop beads up.' : 'The drop soaks straight in.');
  renderCard(); renderSheet();
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

// ------------------------------------------------------------------ registry terminal
function openRegistry() {
  const inst = D.sub.inst, key = inst.line + ':' + inst.n;
  const R = makeRng((inst.n * 131 + inst.line.charCodeAt(0) * 17) >>> 0);
  const pop = [6, 7, 8, 9, 10].map((g) => [g, R.int(g === 10 ? 2 : 8, g === 10 ? 14 : 70) + (g === 10 ? (S.pop[key] || 0) : 0)]);
  let serial = '';
  if (inst.v.serial) {
    const sn = String(inst.v.serial).padStart(2, '0');
    if (inst.clue === 'registry') serial = `Serial ${sn}/50 is registered to ELLIS MARSH (deceased 2004). Estate: unsold lots consigned to a night market vendor, Thursdays.`;
    else if (inst.fake && inst.fake.kinds.includes('dupserial')) serial = `Serial ${sn}/50 is ALREADY REGISTERED to slab #G-${4000 + inst.v.serial * 37}, graded 8.5 in 1991.`;
    else serial = `Serial ${sn}/50: no record. First submission.`;
  }
  D.registry = serial ? serial.split('.')[0] : `Pop report checked (${pop[4][1]} tens on file)`;
  const m = modal(`<div class="terminal"><div class="t-head">GEMLINE REGISTRY · TERMINAL 4</div>
    <div>&gt; LOOKUP ${esc(LINES[inst.line].setCode)} ${pad3(inst.n)} ${esc(cardTitle(inst).toUpperCase())}</div>
    <div class="t-pop">${pop.map(([g, n]) => `<span>GRADE ${g}</span><span>${'█'.repeat(Math.max(1, Math.round(n / 5)))} ${n}</span>`).join('')}</div>
    ${serial ? `<div>&gt; SERIAL CHECK</div><div class="t-out">${esc(serial)}</div>` : '<div>&gt; NO SERIAL ON THIS CARD</div>'}
    <div>&gt; STOLEN REPORTS: NONE</div></div><button class="btn primary" data-x>Close</button>`);
  $('[data-x]', m).onclick = () => m.close();
  renderSheet();
  checkClue();
}

// ------------------------------------------------------------------ reference binder
function openReference(line, n, lines) {
  let cur = { line, n: CARDS[line].some((c) => c.n === n) ? n : 1 };
  const m = modal(`<div class="row" style="justify-content:space-between;align-items:center"><h2>Reference binder</h2><button class="btn small" data-close>Close</button></div>
    <div class="shop-tabs scrolltabs" id="rtabs"><button data-l="rules">Rules</button><button data-l="codex">Codex</button>${lines.map((l) => `<button data-l="${l}">${LINES[l].name}</button>`).join('')}</div>
    <div id="rbody"></div>`, { wide: true });
  $('[data-close]', m).onclick = () => m.close();
  const draw = () => {
    $$('#rtabs button', m).forEach((b) => b.setAttribute('aria-selected', b.dataset.l === cur.line ? 'true' : 'false'));
    if (cur.line === 'rules') {
      const rules = DAYS.slice(0, S.day).flatMap((d) => d.rules);
      $('#rbody', m).innerHTML = `<div class="paper memo" style="max-width:none"><div class="head"><h2>STANDING RULES</h2><span>${dayName(S.day)}</span></div><ol>${rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ol></div>`;
      return;
    }
    if (cur.line === 'codex') { $('#rbody', m).innerHTML = codexHTML(); return; }
    const L = LINES[cur.line];
    const c = CARDS[cur.line].find((x) => x.n === cur.n);
    const off = blankInst(cur.line, cur.n);
    const stat = cur.line === 'ic' ? `<table class="statsheet"><tr><th></th><th>Run 1</th><th>Run 2</th></tr>${['Speed', 'Grit', 'Boiler'].map((nm, k) => `<tr><td>${nm}</td><td>${c.s1[k]}</td><td>${c.s2[k]}</td></tr>`).join('')}</table>` : '';
    $('#rbody', m).innerHTML = `<div class="viewer">
      <div style="display:flex;gap:10px;flex:0 1 auto;margin:0 auto"><div style="width:min(190px,40vw)">${cardSVG(off, { clean: true })}</div><div style="width:min(190px,40vw)">${cardSVG(off, { clean: true, face: 'back' })}</div></div>
      <div class="info"><b style="font-family:var(--f-display);font-size:20px">${esc(c.full || c.name)}</b>
        <span class="mono">${esc(L.setCode)} · ${pad3(c.n)}/${pad3(L.total)} · ${rarityName(off)} · ${L.weight.toFixed(2)} g</span>
        ${stat}
        <ul style="margin:4px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:4px;color:var(--muted)">${L.notes.map((x) => `<li>${esc(x)}</li>`).join('')}<li>Microprint along the bottom border reads "${esc(L.micro)}".</li></ul></div>
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
    ['grade', 'GRADE', 'Authentic. Seal it in a slab.'],
    ['error', 'AUTHENTIC ERROR', 'A genuine misprint. Grade it and label it.'],
    ['altered', 'ALTERED', 'Trimmed, recolored, recut or stamped after printing.'],
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

const STICKY = { counterfeit: ['COUNTERFEIT', 'Returned to client, unsealed.'], altered: ['ALTERED', 'Returned to client, unsealed.'], return: ['RETURNED', 'Card does not match the form.'] };

function stamp(verdict, grade) {
  D.busy = true;
  $('#side').classList.remove('open');
  const sub = D.sub, inst = sub.inst;
  const entry = { sub, verdict, grade: verdict === 'grade' || verdict === 'error' ? grade : null, truth: truthOf(sub), found: [...D.found], measured: D.measured, sheet: worksheet().grade, damaged: D.damaged };
  judge(entry);
  D.log.push(entry);
  if (sub.story) onStoryStamp(sub, verdict, grade, S.flags);
  if (sub.story === 'vince1') achieve(S.flags.vince1 === 'took' ? 'took' : 'refuse');
  if (D.coach >= 0 && sub.story === 'tutorial') D.coach = -1;
  afterStamp(entry);
  $('#lens').hidden = true;
  const sealed = verdict === 'grade' || verdict === 'error';
  sfx('stamp');
  if (sealed) slabAnimation(inst, verdict, grade); else stickyAnimation(verdict);
  if (entry.res === 'cite') { D.cites++; setTimeout(() => citationSlip(entry), sealed ? 1500 : 1100); }
  setTimeout(() => {
    if (!D || D.ended) return;
    $$('.slab-anim, .sticky-anim').forEach((x) => x.remove());
    $('#cardview').className = '';
    D.served++;
    D.busy = false;
    $('#coach').hidden = true;
    nextCard();
    updateTop();
    saveShift();
  }, sealed ? 1900 : 1400);
  addMinutes(2, true);
}

// Bookkeeping after each verdict: meters, codex, achievements, Fake Binder, population.
function afterStamp(e) {
  const inst = e.sub.inst, walkIn = e.res === 'story';
  if (!walkIn) meters(e.res === 'ok' ? { rep: 1 } : { rep: -3, sus: e.grade != null && e.grade > e.sheet && e.truth.grade < e.grade ? 3 : 0 });
  if (inst.fake && (e.res === 'cite' || e.verdict === 'counterfeit')) inst.fake.kinds.forEach(learn);
  if (inst.alt && (e.res === 'cite' || e.verdict === 'altered')) learn(inst.alt.kind);
  learnInst(inst);
  if (e.verdict === 'counterfeit' && inst.fake) {
    S.stats.fakesCaught = (S.stats.fakesCaught || 0) + 1;
    if (S.stats.fakesCaught >= 10) achieve('fakes10');
    if (S.stats.fakesCaught >= 50) achieve('fakes50');
    const ring = inst.fake.kinds.includes('micro');
    if (ring) achieve('ring');
    if (ring || Math.random() < 0.35) {
      S.fakes.push(JSON.parse(JSON.stringify(inst)));
      setTimeout(() => toast(ring ? 'A ring forgery. You keep it, quietly. Evidence.' : '"Keep it," the client says. "Burn it." It goes in your Fake Binder.', 'good'), 1600);
    }
  }
  if ((e.verdict === 'grade' || e.verdict === 'error') && !walkIn) {
    achieve('first_slab');
    if (e.res === 'ok' && e.grade === 10 && e.truth.grade === 10 && e.truth.subs.centering === 10 && e.truth.subs.corners === 10 && e.truth.subs.edges === 10 && e.truth.subs.surface === 10) achieve('pristine');
    if (e.grade === 10) { const k = inst.line + ':' + inst.n; S.pop[k] = (S.pop[k] || 0) + 1; }
    S.graded.push({ inst: JSON.parse(JSON.stringify(inst)), grade: e.grade });
    if (S.graded.length > 25) S.graded.shift();
  }
}

function slabAnimation(inst, verdict, grade) {
  const wrap = $('#wrap'), stage = $('#stage');
  const r = stage.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'slab-anim';
  const H = Math.min(wr.height - 12, r.height * 1.22);
  el.style.height = H + 'px';
  el.style.left = (wr.width / 2) + 'px';
  el.style.top = (wr.height / 2) + 'px';
  el.innerHTML = slabHTML(inst, { grade: verdict === 'error' ? 'ERR ' + fmtG(grade) : grade, label: verdict === 'error' ? 'AUTHENTIC ERROR' : gradeName(grade) });
  wrap.appendChild(el);
  $('#cardview').classList.add('into-slab');
  setTimeout(() => sfx('rustle'), 450);
  setTimeout(() => sfx('tool'), 700);
  setTimeout(() => { el.classList.add('away'); sfx('whoosh'); }, 1350);
}

function stickyAnimation(verdict) {
  const wrap = $('#wrap');
  const [title, line] = STICKY[verdict];
  const el = document.createElement('div');
  el.className = 'sticky-anim';
  el.innerHTML = `<b>${title}</b><span>${line}</span><i>— ${dayName(S.day).slice(0, 3)} · desk 4</i>`;
  $('#stage').appendChild(el);
  sfx('rustle');
  setTimeout(() => { $('#cardview').classList.add('slide-away'); el.classList.add('away'); sfx('whoosh'); }, 800);
  void wrap;
}

function endShift(early) {
  if (D.ended) return;
  saveShift();
  D.ended = true;
  clearInterval(D.timer);
  window.removeEventListener('resize', fitStage);
  window.removeEventListener('keydown', onKey);
  closeAllModals();
  toast(early ? 'You clock out.' : 'Five o\'clock. Pens down.');
  setTimeout(showPayday, early ? 300 : 1100);
}

// ------------------------------------------------------------------ judging
function judge(e) {
  if (e.sub.story && !['tutorial', 'clue1', 'clue2', 'clue3', 'clue4', 'widower'].includes(e.sub.story)) { e.res = 'story'; return e; }
  if (e.damaged && !e.sub.inst.fake) { e.res = 'cite'; e.why = 'Water-damaged a client\'s card'; e.detail = 'The dropper is for Tidebound only. Every other line stains.'; return e; }
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
  nohidden: () => 'No hidden ink under UV. Every genuine Moth & Lantern card has some.',
  absorb: () => 'Water soaks into it. Genuine Tidebound stock is waterproof.',
  flathex: () => 'The hex hologram stays flat silver on the tilt stand.',
  weight: (inst) => `It weighs ${cardWeight(inst)}. The reference is ${LINES[inst.line].weight.toFixed(2)} g.`,
  paint: () => 'The gold is paint: smooth under the microscope, no leaf flakes.',
  micro: (inst) => `A ring forgery. The microprint reads "${'…'}${LINES[inst.line].micro.slice(0, 3)}${LINES[inst.line].micro[4]}${LINES[inst.line].micro[3]}…". Check it under the microscope.`,
  stock: () => 'Light shines straight through it on the light box. Thin modern stock.',
  badstats: (inst) => { const s = icStats(inst); return `Its stats (${s.s.join('/')}) don't match Run ${s.run1 ? 1 : 2} on the stat sheet.`; },
  dupserial: (inst) => `Serial ${String(inst.v.serial).padStart(2, '0')}/50 is already registered to another card.`,
  perfs: () => 'Wrong perforation count: 27 × 19. Genuine is 28 × 20.',
};
const ALT_TELL = {
  stamp: '1st Edition stamp on a print with a drop shadow. Real 1st Editions are shadowless.',
  recolor: 'A damaged spot was inked over. It glows in a patch under the UV lamp.',
  trim: 'It measures 2.46 × 3.44 in. Someone trimmed the edges.',
  alphatrim: 'The corners don\'t match: one was recut to fake an Alpha.',
};

function citeReason(e) {
  const ok = e.truth.ok, v = e.verdict;
  if (ok.includes('return') && v !== 'return') return 'Missed a form mismatch';
  if (ok.includes('counterfeit') && (v === 'grade' || v === 'error')) return 'Passed a counterfeit';
  if (ok.includes('altered') && (v === 'grade' || v === 'error')) return 'Passed an altered card';
  if ((ok.includes('altered') || ok.includes('counterfeit')) && (v === 'altered' || v === 'counterfeit')) return 'Wrong rejection: it was ' + (ok.includes('altered') ? 'altered' : 'counterfeit');
  if (v === 'counterfeit' || v === 'altered') return 'Rejected a genuine card';
  if (v === 'return') return 'Returned a card that matched its form';
  if (v === 'error' && ok.includes('grade')) return 'Labeled an error that isn\'t there';
  if (v === 'grade' && ok.includes('error')) return 'Missed a genuine error';
  return 'Wrong verdict';
}

function citeDetail(e) {
  const { inst, form } = e.sub, ok = e.truth.ok, v = e.verdict;
  if (ok.includes('return') && v !== 'return') {
    if (e.sub.mismatch === 'name') return `The form says ${form.name}. The card is ${cardTitle(inst)}.`;
    if (e.sub.mismatch === 'number') return `The form says No. ${pad3(form.n)}. The card is No. ${pad3(inst.n)}.`;
    const extra = form.claims.filter((c) => !variantLabels(inst.v, inst.line).includes(c));
    return `The form claims ${extra.join(', ') || 'a variant'}. The card isn't.`;
  }
  if (ok.includes('counterfeit') && v !== 'counterfeit') return inst.fake.kinds.map((k) => (FAKE_TELL[k] ? FAKE_TELL[k](inst) : '')).join(' ');
  if (ok.includes('altered') && v !== 'altered') return ALT_TELL[inst.alt.kind];
  if (v === 'counterfeit' || v === 'altered') return 'Nothing on it was fake or tampered with.';
  if (v === 'return') return 'Name, number and variant all matched the form.';
  if (v === 'error' && ok.includes('grade')) return 'It printed normally. It isn\'t an error.';
  if (v === 'grade' && ok.includes('error')) return inst.v.inverted ? 'The center is printed upside down. That\'s a genuine error.' : 'The yellow ink layer is missing. That\'s a genuine error.';
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
const payFor = (tier) => {
  const wk = weekOf(S.day);
  return Math.round(TIERS[tier].pay * wk.pay) + (S.rep >= 75 ? 2 : 0);
};

function showPayday() {
  setScene('payday');
  $('#toasts').innerHTML = '';
  const rows = [];
  let pay = 0, bonus = 0, cites = 0;
  D.log.forEach((e) => {
    const p = payFor(e.sub.form.tier);
    pay += p;
    const r = { name: cardTitle(e.sub.inst), verdict: e.verdict, grade: e.grade, pay: p, res: e.res, why: e.why, exact: e.exact };
    if (e.res === 'cite') cites++;
    if (e.res === 'ok' && e.exact) bonus += 4;
    rows.push(r);
    S.history.push({ day: S.day, name: r.name, verdict: e.verdict, grade: e.grade, truth: e.truth.grade, ok: e.res === 'ok', story: e.res === 'story' ? e.sub.story : null });
  });
  const fines = Math.max(0, cites - 1) * 5;
  const short = Math.max(0, D.cfg.quota - D.served);
  const shortFine = short * 5;
  S.money += pay + bonus - fines - shortFine - FOOD;
  S.citations += cites;
  S.stats.graded += D.log.length;
  S.stats.correct += rows.filter((r) => r.res === 'ok').length;
  S.stats.cited += cites;
  S.stats.earned += pay + bonus;
  if (!cites && D.served >= D.cfg.quota) { meters({ rep: 2 }); achieve('clean_day'); }
  if (short) meters({ rep: -short });
  let rentLine = '';
  if (isFriday(S.day)) {
    if (S.money >= S.rent) { S.money -= S.rent; rentLine = `<tr><td>Rent to Mr. Gaunt</td><td class="amt bad">−${money(S.rent)}</td></tr>`; }
    else { S.flags.evicted = true; rentLine = `<tr><td>Rent to Mr. Gaunt: <span class="cite">you are ${money(S.rent - S.money)} short</span></td><td class="amt bad">unpaid</td></tr>`; }
  }
  S.shift = null;
  S.phase = 'payday';
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
      <p class="mono" style="font-size:12px;color:var(--ink-soft);margin:10px 0 0">Citations this week: ${S.citations}/${MAX_CITATIONS}${weekOf(S.day).pay !== 1 ? ` · Pay rate ${Math.round(weekOf(S.day).pay * 100)}%` : ''}${S.rep >= 75 ? ' · Senior rate +$2/card' : ''}</p>
      ${meterHTML()}
    </div>
    <button class="btn primary" id="home">Go home</button>
  </div></div>`;
  $('#home').onclick = afterPayday;
  D = null;
  save();
}

function afterPayday() {
  if (S.flags.evicted) return gameOver('evicted');
  if (S.sus >= 100) return gameOver('arrested');
  if (S.citations >= MAX_CITATIONS || S.rep <= 0) return gameOver('fired');
  const evs = eveningEvents(S.day, S.flags, S);
  if (S.day === 5) evs.push(...weekOneAudit());
  app.innerHTML = '<div class="screen city"></div>';
  runEvents(evs, () => {
    if (S.sus >= 100) return gameOver('arrested');
    if (S.day >= LAST_DAY) return finale();
    S.phase = 'evening';
    S.eve = null;
    if (isFriday(S.day)) {
      S.weekend = true; S.actions = 3;
      if (S.day === 20) achieve('survivor');
      return runEvents(weekendEvents(S.day / 5, S.flags, S), () => { save(); showCity(); });
    }
    S.weekend = false; S.actions = 2;
    save();
    showCity();
  });
}

function weekOneAudit() {
  const f = S.flags, ev = [];
  const bad = S.history.filter((h) => !h.ok && !h.story);
  if (f.vince1 === 'took') ev.push({ from: 'Director Pike\'s office, 5:40 p.m.', body: ['Pike has three of your slabs on his desk. One of them is the Ashowl you sealed for Carrow.', '"This isn\'t a nine," he says. He doesn\'t raise his voice. He doesn\'t call security.', '"Carrow pays you. Fine. From Monday, Carrow pays me, through you."', 'The audit report on his desk already says CLEAN. The audit was never about the cards.'] });
  else if (bad.length >= 4) ev.push({ from: 'Director Pike\'s office, 5:40 p.m.', body: [`Pike lays out ${Math.min(bad.length, 5)} of your slabs in a row. Every one of them is wrong.`, '"One more week like this," he says, "and you can go back to whatever you did before."'], rep: -5 });
  else ev.push({ from: 'Director Pike\'s office, 5:40 p.m.', body: ['Pike re-grades three of your slabs at his desk, slowly, with his own loupe.', '"Clean," he says, like the word costs him something.'], rep: 5 });
  if (f.vince1 === 'refused') {
    const best = [...S.collection].sort((a, b) => cardValue(b) - cardValue(a))[0];
    const body = ['When you get home the door is open. Not broken. Open. Someone had a key.', 'Your binder is on the kitchen floor, every page turned.'];
    if (best) { S.collection.splice(S.collection.indexOf(best), 1); body.push(`Your ${cardTitle(best)} is gone. Its sleeve is on the table, cut in half.`); }
    body.push('On Theo\'s pillow, face up: a Neon Saints card. Midnight Magnus. "The lights go out. So do you."');
    ev.push({ from: 'Home, 7:15 p.m.', body });
  }
  return ev;
}

// ------------------------------------------------------------------ the city
function collectionValue() { return S.collection.reduce((s, i) => s + cardValue(i), 0); }

function eveClock() {
  if (S.weekend) return ['SATURDAY MORNING', 'SATURDAY AFTERNOON', 'SATURDAY EVENING', 'SATURDAY NIGHT'][3 - S.actions] || 'SATURDAY';
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
  apex: { name: 'Apex Grading', blurb: 'Send your own cards to be slabbed. Dispute their mistakes.', walk: 'Walking down Mill Street to Apex…' },
  auction: { name: 'The Corn Exchange auction', blurb: 'Saturdays only. Bid against collectors, or sell to the room.', walk: 'Taking the tram to the Corn Exchange…', weekend: true },
  home: { name: 'Home', blurb: 'Theo, your binder, and bed.', walk: 'Climbing three flights of stairs…' },
};

function showCity() {
  setScene('street');
  closeAllModals();
  $('#toasts').innerHTML = '';
  S.phase = 'evening';
  setMarket(weekOf(S.day).market, S.pop);
  save();
  const a = S.actions;
  const open = { shop: a > 0, market: a > 0, diner: a > 0 };
  const places = Object.entries(PLACES).filter(([, p]) => !p.weekend || S.weekend);
  app.innerHTML = `<div class="screen street-screen">
    <div class="street-scene">${streetSVG(open, S.flags, S.day)}</div>
    <div class="street-panel scroll">
      <div class="loc-head"><div><div class="kicker">${eveClock()} · ${S.weekend ? 'WEEKEND' : dayName(S.day).toUpperCase() + ' NIGHT'}</div><h2>${S.weekend ? 'The weekend' : 'Outside Gemline'}</h2></div><span class="chip mono">${money(S.money)}</span></div>
      <p class="sub">${a ? `You have time for ${a} more ${a === 1 ? 'stop' : 'stops'}.` : 'Everything is closing. Time to go home.'} Rent ${money(weekOf(S.day + (S.weekend ? 1 : 0)).rent)} on Friday.${weekOf(S.day).market !== 1 ? ` Market: ${weekOf(S.day).market > 1 ? 'booming' : 'crashed'}.` : ''}</p>
      <div class="places compact">${places.map(([k, p]) => `<button class="place" data-p="${k}" ${k !== 'home' && !a ? 'disabled' : ''}><b>${esc(p.name)}</b><small>${esc(k === 'diner' && !S.weekend && isThursday(S.day) ? 'Thursday: trade night in the back booth. Or four hours on the floor.' : p.blurb)}</small><span class="cost">${k === 'home' ? 'free' : a ? 'uses one stop' : 'closed'}</span></button>`).join('')}</div>
      <button class="btn small" id="quit">Save and quit to title</button>
    </div>
  </div>`;
  $$('[data-p]').forEach((b) => b.onclick = () => go(b.dataset.p));
  $$('.street .hot').forEach((g) => g.addEventListener('click', () => go(g.dataset.place)));
  $('#quit').onclick = () => { save(); showTitle(); };
}

function go(p) {
  if (p !== 'home' && !S.actions) { toast('It\'s too late for that.'); return; }
  travel(PLACES[p].walk, () => {
    if (p !== 'home') { S.actions--; save(); }
    ({ shop: showShop, market: showMarket, diner: showDiner, home: showHome, apex: showApex, auction: showAuction })[p]();
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
  if (!S.eve || S.eve.day !== S.day) S.eve = { day: S.day };
  return $('#locbody');
}

const unlockedLines = () => Object.keys(LINES).filter((l) => LINES[l].unlock <= S.day);
function cityRng() { return makeRng(Math.floor(Math.random() * 1e9)); }

function eveStock() {
  if (S.eve && S.eve.day === S.day && S.eve.singles) return S.eve;
  const R = cityRng();
  const singles = [];
  const lines = unlockedLines();
  for (let i = 0; i < 3; i++) {
    const line = R.pick(lines);
    const c = pickCard(R, line, { c: 3, u: 3, r: 2 });
    const inst = makeInst(R, line, c.n, pickQuality(R, -0.1));
    rollVariants(R, inst, { scale: 0.8 });
    singles.push({ inst, price: Math.max(2, Math.ceil(cardValue(inst) * 1.3)), label: 'Near mint' });
  }
  // The bargain: a chase version Lou has misjudged.
  const line = R.pick(lines.filter((l) => ['gg', 'bl', 'ml', 'hp', 'ic', 'ga'].includes(l)));
  const inst = makeInst(R, line, pickCard(R, line).n, 'nice');
  const chase = { gg: 'noYellow', bl: 'shadowless', ml: 'hidden', hp: 'vintage', ic: 'run1', ga: 'alpha' }[line];
  inst.v[chase] = true;
  singles.splice(R.int(0, 3), 0, { inst, price: Math.max(3, Math.ceil(cardValue({ ...inst, v: {} }) * 1.2)), label: 'Lou\'s price' });
  S.eve = { ...(S.eve || {}), day: S.day, singles };
  return S.eve;
}

function showShop() {
  setScene('shop');
  sfx('bell');
  const root = locScreen('loc-shop', shopSVG(), `${eveClock()} · BRICK & MORTAR CARDS`, 'Lou\'s counter', 'Lou', louLine(S.flags, S.day));
  const stock = eveStock();
  let tab = 'packs';
  root.innerHTML = `<p style="margin:0;color:var(--muted)" id="shopcash"></p>
    <div class="shop-tabs"><button data-t="packs">Packs</button><button data-t="singles">Under the glass</button><button data-t="sell">Sell to Lou</button></div>
    <div id="sbody"></div>`;
  $('#leave').onclick = () => { save(); leaveTo(); };
  const mk = marketNowLabel();
  const draw = () => {
    $('#shopcash').textContent = `Cash ${money(S.money)}.${mk}`;
    $$('[data-t]', root).forEach((b) => b.setAttribute('aria-selected', b.dataset.t === tab ? 'true' : 'false'));
    const body = $('#sbody');
    if (tab === 'packs') {
      const price = (l) => Math.max(3, Math.round(PACKS[l].price * (0.6 + weekOf(S.day).market * 0.4)));
      const left = packsLeft();
      const ration = left > 0
        ? `"${packLimit() === 2 ? 'Two' : 'Three'} packs a customer, a night. Everybody wants them, and the distributor's shorting me." <span class="mono" style="color:var(--lamp)">${left} left tonight</span>`
        : `"That's your lot for tonight. Come back tomorrow." <span class="mono" style="color:var(--stamp)">0 left tonight</span>`;
      body.innerHTML = `<p class="speech" style="margin:0">${ration}</p>
        <div class="packs">${unlockedLines().map((l) => `<button class="packbtn" data-pack="${l}" ${S.money < price(l) || left <= 0 ? 'disabled' : ''}>${packSVG(l)}<b>${PACKS[l].label}</b><span style="color:var(--muted)">${PACKS[l].sub}</span><span class="mono" style="color:var(--lamp)">${money(price(l))}</span></button>`).join('')}</div>
        <p style="color:var(--muted);font-size:13px;margin:0">Five cards a pack: three commons, an uncommon, and a shot at a rare (or, rarely, a mythic). Any card can come holo.</p>`;
      $$('[data-pack]', body).forEach((b) => b.onclick = () => { if (packsLeft() <= 0) return; const l = b.dataset.pack; S.money -= price(l); S.eve.packs = (S.eve.packs || 0) + 1; save(); openPack(l, draw); });
    }
    if (tab === 'singles') {
      body.innerHTML = `<p style="color:var(--muted);font-size:13px;margin:0">Lou prices by eye, and his eyes are tired. Tap a card for a closer look.</p>
        <div class="cardgrid">${stock.singles.map((x, i) => x.sold ? '' : `<div class="cardcell" style="cursor:default"><button class="cardcell" data-look="${i}">${cardSVG(x.inst)}</button><span>${esc(cardTitle(x.inst))}</span><span class="price">${esc(x.label)} · ${money(x.price)}</span><button class="btn small primary" data-buy="${i}" ${S.money < x.price ? 'disabled' : ''}>Buy</button></div>`).join('') || '<p>Sold out.</p>'}</div>`;
      $$('[data-buy]', body).forEach((b) => b.onclick = () => { const x = stock.singles[+b.dataset.buy]; S.money -= x.price; x.sold = true; S.collection.push(x.inst); sfx('cash'); learnInst(x.inst); toast('Added to your binder', 'good'); checkSets(); save(); draw(); });
      $$('[data-look]', body).forEach((b) => b.onclick = () => viewer(stock.singles[+b.dataset.look].inst, { hideInfo: true, tools: true }));
    }
    if (tab === 'sell') {
      const list = S.collection.filter((i) => !i.atApex);
      const till = tillCash();
      body.innerHTML = `<p style="color:var(--muted);font-size:13px;margin:0">Lou pays half of what a card is worth, and only out of what's in the till. <span class="mono" style="color:var(--lamp)">Till: ${money(till)}</span>. Big cards and slabs belong at the Saturday auction.</p>
        <div id="sbar"></div><div class="cardgrid" id="sgrid"></div>`;
      cardFilter('sell', { spares: spareUids(S.collection) }).mount($('#sbar', body), $('#sgrid', body), list, {
        render: (out) => out.map((inst) => { const v = Math.floor(cardValue(inst) * 0.5); return `<div class="cardcell" style="cursor:default"><button class="cardcell" data-look="${inst.uid}">${thumb(inst)}</button><span>${esc(cardTitle(inst))}</span><button class="btn small" data-sell="${inst.uid}" ${v < 1 || v > till ? 'disabled' : ''}>${v < 1 ? 'No offer' : v > till ? 'Too rich for the till' : 'Sell ' + money(v)}</button></div>`; }).join(''),
        wire: (g) => {
          $$('[data-sell]', g).forEach((b) => b.onclick = () => {
            if (b.dataset.armed) { const inst = S.collection.find((i) => i.uid === b.dataset.sell); const pay = Math.floor(cardValue(inst) * 0.5); if (pay > tillCash()) return; S.eve.paid = (S.eve.paid || 0) + pay; S.money += pay; S.collection.splice(S.collection.indexOf(inst), 1); sfx('cash'); toast('Sold', 'good'); save(); draw(); return; }
            b.dataset.armed = '1'; b.textContent = 'Tap again to sell'; b.classList.add('danger');
          });
          $$('[data-look]', g).forEach((b) => b.onclick = () => viewer(S.collection.find((i) => i.uid === b.dataset.look)));
        },
      });
    }
  };
  $$('[data-t]', root).forEach((b) => b.onclick = () => { tab = b.dataset.t; draw(); });
  draw();
}
const marketNowLabel = () => { const m = weekOf(S.day).market; return m > 1.2 ? ' Prices are wild this week.' : m < 0.9 ? ' Prices have collapsed.' : ''; };
const thumb = (inst) => (inst.slab ? slabHTML(inst, { grade: inst.slab.grade, by: inst.slab.by }) : cardSVG(inst));

// Lou rations packs (three a night, two in the boom) and only has so much cash in the till.
const packLimit = () => (weekOf(S.day).market >= 1.5 ? 2 : 3);
const packsLeft = () => packLimit() - ((S.eve && S.eve.packs) || 0);
const tillCash = () => { const base = Math.round(25 + 25 * weekOf(S.day).market); return Math.max(0, base - ((S.eve && S.eve.paid) || 0)); };


function rollPack(line) {
  const R = cityRng();
  const last = R();
  const slots = ['c', 'c', 'c', 'u', last < 0.045 ? 'm' : last < 0.32 ? 'r' : 'u'];
  return slots.map((r) => {
    const opts = CARDS[line].filter((c) => c.r === r);
    const c = R.pick(opts.length ? opts : CARDS[line]);
    const inst = makeInst(R, line, c.n, pickQuality(R, -0.25));
    rollVariants(R, inst, { scale: 0.7, shadowless: 0, noYellow: 0.02 });
    if (line === 'hp') inst.v.vintage = false; // shop stock is the 2003 reprint
    if (line === 'ic') inst.v.run1 = false; // Run 2 stock
    return inst;
  });
}

// ------------------------------------------------------------------ pack opening
// 1 common · 2 uncommon · 3 rare or holo · 4 chase version
function rank(inst) {
  const r = CARDS[inst.line].find((x) => x.n === inst.n).r;
  let k = r === 'm' ? 4 : r === 'r' ? 3 : r === 'u' ? 2 : 1;
  const v = inst.v;
  if (v.holo || v.gold) k = Math.max(k, 3);
  if (v.fullart || v.noYellow || v.first || v.shadowless || v.hidden || v.secret || v.alpha || v.serial || v.inverted || v.vintage || v.run1) k = 4;
  return k;
}
function rankLabel(inst) {
  const v = inst.v;
  if (v.fullart) return v.holo ? 'FULL ART HOLO!!' : 'FULL ART!';
  if (v.noYellow || v.inverted) return 'MISPRINT!';
  if (v.secret) return 'SECRET RARE!';
  if (v.first) return '1ST EDITION!';
  if (v.shadowless) return 'SHADOWLESS!';
  if (v.alpha) return 'ALPHA!';
  if (v.hidden) return 'PRINT RUN A!';
  if (v.serial) return 'SERIALIZED!';
  if (v.gold) return 'GOLD NAME!';
  const r = CARDS[inst.line].find((x) => x.n === inst.n).r;
  if (v.holo) return r === 'm' ? 'MYTHIC HOLO!' : r === 'r' ? 'HOLO RARE!' : 'HOLO!';
  return r === 'm' ? 'MYTHIC RARE!' : r === 'r' ? 'RARE!' : r === 'u' ? 'Uncommon' : 'Common';
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
    if (fast) { cards[0].defects.push({ id: 90, cat: 'surface', sev: 3, kind: 'crease', x: 125, y: 175, ang: 12, face: 'front' }); sfx('crunch'); toast('Too fast. You creased a card.', 'bad'); }
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
    if (k >= 4) achieve('pull_chase');
    setTimeout(() => {
      const b = $('#poBanner', ov);
      b.innerHTML = `<b>${esc(rankLabel(c))}</b><span>${esc(cardTitle(c))}${isNew ? ' <em>NEW</em>' : ''}</span>`;
      b.className = `po-banner show k${k}`;
      if (k === 1) sfx('common');
      if (k === 2) { sfx('uncommon'); particles(stage, 2); }
      if (k >= 3) {
        sfx('impact'); setTimeout(() => sfx('sparkle'), 120);
        if (c.v.holo) setTimeout(() => sfx('holo'), 250);
        if (CARDS[c.line].find((x) => x.n === c.n).r === 'm') { achieve('mythic'); if (c.v.fullart) learn('fullart'); if (c.v.fullart && c.v.holo) achieve('fullart_holo'); }
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
    hint.innerHTML = `Worth about <b>${money(total)}</b>. Best pull: ${esc(cardTitle(best))}${variantLabels(best.v, best.line).length ? ' (' + esc(variantLabels(best.v, best.line).join(', ')) + ')' : ''}.`;
    const btn = document.createElement('button');
    btn.className = 'btn primary po-done';
    btn.textContent = 'Add to binder';
    hint.after(btn);
    $$('[data-k]', stage).forEach((b) => b.onclick = () => viewer(cards[+b.dataset.k]));
    btn.onclick = () => {
      S.collection.push(...cards);
      cards.forEach(learnInst);
      checkSets();
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

// ------------------------------------------------------------------ night market
function showMarket() {
  setScene('market');
  let digs = 0, cards = [], picked = new Set();
  const root = locScreen('loc-market', marketSVG(), `${eveClock()} · THE NIGHT MARKET`, 'Under the tarp', '', sellerLine());
  const keep = () => {
    picked.forEach((k) => { S.collection.push(cards[k]); learnInst(cards[k]); if (rank(cards[k]) >= 4 && !cards[k].fake) achieve('bin_gem'); });
    if (picked.size) { toast(`${picked.size} added to your binder`, 'good'); checkSets(); }
    picked = new Set();
  };
  $('#leave').onclick = () => { keep(); save(); leaveTo(); };
  const dig = () => {
    const R = cityRng();
    const lines = unlockedLines();
    cards = []; picked = new Set();
    for (let k = 0; k < 10; k++) {
      const line = R.pick(lines);
      const c = pickCard(R, line, { c: 8, u: 3, r: 0.5 });
      const inst = makeInst(R, line, c.n, R() < 0.5 ? 'played' : 'beat');
      rollVariants(R, inst, { scale: 0.45, shadowless: 0.15, noYellow: 0.1 });
      if (R() < 0.08) makeFake(R, inst, DAYS[Math.min(S.day, LAST_DAY) - 1], [R.pick(['print', 'copyright', 'uv'])]);
      cards.push(inst);
    }
    digs++;
    draw();
  };
  const ghostNight = S.day === 24 && !S.flags.ghostFound && !S.collection.some((i) => i.v.ghost);
  const draw = () => {
    if (!cards.length) {
      root.innerHTML = `<p style="margin:0;color:var(--muted)">Cash ${money(S.money)}. Shoeboxes of loose cards, most of them soft at the corners. Somebody's childhood, sold by the pound.</p>
        ${ghostNight ? (S.clues >= 3 ? '<div class="paper letter"><div class="from">Under the table</div><p>A shoebox, taped shut, with MARSH written on the lid in marker. The seller sees you looking. "Not for the bins. That one\'s been waiting for somebody who knew to ask."</p><button class="btn primary" id="ghost">Ask for the Marsh box</button></div>' : '<p class="speech">There is an empty space under the table, and a strip of tape with MARSH on it. "Sold this morning," the seller says. "Some guy from Apex."</p>') : ''}
        <button class="btn primary" data-dig ${S.money < 3 ? 'disabled' : ''}>Dig through a box ($3)</button>`;
      $('[data-dig]', root).onclick = () => { S.money -= 3; dig(); };
      const g = $('#ghost', root);
      if (g) g.onclick = () => {
        const inst = blankInst('bl', 9); inst.v.ghost = true; inst.dx = 0.3; inst.dy = -0.2;
        S.collection.push(inst); S.flags.ghostFound = true; learn('ghost'); achieve('ghost');
        sfx('riser'); setTimeout(() => { sfx('impact'); sfx('fanfare'); }, 1000);
        viewer(inst, { title: 'The Ghost Print' });
        save(); draw();
      };
      return;
    }
    root.innerHTML = `<p style="margin:0">Tap a card to look closer. Kept ${picked.size}/2.</p>
      <div class="cardgrid">${cards.map((c, k) => `<button class="cardcell ${picked.has(k) ? 'picked' : ''}" data-k="${k}">${cardSVG(c)}</button>`).join('')}</div>
      <div class="row"><button class="btn primary" data-keep ${picked.size ? '' : 'disabled'}>Take ${picked.size || ''} and stop digging</button>${digs < 2 ? `<button class="btn" data-again ${S.money < 3 ? 'disabled' : ''}>Take them and dig again ($3)</button>` : ''}</div>`;
    $$('[data-k]', root).forEach((b) => b.onclick = () => {
      const k = +b.dataset.k;
      viewer(cards[k], { hideInfo: true, tools: true, action: { label: picked.has(k) ? 'Put it back' : 'Keep this one', disabled: !picked.has(k) && picked.size >= 2, run: () => { picked.has(k) ? picked.delete(k) : picked.add(k); draw(); } } });
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
  const wage = weekOf(S.day).market < 0.9 ? 25 : 30;
  const trade = isThursday(S.day) && !S.weekend;
  root.innerHTML = `${trade ? `<div class="paper letter"><div class="from">Thursday · trade night</div><p>The collectors have the back booth again: binders out, coffee going cold. Sal lets them stay as long as somebody orders pie.</p></div>` : ''}
    <p style="margin:0;color:var(--muted)">Four hours. ${money(wage)} cash, plus whatever the regulars leave on the counter. People talk around a waiter like he isn't there.</p>
    <div class="row">${trade ? '<button class="btn primary" id="trade">Join the trade booth</button>' : ''}<button class="btn ${trade ? '' : 'primary'}" id="work">Put on the apron</button></div>`;
  if (trade) $('#trade').onclick = () => { worked = true; setScene('diner'); showTradeNight(root, () => {}); };
  $('#work').onclick = () => {
    root.innerHTML = `<div class="shiftbar"><div class="fill"></div></div><p class="mono" id="orders" style="margin:0;color:var(--muted)">Coffee for table six…</p>`;
    const msgs = ['Coffee for table six…', 'Two eggs, burnt on purpose…', 'Mopping up after a fight about a parking spot…', 'Refilling the ketchup nobody asked for…', 'Last orders…'];
    let k = 0;
    const iv = setInterval(() => { k++; const o = $('#orders'); if (o) o.textContent = msgs[Math.min(k, msgs.length - 1)]; }, 420);
    setTimeout(() => {
      clearInterval(iv);
      worked = true;
      const tips = Math.floor(Math.random() * 11);
      S.money += wage + tips;
      sfx('cash');
      save();
      root.innerHTML = `<div class="paper letter"><div class="from">Overheard while pouring coffee</div><p>${esc(rumor(S.day, S.flags))}</p></div>
        <p style="margin:0">Sal counts out <b>${money(wage)}</b> and pushes the tip jar across: <b>${money(tips)}</b>. Cash ${money(S.money)}.</p>
        <button class="btn primary" id="out">Hang up the apron</button>`;
      $('#out').onclick = () => leaveTo('Waiting for the last bus home…');
    }, 2200);
  };
}

// ------------------------------------------------------------------ Thursday trade night
// Collectors take over the back booth at the Last Stop on Thursdays. Each one trades once a
// night, for your spare copies (duplicates; you always keep your best copy of each card).
const isThursday = (d) => d % 5 === 4;
const TRADERS = {
  kid: { name: 'Mikey', who: 'a kid in a hockey jacket, two sizes too big', rule: 'holo', ratio: 0.8, say: 'Only shiny ones. My sister says the shiny ones are worth more. She\'s right about everything.', rulesLine: 'Only takes holos. Generous.' },
  grump: { name: 'Mrs. Abernathy', who: 'retired, bifocals on a chain, a binder older than you', rule: 'mint', ratio: 1, say: 'I don\'t take beaters. Corners or nothing, dear.', rulesLine: 'Only takes clean cards (8 or better) and slabs. Fair.' },
  shark: { name: 'Rook', who: 'gold tooth, calculator watch, a briefcase of toploaders', rule: 'any', ratio: null, say: 'Everything\'s for trade. Everything\'s got a price. Mine\'s higher.', rulesLine: 'Takes anything, at a markup. Better terms if your reputation is good.' },
  blind: { name: 'The Stranger', who: 'hat low, never orders, never takes his coat off', rule: 'blind', say: 'Two of yours, face down, for one of mine, face down. No looking. No refunds.', rulesLine: 'Any two spares for one mystery card. Anything could be in there.' },
};
const traderRatio = (t) => (t.id === 'shark' ? 1.6 - 0.6 * (S.rep / 100) : TRADERS[t.id].ratio);

// Every copy except your best one of each card.
function spareCards() {
  const groups = {};
  S.collection.filter((i) => !i.atApex).forEach((i) => { (groups[i.line + ':' + i.n] ||= []).push(i); });
  return Object.values(groups).flatMap((g) => g.sort((a, b) => cardValue(b) - cardValue(a)).slice(1));
}
const acceptsCard = (t, i) => (t.id === 'kid' ? !!i.v.holo : t.id === 'grump' ? !!i.slab || trueGrade(i) >= 8 : true);

function tradeNight() {
  if (!S.eve || S.eve.day !== S.day) S.eve = { day: S.day };
  if (S.eve.trade) return S.eve.trade;
  const R = cityRng();
  const ids = Object.keys(TRADERS);
  ids.splice(R.int(0, ids.length - 1), 1); // three of the four turn up
  const owned = new Set(S.collection.map((i) => i.line + ':' + i.n));
  const lines = unlockedLines();
  const offer = (quality, scale) => {
    let line = R.pick(lines), c = pickCard(R, line, { c: 3, u: 3, r: 1.5 });
    for (let k = 0; k < 6 && owned.has(line + ':' + c.n); k++) { line = R.pick(lines); c = pickCard(R, line, { c: 3, u: 3, r: 1.5 }); }
    const inst = makeInst(R, line, c.n, quality);
    rollVariants(R, inst, { scale });
    return inst;
  };
  S.eve.trade = ids.map((id) => ({
    id, done: false,
    offers: id === 'blind' ? [] : [0, 1, 2].map(() => offer(id === 'grump' ? 'gem' : 'nice', id === 'shark' ? 1.4 : id === 'kid' ? 1.6 : 0.8)),
  }));
  return S.eve.trade;
}

function showTradeNight(root, onTrade) {
  const night = tradeNight();
  const draw = () => {
    root.innerHTML = `<p style="margin:0;color:var(--muted)">The back booth smells like coffee and plastic sleeves. Each collector trades once a night, and only takes your spares: you always keep your best copy of a card. ${spareCards().length} spare ${spareCards().length === 1 ? 'card' : 'cards'} in your binder.</p>
      ${night.map((t, k) => {
        const T = TRADERS[t.id];
        const ratio = t.id === 'blind' ? 0 : traderRatio(t);
        return `<div class="trader ${t.done ? 'done' : ''}">
          <div class="trader-head"><b>${esc(T.name)}</b><small>${esc(T.who)}</small></div>
          <p class="speech" style="margin:0">"${esc(T.say)}"</p>
          <p class="mono trader-rule">${esc(T.rulesLine)}${t.id === 'shark' ? ` Wants ${Math.round(ratio * 100)}% of value tonight.` : ''}</p>
          ${t.done ? '<p style="margin:0;color:var(--muted)">Done trading for tonight.</p>'
            : t.id === 'blind' ? `<button class="btn" data-blind="${k}">Slide two spares across</button>`
            : `<div class="cardgrid">${t.offers.map((o, j) => `<button class="cardcell" data-t="${k}" data-o="${j}">${cardSVG(o)}<span>${esc(cardTitle(o))}</span><span class="price">${esc(variantLabels(o.v, o.line).join(', ') || LINES[o.line].name)}</span><span class="mono" style="color:var(--lamp)">wants ~${money(Math.max(1, cardValue(o) * ratio))}</span></button>`).join('')}</div>`}
        </div>`;
      }).join('')}
      <button class="btn primary" id="out">Leave the booth</button>`;
    $('#out').onclick = () => leaveTo('Waiting for the last bus home…');
    $$('[data-o]', root).forEach((b) => b.onclick = () => pickOffer(night[+b.dataset.t], +b.dataset.o));
    $$('[data-blind]', root).forEach((b) => b.onclick = () => blindTrade(night[+b.dataset.blind]));
  };

  // Choose spares until they cover what the trader wants for one of their cards.
  function pickOffer(t, j) {
    const T = TRADERS[t.id], want = Math.max(1, cardValue(t.offers[j]) * traderRatio(t));
    const list = spareCards().filter((i) => acceptsCard(t, i)).sort((a, b) => cardValue(b) - cardValue(a));
    const picked = new Set();
    const m = modal(`<h2>${esc(T.name)}: ${esc(cardTitle(t.offers[j]))}</h2>
      <div style="display:flex;gap:12px;align-items:center"><div style="width:96px;flex:0 0 auto">${cardSVG(t.offers[j])}</div><p style="margin:0">${esc(T.name)} wants about <b>${money(want)}</b> in spares for this. <span id="tot" class="mono"></span></p></div>
      ${list.length ? '<div id="tbar"></div><div class="cardgrid" id="tgrid"></div>' : `<p>You have no spares ${esc(T.name)} will take.</p>`}
      <div class="row"><button class="btn primary" id="deal" disabled>Offer the trade</button><button class="btn" data-close>Never mind</button></div>`, { wide: true });
    const total = () => [...picked].reduce((s, u) => s + cardValue(S.collection.find((i) => i.uid === u)), 0);
    const upd = () => { const tv = total(); $('#tot', m).textContent = `Offering ${money(tv)}.`; $('#deal', m).disabled = !picked.size || tv < want; };
    upd();
    if (list.length) cardFilter('trade', { sort: 'cheap' }).mount($('#tbar', m), $('#tgrid', m), list, {
      render: (out) => out.map((i) => `<button class="cardcell ${picked.has(i.uid) ? 'picked' : ''}" data-u="${i.uid}">${thumb(i)}<span>${esc(cardTitle(i))}</span><span class="price">${money(cardValue(i))}</span></button>`).join(''),
      wire: (g) => $$('[data-u]', g).forEach((b) => b.onclick = () => { const u = b.dataset.u; if (picked.has(u)) picked.delete(u); else picked.add(u); b.classList.toggle('picked', picked.has(u)); upd(); }),
    });
    $('[data-close]', m).onclick = () => m.close();
    $('#deal', m).onclick = () => {
      const give = [...picked].map((u) => S.collection.find((i) => i.uid === u));
      m.close();
      const fake = give.find((i) => i.fake);
      if (fake) {
        // Collectors check what they're handed. A fake gets slid back, and it goes in your Fake Binder.
        S.collection.splice(S.collection.indexOf(fake), 1);
        S.fakes.push(JSON.parse(JSON.stringify(fake)));
        t.done = true; save(); draw();
        runEvents([{ from: T.name, body: [`${T.name} turns ${cardTitle(fake)} over twice, holds it to the light and slides it back across the table.`, '"That one\'s a fake. You of all people should know." The deal is off for tonight. You put the card in your Fake Binder.'] }], () => {});
        return;
      }
      give.forEach((i) => S.collection.splice(S.collection.indexOf(i), 1));
      const got = t.offers.splice(j, 1)[0];
      S.collection.push(got);
      t.done = true;
      learnInst(got); sfx('cash'); onTrade(); checkSets(); save();
      toast(`Traded ${give.length} ${give.length === 1 ? 'card' : 'cards'} for ${cardTitle(got)}`, 'good');
      draw();
    };
  }

  // The Stranger: two spares for one card you can't see until it's yours. It may be a fake.
  function blindTrade(t) {
    const list = spareCards().sort((a, b) => cardValue(a) - cardValue(b));
    const picked = new Set();
    const m = modal(`<h2>The Stranger</h2><p style="margin:0">Pick two spares to slide across the table.</p>
      ${list.length >= 2 ? '<div id="tbar"></div><div class="cardgrid" id="tgrid"></div>' : '<p>You need at least two spare cards.</p>'}
      <div class="row"><button class="btn primary" id="deal" disabled>Slide them over</button><button class="btn" data-close>Never mind</button></div>`, { wide: true });
    if (list.length >= 2) cardFilter('blind', { sort: 'cheap' }).mount($('#tbar', m), $('#tgrid', m), list, {
      render: (out) => out.map((i) => `<button class="cardcell ${picked.has(i.uid) ? 'picked' : ''}" data-u="${i.uid}">${thumb(i)}<span>${esc(cardTitle(i))}</span><span class="price">${money(cardValue(i))}</span></button>`).join(''),
      wire: (g) => $$('[data-u]', g).forEach((b) => b.onclick = () => { const u = b.dataset.u; if (picked.has(u)) picked.delete(u); else if (picked.size < 2) picked.add(u); $$('[data-u]', m).forEach((x) => x.classList.toggle('picked', picked.has(x.dataset.u))); $('#deal', m).disabled = picked.size !== 2; }),
    });
    $('[data-close]', m).onclick = () => m.close();
    $('#deal', m).onclick = () => {
      [...picked].forEach((u) => { const i = S.collection.find((x) => x.uid === u); S.collection.splice(S.collection.indexOf(i), 1); });
      m.close();
      const R = cityRng(), line = R.pick(unlockedLines());
      const got = makeInst(R, line, pickCard(R, line, { c: 2, u: 3, r: 2.5 }).n, pickQuality(R, -0.1));
      rollVariants(R, got, { scale: 2.2 });
      if (R() < 0.18) makeFake(R, got, null, [R.pick(['print', 'copyright', 'uv', 'back'])]);
      S.collection.push(got);
      t.done = true; onTrade(); sfx('holo'); save();
      const r = modal(`<h2>Face down, then face up</h2><div style="width:min(220px,60vw);margin:0 auto">${cardSVG(got)}</div>
        <p style="margin:0;text-align:center">${esc(cardTitle(got))}${variantLabels(got.v, got.line).length ? ' · ' + esc(variantLabels(got.v, got.line).join(', ')) : ''}</p>
        <p style="margin:0;color:var(--muted);text-align:center">The Stranger is already gone. Check it with your tools at home.</p><button class="btn primary" data-close>Into the binder</button>`);
      $('[data-close]', r).onclick = () => { r.close(); checkSets(); draw(); };
    };
  }
  draw();
}

function showHome() {
  setScene('home');
  const root = locScreen('loc-home', homeSVG(S.flags, S.day), `${eveClock()} · APARTMENT 3F`, 'Home', '', theoLine(S.flags, S.day), 'Head back out');
  $('#leave').onclick = () => { if (!S.actions) { toast('Everything is closed.'); return; } leaveTo('Back down the stairs…'); };
  const next = S.weekend ? 'Monday' : dayName(S.day + 1);
  root.innerHTML = `${meterHTML()}<div class="places compact">
      <button class="place" id="binder"><b>Your binder</b><small>${S.collection.length} cards · ${S.fakes.length} fakes · worth about ${money(collectionValue())}</small><span class="cost">free</span></button>
      <button class="place" id="codex"><b>Codex</b><small>${Object.keys(S.codex).length} tells and versions learned</small><span class="cost">free</span></button>
      <button class="place" id="sleep"><b>Go to sleep</b><small>Tomorrow is ${next}.${S.actions ? ` You still have time for ${S.actions} more ${S.actions === 1 ? 'stop' : 'stops'}.` : ''}</small><span class="cost">end the day</span></button>
    </div>
    <div class="row"><button class="btn small" id="ach">Achievements</button><button class="btn small" id="set">Settings</button></div>`;
  if (!S.actions) $('#leave').disabled = true;
  $('#binder').onclick = openBinder;
  $('#codex').onclick = showCodex;
  $('#ach').onclick = showAchievements;
  $('#set').onclick = showSettings;
  $('#sleep').onclick = () => travel(S.weekend ? 'Sunday passes. The rain doesn\'t.' : 'Lights out. The rain doesn\'t stop.', () => {
    S.day++; S.weekend = false; S.phase = 'morning'; S.eve = null; save(); showMorning();
  }, 1400);
}

// Big card viewer with flip. In the city you only see the card, not its labels.
function viewer(inst, o = {}) {
  let face = 'front', mode = '';
  const m = modal(`<div class="viewer"><div class="big" id="vbig"></div><div class="info" id="vinfo"></div></div>
    ${o.tools ? '<div class="row" id="vtools"><button class="btn small" data-m="">Plain</button><button class="btn small" data-m="micro">Loupe</button><button class="btn small" data-m="uv">Pocket UV</button></div>' : ''}
    <div class="row">${o.action ? `<button class="btn primary" data-act ${o.action.disabled ? 'disabled' : ''}>${esc(o.action.label)}</button>` : ''}<button class="btn" data-close>Close</button></div>`);
  const draw = () => {
    const big = $('#vbig', m);
    big.classList.toggle('zoom', mode === 'micro');
    big.innerHTML = inst.slab && !mode ? slabHTML(inst, { grade: inst.slab.grade, by: inst.slab.by }) : cardSVG(inst, { face, micro: mode === 'micro', uv: mode === 'uv' });
    const vl = variantLabels(inst.v, inst.line);
    $('#vinfo', m).innerHTML = `<b style="font-family:var(--f-display);font-size:20px">${esc(o.title || cardTitle(inst))}</b>
      <span class="mono">${esc(LINES[inst.line].name)} · ${pad3(inst.n)}/${pad3(LINES[inst.line].total)} · ${rarityName(inst)}</span>
      ${o.hideInfo ? '<span style="color:var(--muted)">Tap the card to flip it. You\'ll have to judge it yourself.</span>' : `
        <div class="chips">${vl.map((x) => `<span class="chipv">${esc(x)}</span>`).join('')}${inst.fake ? '<span class="chipv" style="color:#ff8a7a">Counterfeit</span>' : ''}${inst.slab ? `<span class="chipv">${inst.slab.by === 'apex' ? 'Apex' : 'Gemline'} ${fmtG(inst.slab.grade)}</span>` : ''}</div>
        ${inst.fake ? `<span>${esc(inst.fake.kinds.map((k) => CODEX[k] ? CODEX[k].name : k).join(', '))}</span>` : `<span>Your estimate: about a ${fmtG(trueGrade(inst))}</span>`}
        <span>Worth about ${money(cardValue(inst))}${inst.slab ? ' slabbed' : ' raw'}</span>`}`;
    if ($('#vtools', m)) $$('[data-m]', m).forEach((b) => b.setAttribute('aria-pressed', b.dataset.m === mode ? 'true' : 'false'));
  };
  $('#vbig', m).onclick = () => { if (inst.slab && !mode) return; face = face === 'front' ? 'back' : 'front'; sfx('flip'); draw(); };
  $$('[data-m]', m).forEach((b) => b.onclick = () => { mode = b.dataset.m; draw(); });
  $('[data-close]', m).onclick = () => m.close();
  if (o.action) $('[data-act]', m).onclick = () => { m.close(); o.action.run(); };
  draw();
}

// Set completion: owning every card of a line pays a reward once.
function checkSets() {
  unlockedLines().forEach((l) => {
    if (S.sets[l]) return;
    const have = new Set(S.collection.filter((i) => i.line === l && !i.fake).map((i) => i.n));
    if (have.size < LINES[l].total) return;
    S.sets[l] = true;
    const reward = 20 * LINES[l].total;
    S.money += reward;
    meters({ rep: 5 });
    achieve('set');
    setTimeout(() => runEvents([{ from: 'Lou, by phone', body: [`"Heard you finished a full ${LINES[l].name} set. Do you know how many people in this city can say that? Four. Now five."`, `A collector pays you ${money(reward)} just to photograph the page.`] }], () => { if (S.phase === 'evening') showCity(); }), 400);
  });
}

function openBinder() {
  let tab = unlockedLines()[0];
  const tabs = [...unlockedLines(), 'fakes'];
  const m = modal(`<div class="row" style="justify-content:space-between;align-items:center"><h2>Your binder</h2><button class="btn small" data-close>Close</button></div>
    <p style="margin:0;color:var(--muted)" id="btotal"></p>
    <div class="shop-tabs scrolltabs">${tabs.map((l) => `<button data-t="${l}">${l === 'fakes' ? 'Fake Binder' : LINES[l].name}${S.sets[l] ? ' ★' : ''}</button>`).join('')}</div>
    <div id="bb"></div>`, { wide: true });
  $('[data-close]', m).onclick = () => m.close();
  const draw = () => {
    $('#btotal', m).textContent = `${S.collection.length} cards · worth about ${money(collectionValue())}`;
    $$('[data-t]', m).forEach((b) => b.setAttribute('aria-selected', b.dataset.t === tab ? 'true' : 'false'));
    if (tab === 'fakes') {
      $('#bb', m).innerHTML = `<p style="margin:0;color:var(--muted)">Counterfeits you've confiscated. Ring forgeries are evidence${weekOf(S.day).market < 0.9 ? ', and since the crash, collectors pay for them' : ''}.</p>
        <div class="cardgrid">${S.fakes.map((f, k) => `<button class="cardcell" data-f="${k}">${cardSVG(f)}<span>${esc(f.fake.kinds.map((x) => CODEX[x] ? CODEX[x].name : x).join(', '))}</span></button>`).join('') || '<p>No fakes yet. Catch some.</p>'}</div>`;
      $$('[data-f]', m).forEach((b) => b.onclick = () => viewer(S.fakes[+b.dataset.f]));
      return;
    }
    const owned = CARDS[tab].map((c) => {
      const copies = S.collection.filter((i) => i.line === tab && i.n === c.n).sort((a, b) => cardValue(b) - cardValue(a));
      return { c, copies };
    });
    const have = owned.filter((o) => o.copies.length).length;
    $('#bb', m).innerHTML = `<p class="mono" style="margin:0;font-size:12px;color:var(--muted)">${have}/${CARDS[tab].length} in the set${S.sets[tab] ? ' · COMPLETE' : ` · complete it for ${money(20 * LINES[tab].total)}`}</p>
      <div class="cardgrid">${owned.map((o) => o.copies.length
        ? `<button class="cardcell" data-n="${o.c.n}">${thumb(o.copies[0])}${o.copies.length > 1 ? `<span class="badge">×${o.copies.length}</span>` : ''}<span>${pad3(o.c.n)} ${esc(o.c.name)}</span></button>`
        : `<div class="cardcell empty"><div class="slot">${pad3(o.c.n)}</div><span>${esc(o.c.name)}</span></div>`).join('')}</div>`;
    $$('[data-n]', m).forEach((b) => b.onclick = () => {
      const copies = S.collection.filter((i) => i.line === tab && i.n === +b.dataset.n).sort((a, c) => cardValue(c) - cardValue(a));
      if (copies.length === 1) return viewer(copies[0]);
      const mm = modal(`<h2>${esc(cardTitle(copies[0]))}</h2><div class="cardgrid">${copies.map((c, k) => `<button class="cardcell" data-k="${k}">${thumb(c)}<span class="price">${money(cardValue(c))}</span><span>${esc(variantLabels(c.v, c.line).join(', ') || 'Regular')}</span></button>`).join('')}</div><button class="btn" data-close>Close</button>`, { wide: true });
      $('[data-close]', mm).onclick = () => mm.close();
      $$('[data-k]', mm).forEach((x) => x.onclick = () => viewer(copies[+x.dataset.k]));
    });
  };
  $$('[data-t]', m).forEach((b) => b.onclick = () => { tab = b.dataset.t; draw(); });
  draw();
}

// ------------------------------------------------------------------ endings
function finale() {
  const f = S.flags;
  achieve('survivor');
  let kind = null;
  if (f.whistle === 'yes') kind = 'whistle';
  else if (f.kingpinOffer === 'yes') kind = 'kingpin';
  if (kind) return endScreen(kind);
  const choices = pickEndingChoices(S, f, collectionValue());
  const m = modal(`${letterHTML({ from: 'Friday, 6:00 p.m.', body: ['The quarter is over. The Board has finished its audit. Pike\'s door is closed.', 'For the first time in five weeks, nobody is telling you what to do next.'] })}
    <div class="col">${choices.map((c) => `<button class="btn ${c.id === 'standing' ? '' : 'primary'}" data-e="${c.id}">${esc(c.label)}</button>`).join('')}</div>`, { dismiss: false });
  $$('[data-e]', m).forEach((b) => b.onclick = () => { m.close(); endScreen(b.dataset.e); });
}

function endScreen(kind) {
  setScene('end');
  closeAllModals();
  const E = ENDINGS[kind];
  if (E.ach) achieve(E.ach);
  S.phase = 'end';
  save();
  const acc = S.stats.graded ? Math.round((S.stats.correct / S.stats.graded) * 100) : 0;
  const best = [...S.collection].sort((a, b) => cardValue(b) - cardValue(a))[0];
  app.innerHTML = `<div class="screen end scroll">
    <div class="kicker">${kind === 'fired' || kind === 'evicted' || kind === 'arrested' ? `Week ${Math.ceil(S.day / 5)}, ${dayName(S.day)}` : 'The end of the quarter'}</div>
    <h1>${esc(E.title)}</h1>
    <div style="max-width:56ch;display:flex;flex-direction:column;gap:10px;color:var(--muted)">${E.text.map((p) => `<p style="margin:0">${esc(p)}</p>`).join('')}</div>
    <div class="paper ledger"><table>
      <tr><td>Days worked</td><td class="amt">${S.day}</td></tr>
      <tr><td>Cards graded</td><td class="amt">${S.stats.graded}</td></tr>
      <tr><td>Correct calls</td><td class="amt">${acc}%</td></tr>
      <tr><td>Counterfeits caught</td><td class="amt">${S.stats.fakesCaught || 0}</td></tr>
      <tr><td>Reputation · Suspicion</td><td class="amt">${Math.round(S.rep)} · ${Math.round(S.sus)}</td></tr>
      <tr><td>Cash</td><td class="amt">${money(S.money)}</td></tr>
      <tr><td>Binder</td><td class="amt">${S.collection.length} cards · ${money(collectionValue())}</td></tr>
      <tr><td>Best card</td><td class="amt">${best ? esc(cardTitle(best)) + (variantLabels(best.v, best.line).length ? ' (' + esc(variantLabels(best.v, best.line).join(', ')) + ')' : '') : 'none'}</td></tr>
      <tr><td>Ghost Print clues</td><td class="amt">${S.clues || 0} of 4${S.flags.ghostFound ? ' · FOUND' : ''}</td></tr>
      <tr><td>Codex</td><td class="amt">${Object.keys(S.codex).length} of ${Object.keys(CODEX).length}</td></tr>
    </table></div>
    <div class="row"><button class="btn" id="ach">Achievements</button><button class="btn primary" id="again">Start over</button></div>
  </div>`;
  $('#ach').onclick = showAchievements;
  $('#again').onclick = () => { clearSave(); showTitle(); };
}

function gameOver(kind) { endScreen(kind); }

// ------------------------------------------------------------------ boot
initCollect({ S: () => S, save, toast, sfx, setScene, modal, viewer, locScreen, leaveTo, eveClock, money, esc, dayName, achieve, checkSets });

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
