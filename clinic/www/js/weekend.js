// Saturday: the town fair (pet show, market stall, house calls), adoptions, and the end of the week.
import { THEMES } from './themes.js';
import { SPECIES, AILMENTS, RECIPES } from './data.js';
import { SHOW, MARKET, HOUSECALLS, ADOPTERS, STRAYS, RENT } from './story.js';
import { makePatient } from './patient.js';
import { EW, EH, OX, renderExam, signAt, signsOf } from './exam.js';
import { renderDiorama } from './diorama.js';
import { sfx, buzz, music, ambience } from './audio.js';
import { G, ACT, esc, money, save, setScreen, renderPanel, toast, openModal, closeModal, addMoney, addRep } from './core.js';
import { examScreen, portrait } from './examflow.js';
import { hubScreen } from './day.js';

const spName = (sp) => SPECIES[sp].name;
const EVENTS = { show: 'Judge the pet show', market: 'Run a market stall', calls: 'Make house calls' };

G.weekendScreen = function weekendScreen() {
  const S = G.S;
  return {
    kind: 'hub', w: 192, h: 108, fps: 24, mode: 'weekend',
    enter() { music('fair'); ambience('fair'); },
    draw(fb, t) { renderDiorama(fb, t, THEMES.morning, { kennel: S.kennel }); },
    panel() {
      const done = S.sat.done, left = 2 - done.length;
      return `<h2>Saturday: the town fair</h2>
        ${S.notes.map((n) => `<p class="note">${esc(n)}</p>`).join('')}
        <p>The clinic is closed today. The fair is on in the square. You have time for <b>${left}</b> more of these:</p>
        <div class="btns col">${Object.entries(EVENTS).map(([k, n]) => `<button class="${done.includes(k) ? '' : 'primary'}" data-act="satgo" data-k="${k}" ${done.includes(k) || left <= 0 ? 'disabled' : ''}>${n}${done.includes(k) ? ' ✓' : ''}</button>`).join('')}</div>
        <div class="btns"><button data-act="mail">Mail</button><button data-act="casebook">Casebook</button>${left <= 0 ? '<button class="primary" data-act="satevening">Head home for the evening</button>' : ''}</div>`;
    },
  };
};
ACT.satgo = (ds) => { if (ds.k === 'show') return startShow(); if (ds.k === 'market') return startMarket(); if (ds.k === 'calls') return startCalls(0); };
function finishEvent(k) { const S = G.S; if (!S.sat.done.includes(k)) S.sat.done.push(k); save(); setScreen(G.weekendScreen()); }

