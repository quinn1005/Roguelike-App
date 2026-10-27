// DOM user interface: menus, meta screens, HUD, tower panel and choice modals.

import { el, fmt, pct } from './util.js';
import { TOWERS, TOWER_ORDER, LEVELS, ENEMIES, BOSSES, COMBOS, RARITY, DTYPE_NAME, DTYPE_COLOR, CHUNK_MODS, AUGMENTS } from './defs.js';
import {
  meta, saveMeta, TREES, towerTree, COMMANDERS, ACHIEVEMENTS, MAX_HEAT, heatInfo, xpNeed,
  pointsFree, pointsTotal, nodeRank, nodeAvailable, buyNode, respec, loadRun, resetMeta,
} from './meta.js';
import { towerSprites, enemySprite, makeCanvas, uiIcon } from './sprites.js';
import { previewCanvas } from './world.js';
import { sfx, setSfx } from './audio.js';

const $ = (id) => document.getElementById(id);
const ICON = { coin: uiIcon('coin'), heart: uiIcon('heart'), shard: uiIcon('shard'), wave: uiIcon('wave') };
const img = (k) => `<img src="${ICON[k]}" alt="">`;

const enemyIconCache = {};
function enemyIcon(id) {
  if (enemyIconCache[id]) return enemyIconCache[id];
  const s = enemySprite(id, 0);
  const [c, ctx] = makeCanvas(s.width * 3, s.height * 3);
  ctx.drawImage(s, 0, 0, c.width, c.height);
  return (enemyIconCache[id] = c.toDataURL());
}

function button(label, cls, onclick) {
  const b = el('button', 'btn ' + (cls || ''), label);
  b.onclick = (ev) => { ev.stopPropagation(); sfx('click'); onclick(ev); };
  return b;
}

export class UI {
  constructor(app) {
    this.app = app;
    this.screen = $('screen');
    this.modal = $('modal');
    this.panel = $('panel');
    this.hudCache = {};
    $('btn-speed').onclick = () => { sfx('click'); this.cycleSpeed(); };
    $('btn-pause').onclick = () => { sfx('click'); this.showPause(); };
    $('btn-wave').onclick = () => { sfx('click'); this.app.startWave(); };
    $('btn-auto').onclick = () => {
      meta.settings.autoWave = !meta.settings.autoWave; saveMeta();
      $('btn-auto').classList.toggle('on', meta.settings.autoWave);
      if (meta.settings.autoWave) this.app.startWave();
    };
    $('btn-auto').classList.toggle('on', !!meta.settings.autoWave);
  }

  get run() { return this.app.run; }

  // ======================= MENUS =======================
  clearScreen() { this.screen.innerHTML = ''; }

  setInGame(on) {
    for (const id of ['hud', 'towerbar', 'wavectl']) $(id).classList.toggle('hidden', !on);
    $('toasts').innerHTML = '';
    if (!on) {
      for (const id of ['panel', 'towerinfo', 'bossbar', 'placebanner']) $(id).classList.add('hidden');
      this.closeModal();
    }
  }

  showMenu() {
    this.setInGame(false);
    this.clearScreen();
    const saved = loadRun();
    const m = el('div', 'menu');
    const logo = el('div', 'logo', `<h1>NEON<br><span>BASTION</span></h1><div class="sub">ENDLESS TOWER DEFENSE ROGUELIKE</div>`);
    const badge = el('div', 'badge');
    badge.innerHTML = `<span class="c-cyan">LV ${meta.level}</span><div class="xpbar"><div style="width:${(meta.xp / xpNeed(meta.level)) * 100}%"></div></div>
      <span class="c-mag">${img('shard')} ${meta.shards}</span>
      ${pointsFree() > 0 ? `<span class="pts">${pointsFree()} TALENT PTS!</span>` : ''}`;
    const best = el('div', 'badge c-dim', `BEST WAVE ${meta.bestWave} &nbsp; RUNS ${meta.runs}`);
    logo.append(badge, best);
    const col = el('div', 'col');
    if (saved) col.append(button(`CONTINUE (WAVE ${saved.wave + 1})`, 'go', () => this.app.continueRun(saved)));
    col.append(
      button('NEW RUN', saved ? 'hot' : 'go', () => (saved ? this.confirm('Start a new run? Your saved run will be lost.', () => this.showNewRun()) : this.showNewRun())),
      button('TALENTS' + (pointsFree() > 0 ? ' (' + pointsFree() + ')' : ''), pointsFree() > 0 ? 'yel' : '', () => this.showTalents('offense')),
      button('ARMORY', '', () => this.showArmory()),
      button('COMMANDERS', '', () => this.showCommanders()),
      button('CODEX', '', () => this.showCodex('enemies')),
      button('SETTINGS', '', () => this.showSettings()),
    );
    m.append(logo, col);
    this.screen.append(m);
  }

