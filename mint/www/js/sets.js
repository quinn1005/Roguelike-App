// Expands every card line to 30 cards: 14 common, 9 uncommon, 5 rare, 2 mythic rare.
// The hand-written cards in data.js keep their numbers; the rest are added here with
// fixed names and art specs, so every save sees the same set lists.

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (R, a) => a[Math.floor(R() * a.length)];
const cycle = (a, i) => a[i % a.length];

// Hand-written cards promoted to mythic rare, and card art upgrades for the originals.
const MYTHIC = { gg: [9], ns: [1], bl: [9], ml: [6], tb: [6], rd: [1], ga: [1], hp: [1], ic: [3], cf: [1], sp: [4] };
const UPGRADE = {
  gg: {
    1: { shape: 'round', eyes: 'two', mouth: 'fangs', bg: 'graveyard' }, 2: { eyes: 'cyclops', mouth: 'zipper', bg: 'attic' },
    3: { eyes: 'angry', mouth: 'grin', bg: 'swamp' }, 4: { eyes: 'sleepy', bg: 'kitchen' }, 5: { eyes: 'spiral', mouth: 'tongue', bg: 'graveyard' },
    6: { eyes: 'three', mouth: 'zipper', bg: 'attic' }, 7: { bg: 'kitchen' }, 8: { shape: 'squash', eyes: 'angry', mouth: 'frown', bg: 'market' }, 9: { eyes: 'cyclops', mouth: 'grin', bg: 'graveyard' },
  },
  ns: {
    1: { build: 'heavy', head: 'mohawk', outfit: 'singlet', bg: 'arena' }, 2: { build: 'muscle', head: 'helmet', outfit: 'tights', bg: 'city' },
    3: { build: 'lanky', head: 'mask', outfit: 'cape', pose: 'dive', bg: 'stars' }, 4: { build: 'giant', head: 'bald', outfit: 'trunks', pose: 'chair', bg: 'arena' },
    5: { build: 'small', head: 'ponytail', outfit: 'jacket', pose: 'wave', bg: 'palms' }, 6: { build: 'lanky', head: 'crown', outfit: 'robe', pose: 'belt', bg: 'sunset' },
    7: { build: 'muscle', head: 'afro', outfit: 'singlet', pose: 'mic', bg: 'city' }, 8: { build: 'giant', head: 'long', outfit: 'robe', pose: 'hips', bg: 'stars' },
  },
  bl: {
    1: { plan: 'quad', eyes: 'sparkle' }, 2: { plan: 'biped', eyes: 'sleepy' }, 3: { plan: 'quad', ears: 'round', eyes: 'happy' }, 4: { plan: 'frog', ears: 'none' },
    5: { plan: 'dragon', ears: 'horn' }, 6: { plan: 'quad', ears: 'tuft', extra: 'spots' }, 7: { plan: 'bird', ears: 'tuft', eyes: 'angry' }, 8: { plan: 'biped', extra: 'mask' },
    9: { plan: 'serpent', ears: 'horn', eyes: 'sparkle' },
  },
  ml: { 1: { back: 'window' }, 2: { back: 'graveyard' }, 3: { back: 'forest' }, 4: { back: 'city' }, 5: { back: 'cathedral' }, 6: { back: 'cathedral' } },
  tb: { 1: { pal: 'deep' }, 2: { pal: 'deep' }, 3: { pal: 'murk' }, 4: { pal: 'teal' }, 5: { pal: 'storm' }, 6: { pal: 'deep' } },
  rd: { 1: { bg: 'volcano' }, 2: { bg: 'temple' }, 3: { bg: 'void' }, 4: { bg: 'temple' }, 5: { bg: 'storm' }, 6: { bg: 'volcano' } },
  ga: { 1: { fig: 'hood' } },
  ic: { 1: { chassis: 'tank' }, 2: { chassis: 'torpedo' }, 3: { chassis: 'torpedo', extra: 'rocket' }, 4: { chassis: 'tank' }, 5: { chassis: 'tricycle' }, 6: { chassis: 'locomotive' } },
};

