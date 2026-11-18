// Card faces for the eight lines added in weeks 2 to 4, plus shared text helpers.
import { LINES, CARDS } from './data.js';
import { mlArt, tbArt, rdArt, gaArt, SCHOOL, hpSym, icArt, cfPhoto, spArt } from './art.js';
export const RSYM = { c: '●', u: '◆', r: '★', m: '✦' };
// Colorblind cues: spell out what is otherwise shown only by color (holo sheen, a shifting hologram).
export let CUES = false;
export const setCues = (on) => { CUES = !!on; };

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
const raritySym = (c, x, y, col) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="sans-serif" font-size="9" fill="${col}">${RSYM[c.r]}</text>`;
const rain = (n, w, h, col = '#9fb6d8') => { let s = ''; for (let i = 0; i < n; i++) { const x = (i * 53) % w, y = (i * 37) % h; s += `<line x1="${x}" y1="${y}" x2="${x - 2}" y2="${y + 8}"/>`; } return `<g stroke="${col}" stroke-width=".6" opacity=".35">${s}</g>`; };

// ================================================================= MOTH & LANTERN
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
function tbFront(inst, p) {
  const c = def(inst);
  return `<clipPath id="${p}tbw"><rect x="22" y="46" width="206" height="170"/></clipPath>
  <linearGradient id="${p}tw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a8c8f"/><stop offset=".55" stop-color="#0a3a42"/><stop offset="1" stop-color="#061a20"/></linearGradient>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#0e3b43" stroke="#7fd1c1" stroke-width="1.5"/>
  <rect x="12" y="12" width="226" height="326" rx="6" fill="none" stroke="#7fd1c1" stroke-width=".6" stroke-dasharray="3 2"/>
  <text x="125" y="37" text-anchor="middle" font-family="'Pirata One',Georgia,serif" font-size="${fit(c.name, 200, 22, 0.45)}" fill="#e9f5ef">${esc(c.name)}</text>
  <g clip-path="url(#${p}tbw)">${tbArt(c.art, p)}</g>
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
  ${hexLive ? `<path d="M226 324l7 4v8l-7 4-7-4v-8z" fill="#ffffff" opacity=".35"><animate attributeName="opacity" values=".1;.6;.1" dur="1.4s" repeatCount="indefinite"/></path>` : ''}
  ${CUES && o.tilt ? `<rect x="168" y="316" width="50" height="12" rx="3" fill="#000" opacity=".8"/><text x="193" y="325" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="7" fill="#fff">${hexLive ? 'HEX SHIFTS' : 'HEX FLAT'}</text>` : ''}`;
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
  return `<linearGradient id="${p}is" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d9a6"/><stop offset="1" stop-color="#c99a5b"/></linearGradient>
  <linearGradient id="${p}ib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${a.body}"/><stop offset="1" stop-color="#3a2616"/></linearGradient>
  <clipPath id="${p}iw"><rect x="22" y="46" width="206" height="170"/></clipPath>
  <rect x="8" y="8" width="234" height="334" rx="8" fill="#3a2616" stroke="#c68a4a" stroke-width="2"/>
  <g fill="#c68a4a"><circle cx="16" cy="16" r="2.2"/><circle cx="234" cy="16" r="2.2"/><circle cx="16" cy="334" r="2.2"/><circle cx="234" cy="334" r="2.2"/></g>
  <text x="125" y="37" text-anchor="middle" font-family="Rye,Georgia,serif" font-size="${fit(c.name.toUpperCase(), 196, 17, 0.72)}" fill="#f1d9a6">${esc(c.name.toUpperCase())}</text>
  <g clip-path="url(#${p}iw)">${icArt(c, p)}</g>
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
  <g clip-path="url(#${p}sw)"><rect x="24" y="70" width="202" height="170" fill="url(#${p}ss)"/><g ${inv ? 'transform="rotate(180 125 155)"' : ''}>${spArt(c.art.subj, c.art.comp)}</g></g>
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
