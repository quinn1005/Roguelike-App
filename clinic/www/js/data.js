// Everything the clinic knows: species, their normal readings, illnesses, treatments,
// medicines, supplies, equipment, staff and brewing.

/* ------------------------------------------------------------------ species
   `normal` holds the healthy range of every reading the species can give.
   `zones` are the places you can put the stethoscope; `quiet` is the normal sound there.
   `free` and `paid` are the species' own tests (on top of the shared ones). */
export const SPECIES = {
  gloop: {
    name: 'Gloop', blurb: 'A friendly house slime. Eats almost anything, which is most of the problem. Splits in two when badly scared.',
    normal: { temp: [18, 24], hr: [40, 60], wt: [2, 4], density: [1.0, 1.2], cortisol: [10, 40], ph: [5.5, 7.0], jiggle: [1.0, 1.4] },
    zones: { chest: 'beat', belly: 'gurgle' },
    free: ['jiggle', 'backlight'], paid: ['ph'],
    quirk: { sign: 'shine', p: 0.35 },
  },
  pebble: {
    name: 'Pebblet', blurb: 'Looks like a stone, is (usually) an egg. Needs steady warmth to hatch. Owners often cannot tell which they have.',
    normal: { temp: [20, 26], hr: [60, 90], wt: [300, 450], calcium: [30, 50], moisture: [10, 20], pitch: [300, 420] },
    zones: { shell: 'beat' },
    free: ['tap', 'candle'], paid: [],
    quirk: { sign: 'spots', p: 0.3 },
  },
  cat: {
    name: 'Static Cat', blurb: 'A cat that stores electricity in its fur. A healthy one crackles a little when stroked. Too much charge, or none, means trouble.',
    normal: { temp: [25, 29], hr: [140, 200], wt: [3, 6], charge: [20, 60], wbc: [5, 12], volts: [5, 15], sparks: [2, 5] },
    zones: { chest: 'beat', belly: 'gurgle' },
    free: ['stroke', 'volt'], paid: [],
    quirk: { sign: 'sparks', p: 0.25 },
  },
  fern: {
    name: 'Fernling', blurb: 'A walking houseplant with a face on its bulb. Hardy, cheerful, and almost always overwatered.',
    normal: { temp: [18, 24], hr: [10, 20], wt: [1, 3], iron: [40, 80], nitrogen: [30, 60], spores: [0, 2], soil: [30, 50] },
    zones: { stem: 'sap', pot: 'quiet' },
    free: ['flip', 'probe'], paid: ['unpot'],
    quirk: { sign: 'droop', p: 0.4, after: 13 * 60 },
  },
  moth: {
    name: 'Mothhound', blurb: 'A dog-sized moth with a loyal streak. Loves lamps far too much. Sheds wing dust everywhere.',
    normal: { temp: [36, 39], hr: [80, 120], wt: [8, 14], wbc: [4, 10], dustc: [0, 2], breath: [20, 30], eggs: [0, 2] },
    zones: { chest: 'beat', belly: 'gurgle' },
    free: ['breath'], paid: ['slide'],
    quirk: { sign: 'dust', p: 0.3 },
  },
};

// How each reading is labelled and its unit.
export const READ = {
  temp: { name: 'Temperature', unit: '°C', d: 0 }, hr: { name: 'Heart rate', unit: ' bpm', d: 0 }, wt: { name: 'Weight', unit: ' kg', d: 1 },
  density: { name: 'Density', unit: ' g/ml', d: 2 }, cortisol: { name: 'Stress hormone', unit: '', d: 0 }, ph: { name: 'pH', unit: '', d: 1 },
  jiggle: { name: 'Wobble time', unit: ' s', d: 1 }, calcium: { name: 'Calcium', unit: '', d: 0 }, moisture: { name: 'Moisture', unit: '%', d: 0 },
  pitch: { name: 'Knock pitch', unit: ' Hz', d: 0 }, charge: { name: 'Blood charge', unit: '', d: 0 }, wbc: { name: 'White cells', unit: '', d: 0 },
  volts: { name: 'Fur voltage', unit: ' V', d: 0 }, sparks: { name: 'Sparks per stroke', unit: '', d: 0 }, iron: { name: 'Iron', unit: '', d: 0 },
  nitrogen: { name: 'Nitrogen', unit: '', d: 0 }, spores: { name: 'Fungal spores', unit: '', d: 0 }, soil: { name: 'Soil moisture', unit: '%', d: 0 },
  dustc: { name: 'Dust in airways', unit: '', d: 0 }, breath: { name: 'Breathing', unit: '/min', d: 0 }, eggs: { name: 'Mite eggs', unit: '', d: 0 },
};
// Which readings each sample returns.
export const SAMPLE_KEYS = { gloop: ['density', 'cortisol'], pebble: ['calcium', 'moisture'], cat: ['charge', 'wbc'], fern: ['iron', 'nitrogen', 'spores'], moth: ['wbc', 'dustc'] };

