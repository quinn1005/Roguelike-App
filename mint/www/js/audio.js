// Procedural music, ambience and sound effects (Web Audio, no files).
// Each screen has its own scene; scenes cross-fade when you move between screens.

let ctx = null, master, musicBus, sfxBus, noiseBuf = null;
let cur = null, curName = null, pending = null;
let muted = false;
try { muted = localStorage.getItem('mint-muted') === '1'; } catch (e) { /* ignore */ }

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export const isMuted = () => muted;

export function unlockAudio() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = musicVol; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxVol; sfxBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (pending) { const n = pending; pending = null; setScene(n); }
  }
  if (ctx.state === 'suspended') ctx.resume();
}

export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('mint-muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
  if (ctx) master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.1);
  return muted;
}

// Volumes from settings (0 to 1).
let musicVol = 0.6, sfxVol = 0.85;
try { const s = JSON.parse(localStorage.getItem('mint-settings') || '{}'); if (s.music != null) musicVol = s.music; if (s.sfx != null) sfxVol = s.sfx; } catch (e) { /* ignore */ }
export function setVolumes(m, s) {
  musicVol = m; sfxVol = s;
  if (!ctx) return;
  musicBus.gain.setTargetAtTime(musicVol, ctx.currentTime, 0.1);
  sfxBus.gain.setTargetAtTime(sfxVol, ctx.currentTime, 0.1);
}

// Lower the music while something exciting happens (pack openings).
export function duck(on) {
  if (!ctx) return;
  musicBus.gain.setTargetAtTime(on ? musicVol * 0.25 : musicVol, ctx.currentTime, 0.3);
}

// ------------------------------------------------------------------ building blocks
function env(g, t, a, peak, r) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + r);
}
function tone(out, freq, t, { type = 'sine', gain = 0.1, a = 0.005, r = 0.4, lp = 0, detune = 0, glide = 0 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + a + r);
  let node = o;
  if (lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); node = f; }
  node.connect(g); g.connect(out);
  env(g, t, a, gain, r);
  o.start(t); o.stop(t + a + r + 0.05);
}
function bell(out, freq, t, gain = 0.06, r = 1.6) {
  [[1, 1], [2.76, 0.35], [5.4, 0.15]].forEach(([m, v]) => tone(out, freq * m, t, { gain: gain * v, a: 0.004, r: r / m }));
}
function pluck(out, freq, t, gain = 0.08, r = 0.9) {
  tone(out, freq, t, { type: 'triangle', gain, a: 0.004, r, lp: 2400 });
  tone(out, freq * 2, t, { gain: gain * 0.25, a: 0.004, r: r * 0.5 });
}
function burst(out, t, { freq = 3000, q = 1, type = 'bandpass', gain = 0.05, a = 0.002, r = 0.05, sweep = 0 } = {}) {
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  s.playbackRate.value = rnd(0.8, 1.2);
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + a + r);
  const g = ctx.createGain();
  s.connect(f); f.connect(g); g.connect(out);
  env(g, t, a, gain, r);
  s.start(t, rnd(0, 1.5)); s.stop(t + a + r + 0.05);
}

// A running scene: owns a gain node, continuous sources and timers.
class Scene {
  constructor() {
    this.g = ctx.createGain();
    this.g.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.g.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.6);
    this.g.connect(musicBus);
    this.srcs = []; this.timers = []; this.alive = true;
  }
  noise({ type = 'lowpass', freq = 1000, q = 0.7, gain = 0.05, hp = 0, lfo = 0, lfoDepth = 0 } = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = gain;
    let n = s;
    if (hp) { const h = ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp; s.connect(h); n = h; }
    n.connect(f); f.connect(g); g.connect(this.g);
    if (lfo) { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = lfo; og.gain.value = lfoDepth; o.connect(og); og.connect(g.gain); o.start(); this.srcs.push(o); }
    s.start(0, rnd(0, 1.9)); this.srcs.push(s);
    return g;
  }
  drone(freq, { type = 'sine', gain = 0.02, lp = 0 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = gain;
    let n = o;
    if (lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); n = f; }
    n.connect(g); g.connect(this.g); o.start(); this.srcs.push(o);
    return g;
  }
  every(ms, fn, jitter = 0) {
    const loop = () => { if (!this.alive) return; try { fn(ctx.currentTime + 0.05); } catch (e) { /* keep going */ } this.timers.push(setTimeout(loop, ms + rnd(-jitter, jitter))); };
    this.timers.push(setTimeout(loop, rnd(50, 400)));
  }
  pad(notes, dur, { gain = 0.025, lp = 900, type = 'sawtooth' } = {}) {
    const t = ctx.currentTime + 0.05;
    notes.forEach((m) => [-7, 7].forEach((det) => tone(this.g, mtof(m), t, { type, gain, a: dur * 0.35, r: dur * 0.9, lp, detune: det })));
  }
  stop() {
    this.alive = false;
    this.timers.forEach(clearTimeout);
    const t = ctx.currentTime;
    this.g.gain.cancelScheduledValues(t);
    this.g.gain.setValueAtTime(Math.max(this.g.gain.value, 0.0001), t);
    this.g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    setTimeout(() => { this.srcs.forEach((s) => { try { s.stop(); } catch (e) { /* already stopped */ } }); this.g.disconnect(); }, 1400);
  }
}

