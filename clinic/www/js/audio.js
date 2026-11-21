// Procedural sound: effects, music and ambience (Web Audio, no files).
// Each screen asks for a music track and an ambience; both cross-fade when they change.
let ctx = null, master = null, sfxBus = null, musicBus = null, ambBus = null, noise = null;
const SET_KEY = 'ppc-audio';
let settings = { music: 0.55, sfx: 0.8, amb: 0.6, muted: false };
try { Object.assign(settings, JSON.parse(localStorage.getItem(SET_KEY) || '{}')); } catch (e) { /* ignore */ }
const saveSettings = () => { try { localStorage.setItem(SET_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ } };
export const getSettings = () => ({ ...settings });
export const isMuted = () => settings.muted;

export function unlock() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = settings.muted ? 0 : 0.8; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = settings.sfx * 0.7; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    ambBus = ctx.createGain(); ambBus.gain.value = settings.amb * 0.5; ambBus.connect(master);
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    setInterval(tick, 90);
    if (want.music) { const m = want.music; want.music = null; music(m); }
    if (want.amb) { const a = want.amb; want.amb = null; ambience(a); }
  }
  if (ctx.state === 'suspended') ctx.resume();
}
export function setVolume(kind, v) {
  settings[kind] = v; saveSettings();
  if (!ctx) return;
  if (kind === 'sfx') sfxBus.gain.value = v * 0.7;
  if (kind === 'music') musicBus.gain.setTargetAtTime(cur ? v * 0.5 : 0, ctx.currentTime, 0.2);
  if (kind === 'amb') ambBus.gain.setTargetAtTime(v * 0.5, ctx.currentTime, 0.2);
}
export function toggleMute() {
  settings.muted = !settings.muted; saveSettings();
  if (master) master.gain.setTargetAtTime(settings.muted ? 0 : 0.8, ctx.currentTime, 0.05);
  return settings.muted;
}