export const SOUNDS = {
  beat: 'a steady heartbeat', gurgle: 'soft, normal gurgling', sap: 'a slow, even sap pulse', quiet: 'nothing much',
  fizz: 'fizzing and sizzling', thud: 'a dull thud when it moves', flutter: 'a fast, fluttery beat', silent: 'complete silence',
  rattle: 'a dry rattle', wheeze: 'a wheeze on every breath', crackle: 'crackling like a radio', squelch: 'wet squelching',
  click: 'tiny clicking', whistle: 'a thin whistle', racing: 'a racing heartbeat', faint: 'a faint, slow heartbeat', creak: 'creaking and popping',
};

/* ------------------------------------------------------------------ signs you can see
   Positions are offsets from the patient's feet on the exam table. */
export const SIGNS = {
  gloop: {
    lump: { x: 6, y: -12, text: 'A dark lump inside' }, bubbles: { x: -9, y: -24, text: 'Bubbles rising to the surface' },
    bud: { x: 22, y: -5, text: 'A piece budding off its side' }, cloudy: { x: -4, y: -18, text: 'Cloudy, milky patches inside' },
    discolor: { x: -14, y: -10, text: 'Dull, crusty patches on the skin' }, sag: { x: 0, y: -10, text: 'Flat and saggy', always: true },
    drip: { x: 18, y: -1, text: 'Leaking a puddle onto the table' }, shine: { x: -8, y: -26, text: 'A wet, glossy shine' },
  },
  pebble: {
    frost: { text: 'Frost on the top of the shell' }, crack: { text: 'A hairline crack on one side' }, moss: { text: 'Moss near the bottom' },
    spots: { text: 'Dark speckles on the shell' }, glow: { text: 'A faint warm glow from inside' }, chip: { text: 'A small chip in the shell' },
  },
  cat: {
    sparks: { x: 0, y: -49, text: 'Sparks between the ears', always: true }, fluff: { x: 0, y: -25, text: 'Fluff stuck to the chin' },
    dull: { x: -2, y: -16, text: 'Fur lying flat, no shine' }, bald: { x: 9, y: -12, text: 'A singed, bald patch' },
    puffed: { x: 0, y: -14, text: 'Fur standing on end', always: true }, drool: { x: 2, y: -26, text: 'Drooling' },
  },
  fern: {
    soggy: { x: 0, y: -4, text: 'Water seeping out of the pot' }, mites: { x: -10, y: -31, text: 'Tiny mites on the leaves' },
    pale: { x: 10, y: -36, text: 'Leaves going yellow at the edges' }, spots: { x: -8, y: -44, text: 'Brown spots on the leaves' },
    droop: { x: 0, y: -40, text: 'Drooping leaves', always: true }, mold: { x: 0, y: -16, text: 'White fuzz on the soil' },
  },
  moth: {
    mites: { x: -16, y: -32, text: 'Mites crawling on the wings' }, dust: { x: 0, y: -26, text: 'Dust puffing from the nose' },
    glazed: { x: 0, y: -30, text: 'Eyes glazed, following the lamp', always: true }, torn: { x: 18, y: -28, text: 'A tear in the right wing' },
    wingdroop: { x: -15, y: -26, text: 'Wings hanging low', always: true }, bald: { x: 14, y: -36, text: 'Bare, dustless patches on the wings' },
  },
};

