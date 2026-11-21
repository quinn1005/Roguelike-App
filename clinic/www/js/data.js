// Everything the clinic knows: species, ailments, treatments, supplies and the demo week.

export const SPECIES = {
  gloop: { name: 'Gloop', temp: [18, 24], blurb: 'A friendly house slime. Eats almost anything, which is most of the problem. Splits in two when badly scared.' },
  pebble: { name: 'Pebblet', temp: [20, 26], blurb: 'Looks like a stone, is (usually) an egg. Needs steady warmth to hatch. Owners often cannot tell which they have.' },
  cat: { name: 'Static Cat', temp: [25, 29], blurb: 'A cat that stores electricity in its fur. A healthy one crackles a little when stroked. Too much charge, or none at all, means trouble.' },
  fern: { name: 'Fernling', temp: [18, 24], blurb: 'A walking houseplant with a face on its bulb. Hardy, cheerful, and almost always overwatered.' },
  moth: { name: 'Mothhound', temp: [36, 39], blurb: 'A dog-sized moth with a loyal streak. Loves lamps far too much. Sheds wing dust everywhere.' },
};

// Each ailment lists what every test shows. `signs` are things you can spot with the lamp:
// x, y are offsets from the patient's feet; `always` signs show without the lamp.
export const AILMENTS = {
  swallowed: {
    sp: 'gloop', name: 'Swallowed object', fee: 40, treat: 'extract',
    listen: 'Squelching around something soft that bumps as it wobbles.',
    temp: 21, xray: 'Something solid in the middle that should not be there.', xk: 'object',
    sample: 'Normal acidity.', mood: 'Grumpy',
    signs: [{ kind: 'lump', x: 6, y: -12, text: 'A lump that moves when it wobbles' }],
    book: 'A lump you can see under the lamp, squelching inside, an object on the X-ray. Temperature normal.',
    cure: 'Out it comes, a little slimy. The Gloop wobbles with relief.',
  },
  reflux: {
    sp: 'gloop', name: 'Acid reflux', fee: 35, treat: 'pill',
    listen: 'Fizzing and sizzling, like soda poured on a stove.',
    temp: 27, xray: 'Nothing inside but bubbles.', xk: 'bubbles',
    sample: 'Very acidic (pH 2). Will dissolve the swab if you wait.', mood: 'Uncomfortable',
    signs: [{ kind: 'bubbles', x: -9, y: -24, text: 'Bubbles rising to the surface' }],
    book: 'Bubbles rising, fizzing inside, runs hot, very acidic sample. An antacid pill settles it.',
    cure: 'One antacid later, the fizzing stops. A long, polite burp.',
  },
  split: {
    sp: 'gloop', name: 'Splitting anxiety', fee: 30, treat: 'calm',
    listen: 'A fast, fluttery wobble.',
    temp: 22, xray: 'Nothing unusual inside.', xk: 'plain',
    sample: 'Stress chemicals very high.', mood: 'Anxious',
    signs: [{ kind: 'bud', x: 22, y: -5, text: 'A small piece budding off its side' }],
    book: 'A piece budding off the side, a fluttery wobble, anxious on the mood scan. Needs calming, not medicine.',
    cure: 'The bud melts back in. The Gloop settles into a happy puddle.',
  },
  cold: {
    sp: 'pebble', name: 'Too cold to hatch', fee: 30, treat: 'admit',
    listen: 'A slow, faint heartbeat.',
    temp: 13, xray: 'A curled-up baby inside, very still.', xk: 'embryo',
    sample: 'Shell is healthy.', mood: 'Sleepy',
    signs: [{ kind: 'frost', text: 'Frost on the top of the shell' }],
    book: 'Frost on the shell, runs cold, a faint heartbeat, a still baby on the X-ray. Admit it to the incubator for a few nights.',
    cure: 'Tucked into the incubator under a warm lamp.',
  },
  cracked: {
    sp: 'pebble', name: 'Cracked shell', fee: 45, treat: 'stitch',
    listen: 'A steady heartbeat, with a thin whistle where air gets in.',
    temp: 22, xray: 'The baby looks fine. There is a gap in the shell.', xk: 'embryo',
    sample: 'Shell dust in the swab.', mood: 'Startled',
    signs: [{ kind: 'crack', text: 'A hairline crack on one side' }],
    book: 'A hairline crack (turn the egg to find it), a whistle with the heartbeat, shell dust. Seal it with a shell patch.',
    cure: 'Patched up. You can barely see where the crack was.',
  },
  rock: {
    sp: 'pebble', name: 'Just a rock', fee: 15, treat: 'tell',
    listen: 'Nothing at all.',
    temp: 19, xray: 'Solid all the way through.', xk: 'solid',
    sample: 'Granite.', mood: 'No reading',
    signs: [{ kind: 'moss', text: 'Moss growing near the bottom' }],
    book: 'No heartbeat, solid on the X-ray, room temperature, maybe moss. It is a rock. Someone has to tell the owner.',
    cure: 'It is a very nice rock.',
  },
  overcharge: {
    sp: 'cat', name: 'Overcharged', fee: 45, treat: 'zap',
    listen: 'Crackling, like a radio between stations.',
    temp: 31, xray: 'The picture whites out with static.', xk: 'static',
    sample: 'Charge level: dangerously high.', mood: 'Wired',
    signs: [{ kind: 'sparks', x: 0, y: -49, always: true, text: 'Sparks jumping between the ears' }],
    book: 'Sparks between the ears, crackling, runs hot, static on the X-ray. Catch the sparks to ground the charge.',
    cure: 'The last spark pops. The cat lets out a long, staticky purr.',
  },
  hairball: {
    sp: 'cat', name: 'Static hairball', fee: 35, treat: 'pill',
    listen: 'A dry rattle in the stomach.',
    temp: 27, xray: 'A tangled ball of fur in the stomach.', xk: 'hairball',
    sample: 'Normal.', mood: 'Annoyed',
    signs: [{ kind: 'fluff', x: 0, y: -25, text: 'Fluff stuck to the chin' }],
    book: 'Fluff on the chin, a rattle in the stomach, a fur ball on the X-ray. A slippery pill helps it pass.',
    cure: 'One pill, one heroic cough, one very large hairball.',
  },
  grounded: {
    sp: 'cat', name: 'Grounded and gloomy', fee: 30, treat: 'calm',
    listen: 'Quiet. No crackle at all.',
    temp: 24, xray: 'A normal skeleton. Nothing wrong inside.', xk: 'skeleton',
    sample: 'Charge level: none.', mood: 'Depressed',
    signs: [{ kind: 'dull', x: -2, y: -16, text: 'Fur lying flat, no shine' }],
    book: 'Flat fur with no shine, no crackle, a little cold, depressed. It needs play and attention, not draining.',
    cure: 'A few minutes with a feather toy and the fur starts to crackle again.',
  },
  rot: {
    sp: 'fern', name: 'Root rot', fee: 35, treat: 'scrub',
    listen: 'Squelching in the pot.',
    temp: 20, xray: 'The roots look dark and mushy.', xk: 'rootsRot',
    sample: 'Soil soaking wet.', mood: 'Soggy',
    signs: [{ kind: 'soggy', x: 0, y: -4, text: 'Water seeping out of the pot' }],
    book: 'Water seeping from the pot, squelching, dark mushy roots, wet soil. Dry the roots and change the soil.',
    cure: 'Dry roots, fresh soil. The leaves perk up within minutes.',
  },
  mites: {
    sp: 'fern', name: 'Leaf mites', fee: 35, treat: 'zap',
    listen: 'Tiny clicking, all over.',
    temp: 21, xray: 'Healthy roots.', xk: 'roots',
    sample: 'Mite eggs on the swab.', mood: 'Itchy',
    signs: [{ kind: 'mites', x: -10, y: -31, text: 'Tiny mites on the leaves' }],
    book: 'Tiny mites you can only see up close under the lamp, clicking, mite eggs on the swab. Pick them off.',
    cure: 'Every last mite flicked away. The leaves stop twitching.',
  },
  pale: {
    sp: 'fern', name: 'Nutrient-starved', fee: 30, treat: 'pill',
    listen: 'Normal sap flow, a little slow.',
    temp: 21, xray: 'Healthy roots.', xk: 'roots',
    sample: 'Low iron, low nitrogen.', mood: 'Tired',
    signs: [{ kind: 'pale', x: 10, y: -36, text: 'Leaves going yellow at the edges' }],
    book: 'Yellow leaf edges, slow sap, low iron and nitrogen on the sample. A plant food pill.',
    cure: 'A plant food pill. The green starts creeping back already.',
  },
  wingmites: {
    sp: 'moth', name: 'Wing mites', fee: 45, treat: 'zap',
    listen: 'Normal breathing.',
    temp: 38, xray: 'Nothing wrong inside.', xk: 'skeleton',
    sample: 'Mite eggs in the wing dust.', mood: 'Itchy',
    signs: [{ kind: 'mites', x: -16, y: -32, text: 'Mites crawling on the wings' }],
    book: 'Mites on the wings (look closely), normal breathing and temperature, eggs in the sample. Pick them off.',
    cure: 'Mite-free. The wings give a proud little flutter.',
  },
  dustlung: {
    sp: 'moth', name: 'Dust lung', fee: 45, treat: 'pill',
    listen: 'Wheezing, with a dusty rattle.',
    temp: 40, xray: 'Cloudy patches in both lungs.', xk: 'cloudy',
    sample: 'Wing dust in the airways.', mood: 'Tired',
    signs: [{ kind: 'dust', x: 0, y: -26, text: 'Dust puffing from the nose' }],
    book: 'Dust puffing from the nose, wheezing, a fever, cloudy lungs. A clearing pill.',
    cure: 'One pill and a mighty sneeze. Breathing clear again.',
  },
  lampstruck: {
    sp: 'moth', name: 'Lamp-struck', fee: 30, treat: 'calm',
    listen: 'Normal breathing, heart racing a little.',
    temp: 37, xray: 'Nothing wrong inside.', xk: 'skeleton',
    sample: 'Normal.', mood: 'Mesmerized',
    signs: [{ kind: 'glazed', x: 0, y: -30, always: true, text: 'Eyes glazed, following the lamp' }],
    book: 'Glazed eyes that follow the lamp, nothing else wrong, mesmerized. Calm it and turn the lights down at home.',
    cure: 'It finally looks away from the lamp and wags at you instead.',
  },
};

