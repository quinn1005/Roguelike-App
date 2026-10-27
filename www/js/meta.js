// Persistent progression: account XP/levels, talent trees, unlocks, commanders,
// heat (ascension), bestiary and achievements. Saved to localStorage.

import { TOWERS, TOWER_ORDER } from './defs.js';

const KEY = 'neonbastion_meta_v1';
const RUN_KEY = 'neonbastion_run_v1';

// ---------- Themed trees (Offense / Economy / Fortitude) ----------
export const TREES = {
  offense: {
    name: 'Offense', color: '#ff2f5a',
    nodes: [
      { id: 'o_dmg', name: 'Hardened Rounds', max: 5, tier: 0, desc: (r) => `+${3 * r}% tower damage`, apply: (m, r) => { m.dmg += 0.03 * r; } },
      { id: 'o_rate', name: 'Rapid Cycling', max: 5, tier: 1, req: ['o_dmg'], desc: (r) => `+${3 * r}% fire rate`, apply: (m, r) => { m.rate += 0.03 * r; } },
      { id: 'o_crit', name: 'Weak Point Scan', max: 5, tier: 1, req: ['o_dmg'], desc: (r) => `+${2 * r}% crit chance`, apply: (m, r) => { m.crit += 0.02 * r; } },
      { id: 'o_range', name: 'Long Optics', max: 3, tier: 2, req: ['o_rate'], desc: (r) => `+${3 * r}% range`, apply: (m, r) => { m.range += 0.03 * r; } },
      { id: 'o_critdmg', name: 'Lethality', max: 3, tier: 2, req: ['o_crit'], desc: (r) => `+${15 * r}% crit damage`, apply: (m, r) => { m.critMult += 0.15 * r; } },
      { id: 'o_boss', name: 'Giant Killer', max: 3, tier: 3, req: ['o_range', 'o_critdmg'], any: true, desc: (r) => `+${8 * r}% damage to bosses`, apply: (m, r) => { m.bossDmg += 0.08 * r; } },
      { id: 'o_shield', name: 'Shield Piercer', max: 3, tier: 3, req: ['o_critdmg'], desc: (r) => `+${15 * r}% damage to shields`, apply: (m, r) => { m.shieldDmg += 0.15 * r; } },
      { id: 'o_combo', name: 'Synergy Mastery', max: 2, tier: 4, req: ['o_boss', 'o_shield'], any: true, desc: (r) => `Combos +${25 * r}% stronger`, apply: (m, r) => { m.combo += 0.25 * r; } },
    ],
  },
  economy: {
    name: 'Economy', color: '#ffe84a',
    nodes: [
      { id: 'e_start', name: 'Seed Capital', max: 5, tier: 0, desc: (r) => `+${25 * r} starting credits`, apply: (m, r) => { m.startGold += 25 * r; } },
      { id: 'e_kill', name: 'Bounty Contracts', max: 5, tier: 1, req: ['e_start'], desc: (r) => `+${5 * r}% kill credits`, apply: (m, r) => { m.goldMult += 0.05 * r; } },
      { id: 'e_cost', name: 'Supply Chain', max: 5, tier: 1, req: ['e_start'], desc: (r) => `-${2 * r}% tower cost`, apply: (m, r) => { m.cost -= 0.02 * r; } },
      { id: 'e_interest', name: 'Compound Interest', max: 5, tier: 2, req: ['e_kill'], desc: (r) => `+${r}% interest per wave`, apply: (m, r) => { m.interest += 0.01 * r; } },
      { id: 'e_refund', name: 'Recycler', max: 3, tier: 2, req: ['e_cost'], desc: (r) => `+${6 * r}% sell refund`, apply: (m, r) => { m.refund += 0.06 * r; } },
      { id: 'e_wave', name: 'Wave Bonus', max: 3, tier: 3, req: ['e_interest'], desc: (r) => `+${10 * r}% wave clear credits`, apply: (m, r) => { m.waveGold += 0.1 * r; } },
      { id: 'e_shop', name: 'Haggler', max: 3, tier: 3, req: ['e_refund'], desc: (r) => `-${8 * r}% shop prices`, apply: (m, r) => { m.shop -= 0.08 * r; } },
      { id: 'e_choice', name: 'Foresight', max: 1, tier: 4, req: ['e_wave', 'e_shop'], any: true, desc: () => '+1 option on augment picks', apply: (m) => { m.choices += 1; } },
    ],
  },
  fortitude: {
    name: 'Fortitude', color: '#2ef2ff',
    nodes: [
      { id: 'f_hp', name: 'Core Plating', max: 5, tier: 0, desc: (r) => `+${2 * r} core HP`, apply: (m, r) => { m.coreMax += 2 * r; } },
      { id: 'f_slow', name: 'Gravity Well', max: 3, tier: 1, req: ['f_hp'], desc: (r) => `Enemies ${2 * r}% slower`, apply: (m, r) => { m.enemySpeed -= 0.02 * r; } },
      { id: 'f_regen', name: 'Auto-Repair', max: 3, tier: 1, req: ['f_hp'], desc: (r) => `Repair ${r} core HP each wave`, apply: (m, r) => { m.regen += r; } },
      { id: 'f_start', name: 'Supply Drop', max: 1, tier: 2, req: ['f_slow'], desc: () => 'Start runs with a random augment', apply: (m) => { m.startAug += 1; } },
      { id: 'f_emergency', name: 'Last Stand', max: 1, tier: 2, req: ['f_regen'], desc: () => 'Survive one lethal hit per run', apply: (m) => { m.emergency += 1; } },
      { id: 'f_shards', name: 'Shard Magnet', max: 3, tier: 3, req: ['f_start'], desc: (r) => `+${10 * r}% Void Shards earned`, apply: (m, r) => { m.shardMult += 0.1 * r; } },
      { id: 'f_xp', name: 'Veteran', max: 3, tier: 3, req: ['f_emergency'], desc: (r) => `+${10 * r}% XP earned`, apply: (m, r) => { m.xpMult += 0.1 * r; } },
      { id: 'f_reroll', name: 'Fate Weaver', max: 1, tier: 4, req: ['f_shards', 'f_xp'], any: true, desc: () => '+3 free rerolls per run', apply: (m) => { m.rerolls += 3; } },
    ],
  },
};