// ------------------------------------------------------------------ name and art pools per line
const GG = {
  names: ['Pumpkinstein', 'Count Radula', 'Ghostato', 'Skeletomato', 'Vampeach', 'Lettuce Prey', 'Haunted Parsnip', 'Beetlejuice Beet', 'Gourdon the Grim', 'Turnip Terror',
    'Sir Squashalot', 'The Spud Wraith', 'Cherry Bomb Ghoul', 'Leekenstein', 'Onionimous', 'Okra Oracle', 'Hex Pepper', 'Grave Gherkin', 'Rotten Radish', 'Plum Phantom',
    'Mushroom Mortician', 'Cauliflower Creep', 'Berry Banshee', 'Doom Durian', 'Eggplant Executioner', 'Lich Lime', 'Pear-a-normal', 'Scream Bean', 'Witch Hazelnut'],
  types: ['ROOT · CURSED', 'FRUIT · GHOUL', 'VEGGIE · FIEND', 'BERRY · SPOOK', 'GOURD · BEAST', 'FUNGUS · UNDEAD', 'SPICE · HEX', 'PICKLE · GRAVE'],
  texts: [['Found under the sink', 'after midnight.'], ['Its smell arrives', 'a day before it does.'], ['Never left the', 'crisper drawer alive.'], ['Grandma swore', 'she threw it out.'],
    ['Do not make eye contact', 'at the farmers market.'], ['It rots on purpose.', 'Out of spite.'], ['Ate the whole', 'compost heap.'], ['Lunch money is', 'its favorite snack.'],
    ['Mold is just', 'its winter coat.'], ['The fridge light', 'is afraid of it.'], ['It ripens only', 'during thunderstorms.'], ['Seeds itself', 'in your nightmares.']],
  shapes: ['round', 'tall', 'long', 'bunch', 'pear', 'pod', 'cap', 'leafy', 'pepper', 'bulb', 'squash', 'berry'],
  bodies: [['#f07f2a', '#b85a14'], ['#e6372e', '#9a1a14'], ['#ffe14d', '#c9a520'], ['#7b3fa0', '#5a2a7a'], ['#7ccc4f', '#4f9a2f'], ['#c9a0d8', '#8a5aa0'], ['#f3ead2', '#c9b9a0'],
    ['#b5502a', '#7a3216'], ['#3f9a3a', '#2a6a26'], ['#ff8fb1', '#c95a7a'], ['#c9b07a', '#8a7040'], ['#4a2a6a', '#2a1a4a'], ['#9fe0a0', '#5aa060'], ['#e05a8a', '#a02a5a']],
  costumes: ['cape', 'hood', 'fur', 'wraps', 'stitches', 'bolts', 'sheet', 'witchhat', 'tophat', 'crown', 'horns', 'eyepatch', 'chains', 'scarf', 'none'],
  ccs: ['#e6372e', '#3a2a4a', '#1a1a1a', '#f3ead2', '#2e7d32', '#ffd23f', '#8a8f96', '#1f3fbf', '#6b4a2a'],
  eyes: ['two', 'angry', 'cyclops', 'three', 'sleepy', 'spiral'],
  mouths: ['fangs', 'grin', 'zipper', 'tongue', 'frown'],
  bgs: ['night', 'graveyard', 'kitchen', 'market', 'swamp', 'attic'],
  skies: ['#3b2a8a', '#2a6a5a', '#24305e', '#4a2a6a', '#5a2a2a', '#1a1030', '#2a4a6a', '#6a3a1a', '#1a3a3a'],
};
const NS = {
  first: ['Rowdy', 'Iron', 'Glitter', 'Mad Dog', 'Sister', 'Baron', 'Hurricane', 'Little', 'Bad News', 'Sweet', 'Million Dollar', 'Psycho', 'Ravishing', 'Cowboy', 'Golden', 'Diamond', 'Crusher', 'Mister', 'Dynamite', 'Slick'],
  last: ['Ramone', 'Vasquez', 'Kowalski', 'Jackson', 'McGraw', 'Petrov', 'Steele', 'Sinclair', 'Dupree', 'Okonkwo', 'Bishop', 'Navarro', 'Kincaid', 'Moreau', 'Tanaka', 'Bulldozer', 'Flynn', 'Santos', 'Brody'],
  titles: ['The Animal', 'The Professor', 'Hellcat', 'The Butcher', 'Neon Angel', 'The Undertow', 'Big Money', 'The Hangman', 'Moonlight', 'The Iceberg', 'Lady Luck', 'The Surgeon', 'Voodoo Vic', 'The Monk', 'Hot Rod', 'The Masked Bandit', 'Disco Inferno', 'The Bounty Hunter', 'Mama Grizzly', 'The Kid', 'King Kobra', 'The Tornado'],
  quotes: ['“I eat turnbuckles for breakfast.”', '“Check the tape. Then check your teeth.”', '“Nobody walks out of my ring.”', '“Pain is a rumor. I am the truth.”', '“I came for the belt. I stayed for you.”', '“Count to three. I dare you.”',
    '“The crowd loves me. You will too.”', '“Hope you brought a stretcher.”', '“I was born in a steel cage.”', '“You hear that bell? That\'s your funeral.”', '“I don\'t lose. I just stop winning.”', '“Ask the ref. He\'s on my payroll.”'],
  finishers: ['THE CANNONBALL', 'NEON NECKBREAKER', 'THE WRECKING BALL', 'GRAVEYARD DRIVER', 'THE MOONSAULT', 'HEART STOPPER', 'THE GUILLOTINE', 'CASH OUT', 'THE TIDAL WAVE', 'LIGHTS OUT', 'THE SLEEPER HOLD', 'THE FINAL BELL', 'COBRA CLUTCH', 'THE BIG SPLASH', 'DEADLINE DDT', 'THE AVALANCHE'],
  builds: ['heavy', 'muscle', 'lanky', 'small', 'giant'],
  heads: ['mohawk', 'mask', 'bald', 'long', 'crown', 'afro', 'helmet', 'bandana', 'ponytail'],
  poses: ['flex', 'point', 'cross', 'belt', 'chair', 'hips', 'mic', 'crouch', 'wave', 'dive'],
  outfits: ['trunks', 'singlet', 'tights', 'jacket', 'cape', 'robe'],
  bgs: ['sunset', 'arena', 'city', 'palms', 'stars'],
  pals: [['#ff4fd8', '#2ee6ff'], ['#ffd23f', '#ff4f4f'], ['#3fe08a', '#2ee6ff'], ['#b06bff', '#ffd23f'], ['#ff8a3d', '#ffe45c'], ['#2ee6ff', '#ff4fd8'], ['#ff4f4f', '#ffffff'], ['#c0c8d8', '#b06bff'], ['#ff4f9a', '#3fe08a']],
};
const BL = {
  pre: { water: ['Puddle', 'Ripple', 'Coral', 'Drizzle', 'Brook'], leaf: ['Fern', 'Clover', 'Bramble', 'Sprig', 'Thistle'], ember: ['Cinder', 'Magma', 'Ash', 'Flicker', 'Scorch'], stone: ['Pebble', 'Boulder', 'Quartz', 'Gravel', 'Flint'],
    storm: ['Static', 'Bolt', 'Thunder', 'Volt', 'Gale'], frost: ['Icicle', 'Sleet', 'Snow', 'Rime', 'Hail'], shadow: ['Gloom', 'Dusk', 'Murk', 'Shade', 'Umbra'] },
  suf: ['pup', 'wing', 'tail', 'paw', 'snout', 'hopper', 'bun', 'drake', 'fin', 'bug', 'blob', 'sprout', 'owl', 'newt', 'moth', 'toad', 'bat', 'mite', 'kit', 'serpent', 'bloom'],
  kinds: { quad: 'Pup', biped: 'Sprite', bird: 'Bird', serpent: 'Serpent', frog: 'Toad', blob: 'Slime', bug: 'Beetle', dragon: 'Drake', fish: 'Fish', plant: 'Sprout', bat: 'Bat' },
  kindPre: { water: 'Pond', leaf: 'Moss', ember: 'Cinder', stone: 'Rock', storm: 'Thunder', frost: 'Snow', shadow: 'Dusk' },
  bodies: { water: ['#4fb3e8', '#3fa0c8', '#5ac0d8', '#4a8fa8'], leaf: ['#6cc04a', '#8fd16a', '#5a9a3a', '#a8d870'], ember: ['#e2572b', '#f08040', '#c8452a', '#ff9a5a'], stone: ['#9a8f86', '#b0a090', '#8a7a6a', '#c0b0a0'],
    storm: ['#f0c830', '#ffd860', '#e0b020', '#f8e070'], frost: ['#a8dcf0', '#c8ecf8', '#88c8e8', '#e0f4fc'], shadow: ['#7a5aa8', '#5a4a7a', '#9a7ac8', '#6a4a9a'] },
  moves: { water: ['Bubble Shot', 'Soak', 'Riptide', 'Rain Dance', 'Undertow', 'Splash'], leaf: ['Vine Lash', 'Seed Toss', 'Overgrow', 'Leaf Blade', 'Pollen Puff', 'Root Grip'], ember: ['Flare', 'Smolder', 'Ash Cloud', 'Fire Fang', 'Kindle', 'Eruption'],
    stone: ['Pebble Toss', 'Harden', 'Quake', 'Rock Slam', 'Tumble', 'Landslide'], storm: ['Zap', 'Static Hop', 'Thunderclap', 'Volt Rush', 'Charge', 'Lightning Rod'], frost: ['Chill', 'Snow Puff', 'Hail', 'Ice Fang', 'Frostbite', 'Blizzard'],
    shadow: ['Lurk', 'Night Shade', 'Hex', 'Shadow Claw', 'Fade', 'Eclipse'] },
  plans: ['quad', 'biped', 'bird', 'serpent', 'frog', 'blob', 'bug', 'dragon', 'fish', 'plant', 'bat'],
  ears: ['fox', 'round', 'tuft', 'horn', 'long', 'fin', 'none'],
  eyes: ['normal', 'sleepy', 'happy', 'sparkle', 'angry'],
  extras: [null, 'spots', 'stripe', 'mask', 'collar', null],
  els: ['water', 'leaf', 'ember', 'stone', 'storm', 'frost', 'shadow'],
};
const ML = {
  names: ['The Widow Moth', 'Sexton Beetle', 'Candle Cicada', 'The Night Nurse', 'Grave Lacewing', 'Lantern Wasp', 'Bell Ringer', 'The Mourning Veil', 'Sister Ashwing', 'The Crypt Ant',
    'Old Mother Spinner', 'Dusk Dragonfly', 'The Last Firefly', 'Brother Thorax', 'The Coffin Moth', 'Chandelier Spider', 'The Wake Keeper', 'Wick Mantis', 'Mister Hollow', 'Rosary Centipede',
    'The Ember Bride', 'Organ Cicada', 'Lady Midnight', 'The Vigil'],
  types: ['Moth · Spirit of', 'Beetle · Keeper of', 'Spider · Weaver of', 'Mantis · Warden of', 'Cicada · Singer of', 'Wasp · Herald of', 'Dragonfly · Courier of', 'Firefly · Light of', 'Ant · Bearer of', 'Centipede · Crawler of', 'Butterfly · Ghost of'],
  domains: ['the Wick', 'Graves', 'Lost Letters', 'the Belfry', 'Funerals', 'Cellars', 'the Last Hour', 'Chapels', 'Old Mirrors', 'the Morgue', 'Smoke', 'Locked Rooms'],
  texts: [['It knocks on windows', 'nobody opens anymore.'], ['It counts the candles', 'and takes one each night.'], ['Mourners swear', 'it wept with them.'], ['It nests in the hymnals', 'between the dead names.'],
    ['Light a lamp and', 'it will find you.'], ['It sings the names', 'the stones forgot.'], ['The undertaker', 'leaves it a saucer of wax.'], ['It only lands', 'on people about to leave.']],
  bugs: ['moth', 'beetle', 'lace', 'cicada', 'mantis', 'spider', 'dragonfly', 'firefly', 'wasp', 'butterfly', 'centipede', 'ant'],
  objs: ['lantern', 'candle', 'moon', 'ember', 'key', 'flame', 'skull', 'hourglass', 'bell', 'mirror', 'coffin', 'rose'],
  backs: ['city', 'graveyard', 'window', 'forest', 'cathedral'],
  pals: [['#b9a3b5', '#6e5470'], ['#d9cfb8', '#5a4a3a'], ['#bfe0d8', '#4a7a70'], ['#e0a070', '#7a3a1a'], ['#9fc08a', '#3a5a2a'], ['#c8b0e0', '#4a3a6a'], ['#e8d8a0', '#8a6a2a'], ['#a8a8b8', '#3a3a4a'], ['#e0b0b0', '#7a3a3a'], ['#a0c8e0', '#2a4a6a']],
};
const TB = {
  names: ['The Salt Widow', 'Barnacle Bishop', 'Old Ironshell', 'The Tide Clerk', 'Glasseye', 'The Undertow King', 'Lantern Jaw', 'The Pale Diver', 'Mother of Pearl', 'The Harbor Hag',
    'Captain Nobody', 'The Ninth Wave', 'Sludgefin', 'The Brine Choir', 'Hookmouth', 'The Coral Saint', 'Rustgill', 'The Last Lighthouse', 'Dead Calm', 'The Drowned Choir', 'Gullet', 'The Black Buoy', 'Wreckwalker', 'Tidecaller'],
  types: ['Angler · Trench', 'Serpent · Deepwater', 'Crab · Wreck Dweller', 'Eel · Shallows', 'Jelly · Drift', 'Turtle · Ancient', 'Shark · Open Sea', 'Octopus · Reef', 'Seahorse · Kelp Forest', 'Urchin · Seabed', 'Phantom · Wreck', 'Diver · Lost', 'Whale · Bone Yard', 'Beacon · Coast'],
  beasts: ['angler', 'serpent', 'crab', 'eel', 'jelly', 'turtle', 'shark', 'octopus', 'seahorse', 'urchin', 'ship', 'diver', 'whale', 'lighthouse', 'siren', 'kraken'],
  texts: [['Fishermen leave it', 'the first catch of the day.'], ['It wears the anchors', 'of every ship it sank.'], ['Nobody has seen', 'its whole body at once.'], ['It hums under the docks', 'all winter.'],
    ['The tide goes out', 'when it is hungry.'], ['It keeps a lantern lit', 'for sailors who never come home.'], ['Its shell is', 'a shipwreck.'], ['The harbor bell', 'rings itself for it.']],
  pals: ['teal', 'deep', 'murk', 'storm', 'dawn'],
  cols: [['#2f8f6a', '#1d5e45'], ['#a8452a', '#5a1a0a'], ['#5a1a3a', '#7a2a4a'], ['#3a5a2a', '#1e3a20'], ['#c0563a', '#7a2a1a'], ['#7a8a9a', '#3a4a5a'], ['#e0a030', '#8a5a10'], ['#5a2a7a', '#3a1a4a'], ['#d080e0', '#8a40a0'], ['#4a7a3a', '#2a4a2a']],
};
const RD = {
  a: ['Abyssal', 'Chaos', 'Crimson', 'Infernal', 'Celestial', 'Phantom', 'Iron', 'Storm', 'Frost', 'Shadow', 'Ruin', 'Eclipse', 'Blood', 'Crystal', 'Thunder', 'Silent', 'Hollow', 'Gilded'],
  b: { knight: 'Knight', sorceress: 'Witch', golem: 'Colossus', wraith: 'Revenant', phoenix: 'Phoenix', wolf: 'Hound', mech: 'Machina', angel: 'Seraph', demon: 'Archfiend', samurai: 'Ronin', hydra: 'Hydra', spider: 'Weaver', eye: 'Watcher', twin: 'Blade Dancer', serpent: 'Leviathan', dragon: 'Dragon' },
  kinds: { knight: 'Warrior', sorceress: 'Spellcaster', golem: 'Rock', wraith: 'Fiend', phoenix: 'Winged Beast', wolf: 'Beast', mech: 'Machine', angel: 'Fairy', demon: 'Fiend', samurai: 'Warrior', hydra: 'Sea Serpent', spider: 'Insect', eye: 'Fiend', twin: 'Warrior', serpent: 'Sea Serpent', dragon: 'Dragon' },
  suffix: ['of the Rift', 'Sovereign', 'of Ruin', 'Prime', 'of the Ninth Gate', 'Unbound', '', '', '', ''],
  mons: ['knight', 'sorceress', 'golem', 'wraith', 'phoenix', 'wolf', 'mech', 'angel', 'demon', 'samurai', 'hydra', 'spider', 'eye', 'twin', 'serpent', 'dragon'],
  cols: ['#ff3fa4', '#2ee6ff', '#b06bff', '#ff8a3d', '#3fe08a', '#ffb347', '#ff4f4f', '#7fd1ff', '#ffd23f', '#c9a0ff'],
  bgs: ['volcano', 'void', 'temple', 'storm', 'ice'],
  effects: [['Once per turn: destroy 1 Spell', 'or Trap on the field.'], ['When summoned: draw 1 card,', 'then discard 1 card.'], ['Cannot be destroyed', 'by battle.'], ['If it attacks, your opponent', 'cannot activate cards until', 'the end of the Damage Step.'],
    ['When destroyed: special summon', '1 monster from your Crypt.'], ['Gains 300 ATK for each', 'Fiend on the field.'], ['Pay 1000 LP: banish 1 card', 'your opponent controls.']],
  flavor: [['It guards a gate', 'that no longer opens.'], ['Forged in the first rift.', 'Still burning.'], ['Its name is a curse', 'in three languages.'], ['The duel ends', 'when it says so.'], ['Some say it was', 'a duelist once.']],
};
const GA = {
  a: ['Ashen', 'Drowned', 'Gilded', 'Rootbound', 'Hollow', 'Cinder', 'Tidal', 'Iron', 'Wild', 'Starless', 'Ember', 'Mire', 'Brass', 'Thorn', 'Silent', 'Mournful', 'Vellum', 'Inkbound'],
  b: { witch: 'Hexwife', golem: 'Automaton', tree: 'Treant', drake: 'Wyrmling', knight: 'Paladin', skeleton: 'Bonecaller', elemental: 'Elemental', beast: 'Stalker', angel: 'Herald', serpent: 'Naga', spell: 'Ritual', hood: 'Librarian' },
  schools: ['ember', 'tide', 'iron', 'grove', 'void'],
  figs: ['witch', 'golem', 'tree', 'drake', 'knight', 'skeleton', 'elemental', 'beast', 'angel', 'serpent', 'spell', 'hood'],
  subtypes: { witch: 'Witch', golem: 'Golem', tree: 'Treefolk', drake: 'Drake', knight: 'Knight', skeleton: 'Skeleton', elemental: 'Elemental', beast: 'Beast', angel: 'Angel', serpent: 'Naga', spell: '', hood: 'Scholar' },
  texts: [['Flying. When it dies, return', 'a spell from your graveyard.'], ['Tap: target creature gets', '−2/−0 until end of turn.'], ['Whenever you cast a spell,', 'put a page counter on it.'], ['First strike. It has read', 'every book on war.'],
    ['Reach. It never forgets', 'a name or a debt.'], ['When it enters, each player', 'discards a card.'], ['Sacrifice it: draw two cards.', 'Lose 2 life.'], ['Trample. The library', 'has a basement.']],
};
const HP = {
  names: ['Veyra', 'Kolm', 'Ashtareth', 'The Pale King', 'Mother Ruin', 'Sefet', 'Orrun', 'Ilyssa', 'The Wanderer', 'Brannoch', 'Quell', 'Tamsin of Coins', 'The Bleeding Star', 'Haurok', 'Nimue', 'The Ferryman',
    'Calixa', 'Old Wheel', 'Morrow', 'Saint Absent', 'Dyrnwyn', 'Ezri', 'The Gilded Mouth', 'Thane'],
  titles: ['GODDESS OF THE HUNT', 'GOD OF LOCKS', 'GOD OF THE FORGE', 'GOD OF THE DROWNED', 'GODDESS OF HARVEST', 'GOD OF CROSSROADS', 'GOD OF SILENCE', 'GODDESS OF MIRRORS', 'GOD OF THE ROAD', 'GOD OF WAR',
    'GOD OF SLEEP', 'GODDESS OF COIN', 'GOD OF OMENS', 'GOD OF STORMS', 'GODDESS OF WELLS', 'GOD OF PASSAGE', 'GODDESS OF FEASTS', 'GOD OF FORTUNE', 'GOD OF TOMORROW', 'THE ABSENT SAINT', 'GOD OF BLADES', 'GODDESS OF MASKS', 'GOD OF PROMISES', 'GOD OF KINGS'],
  syms: ['key', 'eye', 'crown', 'skull', 'tree', 'mask', 'star', 'hand', 'chalice', 'wheel', 'mountain', 'wave', 'flame', 'sword', 'feather', 'spiral', 'bell', 'ship'],
  texts: [['Pray to it once.', 'It answers forever.'], ['Its temples have', 'no doors at all.'], ['The priests are paid', 'to forget its face.'], ['It asks for nothing.', 'That is the price.'],
    ['Every coin in the city', 'bears its thumbprint.'], ['It was here first.', 'It will be here last.'], ['Its name is spoken', 'only at funerals.'], ['The sea returns', 'what it is owed.']],
};
const IC = {
  names: ['Rusty Ruth', 'The Boilermaker', 'Gearjammer', 'Smokestack Sam', 'Lady Velocity', 'The Iron Widow', 'Cog & Sons', 'Old Faithful', 'The Rivet', 'Brass Bonnet', 'Whistlestop', 'Duchess Diesel',
    'The Kettle', 'Thunderpipe', 'Clockwork Clyde', 'Miss Fortune', 'The Undertaker', 'Ironsides', 'Lucky Lug', 'The Gasket Gang', 'Copperhead', 'Big Bertha', 'Valve Victor', 'The Sooty Saint'],
  classes: ['Light Class', 'Heavy Class', 'Open Class', 'Sky Class', 'Rail Class'],
  chassis: ['racer', 'torpedo', 'tank', 'monowheel', 'tricycle', 'locomotive', 'zeppelin'],
  hats: ['top', 'cap', 'goggles', 'bowler', 'scarf', 'helmet'],
  bodies: ['#f5d27a', '#e0905a', '#5a5a6a', '#b8c0c8', '#c0392b', '#7a9a5a', '#3a5a8a', '#8a5a3a', '#d0a040', '#6a3a5a'],
  extras: [null, 'wings', 'spikes', 'rocket', 'flag', null],
};
const CF = {
  subjects: [['Mothwing Watcher', 'bigbird'], ['Halloway Swamp Thing', 'swamp'], ['The Goat Man', 'goatman'], ['Hill Lights', 'lights'], ['Shadow Walker', 'shadow'], ['River Frogman', 'frogman'], ['Barn Hairy Man', 'hairy'],
    ['Night Flyer', 'batwing'], ['Lake Neck', 'neck'], ['Ridge Howler', 'howler'], ['Drain Crawler', 'crawler'], ['Small Gray', 'gray'], ['Treeline Eyes', 'owl'], ['Highway Strider', 'strider']],
  scenes: ['pines', 'lake', 'ridge', 'road', 'field', 'swamp', 'barn', 'cave', 'beach', 'highway'],
  places: ['Route 9', 'Halloway Creek', 'Miller farm', 'Cold Spring cave', 'Gull Point', 'Interstate 4', 'Kettle Ridge', 'Old quarry', 'Saw mill', 'Black Lake', 'Pike County', 'Cranberry bog'],
  witnesses: ['(L. Pruitt)', '(M. Haddad)', '(G. Lindqvist)', '(Anonymous)', '(S. Boone)', '(Deputy R. Vance)', '(A. Nakamura)', '(the Moss twins)', '(C. Dube)', '(F. Ortiz)'],
  quotes: [['"It looked back at the', 'flashlight like it knew."'], ['"The dogs wouldn\'t', 'leave the porch."'], ['"Taller than the barn.', 'Quieter than the wind."'], ['"I counted the legs twice.', 'Got two answers."'],
    ['"It followed the car', 'for six miles."'], ['"The tracks stopped', 'in the middle of the field."'], ['"It was wearing', 'my father\'s coat."'], ['"Lights went out', 'all down the valley."']],
  heights: ['2 ft (est.)', '5 ft (est.)', '8 ft (est.)', '11 ft (est.)', '6 ft (est.)', '20 ft (est.)', 'unknown', '7 ft (est.)'],
  years: ["'74", "'75", "'76", "'77", "'78", "'79"],
};
const SP = {
  names: ['Moon Mailroom', 'Rocket Parcel', 'Saturn Sorting', 'Dead Letter Office', 'The Last Postman', 'Comet Express', 'Star Clerk', 'Orbit Envelope', 'Meteor Mail', 'Nebula Route', 'Satellite Relay', 'The Night Train',
    'Lunar Outpost', 'Asteroid Address', 'Wrong Galaxy', 'Return to Sender', 'Airmail to Mars', 'The Lighthouse Stop', 'Signal Lost', 'Postage Due', 'Jelly Courier', 'Robot Carrier', 'The Event Horizon', 'Saucer Delivery'],
  subs: ['Stamped and lost in orbit.', 'Postmarked the day it fell.', 'Signed for by nobody.', 'Delivers to the dark side.', 'Every letter it carried came back.', 'Routed through a dying star.', 'Sorting office of the outer rings.',
    'Forwarding address: unknown.', 'Rain, sleet, or vacuum.', 'Posted a thousand years late.', 'Handle with care. Contains light.', 'Last stop before the edge.'],
  subjs: ['planet', 'astronaut', 'whale', 'dish', 'comet', 'satellite', 'moonbase', 'ufo', 'cluster', 'blackhole', 'train', 'lighthouse', 'mailbox', 'robot', 'jellyfish', 'rocket'],
};