  header(title, extra) {
    const h = el('div', 'scr-head');
    h.append(button('&lt; BACK', '', () => this.showMenu()), el('h2', '', title));
    if (extra) h.append(extra);
    return h;
  }

  confirm(text, yes) {
    this.openModal((box) => {
      box.append(el('h2', '', 'CONFIRM'), el('p', '', text));
      const r = el('div', 'mrow');
      r.append(button('YES', 'red', () => { this.closeModal(); yes(); }), button('NO', '', () => this.closeModal()));
      box.append(r);
    });
  }

  showNewRun() {
    this.clearScreen();
    if (!meta.commanders.includes(meta.commander)) meta.commander = 'vanguard';
    const wrap = el('div');
    const heatCtl = el('div', 'stepper');
    const renderHeat = () => {
      const h = meta.heat, hi = heatInfo(h);
      heatCtl.innerHTML = '';
      heatCtl.append(
        button('-', 'sm', () => { meta.heat = Math.max(0, meta.heat - 1); saveMeta(); renderHeat(); }),
        el('span', h > 0 ? 'c-red' : 'c-dim', `HEAT ${h}/${meta.heatUnlocked}`),
        button('+', 'sm', () => { meta.heat = Math.min(meta.heatUnlocked, meta.heat + 1); saveMeta(); renderHeat(); }),
        el('span', 'c-dim', h ? `ENEMY HP +${Math.round((hi.hp - 1) * 100)}% SPD +${Math.round((hi.speed - 1) * 100)}% REWARDS +${Math.round((hi.reward - 1) * 100)}%` : 'Reach wave 20 to unlock the next Heat level'),
      );
    };
    renderHeat();
    wrap.append(this.header('NEW RUN', heatCtl));
    wrap.append(el('p', 'c-dim', 'CHOOSE YOUR COMMANDER'));
    const grid = el('div', 'grid');
    for (const c of COMMANDERS) {
      if (!meta.commanders.includes(c.id)) continue;
      const it = el('div', 'item' + (meta.commander === c.id ? ' selc' : ''));
      const sig = c.sig ? `<div class="ds">Signature: ${TOWERS[c.sig].name}</div>` : '';
      it.innerHTML = `<div class="grow"><div class="nm" style="color:${c.color}">${c.name}</div><div class="ds">${c.desc}</div>${sig}</div>`;
      it.onclick = () => { sfx('click'); meta.commander = c.id; saveMeta(); this.showNewRun(); };
      grid.append(it);
    }
    wrap.append(grid);
    const r = el('div', 'mrow');
    r.style.marginTop = '12px';
    r.append(button('LAUNCH', 'go', () => this.app.newRun(meta.commander, meta.heat)));
    wrap.append(r);
    this.screen.append(wrap);
  }

  // ---------- talents ----------
  showTalents(tab, towerSel) {
    this.clearScreen();
    const wrap = el('div');
    const pts = el('span', pointsFree() > 0 ? 'pts' : 'c-dim', `POINTS: ${pointsFree()} / ${pointsTotal()}`);
    const rs = button('RESPEC', 'sm red', () => this.confirm('Refund all talent points?', () => { respec(); this.showTalents(tab, towerSel); }));
    const extra = el('div', 'stepper');
    extra.append(pts, rs);
    wrap.append(this.header('TALENTS', extra));
    const tabs = el('div', 'tabs');
    for (const [k, tr] of Object.entries(TREES)) tabs.append(button(tr.name, tab === k ? 'on' : '', () => this.showTalents(k)));
    tabs.append(button('Towers', tab === 'towers' ? 'on' : '', () => this.showTalents('towers', towerSel || 'blaster')));
    wrap.append(tabs);

    let nodes, color;
    if (tab === 'towers') {
      const trow = el('div', 'tabs');
      for (const tid of TOWER_ORDER) {
        const unlocked = meta.unlocked.includes(tid);
        const b = el('button', 'btn sm' + (towerSel === tid ? ' on' : ''), `<img class="px" src="${towerSprites(TOWERS[tid]).iconUrl}" style="width:24px;height:24px;vertical-align:middle;${unlocked ? '' : 'opacity:.3'}">`);
        b.onclick = () => { sfx('click'); this.showTalents('towers', tid); };
        trow.append(b);
      }
      wrap.append(trow);
      const def = TOWERS[towerSel];
      wrap.append(el('p', '', `<span style="color:${def.color}">${def.name}</span> <span class="c-dim">${meta.unlocked.includes(towerSel) ? '' : '(LOCKED - unlock in Armory first)'}</span>`));
      nodes = towerTree(towerSel);
      color = def.color;
      if (!meta.unlocked.includes(towerSel)) nodes = nodes.map((n) => ({ ...n, lockedTower: true }));
    } else {
      nodes = TREES[tab].nodes;
      color = TREES[tab].color;
    }
    wrap.append(this.treeView(nodes, color, () => this.showTalents(tab, towerSel)));
    this.screen.append(wrap);
  }

