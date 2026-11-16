// Draws cards as SVG strings, built entirely from data.
// A card "instance" holds everything physical about one copy:
//   { line, n, v:{holo,first,shadowless,noYellow}, defects:[], dx, dy,
//     fake:{kinds:[]}|null, alt:{kind, corner?}|null }
import { LINES, CARDS } from './data.js';
import { centerPct } from './grading.js';
import { FRONT2, BACK2, STOCK2, RSYM, copyrightText, microText, mlHidden, spPerfs } from './cardsvg2.js';
import { ggArt, nsArt, blArt, EL, WEAK, RES, mlArt, tbArt, rdArt, gaArt, hpSym, icArt, cfPhoto, spArt } from './art.js';
export { copyrightText, icStats, spPerfs } from './cardsvg2.js';

let uidc = 0;
export const def = (inst) => CARDS[inst.line].find((c) => c.n === inst.n);
const pad3 = (n) => String(n).padStart(3, '0');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fit = (text, maxW, base, k) => Math.min(base, maxW / (text.length * k));

// ---------------------------------------------------------------- public API
// opts: face 'front'|'back', micro (loupe detail), uv, ruler, clean (reference image), cls
export function cardSVG(inst, o = {}) {
  const p = 'c' + (++uidc) + '-';
  const face = o.face || 'front';
  const L = LINES[inst.line];
  const trimmed = inst.alt && inst.alt.kind === 'trim' && !o.clean;
  const dx = o.clean ? 0 : inst.dx || 0;
  const dy = o.clean ? 0 : inst.dy || 0;
  const fakePrint = !o.clean && inst.fake && inst.fake.kinds.includes('print');
  let printed = face === 'front' ? FRONT[inst.line](inst, p, o) : BACK[inst.line](inst, p, o);
  if (face === 'front' && inst.v && inst.v.fullart) printed += fullArtLayer(inst, p);
  if (inst.v && inst.v.ghost) printed = face === 'front' ? `<g filter="url(#${p}ghost)">${printed}</g><text x="200" y="300" font-family="'Special Elite',monospace" font-size="11" fill="#5a5a5a" transform="rotate(-8 200 300)">E.M. 1/1</text>` : ghostBack();
  if (o.microprint) printed += `<text x="125" y="343.6" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="2.3" letter-spacing=".2" fill="${MICROCOL[inst.line] || '#555'}">${microText(inst)}</text>`;
  const stock = STOCK[inst.line];
  let filt = '';
  if (face === 'front' && inst.v && inst.v.noYellow) filt = `filter="url(#${p}ny)"`;
  if (o.micro && fakePrint) filt = `filter="url(#${p}blur)"`;

  let s = `<defs>
    <clipPath id="${p}card"><path d="${cardPath(cornerRadii(inst))}"/></clipPath>
    <filter id="${p}ny" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 0 0 1  0 0 0 1 0"/></filter>
    <filter id="${p}blur"><feGaussianBlur stdDeviation="0.9"/></filter>
    <filter id="${p}glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="${p}noise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.3  0 0 0 1.6 -0.7"/></filter>
    <pattern id="${p}ros" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle cx="1.5" cy="1.5" r="0.6" fill="#000"/></pattern>
    <filter id="${p}ghost" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.25 0.25 0.25 0 0.5  0.25 0.25 0.25 0 0.5  0.27 0.27 0.27 0 0.52  0 0 0 1 0"/></filter>
  </defs>`;
  const tr = trimmed ? 'transform="translate(2.2 3.2) scale(0.982)"' : '';
  s += `<g ${tr}><g clip-path="url(#${p}card)">`;
  s += `<rect width="250" height="350" fill="${stock}"/>`;
  s += `<g transform="translate(${dx} ${dy})" ${filt}>${printed}</g>`;
  if (face === 'front' && inst.v && inst.v.holo) s += holoLayer(inst, p, o, dx, dy);
  if (!o.clean) s += defectsSVG(inst, o, face);
  if (o.micro) s += microLayer(inst, p, fakePrint, o, face, dx, dy);
  if (o.tilt && face === 'front' && inst.v && inst.v.holo) s += holoLayer(inst, p, o, dx + 18, dy - 12);
  if (o.uv) s += uvLayer(inst, p, face);
  if (o.light) s += lightLayer(inst, trimmed);
  if (o.water && o.water.length) s += waterLayer(inst, o.water);
  s += `</g>`;
  if (o.ruler) s += rulerLayer(inst, dx, dy, trimmed);
  s += `</g>`;
  return `<svg viewBox="0 0 250 350" xmlns="http://www.w3.org/2000/svg" class="${o.cls || ''}">${s}</svg>`;
}

// Physical size the ruler reports, in inches.
export function cardSize(inst) {
  return inst.alt && inst.alt.kind === 'trim' ? '2.46 × 3.44 in' : '2.50 × 3.50 in';
}

const STOCK = { gg: '#ffd400', ns: '#0b0618', bl: '#c9d3e0', ...STOCK2 };
const MICROCOL = { gg: '#1a1a1a', ns: '#2ee6ff', bl: '#4a6075', ml: '#c9a96b', tb: '#7fd1c1', rd: '#f2e9d8', ga: '#f3e8d2', hp: '#b8892d', ic: '#c68a4a', cf: '#6a5a3a', sp: '#1b2a6b' };