/* ------------------------------------------------------------------ treatments */
export const TREATS = {
  extract: { name: 'Remove it with tongs', how: 'Drag it out without touching the sides.' },
  surgery: { name: 'Surgery', how: 'A tighter path. Drag it out slowly and carefully.', uses: 'sutures' },
  pill: { name: 'Give medicine', how: 'Pick the dose, then tap to throw the pill when the mouth opens.', uses: 'pills', dose: true },
  calm: { name: 'Calm and play', how: 'Tap when each ring reaches the heart.' },
  stitch: { name: 'Patch it', how: 'Trace along the line from the green dot.', uses: 'patches' },
  trim: { name: 'Trim the damage', how: 'Trace along the line to cut away the damaged part.' },
  peel: { name: 'Help it hatch', how: 'Trace around the shell to peel it open, gently.' },
  zap: { name: 'Pick them off', how: 'Tap each one before it moves on.' },
  hotspot: { name: 'Drain the hot spot', how: 'Tap the sparks as they burst out of one spot.' },
  dry: { name: 'Dry the roots', how: 'Rub the wet roots until they are dry.' },
  wet: { name: 'Soak and rehydrate', how: 'Rub to work the water in until it is all soaked.' },
  brush: { name: 'Brush off the old scales', how: 'Rub away the old, stuck scales.' },
  admit: { name: 'Admit overnight', how: 'Keep it in the kennels. Care for it each evening.' },
  tell: { name: 'Break the news', how: 'Choose your words.' },
};

// Medicines for pill treatments. Dose = weight × mg per kg.
export const MEDS = {
  antacid: { name: 'Antacid', mgkg: 50 }, shrink: { name: 'Gel-B shrinking gel', mgkg: 30 }, calcium: { name: 'Shell calcium', mgkg: 400, perG: true },
  lube: { name: 'Hairball lube', mgkg: 40 }, antiviral: { name: 'Static flu tablets', mgkg: 25 }, plantfood: { name: 'Plant food', mgkg: 100 },
  fungicide: { name: 'Fungicide', mgkg: 80 }, clearing: { name: 'Airway clearing pills', mgkg: 20 },
};

/* ------------------------------------------------------------------ illnesses
   signs: [kind, chance it shows]. read: readings that differ from normal, either one range
   or {m: mild range, s: severe range}. sev: which reading tells mild from severe.
   treat: {m, s} or one treatment. torn: the handbook page starts torn out. */
