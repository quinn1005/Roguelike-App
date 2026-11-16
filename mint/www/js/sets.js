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
  ns: {
    1: { build: 'heavy', head: 'mohawk', outfit: 'singlet', bg: 'arena' }, 2: { build: 'muscle', head: 'helmet', outfit: 'tights', bg: 'city' },
    3: { build: 'lanky', head: 'mask', outfit: 'cape', pose: 'dive', bg: 'stars' }, 4: { build: 'giant', head: 'bald', outfit: 'trunks', pose: 'chair', bg: 'arena' },
    5: { build: 'small', head: 'ponytail', outfit: 'jacket', pose: 'wave', bg: 'palms' }, 6: { build: 'lanky', head: 'crown', outfit: 'robe', pose: 'belt', bg: 'sunset' },
    7: { build: 'muscle', head: 'afro', outfit: 'singlet', pose: 'mic', bg: 'city' }, 8: { build: 'giant', head: 'long', outfit: 'robe', pose: 'hips', bg: 'stars' },
  },
  bl: {
    1: { plan: 'quad', eyes: 'sparkle' }, 2: { plan: 'biped', eyes: 'sleepy' }, 3: { plan: 'quad', ears: 'round', eyes: 'happy', comp: 'close' }, 4: { plan: 'golem', ears: 'none' },
    5: { plan: 'dragon', ears: 'horn' }, 6: { plan: 'quad', ears: 'tuft', extra: 'spots', comp: 'pair' }, 7: { plan: 'bird', ears: 'tuft', eyes: 'angry' }, 8: { plan: 'frog', extra: 'mask' },
    9: { plan: 'serpent', ears: 'horn', eyes: 'sparkle' },
  },
  ml: { 1: { back: 'window' }, 2: { back: 'graveyard' }, 3: { back: 'forest' }, 4: { back: 'city' }, 5: { back: 'cathedral' }, 6: { back: 'cathedral', comp: 'close' } },
  tb: { 1: { pal: 'deep' }, 2: { pal: 'deep' }, 3: { pal: 'murk' }, 4: { pal: 'teal' }, 5: { pal: 'storm' }, 6: { pal: 'deep' } },
  rd: { 1: { bg: 'volcano' }, 2: { bg: 'temple' }, 3: { bg: 'void' }, 4: { bg: 'temple' }, 5: { bg: 'storm' }, 6: { bg: 'volcano' } },
  ga: { 1: { fig: 'hood' }, 5: { fig: 'ghost' } },
  ic: { 1: { chassis: 'locomotive', scene: 'track' }, 2: { chassis: 'torpedo', scene: 'desert' }, 3: { chassis: 'racer', extra: 'rocket', scene: 'city' }, 4: { chassis: 'tank', scene: 'bridge' }, 5: { chassis: 'tricycle', scene: 'canyon' }, 6: { chassis: 'monowheel', scene: 'snow' } },
};

