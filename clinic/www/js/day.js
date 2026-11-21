// The working day: mornings, the waiting room, closing up, and the clinic screens.
import { clamp, rng, hash } from './util.js';
import { THEMES, themeAt } from './themes.js';
import { SPECIES, AILMENTS, SUPPLIES, EQUIPMENT, STAFF, RECIPES, INGREDIENTS } from './data.js';
import { WEEK, RENT, OPEN, CLOSE, WEATHER, PET_NAMES, OWNER_NAMES, STRAYS } from './story.js';
import { makePatient, worsen } from './patient.js';
import { DW, DH, renderDiorama, prewarm } from './diorama.js';
import { HW, HH, SEATS, renderHall, seatWorldX } from './hall.js';
import { TW, TH, renderTurntable } from './turntable.js';
import { sfx, music, ambience, getSettings, setVolume, toggleMute, isMuted } from './audio.js';
import { G, ACT, esc, fmt, money, save, setScreen, renderPanel, renderHud, toast, openModal, closeModal, addMoney, addRep, icon } from './core.js';
import { examScreen, portrait, polaroidUrl, stripPatient } from './examflow.js';

export const spName = (sp) => SPECIES[sp].name;
const DAYS3 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ================================================================== new game & mornings */
export function newGame() {
  const supplies = {}; for (const [k, v] of Object.entries(SUPPLIES)) supplies[k] = v.start;
  G.S = {
    v: 2, seed: (Math.random() * 1e9) | 0, day: 0, minute: OPEN, phase: 'morning', money: 60, rep: 50, integrity: 0,
    supplies, equipment: {}, staff: {}, ingredients: { mallow: 1, mint: 1 }, remedies: {}, pages: {}, clues: {},
    queue: [], pending: [], kennel: [], casebook: {}, seen: {}, polaroids: [], mail: [], flags: {}, charts: {},
    stats: { cured: 0, wrong: 0, botched: 0, left: 0, earned: 0, spent: 0, lost: 0, adopted: 0 }, returns: [], nextId: 1,
    usedNames: WEEK.flatMap((d) => d.fixed.map((f) => f.pet)), today: null, notes: [], energy: 3, visited: [], sat: { done: [] },
  };
  startDay();
}
function pickName(sp, r) {
  const S = G.S, pool = PET_NAMES[sp].filter((n) => !S.usedNames.includes(n)), list = pool.length ? pool : PET_NAMES[sp];
  const n = list[Math.floor(r() * list.length)]; S.usedNames.push(n); return n;
}
function overnight() {
  const S = G.S, notes = S.notes;
  const guests = S.kennel;
  // contagion: sick guests can pass it to the guest next door of the same species
  if (!S.flags.smoke) guests.forEach((k, i) => {
    if (!k.contagious || k.iso || k.cured) return;
    for (const j of [i - 1, i + 1]) {
      const n = guests[j]; if (!n || n.iso || n.sp !== k.sp || n.sick || n.ail === k.ail) continue;
      if (hash(S.seed, S.day * 10 + i, j) < 0.65) {
        if (n.stray) { n.sick = k.ail; notes.push(`${n.pet} caught ${AILMENTS[k.ail].name.toLowerCase()} from ${k.pet} in the next kennel. Your foster needs treatment today.`); }
        else { n.need += 1; n.caught = true; addRep(-3); notes.push(`${n.pet} caught ${AILMENTS[k.ail].name.toLowerCase()} from ${k.pet} in the next kennel. ${n.owner} won't be pleased. It needs another night.`); }
      }
    }
  });
  S.flags.smoke = false;
  const keep = [];
  for (const k of guests) {
    if (k.stray) { k.bond = k.careCount || 0; if (!k.caredLast) notes.push(`${k.pet} had a lonely night. Fosters need care each evening too.`); k.caredLast = false; keep.push(k); continue; }
    if (k.caredLast) k.nights++; else notes.push(`${k.pet} had a cold, hungry night in the kennels. It didn't get any better.`);
    k.caredLast = false;
    if (k.nights >= k.need) {
      if (k.tobi && k.correct) {
        S.flags.hatched = true; S.stats.cured++;
        S.polaroids.push({ pet: 'Pebs, hatched!', sp: 'pebble', ail: 'swallowed', day: S.day, owner: 'Tobi', hatch: true });
        notes.push('Tobi was waiting on the doorstep before you opened. While you unlock the incubator, Pebs starts to tap. Then crack. Out comes a tiny, sooty Gutterdrake, sneezing smoke rings. Tobi names him Pebs anyway, and pays the first dollar of the tab.');
        if (S.flags.tobiTab) S.flags.tobiTab -= 1;
        sfx('hatch');
      } else if (k.correct) notes.push(`${k.owner} collected ${k.pet}, warm and well.`);
      else { notes.push(`${k.owner} collected ${k.pet}. The night in the kennels didn't help. (It was ${AILMENTS[k.ail].name.toLowerCase()}.)`); addRep(-2); }
      continue;
    }
    keep.push(k);
  }
  S.kennel = keep;
}
export function startDay() {
  const S = G.S, d = WEEK[S.day], r = rng(S.seed + S.day * 101);
  S.notes = [];
  if (S.day > 0) overnight();
  S.minute = OPEN; S.phase = d.weekend ? 'weekend' : 'morning'; S.queue = []; S.pending = [];
  S.today = { earned: 0, spent: 0, rep: 0, cured: 0, wrong: 0, left: 0, seen: 0, lost: 0 };
  S.energy = 3; S.visited = []; S.afterDone = false;
  // staff wages
  for (const [k, on] of Object.entries(S.staff)) if (on && S.day > 0) { addMoney(-STAFF[k].wage); S.notes.push(`Paid ${STAFF[k].name} ${money(STAFF[k].wage)} for the day.`); }
  // mail
  for (const m of d.mail) if (!m.needs || S.flags[m.needs]) S.mail.push({ ...m, day: S.day, read: false });
  if (S.day === 4 && S.flags.vanceReported) { S.mail.push({ from: 'Animal Control', subject: 'Thank you', day: S.day, read: false, body: 'Thanks to your report we recovered eleven smuggled Mothhounds from a warehouse on Pier Street. Please find a reward of $80 enclosed.\n\nDuchess is doing well.' }); addMoney(80); }
  if (d.weekend) { save(); return; }
  // today's patients
  const list = d.fixed.map((f) => ({ ...f }));
  let randomN = d.random;
  if (S.day >= 2 && S.rep < 60 && randomN > 0) { randomN--; S.today.lost++; S.stats.lost++; S.notes.push('PetCorp Wellness is open across the street. With your reputation under 60, one booked patient went there instead.'); }
  const boost = WEATHER[d.weather].boost, pool = [...d.pool, ...d.pool.filter((a) => boost.includes(a))];
  for (let i = 0; i < randomN; i++) {
    const ail = pool[Math.floor(r() * pool.length)], sp = AILMENTS[ail].sp;
    const arrive = Math.round(565 + (i + 0.2 + r() * 0.6) * (390 / Math.max(1, randomN)));
    list.push({ id: 'r' + S.day + '_' + i, arrive, ail, pet: pickName(sp, r), owner: OWNER_NAMES[Math.floor(r() * OWNER_NAMES.length)], emergency: i < (d.emergencies || 0) ? true : undefined, sev: i < (d.emergencies || 0) ? 's' : undefined });
  }
  for (const ret of S.returns) list.push({ ...ret, arrive: 575 + Math.floor(r() * 60), returning: true, say: `${ret.pet} is worse than before. Whatever was done last time didn't work.` });
  S.returns = [];
  for (const k of S.kennel) if (k.stray && k.sick && !k.treating) { k.treating = true; list.push({ id: 'foster_' + k.id, arrive: OPEN, ail: k.sick, sev: 'm', pet: k.pet, owner: 'Your foster', say: `${k.pet} has been off since last night.`, foster: k.id, cantPay: true }); }
  S.pending = list.map((spec) => {
    const uid = S.nextId++;
    const p = makePatient(spec, S.seed + uid * 31, { minute: spec.arrive });
    p.uid = uid; p.chart = spec.chart || (spec.pet + '|' + spec.owner);
    if (spec.sev) p.sev = spec.sev;
    return p;
  }).sort((a, b) => a.arrive - b.arrive);
  save();
}

