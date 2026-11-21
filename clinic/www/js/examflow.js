// The exam room: tests, stress, diagnosis, dosing, treatment and the bill.
import { FB, clamp, hash } from './util.js';
import { THEMES, themeAt } from './themes.js';
import { SPECIES, AILMENTS, TREATS, TESTS, SUPPLIES, MEDS, READ, SAMPLE_KEYS, SOUNDS, RECIPES, INGREDIENTS } from './data.js';
import { makePatient, severityOf, treatFor, fmtRead, ZONES_POS } from './patient.js';
import { EW, EH, OX, TOP, renderExam, signAt, findingAt, hasFindings, bodyAt, partAt, bodyPoints, signsOf } from './exam.js';
import { makeMinigame } from './minigames.js';
import { sfx, buzz, knock, heartbeat, music, ambience } from './audio.js';
import { G, ACT, esc, money, fmt, setScreen, renderPanel, renderHud, toast, openModal, closeModal, save, addMoney, addRep } from './core.js';

const spName = (sp) => SPECIES[sp].name;
const OBJ_NAME = { sock: 'sock', keys: 'bunch of keys', spoon: 'spoon', pin: 'bowling pin' };
const XRAY_TEXT = {
  mass: 'A round, soft-edged mass', bubbles: 'Lots of small bubbles', static: 'The picture whites out with static', rootsRot: 'Dark, mushy patches in the roots',
  cloudy: 'Cloudy patches in both lungs', void: 'Nothing at all. The X-ray goes straight through it', embryo: 'A curled-up embryo', big: 'A big, cramped hatchling, ready to go', solid: 'Solid all the way through',
};
const BACK_TEXT = { object: 'A dark, sharp-edged shape inside', mass: 'A soft, round shadow inside', bubbles: 'Lots of bubbles, lit up', split: 'A thin line forming through the middle', void: 'No light gets through at all' };
const CANDLE_TEXT = { still: 'A curled-up shape that doesn\'t move', crack: 'Light leaks through a thin line. The shape inside moves', thin: 'Blotchy bright patches in the shell. The shape inside moves', solid: 'No light gets through. Solid', big: 'A big shape fills the egg, wriggling', healthy: 'A curled-up shape that moves now and then' };
const ROOTS_TEXT = { rot: 'Dark, mushy roots that smell bad', threads: 'White threads woven through the roots', dry: 'Dry, brittle roots', healthy: 'Pale, healthy roots' };
const UNDER_TEXT = { mites: 'Tiny mites on the undersides of the leaves', blackspots: 'Black spots on the undersides of the leaves' };
const TANTRUM = {
  gloop: 'splits in two and slides off the table. It takes ten minutes to coax both halves back together.',
  cat: 'shocks you. Your hair stands on end. Ten minutes to calm everyone down.',
  fern: 'wilts flat and refuses to move for ten minutes.',
  moth: 'bolts for the lamp and won\'t come down for ten minutes.',
  pebble: 'rolls off the cushion. You catch it, barely. Ten minutes of everyone breathing.',
};
const PER_SPECIES_TESTS = (sp) => [...SPECIES[sp].free, ...SPECIES[sp].paid];
export const bodyColor = (sp, th) => sp === 'gloop' ? th.slime : sp === 'cat' ? th.cat : sp === 'fern' ? [92, 168, 86] : sp === 'moth' ? [158, 124, 92] : th.egg;

function stressMult() { const S = G.S; let m = 1; if (S.staff.dee) m *= 0.7; if (S.equipment.heatlamp) m *= 0.75; return m; }
function addStress(s, n) {
  const p = s.p; p.stress = clamp(p.stress + n * stressMult() * (s.tonic ? 0.5 : 1), 0, 100);
  if (p.stress >= 100) {
    s.tantrums++; p.stress = 55; G.S.minute += 10; addRep(-1); sfx('stress'); buzz(80);
    toast(`${p.pet} ${TANTRUM[p.sp]}`, 4200);
  }
}
const note = (s, k, t) => { const i = s.notes.findIndex((n) => n.k === k); if (i >= 0) s.notes[i].t = t; else s.notes.push({ k, t }); };

// opts: { room, theme, after(result), houseCall, cursed }
export function examScreen(p, opts = {}) {
  const S = G.S, A = AILMENTS[p.ail];
  S.seen[p.sp] = true;
  const th = opts.theme || (opts.cursed ? THEMES.cursed : themeAt(S.minute));
  const s = {
    kind: 'exam', w: EW, h: EH, fps: 30, p, th, opts, keepScroll: true,
    tool: 'look', lampX: OX - 30, lampY: 22, mode: null, dim: false, spin: 0,
    found: new Set(), flipped: new Set(), voltRead: {}, notes: [], used: {}, stage: 'exam', jig: null, particles: [], stroke: 0, tantrums: 0,
    tut: p.tutorial && !S.flags.tutDone ? 0 : -1, tonic: false,
    enter() { music(opts.cursed ? 'cursed' : 'exam'); ambience(opts.cursed ? 'cursed' : 'clinic'); },
    update(dt) {
      for (const q of s.particles) { q.life -= dt; q.y += q.vy * dt; q.x += q.vx * dt; }
      s.particles = s.particles.filter((q) => q.life > 0);
      if (s.stage !== 'exam') return;
      // a Light-drinker gets agitated under the lamp; some calm down on their own
      if (p.ail === 'void' && !s.dim && s.tool === 'look') { s.voidT = (s.voidT || 0) + dt; if (s.voidT > 1) { s.voidT = 0; addStress(s, 3); renderPanelThrottled(s); } }
      if (s.jig && !s.used.jiggleLogged && G.clock - s.jig.t0 > 3) { s.used.jiggleLogged = true; note(s, 'jiggle', `Wobble time: ${p.R.jiggle} s`); renderPanel(); }
    },
    draw(fb, t) {
      s.parts = renderExam(fb, { p, t, th, lampX: s.lampX, lampY: s.lampY, mode: s.mode, dim: s.dim, found: s.found, flipped: s.flipped, spin: s.spin, room: opts.room || 'clinic', jig: s.jig, particles: s.particles, stress: p.stress, voltRead: s.voltRead });
    },
    pointer(type, x, y, ptr) { examPointer(s, type, x, y, ptr); },
    panel() { return examPanel(s); },
  };
  if (S.staff.dee && !opts.cursed) {
    note(s, 'temp', `Temperature: ${fmtRead(p, 'temp')} (Dee took it)`); note(s, 'weigh', `Weight: ${fmtRead(p, 'wt')} (Dee weighed it)`);
    s.used.temp = s.used.weigh = true;
  }
  if (S.remedies.chalkball > 0) s.offerTonic = true;
  return s;
}
let lastPanel = 0;
function renderPanelThrottled() { const n = performance.now(); if (n - lastPanel > 500) { lastPanel = n; renderPanel(); } }

