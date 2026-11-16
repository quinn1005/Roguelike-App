// Static game data for Mint Condition (first slice: 5 days, 3 card lines).

export const LINES = {
  gg: {
    id: 'gg', name: 'Grim Grocers', year: 1994, setCode: 'GG·S1', total: 9,
    copyright: '©1994 GRISTLE TOYS',
    notes: [
      'Printed by Gristle Toys in 1994 on cheap, soft card stock.',
      'Footer must read "©1994 GRISTLE TOYS". Fakes often get the year or spelling wrong.',
      'Back: purple checkerboard, green slime logo, banner "GRISTLE TOYS · 1994".',
      'Chase error: the yellow ink layer missing. Yellows print white, greens turn cyan, reds turn pink. Genuine errors are rare and valuable.',
    ],
  },
  ns: {
    id: 'ns', name: 'Neon Saints', year: 1987, setCode: 'NS·S1', total: 8,
    copyright: '©1987 SAINTS WRESTLING LEAGUE',
    notes: [
      'Wrestling cards from the 1987 Saints Wrestling League.',
      'Footer must read "©1987 SAINTS WRESTLING LEAGUE".',
      'Holo foil swirl turns CLOCKWISE on every genuine holo. Check it under the loupe.',
      'Back: striped sun over a laser grid, "NEON" above, "SAINTS" below.',
    ],
  },
  bl: {
    id: 'bl', name: 'Bloomlings', year: 1999, setCode: 'BL·1', total: 9,
    copyright: '©1999 BLOOMWORKS',
    notes: [
      'Creature-collecting cards from Bloomworks, 1999.',
      'Footer must read "©1999 BLOOMWORKS".',
      'First prints are "shadowless": no drop shadow behind the art box.',
      '1st Edition stamps appear ONLY on shadowless prints. A stamp on a card with a shadow was added later.',
      'Back: blue swirl, white emblem with water, leaf and ember badges (water on top).',
    ],
  },
};

