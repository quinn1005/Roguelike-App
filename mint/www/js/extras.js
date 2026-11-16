// Codex of learned tells, achievements (kept across runs) and settings.

export const CODEX = {
  // counterfeit tells
  print: { cat: 'Counterfeit tells', name: 'Smeared print', tool: 'Loupe', text: 'Genuine cards show a clean dot rosette. Fakes are blurry and blotchy up close.' },
  copyright: { cat: 'Counterfeit tells', name: 'Wrong copyright line', tool: 'Loupe + Reference', text: 'The tiny footer line has the wrong year or spelling.' },
  uv: { cat: 'Counterfeit tells', name: 'Modern paper', tool: 'UV lamp', text: 'Old stock stays dull under UV. Modern paper glows blue-white.' },
  swirl: { cat: 'Counterfeit tells', name: 'Backwards holo', tool: 'Loupe', text: 'Genuine Neon Saints holo foil swirls clockwise. Fakes swirl the other way.' },
  back: { cat: 'Counterfeit tells', name: 'Wrong back', tool: 'Hand + Reference', text: 'One detail on the back differs from the official card.' },
  nohidden: { cat: 'Counterfeit tells', name: 'No hidden ink', tool: 'UV lamp', text: 'Every genuine Moth & Lantern card has hidden ink under UV.' },
  absorb: { cat: 'Counterfeit tells', name: 'Soaks up water', tool: 'Dropper', text: 'Tidebound stock is waterproof. Water beads on genuine cards and soaks into fakes.' },
  flathex: { cat: 'Counterfeit tells', name: 'Flat hologram', tool: 'Tilt stand', text: 'The Rift Duelists hex hologram shifts color on the tilt stand. Fakes stay flat silver.' },
  weight: { cat: 'Counterfeit tells', name: 'Wrong weight', tool: 'Scale', text: 'Every line has a reference weight. Fakes are off by more than 0.05 g.' },
  paint: { cat: 'Counterfeit tells', name: 'Gold paint', tool: 'Microscope', text: 'Real Hollow Pantheon gold leaf shows flakes under the microscope. Paint is smooth.' },
  micro: { cat: 'Counterfeit tells', name: 'Ring forgery', tool: 'Microscope', text: 'Perfect in every visible way. Only the microprint along the bottom border is misspelled.' },
  stock: { cat: 'Counterfeit tells', name: 'Thin stock', tool: 'Light box', text: 'Genuine stock glows a dim amber on the light box. Thin modern stock shines white.' },
  badstats: { cat: 'Counterfeit tells', name: 'Impossible stats', tool: 'Reference', text: 'Ironclad Derby stats must match the print run named in the footer.' },
  dupserial: { cat: 'Counterfeit tells', name: 'Duplicate serial', tool: 'Registry', text: 'Every Cryptid Field Notes serial exists once. A registered serial on a new card is a copy.' },
  perfs: { cat: 'Counterfeit tells', name: 'Wrong perforations', tool: 'Ruler', text: 'Genuine Starpost cards have 28 × 20 perforations.' },
  // alterations
  stamp: { cat: 'Alterations', name: 'Added 1st Edition stamp', tool: 'Eye', text: 'Bloomlings 1st Edition stamps only appear on shadowless prints.' },
  recolor: { cat: 'Alterations', name: 'Touched-up corner', tool: 'UV lamp', text: 'Ink painted over damage glows in a patch under UV.' },
  trim: { cat: 'Alterations', name: 'Trimmed edges', tool: 'Ruler / Light box', text: 'The card measures smaller than 2.50 × 3.50 in. Cut edges glow on the light box.' },
  alphatrim: { cat: 'Alterations', name: 'Recut Alpha corners', tool: 'Ruler', text: 'Forgers recut Grimoire Accord corners to fake an Alpha. The four corners don\'t match.' },
  // variants
  noYellow: { cat: 'Chase versions', name: 'Missing-yellow misprint', tool: 'Eye', text: 'Grim Grocers printed without the yellow layer. Grade as an Authentic Error.' },
  shadowless: { cat: 'Chase versions', name: 'Shadowless print', tool: 'Eye', text: 'First Bloomlings prints have no shadow behind the art box.' },
  hidden: { cat: 'Chase versions', name: 'Print Run A', tool: 'UV lamp', text: 'Moth & Lantern cards with a full secret illustration under UV.' },
  secret: { cat: 'Chase versions', name: 'Secret rare', tool: 'Eye', text: 'Rift Duelists with rainbow names and an etched pattern.' },
  alpha: { cat: 'Chase versions', name: 'Alpha print', tool: 'Ruler', text: 'Grimoire Accord first prints with 3.0 mm corners.' },
  vintage: { cat: 'Chase versions', name: '1987 first print', tool: 'Eye', text: 'Tarnished Hollow Pantheon leaf. Bright leaf is the 2003 reprint.' },
  run1: { cat: 'Chase versions', name: 'Run 1 Derby', tool: 'Reference', text: 'Ironclad Derby first print run, with the original stats.' },
  inverted: { cat: 'Chase versions', name: 'Inverted center', tool: 'Eye', text: 'Starpost printed with the center upside down. Grade as an Authentic Error.' },
  fullart: { cat: 'Chase versions', name: 'Full art', tool: 'Eye', text: 'Mythic rares only: the illustration spills over the whole card. Full art holos are the rarest pulls in any pack.' },
  ghost: { cat: 'Chase versions', name: 'Ghost Print', tool: '?', text: 'One-of-one proofs by Ellis Marsh, Halloway Print Works.' },
};