/* ================================================================== the clock */
export function arrivals(quiet) {
  const S = G.S, came = [];
  while (S.pending.length && S.pending[0].arrive <= S.minute && S.minute < CLOSE) {
    const p = S.pending.shift(); p.waitFrom = p.arrive;
    const used = new Set(S.queue.map((q) => q.seat)); let seat = 0; while (used.has(seat) && seat < SEATS - 1) seat++;
    p.seat = seat; S.queue.push(p); came.push(p);
  }
  if (came.length && !quiet) { sfx('bell'); toast(came.map((p) => `${p.owner} arrived with ${p.pet}${p.emergency ? ' (EMERGENCY)' : ''}`).join('. ')); }
}
export function advance(min) {
  const S = G.S; S.minute += min;
  arrivals();
  const patience = 150 + (S.staff.marco ? 60 : 0);
  for (const p of [...S.queue]) {
    const waited = S.minute - p.waitFrom;
    if (p.emergency && waited > 30) { S.queue = S.queue.filter((q) => q !== p); addRep(-6); S.stats.left++; S.today.left++; toast(`${p.owner} couldn't wait any longer with ${p.pet} and rushed to PetCorp.`); continue; }
    if (waited > patience) { S.queue = S.queue.filter((q) => q !== p); addRep(-4); S.stats.left++; S.today.left++; toast(`${p.owner} got tired of waiting and left with ${p.pet}.`); continue; }
    if (waited > 90 && !p.worse) { p.worse = true; if (worsen(p)) toast(`${p.pet} looks worse after the long wait.`); }
  }
}
G.backToHall = () => { advance(0); save(); setScreen(hallScreen()); };

