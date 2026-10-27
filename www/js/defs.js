// Game content definitions. Distances are in world pixels (16 px per tile).

// ---------------- Towers ----------------
// Branches unlock at level 3 -> 4. Each branch sets flags that combat code reads.
export const TOWERS = {
  blaster: {
    id: 'blaster', name: 'Pulse Blaster', color: '#2ef2ff', cost: 50, unlock: 0,
    desc: 'Rapid single-target kinetic bolts.',
    dmg: 6, rate: 3, range: 44, dtype: 'kin', proj: 'bolt', projSpeed: 230,
    branches: {
      A: { name: 'Scatter Array', desc: 'Fires at 3 targets at once.', multi: 3 },
      B: { name: 'Piercer', desc: 'Bolts pierce through 3 enemies. +30% dmg.', pierce: 3, dmgMult: 1.3 },
    },
  },
  cannon: {
    id: 'cannon', name: 'Plasma Cannon', color: '#ff8a1f', cost: 90, unlock: 0,
    desc: 'Explosive plasma shells with splash damage.',
    dmg: 18, rate: 0.8, range: 46, dtype: 'exp', proj: 'shell', projSpeed: 150, splash: 18,
    branches: {
      A: { name: 'Cluster Shells', desc: 'Each blast scatters 3 mini-bombs.', cluster: 3 },
      B: { name: 'Nova Core', desc: '+70% blast radius, +30% dmg.', splashMult: 1.7, dmgMult: 1.3 },
    },
  },
  cryo: {
    id: 'cryo', name: 'Cryo Emitter', color: '#8fe8ff', cost: 70, unlock: 0,
    desc: 'Chills enemies, slowing them down.',
    dmg: 3, rate: 1.2, range: 40, dtype: 'cry', proj: 'bolt', projSpeed: 170, splash: 10,
    slow: 0.35, slowDur: 1.6,
    branches: {
      A: { name: 'Absolute Zero', desc: '20% chance to freeze solid for 1s.', freeze: 0.2 },
      B: { name: 'Blizzard', desc: 'Constant aura chills everything in range.', aura: true },
    },
  },
  tesla: {
    id: 'tesla', name: 'Tesla Coil', color: '#ffe84a', cost: 110, unlock: 0, rotates: false,
    desc: 'Lightning chains between enemies. Shocks targets.',
    dmg: 12, rate: 1, range: 40, dtype: 'eng', proj: 'chain', chains: 3, chainRange: 30,
    branches: {
      A: { name: 'Storm Lattice', desc: '+4 chain jumps.', chainBonus: 4 },
      B: { name: 'Overload', desc: '25% chance to stun for 0.7s.', stun: 0.25 },
    },
  },
  nanite: {
    id: 'nanite', name: 'Nanite Sprayer', color: '#4dff8a', cost: 80, unlock: 20,
    desc: 'Corrosive nanite globs that poison in an area.',
    dmg: 2, rate: 1.1, range: 40, dtype: 'bio', proj: 'glob', projSpeed: 140, splash: 13,
    poison: 8, poisonDur: 4,
    branches: {
      A: { name: 'Plague', desc: 'Poison spreads when a victim dies.', plague: true },
      B: { name: 'Corrode', desc: 'Poisoned enemies take +25% dmg and lose armor.', corrode: true },
    },
  },
  railgun: {
    id: 'railgun', name: 'Railgun', color: '#ff3df2', cost: 140, unlock: 35,
    desc: 'Extreme range, huge single hits. Crits often.',
    dmg: 70, rate: 0.35, range: 104, dtype: 'kin', proj: 'rail', crit: 0.1,
    branches: {
      A: { name: 'Assassin', desc: '+25% crit, crits x3. Executes non-bosses under 15%.', critBonus: 0.25, critMult: 3, execute: 0.15 },
      B: { name: 'Penetrator', desc: 'Slug pierces every enemy in a line.', pierce: 99 },
    },
  },
  drone: {
    id: 'drone', name: 'Drone Bay', color: '#3d7bff', cost: 100, unlock: 25, rotates: false,
    desc: 'Deploys drones that block and fight on the path.',
    range: 36, drones: 2, droneHp: 60, droneDmg: 8, droneRate: 1.5, dtype: 'kin', proj: 'none',
    branches: {
      A: { name: 'Heavy Frames', desc: 'Drones get x3 HP and +50% dmg.', droneHpMult: 3, droneDmgMult: 1.5 },
      B: { name: 'Swarm Protocol', desc: 'Deploys 4 drones.', dronesBonus: 2 },
    },
  },
  miner: {
    id: 'miner', name: 'Credit Miner', color: '#ffd23f', cost: 120, unlock: 30, rotates: false,
    desc: 'Generates credits at the end of every wave.',
    range: 0, income: 25, proj: 'none',
    branches: {
      A: { name: 'Bank Node', desc: '+4% interest on held credits (max 80).', bank: 0.04 },
      B: { name: 'Shard Extractor', desc: '+1 Void Shard every wave.', shards: 1 },
    },
  },
  amplifier: {
    id: 'amplifier', name: 'Amplifier Pylon', color: '#a466ff', cost: 120, unlock: 40, rotates: false,
    desc: 'Boosts damage of nearby towers by 15%.',
    range: 36, buff: 0.15, proj: 'none',
    branches: {
      A: { name: 'Overclock', desc: 'Nearby towers also fire 20% faster.', buffRate: 0.2 },
      B: { name: 'Targeting Array', desc: 'Nearby towers +15% range, +10% crit. Reveals cloaked.', buffRange: 0.15, buffCrit: 0.1 },
    },
  },
  mortar: {
    id: 'mortar', name: 'Orbital Mortar', color: '#ff5533', cost: 130, unlock: 45,
    desc: 'Huge range artillery. Has a minimum range. Cannot hit flyers.',
    dmg: 34, rate: 0.4, range: 132, minRange: 40, dtype: 'exp', proj: 'mortar', splash: 24, ground: true,
    branches: {
      A: { name: 'Carpet Barrage', desc: 'Fires 3 shells per volley.', volley: 3 },
      B: { name: 'Napalm', desc: 'Blasts leave burning fields.', napalm: true },
    },
  },
  laser: {
    id: 'laser', name: 'Beam Laser', color: '#ff2fa0', cost: 150, unlock: 60,
    desc: 'Continuous beam. Damage ramps up on the same target.',
    dmg: 14, rate: 1, range: 48, dtype: 'eng', proj: 'beam', ramp: 4, rampTime: 3,
    branches: {
      A: { name: 'Prism Split', desc: 'Beam splits to 2 extra targets.', prism: 2 },
      B: { name: 'Melter', desc: 'Ramps to x8, twice as fast.', rampMult: 2, rampSpeed: 2 },
    },
  },
  reclaimer: {
    id: 'reclaimer', name: 'Reclaimer', color: '#b6ff3d', cost: 130, unlock: 80, rotates: false,
    desc: 'Enemies that die in range may rise as allied husks.',
    dmg: 10, rate: 0.8, range: 44, dtype: 'bio', proj: 'orb', projSpeed: 110, revive: 0.25,
    branches: {
      A: { name: 'Legion', desc: '45% revive chance, husks are tougher.', reviveBonus: 0.2, husk: 2 },
      B: { name: 'Siphon', desc: 'Kills in range grant +3 credits.', siphon: 3 },
    },
  },
};
export const TOWER_ORDER = Object.keys(TOWERS);

