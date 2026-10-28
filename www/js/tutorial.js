// First-launch guide: paged explanation of every mechanic. Reopen from the menu (GUIDE).

import { el } from './util.js';
import { TOWERS, ENEMIES } from './defs.js';
import { towerSprites, enemySprite, makeCanvas, uiIcon, drawTile, isPath, T, TS, SECTORS } from './sprites.js';

const tw = (id, lv = 1) => `<img class="px tut-ic" src="${towerSprites(TOWERS[id], lv).iconUrl}">`;
const icon = (k) => `<img class="px tut-ic" src="${uiIcon(k)}">`;
function foe(id) {
  const s = enemySprite(id, 0, null);
  const [c, ctx] = makeCanvas(s.width * 2, s.height * 2);
  ctx.drawImage(s, 0, 0, c.width, c.height);
  return `<img class="px tut-ic" src="${c.toDataURL()}">`;
}
// One map tile drawn on its own, framed by ground or path so it reads like the map.
function tile(t, sec = 0) {
  const [c, ctx] = makeCanvas(TS, TS);
  drawTile(ctx, t, 0, 0, 3, 5, SECTORS[sec], () => (isPath(t) ? T.PATH : T.GROUND));
  return `<img class="px tut-ic" src="${c.toDataURL()}">`;
}
const k = (t, c = 'cyan') => `<b class="c-${c}">${t}</b>`;