// ------------------------------------------------------------------ name and art pools per line
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
// ------------------------------------------------------------------ Grim Grocers: every card by hand
// [name, shape, body, vein, costume, costume color, eyes, mouth, prop, backdrop, sky, type, text]
const GG_CARDS = [
  ['Count Cabbula', 'leafy', '#7ccc4f', '#4f9a2f', 'cape', '#1a1a1a', 'two', 'fangs', null, 'graveyard', '#3b2a8a'],
  ['Mummy Melon', 'round', '#8fd16a', '#3f7a2a', 'wraps', '#f3ead2', 'two', 'zipper', null, 'attic', '#2a6a5a', true],
  ['Werecarrot', 'tall', '#f07f2a', '#b85a14', 'fur', '#6b4a2a', 'angry', 'grin', null, 'swamp', '#24305e'],
  ['Banshee Banana', 'long', '#ffe14d', '#c9a520', 'wisp', '#e8f0ff', 'hollow', 'scream', null, 'kitchen', '#4a2a6a'],
  ['Zombroccoli', 'floret', '#5aa040', '#3a6a26', 'stitches', '#1a1a1a', 'spiral', 'tongue', 'shovel', 'graveyard', '#3a3a5a'],
  ['Frankenfennel', 'bulb', '#e8f0c8', '#8ab060', 'bolts', '#8a8f96', 'three', 'zipper', null, 'lab', '#2a4a3a'],
  ['Poltergrape', 'bunch', '#7b3fa0', '#5a2a7a', 'wisp', '#e8f0ff', 'hollow', 'scream', null, 'kitchen', '#2a2a4a'],
  ['Ghoulash', 'pot', '#b5502a', '#7a3216', 'none', '#3a2a4a', 'angry', 'frown', 'fork', 'kitchen', '#5a2a2a'],
  ['The Corn Reaper', 'corn', '#ffd23f', '#c9a020', 'reaper', '#141414', 'cyclops', 'grin', null, 'field', '#1a1030'],
  ['Pumpkinstein', 'squash', '#f07f2a', '#b85a14', 'bolts', '#8a8f96', 'angry', 'stitch', null, 'lab', '#2a3a5a', 'GOURD · MONSTER', ['Built on a stormy night', 'from the compost bin.']],
  ['Radish Ripper', 'radish', '#e6372e', '#9a1a14', 'hood', '#2a2a3a', 'angry', 'grin', 'knife', 'market', '#2a2440', 'ROOT · SLASHER', ['Last seen near', 'the salad bar.']],
  ['Ghostato', 'potato', '#c9a46a', '#8a6a3a', 'wisp', '#e8f0ff', 'hollow', 'scream', null, 'cellar', '#3a2a4a', 'TUBER · GHOST', ['Haunts the cellar', 'where it sprouted.']],
  ['Skeletomato', 'tomato', '#e6372e', '#9a1a14', 'bones', '#f3ead2', 'sockets', 'stitch', null, 'graveyard', '#3a1a2a', 'FRUIT · SKELETON', ['Picked clean', 'by the crows.']],
  ['Vampeach', 'peach', '#ffb38a', '#e07a5a', 'cape', '#5a1a5a', 'sleepy', 'fangs', null, 'night', '#2a1a4a', 'FRUIT · VAMPIRE', ['Never ripens.', 'Never rots.']],
  ['Lettuce Prey', 'lettuce', '#d8f0b0', '#8ac060', 'halo', '#ffe14d', 'sleepy', 'frown', 'candle', 'attic', '#2a2a4a', 'LEAF · CULTIST', ['Its prayers are', 'answered by slugs.']],
  ['Haunted Parsnip', 'tall', '#efe2c0', '#c0a878', 'wisp', '#e8f0ff', 'hollow', 'scream', null, 'swamp', '#2a3a3a', 'ROOT · PHANTOM', ['Pale as the farmer', 'who planted it.']],
  ['Bleeding Beet', 'bulb', '#8a1a3a', '#5a0a20', 'horns', '#3a0a10', 'angry', 'fangs', 'cleaver', 'market', '#3a1a1a', 'ROOT · FIEND', ['Stains everything', 'it touches.']],
  ['Gourdon the Grim', 'gourd', '#c9a040', '#8a6a20', 'chains', '#8a8f96', 'angry', 'frown', null, 'cellar', '#2a2a2a', 'GOURD · JAILER', ['Rattles its chains', 'all winter long.']],
  ['Turnip Terror', 'bulb', '#d8c0e8', '#8a5aa0', 'eyepatch', '#1a1a1a', 'angry', 'grin', 'sword', 'market', '#1f3a5a', 'ROOT · PIRATE', ['Sails the gutters', 'after a storm.']],
  ['Sir Squashalot', 'squash', '#ffd23f', '#c9a020', 'helmet', '#e6372e', 'two', 'frown', 'shield', 'field', '#3a4a6a', 'GOURD · KNIGHT', ['Sworn to guard', 'the vegetable patch.']],
  ['Yam Wraith', 'yam', '#a0582a', '#6a3a1a', 'hood', '#1a1a2a', 'glow', 'none', null, 'swamp', '#1a2a2a', 'TUBER · WRAITH', ['Rises from the mud', 'every harvest.']],
  ['Cherry Bomb Ghoul', 'cherry', '#c0262d', '#7a1010', 'none', '#1a1a1a', 'angry', 'grin', null, 'market', '#3a2a1a', 'FRUIT · GHOUL', ['Pull the stem', 'and run.'], false, 'fuse'],
  ['Leeky Lich', 'leek', '#f3ead2', '#c0b090', 'crown', '#ffd23f', 'glow', 'grin', 'book', 'attic', '#2a1a3a', 'STALK · LICH', ['Keeps its soul', 'in a soup pot.']],
  ['Onionimous', 'onion', '#b06ab0', '#7a3a7a', 'mask', '#e6372e', 'two', 'zipper', null, 'kitchen', '#3a1a3a', 'BULB · PHANTOM', ['Brings tears to', 'every audience.']],
  ['Okra Oracle', 'pod', '#5aa040', '#3a6a26', 'veil', '#7b3fa0', 'sleepy', 'grin', 'orb', 'attic', '#2a2a4a', 'POD · SEER', ['It already knows', 'what you had for lunch.']],
  ['Hex Pepper', 'pepper', '#e6372e', '#9a1a14', 'witchhat', '#7b3fa0', 'spiral', 'grin', 'wand', 'night', '#2a1a3a', 'SPICE · WITCH', ['One bite and', 'you speak in tongues.']],
  ['Grave Gherkin', 'gherkin', '#5a8a3a', '#2e5a1e', 'scarf', '#6b4a2a', 'sleepy', 'frown', 'lantern', 'graveyard', '#2a3a3a', 'PICKLE · GRAVEDIGGER', ['Brined in', 'graveyard rain.']],
  ['Doom Durian', 'durian', '#c9b040', '#8a7a20', 'flies', '#1a1a1a', 'spiral', 'tongue', null, 'swamp', '#3a3a1a', 'FRUIT · PLAGUE', ['The smell arrives', 'a day before it does.']],
  ['Plague Plum', 'round', '#5a2a7a', '#3a1a5a', 'plague', '#1a1a1a', 'goggle', 'none', 'candle', 'cellar', '#2a1a2a', 'FRUIT · DOCTOR', ['Makes house calls.', 'Nobody calls back.']],
  ['Mushroom Mortician', 'cap', '#8a4a9a', '#5a2a6a', 'tophat', '#7a1010', 'sleepy', 'frown', 'coffin', 'cellar', '#2a1a2a', 'FUNGUS · UNDERTAKER', ['Measures you', 'with its eyes.']],
];
const ggSpec = ([name, shape, body, vein, costume, cc, eyes, mouth, prop, bg, sky, type, text, stripes, extra]) => ({
  name, type, text, art: { shape, body, vein, costume: extra || costume, cc, eyes, mouth, prop, bg, sky, stripes: stripes === true },
});

