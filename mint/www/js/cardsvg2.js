// Card faces for the eight lines added in weeks 2 to 4, plus shared text helpers.
import { LINES, CARDS } from './data.js';

export const pad3 = (n) => String(n).padStart(3, '0');
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const fit = (text, maxW, base, k) => Math.min(base, maxW / (String(text).length * k));
const def = (inst) => CARDS[inst.line].find((c) => c.n === inst.n);
const isFake = (inst, k) => !!(inst.fake && inst.fake.kinds.includes(k));
const MONO = "'JetBrains Mono',monospace";

// Counterfeit copyright lines: plausible but wrong.
const BAD_CR = {
  gg: ['©1995 GRISTLE TOYS', '©1994 GRISTLE TOY', '©1994 GRISTEL TOYS'],
  ns: ['©1988 SAINTS WRESTLING LEAGUE', '©1987 SAINTS WRESTLING LEAUGE', '©1987 SAINT WRESTLING LEAGUE'],
  bl: ['©1999 BLOOM WORKS', '©2001 BLOOMWORKS', '©1999 BLOOMWORK'],
};
function corrupt(text, k) {
  const m = text.match(/(\d{4})/);
  if (k === 0 && m) return text.replace(m[1], String(+m[1] + 1));
  const words = text.split(' ');
  const w = words.length - 1;
  if (k === 1) { words[w] = words[w].replace(/S$/, '') || words[w]; return words.join(' '); }
  const x = words[w];
  if (x.length > 3) words[w] = x.slice(0, 2) + x[3] + x[2] + x.slice(4);
  return words.join(' ');
}
export function copyrightText(inst) {
  const L = LINES[inst.line];
  if (isFake(inst, 'copyright')) {
    const k = inst.fake.cr || 0;
    return BAD_CR[inst.line] ? BAD_CR[inst.line][k] : corrupt(L.copyright, k);
  }
  return L.copyright;
}
// Microprint along the bottom border: ring forgeries swap two letters.
export function microText(inst) {
  const m = LINES[inst.line].micro || 'GENUINE';
  const t = isFake(inst, 'micro') ? m.slice(0, 3) + m[4] + m[3] + m.slice(5) : m;
  return Array(7).fill(t).join(' · ');
}