function examPointer(s, type, x, y, ptr) {
  const p = s.p, S = G.S;
  if (s.stage !== 'exam') return;
  const lampTool = s.tool === 'look' || s.tool === 'flip' || s.tool === 'volt';
  if (lampTool && !s.mode && (type === 'move' || type === 'down')) { if (type === 'down' || ptr || matchMedia('(hover: hover)').matches) { s.lampX = clamp(x, 6, EW - 6); s.lampY = clamp(y - 22, 4, 60); } }
  if (lampTool && s.mode === 'volt' && (type === 'move' || type === 'down') && (ptr || type === 'down')) { s.lampX = clamp(x, 6, EW - 6); s.lampY = clamp(y - 22, 4, 60); }
  if (s.tool === 'turn' && type === 'move' && ptr) s.spin += (x - ptr.lx) * 0.06;
  if (s.tool === 'stroke' && type === 'move' && ptr && bodyAt(x, y)) {
    const d = Math.hypot(x - ptr.lx, y - ptr.ly); s.stroke += d;
    const rate = (p.R.sparks || 0) / 60;
    if (Math.random() < rate * d) s.particles.push({ x, y, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 30, life: 0.35, kind: 'spark' });
    if (rate > 0.15 && Math.random() < 0.02) sfx('zap');
    if (s.stroke > 70 && !s.used.strokeLogged) { s.used.strokeLogged = true; useTest(s, 'stroke'); note(s, 'stroke', `Stroke test: ${p.R.sparks} sparks per stroke`); if (p.R.sparks > 10) sfx('crackle'); renderPanel(); }
  }
  if (type !== 'tap') return;
  // taps
  if (s.tool === 'look' && !s.mode) {
    const k = signAt(p, x, y, 4);
    if (k && !s.found.has(k)) {
      const sg = signsOf(p).find((q) => q.kind === k);
      s.found.add(k); note(s, 'sign:' + k, `Seen: ${sg.text}.`); sfx('clue'); buzz(15); toast(`Found: ${sg.text}`);
      if (s.tut === 0) s.tut = 1; renderPanel();
    } else if (!k && bodyAt(x, y)) toast('Nothing unusual there. Move the lamp closer to other spots.');
    return;
  }
  if (s.tool === 'listen' && bodyAt(x, y)) {
    const zones = Object.keys(SPECIES[p.sp].zones), zone = zones.length === 1 ? zones[0] : (p.sp === 'fern' ? (y < TOP - 16 ? 'stem' : 'pot') : (y < TOP - 18 ? 'chest' : 'belly'));
    const snd = p.sounds[zone];
    if (snd === 'beat' || snd === 'racing' || snd === 'faint' || snd === 'flutter') heartbeat(p.R.hr); else sfx(snd === 'sap' ? 'heart' : snd === 'gurgle' ? 'squelch' : snd === 'quiet' ? 'page' : snd);
    const bpm = S.equipment.stetho && /beat|racing|faint|flutter/.test(snd) && p.R.hr ? ` (${p.R.hr} bpm)` : '';
    if (!s.used['listen:' + zone]) { s.used['listen:' + zone] = true; useTest(s, 'listen'); if (s.tut === 1) s.tut = 2; }
    note(s, 'listen:' + zone, `Listen (${zone}): ${SOUNDS[snd]}${bpm}`);
    renderHud(); renderPanel(); return;
  }
  if (s.tool === 'jiggle' && bodyAt(x, y)) { s.jig = { t0: G.clock, period: p.R.jiggle }; if (!s.used.jiggle) useTest(s, 'jiggle'); sfx('squelch'); return; }
  if (s.tool === 'tap' && bodyAt(x, y)) { knock(p.R.pitch); if (!s.used.tap) useTest(s, 'tap'); note(s, 'tap', `Knock: ${p.R.pitch} Hz`); renderPanel(); return; }
  if (s.tool === 'flip') {
    const pt = partAt(s.parts, x, y);
    if (pt && pt.leaf != null) {
      if (!s.used.flip) useTest(s, 'flip');
      s.flipped.has(pt.leaf) ? s.flipped.delete(pt.leaf) : s.flipped.add(pt.leaf); sfx('page');
      if (s.flipped.size >= 2) note(s, 'flip', `Leaf undersides: ${UNDER_TEXT[p.under] || 'clean'}`);
      renderPanel();
    }
    return;
  }
  if (s.mode === 'volt' && p.sp === 'cat') {
    let best = null, bd = 9;
    for (const [z, [zx, zy]] of Object.entries(ZONES_POS.cat)) { const d = Math.hypot(x - (OX + zx), y - (TOP + zy)); if (d < bd) { bd = d; best = z; } }
    if (best) {
      const v = p.volts[best]; s.voltRead[best] = v; sfx('thermo'); addStress(s, 2);
      if (v > 60 || v < -10) { sfx('shock'); buzz(60); addStress(s, 8); toast(`Zap! ${v} V at the ${best}.`); }
      note(s, 'volt', `Fur voltage: ${Object.entries(s.voltRead).map(([z, vv]) => `${z} ${vv} V`).join(', ')}`); renderPanel();
    }
    return;
  }
  if (s.mode === 'xray' || s.mode === 'backlight' || s.mode === 'candle' || s.mode === 'unpot') {
    if (findingAt(x, y, 3)) { logFinding(s, s.mode); sfx('clue'); renderPanel(); }
    return;
  }
}
function logFinding(s, mode, none) {
  const p = s.p, A = AILMENTS[p.ail];
  let t;
  if (mode === 'xray') t = none ? 'Nothing unusual' : A.xray === 'object' ? `A sharp-edged ${OBJ_NAME[p.obj] || 'object'} in the middle` : A.xray === 'hairball' ? (p.ball === 'large' ? 'A large, tangled hairball filling the stomach' : 'A small ball of fur in the stomach') : XRAY_TEXT[A.xray] || 'Nothing unusual';
  if (mode === 'backlight') t = none ? 'Clear all the way through' : BACK_TEXT[A.backlight] || 'Clear all the way through';
  if (mode === 'candle') t = CANDLE_TEXT[A.candle || 'healthy'];
  if (mode === 'unpot') t = ROOTS_TEXT[A.roots || 'healthy'];
  const label = { xray: 'X-ray', backlight: 'Backlight', candle: 'Candling', unpot: 'Roots' }[mode];
  note(s, mode, `${label}: ${t}.`);
}
function useTest(s, k) {
  const T = TESTS[k]; s.used[k] = true;
  if (T.min) G.S.minute += T.min;
  addStress(s, T.stress);
}
function stressBar(p) {
  const v = Math.round(p.stress), c = v > 80 ? 'hot' : v > 55 ? 'warm' : '';
  return `<div class="stress ${c}" title="How stressed the patient is"><span>Stress</span><div class="bar"><i style="width:${v}%"></i></div><b>${v}</b></div>`;
}

