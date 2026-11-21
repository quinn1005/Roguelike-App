// Four lighting moods, used as times of day.
import { hex, mix } from './util.js';

const RAW = [
  { id: 'morning', name: 'Morning', key: '#fff0cf', amb: '#8096c4', rim: '#ffd38a', win: '#fff3c4', sky: '#9fd3ee', fog: '#d9cdb8', wall: '#f0e2c6', floor: '#9fd2bb', steel: '#d9dee3', slime: '#8fe28a', fabric: '#e98a68', cat: '#f2e2c2', egg: '#ddcaa9', accent: '#ef8a5c', ambLevel: 0.4 },
  { id: 'fluoro', name: 'Clinic hours', key: '#e8fbff', amb: '#2f4e5c', rim: '#9af0ff', win: '#d9f3ff', sky: '#7fb6cf', fog: '#1a333d', wall: '#cfe4dd', floor: '#8db5ad', steel: '#c3ced6', slime: '#a3f2ab', fabric: '#4f82d4', cat: '#e8e7e1', egg: '#d2c9b8', accent: '#5fd3ea', ambLevel: 0.33 },
  { id: 'night', name: 'Late shift', key: '#ffc45c', amb: '#3b2b5e', rim: '#6fe6be', win: '#9db8ff', sky: '#0d0a18', fog: '#1d1530', wall: '#a3a878', floor: '#71857a', steel: '#b9c1c9', slime: '#86e07c', fabric: '#d24c3f', cat: '#eadcae', egg: '#d2c2a4', accent: '#f2b13a', ambLevel: 0.2 },
  { id: 'cursed', name: 'After hours', key: '#ff9c4d', amb: '#2b1842', rim: '#e35dff', win: '#a374ff', sky: '#0c0617', fog: '#23123b', wall: '#6f5f90', floor: '#4c4169', steel: '#8e88ad', slime: '#c4f25e', fabric: '#8f2d5d', cat: '#3c3550', egg: '#958aab', accent: '#e35dff', ambLevel: 0.13 },
];
const KEYS = ['key', 'amb', 'rim', 'win', 'sky', 'fog', 'wall', 'floor', 'steel', 'slime', 'fabric', 'cat', 'egg', 'accent'];
export const THEMES = {};
for (const r of RAW) {
  const th = { ...r, hex: {} };
  for (const k of KEYS) { th.hex[k] = r[k]; th[k] = hex(r[k]); }
  th.paper = mix([240, 232, 214], th.key, 0.12);
  THEMES[r.id] = th;
}
// The clinic's light follows the clock: morning sun, then fluorescent tubes, then the late shift.
export function themeAt(minute) {
  if (minute < 11 * 60) return THEMES.morning;
  if (minute < 15 * 60 + 30) return THEMES.fluoro;
  return THEMES.night;
}
