'use strict';
// Cooking: ingredient properties, the 5-step kitchen mini-game, meme dish generation,
// the Recipe Book with Quick Cook, and what dishes do (recruit meals and takeout).

Object.assign(INGREDIENTS,{
  coffee:{name:'Void Coffee Beans',rar:1,fl:['Caffeinated','Cursed'],desc:'Brewed in the dark. Stares back.'},
  energy:{name:'Energy Drink (Discontinued)',rar:0,fl:['Fizzy','Caffeinated'],desc:'Banned in three kingdoms.',quirk:'volatile'},
  noodles:{name:'Neon Noodles',rar:0,fl:['Comfort','Mana'],desc:'Glow in the dark. And in you.'},
  jalapeno:{name:'Dragon Jalapeno',rar:2,fl:['Spicy','Smoky'],desc:'Still has a little dragon attitude.',quirk:'volatile'},
});
Object.assign(INGREDIENTS.pepper,{quirk:'volatile'});Object.assign(INGREDIENTS.garlic,{quirk:'smug'});Object.assign(INGREDIENTS.onion,{quirk:'clingy'});
Object.assign(INGREDIENTS.stonks,{quirk:'vegan'});Object.assign(INGREDIENTS.truffle,{quirk:'crypto'});
const PART_FL={rattail:['Salty','Protein'],twig:['Smoky'],map:['Cursed'],glob:['Sour','Fizzy'],essence:['Mana'],gristle:['Protein','Greasy']};
const PART_Q={glob:'clingy',essence:'volatile'};
const QUIRKS={volatile:{name:'Volatile',desc:'Makes the heat jumpy. Hits harder.'},smug:{name:'Smug',desc:'Better plating.'},clingy:{name:'Clingy',desc:'Throws off the flavor balance.'},vegan:{name:'Vegan',desc:'The dish will not stop mentioning it.'},crypto:{name:'Crypto',desc:'Quality swings wildly up or down.'}};
const FLAVORS={Spicy:{c:'#ff5a3a',st:'pow'},Smoky:{c:'#a0765a',st:'pow'},Protein:{c:'#e0a070',st:'pow'},Mana:{c:'#5ff2ff',st:'pow'},Greasy:{c:'#ffd25e',st:'grd'},Salty:{c:'#e8e8f0',st:'grd'},
  Comfort:{c:'#ffb08a',st:'heal'},Herbal:{c:'#7ad060',st:'heal'},Sweet:{c:'#ff8ad8',st:'heal'},Caffeinated:{c:'#8a5a3a',st:'spd'},Fizzy:{c:'#9ffaff',st:'spd'},Sour:{c:'#d8f060',st:'luck'},Umami:{c:'#c88aff',st:'luck'},Cursed:{c:'#6a3a8a',st:'luck'}};
const FL_CLASS={brawler:['Protein','Greasy','Salty'],pyro:['Spicy','Smoky'],witch:['Herbal','Comfort','Sweet'],owl:['Caffeinated','Fizzy','Sour'],drifter:['Umami','Mana','Cursed']};
const STAT_NAME={pow:'Power',grd:'Guard',spd:'Speed',heal:'Heal',luck:'Luck'};
const PREFIX={Spicy:['Emotional Damage','Big Spicy','Hot Take',"Ratio'd"],Sweet:['Wholesome','Sugar Rush','Hopecore','Uwu'],Salty:['Salty','Skill Issue','Copium','Seethe'],Sour:['Big Yikes','Cringe','Down Bad','Sour Grapes'],
  Umami:['Certified',"Chef's Kiss",'Elite','Rizzed-Up'],Herbal:['Touch Grass','Cottagecore','Self-Care','Main Character'],Greasy:['Thicc','Absolute Unit','Chonky','Dummy Thicc'],Smoky:['Sigma','Lowkey','Midnight','Grindset'],
  Fizzy:['Sus','Unhinged','Chaotic','Zoomer'],Caffeinated:['No Sleep','4AM','Feral','Gremlin'],Comfort:['Cozy',"Mom's",'Hug-Shaped','Comfort Zone'],Protein:['Gym Bro','Gains','Swole','Pre-Workout'],Mana:['Galaxy Brain','Big Brain','Arcane','Glitched'],Cursed:['Cursed','Forbidden','Ohio','Haunted']};
