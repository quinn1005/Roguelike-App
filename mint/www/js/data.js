// Static game data for Mint Condition: 11 card lines, 25 working days.

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

// ------------------------------------------------------------------ extra fields on the first three lines
Object.assign(LINES.gg, { unlock: 1, weight: 1.72, micro: 'GRISTLETOYS' });
Object.assign(LINES.ns, { unlock: 1, weight: 1.80, micro: 'SAINTSLEAGUE' });
Object.assign(LINES.bl, { unlock: 2, weight: 1.75, micro: 'BLOOMWORKS' });

// ------------------------------------------------------------------ weeks 2 to 4: eight more lines
Object.assign(LINES, {
  ml: { id: 'ml', name: 'Moth & Lantern', year: 1996, setCode: 'M&L', total: 6, unlock: 6, weight: 1.90, micro: 'LANTERNHOUSE',
    copyright: '©1996 LANTERNHOUSE PRESS',
    notes: ['Gothic insect spirits, Lanternhouse Press, 1996.', 'Every genuine card carries hidden ink that only shows under the UV lamp. No hidden ink means COUNTERFEIT.', '"Print Run A" cards hide a full secret illustration under UV. They are the chase cards.', 'Back: plum moth wallpaper, gold oval, lit lantern, "EST. 1891".'] },
  tb: { id: 'tb', name: 'Tidebound', year: 1998, setCode: 'TB', total: 6, unlock: 7, weight: 2.05, micro: 'SALTWORKS',
    copyright: '©1998 SALTWORKS GAMES',
    notes: ['Sea monsters on waterproof stock, Saltworks Games, 1998.', 'Water test: a drop beads up on genuine stock. On a fake it soaks in and stains.', 'Never put water on any other line. It stains genuine cards and the client will report you.', 'Back: wave pattern, compass rose, "Charts of the Deep".'] },
  rd: { id: 'rd', name: 'Rift Duelists', year: 2002, setCode: 'RFT', total: 6, unlock: 8, weight: 1.78, micro: 'RIFTGATE',
    copyright: '©2002 RIFTGATE ENT.',
    notes: ['Duel-monster cards from Riftgate Entertainment, 2002.', 'Every genuine card has a silver hex hologram bottom right. On the tilt stand it shifts through rainbow colors. A flat silver hex is COUNTERFEIT.', 'Chase versions: gold-foil names, and Secret Rares with rainbow names and an etched pattern.', 'Back: violet hex grid split by a magenta rift.'] },
  ga: { id: 'ga', name: 'Grimoire Accord', year: 1993, setCode: 'GA', total: 6, unlock: 11, weight: 1.84, micro: 'ACCORDQUILL',
    copyright: '©1993 ACCORD & QUILL',
    notes: ['Spellcaster cards from Accord & Quill, 1993. Frame color shows the school of magic.', 'Alpha prints have rounder corners: 3.0 mm on the ruler, against 2.0 mm on later prints.', 'Forgers recut corners to fake an Alpha. If the four corners measure differently, it is ALTERED.', 'Back: green leather cover, brass corners, keyhole seal.'] },
  hp: { id: 'hp', name: 'Hollow Pantheon', year: 1987, setCode: 'HP', total: 6, unlock: 12, weight: 2.10, micro: 'GILTHOLLOW',
    copyright: '©1987 GILT & HOLLOW',
    notes: ['Gods in real gold leaf on black stock, Gilt & Hollow, 1987. Reprinted in 2003.', 'Gold leaf tarnishes. A real 1987 first print is visibly darkened and spotted. Bright, fresh leaf is the 2003 reprint.', 'Under the microscope, genuine leaf shows tiny flakes. Smooth gold is paint: COUNTERFEIT.', 'Back: gold sunburst ring around an eye in a doorway.'] },
  ic: { id: 'ic', name: 'Ironclad Derby', year: 1988, setCode: 'ID', total: 6, unlock: 13, weight: 1.81, micro: 'DERBYSONS',
    copyright: '©1988 DERBY & SONS',
    notes: ['Steam racer cards from Derby & Sons, 1988.', 'There were two print runs. Run 2 changed one stat on every card. The footer says which run it is.', 'Check the stats against the stat sheet in this binder. A Run 1 footer with Run 2 stats, or numbers on neither sheet, is COUNTERFEIT.', 'Back: brass gear with a checkered flag.'] },
  cf: { id: 'cf', name: 'Cryptid Field Notes', year: 1979, setCode: 'CFN', total: 6, unlock: 16, weight: 1.69, micro: 'BUREAUPRESS',
    copyright: '©1979 BUREAU PRESS',
    notes: ['Case-file cards from Bureau Press, 1979.', 'Serialized copies carry a red VERIFIED stamp with a number out of 50. Every serial exists once.', 'Look the serial up on the registry terminal. If it is already registered to another card, this one is COUNTERFEIT.', 'Back: lined case file, a giant footprint, CLASSIFIED stamp.'] },
  sp: { id: 'sp', name: 'Starpost', year: 1997, setCode: 'SP', total: 6, unlock: 17, weight: 1.40, micro: 'STARPOSTPHIL',
    copyright: '©1997 STARPOST PHILATELIC',
    notes: ['Stamp-cards from the Starpost Philatelic Society, 1997.', 'Genuine perforations: 28 along each long side and 20 along each short side. The ruler counts them.', 'Torn perfs are edge damage. A wrong count is COUNTERFEIT.', 'The legendary error: the center printed upside down. Grade it as an AUTHENTIC ERROR.'] },
});