// rarity: c = common, u = uncommon, r = rare
export const CARDS = {
  gg: [
    { n: 1, name: 'Count Cabbula', r: 'u', type: 'VEGGIE · SPOOKY', text: ['Sucks the crunch out', 'of every salad bar.'], stats: 'SCARE 4 · CRUNCH 2', art: { shape: 'round', body: '#7ccc4f', vein: '#4f9a2f', costume: 'cape', cc: '#e6372e', sky: '#3b2a8a' } },
    { n: 2, name: 'Mummy Melon', r: 'c', type: 'FRUIT · CURSED', text: ['Wrapped since the', 'last harvest moon.'], stats: 'SCARE 3 · CRUNCH 1', art: { shape: 'round', body: '#f4b942', vein: '#c98a20', costume: 'wraps', cc: '#f3ead2', sky: '#2a6a5a' } },
    { n: 3, name: 'Werecarrot', r: 'c', type: 'ROOT · BEAST', text: ['Howls at the garden', 'when the moon is full.'], stats: 'SCARE 3 · CRUNCH 4', art: { shape: 'tall', body: '#f07f2a', vein: '#b85a14', costume: 'fur', cc: '#6b4a2a', sky: '#24305e' } },
    { n: 4, name: 'Banshee Banana', r: 'c', type: 'FRUIT · GHOST', text: ['Her shriek turns', 'lunchboxes brown.'], stats: 'SCARE 5 · CRUNCH 0', art: { shape: 'long', body: '#ffe14d', vein: '#c9a520', costume: 'sheet', cc: '#e8f0ff', sky: '#4a2a6a' } },
    { n: 5, name: 'Zombroccoli', r: 'c', type: 'VEGGIE · UNDEAD', text: ['Shambles toward any', 'kid who skips greens.'], stats: 'SCARE 2 · CRUNCH 3', art: { shape: 'bunch', body: '#3f9a3a', vein: '#2a6a26', costume: 'stitches', cc: '#1a1a1a', sky: '#3a3a5a' } },
    { n: 6, name: 'Frankenfennel', r: 'u', type: 'VEGGIE · MONSTER', text: ['Stitched together', 'from compost scraps.'], stats: 'SCARE 4 · CRUNCH 4', art: { shape: 'tall', body: '#cfe8a0', vein: '#8ab060', costume: 'bolts', cc: '#8a8f96', sky: '#2a4a3a' } },
    { n: 7, name: 'Poltergrape', r: 'c', type: 'FRUIT · GHOST', text: ['Rattles the fruit bowl', 'at 3 a.m. sharp.'], stats: 'SCARE 3 · CRUNCH 1', art: { shape: 'bunch', body: '#7b3fa0', vein: '#5a2a7a', costume: 'sheet', cc: '#e8f0ff', sky: '#2a2a4a' } },
    { n: 8, name: 'Ghoulash', r: 'u', type: 'STEW · FIEND', text: ['Nobody remembers', 'who cooked it.'], stats: 'SCARE 5 · CRUNCH 2', art: { shape: 'round', body: '#b5502a', vein: '#7a3216', costume: 'hood', cc: '#3a2a4a', sky: '#5a2a2a' } },
    { n: 9, name: 'The Corn Reaper', r: 'r', type: 'GRAIN · DEATH', text: ['Every field ends', 'the same way.'], stats: 'SCARE 9 · CRUNCH 6', art: { shape: 'tall', body: '#ffd23f', vein: '#c9a020', costume: 'reaper', cc: '#141414', sky: '#1a1030' } },
  ],
  ns: [
    { n: 1, name: 'Thunder Mama', r: 'r', full: 'Thunder Mama Delgado', stats: 'POW 9 · FLEX 10 · TALK 11', quote: '“Bring a chair. You\'ll need it.”', finisher: 'THE MIDNIGHT SUPLEX', art: { hair: 'mohawk', pose: 'flex', belt: true, a: '#ff4fd8', b: '#2ee6ff' } },
    { n: 2, name: 'Captain Chrome', r: 'c', stats: 'POW 6 · FLEX 7 · TALK 8', quote: '“Polished. Perfected. Pinned.”', finisher: 'THE CHROME DOME', art: { hair: 'mask', pose: 'point', a: '#c0c8d8', b: '#2ee6ff' } },
    { n: 3, name: 'El Relámpago', r: 'u', stats: 'POW 7 · FLEX 9 · TALK 6', quote: '“You will not see me coming.”', finisher: 'LIGHTNING DIVE', art: { hair: 'mask', pose: 'flex', a: '#ffd23f', b: '#ff4f4f' } },
    { n: 4, name: 'Big Sal Vecchio', r: 'c', stats: 'POW 9 · FLEX 4 · TALK 7', quote: '“My mother hits harder.”', finisher: 'THE MEATBALL', art: { hair: 'bald', pose: 'cross', a: '#ff8a3d', b: '#ffe45c' } },
    { n: 5, name: 'Lady Lariat', r: 'c', stats: 'POW 7 · FLEX 6 · TALK 9', quote: '“Yeehaw is a warning.”', finisher: 'THE LASSO DROP', art: { hair: 'long', pose: 'point', a: '#ff4f9a', b: '#ffd23f' } },
    { n: 6, name: 'The Pharaoh Kid', r: 'u', stats: 'POW 6 · FLEX 8 · TALK 10', quote: '“Kneel before the kid.”', finisher: 'THE PYRAMID PILE', art: { hair: 'crown', pose: 'flex', a: '#ffd23f', b: '#3fb8ff' } },
    { n: 7, name: 'Dr. Suplex', r: 'c', stats: 'POW 8 · FLEX 6 · TALK 5', quote: '“The doctor will see you now.”', finisher: 'THE HOUSE CALL', art: { hair: 'afro', pose: 'cross', a: '#3fe08a', b: '#2ee6ff' } },
    { n: 8, name: 'Midnight Magnus', r: 'r', stats: 'POW 10 · FLEX 8 · TALK 4', quote: '“The lights go out. So do you.”', finisher: 'THE ECLIPSE', art: { hair: 'long', pose: 'cross', belt: true, a: '#b06bff', b: '#2ee6ff' } },
  ],
  bl: [
    { n: 1, name: 'Puddlefox', r: 'c', el: 'water', vigor: 60, kind: 'Water Kit', art: { body: '#4fb3e8', ears: 'fox', extra: null }, moves: [['Splash Pounce', 20, 1], ['Tidal Yip', 40, 2]] },
    { n: 2, name: 'Mosskit', r: 'c', el: 'leaf', vigor: 50, kind: 'Moss Kitten', art: { body: '#6cc04a', ears: 'round', extra: 'stripe' }, moves: [['Pounce', 10, 1], ['Spore Nap', 30, 2]] },
    { n: 3, name: 'Embercub', r: 'c', el: 'ember', vigor: 70, kind: 'Ember Cub', art: { body: '#e2572b', ears: 'round', extra: null }, moves: [['Warm Swipe', 20, 1], ['Hearth Roar', 50, 3]] },
    { n: 4, name: 'Pebblepup', r: 'c', el: 'stone', vigor: 80, kind: 'Stone Pup', art: { body: '#9a8f86', ears: 'round', extra: 'spots' }, moves: [['Tumble', 20, 1], ['Rockslide', 40, 3]] },
    { n: 5, name: 'Dewdrake', r: 'u', el: 'water', vigor: 70, kind: 'Dew Dragon', art: { body: '#3fa0c8', ears: 'horn', extra: 'wings' }, moves: [['Mist Breath', 30, 2], ['Rain Dive', 60, 3]] },
    { n: 6, name: 'Thornhog', r: 'c', el: 'leaf', vigor: 60, kind: 'Bramble Hog', art: { body: '#5a9a3a', ears: 'round', extra: 'spikes' }, moves: [['Prickle', 20, 1], ['Bramble Roll', 40, 2]] },
    { n: 7, name: 'Ashowl', r: 'u', el: 'ember', vigor: 70, kind: 'Cinder Owl', art: { body: '#b8573a', ears: 'tuft', extra: 'wings' }, moves: [['Smoke Hoot', 20, 1], ['Ash Gale', 50, 2]] },
    { n: 8, name: 'Lilypadger', r: 'u', el: 'water', vigor: 90, kind: 'Pond Badger', art: { body: '#4a8fa8', ears: 'round', extra: 'stripe' }, moves: [['Dig In', 30, 2], ['Lily Crush', 60, 3]] },
    { n: 9, name: 'Bloomwyrm', r: 'r', el: 'leaf', vigor: 120, kind: 'Bloom Serpent', art: { body: '#8fd16a', ears: 'horn', extra: 'petals' }, moves: [['Petal Storm', 50, 2], ['World Bloom', 100, 4]] },
  ],
};

