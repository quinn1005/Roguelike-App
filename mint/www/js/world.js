// The living city: regular customers at the desk, the people you meet at night (Lou, Sal,
// Mikey, Rook, the Stranger) and their small stories across the quarter, and the weather.
import { blankInst, makeForm, addDefect, makeAlt, makeFake, makeInst } from './gen.js';

// ================================================================= regular customers
// Each regular comes back on set days. Their notes remember how you graded them last time.
// A visit is recorded as { ok: true/false } in S.regulars[id].
const okCount = (S, id) => (S.regulars[id] || []).filter((x) => x.ok).length;
const last = (S, id) => { const r = S.regulars[id] || []; return r.length ? r[r.length - 1].ok : null; };

const DELACROIX = { 2: ['gg', 2], 7: ['ns', 7], 12: ['bl', 3], 17: ['ml', 2], 22: ['tb', 4] };
const MARTY = { 3: ['gg', 5, 'trim'], 8: ['ns', 2, 'recolor'], 11: ['ga', 4, 'alphatrim'], 14: ['rd', 4, 'micro'], 19: ['bl', 6, 'stamp'], 24: ['ic', 6, 'weight'] };
const PIP = { 4: ['bl', 1], 9: ['bl', 2], 13: ['bl', 4], 18: ['bl', 8], 23: ['bl', 7] };

export function regularSubs(R, day, S) {
  const out = [];
  const reg = (id, at, inst, form) => { const sub = { inst, mismatch: null, story: null, regular: id }; sub.form = makeForm(R, inst, form); out.push({ at, sub }); };
  if (DELACROIX[day]) {
    const [l, n] = DELACROIX[day];
    const inst = makeInst(R, l, n, 'played');
    const prev = last(S, 'delacroix');
    const note = prev === null ? 'My grandson Timothy collected these before he joined up. He says this one is special. I don\'t know about these things, dear. Be kind, but be honest.'
      : prev ? 'You were so honest with me last time. I told the whole bridge club. Here\'s another of Timothy\'s. — Mrs. D.'
        : 'The last grade seemed a little generous. Timothy\'s friend said so. Please look carefully this time, dear. — Mrs. D.';
    reg('delacroix', 1, inst, { client: 'Mrs. E. Delacroix', tier: 'economy', declared: '$250 (Timothy said)', note });
  }
  if (MARTY[day]) {
    const [l, n, trick] = MARTY[day];
    const inst = blankInst(l, n);
    inst.dx = 0.4; inst.dy = -0.3;
    addDefect(R, inst, 'corner', 1);
    if (trick === 'micro' || trick === 'weight') makeFake(R, inst, null, [trick]);
    else makeAlt(R, inst, { alterKinds: [trick] });
    const prev = last(S, 'marty');
    const note = prev === null ? 'Kessler Cards & Coins. I send a lot of volume. Let\'s see if you\'re worth it. — M.K.'
      : prev ? 'Fine. You caught the last one. Nobody catches the last one. Try this. — M.K.'
        : 'Last one sailed right through you. Ha! Here\'s another. — M.K.';
    reg('marty', 2, inst, { client: 'Marty Kessler (dealer)', tier: 'express', declared: '$180', note });
  }
  if (PIP[day]) {
    const [l, n] = PIP[day];
    const inst = makeInst(R, l, n, 'nice');
    if (day === 18) { inst.v.shadowless = true; inst.v.first = true; }
    const prev = last(S, 'pip');
    const notes = {
      4: 'my first ever grading!!! I saved up. please give it a good number. (only if it deserves it) — Pip, age 9',
      9: prev ? 'you gave my last one a REAL grade and now I know what centering is. — Pip' : 'the man at the shop said my last grade was wrong. is that true? — Pip',
      13: 'I measured this one myself with a ruler first. I think it is a 7. — Pip',
      18: 'I FOUND A SHADOWLESS ONE AT A YARD SALE. it has the 1st stamp. is it real??? — Pip',
      23: 'this is my favorite one. I don\'t want to sell it. I just want to know. — Pip',
    };
    reg('pip', 3, inst, { client: 'Pip Abara (age 9)', tier: 'economy', declared: '$5', note: notes[day] });
  }
  return out;
}