Object.assign(CARDS, {
  ml: [
    { n: 1, name: 'Lady Vesper', r: 'r', type: 'Lamp Moth · Spirit of the Wick', text: ['Drawn to the last lit window in town.', 'Her dust never washes off.'], art: { bug: 'moth', wing: '#b9a3b5', acc: '#6e5470', obj: 'lantern' } },
    { n: 2, name: 'The Bone Beetle', r: 'c', type: 'Beetle · Keeper of Crypts', text: ['It cleans what the', 'mourners leave behind.'], art: { bug: 'beetle', wing: '#d9cfb8', acc: '#5a4a3a', obj: 'candle' } },
    { n: 3, name: 'Widow\'s Lacewing', r: 'c', type: 'Lacewing · Veil Spirit', text: ['Its wings are made', 'of funeral lace.'], art: { bug: 'lace', wing: '#bfe0d8', acc: '#4a7a70', obj: 'moon' } },
    { n: 4, name: 'Ash Cicada', r: 'u', type: 'Cicada · Ember Singer', text: ['It sings only when', 'something is burning.'], art: { bug: 'cicada', wing: '#e0a070', acc: '#7a3a1a', obj: 'ember' } },
    { n: 5, name: 'Mourning Mantis', r: 'u', type: 'Mantis · Gatekeeper', text: ['It prays for you.', 'You will not like it.'], art: { bug: 'mantis', wing: '#9fc08a', acc: '#3a5a2a', obj: 'key' } },
    { n: 6, name: 'The Lamplighter', r: 'r', type: 'Moth · Keeper of Flames', text: ['Every flame in the city', 'answers to it.'], art: { bug: 'moth', wing: '#f2c46d', acc: '#8a4a1a', obj: 'flame' } },
  ],
  tb: [
    { n: 1, name: 'The Drowned Bell', r: 'u', type: 'Leviathan · Deepwater', text: ['It still rings at low tide.', 'Sailors count the chimes and pray.'], art: { beast: 'serpent' } },
    { n: 2, name: 'Brinejaw', r: 'c', type: 'Angler · Trench', text: ['Follow the light.', 'Everyone does.'], art: { beast: 'angler' } },
    { n: 3, name: 'The Kelp Widow', r: 'c', type: 'Siren · Shallows', text: ['She wears every net', 'that ever caught her.'], art: { beast: 'siren' } },
    { n: 4, name: 'Old Barnacle', r: 'c', type: 'Crab · Wreck Dweller', text: ['Older than the harbor.', 'Meaner than the tide.'], art: { beast: 'crab' } },
    { n: 5, name: 'Ghost Galleon', r: 'u', type: 'Wreck · Phantom', text: ['Crewed by everyone', 'the sea kept.'], art: { beast: 'ship' } },
    { n: 6, name: 'The Abyss Mother', r: 'r', type: 'Kraken · Abyssal', text: ['The bottom of the sea', 'is her back.'], art: { beast: 'kraken' } },
  ],
  rd: [
    { n: 1, name: 'Obsidian Wyrm Sovereign', r: 'r', lv: 8, atk: 3000, def: 2500, kind: 'Dragon / Effect', text: ['Cannot be Normal Summoned. Once per turn:', 'banish 1 Dragon from your Crypt, then shatter', '1 card on the field.'], art: { mon: 'dragon', c: '#ff3fa4' } },
    { n: 2, name: 'Hexblade Knight', r: 'c', lv: 4, atk: 1700, def: 1200, kind: 'Warrior', text: ['A knight who swore an oath', 'to a sword that lies.'], art: { mon: 'knight', c: '#2ee6ff' } },
    { n: 3, name: 'Void Sorceress', r: 'u', lv: 6, atk: 2200, def: 1800, kind: 'Spellcaster / Effect', text: ['Once per turn: look at your opponent\'s', 'hand. Choose 1 card. It stays there', 'forever.'], art: { mon: 'sorceress', c: '#b06bff' } },
    { n: 4, name: 'Rubble Golem', r: 'c', lv: 4, atk: 1000, def: 2100, kind: 'Rock', text: ['It was a church once.', 'It remembers the hymns.'], art: { mon: 'golem', c: '#ff8a3d' } },
    { n: 5, name: 'Lantern Wraith', r: 'c', lv: 3, atk: 1300, def: 600, kind: 'Fiend', text: ['It lights the way', 'for those already lost.'], art: { mon: 'wraith', c: '#3fe08a' } },
    { n: 6, name: 'Phoenix of the Ninth Rift', r: 'r', lv: 7, atk: 2600, def: 2000, kind: 'Winged Beast / Effect', text: ['When destroyed: return it to the field', 'at the end of the turn. It does not', 'forgive.'], art: { mon: 'phoenix', c: '#ffb347' } },
  ],
  ga: [
    { n: 1, name: 'Archivist of Ash', r: 'r', cost: [2, 'ember'], type: 'Creature — Ember Scholar', text: ['When it enters, burn a page: look at', 'the top three cards of your library.', 'Keep one and ash the rest.'], pt: '3/4', art: { school: 'ember', fig: 'hood' } },
    { n: 2, name: 'Tide Witch', r: 'u', cost: [3, 'tide'], type: 'Creature — Sea Witch', text: ['Tap: return target creature', 'to the bottom of the sea.'], pt: '2/3', art: { school: 'tide', fig: 'witch' } },
    { n: 3, name: 'Iron Sentinel', r: 'c', cost: [4, 'iron'], type: 'Artifact Creature — Golem', text: ['Vigilance. It has not', 'slept in three hundred years.'], pt: '4/5', art: { school: 'iron', fig: 'golem' } },
    { n: 4, name: 'Grove Elder', r: 'c', cost: [2, 'grove'], type: 'Creature — Treefolk', text: ['Reach. Its roots go down', 'to the old graves.'], pt: '1/5', art: { school: 'grove', fig: 'tree' } },
    { n: 5, name: 'Void Scribe', r: 'u', cost: [3, 'void'], type: 'Creature — Wraith Scholar', text: ['Whenever a spell is cast, write', 'its name. Erase one of yours.'], pt: '2/2', art: { school: 'void', fig: 'hood' } },
    { n: 6, name: 'Hearth Drake', r: 'c', cost: [3, 'ember'], type: 'Creature — Drake', text: ['Flying. It guards the fire', 'that guards the library.'], pt: '3/2', art: { school: 'ember', fig: 'drake' } },
  ],
  hp: [
    { n: 1, name: 'Ossarion', r: 'r', title: 'GOD OF THRESHOLDS', text: ['Every door you did not open', 'still remembers your hand.'], art: { sym: 'door' } },
    { n: 2, name: 'Sunmother Aya', r: 'u', title: 'GODDESS OF NOON', text: ['She sees everything once a day,', 'and forgives none of it.'], art: { sym: 'sun' } },
    { n: 3, name: 'Nocturne', r: 'c', title: 'GOD OF THE LATE HOUR', text: ['He keeps the hours', 'nobody wants.'], art: { sym: 'moon' } },
    { n: 4, name: 'The Weigher', r: 'c', title: 'GOD OF DEBTS', text: ['Everything is weighed.', 'Everything is owed.'], art: { sym: 'scales' } },
    { n: 5, name: 'Ouroboth', r: 'u', title: 'GOD OF RETURNS', text: ['What leaves comes back.', 'Hungrier.'], art: { sym: 'serpent' } },
    { n: 6, name: 'Old Hourglass', r: 'c', title: 'GOD OF LAST CHANCES', text: ['The sand is not falling.', 'It is leaving.'], art: { sym: 'hourglass' } },
  ],
  ic: [
    { n: 1, name: 'The Brass Mule', r: 'u', no: 9, cls: 'Heavy Class', s1: [7, 8, 6], s2: [9, 8, 6], art: { body: '#f5d27a', hat: 'top' } },
    { n: 2, name: 'Copper Comet', r: 'c', no: 3, cls: 'Light Class', s1: [9, 4, 5], s2: [9, 5, 5], art: { body: '#e0905a', hat: 'cap' } },
    { n: 3, name: 'Widowmaker', r: 'r', no: 13, cls: 'Open Class', s1: [10, 9, 3], s2: [10, 9, 5], art: { body: '#5a5a6a', hat: 'goggles' } },
    { n: 4, name: 'Tin Tortoise', r: 'c', no: 1, cls: 'Heavy Class', s1: [3, 10, 9], s2: [4, 10, 9], art: { body: '#b8c0c8', hat: 'bowler' } },
    { n: 5, name: 'Lady Piston', r: 'u', no: 7, cls: 'Light Class', s1: [8, 6, 7], s2: [8, 7, 7], art: { body: '#c0392b', hat: 'scarf' } },
    { n: 6, name: 'Steam Jack', r: 'c', no: 22, cls: 'Open Class', s1: [6, 6, 8], s2: [6, 6, 9], art: { body: '#7a9a5a', hat: 'cap' } },
  ],
  cf: [
    { n: 1, name: 'Exhibit 14', r: 'r', subject: 'Pinewood Strider', height: '9 ft (est.)', place: 'Route 12', year: "'79", quote: ['"It stepped over the fence like', 'it wasn\'t even there." (R. Okafor)'], art: { scene: 'pines', crit: 'strider' } },
    { n: 2, name: 'Exhibit 3', r: 'u', subject: 'Lake Halloway Neck', height: '40 ft (est.)', place: 'Lake Halloway', year: "'77", quote: ['"Too still for a wave.', 'Too tall for a log." (T. Brandt)'], art: { scene: 'lake', crit: 'neck' } },
    { n: 3, name: 'Exhibit 7', r: 'c', subject: 'Ridge Howler', height: '7 ft (est.)', place: 'Kettle Ridge', year: "'78", quote: ['"We heard it for an hour.', 'We saw it for a second." (J. Moss)'], art: { scene: 'ridge', crit: 'howler' } },
    { n: 4, name: 'Exhibit 9', r: 'c', subject: 'Culvert Crawler', height: '3 ft (est.)', place: 'Mill Street drain', year: "'79", quote: ['"Too many elbows."', '(Anonymous)'], art: { scene: 'road', crit: 'crawler' } },
    { n: 5, name: 'Exhibit 21', r: 'u', subject: 'The Gray Visitor', height: '4 ft (est.)', place: 'Halloway farm', year: "'76", quote: ['"It asked for my mother', 'by name." (E. Marsh)'], art: { scene: 'field', crit: 'gray' } },
    { n: 6, name: 'Exhibit 30', r: 'c', subject: 'Owl-Eyed Man', height: '6 ft (est.)', place: 'Old mill road', year: "'79", quote: ['"The eyes stayed in the', 'trees after it left." (D. Kerr)'], art: { scene: 'pines', crit: 'owl' } },
  ],
  sp: [
    { n: 1, name: 'Comet Courier', r: 'u', val: 3, sub: 'Delivers to any address. Eventually.', art: { subj: 'rocket' } },
    { n: 2, name: 'Ring Station', r: 'c', val: 1, sub: 'Sorting office for the outer rings.', art: { subj: 'planet' } },
    { n: 3, name: 'Orbit Clerk', r: 'c', val: 1, sub: 'Signs for every parcel. Never sleeps.', art: { subj: 'astronaut' } },
    { n: 4, name: 'Night Whale', r: 'r', val: 9, sub: 'Carries the mail between galaxies.', art: { subj: 'whale' } },
    { n: 5, name: 'Signal Dish', r: 'c', val: 2, sub: 'Listens for return addresses.', art: { subj: 'dish' } },
    { n: 6, name: 'Last Delivery', r: 'u', val: 5, sub: 'Addressed to a star that went out.', art: { subj: 'comet' } },
  ],
});