const NOUN={Spicy:'Regret',Sweet:'Vibes',Salty:'Tears',Sour:'Cringe',Umami:'Respect',Herbal:'Grass',Greasy:'Grease',Smoky:'Mystery',Fizzy:'Chaos',Caffeinated:'Insomnia',Comfort:'Hugs',Protein:'Gains',Mana:'Wizardry',Cursed:'Doom'};
const DISH_TYPE=[[],[],['Toast','Taco','Skewer','Smoothie','Dip','Slider'],['Ramen','Burrito','Casserole','Bowl','Sandwich','Stew','Pizza'],['Feast','Platter','Lasagna','Combo Meal','Hot Pot'],['Banquet','Tasting Menu','Mega Feast','Party Platter']];
const TIER=[[.9,"Chef's Kiss",'#ffb43a'],[.75,"Bussin'",'#c88aff'],[.55,'Decent','#5fb8ff'],[.35,'Mid','#6fe08a'],[0,'Burnt','#c9c2d6']];
const GRADES=[[.9,'PERFECT','#ffd25e'],[.75,'GREAT','#7dffb0'],[.55,'GOOD','#5fb8ff'],[.35,'MEH','#c9c2d6'],[0,'BURNT','#ff5a6a']];
const gradeOf=q=>GRADES.find(g=>q>=g[0]);const tierOf=q=>TIER.find(g=>q>=g[0]);

function ingDef(id){if(INGREDIENTS[id])return{...INGREDIENTS[id],src:'ing'};const P=PARTS[id];if(P)return{name:P.name,rar:P.rar,fl:PART_FL[id]||['Umami'],desc:P.desc,quirk:PART_Q[id],src:'parts'};return null}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seeded(seedN){let s=seedN||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}

// Flavor profile, balance and base stats of a set of ingredient ids (repeats allowed).
function analyze(ids){const fl={},st={pow:0,grd:0,spd:0,heal:0,luck:0},quirks=new Set();let rar=0;
  for(const id of ids){const d=ingDef(id);rar+=d.rar;for(const f of d.fl){fl[f]=(fl[f]||0)+1+d.rar*.5;st[FLAVORS[f].st]+=d.rar+1.5}if(d.quirk)quirks.add(d.quirk)}
  const tot=Object.values(fl).reduce((a,c)=>a+c,0)||1;const sorted=Object.entries(fl).sort((a,b)=>b[1]-a[1]);const share=sorted.length?sorted[0][1]/tot:0;
  let bal=0,balTxt='Balanced';if(sorted.length>5){bal=-.06;balTxt='Chaotic'}else if(share>.7){bal=-.03;balTxt='One-note'}else if(share>=.3){bal=.05;balTxt='Balanced'}else{balTxt='Busy'}
  if(quirks.has('clingy')){bal-=.05;balTxt+=' (clingy)'}
  return{fl,sorted,st,quirks:[...quirks],avgRar:ids.length?rar/ids.length:0,bal,balTxt}}
function dishName(ids,a){const key=ids.slice().sort().join('+');const r=seeded(hashStr(key));const f1=a.sorted[0]?a.sorted[0][0]:'Umami',f2=a.sorted[1]?a.sorted[1][0]:null;
  const pre=PREFIX[f1][Math.floor(r()*4)];const types=DISH_TYPE[Math.min(5,Math.max(2,ids.length))];const ty=types[Math.floor(r()*types.length)];const v=r();
  if(f2&&v<.35)return`${ty} of ${NOUN[f2]}`.replace(/^/,pre+' ');if(f2&&v<.55)return`${pre} ${ty} with ${NOUN[f2]} Sauce`;if(v<.7)return`${pre} ${ty} Supreme`;return`${pre} ${ty}`}
function makeDish(ids,q){const a=analyze(ids);if(a.quirks.includes('crypto'))q=clamp(q+R(-.25,.25),0,1);q=clamp(q+a.bal,0,1);
  const P=(.5+q)*(1+a.avgRar*.25)*(a.quirks.includes('volatile')?1.1:1);const st={};for(const k in a.st)st[k]=Math.round(a.st[k]*P);
  const key=ids.slice().sort().join('+');let name=dishName(ids,a);if(q<.35)name+=' (Burnt)';
  return{id:uid(),kind:'dish',key,ids:ids.slice(),name,q:Math.round(q*100)/100,st,fl:a.sorted.slice(0,3).map(x=>x[0]),quirks:a.quirks,rar:Math.min(4,Math.round(a.avgRar+(q>.85?1:0)))}}
