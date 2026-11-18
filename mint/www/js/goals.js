// Set goals: every binder page has a sheet of goals. Rewards are reputation, discounts, access
// and cosmetics, never cash, so goals guide you without flooding you with money. Completed goals
// add up to a collector rank, which has perks of its own.
import { LINES, CARDS } from './data.js';
import { trueGrade } from './grading.js';

const def = (i) => CARDS[i.line].find((c) => c.n === i.n);
const CHASE = ['first', 'shadowless', 'noYellow', 'hidden', 'secret', 'gold', 'alpha', 'vintage', 'run1', 'serial', 'inverted', 'fullart'];
const distinct = (list, key) => new Set(list.map(key)).size;
const ownsAll = (list, line, ns) => ns.every((n) => list.some((i) => i.n === n));
const byRarity = (line, r) => CARDS[line].filter((c) => c.r === r).map((c) => c.n);

// Core goals, the same for every set.
const CORE = [
  { k: 'commons', name: 'Every common', desc: 'All 14 commons.', reward: 'Reputation +1 and a colored page border.', test: (l, L) => ownsAll(L, l, byRarity(l, 'c')), rep: 1 },
  { k: 'uncommons', name: 'Every uncommon', desc: 'All 9 uncommons.', reward: 'Lou takes 10% off this set\'s packs and boxes.', test: (l, L) => ownsAll(L, l, byRarity(l, 'u')) },
  { k: 'holos', name: 'Shiny', desc: 'Any 3 holos.', reward: 'A foil corner on this page.', test: (l, L) => L.filter((i) => i.v.holo).length >= 3 },
  { k: 'chase', name: 'Chaser', desc: 'Any chase version (1st Edition, Alpha, error, full art and so on).', reward: 'Reputation +2.', test: (l, L) => L.some((i) => CHASE.some((c) => i.v[c])), rep: 2 },
  { k: 'slab9', name: 'Under glass', desc: 'A slab graded 9 or better.', reward: 'A slab rack for this page.', test: (l, L) => L.some((i) => i.slab && i.slab.grade >= 9) },
  { k: 'rares', name: 'Every rare', desc: 'All 5 rares.', reward: 'Each week Lou sets aside a card you\'re missing from this set, at a fair price.', test: (l, L) => ownsAll(L, l, byRarity(l, 'r')) },
  { k: 'mythics', name: 'Both mythics', desc: 'Both mythic rares.', reward: 'At trade night, a collector brings a card you\'re missing from this set.', test: (l, L) => ownsAll(L, l, byRarity(l, 'm')) },
  { k: 'master', name: 'Master set', desc: 'All 30 cards.', reward: 'Reputation +5, a gold page and a plaque for your display case.', test: (l, L) => distinct(L, (i) => i.n) >= LINES[l].total, rep: 5 },
];
// Two themed goals per set.
const THEMED = {
  gg: [
    { k: 'ghosts', name: 'The Ghost Shift', desc: 'All four ghosts: Banshee Banana, Poltergrape, Ghostato and Haunted Parsnip.', test: (l, L) => ownsAll(L, l, [4, 7, 12, 16]) },
    { k: 'mash', name: 'Monster Mash', desc: 'Both vampires and both Frankensteins: Count Cabbula, Vampeach, Frankenfennel and Pumpkinstein.', test: (l, L) => ownsAll(L, l, [1, 14, 6, 10]) },
  ],
  ns: [
    { k: 'belts', name: 'Title Holders', desc: 'Three wrestlers wearing a championship belt.', test: (l, L) => distinct(L.filter((i) => def(i).art.belt), (i) => i.n) >= 3 },
    { k: 'heavy', name: 'Heavyweights', desc: 'Three heavy or giant wrestlers.', test: (l, L) => distinct(L.filter((i) => ['heavy', 'giant'].includes(def(i).art.build)), (i) => i.n) >= 3 },
  ],
  bl: [
    { k: 'elements', name: 'Every Element', desc: 'One Bloomling of each of the seven elements.', test: (l, L) => distinct(L, (i) => def(i).el) >= 7 },
    { k: 'grown', name: 'Fully Grown', desc: 'Four Stage 2 or Ancient Bloomlings.', test: (l, L) => distinct(L.filter((i) => ['r', 'm'].includes(def(i).r)), (i) => i.n) >= 4 },
  ],
  ml: [
    { k: 'swarm', name: 'The Night Shift', desc: 'Eight different kinds of insect.', test: (l, L) => distinct(L, (i) => def(i).art.bug) >= 8 },
    { k: 'runA', name: 'Print Run A', desc: 'A card with its hidden illustration.', test: (l, L) => L.some((i) => i.v.hidden) },
  ],
  tb: [
    { k: 'lost', name: 'Lost at Sea', desc: 'A wreck, a lighthouse and a diver.', test: (l, L) => ['ship', 'lighthouse', 'diver'].every((b) => L.some((i) => def(i).art.beast === b)) },
    { k: 'deep', name: 'The Deep', desc: 'Three creatures from the abyss, the trench or deep water.', test: (l, L) => distinct(L.filter((i) => /Abyssal|Trench|Deepwater|Midnight/.test(def(i).type || '')), (i) => i.n) >= 3 },
  ],
  rd: [
    { k: 'hoard', name: 'Dragon\'s Hoard', desc: 'Three dragons, hydras or sea serpents.', test: (l, L) => distinct(L.filter((i) => ['dragon', 'hydra', 'serpent'].includes(def(i).art.mon)), (i) => i.n) >= 3 },
    { k: 'gilded', name: 'Gilded', desc: 'A gold-name or secret rare.', test: (l, L) => L.some((i) => i.v.gold || i.v.secret) },
  ],
  ga: [
    { k: 'schools', name: 'Five Schools', desc: 'One card from each school of magic.', test: (l, L) => distinct(L, (i) => def(i).art.school) >= 5 },
    { k: 'alpha', name: 'Alpha Print', desc: 'An Alpha print, with its round corners.', test: (l, L) => L.some((i) => i.v.alpha) },
  ],
  hp: [
    { k: 'first87', name: 'First Printing', desc: 'Three 1987 first prints.', test: (l, L) => L.filter((i) => i.v.vintage).length >= 3 },
    { k: 'pantheon', name: 'The Pantheon', desc: 'Twelve different gods.', test: (l, L) => distinct(L, (i) => i.n) >= 12 },
  ],
  ic: [
    { k: 'run1', name: 'Run 1 Paddock', desc: 'Three Run 1 cards.', test: (l, L) => L.filter((i) => i.v.run1).length >= 3 },
    { k: 'garage', name: 'The Garage', desc: 'Seven different kinds of machine.', test: (l, L) => distinct(L, (i) => def(i).art.chassis || 'racer') >= 7 },
  ],
  cf: [
    { k: 'serials', name: 'Case Closed', desc: 'Three serialized case files.', test: (l, L) => L.filter((i) => i.v.serial).length >= 3 },
    { k: 'bestiary', name: 'Field Guide', desc: 'Ten different cryptids.', test: (l, L) => distinct(L, (i) => def(i).art.crit) >= 10 },
  ],
  sp: [
    { k: 'error', name: 'The Inverted Center', desc: 'A Starpost with its center printed upside down.', test: (l, L) => L.some((i) => i.v.inverted) },
    { k: 'routes', name: 'Every Route', desc: 'Twelve different stamps.', test: (l, L) => distinct(L, (i) => i.n) >= 12 },
  ],
};
for (const l of Object.keys(THEMED)) THEMED[l].forEach((g) => { g.reward = 'Reputation +1 and a ribbon on this page.'; g.rep = 1; g.themed = true; });

