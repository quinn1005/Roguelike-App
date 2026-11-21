// Procedural sound effects (Web Audio, no files).
let ctx = null, master = null, noise = null;
let muted = false;
try { muted = localStorage.getItem('ppc-muted') === '1'; } catch (e) { /* ignore */ }
export const isMuted = () => muted;
export function unlock() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
}
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('ppc-muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}
function tone(f, t0, dur, type = 'square', vol = 0.12, f2 = 0) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
}
function hiss(t0, dur, vol = 0.1, freq = 2000) {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur + 0.02);
}
const SFX = {
  tap: (t) => tone(660, t, 0.05, 'square', 0.05),
  clue: (t) => { tone(880, t, 0.08, 'triangle', 0.12); tone(1320, t + 0.07, 0.12, 'triangle', 0.1); },
  good: (t) => { [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.08, 0.16, 'triangle', 0.12)); },
  bad: (t) => { tone(220, t, 0.18, 'sawtooth', 0.08, 160); tone(160, t + 0.15, 0.25, 'sawtooth', 0.08, 110); },
  cash: (t) => { tone(1568, t, 0.06, 'square', 0.06); tone(2093, t + 0.06, 0.14, 'square', 0.06); },
  heart: (t) => { tone(70, t, 0.12, 'sine', 0.35, 50); tone(64, t + 0.22, 0.12, 'sine', 0.28, 46); },
  squelch: (t) => { tone(140, t, 0.2, 'sine', 0.2, 60); hiss(t, 0.15, 0.06, 500); },
  fizz: (t) => { hiss(t, 0.5, 0.08, 4000); },
  crackle: (t) => { for (let i = 0; i < 6; i++) hiss(t + Math.random() * 0.4, 0.03, 0.15, 3000 + Math.random() * 3000); },
  wheeze: (t) => { hiss(t, 0.6, 0.07, 900); },
  thermo: (t) => { tone(2000, t, 0.06, 'square', 0.04); tone(2000, t + 0.12, 0.06, 'square', 0.04); },
  xray: (t) => { tone(90, t, 0.5, 'sawtooth', 0.05, 120); hiss(t, 0.5, 0.04, 6000); },
  zap: (t) => { tone(1200, t, 0.08, 'sawtooth', 0.08, 300); hiss(t, 0.06, 0.1, 5000); },
  pop: (t) => tone(400, t, 0.08, 'sine', 0.2, 900),
  thud: (t) => tone(120, t, 0.12, 'sine', 0.25, 60),
  bell: (t) => { tone(1318, t, 0.4, 'sine', 0.12); tone(1046, t + 0.25, 0.6, 'sine', 0.12); },
  page: (t) => hiss(t, 0.12, 0.05, 1500),
  knock: (t) => { tone(90, t, 0.1, 'sine', 0.4, 60); tone(90, t + 0.25, 0.1, 'sine', 0.4, 60); tone(90, t + 0.5, 0.1, 'sine', 0.4, 60); },
  hatch: (t) => { [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, t + i * 0.1, 0.3, 'triangle', 0.1)); },
};
export function sfx(name) {
  if (!ctx || muted) return;
  const f = SFX[name]; if (f) f(ctx.currentTime + 0.01);
}
export function buzz(ms = 12) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* ignore */ } }
