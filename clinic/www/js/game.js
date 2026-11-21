// Pixel Pet Clinic: the week-one demo. Screens, state, saving and the day loop.
import { FB, clamp, rng, hash } from './util.js';
import { THEMES, themeAt } from './themes.js';
import { SPECIES, AILMENTS, TREATS, SUPPLIES, TESTS, PET_NAMES, OWNER_NAMES, COMPLAINTS, WEEK, RENT, OPEN, CLOSE } from './data.js';
import { EW, EH, OX, TOP, renderExam, signAt, bodyAt, bodyPoints } from './exam.js';
import { DW, DH, renderDiorama, prewarm } from './diorama.js';
import { HW, HH, SEATS, renderHall, seatWorldX } from './hall.js';
import { TW, TH, renderTurntable } from './turntable.js';
import { makeMinigame } from './minigames.js';
import { sfx, unlock, buzz, toggleMute, isMuted } from './audio.js';
import { VERSION } from './version.js';

const $ = (s) => document.querySelector(s);
const view = $('#view'), vctx = view.getContext('2d');
const panel = $('#panel'), hud = $('#hud'), modal = $('#modal'), modalCard = $('#modal-card');
const SAVE_KEY = 'ppc-save-v1';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (m) => { const h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'PM' : 'AM', hh = ((h + 11) % 12) + 1; return `${hh}:${String(mm).padStart(2, '0')} ${ap}`; };
const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n));
const spName = (sp) => SPECIES[sp].name;

let S = null;          // the saved game
let scr = null;        // the current screen
let clock = 0;

/* ================================================================== state */
function newGame() {
  const supplies = {}; for (const [k, v] of Object.entries(SUPPLIES)) supplies[k] = v.start;
  S = {
    v: 1, seed: (Math.random() * 1e9) | 0, day: 0, minute: OPEN, phase: 'morning', money: 50, rep: 50, integrity: 0,
    supplies, queue: [], pending: [], kennel: [], casebook: {}, seen: {}, polaroids: [], mail: [], flags: {},
    stats: { cured: 0, wrong: 0, botched: 0, left: 0, earned: 0, spent: 0, lost: 0 }, returns: [], nextId: 1, usedNames: WEEK.flatMap((d) => d.fixed.map((f) => f.pet)),
    today: null, notes: [],
  };
  startDay();
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage may be full or blocked */ } }
function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return s && s.v === 1 ? s : null; } catch (e) { return null; } }
function addMoney(n, why) { S.money += n; if (n > 0) { S.stats.earned += n; S.today.earned += n; } else { S.stats.spent -= n; S.today.spent -= n; } }
function addRep(n) { const before = S.rep; S.rep = clamp(S.rep + n, 0, 100); S.today.rep += S.rep - before; }

function pickName(sp, r) {
  const pool = PET_NAMES[sp].filter((n) => !S.usedNames.includes(n));
  const n = (pool.length ? pool : PET_NAMES[sp])[Math.floor(r() * (pool.length || PET_NAMES[sp].length))];
  S.usedNames.push(n); return n;
}
function startDay() {
  const d = WEEK[S.day], r = rng(S.seed + S.day * 101);
  S.minute = OPEN; S.phase = 'morning'; S.queue = []; S.pending = []; S.notes = [];
  S.today = { earned: 0, spent: 0, rep: 0, cured: 0, wrong: 0, left: 0, seen: 0, lost: 0 };
  // overnight kennel patients
  const keep = [];
  for (const k of S.kennel) {
    if (k.tobi && k.correct) { keep.push(k); S.notes.push(k.caredLast ? `${k.pet} spent a warm night in the incubator.` : `${k.pet} had a cold night. Remember to care for the kennels each evening.`); k.caredLast = false; continue; }
    if (k.correct) { S.notes.push(`${k.owner} collected ${k.pet}, warm and well.`); }
    else { S.notes.push(`${k.owner} collected ${k.pet}. A night in the incubator didn't help. (It was ${AILMENTS[k.ail].name.toLowerCase()}.)`); }
  }
  S.kennel = keep;
  // mail
  for (const m of d.mail) if (!m.needs || S.flags[m.needs]) S.mail.push({ ...m, day: S.day, read: false });
  if (S.day === 4 && S.flags.vanceReported) { S.mail.push({ from: 'Animal Control', subject: 'Thank you', day: S.day, read: false, body: 'Thanks to your report we recovered eleven smuggled Mothhounds from a warehouse on Pier Street. Please find a reward of $80 enclosed.\n\nDuchess is doing well.' }); addMoney(80); }
  // today's patients
  const list = d.fixed.map((f) => ({ ...f }));
  let randomN = d.random;
  if (S.day >= 2 && S.rep < 60 && randomN > 0) { randomN--; S.today.lost++; S.stats.lost++; S.notes.push('PetCorp Wellness is open across the street. With your reputation under 60, one booked patient went there instead.'); }
  const slots = [];
  for (let i = 0; i < randomN; i++) slots.push(Math.round(570 + (i + 0.3 + r() * 0.5) * (360 / Math.max(1, randomN))));
  for (let i = 0; i < randomN; i++) {
    const ail = d.pool[Math.floor(r() * d.pool.length)], sp = AILMENTS[ail].sp, says = COMPLAINTS[ail];
    const owner = OWNER_NAMES[Math.floor(r() * OWNER_NAMES.length)];
    list.push({ id: 'r' + S.day + '_' + i, arrive: slots[i], sp, ail, pet: pickName(sp, r), owner, say: says[Math.floor(r() * says.length)], obj: ail === 'swallowed' ? ['sock', 'keys', 'spoon'][Math.floor(r() * 3)] : undefined });
  }
  for (const ret of S.returns) list.push({ ...ret, arrive: 580 + Math.floor(r() * 60), returning: true, say: `${ret.pet} is worse than before. Whatever you did yesterday didn't work.` });
  S.returns = [];
  for (const p of list) { p.uid = S.nextId++; if (p.obj == null && p.ail === 'swallowed') p.obj = 'sock'; }
  list.sort((a, b) => a.arrive - b.arrive);
  S.pending = list;
  save();
}
function arrivals(quiet) {
  const came = [];
  while (S.pending.length && S.pending[0].arrive <= S.minute && S.minute < CLOSE) {
    const p = S.pending.shift(); p.waitFrom = p.arrive;
    const used = new Set(S.queue.map((q) => q.seat)); let seat = 0; while (used.has(seat) && seat < SEATS - 1) seat++;
    p.seat = seat; S.queue.push(p); came.push(p);
  }
  if (came.length && !quiet) { sfx('bell'); toast(came.map((p) => `${p.owner} arrived with ${p.pet}`).join('. ')); }
}
function advance(min) {
  S.minute += min;
  arrivals();
  const gone = S.queue.filter((p) => S.minute - p.waitFrom > 150);
  for (const p of gone) { S.queue = S.queue.filter((q) => q !== p); addRep(-4); S.stats.left++; S.today.left++; toast(`${p.owner} got tired of waiting and left with ${p.pet}.`); }
}