const footer = (inst, col, crSize = 5.4) => {
  const c = def(inst), L = LINES[inst.line];
  return `<text x="22" y="329" font-family="${MONO}" font-size="7.6" fill="${col}">${esc(L.setCode)} · ${pad3(c.n)}/${pad3(L.total)}</text>
  <text x="228" y="329" text-anchor="end" font-family="${MONO}" font-size="${crSize}" fill="${col}">${esc(copyrightText(inst))}</text>`;
};
const raritySym = (c, x, y, col) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="sans-serif" font-size="9" fill="${col}">${c.r === 'r' ? '★' : c.r === 'u' ? '◆' : '●'}</text>`;
const rain = (n, w, h, col = '#9fb6d8') => { let s = ''; for (let i = 0; i < n; i++) { const x = (i * 53) % w, y = (i * 37) % h; s += `<line x1="${x}" y1="${y}" x2="${x - 2}" y2="${y + 8}"/>`; } return `<g stroke="${col}" stroke-width=".6" opacity=".35">${s}</g>`; };

// ================================================================= MOTH & LANTERN
function mlArt(a) {
  let s = `<rect x="22" y="46" width="206" height="170" fill="#140b1c"/>
  <circle cx="125" cy="176" r="110" fill="#ffd27a" opacity=".12"/>
  <g fill="#ecd9a8"><circle cx="40" cy="62" r=".9"/><circle cx="62" cy="54" r=".6"/><circle cx="95" cy="66" r=".7"/><circle cx="160" cy="58" r=".8"/><circle cx="214" cy="104" r=".7"/></g>
  <path d="M22 216V192H38V182L46 175L54 182V194H70V186H84V200H160V184L170 176L180 184V196H196V180H206V190H228V216Z" fill="#0a0510"/>`;
  const o = a.obj, W = a.wing, A = a.acc, E = '#ecd9a8';
  if (o === 'moon') s += `<circle cx="125" cy="170" r="26" fill="#ecd9a8" opacity=".85"/><circle cx="135" cy="164" r="24" fill="#140b1c"/>`;
  if (o === 'lantern') s += `<circle cx="125" cy="147" r="4" fill="none" stroke="#6b4e2a" stroke-width="1.5"/><path d="M111 160L139 160L133 151L117 151Z" fill="#6b4e2a"/><rect x="113" y="160" width="24" height="32" fill="#ffcf73" stroke="#6b4e2a" stroke-width="1.5"/><path d="M125 166C119 174 120 184 125 186C130 184 131 174 125 166Z" fill="#fff6d6"/><rect x="109" y="192" width="32" height="8" fill="#6b4e2a"/>`;
  if (o === 'candle') s += `<rect x="117" y="164" width="16" height="34" fill="#efe9dc"/><path d="M125 148C120 156 121 162 125 164C129 162 130 156 125 148Z" fill="#ffcf73"/><rect x="108" y="196" width="34" height="5" fill="#6b4e2a"/>`;
  if (o === 'ember') s += `<g fill="#ff7a2f"><ellipse cx="125" cy="196" rx="30" ry="6"/></g><g fill="#ffcf73"><circle cx="112" cy="192" r="4"/><circle cx="126" cy="190" r="5"/><circle cx="140" cy="193" r="3.5"/></g><g fill="#ffb347">${[0, 1, 2, 3, 4].map((i) => `<circle cx="${110 + i * 8}" cy="${178 - i * 6}" r="1.2"/>`).join('')}</g>`;
  if (o === 'key') s += `<g stroke="#c9a96b" stroke-width="4" fill="none"><circle cx="125" cy="168" r="10"/><path d="M125 178V204M125 196H134M125 202H132"/></g>`;
  if (o === 'flame') s += `<path d="M125 132C104 160 106 190 125 200C144 190 146 160 125 132Z" fill="#ff8a3d"/><path d="M125 152C114 170 116 188 125 194C134 188 136 170 125 152Z" fill="#ffe3a8"/>`;
  const st = `stroke="${E}" stroke-width=".8"`;
  const bug = a.bug;
  if (bug === 'moth') s += `<g ${st}><path d="M125 104C104 74 66 70 60 88C55 104 92 116 125 110Z" fill="${W}"/><path d="M125 104C146 74 184 70 190 88C195 104 158 116 125 110Z" fill="${W}"/><path d="M125 110C108 116 84 134 94 144C104 152 118 130 125 114Z" fill="${W}" opacity=".85"/><path d="M125 110C142 116 166 134 156 144C146 152 132 130 125 114Z" fill="${W}" opacity=".85"/></g><circle cx="84" cy="95" r="5" fill="${A}"/><circle cx="166" cy="95" r="5" fill="${A}"/><ellipse cx="125" cy="112" rx="4" ry="14" fill="#4a3340"/>`;
  if (bug === 'beetle') s += `<g ${st}><ellipse cx="125" cy="118" rx="28" ry="36" fill="${W}"/><path d="M125 82V154" stroke="${A}" stroke-width="1.5"/><circle cx="125" cy="78" r="10" fill="${A}"/></g><g stroke="${E}" stroke-width="1.6" fill="none">${[100, 118, 136].map((y) => `<path d="M98 ${y}L80 ${y + 6}M152 ${y}L170 ${y + 6}"/>`).join('')}</g><g fill="${A}" opacity=".6"><circle cx="112" cy="108" r="4"/><circle cx="138" cy="122" r="5"/><circle cx="114" cy="134" r="3"/></g>`;
  if (bug === 'lace') s += `<g ${st} opacity=".8">${[[-28, 96], [28, 96], [-20, 118], [20, 118]].map(([r, y]) => `<ellipse cx="${125 + (r < 0 ? -34 : 34)}" cy="${y}" rx="40" ry="9" fill="${W}" transform="rotate(${r * 0.6} 125 ${y})"/>`).join('')}</g><rect x="122" y="84" width="6" height="52" rx="3" fill="${A}"/><circle cx="125" cy="82" r="5" fill="${A}"/>`;
  if (bug === 'cicada') s += `<g ${st}><path d="M120 92C90 70 54 78 52 96C66 104 100 106 120 100Z" fill="${W}" opacity=".7"/><path d="M130 92C160 70 196 78 198 96C184 104 150 106 130 100Z" fill="${W}" opacity=".7"/></g><ellipse cx="125" cy="112" rx="14" ry="26" fill="${A}"/><circle cx="125" cy="84" r="11" fill="${A}"/><circle cx="117" cy="82" r="3" fill="#ff7a2f"/><circle cx="133" cy="82" r="3" fill="#ff7a2f"/>`;
  if (bug === 'mantis') s += `<path d="M125 70L113 86L137 86Z" fill="${W}" stroke="${E}" stroke-width=".8"/><circle cx="116" cy="80" r="2.5" fill="#1a1a1a"/><circle cx="134" cy="80" r="2.5" fill="#1a1a1a"/><rect x="121" y="86" width="8" height="70" rx="4" fill="${W}"/><g stroke="${W}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M121 98L104 112L112 92"/><path d="M129 98L146 112L138 92"/></g><path d="M121 120Q96 128 104 154L121 140Z" fill="${A}" opacity=".7"/><path d="M129 120Q154 128 146 154L129 140Z" fill="${A}" opacity=".7"/>`;
  s += `<g fill="none" stroke="${E}" stroke-width=".8"><path d="M123 ${bug === 'beetle' ? 70 : 99}Q116 ${bug === 'beetle' ? 58 : 84} 108 ${bug === 'beetle' ? 54 : 82}"/><path d="M127 ${bug === 'beetle' ? 70 : 99}Q134 ${bug === 'beetle' ? 58 : 84} 142 ${bug === 'beetle' ? 54 : 82}"/></g>`;
  return s;
}
function mlFront(inst, p) {
  const c = def(inst);
  return `<clipPath id="${p}mw"><rect x="22" y="46" width="206" height="170"/></clipPath>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#2a1a33" stroke="#c9a96b" stroke-width="1.5"/>
  <rect x="12" y="12" width="226" height="326" rx="6" fill="none" stroke="#c9a96b" stroke-width=".5"/>
  <text x="125" y="35" text-anchor="middle" font-family="'IM Fell English SC',Georgia,serif" font-size="${fit(c.name, 200, 19, 0.55)}" fill="#ecd9a8">${esc(c.name)}</text>
  <g clip-path="url(#${p}mw)">${mlArt(c.art)}</g>
  <rect x="22" y="46" width="206" height="170" fill="none" stroke="#c9a96b"/>
  <rect x="22" y="224" width="206" height="88" fill="#1e1226" stroke="#c9a96b" stroke-width=".5"/>
  <text x="125" y="241" text-anchor="middle" font-family="'IM Fell English SC',Georgia,serif" font-size="${fit(c.type, 190, 11, 0.5)}" fill="#c9a96b">${esc(c.type)}</text>
  <line x1="40" y1="248" x2="210" y2="248" stroke="#c9a96b" stroke-width=".4"/>
  <text text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="10.5" fill="#ecd9a8"><tspan x="125" y="268">${esc(c.text[0])}</tspan><tspan x="125" y="283">${esc(c.text[1])}</tspan></text>
  ${footer(inst, '#c9a96b', 5.2)}${raritySym(c, 125, 330, '#c9a96b')}`;
}
export function mlHidden(inst) {
  // Hidden ink, shown only under UV on genuine cards.
  if (isFake(inst, 'nohidden') || (inst.fake && inst.line === 'ml')) return '';
  const run = inst.v && inst.v.hidden;
  return `<g fill="none" stroke="#a6fff0" stroke-width="1" opacity=".95">
    <circle cx="84" cy="95" r="9"/><circle cx="84" cy="95" r="3"/><circle cx="166" cy="95" r="9"/><circle cx="166" cy="95" r="3"/>
    ${run ? '<path d="M125 120C100 120 92 150 104 170L112 160L118 172L125 160L132 172L138 160L146 170C158 150 150 120 125 120Z"/><circle cx="115" cy="140" r="5"/><circle cx="135" cy="140" r="5"/><path d="M40 70Q125 30 210 70M40 200Q125 240 210 200"/>' : '<path d="M118 170L125 162L132 170L125 178Z"/>'}
  </g><g fill="#a6fff0" font-family="'IM Fell English SC',Georgia,serif" text-anchor="middle">
    <text x="125" y="64" font-size="8.5" letter-spacing="2">${run ? 'PRINT RUN A · THE FLAME REMEMBERS' : 'SHE REMEMBERS THE FLAME'}</text>
    <text x="125" y="302" font-size="8" letter-spacing="1.5">HIDDEN INK · ${run ? 'RUN A' : 'RUN B'}</text></g>`;
}
function mlBack(inst, p) {
  const wrong = isFake(inst, 'back');
  return `<pattern id="${p}mlp" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M17 15C13 9 7 9 6 12C5 15 11 17 17 16ZM17 15C21 9 27 9 28 12C29 15 23 17 17 16Z" fill="#4a3352"/></pattern>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#2a1a33" stroke="#c9a96b" stroke-width="1.5"/><rect x="14" y="14" width="222" height="322" rx="6" fill="url(#${p}mlp)" stroke="#c9a96b" stroke-width=".5"/>
  <ellipse cx="125" cy="175" rx="72" ry="104" fill="#1e1226" stroke="#c9a96b" stroke-width="1.5"/><ellipse cx="125" cy="175" rx="64" ry="96" fill="none" stroke="#c9a96b" stroke-width=".5"/>
  <circle cx="125" cy="175" r="44" fill="#ffcf73" opacity=".12"/>
  <path d="M111 163L139 163L133 154L117 154Z" fill="#c9a96b"/><rect x="113" y="163" width="24" height="32" fill="#ffcf73" stroke="#c9a96b" stroke-width="1.5"/><path d="M125 169C119 177 120 187 125 189C130 187 131 177 125 169Z" fill="#fff6d6"/><rect x="109" y="195" width="32" height="8" fill="#c9a96b"/>
  <g font-family="'IM Fell English SC',Georgia,serif" fill="#ecd9a8" text-anchor="middle"><text x="125" y="118" font-size="20">Moth &amp;</text><text x="125" y="240" font-size="20">Lantern</text><text x="125" y="258" font-size="8" letter-spacing="2" fill="#c9a96b">EST. ${wrong ? '1981' : '1891'}</text></g>`;
}

// ================================================================= TIDEBOUND
function tbArt(k, p) {
  let s = `<rect x="22" y="46" width="206" height="170" fill="url(#${p}tw)"/>
    <g fill="#bff5ec" opacity=".09"><polygon points="60,46 90,46 70,216 30,216"/><polygon points="120,46 145,46 152,216 104,216"/><polygon points="182,46 206,46 228,170 228,216 204,216"/></g>
    <path d="M22 216V198Q60 188 100 196T180 193T228 190V216Z" fill="#2c4a3e"/>`;
  const B = '#2f8f6a', D = '#1d5e45';
  if (k === 'serpent') s += `<g transform="rotate(-12 125 172)"><rect x="119" y="128" width="12" height="10" rx="3" fill="#8a5a26"/><path d="M100 196C100 160 108 138 125 136C142 138 150 160 150 196Q125 202 100 196Z" fill="#b07a3c" stroke="#5a3a16"/><g fill="#4fae8c" opacity=".7"><circle cx="112" cy="168" r="5"/><circle cx="134" cy="182" r="4"/></g></g>
    <path d="M34 200C44 160 98 198 150 170S218 124 186 112S124 104 142 84L176 78" fill="none" stroke="${D}" stroke-width="16" stroke-linecap="round"/><path d="M34 200C44 160 98 198 150 170S218 124 186 112S124 104 142 84L176 78" fill="none" stroke="${B}" stroke-width="12" stroke-linecap="round"/>
    <path d="M170 70C182 62 202 68 206 78C198 86 182 88 172 84Z" fill="${B}" stroke="${D}" stroke-width="1.5"/><circle cx="190" cy="75" r="2.4" fill="#ffe27a"/>`;
  if (k === 'angler') s += `<path d="M150 90Q170 60 186 74" fill="none" stroke="#5a6a6a" stroke-width="2"/><circle cx="188" cy="76" r="7" fill="#fff8b0"/><circle cx="188" cy="76" r="16" fill="#fff8b0" opacity=".2"/>
    <path d="M60 140C60 100 110 86 150 104C176 116 182 150 160 172C134 196 76 190 60 140Z" fill="#1a2e30" stroke="#5a8a80" stroke-width="1.5"/><path d="M68 152L80 140L92 156L104 142L116 158L128 144L140 160L152 146L160 160Q110 184 68 152Z" fill="#efe9dc"/><circle cx="128" cy="118" r="7" fill="#ffe27a"/><circle cx="128" cy="118" r="3" fill="#1a1a1a"/><path d="M58 138L36 120L40 150L36 176L60 150Z" fill="#1a2e30" stroke="#5a8a80"/>`;
  if (k === 'siren') s += `<g stroke="#3a7a4a" stroke-width="3" fill="none">${[60, 80, 170, 190].map((x) => `<path d="M${x} 216Q${x + 10} 160 ${x - 6} 110Q${x + 6} 80 ${x} 60"/>`).join('')}</g>
    <path d="M110 216Q104 170 112 140Q118 120 125 116Q132 120 138 140Q146 170 140 216Z" fill="#cfe8e0" opacity=".85"/><circle cx="125" cy="104" r="12" fill="#cfe8e0" opacity=".9"/><path d="M112 98Q100 140 92 180M138 98Q150 140 160 180M118 92Q125 86 132 92" stroke="#2f6a4a" stroke-width="3" fill="none"/>
    <path d="M100 140L150 160M98 170L152 146" stroke="#c9b27a" stroke-width=".8" stroke-dasharray="3 3"/><circle cx="120" cy="104" r="1.6" fill="#0a2a30"/><circle cx="130" cy="104" r="1.6" fill="#0a2a30"/>`;
  if (k === 'crab') s += `<ellipse cx="125" cy="170" rx="48" ry="26" fill="#a8452a" stroke="#5a1a0a" stroke-width="2"/><g fill="#d9cfb8">${[0, 1, 2, 3, 4].map((i) => `<circle cx="${100 + i * 12}" cy="${156 + (i % 2) * 4}" r="3"/>`).join('')}</g>
    <g stroke="#a8452a" stroke-width="6" stroke-linecap="round" fill="none"><path d="M82 160L58 130L62 108"/><path d="M168 160L192 130L188 108"/>${[0, 1, 2].map((i) => `<path d="M${88 - i * 4} ${180 + i * 4}L${62 - i * 4} ${196 + i * 6}"/><path d="M${162 + i * 4} ${180 + i * 4}L${188 + i * 4} ${196 + i * 6}"/>`).join('')}</g>
    <path d="M50 108Q62 90 74 108Q62 100 50 108Z" fill="#c0563a"/><path d="M176 108Q188 90 200 108Q188 100 176 108Z" fill="#c0563a"/><circle cx="114" cy="146" r="4" fill="#1a1a1a"/><circle cx="136" cy="146" r="4" fill="#1a1a1a"/>`;
  if (k === 'ship') s += `<path d="M50 176L200 176L184 200L66 200Z" fill="#1a2a2a" stroke="#6fcfb0" stroke-width="1"/><line x1="125" y1="70" x2="125" y2="176" stroke="#3a4a4a" stroke-width="3"/><line x1="90" y1="96" x2="90" y2="176" stroke="#3a4a4a" stroke-width="2"/><line x1="160" y1="96" x2="160" y2="176" stroke="#3a4a4a" stroke-width="2"/>
    <g fill="#bff5ec" opacity=".55"><path d="M127 78L170 92L162 130L127 124Z"/><path d="M92 100L118 110L114 150L92 146Z"/><path d="M162 102L190 112L184 150L162 146Z"/></g><g fill="#6fcfb0">${[70, 90, 110, 130, 150, 170].map((x) => `<circle cx="${x}" cy="186" r="2.2"/>`).join('')}</g>`;
  if (k === 'kraken') s += `<circle cx="125" cy="118" r="36" fill="#5a1a3a" stroke="#2a0a1a" stroke-width="2"/><ellipse cx="125" cy="116" rx="12" ry="9" fill="#ffe27a"/><ellipse cx="125" cy="116" rx="3" ry="8" fill="#1a1a1a"/>
    <g stroke="#7a2a4a" stroke-width="9" stroke-linecap="round" fill="none">${[[-1, 40], [1, 40], [-1, 80], [1, 80], [-1, 20], [1, 20]].map(([d, w]) => `<path d="M${125 + d * 20} 146Q${125 + d * w} 190 ${125 + d * (w + 30)} 160T${125 + d * (w + 40)} 110"/>`).join('')}</g>
    <g fill="#d9a0b8">${[0, 1, 2, 3].map((i) => `<circle cx="${60 + i * 6}" cy="${170 - i * 10}" r="1.6"/><circle cx="${190 - i * 6}" cy="${170 - i * 10}" r="1.6"/>`).join('')}</g>`;
  s += `<g fill="none" stroke="#bff5ec" stroke-width=".8"><circle cx="212" cy="66" r="3"/><circle cx="218" cy="56" r="2"/><circle cx="60" cy="150" r="2.5"/></g>`;
  return s;
}
function tbFront(inst, p) {
  const c = def(inst);
  return `<clipPath id="${p}tbw"><rect x="22" y="46" width="206" height="170"/></clipPath>
  <linearGradient id="${p}tw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a8c8f"/><stop offset=".55" stop-color="#0a3a42"/><stop offset="1" stop-color="#061a20"/></linearGradient>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#0e3b43" stroke="#7fd1c1" stroke-width="1.5"/>
  <rect x="12" y="12" width="226" height="326" rx="6" fill="none" stroke="#7fd1c1" stroke-width=".6" stroke-dasharray="3 2"/>
  <text x="125" y="37" text-anchor="middle" font-family="'Pirata One',Georgia,serif" font-size="${fit(c.name, 200, 22, 0.45)}" fill="#e9f5ef">${esc(c.name)}</text>
  <g clip-path="url(#${p}tbw)">${tbArt(c.art.beast, p)}</g>
  <rect x="22" y="46" width="206" height="170" fill="none" stroke="#7fd1c1"/>
  <rect x="22" y="224" width="206" height="88" fill="#0a2a30" stroke="#7fd1c1" stroke-width=".6"/>
  <text x="125" y="243" text-anchor="middle" font-family="'Pirata One',Georgia,serif" font-size="13" fill="#7fd1c1">${esc(c.type)}</text>
  <text text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="10.5" fill="#e9f5ef"><tspan x="125" y="266">${esc(c.text[0])}</tspan><tspan x="125" y="281">${esc(c.text[1])}</tspan></text>
  ${inst.v && inst.v.first ? '<circle cx="206" cy="298" r="10" fill="#0a0a0a" stroke="#e9f5ef" stroke-width=".8"/><text x="206" y="301" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="8.5" fill="#ffffff">1st</text>' : ''}
  ${footer(inst, '#7fd1c1', 5.6)}${raritySym(c, 125, 330, '#7fd1c1')}`;
}
function tbBack(inst, p) {
  const wrong = isFake(inst, 'back');
  return `<pattern id="${p}tbp" width="40" height="16" patternUnits="userSpaceOnUse"><path d="M0 8Q10 0 20 8T40 8" fill="none" stroke="#17606b" stroke-width="2"/></pattern>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#0e3b43" stroke="#7fd1c1" stroke-width="1.5"/><rect x="14" y="14" width="222" height="322" rx="6" fill="url(#${p}tbp)"/>
  <circle cx="125" cy="175" r="66" fill="#0a2a30" stroke="#7fd1c1" stroke-width="1.5"/><circle cx="125" cy="175" r="54" fill="none" stroke="#7fd1c1" stroke-width=".7" stroke-dasharray="2 3"/>
  <polygon points="125,112 133,175 125,238 117,175" fill="#7fd1c1"/><polygon points="62,175 125,167 188,175 125,183" fill="#4fa898"/><circle cx="125" cy="175" r="5" fill="#e9f5ef"/>
  <g font-family="Georgia,serif" font-size="10" fill="#e9f5ef" text-anchor="middle"><text x="125" y="104">N</text><text x="125" y="254">S</text><text x="196" y="179">${wrong ? 'W' : 'E'}</text><text x="54" y="179">${wrong ? 'E' : 'W'}</text></g>
  <text x="125" y="78" text-anchor="middle" font-family="'Pirata One',Georgia,serif" font-size="34" fill="#e9f5ef">Tidebound</text>
  <text x="125" y="296" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="11" fill="#7fd1c1">Charts of the Deep</text>`;
}

// ================================================================= RIFT DUELISTS
function rdArt(a, p) {
  const C = a.c, K = '#141018';
  let s = `<rect x="30" y="64" width="190" height="152" fill="url(#${p}rs)"/><path d="M30 216V176L52 150L70 168L92 140L112 172L140 146L162 170L190 136L220 168V216Z" fill="#2a1530"/><rect x="30" y="200" width="190" height="16" fill="#ff7a2f" opacity=".3"/>`;
  const g = (d) => `<g fill="${K}" stroke="${C}" stroke-width=".9" stroke-linejoin="round">${d}</g>`;
  if (a.mon === 'dragon') s += g('<path d="M125 128L40 84L62 112L36 118L64 136L46 152L98 148Z"/><path d="M125 128L210 84L188 112L214 118L186 136L204 152L152 148Z"/><path d="M104 216C98 170 110 136 125 124C140 136 152 170 146 216Z"/><path d="M118 128C112 110 116 96 125 90C134 96 138 110 132 128Z"/><path d="M112 90L125 72L138 90L132 101L118 101Z"/>') + `<circle cx="120" cy="90" r="1.8" fill="${C}"/><circle cx="130" cy="90" r="1.8" fill="${C}"/>`;
  if (a.mon === 'knight') s += g('<path d="M100 216L104 150L96 118L125 104L154 118L146 150L150 216Z"/><path d="M110 104L112 80Q125 70 138 80L140 104Z"/><path d="M160 210L176 80L182 80L170 210Z"/><path d="M164 108H196V114H164Z"/><path d="M78 120L100 116L104 170L82 176Z"/>') + `<rect x="114" y="88" width="22" height="4" fill="${C}"/>`;
  if (a.mon === 'sorceress') s += g('<path d="M92 216Q100 150 112 120L138 120Q150 150 158 216Z"/><circle cx="125" cy="104" r="14"/><path d="M106 100Q125 64 144 100Q125 92 106 100Z"/><path d="M164 216L172 84"/>') + `<circle cx="173" cy="80" r="9" fill="${C}" opacity=".85"/><circle cx="173" cy="80" r="18" fill="${C}" opacity=".2"/><circle cx="120" cy="104" r="1.6" fill="${C}"/><circle cx="130" cy="104" r="1.6" fill="${C}"/>`;
  if (a.mon === 'golem') s += g('<path d="M96 216L100 170H150L154 216Z"/><path d="M88 120H162L158 172H92Z"/><path d="M108 88H142V120H108Z"/><path d="M62 124H88V176H66Z"/><path d="M162 124H188L184 176H162Z"/>') + `<rect x="114" y="100" width="6" height="5" fill="${C}"/><rect x="130" y="100" width="6" height="5" fill="${C}"/><path d="M100 140L120 150L110 160M150 132L134 156" stroke="${C}" stroke-width="1" fill="none"/>`;
  if (a.mon === 'wraith') s += g('<path d="M96 200Q92 140 104 112Q114 90 125 88Q136 90 146 112Q158 140 154 200Q144 186 136 202Q128 186 120 202Q112 186 104 202Q100 190 96 200Z"/><path d="M146 130L172 150"/>') + `<circle cx="176" cy="156" r="7" fill="${C}"/><circle cx="176" cy="156" r="16" fill="${C}" opacity=".2"/><circle cx="119" cy="110" r="2" fill="${C}"/><circle cx="131" cy="110" r="2" fill="${C}"/>`;
  if (a.mon === 'phoenix') s += `<g fill="${C}" opacity=".85"><path d="M125 130Q80 70 40 90Q70 110 70 140Q96 128 125 140Z"/><path d="M125 130Q170 70 210 90Q180 110 180 140Q154 128 125 140Z"/><path d="M118 150Q110 200 96 214Q125 200 132 214Q140 196 132 150Z" opacity=".7"/></g>` + g('<ellipse cx="125" cy="134" rx="14" ry="22"/><circle cx="125" cy="106" r="10"/><path d="M125 108L138 112L125 114Z"/>') + `<circle cx="122" cy="104" r="1.6" fill="#ffe27a"/>`;
  return s;
}
function rdFront(inst, p, o) {
  const c = def(inst), a = c.art;
  const nm = c.name.toUpperCase();
  const nameFill = inst.v.secret ? `url(#${p}rain)` : inst.v.gold ? `url(#${p}gold)` : '#1a1a1a';
  const hexLive = o.tilt && !isFake(inst, 'flathex');
  return `<linearGradient id="${p}rf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a2a3a"/><stop offset="1" stop-color="#3a0f1e"/></linearGradient>
  <linearGradient id="${p}rs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b0f3d"/><stop offset=".6" stop-color="#7a1f4a"/><stop offset="1" stop-color="#ff7a2f"/></linearGradient>
  <linearGradient id="${p}gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6420"/><stop offset=".3" stop-color="#f7e08a"/><stop offset=".6" stop-color="#b8892d"/><stop offset="1" stop-color="#fff2b8"/></linearGradient>
  <linearGradient id="${p}rain" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff4f9a"/><stop offset=".25" stop-color="#ffd23f"/><stop offset=".5" stop-color="#3fe08a"/><stop offset=".75" stop-color="#3fb8ff"/><stop offset="1" stop-color="#b06bff"/></linearGradient>
  <linearGradient id="${p}silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8d96a3"/><stop offset=".5" stop-color="#f2f5f8"/><stop offset="1" stop-color="#7a8290"/></linearGradient>
  <pattern id="${p}diag" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="6" fill="#ffffff"/></pattern>
  <clipPath id="${p}rw"><rect x="30" y="64" width="190" height="152"/></clipPath>
  <rect x="8" y="8" width="234" height="334" rx="6" fill="url(#${p}rf)"/>
  <rect x="14" y="14" width="196" height="26" fill="#f2e9d8" stroke="#2a1a12" stroke-width="1.5"/>
  <text x="20" y="31.5" font-family="Cinzel,Georgia,serif" font-weight="700" font-size="${fit(nm, 182, 11, 0.74)}" fill="${nameFill}" stroke="${inst.v.gold || inst.v.secret ? '#2a1a12' : '#1a1a1a'}" stroke-width=".25">${esc(nm)}</text>
  <circle cx="225" cy="27" r="11" fill="#2a1240" stroke="#c9a0ff" stroke-width="1.2"/><path d="M228 20A7.5 7.5 0 1 0 228 34A6 6 0 1 1 228 20Z" fill="#c9a0ff"/>
  <g fill="#ff6a2f" stroke="#5a1a0a" stroke-width=".6">${Array.from({ length: c.lv }, (_, k) => `<path d="M${213 - k * 13} 46l5 5.5-5 5.5-5-5.5z"/>`).join('')}</g>
  <rect x="27" y="61" width="196" height="158" fill="#2a1a12"/>
  <g clip-path="url(#${p}rw)">${rdArt(a, p)}${inst.v.secret ? `<rect x="30" y="64" width="190" height="152" fill="url(#${p}diag)" opacity=".35" style="mix-blend-mode:overlay"/>` : ''}</g>
  <text x="220" y="228" text-anchor="end" font-family="${MONO}" font-size="6.5" fill="#f2e9d8">RFT-EN${pad3(c.n)}</text>
  <rect x="14" y="232" width="222" height="88" fill="#f2e9d8" stroke="#2a1a12" stroke-width="1.2"/>
  <text x="20" y="245" font-family="Georgia,serif" font-weight="700" font-size="9.5" fill="#1a1a1a">[ ${esc(c.kind)} ]</text>
  <text font-family="Georgia,serif" font-size="8.4" fill="#1a1a1a">${c.text.map((t, k) => `<tspan x="20" y="${258 + k * 11}">${esc(t)}</tspan>`).join('')}</text>
  <line x1="20" y1="299" x2="230" y2="299" stroke="#2a1a12" stroke-width=".6"/>
  <text x="230" y="312" text-anchor="end" font-family="Georgia,serif" font-weight="700" font-size="9.5" fill="#1a1a1a">ATK / ${c.atk}   DEF / ${c.def}</text>
  <text x="16" y="334" font-family="${MONO}" font-size="6.6" fill="#f2e9d8">${esc(copyrightText(inst))}</text>
  ${raritySym(c, 160, 335, '#f2e9d8')}
  <path d="M226 324l7 4v8l-7 4-7-4v-8z" fill="${hexLive ? `url(#${p}rain)` : `url(#${p}silver)`}" stroke="#2a1a12" stroke-width=".5"/>
  ${hexLive ? `<path d="M226 324l7 4v8l-7 4-7-4v-8z" fill="#ffffff" opacity=".35"><animate attributeName="opacity" values=".1;.6;.1" dur="1.4s" repeatCount="indefinite"/></path>` : ''}`;
}
function rdBack(inst, p) {
  const wrong = isFake(inst, 'back');
  return `<pattern id="${p}rdp" width="24" height="14" patternUnits="userSpaceOnUse"><path d="M0 7L4 0H12L16 7L12 14H4Z" fill="none" stroke="#3a1f5a" stroke-width="1"/></pattern>
  <rect x="8" y="8" width="234" height="334" rx="6" fill="#1b0f2a"/><rect x="8" y="8" width="234" height="334" rx="6" fill="url(#${p}rdp)"/>
  <path d="M125 6L114 74L134 118L110 168L138 214L116 270L130 344" fill="none" stroke="#ff3fa4" stroke-width="14" opacity=".25" stroke-linejoin="round"/>
  <path d="M125 6L114 74L134 118L110 168L138 214L116 270L130 344" fill="none" stroke="${wrong ? '#7ac0ff' : '#ff7ac0'}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M125 132L161 153V195L125 216L89 195V153Z" fill="#120a1c" stroke="#c9a0ff" stroke-width="2.2"/><circle cx="125" cy="175" r="10" fill="#ff3fa4"/><circle cx="125" cy="175" r="4" fill="#120a1c"/>
  <g font-family="Cinzel,Georgia,serif" font-weight="700" text-anchor="middle" fill="#f2e9d8" stroke="#1b0f2a" stroke-width="3" paint-order="stroke"><text x="125" y="100" font-size="36" letter-spacing="6">RIFT</text><text x="125" y="262" font-size="21" letter-spacing="3">DUELISTS</text></g>`;
}

// ================================================================= GRIMOIRE ACCORD
const SCHOOL = {
  ember: { a: '#cf7149', b: '#7f3420', pip: '#e2572b', bg: '#2a1410', glow: '#ff7a2f' },
  tide: { a: '#4a8fc8', b: '#1d3a6a', pip: '#3fa0e8', bg: '#0a1a2e', glow: '#7fd1ff' },
  iron: { a: '#9aa3ad', b: '#4a525a', pip: '#b8c0c8', bg: '#1a1c20', glow: '#ffcf73' },
  grove: { a: '#6a9a4a', b: '#2e4a22', pip: '#5fbf5a', bg: '#0e1e10', glow: '#c8ff9a' },
  void: { a: '#7a5aa8', b: '#2e1d4a', pip: '#a06bff', bg: '#120a1c', glow: '#d0a0ff' },
};
function gaArt(c, p) {
  const sc = SCHOOL[c.art.school], f = c.art.fig;
  let s = `<rect x="24" y="46" width="202" height="150" fill="${sc.bg}"/>`;
  if (c.art.school === 'ember' || c.art.school === 'void') s += [52, 84, 116, 148].map((y) => `<rect x="24" y="${y + 24}" width="60" height="3" fill="#000" opacity=".5"/><rect x="166" y="${y + 24}" width="60" height="3" fill="#000" opacity=".5"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${26 + i * 7}" y="${y + 6 + (i % 3) * 2}" width="5" height="${18 - (i % 3) * 2}" fill="${['#6b2a1e', '#3d4a6b', '#7a5a2a', '#2e5a3a'][i % 4]}"/><rect x="${168 + i * 7}" y="${y + 6 + ((i + 1) % 3) * 2}" width="5" height="${18 - ((i + 1) % 3) * 2}" fill="${['#5a2a4a', '#8a3a22', '#3d4a6b', '#7a5a2a'][i % 4]}"/>`).join('')}`).join('');
  if (c.art.school === 'tide') s += `<path d="M24 160Q60 148 100 160T180 158T226 156V196H24Z" fill="#1d4a7a"/><path d="M24 172Q70 164 120 174T226 170" stroke="#7fd1ff" fill="none" opacity=".5"/>`;
  if (c.art.school === 'grove') s += [40, 70, 180, 208].map((x) => `<rect x="${x}" y="60" width="10" height="136" fill="#1e3a1a"/><circle cx="${x + 5}" cy="70" r="22" fill="#2e5a2a" opacity=".8"/>`).join('');
  if (c.art.school === 'iron') s += `<rect x="24" y="170" width="202" height="26" fill="#2a2a2e"/><rect x="40" y="130" width="40" height="40" fill="#3a3a40"/><circle cx="60" cy="150" r="10" fill="#ff8a3d" opacity=".7"/>`;
  s += `<circle cx="125" cy="140" r="64" fill="${sc.glow}" opacity=".14"/>`;
  if (f === 'hood') s += `<path d="M98 196L111 124Q125 106 139 124L152 196Z" fill="#3b1d2a"/><path d="M108 128Q125 90 142 128Q125 118 108 128Z" fill="#4b2535"/><ellipse cx="125" cy="126" rx="8.5" ry="9.5" fill="#120808"/><circle cx="121.5" cy="125" r="1.4" fill="${sc.glow}"/><circle cx="128.5" cy="125" r="1.4" fill="${sc.glow}"/><path d="M106 150L125 155L144 150L144 161L125 166L106 161Z" fill="#f5e6c8"/>`;
  if (f === 'witch') s += `<path d="M96 196Q104 140 116 120H134Q146 140 154 196Z" fill="#1d3a5a"/><circle cx="125" cy="108" r="12" fill="#c9d6e0"/><path d="M104 106Q125 60 146 106L138 100L125 70L112 100Z" fill="#0a1a2e"/><path d="M112 112Q100 150 96 180M138 112Q150 150 156 180" stroke="#4a8fc8" stroke-width="3" fill="none"/><circle cx="168" cy="120" r="8" fill="#7fd1ff" opacity=".8"/>`;
  if (f === 'golem') s += `<path d="M98 196L102 156H148L152 196Z" fill="#5a626a"/><path d="M92 110H158L154 158H96Z" fill="#6a727a"/><path d="M110 80H140V110H110Z" fill="#7a828a"/><rect x="115" y="92" width="6" height="5" fill="#ffcf73"/><rect x="129" y="92" width="6" height="5" fill="#ffcf73"/><path d="M70 114H92V160H72Z M158 114H180L178 160H158Z" fill="#5a626a"/>`;
  if (f === 'tree') s += `<path d="M110 196L114 130Q100 110 92 90M140 196L136 130Q150 110 160 88M125 196V100" stroke="#5a3a1e" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="125" cy="86" r="30" fill="#3f7a2a"/><circle cx="96" cy="92" r="18" fill="#4f8a3a"/><circle cx="156" cy="90" r="18" fill="#4f8a3a"/><circle cx="117" cy="132" r="2.4" fill="#c8ff9a"/><circle cx="133" cy="132" r="2.4" fill="#c8ff9a"/>`;
  if (f === 'drake') s += `<path d="M125 130L60 96L80 124L56 134L88 146Z" fill="#7a2a1a"/><path d="M125 130L190 96L170 124L194 134L162 146Z" fill="#7a2a1a"/><ellipse cx="125" cy="150" rx="18" ry="30" fill="#a8452a"/><path d="M114 120Q125 96 136 120Z" fill="#a8452a"/><circle cx="121" cy="112" r="1.6" fill="#ffcf73"/><circle cx="129" cy="112" r="1.6" fill="#ffcf73"/><path d="M118 180Q125 200 140 196" stroke="#a8452a" stroke-width="5" fill="none"/>`;
  s += `<g fill="${sc.glow}">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${100 + i * 10}" cy="${120 - i * 11}" r="${1 + (i % 2) * 0.5}"/>`).join('')}</g>`;
  return s;
}
function gaFront(inst, p) {
  const c = def(inst), sc = SCHOOL[c.art.school];
  return `<linearGradient id="${p}gf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sc.a}"/><stop offset="1" stop-color="${sc.b}"/></linearGradient>
  <clipPath id="${p}gw"><rect x="24" y="46" width="202" height="150"/></clipPath>
  <rect x="12" y="12" width="226" height="326" rx="8" fill="url(#${p}gf)"/>
  <rect x="20" y="20" width="210" height="22" rx="4" fill="#efe0c4" stroke="#4a2a1a"/>
  <text x="27" y="35.5" font-family="'IM Fell English SC',Georgia,serif" font-size="${fit(c.name, 150, 13, 0.52)}" fill="#1a0f0a">${esc(c.name)}</text>
  <circle cx="204" cy="31" r="7" fill="#cfc6b8" stroke="#4a2a1a" stroke-width=".6"/><text x="204" y="34.5" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="9.5" fill="#1a0f0a">${c.cost[0]}</text>
  <circle cx="220" cy="31" r="7" fill="${sc.pip}" stroke="#4a2a1a" stroke-width=".6"/><circle cx="220" cy="31" r="2.6" fill="#fff" opacity=".85"/>
  <g clip-path="url(#${p}gw)">${gaArt(c, p)}</g>
  <rect x="24" y="46" width="202" height="150" fill="none" stroke="#4a2a1a" stroke-width="1.5"/>
  <rect x="20" y="200" width="210" height="18" rx="4" fill="#efe0c4" stroke="#4a2a1a"/>
  <text x="27" y="213" font-family="Georgia,serif" font-size="${fit(c.type, 175, 10, 0.5)}" fill="#1a0f0a">${esc(c.type)}</text>
  <rect x="24" y="222" width="202" height="92" fill="#f3e8d2" stroke="#4a2a1a"/>
  <text font-family="Georgia,serif" font-size="9.3" fill="#1a0f0a">${c.text.map((t, k) => `<tspan x="31" y="${238 + k * 12}">${esc(t)}</tspan>`).join('')}</text>
  <rect x="184" y="304" width="46" height="20" rx="4" fill="#efe0c4" stroke="#4a2a1a"/><text x="207" y="318.5" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="12.5" fill="#1a0f0a">${c.pt}</text>
  <text x="24" y="333" font-family="${MONO}" font-size="6" fill="#f3e8d2">${esc(LINES.ga.setCode)} · ${pad3(c.n)}/${pad3(LINES.ga.total)} · ${esc(copyrightText(inst))}</text>`;
}
function gaBack(inst, p) {
  const wrong = isFake(inst, 'back');
  return `<rect x="12" y="12" width="226" height="326" rx="8" fill="#1f2e26"/><rect x="22" y="22" width="206" height="306" rx="4" fill="none" stroke="#b08d4a" stroke-width="1" stroke-dasharray="4 3"/>
  <g fill="#b08d4a"><path d="M12 20Q12 12 20 12H50L12 50Z"/><path d="M238 20Q238 12 230 12H200L238 50Z"/><path d="M12 330Q12 338 20 338H50L12 300Z"/><path d="M238 330Q238 338 230 338H200L238 300Z"/></g>
  <circle cx="125" cy="175" r="60" fill="none" stroke="#b08d4a" stroke-width="2" stroke-dasharray="2 5"/><circle cx="125" cy="175" r="48" fill="#15201a" stroke="#b08d4a" stroke-width="2"/>
  <circle cx="125" cy="164" r="11" fill="#b08d4a"/><path d="M118 170H132L136 198H114Z" fill="#b08d4a"/><circle cx="125" cy="164" r="4" fill="#15201a"/>
  <g font-family="Cinzel,Georgia,serif" font-weight="700" fill="#d9b86a" text-anchor="middle" letter-spacing="3"><text x="125" y="84" font-size="22">GRIMOIRE</text><text x="125" y="282" font-size="22">${wrong ? 'ACORD' : 'ACCORD'}</text></g>`;
}

// ================================================================= HOLLOW PANTHEON
function hpSym(sym, G) {
  const gs = `class="gold-s" stroke="${G}"`, gf = `class="gold-f" fill="${G}"`;
  if (sym === 'door') return `<path ${gs} d="M83 212V136A42 42 0 0 1 167 136V212" fill="none" stroke-width="1.2"/><path ${gs} d="M95 212V140A30 30 0 0 1 155 140V212Z" fill="#0b0907" stroke-width="2"/><path ${gs} d="M107 152Q125 136 143 152Q125 168 107 152Z" fill="none" stroke-width="1.3"/><circle ${gf} cx="125" cy="152" r="6"/>`;
  if (sym === 'sun') return `<circle ${gf} cx="125" cy="132" r="30"/><circle cx="125" cy="132" r="20" fill="#0b0907"/><circle ${gf} cx="125" cy="132" r="8"/>${Array.from({ length: 16 }, (_, k) => { const a = (k / 16) * Math.PI * 2; return `<line ${gs} x1="${125 + Math.cos(a) * 36}" y1="${132 + Math.sin(a) * 36}" x2="${125 + Math.cos(a) * 52}" y2="${132 + Math.sin(a) * 52}" stroke-width="1.5"/>`; }).join('')}`;
  if (sym === 'moon') return `<circle ${gf} cx="125" cy="130" r="38"/><circle cx="142" cy="120" r="34" fill="#15110c"/><circle ${gf} cx="98" cy="96" r="2"/><circle ${gf} cx="160" cy="170" r="2"/><circle ${gf} cx="170" cy="96" r="1.5"/>`;
  if (sym === 'scales') return `<line ${gs} x1="125" y1="90" x2="125" y2="200" stroke-width="3"/><line ${gs} x1="80" y1="104" x2="170" y2="104" stroke-width="2.5"/><path ${gs} d="M80 104L66 146H94Z M170 104L156 146H184Z" fill="none" stroke-width="1.5"/><path ${gf} d="M64 146Q80 160 96 146Z M154 146Q170 160 186 146Z"/><rect ${gf} x="105" y="198" width="40" height="6"/>`;
  if (sym === 'serpent') return `<circle ${gs} cx="125" cy="140" r="44" fill="none" stroke-width="8"/><circle cx="125" cy="140" r="44" fill="none" stroke="#0b0907" stroke-width="2" stroke-dasharray="4 6"/><path ${gf} d="M160 112L176 100L172 120Z"/><circle cx="168" cy="110" r="1.6" fill="#0b0907"/>`;
  if (sym === 'hourglass') return `<path ${gs} d="M95 90H155M95 196H155M100 90Q100 130 125 143Q150 130 150 90M100 196Q100 156 125 143Q150 156 150 196" fill="none" stroke-width="2.5"/><path ${gf} d="M108 104Q125 128 142 104Z M112 192Q125 170 138 192Z"/><line ${gs} x1="125" y1="143" x2="125" y2="170" stroke-width="1" stroke-dasharray="2 2"/>`;
  return '';
}
function hpFront(inst, p) {
  const c = def(inst);
  const G = inst.v.vintage ? `url(#${p}tarn)` : `url(#${p}gold)`;
  return `<linearGradient id="${p}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5a1c"/><stop offset=".25" stop-color="#f7e08a"/><stop offset=".5" stop-color="#b8892d"/><stop offset=".72" stop-color="#fff2b8"/><stop offset="1" stop-color="#8a6420"/></linearGradient>
  <linearGradient id="${p}tarn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2e1e"/><stop offset=".3" stop-color="#8a7550"/><stop offset=".55" stop-color="#4f4430"/><stop offset=".75" stop-color="#7a6a48"/><stop offset="1" stop-color="#2e2416"/></linearGradient>
  <clipPath id="${p}hw"><rect x="22" y="46" width="206" height="170"/></clipPath>
  <rect x="7" y="7" width="236" height="336" rx="8" fill="#0f0d0b" stroke="${G}" stroke-width="3"/>
  <rect x="13" y="13" width="224" height="324" rx="5" fill="none" stroke="${G}" stroke-width=".8"/>
  <g fill="${G}"><path d="M13 7l6 6-6 6-6-6z"/><path d="M237 7l6 6-6 6-6-6z"/><path d="M13 331l6 6-6 6-6-6z"/><path d="M237 331l6 6-6 6-6-6z"/></g>
  <text x="125" y="37" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="700" font-size="${fit(c.name.toUpperCase(), 190, 18, 0.78)}" letter-spacing="2" fill="${G}">${esc(c.name.toUpperCase())}</text>
  <g clip-path="url(#${p}hw)"><rect x="22" y="46" width="206" height="170" fill="#15110c"/>
    <circle cx="125" cy="140" r="82" fill="none" stroke="${G}" stroke-width="40" stroke-dasharray="1.2 5" opacity=".4"/><circle cx="125" cy="140" r="60" fill="#15110c"/>
    ${hpSym(c.art.sym, G)}
    ${inst.v.vintage ? '<g fill="#2b3a2c" opacity=".8"><circle cx="78" cy="160" r="6"/><circle cx="168" cy="118" r="4"/><circle cx="150" cy="200" r="5"/><circle cx="60" cy="80" r="3"/></g>' : ''}</g>
  <rect x="22" y="46" width="206" height="170" fill="none" stroke="${G}"/>
  <rect x="22" y="224" width="206" height="88" fill="#15110c" stroke="${G}" stroke-width=".6"/>
  <text x="125" y="243" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="700" font-size="10" letter-spacing="2" fill="${G}">${esc(c.title)}</text>
  <text text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="10.5" fill="#e8dcc0"><tspan x="125" y="266">${esc(c.text[0])}</tspan><tspan x="125" y="281">${esc(c.text[1])}</tspan></text>
  <text x="125" y="302" text-anchor="middle" font-family="${MONO}" font-size="6.5" fill="${G}">${inst.v.vintage ? 'FIRST PRINTING · 1987' : 'REPRINT · 2003'}</text>
  ${footer(inst, '#b8892d', 5.6)}
  ${inst.v.vintage ? '<g fill="#2b3a2c" opacity=".8"><circle cx="9" cy="120" r="4"/><circle cx="240" cy="260" r="5"/><circle cx="60" cy="342" r="4"/></g>' : ''}`;
}
function hpBack(inst, p) {
  const wrong = isFake(inst, 'back');
  const G = inst.v.vintage ? '#7a6a48' : '#d9b86a';
  return `<rect x="7" y="7" width="236" height="336" rx="8" fill="#0f0d0b" stroke="${G}" stroke-width="3"/>
  <circle cx="125" cy="175" r="82" fill="none" stroke="${G}" stroke-width="40" stroke-dasharray="1.2 5" opacity=".45"/><circle cx="125" cy="175" r="58" fill="#0f0d0b"/>
  <path d="M97 228V174A28 28 0 0 1 153 174V228Z" fill="#0b0907" stroke="${G}" stroke-width="2"/><path d="M109 184Q125 170 141 184Q125 198 109 184Z" fill="none" stroke="${G}" stroke-width="1.3"/><circle cx="125" cy="184" r="${wrong ? 3 : 5}" fill="${G}"/>
  <g fill="${G}" font-family="Cinzel,Georgia,serif" font-weight="700" text-anchor="middle" letter-spacing="5"><text x="125" y="62" font-size="22">HOLLOW</text><text x="125" y="304" font-size="18">PANTHEON</text></g>`;
}

