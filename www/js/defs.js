// Game content definitions. Distances are in world pixels (16 px per tile).

// ---------------- Towers ----------------
// Branches unlock at level 3 -> 4. Each branch sets flags that combat code reads.
export const TOWERS = {
  blaster: {
    id: 'blaster', name: 'Pulse Blaster', color: '#2ef2ff', cost: 70, unlock: 0,
    desc: 'Rapid single-target kinetic bolts.',
    dmg: 5, rate: 2.9, range: 44, dtype: 'kin', proj: 'bolt', projSpeed: 230,
    branches: {
      A: { name: 'Scatter Array', desc: 'Fires at 3 targets at once.', multi: 3 },
      B: { name: 'Piercer', desc: 'Bolts pierce through 2 enemies. +15% dmg.', pierce: 2, dmgMult: 1.15 },
    },
  },
  cannon: {
    id: 'cannon', name: 'Plasma Cannon', color: '#ff8a1f', cost: 115, unlock: 4,
    desc: 'Explosive plasma shells with splash damage.',
    dmg: 18, rate: 0.8, range: 46, dtype: 'exp', proj: 'shell', projSpeed: 150, splash: 18,
    branches: {
      A: { name: 'Cluster Shells', desc: 'Each blast scatters 3 mini-bombs.', cluster: 3 },
      B: { name: 'Nova Core', desc: '+70% blast radius, +30% dmg.', splashMult: 1.7, dmgMult: 1.3 },
    },
  },
  cryo: {
    id: 'cryo', name: 'Cryo Emitter', color: '#8fe8ff', cost: 90, unlock: 3,
    desc: 'Chills enemies, slowing them down.',
    dmg: 6, rate: 1.2, range: 40, dtype: 'cry', proj: 'bolt', projSpeed: 170, splash: 10,
    slow: 0.5, slowDur: 2,
    branches: {
      A: { name: 'Absolute Zero', desc: '20% chance to freeze solid for 1s.', freeze: 0.2 },
      B: { name: 'Blizzard', desc: 'Constant aura chills everything in range. Frost outlines cloaked enemies so it can see them.', aura: true, detect: true },
    },
  },
  tesla: {
    id: 'tesla', name: 'Tesla Coil', color: '#ffe84a', cost: 140, unlock: 6, rotates: false,
    desc: 'Lightning chains between enemies. Shocks targets. Sees cloaked enemies.',
    dmg: 25, rate: 1, range: 40, dtype: 'eng', proj: 'chain', chains: 3, chainRange: 36, detect: true,
    branches: {
      A: { name: 'Storm Lattice', desc: '+4 chain jumps.', chainBonus: 4 },
      B: { name: 'Overload', desc: '25% chance to stun for 0.7s.', stun: 0.25 },
    },
  },
  nanite: {
    id: 'nanite', name: 'Nanite Sprayer', color: '#4dff8a', cost: 100, unlock: 30,
    desc: 'Corrosive nanite globs that poison in an area.',
    dmg: 4, rate: 1.1, range: 40, dtype: 'bio', proj: 'glob', projSpeed: 140, splash: 16,
    poison: 12, poisonDur: 4,
    branches: {
      A: { name: 'Plague', desc: 'Poison spreads when a victim dies.', plague: true },
      B: { name: 'Corrode', desc: 'Poisoned enemies take +25% dmg and lose armor.', corrode: true },
    },
  },
  railgun: {
    id: 'railgun', name: 'Railgun', color: '#ff3df2', cost: 180, unlock: 60,
    desc: 'Extreme range, huge single hits. Crits often.',
    dmg: 47, rate: 0.35, range: 104, dtype: 'kin', proj: 'rail', crit: 0.1,
    branches: {
      A: { name: 'Assassin', desc: '+25% crit, crits x3. Executes non-bosses under 15%. Thermal scope sees cloaked enemies.', critBonus: 0.25, critMult: 3, execute: 0.15, detect: true },
      B: { name: 'Penetrator', desc: 'Slug pierces every enemy in a line.', pierce: 99 },
    },
  },
  drone: {
    id: 'drone', name: 'Drone Bay', color: '#3d7bff', cost: 130, unlock: 45, rotates: false,
    desc: 'Deploys drones that lock onto enemies near the bay and hunt them down.',
    range: 36, drones: 2, droneHp: 160, droneDmg: 18, droneRate: 1.5, dtype: 'kin', proj: 'none',
    branches: {
      A: { name: 'Hunter Frames', desc: 'Drones deal +80% damage and fly 40% faster.', droneDmgMult: 1.8, droneSpeed: 1.4 },
      B: { name: 'Swarm Protocol', desc: 'Deploys 4 drones.', dronesBonus: 2 },
    },
  },
  miner: {
    id: 'miner', name: 'Credit Miner', color: '#ffd23f', cost: 160, unlock: 50, rotates: false,
    desc: 'Generates credits at the end of every wave.',
    range: 0, income: 45, proj: 'none',
    branches: {
      A: { name: 'Bank Node', desc: '+4% interest on held credits (max 80).', bank: 0.04 },
      B: { name: 'Shard Extractor', desc: '+1 Void Shard every wave.', shards: 1 },
    },
  },
  amplifier: {
    id: 'amplifier', name: 'Amplifier Pylon', color: '#a466ff', cost: 130, unlock: 75, rotates: false,
    desc: 'Boosts damage of nearby towers by 35%.',
    range: 44, buff: 0.35, proj: 'none',
    branches: {
      A: { name: 'Overclock', desc: 'Nearby towers also fire 25% faster.', buffRate: 0.25 },
      B: { name: 'Targeting Array', desc: 'Nearby towers +15% range, +10% crit. Reveals cloaked.', buffRange: 0.15, buffCrit: 0.1 },
    },
  },
  mortar: {
    id: 'mortar', name: 'Orbital Mortar', color: '#ff5533', cost: 170, unlock: 90,
    desc: 'Huge range artillery. Has a minimum range. Cannot hit flyers.',
    dmg: 100, rate: 0.5, range: 132, minRange: 24, dtype: 'exp', proj: 'mortar', splash: 32, ground: true,
    branches: {
      A: { name: 'Carpet Barrage', desc: 'Fires 3 shells per volley. Orbital spotting sees cloaked enemies.', volley: 3, detect: true },
      B: { name: 'Napalm', desc: 'Blasts leave burning fields.', napalm: true },
    },
  },
  laser: {
    id: 'laser', name: 'Beam Laser', color: '#ff2fa0', cost: 190, unlock: 120,
    desc: 'Continuous beam. Damage ramps up on the same target. Sees cloaked enemies.',
    dmg: 19, rate: 1, range: 48, dtype: 'eng', proj: 'beam', ramp: 4, rampTime: 3, detect: true,
    branches: {
      A: { name: 'Prism Split', desc: 'Beam splits to 2 extra targets.', prism: 2 },
      B: { name: 'Melter', desc: 'Ramps to x8, twice as fast.', rampMult: 2, rampSpeed: 2 },
    },
  },
  reclaimer: {
    id: 'reclaimer', name: 'Reclaimer', color: '#b6ff3d', cost: 170, unlock: 150, rotates: false,
    desc: 'Enemies that die in range may rise as allied husks.',
    dmg: 38, rate: 1, range: 44, dtype: 'bio', proj: 'orb', projSpeed: 110, revive: 0.4,
    branches: {
      A: { name: 'Legion', desc: '60% revive chance, husks are tougher.', reviveBonus: 0.2, husk: 2 },
      B: { name: 'Siphon', desc: 'Kills in range grant +3 credits.', siphon: 3 },
    },
  },
  blackhole: {
    id: 'blackhole', name: 'Black Hole Cannon', color: '#b36bff', cost: 210, unlock: 180,
    desc: 'Lobs black holes onto the track that pull in, hold and crush enemies.',
    dmg: 26, rate: 0.3, range: 56, dtype: 'eng', proj: 'hole', projSpeed: 120, holeR: 18, holeDur: 2.5,
    credit: 'Designed by Levi',
    branches: {
      A: { name: 'Supermassive Collapse', desc: 'Holes implode when they close, blasting everything nearby. Bigger blast for every enemy held.', collapse: true },
      B: { name: 'Wormhole', desc: '+25% hole size. When a hole closes, everything inside is flung back toward its portal, hit hard, and Rift-Torn: +35% damage taken from all towers for 4s.', wormhole: 4, holeMult: 1.25, riftHit: 8 },
    },
  },
};

