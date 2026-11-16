// Card illustrations for every line. Each drawer takes an art spec and returns SVG for
// that line's art window. Specs come from sets.js; many parts combine so every card differs.

const K = '#1a1a1a';
const pt = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;
const rad = (d) => (d * Math.PI) / 180;
const polar = (x, y, len, deg) => [x + Math.cos(rad(deg)) * len, y + Math.sin(rad(deg)) * len];

// Tapered limb between two points, with round joints.
function limb(x1, y1, x2, y2, w1, w2, fill, stroke = '', sw = 0) {
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  const ox1 = Math.cos(a) * w1 / 2, oy1 = Math.sin(a) * w1 / 2, ox2 = Math.cos(a) * w2 / 2, oy2 = Math.sin(a) * w2 / 2;
  const st = stroke ? `stroke="${stroke}" stroke-width="${sw}"` : '';
  return `<path d="M${pt(x1 + ox1, y1 + oy1)}L${pt(x2 + ox2, y2 + oy2)}L${pt(x2 - ox2, y2 - oy2)}L${pt(x1 - ox1, y1 - oy1)}Z" fill="${fill}" ${st} stroke-linejoin="round"/><circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="${(w2 / 2).toFixed(1)}" fill="${fill}" ${st}/>`;
}

// ================================================================= GRIM GROCERS
function ggBg(a) {
  const sky = a.sky;
  switch (a.bg) {
    case 'graveyard': return `<rect x="22" y="52" width="206" height="162" fill="${sky}"/><circle cx="60" cy="88" r="14" fill="#ffe14d"/>
      <path d="M22 214V190Q80 182 125 188T228 186V214Z" fill="#2a4a2a"/>${[44, 76, 172, 204].map((x, i) => `<path d="M${x - 9} 196V176Q${x} 164 ${x + 9} 176V196Z" fill="#8a8f96" stroke="${K}" stroke-width="1.5"/><path d="M${x} 178V188M${x - 4} 182H${x + 4}" stroke="${K}" stroke-width="${i % 2 ? 0 : 1.2}"/>`).join('')}
      <g stroke="${K}" stroke-width="1.5">${[30, 50, 190, 210].map((x) => `<line x1="${x}" y1="190" x2="${x + 2}" y2="170"/>`).join('')}<line x1="28" y1="176" x2="54" y2="174"/><line x1="188" y1="174" x2="214" y2="176"/></g>`;
    case 'kitchen': return `<rect x="22" y="52" width="206" height="162" fill="#f2d98a"/><rect x="22" y="52" width="206" height="96" fill="${sky}" opacity=".35"/>
      <rect x="170" y="62" width="48" height="100" rx="6" fill="#e8eef2" stroke="${K}" stroke-width="2"/><line x1="170" y1="100" x2="218" y2="100" stroke="${K}" stroke-width="2"/><rect x="176" y="80" width="4" height="14" fill="${K}"/>
      <rect x="34" y="66" width="40" height="34" fill="#9fd4ff" stroke="${K}" stroke-width="2"/><path d="M54 66V100M34 83H74" stroke="${K}" stroke-width="1.5"/>
      <g>${Array.from({ length: 11 }, (_, i) => `<rect x="${22 + i * 20}" y="190" width="10" height="24" fill="${K}" opacity=".85"/><rect x="${32 + i * 20}" y="190" width="10" height="24" fill="#fff"/>`).join('')}</g>`;
    case 'market': return `<rect x="22" y="52" width="206" height="162" fill="${sky}"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${22 + i * 26} 52H${48 + i * 26}V76Q${35 + i * 26} 84 ${22 + i * 26} 76Z" fill="${i % 2 ? '#fff' : '#e6372e'}" stroke="${K}" stroke-width="1.2"/>`).join('')}
      <rect x="22" y="182" width="206" height="32" fill="#8a5a3a" stroke="${K}" stroke-width="2"/>${[40, 90, 160, 200].map((x, i) => `<circle cx="${x}" cy="180" r="${7 + (i % 2) * 3}" fill="${['#e6372e', '#7ccc4f', '#f4b942', '#7b3fa0'][i]}" stroke="${K}" stroke-width="1.5"/>`).join('')}`;
    case 'swamp': return `<rect x="22" y="52" width="206" height="162" fill="#3a5a3a"/><rect x="22" y="52" width="206" height="80" fill="${sky}" opacity=".6"/><circle cx="190" cy="80" r="12" fill="#ffe14d" opacity=".8"/>
      <path d="M22 214V180Q70 172 125 182T228 178V214Z" fill="#2a4a3a"/><path d="M22 196Q70 190 125 198T228 194" stroke="#9fe0a0" stroke-width="1.5" fill="none" opacity=".5"/>
      <g stroke="#2e5a2a" stroke-width="3" stroke-linecap="round">${[36, 46, 200, 212].map((x, i) => `<path d="M${x} 196Q${x + 4} 160 ${x - 2} ${130 + i * 6}"/>`).join('')}</g><g fill="#5a3a1a">${[38, 202].map((x) => `<rect x="${x - 3}" y="130" width="6" height="14" rx="3"/>`).join('')}</g>`;
    case 'attic': return `<rect x="22" y="52" width="206" height="162" fill="#4a3424"/><path d="M22 52L125 52L22 120Z M228 52L125 52L228 120Z" fill="#2e2016"/>
      <circle cx="125" cy="84" r="20" fill="${sky}" stroke="${K}" stroke-width="3"/><path d="M125 64V104M105 84H145" stroke="${K}" stroke-width="2"/>
      <path d="M22 52L60 90M40 52L22 70" stroke="#d9d2c0" stroke-width=".8" opacity=".7"/><path d="M22 60Q36 66 30 80M22 72Q34 76 28 86" stroke="#d9d2c0" stroke-width=".6" fill="none" opacity=".7"/>
      <rect x="22" y="196" width="206" height="18" fill="#6b4a2a"/>${[60, 120, 180].map((x) => `<line x1="${x}" y1="196" x2="${x}" y2="214" stroke="${K}" stroke-width="1"/>`).join('')}`;
    default: return `<rect x="22" y="52" width="206" height="162" fill="${sky}"/><circle cx="192" cy="84" r="18" fill="#ffe14d"/>
      <g fill="${K}"><path d="M52 82q6-6 10 0q4-6 10 0q-4 0-10 5q-6-5-10-5z"/><path d="M80 66q5-5 8 0q3-5 8 0q-3 0-8 4q-5-4-8-4z"/></g>
      <path d="M22 214V196Q70 180 125 192T228 188V214Z" fill="#2e7d32"/>`;
  }
}
function ggShape(a) {
  const B = a.body, V = a.vein;
  const st = `stroke="${K}" stroke-width="3" stroke-linejoin="round"`;
  switch (a.shape) {
    case 'tall': return { f: [125, 122, 1], top: [125, 70], s: `<g stroke="#3f9a3a" stroke-width="5" stroke-linecap="round"><path d="M118 76L108 54"/><path d="M125 74L125 50"/><path d="M132 76L142 54"/></g><path d="M95 104Q125 64 155 104L137 204Q125 216 113 204Z" fill="${B}" ${st}/><g stroke="${V}" stroke-width="2" stroke-linecap="round"><line x1="112" y1="160" x2="122" y2="158"/><line x1="128" y1="176" x2="136" y2="174"/></g>` };
    case 'long': return { f: [124, 138, 0.95], top: [125, 78], s: `<g transform="rotate(-14 125 140)"><rect x="118" y="66" width="10" height="16" rx="3" fill="#6b4a2a" stroke="${K}" stroke-width="2"/><path d="M100 204Q84 140 110 84Q118 72 130 76Q156 136 150 204Q124 218 100 204Z" fill="${B}" ${st}/><path d="M140 92Q152 150 144 196" fill="none" stroke="${V}" stroke-width="2"/></g>` };
    case 'bunch': { const c = [[105, 108, 20], [145, 108, 20], [125, 92, 22], [98, 138, 20], [152, 138, 20], [110, 170, 20], [140, 170, 20], [125, 140, 30]]; return { f: [125, 138, 1], top: [125, 74], s: `<rect x="120" y="62" width="10" height="20" rx="3" fill="#6b4a2a" stroke="${K}" stroke-width="2"/>${c.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${B}" stroke="${K}" stroke-width="2.5"/>`).join('')}${c.slice(0, 7).map(([x, y, r]) => `<circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.25}" fill="#fff" opacity=".25"/>`).join('')}` }; }
    case 'pear': return { f: [125, 154, 0.95], top: [125, 86], s: `<path d="M125 88C100 88 96 118 104 134C84 152 88 198 125 200C162 198 166 152 146 134C154 118 150 88 125 88Z" fill="${B}" ${st}/><path d="M112 86L125 74L138 86L132 96L118 96Z" fill="#3f9a3a" stroke="${K}" stroke-width="2"/><path d="M140 120Q152 150 146 184" stroke="#fff" stroke-width="3" opacity=".25" fill="none"/>` };
    case 'pod': return { f: [125, 138, 0.85], top: [150, 112], s: `<path d="M60 162Q86 104 190 118Q176 172 60 162Z" fill="${B}" ${st}/><path d="M66 158Q120 128 184 122" stroke="${V}" stroke-width="2" fill="none"/>${[90, 160, 184].map((x, i) => `<circle cx="${x}" cy="${150 - i * 8}" r="7" fill="${V}" opacity=".5"/>`).join('')}<path d="M188 118Q200 104 196 92" stroke="#3f9a3a" stroke-width="4" fill="none" stroke-linecap="round"/>` };
    case 'cap': return { f: [125, 166, 0.75], top: [125, 70], s: `<rect x="104" y="128" width="42" height="72" rx="16" fill="#f3ead2" ${st}/><path d="M66 136Q72 66 125 64Q178 66 184 136Q125 150 66 136Z" fill="${B}" ${st}/>${[[92, 106, 8], [124, 86, 10], [156, 104, 7], [140, 124, 5], [104, 126, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`).join('')}` };
    case 'leafy': return { f: [125, 144, 0.95], top: [125, 84], s: `${[56, 46, 36].map((r, i) => `<path d="${Array.from({ length: 13 }, (_, k) => { const t = (k / 12) * Math.PI * 2; const rr = r + (k % 2 ? 5 : -2); return (k ? 'L' : 'M') + pt(125 + Math.cos(t) * rr, 142 + Math.sin(t) * rr * 0.85); }).join('')}Z" fill="${i % 2 ? V : B}" stroke="${K}" stroke-width="2.5"/>`).join('')}<path d="M125 100V180M100 120Q125 140 150 120" stroke="${V}" stroke-width="2" fill="none" opacity=".6"/>` };
    case 'pepper': return { f: [125, 146, 0.95], top: [125, 86], s: `<path d="M125 92C108 84 84 96 86 128C88 170 104 200 125 196C146 200 162 170 164 128C166 96 142 84 125 92Z" fill="${B}" ${st}/><path d="M125 96V188M104 104Q98 150 110 190" stroke="${V}" stroke-width="2" fill="none" opacity=".6"/><path d="M125 92Q124 76 138 70" stroke="#3f9a3a" stroke-width="6" stroke-linecap="round" fill="none"/>` };
    case 'bulb': return { f: [125, 152, 0.95], top: [125, 78], s: `<path d="M125 76C118 96 86 112 86 146C86 182 108 196 125 196C142 196 164 182 164 146C164 112 132 96 125 76Z" fill="${B}" ${st}/><path d="M125 80Q112 130 116 192M125 80Q140 130 136 192" stroke="${V}" stroke-width="1.5" fill="none"/><g stroke="#c9b9a0" stroke-width="2" stroke-linecap="round">${[-10, -4, 4, 10].map((d) => `<path d="M${125 + d} 196Q${125 + d * 1.8} 204 ${125 + d * 2.2} 210"/>`).join('')}</g>` };
    case 'squash': return { f: [125, 142, 1], top: [125, 92], s: `<rect x="120" y="80" width="10" height="20" rx="3" fill="#5a3a1e" stroke="${K}" stroke-width="2"/>${[[94, 22], [156, 22], [108, 26], [142, 26], [125, 28]].map(([x, rx]) => `<ellipse cx="${x}" cy="145" rx="${rx}" ry="46" fill="${B}" stroke="${K}" stroke-width="2.5"/>`).join('')}` };
    case 'berry': return { f: [125, 132, 0.95], top: [125, 88], s: `<path d="M125 202C96 182 80 140 86 116C92 94 112 90 125 98C138 90 158 94 164 116C170 140 154 182 125 202Z" fill="${B}" ${st}/>${Array.from({ length: 14 }, (_, k) => `<path d="M${98 + (k * 23) % 56} ${112 + ((k * 37) % 70)}l1.5 3" stroke="#fff3a0" stroke-width="2" stroke-linecap="round"/>`).join('')}<path d="M100 98L112 84L118 96L125 80L132 96L138 84L150 98Q125 110 100 98Z" fill="#3f9a3a" stroke="${K}" stroke-width="2"/>` };
    default: return { f: [125, 140, 1], top: [125, 100], s: `<circle cx="125" cy="140" r="40" fill="${B}" ${st}/><g fill="none" stroke="${V}" stroke-width="2" stroke-linecap="round"><path d="M125 102Q112 128 122 176"/><path d="M96 118Q118 134 108 172"/><path d="M154 118Q132 134 142 172"/></g><path d="M125 101C119 88 133 84 135 93" fill="#6cc04a" stroke="${K}" stroke-width="2"/>` };
  }
}
function ggFace(a, x, y, s) {
  let f = '';
  const eye = (ex, ey, r = 1) => {
    if (a.eyes === 'sleepy') return `<ellipse cx="${ex}" cy="${ey}" rx="${9 * r}" ry="${10 * r}" fill="#fff" stroke="${K}" stroke-width="2"/><path d="M${ex - 9 * r} ${ey - 1}H${ex + 9 * r}V${ey - 10 * r}H${ex - 9 * r}Z" fill="${a.body}" stroke="${K}" stroke-width="2"/><circle cx="${ex}" cy="${ey + 4}" r="${3 * r}" fill="#e6372e"/>`;
    if (a.eyes === 'spiral') return `<circle cx="${ex}" cy="${ey}" r="${9 * r}" fill="#fff" stroke="${K}" stroke-width="2"/><path d="M${ex} ${ey}m-1 0a1 1 0 0 1 2 0a3 3 0 0 1-5 1a5 5 0 0 1 8-4a7 7 0 0 1-10 8" fill="none" stroke="#7b3fa0" stroke-width="1.5"/>`;
    return `<ellipse cx="${ex}" cy="${ey}" rx="${9 * r}" ry="${10 * r}" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="${ex + 2 * r}" cy="${ey + 2 * r}" r="${4 * r}" fill="#e6372e"/><circle cx="${ex + 2 * r}" cy="${ey + 2 * r}" r="${1.8 * r}" fill="${K}"/>`;
  };
  if (a.eyes === 'cyclops') f += eye(0, -8, 1.6);
  else if (a.eyes === 'three') f += eye(-17, -6, 0.75) + eye(0, -14, 0.75) + eye(17, -6, 0.75);
  else f += eye(-15, -7) + eye(15, -7);
  if (a.eyes === 'angry' || a.eyes === 'two' || !a.eyes) f += `<g stroke="${K}" stroke-width="3" stroke-linecap="round"><line x1="-25" y1="-21" x2="-8" y2="-15"/><line x1="25" y1="-21" x2="8" y2="-15"/></g>`;
  if (a.mouth === 'grin') f += `<path d="M-20 12Q0 30 20 12Z" fill="#fff" stroke="${K}" stroke-width="2.5"/><path d="M-12 14V22M-4 15V25M4 15V25M12 14V22" stroke="${K}" stroke-width="1.2"/>`;
  else if (a.mouth === 'zipper') f += `<path d="M-18 16H18" stroke="${K}" stroke-width="2.5"/>${[-14, -7, 0, 7, 14].map((x) => `<path d="M${x} 11V21" stroke="${K}" stroke-width="2"/>`).join('')}`;
  else if (a.mouth === 'tongue') f += `<path d="M-14 12Q0 30 14 12Z" fill="#5a1a1a" stroke="${K}" stroke-width="2.5"/><path d="M-5 20Q0 34 6 20Z" fill="#ff7a9a" stroke="${K}" stroke-width="1.5"/>`;
  else if (a.mouth === 'frown') f += `<path d="M-16 22Q0 10 16 22" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M-10 18L-8 26L-5 19Z" fill="#fff" stroke="${K}" stroke-width="1"/>`;
  else f += `<path d="M-19 15Q0 27 19 15" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M-12 18L-8 30L-4 21Z" fill="#fff" stroke="${K}" stroke-width="1.2"/><path d="M12 18L8 30L4 21Z" fill="#fff" stroke="${K}" stroke-width="1.2"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${f}</g>`;
}
export function ggArt(a) {
  const sh = ggShape(a), [fx, fy, fs] = sh.f, [tx, ty] = sh.top, C = a.cc;
  let back = '', front = '';
  switch (a.costume) {
    case 'cape': back = `<path d="M80 210C70 162 95 122 125 120C155 122 180 162 170 210Z" fill="${C}" stroke="${K}" stroke-width="2"/><path d="M90 142L70 112L106 130Z M160 142L180 112L144 130Z" fill="#b0201b" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`; break;
    case 'hood': case 'reaper': back = `<path d="M70 214C66 150 88 86 125 82C162 86 184 150 180 214Z" fill="${C}" stroke="${K}" stroke-width="2"/>`; front = `<path d="M86 ${fy - 22}C88 ${fy - 50} 104 ${fy - 62} 125 ${fy - 62}C146 ${fy - 62} 162 ${fy - 50} 164 ${fy - 22}C150 ${fy - 36} 100 ${fy - 36} 86 ${fy - 22}Z" fill="${C}" stroke="${K}" stroke-width="2"/>`;
      if (a.costume === 'reaper') back += `<line x1="190" y1="210" x2="178" y2="70" stroke="#6b4a2a" stroke-width="5" stroke-linecap="round"/><path d="M178 72C152 60 128 66 114 84C136 74 158 74 178 86Z" fill="#c8ccd2" stroke="${K}" stroke-width="2"/>`; break;
    case 'fur': back = `<g fill="${C}" stroke="${K}" stroke-width="1.5">${[[90, 120], [86, 150], [90, 180], [160, 120], [164, 150], [160, 180]].map(([x, y], i) => `<path d="M${x} ${y - 10}L${x + (i < 3 ? -14 : 14)} ${y}L${x} ${y + 10}Z"/>`).join('')}</g>`; break;
    case 'wraps': front = `<g stroke="${C}" stroke-width="6" stroke-linecap="round" opacity=".95"><line x1="${fx - 34}" y1="${fy - 22}" x2="${fx + 34}" y2="${fy - 32}"/><line x1="${fx - 38}" y1="${fy + 14}" x2="${fx + 38}" y2="${fy + 24}"/><line x1="${fx - 30}" y1="${fy + 34}" x2="${fx + 30}" y2="${fy + 22}"/></g>`; break;
    case 'stitches': front = `<path d="M${fx - 26} ${fy + 22}l6 -6 6 6 6 -6 6 6 6 -6 6 6 6 -6 6 6" fill="none" stroke="${C}" stroke-width="2"/><path d="M${fx + 22} ${fy - 30}l-4 10 4 0 -4 10" fill="none" stroke="${C}" stroke-width="2"/>`; break;
    case 'bolts': front = `<rect x="${fx - 46}" y="${fy - 8}" width="12" height="9" fill="${C}" stroke="${K}" stroke-width="1.5"/><rect x="${fx + 34}" y="${fy - 8}" width="12" height="9" fill="${C}" stroke="${K}" stroke-width="1.5"/>`; break;
    case 'witchhat': front = `<path d="M${tx - 34} ${ty + 6}H${tx + 34}L${tx + 22} ${ty}L${tx + 8} ${ty - 40}L${tx + 22} ${ty - 52}L${tx - 4} ${ty - 44}L${tx - 20} ${ty}Z" fill="#2a1a3a" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><rect x="${tx - 20}" y="${ty - 6}" width="40" height="5" fill="${C}"/>`; break;
    case 'tophat': front = `<rect x="${tx - 26}" y="${ty - 2}" width="52" height="6" rx="2" fill="${K}"/><rect x="${tx - 16}" y="${ty - 34}" width="32" height="34" fill="${K}"/><rect x="${tx - 16}" y="${ty - 10}" width="32" height="5" fill="${C}"/>`; break;
    case 'crown': front = `<path d="M${tx - 20} ${ty + 4}V${ty - 14}L${tx - 10} ${ty - 4}L${tx} ${ty - 20}L${tx + 10} ${ty - 4}L${tx + 20} ${ty - 14}V${ty + 4}Z" fill="#ffd23f" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><circle cx="${tx}" cy="${ty - 4}" r="3" fill="#e6372e"/>`; break;
    case 'horns': front = `<path d="M${tx - 22} ${ty + 6}Q${tx - 34} ${ty - 14} ${tx - 24} ${ty - 30}Q${tx - 22} ${ty - 12} ${tx - 12} ${ty}Z M${tx + 22} ${ty + 6}Q${tx + 34} ${ty - 14} ${tx + 24} ${ty - 30}Q${tx + 22} ${ty - 12} ${tx + 12} ${ty}Z" fill="#c0262d" stroke="${K}" stroke-width="2"/>`; break;
    case 'eyepatch': front = `<path d="M${fx - 40} ${fy - 20}L${fx + 40} ${fy - 2}" stroke="${K}" stroke-width="2.5"/><ellipse cx="${fx - 15 * fs}" cy="${fy - 7 * fs}" rx="11" ry="10" fill="${K}"/>`; break;
    case 'chains': front = `<g fill="none" stroke="#8a8f96" stroke-width="3">${Array.from({ length: 7 }, (_, k) => `<ellipse cx="${fx - 42 + k * 14}" cy="${fy + 30 - k * 6}" rx="6" ry="4" transform="rotate(-24 ${fx - 42 + k * 14} ${fy + 30 - k * 6})"/>`).join('')}</g>`; break;
    case 'scarf': front = `<path d="M${fx - 34} ${fy + 34}Q${fx} ${fy + 46} ${fx + 34} ${fy + 34}L${fx + 34} ${fy + 44}Q${fx} ${fy + 56} ${fx - 34} ${fy + 44}Z" fill="${C}" stroke="${K}" stroke-width="2"/><path d="M${fx + 20} ${fy + 44}L${fx + 26} ${fy + 70}L${fx + 34} ${fy + 66}L${fx + 30} ${fy + 44}" fill="${C}" stroke="${K}" stroke-width="2"/>`; break;
    default: break;
  }
  let face;
  if (a.costume === 'sheet') {
    front = `<path d="M78 202C76 140 92 84 125 82C158 84 174 140 172 202Q160 192 150 204Q138 192 125 204Q112 192 100 204Q90 192 78 202Z" fill="${C}" stroke="${K}" stroke-width="2.5" opacity=".95"/>`;
    face = `<ellipse cx="${fx - 13}" cy="${fy - 6}" rx="7" ry="9" fill="${K}"/><ellipse cx="${fx + 13}" cy="${fy - 6}" rx="7" ry="9" fill="${K}"/><ellipse cx="${fx}" cy="${fy + 18}" rx="6" ry="8" fill="${K}"/>`;
  } else face = ggFace(a, fx, fy, fs);
  return ggBg(a) + back + sh.s + front + face;
}