// ------------------------------------------------------------------ generators: one card per call
const GEN = {
  gg(R, n, r, i) {
    const name = GG.names[i % GG.names.length];
    const [body, vein] = cycle(GG.bodies, i * 5 + 3);
    return { name, type: cycle(GG.types, i * 3), text: cycle(GG.texts, i * 7 + 1), stats: `SCARE ${1 + Math.floor(R() * 5) + (r === 'r' ? 3 : r === 'm' ? 4 : 0)} · CRUNCH ${Math.floor(R() * 6)}`,
      art: { shape: cycle(GG.shapes, i * 5 + 2), body, vein, costume: cycle(GG.costumes, i * 4 + 1), cc: cycle(GG.ccs, i * 2 + 1), sky: cycle(GG.skies, i), eyes: cycle(GG.eyes, i * 5), mouth: cycle(GG.mouths, i * 3 + 2), bg: cycle(GG.bgs, i + 1) } };
  },
  ns(R, n, r, i) {
    const full = R() < 0.5 ? `${cycle(NS.first, i * 3)} ${cycle(NS.last, i * 7 + 2)}` : NS.titles[i % NS.titles.length];
    const [a, b] = cycle(NS.pals, i * 2 + 1);
    const top = r === 'r' || r === 'm';
    const st = () => 3 + Math.floor(R() * 6) + (top ? 2 : 0);
    return { name: full, stats: `POW ${st()} · FLEX ${st()} · TALK ${st()}`, quote: cycle(NS.quotes, i * 5 + 1), finisher: cycle(NS.finishers, i * 3 + 2),
      art: { build: cycle(NS.builds, i * 3 + 1), head: cycle(NS.heads, i * 4 + 2), pose: cycle(NS.poses, i * 7 + 3), outfit: cycle(NS.outfits, i * 5), bg: cycle(NS.bgs, i * 2 + 1), belt: top && R() < 0.6, a, b } };
  },
  bl(R, n, r, i) {
    const el = cycle(BL.els, i * 3 + 1), plan = cycle(BL.plans, i * 4 + 1);
    const name = cycle(BL.pre[el], Math.floor(i / 7) + i) + cycle(BL.suf, i * 7 + 3);
    const big = { c: 0, u: 1, r: 2, m: 3 }[r];
    const mv = BL.moves[el];
    const moves = big === 0 ? [[cycle(mv, i), 10 + Math.floor(R() * 2) * 10, 1], [cycle(mv, i + 2), 30 + Math.floor(R() * 2) * 10, 2]]
      : [[cycle(mv, i + 1), 20 + big * 10, 1 + Math.min(1, big - 1)], [cycle(mv, i + 3), 40 + big * 20, 2 + Math.min(2, big)]];
    return { name, el, vigor: 40 + big * 20 + Math.floor(R() * 3) * 10, kind: `${BL.kindPre[el]} ${BL.kinds[plan]}`, moves,
      art: { plan, body: cycle(BL.bodies[el], i), ears: cycle(BL.ears, i * 3 + 2), eyes: cycle(BL.eyes, i * 2 + 1), extra: cycle(BL.extras, i * 5 + 1), hill: 140 + (i % 4) * 6, sunX: 40 + (i * 37) % 160 } };
  },
  ml(R, n, r, i) {
    const nm = ML.names[i % ML.names.length];
    const KEY = { Moth: 'moth', Beetle: 'beetle', Sexton: 'beetle', Cicada: 'cicada', Lacewing: 'lace', Veil: 'lace', Wasp: 'wasp', Ant: 'ant', Spider: 'spider', Spinner: 'spider', Mantis: 'mantis', Dragonfly: 'dragonfly', Firefly: 'firefly', Centipede: 'centipede', Ashwing: 'butterfly', Bride: 'butterfly', Nurse: 'spider', Thorax: 'beetle' };
    const hit = Object.keys(KEY).find((k) => nm.includes(k));
    const bug = hit ? KEY[hit] : cycle(ML.bugs, i * 5 + 2);
    const tIdx = ['moth', 'beetle', 'spider', 'mantis', 'cicada', 'wasp', 'dragonfly', 'firefly', 'ant', 'centipede', 'butterfly', 'lace'].indexOf(bug);
    const typeHead = bug === 'lace' ? 'Lacewing · Veil of' : ML.types[Math.max(0, tIdx)];
    const [wing, acc] = cycle(ML.pals, i * 3 + 1);
    return { name: nm, type: `${typeHead} ${cycle(ML.domains, i * 7)}`.replace(' of the', ' of the'), text: cycle(ML.texts, i * 3 + 2),
      art: { bug, wing, acc, obj: cycle(ML.objs, i * 7 + 3), back: cycle(ML.backs, i * 2) } };
  },
  tb(R, n, r, i) {
    const nm = TB.names[i % TB.names.length];
    const KEY = { Diver: 'diver', Lighthouse: 'lighthouse', Buoy: 'lighthouse', Barnacle: 'crab', Ironshell: 'turtle', Shell: 'turtle', Captain: 'ship', Wreck: 'ship', Choir: 'siren', Widow: 'siren', Hag: 'siren', Jaw: 'angler', Hookmouth: 'angler', Gullet: 'shark', Sludgefin: 'eel', Rustgill: 'eel', Glasseye: 'octopus', Pearl: 'jelly', Coral: 'urchin', Wave: 'serpent', Undertow: 'kraken', Calm: 'whale', Tidecaller: 'seahorse', Clerk: 'crab' };
    const hit = Object.keys(KEY).find((k) => nm.includes(k));
    const beast = hit ? KEY[hit] : cycle(TB.beasts, i * 3);
    const [c, c2] = cycle(TB.cols, i * 7 + 2);
    const typ = TB.types.find((t) => t.toLowerCase().startsWith({ ship: 'phantom', lighthouse: 'beacon', siren: 'serpent', kraken: 'octopus', jelly: 'jelly' }[beast] || beast)) || cycle(TB.types, i);
    return { name: nm, type: typ, text: cycle(TB.texts, i * 5 + 1), art: { beast, pal: cycle(TB.pals, i * 2 + 1), c, c2 } };
  },
  rd(R, n, r, i) {
    const mon = cycle(RD.mons, i * 5 + 1);
    const big = { c: 0, u: 1, r: 2, m: 3 }[r];
    const lv = Math.min(12, 2 + big * 2 + Math.floor(R() * 3));
    const name = `${cycle(RD.a, i * 7 + 3)} ${RD.b[mon]}${big >= 2 ? ' ' + cycle(RD.suffix, i * 3) : ''}`.trim();
    const eff = big >= 1 && R() < 0.75;
    return { name, lv, atk: lv * 250 + Math.floor(R() * 6) * 100, def: lv * 200 + Math.floor(R() * 6) * 100, kind: RD.kinds[mon] + (eff ? ' / Effect' : ''),
      text: eff ? cycle(RD.effects, i * 3 + 1) : cycle(RD.flavor, i * 2), art: { mon, c: cycle(RD.cols, i * 3 + 2), bg: cycle(RD.bgs, i * 2 + 1) } };
  },
  ga(R, n, r, i) {
    const fig = cycle(GA.figs, i * 5 + 2), school = cycle(GA.schools, i * 3 + 1);
    const big = { c: 0, u: 1, r: 2, m: 3 }[r];
    const cost = 1 + Math.floor(R() * 3) + big;
    const p = Math.max(0, cost - 1 + Math.floor(R() * 3)), t = Math.max(1, cost - 1 + Math.floor(R() * 3));
    const sub = GA.subtypes[fig];
    return { name: `${cycle(GA.a, i * 7 + 1)} ${GA.b[fig]}`, cost: [cost, school], type: fig === 'spell' ? 'Sorcery' : `Creature — ${school[0].toUpperCase() + school.slice(1)} ${sub}`,
      text: fig === 'spell' ? ['Each opponent loses 3 life.', 'You gain the life they lost.', 'Burn the page.'] : [...cycle(GA.texts, i * 3 + 2)], pt: fig === 'spell' ? '' : `${p}/${t}`, art: { school, fig } };
  },
  hp(R, n, r, i) { return { name: HP.names[i % HP.names.length], title: HP.titles[i % HP.titles.length], text: cycle(HP.texts, i * 3 + 1), art: { sym: cycle(HP.syms, i * 5 + 2) } }; },
  ic(R, n, r, i) {
    const big = { c: 0, u: 1, r: 2, m: 3 }[r];
    const s1 = [0, 1, 2].map(() => Math.min(10, 2 + Math.floor(R() * 6) + big));
    const s2 = s1.slice(); const k = Math.floor(R() * 3); s2[k] = s2[k] >= 10 ? s2[k] - 1 : s2[k] + 1;
    return { name: IC.names[i % IC.names.length], no: 2 + ((i * 17 + 5) % 97), cls: cycle(IC.classes, i * 2 + 1), s1, s2,
      art: { body: cycle(IC.bodies, i * 3 + 1), hat: cycle(IC.hats, i * 5 + 2), chassis: cycle(IC.chassis, i * 3 + 1), extra: cycle(IC.extras, i * 7 + 2) } };
  },
  cf(R, n, r, i) {
    const [subject, crit] = cycle(CF.subjects, i * 5 + 1);
    return { name: `Exhibit ${n + 30}`, subject, height: cycle(CF.heights, i * 3 + 1), place: cycle(CF.places, i * 5 + 2), year: cycle(CF.years, i * 7), quote: [cycle(CF.quotes, i * 3 + 1)[0], cycle(CF.quotes, i * 3 + 1)[1] + ' ' + cycle(CF.witnesses, i * 7)].map((q, k) => k ? q : q),
      art: { scene: cycle(CF.scenes, i * 3 + 2), crit } };
  },
  sp(R, n, r, i) {
    const big = { c: 0, u: 1, r: 2, m: 3 }[r];
    const nm = SP.names[i % SP.names.length];
    const KEY = { Moon: 'moonbase', Lunar: 'moonbase', Rocket: 'rocket', Saturn: 'planet', Nebula: 'cluster', Comet: 'comet', Meteor: 'comet', Satellite: 'satellite', Train: 'train', Asteroid: 'cluster', Galaxy: 'blackhole', Horizon: 'blackhole', Mars: 'planet', Lighthouse: 'lighthouse', Signal: 'dish', Jelly: 'jellyfish', Robot: 'robot', Saucer: 'ufo', Postman: 'astronaut', Clerk: 'astronaut', Office: 'mailbox', Sender: 'mailbox', Postage: 'mailbox' };
    const hit = Object.keys(KEY).find((k) => nm.includes(k));
    return { name: nm, val: [1, 2, 3, 5, 7, 9, 12, 20][Math.min(7, big * 2 + Math.floor(R() * 2))], sub: cycle(SP.subs, i * 5 + 1), art: { subj: hit ? KEY[hit] : cycle(SP.subjs, i * 5 + 3) } };
  },
};