/* ================================================================== the clinic (diorama) */
export function hubTheme(mode) { return mode === 'morning' ? (G.S && WEEK[G.S.day] && WEEK[G.S.day].weather === 'rain' ? THEMES.fluoro : THEMES.morning) : mode === 'final' || mode === 'cursed' ? THEMES.cursed : THEMES.night; }
export function hubScreen(mode) {
  const S = G.S;
  return {
    kind: 'hub', w: DW, h: DH, fps: 24, mode,
    enter() {
      music(mode === 'morning' ? 'morning' : mode === 'final' ? 'cursed' : 'night');
      ambience(mode === 'morning' ? 'clinic' : WEEK[S.day].weather === 'rain' ? 'rain' : 'night');
      if (mode === 'evening' && WEEK[S.day].afterHours && !S.afterDone && !S.afterPending) { S.afterPending = true; setTimeout(() => G.knock && G.knock(), 2200); }
    },
    draw(fb, t) { renderDiorama(fb, t, hubTheme(mode), { kennel: S.kennel, cursed: mode === 'final' || (mode === 'evening' && S.day >= 3) }); },
    panel() { return mode === 'morning' ? morningPanel() : mode === 'evening' ? eveningPanel() : G.finalPanel(); },
  };
}
function supplyLine() {
  const S = G.S;
  return `<div class="supplies">${Object.entries(SUPPLIES).map(([k, v]) => `<span class="${S.supplies[k] ? '' : 'out'}">${v.name} <b>${S.supplies[k]}</b></span>`).join('')}</div>`;
}
function kennelList(evening) {
  const S = G.S; if (!S.kennel.length) return '';
  return `<h3>Kennels</h3>${S.kennel.map((k, i) => `<div class="row kennel"><img class="portrait sm" src="${portrait({ uid: 'k' + k.pet, pet: k.pet, sp: k.sp, signs: [], ail: 'swallowed', R: { breath: 25 } }, true)}" alt=""><span><b>${esc(k.pet)}</b> · ${spName(k.sp)}${k.stray ? ` · foster, bond ${k.careCount || 0}` : ` · night ${k.nights + 1} of ${k.need}`}${k.contagious ? ' <span class="tag warn">contagious</span>' : ''}${k.iso ? ' <span class="tag">isolation</span>' : ''}${k.sick ? ' <span class="tag warn">sick</span>' : ''}${k.cared ? ' · cared for' : ''}</span>
    ${evening && !k.cared ? `<button class="small" data-act="care" data-i="${i}">Care (1 pack)</button>` : ''}${evening && S.equipment.isolation && !k.stray ? `<button class="small ghost" data-act="iso" data-i="${i}">${k.iso ? 'Out of isolation' : 'Isolate'}</button>` : ''}</div>`).join('')}`;
}
function morningPanel() {
  const S = G.S, d = WEEK[S.day], unread = S.mail.filter((m) => !m.read).length, booked = S.pending.length;
  return `<h2>${d.name} morning</h2>
    ${S.notes.map((n) => `<p class="note">${esc(n)}</p>`).join('')}
    <p>${booked} patient${booked === 1 ? '' : 's'} booked today. ${WEATHER[d.weather].name !== 'Clear' ? `Weather: ${WEATHER[d.weather].name.toLowerCase()}.` : ''} ${d.outbreak ? '<b>Static flu is going around.</b>' : ''} ${S.day === 4 ? `<b>Rent of ${money(RENT)} is due tonight.</b>` : `Rent of ${money(RENT)} is due Friday.`}</p>
    ${kennelList(false)}
    ${supplyLine()}
    <div class="btns grid">
      <button data-act="mail">${unread ? `Mail (${unread} new)` : 'Mail'}</button>
      <button data-act="shop">Shop</button>
      ${S.day >= 1 ? '<button data-act="staff">Staff</button>' : ''}
      <button data-act="handbook">Handbook</button>
      <button data-act="casebook">Casebook</button>
      <button class="primary wide" data-act="open">Open the doors</button>
    </div>`;
}
function eveningPanel() {
  const S = G.S, d = WEEK[S.day], td = S.today;
  return `<h2>${d.name} evening</h2>
    <div class="summary"><span>Seen <b>${td.seen}</b></span><span>Cured <b>${td.cured}</b></span><span>Earned <b>${money(td.earned)}</b></span><span>Spent <b>${money(td.spent)}</b></span><span>Reputation <b>${td.rep >= 0 ? '+' : ''}${Math.round(td.rep)}</b></span>${td.left ? `<span>Walked out <b>${td.left}</b></span>` : ''}</div>
    ${kennelList(true)}
    <p class="fine">You have time for <b>${S.energy}</b> more thing${S.energy === 1 ? '' : 's'} tonight: a stop on a night walk, or a brew.</p>
    <div class="btns grid">
      <button data-act="town" ${S.energy ? '' : 'disabled'}>Night walk</button>
      <button data-act="lab" ${S.energy ? '' : 'disabled'}>Brew remedies</button>
      <button data-act="shop">Shop</button>
      ${S.day >= 1 ? '<button data-act="staff">Staff</button>' : ''}
      <button data-act="casebook">Casebook</button>
      <button class="primary wide" data-act="gohome">${S.day === 4 ? `Lock up (rent: ${money(RENT)})` : 'Lock up and go home'}</button>
    </div>`;
}
ACT.open = () => { const S = G.S; S.phase = 'open'; S.minute = OPEN; arrivals(true); save(); sfx('door'); setScreen(hallScreen()); };
ACT.care = (ds) => {
  const S = G.S, k = S.kennel[+ds.i]; if (!k || k.cared) return;
  if (S.supplies.kibble <= 0) { toast('You are out of kennel care packs. Buy more in the shop.'); return; }
  S.supplies.kibble--; k.cared = true; k.caredLast = true; k.careCount = (k.careCount || 0) + 1; sfx('good'); save(); renderPanel();
};
ACT.iso = (ds) => {
  const S = G.S, k = S.kennel[+ds.i]; if (!k) return;
  if (!k.iso && S.kennel.some((q) => q.iso)) { toast('The isolation crate is already taken.'); return; }
  k.iso = !k.iso; save(); renderPanel();
};
ACT.gohome = () => {
  const S = G.S;
  for (const k of S.kennel) k.cared = false;
  if (S.day === 4) {
    if (S.money >= RENT) { addMoney(-RENT); S.flags.rentPaid = true; toast(`Mr. Grubb counts out ${money(RENT)} and grunts. "Same time next week."`, 4000); }
    else { S.flags.rentShort = RENT - S.money; toast(`You're ${money(RENT - S.money)} short. Mr. Grubb gives you until Monday, "with interest."`, 4000); }
  }
  S.day++; startDay();
  setScreen(S.phase === 'weekend' ? G.weekendScreen() : hubScreen('morning'));
};

