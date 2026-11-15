// QC World V2 – PHA 7: ĐỈNH NÚI TỐI THƯỢNG "QA/QC BRAIN CITADEL" & ĐƯỜNG ĐÈO NGẮM BIỂN (Bible Phần 4 + Module 3)
//  Vùng x 620→1150, z −100→450. Tâm đỉnh (880, 180), sân đỉnh phẳng r = 60 m ở y = +110. Vách đá dựng đứng phía Đông và Nam lao xuống biển.
//  • Đường đèo "Oceanfront Corniche" rộng 10 m: cầu nối từ CBD (580, 86) → 1,25 vòng quanh núi (y 4 → 100): đoạn cầu cạn vươn ra biển trên trụ tròn,
//    đoạn phố săn mây (12 quán kiến trúc khác nhau) + 3 vòm đá, cuối cùng Cầu Kính Cổng Trời bắc qua khe vực vào quảng trường đỉnh.
//  • Tháp Liên Hoa Thần Kinh: r = 28, giếng trời r = 10, 6 tầng (110 → 150, mỗi tầng 8 m), 8 cánh sen kính viền vàng, cầu thang xoắn đôi ADN,
//    2 thang máy kính, 3 vòng gyroscope vàng quay quanh khối não pha lê, chữ QA · QC · QE, 8 cột sáng đêm. Nội dung 6 tầng theo đặc tả.
//  • Sân bay Đỉnh Mây (phía Bắc) · Xích đu tử thần vượt vực + Khinh khí cầu (phía Nam).
import * as AK from './archKit.js';
export function make(W, ctx){
  const {THREE, scene, P, HOOK, INTER, PLACES, toast, circles, addPlat, addSeg, mergeGeometries, GLOW, teleport, makeLabel, me, EXTL, plats, cam} = W;
  const {S, save, ui, askPay, fmt, spend} = ctx; AK.bindNight(W);
  const C={x:880, z:180}, YT=110, RPAD=60, SEA=-6, TAU=Math.PI*2, R=AK.rng(110168);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t, ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  const at=(a,r,y=0)=>new THREE.Vector3(C.x+Math.cos(a)*r, y, C.z+Math.sin(a)*r), yawOut=a=>Math.atan2(Math.cos(a),Math.sin(a));
  const grp=new THREE.Group(); grp.name='brainCitadel'; scene.add(grp);
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function Kit(){ const parts=new Map(); return { add(geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); if(!g.attributes.uv) g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z),_q,_s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
    build(parent=grp){ for(const [m,l] of parts){ const geo=l.length===1?l[0]:mergeGeometries(l,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=!m.transparent; ms.receiveShadow=true; parent.add(ms); } } }; }
  const sm=(c,r=.6,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const M={ rock:AK.makeStoneMaterial({col:'#8d8577', joint:'#5f584d', blockW:80, blockH:40, repeat:2}), pave:AK.makeStoneMaterial({col:'#e4ddd0', joint:'#b9b0a1', blockW:128, blockH:64, repeat:10}),
    wood:AK.makeWoodMaterial({col:'#7a4a28', repeat:2}), dark:sm(0x1e232b,.4,.4), steel:sm(0xc9d0d8,.25,.9), gold:sm(0xffcf6a,.25,1,{emissive:0xffa820, emissiveIntensity:.25}),
    glass:new THREE.MeshPhysicalMaterial({color:0x8fe3d8, roughness:.05, metalness:.1, transparent:true, opacity:.35, depthWrite:false, side:THREE.DoubleSide, envMapIntensity:1.8}),
    glassB:new THREE.MeshPhysicalMaterial({color:0xbfe6f5, roughness:.04, metalness:.2, transparent:true, opacity:.28, depthWrite:false, side:THREE.DoubleSide}),
    white:sm(0xf4f1ea,.5), red:sm(0xb3322a,.5), concrete:sm(0xbdb8ae,.85), led:new THREE.MeshStandardMaterial({color:0x66e0ff, emissive:0x46c8ff, emissiveIntensity:1.4}) };

  /* ============================== 1. ĐỊA HÌNH NÚI SÁT BIỂN ============================== */
  const cliffW=a=>Math.max(Math.max(0,Math.cos(a))**2, Math.max(0,Math.sin(a))**2), rbOf=a=>lerp(250,118,cliffW(a));
  const hash=(x,z)=>{ let h=Math.imul(x|0,374761393)^Math.imul(z|0,668265263); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967295; };
  const vn=(x,z)=>{ const xi=Math.floor(x), zi=Math.floor(z), xf=x-xi, zf=z-zi, u=xf*xf*(3-2*xf), v=zf*zf*(3-2*zf), a=hash(xi,zi), b=hash(xi+1,zi), c=hash(xi,zi+1), d=hash(xi+1,zi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  function prof(d,a){ if(d<=RPAD) return YT; const rb=rbOf(a), t=(d-RPAD)/(rb-RPAD), w=cliffW(a); if(t>=1) return lerp(0, SEA, ss(1,1.1,t)); const p=lerp(1.8,6,w); return YT*(1-Math.pow(t,p)); }
  const rInv=(y,a)=>{ let lo=RPAD, hi=rbOf(a); for(let i=0;i<34;i++){ const m=(lo+hi)/2; if(prof(m,a)>y) lo=m; else hi=m; } return (lo+hi)/2; };
  const TH0=Math.PI+.30, TURN=-2.5*Math.PI, YEND=100, ROADW=10, ROAD=[];
  const pushPts=(pts,kind)=>{ for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1], L=Math.hypot(b.x-a.x,b.z-a.z); for(let t=0;t<L;t+=1){ const k=t/L; ROAD.push({x:a.x+(b.x-a.x)*k, z:a.z+(b.z-a.z)*k, h:a.h+(b.h-a.h)*k, kind}); } } };
  const spiral=[]; { const N=900; for(let i=0;i<=N;i++){ const u=i/N, y=4+(YEND-4)*u, a=TH0+TURN*u, w=cliffW(a); let r=rInv(y,a); if(y<38) r+=18*ss(.35,.7,w)*(1-ss(30,38,y)); spiral.push({x:C.x+Math.cos(a)*r, z:C.z+Math.sin(a)*r, h:y, a}); } }
  const S0=spiral[0], approach=[{x:570,z:86,h:2},{x:580,z:86,h:2},{x:600,z:90,h:2.5},{x:lerp(600,S0.x,.5),z:lerp(90,S0.z,.5),h:3.2},{x:S0.x,z:S0.z,h:4}];
  pushPts(approach,'approach'); pushPts(spiral,'corniche');
  const SE=spiral[spiral.length-1], aE=Math.atan2(SE.z-C.z, SE.x-C.x), bridgeEnd={x:C.x+Math.cos(aE)*(RPAD-1), z:C.z+Math.sin(aE)*(RPAD-1), h:YT};
  const GB={a:{x:SE.x,z:SE.z,h:YEND}, b:bridgeEnd}; pushPts([GB.a,GB.b],'glass');
  ROAD.forEach((q,i)=>{ const a=ROAD[Math.max(0,i-2)], b=ROAD[Math.min(ROAD.length-1,i+2)], l=Math.hypot(b.x-a.x,b.z-a.z)||1; q.ux=(b.x-a.x)/l; q.uz=(b.z-a.z)/l; q.i=i; });
  const GRID=new Map(), gk=(x,z)=>(Math.floor(x/8))+','+(Math.floor(z/8)); ROAD.forEach((q,i)=>{ const k=gk(q.x,q.z); if(!GRID.has(k)) GRID.set(k,[]); GRID.get(k).push(i); });
  function nearRoad(x,z,maxD=24){ let bd=maxD*maxD, best=null; const cx=Math.floor(x/8), cz=Math.floor(z/8), rr=Math.ceil(maxD/8); for(let a=-rr;a<=rr;a++) for(let b=-rr;b<=rr;b++){ const l=GRID.get((cx+a)+','+(cz+b)); if(!l) continue; for(const i of l){ const q=ROAD[i], d=(q.x-x)**2+(q.z-z)**2; if(d<bd){ bd=d; best=q; } } } return best?{q:best, d:Math.sqrt(bd)}:null; }
  const natural=(x,z)=>{ const d=Math.hypot(x-C.x,z-C.z), a=Math.atan2(z-C.z,x-C.x); let h=prof(d,a); if(d>RPAD+4 && h>2) h+=(vn(x*.035,z*.035)-.5)*7*ss(RPAD+4,RPAD+30,d)*Math.min(1,h/20); return h; };
  const onDeck=q=>q.kind==='glass' || natural(q.x,q.z)<q.h-1.5;
  function hf(x,z){ let h=natural(x,z); const n=nearRoad(x,z); if(n){ const q=n.q, half=ROADW/2+.6;
      if(q.kind==='glass'){ const t=((x-GB.a.x)*(GB.b.x-GB.a.x)+(z-GB.a.z)*(GB.b.z-GB.a.z))/((GB.b.x-GB.a.x)**2+(GB.b.z-GB.a.z)**2); if(t>.08 && t<.9 && n.d<16) h=Math.min(h, q.h-42+n.d*1.2); }
      else if(!onDeck(q)){ if(n.d<half) h=q.h; else if(n.d<half+12) h=lerp(q.h, h, ss(half, half+12, n.d)); } }
    if(Math.hypot(x-C.x,z-C.z)<RPAD+.5) h=YT; return h; }
  const X0=620, X1=1150, Z0=-100, Z1=450, RES=2, NX=Math.round((X1-X0)/RES)+1, NZ=Math.round((Z1-Z0)/RES)+1, H=new Float32Array(NX*NZ);
  for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++) H[j*NX+i]=hf(X0+i*RES, Z0+j*RES);
  const hAt=(x,z)=>{ const fx=(x-X0)/RES, fz=(z-Z0)/RES; if(fx<0||fz<0||fx>=NX-1||fz>=NZ-1) return null; const i=Math.floor(fx), j=Math.floor(fz), tx=fx-i, tz=fz-j, a=H[j*NX+i], b=H[j*NX+i+1], c=H[(j+1)*NX+i], d=H[(j+1)*NX+i+1];
    const h=tx+tz<=1 ? a+(b-a)*tx+(c-a)*tz : d+(c-d)*(1-tx)+(b-d)*(1-tz); return h<-.6 ? null : h; };
  EXTL.push({x0:X0, x1:X1-RES, z0:Z0, z1:Z1-RES, h:hAt, name:'ĐỈNH QA/QC BRAIN CITADEL'});
  { const pos=new Float32Array(NX*NZ*3), col=new Float32Array(NX*NZ*3), uv=new Float32Array(NX*NZ*2), c=new THREE.Color(), GR=new THREE.Color(0x5e9a3c), GR2=new THREE.Color(0x86b04c), RK=new THREE.Color(0x7d766b), RK2=new THREE.Color(0x5a5249), SD=new THREE.Color(0xdcc89d), PV=new THREE.Color(0xd8d1c3);
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const k=j*NX+i, x=X0+i*RES, z=Z0+j*RES, h=H[k]; pos[k*3]=x; pos[k*3+1]=h; pos[k*3+2]=z; uv[k*2]=x/6; uv[k*2+1]=z/6;
      const hx=(H[j*NX+Math.min(i+1,NX-1)]-H[j*NX+Math.max(i-1,0)])/(2*RES), hz=(H[Math.min(j+1,NZ-1)*NX+i]-H[Math.max(j-1,0)*NX+i])/(2*RES), sl=Math.hypot(hx,hz), n=vn(x*.08,z*.08);
      c.copy(GR).lerp(GR2,n); c.lerp(RK, ss(.5,1.0,sl)); c.lerp(RK2, ss(1.4,2.6,sl)*.8); if(h<1.4) c.lerp(SD, ss(1.4,.3,h)); if(Math.hypot(x-C.x,z-C.z)<RPAD+.5) c.copy(PV); col[k*3]=c.r; col[k*3+1]=c.g; col[k*3+2]=c.b; }
    const idx=new Uint32Array((NX-1)*(NZ-1)*6); let q=0; for(let j=0;j<NZ-1;j++) for(let i=0;i<NX-1;i++){ const a=j*NX+i, b=a+1, cc=a+NX, d=cc+1; idx[q++]=a; idx[q++]=cc; idx[q++]=b; idx[q++]=b; idx[q++]=cc; idx[q++]=d; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); g.setIndex(new THREE.BufferAttribute(idx,1)); g.computeVertexNormals();
    const det=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=256; const x=cv.getContext('2d'); x.fillStyle='#c4c4c4'; x.fillRect(0,0,256,256); for(let i=0;i<9000;i++){ const v=150+Math.random()*105|0; x.fillStyle=`rgba(${v},${v},${v},.5)`; x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1+Math.random()*2); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({map:t, vertexColors:true, roughness:.95}); })();
    const t=new THREE.Mesh(g, det); t.receiveShadow=true; t.userData.dynamic=true; t.userData.noFar=true; t.name='brainTerrain'; grp.add(t); }

  /* ============================== 2. MẶT ĐƯỜNG ĐÈO + CẦU CẠN + CẦU KÍNH ============================== */
  const asphalt=(()=>{ const c=document.createElement('canvas'); c.width=128; c.height=256; const g=c.getContext('2d'); g.fillStyle='#35373b'; g.fillRect(0,0,128,256); for(let i=0;i<3000;i++){ const v=30+Math.random()*40|0; g.fillStyle=`rgba(${v},${v},${v+4},.6)`; g.fillRect(Math.random()*128,Math.random()*256,1.5,1.5); }
    g.fillStyle='#f2f1ea'; g.fillRect(5,0,5,256); g.fillRect(118,0,5,256); g.fillStyle='#f0c12a'; for(let y=0;y<256;y+=96) g.fillRect(61,y,6,52); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; })();
  const roadMat=new THREE.MeshStandardMaterial({map:asphalt, roughness:.9, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2});
  { const pts=ROAD.filter(q=>q.kind!=='glass'), pos=[], uv=[], idx=[]; let s=0;
    for(let i=0;i<pts.length;i++){ const q=pts[i]; if(i) s+=Math.hypot(q.x-pts[i-1].x,q.z-pts[i-1].z); const nx=-q.uz, nz=q.ux; for(const side of [-1,1]){ const x=q.x+nx*ROADW/2*side, z=q.z+nz*ROADW/2*side, y=onDeck(q)?q.h+.05:Math.max(q.h,(hAt(x,z)??q.h))+.05; pos.push(x,y,z); uv.push(side<0?0:1, s/14); }
      if(i){ const k=i*2; idx.push(k-2,k-1,k, k-1,k+1,k); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); const m=new THREE.Mesh(g, roadMat); m.receiveShadow=true; m.userData.dynamic=true; m.userData.noFar=true; grp.add(m); }
  const k1=Kit(), lampPts=[], railMask=new Set();
  for(let i=0;i<ROAD.length-1;i+=2){ const q=ROAD[i], nx=-q.uz, nz=q.ux, deck=onDeck(q), yaw=Math.atan2(q.ux,q.uz);
    if(q.kind!=='glass') addPlat(q.x, q.z, yaw, ROADW/2+.2, 1.08, q.h);   /* mặt đứng bám đúng mặt đường suốt tuyến (không hụt ở chỗ nối đường cắt núi ↔ cầu cạn) */
    if(deck && q.kind!=='glass'){ k1.add(new THREE.BoxGeometry(ROADW+.8,.7,2.05), M.concrete, q.x, q.h-.38, q.z, 0, yaw, 0);
      if(i%14===0){ const g0=(hAt(q.x,q.z)??SEA); const hh=q.h-.7-Math.min(g0,SEA+1)+2; k1.add(new THREE.CylinderGeometry(.9,1.1,hh,14), M.concrete, q.x, q.h-.7-hh/2, q.z); circles.push({x:q.x, z:q.z, r:1.1, y0:-20, y1:q.h-1}); } }
    for(const side of [-1,1]){ const ox=nx*(ROADW/2+.15)*side, oz=nz*(ROADW/2+.15)*side; const outer=((q.x+ox-C.x)**2+(q.z+oz-C.z)**2)>((q.x-C.x)**2+(q.z-C.z)**2);
      const gx=q.x+nx*(ROADW/2+1.6)*side, gz=q.z+nz*(ROADW/2+1.6)*side, gEdge=hAt(gx,gz); const drop=gEdge==null || gEdge<q.h-1.0;   /* cạnh nào có hụt (vực, khe giữa vách và cầu cạn) thì có lan can */
      if(q.kind==='glass' || deck || outer || drop) railMask.add(i+':'+side); }
    if(i%26===0 && q.kind!=='glass'){ const side=(i/26)%2?1:-1; lampPts.push([q.x+nx*(ROADW/2+.7)*side, q.h, q.z+nz*(ROADW/2+.7)*side]); } }
  { const A=GB.a, B=GB.b, L=Math.hypot(B.x-A.x,B.z-A.z), yaw=Math.atan2(B.x-A.x,B.z-A.z), n=Math.ceil(L/2);
    for(let i=0;i<n;i++){ const t=(i+.5)/n, x=lerp(A.x,B.x,t), z=lerp(A.z,B.z,t), y=lerp(A.h,B.h,t); addPlat(x,z,yaw,ROADW/2,L/n/2+.03,y); }
    const mid={x:(A.x+B.x)/2, z:(A.z+B.z)/2, y:(A.h+B.h)/2}, tilt=Math.atan2(B.h-A.h,L);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(ROADW,.12,L), new THREE.MeshPhysicalMaterial({color:0xcfefff, roughness:.03, transparent:true, opacity:.42, depthWrite:false})); deck.position.set(mid.x,mid.y-.04,mid.z); deck.rotation.set(-tilt,yaw,0,'YXZ'); grp.add(deck);
    for(const s of [-1,1]){ const ox=Math.cos(yaw)*(ROADW/2+.2)*s, oz=-Math.sin(yaw)*(ROADW/2+.2)*s; k1.add(new THREE.BoxGeometry(.5,.6,L), M.steel, mid.x+ox, mid.y-.35, mid.z+oz, -tilt, yaw, 0);
      for(const e of [A,B]){ k1.add(new THREE.BoxGeometry(.9,26,.9), M.gold, e.x+ox, e.h+13, e.z+oz); circles.push({x:e.x+ox, z:e.z+oz, r:.6}); }
      for(let k=1;k<8;k++){ const t=k/8, x=lerp(A.x,B.x,t)+ox, z=lerp(A.z,B.z,t)+oz, y=lerp(A.h,B.h,t), e=t<.5?A:B, top=new THREE.Vector3(e.x+ox, e.h+25, e.z+oz), bot=new THREE.Vector3(x,y,z), d=top.clone().sub(bot);
        const cab=new THREE.CylinderGeometry(.05,.05,d.length(),5); cab.translate(0,d.length()/2,0); cab.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), d.clone().normalize())); cab.translate(x,y,z); k1.add(cab, M.steel); } }
    k1.add(new THREE.BoxGeometry(ROADW+1.6,1.2,1.2), M.gold, A.x, A.h+24, A.z, 0, yaw, 0); k1.add(new THREE.BoxGeometry(ROADW+1.6,1.2,1.2), M.gold, B.x, B.h+24, B.z, 0, yaw, 0);
    makeLabel('🌉 Cầu Kính Cổng Trời', 'Cầu đáy kính dài '+L.toFixed(0)+' m bắc qua khe vực vào Đỉnh Mây', {h:.6, x:mid.x, y:mid.y+6, z:mid.z, fade:90}); }
  /* ---- Cầu cổng G6 (16/11): Dev City Đông Nam (700, −100, +4) → nhập đường dẫn Brain ở mép Bắc. Trước đây phía Brain không có gì đón → cầu Dev City cụt giữa biển ---- */
  const G6={}; { let J=ROAD[0], bd=1e9; for(const q of ROAD){ if(q.kind!=='approach') continue; const d=Math.hypot(q.x-628,q.z-97); if(d<bd){ bd=d; J=q; } }
    const P0=[700,-100.5], P1=[700,-30], P2=[640,20], P3=[J.x,J.z], bz=(t,k)=>{ const u=1-t; return u*u*u*P0[k]+3*u*u*t*P1[k]+3*u*t*t*P2[k]+t*t*t*P3[k]; };
    const raw=[]; let acc=0, px=P0[0], pz=P0[1]; for(let i=0;i<=600;i++){ const t=i/600, x=bz(t,0), z=bz(t,1); acc+=Math.hypot(x-px,z-pz); px=x; pz=z; raw.push([x,z,acc]); }
    const L=acc, pts=[]; let ri=0; for(let d=0; d<=L; d+=1){ while(ri<raw.length-1 && raw[ri][2]<d) ri++; const t=d/L, h=lerp(4.13,J.h,ss(0,1,t))+2.2*Math.sin(Math.PI*t)*(1-ss(.85,1,t)); pts.push({x:raw[ri][0], z:raw[ri][1], h}); }
    pts.forEach((q,i)=>{ const a=pts[Math.max(0,i-2)], b=pts[Math.min(pts.length-1,i+2)], l=Math.hypot(b.x-a.x,b.z-a.z)||1; q.ux=(b.x-a.x)/l; q.uz=(b.z-a.z)/l; });
    const BW=9, rails=AK.glassRails(), last=pts.length-1;
    pts.forEach((q,i)=>{ const yaw=Math.atan2(q.ux,q.uz); addPlat(q.x,q.z,yaw,BW/2+.2,.62,q.h); if(i%2) return; k1.add(new THREE.BoxGeometry(BW+.6,.6,2.06), M.concrete, q.x, q.h-.33, q.z, 0, yaw, 0);
      if(i%16===8 && i<last-8){ const hh=q.h-.6-SEA+2; k1.add(new THREE.CylinderGeometry(.8,1,hh,14), M.concrete, q.x, q.h-.6-hh/2, q.z); circles.push({x:q.x, z:q.z, r:1, y0:-20, y1:q.h-1}); }
      if(i<last-6 && i<pts.length-2) for(const side of [-1,1]){ const q2=pts[i+2], o=(BW/2+.15)*side, ax=q.x-q.uz*o, az=q.z+q.ux*o, bx=q2.x-q2.uz*o, bz2=q2.z+q2.ux*o; addSeg(ax,az,bx,bz2,.15,q.h-.6,q.h+1.6,'🌉 Lan can cầu G6 · Brain ↔ Dev City'); rails.add((ax+bx)/2, q.h, (az+bz2)/2, Math.atan2(bx-ax,bz2-az)+Math.PI/2); }
      if(i%30===15){ const side=(i/30|0)%2?1:-1; lampPts.push([q.x-q.uz*(BW/2+.7)*side, q.h, q.z+q.ux*(BW/2+.7)*side]); } });
    rails.build(grp);
    /* mở lan can đường dẫn đúng miệng cầu */ const E=pts[last-4]; for(let i=0;i<ROAD.length-3;i+=2) for(const side of [-1,1]){ const q=ROAD[i], o=(ROADW/2+.15)*side; if(Math.hypot(q.x-q.uz*o-E.x, q.z+q.ux*o-E.z)<BW/2+3.5) railMask.delete(i+':'+side); }
    { const m=pts[Math.round(last*.4)]; makeLabel('🌉 Cầu G6 · Brain ↔ Dev City', 'Đi bộ / lái xe sang Dev City Trùng Khánh', {h:.5, x:m.x, y:m.h+5, z:m.z, fade:110}); }
    Object.assign(G6,{pts,L,J}); }
  { const rails=AK.glassRails(); for(let i=0;i<ROAD.length-3;i+=2) for(const side of [-1,1]){ if(!railMask.has(i+':'+side)) continue; const q=ROAD[i], q2=ROAD[i+2], nx=-q.uz, nz=q.ux, o=(ROADW/2+.15)*side;
      const ax=q.x+nx*o, az=q.z+nz*o, bx=q2.x+(-q2.uz)*o, bz=q2.z+q2.ux*o; addSeg(ax,az,bx,bz,.15, q.h-.6, q.h+1.6); rails.add((ax+bx)/2, q.h, (az+bz)/2, Math.atan2(bx-ax,bz-az)+Math.PI/2); }
    rails.build(grp); }
  { const pole=new THREE.CylinderGeometry(.08,.11,5,8); pole.translate(0,2.5,0); const head=new THREE.SphereGeometry(.3,10,8); head.translate(0,5.1,0);
    const pm=new THREE.InstancedMesh(pole, M.dark, lampPts.length), hm=new THREE.InstancedMesh(head, new THREE.MeshStandardMaterial({color:0xfff2d6, emissive:0xffd9a0, emissiveIntensity:.2}), lampPts.length);
    lampPts.forEach(([x,y,z],i)=>{ _m.makeTranslation(x,y,z); pm.setMatrixAt(i,_m); hm.setMatrixAt(i,_m); circles.push({x,z,r:.15,y0:y-1,y1:y+5}); if(i%3===0 && GLOW) GLOW.add(x,y+5.1,z,2.6,0xffd9a0,1); });
    for(const im of [pm,hm]){ im.userData.dynamic=true; im.computeBoundingSphere(); grp.add(im); } HOOK.onFrame.push(()=>{ hm.material.emissiveIntensity=.15+(W.night||0)*2.2; }); }
  { const arches=ROAD.filter(q=>q.kind==='corniche' && q.h>40 && q.h<74); for(const f of [.15,.5,.85]){ const q=arches[Math.floor(arches.length*f)]; if(!q) continue; const yaw=Math.atan2(q.ux,q.uz);
      const g=new THREE.TorusGeometry(ROADW/2+2.4, 1.9, 10, 24, Math.PI); k1.add(g, M.rock, q.x, q.h, q.z, 0, yaw+Math.PI/2, 0);
      for(const s of [-1,1]){ const x=q.x+(-q.uz)*(ROADW/2+2.4)*s, z=q.z+q.ux*(ROADW/2+2.4)*s; circles.push({x, z, r:2.0}); } } }
  k1.build();

  /* ============================== 3. 12 HÀNG QUÁN SĂN MÂY ============================== */
  const buff=(id,min)=>{ S.buffs=S.buffs||{}; S.buffs[id]=Math.max(Date.now(), S.buffs[id]||0)+min*60000; save(); };
  const menu=(title, items)=>{ const m=ui.modal(title); m.body.innerHTML=`<div class="grid">${items.map(([n,p,d],i)=>`<div class="card"><b>${n}</b><small>${d}</small><div class="row" style="margin-top:auto"><span class="price">${fmt(p)} 💰</span><div class="sp"></div><button class="btn pri" data-i="${i}">Gọi</button></div></div>`).join('')}</div>`;
    m.body.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{ const [n,p]=items[+b.dataset.i]; m.close(); askPay(p, n, ()=>{ if(!spend(p)) return; buff('energy',8); toast(`${n} – ngon tuyệt, ngắm biển mây quá đã! ⚡ chạy nhanh 8 phút`, 3000); }); }); };
  const CAFE=[
    ['🍵','Lầu Trà Đạo Lưu Ly',[['🍵 Trà ô long núi',30,'Trà sương mù'],['🍡 Bánh mochi',25,'Mềm dẻo']]],
    ['🏮','Bistro Hang Đá Ngàn Đèn',[['🥩 Bò bít tết',120,'Lửa than'],['🍷 Nước nho đỏ',40,'Không cồn']]],
    ['🔮','Café 3 Vòm Kính',[['☕ Cappuccino',35,'Bọt sữa mịn'],['🥐 Croissant',25,'Bơ Pháp']]],
    ['🚢','Hải Sản Thuyền Gỗ',[['🦞 Tôm hùm nướng',220,'Tươi sống'],['🦀 Cua rang me',150,'Chua ngọt']]],
    ['🎱','CLB Bida & Bia Thủ Công',[['🍺 Bia thủ công không cồn',35,'Mạch nha'],['🍟 Khoai chiên',30,'Giòn']]],
    ['🗼','Café Hải Đăng',[['🧋 Trà sữa biển muối',30,'Mặn ngọt'],['🍪 Bánh quy',20,'Giòn tan']]],
    ['🧊','Khối Kính Ngắm Mây',[['🍹 Soda chanh dây',30,'Mát lạnh'],['🍰 Bánh phô mai',40,'Béo mịn']]],
    ['🛖','Nhà Gỗ Chữ A',[['🍲 Lẩu nấm rừng',90,'Nóng hổi'],['🌽 Bắp nướng',20,'Thơm']]],
    ['🌸','Vườn Giàn Hoa',[['🌺 Trà hoa',25,'Thanh mát'],['🍓 Sinh tố dâu',30,'Ngọt']]],
    ['🔭','Café Đài Thiên Văn',[['☕ Espresso',30,'Đậm'],['🍫 Socola nóng',30,'Ấm']]],
    ['📦','Container Màu Sắc',[['🌮 Taco',45,'Giòn cay'],['🥤 Nước ép',25,'Tươi']]],
    ['🎈','Café Xích Đu Mây',[['🍦 Kem mây',25,'Mát'],['🧇 Bánh waffle',35,'Thơm bơ']]] ];
  const midRoad=ROAD.filter(q=>q.kind==='corniche' && q.h>40 && q.h<74), cafes=[];
  for(let k=0;k<12;k++){ const q=midRoad[Math.floor((k+.5)/12*midRoad.length)]; if(!q) continue; let nx=-q.uz, nz=q.ux; if((q.x-C.x)*nx+(q.z-C.z)*nz<0){ nx=-nx; nz=-nz; }
    const e=ROADW/2+.3, D=8, Wd=12, cx=q.x+nx*(e+D/2), cz=q.z+nz*(e+D/2), yaw=Math.atan2(nx,nz), y=q.h, kk=Kit(), A=(a,b)=>[q.x+q.ux*a+nx*b, q.z+q.uz*a+nz*b];
    kk.add(AK.roundedBox(Wd,.4,D,.12,2), M.wood, cx, y-.2, cz, 0, yaw, 0); addPlat(cx, cz, yaw, Wd/2, D/2, y);
    const g0=Math.min(hAt(cx,cz)??SEA, y); if(y-g0>1){ for(const [a,b] of [[-Wd/2+.6,e+D-.6],[Wd/2-.6,e+D-.6]]){ const [px,pz]=A(a,b), hh=y-.4-g0+2; kk.add(new THREE.CylinderGeometry(.35,.45,hh,10), M.concrete, px, y-.4-hh/2, pz); } }
    { const c0=A(-Wd/2,e+.3), c1=A(-Wd/2,e+D), c2=A(Wd/2,e+D), c3=A(Wd/2,e+.3); for(const [a,b] of [[c0,c1],[c1,c2],[c2,c3]]) addSeg(a[0],a[1],b[0],b[1],.15,y-.5,y+1.6); }
    // mở lan can đường ở miệng quán
    const top=y, P0=A(0,e+D/2);
    switch(k){
      case 0: { for(const [a,b] of [[-4,e+1.5],[4,e+1.5],[-4,e+D-1.5],[4,e+D-1.5]]){ const [px,pz]=A(a,b); kk.add(new THREE.CylinderGeometry(.2,.24,3.4,12), M.red, px, top+1.7, pz); circles.push({x:px,z:pz,r:.25,y0:y-.5,y1:y+3.5}); } const r=AK.buildAsianCurvedRoof(9,6,2.2,1.4,0x2f6b5a,3); r.position.set(P0[0],top+3.4,P0[1]); r.rotation.y=yaw; grp.add(r); break; }
      case 1: { const sh=new THREE.SphereGeometry(6,20,12,0,Math.PI,0,Math.PI/2); kk.add(sh, M.rock, P0[0], top, P0[1], 0, yaw+Math.PI/2, 0); const ln=AK.lanterns(); for(let i=0;i<40;i++){ const a=R()*Math.PI, rr=1+R()*4.5; const [px,pz]=A(Math.cos(a)*rr, e+D/2+Math.sin(a)*rr*.6-1); ln.add(px, top+3+R()*1.6, pz); } ln.build(grp); break; }
      case 2: { for(const s of [-3.4,0,3.4]){ const [px,pz]=A(s,e+D/2); const d=new THREE.Mesh(new THREE.SphereGeometry(2.3,16,10,0,TAU,0,Math.PI/2), M.glassB); d.position.set(px,top,pz); grp.add(d); kk.add(new THREE.IcosahedronGeometry(2.32,1), M.gold, px, top, pz); } break; }
      case 3: { kk.add(AK.roundedBox(10,1.6,4.4,.6,3), M.wood, P0[0], top+.8, P0[1], 0, yaw+Math.PI/2, 0); const [bx,bz]=A(5.6,e+D/2); kk.add(new THREE.ConeGeometry(2.2,2.6,4), M.wood, bx, top+.9, bz, 0, yaw, -Math.PI/2); kk.add(new THREE.CylinderGeometry(.12,.12,7,8), M.wood, P0[0], top+5, P0[1]); kk.add(new THREE.PlaneGeometry(3,3.6), M.white, P0[0], top+5.2, P0[1]+.1, 0, yaw, 0); break; }
      case 4: { const b=new THREE.Mesh(AK.roundedBox(10,3.6,6,.2,2), new THREE.MeshPhysicalMaterial({color:0x111418, roughness:.08, metalness:.6, transparent:true, opacity:.55, depthWrite:false})); b.position.set(P0[0],top+1.8,P0[1]); b.rotation.y=yaw; grp.add(b); AK.buildBilliardTable(W, P0[0], top, P0[1], yaw, 0x0d4f7a, 'world', {parent:grp}); break; }
      case 5: { const [lx,lz]=A(-4.5,e+D-2); for(let i=0;i<6;i++) kk.add(new THREE.CylinderGeometry(1.3-i*.08,1.38-i*.08,1.4,16), i%2?M.white:M.red, lx, top+.7+i*1.4, lz); kk.add(new THREE.CylinderGeometry(1,1,1.2,12), M.glassB, lx, top+9, lz); kk.add(new THREE.ConeGeometry(1.2,1.2,12), M.red, lx, top+10.2, lz); circles.push({x:lx,z:lz,r:1.45,y0:y-.5,y1:y+12}); break; }
      case 6: { const b=new THREE.Mesh(AK.roundedBox(6,3.2,5,.15,2), M.glassB); b.position.set(P0[0],top+1.6,P0[1]); b.rotation.y=yaw; grp.add(b); kk.add(AK.roundedBox(6.2,.2,5.2,.08,1), M.steel, P0[0], top+3.25, P0[1], 0, yaw, 0); break; }
      case 7: { for(const s of [-1,1]){ kk.add(new THREE.BoxGeometry(.25,7.2,7), M.wood, P0[0], top+2.6, P0[1], 0, yaw, s*.62); } break; }
      case 8: { for(let i=-2;i<=2;i++){ const [px,pz]=A(i*2.4,e+D/2); kk.add(new THREE.BoxGeometry(.12,.12,D-1), M.wood, px, top+3, pz, 0, yaw, 0); } const pl=AK.hangingPlanters(); for(let i=-2;i<=2;i++){ const [px,pz]=A(i*2.4,e+1); pl.add(px, top+2.6, pz, yaw); } pl.build(grp); for(const [a,b] of [[-5.4,e+1],[5.4,e+1],[-5.4,e+D-1],[5.4,e+D-1]]){ const [px,pz]=A(a,b); kk.add(new THREE.CylinderGeometry(.1,.1,3,8), M.wood, px, top+1.5, pz); } break; }
      case 9: { const [ox,oz]=A(0,e+D-2.5); kk.add(new THREE.CylinderGeometry(2.4,2.4,2.4,20), M.white, ox, top+1.2, oz); kk.add(new THREE.SphereGeometry(2.45,20,10,0,TAU,0,Math.PI/2), M.steel, ox, top+2.4, oz); kk.add(new THREE.CylinderGeometry(.2,.3,2.2,10), M.dark, ox+.8, top+3.4, oz, .6, 0, 0); circles.push({x:ox,z:oz,r:2.5,y0:y-.5,y1:y+5}); break; }
      case 10: { const cols=[0xd94141,0x2f6fd0,0xf0a020,0x2e8f57]; for(let i=0;i<4;i++){ const [px,pz]=A(-3.6+(i%2)*7.2, e+D-2); kk.add(AK.roundedBox(6,2.6,2.4,.06,1), sm(cols[i],.6,.3), px, top+1.3+Math.floor(i/2)*2.6, pz, 0, yaw, 0); } for(const a of [-3.6,3.6]){ const [px,pz]=A(a,e+D-2); circles.push({x:px,z:pz,r:1.6,y0:y-.5,y1:y+6}); } break; }
      case 11: { const [sx,sz]=A(0,e+D-1.2); kk.add(new THREE.BoxGeometry(11,.2,.2), M.wood, sx, top+3.4, sz, 0, yaw, 0); for(const s of [-1,1]){ const [px,pz]=A(s*5.4,e+D-1.2); kk.add(new THREE.CylinderGeometry(.14,.14,3.4,8), M.wood, px, top+1.7, pz); } for(const s of [-3,0,3]){ const [px,pz]=A(s,e+D-1.2); kk.add(new THREE.BoxGeometry(1.2,.08,.45), M.wood, px, top+.6, pz, 0, yaw, 0); W.addSeat && W.addSeat({x:px, z:pz, rot:yaw, y:top+.66, floor:top, label:'🎈 Ngồi xích đu ngắm mây (E · C)'}); } break; }
    }
    for(const a of [-3.2, 3.2]){ const [tx,tz]=A(a, e+D-2.2); kk.add(new THREE.CylinderGeometry(.45,.45,.05,16), M.white, tx, top+.75, tz); kk.add(new THREE.CylinderGeometry(.05,.06,.72,8), M.dark, tx, top+.37, tz); circles.push({x:tx,z:tz,r:.45,y0:y-.5,y1:y+1.2});
      if(W.addBench) W.addBench({x:tx-nx*.85, z:tz-nz*.85, rot:yaw, len:1.3, y:top+.48, floor:top, label:'🪑 Ngồi ngắm biển mây (E · C)'}); }
    { const [kx,kz]=A(0,e+1.4); kk.add(AK.roundedBox(2.6,1.05,.7,.08,2), M.wood, kx, top+.53, kz, 0, yaw, 0); kk.add(AK.roundedBox(2.8,.06,.85,.03,1), M.white, kx, top+1.08, kz, 0, yaw, 0); const [s0x,s0z]=A(-1.35,e+1.4), [s1x,s1z]=A(1.35,e+1.4); addSeg(s0x,s0z,s1x,s1z,.38,y-.5,y+1.3);
      const [ix,iz]=A(-2.6,e+.8); INTER.push({x:ix, z:iz, r:2.2, prio:.6, when:()=>Math.abs(P.y-top)<1.4, label:`${CAFE[k][0]} ${CAFE[k][1]} – gọi món (E)`, action:()=>menu(`${CAFE[k][0]} ${CAFE[k][1]}`, CAFE[k][2])}); }
    kk.build(); makeLabel(`${CAFE[k][0]} ${CAFE[k][1]}`, 'Quán săn mây · ngồi ngắm biển · gọi món', {h:.5, x:cx, y:top+5.6, z:cz, fade:50}); cafes.push({x:cx,z:cz,y:top,name:CAFE[k][1], road:[q.x,q.z], i:q.i}); }
  // gỡ lan can đường ở miệng mỗi quán (lối vào sàn quán)
  for(const c of cafes){ const q=ROAD[c.i], nx=-q.uz, nz=q.ux; for(let s=W.SEGS.length-1;s>=0;s--){ const g=W.SEGS[s], mx=(g.ax+g.bx)/2, mz=(g.az+g.bz)/2; if(Math.hypot(mx-(c.x),mz-(c.z))<9.5 && Math.abs(g.y0-(q.h-.6))<.8 && Math.hypot(mx-q.x,mz-q.z)<7.5 && Math.hypot(mx-q.x,mz-q.z)>4) W.SEGS.splice(s,1); } }

  /* ============================== 4. THÁP LIÊN HOA THẦN KINH ============================== */
  const RB=28, RA=10, FH=8, FY=[110,118,126,134,142,150], ENT=Math.atan2(GB.b.z-C.z, GB.b.x-C.x), DOORS=[ENT, ENT+Math.PI/2, ENT+Math.PI, ENT-Math.PI/2];
  const dAng=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
  const kt=Kit();
  { const d=new THREE.Mesh(new THREE.CircleGeometry(RPAD+.3,96), M.pave); d.rotation.x=-Math.PI/2; d.position.set(C.x,YT+.04,C.z); d.receiveShadow=true; grp.add(d);
    for(let i=0;i<16;i++){ const a=i/16*TAU+.1, p=at(a,RPAD-4); if(DOORS.some(b=>dAng(a,b)<.2) || dAng(a,aE)<.25) continue; kt.add(new THREE.CylinderGeometry(1.2,1.3,.6,18), M.white, p.x, YT+.3, p.z); kt.add(new THREE.IcosahedronGeometry(1.1,1), sm(0x4f8a35,.9), p.x, YT+1.1, p.z); circles.push({x:p.x,z:p.z,r:1.3}); } }
  const floorMats=[null,AK.makeWoodMaterial({col:'#6b4329',repeat:6}),AK.makeStoneMaterial({col:'#2a4f55',joint:'#1f3d42',blockW:128,blockH:128,repeat:6}),AK.makeStoneMaterial({col:'#2b2f36',joint:'#1d2026',repeat:6}),AK.makeStoneMaterial({col:'#4a2a26',joint:'#33201c',repeat:6}),M.pave];
  for(let f=1;f<6;f++){ const y=FY[f]; const ring=new THREE.RingGeometry(RA,RB+.4,96,1); ring.rotateX(-Math.PI/2); const fl=new THREE.Mesh(ring, floorMats[f]); fl.position.set(C.x,y,C.z); fl.receiveShadow=true; grp.add(fl);
    const un=new THREE.RingGeometry(RA,RB+.4,96,1); un.rotateX(Math.PI/2); kt.add(un, M.dark, C.x, y-.5, C.z); kt.add(new THREE.CylinderGeometry(RB+.4,RB+.4,.5,96,1,true), M.gold, C.x, y-.25, C.z); kt.add(new THREE.CylinderGeometry(RA,RA,.5,64,1,true), M.dark, C.x, y-.25, C.z);
    kt.add(new THREE.TorusGeometry(RA+.03,.05,6,96), M.led, C.x, y-.52, C.z, Math.PI/2,0,0); plats.push({t:'ring', x:C.x, z:C.z, r0:RA+.05, r1:RB-.05, h:y}); }
  const ringC=(r,y0,y1,skip)=>{ const n=Math.ceil(TAU*r/.9); for(let i=0;i<n;i++){ const a=i/n*TAU; if(skip && skip(a)) continue; const p=at(a,r); circles.push({x:p.x,z:p.z,r:.32,y0,y1}); } };
  for(let f=0;f<5;f++){ const y0=FY[f], h=FH-.5; kt.add(new THREE.CylinderGeometry(RB,RB,h,96,1,true), M.glass, C.x, y0+h/2, C.z); ringC(RB-.15, y0-.3, y0+h, f===0?(a=>DOORS.some(b=>dAng(a,b)<2.2/RB)):null); }
  for(let i=0;i<48;i++){ const a=i/48*TAU, p=at(a,RB+.05); if(DOORS.some(b=>dAng(a,b)<2.4/RB)) { kt.add(new THREE.BoxGeometry(.18,FH*5-6,.24), M.gold, p.x, YT+6+(FH*5-6)/2, p.z, 0, yawOut(a), 0); continue; } kt.add(new THREE.BoxGeometry(.18,FH*5,.24), M.gold, p.x, YT+FH*2.5, p.z, 0, yawOut(a), 0); }
  for(const a of DOORS){ const p=at(a,RB+.3); kt.add(AK.roundedBox(5.6,.5,3,.15,2), M.gold, p.x, YT+4.4, p.z, 0, yawOut(a), 0); }
  kt.add(new THREE.CylinderGeometry(RB+.2,RB+.2,1.1,96,1,true), M.glassB, C.x, FY[5]+.55, C.z); kt.add(new THREE.TorusGeometry(RB+.2,.07,8,128), M.gold, C.x, FY[5]+1.12, C.z, Math.PI/2,0,0); ringC(RB+.05, FY[5]-.3, FY[5]+1.6);
  { const petG=(()=>{ const nu=10, nv=18, pos=[], idx=[]; for(let j=0;j<=nv;j++){ const v=j/nv, w=16*Math.pow(Math.sin(Math.PI*Math.min(1,v*1.05)),.8)+.4, r=RB+3+12*Math.sin(v*Math.PI*.85)+v*6, y=v*44; for(let i=0;i<=nu;i++){ const u=i/nu-.5, bulge=(1-4*u*u)*1.6; pos.push(u*w, y, r+bulge); } }
      for(let j=0;j<nv;j++) for(let i=0;i<nu;i++){ const a=j*(nu+1)+i, b=a+1, c=a+nu+1, d=c+1; idx.push(a,c,b,b,c,d); } const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g; })();
    const edgeAt=(v,s)=>{ const w=16*Math.pow(Math.sin(Math.PI*Math.min(1,v*1.05)),.8)+.4, r=RB+3+12*Math.sin(v*Math.PI*.85)+v*6; return new THREE.Vector3(s*w/2,v*44,r); };
    for(let k=0;k<8;k++){ const a=k/8*TAU+Math.PI/8; const m=new THREE.Mesh(petG, M.glass); m.position.set(C.x,YT,C.z); m.rotation.y=Math.PI/2-a; grp.add(m);
      const edge=[]; for(let j=0;j<=18;j++) edge.push(edgeAt(j/18,-1)); for(let j=18;j>=0;j--) edge.push(edgeAt(j/18,1));
      const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge),80,.16,6,false); tg.rotateY(Math.PI/2-a); kt.add(tg, M.gold, C.x, YT, C.z); const b=at(a, RB+3); circles.push({x:b.x,z:b.z,r:1.2,y0:YT-1,y1:YT+6}); } }
  const STEP=.25, SPT=32, DA=TAU/SPT, R0=2.8, R1=RA-.4, A0=ENT+Math.PI*.5, NST=(FY[5]-FY[0])/STEP;
  kt.add(new THREE.CylinderGeometry(R0-.1,R0,FY[5]-FY[0]+6,32), M.dark, C.x, YT+(FY[5]-YT+6)/2, C.z); circles.push({x:C.x, z:C.z, r:R0});
  for(let hx=0;hx<2;hx++){ const strand=[];
    for(let i=1;i<=NST;i++){ const a=A0+hx*Math.PI+i*DA, y=YT+i*STEP, rm=(R0+R1)/2, p=at(a,rm);
      kt.add(AK.roundedBox(R1-R0,.14,R1*DA+.2,.04,1), M.wood, p.x, y-.07, p.z, 0, yawOut(a)+Math.PI/2, 0); addPlat(p.x,p.z,yawOut(a),R1*Math.sin(DA/2)+.14,(R1-R0)/2,y);
      const ph=i%SPT; if(i>3 && ph>2 && ph<SPT-2){ const q=at(a,R1+.1); circles.push({x:q.x,z:q.z,r:.16,y0:y-.3,y1:y+1.15}); }
      if(y-YT>.8 && y-YT<2.2) circles.push({x:p.x,z:p.z,r:.7,y0:YT-1,y1:y-.5});
      strand.push(at(a,R1+.05,y+1.0)); }
    kt.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strand), NST*2, .08, 6, false), hx?new THREE.MeshStandardMaterial({color:0xff6ad5, emissive:0xff3ab0, emissiveIntensity:1.2}):M.led);
    for(let f=1;f<6;f++){ const a=A0+hx*Math.PI, p=at(a,(R1+RA+.6)/2); kt.add(AK.roundedBox(2.2,.22,RA+.6-R1+.4,.06,1), M.wood, p.x, FY[f]-.11, p.z, 0, yawOut(a), 0); addPlat(p.x,p.z,yawOut(a),1.1,(RA+.6-R1)/2+.25,FY[f]); } }
  for(let f=1;f<6;f++){ ringC(RA+.2, FY[f]-.2, FY[f]+1.15, a=>dAng(a,A0)<.3 || dAng(a,A0+Math.PI)<.3); kt.add(new THREE.CylinderGeometry(RA+.15,RA+.15,1.05,64,1,true), M.glassB, C.x, FY[f]+.52, C.z); }
  const ELEV=[A0+Math.PI/2, A0-Math.PI/2].map(a=>({a, p:at(a,RA+3.2)}));
  const FLOORN=['1 · Bảo tàng Lịch sử & Thảm hoạ','2 · Đấu trường Test Design','3 · Chỉ huy Hiệu năng & Bảo mật','4 · Đại sảnh Danh vọng & Phòng Bí ẩn','5 · Nhà hàng xoay · Bida Hoàng gia','6 · Sân thượng · QA Brain Core'];
  for(const e of ELEV){ kt.add(new THREE.CylinderGeometry(1.4,1.4,FY[5]-YT+3,24,1,true), M.glassB, e.p.x, YT+(FY[5]-YT+3)/2, e.p.z); kt.add(new THREE.CylinderGeometry(1.45,1.45,.3,24), M.gold, e.p.x, FY[5]+3, e.p.z); circles.push({x:e.p.x, z:e.p.z, r:1.55});
    const front=at(e.a, RA+5.2);
    INTER.push({x:front.x, z:front.z, r:1.9, prio:.8, when:()=>P.y>YT-1 && P.y<FY[5]+1.5, label:'🛗 Thang máy kính – chọn tầng (E)', action:()=>{ const m=ui.modal('🛗 Thang máy Tháp Liên Hoa');
      m.body.innerHTML=`<div class="grid">${FLOORN.map((n,i)=>`<div class="card" data-f="${i}" style="cursor:pointer"><b>Tầng ${n}</b><small>y = +${FY[i]} m</small></div>`).join('')}</div>`; m.body.querySelectorAll('[data-f]').forEach(c=>c.onclick=()=>{ m.close(); const y=FY[+c.dataset.f]; teleport(front.x, front.z, C.x, C.z); P.y=y; toast(`🛗 Tầng ${FLOORN[+c.dataset.f]}`, 2200); }); }}); }
  const panelTex=(title, lines, bg='#13202f')=>{ const c=document.createElement('canvas'); c.width=1024; c.height=640; const g=c.getContext('2d'); g.fillStyle=bg; g.fillRect(0,0,1024,640); g.strokeStyle='#e0b040'; g.lineWidth=10; g.strokeRect(10,10,1004,620); g.fillStyle='#ffd77a'; g.font='900 64px "Segoe UI",sans-serif'; g.fillText(title,48,110); g.fillStyle='#fff'; g.font='500 38px "Segoe UI",sans-serif'; lines.forEach((l,i)=>g.fillText(l,48,200+i*62)); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };
  const panel=(a,y,title,lines,bg)=>{ const p=at(a,RB-.8), t=panelTex(title,lines,bg), m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,3.5), new THREE.MeshStandardMaterial({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:.45})); m.position.set(p.x,y+2.6,p.z); m.rotation.y=yawOut(a)+Math.PI; grp.add(m); };
  const busy=(a,f)=>dAng(a,A0)<.45 || dAng(a,A0+Math.PI)<.45 || ELEV.some(e=>dAng(a,e.a)<.35) || (f===0 && DOORS.some(b=>dAng(a,b)<.32));
  { const y=FY[0]; for(const [a,kind] of [[A0+.9,'rocket'],[A0+2.2,'sat'],[A0+3.9,'bug']]){ const p=at(a,18); kt.add(AK.roundedBox(2.4,1.1,2.4,.1,2), M.white, p.x, y+.55, p.z); kt.add(new THREE.BoxGeometry(2.2,2.4,2.2), M.glassB, p.x, y+2.3, p.z); circles.push({x:p.x,z:p.z,r:1.6,y0:y-.5,y1:y+3.6});
      if(kind==='rocket'){ kt.add(new THREE.CylinderGeometry(.25,.25,1.6,16), M.white, p.x, y+2, p.z); kt.add(new THREE.ConeGeometry(.25,.5,16), M.red, p.x, y+3.05, p.z); for(let i=0;i<4;i++) kt.add(new THREE.BoxGeometry(.04,.4,.3), M.red, p.x+Math.cos(i*Math.PI/2)*.27, y+1.4, p.z+Math.sin(i*Math.PI/2)*.27, 0, i*Math.PI/2, 0); }
      if(kind==='sat'){ kt.add(AK.roundedBox(.6,.6,.6,.05,1), M.gold, p.x, y+2.2, p.z); for(const s of [-1,1]) kt.add(new THREE.BoxGeometry(1.1,.03,.5), sm(0x1f3f8a,.3,.6), p.x+s*.85, y+2.2, p.z); }
      if(kind==='bug'){ const b=new THREE.SphereGeometry(.35,16,10); b.scale(1.4,.6,1); kt.add(b, sm(0x5a4030,.6), p.x, y+1.6, p.z); for(const s of [-1,1]) kt.add(new THREE.CircleGeometry(.4,12), sm(0xb89a70,.7,0,{side:THREE.DoubleSide}), p.x+s*.35, y+1.75, p.z, 0, 0, s*.5); } }
    const PAN=[['1947 · Con bọ đầu tiên',['Bướm đêm kẹt trong máy Harvard Mark II,','được dán vào sổ nhật ký vận hành.']],['1996 · Ariane 5',['Tên lửa tự huỷ sau ~37 giây do tràn số','khi đổi số 64-bit sang 16-bit.']],['1999 · Mars Climate Orbiter',['Mất tàu vì một bên dùng đơn vị Anh,','một bên dùng hệ mét.']],['2012 · Knight Capital',['Triển khai sai phiên bản,','mất khoảng 440 triệu USD trong 45 phút.']],['2014 · Heartbleed',['Thiếu kiểm tra độ dài trong OpenSSL,','lộ dữ liệu bộ nhớ máy chủ.']],['Bài học',['Kiểm thử sớm · kiểm thử biên ·','review cấu hình · giám sát sau release.']]];
    let n=0; for(let i=0;i<14 && n<PAN.length;i++){ const a=ENT+.5+i*TAU/14; if(busy(a,0)) continue; panel(a,y,PAN[n][0],PAN[n][1]); n++; } }
  { const y=FY[1]; let n=0; for(let i=0;i<10 && n<6;i++){ const a=A0+.7+i*TAU/10; if(busy(a,1)) continue; const p=at(a,17); kt.add(AK.roundedBox(1.2,1.4,.7,.1,2), M.dark, p.x, y+.7, p.z, 0, yawOut(a)+Math.PI, 0); kt.add(new THREE.BoxGeometry(1,.7,.06), M.led, p.x, y+1.55, p.z, -.3, yawOut(a)+Math.PI, 0); circles.push({x:p.x,z:p.z,r:.7,y0:y-.5,y1:y+2});
      INTER.push({x:p.x, z:p.z, r:2, prio:.8, when:()=>Math.abs(P.y-y)<1.5, label:'🧠 Kiosk đố vui Test Design (E)', action:()=>{ if(W.life && W.life.openQuiz) W.life.openQuiz(); }}); n++; }
    panel(ENT+Math.PI*.25, y, 'Đấu trường Test Design', ['Phân vùng tương đương · Giá trị biên','Bảng quyết định · Chuyển trạng thái','Pairwise · Kiểm thử thăm dò'], '#123b3a'); }
  let holo=null; { const y=FY[2], p=at(A0+Math.PI*.5+.6,18); holo=new THREE.Mesh(new THREE.IcosahedronGeometry(2.6,3), new THREE.MeshBasicMaterial({color:0x46c8ff, wireframe:true, transparent:true, opacity:.7})); holo.position.set(p.x,y+3,p.z); grp.add(holo); kt.add(new THREE.CylinderGeometry(1.6,1.8,.8,24), M.dark, p.x, y+.4, p.z); circles.push({x:p.x,z:p.z,r:1.9,y0:y-.5,y1:y+5});
    for(const [d,t,l] of [[.9,'Hiệu năng · Real-time',['p95: 182 ms · RPS: 12.4k','Lỗi 5xx: 0,02 %']],[2.4,'Bảo mật · SOC',['Cảnh báo: 0 nghiêm trọng','Quét lỗ hổng: xanh']],[4.2,'CI/CD',['Build #4821 ✓ · 1.284 test pass','Thời gian: 6 phút 40 giây']]]) panel(A0+d, y, t, l, '#0d1726'); }
  { const y=FY[3]; for(const [d,t,l] of [[.9,'Glenford Myers',['"The Art of Software Testing" (1979)']],[1.7,'Lisa Crispin & Janet Gregory',['"Agile Testing" (2009)']],[2.5,'Kent Beck',['Phổ biến TDD – viết test trước']],[3.6,'Đội QC Bình Phan',['Tận tâm · Chính trực · Học hỏi']],[4.4,'Bạn – người QA tiếp theo',['Mỗi bug tìm ra là một người dùng được bảo vệ']]]) panel(A0+d, y, t, l, '#3b1d12');
    const a=A0+Math.PI+1.2, p=at(a,RB-.9), door=new THREE.Mesh(new THREE.PlaneGeometry(3,3.6), new THREE.MeshStandardMaterial({color:0x2a1450, emissive:0x8a4cff, emissiveIntensity:.9})); door.position.set(p.x,y+1.8,p.z); door.rotation.y=yawOut(a)+Math.PI; grp.add(door);
    const dp=at(a,RB-2.6); INTER.push({x:dp.x, z:dp.z, r:2, prio:.9, when:()=>Math.abs(P.y-y)<1.5, label:'🔮 Cổng Không gian Bí ẩn (E)', action:()=>toast('🔮 Cổng Không gian Bí ẩn đang được chuẩn bị – Bình sẽ mở một điều đặc biệt ở đây.', 4200)}); }
  let spinRing=null; { const y=FY[4]; spinRing=new THREE.Mesh(new THREE.RingGeometry(RB-5,RB-.6,96,1), floorMats[1]); spinRing.rotation.x=-Math.PI/2; spinRing.position.set(C.x,y+.02,C.z); grp.add(spinRing);
    const tables=[]; for(let i=0;i<12;i++){ const a=A0+.6+i*TAU/12; if(!busy(a,4)) tables.push(a); }
    tables.slice(0,7).forEach(a=>{ const p=at(a,RB-2.8); kt.add(new THREE.CylinderGeometry(.6,.6,.05,18), M.white, p.x, y+.76, p.z); kt.add(new THREE.CylinderGeometry(.06,.08,.74,8), M.gold, p.x, y+.38, p.z); circles.push({x:p.x,z:p.z,r:.62,y0:y-.5,y1:y+1.2});
      const s=at(a,RB-4.1); if(W.addBench) W.addBench({x:s.x, z:s.z, rot:yawOut(a), len:1.3, y:y+.48, floor:y, label:'🍽️ Ngồi nhà hàng xoay (E · C)'}); });
    const ba=A0+Math.PI+.2, bar=at(ba,15); kt.add(AK.roundedBox(5,1.1,1,.15,2), M.dark, bar.x, y+.55, bar.z, 0, yawOut(ba)+Math.PI/2, 0); kt.add(AK.roundedBox(5.2,.06,1.15,.04,1), M.gold, bar.x, y+1.12, bar.z, 0, yawOut(ba)+Math.PI/2, 0); circles.push({x:bar.x,z:bar.z,r:1.6,y0:y-.5,y1:y+1.5});
    const bi=at(ba,13.2); INTER.push({x:bi.x, z:bi.z, r:2, prio:.7, when:()=>Math.abs(P.y-y)<1.5, label:'🍸 Sky Bar Liên Hoa – gọi đồ uống (E)', action:()=>menu('🍸 Sky Bar Liên Hoa',[['🍸 Mocktail Liên Hoa',60,'Hương sen'],['🥂 Nước nho sủi',50,'Không cồn'],['🍰 Bánh sen vàng',45,'Ngọt thanh']])});
    for(let k=0;k<4;k++){ const a=A0+Math.PI*.5+.55+k*.42, p=at(a,15.5); AK.buildBilliardTable(W, p.x, y, p.z, yawOut(a), 0x7a0d1c, 'world', {parent:grp}); } }
  { const y=FY[5], a=A0+Math.PI*.5, p=at(a,16); kt.add(AK.roundedBox(3.2,2.4,1.8,.2,2), M.dark, p.x, y+1.2, p.z, 0, yawOut(a), 0); kt.add(new THREE.BoxGeometry(2.8,1.4,.06), M.led, p.x-Math.cos(a)*.92, y+1.6, p.z-Math.sin(a)*.92, 0, yawOut(a), 0); circles.push({x:p.x,z:p.z,r:1.9,y0:y-.5,y1:y+3});
    const ip=at(a,13.6); INTER.push({x:ip.x, z:ip.z, r:2.2, prio:.9, when:()=>Math.abs(P.y-y)<1.5, label:'🧠 QA Brain Core – phân tích tài liệu, sinh test case (E)', action:()=>{ const b=W.life && W.life.brain; if(b && b.open) b.open(); else toast('🧠 QA Brain đang khởi động…'); }});
    for(let i=0;i<6;i++){ const ta=A0+.3+i*TAU/6, tp=at(ta,RB-1.4); kt.add(new THREE.CylinderGeometry(.07,.1,1.1,8), M.steel, tp.x, y+.55, tp.z); kt.add(new THREE.CylinderGeometry(.13,.17,.6,12), M.gold, tp.x, y+1.2, tp.z, Math.PI/2.3, yawOut(ta), 0); circles.push({x:tp.x,z:tp.z,r:.35,y0:y-.5,y1:y+1.6});
      INTER.push({x:tp.x, z:tp.z, r:1.6, prio:.8, when:()=>Math.abs(P.y-y)<1.5, label:'🔭 Ống nhòm 360° – ngắm toàn thế giới (E)', action:()=>{ HOOK.scope={pos:at(ta,RB+.8,y+1.6), fov:30}; toast('🔭 Kéo chuột nhìn quanh 360°, lăn chuột phóng to · bấm E hoặc phím di chuyển để thôi', 3600); }}); } }
  kt.build();
  const crown=new THREE.Group(); crown.position.set(C.x,161,C.z); grp.add(crown);
  const gold2=new THREE.MeshStandardMaterial({color:0xffd27a, metalness:1, roughness:.2, emissive:0xffa000, emissiveIntensity:.3}); const gy=[17,15,13].map(r=>{ const m=new THREE.Mesh(new THREE.TorusGeometry(r,.45,12,96), gold2); crown.add(m); return m; });
  const brainM=new THREE.MeshPhysicalMaterial({color:0xc9b8ff, roughness:.05, metalness:.1, transparent:true, opacity:.82, emissive:0x7a4cff, emissiveIntensity:.6, flatShading:true});
  const brainG=new THREE.IcosahedronGeometry(1,2); brainG.scale(9,7.5,11); const brainMesh=new THREE.Mesh(brainG, brainM); crown.add(brainMesh);
  const neur=new THREE.LineSegments(new THREE.EdgesGeometry(brainG), new THREE.LineBasicMaterial({color:0x6ad7ff, transparent:true, opacity:.8})); crown.add(neur);
  let band=null; { const c=document.createElement('canvas'); c.width=2048; c.height=160; const g=c.getContext('2d'); g.fillStyle='#ffd77a'; g.font='900 120px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; for(let i=0;i<3;i++) g.fillText('QA · QC · QE', 341+i*683, 82);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; band=new THREE.Mesh(new THREE.CylinderGeometry(12.5,12.5,3,96,1,true), new THREE.MeshStandardMaterial({map:t, transparent:true, emissive:0xffc860, emissiveMap:t, emissiveIntensity:.8, side:THREE.DoubleSide, depthWrite:false})); band.position.y=5; crown.add(band); }
  const beamMat=new THREE.MeshBasicMaterial({color:0xc9b8ff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
  const beams=[]; for(let i=0;i<8;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.4,5,180,16,1,true), beamMat); b.geometry.translate(0,90,0); const p=at(i/8*TAU,RB+6); b.position.set(p.x,YT+2,p.z); grp.add(b); beams.push(b); }
  makeLabel('🧠 QA/QC Brain Citadel', 'Tháp Liên Hoa Thần Kinh · 6 tầng · đi bộ thẳng vào', {h:1.0, x:C.x, y:182, z:C.z, fade:900});

  /* ============================== 5. SÂN BAY ĐỈNH MÂY ============================== */
  { const kk=Kit(), x0=820, x1=980, z0=50, z1=125, y=YT, cx=(x0+x1)/2, cz=(z0+z1)/2;
    const rw=(()=>{ const c=document.createElement('canvas'); c.width=1024; c.height=512; const g=c.getContext('2d'); g.fillStyle='#3a3d42'; g.fillRect(0,0,1024,512); g.fillStyle='#f2f1ea'; for(let x=40;x<1000;x+=70) g.fillRect(x,246,40,20); g.fillRect(0,40,1024,8); g.fillRect(0,464,1024,8); for(let i=0;i<8;i++){ g.fillRect(16,80+i*45,60,22); g.fillRect(948,80+i*45,60,22); } g.font='900 90px Segoe UI'; g.fillText('16',110,290); g.fillText('34',820,290); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const deck=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,1.2,z1-z0), M.concrete); deck.position.set(cx,y-.6,cz); deck.receiveShadow=true; grp.add(deck); addPlat(cx,cz,0,(x1-x0)/2,(z1-z0)/2,y);
    const run=new THREE.Mesh(new THREE.PlaneGeometry(160,26), new THREE.MeshStandardMaterial({map:rw, roughness:.85, polygonOffset:true, polygonOffsetFactor:-2})); run.rotation.x=-Math.PI/2; run.position.set(cx,y+.03,z0+16); grp.add(run);
    for(let x=x0+6;x<=x1-6;x+=22){ for(const zz of [z0+4, z1-14]){ const g0=hAt(x,zz)??SEA, hh=y-1.2-Math.min(g0,y-3); if(hh>3) kk.add(new THREE.BoxGeometry(1.4,hh,1.4), M.steel, x, y-1.2-hh/2, zz); } }
    for(const hx of [x1-26, x1-10]){ const hp=new THREE.Mesh(new THREE.CircleGeometry(7,40), new THREE.MeshStandardMaterial({color:0x2f6f3f, roughness:.8, polygonOffset:true, polygonOffsetFactor:-2})); hp.rotation.x=-Math.PI/2; hp.position.set(hx,y+.04,z1-24); grp.add(hp);
      const hc=document.createElement('canvas'); hc.width=hc.height=256; const hg=hc.getContext('2d'); hg.strokeStyle='#fff'; hg.lineWidth=14; hg.beginPath(); hg.arc(128,128,110,0,TAU); hg.stroke(); hg.fillStyle='#fff'; hg.font='900 150px Segoe UI'; hg.textAlign='center'; hg.textBaseline='middle'; hg.fillText('H',128,136);
      const hm=new THREE.Mesh(new THREE.CircleGeometry(6.6,40), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(hc), transparent:true, polygonOffset:true, polygonOffsetFactor:-3})); hm.rotation.x=-Math.PI/2; hm.position.set(hx,y+.06,z1-24); grp.add(hm); }
    const term=new THREE.Mesh(AK.roundedBox(36,7,14,.6,3), M.glassB); term.position.set(x0+30,y+3.5,z1-12); grp.add(term); kk.add(AK.roundedBox(37,.5,15,.2,2), M.gold, x0+30, y+7.2, z1-12); addSeg(x0+12,z1-19,x0+48,z1-19,.2,y-.5,y+7); addSeg(x0+12,z1-5,x0+48,z1-5,.2,y-.5,y+7);
    for(const [ax,az,bx,bz] of [[x0,z0,x1,z0],[x1,z0,x1,z1-30],[x0,z0,x0,z1]]) addSeg(ax,az,bx,bz,.2,y-.5,y+1.6);
    INTER.push({x:x0+30, z:z1-21, r:3, prio:.7, when:()=>Math.abs(P.y-y)<2, label:'✈️ Sân bay Đỉnh Mây – quầy làm thủ tục (E)', action:()=>toast('✈️ Sân bay Đỉnh Mây: đường băng STOL 160 m + 2 bãi trực thăng. Chuyến bay nối Sân bay Quốc tế sẽ mở khi Pha Sân bay hoàn tất.', 5200)});
    (W.AIRPORTS||(W.AIRPORTS=[])).push({key:'brain', name:'Sân bay Đỉnh Mây', x:cx, z:cz, y, rwy:{x0:cx-80, x1:cx+80, z:z0+16, y}, spawn:{x:x0+30, z:z1-23, lx:x0+30, lz:z0}});   /* sổ sân bay chung (skyport.js) – chuyến bay hạ cánh thật ở đây */
    makeLabel('🛩️ Sân bay Đỉnh Mây', 'Đường băng STOL 160 m · 2 bãi trực thăng', {h:.7, x:x0+30, y:y+10, z:z1-12, fade:240}); kk.build(); }

  /* ============================== 6. CẢM GIÁC MẠNH TRÊN ĐỈNH VỰC ============================== */
  const ride={on:null};
  const seatAt=(x,y,z,yaw)=>{ P.x=x; P.z=z; P.y=y; P.face=yaw; me.g.position.set(x, y+.04-(me.h||1.75)*.53, z); me.g.rotation.set(0,yaw,0); };
  const endRide=(at2)=>{ ride.on=null; HOOK.vehicle=null; HOOK.camOverride=null; if(at2){ P.x=at2.x; P.z=at2.z; P.y=W.groundAt(at2.x,at2.z); P.vx=P.vz=0; me.g.rotation.set(0,P.face,0); } };
  { const sx=880, sz=265, base=hAt(sx,sz)??YT, piv=base+28, L=24, kk=Kit(); for(const s of [-1,1]){ kk.add(new THREE.BoxGeometry(1.2,30,1.2), M.steel, sx+s*7, base+14, sz-6, -.2, 0, 0); kk.add(new THREE.BoxGeometry(1.2,30,1.2), M.steel, sx+s*7, base+14, sz+2, .2, 0, 0); circles.push({x:sx+s*7,z:sz-6,r:1},{x:sx+s*7,z:sz+2,r:1}); }
    kk.add(new THREE.BoxGeometry(16,1.4,1.4), M.red, sx, piv, sz-2); kk.build();
    const arm=new THREE.Group(); arm.position.set(sx,piv,sz-2); grp.add(arm); const rod=new THREE.Mesh(new THREE.BoxGeometry(.25,L,.25), M.steel); rod.position.y=-L/2; arm.add(rod); const seat=new THREE.Mesh(AK.roundedBox(1.6,.5,1,.15,2), M.red); seat.position.y=-L; arm.add(seat);
    const sw={t:0};
    INTER.push({x:sx, z:sz-8, r:3, prio:.8, when:()=>Math.abs(P.y-base)<2.5 && !ride.on, label:'😱 Xích đu tử thần vượt vực biển – 40 💰 (E)', action:()=>askPay(40,'Xích đu tử thần',()=>{ if(!spend(40)) return; ride.on='swing'; sw.t=0; toast('😱 Giữ chặt! Xích đu văng ra ngoài vực biển sâu 110 m…', 2600);
      HOOK.vehicle={drive:(dt)=>{ sw.t+=dt; const T=sw.t, amp=Math.min(1,T/8)*(T<22?1:Math.max(0,(26-T)/4))*55*Math.PI/180, ang=amp*Math.sin(T*Math.PI*2/6); arm.rotation.x=ang;
        const wp=new THREE.Vector3(0,-L,0).applyEuler(arm.rotation).add(arm.position); seatAt(wp.x, wp.y+.3, wp.z, 0); HOOK.camOverride={pos:new THREE.Vector3(wp.x+8, wp.y+3, wp.z-10), look:wp.clone().add(new THREE.Vector3(0,-6,14)), k:6};
        if(T>26){ arm.rotation.x=0; endRide({x:sx, z:sz-9}); toast('😮‍💨 Phù… xích đu dừng an toàn. Quá đã!', 2400); } }}; })}); }
  { const bx=925, bz=250, base=hAt(bx,bz)??YT, bal=new THREE.Group(); bal.position.set(bx,base,bz); grp.add(bal);
    const env=new THREE.Mesh(new THREE.SphereGeometry(7,24,18), new THREE.MeshStandardMaterial({color:0xff7b29, roughness:.6})); env.scale.set(1,1.2,1); env.position.y=14; bal.add(env);
    for(let i=0;i<8;i++){ const s=new THREE.Mesh(new THREE.SphereGeometry(7.05,24,18,i*TAU/8,TAU/16), new THREE.MeshStandardMaterial({color:0xffd23f, roughness:.6, side:THREE.DoubleSide})); s.scale.set(1,1.2,1); s.position.y=14; bal.add(s); }
    const basket=new THREE.Mesh(AK.roundedBox(2.2,1.1,2.2,.15,2), M.wood); basket.position.y=.55; bal.add(basket); for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const r=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,6.5,4), M.dark); r.position.set(x*.95,4.3,z*.95); bal.add(r); }
    circles.push({x:bx,z:bz,r:1.6,y0:base-1,y1:base+2}); const bl={t:0};
    INTER.push({x:bx-2.6, z:bz, r:2.4, prio:.8, when:()=>!ride.on && Math.abs(P.y-base)<2.5, label:'🎈 Khinh khí cầu ngắm toàn cảnh – 50 💰 (E)', action:()=>askPay(50,'Khinh khí cầu',()=>{ if(!spend(50)) return; ride.on='balloon'; bl.t=0; toast('🎈 Khinh khí cầu cất cánh… lên 210 m ngắm trọn thế giới QC!', 3000);
      HOOK.vehicle={drive:(dt)=>{ bl.t+=dt; const T=bl.t, up=T<22?ss(0,22,T):T<32?1:1-ss(32,54,T), y=base+(210-base)*up; bal.position.set(bx+Math.sin(T*.08)*6*up, y, bz+Math.cos(T*.06)*4*up); seatAt(bal.position.x, y+.5, bal.position.z, -Math.PI/2);
        HOOK.camOverride={pos:new THREE.Vector3(bal.position.x+18, y+8, bal.position.z+18), look:new THREE.Vector3(bal.position.x-40, y-40, bal.position.z-40), k:3};
        if(T>54){ bal.position.set(bx,base,bz); endRide({x:bx-3, z:bz}); toast('🎈 Hạ cánh nhẹ nhàng. Cảm ơn đã bay cùng chúng tôi!', 2600); } }}; })}); }

  /* ============================== khung hình ============================== */
  let wasIn=false, saved=null;
  HOOK.onFrame.push((dt,T)=>{ const d=Math.hypot(P.x-C.x,P.z-C.z);
    if(d<450){ gy[0].rotation.x+=dt*.35; gy[1].rotation.y+=dt*.45; gy[2].rotation.z+=dt*.55; brainMesh.rotation.y+=dt*.12; neur.rotation.y=brainMesh.rotation.y; const pulse=.5+.5*Math.sin(T*2.2); brainM.emissiveIntensity=.4+pulse*(.6+(W.night||0)*1.4); brainM.emissive.setHSL(.72-pulse*.12,.9,.5);
      band.rotation.y-=dt*.3; if(holo) holo.rotation.y+=dt*.4; if(spinRing) spinRing.rotation.z+=dt*.02; }
    const n=W.night||0; gold2.emissiveIntensity=.25+n*.9; beamMat.opacity=n*.14; beams.forEach((b,i)=>{ const a=T*.15+i*TAU/8; b.rotation.set(Math.sin(a)*.3,0,Math.cos(a)*.3); });
    const inside=d<RB-.4 && P.y>YT-1 && P.y<FY[5]-.6;
    if(inside){ const f=Math.min(4,Math.max(0,Math.floor((P.y-YT+.3)/FH))); if(!wasIn){ saved=cam.dist; cam.dist=Math.min(cam.dist,6.5); } HOOK.camBox={x0:C.x-RB+1, x1:C.x+RB-1, z0:C.z-RB+1, z1:C.z+RB-1, y1:FY[f]+FH-.8}; wasIn=true; }
    else if(wasIn){ wasIn=false; HOOK.camBox=null; if(saved) cam.dist=saved; } });

  const pl=at(ENT,RPAD-8); PLACES.push({icon:'🧠', name:'Đỉnh QA/QC Brain Citadel', sub:'Tháp Liên Hoa 6 tầng · cầu thang xoắn đôi ADN · khối não pha lê', go:()=>teleport(pl.x, pl.z, C.x, C.z)});
  const r0=ROAD[Math.floor(ROAD.length*.05)]; PLACES.push({icon:'🌊', name:'Đường đèo ngắm biển', sub:'Cầu cạn vượt sóng · 3 vòm đá · cầu kính cổng trời', go:()=>teleport(r0.x, r0.z, C.x, C.z)});
  if(cafes[5]) PLACES.push({icon:'☁️', name:'Phố săn mây', sub:'12 quán kiến trúc độc bản dọc đèo', go:()=>teleport(cafes[5].road[0], cafes[5].road[1], cafes[5].x, cafes[5].z)});
  PLACES.push({icon:'🛩️', name:'Sân bay Đỉnh Mây', sub:'Đường băng STOL · trực thăng', go:()=>teleport(860, 110, 900, 60)});
  PLACES.push({icon:'🎈', name:'Xích đu vực & Khinh khí cầu', sub:'Cảm giác mạnh trên đỉnh vực biển', go:()=>teleport(880, 250, 880, 290)});
  console.info(`[QC World V2] Brain Citadel: đường đèo ${ROAD.length} m · ${cafes.length} quán · tháp 6 tầng`);
  /* ---- Rà soát 16/11: mép sàn cao hơn đất bên cạnh 0,45–2,6 m (không leo lên được, không chui dưới được) → vách chặn chỉ có tác dụng với người đứng DƯỚI (y1 thấp hơn mặt sàn), để khỏi đi lọt vào khối nền đường / sàn sân bay ---- */
  { let nEdge=0; const MSG='⛰️ Mép nền cao – đi theo lối lên';
    const edgeRun=(list)=>{ let run=null; const flush=()=>{ if(run && run.n){ const [a,b]=run.n===1?[[run.x0-run.ux,run.z0-run.uz],[run.x0+run.ux,run.z0+run.uz]]:[[run.x0,run.z0],[run.x1,run.z1]]; addSeg(a[0],a[1],b[0],b[1],.2,run.lo-.5,run.hmin-.35,MSG); nEdge++; } run=null; };
      for(const e of list){ if(!e){ flush(); continue; } const g=W.groundAtY(e.gx,e.gz,e.h-.3), d=e.h-g; if(g>-50 && d>.45 && d<2.6){ if(!run) run={n:0,x0:e.x,z0:e.z,ux:e.ux,uz:e.uz,lo:g,hmin:e.h}; run.n++; run.x1=e.x; run.z1=e.z; run.lo=Math.min(run.lo,g); run.hmin=Math.min(run.hmin,e.h); if(run.n>=5){ const k={...e}; flush(); run={n:1,x0:k.x,z0:k.z,ux:k.ux,uz:k.uz,lo:g,hmin:e.h,x1:k.x,z1:k.z}; } } else flush(); } flush(); };
    for(const side of [-1,1]){ const L=[]; for(let i=0;i<ROAD.length-2;i+=2){ const q=ROAD[i]; if(q.kind==='glass'){ L.push(null); continue; } const o=ROADW/2+.2; L.push({x:q.x-q.uz*o*side, z:q.z+q.ux*o*side, gx:q.x-q.uz*(o+.8)*side, gz:q.z+q.ux*(o+.8)*side, h:q.h, ux:q.ux, uz:q.uz}); } edgeRun(L); }
    { const x0=820, x1=980, z0=50, z1=125, y=YT, L1=[], L2=[]; for(let x=x0;x<=x1;x+=2) L1.push({x, z:z1, gx:x, gz:z1+.8, h:y, ux:1, uz:0}); for(let z=z1-30;z<=z1;z+=2) L2.push({x:x1, z, gx:x1+.8, gz:z, h:y, ux:0, uz:1}); edgeRun(L1); edgeRun(L2); }
    if(nEdge) console.info('[Brain] vách chặn mép nền:', nEdge); }
  const API={C, FY, ROAD, cafes, GB, hAt, ride, G6};
  import('./bots_brain.js').then(m=>{ if(m && m.make) m.make(W, API); }).catch(()=>{});   /* Pha 9: bot sống động của vùng (file do phiên khác làm; chưa có thì bỏ qua) */
  return API;
}