/* ================================================================== screens & loop */
function setScreen(s) {
  scr = s; s.last = -1;
  view.width = s.w; view.height = s.h;
  s.fb = s.canvas ? null : new FB(s.w, s.h);
  view.dataset.screen = s.kind;
  renderHud(); renderPanel();
}
function renderHud() {
  if (!S) { hud.innerHTML = `<span class="brand">PIXEL PET CLINIC</span><span class="sp"></span><button class="mute" data-act="mute" aria-label="Sound">${isMuted() ? 'SOUND OFF' : 'SOUND ON'}</button>`; return; }
  const d = WEEK[Math.min(S.day, 4)];
  hud.innerHTML = `<span class="day">${d.short}</span><span class="clock">${S.phase === 'open' ? fmt(S.minute) : S.phase === 'morning' ? 'MORNING' : 'EVENING'}</span><span class="cash">${money(S.money)}</span><span class="rep" title="Reputation">REP ${Math.round(S.rep)}</span><span class="sp"></span><button class="mute" data-act="mute" aria-label="Sound">${isMuted() ? 'SND OFF' : 'SND ON'}</button>`;
}
function renderPanel() { panel.innerHTML = scr && scr.panel ? scr.panel() : ''; panel.scrollTop = 0; }
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now; clock += dt;
  if (scr) {
    if (scr.update) scr.update(dt);
    if (clock - scr.last >= 1 / scr.fps - 0.004) {
      scr.last = clock;
      try {
        if (scr.canvas) scr.draw(vctx, clock); else { scr.draw(scr.fb, clock); vctx.putImageData(scr.fb.img, 0, 0); }
      } catch (err) { console.error(err); }
    }
  }
  requestAnimationFrame(loop);
}

/* ---------- pointer input on the view ---------- */
let ptr = null;
const toView = (e) => { const r = view.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * view.width, (e.clientY - r.top) / r.height * view.height]; };
view.addEventListener('pointerdown', (e) => { unlock(); const [x, y] = toView(e); ptr = { x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false, lx: x, ly: y }; try { view.setPointerCapture(e.pointerId); } catch (_) {} scr && scr.pointer && scr.pointer('down', x, y, ptr); });
view.addEventListener('pointermove', (e) => { const [x, y] = toView(e); if (ptr && Math.hypot(e.clientX - ptr.x0, e.clientY - ptr.y0) > 6) ptr.moved = true; scr && scr.pointer && scr.pointer('move', x, y, ptr, e); if (ptr) { ptr.lx = x; ptr.ly = y; } });
const up = (e) => { const [x, y] = toView(e); if (ptr && scr && scr.pointer) { scr.pointer('up', x, y, ptr); if (!ptr.moved && performance.now() - ptr.t0 < 500) scr.pointer('tap', x, y, ptr); } ptr = null; };
view.addEventListener('pointerup', up); view.addEventListener('pointercancel', () => { ptr = null; });

/* ---------- actions from buttons ---------- */
const ACT = {};
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  unlock(); const f = ACT[b.dataset.act]; if (f) { sfx('tap'); f(b.dataset, b); }
});
ACT.mute = () => { toggleMute(); renderHud(); };

/* ---------- toast & modal ---------- */
let toastTimer = 0;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.classList.remove('show'); el.hidden = true; }, 2800);
}
function openModal(html) { modalCard.innerHTML = html; modal.hidden = false; modalCard.scrollTop = 0; }
function closeModal() { modal.hidden = true; modalCard.innerHTML = ''; }
ACT.close = () => closeModal();
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

/* ================================================================== title */
function titleScreen() {
  const saved = load();
  return {
    kind: 'title', w: DW, h: DH, fps: 24,
    draw(fb, t) { renderDiorama(fb, t, THEMES.morning, { mascot: true }); },
    panel() {
      return `<div class="title"><h1>Pixel Pet Clinic</h1><p class="sub">Week one demo · v${VERSION}</p>
      <p>You've inherited a run-down clinic for creatures no other vet will touch. Diagnose them, treat them, and make rent by Friday.</p>
      <div class="btns">${saved ? `<button class="primary" data-act="continue">Continue (${WEEK[Math.min(saved.day, 4)].name}, ${money(saved.money)})</button>` : ''}
      <button class="${saved ? '' : 'primary'}" data-act="newgame">${saved ? 'Start over' : 'Start the week'}</button></div>
      <p class="fine">Tip: on the exam screen, drag to move the lamp. Signs of illness only show where the light is close.</p></div>`;
    },
  };
}
ACT.newgame = () => { newGame(); setScreen(hubScreen('morning')); };
ACT.continue = () => { S = load(); if (!S) return newGame(); if (S.phase === 'open') setScreen(hallScreen()); else setScreen(hubScreen(S.phase)); };