// ---------- Per-tower trees ----------
const SPECIALS = {
  blaster: ['Double Tap', '15% chance to fire twice', (m) => { m.doubleTap = 0.15; }],
  cannon: ['Shockwave', '+25% blast radius', (m) => { m.t.cannon.splash += 0.25; }],
  cryo: ['Deep Freeze', 'Chill +10% stronger, lasts 50% longer', (m) => { m.chill += 0.1; m.chillDur += 0.5; }],
  tesla: ['Arc Relay', '+1 chain jump', (m) => { m.chainBonus += 1; }],
  nanite: ['Virulent', '+30% poison damage', (m) => { m.poison += 0.3; }],
  railgun: ['Overpenetration', '+1 pierce', (m) => { m.pierce += 1; }],
  drone: ['Reinforcements', '+1 drone per bay', (m) => { m.drones += 1; }],
  miner: ['Deep Veins', '+25% miner income', (m) => { m.miner += 0.25; }],
  amplifier: ['Harmonics', '+5% amplifier buff', (m) => { m.ampBuff += 0.05; }],
  mortar: ['Close Support', '-50% minimum range', (m) => { m.mortarMinMult *= 0.5; }],
  laser: ['Focused Core', '+30% beam ramp', (m) => { m.laserRamp += 0.3; }],
  reclaimer: ['Necro-Weave', 'Husks have +50% HP', (m) => { m.huskHp += 0.5; }],
};
const SECOND = {
  miner: ['Yield', (r) => `+${8 * r}% income`, (m, r) => { m.miner += 0.08 * r; }],
  amplifier: ['Field Gain', (r) => `+${2 * r}% buff`, (m, r) => { m.ampBuff += 0.02 * r; }],
  drone: ['Armor Frames', (r) => `+${12 * r}% drone HP`, (m, r) => { m.droneHp += 0.12 * r; }],
};

export function towerTree(tid) {
  const t = TOWERS[tid];
  const sec = SECOND[tid];
  const sp = SPECIALS[tid];
  return [
    { id: tid + '_dmg', name: 'Calibrated', max: 3, tier: 0, desc: (r) => `+${6 * r}% ${t.name} damage`, apply: (m, r) => { m.t[tid].dmg += 0.06 * r; } },
    sec
      ? { id: tid + '_rate', name: sec[0], max: 3, tier: 1, req: [tid + '_dmg'], desc: sec[1], apply: sec[2] }
      : { id: tid + '_rate', name: 'Tuned', max: 3, tier: 1, req: [tid + '_dmg'], desc: (r) => `+${5 * r}% fire rate`, apply: (m, r) => { m.t[tid].rate += 0.05 * r; } },
    { id: tid + '_cost', name: 'Efficient', max: 3, tier: 1, req: [tid + '_dmg'], desc: (r) => `-${5 * r}% cost`, apply: (m, r) => { m.t[tid].cost -= 0.05 * r; } },
    { id: tid + '_sp', name: sp[0], max: 1, tier: 2, req: [tid + '_rate', tid + '_cost'], any: true, desc: () => sp[1], apply: sp[2] },
  ];
}