export const RARITY_NAME = { c: 'Common', u: 'Uncommon', r: 'Rare' };
export const BASE_VALUE = { c: 2, u: 6, r: 30 };

// Lines that exist on a given day.
export const linesOn = (day) => Object.keys(LINES).filter((l) => LINES[l].unlock <= day);

export const TOOLS = {
  hand: { name: 'Hand', unlock: 1, desc: 'Tap the card to flip it.' },
  loupe: { name: 'Loupe', unlock: 1, desc: 'Drag to magnify. Tap a flaw to tag it. A tag that hits nothing costs 1 minute.' },
  ruler: { name: 'Ruler', unlock: 1, cost: 3, desc: 'Centering, card size, corner radius and perforation count. Costs 3 minutes.' },
  binder: { name: 'Reference', unlock: 1, cost: 1, desc: 'Official images, notes and the codex. Costs 1 minute.' },
  uv: { name: 'UV lamp', unlock: 2, cost: 2, desc: 'Modern paper glows. Touch-ups glow in patches. Hidden ink appears. Costs 2 minutes.' },
  tilt: { name: 'Tilt stand', unlock: 6, cost: 2, desc: 'Tilts the card under a light. Holograms shift color; fakes stay flat. Costs 2 minutes.' },
  water: { name: 'Dropper', unlock: 7, cost: 1, desc: 'Tap to place a drop of water. For Tidebound only. Costs 1 minute.' },
  registry: { name: 'Registry', unlock: 8, cost: 2, desc: 'Population report and serial lookup. Costs 2 minutes.' },
  scale: { name: 'Scale', unlock: 11, cost: 1, desc: 'Weighs the card. Compare with the reference weight. Costs 1 minute.' },
  micro: { name: 'Microscope', unlock: 12, desc: 'A much stronger lens. Shows microprint and gold-leaf flakes. Tagging works here too.' },
  light: { name: 'Light box', unlock: 13, cost: 2, desc: 'Shines light through the card. Thin modern stock glows white; trimmed edges show bright. Costs 2 minutes.' },
};
export const toolsOn = (day) => Object.keys(TOOLS).filter((t) => TOOLS[t].unlock <= day);

