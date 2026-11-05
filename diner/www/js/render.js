'use strict';
// Stage renderer (style D): layered parallax scenes, puppet actors, dynamic posterized lighting,
// emissive bloom, wet reflections, particles. Logical height is 270px; width grows 480..640 with the screen.
const ST={S:1.5,tones:5,dither:true,outline:'selout',ink:hexRgb(INK)};
const TWU=320; // tile width in design units for scrolling scenes

class Stage{
  constructor(canvas){this.cv=canvas;this.dc=canvas.getContext('2d');this.S=ST.S;this.lh=270;this.u=v=>Math.round(v*this.S);
    this.scene=null;this.scroll=0;this.t=0;this.shake=0;this.parts=[];this.flashes=[];this.resize()}
  resize(){const W=window.innerWidth,Hh=window.innerHeight;const lw=clamp(Math.round(270*W/Hh/2)*2,480,640);const changed=lw!==this.lw;this.lw=lw;
    this.scale=Math.min(W/lw,Hh/270);const dpr=window.devicePixelRatio||1;this.k=Math.max(1,Math.round(this.scale*dpr));
    this.cv.width=lw*this.k;this.cv.height=270*this.k;this.cv.style.width=Math.round(lw*this.scale)+'px';this.cv.style.height=Math.round(270*this.scale)+'px';
    this.ox=(lw-480)>>1;
    if(changed||!this.low){const lh=270;this.low=mk(lw,lh);this.lc=this.low.getContext('2d');this.world=mk(lw,lh);this.wc=this.world.getContext('2d');
      this.lightC=mk(lw,lh);this.lx=this.lightC.getContext('2d',{willReadFrequently:true});this.mask=mk(lw,lh);this.mx=this.mask.getContext('2d');
      this.emis=mk(lw,lh);this.ex=this.emis.getContext('2d');this.b1=mk(Math.ceil(lw/4),Math.ceil(lh/4));this.b2=mk(Math.ceil(lw/10),Math.ceil(lh/10));
      if(this.scene)this.scene.bake(this)}
    return{x:(W-lw*this.scale)/2,y:(Hh-270*this.scale)/2,w:lw*this.scale,h:270*this.scale,scale:this.scale}}
  setScene(sc){this.scene=sc;sc.bake(this);this.scroll=0}
  // offsets (px) for each tile copy of a layer moving at parallax factor f
  tiles(f){const tw=Math.round(TWU*this.S);if(!this.scene.tiled)return[this.ox];const b=-(((Math.round(this.scroll*f*this.S))%tw+tw)%tw);const o=[];for(let x=b;x<this.lw;x+=tw)o.push(x);return o}
  emit(o){this.parts.push({vx:0,vy:0,g:0,life:1,size:1,glow:false,drag:0,...o,max:o.life||1})}
  update(dt){this.t+=dt;this.shake*=Math.exp(-dt*9);
    for(const p of this.parts){p.life-=dt;p.vy+=p.g*dt;if(p.wob!==undefined){p.vx+=Math.sin(this.t*3+p.wob)*dt*14;p.vy+=Math.cos(this.t*2.3+p.wob)*dt*10}const d=Math.exp(-p.drag*dt);p.vx*=d;p.vy*=d;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.floor&&p.y>p.floor&&p.vy>0){p.y=p.floor;p.vy*=-.3;p.vx*=.6}}
    this.parts=this.parts.filter(p=>p.life>0);for(const f of this.flashes)f.t-=dt;this.flashes=this.flashes.filter(f=>f.t>0);
    if(this.scene.tick)this.scene.tick(this,dt)}
  drawParts(c,glow){const u=this.u,ox=this.ox;for(const p of this.parts){if(!!p.glow!==glow)continue;const f=p.life/p.max;c.globalAlpha=p.fade?Math.min(1,f*1.5)*(p.dim?.5:1):1;c.fillStyle=p.col;const s=Math.max(1,Math.floor(p.size*this.S));const x=u(p.x)+ox,y=u(p.y);c.fillRect(x,y,s,s);
    if(glow&&Math.hypot(p.vx,p.vy)>40)c.fillRect(x-Math.round(p.vx*.012*this.S),y-Math.round(p.vy*.012*this.S),s,s)}c.globalAlpha=1}
  // actors: [{sprite:{c,gc,x0,y0}, x, y, alpha, flash, sy}] ; ui(c) draws unlit overlay text
  frame(actors,ui){const sc=this.scene,u=this.u,{lw,lh}=this,c=this.lc,w=this.wc,e=this.ex,S=this.S,t=this.t;
    // emissive buffer (also feeds reflections and bloom)
    e.clearRect(0,0,lw,lh);sc.emis(e,this,t);this.drawParts(e,true);
    c.globalCompositeOperation='source-over';c.globalAlpha=1;sc.drawBack(c,this);
    w.clearRect(0,0,lw,lh);w.globalCompositeOperation='source-over';sc.drawNear(w,this);
    if(sc.wet){const gy=u(sc.wetY||123);w.globalCompositeOperation='lighter';for(let y=gy;y<lh;y+=2){const sy=2*gy-y;if(sy<0)break;const k=(y-gy)/(lh-gy);w.globalAlpha=.24*(1-k);const dx=Math.round(Math.sin(y*.7+t*4)*(1+k*2));w.drawImage(this.emis,0,sy,lw,2,dx,y,lw,2)}w.globalAlpha=1;w.globalCompositeOperation='source-over'}
    const glows=[];
    for(const a of actors){if(a.hidden)continue;const px=u(a.x)+this.ox,py=u(a.y);
      w.globalAlpha=.42;pxEllipse(w,px,u(a.y+1),u(a.shadow||8),Math.max(1,u(2)),'#0a0612');w.globalAlpha=1;
      if(!a.sprite)continue;const sp=a.sprite;const X=px+sp.x0,Y=py+sp.y0;
      if(a.trail)a.trail.forEach((tx,i)=>{w.globalAlpha=.3-i*.08;w.drawImage(sp.c,u(tx)+this.ox+sp.x0,Y)});
      w.globalAlpha=a.alpha??1;
      if(a.sy&&a.sy<1){const h=sp.c.height;w.drawImage(sp.c,0,0,sp.c.width,h,X,Y+Math.round(h*(1-a.sy)),sp.c.width,Math.max(1,Math.round(h*a.sy)))}else w.drawImage(sp.c,X,Y);
      w.globalAlpha=1;if(sp.gc&&!a.flash&&(a.sy??1)>=1)glows.push([sp.gc,X,Y,a.alpha??1])}
    this.drawParts(w,false);
    // lighting
    this.mx.clearRect(0,0,lw,lh);this.mx.drawImage(this.world,0,0);
    const L=this.lx;L.globalCompositeOperation='source-over';L.fillStyle=css(sc.ambient);L.fillRect(0,0,lw,lh);L.globalCompositeOperation='lighter';
    const lt=(X,Y,r,col,a)=>{const RR=r*S;const g=L.createRadialGradient(X,Y,0,X,Y,RR);g.addColorStop(0,css(col,clamp(a,0,1)));g.addColorStop(1,css(col,0));L.fillStyle=g;L.fillRect(X-RR,Y-RR,RR*2,RR*2)};
    sc.lights(lt,this,t);for(const f of this.flashes)lt(u(f.x)+this.ox,u(f.y),f.r,f.col,f.a*Math.min(1,f.t/f.max*2));
    const im=L.getImageData(0,0,lw,lh),d=im.data,steps=6;for(let y=0;y<lh;y++)for(let x=0;x<lw;x++){const p=(y*lw+x)*4,o=bayer4(x,y);for(let k=0;k<3;k++)d[p+k]=Math.min(steps,Math.floor(d[p+k]/255*steps+o))/steps*255}L.putImageData(im,0,0);
    w.globalCompositeOperation='multiply';w.drawImage(this.lightC,0,0);w.globalCompositeOperation='destination-in';w.drawImage(this.mask,0,0);w.globalCompositeOperation='source-over';
    c.drawImage(this.world,0,0);sc.emis(c,this,t);this.drawParts(c,true);
    for(const[g,X,Y,a]of glows){c.globalAlpha=a;c.drawImage(g,X,Y);e.drawImage(g,X,Y);c.globalAlpha=1}
    if(sc.overlay)sc.overlay(c,this,t);
    for(const f of this.flashes)if(f.blob){e.globalAlpha=Math.min(1,f.t/f.max*2);pxEllipse(e,u(f.x)+this.ox,u(f.y),u(f.blob),u(f.blob),'#fff0d0');e.globalAlpha=1}
    if(ui)ui(c,this);
    this.present()}
  present(){const dc=this.dc,k=this.k,{lw,lh}=this;const a=this.shake*3;const sx=Math.round((Math.random()-.5)*2*a),sy=Math.round((Math.random()-.5)*2*a);
    dc.globalCompositeOperation='source-over';dc.globalAlpha=1;dc.fillStyle='#000';dc.fillRect(0,0,this.cv.width,this.cv.height);dc.imageSmoothingEnabled=false;dc.drawImage(this.low,sx*k,sy*k,lw*k,lh*k);
    const b1=this.b1.getContext('2d'),b2=this.b2.getContext('2d');b1.clearRect(0,0,this.b1.width,this.b1.height);b1.imageSmoothingEnabled=true;b1.drawImage(this.emis,0,0,this.b1.width,this.b1.height);b2.clearRect(0,0,this.b2.width,this.b2.height);b2.imageSmoothingEnabled=true;b2.drawImage(this.b1,0,0,this.b2.width,this.b2.height);
    dc.imageSmoothingEnabled=true;dc.globalCompositeOperation='lighter';dc.globalAlpha=.5;dc.drawImage(this.b1,sx*k,sy*k,lw*k,lh*k);dc.globalAlpha=.4;dc.drawImage(this.b2,sx*k,sy*k,lw*k,lh*k);dc.globalAlpha=1;dc.globalCompositeOperation='source-over'}
  // world units -> screen px helpers for UI
  sx(xu){return this.u(xu)+this.ox}
}

