// The demo week: who comes in, what the mail says, the town at night, Saturday's fair.

export const PET_NAMES = {
  gloop: ['Jellybean', 'Squish', 'Puddle', 'Wibble', 'Marmalade', 'Gloria', 'Blorb', 'Custard'],
  pebble: ['Rocky', 'Shelly', 'Nugget', 'Boulder', 'Dot', 'Pippin'],
  cat: ['Sparky', 'Fuzz', 'Static', 'Amp', 'Mittens', 'Ohm', 'Joule', 'Tesla'],
  fern: ['Fernando', 'Sprout', 'Leafy', 'Ivy', 'Herb', 'Frond'],
  moth: ['Lumen', 'Flutter', 'Biscuit', 'Wick', 'Pollo', 'Candle'],
};
export const OWNER_NAMES = ['Ms. Ortega', 'Mr. Banks', 'Dana Hu', 'Mr. Petrov', 'Ms. Akande', 'Jules', 'Mrs. Lindqvist', 'Mr. Oyelaran', 'Priya', 'Mr. Castillo', 'Ms. Brandt', 'Old Tom', 'Ms. Kowalski', 'Sam', 'Mr. Adeyemi', 'Rosa'];

// What owners say. `fib: true` lines point at the wrong thing, or leave out the real cause.
export const COMPLAINTS = {
  swallowed: [{ t: 'It ate something. My keys are missing, and so is a sock.' }, { t: 'There\'s a lump in it that wasn\'t there yesterday.' }, { t: 'It hasn\'t eaten anything weird. (The laundry basket looks suspiciously empty.)', fib: true }],
  reflux: [{ t: 'It\'s been eating everything, and the table has burn marks now.' }, { t: 'Every hiccup sizzles.' }, { t: 'It had leftovers from the Last Stop Diner last night. Honestly, I can\'t blame it for feeling sick.' }],
  split: [{ t: 'Little bits break off when the doorbell rings.' }, { t: 'Every time I run the vacuum, there are two of it.' }, { t: 'I think it ate something? There\'s a lump on its side.', fib: true }],
  growth: [{ t: 'It swallowed something. I\'m sure of it.', fib: true }, { t: 'It\'s gone cloudy and slow.' }],
  dried: [{ t: 'It\'s gone flat and crusty. We had the heating on all weekend.' }, { t: 'It ate a sock, I think. It\'s all lumpy and stiff.', fib: true }],
  cold: [{ t: 'It\'s supposed to hatch soon. It won\'t.' }],
  cracked: [{ t: 'I dropped it. Only a little bit. It looks fine?' }, { t: 'It\'s fine, I never drop it. It just started whistling.', fib: true }],
  rock: [{ t: 'It\'s an egg. I know it\'s an egg.' }],
  softshell: [{ t: 'The shell feels a bit squishy.' }, { t: 'I think it\'s cold? It\'s not doing much.', fib: true }],
  stuck: [{ t: 'It\'s been glowing and wriggling all night, but nothing\'s coming out.' }],
  overcharge: [{ t: 'Every time I touch it I get shocked, and the TV keeps turning on by itself.' }, { t: 'It made the toaster go off. From across the room.' }],
  hairball: [{ t: 'It\'s coughing, and something rattles when it walks.' }, { t: 'It keeps making this hacking noise.' }, { t: 'It\'s just tired, I think. Nothing\'s wrong really.', fib: true }],
  grounded: [{ t: 'It used to light up the room. Now it just lies there.' }, { t: 'No sparks for a week. It won\'t even chase the vacuum.' }],
  staticflu: [{ t: 'It\'s drooling and hot, and it keeps crackling at weird times.' }, { t: 'Half the cats on our street are sick.' }, { t: 'It\'s overcharged, I think. Too many sparks.', fib: true }],
  shorted: [{ t: 'Its tail keeps twitching and there\'s a burnt smell.' }, { t: 'It zaps me, but only when I touch one spot.' }],
  rot: [{ t: 'I water it every hour and it\'s still droopy!' }, { t: 'It\'s gone floppy. I\'ve been watering extra to help.' }, { t: 'I hardly ever water it. It\'s just sad.', fib: true }],
  mites: [{ t: 'It keeps scratching its leaves at night.' }, { t: 'It\'s twitchy and itchy and won\'t sit still.' }],
  pale: [{ t: 'It\'s gone all yellow.' }, { t: 'It looks washed out. Is that a phase?' }],
  scorch: [{ t: 'I put it in the sunny window so it\'d cheer up.' }, { t: 'It\'s gone yellow. Probably needs plant food?', fib: true }],
  blight: [{ t: 'There\'s fuzz growing on it.' }, { t: 'Black spots, and they\'re spreading to my other plants.' }],
  wingmites: [{ t: 'It won\'t stop grooming its wings.' }, { t: 'Scratching, scratching, all night long.' }],
  dustlung: [{ t: 'It\'s wheezing, and there\'s dust everywhere.' }, { t: 'It sneezed and the whole kitchen went grey.' }],
  lampstruck: [{ t: 'It stares at lamps for hours. It walked into the fridge light.' }, { t: 'It won\'t eat. It just watches the porch light.' }],
  torn: [{ t: 'It flew into the ceiling fan.' }, { t: 'It caught a wing on the fence.' }],
  molt: [{ t: 'It\'s shedding everywhere, but the old wings won\'t come off.' }, { t: 'It\'s got mites, I bet. It keeps rubbing its wings.', fib: true }],
};