/* ------------------------------------------------------------------ building blocks */
function voice(out, f, t0, dur, type = 'square', vol = 0.12, f2 = 0, att = 0.008) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + att); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + 0.05);
}
function hiss(out, t0, dur, vol = 0.1, freq = 2000, q = 1.2, type = 'bandpass') {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 1.5); s.stop(t0 + dur + 0.05);
}
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/* ------------------------------------------------------------------ sound effects */
const SFX = {
  tap: (t) => voice(sfxBus, 660, t, 0.05, 'square', 0.04),
  ui: (t) => { voice(sfxBus, 880, t, 0.04, 'triangle', 0.08); voice(sfxBus, 1320, t + 0.03, 0.05, 'triangle', 0.05); },
  clue: (t) => { voice(sfxBus, 880, t, 0.08, 'triangle', 0.12); voice(sfxBus, 1320, t + 0.07, 0.12, 'triangle', 0.1); voice(sfxBus, 1760, t + 0.14, 0.14, 'triangle', 0.06); },
  good: (t) => { [523, 659, 784, 1047].forEach((f, i) => voice(sfxBus, f, t + i * 0.08, 0.16, 'triangle', 0.12)); },
  bad: (t) => { voice(sfxBus, 220, t, 0.18, 'sawtooth', 0.07, 160); voice(sfxBus, 160, t + 0.15, 0.25, 'sawtooth', 0.07, 110); },
  cash: (t) => { voice(sfxBus, 1568, t, 0.06, 'square', 0.05); voice(sfxBus, 2093, t + 0.06, 0.16, 'square', 0.05); },
  heart: (t) => { voice(sfxBus, 70, t, 0.12, 'sine', 0.35, 50); voice(sfxBus, 64, t + 0.22, 0.12, 'sine', 0.28, 46); },
  squelch: (t) => { voice(sfxBus, 140, t, 0.2, 'sine', 0.2, 60); hiss(sfxBus, t, 0.15, 0.06, 500); },
  fizz: (t) => hiss(sfxBus, t, 0.5, 0.08, 4000),
  crackle: (t) => { for (let i = 0; i < 6; i++) hiss(sfxBus, t + Math.random() * 0.4, 0.03, 0.15, 3000 + Math.random() * 3000); },
  wheeze: (t) => { hiss(sfxBus, t, 0.6, 0.07, 900); hiss(sfxBus, t + 0.7, 0.5, 0.05, 1100); },
  rattle: (t) => { for (let i = 0; i < 5; i++) voice(sfxBus, 180 + Math.random() * 80, t + i * 0.05, 0.04, 'square', 0.05); },
  click: (t) => { for (let i = 0; i < 4; i++) voice(sfxBus, 3000, t + i * 0.09 + Math.random() * 0.03, 0.01, 'square', 0.03); },
  whistle: (t) => voice(sfxBus, 1800, t, 0.5, 'sine', 0.05, 2100, 0.1),
  silent: () => {},
  creak: (t) => { voice(sfxBus, 90, t, 0.3, 'sawtooth', 0.04, 70); voice(sfxBus, 120, t + 0.25, 0.2, 'sawtooth', 0.03, 100); },
  thermo: (t) => { voice(sfxBus, 2000, t, 0.06, 'square', 0.04); voice(sfxBus, 2000, t + 0.12, 0.06, 'square', 0.04); },
  xray: (t) => { voice(sfxBus, 90, t, 0.5, 'sawtooth', 0.05, 120); hiss(sfxBus, t, 0.5, 0.04, 6000); },
  zap: (t) => { voice(sfxBus, 1200, t, 0.08, 'sawtooth', 0.08, 300); hiss(sfxBus, t, 0.06, 0.1, 5000); },
  shock: (t) => { voice(sfxBus, 2400, t, 0.25, 'sawtooth', 0.12, 120); hiss(sfxBus, t, 0.2, 0.2, 5000); },
  pop: (t) => voice(sfxBus, 400, t, 0.08, 'sine', 0.2, 900),
  thud: (t) => voice(sfxBus, 120, t, 0.12, 'sine', 0.25, 60),
  bell: (t) => { voice(sfxBus, 1318, t, 0.4, 'sine', 0.12); voice(sfxBus, 1046, t + 0.25, 0.6, 'sine', 0.12); },
  page: (t) => hiss(sfxBus, t, 0.12, 0.05, 1500),
  knock: (t) => { [0, 0.3, 0.6].forEach((d) => voice(sfxBus, 90, t + d, 0.1, 'sine', 0.45, 60)); },
  hatch: (t) => { [784, 988, 1175, 1568, 1976].forEach((f, i) => voice(sfxBus, f, t + i * 0.1, 0.3, 'triangle', 0.1)); },
  stress: (t) => { voice(sfxBus, 300, t, 0.15, 'square', 0.06, 200); voice(sfxBus, 260, t + 0.12, 0.2, 'square', 0.06, 160); },
  door: (t) => { hiss(sfxBus, t, 0.3, 0.05, 400); voice(sfxBus, 200, t + 0.25, 0.12, 'triangle', 0.08); },
  coin: (t) => { voice(sfxBus, 988, t, 0.05, 'square', 0.05); voice(sfxBus, 1319, t + 0.05, 0.15, 'square', 0.05); },
  brew: (t) => { for (let i = 0; i < 4; i++) voice(sfxBus, 300 + Math.random() * 200, t + i * 0.07, 0.06, 'sine', 0.08, 600); },
  start: (t) => { [523, 784, 1047, 1568].forEach((f, i) => voice(sfxBus, f, t + i * 0.07, 0.25, 'square', 0.06)); },
};
export function sfx(name) { if (!ctx || settings.muted) return; const f = SFX[name]; if (f) f(ctx.currentTime + 0.01); }
export function knock(pitchHz) { if (!ctx || settings.muted) return; const t = ctx.currentTime + 0.01; voice(sfxBus, pitchHz, t, 0.18, 'triangle', 0.25, pitchHz * 0.8); voice(sfxBus, pitchHz * 2.01, t, 0.08, 'sine', 0.06); }
export function heartbeat(bpm) { if (!ctx || settings.muted || !bpm) return; const t = ctx.currentTime + 0.01, gap = 60 / bpm; for (let i = 0; i < 3; i++) { voice(sfxBus, 70, t + i * gap, 0.1, 'sine', 0.3, 50); voice(sfxBus, 62, t + i * gap + gap * 0.3, 0.09, 'sine', 0.22, 45); } }
export function buzz(ms = 12) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* ignore */ } }

/* ------------------------------------------------------------------ music
   Each track: tempo, a chord progression (root note + chord type) and which parts play. */