// ------------------------------------------------------------------ subjects for the other lines
// Every line has a list of subjects. Cards get the least-used subject next, so a subject only
// repeats once all of them are taken; a repeat is drawn differently (a pair, close up, far off).
const COMPS = ['solo', 'pair', 'close', 'trio', 'far', 'left'];
const KINDS = {
  bl: ['quad', 'biped', 'bird', 'serpent', 'frog', 'blob', 'bug', 'dragon', 'fish', 'plant', 'bat', 'turtle', 'deer', 'jelly', 'golem'],
  ml: ['moth', 'beetle', 'lace', 'cicada', 'mantis', 'spider', 'dragonfly', 'firefly', 'wasp', 'butterfly', 'centipede', 'ant', 'ladybug', 'scorpion', 'grasshopper', 'stick', 'snail', 'cocoon'],
  tb: ['serpent', 'angler', 'siren', 'crab', 'ship', 'kraken', 'jelly', 'eel', 'turtle', 'shark', 'whale', 'lighthouse', 'octopus', 'seahorse', 'urchin', 'diver', 'manta', 'nautilus', 'starfish', 'squid'],
  rd: ['dragon', 'knight', 'sorceress', 'golem', 'wraith', 'phoenix', 'wolf', 'mech', 'angel', 'demon', 'samurai', 'hydra', 'spider', 'eye', 'twin', 'serpent', 'lich', 'chimera', 'harpy', 'titan'],
  ga: ['hood', 'witch', 'golem', 'tree', 'drake', 'knight', 'skeleton', 'elemental', 'beast', 'angel', 'serpent', 'spell', 'imp', 'owl', 'giant', 'ghost'],
  hp: ['door', 'sun', 'moon', 'scales', 'serpent', 'hourglass', 'key', 'eye', 'crown', 'skull', 'tree', 'mask', 'star', 'hand', 'chalice', 'wheel', 'mountain', 'wave', 'flame', 'sword', 'feather', 'spiral', 'bell', 'ship', 'anchor', 'owl', 'lantern', 'heart', 'raven', 'trident'],
  ic: ['racer', 'torpedo', 'tank', 'monowheel', 'tricycle', 'locomotive', 'zeppelin', 'motorbike', 'sled', 'walker', 'boat', 'balloon', 'drill'],
  cf: ['strider', 'neck', 'howler', 'crawler', 'gray', 'owl', 'bigbird', 'swamp', 'goatman', 'lights', 'shadow', 'frogman', 'hairy', 'batwing', 'worm', 'dogman', 'robed', 'lizard', 'blob', 'tallhat'],
  sp: ['rocket', 'planet', 'astronaut', 'whale', 'dish', 'comet', 'satellite', 'moonbase', 'ufo', 'cluster', 'blackhole', 'train', 'lighthouse', 'mailbox', 'robot', 'jellyfish', 'moon', 'telescope', 'alien', 'galaxy', 'sun', 'pigeon'],
};
const KIND_FIELD = { bl: 'plan', ml: 'bug', tb: 'beast', rd: 'mon', ga: 'fig', hp: 'sym', ic: 'chassis', cf: 'crit', sp: 'subj' };