// Rain helpers: outdoor is bright and close, indoor is muffled behind glass.
function rain(sc, indoor) {
  sc.noise({ type: 'lowpass', freq: indoor ? 1100 : 6500, hp: indoor ? 150 : 400, gain: indoor ? 0.05 : 0.07 });
  sc.every(indoor ? 140 : 45, (t) => burst(sc.g, t, { freq: rnd(indoor ? 900 : 2500, indoor ? 1800 : 6500), q: 4, gain: indoor ? 0.008 : 0.018, r: 0.03 }), indoor ? 90 : 30);
}
function chordLoop(sc, chords, secs, opts) {
  let i = 0;
  sc.every(secs * 1000, () => { sc.pad(chords[i % chords.length], secs, opts); i++; });
}

// ------------------------------------------------------------------ scenes
const SCENES = {
  title() {
    const sc = new Scene();
    sc.noise({ type: 'highpass', freq: 3500, gain: 0.006 });
    sc.every(180, (t) => { if (Math.random() < 0.35) burst(sc.g, t, { freq: rnd(1500, 5000), q: 2, gain: 0.02, r: 0.01 }); }, 120);
    chordLoop(sc, [[45, 52, 60, 64], [41, 48, 57, 60], [38, 50, 57, 62], [40, 47, 56, 59]], 6, { gain: 0.018, lp: 700 });
    const mel = [69, 72, 76, 74, 72, 69, 67, 64];
    let k = 0;
    sc.every(1700, (t) => { if (Math.random() < 0.8) pluck(sc.g, mtof(mel[k++ % mel.length]), t, 0.05, 1.6); }, 500);
    return sc;
  },
  morning() {
    const sc = new Scene();
    sc.noise({ type: 'lowpass', freq: 300, gain: 0.03 });
    sc.drone(60, { gain: 0.012 });
    chordLoop(sc, [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 53, 59]], 8, { gain: 0.012, lp: 1000, type: 'triangle' });
    sc.every(5500, (t) => {
      const n = Math.floor(rnd(5, 13));
      for (let i = 0; i < n; i++) burst(sc.g, t + i * rnd(0.07, 0.13), { freq: rnd(1800, 3200), q: 3, gain: 0.02, r: 0.02 });
      if (Math.random() < 0.4) bell(sc.g, 1760, t + n * 0.11 + 0.1, 0.012, 0.8);
    }, 2500);
    return sc;
  },
  desk(late) {
    const sc = new Scene();
    sc.drone(60, { gain: 0.018 });
    sc.drone(120, { type: 'sawtooth', gain: 0.004, lp: 1400 });
    sc.noise({ type: 'lowpass', freq: 250, gain: 0.02 });
    let tick = 0;
    sc.every(1000, (t) => { burst(sc.g, t, { freq: tick++ % 2 ? 2600 : 3400, q: 8, gain: 0.02, r: 0.015 }); });
    sc.every(late ? 1000 : 2000, (t) => tone(sc.g, late ? 49 : 55, t, { gain: late ? 0.07 : 0.045, a: 0.01, r: 0.5 }));
    const notes = late ? [57, 58, 63, 64] : [57, 60, 64, 67, 69];
    sc.every(late ? 2600 : 3600, (t) => { if (Math.random() < 0.6) pluck(sc.g, mtof(pick(notes) + 12), t, 0.025, 1.4); }, 900);
    if (late) chordLoop(sc, [[45, 46, 52], [44, 45, 51]], 5, { gain: 0.012, lp: 600 });
    return sc;
  },
  deskLate() { return SCENES.desk(true); },
  payday() {
    const sc = new Scene();
    sc.noise({ type: 'lowpass', freq: 300, gain: 0.025 });
    chordLoop(sc, [[48, 55, 60, 64], [53, 57, 60, 65], [50, 57, 62, 65], [55, 59, 62, 67]], 4, { gain: 0.014, lp: 900, type: 'triangle' });
    const arp = [60, 64, 67, 72, 67, 64];
    let k = 0;
    sc.every(500, (t) => pluck(sc.g, mtof(arp[k++ % arp.length] + 12), t, 0.02, 0.6));
    return sc;
  },
  story() {
    const sc = new Scene();
    sc.drone(41.2, { gain: 0.05 });
    sc.drone(82.4, { type: 'sawtooth', gain: 0.01, lp: 220 });
    sc.every(4200, (t) => { const m = pick([76, 77, 79, 80]); tone(sc.g, mtof(m), t, { gain: 0.01, a: 1.5, r: 2.5 }); tone(sc.g, mtof(m + 1), t, { gain: 0.008, a: 1.5, r: 2.5 }); }, 1200);
    rain(sc, true);
    return sc;
  },
  street() {
    const sc = new Scene();
    rain(sc, false);
    sc.noise({ type: 'lowpass', freq: 140, gain: 0.05, lfo: 0.07, lfoDepth: 0.03 });
    sc.drone(120, { type: 'sawtooth', gain: 0.002, lp: 3000 });
    sc.every(13000, (t) => burst(sc.g, t, { type: 'bandpass', freq: 250, sweep: 900, q: 0.8, gain: 0.07, a: 1.6, r: 1.8 }), 5000);
    chordLoop(sc, [[38, 45, 52, 57, 64], [36, 43, 52, 55, 62]], 10, { gain: 0.01, lp: 600 });
    return sc;
  },
  shop() {
    const sc = new Scene();
    rain(sc, true);
    sc.noise({ type: 'highpass', freq: 2500, gain: 0.004 });
    const radio = ctx.createBiquadFilter(); radio.type = 'bandpass'; radio.frequency.value = 1100; radio.Q.value = 0.6; radio.connect(sc.g);
    const chords = [[60, 63, 67, 70], [53, 57, 60, 63], [58, 62, 65, 69], [55, 58, 62, 65]];
    const bass = [36, 41, 46, 43];
    let bar = 0;
    sc.every(2400, (t) => {
      const c = chords[bar % 4];
      c.forEach((m) => { tone(radio, mtof(m), t, { gain: 0.03, a: 0.01, r: 1.6 }); tone(radio, mtof(m), t + 1.2, { gain: 0.018, a: 0.01, r: 1 }); });
      for (let q = 0; q < 4; q++) tone(radio, mtof(bass[bar % 4] + [0, 7, 12, 7][q]), t + q * 0.6, { type: 'triangle', gain: 0.06, a: 0.01, r: 0.45 });
      if (Math.random() < 0.6) pluck(radio, mtof(pick(c) + 12), t + 0.9, 0.03, 0.7);
      bar++;
    });
    return sc;
  },
  market() {
    const sc = new Scene();
    sc.noise({ type: 'lowpass', freq: 2200, hp: 200, gain: 0.06 });
    sc.every(70, (t) => burst(sc.g, t, { type: 'lowpass', freq: rnd(200, 500), gain: 0.04, r: 0.05 }), 50);
    sc.noise({ type: 'lowpass', freq: 120, gain: 0.04, lfo: 0.05, lfoDepth: 0.02 });
    const pent = [72, 74, 76, 79, 81, 84, 86];
    sc.every(1600, (t) => { const n = Math.floor(rnd(1, 4)); for (let i = 0; i < n; i++) bell(sc.g, mtof(pick(pent)), t + i * rnd(0.08, 0.25), 0.012, 2.2); }, 900);
    sc.drone(55, { type: 'triangle', gain: 0.01 });
    return sc;
  },
  diner() {
    const sc = new Scene();
    sc.noise({ type: 'bandpass', freq: 5000, q: 1, gain: 0.008 });
    sc.every(120, (t) => { if (Math.random() < 0.4) burst(sc.g, t, { freq: rnd(3000, 7000), q: 3, gain: 0.006, r: 0.02 }); });
    const juke = ctx.createBiquadFilter(); juke.type = 'lowpass'; juke.frequency.value = 2400; juke.connect(sc.g);
    const prog = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];
    const roots = [36, 33, 29, 31];
    const beat = 60 / 96;
    let bar = 0;
    sc.every(beat * 4 * 1000, (t) => {
      const c = prog[bar % 4], r = roots[bar % 4];
      for (let q = 0; q < 4; q++) {
        tone(juke, mtof(r + (q % 2 ? 7 : 0)), t + q * beat, { type: 'triangle', gain: 0.07, a: 0.01, r: beat * 0.8 });
        if (q % 2) c.forEach((m) => tone(juke, mtof(m + 12), t + q * beat, { type: 'square', gain: 0.008, a: 0.01, r: beat * 0.5, lp: 1800 }));
        burst(juke, t + q * beat, { freq: 6000, q: 1, gain: 0.012, r: 0.04 });
        burst(juke, t + q * beat + beat * 0.66, { freq: 6000, q: 1, gain: 0.008, r: 0.03 });
      }
      if (bar % 2 === 0) [0, 1, 2, 3].forEach((i) => tone(juke, mtof(pick(c) + 24), t + i * beat * 0.5 + beat * 2, { type: 'triangle', gain: 0.02, a: 0.01, r: 0.3 }));
      bar++;
    });
    rain(sc, true);
    return sc;
  },
  home() {
    const sc = new Scene();
    rain(sc, true);
    sc.drone(50, { gain: 0.01 });
    sc.drone(100, { gain: 0.004 });
    const tune = [74, 77, 81, 79, 77, 76, 74, 72, 74, 77, 76, 72, 74];
    let k = 0;
    sc.every(900, (t) => { const m = tune[k++ % tune.length]; if (k % 14 !== 0) bell(sc.g, mtof(m + 12), t, 0.014, 1.8); });
    chordLoop(sc, [[50, 57, 62], [46, 53, 58], [48, 55, 60], [45, 52, 57]], 7.2, { gain: 0.008, lp: 500, type: 'triangle' });
    return sc;
  },
  apex() {
    const sc = new Scene();
    sc.drone(120, { type: 'sawtooth', gain: 0.003, lp: 1800 });
    sc.noise({ type: 'lowpass', freq: 400, gain: 0.02 });
    const muzak = ctx.createBiquadFilter(); muzak.type = 'bandpass'; muzak.frequency.value = 1400; muzak.Q.value = 0.5; muzak.connect(sc.g);
    const mel = [72, 74, 76, 79, 76, 74, 72, 67];
    let k = 0;
    sc.every(600, (t) => { tone(muzak, mtof(mel[k++ % mel.length]), t, { type: 'triangle', gain: 0.03, r: 0.5 }); });
    chordLoop(sc, [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], 4.8, { gain: 0.01, lp: 1200, type: 'triangle' });
    sc.every(7000, (t) => { for (let i = 0; i < 14; i++) burst(sc.g, t + i * 0.04, { freq: 2200, q: 3, gain: 0.015, r: 0.02 }); }, 3000);
    return sc;
  },
  auction() {
    const sc = new Scene();
    sc.noise({ type: 'bandpass', freq: 500, q: 0.5, gain: 0.05, lfo: 0.3, lfoDepth: 0.02 });
    sc.every(300, (t) => { if (Math.random() < 0.3) burst(sc.g, t, { freq: rnd(300, 900), q: 4, gain: 0.02, r: 0.12 }); });
    chordLoop(sc, [[50, 57, 62, 66], [52, 59, 64, 67], [47, 54, 59, 62], [45, 52, 57, 61]], 3.6, { gain: 0.016, lp: 1600, type: 'sawtooth' });
    sc.every(900, (t) => pluck(sc.g, mtof(pick([74, 76, 78, 81, 83])), t, 0.03, 0.8), 200);
    return sc;
  },
  end() {
    const sc = new Scene();
    rain(sc, true);
    chordLoop(sc, [[45, 52, 57, 60], [41, 48, 53, 57], [36, 48, 52, 55], [40, 47, 52, 56]], 5, { gain: 0.016, lp: 700, type: 'triangle' });
    sc.every(2500, (t) => pluck(sc.g, mtof(pick([69, 72, 76, 71, 68])), t, 0.04, 2), 700);
    return sc;
  },
};