const A = (o) => o;
export const AILMENTS = {
  // ---- Gloop
  swallowed: A({ sp: 'gloop', name: 'Swallowed object', contagious: false,
    signs: [['lump', 0.85], ['drip', 0.2]], listen: { belly: 'thud' },
    read: { density: { m: [1.25, 1.4], s: [1.45, 1.7] }, jiggle: [0.8, 1.0] }, mood: 'Grumpy',
    xray: 'object', backlight: 'object', sev: 'density', treat: { m: 'extract', s: 'surgery' }, fee: 40,
    book: 'A dark lump under the lamp, a thud in the belly, and a sharp-edged shadow on backlight or X-ray. Dense. Density over 1.4 means something big or sharp: surgery.',
    cure: 'Out it comes, a little slimy. The Gloop wobbles with relief.' }),
  reflux: A({ sp: 'gloop', name: 'Acid reflux',
    signs: [['bubbles', 0.8], ['discolor', 0.3], ['drip', 0.3]], listen: { belly: 'fizz' },
    read: { temp: [26, 29], ph: { m: [2.6, 3.6], s: [1.2, 2.2] } }, mood: 'Uncomfortable',
    xray: 'bubbles', backlight: 'bubbles', sev: 'ph', treat: { m: 'pill', s: 'wet' }, med: 'antacid', fee: 35,
    book: 'Bubbles, fizzing in the belly, runs hot, and a very acidic pH strip. Above pH 2.4, an antacid. Below that, flush it out by soaking.',
    cure: 'The fizzing stops. A long, polite burp.' }),
  split: A({ sp: 'gloop', name: 'Splitting anxiety',
    signs: [['bud', 0.9], ['sag', 0.25]], listen: { chest: 'flutter' },
    read: { hr: [85, 120], cortisol: { m: [60, 90], s: [95, 140] }, jiggle: [0.5, 0.8] }, mood: 'Anxious',
    xray: 'plain', backlight: 'split', sev: 'cortisol', treat: 'calm', fee: 30,
    book: 'A bud forming, a fluttery fast heart, a quick jittery wobble, very high stress hormone. Calm it down. Stress over 90 is severe.',
    cure: 'The bud melts back in. A happy puddle.' }),
  growth: A({ sp: 'gloop', name: 'Gel growth', torn: true,
    signs: [['lump', 0.6], ['cloudy', 0.5], ['discolor', 0.35]], listen: {},
    read: { density: { m: [1.22, 1.32], s: [1.33, 1.42] } }, mood: 'Tired',
    xray: 'mass', backlight: 'mass', sev: 'density', treat: { m: 'pill', s: 'surgery' }, med: 'shrink', fee: 50,
    book: 'Looks like a swallowed object, but the shadow is round and soft-edged, the belly sounds normal, and the wobble is normal. Small growths (density up to 1.32) shrink with Gel-B; bigger ones need surgery.',
    cure: 'The growth is gone. Clear as glass inside.' }),
  dried: A({ sp: 'gloop', name: 'Dried out',
    signs: [['sag', 0.8], ['discolor', 0.55], ['cloudy', 0.3]], listen: { belly: 'quiet' },
    read: { temp: [24.5, 27], density: { m: [1.25, 1.38], s: [1.4, 1.6] }, jiggle: [1.7, 2.4] }, mood: 'Thirsty',
    xray: 'plain', backlight: 'plain', sev: 'density', treat: 'wet', fee: 30,
    book: 'Saggy and crusty, quiet belly, slow sluggish wobble, dense. Not a lump: nothing on backlight. Soak it.',
    cure: 'It plumps back up, shiny and bouncy.' }),
  // ---- Pebblet
  cold: A({ sp: 'pebble', name: 'Too cold to hatch',
    signs: [['frost', 0.8]], listen: { shell: 'faint' },
    read: { temp: { m: [14, 17], s: [9, 13] }, hr: [25, 50] }, mood: 'Sleepy',
    xray: 'embryo', candle: 'still', sev: 'temp', treat: 'admit', fee: 30,
    book: 'Frost, cold, a faint slow heartbeat, a still baby when candled. Admit it to the incubator. Below 14°C it needs every night it can get.',
    cure: 'Tucked into the incubator under a warm lamp.' }),
  cracked: A({ sp: 'pebble', name: 'Cracked shell',
    signs: [['crack', 0.9], ['chip', 0.3]], listen: { shell: 'whistle' },
    read: { pitch: [480, 600], moisture: { m: [6, 9], s: [2, 5] } }, mood: 'Startled',
    xray: 'embryo', candle: 'crack', sev: 'moisture', treat: 'stitch', fee: 45,
    book: 'A crack (turn it to find it), a whistle, a buzzy high knock, light leaking through when candled. Patch it. Moisture under 6% means a long crack.',
    cure: 'Patched up. You can barely see where the crack was.' }),
  rock: A({ sp: 'pebble', name: 'Just a rock',
    signs: [['moss', 0.5], ['spots', 0.3]], listen: { shell: 'silent' },
    read: { temp: [18, 20], hr: [0, 0], wt: [780, 1100], pitch: [880, 1100], calcium: [0, 4], moisture: [0, 2] }, mood: 'No reading',
    xray: 'solid', candle: 'solid', treat: 'tell', fee: 15,
    book: 'No heartbeat, very heavy, a high clink when knocked, solid black when candled. It is a rock. Someone has to tell the owner.',
    cure: 'It is a very nice rock.' }),
  softshell: A({ sp: 'pebble', name: 'Soft shell',
    signs: [['spots', 0.6], ['chip', 0.35]], listen: { shell: 'beat' },
    read: { calcium: { m: [16, 25], s: [5, 15] }, pitch: [180, 260], wt: [260, 320] }, mood: 'Restless',
    xray: 'embryo', candle: 'thin', sev: 'calcium', treat: { m: 'pill', s: 'admit' }, med: 'calcium', fee: 35,
    book: 'Pale spots, a low thud when knocked, blotchy light when candled, low calcium. Calcium pills; under 16, admit it.',
    cure: 'The shell firms up. A good, solid knock.' }),
  stuck: A({ sp: 'pebble', name: 'Stuck hatchling', torn: true,
    signs: [['glow', 0.6], ['chip', 0.5]], listen: { shell: 'racing' },
    read: { hr: [120, 160], temp: [26.5, 28.5] }, mood: 'Impatient',
    xray: 'big', candle: 'big', treat: 'peel', fee: 55,
    book: 'Ready to hatch but stuck: a glow, a pip hole, a racing heartbeat, a big wriggling shape when candled. Help it out by peeling the shell.',
    cure: 'A tiny, damp hatchling blinks up at you.' }),
  // ---- Static Cat
  overcharge: A({ sp: 'cat', name: 'Overcharged',
    signs: [['sparks', 0.9], ['puffed', 0.6]], listen: { chest: 'racing' },
    read: { temp: [30, 32], hr: [210, 260], volts: { m: [35, 55], s: [60, 90] }, sparks: [12, 25], charge: [90, 140] }, mood: 'Wired',
    xray: 'static', sev: 'volts', treat: 'zap', fee: 45,
    book: 'Sparks, fur on end, racing heart, high voltage everywhere on the fur. Catch the sparks to ground it. Over 60 V is severe.',
    cure: 'The last spark pops. A long, staticky purr.' }),
  hairball: A({ sp: 'cat', name: 'Static hairball',
    signs: [['fluff', 0.7], ['drool', 0.35]], listen: { belly: 'rattle' },
    read: {}, mood: 'Annoyed',
    xray: 'hairball', xsize: true, treat: { m: 'pill', s: 'extract' }, med: 'lube', fee: 35,
    book: 'Fluff on the chin, a rattle in the belly, a fur ball on the X-ray. A small ball passes with lube pills; a large one has to come out with tongs.',
    cure: 'One heroic cough, one very large hairball.' }),
  grounded: A({ sp: 'cat', name: 'Grounded and gloomy',
    signs: [['dull', 0.8]], listen: { chest: 'faint' },
    read: { hr: [110, 138], volts: { m: [2, 4], s: [0, 1] }, sparks: [0, 0], charge: [0, 10] }, mood: 'Depressed',
    xray: 'skeleton', sev: 'volts', treat: 'calm', fee: 30,
    book: 'Flat fur, a slow heart, no sparks at all when stroked, almost no voltage. It needs play, not draining.',
    cure: 'A feather toy and some attention. The fur crackles again.' }),
  staticflu: A({ sp: 'cat', name: 'Static flu', contagious: true,
    signs: [['drool', 0.5], ['dull', 0.35], ['sparks', 0.35]], listen: { chest: 'crackle' },
    read: { temp: { m: [30, 31.5], s: [32, 34] }, wbc: [18, 30], volts: [0, 70] }, voltsMixed: true, mood: 'Miserable',
    xray: 'skeleton', sev: 'temp', treat: { m: 'pill', s: 'admit' }, med: 'antiviral', fee: 40,
    book: 'Contagious. Drooling, crackly chest, a fever, high white cells, voltage all over the place (some spots hot, some dead). Flu tablets; with a fever over 32, admit it and keep it away from others.',
    cure: 'The fever breaks. A small, healthy crackle.' }),
  shorted: A({ sp: 'cat', name: 'Short circuit', torn: true,
    signs: [['bald', 0.6], ['sparks', 0.3]], listen: { chest: 'beat' },
    read: { volts: [5, 12] }, hotspot: true, mood: 'Twitchy',
    xray: 'skeleton', treat: 'hotspot', fee: 45,
    book: 'Charge pooled in one spot: one place on the fur reads very high while the rest is normal, often with a singed patch. Drain the hot spot.',
    cure: 'The twitching stops. The charge spreads out evenly again.' }),
  // ---- Fernling
  rot: A({ sp: 'fern', name: 'Root rot',
    signs: [['soggy', 0.8], ['mold', 0.3], ['droop', 0.5]], listen: { pot: 'squelch' },
    read: { soil: { m: [65, 80], s: [82, 98] } }, soilDeep: true, mood: 'Soggy',
    roots: 'rot', xray: 'rootsRot', sev: 'soil', treat: { m: 'dry', s: 'trim' }, fee: 35,
    book: 'Seeping pot, squelching, soggy at the roots (the top soil can feel fine), dark mushy roots. Dry them; if the root reading is over 80%, trim the rot.',
    cure: 'Dry roots, fresh soil. The leaves perk up.' }),
  mites: A({ sp: 'fern', name: 'Leaf mites', contagious: true,
    signs: [['mites', 0.25], ['spots', 0.3]], hiddenUnder: 'mites', listen: { stem: 'click' },
    read: {}, mood: 'Itchy', roots: 'healthy', xray: 'roots', treat: 'zap', fee: 35,
    book: 'Contagious. Mites hide on the undersides of the leaves (flip them), tiny clicking. Pick them off.',
    cure: 'Every last mite flicked away.' }),
  pale: A({ sp: 'fern', name: 'Nutrient-starved',
    signs: [['pale', 0.9], ['droop', 0.3]], listen: { stem: 'sap' },
    read: { iron: [10, 30], nitrogen: [8, 25] }, mood: 'Tired', roots: 'healthy', xray: 'roots', treat: 'pill', med: 'plantfood', fee: 30,
    book: 'Yellow leaf edges, low iron and nitrogen. The soil is normal. Plant food.',
    cure: 'The green creeps back already.' }),
  scorch: A({ sp: 'fern', name: 'Scorched',
    signs: [['spots', 0.7], ['pale', 0.4], ['droop', 0.45]], listen: { stem: 'creak' },
    read: { temp: [25.5, 28], soil: { m: [12, 22], s: [2, 11] } }, mood: 'Wilted', roots: 'dry', xray: 'roots',
    sev: 'soil', treat: { m: 'wet', s: 'trim' }, fee: 35,
    book: 'Brown spots and yellowing like a starved Fernling, but the soil is bone dry, it runs warm, and iron is normal. Mist it; under 12% soil moisture, trim the burned leaves.',
    cure: 'Out of the sun and misted. It sighs.' }),
  blight: A({ sp: 'fern', name: 'Fungal blight', contagious: true, torn: true,
    signs: [['mold', 0.7], ['spots', 0.55], ['soggy', 0.2]], listen: { pot: 'quiet' },
    read: { spores: { m: [6, 14], s: [15, 40] } }, mood: 'Ill', roots: 'threads', xray: 'roots',
    sev: 'spores', treat: { m: 'pill', s: 'admit' }, med: 'fungicide', fee: 45,
    book: 'Contagious. White fuzz, black spots, white threads on the roots, spores in the sample. Fungicide; over 15 spores, admit it in isolation.',
    cure: 'The fuzz is gone. Clean leaves.' }),
  // ---- Mothhound
  wingmites: A({ sp: 'moth', name: 'Wing mites', contagious: true,
    signs: [['mites', 0.8], ['bald', 0.4]], listen: {},
    read: { eggs: { m: [6, 14], s: [15, 30] } }, mood: 'Itchy', xray: 'skeleton', sev: 'eggs', treat: 'zap', fee: 45,
    book: 'Contagious. Mites on the wings (look closely), bare patches, mite eggs on the slide.',
    cure: 'Mite-free. A proud little flutter.' }),
  dustlung: A({ sp: 'moth', name: 'Dust lung',
    signs: [['dust', 0.8]], listen: { chest: 'wheeze' },
    read: { temp: [39.5, 41], breath: { m: [34, 42], s: [44, 60] }, dustc: [8, 20] }, mood: 'Tired',
    xray: 'cloudy', sev: 'breath', treat: { m: 'pill', s: 'admit' }, med: 'clearing', fee: 45,
    book: 'Dust puffing from the nose (some is normal), a wheeze, fast breathing, a fever, cloudy lungs. Clearing pills; over 43 breaths a minute, admit it.',
    cure: 'A mighty sneeze. Breathing clear again.' }),
  lampstruck: A({ sp: 'moth', name: 'Lamp-struck',
    signs: [['glazed', 0.95]], listen: { chest: 'racing' }, lampOnly: true,
    read: { hr: [125, 150] }, mood: 'Mesmerized', xray: 'skeleton', treat: 'calm', fee: 30,
    book: 'Glazed eyes that follow the lamp (only with the lights up; dim them and it looks fine), a racing heart. Calm it and turn the lights down at home.',
    cure: 'It finally looks away from the lamp and wags at you.' }),
  torn: A({ sp: 'moth', name: 'Torn wing',
    signs: [['torn', 0.9], ['wingdroop', 0.4]], listen: {},
    read: {}, mood: 'Sore', xray: 'skeleton', treat: 'stitch', fee: 40,
    book: 'A tear in a wing. Patch it.',
    cure: 'Patched. It tests the wing with a careful flap.' }),
  molt: A({ sp: 'moth', name: 'Stuck molt', torn: true,
    signs: [['bald', 0.5], ['dust', 0.45], ['wingdroop', 0.45]], listen: { belly: 'quiet' },
    read: { wt: [6, 7.9] }, mood: 'Uncomfortable', xray: 'skeleton', slideScales: true, treat: 'brush', fee: 40,
    book: 'Old scales stuck on: bare patches, dust, heavy-looking wings, underweight, and old dull scales on the slide but no mite eggs. Brush them off.',
    cure: 'The old scales come away. Bright new wings underneath.' }),
  // ---- After-hours cases with no handbook entry
  void: A({ sp: 'gloop', name: 'Light-drinker', cursed: true,
    signs: [['void', 1]], listen: { belly: 'silent', chest: 'silent' },
    read: { temp: [-4, -1], ph: [12.5, 13.5], density: [0.3, 0.5] }, mood: 'Hungry (for light)', xray: 'void', backlight: 'void', treat: 'calm', needsDark: true, fee: 80,
    book: null, cure: 'In the dark, it calms. The purple fades from its veins.' }),
  shadow: A({ sp: 'cat', name: 'Loose shadow', cursed: true,
    signs: [['shadow', 1]], listen: { chest: 'beat' },
    read: { volts: [-40, -20], charge: [-80, -40] }, mood: 'Unsettled', xray: 'skeleton', treat: 'stitch', fee: 80,
    book: null, cure: 'The last stitch, and its shadow settles back where it belongs.' }),
};
export const CURSED_SIGNS = { void: { x: 0, y: -16, text: 'Purple veins that drink the lamplight', always: true }, shadow: { x: 30, y: -30, text: 'Its shadow on the wall moves on its own', always: true } };

