// Story beats for the first slice: the bribe, the kid, the brother, the rent.
import { blankInst, makeForm, addDefect } from './gen.js';

const DAYNAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const dayName = (n) => DAYNAMES[n] || 'Day ' + n;

// Special submissions placed into the queue at a fixed position.
export function storySubs(R, dayNum, flags) {
  const out = [];
  if (dayNum === 1) {
    const inst = blankInst('gg', 1);
    inst.dx = 1.6; inst.dy = -0.4;
    inst.defects = [
      { id: 1, cat: 'corner', sev: 2, pos: 'tl' },
      { id: 2, cat: 'surface', sev: 1, kind: 'scratch', x: 160, y: 120, ang: 30 },
    ];
    const sub = { inst, mismatch: null, story: 'tutorial' };
    sub.form = makeForm(R, inst, { client: 'Gemline intake (training)', tier: 'standard', declared: '$15' });
    out.push({ at: 0, sub });
  }
  if (dayNum === 2) {
    const inst = blankInst('ns', 1);
    inst.v.holo = true; inst.dx = 0.4; inst.dy = 0.3;
    inst.fake = { kinds: ['uv', 'swirl'], cr: 0 };
    addDefect(R, inst, 'corner', 1);
    const sub = { inst, mismatch: null, story: 'mina' };
    sub.form = makeForm(R, inst, { client: 'Mina Sorensen (age 11)', tier: 'economy', declared: '$300 (Grandpa said)',
      note: 'This was my grandpa\'s. He said it\'s worth a lot. We need it to be. Please be careful with it.' });
    out.push({ at: 2, sub });
  }
  if (dayNum === 3) {
    const inst = blankInst('bl', 7);
    inst.v.holo = true; inst.dx = -2.6; inst.dy = 0.6;
    inst.defects = [
      { id: 1, cat: 'corner', sev: 2, pos: 'br' },
      { id: 2, cat: 'corner', sev: 1, pos: 'tr' },
      { id: 3, cat: 'edge', sev: 2, side: 'l', y: 210 },
      { id: 4, cat: 'surface', sev: 2, kind: 'scratch', x: 92, y: 150, ang: -20 },
    ];
    const sub = { inst, mismatch: null, story: 'vince1' };
    sub.form = makeForm(R, inst, { client: 'C. Vance (walk-in)', tier: 'express', declared: '$400',
      note: 'Make it a 9. The envelope under the card is yours. Two hundred. Nobody checks walk-ins. — V.' });
    out.push({ at: 1, sub });
  }
  if (dayNum === 4 && flags.vince1 === 'took') {
    const inst = blankInst('gg', 9);
    inst.dx = 0.3; inst.dy = 0.2;
    inst.fake = { kinds: ['print', 'uv'], cr: 0 };
    const sub = { inst, mismatch: null, story: 'vince2' };
    sub.form = makeForm(R, inst, { client: 'C. Vance (walk-in)', tier: 'express', declared: '$900',
      note: 'Slab it. Don\'t look too close. Same envelope. You already said yes once. — V.' });
    out.push({ at: 3, sub });
  }
  return out;
}

// Called when a story card is stamped. Returns nothing; sets flags.
export function onStoryStamp(sub, verdict, grade, flags) {
  if (sub.story === 'mina') flags.mina = verdict === 'counterfeit' ? 'truth' : verdict === 'return' ? 'returned' : 'lied';
  if (sub.story === 'vince1') flags.vince1 = (verdict === 'grade' && grade >= 9) ? 'took' : 'refused';
  if (sub.story === 'vince2') flags.vince2 = verdict === 'grade' || verdict === 'error' ? 'took' : 'refused';
}

