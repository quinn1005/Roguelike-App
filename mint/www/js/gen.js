// Builds card instances and grading submissions.
import { CARDS, LINES, CLIENTS, TIERS, BASE_VALUE, RARITY_NAME } from './data.js';
import { trueGrade, trueSubs, conditionFactor } from './grading.js';

export function makeRng(seed) {
  let a = seed >>> 0;
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
  return r;
}

let uidN = 0;
export const newUid = () => 'u' + Date.now().toString(36) + (uidN++).toString(36) + Math.floor(Math.random() * 1e4).toString(36);

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
  return { uid: newUid(), line, n, v: { holo: false, first: false, shadowless: false, noYellow: false }, defects: [], dx: 0, dy: 0, fake: null, alt: null };
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

// Variants a card can be pulled or submitted with.
export function rollVariants(R, inst, odds = {}) {
  const c = CARDS[inst.line].find((x) => x.n === inst.n);
  const o = { holoR: 0.5, holoU: 0.2, shadowless: 0.15, first: 0.5, noYellow: 0, ...odds };
  if (inst.line !== 'gg') {
    if (c.r === 'r' && R() < o.holoR) inst.v.holo = true;
    if (c.r === 'u' && inst.line === 'ns' && R() < o.holoU) inst.v.holo = true;
  }
  if (inst.line === 'bl' && R() < o.shadowless) {
    inst.v.shadowless = true;
    if (R() < o.first) inst.v.first = true;
  }
  if (inst.line === 'gg' && R() < o.noYellow) inst.v.noYellow = true;
  return inst;
}

export function variantLabels(v) {
  const out = [];
  if (v.first) out.push('1st Edition');
  if (v.shadowless) out.push('Shadowless');
  if (v.holo) out.push('Holo');
  if (v.noYellow) out.push('Misprint: no yellow');
  return out;
}

export function makeFake(R, inst, day, kinds) {
  let pool = kinds || day.fakeKinds.slice();
  if (inst.line !== 'ns') pool = pool.filter((k) => k !== 'swirl');
  if (pool.includes('swirl') && R() < 0.5) {
    inst.v.holo = true;
    inst.fake = { kinds: ['swirl'], cr: R.int(0, 2) };
  } else {
    pool = pool.filter((k) => k !== 'swirl');
    const a = R.pick(pool);
    const ks = [a];
    if (R() < 0.4) { const b = R.pick(pool.filter((k) => k !== a)); if (b) ks.push(b); }
    inst.fake = { kinds: ks, cr: R.int(0, 2) };
  }
  if (kinds) inst.fake.kinds = kinds.slice();
  return inst;
}

export function makeAlt(R, inst, day) {
  let pool = day.alterKinds.slice();
  if (inst.line !== 'bl') pool = pool.filter((k) => k !== 'stamp');
  const kind = R.pick(pool);
  if (kind === 'stamp') { inst.v.shadowless = false; inst.v.first = true; inst.alt = { kind }; }
  if (kind === 'recolor') {
    const d = addDefect(R, inst, 'corner', 2) || addDefect(R, inst, 'edge', 2);
    inst.alt = { kind, hidden: d ? d.id : null };
    if (!d) inst.alt = { kind: 'trim' };
  }
  if (kind === 'trim') { inst.defects = inst.defects.filter((d) => d.cat !== 'edge'); inst.alt = { kind }; }
  return inst;
}

// ------------------------------------------------------------- submissions
let formNo = 141;
export function makeForm(R, inst, opts = {}) {
  const c = CARDS[inst.line].find((x) => x.n === inst.n);
  const form = {
    no: ++formNo,
    client: opts.client || R.pick(CLIENTS),
    tier: opts.tier || R.pick(['economy', 'standard', 'standard', 'standard', 'express']),
    line: inst.line, n: inst.n, name: c.full || c.name,
    claims: variantLabels(inst.v),
    declared: opts.declared || '$' + Math.max(5, Math.round(cardValueRaw(inst) * R.range(1.2, 3))),
    note: opts.note || '',
  };
  return form;
}

export function makeMismatch(R, sub) {
  const { form, inst } = sub;
  const kind = R.pick(['name', 'number', 'variant']);
  const others = CARDS[inst.line].filter((c) => c.n !== inst.n);
  if (kind === 'name') { const o = R.pick(others); form.name = o.full || o.name; form.n = o.n; }
  if (kind === 'number') { form.n = R.pick(others).n; }
  if (kind === 'variant') {
    const opts = [];
    if (!inst.v.holo && inst.line !== 'gg') opts.push('Holo');
    if (inst.line === 'bl' && !inst.v.first) opts.push('1st Edition');
    if (inst.line === 'gg' && !inst.v.noYellow) opts.push('Misprint: no yellow');
    if (!opts.length) { form.n = R.pick(others).n; } else form.claims = [...form.claims, R.pick(opts)];
  }
  sub.mismatch = kind;
}

// Which verdicts are correct for a submission.
export function truthOf(sub) {
  const { inst } = sub;
  const ok = [];
  if (sub.mismatch) ok.push('return');
  if (inst.fake) ok.push('counterfeit');
  else if (inst.alt) ok.push('altered');
  if (!sub.mismatch && !inst.fake && !inst.alt) ok.push(inst.v.noYellow ? 'error' : 'grade');
  const subs = trueSubs(inst);
  return { ok, grade: trueGrade(inst), subs };
}

export function makeSubmission(R, day, dayNum) {
  const line = R.pick(day.lines);
  const c = pickCard(R, line, { c: 5, u: 3, r: 1.4 });
  const inst = makeInst(R, line, c.n);
  rollVariants(R, inst, { holoR: 0.55, holoU: 0.25, shadowless: dayNum >= 2 ? 0.25 : 0, first: 0.5, noYellow: dayNum >= 2 ? 0.1 : 0 });
  const x = R();
  if (x < day.fake) { makeFake(R, inst, day); inst.v.noYellow = false; }
  else if (x < day.fake + day.altered) { makeAlt(R, inst, day); inst.v.noYellow = false; }
  const sub = { inst, form: null, mismatch: null, story: null };
  sub.form = makeForm(R, inst);
  if (R() < day.mismatch) makeMismatch(R, sub);
  return sub;
}

// ------------------------------------------------------------- value
export function cardValueRaw(inst) {
  const c = CARDS[inst.line].find((x) => x.n === inst.n);
  let v = BASE_VALUE[c.r] * (inst.line === 'gg' && c.r === 'r' ? 1.4 : 1);
  if (inst.v.holo) v *= 4;
  if (inst.v.shadowless) v *= inst.v.first ? 10 : 4;
  if (inst.v.noYellow) v *= 25;
  return v;
}
export function cardValue(inst) {
  if (inst.fake) return 0.5;
  if (inst.alt) return Math.max(0.5, cardValueRaw(inst) * 0.2);
  const v = cardValueRaw(inst) * conditionFactor(trueGrade(inst));
  return Math.max(0.25, Math.round(v * 4) / 4);
}

export const cardTitle = (inst) => {
  const c = CARDS[inst.line].find((x) => x.n === inst.n);
  return c.full || c.name;
};
export const rarityName = (inst) => RARITY_NAME[CARDS[inst.line].find((x) => x.n === inst.n).r];
export const lineName = (line) => LINES[line].name;