// Corner radii in card units: 12 is a normal 2.0 mm corner, 18 is an Alpha 3.0 mm corner.
export function cornerRadii(inst) {
  if (inst.alt && inst.alt.kind === 'alphatrim') return [18, 18, 14, 18];
  if (inst.v && inst.v.alpha) return [18, 18, 18, 18];
  return [12, 12, 12, 12];
}
function cardPath([a, b, c, d]) {
  return `M${a} 0H${250 - b}A${b} ${b} 0 0 1 250 ${b}V${350 - c}A${c} ${c} 0 0 1 ${250 - c} 350H${d}A${d} ${d} 0 0 1 0 ${350 - d}V${a}A${a} ${a} 0 0 1 ${a} 0Z`;
}
// Weight on the precision scale, in grams.
export function cardWeight(inst) {
  const L = LINES[inst.line];
  const jitter = ((inst.n * 7 + (inst.dx || 0) * 13) % 5) / 100 - 0.02;
  let w = L.weight + jitter;
  if (inst.fake && inst.fake.kinds.includes('weight')) w += inst.fake.wd || 0.22;
  return w.toFixed(2) + ' g';
}
function ghostBack() {
  return `<rect x="8" y="8" width="234" height="334" rx="8" fill="#f2efe6" stroke="#cfc8b8"/>
  <text x="125" y="170" text-anchor="middle" font-family="'Special Elite',monospace" font-size="14" fill="#4a4a4a">E.M. · 1 of 1</text>
  <text x="125" y="192" text-anchor="middle" font-family="'Special Elite',monospace" font-size="9" fill="#6a6a6a">for whoever finds it</text>
  <text x="125" y="320" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="6" fill="#8a8a8a">HALLOWAY PRINT WORKS · PROOF SHEET 9</text>`;
}
function lightLayer(inst, trimmed) {
  const thin = inst.fake && inst.fake.kinds.includes('stock');
  let s = `<rect width="250" height="350" fill="#000" opacity=".62"/>`;
  s += thin ? `<rect width="250" height="350" fill="#ffffff" opacity=".78" style="mix-blend-mode:screen"/>` : `<rect width="250" height="350" fill="#ffb060" opacity=".38" style="mix-blend-mode:screen"/>`;
  if (trimmed) s += `<rect x="1.5" y="1.5" width="247" height="347" rx="11" fill="none" stroke="#fffbe8" stroke-width="3" stroke-dasharray="14 3 6 4"/>`;
  if (inst.clue === 'light') s += `<g font-family="'Special Elite',monospace" fill="#3a2a1a" opacity=".75" text-anchor="middle"><text x="125" y="120" font-size="11" transform="rotate(6 125 120)">Proof sheet 9.</text><text x="125" y="138" font-size="11" transform="rotate(6 125 138)">The tarp. Thursday.</text><text x="150" y="158" font-size="11" transform="rotate(6 150 158)">— E.M.</text></g>`;
  return s;
}
function waterLayer(inst, drops) {
  const beads = inst.line === 'tb' && !(inst.fake && inst.fake.kinds.includes('absorb'));
  return drops.map(({ x, y }) => beads
    ? `<circle cx="${x}" cy="${y}" r="6" fill="#bfe6ff" opacity=".45" stroke="#ffffff" stroke-width=".7"/><circle cx="${x - 2}" cy="${y - 2}" r="1.6" fill="#ffffff" opacity=".9"/>`
    : `<ellipse cx="${x}" cy="${y}" rx="15" ry="12" fill="#6a4a20" opacity=".32"/><ellipse cx="${x}" cy="${y}" rx="15" ry="12" fill="none" stroke="#4a2f10" stroke-width="1.2" opacity=".5"/>`).join('');
}

// ---------------------------------------------------------------- GRIM GROCERS
function ggFront(inst, p) {
  const c = def(inst), a = c.art, L = LINES.gg;
  const fs = fit(c.name.toUpperCase(), 196, 19, 0.66);
  const cr = copyrightText(inst);
  return `
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#ffd400" stroke="#1a1a1a" stroke-width="2.5"/>
  <rect x="17" y="15" width="216" height="30" rx="15" fill="#1f3fbf" stroke="#1a1a1a" stroke-width="2"/>
  <text x="125" y="36.5" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="${fs}" fill="#ffffff" stroke="#1a1a1a" stroke-width="3" paint-order="stroke">${esc(c.name.toUpperCase())}</text>
  <clipPath id="${p}gw"><rect x="22" y="52" width="206" height="162" rx="10"/></clipPath>
  <g clip-path="url(#${p}gw)">${ggArt(a)}</g>
  <rect x="22" y="52" width="206" height="162" rx="10" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>
  <rect x="22" y="222" width="206" height="88" rx="8" fill="#ffffff" stroke="#1a1a1a" stroke-width="2"/>
  <text x="125" y="240" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="11" fill="#1f3fbf">${esc(c.type)}</text>
  <text text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="12.5" fill="#1a1a1a"><tspan x="125" y="262">${esc(c.text[0])}</tspan><tspan x="125" y="277">${esc(c.text[1])}</tspan></text>
  <text x="125" y="299" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="10.5" fill="#e6372e">${esc(c.stats)}</text>
  <text x="22" y="329" font-family="'JetBrains Mono',monospace" font-size="8" fill="#1a1a1a">${L.setCode} · ${pad3(c.n)}/${pad3(L.total)}</text>
  <text x="228" y="329" text-anchor="end" font-family="'JetBrains Mono',monospace" font-size="5.6" fill="#1a1a1a">${esc(cr)}</text>
  ${c.r === 'm' ? '<path d="M125 327l2 5 5 .5-4 3 1.5 5-4.5-3-4.5 3 1.5-5-4-3 5-.5z" fill="#e6372e" stroke="#1a1a1a" stroke-width=".8"/>' : c.r === 'r' ? '<path d="M120 334l5-5 5 5-5 5z" fill="#1a1a1a"/>' : c.r === 'u' ? '<circle cx="125" cy="334" r="3.5" fill="none" stroke="#1a1a1a" stroke-width="1.5"/>' : '<circle cx="125" cy="334" r="2.5" fill="#1a1a1a"/>'}`;
}


