// Turns an illness into a concrete patient: severity, the signs that happen to show,
// every reading the tests can return, and what the owner says.
import { SPECIES, AILMENTS, READ } from './data.js';
import { COMPLAINTS } from './story.js';
import { rng } from './util.js';

const VOLT_ZONES = ['ears', 'back', 'belly', 'tail'];
export const ZONES_POS = {
  cat: { ears: [0, -46], back: [-11, -20], belly: [0, -6], tail: [21, -24] },
};

const pickRange = (v, sev) => (Array.isArray(v) ? v : v[sev || 'm']);
function roll(r, [a, b], d) { const v = a + (b - a) * r(); const k = Math.pow(10, d); return Math.round(v * k) / k; }

export function severityOf(A) { return !!(A.sev || A.xsize || (A.treat && typeof A.treat === 'object')); }
export function treatFor(A, sev) { return typeof A.treat === 'object' ? A.treat[sev || 'm'] : A.treat; }

// spec: { ail, sev?, pet, owner, say?, obj?, ...story flags }, seed: number
export function makePatient(spec, seed, opts = {}) {
  const r = rng(seed * 7919 + 13);
  const A = AILMENTS[spec.ail], sp = A.sp, S = SPECIES[sp];
  const p = { ...spec, sp, seed };
  p.sev = severityOf(A) ? (spec.sev || (r() < 0.4 ? 's' : 'm')) : null;
  // readings
  const R = {};
  for (const [k, norm] of Object.entries(S.normal)) {
    const range = A.read[k] != null ? pickRange(A.read[k], p.sev) : norm;
    R[k] = roll(r, range, READ[k].d);
  }
  if (sp === 'pebble') R.wt = Math.round(R.wt);
  p.R = R;
  // the fur voltmeter reads four places on a cat
  if (sp === 'cat') {
    const base = A.read.volts ? pickRange(A.read.volts, p.sev) : S.normal.volts;
    p.volts = {};
    for (const z of VOLT_ZONES) p.volts[z] = roll(r, base, 0);
    if (A.voltsMixed) VOLT_ZONES.forEach((z) => { p.volts[z] = r() < 0.5 ? roll(r, [0, 3], 0) : roll(r, [45, 70], 0); });
    if (A.hotspot) { const z = ['back', 'belly', 'tail'][Math.floor(r() * 3)]; p.volts[z] = roll(r, [70, 95], 0); p.hot = z; }
  }
  // the soil probe reads three depths in a Fernling's pot
  if (sp === 'fern') {
    const v = R.soil;
    p.soil = A.soilDeep ? { top: roll(r, [32, 48], 0), mid: Math.round((v + 45) / 2), root: v } : { top: Math.max(0, v - 4), mid: v, root: Math.min(100, v + 4) };
  }
  // stethoscope sounds by zone
  p.sounds = {};
  for (const [z, q] of Object.entries(S.zones)) p.sounds[z] = A.listen[z] || q;
  // what shows: each sign has a chance; at least one shows if the illness has any
  const shown = [];
  for (const [kind, ch] of A.signs) if (r() < ch) shown.push(kind);
  if (!shown.length && A.signs.length) shown.push(A.signs[Math.floor(r() * A.signs.length)][0]);
  // a harmless quirk sometimes shows too (healthy cats crackle a little, ferns droop in the afternoon)
  const q = S.quirk;
  p.quirk = null;
  if (q && !shown.includes(q.sign) && r() < q.p && (!q.after || (opts.minute || 0) >= q.after) && !A.cursed) { shown.push(q.sign); p.quirk = q.sign; }
  p.signs = shown;
  if (A.hiddenUnder) p.under = A.hiddenUnder;
  if (spec.ail === 'blight') p.under = 'blackspots';
  // what's inside
  if (spec.ail === 'swallowed') p.obj = spec.obj || (p.sev === 's' ? ['keys', 'spoon', 'pin'][Math.floor(r() * 3)] : 'sock');
  if (spec.ail === 'hairball') p.ball = p.sev === 's' ? 'large' : 'small';
  // what the owner says
  if (!p.say) {
    const lines = COMPLAINTS[spec.ail] || [{ t: 'Something\'s not right.' }];
    const pick = lines[Math.floor(r() * lines.length)];
    p.say = pick.t; p.fib = !!pick.fib;
  }
  p.stress = 0;
  return p;
}

// A patient left waiting too long gets worse: mild becomes severe, readings and signs follow.
export function worsen(p) {
  const A = AILMENTS[p.ail];
  if (!severityOf(A) || p.sev === 's') return false;
  const keep = { ...p };
  const np = makePatient({ ...keep, sev: 's', say: keep.say }, p.seed + 1);
  Object.assign(p, { sev: 's', R: np.R, volts: np.volts || p.volts, soil: np.soil || p.soil, signs: np.signs, obj: p.obj, ball: np.ball || p.ball });
  return true;
}

export function fmtRead(p, k) {
  const v = p.R[k], meta = READ[k];
  if (k === 'wt' && p.sp === 'pebble') return `${v} g`;
  return `${v}${meta.unit}`;
}
export function normalText(sp, k) {
  const n = SPECIES[sp].normal[k]; if (!n) return '';
  const unit = k === 'wt' && sp === 'pebble' ? ' g' : READ[k].unit;
  return `${n[0]}–${n[1]}${unit}`;
}
export function outOfRange(sp, k, v) { const n = SPECIES[sp].normal[k]; if (!n) return 0; return v < n[0] ? -1 : v > n[1] ? 1 : 0; }
