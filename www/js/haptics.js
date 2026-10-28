// Vibration feedback: uses the native Capacitor Haptics plugin inside the
// Android app, falling back to the web Vibration API.

import { meta } from './meta.js';

const PATTERNS = { tap: 10, light: 20, medium: 40, heavy: 80, over: [120, 60, 200] };
const STYLE = { tap: 'LIGHT', light: 'LIGHT', medium: 'MEDIUM', heavy: 'HEAVY', over: 'HEAVY' };
let last = 0;

export function haptic(kind) {
  if (!meta.settings.haptics) return;
  const now = performance.now();
  if (kind !== 'over' && now - last < 60) return; // don't buzz constantly
  last = now;
  try {
    const H = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
    if (H) {
      if (kind === 'over') H.vibrate({ duration: 300 }).catch(() => {});
      else H.impact({ style: STYLE[kind] || 'LIGHT' }).catch(() => {});
      return;
    }
    if (navigator.vibrate) navigator.vibrate(PATTERNS[kind] || 20);
  } catch (e) { /* not supported */ }
}
