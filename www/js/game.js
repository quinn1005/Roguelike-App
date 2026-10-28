// Run simulation: economy, waves, towers, enemies, combat, rewards.

import { TS, T, isBuildable, isPath } from './sprites.js';
import { World, CS, rollChunkMods, genChunk } from './world.js';
import { mulberry32, randInt, pick, shuffle, weightedPick, dist, dist2, clamp } from './util.js';
import {
  TOWERS, TOWER_ORDER, LEVELS, ENEMIES, BOSSES, ELITE_MODS, AUGMENTS, AUG_BY_ID, RARITY, ARCHETYPES, EVENTS, SECTOR_INTROS,
  FUSIONS, RELICS, RELIC_BY_ID, VETERANCY, MUTATORS, ABILITIES, CORRUPTION,
} from './defs.js';
import {
  meta, saveMeta, buildRunMods, heatInfo, COMMANDERS, saveRun, clearRun, addXp, checkAchievements,
  cmdAddXp, cmdAbilities, mutatorBonus, towerSkin,
} from './meta.js';

const UNIQUE_AUGS = new Set(['refund', 'spotters', 'stasis', 'executioner']);
const BOSS_EVERY = 10;
const EXPAND_EVERY = 3;
const center = (t) => t * TS + TS / 2;
const MINI_BOSSES = ['carrier', 'prime', 'weaver'];
const ZERO_TM = { dmg: 0, rate: 0, cost: 0, splash: 0 };

export class Run {
  constructor({ commander = 'vanguard', heat = 0, mutators = [], save = null, seed = (Date.now() & 0xffffff) }) {
    this.listeners = {};
    this.sfx = () => {};
    this.haptic = () => {};
    this.timed = [];
    this.tb = {};
    this.cooldowns = {};
    this.fx = { particles: [], texts: [], lines: [], rings: [] };
    this.enemies = [];
    this.projectiles = [];
    this.units = [];
    this.fields = [];
    this.holes = [];
    this.spawnQueue = [];
    this.towers = [];
    this.towerAt = new Map();
    this.speed = 1;
    this.paused = false;
    this.time = 0;
    this.shake = 0;
    this.choiceQueue = [];
    this.placing = null;
    this.nextId = 1;
    if (save) this.load(save);
    else this.init(commander, heat, seed, mutators);
    this.mut = new Set(this.mutators);
    this.abilities = cmdAbilities(this.commander);
    this.skins = Object.fromEntries(TOWER_ORDER.map((t) => [t, towerSkin(t)]));
    this.heatMul = heatInfo(this.heat);
    this.recomputeStats();
    this.nextPlan = this.planWave(this.wave + 1);
  }

  init(commander, heat, seed, mutators) {
    this.seed = seed;
    this.rng = mulberry32(seed);
    this.commander = commander;
    this.heat = heat;
    this.mutators = mutators.slice();
    this.mods = buildRunMods(commander);
    if (mutators.includes('glass')) this.mods.coreMax = 5;
    if (mutators.includes('inflation')) this.mods.cost += 0.3;
    if (mutators.includes('haste')) this.mods.enemySpeed += 0.2;
    this.relics = [];
    this.relocations = 1;
    this.baseMods = JSON.parse(JSON.stringify(this.mods)); // run-start bonuses, before any augments
    this.wave = 0;
    this.gold = this.mods.startGold;
    this.shards = 0;
    this.coreHp = this.mods.coreMax;
    this.augments = {};
    this.rerolls = this.mods.rerolls;
    this.stats = { kills: 0, combos: 0, built: 0, branches: 0, maxGold: this.gold, bosses: [], leaks: 0, kinds: {}, elites: 0, fusions: 0, lastLeak: null };
    this.phase = 'build';
    this.world = new World();
    this.world.createCore();
    // first chunk so the starting path has some length
    const arch = ARCHETYPES.find((a) => a.id === 'conduit');
    this.world.attach(this.world.portals[0], arch, ['high'], 0, randInt(this.rng, 1, 1e9));
    for (let i = 0; i < this.mods.startAug; i++) this.addAugment(this.randomAugment(1).id);
  }

  on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
  emit(ev, data) { for (const fn of this.listeners[ev] || []) fn(data); }
  toast(msg, color) { this.emit('toast', { msg, color }); }

  get sector() { return Math.floor(this.wave / BOSS_EVERY); }
  get maxCore() { return Math.max(1, this.mods.coreMax); }

  availableTowers() {
    const set = new Set(meta.unlocked);
    const cmd = COMMANDERS.find((c) => c.id === this.commander);
    if (cmd && cmd.sig) set.add(cmd.sig);
    return TOWER_ORDER.filter((t) => set.has(t));
  }

  // ---------------- economy ----------------
  addGold(n) {
    this.gold += Math.max(0, Math.round(n));
    if (this.gold > this.stats.maxGold) this.stats.maxGold = this.gold;
  }
  heal(n) { this.coreHp = Math.min(this.maxCore, this.coreHp + n); }

  tmod(type) { return this.mods.t[type] || ZERO_TM; }
  costFactor(type) { return Math.max(0.4, 1 + this.mods.cost + this.tmod(type).cost); }
  towerCost(type) { return Math.round(TOWERS[type].cost * this.costFactor(type)); }
  upgradeCost(tw) {
    if (tw.level >= 4) return null;
    return Math.round(tw.def.cost * LEVELS[tw.level + 1].cost * this.costFactor(tw.type));
  }

  canBuild(x, y) {
    return isBuildable(this.world.tile(x, y)) && !this.towerAt.has(x + ',' + y);
  }

  build(type, x, y) {
    const cost = this.towerCost(type);
    if (this.gold < cost || !this.canBuild(x, y)) return null;
    this.gold -= cost;
    const tw = {
      id: this.nextId++, type, def: TOWERS[type], tx: x, ty: y, x: center(x), y: center(y),
      level: 1, branch: null, cd: 0.2, angle: -Math.PI / 2, mode: 'first', invested: cost,
      dmgDealt: 0, kills: 0, disabled: 0, drones: [], beam: [], rampT: 0, rampTarget: null, relic: null, oc: 0, vet: 0,
    };
    this.towers.push(tw);
    this.towerAt.set(x + ',' + y, tw);
    this.stats.built++;
    if (TOWERS[type].drones) this.computeRally(tw);
    this.recomputeStats();
    this.sfx('build');
    this.haptic('tap');
    this.burst(tw.x, tw.y, tw.def.color, 12);
    return tw;
  }

  upgrade(tw, branch) {
    const cost = this.upgradeCost(tw);
    if (cost == null || this.gold < cost) return false;
    if (tw.level === 3 && !branch) return false;
    this.gold -= cost;
    tw.invested += cost;
    tw.level++;
    if (tw.level === 4) { tw.branch = branch; this.stats.branches++; }
    this.recomputeStats();
    this.sfx('upgrade');
    this.burst(tw.x, tw.y, tw.def.color, 16);
    this.text(tw.x, tw.y - 8, tw.level === 4 ? tw.def.branches[branch].name.toUpperCase() : 'LV ' + tw.level, tw.def.color);
    return true;
  }

  sellValue(tw) { return Math.round(tw.invested * Math.min(1, this.mods.refund)); }
  get canSell() { return !this.mut.has('scorched'); }

  sell(tw, full = false) {
    if (!this.canSell && !full) return false;
    this.addGold(full ? tw.invested : this.sellValue(tw));
    if (tw.relic) this.relics.push(tw.relic);
    this.towers.splice(this.towers.indexOf(tw), 1);
    this.towerAt.delete(tw.tx + ',' + tw.ty);
    for (const d of tw.drones) d.alive = false;
    this.recomputeStats();
    if (!full) this.sfx('sell');
    return true;
  }

  // ---------------- asteroid blasting ----------------
  blastCost() { return 40 + this.wave * 5; }
  blastRock(x, y) {
    if (this.world.tile(x, y) !== T.ROCK || this.phase === 'over') return false;
    const cost = this.blastCost();
    if (this.gold < cost) return false;
    this.gold -= cost;
    this.world.setTile(x, y, T.GROUND);
    this.burst(center(x), center(y), '#a466ff', 18);
    this.ring(center(x), center(y), 12, '#ff8a1f');
    this.sfx('boom');
    this.shake = Math.min(4, this.shake + 2);
    if (this.rng() < 0.2) { this.shards++; this.text(center(x), center(y), '+1 shard', '#ff3df2'); }
    return true;
  }

  // ---------------- relics ----------------
  installRelic(tw, idx) {
    const id = this.relics[idx];
    if (!id) return false;
    this.relics.splice(idx, 1);
    if (tw.relic) this.relics.push(tw.relic);
    tw.relic = id;
    this.recomputeStats();
    this.sfx('upgrade');
    this.text(tw.x, tw.y - 8, RELIC_BY_ID[id].name.toUpperCase(), RELIC_BY_ID[id].color);
    return true;
  }