// When each counterfeit tell and alteration starts turning up.
export const FAKE_UNLOCK = { print: 1, copyright: 1, uv: 2, swirl: 2, back: 3, nohidden: 6, absorb: 7, flathex: 8, weight: 11, paint: 12, micro: 13, stock: 13, badstats: 13, dupserial: 16, perfs: 17 };
export const FAKE_LINE = { swirl: 'ns', nohidden: 'ml', absorb: 'tb', flathex: 'rd', paint: 'hp', badstats: 'ic', dupserial: 'cf', perfs: 'sp' };
export const ALTER_UNLOCK = { stamp: 3, recolor: 3, trim: 4, alphatrim: 11 };
export const ALTER_LINE = { stamp: 'bl', alphatrim: 'ga' };

export const TIERS = {
  economy: { name: 'Economy', pay: 8 },
  standard: { name: 'Standard', pay: 11 },
  express: { name: 'Express', pay: 16 },
  vip: { name: 'VIP', pay: 30 },
};

export const CLIENTS = [
  'D. Moreau', 'K. Abara', 'T. Lindqvist', 'R. Castellano', 'J. Whitfield', 'P. Nakagawa', 'S. Oyelaran',
  'M. Brandt', 'L. Ferreira', 'A. Kowalczyk', 'B. Haddad', 'C. Mbeki', 'E. Varga', 'G. Tremblay',
  'H. Osei', 'I. Petrov', 'N. Quispe', 'O. Lindgren', 'V. Ashby', 'W. Delacroix', 'Y. Hartmann',
  'F. Iwu', 'Q. Larsen', 'U. Daramola', 'Z. Kovacs', 'R. Mendes', 'L. Achterberg', 'S. Haugen',
];