/* ================================================================== waiting room (parallax) */
export function hallScreen() {
  const S = G.S;
  const s = {
    kind: 'hall', w: HW, h: HH, fps: 30, canvas: true, cam: 0, sel: 0, hits: [], drag: null,
    enter() { music('day'); ambience(WEEK[S.day].weather === 'rain' ? 'rain' : 'waiting'); },
    draw(ctx, t) {
      const seats = new Array(SEATS).fill(null);
      S.queue.forEach((p, i) => { if (p.seat < SEATS) seats[p.seat] = { owner: p.owner, sp: p.sp, selected: i === s.sel, waitLong: S.minute - p.waitFrom > 90 || p.emergency }; });
      if (!s.drag) { const p = S.queue[s.sel]; const target = p ? seatWorldX(p.seat) / 0.72 : 0; s.cam += (clamp(target, -90, 90) - s.cam) * 0.05; }
      s.hits = renderHall(ctx, t, themeAt(S.minute), { seats, cam: s.cam, rain: WEEK[S.day].weather === 'rain' });
    },
    pointer(type, x, y, p) {
      if (type === 'down') s.drag = { x, cam: s.cam };
      if (type === 'move' && s.drag && p && p.moved) s.cam = clamp(s.drag.cam - (x - s.drag.x) * 1.2, -110, 110);
      if (type === 'up') s.drag = null;
      if (type === 'tap') { const h = s.hits.find((hh) => x >= hh.x0 && x <= hh.x1 && y >= hh.y0 && y <= hh.y1); if (h) { const i = S.queue.findIndex((q) => q.seat === h.k); if (i >= 0) { s.sel = i; sfx('tap'); renderPanel(); } } }
    },
    panel() {
      s.sel = clamp(s.sel, 0, Math.max(0, S.queue.length - 1));
      const closed = S.minute >= CLOSE;
      let html = `<h2>Waiting room</h2>`;
      if (S.queue.length) {
        html += `<p class="fine">Tap a chair or a card to choose who's next. Emergencies won't wait long. ${closed ? 'The doors are closed, but these patients are still waiting.' : ''}</p>`;
        html += S.queue.map((p, i) => {
          const waited = S.minute - p.waitFrom;
          const tags = [p.emergency ? '<span class="tag warn">emergency</span>' : '', p.returning ? '<span class="tag warn">back again</span>' : '', p.petcorp ? '<span class="tag warn">from PetCorp</span>' : '', p.worse ? '<span class="tag warn">getting worse</span>' : '', S.charts[p.chart] ? '<span class="tag">regular</span>' : ''].join(' ');
          return `<div class="card ${i === s.sel ? 'sel' : ''} ${p.emergency ? 'urgent' : ''}" data-act="pick" data-i="${i}"><img class="portrait" src="${portrait(p)}" alt=""><div class="grow"><b>${esc(p.pet)}</b> · ${spName(p.sp)} ${tags}<br><small>${esc(p.owner)} · waiting ${waited} min</small></div>${i === s.sel ? `<button class="primary" data-act="callin" data-i="${i}">Call in</button>` : ''}</div>`;
        }).join('');
        html += `<div class="btns"><button data-act="handbook">Handbook</button><button data-act="closeup" class="ghost">Close early</button></div>`;
      } else if (S.pending.length && !closed) {
        html += `<p>Nobody's waiting. The next patient is due around ${fmt(S.pending[0].arrive)}.</p><div class="btns"><button class="primary" data-act="wait">Wait for them</button><button data-act="shop">Shop</button></div>`;
      } else {
        html += `<p>${closed ? 'It\'s 5:00. Time to close.' : 'No one else is booked today.'}</p><div class="btns"><button class="primary" data-act="closeup">Close up for the day</button></div>`;
      }
      return html;
    },
  };
  return s;
}
ACT.pick = (ds) => { if (G.scr.kind !== 'hall') return; G.scr.sel = +ds.i; renderPanel(); };
ACT.wait = () => { const S = G.S; if (!S.pending.length) return; advance(Math.max(1, S.pending[0].arrive - S.minute)); save(); renderHud(); renderPanel(); };
ACT.callin = (ds) => {
  const S = G.S, p = S.queue[+ds.i]; if (!p) return;
  S.queue.splice(+ds.i, 1); S.minute += 2; sfx('door');
  setScreen(examScreen(p, p.foster ? { after: (res) => { const k = S.kennel.find((q) => q.id === p.foster); if (k && res && res.cured) { k.sick = null; k.treating = false; } G.backToHall(); } } : {}));
};
ACT.closeup = () => {
  const S = G.S;
  if (S.queue.length) {
    if (!G.scr.confirmClose) { G.scr.confirmClose = true; toast(`${S.queue.length} patient${S.queue.length > 1 ? 's are' : ' is'} still waiting. Tap again to send them home (reputation -2 each).`); return; }
    for (const p of S.queue) { addRep(-2); S.today.left++; S.stats.left++; if (S.day < 4) S.returns.push(stripPatient(p)); }
    S.queue = [];
  }
  S.pending = []; S.phase = 'evening'; save(); setScreen(hubScreen('evening'));
};