/* ---------- the pet show: three entrants, one hiding something ---------- */
function startShow() {
  const S = G.S;
  const entrants = SHOW.map((e, i) => {
    const p = makePatient({ ail: e.ail || { cat: 'hairball', gloop: 'swallowed', fern: 'mites' }[e.sp], pet: e.pet, owner: e.owner, say: e.note }, S.seed + 900 + i);
    p.signs = e.ail ? ['discolor', 'sag'].filter((k) => k === 'discolor') : [];
    p.uid = 'show' + i; p.show = e; p.stress = 0;
    return p;
  });
  const s = {
    kind: 'show', w: EW, h: EH, fps: 30, i: 0, entrants, lampX: OX - 20, lampY: 22, found: entrants.map(() => new Set()),
    enter() { music('fair'); ambience('fair'); },
    draw(fb, t) { renderExam(fb, { p: entrants[s.i], t, th: THEMES.morning, lampX: s.lampX, lampY: s.lampY, mode: null, found: s.found[s.i], spin: 0.4, room: 'show', stress: 0 }); },
    pointer(type, x, y, ptr) {
      if (type === 'move' || type === 'down') { if (type === 'down' || ptr || matchMedia('(hover: hover)').matches) { s.lampX = Math.max(6, Math.min(EW - 6, x)); s.lampY = Math.max(4, Math.min(60, y - 22)); } }
      if (type === 'tap') { const k = signAt(entrants[s.i], x, y, 4); if (k && !s.found[s.i].has(k)) { s.found[s.i].add(k); sfx('clue'); toast(`Under the lamp: ${signsOf(entrants[s.i]).find((q) => q.kind === k).text}. That shine is... paint?`); renderPanel(); } }
    },
    panel() {
      const p = entrants[s.i];
      return `<h2>Pet show</h2><p class="fine">Look each entrant over with the lamp. Dr. Sheen from PetCorp is judging too, and keeps smiling at the Grants.</p>
        <div class="owner"><img class="portrait" src="${portrait(p, true)}" alt=""><div><b>${esc(p.pet)}</b> <span class="tag">${spName(p.sp)}</span><p>${esc(p.owner)}. “${esc(p.show.note)}”</p></div></div>
        <div class="btns"><button data-act="shownav" data-d="-1" ${s.i === 0 ? 'disabled' : ''}>Previous</button><button data-act="shownav" data-d="1" ${s.i === 2 ? 'disabled' : ''}>Next entrant</button></div>
        <div class="btns"><button class="primary" data-act="showjudge">Make your decision</button></div>`;
    },
  };
  setScreen(s);
}
ACT.shownav = (ds) => { const s = G.scr; s.i = Math.max(0, Math.min(2, s.i + +ds.d)); renderPanel(); };
ACT.showjudge = () => {
  const s = G.scr, S = G.S;
  openModal(`<h2>Best in Show</h2><p>Pick a winner. If you think an entrant is hiding a health problem, you can say so.</p>
    ${s.entrants.map((p, i) => `<button class="dx" data-act="showwin" data-i="${i}"><b>${esc(p.pet)}</b><span>${spName(p.sp)} · ${esc(p.owner)}</span></button>`).join('')}
    <label class="check"><input type="checkbox" id="flag-wobbles"> Report that Sir Wobbles is painted to hide a health problem</label>
    ${Object.keys(S.clues).length >= 2 ? '<label class="check"><input type="checkbox" id="expose"> Show the fair committee your photos of PetCorp</label>' : ''}`, 'sticky');
};
ACT.showwin = (ds) => {
  const S = G.S, s = G.scr, win = s.entrants[+ds.i], flag = document.getElementById('flag-wobbles').checked, expose = document.getElementById('expose') && document.getElementById('expose').checked;
  closeModal();
  const lines = []; let rep = 0;
  if (win.show.ail) { lines.push(`You give the ribbon to ${win.pet}. Under the stage lights the paint starts to run, and the crowd sees a dried-out Gloop. Dr. Sheen pretends not to know the Grants.`); rep -= 3; }
  else { lines.push(`${win.pet} wins Best in Show. ${win.owner} cries a little.`); rep += 2; }
  if (flag) { if (s.found[1].size) { lines.push('You point out the paint. The Grants admit PetCorp "touched him up" for the show instead of treating him. You give them your card. Dr. Sheen leaves early.'); rep += 4; S.flags.wobblesSaved = true; } else { lines.push('You report Sir Wobbles, but you can\'t point to anything. The Grants are offended.'); rep -= 2; } }
  if (expose) { lines.push('You show the committee your photos: the Silk Road Exotics crates, the $90 "voltage drainage" invoices. By evening, the town health board has closed PetCorp Wellness "pending inspection."'); rep += 6; S.flags.petcorpExposed = true; }
  addRep(rep); sfx(rep > 0 ? 'good' : 'bad');
  S.polaroids.push({ pet: `${win.pet} (Best in Show)`, sp: win.sp, ail: 'x', day: 5, room: 'show' });
  openModal(`<h2>The pet show</h2>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}<div class="btns"><button class="primary" data-act="showdone">Back to the fair</button></div>`, 'sticky');
};
ACT.showdone = () => { closeModal(); finishEvent('show'); };

