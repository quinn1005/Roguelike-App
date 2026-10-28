// DOM user interface: menus, meta screens, HUD, tower panel and choice modals.

import { el, fmt, pct } from './util.js';
import {
  TOWERS, TOWER_ORDER, LEVELS, ENEMIES, BOSSES, COMBOS, RARITY, DTYPE_NAME, DTYPE_COLOR, CHUNK_MODS, RISK_MODS, AUGMENTS, SECTOR_INTROS,
  MUTATORS, RELICS, RELIC_BY_ID, VETERANCY, SKINS, ABILITIES, FUSIONS,
} from './defs.js';
import {
  meta, saveMeta, TREES, towerTree, COMMANDERS, ACHIEVEMENTS, MAX_HEAT, heatInfo, xpNeed,
  pointsFree, pointsTotal, nodeRank, nodeAvailable, buyNode, respec, loadRun, resetMeta,
  COMMANDER_TREES, cmdState, cmdNodeRank, cmdPointsFree, cmdNodeAvailable, cmdBuyNode, cmdRespec, cmdXpNeed, CMD_MAX_LEVEL,
  canPrestige, doPrestige, PRESTIGE_LEVEL, skinUnlocked, towerSkin, mutatorBonus, exportSave, importSave,
} from './meta.js';
import { towerSprites, enemySprite, makeCanvas, uiIcon } from './sprites.js';
import { previewCanvas } from './world.js';
import { sfx, setSfx } from './audio.js';
import { quinnBadge } from './quinn.js';
import { commanderCanvas } from './commanders.js';
import { VERSION } from './version.js';

const $ = (id) => document.getElementById(id);
const ICON = { coin: uiIcon('coin'), heart: uiIcon('heart'), shard: uiIcon('shard'), wave: uiIcon('wave') };
const img = (k) => `<img src="${ICON[k]}" alt="">`;

const enemyIconCache = {};
function enemyIcon(id) {
  if (enemyIconCache[id]) return enemyIconCache[id];
  const d = ENEMIES[id];
  const s = enemySprite((d && d.sprite) || id, 0, (d && d.tint) || null);
  const [c, ctx] = makeCanvas(s.width * 3, s.height * 3);
  ctx.drawImage(s, 0, 0, c.width, c.height);
  return (enemyIconCache[id] = c.toDataURL());
}

const enemyDef = (id) => ENEMIES[id] || BOSSES.find((b) => b.id === id);