  treeView(nodes, color, refresh) {
    const tree = el('div', 'tree');
    const tiers = {};
    for (const n of nodes) (tiers[n.tier] = tiers[n.tier] || []).push(n);
    const names = Object.fromEntries(nodes.map((n) => [n.id, n.name]));
    for (const t of Object.keys(tiers).sort()) {
      const col = el('div', 'tier');
      for (const n of tiers[t]) {
        const r = nodeRank(n.id);
        const avail = nodeAvailable(n) && !n.lockedTower;
        const can = avail && r < n.max && pointsFree() > 0;
        const d = el('div', 'node' + (r ? ' has' : '') + (r >= n.max ? ' max' : '') + (!avail ? ' locked' : '') + (can ? ' can' : ''));
        d.style.setProperty('--c', color);
        const next = r < n.max ? n.desc(r + 1) : n.desc(r);
        d.innerHTML = `<div class="nm">${n.name}</div><div class="rk">${r}/${n.max}</div><div class="ds">${r ? 'Now: ' + n.desc(r) + '<br>' : ''}${r < n.max ? 'Next: ' + next : 'MAXED'}</div>`;
        if (!avail && n.req) d.innerHTML += `<div class="rq">Requires ${n.req.map((q) => names[q]).join(n.any ? ' or ' : ' + ')}</div>`;
        d.onclick = () => { if (buyNode(n)) { sfx('pick'); refresh(); } else sfx('click'); };
        col.append(d);
      }
      tree.append(col);
    }
    return tree;
  }

  // ---------- armory ----------
  showArmory() {
    this.clearScreen();
    const wrap = el('div');
    wrap.append(this.header('ARMORY', el('span', 'c-mag', `${img('shard')} ${meta.shards}`)));
    const grid = el('div', 'grid');
    for (const tid of TOWER_ORDER) {
      const d = TOWERS[tid];
      const has = meta.unlocked.includes(tid);
      const it = el('div', 'item' + (has ? '' : ' off'));
      const stats = d.dmg ? `${DTYPE_NAME[d.dtype]} - DMG ${d.dmg} - RNG ${(d.range / 16).toFixed(1)}` : '';
      it.innerHTML = `<img src="${towerSprites(d).iconUrl}"><div class="grow"><div class="nm" style="color:${d.color}">${d.name}</div><div class="ds">${d.desc}</div><div class="ds">${stats}</div>
        <div class="ds">A: ${d.branches.A.name} / B: ${d.branches.B.name}</div></div>`;
      if (!has) {
        const b = button(`${d.unlock}`, meta.shards >= d.unlock ? 'mag sm' : 'sm', () => {
          if (meta.shards < d.unlock) return;
          meta.shards -= d.unlock; meta.unlocked.push(tid); saveMeta(); sfx('upgrade'); this.showArmory();
        });
        b.innerHTML = `${img('shard')} ${d.unlock}`;
        b.querySelector('img').style.cssText = 'width:10px;height:10px';
        it.append(b);
      } else it.append(el('span', 'c-grn', 'OK'));
      grid.append(it);
    }
    wrap.append(grid);
    this.screen.append(wrap);
  }

  // ---------- commanders ----------
  showCommanders() {
    this.clearScreen();
    const wrap = el('div');
    wrap.append(this.header('COMMANDERS', el('span', 'c-mag', `${img('shard')} ${meta.shards}`)));
    const grid = el('div', 'grid');
    for (const c of COMMANDERS) {
      const has = meta.commanders.includes(c.id);
      const it = el('div', 'item' + (meta.commander === c.id ? ' selc' : '') + (has ? '' : ' off'));
      it.innerHTML = `<div class="grow"><div class="nm" style="color:${c.color}">${c.name}</div><div class="ds">${c.desc}</div></div>`;
      if (has) it.append(button(meta.commander === c.id ? 'ACTIVE' : 'SELECT', meta.commander === c.id ? 'on sm' : 'sm', () => { meta.commander = c.id; saveMeta(); this.showCommanders(); }));
      else {
        const b = button('', meta.shards >= c.cost ? 'mag sm' : 'sm', () => {
          if (meta.shards < c.cost) return;
          meta.shards -= c.cost; meta.commanders.push(c.id); meta.commander = c.id; saveMeta(); sfx('upgrade'); this.showCommanders();
        });
        b.innerHTML = `${img('shard')} ${c.cost}`;
        b.querySelector('img').style.cssText = 'width:10px;height:10px';
        it.append(b);
      }
      grid.append(it);
    }
    wrap.append(grid);
    this.screen.append(wrap);
  }