/* ---------- the market stall: sell your remedies ---------- */
function startMarket() {
  G.mk = { i: 0, sold: 0, earned: 0 };
  marketTurn();
}
function marketTurn() {
  const S = G.S, mk = G.mk, c = MARKET[mk.i];
  if (!c) { openModal(`<h2>Market stall</h2><p>You sold ${mk.sold} remedies for ${money(mk.earned)}. Not bad for a folding table.</p><div class="btns"><button class="primary" data-act="mkdone">Pack up</button></div>`, 'sticky'); return; }
  const stock = RECIPES.filter((r) => S.remedies[r.id] > 0);
  const pillOpt = S.supplies.pills > 0 ? `<button class="dx" data-act="mksell" data-k="pills"><b>A pill from your supplies</b><span>You have ${S.supplies.pills}</span></button>` : '';
  openModal(`<h2>Market stall</h2><p class="fine">Customer ${mk.i + 1} of ${MARKET.length}</p><p><b>${esc(c.who)}</b>: “${esc(c.line)}”</p>
    ${stock.map((r) => `<button class="dx" data-act="mksell" data-k="${r.id}"><b>${r.name}</b><span>${r.note} You have ${S.remedies[r.id]}.</span></button>`).join('')}${pillOpt}
    <button class="dx" data-act="mksell" data-k="none"><b>“Sorry, nothing for that today.”</b><span></span></button>`, 'sticky');
}
ACT.mksell = (ds) => {
  const S = G.S, mk = G.mk, c = MARKET[mk.i], k = ds.k;
  const right = k === c.want || (c.want === 'pill' && (k === 'pills' || k === 'ward'));
  if (k === 'none') { toast('They wander off to the next stall.'); }
  else {
    if (k === 'pills') S.supplies.pills--; else S.remedies[k]--;
    if (right) { addMoney(18); addRep(1); mk.sold++; mk.earned += 18; sfx('cash'); toast('Sold! They thank you twice.'); }
    else { addRep(-1); sfx('bad'); toast('They look at the bottle, then at you. "That\'s not what I asked for."'); }
  }
  mk.i++; marketTurn();
};
ACT.mkdone = () => { closeModal(); finishEvent('market'); };

/* ---------- house calls ---------- */
function startCalls(i) {
  const S = G.S, hc = HOUSECALLS[i];
  if (!hc) return finishEvent('calls');
  const uid = S.nextId++;
  const p = makePatient({ ail: hc.ail, pet: hc.pet, owner: hc.owner, say: hc.say, id: hc.id }, S.seed + uid * 31); p.uid = uid; p.chart = hc.pet + '|' + hc.owner;
  S.minute = 11 * 60 + i * 120;
  setScreen(examScreen(p, { room: hc.place, theme: THEMES.fluoro, houseCall: true, after: () => startCalls(i + 1) }));
  toast(hc.place === 'cards' ? 'You squeeze in behind the counter at Lou\'s Cards.' : 'Lucky Strike Lanes. Lane 6 is glowing purple.');
}