export const TREATS = {
  extract: { name: 'Remove the object', uses: null, how: 'Drag the object out without touching the sides.' },
  pill: { name: 'Give a pill', uses: 'pills', how: 'Tap to throw the pill when the mouth is open.' },
  calm: { name: 'Calm and play', uses: null, how: 'Tap when each ring reaches the heart.' },
  stitch: { name: 'Seal the crack', uses: 'patches', how: 'Trace along the crack from the green dot.' },
  zap: { name: 'Pick them off', uses: null, how: 'Tap each one before it moves on.' },
  scrub: { name: 'Dry the roots', uses: null, how: 'Rub the wet roots until they are dry.' },
  admit: { name: 'Admit to the incubator', uses: null, how: 'Keep it warm overnight. Care for it each evening.' },
  tell: { name: 'Break the news', uses: null, how: 'Choose your words.' },
};

export const SUPPLIES = {
  pills: { name: 'Pills', pack: 3, price: 10, start: 3, note: 'For any pill treatment.' },
  patches: { name: 'Shell patches', pack: 2, price: 10, start: 1, note: 'Seal cracked shells.' },
  film: { name: 'X-ray film', pack: 3, price: 12, start: 3, note: 'One per X-ray.' },
  kits: { name: 'Sample kits', pack: 3, price: 9, start: 3, note: 'One per sample.' },
  kibble: { name: 'Kennel care packs', pack: 3, price: 6, start: 2, note: 'Feed and warm one kennel patient for a night.' },
};