/* ================================================================== the clinic (diorama) */
function hubScreen(mode) {
  return {
    kind: 'hub', w: DW, h: DH, fps: 24, mode,
    draw(fb, t) {
      const th = mode === 'morning' ? THEMES.morning : mode === 'final' ? THEMES.cursed : THEMES.night;
      renderDiorama(fb, t, th, { kennel: S.kennel, cursed: mode === 'final' });
    },
    panel() {
      const d = WEEK[S.day], unread = S.mail.filter((m) => !m.read).length;
      if (mode === 'morning') {
        const booked = S.pending.length;
        return `<h2>${d.name} morning</h2>
          ${S.notes.map((n) => `<p class="note">${esc(n)}</p>`).join('')}
          <p>${booked} patient${booked === 1 ? '' : 's'} booked today. Doors open at 9:00. ${S.day === 4 ? `<b>Rent of ${money(RENT)} is due tonight.</b>` : `Rent of ${money(RENT)} is due Friday.`}</p>
          ${supplyLine()}
          <div class="btns">
            <button data-act="mail">${unread ? `Read mail (${unread} new)` : 'Mail'}</button>
            <button data-act="shop">Order supplies</button>
            <button data-act="handbook">Handbook</button>
            <button data-act="casebook">Casebook</button>
            <button class="primary" data-act="open">Open the doors</button>
          </div>`;
      }
      if (mode === 'evening') {
        const td = S.today;
        return `<h2>${d.name} evening</h2>
          <div class="summary"><span>Patients seen <b>${td.seen}</b></span><span>Cured <b>${td.cured}</b></span><span>Earned <b>${money(td.earned)}</b></span><span>Spent <b>${money(td.spent)}</b></span><span>Reputation <b>${td.rep >= 0 ? '+' : ''}${Math.round(td.rep)}</b></span>${td.left ? `<span>Walked out <b>${td.left}</b></span>` : ''}</div>
          ${S.kennel.length ? `<h3>Kennels</h3>${S.kennel.map((k, i) => `<div class="row"><span>${esc(k.pet)} (${spName(k.sp)})${k.cared ? ' · cared for tonight' : ''}</span>${k.cared ? '' : `<button data-act="care" data-i="${i}">Care (1 pack)</button>`}</div>`).join('')}` : ''}
          ${supplyLine()}
          <div class="btns">
            <button data-act="shop">Order supplies</button>
            <button data-act="casebook">Casebook</button>
            <button class="primary" data-act="gohome">${S.day === 4 ? 'Lock up for the week' : 'Lock up and go home'}</button>
          </div>`;
      }
      return finalPanel();
    },
  };
}
function supplyLine() {
  return `<p class="supplies">${Object.entries(SUPPLIES).map(([k, v]) => `<span class="${S.supplies[k] ? '' : 'out'}">${v.name} <b>${S.supplies[k]}</b></span>`).join('')}</p>`;
}
ACT.open = () => { S.phase = 'open'; S.minute = OPEN; arrivals(true); save(); sfx('bell'); setScreen(hallScreen()); };
ACT.care = (ds) => {
  const k = S.kennel[+ds.i]; if (!k || k.cared) return;
  if (S.supplies.kibble <= 0) { toast('You are out of kennel care packs. Order more first.'); return; }
  S.supplies.kibble--; k.cared = true; k.caredLast = true; k.careCount = (k.careCount || 0) + 1; sfx('good'); save(); renderPanel();
};
ACT.gohome = () => {
  for (const k of S.kennel) k.cared = false;
  if (S.day >= 4) return finale();
  S.day++; startDay(); setScreen(hubScreen('morning'));
};

/* ---------- mail, shop, handbook ---------- */
ACT.mail = () => {
  const list = S.mail.slice().reverse();
  openModal(`<h2>Mail</h2>${list.length ? list.map((m, i) => `<button class="letter ${m.read ? '' : 'new'}" data-act="letter" data-i="${S.mail.length - 1 - i}"><b>${esc(m.subject)}</b><span>${esc(m.from)} · ${WEEK[m.day].name}</span></button>`).join('') : '<p>No mail.</p>'}<div class="btns"><button data-act="close">Close</button></div>`);
};
ACT.letter = (ds) => {
  const m = S.mail[+ds.i]; m.read = true; save(); sfx('page');
  openModal(`<p class="from">From: ${esc(m.from)}</p><h2>${esc(m.subject)}</h2><div class="letter-body">${esc(m.body).split('\n').map((l) => `<p>${l}</p>`).join('')}</div><div class="btns"><button data-act="mail">Back to mail</button><button data-act="close">Close</button></div>`);
  renderPanel();
};
ACT.shop = () => {
  openModal(`<h2>Order supplies</h2><p class="fine">Delivered right away. You have <b>${money(S.money)}</b>.</p>
    ${Object.entries(SUPPLIES).map(([k, v]) => `<div class="row"><span><b>${v.name}</b> · you have ${S.supplies[k]}<br><small>${v.note}</small></span><button data-act="buy" data-k="${k}" ${S.money < v.price ? 'disabled' : ''}>${v.pack} for ${money(v.price)}</button></div>`).join('')}
    <div class="btns"><button data-act="close">Done</button></div>`);
};
ACT.buy = (ds) => {
  const v = SUPPLIES[ds.k]; if (S.money < v.price) return;
  addMoney(-v.price); S.supplies[ds.k] += v.pack; sfx('cash'); save(); renderHud(); ACT.shop(); renderPanel();
};
function handbookHtml(first) {
  const order = first ? [first, ...Object.keys(SPECIES).filter((s) => s !== first)] : Object.keys(SPECIES);
  return order.map((sp) => `<section class="hb"><h3>${SPECIES[sp].name} <small>normal ${SPECIES[sp].temp[0]}–${SPECIES[sp].temp[1]}°C</small></h3><p class="fine">${SPECIES[sp].blurb}</p>
    ${Object.entries(AILMENTS).filter(([, a]) => a.sp === sp).map(([id, a]) => `<div class="hb-ail"><b>${a.name}</b> <span class="tag">${TREATS[a.treat].name}</span><br>${a.book}</div>`).join('')}</section>`).join('');
}
ACT.handbook = () => { openModal(`<h2>Dr. Okafor's handbook</h2>${handbookHtml(scr && scr.patient ? scr.patient.sp : null)}<div class="btns"><button data-act="close">Close</button></div>`); };

