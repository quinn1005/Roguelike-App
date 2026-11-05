'use strict';
// Last Stop Diner engine core: math, colors, pixel font, pixel raster helpers, puppet rasterizer.
// ---------------------------------------------------------------- utils
const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>v<a?a:v>b?b:v;
const eo=t=>1-Math.pow(1-t,3), ei=t=>t*t*t, eio=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const B2=[0,.5,.75,.25];
const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const bayer4=(x,y)=>B4[(y&3)*4+(x&3)];
function hexRgb(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function rgbHsl([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);if(mx===r)h=(g-b)/d+(g<b?6:0);else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60}return[h,s,l]}
function hslRgb([h,s,l]){h=(((h%360)+360)%360)/360;let r,g,b;if(s===0){r=g=b=l}else{const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;const f=t=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};r=f(h+1/3);g=f(h);b=f(h-1/3)}return[Math.round(r*255),Math.round(g*255),Math.round(b*255)]}
const hueTo=(h,t,a)=>h+((((t-h)%360)+540)%360-180)*a;
// Hue-shifted ramp: shadows drift toward purple, highlights toward warm yellow.
function ramp(hex,sat=1){const[h,s0,l]=rgbHsl(hexRgb(hex));const s=Math.min(1,s0*sat);const o={};
  for(const v of[-2,-1,0,1,2]){let H=h,S=s,L=l;
    if(v<0){H=hueTo(h,258,.13*-v);S=Math.min(1,s*(1+.1*-v));L=l*(1-.23*-v)}
    if(v>0){H=hueTo(h,52,.11*v);S=s*(1-.1*v);L=l+(1-l)*.27*v}
    o[v]=hslRgb([H,S,clamp(L,0,1)])}return o}
const css=([r,g,b],a)=>a===undefined?`rgb(${r},${g},${b})`:`rgba(${r},${g},${b},${a})`;
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
const R=(a,b)=>a+Math.random()*(b-a);
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}

// ---------------------------------------------------------------- 3x5 pixel font
const F={A:"010101111101101",B:"110101110101110",C:"011100100100011",D:"110101101101110",E:"111100110100111",F:"111100110100100",G:"011100101101011",H:"101101111101101",I:"111010010010111",J:"001001001101010",K:"101101110101101",L:"100100100100111",M:"101111111101101",N:"110101101101101",O:"010101101101010",P:"110101110100100",Q:"010101101110011",R:"110101110101101",S:"011100010001110",T:"111010010010010",U:"101101101101111",V:"101101101101010",W:"101101111111101",X:"101101010101101",Y:"101101010010010",Z:"111001010100111",0:"111101101101111",1:"010110010010111",2:"110001010100111",3:"110001010001110",4:"101101111001001",5:"111100110001110",6:"011100110101010",7:"111001010010010",8:"010101010101010",9:"010101011001110","+":"000010111010000","-":"000000111000000","!":"010010010000010","?":"110001010000010",".":"000000000000010","'":"010010000000000"," ":"000000000000000"};
const textW=(s,sc)=>s.length*4*sc-sc;
function glyph(ctx,ch,x,y,sc,col,core){const g=F[ch]||F[' '];for(let i=0;i<15;i++)if(g[i]==='1'){const gx=x+(i%3)*sc,gy=y+((i/3)|0)*sc;ctx.fillStyle=col;ctx.fillRect(gx,gy,sc,sc);if(core&&sc>=3){ctx.fillStyle=core;ctx.fillRect(gx+1,gy+1,sc-2,sc-2)}}}
function text(ctx,s,x,y,sc,col){let cx=x;for(const ch of s){glyph(ctx,ch,cx,y,sc,col);cx+=4*sc}}
function textO(ctx,s,x,y,sc,col,ink){for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]])text(ctx,s,x+dx,y+dy,sc,ink);text(ctx,s,x,y,sc,col)}

