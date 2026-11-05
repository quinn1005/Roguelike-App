'use strict';
// Shape puppets for random walk-ins (with visible gear) and Gutter monsters.
// Colors are hex strings; RAMPS builds a hue-shifted 5-tone ramp for any color on demand.
const RAMPS=new Proxy({},{get:(t,k)=>t[k]||(t[k]=ramp(k))});
const INK='#1d1526',WHITE='#f6f2ea',STEEL='#b8c2cc',WOOD='#8c5a38';

// ---------------------------------------------------------------- humans (face right, feet at y=0)
// p: {bob, arm(-1 windup..1 swing), cast(0..1), walk(phase), hurt, t}
function humanShapes(u,p){const L=u.look,cls=u.cls,y=p.bob||0,S=[];const g=u.gear||{};
  const top=g.armor?GEAR[g.armor.base].vis:L.top,skin=L.skin,hair=L.hair,pants=L.pants,shoe='#2c2236';
  const w=L.w;const wk=p.walk||0,lg=Math.sin(wk)*2.4;
  let th=p.arm<0?lerp(1.25,2.45,-p.arm):lerp(1.25,.05,p.arm||0);if(p.cast)th=lerp(th,-1.2,p.cast);
  const shx=4.2*w,shy=-20+y,fx=shx+Math.cos(th)*8.5,fy=shy+Math.sin(th)*8.5;
  if(cls==='drifter'&&!g.armor)S.push(sR('#7a5a3a',-8*w,-23+y,5,9,1.5));
  S.push(sC(skin,-4.6*w,-20+y,-6*w-lg*.3,-12.5+y,2.4),sE(skin,-6*w-lg*.3,-11.6+y,1.9,1.9));
  S.push(sC(pants,-2.3*w,-9,-3.2*w-lg,-2,2.5),sE(shoe,-2.8*w-lg,-1.2,3.2,1.5));
  S.push(sC(pants,2.3*w,-9,3.2*w+lg,-2,2.5,{line:1}),sE(shoe,4.4*w+lg,-1.2,3.2,1.5,{line:1}));
  S.push(sE(top,0,-15.5+y,7*w,8.2));
  if(g.armor&&g.armor.base==='dino')for(let i=0;i<3;i++)S.push(sP('#2f8a40',[[-6.6*w,-21+i*4+y],[-6.6*w,-17.6+i*4+y],[-9.6*w,-19.4+i*4+y]]));
  if(g.armor&&g.armor.base==='bubble')for(const[a,b]of[[-2,-18],[2,-14],[-3,-12],[3,-19]])S.push(sE('#ffffff',a*w,b+y,.6,.6,{flat:2,dot:1}));
  if(cls==='brawler'&&!g.armor)S.push(sR('#f3e4c3',-4.4*w,-14.5+y,8.8*w,8,2,{line:1}));
  if(cls==='owl'&&!g.hat)S.push(sE('#2a2238',.4,-26.4+y,5.8,6));
  S.push(sE(skin,1.2,-26.4+y,4.4,4.7,{line:1}));
  // hair
  const st=L.style;
  if(st==='short'||(st==='spiky'&&g.hat))S.push(sR(hair,-3.2,-31.8+y,8.4,3.2,1.2));
  if(st==='long')S.push(sR(hair,-3.6,-31.8+y,8.8,3.4,1.2),sR(hair,-4,-29+y,3.2,8,1.2));
  if(st==='bun')S.push(sR(hair,-3.2,-31.6+y,8.4,3,1.2),sE(hair,-2.6,-32.4+y,2.4,2.2));
  if(st==='pony')S.push(sR(hair,-3.2,-31.6+y,8.4,3,1.2),sC(hair,-3.6,-29.6+y,-6.4,-24+y,1.3));
  if(st==='afro')S.push(sE(hair,.6,-29.6+y,6.2,5.2));
  if(st==='mohawk'&&!g.hat)S.push(sR(hair,-1,-36.2+y,3,6,1.2));
  if(st==='spiky'&&!g.hat)for(let i=0;i<4;i++)S.push(sP(hair,[[-3+i*2.2,-30+y],[-1+i*2.2,-30+y],[-2.4+i*2.6,-34.4+y]]));
  if(st!=='bald'&&st!=='afro')S.push(sE(skin,1.4,-27.4+y,3.6,2.6));
  S.push(sE(skin,-1.8,-26.2+y,1.1,1.4,{line:1}));
  if(p.hurt)S.push(sR(INK,2.5,-27.4+y,2,.7,0,{flat:0}),sE(INK,3.6,-24.2+y,.9,.9,{flat:0}));
  else S.push(sE(INK,3.4,-26.9+y,.6,.9,{flat:0,dot:1}),sR(INK,2.3,-28.6+y,2.6,.6,0,{flat:0}),sR(WHITE,2.8,-24.6+y,2.2,.8,0,{flat:1}));
  // class headwear / hats
  if(g.hat)hatShapes(S,GEAR[g.hat.base].vis,y,p);
  else if(cls==='brawler')S.push(sR('#d9443a',-3.4,-29.4+y,9,1.6,0));
  else if(cls==='witch'){S.push(sE('#3a2a5a',.6,-29.6+y,7.4,1.6,{line:1}),sP('#3a2a5a',[[-3.4,-30+y],[4.4,-30+y],[2.4,-36+y],[6+Math.sin((p.t||0)*2)*.7,-39.4+y],[.6,-36.6+y]],{line:1}),sR('#7dffb0',-3,-31.6+y,7.4,1.3,0,{flat:1,glow:1}))}
  else if(cls==='owl')S.push(sR('#5ff2ff',.8,-28.2+y,5.2,1.6,.6,{flat:1,glow:1}));
  else if(cls==='pyro'&&st!=='mohawk')S.push(sR('#ff8a2a',-1,-35.6+y,3,5,1.2));
  // weapon arm
  S.push(sC(skin,shx,shy,fx,fy,2.6,{line:1}));
  const wv=g.weapon?GEAR[g.weapon.base].vis:{brawler:'fist',pyro:'flame',witch:'cup',owl:'dagger',drifter:'stick'}[cls];
  weaponShapes(S,wv,fx,fy,th,p);
  if(wv!=='gauntlet')S.push(sE(skin,fx,fy,2.1,2.1,{line:1}));
  return S}
