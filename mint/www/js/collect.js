// Deeper collecting: Apex Grading (mail-in slabs and disputes) and the Saturday auction.
import { LINES, CARDS } from './data.js';
import { cardSVG } from './cardsvg.js';
import { makeRng, makeInst, pickCard, rollVariants, makeFake, cardValue, cardTitle, variantLabels, blankInst, marketNow } from './gen.js';
import { trueGrade } from './grading.js';
import { slabHTML } from './slab.js';
import { apexSVG, auctionSVG } from './scenes.js';

let X = null; // shared helpers from game.js
export function initCollect(ctx) { X = ctx; }
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

// ------------------------------------------------------------------ Apex Grading
const apexFee = () => (marketNow() > 1.3 ? 15 : 12);

export function showApex() {
  const S = X.S();
  X.setScene('apex');
  const root = X.locScreen('loc-apex', apexSVG(), `${X.eveClock()} · APEX GRADING, MILL STREET`, 'The Apex counter', 'Clerk', pickLine([
    '"Three cards per visit. Two business days. No, we don\'t do rush."',
    '"Apex grades are final. Unless you pay for a review. Then they\'re final again."',
    '"Gemline? Oh. You\'re one of them." The clerk smiles like it costs money.',
  ]));
  $('#leave').onclick = () => { X.save(); X.leaveTo(); };
  const draw = () => {
    const ready = S.apex.filter((a) => a.due <= S.day);
    const waiting = S.apex.filter((a) => a.due > S.day);
    const sendable = S.collection.filter((i) => !i.slab && !i.fake && !i.atApex);
    let picked = new Set();
    root.innerHTML = `<p style="margin:0;color:var(--muted)">Cash ${X.money(S.money)}. Fee ${X.money(apexFee())} a card. Slabbed cards sell for far more than raw ones, if the grade is good.</p>
      ${ready.length ? `<h3 class="sub-h">Ready to collect</h3><button class="btn primary" id="collectAll">Collect ${ready.length} slab${ready.length > 1 ? 's' : ''}</button>` : ''}
      ${waiting.length ? `<p style="margin:0;color:var(--muted)">${waiting.length} card${waiting.length > 1 ? 's' : ''} still being graded.</p>` : ''}
      <h3 class="sub-h">Your Apex slabs</h3>
      <div class="cardgrid slabgrid">${S.collection.filter((i) => i.slab && i.slab.by === 'apex').map((i) => `<button class="cardcell" data-sl="${i.uid}">${slabHTML(i, { grade: i.slab.grade, by: 'apex' })}<span>${i.slab.disputed ? 'Reviewed' : 'Dispute ' + X.money(8)}</span></button>`).join('') || '<p style="color:var(--muted)">None yet.</p>'}</div>
      <h3 class="sub-h">Send cards (up to 3)</h3>
      <div class="cardgrid">${sendable.map((i) => `<button class="cardcell" data-send="${i.uid}">${cardSVG(i)}<span>${X.esc(cardTitle(i))}</span></button>`).join('') || '<p style="color:var(--muted)">No raw cards to send.</p>'}</div>
      <div class="row"><button class="btn primary" id="send" disabled>Send for grading</button></div>`;
    const sendBtn = $('#send');
    $$('[data-send]', root).forEach((b) => b.onclick = () => {
      const id = b.dataset.send;
      if (picked.has(id)) picked.delete(id); else if (picked.size < 3) picked.add(id);
      b.classList.toggle('picked', picked.has(id));
      const cost = picked.size * apexFee();
      sendBtn.disabled = !picked.size || S.money < cost;
      sendBtn.textContent = picked.size ? `Send ${picked.size} for ${X.money(cost)}` : 'Send for grading';
    });
    sendBtn.onclick = () => {
      const cost = picked.size * apexFee();
      S.money -= cost;
      picked.forEach((id) => { const i = S.collection.find((x) => x.uid === id); i.atApex = true; S.apex.push({ uid: id, due: S.day + 2 }); });
      X.sfx('cash'); X.toast(`Sent. Ready on ${X.dayName(S.day + 2)}.`, 'good'); X.save(); draw();
    };
    const c = $('#collectAll');
    if (c) c.onclick = () => {
      const R = makeRng(Date.now() % 1e9);
      const boom = marketNow() > 1.3;
      ready.forEach((a) => {
        const i = S.collection.find((x) => x.uid === a.uid);
        if (!i) return;
        const t = trueGrade(i);
        let g = t;
        if (R() < (boom ? 0.45 : 0.3)) g = Math.max(1, Math.min(10, t + R.pick(boom ? [0.5, 0.5, 1, -0.5] : [0.5, -0.5, 1, -1])));
        i.slab = { grade: g, by: 'apex', cert: 'AX' + String(Math.floor(R() * 1e6)).padStart(6, '0') };
        delete i.atApex;
      });
      S.apex = S.apex.filter((a) => a.due > S.day);
      X.sfx('collect'); X.checkSets(); X.save(); draw();
    };
    $$('[data-sl]', root).forEach((b) => b.onclick = () => dispute(S.collection.find((x) => x.uid === b.dataset.sl), draw));
  };
  draw();
}