// ---------- Commanders ----------
export const COMMANDERS = [
  { id: 'vanguard', name: 'Vanguard', cost: 0, color: '#2ef2ff', desc: '+8% damage to all towers.', apply: (m) => { m.dmg += 0.08; } },
  { id: 'engineer', name: 'Engineer', cost: 40, color: '#ffe84a', sig: 'drone', desc: 'Towers cost 10% less. +60 starting credits. Brings Drone Bays.', apply: (m) => { m.cost -= 0.1; m.startGold += 60; } },
  { id: 'cryomancer', name: 'Cryomancer', cost: 60, color: '#8fe8ff', sig: 'laser', desc: 'Cryo Emitters 30% cheaper, chill +10%. Brings Beam Lasers.', apply: (m) => { m.t.cryo.cost -= 0.3; m.chill += 0.1; } },
  { id: 'biotech', name: 'Biotech', cost: 60, color: '#4dff8a', sig: 'nanite', desc: 'Nanite Sprayers 30% cheaper, poison +25%. Brings Nanites.', apply: (m) => { m.t.nanite.cost -= 0.3; m.poison += 0.25; } },
  { id: 'tycoon', name: 'Tycoon', cost: 80, color: '#ffd23f', sig: 'miner', desc: '+1 credit per kill, miners +30%, but -4 core HP. Brings Miners.', apply: (m) => { m.killGold += 1; m.miner += 0.3; m.coreMax -= 4; } },
  { id: 'warden', name: 'Warden', cost: 80, color: '#3d7bff', sig: 'drone', desc: '+8 core HP, Drone Bays deploy +1 drone. Brings Drone Bays.', apply: (m) => { m.coreMax += 8; m.drones += 1; } },
  { id: 'gunslinger', name: 'Gunslinger', cost: 110, color: '#ff3df2', sig: 'railgun', desc: '+10% crit, Pulse Blasters +15% dmg. Brings Railguns.', apply: (m) => { m.crit += 0.1; m.t.blaster.dmg += 0.15; } },
  { id: 'necromancer', name: 'Necrotech', cost: 140, color: '#b6ff3d', sig: 'reclaimer', desc: 'Revive chance +10%, husks +50% HP. Brings Reclaimers.', apply: (m) => { m.revive += 0.1; m.huskHp += 0.5; } },
];

export const MAX_HEAT = 10;
export function heatInfo(h) {
  return { hp: 1 + 0.1 * h, speed: 1 + 0.02 * h, reward: 1 + 0.15 * h };
}

// ---------- Achievements ----------
export const ACHIEVEMENTS = [
  { id: 'kills100', name: 'First Blood', desc: 'Destroy 100 enemies (total).', shards: 5, check: (meta) => meta.totalKills >= 100 },
  { id: 'kills5k', name: 'Exterminator', desc: 'Destroy 5,000 enemies (total).', shards: 20, check: (meta) => meta.totalKills >= 5000 },
  { id: 'wave10', name: 'Holding the Line', desc: 'Reach wave 10.', shards: 5, check: (m, r) => r && r.wave >= 10 },
  { id: 'wave25', name: 'Bastion', desc: 'Reach wave 25.', shards: 10, check: (m, r) => r && r.wave >= 25 },
  { id: 'wave50', name: 'Unbreakable', desc: 'Reach wave 50.', shards: 25, check: (m, r) => r && r.wave >= 50 },
  { id: 'wave100', name: 'Eternal Bastion', desc: 'Reach wave 100.', shards: 60, check: (m, r) => r && r.wave >= 100 },
  { id: 'boss', name: 'Giant Slayer', desc: 'Destroy a boss.', shards: 5, check: (meta) => Object.keys(meta.bossKills).length >= 1 },
  { id: 'allboss', name: 'Boss Rush', desc: 'Destroy every type of boss.', shards: 25, check: (meta) => Object.keys(meta.bossKills).length >= 5 },
  { id: 'builder', name: 'Architect', desc: 'Build 25 towers in one run.', shards: 5, check: (m, r) => r && r.stats.built >= 25 },
  { id: 'branch', name: 'Specialist', desc: 'Buy a branch upgrade.', shards: 3, check: (m, r) => r && r.stats.branches >= 1 },
  { id: 'combo', name: 'Synergist', desc: 'Trigger 200 combos in one run.', shards: 8, check: (m, r) => r && r.stats.combos >= 200 },
  { id: 'sprawl', name: 'Sprawl', desc: 'Grow the map to 12 chunks.', shards: 8, check: (m, r) => r && r.world.chunks.size >= 12 },
  { id: 'rich', name: 'Tycoon', desc: 'Hold 1,000 credits at once.', shards: 5, check: (m, r) => r && r.stats.maxGold >= 1000 },
  { id: 'heat3', name: 'Feel the Heat', desc: 'Reach wave 20 on Heat 3+.', shards: 20, check: (m, r) => r && r.heat >= 3 && r.wave >= 20 },
];