// Fused towers: made by fusing two max-level towers that sit side by side.
// They are never built directly. `fx` works like a branch's flags.
Object.assign(TOWERS, {
  arclance: {
    id: 'arclance', name: 'Arc Lance', color: '#fff36a', cost: 420, fused: true,
    desc: 'Tesla + Laser. A ramping lightning beam that forks to 3 extra targets and shocks.',
    dmg: 55, rate: 1, range: 60, dtype: 'eng', proj: 'beam', ramp: 5, rampTime: 2.5, fx: { prism: 3, shockBeam: true, detect: true },
  },
  frostfire: {
    id: 'frostfire', name: 'Frostfire Cannon', color: '#8fe8ff', cost: 380, fused: true,
    desc: 'Cryo + Cannon. Huge cluster blasts that deep-chill everything they hit.',
    dmg: 110, rate: 0.9, range: 54, dtype: 'exp', proj: 'shell', projSpeed: 170, splash: 30, slow: 0.4, slowDur: 2.2, fx: { cluster: 3 },
  },
  plaguemortar: {
    id: 'plaguemortar', name: 'Plague Mortar', color: '#9bff3a', cost: 420, fused: true,
    desc: 'Nanite + Mortar. Twin toxic shells that poison and leave burning fields.',
    dmg: 140, rate: 0.45, range: 140, minRange: 32, dtype: 'exp', proj: 'mortar', splash: 30, ground: true,
    poison: 40, poisonDur: 5, fx: { napalm: true, volley: 2 },
  },
  stormrail: {
    id: 'stormrail', name: 'Storm Rail', color: '#ff3df2', cost: 480, fused: true,
    desc: 'Railgun + Tesla. Piercing slugs that arc lightning off every enemy they hit.',
    dmg: 380, rate: 0.4, range: 124, dtype: 'kin', proj: 'rail', crit: 0.2, fx: { pierce: 3, chainOnHit: 3, detect: true },
  },
  quasar: {
    id: 'quasar', name: 'Quasar', color: '#7fd8ff', cost: 520, fused: true,
    desc: 'Black Hole + Tesla. Huge singularities that hurl lightning at every enemy around them while they are open.',
    dmg: 60, rate: 0.3, range: 72, dtype: 'eng', proj: 'hole', projSpeed: 140, holeR: 24, holeDur: 3.5, fx: { quasar: true, shockBeam: true, detect: true },
  },
  goldpylon: {
    id: 'goldpylon', name: 'Golden Pylon', color: '#ffd23f', cost: 420, fused: true, rotates: false,
    desc: 'Miner + Amplifier. Boosts nearby towers and mints credits every wave.',
    range: 44, buff: 0.2, income: 140, proj: 'none', fx: { buffRate: 0.15 },
  },
});

export const TOWER_ORDER = Object.keys(TOWERS).filter((id) => !TOWERS[id].fused);

export const FUSIONS = [
  { id: 'arclance', a: 'tesla', b: 'laser' },
  { id: 'frostfire', a: 'cryo', b: 'cannon' },
  { id: 'plaguemortar', a: 'nanite', b: 'mortar' },
  { id: 'stormrail', a: 'railgun', b: 'tesla' },
  { id: 'goldpylon', a: 'miner', b: 'amplifier' },
  { id: 'quasar', a: 'blackhole', b: 'tesla' },
];