/* ================================================================== waiting room (parallax) */
function hallScreen() {
  const s = {
    kind: 'hall', w: HW, h: HH, fps: 30, canvas: true, cam: 0, sel: 0, hits: [], drag: null,
    draw(ctx, t) {
      const seats = new Array(SEATS).fill(null);
      S.queue.forEach((p, i) => { if (p.seat < SEATS) seats[p.seat] = { owner: p.owner, sp: p.sp, selected: i === s.sel, waitLong: S.minute - p.waitFrom > 90 }; });
      if (!s.drag) { const p = S.queue[s.sel]; const target = p ? seatWorldX(p.seat) / 0.72 : 0; s.cam += (clamp(target, -90, 90) - s.cam) * 0.05; }
      s.hits = renderHall(ctx, t, themeAt(S.minute), { seats, cam: s.cam });
    },
    pointer(type, x, y, p) {
      if (type === 'down') s.drag = { x, cam: s.cam };
      if (type === 'move' && s.drag && p && p.moved) s.cam = clamp(s.drag.cam - (x - s.drag.x) * 1.2, -110, 110);
      if (type === 'up') s.drag = null;
      if (type === 'tap') { const h = s.hits.find((hh) => x >= hh.x0 && x <= hh.x1 && y >= hh.y0 && y <= hh.y1); if (h) { const i = S.queue.findIndex((q) => q.seat === h.k); if (i >= 0) { s.sel = i; renderPanel(); } } }
    },
    panel() {
      s.sel = clamp(s.sel, 0, Math.max(0, S.queue.length - 1));
      const closed = S.minute >= CLOSE;
      let html = `<h2>Waiting room</h2>`;
      if (S.queue.length) {
        html += `<p class="fine">Tap a chair or a card to choose who's next. ${closed ? 'The doors are closed, but these patients are still waiting.' : ''}</p>`;
        html += S.queue.map((p, i) => {
          const waited = S.minute - p.waitFrom;
          return `<div class="card ${i === s.sel ? 'sel' : ''}" data-act="pick" data-i="${i}"><div><b>${esc(p.pet)}</b> · ${spName(p.sp)}${p.returning ? ' <span class="tag warn">back again</span>' : ''}${p.petcorp ? ' <span class="tag warn">from PetCorp</span>' : ''}<br><small>${esc(p.owner)} · waiting ${waited} min${waited > 90 ? ' · getting impatient' : ''}</small></div>${i === s.sel ? `<button class="primary" data-act="callin" data-i="${i}">Call in</button>` : ''}</div>`;
        }).join('');
      } else if (S.pending.length && !closed) {
        html += `<p>Nobody's waiting. The next patient is due around ${fmt(S.pending[0].arrive)}.</p><div class="btns"><button class="primary" data-act="wait">Wait for them</button><button data-act="shop">Order supplies</button></div>`;
      } else {
        html += `<p>${closed ? 'It\'s 5:00. Time to close.' : 'No one else is booked today.'}</p><div class="btns"><button class="primary" data-act="closeup">Close up for the day</button></div>`;
      }
      if (S.queue.length) html += `<div class="btns"><button data-act="handbook">Handbook</button><button data-act="closeup" class="ghost">Close early</button></div>`;
      return html;
    },
  };
  return s;
}
ACT.pick = (ds, el) => { if (scr.kind !== 'hall') return; scr.sel = +ds.i; renderPanel(); };
ACT.wait = () => { if (!S.pending.length) return; const m = Math.max(1, S.pending[0].arrive - S.minute); advance(m); save(); renderHud(); renderPanel(); };
ACT.callin = (ds) => { const p = S.queue[+ds.i]; if (!p) return; S.queue.splice(+ds.i, 1); advance(2); setScreen(examScreen(p)); };
ACT.closeup = () => {
  if (S.queue.length) {
    if (!scr.confirmClose) { scr.confirmClose = true; toast(`${S.queue.length} patient${S.queue.length > 1 ? 's are' : ' is'} still waiting. Tap again to send them home (reputation -2 each).`); return; }
    for (const p of S.queue) { addRep(-2); S.today.left++; S.stats.left++; if (S.day < 4) S.returns.push(stripPatient(p)); }
    S.queue = [];
  }
  S.pending = []; S.phase = 'evening'; save(); setScreen(hubScreen('evening'));
};
function stripPatient(p) { const { uid, seat, waitFrom, arrive, returning, ...rest } = p; return rest; }