function dispute(inst, redraw) {
  const S = X.S();
  const m = X.modal(`<h2>Dispute this grade?</h2>${slabHTML(inst, { grade: inst.slab.grade, by: 'apex' })}
    <p>Apex will re-examine it for ${X.money(8)}. If they got it wrong, they fix the grade and refund you. If they didn't, the fee is gone.</p>
    <p class="mono" style="color:var(--muted);font-size:12px">Your own estimate: about ${trueGrade(inst)}</p>
    <div class="row"><button class="btn" data-x>Leave it</button><button class="btn primary" data-y ${inst.slab.disputed || S.money < 8 ? 'disabled' : ''}>Pay ${X.money(8)} and dispute</button></div>`);
  $('[data-x]', m).onclick = () => m.close();
  $('[data-y]', m).onclick = () => {
    const t = trueGrade(inst);
    inst.slab.disputed = true;
    if (t !== inst.slab.grade) { const old = inst.slab.grade; inst.slab.grade = t; X.toast(`Apex corrected ${old} to ${t}. Fee refunded.`, 'good'); X.achieve('apex'); }
    else { S.money -= 8; X.toast('Apex stands by its grade. Fee kept.', 'bad'); }
    X.save(); m.close(); redraw();
  };
}

// ------------------------------------------------------------------ Saturday auction
const BIDDERS = ['Mr. Castellano', 'a man in a camel coat', 'Lou, from the back row', 'an Apex buyer', 'a phone bidder', 'the woman with the gold pen', 'Dot, surprisingly'];

function makeLots(S, week) {
  const R = makeRng(S.seed + week * 977);
  const lots = [];
  const lines = Object.keys(LINES).filter((l) => LINES[l].unlock <= S.day);
  // A slab you graded yourself, which may not be what you said it was.
  if (S.graded && S.graded.length) {
    const g = R.pick(S.graded);
    const inst = JSON.parse(JSON.stringify(g.inst));
    inst.slab = { grade: g.grade, by: 'gemline' };
    lots.push({ inst, note: 'Graded by you, earlier this month.' });
  }
  // Chase cards in Apex slabs.
  for (let k = 0; k < 2; k++) {
    const line = R.pick(lines);
    const c = pickCard(R, line, { c: 1, u: 3, r: 4 });
    const inst = makeInst(R, line, c.n, 'nice');
    rollVariants(R, inst, { scale: 3, fullart: 0.03 });
    inst.slab = { grade: Math.min(10, trueGrade(inst) + R.pick([0, 0, 0.5])), by: 'apex' };
    lots.push({ inst });
  }
  // A counterfeit that fooled Apex.
  const fl = R.pick(lines);
  const fake = makeInst(R, fl, pickCard(R, fl, { c: 1, u: 2, r: 4 }).n, 'gem');
  rollVariants(R, fake, { scale: 3, fullart: 0.03 });
  makeFake(R, fake, { fakeKinds: ['print', 'uv', 'copyright'] }, [R.pick(['print', 'uv', 'copyright'])]);
  fake.slab = { grade: 9, by: 'apex' };
  lots.push({ inst: fake });
  // Week 4: a mystery proof card, if the Ghost Print is still out there.
  if (week === 4 && !S.flags.ghostFound && !S.collection.some((i) => i.v.ghost)) {
    const g = blankInst('bl', 9); g.v.ghost = true; g.dx = 0.4;
    lots.push({ inst: g, note: '"Unknown proof card, blank back, initialed." No estimate.', mystery: true });
  }
  return lots;
}