// Single-tower relics. Each tower can hold one.
export const RELICS = [
  { id: 'overcharger', name: 'Overcharger', color: '#ff2f5a', desc: '+40% damage.' },
  { id: 'coils', name: 'Rapid Coils', color: '#ffe84a', desc: '+35% fire rate.' },
  { id: 'lens', name: 'Lens of Reach', color: '#2ef2ff', desc: '+30% range.' },
  { id: 'ricochet', name: 'Ricochet Core', color: '#ff8a1f', desc: 'Every hit also strikes a nearby enemy for 50%.' },
  { id: 'frostshell', name: 'Frost Shell', color: '#8fe8ff', desc: 'Hits chill enemies by 25%.' },
  { id: 'toxic', name: 'Toxic Rounds', color: '#4dff8a', desc: 'Hits poison for 25% of their damage per second.' },
  { id: 'bounty', name: 'Bounty Chip', color: '#ffd23f', desc: 'Kills by this tower give +3 credits.' },
  { id: 'medal', name: 'Veteran Medal', color: '#e6f6ff', desc: 'Kills count double toward veterancy.' },
  { id: 'sensor', name: 'Sensor Beacon', color: '#7dffd9', desc: 'This tower and every tower touching it (including diagonals) can see cloaked enemies.' },
];
export const RELIC_BY_ID = Object.fromEntries(RELICS.map((r) => [r.id, r]));

// Tower veterancy ranks earned from kills during a run.
export const VETERANCY = [
  { kills: 25, name: 'Bronze', color: '#cd7f32', dmg: 0.05, rate: 0, range: 0 },
  { kills: 100, name: 'Silver', color: '#c0c8d8', dmg: 0.1, rate: 0.05, range: 0 },
  { kills: 300, name: 'Gold', color: '#ffd23f', dmg: 0.2, rate: 0.1, range: 0.05 },
];

// Tower mastery skins, unlocked by total kills with that tower across all runs.
export const SKINS = [
  { id: 'default', name: 'Standard', kills: 0 },
  { id: 'neon', name: 'Neon', kills: 3000 },
  { id: 'gold', name: 'Gold', kills: 12000 },
];

// Optional run mutators: harder runs for more XP and shards.
export const MUTATORS = [
  { id: 'scorched', name: 'Scorched Earth', desc: 'Towers cannot be sold.', bonus: 0.15 },
  { id: 'shroud', name: 'Shroud', desc: 'Every enemy is cloaked. Bring towers with detection.', bonus: 0.3 },
  { id: 'surge', name: 'Swarm Surge', desc: '+50% enemies every wave.', bonus: 0.3 },
  { id: 'glass', name: 'Glass Core', desc: 'Core max HP is 5.', bonus: 0.35 },
  { id: 'inflation', name: 'Inflation', desc: 'Towers and upgrades cost 30% more.', bonus: 0.2 },
  { id: 'plated', name: 'Armored Tide', desc: 'All enemies gain +4 armor.', bonus: 0.25 },
  { id: 'haste', name: 'Haste', desc: 'Enemies move 20% faster.', bonus: 0.25 },
  { id: 'famine', name: 'Famine', desc: 'No interest, wave bonus halved.', bonus: 0.2 },
];

// Commander active abilities (unlocked in each commander's skill tree).
// `cd` is measured in waves: after use, the ability recharges as waves end.
export const ABILITIES = {
  airstrike: { name: 'Airstrike', cd: 2, color: '#2ef2ff', desc: 'Hits the 5 enemies closest to the core for 30% of their HP (6% on bosses).' },
  rally: { name: 'Rally', cd: 2, color: '#2ef2ff', desc: 'All towers fire 30% faster for 8s.' },
  lance: { name: 'Orbital Lance', cd: 4, color: '#2ef2ff', desc: 'Blasts the strongest enemy for 35% of its HP (12% on bosses).' },
  repair: { name: 'Patch Job', cd: 3, color: '#ffe84a', desc: 'Repair 3 core HP.' },
  overdrive: { name: 'Overdrive', cd: 3, color: '#ffe84a', desc: 'All towers deal +50% damage for 6s.' },
  refund: { name: 'Salvage Op', cd: 5, color: '#ffe84a', desc: 'Gain credits equal to 8% of everything you have built.' },
  freeze: { name: 'Flash Freeze', cd: 2, color: '#8fe8ff', desc: 'Freezes every enemy for 2.5s (bosses 0.8s).' },
  blizzard: { name: 'Blizzard', cd: 3, color: '#8fe8ff', desc: 'All enemies are slowed 50% for 6s.' },
  shatter: { name: 'Shatterstorm', cd: 4, color: '#8fe8ff', desc: 'Chilled enemies take 20% of their HP (6% on bosses).' },
  toxic: { name: 'Toxic Cloud', cd: 2, color: '#4dff8a', desc: 'Poisons every enemy for 4% of its HP per second for 5s.' },
  mutagen: { name: 'Mutagen', cd: 3, color: '#4dff8a', desc: 'All towers deal +25% damage for 8s.' },
  burst: { name: 'Plague Burst', cd: 4, color: '#4dff8a', desc: 'Detonates all poison instantly for double damage.' },
  payday: { name: 'Payday', cd: 3, color: '#ffd23f', desc: 'Instantly gain credits that scale with the wave.' },
  bribe: { name: 'Bribe', cd: 3, color: '#ffd23f', desc: 'The strongest non-boss enemy simply leaves.' },
  crash: { name: 'Market Crash', cd: 4, color: '#ffd23f', desc: 'Enemies slowed 30% for 6s; kills pay +50% for 10s.' },
  barrier: { name: 'Barrier', cd: 3, color: '#3d7bff', desc: 'Leaks deal no core damage for 6s.' },
  fortify: { name: 'Fortify', cd: 4, color: '#3d7bff', desc: 'Repair 2 core HP; towers are immune to EMP for 15s.' },
  shove: { name: 'Shield Wall', cd: 3, color: '#3d7bff', desc: 'Pushes every non-boss enemy back 3 tiles.' },
  quickdraw: { name: 'Quickdraw', cd: 2, color: '#ff3df2', desc: 'Towers gain +50% crit chance for 6s.' },
  deadeye: { name: 'Dead Eye', cd: 3, color: '#ff3df2', desc: 'The 3 strongest enemies take 25% of their HP (8% on bosses).' },
  bulletstorm: { name: 'Bullet Storm', cd: 4, color: '#ff3df2', desc: 'All towers fire twice as fast for 5s.' },
  raise: { name: 'Raise Dead', cd: 3, color: '#b6ff3d', desc: 'Summons 6 husks that march out from the core.' },
  harvest: { name: 'Soul Harvest', cd: 3, color: '#b6ff3d', desc: 'Kills pay double credits for 8s.' },
  mark: { name: 'Death Mark', cd: 4, color: '#b6ff3d', desc: 'All enemies take +30% damage for 6s.' },
};