/* ================================================================== exam room (lamp-lit) */
function examScreen(p) {
  const A = AILMENTS[p.ail];
  if (!S.seen[p.sp]) S.seen[p.sp] = true;
  const s = {
    kind: 'exam', w: EW, h: EH, fps: 30, patient: p, tool: 'look', lampX: OX - 30, lampY: 22, xray: false, spin: 0,
    found: new Set(), used: {}, notes: [], charges: 0, stage: 'exam', tut: p.tutorial && !S.flags.tutDone ? 0 : -1,
    draw(fb, t) {
      renderExam(fb, { sp: p.sp, ail: p.ail, AIL: A, t, th: themeAt(S.minute), lampX: s.lampX, lampY: s.lampY, xray: s.xray, found: s.found, spin: s.spin, obj: p.obj, xk: A.xk });
    },
    pointer(type, x, y, ptrState) {
      if (s.stage !== 'exam') return;
      if (s.tool === 'look' && (type === 'move' || type === 'down')) { if (type === 'down' || ptrState || window.matchMedia('(hover: hover)').matches) { s.lampX = clamp(x, 6, EW - 6); s.lampY = clamp(y - 22, 4, 60); } }
      if (s.tool === 'turn' && type === 'move' && ptrState) { s.spin += (x - ptrState.lx) * 0.06; }
      if (type !== 'tap') return;
      if (s.tool === 'look') {
        const si = signAt(x, y, 4);
        if (si >= 0 && !s.found.has(si)) { s.found.add(si); s.notes.push({ k: 'sign' + si, t: `Seen: ${A.signs[si].text}.` }); sfx('clue'); buzz(15); toast(`Found: ${A.signs[si].text}`); if (s.tut === 0) s.tut = 1; renderPanel(); }
        else if (si < 0 && bodyAt(x, y)) toast('Nothing unusual there. Try moving the lamp closer to other spots.');
      }
      if (s.tool === 'listen' && bodyAt(x, y)) {
        const snd = /fizz|sizzl/i.test(A.listen) ? 'fizz' : /crackl/i.test(A.listen) ? 'crackle' : /wheez/i.test(A.listen) ? 'wheeze' : /squelch/i.test(A.listen) ? 'squelch' : /heartbeat|racing|wobble|breathing/i.test(A.listen) ? 'heart' : 'page';
        sfx(snd);
        if (!s.used.listen) { s.used.listen = true; advance(TESTS.listen.min); s.notes.push({ k: 'listen', t: `Listen: ${A.listen}` }); if (s.tut === 1) s.tut = 2; renderHud(); renderPanel(); }
        else toast(A.listen);
      }
    },
    panel() { return examPanel(s); },
  };
  return s;
}
function examPanel(s) {
  const p = s.patient, A = AILMENTS[p.ail], pebble = p.sp === 'pebble';
  if (s.stage === 'result') return s.resultHtml;
  const tools = [['look', 'Look'], ...(pebble ? [['turn', 'Turn']] : []), ['listen', 'Listen']];
  const tests = [['temp', 'Temp'], ['xray', `X-ray (${S.supplies.film})`], ['sample', `Sample (${S.supplies.kits})`], ['mood', 'Mood scan']];
  const hints = ['Drag across the patient to move the lamp. Signs only show up where the light is close. Tap anything odd.', 'Good. Now choose Listen and tap the patient.', 'Compare your notes with the Handbook, then tap Diagnose. X-rays and samples use up supplies, so only run them when you need to.'];
  return `<div class="owner"><b>${esc(p.owner)}</b> with <b>${esc(p.pet)}</b> (${spName(p.sp)})<p>“${esc(p.say)}”</p></div>
    ${s.tut >= 0 && s.tut < 3 ? `<p class="hint">${hints[s.tut]}</p>` : ''}
    <div class="tools">${tools.map(([k, n]) => `<button class="tool ${s.tool === k ? 'on' : ''}" data-act="tool" data-k="${k}">${n}</button>`).join('')}
    ${tests.map(([k, n]) => `<button class="tool ${s.used[k] ? 'used' : ''} ${k === 'xray' && s.xray ? 'on' : ''}" data-act="test" data-k="${k}">${n}${TESTS[k].cost && !s.used[k] ? ` <small>costs ${money(TESTS[k].cost)}</small>` : ''}</button>`).join('')}</div>
    <h3>Notes</h3>
    <ul class="notes">${s.notes.length ? s.notes.map((n) => `<li>${esc(n.t)}</li>`).join('') : '<li class="fine">Nothing yet.</li>'}</ul>
    <div class="btns"><button data-act="handbook">Handbook</button><button class="primary" data-act="diagnose">Diagnose</button></div>`;
}
ACT.tool = (ds) => {
  if (scr.kind !== 'exam') return; scr.tool = ds.k;
  if (ds.k === 'look' && scr.xray) scr.xray = false;
  toast(ds.k === 'look' ? 'Drag to move the lamp. Tap anything that looks wrong.' : ds.k === 'listen' ? 'Tap the patient to listen.' : 'Drag sideways to turn the egg.');
  renderPanel();
};
ACT.test = (ds) => {
  const s = scr; if (s.kind !== 'exam') return; const p = s.patient, A = AILMENTS[p.ail], T = TESTS[ds.k];
  if (ds.k === 'xray' && s.used.xray) { s.xray = !s.xray; renderPanel(); return; }
  if (s.used[ds.k]) { toast(s.notes.find((n) => n.k === ds.k).t); return; }
  if (T.uses && S.supplies[T.uses] <= 0) { toast(`You're out of ${SUPPLIES[T.uses].name.toLowerCase()}. Order more from the clinic screen.`); return; }
  if (T.uses) S.supplies[T.uses]--;
  if (T.cost) addMoney(-T.cost);
  if (T.charge) s.charges += T.charge;
  s.used[ds.k] = true; advance(T.min);
  const sp = SPECIES[p.sp];
  if (ds.k === 'temp') { const hi = A.temp > sp.temp[1], lo = A.temp < sp.temp[0]; s.notes.push({ k: 'temp', t: `Temperature: ${A.temp}°C (${hi ? 'high' : lo ? 'low' : 'normal'}; normal is ${sp.temp[0]}–${sp.temp[1]}).` }); sfx('thermo'); }
  if (ds.k === 'xray') { s.xray = true; s.notes.push({ k: 'xray', t: `X-ray: ${A.xray}` }); sfx('xray'); }
  if (ds.k === 'sample') { s.notes.push({ k: 'sample', t: `Sample: ${A.sample}` }); sfx('page'); }
  if (ds.k === 'mood') { s.notes.push({ k: 'mood', t: `Mood scan: ${A.mood}.` }); sfx('clue'); }
  renderHud(); renderPanel();
};
ACT.diagnose = () => {
  const s = scr; if (s.kind !== 'exam') return; const p = s.patient;
  const opts = Object.entries(AILMENTS).filter(([, a]) => a.sp === p.sp);
  openModal(`<h2>Diagnose ${esc(p.pet)}</h2><p class="fine">Pick the condition that matches your notes.</p>
    <ul class="notes">${s.notes.map((n) => `<li>${esc(n.t)}</li>`).join('') || '<li class="fine">You haven\'t found anything yet. A guess is risky.</li>'}</ul>
    ${opts.map(([id, a]) => `<button class="dx" data-act="dx" data-id="${id}"><b>${a.name}</b><span>${a.book}</span><small>Treatment: ${TREATS[a.treat].name}</small></button>`).join('')}
    <div class="btns"><button data-act="close">Keep examining</button></div>`);
};
ACT.dx = (ds) => {
  closeModal(); const s = scr; if (s.kind !== 'exam') return;
  s.dx = ds.id; S.flags.tutDone = true; s.tut = -1;
  const D = AILMENTS[ds.id], tr = TREATS[D.treat];
  if (tr.uses && S.supplies[tr.uses] <= 0) {
    openModal(`<h2>Out of ${SUPPLIES[tr.uses].name.toLowerCase()}</h2><p>You need ${SUPPLIES[tr.uses].name.toLowerCase()} for this. You can try without (it probably won't work well), or send ${esc(s.patient.pet)} across the street to PetCorp.</p>
      <div class="btns"><button data-act="treat" data-cap="0.25">Try without</button><button data-act="refer">Send to PetCorp</button></div>`);
    return;
  }
  ACT.treat({});
};
ACT.refer = () => {
  closeModal(); const s = scr; addRep(-2); S.today.seen++; toast(`${s.patient.owner} heads across the street to PetCorp.`);
  advance(5); save(); setScreen(hallScreen());
};
ACT.treat = (ds) => {
  closeModal(); const s = scr, p = s.patient, D = AILMENTS[s.dx], tr = TREATS[D.treat], cap = ds.cap ? +ds.cap : 1;
  if (tr.uses && S.supplies[tr.uses] > 0) S.supplies[tr.uses]--;
  if (D.treat === 'admit') {
    if (S.kennel.length >= 3) { toast('The kennels are full.'); return; }
    S.kennel.push({ pet: p.pet, sp: p.sp, owner: p.owner, ail: p.ail, correct: p.ail === 'cold', tobi: p.id === 'pebs', careCount: 0, cared: false });
    return finishTreatment(s, 1);
  }
  if (D.treat === 'tell') {
    openModal(`<h2>Break the news</h2><p>${esc(p.owner)} is holding ${esc(p.pet)} very carefully.</p>
      <button class="dx" data-act="tell" data-v="gentle"><b>Gently explain it's a rock.</b><span>“I'm sorry. ${esc(p.pet)} is a rock. A very good one.”</span></button>
      <button class="dx" data-act="tell" data-v="egg"><b>Tell them it's a very slow egg.</b><span>They'll be happy, and they'll pay.</span></button>
      <button class="dx" data-act="tell" data-v="blunt"><b>Just say it.</b><span>“That's a rock.”</span></button>`);
    return;
  }
  const kind = D.treat;
  // freeze the exam view as the mini-game backdrop
  const th = themeAt(S.minute), fb = new FB(EW, EH);
  renderExam(fb, { sp: p.sp, ail: p.ail, AIL: AILMENTS[p.ail], t: clock, th, lampX: OX, lampY: 24, xray: false, found: new Set(), spin: s.spin, obj: p.obj, xk: AILMENTS[p.ail].xk, noLamp: true });
  const points = bodyPoints(60, p.uid);
  const body = p.sp === 'gloop' ? th.slime : p.sp === 'cat' ? th.cat : p.sp === 'fern' ? [92, 168, 86] : p.sp === 'moth' ? [158, 124, 92] : th.egg;
  const g = makeMinigame(kind, { bg: fb.img, th, sp: p.sp, ail: s.dx, obj: p.obj, points, body, sfx, buzz });
  setScreen(minigameScreen(g, tr, (score) => { setScreen(s); finishTreatment(s, Math.min(score, cap)); }));
};
ACT.tell = (ds) => {
  closeModal(); const s = scr, p = s.patient;
  if (ds.v === 'egg') { S.integrity--; s.lie = true; return finishTreatment(s, 0.6); }
  return finishTreatment(s, ds.v === 'gentle' ? 1 : 0.5);
};