export const LEVELS = [
  null,
  { dmg: 1, range: 1, rate: 1, cost: 0 },
  { dmg: 1.45, range: 1.08, rate: 1, cost: 0.7 },
  { dmg: 2.0, range: 1.15, rate: 1.1, cost: 1.0 },
  { dmg: 2.7, range: 1.2, rate: 1.15, cost: 1.5 },
];

// ---------------- Enemies ----------------
export const ENEMIES = {
  crawler: { id: 'crawler', name: 'Crawler', hp: 30, speed: 22, gold: 4, core: 1, minWave: 1, w: 10, desc: 'Basic invader.' },
  scout: { id: 'scout', name: 'Dart Scout', hp: 18, speed: 40, gold: 3, core: 1, minWave: 2, w: 6, desc: 'Fast and fragile.' },
  swarm: { id: 'swarm', name: 'Swarmling', hp: 9, speed: 30, gold: 1, core: 1, minWave: 4, w: 4, group: 5, size: 3, desc: 'Arrives in packs.' },
  tank: { id: 'tank', name: 'Juggernaut', hp: 110, speed: 14, armor: 4, gold: 10, core: 2, minWave: 5, w: 3, desc: 'Heavily armored. Energy weapons ignore half its armor.' },
  wasp: { id: 'wasp', name: 'Void Wasp', hp: 26, speed: 26, gold: 5, core: 1, minWave: 6, w: 3, flying: true, desc: 'Flies straight to the core. Mortars and drones cannot touch it.' },
  aegis: { id: 'aegis', name: 'Aegis', hp: 50, shield: 40, speed: 20, gold: 8, core: 1, minWave: 7, w: 3, desc: 'Regenerating energy shield.' },
  medic: { id: 'medic', name: 'Medic', hp: 45, speed: 20, gold: 8, core: 1, minWave: 9, w: 2, heal: true, desc: 'Repairs nearby enemies.' },
  splitter: { id: 'splitter', name: 'Splitter', hp: 70, speed: 18, gold: 6, core: 1, minWave: 11, w: 3, split: 2, desc: 'Splits in two on death.' },
  splitling: { id: 'splitling', name: 'Splitling', hp: 20, speed: 30, gold: 1, core: 1, minWave: 999, w: 0, size: 3, desc: 'Fragment of a Splitter.' },
  phantom: { id: 'phantom', name: 'Phantom', hp: 50, speed: 24, gold: 7, core: 1, minWave: 13, w: 2, phase: true, desc: 'Periodically phases out of reality.' },
};

