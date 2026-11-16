// Draws cards as SVG strings, built entirely from data.
// A card "instance" holds everything physical about one copy:
//   { line, n, v:{holo,first,shadowless,noYellow}, defects:[], dx, dy,
//     fake:{kinds:[]}|null, alt:{kind, corner?}|null }
import { LINES, CARDS } from './data.js';
import { centerPct } from './grading.js';

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
  const stock = STOCK[inst.line];
  let filt = '';
  if (face === 'front' && inst.v && inst.v.noYellow) filt = `filter="url(#${p}ny)"`;
  if (o.micro && fakePrint) filt = `filter="url(#${p}blur)"`;

  let s = `<defs>
    <clipPath id="${p}card"><rect width="250" height="350" rx="12"/></clipPath>
    <filter id="${p}ny" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 0 0 1  0 0 0 1 0"/></filter>
    <filter id="${p}blur"><feGaussianBlur stdDeviation="0.9"/></filter>
    <filter id="${p}glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="${p}noise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.3  0 0 0 1.6 -0.7"/></filter>
    <pattern id="${p}ros" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle cx="1.5" cy="1.5" r="0.6" fill="#000"/></pattern>
    <marker id="${p}arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#ffffff"/></marker>
  </defs>`;
  const tr = trimmed ? 'transform="translate(2.2 3.2) scale(0.982)"' : '';
  s += `<g ${tr}><g clip-path="url(#${p}card)">`;
  s += `<rect width="250" height="350" fill="${stock}"/>`;
  s += `<g transform="translate(${dx} ${dy})" ${filt}>${printed}</g>`;
  if (face === 'front' && inst.v && inst.v.holo) s += holoLayer(inst, p, o, dx, dy);
  if (!o.clean) s += defectsSVG(inst, o, face);
  if (o.micro) s += microLayer(inst, p, fakePrint);
  if (o.uv) s += uvLayer(inst, p, face);
  s += `</g>`;
  if (o.ruler) s += rulerLayer(inst, dx, dy, trimmed);
  s += `</g>`;
  return `<svg viewBox="0 0 250 350" xmlns="http://www.w3.org/2000/svg" class="${o.cls || ''}">${s}</svg>`;
}

// Physical size the ruler reports, in inches.
export function cardSize(inst) {
  return inst.alt && inst.alt.kind === 'trim' ? '2.46 × 3.44 in' : '2.50 × 3.50 in';
}