function ggBack(inst, p) {
  const wrongYear = inst.fake && inst.fake.kinds.includes('back');
  return `<pattern id="${p}chk" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#6b3fa0"/><rect width="10" height="10" fill="#7c4cb5"/><rect x="10" y="10" width="10" height="10" fill="#7c4cb5"/></pattern>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#ffd400" stroke="#1a1a1a" stroke-width="2.5"/>
  <rect x="16" y="16" width="218" height="318" rx="8" fill="url(#${p}chk)" stroke="#1a1a1a" stroke-width="2"/>
  <path d="M58 172C58 118 98 98 125 98C162 98 192 124 192 170C192 198 178 212 172 228L168 254C166 264 156 264 156 254L154 232C140 240 120 240 110 236L108 266C106 278 94 278 94 266L94 226C72 212 58 198 58 172Z" fill="#7ccc4f" stroke="#1a1a1a" stroke-width="3"/>
  <g font-family="Fredoka,sans-serif" font-weight="700" text-anchor="middle" fill="#ffffff" stroke="#1a1a1a" stroke-width="4" paint-order="stroke"><text x="125" y="162" font-size="34">GRIM</text><text x="125" y="194" font-size="25">GROCERS</text></g>
  <g fill="#e6372e" stroke="#1a1a1a" stroke-width="1.5"><circle cx="48" cy="60" r="10"/><circle cx="202" cy="62" r="10"/></g>
  <path d="M48 50q2-6 6-6M202 52q2-6 6-6" stroke="#2e7d32" stroke-width="2.5" fill="none"/>
  <rect x="56" y="292" width="138" height="20" rx="10" fill="#1a1a1a"/>
  <text x="125" y="305.5" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="8" fill="#ffd400">GRISTLE TOYS · ${wrongYear ? '1995' : '1994'}</text>`;
}

// ---------------------------------------------------------------- NEON SAINTS
function nsFront(inst, p) {
  const c = def(inst), a = c.art, L = LINES.ns;
  const nm = c.name.toUpperCase();
  const fs = fit(nm, 212, 17, 0.98);
  const cr = copyrightText(inst);
  return `<linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12002b"/><stop offset=".6" stop-color="#5a0a6e"/><stop offset="1" stop-color="#ff3d8b"/></linearGradient>
  <linearGradient id="${p}sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe45c"/><stop offset="1" stop-color="${a.a}"/></linearGradient>
  <linearGradient id="${p}fr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4fd8"/><stop offset="1" stop-color="#2ee6ff"/></linearGradient>
  <clipPath id="${p}nw"><rect x="22" y="46" width="206" height="170"/></clipPath>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#0b0618" stroke="url(#${p}fr)" stroke-width="2"/>
  <text x="125" y="36" text-anchor="middle" font-family="Monoton,sans-serif" font-size="${fs}" fill="${a.a}">${esc(nm)}</text>
  <g clip-path="url(#${p}nw)">${nsArt(a, p)}</g>
  <rect x="22" y="46" width="206" height="170" fill="none" stroke="${a.a}"/>
  <rect x="22" y="224" width="206" height="88" rx="3" fill="#140a26" stroke="url(#${p}fr)" stroke-width=".8"/>
  <text x="125" y="244" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="9.5" fill="#2ee6ff">${esc(c.stats)}</text>
  <text x="125" y="270" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="${fit(c.quote, 196, 11, 0.47)}" fill="#ffd6f5">${esc(c.quote)}</text>
  <text x="125" y="294" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="8.5" fill="#ff4fd8">FINISHER: ${esc(c.finisher)}</text>
  <text x="22" y="329" font-family="'JetBrains Mono',monospace" font-size="8" fill="#2ee6ff">${L.setCode} · ${pad3(c.n)}/${pad3(L.total)}</text>
  <text x="228" y="329" text-anchor="end" font-family="'JetBrains Mono',monospace" font-size="5.2" fill="#2ee6ff">${esc(cr)}</text>
  <text x="125" y="330" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#ff4fd8">${RSYM[c.r]}</text>`;
}


