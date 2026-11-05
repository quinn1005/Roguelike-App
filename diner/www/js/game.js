'use strict';
// Last Stop Diner, Milestone 1 "Fight Night": game state, save, screens and the main loop.

const SAVE_KEY='lsd_save_v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function newSave(){return{v:1,tips:150,shards:0,locker:[makeGear('spatula',0,1),makeGear('hoodie',0,1),makeGear('tinfoil',0,1),makeGear('trophy',0,1),makeGear('noodle',0,1)],
  ing:{},parts:{},junk:{},best:1,pulleys:[1],delves:0,speed:1,stats:{kills:0,wipes:0}}}

class Game{
  constructor(){this.stage=new Stage($('#stage'));this.save=this.load();this.mode='hub';this.delve=null;this.hudDirty=true;this.hudT=0;this.party=[];this.walkins=[];this.takeout=[];this.startFloor=1;this.rerolls=0;this.targeting=null;this.returnTo='inside';
    this.stage.setScene(DinerScene);this.layout();window.addEventListener('resize',()=>{this.layout();if($('#modal').hidden){if(this.mode==='inside')this.inside();else if(this.mode==='street')this.street()}});
    document.addEventListener('click',e=>this.onClick(e));this.bindHud();this.hubActors=[];
    $('#ui').classList.toggle('labels',!!(this.save&&this.save.labels));this.title();let last=performance.now();const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;this.frame(dt);requestAnimationFrame(loop)};requestAnimationFrame(loop)}
  // ------------------------------------------------------------ persistence
  load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s&&s.v===1)return s}catch(e){}return null}
  persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(this.save))}catch(e){}}
  ropeLen(){return 6}
  noteFloor(f){if(f>this.save.best){this.save.best=f}}
  // ------------------------------------------------------------ layout & loop
  layout(){const r=this.stage.resize();const ui=$('#ui');Object.assign(this.stage.cv.style,{left:r.x+'px',top:r.y+'px'});Object.assign(ui.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});ui.style.setProperty('--u',r.scale+'px');this.u=r.scale}
  frame(dt){const st=this.stage;
    if(this.mode==='delve'&&this.delve){const d=this.delve;if(!this.paused){d.update(dt);st.update(dt*d.speed)}st.frame(d.actors(),(c,s)=>d.drawUI(c,s));this.hudT-=dt;if(this.hudDirty||this.hudT<=0){this.renderHud();this.hudDirty=false;this.hudT=.15}}
    else if(this.mode==='inside'){st.update(dt);st.frame(this.customerActors(),(c,s)=>{this.markers(c,s);this.insideUI(c,s)})}
    else{st.update(dt);st.frame([],this.mode==='street'?(c,s)=>this.markers(c,s):null)}}
  // ------------------------------------------------------------ click routing
  onClick(e){const el=e.target.closest('[data-a]');if(!el&&this.mode==='delve'&&this.targeting&&this.delve&&!e.target.closest('button,.hero,#modal')){const r=this.stage.cv.getBoundingClientRect();const st=this.stage;const xu=(((e.clientX-r.left)/st.scale)-st.ox)/st.S,yu=((e.clientY-r.top)/st.scale)/st.S;const u=this.delve.unitAt(xu,yu);if(u)this.pickTarget(u);return}
    if(!el||el.disabled)return;const a=el.dataset.a,v=el.dataset.v;const f=this['a_'+a];if(f)f.call(this,v,el)}
  toast(msg,t=1800){const el=$('#toast');el.textContent=msg;el.hidden=false;clearTimeout(this._tt);this._tt=setTimeout(()=>el.hidden=true,t)}
  show(html){$('#screen').innerHTML=html;$('#modal').hidden=true}
  modal(html){const m=$('#modal');m.innerHTML=`<div class="panel">${html}</div>`;m.hidden=false}
  closeModal(){$('#modal').hidden=true}
  a_close(){this.closeModal()}
  // ------------------------------------------------------------ title, street and the diner interior
  title(){this.mode='street';this.stage.setScene(DinerScene);$('#hud').hidden=true;this.show(`<div class="panel hub-title" style="gap:calc(var(--u)*8)"><h1 class="title">LAST STOP<br>DINER</h1><p class="sub">Feed the hungry. Send them into the pit.<br>Cook what they bring back.</p>
    <div class="row">${this.save?'<button class="btn primary" data-a="continue" type="button">Continue</button>':''}<button class="btn ${this.save?'':'primary'}" data-a="newgame" type="button">New game</button></div>
    <p class="sub" style="font-size:calc(var(--u)*5.4)">Milestone 1: Fight Night. Cooking opens in the next update.</p></div>`)}
  a_continue(){this.inside()}
  a_newgame(){if(this.save&&!this._confirmNew){this._confirmNew=true;this.toast('Tap New game again to erase your save');return}this.save=newSave();this.persist();this.walkins=[];this.inside();this.toast('Dolores left you a diner. And a cat. He bites.',2600)}
  a_titleback(){this.title()}
  a_back(){this.closeModal();if(this.returnTo==='street')this.street();else this.inside()}
  hotspots(list){this.hotList=list;return list.map(h=>{const st=this.stage;const x=(st.u(h.x)+st.ox)*st.scale,y=st.u(h.y)*st.scale,w=st.u(h.w)*st.scale,hh=st.u(h.h)*st.scale;
    return`<button class="hot${h.lock?' locked':''}" data-a="${h.a}" ${h.v!==undefined?`data-v="${h.v}"`:''} type="button" style="left:${x}px;top:${y}px;width:${w}px;height:${hh}px" aria-label="${esc(h.label)}"><span class="${h.below?'below':''}">${esc(h.label)}</span></button>`}).join('')}
  markers(c,st){if(!this.hotList)return;for(const h of this.hotList){if(h.a==='cust')continue;const X=st.sx(h.x+h.w/2),Y=st.u(h.y)-3+Math.round(Math.sin(st.t*3+h.x)*1.5);c.fillStyle='#1d1526';c.fillRect(X-3,Y-1,7,5);c.fillStyle=h.lock?'#8a7a9a':'#7dffb0';c.fillRect(X-2,Y+1,5,1);c.fillRect(X-1,Y,3,3);c.fillRect(X,Y-1,1,5)}}
  statsChip(){const s=this.save;return`<div class="topbar"><div class="chip">TIPS <span class="gold">${s.tips}</span> · SHARDS <span style="color:var(--cyan)">${s.shards}</span> · DEEPEST B${s.best}</div><div class="spacer"></div><button class="btn sm" data-a="labels" aria-pressed="${!!s.labels}" type="button">Labels</button><button class="btn sm" data-a="jukebox" type="button">Settings</button></div>`}
  a_labels(){this.save.labels=!this.save.labels;this.persist();$('#ui').classList.toggle('labels',!!this.save.labels);if(this.mode==='inside')this.inside();else this.street()}
  street(){this.mode='street';this.returnTo='street';this.stage.setScene(DinerScene);$('#hud').hidden=true;const smith=this.save.best>=10;
    this.show(this.statsChip()+this.hotspots([{a:'goin',label:'Go inside',x:18,y:38,w:142,h:84},{a:'pawn',label:"Lou's Pawn & Prawn",x:166,y:70,w:70,h:52},{a:'smith',label:smith?'Blacksmith':'Blacksmith (locked)',lock:!smith,x:240,y:58,w:64,h:64}])+
      `<div class="tip-line">Tap the diner to go back inside. Green markers show what you can use.</div>`)}
  a_goin(){this.inside()}
  seats(){return[{x:56,y:136,f:1},{x:86,y:136,f:1},{x:180,y:144,f:1},{x:204,y:144,f:-1},{x:244,y:144,f:1},{x:268,y:144,f:-1}]}
  inside(){this.mode='inside';this.returnTo='inside';this.stage.setScene(InteriorScene);$('#hud').hidden=true;if(!this.walkins.length){this.walkins=Array.from({length:6},()=>makeWalkin(ri(1,2)));this.party=[];this.takeout=[];this.rerolls=0}
    const seats=this.seats();const cust=this.walkins.map((w,i)=>({a:'cust',v:i,label:w.name.split(' ')[0],x:seats[i].x-9,y:seats[i].y-34,w:18,h:i<2?34:20,below:true}));
    this.hotList=null;this.show(this.statsChip()+this.hotspots([{a:'door',label:'Outside',x:3,y:48,w:24,h:64},{a:'kitchen',label:'Kitchen',x:33,y:38,w:60,h:44},{a:'dumbwaiter',label:'Dumbwaiter (to the pit)',x:98,y:40,w:28,h:46},{a:'locker',label:'Locker',x:130,y:50,w:20,h:38},
      {a:'register',label:'Register',x:134,y:84,w:16,h:12,below:true},{a:'moss',label:'Moss',x:117,y:82,w:12,h:14},{a:'cat',label:'Meatball',x:66,y:86,w:20,h:10,below:true},{a:'jukebox',label:'Jukebox',x:290,y:86,w:24,h:42}].concat(cust))+
      `<div class="partybar"><span class="px">PARTY ${this.party.length}/4</span>${this.party.map(w=>`<button class="btn sm" data-a="unpick" data-v="${w.id}" type="button" style="color:${CLASSES[w.cls].col}">${esc(w.name.split(' ')[0])} ✕</button>`).join('')}<span class="sub">${this.party.length?'Ready? Use the Dumbwaiter.':'Tap a customer to see who they are.'}</span></div>`)}
  customerActors(){if(!this.walkins.length)return[];const seats=this.seats(),t=this.stage.t;if(!this._cc)this._cc=new Map();
    return this.walkins.map((w,i)=>{const s=seats[i];const eat=Math.pow(Math.max(0,Math.sin(t*1.1+i*2.1)),6);const pose={bob:Math.round(Math.sin(t*2+i)*.4*4)/4,cast:Math.round(eat*.6*10)/10};const key=w.id+JSON.stringify(pose)+s.f;
      let c=this._cc.get(key);if(!c){let S=humanShapes(w,pose);if(s.f<0)S=mirrorShapes(S);c=raster(xform(S,1,w.look.h,0),ST,RAMPS,{rim:hexRgb('#ffb070')},{});this._cc.set(key,c);if(this._cc.size>200)this._cc.delete(this._cc.keys().next().value)}
      return{sprite:c,x:s.x,y:s.y,shadow:i<2?7:0}})}
  insideUI(c,st){const seats=this.seats();this.party.forEach((w,k)=>{const i=this.walkins.indexOf(w);if(i<0)return;const s=seats[i];const X=st.sx(s.x),Y=st.u(s.y-(i<2?44:40))-Math.round(Math.sin(st.t*5)*1.5);c.fillStyle='#7dffb0';for(let j=0;j<4;j++)c.fillRect(X-4+j,Y+j,9-j*2,1);textO(c,String(k+1),X-1,Y-7,1,'#7dffb0','#1d1526')})}
  a_cust(v){const w=this.walkins[+v];const C=CLASSES[w.cls];const s=heroStats(w);const inP=this.party.includes(w);
    this.modal(`<div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:calc(var(--u)*8)"><canvas class="portrait big" id="mp"></canvas><div style="min-width:0;display:flex;flex-direction:column;gap:calc(var(--u)*3)">
      <div class="h2">${esc(w.name)}</div><div class="meta">${esc(w.job)}</div><div class="nm px" style="color:${C.col};font-size:calc(var(--u)*6)">${C.name}</div><div class="meta">${C.role} · ${C.school} school · ${C.range}</div>
      <div class="meta">Signature: <b>${C.sig}</b>. ${C.sigDesc}</div><div class="bio">"${esc(w.bio)}"</div>
      <div>${w.traits.map(t=>`<span class="badge" title="${esc(TRAITS[t].desc)}">${TRAITS[t].name}</span><span class="meta">${esc(TRAITS[t].desc)}</span><br>`).join('')}</div>
      <div class="stats">LV ${w.level} · HP ${s.hp} ATK ${s.atk} DEF ${s.def} SPD ${s.spd} CRIT ${s.crit}%</div></div></div>
      <div class="row"><button class="btn" data-a="close" type="button">Keep eating</button><div class="spacer"></div><button class="btn ${inP?'':'go'}" data-a="pick" data-v="${v}" type="button">${inP?'Remove from party':'Recruit'}</button></div>`);
    const cv=$('#mp');const p=this.portrait(w);cv.width=p.width;cv.height=p.height;cv.getContext('2d').drawImage(p,0,0)}
  portrait(w){const S=humanShapes(w,{bob:0,arm:0});return raster(xform(S,1,w.look.h,0),ST,RAMPS,{},{}).c}
  a_pick(v){const w=this.walkins[+v];const i=this.party.indexOf(w);if(i>=0)this.party.splice(i,1);else if(this.party.length<4){this.party.push(w);if(Math.random()<.6)this.toast(`${w.name.split(' ')[0]}: "${pick(['say less','let me finish my fries first','is there dental?','I was born for this','wait, the PIT pit?','for the content'])}"`)}else this.toast('The booth only seats 4');this.closeModal();this.inside()}
  a_unpick(id){this.party=this.party.filter(w=>w.id!==id);this.inside()}
  a_register(){const cost=this.rerolls?10:0;this.modal(`<h2 class="h2">The register</h2><p class="sub">Moss: "Want me to call in another round? The people you picked stay. Everyone else finishes up and leaves."</p>
    <div class="row"><button class="btn" data-a="close" type="button">Never mind</button><div class="spacer"></div><button class="btn go" data-a="reroll" type="button" ${this.save.tips<cost?'disabled':''}>Serve another round ${cost?`(${cost} tips)`:'(free)'}</button></div>`)}
  a_reroll(){const cost=this.rerolls?10:0;if(this.save.tips<cost)return;this.save.tips-=cost;this.rerolls++;this.walkins=this.walkins.map(w=>this.party.includes(w)?w:makeWalkin(ri(1,2)));this._cc&&this._cc.clear();this.persist();this.closeModal();this.inside();this.toast('A new round of customers walks in')}
  a_moss(){this.toast(pick(['Moss: "...so anyway."','Moss: "The pit called. I let it go to voicemail."','Moss: "I am a cactus. I take no questions."','Moss: "Tip jar is right there. Hint."']),2400)}
  a_cat(){this.toast(pick(['Meatball bit you. He seems proud.','Meatball is asleep. Meatball is plotting.','You pet Meatball. +1 morale. -1 finger.','Meatball judges your party choices.']),2400)}
  a_door(){this.street()}
  a_kitchen(){this.returnTo='inside';this.a_pantry()}
  a_dumbwaiter(){if(!this.party.length)return this.toast('Recruit at least one customer first');this.gearScreen()}
  a_jukebox(){const s=this.save;this.modal(`<h2 class="h2">Jukebox settings</h2>
    <div class="row"><span class="px" style="font-size:calc(var(--u)*5.4)">BATTLES</span><button class="btn sm" data-a="setmode" data-v="auto" aria-pressed="${s.battleMode!=='turn'}" type="button">Auto</button><button class="btn sm" data-a="setmode" data-v="turn" aria-pressed="${s.battleMode==='turn'}" type="button">Turn-based</button></div>
    <p class="sub">Auto: the party fights on its own; you use takeout, Order Up and the bell.<br>Turn-based: the game pauses on each hero's turn so you pick Attack, Signature, Defend or Heal.</p>
    <div class="row"><span class="px" style="font-size:calc(var(--u)*5.4)">SPEED</span>${[1,2,4].map(n=>`<button class="btn sm" data-a="setspeed" data-v="${n}" aria-pressed="${(s.speed||1)===n}" type="button">${n}×</button>`).join('')}</div>
    <div class="row"><div class="spacer"></div><button class="btn" data-a="close" type="button">Done</button></div>`)}
  a_setmode(v){this.save.battleMode=v;this.persist();if(this.mode==='delve'){this.applyMode();this.closeModal();this.hudDirty=true}else this.a_jukebox()}
  a_setspeed(v){this.save.speed=+v;this.persist();this.a_jukebox()}
  // ------------------------------------------------------------ gear up
  usedBy(g){return this.party.find(w=>Object.values(w.gear).some(x=>x&&x.id===g.id))}
  a_gearup(){if(!this.party.length)return;this.gearScreen()}
  gearScreen(){this.show(`<div class="panel fill"><div class="row"><h2 class="h2">Gear up</h2><span class="sub">Gear always comes home, even if they get minted.</span></div>
    <div class="scroll"><div class="grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">${this.party.map((w,i)=>{const C=CLASSES[w.cls];const s=heroStats(w);
      return`<div class="card" style="cursor:default"><canvas class="portrait" data-gp="${i}"></canvas><div class="nm">${esc(w.name)}</div><div class="meta" style="color:${C.col}">${C.name}</div>
      ${SLOTS.map(sl=>{const g=w.gear[sl];return`<button class="slot ${g?'b'+g.rar:''}" data-a="slot" data-v="${i}:${sl}" type="button"><small>${SLOT_NAME[sl]}</small>${g?`<span class="r${g.rar}">${esc(gearName(g))}</span>`:'<span class="sub">empty</span>'}</button>`}).join('')}
      <div class="stats">HP ${s.hp} ATK ${s.atk} DEF ${s.def}<br>SPD ${s.spd} CRIT ${s.crit}%</div>
      <button class="btn sm" data-a="row" data-v="${i}" type="button">Row: ${w.row==='front'?'Front':'Back'}</button></div>`}).join('')}</div></div>
    <div class="row"><button class="btn" data-a="back" type="button">Back inside</button><div class="spacer"></div><button class="btn go" data-a="counter" type="button">To the counter</button></div></div>`);
    document.querySelectorAll('[data-gp]').forEach(cv=>{const p=this.portrait(this.party[+cv.dataset.gp]);cv.width=p.width;cv.height=p.height;cv.getContext('2d').drawImage(p,0,0)})}
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
      <div class="row"><button class="btn" data-a="gearback" type="button">Gear up</button><div class="spacer"></div><button class="btn primary" data-a="descend" type="button">Descend into the Gutter</button></div></div>`)}
  a_gearback(){this.gearScreen()}
  a_buy(k){const t=TAKEOUT[k];if(this.takeout.length>=4)return this.toast('Takeout bag is full');if(this.save.tips<t.price)return this.toast('Not enough tips');this.save.tips-=t.price;this.takeout.push(k);this.counterScreen()}
  a_unbuy(i){const k=this.takeout.splice(+i,1)[0];this.save.tips+=TAKEOUT[k].price;this.counterScreen()}
  a_start(f){this.startFloor=+f;this.counterScreen()}
  a_descend(){const f=this.startFloor;for(const w of this.party)w.level+=Math.floor((f-1)*.9);this.save.delves++;this.persist();
    this.mode='delve';this.stage.setScene(GutterScene);this.show('');this.delve=new Delve(this,this.party,this.takeout,f);this.delve.speed=this.save.speed||1;this.targeting=null;$('#hud').hidden=false;this.paused=false;this.hudDirty=true;this.renderHud(true)}
  // ------------------------------------------------------------ delve HUD
  applyMode(){const d=this.delve;if(!d)return;if(this.save.battleMode!=='turn'&&d.awaiting){const u=d.awaiting;d.awaiting=null;this.onAwait(null);d.heroAct(u)}}
  onAwait(u){this.targeting=null;this.renderCmd()}
  renderCmd(){const d=this.delve,el=$('#cmd');const u=d&&d.awaiting;if(!u){el.hidden=true;return}el.hidden=false;const C=CLASSES[u.cls];
    if(this.targeting){const list=this.targeting==='ally'?d.alive:d.foes.filter(e=>!e.dying);el.innerHTML=`<div class="px cmd-h">${this.targeting==='ally'?'HEAL WHO?':'ATTACK WHO?'} <span class="sub">tap one on screen or below</span></div><div class="row">${list.map((e,i)=>`<button class="btn sm" data-a="tgt" data-v="${i}" type="button">${esc(e.name.split(' ')[0])} ${Math.max(0,Math.round(e.hp))}/${e.stats.hp}</button>`).join('')}<button class="btn sm" data-a="tgtcancel" type="button">Back</button></div>`;return}
    const ready=(u.charge||0)>=3;el.innerHTML=`<div class="px cmd-h"><span style="color:${C.col}">${esc(u.name)}</span>'s turn</div><div class="row">
      <button class="btn sm" data-a="cmd" data-v="attack" type="button">Attack</button>
      <button class="btn sm ${ready?'primary':''}" data-a="cmd" data-v="sig" type="button" ${ready?'':'disabled'}>${C.sig}${ready?'':` (${3-(u.charge||0)} more)`}</button>
      ${u.cls==='witch'?'<button class="btn sm" data-a="cmd" data-v="heal" type="button">Heal</button>':''}
      <button class="btn sm" data-a="cmd" data-v="defend" type="button">Defend</button></div>`}
  a_cmd(v){const d=this.delve;if(!d||!d.awaiting)return;if(v==='attack'){this.targeting='enemy';this.renderCmd();return}if(v==='heal'){this.targeting='ally';this.renderCmd();return}d.command({type:v});this.hudDirty=true}
  a_tgt(i){const d=this.delve;const list=this.targeting==='ally'?d.alive:d.foes.filter(e=>!e.dying);const t=list[+i];if(t)this.pickTarget(t)}
  a_tgtcancel(){this.targeting=null;this.renderCmd()}
  pickTarget(t){const d=this.delve;if(!d||!d.awaiting||!this.targeting)return;if(this.targeting==='enemy'&&t.side!=='enemy')return;if(this.targeting==='ally'&&t.side!=='hero')return;const kind=this.targeting==='ally'?'heal':'attack';this.targeting=null;$('#cmd').hidden=true;d.command({type:kind,target:t});this.hudDirty=true}
  bindHud(){$('#btn-mode').addEventListener('click',()=>{this.save.battleMode=this.save.battleMode==='turn'?'auto':'turn';this.persist();this.applyMode();this.hudDirty=true;this.toast(this.save.battleMode==='turn'?'Turn-based: you control each hero':'Auto battle: the party fights on its own')});
$('#btn-speed').addEventListener('click',()=>{const d=this.delve;if(!d)return;d.speed=d.speed===1?2:d.speed===2?4:1;this.save.speed=d.speed;this.hudDirty=true});
    $('#btn-bell').addEventListener('click',()=>{const d=this.delve;if(!d)return;if(!d.canBell())return this.toast(`Out of rope. Next Pulley Station: B${Math.ceil(d.floor/10)*10}`);d.ringBell()});
    $('#btn-order').addEventListener('click',()=>{const d=this.delve;if(!d)return;this.toast(d.meter>=100?'Tap a hero below to fire their signature move':'Order Up fills as your party deals and takes damage')});
    $('#hud-heroes').addEventListener('click',e=>{const el=e.target.closest('.hero');if(!el||!this.delve)return;const h=this.delve.heroes[+el.dataset.i];if(this.delve.orderUp(h))this.toast(`${h.name}: ${CLASSES[h.cls].sig}!`,1000)});
    $('#hud-takeout').addEventListener('click',e=>{const el=e.target.closest('[data-t]');if(!el||!this.delve)return;this.delve.useTakeout(+el.dataset.t)})}
  renderHud(force){const d=this.delve;if(!d)return;const b=d.bag;const items=b.gear.length+Object.values(b.ing).reduce((a,c)=>a+c,0)+Object.values(b.parts).reduce((a,c)=>a+c,0)+Object.values(b.junk).reduce((a,c)=>a+c,0);
    $('#hud-floor').innerHTML=`B${d.floor} · ${d.canBell()?`<span style="color:var(--mint)">ROPE TO B${d.anchor+d.rope}</span>`:'<span style="color:var(--red)">OUT OF ROPE</span>'}`;
    $('#hud-loot').textContent=`${b.tips} TIPS · ${items} LOOT${d.banked?' · BANKED':''}`;
    $('#btn-speed').textContent=d.speed+'×';$('#btn-mode').textContent=this.save.battleMode==='turn'?'TURNS':'AUTO';
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
    s.stats.kills+=r.stats.kills;if(r.kind==='wipe')s.stats.wipes++;this.noteFloor(r.floor);this.persist();$('#hud').hidden=true;this.mode='receipt';this.stage.setScene(InteriorScene);this.delve=null;this.walkins=[];this.returnTo='inside';this.targeting=null;$('#cmd').hidden=true;
    const head={retreat:'RANG THE BELL',wipe:'PARTY WIPED',pulley:'PULLEY STATION RIDE'}[r.kind];const mvp=Object.entries(r.stats.dmg).sort((a,b)=>b[1]-a[1])[0];
    const ln=(a,b,c='')=>`<div class="ln ${c}"><span>${esc(a)}</span><span>${esc(b)}</span></div>`;
    const lines=[];for(const g of L.gear)lines.push(ln(gearName(g),RARITY[g.rar].name,'r'+g.rar));for(const id in L.ing)lines.push(ln(INGREDIENTS[id].name,'x'+L.ing[id],'r'+INGREDIENTS[id].rar));for(const id in L.parts)lines.push(ln(PARTS[id].name,'x'+L.parts[id]));for(const id in L.junk)lines.push(ln(JUNK[id].name,'x'+L.junk[id]));
    const fates=r.heroes.map(h=>ln(h.w.name,h.left?'headed out':h.alive?'took the tram home':'minted home'));
    this.show(`<div class="panel fill"><div class="scroll"><div class="receipt"><h3>LAST STOP DINER</h3><div style="text-align:center">*** ${head} ***</div><hr>
      ${ln('DEEPEST FLOOR','B'+r.floor)}${ln('FLOORS CLEARED',r.stats.floors)}${ln('MONSTERS BONKED',r.stats.kills)}${mvp?ln('MVP',mvp[0]+' ('+mvp[1]+' dmg)'):''}<hr>
      ${r.kind==='wipe'?`<div style="text-align:center">ON THE TAB (25%)${r.loot!==r.full&&this.delve===null?'':''}</div>`:''}
      ${ln('TIPS',L.tips)}${L.shards?ln('MANA SHARDS',L.shards):''}${lines.join('')||ln('ITEMS','none')}<hr>${fates.join('')}<hr>
      <div style="text-align:center">THANK YOU FOR DELVING<br>PLEASE TIP YOUR HEROES</div></div></div>
      <div class="row"><div class="spacer"></div><button class="btn go" data-a="back" type="button">Back inside</button></div></div>`)}
  // ------------------------------------------------------------ locker
  a_locker(){this.lockerScreen()}
  lockerScreen(sel){const s=this.save;const items=s.locker.slice().sort((a,b)=>SLOTS.indexOf(GEAR[a.base].slot)-SLOTS.indexOf(GEAR[b.base].slot)||b.rar-a.rar);const g=sel&&s.locker.find(x=>x.id===sel);
    this.show(`<div class="panel fill"><div class="row"><h2 class="h2">Locker</h2><span class="sub">Everything you own. Walk-ins borrow it for a delve and bring it back.</span></div>
      <div class="row scroll" style="align-items:stretch;flex-wrap:nowrap"><div class="scroll list" style="flex:1.3">${items.map(x=>`<div class="item b${x.rar}" data-a="lsel" data-v="${x.id}" role="button" tabindex="0" style="cursor:pointer${x===g?';outline:calc(var(--u)*1) solid var(--mint)':''}"><div class="nm"><b class="r${x.rar}">${esc(gearName(x))}</b><small>${SLOT_NAME[GEAR[x.base].slot]} · ${RARITY[x.rar].name} · item level ${x.ilvl}</small></div></div>`).join('')||'<p class="sub">Empty. Go find some meme gear.</p>'}</div>
      <div class="card" style="flex:1;cursor:default">${g?gearDetail(g):'<p class="sub">Tap an item to see its stats.</p>'}</div></div>
      <div class="row"><button class="btn" data-a="back" type="button">Diner</button></div></div>`)}
  a_lsel(v){this.lockerScreen(v)}
  // ------------------------------------------------------------ pawn shop
  a_pawn(){this.pawnTab='gear';this.lou=pick(LOU_LINES);this.pawnScreen()}
  pawnScreen(){const s=this.save,t=this.pawnTab;let rows='';
    if(t==='gear')rows=s.locker.slice().sort((a,b)=>a.rar-b.rar).map(g=>`<div class="item b${g.rar}"><div class="nm"><b class="r${g.rar}">${esc(gearName(g))}</b><small>${statLine(gearStats(g))}</small></div><span class="gold px">${gearPrice(g)}</span><button class="btn sm" data-a="sellgear" data-v="${g.id}" type="button">Sell</button></div>`).join('');
    else{const tab={junk:[s.junk,JUNK],parts:[s.parts,PARTS],ing:[s.ing,INGREDIENTS]}[t];rows=Object.entries(tab[0]).filter(([,n])=>n>0).map(([id,n])=>{const D=tab[1][id];const p=D.price||[2,4,9,18,40][D.rar];return`<div class="item"><div class="nm"><b class="${D.rar!==undefined?'r'+D.rar:''}">${esc(D.name)} ×${n}</b><small>${esc(D.desc)}</small></div><span class="gold px">${p}</span><button class="btn sm" data-a="sellstack" data-v="${t}:${id}:1" type="button">Sell 1</button><button class="btn sm" data-a="sellstack" data-v="${t}:${id}:${n}" type="button">All</button></div>`}).join('')}
    this.show(`<div class="panel fill"><div class="row"><h2 class="h2">Lou's Pawn &amp; Prawn</h2><span class="quote">${esc(this.lou)}</span><div class="spacer"></div><span class="chip gold">TIPS ${s.tips}</span></div>
      <div class="tabs">${[['gear','Gear'],['junk','Junk'],['parts','Monster parts'],['ing','Ingredients']].map(([k,n])=>`<button class="btn sm" data-a="pawntab" data-v="${k}" aria-pressed="${k===t}" type="button">${n}</button>`).join('')}${t==='junk'&&Object.values(s.junk).some(n=>n)?'<button class="btn sm" data-a="selljunk" type="button">Sell all junk</button>':''}</div>
      <div class="scroll list">${rows||'<p class="sub">Nothing to sell here.</p>'}</div>${t!=='gear'&&t!=='junk'?'<p class="sub">Monster parts and ingredients are also used for cooking (next update) and forging.</p>':''}
      <div class="row"><button class="btn" data-a="back" type="button">Diner</button></div></div>`)}
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
      <div class="row"><button class="btn" data-a="back" type="button">Diner</button></div></div>`)}
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
      <div class="row"><button class="btn" data-a="back" type="button">Diner</button></div></div>`)}
}
function statLine(st){const o=[];for(const[k,n]of[['hp','HP'],['atk','ATK'],['def','DEF'],['spd','SPD'],['crit','CRIT']])if(st[k])o.push(`${n} ${st[k]>0?'+':''}${st[k]}${k==='crit'?'%':''}`);for(const[k,n]of[['atkP','ATK'],['hpP','HP'],['allP','ALL']])if(st[k])o.push(`${n} ${st[k]>0?'+':''}${Math.round(st[k]*100)}%`);if(st.res)o.push('stun resist');return o.join(' · ')||'no stats (vibes only)'}
function gearDetail(g){const B=GEAR[g.base];return`<div class="nm r${g.rar}">${esc(gearName(g))}</div><div class="meta">${SLOT_NAME[B.slot]} · ${RARITY[g.rar].name} · item level ${g.ilvl}${g.up?` · upgraded +${g.up}`:''}</div><div class="stats">${statLine(gearStats(g)).replace(/ · /g,'<br>')}</div><div class="meta">Lou would pay ${gearPrice(g)} tips.</div>`}

window.game=new Game();
