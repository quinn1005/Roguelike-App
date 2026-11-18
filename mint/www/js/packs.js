// Booster pack wrappers: crimped foil, the line's logo in its own lettering, and a window
// showing the art of the line's headline mythic. Same 120 × 180 shape everywhere packs appear.
import { LINES, CARDS } from './data.js';
import { cardSVG, ART_BOX } from './cardsvg.js';
import { blankInst } from './gen.js';

export const STYLE = {
  gg: { foil: ['#ffe14d', '#f4a020', '#6b3fa0'], ink: '#1a1a1a', logo: '#ffffff', font: 'Fredoka,sans-serif', weight: 700, tag: 'SPOOKY SNACKS · SERIES 1' },
  ns: { foil: ['#ff4fd8', '#7a1aa0', '#12002b'], ink: '#12002b', logo: '#2ee6ff', font: 'Monoton,sans-serif', weight: 400, tag: 'WRESTLING · 1987' },
  bl: { foil: ['#9fe0ff', '#3fa0d8', '#1d4e75'], ink: '#13283d', logo: '#ffffff', font: 'Fredoka,sans-serif', weight: 700, tag: 'CATCH · RAISE · BLOOM' },
  ml: { foil: ['#5a3a5a', '#2a1a33', '#120a18'], ink: '#0a0510', logo: '#ecd9a8', font: "'IM Fell English SC',Georgia,serif", weight: 400, tag: 'LANTERNHOUSE PRESS' },
  tb: { foil: ['#5ac0b0', '#1e6a70', '#0a2a30'], ink: '#061a20', logo: '#e9f5ef', font: "'Pirata One',Georgia,serif", weight: 400, tag: 'CHARTS OF THE DEEP' },
  rd: { foil: ['#ff6ab8', '#7a1f6a', '#1b0f2a'], ink: '#1b0f2a', logo: '#f2e9d8', font: 'Cinzel,Georgia,serif', weight: 700, tag: 'BOOSTER · RFT-EN' },
  ga: { foil: ['#3a5a40', '#1f2e26', '#0e1612'], ink: '#0e1612', logo: '#d9b86a', font: "'IM Fell English SC',Georgia,serif", weight: 400, tag: 'REVISED EDITION' },
  hp: { foil: ['#2a2418', '#15110c', '#0b0907'], ink: '#0b0907', logo: '#f7e08a', font: 'Cinzel,Georgia,serif', weight: 700, tag: 'GILT & HOLLOW' },
  ic: { foil: ['#e0a860', '#a8763c', '#3a2616'], ink: '#2a1a0e', logo: '#f1d9a6', font: 'Rye,Georgia,serif', weight: 400, tag: 'DERBY & SONS', sw: 1.6 },
  cf: { foil: ['#efe6cf', '#c9b994', '#6a5a3a'], ink: '#2a2418', logo: '#2a2418', font: "'Special Elite','Courier New',monospace", weight: 400, tag: 'CASE FILES · CLASSIFIED', sw: 1.6, outline: '#efe6cf' },
  sp: { foil: ['#4a62c0', '#2a3d8f', '#101a4a'], ink: '#101a4a', logo: '#f3ead2', font: 'Righteous,sans-serif', weight: 400, tag: 'GALACTIC MAIL' },
};
let uid = 0;

// The art window: the headline card's front, cropped to its illustration.
export function artWindow(line, x, y, w, h) {
  const c = CARDS[line].find((k) => k.r === 'm') || CARDS[line][0];
  const [ax, ay, aw, ah] = ART_BOX[line];
  const card = cardSVG(blankInst(line, c.n), { clean: true });
  return card.replace(/^<svg viewBox="0 0 250 350"/, `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${ax + 6} ${ay + 4} ${aw - 12} ${ah - 8}" preserveAspectRatio="xMidYMid slice"`);
}

