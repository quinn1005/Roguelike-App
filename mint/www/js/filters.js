// One filter-and-sort bar for every screen where you pick cards from your binder: selling to
// Lou, trade night, consigning at the auction, sending to Apex. Settings are remembered per
// screen for the rest of the session.
import { LINES, CARDS, RARITY_NAME } from './data.js';
import { cardValue, cardTitle } from './gen.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const STATE = {};
const RANK = { c: 0, u: 1, r: 2, m: 3 };
const defOf = (i) => CARDS[i.line].find((c) => c.n === i.n);
const isChase = (v) => Object.keys(v || {}).some((k) => v[k] && k !== 'holo');

const SORTS = {
  value: ['Value: high to low', (a, b) => cardValue(b) - cardValue(a)],
  cheap: ['Value: low to high', (a, b) => cardValue(a) - cardValue(b)],
  set: ['Set and number', (a, b) => (a.line === b.line ? a.n - b.n : LINES[a.line].name.localeCompare(LINES[b.line].name))],
  name: ['Name A to Z', (a, b) => cardTitle(a).localeCompare(cardTitle(b))],
  rarity: ['Rarity: rarest first', (a, b) => RANK[defOf(b).r] - RANK[defOf(a).r] || cardValue(b) - cardValue(a)],
  newest: ['Newest first', null],
};
const SHOW = {
  all: 'Everything', holo: 'Holos', chase: 'Chase versions', slab: 'Slabs', raw: 'Raw cards', spare: 'Spares (duplicates)',
};

// Spare copies: every copy of a card except the most valuable one.
export function spareUids(collection) {
  const g = {};
  collection.forEach((i) => { (g[i.line + ':' + i.n] ||= []).push(i); });
  return new Set(Object.values(g).flatMap((list) => list.sort((a, b) => cardValue(b) - cardValue(a)).slice(1).map((i) => i.uid)));
}

// key: which screen (settings are kept per screen). spares: optional set of spare uids, which
// adds the "Spares" view. Returns { mount(bar, grid, list, { render, wire }) , refresh() }.
export function cardFilter(key, { spares = null, sort = 'value' } = {}) {
  const st = (STATE[key] ||= { q: '', line: 'all', rar: 'all', show: 'all', sort });
  let mounted = null;
  const apply = (list) => {
    const q = st.q.trim().toLowerCase();
    const idx = new Map(list.map((i, k) => [i, k]));
    return list.filter((i) => {
      if (st.line !== 'all' && i.line !== st.line) return false;
      if (st.rar !== 'all' && defOf(i).r !== st.rar) return false;
      if (st.show === 'holo' && !i.v.holo) return false;
      if (st.show === 'chase' && !isChase(i.v)) return false;
      if (st.show === 'slab' && !i.slab) return false;
      if (st.show === 'raw' && i.slab) return false;
      if (st.show === 'spare' && !(spares && spares.has(i.uid))) return false;
      if (q && !(cardTitle(i).toLowerCase().includes(q) || LINES[i.line].name.toLowerCase().includes(q))) return false;
      return true;
    }).sort(SORTS[st.sort][1] || ((a, b) => idx.get(b) - idx.get(a)));
  };
  const bar = (list) => {
    const lines = [...new Set(list.map((i) => i.line))];
    if (st.line !== 'all' && !lines.includes(st.line)) st.line = 'all';
    const opt = (v, label, cur) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${esc(label)}</option>`;
    return `<div class="cfilter">
      <input type="search" class="cf-q" placeholder="Search by name or set" value="${esc(st.q)}" aria-label="Search cards">
      <div class="cf-row">
        <select class="cf-line" aria-label="Set">${opt('all', 'All sets', st.line)}${lines.map((l) => opt(l, LINES[l].name, st.line)).join('')}</select>
        <select class="cf-rar" aria-label="Rarity">${opt('all', 'Any rarity', st.rar)}${['m', 'r', 'u', 'c'].map((r) => opt(r, RARITY_NAME[r], st.rar)).join('')}</select>
        <select class="cf-show" aria-label="Show">${Object.entries(SHOW).filter(([k]) => k !== 'spare' || spares).map(([k, l]) => opt(k, l, st.show)).join('')}</select>
        <select class="cf-sort" aria-label="Sort">${Object.entries(SORTS).map(([k, [l]]) => opt(k, l, st.sort)).join('')}</select>
      </div>
      <div class="cf-foot"><span class="cf-count mono"></span><button type="button" class="cf-reset" ${st.q || st.line !== 'all' || st.rar !== 'all' || st.show !== 'all' ? '' : 'hidden'}>Clear filters</button></div>
    </div>`;
  };
  const redraw = () => {
    if (!mounted) return;
    const { barEl, gridEl, list, render, wire } = mounted;
    const out = apply(list);
    gridEl.innerHTML = out.length ? render(out) : `<p style="color:var(--muted);margin:0">${list.length ? 'No cards match these filters.' : 'Nothing here yet.'}</p>`;
    barEl.querySelector('.cf-count').textContent = `${out.length} of ${list.length} ${list.length === 1 ? 'card' : 'cards'}`;
    barEl.querySelector('.cf-reset').hidden = !(st.q || st.line !== 'all' || st.rar !== 'all' || st.show !== 'all');
    if (wire) wire(gridEl);
  };
  return {
    mount(barEl, gridEl, list, { render, wire }) {
      mounted = { barEl, gridEl, list, render, wire };
      barEl.innerHTML = bar(list);
      const q = barEl.querySelector('.cf-q');
      q.addEventListener('input', () => { st.q = q.value; redraw(); });
      [['.cf-line', 'line'], ['.cf-rar', 'rar'], ['.cf-show', 'show'], ['.cf-sort', 'sort']].forEach(([sel, k]) => {
        barEl.querySelector(sel).addEventListener('change', (e) => { st[k] = e.target.value; redraw(); });
      });
      barEl.querySelector('.cf-reset').addEventListener('click', () => { Object.assign(st, { q: '', line: 'all', rar: 'all', show: 'all' }); barEl.innerHTML = bar(list); this.mount(barEl, gridEl, list, { render, wire }); });
      redraw();
    },
    refresh: redraw,
  };
}