export const PAGES = [
  {
    title: 'WELCOME, COMMANDER',
    art: () => icon('heart') + tw('blaster', 3) + foe('crawler'),
    body: () => `
      <p>Neon Bastion is an <b>endless</b> tower defense roguelike. Enemies pour out of portals and march to your ${k('CORE')}. Every enemy that reaches it costs core HP. When the core hits 0, the run is over.</p>
      <p>There is no final wave: the goal is to survive as long as you can, then spend what you earned to come back stronger. Your first runs <b>will</b> be short. That's the design: grind, unlock, push further.</p>
      <p class="c-dim">Flip through these pages to learn every system. You can reopen this guide from the main menu at any time (GUIDE).</p>`,
  },
  {
    title: 'BUILDING TOWERS',
    art: () => tw('blaster') + tw('cryo') + tw('cannon') + tw('tesla'),
    body: () => `
      <p>Pick a tower from the ${k('tower bar')} at the bottom, then tap an empty tile. A ghost preview shows its range. <b>Tap the same tile again</b> to build it.</p>
      <p>Towers cost ${k('credits', 'yel')} ${icon('coin')}. You earn credits from kills, from clearing waves, and from ${k('interest')}: a bonus based on how many credits you are holding when a wave ends.</p>
      <p>You start with only the ${k('Pulse Blaster')}. Every other tower is unlocked permanently in the ${k('ARMORY', 'mag')} with Void Shards.</p>
      <p>Each tower deals a damage type (kinetic, energy, cryo, toxic...). Some enemies resist certain types, so mix your defenses.</p>`,
  },
  {
    title: 'UPGRADES & BRANCHES',
    art: () => tw('cannon', 1) + tw('cannon', 2) + tw('cannon', 3),
    body: () => `
      <p>Tap a built tower to open its panel. From there you can:</p>
      <p>${k('UPGRADE')} through levels 1-3, each one stronger and better looking.<br>
      ${k('BRANCH')} at max level: pick path ${k('A')} or ${k('B')}. Each branch changes how the tower works and gives it a unique look.<br>
      ${k('TARGET')}: cycle between First, Last, Strong and Close.<br>
      ${k('SELL', 'red')}: get back part of what you spent.</p>
      <p>The panel shows a full stat breakdown: base value, then bonuses from <span style="color:#a466ff">location</span>, <span style="color:#2ef2ff">talents</span>, <span style="color:#ff3df2">augments</span>, relic and rank, then the total.</p>`,
  },
  {
    title: 'WAVES & BOSSES',
    art: () => foe('crawler') + foe('scout') + foe('tank') + foe('wasp'),
    body: () => `
      <p>Press ${k('WAVE', 'grn')} to send the next wave, or turn on ${k('AUTO')} to start waves automatically. The ${k('wave preview')} bar shows exactly what's coming next.</p>
      <p>Every ${k('10th wave', 'red')} is a ${k('BOSS', 'red')} wave. From wave 15, every 5th wave is an ${k('ELITE', 'yel')} wave where enemies get a special trait (armored, fast, cloaked, shielded, regenerating, giant). From wave 25, ${k('mini-bosses', 'mag')} show up between bosses, and after wave 50 ${k('corrupted', 'red')} enemies gain extra abilities.</p>
      <p>Each new neon sector (every 10 waves) brings new enemy types. The first time you meet one, an ${k('intel')} screen shows its stats, abilities, and which towers counter it. You can read all of them again in the ${k('CODEX')}.</p>`,
  },
  {
    title: 'THE EXPANDING MAP',
    art: () => tile(T.HIGH) + tile(T.NODE) + tile(T.SLUDGE) + tile(T.CACHE) + tile(T.ROCK),
    body: () => `
      <p>The map grows as you play. Every ${k('3 waves')} (and after every boss) you pick a new ${k('map chunk')} and attach it to an open portal. Chunks can be forks, crossroads, braided lanes, or sealed bulkheads that close a portal for good.</p>
      <p>Chunks can carry terrain:<br>
      ${k('High Ground')}: towers get +25% range. ${k('Power Node')}: +30% damage.<br>
      ${k('Coolant Spill')}: slows enemies. ${k('Data Cache')}: tap to salvage credits or shards.<br>
      ${k('Asteroids')}: tap a rock to blast it into a buildable tile for credits, with a chance at a shard.</p>
      <p>${k('RELOCATE')} (move button): rotate a chunk or swap two of them. You start with 1 relocation and earn another after each boss (max 2). Towers on moved chunks are fully refunded.</p>`,
  },
  {
    title: 'RISK & REWARD TILES',
    art: () => tile(T.RIFT) + tile(T.ACCEL) + tile(T.OBELISK) + tile(T.BEACON),
    body: () => `
      <p>Some chunks come with glowing risk tiles. They make enemies stronger but pay out more.</p>
      <p><b>Local</b>, affecting only the enemies that walk over them:<br>
      ${k('Rift Conduit', 'mag')}: +50% HP, but 2x credits and shard drops.<br>
      ${k('Ion Accelerator', 'mag')}: 40% faster, but +75% credits.</p>
      <p><b>Global</b>, affecting every enemy while the chunk exists:<br>
      ${k('Shard Obelisk', 'yel')}: +1 Void Shard every wave, but all enemies +8% HP.<br>
      ${k('Bounty Beacon', 'yel')}: +25% kill credits, but all enemies 6% faster.</p>`,
  },
  {
    title: 'AUGMENTS, SHOP & EVENTS',
    art: () => icon('coin') + tw('blaster', 3) + icon('shard'),
    body: () => `
      <p>Between waves you'll often get a choice:</p>
      <p>${k('AUGMENTS', 'mag')}: pick one of several run-long upgrades, rated common to legendary. Boss waves give rarer <b>Boss Spoils</b>.<br>
      ${k('BLACK MARKET', 'yel')}: buy augments and relics with credits. Augments cost more for every copy you own, and <b>rerolls double in price</b> every time in the same shop.<br>
      ${k('EVENTS')}: random encounters with a trade-off to accept or refuse.</p>
      <p>${k('RELICS', 'mag')} are installed on a single tower (Ricochet Core, Frost Shell, Toxic Rounds, Bounty Chip...). They come from augment picks, the shop, and boss spoils.</p>`,
  },
  {
    title: 'TOWER POWER-UPS',
    art: () => tw('tesla', 3) + tw('cryo', 3) + tw('railgun', 3),
    body: () => `
      <p>${k('COMBOS', 'grn')}: some towers work together. Tesla on chilled enemies causes <b>Shatter</b>, explosions detonate poison, railguns always crit shocked enemies, and lasers burn chilled targets.</p>
      <p>${k('VETERANCY', 'yel')}: towers rank up to Bronze (25 kills), Silver (100) and Gold (300), with stat boosts and a badge on the sprite.</p>
      <p>${k('FUSION', 'mag')}: two specific max-level towers side by side can fuse into one of 5 powerful fused towers.</p>
      <p>${k('OVERCLOCK', 'red')}: during a wave, pay credits (more each wave) to double a tower's fire rate for 10 seconds. Afterward it <b>overheats</b> and shuts down until the end of the next wave, so time it carefully.</p>`,
  },
  {
    title: 'COMMANDERS',
    art: () => tw('drone', 2) + tw('miner', 2) + tw('nanite', 2),
    body: () => `
      <p>Before each run, choose a ${k('COMMANDER')}. Each one has a passive bonus and often brings a signature tower. New commanders are bought with shards.</p>
      <p>Commanders level up from the runs you play with them (max 15). Spend their points in their own ${k('skill tree')} on small buffs, and unlock up to <b>3 active abilities</b> each.</p>
      <p>Abilities appear as buttons during waves. They recharge over <b>waves, not seconds</b> (2-5 waves each), so save them for the waves you really need them.</p>`,
  },
  {
    title: 'META PROGRESSION',
    art: () => icon('shard') + tw('reclaimer', 3) + icon('shard'),
    body: () => `
      <p>Every run pays out, even a short one:</p>
      <p>${k('XP')} levels you up. Each level gives a ${k('TALENT point', 'yel')} for the themed talent trees and the per-tower trees in TALENTS.<br>
      ${k('VOID SHARDS', 'mag')} ${icon('shard')} unlock towers in the ARMORY and buy commanders.<br>
      ${k('SKINS')}: towers unlock Neon (3,000 kills) and Gold (12,000 kills) looks, chosen in the Armory.<br>
      ${k('PRESTIGE', 'yel')}: at level 30, reset your level and talents for a permanent damage and shard bonus.</p>
      <p>${k('HEAT', 'red')} levels make enemies tougher for bigger rewards. ${k('MUTATORS', 'red')} on the New Run screen add twists (Glass Core, Swarm Surge, Famine...) for bonus XP and shards. ${k('HISTORY')} logs your last 20 runs. Achievements pay out shards.</p>`,
  },
  {
    title: 'CONTROLS & TIPS',
    art: () => tw('blaster', 1) + tw('amplifier', 2) + tw('laser', 3),
    body: () => `
      <p>${k('Drag')} to pan the map. ${k('Pinch')} (or mouse wheel) to zoom.<br>
      ${k('Speed')} button: 1x up to 5x. ${k('Pause')} button or Android back button to pause.<br>
      Runs ${k('auto-save')} between waves, so you can quit and CONTINUE later. Run Again keeps your commander, Heat and mutators.</p>
      <p>Back up your progress with ${k('Export Save')} in SETTINGS.</p>
      <p class="c-yel">Tips: spread towers near path bends, save credits for interest, read the intel screens, and unlock the cheap starter towers (Cryo, Cannon, Tesla) after your first runs.</p>
      <p class="c-grn">Good luck, Commander. The core is counting on you.</p>`,
  },
];