export function packSVG(line) {
  const st = STYLE[line], p = 'pk' + (++uid) + line;
  const [f0, f1, f2] = st.foil;
  const name = LINES[line].name.toUpperCase();
  const words = name.split(' ');
  const two = name.length > 12 && words.length > 1;
  const l1 = two ? words.slice(0, Math.ceil(words.length / 2)).join(' ') : name;
  const l2 = two ? words.slice(Math.ceil(words.length / 2)).join(' ') : '';
  const k = st.font.startsWith('Monoton') ? 0.95 : st.font.startsWith('Rye') || st.font.startsWith('Cinzel') ? 0.78 : 0.66;
  const fs = (t, base) => Math.min(base, 100 / (t.length * k));
  const crimp = (y, flip) => {
    let teeth = '';
    for (let x = 4; x < 116; x += 4) teeth += `L${x + 2} ${flip ? y + 14 : y}L${x + 4} ${flip ? y + 11 : y + 3}`;
    return `<path d="M4 ${flip ? y + 11 : y + 3}${teeth}V${flip ? y : y + 14}H4Z" fill="url(#${p}cr)"/>`;
  };
  return `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="${p}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${f0}"/><stop offset=".45" stop-color="${f1}"/><stop offset="1" stop-color="${f2}"/></linearGradient>
    <linearGradient id="${p}sh" x1="0" y1="0" x2="1" y2="1"><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset=".62" stop-color="#fff" stop-opacity=".22"/><stop offset=".75" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="${p}ed" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".08" stop-color="#000" stop-opacity="0"/><stop offset=".92" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
    <pattern id="${p}cr" width="2.4" height="14" patternUnits="userSpaceOnUse"><rect width="2.4" height="14" fill="${f2}"/><rect width="1" height="14" fill="#fff" opacity=".28"/></pattern>
    <linearGradient id="${p}rb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff7ad8"/><stop offset=".33" stop-color="#ffe27a"/><stop offset=".66" stop-color="#7af0ff"/><stop offset="1" stop-color="#b48aff"/></linearGradient>
    <clipPath id="${p}w"><rect x="15" y="50" width="90" height="78" rx="5"/></clipPath>
  </defs>
  <path d="M4 12Q2.5 90 4 168H116Q117.5 90 116 12Z" fill="url(#${p}f)"/>
  <g opacity=".14" fill="none" stroke="#fff" stroke-width=".6"><path d="M18 20L26 64M94 30L88 70M30 140L40 160M86 136L98 162M60 18L64 40"/></g>
  <rect x="11" y="46" width="98" height="86" rx="7" fill="${st.ink}" opacity=".55"/>
  <rect x="13" y="48" width="94" height="82" rx="6" fill="url(#${p}rb)"/>
  <g clip-path="url(#${p}w)"><rect x="15" y="50" width="90" height="78" fill="${st.ink}"/>${artWindow(line, 15, 50, 90, 78)}</g>
  <rect x="15" y="50" width="90" height="78" rx="5" fill="none" stroke="${st.ink}" stroke-width="1.2"/>
  <g font-family="${st.font}" font-weight="${st.weight}" text-anchor="middle" fill="${st.logo}" stroke="${st.outline || st.ink}" stroke-width="${st.sw || 2.6}" paint-order="stroke" stroke-linejoin="round">
    ${two ? `<text x="60" y="30" font-size="${fs(l1, 14)}">${l1}</text><text x="60" y="43" font-size="${fs(l2, 12)}">${l2}</text>` : `<text x="60" y="38" font-size="${fs(l1, 17)}">${l1}</text>`}
  </g>
  <circle cx="102" cy="52" r="10" fill="url(#${p}rb)" stroke="${st.ink}" stroke-width="1.2"/><text x="102" y="50.6" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="4.2" font-weight="700" fill="${st.ink}">MYTHICS</text><text x="102" y="55.6" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="4.2" font-weight="700" fill="${st.ink}">INSIDE</text>
  <rect x="20" y="137" width="80" height="13" rx="6.5" fill="${st.ink}" opacity=".82"/>
  <text x="60" y="145.8" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="5.6" letter-spacing=".6" fill="${st.logo === '#2a2418' ? '#efe6cf' : st.logo}">BOOSTER · 5 CARDS</text>
  <text x="60" y="160" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="4.2" letter-spacing=".8" fill="${st.logo}" stroke="${st.outline || st.ink}" stroke-width=".8" paint-order="stroke" opacity=".9">${st.tag}</text>
  <path d="M4 12Q2.5 90 4 168H116Q117.5 90 116 12Z" fill="url(#${p}sh)"/>
  <path d="M4 12Q2.5 90 4 168H116Q117.5 90 116 12Z" fill="url(#${p}ed)"/>
  ${crimp(0, false)}${crimp(166, true)}
  <path d="M4 14H116M4 166H116" stroke="#000" stroke-opacity=".35" stroke-width=".8"/></svg>`;
}