function hatShapes(S,v,y,p){
  if(v==='tinfoil')S.push(sP('#d8dde6',[[-3.6,-29.6+y],[5.4,-29.6+y],[1.2,-38+y]],{line:1}),sE('#ffffff',0,-32+y,.6,.6,{flat:2,dot:1}));
  if(v==='propeller'){S.push(sE('#3d6ad0',1,-30.4+y,4.8,2.6,{line:1}),sR('#d9443a',-.2,-31.2+y,2.4,1,0),sC('#888888',1,-33+y,1,-34.4+y,.4));const a=(p.t||0)*20;S.push(sC('#ffd25e',1-Math.cos(a)*3.4,-34.6+y,1+Math.cos(a)*3.4,-34.6+y,.6,{flat:1}))}
  if(v==='cone')S.push(sP('#ff7a2a',[[-3.8,-29.8+y],[6,-29.8+y],[1.1,-40+y]],{line:1}),sR('#ffffff',-1.2,-34.4+y,4.6,1.2,0),sR('#ff7a2a',-4.8,-30.6+y,11.8,1.4,.4));
  if(v==='fedora')S.push(sE('#3a2a2a',1.2,-30+y,7.2,1.4,{line:1}),sR('#3a2a2a',-2.6,-34.6+y,7.6,4.8,1.4),sR('#c8a050',-2.6,-31.4+y,7.6,1,0));
  if(v==='crown'){S.push(sR('#ffc83a',-3.2,-32.4+y,8.8,3,0,{line:1}));for(let i=0;i<4;i++)S.push(sP('#ffc83a',[[-3.2+i*2.2,-32.2+y],[-1+i*2.2,-32.2+y],[-2.1+i*2.2,-35+y]]))}
  if(v==='bucket')S.push(sR('#8a93a3',-3.6,-35.6+y,9.6,6.6,.8,{line:1}),sR('#6a7383',-4.2,-29.6+y,10.8,1.2,0));
  if(v==='slime')S.push(sE('#7ad060',1.2,-30.4+y,6,4.4,{line:1}),sE('#1d1526',3,-31+y,.5,.7,{flat:0,dot:1}));
}
function weaponShapes(S,v,fx,fy,th,p){const sa=th-1.25,dx=Math.cos(sa),dy=Math.sin(sa);const at=(d)=>[fx+dx*d,fy+dy*d];
  if(v==='spatula'){const[a,b]=at(4.5),[c,d]=at(8);S.push(sC(WOOD,fx,fy,a,b,.8),sC(STEEL,a,b,c,d,1.8,{line:1}))}
  if(v==='noodle'){const[a,b]=at(13);S.push(sC('#ff5aa8',fx-dx*2,fy-dy*2,a,b,1.4,{line:1}))}
  if(v==='keyboard'){const[a,b]=at(5);S.push(sC('#2a2a38',fx,fy,a,b,2.2,{line:1}));const[c,d]=at(3);S.push(sE('#5ff2ff',c,d,.5,.5,{flat:1,glow:1,dot:1}))}
  if(v==='baguette'){const[a,b]=at(11);S.push(sC('#d8a05a',fx-dx,fy-dy,a,b,1.5,{line:1}))}
  if(v==='chicken'){const[a,b]=at(7);S.push(sC('#ffe04a',fx,fy,a,b,1.5,{line:1}),sE('#ffe04a',a,b,2,1.6,{line:1}),sE('#ff7a2a',a+dx*2,b+dy*2,.8,.6))}
  if(v==='sign'){const[a,b]=at(12);S.push(sC('#8a93a3',fx,fy,a,b,.6),sE('#d9302a',a,b,3,3,{line:1}),sR('#ffffff',a-1.8,b-.4,3.6,.8,0,{flat:1}))}
  if(v==='stick'){const[a,b]=at(10);S.push(sC('#2a2a38',fx,fy,a,b,.5),sR('#1d1526',a-1,b-1.6,2,3.2,.4),sE('#9ffaff',a,b,.5,.8,{flat:1,glow:1,dot:1}))}
  if(v==='whip'){const[a,b]=at(5),[c,d]=at(10);S.push(sC('#e88a9a',fx,fy,a,b-1,.7),sC('#e88a9a',a,b-1,c,d+1,.5))}
  if(v==='dagger'){const[a,b]=at(6);S.push(sC('#5ff2ff',fx+dx,fy+dy,a,b,.7,{flat:1,glow:1}))}
  if(v==='flame')S.push(sE('#ff9a2e',fx,fy-2.4,1.8,2.4,{flat:1,glow:1}),sE('#ffe36a',fx,fy-1.6,.9,1.2,{flat:2,glow:1}));
  if(v==='cup')S.push(sR(WHITE,fx-.6,fy-3,3.6,2.8,.8,{line:1}),sR('#7dffb0',fx-.2,fy-3.1,2.8,.8,0,{flat:1,glow:1}));
  if(v==='gauntlet')S.push(sE('#c88a8a',fx,fy,3.2,3,{line:1}),sR('#7a6a8a',fx-2.4,fy-1,4.8,1,0));
}