// ---------------------------------------------------------------- pixel raster helpers (no anti-aliasing)
function pxEllipse(ctx,cx,cy,rx,ry,col){ctx.fillStyle=col;for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++){const dy=(y+.5-cy)/ry;if(Math.abs(dy)>1)continue;const w=rx*Math.sqrt(1-dy*dy);const a=Math.round(cx-w),b=Math.round(cx+w);if(b>a)ctx.fillRect(a,y,b-a,1)}}
function pxPoly(ctx,pts,col){ctx.fillStyle=col;let y0=1e9,y1=-1e9;for(const p of pts){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
  for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const sy=y+.5,xs=[];for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[ax,ay]=pts[i],[bx,by]=pts[j];if((ay>sy)!==(by>sy))xs.push(ax+(sy-ay)*(bx-ax)/(by-ay))}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const a=Math.round(xs[k]),b=Math.round(xs[k+1]);if(b>a)ctx.fillRect(a,y,b-a,1)}}}
function outlineCanvas(cv,rgb,passes=1){const x=cv.getContext('2d');const W=cv.width,H=cv.height;for(let p=0;p<passes;p++){const im=x.getImageData(0,0,W,H),d=im.data,src=new Uint8Array(W*H);for(let i=0;i<W*H;i++)src[i]=d[i*4+3]>100?1:0;
  for(let y=0;y<H;y++)for(let xx=0;xx<W;xx++){const i=y*W+xx;if(src[i])continue;if((xx>0&&src[i-1])||(xx<W-1&&src[i+1])||(y>0&&src[i-W])||(y<H-1&&src[i+W])){d[i*4]=rgb[0];d[i*4+1]=rgb[1];d[i*4+2]=rgb[2];d[i*4+3]=255}}x.putImageData(im,0,0)}}

// ---------------------------------------------------------------- shape puppets
const sE=(c,cx,cy,rx,ry,o={})=>({t:'e',c,cx,cy,rx,ry,...o});
const sC=(c,x1,y1,x2,y2,r,o={})=>({t:'c',c,x1,y1,x2,y2,r,...o});
const sR=(c,x,y,w,h,rr,o={})=>({t:'r',c,x,y,w,h,rr,...o});
const sP=(c,pts,o={})=>({t:'p',c,pts,...o});
function xform(S,sx,sy,lean){const X=(x,y)=>x*sx-y*lean/32,Y=y=>y*sy;return S.map(s=>{const n={...s};
  if(s.t==='e'){n.cx=X(s.cx,s.cy);n.cy=Y(s.cy);n.rx=s.rx*sx;n.ry=s.ry*sy}
  else if(s.t==='c'){n.x1=X(s.x1,s.y1);n.y1=Y(s.y1);n.x2=X(s.x2,s.y2);n.y2=Y(s.y2);n.r=s.r*(sx+sy)/2}
  else if(s.t==='r'){const cx=s.x+s.w/2,cy=s.y+s.h/2;n.w=s.w*sx;n.h=s.h*sy;n.x=X(cx,cy)-n.w/2;n.y=Y(cy)-n.h/2;n.rr=(s.rr||0)*Math.min(sx,sy)}
  else n.pts=s.pts.map(([x,y])=>[X(x,y),Y(y)]);return n})}
