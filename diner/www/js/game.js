'use strict';
// Last Stop Diner, Milestone 1 "Fight Night": game state, save, screens and the main loop.

const SAVE_KEY='lsd_save_v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function newSave(){return{v:1,tips:150,shards:0,locker:[makeGear('spatula',0,1),makeGear('hoodie',0,1),makeGear('tinfoil',0,1),makeGear('trophy',0,1),makeGear('noodle',0,1)],
  ing:{},parts:{},junk:{},best:1,pulleys:[1],delves:0,speed:1,stats:{kills:0,wipes:0}}}

class Game{
  constructor(){this.stage=new Stage($('#stage'));this.save=this.load();this.mode='hub';this.delve=null;this.hudDirty=true;this.hudT=0;this.party=[];this.walkins=[];this.takeout=[];this.startFloor=1;this.rerolls=0;
    this.stage.setScene(DinerScene);this.layout();window.addEventListener('resize',()=>{this.layout()});
    document.addEventListener('click',e=>this.onClick(e));this.bindHud();this.hubActors=[];
    this.title();let last=performance.now();const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;this.frame(dt);requestAnimationFrame(loop)};requestAnimationFrame(loop)}
  // ------------------------------------------------------------ persistence
  load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s&&s.v===1)return s}catch(e){}return null}
  persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(this.save))}catch(e){}}
  ropeLen(){return 6}
  noteFloor(f){if(f>this.save.best){this.save.best=f}}
  // ------------------------------------------------------------ layout & loop
  layout(){const r=this.stage.resize();const ui=$('#ui');Object.assign(this.stage.cv.style,{left:r.x+'px',top:r.y+'px'});Object.assign(ui.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});ui.style.setProperty('--u',r.scale+'px');this.u=r.scale}
  frame(dt){const st=this.stage;
    if(this.mode==='delve'&&this.delve){const d=this.delve;if(!this.paused){d.update(dt);st.update(dt*d.speed)}st.frame(d.actors(),(c,s)=>d.drawUI(c,s));this.hudT-=dt;if(this.hudDirty||this.hudT<=0){this.renderHud();this.hudDirty=false;this.hudT=.15}}
    else{st.update(dt);st.frame(this.hubActors,null)}}
  // ------------------------------------------------------------ click routing
  onClick(e){const el=e.target.closest('[data-a]');if(!el||el.disabled)return;const a=el.dataset.a,v=el.dataset.v;const f=this['a_'+a];if(f)f.call(this,v,el)}
  toast(msg,t=1800){const el=$('#toast');el.textContent=msg;el.hidden=false;clearTimeout(this._tt);this._tt=setTimeout(()=>el.hidden=true,t)}
  show(html){$('#screen').innerHTML=html;$('#modal').hidden=true}
  modal(html){const m=$('#modal');m.innerHTML=`<div class="panel">${html}</div>`;m.hidden=false}
  closeModal(){$('#modal').hidden=true}
  a_close(){this.closeModal()}
  // ------------------------------------------------------------ title & hub
  title(){this.mode='hub';this.stage.setScene(DinerScene);this.show(`<div class="panel hub-title" style="gap:calc(var(--u)*8)"><h1 class="title">LAST STOP<br>DINER</h1><p class="sub">Feed the hungry. Send them into the pit.<br>Cook what they bring back.</p>
    <div class="row">${this.save?'<button class="btn primary" data-a="continue" type="button">Continue</button>':''}<button class="btn ${this.save?'':'primary'}" data-a="newgame" type="button">New game</button></div>
    <p class="sub" style="font-size:calc(var(--u)*5.4)">Milestone 1: Fight Night. Cooking opens in the next update.</p></div>`)}
  a_continue(){this.hub()}
  a_newgame(){if(this.save&&!this._confirmNew){this._confirmNew=true;this.toast('Tap New game again to erase your save');return}this.save=newSave();this.persist();this.hub();this.toast('Dolores left you a diner. And a cat. He bites.',2600)}
  hub(){this.mode='hub';this.stage.setScene(DinerScene);$('#hud').hidden=true;const s=this.save;const smith=s.best>=10;
    this.show(`<div class="panel hub-title"><div class="title" style="font-size:calc(var(--u)*8)">LAST STOP DINER</div>
      <div class="stats" style="margin-top:calc(var(--u)*4)">TIPS <span class="gold">${s.tips}</span> &nbsp; SHARDS <span style="color:var(--cyan)">${s.shards}</span><br>DEEPEST FLOOR B${s.best} &nbsp; DELVES ${s.delves}</div></div>
      <div class="panel hub-menu"><div class="menu">
      <button class="btn primary" data-a="recruit" type="button">Open for business</button>
      <button class="btn" data-a="locker" type="button">Locker (${s.locker.length})</button>
      <button class="btn" data-a="pawn" type="button">Lou's Pawn &amp; Prawn</button>
      <button class="btn" data-a="smith" type="button" ${smith?'':'aria-describedby="smithlock"'}>Blacksmith${smith?'':' (locked)'}</button>
      <button class="btn" data-a="pantry" type="button">Pantry</button>
      ${smith?'':'<div class="lock" id="smithlock">The Blacksmith moves in once someone beats the Gristle Golem on B10.</div>'}
      <div class="spacer"></div><button class="btn sm" data-a="titleback" type="button">Title screen</button></div></div>`)}
  a_titleback(){this.title()}
  a_back(){this.hub()}
  // ------------------------------------------------------------ recruiting
  a_recruit(){this.walkins=[];for(let i=0;i<6;i++)this.walkins.push(makeWalkin(ri(1,2)));this.party=[];this.takeout=[];this.rerolls=0;this.recruitScreen()}
  portrait(w,h=46){const S=humanShapes(w,{bob:0,arm:0});const sp=raster(xform(S,1,w.look.h,0),ST,RAMPS,{},{});const c=sp.c;return c}
  recruitScreen(){const cost=this.rerolls?10:0;
    this.show(`<div class="panel fill"><div class="row"><h2 class="h2">Walk-ins</h2><span class="sub">The Blue Plate Special brought these people in. Pick up to 4.</span><div class="spacer"></div><span class="chip gold">TIPS ${this.save.tips}</span></div>
      <div class="scroll"><div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${this.walkins.map((w,i)=>{const C=CLASSES[w.cls];const n=this.party.indexOf(w);const s=heroStats(w);
        return`<div class="card${n>=0?' sel':''}" data-a="pick" data-v="${i}" role="button" tabindex="0">${n>=0?`<span class="order-n">${n+1}</span>`:''}
        <div class="row" style="flex-wrap:nowrap;align-items:flex-start"><canvas class="portrait" data-portrait="${i}"></canvas><div style="min-width:0"><div class="nm">${esc(w.name)}</div><div class="meta">${esc(w.job)}</div>
        <div class="nm" style="color:${C.col};margin-top:calc(var(--u)*2)">${C.name}</div><div class="meta">${C.role} · ${C.school}</div></div></div>
        <div class="bio">"${esc(w.bio)}"</div><div>${w.traits.map(t=>`<span class="badge" title="${esc(TRAITS[t].desc)}">${TRAITS[t].name}</span>`).join('')}</div>
        <div class="stats">HP ${s.hp} ATK ${s.atk} DEF ${s.def} SPD ${s.spd} CRIT ${s.crit}%</div></div>`}).join('')}</div></div>
      <div class="row"><button class="btn" data-a="back" type="button">Close up</button><button class="btn" data-a="reroll" type="button" ${this.save.tips<cost?'disabled':''}>Serve another round${cost?` (${cost} tips)`:' (free)'}</button><div class="spacer"></div>
      <button class="btn go" data-a="gearup" type="button" ${this.party.length?'':'disabled'}>Gear up (${this.party.length}/4) →</button></div></div>`);
    document.querySelectorAll('[data-portrait]').forEach(cv=>{const w=this.walkins[+cv.dataset.portrait];const p=this.portrait(w);cv.width=p.width;cv.height=p.height;cv.getContext('2d').drawImage(p,0,0)})}
  a_pick(v){const w=this.walkins[+v];const i=this.party.indexOf(w);if(i>=0)this.party.splice(i,1);else if(this.party.length<4)this.party.push(w);else this.toast('The booth only seats 4');this.recruitScreen()}
  a_reroll(){const cost=this.rerolls?10:0;if(this.save.tips<cost)return;this.save.tips-=cost;this.rerolls++;const keep=this.party.slice();this.walkins=keep.concat(Array.from({length:6-keep.length},()=>makeWalkin(ri(1,2))));this.recruitScreen()}
  // ------------------------------------------------------------ gear up
  usedBy(g){return this.party.find(w=>Object.values(w.gear).some(x=>x&&x.id===g.id))}
  a_gearup(){if(!this.party.length)return;this.gearScreen()}
  gearScreen(){this.show(`<div class="panel fill"><div class="row"><h2 class="h2">Gear up</h2><span class="sub">Gear always comes home, even if they get minted.</span></div>
    <div class="scroll"><div class="grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">${this.party.map((w,i)=>{const C=CLASSES[w.cls];const s=heroStats(w);
      return`<div class="card" style="cursor:default"><canvas class="portrait" data-gp="${i}"></canvas><div class="nm">${esc(w.name)}</div><div class="meta" style="color:${C.col}">${C.name}</div>
      ${SLOTS.map(sl=>{const g=w.gear[sl];return`<button class="slot ${g?'b'+g.rar:''}" data-a="slot" data-v="${i}:${sl}" type="button"><small>${SLOT_NAME[sl]}</small>${g?`<span class="r${g.rar}">${esc(gearName(g))}</span>`:'<span class="sub">empty</span>'}</button>`}).join('')}
      <div class="stats">HP ${s.hp} ATK ${s.atk} DEF ${s.def}<br>SPD ${s.spd} CRIT ${s.crit}%</div>
      <button class="btn sm" data-a="row" data-v="${i}" type="button">Row: ${w.row==='front'?'Front':'Back'}</button></div>`}).join('')}</div></div>
    <div class="row"><button class="btn" data-a="recruitback" type="button">← Walk-ins</button><div class="spacer"></div><button class="btn go" data-a="counter" type="button">To the counter →</button></div></div>`);
    document.querySelectorAll('[data-gp]').forEach(cv=>{const p=this.portrait(this.party[+cv.dataset.gp]);cv.width=p.width;cv.height=p.height;cv.getContext('2d').drawImage(p,0,0)})}
  a_recruitback(){this.recruitScreen()}
  a_row(v){const w=this.party[+v];w.row=w.row==='front'?'back':'front';this.gearScreen()}
  a_slot(v){const[i,sl]=v.split(':');const w=this.party[+i];const items=this.save.locker.filter(g=>GEAR[g.base].slot===sl).sort((a,b)=>b.rar-a.rar||b.up-a.up);
    this.modal(`<div class="row"><h2 class="h2">${SLOT_NAME[sl]} for ${esc(w.name)}</h2></div><div class="scroll list" style="max-height:60vh">${w.gear[sl]?`<div class="item"><div class="nm"><b>Take it off</b></div><button class="btn sm" data-a="equip" data-v="${i}:${sl}:" type="button">Unequip</button></div>`:''}
      ${items.length?items.map(g=>{const by=this.usedBy(g);const st=gearStats(g);return`<div class="item b${g.rar}"><div class="nm"><b class="r${g.rar}">${esc(gearName(g))}</b><small>${statLine(st)}${by&&by!==w?` · worn by ${esc(by.name)}`:''}</small></div><button class="btn sm" data-a="equip" data-v="${i}:${sl}:${g.id}" type="button">${by===w?'Worn':'Equip'}</button></div>`}).join(''):'<p class="sub">Nothing for this slot yet. Find some in the pit.</p>'}</div>
      <div class="row"><div class="spacer"></div><button class="btn" data-a="close" type="button">Done</button></div>`)}
  a_equip(v){const[i,sl,id]=v.split(':');const w=this.party[+i];if(!id){w.gear[sl]=null}else{const g=this.save.locker.find(x=>x.id===id);const by=this.usedBy(g);if(by)for(const k of SLOTS)if(by.gear[k]&&by.gear[k].id===id)by.gear[k]=null;w.gear[sl]=g}this.closeModal();this.gearScreen()}
  // ------------------------------------------------------------ counter: takeout and start floor
  a_counter(){if(!this.save.pulleys.includes(this.startFloor))this.startFloor=1;this.counterScreen()}
  counterScreen(){const s=this.save;
    this.show(`<div class="panel fill"><div class="row"><h2 class="h2">The counter</h2><span class="sub">Pack takeout for the trip (4 max) and pick where to start.</span><div class="spacer"></div><span class="chip gold">TIPS ${s.tips}</span></div>
      <div class="scroll"><div class="grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">${Object.entries(TAKEOUT).map(([k,t])=>`<div class="card" data-a="buy" data-v="${k}" role="button" tabindex="0"><div class="nm" style="color:${t.col}">${t.name}</div><div class="meta">${t.desc}</div><div class="gold px" style="font-size:calc(var(--u)*5)">${t.price} TIPS</div></div>`).join('')}</div>
      <p class="sub" style="margin-top:calc(var(--u)*6)">Packed: ${this.takeout.length?this.takeout.map((k,i)=>`<button class="btn sm" data-a="unbuy" data-v="${i}" type="button">${TAKEOUT[k].name} ✕</button>`).join(' '):'nothing yet'}</p>
      <div class="row" style="margin-top:calc(var(--u)*6)"><span class="px" style="font-size:calc(var(--u)*5.4)">START AT</span>${s.pulleys.slice().sort((a,b)=>a-b).map(f=>`<button class="btn sm" data-a="start" data-v="${f}" aria-pressed="${f===this.startFloor}" type="button" style="${f===this.startFloor?'background:var(--cyan);color:#06202a':''}">B${f}</button>`).join('')}
      <span class="sub">Rope reaches ${this.ropeLen()} floors below where you start. Past that, Ring the Bell won't work until the next Pulley Station.</span></div></div>
      <div class="row"><button class="btn" data-a="gearback" type="button">← Gear up</button><div class="spacer"></div><button class="btn primary" data-a="descend" type="button">Descend into the Gutter</button></div></div>`)}
  a_gearback(){this.gearScreen()}
  a_buy(k){const t=TAKEOUT[k];if(this.takeout.length>=4)return this.toast('Takeout bag is full');if(this.save.tips<t.price)return this.toast('Not enough tips');this.save.tips-=t.price;this.takeout.push(k);this.counterScreen()}
  a_unbuy(i){const k=this.takeout.splice(+i,1)[0];this.save.tips+=TAKEOUT[k].price;this.counterScreen()}
  a_start(f){this.startFloor=+f;this.counterScreen()}
  a_descend(){const f=this.startFloor;for(const w of this.party)w.level+=Math.floor((f-1)*.9);this.save.delves++;this.persist();
    this.mode='delve';this.stage.setScene(GutterScene);this.show('');this.delve=new Delve(this,this.party,this.takeout,f);$('#hud').hidden=false;this.paused=false;this.hudDirty=true;this.renderHud(true)}
  // ------------------------------------------------------------ delve HUD
  bindHud(){$('#btn-speed').addEventListener('click',()=>{const d=this.delve;if(!d)return;d.speed=d.speed===1?2:d.speed===2?4:1;this.save.speed=d.speed;this.hudDirty=true});
    $('#btn-bell').addEventListener('click',()=>{const d=this.delve;if(!d)return;if(!d.canBell())return this.toast(`Out of rope. Next Pulley Station: B${Math.ceil(d.floor/10)*10}`);d.ringBell()});
    $('#btn-order').addEventListener('click',()=>{const d=this.delve;if(!d)return;this.toast(d.meter>=100?'Tap a hero below to fire their signature move':'Order Up fills as your party deals and takes damage')});
    $('#hud-heroes').addEventListener('click',e=>{const el=e.target.closest('.hero');if(!el||!this.delve)return;const h=this.delve.heroes[+el.dataset.i];if(this.delve.orderUp(h))this.toast(`${h.name}: ${CLASSES[h.cls].sig}!`,1000)});
    $('#hud-takeout').addEventListener('click',e=>{const el=e.target.closest('[data-t]');if(!el||!this.delve)return;this.delve.useTakeout(+el.dataset.t)})}
  renderHud(force){const d=this.delve;if(!d)return;const b=d.bag;const items=b.gear.length+Object.values(b.ing).reduce((a,c)=>a+c,0)+Object.values(b.parts).reduce((a,c)=>a+c,0)+Object.values(b.junk).reduce((a,c)=>a+c,0);
    $('#hud-floor').innerHTML=`B${d.floor} · ${d.canBell()?`<span style="color:var(--mint)">ROPE TO B${d.anchor+d.rope}</span>`:'<span style="color:var(--red)">OUT OF ROPE</span>'}`;
    $('#hud-loot').textContent=`${b.tips} TIPS · ${items} LOOT${d.banked?' · BANKED':''}`;
    $('#btn-speed').textContent=d.speed+'×';
    const rail=d.state==='fight'?d.predict(6):[];$('#rail').innerHTML=rail.map(u=>`<span class="${u.side==='enemy'?'e':''}">${esc(u.name.split(' ')[0].slice(0,8).toUpperCase())}</span>`).join('');
    $('#hud-takeout').innerHTML=[0,1,2,3].map(i=>{const k=d.takeout[i];return k?`<button class="btn" data-t="${i}" type="button" style="color:${TAKEOUT[k].col}">${TAKEOUT[k].name}</button>`:'<button class="btn empty" type="button" disabled>—</button>'}).join('');
    $('#hud-heroes').innerHTML=d.heroes.map((h,i)=>`<div class="hero${h.alive?'':' down'}${d.meter>=100&&h.alive?' ready':''}" data-i="${i}" role="button" tabindex="0"><div class="n" style="color:${CLASSES[h.cls].col}">${esc(h.name)} <span style="color:var(--muted)">L${h.level}</span></div><div class="c">${h.alive?CLASSES[h.cls].name:h.left?'headed out':'minted home'}</div><div class="bar"><i style="width:${Math.max(0,h.hp/h.stats.hp*100)}%"></i></div></div>`).join('');
    const o=$('#btn-order');o.classList.toggle('full',d.meter>=100);$('#order-fill').style.width=d.meter+'%';
    $('#btn-bell').disabled=!d.canBell()||['retreat','wipe','pulley','done'].includes(d.state)}
  onPulley(d){this.save.pulleys.includes(d.floor)||this.save.pulleys.push(d.floor);if(d.floor>=10)this.save.best=Math.max(this.save.best,d.floor);this.persist();
    this.modal(`<h2 class="h2">Pulley Station B${d.floor}</h2><p class="sub">The Gristle Golem is down. There's a working pulley here, so the rope can reset.<br>You can now start future delves from B${d.floor}.</p>
      <div class="row"><button class="btn go" data-a="rideup" type="button">Ride up with everything</button><button class="btn primary" data-a="keepgoing" type="button">Keep going (rope resets here)</button></div>`)}
  a_rideup(){this.closeModal();this.delve.finish('pulley')}
  a_keepgoing(){this.closeModal();this.delve.keepGoing();this.hudDirty=true}
  // ------------------------------------------------------------ end of delve: receipt
  onDelveEnd(r){const s=this.save,L=r.loot;s.tips+=L.tips;s.shards+=L.shards;for(const g of L.gear)s.locker.push(g);for(const k of['ing','parts','junk'])for(const id in L[k])s[k][id]=(s[k][id]||0)+L[k][id];
    s.stats.kills+=r.stats.kills;if(r.kind==='wipe')s.stats.wipes++;this.noteFloor(r.floor);this.persist();$('#hud').hidden=true;this.mode='hub';this.stage.setScene(DinerScene);this.delve=null;
    const head={retreat:'RANG THE BELL',wipe:'PARTY WIPED',pulley:'PULLEY STATION RIDE'}[r.kind];const mvp=Object.entries(r.stats.dmg).sort((a,b)=>b[1]-a[1])[0];
    const ln=(a,b,c='')=>`<div class="ln ${c}"><span>${esc(a)}</span><span>${esc(b)}</span></div>`;
    const lines=[];for(const g of L.gear)lines.push(ln(gearName(g),RARITY[g.rar].name,'r'+g.rar));for(const id in L.ing)lines.push(ln(INGREDIENTS[id].name,'x'+L.ing[id],'r'+INGREDIENTS[id].rar));for(const id in L.parts)lines.push(ln(PARTS[id].name,'x'+L.parts[id]));for(const id in L.junk)lines.push(ln(JUNK[id].name,'x'+L.junk[id]));
    const fates=r.heroes.map(h=>ln(h.w.name,h.left?'headed out':h.alive?'took the tram home':'minted home'));
    this.show(`<div class="panel fill"><div class="scroll"><div class="receipt"><h3>LAST STOP DINER</h3><div style="text-align:center">*** ${head} ***</div><hr>
      ${ln('DEEPEST FLOOR','B'+r.floor)}${ln('FLOORS CLEARED',r.stats.floors)}${ln('MONSTERS BONKED',r.stats.kills)}${mvp?ln('MVP',mvp[0]+' ('+mvp[1]+' dmg)'):''}<hr>
      ${r.kind==='wipe'?`<div style="text-align:center">ON THE TAB (25%)${r.loot!==r.full&&this.delve===null?'':''}</div>`:''}
      ${ln('TIPS',L.tips)}${L.shards?ln('MANA SHARDS',L.shards):''}${lines.join('')||ln('ITEMS','none')}<hr>${fates.join('')}<hr>
      <div style="text-align:center">THANK YOU FOR DELVING<br>PLEASE TIP YOUR HEROES</div></div></div>
      <div class="row"><div class="spacer"></div><button class="btn go" data-a="back" type="button">Back to the diner</button></div></div>`)}
  // ------------------------------------------------------------ locker
  a_locker(){this.lockerScreen()}
  lockerScreen(sel){const s=this.save;const items=s.locker.slice().sort((a,b)=>SLOTS.indexOf(GEAR[a.base].slot)-SLOTS.indexOf(GEAR[b.base].slot)||b.rar-a.rar);const g=sel&&s.locker.find(x=>x.id===sel);
    this.show(`<div class="panel fill"><div class="row"><h2 class="h2">Locker</h2><span class="sub">Everything you own. Walk-ins borrow it for a delve and bring it back.</span></div>
      <div class="row scroll" style="align-items:stretch;flex-wrap:nowrap"><div class="scroll list" style="flex:1.3">${items.map(x=>`<div class="item b${x.rar}" data-a="lsel" data-v="${x.id}" role="button" tabindex="0" style="cursor:pointer${x===g?';outline:calc(var(--u)*1) solid var(--mint)':''}"><div class="nm"><b class="r${x.rar}">${esc(gearName(x))}</b><small>${SLOT_NAME[GEAR[x.base].slot]} · ${RARITY[x.rar].name} · item level ${x.ilvl}</small></div></div>`).join('')||'<p class="sub">Empty. Go find some meme gear.</p>'}</div>
      <div class="card" style="flex:1;cursor:default">${g?gearDetail(g):'<p class="sub">Tap an item to see its stats.</p>'}</div></div>
      <div class="row"><button class="btn" data-a="back" type="button">← Diner</button></div></div>`)}
  a_lsel(v){this.lockerScreen(v)}
  // ------------------------------------------------------------ pawn shop
  a_pawn(){this.pawnTab='gear';this.lou=pick(LOU_LINES);this.pawnScreen()}
  pawnScreen(){const s=this.save,t=this.pawnTab;let rows='';
    if(t==='gear')rows=s.locker.slice().sort((a,b)=>a.rar-b.rar).map(g=>`<div class="item b${g.rar}"><div class="nm"><b class="r${g.rar}">${esc(gearName(g))}</b><small>${statLine(gearStats(g))}</small></div><span class="gold px">${gearPrice(g)}</span><button class="btn sm" data-a="sellgear" data-v="${g.id}" type="button">Sell</button></div>`).join('');
    else{const tab={junk:[s.junk,JUNK],parts:[s.parts,PARTS],ing:[s.ing,INGREDIENTS]}[t];rows=Object.entries(tab[0]).filter(([,n])=>n>0).map(([id,n])=>{const D=tab[1][id];const p=D.price||[2,4,9,18,40][D.rar];return`<div class="item"><div class="nm"><b class="${D.rar!==undefined?'r'+D.rar:''}">${esc(D.name)} ×${n}</b><small>${esc(D.desc)}</small></div><span class="gold px">${p}</span><button class="btn sm" data-a="sellstack" data-v="${t}:${id}:1" type="button">Sell 1</button><button class="btn sm" data-a="sellstack" data-v="${t}:${id}:${n}" type="button">All</button></div>`}).join('')}
    this.show(`<div class="panel fill"><div class="row"><h2 class="h2">Lou's Pawn &amp; Prawn</h2><span class="quote">${esc(this.lou)}</span><div class="spacer"></div><span class="chip gold">TIPS ${s.tips}</span></div>
      <div class="tabs">${[['gear','Gear'],['junk','Junk'],['parts','Monster parts'],['ing','Ingredients']].map(([k,n])=>`<button class="btn sm" data-a="pawntab" data-v="${k}" aria-pressed="${k===t}" type="button">${n}</button>`).join('')}${t==='junk'&&Object.values(s.junk).some(n=>n)?'<button class="btn sm" data-a="selljunk" type="button">Sell all junk</button>':''}</div>
      <div class="scroll list">${rows||'<p class="sub">Nothing to sell here.</p>'}</div>${t!=='gear'&&t!=='junk'?'<p class="sub">Monster parts and ingredients are also used for cooking (next update) and forging.</p>':''}
      <div class="row"><button class="btn" data-a="back" type="button">← Diner</button></div></div>`)}
  a_pawntab(v){this.pawnTab=v;this.pawnScreen()}
  a_sellgear(id){const s=this.save;const i=s.locker.findIndex(g=>g.id===id);if(i<0)return;const g=s.locker[i];s.tips+=gearPrice(g);s.locker.splice(i,1);this.lou=pick(LOU_LINES);this.persist();this.pawnScreen()}
  a_sellstack(v){const[t,id,n]=v.split(':');const s=this.save;const tab={junk:[s.junk,JUNK],parts:[s.parts,PARTS],ing:[s.ing,INGREDIENTS]}[t];const D=tab[1][id];const p=D.price||[2,4,9,18,40][D.rar];const k=Math.min(+n,tab[0][id]||0);tab[0][id]-=k;if(!tab[0][id])delete tab[0][id];s.tips+=p*k;this.lou=pick(LOU_LINES);this.persist();this.pawnScreen()}
  a_selljunk(){const s=this.save;let t=0;for(const id in s.junk)t+=JUNK[id].price*s.junk[id];s.junk={};s.tips+=t;this.lou=`Lou: "${t} tips for all that? I'm robbing myself."`;this.persist();this.pawnScreen()}
  // ------------------------------------------------------------ blacksmith
  a_smith(){if(this.save.best<10)return this.toast('Beat the Gristle Golem on B10 first');this.smithTab='up';this.brun=pick(SMITH_LINES);this.smithScreen()}
  partCount(){return Object.values(this.save.parts).reduce((a,c)=>a+c,0)}
  smithScreen(sel){const s=this.save,t=this.smithTab;let body='';
    if(t==='up'){const g=sel&&s.locker.find(x=>x.id===sel);body=`<div class="row" style="align-items:stretch;flex-wrap:nowrap;flex:1;min-height:0"><div class="scroll list" style="flex:1.2">${s.locker.slice().sort((a,b)=>b.rar-a.rar).map(x=>`<div class="item b${x.rar}" data-a="ssel" data-v="${x.id}" role="button" tabindex="0" style="cursor:pointer${x===g?';outline:calc(var(--u)*1) solid var(--mint)':''}"><div class="nm"><b class="r${x.rar}">${esc(gearName(x))}</b></div></div>`).join('')}</div>
      <div class="card" style="flex:1;cursor:default">${g?(()=>{const c=upgradeCost(g);const ok=g.up<10&&s.tips>=c.tips&&this.partCount()>=c.parts&&s.shards>=c.shards;return gearDetail(g)+(g.up>=10?'<p class="gold">Fully upgraded. Absolutely busted.</p>':`<p class="stats">NEXT: +${g.up+1}<br>COST: ${c.tips} TIPS, ${c.parts} ANY MONSTER PARTS${c.shards?`, ${c.shards} SHARDS`:''}<br>YOU HAVE: ${s.tips} TIPS, ${this.partCount()} PARTS, ${s.shards} SHARDS</p><button class="btn go" data-a="upgrade" data-v="${g.id}" type="button" ${ok?'':'disabled'}>Upgrade</button>`)})():'<p class="sub">Pick something to hit with a hammer.</p>'}</div></div>`}
    else body=`<div class="scroll list">${FORGE.map(f=>{const G=GEAR[f.id];const ok=s.tips>=f.tips&&Object.entries(f.need).every(([p,n])=>(s.parts[p]||0)>=n);return`<div class="item"><div class="nm"><b>${G.name}</b><small>${SLOT_NAME[G.slot]} · ${statLine(G.st)} · needs ${Object.entries(f.need).map(([p,n])=>`${n} ${PARTS[p].name} (${s.parts[p]||0})`).join(', ')}</small></div><span class="gold px">${f.tips}</span><button class="btn sm" data-a="forge" data-v="${f.id}" type="button" ${ok?'':'disabled'}>Forge</button></div>`}).join('')}</div><p class="sub">Forged gear rolls a random rarity, and Uncommon is the minimum.</p>`;
    this.show(`<div class="panel fill"><div class="row"><h2 class="h2">Blacksmith</h2><span class="quote">${esc(this.brun)}</span><div class="spacer"></div><span class="chip gold">TIPS ${s.tips}</span></div>
      <div class="tabs"><button class="btn sm" data-a="smithtab" data-v="up" aria-pressed="${t==='up'}" type="button">Upgrade</button><button class="btn sm" data-a="smithtab" data-v="forge" aria-pressed="${t==='forge'}" type="button">Forge</button></div>${body}
      <div class="row"><button class="btn" data-a="back" type="button">← Diner</button></div></div>`)}
  a_smithtab(v){this.smithTab=v;this.smithScreen()}
  a_ssel(v){this.smithScreen(v)}
  spendParts(n){const s=this.save;const ids=Object.keys(s.parts).sort((a,b)=>PARTS[a].rar-PARTS[b].rar);for(const id of ids){while(n>0&&s.parts[id]>0){s.parts[id]--;n--}if(!s.parts[id])delete s.parts[id]}}
  a_upgrade(id){const s=this.save;const g=s.locker.find(x=>x.id===id);const c=upgradeCost(g);if(g.up>=10||s.tips<c.tips||this.partCount()<c.parts||s.shards<c.shards)return;s.tips-=c.tips;s.shards-=c.shards;this.spendParts(c.parts);g.up++;this.brun=pick(SMITH_LINES);this.persist();this.toast(`${gearName(g)}!`);this.smithScreen(id)}
  a_forge(id){const s=this.save,f=FORGE.find(x=>x.id===id);if(s.tips<f.tips||!Object.entries(f.need).every(([p,n])=>(s.parts[p]||0)>=n))return;s.tips-=f.tips;for(const[p,n]of Object.entries(f.need)){s.parts[p]-=n;if(!s.parts[p])delete s.parts[p]}
    const r=Math.max(1,rollRarity(s.best,.3).id);const g=makeGear(id,r,s.best);s.locker.push(g);this.persist();this.toast(`Forged: ${gearName(g)}`);this.smithScreen()}
  // ------------------------------------------------------------ pantry
  a_pantry(){const s=this.save;const ing=Object.entries(s.ing).sort((a,b)=>INGREDIENTS[b[0]].rar-INGREDIENTS[a[0]].rar);const parts=Object.entries(s.parts);
    this.show(`<div class="panel fill"><div class="row"><h2 class="h2">Pantry</h2><span class="sub">The cooking mini-game opens in the next update. Start hoarding.</span></div>
      <div class="scroll list">${ing.map(([id,n])=>{const I=INGREDIENTS[id];return`<div class="item b${I.rar}"><div class="nm"><b class="r${I.rar}">${esc(I.name)} ×${n}</b><small>${RARITY[I.rar].name} · ${I.fl.join(', ')} · ${esc(I.desc)}</small></div></div>`}).join('')}
      ${parts.map(([id,n])=>{const P=PARTS[id];return`<div class="item"><div class="nm"><b class="r${P.rar}">${esc(P.name)} ×${n}</b><small>Monster part · ${esc(P.desc)}</small></div></div>`}).join('')}${!ing.length&&!parts.length?'<p class="sub">Empty. Every monster in the pit is a potential ingredient.</p>':''}</div>
      <div class="row"><button class="btn" data-a="back" type="button">← Diner</button></div></div>`)}
}
function statLine(st){const o=[];for(const[k,n]of[['hp','HP'],['atk','ATK'],['def','DEF'],['spd','SPD'],['crit','CRIT']])if(st[k])o.push(`${n} ${st[k]>0?'+':''}${st[k]}${k==='crit'?'%':''}`);for(const[k,n]of[['atkP','ATK'],['hpP','HP'],['allP','ALL']])if(st[k])o.push(`${n} ${st[k]>0?'+':''}${Math.round(st[k]*100)}%`);if(st.res)o.push('stun resist');return o.join(' · ')||'no stats (vibes only)'}
function gearDetail(g){const B=GEAR[g.base];return`<div class="nm r${g.rar}">${esc(gearName(g))}</div><div class="meta">${SLOT_NAME[B.slot]} · ${RARITY[g.rar].name} · item level ${g.ilvl}${g.up?` · upgraded +${g.up}`:''}</div><div class="stats">${statLine(gearStats(g)).replace(/ · /g,'<br>')}</div><div class="meta">Lou would pay ${gearPrice(g)} tips.</div>`}

window.game=new Game();