// ---------------------------------------------------------------- monsters (built facing right, mirrored to face left)
function monsterShapes(type,p){const y=p.bob||0,S=[];const a=p.atk||0,ph=p.t||0;
  if(type==='rat'){S.push(sC('#e88a9a',-6,-4,-13,-7+Math.sin(ph*6)*1.5,.6),sE('#6a5a7a',0,-5+y,7.5,4.6),sE('#7a6a8a',-1,-6.4+y,5.5,2.4),sC('#5a4a6a',-3,-2,-3.6+Math.sin(ph*12)*.8,0,1),sC('#5a4a6a',3,-2,3.6-Math.sin(ph*12)*.8,0,1),
    sE('#7a6a8a',6.6+a*3,-6.4+y,3.6,3),sE('#e88a9a',4.6+a*3,-9.4+y,1.6,1.8,{line:1}),sE('#ff4a5a',7.6+a*3,-7.2+y,.7,.7,{flat:1,glow:1,dot:1}),sE('#e88a9a',10+a*3,-6+y,.8,.7),sC('#2a2a38',8+a*3,-5+y,12+a*3,-3+y,.3))}
  if(type==='tumble'){const r=ph*1.6;S.push(sE('#a07a44',0,-9+y,9,9));for(let i=0;i<5;i++){const an=r+i*1.26;S.push(sC('#7a5a30',Math.cos(an)*7,-9+y+Math.sin(an)*7,-Math.cos(an)*6,-9+y-Math.sin(an)*6,.5))}
    S.push(sE('#1d1526',2.4,-11+y,.7,.9,{flat:0,dot:1}),sE('#1d1526',5.6,-11+y,.7,.9,{flat:0,dot:1}),sR('#1d1526',2.6,-7.4+y,3,.6,0,{flat:0}))}
  if(type==='slime'){const wb=Math.sin(ph*5)*.08;S.push(sE('#5ab048',0,-6+y*.5,9*(1+wb+a*.15),6.5*(1-wb-a*.1)),sE('#8ae070',-2.6,-8.6+y*.5,2.6,1.4,{flat:2}),sE('#1d1526',2.6,-7.4,.8,1.1,{flat:0,dot:1}),sE('#1d1526',5.6,-7.4,.8,1.1,{flat:0,dot:1}),sR('#1d1526',3,-4.6,3.2,.6,0,{flat:0}))}
  if(type==='wisp'){S.push(sP('#3ab8d8',[[-3,-10+y],[3,-10+y],[-1+Math.sin(ph*9)*2,-3+y],[-7,-6+y]],{flat:1,glow:1}),sE('#5ff2ff',0,-12+y,4.4,4.6,{flat:1,glow:1}),sE('#d8ffff',0,-12.6+y,2.2,2.4,{flat:2,glow:1}),sE('#1d1526',1.6,-13+y,.6,.9,{flat:0,dot:1}),sE('#1d1526',3.4,-13+y,.6,.9,{flat:0,dot:1}))}
  if(type==='tourist'){const u={cls:'drifter',look:{skin:'#f2b896',hair:'#c8a050',style:'short',top:'#3ab0c0',pants:'#d8c8a0',w:1.12,h:1},gear:{hat:{base:'bucket'}}};S.push(...humanShapes(u,{bob:y,arm:a,t:ph}));
    S.push(sR('#2a2a38',-1,-17+y,4,3,.5,{line:1}),sE('#5ff2ff',1,-15.6+y,.8,.8,{flat:1,glow:1,dot:1}));for(const[q,w]of[[-3,-13],[3,-18],[-1,-10]])S.push(sE('#ffd25e',q,w+y,.8,.8,{flat:1,dot:1}))}
  if(type==='golem'){const s=p.slam||0,f=p.flex||0;
    S.push(sC('#3a3448',8,-31+y,11.5,-18+y,4.3),sE('#3a3448',12,-15.5+y,4.2,4),sR(WHITE,13.5,-22+y,3.4,6,1,{line:1}),sR('#ff5aa8',13.3,-23.2+y,3.8,1.6,.5),
      sC('#3a3448',5,-12,6.5,-3,4.4),sE('#3a3448',7.5,-2.2,5.4,2.4),sC('#3a3448',-5,-12,-6.5,-3,4.4,{line:1}),sE('#3a3448',-8,-2.2,5.4,2.4,{line:1}),
      sE('#3a3448',0,-24+y,13.5,13),sC('#5ff2ff',-9,-19+y,-4,-13.5+y,1,{flat:1,glow:1}),sC('#5ff2ff',5,-17+y,9,-11+y,.8,{flat:1,glow:1}),sC('#5ff2ff',-1,-13+y,2,-16+y,.7,{flat:1,glow:1}),
      sE('#3a3448',-5.5,-28.5+y+f,5.6,3.9,{line:1}),sE('#3a3448',4.8,-28.5+y-f,5.6,3.9,{line:1}),sE('#3a3448',-3,-39.5+y,5,4.6,{line:1}),sR('#ff5aa8',-8.2,-42.6+y,10.4,1.9,0),
      sR(INK,-8.6,-41.1+y,3.6,.8,0,{flat:0}),sE('#5ff2ff',-6.4,-39.6+y,.9,1,{flat:1,glow:1,dot:1}),sR(INK,-7.6,-37.2+y,2.8,.7,0,{flat:0}));
    if(p.armorBroken)S.push(sC('#ff5a6a',-6,-30+y,2,-20+y,.5,{flat:1,glow:1}),sC('#ff5a6a',2,-20+y,-1,-14+y,.5,{flat:1,glow:1}));
    const F=s<0?[lerp(-12,-6,-s),lerp(-15,-54,-s)]:[lerp(-12,-26,s),lerp(-15,-6,s)],fy=F[1]+y*(1-Math.abs(s));
    S.push(sC('#3a3448',-9,-30+y,F[0],fy,4.7,{line:1}),sE('#3a3448',F[0],fy,5.3,5,{line:1}));
    return S}  // golem is already drawn facing left
  return mirrorShapes(S)}