// Tests take time, and some use up supplies or cost money to run. Owners only pay for the treatment.
export const TESTS = {
  listen: { name: 'Listen', min: 4 },
  temp: { name: 'Temperature', min: 3 },
  xray: { name: 'X-ray', min: 10, uses: 'film' },
  sample: { name: 'Sample', min: 8, uses: 'kits' },
  mood: { name: 'Mood scan', min: 6, cost: 5 },
};

export const PET_NAMES = {
  gloop: ['Bubbles', 'Jellybean', 'Squish', 'Puddle', 'Wibble', 'Marmalade', 'Gloria'],
  pebble: ['Rocky', 'Shelly', 'Nugget', 'Pebs', 'Boulder', 'Dot'],
  cat: ['Sparky', 'Volt', 'Fuzz', 'Static', 'Amp', 'Mittens', 'Ohm'],
  fern: ['Basil', 'Fernando', 'Sprout', 'Leafy', 'Ivy', 'Herb'],
  moth: ['Duchess', 'Lumen', 'Flutter', 'Biscuit', 'Wick', 'Pollo'],
};
export const OWNER_NAMES = ['Ms. Ortega', 'Mr. Banks', 'Dana Hu', 'Mr. Petrov', 'Ms. Akande', 'Jules', 'Mrs. Lindqvist', 'Mr. Oyelaran', 'Priya', 'Mr. Castillo', 'Ms. Brandt', 'Old Tom', 'Ms. Kowalski', 'Sam'];