const CH = { maj: [0, 4, 7, 11], min: [0, 3, 7, 10], dom: [0, 4, 7, 10], sus: [0, 5, 7, 10], dim: [0, 3, 6, 9] };
const TRACKS = {
  title: { bpm: 126, prog: [[60, 'maj'], [57, 'min'], [53, 'maj'], [55, 'dom']], lead: 'square', leadVol: 0.035, mel: 0.75, bass: 'triangle', drums: 'bouncy', arp: 'triangle', scale: [0, 2, 4, 7, 9] },
  morning: { bpm: 84, prog: [[62, 'maj'], [59, 'min'], [64, 'min'], [57, 'sus']], lead: 'sine', leadVol: 0.05, mel: 0.45, bass: 'sine', pad: 'triangle', drums: 'soft', scale: [0, 2, 4, 7, 9] },
  day: { bpm: 96, prog: [[57, 'min'], [62, 'dom'], [55, 'maj'], [60, 'maj']], lead: 'triangle', leadVol: 0.04, mel: 0.5, bass: 'triangle', arp: 'sine', drums: 'lofi', scale: [0, 2, 3, 5, 7, 9, 10] },
  exam: { bpm: 72, prog: [[57, 'min'], [53, 'maj'], [55, 'sus'], [52, 'min']], lead: 'sine', leadVol: 0.03, mel: 0.25, bass: 'sine', pad: 'sine', drums: 'tick', scale: [0, 3, 5, 7, 10] },
  night: { bpm: 70, prog: [[57, 'min'], [62, 'min'], [55, 'dom'], [60, 'maj']], lead: 'sine', leadVol: 0.04, mel: 0.35, bass: 'sine', pad: 'triangle', drums: 'brush', scale: [0, 3, 5, 7, 10] },
  town: { bpm: 88, prog: [[53, 'maj'], [50, 'min'], [55, 'dom'], [48, 'maj']], lead: 'triangle', leadVol: 0.035, mel: 0.4, bass: 'triangle', walk: true, drums: 'brush', scale: [0, 2, 4, 7, 9] },
  cursed: { bpm: 60, prog: [[50, 'dim'], [49, 'min'], [50, 'dim'], [46, 'min']], lead: 'sine', leadVol: 0.03, mel: 0.2, bass: 'sawtooth', pad: 'sawtooth', drums: null, scale: [0, 1, 4, 6, 7], detune: true },
  game: { bpm: 138, prog: [[60, 'maj'], [65, 'maj'], [57, 'min'], [55, 'dom']], lead: 'square', leadVol: 0.03, mel: 0.6, bass: 'square', arp: 'square', drums: 'bouncy', scale: [0, 2, 4, 7, 9] },
  fair: { bpm: 112, prog: [[65, 'maj'], [60, 'dom'], [65, 'maj'], [62, 'min']], lead: 'square', leadVol: 0.035, mel: 0.7, bass: 'triangle', arp: 'triangle', drums: 'bouncy', scale: [0, 2, 4, 5, 7, 9] },
};
let cur = null, curName = null, nextStep = 0, step = 0, seed = 1;
const want = { music: null, amb: null };
const r01 = (a, b) => { let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b, 0xc2b2ae35); h ^= h >>> 15; return ((h >>> 0) % 1000) / 1000; };
export function music(name) {
  if (!ctx) { want.music = name; return; }
  if (name === curName) return;
  curName = name;
  musicBus.gain.cancelScheduledValues(ctx.currentTime);
  musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
  setTimeout(() => {
    if (curName !== name) return;
    cur = TRACKS[name] || null; step = 0; seed = (seed + 7) | 0; nextStep = ctx.currentTime + 0.1;
    if (cur) musicBus.gain.setTargetAtTime(settings.music * 0.5, ctx.currentTime, 0.5);
  }, 600);
}
function tick() {
  if (!ctx || !cur) return;
  const spb = 60 / cur.bpm / 2; // eighth notes
  while (nextStep < ctx.currentTime + 0.3) { playStep(cur, step, nextStep, spb); nextStep += spb * (step % 2 ? 0.9 : 1.1); step++; }
}
function playStep(T, s, t, spb) {
  const bar = Math.floor(s / 8), k = s % 8, [root, type] = T.prog[bar % T.prog.length], tones = CH[type];
  const out = musicBus;
  // pad: the whole chord, held for the bar
  if (T.pad && k === 0) for (const iv of tones.slice(0, 3)) voice(out, mtof(root + iv), t, spb * 8, T.pad, 0.018, 0, 0.3);
  // bass
  if (T.walk) { if (k % 2 === 0) voice(out, mtof(root - 12 + [0, 4, 7, 9][(k / 2) | 0]), t, spb * 1.8, T.bass, 0.09); }
  else if (k === 0 || k === 4 || (k === 6 && T.drums === 'bouncy')) voice(out, mtof(root - 12 + (k === 4 ? 7 : 0)), t, spb * 1.6, T.bass, 0.08);
  // arpeggio
  if (T.arp && k % 2 === 1) voice(out, mtof(root + 12 + tones[((k - 1) / 2) % tones.length]), t, spb * 0.9, T.arp, 0.018);
  // melody: a motif that repeats every two bars
  if (T.mel && r01(seed + (bar % 2) * 31, k) < T.mel * (k % 2 ? 0.6 : 1)) {
    const deg = Math.floor(r01(seed + 77 + (bar % 4), k) * T.scale.length), oct = r01(seed, k + 50) < 0.3 ? 24 : 12;
    voice(out, mtof(root + oct + T.scale[deg]) * (T.detune ? 1.01 : 1), t, spb * (r01(seed, k + 9) < 0.3 ? 2 : 1), T.lead, T.leadVol);
  }
  // drums
  const d = T.drums;
  if (d === 'bouncy' || d === 'lofi') {
    if (k === 0 || k === 4 || (d === 'bouncy' && k === 5)) voice(out, 110, t, 0.12, 'sine', 0.22, 45);
    if (k === 2 || k === 6) hiss(out, t, 0.1, d === 'lofi' ? 0.05 : 0.07, 1800);
    hiss(out, t, 0.03, 0.02, 8000);
  } else if (d === 'soft') { if (k === 0) voice(out, 90, t, 0.15, 'sine', 0.12, 45); if (k === 4) hiss(out, t, 0.08, 0.02, 3000); }
  else if (d === 'brush') { if (k % 2 === 0) hiss(out, t, 0.12, 0.018, 5000); if (k === 0) voice(out, 80, t, 0.2, 'sine', 0.1, 40); }
  else if (d === 'tick') { if (k % 2 === 0) voice(out, 2600, t, 0.015, 'square', 0.012); }
}

