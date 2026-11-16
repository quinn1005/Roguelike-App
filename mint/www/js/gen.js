// Builds card instances, grading submissions and card values.
import { CARDS, LINES, CLIENTS, BASE_VALUE, RARITY_NAME, FAKE_LINE, ALTER_LINE } from './data.js';
import { trueGrade, trueSubs, conditionFactor } from './grading.js';

// Seeded RNG whose state can be saved and restored (for mid-shift saves).
export function makeRng(seed, state) {
  let a = (state != null ? state : seed) >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.range = (lo, hi) => lo + r() * (hi - lo);
  r.state = () => a;
  return r;
}

let uidN = 0;
export const newUid = () => 'u' + Date.now().toString(36) + (uidN++).toString(36) + Math.floor(Math.random() * 1e4).toString(36);
export const cardDef = (inst) => CARDS[inst.line].find((x) => x.n === inst.n);

export function pickCard(R, line, weights = { c: 6, u: 3, r: 1 }) {
  const list = CARDS[line];
  const tot = list.reduce((s, c) => s + weights[c.r], 0);
  let x = R() * tot;
  for (const c of list) { x -= weights[c.r]; if (x <= 0) return c; }
  return list[0];
}

const QUALITY = {
  gem: { n: [0, 1], sev: [1], ctr: 0.75 },
  nice: { n: [1, 2], sev: [1, 1, 2], ctr: 1.5 },
  played: { n: [2, 4], sev: [1, 2, 2], ctr: 2.6, crease: 0.1 },
  beat: { n: [3, 5], sev: [1, 2, 2, 3], ctr: 3.4, crease: 0.5 },
};
export function pickQuality(R, skew = 0) {
  const x = R() + skew;
  return x < 0.16 ? 'gem' : x < 0.6 ? 'nice' : x < 0.9 ? 'played' : 'beat';
}

export function blankInst(line, n) {
  return { uid: newUid(), line, n, v: {}, defects: [], dx: 0, dy: 0, fake: null, alt: null };
}

export function makeInst(R, line, n, quality) {
  const inst = blankInst(line, n);
  const q = QUALITY[quality || pickQuality(R)];
  const sgn = () => (R() < 0.5 ? -1 : 1);
  inst.dx = +(sgn() * R() * q.ctr).toFixed(2);
  inst.dy = +(sgn() * R() * q.ctr * 0.8).toFixed(2);
  const count = R.int(q.n[0], q.n[1]);
  for (let i = 0; i < count; i++) addDefect(R, inst, R.pick(['corner', 'corner', 'edge', 'surface']), R.pick(q.sev));
  if (q.crease && R() < q.crease) addDefect(R, inst, R() < 0.5 ? 'surface' : 'corner', 3);
  return inst;
}

export function addDefect(R, inst, cat, sev, faceArg) {
  const r = addDefectRaw(R, inst, cat, sev);
  if (r) r.face = faceArg || (R() < (cat === 'surface' ? 0.3 : 0.4) ? 'back' : 'front');
  return r;
}

function addDefectRaw(R, inst, cat, sev) {
  const id = inst.defects.length ? Math.max(...inst.defects.map((d) => d.id)) + 1 : 1;
  if (cat === 'corner') {
    const used = inst.defects.filter((d) => d.cat === 'corner').map((d) => d.pos);
    const free = ['tl', 'tr', 'bl', 'br'].filter((p) => !used.includes(p));
    if (!free.length) return null;
    const d = { id, cat, sev, pos: R.pick(free) };
    inst.defects.push(d);
    return d;
  }
  if (cat === 'edge') {
    for (let tries = 0; tries < 8; tries++) {
      const side = R.pick(['l', 'r', 't', 'b']);
      const d = { id, cat, sev, side };
      if (side === 'l' || side === 'r') d.y = R.int(40, 310); else d.x = R.int(34, 216);
      const clash = inst.defects.some((e) => e.cat === 'edge' && e.side === side && Math.abs((e.y ?? e.x) - (d.y ?? d.x)) < 34);
      if (!clash) { inst.defects.push(d); return d; }
    }
    return null;
  }
  const kind = sev === 3 ? 'crease' : sev === 2 ? R.pick(['scratch', 'stain']) : R.pick(['scratch', 'printline', 'dimple']);
  const d = { id, cat: 'surface', sev, kind, x: R.int(44, 206), y: R.int(64, 296), ang: R.int(-60, 60) };
  inst.defects.push(d);
  return d;
}