export const RARITY_NAME = { c: 'Common', u: 'Uncommon', r: 'Rare' };
export const BASE_VALUE = { c: 2, u: 6, r: 30 };

export const TOOLS = {
  hand: { name: 'Hand', key: 'H', desc: 'Tap the card to flip it.' },
  loupe: { name: 'Loupe', key: 'L', desc: 'Drag to magnify. Tap a flaw to tag it. A tag that hits nothing costs 1 minute.' },
  ruler: { name: 'Ruler', key: 'R', desc: 'Measures border centering and card size. Costs 3 minutes.' },
  uv: { name: 'UV lamp', key: 'U', desc: 'Shows modern paper and touch-ups. Costs 2 minutes.' },
  binder: { name: 'Reference', key: 'B', desc: 'Official images and notes for every card. Costs 1 minute.' },
};

export const TIERS = {
  economy: { name: 'Economy', pay: 8 },
  standard: { name: 'Standard', pay: 12 },
  express: { name: 'Express', pay: 18 },
};

export const CLIENTS = [
  'D. Moreau', 'K. Abara', 'T. Lindqvist', 'R. Castellano', 'J. Whitfield', 'P. Nakagawa', 'S. Oyelaran',
  'M. Brandt', 'L. Ferreira', 'A. Kowalczyk', 'B. Haddad', 'C. Mbeki', 'E. Varga', 'G. Tremblay',
  'H. Osei', 'I. Petrov', 'N. Quispe', 'O. Lindgren', 'V. Ashby', 'W. Delacroix', 'Y. Hartmann',
];

