// Procedural synthwave soundtrack (WebAudio, no files). One track per neon
// sector. The music clock is the game's beat clock: drops and breakdowns land
// exactly where you hear them.

import { audioCtx } from './audio.js';

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
// Chords are MIDI roots + quality ('m' minor, 'M' major).
export const TRACKS = [
  { name: 'Magenta Rim', bpm: 100, prog: [[57, 'm'], [53, 'M'], [48, 'M'], [55, 'M']] },
  { name: 'Cyan Drift', bpm: 108, prog: [[52, 'm'], [48, 'M'], [55, 'M'], [50, 'M']] },
  { name: 'Toxic Belt', bpm: 116, prog: [[50, 'm'], [51, 'M'], [50, 'm'], [48, 'M']] },
  { name: 'Solar Forge', bpm: 124, prog: [[48, 'm'], [56, 'M'], [51, 'M'], [58, 'M']] },
  { name: 'Void Reach', bpm: 132, prog: [[54, 'm'], [50, 'M'], [57, 'M'], [52, 'M']] },
];
export const MENU_TRACK = { name: 'Bastion', bpm: 92, prog: [[57, 'm'], [53, 'M'], [48, 'M'], [52, 'm']], calm: true };

// Sector N (0-based) plays track N, cycling, getting a little faster each lap.
export function trackFor(sector) {
  const t = TRACKS[sector % TRACKS.length];
  return { ...t, bpm: Math.min(160, t.bpm + 6 * Math.floor(sector / TRACKS.length)) };
}

// A song cycle is 8 bars (32 beats). The last bar is the DROP.
export const CYCLE = 32;
export const DROP_AT = 28;

let on = true, out = null, cur = null, start = 0, nextBeat = 0, timer = null, mode = () => 'normal';
let noiseBuf = null;

export function setMusic(v) { on = v; if (out) out.gain.value = on ? 0.16 : 0; }
// mode() tells the music what the game is doing: 'normal', 'drop' or 'breakdown'.
export function setMusicMode(fn) { mode = fn; }

function ctx() { return audioCtx(); }

// Start (or switch to) a track so that `fromBeat` is now.
export function playTrack(track, fromBeat = 0) {
  const ac = ctx();
  if (!ac) { cur = track; return; }
  if (!out) { out = ac.createGain(); out.gain.value = on ? 0.16 : 0; out.connect(ac.destination); }
  cur = track;
  start = ac.currentTime + 0.05 - fromBeat * 60 / track.bpm;
  nextBeat = Math.ceil(fromBeat * 4) / 4;
  if (!timer) timer = setInterval(schedule, 25);
}

// Current position in beats, or null when no audio is running.
export function musicBeats() {
  const ac = ctx();
  if (!ac || !cur || !timer || ac.state !== 'running') return null;
  return (ac.currentTime - start) * cur.bpm / 60;
}
export function currentTrack() { return cur; }

function schedule() {
  const ac = ctx();
  if (!ac || !cur || ac.state !== 'running') return;
  const spb = 60 / cur.bpm;
  const ahead = ac.currentTime + 0.12;
  while (start + nextBeat * spb < ahead) {
    playStep(nextBeat, start + nextBeat * spb, spb);
    nextBeat += 0.25;
  }
}

function osc(type, f, t, dur, vol, dest = out, glide = null) {
  const ac = ctx();
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + dur + 0.02);
}

function lp(t, f0, f1, dur) {
  const ac = ctx();
  const fl = ac.createBiquadFilter();
  fl.type = 'lowpass';
  fl.frequency.setValueAtTime(f0, t);
  fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  fl.connect(out);
  return fl;
}

function hit(t, dur, vol, f, type = 'highpass') {
  const ac = ctx();
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ac.createBufferSource(); s.buffer = noiseBuf;
  const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f;
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(out);
  s.start(t); s.stop(t + dur + 0.02);
}

function chordNotes([root, q]) { return [root, root + (q === 'm' ? 3 : 4), root + 7]; }

// One sixteenth-note step of the song.
function playStep(b, t, spb) {
  const step = Math.round(b * 4);
  const s16 = step % 4, beat = Math.floor(b), inBar = beat % 4, cyc = ((beat % CYCLE) + CYCLE) % CYCLE;
  const chord = cur.prog[Math.floor(cyc / 4) % cur.prog.length];
  const notes = chordNotes(chord);
  const m = mode(cyc);
  const drop = m === 'drop', brk = m === 'breakdown', calm = cur.calm;
  const build = !calm && cyc >= DROP_AT - 4 && cyc < DROP_AT;
  // drums
  if (!calm && !brk) {
    if (s16 === 0) osc('sine', 150, t, 0.22, drop ? 0.9 : 0.7, out, 40);
    if (s16 === 0 && (inBar === 1 || inBar === 3)) hit(t, 0.16, 0.35, 1800, 'bandpass');
    if (s16 === 2 || drop) hit(t, 0.04, drop ? 0.12 : 0.08, 7000);
    if (build && s16 % 2 === 0) hit(t, 0.06, 0.05 + (cyc - (DROP_AT - 4)) * 0.03, 2500, 'bandpass');
  }
  if (brk && s16 === 0 && inBar === 0) osc('sine', 90, t, 0.6, 0.6, out, 30);
  // bass: eighth notes on the chord root
  if (s16 % 2 === 0 && !(calm && s16 !== 0)) {
    const n = chord[0] - 12 + (s16 === 2 && inBar % 2 ? 12 : 0);
    osc('sawtooth', NOTE(n), t, spb * 0.45, brk ? 0.18 : 0.22, lp(t, drop ? 1600 : 700, 200, spb * 0.45));
  }
  // arpeggio: sixteenths up through the chord
  if (!brk) {
    const n = notes[step % 3] + 12 + (step % 6 >= 3 ? 12 : 0);
    osc('square', NOTE(n), t, spb * 0.2, calm ? 0.04 : drop ? 0.07 : 0.05, lp(t, 2600, 900, spb * 0.2));
  }
  // pad: a soft detuned chord every bar
  if (step % 16 === 0) {
    for (const n of notes) for (const det of [-0.06, 0.06]) osc('sawtooth', NOTE(n + 12) * (1 + det / 12), t, spb * 4, brk ? 0.05 : 0.03, lp(t, brk ? 1800 : 1200, 400, spb * 4));
  }
  // lead melody only on the drop
  if (drop && s16 % 2 === 0) {
    const mel = [2, 1, 0, 1, 2, 2, 1, 0];
    const n = notes[mel[(step / 2) % mel.length]] + 24;
    osc('sawtooth', NOTE(n), t, spb * 0.45, 0.06, lp(t, 4000, 1200, spb * 0.45));
  }
}