// ================================================================= IRONCLAD DERBY
export function icStats(inst) {
  const c = def(inst);
  const run1 = !!inst.v.run1;
  let s = (run1 ? c.s1 : c.s2).slice();
  if (isFake(inst, 'badstats')) s = run1 ? c.s2.slice() : s.map((x, i) => (i === 1 ? Math.min(10, x + 2) : x));
  return { s, run1 };
}
function icFront(inst, p) {
  const c = def(inst), a = c.art, st = icStats(inst);
  const hat = { top: '<rect x="77" y="114" width="12" height="13" fill="#2e1d10"/><rect x="73" y="125" width="20" height="3" fill="#2e1d10"/>', cap: '<path d="M75 128Q83 118 91 128Z" fill="#c0392b"/><rect x="88" y="126" width="7" height="2" fill="#c0392b"/>', goggles: '<path d="M75 128Q83 116 91 128Z" fill="#3a2a1a"/>', bowler: '<path d="M76 128Q83 114 90 128Z" fill="#1a1a1a"/><rect x="73" y="127" width="20" height="2.5" fill="#1a1a1a"/>', scarf: '<path d="M75 128Q83 118 91 128Z" fill="#5a3a1e"/><path d="M76 138L60 132" stroke="#f2c46d" stroke-width="3"/>' }[a.hat] || '';
  return `<linearGradient id="${p}is" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d9a6"/><stop offset="1" stop-color="#c99a5b"/></linearGradient>
  <linearGradient id="${p}ib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${a.body}"/><stop offset="1" stop-color="#3a2616"/></linearGradient>
  <clipPath id="${p}iw"><rect x="22" y="46" width="206" height="170"/></clipPath>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#3a2616" stroke="#c68a4a" stroke-width="2"/>
  <g fill="#c68a4a"><circle cx="16" cy="16" r="2.2"/><circle cx="234" cy="16" r="2.2"/><circle cx="16" cy="334" r="2.2"/><circle cx="234" cy="334" r="2.2"/></g>
  <text x="125" y="37" text-anchor="middle" font-family="Rye,Georgia,serif" font-size="${fit(c.name.toUpperCase(), 196, 17, 0.72)}" fill="#f1d9a6">${esc(c.name.toUpperCase())}</text>
  <g clip-path="url(#${p}iw)"><rect x="22" y="46" width="206" height="170" fill="url(#${p}is)"/>
    <g fill="none" stroke="#a8763c" opacity=".45"><circle cx="58" cy="96" r="30" stroke-width="10" stroke-dasharray="7 5"/><circle cx="206" cy="146" r="22" stroke-width="8" stroke-dasharray="5 4"/></g>
    <path d="M22 186V166Q60 156 90 164T160 160T228 162V186Z" fill="#b98a52"/><rect x="22" y="186" width="206" height="30" fill="#7a5230"/>
    <line x1="22" y1="202" x2="228" y2="202" stroke="#d9b47c" stroke-width="1.5" stroke-dasharray="10 8"/>
    <g fill="#f5ead2" opacity=".85"><circle cx="160" cy="92" r="8"/><circle cx="172" cy="78" r="11"/><circle cx="192" cy="64" r="14"/></g>
    <path d="M152 132L148 104L164 104L160 132Z" fill="#4a2f14"/><rect x="70" y="162" width="112" height="10" rx="3" fill="#5a3a1e"/>
    <rect x="95" y="130" width="70" height="38" rx="18" fill="url(#${p}ib)" stroke="#4a2f14" stroke-width="1.5"/>
    <circle cx="131" cy="149" r="11" fill="#f1d9a6" stroke="#4a2f14" stroke-width="1.5"/><text x="131" y="154.5" text-anchor="middle" font-family="Rye,Georgia,serif" font-size="${c.no > 9 ? 11 : 15}" fill="#3a2616">${c.no}</text>
    <rect x="72" y="140" width="22" height="24" rx="2" fill="#5a3a1e"/><circle cx="83" cy="132" r="7" fill="#e9c9a0"/>${hat}
    ${a.hat === 'goggles' ? '<rect x="78" y="129" width="10" height="4" rx="1" fill="#6fb7c9"/>' : ''}
    <circle cx="85" cy="182" r="24" fill="#2e1d10" stroke="#c68a4a" stroke-width="3"/><g stroke="#c68a4a" stroke-width="2"><line x1="61" y1="182" x2="109" y2="182"/><line x1="85" y1="158" x2="85" y2="206"/><line x1="68" y1="165" x2="102" y2="199"/><line x1="102" y1="165" x2="68" y2="199"/></g>
    <circle cx="170" cy="190" r="16" fill="#2e1d10" stroke="#c68a4a" stroke-width="3"/><g stroke="#c68a4a" stroke-width="1.6"><line x1="154" y1="190" x2="186" y2="190"/><line x1="170" y1="174" x2="170" y2="206"/></g></g>
  <rect x="22" y="46" width="206" height="170" fill="none" stroke="#c68a4a"/>
  <rect x="22" y="224" width="206" height="88" fill="#2a1b0f" stroke="#c68a4a" stroke-width=".6"/>
  <text x="125" y="242" text-anchor="middle" font-family="Rye,Georgia,serif" font-size="10" fill="#e0a85f">Steam Racer · ${esc(c.cls)}</text>
  <g font-family="${MONO}" font-size="9.5" fill="#f1d9a6">${['SPEED', 'GRIT', 'BOILER'].map((n, k) => `<text x="34" y="${263 + k * 17}">${n}</text><text x="216" y="${263 + k * 17}" text-anchor="end">${st.s[k]}</text><rect x="84" y="${256 + k * 17}" width="${st.s[k] * 12}" height="7" rx="1" fill="#c68a4a"/>`).join('')}</g>
  <text x="22" y="329" font-family="${MONO}" font-size="7" fill="#c68a4a">${esc(LINES.ic.setCode)} · ${pad3(c.n)}/${pad3(LINES.ic.total)} · RUN ${st.run1 ? 1 : 2}</text>
  <text x="228" y="329" text-anchor="end" font-family="${MONO}" font-size="5.4" fill="#c68a4a">${esc(copyrightText(inst))}</text>`;
}
function icBack(inst, p) {
  const wrong = isFake(inst, 'back');
  return `<rect x="8" y="8" width="234" height="334" rx="8" fill="#3a2616" stroke="#c68a4a" stroke-width="2"/>
  <circle cx="125" cy="175" r="66" fill="none" stroke="#c68a4a" stroke-width="16" stroke-dasharray="${wrong ? '8 9' : '10 7'}"/><circle cx="125" cy="175" r="54" fill="#2a1b0f" stroke="#c68a4a" stroke-width="3"/>
  <g transform="rotate(-8 125 175)"><rect x="101" y="151" width="48" height="48" fill="#f1d9a6"/><g fill="#2a1b0f">${[[0, 0], [24, 0], [12, 12], [36, 12], [0, 24], [24, 24], [12, 36], [36, 36]].map(([x, y]) => `<rect x="${101 + x}" y="${151 + y}" width="12" height="12"/>`).join('')}</g></g>
  <text x="125" y="80" text-anchor="middle" font-family="Rye,Georgia,serif" font-size="25" fill="#f1d9a6">IRONCLAD</text><text x="125" y="292" text-anchor="middle" font-family="Rye,Georgia,serif" font-size="30" fill="#f1d9a6">DERBY</text>`;
}