function examPanel(s) {
  const S = G.S, p = s.p, A = AILMENTS[p.ail];
  if (s.stage === 'result') return s.resultHtml;
  const sp = p.sp, spTests = PER_SPECIES_TESTS(sp);
  const handTools = [['look', 'Look'], ['listen', 'Listen'], ...(sp === 'pebble' ? [['turn', 'Turn']] : []), ...spTests.filter((k) => TESTS[k].free).map((k) => [k, TESTS[k].name]), ['dim', s.dim ? 'Lights up' : 'Dim lights']];
  const tests = ['temp', 'weigh', 'xray', 'sample', 'mood', ...spTests.filter((k) => !TESTS[k].free)];
  const sub = (k) => { const T = TESTS[k]; if (k === 'xray' && S.equipment.digital) return 'digital'; if (T.uses) return `${SUPPLIES[T.uses].name.toLowerCase()} ${S.supplies[T.uses]}`; if (T.cost) return money(T.cost); return `${T.min} min`; };
  const isOn = (k) => s.tool === k || (TESTS[k] && TESTS[k].mode && s.mode === (k === 'volt' ? 'volt' : k)) || (k === 'xray' && s.mode === 'xray') || (k === 'dim' && s.dim);
  const hints = [
    'Drag across the patient to move the lamp. Signs only show up where the light is close. Tap anything odd.',
    'Good. Now choose Listen and tap different parts of the patient. Each spot can sound different.',
    'Signs overlap between illnesses. Use a test or two to tell them apart (the Handbook has the normal ranges), then tap Diagnose. Every test stresses the patient a little.',
  ];
  const chart = (S.charts[p.chart] || []);
  const fibTag = S.staff.marco && p.fib ? '<p class="hint warn">Marco leans in: "I don\'t think they\'re telling you everything."</p>' : '';
  const findBtn = (s.mode === 'xray' || s.mode === 'backlight') && !s.notes.find((n) => n.k === s.mode) ? `<button class="small" data-act="nofind">Log: nothing unusual</button>` : '';
  return `<div class="owner"><img class="portrait" src="${portrait(p)}" alt=""><div><b>${esc(p.owner)}</b> with <b>${esc(p.pet)}</b> <span class="tag">${spName(p.sp)}</span>${p.emergency ? ' <span class="tag warn">emergency</span>' : ''}<p>“${esc(p.say)}”</p></div></div>
    ${fibTag}
    ${chart.length ? `<details class="chart"><summary>Chart: ${chart.length} earlier visit${chart.length > 1 ? 's' : ''}</summary>${chart.map((c) => `<div>${c.day}: ${esc(c.text)}</div>`).join('')}</details>` : ''}
    ${s.tut >= 0 && s.tut < 3 ? `<p class="hint">${hints[s.tut]}</p>` : ''}
    ${stressBar(p)}
    <div class="toolgroup"><span class="glabel">Hands</span><div class="tools">${handTools.map(([k, n]) => `<button class="tool ${isOn(k) ? 'on' : ''}" data-act="tool" data-k="${k}">${n}</button>`).join('')}</div></div>
    <div class="toolgroup"><span class="glabel">Tests</span><div class="tools">${tests.map((k) => `<button class="tool ${s.used[k] ? 'used' : ''} ${isOn(k) ? 'on' : ''}" data-act="test" data-k="${k}">${TESTS[k].name}<small>${sub(k)}</small></button>`).join('')}</div></div>
    ${findBtn ? `<div class="btns">${findBtn}</div>` : ''}
    <h3>Notes</h3>
    <ul class="notes">${s.notes.length ? s.notes.map((n) => `<li>${esc(n.t)}</li>`).join('') : '<li class="fine">Nothing yet.</li>'}</ul>
    <div class="btns">${s.offerTonic ? '<button data-act="tonic">Give dust tonic</button>' : ''}<button data-act="soothe">Soothe (4 min)</button><button data-act="handbook">Handbook</button><button class="primary" data-act="diagnose">Diagnose</button></div>`;
}

/* ---------- portraits for cards and the exam header ---------- */
const PORTRAITS = new Map();
export function portrait(p, healthy) {
  const key = (p.uid || p.pet) + (healthy ? 'h' : '') + p.sp;
  if (PORTRAITS.has(key)) return PORTRAITS.get(key);
  const fb = new FB(EW, EH);
  const pp = healthy ? { ...p, signs: [], ail: { gloop: 'swallowed', cat: 'hairball', fern: 'mites', moth: 'wingmites', pebble: 'cracked' }[p.sp], stress: 0 } : p;
  renderExam(fb, { p: pp, t: 1.3, th: THEMES.fluoro, lampX: OX - 8, lampY: 20, mode: null, found: new Set(), spin: 0.6, room: 'clinic', noLamp: true, happy: healthy, stress: 0 });
  const c = document.createElement('canvas'); c.width = 56; c.height = 56; const x = c.getContext('2d');
  const src = document.createElement('canvas'); src.width = EW; src.height = EH; src.getContext('2d').putImageData(fb.img, 0, 0);
  x.imageSmoothingEnabled = false; x.drawImage(src, OX - 28, TOP - 54, 56, 56, 0, 0, 56, 56);
  const url = c.toDataURL(); PORTRAITS.set(key, url); return url;
}
export function polaroidUrl(ph) {
  const fb = new FB(EW, EH);
  const p = makePatient({ ail: { gloop: 'swallowed', cat: 'hairball', fern: 'mites', moth: 'wingmites', pebble: 'cracked' }[ph.sp], pet: ph.pet, owner: '' }, 5);
  p.signs = []; p.stress = 0;
  renderExam(fb, { p, t: 1.2 + (ph.pet.length % 5), th: ph.night ? THEMES.night : THEMES.fluoro, lampX: OX - 10, lampY: 18, found: new Set(), spin: 0.6, room: ph.room || 'clinic', happy: true, stress: 0 });
  const c = document.createElement('canvas'); c.width = EW; c.height = EH; c.getContext('2d').putImageData(fb.img, 0, 0);
  return c.toDataURL();
}