// Full intel card for an enemy or boss: art, stats, abilities, counters.
function intelCard(id, run) {
  const d = enemyDef(id);
  const boss = BOSSES.includes(d);
  const w = run ? Math.max(1, run.wave) : Math.max(1, d.minWave || 10);
  const hp = run ? d.hp * run.hpScale(w) * (boss ? 0.6 : 1) : d.hp;
  const stats = [
    ['HP', fmt(hp) + (run ? '' : ' (base)')],
    ['Speed', (d.speed / 16).toFixed(1) + ' tiles/s'],
  ];
  if (d.armor) stats.push(['Armor', d.armor]);
  if (d.shield) stats.push(['Shield', fmt(d.shield * (run ? run.hpScale(w) : 1))]);
  stats.push(['Core damage', boss ? 'Massive' : d.core]);
  stats.push(['Credits', d.gold]);
  if (d.flying) stats.push(['Movement', 'Flying']);
  if (d.group) stats.push(['Pack size', d.group]);
  const towerRow = (list, cls) => (list || []).map(([t, why]) => {
    const def = TOWERS[t];
    return `<div class="intel-t"><img src="${towerSprites(def).iconUrl}"><div><span style="color:${def.color}">${def.name}</span><br><span class="c-dim">${why}</span></div></div>`;
  }).join('');
  const box = el('div', 'intel');
  box.innerHTML = `
    <div class="intel-art"><img src="${enemyIcon(id)}" style="width:${boss ? 120 : 96}px;height:${boss ? 120 : 96}px"><div class="nm ${boss ? 'c-red' : 'c-cyan'}">${d.name}</div>
      <div class="intel-stats">${stats.map(([k, v]) => `<div><span class="c-dim">${k}</span><span>${v}</span></div>`).join('')}</div></div>
    <div class="intel-info">
      <p>${d.desc}</p>
      <div class="intel-h c-yel">ABILITIES</div>${(d.abilities || []).map((a) => `<div class="intel-ab">- ${a}</div>`).join('')}
      <div class="intel-h c-grn">STRONG AGAINST IT</div><div class="intel-ts">${towerRow(d.good)}</div>
      <div class="intel-h c-red">WEAK AGAINST IT</div><div class="intel-ts">${towerRow(d.bad)}</div>
    </div>`;
  return box;
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
      for (const id of ['panel', 'towerinfo', 'bossbar', 'placebanner', 'wavepreview', 'abilities']) $(id).classList.add('hidden');
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
    const stars = meta.prestige ? `<span class="c-yel" title="Prestige">${'*'.repeat(Math.min(5, meta.prestige))}${meta.prestige > 5 ? meta.prestige : ''}</span>` : '';
    badge.innerHTML = `${stars}<span class="c-cyan">LV ${meta.level}</span><div class="xpbar"><div style="width:${(meta.xp / xpNeed(meta.level)) * 100}%"></div></div>
      <span class="c-mag">${img('shard')} ${meta.shards}</span>
      ${pointsFree() > 0 ? `<span class="pts">${pointsFree()} TALENT PTS!</span>` : ''}`;
    const best = el('div', 'badge c-dim', `BEST WAVE ${meta.bestWave} &nbsp; RUNS ${meta.runs}`);
    logo.append(badge, best);
    const col = el('div', 'col grid2');
    if (saved) col.append(button(`CONTINUE (WAVE ${saved.wave + 1})`, 'go wide', () => this.app.continueRun(saved)));
    col.append(
      button('NEW RUN', (saved ? 'hot' : 'go') + ' wide', () => (saved ? this.confirm('Start a new run? Your saved run will be lost.', () => this.showNewRun()) : this.showNewRun())),
      button('TALENTS' + (pointsFree() > 0 ? ' (' + pointsFree() + ')' : ''), pointsFree() > 0 ? 'yel' : '', () => this.showTalents('offense')),
      button('ARMORY', '', () => this.showArmory()),
      button('COMMANDERS', '', () => this.showCommanders()),
      button('CODEX', '', () => this.showCodex('enemies')),
      button('HISTORY', '', () => this.showHistory()),
      button('SETTINGS', '', () => this.showSettings()),
    );
    m.append(logo, col);
    this.screen.append(m, quinnBadge(), el('div', 'version', 'v' + VERSION));
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
    const hdr = this.header('NEW RUN', heatCtl);
    hdr.append(button('LAUNCH', 'go', () => this.app.newRun(meta.commander, meta.heat, meta.mutators)));
    wrap.append(hdr);
    wrap.append(el('p', 'c-dim', 'CHOOSE YOUR COMMANDER'));
    const grid = el('div', 'grid');
    for (const c of COMMANDERS) {
      if (!meta.commanders.includes(c.id)) continue;
      const it = el('div', 'item' + (meta.commander === c.id ? ' selc' : ''));
      const sig = c.sig ? `<div class="ds">Signature: ${TOWERS[c.sig].name}</div>` : '';
      it.innerHTML = `<div class="grow"><div class="nm" style="color:${c.color}">${c.name}</div><div class="ds">${c.desc}</div>${sig}</div>`;
      it.prepend(commanderCanvas(c.id));
      it.onclick = () => { sfx('click'); meta.commander = c.id; saveMeta(); this.showNewRun(); };
      grid.append(it);
    }
    wrap.append(grid);
    // optional mutators
    meta.mutators = (meta.mutators || []).filter((id) => MUTATORS.some((m) => m.id === id));
    const bonus = mutatorBonus(meta.mutators);
    wrap.append(el('p', 'c-dim', `MUTATORS (optional) <span class="c-yel">${bonus ? '+' + Math.round(bonus * 100) + '% XP & SHARDS' : ''}</span>`));
    const mrow = el('div', 'chips');
    for (const m of MUTATORS) {
      const on = meta.mutators.includes(m.id);
      const chip = el('div', 'chip mut' + (on ? ' on' : ''), `<b>${m.name}</b> <span class="c-yel">+${Math.round(m.bonus * 100)}%</span><br><span class="c-dim">${m.desc}</span>`);
      chip.onclick = () => {
        sfx('click');
        meta.mutators = on ? meta.mutators.filter((x) => x !== m.id) : [...meta.mutators, m.id];
        saveMeta(); this.showNewRun();
      };
      mrow.append(chip);
    }
    wrap.append(mrow);
    const r = el('div', 'mrow');
    r.style.marginTop = '12px';
    r.append(button('LAUNCH', 'go', () => this.app.newRun(meta.commander, meta.heat, meta.mutators)));
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
    if (canPrestige()) {
      extra.append(button('PRESTIGE', 'sm yel', () => this.confirm(`Prestige? Your level resets to 1 and all talents are refunded. You keep unlocks and gain a permanent +3% damage and +5% shards (prestige ${(meta.prestige || 0) + 1}).`, () => { doPrestige(); sfx('upgrade'); this.showTalents(tab, towerSel); })));
    } else extra.append(el('span', 'c-dim', `PRESTIGE AT LV ${PRESTIGE_LEVEL}${meta.prestige ? ' (RANK ' + meta.prestige + ')' : ''}`));
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

  treeView(nodes, color, refresh, api = null) {
    api = api || { rank: nodeRank, avail: nodeAvailable, buy: buyNode, free: pointsFree };
    const tree = el('div', 'tree');
    const tiers = {};
    for (const n of nodes) (tiers[n.tier] = tiers[n.tier] || []).push(n);
    const names = Object.fromEntries(nodes.map((n) => [n.id, n.name]));
    for (const t of Object.keys(tiers).sort()) {
      const col = el('div', 'tier');
      for (const n of tiers[t]) {
        const r = api.rank(n.id);
        const avail = api.avail(n) && !n.lockedTower;
        const can = avail && r < n.max && api.free() > 0;
        const d = el('div', 'node' + (r ? ' has' : '') + (r >= n.max ? ' max' : '') + (!avail ? ' locked' : '') + (can ? ' can' : ''));
        d.style.setProperty('--c', color);
        const next = r < n.max ? n.desc(r + 1) : n.desc(r);
        if (n.ability) {
          const A = ABILITIES[n.ability];
          d.classList.add('abil');
          d.innerHTML = `<div class="nm" style="color:${A.color}">${A.name}</div><div class="rk">${r ? 'OK' : '0/1'}</div><div class="ds">ACTIVE ABILITY (${A.cd}s cooldown)<br>${A.desc}</div>`;
        } else d.innerHTML = `<div class="nm">${n.name}</div><div class="rk">${r}/${n.max}</div><div class="ds">${r ? 'Now: ' + n.desc(r) + '<br>' : ''}${r < n.max ? 'Next: ' + next : 'MAXED'}</div>`;
        const label = (q) => { const nn = nodes.find((x) => x.id === q); return nn && nn.ability ? ABILITIES[nn.ability].name : names[q]; };
        if (!avail && n.req) d.innerHTML += `<div class="rq">Requires ${n.req.map(label).join(n.any ? ' or ' : ' + ')}</div>`;
        d.onclick = () => { if (api.buy(n)) { sfx('pick'); refresh(); } else sfx('click'); };
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
        <div class="ds">A: ${d.branches.A.name} / B: ${d.branches.B.name}</div>
        <div class="ds c-cyan">Mastery: ${meta.towerKills[tid] || 0} kills</div></div>`;
      if (has) {
        const sk = el('div', 'skins');
        for (const S of SKINS) {
          const ok = skinUnlocked(tid, S.id);
          const cur = towerSkin(tid) === S.id;
          const b = el('button', 'btn sm skin' + (cur ? ' on' : ''), `<img class="px" src="${towerSprites(d, 1, null, S.id).iconUrl}">${ok ? '' : '<br>' + S.kills}`);
          b.title = S.name + (ok ? '' : ` (${S.kills} kills)`);
          if (!ok) b.disabled = true;
          b.onclick = (ev) => { ev.stopPropagation(); sfx('click'); meta.skins[tid] = S.id; saveMeta(); this.showArmory(); };
          sk.append(b);
        }
        it.querySelector('.grow').append(sk);
      }
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
      const st = cmdState(c.id);
      const pts = cmdPointsFree(c.id);
      it.innerHTML = `<div class="grow"><div class="nm" style="color:${c.color}">${c.name} <span class="c-dim">LV ${st.level}</span>${has && pts > 0 ? ` <span class="pts">${pts} PT${pts > 1 ? 'S' : ''}</span>` : ''}</div><div class="ds">${c.desc}</div></div>`;
      it.prepend(commanderCanvas(c.id));
      if (has) {
        const btns = el('div', 'vbtns');
        btns.append(
          button(meta.commander === c.id ? 'ACTIVE' : 'SELECT', meta.commander === c.id ? 'on sm' : 'sm', () => { meta.commander = c.id; saveMeta(); this.showCommanders(); }),
          button('SKILLS', pts > 0 ? 'yel sm' : 'sm', () => this.showCommanderTree(c.id)),
        );
        it.append(btns);
      }
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

  showExport() {
    const code = exportSave();
    this.openModal((box) => {
      box.append(el('h2', '', 'EXPORT SAVE'));
      box.append(el('p', '', 'This code holds all of your progress. Copy it somewhere safe (a note or a message to yourself). Paste it into IMPORT SAVE to restore it, even on another device.'));
      const ta = el('textarea', 'savecode');
      ta.value = code; ta.readOnly = true;
      box.append(ta);
      const row = el('div', 'mrow');
      const copy = button('COPY', 'go', async () => {
        try { await navigator.clipboard.writeText(code); copy.textContent = 'COPIED!'; }
        catch (e) { ta.focus(); ta.select(); document.execCommand('copy'); copy.textContent = 'COPIED!'; }
      });
      row.append(copy, button('CLOSE', '', () => this.closeModal()));
      box.append(row);
    });
  }

  showImport() {
    this.openModal((box) => {
      box.append(el('h2', '', 'IMPORT SAVE'));
      box.append(el('p', 'c-red', 'This REPLACES your current progress with the save code you paste below.'));
      const ta = el('textarea', 'savecode');
      ta.placeholder = 'Paste your NB1:... save code here';
      box.append(ta);
      const msg = el('p', 'c-red', '');
      const row = el('div', 'mrow');
      row.append(button('IMPORT', 'yel', () => {
        try { importSave(ta.value); location.reload(); }
        catch (e) { msg.textContent = e.message || 'Could not read that save code.'; }
      }), button('CANCEL', '', () => this.closeModal()));
      box.append(msg, row);
    });
  }

  // Each commander has a small skill tree; levels come from runs with them.
  showCommanderTree(cid) {
    this.clearScreen();
    const c = COMMANDERS.find((x) => x.id === cid);
    const st = cmdState(cid);
    const wrap = el('div');
    const extra = el('div', 'stepper');
    const xpTxt = st.level >= CMD_MAX_LEVEL ? 'MAX LEVEL' : `XP ${st.xp}/${cmdXpNeed(st.level)}`;
    extra.append(
      el('span', 'c-cyan', `LV ${st.level}/${CMD_MAX_LEVEL}`), el('span', 'c-dim', xpTxt),
      el('span', cmdPointsFree(cid) > 0 ? 'pts' : 'c-dim', `POINTS: ${cmdPointsFree(cid)}`),
      button('RESPEC', 'sm red', () => this.confirm('Refund this commander\'s skill points?', () => { cmdRespec(cid); this.showCommanderTree(cid); })),
    );
    const h = el('div', 'scr-head');
    h.append(button('&lt; BACK', '', () => this.showCommanders()), el('h2', '', `<span style="color:${c.color}">${c.name.toUpperCase()}</span> SKILLS`), extra);
    wrap.append(h);
    wrap.append(el('p', 'c-dim', 'Commanders level up from XP earned in runs you play with them. Each level is 1 skill point. Abilities appear as buttons during waves.'));
    const api = {
      rank: (id) => cmdNodeRank(cid, id), avail: (n) => cmdNodeAvailable(cid, n),
      buy: (n) => cmdBuyNode(cid, n), free: () => cmdPointsFree(cid),
    };
    wrap.append(this.treeView(COMMANDER_TREES[cid], c.color, () => this.showCommanderTree(cid), api));
    this.screen.append(wrap);
  }

  showHistory() {
    this.clearScreen();
    const wrap = el('div');
    wrap.append(this.header('RUN HISTORY', el('span', 'c-dim', `LAST ${Math.min(20, meta.history.length)} RUNS`)));
    if (!meta.history.length) wrap.append(el('p', 'c-dim', 'No runs yet. Go defend the core!'));
    const list = el('div', 'hist');
    for (const h of meta.history) {
      const c = COMMANDERS.find((x) => x.id === h.commander) || COMMANDERS[0];
      const d = new Date(h.t);
      const muts = (h.mutators || []).map((id) => (MUTATORS.find((m) => m.id === id) || {}).name).filter(Boolean).join(', ');
      const row = el('div', 'item');
      row.prepend(commanderCanvas(h.commander));
      row.append(el('div', 'grow', `<div class="nm"><span class="c-yel">WAVE ${h.wave}</span> <span style="color:${c.color}">${c.name}</span>${h.heat ? ` <span class="c-red">HEAT ${h.heat}</span>` : ''}</div>
        <div class="ds">${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Kills ${fmt(h.kills)} - Bosses ${h.bosses}</div>
        <div class="ds">Top tower: ${h.top || '-'} - Fell to: <span class="c-red">${h.cause}</span></div>
        <div class="ds"><span class="c-cyan">+${fmt(h.xp)} XP</span> <span class="c-mag">+${h.shards} shards</span>${muts ? ' - ' + muts : ''}</div>`));
      list.append(row);
    }
    wrap.append(list);
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
        const known = k || meta.seen[e.id];
        const it = el('div', 'item' + (known ? '' : ' off'));
        it.innerHTML = known
          ? `<img src="${enemyIcon(e.id)}"><div class="grow"><div class="nm">${e.name}</div><div class="ds">${e.desc}</div><div class="ds">Destroyed: ${fmt(k)} - tap for intel</div></div>`
          : `<img src="${enemyIcon(e.id)}" style="filter:brightness(0)"><div class="grow"><div class="nm">???</div><div class="ds">Not yet encountered. Sector ${e.sector + 1}.</div></div>`;
        if (known) it.onclick = () => { sfx('click'); this.openModal((box) => { box.append(intelCard(e.id)); const r = el('div', 'mrow'); r.append(button('CLOSE', '', () => this.closeModal())); box.append(r); }); };
        grid.append(it);
      }
    } else if (tab === 'bosses') {
      BOSSES.forEach((b, i) => {
        const k = meta.bossKills[b.id] || 0;
        const known = k || meta.seen[b.id];
        const it = el('div', 'item' + (known ? '' : ' off'));
        it.innerHTML = `<img src="${enemyIcon(b.id)}" ${known ? '' : 'style="filter:brightness(0)"'}><div class="grow"><div class="nm c-red">${known ? b.name : '???'}</div><div class="ds">Wave ${(i + 1) * 10}${known ? ' - ' + b.desc : ''}</div><div class="ds">Destroyed: ${k}</div></div>`;
        if (known) it.onclick = () => { sfx('click'); this.openModal((box) => { box.append(intelCard(b.id)); const r = el('div', 'mrow'); r.append(button('CLOSE', '', () => this.closeModal())); box.append(r); }); };
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
      button('VIBRATION: ' + (meta.settings.haptics ? 'ON' : 'OFF'), '', () => { meta.settings.haptics = !meta.settings.haptics; saveMeta(); this.showSettings(); }),
      button('FULLSCREEN', '', () => this.app.fullscreen()),
      button('EXPORT SAVE (BACKUP)', 'hot', () => this.showExport()),
      button('IMPORT SAVE', '', () => this.showImport()),
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
    this.buildAbilities();
    this.updateWaveButton();
    $('btn-move').onclick = () => { sfx('click'); this.app.toggleRelocate(); };
  }

  buildAbilities() {
    const box = $('abilities');
    box.innerHTML = '';
    this.abtns = {};
    for (const id of this.run.abilities) {
      const A = ABILITIES[id];
      const b = el('button', 'btn abil', `<span>${A.name}</span><div class="cdbar"></div>`);
      b.style.borderColor = A.color; b.style.color = A.color;
      b.onclick = () => { if (this.run.useAbility(id)) sfx('pick'); };
      box.append(b);
      this.abtns[id] = b;
    }
    box.classList.toggle('hidden', !this.run.abilities.length);
  }

  cycleSpeed() {
    const r = this.run;
    if (!r) return;
    r.speed = r.speed >= 5 ? 1 : r.speed + 1;
    $('btn-speed').textContent = r.speed + 'x';
  }

  buildTowerBar() {
    const bar = $('towerbar');
    bar.innerHTML = '';
    this.tbtns = {};
    for (const tid of this.run.availableTowers()) {
      const d = TOWERS[tid];
      const b = el('div', 'tbtn');
      b.innerHTML = `<img src="${towerSprites(d, 1, null, (this.run.skins || {})[tid] || 'default').iconUrl}"><div class="cost"></div>`;
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
    // ability cooldowns
    for (const [id, b] of Object.entries(this.abtns || {})) {
      const cd = Math.max(0, r.cooldowns[id] || 0), max = ABILITIES[id].cd;
      b.disabled = !r.abilityReady(id);
      b.querySelector('.cdbar').style.width = (cd > 0 ? (1 - cd / max) * 100 : 100) + '%';
    }
    // relocation button
    const mv = $('btn-move');
    mv.classList.toggle('hidden', !(r.phase === 'build' && r.relocations > 0 && !r.placing));
    mv.textContent = (this.app.view.relocate ? 'CANCEL MOVE' : 'MOVE CHUNK') + ' (' + r.relocations + ')';
    mv.classList.toggle('on', !!this.app.view.relocate);
    // wave preview
    const wp = $('wavepreview');
    if (r.phase === 'build' && !r.placing) {
      const prev = r.wavePreview();
      const key = r.wave + '|' + prev.map((c) => c.id + c.n + c.elite + c.corrupt).join();
      if (this.hudCache.wp !== key) {
        this.hudCache.wp = key;
        wp.innerHTML = '<span class="c-dim">NEXT</span>' + prev.map((c) => {
          const cls = c.boss ? 'boss' : c.mini ? 'mini' : c.corrupt ? 'corrupt' : c.elite ? 'elite' : '';
          return `<span class="wp ${cls}"><img src="${enemyIcon(c.id)}">x${c.n}</span>`;
        }).join('');
      }
      wp.classList.remove('hidden');
    } else wp.classList.add('hidden');
    // boss bar (bosses and mini-bosses)
    const boss = r.enemies.find((e) => e.boss && e.alive) || r.enemies.find((e) => e.mini && e.alive);
    const bb = $('bossbar');
    if (boss) {
      bb.classList.remove('hidden');
      bb.querySelector('.bb-name').textContent = (boss.mini ? 'MINI-BOSS: ' : '') + boss.def.name.toUpperCase();
      bb.classList.toggle('mini', !!boss.mini);
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
    const fus = r.fusionOptions(tw);
    const key = [tw.id, tw.type, tw.level, tw.branch, tw.mode, cost, cost != null && r.gold >= cost, r.sellValue(tw), tw.relic, r.relics.join(), tw.oc > 0, tw.overheat > 0, tw.vet, fus.map((f) => f.other.id + (r.gold >= f.cost)).join()].join('|');
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
    const look = towerSprites(d, tw.level, tw.branch, (r.skins || {})[tw.type] || 'default');
    p.append(el('h3', '', `<img class="px" src="${look.iconUrl}" style="width:32px;height:32px;vertical-align:middle;margin-right:4px"><span style="color:${look.color}">${title}</span>`));
    p.append(el('div', 'pdesc', d.fused ? 'FUSED TOWER - ' + d.desc : `LV ${tw.level}${tw.branch ? ' - ' + d.name : ''}`));
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
          const prev = towerSprites(d, 4, k);
          const b = button(`<img class="px" src="${prev.iconUrl}" style="width:24px;height:24px;float:left;margin-right:4px"><span style="color:${prev.color}">${br.name}</span> - ${cost}c<small>${br.desc}</small>`, 'branch', () => this.app.upgrade(tw, k));
          b.disabled = r.gold < cost;
          btns.append(b);
        }
      }
    }
    if (d.dmg) {
      const ocb = button(tw.oc > 0 ? 'OVERCLOCKED!' : tw.overheat > 0 ? 'OVERHEATED' : 'OVERCLOCK<small>2x fire rate for 5s, then shuts down for 6s</small>', 'yel', () => { if (r.overclock(tw)) this.refreshPanel(true); });
      ocb.disabled = tw.oc > 0 || tw.disabled > 0;
      btns.append(ocb);
    }
    for (const f of r.fusionOptions(tw)) {
      const fd = TOWERS[f.recipe.id];
      const fb = button(`<img class="px" src="${towerSprites(fd).iconUrl}" style="width:24px;height:24px;float:left;margin-right:4px">FUSE: <span style="color:${fd.color}">${fd.name}</span> - ${f.cost}c<small>Merges with the adjacent ${f.other.def.name}. ${fd.desc}</small>`, 'mag', () => { if (r.fuse(tw, f)) this.refreshPanel(true); });
      fb.disabled = r.gold < f.cost;
      btns.append(fb);
    }
    if (tw.relic) { const R = RELIC_BY_ID[tw.relic]; btns.append(el('div', 'relic-cur', `RELIC: <span style="color:${R.color}">${R.name}</span> - ${R.desc}`)); }
    r.relics.forEach((rid, idx) => {
      const R = RELIC_BY_ID[rid];
      btns.append(button(`INSTALL <span style="color:${R.color}">${R.name}</span><small>${R.desc}${tw.relic ? ' (swaps out the current relic)' : ''}</small>`, '', () => { if (r.installRelic(tw, idx)) this.refreshPanel(true); }));
    });
    const sb = button(r.canSell ? `SELL +${r.sellValue(tw)}c` : 'SELL (SCORCHED EARTH)', 'red', () => this.app.sell(tw));
    sb.disabled = !r.canSell;
    btns.append(sb);
    p.append(btns);
  }

  // Panel for chunk relocation (rotate / swap).
  showChunkPanel(ch) {
    const r = this.run, p = this.panel;
    this.panelTower = null;
    p.classList.remove('hidden');
    p.innerHTML = '';
    p.append(button('X', 'sm x', () => this.app.cancelRelocate()));
    p.append(el('h3', 'c-cyan', 'MOVE CHUNK'));
    p.append(el('div', 'pdesc', `Relocations left: ${r.relocations}. You get 1 more after every boss (max 2). Towers on moved chunks are refunded in full.`));
    const btns = el('div', 'btns');
    btns.append(
      button('ROTATE<small>Turn its exits to face a different way</small>', 'hot', () => this.app.rotateChunk(ch)),
      button('SWAP<small>Then tap another glowing chunk to trade places</small>', 'mag', () => this.app.beginSwap(ch)),
      button('CANCEL', '', () => this.app.cancelRelocate()),
    );
    p.append(btns);
  }

  showRockPanel(x, y) {
    const r = this.run, p = this.panel;
    this.panelTower = null;
    p.classList.remove('hidden');
    p.innerHTML = '';
    p.append(button('X', 'sm x', () => this.app.deselect()));
    p.append(el('h3', '', '<span style="color:#a466ff">ASTEROID</span>'));
    p.append(el('div', 'pdesc', 'Blast it to free up a build tile. 20% chance to find a Void Shard inside.'));
    const btns = el('div', 'btns');
    const cost = r.blastCost();
    const b = button(`BLAST - ${cost}c`, 'yel', () => { if (r.blastRock(x, y)) this.app.deselect(); });
    b.disabled = r.gold < cost;
    btns.append(b, button('CANCEL', '', () => this.app.deselect()));
    p.append(btns);
  }

  panelRows(tw) {
    const s = tw.stats, d = tw.def;
    const rows = [];
    if (tw.overheat > 0) rows.push(['STATUS', '<span class="c-red">OVERHEATED</span>']);
    else if (tw.disabled > 0) rows.push(['STATUS', '<span class="c-yel">EMP!</span>']);
    if (tw.oc > 0) rows.push(['STATUS', '<span class="c-yel">OVERCLOCKED ' + tw.oc.toFixed(1) + 's</span>']);
    const nv = VETERANCY[tw.vet || 0];
    const cv = VETERANCY[(tw.vet || 0) - 1];
    rows.push(['Rank', (cv ? `<span style="color:${cv.color}">${cv.name}</span>` : 'Recruit') + (nv ? ` <span class="c-dim">(${tw.kills}/${nv.kills})</span>` : '')]);
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
    if (d.drones) rows.push(['Drones', s.drones], ['Drone HP', fmt(s.droneHp)], ['Drone dmg', fmt(s.droneDmg)]);
    if (d.income) rows.push(['Income', '+' + Math.round(s.income) + '/wave']);
    if (d.buff) rows.push(['Buff', '+' + pct(s.buff) + ' dmg']);
    if (d.revive) rows.push(['Revive', pct(s.revive)]);
    if (s.crit > 0.031 && d.dmg) rows.push(['Crit', pct(s.crit)]);
    if (d.dmg || d.drones) rows.push(['Dealt', fmt(tw.dmgDealt)], ['Kills', tw.kills]);
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
    const rar = a.isRelic ? { name: 'Relic', color: a.color } : RARITY[a.rarity];
    const c = el('div', 'card' + (a.isRelic ? ' relic' : ''));
    c.style.borderColor = rar.color;
    const owned = this.run.augments[a.id];
    c.innerHTML = `<div class="rar" style="color:${rar.color}">${rar.name}${owned ? ' (x' + owned + ')' : ''}</div><div class="nm" style="color:${rar.color}">${a.name}</div><div class="ds">${a.desc}</div>${price ? `<div class="c-yel">${price}c</div>` : ''}`;
    c.onclick = () => { onPick(); };
    return c;
  }

  rerollBtn(c, redraw) {
    const r = this.run;
    const label = r.rerolls > 0 ? `REROLL (${r.rerolls} FREE)` : `REROLL ${r.rerollCost(c)}c`;
    const b = button(label, 'sm', () => { if (r.reroll(c)) redraw(); });
    if (r.rerolls <= 0 && r.gold < r.rerollCost(c)) b.disabled = true;
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
        box.append(el('h2', '', 'EXPAND THE BASTION'), el('p', 'c-dim', 'Pick a chunk, then attach it to an open portal. RISK tiles buff enemies for extra rewards.'));
        const cards = el('div', 'cards');
        for (const card of c.cards) {
          const k = el('div', 'card chunk');
          const cv = previewCanvas(card.preview);
          cv.className = 'px';
          const rw = card.arch.reward;
          const rew = [];
          if (rw.gold > 0) rew.push(`+${rw.gold}c`);
          if (rw.gold < 0) rew.push(`<span class="c-red">${rw.gold}c</span>`);
          if (rw.shards) rew.push(`+${rw.shards} shards`);
          if (rw.aug) rew.push('+Rare augment');
          if (rw.hpMult) rew.push(`<span class="c-red">enemies +${Math.round(rw.hpMult * 100)}% HP</span>`);
          const mods = card.mods.map((m) => CHUNK_MODS.find((x) => x.id === m) || RISK_MODS.find((x) => x.id === m)).map((m) => (m.scope
            ? `<div class="tag risk"><span class="c-red">RISK (${m.scope === 'local' ? 'tile' : 'global'}) ${m.name}</span>: ${m.desc}</div>`
            : `<div class="tag"><span class="c-cyan">${m.name}</span>: ${m.desc}</div>`)).join('');
          if (card.mods.some((m) => RISK_MODS.find((x) => x.id === m))) k.classList.add('riskcard');
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

  // Pops up intel for every enemy type seen for the first time, pausing the run.
  showIntro(ids) {
    const r = this.run;
    if (!r) return;
    r.paused = true;
    const queue = ids.slice();
    const next = () => {
      const id = queue.shift();
      if (!id) { this.closeModal(); r.paused = false; return; }
      const boss = BOSSES.some((b) => b.id === id);
      this.openModal((box) => {
        box.classList.add('intelbox');
        box.append(el('h2', '', boss ? '<span style="color:var(--red)">BOSS INCOMING</span>' : 'NEW THREAT DETECTED'));
        box.append(intelCard(id, r));
        const row = el('div', 'mrow');
        row.append(button(queue.length ? 'NEXT' : 'GOT IT', 'go', next));
        box.append(row);
      });
    };
    sfx('alarm');
    next();
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
      const risks = [];
      for (const ch of r.world.chunks.values()) for (const m of ch.mods) { const rm = RISK_MODS.find((x) => x.id === m); if (rm) risks.push(rm.name); }
      if (risks.length) box.append(el('p', 'c-red', 'ACTIVE RISKS: ' + risks.join(' - ')));
      if (r.mutators && r.mutators.length) box.append(el('p', 'c-yel', 'MUTATORS: ' + r.mutators.map((id) => MUTATORS.find((m) => m.id === id).name).join(' - ')));
      if (r.relics.length) box.append(el('p', '', 'RELICS TO INSTALL: ' + r.relics.map((id) => `<span style="color:${RELIC_BY_ID[id].color}">${RELIC_BY_ID[id].name}</span>`).join(' - ') + ' <span class="c-dim">(tap a tower)</span>'));
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
      if (d.mb > 1) box.append(el('p', 'c-yel', `Mutator bonus +${Math.round((d.mb - 1) * 100)}% included`));
      if (d.cmdUps) { const c = COMMANDERS.find((x) => x.id === this.run.commander); box.append(el('p', 'c-yel', `${c.name.toUpperCase()} REACHED LV ${cmdState(c.id).level}! (+${d.cmdUps} skill pt${d.cmdUps > 1 ? 's' : ''})`)); }
      if (d.heatUp) box.append(el('p', 'c-red', `HEAT ${meta.heatUnlocked} UNLOCKED!`));
      for (const a of d.ach) box.append(el('p', 'c-grn', `ACHIEVEMENT: ${a.name} (+${a.shards} shards)`));
      const row = el('div', 'mrow');
      row.append(button('MAIN MENU', '', () => this.app.toMenu()), button('RUN AGAIN', 'go', () => this.app.newRun(meta.commander, meta.heat)));
      box.append(row);
    });
  }
}