// The week. `fixed` patients are story patients; `random` fills the rest from `pool`.
export const WEEK = [
  {
    name: 'Monday', short: 'MON', weather: 'clear',
    mail: [
      { id: 'okafor1', from: 'Dr. Okafor', subject: 'The clinic is yours', body: 'If you are reading this, I have left, and the clinic is yours. Look after the patients and the patients will look after you.\n\nThe handbook on the desk has most of what I know. A few pages are missing. I lent things out over the years and not all of them came back.\n\nSigns overlap. A lump is not always a sock. Check the numbers against the normal ranges before you guess, and watch how stressed your patient is getting. Every test costs them something.\n\nOne more thing. Keep the basement door shut. Whatever you hear.\n\n- Dr. A. Okafor' },
      { id: 'grubb1', from: 'Mr. Grubb (landlord)', subject: 'Rent', body: 'Rent is $300, due Friday evening, same as always. Dr. Okafor was always on time. I expect the same.\n\n- H. Grubb' },
    ],
    fixed: [
      { id: 'bubbles', arrive: 545, ail: 'swallowed', sev: 'm', pet: 'Bubbles', owner: 'Mrs. Pelling', say: 'Bubbles ate one of my socks. Or she might just be bloated? She does love a sock.', obj: 'sock', tutorial: true },
      { id: 'basil1', arrive: 640, ail: 'rot', sev: 'm', pet: 'Basil', owner: 'Mrs. Fenwick', say: 'I water Basil every hour and he\'s still droopy! Maybe he needs more?', regular: true },
      { id: 'holo', arrive: 760, ail: 'overcharge', sev: 'm', pet: 'Holo', owner: 'Mikey', say: 'He sparked right through my Grim Grocers holo. A mint one! Gemline won\'t even look at it now. Can you calm him down before he gets the rest of my binder?' },
    ],
    random: 1, pool: ['reflux', 'pale', 'hairball', 'torn'],
  },
  {
    name: 'Tuesday', short: 'TUE', weather: 'rain',
    mail: [
      { id: 'okafor2', from: 'Dr. Okafor\'s notebook', subject: 'A page that fell out', body: 'Pebblets: an egg that is too cold will not hatch. Check for frost and candle it. A few warm nights in the incubator usually does it, if someone feeds the lamp.\n\nAlso: some people bring in rocks. Weigh them. Be kind about it.' },
      { id: 'jobs', from: 'Two job applications', subject: 'Help wanted?', body: 'Dee (nurse): "I left PetCorp across the street. They wanted me to upsell flea collars to a rock. I take temperatures fast and patients like me."\n\nMarco (receptionist): "I used to wait tables at the Last Stop Diner. I can handle anybody. I\'ve seen people send their food back to the kitchen in tears."\n\nYou can hire either of them from the clinic screen in the evening.' },
    ],
    fixed: [
      { id: 'pebs', arrive: 610, ail: 'cold', sev: 's', pet: 'Pebs', owner: 'Tobi (age 9)', say: 'Pebs is supposed to hatch this week. He\'s not doing anything. I have four dollars. He likes it when I play Neon Bastion next to him. I\'m stuck on the Hive Mother.', cantPay: true },
    ],
    random: 3, pool: ['rot', 'mites', 'swallowed', 'growth', 'cracked', 'dried'],
  },
  {
    name: 'Wednesday', short: 'WED', weather: 'clear', outbreak: 'staticflu',
    mail: [
      { id: 'petcorp', from: 'PetCorp Wellness', subject: 'GRAND OPENING across the street!', body: 'PetCorp Wellness is proud to open its newest location, directly across the street from you!\n\nFree checkups all week. Shiny floors. Thirty-minute guaranteed diagnosis.*\n\n*Diagnosis not guaranteed to be correct.' },
      { id: 'flu', from: 'Town health board', subject: 'Static flu warning', body: 'Static flu is going around the east side. Infected cats run a fever, drool, and crackle unpredictably. It spreads between animals kept close together. Keep sick cats apart.' },
    ],
    fixed: [
      { id: 'gerald', arrive: 570, ail: 'rock', pet: 'Gerald', owner: 'Mr. Dunmore', say: 'Gerald is an egg. I know he\'s an egg. He\'s been an egg for nine years. He just needs encouragement.' },
    ],
    random: 4, pool: ['staticflu', 'staticflu', 'split', 'grounded', 'dustlung', 'softshell', 'hairball', 'scorch'],
  },
  {
    name: 'Thursday', short: 'THU', weather: 'fog', outbreak: 'staticflu',
    mail: [
      { id: 'pelling', from: 'Mrs. Pelling', subject: 'A postcard', body: 'Bubbles is back to her old self and has not eaten a single sock since Monday. She did eat a glove. We are working on it.\n\nThank you!', needs: 'bubblesCured' },
      { id: 'okafor3', from: 'Dr. Okafor\'s notebook', subject: 'Another loose page', body: 'Mothhounds love a lamp. If one cannot stop staring at yours, dim the lights and see if it is still sick.\n\nIf a Mothhound comes in with a tag on its collar, read it.\n\nAnd if anything comes in after dark that drinks the light, do not shine a lamp on it. Turn everything off and keep it calm.' },
    ],
    fixed: [
      { id: 'basil2', arrive: 555, ail: 'rot', sev: 's', pet: 'Basil', owner: 'Mrs. Fenwick', say: 'He\'s droopy again! I cut back to every forty-five minutes, like you said. Well, like I thought you said.', regular: true },
      { id: 'duchess', arrive: 640, ail: 'wingmites', sev: 'm', pet: 'Duchess', owner: 'Mr. Vance', say: 'She keeps scratching. I don\'t have long. Cash is fine, yes? No paperwork.', vance: true },
      { id: 'strike', arrive: 700, ail: 'swallowed', sev: 's', pet: 'Strike', owner: 'Darlene (League Secretary, Lucky Strike Lanes)', say: 'Our alley Gloop swallowed the ten pin. League night\'s in two hours and we\'re down to nine. I don\'t care how, just get it out.', obj: 'pin' },
      { id: 'volt', arrive: 780, ail: 'grounded', sev: 's', pet: 'Volt', owner: 'Ms. Reyes', say: 'PetCorp said he was overcharged and drained all the static out of him. Now he won\'t get up. They charged me ninety dollars.', petcorp: true },
    ],
    random: 2, pool: ['staticflu', 'blight', 'lampstruck', 'shorted', 'stuck'],
    afterHours: { ail: 'void', pet: 'Nobody\'s', owner: 'A woman in a long coat', say: 'It got into the lamps at home and now it won\'t stop... drinking them. Please. I didn\'t know where else to go.' },
  },
  {
    name: 'Friday', short: 'FRI', weather: 'heat',
    mail: [
      { id: 'grubb2', from: 'Mr. Grubb (landlord)', subject: 'Tonight', body: 'Rent. Tonight. $300. I will be by after close.\n\n- H. Grubb' },
      { id: 'okafor4', from: 'Dr. Okafor\'s notebook', subject: 'The last loose page', body: 'Shadows come loose sometimes, usually around midnight. Needle and thread, same as anything else. Trace it back on along the edge.' },
    ],
    fixed: [],
    random: 5, pool: ['scorch', 'reflux', 'molt', 'shorted', 'blight', 'softshell', 'stuck', 'dried', 'lampstruck'], emergencies: 1,
    afterHours: { ail: 'shadow', pet: 'Inky', owner: 'Mr. Ellison from upstairs', say: 'Sorry, I saw your light on. Inky\'s shadow got up and walked off on its own. It\'s on your wall right now. Look.' },
  },
  {
    name: 'Saturday', short: 'SAT', weather: 'clear', weekend: true,
    mail: [
      { id: 'fair', from: 'Town fair committee', subject: 'Saturday fair', body: 'The town fair is on today in the square: the pet show (judges wanted), the farmers market (stalls available) and, as always, people who\'d rather you came to them.\n\nYou\'ll have time for two of the three.' },
    ],
    fixed: [], random: 0, pool: [],
  },
];
export const RENT = 300;
export const OPEN = 9 * 60, CLOSE = 17 * 60;
export const WEATHER = { clear: { name: 'Clear', boost: [] }, rain: { name: 'Rain', boost: ['rot', 'blight', 'mites'] }, fog: { name: 'Fog', boost: ['lampstruck', 'dustlung'] }, heat: { name: 'Heat wave', boost: ['scorch', 'dried', 'reflux'] } };