/* ---------- Saturday evening: adoptions, then the end ---------- */
ACT.satevening = () => {
  const S = G.S, ready = S.kennel.filter((k) => k.stray);
  if (ready.length && !S.flags.adoptDone) return adoptionModal(0);
  finale();
};
function adoptionModal(i) {
  const S = G.S, fosters = S.kennel.filter((k) => k.stray), k = fosters[i];
  if (!k) { S.flags.adoptDone = true; save(); return finale(); }
  const st = STRAYS[k.id];
  if ((k.careCount || 0) < 2) {
    openModal(`<h2>Adoption booth</h2><p>${esc(k.pet)} is still shy. Foster them a little longer (care for them at least two evenings) before they're ready.</p><div class="btns"><button class="primary" data-act="adoptnext" data-i="${i + 1}">OK</button></div>`, 'sticky');
    return;
  }
  openModal(`<h2>Adoption booth</h2><p><b>${esc(k.pet)}</b> (${spName(k.sp)}). ${esc(st.note)}</p><p class="fine">Who should take ${esc(k.pet)} home?</p>
    ${ADOPTERS.filter((a) => !S.flags['adopted_' + a.id]).map((a) => `<button class="dx" data-act="adopt" data-i="${i}" data-a="${a.id}"><b>${esc(a.name)}</b><span>${esc(a.blurb)}</span></button>`).join('')}
    <button class="dx" data-act="adoptnext" data-i="${i + 1}"><b>Keep fostering for now</b><span></span></button>`, 'sticky');
}
ACT.adoptnext = (ds) => { closeModal(); adoptionModal(+ds.i); };
ACT.adopt = (ds) => {
  const S = G.S, fosters = S.kennel.filter((k) => k.stray), k = fosters[+ds.i], a = ADOPTERS.find((q) => q.id === ds.a), st = STRAYS[k.id];
  closeModal();
  S.flags['adopted_' + a.id] = true;
  if (a.home === st.likes) { addRep(4); S.stats.adopted++; S.polaroids.push({ pet: `${k.pet}, adopted`, sp: k.sp, ail: 'x', day: 5 }); sfx('good'); toast(`${a.name} and ${k.pet} are a perfect match.`, 3500); S.kennel = S.kennel.filter((q) => q !== k); }
  else { addRep(-2); sfx('bad'); toast(a.home === 'lights' && st.likes === 'dark' ? `By evening, ${k.pet} has been staring at the disco ball for four hours. Darlene brings them back.` : `It's not a good fit. ${a.name} brings ${k.pet} back before dark.`, 4000); }
  save();
  adoptionModal(+ds.i + (a.home === st.likes ? 0 : 1));
};

function finale() {
  const S = G.S; S.phase = 'final'; save();
  setScreen(hubScreen('final'));
  setTimeout(() => { if (G.scr && G.scr.mode === 'final') { sfx('knock'); buzz(150); } }, 2500);
}
G.finalPanel = function finalPanel() {
  const S = G.S, st = S.stats, lines = [];
  lines.push(S.flags.rentPaid ? 'The rent is paid.' : `You still owe Mr. Grubb ${money(S.flags.rentShort || RENT)}, "with interest."`);
  if (S.flags.hatched) lines.push('Pebs the Gutterdrake is home with Tobi, sneezing smoke rings at the Neon Bastion high score screen.');
  if (S.flags.petcorpExposed) lines.push('PetCorp Wellness is closed "pending inspection." Their sign is still humming, but the doors are chained.');
  else if (S.flags.wobblesSaved) lines.push('PetCorp is still open, but the whole town heard about Sir Wobbles.');
  if (S.flags.vanceReported) lines.push('Eleven smuggled Mothhounds are safe, and Mr. Vance won\'t be back.');
  else if (S.flags.vanceQuiet) lines.push('Mr. Vance\'s envelope is still in your drawer.');
  if (st.adopted) lines.push(`${st.adopted} foster${st.adopted > 1 ? 's' : ''} found a home.`);
  return `<h2>Saturday night</h2>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}
    <p class="quote">You're turning off the lights when you hear it: three slow knocks. From the basement door.</p>
    <p>The padlock is glowing.</p><p class="fine">To be continued.</p>
    <h3>Your first week</h3>
    <div class="summary"><span>Cured <b>${st.cured}</b></span><span>Wrong calls <b>${st.wrong}</b></span><span>Didn't take <b>${st.botched}</b></span><span>Walked out <b>${st.left}</b></span><span>Money <b>${money(S.money)}</b></span><span>Reputation <b>${Math.round(S.rep)}</b></span></div>
    <p class="fine">${S.integrity >= 1 ? 'You kept your hands clean this week.' : S.integrity <= -2 ? 'Some of this week\'s money will be hard to explain.' : 'You cut a corner or two.'}</p>
    <div class="btns"><button data-act="casebook">Casebook and photos</button><button class="primary" data-act="newgame">Play the week again</button></div>
    <p class="fine">Thanks for playing the demo. Tell Claude what you think!</p>`;
};