/* ================================================================== mail, shop, staff */
ACT.mail = () => {
  const S = G.S, list = S.mail.slice().reverse();
  openModal(`<h2>Mail</h2>${list.length ? list.map((m, i) => `<button class="letter ${m.read ? '' : 'new'}" data-act="letter" data-i="${S.mail.length - 1 - i}"><b>${esc(m.subject)}</b><span>${esc(m.from)} · ${WEEK[m.day].name}</span></button>`).join('') : '<p>No mail.</p>'}<div class="btns"><button data-act="close">Close</button></div>`);
};
ACT.letter = (ds) => {
  const S = G.S, m = S.mail[+ds.i]; m.read = true; save(); sfx('page');
  openModal(`<p class="from">From: ${esc(m.from)}</p><h2>${esc(m.subject)}</h2><div class="letter-body">${esc(m.body).split('\n').map((l) => `<p>${l}</p>`).join('')}</div><div class="btns"><button data-act="mail">Back to mail</button><button data-act="close">Close</button></div>`);
  renderPanel();
};
let shopTab = 'supplies';
ACT.shop = (ds) => {
  const S = G.S; if (ds && ds.tab) shopTab = ds.tab;
  const tabs = `<div class="tabs"><button class="tool ${shopTab === 'supplies' ? 'on' : ''}" data-act="shop" data-tab="supplies">Supplies</button><button class="tool ${shopTab === 'equipment' ? 'on' : ''}" data-act="shop" data-tab="equipment">Equipment</button></div>`;
  const body = shopTab === 'supplies'
    ? Object.entries(SUPPLIES).map(([k, v]) => `<div class="row"><span><b>${v.name}</b> · you have ${S.supplies[k]}<br><small>${v.note}</small></span><button data-act="buy" data-k="${k}" ${S.money < v.price ? 'disabled' : ''}>${v.pack} for ${money(v.price)}</button></div>`).join('')
    : Object.entries(EQUIPMENT).map(([k, v]) => `<div class="row"><span><b>${v.name}</b><br><small>${v.note}</small></span>${S.equipment[k] ? '<span class="tag">owned</span>' : `<button data-act="buyeq" data-k="${k}" ${S.money < v.price ? 'disabled' : ''}>${money(v.price)}</button>`}</div>`).join('');
  openModal(`<h2>Shop</h2><p class="fine">Delivered right away. You have <b>${money(S.money)}</b>.</p>${tabs}${body}<div class="btns"><button data-act="close">Done</button></div>`);
};
ACT.buy = (ds) => { const S = G.S, v = SUPPLIES[ds.k]; if (S.money < v.price) return; addMoney(-v.price); S.supplies[ds.k] += v.pack; sfx('cash'); save(); ACT.shop(); renderPanel(); };
ACT.buyeq = (ds) => { const S = G.S, v = EQUIPMENT[ds.k]; if (S.money < v.price || S.equipment[ds.k]) return; addMoney(-v.price); S.equipment[ds.k] = true; sfx('cash'); toast(`${v.name} installed.`); save(); ACT.shop(); renderPanel(); };
ACT.staff = () => {
  const S = G.S;
  openModal(`<h2>Staff</h2><p class="fine">Wages are paid each morning.</p>${Object.entries(STAFF).map(([k, v]) => `<div class="staffcard"><div><b>${v.name}</b>, ${v.role.toLowerCase()} · ${money(v.wage)} a day<br><small>${v.note}</small><p class="fine">${esc(v.bio)}</p></div><button data-act="hire" data-k="${k}" class="${S.staff[k] ? '' : 'primary'}">${S.staff[k] ? 'Let go' : 'Hire'}</button></div>`).join('')}<div class="btns"><button data-act="close">Done</button></div>`);
};
ACT.hire = (ds) => { const S = G.S; S.staff[ds.k] = !S.staff[ds.k]; sfx(S.staff[ds.k] ? 'good' : 'page'); toast(S.staff[ds.k] ? `${STAFF[ds.k].name} starts tomorrow... actually, right now.` : `${STAFF[ds.k].name} packs up.`); save(); ACT.staff(); renderPanel(); };