/* ---------- tools and tests ---------- */
ACT.tool = (ds) => {
  const s = G.scr; if (s.kind !== 'exam') return; const k = ds.k;
  if (k === 'dim') { s.dim = !s.dim; sfx('thud'); toast(s.dim ? 'You turn the room lights down.' : 'Lights back up.'); renderPanel(); return; }
  if (k === 'backlight' || k === 'candle' || k === 'volt' || k === 'flip') {
    const mode = k === 'flip' ? null : k;
    if (s.mode === mode && mode) { s.mode = null; s.tool = 'look'; renderPanel(); return; }
    s.mode = mode; s.tool = k;
    if (!s.used[k]) useTest(s, k);
    toast({ backlight: 'The lamp goes behind it. Tap anything you see inside.', candle: 'You hold it up to the light. Tap what you see inside.', volt: 'Tap a probe point to read the voltage there. Careful with hot spots.', flip: 'Tap leaves to flip them over.' }[k]);
    renderHud(); renderPanel(); return;
  }
  if (k === 'breath') return runBreath(s);
  if (k === 'probe') return ACT.test({ k: 'probe' });
  s.tool = k; s.mode = null;
  toast({ look: 'Drag to move the lamp. Tap anything that looks wrong.', listen: 'Tap the patient to listen. Different spots sound different.', turn: 'Drag sideways to turn it.', jiggle: 'Tap it to give it a poke, then watch the wobble.', tap: 'Tap the shell to knock on it.', stroke: 'Stroke the fur by dragging across it.' }[k] || '');
  renderPanel();
};
ACT.test = (ds) => {
  const s = G.scr, S = G.S; if (s.kind !== 'exam') return; const p = s.p, k = ds.k, T = TESTS[k];
  if (k === 'xray' && s.used.xray) { s.mode = s.mode === 'xray' ? null : 'xray'; s.tool = 'look'; renderPanel(); return; }
  if (k === 'unpot' && s.used.unpot) { s.mode = s.mode === 'unpot' ? null : 'unpot'; s.tool = 'look'; renderPanel(); return; }
  if (s.used[k] && k !== 'ph') { const n = s.notes.find((q) => q.k === k); if (n) toast(n.t); return; }
  const usesFilm = k === 'xray' && S.equipment.digital ? null : T.uses;
  if (usesFilm && S.supplies[usesFilm] <= 0) { toast(`You're out of ${SUPPLIES[usesFilm].name.toLowerCase()}. Order more from the clinic screen.`); return; }
  if (T.cost && S.money < T.cost) { toast('Not enough money.'); return; }
  if (usesFilm) S.supplies[usesFilm]--;
  if (T.cost) addMoney(-T.cost);
  useTest(s, k);
  if (k === 'temp') { note(s, 'temp', `Temperature: ${fmtRead(p, 'temp')}`); sfx('thermo'); }
  if (k === 'weigh') { note(s, 'weigh', `Weight: ${fmtRead(p, 'wt')}`); sfx('thermo'); }
  if (k === 'xray') { s.mode = 'xray'; s.tool = 'look'; sfx('xray'); toast('Tap anything unusual on the X-ray, or log that it looks normal.'); }
  if (k === 'sample') { note(s, 'sample', `Sample: ${SAMPLE_KEYS[p.sp].map((q) => `${READ[q].name} ${fmtRead(p, q)}`).join(', ')}`); sfx('page'); }
  if (k === 'mood') { note(s, 'mood', `Mood scan: ${AILMENTS[p.ail].mood}`); sfx('clue'); }
  if (k === 'probe') { note(s, 'probe', `Soil moisture: top ${p.soil.top}%, middle ${p.soil.mid}%, roots ${p.soil.root}%`); sfx('squelch'); }
  if (k === 'unpot') { s.mode = 'unpot'; s.tool = 'look'; sfx('page'); toast('You ease it out of the pot. Tap the roots.'); }
  if (k === 'ph') return phStrip(s);
  if (k === 'slide') return wingSlide(s);
  renderHud(); renderPanel();
};
ACT.nofind = () => { const s = G.scr; if (s.kind !== 'exam') return; logFinding(s, s.mode, true); renderPanel(); };
ACT.soothe = () => { const s = G.scr; if (s.kind !== 'exam') return; G.S.minute += 4; s.p.stress = Math.max(0, s.p.stress - 25); sfx('heart'); toast(`You talk softly to ${s.p.pet} for a few minutes.`); renderHud(); renderPanel(); };
ACT.tonic = () => { const s = G.scr; if (s.kind !== 'exam' || G.S.remedies.chalkball <= 0) return; G.S.remedies.chalkball--; s.tonic = true; s.offerTonic = false; s.p.stress = 0; sfx('brew'); toast('Dust tonic: tests will stress it half as much.'); renderPanel(); };