// What owners say. A few owners guess wrong, which is half the job.
export const COMPLAINTS = {
  swallowed: ['It ate something. My keys are missing, and so is a sock.', 'It has a lump in it that wasn\'t there yesterday.', 'It went quiet after eating my spoon. I mean, after I lost my spoon.'],
  reflux: ['It\'s been eating everything, and the table has burn marks now.', 'It keeps hiccuping, and every hiccup sizzles.'],
  split: ['Little bits keep breaking off when the doorbell rings.', 'Every time I run the vacuum, there are two of it.'],
  cold: ['It\'s supposed to hatch soon. It won\'t.'],
  cracked: ['I dropped it. Only a little bit. It looks fine?', 'The dog knocked it off the shelf.'],
  rock: ['It\'s an egg. I know it\'s an egg. It\'s been an egg for nine years.'],
  overcharge: ['Every time I touch it I get shocked, and the TV keeps turning on by itself.', 'It made the toaster go off. From across the room.'],
  hairball: ['It\'s coughing, and something rattles when it walks.', 'It keeps making this hacking noise.'],
  grounded: ['It used to light up the room. Now it just lies there.', 'No sparks for a week. It won\'t even chase the vacuum.'],
  rot: ['I water it every hour and it\'s still droopy!', 'It\'s gone floppy. I\'ve been watering it extra to help.'],
  mites: ['It keeps scratching its leaves at night.', 'It\'s twitchy and itchy and won\'t sit still.'],
  pale: ['It\'s gone all yellow.', 'It looks washed out. Is that a phase?'],
  wingmites: ['It won\'t stop grooming its wings.', 'Scratching, scratching, all night long.'],
  dustlung: ['It\'s wheezing, and there\'s dust everywhere.', 'It sneezed and the whole kitchen went grey.'],
  lampstruck: ['It stares at lamps for hours. It walked into the fridge light.', 'It won\'t eat. It just watches the porch light.'],
};