export const BOSSES = [
  { id: 'bulwark', name: 'The Bulwark', hp: 1300, speed: 9, armor: 3, core: 15, gold: 150, desc: 'Shield only breaks to its current weakness type. Weakness rotates.', shieldType: true },
  { id: 'hive', name: 'Hive Mother', hp: 1000, speed: 11, core: 15, gold: 150, desc: 'Births swarmlings and bursts into crawlers.', spawner: true },
  { id: 'disruptor', name: 'Disruptor', hp: 1100, speed: 11, armor: 3, core: 15, gold: 150, desc: 'EMP pulses disable nearby towers.', emp: true },
  { id: 'stalker', name: 'Phase Stalker', hp: 900, speed: 12, core: 15, gold: 150, desc: 'Teleports forward along the path.', teleport: true },
  { id: 'leviathan', name: 'Leviathan', hp: 1400, speed: 10, core: 20, gold: 180, desc: 'A flying titan escorted by wasps.', flying: true, spawner: true },
];

export const ELITE_MODS = {
  armored: { name: 'Armored', desc: '+6 armor', tint: 'rgba(120,140,255,0.35)' },
  fast: { name: 'Overdriven', desc: '+40% speed', tint: 'rgba(255,240,80,0.35)' },
  regen: { name: 'Regenerating', desc: 'Heals 3%/s', tint: 'rgba(80,255,120,0.35)' },
  cloaked: { name: 'Cloaked', desc: 'Only visible up close', tint: 'rgba(160,100,255,0.45)' },
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
  { id: 'conduit', name: 'Conduit', outs: ['F'], wps: 1, w: 10, desc: 'A winding straight run.', reward: { gold: 30 } },
  { id: 'bend', name: 'Elbow', outs: ['L'], wps: 1, w: 8, desc: 'The path turns a corner.', reward: { gold: 30 }, flip: true },
  { id: 'braid', name: 'Braided Lanes', outs: ['F'], wps: 1, braid: true, w: 6, desc: 'Path splits into two lanes that merge again.', reward: { gold: 45 } },
  { id: 'serpent', name: 'Serpent Coil', outs: ['F'], wps: 3, w: 5, desc: 'A long twisting path. Costs credits.', reward: { gold: -40 } },
  { id: 'fork', name: 'Fork', outs: ['F', 'L'], wps: 1, w: 5, desc: 'Branches into two: +1 enemy portal.', reward: { gold: 90, shards: 2 }, flip: true },
  { id: 'cross', name: 'Crossroads', outs: ['F', 'L', 'R'], wps: 1, w: 2, desc: 'Three-way junction: +2 portals.', reward: { gold: 140, aug: 2 } },
  { id: 'sealed', name: 'Sealed Bulkhead', outs: [], wps: 0, w: 2, desc: 'Closes this portal for good. Enemies gain +6% HP.', reward: { hpMult: 0.06 }, needsPortals: 2 },
];

export const CHUNK_MODS = [
  { id: 'rocks', name: 'Asteroid Field', desc: 'Extra unbuildable rocks.', w: 6 },
  { id: 'high', name: 'High Ground', desc: 'Raised plates: towers +25% range.', w: 5 },
  { id: 'sludge', name: 'Coolant Spill', desc: 'Slows enemies on the path.', w: 4 },
  { id: 'cache', name: 'Data Cache', desc: 'Tap to salvage credits or shards.', w: 4 },
  { id: 'node', name: 'Power Node', desc: 'Towers on it deal +30% damage.', w: 4 },
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