/* ------------------------------------------------------------------ the town at night */
export const PLACES = [
  { id: 'park', name: 'Elm Park', x: -150, kind: 'park', blurb: 'A small park with a pond and a broken streetlight.' },
  { id: 'diner', name: 'Last Stop Diner', x: -80, kind: 'diner', blurb: 'The sign says NOW WITH MEME DISHES! Someone has written "why" underneath in marker.' },
  { id: 'cards', name: 'Lou\'s Cards', x: -10, kind: 'cards', blurb: 'A cramped card shop. A sign in the window: THURSDAY TRADE NIGHT AT THE DINER. BRING YOUR OWN SNACKS.' },
  { id: 'arcade', name: 'Pixel Palace', x: 60, kind: 'arcade', blurb: 'An arcade. The Neon Bastion cabinet by the window glows purple and teal.' },
  { id: 'lanes', name: 'Lucky Strike Lanes', x: 135, kind: 'lanes', blurb: 'A bowling alley with a pin-shaped sign. League night means a full parking lot.' },
  { id: 'petcorp', name: 'PetCorp Wellness', x: 205, kind: 'petcorp', blurb: 'Bright white and closed for the night. There\'s a light on around the back.' },
  { id: 'alley', name: 'The back alley', x: 270, kind: 'alley', blurb: 'Dumpsters, crates, and the occasional pair of eyes.' },
];