  // ---------- codex ----------
  showCodex(tab) {
    this.clearScreen();
    const wrap = el('div');
    wrap.append(this.header('CODEX'));
    const tabs = el('div', 'tabs');
    for (const [k, n] of [['enemies', 'Enemies'], ['bosses', 'Bosses'], ['combos', 'Combos'], ['augments', 'Augments'], ['achievements', 'Achievements']]) {
      tabs.append(button(n, tab === k ? 'on' : '', () => this.showCodex(k)));
    }
    wrap.append(tabs);
    const grid = el('div', 'grid');
    if (tab === 'enemies') {
      for (const e of Object.values(ENEMIES)) {
        const k = meta.bestiary[e.id] || 0;
        const it = el('div', 'item' + (k ? '' : ' off'));
        it.innerHTML = k
          ? `<img src="${enemyIcon(e.id)}"><div class="grow"><div class="nm">${e.name}</div><div class="ds">${e.desc}</div><div class="ds">Destroyed: ${fmt(k)}</div></div>`
          : `<img src="${enemyIcon(e.id)}" style="filter:brightness(0)"><div class="grow"><div class="nm">???</div><div class="ds">Not yet encountered. Appears from wave ${e.minWave < 999 ? e.minWave : '?'}.</div></div>`;
        grid.append(it);
      }
    } else if (tab === 'bosses') {
      BOSSES.forEach((b, i) => {
        const k = meta.bossKills[b.id] || 0;
        const it = el('div', 'item' + (k ? '' : ' off'));
        it.innerHTML = `<img src="${enemyIcon(b.id)}" ${k ? '' : 'style="filter:brightness(0)"'}><div class="grow"><div class="nm c-red">${k ? b.name : '???'}</div><div class="ds">Wave ${(i + 1) * 10}${k ? ' - ' + b.desc : ''}</div><div class="ds">Destroyed: ${k}</div></div>`;
        grid.append(it);
      });
    } else if (tab === 'combos') {
      for (const c of COMBOS) {
        const it = el('div', 'item');
        it.innerHTML = `<img src="${towerSprites(TOWERS[c.a]).iconUrl}"><img src="${towerSprites(TOWERS[c.b]).iconUrl}"><div class="grow"><div class="nm c-yel">${c.name}</div><div class="ds">${c.desc}</div></div>`;
        grid.append(it);
      }
    } else if (tab === 'augments') {
      for (const a of AUGMENTS) {
        const it = el('div', 'item');
        it.innerHTML = `<div class="grow"><div class="nm" style="color:${RARITY[a.rarity].color}">${a.name}</div><div class="ds">${a.desc}</div></div>`;
        grid.append(it);
      }
    } else {
      for (const a of ACHIEVEMENTS) {
        const got = meta.achievements[a.id];
        const it = el('div', 'item' + (got ? '' : ' off'));
        it.innerHTML = `<div class="grow"><div class="nm ${got ? 'c-grn' : ''}">${got ? 'OK ' : ''}${a.name}</div><div class="ds">${a.desc}</div></div><span class="c-mag">+${a.shards}</span>`;
        grid.append(it);
      }
    }
    wrap.append(grid);
    this.screen.append(wrap);
  }

  showSettings() {
    this.clearScreen();
    const wrap = el('div');
    wrap.append(this.header('SETTINGS'));
    const col = el('div', 'evopts');
    col.append(
      button('SOUND: ' + (meta.settings.sfx ? 'ON' : 'OFF'), '', () => { meta.settings.sfx = !meta.settings.sfx; setSfx(meta.settings.sfx); saveMeta(); this.showSettings(); }),
      button('SCREEN SHAKE: ' + (meta.settings.shake ? 'ON' : 'OFF'), '', () => { meta.settings.shake = !meta.settings.shake; saveMeta(); this.showSettings(); }),
      button('FULLSCREEN', '', () => this.app.fullscreen()),
      button('RESET ALL PROGRESS', 'red', () => this.confirm('Erase ALL progress, unlocks and talents? This cannot be undone.', () => { resetMeta(); this.showMenu(); })),
    );
    wrap.append(col);
    wrap.append(el('p', 'c-dim', '<br>Pinch or scroll to zoom. Drag to pan. Tap a tower in the bar, then tap a tile twice to build.'));
    this.screen.append(wrap);
  }

  // ======================= IN-GAME =======================
  enterRun() {
    this.clearScreen();
    this.setInGame(true);
    this.hudCache = {};
    this.buildTowerBar();
    this.updateWaveButton();
  }