/* ================================================================== casebook (pre-rendered turnarounds) */
const POLA = new Map();
function polaroid(ph, i) { const key = ph.pet + ph.sp + i; if (!POLA.has(key)) POLA.set(key, polaroidUrl(ph)); return POLA.get(key); }
export function casebookScreen(back) {
  const S = G.S, sps = Object.keys(SPECIES);
  const s = {
    kind: 'casebook', w: TW, h: TH, fps: 12, sp: sps.find((k) => S.seen[k]) || 'gloop', back,
    draw(fb, t) { if (S.seen[s.sp]) renderTurntable(fb, s.sp, t, THEMES.fluoro); else fb.fill([14, 18, 22]); },
    panel() {
      const sp = s.sp, known = S.seen[sp];
      const ails = Object.entries(AILMENTS).filter(([id, a]) => a.sp === sp && (!a.cursed || S.casebook[id]));
      return `<h2>Casebook</h2><div class="tabs">${sps.map((k) => `<button class="tool ${k === sp ? 'on' : ''}" data-act="cbsp" data-k="${k}">${S.seen[k] ? SPECIES[k].name : '???'}</button>`).join('')}</div>
        ${known ? `<p>${SPECIES[sp].blurb}</p><ul class="notes">${ails.map(([id, a]) => `<li>${S.casebook[id] ? `<b>${a.name}</b> · treated` : `<span class="fine">${a.name}: not treated yet${a.torn && !S.pages[id] ? ' (page torn out)' : ''}</span>`}</li>`).join('')}</ul>` : '<p class="fine">You haven\'t examined one of these yet.</p>'}
        <h3>The wall of fame</h3>${S.polaroids.length ? `<div class="wall">${S.polaroids.map((ph, i) => `<figure><img alt="${esc(ph.pet)}" src="${polaroid(ph, i)}"><figcaption>${esc(ph.pet)}<small>${DAYS3[ph.day]}</small></figcaption></figure>`).join('')}</div>` : '<p class="fine">Patients you cure get a photo here.</p>'}
        <div class="btns"><button class="primary" data-act="cbback">Back</button></div>`;
    },
  };
  return s;
}
ACT.casebook = () => setScreen(casebookScreen(G.scr));
ACT.cbsp = (ds) => { G.scr.sp = ds.k; renderPanel(); };
ACT.cbback = () => setScreen(G.scr.back);

/* ================================================================== settings */
ACT.settings = () => {
  const st = getSettings();
  const slider = (k, label) => `<label class="slider"><span>${label}</span><input type="range" min="0" max="1" step="0.05" value="${st[k]}" id="vol-${k}" data-vol="${k}"></label>`;
  openModal(`<h2>Settings</h2>${slider('music', 'Music')}${slider('sfx', 'Sound effects')}${slider('amb', 'Ambience')}
    <div class="btns"><button data-act="mute">${isMuted() ? 'Turn sound on' : 'Mute everything'}</button><button class="primary" data-act="close">Done</button></div>
    <p class="fine">Progress saves automatically between patients.</p>`);
  document.querySelectorAll('[data-vol]').forEach((el) => el.addEventListener('input', () => setVolume(el.dataset.vol, +el.value)));
};
ACT.mute = () => { toggleMute(); closeModal(); renderHud(); };
export { prewarm };