function bb(s){if(s.t==='e')return[s.cx-s.rx,s.cy-s.ry,s.cx+s.rx,s.cy+s.ry];if(s.t==='c')return[Math.min(s.x1,s.x2)-s.r,Math.min(s.y1,s.y2)-s.r,Math.max(s.x1,s.x2)+s.r,Math.max(s.y1,s.y2)+s.r];if(s.t==='r')return[s.x,s.y,s.x+s.w,s.y+s.h];let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const[x,y]of s.pts){a=Math.min(a,x);b=Math.min(b,y);c=Math.max(c,x);d=Math.max(d,y)}return[a,b,c,d]}
function pip(pts,x,y){let i=0,j=pts.length-1,c=false;for(;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c}
let NX=0,NY=0;
function hit(s,X,Y,b){switch(s.t){
  case'e':{const dx=(X-s.cx)/s.rx,dy=(Y-s.cy)/s.ry;if(dx*dx+dy*dy<=1){NX=dx;NY=dy;return true}return false}
  case'c':{const vx=s.x2-s.x1,vy=s.y2-s.y1,l2=vx*vx+vy*vy||1e-6;let t=((X-s.x1)*vx+(Y-s.y1)*vy)/l2;t=t<0?0:t>1?1:t;const dx=X-(s.x1+vx*t),dy=Y-(s.y1+vy*t);if(dx*dx+dy*dy<=s.r*s.r){NX=dx/s.r;NY=dy/s.r;return true}return false}
  case'r':{const hw=s.w/2,hh=s.h/2,cx=s.x+hw,cy=s.y+hh,rr=Math.min(s.rr||0,hw,hh);const qx=Math.abs(X-cx)-(hw-rr),qy=Math.abs(Y-cy)-(hh-rr);const o=Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-rr;if(o<=0){NX=(X-cx)/hw*.75;NY=(Y-cy)/hh*.6;return true}return false}
  default:{if(pip(s.pts,X,Y)){const cx=(b[0]+b[2])/2,hw=(b[2]-b[0])/2||1,cy=(b[1]+b[3])/2,hh=(b[3]-b[1])/2||1;NX=(X-cx)/hw*.85;NY=-.15+(Y-cy)/hh*.35;return true}return false}}}
const LN=Math.hypot(-.5,-.7,.55),LX=-.5/LN,LY=-.7/LN,LZ=.55/LN;
function level(s,px,py,st){if(s.flat!==undefined)return s.flat;const n2=Math.min(1,NX*NX+NY*NY),nz=Math.sqrt(1-n2);const d=NX*LX+NY*LY+nz*LZ;const f=(d-.3)*3;
  if(st.tones===1)return 0;if(st.tones===2)return f<(st.toon?-1:-.6)?-1:0;if(st.tones===3)return f<-.7?-1:f>1.2?1:0;
  let q=f;if(st.dither)q+=(B2[(py&1)*2+(px&1)]-.5)*.6;q=Math.round(q);return q<-2?-2:q>2?2:q}

function raster(shapes,st,ramps,o,pool){
  const k=st.S;let a=1e9,b=1e9,c=-1e9,d=-1e9;const bbs=shapes.map(s=>{const r=bb(s);a=Math.min(a,r[0]);b=Math.min(b,r[1]);c=Math.max(c,r[2]);d=Math.max(d,r[3]);return r});
  const pad=st.outline==='thick'?3:2;const x0=Math.floor(a*k)-pad,y0=Math.floor(b*k)-pad,W=Math.ceil(c*k)-x0+pad,H=Math.ceil(d*k)-y0+pad;const N=W*H;
  const id=new Int16Array(N).fill(-1),lv=new Int8Array(N);
  for(let py=0;py<H;py++){const Y=(py+y0+.5)/k;for(let px=0;px<W;px++){const X=(px+x0+.5)/k;
    for(let i=shapes.length-1;i>=0;i--){const q=bbs[i];if(X<q[0]||X>q[2]||Y<q[1]||Y>q[3])continue;if(hit(shapes[i],X,Y,q)){const p=py*W+px;id[p]=i;lv[p]=level(shapes[i],px,py,st);break}}}}
  shapes.forEach((s,i)=>{if(s.dot){const px=Math.floor(s.cx*k)-x0,py=Math.floor(s.cy*k)-y0;if(px>=0&&py>=0&&px<W&&py<H){id[py*W+px]=i;lv[py*W+px]=s.flat||0}}});
  if(!pool.c||pool.c.width!==W||pool.c.height!==H){pool.c=mk(W,H);pool.x=pool.c.getContext('2d')}
  const img=pool.x.createImageData(W,H),D=img.data;const set=(p,r)=>{D[p*4]=r[0];D[p*4+1]=r[1];D[p*4+2]=r[2];D[p*4+3]=255};
  for(let p=0;p<N;p++){const i=id[p];if(i<0)continue;set(p,ramps[shapes[i].c][lv[p]])}
  // inner contour lines where a flagged part overlaps a part behind it
  if(st.outline!=='none'){for(let p=0;p<N;p++){const i=id[p];if(i<0||!shapes[i].line)continue;const px=p%W;
    const ns=[px>0?p-1:-1,px<W-1?p+1:-1,p-W,p+W];for(const q of ns){if(q<0||q>=N)continue;const j=id[q];if(j>=0&&j<i&&!shapes[j].flat){set(p,st.outline==='selout'?ramps[shapes[i].c][-2]:st.ink);break}}}}
  if(o.rim){for(let p=0;p<N;p++){if(id[p]<0||shapes[id[p]].flat!==undefined)continue;const px=p%W;if(px===0||id[p-1]<0){const r=[D[p*4],D[p*4+1],D[p*4+2]];set(p,[lerp(r[0],o.rim[0],.55),lerp(r[1],o.rim[1],.55),lerp(r[2],o.rim[2],.55)])}}}
  if(o.flash){for(let p=0;p<N;p++)if(id[p]>=0)set(p,[255,248,236])}
  if(st.outline!=='none'){const op=new Uint8Array(N);for(let p=0;p<N;p++)op[p]=id[p]>=0?1:0;
    const passes=st.outline==='thick'?2:1;
    for(let pass=0;pass<passes;pass++){const add=[];for(let p=0;p<N;p++){if(op[p])continue;const px=p%W,py=(p/W)|0;
      const dn=py<H-1&&op[p+W],rt=px<W-1&&op[p+1],up=py>0&&op[p-W],lf=px>0&&op[p-1];if(!(dn||rt||up||lf))continue;
      if(st.outline==='selout'){const q=dn?p+W:rt?p+1:up?p-W:p-1;const j=id[q];if(j<0){add.push([p,st.ink]);continue}const lit=dn||rt;const r=ramps[shapes[j].c][lit?-1:-2];add.push([p,lit?r:[r[0]*.7|0,r[1]*.7|0,r[2]*.75|0]])}
      else add.push([p,st.ink])}
      for(const[p,r]of add){set(p,r);op[p]=1}}}
  pool.x.putImageData(img,0,0);let gc=null;
  if(shapes.some(s=>s.glow)){if(!pool.gc||pool.gc.width!==W||pool.gc.height!==H){pool.gc=mk(W,H);pool.gx=pool.gc.getContext('2d')}const gi=pool.gx.createImageData(W,H),G=gi.data;
    for(let p=0;p<N;p++){if(id[p]>=0&&shapes[id[p]].glow){G[p*4]=D[p*4];G[p*4+1]=D[p*4+1];G[p*4+2]=D[p*4+2];G[p*4+3]=255}}pool.gx.putImageData(gi,0,0);gc=pool.gc}
  return{c:pool.c,gc,x0,y0}}
// ---------------------------------------------------------------- drawing helpers in design units
function H(S,off){const u=v=>Math.round(v*S);const h={S,u,off,
  box(c,x,y,w,hh,col){c.fillStyle=col;const X=u(x)+off,Y=u(y);c.fillRect(X,Y,Math.max(1,u(x+w)+off-X),Math.max(1,u(y+hh)-Y))},
  poly(c,pts,col){pxPoly(c,pts.map(([x,y])=>[u(x)+off,u(y)]),col)},
  ell(c,x,y,rx,ry,col){pxEllipse(c,u(x)+off,u(y),Math.max(.7,rx*S),Math.max(.7,ry*S),col)},
  text(c,s,cx,cy,sc,col,core){const w=textW(s,sc);let x=u(cx)+off-(w>>1);const y=u(cy)-((5*sc)>>1);for(const ch of s){glyph(c,ch,x,y,sc,col,core);x+=4*sc}},
  vtext(c,s,cx,ty,sc,col,core){const x=u(cx)+off-((3*sc)>>1);[...s].forEach((ch,i)=>glyph(c,ch,x,u(ty)+i*6*sc,sc,col,core))},
  px(c,x,y,col){c.fillStyle=col;c.fillRect(u(x)+off,u(y),1,1)},
  line(c,x1,y1,x2,y2,col,sag=0){c.fillStyle=col;const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)*S*1.2));for(let i=0;i<=n;i++){const t=i/n;c.fillRect(u(lerp(x1,x2,t))+off,u(lerp(y1,y2,t)+Math.sin(t*Math.PI)*sag),1,1)}},
  flame(c,t,x0,yb,n,cols,amp=1){for(let i=0;i<n;i++){const hh=(3+5*(.5+.5*Math.sin(t*9+i*1.7))*(.6+.4*Math.sin(t*5.3+i)))*amp;const x=x0+i*2;h.box(c,x,yb-hh,2,hh,cols[0]);h.box(c,x,yb-hh*.7,2,hh*.7,cols[1]);h.box(c,x+.5,yb-hh*.4,1,hh*.4,cols[2])}}};return h}
