'use strict';
// Delve: long runs through the Gutter. Real-time ATB combat shown one action at a time,
// floors with several fights, rest stops, bosses every 10 floors, Pulley Stations, rope, loot.

const HERO_SLOTS={front:[{x:128,y:141},{x:116,y:151}],back:[{x:82,y:141},{x:70,y:151}]};
const ENEMY_SLOTS=[{x:198,y:141},{x:210,y:151},{x:246,y:141},{x:258,y:151}];
const BOSS_SLOT={x:236,y:149};

function heroStats(w){const C=CLASSES[w.cls];const lm=1+.09*(w.level-1);const s={hp:C.hp*lm,atk:C.atk*lm,def:C.def*lm,spd:C.spd,crit:C.crit};const P={atkP:0,hpP:0,allP:0};
  for(const sl of SLOTS){const g=w.gear[sl];if(!g)continue;const gs=gearStats(g);for(const k of['hp','atk','def','spd','crit'])s[k]+=gs[k];P.atkP+=gs.atkP;P.hpP+=gs.hpP;P.allP+=gs.allP}
  if(w.traits.includes('main'))P.allP+=.2;if(w.traits.includes('tnc'))P.allP+=.3;if(w.traits.includes('online'))P.atkP+=.25;if(w.traits.includes('built')&&w.bstat)s[w.bstat]*=2;
  s.hp*=1+P.hpP+P.allP;s.atk*=1+P.atkP+P.allP;s.def*=1+P.allP;s.spd*=1+P.allP*.5;
  return{hp:Math.max(10,Math.round(s.hp)),atk:Math.max(1,Math.round(s.atk)),def:Math.max(0,Math.round(s.def)),spd:Math.max(3,Math.round(s.spd)),crit:clamp(Math.round(s.crit),0,75)}}

class Unit{constructor(o){Object.assign(this,{gauge:0,acts:0,st:{},buffs:[],dx:0,dy:0,kb:0,flash:0,hurt:0,alive:true,gone:false,sy:1,alpha:1,bubble:null,cache:new SpriteCache(36)},o)}
  get x(){return this.base.x+this.dx+this.kb}get y(){return this.base.y+this.dy}
  get spdNow(){return this.stats.spd*(this.st.slow?.6:1)}
  get atkNow(){let m=1;for(const b of this.buffs)if(!b.k||b.k==='atk')m*=b.m;return this.stats.atk*m}
  get defNow(){let m=1;for(const b of this.buffs)if(b.k==='def')m*=b.m;return this.stats.def*m*(this.armorBroken?.3:1)}
  get critNow(){let c=this.stats.crit;for(const b of this.buffs)if(b.k==='crit')c+=b.m;return c}}