// ================================================================= NEON SAINTS
const NS_BUILD = {
  heavy: { sw: 30, ww: 34, hw: 30, th: 46, hr: 12, aw: 12, lw: 15, leg: 54, k: 1 },
  muscle: { sw: 36, ww: 18, hw: 20, th: 44, hr: 11, aw: 11, lw: 12, leg: 60, k: 1 },
  lanky: { sw: 22, ww: 14, hw: 16, th: 50, hr: 10, aw: 6, lw: 7, leg: 70, k: 1.25 },
  small: { sw: 22, ww: 15, hw: 17, th: 32, hr: 12, aw: 7, lw: 8, leg: 44, k: 0.8 },
  giant: { sw: 46, ww: 30, hw: 28, th: 54, hr: 9, aw: 14, lw: 15, leg: 56, k: 1.15 },
};
const NS_POSE = { // [upper, fore] angles for the right arm; left mirrors unless given
  flex: [[-20, -110]], point: [[-12, -12], [-160, -70]], cross: [[120, 200]], belt: [[-80, -92], [100, 160]], chair: [[-60, -100]],
  hips: [[60, 150]], mic: [[70, -70], [120, 60]], crouch: [[20, 40]], wave: [[-50, -90], [100, 80]], dive: [[-20, -20]],
};
function nsBg(a, p) {
  const sky = `<rect x="22" y="46" width="206" height="130" fill="url(#${p}sky)"/>`;
  const grid = `<rect x="22" y="174" width="206" height="42" fill="#12002b"/><g stroke="#2ee6ff" stroke-width=".8" opacity=".75"><line x1="22" y1="174" x2="228" y2="174"/><line x1="22" y1="180" x2="228" y2="180"/><line x1="22" y1="188" x2="228" y2="188"/><line x1="22" y1="199" x2="228" y2="199"/><line x1="22" y1="212" x2="228" y2="212"/>${[-5, -3, -2, -1, 0, 1, 2, 3, 5].map((k) => `<line x1="${125 + k * 6}" y1="174" x2="${125 + k * 34}" y2="216"/>`).join('')}</g>`;
  switch (a.bg) {
    case 'arena': return `<rect x="22" y="46" width="206" height="170" fill="#0e0620"/>${[60, 125, 190].map((x, i) => `<path d="M${x} 46L${x - 30} 176H${x + 30}Z" fill="${[a.a, '#ffffff', a.b][i]}" opacity=".12"/>`).join('')}
      <g fill="#05030c">${Array.from({ length: 16 }, (_, i) => `<circle cx="${26 + i * 13}" cy="${150 + (i % 3) * 3}" r="6"/>`).join('')}</g><rect x="22" y="156" width="206" height="60" fill="#1a0a30"/>
      <g stroke="${a.b}" stroke-width="1.6">${[164, 172, 180].map((y) => `<line x1="22" y1="${y}" x2="228" y2="${y}"/>`).join('')}</g><rect x="22" y="180" width="206" height="36" fill="#2a1250"/>`;
    case 'city': return sky + `<g fill="#0b0618">${[[22, 120, 26], [48, 100, 20], [68, 132, 30], [150, 110, 24], [174, 90, 26], [200, 124, 28]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${176 - y}"/>`).join('')}</g>
      <g fill="${a.b}" opacity=".8">${Array.from({ length: 14 }, (_, i) => `<rect x="${28 + (i * 37) % 196}" y="${104 + (i * 17) % 60}" width="3" height="4"/>`).join('')}</g>` + grid;
    case 'palms': return sky + `<circle cx="125" cy="150" r="46" fill="url(#${p}sun)"/>${[40, 206].map((x, i) => `<path d="M${x} 176Q${x + (i ? -6 : 6)} 130 ${x + (i ? -2 : 2)} 100" stroke="#0b0618" stroke-width="5" fill="none"/><g fill="#0b0618">${[-60, -20, 20, 60, 110, 160].map((r) => `<path d="M${x + (i ? -2 : 2)} 100q${Math.cos(rad(r)) * 20} ${Math.sin(rad(r)) * 10 - 8} ${Math.cos(rad(r)) * 30} ${Math.sin(rad(r)) * 16 + 4}q${-Math.cos(rad(r)) * 14} -4 ${-Math.cos(rad(r)) * 30} ${-Math.sin(rad(r)) * 16 - 4}Z"/>`).join('')}</g>`).join('')}` + grid;
    case 'stars': return `<rect x="22" y="46" width="206" height="170" fill="#05031a"/><g fill="#fff">${Array.from({ length: 30 }, (_, i) => `<circle cx="${24 + (i * 53) % 202}" cy="${50 + (i * 31) % 120}" r="${(i % 3) * 0.4 + 0.4}"/>`).join('')}</g><circle cx="180" cy="80" r="22" fill="${a.a}" opacity=".7"/><ellipse cx="180" cy="80" rx="36" ry="6" fill="none" stroke="${a.b}" transform="rotate(-20 180 80)"/>` + grid;
    default: return sky + `<circle cx="125" cy="140" r="54" fill="url(#${p}sun)"/><g fill="#7a0f72"><rect x="60" y="140" width="130" height="3"/><rect x="60" y="150" width="130" height="4"/><rect x="60" y="160" width="130" height="5"/><rect x="60" y="170" width="130" height="6"/></g>` + grid;
  }
}
export function nsArt(a, p) {
  const D = '#0b0618', R = a.b, A = a.a;
  const b = NS_BUILD[a.build] || NS_BUILD.muscle;
  const cx = 125, feet = 212;
  const crouch = a.pose === 'crouch';
  const hipY = feet - b.leg + (crouch ? 12 : 0), shY = hipY - b.th, headY = shY - b.hr - 3;
  const poses = NS_POSE[a.pose] || NS_POSE.flex;
  const [ra, rf] = poses[0], [la, lf] = poses[1] || [180 - ra, 180 - rf];
  const ua = 24 * b.k, fa = 22 * b.k;
  let s = '';
  const st = `stroke="${R}" stroke-width="1.3"`;
  // cape behind
  if (a.outfit === 'cape') s += `<path d="M${cx - b.sw} ${shY}Q${cx - b.sw - 26} ${feet - 30} ${cx - b.sw - 10} ${feet - 4}H${cx + b.sw + 10}Q${cx + b.sw + 26} ${feet - 30} ${cx + b.sw} ${shY}Z" fill="${A}" opacity=".9"/>`;
  if (a.head === 'long' || a.head === 'ponytail') s += `<path d="M${cx - b.hr - 2} ${headY - 2}Q${cx - b.hr - 6} ${headY + 30} ${cx - b.hr - 8} ${headY + 40}H${cx + b.hr + 8}Q${cx + b.hr + 6} ${headY + 30} ${cx + b.hr + 2} ${headY - 2}Z" fill="${A}"/>`;
  if (a.head === 'afro') s += `<circle cx="${cx}" cy="${headY - 4}" r="${b.hr + 9}" fill="#2a1a12" ${st}/>`;
  // legs
  const spread = crouch ? 26 : a.pose === 'hips' || a.pose === 'belt' ? 16 : 10;
  const legFill = a.outfit === 'tights' ? A : D;
  [-1, 1].forEach((sd) => {
    const hx = cx + sd * b.hw * 0.55, fxx = cx + sd * (b.hw * 0.6 + spread);
    if (crouch) { const kx = cx + sd * (b.hw + 22), ky = hipY + 22; s += limb(hx, hipY, kx, ky, b.lw + 4, b.lw, legFill, R, 1.2) + limb(kx, ky, fxx, feet - 6, b.lw, b.lw - 2, legFill, R, 1.2); }
    else s += limb(hx, hipY, fxx, feet - 6, b.lw + 4, b.lw - 1, legFill, R, 1.2);
    s += `<rect x="${fxx - b.lw / 2 - 3}" y="${feet - 12}" width="${b.lw + 6}" height="10" rx="3" fill="${R}"/>`;
  });
  // torso
  const belly = a.build === 'heavy' ? `Q${cx + b.ww + 14} ${(shY + hipY) / 2 + 8} ${cx + b.ww} ${hipY}L${cx - b.ww} ${hipY}Q${cx - b.ww - 14} ${(shY + hipY) / 2 + 8} ${cx - b.sw} ${shY + 6}` : `L${cx + b.ww} ${hipY}L${cx - b.ww} ${hipY}L${cx - b.sw} ${shY + 6}`;
  s += `<path d="M${cx - b.sw} ${shY + 6}Q${cx} ${shY - 6} ${cx + b.sw} ${shY + 6}${belly}Z" fill="${D}" ${st}/>`;
  if (a.outfit === 'singlet') s += `<path d="M${cx - b.ww} ${hipY}L${cx - b.sw * 0.55} ${shY + 4}L${cx - b.sw * 0.35} ${shY + 4}L${cx} ${shY + b.th * 0.45}L${cx + b.sw * 0.35} ${shY + 4}L${cx + b.sw * 0.55} ${shY + 4}L${cx + b.ww} ${hipY}Z" fill="${A}" opacity=".9"/>`;
  if (a.outfit === 'jacket') s += `<path d="M${cx - b.sw - 2} ${shY + 6}L${cx - 6} ${shY + 10}L${cx - b.ww * 0.6} ${hipY + 4}H${cx - b.ww - 4}Z M${cx + b.sw + 2} ${shY + 6}L${cx + 6} ${shY + 10}L${cx + b.ww * 0.6} ${hipY + 4}H${cx + b.ww + 4}Z" fill="${A}" ${st}/>`;
  if (a.outfit === 'robe') s += `<path d="M${cx - b.sw - 4} ${shY + 6}L${cx - b.ww - 16} ${feet - 22}H${cx - 4}L${cx - 6} ${shY + 12}Z M${cx + b.sw + 4} ${shY + 6}L${cx + b.ww + 16} ${feet - 22}H${cx + 4}L${cx + 6} ${shY + 12}Z" fill="${A}" ${st}/>`;
  s += `<rect x="${cx - b.ww - 1}" y="${hipY - 8}" width="${(b.ww + 1) * 2}" height="${a.outfit === 'tights' ? 6 : 14}" rx="3" fill="${a.outfit === 'trunks' || !a.outfit || a.outfit === 'cape' ? A : R}"/>`;
  if (a.belt) s += `<rect x="${cx - b.ww - 3}" y="${hipY - 14}" width="${(b.ww + 3) * 2}" height="10" rx="2" fill="#ffd23f"/><ellipse cx="${cx}" cy="${hipY - 9}" rx="9" ry="7" fill="#fff0a6" stroke="#b8860b"/>`;
  // arms
  const arm = (sd, upa, fra) => {
    const sx = cx + sd * (b.sw - 2), sy = shY + 6;
    const ang = (d) => (sd > 0 ? d : 180 - d);
    const [ex, ey] = polar(sx, sy, ua, ang(upa)), [hx, hy] = polar(ex, ey, fa, ang(fra));
    return { s: limb(sx, sy, ex, ey, b.aw + 3, b.aw, D, R, 1.2) + limb(ex, ey, hx, hy, b.aw, b.aw - 1, D, R, 1.2) + `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${b.aw / 2 + 2.5}" fill="${D}" ${st}/>`, hx, hy };
  };
  const rA = arm(1, ra, rf), lA = poses[1] ? arm(-1, 180 - la, 180 - lf) : arm(-1, ra, rf);
  s += rA.s + lA.s;
  // props
  if (a.pose === 'chair') { const mx = (rA.hx + lA.hx) / 2, my = Math.min(rA.hy, lA.hy) - 6; s += `<g fill="#9aa3ad" stroke="${K}" stroke-width="1.2"><rect x="${mx - 22}" y="${my - 18}" width="44" height="6"/><rect x="${mx - 20}" y="${my - 34}" width="40" height="16" fill="none" stroke="#9aa3ad" stroke-width="3"/><path d="M${mx - 20} ${my - 12}L${mx - 26} ${my + 6}M${mx + 20} ${my - 12}L${mx + 26} ${my + 6}" stroke="#9aa3ad" stroke-width="3"/></g>`; }
  if (a.pose === 'belt') s += `<rect x="${rA.hx - 22}" y="${rA.hy - 14}" width="44" height="11" rx="3" fill="#ffd23f" stroke="#b8860b"/><ellipse cx="${rA.hx}" cy="${rA.hy - 8}" rx="9" ry="7" fill="#fff0a6" stroke="#b8860b"/>`;
  if (a.pose === 'mic') s += `<rect x="${rA.hx - 2}" y="${rA.hy - 14}" width="4" height="14" fill="#c0c8d8"/><circle cx="${rA.hx}" cy="${rA.hy - 16}" r="4.5" fill="#c0c8d8" stroke="${K}"/>`;
  // head
  const hc = a.head === 'mask' ? A : a.head === 'helmet' ? '#c0c8d8' : D;
  s += `<rect x="${cx - 5}" y="${headY + b.hr - 2}" width="10" height="8" fill="${D}"/><circle cx="${cx}" cy="${headY}" r="${b.hr}" fill="${hc}" ${st}/>`;
  if (a.head === 'mohawk') s += `<path d="M${cx - 6} ${headY - b.hr + 2}L${cx - 4} ${headY - b.hr - 14}L${cx} ${headY - b.hr - 3}L${cx + 4} ${headY - b.hr - 16}L${cx + 6} ${headY - b.hr + 1}Z" fill="${A}"/>`;
  if (a.head === 'mask') s += `<path d="M${cx - 9} ${headY - 1}Q${cx - 5} ${headY - 5} ${cx - 1} ${headY - 1}Q${cx - 5} ${headY + 2} ${cx - 9} ${headY - 1}ZM${cx + 1} ${headY - 1}Q${cx + 5} ${headY - 5} ${cx + 9} ${headY - 1}Q${cx + 5} ${headY + 2} ${cx + 1} ${headY - 1}Z" fill="#fff"/><path d="M${cx} ${headY - b.hr}V${headY + b.hr}" stroke="${R}" stroke-width="1.5"/>`;
  if (a.head === 'bald') s += `<circle cx="${cx - 4}" cy="${headY - 5}" r="2.5" fill="#fff" opacity=".5"/>`;
  if (a.head === 'crown') s += `<path d="M${cx - 11} ${headY - b.hr + 3}V${headY - b.hr - 9}L${cx - 5} ${headY - b.hr - 3}L${cx} ${headY - b.hr - 13}L${cx + 5} ${headY - b.hr - 3}L${cx + 11} ${headY - b.hr - 9}V${headY - b.hr + 3}Z" fill="#ffd23f" stroke="#b8860b"/>`;
  if (a.head === 'helmet') s += `<rect x="${cx - b.hr + 2}" y="${headY - 3}" width="${b.hr * 2 - 4}" height="5" rx="2" fill="${A}"/>`;
  if (a.head === 'bandana') s += `<rect x="${cx - b.hr}" y="${headY - b.hr * 0.6}" width="${b.hr * 2}" height="5" fill="${A}"/><path d="M${cx + b.hr} ${headY - 4}l9 -3 -2 6 7 2" stroke="${A}" stroke-width="3" fill="none"/>`;
  if (a.head === 'ponytail') s += `<circle cx="${cx}" cy="${headY - b.hr + 1}" r="3.5" fill="${R}"/>`;
  if (a.pose === 'dive') s = `<g transform="rotate(-62 125 150) translate(0 -18)">${s}</g><path d="M40 190Q80 186 110 180" stroke="${R}" stroke-width="1" stroke-dasharray="4 4" fill="none"/>`;
  return nsBg(a, p) + s;
}