// ---------- Save data ----------
function fresh() {
  return {
    v: 1, xp: 0, level: 1, shards: 0, talents: {}, unlocked: ['blaster', 'cannon', 'cryo', 'tesla'],
    commanders: ['vanguard'], commander: 'vanguard', heatUnlocked: 0, heat: 0,
    bestWave: 0, totalKills: 0, runs: 0, bestiary: {}, bossKills: {}, achievements: {},
    settings: { sfx: true, shake: true, autoWave: false },
  };
}

export const meta = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch (e) { /* storage unavailable */ }
  return fresh();
}

export function saveMeta() {
  try { localStorage.setItem(KEY, JSON.stringify(meta)); } catch (e) { /* ignore */ }
}

export function resetMeta() {
  const f = fresh();
  for (const k of Object.keys(meta)) delete meta[k];
  Object.assign(meta, f);
  saveMeta();
  clearRun();
}

export function saveRun(data) { try { localStorage.setItem(RUN_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ } }
export function loadRun() { try { const r = localStorage.getItem(RUN_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
export function clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (e) { /* ignore */ } }

// ---------- XP / talent points ----------
export const xpNeed = (lvl) => 80 + lvl * 45;

export function addXp(amount) {
  meta.xp += Math.floor(amount);
  let ups = 0;
  while (meta.xp >= xpNeed(meta.level)) { meta.xp -= xpNeed(meta.level); meta.level++; ups++; }
  return ups;
}

export function pointsTotal() { return meta.level - 1 + 2; } // 2 free points to start
export function pointsSpent() { return Object.values(meta.talents).reduce((a, b) => a + b, 0); }
export function pointsFree() { return pointsTotal() - pointsSpent(); }

export function nodeRank(id) { return meta.talents[id] || 0; }

export function nodeAvailable(node) {
  if (!node.req || !node.req.length) return true;
  const ok = node.req.map((r) => nodeRank(r) > 0);
  return node.any ? ok.some(Boolean) : ok.every(Boolean);
}

export function buyNode(node) {
  if (pointsFree() <= 0 || nodeRank(node.id) >= node.max || !nodeAvailable(node)) return false;
  meta.talents[node.id] = nodeRank(node.id) + 1;
  saveMeta();
  return true;
}

export function respec() { meta.talents = {}; saveMeta(); }

export function allNodes() {
  const out = [];
  for (const tr of Object.values(TREES)) out.push(...tr.nodes);
  for (const tid of TOWER_ORDER) out.push(...towerTree(tid));
  return out;
}

export function baseMods() {
  const t = {};
  for (const id of TOWER_ORDER) t[id] = { dmg: 0, rate: 0, cost: 0, splash: 0 };
  return {
    dmg: 0, rate: 0, range: 0, crit: 0.03, critMult: 2, cost: 0, killGold: 0, goldMult: 1, interest: 0,
    refund: 0.7, coreMax: 20, enemySpeed: 0, shieldDmg: 0, execute: 0, combo: 1, emergency: 0,
    spawnSlow: 0, choices: 3, eliteGold: 1, bossDmg: 0, chainBonus: 0, splash: 0, brittle: 0,
    poison: 0, poisonDur: 0, pierce: 0, drones: 0, miner: 0, ampRange: 0, ampBuff: 0, mortarMin: 1,
    mortarMinMult: 1, laserRamp: 0, revive: 0, huskHp: 0, chill: 0, chillDur: 0, doubleTap: 0,
    droneHp: 0, startGold: 180, waveGold: 1, shop: 1, regen: 0, startAug: 0, shardMult: 1,
    xpMult: 1, rerolls: 1, hpMult: 1, t,
  };
}

// Builds the run's starting mods from talents + commander.
export function buildRunMods(commanderId) {
  const m = baseMods();
  for (const node of allNodes()) {
    const r = nodeRank(node.id);
    if (r > 0) node.apply(m, r);
  }
  const cmd = COMMANDERS.find((c) => c.id === commanderId) || COMMANDERS[0];
  cmd.apply(m);
  return m;
}

export function checkAchievements(run) {
  const got = [];
  for (const a of ACHIEVEMENTS) {
    if (meta.achievements[a.id]) continue;
    if (a.check(meta, run)) {
      meta.achievements[a.id] = Date.now();
      meta.shards += a.shards;
      got.push(a);
    }
  }
  if (got.length) saveMeta();
  return got;
}