/* ------------------------------------------------------------------ tests
   min: minutes, stress: how much it upsets the patient, uses: a supply, cost: money. */
export const TESTS = {
  listen: { name: 'Listen', min: 2, stress: 3, free: true },
  temp: { name: 'Thermometer', min: 3, stress: 10 },
  weigh: { name: 'Scale', min: 2, stress: 4 },
  xray: { name: 'X-ray', min: 10, stress: 12, uses: 'film' },
  sample: { name: 'Sample', min: 8, stress: 18, uses: 'kits' },
  mood: { name: 'Mood scan', min: 5, stress: 2, cost: 5 },
  // species tests
  jiggle: { name: 'Jiggle', min: 2, stress: 6, free: true, sp: 'gloop' },
  backlight: { name: 'Backlight', min: 3, stress: 4, free: true, sp: 'gloop', mode: true },
  ph: { name: 'pH strip', min: 3, stress: 8, cost: 2, sp: 'gloop' },
  tap: { name: 'Knock', min: 1, stress: 5, free: true, sp: 'pebble' },
  candle: { name: 'Candle', min: 4, stress: 3, free: true, sp: 'pebble', mode: true },
  stroke: { name: 'Stroke', min: 2, stress: 4, free: true, sp: 'cat' },
  volt: { name: 'Voltmeter', min: 1, stress: 3, free: true, sp: 'cat', mode: true },
  flip: { name: 'Flip leaves', min: 1, stress: 4, free: true, sp: 'fern', mode: true },
  probe: { name: 'Soil probe', min: 3, stress: 4, free: true, sp: 'fern' },
  unpot: { name: 'Unpot roots', min: 8, stress: 30, sp: 'fern', mode: true },
  dim: { name: 'Lights', min: 0, stress: 0, free: true },
  breath: { name: 'Count breaths', min: 2, stress: 2, free: true, sp: 'moth' },
  slide: { name: 'Wing slide', min: 6, stress: 8, uses: 'kits', sp: 'moth' },
};