// The demo week. `fixed` patients are story patients; `random` fills the rest from `pool`.
export const WEEK = [
  {
    name: 'Monday', short: 'MON',
    mail: [
      { from: 'Dr. Okafor', subject: 'The clinic is yours', body: 'If you are reading this, I have left, and the clinic is yours. Look after the patients and the patients will look after you.\n\nThe handbook on the desk has every species I have treated. Check the signs against it before you guess. Tests cost money, so use them when you need them, not by habit.\n\nOne more thing. Keep the basement door shut. Whatever you hear.\n\n- Dr. A. Okafor' },
      { from: 'Mr. Grubb (landlord)', subject: 'Rent', body: 'Rent is $300, due Friday evening, same as always. Dr. Okafor was always on time. I expect the same.\n\n- H. Grubb' },
    ],
    fixed: [
      { id: 'bubbles', arrive: 545, sp: 'gloop', ail: 'swallowed', pet: 'Bubbles', owner: 'Mrs. Pelling', say: 'Bubbles ate one of my socks. Or she might just be bloated? She does love a sock.', obj: 'sock', tutorial: true },
      { id: 'basil1', arrive: 640, sp: 'fern', ail: 'rot', pet: 'Basil', owner: 'Mrs. Fenwick', say: 'I water Basil every hour and he\'s still droopy! Maybe he needs more?' },
    ],
    random: 1, pool: ['hairball', 'reflux', 'mites'],
  },
  {
    name: 'Tuesday', short: 'TUE',
    mail: [
      { from: 'Dr. Okafor\'s notebook', subject: 'A page that fell out', body: 'Pebblets: an egg that is too cold will not hatch. Check for frost. Three warm nights in the incubator usually does it, if someone feeds the lamp.\n\nAlso: some people bring in rocks. Be kind about it.' },
    ],
    fixed: [
      { id: 'pebs', arrive: 610, sp: 'pebble', ail: 'cold', pet: 'Pebs', owner: 'Tobi (age 9)', say: 'Pebs is supposed to hatch this week. He\'s not doing anything. I have four dollars.', cantPay: true },
    ],
    random: 3, pool: ['reflux', 'mites', 'overcharge', 'swallowed', 'pale'],
  },
  {
    name: 'Wednesday', short: 'WED',
    mail: [
      { from: 'PetCorp Wellness', subject: 'GRAND OPENING across the street!', body: 'PetCorp Wellness is proud to open its newest location, directly across the street from you!\n\nFree checkups all week. Shiny floors. Thirty-minute guaranteed diagnosis.*\n\n*Diagnosis not guaranteed to be correct.' },
    ],
    fixed: [
      { id: 'gerald', arrive: 570, sp: 'pebble', ail: 'rock', pet: 'Gerald', owner: 'Mr. Dunmore', say: 'Gerald is an egg. I know he\'s an egg. He\'s been an egg for nine years. He just needs encouragement.' },
    ],
    random: 3, pool: ['split', 'grounded', 'dustlung', 'cracked', 'hairball'], petcorp: true,
  },
  {
    name: 'Thursday', short: 'THU',
    mail: [
      { from: 'Mrs. Pelling', subject: 'A postcard', body: 'Bubbles is back to her old self and has not eaten a single sock since Monday. She did eat a glove. We are working on it.\n\nThank you!', needs: 'bubblesCured' },
      { from: 'Dr. Okafor\'s notebook', subject: 'Another loose page', body: 'Mothhounds: they love a lamp. If one cannot stop staring at yours, that might be the whole problem.\n\nIf a Mothhound comes in with a tag on its collar, read it.' },
    ],
    fixed: [
      { id: 'basil2', arrive: 555, sp: 'fern', ail: 'rot', pet: 'Basil', owner: 'Mrs. Fenwick', say: 'He\'s droopy again! I cut back to watering him every forty-five minutes, like you said. Well, like I thought you said.' },
      { id: 'duchess', arrive: 640, sp: 'moth', ail: 'wingmites', pet: 'Duchess', owner: 'Mr. Vance', say: 'She keeps scratching. I don\'t have long. Cash is fine, yes? No paperwork.', vance: true },
      { id: 'volt', arrive: 760, sp: 'cat', ail: 'grounded', pet: 'Volt', owner: 'Ms. Reyes', say: 'PetCorp said he was overcharged and drained all the static out of him. Now he won\'t get up. They charged me ninety dollars.', petcorp: true },
    ],
    random: 2, pool: ['pale', 'swallowed', 'lampstruck', 'overcharge'],
  },
  {
    name: 'Friday', short: 'FRI',
    mail: [
      { from: 'Mr. Grubb (landlord)', subject: 'Tonight', body: 'Rent. Tonight. $300. I will be by after close.\n\n- H. Grubb' },
    ],
    fixed: [],
    random: 4, pool: ['hairball', 'lampstruck', 'cracked', 'reflux', 'grounded', 'mites', 'dustlung'],
  },
];
export const RENT = 300;
export const OPEN = 9 * 60, CLOSE = 17 * 60;
