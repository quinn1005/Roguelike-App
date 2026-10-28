// Tiny chiptune-style sound effects synthesized with WebAudio (no audio files).

let ac = null;
let master = null;
let enabled = true;
const last = {};

export function setSfx(on) { enabled = on; }

export function unlockAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = 0.18;
    master.connect(ac.destination);
  } catch (e) { ac = null; }
}

function tone({ type = 'square', f0 = 440, f1 = f0, dur = 0.08, vol = 0.5, delay = 0 }) {
  const t = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

let noiseBuf = null;
function noise({ dur = 0.2, vol = 0.5, f = 1200, delay = 0 }) {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + delay;
  const s = ac.createBufferSource();
  s.buffer = noiseBuf;
  const fl = ac.createBiquadFilter();
  fl.type = 'lowpass';
  fl.frequency.setValueAtTime(f, t);
  fl.frequency.exponentialRampToValueAtTime(80, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(master);
  s.start(t); s.stop(t + dur);
}

const SFX = {
  shoot: () => tone({ f0: 880, f1: 440, dur: 0.05, vol: 0.15 }),
  cryo: () => tone({ type: 'triangle', f0: 1400, f1: 900, dur: 0.07, vol: 0.15 }),
  cannon: () => { noise({ dur: 0.15, vol: 0.3, f: 900 }); tone({ f0: 160, f1: 60, dur: 0.12, vol: 0.2 }); },
  glob: () => tone({ type: 'sine', f0: 300, f1: 600, dur: 0.08, vol: 0.2 }),
  mortar: () => tone({ type: 'sawtooth', f0: 220, f1: 90, dur: 0.2, vol: 0.18 }),
  boom: () => noise({ dur: 0.25, vol: 0.35, f: 1400 }),
  zap: () => { tone({ type: 'sawtooth', f0: 1800, f1: 300, dur: 0.09, vol: 0.12 }); noise({ dur: 0.06, vol: 0.12, f: 4000 }); },
  rail: () => { tone({ type: 'square', f0: 2400, f1: 120, dur: 0.18, vol: 0.18 }); },
  laser: () => tone({ type: 'sine', f0: 1200, f1: 1150, dur: 0.06, vol: 0.05 }),
  die: () => tone({ f0: 300, f1: 80, dur: 0.08, vol: 0.12 }),
  bossdie: () => { noise({ dur: 0.8, vol: 0.5, f: 2000 }); tone({ type: 'sawtooth', f0: 400, f1: 40, dur: 0.8, vol: 0.3 }); },
  build: () => { tone({ f0: 440, dur: 0.05, vol: 0.2 }); tone({ f0: 660, dur: 0.06, vol: 0.2, delay: 0.05 }); },
  upgrade: () => { [523, 659, 784, 1046].forEach((f, i) => tone({ f0: f, dur: 0.06, vol: 0.18, delay: i * 0.05 })); },
  sell: () => { tone({ f0: 660, dur: 0.05, vol: 0.2 }); tone({ f0: 440, dur: 0.06, vol: 0.2, delay: 0.05 }); },
  coin: () => { tone({ f0: 988, dur: 0.05, vol: 0.2 }); tone({ f0: 1318, dur: 0.1, vol: 0.2, delay: 0.05 }); },
  leak: () => { tone({ type: 'sawtooth', f0: 200, f1: 60, dur: 0.25, vol: 0.3 }); },
  alarm: () => { for (let i = 0; i < 3; i++) { tone({ type: 'square', f0: 440, f1: 660, dur: 0.18, vol: 0.2, delay: i * 0.3 }); } },
  emp: () => { tone({ type: 'sine', f0: 80, f1: 1200, dur: 0.3, vol: 0.25 }); },
  clear: () => { [392, 523, 659].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.12, vol: 0.25, delay: i * 0.08 })); },
  expand: () => { tone({ type: 'triangle', f0: 200, f1: 800, dur: 0.35, vol: 0.25 }); },
  lose: () => { [392, 330, 262, 196].forEach((f, i) => tone({ type: 'square', f0: f, dur: 0.25, vol: 0.25, delay: i * 0.2 })); },
  click: () => tone({ f0: 1200, dur: 0.03, vol: 0.12 }),
  strumE: () => { const r = [164.8, 207.7, 246.9, 329.6][Math.floor(Math.random() * 4)]; [1, 1.26, 1.5].forEach((m, i) => tone({ type: 'sawtooth', f0: r * m, f1: r * m * 0.99, dur: 0.25, vol: 0.09, delay: i * 0.012 })); },
  strumA: () => { const r = [130.8, 146.8, 174.6, 196][Math.floor(Math.random() * 4)]; [1, 1.26, 1.5, 2].forEach((m, i) => tone({ type: 'triangle', f0: r * m, f1: r * m, dur: 0.45, vol: 0.12, delay: i * 0.02 })); },
  puff: () => noise({ dur: 0.4, vol: 0.12, f: 900 }),
  poof: () => { noise({ dur: 0.35, vol: 0.25, f: 2500 }); tone({ type: 'triangle', f0: 400, f1: 1200, dur: 0.3, vol: 0.15 }); },
  buster: () => { tone({ type: 'square', f0: 880, f1: 1760, dur: 0.06, vol: 0.18 }); tone({ type: 'square', f0: 1320, f1: 660, dur: 0.08, vol: 0.12, delay: 0.05 }); },
  thwip: () => { noise({ dur: 0.12, vol: 0.2, f: 5000 }); tone({ type: 'sine', f0: 1800, f1: 600, dur: 0.12, vol: 0.1 }); },
  gbBeep: () => tone({ type: 'square', f0: [523, 659, 784, 1046][Math.floor(Math.random() * 4)], dur: 0.07, vol: 0.1 }),
  portal: () => { tone({ type: 'sine', f0: 200, f1: 900, dur: 0.4, vol: 0.2 }); noise({ dur: 0.3, vol: 0.08, f: 3000, delay: 0.05 }); },
  pick: () => { tone({ f0: 784, dur: 0.06, vol: 0.2 }); tone({ f0: 1175, dur: 0.12, vol: 0.2, delay: 0.06 }); },
};

const MIN_GAP = { shoot: 0.05, cryo: 0.06, zap: 0.06, laser: 0.12, die: 0.04, boom: 0.06, glob: 0.06, rail: 0.05, cannon: 0.06, mortar: 0.08 };

export function sfx(name) {
  if (!enabled || !ac || !SFX[name]) return;
  const now = ac.currentTime;
  if (last[name] && now - last[name] < (MIN_GAP[name] || 0.02)) return;
  last[name] = now;
  try { SFX[name](); } catch (e) { /* ignore */ }
}