  // ---------------- fusion ----------------
  fusionOptions(tw) {
    if (tw.level < 4 || tw.def.fused) return [];
    const out = [];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const o = this.towerAt.get((tw.tx + dx) + ',' + (tw.ty + dy));
      if (!o || o.level < 4 || o.def.fused) continue;
      const f = FUSIONS.find((r) => (r.a === tw.type && r.b === o.type) || (r.b === tw.type && r.a === o.type));
      if (f) out.push({ other: o, recipe: f, cost: this.fusionCost(f.id) });
    }
    return out;
  }
  fusionCost(id) { return Math.round(TOWERS[id].cost * 0.5 * this.costFactor(id)); }
  fuse(tw, opt) {
    const { other, recipe, cost } = opt;
    if (this.gold < cost || !this.towers.includes(other)) return false;
    this.gold -= cost;
    if (other.relic) this.relics.push(other.relic);
    for (const d of other.drones) d.alive = false;
    for (const d of tw.drones) d.alive = false;
    this.towers.splice(this.towers.indexOf(other), 1);
    this.towerAt.delete(other.tx + ',' + other.ty);
    Object.assign(tw, {
      type: recipe.id, def: TOWERS[recipe.id], level: 4, branch: null, invested: tw.invested + other.invested + cost,
      kills: tw.kills + other.kills, dmgDealt: tw.dmgDealt + other.dmgDealt, drones: [], beam: [], rampT: 0, rampTarget: null,
    });
    this.stats.fusions++;
    this.recomputeStats();
    this.ring(tw.x, tw.y, 28, tw.def.color);
    this.burst(tw.x, tw.y, tw.def.color, 30);
    this.burst(other.x, other.y, other.def.color, 20);
    this.text(tw.x, tw.y - 10, tw.def.name.toUpperCase(), tw.def.color);
    this.sfx('upgrade');
    this.haptic('heavy');
    return true;
  }

  // ---------------- overclock ----------------
  // Overclock costs credits that scale with the wave. Afterwards the tower
  // overheats and stays offline until the end of the following wave.
  overclockCost() { return 25 + this.wave * 8; }
  canOverclock(tw) {
    return this.phase === 'wave' && tw.def.dmg && !(tw.oc > 0) && !tw.overheat && !(tw.disabled > 0) && this.gold >= this.overclockCost();
  }
  overclock(tw) {
    if (!this.canOverclock(tw)) return false;
    this.gold -= this.overclockCost();
    tw.oc = 10;
    this.ring(tw.x, tw.y, 12, '#ff8a1f');
    this.sfx('upgrade');
    return true;
  }

  // ---------------- chunk relocation ----------------
  isLeaf(ch) {
    const k = World.key(ch.cx, ch.cy);
    for (const c of this.world.chunks.values()) if (c.parent === k) return false;
    return true;
  }
  canRelocate(ch) { return !!ch && ch.parent && ch.seed != null && this.isLeaf(ch) && this.relocations > 0 && this.phase === 'build'; }
  clearChunkTowers(ch) {
    for (const tw of this.towers.slice()) {
      if (Math.floor(tw.tx / CS) === ch.cx && Math.floor(tw.ty / CS) === ch.cy) this.sell(tw, true);
    }
  }
  afterRelocate() {
    this.relocations--;
    for (const tw of this.towers) if (tw.def.drones) this.computeRally(tw);
    this.recomputeStats();
    this.nextPlan = this.planWave(this.wave + 1);
    this.sfx('expand');
    this.save();
  }
  rotateChunk(ch) {
    if (!this.canRelocate(ch)) return false;
    const before = ch.outs.join();
    this.clearChunkTowers(ch);
    for (let k = 1; k <= 3; k++) {
      const arch = ARCHETYPES.find((a) => a.id === ch.arch);
      this.world.regen(ch, arch, ch.mods, ch.seed, ((ch.rot || 0) + 1) % 3);
      if (ch.outs.join() !== before || !arch.outs.length) break;
    }
    this.burst(ch.cx * CS * TS + 56, ch.cy * CS * TS + 56, '#2ef2ff', 30);
    this.afterRelocate();
    return true;
  }
  swapChunks(a, b) {
    if (!this.canRelocate(a) || !this.canRelocate(b) || a === b) return false;
    this.clearChunkTowers(a); this.clearChunkTowers(b);
    const A = { arch: a.arch, mods: a.mods, seed: a.seed, sector: a.sector }, B = { arch: b.arch, mods: b.mods, seed: b.seed, sector: b.sector };
    a.sector = B.sector; b.sector = A.sector;
    this.world.regen(a, ARCHETYPES.find((x) => x.id === B.arch), B.mods, B.seed, 0);
    this.world.regen(b, ARCHETYPES.find((x) => x.id === A.arch), A.mods, A.seed, 0);
    for (const ch of [a, b]) this.burst(ch.cx * CS * TS + 56, ch.cy * CS * TS + 56, '#ff3df2', 30);
    this.afterRelocate();
    return true;
  }

  salvage(x, y) {
    if (this.world.tile(x, y) !== T.CACHE) return false;
    this.world.setTile(x, y, T.GROUND);
    if (this.rng() < 0.6) {
      const g = 25 + this.wave * 8;
      this.addGold(g);
      this.text(center(x), center(y), '+' + g + 'c', '#ffe84a');
    } else {
      const s = randInt(this.rng, 1, 2);
      this.shards += s;
      this.text(center(x), center(y), '+' + s + ' shard', '#ff3df2');
    }
    this.sfx('coin');
    this.burst(center(x), center(y), '#ffe84a', 10);
    return true;
  }

  // ---------------- tower stats ----------------
  recomputeStats() {
    const m = this.mods;
    const base = (tw, amp) => {
      const d = tw.def, L = d.fused ? LEVELS[1] : LEVELS[tw.level];
      const br = d.fused ? d.fx : tw.branch ? d.branches[tw.branch] : {};
      const tm = this.tmod(tw.type);
      const tile = this.world.tile(tw.tx, tw.ty);
      const vet = VETERANCY[tw.vet - 1] || { dmg: 0, rate: 0, range: 0 };
      const relic = tw.relic;
      const dmgMult = (1 + m.dmg + tm.dmg + amp.dmg) * L.dmg * (br.dmgMult || 1) * (tile === T.NODE ? 1.3 : 1)
        * (1 + vet.dmg) * (relic === 'overcharger' ? 1.4 : 1);
      let range = d.range * L.range * (1 + m.range + amp.range) * (tile === T.HIGH ? 1.25 : 1) * (1 + vet.range) * (relic === 'lens' ? 1.3 : 1);
      if (d.buff) range *= 1 + m.ampRange;
      // Breakdown of where bonuses come from, for the tower panel.
      const B = this.baseMods || m, Bt = (B.t && B.t[tw.type]) || ZERO_TM;
      // Talents = everything the run started with (talent trees, commander passive
      // and skill tree, prestige); augments = everything gained since.
      // Location = nearby Amplifiers plus the tile (Power Node / High Ground).
      const split = (ampAdd, tileMul, tal, aug) => {
        const s0 = 1 + ampAdd;
        return { loc: s0 * tileMul - 1, tal: (s0 + tal) / s0 - 1, aug: (s0 + tal + aug) / Math.max(0.05, s0 + tal) - 1 };
      };
      const ampRangeAug = d.buff ? m.ampRange : 0;
      const rng = split(amp.range, tile === T.HIGH ? 1.25 : 1, B.range, m.range - B.range);
      rng.aug = (1 + rng.aug) * (1 + ampRangeAug) - 1;
      const bd = {
        dmg: { ...split(amp.dmg, tile === T.NODE ? 1.3 : 1, B.dmg + Bt.dmg, (m.dmg - B.dmg) + (tm.dmg - Bt.dmg)), relic: relic === 'overcharger' ? 0.4 : 0, vet: vet.dmg },
        rate: { ...split(amp.rate, 1, B.rate + Bt.rate, (m.rate - B.rate) + (tm.rate - Bt.rate)), relic: relic === 'coils' ? 0.35 : 0, vet: vet.rate },
        range: { ...rng, relic: relic === 'lens' ? 0.3 : 0, vet: vet.range },
      };
      return {
        bd,
        dmg: (d.dmg || 0) * dmgMult,
        dmgMult,
        rate: (d.rate || 1) * L.rate * (1 + m.rate + tm.rate + amp.rate) * (1 + vet.rate) * (relic === 'coils' ? 1.35 : 1),
        range,
        minRange: (d.minRange || 0) * m.mortarMin * m.mortarMinMult,
        crit: m.crit + (d.crit || 0) + (br.critBonus || 0) + amp.crit,
        critMult: Math.max(br.critMult || 0, m.critMult),
        splash: (d.splash || 0) * (1 + (tw.type === 'cannon' ? m.splash : 0) + tm.splash) * (br.splashMult || 1),
        chains: (d.chains || 0) + (br.chainBonus || 0) + m.chainBonus,
        chainRange: d.chainRange || 30,
        holeR: (d.holeR || 0) * L.range * (br.holeMult || 1),
        holeDur: d.holeR ? d.holeDur + m.holeDur : 0,
        pierce: d.proj === 'rail' ? 1 + m.pierce + (br.pierce || 0) : (br.pierce || 0),
        multi: br.multi || 1,
        slow: Math.min(0.8, (d.slow || 0) + (d.slow ? m.chill : 0)),
        slowDur: (d.slowDur || 0) * (1 + m.chillDur),
        poison: (d.poison || 0) * L.dmg * (1 + m.poison + m.dmg + tm.dmg + amp.dmg),
        poisonDur: (d.poisonDur || 0) * (1 + m.poisonDur),
        drones: (d.drones || 0) + (br.dronesBonus || 0) + m.drones,
        droneHp: (d.droneHp || 0) * L.dmg * (br.droneHpMult || 1) * (1 + m.droneHp),
        droneDmg: (d.droneDmg || 0) * dmgMult * (br.droneDmgMult || 1),
        income: (d.income || 0) * L.dmg * (1 + m.miner),
        buff: ((d.buff || 0) + m.ampBuff) * (1 + (tw.level - 1) * 0.35),
        ramp: (d.ramp || 1) * (br.rampMult || 1) * (1 + m.laserRamp),
        rampTime: (d.rampTime || 1) / (br.rampSpeed || 1),
        revive: (d.revive || 0) + (br.reviveBonus || 0) + m.revive,
        execute: br.execute || 0,
        br,
      };
    };
    const zero = { dmg: 0, rate: 0, range: 0, crit: 0, reveal: false };
    const amps = this.towers.filter((t) => t.def.buff);
    for (const a of amps) a.stats = base(a, zero);
    for (const tw of this.towers) {
      if (tw.def.buff) continue;
      const amp = { dmg: 0, rate: 0, range: 0, crit: 0, reveal: false };
      for (const a of amps) {
        if (a.disabled > 0) continue;
        if (dist2(a.x, a.y, tw.x, tw.y) > a.stats.range * a.stats.range) continue;
        amp.dmg += a.stats.buff;
        const br = a.stats.br;
        if (br.buffRate) amp.rate += br.buffRate;
        if (br.buffRange) { amp.range += br.buffRange; amp.reveal = true; }
        if (br.buffCrit) amp.crit += br.buffCrit;
      }
      // Stacked pylons have diminishing returns past +60% damage.
      if (amp.dmg > 0.6) amp.dmg = 0.6 + (amp.dmg - 0.6) * 0.3;
      tw.stats = base(tw, amp);
      tw.reveal = amp.reveal || !!tw.def.detect || !!tw.stats.br.detect;
      tw.buffed = amp.dmg > 0;
    }
    // Sensor Beacon relic: its tower and the 8 tiles around it see cloaked enemies.
    for (const src of this.towers) {
      if (src.relic !== 'sensor') continue;
      for (const tw of this.towers) if (Math.abs(tw.tx - src.tx) <= 1 && Math.abs(tw.ty - src.ty) <= 1) tw.reveal = true;
    }
  }

  computeRally(tw) {
    let best = null, bd = Infinity;
    const r = Math.ceil(tw.def.range / TS) + 1;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const t = this.world.tile(tw.tx + dx, tw.ty + dy);
        if (!isPath(t) || t === T.CORE) continue;
        const d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = [center(tw.tx + dx), center(tw.ty + dy)]; }
      }
    }
    tw.rally = best;
  }

  // ---------------- augments ----------------
  randomAugment(minRarity = 1, exclude = []) {
    const avail = new Set(this.availableTowers());
    const pool = AUGMENTS.filter((a) => a.rarity >= minRarity && (!a.tower || avail.has(a.tower))
      && !exclude.includes(a.id) && !(UNIQUE_AUGS.has(a.id) && this.augments[a.id]));
    const w = this.wave;
    const weights = { 1: 70, 2: 25 + w * 0.5, 3: 5 + w * 0.3 };
    return weightedPick(this.rng, pool.map((a) => ({ a, w: weights[a.rarity] }))).a;
  }

  relicOption(exclude = []) {
    const pool = RELICS.filter((r) => !exclude.includes('relic:' + r.id));
    const r = pool[Math.floor(this.rng() * pool.length)];
    return { id: 'relic:' + r.id, relic: r.id, name: r.name, desc: 'RELIC (install on one tower): ' + r.desc, rarity: 2, isRelic: true, color: r.color };
  }

  rollAugments(n, minRarity = 1, forceRelic = false) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const ex = out.map((a) => a.id);
      if ((forceRelic && i === 0) || (this.wave >= 5 && this.rng() < 0.12)) out.push(this.relicOption(ex));
      else out.push(this.randomAugment(minRarity, ex));
    }
    return out;
  }

  addAugment(id) {
    if (id.startsWith('relic:')) {
      this.relics.push(id.slice(6));
      this.toast('RELIC ACQUIRED: ' + RELIC_BY_ID[id.slice(6)].name + ' - install it from a tower panel', RELIC_BY_ID[id.slice(6)].color);
      return;
    }
    const a = AUG_BY_ID[id];
    this.augments[id] = (this.augments[id] || 0) + 1;
    a.apply(this.mods, this);
    this.coreHp = Math.min(this.coreHp, this.maxCore);
    this.recomputeStats();
  }

  // ---------------- waves ----------------
  hpScale(w) { return (1 + 0.12 * (w - 1)) * Math.pow(1.07, w - 1) * (w > 40 ? Math.pow(1.03, w - 40) : 1) * this.heatMul.hp * this.mods.hpMult; }

  // Plans a wave in advance so the HUD can preview its composition.
  planWave(w) {
    const portals = Math.max(1, this.world.portals.length);
    const pool = Object.values(ENEMIES).filter((e) => e.minWave <= w && e.w > 0).map((e) => ({ e, w: e.w }));
    let n = Math.min(90, Math.floor(6 + w * 1.7));
    if (this.mut && this.mut.has('surge')) n = Math.floor(n * 1.5);
    const interval = Math.max(0.25, 0.9 - w * 0.012);
    const isBoss = w % BOSS_EVERY === 0;
    const eliteMod = !isBoss && w % 5 === 0 && w >= 15 ? pick(this.rng, Object.keys(ELITE_MODS)) : null;
    const randomEliteChance = w > 12 ? Math.min(0.25, 0.02 + w * 0.003) : 0;
    const corruptChance = w > 50 ? Math.min(0.6, 0.1 + (w - 50) * 0.02) : 0;
    const q = [];
    let t = 1;
    for (let i = 0; i < n; i++) {
      const def = weightedPick(this.rng, pool).e;
      const pi = i % portals;
      let elite = eliteMod;
      if (!elite && this.rng() < randomEliteChance) elite = pick(this.rng, Object.keys(ELITE_MODS));
      const corrupt = this.rng() < corruptChance;
      const count = def.group || 1;
      for (let g = 0; g < count; g++) { q.push({ t, type: def.id, portal: pi, elite, corrupt }); t += 0.12; }
      t += interval * (isBoss ? 1.3 : 1);
    }
    let mini = null;
    if (isBoss) q.push({ t: Math.min(t * 0.4, 8), boss: (w / BOSS_EVERY - 1) % BOSSES.length, portal: 0 });
    else if (w >= 25 && w % 10 === 5) {
      mini = MINI_BOSSES[Math.floor(w / 10) % MINI_BOSSES.length];
      q.push({ t: t * 0.45, type: mini, portal: 0, mini: true, corrupt: w > 50 });
    }
    q.sort((a, b) => a.t - b.t);
    return { w, q, isBoss, eliteMod, mini };
  }

  peekWave() {
    const w = this.wave + 1;
    const plan = this.nextPlan && this.nextPlan.w === w ? this.nextPlan : null;
    if (w % BOSS_EVERY === 0) {
      const b = BOSSES[(w / BOSS_EVERY - 1) % BOSSES.length];
      return { boss: b, text: 'BOSS: ' + b.name, plan };
    }
    if (plan && plan.mini) return { mini: true, text: 'MINI-BOSS', plan };
    if (w % 5 === 0 && w >= 15) return { elite: true, text: 'ELITE WAVE', plan };
    return { text: 'Wave ' + w, plan };
  }

  // Counts per enemy type for the wave preview bar.
  wavePreview() {
    const p = this.peekWave().plan;
    if (!p) return [];
    const counts = new Map();
    for (const it of p.q) {
      const id = it.boss != null ? BOSSES[it.boss].id : it.type;
      const c = counts.get(id) || { id, n: 0, boss: it.boss != null, mini: !!it.mini, elite: 0, corrupt: 0 };
      c.n++; if (it.elite) c.elite++; if (it.corrupt) c.corrupt++;
      counts.set(id, c);
    }
    return [...counts.values()].sort((a, b) => (b.boss - a.boss) || (b.mini - a.mini) || (b.n - a.n));
  }

  startWave() {
    if (this.phase !== 'build') return;
    this.wave++;
    const w = this.wave;
    this.phase = 'wave';
    this.waveLeaks = 0;
    const plan = this.nextPlan && this.nextPlan.w === w ? this.nextPlan : this.planWave(w);
    this.nextPlan = null;
    const q = plan.q;
    if (plan.isBoss) {
      const bi = (w / BOSS_EVERY - 1) % BOSSES.length;
      this.sfx('alarm');
      this.haptic('heavy');
      this.toast('WARNING: ' + BOSSES[bi].name.toUpperCase(), '#ff2f5a');
    } else if (plan.mini) {
      this.sfx('alarm');
      this.haptic('heavy');
      this.toast('MINI-BOSS: ' + ENEMIES[plan.mini].name.toUpperCase(), '#ffd23f');
    } else if (plan.eliteMod) {
      this.toast('ELITE WAVE: ' + ELITE_MODS[plan.eliteMod].name, '#ffe84a');
    }
    this.spawnQueue = q.map((it) => ({ ...it }));
    if ((w - 1) % BOSS_EVERY === 0 && w > 1) {
      this.toast('SECTOR ' + (this.sector + 1) + ': ' + SECTOR_INTROS[this.sector % SECTOR_INTROS.length].toUpperCase(), '#ff3df2');
    }
    const fresh = [];
    for (const it of q) {
      const id = it.boss != null ? BOSSES[it.boss].id : it.type;
      if (!meta.seen[id] && !fresh.includes(id)) fresh.push(id);
      if (it.corrupt && !meta.seen.corrupted && !fresh.includes('corrupted')) fresh.push('corrupted');
    }
    if (fresh.length) { for (const id of fresh) meta.seen[id] = 1; saveMeta(); this.emit('intro', fresh); }
    this.waveTime = 0;
    this.overtime = false;
    this.emit('wave', w);
  }

  spawnEnemy(type, portalIdx, elite, at = null, bossIdx = null, corrupt = false) {
    const portal = this.world.portals[portalIdx % this.world.portals.length];
    if (!portal) return null;
    const def = bossIdx != null ? BOSSES[bossIdx] : ENEMIES[type];
    const w = this.wave;
    const flying = !!def.flying;
    let route;
    if (at) route = at.route;
    else if (flying) route = [[center(portal.tx), center(portal.ty)], [center(3), center(3)]];
    else route = this.world.route(portal, this.rng).map(([x, y]) => [center(x), center(y)]);
    const bossNum = bossIdx != null ? Math.floor(w / BOSS_EVERY) : 0;
    const bossMult = bossNum === 1 ? 0.55 : bossNum === 2 ? 0.8 : 1 + 0.25 * Math.floor((bossNum - 1) / BOSSES.length);
    let hp = def.hp * this.hpScale(w) * (bossIdx != null ? bossMult : 1);
    const e = {
      id: this.nextId++, type: bossIdx != null ? def.id : type, def, boss: bossIdx != null, route, i: 0,
      x: route[0][0], y: route[0][1], hp, maxHp: hp, shield: 0, maxShield: 0, armor: (def.armor || 0) * (1 + w * 0.02),
      speed: def.speed * Math.min(1.3, 1 + w * 0.005) * this.heatMul.speed, flying, size: def.size || (bossIdx != null ? 10 : 5),
      gold: def.gold * (1 + 0.03 * (w - 1)), core: def.core, alive: true, traveled: 0, len: 0,
      slow: 0, slowT: 0, freeze: 0, stun: 0, held: 0, holeImmune: 0, shock: 0, poison: 0, poisonT: 0, corrode: 0, plague: false,
      shieldDelay: 0, hitFlash: 0, anim: this.rng() * 10, timers: {}, elite: null, atk: (def.atk || 5) * (1 + 0.07 * (w - 1)),
      spawnSlow: this.mods.spawnSlow, ccImmune: 0, goldMult: 1, phased: false, cloaked: false, blocker: null, dir: 1,
    };
    for (let k = 1; k < route.length; k++) e.len += dist(route[k - 1][0], route[k - 1][1], route[k][0], route[k][1]);
    if (at) { e.x = at.x; e.y = at.y; e.i = at.i; e.traveled = at.traveled; e.x += (this.rng() - 0.5) * 6; e.y += (this.rng() - 0.5) * 6; }
    if (def.shield) { e.shield = e.maxShield = def.shield * this.hpScale(w); }
    if (def.blink) e.timers.blink = 4;
    e.sprite = def.sprite || e.type;
    if (def.scale) e.scale = def.scale;
    if (def.tint) e.tint = def.tint;
    if (def.mini) { e.mini = true; e.timers.spawn = 3; }
    if (corrupt && CORRUPTION[type]) {
      const c = CORRUPTION[type];
      e.corrupted = true;
      e.tint = 'rgba(255,0,140,0.45)';
      e.hp *= 1.4; e.maxHp = e.hp; e.gold *= 1.2;
      if (c.split) e.split = c.split;
      if (c.blink) { e.blink = true; e.timers.blink = 4; }
      if (c.regen) e.regen = true;
      if (c.cloaked) e.cloaked = true;
      if (c.shield) { e.shield += e.maxHp * c.shield; e.maxShield = e.shield; }
      if (c.heal) e.healMult = c.heal;
    }
    if (this.mut.has('plated')) e.armor += 4;
    if (this.mut.has('shroud')) e.cloaked = true;
    if (elite) {
      e.elite = elite;
      e.gold *= 3; e.core += 1;
      if (elite === 'armored') e.armor += 6;
      if (elite === 'fast') e.speed *= 1.4;
      if (elite === 'cloaked') e.cloaked = true;
      if (elite === 'shielded') { e.shield += e.hp * 0.6; e.maxShield = e.shield; }
      if (elite === 'giant') { e.hp *= 3; e.maxHp = e.hp; e.size *= 1.5; }
    }
    if (e.boss) {
      e.gold = def.gold * (1 + 0.1 * bossNum);
      e.core = Math.min(def.core, 6 + bossNum * 3);
      e.bossIdx = bossIdx;
      if (def.shieldType) { e.shield = e.maxShield = e.maxHp * 0.4; e.weak = 'kin'; e.timers.weak = 7; }
      if (def.spawner) e.timers.spawn = 4;
      if (def.emp) e.timers.emp = 6;
      if (def.teleport) e.timers.tp = 5;
      this.emit('boss', e);
      this.haptic('heavy');
    }
    this.enemies.push(e);
    return e;
  }

  endWave() {
    this.phase = 'reward';
    this.holes = [];
    const w = this.wave;
    let income = Math.round((15 + w * 3) * this.mods.waveGold * (this.mut.has('famine') ? 0.5 : 1));
    const interest = this.mut.has('famine') ? 0 : Math.min(50 + w * 10, Math.floor(this.gold * this.mods.interest));
    income += interest;
    for (const tw of this.towers) {
      if (!tw.def.income) continue;
      income += Math.round(tw.stats.income);
      if (tw.stats.br.bank) income += Math.min(80, Math.floor(this.gold * tw.stats.br.bank));
      if (tw.stats.br.shards) this.shards += tw.stats.br.shards;
    }
    this.addGold(income);
    if (this.mods.obelisk) this.shards += this.mods.obelisk;
    if (this.mods.regen) this.heal(this.mods.regen);
    for (const k in this.cooldowns) if (this.cooldowns[k] > 0) this.cooldowns[k]--;
    for (const tw of this.towers) {
      if (tw.overheat && w >= tw.heatUntil) { tw.overheat = 0; tw.heatUntil = 0; this.text(tw.x, tw.y - 8, 'COOLED DOWN', '#2ef2ff', 0.8); }
    }
    this.toast(`WAVE ${w} CLEARED  +${income}c`, '#4dff8a');
    this.sfx('clear');
    this.haptic('light');
    if (w % BOSS_EVERY === 0 && this.relocations < 2) { this.relocations++; this.toast('+1 CHUNK RELOCATION', '#2ef2ff'); }

    const q = [];
    if (w % EXPAND_EVERY === 0 || w % BOSS_EVERY === 0) q.push({ kind: 'expand' });
    if (w % BOSS_EVERY === 0) q.push({ kind: 'augment', minRarity: 2, title: 'BOSS SPOILS', relic: true });
    else if (w % 2 === 1) q.push({ kind: 'augment' });
    else {
      const r = this.rng();
      q.push({ kind: r < 0.4 ? 'shop' : r < 0.75 ? 'event' : 'augment' });
    }
    this.choiceQueue = q;
    this.nextChoice();
  }

  nextChoice() {
    if (this.phase === 'over') return;
    const c = this.choiceQueue.shift();
    if (!c) {
      this.phase = 'build';
      this.placing = null;
      this.nextPlan = this.planWave(this.wave + 1);
      this.save();
      this.emit('build');
      return;
    }
    this.phase = 'choice';
    if (c.kind === 'augment') c.options = this.rollAugments(this.mods.choices, c.minRarity || 1, c.relic);
    if (c.kind === 'shop') c.items = this.makeShop();
    if (c.kind === 'event') c.event = this.makeEvent();
    if (c.kind === 'expand') {
      c.cards = this.makeChunkCards();
      if (!this.world.portals.some((p) => p.side !== 'G')) { this.nextChoice(); return; }
    }
    this.current = c;
    this.emit('choice', c);
  }

  // Each reroll in the same shop/pick doubles the price of the next one.
  reroll(c) {
    if (this.rerolls > 0) this.rerolls--;
    else { const cost = this.rerollCost(c); if (this.gold < cost) return false; this.gold -= cost; }
    c.rerollCount = (c.rerollCount || 0) + 1;
    if (c.kind === 'augment') c.options = this.rollAugments(this.mods.choices, c.minRarity || 1);
    if (c.kind === 'shop') c.items = this.makeShop();
    return true;
  }
  rerollCost(c) { return Math.round((25 + this.wave * 3) * Math.pow(2, (c && c.rerollCount) || 0)); }

  makeShop() {
    const augs = this.rollAugments(3);
    const items = augs.map((a) => ({ aug: a, price: this.augPrice(a), sold: false }));
    if (this.wave >= 5 && this.rng() < 0.5) { const r = this.relicOption(); items.push({ aug: r, price: this.augPrice(r), sold: false }); }
    items.push({ repair: 4, price: Math.round((80 + this.wave * 8) * this.mods.shop), sold: false });
    return items;
  }

  // Price grows exponentially with how many copies you already own.
  augPrice(a) {
    const owned = this.augments[a.id] || 0;
    return Math.round(RARITY[a.rarity].price * (1 + this.wave * 0.04) * this.mods.shop * Math.pow(1.8, owned));
  }

  buyShop(item) {
    if (item.sold || this.gold < item.price) return false;
    this.gold -= item.price;
    item.sold = true;
    if (item.aug) { this.addAugment(item.aug.id); for (const it of this.current.items) if (it.aug && !it.sold) it.price = this.augPrice(it.aug); }
    if (item.repair) this.heal(item.repair);
    this.sfx('coin');
    return true;
  }

  makeEvent() {
    const ev = pick(this.rng, EVENTS);
    if (ev.options === 'ritual') {
      const types = shuffle(this.rng, this.availableTowers().slice()).slice(0, 3);
      return {
        ...ev,
        options: [
          ...types.map((t) => ({
            label: `Empower ${TOWERS[t].name}`,
            act: (run) => { run.mods.t[t].dmg += 0.3; run.mods.t[t].cost += 0.2; run.recomputeStats(); return `${TOWERS[t].name} surges with power.`; },
          })),
          { label: 'Leave', act: () => 'Nothing happens.' },
        ],
      };
    }
    return ev;
  }

  makeChunkCards() {
    const portals = this.world.portals.length;
    const pool = ARCHETYPES.filter((a) => !a.needsPortals || portals >= a.needsPortals).map((a) => ({ a, w: a.w }));
    const cards = [];
    const used = new Set();
    for (let i = 0; i < 3; i++) {
      let a;
      for (let k = 0; k < 10; k++) { a = weightedPick(this.rng, pool).a; if (!used.has(a.id)) break; }
      used.add(a.id);
      const mods = a.id === 'sealed' ? [] : rollChunkMods(this.rng, randInt(this.rng, 1, 2), 0.45);
      const seed = randInt(this.rng, 1, 1e9);
      const preview = genChunk({ arch: a, mods, sector: this.sector, seed, entry: 'W' });
      cards.push({ arch: a, mods, seed, preview });
    }
    return cards;
  }

  placeChunk(portal) {
    const card = this.placing;
    if (!card) return false;
    const ch = this.world.attach(portal, card.arch, card.mods, this.sector, card.seed);
    const r = card.arch.reward;
    if (r.gold) { if (r.gold > 0) this.addGold(r.gold); else this.gold = Math.max(0, this.gold + r.gold); }
    if (r.shards) this.shards += r.shards;
    if (r.hpMult) this.mods.hpMult += r.hpMult;
    if (card.mods.includes('obelisk')) { this.mods.hpMult += 0.08; this.mods.obelisk = (this.mods.obelisk || 0) + 1; }
    if (card.mods.includes('beacon')) { this.mods.goldMult += 0.25; this.mods.enemySpeed += 0.06; }
    if (r.aug) { const a = this.randomAugment(r.aug); this.addAugment(a.id); this.toast('Crossroads bonus: ' + a.name, '#ff3df2'); }
    for (const tw of this.towers) if (tw.def.drones) this.computeRally(tw);
    this.placing = null;
    this.sfx('expand');
    for (let i = 0; i < 30; i++) {
      this.particle(ch.cx * CS * TS + this.rng() * CS * TS, ch.cy * CS * TS + this.rng() * CS * TS, '#2ef2ff', 0, -10, 0.8);
    }
    this.emit('expanded', ch);
    this.nextChoice();
    return true;
  }

  // ---------------- core ----------------
  damageCore(n, silent, src) {
    if (this.phase === 'over') return;
    if (!silent && this.tb.barrier) { this.text(center(3), center(3) - 10, 'BLOCKED', '#3d7bff', 0.6); return; }
    if (src) this.stats.lastLeak = src;
    this.coreHp -= n;
    this.haptic(n >= 5 ? 'heavy' : 'medium');
    this.shake = Math.min(8, this.shake + 2 + n);
    if (!silent) this.sfx('leak');
    if (this.coreHp <= 0) {
      if (this.mods.emergency > 0) {
        this.mods.emergency--;
        this.coreHp = 5;
        this.toast('EMERGENCY PROTOCOL ENGAGED', '#ff2f5a');
        this.ring(center(3), center(3), 60, '#2ef2ff');
        for (const e of this.enemies) if (!e.boss && dist(e.x, e.y, center(3), center(3)) < 60) this.damage(e, 99999, 'eng', null);
      } else {
        this.coreHp = 0;
        this.gameOver();
      }
    }
  }

  gameOver() {
    this.phase = 'over';
    this.sfx('lose');
    const w = this.wave;
    const bossKills = this.stats.bosses.length;
    const mb = 1 + mutatorBonus(this.mutators || []);
    const xp = Math.round((w * 10 + bossKills * 50 + this.stats.kills * 0.2) * this.heatMul.reward * this.mods.xpMult * mb);
    const shards = Math.round((2 + this.shards + Math.floor(w / 3)) * this.mods.shardMult * this.heatMul.reward * mb);
    const prevLevel = meta.level;
    const ups = addXp(xp);
    const cmdUps = cmdAddXp(this.commander, xp);
    for (const [k, v] of Object.entries(this.stats.tkills || {})) meta.towerKills[k] = (meta.towerKills[k] || 0) + v;
    const top = this.towers.slice().sort((a, b) => b.dmgDealt - a.dmgDealt)[0];
    meta.history.unshift({
      t: Date.now(), wave: w, commander: this.commander, heat: this.heat, mutators: this.mutators || [], kills: this.stats.kills,
      bosses: bossKills, xp, shards, top: top ? top.def.name : null, cause: this.stats.lastLeak || 'Abandoned',
    });
    meta.history = meta.history.slice(0, 20);
    this.haptic('over');
    meta.shards += shards;
    meta.runs++;
    meta.totalKills += this.stats.kills;
    meta.bestWave = Math.max(meta.bestWave, w);
    for (const [k, v] of Object.entries(this.stats.kinds)) meta.bestiary[k] = (meta.bestiary[k] || 0) + v;
    for (const b of this.stats.bosses) meta.bossKills[b] = (meta.bossKills[b] || 0) + 1;
    let heatUp = false;
    if (w >= 20 && this.heat >= meta.heatUnlocked && meta.heatUnlocked < 10) { meta.heatUnlocked = this.heat + 1; heatUp = true; }
    const ach = checkAchievements(this);
    saveMeta();
    clearRun();
    this.emit('over', { wave: w, xp, shards, ups, prevLevel, ach, heatUp, kills: this.stats.kills, bosses: bossKills, cmdUps, mb });
  }

  // ---------------- update ----------------
  update(dt) {
    if (this.paused || this.phase === 'over') return;
    dt *= this.speed;
    const steps = Math.ceil(dt / (1 / 60));
    const h = dt / steps;
    for (let s = 0; s < steps; s++) this.step(h);
  }

  addTimed(key, val, dur) { this.timed.push({ key, val, t: dur }); }

  step(dt) {
    this.time += dt;
    this.tb = {};
    for (const b of this.timed) { b.t -= dt; this.tb[b.key] = (this.tb[b.key] || 0) + b.val; }
    this.timed = this.timed.filter((b) => b.t > 0);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 20);
    if (this.phase === 'wave') {
      this.waveTime += dt;
      if (!this.overtime && this.waveTime > 120 && !this.spawnQueue.length) {
        this.overtime = true;
        this.toast('OVERTIME: ENEMIES ENRAGED', '#ff2f5a');
      }
      while (this.spawnQueue.length && this.spawnQueue[0].t <= this.waveTime) {
        const s = this.spawnQueue.shift();
        if (s.boss != null) this.spawnEnemy(null, s.portal, null, null, s.boss);
        else this.spawnEnemy(s.type, s.portal, s.elite, null, null, s.corrupt);
      }
    }
    for (const e of this.enemies) if (e.alive) this.updateEnemy(e, dt);
    for (const tw of this.towers) this.updateTower(tw, dt);
    for (const p of this.projectiles) this.updateProjectile(p, dt);
    for (const u of this.units) if (u.alive) this.updateUnit(u, dt);
    for (const f of this.fields) this.updateField(f, dt);
    for (const h of this.holes) this.updateHole(h, dt);
    this.enemies = this.enemies.filter((e) => e.alive);
    this.projectiles = this.projectiles.filter((p) => p.alive);
    this.units = this.units.filter((u) => u.alive);
    this.fields = this.fields.filter((f) => f.t > 0);
    this.holes = this.holes.filter((h) => h.t > 0);
    this.updateFx(dt);
    if (this.phase === 'wave' && !this.spawnQueue.length && !this.enemies.length) this.endWave();
  }

  updateEnemy(e, dt) {
    e.anim += dt;
    if (e.hitFlash > 0) e.hitFlash -= dt;
    e.slowT -= dt; if (e.slowT <= 0) e.slow = 0;
    e.freeze -= dt; e.stun -= dt; e.held -= dt; e.holeImmune -= dt; e.ccImmune -= dt; e.shock -= dt; e.corrode -= dt; e.spawnSlow -= dt;
    // poison
    if (e.poisonT > 0) {
      e.poisonT -= dt;
      this.damage(e, e.poison * dt, 'bio', e.poisonSrc, { dot: true });
      if (!e.alive) return;
      if (e.poisonT <= 0) e.poison = 0;
    }
    // regen / shields
    if (e.elite === 'regen' || e.regen) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.03 * dt);
    if (e.mini) {
      e.timers.spawn -= dt;
      if (e.def.spawns && e.timers.spawn <= 0) {
        e.timers.spawn = 3;
        const at = { x: e.x, y: e.y, i: e.i, traveled: e.traveled, route: e.route };
        for (let k = 0; k < 2; k++) this.spawnEnemy(e.def.spawns, 0, null, at);
      }
      if (e.def.aura) {
        for (const o of this.enemies) {
          if (o === e || !o.alive || dist2(o.x, o.y, e.x, e.y) > 1600) continue;
          o.auraT = 0.25;
          o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.02 * dt);
        }
        if (Math.random() < dt * 4) this.ring(e.x, e.y, 40, '#ffd23f', 0.3);
      }
    }
    if (e.auraT > 0) e.auraT -= dt;
    if (e.maxShield > 0 && !e.def.shieldType) {
      e.shieldDelay -= dt;
      if (e.shieldDelay <= 0) e.shield = Math.min(e.maxShield, e.shield + e.maxShield * 0.25 * dt);
    }
    if (e.def.phase) { e.phased = (e.anim % 3.2) > 2.3; }
    if (e.def.heal) {
      e.timers.heal = (e.timers.heal || 2) - dt;
      if (e.timers.heal <= 0) {
        e.timers.heal = 2;
        for (const o of this.enemies) {
          if (o.alive && o !== e && dist2(o.x, o.y, e.x, e.y) < 900) { o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.06 * (e.healMult || 1)); }
        }
        this.ring(e.x, e.y, 30, '#4dff8a');
      }
    }
    if (e.boss) this.bossLogic(e, dt);
    if (!e.alive) return;

    // movement
    let spd = e.speed * Math.max(0.2, 1 + this.mods.enemySpeed);
    if (this.overtime) { e.freeze = 0; e.stun = 0; e.slow = 0; e.held = 0; spd *= 1.5; }
    if (e.freeze > 0 || (e.stun > 0) || e.held > 0) spd = 0;
    if (e.slow > 0) spd *= 1 - e.slow;
    if (e.spawnSlow > 0) spd *= 0.5;
    if (e.auraT > 0) spd *= 1.3;
    if (this.tb.slow) spd *= Math.max(0.2, 1 - this.tb.slow);
    if (!e.flying) {
      const t = this.world.tile(Math.floor(e.x / TS), Math.floor(e.y / TS));
      if (t === T.SLUDGE && !e.def.nullify) spd *= 0.6;
      if (t === T.RIFT && !e.rifted) {
        e.rifted = true;
        e.maxHp *= 1.5; e.hp *= 1.5; e.goldMult *= 2;
        this.ring(e.x, e.y, 10, '#ff2f5a');
      }
      if (t === T.ACCEL && !e.accel) {
        e.accel = true;
        e.speed *= 1.4; e.goldMult *= 1.75;
        this.ring(e.x, e.y, 8, '#ffe84a');
      }
    }
    if (e.def.blink || e.blink) {
      e.timers.blink -= dt;
      if (e.timers.blink <= 0 && e.i < e.route.length - 5 && !e.blocker) {
        e.timers.blink = 4;
        this.burst(e.x, e.y, '#2ef2ff', 8);
        const ni = Math.min(e.route.length - 2, e.i + 3);
        e.traveled += (ni - e.i) * TS;
        e.i = ni;
        [e.x, e.y] = e.route[ni];
        this.burst(e.x, e.y, '#ff3df2', 8);
      }
    }
    if (e.blocker) {
      if (!e.blocker.alive || dist2(e.blocker.x, e.blocker.y, e.x, e.y) > 196) e.blocker = null;
      else {
        spd = 0;
        e.blocker.hp -= e.atk * dt;
        if (e.blocker.hp <= 0) this.killUnit(e.blocker);
      }
    }
    let move = spd * dt;
    while (move > 0 && e.i < e.route.length - 1) {
      const [tx, ty] = e.route[e.i + 1];
      const dx = tx - e.x, dy = ty - e.y;
      const d = Math.hypot(dx, dy);
      if (dx) e.dir = Math.sign(dx);
      if (d <= move) { e.x = tx; e.y = ty; e.i++; move -= d; e.traveled += d; }
      else { e.x += (dx / d) * move; e.y += (dy / d) * move; e.traveled += move; move = 0; }
    }
    if (e.i >= e.route.length - 1) {
      e.alive = false;
      this.stats.leaks++;
      this.damageCore(e.core, false, e.corrupted ? 'Corrupted ' + e.def.name : e.def.name);
      this.burst(e.x, e.y, '#ff2f5a', 10);
    }
  }

  bossLogic(e, dt) {
    const d = e.def;
    for (const k in e.timers) e.timers[k] -= dt;
    if (d.shieldType) {
      if (e.timers.weak <= 0) {
        const types = ['kin', 'eng', 'exp'];
        e.weak = types[(types.indexOf(e.weak) + 1) % types.length];
        e.timers.weak = 7;
      }
      if (!e.rebuilt && e.hp < e.maxHp * 0.5) {
        e.rebuilt = true;
        e.shield = e.maxShield * 0.75;
        this.ring(e.x, e.y, 24, '#2ef2ff');
      }
    }
    if (d.spawner && e.timers.spawn <= 0) {
      e.timers.spawn = d.flying ? 5 : 4;
      const at = { x: e.x, y: e.y, i: e.i, traveled: e.traveled, route: e.route };
      if (d.flying) { for (let k = 0; k < 2; k++) this.spawnEnemy('wasp', 0, null, at); }
      else for (let k = 0; k < 3; k++) this.spawnEnemy('swarm', 0, null, at);
    }
    if (d.emp && e.timers.emp <= 0) {
      e.timers.emp = 7;
      this.ring(e.x, e.y, 64, '#ffe84a');
      this.sfx('emp');
      if (!this.tb.empImmune) for (const tw of this.towers) if (dist2(tw.x, tw.y, e.x, e.y) < 64 * 64) tw.disabled = Math.max(tw.disabled, 3);
      this.recomputeStats();
    }
    if (d.teleport && e.timers.tp <= 0 && e.i < e.route.length - 6) {
      e.timers.tp = 5;
      this.burst(e.x, e.y, '#ff3df2', 14);
      const ni = Math.min(e.route.length - 2, e.i + 4);
      for (let k = e.i; k < ni; k++) e.traveled += TS;
      e.i = ni;
      [e.x, e.y] = e.route[ni];
      e.phasedT = 0.6;
      this.burst(e.x, e.y, '#ff3df2', 14);
    }
    if (d.teleport) { e.phasedT = (e.phasedT || 0) - dt; e.phased = e.phasedT > 0; }
  }

  // ---------------- targeting ----------------
  canTarget(tw, e, s) {
    if (!e.alive || e.phased) return false;
    if (tw.def.ground && e.flying) return false;
    const d2 = dist2(tw.x, tw.y, e.x, e.y);
    if (d2 > s.range * s.range) return false;
    if (s.minRange && d2 < s.minRange * s.minRange) return false;
    if (e.cloaked && !tw.reveal && d2 > 40 * 40) return false;
    return true;
  }

  targets(tw, n = 1, exclude = null) {
    const s = tw.stats;
    const c = [];
    for (const e of this.enemies) if (e !== exclude && this.canTarget(tw, e, s)) c.push(e);
    if (!c.length) return c;
    const key = {
      first: (e) => e.len - e.traveled,
      last: (e) => -(e.len - e.traveled),
      strong: (e) => -(e.hp + e.shield),
      close: (e) => dist2(tw.x, tw.y, e.x, e.y),
    }[tw.mode];
    c.sort((a, b) => key(a) - key(b));
    return c.slice(0, n);
  }

  updateTower(tw, dt) {
    if (tw.disabled > 0) {
      tw.disabled -= dt;
      tw.beam = [];
      if (tw.disabled <= 0 && tw.def.buff) this.recomputeStats();
      return;
    }
    if (tw.overheat) { tw.beam = []; return; }
    if (tw.oc > 0) {
      tw.oc -= dt;
      if (tw.oc <= 0) {
        tw.oc = 0; tw.overheat = 1; tw.heatUntil = this.wave + 1; tw.beam = [];
        this.text(tw.x, tw.y - 8, 'OVERHEAT', '#ff5533', 0.8);
        return;
      }
    }
    tw.rateMul = (tw.oc > 0 ? 2 : 1) * (1 + (this.tb.rate || 0));
    const s = tw.stats;
    const d = tw.def;
    if (d.drones) return this.updateDroneBay(tw, dt);
    if (d.proj === 'none') return;
    if (tw.type === 'cryo' && s.br.aura) {
      tw.cd -= dt;
      if (tw.cd <= 0) {
        tw.cd = 0.5;
        let any = false;
        for (const e of this.enemies) {
          if (!this.canTarget(tw, e, s)) continue;
          any = true;
          this.applyStatus(tw, e, s);
          this.damage(e, s.dmg * 0.5, 'cry', tw);
        }
        if (any) this.ring(tw.x, tw.y, s.range, '#8fe8ff', 0.4);
      }
      return;
    }
    if (d.proj === 'beam') return this.updateLaser(tw, dt);
    tw.cd -= dt;
    if (tw.cd > 0) return;
    const ts = this.targets(tw, s.multi);
    if (!ts.length) { tw.cd = 0.05; return; }
    tw.angle = Math.atan2(ts[0].y - tw.y, ts[0].x - tw.x);
    tw.cd = 1 / (s.rate * tw.rateMul);
    if (tw.type === 'blaster' && this.mods.doubleTap && this.rng() < this.mods.doubleTap) tw.cd = 0.08;
    tw.recoil = 1;
    for (const tgt of ts) this.fire(tw, tgt);
  }

  fire(tw, tgt) {
    const s = tw.stats, d = tw.def;
    const mx = tw.x + Math.cos(tw.angle) * 7, my = tw.y + Math.sin(tw.angle) * 7;
    switch (d.proj) {
      case 'bolt':
      case 'orb': {
        const pierce = s.pierce > 0;
        const ang = Math.atan2(tgt.y - my, tgt.x - mx);
        this.projectiles.push({
          kind: d.proj, tw, x: mx, y: my, target: pierce ? null : tgt, tx: tgt.x, ty: tgt.y,
          vx: Math.cos(ang) * d.projSpeed, vy: Math.sin(ang) * d.projSpeed, speed: d.projSpeed,
          life: (s.range * 1.4) / d.projSpeed, pierce: s.pierce, hit: new Set(), color: d.color, alive: true,
        });
        this.sfx(tw.type === 'cryo' ? 'cryo' : 'shoot');
        break;
      }
      case 'shell':
      case 'glob': {
        const flight = dist(mx, my, tgt.x, tgt.y) / d.projSpeed;
        // lead the target a little
        const lead = this.predict(tgt, flight);
        this.projectiles.push({ kind: d.proj, tw, x: mx, y: my, sx: mx, sy: my, tx: lead[0], ty: lead[1], t: 0, flight, color: d.color, alive: true });
        this.sfx(d.proj === 'shell' ? 'cannon' : 'glob');
        break;
      }
      case 'mortar': {
        const n = s.br.volley || 1;
        for (let k = 0; k < n; k++) {
          const lead = this.predict(tgt, 1.1);
          const ox = k ? (this.rng() - 0.5) * 40 : 0, oy = k ? (this.rng() - 0.5) * 40 : 0;
          this.projectiles.push({ kind: 'mortar', tw, x: tw.x, y: tw.y, sx: tw.x, sy: tw.y, tx: lead[0] + ox, ty: lead[1] + oy, t: -k * 0.15, flight: 1.1, color: d.color, alive: true });
        }
        this.sfx('mortar');
        break;
      }
      case 'hole': {
        const lead = this.predict(tgt, 0.8);
        this.projectiles.push({ kind: 'hole', tw, x: mx, y: my, sx: mx, sy: my, tx: lead[0], ty: lead[1], t: 0, flight: 0.8, color: d.color, alive: true });
        this.sfx('glob');
        break;
      }
      case 'chain': this.fireChain(tw, tgt); break;
      case 'rail': this.fireRail(tw, tgt); break;
    }
  }

  predict(e, t) {
    // walk along route by speed*t
    let move = e.speed * (1 - e.slow) * t * (e.freeze > 0 || e.stun > 0 || e.blocker ? 0 : 1);
    let x = e.x, y = e.y, i = e.i;
    while (move > 0 && i < e.route.length - 1) {
      const [tx, ty] = e.route[i + 1];
      const d = Math.hypot(tx - x, ty - y);
      if (d <= move) { x = tx; y = ty; i++; move -= d; } else { x += ((tx - x) / d) * move; y += ((ty - y) / d) * move; move = 0; }
    }
    return [x, y];
  }

  fireChain(tw, first) {
    const s = tw.stats;
    const hit = new Set();
    let cur = first, px = tw.x, py = tw.y - 4, dmg = s.dmg;
    for (let k = 0; k <= s.chains && cur; k++) {
      hit.add(cur);
      this.line(px, py, cur.x, cur.y, '#ffe84a', 'chain');
      this.hit(tw, cur, dmg, s);
      px = cur.x; py = cur.y;
      dmg *= 0.85;
      let best = null, bd = s.chainRange * s.chainRange;
      for (const e of this.enemies) {
        if (!e.alive || hit.has(e) || e.phased) continue;
        const d2 = dist2(px, py, e.x, e.y);
        if (d2 < bd) { bd = d2; best = e; }
      }
      cur = best;
    }
    this.sfx('zap');
  }

  fireRail(tw, tgt) {
    const s = tw.stats;
    const ang = Math.atan2(tgt.y - tw.y, tgt.x - tw.x);
    tw.angle = ang;
    const ex = tw.x + Math.cos(ang) * s.range * 1.1, ey = tw.y + Math.sin(ang) * s.range * 1.1;
    const cands = [];
    for (const e of this.enemies) {
      if (!e.alive || e.phased) continue;
      // projection onto the segment
      const vx = ex - tw.x, vy = ey - tw.y;
      const t = ((e.x - tw.x) * vx + (e.y - tw.y) * vy) / (vx * vx + vy * vy);
      if (t < 0 || t > 1) continue;
      const cx = tw.x + vx * t, cy = tw.y + vy * t;
      if (dist2(cx, cy, e.x, e.y) <= (e.size + 3) * (e.size + 3)) cands.push([t, e]);
    }
    cands.sort((a, b) => a[0] - b[0]);
    const hits = cands.slice(0, Math.max(1, s.pierce));
    if (!hits.some(([, e]) => e === tgt)) hits.unshift([0, tgt]);
    const lastT = s.pierce >= 99 ? 1 : (hits[hits.length - 1][0] || 0.5);
    this.line(tw.x, tw.y, tw.x + (ex - tw.x) * Math.max(lastT, 0.1), tw.y + (ey - tw.y) * Math.max(lastT, 0.1), '#ff3df2', 'rail');
    for (const [, e] of hits) this.hit(tw, e, s.dmg, s, { rail: true });
    if (s.br.chainOnHit) for (const [, e] of hits) this.chainFrom(tw, e, s.br.chainOnHit, s.dmg * 0.3);
    this.sfx('rail');
    this.shake = Math.min(4, this.shake + 0.6);
  }

  chainFrom(tw, from, jumps, dmg) {
    const hit = new Set([from]);
    let px = from.x, py = from.y;
    for (let k = 0; k < jumps; k++) {
      let best = null, bd = 34 * 34;
      for (const e of this.enemies) {
        if (!e.alive || hit.has(e) || e.phased) continue;
        const d2 = dist2(px, py, e.x, e.y);
        if (d2 < bd) { bd = d2; best = e; }
      }
      if (!best) break;
      hit.add(best);
      this.line(px, py, best.x, best.y, '#ffe84a', 'chain');
      best.shock = 1.5;
      this.damage(best, dmg, 'eng', tw);
      px = best.x; py = best.y;
    }
  }

  updateLaser(tw, dt) {
    const s = tw.stats;
    let tgt = tw.rampTarget;
    if (!tgt || !this.canTarget(tw, tgt, s)) {
      const ts = this.targets(tw, 1);
      tgt = ts[0] || null;
      if (tgt !== tw.rampTarget) tw.rampT = 0;
      tw.rampTarget = tgt;
    }
    tw.beam = [];
    if (!tgt) return;
    tw.angle = Math.atan2(tgt.y - tw.y, tgt.x - tw.x);
    tw.rampT = Math.min(s.rampTime, tw.rampT + dt);
    const mult = 1 + (s.ramp - 1) * (tw.rampT / s.rampTime);
    const dps = s.dmg * mult * s.rate * (tw.rateMul || 1);
    tw.beam.push([tgt, mult]);
    this.hit(tw, tgt, dps * dt, s, { beam: true, armorScale: dt * s.rate });
    if (s.br.prism) {
      const extras = [];
      for (const e of this.enemies) {
        if (e === tgt || !e.alive || e.phased) continue;
        if (dist2(e.x, e.y, tgt.x, tgt.y) < 40 * 40) extras.push(e);
        if (extras.length >= s.br.prism) break;
      }
      for (const e of extras) { tw.beam.push([e, mult * 0.5, tgt]); this.hit(tw, e, dps * dt * 0.5, s, { beam: true, armorScale: dt * s.rate }); }
    }
    if (Math.random() < dt * 6) this.sfx('laser');
  }

  updateDroneBay(tw, dt) {
    const s = tw.stats;
    if (!tw.rally) return;
    for (let idx = 0; idx < s.drones; idx++) {
      const d = tw.drones[idx];
      if (!d) { tw.drones[idx] = this.makeDrone(tw, idx); continue; }
      if (!d.alive) {
        d.respawn -= dt;
        if (d.respawn <= 0) tw.drones[idx] = this.makeDrone(tw, idx);
        continue;
      }
      d.maxHp = s.droneHp;
      d.dmg = s.droneDmg;
    }
    for (let idx = s.drones; idx < tw.drones.length; idx++) if (tw.drones[idx]) tw.drones[idx].alive = false;
    tw.drones.length = Math.min(tw.drones.length, s.drones);
  }

  makeDrone(tw, idx) {
    const s = tw.stats;
    const ang = (idx / Math.max(1, s.drones)) * Math.PI * 2;
    const d = {
      kind: 'drone', tw, x: tw.x, y: tw.y, hp: s.droneHp, maxHp: s.droneHp, dmg: s.droneDmg, rate: tw.def.droneRate,
      cd: 0, off: [Math.cos(ang) * 5, Math.sin(ang) * 5], engaged: null, alive: true, respawn: 0, anim: Math.random() * 6,
    };
    this.units.push(d);
    return d;
  }

  updateUnit(u, dt) {
    u.anim += dt;
    if (u.kind === 'drone') {
      const tw = u.tw;
      if (!this.towers.includes(tw)) { u.alive = false; return; }
      if (tw.disabled > 0) return;
      const [rx, ry] = tw.rally;
      if (u.engaged && (!u.engaged.alive || dist2(u.engaged.x, u.engaged.y, rx, ry) > 40 * 40)) {
        if (u.engaged.blocker === u) u.engaged.blocker = null;
        u.engaged = null;
      }
      if (!u.engaged) {
        let best = null, bd = 30 * 30;
        for (const e of this.enemies) {
          if (!e.alive || e.flying || e.phased || (e.blocker && e.blocker !== u)) continue;
          const d2 = dist2(e.x, e.y, rx, ry);
          if (d2 < bd) { bd = d2; best = e; }
        }
        u.engaged = best;
      }
      const tx = u.engaged ? u.engaged.x : rx + u.off[0];
      const ty = u.engaged ? u.engaged.y : ry + u.off[1];
      this.moveToward(u, tx, ty, 70, dt);
      if (u.engaged && dist2(u.x, u.y, u.engaged.x, u.engaged.y) < 100) {
        if (!u.engaged.boss && !u.engaged.blocker) u.engaged.blocker = u;
        u.cd -= dt;
        if (u.cd <= 0) {
          const target = u.engaged; // kill() may clear u.engaged
          u.cd = 1 / u.rate;
          this.damage(target, u.dmg, 'kin', tw);
          this.particle(target.x, target.y, '#3d7bff', 0, 0, 0.2);
        }
      }
    } else if (u.kind === 'husk') {
      u.life -= dt;
      if (u.life <= 0) { this.killUnit(u); return; }
      if (u.engaged && !u.engaged.alive) u.engaged = null;
      if (!u.engaged) {
        for (const e of this.enemies) {
          if (!e.alive || e.flying || e.phased) continue;
          if (dist2(e.x, e.y, u.x, u.y) < 81) { u.engaged = e; if (!e.boss && !e.blocker) e.blocker = u; break; }
        }
      }
      if (u.engaged) {
        u.cd -= dt;
        if (u.cd <= 0) { u.cd = 0.5; this.damage(u.engaged, u.dmg, 'bio', u.tw); }
      } else if (u.i > 0) {
        const [tx, ty] = u.route[u.i - 1];
        if (this.moveToward(u, tx, ty, u.speed, dt)) u.i--;
      } else this.killUnit(u);
    }
  }

  moveToward(u, tx, ty, spd, dt) {
    const dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy);
    if (d < 0.5) return true;
    const m = Math.min(d, spd * dt);
    u.x += (dx / d) * m; u.y += (dy / d) * m;
    return m >= d;
  }

  killUnit(u) {
    if (!u.alive) return;
    u.alive = false;
    if (u.kind === 'drone') u.respawn = 5;
    this.burst(u.x, u.y, u.kind === 'drone' ? '#3d7bff' : '#b6ff3d', 6);
  }

  updateProjectile(p, dt) {
    if (p.kind === 'bolt' || p.kind === 'orb') {
      if (p.target) {
        if (p.target.alive) { p.tx = p.target.x; p.ty = p.target.y; }
        const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
        const m = p.speed * dt;
        if (d <= m + 2) {
          p.alive = false;
          if (p.target.alive) this.projectileHit(p, p.target);
          return;
        }
        p.vx = (dx / d) * p.speed; p.vy = (dy / d) * p.speed;
        p.x += p.vx * dt; p.y += p.vy * dt;
      } else {
        p.x += p.vx * dt; p.y += p.vy * dt;
        for (const e of this.enemies) {
          if (!e.alive || e.phased || p.hit.has(e)) continue;
          if (dist2(p.x, p.y, e.x, e.y) < (e.size + 2) * (e.size + 2)) {
            p.hit.add(e);
            this.projectileHit(p, e);
            if (p.hit.size >= p.pierce) { p.alive = false; break; }
          }
        }
      }
      p.life -= dt;
      if (p.life <= 0) p.alive = false;
    } else {
      p.t += dt;
      if (p.t < 0) return;
      const k = Math.min(1, p.t / p.flight);
      p.x = p.sx + (p.tx - p.sx) * k;
      p.y = p.sy + (p.ty - p.sy) * k;
      p.h = p.kind === 'mortar' ? Math.sin(k * Math.PI) * 40 : p.kind === 'hole' ? Math.sin(k * Math.PI) * 18 : Math.sin(k * Math.PI) * 6;
      if (k >= 1) { p.alive = false; if (p.kind === 'hole') this.openHole(p); else this.explode(p); }
    }
  }

  projectileHit(p, e) {
    const tw = p.tw, s = tw.stats;
    if (s.splash && tw.type === 'cryo') {
      for (const o of this.enemies) if (o.alive && dist2(o.x, o.y, e.x, e.y) < s.splash * s.splash) this.hit(tw, o, o === e ? s.dmg : s.dmg * 0.5, s);
    } else this.hit(tw, e, s.dmg, s);
    this.burst(e.x, e.y, p.color, 3);
  }

  explode(p) {
    const tw = p.tw, s = tw.stats;
    const r = s.splash;
    this.ring(p.x, p.y, r, p.color);
    this.burst(p.x, p.y, p.color, p.kind === 'glob' ? 6 : 10);
    if (p.kind !== 'glob') this.sfx('boom');
    const dmg = p.mini ? s.dmg * 0.4 : s.dmg;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (p.kind === 'mortar' && e.flying) continue;
      if (dist2(e.x, e.y, p.x, p.y) <= (r + e.size) * (r + e.size)) this.hit(tw, e, dmg, s, { splash: true });
    }
    if (p.kind === 'shell' && s.br.cluster && !p.mini) {
      for (let k = 0; k < s.br.cluster; k++) {
        const a = this.rng() * Math.PI * 2, d = 10 + this.rng() * 14;
        this.projectiles.push({ kind: 'shell', mini: true, tw, x: p.x, y: p.y, sx: p.x, sy: p.y, tx: p.x + Math.cos(a) * d, ty: p.y + Math.sin(a) * d, t: 0, flight: 0.3, color: p.color, alive: true });
      }
    }
    if (p.kind === 'mortar' && s.br.napalm) this.fields.push({ x: p.x, y: p.y, r: r * 0.8, dps: s.dmg * 0.35, t: 3, tick: 0, tw });
    if (p.kind === 'mortar') this.shake = Math.min(5, this.shake + 1);
  }

  // ---- black holes ----
  openHole(p) {
    const tw = p.tw, s = tw.stats;
    this.holes.push({ x: p.x, y: p.y, r: s.holeR, t: s.holeDur, max: s.holeDur, tick: 0, arc: 0, tw, held: new Set(), color: tw.def.color, spin: this.rng() * 6 });
    this.ring(p.x, p.y, s.holeR, tw.def.color, 0.4);
    this.sfx('portal');
  }

  updateHole(h, dt) {
    const tw = h.tw, s = tw.stats;
    h.t -= dt;
    h.spin += dt;
    // Pull: ordinary enemies are dragged to the centre and held; bosses and
    // mini-bosses are only slowed. Freshly released enemies can't be re-grabbed at once.
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d2 = dist2(e.x, e.y, h.x, h.y);
      if (d2 > (h.r + e.size) * (h.r + e.size)) continue;
      if (e.boss || e.mini || e.def.nullify || this.overtime) { e.slow = Math.max(e.slow, 0.5); e.slowT = Math.max(e.slowT, 0.2); continue; }
      if (!h.held.has(e) && e.holeImmune > 0) { e.slow = Math.max(e.slow, 0.5); e.slowT = Math.max(e.slowT, 0.2); continue; }
      h.held.add(e);
      e.held = 0.1;
      const k = Math.min(1, dt * 5);
      e.x += (h.x - e.x) * k; e.y += (h.y - e.y) * k;
    }
    h.tick -= dt;
    if (h.tick <= 0) {
      h.tick = 0.25;
      for (const e of h.held) if (e.alive) this.damage(e, s.dmg * 0.25, 'eng', tw, { armorScale: 0.25 });
      if (s.br.quasar) {
        let n = 0;
        for (const e of this.enemies) {
          if (!e.alive || e.phased || n >= 5) continue;
          if (dist2(e.x, e.y, h.x, h.y) > (h.r * 2.5) * (h.r * 2.5)) continue;
          n++;
          this.line(h.x, h.y, e.x, e.y, '#7fd8ff', 'chain');
          e.shock = 1.5;
          this.damage(e, s.dmg * 0.3, 'eng', tw);
        }
        if (n) this.sfx('zap');
      }
    }
    if (this.rng() < dt * 30) {
      const a = this.rng() * Math.PI * 2, d = h.r + 6;
      this.particle(h.x + Math.cos(a) * d, h.y + Math.sin(a) * d, this.rng() < 0.5 ? h.color : '#ff3df2', -Math.cos(a) * d * 2.2, -Math.sin(a) * d * 2.2, 0.4);
    }
    if (h.t <= 0) this.closeHole(h);
  }

  closeHole(h) {
    const tw = h.tw, s = tw.stats;
    const held = [...h.held].filter((e) => e.alive);
    for (const e of held) { e.held = 0; e.holeImmune = 1.5; }
    if (s.br.collapse) {
      const r = h.r * 1.6;
      const dmg = s.dmg * 3 * (1 + 0.25 * held.length);
      this.ring(h.x, h.y, r, '#ffffff', 0.5);
      this.ring(h.x, h.y, r * 0.6, h.color, 0.5);
      this.burst(h.x, h.y, h.color, 18);
      for (const e of this.enemies) if (e.alive && dist2(e.x, e.y, h.x, h.y) <= (r + e.size) * (r + e.size)) this.hit(tw, e, dmg, s, { splash: true });
      this.shake = Math.min(5, this.shake + 1.5);
      this.sfx('boom');
      if (held.length >= 4) this.text(h.x, h.y - 10, 'COLLAPSE x' + held.length, '#ffffff', 0.8);
    }
    if (s.br.wormhole) {
      for (const e of this.enemies) {
        if (!e.alive || !(e.boss || e.mini) || e.flying || e.i < 1) continue;
        if (dist2(e.x, e.y, h.x, h.y) > (h.r + e.size) * (h.r + e.size)) continue;
        const ni = Math.max(0, e.i - 2);
        e.traveled = Math.max(0, e.traveled - (e.i - ni) * TS); e.i = ni; [e.x, e.y] = e.route[ni];
        this.burst(e.x, e.y, '#ff3df2', 10);
        this.hit(tw, e, s.dmg * 6, s);
      }
      for (const e of held) {
        if (!e.alive || e.i < 1) continue;
        const ni = Math.max(0, e.i - s.br.wormhole);
        e.traveled = Math.max(0, e.traveled - (e.i - ni) * TS); e.i = ni; [e.x, e.y] = e.route[ni];
        this.burst(e.x, e.y, '#ff3df2', 5);
        this.hit(tw, e, s.dmg * 6, s);
      }
      if (held.length) { this.ring(h.x, h.y, h.r, '#ff3df2', 0.4); this.sfx('portal'); }
    }
    this.burst(h.x, h.y, h.color, 8);
  }

  updateField(f, dt) {
    f.t -= dt;
    f.tick -= dt;
    if (f.tick > 0) return;
    f.tick = 0.25;
    for (const e of this.enemies) {
      if (e.alive && !e.flying && dist2(e.x, e.y, f.x, f.y) < f.r * f.r) this.damage(e, f.dps * 0.25, 'exp', f.tw, { dot: true });
    }
    this.particle(f.x + (this.rng() - 0.5) * f.r, f.y + (this.rng() - 0.5) * f.r, '#ff8a1f', 0, -12, 0.5);
  }

  applyStatus(tw, e, s) {
    if (e.def.nullify) return;
    const br = s.br;
    if (s.slow) {
      e.slow = Math.max(e.slow, e.boss ? s.slow * 0.6 : s.slow);
      e.slowT = Math.max(e.slowT, s.slowDur);
      if (br.freeze && e.ccImmune <= 0 && this.rng() < br.freeze) { e.freeze = e.boss ? 0.3 : 1; e.ccImmune = e.freeze + 1.5; }
    }
    if (tw.type === 'tesla' || br.shockBeam || br.chainOnHit) {
      e.shock = 1.5;
      if (br.stun && e.ccImmune <= 0 && this.rng() < br.stun) { e.stun = e.boss ? 0.2 : 0.7; e.ccImmune = e.stun + 1.5; }
    }
    if (s.poison) {
      e.poison = Math.max(e.poison, s.poison);
      e.poisonT = Math.max(e.poisonT, s.poisonDur);
      e.poisonSrc = tw;
      if (br.plague) e.plague = true;
      if (br.corrode) e.corrode = s.poisonDur;
    }
  }

  // A tower's hit: crits, combos, then damage + statuses.
  hit(tw, e, dmg, s, opts = {}) {
    if (!e.alive || e.phased) return;
    const combo = this.mods.combo;
    const chilled = e.slowT > 0 || e.freeze > 0;
    let crit = !opts.beam && this.rng() < s.crit + (this.tb.crit || 0);
    if (this.tb.dmg) dmg *= 1 + this.tb.dmg;
    if (opts.rail && e.shock > 0) { crit = true; this.comboFx(e, 'CONDUCT'); }
    if (crit) dmg *= s.critMult;
    if (tw.type === 'tesla' && chilled) {
      dmg *= 1 + 0.5 * combo;
      this.comboFx(e, 'SHATTER');
      for (const o of this.enemies) if (o !== e && o.alive && dist2(o.x, o.y, e.x, e.y) < 196) this.damage(o, dmg * 0.3, 'cry', tw);
    }
    if (tw.type === 'laser' && chilled) { dmg *= 1 + 0.4 * combo; if (Math.random() < 0.02) this.comboFx(e, 'THERMAL'); else if (Math.random() < 0.05) this.stats.combos++; }
    if (opts.splash && e.poisonT > 0 && (tw.type === 'cannon' || tw.type === 'mortar')) {
      const burst = e.poison * e.poisonT * combo;
      e.poisonT = 0; e.poison = 0;
      this.comboFx(e, 'DETONATE');
      this.ring(e.x, e.y, 16, '#4dff8a');
      for (const o of this.enemies) if (o.alive && dist2(o.x, o.y, e.x, e.y) < 324) this.damage(o, burst * (o === e ? 1 : 0.5), 'exp', tw);
    }
    this.applyStatus(tw, e, s);
    if (tw.relic && !e.def.nullify) {
      if (tw.relic === 'frostshell') { e.slow = Math.max(e.slow, 0.25); e.slowT = Math.max(e.slowT, 1.5); }
      if (tw.relic === 'toxic') { e.poison = Math.max(e.poison, dmg * 0.25); e.poisonT = Math.max(e.poisonT, 3); e.poisonSrc = tw; }
    }
    this.damage(e, dmg, tw.def.dtype, tw, { crit, execute: s.execute, armorScale: opts.armorScale });
    if (tw.relic === 'ricochet' && !opts.rico) {
      let best = null, bd = 40 * 40;
      for (const o of this.enemies) {
        if (o === e || !o.alive || o.phased) continue;
        const d2 = dist2(o.x, o.y, e.x, e.y);
        if (d2 < bd) { bd = d2; best = o; }
      }
      if (best) { this.hit(tw, best, dmg * 0.5, s, { ...opts, rico: true }); if (!opts.beam) this.line(e.x, e.y, best.x, best.y, '#ff8a1f', 'chain'); }
    }
  }

  comboFx(e, name) {
    this.stats.combos++;
    if (Math.random() < 0.35) this.text(e.x, e.y - 8, name, '#ffffff', 0.7);
  }

  damage(e, amt, dtype, tw, opts = {}) {
    if (!e.alive || (e.phased && !opts.dot)) return;
    let a = amt;
    if (e.boss) a *= 1 + this.mods.bossDmg;
    if (this.tb.dmgTaken) a *= 1 + this.tb.dmgTaken;
    if ((e.slowT > 0 || e.freeze > 0) && this.mods.brittle) a *= 1 + this.mods.brittle;
    if (e.corrode > 0) a *= 1.25;
    if (e.shield > 0) {
      let sm = 1 + this.mods.shieldDmg;
      if (e.def.shieldType && dtype !== e.weak) sm *= 0.1;
      const sa = a * sm;
      const absorbed = Math.min(e.shield, sa);
      e.shield -= absorbed;
      e.shieldDelay = 3;
      a = (sa - absorbed) / sm;
      if (a <= 0) { e.hitFlash = 0.05; return; }
    }
    if (dtype !== 'bio' && !(e.corrode > 0) && e.armor > 0) {
      // Beams hit every frame, so armor is scaled to the slice of a second they cover.
      const ar = e.armor * (dtype === 'eng' ? 0.5 : 1) * (opts.armorScale != null ? opts.armorScale : opts.dot ? 0.1 : 1);
      a = Math.max(a * 0.25, a - ar);
    }
    e.hp -= a;
    if (tw) tw.dmgDealt += a;
    if (!opts.dot) e.hitFlash = 0.06;
    if (opts.crit && Math.random() < 0.3) this.text(e.x, e.y - 6, Math.round(a) + '!', '#ffe84a', 0.5);
    const exec = Math.max(this.mods.execute, opts.execute || 0);
    if (!e.boss && exec && e.hp > 0 && e.hp < e.maxHp * exec) e.hp = 0;
    if (e.hp <= 0) this.kill(e, tw);
  }

  kill(e, tw) {
    if (!e.alive) return;
    e.alive = false;
    if (e.blocker && e.blocker.engaged === e) e.blocker.engaged = null;
    this.stats.kills++;
    this.stats.kinds[e.type] = (this.stats.kinds[e.type] || 0) + 1;
    if (tw) {
      tw.kills += tw.relic === 'medal' ? 2 : 1;
      if (!this.stats.tkills) this.stats.tkills = {};
      this.stats.tkills[tw.type] = (this.stats.tkills[tw.type] || 0) + 1;
      const rank = VETERANCY.filter((v) => tw.kills >= v.kills).length;
      if (rank > (tw.vet || 0)) {
        tw.vet = rank;
        const v = VETERANCY[rank - 1];
        this.text(tw.x, tw.y - 10, v.name.toUpperCase() + ' RANK', v.color);
        this.ring(tw.x, tw.y, 14, v.color);
        this.recomputeStats();
      }
    }
    let g = e.gold * this.mods.goldMult * e.goldMult + this.mods.killGold;
    if (e.elite || e.boss || e.mini) g *= this.mods.eliteGold;
    if (tw && tw.relic === 'bounty') g += 3;
    if (this.tb.gold) g *= 1 + this.tb.gold;
    this.addGold(g);
    if (e.rifted && this.rng() < 0.06) { this.shards++; this.text(e.x, e.y, '+1 shard', '#ff3df2'); }
    this.burst(e.x, e.y, e.boss ? '#ffe84a' : '#ff3df2', e.boss ? 40 : 8);
    this.sfx(e.boss ? 'bossdie' : 'die');
    if (e.elite) {
      this.stats.elites++;
      if (this.rng() < 0.15) { this.shards++; this.text(e.x, e.y, '+1 shard', '#ff3df2'); }
    }
    if (e.boss) {
      const sh = 3 + e.bossIdx;
      this.shards += sh;
      this.stats.bosses.push(e.def.id);
      this.toast(`${e.def.name.toUpperCase()} DESTROYED  +${sh} shards`, '#ffe84a');
      this.shake = 8;
    }
    const at = { x: e.x, y: e.y, i: e.i, traveled: e.traveled, route: e.route };
    const sp = e.split || e.def.split;
    if (sp) for (let k = 0; k < sp; k++) this.spawnEnemy('splitling', 0, null, at);
    if (e.mini) { this.shards += 2; this.toast(e.def.name.toUpperCase() + ' DESTROYED  +2 shards', '#ffd23f'); }
    if (e.boss && e.def.id === 'hive') for (let k = 0; k < 6; k++) this.spawnEnemy('crawler', 0, null, at);
    if (e.plague && e.poisonT > 0) {
      for (const o of this.enemies) {
        if (o.alive && dist2(o.x, o.y, e.x, e.y) < 24 * 24) {
          if (o.def.nullify) continue;
          o.poison = Math.max(o.poison, e.poison); o.poisonT = Math.max(o.poisonT, 3); o.plague = true; o.poisonSrc = e.poisonSrc;
        }
      }
      this.ring(e.x, e.y, 24, '#4dff8a', 0.4);
    }
    // reclaimers
    if (!e.boss && !e.flying) {
      for (const r of this.towers) {
        if (!r.def.revive || r.disabled > 0) continue;
        if (dist2(r.x, r.y, e.x, e.y) > r.stats.range * r.stats.range) continue;
        if (r.stats.br.siphon) { this.addGold(r.stats.br.siphon); }
        if (this.rng() < r.stats.revive && this.units.filter((u) => u.kind === 'husk').length < 25) {
          const mult = r.stats.br.husk || 1;
          this.units.push({
            kind: 'husk', tw: r, x: e.x, y: e.y, route: e.route, i: e.i + 1, alive: true, anim: 0, cd: 0,
            hp: Math.min(e.maxHp * 0.6, 40 * this.hpScale(this.wave)) * (1 + this.mods.huskHp) * mult, dmg: 6 * r.stats.dmgMult * mult * (1 + this.wave * 0.08),
            speed: 20, life: 20, engaged: null,
          });
          const u = this.units[this.units.length - 1];
          u.maxHp = u.hp;
          this.burst(e.x, e.y, '#b6ff3d', 8);
          break;
        }
      }
    }
  }

  // ---------------- commander abilities ----------------
  abilityReady(id) { return this.phase === 'wave' && !((this.cooldowns[id] || 0) > 0); }

  useAbility(id) {
    if (!this.abilities.includes(id) || !this.abilityReady(id)) return false;
    const A = ABILITIES[id];
    this.cooldowns[id] = A.cd;
    const alive = this.enemies.filter((e) => e.alive);
    const pctHit = (e, p, pb) => { this.burst(e.x, e.y, A.color, 8); this.damage(e, e.maxHp * (e.boss ? pb : p), 'eng', null); };
    const strongest = (list) => list.slice().sort((a, b) => (b.hp + b.shield) - (a.hp + a.shield));
    const cx = center(3), cy = center(3);
    switch (id) {
      case 'airstrike':
        for (const e of alive.slice().sort((a, b) => (a.len - a.traveled) - (b.len - b.traveled)).slice(0, 5)) { this.ring(e.x, e.y, 14, '#ff8a1f'); pctHit(e, 0.3, 0.06); }
        this.shake = 6; this.sfx('boom'); break;
      case 'rally': this.addTimed('rate', 0.3, 8); break;
      case 'lance': { const e = strongest(alive)[0]; if (e) { this.line(e.x, e.y - 200, e.x, e.y, '#2ef2ff', 'rail'); pctHit(e, 0.35, 0.12); } this.sfx('rail'); break; }
      case 'repair': this.heal(3); break;
      case 'overdrive': this.addTimed('dmg', 0.5, 6); break;
      case 'refund': this.addGold(Math.round(this.towers.reduce((a, t) => a + t.invested, 0) * 0.08)); this.sfx('coin'); break;
      case 'freeze': for (const e of alive) if (!e.def.nullify) { e.freeze = e.boss ? 0.8 : 2.5; e.ccImmune = e.freeze + 0.5; } break;
      case 'blizzard': this.addTimed('slow', 0.5, 6); break;
      case 'shatter': for (const e of alive) if (e.slowT > 0 || e.freeze > 0) pctHit(e, 0.2, 0.06); break;
      case 'toxic':
        for (const e of alive) if (!e.def.nullify) { e.poison = Math.max(e.poison, e.maxHp * 0.04); e.poisonT = Math.max(e.poisonT, 5); }
        break;
      case 'mutagen': this.addTimed('dmg', 0.25, 8); break;
      case 'burst':
        for (const e of alive) if (e.poisonT > 0) { const d = e.poison * e.poisonT * 2; e.poison = 0; e.poisonT = 0; this.burst(e.x, e.y, '#4dff8a', 6); this.damage(e, d, 'exp', null); }
        break;
      case 'payday': { const g = 25 + this.wave * 6; this.addGold(g); this.text(cx, cy - 12, '+' + g + 'c', '#ffd23f'); this.sfx('coin'); break; }
      case 'bribe': { const e = strongest(alive.filter((x) => !x.boss && !x.mini))[0]; if (e) { e.alive = false; this.burst(e.x, e.y, '#ffd23f', 16); this.text(e.x, e.y, 'BRIBED', '#ffd23f'); } break; }
      case 'crash': this.addTimed('slow', 0.3, 6); this.addTimed('gold', 0.5, 10); break;
      case 'barrier': this.addTimed('barrier', 1, 6); break;
      case 'fortify': this.heal(2); this.addTimed('empImmune', 1, 15); break;
      case 'shove':
        for (const e of alive) {
          if (e.boss || e.flying || e.i < 1) continue;
          const ni = Math.max(0, e.i - 3);
          e.traveled = Math.max(0, e.traveled - (e.i - ni) * TS); e.i = ni; [e.x, e.y] = e.route[ni];
        }
        this.ring(cx, cy, 80, '#3d7bff'); break;
      case 'quickdraw': this.addTimed('crit', 0.5, 6); break;
      case 'deadeye': for (const e of strongest(alive).slice(0, 3)) { this.line(e.x - 60, e.y - 60, e.x, e.y, '#ff3df2', 'rail'); pctHit(e, 0.25, 0.08); } this.sfx('rail'); break;
      case 'bulletstorm': this.addTimed('rate', 1, 5); break;
      case 'raise': {
        const p = this.world.portals[0];
        if (p) {
          const route = this.world.route(p, this.rng).map(([x, y]) => [center(x), center(y)]);
          for (let k = 0; k < 6; k++) {
            const i = Math.max(0, route.length - 1 - k);
            const hp = 40 * this.hpScale(this.wave) * (1 + this.mods.huskHp);
            this.units.push({ kind: 'husk', tw: null, x: route[i][0], y: route[i][1], route, i, alive: true, anim: 0, cd: 0, hp, maxHp: hp, dmg: 8 * (1 + this.wave * 0.08), speed: 22, life: 20, engaged: null });
          }
        }
        break;
      }
      case 'harvest': this.addTimed('gold', 1, 8); break;
      case 'mark': this.addTimed('dmgTaken', 0.3, 6); break;
    }
    this.ring(cx, cy, 40, A.color, 0.6);
    this.toast(A.name.toUpperCase(), A.color);
    this.sfx('upgrade');
    this.haptic('medium');
    return true;
  }

  // ---------------- fx ----------------
  particle(x, y, color, vx, vy, life = 0.5, size = 1) {
    if (this.fx.particles.length > 500) return;
    this.fx.particles.push({ x, y, vx, vy, life, max: life, color, size });
  }
  burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 20 + Math.random() * 50;
      this.particle(x, y, color, Math.cos(a) * s, Math.sin(a) * s, 0.25 + Math.random() * 0.35, Math.random() < 0.3 ? 2 : 1);
    }
  }
  text(x, y, text, color, life = 0.9) { if (this.fx.texts.length < 40) this.fx.texts.push({ x, y, text, color, life, max: life }); }
  line(x1, y1, x2, y2, color, kind) { this.fx.lines.push({ x1, y1, x2, y2, color, kind, life: kind === 'rail' ? 0.25 : kind === 'chain' ? 0.2 : 0.12, seed: Math.random() }); }
  ring(x, y, r, color, life = 0.35) { this.fx.rings.push({ x, y, r, color, life, max: life }); }

  updateFx(dt) {
    const f = this.fx;
    for (const p of f.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; }
    for (const t of f.texts) { t.life -= dt; t.y -= 12 * dt; }
    for (const l of f.lines) l.life -= dt;
    for (const r of f.rings) r.life -= dt;
    f.particles = f.particles.filter((p) => p.life > 0);
    f.texts = f.texts.filter((t) => t.life > 0);
    f.lines = f.lines.filter((l) => l.life > 0);
    f.rings = f.rings.filter((r) => r.life > 0);
  }

  // ---------------- save/load ----------------
  save() {
    saveRun({
      v: 1, seed: this.seed, rng: this.rng.state(), commander: this.commander, heat: this.heat, wave: this.wave,
      gold: this.gold, shards: this.shards, coreHp: this.coreHp, mods: this.mods, augments: this.augments,
      rerolls: this.rerolls, stats: this.stats, world: this.world.serialize(), baseMods: this.baseMods,
      mutators: this.mutators, relics: this.relics, relocations: this.relocations, cooldowns: this.cooldowns,
      towers: this.towers.map((t) => ({ type: t.type, tx: t.tx, ty: t.ty, level: t.level, branch: t.branch, mode: t.mode, invested: t.invested, dmgDealt: t.dmgDealt, kills: t.kills, relic: t.relic, vet: t.vet, overheat: t.overheat || 0, heatUntil: t.heatUntil || 0 })),
    });
  }

  load(s) {
    this.seed = s.seed;
    this.rng = mulberry32(s.seed);
    this.rng.setState(s.rng);
    Object.assign(this, { commander: s.commander, heat: s.heat, wave: s.wave, gold: s.gold, shards: s.shards, coreHp: s.coreHp, mods: s.mods, augments: s.augments, rerolls: s.rerolls, stats: s.stats });
    this.mutators = s.mutators || [];
    this.relics = s.relics || [];
    this.baseMods = s.baseMods || buildRunMods(s.commander);
    this.cooldowns = s.cooldowns || {};
    this.relocations = s.relocations != null ? s.relocations : 1;
    this.world = World.deserialize(s.world);
    this.phase = 'build';
    for (const t of s.towers) {
      const tw = {
        id: this.nextId++, type: t.type, def: TOWERS[t.type], tx: t.tx, ty: t.ty, x: center(t.tx), y: center(t.ty),
        level: t.level, branch: t.branch, cd: 0.2, angle: -Math.PI / 2, mode: t.mode, invested: t.invested,
        dmgDealt: t.dmgDealt || 0, kills: t.kills || 0, disabled: 0, drones: [], beam: [], rampT: 0, rampTarget: null,
        relic: t.relic || null, vet: t.vet || 0, oc: 0, overheat: t.overheat || 0, heatUntil: t.heatUntil || 0,
      };
      this.towers.push(tw);
      this.towerAt.set(t.tx + ',' + t.ty, tw);
      if (tw.def.drones) this.computeRally(tw);
    }
  }

  abandon() { if (this.phase !== 'over') { this.coreHp = 0; this.gameOver(); } }
}