  cycleSpeed() {
    const r = this.run;
    if (!r) return;
    r.speed = r.speed >= 3 ? 1 : r.speed + 1;
    $('btn-speed').textContent = r.speed + 'x';
  }

  buildTowerBar() {
    const bar = $('towerbar');
    bar.innerHTML = '';
    this.tbtns = {};
    for (const tid of this.run.availableTowers()) {
      const d = TOWERS[tid];
      const b = el('div', 'tbtn');
      b.innerHTML = `<img src="${towerSprites(d).iconUrl}"><div class="cost"></div>`;
      b.onclick = () => { sfx('click'); this.app.selectBuild(tid); };
      bar.append(b);
      this.tbtns[tid] = b;
    }
    this.refreshTowerBar();
  }

  refreshTowerBar() {
    const r = this.run;
    if (!r || !this.tbtns) return;
    for (const [tid, b] of Object.entries(this.tbtns)) {
      const c = r.towerCost(tid);
      b.querySelector('.cost').textContent = c;
      b.classList.toggle('poor', r.gold < c);
      b.classList.toggle('sel', this.app.view.buildType === tid);
    }
    const info = $('towerinfo');
    const bt = this.app.view.buildType;
    if (bt) {
      const d = TOWERS[bt];
      info.innerHTML = `<b style="color:${d.color}">${d.name}</b> <span class="c-yel">${r.towerCost(bt)}c</span><br>${d.desc}<br><span class="c-dim">Tap a tile to preview, tap again to build.</span>`;
      info.classList.remove('hidden');
    } else info.classList.add('hidden');
  }

  updateWaveButton() {
    const r = this.run;
    if (!r) return;
    const b = $('btn-wave');
    if (r.phase === 'build') {
      const pk = r.peekWave();
      b.disabled = false;
      b.textContent = pk.boss ? 'BOSS!' : 'WAVE ' + (r.wave + 1);
      b.className = 'btn ' + (pk.boss ? 'red' : 'go');
    } else {
      b.disabled = true;
      b.textContent = r.phase === 'wave' ? 'WAVE ' + r.wave : '...';
      b.className = 'btn';
    }
  }

  setHud(id, html, cls) {
    if (this.hudCache[id] === html) return;
    this.hudCache[id] = html;
    const e = $(id);
    e.innerHTML = html;
    if (cls !== undefined) e.className = cls;
  }

  updateHud() {
    const r = this.run;
    if (!r) return;
    this.setHud('hud-core', `${img('heart')} ${Math.ceil(r.coreHp)}/${r.maxCore}`, 'chip' + (r.coreHp <= r.maxCore * 0.3 ? ' low' : ''));
    this.setHud('hud-wave', `${img('wave')} WAVE ${r.wave}`);
    const pk = r.peekWave();
    this.setHud('hud-next', r.phase === 'wave' ? `${r.enemies.length + r.spawnQueue.length} LEFT` : 'NEXT: ' + pk.text, 'chip ' + (pk.boss && r.phase !== 'wave' ? 'c-red' : 'dim'));
    this.setHud('hud-gold', `${img('coin')} ${fmt(r.gold)}`);
    this.setHud('hud-shards', `${img('shard')} ${r.shards}`);
    if (this.hudCache.gold !== r.gold || this.hudCache.bt !== this.app.view.buildType) {
      this.hudCache.gold = r.gold; this.hudCache.bt = this.app.view.buildType;
      this.refreshTowerBar();
      if (this.panelTower) this.refreshPanel();
    }
    if (this.hudCache.phase !== r.phase) { this.hudCache.phase = r.phase; this.updateWaveButton(); }
    // boss bar
    const boss = r.enemies.find((e) => e.boss && e.alive);
    const bb = $('bossbar');
    if (boss) {
      bb.classList.remove('hidden');
      bb.querySelector('.bb-name').textContent = boss.def.name.toUpperCase();
      bb.querySelector('.bb-fill').style.width = (boss.hp / boss.maxHp) * 100 + '%';
      bb.querySelector('.bb-shield').style.width = boss.maxShield ? (boss.shield / boss.maxShield) * 100 + '%' : '0';
      bb.querySelector('.bb-weak').innerHTML = boss.def.shieldType && boss.shield > 0
        ? `SHIELD WEAK TO <span style="color:${DTYPE_COLOR[boss.weak]}">${DTYPE_NAME[boss.weak].toUpperCase()}</span>` : '';
    } else bb.classList.add('hidden');
    $('placebanner').classList.toggle('hidden', !r.placing);
    if (this.panelTower && this.run.time - (this.panelT || 0) > 0.5) { this.panelT = this.run.time; this.refreshPanel(); }
  }

  toast(msg, color = '#2ef2ff') {
    const t = el('div', 'toast', msg);
    t.style.color = color;
    $('toasts').append(t);
    setTimeout(() => t.remove(), 2800);
    while ($('toasts').children.length > 3) $('toasts').firstChild.remove();
  }