const ML_NAMES = {
  moth: ['The Widow Moth', 'The Coffin Moth'], beetle: ['Sexton Beetle', 'The Grave Scarab'], lace: ['Grave Lacewing', 'The Mourning Veil'], cicada: ['Organ Cicada', 'Candle Cicada'],
  mantis: ['Wick Mantis', 'The Abbess Mantis'], spider: ['Chandelier Spider', 'Old Mother Spinner'], dragonfly: ['Dusk Dragonfly', 'The Courier of Ash'], firefly: ['The Last Firefly', 'Lantern Fly'],
  wasp: ['Lantern Wasp', 'The Bell Hornet'], butterfly: ['Sister Ashwing', 'The Ember Bride'], centipede: ['Rosary Centipede', 'The Long Procession'], ant: ['The Crypt Ant', 'Pallbearer Ant'],
  ladybug: ['Lady Midnight', 'Our Lady of Cinders'], scorpion: ['Brother Sting', 'The Vigil Scorpion'], grasshopper: ['The Wake Keeper', 'Hymn Hopper'], stick: ['Mister Hollow', 'The Twig Saint'],
  snail: ['The Slow Mourner', 'Shell of the Sexton'], cocoon: ['The Night Nurse', 'The Sleeper'],
};
const ML_TYPE = { moth: 'Moth', beetle: 'Beetle', lace: 'Lacewing', cicada: 'Cicada', mantis: 'Mantis', spider: 'Spider', dragonfly: 'Dragonfly', firefly: 'Firefly', wasp: 'Wasp', butterfly: 'Butterfly', centipede: 'Centipede', ant: 'Ant', ladybug: 'Ladybird', scorpion: 'Scorpion', grasshopper: 'Grasshopper', stick: 'Stick Insect', snail: 'Snail', cocoon: 'Chrysalis' };
const TB_NAMES = {
  serpent: ['The Drowned Choir', 'Salt Coil'], angler: ['Lantern Jaw', 'Hookmouth'], siren: ['The Brine Widow', 'Net Singer'], crab: ['Wreckwalker', 'The Tide Clerk'], ship: ["Captain's Regret", 'The Mary Unseen'],
  kraken: ['The Deep Hunger', 'Ninefold'], jelly: ['Mother of Pearl', 'The Drifting Veil'], eel: ['Sludgefin', 'Rustgill'], turtle: ['Old Ironshell', 'The Island That Swims'], shark: ['Gullet', 'Dead Calm'],
  whale: ['The Bone Choir', 'Old Ribs'], lighthouse: ['The Last Lighthouse', 'The Black Buoy'], octopus: ['Glasseye', 'The Harbor Hag'], seahorse: ['Tidecaller', 'The Kelp Knight'], urchin: ['The Coral Saint', 'Spinewick'],
  diver: ['The Pale Diver', 'Captain Nobody'], manta: ['The Undertow King', 'Nightwing Ray'], nautilus: ['The Spiral Abbot', 'Chamber Nine'], starfish: ['Barnacle Bishop', 'The Five-Armed Widow'], squid: ['Inkmother', 'The Ninth Wave'],
};
const TB_TYPE = { serpent: 'Leviathan · Deepwater', angler: 'Angler · Trench', siren: 'Siren · Shallows', crab: 'Crab · Wreck Dweller', ship: 'Wreck · Phantom', kraken: 'Kraken · Abyssal', jelly: 'Jelly · Drift', eel: 'Eel · Shallows', turtle: 'Turtle · Ancient', shark: 'Shark · Open Sea', whale: 'Whale · Bone Yard', lighthouse: 'Beacon · Coast', octopus: 'Octopus · Reef', seahorse: 'Seahorse · Kelp Forest', urchin: 'Urchin · Seabed', diver: 'Diver · Lost', manta: 'Ray · Midnight Zone', nautilus: 'Nautilus · Ancient', starfish: 'Starfish · Tide Pool', squid: 'Squid · Abyssal' };
const RD_B = { knight: 'Knight', sorceress: 'Witch', golem: 'Colossus', wraith: 'Revenant', phoenix: 'Phoenix', wolf: 'Hound', mech: 'Machina', angel: 'Seraph', demon: 'Archfiend', samurai: 'Ronin', hydra: 'Hydra', spider: 'Weaver', eye: 'Watcher', twin: 'Blade Dancer', serpent: 'Leviathan', dragon: 'Dragon', lich: 'Lich', chimera: 'Chimera', harpy: 'Harpy', titan: 'Titan' };
const RD_K = { knight: 'Warrior', sorceress: 'Spellcaster', golem: 'Rock', wraith: 'Fiend', phoenix: 'Winged Beast', wolf: 'Beast', mech: 'Machine', angel: 'Fairy', demon: 'Fiend', samurai: 'Warrior', hydra: 'Sea Serpent', spider: 'Insect', eye: 'Fiend', twin: 'Warrior', serpent: 'Sea Serpent', dragon: 'Dragon', lich: 'Zombie', chimera: 'Beast', harpy: 'Winged Beast', titan: 'Rock' };
const GA_B = { witch: 'Hexwife', golem: 'Automaton', tree: 'Treant', drake: 'Wyrmling', knight: 'Paladin', skeleton: 'Bonecaller', elemental: 'Elemental', beast: 'Stalker', angel: 'Herald', serpent: 'Naga', spell: 'Ritual', hood: 'Librarian', imp: 'Imp', owl: 'Familiar', giant: 'Giant', ghost: 'Shade' };
const GA_SUB = { witch: 'Witch', golem: 'Golem', tree: 'Treefolk', drake: 'Drake', knight: 'Knight', skeleton: 'Skeleton', elemental: 'Elemental', beast: 'Beast', angel: 'Angel', serpent: 'Naga', spell: '', hood: 'Scholar', imp: 'Imp', owl: 'Bird', giant: 'Giant', ghost: 'Spirit' };
const HP_GODS = {
  key: ['Kolm', 'GOD OF LOCKS'], eye: ['The Watcher', 'GOD OF SECRETS'], crown: ['Thane', 'GOD OF KINGS'], skull: ['The Pale King', 'GOD OF THE DEAD'], tree: ['Mother Ruin', 'GODDESS OF HARVEST'],
  mask: ['Ezri', 'GODDESS OF MASKS'], star: ['The Wanderer', 'GOD OF THE ROAD'], hand: ['Saint Absent', 'THE ABSENT SAINT'], chalice: ['Calixa', 'GODDESS OF FEASTS'], wheel: ['Old Wheel', 'GOD OF FORTUNE'],
  mountain: ['Brannoch', 'GOD OF MOUNTAINS'], wave: ['Sefet', 'GOD OF THE DROWNED'], flame: ['Ashtareth', 'GOD OF THE FORGE'], sword: ['Dyrnwyn', 'GOD OF BLADES'], feather: ['Quell', 'GOD OF SILENCE'],
  spiral: ['Veyra', 'GODDESS OF DREAMS'], bell: ['Morrow', 'GOD OF THE LAST BELL'], ship: ['The Ferryman', 'GOD OF PASSAGE'], anchor: ['Orrun', 'GOD OF HARBORS'], owl: ['Haurok', 'GOD OF THE NIGHT WATCH'],
  lantern: ['Tamsin', 'GODDESS OF LOST WAYS'], heart: ['The Bleeding Star', 'GOD OF DEVOTION'], raven: ['The Gilded Mouth', 'GOD OF OMENS'], trident: ['Nimue', 'GODDESS OF THE DEEP'],
};
const CF_NAMES = {
  bigbird: ['Mothwing Watcher', 'The Route 9 Bird'], swamp: ['Halloway Swamp Thing', 'The Bog Walker'], goatman: ['The Goat Man', 'Horned Hitchhiker'], lights: ['Hill Lights', 'The Quarry Lights'],
  shadow: ['Shadow Walker', 'The Hallway Figure'], frogman: ['River Frogman', 'The Creek Leaper'], hairy: ['Barn Hairy Man', 'The Orchard Ape'], batwing: ['Night Flyer', 'The Steeple Bat'],
  worm: ['The Field Worm', 'Sinkhole Crawler'], dogman: ['The Dog Man', 'Kennel Road Beast'], robed: ['The Robed Visitor', 'The Lantern Monk'], lizard: ['Lake Lizard Man', 'The Scaled Hitchhiker'],
  blob: ['The Ditch Blob', 'Pond Jelly'], tallhat: ['The Hat Man', 'The Tall Neighbor'], neck: ['Black Lake Neck', 'Reservoir Neck'], strider: ['Highway Strider', 'The Pylon Walker'],
  howler: ['Valley Howler', 'The Mill Howler'], crawler: ['Basement Crawler', 'Vent Crawler'], gray: ['Small Gray', 'The Porch Visitor'], owl: ['Treeline Eyes', 'The Barn Owl Man'],
};
const SP_NAMES = {
  satellite: ['Satellite Relay', 'Orbit Envelope'], moonbase: ['Lunar Outpost', 'Moon Mailroom'], ufo: ['Saucer Delivery', 'Wrong Galaxy'], cluster: ['Nebula Route', 'Asteroid Address'],
  blackhole: ['The Event Horizon', 'Dead Letter Office'], train: ['The Night Train', 'Meteor Mail'], lighthouse: ['The Lighthouse Stop', 'Signal Lost'], mailbox: ['Return to Sender', 'Postage Due'],
  robot: ['Robot Carrier', 'Star Clerk'], jellyfish: ['Jelly Courier', 'Nebula Drift'], moon: ['Moonlight Post', 'Crater Box 9'], telescope: ['Observatory Annex', 'Address Unknown'],
  alien: ['Little Green Clerk', 'Visitor Mail'], galaxy: ['Spiral Arm Route', 'Galactic Express'], sun: ['Solar Stamp', 'Sunside Delivery'], pigeon: ['Space Pigeon', 'The Homing Pilot'],
  rocket: ['Rocket Parcel', 'Airmail to Mars'], planet: ['Saturn Sorting', 'Ring Road Depot'], astronaut: ['The Last Postman', 'Spacewalk Courier'], whale: ['The Deep Space Whale', 'Whale Route 7'],
  dish: ['Listening Post', 'Signal Dish II'], comet: ['Comet Express', 'Tailwind Parcel'],
};
const BL_SUF = { quad: ['pup', 'paw', 'fox'], biped: ['kin', 'ling', 'sprite'], bird: ['wing', 'beak', 'finch'], serpent: ['coil', 'wyrm', 'slink'], frog: ['toad', 'hopper', 'croak'], blob: ['blob', 'goo', 'drip'], bug: ['mite', 'beetle', 'bug'], dragon: ['drake', 'wyvern', 'scale'], fish: ['fin', 'gill', 'koi'], plant: ['sprout', 'bud', 'bloom'], bat: ['bat', 'flap', 'squeak'], turtle: ['shell', 'tortle', 'plod'], deer: ['fawn', 'stag', 'hart'], jelly: ['jelly', 'float', 'wobble'], golem: ['golem', 'hulk', 'lump'] };
const BL_KIND = { quad: 'Pup', biped: 'Sprite', bird: 'Bird', serpent: 'Serpent', frog: 'Toad', blob: 'Slime', bug: 'Beetle', dragon: 'Drake', fish: 'Fish', plant: 'Sprout', bat: 'Bat', turtle: 'Turtle', deer: 'Fawn', jelly: 'Jelly', golem: 'Golem' };
const IC_SCENES = ['track', 'desert', 'city', 'snow', 'bridge', 'canyon'];