/* ---------- mini-game screen ---------- */
function minigameScreen(g, tr, done) {
  let after = 0;
  return {
    kind: 'game', w: EW, h: EH, fps: 60, canvas: true, g,
    update(dt) { if (!g.done) g.update(dt); else { after += dt; if (after > 1.1 && !this.fired) { this.fired = true; done(g.score); } } },
    draw(ctx) { g.draw(ctx); },
    pointer(type, x, y) { if (!g.done && type !== 'tap') g.pointer(type, x, y); },
    panel() { return `<h2>${tr.name}</h2><p>${tr.how}</p><p class="fine">Use your finger or mouse on the picture above.</p>`; },
  };
}

/* ---------- outcome and billing ---------- */
function finishTreatment(s, score) {
  const p = s.patient, A = AILMENTS[p.ail], D = AILMENTS[s.dx], correct = s.dx === p.ail;
  advance(15); S.today.seen++;
  let text = '', fee = 0, cured = false, mood = '';
  if (D.treat === 'admit') {
    if (correct) { text = `${p.pet} is tucked into the incubator. Care for the kennels each evening to keep it warm.`; fee = A.fee; cured = true; S.casebook[p.ail] = true; S.stats.cured++; S.today.cured++; addRep(3); sfx('good'); }
    else { text = `${p.pet} is in the incubator for the night, but you're not sure it'll help.`; fee = A.fee; S.stats.wrong++; S.today.wrong++; addRep(-5); }
  } else if (correct && score >= 0.3) {
    cured = true; S.stats.cured++; S.today.cured++; S.casebook[p.ail] = true;
    addRep(1 + Math.round(score * 2)); fee = A.fee;
    text = (s.lie ? `${p.owner} beams. “A slow egg! I knew it.” You feel a little bad.` : A.cure) + (score >= 0.85 ? ' Textbook work.' : score < 0.5 ? ' A bit shaky, but it worked.' : '');
    S.polaroids.push({ pet: p.pet, sp: p.sp, ail: p.ail, day: S.day, owner: p.owner });
    if (p.id === 'bubbles') S.flags.bubblesCured = true;
    mood = 'happy'; sfx('good');
  } else if (correct) {
    S.stats.botched++; addRep(-2); fee = Math.round(A.fee / 2);
    text = `You had the right idea, but the treatment didn't take. ${p.owner} pays half and says they'll try PetCorp.`; mood = 'meh'; sfx('bad');
  } else {
    S.stats.wrong++; S.today.wrong++; addRep(-5);
    text = `${p.pet} isn't any better. It wasn't ${D.name.toLowerCase()}. Looking back at your notes, it was probably <b>${A.name.toLowerCase()}</b>.`;
    if (S.day < 4 && !p.returning) { S.returns.push(stripPatient(p)); text += ` ${p.owner} will be back tomorrow.`; }
    mood = 'sad'; sfx('bad');
  }
  const charge = fee + s.charges;
  s.stage = 'result'; s.bill = { fee, charge, cured, correct, mood };
  const tests = s.charges ? `<div class="row"><span>Tests</span><span>${money(s.charges)}</span></div>` : '';
  const line = fee ? `<div class="row"><span>Treatment</span><span>${money(fee)}</span></div>` : `<div class="row"><span>Treatment</span><span>no charge</span></div>`;
  const options = p.cantPay
    ? `<button class="primary" data-act="bill" data-k="tab">Put it on a tab</button><button data-act="bill" data-k="free">No charge</button>`
    : charge > 0 ? `<button class="primary" data-act="bill" data-k="fair">Charge ${money(charge)}</button><button data-act="bill" data-k="discount">Discount: ${money(charge * 0.6)}</button><button data-act="bill" data-k="free">No charge</button><button data-act="bill" data-k="extra">Charge extra: ${money(charge * 1.4)}</button>`
    : `<button class="primary" data-act="bill" data-k="free">See them out</button>`;
  s.resultHtml = `<h2>${cured ? 'Treated' : correct ? 'Not quite' : 'Wrong call'}</h2><p>${text}</p>
    <h3>The bill</h3>${line}${tests}<div class="row total"><span>Total</span><span>${money(charge)}</span></div>
    ${p.cantPay ? `<p class="fine">${esc(p.owner)} looks at the four dollars in their hand.</p>` : ''}
    <div class="btns">${options}</div>`;
  renderHud(); renderPanel();
}
ACT.bill = (ds) => {
  const s = scr, p = s.patient, b = s.bill; let paid = 0;
  if (ds.k === 'fair') paid = b.charge;
  if (ds.k === 'discount') { paid = Math.round(b.charge * 0.6); addRep(2); }
  if (ds.k === 'free') { addRep(b.charge > 0 ? 4 : 0); }
  if (ds.k === 'extra') { paid = Math.round(b.charge * 1.4); addRep(-4); S.integrity--; }
  if (ds.k === 'tab') { S.flags.tobiTab = (S.flags.tobiTab || 0) + b.charge; addRep(2); }
  if (paid) { addMoney(paid); sfx('cash'); }
  let tip = 0;
  if (b.cured && (ds.k === 'fair' || ds.k === 'discount') && s.bill.mood === 'happy') tip = Math.round(S.rep / 20 + hash(p.uid, 3) * 4);
  if (tip) { addMoney(tip); toast(`${p.owner} leaves a ${money(tip)} tip.`); }
  if (p.vance) return vanceChoice(s, paid);
  doneWithPatient();
};
function vanceChoice(s, paid) {
  openModal(`<h2>The collar</h2><p>While you clean up, you notice a tag under Duchess's fur:</p><p class="quote">PROPERTY OF SILK ROAD EXOTICS. NOT FOR RESALE. IMPORT NO. 0447</p><p>Mothhounds can't legally be imported. Mr. Vance sees you looking. He slides an envelope across the table. “For your trouble. And your memory.”</p>
    <button class="dx" data-act="vance" data-v="report"><b>Report him to Animal Control.</b><span>He'll storm out. It's the right thing to do.</span></button>
    <button class="dx" data-act="vance" data-v="quiet"><b>Take the envelope and say nothing.</b><span>$60, no questions.</span></button>`);
}
ACT.vance = (ds) => {
  closeModal();
  if (ds.v === 'report') { S.flags.vanceReported = true; addRep(3); S.integrity++; toast('You make the call after he leaves. Animal Control thanks you.'); }
  else { addMoney(60); S.integrity -= 2; S.flags.vanceQuiet = true; toast('You pocket the envelope. $60.'); }
  doneWithPatient();
};
function doneWithPatient() { save(); setScreen(hallScreen()); }