// ------------------------------------------------------------- variants
// odds.scale multiplies every chance (bins and packs use lower odds than submissions).
export function rollVariants(R, inst, odds = {}) {
  const c = cardDef(inst), k = odds.scale ?? 1, v = inst.v;
  const roll = (p) => R() < p * k;
  switch (inst.line) {
    case 'gg': if (roll(odds.noYellow ?? 0.05)) v.noYellow = true; break;
    case 'ns': if ((c.r === 'r' && roll(0.5)) || (c.r === 'u' && roll(0.2))) v.holo = true; break;
    case 'bl': if (c.r === 'r' && roll(0.5)) v.holo = true; if (roll(odds.shadowless ?? 0.15)) { v.shadowless = true; if (R() < 0.45) v.first = true; } break;
    case 'ml': if (roll(0.12)) v.hidden = true; break;
    case 'tb': if (roll(0.2)) v.first = true; if (c.r === 'r' && roll(0.5)) v.holo = true; break;
    case 'rd': if (c.r === 'r' && roll(0.06)) v.secret = true; else if (c.r !== 'c' && roll(0.2)) v.gold = true; break;
    case 'ga': if (roll(0.1)) v.alpha = true; if (c.r === 'r' && roll(0.3)) v.holo = true; break;
    case 'hp': if (roll(0.35)) v.vintage = true; break;
    case 'ic': if (roll(0.3)) v.run1 = true; break;
    case 'cf': if (roll(0.25)) v.serial = R.int(1, 50); break;
    case 'sp': if (roll(0.03)) v.inverted = true; break;
    default: break;
  }
  return inst;
}

const VLABEL = {
  first: '1st Edition', shadowless: 'Shadowless', holo: 'Holo', noYellow: 'Misprint: no yellow', hidden: 'Print Run A',
  gold: 'Gold name', secret: 'Secret rare', alpha: 'Alpha', vintage: '1987 first print', run1: 'Run 1', inverted: 'Error: inverted center', ghost: 'Ghost Print',
};
export function variantLabels(v, line) {
  const out = [];
  for (const k of Object.keys(VLABEL)) if (v[k]) out.push(k === 'holo' && line === 'ga' ? 'Foil' : VLABEL[k]);
  if (v.serial) out.push(`Serialized ${String(v.serial).padStart(2, '0')}/50`);
  return out;
}
// Variant claims that could be made for a line (for form mismatches).
const CLAIMABLE = { gg: ['noYellow'], ns: ['holo'], bl: ['first', 'holo'], ml: ['hidden'], tb: ['first', 'holo'], rd: ['gold', 'secret'], ga: ['alpha', 'holo'], hp: ['vintage'], ic: ['run1'], cf: ['serial'], sp: ['inverted'] };