function ditherRect(c,h,x,y,w,hh,col,f){const X0=h.u(x)+h.off,Y0=h.u(y),X1=h.u(x+w)+h.off,Y1=h.u(y+hh);c.fillStyle=col;for(let yy=Y0;yy<Y1;yy++)for(let xx=X0;xx<X1;xx++){const ff=typeof f==='function'?f((yy-Y0)/(Y1-Y0||1)):f;if(ff>bayer4(xx,yy))c.fillRect(xx,yy,1,1)}}
function moon(k,h,x,y,r,col,sh){h.ell(k,x,y,r,r,col);if(sh){const R=h.u(r),cx=h.u(x)+h.off,cy=h.u(y);k.fillStyle=sh;for(let yy=cy-R;yy<=cy+R;yy++)for(let xx=cx-R;xx<=cx+R;xx++){const dx=(xx+.5-cx)/R,dy=(yy+.5-cy)/R;if(dx*dx+dy*dy>1)continue;if((dx-.2)*1.6>bayer4(xx,yy))k.fillRect(xx,yy,1,1)}}}
function ringPlanet(k,h,x,y,r,col,band,ring){const draw=back=>{k.fillStyle=ring;for(let a=0;a<Math.PI*2;a+=.01){const s=Math.sin(a);if(back!==(s<0))continue;for(const rr of[2.2,2.5])k.fillRect(h.u(x+Math.cos(a)*r*rr)+h.off,h.u(y+s*r*.32*rr/2.2),1,1)}};draw(true);h.ell(k,x,y,r,r,col);for(let i=-2;i<=2;i++)h.box(k,x-r*Math.sqrt(1-Math.pow(i*.32,2))*.95,y+i*r*.32,r*2*Math.sqrt(1-Math.pow(i*.32,2))*.95,r*.1,band);moon(k,h,x,y,r,'rgba(0,0,0,0)','rgba(20,10,40,.35)');draw(false)}
function skyline(c,h,o){seed=o.seed;let x=o.x0;while(x<o.x1){const w=o.minW+rnd()*(o.maxW-o.minW),ht=o.minH+rnd()*(o.maxH-o.minH);h.box(c,x,o.base-ht,w,ht,o.col);if(o.spire&&rnd()<.3)h.box(c,x+w/2-.5,o.base-ht-7,1,7,o.col);
  if(o.cone&&rnd()<.6)h.poly(c,[[x-1,o.base-ht],[x+w+1,o.base-ht],[x+w/2,o.base-ht-w*1.2]],o.col);
  if(o.win){const X0=h.u(x)+h.off,X1=h.u(x+w)+h.off,Y0=h.u(o.base-ht)+2,Y1=h.u(o.base);for(let yy=Y0;yy<Y1;yy+=3)for(let xx=X0+1;xx<X1-1;xx+=2)if(rnd()<o.winP){c.fillStyle=o.win[rnd()*o.win.length|0];c.fillRect(xx,yy,1,1)}}
  if(o.strip&&rnd()<.4){h.box(c,x,o.base-ht+2+rnd()*(ht-4),w,.7,o.strip[rnd()*o.strip.length|0])}
  x+=w+(rnd()<.3?rnd()*3:0)}}