function phStrip(s) {
  const v = s.p.R.ph, colors = [[1, '#e2343a'], [3, '#f2762e'], [5, '#f2c12e'], [7, '#7fc84a'], [9, '#2e9bd2'], [11, '#3a4fc2'], [13, '#6a2ea8']];
  const near = colors.reduce((a, c) => (Math.abs(c[0] - v) < Math.abs(a[0] - v) ? c : a));
  const mixc = (a, b, t) => '#' + [0, 2, 4].map((i) => Math.round(parseInt(a.slice(1 + i, 3 + i), 16) * (1 - t) + parseInt(b.slice(1 + i, 3 + i), 16) * t).toString(16).padStart(2, '0')).join('');
  const idx = colors.indexOf(near), nb = colors[Math.min(colors.length - 1, Math.max(0, idx + (v > near[0] ? 1 : -1)))];
  const stripC = mixc(near[1], nb[1], Math.min(1, Math.abs(v - near[0]) / 2) * 0.5);
  openModal(`<h2>pH strip</h2><p>The strip has turned this color:</p><div class="strip" style="background:${stripC}"></div><p class="fine">Tap the closest color on the chart.</p>
    <div class="phchart">${colors.map(([n, c]) => `<button class="sw" style="background:${c}" data-act="phpick" data-v="${n}">${n}</button>`).join('')}</div>`);
}
ACT.phpick = (ds) => { const s = G.scr; closeModal(); note(s, 'ph', `pH strip: about ${ds.v}`); renderPanel(); };
function wingSlide(s) {
  const p = s.p, eggs = p.R.eggs, dust = p.R.dustc, old = AILMENTS[p.ail].slideScales;
  const c = document.createElement('canvas'); c.width = 120; c.height = 120; const x = c.getContext('2d');
  x.fillStyle = '#f2ecd8'; x.beginPath(); x.arc(60, 60, 58, 0, 7); x.fill();
  for (let k = 0; k < 40; k++) { const a = hash(k, 1) * 6.28, r = hash(k, 2) * 52; x.fillStyle = old && k % 3 === 0 ? '#8a7c66' : '#c8b896'; x.fillRect(60 + Math.cos(a) * r, 60 + Math.sin(a) * r, 5, 3); }
  for (let k = 0; k < eggs; k++) { const a = hash(k, 5) * 6.28, r = hash(k, 6) * 50; x.fillStyle = '#fffaf0'; x.beginPath(); x.ellipse(60 + Math.cos(a) * r, 60 + Math.sin(a) * r, 2.5, 1.6, a, 0, 7); x.fill(); x.strokeStyle = '#a08060'; x.stroke(); }
  for (let k = 0; k < dust; k++) { const a = hash(k, 8) * 6.28, r = hash(k, 9) * 50; x.fillStyle = '#7a7268'; x.beginPath(); x.arc(60 + Math.cos(a) * r, 60 + Math.sin(a) * r, 2 + hash(k, 3) * 2, 0, 7); x.fill(); }
  const parts = [`${eggs} mite egg${eggs === 1 ? '' : 's'}`, `${dust} dust clump${dust === 1 ? '' : 's'}`, old ? 'lots of old, dull scales' : 'normal scales'];
  note(s, 'slide', `Wing slide: ${parts.join(', ')}`);
  openModal(`<h2>Wing slide</h2><img class="slide" src="${c.toDataURL()}" alt="Microscope view of the wing dust"><p>You count ${parts.join(', ')}.</p><div class="btns"><button class="primary" data-act="close">Done</button></div>`);
  renderPanel();
}
function runBreath(s) {
  const p = s.p, prev = G.scr;
  const g = makeMinigame('breath', { th: s.th, rate: p.R.breath, sfx, buzz });
  setScreen(minigameScreen(g, { name: 'Count breaths', how: 'Watch the belly. Tap every time it breathes in. You have ten seconds.' }, () => {
    setScreen(prev); useTest(prev, 'breath'); note(prev, 'breath', `Breathing: ${g.taps * 6}/min (you counted ${g.taps} in 10 s)`); renderPanel();
  }, true));
}

/* ---------- diagnosis ---------- */
function pageText(id, a) {
  const S = G.S;
  if (a.torn && !S.pages[id] && !S.casebook[id]) return '<i>This page is torn out of the handbook.</i>';
  return a.book;
}
ACT.diagnose = () => {
  const s = G.scr; if (s.kind !== 'exam') return; const p = s.p;
  const opts = Object.entries(AILMENTS).filter(([, a]) => a.sp === p.sp && !a.cursed);
  openModal(`<h2>Diagnose ${esc(p.pet)}</h2><p class="fine">Pick the condition that matches your notes.</p>
    <ul class="notes">${s.notes.map((n) => `<li>${esc(n.t)}</li>`).join('') || '<li class="fine">You haven\'t found anything yet. A guess is risky.</li>'}</ul>
    ${opts.map(([id, a]) => `<button class="dx" data-act="dx" data-id="${id}"><b>${a.name}</b><span>${pageText(id, a)}</span></button>`).join('')}
    <button class="dx" data-act="dx" data-id="unknown"><b>Something not in the handbook</b><span>None of these fit. You'll have to work out a treatment yourself.</span></button>
    <div class="btns"><button data-act="close">Keep examining</button></div>`);
};
ACT.dx = (ds) => {
  const s = G.scr; if (s.kind !== 'exam') return;
  s.dx = ds.id; G.S.flags.tutDone = true; s.tut = -1;
  if (ds.id === 'unknown') {
    openModal(`<h2>Choose a treatment</h2><p class="fine">No handbook entry. What does your gut say?</p>
      ${Object.entries(TREATS).filter(([k]) => !['tell', 'admit'].includes(k)).map(([k, t]) => `<button class="dx" data-act="dxtreat" data-k="${k}"><b>${t.name}</b><span>${t.how}</span></button>`).join('')}`);
    return;
  }
  const D = AILMENTS[ds.id];
  if (severityOf(D) && treatFor(D, 'm') !== treatFor(D, 's')) {
    openModal(`<h2>How bad is it?</h2><p>${D.name}. ${pageText(ds.id, D)}</p>
      <button class="dx" data-act="dxsev" data-v="m"><b>Mild</b><span>Treatment: ${TREATS[treatFor(D, 'm')].name}</span></button>
      <button class="dx" data-act="dxsev" data-v="s"><b>Severe</b><span>Treatment: ${TREATS[treatFor(D, 's')].name}</span></button>
      <div class="btns"><button data-act="diagnose">Back</button></div>`);
    return;
  }
  s.dxSev = severityOf(D) ? (D.sev ? null : 'm') : null; s.treat = treatFor(D, 'm');
  treatModal(s);
};
ACT.dxsev = (ds) => { const s = G.scr; s.dxSev = ds.v; s.treat = treatFor(AILMENTS[s.dx], ds.v); treatModal(s); };
ACT.dxtreat = (ds) => { const s = G.scr; s.treat = ds.k; s.dxSev = null; treatModal(s); };