// Each visit picks the first event whose conditions are met. `gives` adds ingredients;
// `page` restores a torn handbook page; `stray` finds a stray; `clue` is PetCorp evidence.
export const TOWN_EVENTS = {
  park: [
    { day: 0, text: 'The pond is still. You find mallow root and wild mint growing along the edge.', gives: { mallow: 2, mint: 2 } },
    { day: 2, text: 'A kitten made of static is batting at fireflies under the broken streetlight. It follows you halfway home, crackling, and then all the way home.', stray: 'fizz', gives: { mint: 1 } },
    { text: 'You pick mallow root and mint in the dark.', gives: { mallow: 2, mint: 1 } },
    { text: 'Under a bench you find a soggy handbook page in Dr. Okafor\'s writing.', page: 'blight', once: true },
  ],
  diner: [
    { text: 'You get the meatloaf. It\'s alright, I guess. The cook is shouting down a hole in the kitchen floor at somebody. You take some ember salt from the counter: the only thing in the kitchen you trust.', gives: { ember: 2 }, cost: 6, once: true },
    { text: 'Under a sticky menu you find a page from Dr. Okafor\'s handbook. Even the menu looked tired.', page: 'molt', once: true },
    { day: 1, text: 'Behind the diner, a little Gloop is eating out of the dumpster. It looks like it only does this when nothing else is open. It wobbles after you when you leave.', stray: 'dumpling' },
    { text: 'A regular at the counter says the static flu started at the bowling alley\'s vending machine. Someone else says that\'s a rumor. You pocket some ember salt.', gives: { ember: 1 } },
  ],
  cards: [
    { text: 'Lou is sorting a box of Grim Grocers cards. "Okafor\'s? Yeah, he left something here." He pulls a handbook page out of his register. He\'d been using it as a bookmark in a binder.', page: 'growth', once: true },
    { text: 'Lou complains about trade night. "We moved it to the diner because there\'s nowhere else. The table\'s always sticky. The fries are... fries." Mikey waves at you from behind a binder.' },
    { text: 'Lou tells you a guy named Vance has been asking around about rare Mothhounds. "Same type who\'d sell a fake card. You can tell."', needs: 'vanceSeen', clue: 'vance' },
  ],
  arcade: [
    { day: 3, text: 'A baby Mothhound is pressed against the Neon Bastion cabinet, hypnotized by the attract screen. The owner says it\'s been there three days. You coax it away with your phone flashlight.', stray: 'pixel' },
    { text: 'Tobi\'s high score is on the Neon Bastion cabinet: TOB, wave 29. Above it: QNN, wave 412. Nobody knows who that is.' },
    { text: 'You play one round of Neon Bastion. You lose to the Bulwark on wave 10. A kid behind you sighs loudly.' },
  ],
  lanes: [
    { text: 'Darlene, the League Secretary, lets you scrape the rosin chalk off the ball return. "Take it. Nobody uses the house balls since the Cosmic Bowl lights went in."', gives: { chalk: 3 }, once: true },
    { text: 'The lost-and-found box has a handbook page in it, folded into a scorecard. Somebody bowled a 290 on it.', page: 'shorted', once: true },
    { text: 'An old bowler says the Gutter King still lives under lane 8 and only comes up for league finals. Everyone laughs a little too quickly. You grab some chalk on the way out.', gives: { chalk: 2 } },
  ],
  petcorp: [
    { text: 'Around the back of PetCorp, delivery crates are stamped SILK ROAD EXOTICS. Same name as on the tag you saw on Duchess. You take a photo.', needs: 'vanceSeen', clue: 'crates', once: true },
    { text: 'A PetCorp bin is full of unopened flu tablets, past their date, and a stack of invoices for "voltage drainage" at $90 each. You take a photo.', clue: 'invoices', once: true },
    { text: 'The PetCorp lights are off. The sign hums. Nothing else.' },
  ],
  alley: [
    { text: 'Glowcaps grow on the damp crates. You pick a handful.', gives: { glowcap: 3 } },
    { text: 'A torn handbook page is stuck to a crate with old gum.', page: 'stuck', once: true },
    { text: 'Something big moves behind the dumpster, then goes quiet. You take the glowcaps and leave.', gives: { glowcap: 2 } },
  ],
};