  // ---------- tower panel ----------
  showPanel(tw) {
    this.panelTower = tw;
    this.panelKey = null;
    this.panel.classList.remove('hidden');
    this.refreshPanel();
  }

  hidePanel() { this.panelTower = null; this.panel.classList.add('hidden'); }

  // Stats refresh often; buttons are only rebuilt when something they show changes,
  // so a tap is never swallowed by a DOM rebuild.
  refreshPanel(force) {
    const tw = this.panelTower, r = this.run;
    if (!tw || !r || !r.towers.includes(tw)) { this.hidePanel(); return; }
    const cost = r.upgradeCost(tw);
    const key = [tw.id, tw.level, tw.branch, tw.mode, cost, cost != null && r.gold >= cost, r.sellValue(tw)].join('|');
    if (force || key !== this.panelKey || !this.panelStats) {
      this.panelKey = key;
      this.buildPanel(tw);
    }
    this.panelStats.innerHTML = this.panelRows(tw);
  }

  buildPanel(tw) {
    const r = this.run, d = tw.def, p = this.panel;
    p.innerHTML = '';
    p.append(button('X', 'sm x', () => this.app.deselect()));
    const title = tw.branch ? d.branches[tw.branch].name : d.name;
    p.append(el('h3', '', `<span style="color:${d.color}">${title}</span>`));
    p.append(el('div', 'pdesc', `LV ${tw.level}${tw.branch ? ' - ' + d.name : ''}`));
    this.panelStats = el('div');
    p.append(this.panelStats);
    const btns = el('div', 'btns');
    if (d.dmg) {
      btns.append(button('TARGET: ' + tw.mode.toUpperCase(), '', () => {
        const order = ['first', 'last', 'strong', 'close'];
        tw.mode = order[(order.indexOf(tw.mode) + 1) % order.length];
        this.refreshPanel();
      }));
    }
    const cost = r.upgradeCost(tw);
    if (cost != null) {
      if (tw.level < 3) {
        const L = LEVELS[tw.level + 1], P = LEVELS[tw.level];
        const b = button(`UPGRADE LV${tw.level + 1} - ${cost}c<small style="display:block;color:var(--dim);text-transform:none">+${Math.round((L.dmg / P.dmg - 1) * 100)}% power, +${Math.round((L.range / P.range - 1) * 100)}% range</small>`, r.gold >= cost ? 'hot' : '', () => this.app.upgrade(tw));
        b.disabled = r.gold < cost;
        btns.append(b);
      } else {
        for (const k of ['A', 'B']) {
          const br = d.branches[k];
          const b = button(`${br.name} - ${cost}c<small>${br.desc}</small>`, 'branch', () => this.app.upgrade(tw, k));
          b.disabled = r.gold < cost;
          btns.append(b);
        }
      }
    }
    btns.append(button(`SELL +${r.sellValue(tw)}c`, 'red', () => this.app.sell(tw)));
    p.append(btns);
  }

  panelRows(tw) {
    const s = tw.stats, d = tw.def;
    const rows = [];
    if (tw.disabled > 0) rows.push(['STATUS', '<span class="c-yel">EMP!</span>']);
    if (d.dmg) {
      rows.push([d.proj === 'beam' ? 'DPS (base)' : 'Damage', fmt(s.dmg * (d.proj === 'beam' ? s.rate : 1))]);
      if (d.proj !== 'beam') rows.push(['Rate', s.rate.toFixed(2) + '/s']);
      rows.push(['Type', DTYPE_NAME[d.dtype]]);
    }
    if (s.range) rows.push(['Range', (s.range / 16).toFixed(1) + ' tiles']);
    if (s.minRange) rows.push(['Min range', (s.minRange / 16).toFixed(1)]);
    if (s.splash && d.id !== 'cryo') rows.push(['Blast', (s.splash / 16).toFixed(1)]);
    if (s.chains) rows.push(['Chains', s.chains]);
    if (s.slow) rows.push(['Chill', pct(s.slow)]);
    if (s.poison) rows.push(['Poison', fmt(s.poison) + '/s']);
    if (d.proj === 'beam') rows.push(['Ramp', 'x' + s.ramp.toFixed(1)]);
    if (d.id === 'drone') rows.push(['Drones', s.drones], ['Drone HP', fmt(s.droneHp)], ['Drone dmg', fmt(s.droneDmg)]);
    if (d.id === 'miner') rows.push(['Income', '+' + Math.round(s.income) + '/wave']);
    if (d.id === 'amplifier') rows.push(['Buff', '+' + pct(s.buff) + ' dmg']);
    if (d.id === 'reclaimer') rows.push(['Revive', pct(s.revive)]);
    if (s.crit > 0.031 && d.dmg) rows.push(['Crit', pct(s.crit)]);
    if (d.dmg || d.id === 'drone') rows.push(['Dealt', fmt(tw.dmgDealt)], ['Kills', tw.kills]);
    return rows.map(([k, v]) => `<div class="row"><span>${k}</span><span>${v}</span></div>`).join('');
  }