// Called after a regular's card is stamped.
export function recordRegular(S, id, ok) { (S.regulars[id] = S.regulars[id] || []).push({ day: S.day, ok }); }

// Morning letters (and gifts) from regulars, once their visits are done.
export function regularLetters(S) {
  const L = [];
  const add = (from, body, extra = {}) => L.push({ from, body, ...extra });
  const f = S.flags;
  if (S.day === 23 && !f.delacroixDone && (S.regulars.delacroix || []).length >= 4) {
    f.delacroixDone = true;
    if (okCount(S, 'delacroix') >= 3) add('Mrs. E. Delacroix', ['Timothy came home on leave. He went through every grade you gave his cards and said, "Gran, this one\'s straight."', 'He wanted you to have this. It was the first card he ever pulled.'], { gift: { line: 'gg', n: 9, v: { holo: true }, who: 'Mrs. Delacroix and Timothy' }, rep: 2 });
    else add('Mrs. E. Delacroix', ['Timothy came home on leave and had your grades checked at Apex. He didn\'t say much. He didn\'t have to.', 'We won\'t be sending any more cards.'], { rep: -2 });
  }
  if (S.day === 25 && !f.martyDone && (S.regulars.marty || []).length >= 5) {
    f.martyDone = true;
    if (okCount(S, 'marty') >= 4) add('Marty Kessler', ['I\'ve been testing graders for twenty years. You\'re the first one I couldn\'t get anything past.', 'From Monday, all of Kessler Cards & Coins comes through your desk. Pike can thank me.'], { rep: 5 });
    else add('Marty Kessler', ['Twenty years of testing graders. You\'re about average, kid. That\'s not a compliment.'], {});
  }
  if (S.day === 24 && !f.pipDone && (S.regulars.pip || []).length >= 4) {
    f.pipDone = true;
    add('A drawing, in crayon', ['A grader at a desk with an enormous magnifying glass, and a small boy holding up a card. Underneath, in careful letters: "THE MOST HONEST GRADER IN THE CITY."', okCount(S, 'pip') >= 3 ? 'Pip\'s mom wrote on the back: "He wants to be a grader now. Thank you for taking him seriously."' : 'On the back: "pls grade my next one better."'], { rep: okCount(S, 'pip') >= 3 ? 1 : 0 });
  }
  return L;
}