// ------------------------------------------------------------- counterfeits and alterations
export function makeFake(R, inst, day, kinds) {
  if (kinds) { inst.fake = { kinds: kinds.slice(), cr: R.int(0, 2) }; return finishFake(R, inst); }
  const pool = day.fakeKinds.filter((k) => !FAKE_LINE[k] || FAKE_LINE[k] === inst.line);
  const own = pool.filter((k) => FAKE_LINE[k] === inst.line);
  // Ring forgeries: perfect except the microprint.
  if (pool.includes('micro') && R() < 0.25) { inst.fake = { kinds: ['micro'], cr: 0 }; inst.defects = inst.defects.filter((d) => d.sev === 1); return inst; }
  const generic = pool.filter((k) => !FAKE_LINE[k] && k !== 'micro');
  const a = own.length && R() < 0.55 ? R.pick(own) : R.pick(generic);
  const ks = [a];
  if (R() < 0.35) { const b = R.pick(generic.filter((k) => k !== a)); if (b) ks.push(b); }
  inst.fake = { kinds: ks, cr: R.int(0, 2) };
  return finishFake(R, inst);
}
function finishFake(R, inst) {
  const ks = inst.fake.kinds;
  if (ks.includes('swirl')) inst.v.holo = true;
  if (ks.includes('dupserial') && !inst.v.serial) inst.v.serial = R.int(1, 50);
  if (ks.includes('weight')) inst.fake.wd = +((R() < 0.5 ? -1 : 1) * R.range(0.12, 0.3)).toFixed(2);
  inst.v.noYellow = false; inst.v.inverted = false;
  return inst;
}

export function makeAlt(R, inst, day) {
  let pool = day.alterKinds.filter((k) => !ALTER_LINE[k] || ALTER_LINE[k] === inst.line);
  if (inst.line === 'ga' && pool.includes('alphatrim') && R() < 0.5) pool = ['alphatrim'];
  const kind = R.pick(pool);
  if (kind === 'stamp') { inst.v.shadowless = false; inst.v.first = true; inst.alt = { kind }; }
  if (kind === 'alphatrim') { inst.v.alpha = true; inst.alt = { kind }; }
  if (kind === 'recolor') {
    const d = addDefect(R, inst, 'corner', 2) || addDefect(R, inst, 'edge', 2);
    inst.alt = d ? { kind, hidden: d.id } : { kind: 'trim' };
  }
  if (kind === 'trim') { inst.defects = inst.defects.filter((d) => d.cat !== 'edge'); inst.alt = { kind }; }
  inst.v.noYellow = false; inst.v.inverted = false;
  return inst;
}

// ------------------------------------------------------------- submissions
let formNo = 141;
export function makeForm(R, inst, opts = {}) {
  const c = cardDef(inst);
  const tiers = opts.rep >= 70 ? ['economy', 'standard', 'standard', 'express', 'express'] : ['economy', 'economy', 'standard', 'standard', 'standard', 'express'];
  return {
    no: ++formNo,
    client: opts.client || R.pick(CLIENTS),
    tier: opts.tier || R.pick(tiers),
    line: inst.line, n: inst.n, name: c.full || c.name,
    claims: variantLabels(inst.v, inst.line),
    declared: opts.declared || '$' + Math.max(5, Math.round(cardValueRaw(inst) * R.range(1.2, 3))),
    note: opts.note || '',
  };
}

export function makeMismatch(R, sub) {
  const { form, inst } = sub;
  const kind = R.pick(['name', 'number', 'variant', 'variant']);
  const others = CARDS[inst.line].filter((c) => c.n !== inst.n);
  if (kind === 'name') { const o = R.pick(others); form.name = o.full || o.name; form.n = o.n; }
  if (kind === 'number') form.n = R.pick(others).n;
  if (kind === 'variant') {
    const missing = (CLAIMABLE[inst.line] || []).filter((k) => !inst.v[k]);
    if (!missing.length) form.n = R.pick(others).n;
    else {
      const k = R.pick(missing);
      form.claims = [...form.claims, k === 'serial' ? `Serialized ${String(R.int(1, 50)).padStart(2, '0')}/50` : (k === 'holo' && inst.line === 'ga' ? 'Foil' : VLABEL[k])];
    }
  }
  sub.mismatch = kind;
}

const isError = (inst) => !!(inst.v.noYellow || inst.v.inverted);