function nsBack(inst, p) {
  const wrong = inst.fake && inst.fake.kinds.includes('back');
  return `<linearGradient id="${p}bs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0618"/><stop offset=".7" stop-color="#5a0a6e"/><stop offset="1" stop-color="#ff3d8b"/></linearGradient>
  <linearGradient id="${p}bsun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe45c"/><stop offset="1" stop-color="#ff4f9a"/></linearGradient>
  <linearGradient id="${p}bf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4fd8"/><stop offset="1" stop-color="#2ee6ff"/></linearGradient>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#0b0618" stroke="url(#${p}bf)" stroke-width="2.5"/>
  <rect x="14" y="14" width="222" height="200" fill="url(#${p}bs)"/>
  <circle cx="125" cy="170" r="62" fill="url(#${p}bsun)"/>
  <g fill="#6a0d70"><rect x="60" y="168" width="130" height="3"/><rect x="60" y="180" width="130" height="5"/><rect x="60" y="193" width="130" height="7"/>${wrong ? '' : '<rect x="60" y="206" width="130" height="8"/>'}</g>
  <rect x="14" y="214" width="222" height="122" fill="#12002b"/>
  <g stroke="#2ee6ff" stroke-width=".8" opacity=".7"><line x1="14" y1="214" x2="236" y2="214"/><line x1="14" y1="222" x2="236" y2="222"/><line x1="14" y1="234" x2="236" y2="234"/><line x1="14" y1="252" x2="236" y2="252"/><line x1="14" y1="280" x2="236" y2="280"/><line x1="14" y1="322" x2="236" y2="322"/>
  <line x1="125" y1="214" x2="125" y2="336"/><line x1="115" y1="214" x2="65" y2="336"/><line x1="135" y1="214" x2="185" y2="336"/><line x1="105" y1="214" x2="5" y2="336"/><line x1="145" y1="214" x2="245" y2="336"/></g>
  <text x="125" y="96" text-anchor="middle" font-family="Monoton,sans-serif" font-size="38" fill="#ff4fd8">NEON</text>
  <text x="125" y="300" text-anchor="middle" font-family="Monoton,sans-serif" font-size="30" fill="#2ee6ff">SAINTS</text>`;
}

// ---------------------------------------------------------------- BLOOMLINGS