// ================================================================= people of the night
// Lines that change over the quarter, so the regulars of the city have their own stories.
export function louArc(S) {
  const d = S.day, f = S.flags;
  if (d >= 21 && f.louHelped === 'yes') return 'Lou is behind the counter whistling. "The shop\'s staying open. Some customer bought my old card when I needed it. You know the one."';
  if (d >= 21 && f.louHelped === 'no') return 'There\'s a hand-written sign in the window: CLOSING SALE. Lou doesn\'t look up. "Everything must go. Including me."';
  if (d >= 16 && d < 21) return 'Lou is counting the till for the third time. "Crash took my regulars. Took my rent money too."';
  if (d >= 11 && d < 16) return '"A chain wants to buy me out," Lou says. "Card Kingdom. Fluorescent lights. Over my dead body." He doesn\'t sound sure.';
  return null;
}
export function salArc(S) {
  const d = S.day, f = S.flags;
  if (d >= 22 && f.salSon) return 'Sal has a second apron on the hook now. His son is back, burning the toast. Sal pretends to be annoyed.';
  if (d >= 11 && d < 16) return 'Sal shows you a postcard from the city. "My boy. Says he\'s doing great." Sal reads it twice and doesn\'t believe it either time.';
  if (d >= 16 && d < 22) return '"He called," Sal says. "He wants to come home. Says he\'s got nothing." He wipes the same spot on the counter for a long time.';
  return null;
}
export function mikeyArc(S) {
  const d = S.day, f = S.flags;
  if (d >= 21 && f.mikeyGift) return 'Mikey grins at you across the booth. He has a new binder. The first page has one card in it: the holo you gave him.';
  if (d >= 11 && d < 16) return 'Mikey looks like he\'s been crying. "My sister sold all my holos for the boom. She says it was for groceries."';
  if (d >= 16) return 'Mikey\'s binder is almost empty. He trades anyway, carefully, like every card matters. It does.';
  return null;
}
export function rookArc(S) {
  const d = S.day;
  if (d >= 21) return 'Rook\'s booth is empty tonight. Sal says a black car picked him up out front on Monday.';
  if (d >= 14) return 'Rook taps his briefcase. "I\'ve got a friend in the printing business. Perfect copies. Perfect." He watches your face when he says it.';
  if (d >= 9) return '"Mr. Carrow sends his regards," Rook says, and then pretends he didn\'t.';
  return null;
}
export function strangerArc(S) {
  const f = S.flags;
  if (f.ghostFound) return 'The Stranger takes his hat off, for the first time. "You found it. Ellis would have liked you." He leaves before you can ask anything.';
  if ((S.clues || 0) >= 2) return '"You\'ve been reading Ellis\'s notes," the Stranger says quietly. "Thursday. The tarp. Don\'t be late."';
  if ((S.clues || 0) >= 1) return 'The Stranger glances at you. "Halloway Print Works. I swept the floors there, once. A long time ago."';
  return null;
}

// Evening choices that belong to these stories.
export function arcEvents(S) {
  const E = [];
  const d = S.day, f = S.flags;
  if (d === 17 && f.louHelped === undefined) E.push({ id: 'louHelped', from: 'Lou, at the shop door', body: ['Lou catches you on the street, holding a toploader against his chest.', '"First card I ever owned. Nineteen eighty-seven. I need forty bucks for the rent or Card Kingdom gets the lease. I\'d rather it went to somebody who\'d keep it."'], choices: [{ id: 'yes', label: 'Buy Lou\'s card ($40)', cost: 40, integ: 5 }, { id: 'no', label: 'You can\'t spare it' }] });
  if (d === 19 && !f.salAsk) E.push({ id: 'salAsk', from: 'Sal, at the Last Stop', body: ['Sal pushes a coffee across the counter that you didn\'t order.', '"My boy wants to come home. He thinks I\'m angry. I\'m not angry." He looks at his hands. "What do I tell him?"'], choices: [{ id: 'home', label: '"Tell him to come home."', integ: 3 }, { id: 'wait', label: '"Give it time."' }] });
  return E;
}

// ================================================================= weather
// Every night has weather. Day 19 is the blackout: the night market and the diner close.
const PATTERN = ['rain', 'rain', 'fog', 'rain', 'clear', 'rain', 'heavy', 'fog', 'rain', 'clear', 'rain', 'heavy', 'rain', 'fog', 'clear', 'snow', 'snow', 'rain', 'blackout', 'snow', 'fog', 'heavy', 'rain', 'snow', 'clear'];
export const WEATHER = {
  rain: { label: 'Rain', line: 'It\'s raining. It\'s always raining.' },
  heavy: { label: 'Downpour', line: 'The gutters are overflowing. Everyone walks fast.' },
  fog: { label: 'Fog', line: 'Fog off the river. The streetlights look like they\'re underwater.' },
  clear: { label: 'Clear and cold', line: 'For once, no rain. You can see your breath.' },
  snow: { label: 'Snow', line: 'Snow, early and wet. It turns grey before it hits the ground.' },
  blackout: { label: 'Blackout', line: 'The whole block has lost power. Candles in the windows. The night market and the diner are closed.' },
};
export const weatherFor = (day) => PATTERN[(day - 1) % PATTERN.length];