// Least-used subject next; returns [subject, how many times it was already used].
function allocate(R, kinds, taken, count) {
  const use = Object.fromEntries(kinds.map((k) => [k, 0]));
  taken.forEach((k) => { if (k in use) use[k]++; });
  const order = kinds.slice();
  for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(R() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
  const out = [];
  for (let i = 0; i < count; i++) {
    let best = order[0];
    for (const k of order) if (use[k] < use[best]) best = k;
    out.push([best, use[best]]);
    use[best]++;
    order.push(order.splice(order.indexOf(best), 1)[0]);
  }
  return out;
}
const compFor = (nth, i) => (nth === 0 ? 'solo' : COMPS[1 + ((nth + i) % (COMPS.length - 1))]);
const big = (r) => ({ c: 0, u: 1, r: 2, m: 3 }[r]);

const GEN = {
  ns(R, n, r, i) {
    const full = R() < 0.5 ? `${cycle(NS.first, i * 3)} ${cycle(NS.last, i * 7 + 2)}` : NS.titles[i % NS.titles.length];
    const [a, b] = cycle(NS.pals, i * 2 + 1);
    const top = r === 'r' || r === 'm';
    const st = () => 3 + Math.floor(R() * 6) + (top ? 2 : 0);
    return { name: full, stats: `POW ${st()} · FLEX ${st()} · TALK ${st()}`, quote: cycle(NS.quotes, i * 5 + 1), finisher: cycle(NS.finishers, i * 3 + 2),
      art: { build: cycle(NS.builds, i * 3 + 1), head: cycle(NS.heads, i * 4 + 2), pose: cycle(NS.poses, i * 7 + 3), outfit: cycle(NS.outfits, i * 5), bg: cycle(NS.bgs, i * 2 + 1), belt: top && R() < 0.6, a, b } };
  },
  bl(R, n, r, i, [plan, nth]) {
    const el = cycle(BL.els, i * 3 + nth * 2 + 1);
    const name = cycle(BL.pre[el], i + nth) + cycle(BL_SUF[plan], nth + i);
    const g = big(r), mv = BL.moves[el];
    const moves = g === 0 ? [[cycle(mv, i), 10 + Math.floor(R() * 2) * 10, 1], [cycle(mv, i + 2), 30 + Math.floor(R() * 2) * 10, 2]]
      : [[cycle(mv, i + 1), 20 + g * 10, 1 + Math.min(1, g - 1)], [cycle(mv, i + 3), 40 + g * 20, 2 + Math.min(2, g)]];
    return { name, el, vigor: 40 + g * 20 + Math.floor(R() * 3) * 10, kind: `${BL.kindPre[el]} ${BL_KIND[plan]}`, moves,
      art: { plan, body: cycle(BL.bodies[el], i + nth), ears: cycle(BL.ears, i * 3 + nth + 2), eyes: cycle(BL.eyes, i * 2 + nth + 1), extra: cycle(BL.extras, i * 5 + 1), hill: 140 + (i % 4) * 6, sunX: 40 + (i * 37) % 160, comp: compFor(nth, i) } };
  },
  ml(R, n, r, i, [bug, nth]) {
    const [wing, acc] = cycle(ML.pals, i * 3 + nth + 1);
    return { name: ML_NAMES[bug][nth % 2], type: `${ML_TYPE[bug]} · ${cycle(['Spirit of', 'Keeper of', 'Warden of', 'Herald of', 'Bearer of'], i + nth)} ${cycle(ML.domains, i * 7 + nth)}`, text: cycle(ML.texts, i * 3 + 2),
      art: { bug, wing, acc, obj: cycle(ML.objs, i * 7 + nth * 5 + 3), back: cycle(ML.backs, i * 2 + nth), comp: compFor(nth, i) } };
  },
  tb(R, n, r, i, [beast, nth]) {
    const [c, c2] = cycle(TB.cols, i * 7 + nth * 3 + 2);
    return { name: TB_NAMES[beast][nth % 2], type: TB_TYPE[beast], text: cycle(TB.texts, i * 5 + 1), art: { beast, pal: cycle(TB.pals, i * 2 + nth + 1), c, c2, comp: compFor(nth, i) } };
  },
  rd(R, n, r, i, [mon, nth]) {
    const g = big(r), lv = Math.min(12, 2 + g * 2 + Math.floor(R() * 3));
    const name = `${cycle(RD.a, i * 7 + nth * 5 + 3)} ${RD_B[mon]}${g >= 2 ? ' ' + cycle(RD.suffix, i * 3) : ''}`.trim();
    const eff = g >= 1 && R() < 0.75;
    return { name, lv, atk: lv * 250 + Math.floor(R() * 6) * 100, def: lv * 200 + Math.floor(R() * 6) * 100, kind: RD_K[mon] + (eff ? ' / Effect' : ''),
      text: eff ? cycle(RD.effects, i * 3 + 1) : cycle(RD.flavor, i * 2), art: { mon, c: cycle(RD.cols, i * 3 + nth + 2), bg: cycle(RD.bgs, i * 2 + nth + 1), comp: compFor(nth, i) } };
  },
  ga(R, n, r, i, [fig, nth]) {
    const school = cycle(GA.schools, i * 3 + nth * 2 + 1), g = big(r);
    const cost = 1 + Math.floor(R() * 3) + g;
    const p = Math.max(0, cost - 1 + Math.floor(R() * 3)), t = Math.max(1, cost - 1 + Math.floor(R() * 3));
    return { name: `${cycle(GA.a, i * 7 + nth * 3 + 1)} ${GA_B[fig]}`, cost: [cost, school], type: fig === 'spell' ? 'Sorcery' : `Creature — ${school[0].toUpperCase() + school.slice(1)} ${GA_SUB[fig]}`,
      text: fig === 'spell' ? ['Each opponent loses 3 life.', 'You gain the life they lost.', 'Burn the page.'] : [...cycle(GA.texts, i * 3 + 2)], pt: fig === 'spell' ? '' : `${p}/${t}`, art: { school, fig, comp: compFor(nth, i) } };
  },
  hp(R, n, r, i, [sym]) { const [name, title] = HP_GODS[sym] || [cycle(HP.names, i), cycle(HP.titles, i)]; return { name, title, text: cycle(HP.texts, i * 3 + 1), art: { sym } }; },
  ic(R, n, r, i, [chassis, nth]) {
    const g = big(r);
    const s1 = [0, 1, 2].map(() => Math.min(10, 2 + Math.floor(R() * 6) + g));
    const s2 = s1.slice(); const k = Math.floor(R() * 3); s2[k] = s2[k] >= 10 ? s2[k] - 1 : s2[k] + 1;
    return { name: IC.names[i % IC.names.length], no: 2 + ((i * 17 + 5) % 97), cls: cycle(IC.classes, i * 2 + 1), s1, s2,
      art: { body: cycle(IC.bodies, i * 3 + 1), hat: cycle(IC.hats, i * 5 + 2), chassis, scene: IC_SCENES[(nth * 2 + 1 + i) % IC_SCENES.length], extra: cycle(IC.extras, i * 7 + 2) } };
  },
  cf(R, n, r, i, [crit, nth]) {
    const q = cycle(CF.quotes, i * 3 + 1);
    return { name: `Exhibit ${n + 30}`, subject: CF_NAMES[crit][nth % 2], height: cycle(CF.heights, i * 3 + 1), place: cycle(CF.places, i * 5 + 2), year: cycle(CF.years, i * 7), quote: [q[0], q[1] + ' ' + cycle(CF.witnesses, i * 7)],
      art: { scene: cycle(CF.scenes, i * 3 + nth * 4 + 2), crit } };
  },
  sp(R, n, r, i, [subj, nth]) {
    const g = big(r);
    return { name: SP_NAMES[subj][nth % 2], val: [1, 2, 3, 5, 7, 9, 12, 20][Math.min(7, g * 2 + Math.floor(R() * 2))], sub: cycle(SP.subs, i * 5 + 1), art: { subj, comp: compFor(nth, i) } };
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
      if (line === 'gg') c.art = ggSpec(GG_CARDS[c.n - 1]).art;
    }
    const R = rng(line.split('').reduce((h, ch) => h * 31 + ch.charCodeAt(0), 7));
    const pool = rarityPool(list);
    for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(R() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
    const order = [...pool.filter((r) => r !== 'm'), ...pool.filter((r) => r === 'm')];
    const count = 30 - list.length;
    const slots = KINDS[line] ? allocate(R, KINDS[line], list.map((c) => c.art[KIND_FIELD[line]] || (line === 'ic' ? 'racer' : '')), count) : [];
    for (let i = 0; i < count; i++) {
      const n = list.length + 1, r = order[i];
      if (line === 'gg') {
        const sp = ggSpec(GG_CARDS[n - 1]);
        list.push({ n, r, ...sp, stats: `SCARE ${1 + Math.floor(R() * 5) + big(r) * 1.5 | 0} · CRUNCH ${Math.floor(R() * 6)}` });
      } else list.push({ n, r, ...GEN[line](R, n, r, i, slots[i]) });
    }
    // names must be unique inside a set
    const seen = new Set();
    for (const c of list) { let nm = c.name, k = 2; while (seen.has(nm)) nm = `${c.name} ${['II', 'III', 'IV', 'V'][k - 2] || k}`, k++; c.name = nm; seen.add(nm); }
    LINES[line].total = 30;
  }
}
