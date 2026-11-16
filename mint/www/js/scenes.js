// Evening locations: scene illustrations (SVG) and what people say there.

const rainLines = (n, w, h, seed = 1) => {
  let s = '', x = seed * 97;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    const px = (x / 233280) * w, py = ((i * 53) % h);
    s += `<line x1="${px.toFixed(1)}" y1="${py}" x2="${(px - 3).toFixed(1)}" y2="${py + 12}"/>`;
  }
  return `<g class="rain" stroke="#9fb6d8" stroke-width=".7" opacity=".35">${s}</g><g class="rain rain2" stroke="#9fb6d8" stroke-width=".7" opacity=".35">${s}</g>`;
};

// ------------------------------------------------------------------ street (the hub)
export function streetSVG(open, flags, day) {
  const closed = (p) => (open[p] ? '' : 'closed');
  const scar = flags.vince1 === 'refused' && day >= 4;
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" class="street">
  <defs>
    <linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05040a"/><stop offset="1" stop-color="#1c1230"/></linearGradient>
    <linearGradient id="st-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14111c"/><stop offset="1" stop-color="#07060b"/></linearGradient>
    <filter id="st-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="st-blur"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <rect width="400" height="300" fill="url(#st-sky)"/>
  <circle cx="300" cy="40" r="16" fill="#cfd6e6" opacity=".15"/>
  <g fill="#120e1c">${[[0, 90, 40], [38, 70, 30], [66, 100, 50], [120, 60, 36], [154, 84, 44], [196, 74, 30], [224, 50, 40], [262, 96, 34], [292, 66, 50], [340, 80, 60]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${250 - y}"/>`).join('')}</g>
  <g fill="#f2c46d" opacity=".25">${[[48, 96], [80, 120], [170, 100], [236, 70], [300, 90], [356, 110], [130, 80]].map(([x, y]) => `<rect x="${x}" y="${y}" width="4" height="5"/>`).join('')}</g>

  <g class="hot ${closed('shop')}" data-place="shop">
    <rect x="8" y="128" width="104" height="122" fill="#2a2230"/>
    <rect x="8" y="128" width="104" height="18" fill="#3b1d2a"/>
    <text x="60" y="140.5" text-anchor="middle" font-family="'Bricolage Grotesque',sans-serif" font-weight="800" font-size="8.5" fill="#f2c46d">BRICK &amp; MORTAR CARDS</text>
    <rect x="16" y="154" width="62" height="66" fill="#f2c46d" opacity=".85"/>
    <rect x="16" y="154" width="62" height="66" fill="#f2c46d" filter="url(#st-glow)" opacity=".5"/>
    <g>${[[20, 160, '#ffd400'], [30, 160, '#ff4fd8'], [40, 160, '#4fb3e8'], [50, 160, '#ffd400'], [60, 160, '#4fb3e8'], [22, 176, '#4fb3e8'], [34, 176, '#ff4fd8'], [46, 176, '#ffd400']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="8" height="11" fill="${c}" stroke="#2a2230" stroke-width=".6"/>`).join('')}</g>
    <path d="M58 220V196Q62 188 66 196V220Z" fill="#2a2230"/><circle cx="62" cy="190" r="5" fill="#2a2230"/>
    <rect x="84" y="170" width="20" height="50" fill="#1a1520" stroke="#3b1d2a"/>
    <text class="closed-sign" x="60" y="236" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="7" fill="#ff6a5a">CLOSED</text>
  </g>

  <g class="hot ${closed('market')}" data-place="market">
    <rect x="116" y="150" width="78" height="100" fill="#0e0b14"/>
    <path d="M114 168L196 168L190 150L120 150Z" fill="#2f8f6a"/>
    <path d="M114 168q6 8 12 0q6 8 12 0q6 8 12 0q6 8 12 0q6 8 12 0q6 8 12 0q6 8 10 0" fill="#c0392b"/>
    <path d="M118 150Q155 136 192 150" fill="none" stroke="#3a3040" stroke-width=".8"/>
    <g class="bulbs">${[124, 136, 148, 160, 172, 184].map((x, i) => `<circle cx="${x}" cy="${147 - Math.sin((i / 5) * Math.PI) * 6}" r="2" fill="${['#ffd23f', '#ff4f9a', '#3fe08a', '#3fb8ff'][i % 4]}"/>`).join('')}</g>
    <rect x="128" y="212" width="56" height="5" fill="#6b4a2a"/><path d="M132 217L130 236M180 217L182 236" stroke="#6b4a2a" stroke-width="2"/>
    <g>${[132, 148, 164].map((x) => `<rect x="${x}" y="198" width="14" height="14" fill="#8a5a3a" stroke="#4a2f1a" stroke-width=".8"/><rect x="${x + 2}" y="194" width="3" height="6" fill="#efe9dc"/><rect x="${x + 7}" y="195" width="3" height="5" fill="#ffd400"/>`).join('')}</g>
    <path d="M146 196Q150 178 158 180Q166 184 162 196Z" fill="#05040a"/><circle cx="154" cy="178" r="6" fill="#05040a"/>
    <text x="155" y="182" text-anchor="middle" font-family="'Special Elite',monospace" font-size="0">.</text>
    <text x="155" y="245" text-anchor="middle" font-family="'Special Elite',monospace" font-size="7.5" fill="#e7e3d8">NIGHT MARKET</text>
    <text class="closed-sign" x="155" y="229" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="7" fill="#ff6a5a">PACKING UP</text>
  </g>

  <g class="hot ${closed('diner')}" data-place="diner">
    <path d="M200 250V160Q200 146 214 146H286Q300 146 300 160V250Z" fill="#7fb7b5"/>
    <path d="M200 250V160Q200 146 214 146H286Q300 146 300 160V250Z" fill="none" stroke="#c9e6e4" stroke-width="1.5"/>
    <rect x="200" y="206" width="100" height="6" fill="#c9e6e4"/>
    <g>${[208, 232, 256, 280].map((x) => `<rect x="${x}" y="168" width="16" height="30" rx="2" fill="#ffe3a8"/>`).join('')}</g>
    <g fill="#3a2a2a">${[214, 240, 262].map((x) => `<circle cx="${x + 2}" cy="186" r="3.5"/><rect x="${x - 2}" y="189" width="8" height="9"/>`).join('')}</g>
    <rect x="243" y="216" width="14" height="34" fill="#3a5a5a"/>
    <g class="neon"><text x="250" y="132" text-anchor="middle" font-family="Monoton,sans-serif" font-size="13" fill="#ff4f9a">LAST STOP</text>
    <text x="250" y="132" text-anchor="middle" font-family="Monoton,sans-serif" font-size="13" fill="#ff4f9a" filter="url(#st-glow)">LAST STOP</text></g>
    <text class="neon flick" x="250" y="143" text-anchor="middle" font-family="'Bricolage Grotesque',sans-serif" font-weight="800" font-size="9" letter-spacing="4" fill="#2ee6ff">DINER</text>
    <text class="closed-sign" x="250" y="232" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="7" fill="#ff6a5a">KITCHEN CLOSED</text>
  </g>

  <g class="hot" data-place="home">
    <rect x="306" y="62" width="90" height="188" fill="#3a2420"/>
    <g fill="#140e10">${[0, 1, 2, 3, 4, 5].map((r) => [0, 1, 2].map((c) => `<rect x="${314 + c * 26}" y="${74 + r * 26}" width="16" height="16"/>`).join('')).join('')}</g>
    <rect x="340" y="126" width="16" height="16" fill="#f2c46d" opacity=".9"/>
    <rect x="340" y="126" width="16" height="16" fill="#f2c46d" filter="url(#st-glow)" opacity=".6"/>
    <rect x="342" y="226" width="20" height="24" fill="#1a1012" stroke="${scar ? '#c0392b' : '#4a3430'}"/>
    ${scar ? '<path d="M345 232l6 5M352 231l-4 9M356 233l3 6" stroke="#c0392b" stroke-width=".8"/>' : ''}
    <text x="351" y="58" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="7" fill="#9aa39c">HOME · 3F</text>
  </g>

  <rect y="250" width="400" height="50" fill="url(#st-road)"/>
  <g filter="url(#st-blur)" opacity=".45"><ellipse cx="48" cy="268" rx="34" ry="5" fill="#f2c46d"/><ellipse cx="250" cy="266" rx="40" ry="4" fill="#ff4f9a"/><ellipse cx="250" cy="276" rx="26" ry="3" fill="#2ee6ff"/><ellipse cx="348" cy="272" rx="10" ry="3" fill="#f2c46d"/></g>
  <g stroke="#2a2630" stroke-width="2" stroke-dasharray="18 14"><line x1="0" y1="282" x2="400" y2="282"/></g>
  <rect x="104" y="226" width="3" height="24" fill="#2a2630"/><circle cx="105.5" cy="224" r="4" fill="#ffe3a8"/><circle cx="105.5" cy="224" r="10" fill="#ffe3a8" opacity=".15"/>
  ${rainLines(70, 400, 300, 3)}
</svg>`;
}

// ------------------------------------------------------------------ card shop interior
export function shopSVG() {
  const box = (x, y, c, c2) => `<rect x="${x}" y="${y}" width="22" height="16" fill="${c}" stroke="#1a1214" stroke-width=".8"/><rect x="${x + 3}" y="${y + 4}" width="16" height="6" fill="${c2}"/>`;
  return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="sh-lamp" cx="200" cy="40" r="200" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f2c46d" stop-opacity=".35"/><stop offset="1" stop-color="#f2c46d" stop-opacity="0"/></radialGradient></defs>
  <rect width="400" height="220" fill="#2a1f1a"/>
  <g fill="#1d1512">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<rect x="${i * 40}" y="0" width="2" height="150"/>`).join('')}</g>
  ${[30, 72, 114].map((y) => `<rect x="10" y="${y + 16}" width="380" height="4" fill="#4a3424"/>`).join('')}
  ${[[30, '#ffd400', '#6b3fa0'], [72, '#ff4fd8', '#2ee6ff'], [114, '#4fb3e8', '#ffffff']].map(([y, a, b]) => [16, 42, 68, 94, 270, 296, 322, 348].map((x) => box(x, y, a, b)).join('')).join('')}
  <rect x="140" y="26" width="110" height="74" fill="#efe9dc" opacity=".9" transform="rotate(-2 195 63)"/>
  <text x="195" y="52" text-anchor="middle" font-family="'Special Elite',monospace" font-size="10" fill="#1d1a16" transform="rotate(-2 195 63)">NO REFUNDS</text>
  <text x="195" y="68" text-anchor="middle" font-family="'Special Elite',monospace" font-size="7" fill="#1d1a16" transform="rotate(-2 195 63)">NO HOLDS. NO CREDIT.</text>
  <text x="195" y="84" text-anchor="middle" font-family="'Special Elite',monospace" font-size="7" fill="#c0392b" transform="rotate(-2 195 63)">NO ASKING ABOUT THE BACK ROOM</text>
  <rect width="400" height="220" fill="url(#sh-lamp)"/>
  <line x1="200" y1="0" x2="200" y2="14" stroke="#111" stroke-width="1.5"/><path d="M188 14H212L206 22H194Z" fill="#3a3a3a"/><circle cx="200" cy="24" r="3" fill="#ffe3a8"/>
  <g transform="translate(300 96)">
    <path d="M-26 70Q-28 30 0 24Q28 30 26 70Z" fill="#3b4a5a"/>
    <circle cx="0" cy="10" r="15" fill="#c9a07a"/>
    <path d="M-15 6Q0 -12 15 6Q8 -2 0 -2Q-8 -2 -15 6Z" fill="#7a7a7a"/>
    <rect x="-11" y="7" width="9" height="6" rx="1" fill="none" stroke="#1a1a1a" stroke-width="1.2"/><rect x="2" y="7" width="9" height="6" rx="1" fill="none" stroke="#1a1a1a" stroke-width="1.2"/>
    <line x1="-2" y1="10" x2="2" y2="10" stroke="#1a1a1a" stroke-width="1.2"/>
    <path d="M-6 19Q0 21 6 19" stroke="#5a3a2a" stroke-width="1.2" fill="none"/>
    <line x1="10" y1="20" x2="22" y2="18" stroke="#efe9dc" stroke-width="1.5"/><circle cx="22.5" cy="18" r="1.2" fill="#ff6a3a"/>
    <path class="smoke" d="M23 16q-3 -6 1 -10q4 -4 0 -10" fill="none" stroke="#9aa39c" stroke-width=".8" opacity=".5"/>
  </g>
  <rect x="0" y="160" width="400" height="60" fill="#3a2a1e"/>
  <rect x="20" y="150" width="360" height="22" fill="#9fc9d8" opacity=".25" stroke="#c9e6e4" stroke-width=".8"/>
  ${[40, 64, 88, 112, 220, 244, 268].map((x, i) => `<rect x="${x}" y="154" width="14" height="16" fill="${['#ffd400', '#4fb3e8', '#ff4fd8'][i % 3]}" stroke="#1a1214" stroke-width=".6" transform="rotate(${(i % 3) - 1} ${x + 7} 162)"/>`).join('')}
  <rect x="336" y="140" width="26" height="12" fill="#1a1a1a"/><rect x="338" y="142" width="22" height="5" fill="#3fe08a" opacity=".6"/>
</svg>`;
}

// ------------------------------------------------------------------ night market
export function marketSVG() {
  return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="mk-lan" cx="250" cy="120" r="140" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb347" stop-opacity=".45"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient></defs>
  <rect width="400" height="220" fill="#08070d"/>
  <g fill="#14101c">${[[0, 40, 60], [60, 70, 50], [300, 30, 100]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${180 - y}"/>`).join('')}</g>
  <rect width="400" height="220" fill="url(#mk-lan)"/>
  <path d="M30 70L370 70L350 30L50 30Z" fill="#2f8f6a"/>
  <path d="M30 70${Array.from({ length: 17 }, () => 'q10 12 20 0').join('')}" fill="#c0392b"/>
  <path d="M40 34Q200 10 360 34" fill="none" stroke="#3a3040"/>
  <g class="bulbs">${Array.from({ length: 13 }, (_, i) => `<circle cx="${50 + i * 25}" cy="${36 - Math.sin((i / 12) * Math.PI) * 14}" r="3" fill="${['#ffd23f', '#ff4f9a', '#3fe08a', '#3fb8ff'][i % 4]}"/>`).join('')}</g>
  <line x1="40" y1="70" x2="40" y2="200" stroke="#555" stroke-width="3"/><line x1="360" y1="70" x2="360" y2="200" stroke="#555" stroke-width="3"/>
  <g transform="translate(250 92)"><path d="M-26 74Q-30 20 0 6Q30 20 26 74Z" fill="#05040a"/><path d="M-16 20Q0 -14 16 20Q0 12 -16 20Z" fill="#05040a"/>
    <circle cx="-5" cy="22" r="1.3" fill="#ffb347"/><circle cx="5" cy="22" r="1.3" fill="#ffb347"/></g>
  <rect x="280" y="112" width="10" height="16" rx="2" fill="#ffb347"/><rect x="278" y="108" width="14" height="4" fill="#3a2a1a"/>
  <rect x="60" y="150" width="280" height="8" fill="#6b4a2a"/>
  <path d="M74 158L68 210M326 158L332 210" stroke="#4a2f1a" stroke-width="4"/>
  ${[80, 130, 180, 230, 280].map((x, i) => `<g transform="rotate(${(i % 2) * 3 - 1} ${x + 20} 140)"><rect x="${x}" y="122" width="40" height="28" fill="#8a5a3a" stroke="#4a2f1a"/>${[0, 1, 2, 3, 4].map((k) => `<rect x="${x + 4 + k * 7}" y="${114 + (k % 2) * 3}" width="5" height="10" fill="${['#ffd400', '#efe9dc', '#4fb3e8', '#ff4fd8', '#efe9dc'][(k + i) % 5]}" stroke="#2a1a10" stroke-width=".4"/>`).join('')}</g>`).join('')}
  <text x="200" y="180" text-anchor="middle" font-family="'Special Elite',monospace" font-size="11" fill="#efe9dc" transform="rotate(-2 200 180)">$3 A DIG · KEEP TWO · NO RETURNS</text>
  ${rainLines(40, 400, 220, 7)}
  <rect y="200" width="400" height="20" fill="#05040a"/>
</svg>`;
}

// ------------------------------------------------------------------ diner
export function dinerSVG() {
  return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="dn-chk" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#e8e2d6"/><rect width="10" height="10" fill="#1a1a1a"/><rect x="10" y="10" width="10" height="10" fill="#1a1a1a"/></pattern>
  <filter id="dn-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
  <rect width="400" height="220" fill="#2a4a4a"/>
  <rect y="0" width="400" height="12" fill="#c9e6e4"/>
  <rect x="20" y="30" width="120" height="70" fill="#0b0a12" stroke="#c9e6e4" stroke-width="3"/>
  ${rainLines(16, 120, 70, 2).replace(/<g class="rain/g, '<g transform="translate(20 30)" class="rain')}
  <circle cx="60" cy="70" r="3" fill="#ff4f9a" opacity=".6"/><circle cx="100" cy="64" r="2" fill="#f2c46d" opacity=".6"/>
  <rect x="170" y="36" width="130" height="60" fill="#1a1a1a" stroke="#c9e6e4" stroke-width="3"/>
  <rect x="174" y="40" width="122" height="52" fill="#ffb347" opacity=".25"/>
  <g transform="translate(236 70)"><rect x="-18" y="-4" width="36" height="30" fill="#efe9dc"/><circle cx="0" cy="-12" r="10" fill="#b07a5a"/><rect x="-11" y="-30" width="22" height="12" rx="4" fill="#ffffff"/><path d="M-6 -9Q0 -6 6 -9" stroke="#3a2a1a" stroke-width="1" fill="none"/></g>
  <rect x="190" y="88" width="90" height="6" fill="#9aa39c"/><path d="M200 88h10v-6h-10zM230 88h12v-5h-12z" fill="#efe9dc"/>
  <g class="neon"><circle cx="340" cy="56" r="22" fill="none" stroke="#2ee6ff" stroke-width="2.5"/><circle cx="340" cy="56" r="22" fill="none" stroke="#2ee6ff" stroke-width="3" filter="url(#dn-glow)"/>
  <line x1="340" y1="56" x2="340" y2="42" stroke="#ff4f9a" stroke-width="2"/><line x1="340" y1="56" x2="350" y2="62" stroke="#ff4f9a" stroke-width="2"/></g>
  <rect x="0" y="120" width="400" height="100" fill="url(#dn-chk)" opacity=".85"/>
  <rect x="0" y="112" width="400" height="14" fill="#c0392b"/><rect x="0" y="110" width="400" height="4" fill="#c9e6e4"/>
  <rect x="0" y="126" width="400" height="28" fill="#7fb7b5"/>
  ${[50, 110, 170, 230, 290, 350].map((x) => `<line x1="${x}" y1="160" x2="${x}" y2="200" stroke="#9aa39c" stroke-width="3"/><ellipse cx="${x}" cy="160" rx="14" ry="5" fill="#c0392b" stroke="#7a1f1a"/><ellipse cx="${x}" cy="202" rx="10" ry="3" fill="#555"/>`).join('')}
  <g transform="translate(120 104)"><path d="M-8 8h16l-2 -10h-12z" fill="#efe9dc"/><path d="M-3 -4q2 -6 0 -10M3 -4q2 -6 0 -10" stroke="#efe9dc" stroke-width=".8" fill="none" opacity=".6" class="smoke"/></g>
  <g transform="translate(320 98)"><path d="M-14 12h28l-4 -8h-20z" fill="#f2c46d"/><path d="M-12 4h24" stroke="#c98a2a" stroke-width="2"/></g>
</svg>`;
}

// ------------------------------------------------------------------ home
export function homeSVG(flags, day) {
  const scar = flags.vince1 === 'refused' && day >= 4;
  const inhaler = flags.inhaler === 'yes' || (flags.inhaler === 'no' && day >= 5);
  return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="hm-lamp" cx="250" cy="110" r="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f2c46d" stop-opacity=".35"/><stop offset="1" stop-color="#f2c46d" stop-opacity="0"/></radialGradient></defs>
  <rect width="400" height="220" fill="#1c1a22"/>
  <rect x="0" y="0" width="400" height="140" fill="#26222c"/>
  <path d="M0 40h400M0 90h400" stroke="#2c2834" stroke-width="1"/>
  <rect x="40" y="24" width="110" height="80" fill="#0b0a14" stroke="#4a4450" stroke-width="4"/>
  <line x1="95" y1="24" x2="95" y2="104" stroke="#4a4450" stroke-width="3"/>
  <g>${[[52, 70, '#f2c46d'], [70, 60, '#ff4f9a'], [120, 76, '#2ee6ff'], [134, 58, '#f2c46d'], [110, 50, '#f2c46d']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="3" height="4" fill="${c}" opacity=".6"/>`).join('')}</g>
  ${rainLines(18, 110, 80, 5).replace(/<g class="rain/g, '<g transform="translate(40 24)" class="rain')}
  <rect x="330" y="30" width="44" height="110" fill="#2e2622" stroke="#3e3430"/>
  <circle cx="366" cy="88" r="2.5" fill="#9aa39c"/>
  ${scar ? '<text x="352" y="70" text-anchor="middle" font-family="\'Special Elite\',monospace" font-size="6" fill="#c0392b" opacity=".8" transform="rotate(-8 352 70)">GRADE RIGHT</text>' : ''}
  <rect width="400" height="220" fill="url(#hm-lamp)"/>
  <rect x="0" y="140" width="400" height="80" fill="#2a2420"/>
  <path d="M20 150h150v44h-150z" fill="#4a3a4a"/><path d="M20 140h150v14h-150z" fill="#5a4a5a"/><rect x="14" y="140" width="12" height="54" fill="#5a4a5a"/><rect x="164" y="140" width="12" height="54" fill="#5a4a5a"/>
  <path d="M40 152Q60 136 110 140Q150 142 156 154Z" fill="#7a9ac0"/>
  <circle cx="42" cy="148" r="9" fill="#c9a07a"/><path d="M34 144Q42 134 50 144Q44 140 34 144Z" fill="#3a2a1a"/>
  <path d="M38 149q2 1 4 0" stroke="#3a2a1a" stroke-width=".8" fill="none"/>
  <g class="zz" font-family="'JetBrains Mono',monospace" fill="#9aa39c"><text x="54" y="128" font-size="7">z</text><text x="60" y="120" font-size="9">z</text></g>
  <rect x="210" y="138" width="110" height="8" fill="#5a4030"/><path d="M216 146v40M314 146v40" stroke="#5a4030" stroke-width="4"/>
  <line x1="250" y1="60" x2="250" y2="100" stroke="#111"/><path d="M238 100h24l-5 10h-14z" fill="#c98a2a"/><circle cx="250" cy="112" r="3" fill="#ffe3a8"/>
  <g transform="translate(232 120)"><rect width="44" height="18" fill="#1d3a5a" stroke="#0e1a2a"/><rect x="22" y="0" width="22" height="18" fill="#efe9dc" opacity=".9"/>${[0, 1, 2].map((k) => `<rect x="${25 + k * 6}" y="3" width="5" height="6" fill="${['#ffd400', '#4fb3e8', '#ff4fd8'][k]}"/><rect x="${25 + k * 6}" y="10" width="5" height="6" fill="${['#4fb3e8', '#ff4fd8', '#ffd400'][k]}"/>`).join('')}</g>
  ${inhaler ? '<g transform="translate(290 128)"><rect width="6" height="10" rx="2" fill="#3fb8ff"/><rect x="-1" y="8" width="8" height="4" rx="1" fill="#efe9dc"/></g>' : ''}
  <g transform="translate(206 124)"><rect width="10" height="14" fill="#efe9dc" opacity=".8"/><path d="M2 4h6M2 7h6M2 10h4" stroke="#5b5348" stroke-width=".6"/></g>
</svg>`;
}

// ------------------------------------------------------------------ what people say
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function louLine(flags, day) {
  const lines = [
    'Packs are on the wall. Singles under the glass. Don\'t lean on the glass.',
    'You\'re the new kid at Gemline. I can tell. You look at cards like they owe you money.',
    'Prices went up. Everybody\'s a collector this year. Everybody\'s an expert.',
    'Buy something or stop dripping on my floor.',
  ];
  if (flags.vince1 === 'refused') lines.push('Heard you told Carrow no. Brave. Stupid, but brave. Don\'t do your shopping after dark for a while.');
  if (flags.vince1 === 'took') lines.push('Carrow\'s boys were in here asking what you collect. Said they wanted to buy you a present.');
  if (day >= 3) lines.push('Some guy tried to sell me a 1st Edition Bloomling today. Stamp was still wet.');
  return pick(lines);
}

export function sellerLine() {
  return pick([
    'The seller doesn\'t look up. A hand waves at the boxes: go on.',
    '"Three dollars. Two cards. I don\'t do change and I don\'t do conversation."',
    '"Some of this came out of a dead man\'s closet. He doesn\'t need it."',
    'The seller is counting a roll of bills under the table and does not stop.',
  ]);
}

export function salLine() {
  return pick([
    '"Apron\'s on the hook. Table six wants coffee and they want it to be warm, which is a new idea for them."',
    '"You again. Good. The new girl cried and quit."',
    '"Grill\'s yours, kid. Don\'t burn anything you can\'t afford to replace."',
  ]);
}

// Diner gossip: hints about tomorrow.
export function rumor(day, flags) {
  const r = {
    1: 'Dot comes in for pie at ten. "Tomorrow they\'re handing out UV lamps," she says. "Fakes on new paper light up like a Christmas tree. Real old cards stay dull."',
    2: 'Two men in the back booth don\'t order anything. One of them says "walk-in" and "Express" and laughs. When they leave, they tip Sal a twenty and look straight at you.',
    3: 'A regular with ink on his fingers brags that he can buy a "1st Edition" rubber stamp for five bucks at the copy shop. "Put it on any Bloomling. Graders never check the shadow."',
    4: 'Dot again, tired. "Pike audits Friday. He pulls the walk-ins first. Always the walk-ins." She looks at you a second too long.',
  }[day];
  return r || 'Nobody says anything worth remembering tonight.';
}

export function theoLine(flags, day) {
  if (flags.inhaler === 'no' && day === 2) return 'Theo is asleep, breathing through his mouth. The empty inhaler is on the table where he can reach it.';
  if (flags.inhaler === 'no' && day >= 4) return 'Theo sleeps with the new inhaler in his fist. The hospital bracelet is still on his wrist. He wouldn\'t let you cut it off.';
  if (flags.vince1 === 'refused' && day >= 3) return 'Theo is asleep with the light on. He asked you to check the lock twice. You checked it three times.';
  if (flags.vince1 === 'took' && day >= 3) return 'Theo is asleep. On the table is a new pair of sneakers, still in the box. He asked where the money came from. You said overtime.';
  return pick(['Theo is asleep on the couch with his homework under his cheek.', 'Theo is asleep. He left you half a sandwich and a note: "for the grader".']);
}