// Builds the paged guide inside a modal box. onDone fires on SKIP or DONE.
export function fillTutorial(box, button, onDone, start = 0) {
  let page = start;
  box.classList.add('tut');
  const draw = () => {
    box.innerHTML = '';
    const p = PAGES[page];
    box.append(el('div', 'tut-step c-dim', `HOW TO PLAY - ${page + 1} / ${PAGES.length}`));
    box.append(el('h2', '', p.title));
    box.append(el('div', 'tut-art', p.art()));
    box.append(el('div', 'tut-body', p.body()));
    const dots = el('div', 'tut-dots');
    PAGES.forEach((_, i) => {
      const d = el('span', i === page ? 'on' : '');
      d.onclick = () => { page = i; draw(); };
      dots.append(d);
    });
    box.append(dots);
    const row = el('div', 'mrow');
    const last = page === PAGES.length - 1;
    const prev = button('&lt; PREV', '', () => { page--; draw(); });
    prev.disabled = page === 0;
    row.append(
      button(last ? 'CLOSE' : 'SKIP', '', onDone),
      prev,
      last ? button("LET'S GO", 'go', onDone) : button('NEXT &gt;', 'go', () => { page++; draw(); }),
    );
    box.append(row);
    box.scrollTop = 0;
  };
  draw();
}