// Strays you can foster, and who might adopt them.
export const STRAYS = {
  dumpling: { name: 'Dumpling', sp: 'gloop', likes: 'experienced', note: 'Eats anything. Needs an owner who knows Gloops.' },
  fizz: { name: 'Fizz', sp: 'cat', likes: 'play', note: 'All energy. Needs someone to play with.' },
  pixel: { name: 'Pixel', sp: 'moth', likes: 'dark', note: 'Gets lamp-struck easily. Needs a dim, quiet home.' },
};
export const ADOPTERS = [
  { id: 'pelling', name: 'Mrs. Pelling', home: 'experienced', blurb: 'Already has a Gloop (Bubbles). Calm house, very sock-proofed.' },
  { id: 'tobi', name: 'Tobi\'s family', home: 'play', blurb: 'A nine-year-old with endless energy and a Neon Bastion habit.' },
  { id: 'tom', name: 'Old Tom', home: 'dark', blurb: 'Lives alone, goes to bed at eight, keeps the curtains shut.' },
  { id: 'darlene', name: 'Darlene from the lanes', home: 'lights', blurb: 'Wants a mascot for Lucky Strike Lanes. Blacklights, disco balls, the works.' },
];

/* ------------------------------------------------------------------ Saturday */
// Pet show: each entrant looks healthy, but one is hiding something.
export const SHOW = [
  { pet: 'Duke', sp: 'cat', owner: 'Mrs. Abernathy', ail: null, note: 'Groomed to a shine.' },
  { pet: 'Sir Wobbles', sp: 'gloop', owner: 'The Grants', ail: 'dried', painted: true, note: 'Suspiciously glossy.' },
  { pet: 'Bramble', sp: 'fern', owner: 'Priya', ail: null, note: 'Lush and green.' },
];
export const MARKET = [
  { who: 'A man rubbing his stomach', want: 'pill', line: 'Got anything for heartburn? I ate at the Last Stop Diner last night. Again. I don\'t know why I keep going.' },
  { who: 'Mrs. Fenwick', want: 'gel', line: 'Something to help Basil? I\'ve cut back to watering him every thirty minutes!' },
  { who: 'A nervous cat owner', want: 'tea', line: 'My cat jumps at everything since the flu. Anything calming?' },
  { who: 'Darlene', want: 'salve', line: 'The alley cat keeps shorting out the pinsetter. Something for static?' },
  { who: 'A gardener', want: 'ward', line: 'Fuzz on my Fernling\'s leaves. Do you have anything?' },
];
export const HOUSECALLS = [
  { id: 'lou', place: 'cards', pet: 'Neon', sp: 'cat', owner: 'Lou', ail: 'shorted', say: 'Neon keeps zapping one shelf. Always the Neon Saints shelf. I can\'t keep anything mint in here.' },
  { id: 'lanes', place: 'lanes', pet: 'Spare', sp: 'moth', owner: 'Darlene', ail: 'lampstruck', say: 'Spare hasn\'t left lane 6 since we put in the Cosmic Bowl blacklights. She just stares. League finals are tonight.' },
];