export const LEVELS = [
  null,
  { dmg: 1, range: 1, rate: 1, cost: 0 },
  { dmg: 1.4, range: 1.08, rate: 1, cost: 0.85 },
  { dmg: 1.9, range: 1.15, rate: 1.1, cost: 1.3 },
  { dmg: 2.6, range: 1.2, rate: 1.15, cost: 2.0 },
];

// ---------------- Enemies ----------------
// New enemy types arrive with each neon sector (10 waves each). `good` / `bad`
// list towers that excel or struggle against them, shown on the intel popup.
export const ENEMIES = {
  crawler: {
    id: 'crawler', name: 'Crawler', hp: 34, speed: 22, gold: 3, core: 1, minWave: 1, w: 10, sector: 0,
    desc: 'The basic void invader. Slow, steady, and endless.',
    abilities: ['None - pure numbers.'],
    good: [['blaster', 'Steady fire shreds them'], ['cannon', 'Splash hits the conga line']],
    bad: [['railgun', 'Massive overkill on a weak target']],
  },
  scout: {
    id: 'scout', name: 'Dart Scout', hp: 20, speed: 42, gold: 3, core: 1, minWave: 3, w: 6, sector: 0,
    desc: 'A darting skirmisher that sprints past slow defenses.',
    abilities: ['Very fast movement'],
    good: [['blaster', 'Homing bolts never miss'], ['cryo', 'Chill kills its speed'], ['tesla', 'Instant lightning']],
    bad: [['cannon', 'Shells land behind it'], ['mortar', 'Long flight time misses']],
  },
  swarm: {
    id: 'swarm', name: 'Swarmling', hp: 10, speed: 30, gold: 1, core: 1, minWave: 6, w: 4, group: 5, size: 3, sector: 0,
    desc: 'Tiny hive drones that arrive in tight packs of five.',
    abilities: ['Spawns in groups of 5'],
    good: [['cannon', 'One blast hits the whole pack'], ['tesla', 'Chains jump between them'], ['nanite', 'Poison clouds']],
    bad: [['railgun', 'One slug, one tiny kill'], ['laser', 'Ramp-up resets constantly']],
  },
  tank: {
    id: 'tank', name: 'Juggernaut', hp: 130, speed: 13, armor: 5, gold: 6, core: 2, minWave: 11, w: 4, sector: 1,
    desc: 'An armored walker. Small hits bounce off its plating.',
    abilities: ['Armor: reduces damage of every hit', 'Energy ignores half its armor, Bio ignores all'],
    good: [['laser', 'Energy beam ramps through armor'], ['railgun', 'Huge hits ignore flat armor'], ['nanite', 'Bio poison ignores armor']],
    bad: [['blaster', 'Weak bolts barely scratch it'], ['cryo', 'Tiny damage per hit']],
  },
  wasp: {
    id: 'wasp', name: 'Void Wasp', hp: 30, speed: 26, gold: 3, core: 1, minWave: 14, w: 3, flying: true, sector: 1,
    desc: 'A flyer that ignores the path and heads straight for your core.',
    abilities: ['Flying: skips the path entirely', 'Cannot be hit by Mortars or chased by Drones'],
    good: [['blaster', 'Fast homing bolts'], ['tesla', 'Lightning reaches the sky'], ['laser', 'Beams lock on']],
    bad: [['mortar', 'Cannot target flyers'], ['drone', 'Drones cannot reach flyers']],
  },
  aegis: {
    id: 'aegis', name: 'Aegis', hp: 55, shield: 45, speed: 20, gold: 5, core: 1, minWave: 21, w: 3, sector: 2,
    desc: 'Projects a regenerating energy shield over its hull.',
    abilities: ['Shield absorbs damage first', 'Shield regenerates after 3s without damage'],
    good: [['blaster', 'Constant fire stops regen'], ['tesla', 'Chain pressure'], ['laser', 'Continuous beam']],
    bad: [['railgun', 'Long reload lets the shield regenerate'], ['mortar', 'Slow volleys']],
  },
  medic: {
    id: 'medic', name: 'Medic', hp: 50, speed: 20, gold: 5, core: 1, minWave: 24, w: 2, heal: true, sector: 2,
    desc: 'A support unit that repairs every invader around it.',
    abilities: ['Heals nearby enemies 6% max HP every 2s'],
    good: [['railgun', 'Snipe it first (Strong targeting)'], ['mortar', 'Hits the whole cluster'], ['cannon', 'Splash the group']],
    bad: [['nanite', 'Poison gets healed away'], ['cryo', 'Slow damage keeps the group alive']],
  },
  shade: {
    id: 'shade', name: 'Shade', hp: 48, speed: 26, gold: 6, core: 1, minWave: 27, w: 3, cloaked: true, sector: 2,
    desc: 'A hooded void wisp wrapped in a light-bending cloak. You only see it when it is already close.',
    abilities: ['Always cloaked: towers only see it within 2.5 tiles', 'Towers with detection can hit it at full range'],
    good: [['tesla', 'Sees cloaked enemies'], ['laser', 'Sees cloaked enemies'], ['amplifier', 'Targeting Array reveals it to nearby towers']],
    bad: [['railgun', 'Long range is wasted without detection'], ['mortar', 'Cannot see it from afar']],
  },
  splitter: {
    id: 'splitter', name: 'Splitter', hp: 80, speed: 18, gold: 4, core: 1, minWave: 31, w: 3, split: 2, sector: 3,
    desc: 'An unstable blob of plasma that bursts into two fragments.',
    abilities: ['Splits into 2 Splitlings on death'],
    good: [['cannon', 'Splash catches the fragments'], ['tesla', 'Chains to the pieces'], ['mortar', 'Area denial']],
    bad: [['railgun', 'Kills one, leaves two']],
  },
  splitling: {
    id: 'splitling', name: 'Splitling', hp: 22, speed: 30, gold: 1, core: 1, minWave: 999, w: 0, size: 3, sector: 3,
    desc: 'A fragment of a Splitter. Fast and fragile.',
    abilities: ['Fast'], good: [['tesla', 'Chain lightning']], bad: [['mortar', 'Too quick to hit']],
  },
  phantom: {
    id: 'phantom', name: 'Phantom', hp: 60, speed: 24, gold: 5, core: 1, minWave: 34, w: 2, phase: true, sector: 3,
    desc: 'A wraith that slips in and out of reality.',
    abilities: ['Phases out for ~1s every 3s: untargetable and immune'],
    good: [['blaster', 'High fire rate catches it solid'], ['tesla', 'Instant hits'], ['nanite', 'Poison keeps ticking while phased']],
    bad: [['railgun', 'Slow shots get wasted'], ['mortar', 'Shells pass through']],
  },
  nullifier: {
    id: 'nullifier', name: 'Nullifier', hp: 160, speed: 15, armor: 7, gold: 8, core: 2, minWave: 41, w: 3, nullify: true, sector: 4,
    desc: 'A void-forged hulk that cancels every status effect.',
    abilities: ['Immune to chill, freeze, stun and poison', 'Heavy armor'],
    good: [['railgun', 'Raw damage beats armor'], ['laser', 'Energy beam ramps up'], ['drone', 'Drones hound it the whole way']],
    bad: [['cryo', 'Chill does nothing'], ['nanite', 'Poison does nothing'], ['blaster', 'Armor eats the bolts']],
  },
  blinker: {
    id: 'blinker', name: 'Blinker', hp: 70, speed: 22, gold: 5, core: 1, minWave: 44, w: 3, blink: true, sector: 4,
    desc: 'A rift-skipper that teleports down the path in bursts.',
    abilities: ['Teleports 3 tiles forward every 4s'],
    good: [['tesla', 'Instant lightning'], ['railgun', 'Instant slug'], ['laser', 'Beam re-locks instantly']],
    bad: [['mortar', 'Shells land where it was'], ['cannon', 'Leads the wrong spot']],
  },
};