function dishEffect(d){const s=d.st;return{heal:Math.min(60,s.heal*3),atk:Math.min(60,Math.round(s.pow*2.5)),def:Math.min(60,s.grd*3),spd:Math.min(100,s.spd*12),crit:Math.min(30,s.luck*2)}}
function dishEffectText(d){const e=dishEffect(d);const o=[];if(e.heal)o.push(`heals ${e.heal}%`);if(e.atk)o.push(`+${e.atk}% ATK`);if(e.def)o.push(`+${e.def}% DEF`);if(e.spd)o.push(`turn meter +${e.spd}`);if(e.crit)o.push(`+${e.crit}% crit`);return(o.join(', ')||'emotional support only')+(e.atk||e.def||e.crit?' (4 turns)':'')}
function dishCrowd(d){const w={brawler:.6,pyro:.6,witch:.6,owl:.6,drifter:.5};d.fl.forEach((f,i)=>{for(const c in FL_CLASS)if(FL_CLASS[c].includes(f))w[c]+=3-i});return w}
function dishCrowdText(d){const w=dishCrowd(d);const top=Object.entries(w).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([c])=>CLASSES[c].name+'s');return`Attracts mostly ${top.join(' and ')}. ${Math.min(6,3+Math.round(d.q*3))} customers, level +${Math.floor(d.q*2+d.rar*.5)}.`}
function dishIcon(d,px=3){const n=16,c=mk(n,n),x=c.getContext('2d');pxEllipse(x,8,10.5,7.5,3.5,'#3a3446');pxEllipse(x,8,10,7,3,'#e8e4ee');pxEllipse(x,8,9.6,5.5,2,'#c8c4d0');const r=seeded(hashStr(d.key));
  d.ids.forEach((id,i)=>{const df=ingDef(id);const col=FLAVORS[df.fl[0]].c;const bx=4+r()*8,by=6+r()*3;pxEllipse(x,bx,by,1.6+r()*1.4,1.2+r()*.8,col);x.fillStyle='rgba(255,255,255,.6)';x.fillRect(Math.round(bx-1),Math.round(by-1),1,1)});
  if(d.q>=.35){x.fillStyle='rgba(230,230,255,.7)';x.fillRect(6,2,1,2);x.fillRect(9,1,1,2);x.fillRect(11,3,1,1)}else{x.fillStyle='#1d1526';x.fillRect(5,6,6,2)}
  return c}