/* ---------- treatment: supplies, dose, remedies ---------- */
const REMEDY_FOR = { calm: 'tea', zap: 'salve', hotspot: 'salve', wet: 'gel' };
function treatModal(s) {
  const S = G.S, p = s.p, tr = TREATS[s.treat], D = AILMENTS[s.dx] || {}, uses = tr.uses;
  const out = uses && S.supplies[uses] <= 0;
  const rem = REMEDY_FOR[s.treat], hasRem = rem && S.remedies[rem] > 0, ward = s.treat === 'pill' && S.remedies.ward > 0;
  let dose = '';
  if (s.treat === 'pill') {
    const med = MEDS[D.med] || { name: 'Medicine', mgkg: 50 }, kg = p.sp === 'pebble' ? p.R.wt / 1000 : p.R.wt;
    const right = Math.max(10, Math.round(med.mgkg * kg / 10) * 10), mults = [0.5, 1, 1.5, 2];
    const order = mults.map((m, i) => ({ m, k: hash(p.uid || 1, i, 4) })).sort((a, b) => a.k - b.k);
    const known = s.used.weigh;
    dose = `<h3>Dose: ${med.name}, ${med.mgkg} mg per kg</h3><p class="fine">${known ? `You weighed it: ${fmtRead(p, 'wt')}.` : 'You haven\'t weighed it. You can guess, or go back and use the scale.'}</p>
      <div class="doses">${order.map(({ m }) => `<label><input type="radio" name="dose" value="${m}" ${m === 1 && known ? '' : ''}> ${Math.round(right * m / 10) * 10} mg</label>`).join('')}</div>`;
  }
  openModal(`<h2>${tr.name}</h2><p>${tr.how}</p>
    ${uses ? `<p class="${out ? 'warn' : 'fine'}">Uses 1 ${SUPPLIES[uses].name.toLowerCase()} (you have ${S.supplies[uses]}).</p>` : ''}
    ${dose}
    ${hasRem ? `<label class="check"><input type="checkbox" id="use-rem" checked> Use ${RECIPES.find((r) => r.id === rem).name} (you have ${S.remedies[rem]}): ${RECIPES.find((r) => r.id === rem).note}</label>` : ''}
    ${ward ? `<label class="check"><input type="checkbox" id="use-ward" ${out ? 'checked' : ''}> Use Spore ward instead of a pill (you have ${S.remedies.ward})</label>` : ''}
    ${out && !ward ? '<p class="warn">You\'re out. You can try without (it probably won\'t work well), or send them across the street to PetCorp.</p>' : ''}
    <div class="btns"><button data-act="refer">Send to PetCorp</button><button data-act="diagnose">Back</button><button class="primary" data-act="treat">Start</button></div>`);
}
ACT.refer = () => {
  closeModal(); const s = G.scr; addRep(-2); G.S.today.seen++; toast(`${s.p.owner} heads across the street to PetCorp.`);
  G.S.minute += 5; save(); done(s, { referred: true });
};
ACT.treat = () => {
  const s = G.scr, S = G.S, p = s.p, tr = TREATS[s.treat];
  const doseEl = document.querySelector('input[name="dose"]:checked'), remEl = document.getElementById('use-rem'), wardEl = document.getElementById('use-ward');
  if (s.treat === 'pill' && !doseEl) { toast('Pick a dose first.'); return; }
  s.dose = doseEl ? +doseEl.value : 1;
  const useWard = wardEl && wardEl.checked;
  let cap = 1;
  if (tr.uses) { if (useWard && tr.uses === 'pills') { S.remedies.ward--; } else if (S.supplies[tr.uses] > 0) S.supplies[tr.uses]--; else cap = 0.25; }
  s.bonus = false;
  if (remEl && remEl.checked) { const r = REMEDY_FOR[s.treat]; S.remedies[r]--; s.bonus = true; if (r === 'tea') p.stress = Math.max(0, p.stress - 20); }
  closeModal();
  if (s.treat === 'admit') return admit(s);
  if (s.treat === 'tell') return tellModal(s);
  const th = s.th, fb = new FB(EW, EH);
  renderExam(fb, { p, t: G.clock, th, lampX: OX, lampY: 24, mode: null, dim: s.dim, found: new Set(), spin: s.spin, room: s.opts.room || 'clinic', noLamp: true, stress: 0 });
  const points = bodyPoints(60, p.uid || 3);
  const hot = p.hot && ZONES_POS.cat[p.hot] ? [OX + ZONES_POS.cat[p.hot][0], TOP + ZONES_POS.cat[p.hot][1]] : [OX, TOP - 20];
  const hard = (p.sev === 's' && s.dx === p.ail) || p.stress > 80;
  const env = { bg: fb.img, th, sp: p.sp, kind: /mites/.test(s.dx) ? 'mites' : 'sparks', obj: p.ail === 'hairball' ? 'hairball' : p.obj, points, body: bodyColor(p.sp, th), sfx, buzz,
    hard, bonus: s.bonus, hotspot: s.treat === 'hotspot' ? hot : null, variant: p.ail === 'shadow' ? 'shadow' : null, dark: s.dim };
  const g = makeMinigame(s.treat, env);
  setScreen(minigameScreen(g, tr, (score) => { setScreen(s); finishTreatment(s, Math.min(score, cap)); }));
};
function tellModal(s) {
  const p = s.p;
  openModal(`<h2>Break the news</h2><p>${esc(p.owner)} is holding ${esc(p.pet)} very carefully.</p>
    <button class="dx" data-act="tell" data-v="gentle"><b>Gently explain.</b><span>“I'm sorry. ${esc(p.pet)} is a rock. A very good one.”</span></button>
    <button class="dx" data-act="tell" data-v="egg"><b>Tell them it's a very slow egg.</b><span>They'll be happy, and they'll pay.</span></button>
    <button class="dx" data-act="tell" data-v="blunt"><b>Just say it.</b><span>“That's a rock.”</span></button>`, 'sticky');
}
ACT.tell = (ds) => {
  closeModal(); const s = G.scr;
  if (ds.v === 'egg') { G.S.integrity--; s.lie = true; return finishTreatment(s, 0.6); }
  return finishTreatment(s, ds.v === 'gentle' ? 1 : 0.5);
};
function admit(s) {
  const S = G.S, p = s.p, cap = 3 + (S.equipment.isolation ? 1 : 0);
  if (S.kennel.length >= cap) { toast('The kennels are full.'); treatModal(s); return; }
  const A = AILMENTS[p.ail];
  let need = p.ail === 'cold' ? (p.sev === 's' ? 3 : 2) : 1;
  if (S.equipment.incubator && p.sp === 'pebble') need = Math.max(1, need - 1);
  S.kennel.push({ uid: p.uid, pet: p.pet, sp: p.sp, owner: p.owner, ail: p.ail, dx: s.dx, sev: p.sev, correct: s.dx === p.ail && treatFor(A, p.sev) === 'admit', need, nights: 0, careCount: 0, cared: false, tobi: p.id === 'pebs', contagious: !!A.contagious, iso: false });
  finishTreatment(s, 1);
}