class Delve{
  constructor(game,party,takeout,startFloor){this.g=game;this.floor=startFloor;this.anchor=startFloor;this.rope=game.ropeLen();this.takeout=takeout.slice();
    this.bag={tips:0,gear:[],ing:{},parts:{},junk:{},shards:0};this.banked=null;this.meter=0;this.speed=game.save.speed||1;
    this.stats={kills:0,floors:0,fights:0,dmg:{}};this.texts=[];this.popq=[];this.freeze=0;this.state='intro';this.timer=1.6;this.enemies=[];this.cur=null;this.banner={txt:`B${this.floor}`,sub:'THE GUTTER',t:1.6};
    const fr=party.filter(p=>p.row==='front'),bk=party.filter(p=>p.row!=='front');while(fr.length>2)bk.unshift(fr.pop());while(bk.length>2)fr.push(bk.shift());
    this.heroes=[];fr.forEach((w,i)=>this.addHero(w,HERO_SLOTS.front[i],'front'));bk.forEach((w,i)=>this.addHero(w,HERO_SLOTS.back[i],'back'));
    this.planFloor();this.rope_y=-60;this.retreatT=0}
  addHero(w,slot,row){const s=heroStats(w);const u=new Unit({side:'hero',w,name:w.name.split(' ')[0],cls:w.cls,level:w.level,xp:0,stats:s,hp:s.hp,base:{...slot},row,gauge:Math.random()*40});this.heroes.push(u);this.stats.dmg[u.name]=0}
  get alive(){return this.heroes.filter(h=>h.alive)}
  get foes(){return this.enemies.filter(e=>e.alive)}
  canBell(){return this.floor<=this.anchor+this.rope}
  isRest(f){return f%5===0&&f%10!==0}isBoss(f){return f%10===0}
  planFloor(){this.fightIdx=0;this.fights=this.isBoss(this.floor)?1:this.isRest(this.floor)?0:2+(this.floor%3===0?1:0)}
  say(u,txt,dur=2.2){u.bubble={txt,t:dur}}
  pop(xu,yu,txt,col,sc=2,delay=0){const near=this.popq.filter(p=>Math.abs(p.x-xu)<10&&p.t<.6&&p.t>-1).length;this.popq.push({x:xu+(near%2?5:-5)*(near>0),y:yu-near*7,txt,col,sc,t:-delay})}
  // ------------------------------------------------------------ flow
  update(dt){dt*=this.speed;const st=this.g.stage;
    for(const u of[...this.heroes,...this.enemies]){u.flash=Math.max(0,u.flash-dt);u.hurt=Math.max(0,u.hurt-dt);u.kb*=Math.exp(-dt*9);if(u.bubble){u.bubble.t-=dt;if(u.bubble.t<=0)u.bubble=null}
      if(u.dying){u.dying-=dt;u.alpha=Math.max(0,u.dying/.5);u.sy=u.side==='hero'?Math.max(0,u.dying/.6):1;if(u.dying<=0){u.dying=0;u.gone=true}}}
    for(const p of this.popq)p.t+=dt;this.popq=this.popq.filter(p=>p.t<1.3);
    if(this.banner){this.banner.t-=dt;if(this.banner.t<=0)this.banner=null}
    if(this.freeze>0){this.freeze-=dt;return}
    this.timer-=dt;
    switch(this.state){
      case'intro':if(this.timer<=0){this.alive.forEach(h=>Math.random()<.4&&this.say(h,pick(HERO_LINES.start)));this.next()}break;
      case'walk':st.scroll+=dt*46;this.walkPh=(this.walkPh||0)+dt*9;if(this.timer<=0)this.spawn();break;
      case'enter':for(const e of this.enemies){e.dx=Math.max(0,e.dx-dt*130)}if(this.timer<=0){this.state='fight';this.enemies.forEach(e=>e.dx=0);const s=this.foes.find(e=>e.type.lines&&Math.random()<.6);if(s)this.say(s,pick(s.type.lines))}break;
      case'fight':this.fightStep(dt);break;
      case'victory':if(this.timer<=0){this.fightIdx++;this.stats.fights++;this.next()}break;
      case'floorclear':if(this.timer<=0)this.descend();break;
      case'rest':if(this.timer<=0){this.state='floorclear';this.timer=.6}break;
      case'retreat':this.retreatT+=dt;for(const h of this.alive)h.dy=-Math.max(0,this.retreatT-.8)*90;if(this.timer<=0)this.finish('retreat');break;
      case'wipe':if(this.timer<=0)this.finish('wipe');break;
    }}
  next(){if(this.fightIdx<this.fights){this.state='walk';this.timer=this.fightIdx===0?1.2:2.2;this.walkPh=0}
    else if(this.fights===0){this.state='rest';this.timer=3;this.campfire()}
    else if(this.isBoss(this.floor)){this.state='pulley';this.stats.floors++;this.g.onPulley(this)}
    else{this.state='floorclear';this.timer=1.4;this.stats.floors++;this.banner={txt:`B${this.floor} CLEARED`,sub:'',t:1.3}}}
  descend(){this.floor++;this.planFloor();this.g.noteFloor(this.floor);this.banner={txt:`B${this.floor}`,sub:this.isBoss(this.floor)?'BOSS FLOOR':this.isRest(this.floor)?'REST STOP':(!this.canBell()?'OUT OF ROPE':'THE GUTTER'),t:1.8};this.next()}
  keepGoing(){this.anchor=this.floor;this.state='floorclear';this.timer=.4;this.banner={txt:'ROPE RESET',sub:`PULLEY STATION B${this.floor}`,t:1.6}}
  campfire(){this.banner={txt:'THIS IS FINE',sub:'CAMPFIRE: EVERYONE HEALS 35%',t:2.6};for(const h of this.alive){const a=Math.round(h.stats.hp*.35);h.hp=Math.min(h.stats.hp,h.hp+a);this.pop(h.x,h.y-36,'+'+a,'#7dffa8')}
    const h=pick(this.alive);if(h)this.say(h,pick(['this is fine','somebody toasted my sock','smells like content','*roasts a rat tail*']),2.6);this.g.stage.flashes.push({x:200,y:150,r:120,col:[255,150,60],a:.8,t:3,max:3})}
  spawn(){const f=this.floor,boss=this.isBoss(f);this.enemies=[];
    if(boss){this.addEnemy('golem',BOSS_SLOT,f)}
    else{const n=Math.min(4,2+(f>=3?1:0)+(f>=6&&Math.random()<.5?1:0));const pool=Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss&&(ENEMIES[k].minFloor||1)<=f);for(let i=0;i<n;i++)this.addEnemy(pick(pool),ENEMY_SLOTS[i],f)}
    this.state='enter';this.timer=1.1;for(const e of this.enemies)e.dx=140;if(boss)this.banner={txt:'GRISTLE GOLEM',sub:f>10?`HE'S BEEN TRAINING (TIER ${f/10})`:'SIGMA GRINDSET GYM BRO',t:2}}
  addEnemy(k,slot,f){const T=ENEMIES[k];let m=1+.13*(f-1);if(T.boss)m*=1+.55*(f/10-1);const s={hp:Math.round(T.hp*m),atk:Math.round(T.atk*m),def:Math.round(T.def*(1+.06*(f-1))),spd:T.spd,crit:T.crit};
    this.enemies.push(new Unit({side:'enemy',k,type:T,name:T.name,level:f,stats:s,hp:s.hp,base:{...slot},gauge:Math.random()*30,hitStreak:0}))}
  // ------------------------------------------------------------ combat
  fightStep(dt){if(this.cur){const c=this.cur;c.t+=dt;for(const im of c.imp)if(!im.done&&c.t>=im.at){im.done=true;im.fn();if(this.freeze>0)return}
      if(c.t>=c.dur){if(c.u)c.u.dx=0;this.cur=null;this.gap=.45;this.afterAction()}return}
    if(this.awaiting)return;if(this.gap>0){this.gap-=dt;return}
    if(!this.foes.length||!this.alive.length){this.afterAction();return}
    const all=[...this.alive,...this.foes].filter(u=>!u.dying);let best=null,bt=1e9;for(const u of all){const need=Math.max(0,100-u.gauge)/u.spdNow;if(need<bt){bt=need;best=u}}
    for(const u of all)u.gauge+=u.spdNow*bt;best.gauge=0;this.act(best)}
  afterAction(){if(!this.alive.length&&this.state==='fight'){this.state='wipe';this.timer=1.8;this.banner={txt:'PARTY WIPED',sub:'FORTUNE MINTS ACTIVATED',t:2};return}
    if(!this.foes.length&&this.state==='fight'&&!this.enemies.some(e=>e.dying>0)){this.state='victory';this.timer=1.1;const h=pick(this.alive);if(h&&Math.random()<.5)this.say(h,pick(HERO_LINES.kill))}}
  predict(n=7){const all=[...this.alive,...this.foes].filter(u=>!u.dying).map(u=>({u,g:u.gauge,s:u.spdNow}));const out=[];if(!all.length)return out;
    for(let i=0;i<n;i++){let best=null,bt=1e9;for(const a of all){const need=Math.max(0,100-a.g)/a.s;if(need<bt){bt=need;best=a}}for(const a of all)a.g+=a.s*bt;best.g=0;out.push(best.u)}return out}
  tick(u){if(u.st.burn){const d=u.st.burn.d;this.damage(null,u,d,{raw:true,col:'#ff9a3a'});u.st.burn.t--;if(u.st.burn.t<=0)delete u.st.burn}
    for(const k of['slow','taunt'])if(u.st[k]){u.st[k]--;if(u.st[k]<=0)delete u.st[k]}u.buffs=u.buffs.filter(b=>--b.t>0)}
  act(u){u.acts++;delete u.st.guard;this.tick(u);if(!u.alive||u.dying){this.cur={t:0,dur:.3,imp:[]};return}
    if(u.st.stun){u.st.stun--;if(u.st.stun<=0)delete u.st.stun;this.say(u,u.side==='hero'?'*scrolling the wifi list*':'...',1.2);this.cur={t:0,dur:.6,imp:[]};return}
    if(u.side==='hero'){u.charge=Math.min(3,(u.charge||0)+1);if(this.g.save.battleMode==='turn'&&!u.forceSig){if(u.w.traits.includes('tnc')&&Math.random()<.12){this.say(u,'This turn is sponsored by ArcDyne.',1.8);this.cur={t:0,dur:1,imp:[]};return}this.awaiting=u;this.g.onAwait(u);return}this.heroAct(u)}else this.enemyAct(u)}
  command(cmd){const u=this.awaiting;if(!u)return;this.awaiting=null;this.g.onAwait(null);
    if(cmd.type==='sig'){u.charge=0;this.signature(u,u.cls,1);return}
    if(cmd.type==='defend'){u.st.guard=1;this.meter=Math.min(100,this.meter+8);this.pop(u.x,u.y-40,'GUARD','#9ffaff',1);this.say(u,pick(['bracing','not today','*hides behind spatula*']),1.2);this.cur={u,kind:'cast',t:0,dur:.8,imp:[]};return}
    if(cmd.type==='heal'){const t=cmd.target;this.castAt(u,t,()=>this.heal(u,t,Math.round(u.atkNow*1.5+8)),'#7dffb0');return}
    const t=cmd.target&&cmd.target.alive?cmd.target:this.heroTarget(u);if(!t){this.cur={t:0,dur:.2,imp:[]};return}
    if(CLASSES[u.cls].range==='ranged')this.castAt(u,t,()=>this.strike(u,t,u.cls==='witch'?.8:1),u.cls==='pyro'?'#ff8a2a':'#7dffb0');else this.melee(u,t,[()=>this.strike(u,t,1)])}
  unitAt(xu,yu){let best=null,bd=18;for(const u of[...this.heroes,...this.enemies]){if(!u.alive||u.dying)continue;const h=u.type&&u.type.boss?44:30;const dx=Math.abs(xu-u.x),dy=yu<u.y+2&&yu>u.y-h?0:99;if(dy===0&&dx<bd){bd=dx;best=u}}return best}
  heroAct(u){const w=u.w;
    if(w.traits.includes('tnc')&&Math.random()<.12){this.say(u,pick(['This fight is sponsored by ArcDyne.','Use code PIT for 10% off mana.','ArcDyne: we own the pipes.']),1.8);this.cur={t:0,dur:.9,imp:[]};return}
    if(w.traits.includes('milkshake')&&Math.random()<.05&&this.takeout.length){const lost=this.takeout.splice(Math.random()*this.takeout.length|0,1)[0];this.say(u,`oops. dropped the ${TAKEOUT[lost].name}`,1.8);this.g.hudDirty=true}
    let sig=u.forceSig||u.charge>=3;u.forceSig=false;
    if(sig){u.charge=0;this.signature(u,u.cls,1);return}
    if(u.cls==='witch'){const low=this.alive.filter(h=>h.hp/h.stats.hp<.55).sort((a,b)=>a.hp/a.stats.hp-b.hp/b.stats.hp)[0];if(low){this.castAt(u,low,()=>this.heal(u,low,Math.round(u.atkNow*1.5+8)),'#7dffb0');return}}
    const tgt=this.heroTarget(u);if(!tgt){this.cur={t:0,dur:.2,imp:[]};return}
    if(CLASSES[u.cls].range==='ranged')this.castAt(u,tgt,()=>this.strike(u,tgt,u.cls==='witch'?.8:1),u.cls==='pyro'?'#ff8a2a':'#7dffb0');
    else this.melee(u,tgt,[()=>this.strike(u,tgt,1)])}
  heroTarget(u){const f=this.foes.filter(e=>!e.dying);if(!f.length)return null;if(CLASSES[u.cls].range==='ranged'){return u.cls==='pyro'?f.sort((a,b)=>a.hp-b.hp)[0]:pick(f)}const front=f.filter(e=>ENEMY_SLOTS.indexOf(e.base)<2||e.type.boss);return pick(front.length&&Math.random()<.8?front:f)}
  signature(u,cls,mult){const C=CLASSES[cls];this.say(u,C.sig.toUpperCase()+'!',1.4);this.g.stage.flashes.push({x:u.x,y:u.y-16,r:45,col:hexRgb(C.col),a:.7,t:.5,max:.5});
    if(cls==='brawler'){const t=this.heroTarget(u);if(!t)return this.cur={t:0,dur:.3,imp:[]};this.melee(u,t,[()=>{this.strike(u,t,1.4*mult);if(t.alive)t.st.slow=2;u.st.taunt=2;this.pop(u.x,u.y-40,'TAUNT','#ffd25e',1)}])}
    else if(cls==='pyro'){this.cast(u,()=>{for(const e of this.foes){this.strike(u,e,.8*mult);if(e.alive)e.st.burn={t:3,d:Math.max(1,Math.round(u.atkNow*.3))}}this.fireCone(u)},1)}
    else if(cls==='witch'){this.cast(u,()=>{for(const h of this.alive){this.heal(u,h,Math.round((u.atkNow*1.2+10)*mult));delete h.st.burn;delete h.st.slow;delete h.st.stun}},1)}
    else if(cls==='owl'){const t=this.heroTarget(u);if(!t)return this.cur={t:0,dur:.3,imp:[]};this.melee(u,t,[()=>this.strike(u,t,.9*mult,{crit:20}),()=>{const t2=t.alive?t:this.heroTarget(u);if(t2)this.strike(u,t2,.9*mult,{crit:20})}])}
    else{const others=this.alive.filter(h=>h!==u&&h.cls!=='drifter').map(h=>h.cls);this.signature(u,others.length?pick(others):pick(['brawler','pyro','owl']),.7)}}
  enemyAct(u){const T=u.type;u.hitStreakOwn=0;
    if(u.armorBroken){u.armorBroken--;if(!u.armorBroken)this.say(u,'ok form is back. we good.',1.6)}
    if(T.lines&&Math.random()<.22)this.say(u,pick(T.lines),2);
    const tgt=this.enemyTarget();if(!tgt){this.cur={t:0,dur:.2,imp:[]};return}
    if(T.boss){u.hitStreak=0;
      if(u.acts%4===0){this.say(u,'Protein break. Hold on.',1.8);this.cast(u,()=>{const a=Math.round(u.stats.hp*.08);u.hp=Math.min(u.stats.hp,u.hp+a);u.buffs.push({m:1.25,t:3});this.pop(u.x,u.y-50,'+'+a,'#7dffa8')},1,'shake');return}
      if(u.acts%3===0){const fr=this.alive.filter(h=>h.row==='front');const tg=fr.length?fr:this.alive;this.melee(u,tg[0],[()=>{for(const h of tg)this.strike(u,h,1.1);this.g.stage.shake=1.6;this.dust(tg[0].x+6,tg[0].y)}],'slam');return}
      this.melee(u,tgt,[()=>this.strike(u,tgt,1.3)],'slam');return}
    if(T.ab==='wifi'&&u.acts%3===0){this.castAt(u,tgt,()=>{tgt.st.stun=1;this.say(u,pick(T.lines),2);this.say(tgt,pick(WIFI_LINES),2);this.pop(tgt.x,tgt.y-40,'STUNNED','#ffd25e',1)},'#5ff2ff');return}
    if(T.ranged)this.castAt(u,tgt,()=>this.strike(u,tgt,1),'#5ff2ff');else this.melee(u,tgt,[()=>this.strike(u,tgt,1)])}
  enemyTarget(){const a=this.alive.filter(h=>!h.dying);if(!a.length)return null;const tn=a.filter(h=>h.st.taunt);if(tn.length)return pick(tn);const fr=a.filter(h=>h.row==='front');return pick(fr.length&&Math.random()<.7?fr:a)}
  // ------------------------------------------------------------ action animations
  melee(u,t,hits,style){const dir=u.side==='hero'?1:-1;const reach=u.type&&u.type.boss?30:14;const tx=t.x-dir*reach-u.base.x;const dur=style==='slam'?1.75:1.35;const at0=style==='slam'?.85:.55;
    const imp=hits.map((fn,i)=>({at:at0+i*.32,fn}));this.cur={u,kind:'melee',style,tx,t:0,dur:dur+(hits.length-1)*.32,imp,at0}}
  cast(u,fn,mult,style){this.cur={u,kind:'cast',style,t:0,dur:1.45,imp:[{at:.8,fn}]}}
  castAt(u,t,fn,col){this.cur={u,kind:'cast',t:0,dur:1.4,imp:[{at:.4,fn:()=>this.bolt(u,t,col)},{at:.8,fn}]}}
  animate(u){const c=this.cur;const p={};if(!c||c.u!==u)return p;const k=c.t/c.dur;
    if(c.kind==='melee'){const a=c.at0/c.dur;const m=k<a?ei(k/a):k<a+.25?1:1-eo((k-a-.25)/(1-a-.25));u.dx=c.tx*clamp(m,0,1);if(c.style==='slam'){p.slam=k<a?-eo(k/a):k<a+.25?1:lerp(1,0,(k-a-.25)/(1-a-.25))}else p.arm=k<a*.6?-k/(a*.6):k<a+.1?1:lerp(1,0,(k-a-.1)/(1-a-.1));p.lean=(u.side==='hero'?1:-1)*(k<a?5*k/a:2);p.dash=k>a*.4&&k<a}
    else{p.cast=Math.sin(Math.PI*clamp(k*1.2,0,1));if(c.style==='shake')p.flex=Math.sin(c.t*30)}
    return p}
  bolt(u,t,col){const n=14;for(let i=0;i<n;i++){const k=i/n;this.g.stage.emit({x:lerp(u.x,t.x,k),y:lerp(u.y-20,t.y-18,k)+Math.sin(k*Math.PI)*-6,vx:R(-6,6),vy:R(-6,6),life:.2+k*.3,col,glow:true})}}
  fireCone(u){for(let i=0;i<36;i++)this.g.stage.emit({x:u.x+6,y:u.y-20,vx:R(80,180),vy:R(-40,40),life:R(.3,.6),col:pick(['#ff9a2e','#ffe36a','#e8452c']),glow:true,drag:2,size:Math.random()<.4?1.6:1})}
  dust(x,y){for(let i=0;i<16;i++)this.g.stage.emit({x:x+R(-8,8),y:y,vx:R(-50,50),vy:R(-30,-6),g:50,life:R(.4,.8),col:pick(['#9fb4ff','#6a7ab8']),size:Math.random()<.4?2:1,drag:3,floor:y+1})}
  // ------------------------------------------------------------ resolution
  strike(a,t,mult,o={}){if(!t.alive||t.dying)return;const w=a.w;let m=mult;let miss=false,dbl=false;
    if(w&&w.traits.includes('clumsy')){const r=Math.random();if(r<.1)miss=true;else if(r<.2)dbl=true}
    if(w&&w.traits.includes('milkshake'))m*=2;
    if(miss){this.pop(t.x,t.y-38,'WHIFF','#c9c2d6',1);return}
    const crit=Math.random()*100<a.critNow+(o.crit||0);let d=a.atkNow*m*R(.9,1.1)*40/(40+t.defNow);if(crit)d*=1.6;d=Math.max(1,Math.round(d*(dbl?2:1)));
    this.damage(a,t,d,{crit});
    if(t.type&&t.type.ab==='sticky'&&a.side==='hero'&&CLASSES[a.cls].range==='melee'){a.st.slow=1;this.pop(a.x,a.y-40,'STICKY','#7ad060',1)}
    if(t.type&&t.type.boss&&a.side==='hero'){t.hitStreak=(t.hitStreak||0)+1;if(t.hitStreak>=3&&!t.armorBroken){t.armorBroken=2;t.hitStreak=0;this.say(t,'MY FORM!!',1.6);this.pop(t.x,t.y-56,'ARMOR BROKEN','#ff5a6a',1)}}}
  damage(a,t,d,o={}){if(t.st.guard&&!o.raw)d=Math.max(1,Math.round(d*.5));t.hp-=d;t.flash=.11;t.hurt=.35;t.kb=(t.side==='hero'?-1:1)*(o.crit?7:4);
    if(a&&a.side==='hero'){this.stats.dmg[a.name]=(this.stats.dmg[a.name]||0)+d;this.meter=Math.min(100,this.meter+5)}if(t.side==='hero')this.meter=Math.min(100,this.meter+3);this.g.hudDirty=true;
    this.pop(t.x+R(-3,3),t.y-(t.type&&t.type.boss?52:36),(o.crit?'CRIT ':'')+d,o.col||(o.crit?'#ffd84a':t.side==='hero'?'#ff7a6a':'#ffffff'),o.crit?2:2);
    if(!o.raw){this.freeze=o.crit?.09:.05;this.g.stage.shake=Math.max(this.g.stage.shake,o.crit?1:.5);this.g.stage.flashes.push({x:t.x,y:t.y-18,r:60,col:[255,235,190],a:.9,t:.18,max:.18,blob:o.crit?7:4});
      for(let i=0;i<(o.crit?16:9);i++){const an=R(-1.2,1.2)+(t.side==='hero'?Math.PI:0);const sp=R(40,110);this.g.stage.emit({x:t.x,y:t.y-18,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-20,g:160,life:R(.2,.45),col:pick(['#ffe27a','#ff9a3a']),glow:true,drag:2})}}
    if(t.side==='hero'&&Math.random()<.18)this.say(t,pick(HERO_LINES.hurt),1.4);
    if(t.hp<=0)this.kill(a,t);else if(t.side==='hero'&&t.w.traits.includes('headout')&&t.hp<t.stats.hp*.25){t.alive=false;t.dying=.6;t.left=true;this.say(t,'ight imma head out',2)}}
  heal(a,t,v){if(!t.alive)return;const before=t.hp;t.hp=Math.min(t.stats.hp,t.hp+v);this.pop(t.x,t.y-36,'+'+(t.hp-before),'#7dffa8');for(let i=0;i<10;i++)this.g.stage.emit({x:t.x+R(-8,8),y:t.y-R(0,24),vy:R(-30,-12),life:R(.5,.9),col:pick(['#8dffb3','#d4ffe0']),glow:true});this.g.stage.flashes.push({x:t.x,y:t.y-16,r:40,col:[110,255,160],a:.6,t:.4,max:.4})}
  kill(a,t){t.alive=false;t.hp=0;t.dying=.6;
    if(t.side==='hero'){this.say(t,pick(HERO_LINES.down),2);for(let i=0;i<20;i++)this.g.stage.emit({x:t.x+R(-6,6),y:t.y-R(0,30),vx:R(-20,20),vy:R(-60,-20),life:R(.5,1),col:pick(['#9ffaff','#ffffff','#7dffb0']),glow:true});this.pop(t.x,t.y-50,'MINTED','#9ffaff',1);return}
    this.stats.kills++;for(let i=0;i<14;i++)this.g.stage.emit({x:t.x+R(-6,6),y:t.y-R(0,14),vx:R(-40,40),vy:R(-60,-10),g:80,life:R(.4,.8),col:pick(['#5a4a6a','#8a7a9a','#ff5aa8']),drag:2});
    this.loot(t,a);const xp=t.type.boss?60*(t.level/10):5+t.level*2;const al=this.alive;for(const h of al){h.xp+=xp/al.length;while(h.xp>=20*h.level){h.xp-=20*h.level;this.levelUp(h)}}}
  levelUp(h){h.level++;const r=h.hp/h.stats.hp;h.w.level=h.level;h.stats=heroStats(h.w);h.w.level=h.level;h.hp=Math.min(h.stats.hp,Math.round(h.stats.hp*r+h.stats.hp*.2));this.pop(h.x,h.y-48,'LV UP','#ffd25e',1);if(Math.random()<.4)this.say(h,pick(HERO_LINES.level),1.5)}
  loot(e,a){const f=this.floor,b=this.bag,T=e.type;const hasT=t=>this.alive.some(h=>h.w.traits.includes(t));let k=0;const show=(txt,col)=>this.pop(e.x,e.y-20-k*7,txt,col,1,.15+k++*.18);
    let tips=Math.round((3+f*.7)*R(.8,1.3)*(hasT('tipper')?1.25:1)*(T.boss?12:1));b.tips+=tips;show('+'+tips+' TIPS','#ffd25e');
    if(Math.random()<(T.boss?1:.45)){b.parts[T.part]=(b.parts[T.part]||0)+1;show(PARTS[T.part].name.toUpperCase(),RARITY[PARTS[T.part].rar].col)}
    if(Math.random()<.3+(hasT('forager')?.15:0)+(T.boss?.7:0)){const r=rollRarity(f,hasT('critic')?.3:0);const opts=Object.keys(INGREDIENTS).filter(i=>INGREDIENTS[i].rar===r.id);const id=pick(opts.length?opts:Object.keys(INGREDIENTS));b.ing[id]=(b.ing[id]||0)+1;show(INGREDIENTS[id].name.toUpperCase(),RARITY[INGREDIENTS[id].rar].col)}
    const ng=T.boss?2:(Math.random()<.11?1:0);for(let i=0;i<ng;i++){const r=rollRarity(f,T.boss?.45:0);const g=makeGear(pick(DROP_GEAR),r.id,f);b.gear.push(g);show(gearName(g).toUpperCase(),RARITY[g.rar].col)}
    if(Math.random()<.12){const j=pick(Object.keys(JUNK));b.junk[j]=(b.junk[j]||0)+1;show(JUNK[j].name.toUpperCase(),'#c9c2d6')}
    const sh=T.boss?3:(Math.random()<(e.k==='wisp'?.2:.03)?1:0);if(sh){b.shards+=sh;show('+'+sh+' MANA SHARD','#5ff2ff')}
    this.g.hudDirty=true}
  // ------------------------------------------------------------ player inputs
  useTakeout(i){if(['retreat','wipe','pulley','done'].includes(this.state))return;const id=this.takeout[i];if(!id)return;this.takeout.splice(i,1);const al=this.alive;
    if(typeof id==='object'){const d=id.dish,e=dishEffect(d);this.banner={txt:'CHOW TIME',sub:d.name.toUpperCase().slice(0,40),t:1.6};for(const h of al){if(e.heal)this.heal(null,h,Math.round(h.stats.hp*e.heal/100));if(e.atk)h.buffs.push({k:'atk',m:1+e.atk/100,t:5});if(e.def)h.buffs.push({k:'def',m:1+e.def/100,t:5});if(e.crit)h.buffs.push({k:'crit',m:e.crit,t:5});if(e.spd)h.gauge=Math.min(100,h.gauge+e.spd)}
      if(d.quirks.includes('volatile'))for(const f of this.foes.filter(f=>!f.dying))this.damage(null,f,Math.max(1,Math.round(d.st.pow*1.5)),{col:'#ff9a3a'});const h=pick(al);if(h)this.say(h,pick(['bussin','this slaps','who made this?? (complimentary)','mid but I will eat it','I can taste the content']),1.6);this.g.hudDirty=true;return}
    if(id==='fries')for(const h of al)this.heal(null,h,Math.round(h.stats.hp*.25));
    if(id==='sauce'){for(const h of al){h.buffs.push({m:1.3,t:4});this.pop(h.x,h.y-40,'SPICY','#ff5a3a',1)}}
    if(id==='espresso'){for(const h of al){h.gauge=100;this.pop(h.x,h.y-40,'WIRED','#d8a06a',1)}}
    if(id==='doggy'){this.banked=JSON.parse(JSON.stringify(this.bag));this.banner={txt:'LOOT BANKED',sub:'THE DOGGY BAG IS SAFE',t:1.6}}
    this.g.hudDirty=true}
  orderUp(h){if(this.meter<100||!h.alive||this.state!=='fight')return false;this.meter=0;if(this.awaiting===h){this.meter=0;this.command({type:'sig'});this.g.hudDirty=true;return true}h.forceSig=true;h.gauge=999;this.g.hudDirty=true;this.say(h,'ORDER UP!',1);return true}
  ringBell(){if(!this.canBell()||['retreat','wipe','pulley','done'].includes(this.state))return;this.cur=null;if(this.awaiting){this.awaiting=null;this.g.onAwait(null)}this.state='retreat';this.timer=2.4;this.retreatT=0;this.banner={txt:'DING DING',sub:'THE DUMBWAITER IS COMING',t:2};for(const h of this.alive)this.say(h,'ight imma head out',2)}
  finish(kind){if(this.state==='done')return;this.state='done';let loot=this.bag;
    if(kind==='wipe'){const keep=this.banked||{tips:0,gear:[],ing:{},parts:{},junk:{},shards:0};const rest=this.bag;const k={tips:keep.tips+Math.round((rest.tips-keep.tips)*.25),gear:keep.gear.slice(),ing:{...keep.ing},parts:{...keep.parts},junk:{...keep.junk},shards:keep.shards};
      for(const g of rest.gear)if(!keep.gear.some(x=>x.id===g.id)&&Math.random()<.25)k.gear.push(g);
      for(const key of['ing','parts','junk'])for(const id in rest[key]){const extra=rest[key][id]-(keep[key][id]||0);let n=0;for(let i=0;i<extra;i++)if(Math.random()<.25)n++;if(n)k[key][id]=(k[key][id]||0)+n}
      loot=k}
    this.g.onDelveEnd({kind,loot,takeoutLeft:this.takeout,full:this.bag,floor:this.floor,stats:this.stats,heroes:this.heroes})}
  // ------------------------------------------------------------ rendering
  sprite(u,p){const look=u.side==='hero';const fl=u.flash>0;const hurt=u.hurt>0;
    const pose={bob:Math.round(Math.sin(this.g.stage.t*(look?4.2:3.4)+u.base.x)*.6*4)/4,arm:Math.round((p.arm||0)*10)/10,cast:Math.round((p.cast||0)*10)/10,slam:Math.round((p.slam||0)*10)/10,flex:Math.round((p.flex||0)*4)/4,hurt,walk:p.walk?Math.round(p.walk*4)/4:0,lean:Math.round((p.lean||0)*2)/2};
    if(this.state==='walk'&&look)pose.walk=Math.round(((this.walkPh||0)%(Math.PI*2))*4)/4;if(this.state==='enter'&&!look&&u.dx>0)pose.bob=Math.round(Math.sin(this.g.stage.t*12)*1*4)/4;
    const ph=Math.floor(this.g.stage.t*6)%6;const key=JSON.stringify(pose)+(fl?'F':'')+(u.armorBroken?'B':'')+(['rat','tumble','slime','wisp'].includes(u.k)?ph:'');
    return u.cache.get(key,()=>{let S;if(look)S=humanShapes(u.w,{...pose,t:ph/6});else S=monsterShapes(u.k,{bob:pose.bob,atk:pose.arm>0?pose.arm:0,t:ph/6*1.0,slam:pose.slam,flex:pose.flex,armorBroken:!!u.armorBroken});
      const h=look?u.w.look.h:1;S=xform(S,1,h,pose.lean);return raster(S,ST,RAMPS,{flash:fl,rim:hexRgb('#ff7ac8')},{})})}
  actors(){const out=[];for(const u of[...this.enemies,...this.heroes]){if(u.gone)continue;const p=this.animate(u);if(!this.cur||this.cur.u!==u){if(this.state!=='retreat')u.dx=u.side==='enemy'?u.dx:0}
      out.push({sprite:this.sprite(u,p),x:u.x,y:u.y,alpha:u.alpha,sy:u.sy,flash:u.flash>0,shadow:u.type&&u.type.boss?16:8,trail:p.dash?[u.x-6,u.x-12,u.x-18]:null})}
    out.sort((a,b)=>a.y-b.y);return out}
  drawUI(c,st){const u=st.u;
    // rope + dumbwaiter during retreat
    if(this.state==='retreat'){const k=clamp(this.retreatT/.8,0,1);const by=lerp(-40,130,eo(k))-Math.max(0,this.retreatT-.8)*90;const x=st.sx(98);c.fillStyle='#8a6a40';c.fillRect(x+u(20),0,1,Math.max(0,u(by)));c.fillStyle='#3a2a20';c.fillRect(x-u(8),u(by)-u(4),u(56),u(4));c.fillStyle='#5a4030';c.fillRect(x-u(8),u(by)-u(40),u(2),u(36));c.fillRect(x+u(46),u(by)-u(40),u(2),u(36));c.fillRect(x-u(8),u(by)-u(40),u(56),u(2))}
    for(const h of[...this.heroes,...this.enemies]){if(h.gone||h.dying)continue;const X=st.sx(h.x),boss=h.type&&h.type.boss;if(boss)continue;const Y=u(h.y)-(h.side==='hero'?u(38*(h.w.look.h)):u(h.k==='tumble'?24:h.k==='tourist'?40:h.k==='wisp'?22:16));const W=u(16);
      c.fillStyle='#0a0612';c.fillRect(X-W/2-1,Y-1,W+2,4);c.fillStyle=h.side==='hero'?'#4ad06a':'#e0405a';c.fillRect(X-W/2,Y,Math.max(0,Math.round(W*h.hp/h.stats.hp)),2);
      let s='';if(h.st.burn)s+='B';if(h.st.slow)s+='S';if(h.st.taunt)s+='T';if(h.st.stun)s+='Z';if(h.buffs.length)s+='+';if(s)text(c,s,X+W/2+2,Y-2,1,'#ffd25e')}
    if(this.awaiting){const a=this.awaiting;const X=st.sx(a.x),Y=u(a.y-48*(a.w.look.h))-Math.round(Math.sin(st.t*6)*2);c.fillStyle='#ffd25e';for(let i=0;i<4;i++)c.fillRect(X-4+i,Y+i,9-i*2,1);
      const tg=this.g.targeting;if(tg){const list=tg==='ally'?this.alive:this.foes;for(const e of list){const ex=st.sx(e.x),ey=u(e.y)+2;const r=u(e.type&&e.type.boss?16:9)+Math.round(Math.sin(st.t*8));c.fillStyle=tg==='ally'?'#7dffb0':'#ff5a6a';c.fillRect(ex-r,ey,r*2,1);c.fillRect(ex-r,ey-2,1,2);c.fillRect(ex+r-1,ey-2,1,2)}}}
    const boss=this.enemies.find(e=>e.type.boss&&!e.gone);if(boss){const W=u(140),X=st.sx(160)-W/2,Y=u(24);c.fillStyle='#0a0612';c.fillRect(X-2,Y-2,W+4,8);c.fillStyle='#3a1020';c.fillRect(X,Y,W,4);c.fillStyle=boss.armorBroken?'#ff9a3a':'#e0405a';c.fillRect(X,Y,Math.round(W*Math.max(0,boss.hp)/boss.stats.hp),4);textO(c,boss.name.toUpperCase()+(boss.armorBroken?' (ARMOR BROKEN)':''),X,Y+8,1,'#ffffff','#0a0612')}
    const bl=[...this.heroes,...this.enemies].filter(h=>h.bubble&&!h.gone).sort((a,b)=>b.bubble.t-a.bubble.t).slice(0,3).map(h=>({cx:st.sx(h.x),by:u(h.y-(h.side==='hero'?46*h.w.look.h:h.type.boss?72:h.k==='tourist'?50:30)),txt:h.bubble.txt}));drawBubbles(c,bl,st.lw,this.banner?u(60)+44:0)
    for(const p of this.popq){if(p.t<0)continue;const k=p.t;const y=u(p.y)-Math.round((k<.15?k/.15*8:8+k*10)*st.S);if(k>.9&&((k*20)|0)%2)continue;const tw=textW(p.txt,p.sc);textO(c,p.txt,st.sx(p.x)-(tw>>1),y,p.sc,p.col,'#1d1526')}
    if(this.banner){const b=this.banner;const a=Math.min(1,b.t*3);c.globalAlpha=a;const tw=textW(b.txt,3);const cx=st.lw>>1;c.fillStyle='rgba(10,6,18,.65)';c.fillRect(0,u(60),st.lw,b.sub?40:28);textO(c,b.txt,cx-(tw>>1),u(60)+5,3,'#ffffff','#1d1526');if(b.sub){const sw=textW(b.sub,1);textO(c,b.sub,cx-(sw>>1),u(60)+27,1,'#7dffb0','#1d1526')}c.globalAlpha=1}}
}
function drawBubbles(c,items,lw,bannerBottom){const sc=1,ink='#1d1526',paper='#fbf6ec';const placed=[];
  for(const it of items){const words=it.txt.toUpperCase().split(' ');const lines=[];let ln='';for(const w of words){if((ln+' '+w).trim().length>20){lines.push(ln.trim());ln=w}else ln+=' '+w}if(ln.trim())lines.push(ln.trim());
    const tw=Math.max(...lines.map(l=>textW(l,sc))),p=3,w=tw+p*2,h=lines.length*6*sc-sc+p*2;let x=clamp(Math.round(it.cx-w/2),2,lw-w-2);let y=it.by-h-4;
    for(let guard=0;guard<8;guard++){const hit=placed.find(r=>x<r.x+r.w+3&&x+w+3>r.x&&y<r.y+r.h+3&&y+h+3>r.y);if(!hit)break;y=hit.y-h-4}
    y=Math.max(y,30);placed.push({x,y,w,h,lines,cx:it.cx,by:it.by,p})}
  for(const r of placed){const{x,y,w,h,lines,p}=r;c.fillStyle=ink;c.fillRect(x-1,y,w+2,h);c.fillRect(x,y-1,w,h+2);c.fillStyle=paper;c.fillRect(x,y,w,h);
    const t=clamp(Math.round(r.cx),x+3,x+w-4);const gap=r.by-(y+h);if(gap>6){c.fillStyle=paper;c.fillRect(t,y+h,1,gap-2);c.fillStyle=ink;c.fillRect(t-1,y+h,1,gap-2);c.fillRect(t+1,y+h,1,gap-2)}
    else for(let i=0;i<3;i++){const ww=5-2*i;c.fillStyle=ink;c.fillRect(t-(ww>>1)-1,y+h+i,ww+2,1);c.fillStyle=paper;c.fillRect(t-(ww>>1),y+h+i,ww,1)}
    lines.forEach((l,i)=>text(c,l,x+p,y+p+i*6*sc,sc,ink))}}