// Which verdicts are correct for a submission.
export function truthOf(sub) {
  const { inst } = sub;
  const ok = [];
  if (sub.mismatch) ok.push('return');
  if (inst.fake) ok.push('counterfeit');
  else if (inst.alt) ok.push('altered');
  if (!sub.mismatch && !inst.fake && !inst.alt) ok.push(isError(inst) ? 'error' : 'grade');
  return { ok, grade: trueGrade(inst), subs: trueSubs(inst) };
}

export function makeSubmission(R, day, dayNum, opts = {}) {
  // Newer lines turn up a little more often in the week they arrive.
  const weighted = day.lines.flatMap((l) => (LINES[l].unlock > dayNum - 3 ? [l, l] : [l]));
  const line = R.pick(weighted);
  const c = pickCard(R, line, { c: 5, u: 3, r: 1.4 });
  const inst = makeInst(R, line, c.n);
  rollVariants(R, inst, { scale: 1.3, shadowless: dayNum >= 2 ? 0.25 : 0, noYellow: dayNum >= 2 ? 0.1 : 0 });
  const x = R();
  if (x < day.fake) makeFake(R, inst, day);
  else if (x < day.fake + day.altered) makeAlt(R, inst, day);
  const sub = { inst, form: null, mismatch: null, story: null };
  sub.form = makeForm(R, inst, { rep: opts.rep });
  if (R() < day.mismatch) makeMismatch(R, sub);
  return sub;
}

// ------------------------------------------------------------- value
// The market multiplier changes week to week (boom and crash). The population
// report lowers what 10s are worth: every 10 graded makes the next one less rare.
let MARKET = 1;
let POP = {};
export function setMarket(m, pop) { MARKET = m; POP = pop || {}; }
export const marketNow = () => MARKET;

const GRADE_MULT = [[10, 8], [9.5, 4.5], [9, 3], [8.5, 2.1], [8, 1.7], [7.5, 1.35], [7, 1.15], [6, 0.9], [5, 0.7], [0, 0.5]];
const gradeMult = (g) => { for (const [min, m] of GRADE_MULT) if (g >= min) return m; return 0.5; };

export function cardValueRaw(inst) {
  const c = cardDef(inst);
  let v = BASE_VALUE[c.r] * (c.r === 'r' && ['gg', 'hp', 'cf'].includes(inst.line) ? 1.4 : 1);
  const V = inst.v;
  if (V.holo) v *= 4;
  if (V.shadowless) v *= V.first ? 10 : 4;
  else if (V.first) v *= 3;
  if (V.noYellow) v *= 25;
  if (V.hidden) v *= 6;
  if (V.gold) v *= 3;
  if (V.secret) v *= 12;
  if (V.alpha) v *= 8;
  if (V.vintage) v *= 5;
  if (V.run1) v *= 3;
  if (V.serial) v *= 6;
  if (V.inverted) v *= 40;
  if (V.ghost) v *= 250;
  return v;
}
export function cardValue(inst) {
  if (inst.fake) return inst.fake.kinds.includes('micro') && MARKET < 0.9 ? 15 : 0.5; // ring forgeries become curiosities after the crash
  if (inst.alt) return Math.max(0.5, cardValueRaw(inst) * 0.2 * MARKET);
  let v;
  if (inst.slab) {
    const key = inst.line + ':' + inst.n;
    const popCut = inst.slab.grade === 10 ? 1 / (1 + (POP[key] || 0) * 0.12) : 1;
    v = cardValueRaw(inst) * gradeMult(inst.slab.grade) * popCut;
  } else v = cardValueRaw(inst) * conditionFactor(trueGrade(inst)) * 0.75;
  v *= MARKET;
  return Math.max(0.25, Math.round(v * 4) / 4);
}

export const cardTitle = (inst) => { const c = cardDef(inst); return c.full || c.name; };
export const rarityName = (inst) => RARITY_NAME[cardDef(inst).r];
export const lineName = (line) => LINES[line].name;