export const SUPPLIES = {
  pills: { name: 'Pills', pack: 3, price: 12, start: 3, note: 'Any pill treatment.' },
  patches: { name: 'Patches', pack: 2, price: 10, start: 2, note: 'Cracks and torn wings.' },
  sutures: { name: 'Surgery kits', pack: 1, price: 14, start: 1, note: 'One per surgery.' },
  film: { name: 'X-ray film', pack: 3, price: 12, start: 3, note: 'One per X-ray.' },
  kits: { name: 'Sample kits', pack: 3, price: 9, start: 3, note: 'Samples and wing slides.' },
  kibble: { name: 'Kennel care', pack: 3, price: 6, start: 2, note: 'Feed and warm one kennel guest for a night.' },
};

export const EQUIPMENT = {
  digital: { name: 'Digital X-ray', price: 90, note: 'X-rays no longer use film, and show more detail.' },
  stetho: { name: 'Electronic stethoscope', price: 40, note: 'Shows the heart rate as a number when you listen.' },
  incubator: { name: 'Better incubator', price: 45, note: 'Admitted eggs need one night less.' },
  isolation: { name: 'Isolation crate', price: 35, note: 'A fourth kennel spot, sealed off. Contagious guests in it never spread.' },
  heatlamp: { name: 'Soothing lamp', price: 30, note: 'Patients get 25% less stressed by tests.' },
};