export function setScene(name) {
  if (!ctx) { pending = name; return; }
  if (name === curName) return;
  if (cur) cur.stop();
  curName = name;
  cur = SCENES[name] ? SCENES[name]() : null;
}

// ------------------------------------------------------------------ sound effects
export function sfx(name, opt = {}) {
  if (!ctx || muted) return;
  const t = ctx.currentTime + 0.01, o = sfxBus;
  switch (name) {
    case 'ui': tone(o, 1400, t, { gain: 0.03, r: 0.05 }); break;
    case 'tool': burst(o, t, { freq: 2200, q: 6, gain: 0.08, r: 0.03 }); tone(o, 900, t, { gain: 0.02, r: 0.05 }); break;
    case 'flip': burst(o, t, { freq: 700, sweep: 3200, q: 1.2, gain: 0.1, a: 0.04, r: 0.16 }); break;
    case 'tag': tone(o, 880, t, { gain: 0.08, r: 0.12, glide: 1320 }); burst(o, t, { freq: 4000, q: 4, gain: 0.03, r: 0.02 }); break;
    case 'miss': tone(o, 160, t, { gain: 0.12, r: 0.18, glide: 80 }); break;
    case 'stamp': tone(o, 95, t, { gain: 0.35, a: 0.003, r: 0.25, glide: 50 }); burst(o, t, { type: 'lowpass', freq: 900, gain: 0.25, r: 0.12 }); break;
    case 'citation':
      for (let i = 0; i < 9; i++) burst(o, t + i * 0.035, { freq: 1800, q: 2, gain: 0.05, r: 0.02 });
      tone(o, 110, t + 0.35, { type: 'sawtooth', gain: 0.06, a: 0.01, r: 0.35, lp: 900 });
      tone(o, 104, t + 0.35, { type: 'sawtooth', gain: 0.06, a: 0.01, r: 0.35, lp: 900 }); break;
    case 'cash': [2093, 2637, 3136].forEach((f, i) => bell(o, f, t + i * 0.07, 0.04, 0.6)); break;
    case 'bell': bell(o, 1568, t, 0.08, 1.4); bell(o, 1975, t + 0.18, 0.06, 1.4); break;
    case 'step': [0, 0.32, 0.64].forEach((d) => burst(o, t + d, { type: 'lowpass', freq: 380, gain: 0.12, r: 0.08 })); break;
    case 'rustle': burst(o, t, { freq: 2500, q: 0.6, gain: 0.06, a: 0.02, r: 0.18 }); break;
    case 'tear': burst(o, t, { freq: rnd(1800, 4200), q: 1.5, gain: 0.05 + (opt.v || 0) * 0.08, a: 0.004, r: 0.05 }); break;
    case 'rip': burst(o, t, { freq: 1500, sweep: 5000, q: 0.9, gain: 0.22, a: 0.01, r: 0.28 }); tone(o, 220, t, { type: 'triangle', gain: 0.05, r: 0.2, glide: 440 }); break;
    case 'crunch': for (let i = 0; i < 6; i++) burst(o, t + i * 0.025, { type: 'lowpass', freq: 700, gain: 0.12, r: 0.03 }); break;
    case 'whoosh': burst(o, t, { freq: 400, sweep: 2600, q: 0.8, gain: 0.12, a: 0.06, r: 0.22 }); break;
    case 'common': pluck(o, mtof(76), t, 0.08, 0.5); break;
    case 'uncommon': bell(o, mtof(76), t, 0.07); bell(o, mtof(83), t + 0.1, 0.07); break;
    case 'riser': {
      burst(o, t, { type: 'highpass', freq: 400, sweep: 7000, q: 0.7, gain: 0.08, a: 1.0, r: 0.15 });
      tone(o, 110, t, { type: 'sawtooth', gain: 0.03, a: 1.0, r: 0.1, glide: 880, lp: 2500 });
      [0, 0.25, 0.5, 0.75].forEach((d, i) => tone(o, mtof(50 + i * 4), t + d, { type: 'triangle', gain: 0.05, r: 0.2 }));
      break;
    }
    case 'impact': tone(o, 70, t, { gain: 0.5, a: 0.003, r: 0.7, glide: 38 }); burst(o, t, { type: 'lowpass', freq: 1500, gain: 0.3, r: 0.35 }); bell(o, mtof(88), t, 0.05, 2); break;
    case 'sparkle': for (let i = 0; i < 10; i++) bell(o, mtof(pick([84, 86, 88, 91, 93, 96])), t + i * 0.07, 0.03, 0.8); break;
    case 'fanfare': [[60, 64, 67], [65, 69, 72], [67, 71, 74, 79]].forEach((c, i) => c.forEach((m) => tone(o, mtof(m), t + i * 0.18, { type: 'sawtooth', gain: 0.03, a: 0.02, r: i === 2 ? 1.4 : 0.3, lp: 2200 }))); break;
    case 'holo': for (let i = 0; i < 6; i++) tone(o, mtof(72 + i * 5), t + i * 0.05, { gain: 0.03, a: 0.05, r: 1.2, detune: rnd(-15, 15) }); break;
    case 'collect': [72, 76, 79, 84].forEach((m, i) => pluck(o, mtof(m), t + i * 0.06, 0.06, 0.5)); break;
    default: break;
  }
}