/* ---------- mini-game screen ---------- */
export function minigameScreen(g, tr, cb, quiet) {
  let after = 0, fired = false;
  return {
    kind: 'game', w: EW, h: EH, fps: 60, canvas: true, g,
    enter() { if (!quiet) music('game'); },
    update(dt) { if (!g.done) g.update(dt); else { after += dt; if (after > (quiet ? 0.2 : 1.1) && !fired) { fired = true; cb(g.score); } } },
    draw(ctx) { g.draw(ctx); },
    pointer(type, x, y) { if (!g.done && type !== 'tap') g.pointer(type, x, y); },
    panel() { return `<h2>${tr.name}</h2><p>${tr.how}</p><p class="fine">Use your finger or mouse on the picture above.</p>`; },
  };
}

/* ---------- outcome and billing ---------- */
function finishTreatment(s, score) {
  const S = G.S, p = s.p, A = AILMENTS[p.ail];
  music(s.opts.cursed ? 'cursed' : 'exam');
  S.minute += 15; S.today.seen++;
  // dosing and stress change how well it works
  if (s.treat === 'pill') score *= s.dose === 1 ? 1 : s.dose === 0.5 ? 0.5 : s.dose === 1.5 ? 0.8 : 0.4;
  if (s.dose === 2) addRep(-3);
  score *= 1 - Math.max(0, p.stress - 60) / 200;
  const correctAil = s.dx === p.ail || (s.dx === 'unknown' && A.cursed && s.treat === A.treat && (!A.needsDark || s.dim));
  const rightTreat = treatFor(A, p.sev);
  const sevOk = s.dx === 'unknown' || s.treat === rightTreat;
  let fee = Math.round(A.fee * 0.8 * (p.sev === 's' ? 1.4 : 1) * (p.emergency ? 1.5 : 1) * (s.opts.houseCall ? 1.5 : 1));
  let text = '', cured = false, mood = '', title = '';
  const doseNote = s.treat === 'pill' && s.dose !== 1 ? (s.dose < 1 ? ' The dose was too low to do much.' : s.dose === 1.5 ? ' The dose was a bit high; it\'s groggy.' : ' That was far too much. It\'s sick from the medicine.') : '';
  if (s.treat === 'admit') {
    if (correctAil && sevOk) { title = 'Admitted'; text = `${p.pet} is tucked into the kennels. Care for it each evening.`; cured = true; S.casebook[p.ail] = true; S.stats.cured++; S.today.cured++; addRep(2); sfx('good'); }
    else { title = 'Admitted'; text = `${p.pet} is staying the night, but you're not sure it'll help.`; S.stats.wrong++; S.today.wrong++; addRep(-4); }
  } else if (correctAil && sevOk && score >= 0.3) {
    cured = true; S.stats.cured++; S.today.cured++; S.casebook[p.ail] = true;
    title = A.cursed ? 'Something new' : 'Treated';
    addRep((A.cursed ? 5 : 1) + Math.round(score * 2));
    text = (s.lie ? `${p.owner} beams. “A slow egg! I knew it.” You feel a little bad.` : A.cure) + doseNote + (score >= 0.85 ? ' Textbook work.' : score < 0.5 ? ' A bit shaky, but it worked.' : '');
    S.polaroids.push({ pet: p.pet, sp: p.sp, ail: p.ail, day: S.day, owner: p.owner, room: s.opts.room, night: !!s.opts.cursed });
    if (p.id === 'bubbles') S.flags.bubblesCured = true;
    if (A.cursed) { S.flags['cured_' + p.ail] = true; S.casebook[p.ail] = true; }
    mood = 'happy'; sfx('good');
  } else if (correctAil && !sevOk) {
    S.stats.botched++; addRep(-2); fee = Math.round(fee / 2);
    title = 'Not quite'; text = `It helped a little, but this case needed ${TREATS[rightTreat].name.toLowerCase()}.${doseNote}`;
    if (S.day < 4 && !p.returning) { S.returns.push(stripPatient(p)); text += ` ${p.owner} will be back tomorrow.`; }
    mood = 'meh'; sfx('bad');
  } else if (correctAil) {
    S.stats.botched++; addRep(-2); fee = Math.round(fee / 2);
    title = 'It didn\'t take'; text = `You had the right idea, but the treatment didn't take.${doseNote} ${p.owner} pays half and says they'll try PetCorp.`; mood = 'meh'; sfx('bad');
  } else {
    S.stats.wrong++; S.today.wrong++; addRep(-5);
    title = 'Wrong call';
    text = `${p.pet} isn't any better. ${s.dx === 'unknown' ? 'That wasn\'t it.' : `It wasn't ${AILMENTS[s.dx].name.toLowerCase()}.`} ${A.cursed ? '' : `Looking back at your notes, it was probably <b>${A.name.toLowerCase()}</b>.`}`;
    if (S.day < 4 && !p.returning && !A.cursed && !s.opts.houseCall) { S.returns.push(stripPatient(p)); text += ` ${p.owner} will be back tomorrow.`; }
    fee = 0; mood = 'sad'; sfx('bad');
  }
  // a chart entry, and leftovers for brewing
  const key = p.chart || (p.pet + '|' + p.owner); p.chart = key;
  (S.charts[key] = S.charts[key] || []).push({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][S.day], text: `${s.dx === 'unknown' ? 'Unknown condition' : AILMENTS[s.dx].name}${s.dxSev ? (s.dxSev === 's' ? ' (severe)' : ' (mild)') : ''}, ${TREATS[s.treat].name.toLowerCase()}. ${cured ? 'Better.' : 'No better.'}` });
  const drop = { gloop: 'slime', moth: 'dust', fern: 'clippings' }[p.sp];
  if (drop && cured) { S.ingredients[drop] = (S.ingredients[drop] || 0) + 1; text += ` <span class="fine">(+1 ${INGREDIENTS[drop].name.toLowerCase()} for brewing)</span>`; }
  s.stage = 'result'; s.bill = { fee, cured, mood, correct: correctAil };
  const options = p.cantPay
    ? `<button class="primary" data-act="bill" data-k="tab">Put it on a tab</button><button data-act="bill" data-k="free">No charge</button>`
    : fee > 0 ? `<button class="primary" data-act="bill" data-k="fair">Charge ${money(fee)}</button><button data-act="bill" data-k="discount">Discount: ${money(fee * 0.6)}</button><button data-act="bill" data-k="free">No charge</button><button data-act="bill" data-k="extra">Charge extra: ${money(fee * 1.4)}</button>`
    : `<button class="primary" data-act="bill" data-k="free">See them out</button>`;
  s.resultHtml = `<div class="result ${mood}"><img class="portrait big" src="${portrait(p, cured)}" alt=""><div><h2>${title}</h2><p>${text}</p></div></div>
    <h3>The bill</h3><div class="row"><span>${TREATS[s.treat].name}${p.sev === 's' && cured ? ' (severe case)' : ''}${p.emergency ? ' (emergency)' : ''}</span><span>${fee ? money(fee) : 'no charge'}</span></div>
    ${p.cantPay ? `<p class="fine">${esc(p.owner)} looks at the four dollars in their hand.</p>` : ''}
    <div class="btns">${options}</div>`;
  renderHud(); renderPanel();
}
export function stripPatient(p) { const { uid, seat, waitFrom, arrive, returning, stress, emergency, worse, ...rest } = p; return { ...rest, sev: p.sev }; }
ACT.bill = (ds) => {
  const s = G.scr, S = G.S, p = s.p, b = s.bill; let paid = 0;
  if (ds.k === 'fair') paid = b.fee;
  if (ds.k === 'discount') { paid = Math.round(b.fee * 0.6); addRep(2); }
  if (ds.k === 'free') addRep(b.fee > 0 ? 3 : 0);
  if (ds.k === 'extra') { paid = Math.round(b.fee * 1.4); addRep(-4); S.integrity--; }
  if (ds.k === 'tab') { S.flags.tobiTab = (S.flags.tobiTab || 0) + b.fee; addRep(2); }
  if (paid) { addMoney(paid); sfx('cash'); }
  let tip = 0;
  if (b.cured && (ds.k === 'fair' || ds.k === 'discount') && b.mood === 'happy') tip = Math.round(S.rep / 20 + hash(p.uid || 1, 3) * 4);
  if (tip) { addMoney(tip); toast(`${p.owner} leaves a ${money(tip)} tip.`); }
  if (p.vance) return vanceChoice();
  done(s, { cured: b.cured });
};
function vanceChoice() {
  G.S.flags.vanceSeen = true;
  openModal(`<h2>The collar</h2><p>While you clean up, you notice a tag under Duchess's fur:</p><p class="quote">PROPERTY OF SILK ROAD EXOTICS. NOT FOR RESALE. IMPORT NO. 0447</p><p>Mothhounds can't legally be imported. Mr. Vance sees you looking. He slides an envelope across the table. “For your trouble. And your memory.”</p>
    <button class="dx" data-act="vance" data-v="report"><b>Report him to Animal Control.</b><span>He'll storm out. It's the right thing to do.</span></button>
    <button class="dx" data-act="vance" data-v="quiet"><b>Take the envelope and say nothing.</b><span>$60, no questions.</span></button>`, 'sticky');
}
ACT.vance = (ds) => {
  closeModal(); const S = G.S;
  if (ds.v === 'report') { S.flags.vanceReported = true; addRep(3); S.integrity++; toast('You make the call after he leaves. Animal Control thanks you.'); }
  else { addMoney(60); S.integrity -= 2; S.flags.vanceQuiet = true; toast('You pocket the envelope. $60.'); }
  done(G.scr, { cured: true });
};
function done(s, result) { save(); if (s.opts.after) s.opts.after(result); else G.backToHall(); }