  // ---------- modals ----------
  openModal(fill, peekable) {
    this.modal.innerHTML = '';
    this.modal.classList.remove('hidden', 'peek');
    const box = el('div', 'mbox');
    fill(box);
    this.modal.append(box);
    if (peekable) {
      const pb = button('VIEW MAP', 'sm', () => {
        const on = !this.modal.classList.contains('peek');
        this.modal.classList.toggle('peek', on);
        pb.textContent = on ? 'BACK TO CHOICE' : 'VIEW MAP';
      });
      pb.classList.add('peekbtn');
      this.modal.append(pb);
    }
  }

  closeModal() { this.modal.classList.add('hidden'); this.modal.innerHTML = ''; }

  augCard(a, onPick, price) {
    const rar = RARITY[a.rarity];
    const c = el('div', 'card');
    c.style.borderColor = rar.color;
    const owned = this.run.augments[a.id];
    c.innerHTML = `<div class="rar" style="color:${rar.color}">${rar.name}${owned ? ' (x' + owned + ')' : ''}</div><div class="nm" style="color:${rar.color}">${a.name}</div><div class="ds">${a.desc}</div>${price ? `<div class="c-yel">${price}c</div>` : ''}`;
    c.onclick = () => { onPick(); };
    return c;
  }

  rerollBtn(c, redraw) {
    const r = this.run;
    const label = r.rerolls > 0 ? `REROLL (${r.rerolls} FREE)` : `REROLL ${r.rerollCost()}c`;
    const b = button(label, 'sm', () => { if (r.reroll(c)) redraw(); });
    if (r.rerolls <= 0 && r.gold < r.rerollCost()) b.disabled = true;
    return b;
  }

  showChoice(c) {
    const r = this.run;
    this.app.deselect();
    if (c.kind === 'augment') {
      const draw = () => this.openModal((box) => {
        box.append(el('h2', '', c.title || 'CHOOSE AN AUGMENT'));
        const cards = el('div', 'cards');
        for (const a of c.options) cards.append(this.augCard(a, () => { sfx('pick'); r.addAugment(a.id); this.toast(a.name, RARITY[a.rarity].color); this.closeModal(); r.nextChoice(); }));
        box.append(cards);
        const row = el('div', 'mrow');
        row.append(this.rerollBtn(c, draw));
        box.append(row);
      }, true);
      draw();
    } else if (c.kind === 'shop') {
      const draw = () => this.openModal((box) => {
        box.append(el('h2', '', 'BLACK MARKET'), el('p', 'c-yel', `${img('coin')} ${r.gold} credits`));
        const cards = el('div', 'cards');
        for (const it of c.items) {
          let card;
          if (it.aug) card = this.augCard(it.aug, () => { if (r.buyShop(it)) draw(); }, it.price);
          else {
            card = el('div', 'card', `<div class="rar c-grn">SERVICE</div><div class="nm c-grn">Core Repair</div><div class="ds">Repair ${it.repair} core HP.</div><div class="c-yel">${it.price}c</div>`);
            card.onclick = () => { if (r.coreHp < r.maxCore && r.buyShop(it)) draw(); };
          }
          if (it.sold) card.classList.add('sold');
          if (r.gold < it.price) card.style.opacity = '0.55';
          cards.append(card);
        }
        box.append(cards);
        const row = el('div', 'mrow');
        row.append(this.rerollBtn(c, draw), button('LEAVE', 'go', () => { this.closeModal(); r.nextChoice(); }));
        box.append(row);
      }, true);
      draw();
    } else if (c.kind === 'event') {
      const ev = c.event;
      this.openModal((box) => {
        box.append(el('h2', '', ev.title.toUpperCase()), el('p', '', ev.text));
        const opts = el('div', 'evopts');
        for (const o of ev.options) {
          const b = button(o.label, '', () => {
            const res = o.act(r);
            sfx('pick');
            this.openModal((box2) => {
              box2.append(el('h2', '', ev.title.toUpperCase()), el('p', '', res));
              const row = el('div', 'mrow');
              row.append(button('CONTINUE', 'go', () => { this.closeModal(); if (r.phase !== 'over') r.nextChoice(); }));
              box2.append(row);
            });
          });
          if (o.cond && !o.cond(r)) b.disabled = true;
          opts.append(b);
        }
        box.append(opts);
      }, true);
    } else if (c.kind === 'expand') {
      this.openModal((box) => {
        box.append(el('h2', '', 'EXPAND THE BASTION'), el('p', 'c-dim', 'Choose a sector chunk, then attach it to an open portal. New chunks are built from the current sector.'));
        const cards = el('div', 'cards');
        for (const card of c.cards) {
          const k = el('div', 'card');
          const cv = previewCanvas(card.preview);
          cv.className = 'px';
          const rw = card.arch.reward;
          const rew = [];
          if (rw.gold > 0) rew.push(`+${rw.gold}c`);
          if (rw.gold < 0) rew.push(`<span class="c-red">${rw.gold}c</span>`);
          if (rw.shards) rew.push(`+${rw.shards} shards`);
          if (rw.aug) rew.push('+Rare augment');
          if (rw.hpMult) rew.push(`<span class="c-red">enemies +${Math.round(rw.hpMult * 100)}% HP</span>`);
          const mods = card.mods.map((m) => CHUNK_MODS.find((x) => x.id === m)).map((m) => `<div class="tag"><span class="c-cyan">${m.name}</span>: ${m.desc}</div>`).join('');
          k.append(el('div', 'nm c-cyan', card.arch.name), cv, el('div', 'ds', card.arch.desc), el('div', '', mods), el('div', 'c-yel', rew.join(' ')));
          k.onclick = () => {
            if (card.arch.reward.gold < 0 && r.gold < -card.arch.reward.gold) { this.toast('Not enough credits', '#ff2f5a'); return; }
            sfx('pick');
            r.placing = card;
            this.closeModal();
            this.app.focusSlots();
          };
          cards.append(k);
        }
        box.append(cards);
      }, true);
    }
  }