// Mini-bosses appear on waves 25, 35, 45... alongside the normal wave.
Object.assign(ENEMIES, {
  carrier: {
    id: 'carrier', name: 'Carrier', sprite: 'wasp', scale: 1.8, tint: 'rgba(255,210,63,0.35)', mini: true,
    hp: 450, speed: 12, armor: 2, gold: 40, core: 4, minWave: 999, w: 0, flying: true, spawns: 'wasp', size: 9, sector: 2,
    desc: 'A flying hive-ship that releases Void Wasps as it crosses the map.',
    abilities: ['Mini-boss', 'Flying: ignores the path', 'Releases 2 Void Wasps every 3s'],
    good: [['laser', 'Beam locks on'], ['railgun', 'Long-range burst'], ['tesla', 'Hits the escorts too']],
    bad: [['mortar', 'Cannot hit flyers'], ['drone', 'Drones cannot reach flyers']],
  },
  prime: {
    id: 'prime', name: 'Juggernaut Prime', sprite: 'tank', scale: 1.8, tint: 'rgba(255,210,63,0.35)', mini: true,
    hp: 700, shield: 320, speed: 10, armor: 12, gold: 45, core: 5, minWave: 999, w: 0, size: 9, sector: 2,
    desc: 'A walking fortress wrapped in a regenerating shield.',
    abilities: ['Mini-boss', 'Massive armor (Bio ignores it, Energy halves it)', 'Regenerating shield'],
    good: [['nanite', 'Poison ignores armor'], ['laser', 'Ramping energy beam'], ['railgun', 'Huge single hits']],
    bad: [['blaster', 'Bolts bounce off'], ['cryo', 'Barely scratches it']],
  },
  weaver: {
    id: 'weaver', name: 'Rift Weaver', sprite: 'phantom', scale: 1.8, tint: 'rgba(255,210,63,0.35)', mini: true,
    hp: 550, speed: 14, gold: 45, core: 4, minWave: 999, w: 0, aura: true, size: 9, sector: 3,
    desc: 'A rift entity that speeds up and mends every invader near it.',
    abilities: ['Mini-boss', 'Nearby enemies move 30% faster and regenerate 2% HP/s'],
    good: [['railgun', 'Snipe it first'], ['tesla', 'Burst it down'], ['mortar', 'Hits the whole pack']],
    bad: [['cryo', 'Its aura offsets slows'], ['nanite', 'Regeneration outpaces poison']],
  },
  corrupted: {
    id: 'corrupted', name: 'Corrupted Invaders', sprite: 'crawler', tint: 'rgba(255,0,140,0.45)', minWave: 999, w: 0, sector: 5,
    hp: 0, speed: 22, gold: 0, core: 1,
    desc: 'Past wave 50 the void corrupts the invaders: +40% HP and one extra ability each.',
    abilities: ['+40% HP and +20% credits', 'Crawlers split, Scouts, Phantoms and Shades blink, Wasps and Blinkers cloak', 'Juggernauts and Swarmlings regenerate, Aegis and Nullifiers grow bigger shields', 'Medics heal twice as much, Splitters split into 3'],
    good: [['tesla', 'Reliable against every trick'], ['laser', 'Sustained damage']],
    bad: [],
  },
});