// Rarity layout for numbers not taken by hand-written cards, spread through the set.
function rarityPool(cards) {
  const want = { c: 14, u: 9, r: 5, m: 2 };
  cards.forEach((c) => { want[c.r]--; });
  const pool = [];
  for (const r of ['m', 'r', 'u', 'c']) for (let k = 0; k < want[r]; k++) pool.push(r);
  return pool;
}

export function expandSets(LINES, CARDS) {
  for (const line of Object.keys(CARDS)) {
    const list = CARDS[line];
    for (const c of list) {
      if ((MYTHIC[line] || []).includes(c.n)) c.r = 'm';
      const up = UPGRADE[line] && UPGRADE[line][c.n];
      if (up) c.art = { ...c.art, ...up };
      if (line === 'ns' && c.art.hair && !c.art.head) c.art.head = c.art.hair;
    }
    const R = rng(line.split('').reduce((h, ch) => h * 31 + ch.charCodeAt(0), 7));
    const pool = rarityPool(list);
    // shuffle so rarer cards land at different numbers in each set, mythics near the end
    for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(R() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
    const mythics = pool.filter((r) => r === 'm');
    const rest = pool.filter((r) => r !== 'm');
    const order = [...rest, ...mythics];
    let i = 0;
    for (let n = list.length + 1; n <= 30; n++, i++) {
      const r = order[i];
      const card = { n, r, ...GEN[line](R, n, r, i) };
      list.push(card);
    }
    // names must be unique inside a set
    const seen = new Set();
    for (const c of list) { let nm = c.name, k = 2; while (seen.has(nm)) nm = `${c.name} ${['II', 'III', 'IV', 'V'][k - 2] || k}`, k++; c.name = nm; seen.add(nm); }
    LINES[line].total = 30;
  }
}