/* ------------------------------------------------------------------ ambience */
let ambNodes = [], ambName = null;
const AMB = {
  clinic: [{ type: 'hum', f: 120, vol: 0.02 }, { type: 'noise', f: 300, q: 0.5, vol: 0.015 }],
  waiting: [{ type: 'hum', f: 120, vol: 0.015 }, { type: 'murmur', vol: 0.05 }],
  rain: [{ type: 'noise', f: 2400, q: 0.3, vol: 0.09 }, { type: 'noise', f: 600, q: 0.4, vol: 0.04 }],
  night: [{ type: 'crickets', vol: 0.03 }, { type: 'noise', f: 400, q: 0.3, vol: 0.02 }],
  cursed: [{ type: 'hum', f: 55, vol: 0.04 }, { type: 'noise', f: 200, q: 2, vol: 0.03 }],
  fair: [{ type: 'murmur', vol: 0.07 }],
};
export function ambience(name) {
  if (!ctx) { want.amb = name; return; }
  if (name === ambName) return;
  ambName = name;
  const old = ambNodes; ambNodes = [];
  for (const n of old) { try { n.g.gain.setTargetAtTime(0, ctx.currentTime, 0.4); setTimeout(() => { try { n.src.stop(); } catch (e) { /* stopped */ } }, 1500); } catch (e) { /* gone */ } }
  for (const L of AMB[name] || []) {
    const g = ctx.createGain(); g.gain.value = 0; g.connect(ambBus);
    g.gain.setTargetAtTime(L.vol, ctx.currentTime, 0.8);
    let src;
    if (L.type === 'hum') { src = ctx.createOscillator(); src.type = 'sawtooth'; src.frequency.value = L.f; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = L.f * 2.5; src.connect(f); f.connect(g); }
    else {
      src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass';
      f.frequency.value = L.type === 'murmur' ? 500 : L.type === 'crickets' ? 4500 : L.f; f.Q.value = L.type === 'crickets' ? 30 : L.q || 1;
      src.connect(f);
      if (L.type === 'murmur' || L.type === 'crickets') {
        // slow wobble for a crowd, fast chirps for crickets
        const lfo = ctx.createOscillator(), lg = ctx.createGain(), mod = ctx.createGain();
        lfo.frequency.value = L.type === 'crickets' ? 7 : 0.4; lg.gain.value = L.type === 'crickets' ? 1 : 0.5; mod.gain.value = 0.5;
        lfo.connect(lg); lg.connect(mod.gain); f.connect(mod); mod.connect(g); lfo.start();
      } else f.connect(g);
    }
    src.start();
    ambNodes.push({ src, g });
  }
}