const STOCK = { gg: '#ffd400', ns: '#0b0618', bl: '#c9d3e0' };

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
  ${c.r === 'r' ? '<path d="M120 334l5-5 5 5-5 5z" fill="#1a1a1a"/>' : c.r === 'u' ? '<circle cx="125" cy="334" r="3.5" fill="none" stroke="#1a1a1a" stroke-width="1.5"/>' : '<circle cx="125" cy="334" r="2.5" fill="#1a1a1a"/>'}`;
}

function ggArt(a) {
  let s = `<rect x="22" y="52" width="206" height="162" fill="${a.sky}"/>
  <circle cx="192" cy="84" r="18" fill="#ffe14d"/>
  <g fill="#1a1a1a"><path d="M52 82q6-6 10 0q4-6 10 0q-4 0-10 5q-6-5-10-5z"/><path d="M80 66q5-5 8 0q3-5 8 0q-3 0-8 4q-5-4-8-4z"/></g>
  <path d="M22 214V196Q70 180 125 192T228 188V214Z" fill="#2e7d32"/>`;
  const B = a.body, V = a.vein, C = a.cc, K = '#1a1a1a';
  let face = { x: 125, y: 140 };
  // costume pieces behind the body
  if (a.costume === 'cape') s += `<path d="M80 210C70 162 95 122 125 120C155 122 180 162 170 210Z" fill="${C}" stroke="${K}" stroke-width="2"/>
    <path d="M90 142L70 112L106 130Z" fill="#b0201b" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><path d="M160 142L180 112L144 130Z" fill="#b0201b" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`;
  if (a.costume === 'hood' || a.costume === 'reaper') s += `<path d="M70 214C66 150 88 86 125 82C162 86 184 150 180 214Z" fill="${C}" stroke="${K}" stroke-width="2"/>`;
  if (a.costume === 'reaper') s += `<line x1="186" y1="210" x2="176" y2="70" stroke="#6b4a2a" stroke-width="5" stroke-linecap="round"/><path d="M176 72C150 60 126 66 112 84C134 74 156 74 176 86Z" fill="#c8ccd2" stroke="${K}" stroke-width="2"/>`;
  if (a.costume === 'fur') s += `<g fill="${C}" stroke="${K}" stroke-width="1.5">${[[92,120],[88,150],[92,180],[158,120],[162,150],[158,180]].map(([x,y],i)=>`<path d="M${x} ${y-10}L${x + (i<3?-14:14)} ${y}L${x} ${y+10}Z"/>`).join('')}</g>`;
  // body
  if (a.shape === 'round') {
    s += `<circle cx="125" cy="140" r="40" fill="${B}" stroke="${K}" stroke-width="3"/>
      <g fill="none" stroke="${V}" stroke-width="2" stroke-linecap="round"><path d="M125 102Q112 128 122 176"/><path d="M96 118Q118 134 108 172"/><path d="M154 118Q132 134 142 172"/></g>
      <path d="M125 101C119 88 133 84 135 93" fill="#6cc04a" stroke="${K}" stroke-width="2"/>`;
  } else if (a.shape === 'tall') {
    face = { x: 125, y: 122 };
    s += `<g stroke="#3f9a3a" stroke-width="5" stroke-linecap="round"><path d="M118 76L108 54"/><path d="M125 74L125 50"/><path d="M132 76L142 54"/></g>
      <path d="M95 104Q125 64 155 104L137 204Q125 216 113 204Z" fill="${B}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
      <g stroke="${V}" stroke-width="2" stroke-linecap="round"><line x1="112" y1="160" x2="122" y2="158"/><line x1="128" y1="176" x2="136" y2="174"/><line x1="116" y1="188" x2="124" y2="187"/></g>`;
  } else if (a.shape === 'long') {
    face = { x: 124, y: 138 };
    s += `<g transform="rotate(-14 125 140)"><rect x="118" y="66" width="10" height="16" rx="3" fill="#6b4a2a" stroke="${K}" stroke-width="2"/>
      <path d="M100 204Q84 140 110 84Q118 72 130 76Q156 136 150 204Q124 218 100 204Z" fill="${B}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M140 92Q152 150 144 196" fill="none" stroke="${V}" stroke-width="2"/></g>`;
  } else if (a.shape === 'bunch') {
    face = { x: 125, y: 138 };
    const circ = [[105,108,20],[145,108,20],[125,92,22],[98,138,20],[152,138,20],[110,170,20],[140,170,20],[125,140,30]];
    s += `<rect x="120" y="62" width="10" height="20" rx="3" fill="#6b4a2a" stroke="${K}" stroke-width="2"/>`;
    s += circ.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${B}" stroke="${K}" stroke-width="2.5"/>`).join('');
    s += circ.slice(0, 7).map(([x, y, r]) => `<circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.25}" fill="#ffffff" opacity=".25"/>`).join('');
  }
  // costume pieces in front
  if (a.costume === 'wraps') s += `<g stroke="${C}" stroke-width="6" stroke-linecap="round" opacity=".95"><line x1="90" y1="118" x2="160" y2="106"/><line x1="86" y1="152" x2="164" y2="164"/><line x1="96" y1="172" x2="154" y2="160"/></g><g stroke="#c9bf9f" stroke-width="1"><line x1="90" y1="118" x2="160" y2="106"/><line x1="86" y1="152" x2="164" y2="164"/></g>`;
  if (a.costume === 'stitches') s += `<path d="M100 160L106 154L112 160L118 154L124 160L130 154L136 160L142 154L148 160" fill="none" stroke="${C}" stroke-width="2"/>`;
  if (a.costume === 'bolts') s += `<rect x="83" y="128" width="12" height="9" fill="${C}" stroke="${K}" stroke-width="1.5"/><rect x="155" y="128" width="12" height="9" fill="${C}" stroke="${K}" stroke-width="1.5"/><path d="M100 92H150V100H100Z" fill="#2a2a2a"/>`;
  if (a.costume === 'hood' || a.costume === 'reaper') s += `<path d="M86 118C88 92 104 80 125 80C146 80 162 92 164 118C150 104 100 104 86 118Z" fill="${C}" stroke="${K}" stroke-width="2"/>`;
  if (a.costume === 'sheet') {
    s += `<path d="M78 200C76 140 92 84 125 82C158 84 174 140 172 200Q160 190 150 202Q138 190 125 202Q112 190 100 202Q90 190 78 200Z" fill="${C}" stroke="${K}" stroke-width="2.5" opacity=".96"/>`;
    s += `<ellipse cx="${face.x - 13}" cy="${face.y - 6}" rx="7" ry="9" fill="${K}"/><ellipse cx="${face.x + 13}" cy="${face.y - 6}" rx="7" ry="9" fill="${K}"/><ellipse cx="${face.x}" cy="${face.y + 18}" rx="6" ry="8" fill="${K}"/>`;
    return s;
  }
  const { x, y } = face;
  s += `<ellipse cx="${x - 15}" cy="${y - 7}" rx="9" ry="10" fill="#fff" stroke="${K}" stroke-width="2"/><ellipse cx="${x + 15}" cy="${y - 7}" rx="9" ry="10" fill="#fff" stroke="${K}" stroke-width="2"/>
    <circle cx="${x - 13}" cy="${y - 5}" r="4" fill="#e6372e"/><circle cx="${x + 13}" cy="${y - 5}" r="4" fill="#e6372e"/>
    <circle cx="${x - 13}" cy="${y - 5}" r="1.8" fill="${K}"/><circle cx="${x + 13}" cy="${y - 5}" r="1.8" fill="${K}"/>
    <g stroke="${K}" stroke-width="3" stroke-linecap="round"><line x1="${x - 25}" y1="${y - 21}" x2="${x - 8}" y2="${y - 15}"/><line x1="${x + 25}" y1="${y - 21}" x2="${x + 8}" y2="${y - 15}"/></g>
    <path d="M${x - 19} ${y + 15}Q${x} ${y + 27} ${x + 19} ${y + 15}" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round"/>
    <path d="M${x - 12} ${y + 18}L${x - 8} ${y + 30}L${x - 4} ${y + 21}Z" fill="#fff" stroke="${K}" stroke-width="1.2"/>
    <path d="M${x + 12} ${y + 18}L${x + 8} ${y + 30}L${x + 4} ${y + 21}Z" fill="#fff" stroke="${K}" stroke-width="1.2"/>`;
  return s;
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
  <text x="125" y="330" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#ff4fd8">${c.r === 'r' ? '★' : c.r === 'u' ? '◆' : '●'}</text>`;
}