function groundSpeckle(n,h,col,hi,lo,dens){h.box(n,-16,122,360,80,col);seed=3;const W=n.canvas.width,lh=n.canvas.height,y0=h.u(124);for(let i=0;i<W*(lh-y0)*dens;i++){n.fillStyle=rnd()<.5?hi:lo;n.fillRect(rnd()*W|0,y0+(rnd()*(lh-y0)|0),1,1)}}
function cobble(n,h,base,cols){h.box(n,-16,122,360,80,base);seed=4;let r=0;for(let y=123.5;y<182;y+=3.1,r++){const off=r%2?0:2.6;for(let x=-16+off;x<345;x+=5.2)h.ell(n,x+rnd()*.6,y+rnd()*.3,2.2,1.1,cols[rnd()*cols.length|0])}}
function parkLines(n,h,col){for(const lx of[172,216,260,304])h.poly(n,[[lx,128],[lx+2,128],[lx+10,180],[lx+8,180]],col)}
function curb(n,h,c1,c2){h.box(n,-16,122,360,3,c1);h.box(n,-16,122,360,1,c2)}
function dunes(md,h,col,cactus){const W=md.canvas.width,lh=md.canvas.height;md.fillStyle=col;for(let x=0;x<W;x++){const ux=(x-h.off)/h.S;const y=Math.round((111+3*Math.sin(ux*.045+1)+1.6*Math.sin(ux*.13))*h.S);md.fillRect(x,y,1,lh-y)}
  if(cactus)for(const cx of[196,288,-4]){h.box(md,cx,99,3,13,col);h.box(md,cx-3,103,3,2,col);h.box(md,cx-3,100,1.5,4,col);h.box(md,cx+3,105,3,2,col);h.box(md,cx+4.5,102,1.5,4,col)}}
