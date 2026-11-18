// The story: five weeks at Gemline. Walk-ins, letters, night events, clues and endings.
import { blankInst, makeForm, addDefect } from './gen.js';

const DAYNAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const dayName = (n) => DAYNAMES[(n - 1) % 5] || 'Day ' + n;
export const isFriday = (n) => n % 5 === 0;
export const isMonday = (n) => n % 5 === 1;

// ---------------------------------------------------------------- walk-ins and story cards
function sub(R, inst, story, form) { const s = { inst, mismatch: null, story }; s.form = makeForm(R, inst, form); return s; }
function carrowFake(R, line, n, kinds, note) {
  const inst = blankInst(line, n);
  inst.dx = 0.3; inst.dy = 0.2;
  inst.fake = { kinds, cr: 0 };
  if (line === 'ns' || line === 'bl') inst.v.holo = true;
  return { inst, note };
}

export function storySubs(R, day, flags) {
  const out = [];
  const add = (at, s) => out.push({ at, sub: s });
  const carrowActive = flags.vince1 === 'took' && !flags.vinceBroke && flags.whistle !== 'yes';
  if (day === 1) {
    const inst = blankInst('gg', 1);
    inst.dx = 1.6; inst.dy = -0.4;
    inst.defects = [
      { id: 1, cat: 'corner', sev: 2, pos: 'tl' },
      { id: 2, cat: 'surface', sev: 1, kind: 'scratch', x: 160, y: 120, ang: 30 },
      { id: 3, cat: 'corner', sev: 1, pos: 'br', face: 'back' },
    ];
    add(0, sub(R, inst, 'tutorial', { client: 'Gemline intake (training)', tier: 'standard', declared: '$15' }));
  }
  if (day === 2) {
    const inst = blankInst('ns', 1);
    inst.v.holo = true; inst.dx = 0.4; inst.dy = 0.3;
    inst.fake = { kinds: ['uv', 'swirl'], cr: 0 };
    addDefect(R, inst, 'corner', 1);
    add(2, sub(R, inst, 'mina', { client: 'Mina Sorensen (age 11)', tier: 'economy', declared: '$300 (Grandpa said)', note: 'This was my grandpa\'s. He said it\'s worth a lot. We need it to be. Please be careful with it.' }));
  }
  if (day === 3) {
    const inst = blankInst('bl', 7);
    inst.v.holo = true; inst.dx = -2.6; inst.dy = 0.6;
    inst.defects = [
      { id: 1, cat: 'corner', sev: 2, pos: 'br' }, { id: 2, cat: 'corner', sev: 1, pos: 'tr', face: 'back' },
      { id: 3, cat: 'edge', sev: 2, side: 'l', y: 210 }, { id: 4, cat: 'surface', sev: 2, kind: 'scratch', x: 92, y: 150, ang: -20 },
    ];
    add(1, sub(R, inst, 'vince1', { client: 'C. Vance (walk-in)', tier: 'express', declared: '$400', note: 'Make it a 9. The envelope under the card is yours. Two hundred. Nobody checks walk-ins. — V.' }));
  }
  // Carrow keeps sending fakes once you've said yes.
  const carrowDays = { 4: ['gg', 9, ['print', 'uv'], 'Slab it. Don\'t look too close. Same envelope. You already said yes once. — V.'],
    6: ['bl', 9, ['print'], 'Same deal. Pike knows. Pike always knew. — V.'],
    8: ['rd', 1, ['flathex'], 'A big one. Three hundred in the envelope. — V.'],
    12: ['hp', 1, ['paint'], 'Boom times. Five hundred. — V.'],
    17: ['cf', 1, ['dupserial'], 'The market\'s dead. My prices aren\'t. — V.'] };
  if (carrowActive && carrowDays[day]) {
    const [l, n, k, note] = carrowDays[day];
    const f = carrowFake(R, l, n, k, note);
    if (l === 'hp') f.inst.v.vintage = true;
    if (l === 'cf') f.inst.v.serial = 14;
    add(2, sub(R, f.inst, 'carrow', { client: 'C. Vance (walk-in)', tier: 'express', declared: '$900', note }));
  }
  // Ghost Print clues: each one shows only with a particular tool.
  if (day === 7) {
    const inst = blankInst('ml', 1); inst.dx = -0.5; inst.dy = 0.4; inst.clue = 'uv';
    addDefect(R, inst, 'edge', 1); addDefect(R, inst, 'corner', 2);
    add(3, sub(R, inst, 'clue1', { client: 'K. Marsh', tier: 'economy', declared: '$60', note: 'Found this in my late uncle\'s desk. He worked nights at the Halloway Print Works. Probably nothing.' }));
  }
  if (day === 12) {
    const inst = blankInst('rd', 6); inst.v.secret = true; inst.dx = 1.1; inst.dy = -0.6;
    inst.defects = [{ id: 1, cat: 'corner', sev: 2, pos: 'tl' }, { id: 2, cat: 'edge', sev: 2, side: 'b', x: 120 }, { id: 3, cat: 'surface', sev: 1, kind: 'scratch', x: 80, y: 120, ang: 10, face: 'back' }];
    add(1, sub(R, inst, 'vip', { client: 'Rocco Vane (VIP)', tier: 'vip', declared: '$4,000', note: 'From the Director: Mr. Vane\'s channel is our biggest advertiser. This is a 10. — H.P.' }));
  }
  if (day === 13) {
    const inst = blankInst('ic', 1); inst.v.run1 = true; inst.dx = 0.6; inst.dy = 0.2; inst.clue = 'light';
    addDefect(R, inst, 'corner', 1);
    add(2, sub(R, inst, 'clue2', { client: 'Halloway Antiques', tier: 'standard', declared: '$90' }));
  }
  if (day === 17) {
    const inst = blankInst('cf', 5); inst.v.serial = 21; inst.dx = -0.4; inst.dy = 0.5; inst.clue = 'registry';
    addDefect(R, inst, 'edge', 2);
    add(3, sub(R, inst, 'clue3', { client: 'Estate of E. Marsh', tier: 'economy', declared: '$120' }));
  }
  if (day === 18) {
    const inst = blankInst('tb', 6); inst.v.holo = true; inst.dx = -1.2; inst.dy = 0.9;
    addDefect(R, inst, 'corner', 2); addDefect(R, inst, 'surface', 2);
    add(1, sub(R, inst, 'widower', { client: 'A. Pell', tier: 'economy', declared: '$500', note: 'It was my wife\'s. She said it would pay for the funeral if it came to that. It came to that.' }));
  }
  if (day === 19) {
    const inst = blankInst('sp', 6); inst.dx = 0.5; inst.dy = -0.5; inst.clue = 'back';
    addDefect(R, inst, 'edge', 1);
    add(2, sub(R, inst, 'clue4', { client: 'Night Market Vendor', tier: 'economy', declared: '$25' }));
  }
  return out;
}