// Extra ability granted to each enemy type when corrupted (waves 51+).
export const CORRUPTION = {
  crawler: { split: 2 }, scout: { blink: true }, swarm: { regen: true }, tank: { regen: true, shield: 0.4 },
  wasp: { cloaked: true }, aegis: { shield: 0.8 }, medic: { heal: 2 }, splitter: { split: 3 },
  phantom: { blink: true }, nullifier: { shield: 0.5 }, blinker: { cloaked: true }, splitling: {}, shade: { blink: true },
};

export const SECTOR_INTROS = [
  'The Magenta Rim: the invasion begins.',
  'Cyan Drift: armored walkers and flyers emerge.',
  'Toxic Belt: shielded escorts, field medics and cloaked shades.',
  'Solar Forge: unstable plasma and phase wraiths.',
  'Void Reach: the void itself fights back.',
];

export const BOSSES = [
  { id: 'bulwark', name: 'The Bulwark', hp: 1300, speed: 9, armor: 3, core: 15, gold: 150, desc: 'Shield only breaks to its current weakness type. Weakness rotates.', shieldType: true, abilities: ['Shield only takes full damage from its weakness type (shown on the boss bar)', 'Weakness rotates Kinetic > Energy > Explosive', 'Rebuilds its shield once at 50% HP'], good: [['blaster', 'Kinetic'], ['tesla', 'Energy'], ['cannon', 'Explosive']], bad: [['cryo', 'Never its weakness'], ['nanite', 'Never its weakness']] },
  { id: 'hive', name: 'Hive Mother', hp: 1000, speed: 11, core: 15, gold: 150, desc: 'Births swarmlings and bursts into crawlers.', spawner: true, abilities: ['Spawns 3 Swarmlings every 4s', 'Bursts into 6 Crawlers on death'], good: [['cannon', 'Clears the brood'], ['tesla', 'Chains through the swarm']], bad: [['railgun', 'Ignores the brood']] },
  { id: 'disruptor', name: 'Disruptor', hp: 1100, speed: 11, armor: 3, core: 15, gold: 150, desc: 'EMP pulses disable nearby towers.', emp: true, abilities: ['EMP every 7s disables towers within 4 tiles for 3s'], good: [['railgun', 'Outranges the EMP'], ['mortar', 'Fires from far away']], bad: [['blaster', 'Short range gets shut down'], ['amplifier', 'Buffs drop when disabled']] },
  { id: 'stalker', name: 'Phase Stalker', hp: 900, speed: 12, core: 15, gold: 150, desc: 'Teleports forward along the path.', teleport: true, abilities: ['Teleports 4 tiles forward every 5s', 'Briefly intangible after teleporting'], good: [['tesla', 'Instant hits'], ['laser', 'Re-locks instantly']], bad: [['mortar', 'Shells miss'], ['cannon', 'Shells miss']] },
  { id: 'leviathan', name: 'Leviathan', hp: 1400, speed: 10, core: 20, gold: 180, desc: 'A flying titan escorted by wasps.', flying: true, spawner: true, abilities: ['Flying: ignores the path', 'Spawns 2 Void Wasps every 5s'], good: [['laser', 'Sustained beam'], ['railgun', 'Long range'], ['tesla', 'Hits flyers']], bad: [['mortar', 'Cannot hit flyers'], ['drone', 'Drones cannot reach flyers']] },
];

export const ELITE_MODS = {
  armored: { name: 'Armored', desc: '+6 armor', tint: 'rgba(120,140,255,0.35)' },
  fast: { name: 'Overdriven', desc: '+40% speed', tint: 'rgba(255,240,80,0.35)' },
  regen: { name: 'Regenerating', desc: 'Heals 3%/s', tint: 'rgba(80,255,120,0.35)' },
  cloaked: { name: 'Cloaked', desc: 'Only visible up close or to towers with detection', tint: 'rgba(160,100,255,0.45)' },
  shielded: { name: 'Shielded', desc: '+60% hp shield', tint: 'rgba(80,240,255,0.35)' },
  giant: { name: 'Titan', desc: 'x3 hp, bigger', tint: 'rgba(255,60,90,0.35)' },
};

export const DTYPE_NAME = { kin: 'Kinetic', eng: 'Energy', exp: 'Explosive', bio: 'Bio', cry: 'Cryo' };
export const DTYPE_COLOR = { kin: '#2ef2ff', eng: '#ffe84a', exp: '#ff8a1f', bio: '#4dff8a', cry: '#8fe8ff' };

export const COMBOS = [
  { id: 'shatter', name: 'Shatter', desc: 'Tesla hitting a chilled enemy deals +50% and bursts ice shards.', a: 'cryo', b: 'tesla' },
  { id: 'detonate', name: 'Detonation', desc: 'Explosions on poisoned enemies detonate the remaining poison instantly.', a: 'nanite', b: 'cannon' },
  { id: 'conductor', name: 'Conductor', desc: 'Railgun slugs always crit shocked enemies.', a: 'tesla', b: 'railgun' },
  { id: 'thermal', name: 'Thermal Shock', desc: 'Beam Laser deals +40% to chilled enemies.', a: 'cryo', b: 'laser' },
];