function mesas(f,h,col,rim){for(const pts of[[[-20,114],[-20,84],[10,80],[40,82],[48,96],[60,114]],[[150,114],[165,90],[175,86],[215,86],[222,92],[240,114]],[[268,114],[278,70],[292,68],[298,74],[306,114]],[[306,114],[318,100],[345,100],[352,114]]]){if(rim)h.poly(f,pts.map(([x,y])=>[x,y-.7]),rim);h.poly(f,pts,col)}}
function overpass(md,h){h.box(md,-16,96,360,1,'#2a3050');h.box(md,-16,98,360,5,'#1b2036');h.box(md,-16,103,360,1,'#11152a');for(let x=-10;x<345;x+=44)h.box(md,x,104,6,18,'#171b30')}
function cars(c,h,t){for(let i=0;i<5;i++){const x=((t*60+i*79)%390)-30;h.box(c,x,99.6,1.4,.9,'#fff6d8');h.box(c,x-6,99.6,1,.9,'#ff5a4a');const x2=350-((t*45+i*91)%390);h.box(c,x2,100.8,1,.8,'#ff4a3a')}}
function fireflies(s,cols){if(Math.random()<.06)s.emit({x:R(100,320),y:R(110,160),vx:R(-4,4),vy:R(-3,3),life:R(3,5),col:cols[Math.random()*cols.length|0],glow:true,fade:true,wob:R(0,6)})}


// ---------------------------------------------------------------- extra glyphs, mirroring, sprite cache
Object.assign(F,{':':"000010000010000",',':"000000000010100",'/':"001001010100100",'%':"101001010100101",'(':"010100100100010",')':"010001001001010",'#':"101111101111101",'*':"000101010101000",'$':"011110010011110",'=':"000111000111000",'>':"100010001010100",'<':"001010100010001",'"':"101101000000000",'x':"000101010101000"});
function mirrorShapes(S){return S.map(s=>{const n={...s};if(s.t==='e')n.cx=-s.cx;else if(s.t==='c'){n.x1=-s.x1;n.x2=-s.x2}else if(s.t==='r')n.x=-(s.x+s.w);else n.pts=s.pts.map(([x,y])=>[-x,y]);return n})}
class SpriteCache{constructor(max=40){this.m=new Map();this.max=max}
  get(k,make){let v=this.m.get(k);if(v){this.m.delete(k);this.m.set(k,v);return v}v=make();this.m.set(k,v);if(this.m.size>this.max)this.m.delete(this.m.keys().next().value);return v}}
const pick=a=>a[Math.random()*a.length|0];
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function weighted(list,wf){let t=0;for(const x of list)t+=wf(x);let r=Math.random()*t;for(const x of list){r-=wf(x);if(r<=0)return x}return list[list.length-1]}
const uid=()=>Math.random().toString(36).slice(2,10);