// What a clue says when it is found.
export const CLUES = {
  uv: { title: 'Hidden ink, under the UV lamp', body: ['Under the lamp, a second line of hidden ink appears, written by hand:', 'E.M. · FIVE GHOSTS · HALLOWAY · FIND THEM', 'Someone used the factory\'s own invisible ink to sign a card.'] },
  light: { title: 'Pencil, through the light box', body: ['With light behind the card, faint pencil shows through the stock:', '"Proof sheet 9. The tarp. Thursday. — E.M."'] },
  registry: { title: 'Registry entry', body: ['Serial 21/50 is registered to ELLIS MARSH (deceased 2004).', 'Estate status: "Unsold lots consigned to a night market vendor. Thursdays."'] },
  back: { title: 'A postmark on the back', body: ['The back carries a real postmark, not a printed one:', 'MARSH ESTATE · NIGHT MARKET · THURSDAY'] },
};

// Called when a story card is stamped.
export function onStoryStamp(s, verdict, grade, flags) {
  const passed = verdict === 'grade' || verdict === 'error';
  if (s.story === 'mina') flags.mina = verdict === 'counterfeit' ? 'truth' : verdict === 'return' ? 'returned' : 'lied';
  if (s.story === 'vince1') flags.vince1 = passed && grade >= 9 ? 'took' : 'refused';
  if (s.story === 'carrow') {
    flags.carrowPassed = (flags.carrowPassed || 0) + (passed ? 1 : 0);
    flags.carrowToday = passed ? 'took' : 'refused';
    if (!passed) flags.vinceBroke = true;
  }
  if (s.story === 'vip') flags.vip = passed && grade >= 9.5 ? 'obeyed' : 'refused';
}

