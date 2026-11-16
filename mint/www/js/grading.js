// Grading rules shared by the true grade (what the card really is) and the
// worksheet grade (what the player has found so far).

export const CAP = { 1: 9, 2: 8, 3: 6 };
const KEY = { corner: 'corners', edge: 'edges', surface: 'surface' };

// Border ratios. The printed frame sits 8 units in from each edge, shifted by dx/dy.
export function centerPct(dx, dy) {
  const lr = ((8 + dx) / 16) * 100, tb = ((8 + dy) / 16) * 100;
  return { lr, tb, worst: Math.max(lr, 100 - lr, tb, 100 - tb) };
}

export function centerSub(worst) {
  if (worst <= 55.5) return 10;
  if (worst <= 60.5) return 9;
  if (worst <= 65.5) return 8;
  if (worst <= 70.5) return 7;
  if (worst <= 75.5) return 6;
  if (worst <= 80.5) return 5;
  return 4;
}

// The worst flaw in a category caps it; each extra flaw there takes off half a point.
export function subsFrom(defects, centeringWorst) {
  const s = { centering: centeringWorst == null ? 10 : centerSub(centeringWorst), corners: 10, edges: 10, surface: 10 };
  const seen = { corners: 0, edges: 0, surface: 0 };
  [...defects].sort((a, b) => b.sev - a.sev).forEach((d) => {
    const k = KEY[d.cat];
    if (seen[k] === 0) s[k] = Math.min(s[k], CAP[d.sev]);
    else s[k] = Math.max(1, s[k] - 0.5);
    seen[k]++;
  });
  return s;
}

// Average rounded down to the half point, never more than 1 above the lowest sub-grade.
export function finalGrade(s) {
  const v = [s.centering, s.corners, s.edges, s.surface];
  const avg = v.reduce((a, b) => a + b, 0) / 4;
  return Math.max(1, Math.min(Math.floor(avg * 2) / 2, Math.min(...v) + 1));
}

export const isPristine = (s) => s.centering === 10 && s.corners === 10 && s.edges === 10 && s.surface === 10;

const NAMES = { 10: 'GEM MINT', 9.5: 'MINT+', 9: 'MINT', 8.5: 'NM-MT+', 8: 'NM-MT', 7.5: 'NEAR MINT+', 7: 'NEAR MINT', 6.5: 'EX-MT+', 6: 'EX-MT', 5.5: 'EXCELLENT+', 5: 'EXCELLENT', 4.5: 'VG-EX+', 4: 'VG-EX', 3.5: 'VERY GOOD+', 3: 'VERY GOOD', 2.5: 'GOOD+', 2: 'GOOD', 1.5: 'FAIR', 1: 'POOR' };
export function gradeName(g, subs) {
  if (g === 10 && subs && isPristine(subs)) return 'PRISTINE';
  return NAMES[g] || '';
}

// What the card really is. Recolored flaws still count: the damage is under the ink.
export function trueSubs(inst) {
  const c = centerPct(inst.dx, inst.dy);
  return subsFrom(inst.defects, c.worst);
}
export const trueGrade = (inst) => finalGrade(trueSubs(inst));

const COND = [[10, 6], [9.5, 3.5], [9, 2.2], [8.5, 1.6], [8, 1.3], [7, 1], [6, 0.7], [5, 0.5], [0, 0.35]];
export function conditionFactor(g) {
  for (const [min, f] of COND) if (g >= min) return f;
  return 0.35;
}