export const goalsFor = (line) => [...CORE, ...(THEMED[line] || [])];
export const goalKey = (line, k) => `${line}:${k}`;
export const hasGoal = (S, line, k) => !!(S.goals && S.goals[goalKey(line, k)]);
export const goalCount = (S) => Object.keys(S.goals || {}).length;
export const GOALS_TOTAL = Object.keys(LINES).reduce((s, l) => s + goalsFor(l).length, 0);

export const RANKS = [
  { n: 0, name: 'Unranked', need: 0, perk: '' },
  { n: 1, name: 'Bronze Collector', need: 3, perk: 'Collectors at trade night know your name.' },
  { n: 2, name: 'Silver Collector', need: 10, perk: 'Rook drops his markup by 15 points.' },
  { n: 3, name: 'Gold Collector', need: 20, perk: 'First look at the Saturday auction: the room bids less on the top lot.' },
  { n: 4, name: 'Platinum Collector', need: 32, perk: 'A new way to end the quarter: The Curator.' },
];
export const rankOf = (S) => { const c = goalCount(S); return [...RANKS].reverse().find((r) => c >= r.need); };

// Check every unlocked set and return the goals completed just now.
export function checkGoals(S, lines) {
  const done = [];
  S.goals = S.goals || {};
  for (const l of lines) {
    const L = S.collection.filter((i) => i.line === l && !i.fake);
    for (const g of goalsFor(l)) {
      const key = goalKey(l, g.k);
      if (S.goals[key]) continue;
      if (g.test(l, L)) { S.goals[key] = S.day; done.push({ line: l, ...g }); }
    }
  }
  return done;
}
