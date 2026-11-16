// Graded card holders: a clear case with a printed label, Gemline (red) or Apex (blue).
import { LINES } from './data.js';
import { cardSVG } from './cardsvg.js';
import { cardTitle, variantLabels } from './gen.js';
import { gradeName } from './grading.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fmtG = (g) => (g % 1 ? g.toFixed(1) : String(g));

function barcode(seed) {
  let s = '', x = 6;
  for (let i = 0; i < 34; i++) { const w = ((seed * (i + 3) * 7) % 3) + 1; s += `<rect x="${x}" y="0" width="${w * 0.8}" height="12"/>`; x += w * 0.8 + 1.1; }
  return `<svg viewBox="0 0 ${x + 6} 12" preserveAspectRatio="none">${s}</svg>`;
}

// grade: number, or a label string for errors (e.g. "ERROR · 9")
export function slabHTML(inst, { grade, by = 'gemline', cert, label } = {}) {
  const L = LINES[inst.line];
  const c = cert || (inst.uid ? inst.uid.slice(-7).toUpperCase() : '0000000');
  const err = inst.v && (inst.v.noYellow || inst.v.inverted);
  const v = variantLabels(inst.v || {}, inst.line);
  const g = typeof grade === 'number' ? fmtG(grade) : grade;
  return `<div class="slab ${by}">
    <div class="slab-label">
      <div class="sl-main"><b>${by === 'apex' ? 'APEX GRADING' : 'GEMLINE AUTH.'}</b>
        <span>${L.year} ${esc(L.name.toUpperCase())}</span>
        <span class="sl-name">${esc(cardTitle(inst).toUpperCase())}</span>
        <span>#${String(inst.n).padStart(3, '0')}${v.length ? ' · ' + esc(v.join(' · ').toUpperCase()) : ''}${err ? ' · AUTHENTIC ERROR' : ''}</span></div>
      <div class="sl-grade"><b>${esc(g)}</b><span>${esc(label || gradeName(grade) || '')}</span></div>
      <div class="sl-bar">${barcode(c.charCodeAt(0) + c.length)}<span>${c}</span></div>
    </div>
    <div class="slab-well">${cardSVG(inst)}</div>
  </div>`;
}