// ---------------------------------------------------------------- scene: The Gutter (scrolling sewer tunnel)
const GutterScene={tiled:true,wet:true,wetY:131,ambient:[58,48,92],
  bake(st){const S=st.S,tw=Math.round(TWU*S),lh=270;const mkL=()=>{const c=mk(tw,lh);return[c,c.getContext('2d'),H(S,0)]};
    // far wall
    let[cf,f,h]=mkL();h.box(f,0,0,320,180,'#150f22');seed=31;
    for(let r=0,y=18;y<118;y+=6,r++){for(let x=(r%2)*6-12;x<320;x+=12){h.box(f,x,y,12,6,rnd()<.5?'#1a1328':'#181226');h.box(f,x,y,.7,6,'#0f0a18')}h.box(f,0,y,320,.7,'#0f0a18')}
    for(const ax of[40,200]){h.box(f,ax,52,56,66,'#0b0713');h.ell(f,ax+28,52,28,18,'#0b0713');h.box(f,ax-2,50,2,68,'#221a30');h.box(f,ax+56,50,2,68,'#221a30');for(let i=0;i<9;i++)h.px(f,ax+6+rnd()*44,60+rnd()*40,rnd()<.5?'#ff5aa8':'#5ff2ff')}
    h.box(f,0,0,320,18,'#0e0a18');h.box(f,0,17,320,1.2,'#1e1630');
    for(const gx of[118,278]){h.box(f,gx,0,26,14,'#241c34');for(let i=0;i<6;i++)h.box(f,gx+2+i*4,0,1.6,13,'#3a3050')}
    h.box(f,0,112,320,8,'#221a30');h.box(f,0,112,320,1,'#2e2440');
    this.far=cf;
    // mid: pipes, signs, canal
    let[cm,m,hm]=mkL();
    hm.box(m,0,30,320,12,'#2e2a3a');hm.box(m,0,31,320,2,'#4a4458');hm.box(m,0,40,320,2,'#1e1a28');for(let x=8;x<320;x+=64){hm.box(m,x,28.5,4,15,'#3e3850');hm.box(m,x,28.5,4,1,'#5a5470')}
    hm.box(m,0,52,320,4,'#3a3046');hm.box(m,0,52,320,1,'#4e4460');
    hm.box(m,100,42,6,78,'#2e2a3a');hm.box(m,100,42,1.4,78,'#4a4458');hm.ell(m,103,80,5,5,'#5a3a3a');hm.ell(m,103,80,3.4,3.4,'#2e2a3a');
    hm.box(m,226,64,40,9,'#2a3a4a');hm.box(m,226,64,40,1,'#4a6078');hm.text(m,'ARCDYNE',246,68.5,1,'#8aa0b8');hm.text(m,'NO DIVING',246,78,1,'#5a5070');
    hm.text(m,'EAT AT LAST STOP',160,90,1,'#a04a7a');hm.text(m,'DOLORES WAS HERE',40,104,1,'#4a8a6a');hm.line(m,135,95,185,94,'#a04a7a');
    hm.box(m,0,118,320,14,'#10261e');for(let x=0;x<320;x+=10)hm.box(m,x+(x%20?3:0),121+(x%30?0:4),5,.7,'#1a3a2c');
    this.mid=cm;
    // near: walkway
    let[cn,n,hn]=mkL();hn.box(n,0,131,320,50,'#211a2b');for(const y of[142,158])hn.box(n,0,y,320,.7,'#181220');for(let x=0;x<320;x+=20)hn.box(n,x+(x%40?0:10),131,.7,50,'#181220');
    seed=33;for(let i=0;i<220;i++)hn.px(n,rnd()*320,133+rnd()*46,rnd()<.5?'#2a2236':'#17111f');for(const[x,y,rx]of[[60,170,14],[190,150,10],[280,174,12]])hn.ell(n,x,y,rx,2.2,'#2a2438');
    hn.box(n,0,130,320,3,'#3a3046');hn.box(n,0,130,320,1,'#4e4460');hn.box(n,150,164,14,4,'#120e18');for(let x=151;x<164;x+=2)hn.box(n,x,164,.7,4,'#3a3446');
    this.near=cn},
  drawBack(c,st){c.fillStyle='#0b0713';c.fillRect(0,0,st.lw,st.lh);for(const o of st.tiles(.35))c.drawImage(this.far,o,0);for(const o of st.tiles(.7))c.drawImage(this.mid,o,0)},
  drawNear(w,st){for(const o of st.tiles(1))w.drawImage(this.near,o,0)},
  emis(c,st,t){const S=st.S;
    for(const o of st.tiles(.35)){const h=H(S,o);for(const gx of[118,278]){c.globalAlpha=.10;h.poly(c,[[gx,14],[gx+26,14],[gx+40,131],[gx-12,131]],'#b8c8ff');c.globalAlpha=1;for(let i=0;i<6;i++)h.box(c,gx+2.6+i*4,1,1,11,'#9fb0e0')}}
    for(const o of st.tiles(.7)){const h=H(S,o);for(let s=0;s<8;s++){const x=s*40;const fl=Math.sin(t*13+s*7)*Math.sin(t*2.1+s)>.82;h.box(c,x,42.4,40,1,fl?'#5a1a3a':'#ff5aa8');h.box(c,x,56.2,40,.8,'#5ff2ff')}
      for(let x=0;x<320;x+=16){const k=(t*.6+x*.013)%1;h.box(c,x+k*10,123+Math.sin(x+t)*2,4,.6,'#3aff9a')}}},
  lights(lt,st,t){const S=st.S,u=v=>Math.round(v*S);lt(st.sx(104),u(128),125,[255,190,140],.5);lt(st.sx(232),u(128),120,[170,185,255],.42);
    for(const o of st.tiles(.35))for(const gx of[118,278])lt(u(gx+13)+o,u(80),95,[170,190,255],.45);
    for(const o of st.tiles(.7)){for(let x=20;x<320;x+=64)lt(u(x)+o,u(46),70,[255,80,170],.42);for(let x=52;x<320;x+=64)lt(u(x)+o,u(58),60,[80,230,255],.34);for(let x=40;x<320;x+=80)lt(u(x)+o,u(125),60,[60,255,150],.28)}},
  tick(st,dt){if(Math.random()<dt*14){const tw=TWU;const o=st.tiles(.35);const base=(o[0]-st.ox)/st.S;const gx=pick([118,278])+R(0,26)+base+(Math.random()<.5?tw:0);if(gx>-10&&gx<st.lw/st.S)st.emit({x:gx,y:14,vy:R(120,160),vx:R(-6,6)*.2,life:1.1,col:'#9fb4ff',size:1,floor:131})}}
};