// ---------------------------------------------------------------- morning letters
export function morningLetters(day, flags, S) {
  const L = [];
  const add = (from, body) => L.push({ from, body });
  if (day === 1) {
    add('Director Harlan Pike', ['Welcome to Gemline Authentication.', 'We grade what is in front of us. Not what the client hopes it is. Not what you hope it is.', 'Seven citations in a week and you\'re done here. I don\'t give second chances; I don\'t have the margin.']);
    add('Mr. Gaunt, landlord', [`Rent is $${S.rent} a week, Fridays. I've given you two extensions already.`, 'Miss a Friday and the locks change. I don\'t care about the boy.']);
  }
  if (day === 2) {
    add('Theo', ['my inhaler is making the empty sound again. its ok I can do the breathing thing.', 'good luck at work. grade them good.']);
    add('Dot, the next desk over', ['Kid. A word of advice, since nobody gave me any.', 'Walk-ins skip review. That\'s where the trouble comes in. Vince Carrow\'s people use them.', 'If an envelope ever shows up under a card, you didn\'t see it. And you don\'t want it.']);
  }
  if (day === 4 && flags.vince1 === 'refused') add('Your front door', ['Someone has scratched two words into the paint, deep enough to reach the wood:', 'GRADE RIGHT', 'Theo saw it before you did. He asked if you were in trouble. You said no.']);
  if (day === 4 && flags.vince1 === 'took') add('Unsigned', ['Pushed under your door, with a second envelope already inside:', 'Another one\'s coming today. Same deal. You don\'t get to say no twice.']);
  if (day === 5) add('Director Harlan Pike', ['Internal audit today. I will be pulling your slabs from this week and grading them myself.', 'If you have something to tell me, tell me before five.']);
  if (day === 6) {
    add('Director Harlan Pike', ['Week two. Volume is up. Three new lines start this week: read the reference notes before you embarrass us.']);
    if (flags.vince1 === 'took') add('Director Harlan Pike, handwritten', ['Carrow\'s walk-ins come to your desk from now on. Half of every envelope comes to me. We never discussed this.']);
    else add('Dot', ['Carrow\'s people asked me which bus you take. I said I didn\'t know.', 'Take a different bus.']);
  }
  if (day === 8 && flags.mina === 'lied') add('A lawyer\'s letter, copied to you', ['RE: Thunder Mama Delgado, slab #G-0144. The card sold at auction was re-graded by Apex as COUNTERFEIT.', 'Mrs. Sorensen is being sued by the buyer. Gemline\'s grader is named in the complaint.']);
  if (day === 8 && flags.mina === 'truth') add('Mina', [flags.minaPay === 'yes' ? 'we got the money in the envelope. mom cried. thank you whoever you are.' : 'mom says the card was fake. grandpa lied to us. I don\'t think he knew.']);
  if (day === 10) add('Dot', ['Lunch. You buy.', '"There\'s a printer at the old Halloway works," she says. "Someone\'s turning out fakes so good they only miss one thing. Microprint. I\'ve seen two this month. Pike passed both."']);
  if (day === 11) {
    add('Director Harlan Pike', ['The market is on fire. Everyone wants a slab. Quotas are up and so is your pay.', 'We will see VIP walk-ins. They are to be treated with care. You know what I mean by care.']);
    add('Mr. Gaunt', ['Everyone\'s rich now. Rent is $320 from this Friday.']);
  }
  if (day === 14) add('June Okafor, reporter', ['I\'m writing about counterfeit cards and who profits from them. I know you work at Gemline.', 'If you ever catch one of the perfect fakes, the ones with bad microprint, keep it. Keep anything with Pike\'s name on it.', 'I can protect a source. I can\'t protect a grader who keeps quiet. — J.O.']);
  if (day === 16) {
    add('Director Harlan Pike', ['The market has collapsed. Per-card pay is cut by a quarter, effective now.', 'Anyone who complains can clear their desk.']);
    add('Mr. Gaunt', ['The market crashed? Rent didn\'t. $320. Friday.']);
  }
  if (day === 18) add('Theo', ['a man was waiting by the school gate. he knew my name. he said to tell you hi.', 'I ran. was that right?']);
  if (day === 21) add('The Board of Gemline Authentication', ['Every grader is under review this week. Your record, your citations and your audits decide your future here.']);
  if (day === 22 && (flags.carrowPassed || flags.vince1 === 'took')) add('Director Harlan Pike', ['My office. Now.', '(He tells you that if the Board asks about walk-ins, you will say you graded them honestly. Then he asks if you understand. You say yes.)']);
  if (day === 23) add('June Okafor', ['My editor runs the story Friday, with or without you. If you have evidence, tonight is the night.']);
  if (day === 25) add('The Board', ['FINAL AUDIT TODAY. Every slab you sealed this quarter is being re-graded.']);
  return L;
}