/* ================================================================== casebook (pre-rendered turnarounds) */
function casebookScreen(back) {
  const sps = Object.keys(SPECIES);
  const s = {
    kind: 'casebook', w: TW, h: TH, fps: 12, sp: sps.find((k) => S.seen[k]) || 'gloop', back,
    draw(fb, t) { if (S.seen[s.sp]) renderTurntable(fb, s.sp, t, THEMES.fluoro); else { fb.fill([14, 18, 22]); } },
    panel() {
      const sp = s.sp, known = S.seen[sp];
      const ails = Object.entries(AILMENTS).filter(([, a]) => a.sp === sp);
      return `<h2>Casebook</h2><div class="tabs">${sps.map((k) => `<button class="tool ${k === sp ? 'on' : ''}" data-act="cbsp" data-k="${k}">${S.seen[k] ? SPECIES[k].name : '???'}</button>`).join('')}</div>
        ${known ? `<p>${SPECIES[sp].blurb}</p><ul class="notes">${ails.map(([id, a]) => `<li>${S.casebook[id] ? `<b>${a.name}</b> · treated` : '<span class="fine">Not treated yet</span>'}</li>`).join('')}</ul>` : '<p class="fine">You haven\'t examined one of these yet.</p>'}
        <h3>The wall of fame</h3>${S.polaroids.length ? `<div class="wall">${S.polaroids.map((ph, i) => `<figure><img alt="${esc(ph.pet)}" src="${polaroid(ph, i)}"><figcaption>${esc(ph.pet)}<small>${WEEK[ph.day].short}</small></figcaption></figure>`).join('')}</div>` : '<p class="fine">Patients you cure get a photo here.</p>'}
        <div class="btns"><button class="primary" data-act="cbback">Back</button></div>`;
    },
  };
  return s;
}
const POLA = new Map();
function polaroid(ph, i) {
  const key = ph.pet + ph.sp + ph.ail + i; if (POLA.has(key)) return POLA.get(key);
  const fb = new FB(EW, EH), A = AILMENTS[ph.ail], healthy = { gloop: 'swallowed', cat: 'hairball', fern: 'mites', moth: 'wingmites', pebble: 'healthy' }[ph.sp];
  renderExam(fb, { sp: ph.sp, ail: healthy, AIL: { signs: [] }, t: 1.2 + i, th: THEMES.fluoro, lampX: OX - 10, lampY: 18, xray: false, found: new Set(), spin: 0.6, obj: null, xk: A.xk });
  const c = document.createElement('canvas'); c.width = EW; c.height = EH; c.getContext('2d').putImageData(fb.img, 0, 0);
  const url = c.toDataURL(); POLA.set(key, url); return url;
}
ACT.casebook = () => setScreen(casebookScreen(scr));
ACT.cbsp = (ds) => { scr.sp = ds.k; renderPanel(); };
ACT.cbback = () => setScreen(scr.back);