// ------------------------------------------------------------------ the campaign: 5 weeks, 25 working days
export const WEEKS = [
  { n: 1, name: 'Onboarding', rent: 220, pay: 1, market: 1 },
  { n: 2, name: 'Expansion', rent: 260, pay: 1, market: 1.1 },
  { n: 3, name: 'The Boom', rent: 320, pay: 1.25, market: 1.6 },
  { n: 4, name: 'The Crash', rent: 320, pay: 0.75, market: 0.55 },
  { n: 5, name: 'Reckoning', rent: 340, pay: 0.9, market: 0.8 },
];
export const weekOf = (day) => WEEKS[Math.min(4, Math.floor((day - 1) / 5))];
export const LAST_DAY = 25;

const QUOTA = [5, 6, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
const FAKE = [0.12, 0.16, 0.16, 0.18, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.22, 0.22, 0.24, 0.24, 0.24, 0.3, 0.3, 0.32, 0.32, 0.32, 0.26, 0.26, 0.26, 0.26, 0.26];

const RULES = {
  1: ['Every card must match its submission form: name, number and claimed variant. If it doesn\'t, RETURN it.',
    'Measure centering with the ruler. Untested centering counts as perfect, and that\'s how graders get cited.',
    'Tag every flaw with the loupe. Your grade is built from what you tag.',
    'Genuine cards show a clean dot rosette under the loupe. Blurry, smeared print is COUNTERFEIT.',
    'Check the copyright line in the footer against the reference binder.'],
  2: ['New line in the queue: Bloomlings (1999). Read the reference notes.',
    'UV lamp issued. Genuine vintage stock stays dull. Modern paper glows bright blue-white: COUNTERFEIT.',
    'Counterfeit Neon Saints holos are circulating. The foil swirl on a genuine holo turns clockwise.',
    'Genuine misprints are AUTHENTIC ERRORS. Grade them and label them.'],
  3: ['Bloomlings 1st Edition stamps appear only on shadowless prints. Stamp plus shadow means ALTERED.',
    'Touch-up ink glows in patches under UV. Recolored corners and edges are ALTERED.',
    'Flip every card. Backs have their own flaws, and counterfeiters get backs wrong.'],
  4: ['Trimmed cards are circulating. Every card must measure 2.50 × 3.50 in on the ruler. Anything smaller is ALTERED.'],
  5: ['INTERNAL AUDIT TODAY. Your past slabs will be pulled and re-graded.'],
  6: ['New line: Moth & Lantern. Every genuine card has hidden ink under UV. No hidden ink means COUNTERFEIT.',
    'Tilt stand issued. Use it on any holo or hologram.'],
  7: ['New line: Tidebound, on waterproof stock. Use the dropper: water beads on a real card and soaks into a fake.',
    'The dropper is for Tidebound only. Water on any other card is damage, and you will be cited for it.'],
  8: ['New line: Rift Duelists. The hex hologram must shift color on the tilt stand. Flat silver is COUNTERFEIT.',
    'Registry terminal issued: population reports and serial lookups.'],
  9: ['Walk-ins still skip review. Management reminds you that review is a privilege, not a right.'],
  10: ['Rent is due tonight. Pay advances are not available.'],
  11: ['Market conditions: demand is extreme. Expect VIP walk-ins. Treat them with care.',
    'New line: Grimoire Accord. Alpha corners measure 3.0 mm. Corners that don\'t match each other were recut: ALTERED.',
    'Precision scale issued. Every card must be within 0.05 g of its reference weight.'],
  12: ['New line: Hollow Pantheon. 1987 first prints are tarnished; bright leaf is the 2003 reprint. Check the form\'s claim.',
    'Microscope issued. Genuine gold leaf shows flakes under it. Smooth gold is paint.'],
  13: ['New line: Ironclad Derby. Match the stats to the print run on the stat sheet.',
    'Light box issued. Genuine stock glows a dim amber. Thin modern stock shines white.',
    'A new class of counterfeit is circulating: perfect in every visible way. Only the microprint along the bottom border is wrong. Use the microscope.'],
  14: ['Quotas are rising with demand. So is the pay.'],
  15: ['Rent is due tonight.'],
  16: ['MARKET NOTICE: values have collapsed. Gemline is cutting per-card pay by 25% until further notice.',
    'New line: Cryptid Field Notes. Every serial exists once. Check serialized copies on the registry.'],
  17: ['New line: Starpost. Count the perforations with the ruler: 28 by 20. An upside-down center is a genuine ERROR.'],
  18: ['Fraud is up across the city. Assume nothing.'],
  19: ['Clients are desperate. Desperate people lie on forms. Check every claim.'],
  20: ['Rent is due tonight.'],
  21: ['The board is reviewing every grader. Your record this week decides your future here.'],
  22: ['Ring forgeries are still in circulation. Every confiscated forgery is evidence. Keep them.'],
  23: ['A reporter has been seen outside the building. Staff will not speak to the press.'],
  24: ['Tomorrow is the last day of the quarter.'],
  25: ['FINAL AUDIT TODAY.'],
};

export const DAYS = Array.from({ length: LAST_DAY }, (_, i) => {
  const n = i + 1;
  return {
    n, quota: QUOTA[i], lines: linesOn(n), tools: toolsOn(n),
    fake: FAKE[i], altered: n < 3 ? 0 : 0.14, mismatch: n === 1 ? 0.14 : 0.1,
    fakeKinds: Object.keys(FAKE_UNLOCK).filter((k) => FAKE_UNLOCK[k] <= n),
    alterKinds: Object.keys(ALTER_UNLOCK).filter((k) => ALTER_UNLOCK[k] <= n),
    rules: RULES[n] || [],
    week: weekOf(n).n,
  };
});

export const FOOD = 8;
export const START_MONEY = 40;
export const MAX_CITATIONS = 7; // per week

export const PACKS = {
  gg: { price: 9, label: 'Grim Grocers S1', sub: 'Old stock, 1994' },
  ns: { price: 7, label: 'Neon Saints S1', sub: 'Old stock, 1987' },
  bl: { price: 5, label: 'Bloomlings', sub: 'Unlimited reprint' },
  ml: { price: 8, label: 'Moth & Lantern', sub: 'Old stock, 1996' },
  tb: { price: 7, label: 'Tidebound', sub: 'Old stock, 1998' },
  rd: { price: 6, label: 'Rift Duelists', sub: 'Booster, 2002' },
  ga: { price: 12, label: 'Grimoire Accord', sub: 'Revised, 1994' },
  hp: { price: 10, label: 'Hollow Pantheon', sub: '2003 reprint' },
  ic: { price: 8, label: 'Ironclad Derby', sub: 'Run 2 stock' },
  cf: { price: 9, label: 'Cryptid Field Notes', sub: 'Estate box' },
  sp: { price: 6, label: 'Starpost', sub: 'Collector sheet' },
};