  showPause() {
    const r = this.run;
    if (!r || r.phase === 'over') return;
    r.paused = true;
    const resume = () => { r.paused = false; this.closeModal(); if (r.phase === 'choice' && r.current) this.showChoice(r.current); };
    this.openModal((box) => {
      box.append(el('h2', '', 'PAUSED'));
      const augs = Object.entries(r.augments);
      if (augs.length) {
        const list = augs.map(([id, n]) => {
          const a = AUGMENTS.find((x) => x.id === id);
          return `<span style="color:${RARITY[a.rarity].color}">${a.name}${n > 1 ? ' x' + n : ''}</span>`;
        }).join(' - ');
        box.append(el('p', '', 'AUGMENTS: ' + list));
      }
      box.append(el('p', 'c-dim', `Heat ${r.heat} - ${COMMANDERS.find((c) => c.id === r.commander).name} - Kills ${r.stats.kills} - Map chunks ${r.world.chunks.size}`));
      const col = el('div', 'evopts');
      col.append(
        button('RESUME', 'go', resume),
        button('SOUND: ' + (meta.settings.sfx ? 'ON' : 'OFF'), '', () => { meta.settings.sfx = !meta.settings.sfx; setSfx(meta.settings.sfx); saveMeta(); this.showPause(); }),
        button('SAVE & QUIT TO MENU', '', () => { this.app.quitToMenu(); }),
        button('ABANDON RUN (COLLECT REWARDS)', 'red', () => this.confirm('End this run now? You keep XP and shards earned.', () => { r.paused = false; r.abandon(); })),
      );
      box.append(col);
      if (r.phase !== 'build') box.append(el('p', 'c-dim', 'Runs are saved between waves. Quitting mid-wave resumes from the start of this wave.'));
    });
  }

  showGameOver(d) {
    this.hidePanel();
    $('bossbar').classList.add('hidden');
    this.openModal((box) => {
      box.style.borderColor = '#ff2f5a';
      box.append(el('h2', '', '<span style="color:var(--red)">BASTION FALLEN</span>'));
      box.append(el('p', 'big', `WAVE ${d.wave}`));
      box.append(el('p', '', `Kills ${fmt(d.kills)} - Bosses ${d.bosses}`));
      box.append(el('p', 'c-cyan', `+${fmt(d.xp)} XP${d.ups ? ` - LEVEL UP! LV ${d.prevLevel} > ${meta.level} (+${d.ups} talent pt${d.ups > 1 ? 's' : ''})` : ''}`));
      box.append(el('p', 'c-mag', `+${d.shards} Void Shards`));
      if (d.heatUp) box.append(el('p', 'c-red', `HEAT ${meta.heatUnlocked} UNLOCKED!`));
      for (const a of d.ach) box.append(el('p', 'c-grn', `ACHIEVEMENT: ${a.name} (+${a.shards} shards)`));
      const row = el('div', 'mrow');
      row.append(button('MAIN MENU', '', () => this.app.toMenu()), button('RUN AGAIN', 'go', () => this.app.newRun(meta.commander, meta.heat)));
      box.append(row);
    });
  }
}