export function showAuction() {
  const S = X.S();
  X.setScene('auction');
  const week = Math.ceil(S.day / 5);
  if (!S.eve || S.eve.day !== S.day) S.eve = { day: S.day };
  if (!S.eve.lots) S.eve.lots = makeLots(S, week);
  const root = X.locScreen('loc-auction', auctionSVG(), `SATURDAY · THE CORN EXCHANGE`, 'The auction', 'Auctioneer', pickLine([
    '"Lot one, ladies and gentlemen. Let\'s not be shy."',
    '"Cash only, no refunds, and may God have mercy on your wallets."',
  ]));
  $('#leave').onclick = () => { X.save(); X.leaveTo(); };
  const drawList = () => {
    root.innerHTML = `<p style="margin:0;color:var(--muted)">Cash ${X.money(S.money)}. Look closely before you bid: not every slab is honest.</p>
      <div class="cardgrid slabgrid">${S.eve.lots.map((l, k) => `<button class="cardcell ${l.done ? 'done' : ''}" data-lot="${k}" ${l.done ? 'disabled' : ''}>${l.mystery ? cardSVG(l.inst) : slabHTML(l.inst, { grade: l.inst.slab.grade, by: l.inst.slab.by })}<span>Lot ${k + 1}${l.done ? ' · ' + X.esc(l.done) : ''}</span></button>`).join('')}</div>
      <h3 class="sub-h">Consign a card</h3>
      <p style="margin:0;color:var(--muted);font-size:13px">Sell one of yours to the room. The house takes 10%.</p>
      <button class="btn" id="consign">Choose a card to sell</button>`;
    $$('[data-lot]', root).forEach((b) => b.onclick = () => bidLot(S.eve.lots[+b.dataset.lot], drawList));
    $('#consign').onclick = () => consign(drawList);
  };
  drawList();
}