// ================================================================= CRYPTID FIELD NOTES
function cfPhoto(a, p) {
  let s = `<rect x="38" y="62" width="174" height="128" fill="url(#${p}cs)"/>`;
  const sc = a.scene;
  if (sc === 'pines' || sc === 'ridge') s += `<g fill="#8a8b84"><polygon points="96,190 110,126 124,190"/><polygon points="160,190 172,130 184,190"/></g>`;
  if (sc === 'ridge') s += `<path d="M38 150Q80 120 120 140T212 130V190H38Z" fill="#5a5b54"/><circle cx="180" cy="90" r="10" fill="#e8e8e0"/>`;
  if (sc === 'lake') s += `<rect x="38" y="140" width="174" height="50" fill="#7a7d78"/><path d="M38 140H212" stroke="#d0d0c8"/><path d="M38 150Q60 146 80 150T120 150T160 150T212 150" stroke="#a0a39c" fill="none"/>`;
  if (sc === 'road') s += `<path d="M38 190L100 120H150L212 190Z" fill="#4a4b46"/><path d="M125 124V190" stroke="#d0d0c8" stroke-dasharray="6 6"/><rect x="58" y="170" width="26" height="10" fill="#1d1d1a"/>`;
  if (sc === 'field') s += `<rect x="38" y="150" width="174" height="40" fill="#8a8574"/><path d="M150 150V118L172 104L194 118V150Z" fill="#3b3c36"/>`;
  s += `<g filter="url(#${p}cb)" fill="#1d1d1a" stroke="#1d1d1a" stroke-linecap="round">`;
  const cr = a.crit;
  if (cr === 'strider') s += `<ellipse cx="134" cy="106" rx="3.6" ry="5"/><path d="M131 111L137 111L139 148L132 148Z"/><line x1="133" y1="147" x2="124" y2="187" stroke-width="2.2"/><line x1="137" y1="147" x2="144" y2="187" stroke-width="2.2"/><line x1="131" y1="115" x2="119" y2="160" stroke-width="1.6"/><line x1="138" y1="115" x2="148" y2="162" stroke-width="1.6"/>`;
  if (cr === 'neck') s += `<path d="M110 142Q112 100 126 92Q134 90 136 98Q126 102 122 142Z"/><path d="M140 144Q150 132 160 144Z"/><path d="M168 144Q174 138 180 144Z"/>`;
  if (cr === 'howler') s += `<path d="M118 186L122 150Q112 140 116 124Q124 112 134 116L140 108L142 120Q148 134 140 150L144 186L136 186L132 160L126 160L124 186Z"/>`;
  if (cr === 'crawler') s += `<ellipse cx="120" cy="176" rx="14" ry="6"/><circle cx="104" cy="172" r="5"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${112 + i * 4} 176L${106 + i * 6} ${168 - (i % 2) * 8}L${102 + i * 7} 186" fill="none" stroke-width="1.4"/>`).join('')}`;
  if (cr === 'gray') s += `<ellipse cx="124" cy="146" rx="9" ry="11"/><path d="M118 156H130L132 184H116Z"/><line x1="118" y1="160" x2="110" y2="178" stroke-width="1.4"/><line x1="130" y1="160" x2="138" y2="178" stroke-width="1.4"/>`;
  if (cr === 'owl') s += `<path d="M120 188L122 140Q114 122 124 112Q134 104 142 114Q148 126 140 140L142 188Z"/>`;
  s += `</g>`;
  if (cr === 'owl') s += `<circle cx="127" cy="120" r="2.4" fill="#fff8b0"/><circle cx="137" cy="120" r="2.4" fill="#fff8b0"/>`;
  if (sc === 'pines') s += `<g fill="#2e302c"><polygon points="36,190 54,108 72,190"/><polygon points="58,190 78,94 98,190"/><polygon points="176,190 196,104 216,190"/></g>`;
  s += `<rect x="38" y="62" width="174" height="128" filter="url(#${p}cn)" opacity=".26" style="mix-blend-mode:multiply"/>`;
  return s;
}
function cfFront(inst, p) {
  const c = def(inst);
  const serial = inst.v.serial;
  return `<linearGradient id="${p}cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2c2bb"/><stop offset="1" stop-color="#6d6d68"/></linearGradient>
  <filter id="${p}cb"><feGaussianBlur stdDeviation=".9"/></filter>
  <filter id="${p}cn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <clipPath id="${p}cp"><rect x="38" y="62" width="174" height="128"/></clipPath>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#e6dcc3" stroke="#8a7a58" stroke-width=".8"/>
  <text x="22" y="34" font-family="'Special Elite','Courier New',monospace" font-size="17" fill="#2a2418">${esc(c.name.toUpperCase())}</text>
  <text x="228" y="33" text-anchor="end" font-family="${MONO}" font-size="7" letter-spacing="1" fill="#6a5a3a">CASE FILE · CFN</text>
  <g transform="rotate(-3 125 140)"><rect x="33" y="55" width="190" height="170" fill="#000" opacity=".15"/><rect x="30" y="52" width="190" height="170" fill="#f8f6ef"/>
    <g clip-path="url(#${p}cp)">${cfPhoto(c.art, p)}<text x="206" y="184" text-anchor="end" font-family="${MONO}" font-size="7.5" fill="#ff8a3d">${esc(c.year)} 10 31</text></g>
    <text x="125" y="212" text-anchor="middle" font-family="'Special Elite','Courier New',monospace" font-size="10.5" fill="#33312a">${esc(c.place)} · ${esc(c.height)}</text>
    <path d="M184 44V68A5 5 0 0 0 194 68V42A7 7 0 0 0 180 42V64" fill="none" stroke="#8a8f96" stroke-width="2"/></g>
  <g font-family="'Special Elite','Courier New',monospace" fill="#2a2418"><text x="24" y="246" font-size="${fit('SUBJECT: ' + c.subject, 200, 11, 0.6)}">SUBJECT: ${esc(c.subject)}</text>
    <text font-size="9.5"><tspan x="24" y="270">${esc(c.quote[0])}</tspan><tspan x="24" y="283">${esc(c.quote[1])}</tspan></text></g>
  <text x="24" y="330" font-family="${MONO}" font-size="7.4" fill="#6a5a3a">${esc(LINES.cf.setCode)} · ${pad3(c.n)}/${pad3(LINES.cf.total)}</text>
  <text x="228" y="330" text-anchor="end" font-family="${MONO}" font-size="5.6" fill="#6a5a3a">${esc(copyrightText(inst))}</text>
  ${serial ? `<g transform="translate(-6 18) rotate(-10 186 300)" style="mix-blend-mode:multiply"><rect x="144" y="282" width="86" height="36" rx="3" fill="none" stroke="#c0262d" stroke-width="2"/><text x="187" y="298" text-anchor="middle" font-family="'Special Elite','Courier New',monospace" font-size="13" fill="#c0262d">VERIFIED</text><text x="187" y="311" text-anchor="middle" font-family="'Special Elite','Courier New',monospace" font-size="9.5" fill="#c0262d">No. ${String(serial).padStart(2, '0')}/50</text></g>` : ''}`;
}
function cfBack(inst, p) {
  const wrong = isFake(inst, 'back');
  return `<pattern id="${p}cfl" width="10" height="14" patternUnits="userSpaceOnUse"><line x1="0" y1="13.5" x2="10" y2="13.5" stroke="#cdbf9e" stroke-width=".7"/></pattern>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#e6dcc3" stroke="#8a7a58" stroke-width=".8"/><rect x="14" y="84" width="222" height="236" fill="url(#${p}cfl)"/>
  <text x="125" y="44" text-anchor="middle" font-family="'Special Elite','Courier New',monospace" font-size="17" fill="#2a2418">CRYPTID FIELD NOTES</text>
  <text x="125" y="62" text-anchor="middle" font-family="${MONO}" font-size="6.5" letter-spacing="1.2" fill="#6a5a3a">BUREAU OF ${wrong ? 'UNEXPLAINED SIGHTING' : 'UNEXPLAINED SIGHTINGS'}</text>
  <g fill="#3a3226" opacity=".88"><path d="M125 162C150 162 156 190 152 214C148 238 140 252 125 252C108 252 100 236 98 214C96 188 102 162 125 162Z"/><circle cx="102" cy="150" r="8"/><circle cx="116" cy="138" r="8.5"/><circle cx="134" cy="136" r="8.5"/><circle cx="150" cy="144" r="7.5"/><circle cx="160" cy="158" r="6"/></g>
  <g transform="rotate(-10 125 290)"><rect x="66" y="274" width="118" height="30" rx="3" fill="none" stroke="#c0262d" stroke-width="2.2"/><text x="125" y="295" text-anchor="middle" font-family="'Special Elite','Courier New',monospace" font-size="16" fill="#c0262d">CLASSIFIED</text></g>`;
}

// ================================================================= STARPOST
export const spPerfs = (inst) => (isFake(inst, 'perfs') ? [27, 19] : [28, 20]);
function spArt(subj) {
  let s = `<g fill="#f3ead2"><circle cx="40" cy="84" r=".9"/><circle cx="70" cy="200" r=".7"/><circle cx="110" cy="80" r="1"/><circle cx="200" cy="90" r=".8"/><circle cx="212" cy="200" r="1"/><circle cx="186" cy="130" r=".6"/></g>`;
  if (subj === 'rocket') s += `<path d="M36 232Q90 214 136 170" fill="none" stroke="#f3ead2" stroke-width="7" stroke-linecap="round" opacity=".35"/><g transform="translate(152 150) rotate(45)"><path d="M-6 22Q0 42 6 22Z" fill="#ffb347"/><path d="M-8 10L-18 26L-8 22Z" fill="#c0392b"/><path d="M8 10L18 26L8 22Z" fill="#c0392b"/><path d="M0 -34C12 -22 12 10 8 22L-8 22C-12 10 -12 -22 0 -34Z" fill="#f3ead2" stroke="#1b2a6b" stroke-width="1.5"/><circle cx="0" cy="-10" r="5" fill="#2a3d8f" stroke="#1b2a6b"/><g transform="translate(9 0)"><rect width="15" height="10" fill="#fff" stroke="#1b2a6b"/><path d="M0 0L7.5 5.5L15 0" fill="none" stroke="#1b2a6b"/></g></g>`;
  if (subj === 'planet') s += `<circle cx="125" cy="150" r="40" fill="#e0a458"/><path d="M96 138Q125 128 154 142" stroke="#b97a32" stroke-width="3" fill="none"/><ellipse cx="125" cy="150" rx="68" ry="13" fill="none" stroke="#f3ead2" stroke-width="2.5" transform="rotate(-18 125 150)"/><rect x="168" y="102" width="16" height="11" fill="#fff" stroke="#1b2a6b"/>`;
  if (subj === 'astronaut') s += `<circle cx="125" cy="128" r="22" fill="#f3ead2" stroke="#1b2a6b" stroke-width="2"/><rect x="112" y="118" width="26" height="16" rx="7" fill="#2a3d8f"/><path d="M104 150H146L150 196H100Z" fill="#f3ead2" stroke="#1b2a6b" stroke-width="2"/><path d="M104 156L84 178M146 156L170 140" stroke="#f3ead2" stroke-width="9" stroke-linecap="round"/><rect x="166" y="128" width="16" height="11" fill="#fff" stroke="#1b2a6b"/>`;
  if (subj === 'whale') s += `<path d="M48 160Q70 110 130 116Q186 120 196 150Q170 140 160 158Q140 186 90 180Q60 176 48 160Z" fill="#3a5ab0" stroke="#f3ead2" stroke-width="1.2"/><path d="M196 150L214 132L210 156L222 172L196 160Z" fill="#3a5ab0" stroke="#f3ead2"/><circle cx="78" cy="148" r="3" fill="#f3ead2"/><path d="M64 168Q100 176 140 166" stroke="#f3ead2" fill="none" stroke-dasharray="2 4"/><g fill="#fff" stroke="#1b2a6b" stroke-width=".8"><rect x="110" y="106" width="12" height="8"/><rect x="128" y="100" width="12" height="8"/></g>`;
  if (subj === 'dish') s += `<path d="M90 120Q125 170 170 130Z" fill="#f3ead2" stroke="#1b2a6b" stroke-width="2"/><line x1="130" y1="146" x2="146" y2="104" stroke="#f3ead2" stroke-width="2"/><circle cx="148" cy="100" r="4" fill="#c0392b"/><path d="M128 150L120 200H140L132 150" fill="#8a8f96"/><g fill="none" stroke="#f3ead2" opacity=".6"><path d="M160 90Q170 80 168 68"/><path d="M168 96Q184 82 180 62"/></g>`;
  if (subj === 'comet') s += `<path d="M30 220L150 120" stroke="#f3ead2" stroke-width="18" stroke-linecap="round" opacity=".18"/><path d="M50 210L150 120" stroke="#ffe3a8" stroke-width="8" stroke-linecap="round" opacity=".45"/><circle cx="154" cy="116" r="14" fill="#fff6d6"/><rect x="170" y="88" width="16" height="11" fill="#fff" stroke="#1b2a6b" transform="rotate(14 178 94)"/>`;
  return s;
}
function spFront(inst, p) {
  const c = def(inst);
  const [nl, ns] = spPerfs(inst);
  let holes = '';
  for (let k = 0; k < nl; k++) { const y = (k + 0.5) * (350 / nl); holes += `<circle cx="0" cy="${y.toFixed(1)}" r="4"/><circle cx="250" cy="${y.toFixed(1)}" r="4"/>`; }
  for (let k = 0; k < ns; k++) { const x = (k + 0.5) * (250 / ns); holes += `<circle cx="${x.toFixed(1)}" cy="0" r="4"/><circle cx="${x.toFixed(1)}" cy="350" r="4"/>`; }
  const inv = inst.v.inverted;
  return `<mask id="${p}spm" maskUnits="userSpaceOnUse" x="-20" y="-20" width="290" height="390"><rect x="-20" y="-20" width="290" height="390" fill="#fff"/><g fill="#000">${holes}</g></mask>
  <linearGradient id="${p}ss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1a4a"/><stop offset="1" stop-color="#2a3d8f"/></linearGradient>
  <clipPath id="${p}sw"><rect x="24" y="70" width="202" height="170"/></clipPath>
  <g mask="url(#${p}spm)"><rect x="-8" y="-8" width="266" height="366" fill="#f3ead2"/>
  <rect x="14" y="14" width="222" height="322" fill="none" stroke="#1b2a6b" stroke-width="1.5"/><rect x="18" y="18" width="214" height="314" fill="none" stroke="#1b2a6b" stroke-width=".5"/>
  <text x="24" y="56" font-family="Righteous,sans-serif" font-size="36" fill="#c0392b">${c.val}</text>
  <text x="${c.val > 9 ? 66 : 46}" y="44" font-family="${MONO}" font-size="7" letter-spacing="1" fill="#1b2a6b">LUMENS</text>
  <text x="226" y="34" text-anchor="end" font-family="${MONO}" font-size="8.5" letter-spacing="3" fill="#1b2a6b">STARPOST</text>
  <text x="226" y="46" text-anchor="end" font-family="${MONO}" font-size="6" letter-spacing="2" fill="#1b2a6b">GALACTIC MAIL · YR 3012</text>
  <g clip-path="url(#${p}sw)"><rect x="24" y="70" width="202" height="170" fill="url(#${p}ss)"/><g ${inv ? 'transform="rotate(180 125 155)"' : ''}>${spArt(c.art.subj)}</g></g>
  <rect x="24" y="70" width="202" height="170" fill="none" stroke="#1b2a6b" stroke-width="1.2"/>
  <text x="125" y="266" text-anchor="middle" font-family="Righteous,sans-serif" font-size="${fit(c.name.toUpperCase(), 196, 18, 0.62)}" fill="#1b2a6b">${esc(c.name.toUpperCase())}</text>
  <text x="125" y="284" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="10" fill="#3a3a3a">${esc(c.sub)}</text>
  <text x="24" y="320" font-family="${MONO}" font-size="7.2" fill="#1b2a6b">${esc(LINES.sp.setCode)} · ${pad3(c.n)}/${pad3(LINES.sp.total)}</text>
  <text x="226" y="320" text-anchor="end" font-family="${MONO}" font-size="5.2" fill="#1b2a6b">${esc(copyrightText(inst))}</text>
  ${raritySym(c, 125, 305, '#c0392b')}</g>`;
}
function spBack(inst, p) {
  const wrong = isFake(inst, 'back');
  const [nl, ns] = spPerfs(inst);
  let holes = '';
  for (let k = 0; k < nl; k++) { const y = (k + 0.5) * (350 / nl); holes += `<circle cx="0" cy="${y.toFixed(1)}" r="4"/><circle cx="250" cy="${y.toFixed(1)}" r="4"/>`; }
  for (let k = 0; k < ns; k++) { const x = (k + 0.5) * (250 / ns); holes += `<circle cx="${x.toFixed(1)}" cy="0" r="4"/><circle cx="${x.toFixed(1)}" cy="350" r="4"/>`; }
  return `<mask id="${p}spb" maskUnits="userSpaceOnUse" x="-20" y="-20" width="290" height="390"><rect x="-20" y="-20" width="290" height="390" fill="#fff"/><g fill="#000">${holes}</g></mask>
  <g mask="url(#${p}spb)"><rect x="-8" y="-8" width="266" height="366" fill="#f3ead2"/>
  <rect x="14" y="14" width="222" height="322" fill="none" stroke="#1b2a6b" stroke-width="1.5"/>
  <text x="125" y="54" text-anchor="middle" font-family="Righteous,sans-serif" font-size="22" fill="#1b2a6b">STARPOST</text>
  <text x="125" y="68" text-anchor="middle" font-family="${MONO}" font-size="6.5" letter-spacing="2.5" fill="#c0392b">GALACTIC MAIL SERVICE</text>
  <g fill="none" stroke="#1b2a6b" stroke-width="1.6" opacity=".85"><circle cx="90" cy="150" r="42"/><circle cx="90" cy="150" r="34" stroke-width=".8"/><path d="M140 128q10-6 20 0t20 0t20 0t20 0M140 142q10-6 20 0t20 0t20 0t20 0M140 156q10-6 20 0t20 0t20 0t20 0"/></g>
  <g font-family="${MONO}" fill="#1b2a6b" text-anchor="middle" opacity=".85"><text x="90" y="140" font-size="7">ORBIT STN 4</text><text x="90" y="156" font-size="11">${wrong ? '3021' : '3012'}</text><text x="90" y="170" font-size="7">· MARS ·</text></g>
  ${inst.clue === 'back' ? '<g transform="rotate(-14 170 210)" opacity=".8"><circle cx="170" cy="210" r="30" fill="none" stroke="#7a1a1a" stroke-width="2"/><text x="170" y="204" text-anchor="middle" font-family="\'Special Elite\',monospace" font-size="7" fill="#7a1a1a">MARSH ESTATE</text><text x="170" y="214" text-anchor="middle" font-family="\'Special Elite\',monospace" font-size="6.5" fill="#7a1a1a">NIGHT MARKET</text><text x="170" y="223" text-anchor="middle" font-family="\'Special Elite\',monospace" font-size="6.5" fill="#7a1a1a">THURSDAY</text></g>' : ''}
  <text x="34" y="236" font-family="'Special Elite','Courier New',monospace" font-size="11" fill="#1b2a6b">TO:</text>
  <g stroke="#1b2a6b" stroke-width=".7"><line x1="60" y1="236" x2="214" y2="236"/><line x1="34" y1="262" x2="214" y2="262"/><line x1="34" y1="288" x2="214" y2="288"/></g></g>`;
}

export const FRONT2 = { ml: mlFront, tb: tbFront, rd: rdFront, ga: gaFront, hp: hpFront, ic: icFront, cf: cfFront, sp: spFront };
export const BACK2 = { ml: mlBack, tb: tbBack, rd: rdBack, ga: gaBack, hp: hpBack, ic: icBack, cf: cfBack, sp: spBack };
export const STOCK2 = { ml: '#2a1a33', tb: '#0e3b43', rd: '#1a1216', ga: '#111111', hp: '#0f0d0b', ic: '#3a2616', cf: '#e6dcc3', sp: '#f3ead2' };