// ================================================================= BLOOMLINGS
export const EL = {
  water: { c: '#2f8fd8', sky: '#bfe9ff', ground: '#8fd18b', glyph: (x, y, s = 1) => `<path d="M${x} ${y - 7 * s}C${x - 3.5 * s} ${y - 2 * s} ${x - 4 * s} ${y + 2 * s} ${x} ${y + 4.5 * s}C${x + 4 * s} ${y + 2 * s} ${x + 3.5 * s} ${y - 2 * s} ${x} ${y - 7 * s}Z" fill="#fff"/>` },
  leaf: { c: '#4caf50', sky: '#dff4c8', ground: '#7cc46a', glyph: (x, y, s = 1) => `<path d="M${x - 5 * s} ${y + 5 * s}C${x - 5 * s} ${y - 4 * s} ${x + 1 * s} ${y - 7 * s} ${x + 5 * s} ${y - 6 * s}C${x + 5 * s} ${y + 2 * s} ${x} ${y + 5 * s} ${x - 5 * s} ${y + 5 * s}Z" fill="#fff"/>` },
  ember: { c: '#e2572b', sky: '#ffe3cc', ground: '#c9b07a', glyph: (x, y, s = 1) => `<path d="M${x} ${y - 7 * s}C${x - 4 * s} ${y - 2 * s} ${x - 5 * s} ${y + 2 * s} ${x - 2 * s} ${y + 5 * s}C${x - 1 * s} ${y + 2 * s} ${x} ${y + 1 * s} ${x} ${y}C${x + 1 * s} ${y + 2 * s} ${x + 3 * s} ${y + 3 * s} ${x + 2 * s} ${y + 5 * s}C${x + 5 * s} ${y + 1 * s} ${x + 4 * s} ${y - 3 * s} ${x} ${y - 7 * s}Z" fill="#fff"/>` },
  stone: { c: '#8a7a6a', sky: '#ece4d8', ground: '#b9a98f', glyph: (x, y, s = 1) => `<path d="M${x - 5 * s} ${y + 4 * s}L${x - 3 * s} ${y - 4 * s}L${x + 3 * s} ${y - 6 * s}L${x + 6 * s} ${y + 1 * s}L${x + 2 * s} ${y + 5 * s}Z" fill="#fff"/>` },
  storm: { c: '#e0b020', sky: '#e8e6ff', ground: '#a8b0c8', glyph: (x, y, s = 1) => `<path d="M${x + 1 * s} ${y - 7 * s}L${x - 4 * s} ${y + 1 * s}H${x}L${x - 1 * s} ${y + 7 * s}L${x + 4 * s} ${y - 1 * s}H${x}Z" fill="#fff"/>` },
  frost: { c: '#6cc0e0', sky: '#eef8ff', ground: '#dfeef6', glyph: (x, y, s = 1) => `<path d="M${x} ${y - 6 * s}V${y + 6 * s}M${x - 5 * s} ${y - 3 * s}L${x + 5 * s} ${y + 3 * s}M${x - 5 * s} ${y + 3 * s}L${x + 5 * s} ${y - 3 * s}" stroke="#fff" stroke-width="${1.6 * s}" stroke-linecap="round"/>` },
  shadow: { c: '#6a4a9a', sky: '#ddd2ee', ground: '#9a8aa8', glyph: (x, y, s = 1) => `<path d="M${x + 2 * s} ${y - 6 * s}A6 6 0 1 0 ${x + 2 * s} ${y + 6 * s}A4.5 4.5 0 1 1 ${x + 2 * s} ${y - 6 * s}Z" fill="#fff"/>` },
};
export const WEAK = { water: 'Leaf', leaf: 'Ember', ember: 'Water', stone: 'Water', storm: 'Stone', frost: 'Ember', shadow: 'Storm' };
export const RES = { water: 'Ember', leaf: 'Water', ember: 'Leaf', stone: 'Storm', storm: 'Water', frost: 'Water', shadow: 'Leaf' };