// ---------------------------------------------------------------- scene: Rimside street outside the diner (hub)
const DinerScene={tiled:false,wet:true,wetY:123,ambient:[56,46,96],
  bake(st){const S=st.S,lw=st.lw,lh=270,ox=st.ox;const h=H(S,ox);
    this.back=mk(lw,lh);const k=this.back.getContext('2d');const cols=['#06040e','#0d0818','#160c24','#22102e','#301838','#3e1f44','#4e2a4c'].map(hexRgb);const hz=Math.round(114*S);
    const im=k.createImageData(lw,lh),d=im.data;for(let y=0;y<lh;y++){const f=clamp(y/hz,0,1)*(cols.length-1);const i=Math.min(cols.length-2,Math.floor(f)),fr=f-i;for(let x=0;x<lw;x++){const c=fr>bayer4(x,y)?cols[i+1]:cols[i];const p=(y*lw+x)*4;d[p]=c[0];d[p+1]=c[1];d[p+2]=c[2];d[p+3]=255}}k.putImageData(im,0,0);
    seed=5;for(let i=0;i<20;i++){k.fillStyle='#b8b0e0';k.fillRect(rnd()*lw|0,rnd()*lh*.4|0,1,1)}
    moon(k,h,56,30,9,'#ffd6f0','#c890b8');
    skyline(k,h,{seed:21,x0:-80,x1:410,base:116,minH:24,maxH:62,minW:6,maxW:11,col:'#140c22',win:['#ff5aa8','#5ff2ff','#7dffb0'],winP:.16,cone:1});
    seed=17;for(let x=-80;x<410;){const w=12+rnd()*14,ht=6+rnd()*10;h.box(k,x,116-ht,w,ht+8,'#1a1028');h.poly(k,[[x-1,116-ht],[x+w+1,116-ht],[x+w/2,116-ht-w*.5]],'#1a1028');if(rnd()<.6)h.box(k,x,116-ht,w,.7,rnd()<.5?'#ff5aa8':'#5ff2ff');x+=w+1}
    this.near=mk(lw,lh);const n=this.near.getContext('2d');
    h.box(n,-80,122,500,80,'#18141c');seed=4;let r=0;for(let y=123.5;y<182;y+=3.1,r++){const off=r%2?0:2.6;for(let x=-80+off;x<410;x+=5.2)h.ell(n,x+rnd()*.6,y+rnd()*.3,2.2,1.1,pick(['#2e2732','#352c38','#2a2430']))}
    h.box(n,18,104,132,18,'#2e2a36');for(const y of[108.5,113.5,118])h.box(n,18,y,132,.7,'#221e2a');
    h.box(n,18,64,132,40,'#3a3448');for(const x of[18,46,74,102,147])h.box(n,x,64,3,40,'#1a1220');h.box(n,18,64,132,3,'#1a1220');h.box(n,18,101,132,3,'#1a1220');
    h.poly(n,[[8,67],[30,38],[140,38],[160,67]],'#2a1830');for(let y=42;y<66;y+=4){const f=(y-38)/29;h.box(n,lerp(30,8,f),y,lerp(140,160,f)-lerp(30,8,f),.8,'#1e1024')}
    h.box(n,112,24,12,15,'#2e2a36');h.box(n,110,23,16,2,'#221e2a');
    for(const x of[24,52,80]){h.box(n,x-1,73,18,24,'#1a1220');h.box(n,x,74,16,22,'#1a1424')}
    h.ell(n,133,85,11,6.5,'#1a1220');h.box(n,122,85,22,37,'#1a1220');h.ell(n,133,86,9,5,'#2e1e30');h.box(n,124,86,18,36,'#2e1e30');
    h.box(n,103,68,17,1.4,'#0e0a12');h.line(n,106,69,106,71,'#0e0a12');h.line(n,116,69,116,71,'#0e0a12');h.poly(n,[[104,76],[107,71],[115,71],[118,76],[115,81],[107,81]],'#120c18');
    // pawn shop and smithy next door
    h.box(n,170,74,62,48,'#2a2236');h.box(n,166,70,70,5,'#1a1220');h.box(n,176,84,22,20,'#14101c');h.box(n,206,86,14,36,'#1a1220');h.box(n,244,80,56,42,'#2e2630');h.box(n,240,76,64,5,'#1a1220');h.box(n,252,92,20,30,'#120c14');h.box(n,282,60,8,22,'#3a3240');
    h.ell(n,126,149,7,4.5,'#141018');h.ell(n,126,145.5,6.4,1.6,'#0c2a18');h.box(n,119,148,2,1.5,'#141018');h.box(n,131,148,2,1.5,'#141018');h.box(n,144,113,10,9,'#2a1e2e')},
  drawBack(c,st){c.drawImage(this.back,0,0)},
  drawNear(w,st){w.drawImage(this.near,0,0)},
  emis(c,st,t){const h=H(st.S,st.ox);
    for(const x of[24,52,80]){h.box(c,x,74,16,22,'#d8a8ff');h.box(c,x,88,16,8,'#9a6ad8');const X0=h.u(x)+h.off,Y0=h.u(74),X1=h.u(x+16)+h.off,Y1=h.u(96);c.fillStyle='#3a1a5a';for(let y=Y0;y<Y1;y++)for(let xx=X0;xx<X1;xx++)if((xx+y)%6===0||((xx-y)%6+6)%6===0)c.fillRect(xx,y,1,1)}
    const fl=Math.sin(t*15)*Math.sin(t*2.7)>.7;h.box(c,18,64.8,132,.8,fl?'#7a2a5a':'#ff5aa8');h.box(c,18,102,132,.8,'#ff5aa8');for(const x of[19.2,47.2,75.2,103.2,148.2])h.box(c,x,64,.8,40,'#5ff2ff');
    h.line(c,9,66,30,38.5,'#ff5aa8');h.line(c,140,38.5,159,66,'#ff5aa8');h.box(c,30,38,110,.8,'#ff5aa8');
    h.poly(c,[[104.6,76],[107.4,71.6],[114.6,71.6],[117.4,76],[114.6,80.4],[107.4,80.4]],'#0d2a1a');h.text(c,'EAT',111,76,2,'#7dffb0');
    for(const[x,y]of[[47.5,68],[146,70]]){const p=.5+.5*Math.sin(t*3+x);h.box(c,x-1.4,y-1,2.8,2.8,p>.5?'#9ffaff':'#5ff2ff')}
    h.flame(c,t,121,145.5,5,['#1aaa5a','#2aff7a','#d0ffe0'],.85);
    h.box(c,176,84,22,20,'#e0a860');h.ell(c,187,94,3,3.2,'#4a2a2a');h.box(c,182,97,10,7,'#4a2a2a');for(let i=0;i<3;i++)h.box(c,177+i*7,86,5,1,'#ffe0a0');h.text(c,'PAWN',201,78,1,Math.sin(t*4)>-.6?'#ffd25e':'#5a4630');h.text(c,'& PRAWN',201,98,1,'#ff8a5a');
    h.box(c,254,94,16,12,'#ff7a2a');h.box(c,256,100,12,6,'#ffd25e');h.text(c,'SMITH',272,86,1,'#ff9a4a');
    for(let i=0;i<4;i++){const gl=.5+.5*Math.sin(t*2+i);h.ell(c,145.5+i*2.4,112,1.3,.9,gl>.5?'#ff8ad8':'#7dffb0')}},
  lights(lt,st,t){const u=v=>Math.round(v*st.S)+st.ox;lt(u(84),u(64),110,[255,90,200],.5);lt(u(84),u(102),100,[90,230,255],.42);lt(u(111),u(76),50,[110,255,170],.6);lt(u(126),u(140),90,[80,255,140],.9);for(const x of[24,52,80])lt(u(x+8),u(85),34,[200,140,255],.55);lt(u(187),u(94),50,[255,200,120],.6);lt(u(262),u(100),55,[255,130,50],.7)},
  tick(st,dt){},
  overlay(c,st,t){if(!this.rain){this.rain=[];for(let i=0;i<170;i++)this.rain.push({x:Math.random()*st.lw*1.2,y:Math.random()*270,s:R(220,300)})}
    const dt=1/60,gy=st.u(124);c.fillStyle='rgba(170,190,255,.5)';for(const r of this.rain){r.y+=r.s*dt;r.x-=r.s*dt*.18;if(r.y>gy+((r.s*7)%(270-gy))){r.y=-R(0,40);r.x=Math.random()*st.lw*1.2}const x=r.x|0,y=r.y|0;c.fillRect(x,y,1,1);c.fillRect(x+1,y-2,1,2)}}
};