function bidLot(lot, back) {
  const S = X.S();
  const inst = lot.inst;
  const real = lot.mystery ? 600 : (inst.fake ? cardValue({ ...inst, fake: null }) : cardValue(inst));
  const R = makeRng(Date.now() % 1e9);
  const est = Math.max(5, Math.round(real));
  const rivals = [0, 1, 2].map(() => ({ name: R.pick(BIDDERS), max: Math.round(est * R.range(0.55, lot.mystery ? 0.9 : 1.3)) }));
  let bid = Math.max(2, Math.round(est * 0.3)), leader = null, timeLeft = 7, alive = true;
  const step = () => Math.max(1, Math.round(bid * 0.1 / 5) * 5 || 1);
  const m = X.modal(`<div class="auction">
      <div class="lot-view">${lot.mystery ? cardSVG(inst) : slabHTML(inst, { grade: inst.slab.grade, by: inst.slab.by })}</div>
      <div class="lot-info"><p class="mono" style="margin:0;color:var(--muted)">${lot.mystery ? 'No estimate' : `Estimate ${X.money(est * 0.7)}–${X.money(est * 1.3)}`}</p>
        ${lot.note ? `<p style="margin:0">${X.esc(lot.note)}</p>` : ''}
        <div class="bidnow"><span>Current bid</span><b id="bid"></b><small id="leader"></small></div>
        <div class="timer"><div id="tfill"></div></div>
        <div class="row"><button class="btn primary" id="bidBtn"></button><button class="btn" id="look">Look closer</button><button class="btn" id="pass">Pass</button></div></div>
    </div>`, { wide: true, dismiss: false });
  const draw = () => {
    $('#bid', m).textContent = X.money(bid);
    $('#leader', m).textContent = leader ? (leader === 'you' ? 'You are winning' : `${leader} is winning`) : 'No bids yet';
    $('#bidBtn', m).textContent = `Bid ${X.money(bid + step())}`;
    $('#bidBtn', m).disabled = S.money < bid + step() || leader === 'you';
    $('#tfill', m).style.transform = `scaleX(${Math.max(0, timeLeft / 7)})`;
  };
  const finish = (sold) => {
    alive = false; clearInterval(iv);
    if (sold && leader === 'you') {
      S.money -= bid; delete inst.mystery;
      S.collection.push(inst);
      lot.done = 'Won for ' + X.money(bid);
      X.sfx('impact'); X.toast(`Yours for ${X.money(bid)}.`, 'good'); X.achieve('auction');
      if (inst.v.ghost) { S.flags.ghostFound = true; X.achieve('ghost'); }
      X.checkSets();
    } else lot.done = leader && leader !== 'you' ? `Sold to ${leader}` : 'Passed';
    X.save(); m.close(); back();
  };
  $('#bidBtn', m).onclick = () => { bid += step(); leader = 'you'; timeLeft = 7; X.sfx('ui'); draw(); };
  $('#pass', m).onclick = () => finish(false);
  $('#look', m).onclick = () => X.viewer(inst, { hideInfo: true, tools: true });
  let tick = 0;
  const iv = setInterval(() => {
    if (!alive) return;
    if (document.querySelector('.modal .viewer')) return; // pause while inspecting
    timeLeft -= 0.25; tick++;
    if (tick % 6 === 0) {
      const r = rivals.filter((x) => x.max >= bid + step() && x.name !== leader);
      if (r.length && Math.random() < 0.75) { const who = r[Math.floor(Math.random() * r.length)]; bid += step(); leader = who.name; timeLeft = Math.max(timeLeft, 4); X.sfx('tool'); }
    }
    draw();
    if (timeLeft <= 0) { X.sfx('stamp'); finish(true); }
  }, 250);
  draw();
}

function consign(back) {
  const S = X.S();
  const list = S.collection.filter((i) => !i.atApex && cardValue(i) >= 2).sort((a, b) => cardValue(b) - cardValue(a));
  const m = X.modal(`<h2>Consign a card</h2><div class="cardgrid">${list.map((i) => `<button class="cardcell" data-c="${i.uid}">${i.slab ? slabHTML(i, { grade: i.slab.grade, by: i.slab.by }) : cardSVG(i)}<span class="price">≈ ${X.money(cardValue(i))}</span></button>`).join('') || '<p>Nothing worth the room\'s time.</p>'}</div><button class="btn" data-x>Close</button>`, { wide: true });
  $('[data-x]', m).onclick = () => m.close();
  $$('[data-c]', m).forEach((b) => b.onclick = () => {
    const i = S.collection.find((x) => x.uid === b.dataset.c);
    const price = Math.round(cardValue(i) * (0.85 + Math.random() * 0.5) * 0.9);
    S.collection.splice(S.collection.indexOf(i), 1);
    S.money += price;
    X.sfx('stamp'); setTimeout(() => X.sfx('cash'), 250);
    X.toast(`"Sold!" ${cardTitle(i)} goes for ${X.money(price)} after the house cut.`, 'good');
    X.save(); m.close(); back();
  });
}

const pickLine = (a) => a[Math.floor(Math.random() * a.length)];