export const STAFF = {
  dee: { name: 'Dee', role: 'Nurse', wage: 22, note: 'Takes temperature and weight before you walk in, and patients stress 30% less.', bio: 'Ex-PetCorp. Quit after they made her "upsell flea collars to a rock."' },
  marco: { name: 'Marco', role: 'Receptionist', wage: 15, note: 'Patients wait an hour longer before giving up, and he warns you when an owner is fibbing.', bio: 'Used to wait tables at the Last Stop Diner. "The food was... it was food. I don\'t want to talk about it."' },
};

/* ------------------------------------------------------------------ brewing */
export const INGREDIENTS = {
  mallow: { name: 'Mallow root', where: 'the park' }, glowcap: { name: 'Glowcap', where: 'the alley' },
  chalk: { name: 'Rosin chalk', where: 'the bowling alley' }, ember: { name: 'Ember salt', where: 'the diner kitchen' },
  slime: { name: 'Slime gel', where: 'Gloop patients' }, dust: { name: 'Wing dust', where: 'Mothhound patients' },
  clippings: { name: 'Fern clippings', where: 'Fernling patients' }, mint: { name: 'Wild mint', where: 'the park' },
};
export const RECIPES = [
  { id: 'tea', name: 'Calming tea', needs: ['mallow', 'mint'], method: 'steep', use: 'calm', note: 'Calm and play goes easier, and the patient\'s stress drops.' },
  { id: 'salve', name: 'Static salve', needs: ['chalk', 'mallow'], method: 'grind', use: 'zap', note: 'Sparks and mites stay put longer.' },
  { id: 'gel', name: 'Gel tonic', needs: ['slime', 'mint'], method: 'simmer', use: 'wet', note: 'Soaking takes half the work.' },
  { id: 'ward', name: 'Spore ward', needs: ['glowcap', 'ember'], method: 'simmer', use: 'pill', note: 'Works in place of a pill for any medicine.' },
  { id: 'smoke', name: 'Mite smoke', needs: ['clippings', 'ember'], method: 'grind', use: 'kennel', note: 'Burn it in the kennels: nothing spreads tonight.' },
  { id: 'chalkball', name: 'Dust tonic', needs: ['dust', 'mallow'], method: 'steep', use: 'stress', note: 'Give it at the start of an exam: stress starts at zero and rises slower.' },
];
export const METHODS = { steep: 'Steep (gentle heat)', grind: 'Grind (steady rhythm)', simmer: 'Simmer (high heat)' };