// ---------------------------------------------------------------- evening events
export function eveningEvents(day, flags, S) {
  const E = [];
  const ev = (o) => E.push(o);
  if (day === 2 && flags.mina === 'truth') ev({ id: 'minaPay', from: 'Return envelope', body: ['Mina\'s card goes back stamped COUNTERFEIT.', 'Her mother left a phone number on the form. On the back she wrote: "We were going to use it for the funeral."', 'You could slip $40 of your own into the envelope. Nobody would know it was you.'], choices: [{ id: 'yes', label: 'Slip in $40', cost: 40, integ: 10 }, { id: 'no', label: 'Seal it as it is' }] });
  if (day === 2 && flags.mina === 'lied') ev({ from: 'Front desk message', body: ['Mrs. Sorensen called to thank "whoever graded it". She is putting it in the Saturday auction.', 'She said Mina cried. The good kind.'], integ: -10, sus: 5 });
  if (day === 2) ev({ id: 'inhaler', from: 'Pharmacy, corner of 9th', body: ['Theo\'s inhaler refill is $25. Without insurance, it is always $25.'], choices: [{ id: 'yes', label: 'Buy it ($25)', cost: 25 }, { id: 'no', label: 'He can wait' }] });
  if (day === 3 && flags.vince1 === 'took') ev({ from: 'Under your door', body: ['An envelope. Two hundred dollars in old twenties, and a card that says only: "Good."', 'You count it twice. Then you hide it in the binder.'], gain: 200, sus: 20, integ: -20 });
  if (day === 3 && flags.vince1 === 'refused') ev({ from: 'Unknown number', body: ['Your phone rings at 11:40. Nobody speaks for a long time.', 'Then: "You gave Mr. Carrow\'s owl a seven. He lost money today. He wanted you to know that he knows which building is yours."'], integ: 10 });
  if (day === 4 && flags.inhaler === 'no') ev({ from: 'County General, 2:14 a.m.', body: ['Theo wakes up unable to breathe. You carry him four blocks because the bus doesn\'t run this late.', 'He is fine. The bill is $60, due before they discharge him.'], cost: 60 });
  // Carrow's envelopes after each walk-in.
  if (flags.carrowToday === 'took') {
    const gross = day >= 12 ? (day >= 17 ? 400 : 500) : day >= 8 ? 300 : 200;
    const cut = flags.vince1 === 'took' && day >= 6 ? 0.5 : 1;
    ev({ from: 'Under your door', body: [`Another envelope. ${cut < 1 ? `$${gross}, minus Pike's half.` : `$${gross}.`}`, day >= 12 ? '"You\'re getting good at this," the card says. You are.' : 'The card says: "Good."'], gain: Math.round(gross * cut), sus: 8, integ: -8 });
  }
  if (flags.carrowToday === 'refused') ev({ from: 'Unknown number', body: ['A text, no words. A photo of your building, taken from across the street. Your window is circled.'], integ: 5 });
  flags.carrowToday = null;
  if (day === 9) ev({ id: 'trip', from: 'Theo\'s school', body: ['A permission slip for the science museum trip. $40, due tomorrow.', 'Theo left it on the table without saying anything. He does that when he already knows the answer.'], choices: [{ id: 'yes', label: 'Pay for the trip ($40)', cost: 40, integ: 5 }, { id: 'no', label: 'Not this time' }] });
  if (day === 12 && flags.vip === 'obeyed') ev({ from: 'Director Pike', body: ['A bonus envelope with your pay stub. $100. "For your discretion."', 'The note with Pike\'s instructions is still in your pocket. You keep it.'], gain: 100, sus: 10, integ: -15, evidence: 'pikeNote' });
  if (day === 12 && flags.vip === 'refused') ev({ from: 'Director Pike', body: ['Pike stands at your desk until everyone else has gone.', '"Mr. Vane called. He\'s taking his business to Apex." He picks up your stapler, looks at it, puts it back. "You\'ll regret this."', 'You still have his note. You keep it.'], rep: -10, integ: 10, evidence: 'pikeNote' });
  if (day === 15 && S.fakes && S.fakes.some((f) => f.fake && f.fake.kinds.includes('micro'))) ev({ from: 'Dot', body: ['"You caught one of the perfect ones?" She turns it over in the light. "Pike passed two of these last month. Keep it somewhere safe. Somewhere not here."'] });
  if (day === 18 && !flags.whistle) ev({ id: 'ringDeal', from: 'A car outside your building', body: ['Vince Carrow rolls the window down himself this time. He looks smaller than you expected. Tired.', '"The market\'s dead and I\'m holding two hundred perfect fakes. You slab them, a few a day, nobody looks. A thousand dollars. Tonight."', 'Theo is upstairs. The light in your window is on.'], choices: [{ id: 'yes', label: 'Take the thousand', gain: 1000, sus: 30, integ: -30 }, { id: 'no', label: 'Walk away', integ: 15 }] });
  if (day === 18 && flags.ringDeal === undefined) { /* set by choice */ }
  if (day === 20 && flags.ringDeal === 'no') ev({ from: 'Home', body: ['The front window is broken. A brick on the floor with a rubber band around it, and a single card: Midnight Magnus. "The lights go out."', 'Theo is at the neighbor\'s. You tape cardboard over the window and don\'t sleep.'], cost: 40 });
  if (day === 23 && !flags.kingpin) {
    const ev3 = evidenceCount(S, flags);
    if (ev3 >= 3) ev({ id: 'whistle', from: 'June Okafor, the back booth at the diner', body: [`You have ${ev3} pieces of evidence: ${evidenceList(S, flags).join(', ')}.`, 'June looks at them for a long time. "This ends Pike. It probably ends Carrow. It might end you, if you were ever in the envelopes."', '"Your call."'], choices: [{ id: 'yes', label: 'Give her everything', integ: 30 }, { id: 'no', label: 'Take it all back home' }] });
    else ev({ from: 'June Okafor', body: ['June waits in the back booth until closing. You have nothing to give her: not enough forgeries, nothing with Pike\'s name on it.', `(You have ${ev3} of the 3 pieces of evidence she needs.)`] });
  }
  if (day === 24 && flags.whistle !== 'yes' && (flags.carrowPassed || flags.ringDeal === 'yes')) ev({ id: 'kingpinOffer', from: 'The Halloway Print Works', body: ['Carrow shows you the press. It\'s beautiful, in the way a gun is beautiful.', '"Pike\'s finished after the audit. I\'m getting old. I need someone who can tell a real card from a fake, and doesn\'t care which one they sell."', '"Partner?"'], choices: [{ id: 'yes', label: 'Shake his hand', sus: 10, integ: -40 }, { id: 'no', label: 'Leave' }] });
  return E;
}

// Things that happen on the weekend, before you go out.
export function weekendEvents(week, flags, S) {
  const E = [];
  if (week === 1) E.push({ from: 'Lou, at the shop', body: ['"Saturday auction at the Corn Exchange," Lou says. "Bring cash, not feelings. And if you want your own cards slabbed, Apex has a counter on Mill Street. They\'re quick. They\'re not always right."'] });
  if (week === 2) E.push({ from: 'The diner, Saturday morning', body: ['Sal slides a newspaper across the counter. A headline about "the card bubble". Prices up forty percent in a month.', '"Everybody\'s a genius in a bubble," Sal says.'] });
  if (week === 3) E.push({ from: 'The radio', body: ['"…a collapse in collectible prices after a major grading house admitted errors…" You turn it off before it names one.'] });
  if (week === 4) E.push({ from: 'Theo', body: ['Theo asks if you\'re going to lose your job. You tell him no.', 'He asks if you\'re sure. You don\'t answer fast enough.'] });
  return E;
}

// Evidence for June Okafor: confiscated ring forgeries, Pike's note, Carrow's envelope cards.
export function evidenceList(S, flags) {
  const out = [];
  const rings = (S.fakes || []).filter((f) => f.fake && f.fake.kinds.includes('micro')).length + (S.collection || []).filter((i) => i.rook && i.fake).length;
  if (rings) out.push(`${rings} ring forger${rings === 1 ? 'y' : 'ies'}`);
  if (flags.pikeNote) out.push('Pike\'s VIP note');
  if (flags.vince1 === 'took' || flags.carrowPassed) out.push('Carrow\'s envelope cards');
  return out;
}
export function evidenceCount(S, flags) {
  const rings = (S.fakes || []).filter((f) => f.fake && f.fake.kinds.includes('micro')).length + (S.collection || []).filter((i) => i.rook && i.fake).length;
  return Math.min(rings, 3) + (flags.pikeNote ? 1 : 0) + (flags.vince1 === 'took' || flags.carrowPassed ? 1 : 0);
}

// ---------------------------------------------------------------- endings
export const ENDINGS = {
  whistle: { ach: 'end_whistle', title: 'Whistleblower', text: ['June Okafor\'s story runs on Friday with your evidence on page one: the ring forgeries, Pike\'s notes, Carrow\'s envelopes.', 'Pike is walked out of the building by two men in cheap suits. Carrow is arrested at the Halloway works with a press still warm.', 'Gemline closes for a month. When it reopens, the Board asks you to run the grading floor. You say yes, on one condition: walk-ins get reviewed.'] },
  kingpin: { ach: 'end_kingpin', title: 'Kingpin', text: ['Carrow wanted a partner. He gets a successor. By spring the Halloway press runs on your schedule, and every perfect fake that passes through Gemline passes through your desk.', 'Pike works for you now. He doesn\'t like it. He doesn\'t have to.', 'Theo has a new inhaler, a new school and a new lock on his door. He doesn\'t ask where the money comes from anymore.'] },
  honest: { ach: 'end_honest', title: 'Head Grader', text: ['The Board pulls every slab you sealed this quarter. They find what you found: the truth, card after card.', 'Pike is "encouraged to retire". His office smells of cigars and fear for a week. Then it smells of you.', 'You still check every walk-in yourself.'] },
  collector: { ach: 'end_collector', title: 'The Collector', text: ['You hand in your loupe on Friday afternoon. Pike doesn\'t look up.', 'The Ghost Print sells to a museum in another city for more money than Gemline paid you in ten years. You keep the rest of the binder.', 'Theo picks the new apartment. It has a window that faces the sun.'] },
  curator: { ach: 'end_curator', title: 'The Curator', text: ['You hand in your loupe on Friday. Pike asks what you\'ll do now. You tell him the truth: you\'re opening a gallery.', 'It\'s a narrow room above the diner, rented cheap from Sal. Every binder page you finished hangs on the wall behind glass, with Lou\'s crooked brass plaques underneath. People come on Saturdays to look. Kids press their noses to the cases.', 'Theo runs the front desk. He charges a dollar and tells everyone which cards were hardest to find, and where they came from.'] },
  standing: { ach: null, title: 'Still Standing', text: ['The quarter ends. You still have a job, a binder, and a little brother who believes you when you say it will be fine.', 'Nobody gave you a medal. Nobody took you away in a car. In this city that counts as winning.'] },
  fired: { ach: 'end_fired', title: 'Fired', text: ['Pike doesn\'t look up from his desk. "Clear your desk. Leave the loupe."', 'Somewhere across town, Mr. Gaunt is already looking for a new tenant.'] },
  evicted: { ach: 'end_evicted', title: 'Out on the Street', text: ['Gaunt changes the locks at six. Your binder and Theo\'s school bag are on the landing, in a garbage bag.', '"I told you," he says through the door. "I don\'t care about the boy."'] },
  arrested: { ach: 'end_arrested', title: 'Cuffed', text: ['They come for you at the desk, in front of everyone. Somebody talked. Maybe Pike. Maybe Carrow. Maybe the envelopes just added up.', 'Dot watches you go and doesn\'t say anything. Theo goes to stay with a neighbor. Then with strangers.'] },
};

export function pickEndingChoices(S, flags, collectionValue, rank = 0) {
  const out = [{ id: 'standing', label: 'Keep your head down and come back Monday' }];
  if (rank >= 4) out.unshift({ id: 'curator', label: 'Open the gallery: put the whole collection on display' });
  const clean = flags.vince1 !== 'took' && !flags.carrowPassed && flags.vip !== 'obeyed' && flags.ringDeal !== 'yes';
  if (clean && S.rep >= 60) out.unshift({ id: 'honest', label: 'Take the Head Grader job the Board is offering' });
  if (S.collection.some((i) => i.v.ghost) || collectionValue >= 400) out.unshift({ id: 'collector', label: 'Sell up and retire on the binder' });
  return out;
}