// ---------------- Augments (in-run relics) ----------------
// apply(m) mutates the run's mods object.
export const AUGMENTS = [
  { id: 'caps', name: 'Overcharged Capacitors', rarity: 1, desc: 'All towers +12% damage.', apply: (m) => { m.dmg += 0.12; } },
  { id: 'overclock', name: 'Overclock Chip', rarity: 1, desc: 'All towers +10% fire rate.', apply: (m) => { m.rate += 0.1; } },
  { id: 'barrels', name: 'Long Barrels', rarity: 1, desc: 'All towers +10% range.', apply: (m) => { m.range += 0.1; } },
  { id: 'crit', name: 'Critical Matrix', rarity: 1, desc: '+8% crit chance.', apply: (m) => { m.crit += 0.08; } },
  { id: 'salvage', name: 'Salvage Rights', rarity: 1, desc: '+1 credit per kill.', apply: (m) => { m.killGold += 1; } },
  { id: 'interest', name: 'Interest Protocol', rarity: 2, desc: '+4% interest on held credits each wave.', apply: (m) => { m.interest += 0.04; } },
  { id: 'reinforce', name: 'Reinforced Core', rarity: 1, desc: '+5 max core HP and repair 5.', apply: (m, run) => { m.coreMax += 5; run.heal(5); } },
  { id: 'assembly', name: 'Rapid Assembly', rarity: 2, desc: 'Towers cost 10% less.', apply: (m) => { m.cost -= 0.1; } },
  { id: 'dilation', name: 'Time Dilation', rarity: 2, desc: 'All enemies move 8% slower.', apply: (m) => { m.enemySpeed -= 0.08; } },
  { id: 'breaker', name: 'Shield Breaker', rarity: 1, desc: '+60% damage against shields.', apply: (m) => { m.shieldDmg += 0.6; } },
  { id: 'executioner', name: 'Executioner', rarity: 3, desc: 'Non-boss enemies under 8% HP are deleted.', apply: (m) => { m.execute = Math.max(m.execute, 0.08); } },
  { id: 'synergy', name: 'Synergy Core', rarity: 2, desc: 'Tower combos are 50% stronger.', apply: (m) => { m.combo += 0.5; } },
  { id: 'refund', name: 'Scrap Refund', rarity: 1, desc: 'Selling refunds 100%.', apply: (m) => { m.refund = 1; } },
  { id: 'emergency', name: 'Emergency Protocol', rarity: 2, desc: 'Survive one lethal hit with 5 HP.', apply: (m) => { m.emergency += 1; } },
  { id: 'stasis', name: 'Stasis Gates', rarity: 2, desc: 'Enemies are slowed 50% for 2s after spawning.', apply: (m) => { m.spawnSlow = 2; } },
  { id: 'lucky', name: 'Probability Engine', rarity: 3, desc: '+1 option on every augment pick.', apply: (m) => { m.choices += 1; } },
  { id: 'bounty', name: 'Bounty Hunter', rarity: 1, desc: 'Elites and bosses drop 2x credits.', apply: (m) => { m.eliteGold += 1; } },
  { id: 'glass', name: 'Glass Cannon', rarity: 2, desc: '+30% damage, but -6 max core HP.', apply: (m, run) => { m.dmg += 0.3; m.coreMax -= 6; run.heal(0); } },
  { id: 'bossbane', name: 'Titan Slayer', rarity: 2, desc: '+35% damage to bosses.', apply: (m) => { m.bossDmg += 0.35; } },
  { id: 'hollow', name: 'Hollow Points', rarity: 1, desc: 'Pulse Blasters +30% damage.', tower: 'blaster', apply: (m) => { m.t.blaster.dmg += 0.3; } },
  { id: 'chainrx', name: 'Chain Reactor', rarity: 2, desc: 'Tesla Coils chain +2 more times.', tower: 'tesla', apply: (m) => { m.chainBonus += 2; } },
  { id: 'bigboom', name: 'Plasma Overpressure', rarity: 1, desc: 'Plasma Cannon blasts +35% radius.', tower: 'cannon', apply: (m) => { m.splash += 0.35; } },
  { id: 'brittle', name: 'Brittle Ice', rarity: 1, desc: 'Chilled enemies take +15% damage.', tower: 'cryo', apply: (m) => { m.brittle += 0.15; } },
  { id: 'bloom', name: 'Nanite Bloom', rarity: 1, desc: 'Poison lasts 50% longer and hits 25% harder.', tower: 'nanite', apply: (m) => { m.poison += 0.25; m.poisonDur += 0.5; } },
  { id: 'capacitor', name: 'Rail Capacitor', rarity: 2, desc: 'Railguns +40% damage, +1 pierce.', tower: 'railgun', apply: (m) => { m.t.railgun.dmg += 0.4; m.pierce += 1; } },
  { id: 'uplink', name: 'Drone Uplink', rarity: 2, desc: 'Drone Bays deploy +1 drone.', tower: 'drone', apply: (m) => { m.drones += 1; } },
  { id: 'golden', name: 'Golden Circuit', rarity: 1, desc: 'Credit Miners +50% income.', tower: 'miner', apply: (m) => { m.miner += 0.5; } },
  { id: 'resonance', name: 'Resonance Field', rarity: 2, desc: 'Amplifier range +50%, buff +5%.', tower: 'amplifier', apply: (m) => { m.ampRange += 0.5; m.ampBuff += 0.05; } },
  { id: 'spotters', name: 'Forward Spotters', rarity: 1, desc: 'Mortars lose their minimum range.', tower: 'mortar', apply: (m) => { m.mortarMin = 0; } },
  { id: 'lens', name: 'Focus Lens', rarity: 1, desc: 'Beam Lasers ramp 50% higher.', tower: 'laser', apply: (m) => { m.laserRamp += 0.5; } },
  { id: 'reanimator', name: 'Reanimator Coil', rarity: 2, desc: 'Reclaimers +15% revive chance.', tower: 'reclaimer', apply: (m) => { m.revive += 0.15; } },
];
export const AUG_BY_ID = Object.fromEntries(AUGMENTS.map((a) => [a.id, a]));
export const RARITY = [null, { name: 'Common', color: '#8fb4ff', price: 90 }, { name: 'Rare', color: '#ff3df2', price: 150 }, { name: 'Epic', color: '#ffe84a', price: 230 }];