export const ACHIEVEMENTS = [
  ['mythic', 'Mythic pull', 'Pull a mythic rare from a pack.'],
  ['fullart_holo', 'Full shine', 'Pull a full art holo.'],
  ['first_slab', 'First slab', 'Seal your first graded card.'],
  ['pristine', 'Pristine', 'Grade a Pristine 10 correctly.'],
  ['clean_day', 'Clean shift', 'Meet quota with no citations.'],
  ['fakes10', 'Fake hunter', 'Catch 10 counterfeits.'],
  ['fakes50', 'Forger\'s nightmare', 'Catch 50 counterfeits.'],
  ['ring', 'Ring breaker', 'Catch a ring forgery.'],
  ['bin_gem', 'Dumpster diamond', 'Keep a chase card from the bulk bins.'],
  ['pull_chase', 'Lucky tear', 'Pull a chase version from a pack.'],
  ['set', 'Complete set', 'Finish a page of your binder.'],
  ['codex', 'Scholar', 'Fill 20 codex entries.'],
  ['refuse', 'Not for sale', 'Refuse Vince Carrow.'],
  ['took', 'Bought', 'Take Vince Carrow\'s money.'],
  ['mina', 'Honest answer', 'Tell Mina the truth.'],
  ['apex', 'Second opinion', 'Win a dispute against Apex Grading.'],
  ['auction', 'Gavel', 'Win an auction.'],
  ['ghost', 'Ghost Print', 'Find Ellis Marsh\'s Ghost Print.'],
  ['survivor', 'Survivor', 'Reach the last day of the quarter.'],
  ['end_honest', 'Head grader', 'Ending: take Pike\'s chair the honest way.'],
  ['end_whistle', 'Whistleblower', 'Ending: bring down Pike and Carrow.'],
  ['end_kingpin', 'Kingpin', 'Ending: run the ring.'],
  ['end_collector', 'The Collector', 'Ending: retire on your binder.'],
  ['end_fired', 'Clear your desk', 'Ending: fired.'],
  ['end_evicted', 'Out on the street', 'Ending: evicted.'],
  ['end_arrested', 'Cuffed', 'Ending: arrested.'],
];

const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };

let ach = read('mint-achievements', {});
export const achievements = () => ach;
// Returns the achievement entry if it was newly unlocked.
export function unlockAch(id) {
  if (ach[id]) return null;
  ach[id] = Date.now();
  write('mint-achievements', ach);
  return ACHIEVEMENTS.find((a) => a[0] === id) || null;
}

const DEFAULTS = { music: 0.6, sfx: 0.85, speed: 'normal' };
let settings = { ...DEFAULTS, ...read('mint-settings', {}) };
export const getSettings = () => settings;
export function setSetting(k, v) { settings = { ...settings, [k]: v }; write('mint-settings', settings); return settings; }
export const SPEEDS = { relaxed: { label: 'Relaxed', ms: 1500 }, normal: { label: 'Normal', ms: 1000 }, fast: { label: 'Fast', ms: 650 } };