/* ================================================================== the end of the week */
function finale() {
  const notes = [];
  if (S.money >= RENT) { addMoney(-RENT); S.flags.rentPaid = true; notes.push(`Mr. Grubb counts out ${money(RENT)} and grunts. “Same time next week.”`); }
  else { S.flags.rentShort = RENT - S.money; notes.push(`You're ${money(RENT - S.money)} short. Mr. Grubb gives you until Monday, “with interest.”`); }
  const pebs = S.kennel.find((k) => k.tobi);
  if (pebs && pebs.correct && (pebs.careCount || 0) >= 3) {
    S.flags.hatched = true; S.polaroids.push({ pet: 'Pebs (hatched!)', sp: 'pebble', ail: 'cracked', day: 4, owner: 'Tobi' });
    notes.push('Then a tapping from the incubator. Tobi presses their face to the glass as Pebs cracks open: a tiny, sooty Gutterdrake, sneezing smoke rings. Tobi names him Pebs anyway.');
  } else if (pebs && pebs.correct) notes.push('Pebs is still curled up in the incubator. A few more warm nights. Tobi will be back Monday.');
  else if (S.flags.tobiTab != null || pebs) notes.push('Tobi stops by to ask about Pebs. You don\'t have good news yet.');
  S.kennel = S.kennel.filter((k) => !k.tobi || !S.flags.hatched);
  S.phase = 'final'; S.finalNotes = notes; save();
  setScreen(hubScreen('final'));
  if (S.flags.hatched) sfx('hatch');
  setTimeout(() => { if (scr && scr.mode === 'final') sfx('knock'); }, 2500);
}
function finalPanel() {
  const st = S.stats;
  return `<h2>Friday night</h2>${(S.finalNotes || []).map((n) => `<p>${esc(n)}</p>`).join('')}
    <p class="quote">You're turning off the lights when you hear it: three slow knocks. From the basement door.</p>
    <p>The padlock is glowing.</p>
    <p class="fine">To be continued.</p>
    <h3>Your first week</h3>
    <div class="summary"><span>Cured <b>${st.cured}</b></span><span>Wrong calls <b>${st.wrong}</b></span><span>Walked out <b>${st.left}</b></span><span>Lost to PetCorp <b>${st.lost}</b></span><span>Money <b>${money(S.money)}</b></span><span>Reputation <b>${Math.round(S.rep)}</b></span></div>
    <p class="fine">${S.integrity >= 1 ? 'You kept your hands clean this week.' : S.integrity <= -2 ? 'Some of this week\'s money will be hard to explain.' : 'You cut a corner or two.'}</p>
    <div class="btns"><button data-act="casebook">Casebook and photos</button><button class="primary" data-act="newgame">Play the week again</button></div>
    <p class="fine">Thanks for playing the demo. Tell Claude what you think!</p>`;
}

/* ================================================================== boot */
for (const k of ['morning', 'night']) setTimeout(() => prewarm(THEMES[k]), 50);
setScreen(titleScreen());
renderHud();
requestAnimationFrame(loop);
window.__ppc = { get S() { return S; }, get scr() { return scr; }, ACT, setScreen, hubScreen, examScreen, hallScreen };