function nsArt(a, p) {
  const D = '#0b0618', R = a.b;
  let s = `<rect x="22" y="46" width="206" height="130" fill="url(#${p}sky)"/>
  <circle cx="125" cy="140" r="54" fill="url(#${p}sun)"/>
  <g fill="#7a0f72"><rect x="60" y="140" width="130" height="3"/><rect x="60" y="150" width="130" height="4"/><rect x="60" y="160" width="130" height="5"/><rect x="60" y="170" width="130" height="6"/></g>
  <rect x="22" y="174" width="206" height="42" fill="#12002b"/>
  <g stroke="#2ee6ff" stroke-width=".8" opacity=".75"><line x1="22" y1="174" x2="228" y2="174"/><line x1="22" y1="179" x2="228" y2="179"/><line x1="22" y1="186" x2="228" y2="186"/><line x1="22" y1="196" x2="228" y2="196"/><line x1="22" y1="210" x2="228" y2="210"/>
  <line x1="125" y1="174" x2="125" y2="216"/><line x1="119" y1="174" x2="85" y2="216"/><line x1="131" y1="174" x2="165" y2="216"/><line x1="113" y1="174" x2="45" y2="216"/><line x1="137" y1="174" x2="205" y2="216"/><line x1="107" y1="174" x2="5" y2="216"/><line x1="143" y1="174" x2="245" y2="216"/></g>`;
  const arms = a.pose === 'flex' ? ['104,118 78,116 74,88', '146,118 172,116 176,88']
    : a.pose === 'point' ? ['104,118 78,116 74,88', '146,118 178,108 204,98']
    : ['104,118 112,140 148,132', '146,118 138,140 102,132'];
  const fists = a.pose === 'flex' ? [[74, 83], [176, 83]] : a.pose === 'point' ? [[74, 83], [207, 97]] : [];
  const armStroke = (col, w) => `<g stroke-linecap="round" stroke-linejoin="round" fill="none">${arms.map((pt) => `<polyline points="${pt}" stroke="${col}" stroke-width="${w}"/>`).join('')}</g>`;
  if (a.hair === 'long') s += `<path d="M110 88Q104 120 100 134L150 134Q146 120 140 88Z" fill="${a.a}"/>`;
  if (a.hair === 'afro') s += `<circle cx="125" cy="90" r="20" fill="#2a1a12" stroke="${R}" stroke-width="1.2"/>`;
  if (a.pose !== 'cross') s += armStroke(R, 15);
  s += `<path d="M104 150L98 212L116 212L123 162L127 162L134 212L152 212L146 150Z" fill="${D}" stroke="${R}" stroke-width="1.2"/>
  <path d="M100 112Q125 104 150 112L147 152L103 152Z" fill="${D}" stroke="${R}" stroke-width="1.2"/>`;
  if (a.pose === 'cross') s += armStroke(R, 15);
  s += armStroke(D, 12);
  s += fists.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${D}" stroke="${R}" stroke-width="1.2"/>`).join('');
  if (a.hair === 'mohawk') s += `<path d="M119 84L120 68L124 79L128 66L131 83Z" fill="${a.a}"/>`;
  s += `<circle cx="125" cy="95" r="12" fill="${a.hair === 'mask' ? a.a : D}" stroke="${R}" stroke-width="1.2"/>`;
  if (a.hair === 'mask') s += `<path d="M116 93Q120 89 124 93Q120 96 116 93ZM126 93Q130 89 134 93Q130 96 126 93Z" fill="#ffffff"/><path d="M125 83V107" stroke="${D}" stroke-width="1.5"/>`;
  if (a.hair === 'bald') s += `<circle cx="120" cy="90" r="3" fill="#ffffff" opacity=".5"/>`;
  if (a.hair === 'crown') s += `<path d="M113 86L113 74L119 80L125 69L131 80L137 74L137 86Z" fill="#ffd23f" stroke="#b8860b"/>`;
  if (a.belt) s += `<rect x="102" y="140" width="46" height="11" rx="2" fill="#ffd23f"/><ellipse cx="125" cy="145.5" rx="9" ry="7" fill="#fff0a6" stroke="#b8860b"/>`;
  return s;
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
const EL = {
  water: { c: '#2f8fd8', sky: '#bfe9ff', ground: '#8fd18b', glyph: (x, y, s = 1) => `<path d="M${x} ${y - 7 * s}C${x - 3.5 * s} ${y - 2 * s} ${x - 4 * s} ${y + 2 * s} ${x} ${y + 4.5 * s}C${x + 4 * s} ${y + 2 * s} ${x + 3.5 * s} ${y - 2 * s} ${x} ${y - 7 * s}Z" fill="#fff"/>` },
  leaf: { c: '#4caf50', sky: '#dff4c8', ground: '#7cc46a', glyph: (x, y, s = 1) => `<path d="M${x - 5 * s} ${y + 5 * s}C${x - 5 * s} ${y - 4 * s} ${x + 1 * s} ${y - 7 * s} ${x + 5 * s} ${y - 6 * s}C${x + 5 * s} ${y + 2 * s} ${x} ${y + 5 * s} ${x - 5 * s} ${y + 5 * s}Z" fill="#fff"/>` },
  ember: { c: '#e2572b', sky: '#ffe3cc', ground: '#c9b07a', glyph: (x, y, s = 1) => `<path d="M${x} ${y - 7 * s}C${x - 4 * s} ${y - 2 * s} ${x - 5 * s} ${y + 2 * s} ${x - 2 * s} ${y + 5 * s}C${x - 1 * s} ${y + 2 * s} ${x} ${y + 1 * s} ${x} ${y}C${x + 1 * s} ${y + 2 * s} ${x + 3 * s} ${y + 3 * s} ${x + 2 * s} ${y + 5 * s}C${x + 5 * s} ${y + 1 * s} ${x + 4 * s} ${y - 3 * s} ${x} ${y - 7 * s}Z" fill="#fff"/>` },
  stone: { c: '#8a7a6a', sky: '#ece4d8', ground: '#b9a98f', glyph: (x, y, s = 1) => `<path d="M${x - 5 * s} ${y + 4 * s}L${x - 3 * s} ${y - 4 * s}L${x + 3 * s} ${y - 6 * s}L${x + 6 * s} ${y + 1 * s}L${x + 2 * s} ${y + 5 * s}Z" fill="#fff"/>` },
};
const WEAK = { water: 'Leaf', leaf: 'Ember', ember: 'Water', stone: 'Water' };
const RES = { water: 'Ember', leaf: 'Water', ember: 'Leaf', stone: 'Ember' };

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
  <text x="38" y="23.5" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="6.5" fill="#ffffff">STAGE ${c.r === 'r' ? 2 : c.r === 'u' ? 1 : 0}</text>
  <text x="18" y="42" font-family="Fredoka,sans-serif" font-weight="700" font-size="${fit(c.name, 130, 17, 0.56)}" fill="#13283d">${esc(c.name)}</text>
  <text x="204" y="35" text-anchor="end" font-family="Fredoka,sans-serif" font-weight="700" font-size="12" fill="#13283d"><tspan font-size="7" font-family="'JetBrains Mono',monospace">VIGOR </tspan>${c.vigor}</text>
  ${badge(222, 31, c.el, 9)}
  ${showShadow ? '<rect x="25.5" y="51.5" width="206" height="138" fill="#2b3a4a" opacity=".38"/>' : ''}
  <g clip-path="url(#${p}bw)">${blArt(c, e)}</g>
  <rect x="22" y="48" width="206" height="138" fill="none" stroke="#8aa2b8" stroke-width="3"/>
  <rect x="40" y="191" width="170" height="11" rx="5.5" fill="#d6eef8"/>
  <text x="125" y="199" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="6.8" fill="#4a6075">${esc(c.kind)} · ${c.el.toUpperCase()} TYPE</text>
  ${inst.v && inst.v.first ? '<circle cx="31" cy="196" r="7" fill="#13283d"/><text x="31" y="198.5" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="6.5" fill="#ffffff">1st</text>' : ''}
  ${moves}
  <text x="125" y="307" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="6.6" fill="#4a6075">WEAK: ${WEAK[c.el]} ×2 · RESIST: ${RES[c.el]} −20 · RETREAT: ${Math.ceil(c.vigor / 50)}</text>
  <text x="20" y="330" font-family="'JetBrains Mono',monospace" font-size="7.5" fill="#4a6075">${L.setCode} · ${pad3(c.n)}/${pad3(L.total)}</text>
  <text x="230" y="330" text-anchor="end" font-family="'JetBrains Mono',monospace" font-size="5.4" fill="#4a6075">${esc(cr)}</text>
  <text x="125" y="331" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#13283d">${c.r === 'r' ? '★' : c.r === 'u' ? '◆' : '●'}</text>`;
}