// ---------------- Chunk archetypes ----------------
// outs: outward exits relative to the entry side. 'F' forward, 'L' left, 'R' right.
export const ARCHETYPES = [
  { id: 'conduit', name: 'Conduit', outs: ['F'], wps: 1, w: 10, desc: 'A winding straight run.', reward: { gold: 15 } },
  { id: 'bend', name: 'Elbow', outs: ['L'], wps: 1, w: 8, desc: 'The path turns a corner.', reward: { gold: 15 }, flip: true },
  { id: 'braid', name: 'Braided Lanes', outs: ['F'], wps: 1, braid: true, w: 6, desc: 'Path splits into two lanes that merge again.', reward: { gold: 25 } },
  { id: 'serpent', name: 'Serpent Coil', outs: ['F'], wps: 3, w: 5, desc: 'A long twisting path. Costs credits.', reward: { gold: -60 } },
  { id: 'fork', name: 'Fork', outs: ['F', 'L'], wps: 1, w: 5, desc: 'Branches into two: +1 enemy portal.', reward: { gold: 60, shards: 1 }, flip: true },
  { id: 'cross', name: 'Crossroads', outs: ['F', 'L', 'R'], wps: 1, w: 2, desc: 'Three-way junction: +2 portals.', reward: { gold: 100, aug: 2 } },
  { id: 'sealed', name: 'Sealed Bulkhead', outs: [], wps: 0, w: 2, desc: 'Closes this portal for good. Enemies gain +6% HP.', reward: { hpMult: 0.06 }, needsPortals: 2 },
];

export const CHUNK_MODS = [
  { id: 'rocks', name: 'Asteroid Field', desc: 'Extra unbuildable rocks.', w: 6 },
  { id: 'high', name: 'High Ground', desc: 'Raised plates: towers +25% range.', w: 5 },
  { id: 'sludge', name: 'Coolant Spill', desc: 'Slows enemies on the path.', w: 4 },
  { id: 'cache', name: 'Data Cache', desc: 'Tap to salvage credits or shards.', w: 4 },
  { id: 'node', name: 'Power Node', desc: 'Towers on it deal +30% damage.', w: 4 },
];

// Risk / reward modifiers. Local ones only buff enemies that cross the tile;
// global ones buff every enemy for as long as the chunk exists.
export const RISK_MODS = [
  { id: 'rift', name: 'Rift Conduit', scope: 'local', desc: 'Enemies crossing it gain +50% HP, but drop 2x credits and may drop shards.', w: 5 },
  { id: 'accel', name: 'Ion Accelerator', scope: 'local', desc: 'Enemies crossing it move 40% faster, but drop +75% credits.', w: 5 },
  { id: 'obelisk', name: 'Shard Obelisk', scope: 'global', desc: '+1 Void Shard every wave, but ALL enemies gain +8% HP.', w: 3 },
  { id: 'beacon', name: 'Bounty Beacon', scope: 'global', desc: '+25% credits from every kill, but ALL enemies move 6% faster.', w: 3 },
];

// ---------------- Events ----------------
export const EVENTS = [
  {
    id: 'signal', title: 'Derelict Signal', text: 'A distress beacon pulses from a wreck. Could be salvage... could be a trap.',
    options: [
      { label: 'Investigate (50%: +220 credits, else -5 core HP)', act: (run) => (run.rng() < 0.5 ? (run.addGold(220), 'Jackpot! +220 credits.') : (run.damageCore(5, true), 'Ambush! The core took 5 damage.')) },
      { label: 'Ignore it', act: () => 'You leave it drifting.' },
    ],
  },
  {
    id: 'shrine', title: 'Void Altar', text: 'A cursed monolith hums with forbidden power. It offers a gift... at a price.',
    options: [
      { label: 'Accept: gain an Epic augment, enemies +12% HP', act: (run) => { run.mods.hpMult += 0.12; const a = run.randomAugment(3); run.addAugment(a.id); return `Gained ${a.name}. The void stirs...`; } },
      { label: 'Walk away', act: () => 'Wise, perhaps.' },
    ],
  },
  {
    id: 'merchant', title: 'Wandering Merchant', text: 'A smuggler ship docks. "Got something special, if you have shards."',
    options: [
      { label: 'Pay 4 Void Shards: Rare augment', cond: (run) => run.shards >= 4, act: (run) => { run.shards -= 4; const a = run.randomAugment(2); run.addAugment(a.id); return `Bought ${a.name}.`; } },
      { label: 'Pay 120 credits: Common augment', cond: (run) => run.gold >= 120, act: (run) => { run.gold -= 120; const a = run.randomAugment(1); run.addAugment(a.id); return `Bought ${a.name}.`; } },
      { label: 'No deal', act: () => 'The merchant shrugs and leaves.' },
    ],
  },
  {
    id: 'refugees', title: 'Refugee Convoy', text: 'Survivors offer to reinforce the core if you cover their fuel.',
    options: [
      { label: 'Pay 100 credits: repair 8 core HP', cond: (run) => run.gold >= 100, act: (run) => { run.gold -= 100; run.heal(8); return 'The convoy patches the core.'; } },
      { label: 'Decline', act: () => 'They move on.' },
    ],
  },
  {
    id: 'blackmarket', title: 'Black Market Chip', text: 'A hacker can siphon core energy into credits.',
    options: [
      { label: 'Trade 5 core HP for 300 credits', cond: (run) => run.coreHp > 5, act: (run) => { run.damageCore(5, true); run.addGold(300); return '+300 credits. The core flickers.'; } },
      { label: 'Refuse', act: () => 'Not worth the risk.' },
    ],
  },
  {
    id: 'ritual', title: 'Overclock Ritual', text: 'Push one tower type past its limits: +30% damage, but it costs 20% more to build.',
    options: 'ritual',
  },
  {
    id: 'cache', title: 'Abandoned Armory', text: 'Crates of tech left behind by a fallen bastion.',
    options: [
      { label: 'Take the credits (+150)', act: (run) => { run.addGold(150); return '+150 credits.'; } },
      { label: 'Take the shards (+3)', act: (run) => { run.shards += 3; return '+3 Void Shards.'; } },
    ],
  },
];