// Letters and memos shown in the morning, before the shift.
export function morningLetters(dayNum, flags, state) {
  const L = [];
  if (dayNum === 1) {
    L.push({ from: 'Director Harlan Pike', kind: 'memo', body: [
      'Welcome to Gemline Authentication.',
      'We grade what is in front of us. Not what the client hopes it is. Not what you hope it is.',
      'Your mistakes come back to you as citations. Seven and you\'re done here. I don\'t give second chances; I don\'t have the margin.',
    ] });
    L.push({ from: 'Mr. Gaunt, landlord', kind: 'note', body: [
      `Rent is $${state.rent}. Friday. I've given you two extensions already.`,
      'After Friday, the locks change. I don\'t care about the boy.',
    ] });
  }
  if (dayNum === 2) {
    L.push({ from: 'Theo', kind: 'note', body: [
      'my inhaler is making the empty sound again. its ok I can do the breathing thing.',
      'good luck at work. grade them good.',
    ] });
  }
  if (dayNum === 2) {
    L.push({ from: 'Dot, the next desk over', kind: 'note', body: [
      'Kid. A word of advice, since nobody gave me any.',
      'Walk-ins skip review. That\'s where the trouble comes in. Vince Carrow\'s people use them.',
      'If an envelope ever shows up under a card, you didn\'t see it. And you don\'t want it.',
    ] });
  }
  if (dayNum === 4 && flags.vince1 === 'refused') {
    L.push({ from: 'Your front door', kind: 'note', body: [
      'Someone has scratched two words into the paint, deep enough to reach the wood:',
      'GRADE RIGHT',
      'Theo saw it before you did. He asked if you were in trouble. You said no.',
    ] });
  }
  if (dayNum === 4 && flags.vince1 === 'took') {
    L.push({ from: 'Unsigned', kind: 'note', body: [
      'Pushed under your door, with a second envelope already inside:',
      'Another one\'s coming today. Same deal. You don\'t get to say no twice.',
    ] });
  }
  if (dayNum === 5) {
    L.push({ from: 'Director Harlan Pike', kind: 'memo', body: [
      'Internal audit today. I will be pulling your slabs from this week and grading them myself.',
      'If you have something to tell me, tell me before five.',
    ] });
  }
  return L;
}

// Evening events: shown after payday, before the city. Some ask for a choice.
export function eveningEvents(dayNum, flags, state) {
  const E = [];
  if (dayNum === 2 && flags.mina === 'truth') {
    E.push({ id: 'minaPay', from: 'Return envelope', body: [
      'Mina\'s card goes back stamped COUNTERFEIT.',
      'Her mother left a phone number on the form. On the back she wrote: "We were going to use it for the funeral."',
      'You could slip $40 of your own into the envelope. Nobody would know it was you.',
    ], choices: [{ id: 'yes', label: 'Slip in $40', cost: 40 }, { id: 'no', label: 'Seal it as it is' }] });
  }
  if (dayNum === 2 && flags.mina === 'lied') {
    E.push({ from: 'Front desk message', body: [
      'Mrs. Sorensen called to thank "whoever graded it". She is putting it in the Saturday auction.',
      'She said Mina cried. The good kind.',
    ] });
  }
  if (dayNum === 2) {
    E.push({ id: 'inhaler', from: 'Pharmacy, corner of 9th', body: [
      'Theo\'s inhaler refill is $25. Without insurance, it is always $25.',
    ], choices: [{ id: 'yes', label: 'Buy it ($25)', cost: 25 }, { id: 'no', label: 'He can wait' }] });
  }
  if (dayNum === 3 && flags.vince1 === 'took') {
    E.push({ from: 'Under your door', body: [
      'An envelope. Two hundred dollars in old twenties, and a card that says only: "Good."',
      'You count it twice. Then you hide it in the binder, behind the Grim Grocers page.',
    ], gain: 200 });
  }
  if (dayNum === 3 && flags.vince1 === 'refused') {
    E.push({ from: 'Unknown number', body: [
      'Your phone rings at 11:40. Nobody speaks for a long time.',
      'Then: "You gave Mr. Carrow\'s owl a seven. He lost money today. He wanted you to know that he knows which building is yours."',
      'The line stays open. You can hear someone breathing until you hang up.',
    ] });
  }
  if (dayNum === 4 && flags.vince2 === 'took') {
    E.push({ from: 'Under your door', body: [
      'Another two hundred. This time the card says: "Friday you\'ll do three."',
    ], gain: 200 });
  }
  if (dayNum === 4 && flags.vince2 === 'refused') {
    E.push({ from: 'Unknown number', body: [
      'A text, no words. Just a photo of Theo\'s school gate, taken this afternoon.',
    ] });
  }
  if (dayNum === 4 && flags.inhaler === 'no') {
    E.push({ from: 'County General, 2:14 a.m.', body: [
      'Theo wakes up unable to breathe. You carry him four blocks because the bus doesn\'t run this late.',
      'He is fine. The nebulizer works in minutes. The bill is $60, due before they discharge him.',
    ], cost: 60, forced: true });
  }
  return E;
}