function blArt(c, e) {
  const a = c.art, B = a.body, K = '#13283d', cream = '#fff4e0';
  let s = `<rect x="22" y="48" width="206" height="138" fill="${e.sky}"/>
    <circle cx="196" cy="70" r="12" fill="#fff6c9"/>
    <path d="M22 150Q70 126 120 142T228 136V186H22Z" fill="${e.ground}"/>
    <g fill="#ffffff" opacity=".9"><path d="M188 104l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M58 92l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/></g>`;
  if (c.el === 'water') s += `<ellipse cx="70" cy="176" rx="60" ry="12" fill="#5ab7e8"/>`;
  if (a.extra === 'petals') s += `<g fill="#ffb3d1" stroke="${K}" stroke-width="1">${[0, 60, 120, 180, 240, 300].map((r) => `<ellipse cx="125" cy="84" rx="9" ry="16" transform="rotate(${r} 125 118)"/>`).join('')}</g>`;
  if (a.extra === 'wings') s += `<g fill="${B}" stroke="${K}" stroke-width="1.8" opacity=".9"><path d="M104 152Q66 118 74 166Q88 160 104 166Z"/><path d="M146 152Q184 118 176 166Q162 160 146 166Z"/></g>`;
  // tail
  const tip = { water: `<path d="M170 100C164 110 164 118 170 120C176 118 176 110 170 100Z" fill="#dff4ff" stroke="${K}" stroke-width="1.5"/>`,
    leaf: `<path d="M170 98Q184 110 170 124Q156 110 170 98Z" fill="#6cc04a" stroke="${K}" stroke-width="1.5"/>`,
    ember: `<path d="M170 96C164 106 163 114 168 120C168 115 170 113 171 111C172 114 175 116 174 120C179 114 177 106 170 96Z" fill="#ffb347" stroke="${K}" stroke-width="1.5"/>`,
    stone: `<path d="M162 108L168 98L178 102L180 114L170 120Z" fill="#b8ada2" stroke="${K}" stroke-width="1.5"/>` }[c.el];
  s += `<path d="M148 166C175 160 182 132 170 118C166 136 158 148 146 152Z" fill="${B}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>${tip}`;
  s += `<ellipse cx="125" cy="162" rx="25" ry="18" fill="${B}" stroke="${K}" stroke-width="2"/><ellipse cx="125" cy="166" rx="13" ry="11" fill="${cream}"/>`;
  if (a.extra === 'spots') s += `<g fill="#000" opacity=".16"><circle cx="110" cy="156" r="4"/><circle cx="141" cy="160" r="3"/></g>`;
  s += `<ellipse cx="111" cy="179" rx="7" ry="4.5" fill="${B}" stroke="${K}" stroke-width="1.5"/><ellipse cx="139" cy="179" rx="7" ry="4.5" fill="${B}" stroke="${K}" stroke-width="1.5"/>`;
  if (a.extra === 'spikes') s += `<g fill="#3f6a2a" stroke="${K}" stroke-width="1.2">${[[96, 104], [104, 92], [116, 86], [134, 86], [146, 92], [154, 104]].map(([x, y]) => `<path d="M${x - 6} ${y + 6}L${x + (x - 125) * 0.25} ${y - 10}L${x + 6} ${y + 6}Z"/>`).join('')}</g>`;
  if (a.ears === 'fox') s += `<path d="M101 104L95 72L120 94Z" fill="${B}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><path d="M149 104L155 72L130 94Z" fill="${B}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><path d="M103 98L99 80L113 93Z" fill="${cream}"/><path d="M147 98L151 80L137 93Z" fill="${cream}"/>`;
  if (a.ears === 'round') s += `<circle cx="102" cy="96" r="11" fill="${B}" stroke="${K}" stroke-width="2"/><circle cx="148" cy="96" r="11" fill="${B}" stroke="${K}" stroke-width="2"/><circle cx="102" cy="96" r="5" fill="${cream}"/><circle cx="148" cy="96" r="5" fill="${cream}"/>`;
  if (a.ears === 'tuft') s += `<path d="M104 98L98 76L116 90Z" fill="${B}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><path d="M146 98L152 76L134 90Z" fill="${B}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`;
  if (a.ears === 'horn') s += `<path d="M108 96Q98 76 108 64Q112 80 118 90Z" fill="#f3ead2" stroke="${K}" stroke-width="1.6"/><path d="M142 96Q152 76 142 64Q138 80 132 90Z" fill="#f3ead2" stroke="${K}" stroke-width="1.6"/>`;
  s += `<circle cx="125" cy="118" r="30" fill="${B}" stroke="${K}" stroke-width="2"/>`;
  if (a.extra === 'stripe') s += `<path d="M117 90Q125 104 133 90Z" fill="#000" opacity=".18"/>`;
  s += `<ellipse cx="125" cy="131" rx="16" ry="11" fill="${cream}"/>
    <ellipse cx="112" cy="115" rx="5" ry="7" fill="${K}"/><ellipse cx="138" cy="115" rx="5" ry="7" fill="${K}"/>
    <circle cx="114" cy="112" r="2" fill="#fff"/><circle cx="140" cy="112" r="2" fill="#fff"/>
    <ellipse cx="125" cy="126" rx="3" ry="2" fill="${K}"/>
    <path d="M120 131Q125 135 130 131" fill="none" stroke="${K}" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="104" cy="126" r="4" fill="#ff8fb1" opacity=".55"/><circle cx="146" cy="126" r="4" fill="#ff8fb1" opacity=".55"/>`;
  return s;
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

const FRONT = { gg: ggFront, ns: nsFront, bl: blFront };
const BACK = { gg: ggBack, ns: nsBack, bl: blBack };

// Counterfeit copyright lines: plausible but wrong.
const BAD_CR = { gg: ['©1995 GRISTLE TOYS', '©1994 GRISTLE TOY', '©1994 GRISTEL TOYS'], ns: ['©1988 SAINTS WRESTLING LEAGUE', '©1987 SAINTS WRESTLING LEAUGE', '©1987 SAINT WRESTLING LEAGUE'], bl: ['©1999 BLOOM WORKS', '©2001 BLOOMWORKS', '©1999 BLOOMWORK'] };
function copyrightText(inst) {
  if (inst.fake && inst.fake.kinds.includes('copyright')) return BAD_CR[inst.line][inst.fake.cr || 0];
  return LINES[inst.line].copyright;
}

// ---------------------------------------------------------------- layers
function holoLayer(inst, p, o, dx, dy) {
  const box = inst.line === 'bl' ? [22, 48, 206, 138] : [22, 46, 206, 170];
  return `<linearGradient id="${p}holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff50dc" stop-opacity="0"/><stop offset=".3" stop-color="#ff50dc" stop-opacity=".55"/><stop offset=".5" stop-color="#50f0ff" stop-opacity=".55"/><stop offset=".7" stop-color="#fff56e" stop-opacity=".5"/><stop offset="1" stop-color="#fff56e" stop-opacity="0"/></linearGradient>
  <rect class="holo-sheen" x="${box[0] + dx}" y="${box[1] + dy}" width="${box[2]}" height="${box[3]}" fill="url(#${p}holo)" style="mix-blend-mode:screen"/>`;
}

// Defects: corner/edge/surface marks. Severity 1 marks only show under the loupe.
export function defectsSVG(inst, o) {
  return (inst.defects || []).map((d) => {
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

function microLayer(inst, p, fakePrint) {
  let s = '';
  if (fakePrint) s += `<rect width="250" height="350" filter="url(#${p}noise)" opacity=".55"/>`;
  else s += `<rect width="250" height="350" fill="url(#${p}ros)" opacity=".22" style="mix-blend-mode:multiply"/>`;
  if (inst.v && inst.v.holo) {
    const ccw = inst.fake && inst.fake.kinds.includes('swirl');
    const cx = 125 + inst.dx, cy = (inst.line === 'bl' ? 117 : 131) + inst.dy;
    for (let i = 0; i < 4; i++) {
      const r = 16 + i * 14, a0 = i * 80;
      const pt = (deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
      const [x1, y1] = pt(a0), [x2, y2] = pt(ccw ? a0 - 120 : a0 + 120);
      s += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 0 ${ccw ? 0 : 1} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="1.3" opacity=".85" marker-end="url(#${p}arr)"/>`;
    }
  }
  return s;
}

function uvLayer(inst, p, face) {
  let s = `<rect width="250" height="350" fill="#1a0640" opacity=".84" style="mix-blend-mode:multiply"/>`;
  if (inst.fake && inst.fake.kinds.includes('uv')) s += `<rect width="250" height="350" fill="#cfe6ff" opacity=".58" style="mix-blend-mode:screen"/>`;
  if (inst.alt && inst.alt.kind === 'recolor') {
    const d = inst.defects.find((x) => x.id === inst.alt.hidden);
    if (d) {
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
    <g><rect x="80" y="60" width="90" height="14" rx="3" fill="#001018" opacity=".88"/><text x="125" y="70.5" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="8" fill="${col}">${cardSize(inst)}</text></g>`;
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
  return `${k} (${sev})`;
}