function blFront(inst, p) {
  const c = def(inst), a = c.art, L = LINES.bl, e = EL[c.el];
  const showShadow = !(inst.v && inst.v.shadowless);
  const cr = copyrightText(inst);
  const badge = (x, y, el, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${EL[el].c}" stroke="#13283d" stroke-width=".6"/>${EL[el].glyph(x, y, r / 8)}`;
  const moves = c.moves.map(([nm, dmg, cost], i) => {
    const y = 224 + i * 42;
    let icons = '';
    for (let k = 0; k < cost; k++) icons += badge(30 + k * 13, y, c.el, 5.5);
    const tx = 30 + cost * 13 + 2;
    return `${icons}<text x="${tx}" y="${y + 4}" font-family="Fredoka,sans-serif" font-weight="600" font-size="${fit(nm, 150 - cost * 13, 12, 0.55)}" fill="#13283d">${esc(nm)}</text>
      <text x="222" y="${y + 5}" text-anchor="end" font-family="Fredoka,sans-serif" font-weight="700" font-size="14" fill="#13283d">${dmg}</text>
      <line x1="26" y1="${y + 26}" x2="224" y2="${y + 26}" stroke="#8aa2b8" stroke-width=".6"/>`;
  }).join('');
  return `<linearGradient id="${p}face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f6fc"/><stop offset="1" stop-color="#bfe3f2"/></linearGradient>
  <clipPath id="${p}bw"><rect x="22" y="48" width="206" height="138"/></clipPath>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="url(#${p}face)" stroke="#8aa2b8" stroke-width="1"/>
  <rect x="16" y="15" width="44" height="11" rx="5.5" fill="#1d4e75"/>
  <text x="38" y="23.5" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="6.5" fill="#ffffff">${{ c: 'BASIC', u: 'STAGE 1', r: 'STAGE 2', m: 'ANCIENT' }[c.r]}</text>
  <text x="18" y="42" font-family="Fredoka,sans-serif" font-weight="700" font-size="${fit(c.name, 130, 17, 0.56)}" fill="#13283d">${esc(c.name)}</text>
  <text x="204" y="35" text-anchor="end" font-family="Fredoka,sans-serif" font-weight="700" font-size="12" fill="#13283d"><tspan font-size="7" font-family="'JetBrains Mono',monospace">VIGOR </tspan>${c.vigor}</text>
  ${badge(222, 31, c.el, 9)}
  ${showShadow ? '<rect x="25.5" y="51.5" width="206" height="138" fill="#2b3a4a" opacity=".38"/>' : ''}
  <g clip-path="url(#${p}bw)">${blArt(c)}</g>
  <rect x="22" y="48" width="206" height="138" fill="none" stroke="#8aa2b8" stroke-width="3"/>
  <rect x="40" y="191" width="170" height="11" rx="5.5" fill="#d6eef8"/>
  <text x="125" y="199" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="6.8" fill="#4a6075">${esc(c.kind)} · ${c.el.toUpperCase()} TYPE</text>
  ${inst.v && inst.v.first ? '<circle cx="31" cy="196" r="7" fill="#13283d"/><text x="31" y="198.5" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="6.5" fill="#ffffff">1st</text>' : ''}
  ${moves}
  <text x="125" y="307" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="6.6" fill="#4a6075">WEAK: ${WEAK[c.el]} ×2 · RESIST: ${RES[c.el]} −20 · RETREAT: ${Math.ceil(c.vigor / 50)}</text>
  <text x="20" y="330" font-family="'JetBrains Mono',monospace" font-size="7.5" fill="#4a6075">${L.setCode} · ${pad3(c.n)}/${pad3(L.total)}</text>
  <text x="230" y="330" text-anchor="end" font-family="'JetBrains Mono',monospace" font-size="5.4" fill="#4a6075">${esc(cr)}</text>
  <text x="125" y="331" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#13283d">${RSYM[c.r]}</text>`;
}


function blBack(inst, p) {
  const wrong = inst.fake && inst.fake.kinds.includes('back');
  const order = wrong ? ['ember', 'leaf', 'water'] : ['water', 'leaf', 'ember'];
  const pos = [[125, 152], [105, 187], [145, 187]];
  return `<radialGradient id="${p}bk" cx="125" cy="175" r="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6cc7f0"/><stop offset="1" stop-color="#1d4e75"/></radialGradient>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="url(#${p}bk)" stroke="#8aa2b8" stroke-width="1"/>
  <g fill="none" stroke="#ffffff" opacity=".22" stroke-width="2"><circle cx="125" cy="175" r="70" stroke-dasharray="14 10"/><circle cx="125" cy="175" r="92" stroke-dasharray="4 10"/><circle cx="125" cy="175" r="116" stroke-dasharray="22 14"/></g>
  <circle cx="125" cy="175" r="50" fill="#ffffff" stroke="#13283d" stroke-width="3"/>
  ${order.map((el, i) => `<circle cx="${pos[i][0]}" cy="${pos[i][1]}" r="14" fill="${EL[el].c}" stroke="#13283d" stroke-width="1.5"/>${EL[el].glyph(pos[i][0], pos[i][1], 1.3)}`).join('')}
  <text x="125" y="92" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="30" fill="#ffffff" stroke="#13283d" stroke-width="4" paint-order="stroke">BLOOMLINGS</text>
  <text x="125" y="276" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="12" fill="#ffffff">Catch · Raise · Bloom</text>`;
}

const FRONT = { gg: ggFront, ns: nsFront, bl: blFront, ...FRONT2 };
const BACK = { gg: ggBack, ns: nsBack, bl: blBack, ...BACK2 };

// ---------------------------------------------------------------- layers
// Where each line's art window sits, and the parts of the front a full-art print keeps
// (name header and info panel), so every tell on the card still reads.
export const ART_BOX = {
  gg: [22, 52, 206, 162], ns: [22, 46, 206, 170], bl: [22, 48, 206, 138], ml: [22, 46, 206, 170], tb: [22, 46, 206, 170], rd: [30, 64, 190, 152],
  ga: [24, 46, 202, 150], hp: [22, 46, 206, 170], ic: [22, 46, 206, 170], cf: [38, 62, 174, 128], sp: [24, 70, 202, 170],
};
const FA_KEEP = {
  gg: [[14, 13, 222, 34], 220], ns: [[14, 14, 222, 30], 222], bl: [[12, 12, 226, 36], 188], ml: [[14, 14, 222, 30], 222], tb: [[14, 14, 222, 30], 222],
  rd: [[12, 12, 226, 47], 222], ga: [[18, 18, 214, 26], 198], hp: [[14, 14, 222, 30], 222], ic: [[14, 14, 222, 30], 222], cf: [[14, 14, 222, 28], 226], sp: [[16, 16, 218, 46], 246],
};
function artOnly(inst, p) {
  const c = def(inst), a = c.art;
  switch (inst.line) {
    case 'gg': return ggArt(a);
    case 'ns': return nsArt(a, p);
    case 'bl': return blArt(c);
    case 'ml': return mlArt(a);
    case 'tb': return tbArt(a, p);
    case 'rd': return rdArt(a, p);
    case 'ga': return gaArt(c);
    case 'hp': { const G = inst.v.vintage ? `url(#${p}tarn)` : `url(#${p}gold)`; return `<rect x="22" y="46" width="206" height="170" fill="#15110c"/><circle cx="125" cy="140" r="82" fill="none" stroke="${G}" stroke-width="40" stroke-dasharray="1.2 5" opacity=".4"/><circle cx="125" cy="140" r="60" fill="#15110c"/>${hpSym(a.sym, G)}`; }
    case 'ic': return icArt(c, p);
    case 'cf': return cfPhoto(a, p);
    case 'sp': return `<rect x="24" y="70" width="202" height="170" fill="url(#${p}ss)"/><g ${inst.v.inverted ? 'transform="rotate(180 125 155)"' : ''}>${spArt(a.subj, a.comp)}</g>`;
    default: return '';
  }
}
// Full art: the illustration spills over the whole card. A soft, enlarged copy fills the
// edges; the sharp art sits above it, and the original name and info panels show through.
function fullArtLayer(inst, p) {
  const [x, y, w, h] = ART_BOX[inst.line];
  const [top, bot] = FA_KEEP[inst.line];
  const cx = x + w / 2, cy = y + h / 2;
  const art = artOnly(inst, p);
  const cover = Math.max(250 / w, 350 / h) * 1.04;
  const main = Math.max(250 / w, (bot - 6) / h);
  const mainCy = 6 + (h * main) / 2;
  const r = 6;
  return `<clipPath id="${p}faw"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
  <filter id="${p}fab" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.4"/></filter>
  <linearGradient id="${p}fam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".86" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="${p}fafoil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".25" stop-color="#ff9ad8"/><stop offset=".5" stop-color="#9af0ff"/><stop offset=".75" stop-color="#ffe27a"/><stop offset="1" stop-color="#fff2b8"/></linearGradient>
  <mask id="${p}fak" maskUnits="userSpaceOnUse" x="0" y="0" width="250" height="350"><rect width="250" height="350" fill="#fff"/>
    <rect x="${top[0]}" y="${top[1]}" width="${top[2]}" height="${top[3]}" rx="${r}" fill="#000"/><rect x="14" y="${bot}" width="222" height="${342 - bot}" rx="${r}" fill="#000"/></mask>
  <mask id="${p}fam2" maskUnits="userSpaceOnUse" x="0" y="0" width="250" height="350"><rect width="250" height="${bot + 8}" fill="url(#${p}fam)"/></mask>
  <g mask="url(#${p}fak)">
    <g filter="url(#${p}fab)" transform="translate(125 175) scale(${cover.toFixed(3)}) translate(${-cx} ${-cy})"><g clip-path="url(#${p}faw)">${art}</g></g>
    <g mask="url(#${p}fam2)"><g transform="translate(125 ${mainCy.toFixed(1)}) scale(${main.toFixed(3)}) translate(${-cx} ${-cy})"><g clip-path="url(#${p}faw)">${art}</g></g></g>
  </g>
  <g fill="none" stroke="url(#${p}fafoil)">
    <rect x="${top[0] - 1}" y="${top[1] - 1}" width="${top[2] + 2}" height="${top[3] + 2}" rx="${r + 1}" stroke-width="1.6"/>
    <rect x="13" y="${bot - 1}" width="224" height="${344 - bot}" rx="${r + 1}" stroke-width="1.6"/>
    <rect x="3" y="3" width="244" height="344" rx="10" stroke-width="4"/>
  </g>`;
}

// Holo: a rainbow sheen and fine glitter over the art window (the whole card on full art).
function holoLayer(inst, p, o, dx, dy) {
  const box = inst.v && inst.v.fullart ? [0, 0, 250, 350] : ART_BOX[inst.line] || [22, 46, 206, 170];
  const id = p + 'holo' + (o.tilt && dx !== (inst.dx || 0) ? 't' : '');
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff50dc" stop-opacity="0"/><stop offset=".3" stop-color="#ff50dc" stop-opacity=".5"/><stop offset=".5" stop-color="#50f0ff" stop-opacity=".5"/><stop offset=".7" stop-color="#fff56e" stop-opacity=".45"/><stop offset="1" stop-color="#fff56e" stop-opacity="0"/></linearGradient>
  <pattern id="${id}g" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="2" cy="2" r=".7" fill="#ffffff"/><circle cx="6.5" cy="6" r=".45" fill="#bff8ff"/></pattern>
  <rect x="${box[0] + dx}" y="${box[1] + dy}" width="${box[2]}" height="${box[3]}" fill="url(#${id}g)" opacity=".5" style="mix-blend-mode:screen"/>
  <rect class="holo-sheen" x="${box[0] + dx}" y="${box[1] + dy}" width="${box[2]}" height="${box[3]}" fill="url(#${id})" opacity="${inst.v.fullart ? 0.6 : 1}" style="mix-blend-mode:screen"/>`;
}

// Defects: corner/edge/surface marks. Severity 1 marks only show under the loupe.
export function defectsSVG(inst, o, face = 'front') {
  return (inst.defects || []).map((d) => {
    if ((d.face || 'front') !== face) return '';
    if (d.sev === 1 && !o.micro) return '';
    if (inst.alt && inst.alt.kind === 'recolor' && d.id === inst.alt.hidden) return '';
    return defectShape(d);
  }).join('');
}

function defectShape(d) {
  const W = '#ffffff';
  if (d.cat === 'corner') {
    const w = [0, 1.6, 3.4, 6][d.sev];
    const arc = { tl: 'M0 16A16 16 0 0 1 16 0', tr: 'M234 0A16 16 0 0 1 250 16', bl: 'M0 334A16 16 0 0 0 16 350', br: 'M250 334A16 16 0 0 1 234 350' }[d.pos];
    let s = `<path d="${arc}" fill="none" stroke="${W}" stroke-width="${w * 2}" opacity=".92"/>`;
    if (d.sev === 3) {
      const f = { tl: 'M0 22L22 0', tr: 'M228 0L250 22', bl: 'M0 328L22 350', br: 'M250 328L228 350' }[d.pos];
      s += `<path d="${f}" stroke="#000" stroke-opacity=".35" stroke-width="1.5"/><path d="${f}" stroke="${W}" stroke-opacity=".7" stroke-width="1" transform="translate(1 1)"/>`;
    }
    return s;
  }
  if (d.cat === 'edge') {
    const L = [0, 5, 11, 20][d.sev], t = [0, 1.4, 2.2, 3.2][d.sev];
    let pts = [];
    for (let i = 0; i <= 6; i++) { const u = (i / 6 - 0.5) * L; const j = t * (0.4 + 0.6 * ((i * 37) % 7) / 6); pts.push([u, j]); }
    const map = { l: ([u, j]) => [j, d.y + u], r: ([u, j]) => [250 - j, d.y + u], t: ([u, j]) => [d.x + u, j], b: ([u, j]) => [d.x + u, 350 - j] }[d.side];
    const base = { l: (u) => [0, d.y + u], r: (u) => [250, d.y + u], t: (u) => [d.x + u, 0], b: (u) => [d.x + u, 350] }[d.side];
    const path = [base(-L / 2), ...pts.map(map), base(L / 2)].map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('') + 'Z';
    return `<path d="${path}" fill="${W}" opacity=".95"/>`;
  }
  // surface
  if (d.kind === 'scratch') {
    const a = (d.ang || 0) * Math.PI / 180, l = d.sev === 1 ? 14 : 26;
    const x1 = d.x - Math.cos(a) * l / 2, y1 = d.y - Math.sin(a) * l / 2, x2 = d.x + Math.cos(a) * l / 2, y2 = d.y + Math.sin(a) * l / 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${W}" stroke-width="${d.sev === 1 ? 0.6 : 1.1}" opacity="${d.sev === 1 ? 0.75 : 0.6}" stroke-linecap="round"/>`;
  }
  if (d.kind === 'printline') return `<line x1="${d.x}" y1="${d.y - 40}" x2="${d.x}" y2="${d.y + 40}" stroke="#ff4fd8" stroke-width=".5" opacity=".7"/>`;
  if (d.kind === 'dimple') return `<circle cx="${d.x}" cy="${d.y}" r="1.6" fill="none" stroke="#000" stroke-opacity=".35" stroke-width=".7"/><circle cx="${d.x + 0.5}" cy="${d.y + 0.5}" r="1.6" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".5"/>`;
  if (d.kind === 'stain') return `<ellipse cx="${d.x}" cy="${d.y}" rx="11" ry="8" fill="#8a5a20" opacity=".26"/><ellipse cx="${d.x + 3}" cy="${d.y - 1}" rx="6" ry="4" fill="#8a5a20" opacity=".18"/>`;
  if (d.kind === 'crease') {
    const a = (d.ang || 0) * Math.PI / 180, l = 120;
    const x1 = d.x - Math.cos(a) * l / 2, y1 = d.y - Math.sin(a) * l / 2, x2 = d.x + Math.cos(a) * l / 2, y2 = d.y + Math.sin(a) * l / 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-opacity=".35" stroke-width="1.6"/><line x1="${x1 + 1}" y1="${y1 + 1}" x2="${x2 + 1}" y2="${y2 + 1}" stroke="#fff" stroke-opacity=".75" stroke-width="1"/>`;
  }
  return '';
}

function swirl(cx, cy, dir) {
  const cols = ['#ff7ad9', '#7af0ff', '#fff27a', '#9dffb0'];
  let out = '';
  for (let k = 0; k < 14; k++) {
    const th0 = (k / 14) * Math.PI * 2;
    let d = '';
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const r = 4 + t * 92, th = th0 + dir * t * 2.6;
      d += (t === 0 ? 'M' : 'L') + (cx + Math.cos(th) * r).toFixed(1) + ' ' + (cy + Math.sin(th) * r).toFixed(1);
    }
    out += `<path d="${d}" fill="none" stroke="${cols[k % 4]}" stroke-width="${1.6 - (k % 3) * 0.3}" opacity=".32" stroke-linecap="round"/>`;
  }
  return `<g style="mix-blend-mode:screen">${out}</g>`;
}

function microLayer(inst, p, fakePrint, o = {}, face = 'front', dx = 0, dy = 0) {
  let s = '';
  if (fakePrint) s += `<rect width="250" height="350" filter="url(#${p}noise)" opacity=".55"/>`;
  else s += `<rect width="250" height="350" fill="url(#${p}ros)" opacity=".22" style="mix-blend-mode:multiply"/>`;
  if (face === 'front' && inst.v && inst.v.holo) {
    const ccw = inst.fake && inst.fake.kinds.includes('swirl');
    const box = inst.v.fullart ? [8, 8, 234, 334] : ART_BOX[inst.line];
    s += `<clipPath id="${p}sw"><rect x="${box[0] + dx}" y="${box[1] + dy}" width="${box[2]}" height="${box[3]}"/></clipPath><g clip-path="url(#${p}sw)">${swirl(box[0] + box[2] / 2 + dx, box[1] + box[3] / 2 + dy, ccw ? -1 : 1)}</g>`;
  }
  // Gold leaf flakes on genuine Hollow Pantheon, under the microscope only.
  if (o.microprint && inst.line === 'hp' && !(inst.fake && inst.fake.kinds.includes('paint'))) {
    let f = '';
    for (let k = 0; k < 120; k++) { const x = (k * 37) % 250, y = (k * 53) % 350; f += `<path d="M${x} ${y}l2.2 .6-.8 1.8-1.9-.4z"/>`; }
    s += `<g fill="#fff6c9" opacity=".55">${f}</g>`;
  }
  return s;
}

function uvLayer(inst, p, face) {
  let s = `<rect width="250" height="350" fill="#1a0640" opacity=".84" style="mix-blend-mode:multiply"/>`;
  if (inst.line === 'ml' && face === 'front') s += `<g filter="url(#${p}glow)" opacity=".7">${mlHidden(inst)}</g>${mlHidden(inst)}`;
  if (inst.clue === 'uv' && face === 'front') s += `<g font-family="'Special Elite',monospace" fill="#ffe7a6" text-anchor="middle" filter="url(#${p}glow)"><text x="125" y="236" font-size="9" transform="rotate(-4 125 236)">E.M. · FIVE GHOSTS · HALLOWAY</text></g><g font-family="'Special Elite',monospace" fill="#fff4cf" text-anchor="middle"><text x="125" y="236" font-size="9" transform="rotate(-4 125 236)">E.M. · FIVE GHOSTS · HALLOWAY</text><text x="125" y="250" font-size="9" transform="rotate(-4 125 250)">FIND THEM</text></g>`;
  if (inst.fake && inst.fake.kinds.includes('uv')) s += `<rect width="250" height="350" fill="#cfe6ff" opacity=".58" style="mix-blend-mode:screen"/>`;
  if (inst.alt && inst.alt.kind === 'recolor') {
    const d = inst.defects.find((x) => x.id === inst.alt.hidden);
    if (d && (d.face || 'front') === face) {
      const [x, y] = hitPoint(d);
      s += `<circle cx="${x}" cy="${y}" r="16" fill="#c8fff0" opacity=".95" filter="url(#${p}glow)"/>`;
    }
  }
  return s;
}

function rulerLayer(inst, dx, dy, trimmed) {
  const c = centerPct(dx, dy);
  const col = '#00e5ff';
  const lab = (x, y, t, anchor = 'middle') => `<g><rect x="${anchor === 'middle' ? x - 17 : anchor === 'start' ? x - 2 : x - 32}" y="${y - 8}" width="34" height="11" rx="2" fill="#001018" opacity=".85"/><text x="${anchor === 'middle' ? x : anchor === 'start' ? x + 15 : x - 15}" y="${y}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="7.5" fill="${col}">${t}</text></g>`;
  const L = 8 + dx, R = 8 - dx, T = 8 + dy, B = 8 - dy;
  return `<g stroke="${col}" stroke-width="1.2">
    <line x1="0" y1="175" x2="${L}" y2="175"/><line x1="${250 - R}" y1="175" x2="250" y2="175"/>
    <line x1="125" y1="0" x2="125" y2="${T}"/><line x1="125" y1="${350 - B}" x2="125" y2="350"/>
    <line x1="${L}" y1="168" x2="${L}" y2="182"/><line x1="${250 - R}" y1="168" x2="${250 - R}" y2="182"/>
    <line x1="118" y1="${T}" x2="132" y2="${T}"/><line x1="118" y1="${350 - B}" x2="132" y2="${350 - B}"/></g>
    ${lab(L + 4, 166, Math.round(c.lr), 'start')}${lab(250 - R - 4, 166, Math.round(100 - c.lr), 'end')}
    ${lab(148, T + 12, Math.round(c.tb))}${lab(148, 350 - B - 6, Math.round(100 - c.tb))}
    <g><rect x="80" y="60" width="90" height="14" rx="3" fill="#001018" opacity=".88"/><text x="125" y="70.5" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="8" fill="${col}">${cardSize(inst)}</text></g>
    ${extraReadings(inst).map((t, k) => `<g><rect x="62" y="${78 + k * 16}" width="126" height="14" rx="3" fill="#001018" opacity=".88"/><text x="125" y="${88.5 + k * 16}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="7.5" fill="${col}">${t}</text></g>`).join('')}`;
}

// Extra ruler readings for lines that need them.
export function extraReadings(inst) {
  const out = [];
  if (inst.line === 'ga') out.push('Corners ' + cornerRadii(inst).map((r) => (r / 6).toFixed(1)).join(' / ') + ' mm');
  if (inst.line === 'sp') { const [a, b] = spPerfs(inst); out.push(`Perforations ${a} × ${b}`); }
  return out;
}

// Where to tag a defect (card coordinates).
export function hitPoint(d) {
  if (d.cat === 'corner') return { tl: [7, 7], tr: [243, 7], bl: [7, 343], br: [243, 343] }[d.pos];
  if (d.cat === 'edge') return { l: [3, d.y], r: [247, d.y], t: [d.x, 3], b: [d.x, 347] }[d.side];
  return [d.x, d.y];
}

export function defectName(d) {
  const sev = ['', 'minor', 'moderate', 'major'][d.sev];
  const k = d.cat === 'corner' ? (d.sev === 3 ? 'Bent corner' : 'Corner whitening')
    : d.cat === 'edge' ? 'Edge chipping'
    : { scratch: 'Scratch', printline: 'Print line', dimple: 'Surface dimple', stain: 'Stain', crease: 'Crease' }[d.kind];
  return `${k} (${sev}${d.face === 'back' ? ', back' : ''})`;
}
