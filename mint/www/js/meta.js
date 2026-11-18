// Things that live outside a single run: save slots, what carries into New Game+, the
// "what's new" note after an update, and checking whether a newer version is out.
import { VERSION } from './version.js';

const KEYS = ['mint-condition-save-v2', 'mint-condition-save-v2-s2', 'mint-condition-save-v2-s3'];
const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } };
const del = (k) => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };

// ---------------------------------------------------------------- save slots
export const SLOTS = KEYS.length;
export const currentSlot = () => { const n = +get('mint-slot'); return n >= 0 && n < SLOTS ? n : 0; };
export const setSlot = (i) => put('mint-slot', String(i));
export const slotKey = (i = currentSlot()) => KEYS[i];
export function readSlot(i) { try { const s = get(KEYS[i]); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
export const writeSlot = (i, S) => put(KEYS[i], JSON.stringify(S));
export const clearSlot = (i) => del(KEYS[i]);

// ---------------------------------------------------------------- across runs
const META = 'mint-meta';
export function meta() { try { return { ngUnlocked: 0, codex: {}, runs: 0, ...JSON.parse(get(META) || '{}') }; } catch (e) { return { ngUnlocked: 0, codex: {}, runs: 0 }; } }
export function setMeta(patch) { const m = { ...meta(), ...patch }; put(META, JSON.stringify(m)); return m; }

// ---------------------------------------------------------------- versions
export const cmpVer = (a, b) => {
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
};
// The "what's new" note shows once after each update (not on a first ever launch).
export function unseenVersion() {
  const seen = get('mint-seen-version');
  if (!seen) { put('mint-seen-version', VERSION); return null; }
  return cmpVer(VERSION, seen) > 0 ? seen : null;
}
export const markSeen = () => put('mint-seen-version', VERSION);

const LIVE = 'https://quinn1005.github.io/Roguelike-App/mint-condition/play/js/version.js';
export const isApp = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
export const releaseUrl = (v) => `https://github.com/quinn1005/Roguelike-App/releases/tag/mint-v${v}`;
// Ask the live site which version is current. Resolves to the newer version string, or null.
export async function newerVersion() {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 5000);
    const res = await fetch(`${LIVE}?t=${Date.now()}`, { cache: 'no-store', signal: ctl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const m = (await res.text()).match(/VERSION\s*=\s*'([\d.]+)'/);
    return m && cmpVer(m[1], VERSION) > 0 ? m[1] : null;
  } catch (e) { return null; }
}