/* ---------- handbook ---------- */
ACT.handbook = () => {
  const S = G.S, cur = G.scr && G.scr.p ? G.scr.p.sp : null;
  const order = cur ? [cur, ...Object.keys(SPECIES).filter((q) => q !== cur)] : Object.keys(SPECIES);
  const rows = (sp) => Object.entries(SPECIES[sp].normal).map(([k, r]) => `<tr><td>${READ[k].name}</td><td>${r[0]}–${r[1]}${k === 'wt' && sp === 'pebble' ? ' g' : READ[k].unit}</td></tr>`).join('');
  openModal(`<h2>Dr. Okafor's handbook</h2>${order.map((sp) => `<details class="hb" ${sp === order[0] ? 'open' : ''}><summary>${SPECIES[sp].name}</summary><p class="fine">${SPECIES[sp].blurb}</p>
    <table class="ranges"><tr><th>Healthy reading</th><th>Range</th></tr>${rows(sp)}</table>
    <p class="fine">Healthy sounds: ${Object.entries(SPECIES[sp].zones).map(([z, q]) => `${z}: ${SOUNDS[q]}`).join('; ')}.</p>
    ${Object.entries(AILMENTS).filter(([, a]) => a.sp === sp && !a.cursed).map(([id, a]) => `<div class="hb-ail"><b>${a.name}</b>${a.contagious ? ' <span class="tag warn">contagious</span>' : ''}<br>${pageText(id, a)}</div>`).join('')}
    ${Object.entries(AILMENTS).filter(([id, a]) => a.sp === sp && a.cursed && S.casebook[id]).map(([, a]) => `<div class="hb-ail note-hand"><b>${a.name}</b> (your own note)<br>${a.cure}</div>`).join('')}</details>`).join('')}
    <div class="btns"><button data-act="close">Close</button></div>`);
};
export { makePatient };
