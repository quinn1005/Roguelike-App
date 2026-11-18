// Sealed booster boxes: 12 packs of one set. Open one yourself, or keep it sealed and let the
// market (and time out of print) decide what it's worth. Some night-market boxes are resealed:
// opened, picked clean of rares, and wrapped up again.
import { LINES, CARDS, PACKS, weekOf } from './data.js';
import { makeInst, rollVariants, pickQuality } from './gen.js';
import { STYLE, artWindow } from './packs.js';

export const PACKS_PER_BOX = 12;
// Sets still being printed don't gain value sitting on a shelf. Everything else is old stock.
export const IN_PRINT = ['bl', 'rd', 'hp'];
export const FACTORY_WEIGHT = 404; // grams: box plus 12 sealed packs
export const ORDER_DEPOSIT = 15;

export const boxBase = (line) => Math.round(PACKS[line].price * PACKS_PER_BOX * 0.85);
export const boxPrice = (line, day) => Math.max(20, Math.round(boxBase(line) * (0.6 + 0.4 * weekOf(day).market)));

// What a sealed box would fetch today: the market, plus 6% a week out of print.
export function sealedValue(box, day) {
  const weeks = Math.max(0, Math.floor((day - box.day) / 5));
  const age = IN_PRINT.includes(box.line) ? 1 : 1 + 0.06 * weeks;
  // Same market curve as Lou's price, so buying and reselling in the same week always loses the house cut.
  return Math.round(boxBase(box.line) * (0.6 + 0.4 * weekOf(day).market) * age);
}

function packCards(R, line, slots, opts = {}) {
  return slots.map((r) => {
    const pool = CARDS[line].filter((c) => c.r === r);
    const c = pool[Math.floor(R() * pool.length)] || CARDS[line][0];
    const inst = makeInst(R, line, c.n, pickQuality(R, -0.25));
    rollVariants(R, inst, { scale: 0.7, shadowless: 0, noYellow: 0.02 });
    if (line === 'hp') inst.v.vintage = false;
    if (line === 'ic') inst.v.run1 = false;
    if (opts.topper) { inst.v.holo = true; inst.from = { how: 'topper' }; }
    return inst;
  });
}

// Twelve packs. One "box topper" pack has a guaranteed holo rare (or mythic) in its last slot.
// A resealed box has had every rare and mythic taken out, and no topper.
export function rollBox(R, line, resealed = false) {
  const topper = resealed ? -1 : Math.floor(R() * PACKS_PER_BOX);
  return Array.from({ length: PACKS_PER_BOX }, (_, k) => {
    const last = R();
    let rare = last < 0.045 ? 'm' : last < 0.32 ? 'r' : 'u';
    if (k === topper) rare = R() < 0.12 ? 'm' : 'r';
    if (resealed && (rare === 'r' || rare === 'm')) rare = 'u';
    const cards = packCards(R, line, ['c', 'c', 'c', 'u'], {});
    cards.push(...packCards(R, line, [rare], { topper: k === topper }));
    return cards;
  });
}
// A resealed box is lighter: the rares are gone (and the packs were re-glued).
export const boxWeight = (box) => (box.resealed ? FACTORY_WEIGHT - (box.lightBy || 7) : FACTORY_WEIGHT + (box.wobble || 0));

// ------------------------------------------------------------------ art
let uid = 0;
export function boxSVG(line, o = {}) {
  const st = STYLE[line], p = 'bx' + (++uid);
  const [f0, f1, f2] = st.foil;
  const name = LINES[line].name.toUpperCase();
  const fs = Math.min(15, 150 / (name.length * (st.font.startsWith('Monoton') ? 0.95 : 0.7)));
  return `<svg viewBox="0 0 170 150" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="${p}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${f0}"/><stop offset=".55" stop-color="${f1}"/><stop offset="1" stop-color="${f2}"/></linearGradient>
    <linearGradient id="${p}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${f2}"/><stop offset="1" stop-color="#000"/></linearGradient>
    <linearGradient id="${p}w" x1="0" y1="0" x2="1" y2="1"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="${p}a"><rect x="22" y="58" width="96" height="58" rx="3"/></clipPath>
  </defs>
  <ellipse cx="80" cy="142" rx="74" ry="6" fill="#000" opacity=".45"/>
  <path d="M138 34L162 22V114L138 138Z" fill="url(#${p}s)"/>
  <path d="M8 34L32 22H162L138 34Z" fill="${f0}" opacity=".9"/>
  <rect x="8" y="34" width="130" height="104" fill="url(#${p}f)"/>
  <rect x="8" y="34" width="130" height="16" fill="${st.ink}" opacity=".7"/>
  <text x="73" y="45.5" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="7" letter-spacing="1" fill="${st.logo === '#2a2418' ? '#efe6cf' : st.logo}">BOOSTER BOX · ${PACKS_PER_BOX} PACKS</text>
  <rect x="20" y="56" width="100" height="62" rx="4" fill="${st.ink}"/>
  <g clip-path="url(#${p}a)">${artWindow(line, 22, 58, 96, 58)}</g>
  <text x="73" y="132" text-anchor="middle" font-family="${st.font}" font-weight="${st.weight}" font-size="${fs}" fill="${st.logo}" stroke="${st.outline || st.ink}" stroke-width="${st.sw ? st.sw * 0.8 : 2}" paint-order="stroke">${name}</text>
  <rect x="8" y="22" width="154" height="116" fill="url(#${p}w)" opacity="${o.resealed ? 0.35 : 1}" style="mix-blend-mode:screen"/>
  ${o.resealed ? '<path d="M8 36Q40 33 70 37T138 35" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"/>' : ''}
  </svg>`;
}

// What the loupe shows at a corner of the shrink wrap.
export function seamSVG(resealed) {
  const folds = resealed
    ? `<path d="M10 70Q40 52 70 76T130 64T190 78" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/>
       <path d="M10 70Q40 52 70 76T130 64T190 78" fill="none" stroke="#d8c8a0" stroke-opacity=".6" stroke-width="2"/>
       ${[[40, 60], [96, 72], [150, 66], [70, 90], [120, 50]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.5" fill="none" stroke="#fff" stroke-opacity=".7"/>`).join('')}
       <path d="M30 100Q60 96 80 104" stroke="#3a2a1a" stroke-opacity=".5" stroke-width="3" fill="none"/>`
    : `<path d="M10 20L100 74L190 20" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2"/>
       <path d="M100 74V130" stroke="#fff" stroke-opacity=".8" stroke-width="2"/>
       <path d="M18 24L100 72M182 24L100 72" stroke="#fff" stroke-opacity=".25" stroke-width="6"/>`;
  return `<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="130" fill="#5a4a6a"/>
    <rect width="200" height="130" fill="url(#wrapgrain)" opacity=".4"/>
    <defs><pattern id="wrapgrain" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r=".7" fill="#fff" opacity=".4"/></pattern></defs>
    ${folds}
    <text x="100" y="124" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="8" fill="#fff" opacity=".8">LOUPE · CORNER OF THE WRAP</text></svg>`;
}