// ------------------------------------------------------------------ the kitchen controller (DOM mini-game)
const STEPS=['Pick','Chop','Cook','Season','Plate'];
class Kitchen{
  constructor(game){this.g=game;this.sel=[];this.step=0;this.scores=[];this.raf=null}
  get s(){return this.g.save}
  have(id){const d=ingDef(id);return(d.src==='ing'?this.s.ing[id]:this.s.parts[id])||0}
  pantryIds(){return[...Object.keys(this.s.ing),...Object.keys(this.s.parts)].filter(id=>this.have(id)>0&&ingDef(id)).sort((a,b)=>ingDef(b).rar-ingDef(a).rar)}
  used(id){return this.sel.filter(x=>x===id).length}
  take(ids){for(const id of ids){const d=ingDef(id);const t=d.src==='ing'?this.s.ing:this.s.parts;t[id]--;if(!t[id])delete t[id]}}
  open(){this.stop();this.sel=[];this.step=0;this.scores=[];this.render()}
  stop(){if(this.raf)cancelAnimationFrame(this.raf);this.raf=null;window.onkeydown=null}
  header(sub){return`<div class="row"><h2 class="h2">Kitchen</h2><span class="sub">${sub}</span><div class="steps">${STEPS.map((n,i)=>`<span class="${i===this.step?'on':i<this.step?'done':''}">${n}</span>`).join('')}</div></div>`}
  render(){const g=this.g;if(this.step===0)return this.renderPick();}
  flavorBars(a){const tot=Object.values(a.fl).reduce((x,c)=>x+c,0)||1;return`<div class="flbars">${a.sorted.map(([f,v])=>`<div class="fl"><span style="color:${FLAVORS[f].c}">${f}</span><i style="width:${Math.round(v/tot*100)}%;background:${FLAVORS[f].c}"></i></div>`).join('')||'<p class="sub">Add ingredients to see the flavor profile.</p>'}</div>`}
  renderPick(){const ids=this.pantryIds();const a=analyze(this.sel);const known=this.sel.length>=2&&this.s.book[this.sel.slice().sort().join('+')];
    this.g.show(`<div class="panel fill">${this.header('Pick 2 to 5 ingredients, then cook them.')}
      <div class="row" style="align-items:stretch;flex-wrap:nowrap;flex:1;min-height:0;gap:calc(var(--u)*6)">
        <div class="scroll" style="flex:1.5"><div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${ids.map(id=>{const d=ingDef(id);const left=this.have(id)-this.used(id);return`<button class="ing b${d.rar}" data-a="kadd" data-v="${id}" type="button" ${left<=0||this.sel.length>=5?'disabled':''}><b class="r${d.rar}">${esc(d.name)}</b><small>${d.fl.map(f=>`<i style="color:${FLAVORS[f].c}">${f}</i>`).join(' ')}${d.quirk?` · <i>${QUIRKS[d.quirk].name}</i>`:''}</small><span class="cnt">×${left}</span></button>`}).join('')||'<p class="sub">Your pantry is empty. Ingredients and monster parts drop in the pit.</p>'}</div></div>
        <div class="card" style="flex:1;cursor:default;min-width:0"><div class="nm">IN THE POT ${this.sel.length}/5</div><div class="potlist">${this.sel.map((id,i)=>{const d=ingDef(id);return`<button class="btn sm" data-a="krem" data-v="${i}" type="button"><span class="r${d.rar}">${esc(d.name)}</span> ✕</button>`}).join('')||'<span class="sub">Empty pot.</span>'}</div>
          ${this.flavorBars(a)}${this.sel.length?`<div class="stats">BALANCE: ${a.balTxt.toUpperCase()}${a.quirks.length?'<br>QUIRKS: '+a.quirks.map(q=>QUIRKS[q].name.toUpperCase()).join(', '):''}</div>`:''}${known?`<div class="stats" style="color:var(--gold)">YOU'VE MADE THIS: ${esc(known.name)}</div>`:''}</div></div>
      <div class="row"><button class="btn" data-a="back" type="button">Leave kitchen</button><button class="btn" data-a="book" type="button">Recipe book (${Object.keys(this.s.book).length})</button><button class="btn" data-a="fridge" type="button">Fridge (${this.s.dishes.length})</button><div class="spacer"></div><button class="btn primary" data-a="kstart" type="button" ${this.sel.length>=2?'':'disabled'}>Start cooking</button></div></div>`)}
  add(id){if(this.sel.length<5&&this.have(id)-this.used(id)>0)this.sel.push(id);this.renderPick()}
  rem(i){this.sel.splice(+i,1);this.renderPick()}
  start(){if(this.sel.length<2)return;if(this.s.dishes.length>=20)return this.g.toast('The fridge is full (20). Use or toss some dishes first.');this.a=analyze(this.sel);this.scores=[];this.step=1;this.chop()}
  stage(title,help,body,btn){this.g.show(`<div class="panel fill">${this.header(help)}<div class="mg">${body}</div><div class="row"><span class="sub" id="mgmsg">${title}</span><div class="spacer"></div>${btn}</div></div>`)}
  result(score,next){const gr=gradeOf(score);this.scores.push(score);const m=$('#mgmsg');if(m){m.innerHTML=`<b style="color:${gr[2]}" class="px">${gr[1]}</b>`}this.stop();setTimeout(()=>{this.step++;next()},900)}
  // --- step 1: chop to the beat
  chop(){const n=Math.min(8,this.sel.length*2),vol=this.a.quirks.includes('volatile');let i=0,t=0,hits=[];let zone=R(.2,.8);const speed=vol?1.25:.9;let dir=1,pos=0;
    this.stage('Tap CHOP (or press space) when the knife is in the green zone.','Chop: hit the green zone '+n+' times.',`<div class="track"><div class="zone" id="zone"></div><div class="knife" id="knife"></div></div><div class="chops" id="chops">${'<i></i>'.repeat(n)}</div>`,`<button class="btn primary big" id="mgbtn" type="button">CHOP</button>`);
    const Z=$('#zone'),K=$('#knife');const W=.16;const place=()=>{Z.style.left=(zone-W/2)*100+'%';Z.style.width=W*100+'%'};place();
    const act=()=>{if(i>=n)return;const d=Math.abs(pos-zone)/(W/2);const sc=d<=.35?1:d<=.7?.8:d<=1?.55:d<=1.6?.25:0;hits.push(sc);const g=gradeOf(sc);const el=$('#chops').children[i];el.style.background=g[2];el.title=g[1];i++;zone=R(.15,.85);place();
      if(i>=n)this.result(hits.reduce((a,c)=>a+c,0)/n,()=>this.cook())};
    $('#mgbtn').onclick=act;window.onkeydown=e=>{if(e.code==='Space'){e.preventDefault();act()}};
    let last=performance.now();const loop=now=>{const dt=(now-last)/1000;last=now;pos+=dir*speed*dt*(1+i*.06);if(pos>1){pos=1;dir=-1}if(pos<0){pos=0;dir=1}K.style.left=pos*100+'%';this.raf=requestAnimationFrame(loop)};this.raf=requestAnimationFrame(loop)}
  // --- step 2: hold the heat in the sweet spot
  cook(){const vol=this.a.quirks.includes('volatile');const dur=6;let t=0,heat=.3,inside=0,held=false;
    this.stage('Hold HEAT to raise the flame. Keep the needle inside the moving band.','Cook: keep the heat in the sweet spot for 6 seconds.',`<div class="heat"><div class="band" id="band"></div><div class="needle" id="needle"></div></div><div class="timer"><i id="tmr"></i></div><div class="sub" id="pct">In the zone: 0%</div>`,`<button class="btn primary big" id="mgbtn" type="button">HOLD: HEAT</button>`);
    const B=$('#mgbtn'),Bd=$('#band'),N=$('#needle');const on=e=>{e.preventDefault();held=true;B.classList.add('held')},off=()=>{held=false;B.classList.remove('held')};
    B.onpointerdown=on;B.onpointerup=off;B.onpointerleave=off;B.onpointercancel=off;window.onkeydown=e=>{if(e.code==='Space'){e.preventDefault();held=true}};window.onkeyup=e=>{if(e.code==='Space')held=false};
    let last=performance.now();const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;const c=.5+.28*Math.sin(t*(vol?1.9:1.2))+.08*Math.sin(t*3.3);const bw=.22;
      heat+=(held?.75:-.6)*dt;heat=clamp(heat,0,1);const inz=Math.abs(heat-c)<bw/2;if(inz)inside+=dt;
      Bd.style.bottom=(c-bw/2)*100+'%';Bd.style.height=bw*100+'%';N.style.bottom=heat*100+'%';N.classList.toggle('ok',inz);$('#tmr').style.width=Math.min(100,t/dur*100)+'%';$('#pct').textContent=`In the zone: ${Math.round(inside/Math.max(t,.01)*100)}%`;
      if(t>=dur){window.onkeyup=null;this.result(clamp(inside/dur*1.15,0,1),()=>this.season());return}this.raf=requestAnimationFrame(loop)};this.raf=requestAnimationFrame(loop)}
  // --- step 3: pinch of seasoning
  season(){let k=0,t=0,sc=[];const n=3;let target=R(.25,.75);
    this.stage('Tap PINCH when the shaker lines up with the gold line.','Season: 3 pinches. Too much and the dish gets salty (the meme kind).',`<div class="track"><div class="target" id="tgt"></div><div class="knife shaker" id="shk"></div></div><div class="chops" id="chops">${'<i></i>'.repeat(n)}</div>`,`<button class="btn primary big" id="mgbtn" type="button">PINCH</button>`);
    const T=$('#tgt'),S=$('#shk');T.style.left=target*100+'%';let pos=0;
    const act=()=>{if(k>=n)return;const d=Math.abs(pos-target);const s=d<.03?1:d<.07?.8:d<.12?.55:d<.2?.3:0;sc.push(s);$('#chops').children[k].style.background=gradeOf(s)[2];k++;target=R(.2,.8);T.style.left=target*100+'%';if(k>=n)this.result(sc.reduce((a,c)=>a+c,0)/n,()=>this.plate())};
    $('#mgbtn').onclick=act;window.onkeydown=e=>{if(e.code==='Space'){e.preventDefault();act()}};
    let last=performance.now();const loop=now=>{const dt=(now-last)/1000;last=now;t+=dt;pos=.5+.5*Math.sin(t*(2.2+k*.5));S.style.left=pos*100+'%';this.raf=requestAnimationFrame(loop)};this.raf=requestAnimationFrame(loop)}
  // --- step 4: plating whack-a-spot
  plate(){const n=6;let k=0,score=0,lit=-1,litT=0,t=0;const smug=this.a.quirks.includes('smug');
    this.stage('Tap the glowing spot on the plate before it fades.','Plate: place 6 pieces where the plate glows.',`<div class="plate" id="plate">${Array.from({length:9},(_,i)=>`<button class="spot" data-i="${i}" type="button" aria-label="Plate spot ${i+1}"></button>`).join('')}</div><div class="chops" id="chops">${'<i></i>'.repeat(n)}</div>`,'');
    const spots=[...document.querySelectorAll('.spot')];const next=()=>{if(lit>=0)spots[lit].classList.remove('lit');let j;do{j=Math.floor(Math.random()*9)}while(j===lit);lit=j;litT=0;spots[lit].classList.add('lit')};
    const mark=s=>{$('#chops').children[k].style.background=gradeOf(s)[2];score+=s;k++;if(k>=n){spots.forEach(x=>x.classList.remove('lit'));this.result(clamp(score/n+(smug?.1:0),0,1),()=>this.finish());return}next()};
    spots.forEach(sp=>sp.onclick=()=>{const i=+sp.dataset.i;if(i!==lit||k>=n)return;mark(litT<.45?1:litT<.7?.8:litT<.95?.55:.35)});next();
    let last=performance.now();const loop=now=>{const dt=(now-last)/1000;last=now;litT+=dt;if(litT>1.3&&k<n)mark(0);if(k<n)this.raf=requestAnimationFrame(loop)};this.raf=requestAnimationFrame(loop)}
  // --- result
  finish(){this.stop();const q=this.scores.reduce((a,c)=>a+c,0)/this.scores.length;const d=makeDish(this.sel,q);this.take(this.sel);this.s.dishes.push(d);const isNew=this.record(d);this.g.persist();this.showDish(d,isNew)}
  record(d){const b=this.s.book;const e=b[d.key];if(!e){b[d.key]={key:d.key,name:d.name.replace(' (Burnt)',''),ids:d.ids,best:d.q,count:1};return true}e.count++;if(d.q>e.best)e.best=d.q;return false}
  showDish(d,isNew){const t=tierOf(d.q);this.step=5;
    this.g.show(`<div class="panel fill">${this.header('Order up!')}<div class="dish-result"><canvas class="dish-icon big" id="dishic"></canvas><div style="min-width:0;display:flex;flex-direction:column;gap:calc(var(--u)*3)">
      ${isNew?'<div class="px" style="color:var(--gold);font-size:calc(var(--u)*5)">NEW RECIPE!</div>':''}<div class="h2">${esc(d.name)}</div><div class="px" style="color:${t[2]};font-size:calc(var(--u)*5.4)">${t[1].toUpperCase()} · QUALITY ${Math.round(d.q*100)}%</div>
      <div class="meta">Grades: ${this.scores.map((s,i)=>`${STEPS[i+1]} <b style="color:${gradeOf(s)[2]}">${gradeOf(s)[1]}</b>`).join(' · ')}</div>
      <div class="meta">Flavors: ${d.fl.map(f=>`<b style="color:${FLAVORS[f].c}">${f}</b>`).join(', ')}${d.quirks.length?' · Quirks: '+d.quirks.map(q=>QUIRKS[q].name).join(', '):''}</div>
      <div class="stats">${Object.entries(d.st).filter(([,v])=>v).map(([k,v])=>`${STAT_NAME[k].toUpperCase()} ${v}`).join(' · ')}</div>
      <div class="meta"><b>As takeout:</b> ${dishEffectText(d)}.<br><b>As a recruit meal:</b> ${dishCrowdText(d)}</div>${d.quirks.includes('vegan')?'<div class="quote">"Did we mention it\'s vegan?" - the dish</div>':''}</div></div>
      <div class="row"><button class="btn" data-a="back" type="button">Leave kitchen</button><button class="btn" data-a="book" type="button">Recipe book</button><div class="spacer"></div><button class="btn primary" data-a="kitchen" type="button">Cook again</button></div></div>`);
    const c=$('#dishic'),ic=dishIcon(d);c.width=ic.width;c.height=ic.height;c.getContext('2d').drawImage(ic,0,0)}
  // --- recipe book and fridge
  book(){this.stop();const s=this.s;const entries=Object.values(s.book).sort((a,b)=>b.best-a.best);
    this.g.show(`<div class="panel fill"><div class="row"><h2 class="h2">Recipe book</h2><span class="sub">Every dish you've made. Quick Cook makes it again at your best quality.</span></div>
      <div class="scroll list">${entries.map(e=>{const d=makeDish(e.ids,e.best);d.key=e.key;const can=this.canMake(e.ids);const t=tierOf(e.best);return`<div class="item b${d.rar}"><canvas class="dish-icon" data-ic="${e.key}"></canvas><div class="nm"><b>${esc(e.name)}</b><small>${e.ids.map(id=>ingDef(id).name).join(' + ')}<br>Best: <span style="color:${t[2]}">${t[1]} ${Math.round(e.best*100)}%</span> · cooked ${e.count}× · ${dishEffectText(d)}</small></div><button class="btn sm ${can?'go':''}" data-a="quick" data-v="${e.key}" type="button" ${can?'':'disabled'}>${can?'Quick Cook':'Missing ingredients'}</button></div>`}).join('')||'<p class="sub">No recipes yet. Cook something and it goes in the book.</p>'}</div>
      <div class="row"><button class="btn" data-a="back" type="button">Leave kitchen</button><div class="spacer"></div><button class="btn primary" data-a="kitchen" type="button">Back to the stove</button></div></div>`);
    document.querySelectorAll('[data-ic]').forEach(c=>{const e=s.book[c.dataset.ic];const ic=dishIcon({key:e.key,ids:e.ids,q:e.best});c.width=ic.width;c.height=ic.height;c.getContext('2d').drawImage(ic,0,0)})}
  canMake(ids){const need={};for(const id of ids)need[id]=(need[id]||0)+1;return Object.entries(need).every(([id,n])=>this.have(id)>=n)}
  quick(key){const e=this.s.book[key];if(!e||!this.canMake(e.ids))return;if(this.s.dishes.length>=20)return this.g.toast('The fridge is full (20)');const d=makeDish(e.ids,e.best);this.take(e.ids);this.s.dishes.push(d);e.count++;this.g.persist();this.g.toast(`Quick cooked: ${d.name}`);this.book()}
  fridge(){this.stop();const s=this.s;
    this.g.show(`<div class="panel fill"><div class="row"><h2 class="h2">Fridge</h2><span class="sub">Cooked dishes (max 20). Serve them at the register or pack them as takeout.</span></div>
      <div class="scroll list">${s.dishes.map(d=>{const t=tierOf(d.q);return`<div class="item b${d.rar}"><canvas class="dish-icon" data-dish="${d.id}"></canvas><div class="nm"><b>${esc(d.name)}</b><small><span style="color:${t[2]}">${t[1]} ${Math.round(d.q*100)}%</span> · takeout: ${dishEffectText(d)}<br>${dishCrowdText(d)}</small></div><button class="btn sm" data-a="toss" data-v="${d.id}" type="button">Toss</button></div>`}).join('')||'<p class="sub">Nothing in here but a suspicious smell.</p>'}</div>
      <div class="row"><button class="btn" data-a="back" type="button">Leave kitchen</button><div class="spacer"></div><button class="btn primary" data-a="kitchen" type="button">Back to the stove</button></div></div>`);
    document.querySelectorAll('[data-dish]').forEach(c=>{const d=s.dishes.find(x=>x.id===c.dataset.dish);const ic=dishIcon(d);c.width=ic.width;c.height=ic.height;c.getContext('2d').drawImage(ic,0,0)})}
}