function blEyes(a, x1, y1, x2, y2, r = 1) {
  const KK = '#13283d';
  if (a.eyes === 'sleepy') return `<path d="M${x1 - 5 * r} ${y1}Q${x1} ${y1 + 4 * r} ${x1 + 5 * r} ${y1}M${x2 - 5 * r} ${y2}Q${x2} ${y2 + 4 * r} ${x2 + 5 * r} ${y2}" stroke="${KK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  if (a.eyes === 'happy') return `<path d="M${x1 - 5 * r} ${y1 + 2}Q${x1} ${y1 - 5 * r} ${x1 + 5 * r} ${y1 + 2}M${x2 - 5 * r} ${y2 + 2}Q${x2} ${y2 - 5 * r} ${x2 + 5 * r} ${y2 + 2}" stroke="${KK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  const big = a.eyes === 'sparkle' ? 1.25 : 1;
  const e = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="${4.5 * r * big}" ry="${6.5 * r * big}" fill="${KK}"/><circle cx="${x + 1.5 * r}" cy="${y - 2.5 * r}" r="${1.8 * r * big}" fill="#fff"/>${a.eyes === 'sparkle' ? `<circle cx="${x - 1.5 * r}" cy="${y + 2 * r}" r="${r}" fill="#fff"/>` : ''}`;
  let s = e(x1, y1) + e(x2, y2);
  if (a.eyes === 'angry') s += `<path d="M${x1 - 6 * r} ${y1 - 9 * r}L${x1 + 4 * r} ${y1 - 6 * r}M${x2 + 6 * r} ${y2 - 9 * r}L${x2 - 4 * r} ${y2 - 6 * r}" stroke="${KK}" stroke-width="2" stroke-linecap="round"/>`;
  return s;
}
function blTip(el, x, y) {
  const KK = '#13283d';
  return {
    water: `<path d="M${x} ${y - 12}C${x - 6} ${y - 2} ${x - 6} ${y + 6} ${x} ${y + 8}C${x + 6} ${y + 6} ${x + 6} ${y - 2} ${x} ${y - 12}Z" fill="#dff4ff" stroke="${KK}" stroke-width="1.5"/>`,
    leaf: `<path d="M${x} ${y - 12}Q${x + 12} ${y} ${x} ${y + 12}Q${x - 12} ${y} ${x} ${y - 12}Z" fill="#6cc04a" stroke="${KK}" stroke-width="1.5"/>`,
    ember: `<path d="M${x} ${y - 14}C${x - 6} ${y - 4} ${x - 7} ${y + 4} ${x - 2} ${y + 10}C${x - 2} ${y + 5} ${x} ${y + 3} ${x + 1} ${y + 1}C${x + 2} ${y + 4} ${x + 5} ${y + 6} ${x + 4} ${y + 10}C${x + 9} ${y + 4} ${x + 7} ${y - 4} ${x} ${y - 14}Z" fill="#ffb347" stroke="${KK}" stroke-width="1.5"/>`,
    stone: `<path d="M${x - 8} ${y}L${x - 2} ${y - 10}L${x + 8} ${y - 6}L${x + 10} ${y + 6}L${x} ${y + 12}Z" fill="#b8ada2" stroke="${KK}" stroke-width="1.5"/>`,
    storm: `<path d="M${x + 2} ${y - 14}L${x - 7} ${y + 2}H${x}L${x - 2} ${y + 14}L${x + 8} ${y - 2}H${x + 1}Z" fill="#ffe45c" stroke="${KK}" stroke-width="1.5"/>`,
    frost: `<path d="M${x} ${y - 12}L${x + 5} ${y}L${x} ${y + 12}L${x - 5} ${y}Z" fill="#eef8ff" stroke="${KK}" stroke-width="1.5"/>`,
    shadow: `<circle cx="${x}" cy="${y}" r="8" fill="#3a2a5a" stroke="${KK}" stroke-width="1.5"/><circle cx="${x + 3}" cy="${y - 3}" r="3" fill="#d0b8ff"/>`,
  }[el] || '';
}
export function blArt(c) {
  const a = c.art, e = EL[c.el], B = a.body, B2 = a.belly || '#fff4e0', KK = '#13283d';
  const st = `stroke="${KK}" stroke-width="2" stroke-linejoin="round"`;
  let s = `<rect x="22" y="48" width="206" height="138" fill="${e.sky}"/><circle cx="${a.sunX || 196}" cy="70" r="12" fill="#fff6c9"/>
    <path d="M22 ${a.hill || 150}Q70 ${(a.hill || 150) - 24} 120 ${(a.hill || 150) - 8}T228 ${(a.hill || 150) - 14}V186H22Z" fill="${e.ground}"/>
    <g fill="#ffffff" opacity=".9"><path d="M188 104l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M58 92l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/></g>`;
  if (c.el === 'water') s += `<ellipse cx="70" cy="176" rx="60" ry="12" fill="#5ab7e8"/>`;
  if (c.el === 'storm') s += `<path d="M40 60L52 84H44L56 108" stroke="#ffe45c" stroke-width="3" fill="none"/>`;
  if (c.el === 'frost') s += `<g fill="#fff">${[50, 90, 170, 205].map((x, i) => `<circle cx="${x}" cy="${70 + i * 9}" r="2"/>`).join('')}</g>`;
  const ear = (x, y, dir) => {
    if (a.ears === 'fox') return `<path d="M${x - 8 * dir} ${y + 6}L${x - 4 * dir} ${y - 24}L${x + 12 * dir} ${y - 2}Z" fill="${B}" ${st}/>`;
    if (a.ears === 'long') return `<ellipse cx="${x}" cy="${y - 20}" rx="7" ry="22" fill="${B}" ${st} transform="rotate(${-12 * dir} ${x} ${y})"/><ellipse cx="${x}" cy="${y - 20}" rx="3" ry="16" fill="${B2}" transform="rotate(${-12 * dir} ${x} ${y})"/>`;
    if (a.ears === 'tuft') return `<path d="M${x - 6 * dir} ${y + 6}L${x - 8 * dir} ${y - 16}L${x + 10 * dir} ${y}Z" fill="${B}" ${st}/>`;
    if (a.ears === 'horn') return `<path d="M${x - 4 * dir} ${y + 4}Q${x - 12 * dir} ${y - 16} ${x - 2 * dir} ${y - 26}Q${x + 2 * dir} ${y - 10} ${x + 8 * dir} ${y}Z" fill="#f3ead2" stroke="${KK}" stroke-width="1.6"/>`;
    if (a.ears === 'fin') return `<path d="M${x} ${y + 4}Q${x - 18 * dir} ${y - 8} ${x - 10 * dir} ${y - 20}Q${x + 2 * dir} ${y - 8} ${x + 8 * dir} ${y}Z" fill="${e.c}" ${st}/>`;
    if (a.ears === 'none') return '';
    return `<circle cx="${x}" cy="${y}" r="11" fill="${B}" ${st}/><circle cx="${x}" cy="${y}" r="5" fill="${B2}"/>`;
  };
  switch (a.plan) {
    case 'quad': // side view: body, legs, head on the left, tail on the right
      s += `<path d="M164 150C186 140 192 112 178 98" stroke="${B}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M164 150C186 140 192 112 178 98" stroke="${KK}" stroke-width="11" fill="none" stroke-linecap="round" opacity=".0"/>${blTip(c.el, 178, 92)}
        ${[100, 116, 146, 160].map((x, i) => `<rect x="${x}" y="152" width="10" height="${i % 2 ? 26 : 28}" rx="4" fill="${B}" ${st}/>`).join('')}
        <ellipse cx="132" cy="146" rx="40" ry="20" fill="${B}" ${st}/><ellipse cx="128" cy="154" rx="24" ry="8" fill="${B2}"/>
        ${ear(80, 104, -1)}${ear(102, 100, 1)}<circle cx="92" cy="122" r="22" fill="${B}" ${st}/><ellipse cx="78" cy="130" rx="12" ry="8" fill="${B2}" ${st}/><ellipse cx="70" cy="128" rx="3" ry="2" fill="${KK}"/>
        ${blEyes(a, 88, 117, 102, 117, 0.85)}`;
      break;
    case 'bird':
      s += `<path d="M112 176L104 186M138 176L146 186" stroke="#f2a03d" stroke-width="3" stroke-linecap="round"/><path d="M110 168L125 190L140 168Z" fill="${e.c}" ${st}/>
        <ellipse cx="94" cy="140" rx="12" ry="26" fill="${B}" ${st} transform="rotate(20 94 140)"/><ellipse cx="156" cy="140" rx="12" ry="26" fill="${B}" ${st} transform="rotate(-20 156 140)"/>
        <ellipse cx="125" cy="138" rx="30" ry="36" fill="${B}" ${st}/><ellipse cx="125" cy="150" rx="18" ry="20" fill="${B2}"/>
        ${a.ears === 'tuft' || a.ears === 'horn' ? ear(108, 106, -1) + ear(142, 106, 1) : `<path d="M118 104Q125 84 132 104" fill="${e.c}" ${st}/>`}
        ${blEyes(a, 114, 124, 136, 124, 0.9)}<path d="M120 132L125 142L130 132Z" fill="#f2a03d" stroke="${KK}" stroke-width="1.4"/>`;
      break;
    case 'serpent':
      s += `<path d="M60 176C80 140 120 186 150 160S186 110 160 100" fill="none" stroke="${KK}" stroke-width="22" stroke-linecap="round"/><path d="M60 176C80 140 120 186 150 160S186 110 160 100" fill="none" stroke="${B}" stroke-width="18" stroke-linecap="round"/><path d="M62 176C82 144 120 186 150 162" fill="none" stroke="${B2}" stroke-width="5" stroke-linecap="round" stroke-dasharray="4 4"/>
        ${blTip(c.el, 58, 170)}<ellipse cx="148" cy="94" rx="22" ry="17" fill="${B}" ${st}/>${ear(136, 82, -1)}${ear(160, 82, 1)}
        ${blEyes(a, 140, 92, 156, 92, 0.8)}<path d="M136 104Q148 110 160 104" stroke="${KK}" stroke-width="1.5" fill="none"/>`;
      break;
    case 'frog':
      s += `<ellipse cx="125" cy="160" rx="46" ry="26" fill="${B}" ${st}/><ellipse cx="125" cy="168" rx="28" ry="14" fill="${B2}"/>
        <ellipse cx="96" cy="182" rx="14" ry="6" fill="${B}" ${st}/><ellipse cx="154" cy="182" rx="14" ry="6" fill="${B}" ${st}/>
        <circle cx="104" cy="132" r="14" fill="${B}" ${st}/><circle cx="146" cy="132" r="14" fill="${B}" ${st}/>${blEyes(a, 104, 132, 146, 132, 0.95)}
        <path d="M98 154Q125 170 152 154" stroke="${KK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>${blTip(c.el, 125, 112)}`;
      break;
    case 'blob':
      s += `<path d="M80 184Q76 112 125 104Q174 112 170 184Q158 174 150 184Q138 174 125 184Q112 174 100 184Q90 174 80 184Z" fill="${B}" ${st} opacity=".95"/><path d="M98 120Q110 110 124 112" stroke="#fff" stroke-width="5" opacity=".5" fill="none" stroke-linecap="round"/>
        ${blEyes(a, 110, 142, 140, 142)}<path d="M116 158Q125 164 134 158" stroke="${KK}" stroke-width="2" fill="none"/>${blTip(c.el, 125, 98)}`;
      break;
    case 'bug':
      s += `<g stroke="${KK}" stroke-width="2.4" stroke-linecap="round">${[[-1, 140], [-1, 156], [-1, 172], [1, 140], [1, 156], [1, 172]].map(([d, y]) => `<path d="M${125 + d * 26} ${y}L${125 + d * 44} ${y + 8}"/>`).join('')}</g>
        <ellipse cx="125" cy="156" rx="34" ry="28" fill="${B}" ${st}/><path d="M125 130V184" stroke="${KK}" stroke-width="1.6"/><g fill="${B2}" opacity=".6"><circle cx="110" cy="150" r="5"/><circle cx="140" cy="162" r="6"/></g>
        <circle cx="125" cy="118" r="18" fill="${e.c}" ${st}/>${blEyes(a, 118, 116, 132, 116, 0.75)}<path d="M125 100Q122 84 132 76" stroke="${KK}" stroke-width="3" fill="none" stroke-linecap="round"/>${blTip(c.el, 134, 74)}`;
      break;
    case 'dragon':
      s += `<path d="M104 140Q64 102 70 148Q86 142 104 150Z M146 140Q186 102 180 148Q164 142 146 150Z" fill="${e.c}" ${st} opacity=".9"/>
        <path d="M150 170Q184 172 182 144" stroke="${B}" stroke-width="8" fill="none" stroke-linecap="round"/>${blTip(c.el, 182, 138)}
        <ellipse cx="125" cy="158" rx="24" ry="26" fill="${B}" ${st}/>${[0, 1, 2].map((k) => `<path d="M114 ${150 + k * 9}H136" stroke="${B2}" stroke-width="5" stroke-linecap="round"/>`).join('')}
        <rect x="108" y="176" width="10" height="12" rx="3" fill="${B}" ${st}/><rect x="132" y="176" width="10" height="12" rx="3" fill="${B}" ${st}/>
        ${ear(110, 104, -1)}${ear(140, 104, 1)}<ellipse cx="125" cy="118" rx="22" ry="20" fill="${B}" ${st}/><ellipse cx="125" cy="128" rx="11" ry="7" fill="${B2}"/>${blEyes(a, 116, 114, 134, 114, 0.85)}`;
      break;
    case 'fish':
      s = s.replace(e.ground, '#7fc8e8');
      s += `<g fill="none" stroke="#fff" opacity=".7"><circle cx="70" cy="90" r="4"/><circle cx="62" cy="76" r="2.5"/></g>
        <path d="M160 128L190 104L186 128L190 152Z" fill="${e.c}" ${st}/><path d="M112 102Q130 80 146 104Z" fill="${e.c}" ${st}/>
        <ellipse cx="125" cy="128" rx="44" ry="28" fill="${B}" ${st}/><ellipse cx="118" cy="138" rx="26" ry="12" fill="${B2}"/>
        <path d="M128 108Q120 128 128 148" stroke="${KK}" stroke-width="1.5" fill="none" opacity=".5"/>${blEyes(a, 100, 122, 100, 122, 1)}<path d="M84 134Q90 138 94 134" stroke="${KK}" stroke-width="1.8" fill="none"/>`;
      break;
    case 'plant':
      s += `<g stroke="#3f7a2a" stroke-width="3" stroke-linecap="round">${[-1, 1].map((d) => `<path d="M${125 + d * 10} 178Q${125 + d * 22} 186 ${125 + d * 30} 184"/>`).join('')}</g>
        <path d="M125 104Q92 116 92 150Q92 182 125 182Q158 182 158 150Q158 116 125 104Z" fill="${B}" ${st}/><ellipse cx="125" cy="160" rx="20" ry="14" fill="${B2}"/>
        <path d="M125 106Q100 70 76 84Q96 100 125 106Z M125 106Q150 70 174 84Q154 100 125 106Z" fill="#6cc04a" ${st}/><circle cx="125" cy="96" r="9" fill="${e.c}" ${st}/>${blTip(c.el, 125, 92)}
        ${blEyes(a, 112, 140, 138, 140, 0.9)}<path d="M118 152Q125 157 132 152" stroke="${KK}" stroke-width="1.8" fill="none"/>`;
      break;
    case 'bat':
      s += `<path d="M110 136Q70 100 52 130Q66 128 66 142Q78 134 84 150Q96 140 110 152Z M140 136Q180 100 198 130Q184 128 184 142Q172 134 166 150Q154 140 140 152Z" fill="${e.c}" ${st}/>
        <ellipse cx="125" cy="146" rx="24" ry="28" fill="${B}" ${st}/><ellipse cx="125" cy="156" rx="13" ry="14" fill="${B2}"/>${ear(110, 120, -1)}${ear(140, 120, 1)}
        ${blEyes(a, 116, 138, 134, 138, 0.85)}<path d="M120 150L122 155L124 150M126 150L128 155L130 150" stroke="${KK}" stroke-width="1" fill="#fff"/>`;
      break;
    default: { // biped chibi
      s += `<path d="M148 166C175 160 182 132 170 118C166 136 158 148 146 152Z" fill="${B}" ${st}/>${blTip(c.el, 170, 112)}
        <ellipse cx="125" cy="162" rx="25" ry="18" fill="${B}" ${st}/><ellipse cx="125" cy="166" rx="13" ry="11" fill="${B2}"/>
        <ellipse cx="111" cy="179" rx="7" ry="4.5" fill="${B}" ${st}/><ellipse cx="139" cy="179" rx="7" ry="4.5" fill="${B}" ${st}/>
        ${ear(101, 96, -1)}${ear(149, 96, 1)}<circle cx="125" cy="118" r="30" fill="${B}" ${st}/><ellipse cx="125" cy="131" rx="16" ry="11" fill="${B2}"/>
        ${blEyes(a, 112, 115, 138, 115)}<ellipse cx="125" cy="126" rx="3" ry="2" fill="${KK}"/><path d="M120 131Q125 135 130 131" fill="none" stroke="${KK}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
  }
  if (a.extra === 'spots') s += `<g fill="#000" opacity=".14"><circle cx="112" cy="152" r="4"/><circle cx="140" cy="158" r="3"/><circle cx="130" cy="142" r="2.5"/></g>`;
  if (a.extra === 'stripe') s += `<path d="M112 96Q125 110 138 96" fill="#000" opacity=".16"/>`;
  if (a.extra === 'mask') s += `<path d="M100 114Q125 104 150 114L150 122Q125 112 100 122Z" fill="#000" opacity=".22"/>`;
  if (a.extra === 'collar') s += `<path d="M104 142Q125 152 146 142L146 148Q125 158 104 148Z" fill="#c0392b" stroke="${KK}" stroke-width="1.2"/><circle cx="125" cy="153" r="3" fill="#ffd23f" stroke="${KK}"/>`;
  if (a.extra === 'petals') s = s.replace(`<circle cx="125" cy="118" r="30"`, `${[0, 60, 120, 180, 240, 300].map((r) => `<ellipse cx="125" cy="84" rx="9" ry="16" fill="#ffb3d1" stroke="${KK}" transform="rotate(${r} 125 118)"/>`).join('')}<circle cx="125" cy="118" r="30"`);
  return s;
}

// ================================================================= MOTH & LANTERN
function mlBackdrop(kind) {
  switch (kind) {
    case 'graveyard': return `<g fill="#0a0510">${[40, 70, 180, 208].map((x, i) => `<path d="M${x - 10} 216V${190 - i * 3}Q${x} ${178 - i * 3} ${x + 10} ${190 - i * 3}V216Z"/>`).join('')}<path d="M22 216V204Q125 196 228 204V216Z"/></g>`;
    case 'window': return `<path d="M60 216V110Q60 60 125 56Q190 60 190 110V216" fill="none" stroke="#0a0510" stroke-width="10"/><path d="M125 58V216M60 140H190" stroke="#0a0510" stroke-width="5"/>`;
    case 'forest': return `<g stroke="#0a0510" stroke-width="5" fill="none" stroke-linecap="round">${[38, 64, 186, 214].map((x, i) => `<path d="M${x} 216V${90 + i * 8}M${x} ${140 + i * 5}l${i % 2 ? 14 : -14} -16M${x} ${120 + i * 6}l${i % 2 ? -10 : 10} -14"/>`).join('')}</g>`;
    case 'cathedral': return `<g fill="#0a0510"><path d="M22 216V120L40 90L58 120V216Z M192 216V120L210 90L228 120V216Z"/><path d="M58 216V150Q125 110 192 150V216Z" opacity=".6"/></g>`;
    default: return `<path d="M22 216V192H38V182L46 175L54 182V194H70V186H84V200H160V184L170 176L180 184V196H196V180H206V190H228V216Z" fill="#0a0510"/>`;
  }
}
function mlObject(o) {
  switch (o) {
    case 'moon': return `<circle cx="125" cy="172" r="26" fill="#ecd9a8" opacity=".85"/><circle cx="135" cy="166" r="24" fill="#140b1c"/>`;
    case 'candle': return `<rect x="117" y="166" width="16" height="34" fill="#efe9dc"/><path d="M125 150C120 158 121 164 125 166C129 164 130 158 125 150Z" fill="#ffcf73"/><rect x="108" y="198" width="34" height="5" fill="#6b4e2a"/>`;
    case 'ember': return `<ellipse cx="125" cy="198" rx="30" ry="6" fill="#ff7a2f"/><g fill="#ffcf73"><circle cx="112" cy="194" r="4"/><circle cx="126" cy="192" r="5"/><circle cx="140" cy="195" r="3.5"/></g>`;
    case 'key': return `<g stroke="#c9a96b" stroke-width="4" fill="none"><circle cx="125" cy="170" r="10"/><path d="M125 180V204M125 196H134M125 202H132"/></g>`;
    case 'flame': return `<path d="M125 134C104 162 106 192 125 202C144 192 146 162 125 134Z" fill="#ff8a3d"/><path d="M125 154C114 172 116 190 125 196C134 190 136 172 125 154Z" fill="#ffe3a8"/>`;
    case 'skull': return `<path d="M107 174Q107 152 125 152Q143 152 143 174Q143 184 136 186V194H114V186Q107 184 107 174Z" fill="#e8dcc0"/><circle cx="118" cy="172" r="4.5" fill="#140b1c"/><circle cx="132" cy="172" r="4.5" fill="#140b1c"/><path d="M118 194V188M125 194V188M132 194V188" stroke="#140b1c" stroke-width="1.5"/>`;
    case 'hourglass': return `<path d="M110 156H140M110 204H140M113 156Q113 176 125 180Q137 176 137 156M113 204Q113 184 125 180Q137 184 137 204" fill="none" stroke="#c9a96b" stroke-width="2.5"/><path d="M118 166Q125 176 132 166Z M117 202Q125 190 133 202Z" fill="#ecd9a8"/>`;
    case 'bell': return `<path d="M108 196C108 170 114 158 125 156C136 158 142 170 142 196Z" fill="#c9a96b" stroke="#6b4e2a"/><rect x="104" y="196" width="42" height="4" fill="#6b4e2a"/><circle cx="125" cy="202" r="4" fill="#6b4e2a"/>`;
    case 'mirror': return `<ellipse cx="125" cy="178" rx="20" ry="26" fill="#3a3a5a" stroke="#c9a96b" stroke-width="4"/><path d="M114 168Q120 160 128 162" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/>`;
    case 'coffin': return `<path d="M114 156L136 156L144 170L136 206L114 206L106 170Z" fill="#3a2414" stroke="#c9a96b" stroke-width="1.5"/><path d="M125 166V194M118 174H132" stroke="#c9a96b" stroke-width="2"/>`;
    case 'rose': return `<path d="M125 206V176" stroke="#3a6a2a" stroke-width="3"/><path d="M118 186Q110 180 114 174Q120 180 125 182Z" fill="#3a6a2a"/><circle cx="125" cy="168" r="11" fill="#a8203a"/><path d="M118 166Q125 158 132 166Q125 172 118 166Z" fill="#d84a5a"/>`;
    default: return `<circle cx="125" cy="147" r="4" fill="none" stroke="#6b4e2a" stroke-width="1.5"/><path d="M111 160L139 160L133 151L117 151Z" fill="#6b4e2a"/><rect x="113" y="160" width="24" height="32" fill="#ffcf73" stroke="#6b4e2a" stroke-width="1.5"/><path d="M125 166C119 174 120 184 125 186C130 184 131 174 125 166Z" fill="#fff6d6"/><rect x="109" y="192" width="32" height="8" fill="#6b4e2a"/>`;
  }
}
export function mlArt(a) {
  const W = a.wing, A = a.acc, E = '#ecd9a8';
  let s = `<rect x="22" y="46" width="206" height="170" fill="#140b1c"/><circle cx="125" cy="176" r="110" fill="#ffd27a" opacity=".12"/>
    <g fill="#ecd9a8"><circle cx="40" cy="62" r=".9"/><circle cx="62" cy="54" r=".6"/><circle cx="95" cy="66" r=".7"/><circle cx="160" cy="58" r=".8"/><circle cx="214" cy="104" r=".7"/></g>`;
  s += mlBackdrop(a.back) + mlObject(a.obj);
  const st = `stroke="${E}" stroke-width=".8"`;
  const ant = (y) => `<g fill="none" stroke="${E}" stroke-width=".8"><path d="M123 ${y}Q116 ${y - 15} 108 ${y - 17}"/><path d="M127 ${y}Q134 ${y - 15} 142 ${y - 17}"/></g>`;
  switch (a.bug) {
    case 'beetle': s += `<g ${st}><ellipse cx="125" cy="118" rx="28" ry="36" fill="${W}"/><path d="M125 82V154" stroke="${A}" stroke-width="1.5"/><circle cx="125" cy="78" r="10" fill="${A}"/></g><g stroke="${E}" stroke-width="1.6" fill="none">${[100, 118, 136].map((y) => `<path d="M98 ${y}L80 ${y + 6}M152 ${y}L170 ${y + 6}"/>`).join('')}</g>` + ant(70); break;
    case 'lace': s += `<g ${st} opacity=".85">${[[-28, 96], [28, 96], [-20, 118], [20, 118]].map(([r, y]) => `<ellipse cx="${125 + (r < 0 ? -34 : 34)}" cy="${y}" rx="40" ry="9" fill="${W}" transform="rotate(${r * 0.6} 125 ${y})"/>`).join('')}</g><rect x="122" y="84" width="6" height="52" rx="3" fill="${A}"/><circle cx="125" cy="82" r="5" fill="${A}"/>` + ant(80); break;
    case 'cicada': s += `<g ${st}><path d="M120 92C90 70 54 78 52 96C66 104 100 106 120 100Z" fill="${W}" opacity=".7"/><path d="M130 92C160 70 196 78 198 96C184 104 150 106 130 100Z" fill="${W}" opacity=".7"/></g><ellipse cx="125" cy="112" rx="14" ry="26" fill="${A}"/><circle cx="125" cy="84" r="11" fill="${A}"/><circle cx="117" cy="82" r="3" fill="#ff7a2f"/><circle cx="133" cy="82" r="3" fill="#ff7a2f"/>`; break;
    case 'mantis': s += `<path d="M125 70L113 86L137 86Z" fill="${W}" ${st}/><circle cx="116" cy="80" r="2.5" fill="#1a1a1a"/><circle cx="134" cy="80" r="2.5" fill="#1a1a1a"/><rect x="121" y="86" width="8" height="70" rx="4" fill="${W}"/><g stroke="${W}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M121 98L104 112L112 92"/><path d="M129 98L146 112L138 92"/></g><path d="M121 120Q96 128 104 154L121 140Z M129 120Q154 128 146 154L129 140Z" fill="${A}" opacity=".7"/>`; break;
    case 'spider': s += `<path d="M125 46V86" stroke="${E}" stroke-width=".6"/><g stroke="${W}" stroke-width="3" fill="none" stroke-linecap="round">${[-1, 1].map((d) => [[-30, -10], [-10, 0], [10, 8], [30, 18]].map(([dy, k]) => `<path d="M${125 + d * 8} ${108 + dy / 3}Q${125 + d * 40} ${92 + dy} ${125 + d * 52} ${118 + dy + k}"/>`).join('')).join('')}</g><ellipse cx="125" cy="116" rx="18" ry="22" fill="${A}" ${st}/><circle cx="125" cy="92" r="10" fill="${W}" ${st}/><path d="M118 112L125 124L132 112L125 104Z" fill="#c0262d"/>`; break;
    case 'dragonfly': s += `<g ${st} opacity=".8"><ellipse cx="90" cy="96" rx="36" ry="7" fill="${W}" transform="rotate(-8 90 96)"/><ellipse cx="160" cy="96" rx="36" ry="7" fill="${W}" transform="rotate(8 160 96)"/><ellipse cx="94" cy="110" rx="30" ry="6" fill="${W}" transform="rotate(10 94 110)"/><ellipse cx="156" cy="110" rx="30" ry="6" fill="${W}" transform="rotate(-10 156 110)"/></g><rect x="122" y="96" width="6" height="66" rx="3" fill="${A}"/><circle cx="125" cy="94" r="7" fill="${A}"/><circle cx="121" cy="92" r="3" fill="#7af0ff"/><circle cx="129" cy="92" r="3" fill="#7af0ff"/>`; break;
    case 'firefly': s += `<circle cx="125" cy="128" r="22" fill="#fff27a" opacity=".35"/><g ${st}><ellipse cx="108" cy="100" rx="14" ry="22" fill="${W}" opacity=".7" transform="rotate(-20 108 100)"/><ellipse cx="142" cy="100" rx="14" ry="22" fill="${W}" opacity=".7" transform="rotate(20 142 100)"/></g><ellipse cx="125" cy="108" rx="9" ry="18" fill="${A}"/><ellipse cx="125" cy="128" rx="9" ry="10" fill="#fff27a"/><circle cx="125" cy="88" r="7" fill="${A}"/>` + ant(84); break;
    case 'wasp': s += `<g ${st}><ellipse cx="102" cy="94" rx="24" ry="9" fill="${W}" opacity=".7" transform="rotate(-24 102 94)"/><ellipse cx="148" cy="94" rx="24" ry="9" fill="${W}" opacity=".7" transform="rotate(24 148 94)"/></g><circle cx="125" cy="86" r="9" fill="${A}"/><ellipse cx="125" cy="104" rx="9" ry="9" fill="${A}"/><ellipse cx="125" cy="132" rx="13" ry="20" fill="#f2c94c"/>${[124, 134, 144].map((y) => `<rect x="112" y="${y}" width="26" height="4" fill="${A}"/>`).join('')}<path d="M125 152L122 160L128 160Z" fill="${A}"/>` + ant(80); break;
    case 'butterfly': s += `<g ${st}><path d="M125 104C100 64 54 70 62 100C66 116 100 114 125 108Z" fill="${W}"/><path d="M125 104C150 64 196 70 188 100C184 116 150 114 125 108Z" fill="${W}"/><path d="M125 110C104 120 80 150 98 154C112 156 120 132 125 114Z" fill="${A}" opacity=".85"/><path d="M125 110C146 120 170 150 152 154C138 156 130 132 125 114Z" fill="${A}" opacity=".85"/></g><circle cx="86" cy="94" r="7" fill="${A}"/><circle cx="164" cy="94" r="7" fill="${A}"/><rect x="122" y="96" width="6" height="40" rx="3" fill="#2a1a2a"/>` + ant(98); break;
    case 'centipede': s += `<g>${Array.from({ length: 9 }, (_, k) => { const x = 60 + k * 15, y = 100 + Math.sin(k * 0.9) * 18; return `<path d="M${x} ${y}l-6 12M${x} ${y}l6 12" stroke="${E}" stroke-width="1.4"/><ellipse cx="${x}" cy="${y}" rx="9" ry="7" fill="${k % 2 ? W : A}" ${st}/>`; }).join('')}</g><circle cx="190" cy="${100 + Math.sin(8.1) * 18}" r="8" fill="${A}"/>`; break;
    case 'ant': s += `<g stroke="${E}" stroke-width="1.5" fill="none">${[-1, 1].map((d) => `<path d="M${125 + d * 4} 112l${d * 22} -10l${d * 6} 14M${125 + d * 4} 118l${d * 24} 4l${d * 2} 14M${125 + d * 4} 124l${d * 18} 16l${d * -2} 12"/>`).join('')}</g><circle cx="125" cy="88" r="11" fill="${A}" ${st}/><ellipse cx="125" cy="116" rx="8" ry="12" fill="${W}" ${st}/><ellipse cx="125" cy="146" rx="15" ry="20" fill="${A}" ${st}/>` + ant(80); break;
    default: s += `<g ${st}><path d="M125 104C104 74 66 70 60 88C55 104 92 116 125 110Z" fill="${W}"/><path d="M125 104C146 74 184 70 190 88C195 104 158 116 125 110Z" fill="${W}"/><path d="M125 110C108 116 84 134 94 144C104 152 118 130 125 114Z" fill="${W}" opacity=".85"/><path d="M125 110C142 116 166 134 156 144C146 152 132 130 125 114Z" fill="${W}" opacity=".85"/></g><circle cx="84" cy="95" r="5" fill="${A}"/><circle cx="166" cy="95" r="5" fill="${A}"/><ellipse cx="125" cy="112" rx="4" ry="14" fill="#4a3340"/>` + ant(99);
  }
  return s;
}

// ================================================================= TIDEBOUND
const TB_PAL = { teal: ['#2a8c8f', '#0a3a42', '#061a20'], deep: ['#2a4a9f', '#0a1a4a', '#03081a'], murk: ['#5a7a3a', '#1e3a20', '#0a1a0e'], storm: ['#6a5a8a', '#2a2040', '#0e0a1a'], dawn: ['#e0905a', '#3a4a6a', '#0a1a2a'] };
export function tbArt(a, p) {
  const pal = TB_PAL[a.pal] || TB_PAL.teal;
  const B = a.c || '#2f8f6a', D = a.c2 || '#1d5e45';
  let s = `<linearGradient id="${p}tw2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset=".55" stop-color="${pal[1]}"/><stop offset="1" stop-color="${pal[2]}"/></linearGradient>
    <rect x="22" y="46" width="206" height="170" fill="url(#${p}tw2)"/><g fill="#bff5ec" opacity=".08"><polygon points="60,46 90,46 70,216 30,216"/><polygon points="120,46 145,46 152,216 104,216"/><polygon points="182,46 206,46 228,170 228,216 204,216"/></g>
    <path d="M22 216V198Q60 188 100 196T180 193T228 190V216Z" fill="#2c4a3e"/>`;
  switch (a.beast) {
    case 'serpent': s += `<g transform="rotate(-12 125 172)"><path d="M100 196C100 160 108 138 125 136C142 138 150 160 150 196Q125 202 100 196Z" fill="#b07a3c" stroke="#5a3a16"/></g><path d="M34 200C44 160 98 198 150 170S218 124 186 112S124 104 142 84L176 78" fill="none" stroke="${D}" stroke-width="16" stroke-linecap="round"/><path d="M34 200C44 160 98 198 150 170S218 124 186 112S124 104 142 84L176 78" fill="none" stroke="${B}" stroke-width="12" stroke-linecap="round"/><path d="M170 70C182 62 202 68 206 78C198 86 182 88 172 84Z" fill="${B}" stroke="${D}" stroke-width="1.5"/><circle cx="190" cy="75" r="2.4" fill="#ffe27a"/>`; break;
    case 'angler': s += `<path d="M150 90Q170 60 186 74" fill="none" stroke="#5a6a6a" stroke-width="2"/><circle cx="188" cy="76" r="7" fill="#fff8b0"/><circle cx="188" cy="76" r="16" fill="#fff8b0" opacity=".2"/><path d="M60 140C60 100 110 86 150 104C176 116 182 150 160 172C134 196 76 190 60 140Z" fill="${a.c || '#1a2e30'}" stroke="#5a8a80" stroke-width="1.5"/><path d="M68 152L80 140L92 156L104 142L116 158L128 144L140 160L152 146L160 160Q110 184 68 152Z" fill="#efe9dc"/><circle cx="128" cy="118" r="7" fill="#ffe27a"/><circle cx="128" cy="118" r="3" fill="#1a1a1a"/><path d="M58 138L36 120L40 150L36 176L60 150Z" fill="${a.c || '#1a2e30'}" stroke="#5a8a80"/>`; break;
    case 'siren': s += `<g stroke="#3a7a4a" stroke-width="3" fill="none">${[60, 80, 170, 190].map((x) => `<path d="M${x} 216Q${x + 10} 160 ${x - 6} 110Q${x + 6} 80 ${x} 60"/>`).join('')}</g><path d="M110 216Q104 170 112 140Q118 120 125 116Q132 120 138 140Q146 170 140 216Z" fill="#cfe8e0" opacity=".85"/><circle cx="125" cy="104" r="12" fill="#cfe8e0" opacity=".9"/><path d="M112 98Q100 140 92 180M138 98Q150 140 160 180" stroke="#2f6a4a" stroke-width="3" fill="none"/><circle cx="120" cy="104" r="1.6" fill="#0a2a30"/><circle cx="130" cy="104" r="1.6" fill="#0a2a30"/>`; break;
    case 'crab': s += `<ellipse cx="125" cy="170" rx="48" ry="26" fill="${a.c || '#a8452a'}" stroke="#5a1a0a" stroke-width="2"/><g stroke="${a.c || '#a8452a'}" stroke-width="6" stroke-linecap="round" fill="none"><path d="M82 160L58 130L62 108"/><path d="M168 160L192 130L188 108"/>${[0, 1, 2].map((i) => `<path d="M${88 - i * 4} ${180 + i * 4}L${62 - i * 4} ${196 + i * 6}"/><path d="M${162 + i * 4} ${180 + i * 4}L${188 + i * 4} ${196 + i * 6}"/>`).join('')}</g><path d="M50 108Q62 90 74 108Q62 100 50 108Z M176 108Q188 90 200 108Q188 100 176 108Z" fill="#c0563a"/><circle cx="114" cy="146" r="4" fill="#1a1a1a"/><circle cx="136" cy="146" r="4" fill="#1a1a1a"/>`; break;
    case 'ship': s += `<path d="M50 176L200 176L184 200L66 200Z" fill="#1a2a2a" stroke="#6fcfb0"/><line x1="125" y1="70" x2="125" y2="176" stroke="#3a4a4a" stroke-width="3"/><line x1="90" y1="96" x2="90" y2="176" stroke="#3a4a4a" stroke-width="2"/><line x1="160" y1="96" x2="160" y2="176" stroke="#3a4a4a" stroke-width="2"/><g fill="#bff5ec" opacity=".55"><path d="M127 78L170 92L162 130L127 124Z"/><path d="M92 100L118 110L114 150L92 146Z"/><path d="M162 102L190 112L184 150L162 146Z"/></g>`; break;
    case 'kraken': s += `<circle cx="125" cy="118" r="36" fill="${a.c || '#5a1a3a'}" stroke="#2a0a1a" stroke-width="2"/><ellipse cx="125" cy="116" rx="12" ry="9" fill="#ffe27a"/><ellipse cx="125" cy="116" rx="3" ry="8" fill="#1a1a1a"/><g stroke="${a.c2 || '#7a2a4a'}" stroke-width="9" stroke-linecap="round" fill="none">${[[-1, 40], [1, 40], [-1, 80], [1, 80], [-1, 20], [1, 20]].map(([d, w]) => `<path d="M${125 + d * 20} 146Q${125 + d * w} 190 ${125 + d * (w + 30)} 160T${125 + d * (w + 40)} 110"/>`).join('')}</g>`; break;
    case 'jelly': s += `<path d="M90 120Q90 76 125 74Q160 76 160 120Q150 116 140 122Q130 116 125 122Q118 116 110 122Q100 116 90 120Z" fill="${a.c || '#d080e0'}" opacity=".75" stroke="#fff" stroke-width=".8"/><g stroke="${a.c || '#d080e0'}" stroke-width="2" fill="none" opacity=".7">${[96, 108, 120, 132, 144, 154].map((x, i) => `<path d="M${x} 122Q${x + (i % 2 ? 8 : -8)} 160 ${x} 200"/>`).join('')}</g><circle cx="125" cy="96" r="14" fill="#fff" opacity=".2"/>`; break;
    case 'eel': s += `<path d="M30 180Q70 120 110 150T190 110Q206 100 214 104" fill="none" stroke="${a.c || '#3a5a2a'}" stroke-width="14" stroke-linecap="round"/><path d="M30 180Q70 120 110 150T190 110" fill="none" stroke="#ffe27a" stroke-width="2" stroke-dasharray="3 6" opacity=".6"/><path d="M206 100Q222 96 220 108Q214 112 206 108Z" fill="${a.c || '#3a5a2a'}"/><circle cx="212" cy="102" r="2" fill="#ffe27a"/><path d="M212 108L218 114L214 108" fill="#fff"/>`; break;
    case 'turtle': s += `<path d="M70 150Q72 100 125 98Q178 100 180 150Z" fill="${a.c || '#4a7a3a'}" stroke="#1a3a1a" stroke-width="2"/>${[[100, 124], [125, 112], [150, 124], [112, 140], [138, 140]].map(([x, y]) => `<path d="M${x - 10} ${y}L${x} ${y - 10}L${x + 10} ${y}L${x} ${y + 10}Z" fill="#2a5a2a" opacity=".7"/>`).join('')}<ellipse cx="125" cy="152" rx="58" ry="8" fill="#c9b27a"/><ellipse cx="62" cy="150" rx="14" ry="10" fill="#8aa86a" stroke="#1a3a1a"/><circle cx="56" cy="147" r="2" fill="#1a1a1a"/><path d="M80 158L66 178M170 158L184 178" stroke="#8aa86a" stroke-width="8" stroke-linecap="round"/>`; break;
    case 'shark': s += `<path d="M30 140Q80 100 160 118Q196 124 214 140Q196 156 160 160Q90 172 30 140Z" fill="${a.c || '#7a8a9a'}" stroke="#2a3a4a" stroke-width="1.5"/><path d="M110 112L124 84L134 116Z M30 140L14 118L20 140L14 162Z" fill="${a.c || '#7a8a9a'}" stroke="#2a3a4a"/><path d="M160 152Q180 148 200 148" stroke="#efe9dc" stroke-width="5"/><circle cx="186" cy="132" r="3" fill="#1a1a1a"/><path d="M90 150Q120 164 160 158" fill="#d9dee4" opacity=".6"/>`; break;
    case 'whale': s += `<g stroke="#e8dcc0" stroke-width="5" fill="none" stroke-linecap="round"><path d="M40 170Q125 120 210 168"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${60 + k * 17} ${158 - Math.sin((k + 1) / 10 * Math.PI) * 22}v28"/>`).join('')}</g><path d="M190 150Q216 134 218 170Q206 176 192 172Z" fill="#e8dcc0"/><circle cx="204" cy="158" r="4" fill="#0a1a1a"/>`; break;
    case 'lighthouse': s = s.replace('#2c4a3e', '#1a2a2a') + `<path d="M108 196L114 96H136L142 196Z" fill="#e8dcc0" stroke="#2a2a2a"/>${[120, 146, 172].map((y) => `<rect x="${110 + (y - 96) * 0.06}" y="${y}" width="${30 - (y - 96) * 0.1}" height="10" fill="#c0392b"/>`).join('')}<rect x="112" y="80" width="26" height="16" fill="#fff27a"/><path d="M138 86L228 60V112Z M112 86L22 60V112Z" fill="#fff27a" opacity=".22"/><path d="M110 80L125 66L140 80Z" fill="#2a2a2a"/>`; break;
    case 'octopus': s += `<ellipse cx="125" cy="110" rx="30" ry="34" fill="${a.c || '#c0563a'}" stroke="#5a1a0a" stroke-width="2"/><circle cx="114" cy="112" r="5" fill="#fff"/><circle cx="136" cy="112" r="5" fill="#fff"/><circle cx="114" cy="113" r="2.5" fill="#1a1a1a"/><circle cx="136" cy="113" r="2.5" fill="#1a1a1a"/><g stroke="${a.c || '#c0563a'}" stroke-width="7" stroke-linecap="round" fill="none">${[-48, -30, -12, 12, 30, 48].map((d) => `<path d="M${125 + d / 3} 138Q${125 + d} 170 ${125 + d * 1.3} 196"/>`).join('')}</g>`; break;
    case 'seahorse': s += `<path d="M130 80Q160 82 150 110Q144 124 136 136Q150 156 138 178Q128 196 116 184Q130 176 126 160Q110 150 116 124Q104 112 108 96Q114 80 130 80Z" fill="${a.c || '#e0a030'}" stroke="#5a3a10" stroke-width="2"/><path d="M108 96L90 98L106 104Z" fill="${a.c || '#e0a030'}" stroke="#5a3a10"/><circle cx="122" cy="94" r="3" fill="#1a1a1a"/><path d="M146 100L160 92M148 116L162 112" stroke="#5a3a10" stroke-width="2"/>`; break;
    case 'urchin': s += `<g stroke="#2a1a3a" stroke-width="2.5">${Array.from({ length: 24 }, (_, k) => { const [x, y] = polar(125, 168, 40, k * 15); return `<line x1="125" y1="168" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join('')}</g><circle cx="125" cy="168" r="22" fill="${a.c || '#5a2a7a'}"/><circle cx="118" cy="162" r="3" fill="#ffe27a"/><circle cx="132" cy="162" r="3" fill="#ffe27a"/>`; break;
    case 'diver': s += `<path d="M104 200V150Q104 136 125 136Q146 136 146 150V200Z" fill="#6a5a3a" stroke="#2a1a0a"/><circle cx="125" cy="116" r="24" fill="#b87a3a" stroke="#5a3a16" stroke-width="2"/><circle cx="125" cy="116" r="13" fill="#0a1a1a" stroke="#5a3a16" stroke-width="3"/><circle cx="121" cy="114" r="3" fill="#e8dcc0"/><circle cx="129" cy="114" r="3" fill="#e8dcc0"/><path d="M146 110Q186 90 200 46" stroke="#5a5a4a" stroke-width="3" fill="none"/>`; break;
    default: break;
  }
  return s + `<g fill="none" stroke="#bff5ec" stroke-width=".8"><circle cx="212" cy="66" r="3"/><circle cx="218" cy="56" r="2"/><circle cx="60" cy="150" r="2.5"/></g>`;
}

// ================================================================= RIFT DUELISTS
export function rdArt(a, p) {
  const C = a.c, Kd = '#141018';
  const bgs = {
    volcano: `<rect x="30" y="64" width="190" height="152" fill="url(#${p}rs)"/><path d="M30 216V176L52 150L70 168L92 140L112 172L140 146L162 170L190 136L220 168V216Z" fill="#2a1530"/><rect x="30" y="200" width="190" height="16" fill="#ff7a2f" opacity=".3"/>`,
    void: `<rect x="30" y="64" width="190" height="152" fill="#0e0620"/><g fill="#fff">${Array.from({ length: 24 }, (_, i) => `<circle cx="${32 + (i * 47) % 186}" cy="${66 + (i * 29) % 148}" r="${(i % 3) * 0.4 + 0.4}"/>`).join('')}</g><ellipse cx="125" cy="140" rx="70" ry="20" fill="none" stroke="${C}" opacity=".5" transform="rotate(-18 125 140)"/>`,
    temple: `<rect x="30" y="64" width="190" height="152" fill="#3a2a4a"/><g fill="#1e1428">${[44, 76, 158, 190].map((x) => `<rect x="${x}" y="80" width="16" height="136"/>`).join('')}<rect x="30" y="72" width="190" height="10"/></g><rect x="30" y="196" width="190" height="20" fill="#2a1e36"/>`,
    storm: `<rect x="30" y="64" width="190" height="152" fill="#1a1e3a"/><path d="M60 64L52 110L66 108L54 160" stroke="#c9e0ff" stroke-width="3" fill="none"/><path d="M190 64L198 96L186 100L196 140" stroke="#c9e0ff" stroke-width="2" fill="none"/><g fill="#2a2e4a">${[30, 80, 140, 190].map((x) => `<ellipse cx="${x}" cy="72" rx="34" ry="12"/>`).join('')}</g>`,
    ice: `<rect x="30" y="64" width="190" height="152" fill="#bfe0f2"/><g fill="#8ac0e0" stroke="#e8f6ff">${[[50, 216, 40], [80, 216, 60], [180, 216, 54], [206, 216, 34]].map(([x, y, h]) => `<path d="M${x - 12} ${y}L${x} ${y - h}L${x + 12} ${y}Z"/>`).join('')}</g>`,
  };
  let s = bgs[a.bg] || bgs.volcano;
  const g = (d) => `<g fill="${Kd}" stroke="${C}" stroke-width=".9" stroke-linejoin="round">${d}</g>`;
  const eyes = (x1, y, x2) => `<circle cx="${x1}" cy="${y}" r="1.8" fill="${C}"/><circle cx="${x2}" cy="${y}" r="1.8" fill="${C}"/>`;
  switch (a.mon) {
    case 'knight': s += g('<path d="M100 216L104 150L96 118L125 104L154 118L146 150L150 216Z"/><path d="M110 104L112 80Q125 70 138 80L140 104Z"/><path d="M160 210L176 80L182 80L170 210Z"/><path d="M164 108H196V114H164Z"/><path d="M78 120L100 116L104 170L82 176Z"/>') + `<rect x="114" y="88" width="22" height="4" fill="${C}"/>`; break;
    case 'sorceress': s += g('<path d="M92 216Q100 150 112 120L138 120Q150 150 158 216Z"/><circle cx="125" cy="104" r="14"/><path d="M106 100Q125 64 144 100Q125 92 106 100Z"/><path d="M164 216L172 84"/>') + `<circle cx="173" cy="80" r="9" fill="${C}" opacity=".85"/><circle cx="173" cy="80" r="18" fill="${C}" opacity=".2"/>` + eyes(120, 104, 130); break;
    case 'golem': s += g('<path d="M96 216L100 170H150L154 216Z"/><path d="M88 120H162L158 172H92Z"/><path d="M108 88H142V120H108Z"/><path d="M62 124H88V176H66Z"/><path d="M162 124H188L184 176H162Z"/>') + `<rect x="114" y="100" width="6" height="5" fill="${C}"/><rect x="130" y="100" width="6" height="5" fill="${C}"/>`; break;
    case 'wraith': s += g('<path d="M96 200Q92 140 104 112Q114 90 125 88Q136 90 146 112Q158 140 154 200Q144 186 136 202Q128 186 120 202Q112 186 104 202Q100 190 96 200Z"/><path d="M146 130L172 150"/>') + `<circle cx="176" cy="156" r="7" fill="${C}"/><circle cx="176" cy="156" r="16" fill="${C}" opacity=".2"/>` + eyes(119, 110, 131); break;
    case 'phoenix': s += `<g fill="${C}" opacity=".85"><path d="M125 130Q80 70 40 90Q70 110 70 140Q96 128 125 140Z"/><path d="M125 130Q170 70 210 90Q180 110 180 140Q154 128 125 140Z"/><path d="M118 150Q110 200 96 214Q125 200 132 214Q140 196 132 150Z" opacity=".7"/></g>` + g('<ellipse cx="125" cy="134" rx="14" ry="22"/><circle cx="125" cy="106" r="10"/><path d="M125 108L138 112L125 114Z"/>'); break;
    case 'wolf': s += g('<path d="M60 200Q70 150 110 140L150 140Q180 146 190 200Z"/><path d="M100 140L94 100L112 116L125 96L138 116L156 100L150 140Z"/><path d="M112 128L125 150L138 128Z"/>') + eyes(114, 120, 136) + `<path d="M118 150L121 156L124 150M126 150L129 156L132 150" stroke="#fff" stroke-width="1" fill="none"/>`; break;
    case 'mech': s += g('<rect x="96" y="112" width="58" height="60" rx="4"/><rect x="108" y="84" width="34" height="26" rx="3"/><rect x="70" y="116" width="22" height="50"/><rect x="158" y="116" width="22" height="50"/><rect x="100" y="172" width="18" height="44"/><rect x="132" y="172" width="18" height="44"/>') + `<rect x="112" y="92" width="26" height="6" fill="${C}"/><circle cx="125" cy="140" r="9" fill="${C}" opacity=".8"/><path d="M180 120L210 100" stroke="${C}" stroke-width="3"/>`; break;
    case 'angel': s += `<g fill="#f2e9d8" opacity=".8"><path d="M125 120Q70 70 40 100Q74 104 70 136Q100 120 125 140Z"/><path d="M125 120Q180 70 210 100Q176 104 180 136Q150 120 125 140Z"/></g><ellipse cx="125" cy="84" rx="16" ry="4" fill="none" stroke="${C}" stroke-width="2"/>` + g('<path d="M108 216Q112 150 118 120H132Q138 150 142 216Z"/><circle cx="125" cy="104" r="12"/>') + eyes(121, 104, 129); break;
    case 'demon': s += g('<path d="M90 216L96 140Q100 118 125 116Q150 118 154 140L160 216Z"/><circle cx="125" cy="100" r="16"/><path d="M110 92Q96 74 100 60Q108 78 116 86Z M140 92Q154 74 150 60Q142 78 134 86Z"/><path d="M150 180Q190 190 196 160L188 164"/>') + eyes(118, 100, 132) + `<path d="M116 108Q125 114 134 108" stroke="${C}" stroke-width="1.5" fill="none"/>`; break;
    case 'samurai': s += g('<path d="M96 216L104 150L92 120L125 108L158 120L146 150L154 216Z"/><path d="M106 108L104 84Q125 66 146 84L144 108Z"/><path d="M98 84L84 72L106 80Z M152 84L166 72L144 80Z"/>') + `<path d="M60 200L190 70" stroke="#e8eef2" stroke-width="3"/><rect x="116" y="92" width="18" height="5" fill="${C}"/>`; break;
    case 'hydra': s += g('<path d="M80 216Q90 160 125 150Q160 160 170 216Z"/>') + [[90, 90], [125, 76], [160, 90]].map(([x, y]) => `<path d="M125 160Q${x} ${y + 40} ${x} ${y + 10}" stroke="${C}" stroke-width="12" fill="none"/><path d="M125 160Q${x} ${y + 40} ${x} ${y + 10}" stroke="${Kd}" stroke-width="9" fill="none"/>${g(`<path d="M${x - 10} ${y + 12}L${x} ${y - 4}L${x + 10} ${y + 12}L${x + 4} ${y + 18}H${x - 4}Z"/>`)}<circle cx="${x}" cy="${y + 6}" r="1.6" fill="${C}"/>`).join(''); break;
    case 'spider': s += `<g stroke="${C}" stroke-width="3" fill="none" stroke-linecap="round">${[-1, 1].map((d) => [-30, -10, 10, 30].map((k) => `<path d="M${125 + d * 14} ${150 + k / 4}Q${125 + d * 60} ${120 + k} ${125 + d * 76} ${180 + k / 2}"/>`).join('')).join('')}</g>` + g('<ellipse cx="125" cy="160" rx="26" ry="30"/><path d="M106 132Q108 100 125 98Q142 100 144 132Z"/>') + `<g fill="${C}">${[[118, 112], [132, 112], [114, 120], [136, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2"/>`).join('')}</g>`; break;
    case 'eye': s += `<g stroke="${C}" stroke-width="2" fill="none">${Array.from({ length: 8 }, (_, k) => { const [x, y] = polar(125, 130, 62, k * 45 - 10); return `<path d="M125 130Q${(125 + x) / 2 + 10} ${(130 + y) / 2 - 10} ${x.toFixed(1)} ${y.toFixed(1)}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${C}"/>`; }).join('')}</g><circle cx="125" cy="130" r="38" fill="${Kd}" stroke="${C}" stroke-width="1.5"/><ellipse cx="125" cy="130" rx="24" ry="16" fill="#f2e9d8"/><circle cx="125" cy="130" r="10" fill="${C}"/><circle cx="125" cy="130" r="4" fill="${Kd}"/>`; break;
    case 'twin': s += g('<path d="M100 216L106 150L96 122L125 112L154 122L144 150L150 216Z"/><circle cx="125" cy="100" r="13"/>') + `<path d="M96 126L44 82M154 126L206 82" stroke="#e8eef2" stroke-width="3"/><path d="M96 126L84 140M154 126L166 140" stroke="${C}" stroke-width="5"/>` + eyes(120, 100, 130); break;
    case 'serpent': s += `<path d="M40 210Q60 140 110 170T170 110Q190 84 160 76" stroke="${C}" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M40 210Q60 140 110 170T170 110Q190 84 160 76" stroke="${Kd}" stroke-width="16" fill="none" stroke-linecap="round"/>` + g('<path d="M146 66L176 70L170 86L148 82Z"/>') + `<circle cx="160" cy="74" r="2" fill="${C}"/>`; break;
    default: s += g('<path d="M125 128L40 84L62 112L36 118L64 136L46 152L98 148Z"/><path d="M125 128L210 84L188 112L214 118L186 136L204 152L152 148Z"/><path d="M104 216C98 170 110 136 125 124C140 136 152 170 146 216Z"/><path d="M118 128C112 110 116 96 125 90C134 96 138 110 132 128Z"/><path d="M112 90L125 72L138 90L132 101L118 101Z"/>') + eyes(120, 90, 130);
  }
  return s;
}

// ================================================================= GRIMOIRE ACCORD
export const SCHOOL = {
  ember: { a: '#cf7149', b: '#7f3420', pip: '#e2572b', bg: '#2a1410', glow: '#ff7a2f' },
  tide: { a: '#4a8fc8', b: '#1d3a6a', pip: '#3fa0e8', bg: '#0a1a2e', glow: '#7fd1ff' },
  iron: { a: '#9aa3ad', b: '#4a525a', pip: '#b8c0c8', bg: '#1a1c20', glow: '#ffcf73' },
  grove: { a: '#6a9a4a', b: '#2e4a22', pip: '#5fbf5a', bg: '#0e1e10', glow: '#c8ff9a' },
  void: { a: '#7a5aa8', b: '#2e1d4a', pip: '#a06bff', bg: '#120a1c', glow: '#d0a0ff' },
};
export function gaArt(c) {
  const sc = SCHOOL[c.art.school], f = c.art.fig, G = sc.glow;
  let s = `<rect x="24" y="46" width="202" height="150" fill="${sc.bg}"/>`;
  const sch = c.art.school;
  if (sch === 'ember' || sch === 'void') s += [52, 84, 116, 148].map((y) => `<rect x="24" y="${y + 24}" width="60" height="3" fill="#000" opacity=".5"/><rect x="166" y="${y + 24}" width="60" height="3" fill="#000" opacity=".5"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${26 + i * 7}" y="${y + 6 + (i % 3) * 2}" width="5" height="${18 - (i % 3) * 2}" fill="${['#6b2a1e', '#3d4a6b', '#7a5a2a', '#2e5a3a'][i % 4]}"/><rect x="${168 + i * 7}" y="${y + 6 + ((i + 1) % 3) * 2}" width="5" height="${18 - ((i + 1) % 3) * 2}" fill="${['#5a2a4a', '#8a3a22', '#3d4a6b', '#7a5a2a'][i % 4]}"/>`).join('')}`).join('');
  if (sch === 'tide') s += `<path d="M24 160Q60 148 100 160T180 158T226 156V196H24Z" fill="#1d4a7a"/><path d="M24 172Q70 164 120 174T226 170" stroke="#7fd1ff" fill="none" opacity=".5"/>`;
  if (sch === 'grove') s += [40, 70, 180, 208].map((x) => `<rect x="${x}" y="60" width="10" height="136" fill="#1e3a1a"/><circle cx="${x + 5}" cy="70" r="22" fill="#2e5a2a" opacity=".8"/>`).join('');
  if (sch === 'iron') s += `<rect x="24" y="170" width="202" height="26" fill="#2a2a2e"/><rect x="40" y="130" width="40" height="40" fill="#3a3a40"/><circle cx="60" cy="150" r="10" fill="#ff8a3d" opacity=".7"/>`;
  s += `<circle cx="125" cy="140" r="64" fill="${G}" opacity=".14"/>`;
  switch (f) {
    case 'witch': s += `<path d="M96 196Q104 140 116 120H134Q146 140 154 196Z" fill="#1d3a5a"/><circle cx="125" cy="108" r="12" fill="#c9d6e0"/><path d="M104 106Q125 60 146 106L138 100L125 70L112 100Z" fill="#0a1a2e"/><circle cx="168" cy="120" r="8" fill="${G}" opacity=".8"/>`; break;
    case 'golem': s += `<path d="M98 196L102 156H148L152 196Z" fill="#5a626a"/><path d="M92 110H158L154 158H96Z" fill="#6a727a"/><path d="M110 80H140V110H110Z" fill="#7a828a"/><rect x="115" y="92" width="6" height="5" fill="${G}"/><rect x="129" y="92" width="6" height="5" fill="${G}"/><path d="M70 114H92V160H72Z M158 114H180L178 160H158Z" fill="#5a626a"/>`; break;
    case 'tree': s += `<path d="M110 196L114 130Q100 110 92 90M140 196L136 130Q150 110 160 88M125 196V100" stroke="#5a3a1e" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="125" cy="86" r="30" fill="#3f7a2a"/><circle cx="96" cy="92" r="18" fill="#4f8a3a"/><circle cx="156" cy="90" r="18" fill="#4f8a3a"/><circle cx="117" cy="132" r="2.4" fill="${G}"/><circle cx="133" cy="132" r="2.4" fill="${G}"/>`; break;
    case 'drake': s += `<path d="M125 130L60 96L80 124L56 134L88 146Z M125 130L190 96L170 124L194 134L162 146Z" fill="#7a2a1a"/><ellipse cx="125" cy="150" rx="18" ry="30" fill="#a8452a"/><path d="M114 120Q125 96 136 120Z" fill="#a8452a"/><circle cx="121" cy="112" r="1.6" fill="${G}"/><circle cx="129" cy="112" r="1.6" fill="${G}"/>`; break;
    case 'knight': s += `<path d="M100 196L104 140L94 116L125 104L156 116L146 140L150 196Z" fill="#8a929a"/><path d="M110 104L112 80Q125 70 138 80L140 104Z" fill="#9aa3ad"/><rect x="114" y="88" width="22" height="4" fill="${G}"/><path d="M160 196L172 76" stroke="#d9dee4" stroke-width="4"/><path d="M76 120L98 116L100 166L80 170Z" fill="${sc.a}"/>`; break;
    case 'skeleton': s += `<g stroke="#e8dcc0" stroke-width="4" stroke-linecap="round" fill="none"><path d="M125 112V160M108 120H142M110 130H140M112 140H138M104 120L92 156M146 120L158 156M116 160L110 196M134 160L140 196"/></g><circle cx="125" cy="98" r="14" fill="#e8dcc0"/><circle cx="120" cy="96" r="3.5" fill="${G}"/><circle cx="130" cy="96" r="3.5" fill="${G}"/>`; break;
    case 'elemental': s += `${Array.from({ length: 5 }, (_, k) => `<ellipse cx="125" cy="130" rx="${52 - k * 8}" ry="${22 - k * 3}" fill="none" stroke="${G}" stroke-width="1.5" opacity=".${7 - k}" transform="rotate(${k * 36} 125 130)"/>`).join('')}<circle cx="125" cy="130" r="22" fill="${sc.a}"/><circle cx="125" cy="130" r="12" fill="${G}"/>`; break;
    case 'beast': s += `<path d="M60 196Q66 150 106 138L150 136Q186 142 192 196Z" fill="#4a3a2a"/><path d="M98 138L90 100L108 114L125 96L142 114L160 100L152 138Z" fill="#5a4a3a"/><circle cx="114" cy="122" r="2.5" fill="${G}"/><circle cx="136" cy="122" r="2.5" fill="${G}"/>`; break;
    case 'angel': s += `<g fill="#f3e8d2" opacity=".85"><path d="M125 120Q72 72 44 104Q76 106 72 138Q100 122 125 140Z"/><path d="M125 120Q178 72 206 104Q174 106 178 138Q150 122 125 140Z"/></g><path d="M110 196Q114 150 118 120H132Q136 150 140 196Z" fill="#e8dcc0"/><circle cx="125" cy="106" r="12" fill="#f3e8d2"/><ellipse cx="125" cy="88" rx="14" ry="4" fill="none" stroke="${G}" stroke-width="2"/>`; break;
    case 'serpent': s += `<path d="M50 190Q80 130 120 160T190 110" stroke="${sc.a}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M182 96L206 104L196 120L180 114Z" fill="${sc.a}"/><circle cx="194" cy="106" r="2" fill="${G}"/>`; break;
    case 'spell': s += `<circle cx="125" cy="130" r="50" fill="none" stroke="${G}" stroke-width="2"/><circle cx="125" cy="130" r="38" fill="none" stroke="${G}" stroke-width="1" stroke-dasharray="3 4"/><path d="M125 82L166 154H84Z" fill="none" stroke="${G}" stroke-width="2"/><path d="M125 178L84 106H166Z" fill="none" stroke="${G}" stroke-width="2" opacity=".6"/><circle cx="125" cy="130" r="10" fill="${G}"/>`; break;
    default: s += `<path d="M98 196L111 124Q125 106 139 124L152 196Z" fill="#3b1d2a"/><path d="M108 128Q125 90 142 128Q125 118 108 128Z" fill="#4b2535"/><ellipse cx="125" cy="126" rx="8.5" ry="9.5" fill="#120808"/><circle cx="121.5" cy="125" r="1.4" fill="${G}"/><circle cx="128.5" cy="125" r="1.4" fill="${G}"/><path d="M106 150L125 155L144 150L144 161L125 166L106 161Z" fill="#f5e6c8"/>`;
  }
  return s + `<g fill="${G}">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${100 + i * 10}" cy="${120 - i * 11}" r="${1 + (i % 2) * 0.5}"/>`).join('')}</g>`;
}

// ================================================================= HOLLOW PANTHEON
export function hpSym(sym, G) {
  const gs = `stroke="${G}"`, gf = `fill="${G}"`;
  switch (sym) {
    case 'door': return `<path ${gs} d="M83 212V136A42 42 0 0 1 167 136V212" fill="none" stroke-width="1.2"/><path ${gs} d="M95 212V140A30 30 0 0 1 155 140V212Z" fill="#0b0907" stroke-width="2"/><path ${gs} d="M107 152Q125 136 143 152Q125 168 107 152Z" fill="none" stroke-width="1.3"/><circle ${gf} cx="125" cy="152" r="6"/>`;
    case 'sun': return `<circle ${gf} cx="125" cy="132" r="30"/><circle cx="125" cy="132" r="20" fill="#0b0907"/><circle ${gf} cx="125" cy="132" r="8"/>${Array.from({ length: 16 }, (_, k) => { const [x1, y1] = polar(125, 132, 36, k * 22.5), [x2, y2] = polar(125, 132, 52, k * 22.5); return `<line ${gs} x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="1.5"/>`; }).join('')}`;
    case 'moon': return `<circle ${gf} cx="125" cy="130" r="38"/><circle cx="142" cy="120" r="34" fill="#15110c"/><circle ${gf} cx="98" cy="96" r="2"/><circle ${gf} cx="160" cy="170" r="2"/>`;
    case 'scales': return `<line ${gs} x1="125" y1="90" x2="125" y2="200" stroke-width="3"/><line ${gs} x1="80" y1="104" x2="170" y2="104" stroke-width="2.5"/><path ${gs} d="M80 104L66 146H94Z M170 104L156 146H184Z" fill="none" stroke-width="1.5"/><path ${gf} d="M64 146Q80 160 96 146Z M154 146Q170 160 186 146Z"/><rect ${gf} x="105" y="198" width="40" height="6"/>`;
    case 'serpent': return `<circle ${gs} cx="125" cy="140" r="44" fill="none" stroke-width="8"/><circle cx="125" cy="140" r="44" fill="none" stroke="#0b0907" stroke-width="2" stroke-dasharray="4 6"/><path ${gf} d="M160 112L176 100L172 120Z"/>`;
    case 'hourglass': return `<path ${gs} d="M95 90H155M95 196H155M100 90Q100 130 125 143Q150 130 150 90M100 196Q100 156 125 143Q150 156 150 196" fill="none" stroke-width="2.5"/><path ${gf} d="M108 104Q125 128 142 104Z M112 192Q125 170 138 192Z"/>`;
    case 'key': return `<circle ${gs} cx="125" cy="98" r="20" fill="none" stroke-width="5"/><circle cx="125" cy="98" r="7" fill="none" ${gs} stroke-width="2"/><path ${gs} d="M125 118V200M125 176H146M125 190H140" stroke-width="6" fill="none"/>`;
    case 'eye': return `<path ${gs} d="M70 140Q125 90 180 140Q125 190 70 140Z" fill="none" stroke-width="3"/><circle ${gf} cx="125" cy="140" r="20"/><circle cx="125" cy="140" r="8" fill="#0b0907"/>${[-60, -30, 0, 30, 60].map((d) => `<line ${gs} x1="${125 + d * 0.8}" y1="${100 + Math.abs(d) * 0.3}" x2="${125 + d * 1.1}" y2="${82 + Math.abs(d) * 0.3}" stroke-width="2"/>`).join('')}`;
    case 'crown': return `<path ${gf} d="M80 170V112L102 140L125 100L148 140L170 112V170Z"/><rect ${gf} x="80" y="174" width="90" height="10"/>${[102, 125, 148].map((x) => `<circle cx="${x}" cy="156" r="5" fill="#0b0907"/>`).join('')}`;
    case 'skull': return `<path ${gf} d="M92 140Q92 96 125 96Q158 96 158 140Q158 158 146 162V180H104V162Q92 158 92 140Z"/><circle cx="111" cy="136" r="9" fill="#0b0907"/><circle cx="139" cy="136" r="9" fill="#0b0907"/><path d="M114 180V166M125 180V166M136 180V166" stroke="#0b0907" stroke-width="3"/>`;
    case 'tree': return `<path ${gs} d="M125 200V120M125 150L100 128M125 140L152 118M125 124L110 104M125 124L140 100" stroke-width="5" fill="none" stroke-linecap="round"/><circle ${gs} cx="125" cy="108" r="44" fill="none" stroke-width="1.5"/>${[[100, 128], [152, 118], [110, 104], [140, 100]].map(([x, y]) => `<circle ${gf} cx="${x}" cy="${y}" r="4"/>`).join('')}`;
    case 'mask': return `<path ${gf} d="M86 104Q125 92 164 104Q166 150 125 176Q84 150 86 104Z"/><path d="M100 124Q110 116 118 126Q110 132 100 124Z M132 126Q140 116 150 124Q140 132 132 126Z" fill="#0b0907"/><path d="M112 152Q125 160 138 152" stroke="#0b0907" stroke-width="3" fill="none"/>`;
    case 'star': return `<path ${gf} d="M125 80L138 122L182 122L146 148L160 190L125 164L90 190L104 148L68 122L112 122Z"/>`;
    case 'hand': return `<path ${gf} d="M104 196V140L96 104Q96 96 104 98L112 128V92Q112 84 120 86L124 126V84Q124 76 132 78L134 126V92Q136 84 144 88L144 140Q156 120 162 126Q166 132 150 168L140 196Z"/><circle cx="125" cy="156" r="8" fill="#0b0907"/>`;
    case 'chalice': return `<path ${gf} d="M92 96H158Q158 140 125 146Q92 140 92 96Z"/><rect ${gf} x="121" y="146" width="8" height="34"/><path ${gf} d="M100 196Q125 176 150 196Z"/>`;
    case 'wheel': return `<circle ${gs} cx="125" cy="140" r="46" fill="none" stroke-width="5"/><circle ${gf} cx="125" cy="140" r="8"/>${Array.from({ length: 8 }, (_, k) => { const [x, y] = polar(125, 140, 46, k * 45); return `<line ${gs} x1="125" y1="140" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke-width="3"/>`; }).join('')}`;
    case 'mountain': return `<path ${gf} d="M60 196L106 110L126 140L146 112L190 196Z"/><path d="M96 128L106 110L116 128Z M138 128L146 112L154 128Z" fill="#0b0907"/><circle ${gs} cx="125" cy="92" r="12" fill="none" stroke-width="2"/>`;
    case 'wave': return `<path ${gf} d="M62 180Q76 120 120 120Q150 120 152 146Q130 132 118 150Q140 160 160 150Q176 170 188 180Z"/><path ${gs} d="M70 196Q100 186 125 196T180 196" fill="none" stroke-width="2"/>`;
    case 'flame': return `<path ${gf} d="M125 76C96 116 92 156 108 186C112 168 118 160 125 154C130 168 140 178 142 188C160 160 158 118 125 76Z"/><path d="M125 150C118 160 116 174 122 186C126 178 132 172 132 164Z" fill="#0b0907"/>`;
    case 'sword': return `<path ${gf} d="M121 76H129L131 168H119Z"/><rect ${gf} x="100" y="166" width="50" height="8"/><rect ${gf} x="121" y="174" width="8" height="22"/><circle ${gf} cx="125" cy="200" r="5"/>`;
    case 'feather': return `<path ${gf} d="M150 80Q90 110 104 196Q114 150 150 80Z"/><path d="M104 196Q120 140 146 88" stroke="#0b0907" stroke-width="2" fill="none"/>`;
    case 'spiral': return `<path ${gs} d="M125 140m0 0a6 6 0 0 1 6 6a12 12 0 0 1-12 12a18 18 0 0 1-18-18a24 24 0 0 1 24-24a30 30 0 0 1 30 30a36 36 0 0 1-36 36a42 42 0 0 1-42-42" fill="none" stroke-width="4" stroke-linecap="round"/>`;
    case 'bell': return `<path ${gf} d="M92 176C92 130 104 106 125 104C146 106 158 130 158 176Z"/><rect ${gf} x="84" y="176" width="82" height="8"/><circle ${gf} cx="125" cy="192" r="7"/><rect ${gf} x="119" y="92" width="12" height="12" rx="3"/>`;
    case 'ship': return `<path ${gf} d="M70 166H180L166 192H84Z"/><path ${gf} d="M126 84V162H174Z"/><path ${gf} d="M120 98V162H86Z" opacity=".75"/>`;
    default: return `<circle ${gf} cx="125" cy="140" r="30"/>`;
  }
}

// ================================================================= IRONCLAD DERBY
export function icArt(c, p) {
  const a = c.art, body = a.body;
  const hat = { top: '<rect x="77" y="114" width="12" height="13" fill="#2e1d10"/><rect x="73" y="125" width="20" height="3" fill="#2e1d10"/>', cap: '<path d="M75 128Q83 118 91 128Z" fill="#c0392b"/>', goggles: '<path d="M75 128Q83 116 91 128Z" fill="#3a2a1a"/><rect x="78" y="129" width="10" height="4" rx="1" fill="#6fb7c9"/>', bowler: '<path d="M76 128Q83 114 90 128Z" fill="#1a1a1a"/><rect x="73" y="127" width="20" height="2.5" fill="#1a1a1a"/>', scarf: '<path d="M75 128Q83 118 91 128Z" fill="#5a3a1e"/><path d="M76 138L60 132" stroke="#f2c46d" stroke-width="3"/>', helmet: '<path d="M74 132Q74 116 83 116Q92 116 92 132Z" fill="#c0c8d0"/>' }[a.hat] || '';
  const wheel = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2e1d10" stroke="#c68a4a" stroke-width="3"/><g stroke="#c68a4a" stroke-width="${r > 18 ? 2 : 1.5}"><line x1="${x - r}" y1="${y}" x2="${x + r}" y2="${y}"/><line x1="${x}" y1="${y - r}" x2="${x}" y2="${y + r}"/><line x1="${x - r * 0.7}" y1="${y - r * 0.7}" x2="${x + r * 0.7}" y2="${y + r * 0.7}"/><line x1="${x + r * 0.7}" y1="${y - r * 0.7}" x2="${x - r * 0.7}" y2="${y + r * 0.7}"/></g><circle cx="${x}" cy="${y}" r="3.5" fill="#f5d27a"/>`;
  const driver = (x, y) => `<rect x="${x - 11}" y="${y + 8}" width="22" height="24" rx="2" fill="#5a3a1e"/><circle cx="${x}" cy="${y}" r="7" fill="#e9c9a0"/><g transform="translate(${x - 83} ${y - 132})">${hat}</g>`;
  const num = (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="#f1d9a6" stroke="#4a2f14" stroke-width="1.5"/><text x="${x}" y="${y + 5.5}" text-anchor="middle" font-family="Rye,Georgia,serif" font-size="${c.no > 9 ? 11 : 15}" fill="#3a2616">${c.no}</text>`;
  let s = `<rect x="22" y="46" width="206" height="170" fill="url(#${p}is)"/><g fill="none" stroke="#a8763c" opacity=".45"><circle cx="58" cy="96" r="30" stroke-width="10" stroke-dasharray="7 5"/><circle cx="206" cy="146" r="22" stroke-width="8" stroke-dasharray="5 4"/></g>
    <path d="M22 186V166Q60 156 90 164T160 160T228 162V186Z" fill="#b98a52"/><rect x="22" y="186" width="206" height="30" fill="#7a5230"/><line x1="22" y1="202" x2="228" y2="202" stroke="#d9b47c" stroke-width="1.5" stroke-dasharray="10 8"/>
    <g fill="#f5ead2" opacity=".85"><circle cx="160" cy="92" r="8"/><circle cx="172" cy="78" r="11"/><circle cx="192" cy="64" r="14"/></g>`;
  const brass = `url(#${p}ib)`;
  switch (a.chassis) {
    case 'torpedo': s += `<path d="M52 170Q60 140 120 138H176Q206 146 206 162Q206 172 176 176H70Q52 176 52 170Z" fill="${brass}" stroke="#4a2f14" stroke-width="1.5"/>${wheel(78, 186, 14)}${wheel(176, 186, 14)}${driver(110, 124)}${num(150, 156)}<path d="M52 160L30 150M52 168L26 168" stroke="#fff3d6" stroke-width="2"/>`; break;
    case 'tank': s += `<rect x="58" y="172" width="140" height="22" rx="11" fill="#3a2a1a" stroke="#c68a4a" stroke-width="2"/>${[72, 96, 120, 144, 168, 186].map((x) => `<circle cx="${x}" cy="183" r="7" fill="#5a3a1e" stroke="#c68a4a"/>`).join('')}<rect x="70" y="134" width="114" height="40" rx="6" fill="${brass}" stroke="#4a2f14" stroke-width="1.5"/>${driver(92, 120)}${num(154, 154)}`; break;
    case 'monowheel': s += `<circle cx="128" cy="150" r="48" fill="none" stroke="#c68a4a" stroke-width="8"/><circle cx="128" cy="150" r="48" fill="none" stroke="#2e1d10" stroke-width="3" stroke-dasharray="6 6"/><rect x="108" y="140" width="40" height="22" rx="8" fill="${brass}" stroke="#4a2f14"/>${driver(128, 126)}${num(128, 176)}`; break;
    case 'tricycle': s += `${wheel(80, 172, 30)}<path d="M80 172L140 150H186" stroke="#5a3a1e" stroke-width="6"/><rect x="120" y="134" width="60" height="26" rx="10" fill="${brass}" stroke="#4a2f14"/>${wheel(176, 192, 12)}${wheel(146, 192, 12)}${driver(140, 120)}${num(166, 147)}`; break;
    case 'locomotive': s += `<rect x="60" y="136" width="100" height="38" rx="4" fill="${brass}" stroke="#4a2f14" stroke-width="1.5"/><path d="M160 140L196 156V174H160Z" fill="#5a3a1e"/><path d="M196 160L210 176H196Z" fill="#c0392b"/><rect x="70" y="114" width="34" height="24" fill="#5a3a1e"/>${wheel(80, 184, 14)}${wheel(118, 184, 14)}${wheel(176, 186, 12)}${driver(88, 112)}${num(132, 155)}`; break;
    case 'zeppelin': s += `<ellipse cx="128" cy="96" rx="64" ry="24" fill="${brass}" stroke="#4a2f14" stroke-width="1.5"/><path d="M188 96L206 82V110Z" fill="#5a3a1e"/><path d="M100 118L106 142M156 118L150 142" stroke="#4a2f14" stroke-width="2"/><rect x="92" y="142" width="72" height="26" rx="6" fill="#5a3a1e"/>${wheel(104, 180, 12)}${wheel(152, 180, 12)}${driver(116, 130)}${num(146, 155)}`; break;
    default: s += `<path d="M152 132L148 104L164 104L160 132Z" fill="#4a2f14"/><rect x="70" y="162" width="112" height="10" rx="3" fill="#5a3a1e"/><rect x="95" y="130" width="70" height="38" rx="18" fill="${brass}" stroke="#4a2f14" stroke-width="1.5"/>${num(131, 149)}${driver(83, 132)}${wheel(85, 182, 24)}${wheel(170, 190, 16)}`;
  }
  if (a.extra === 'wings') s += `<path d="M120 130L70 100L86 130Z M140 130L190 100L174 130Z" fill="#e8dcc0" opacity=".8" stroke="#4a2f14"/>`;
  if (a.extra === 'spikes') s += `<g fill="#9aa3ad">${[60, 74, 88].map((x) => `<path d="M${x} 186L${x - 12} 180L${x} 176Z"/>`).join('')}</g>`;
  if (a.extra === 'rocket') s += `<path d="M48 160L22 152L22 170Z" fill="#ff8a3d"/><path d="M48 160L30 156L30 166Z" fill="#ffe3a8"/>`;
  if (a.extra === 'flag') s += `<path d="M190 120V80" stroke="#4a2f14" stroke-width="2"/><path d="M190 80H214L208 88L214 96H190Z" fill="${body}"/>`;
  return s;
}

// ================================================================= CRYPTID FIELD NOTES
export function cfPhoto(a, p) {
  let s = `<rect x="38" y="62" width="174" height="128" fill="url(#${p}cs)"/>`;
  const sc = a.scene;
  if (sc === 'pines' || sc === 'ridge') s += `<g fill="#8a8b84"><polygon points="96,190 110,126 124,190"/><polygon points="160,190 172,130 184,190"/></g>`;
  if (sc === 'ridge') s += `<path d="M38 150Q80 120 120 140T212 130V190H38Z" fill="#5a5b54"/><circle cx="180" cy="90" r="10" fill="#e8e8e0"/>`;
  if (sc === 'lake') s += `<rect x="38" y="140" width="174" height="50" fill="#7a7d78"/><path d="M38 140H212" stroke="#d0d0c8"/>`;
  if (sc === 'road' || sc === 'highway') s += `<path d="M38 190L100 120H150L212 190Z" fill="#4a4b46"/><path d="M125 124V190" stroke="#d0d0c8" stroke-dasharray="6 6"/>${sc === 'highway' ? '<rect x="160" y="100" width="40" height="22" fill="#2a2b28"/><path d="M180 122V150" stroke="#2a2b28" stroke-width="3"/>' : '<rect x="58" y="170" width="26" height="10" fill="#1d1d1a"/>'}`;
  if (sc === 'field') s += `<rect x="38" y="150" width="174" height="40" fill="#8a8574"/><path d="M150 150V118L172 104L194 118V150Z" fill="#3b3c36"/>`;
  if (sc === 'swamp') s += `<rect x="38" y="150" width="174" height="40" fill="#5a5e52"/>${[52, 70, 186, 200].map((x) => `<path d="M${x} 190Q${x + 4} 140 ${x - 4} 110" stroke="#2e302c" stroke-width="3" fill="none"/>`).join('')}`;
  if (sc === 'barn') s += `<path d="M48 190V120L80 98L112 120V190Z" fill="#3b3c36"/><rect x="70" y="150" width="20" height="40" fill="#1d1d1a"/><rect x="38" y="180" width="174" height="10" fill="#6a6b64"/>`;
  if (sc === 'cave') s += `<path d="M38 190V62H212V190H170Q170 120 125 116Q80 120 80 190Z" fill="#3b3c36"/>`;
  if (sc === 'beach') s += `<rect x="38" y="130" width="174" height="30" fill="#8a8d88"/><rect x="38" y="160" width="174" height="30" fill="#b0aea0"/>`;
  s += `<g filter="url(#${p}cb)" fill="#1d1d1a" stroke="#1d1d1a" stroke-linecap="round">`;
  switch (a.crit) {
    case 'neck': s += `<path d="M110 142Q112 100 126 92Q134 90 136 98Q126 102 122 142Z"/><path d="M140 144Q150 132 160 144Z"/><path d="M168 144Q174 138 180 144Z"/>`; break;
    case 'howler': s += `<path d="M118 186L122 150Q112 140 116 124Q124 112 134 116L140 108L142 120Q148 134 140 150L144 186L136 186L132 160L126 160L124 186Z"/>`; break;
    case 'crawler': s += `<ellipse cx="120" cy="176" rx="14" ry="6"/><circle cx="104" cy="172" r="5"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${112 + i * 4} 176L${106 + i * 6} ${168 - (i % 2) * 8}L${102 + i * 7} 186" fill="none" stroke-width="1.4"/>`).join('')}`; break;
    case 'gray': s += `<ellipse cx="124" cy="146" rx="9" ry="11"/><path d="M118 156H130L132 184H116Z"/><line x1="118" y1="160" x2="110" y2="178" stroke-width="1.4"/><line x1="130" y1="160" x2="138" y2="178" stroke-width="1.4"/>`; break;
    case 'owl': s += `<path d="M120 188L122 140Q114 122 124 112Q134 104 142 114Q148 126 140 140L142 188Z"/>`; break;
    case 'batwing': s += `<path d="M125 120Q90 96 70 120Q90 118 96 132Q108 124 125 136Q142 124 154 132Q160 118 180 120Q160 96 125 120Z"/><path d="M118 136L120 186M132 136L130 186" stroke-width="2"/>`; break;
    case 'bigbird': s += `<path d="M60 110Q100 90 125 108Q150 90 190 110Q160 112 140 124L125 120L110 124Q90 112 60 110Z"/>`; break;
    case 'swamp': s += `<path d="M106 188L110 140Q104 120 120 112Q140 108 146 126Q150 140 144 160L148 188Z"/><path d="M110 140L96 160M146 140L160 166" stroke-width="3"/>`; break;
    case 'goatman': s += `<path d="M118 188L120 140Q114 126 120 116L116 102L124 112H132L138 102L134 116Q140 126 136 140L138 188Z"/>`; break;
    case 'shadow': s += `<path d="M110 188Q108 130 125 108Q142 130 140 188Z" opacity=".75"/>`; break;
    case 'frogman': s += `<ellipse cx="125" cy="150" rx="12" ry="16"/><ellipse cx="125" cy="128" rx="12" ry="9"/><path d="M118 166L114 188M132 166L136 188" stroke-width="3"/>`; break;
    case 'hairy': s += `<path d="M108 188L110 144Q100 120 116 110Q136 104 144 122Q150 140 142 150L146 188Z"/><path d="M110 144L96 172M144 140L156 170" stroke-width="5"/>`; break;
    case 'lights': break;
    default: s += `<ellipse cx="134" cy="106" rx="3.6" ry="5"/><path d="M131 111L137 111L139 148L132 148Z"/><line x1="133" y1="147" x2="124" y2="187" stroke-width="2.2"/><line x1="137" y1="147" x2="144" y2="187" stroke-width="2.2"/><line x1="131" y1="115" x2="119" y2="160" stroke-width="1.6"/><line x1="138" y1="115" x2="148" y2="162" stroke-width="1.6"/>`;
  }
  s += `</g>`;
  if (a.crit === 'owl') s += `<circle cx="127" cy="120" r="2.4" fill="#fff8b0"/><circle cx="137" cy="120" r="2.4" fill="#fff8b0"/>`;
  if (a.crit === 'lights') s += `<g fill="#fff8d0">${[[90, 90], [125, 80], [160, 92], [110, 104], [142, 106]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/><circle cx="${x}" cy="${y}" r="12" opacity=".2"/>`).join('')}</g>`;
  if (sc === 'pines') s += `<g fill="#2e302c"><polygon points="36,190 54,108 72,190"/><polygon points="58,190 78,94 98,190"/><polygon points="176,190 196,104 216,190"/></g>`;
  return s + `<rect x="38" y="62" width="174" height="128" filter="url(#${p}cn)" opacity=".26" style="mix-blend-mode:multiply"/>`;
}

// ================================================================= STARPOST
export function spArt(subj) {
  let s = `<g fill="#f3ead2"><circle cx="40" cy="84" r=".9"/><circle cx="70" cy="200" r=".7"/><circle cx="110" cy="80" r="1"/><circle cx="200" cy="90" r=".8"/><circle cx="212" cy="200" r="1"/><circle cx="186" cy="130" r=".6"/></g>`;
  const env = (x, y, r = 0) => `<g transform="rotate(${r} ${x + 8} ${y + 5})"><rect x="${x}" y="${y}" width="16" height="11" fill="#fff" stroke="#1b2a6b"/><path d="M${x} ${y}L${x + 8} ${y + 6}L${x + 16} ${y}" fill="none" stroke="#1b2a6b"/></g>`;
  switch (subj) {
    case 'planet': return s + `<circle cx="125" cy="150" r="40" fill="#e0a458"/><path d="M96 138Q125 128 154 142" stroke="#b97a32" stroke-width="3" fill="none"/><ellipse cx="125" cy="150" rx="68" ry="13" fill="none" stroke="#f3ead2" stroke-width="2.5" transform="rotate(-18 125 150)"/>${env(168, 102)}`;
    case 'astronaut': return s + `<circle cx="125" cy="128" r="22" fill="#f3ead2" stroke="#1b2a6b" stroke-width="2"/><rect x="112" y="118" width="26" height="16" rx="7" fill="#2a3d8f"/><path d="M104 150H146L150 196H100Z" fill="#f3ead2" stroke="#1b2a6b" stroke-width="2"/><path d="M104 156L84 178M146 156L170 140" stroke="#f3ead2" stroke-width="9" stroke-linecap="round"/>${env(166, 128)}`;
    case 'whale': return s + `<path d="M48 160Q70 110 130 116Q186 120 196 150Q170 140 160 158Q140 186 90 180Q60 176 48 160Z" fill="#3a5ab0" stroke="#f3ead2" stroke-width="1.2"/><path d="M196 150L214 132L210 156L222 172L196 160Z" fill="#3a5ab0" stroke="#f3ead2"/><circle cx="78" cy="148" r="3" fill="#f3ead2"/>${env(110, 100)}${env(130, 96)}`;
    case 'dish': return s + `<path d="M90 120Q125 170 170 130Z" fill="#f3ead2" stroke="#1b2a6b" stroke-width="2"/><line x1="130" y1="146" x2="146" y2="104" stroke="#f3ead2" stroke-width="2"/><circle cx="148" cy="100" r="4" fill="#c0392b"/><path d="M128 150L120 200H140L132 150" fill="#8a8f96"/><g fill="none" stroke="#f3ead2" opacity=".6"><path d="M160 90Q170 80 168 68"/><path d="M168 96Q184 82 180 62"/></g>`;
    case 'comet': return s + `<path d="M30 220L150 120" stroke="#f3ead2" stroke-width="18" stroke-linecap="round" opacity=".18"/><path d="M50 210L150 120" stroke="#ffe3a8" stroke-width="8" stroke-linecap="round" opacity=".45"/><circle cx="154" cy="116" r="14" fill="#fff6d6"/>${env(170, 88, 14)}`;
    case 'satellite': return s + `<rect x="112" y="128" width="26" height="30" fill="#c9a24a" stroke="#1b2a6b"/><rect x="60" y="134" width="48" height="18" fill="#2a3d8f" stroke="#f3ead2"/><rect x="142" y="134" width="48" height="18" fill="#2a3d8f" stroke="#f3ead2"/><path d="M84 134V152M166 134V152" stroke="#f3ead2"/><path d="M125 128V108" stroke="#f3ead2" stroke-width="2"/><circle cx="125" cy="106" r="4" fill="#c0392b"/>`;
    case 'moonbase': return s + `<circle cx="125" cy="240" r="90" fill="#c9c4b8"/><circle cx="96" cy="166" r="6" fill="#a8a296"/><circle cx="156" cy="172" r="8" fill="#a8a296"/><path d="M100 160Q100 136 125 136Q150 136 150 160Z" fill="#f3ead2" stroke="#1b2a6b" stroke-width="2"/><rect x="152" y="146" width="22" height="14" fill="#f3ead2" stroke="#1b2a6b"/><path d="M125 136V118" stroke="#f3ead2"/><rect x="125" y="118" width="12" height="8" fill="#c0392b"/>${env(70, 110)}`;
    case 'ufo': return s + `<path d="M125 160L96 210H154Z" fill="#fff6d6" opacity=".25"/><ellipse cx="125" cy="150" rx="46" ry="12" fill="#9aa3ad" stroke="#1b2a6b" stroke-width="2"/><path d="M104 146Q106 124 125 122Q144 124 146 146Z" fill="#7fd1ff" opacity=".85" stroke="#1b2a6b"/>${[100, 125, 150].map((x) => `<circle cx="${x}" cy="154" r="3" fill="#ffe27a"/>`).join('')}${env(118, 196)}`;
    case 'cluster': return `<g fill="#f3ead2">${Array.from({ length: 40 }, (_, k) => { const [x, y] = polar(125, 150, (k % 10) * 7, k * 37); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(k % 3) * 0.5 + 0.6}"/>`; }).join('')}</g><circle cx="125" cy="150" r="30" fill="#ffe3a8" opacity=".2"/>${env(160, 100)}`;
    case 'blackhole': return `<ellipse cx="125" cy="150" rx="70" ry="18" fill="none" stroke="#ff8a3d" stroke-width="6" opacity=".7" transform="rotate(-12 125 150)"/><ellipse cx="125" cy="150" rx="56" ry="12" fill="none" stroke="#ffe3a8" stroke-width="3" opacity=".7" transform="rotate(-12 125 150)"/><circle cx="125" cy="150" r="26" fill="#000"/>${env(150, 120, 40)}`;
    case 'train': return s + `<path d="M30 190Q125 150 220 120" stroke="#8a8f96" stroke-width="3" fill="none"/>${[0, 1, 2].map((k) => `<rect x="${60 + k * 46}" y="${152 - k * 14}" width="40" height="22" rx="4" fill="${k ? '#c0392b' : '#2a3d8f'}" stroke="#f3ead2" transform="rotate(-14 ${80 + k * 46} ${163 - k * 14})"/>`).join('')}<path d="M190 118L206 114" stroke="#ffe27a" stroke-width="3"/>`;
    case 'lighthouse': return s + `<path d="M108 210L114 120H136L142 210Z" fill="#f3ead2" stroke="#1b2a6b"/><rect x="114" y="150" width="22" height="10" fill="#c0392b"/><rect x="112" y="104" width="26" height="16" fill="#ffe27a"/><path d="M138 112L226 86V138Z" fill="#ffe27a" opacity=".22"/><path d="M110 104L125 90L140 104Z" fill="#1b2a6b"/>`;
    case 'mailbox': return s + `<path d="M98 130Q98 108 125 108Q152 108 152 130V164H98Z" fill="#c0392b" stroke="#f3ead2" stroke-width="2"/><rect x="118" y="164" width="14" height="40" fill="#8a8f96"/><rect x="152" y="118" width="4" height="22" fill="#f3ead2"/><rect x="156" y="118" width="12" height="8" fill="#ffe27a"/>${env(104, 136)}`;
    case 'robot': return s + `<rect x="104" y="118" width="42" height="34" rx="6" fill="#9aa3ad" stroke="#1b2a6b" stroke-width="2"/><circle cx="116" cy="134" r="5" fill="#ffe27a"/><circle cx="134" cy="134" r="5" fill="#ffe27a"/><rect x="110" y="152" width="30" height="34" fill="#8a8f96" stroke="#1b2a6b"/><path d="M110 160L90 176M140 160L160 150" stroke="#9aa3ad" stroke-width="6" stroke-linecap="round"/><path d="M125 118V104" stroke="#f3ead2"/><circle cx="125" cy="102" r="3" fill="#c0392b"/>${env(156, 140)}`;
    case 'jellyfish': return s + `<path d="M92 132Q92 96 125 94Q158 96 158 132Q148 128 140 134Q132 128 125 134Q118 128 110 134Q100 128 92 132Z" fill="#c080e0" opacity=".8"/><g stroke="#c080e0" stroke-width="2" fill="none" opacity=".8">${[98, 110, 122, 134, 146].map((x, i) => `<path d="M${x} 134Q${x + (i % 2 ? 8 : -8)} 170 ${x} 206"/>`).join('')}</g>${env(130, 170)}`;
    default: return s + `<path d="M36 232Q90 214 136 170" fill="none" stroke="#f3ead2" stroke-width="7" stroke-linecap="round" opacity=".35"/><g transform="translate(152 150) rotate(45)"><path d="M-6 22Q0 42 6 22Z" fill="#ffb347"/><path d="M-8 10L-18 26L-8 22Z" fill="#c0392b"/><path d="M8 10L18 26L8 22Z" fill="#c0392b"/><path d="M0 -34C12 -22 12 10 8 22L-8 22C-12 10 -12 -22 0 -34Z" fill="#f3ead2" stroke="#1b2a6b" stroke-width="1.5"/><circle cx="0" cy="-10" r="5" fill="#2a3d8f" stroke="#1b2a6b"/><g transform="translate(9 0)"><rect width="15" height="10" fill="#fff" stroke="#1b2a6b"/><path d="M0 0L7.5 5.5L15 0" fill="none" stroke="#1b2a6b"/></g></g>`;
  }
}
