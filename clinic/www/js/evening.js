// Evenings: walking the town, brewing remedies, fostering strays, and the knock after dark.
import { clamp } from './util.js';
import { THEMES } from './themes.js';
import { AILMENTS, INGREDIENTS, RECIPES, METHODS } from './data.js';
import { WEEK, PLACES, TOWN_EVENTS, STRAYS } from './story.js';
import { makePatient } from './patient.js';
import { TOW, TOH, renderTown } from './town.js';
import { makeMinigame } from './minigames.js';
import { sfx, buzz, music, ambience } from './audio.js';
import { G, ACT, esc, money, save, setScreen, renderPanel, toast, openModal, closeModal, addMoney, addRep } from './core.js';
import { examScreen, minigameScreen } from './examflow.js';
import { hubScreen } from './day.js';

/* ================================================================== the town at night */
function townScreen() {
  const S = G.S, d = WEEK[S.day];
  const s = {
    kind: 'town', w: TOW, h: TOH, fps: 24, cam: -150, sel: 'park', hits: [], drag: null, keepScroll: false,
    enter() { music('town'); ambience(d.weather === 'rain' ? 'rain' : 'night'); },
    draw(fb, t) {
      if (!s.drag) { const p = PLACES.find((q) => q.id === s.sel); if (p) s.cam += (p.x - s.cam) * 0.08; }
      s.hits = renderTown(fb, t, THEMES.night, { cam: s.cam, sel: s.sel, visited: new Set(S.visited), rain: d.weather === 'rain' });
    },
    pointer(type, x, y, ptr) {
      if (type === 'down') s.drag = { x, cam: s.cam };
      if (type === 'move' && s.drag && ptr && ptr.moved) s.cam = clamp(s.drag.cam - (x - s.drag.x) * 1.3, -170, 290);
      if (type === 'up') { if (s.drag && ptr && ptr.moved) { const near = PLACES.reduce((a, p) => (Math.abs(p.x - s.cam) < Math.abs(a.x - s.cam) ? p : a)); s.sel = near.id; renderPanel(); } s.drag = null; }
      if (type === 'tap') { const h = s.hits.find((hh) => x >= hh.x0 && x <= hh.x1 && y > 24); if (h) { s.sel = h.id; sfx('tap'); renderPanel(); } }
    },
    panel() {
      const p = PLACES.find((q) => q.id === s.sel), been = S.visited.includes(p.id);
      return `<h2>${d.name} night</h2>
        <div class="tabs">${PLACES.map((q) => `<button class="tool ${q.id === s.sel ? 'on' : ''}" data-act="place" data-k="${q.id}">${q.name}${S.visited.includes(q.id) ? ' ✓' : ''}</button>`).join('')}</div>
        <div class="placecard"><b>${p.name}</b><p>${p.blurb}</p></div>
        <p class="fine">Stops left tonight: <b>${S.energy}</b>.</p>
        <div class="btns"><button data-act="homeward">Head back to the clinic</button><button class="primary" data-act="visit" ${S.energy && !been ? '' : 'disabled'}>${been ? 'Already been tonight' : 'Go in'}</button></div>`;
    },
  };
  return s;
}
ACT.town = () => { if (G.S.energy <= 0) return; setScreen(townScreen()); };
ACT.place = (ds) => { G.scr.sel = ds.k; renderPanel(); };
ACT.homeward = () => setScreen(hubScreen('evening'));
ACT.visit = () => {
  const S = G.S, s = G.scr, id = s.sel; if (S.energy <= 0 || S.visited.includes(id)) return;
  const done = S.townDone || (S.townDone = {});
  const list = TOWN_EVENTS[id] || [];
  const ok = (e, i) => (e.day == null || e.day === S.day) && (!e.needs || S.flags[e.needs]) && !(e.once && done[id + i]) && !(e.stray && S.kennel.some((k) => k.id === e.stray)) && !(e.page && S.pages[e.page]) && !(e.clue && S.clues[e.clue]);
  // a story event for today first, then anything not yet found, then the everyday ones
  let idx = list.findIndex((e, i) => e.day === S.day && ok(e, i));
  if (idx < 0) idx = list.findIndex((e, i) => (e.page || e.clue || e.once) && ok(e, i));
  if (idx < 0) idx = list.findIndex((e, i) => ok(e, i) && !e.day);
  if (idx < 0) idx = 0;
  const e = list[idx];
  S.energy--; S.visited.push(id); if (e.once) done[id + idx] = true;
  const got = [];
  if (e.cost) { addMoney(-e.cost); got.push(`-${money(e.cost)}`); }
  if (e.gives) for (const [k, n] of Object.entries(e.gives)) { S.ingredients[k] = (S.ingredients[k] || 0) + n; got.push(`+${n} ${INGREDIENTS[k].name.toLowerCase()}`); }
  if (e.page) { S.pages[e.page] = true; got.push(`Handbook page restored: ${AILMENTS[e.page].name}`); }
  if (e.clue) { S.clues[e.clue] = true; got.push('PetCorp evidence: ' + Object.keys(S.clues).length + ' of 3'); }
  if (e.stray) {
    const st = STRAYS[e.stray], cap = 3 + (S.equipment.isolation ? 1 : 0);
    if (S.kennel.length < cap) { S.kennel.push({ id: e.stray, stray: true, pet: st.name, sp: st.sp, owner: 'you', careCount: 0, cared: false, need: 99, nights: 0 }); got.push(`${st.name} is now fostering in your kennels`); }
    else got.push('The kennels are full, so you leave a bowl of water and promise to come back.');
  }
  sfx(e.page || e.clue ? 'clue' : 'page'); save();
  openModal(`<h2>${PLACES.find((p) => p.id === id).name}</h2><p>${esc(e.text)}</p>${got.length ? `<ul class="notes">${got.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}<div class="btns"><button class="primary" data-act="close">Back to the street</button></div>`);
  renderPanel();
};

/* ================================================================== brewing */
function labPanel() {
  const S = G.S;
  const have = (k) => S.ingredients[k] || 0;
  return `<h2>Brewing</h2><p class="fine">Each brew takes one of tonight's stops. Remedies keep.</p>
    <div class="supplies">${Object.entries(INGREDIENTS).map(([k, v]) => `<span class="${have(k) ? '' : 'out'}">${v.name} <b>${have(k)}</b></span>`).join('')}</div>
    ${RECIPES.map((r) => { const can = r.needs.every((k) => have(k) > 0) && S.energy > 0; return `<div class="row"><span><b>${r.name}</b> · ${r.needs.map((k) => INGREDIENTS[k].name.toLowerCase()).join(' + ')} · ${METHODS[r.method].toLowerCase()}<br><small>${r.note} You have ${S.remedies[r.id] || 0}.</small>${r.needs.filter((k) => !have(k)).map((k) => `<br><small class="warn">Need ${INGREDIENTS[k].name.toLowerCase()} (from ${INGREDIENTS[k].where})</small>`).join('')}</span><button data-act="brew" data-k="${r.id}" ${can ? '' : 'disabled'}>Brew</button></div>`; }).join('')}
    ${S.remedies.smoke > 0 ? '<div class="btns"><button data-act="smoke">Burn mite smoke in the kennels tonight</button></div>' : ''}
    <div class="btns"><button class="primary" data-act="labdone">Done</button></div>`;
}
ACT.lab = () => { setScreen({ kind: 'lab', w: 192, h: 108, fps: 24, back: G.scr, enter() { music('night'); }, draw(fb, t) { G.labDraw(fb, t); }, panel: labPanel }); };
ACT.labdone = () => setScreen(hubScreen('evening'));
ACT.brew = (ds) => {
  const S = G.S, r = RECIPES.find((q) => q.id === ds.k); if (!r || S.energy <= 0) return;
  for (const k of r.needs) S.ingredients[k]--;
  S.energy--;
  const g = makeMinigame('brew', { th: THEMES.night, method: r.method, sfx, buzz });
  setScreen(minigameScreen(g, { name: `Brewing ${r.name.toLowerCase()}`, how: r.method === 'grind' ? 'Tap in time with the rings to grind it evenly.' : 'Hold to turn up the heat, let go to cool. Keep it in the green band.' }, (score) => {
    const n = score >= 0.85 ? 2 : score >= 0.4 ? 1 : 0;
    S.remedies[r.id] = (S.remedies[r.id] || 0) + n; save();
    ACT.lab();
    toast(n ? `You brewed ${n} ${r.name.toLowerCase()}${n > 1 ? ' (a perfect batch)' : ''}.` : 'The batch burned. The ingredients are gone.', 3500);
    sfx(n ? 'brew' : 'bad');
  }));
};
ACT.smoke = () => { const S = G.S; if (!S.remedies.smoke) return; S.remedies.smoke--; S.flags.smoke = true; toast('The kennels fill with a sharp, herby smoke. Nothing will spread tonight.'); save(); renderPanel(); };

/* ================================================================== the knock after dark */
G.knock = () => {
  const S = G.S, d = WEEK[S.day];
  if (!d.afterHours || S.afterDone || G.scr.kind !== 'hub') { S.afterPending = false; return; }
  sfx('knock'); buzz(120);
  openModal(`<h2>A knock at the door</h2><p>It's after dark. Someone is knocking at the clinic door. Three slow knocks, then a voice: “Please. I saw your light.”</p>
    <div class="btns"><button data-act="ignoreknock">Pretend you're not here</button><button class="primary" data-act="answer">Answer it</button></div>`, 'sticky');
};
ACT.ignoreknock = () => { const S = G.S; S.afterDone = true; S.afterPending = false; closeModal(); toast('The knocking stops. Footsteps fade down the street.'); save(); };
ACT.answer = () => {
  const S = G.S, d = WEEK[S.day], uid = S.nextId++;
  S.afterDone = true; S.afterPending = false; closeModal();
  const p = makePatient({ ...d.afterHours, id: 'after' + S.day }, S.seed + uid * 31); p.uid = uid; p.chart = p.pet + '|' + p.owner;
  S.minute = 20 * 60;
  setScreen(examScreen(p, { cursed: true, theme: THEMES.cursed, after: () => { save(); setScreen(hubScreen('evening')); } }));
};