// Rules are cumulative. "isNew" is set per day when they first appear.
export const DAYS = [
  {
    n: 1, quota: 5, lines: ['gg', 'ns'], tools: ['hand', 'loupe', 'ruler', 'binder'],
    fake: 0.12, altered: 0, mismatch: 0.14, fakeKinds: ['print', 'copyright'], alterKinds: [],
    rules: [
      'Every card must match its submission form: name, number and claimed variant. If it doesn\'t, RETURN it.',
      'Measure centering with the ruler. Untested centering counts as perfect, and that\'s how graders get cited.',
      'Tag every flaw with the loupe. Your grade is built from what you tag.',
      'Genuine cards show a clean dot rosette under the loupe. Blurry, smeared print is COUNTERFEIT.',
      'Check the copyright line in the footer against the reference binder.',
    ],
  },
  {
    n: 2, quota: 6, lines: ['gg', 'ns', 'bl'], tools: ['hand', 'loupe', 'ruler', 'uv', 'binder'],
    fake: 0.16, altered: 0, mismatch: 0.12, fakeKinds: ['print', 'copyright', 'uv', 'swirl'], alterKinds: [],
    rules: [
      'New line in the queue: Bloomlings (1999). Read the reference notes.',
      'UV lamp issued. Genuine vintage stock stays dull. Modern paper glows bright blue-white: COUNTERFEIT.',
      'Counterfeit Neon Saints holos are circulating. Genuine holo swirl turns clockwise.',
      'Genuine misprints are AUTHENTIC ERRORS. Grade them and label them.',
    ],
  },
  {
    n: 3, quota: 7, lines: ['gg', 'ns', 'bl'], tools: ['hand', 'loupe', 'ruler', 'uv', 'binder'],
    fake: 0.16, altered: 0.14, mismatch: 0.1, fakeKinds: ['print', 'copyright', 'uv', 'swirl', 'back'], alterKinds: ['stamp', 'recolor'],
    rules: [
      'Bloomlings 1st Edition stamps appear only on shadowless prints. Stamp plus shadow means ALTERED.',
      'Touch-up ink glows in patches under UV. Recolored corners and edges are ALTERED.',
      'Flip every card. Counterfeiters get the backs wrong too.',
    ],
  },
  {
    n: 4, quota: 8, lines: ['gg', 'ns', 'bl'], tools: ['hand', 'loupe', 'ruler', 'uv', 'binder'],
    fake: 0.18, altered: 0.16, mismatch: 0.1, fakeKinds: ['print', 'copyright', 'uv', 'swirl', 'back'], alterKinds: ['stamp', 'recolor', 'trim'],
    rules: [
      'Trimmed cards are circulating. Every card must measure 2.50 × 3.50 in on the ruler. Anything smaller is ALTERED.',
    ],
  },
  {
    n: 5, quota: 8, lines: ['gg', 'ns', 'bl'], tools: ['hand', 'loupe', 'ruler', 'uv', 'binder'],
    fake: 0.2, altered: 0.16, mismatch: 0.1, fakeKinds: ['print', 'copyright', 'uv', 'swirl', 'back'], alterKinds: ['stamp', 'recolor', 'trim'],
    rules: [
      'INTERNAL AUDIT TODAY. Your past slabs will be pulled and re-graded.',
    ],
  },
];

export const RENT = 220;
export const FOOD = 6;
export const START_MONEY = 40;
export const MAX_CITATIONS = 7;

export const PACKS = {
  gg: { price: 9, label: 'Grim Grocers S1', sub: 'Old stock, 1994' },
  ns: { price: 7, label: 'Neon Saints S1', sub: 'Old stock, 1987' },
  bl: { price: 5, label: 'Bloomlings', sub: 'Unlimited reprint' },
};
