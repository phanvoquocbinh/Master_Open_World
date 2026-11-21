// QC World V2 – PHA 7: ĐỈNH NÚI TỐI THƯỢNG "QA/QC BRAIN CITADEL" & ĐƯỜNG ĐÈO NGẮM BIỂN (Bible Phần 4 + Module 3)
//  Vùng x 620→1150, z −100→450. Tâm đỉnh (880, 180), sân đỉnh phẳng r = 60 m ở y = +110. Vách đá dựng đứng phía Đông và Nam lao xuống biển.
//  • Đường đèo "Oceanfront Corniche" rộng 10 m: cầu nối từ CBD (580, 86) → 1,25 vòng quanh núi (y 4 → 100): đoạn cầu cạn vươn ra biển trên trụ tròn,
//    đoạn phố săn mây (12 quán kiến trúc khác nhau) + 3 vòm đá, cuối cùng Cầu Kính Cổng Trời bắc qua khe vực vào quảng trường đỉnh.
//  • Tháp Liên Hoa Thần Kinh: r = 28, giếng trời r = 10, 6 tầng (110 → 150, mỗi tầng 8 m), 8 cánh sen kính viền vàng, cầu thang xoắn đôi ADN,
//    2 thang máy kính, 3 vòng gyroscope vàng quay quanh khối não pha lê, chữ QA · QC · QE, 8 cột sáng đêm. Nội dung 6 tầng theo đặc tả.
//  • Sân bay Đỉnh Mây (phía Bắc) · Xích đu tử thần vượt vực + Khinh khí cầu (phía Nam).
import * as AK from './archKit.js';
import { makeLift } from './liftkit.js';
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
  /* 16/11 nâng cấp tháp Liên Hoa (prompt Bình): vật liệu mới */
  const MX={ champ:sm(0xd4af37,.2,.85,{emissive:0x8a6a10, emissiveIntensity:.15}), obsid:sm(0x111827,.12,.35), neon:new THREE.MeshStandardMaterial({color:0x00f0ff, emissive:0x00f0ff, emissiveIntensity:1.2}), pearl:sm(0xf4f1ea,.32,.08),
    sapph:new THREE.MeshPhysicalMaterial({color:0x0a2540, roughness:.08, metalness:.4, transparent:true, opacity:.58, depthWrite:false, side:THREE.DoubleSide, envMapIntensity:1.6}),
    petal:new THREE.MeshPhysicalMaterial({color:0xcfeaff, roughness:.04, metalness:.15, transparent:true, opacity:.34, depthWrite:false, side:THREE.DoubleSide, envMapIntensity:1.8}),
    pool:new THREE.MeshPhysicalMaterial({color:0x0284c7, roughness:.06, metalness:.25, clearcoat:1, clearcoatRoughness:.08, envMapIntensity:1.6}),
    jet:new THREE.MeshBasicMaterial({color:0xd8f4ff, transparent:true, opacity:.55, depthWrite:false, blending:THREE.AdditiveBlending}),
    cable:new THREE.MeshStandardMaterial({color:0xe8f6ff, metalness:.6, roughness:.3, emissive:0x9fe8ff, emissiveIntensity:.1}), marble:AK.makeStoneMaterial({col:'#f3f0ea', joint:'#d9d3c8', blockW:96, blockH:48, repeat:4}) };
  /* 16/11 "Royal Contrast" (prompt Bình): bớt trắng chìm vào trời – đồng đỏ, đen obsidian vân vàng, titan, sa thạch, gỗ lim */
  Object.assign(MX,{ bronze:sm(0x6e351c,.25,.75), obsGold:sm(0x1a2230,.2,.6), titan:sm(0x263040,.45,.55), sand:sm(0xb8925a,.72,.06), blackGold:sm(0x1c2430,.22,.55),
    cream:AK.makeStoneMaterial({col:'#cbb698', joint:'#a8937a', blockW:96, blockH:48, repeat:4}), redwood:AK.makeWoodMaterial({col:'#5c261a', repeat:1}), inner:AK.makeStoneMaterial({col:'#3a3530', joint:'#26221e', blockW:128, blockH:128, repeat:6}) });
  MX.petal.color.set(0x0d7490); MX.petal.opacity=.42; MX.petal.roughness=.05; MX.petal.metalness=.3;
  MX.cable.color.set(0x7a4a2a); MX.cable.emissive.set(0xffa860); MX.cable.metalness=.7; MX.cable.roughness=.35;
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
  { const K=5, src=spiral.map(p=>[p.x,p.z]); for(let i=6;i<spiral.length-6;i++){ let sx=0, sz=0, n=0; for(let k=-K;k<=K;k++){ const w=K+1-Math.abs(k); sx+=src[i+k][0]*w; sz+=src[i+k][1]*w; n+=w; } spiral[i].x=sx/n; spiral[i].z=sz/n; } }   /* S19g rà soát 16/11: làm mượt tuyến đèo (±10 m) – trước có khúc gãy bán kính ~2 m ở (1001, 302): mặt nhựa gập, lan can mép trong vắt chéo mặt đường */
  const S0=spiral[0], approach=[{x:570,z:86,h:2},{x:580,z:86,h:2},{x:600,z:90,h:2.5}];
  { const T=(()=>{ const b=spiral[4], l=Math.hypot(b.x-S0.x,b.z-S0.z)||1; return [(b.x-S0.x)/l, (b.z-S0.z)/l]; })(), D=[.981,.196], P0=[600,90], C1=[P0[0]+D[0]*15, P0[1]+D[1]*15], C2=[S0.x-T[0]*18, S0.z-T[1]*18];
    for(let k=1;k<=14;k++){ const t=k/14, u=1-t, f=(i)=>u*u*u*P0[i]+3*u*u*t*C1[i]+3*u*t*t*C2[i]+t*t*t*(i?S0.z:S0.x); approach.push({x:f(0), z:f(1), h:lerp(2.5,4,t)}); } }   /* S19g rà soát 16/11: khúc nối đường dẫn → đường đèo trước gãy ~87° bán kính 0 (mặt nhựa gập chồng, chân lún 20–33 cm) → cong mượt, vào đèo đúng tiếp tuyến */
  pushPts(approach,'approach'); pushPts(spiral,'corniche');
  const SE=spiral[spiral.length-1], aE=Math.atan2(SE.z-C.z, SE.x-C.x), bridgeEnd={x:C.x+Math.cos(aE)*(RPAD-1), z:C.z+Math.sin(aE)*(RPAD-1), h:YT};
  const GB={a:{x:SE.x,z:SE.z,h:YEND}, b:bridgeEnd}; pushPts([GB.a,GB.b],'glass');
  ROAD.forEach((q,i)=>{ const gq=q.kind==='glass'; let ia=Math.max(0,i-2), ib=Math.min(ROAD.length-1,i+2); while(ia<i && (ROAD[ia].kind==='glass')!==gq) ia++; while(ib>i && (ROAD[ib].kind==='glass')!==gq) ib--;   /* S19g 16/11: hướng không trộn qua ranh đường ↔ cầu kính (trước mặt cắt cuối đèo xoay 33° → dải nhựa gập ở góc lên cầu kính, lún 0,27 m) */
    const a=ROAD[ia], b=ROAD[ib], l=Math.hypot(b.x-a.x,b.z-a.z)||1; q.ux=(b.x-a.x)/l; q.uz=(b.z-a.z)/l; q.i=i; });
  const LASTC=ROAD.findIndex(q=>q.kind==='glass')-1;   /* mẫu cuối của đường đèo (trước cầu kính) */
  const GRID=new Map(), gk=(x,z)=>(Math.floor(x/8))+','+(Math.floor(z/8)); ROAD.forEach((q,i)=>{ const k=gk(q.x,q.z); if(!GRID.has(k)) GRID.set(k,[]); GRID.get(k).push(i); });
  function nearRoad(x,z,maxD=24){ let bd=maxD*maxD, best=null; const cx=Math.floor(x/8), cz=Math.floor(z/8), rr=Math.ceil(maxD/8); for(let a=-rr;a<=rr;a++) for(let b=-rr;b<=rr;b++){ const l=GRID.get((cx+a)+','+(cz+b)); if(!l) continue; for(const i of l){ const q=ROAD[i], d=(q.x-x)**2+(q.z-z)**2; if(d<bd){ bd=d; best=q; } } } return best?{q:best, d:Math.sqrt(bd)}:null; }
  const natural=(x,z)=>{ const d=Math.hypot(x-C.x,z-C.z), a=Math.atan2(z-C.z,x-C.x); let h=prof(d,a); if(d>RPAD+4 && h>2) h+=(vn(x*.035,z*.035)-.5)*7*ss(RPAD+4,RPAD+30,d)*Math.min(1,h/20); return h; };
  const onDeck=q=>q.kind==='glass' || natural(q.x,q.z)<q.h-1.5;
  function hf(x,z){ let h=natural(x,z); const n=nearRoad(x,z); if(n){ const q=n.q, half=ROADW/2+.6;
      if(q.kind==='glass'){ const t=((x-GB.a.x)*(GB.b.x-GB.a.x)+(z-GB.a.z)*(GB.b.z-GB.a.z))/((GB.b.x-GB.a.x)**2+(GB.b.z-GB.a.z)**2); if(t>.08 && t<.9 && n.d<16) h=Math.min(h, q.h-42+n.d*1.2); else if(t<=.08 && n.d<half){ let bh=q.h, bd=1e9; for(let k=Math.max(0,LASTC-15);k<=LASTC;k++){ const r=ROAD[k], d=(r.x-x)**2+(r.z-z)**2; if(d<bd){ bd=d; bh=r.h; } } h=Math.min(q.h, bh); } }   /* S19g: chân cầu kính (cuối đèo) phẳng bằng mặt đường đèo gần nhất – trước vách lấn / nền cao hơn đường làm mép trái dải nhựa vểnh lên (lún tới 0,27 m) */
      else if(!onDeck(q)){ if(n.d<half) h=q.h; else if(n.d<half+12) h=lerp(q.h, h, ss(half, half+12, n.d)); }
      else if(n.d<half+2.5 && h>q.h-.35) h=q.h-.35; }   /* S19g rà soát 16/11: đoạn cầu cạn sát vách – đá không còn lòi lên mặt cầu (trước người đi mép cầu bị nhấc lên vách tới 24 m) */
    if(Math.hypot(x-C.x,z-C.z)<RPAD+.5) h=YT; return h; }
  const X0=620, X1=1150, Z0=-100, Z1=450, RES=2, NX=Math.round((X1-X0)/RES)+1, NZ=Math.round((Z1-Z0)/RES)+1, H=new Float32Array(NX*NZ);
  for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++) H[j*NX+i]=hf(X0+i*RES, Z0+j*RES);
  const hAt=(x,z)=>{ const fx=(x-X0)/RES, fz=(z-Z0)/RES; if(fx<0||fz<0||fx>=NX-1||fz>=NZ-1) return null; const i=Math.floor(fx), j=Math.floor(fz), tx=fx-i, tz=fz-j, a=H[j*NX+i], b=H[j*NX+i+1], c=H[(j+1)*NX+i], d=H[(j+1)*NX+i+1];
    const h=tx+tz<=1 ? a+(b-a)*tx+(c-a)*tz : d+(c-d)*(1-tx)+(b-d)*(1-tz); return h<-.6 ? null : h; };
  const EXT={x0:X0, x1:X1-RES, z0:Z0, z1:Z1-RES, h:hAt, name:'ĐỈNH QA/QC BRAIN CITADEL'}; EXTL.push(EXT);   /* S19g: EXT.h được thay bên dưới (mặt đi đường đèo = mặt nhựa vẽ) */
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
  const RY=[];   /* cao độ mép trái/phải mặt nhựa vẽ theo chỉ số ROAD (dùng làm mặt đi) */
  { const pts=ROAD.filter(q=>q.kind!=='glass'), pos=[], uv=[], idx=[]; let s=0;
    for(let i=0;i<pts.length;i++){ const q=pts[i]; if(i) s+=Math.hypot(q.x-pts[i-1].x,q.z-pts[i-1].z); const nx=-q.uz, nz=q.ux; for(const side of [-1,1]){ const x=q.x+nx*ROADW/2*side, z=q.z+nz*ROADW/2*side, y=onDeck(q)?q.h+.05:Math.max(q.h,(hAt(x,z)??q.h))+.05; pos.push(x,y,z); (RY[q.i]||(RY[q.i]=[0,0]))[side<0?0:1]=y; uv.push(side<0?0:1, s/14); }
      if(i){ const k=i*2; idx.push(k-2,k-1,k, k-1,k+1,k); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); const m=new THREE.Mesh(g, roadMat); m.receiveShadow=true; m.userData.dynamic=true; m.userData.noFar=true; grp.add(m); }
  const DECK=ROAD.map(q=>onDeck(q)), inExt=q=>q.x>X0+8 && q.x<X1-RES-8 && q.z>Z0+8 && q.z<Z1-RES-8;
  const near7=(x,z,R)=>{ const out=[], cx=Math.floor(x/8), cz=Math.floor(z/8), rr=Math.ceil(R/8); for(let a=-rr;a<=rr;a++) for(let b=-rr;b<=rr;b++){ const l=GRID.get((cx+a)+','+(cz+b)); if(l) for(const i of l){ const q=ROAD[i]; if(q.kind!=='glass' && (q.x-x)**2+(q.z-z)**2<R*R) out.push(q); } } return out; };
  /* 2 vòng đèo sát nhau trên mặt bằng (lệch cao) → một hàm độ cao không tả nổi cả 2 → đoạn đó dùng tấm sàn (tính theo độ cao chân) */
  const STACK=ROAD.map(q=>q.kind!=='glass' && near7(q.x,q.z,ROADW+1.5).some(r=>Math.abs(r.i-q.i)>25 && Math.abs(r.h-q.h)>1.2));
  /* S19g rà soát 16/11: mặt đi trên đường đèo (đoạn nền đất) = đúng mặt nhựa vẽ: nội suy 2 mép theo dọc + ngang tuyến */
  const roadWalk=(x,z)=>{ const cand=near7(x,z,7); let q=null, bd=1e9; for(const r of cand){ const d=(r.x-x)**2+(r.z-z)**2; if(d<bd){ bd=d; q=r; } } if(!q || DECK[q.i] || STACK[q.i]) return null; let best=null;   /* gần nhất trong các điểm KHÔNG phải cầu kính (cuối đèo nối cầu kính) */
    for(const j of [q.i-1, q.i]){ const a=ROAD[j], b=ROAD[j+1]; if(!a || !b || DECK[j] || !RY[j] || !RY[j+1]) continue; const ex=b.x-a.x, ez=b.z-a.z, L2=ex*ex+ez*ez||1e-9, t=((x-a.x)*ex+(z-a.z)*ez)/L2, tc=t<0?0:t>1?1:t; if(Math.abs(t-tc)*Math.sqrt(L2)>1) continue;   /* cuối dải nhựa (nối cầu kính): cho vượt đầu đoạn 1 m */
      const nx=-(a.uz+(b.uz-a.uz)*tc), nz=a.ux+(b.ux-a.ux)*tc, nl=Math.hypot(nx,nz)||1, o=((x-a.x-ex*tc)*nx+(z-a.z-ez*tc)*nz)/nl; if(Math.abs(o)>ROADW/2) continue;
      const u=o/ROADW+.5, y=lerp(lerp(RY[j][0],RY[j][1],u), lerp(RY[j+1][0],RY[j+1][1],u), tc); best=best==null?y:Math.max(best,y); }
    return best; };
  EXT.h=(x,z)=>{ const h=hAt(x,z), r=roadWalk(x,z); return r==null ? h : h==null ? r : Math.max(h, r); };
  const k1=Kit(), lampPts=[], railMask=new Set();
  for(let i=0;i<ROAD.length-1;i+=2){ const q=ROAD[i], nx=-q.uz, nz=q.ux, deck=onDeck(q), yaw=Math.atan2(q.ux,q.uz);
    for(const j of [i, i+1]){ const r=ROAD[j]; if(!r || r.kind==='glass' || (!DECK[j] && !STACK[j] && inExt(r))) continue;   /* S19g rà soát 16/11: đoạn nền đất → mặt đi lấy từ EXT.h (đúng mặt nhựa vẽ, kể cả mép nâng / dốc); cầu cạn: tấm mỗi 1 m (trước 2 m → chân lún 5–17 cm ở đoạn dốc/cong) */
      addPlat(r.x, r.z, Math.atan2(r.ux,r.uz), ROADW/2+.2, .62, RY[j] ? (RY[j][0]+RY[j][1])/2-.005 : r.h+.045);
      const r2=ROAD[j+1]; if(r2 && r2.kind!=='glass' && RY[j] && RY[j+1]) for(const u of [.1,.3,.5,.7,.9]){   /* khúc gấp: mép ngoài quét rộng hơn tấm → lấp hình nêm giữa 2 mặt cắt */
        const o=(u-.5)*ROADW, ax=r.x-r.uz*o, az=r.z+r.ux*o, bx=r2.x-r2.uz*o, bz=r2.z+r2.ux*o, L=Math.hypot(bx-ax,bz-az); if(L<1.1) continue;
        addPlat((ax+bx)/2, (az+bz)/2, Math.atan2(bx-ax,bz-az), 1.15, L/2+.15, (lerp(RY[j][0],RY[j][1],u)+lerp(RY[j+1][0],RY[j+1][1],u))/2-.005); } }
    if(deck && q.kind!=='glass'){ k1.add(new THREE.BoxGeometry(ROADW+.8,.7,2.05), M.concrete, q.x, q.h-.38, q.z, 0, yaw, 0);
      if(i%14===0){ const g0=(hAt(q.x,q.z)??SEA); const hh=q.h-.7-Math.min(g0,SEA+1)+2; k1.add(new THREE.CylinderGeometry(.9,1.1,hh,14), M.concrete, q.x, q.h-.7-hh/2, q.z); circles.push({x:q.x, z:q.z, r:1.1, y0:-20, y1:q.h-1}); } }
    for(const side of [-1,1]){ const ox=nx*(ROADW/2+.15)*side, oz=nz*(ROADW/2+.15)*side; const outer=((q.x+ox-C.x)**2+(q.z+oz-C.z)**2)>((q.x-C.x)**2+(q.z-C.z)**2);
      const gx=q.x+nx*(ROADW/2+1.6)*side, gz=q.z+nz*(ROADW/2+1.6)*side, gEdge=hAt(gx,gz), gNear=hAt(q.x+nx*(ROADW/2+.6)*side, q.z+nz*(ROADW/2+.6)*side); const drop=gEdge==null || gEdge<q.h-1.0 || gNear==null || gNear<q.h-1.0;   /* dò thêm sát mép 0,6 m: vai đường hẹp ~1,6 m rồi tới vực (đoạn cuối đèo) cũng có lan can */   /* cạnh nào có hụt (vực, khe giữa vách và cầu cạn) thì có lan can */
      if(q.kind==='glass' || deck || outer || drop) railMask.add(i+':'+side); }
    if(i%26===0 && q.kind!=='glass'){ const side=(i/26)%2?1:-1; lampPts.push([q.x+nx*(ROADW/2+.7)*side, q.h, q.z+nz*(ROADW/2+.7)*side]); } }
  { const A=GB.a, B=GB.b, L=Math.hypot(B.x-A.x,B.z-A.z), yaw=Math.atan2(B.x-A.x,B.z-A.z), n=Math.ceil(L/.5);   /* S19g 16/11: tấm 0,5 m (trước 2 m → bậc 0,43 m trên mặt kính dốc, chân lún/nổi ±0,2 m) */
    for(let i=0;i<n;i++){ const t=(i+.5)/n, x=lerp(A.x,B.x,t), z=lerp(A.z,B.z,t), y=lerp(A.h,B.h,t); addPlat(x,z,yaw,ROADW/2,L/n/2+.03,y); }
    const mid={x:(A.x+B.x)/2, z:(A.z+B.z)/2, y:(A.h+B.h)/2}, tilt=Math.atan2(B.h-A.h,L);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(ROADW,.12,L), new THREE.MeshPhysicalMaterial({color:0xcfefff, roughness:.03, transparent:true, opacity:.42, depthWrite:false})); deck.position.set(mid.x,mid.y-.04,mid.z); deck.rotation.set(-tilt,yaw,0,'YXZ'); grp.add(deck);
    for(const s of [-1,1]){ const ox=Math.cos(yaw)*(ROADW/2+.2)*s, oz=-Math.sin(yaw)*(ROADW/2+.2)*s; k1.add(new THREE.BoxGeometry(.5,.6,L), M.steel, mid.x+ox, mid.y-.35, mid.z+oz, -tilt, yaw, 0);
      for(let k=1;k<8;k++){ const t=k/8, x=lerp(A.x,B.x,t)+ox, z=lerp(A.z,B.z,t)+oz, y=lerp(A.h,B.h,t), e=t<.5?A:B, top=new THREE.Vector3(e.x, e.h+27, e.z), bot=new THREE.Vector3(x,y,z), d=top.clone().sub(bot);
        const cab=new THREE.CylinderGeometry(.06,.06,d.length(),5); cab.translate(0,d.length()/2,0); cab.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), d.clone().normalize())); cab.translate(x,y,z); k1.add(cab, MX.cable); } }
    /* trụ tháp chữ A vát cạnh 28 m (titan xám đen + nẹp vàng kim), chân đế đá; cáp hội tụ về đỉnh chữ A */
    const legBetween=(p0,p1,r0,r1,mat)=>{ const d=p1.clone().sub(p0), g=new THREE.CylinderGeometry(r1,r0,d.length(),8); g.translate(0,d.length()/2,0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), d.clone().normalize())); g.translate(p0.x,p0.y,p0.z); k1.add(g, mat); };
    for(const e of [A,B]){ const lx=Math.cos(yaw), lz=-Math.sin(yaw), ap=new THREE.Vector3(e.x, e.h+28, e.z);
      for(const s of [-1,1]){ const f=new THREE.Vector3(e.x+lx*(ROADW/2+.95)*s, e.h-.6, e.z+lz*(ROADW/2+.95)*s); legBetween(f, ap, .75, .32, MX.titan);
        for(const k of [.22,.5,.78]){ const q=f.clone().lerp(ap,k); k1.add(new THREE.TorusGeometry(.75-.43*k+.04,.07,6,16), MX.champ, q.x, q.y, q.z, Math.PI/2, 0, 0); }
        k1.add(AK.roundedBox(2.2,1.6,2.2,.15,2), M.rock, f.x, f.y+.2, f.z, 0, yaw, 0); circles.push({x:f.x, z:f.z, r:1.1}); }
      const tie=new THREE.Vector3(e.x, e.h+11, e.z); k1.add(AK.roundedBox(ROADW*.62,.8,.8,.12,2), MX.titan, tie.x, tie.y, tie.z, 0, yaw, 0); k1.add(new THREE.BoxGeometry(ROADW*.64,.12,.86), MX.champ, tie.x, tie.y+.34, tie.z, 0, yaw, 0);
      k1.add(new THREE.ConeGeometry(.7,2.4,8), MX.champ, ap.x, ap.y+1.1, ap.z); }
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
    { const m=pts[Math.round(last*.4)]; makeLabel('🌉 Cầu G6 · Brain ↔ Dev City', 'Đi bộ / lái xe sang Dev City', {h:.5, x:m.x, y:m.h+5, z:m.z, fade:110}); }
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
    ['🗼','Café Hải Đăng',[['🥤 Trà sữa biển muối',30,'Mặn ngọt'],['🍪 Bánh quy',20,'Giòn tan']]],
    ['🧊','Khối Kính Ngắm Mây',[['🍹 Soda chanh dây',30,'Mát lạnh'],['🍰 Bánh phô mai',40,'Béo mịn']]],
    ['🏠','Nhà Gỗ Chữ A',[['🍲 Lẩu nấm rừng',90,'Nóng hổi'],['🌽 Bắp nướng',20,'Thơm']]],
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
  const RF=[26,23.2,21,23.5,26.2,29], RB=29, RA=10, FH=8, FY=[110,118,126,134,142,150], ENT=Math.atan2(GB.b.z-C.z, GB.b.x-C.x), DOORS=[ENT, ENT+Math.PI/2, ENT+Math.PI, ENT-Math.PI/2];
  const dAng=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
  const Rof=y=>{ if(y<=FY[0]) return RF[0]; for(let f=0;f<5;f++) if(y<=FY[f+1]){ const k=(y-FY[f])/FH; return RF[f]+(RF[f+1]-RF[f])*(k*k*(3-2*k)); } return RF[5]; };   /* dáng đồng hồ cát mềm */
  for(let k=0;k<4;k++) DOORS.push(ENT+Math.PI/4+k*Math.PI/2);   /* 8 cửa ↔ 8 cầu qua hồ */
  const kt=Kit();
  /* ---- khối đế: sàn trệt trong tháp + Hồ Vô Cực Sen bát giác (26,6 → 38 m) + 8 cầu cẩm thạch + quảng trường + lan can đá viền ---- */
  const RBLx=RPAD-.7, POOL0=26.6, POOLA=38, oct=k=>ENT+Math.PI/8+k*Math.PI/4, octR=POOLA/Math.cos(Math.PI/8);
  { const d=new THREE.Mesh(new THREE.CircleGeometry(RF[0]+.05,96), MX.inner); d.rotation.x=-Math.PI/2; d.position.set(C.x,YT+.04,C.z); d.receiveShadow=true; grp.add(d);
    const sh=new THREE.Shape(); for(let i=0;i<=96;i++){ const a=i/96*TAU; if(i) sh.lineTo(Math.cos(a)*(RPAD+.3),-Math.sin(a)*(RPAD+.3)); else sh.moveTo(RPAD+.3,0); }
    const hole=new THREE.Path(); for(let k=0;k<=8;k++){ const a=oct(k%8); if(k) hole.lineTo(Math.cos(a)*octR,-Math.sin(a)*octR); else hole.moveTo(Math.cos(a)*octR,-Math.sin(a)*octR); } sh.holes.push(hole);
    const pg=new THREE.ShapeGeometry(sh,64); pg.rotateX(-Math.PI/2);
    /* mặt sân Đá Bazan Trầm + Gạch Nung Hoàng Gia: vẽ 2048² theo toạ độ cực – mạch gạch đồng tâm/hướng tâm, viền bát giác, 16 tia la bàn terracotta/sa thạch viền vàng */
    const Rm=RPAD+.3, plazaMat=(()=>{ const S=2048, k=S/(2*Rm), cx=S/2, c=document.createElement('canvas'); c.width=c.height=S; const g=c.getContext('2d'), RG=AK.rng(7071), PT2=(a,r)=>[cx+Math.cos(a)*r*k, cx+Math.sin(a)*r*k];
      g.fillStyle='#222b38'; g.fillRect(0,0,S,S); g.strokeStyle='#141a23'; g.lineWidth=2;
      for(let r=36.5; r<Rm; r+=1.5){ const n=Math.max(24, Math.round(TAU*r/1.6)), off=(r*7.3)%1*TAU/n; for(let i=0;i<n;i++){ const a0=off+i/n*TAU, a1=off+(i+1)/n*TAU, v=RG(); g.fillStyle=`rgb(${29+v*11|0},${38+v*12|0},${50+v*13|0})`; g.beginPath(); g.arc(cx,cx,(r+1.5)*k,a0,a1); g.arc(cx,cx,r*k,a1,a0,true); g.closePath(); g.fill(); g.stroke(); } }
      const octPath=(ap)=>{ const vr=ap/Math.cos(Math.PI/8); g.beginPath(); for(let j=0;j<=8;j++){ const [x,y]=PT2(oct(j%8),vr); j?g.lineTo(x,y):g.moveTo(x,y); } g.closePath(); };
      octPath(POOLA+2.2); g.fillStyle='#8f3f29'; g.fill(); octPath(POOLA+1.0); g.fillStyle='#b8925a'; g.fill(); octPath(POOLA+.3); g.fillStyle='#222b38'; g.fill();
      g.strokeStyle='#d4af37'; g.lineWidth=5; for(const ap of [POOLA+.3, POOLA+1.0, POOLA+2.2]){ octPath(ap); g.stroke(); }
      { const r0=52.6, r1=53.8, n=48; for(let i=0;i<n;i++){ const a0=i/n*TAU, a1=(i+1)/n*TAU; g.fillStyle=i%2?'#8f3f29':'#b8925a'; g.beginPath(); g.arc(cx,cx,r1*k,a0,a1); g.arc(cx,cx,r0*k,a1,a0,true); g.closePath(); g.fill(); }
        g.strokeStyle='#d4af37'; g.lineWidth=5; for(const r of [r0,r1]){ g.beginPath(); g.arc(cx,cx,r*k,0,TAU); g.stroke(); } }
      for(let j=0;j<16;j++){ const a=ENT+j*Math.PI/8, main=j%2===0, r0=(main?POOLA:POOLA/Math.cos(Math.PI/8))+2.3, r1=main?RBLx-1.4:RBLx-6.5, hw=main?2.3:1.7, tx=-Math.sin(a), tz=Math.cos(a);
        const b0=[cx+(Math.cos(a)*r0+tx*hw)*k, cx+(Math.sin(a)*r0+tz*hw)*k], b1=[cx+(Math.cos(a)*r0-tx*hw)*k, cx+(Math.sin(a)*r0-tz*hw)*k], ax=PT2(a,r0), tip=PT2(a,r1);
        for(const [side,col] of [[b0, main?'#8f3f29':'#b8925a'],[b1, main?'#6e2f1e':'#93723f']]){ g.fillStyle=col; g.beginPath(); g.moveTo(...ax); g.lineTo(...side); g.lineTo(...tip); g.closePath(); g.fill(); }
        g.strokeStyle='#d4af37'; g.lineWidth=4; g.beginPath(); g.moveTo(...b0); g.lineTo(...tip); g.lineTo(...b1); g.lineTo(...b0); g.moveTo(...ax); g.lineTo(...tip); g.stroke(); }
      g.strokeStyle='#d4af37'; g.lineWidth=6; g.beginPath(); g.arc(cx,cx,(RBLx-.9)*k,0,TAU); g.stroke();
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return new THREE.MeshStandardMaterial({map:t, roughness:.75, metalness:.05}); })();
    { const pa=pg.attributes.position, uv=new Float32Array(pa.count*2); for(let i=0;i<pa.count;i++){ uv[i*2]=pa.getX(i)/(2*Rm)+.5; uv[i*2+1]=.5-pa.getZ(i)/(2*Rm); } pg.setAttribute('uv',new THREE.BufferAttribute(uv,2)); }
    const pl=new THREE.Mesh(pg, plazaMat); pl.position.set(C.x,YT+.04,C.z); pl.receiveShadow=true; grp.add(pl);
    const wsh=new THREE.Shape(); for(let k=0;k<=8;k++){ const a=oct(k%8); if(k) wsh.lineTo(Math.cos(a)*octR,-Math.sin(a)*octR); else wsh.moveTo(Math.cos(a)*octR,-Math.sin(a)*octR); } const wh=new THREE.Path(); for(let i=0;i<=96;i++){ const a=i/96*TAU; if(i) wh.lineTo(Math.cos(a)*POOL0,-Math.sin(a)*POOL0); else wh.moveTo(POOL0,0); } wsh.holes.push(wh);
    const wg=new THREE.ShapeGeometry(wsh,48); wg.rotateX(-Math.PI/2); const water=new THREE.Mesh(wg, MX.pool); water.position.set(C.x,YT+.12,C.z); water.receiveShadow=true; grp.add(water);
    for(let k=0;k<8;k++){ const p0=at(oct(k),octR+.35), p1=at(oct(k+1),octR+.35), L=p0.distanceTo(p1)+.6, m=p0.clone().add(p1).multiplyScalar(.5); kt.add(AK.roundedBox(L,.46,.7,.08,1), MX.sand, m.x, YT+.23, m.z, 0, Math.atan2(p1.x-p0.x,p1.z-p0.z)+Math.PI/2, 0); }
    { const cr=new THREE.RingGeometry(RF[0]+.05,POOL0+.05,96,1); cr.rotateX(-Math.PI/2); kt.add(cr, MX.sand, C.x, YT+.2, C.z); kt.add(new THREE.CylinderGeometry(POOL0+.05,POOL0+.05,.2,96,1,true), MX.sand, C.x, YT+.1, C.z); }
    /* 8 cầu đá uốn vòm qua hồ (Royal Contrast): thân sa thạch vòm, bậc gỗ lim đỏ trầm, lan can trụ vàng kim theo vòm – mặt đi là chuỗi plat nhỏ (mỗi bậc ≤ 0,15 m) */
    for(const a of DOORS){ const yo=yawOut(a), r0=RF[0]-.1, r1=POOLA+1.1, L=r1-r0, mid=at(a,(r0+r1)/2), RISE=.85, NB=18, top=t=>.2+RISE*Math.sin(Math.PI*t), lx=Math.cos(yo), lz=-Math.sin(yo);
      const sh2=new THREE.Shape(); for(let i=0;i<=24;i++){ const t=i/24; if(i) sh2.lineTo(-L/2+L*t, top(t)); else sh2.moveTo(-L/2, top(0)); } for(let i=24;i>=0;i--){ const t=i/24; sh2.lineTo(-L/2+L*t, top(t)-.42-.55*(1-Math.sin(Math.PI*t))); }
      const body=new THREE.ExtrudeGeometry(sh2,{depth:3.7, bevelEnabled:false, curveSegments:2}); body.translate(0,0,-1.85); body.rotateY(-Math.PI/2); kt.add(body, MX.sand, mid.x, YT, mid.z, 0, yo, 0);
      for(let i=0;i<NB;i++){ const t=(i+.5)/NB, q=at(a,r0+L*t), y=top(t), tilt=Math.atan(RISE*Math.PI*Math.cos(Math.PI*t)/L); kt.add(new THREE.BoxGeometry(3.3,.06,L/NB-.05), MX.redwood, q.x, YT+y+.03, q.z, -tilt, yo, 0); addPlat(q.x,q.z,yo,1.85,L/NB/2+.03,YT+y+.06); }
      for(const sd of [-1,1]){ const rail=[], low=[]; for(let i=0;i<=10;i++){ const t=.04+.92*i/10, q=at(a,r0+L*t), y=YT+top(t), x=q.x+lx*1.72*sd, z=q.z+lz*1.72*sd; kt.add(new THREE.CylinderGeometry(.05,.06,1.0,8), MX.champ, x, y+.5, z); if(i%5===0) kt.add(new THREE.SphereGeometry(.1,10,8), MX.champ, x, y+1.06, z); rail.push(new THREE.Vector3(x,y+1.0,z)); low.push(new THREE.Vector3(x,y+.35,z)); }
        kt.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rail),40,.055,6,false), MX.champ); kt.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(low),40,.03,5,false), MX.champ);
        const pa=at(a,r0+.6), pb=at(a,r1-.4); addSeg(pa.x+lx*1.85*sd,pa.z+lz*1.85*sd,pb.x+lx*1.85*sd,pb.z+lz*1.85*sd,.12,YT-.3,YT+2.6,'🌊 Lan can cầu đá qua Hồ Vô Cực Sen'); } }
    /* va chạm mép hồ: vòng trong + cạnh bát giác ngoài, hở đúng 8 cầu */
    { const n=192; for(let i=0;i<n;i++){ const a=i/n*TAU, b=(i+1)/n*TAU; if(DOORS.some(d=>dAng(a,d)<2.2/POOL0 || dAng(b,d)<2.2/POOL0)) continue; const p=at(a,POOL0+.1), q=at(b,POOL0+.1); addSeg(p.x,p.z,q.x,q.z,.12,YT-.5,YT+1.6,'🌊 Hồ Vô Cực Sen – đi qua cầu đá'); } }
    for(let k=0;k<8;k++){ const v0=at(oct(k),octR+.1), v1=at(oct(k+1),octR+.1), N=12; for(let i=0;i<N;i++){ const p=v0.clone().lerp(v1,i/N), q=v0.clone().lerp(v1,(i+1)/N), am=Math.atan2((p.z+q.z)/2-C.z,(p.x+q.x)/2-C.x);
        if(DOORS.some(d=>dAng(am,d)<2.3/POOLA)) continue; addSeg(p.x,p.z,q.x,q.z,.15,YT-.5,YT+1.6,'🌊 Hồ Vô Cực Sen – đi qua cầu đá'); } }
    /* 16 vòi phun cong vào chân cánh sen */
    { const parts=[]; for(let k=0;k<8;k++) for(const sd of [-1,1]){ const a=oct(k)+sd*.07, p0=at(a,POOLA-1.2,YT+.35), p2=at(oct(k),POOL0+1.6,YT+.6), p1=p0.clone().lerp(p2,.5); p1.y=YT+4.2; parts.push(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(p0,p1,p2),20,.09,6,false)); kt.add(new THREE.CylinderGeometry(.14,.2,.4,8), MX.champ, p0.x, YT+.25, p0.z); }
      const jm=new THREE.Mesh(mergeGeometries(parts,false), MX.jet); jm.userData.dynamic=true; grp.add(jm); }
    /* lan can đá cẩm thạch viền quảng trường (1,1 m) + 24 trụ đèn pha lê vàng + 16 bồn cây – hở lối: đèo, sân bay, xích đu, khinh khí cầu */
    const RBL=RPAD-.7, gapA=[aE, Math.atan2(265-C.z,880-C.x), Math.atan2(250-C.z,925-C.x)], isGap=a=>gapA.some(g=>dAng(a,g)<.11) || (Math.sin(a)<-.8);
    { const n=160; for(let i=0;i<n;i++){ const a=i/n*TAU, b=(i+1)/n*TAU; if(isGap(a) || isGap(b)) continue; const p=at(a,RBL), q=at(b,RBL), L=p.distanceTo(q)+.05, m=p.clone().add(q).multiplyScalar(.5), yo=Math.atan2(q.x-p.x,q.z-p.z)+Math.PI/2;
        kt.add(new THREE.BoxGeometry(L,.85,.34), MX.cream, m.x, YT+.47, m.z, 0, yo, 0); kt.add(new THREE.BoxGeometry(L,.12,.46), MX.blackGold, m.x, YT+.96, m.z, 0, yo, 0); kt.add(new THREE.BoxGeometry(L,.03,.47), MX.champ, m.x, YT+1.035, m.z, 0, yo, 0); addSeg(p.x,p.z,q.x,q.z,.2,YT-1.5,YT+1.6,'🏛️ Lan can quảng trường – lối ra ở 4 phía có đường'); } }
    { const lampM=new THREE.MeshStandardMaterial({color:0xfff3c4, emissive:0xffd77a, emissiveIntensity:1.1, roughness:.1}); let lamps=0; for(let i=0;i<48 && lamps<24;i+=2){ const a=i/48*TAU+.03; if(isGap(a)) continue; const p=at(a,RBL-.5); kt.add(new THREE.CylinderGeometry(.11,.16,3.4,10), MX.champ, p.x, YT+1.7, p.z); kt.add(new THREE.OctahedronGeometry(.42,0), lampM, p.x, YT+3.75, p.z); circles.push({x:p.x,z:p.z,r:.3}); if(GLOW && lamps%2===0) GLOW.add(p.x,YT+3.8,p.z,2.2,0xffd77a,1); lamps++; } }
    { const lotusM=sm(0xf3a6c4,.6); let pots=0; for(let i=1;i<48 && pots<16;i+=3){ const a=i/48*TAU+.05; if(isGap(a)) continue; const p=at(a,RBL-1.6); kt.add(new THREE.CylinderGeometry(.85,.6,.8,16), MX.bronze, p.x, YT+.4, p.z); kt.add(new THREE.TorusGeometry(.85,.06,6,24), MX.champ, p.x, YT+.8, p.z, Math.PI/2,0,0);
        if(pots%2===0){ kt.add(new THREE.ConeGeometry(.7,2.6,10), sm(0x2f5a2c,.9), p.x, YT+2.1, p.z); kt.add(new THREE.ConeGeometry(.5,1.6,10), sm(0x37683a,.9), p.x, YT+3.2, p.z); }
        else for(let j=0;j<8;j++){ const pa=j/8*TAU; kt.add(new THREE.SphereGeometry(.32,8,6,0,TAU,0,Math.PI/2), lotusM, p.x+Math.cos(pa)*.35, YT+.9, p.z+Math.sin(pa)*.35, -.5*Math.sin(pa), 0, .5*Math.cos(pa)); }
        circles.push({x:p.x,z:p.z,r:1}); pots++; } }
    /* 8 tiểu cảnh vườn thiền (Royal Contrast): bồn cẩm thạch đen 2 bậc 6 × 3,5 m viền vàng, sỏi trắng, 2 đá cảnh, đèn lồng đá; 4 phong đỏ xen 4 ngân hạnh vàng 5,5–7 m */
    { const RG=AK.rng(4242), blackM=sm(0x161b22,.18,.35), gravel=sm(0xe9e4d8,.95), rockM=sm(0x5f646c,.85,0,{flatShading:true}), lantM=sm(0x8f8a80,.9), glowM=new THREE.MeshStandardMaterial({color:0xffe1a0, emissive:0xffc060, emissiveIntensity:1.3}), barkM=sm(0x3b2618,.9);
      const leafM=[[0x9e1b1b,0xc92a2a,0x7f1414],[0xd48817,0xeab308,0xc27a10]].map(l=>l.map(c=>sm(c,.8,0,{flatShading:true})));
      for(let k=0;k<8;k++){ const a=oct(k), yo=yawOut(a), p=at(a,48), tx=Math.cos(yo), tz=-Math.sin(yo), A=(u,v)=>[p.x+tx*u+Math.cos(a)*v, p.z+tz*u+Math.sin(a)*v], Y=YT+.69;
        kt.add(AK.roundedBox(6,.35,3.5,.06,1), blackM, p.x, YT+.175, p.z, 0, yo, 0); kt.add(AK.roundedBox(5.1,.32,2.7,.06,1), blackM, p.x, YT+.51, p.z, 0, yo, 0);
        for(const [w,d,y] of [[6.02,3.52,.35],[5.12,2.72,.67]]){ for(const sv of [-1,1]){ const [x1,z1]=A(0,sv*d/2); kt.add(new THREE.BoxGeometry(w,.05,.07), MX.champ, x1, YT+y, z1, 0, yo, 0); const [x2,z2]=A(sv*w/2,0); kt.add(new THREE.BoxGeometry(.07,.05,d), MX.champ, x2, YT+y, z2, 0, yo, 0); } }
        kt.add(new THREE.BoxGeometry(4.8,.04,2.4), gravel, p.x, Y-.01, p.z, 0, yo, 0);
        for(const [u,v,sc] of [[-1.8,.55,1],[2.0,-.6,.75]]){ const [x,z]=A(u,v), r=new THREE.DodecahedronGeometry(.5*sc,0); r.scale(1.3,.75,1); kt.add(r, rockM, x, Y+.22*sc, z, 0, RG()*3, 0); }
        { const [x,z]=A(1.7,.7); kt.add(new THREE.BoxGeometry(.5,.14,.5), lantM, x, Y+.07, z, 0, yo, 0); kt.add(new THREE.CylinderGeometry(.09,.11,.62,8), lantM, x, Y+.45, z); kt.add(new THREE.BoxGeometry(.4,.36,.4), glowM, x, Y+.94, z, 0, yo, 0); kt.add(new THREE.ConeGeometry(.42,.32,4), lantM, x, Y+1.28, z, 0, yo+Math.PI/4, 0); kt.add(new THREE.SphereGeometry(.07,8,6), lantM, x, Y+1.48, z); if(GLOW) GLOW.add(x, Y+.95, z, 1.6, 0xffc060, 1); }
        const maple=k%2===0, H=5.5+((k>>1)%3)*.7, [bx,bz]=A(-.5,-.15), ox=Math.cos(a+1.2), oz=Math.sin(a+1.2), lean=.9;
        const tp=[[0,0],[.25,.3],[.15,.62],[.55,1]].map(([o,f])=>new THREE.Vector3(bx+ox*o*lean, Y+f*H*.62, bz+oz*o*lean));
        kt.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tp.slice(0,3)),12,.24,8,false), barkM); kt.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tp.slice(1)),12,.15,7,false), barkM);
        const top=tp[3], L2=leafM[maple?0:1]; for(const s2 of [-1,1]){ const e=new THREE.Vector3(top.x+Math.cos(a+s2*1.4)*1.3, top.y+.5, top.z+Math.sin(a+s2*1.4)*1.3); kt.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([tp[2],top.clone().lerp(e,.5),e]),8,.08,5,false), barkM); }
        const nb=maple?9:8; for(let i=0;i<nb;i++){ const t=i/nb, ang=i*2.4+RG(), lay=maple?(i%3):(i/nb), rr=maple?(1.9-lay*.45)*(.6+RG()*.5):(1.5-lay*.8)*(.6+RG()*.5), hy=maple?H*.66+lay*H*.12:H*.6+lay*H*.38;
          const gq=new THREE.IcosahedronGeometry(maple?1.25-lay*.18:1.05-lay*.3,1); gq.scale(1,maple?.42:.62,1); kt.add(gq, L2[i%3], top.x+Math.cos(ang)*rr, YT+hy, top.z+Math.sin(ang)*rr, 0, RG()*3, 0); }
        circles.push({x:bx, z:bz, r:.3, y0:YT-.5, y1:YT+H});
        const cs=[A(-3,-1.75),A(3,-1.75),A(3,1.75),A(-3,1.75)]; for(let i=0;i<4;i++){ const [x1,z1]=cs[i], [x2,z2]=cs[(i+1)%4]; addSeg(x1,z1,x2,z2,.1,YT-.5,YT+2.2,'🍁 Tiểu cảnh vườn thiền – đi vòng quanh'); } }
      /* 8 ghế gỗ lim đỏ có khung pergola vàng + hoa giấy, quay mặt nhìn tháp */
      const bougM=[sm(0xd6336c,.8,0,{flatShading:true}), sm(0xe64980,.8,0,{flatShading:true})]; let nb2=0;
      for(let k=0;k<8;k++){ let a=null; for(const off of [0,.2,-.2,.34,-.34]){ const c2=ENT+k*Math.PI/4+off; if(!isGap(c2) && dAng(c2,ENT)>.3 && !isGap(c2+.06) && !isGap(c2-.06)){ a=c2; break; } } if(a===null) continue;
        const p=at(a,RBL-4.1), yo=yawOut(a), tx=Math.cos(yo), tz=-Math.sin(yo), A=(u,v)=>[p.x+tx*u+Math.cos(a)*v, p.z+tz*u+Math.sin(a)*v];
        kt.add(new THREE.BoxGeometry(2.2,.08,.55), MX.redwood, p.x, YT+.45, p.z, 0, yo, 0); { const [x,z]=A(0,.3); kt.add(new THREE.BoxGeometry(2.2,.5,.07), MX.redwood, x, YT+.78, z, -.12, yo, 0); }
        for(const u of [-.95,.95]){ const [x,z]=A(u,0); kt.add(new THREE.BoxGeometry(.08,.45,.5), MX.blackGold, x, YT+.22, z, 0, yo, 0); }
        for(const [u,v] of [[-1.3,-.9],[1.3,-.9],[-1.3,.9],[1.3,.9]]){ const [x,z]=A(u,v); kt.add(new THREE.CylinderGeometry(.06,.07,2.6,8), MX.champ, x, YT+1.3, z); circles.push({x,z,r:.1,y0:YT-.5,y1:YT+2.7}); }
        for(const v of [-.9,.9]){ const [x,z]=A(0,v); kt.add(new THREE.BoxGeometry(3.0,.12,.12), MX.champ, x, YT+2.62, z, 0, yo, 0); }
        for(let i=0;i<6;i++){ const [x,z]=A(-1.25+i*.5,0); kt.add(new THREE.BoxGeometry(.08,.08,2.2), MX.redwood, x, YT+2.72, z, 0, yo, 0); }
        for(let i=0;i<7;i++){ const [x,z]=A(-1.3+RG()*2.6,-.8+RG()*1.6), gq=new THREE.IcosahedronGeometry(.32+RG()*.18,0); gq.scale(1,.6,1); kt.add(gq, bougM[i%2], x, YT+2.86, z); }
        { const [x1,z1]=A(-1.15,.38), [x2,z2]=A(1.15,.38); addSeg(x1,z1,x2,z2,.12,YT-.5,YT+1.1,'🪑 Ghế ngắm tháp'); }
        if(W.addBench){ const [x,z]=A(0,-.02); W.addBench({x, z, rot:Math.atan2(-Math.cos(a),-Math.sin(a)), len:1.8, y:YT+.48, floor:YT, label:'🪑 Ngồi ngắm Tháp Liên Hoa (E · C)'}); } nb2++; } }
  }
  /* sàn sân thượng: gỗ óc chó thượng hạng kẻ ván đồng tâm + tâm lát đá ngọc lục bảo viền vàng kim (RingGeometry có uv phẳng → vẽ theo toạ độ cực) */
  const ROOFMAT=(()=>{ const S=2048, Ro=RF[5]+.45, k=S/(2*Ro), cx=S/2, c=document.createElement('canvas'); c.width=c.height=S; const g=c.getContext('2d'), RG=AK.rng(5150);
    g.fillStyle='#0d3b33'; g.fillRect(0,0,S,S); g.strokeStyle='#0a2e28'; g.lineWidth=2; for(let r=10; r<19.4; r+=1.2){ g.beginPath(); g.arc(cx,cx,r*k,0,TAU); g.stroke(); } for(let i=0;i<48;i++){ const a=i/48*TAU; g.beginPath(); g.moveTo(cx+Math.cos(a)*10*k, cx+Math.sin(a)*10*k); g.lineTo(cx+Math.cos(a)*19.4*k, cx+Math.sin(a)*19.4*k); g.stroke(); }
    for(let r=19.9; r<Ro; r+=.32){ const n=Math.max(16, Math.round(TAU*r/2.4)), off=RG()*TAU; for(let i=0;i<n;i++){ const a0=off+i/n*TAU, a1=off+(i+1)/n*TAU, v=RG(); g.fillStyle=`rgb(${52+v*18|0},${30+v*11|0},${17+v*8|0})`; g.beginPath(); g.arc(cx,cx,(r+.32)*k,a0,a1); g.arc(cx,cx,r*k,a1,a0,true); g.closePath(); g.fill(); g.strokeStyle='rgba(18,9,4,.8)'; g.lineWidth=1.5; g.stroke(); } }
    g.fillStyle='#d4af37'; g.beginPath(); g.arc(cx,cx,19.9*k,0,TAU); g.arc(cx,cx,19.4*k,0,TAU,true); g.fill(); g.strokeStyle='#d4af37'; g.lineWidth=4; g.beginPath(); g.arc(cx,cx,12*k,0,TAU); g.stroke();
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return new THREE.MeshStandardMaterial({map:t, roughness:.42, metalness:.05}); })();
  const floorMats=[null,AK.makeWoodMaterial({col:'#6b4329',repeat:6}),AK.makeStoneMaterial({col:'#2a4f55',joint:'#1f3d42',blockW:128,blockH:128,repeat:6}),AK.makeStoneMaterial({col:'#2b2f36',joint:'#1d2026',repeat:6}),AK.makeStoneMaterial({col:'#4a2a26',joint:'#33201c',repeat:6}),ROOFMAT];
  /* 16/11: 2 dãy × 2 thang máy cabin thật (js/liftkit.js) ở ±90° so với trục cầu thang xoắn – sàn các tầng khoét lỗ đúng giếng */
  const LIFTPOS=[ENT+Math.PI, ENT].flatMap(a=>{ const p=at(a,RA+3.2), yo=yawOut(a), tx=Math.cos(yo), tz=-Math.sin(yo); return [-1.65,1.65].map(o=>({a, x:p.x+o*tx, z:p.z+o*tz, yaw:yo})); });
  const holeCut=(geo)=>{ const g=geo.index?geo.toNonIndexed():geo, P0=g.attributes.position, keep=[]; for(let t=0;t<P0.count;t+=3){ const cx=(P0.getX(t)+P0.getX(t+1)+P0.getX(t+2))/3, cz=(P0.getZ(t)+P0.getZ(t+1)+P0.getZ(t+2))/3;
      const hit=LIFTPOS.some(L=>{ const dx=cx+C.x-L.x, dz=cz+C.z-L.z, c=Math.cos(L.yaw), s=Math.sin(L.yaw), lx=dx*c-dz*s, lz=dx*s+dz*c; return Math.abs(lx)<1.32 && Math.abs(lz)<1.32; }); if(!hit) keep.push(t); }
    const out=new THREE.BufferGeometry(); for(const k of Object.keys(g.attributes)){ const A=g.attributes[k], n=A.itemSize, arr=new Float32Array(keep.length*3*n); keep.forEach((t,j)=>{ for(let v=0;v<3;v++) for(let q=0;q<n;q++) arr[(j*3+v)*n+q]=A.array[(t+v)*n+q]; }); out.setAttribute(k,new THREE.BufferAttribute(arr,n)); } return out; };
  for(let f=1;f<6;f++){ const y=FY[f], RR=RF[f]; const ring=holeCut((()=>{ const r=new THREE.RingGeometry(RA,RR+.45,192,18); r.rotateX(-Math.PI/2); return r; })()); const fl=new THREE.Mesh(ring, floorMats[f]); fl.position.set(C.x,y,C.z); fl.receiveShadow=true; grp.add(fl);
    const un=holeCut((()=>{ const r=new THREE.RingGeometry(RA,RR+.45,192,18); r.rotateX(Math.PI/2); return r; })()); kt.add(un, M.dark, C.x, y-.9, C.z); for(const [mat,dy] of [[MX.obsid,-.15],[MX.champ,-.45],[MX.neon,-.75]]) kt.add(new THREE.CylinderGeometry(RR+.46,RR+.46,.3,128,1,true), mat, C.x, y+dy, C.z); kt.add(new THREE.CylinderGeometry(RA,RA,.5,64,1,true), M.dark, C.x, y-.25, C.z);
    kt.add(new THREE.TorusGeometry(RA+.03,.05,6,96), M.led, C.x, y-.52, C.z, Math.PI/2,0,0); plats.push({t:'ring', x:C.x, z:C.z, r0:RA+.05, r1:RR-.05, h:y});
    if(f===5) for(const [r,dy] of [[RR-1.2,-1.0],[RR-2.6,-1.1],[RR-4.0,-1.2]]) kt.add(new THREE.TorusGeometry(r,.16,8,128), MX.champ, C.x, y+dy, C.z, Math.PI/2,0,0); }
  const ringC=(r,y0,y1,skip)=>{ const n=Math.ceil(TAU*r/.9); for(let i=0;i<n;i++){ const a=i/n*TAU; if(skip && skip(a)) continue; const p=at(a,r); circles.push({x:p.x,z:p.z,r:.32,y0,y1}); } };
  /* mặt kính Deep Royal Sapphire từng tầng – nón cụt nối bán kính tầng dưới → tầng trên (dáng đồng hồ cát) */
  for(let f=0;f<5;f++){ const y0=FY[f], ya=f?y0+.05:y0, yb=FY[f+1]-.9; kt.add(new THREE.CylinderGeometry(Rof(yb),Rof(ya),yb-ya,96,4,true), MX.sapph, C.x, (ya+yb)/2, C.z);
    const rr=Math.min(RF[f], Rof(y0+1.7))-.2; ringC(rr, y0-.3, y0+FH-.3, f===0?(a=>DOORS.some(b=>dAng(a,b)<2.0/RF[0])):null); }
  /* khung xương Double-Helix Diagrid: 36 thanh xoắn thuận + 36 xoắn nghịch, vàng Champagne */
  { const Y0=YT+4.8, Y1=FY[5]-.2, TW=Math.PI*.55; for(const dir of [1,-1]) for(let k=0;k<36;k++){ const pts=[]; for(let i=0;i<=36;i++){ const t=i/36, y=Y0+(Y1-Y0)*t, a=k/36*TAU+dir*TW*t; pts.push(at(a,Rof(y)+.14,y)); } kt.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.11,5,false), MX.champ); }
    kt.add(new THREE.TorusGeometry(Rof(Y0)+.16,.22,8,128), MX.champ, C.x, Y0, C.z, Math.PI/2,0,0); }
  for(const a of DOORS){ if(dAng(a,ENT)<.05) continue; const p=at(a,RF[0]+.3); kt.add(AK.roundedBox(4.4,.4,2.4,.15,2), MX.champ, p.x, YT+4.4, p.z, 0, yawOut(a), 0); }
  /* sân thượng R 29: lan can kính + tay vịn vàng */
  kt.add(new THREE.CylinderGeometry(RF[5]+.25,RF[5]+.25,1.1,128,1,true), M.glassB, C.x, FY[5]+.55, C.z); kt.add(new THREE.TorusGeometry(RF[5]+.25,.08,8,160), MX.champ, C.x, FY[5]+1.12, C.z, Math.PI/2,0,0); ringC(RF[5]+.1, FY[5]-.3, FY[5]+1.6);
  /* Mái vòm cổng Hoàng gia vươn 9 m ở cửa chính (hướng cầu kính) */
  { const a=ENT, yo=yawOut(a), mid=at(a,RF[0]+4.6), lx=Math.cos(yo), lz=-Math.sin(yo); kt.add(AK.roundedBox(11,.55,9.4,.2,2), MX.obsGold, mid.x, YT+6.3, mid.z, 0, yo, 0); kt.add(new THREE.BoxGeometry(11.2,.18,9.6), MX.champ, mid.x, YT+6.0, mid.z, 0, yo, 0);
    for(const rr of [RF[0]+2.6, RF[0]+8.6]) for(const sd of [-1,1]) for(const dd of [-.32,.32]){ const p=at(a,rr); const x=p.x+lx*(4.5*sd+dd), z=p.z+lz*(4.5*sd+dd); kt.add(new THREE.CylinderGeometry(.2,.24,6,14), MX.champ, x, YT+3, z); kt.add(new THREE.CylinderGeometry(.34,.34,.3,14), MX.bronze, x, YT+.15, z); circles.push({x,z,r:.3}); }
    const c=document.createElement('canvas'); c.width=2048; c.height=192; const g=c.getContext('2d'); g.fillStyle='#0b1a33'; g.fillRect(0,0,2048,192); g.strokeStyle='#d4af37'; g.lineWidth=8; g.strokeRect(6,6,2036,180); g.fillStyle='#ffe9a8'; g.font='900 104px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.shadowColor='#ffd166'; g.shadowBlur=24; g.fillText('★ QA · QC · QE SOVEREIGN CITADEL ★',1024,100);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; const sign=new THREE.Mesh(new THREE.PlaneGeometry(10.6,1.0), new THREE.MeshStandardMaterial({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:.7})); const fp=at(a,RF[0]+9.32); sign.position.set(fp.x,YT+6.3,fp.z); sign.rotation.y=yo; grp.add(sign); }
  /* 16 cánh sen 3D có sống lưng + gân lá (hàm mẫu của Bình) – 8 cánh ngoài từ mặt hồ + 8 cánh trong cao vút ôm quả cầu; nướng vào 1 bộ khối (ít lượt vẽ) */
  function buildVolumetricLotusPetal(THREE, { angle=0, rBase=27, rBelly=43, rTip=31, yBase=0, yBelly=16, yTip=36, widthRad=.34, goldMat, glassMat, pearlMat, pedestal=true }){
    const petalGroup=new THREE.Group(); petalGroup.rotation.y=angle; const N=28, spinePts=[], leftPts=[], rightPts=[];
    for(let i=0;i<=N;i++){ const t=i/N, r=rBase*(1-t)+rTip*t+Math.sin(t*Math.PI)*(rBelly-(rBase+rTip)*.5), y=yBase+(yTip-yBase)*Math.pow(t,.92), halfW=widthRad*Math.sin(t*Math.PI)*(1-.15*t), rSpine=r+Math.sin(t*Math.PI)*1.4;
      spinePts.push(new THREE.Vector3(rSpine,y,0)); leftPts.push(new THREE.Vector3(r*Math.cos(halfW),y,r*Math.sin(halfW))); rightPts.push(new THREE.Vector3(r*Math.cos(-halfW),y,r*Math.sin(-halfW))); }
    petalGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spinePts),32,.45,8,false), pearlMat));
    petalGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftPts),32,.36,8,false), goldMat)); petalGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightPts),32,.36,8,false), goldMat));
    const verts=[], indices=[]; for(let i=0;i<=N;i++){ const L=leftPts[i], S=spinePts[i], R=rightPts[i]; verts.push(L.x,L.y,L.z, S.x,S.y,S.z, R.x,R.y,R.z); if(i<N){ const a=i*3, b=(i+1)*3; indices.push(a,a+1,b, a+1,b+1,b); indices.push(a+1,a+2,b+1, a+2,b+2,b+1); } }
    const surfGeo=new THREE.BufferGeometry(); surfGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3)); surfGeo.setIndex(indices); surfGeo.computeVertexNormals(); petalGroup.add(new THREE.Mesh(surfGeo, glassMat));
    for(let i=4;i<N-2;i+=4){ const S=spinePts[i], L=leftPts[i+2], R=rightPts[i+2]; petalGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([S,L]),8,.14,6,false), goldMat)); petalGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([S,R]),8,.14,6,false), goldMat)); }
    if(pedestal){ const basePedestal=new THREE.Mesh(new THREE.CylinderGeometry(1.4,2.2,2.4,6), pearlMat); basePedestal.position.set(rBase,yBase+1.2,0); petalGroup.add(basePedestal); }
    return { group:petalGroup, tip:spinePts[N] }; }
  const bakePetal=(res, y0, kit=kt)=>{ const g=res.group; g.position.set(C.x,y0,C.z); g.updateMatrixWorld(true); g.traverse(m=>{ if(!m.isMesh) return; const geo=m.geometry.clone(); geo.applyMatrix4(m.matrixWorld); kit.add(geo, m.material); }); return res.tip.clone().applyMatrix4(g.matrixWorld); };
  const PT={goldMat:MX.champ, glassMat:MX.petal, pearlMat:MX.bronze}, TIPS=[];
  for(let k=0;k<8;k++){ const a=oct(k); bakePetal(buildVolumetricLotusPetal(THREE,{...PT, angle:-a, rBase:27, rBelly:44, rTip:31, yBase:0, yBelly:16, yTip:35, widthRad:.34}), YT); }
  for(let k=0;k<8;k++){ const a=oct(k)+Math.PI/8; TIPS.push(bakePetal(buildVolumetricLotusPetal(THREE,{...PT, angle:-a, rBase:24, rBelly:35, rTip:24, yBase:6.5, yBelly:28, yTip:50, widthRad:.28, pedestal:false}), YT)); }
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
  { const mk=(ph,mat)=>{ const pts=[]; for(let i=0;i<=160;i++){ const t=i/160, y=YT+.3+(FY[5]+3-YT)*t; pts.push(at(ph+t*TAU*7,R0+.12,y)); } kt.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),640,.07,6,false), mat); };
    mk(0, MX.neon); mk(Math.PI, new THREE.MeshStandardMaterial({color:0xf43f5e, emissive:0xf43f5e, emissiveIntensity:1.3}));
    const warm=new THREE.MeshStandardMaterial({color:0xffe0a0, emissive:0xffc060, emissiveIntensity:1.4}); for(let hx=0;hx<2;hx++) for(let i=1;i<=NST;i++){ const a=A0+hx*Math.PI+i*DA, y=YT+i*STEP, p=at(a,(R0+R1)/2); kt.add(new THREE.BoxGeometry(R1-R0-.3,.03,.05), warm, p.x, y-.16, p.z, 0, yawOut(a), 0); } }
  for(let f=1;f<6;f++){ ringC(RA+.2, FY[f]-.2, FY[f]+1.15, a=>dAng(a,A0)<.3 || dAng(a,A0+Math.PI)<.3); kt.add(new THREE.CylinderGeometry(RA+.15,RA+.15,1.05,64,1,true), M.glassB, C.x, FY[f]+.52, C.z); }
  const ELEV=[A0+Math.PI/2, A0-Math.PI/2].map(a=>({a, p:at(a,RA+3.2)}));
  const FLOORN=['1 · Bảo tàng Lịch sử & Thảm hoạ','2 · Đấu trường Test Design','3 · Chỉ huy Hiệu năng & Bảo mật','4 · Đại sảnh Danh vọng · Nhà hàng xoay · Sky Bar','5 · Khu giải trí · Bida Hoàng gia','6 · Sân thượng · QA Brain Core · Vinh danh'];
  { const fl=FY.map((y,i)=>({y, name:'Tầng '+FLOORN[i], short:String(i+1)})); LIFTPOS.forEach((L,k)=>makeLift(W,{x:L.x, z:L.z, yaw:L.yaw, floors:fl, name:`Thang ${k<2?'Đông':'Tây'} ${k%2?'B':'A'}`, start:k%2?5:0, color:0xe0b040})); }
  const panelTex=(title, lines, bg='#13202f')=>{ const c=document.createElement('canvas'); c.width=1024; c.height=640; const g=c.getContext('2d'); g.fillStyle=bg; g.fillRect(0,0,1024,640); g.strokeStyle='#e0b040'; g.lineWidth=10; g.strokeRect(10,10,1004,620); g.fillStyle='#ffd77a'; g.font='900 64px "Segoe UI",sans-serif'; g.fillText(title,48,110); g.fillStyle='#fff'; g.font='500 38px "Segoe UI",sans-serif'; lines.forEach((l,i)=>g.fillText(l,48,200+i*62)); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };
  const panel=(a,y,title,lines,bg)=>{ const p=at(a,Rof(y+1)-.8), t=panelTex(title,lines,bg), m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,3.5), new THREE.MeshStandardMaterial({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:.45})); m.position.set(p.x,y+2.6,p.z); m.rotation.y=yawOut(a)+Math.PI; grp.add(m); };
  const busy=(a,f)=>dAng(a,A0)<.45 || dAng(a,A0+Math.PI)<.45 || ELEV.some(e=>dAng(a,e.a)<.35) || (f===0 && DOORS.some(b=>dAng(a,b)<.32));
  const LAY={f1Wall:[], f1Cases:[A0+.9,A0+2.2,A0+3.9], f4Tables:[], f4Bar:null, f5Billiard:[], f6Honor:{a:ENT+Math.PI*1.25, r:23}};   /* f6Honor: bia vinh danh sân thượng – đúng trước KHE giữa 2 cánh Đài Sen (ENT+5π/4, lối ra sảnh thang máy), lùi ra r 23 để không chắn lối, xa 3 Đình Vọng Cảnh + Brain Core. 21/11: góc đã dùng – cho bảng kiến thức tầng 1 + bảng vinh danh tầng 5 (brain_boards.js) né */
  { const y=FY[0]; for(const [a,kind] of [[A0+.9,'rocket'],[A0+2.2,'sat'],[A0+3.9,'bug']]){ const p=at(a,18); kt.add(AK.roundedBox(2.4,1.1,2.4,.1,2), M.white, p.x, y+.55, p.z); kt.add(new THREE.BoxGeometry(2.2,2.4,2.2), M.glassB, p.x, y+2.3, p.z); circles.push({x:p.x,z:p.z,r:1.6,y0:y-.5,y1:y+3.6});
      if(kind==='rocket'){ kt.add(new THREE.CylinderGeometry(.25,.25,1.6,16), M.white, p.x, y+2, p.z); kt.add(new THREE.ConeGeometry(.25,.5,16), M.red, p.x, y+3.05, p.z); for(let i=0;i<4;i++) kt.add(new THREE.BoxGeometry(.04,.4,.3), M.red, p.x+Math.cos(i*Math.PI/2)*.27, y+1.4, p.z+Math.sin(i*Math.PI/2)*.27, 0, i*Math.PI/2, 0); }
      if(kind==='sat'){ kt.add(AK.roundedBox(.6,.6,.6,.05,1), M.gold, p.x, y+2.2, p.z); for(const s of [-1,1]) kt.add(new THREE.BoxGeometry(1.1,.03,.5), sm(0x1f3f8a,.3,.6), p.x+s*.85, y+2.2, p.z); }
      if(kind==='bug'){ const b=new THREE.SphereGeometry(.35,16,10); b.scale(1.4,.6,1); kt.add(b, sm(0x5a4030,.6), p.x, y+1.6, p.z); for(const s of [-1,1]) kt.add(new THREE.CircleGeometry(.4,12), sm(0xb89a70,.7,0,{side:THREE.DoubleSide}), p.x+s*.35, y+1.75, p.z, 0, 0, s*.5); } }
    const PAN=[['1947 · Con bọ đầu tiên',['Bướm đêm kẹt trong máy Harvard Mark II,','được dán vào sổ nhật ký vận hành.']],['1996 · Ariane 5',['Tên lửa tự huỷ sau ~37 giây do tràn số','khi đổi số 64-bit sang 16-bit.']],['1999 · Mars Climate Orbiter',['Mất tàu vì một bên dùng đơn vị Anh,','một bên dùng hệ mét.']],['2012 · Knight Capital',['Triển khai sai phiên bản,','mất khoảng 440 triệu USD trong 45 phút.']],['2014 · Heartbleed',['Thiếu kiểm tra độ dài trong OpenSSL,','lộ dữ liệu bộ nhớ máy chủ.']],['Bài học',['Kiểm thử sớm · kiểm thử biên ·','review cấu hình · giám sát sau release.']]];
    /* 21/11: tầng 1 có 8 cửa → đủ 6 bảng lịch sử đặt ở điểm GIỮA 2 cửa (lệch −0,15 rad); cùng khoảng tường đó brain_boards.js treo bảng kiến thức (lệch +0,13 rad) */
    const DS=DOORS.map(d=>((d%TAU)+TAU)%TAU).sort((p,q)=>p-q), MIDS=DS.map((d,i)=>(d+(i+1<DS.length?DS[i+1]:DS[0]+TAU))/2); let k0=MIDS.findIndex(m=>dAng(m,ENT+.5)<=Math.PI/8+1e-6); if(k0<0) k0=0;
    PAN.forEach((it,n)=>{ const a=MIDS[(k0+n)%MIDS.length]-.15; panel(a,y,it[0],it[1]); LAY.f1Wall.push(a); }); }
  { const y=FY[1]; let n=0; for(let i=0;i<10 && n<6;i++){ const a=A0+.7+i*TAU/10; if(busy(a,1)) continue; const p=at(a,17); kt.add(AK.roundedBox(1.2,1.4,.7,.1,2), M.dark, p.x, y+.7, p.z, 0, yawOut(a)+Math.PI, 0); kt.add(new THREE.BoxGeometry(1,.7,.06), M.led, p.x, y+1.55, p.z, -.3, yawOut(a)+Math.PI, 0); circles.push({x:p.x,z:p.z,r:.7,y0:y-.5,y1:y+2});
      INTER.push({x:p.x, z:p.z, r:2, prio:.8, when:()=>Math.abs(P.y-y)<1.5, label:'🧠 Kiosk đố vui Test Design (E)', action:()=>{ if(W.life && W.life.openQuiz) W.life.openQuiz(); }}); n++; }
    panel(ENT+Math.PI*.25, y, 'Đấu trường Test Design', ['Phân vùng tương đương · Giá trị biên','Bảng quyết định · Chuyển trạng thái','Pairwise · Kiểm thử thăm dò'], '#123b3a'); }
  let holo=null; { const y=FY[2], p=at(A0+Math.PI*.5+.6,18); holo=new THREE.Mesh(new THREE.IcosahedronGeometry(2.6,3), new THREE.MeshBasicMaterial({color:0x46c8ff, wireframe:true, transparent:true, opacity:.7})); holo.position.set(p.x,y+3,p.z); grp.add(holo); kt.add(new THREE.CylinderGeometry(1.6,1.8,.8,24), M.dark, p.x, y+.4, p.z); circles.push({x:p.x,z:p.z,r:1.9,y0:y-.5,y1:y+5});
    for(const [d,t,l] of [[.9,'Hiệu năng · Real-time',['p95: 182 ms · RPS: 12.4k','Lỗi 5xx: 0,02 %']],[2.4,'Bảo mật · SOC',['Cảnh báo: 0 nghiêm trọng','Quét lỗ hổng: xanh']],[4.2,'CI/CD',['Build #4821 ✓ · 1.284 test pass','Thời gian: 6 phút 40 giây']]]) panel(A0+d, y, t, l, '#0d1726'); }
  { const y=FY[3]; for(const [d,t,l] of [[.9,'Glenford Myers',['"The Art of Software Testing" (1979)']],[1.7,'Lisa Crispin & Janet Gregory',['"Agile Testing" (2009)']],[2.5,'Kent Beck',['Phổ biến TDD – viết test trước']],[3.6,'Đội QC Bình Phan',['Tận tâm · Chính trực · Học hỏi']],[4.4,'Bạn – người QA tiếp theo',['Mỗi bug tìm ra là một người dùng được bảo vệ']]]) panel(A0+d, y, t, l, '#3b1d12');
    const a=A0+Math.PI+1.2, p=at(a,RF[3]-.9), door=new THREE.Mesh(new THREE.PlaneGeometry(3,3.6), new THREE.MeshStandardMaterial({color:0x2a1450, emissive:0x8a4cff, emissiveIntensity:.9})); door.position.set(p.x,y+1.8,p.z); door.rotation.y=yawOut(a)+Math.PI; grp.add(door);
    const dp=at(a,RF[3]-2.6); INTER.push({x:dp.x, z:dp.z, r:2, prio:.9, when:()=>Math.abs(P.y-y)<1.5, label:'🔮 Cổng Không gian Bí ẩn (E)', action:()=>toast('🔮 Cổng Không gian Bí ẩn đang được chuẩn bị – Bình sẽ mở một điều đặc biệt ở đây.', 4200)}); }
  /* 21/11 (Bình chốt): tầng 5 CHỈ là khu trò chơi (giữ 4 bàn bida) → nhà hàng xoay + Sky Bar dời xuống tầng 4, giữ nguyên chức năng ngồi ăn / gọi đồ uống */
  let spinRing=null; { const y=FY[3], R4=RF[3], PANA=[.9,1.7,2.5,3.6,4.4].map(d=>A0+d), MYS=A0+Math.PI+1.2;
    spinRing=new THREE.Mesh(new THREE.RingGeometry(R4-5,R4-.6,96,1), floorMats[1]); spinRing.rotation.x=-Math.PI/2; spinRing.position.set(C.x,y+.02,C.z); grp.add(spinRing);
    const tables=[]; for(let i=0;i<16;i++){ const a=A0+.6+i*TAU/16; if(!busy(a,3) && !PANA.some(q=>dAng(q,a)<.22) && dAng(MYS,a)>.3) tables.push(a); }
    tables.slice(0,7).forEach(a=>{ LAY.f4Tables.push(a); const p=at(a,R4-2.8); kt.add(new THREE.CylinderGeometry(.6,.6,.05,18), M.white, p.x, y+.76, p.z); kt.add(new THREE.CylinderGeometry(.06,.08,.74,8), M.gold, p.x, y+.38, p.z); circles.push({x:p.x,z:p.z,r:.62,y0:y-.5,y1:y+1.2});
      const s=at(a,R4-4.1); if(W.addBench) W.addBench({x:s.x, z:s.z, rot:yawOut(a), len:1.3, y:y+.48, floor:y, label:'🍽️ Ngồi nhà hàng xoay (E · C)'}); });
    const ba=A0+Math.PI+.2, bar=at(ba,15); LAY.f4Bar=ba; kt.add(AK.roundedBox(5,1.1,1,.15,2), M.dark, bar.x, y+.55, bar.z, 0, yawOut(ba)+Math.PI/2, 0); kt.add(AK.roundedBox(5.2,.06,1.15,.04,1), M.gold, bar.x, y+1.12, bar.z, 0, yawOut(ba)+Math.PI/2, 0); circles.push({x:bar.x,z:bar.z,r:1.6,y0:y-.5,y1:y+1.5});
    const bi=at(ba,13.2); INTER.push({x:bi.x, z:bi.z, r:2, prio:.7, when:()=>Math.abs(P.y-y)<1.5, label:'🍸 Sky Bar Liên Hoa – gọi đồ uống (E)', action:()=>menu('🍸 Sky Bar Liên Hoa',[['🍸 Mocktail Liên Hoa',60,'Hương sen'],['🥂 Nước nho sủi',50,'Không cồn'],['🍰 Bánh sen vàng',45,'Ngọt thanh']])}); }
  { const y=FY[4];
    for(let k=0;k<4;k++){ const a=A0+Math.PI*.5+.55+k*.42, p=at(a,15.5); LAY.f5Billiard.push(a); AK.buildBilliardTable(W, p.x, y, p.z, yawOut(a), 0x7a0d1c, 'world', {parent:grp}); } }
  { const y=FY[5], a=A0, p=at(a,22.5);
    /* QA Brain Core: bục đồng đỏ + pha lê ảo (thay khối hộp đen thô cũ) */
    kt.add(new THREE.CylinderGeometry(.85,1.1,1.0,8), MX.bronze, p.x, y+.5, p.z); kt.add(new THREE.TorusGeometry(.9,.06,6,32), MX.champ, p.x, y+1.0, p.z, Math.PI/2,0,0); kt.add(new THREE.OctahedronGeometry(.5,0), MX.neon, p.x, y+1.7, p.z); circles.push({x:p.x,z:p.z,r:1.15,y0:y-.5,y1:y+2.4});
    const ip=at(a,20); INTER.push({x:ip.x, z:ip.z, r:2.2, prio:.9, when:()=>Math.abs(P.y-y)<1.5, label:'🧠 QA Brain Core – phân tích tài liệu, sinh test case (E)', action:()=>{ const b=W.life && W.life.brain; if(b && b.open) b.open(); else toast('🧠 QA Brain đang khởi động…'); }});
    /* 3 Đình Vọng Cảnh mái vòm búp sen xanh ngọc – vàng kim, 4 cột đồng 3,2 m, kính thiên văn đồng thau bóng */
    const domeM=sm(0x0f766e,.25,.55), bud=[]; for(let i=0;i<=14;i++){ const t=i/14; bud.push(new THREE.Vector2(Math.max(.001,2.0*Math.pow(Math.cos(t*Math.PI/2),.75)*(1+.14*Math.sin(t*Math.PI))), t*2.3)); }
    for(let i=0;i<3;i++){ const ta=A0+TAU/6+i*TAU/3, c=at(ta,24.4), yo=yawOut(ta);
      kt.add(new THREE.CylinderGeometry(2.1,2.2,.12,32), MX.obsGold, c.x, y+.06, c.z); kt.add(new THREE.TorusGeometry(2.15,.04,6,48), MX.champ, c.x, y+.12, c.z, Math.PI/2,0,0); plats.push({t:'ring', x:c.x, z:c.z, r0:0, r1:2.2, h:y+.12});
      for(let j=0;j<4;j++){ const ca=ta+Math.PI/4+j*Math.PI/2, x=c.x+Math.cos(ca)*1.6, z=c.z+Math.sin(ca)*1.6; kt.add(new THREE.CylinderGeometry(.07,.09,3.2,10), MX.champ, x, y+1.72, z); kt.add(new THREE.CylinderGeometry(.14,.14,.12,10), MX.champ, x, y+.18, z); circles.push({x,z,r:.12,y0:y-.5,y1:y+3.4}); }
      kt.add(new THREE.TorusGeometry(1.75,.09,8,48), MX.champ, c.x, y+3.32, c.z, Math.PI/2,0,0); kt.add(new THREE.LatheGeometry(bud,32), domeM, c.x, y+3.36, c.z); kt.add(new THREE.TorusGeometry(2.02,.07,6,48), MX.champ, c.x, y+3.4, c.z, Math.PI/2,0,0);
      kt.add(new THREE.ConeGeometry(.12,.7,8), MX.champ, c.x, y+6.0, c.z); kt.add(new THREE.SphereGeometry(.13,10,8), MX.champ, c.x, y+5.62, c.z);
      for(let j=0;j<3;j++){ const la=j*TAU/3, lx=c.x+Math.cos(la)*.35, lz=c.z+Math.sin(la)*.35; kt.add(new THREE.CylinderGeometry(.025,.03,1.25,6), MX.bronze, lx, y+.68, lz, Math.cos(la)*.25, 0, -Math.sin(la)*.25); }
      kt.add(new THREE.CylinderGeometry(.11,.16,1.2,14), MX.champ, c.x, y+1.45, c.z, Math.PI/2.4, yo, 0); kt.add(new THREE.TorusGeometry(.17,.03,6,16), MX.champ, c.x+Math.cos(ta)*.5, y+1.62, c.z+Math.sin(ta)*.5, Math.PI/2.4, yo, 0);
      circles.push({x:c.x,z:c.z,r:.35,y0:y-.5,y1:y+1.9});
      const tp=at(ta,22.6); INTER.push({x:tp.x, z:tp.z, r:2, prio:.8, when:()=>Math.abs(P.y-y)<1.5, label:'🔭 Đình Vọng Cảnh – kính thiên văn 360° (E)', action:()=>{ HOOK.scope={pos:at(ta,RF[5]+.8,y+1.6), fov:30}; toast('🔭 Kéo chuột nhìn quanh 360°, lăn chuột phóng to · bấm E hoặc phím di chuyển để thôi', 3600); }});
      /* 2 bồn hoa quanh mỗi đình sát lan can: mẫu đơn đỏ / bonsai */
      for(const [sd,kind] of [[-1,'peony'],[1,'bonsai']]){ const pa=ta+sd*.22, q=at(pa,RF[5]-1.25); kt.add(new THREE.CylinderGeometry(.55,.42,.6,16), MX.bronze, q.x, y+.3, q.z); kt.add(new THREE.TorusGeometry(.55,.04,6,24), MX.champ, q.x, y+.6, q.z, Math.PI/2,0,0); circles.push({x:q.x,z:q.z,r:.6,y0:y-.5,y1:y+1.6});
        if(kind==='peony'){ kt.add(new THREE.SphereGeometry(.5,10,6,0,TAU,0,Math.PI/2), sm(0x2f5a2c,.9), q.x, y+.6, q.z); for(let f=0;f<6;f++){ const fa=f/6*TAU; kt.add(new THREE.IcosahedronGeometry(.15,0), sm(f%2?0xc2185b:0xe03131,.7,0,{flatShading:true}), q.x+Math.cos(fa)*.3, y+.92, q.z+Math.sin(fa)*.3); } }
        else { kt.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(q.x,y+.6,q.z), new THREE.Vector3(q.x+.15,y+.95,q.z+.1), new THREE.Vector3(q.x-.1,y+1.25,q.z-.05)]),8,.06,5,false), sm(0x4a3020,.9)); for(const [dx,dy,dz,r] of [[-.15,1.3,0,.32],[.25,1.05,.1,.26],[-.05,1.5,-.1,.22]]){ const gq=new THREE.SphereGeometry(r,10,6); gq.scale(1,.45,1); kt.add(gq, sm(0x2e6b34,.85), q.x+dx, y+dy, q.z+dz); } } } } }
  kt.build();
  /* Đài Sen Kính – Vàng 8 cánh (sảnh đón thang máy sân thượng, che kín nóc thang + cột lõi) + bệ nâng quả cầu */
  const kp=Kit(); MX.frost=new THREE.MeshStandardMaterial({color:0xe6f1f6, roughness:.22, metalness:.25, side:THREE.DoubleSide});
  { const y=FY[5]; for(let k=0;k<8;k++){ const a=ENT+Math.PI/8+k*Math.PI/4; bakePetal(buildVolumetricLotusPetal(THREE,{...PT, glassMat:MX.frost, angle:-a, rBase:15.6, rBelly:18.6, rTip:13.6, yBase:0, yBelly:2.6, yTip:5.5, widthRad:.22, pedestal:false}), y, kp);
      for(let i=0;i<8;i++){ const a0=a-.2+.4*i/8, a1=a-.2+.4*(i+1)/8, p=at(a0,16.4), q=at(a1,16.4); addSeg(p.x,p.z,q.x,q.z,.15,y-.3,y+5.2,'🪷 Đài Sen sân thượng – vào sảnh thang máy ở các khe giữa cánh'); } }
    kp.add(new THREE.TorusGeometry(14.2,.28,10,96), MX.champ, C.x, y+5.5, C.z, Math.PI/2,0,0); { const gd=new THREE.CircleGeometry(14.4,96); gd.rotateX(-Math.PI/2); kp.add(gd, MX.obsGold, C.x, y+5.55, C.z); const gu=new THREE.CircleGeometry(14.4,96); gu.rotateX(Math.PI/2); kp.add(gu, MX.obsGold, C.x, y+5.5, C.z); }
    kp.add(new THREE.CylinderGeometry(3.3,3.6,6.2,32), MX.bronze, C.x, y+8.6, C.z); kp.add(new THREE.CylinderGeometry(6.2,3.3,2.6,32), MX.champ, C.x, y+12.9, C.z); kp.add(new THREE.TorusGeometry(6.2,.22,8,64), MX.neon, C.x, y+14.2, C.z, Math.PI/2,0,0); }
  const CY=FY[5]+15.5, crown=new THREE.Group(); crown.position.set(C.x,CY,C.z); grp.add(crown);
  const gold2=new THREE.MeshStandardMaterial({color:0xd4af37, metalness:1, roughness:.2, emissive:0xffa000, emissiveIntensity:.3});
  /* 3 vòng Astrolabe Gimbal tiết diện chữ nhật vát 0,6 × 0,35 – nghiêng lệch 3 trục, mỗi vòng tự quay quanh trục riêng */
  const gimbal=(R)=>{ const sh=[[R-.15,-.3],[R+.15,-.3],[R+.18,-.25],[R+.18,.25],[R+.15,.3],[R-.15,.3],[R-.18,.25],[R-.18,-.25],[R-.15,-.3]].map(([x,y])=>new THREE.Vector2(x,y)); return new THREE.Mesh(new THREE.LatheGeometry(sh,128), gold2); };
  const gy=[]; { const g1=new THREE.Group(); g1.rotation.x=.4; const r1=gimbal(15.5); r1.rotation.x=Math.PI/2; g1.add(r1); crown.add(g1);
    const g2=new THREE.Group(); g2.rotation.z=-.45; const r2=gimbal(14); r2.rotation.x=Math.PI/2; g2.add(r2); crown.add(g2);
    const g3=new THREE.Group(); g3.add(gimbal(12.6)); crown.add(g3); gy.push(r1,r2,g3); }
  /* quả cầu 2 lớp: lõi năng lượng tím–hồng (nhịp thở) + vỏ tinh thể mạng nơ-ron xanh băng */
  const coreM=new THREE.MeshStandardMaterial({color:0xbe185d, emissive:0x9d174d, emissiveIntensity:.85, roughness:.3, flatShading:true}), coreMesh=new THREE.Mesh(new THREE.IcosahedronGeometry(4.2,1), coreM); crown.add(coreMesh);
  const brainM=new THREE.MeshPhysicalMaterial({color:0xbfe9ff, roughness:.03, metalness:.1, transparent:true, opacity:.38, emissive:0x3aa8ff, emissiveIntensity:.35, flatShading:true, depthWrite:false, side:THREE.DoubleSide});
  const brainG=new THREE.IcosahedronGeometry(1,2); brainG.scale(9,7.5,10); const brainMesh=new THREE.Mesh(brainG, brainM); crown.add(brainMesh);
  const neur=new THREE.LineSegments(new THREE.EdgesGeometry(brainG), new THREE.LineBasicMaterial({color:0x9fe8ff, transparent:true, opacity:.85})); crown.add(neur);
  /* vành chữ QA · QC · QE ngoài cùng – chỉ mặt ngoài (FrontSide) nên luôn đọc thuận, không bị ngược chữ */
  let band=null; { const c=document.createElement('canvas'); c.width=4096; c.height=128; const g=c.getContext('2d'); g.fillStyle='#0a1526'; g.fillRect(0,0,4096,128); g.fillStyle='#d4af37'; g.fillRect(0,0,4096,9); g.fillRect(0,119,4096,9); g.fillStyle='#8a6a10'; g.fillRect(0,15,4096,3); g.fillRect(0,110,4096,3);
    g.font='900 80px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.shadowColor='#ffcf5a'; g.shadowBlur=16; g.fillStyle='#ffe08a'; for(let i=0;i<4;i++) g.fillText('★ QA · QC · QE ★', 512+i*1024, 66);
    /* băng rôn cong xanh đen viền vàng kim làm nền cho chữ – không còn chìm vào mây trắng; chỉ mặt ngoài (FrontSide) nên luôn đọc thuận */
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; band=new THREE.Mesh(new THREE.CylinderGeometry(18.4,18.4,3.0,128,1,true), new THREE.MeshStandardMaterial({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:.55, roughness:.4, metalness:.2, side:THREE.FrontSide})); crown.add(band);
    for(const dy of [-1.52,1.52]){ const tr=new THREE.Mesh(new THREE.TorusGeometry(18.42,.1,6,128), gold2); tr.rotation.x=Math.PI/2; tr.position.y=dy; crown.add(tr); } }
  /* 8 đỉnh tháp ánh sáng vàng ở mũi cánh sen trong + tia sáng hội tụ về tâm quả cầu */
  const spireBeams=[]; { const sm2=new THREE.MeshBasicMaterial({color:0xfff1b8, transparent:true, opacity:.35, blending:THREE.AdditiveBlending, depthWrite:false}), bulb=new THREE.MeshStandardMaterial({color:0xfff3c4, emissive:0xffd77a, emissiveIntensity:1.4}), ctr=new THREE.Vector3(C.x,CY,C.z);
    for(const tp of TIPS){ kp.add(new THREE.ConeGeometry(.42,3.4,8), MX.champ, tp.x, tp.y+1.7, tp.z); kp.add(new THREE.SphereGeometry(.38,10,8), bulb, tp.x, tp.y+3.5, tp.z);
      const top=new THREE.Vector3(tp.x,tp.y+3.5,tp.z), d=ctr.clone().sub(top), g=new THREE.CylinderGeometry(.05,.05,d.length(),5,1,true); g.translate(0,d.length()/2,0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), d.clone().normalize())); g.translate(top.x,top.y,top.z); const b=new THREE.Mesh(g, sm2); b.userData.dynamic=true; grp.add(b); spireBeams.push(b); } }
  kp.build();
  const beamMat=new THREE.MeshBasicMaterial({color:0xc9b8ff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
  const beams=[]; for(let i=0;i<8;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.4,5,180,16,1,true), beamMat); b.geometry.translate(0,90,0); const p=at(i/8*TAU+Math.PI/8,RPAD-12); b.position.set(p.x,YT+2,p.z); grp.add(b); beams.push(b); }
  makeLabel('🧠 QA/QC Brain Citadel', 'Tháp Liên Hoa Thần Kinh · 6 tầng · đi bộ thẳng vào', {h:1.0, x:C.x, y:CY+22, z:C.z, fade:900});

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
    if(d<450){ gy[0].rotation.z+=dt*.35; gy[1].rotation.z-=dt*.45; gy[2].rotation.y+=dt*.25; brainMesh.rotation.y+=dt*.12; neur.rotation.y=brainMesh.rotation.y; coreMesh.rotation.y-=dt*.4; coreMesh.rotation.x+=dt*.15; const pulse=.5+.5*Math.sin(T*2.2); coreM.emissiveIntensity=.6+pulse*(.5+(W.night||0)*1.6); coreMesh.scale.setScalar(.92+.12*pulse); brainM.emissiveIntensity=.25+pulse*.3+(W.night||0)*.6; MX.jet.opacity=.4+.2*Math.sin(T*3.1);
      band.rotation.y-=dt*.3; if(holo) holo.rotation.y+=dt*.4; if(spinRing) spinRing.rotation.z+=dt*.02; }
    const n=W.night||0; gold2.emissiveIntensity=.25+n*.9; MX.neon.emissiveIntensity=.9+n*1.8; MX.cable.emissiveIntensity=.08+n*1.1; for(const b of spireBeams) b.material.opacity=.18+n*.5; beamMat.opacity=n*.14; beams.forEach((b,i)=>{ const a=T*.15+i*TAU/8; b.rotation.set(Math.sin(a)*.3,0,Math.cos(a)*.3); });
    const inside=d<Rof(P.y+.5)-.4 && P.y>YT-1 && P.y<FY[5]-.6;
    if(inside){ const f=Math.min(4,Math.max(0,Math.floor((P.y-YT+.3)/FH))); if(!wasIn){ saved=cam.dist; cam.dist=Math.min(cam.dist,6.5); } const Rc=Math.min(RF[f],RF[f+1]); HOOK.camBox={x0:C.x-Rc+1, x1:C.x+Rc-1, z0:C.z-Rc+1, z1:C.z+Rc-1, y1:FY[f]+FH-.8}; wasIn=true; }
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
  /* 21/11: bảng kiến thức xoay vòng tầng 1 (data/brain_boards.json) + bảng Vinh danh QA/QC Member tầng 5 – file riêng js/brain_boards.js */
  const boards={}; import('./brain_boards.js').then(m=>m && m.make && m.make(W, ctx, {C, FY, RF, RA, A0, ENT, Rof, at, yawOut, dAng, busy, grp, doors:DOORS, ...LAY})).then(r=>{ if(r) Object.assign(boards, r); }).catch(e=>console.warn('[Brain] brain_boards:', e));
  /* 21/11 (Bình chốt): TẦNG 5 (y 142) là khu GIẢI TRÍ cho js/brain_games.js – cả sàn vành khuyên r 11,5 → RF[4]−1,2.
     keepOut CHỈ còn cầu thang, thang máy (+ cửa cabin); tầng 5 không có cửa ra ngoài. 4 bàn bida có sẵn ghi ở existing.billiards (trò Bida dùng lại). */
  const gameFloor={floor:5, name:FLOORN[4], y:FY[4], cx:C.x, cz:C.z, rIn:RA+1.5, rOut:RF[4]-1.2, A0, ENT,
    keepOut:[{a:A0, da:.45, what:'cầu thang'},{a:A0+Math.PI, da:.45, what:'cầu thang'},{a:ENT, da:.4, what:'thang máy + cửa cabin', r:[11.5,15.5]},{a:ENT+Math.PI, da:.4, what:'thang máy + cửa cabin', r:[11.5,15.5]}],
    existing:{billiards:LAY.f5Billiard.map(a=>({a, r:15.5, x:at(a,15.5).x, z:at(a,15.5).z, yaw:yawOut(a), len:2.84, wid:1.42}))}};
  const API={C, FY, ROAD, cafes, GB, hAt, ride, G6, boards, gameFloor};
  import('./bots_brain.js').then(m=>{ if(m && m.make) m.make(W, API); }).catch(()=>{});
  /* 21/11: khu trò chơi tầng 4 (js/brain_games.js – phiên B): make(W, ctx, gameFloor); thiếu file thì bỏ qua */
  import('./brain_games.js').then(m=>m && m.make ? m.make(W, ctx, gameFloor) : null).then(r=>{ if(r) API.games=r; }).catch(e=>{ if(!/Failed to fetch|Cannot find module|dynamically imported|Importing a module script failed/i.test(String(e))) console.warn('[Brain] brain_games:', e); });   /* Pha 9: bot sống động của vùng (file do phiên khác làm; chưa có thì bỏ qua) */
  return API;
}
