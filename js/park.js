// QC World – ĐẠI CÔNG VIÊN HỒ NGỌC (QC City Central Park) + CÂY XANH / CHẬU HOA VỈA HÈ – quy hoạch thành phố 15/11/2026
//  • Giữa thành phố: x 156–242 · z 10–190 (giữa Đại lộ Hồ Ngọc z=0, đại lộ ven Tây x=146, ven Đông x=252, phố chính Phường z=200)
//  • Hồ Ngọc uốn lượn có eo ở giữa · Cầu Vòm Hồ Ngọc 27 m bắc qua eo (sân đệm 2 đầu) · đảo thủy đình + cầu gỗ · thuyền thiên nga thuê đạp
//  • Đường sàn gỗ ôm sát hồ (ghế gỗ nguyên khối, đá cảnh, đèn lồng đen) · đường chạy bộ lát gạch đỏ 5,5 m vòng ngoài (bó vỉa đá, đèn cầu trắng)
//  • Lối nhánh nối sàn gỗ ↔ đường chạy · bãi cỏ rộng · cây cổ thụ tán cao (không che camera) · phân khu tách bạch: cổng + máy bán nước,
//    quảng trường cosplay, khu gym/xà, bãi yoga – dưỡng sinh, sân cầu lông, bãi xe đạp, sân chơi trẻ em, sân khấu cỏ, café + bến thuyền
//  • Nhãn nổi chỉ hiện gần (≤ 25–30 m) · người công viên chỉ chạy khi bạn ở gần · cây/hoa gộp khối (ít lượt vẽ)
//  • Cây xanh + chậu hoa dọc vỉa hè mọi đường (CITY.roads) · khu công cộng (cứu hoả, bệnh viện, trường): js/civic.js (nạp từ đây)
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makePoser } from './pose.js';
import { roadNet } from './roads.js';

export async function make(W, ctx){
  try{ if(localStorage.getItem('qcworld-park')==='off') return null; }catch(e){}   // công tắc gỡ lỗi / đo A/B hiệu năng (mặc định: bật)
  const {THREE, scene, MAT, colorMat, circles, boxes, INTER, PLACES, HOOK, P, toast, makeLabel, removeLabel, makeActor, groundAt, lerpAngle, burst, teleport, mergeGeometries, addSeg, plats, CITY, GLOW} = W;
  const {S, save, ui, askPay, spend, fmt} = ctx;
  const TAU=Math.PI*2, LOW=W.QUAL==='low', R=Math.random;
  const clamp=(v,a,b)=>v<a?a:v>b?b:v, pick=a=>a[Math.floor(R()*a.length)], dg=d=>d*Math.PI/180;
  const rng=(s=>()=>{ s=(s+0x6D2B79F5)|0; let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; })(20261115);
  const pick2=a=>a[Math.floor(rng()*a.length)];
  const hash=(x,y,z)=>{ const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return s-Math.floor(s); };
  const night=()=>W.night||0;
  const NET=roadNet(CITY);
  const out={conflicts:[], seats:[], trees:0, planters:0, NET};
  const FLW=[], BUSH=[], STR=[];

  /* ============================== 0. TIỆN ÍCH DỰNG HÌNH ============================== */
  const SO={x:199, z:100};   // gốc toạ độ khối tĩnh của công viên → perf.js batchStatic gộp gọn
  const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3();
  function Kit(cast){ const parts=new Map(), ox=SO.x, oz=SO.z;
    return { add(geo, mat, x=0,y=0,z=0, ry=0, rx=0, rz=0, sx=1,sy=1,sz=1){ const g=geo.index?geo.toNonIndexed():geo.clone();
        for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal' && k!=='uv') g.deleteAttribute(k);
        if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
        g.clearGroups(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m4.compose(_v.set(x-ox,y,z-oz), _q, _s.set(sx,sy,sz)); g.applyMatrix4(_m4);
        if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); return g; },
      build(){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.position.set(ox,0,oz); ms.castShadow=cast; ms.receiveShadow=true; scene.add(ms); } parts.clear(); } }; }
  const KO=Kit(true), KG=Kit(false), CK={O:KO, G:KG};
  const ctex=(w,h,draw,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.userData.live=true; } return t; };
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), CY=(a,b,h,n=10,hs=1,open=false)=>new THREE.CylinderGeometry(a,b,h,n,hs,open);
  const toShape=(pts, Sh=THREE.Shape)=>{ const s=new Sh(); pts.forEach(([x,z],i)=>i?s.lineTo(x-SO.x,-(z-SO.z)):s.moveTo(x-SO.x,-(z-SO.z))); s.closePath(); return s; };
  function flat(pts, holes=[]){ const s=toShape(pts); for(const h of holes) s.holes.push(toShape(h, THREE.Path)); const g=new THREE.ShapeGeometry(s); g.rotateX(-Math.PI/2); return g; }
  function slab(pts, holes, depth){ const s=toShape(pts); for(const h of holes) s.holes.push(toShape(h, THREE.Path)); const g=new THREE.ExtrudeGeometry(s, {depth, bevelEnabled:false}); g.rotateX(-Math.PI/2); return g; }
  const rect=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
  const circ=(x,z,r,n=28)=>{ const a=[]; for(let i=0;i<n;i++){ const t=i/n*TAU; a.push([x+Math.cos(t)*r, z+Math.sin(t)*r]); } return a; };
  const inPoly=(x,z,pts)=>{ let c=false; for(let i=0,j=pts.length-1;i<pts.length;j=i++){ const [xi,zi]=pts[i], [xj,zj]=pts[j]; if(((zi>z)!==(zj>z)) && (x<(xj-xi)*(z-zi)/(zj-zi)+xi)) c=!c; } return c; };
  // hình khép kín tham số (hồ / đường chạy): base(t) → điểm, off(t,d) → lệch theo pháp tuyến ra ngoài (d>0 ra ngoài)
  function shapeOf(base){
    const nrm=t=>{ const a=base(t-1e-3), b=base(t+1e-3), tx=b[0]-a[0], tz=b[1]-a[1], l=Math.hypot(tx,tz)||1; return [tz/l, -tx/l]; };
    const off=(t,d)=>{ const p=base(t), n=nrm(t); return [p[0]+n[0]*d, p[1]+n[1]*d]; };
    const poly=(d,N=240)=>{ const a=[]; for(let i=0;i<N;i++) a.push(off(i/N*TAU,d)); return a; };
    return {base, nrm, off, poly}; }
  // giao điểm đa giác với đường x = v (axis 'x' → các z) hoặc z = v (axis 'z' → các x), tăng dần
  function crossAt(pts, axis, v){ const k=axis==='x'?0:1, o=1-k, r=[]; for(let i=0;i<pts.length;i++){ const a=pts[i], b=pts[(i+1)%pts.length]; if((a[k]-v)*(b[k]-v)<=0 && a[k]!==b[k]) r.push(a[o]+(b[o]-a[o])*(v-a[k])/(b[k]-a[k])); } return r.sort((p,q)=>p-q); }
  function lane(shape, d, N=360){ const pts=shape.poly(d,N), L=[0]; for(let i=1;i<=N;i++){ const a=pts[i-1], b=pts[i%N]; L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1])); }
    return {pts, L, N, len:L[N],
      at(s){ s=((s%this.len)+this.len)%this.len; let lo=0, hi=N; while(hi-lo>1){ const m=(lo+hi)>>1; if(L[m]<=s) lo=m; else hi=m; } const a=pts[lo], b=pts[(lo+1)%N], k=(s-L[lo])/((L[lo+1]-L[lo])||1);
        return [a[0]+(b[0]-a[0])*k, a[1]+(b[1]-a[1])*k, Math.atan2(b[0]-a[0], b[1]-a[1])]; },
      near(x,z){ let bi=0, bd=1e9; for(let i=0;i<N;i++){ const q=(pts[i][0]-x)**2+(pts[i][1]-z)**2; if(q<bd){ bd=q; bi=i; } } return bi; },
      walk(i0,i1){ const o=[]; const f=(i1-i0+N)%N, b=(i0-i1+N)%N; if(f<=b){ for(let k=1;k<=f;k++) o.push(pts[(i0+k)%N].slice()); } else { for(let k=1;k<=b;k++) o.push(pts[(i0-k+N)%N].slice()); } return o; } }; }
  // vòng đoạn chặn (mép hồ, mép đảo) có khe – cắt đúng mép khe (Liang–Barsky)
  function ringSegs(pts, gaps, msg, r=.06){
    const clipIn=(ax,az,bx,bz,g)=>{ let t0=0, t1=1; const dx=bx-ax, dz=bz-az; for(const [p,q] of [[-dx,ax-g.x0],[dx,g.x1-ax],[-dz,az-g.z0],[dz,g.z1-az]]){ if(Math.abs(p)<1e-9){ if(q<0) return null; continue; } const t=q/p; if(p<0){ if(t>t1) return null; if(t>t0) t0=t; } else { if(t<t0) return null; if(t<t1) t1=t; } } return t1>t0?[t0,t1]:null; };
    for(let i=0;i<pts.length;i++){ const a=pts[i], b=pts[(i+1)%pts.length]; let parts=[[0,1]];
      for(const g of gaps){ const c=clipIn(a[0],a[1],b[0],b[1],g); if(!c) continue; const np=[]; for(const [u0,u1] of parts){ if(c[1]<=u0 || c[0]>=u1){ np.push([u0,u1]); continue; } if(c[0]>u0) np.push([u0,c[0]]); if(c[1]<u1) np.push([c[1],u1]); } parts=np; }
      for(const [u0,u1] of parts){ if(u1-u0<1e-4) continue; const P0=[a[0]+(b[0]-a[0])*u0, a[1]+(b[1]-a[1])*u0], P1=[a[0]+(b[0]-a[0])*u1, a[1]+(b[1]-a[1])*u1]; addSeg(P0[0],P0[1],P1[0],P1[1],r,undefined,undefined,msg); } } }
  // sổ chỗ: tự kiểm tra chồng lấn khi đặt đồ (out.conflicts)
  const FP=[], KEEP=[];
  function hit(x,z,r){ for(const f of FP){ if(Math.hypot(x-f.x,z-f.z)<f.r+r) return f.tag; } for(const k of KEEP){ if(x>k.x0-r && x<k.x1+r && z>k.z0-r && z<k.z1+r) return k.tag; } return null; }
  function reserve(x,z,r,tag,check=true){ const h=check?hit(x,z,r):null; if(h) out.conflicts.push(`${tag} (${x.toFixed(1)},${z.toFixed(1)}) chạm ${h}`); FP.push({x,z,r,tag}); return !h; }
  const keep=(x0,z0,x1,z1,tag)=>KEEP.push({x0,z0,x1,z1,tag});

  /* ---------- vật liệu ---------- */
  const paveT=ctex(256,256,(g,w,h)=>{ g.fillStyle='#857a6b'; g.fillRect(0,0,w,h); const n=8, s=w/n;
    for(let r=0;r<n;r++) for(let c=-1;c<n/2;c++){ const x=c*2*s+(r%2)*s, v=rng(), b=v<.5?[205,193,172]:v<.82?[188,176,158]:[214,168,138], k=.9+rng()*.16; g.fillStyle=`rgb(${b[0]*k|0},${b[1]*k|0},${b[2]*k|0})`; g.fillRect(x+1,r*s+1,2*s-2,s-2); }
    for(let i=0;i<2200;i++){ g.fillStyle=`rgba(0,0,0,${rng()*.07})`; g.fillRect(rng()*w,rng()*h,2,2); } }, true); paveT.repeat.set(.5,.5);
  const brickT=ctex(256,256,(g,w,h)=>{ g.fillStyle='#6e2f22'; g.fillRect(0,0,w,h); const bh=16, bw=32;   // gạch đỏ nâu đường chạy
    for(let r=0;r<h/bh;r++) for(let c=-1;c<w/bw+1;c++){ const x=c*bw+(r%2)*bw/2, k=.82+rng()*.3; g.fillStyle=`rgb(${168*k|0},${72*k|0},${52*k|0})`; g.fillRect(x+1,r*bh+1,bw-2,bh-2); }
    for(let i=0;i<1800;i++){ g.fillStyle=`rgba(0,0,0,${rng()*.08})`; g.fillRect(rng()*w,rng()*h,2,2); } }, true); brickT.repeat.set(.45,.45);
  const deckT=ctex(256,256,(g,w,h)=>{ const pw=21; for(let i=0;i*pw<w+pw;i++){ const k=.85+rng()*.3; g.fillStyle=`rgb(${128*k|0},${86*k|0},${54*k|0})`; g.fillRect(i*pw,0,pw-2,h); for(let j=0;j<6;j++){ g.fillStyle=`rgba(40,22,10,${.15+rng()*.2})`; g.fillRect(i*pw+rng()*pw,rng()*h,1.2,18+rng()*40); } g.fillStyle='rgba(20,10,5,.5)'; g.fillRect(i*pw+pw-2,0,2,h); } }, true); deckT.repeat.set(.35,.35);
  const graniteT=ctex(256,256,(g,w,h)=>{ g.fillStyle='#a7a39a'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=64) for(let x=0;x<w;x+=128){ const v=150+rng()*34|0; g.fillStyle=`rgb(${v},${v-3},${v-9})`; g.fillRect(x+((y/64)%2)*64+1,y+1,126,62); g.fillRect(x+((y/64)%2)*64+1-w,y+1,126,62); }
    for(let i=0;i<5000;i++){ const v=rng()<.5?50:235; g.fillStyle=`rgba(${v},${v},${v},${rng()*.28})`; g.fillRect(rng()*w,rng()*h,1.6,1.6); } }, true); graniteT.repeat.set(.6,.6);
  const lawnT=W.TX.grass.clone(); lawnT.wrapS=lawnT.wrapT=THREE.RepeatWrapping; lawnT.repeat.set(1/3.2,1/3.2); lawnT.needsUpdate=true;
  const M={
    lawn: new THREE.MeshStandardMaterial({map:lawnT, color:0xbfdc92, roughness:1, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-1}),
    pave: new THREE.MeshStandardMaterial({map:paveT, roughness:.86, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2}),
    brick: new THREE.MeshStandardMaterial({map:brickT, roughness:.9, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2}),
    board: new THREE.MeshStandardMaterial({map:deckT, roughness:.8, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3}),
    granite: new THREE.MeshStandardMaterial({map:graniteT, roughness:.7}),
    bed: colorMat(0x22332a,{roughness:1, polygonOffset:true, polygonOffsetFactor:-2}), soil: colorMat(0x4a3526,{roughness:1}),
    stoneW: colorMat(0xe6e1d6,{roughness:.7}), stoneG: colorMat(0xb9b3a7,{roughness:.75}), rock: colorMat(0x8f8a80,{roughness:.9}),
    iron: colorMat(0x26332c,{roughness:.45, metalness:.5}), ironB: colorMat(0x1b1d21,{roughness:.45, metalness:.6}), steel: colorMat(0xc9ced4,{roughness:.3, metalness:.85}),
    yellow: colorMat(0xffc531,{roughness:.45, metalness:.2}), blue: colorMat(0x2f7fd8,{roughness:.45, metalness:.2}), red: colorMat(0xe2483a,{roughness:.5}),
    green: colorMat(0x35b26a,{roughness:.5}), orange: colorMat(0xff8a2a,{roughness:.5}), white: colorMat(0xf4f2ec,{roughness:.55}), log: colorMat(0x7a5432,{roughness:.85}),
    rubR: colorMat(0xb8564a,{roughness:.95, polygonOffset:true, polygonOffsetFactor:-3}), rubG: colorMat(0x4f9a5c,{roughness:.95, polygonOffset:true, polygonOffsetFactor:-3}), rubY: colorMat(0xe8b23a,{roughness:.95, polygonOffset:true, polygonOffsetFactor:-4}),
    wood: MAT.wood, deck: MAT.deck, dark: MAT.dark, stone: MAT.stone, lamp: MAT.lamp,
    lilyG: colorMat(0x3f8a3a,{roughness:.6}), lilyG2: colorMat(0x5aa246,{roughness:.6}), lotus: colorMat(0xff9fc4,{roughness:.6}), lotusW: colorMat(0xfff4f0,{roughness:.6}),
  };
  const wN=W.TX.waterN.clone(); wN.wrapS=wN.wrapT=THREE.RepeatWrapping; wN.repeat.set(.18,.18); wN.needsUpdate=true;
  const waterMat=new THREE.MeshStandardMaterial({color:0x2b6f74, roughness:.06, metalness:.15, normalMap:wN, normalScale:new THREE.Vector2(.35,.35), transparent:true, opacity:.84, envMapIntensity:1.35}); waterMat.userData.noMerge=true;
  const dynMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.5, metalness:.2});

  /* ============================== 1. CÂY (khối gộp dùng chung cho công viên + vỉa hè, lay theo gió) ============================== */
  const TREES={tall:[], shade:[], flame:[], purple:[], willow:[], cone:[]};
  function vcGeo(parts){ const list=[];
    for(const p of parts){ const {g:g0, c, x=0, y=0, z=0, sx=1, sy=1, sz=1, rx=0, ry=0, rz=0, jit=0, blob=false}=p; let g=g0.index?g0.toNonIndexed():g0.clone(); if(g.attributes.uv) g.deleteAttribute('uv');
      const pos=g.attributes.position, nor=g.attributes.normal;
      if(blob){ for(let i=0;i<pos.count;i++){ let X=pos.getX(i), Y=pos.getY(i), Z=pos.getZ(i); const k=1+(hash(X*3.1,Y*3.1,Z*3.1)-.5)*jit; X*=k; Y*=k; Z*=k; pos.setXYZ(i,X,Y,Z); const l=Math.hypot(X,Y,Z)||1; nor.setXYZ(i,X/l,Y/l,Z/l); } }
      _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); g.applyMatrix4(_m4.compose(_v.set(x,y,z), _q, _s.set(sx,sy,sz)));
      const n=pos.count, a=new Float32Array(n*3), col=new THREE.Color(c);
      for(let i=0;i<n;i++){ const ly=(pos.getY(i)-(y-sy))/(2*sy), sh=blob ? .72+.36*clamp(ly,0,1) : 1; a[i*3]=col.r*sh; a[i*3+1]=col.g*sh; a[i*3+2]=col.b*sh; }
      g.setAttribute('color', new THREE.Float32BufferAttribute(a,3)); list.push(g); }
    return mergeGeometries(list,false); }
  const ico=(r,d=1)=>new THREE.IcosahedronGeometry(r,d);
  const blobs=(list,col)=>list.map(([x,y,z,r,c2,sy])=>({g:ico(1,1), c:c2||col, x,y,z, sx:r, sy:r*(sy||.85), sz:r, jit:.32, blob:true}));
  const TGEO={
    // cổ thụ tán cao: thân trơn 6 m, tán xoè rộng ở trên (không che camera góc 3)
    tall: vcGeo([{g:CY(.3,.5,7.4,8), c:0x5a4434, y:3.7}, {g:CY(.1,.18,3.2,6), c:0x5a4434, x:1.1, y:6.8, rz:-.75}, {g:CY(.1,.18,3.2,6), c:0x5a4434, x:-1.0, y:6.9, z:.4, rz:.8}, {g:CY(.09,.15,2.8,6), c:0x5a4434, z:-1.0, y:6.9, rx:-.75},
      ...blobs([[0,9.2,0,3.3,0,.55],[2.6,8.7,.6,2.2,0x4b8a3c,.6],[-2.5,8.8,-.7,2.3,0x376f30,.6],[.4,10.3,-.3,2.4,0x5a9a42,.55],[-.8,9.4,2.4,2.1,0x447f37,.6],[1.2,9.3,-2.4,2.1,0x3d7533,.6]],0x3f7a35)]),
    shade: vcGeo([{g:CY(.15,.26,3.4,7), c:0x5b4636, y:1.7}, {g:CY(.06,.1,1.6,5), c:0x5b4636, x:.45, y:3.0, rz:-.7}, {g:CY(.06,.1,1.5,5), c:0x5b4636, x:-.4, y:3.1, z:.2, rz:.75},
      ...blobs([[0,4.5,0,2.0],[1.3,4.1,.5,1.45,0x4b8a3c],[-1.2,4.2,-.6,1.5,0x376f30],[.3,5.4,-.3,1.35,0x5a9a42],[-.5,4.8,1.1,1.25,0x447f37],[.9,4.9,-1.1,1.25,0x3d7533]],0x3f7a35)]),
    flame: vcGeo([{g:CY(.14,.24,3.6,7), c:0x5e4a3a, y:1.8}, {g:CY(.05,.09,1.7,5), c:0x5e4a3a, x:.6, y:3.5, rz:-.95}, {g:CY(.05,.09,1.7,5), c:0x5e4a3a, x:-.6, y:3.5, rz:.95},
      ...blobs([[0,4.6,0,2.3,0,.42],[1.6,4.4,.4,1.4,0x58923d,.5],[-1.6,4.45,-.3,1.45,0x4c8636,.5],[.2,4.5,1.5,1.3,0,.5],[-.2,4.5,-1.5,1.3,0,.5]],0x4f8a37),
      ...blobs([[.6,5.15,.3,.62,0xe2462c],[-.9,5.05,.6,.55,0xf0602a],[1.4,4.85,-.6,.5,0xe2462c],[-1.5,4.85,-.8,.52,0xd8402a],[.1,5.2,-1.0,.5,0xf26b2e],[-.3,5.0,1.4,.48,0xe2462c],[1.0,4.9,1.2,.45,0xf0602a]],0xe2462c)]),
    purple: vcGeo([{g:CY(.12,.2,3.2,7), c:0x6e5a4a, y:1.6},
      ...blobs([[0,4.1,0,1.6],[.9,3.8,.4,1.1,0x58964a],[-.9,3.9,-.3,1.15,0x447f3c],[.1,4.8,.1,1.05,0x5d9c4c]],0x4c8a3f),
      ...blobs([[.5,4.8,.6,.48,0xa66fd6],[-.7,4.6,.5,.45,0x9257c4],[.8,4.3,-.7,.44,0xb683e0],[-.4,5.0,-.5,.42,0xa66fd6],[1.2,4.0,.3,.38,0x9257c4],[-1.2,4.1,-.4,.4,0xb683e0]],0xa66fd6)]),
    willow: vcGeo([{g:CY(.17,.3,3.4,7), c:0x5a4a39, y:1.7, rz:.06}, ...blobs([[0,3.9,0,1.55,0,.5],[.7,4.1,.3,1.0,0x6f9d44],[-.6,4.05,-.4,1.05,0x5f8f3a],[0,4.5,0,.9,0x78a84a]],0x5f8f3a)]),
    cone: vcGeo([{g:CY(.08,.12,1.0,6), c:0x5a4636, y:.5}, {g:new THREE.ConeGeometry(1.0,1.8,9), c:0x2f5e34, y:1.6}, {g:new THREE.ConeGeometry(.78,1.5,9), c:0x386b3a, y:2.4}, {g:new THREE.ConeGeometry(.52,1.2,9), c:0x427a41, y:3.1}]),
  };
  const swayU={value:0};
  const willowT=ctex(128,256,(g,w,h)=>{ g.clearRect(0,0,w,h); const cols=['#3f6b28','#4f7f2f','#5f8f3a','#6f9d44','#7fae4f'];
    for(let i=0;i<16;i++){ let x=4+rng()*(w-8); const len=h*(.5+rng()*.5); for(let y=0;y<len;y+=5){ x+=(rng()-.5)*1.4; g.fillStyle=cols[Math.floor(rng()*cols.length)]; g.save(); g.translate(x,y); g.rotate((rng()-.5)*.9); g.fillRect(-1.6,-3.2,3.2,6.4); g.restore(); } } }, true);
  const willowMat=new THREE.MeshStandardMaterial({map:willowT, alphaTest:.5, side:THREE.DoubleSide, roughness:.85});
  willowMat.onBeforeCompile=sh=>{ sh.uniforms.uT=swayU; sh.vertexShader=sh.vertexShader.replace('#include <common>', `#include <common>
uniform float uT;`).replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef USE_INSTANCING
{ float ph=instanceMatrix[3].x*.37+instanceMatrix[3].z*.23; float hk=max(0.,4.1-position.y)*.035;
  transformed.x+=sin(uT*1.3+ph)*hk; transformed.z+=cos(uT*1.05+ph*1.7)*hk*.8; }
#endif`); }; willowMat.customProgramCacheKey=()=>'qcWillowSway';
  const willowCurtain=(()=>{ const parts=[]; for(const [r,n,h0] of [[1.5,26,2.5],[1.0,14,2.2]]) for(let i=0;i<n;i++){ const a=i/n*TAU+hash(r,i,1)*.2, h=h0*(.75+hash(r,i,2)*.45), p=new THREE.PlaneGeometry(.75,h);
      p.translate(0,-h/2,0); p.rotateX(.08); p.rotateY(-a+Math.PI/2); p.translate(Math.cos(a)*r, 4.0, Math.sin(a)*r); parts.push(p.toNonIndexed()); } return mergeGeometries(parts,false); })();
  function addTree(kind, x, z, s=1, tag='cây', check=true){ const r=(kind==='tall'?.48:kind==='cone'?.22:kind==='purple'?.26:.32)*s; reserve(x,z,r+.15,tag,check); TREES[kind].push({x,z,s,r:rng()*TAU}); circles.push({x,z,r}); out.trees++; }

  /* ============================== 2. ĐỒ NGOÀI TRỜI ============================== */
  const SEATLIST=[], LANT=[];
  function stoneBench(x,z,rot,tag='ghế đá', y0=0){ const f=[Math.sin(rot),Math.cos(rot)], r=[Math.cos(rot),-Math.sin(rot)];
    for(const s of [-1,1]) CK.O.add(B(.26,.4,.42), M.stoneG, x+r[0]*s*.66,y0+.2,z+r[1]*s*.66, rot);
    CK.O.add(B(1.8,.09,.48), M.stoneG, x,y0+.445,z, rot); addSeg(x-r[0]*.88,z-r[1]*.88,x+r[0]*.88,z+r[1]*.88,.25); reserve(x,z,.95,tag);
    const seats=W.addBench ? W.addBench({x:x+f[0]*.02, z:z+f[1]*.02, rot, len:1.75, y:y0+.49, floor:y0+.02, label:'🪑 Ngồi ghế đá (E · C)'}) : [-1,1].map(s=>W.addSeat({x:x+r[0]*s*.45+f[0]*.02, z:z+r[1]*s*.45+f[1]*.02, rot, y:y0+.49, floor:y0+.02, label:'🪑 Ngồi ghế đá (E · C)'})); SEATLIST.push(...seats); return {x,z,rot,f,r,seats}; }
  // ghế gỗ nguyên khối (kiểu thân gỗ xẻ đôi) – dọc sàn gỗ ven hồ
  function logBench(x,z,rot,tag='ghế gỗ khối', label='🌲 Ngồi ghế gỗ ven hồ (E · C)'){ const f=[Math.sin(rot),Math.cos(rot)], r=[Math.cos(rot),-Math.sin(rot)];
    CK.O.add(B(2.0,.22,.55), M.log, x,.38,z, rot); for(const s of [-1,1]) CK.O.add(B(.42,.27,.5), M.log, x+r[0]*s*.7,.14,z+r[1]*s*.7, rot); CK.O.add(B(2.0,.38,.14), M.log, x-f[0]*.24,.68,z-f[1]*.24, rot, -.12);
    addSeg(x-r[0]*.98,z-r[1]*.98,x+r[0]*.98,z+r[1]*.98,.3); reserve(x,z,1.05,tag);
    const seats=W.addBench ? W.addBench({x, z, rot, len:1.9, y:.5, floor:.06, label}) : [-1,1].map(s=>W.addSeat({x:x+r[0]*s*.48, z:z+r[1]*s*.48, rot, y:.5, floor:.06, label})); SEATLIST.push(...seats); return {x,z,rot,f,r,seats}; }
  function woodBench(x,z,rot,tag='ghế gỗ', label='🪑 Ngồi băng ghế (E · C)', chk=true){ const f=[Math.sin(rot),Math.cos(rot)], r=[Math.cos(rot),-Math.sin(rot)];
    for(const s of [-1,1]){ const lx=x+r[0]*s*.8, lz=z+r[1]*s*.8; CK.O.add(B(.06,.44,.5), M.iron, lx,.22,lz, rot); CK.O.add(B(.06,.5,.06), M.iron, lx-f[0]*.24,.68,lz-f[1]*.24, rot, -.18); CK.O.add(B(.06,.05,.56), M.iron, lx,.62,lz, rot); }
    for(let i=0;i<4;i++){ const k=-.18+i*.12; CK.O.add(B(1.82,.04,.09), M.wood, x+f[0]*k,.46,z+f[1]*k, rot); }
    for(let i=0;i<3;i++){ const k=.6+i*.13; CK.O.add(B(1.82,.08,.035), M.wood, x-f[0]*(.25+(k-.6)*.18),k,z-f[1]*(.25+(k-.6)*.18), rot, -.18); }
    addSeg(x-r[0]*.9,z-r[1]*.9,x+r[0]*.9,z+r[1]*.9,.28); reserve(x,z,1.0,tag,chk);
    const seats=W.addBench ? W.addBench({x, z, rot, len:1.75, y:.48, floor:.02, label}) : [-1,1].map(s=>W.addSeat({x:x+r[0]*s*.45, z:z+r[1]*s*.45, rot, y:.48, floor:.02, label})); SEATLIST.push(...seats); return {x,z,rot,f,r,seats}; }
  // đèn lồng đen cổ điển (sàn gỗ) · đèn trụ cầu tròn trắng (đường chạy)
  function lantern(x,z,tag='đèn'){ CK.O.add(CY(.16,.2,.25,8), M.ironB, x,.13,z); CK.O.add(CY(.05,.07,2.7,8), M.ironB, x,1.5,z); CK.O.add(CY(.13,.09,.12,8), M.ironB, x,2.86,z);
    CK.O.add(CY(.15,.11,.36,6), M.lamp, x,3.1,z); CK.O.add(new THREE.ConeGeometry(.22,.22,6), M.ironB, x,3.38,z); CK.O.add(new THREE.SphereGeometry(.04,6,4), M.ironB, x,3.52,z);
    circles.push({x,z,r:.14}); reserve(x,z,.3,tag); GLOW.add(x,3.1,z,2.8,0xffc477,.95); LANT.push([x,z]); }
  function globeLamp(x,z,tag='đèn cầu'){ CK.O.add(CY(.1,.13,.2,10), M.white, x,.1,z); CK.O.add(CY(.045,.06,3.1,8), M.white, x,1.65,z); CK.O.add(new THREE.SphereGeometry(.26,14,10), M.lamp, x,3.4,z);
    circles.push({x,z,r:.12}); reserve(x,z,.25,tag,false); GLOW.add(x,3.4,z,2.6,0xfff0d0,.85); }
  function bin(x,z){ CK.O.add(CY(.22,.2,.7,10), M.iron, x,.35,z); CK.O.add(CY(.24,.24,.06,10), M.steel, x,.72,z); circles.push({x,z,r:.24}); reserve(x,z,.3,'thùng rác'); }
  function flowerBed(pts, tag, cols, h=.32){ CK.O.add(slab(pts,[],h), M.stoneW, SO.x,.02,SO.z); CK.G.add(flat(pts), M.soil, SO.x,h+.025,SO.z);
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(const [x,z] of pts){ x0=Math.min(x0,x); x1=Math.max(x1,x); z0=Math.min(z0,z); z1=Math.max(z1,z); }
    for(let z=z0+.14;z<z1-.08;z+=.17) for(let x=x0+.14;x<x1-.08;x+=.17){ const jx=x+(rng()-.5)*.08, jz=z+(rng()-.5)*.08; if(!inPoly(jx,jz,pts)) continue; FLW.push({x:jx, y:h+.1+rng()*.06, z:jz, s:.8+rng()*.5, c:pick2(cols)}); if(rng()<.35) BUSH.push({x:jx,y:h+.03,z:jz,s:.16+rng()*.06,c:0x3f7f37}); }
    if(pts.length===4 && Math.abs(pts[0][1]-pts[1][1])<1e-6) boxes.push({x0, x1, z0, z1}); else circles.push({x:(x0+x1)/2, z:(z0+z1)/2, r:Math.max(x1-x0,z1-z0)/2});
    reserve((x0+x1)/2,(z0+z1)/2,Math.min(x1-x0,z1-z0)/2,tag); }
  function hedge(x0,z0,x1,z1,tag){ const L=Math.hypot(x1-x0,z1-z0), n=Math.max(2,Math.round(L/.55)); for(let i=0;i<=n;i++){ const k=i/n; BUSH.push({x:x0+(x1-x0)*k+(rng()-.5)*.08, y:.25, z:z0+(z1-z0)*k+(rng()-.5)*.08, s:.38+rng()*.1, c:rng()<.5?0x3a7a34:0x467f3a}); if(rng()<.25) FLW.push({x:x0+(x1-x0)*k, y:.62, z:z0+(z1-z0)*k, s:1.2, c:pick2([0xff4fa0,0xff6b8a,0xffffff])}); }
    const w=.38; boxes.push({x0:Math.min(x0,x1)-w, x1:Math.max(x0,x1)+w, z0:Math.min(z0,z1)-w, z1:Math.max(z0,z1)+w}); keep(Math.min(x0,x1)-w,Math.min(z0,z1)-w,Math.max(x0,x1)+w,Math.max(z0,z1)+w,tag); }
  function fillPlanter(x,z,w,d,cols){ for(let i=0;i<10;i++) BUSH.push({x:x+(rng()-.5)*w*.85, y:.58, z:z+(rng()-.5)*d*.7, s:.17+rng()*.06, c:rng()<.5?0x3f7f37:0x4a8a3c}); for(let i=0;i<26;i++) FLW.push({x:x+(rng()-.5)*w*.9, y:.66+rng()*.1, z:z+(rng()-.5)*d*.8, s:.9+rng()*.5, c:cols[i%cols.length]}); }
  function fillPot(x,z,cols,big){ const h=big?.72:.6; BUSH.push({x, y:h+.12, z, s:big?.36:.3, c:0x3f7f37}); for(let i=0;i<(big?18:12);i++){ const a=rng()*TAU, rr2=rng()*(big?.32:.26); FLW.push({x:x+Math.cos(a)*rr2, y:h+.2+rng()*.15, z:z+Math.sin(a)*rr2, s:1+rng()*.5, c:cols[i%cols.length]}); } }
  const zl=(t,s,o)=>makeLabel(t, s, Object.assign({h:.42, fade:28}, o));   // nhãn khu vực: chỉ hiện khi lại gần (≤ ~28 m)


  /* ============================== 3. HÌNH HỌC: HỒ CÓ EO · ĐƯỜNG CHẠY GẠCH ĐỎ · SÀN GỖ ============================== */
  const PK={x0:161.5, x1:236.5, z0:15.5, z1:184.5}, LC={x:199, z:101}, WY=.15;   // đất công viên (trong hàng rào cây) · tâm hồ · cao độ mặt nước
  const wob=t=>1+.03*Math.sin(3*t+.7)+.018*Math.sin(5*t+2.1)+.01*Math.sin(8*t+.4);
  // Hồ Ngọc: 2 thuỳ Bắc – Nam, eo thắt ở giữa (z = 101) → Cầu Vòm bắc ngang eo
  const lake=shapeOf(t=>{ const s=Math.sin(t), c=Math.cos(t), w=wob(t); return [LC.x+18*c*(1-.52*Math.exp(-s*s/.09))*w, LC.z+57*s*w]; });
  // đường chạy bộ: siêu elip (n = 2,4) ôm sát hàng rào → bãi cỏ rộng giữa đường chạy và hồ, 4 góc ngoài đường chạy làm khu riêng
  const spw=(v,e)=>Math.sign(v)*Math.abs(v)**e;
  const track=shapeOf(t=>[LC.x+33*spw(Math.cos(t),1/1.2), LC.z+75*spw(Math.sin(t),1/1.2)]);
  const RIM=.55, BWK=3.55, TW=5.5;   // bờ kè đá 0,55 m · sàn gỗ ven hồ tới 3,55 m · đường chạy rộng 5,5 m
  const PRIM=lake.poly(RIM,300), PBW=lake.poly(BWK,300), PTI=track.poly(-TW/2,420), PTO=track.poly(TW/2,420);
  const zoneAt=(x,z)=>{ if(x<PK.x0||x>PK.x1||z<PK.z0||z>PK.z1) return 'out'; if(inPoly(x,z,PBW)) return inPoly(x,z,PRIM)?'lake':'deck'; if(inPoly(x,z,PTO) && !inPoly(x,z,PTI)) return 'track'; return inPoly(x,z,PTI)?'in':'outer'; };
  const PATHS=[]; const path=(x0,z0,x1,z1)=>{ PATHS.push({x0,z0,x1,z1}); return rect(x0,z0,x1,z1); };
  const onPath=(x,z,r=0)=>PATHS.some(p=>x>p.x0-r && x<p.x1+r && z>p.z0-r && z<p.z1+r);
  // chỗ trống trên cỏ (không chạm hồ / sàn gỗ / đường chạy / lối đi / đồ đã đặt / khu đã giữ)
  function lawnOK(x,z,r){ for(const [dx,dz] of [[0,0],[r,0],[-r,0],[0,r],[0,-r]]){ const w=zoneAt(x+dx,z+dz); if(w!=='in' && w!=='outer') return false; } if(onPath(x,z,r)) return false; return !hit(x,z,r); }
  const JOGI=lane(track,-1.35,420), JOGO=lane(track,1.35,420), DECK=lane(lake,2.05,300);   // làn chạy trong / ngoài · làn đi dạo giữa sàn gỗ

  /* ---------- mặt đất: cỏ · đường chạy gạch đỏ + bó vỉa đá + vạch chia làn · sàn gỗ ven hồ ---------- */
  CK.G.add(flat(rect(PK.x0,PK.z0,PK.x1,PK.z1)), M.lawn, SO.x,.036,SO.z);
  CK.G.add(flat(PTO,[PTI]), M.brick, SO.x,.05,SO.z);
  { const curbM=M.stoneW; for(const pts of [track.poly(-TW/2-.1,220), track.poly(TW/2+.1,220)]) for(let i=0;i<pts.length;i++){ const p=pts[i], q=pts[(i+1)%pts.length], L=Math.hypot(q[0]-p[0],q[1]-p[1]);
      CK.G.add(B(.2,.1,L+.03), curbM, (p[0]+q[0])/2,.06,(p[1]+q[1])/2, Math.atan2(q[0]-p[0],q[1]-p[1])); }
    const mid=track.poly(0,300); for(let i=0;i<mid.length;i+=2){ const p=mid[i], q=mid[(i+1)%mid.length], L=Math.hypot(q[0]-p[0],q[1]-p[1]);   // vạch trắng đứt chia 2 làn chạy
      CK.G.add(B(.08,.01,L*.9), M.white, (p[0]+q[0])/2,.057,(p[1]+q[1])/2, Math.atan2(q[0]-p[0],q[1]-p[1])); } }
  CK.G.add(slab(PBW,[PRIM],.05), M.board, SO.x,.01,SO.z);                                        // sàn gỗ ven hồ (mặt sàn cao 6 cm)
  { const e=lake.poly(BWK+.06,240); for(let i=0;i<e.length;i++){ const p=e[i], q=e[(i+1)%e.length], L=Math.hypot(q[0]-p[0],q[1]-p[1]); CK.G.add(B(.12,.09,L+.03), M.log, (p[0]+q[0])/2,.045,(p[1]+q[1])/2, Math.atan2(q[0]-p[0],q[1]-p[1])); } }

  /* ---------- hồ: đáy · bờ kè granite · mặt nước gợn sóng phản chiếu trời ---------- */
  CK.G.add(flat(lake.poly(.08,300)), M.bed, SO.x,.044,SO.z);
  CK.O.add(slab(PRIM,[lake.poly(-.06,300)],.22), M.granite, SO.x,.03,SO.z);
  const water=new THREE.Mesh(flat(lake.poly(.02,300)), waterMat); water.position.set(SO.x,WY,SO.z); water.receiveShadow=true; water.castShadow=false; water.renderOrder=1; water.userData.dynamic=true; scene.add(water);

  /* ---------- toạ độ cầu / đảo / bến ---------- */
  const BZ=LC.z, BWD=3.2, rimX=crossAt(PRIM,'z',BZ), bxa=rimX[0]-.3, bxb=rimX[rimX.length-1]+.3, BL=bxb-bxa, BX=(bxa+bxb)/2;   // Cầu Vòm ngang eo hồ
  const arch=t=>.27+1.0*Math.sin(Math.PI*clamp(t,0,1));
  const ISL={x:199, z:72, r:5.5}, ISY=.3;                                                                                       // đảo thủy đình (thuỳ Bắc)
  const IBX=199, IBW=2.6, rimZ=crossAt(PRIM,'x',IBX), zA=rimZ[0]-.3, zB=ISL.z-Math.sqrt((ISL.r-.25)**2-(IBW/2)**2)+.5, IL=zB-zA;  // cầu gỗ từ mũi Bắc ra đảo
  const iar=t=>.22+.08*t+.32*Math.sin(Math.PI*clamp(t,0,1));
  const DZ=130, DW=2.4, rimD=crossAt(PRIM,'z',DZ), DXS=rimD[rimD.length-1]+.25, DX0=DXS-7.6;                                  // bến thuyền thiên nga (bờ Đông thuỳ Nam)
  const DOCK={x0:DX0, xs:DXS, z:DZ, tip:{x:DX0+.9, z:DZ}, park:[[DX0+2.6,DZ-2.9,-Math.PI/2],[DX0+2.6,DZ+2.9,-Math.PI/2]]};

  /* ---------- đá cảnh ven bờ · hoa súng, sen · cỏ lau ---------- */
  const nearGap=(x,z,m=0)=>(Math.abs(z-BZ)<BWD/2+1.2+m && x>bxa-2 && x<bxb+2) || (Math.abs(x-IBX)<IBW/2+1.2+m && z<ISL.z) || (Math.abs(z-DZ)<DW/2+1.5+m && x>DX0-2);
  for(let i=0;i<120;i++){ const t=i/120*TAU+rng()*.03, [x,z]=lake.off(t,-.05-rng()*.28); if(nearGap(x,z)) continue; const s=.22+rng()*.32;
    CK.O.add(new THREE.DodecahedronGeometry(s,0), M.rock, x,.16+s*.25,z, rng()*6, rng(), rng(), 1.3,.6+rng()*.3,1); }
  const LPOLY=lake.poly(-.8,200), inWater=(x,z,pad=0)=>inPoly(x,z,LPOLY) && Math.hypot(x-ISL.x,z-ISL.z)>ISL.r+.6+pad && !nearGap(x,z,pad);
  for(let i=0;i<70;i++){ let x,z,k=0; do{ x=LC.x-16+rng()*32; z=rng()<.5 ? 46+rng()*20 : 136+rng()*18; k++; } while(k<30 && !inWater(x,z,.4));
    if(k>=30) continue; const r=.24+rng()*.22; CK.O.add(new THREE.CircleGeometry(r,12,.3,TAU-.6), rng()<.5?M.lilyG:M.lilyG2, x,WY+.012,z, rng()*6, -Math.PI/2);
    if(rng()<.3){ const f=rng()<.6?M.lotus:M.lotusW; CK.O.add(new THREE.ConeGeometry(.08,.11,6,1,true), f, x+.05,WY+.07,z, 0, Math.PI); CK.O.add(new THREE.SphereGeometry(.04,6,4), M.yellow, x+.05,WY+.06,z); } }
  const REEDS=[]; for(const d of [35,62,118,150,205,232,250,300,322,342]){ const t=dg(d); for(let i=0;i<12;i++){ const [x,z]=lake.off(t+(rng()-.5)*.08,-.25-rng()*.4); if(nearGap(x,z)) continue; REEDS.push([x,z,.7+rng()*.7]); } }

  /* ---------- va chạm mép hồ: vòng đoạn thẳng có lời nhắn (khe: Cầu Vòm · cầu ra đảo · bến thuyền) ---------- */
  const LAKE_MSG='🌊 Mép Hồ Ngọc – không lội xuống nước được! Qua hồ bằng Cầu Vòm (giữa hồ) · ra đảo bằng cầu gỗ (mũi Bắc) · đạp thuyền ở bến (bờ Đông).';
  ringSegs(lake.poly(.3,320), [{x0:bxa-1, x1:bxb+1, z0:BZ-BWD/2, z1:BZ+BWD/2}, {x0:IBX-IBW/2, x1:IBX+IBW/2, z0:PK.z0, z1:ISL.z}, {x0:DX0-1, x1:DXS+3, z0:DZ-DW/2, z1:DZ+DW/2}], LAKE_MSG);

  /* ============================== 4. CẦU VÒM HỒ NGỌC (ngang eo hồ, dài ~19 m) ============================== */
  const V3=(x,y,z)=>new THREE.Vector3(x,y,z), tube=(pts,r,n=6)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length*2, r, n, false);
  function stoneLantern(x,z,tag='đèn đá'){ CK.O.add(B(.32,.2,.32), M.stoneG, x,.1,z); CK.O.add(B(.22,.62,.22), M.stoneG, x,.5,z); CK.O.add(B(.38,.32,.38), M.lamp, x,.97,z); CK.O.add(new THREE.ConeGeometry(.36,.24,4), M.stoneG, x,1.25,z, Math.PI/4);
    GLOW.add(x,.97,z,1.7,0xffcf8a,.85); circles.push({x,z,r:.24}); reserve(x,z,.26,tag,false); }
  { const dk=new THREE.BoxGeometry(BL,.16,BWD,32,1,1); dk.translate(0,-.08,0); const q=dk.attributes.position; for(let i=0;i<q.count;i++){ const t=(q.getX(i)+BL/2)/BL; q.setY(i,q.getY(i)+arch(t)); } dk.computeVertexNormals();
    CK.O.add(dk, M.deck, BX,0,BZ);
    for(const sz of [-1,1]){ const beam=[], top=[], mid=[]; for(let i=0;i<=24;i++){ const t=i/24, x=bxa+t*BL, y=arch(t); beam.push(V3(x,y-.13,BZ+sz*(BWD/2+.04))); top.push(V3(x,y+.95,BZ+sz*(BWD/2-.07))); mid.push(V3(x,y+.5,BZ+sz*(BWD/2-.07))); }
      CK.O.add(tube(beam,.11), M.dark, 0,0,0); CK.O.add(tube(top,.05), M.dark, 0,0,0); CK.O.add(tube(mid,.028,5), M.dark, 0,0,0);
      for(let i=0;i<=18;i++){ const t=i/18, x=bxa+t*BL, y=arch(t); CK.O.add(B(.09,.97,.09), M.dark, x,y+.46,BZ+sz*(BWD/2-.07)); } }
    for(const t of [.27,.73]){ const x=bxa+t*BL, h=arch(t)-.08; CK.O.add(B(.7,h+.4,BWD*.78), M.stone, x,(h+.4)/2-.2,BZ); }
    const NS=26; for(let i=0;i<NS;i++){ const t=(i+.5)/NS; plats.push({t:'r', x:bxa+t*BL, z:BZ, c:1, s:0, hw:BL/NS/2+.02, hd:BWD/2, h:arch(t)}); }
    for(const sz of [-1,1]) addSeg(bxa, BZ+sz*BWD/2, bxb, BZ+sz*BWD/2, .06, undefined, undefined, '🌉 Lan can Cầu Vòm – đi tiếp qua cầu hoặc quay lại nhé!');
    for(const x of [bxa-.2, bxb+.2]) for(const sz of [-1,1]) stoneLantern(x, BZ+sz*(BWD/2+.32), 'đèn đầu Cầu Vòm'); }
  zl('🌉 Cầu Vòm Hồ Ngọc', 'Đứng giữa cầu bấm E để cho cá koi ăn', {x:BX, y:arch(.5)+2.3, z:BZ, fade:30});

  /* ============================== 5. ĐẢO THỦY ĐÌNH + CẦU GỖ ĐỎ RA ĐẢO ============================== */
  const lawnI=new THREE.MeshStandardMaterial({map:lawnT, color:0xbfdc92, roughness:1});
  { const im=new THREE.Mesh(new THREE.CylinderGeometry(ISL.r,ISL.r+.5,.7,48), [M.granite, lawnI, M.granite]); im.position.set(ISL.x, ISY-.35, ISL.z); im.receiveShadow=true; scene.add(im);
    plats.push({t:'c', x:ISL.x, z:ISL.z, r:ISL.r-.15, h:ISY});
    CK.O.add(slab(circ(ISL.x,ISL.z,ISL.r+.06,48),[circ(ISL.x,ISL.z,ISL.r-.4,48)],.08), M.granite, SO.x,ISY-.02,SO.z);
    ringSegs(circ(ISL.x,ISL.z,ISL.r-.25,56), [{x0:IBX-IBW/2, x1:IBX+IBW/2, z0:ISL.z-ISL.r-1, z1:ISL.z}], '🌊 Mép đảo – quay lại bằng cầu gỗ phía Bắc nhé!');
    const red=colorMat(0x9b2d20,{roughness:.5}), tile=colorMat(0x34404f,{roughness:.6}), gold=colorMat(0xd8a63a,{roughness:.3, metalness:.7}), Y=ISY;
    CK.O.add(CY(3.35,3.5,.28,6), M.stoneG, ISL.x,Y+.14,ISL.z, Math.PI/6); plats.push({t:'c', x:ISL.x, z:ISL.z, r:3.3, h:Y+.28});
    for(let i=0;i<6;i++){ const a=i/6*TAU, x=ISL.x+Math.cos(a)*2.85, z=ISL.z+Math.sin(a)*2.85; CK.O.add(CY(.14,.16,2.7,10), red, x,Y+1.63,z); circles.push({x,z,r:.17}); }
    CK.O.add(CY(3.05,3.05,.22,6,1,true), red, ISL.x,Y+3.0,ISL.z, Math.PI/6); CK.O.add(new THREE.ConeGeometry(4.3,1.9,6), tile, ISL.x,Y+4.05,ISL.z, Math.PI/6);
    for(let i=0;i<6;i++){ const a=i/6*TAU+Math.PI/6; CK.O.add(new THREE.ConeGeometry(.12,.55,6), tile, ISL.x+Math.cos(a)*4.25,Y+3.32,ISL.z+Math.sin(a)*4.25); }
    CK.O.add(new THREE.SphereGeometry(.22,12,8), gold, ISL.x,Y+5.15,ISL.z); CK.O.add(CY(.05,.05,.6,6), gold, ISL.x,Y+5.5,ISL.z);
    reserve(ISL.x,ISL.z,3.6,'thủy đình',false);
    for(const a of [dg(30),dg(150),dg(270)]){ const x=ISL.x+Math.cos(a)*1.85, z=ISL.z+Math.sin(a)*1.85, rot=Math.atan2(Math.cos(a),Math.sin(a)), rx=Math.cos(a+Math.PI/2), rz=Math.sin(a+Math.PI/2);
      CK.O.add(B(1.7,.07,.42), M.wood, x,Y+.28+.43,z, rot); for(const s of [-1,1]) CK.O.add(B(.08,.42,.4), M.iron, x+rx*s*.75,Y+.28+.21,z+rz*s*.75, rot);
      addSeg(x-rx*.85,z-rz*.85,x+rx*.85,z+rz*.85,.22); for(const s of [-1,1]) SEATLIST.push(W.addSeat({x:x+rx*s*.42, z:z+rz*s*.42, rot, y:Y+.28+.46, floor:Y+.28, label:'🏯 Ngồi trong thủy đình ngắm hồ (E · C)'})); }
    zl('🏯 Thủy Đình Hồ Ngọc', 'Ra đảo bằng cầu gỗ đỏ từ mũi Bắc', {h:.5, x:ISL.x, y:Y+6.2, z:ISL.z, fade:30});
    // cầu gỗ đỏ ra đảo (dọc trục x = 199, từ mũi Bắc hồ)
    const dk=new THREE.BoxGeometry(IBW,.12,IL,1,1,22); dk.translate(0,-.06,0); const q=dk.attributes.position; for(let i=0;i<q.count;i++){ const t=(q.getZ(i)+IL/2)/IL; q.setY(i,q.getY(i)+iar(t)); } dk.computeVertexNormals();
    CK.O.add(dk, M.deck, IBX,0,(zA+zB)/2);
    for(const sx of [-1,1]){ const top=[]; for(let i=0;i<=20;i++){ const t=i/20; top.push(V3(IBX+sx*(IBW/2-.05), iar(t)+.9, zA+t*IL)); } CK.O.add(tube(top,.05), red, 0,0,0);
      for(let i=0;i<=12;i++){ const t=i/12; CK.O.add(B(.08,.92,.08), red, IBX+sx*(IBW/2-.05), iar(t)+.44, zA+t*IL); }
      addSeg(IBX+sx*IBW/2, zA, IBX+sx*IBW/2, zB+.3, .06, undefined, undefined, '🌉 Lan can cầu ra đảo'); }
    for(const t of [.3,.65]) CK.O.add(B(IBW*.7,1.2,.45), M.stone, IBX,-.45,zA+t*IL);
    const NS=18; for(let i=0;i<NS;i++){ const t=(i+.5)/NS; plats.push({t:'r', x:IBX, z:zA+t*IL, c:1, s:0, hw:IBW/2, hd:IL/NS/2+.02, h:iar(t)}); }
    for(const sx of [-1,1]) stoneLantern(IBX+sx*1.75, zA+.1, 'đèn đầu cầu đảo'); }

  /* ============================== 6. BẾN THUYỀN THIÊN NGA (bờ Đông thuỳ Nam) ============================== */
  { CK.O.add(B(DXS-DX0,.12,DW), M.deck, (DX0+DXS)/2,.2,DZ); for(let x=DX0+.3;x<DXS;x+=1.6) for(const s of [-1,1]) CK.O.add(CY(.08,.08,1.4,8), M.dark, x,-.45,DZ+s*(DW/2-.1));
    plats.push({t:'r', x:(DX0+DXS)/2, z:DZ, c:1, s:0, hw:(DXS-DX0)/2, hd:DW/2, h:.26});
    const MSG='⚓ Mép bến thuyền – thuê thuyền thiên nga ở đầu bến (E)';
    for(const s of [-1,1]) addSeg(DX0, DZ+s*DW/2, DXS+.3, DZ+s*DW/2, .06, undefined, undefined, MSG); addSeg(DX0, DZ-DW/2, DX0, DZ+DW/2, .06, undefined, undefined, MSG);
    for(const s of [-1,1]){ CK.O.add(CY(.1,.12,.5,8), M.ironB, DX0+.25,.45,DZ+s*(DW/2-.15)); for(let x=DX0+1.5;x<DXS-.5;x+=1.9) CK.O.add(B(.07,.7,.07), M.white, x,.6,DZ+s*(DW/2-.04)); CK.O.add(B(DXS-DX0-.8,.05,.06), M.white, (DX0+DXS)/2+.2,.95,DZ+s*(DW/2-.04)); }
    const bT=ctex(512,128,(g,w2,h)=>{ g.fillStyle='#fff8ec'; g.fillRect(0,0,w2,h); g.fillStyle='#1d5f86'; g.font='800 46px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🦢 THUYỀN THIÊN NGA · 20 💰',w2/2,h/2); });
    const sx=218.4, sz=DZ-2.2; CK.O.add(CY(.05,.05,2.2,8), M.iron, sx,1.1,sz); CK.O.add(B(.05,.45,1.8), new THREE.MeshStandardMaterial({map:bT, roughness:.6}), sx,2.0,sz); circles.push({x:sx, z:sz, r:.1}); reserve(sx,sz,.3,'biển bến thuyền',false); }


  /* ============================== 7. LỐI ĐI + SÂN LÁT ============================== */
  const GP={x0:186, x1:212, z0:PK.z0, z1:22.6};                                    // quảng trường cổng Bắc (giữa hàng rào và đường chạy)
  const PW={x:178, z:BZ, r:6.6}, PE={x:220, z:BZ, r:6.6};                          // 2 quảng trường đầu Cầu Vòm
  const paveList=[ path(GP.x0,GP.z0,GP.x1,GP.z1), path(197.4,GP.z1,200.6,zA+.4),  // cổng → qua đường chạy → mũi Bắc hồ (cầu ra đảo)
    path(PK.x0,BZ-1.4,PW.x-PW.r+.6,BZ+1.4), path(PW.x+PW.r-.6,BZ-1.4,bxa+.3,BZ+1.4), path(bxb-.3,BZ-1.4,PE.x-PE.r+.6,BZ+1.4), path(PE.x+PE.r-.6,BZ-1.4,PK.x1,BZ+1.4),   // trục Đông – Tây qua cầu
    path(197.4,177.5,200.6,PK.z1),                                                 // cổng Nam → đường chạy
    path(171.6,54.8,184.4,57.2), path(213.6,54.8,226.4,57.2), path(172.2,144.8,183.6,147.2), path(214.4,144.8,225.8,147.2),   // lối nhánh đường chạy ↔ sàn gỗ
    path(PK.x0,PK.z0,177,31), path(212.2,PK.z0,221.6,20.2), path(194.2,160.4,203.8,166.6) ];   // sân cosplay · bãi xe đạp · trước sân khấu
  for(const p of paveList) CK.G.add(flat(p), M.pave, SO.x,.046,SO.z);
  for(const c of [PW,PE]){ CK.G.add(flat(circ(c.x,c.z,c.r,40)), M.pave, SO.x,.047,SO.z); PATHS.push({x0:c.x-c.r, x1:c.x+c.r, z0:c.z-c.r, z1:c.z+c.r}); }
  // viền đá trắng quanh 2 quảng trường đầu cầu
  for(const c of [PW,PE]){ const a=circ(c.x,c.z,c.r,40); for(let i=0;i<a.length;i++){ const p=a[i], q=a[(i+1)%a.length]; if(Math.abs((p[1]+q[1])/2-BZ)<1.6) continue; const L=Math.hypot(q[0]-p[0],q[1]-p[1]); CK.G.add(B(.16,.08,L+.02), M.stoneW, (p[0]+q[0])/2,.06,(p[1]+q[1])/2, Math.atan2(q[0]-p[0],q[1]-p[1])); } }

  /* ============================== 8. CỔNG BẮC + SƠ ĐỒ + BIỂN CHỈ DẪN ============================== */
  { const gz=16.0;
    for(const x of [194.4,203.6]){ CK.O.add(B(.6,3.9,.6), M.granite, x,1.95,gz); CK.O.add(B(.8,.24,.8), M.stoneG, x,3.98,gz); CK.O.add(B(.8,.3,.8), M.stoneG, x,.15,gz); circles.push({x,z:gz,r:.45}); reserve(x,gz,.45,'trụ cổng',false);
      CK.O.add(B(.34,.38,.34), M.lamp, x,4.3,gz); CK.O.add(new THREE.ConeGeometry(.32,.24,4), M.ironB, x,4.6,gz, Math.PI/4); GLOW.add(x,4.3,gz,2.6,0xffc477,.95); }
    const signT=ctex(1024,192,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#1f5a3a'); gr.addColorStop(1,'#123d27'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.strokeStyle='#e9d48a'; g.lineWidth=8; g.strokeRect(10,10,w-20,h-20);
      g.fillStyle='#fff6d8'; g.textAlign='center'; g.textBaseline='middle'; g.font='800 74px "Segoe UI",sans-serif'; g.fillText('ĐẠI CÔNG VIÊN HỒ NGỌC',w/2,h/2-18); g.font='600 32px "Segoe UI",sans-serif'; g.fillStyle='#e9d48a'; g.fillText('QC CITY · CENTRAL PARK · MỞ CỬA 24/7',w/2,h/2+48); });
    const sm=new THREE.MeshStandardMaterial({map:signT, roughness:.6});
    CK.O.add(B(6.6,1.24,.16), sm, 199,3.55,gz); CK.O.add(B(8.6,.16,.34), M.dark, 199,4.25,gz); CK.O.add(B(8.6,.12,.34), M.dark, 199,2.88,gz);
    // bảng sơ đồ (quay về trục cổng)
    const mapT=ctex(384,640,(g,w,h)=>{ g.fillStyle='#f3efe2'; g.fillRect(0,0,w,h); g.fillStyle='#1f5a3a'; g.fillRect(0,0,w,48); g.fillStyle='#fff'; g.font='700 22px "Segoe UI",sans-serif'; g.textAlign='center'; g.fillText('SƠ ĐỒ CÔNG VIÊN HỒ NGỌC',w/2,32);
      const X=x=>12+(x-PK.x0)/(PK.x1-PK.x0)*(w-24), Y=z=>56+(z-PK.z0)/(PK.z1-PK.z0)*(h-68);
      const fillP=(pts,c)=>{ g.fillStyle=c; g.beginPath(); pts.forEach(([x,z],i)=>i?g.lineTo(X(x),Y(z)):g.moveTo(X(x),Y(z))); g.closePath(); g.fill(); };
      g.fillStyle='#bfe0a0'; g.fillRect(X(PK.x0),Y(PK.z0),X(PK.x1)-X(PK.x0),Y(PK.z1)-Y(PK.z0)); fillP(PTO,'#b5533e'); fillP(PTI,'#bfe0a0'); fillP(PBW,'#a77b4f'); fillP(PRIM,'#4f9fc0');
      g.fillStyle='#5aa246'; g.beginPath(); g.arc(X(ISL.x),Y(ISL.z),X(ISL.x+ISL.r)-X(ISL.x),0,7); g.fill(); g.fillStyle='#6b4a2a'; g.fillRect(X(bxa),Y(BZ-1.6),X(bxb)-X(bxa),Y(BZ+1.6)-Y(BZ-1.6)); g.fillRect(X(IBX-1.3),Y(zA),X(IBX+1.3)-X(IBX-1.3),Y(zB)-Y(zA)); g.fillRect(X(DX0),Y(DZ-1.2),X(DXS)-X(DX0),Y(DZ+1.2)-Y(DZ-1.2));
      g.font='20px "Segoe UI Emoji","Segoe UI",sans-serif'; g.textBaseline='middle';
      for(const [t,x,z] of [['🦸',169,23],['🚲',217,18],['💪',229,24],['🌸',183,45.5],['🌺',214.7,44],['🧘',176.6,74],['🏸',221.5,75.5],['⛲',PW.x,PW.z],['🔎',PE.x,PE.z],['🏯',ISL.x,ISL.z],['🎋',176,125],['☕',222.5,125],['🦢',211,DZ],['🎤',199,168],['🎢',169.5,176],['🧺',228,176],['🥤',207,20],['🍦',189,19.6]]) g.fillText(t,X(x),Y(z));
      g.fillStyle='#c0392b'; g.font='600 14px "Segoe UI",sans-serif'; g.fillText('📍 Bạn đang ở đây',X(199),Y(20.5)); });
    const bx=192.8, bz=18.6; for(const s of [-1,1]) CK.O.add(B(.08,2.0,.08), M.iron, bx,1.0,bz+s*.62); CK.O.add(B(.06,1.95,1.36), M.iron, bx,1.65,bz);
    const mp=new THREE.Mesh(new THREE.PlaneGeometry(1.22,1.88), new THREE.MeshStandardMaterial({map:mapT, roughness:.6})); mp.position.set(bx+.035,1.65,bz); mp.rotation.y=Math.PI/2; scene.add(mp);
    boxes.push({x0:bx-.1, x1:bx+.1, z0:bz-.72, z1:bz+.72}); reserve(bx,bz,.75,'bảng sơ đồ',false);
    INTER.push({x:bx+.95, z:bz, r:1.3, prio:.4, label:'🗺️ Xem sơ đồ công viên (E)', action:openMapInfo});
    // biển chỉ dẫn nhiều hướng
    const arrowT=ctex(256,320,(g,w,h)=>{ g.fillStyle='#fff'; g.fillRect(0,0,w,h); const rows=[['#2f7fd8','◀ Cosplay · Sân chơi 🎢'],['#35b26a','Thể dục 💪 · Xe đạp ▶'],['#8a6440','▼ Đảo thủy đình 🏯'],['#1d6b5f','▼ Cầu Vòm · Café ☕'],['#c0392b','▼▼ Sân khấu Cỏ 🎤']];
      rows.forEach(([c,t],i)=>{ g.fillStyle=c; g.fillRect(4,4+i*63,w-8,58); g.fillStyle='#fff'; g.font='700 21px "Segoe UI Emoji","Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(t,w/2,33+i*63); }); });
    const sx=205.2, sz=17.4; CK.O.add(CY(.05,.05,2.8,8), M.iron, sx,1.4,sz); CK.O.add(B(.9,1.12,.04), new THREE.MeshStandardMaterial({map:arrowT, roughness:.6}), sx,2.05,sz, Math.PI); circles.push({x:sx,z:sz,r:.12}); reserve(sx,sz,.3,'biển chỉ dẫn',false);
    for(const [x0,x1] of [[188.6,191.6],[206.4,209.4]]) flowerBed(rect(x0,16.3,x1,17.1), 'bồn hoa cổng', [0xff4f6d,0xffd23f,0xffffff,0xff9fc4]);
    bin(186.6,21.9); bin(211.5,16.3);
  }
  function openMapInfo(){ const m=ui.modal('🌳 Đại công viên Hồ Ngọc · QC City Central Park');
    m.body.innerHTML=`<p class="muted">Lá phổi xanh giữa thành phố: hồ lớn có eo, sàn gỗ ven hồ, đường chạy gạch đỏ vòng ngoài và nhiều khu riêng.</p><div class="grid">${[
      ['🌉','Cầu Vòm Hồ Ngọc','Bắc qua eo hồ. Đứng giữa cầu bấm E để cho cá koi ăn (2 💰).'],
      ['🏯','Đảo thủy đình','Cầu gỗ đỏ từ mũi Bắc hồ ra đảo – ngồi trong đình ngắm hồ.'],
      ['🦢','Bến thuyền thiên nga','Bờ Đông thuỳ Nam: thuê thuyền đạp quanh hồ (20 💰).'],
      ['🏃','Đường chạy gạch đỏ','Vòng ngoài ~380 m, 2 làn, đèn cầu trắng. Sàn gỗ ven hồ dành cho đi dạo.'],
      ['💪','Thể dục · xà đơn','Góc Đông Bắc – bấm E ở máy trống để tập.'],
      ['🧘','Yoga · dưỡng sinh','Bãi cỏ phía Tây – còn 1 thảm trống, bấm E để tập cùng lớp.'],
      ['🏸','Sân cầu lông','Bãi cỏ phía Đông – xem 2 bạn đánh cầu.'],
      ['⛲','Đài phun nước ước nguyện','Đầu cầu phía Tây – ném 1 xu ước một điều.'],
      ['☕','Café Bên Hồ + bàn cờ','Bờ Đông thuỳ Nam, cạnh bến thuyền.'],
      ['🎤','Sân khấu Cỏ','Bờ Nam – tối có nhạc acoustic, lên hát được.'],
      ['🎢','Sân chơi · 🧺 dã ngoại','2 góc phía Nam ngoài đường chạy.'],
      ['🦸','Góc cosplay','Góc Tây Bắc, sát vỉa hè Đại lộ Hồ Ngọc.'],
    ].map(([i,n,d])=>`<div class="card"><div class="ic">${i}</div><b>${n}</b><small>${d}</small></div>`).join('')}</div>`; }

  /* ============================== 9. GÓC GIẢI KHÁT Ở CỔNG: 3 máy bán nước + quầy nước + xe kem ============================== */
  const VEND=[];
  { const vendT=ctex(768,512,(g,w,h)=>{ const th=[['#1565c0','#64b5f6','NƯỚC SUỐI & TRÀ'],['#c62828','#ff8a80','NƯỚC NGỌT · TĂNG LỰC'],['#2e7d32','#a5d6a7','CÀ PHÊ · SỮA']];
      th.forEach(([a,b,t],i)=>{ const x0=i*256; const gr=g.createLinearGradient(x0,0,x0,h); gr.addColorStop(0,a); gr.addColorStop(1,'#111'); g.fillStyle=gr; g.fillRect(x0,0,256,h);
        g.fillStyle='#0d1117'; g.fillRect(x0+18,70,170,300); for(let r=0;r<4;r++) for(let c=0;c<4;c++){ const hue=(i*90+r*40+c*25)%360; g.fillStyle=`hsl(${hue},70%,55%)`; g.fillRect(x0+28+c*40,82+r*72,26,50); g.fillStyle='#fff'; g.fillRect(x0+30+c*40,84+r*72,6,46); g.fillStyle='#ffd23f'; g.fillRect(x0+28+c*40,136+r*72,26,8); }
        g.fillStyle=b; g.fillRect(x0+196,90,44,120); g.fillStyle='#222'; g.fillRect(x0+204,230,28,40); g.fillStyle='#111'; g.fillRect(x0+30,400,190,70); g.fillStyle='#fff'; g.font='700 22px "Segoe UI",sans-serif'; g.textAlign='center'; g.fillText(t,x0+128,44); g.font='600 16px "Segoe UI",sans-serif'; g.fillText('LẤY NƯỚC',x0+125,440); }); });
    const vendM=new THREE.MeshStandardMaterial({map:vendT, emissive:0xffffff, emissiveMap:vendT, emissiveIntensity:.35, roughness:.35}); vendM.userData.noMerge=true; const VFR=[];
    const KINDS=[
      {name:'Máy nước suối & trà', icon:'💧', col:M.blue, items:[['💧 Nước suối',6,null,0,'Mát lạnh, giải khát tức thì.'],['🍵 Trà xanh không độ',10,null,0,'Thanh mát, ít ngọt.'],['🍋 Trà chanh mật ong',12,'energy',5,'+5 phút chạy nhanh.']]},
      {name:'Máy nước ngọt & tăng lực', icon:'🥤', col:M.red, items:[['🥤 Nước ngọt có ga',10,null,0,'Sảng khoái!'],['⚡ Nước tăng lực',15,'energy',10,'+10 phút chạy nhanh (cộng dồn).'],['🧃 Nước ép cam',12,'energy',4,'Vitamin C + 4 phút chạy nhanh.']]},
      {name:'Máy cà phê & sữa', icon:'☕', col:M.green, items:[['☕ Cà phê sữa lon',12,'coffee',10,'+20% thưởng quiz trong 10 phút.'],['🥛 Sữa tươi',9,null,0,'Bổ dưỡng.'],['🥤 Trà sữa đóng chai',14,'coffee',6,'+20% thưởng quiz 6 phút.']]}];
    KINDS.forEach((k,i)=>{ const x=203.0+i*1.15, z=21.75;   // mặt máy quay về phía Bắc (quảng trường cổng)
      CK.O.add(B(1.0,1.95,.78), k.col, x,1.0,z); CK.O.add(B(1.04,.12,.82), M.ironB, x,2.02,z); CK.O.add(B(1.0,.08,.78), M.ironB, x,.04,z);
      const fr=new THREE.PlaneGeometry(.9,1.6); const uv=fr.attributes.uv; for(let j=0;j<uv.count;j++) uv.setX(j,(i+uv.getX(j))/3);
      fr.rotateY(Math.PI); fr.translate(x,1.08,z-.395); VFR.push(fr.toNonIndexed());
      boxes.push({x0:x-.52, x1:x+.52, z0:z-.42, z1:z+.42}); reserve(x,z,.55,'máy bán nước',false);
      const can=new THREE.Mesh(CY(.035,.035,.12,10), k.col); can.visible=false; can.userData.dynamic=true; scene.add(can);
      const V={...k, x, z, can, t:0}; VEND.push(V);
      INTER.push({x, z:z-1.05, r:1.0, prio:.7, label:`${k.icon} ${k.name} – mua nước (E)`, action:()=>openShop(k.icon+' '+k.name, k.items, ()=>dropCan(V))}); });
    { const fm=new THREE.Mesh(mergeGeometries(VFR,false), vendM); fm.userData.dynamic=true; fm.castShadow=false; fm.receiveShadow=true; scene.add(fm); }
    W.HOOK.onFrame.push(()=>{ vendM.emissiveIntensity=.3+night()*.9; });
  }
  const KIOSK={x:209.6, z:20.85};
  { const {x:kx, z:kz}=KIOSK; CK.O.add(B(2.6,1.05,1.3), M.wood, kx,.53,kz); CK.O.add(B(2.75,.06,1.45), M.white, kx,1.08,kz); CK.O.add(B(2.6,1.3,.08), M.wood, kx,1.75,kz+.62);
    for(const s of [-1,1]) CK.O.add(B(.08,1.4,.08), M.dark, kx+s*1.25,1.8,kz-.6);
    const awT=ctex(256,64,(g,w,h)=>{ for(let i=0;i<8;i++){ g.fillStyle=i%2?'#ffffff':'#2a9d8f'; g.fillRect(i*32,0,32,h); } g.fillStyle='rgba(0,0,0,.15)'; g.fillRect(0,h-8,w,8); });
    CK.O.add(B(3.0,.06,1.7), new THREE.MeshStandardMaterial({map:awT, roughness:.8}), kx,2.55,kz-.15, 0,.18);
    const ksT=ctex(512,128,(g,w,h)=>{ g.fillStyle='#fff8ec'; g.fillRect(0,0,w,h); g.fillStyle='#1d6b5f'; g.font='800 48px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🧃 QUẦY NƯỚC CỔNG BẮC',w/2,h/2); });
    CK.O.add(B(2.4,.45,.05), new THREE.MeshStandardMaterial({map:ksT, roughness:.6}), kx,2.2,kz+.57);
    for(let i=0;i<5;i++) CK.O.add(CY(.06,.05,.16,8), [M.orange,M.green,M.red,M.white,M.yellow][i], kx-.9+i*.45,1.19,kz-.2);
    boxes.push({x0:kx-1.35, x1:kx+1.35, z0:kz-.7, z1:kz+.7}); reserve(kx,kz,1.3,'quầy nước',false);
    const MENU=[['🧊 Trà đá',4,null,0,'Đặc sản vỉa hè, mát lạnh.'],['🎋 Nước mía tắc',10,'energy',4,'Ngọt mát + 4 phút chạy nhanh.'],['🥥 Nước dừa tươi',15,'energy',8,'+8 phút chạy nhanh.'],['🥜 Sữa đậu nành',8,null,0,'Thơm béo.'],['☕ Cà phê muối',16,'coffee',12,'+20% thưởng quiz 12 phút.']];
    INTER.push({x:kx, z:kz-1.45, r:1.5, prio:.6, label:'🧃 Quầy nước Cổng Bắc – gọi nước (E)', action:()=>openShop('🧃 Quầy nước Cổng Bắc', MENU, ()=>{ if(KIOSK.o) say(KIOSK.o, pick(['Nước của bạn đây! 😊','Uống ngon nha!','Cảm ơn bạn nhiều!']), 2.4); })});
    zl('🥤 Góc giải khát', 'Máy bán nước tự động · quầy nước · xe kem', {x:206.5, y:3.4, z:20.4}); }
  const CART={x:188.9, z:19.6};
  { const {x,z}=CART; CK.O.add(B(1.5,.75,.75), M.white, x,.78,z); CK.O.add(B(1.55,.08,.8), M.blue, x,1.18,z); for(const s of [-1,1]) for(const t of [-1,1]) CK.O.add(CY(.22,.22,.06,14), M.ironB, x+s*.55,.22,z+t*.4, 0,0,Math.PI/2);
    CK.O.add(CY(.025,.025,1.5,6), M.steel, x,1.9,z); CK.O.add(new THREE.ConeGeometry(1.05,.45,10,1,true), new THREE.MeshStandardMaterial({map:ctex(256,32,(g,w,h)=>{ for(let i=0;i<10;i++){ g.fillStyle=['#ff6b8a','#fff4d6','#7ed6df','#fff4d6'][i%4]; g.fillRect(i*25.6,0,25.6,h); } }), side:THREE.DoubleSide, roughness:.8}), x,2.55,z);
    const icT=ctex(256,96,(g,w,h)=>{ g.fillStyle='#ff6b8a'; g.fillRect(0,0,w,h); g.fillStyle='#fff'; g.font='800 40px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🍦 KEM TƯƠI',w/2,h/2); });
    CK.O.add(B(1.2,.42,.02), new THREE.MeshStandardMaterial({map:icT, roughness:.6}), x,.82,z-.39);
    for(let i=0;i<4;i++) CK.O.add(new THREE.SphereGeometry(.07,8,6), [M.lotus,M.white,M.orange,M.green][i], x-.45+i*.3,1.27,z);
    boxes.push({x0:x-.8, x1:x+.8, z0:z-.45, z1:z+.45}); reserve(x,z,.85,'xe kem',false);
    const MENU=[['🍦 Kem ốc quế',10,null,0,'Vani + sô-cô-la.'],['🍡 Kem que đậu xanh',6,null,0,'Tuổi thơ ùa về!'],['🥥 Kem dừa trái',18,'energy',5,'Mát lạnh + 5 phút chạy nhanh.'],['🍨 Kem ly 3 viên',14,null,0,'Dâu · sầu riêng · cốm.']];
    INTER.push({x, z:z-1.05, r:1.3, prio:.6, label:'🍦 Mua kem (E)', action:()=>openShop('🍦 Xe kem tươi', MENU, ()=>{ if(CART.o) say(CART.o, pick(['Kem đây! Ăn nhanh kẻo chảy nha 😄','Ngon thì ghé nữa nha!','Mát lạnh luôn! 🍦']), 2.4); })}); }

  /* ============================== 10. BÃI XE ĐẠP (sát đường chạy, cạnh cổng Bắc – không ở đầu cầu) ============================== */
  { const z=18.2; for(let i=0;i<5;i++){ const x=213.6+i*1.75; CK.O.add(new THREE.TorusGeometry(.38,.03,6,14,Math.PI), M.steel, x,.02,z, Math.PI/2); }
    const bikeGeo=(col)=>vcGeo([{g:new THREE.TorusGeometry(.33,.035,6,18), c:0x1b1d21, x:-.52, y:.35}, {g:new THREE.TorusGeometry(.33,.035,6,18), c:0x1b1d21, x:.52, y:.35},
      {g:CY(.022,.022,1.0,5), c:col, x:0, y:.58, rz:Math.PI/2}, {g:CY(.022,.022,.62,5), c:col, x:-.22, y:.52, rz:-.75}, {g:CY(.022,.022,.6,5), c:col, x:.28, y:.52, rz:.65},
      {g:B(.22,.05,.09), c:0x1b1d21, x:-.32, y:.86}, {g:CY(.02,.02,.42,5), c:0x9aa0a6, x:.5, y:.95, rx:Math.PI/2}, {g:B(.28,.2,.22), c:0x7a6a55, x:.62, y:.75}]);
    const bm=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.5, metalness:.3});
    [[213.6,0x2f7fd8],[215.35,0xe2483a],[218.85,0x35b26a],[220.6,0xffc531]].forEach(([x,c])=>{ const m=new THREE.Mesh(bikeGeo(c), bm); m.position.set(x,0,z); m.rotation.y=Math.PI/2; m.castShadow=true; m.receiveShadow=true; scene.add(m); });
    boxes.push({x0:213.0, x1:221.2, z0:z-.85, z1:z+.85}); reserve(217.4,z,1.2,'bãi xe đạp',false);
    const pT=ctex(256,128,(g,w,h)=>{ g.fillStyle='#2f7fd8'; g.fillRect(0,0,w,h); g.fillStyle='#fff'; g.font='800 38px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🚲 BÃI XE ĐẠP',w/2,h/2); });
    CK.O.add(CY(.04,.04,2.2,8), M.iron, 221.3,1.1,16.3); CK.O.add(B(.9,.45,.04), new THREE.MeshStandardMaterial({map:pT, roughness:.6}), 221.3,2.0,16.3, Math.PI); circles.push({x:221.3, z:16.3, r:.1});
    zl('🚲 Bãi xe đạp', 'Gửi xe rồi chạy bộ vòng hồ', {x:217.4, y:2.4, z:18.2, fade:24}); }

  /* ============================== 11. KHU THỂ DỤC + XÀ ĐƠN XÀ KÉP (góc Đông Bắc, thảm cao su) ============================== */
  const GY={x0:221.8, x1:PK.x1, z0:PK.z0, z1:32};
  CK.G.add(flat(rect(GY.x0,GY.z0,GY.x1,GY.z1)), M.rubG, SO.x,.05,SO.z); for(let x=GY.x0+.6;x<GY.x1-.5;x+=2.0) CK.G.add(flat(rect(x,22.2,x+1.1,22.36)), M.rubY, SO.x,.052,SO.z);
  PATHS.push({x0:GY.x0, x1:GY.x1, z0:GY.z0, z1:GY.z1});
  const GYM=[];
  { const z=19.6;
    { const x=224.4; CK.O.add(B(.1,1.7,.1), M.blue, x-.35,.85,z); CK.O.add(B(.1,1.7,.1), M.blue, x+.35,.85,z); CK.O.add(CY(.04,.04,.8,8), M.yellow, x,1.62,z, 0,0,Math.PI/2); CK.O.add(CY(.03,.03,.8,8), M.yellow, x,1.25,z+.25, 0,0,Math.PI/2);
      const legGeo=vcGeo([{g:B(.06,1.3,.06), c:0xffc531, y:-.65},{g:B(.16,.04,.3), c:0x1b1d21, y:-1.28, z:.08}]);
      const legs=[-1,1].map(s=>{ const g=new THREE.Mesh(legGeo, dynMat); g.position.set(x+s*.17,1.45,z); g.castShadow=true; g.userData.dynamic=true; scene.add(g); return g; });
      GYM.push({x, z, name:'Máy đi bộ trên không', clip:'walk', face:0, uy:.12, anim:(t,on)=>{ const a=on?Math.sin(t*4.4)*.42:legs[0].rotation.x*.9; legs[0].rotation.x=a; legs[1].rotation.x=-a; } }); }
    { const x=226.4; CK.O.add(CY(.05,.05,1.3,8), M.blue, x,.65,z-.35); CK.O.add(CY(.03,.03,.7,8), M.yellow, x,1.3,z-.35, 0,0,Math.PI/2); const disk=new THREE.Mesh(vcGeo([{g:CY(.32,.34,.08,16), c:0xffc531},{g:B(.5,.012,.06), c:0x1b1d21, y:.045}]), dynMat); disk.position.set(x,.12,z+.05); disk.userData.dynamic=true; scene.add(disk);
      GYM.push({x, z:z+.05, name:'Máy xoay eo', clip:'idle', face:Math.PI, uy:.17, twist:true, anim:(t,on)=>{ disk.rotation.y=on?Math.sin(t*2.6)*.7:disk.rotation.y*.9; } }); }
    { const x=228.4; CK.O.add(B(.1,.55,.9), M.blue, x,.42,z); CK.O.add(B(.3,.06,.18), M.ironB, x,.72,z-.2); CK.O.add(CY(.03,.03,.5,8), M.yellow, x,1.0,z+.38, 0,0,Math.PI/2); CK.O.add(B(.05,.5,.05), M.blue, x,.8,z+.38);
      const crank=new THREE.Mesh(vcGeo([{g:CY(.16,.16,.04,14), c:0xc9ced4, rz:Math.PI/2},{g:B(.04,.3,.04), c:0x1b1d21}]), dynMat); crank.position.set(x,.38,z+.1); crank.userData.dynamic=true; scene.add(crank);
      GYM.push({x, z, name:'Xe đạp tại chỗ', clip:'idle', face:0, uy:.32, sit:true, anim:(t,on)=>{ if(on) crank.rotation.x=t*5; } }); }
    { const x=230.4; CK.O.add(CY(.06,.06,1.9,8), M.blue, x,.95,z+.2); const wh=new THREE.Mesh(vcGeo([{g:new THREE.TorusGeometry(.3,.03,6,20), c:0xffc531}, ...[0,1,2].map(i=>({g:B(.6,.03,.03), c:0xffc531, rz:i*Math.PI/3}))]), dynMat); wh.position.set(x,1.55,z); wh.userData.dynamic=true; scene.add(wh);
      GYM.push({x, z:z-.15, name:'Vòng xoay tay', clip:'idle', face:Math.PI, uy:.02, arms:true, anim:(t,on)=>{ if(on) wh.rotation.z=t*2.2; } }); }
    // xà đơn 3 tầng (dùng được: bấm E → treo người kéo xà) · xà kép · ghế gập bụng
    { const z2=27.0, H=[2.0,2.3,2.6], X=[231.2,233.0,234.8]; for(const x of [230.3,232.1,233.9,235.7]) CK.O.add(CY(.06,.06,2.7,8), M.steel, x,1.35,z2);
      X.forEach((x,i)=>CK.O.add(CY(.03,.03,1.8,8), M.steel, x,H[i],z2, 0,0,Math.PI/2));
      for(const x of [230.3,232.1,233.9,235.7]) circles.push({x, z:z2, r:.1});
      GYM.push({x:X[1], z:z2, name:'Xà đơn', clip:'idle', face:0, uy:0, bar:H[1], hang:true, anim:()=>{} });
      GYM.bar={x:X[2], z:z2, h:H[2]}; }
    { const x=226.2, z2=28.2; for(const s of [-1,1]){ CK.O.add(CY(.04,.04,1.6,8), M.steel, x+s*.32,1.15,z2, 0,Math.PI/2,Math.PI/2); for(const t of [-.7,.7]) CK.O.add(CY(.045,.045,1.15,8), M.steel, x+s*.32,.58,z2+t); circles.push({x:x+s*.32, z:z2-.7, r:.08}, {x:x+s*.32, z:z2+.7, r:.08}); } }
    { const x=223.6, z2=28.2; CK.O.add(B(.45,.06,1.5), M.blue, x,.55,z2, 0,-.25); CK.O.add(B(.06,.5,.06), M.steel, x,.28,z2-.6); CK.O.add(B(.06,.3,.06), M.steel, x,.18,z2+.6); boxes.push({x0:x-.25, x1:x+.25, z0:z2-.8, z1:z2+.8}); }
    for(const m of GYM){ circles.push({x:m.x, z:m.z, r:m.hang?.12:.42}); reserve(m.x,m.z,.45,'máy '+m.name,false); m.busy=null; m.t=0; m.ux=m.x; m.uz=m.z;
      m.inter={x:m.x, z:m.z+(m.hang?.8:.95), r:1.2, prio:.6, get label(){ return m.busy ? `💪 ${m.busy==='me'?'Đang tập':'Có người đang tập'} – ${m.name}` : `💪 Tập ${m.name} (E)`; }, action:()=>startEx(m)}; INTER.push(m.inter); }
    zl('💪 Khu thể dục · xà đơn xà kép', 'Bấm E ở máy trống để tập', {x:229, y:3.4, z:24}); }

  /* ============================== 12. GÓC COSPLAY (Tây Bắc, cách đầu cầu > 70 m) – nhóm cosplay do streetlife.js dựng ============================== */
  { const z=29.9, x0=163.2, x1=173.4;
    const wT=ctex(1024,256,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#2b1055'); gr.addColorStop(1,'#d53369'); g.fillStyle=gr; g.fillRect(0,0,w,h);
      for(let i=0;i<70;i++){ g.fillStyle=`rgba(255,255,255,${.3+rng()*.6})`; const x=rng()*w, y=rng()*h, r=1+rng()*3; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); }
      g.fillStyle='#fff'; g.font='900 76px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🦸 COSPLAY CORNER',w/2,h/2-20); g.font='600 34px "Segoe UI",sans-serif'; g.fillStyle='#ffe3f1'; g.fillText('QC CITY · chụp ảnh cùng các siêu anh hùng',w/2,h/2+52); });
    CK.O.add(B(x1-x0,2.6,.14), new THREE.MeshStandardMaterial({map:wT, roughness:.5}), (x0+x1)/2,1.65,z); for(const x of [x0-.1,x1+.1]){ CK.O.add(B(.2,3.1,.2), M.ironB, x,1.55,z); circles.push({x,z,r:.16}); }
    boxes.push({x0, x1, z0:z-.1, z1:z+.1}); reserve((x0+x1)/2,z,.4,'phông chụp ảnh',false);
    for(const x of [x0+.6,x1-.6]){ CK.O.add(CY(.04,.06,3.4,8), M.ironB, x,1.7,z-1.6); CK.O.add(CY(.16,.1,.3,10), M.steel, x,3.35,z-1.75, 0,.7); GLOW.add(x,3.3,z-1.9,2,0xfff3d6,.7); circles.push({x, z:z-1.6, r:.08}); }
    woodBench(175.6,20.6,-Math.PI/2,'ghế cosplay','🪑 Ngồi xem cosplay (E · C)',false); bin(175.8,23.6); }

  /* ============================== 13. VƯỜN HOA TRÒN (lưỡi liềm Tây Bắc) + GIÀN HOA GIẤY (lưỡi liềm Đông Bắc) ============================== */
  { const gx=183.2, gz=45.5; flowerBed(circ(gx,gz,1.35,26),'bồn giữa vườn',[0xffffff,0xffd23f,0xff9fc4],.3);
    CK.O.add(CY(.2,.28,.9,10), M.stoneG, gx,.75,gz); CK.O.add(CY(.5,.5,.06,24), M.stoneG, gx,1.23,gz); CK.O.add(B(.04,.32,.46), M.steel, gx,1.4,gz);
    const sets=[[0xff4f6d,0xff9fc4],[0xffd23f,0xff8a2a],[0xb06cff,0xffffff],[0xff3fa0,0xffd23f],[0x4fc3ff,0xffffff],[0xff6b3d,0xfff1a8]];
    for(let i=0;i<6;i++){ const a=i/6*TAU+dg(30), x=gx+Math.cos(a)*2.6, z=gz+Math.sin(a)*2.6; flowerBed(circ(x,z,.62,16),'bồn vườn hoa',sets[i],.28); }
    zl('🌷 Vườn Hoa Tròn', 'Đồng hồ mặt trời giữa vườn', {x:gx, y:2.4, z:gz, fade:24}); }
  { const x0=211.8, x1=217.6, z0=42.2, z1=45.6, pink=[0xff3fa0,0xe8248a,0xff6fc0,0xffffff,0xff9a3c];
    for(const x of [x0+.15,(x0+x1)/2,x1-.15]) for(const z of [z0+.15,z1-.15]){ CK.O.add(B(.18,2.6,.18), M.white, x,1.3,z); circles.push({x,z,r:.14}); }
    for(const z of [z0+.15,z1-.15]) CK.O.add(B(x1-x0+.4,.18,.1), M.white, (x0+x1)/2,2.65,z);
    for(let x=x0;x<=x1+.01;x+=.45) CK.O.add(B(.07,.1,z1-z0+.5), M.white, x,2.78,(z0+z1)/2);
    for(let i=0;i<190;i++){ const x=x0+rng()*(x1-x0), z=z0+rng()*(z1-z0); FLW.push({x, y:2.88+rng()*.16, z, s:1.3+rng()*.9, c:pick2(pink)}); if(rng()<.5) BUSH.push({x, y:2.84, z, s:.28+rng()*.12, c:0x3d7a33}); }
    for(let i=0;i<50;i++){ const side=rng()<.5, x=side?(rng()<.5?x0+.15:x1-.15):x0+rng()*(x1-x0), z=side?z0+.15+rng()*(z1-z0-.3):(rng()<.5?z0+.15:z1-.15); FLW.push({x:x+(rng()-.5)*.2, y:.6+rng()*2.1, z:z+(rng()-.5)*.2, s:1.1+rng()*.6, c:pick2(pink)}); }
    woodBench((x0+x1)/2-1.2,(z0+z1)/2+.2,dg(200),'ghế giàn hoa','🌸 Ngồi dưới giàn hoa giấy (E · C)',false); woodBench((x0+x1)/2+1.5,(z0+z1)/2+.2,dg(160),'ghế giàn hoa 2','🌸 Ngồi dưới giàn hoa giấy (E · C)',false);
    for(let x=x0+.3;x<x1;x+=.5) for(const z of [z0+.6,(z0+z1)/2,z1-.6]) STR.push([x+(rng()-.5)*.1, 2.55-rng()*.08, z]);
    zl('🌸 Giàn hoa giấy', null, {x:(x0+x1)/2, y:3.4, z:(z0+z1)/2, fade:26}); }

  /* ============================== 14. BÃI CỎ YOGA · DƯỠNG SINH (Tây) + SÂN CẦU LÔNG (Đông) ============================== */
  const YOGA={x:176.6, mats:[66,70,74], free:78, coach:61.6, taichi:[[175.0,84.6],[178.2,84.6]]};
  { const matM=[0x7ec8b8,0xf2a65a,0xb48ad6,0x6fa8dc,0xe57373];
    [YOGA.coach,...YOGA.mats,YOGA.free].forEach((z,i)=>{ CK.G.add(new THREE.PlaneGeometry(.75,1.85), colorMat(matM[i%matM.length],{roughness:.95, polygonOffset:true, polygonOffsetFactor:-3}), YOGA.x,.052,z, 0,-Math.PI/2); reserve(YOGA.x,z,.6,'thảm yoga',false); });
    INTER.push({x:YOGA.x+1.1, z:YOGA.free, r:1.2, prio:.6, get label(){ return YM.busy==='me' ? '🧘 Đang tập yoga cùng lớp' : '🧘 Tập yoga cùng lớp trên thảm trống (E)'; }, action:()=>startEx(YM)});
    zl('🧘 Bãi cỏ Yoga · Dưỡng sinh', 'Lớp yoga chiều · còn 1 thảm trống', {x:YOGA.x, y:2.8, z:72}); }
  const YM={x:YOGA.x, z:YOGA.free, name:'Yoga', clip:'idle', face:Math.PI, uy:0, yoga:true, anim:()=>{}, busy:null, t:0, ux:YOGA.x, uz:YOGA.free}; YM.inter={x:YOGA.x+1.1, z:YOGA.free};
  const BAD={x:221.5, z0:69, z1:82, net:75.5};
  { const g=colorMat(0x3f8f5a,{roughness:.9, polygonOffset:true, polygonOffsetFactor:-2}); CK.G.add(flat(rect(218.6,BAD.z0,224.4,BAD.z1)), g, SO.x,.047,SO.z);
    const L=(x0,z0,x1,z1)=>CK.G.add(flat(rect(x0,z0,x1,z1)), M.white, SO.x,.05,SO.z);
    L(218.6,BAD.z0,218.66,BAD.z1); L(224.34,BAD.z0,224.4,BAD.z1); L(219.06,BAD.z0,219.12,BAD.z1); L(223.88,BAD.z0,223.94,BAD.z1);
    L(218.6,BAD.z0,224.4,BAD.z0+.06); L(218.6,BAD.z1-.06,224.4,BAD.z1); L(218.6,BAD.net-1.98,224.4,BAD.net-1.92); L(218.6,BAD.net+1.92,224.4,BAD.net+1.98); L(221.47,BAD.z0,221.53,BAD.net-1.98); L(221.47,BAD.net+1.98,221.53,BAD.z1);
    for(const x of [218.4,224.6]){ CK.O.add(CY(.03,.04,1.55,8), M.white, x,.78,BAD.net); circles.push({x, z:BAD.net, r:.06}); }
    const netT=ctex(128,32,(g,w,h)=>{ g.clearRect(0,0,w,h); g.strokeStyle='rgba(30,30,30,.9)'; g.lineWidth=1; for(let x=0;x<w;x+=4){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); } for(let y=0;y<h;y+=4){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); } g.fillStyle='#fff'; g.fillRect(0,0,w,3); });
    netT.wrapS=THREE.RepeatWrapping; netT.repeat.set(6,1); const nm=new THREE.Mesh(new THREE.PlaneGeometry(6.2,.76), new THREE.MeshStandardMaterial({map:netT, transparent:true, alphaTest:.3, side:THREE.DoubleSide, roughness:.8})); nm.position.set(BAD.x,1.17,BAD.net); scene.add(nm);
    addSeg(218.4,BAD.net,224.6,BAD.net,.05,undefined,undefined,'🏸 Lưới cầu lông – đi vòng qua cột lưới nhé!');
    zl('🏸 Sân cầu lông', null, {x:BAD.x, y:3.2, z:BAD.net, fade:26}); }

  /* ============================== 15. 2 QUẢNG TRƯỜNG ĐẦU CẦU: ĐÀI PHUN NƯỚC (Tây) · TƯỢNG "KÍNH LÚP QC" (Đông) ============================== */
  const FOUNT={x:PW.x, z:PW.z};
  { const {x:fx,z:fz}=FOUNT; CK.O.add(slab(circ(fx,fz,3.0,40),[circ(fx,fz,2.55,40)],.45), M.granite, SO.x,0,SO.z); CK.G.add(flat(circ(fx,fz,2.6,40)), M.bed, SO.x,.05,SO.z);
    CK.O.add(CY(.55,.75,.9,16), M.stoneG, fx,.45,fz); CK.O.add(CY(1.1,1.0,.14,24), M.stoneG, fx,.95,fz); CK.O.add(CY(.22,.3,.7,12), M.stoneG, fx,1.35,fz); CK.O.add(new THREE.SphereGeometry(.3,14,10), M.stoneG, fx,1.85,fz);
    circles.push({x:fx, z:fz, r:3.05}); reserve(fx,fz,3.1,'đài phun nước',false);
    const fw=new THREE.Mesh(flat(circ(fx,fz,2.56,40)), waterMat); fw.position.set(SO.x,.33,SO.z); fw.userData.dynamic=true; fw.renderOrder=1; scene.add(fw);
    const jg=[]; for(let i=0;i<7;i++){ const a=i/6*TAU, r=i<6?1.75:0, g=new THREE.ConeGeometry(i<6?.07:.1, 1, 8, 1, true); g.translate(0,.5,0); if(i<6){ g.rotateZ(-.32); g.rotateY(-a); } g.translate(fx+Math.cos(a)*r, 0, fz+Math.sin(a)*r); jg.push(g.toNonIndexed()); }
    const jets=new THREE.Mesh(mergeGeometries(jg,false), new THREE.MeshStandardMaterial({color:0xdff4ff, transparent:true, opacity:.55, roughness:.1, envMapIntensity:1.5, depthWrite:false}));
    jets.position.y=.33; jets.userData.dynamic=true; jets.castShadow=false; scene.add(jets); FOUNT.jets=jets;
    INTER.push({x:fx+3.7, z:fz+1.9, r:1.6, prio:.5, label:'💰 Ném đồng xu ước nguyện (E · 1 💰)', action:()=>askPay(1,'💰 Ném 1 đồng xu xuống đài phun nước và ước một điều',()=>{ if(!spend(1)) return; burst(new THREE.Vector3(fx,1,fz),[0xffd23f,0xffffff,0x8fd3ff],40,2,1.2,-6,.1); toast(pick(['💰 Tõm! Chúc bạn sprint này không còn bug nào 🍀','💰 Điều ước đã gửi: lương tăng, deadline giãn 😄','💰 Ước gì test case nào cũng Pass ✅']),3600); })});
    for(const s of [-1,1]) woodBench(fx, fz+s*5.2, s<0?0:Math.PI, 'ghế đài phun nước', '⛲ Ngồi ngắm đài phun nước (E · C)', false);
    zl('⛲ Đài phun nước ước nguyện', 'Đầu cầu phía Tây', {x:fx, y:2.8, z:fz}); }
  { const x=PE.x, z=PE.z, bronze=colorMat(0x8a6a3a,{roughness:.35, metalness:.8});
    flowerBed(circ(x,z,1.7,28), 'bồn tượng', [0xffd23f,0xff8a2a,0xffffff]);
    CK.O.add(CY(.42,.5,.8,10), M.stoneG, x,.7,z); CK.O.add(CY(.07,.09,1.3,8), bronze, x+.24,1.65,z, 0,0,-.5);
    CK.O.add(new THREE.TorusGeometry(.5,.08,10,28), bronze, x-.14,2.4,z, Math.PI/2); const lens=new THREE.Mesh(new THREE.CircleGeometry(.48,24), new THREE.MeshStandardMaterial({color:0xbfe6ff, metalness:.2, roughness:.05, transparent:true, opacity:.35, envMapIntensity:2, side:THREE.DoubleSide}));
    lens.position.set(x-.14,2.4,z); lens.rotation.y=Math.PI/2; lens.userData.dynamic=true; scene.add(lens);
    CK.O.add(new THREE.SphereGeometry(.14,10,8), colorMat(0x2e7d32,{roughness:.4}), x-.12,2.4,z, 0,0,0, 1.3,.7,1);
    for(const a of [dg(45),dg(135),dg(225),dg(315)]){ const bx=x+Math.cos(a)*4.7, bz=z+Math.sin(a)*4.7; stoneBench(bx,bz,Math.atan2(x-bx,z-bz),'ghế quanh tượng',0); }
    zl('🔎 Tượng "Kính lúp QC"', 'Soi kỹ từng góc – tinh thần QA', {x, y:3.4, z}); }

  /* ============================== 16. VƯỜN ĐÁ – TRÚC (Tây Nam, góc yên tĩnh) ============================== */
  TREES.bamboo=[]; TGEO.bamboo=vcGeo([...[[0,0,0],[.25,0,.15],[-.2,0,.22],[.12,0,-.25],[-.28,0,-.12],[.3,0,-.05],[-.05,0,.32]].map(([x,,z],i)=>({g:CY(.035,.045,5.4+i%3*.5,6), c:i%2?0x6f9d3a:0x5f8f34, x, y:2.7+i%3*.25, z, rx:z*.18, rz:-x*.18})),
    ...blobs([[0,5.2,0,1.0,0x6fae4a,.6],[.5,4.6,.3,.75,0x5f9a3f,.6],[-.45,4.8,-.3,.8,0x78b552,.6],[.1,5.8,.1,.6,0x84bd5c,.6]],0x6fae4a)]);
  { const gr=colorMat(0xd8d4cb,{roughness:1, polygonOffset:true, polygonOffsetFactor:-2}); CK.G.add(flat(rect(173.4,116,178.8,135.5)), gr, SO.x,.046,SO.z);
    for(let z=116.6;z<135.2;z+=.42) CK.G.add(B(5.2,.012,.05), M.white, 176.1,.05,z);
    for(const [x,z,s] of [[174.6,119.2,.7],[177.4,121.5,.5],[175.2,126.4,.9],[177.8,129.6,.6],[174.4,133.2,.55],[176.6,134.4,.42]]){ CK.O.add(new THREE.DodecahedronGeometry(s,0), M.rock, x,s*.45,z, rng()*6, 0, 0, 1.4,.8,1.1); circles.push({x,z,r:s*1.1}); reserve(x,z,s*1.1,'đá cảnh',false); }
    for(const [x,z] of [[173.2,114.2],[178.9,114.6],[173.0,136.8],[178.6,137.0]]) addTree('bamboo',x,z,1,'trúc',false);
    stoneLantern(176.1,124.0,'đèn đá vườn');
    for(const z of [118.2,131.0]) stoneBench(179.6,z,Math.PI/2,'ghế vườn đá',0);
    zl('🎋 Vườn Đá – Trúc', 'Góc yên tĩnh ngồi ngắm hồ', {x:176.1, y:3.2, z:125}); }

  /* ============================== 17. CAFÉ BÊN HỒ + BÀN CỜ ĐÁ (Đông Nam, cạnh bến thuyền) ============================== */
  const CAFE={groups:[], order:{x:223.4, z:115.5}};
  { CK.G.add(flat(rect(218.8,112,226.4,138.5)), M.pave, SO.x,.047,SO.z); PATHS.push({x0:218.8, x1:226.4, z0:112, z1:138.5});
    const kx=225.2, kz=115.5; CK.O.add(B(1.3,1.05,3.4), M.wood, kx,.53,kz); CK.O.add(B(1.45,.06,3.55), M.white, kx,1.08,kz); CK.O.add(B(.08,1.4,3.4), M.wood, kx+.62,1.75,kz);
    for(const s of [-1,1]) CK.O.add(B(.08,2.6,.08), M.dark, kx-.6,1.3,kz+s*1.7); CK.O.add(B(2.4,.08,4.2), colorMat(0x2a9d8f,{roughness:.7}), kx+.1,2.65,kz, 0, 0, .12);
    const cT=ctex(512,112,(g,w2,h)=>{ g.fillStyle='#2a1a10'; g.fillRect(0,0,w2,h); g.fillStyle='#ffd8a0'; g.font='800 44px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('☕ CAFÉ BÊN HỒ',w2/2,h/2); });
    CK.O.add(B(.05,.42,2.6), new THREE.MeshStandardMaterial({map:cT, roughness:.6}), kx-.66,2.25,kz);
    for(let i=0;i<4;i++) CK.O.add(CY(.06,.05,.16,8), [M.orange,M.green,M.red,M.white][i], kx-.2,1.19,kz-1.1+i*.7);
    boxes.push({x0:kx-.7, x1:kx+.7, z0:kz-1.75, z1:kz+1.75}); reserve(kx,kz,1.6,'quầy café',false);
    const umb=[0xff6b6b,0x2a9d8f,0xffd23f,0x4fc3ff,0xff9fc4,0x46d39a]; let k=0;
    for(const tz of [121.2,126.6,132.0]) for(const tx of [220.6,224.4]){ CK.O.add(CY(.48,.48,.05,20), M.white, tx,.74,tz); CK.O.add(CY(.05,.05,.72,8), M.ironB, tx,.37,tz); CK.O.add(CY(.25,.28,.04,12), M.ironB, tx,.03,tz);
        CK.O.add(CY(.03,.03,2.2,6), M.white, tx,1.45,tz); CK.O.add(new THREE.ConeGeometry(1.35,.55,10,1,true), colorMat(umb[k%umb.length],{roughness:.8, side:THREE.DoubleSide}), tx,2.35,tz); k++;
        circles.push({x:tx, z:tz, r:.5}); const grp={seats:[], table:{x:tx, z:tz, y:.77}};
        for(const s of [-1,1]){ const cx=tx+s*.82; CK.O.add(B(.42,.05,.42), M.wood, cx,.45,tz); CK.O.add(B(.05,.45,.42), M.wood, cx+s*.2,.68,tz); for(const dz of [-.17,.17]) CK.O.add(B(.04,.45,.04), M.ironB, cx,.22,tz+dz);
          grp.seats.push(W.addSeat({x:cx, z:tz, rot:s>0?-Math.PI/2:Math.PI/2, y:.48, floor:0, label:'☕ Ngồi bàn café ven hồ (E · C)'})); circles.push({x:cx+s*.12, z:tz, r:.2}); }
        CAFE.groups.push(grp); }
    const MENU=[['☕ Cà phê sữa đá',12,'coffee',10,'+20% thưởng quiz 10 phút.'],['🥤 Trà sữa trân châu',16,null,0,'Ngọt ngào ngắm hồ.'],['🥥 Nước dừa',15,'energy',8,'+8 phút chạy nhanh.'],['🍰 Bánh flan',10,null,0,'Mềm mịn mát lạnh.'],['🍵 Trà sen',14,null,0,'Thơm hương sen hồ.']];
    INTER.push({x:kx-1.75, z:kz, r:1.6, prio:.6, label:'☕ Café Bên Hồ – gọi món (E)', action:()=>openShop('☕ Café Bên Hồ', MENU, ()=>{ if(CAFE.staff) say(CAFE.staff, pick(['Có ngay! ☕','Ngồi bàn dù cho mát nha!','Cảm ơn bạn nhiều 😊']), 2.4); })});
    zl('☕ Café Bên Hồ', 'Ngồi bàn dù ngắm thuyền thiên nga', {x:222.5, y:3.6, z:124}); }
  const CHESS={};
  { const cx=222.5, cz=136.4; CK.O.add(CY(.2,.28,.62,10), M.stoneG, cx,.31,cz); CK.O.add(B(.82,.07,.82), M.stoneG, cx,.66,cz);
    const boardT=ctex(256,256,(g,w,h)=>{ g.fillStyle='#e8d3a6'; g.fillRect(0,0,w,h); g.strokeStyle='#5a3a1a'; g.lineWidth=2; for(let i=0;i<9;i++){ g.beginPath(); g.moveTo(16+i*28,16); g.lineTo(16+i*28,240); g.stroke(); } for(let j=0;j<9;j++){ g.beginPath(); g.moveTo(16,16+j*28); g.lineTo(240,16+j*28); g.stroke(); }
      for(let k=0;k<14;k++){ const x=16+Math.floor(rng()*9)*28, y=16+Math.floor(rng()*9)*28; g.fillStyle='#f6ead0'; g.beginPath(); g.arc(x,y,11,0,7); g.fill(); g.strokeStyle=k%2?'#c0392b':'#1b1b1b'; g.lineWidth=2.5; g.stroke(); g.fillStyle=k%2?'#c0392b':'#1b1b1b'; g.font='700 12px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(['車','馬','炮','兵'][k%4],x,y+1); } });
    CK.O.add(new THREE.PlaneGeometry(.7,.7), new THREE.MeshStandardMaterial({map:boardT, roughness:.6}), cx,.697,cz, 0,-Math.PI/2);
    circles.push({x:cx, z:cz, r:.48}); reserve(cx,cz,.5,'bàn cờ',false); CHESS.table={x:cx, z:cz};
    CHESS.stools=[[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dz],i)=>{ const x=cx+dx*.82, z=cz+dz*.82; CK.O.add(CY(.17,.2,.42,10), M.stoneG, x,.21,z); circles.push({x,z,r:.2}); const rot=Math.atan2(-dx,-dz);
      const st={x,z,rot}; if(i>=2) st.seat=W.addSeat({x,z,rot,y:.45,floor:.02,label:'♟️ Ngồi xem đánh cờ (E · C)', onSit:()=>chessWatch()}); return st; });
    INTER.push({x:cx-1.4, z:cz, r:1.4, prio:.2, label:'♟️ Xem các cụ đánh cờ (E)', action:()=>chessWatch()});
    zl('♟️ Bàn cờ đá', null, {x:cx, y:2.2, z:cz, fade:22}); }

  /* ============================== 18. SÂN KHẤU CỎ (bờ Nam, quay mặt ra hồ) ============================== */
  const STAGE={x0:194.2, x1:203.8, z0:166.6, z1:170.4, h:.6};
  { const {x0,x1,z0,z1,h}=STAGE, cx=(x0+x1)/2;
    CK.O.add(B(x1-x0,h,z1-z0), M.deck, cx,h/2,(z0+z1)/2); CK.O.add(B(x1-x0+.1,.08,.12), M.white, cx,h+.01,z0+.06);
    for(const s of [-1,1]){ const sx=s<0?x0-.45:x1+.45; CK.O.add(B(.9,h/2,1.4), M.deck, sx,h/4,168.3); plats.push({t:'r', x:sx, z:168.3, c:1, s:0, hw:.45, hd:.7, h:h/2}); }
    plats.push({t:'r', x:cx, z:(z0+z1)/2, c:1, s:0, hw:(x1-x0)/2, hd:(z1-z0)/2, h});
    const bT=ctex(1024,320,(g,w,h2)=>{ const gr=g.createLinearGradient(0,0,0,h2); gr.addColorStop(0,'#14213d'); gr.addColorStop(1,'#3a0ca3'); g.fillStyle=gr; g.fillRect(0,0,w,h2);
      for(let i=0;i<9;i++){ g.strokeStyle=`rgba(255,${180+i*8},120,.35)`; g.lineWidth=3; g.beginPath(); g.arc(w/2,h2+120,140+i*48,Math.PI,0); g.stroke(); }
      g.fillStyle='#ffd166'; g.font='900 84px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🎤 SÂN KHẤU CỎ',w/2,h2/2-24); g.fillStyle='#fff'; g.font='600 36px "Segoe UI",sans-serif'; g.fillText('Hồ Ngọc Acoustic · mỗi tối',w/2,h2/2+56); });
    CK.O.add(B(x1-x0,3.0,.16), new THREE.MeshStandardMaterial({map:bT, roughness:.5}), cx,h+1.5,z1-.1); for(const x of [x0+.1,x1-.1]) CK.O.add(B(.2,3.6,.2), M.ironB, x,h+1.8,z1-.1);
    CK.O.add(B(x1-x0+.2,.16,.24), M.ironB, cx,h+3.55,z1-.1); for(let x=x0+.3;x<x1;x+=.45) STR.push([x, h+3.4-Math.sin((x-x0)/(x1-x0)*Math.PI)*.35, z1-.3]);
    for(const x of [x0+.5,x1-.5]){ CK.O.add(B(.6,1.0,.5), M.ironB, x,h+.5,z1-.55); CK.O.add(CY(.18,.18,.02,14), M.steel, x,h+.66,z1-.81, 0,Math.PI/2); }
    boxes.push({x0:x0-.9, x1:x1+.9, z0:z1-.2, z1:z1+.05}); reserve(cx,(z0+z1)/2,2.2,'sân khấu',false);
    for(const x of [193.6,197.8,202.2]) logBench(x+.6,162.6,Math.PI,'ghế khán giả','🎵 Ngồi nghe nhạc (E · C)');
    INTER.push({x:cx, z:z0-.9, r:1.6, prio:.5, label:'🎤 Lên sân khấu hát tặng mọi người (E)', action:()=>{ burst(new THREE.Vector3(cx,h+2,(z0+z1)/2),[0xffd166,0xff4f6d,0x4fc3ff,0xffffff],70,3,1.5,-3,.14); toast(pick(['🎤 Bạn vừa hát 1 bài – cả công viên vỗ tay rần rần! 👏','🎸 Hát hay quá! Có người xin số liên lạc kìa 😄','🎶 Encore! Encore! Khán giả muốn nghe thêm!']),3400); if(STAGE.o) say(STAGE.o, pick(['Hay quá bạn ơi! 👏','Hát thêm bài nữa đi!','Mời bạn song ca với mình nha 🎶']),3); }});
    zl('🎤 Sân khấu Cỏ', 'Nhạc acoustic mỗi tối · lên hát được (E)', {x:cx, y:4.9, z:z1-.1}); }

  /* ============================== 19. SÂN CHƠI TRẺ EM (góc Tây Nam, ngoài đường chạy) ============================== */
  const PG={x0:162.4, x1:177, z0:168, z1:PK.z1}, PLAY={};
  { CK.G.add(flat(rect(PG.x0,PG.z0,PG.x1,PG.z1)), M.rubR, SO.x,.05,SO.z); CK.G.add(flat(circ(165.6,171.6,1.6)), M.rubY, SO.x,.052,SO.z); CK.G.add(flat(circ(169.9,172.6,1.0)), M.rubG, SO.x,.052,SO.z);
    PATHS.push({x0:PG.x0, x1:PG.x1, z0:PG.z0, z1:PG.z1});
    const sx0=164.0, sx1=167.2, sy=2.3, sz=171.5;
    for(const x of [sx0,sx1]) for(const s of [-1,1]) CK.O.add(CY(.05,.05,2.45,8), M.blue, x,1.16,sz+s*.55, 0, s*.24);
    CK.O.add(CY(.06,.06,sx1-sx0+.3,8), M.yellow, (sx0+sx1)/2,sy,sz, 0,0,Math.PI/2);
    const swings=[164.9,166.3].map((x,i)=>{ const piv=new THREE.Group(); piv.position.set(x,sy,sz); piv.userData.dynamic=true; scene.add(piv);
      const seat=new THREE.Mesh(vcGeo([{g:CY(.012,.012,1.82,4), c:0xc9ced4, x:-.2, y:-.91},{g:CY(.012,.012,1.82,4), c:0xc9ced4, x:.2, y:-.91},{g:B(.48,.05,.22), c:i?0xe2483a:0xff8a2a, y:-1.84}]), dynMat); seat.castShadow=true; piv.add(seat);
      const anchor=new THREE.Object3D(); anchor.position.y=-1.80; piv.add(anchor); return {piv, seat, anchor, x, a:0, amp:i?0:.5, ph:i*1.3}; });
    for(const x of [sx0,sx1]) boxes.push({x0:x-.12, x1:x+.12, z0:sz-.75, z1:sz+.75});
    circles.push({x:swings[1].x, z:sz, r:.26}); PLAY.swings=swings; reserve(165.6,sz,1.2,'xích đu',false);
    const s2=W.addSeat({x:swings[1].x, z:sz, rot:0, y:.52, floor:.05, label:'🎠 Ngồi xích đu (E · C)'}); s2.inter.x=swings[1].x; s2.inter.z=sz-.85; PLAY.seat2=s2;
    const lx=168.45, lz=171.65, top=1.35;
    for(const s of [-1,1]){ CK.O.add(B(.06,top+.9,.06), M.yellow, lx,(top+.9)/2,lz+s*.32); CK.O.add(B(.06,top+.9,.06), M.yellow, lx+.62,(top+.9)/2,lz+s*.32); }
    for(let y=.3;y<top;y+=.3) CK.O.add(CY(.025,.025,.64,6), M.steel, lx-.02,y,lz, 0,Math.PI/2);
    CK.O.add(B(.7,.08,.7), M.blue, lx+.31,top,lz); CK.O.add(new THREE.ConeGeometry(.55,.5,4), M.red, lx+.31,top+1.15,lz, Math.PI/4);
    const chL=1.9, ang=Math.atan2(top-.15, chL); CK.O.add(B(chL/Math.cos(ang),.05,.5), M.orange, lx+.66+chL/2,(top+.15)/2+.05,lz, 0,0,-ang);
    for(const s of [-1,1]) CK.O.add(B(chL/Math.cos(ang),.14,.04), M.orange, lx+.66+chL/2,(top+.15)/2+.12,lz+s*.25, 0,0,-ang);
    boxes.push({x0:lx-.12, x1:lx+.74, z0:lz-.4, z1:lz+.4}); addSeg(lx+.8,lz,lx+.66+chL-.1,lz,.3);
    PLAY.slide={lx, lz, top, x0:lx+.66, x1:lx+.66+chL}; reserve(lx+1.2,lz,1.3,'cầu trượt',false);
    const rx=169.8, rz=172.65, rider=new THREE.Group(); rider.position.set(rx,0,rz); rider.userData.dynamic=true; scene.add(rider);
    for(const y of [.12,.24]) CK.O.add(new THREE.TorusGeometry(.12,.025,6,14), M.steel, rx,y,rz, 0,Math.PI/2);
    const body=new THREE.Mesh(vcGeo([{g:new THREE.SphereGeometry(.26,12,10), c:0xffc531, y:.18, sx:1.3, sy:.75, sz:.8},{g:new THREE.SphereGeometry(.15,10,8), c:0xffc531, x:.3, y:.44},{g:new THREE.ConeGeometry(.06,.14,6), c:0xff8a2a, x:.47, y:.42, rz:-Math.PI/2}]), dynMat);
    body.position.y=.34; body.castShadow=true; rider.add(body); circles.push({x:rx, z:rz, r:.38}); PLAY.rider={g:rider, body, x:rx, z:rz}; reserve(rx,rz,.45,'thú nhún',false);
    // bập bênh + hố cát (trang trí)
    { const x=170.6, z=179.6; CK.O.add(B(.3,.45,.3), M.yellow, x,.22,z); CK.O.add(B(3.0,.08,.3), M.blue, x,.48,z, 0,0,.12); for(const s of [-1,1]) CK.O.add(CY(.02,.02,.3,6), M.red, x+s*1.25,.7+s*.15,z, 0,0,Math.PI/2); boxes.push({x0:x-1.5, x1:x+1.5, z0:z-.2, z1:z+.2}); reserve(x,z,1.4,'bập bênh',false); }
    { const x=174.4, z=179.4; CK.O.add(slab(rect(x-1.6,z-1.6,x+1.6,z+1.6),[rect(x-1.4,z-1.4,x+1.4,z+1.4)],.25), M.log, SO.x,0,SO.z); CK.G.add(flat(rect(x-1.4,z-1.4,x+1.4,z+1.4)), colorMat(0xe9d39a,{roughness:1}), SO.x,.12,SO.z);
      CK.O.add(new THREE.ConeGeometry(.35,.3,10), colorMat(0xd9c084,{roughness:1}), x-.4,.22,z+.3); CK.O.add(CY(.12,.1,.18,10), M.red, x+.5,.2,z-.4); reserve(x,z,1.7,'hố cát',false); }
    woodBench(176.0,173.6,-Math.PI/2,'ghế phụ huynh','🪑 Ngồi trông trẻ (E · C)',false);
    zl('🎢 Sân chơi trẻ em', 'Xích đu · cầu trượt · thú nhún · bập bênh · hố cát', {x:168.6, y:3.3, z:172.4}); }

  /* ============================== 20. BÃI CỎ DÃ NGOẠI + THẢ DIỀU (góc Đông Nam) ============================== */
  const PICNIC=[];
  function picnicTable(x,z,rot){ const f=[Math.sin(rot),Math.cos(rot)], r=[Math.cos(rot),-Math.sin(rot)];
    CK.O.add(B(1.9,.07,.85), M.wood, x,.74,z, rot); for(const s of [-1,1]){ CK.O.add(B(1.9,.05,.3), M.wood, x+f[0]*s*.68,.45,z+f[1]*s*.68, rot); for(const t of [-.75,.75]) CK.O.add(B(.07,.74,1.6), M.dark, x+r[0]*t,.37,z+r[1]*t, rot); }
    const blT=ctex(128,128,(g,w,h)=>{ for(let i=0;i<8;i++) for(let j=0;j<8;j++){ g.fillStyle=(i+j)%2?'#d63a3a':'#fff4ea'; g.fillRect(i*16,j*16,16,16); } });
    CK.G.add(new THREE.PlaneGeometry(2.6,2.2), new THREE.MeshStandardMaterial({map:blT, roughness:.9, polygonOffset:true, polygonOffsetFactor:-3}), x+r[0]*1.9,.045,z+r[1]*1.9, rot, -Math.PI/2);
    CK.O.add(B(.45,.3,.32), colorMat(0xb5853d,{roughness:.8}), x+r[0]*1.6,.17,z+r[1]*1.6, rot+.3);
    boxes.push({x0:x-1.05, x1:x+1.05, z0:z-1.05, z1:z+1.05}); reserve(x,z,1.5,'bàn picnic',false);
    const seats=[]; for(const s of [-1,1]) for(const t of [-.45,.45]) seats.push(W.addSeat({x:x+f[0]*s*.72+r[0]*t, z:z+f[1]*s*.72+r[1]*t, rot:rot+(s>0?Math.PI:0), y:.48, floor:0, back:true, label:'🧺 Ngồi bàn picnic (E · C)'}));
    const Pq={x,z,rot,seats}; PICNIC.push(Pq); return Pq; }
  picnicTable(225.6,174.2,0); picnicTable(232.4,180.4,0);
  const KITE={x:230.0, z:173.0};
  zl('🧺 Bãi cỏ dã ngoại', 'Picnic · thả diều', {x:228.5, y:3.0, z:177});


  /* ============================== 21. HÀNG RÀO CÂY · GIỮ CHỖ CÁC KHU · ĐỒ VEN SÀN GỖ · ĐÈN ĐƯỜNG CHẠY ============================== */
  { const hx0=PK.x0+.3, hx1=PK.x1-.3, hz0=PK.z0+.3, hz1=PK.z1-.3;
    for(const [a,b] of [[177.5,193.8],[204.2,212.0],[221.8,hx1]]) hedge(a,hz0,b,hz0,'giậu Bắc');                 // chừa: góc cosplay · cổng Bắc · bãi xe đạp
    for(const [a,b] of [[31.6,BZ-2.6],[BZ+2.6,hz1]]){ hedge(hx0,a,hx0,b,'giậu Tây'); }                             // chừa: cổng Tây (trục cầu)
    for(const [a,b] of [[32.4,BZ-2.6],[BZ+2.6,hz1]]){ hedge(hx1,a,hx1,b,'giậu Đông'); }
    for(const [a,b] of [[hx0,195.4],[202.6,hx1]]) hedge(a,hz1,b,hz1,'giậu Nam'); }
  keep(173.2,59.6,180.2,88.6,'bãi yoga'); keep(218.0,68.2,225.0,82.8,'sân cầu lông'); keep(211.4,41.8,218.0,46.0,'giàn hoa'); keep(172.4,112.6,179.8,138.2,'vườn đá trúc');
  keep(192.4,160.6,205.8,171.2,'sân khấu'); keep(221.0,168.0,PK.x1,PK.z1,'bãi dã ngoại'); keep(179.2,41.6,187.2,49.4,'vườn hoa tròn');
  // ghế gỗ khối (quay mặt ra hồ) + đèn lồng đen + thùng rác dọc sàn gỗ
  { const BL2=lane(lake,3.05,600), LL=lane(lake,BWK+.42,600);
    for(let s=6;s<BL2.len;s+=21){ const [x,z,h]=BL2.at(s); if(nearGap(x,z,1.6)) continue; const rot=h-Math.PI/2; if(hit(x,z,1.05)) continue; logBench(x,z,rot,'ghế sàn gỗ'); }   // mặt ghế quay vào hồ (pháp tuyến hướng vào trong)
    for(let s=0;s<LL.len;s+=15){ const [x,z]=LL.at(s); if(nearGap(x,z,.8) || hit(x,z,.35) || onPath(x,z,.3)) continue; lantern(x,z,'đèn lồng sàn gỗ'); }
    let nb=0; for(let s=40;s<LL.len && nb<8;s+=37){ const [x,z]=LL.at(s); if(nearGap(x,z,.8) || hit(x,z,.35) || onPath(x,z,.3)) continue; bin(x,z); nb++; } }
  { const TL=lane(track,TW/2+.85,700); for(let s=4;s<TL.len;s+=19){ const [x,z]=TL.at(s); if(onPath(x,z,.4) || hit(x,z,.3) || zoneAt(x,z)==='out') continue; globeLamp(x,z); } }

  /* ============================== 22. CÂY TRONG CÔNG VIÊN ============================== */
  addTree('willow', ISL.x-3.9, ISL.z+2.4, .85, 'liễu đảo 1', false); addTree('willow', ISL.x+4.0, ISL.z+2.1, .8, 'liễu đảo 2', false); addTree('flame', ISL.x+.4, ISL.z+4.5, .75, 'phượng đảo', false);
  { const WL=lane(lake,BWK+2.5,600); for(let s=10;s<WL.len;s+=19){ const [x,z]=WL.at(s); if(lawnOK(x,z,1.7)) addTree('willow',x,z,.95+rng()*.15,'liễu ven hồ',false); } }
  for(const [d,st,ph] of [[TW/2+3.3,14,0],[-TW/2-3.6,15,7]]){ const TL=lane(track,d,700); for(let s=ph;s<TL.len;s+=st){ const [x,z]=TL.at(s); if(lawnOK(x,z,1.3)) addTree('tall',x,z,.9+rng()*.2,'cổ thụ đường chạy',false); } }
  for(let i=0,n=0;i<900 && n<34;i++){ const x=PK.x0+2+rng()*(PK.x1-PK.x0-4), z=PK.z0+2+rng()*(PK.z1-PK.z0-4); if(!lawnOK(x,z,2.6)) continue; addTree(pick2(['tall','tall','shade','flame','purple']),x,z,.85+rng()*.25,'cây bãi cỏ',false); n++; }
  for(const [x0,z0,x1,z1] of [[PK.x0+1.5,36,PK.x0+1.5,95],[PK.x0+1.5,108,PK.x0+1.5,165],[PK.x1-1.5,36,PK.x1-1.5,95],[PK.x1-1.5,108,PK.x1-1.5,165]]) for(let z=z0;z<=z1;z+=8){ const x=x0; if(lawnOK(x,z,.6)) addTree('cone',x,z,.95+rng()*.2,'tùng viền',false); }

  /* ============================== 23a. KHU CÔNG CỘNG (js/civic.js: bệnh viện · trạm cứu hoả · trường học) – dựng trước cây vỉa hè để cây tránh nhà ============================== */
  try{ const civ=await import('./civic.js'); out.civic=await civ.make(W, ctx, {NET, tree:(kind,x,z,s=1)=>{ if(!TREES[kind]) return; TREES[kind].push({x,z,s,r:rng()*TAU}); circles.push({x,z,r:.32*s}); out.trees++; }}); }catch(e){ console.warn('[park] civic.js lỗi:', e); }

  /* ============================== 23. CÂY XANH + CHẬU HOA TRÊN VỈA HÈ MỌI ĐƯỜNG (CITY.roads) ============================== */
  const POT=[], PLANTER=[], PIT=[];
  { const towers=(ctx.downtown && ctx.downtown.towers)||[], doors=towers.filter(t=>t.door).map(t=>t.door);
    const segD=(x,z,s)=>{ const ex=s.bx-s.ax, ez=s.bz-s.az, L2=ex*ex+ez*ez||1e-9; let t=((x-s.ax)*ex+(z-s.az)*ez)/L2; t=clamp(t,0,1); return Math.hypot(x-(s.ax+ex*t), z-(s.az+ez*t)); };
    const mine=[];
    function ok(x,z,r){
      if(x>262 || x<136) return false;
      if(!W.inDT(x,z,-.4)) return false;
      if(x>PK.x0-.4 && x<PK.x1+.4 && z>PK.z0-.4 && z<PK.z1+.4) return false;
      if(NET.onRoad(x,z)) return false; for(const [dx,dz] of [[0,0],[1.4,0],[-1.4,0],[0,1.4],[0,-1.4]]) if(NET.zebraAt(x+dx,z+dz)) return false;
      for(const c of circles){ if(c.owner || c.x>1e8) continue; if(Math.abs(x-c.x)>c.r+r+1 || Math.abs(z-c.z)>c.r+r+1) continue; if(Math.hypot(x-c.x,z-c.z) < c.r+r+.85) return false; }
      for(const b of boxes){ if(b.x0>1e8) continue; const cx=clamp(x,b.x0,b.x1), cz=clamp(z,b.z0,b.z1); if(Math.hypot(x-cx,z-cz) < r+1.6) return false; }
      for(const s of W.SEGS){ if(x<s.x0-4 || x>s.x1+4 || z<s.z0-4 || z>s.z1+4) continue; if(segD(x,z,s) < s.r+r+1.0) return false; }
      for(const p of plats){ if(p.t!=='r') continue; const dx=x-p.x, dz=z-p.z, lx=dx*p.c-dz*p.s, lz=dx*p.s+dz*p.c; if(Math.abs(lx)<p.hw+r+.8 && Math.abs(lz)<p.hd+r+.8) return false; }
      for(const it of INTER){ let ix, iz; try{ ix=+it.x; iz=+it.z; }catch(e){ continue; } if(!isFinite(ix)) continue; if(Math.abs(x-ix)<2.6 && Math.abs(z-iz)<2.6 && Math.hypot(x-ix,z-iz) < 2.6) return false; }
      for(const d of doors){ if(Math.abs(x-d.x)<5.2 && Math.abs(z-d.z)<6) return false; }
      for(const m of mine){ if(Math.hypot(x-m.x,z-m.z) < m.r+r+2.2) return false; }
      return true; }
    const FLC=[[0xff4f6d,0xffd23f],[0xff9fc4,0xffffff],[0xb06cff,0xffd23f],[0xff6b3d,0xfff1a8],[0xe8248a,0xff9fc4]], KEEPJ=NET.hw+NET.walk+2.5;
    for(const p of NET.curbPoints(1.5, LOW?14:11, KEEPJ, .3)){ const x=p.x, z=p.z; if(!ok(x,z,.3)) continue;
      const kind=pick2(p.seg.ns ? ['shade','purple','shade','flame'] : ['shade','shade','purple','flame']); TREES[kind].push({x,z,s:.85+rng()*.3,r:rng()*TAU}); PIT.push({x,z}); circles.push({x,z,r:.26}); out.trees++; mine.push({x,z,r:.3}); }
    for(const p of NET.curbPoints(1.15, LOW?28:22, KEEPJ, .8)){ const x=p.x, z=p.z, ns=p.seg.ns, r=ns?.38:.45; if(!ok(x,z,r)) continue;
      if(!ns){ PLANTER.push({x,z,rot:0}); boxes.push({x0:x-.68, x1:x+.68, z0:z-.3, z1:z+.3}); fillPlanter(x,z,1.25,.45,pick2(FLC)); }
      else { POT.push({x,z}); circles.push({x,z,r:.4}); fillPot(x,z,pick2(FLC)); } out.planters++; mine.push({x,z,r}); }
    for(const t of towers){ if(!t.door) continue; const fz=t.face>0?1:-1, z=t.z+fz*(t.d/2+1.35); for(const s of [-1,1]){ const x=t.door.x+s*3.35; let blocked=false;
        for(const c of circles){ if(!c.owner && c.x<1e8 && Math.hypot(x-c.x,z-c.z)<c.r+.9){ blocked=true; break; } } if(blocked || NET.onRoad(x,z)) continue;
        POT.push({x,z,big:true}); circles.push({x,z,r:.42}); fillPot(x,z,pick2(FLC),true); out.planters++; } }
  }

  /* ---------- "nướng" cây · hố cây · chậu · bồn · bụi · hoa · cỏ lau thành vài khối tĩnh theo vùng 64 m (lay gió từng cây) ---------- */
  const IMS=[];
  function inst(geo, mat, list, fn, cast=true){ if(!list.length) return null; const im=new THREE.InstancedMesh(geo, mat, list.length); const col=new THREE.Color();
    list.forEach((p,i)=>{ col.set(0xffffff); fn(p, _m4, col); im.setMatrixAt(i,_m4); im.setColorAt(i, col); });
    im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; im.castShadow=cast; im.receiveShadow=true; im.userData.dynamic=true; im.computeBoundingSphere(); scene.add(im); IMS.push(im); return im; }
  const TRM=(p,m)=>{ _q.setFromAxisAngle(_v.set(0,1,0), p.r||0); m.compose(_v.set(p.x, .02, p.z), _q, _s.set(p.s,p.s,p.s)); };
  inst(willowCurtain, willowMat, TREES.willow, (p,m,c)=>{ TRM(p,m); c.set(0xffffff); });
  const greenMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.86});
  greenMat.onBeforeCompile=sh=>{ sh.uniforms.uT=swayU; sh.vertexShader=sh.vertexShader.replace('#include <common>', `#include <common>
uniform float uT;
attribute vec2 aSw;`).replace('#include <begin_vertex>', `#include <begin_vertex>
transformed.x+=sin(uT*1.3+aSw.x)*aSw.y; transformed.z+=cos(uT*1.05+aSw.x*1.7)*aSw.y*.8;`); };
  greenMat.customProgramCacheKey=()=>'qcGreenSway';
  const CH=new Map(), _nm=new THREE.Matrix3(), _tc=new THREE.Color();
  function bake(geo, m4, tint, ph=0, k=0, sc=1){ const e=m4.elements, key=Math.floor((e[12]-136)/64)+','+Math.floor((e[14]+62)/60);
    let c=CH.get(key); if(!c){ c={P:[],N:[],C:[],A:[]}; CH.set(key,c); }
    const pos=geo.attributes.position, nor=geo.attributes.normal, col=geo.attributes.color; _nm.getNormalMatrix(m4);
    for(let i=0;i<pos.count;i++){ _v.fromBufferAttribute(pos,i); const ly=_v.y; _v.applyMatrix4(m4); c.P.push(_v.x,_v.y,_v.z); _v.fromBufferAttribute(nor,i).applyMatrix3(_nm).normalize(); c.N.push(_v.x,_v.y,_v.z);
      if(col) c.C.push(col.getX(i)*tint.r, col.getY(i)*tint.g, col.getZ(i)*tint.b); else c.C.push(tint.r,tint.g,tint.b); c.A.push(ph, k?Math.max(0,ly-2)*k*sc:0); } }
  const tintT=new THREE.Color();
  for(const kind of Object.keys(TREES)) for(const p of TREES[kind]){ TRM(p,_m4); tintT.setHSL(0,0,1).lerp(_tc.setHSL(.22+hash(p.x,p.z,1)*.1,.4,.6), .18); bake(TGEO[kind], _m4, tintT, p.x*.37+p.z*.23, kind==='tall'?.011:.016, p.s); }
  const pitGeo=vcGeo([{g:B(1.15,.05,1.15), c:0x2b2d31, y:.04},{g:B(.9,.06,.9), c:0x3e2f22, y:.045}]);
  for(const p of PIT){ _m4.makeTranslation(p.x,0,p.z); bake(pitGeo, _m4, tintT.set(0xffffff)); }
  const planterGeo=vcGeo([{g:B(1.3,.5,.55), c:0xcfc8bb, y:.27},{g:B(1.38,.07,.63), c:0x9d968a, y:.55},{g:B(1.22,.04,.47), c:0x3e2f22, y:.56}]);
  for(const p of PLANTER){ _m4.makeTranslation(p.x,0,p.z); bake(planterGeo, _m4, tintT.set(0xffffff)); }
  const potGeo=vcGeo([{g:CY(.38,.28,.58,14), c:0xb5653d, y:.31},{g:CY(.41,.41,.07,14), c:0x9a5232, y:.6},{g:CY(.34,.34,.03,14), c:0x3e2f22, y:.62}]);
  for(const p of POT){ const s=p.big?1.18:1; _m4.compose(_v.set(p.x,0,p.z), _q.identity(), _s.set(s,s,s)); bake(potGeo, _m4, tintT.set(p.big?0xe8e2d6:0xffffff)); }
  const bushGeo=vcGeo([{g:ico(1,1), c:0xffffff, sx:1, sy:.8, sz:1, jit:.35, blob:true}]);
  for(const p of BUSH){ _q.setFromAxisAngle(_v.set(0,1,0), hash(p.x,p.z,3)*6); _m4.compose(_v.set(p.x,p.y,p.z), _q, _s.set(p.s,p.s,p.s)); bake(bushGeo, _m4, tintT.set(p.c).multiplyScalar(1.1)); }
  const flwGeo=vcGeo([{g:new THREE.IcosahedronGeometry(.055,0), c:0xffffff, sy:.7}]);
  for(const p of FLW){ _m4.compose(_v.set(p.x,p.y,p.z), _q.identity(), _s.set(p.s,p.s,p.s)); bake(flwGeo, _m4, tintT.set(p.c)); }
  const reedGeo=vcGeo([{g:new THREE.ConeGeometry(.025,1,4), c:0x7d9a4a, y:.5}]);
  for(const p of REEDS){ _q.setFromEuler(_e.set((hash(p[0],p[1],1)-.5)*.3,0,(hash(p[0],p[1],2)-.5)*.3)); _m4.compose(_v.set(p[0],.12,p[1]), _q, _s.set(1,p[2],1)); bake(reedGeo, _m4, tintT.set(0xffffff)); }
  for(const c of CH.values()){ const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(c.P,3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(c.N,3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(c.C,3)); g.setAttribute('aSw', new THREE.Float32BufferAttribute(c.A,2)); g.computeBoundingSphere();
    const ms=new THREE.Mesh(g, greenMat); ms.castShadow=true; ms.receiveShadow=true; ms.userData.dynamic=true; ms.userData.staticShadow=true; scene.add(ms); IMS.push(ms); }
  const strM=new THREE.MeshStandardMaterial({color:0xfff1c8, emissive:0xffd27a, emissiveIntensity:0}); strM.userData.noMerge=true;
  inst(new THREE.SphereGeometry(.035,6,4), strM, STR, (p,m,c)=>{ m.makeTranslation(p[0],p[1],p[2]); c.set(0xffffff); }, false);
  for(let i=0;i<STR.length;i+=6) GLOW.add(STR[i][0],STR[i][1],STR[i][2],.9,0xffd27a,.6);

  /* ============================== 24. CÁ KOI · VỊT · BỒ CÂU · THIÊN NGA ============================== */
  const NLOBE=[LC.z-56,BZ-4], SLOBE=[BZ+4,LC.z+56];
  const rndWater=(lobe,pad=0)=>{ for(let i=0;i<60;i++){ const x=LC.x+(R()*2-1)*17, z=lobe[0]+R()*(lobe[1]-lobe[0]); if(inWater(x,z,pad)) return [x,z]; } return [LC.x-10,(lobe[0]+lobe[1])/2]; };
  const koiGeo=vcGeo([{g:new THREE.SphereGeometry(.09,10,8), c:0xffffff, sx:1, sy:.55, sz:2.2},{g:new THREE.ConeGeometry(.07,.16,6), c:0xffffff, z:-.25, rx:-Math.PI/2, sx:1.2, sy:1, sz:.3}]);
  const duckGeo=vcGeo([{g:new THREE.SphereGeometry(.16,12,10), c:0xf7f4ea, sx:1, sy:.62, sz:1.45, y:.08},{g:new THREE.SphereGeometry(.09,10,8), c:0xf7f4ea, y:.27, z:.17},{g:new THREE.ConeGeometry(.035,.12,6), c:0xff9a1a, y:.26, z:.29, rx:Math.PI/2, sy:1, sx:1.3},{g:new THREE.ConeGeometry(.07,.12,6), c:0xf7f4ea, y:.14, z:-.24, rx:-2.3}]);
  const KOI=[]; for(let i=0;i<26;i++){ const lobe=i%2?NLOBE:SLOBE, [x,z]=rndWater(lobe); KOI.push({x,z,h:R()*TAU,tx:x,tz:z,sp:.25+R()*.2,ph:R()*6,lobe,c:pick([0xff7a1a,0xff7a1a,0xffffff,0xffc23a,0xff5a2a,0xf2f2f2])}); }
  const DUCK=[]; for(let i=0;i<10;i++){ const lobe=i%2?NLOBE:SLOBE, [x,z]=rndWater(lobe); DUCK.push({x,z,h:R()*TAU,tx:x,tz:z,sp:.2+R()*.12,ph:R()*6,lobe,c:i<8?0xffffff:0xb08a62}); }
  const koiIM=inst(koiGeo, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.35}), KOI, (p,m,c)=>{ m.makeTranslation(p.x,WY-.06,p.z); c.set(p.c); }, false);
  const duckIM=inst(duckGeo, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.6}), DUCK, (p,m,c)=>{ m.makeTranslation(p.x,WY,p.z); c.set(p.c); }, false); if(duckIM && !LOW) duckIM.castShadow=true;
  const pigeonGeo=vcGeo([{g:new THREE.SphereGeometry(.1,8,6), c:0x8d939c, sx:.9, sy:.75, sz:1.4, y:.12},{g:new THREE.SphereGeometry(.055,8,6), c:0x5d646e, y:.21, z:.13},{g:new THREE.ConeGeometry(.012,.04,4), c:0xd8a35a, y:.2, z:.19, rx:Math.PI/2},{g:B(.1,.02,.14), c:0x6b717a, y:.13, z:-.17}]);
  const PIG=[]; const pigSpot=()=>[193.6+R()*9, 17.6+R()*3.6]; for(let i=0;i<12;i++){ const [x,z]=pigSpot(); PIG.push({x,z,y:0,h:R()*TAU,peck:R()*5,fly:0,vx:0,vz:0,vy:0,wait:0}); }
  const pigIM=inst(pigeonGeo, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.7}), PIG, (p,m,c)=>{ m.makeTranslation(p.x,.05,p.z); c.set(0xffffff); }, false);
  const swanGeo=vcGeo([
    {g:new THREE.SphereGeometry(1,18,10,0,TAU,0,Math.PI/2), c:0xf7f7f2, y:.36, sx:.85, sy:.52, sz:1.3, rx:Math.PI}, {g:new THREE.CircleGeometry(1,22), c:0xd9e6ee, y:.3, sx:.82, sy:1.27, rx:-Math.PI/2},
    {g:new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0,.3,.95),V3(0,.85,1.18),V3(0,1.38,1.05),V3(0,1.58,.86)]),14,.13,8,false), c:0xf7f7f2},
    {g:new THREE.SphereGeometry(.2,12,10), c:0xf7f7f2, y:1.62, z:.96}, {g:new THREE.ConeGeometry(.07,.26,8), c:0xff8a2a, y:1.58, z:1.2, rx:Math.PI/2},
    {g:new THREE.SphereGeometry(.035,6,4), c:0x111111, x:.13, y:1.68, z:1.05}, {g:new THREE.SphereGeometry(.035,6,4), c:0x111111, x:-.13, y:1.68, z:1.05},
    {g:new THREE.SphereGeometry(1,12,8), c:0xf1f1ec, x:.72, y:.52, z:-.1, sx:.22, sy:.32, sz:.85}, {g:new THREE.SphereGeometry(1,12,8), c:0xf1f1ec, x:-.72, y:.52, z:-.1, sx:.22, sy:.32, sz:.85},
    {g:new THREE.ConeGeometry(.3,.6,8), c:0xf7f7f2, y:.62, z:-1.22, rx:-2.2}, {g:B(1.05,.1,.42), c:0x4fc3ff, y:.5, z:-.25}, {g:B(1.05,.45,.08), c:0x4fc3ff, y:.75, z:-.48}]);
  const swanMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.45});
  const freeSwan=(x,z,pad=1)=>z>SLOBE[0]+pad && inWater(x,z,pad+.6);
  const SWANS=[]; for(let i=0;i<3;i++){ const [x,z]=rndWater(SLOBE,1.6); SWANS.push({x,z,h:R()*TAU,tx:x,tz:z,sp:.45+R()*.15,ph:R()*6,pad:1}); }
  for(const [x,z,h] of DOCK.park) SWANS.push({x,z,h,parked:true,ph:R()*6});
  const swanIM=new THREE.InstancedMesh(swanGeo, swanMat, SWANS.length); swanIM.castShadow=!LOW; swanIM.receiveShadow=true; swanIM.frustumCulled=false; swanIM.userData.dynamic=true; scene.add(swanIM);
  let feedT=0;
  INTER.push({x:BX, z:BZ, r:1.5, prio:.8, label:'🐟 Cho cá koi ăn (E · 2 💰)', action:()=>askPay(2, '🐟 Mua 1 gói thức ăn cho cá koi (thả từ trên Cầu Vòm)', ()=>{ if(!spend(2)) return; feedT=14; S.stats && (S.stats.koi=(S.stats.koi||0)+1); save();
    burst(new THREE.Vector3(P.x, P.y+.9, P.z+(P.z<BZ?-.9:.9)), [0xd9b98a,0xc8a070], 40, 1.4, .5, -9, .05); toast('🐟 Cá koi và vịt đang kéo tới đớp mồi! Nhìn xuống hồ nào 😄', 3200); })});


  /* ============================== 25. NGƯỜI TRONG CÔNG VIÊN ============================== */
  const NPC=[];
  const sM=s=>W.people.pickSeed(L=>!L.female,s), sF=s=>W.people.pickSeed(L=>L.female,s);
  function person(seed, outfit, name, dot, h){ const k=W.people.kit(seed,{outfit, h}); const a=makeActor(k.gl,{name, height:k.h, face:0, clips:k.clips, compact:false, dot:dot||'#9fd36a'});
    if(k.look && k.look.width){ a.root.scale.x*=k.look.width; a.root.scale.z*=k.look.width; }
    if(LOW) a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
    a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a); const anchor=new THREE.Object3D(); anchor.position.y=k.h+.75; a.g.add(anchor);
    a.g.position.set(0,-200,0);   // S19g rà soát 16/11: giấu dưới đất tới khi put()/sitAt() đặt chỗ (trước đứng chồng ở gốc 0,0 = cổng xuất hiện V1)
    const o={a, po, hipsH:po.hipsHeight(), anchor, h:k.h, x:0, z:0, hd:0, bubble:null, bubbleT:0, col:{x:1e9, z:1e9, r:.3, owner:true}}; circles.push(o.col); NPC.push(o); return o; }
  function say(o,t,sec=3.2){ if(!o) return; if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } o.bubble=makeLabel(t, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:30}); o.bubbleT=sec; }
  function put(o, y){ o.a.g.position.set(o.x, y===undefined?groundAt(o.x,o.z):y, o.z); o.a.g.rotation.set(0,o.hd,0); o.col.x=o.x; o.col.z=o.z; }
  function sitAt(o, x, y, z, rot){ o.a.g.position.set(x, y+.04-o.hipsH, z); o.a.g.rotation.set(0,rot,0); o.col.x=x; o.col.z=z; o.sitting=true; }
  const vis=o=>o.a.g.visible && o.a.root.visible;
  // S19g rà soát 16/11: chân người ngồi – đùi gần ngang, cẳng chân chéo ra trước đủ dài để gót chạm đúng sàn
  // (tư thế 'sit' của pose.js để cẳng chân thẳng đứng → ghế thấp thì bàn chân tọt 10–18 cm xuống sàn, hông đặt thấp thì đùi lún vào đệm)
  const _la=new THREE.Vector3(), _lb=new THREE.Vector3(), _ld=new THREE.Vector3(), _lF=new THREE.Vector3(), _lR=new THREE.Vector3(), _lq=new THREE.Quaternion(), _lp=new THREE.Quaternion(), _lw=new THREE.Quaternion();
  const aimL=(B,C,d)=>{ B.getWorldPosition(_la); C.getWorldPosition(_lb); _lb.sub(_la).normalize(); _lq.setFromUnitVectors(_lb, d); B.getWorldQuaternion(_lw); B.parent.getWorldQuaternion(_lp); _lw.premultiply(_lq); B.quaternion.copy(_lp.invert().multiply(_lw)); B.updateMatrixWorld(true); };
  function legsToFloor(po, g, floorY){ const bn=po && po.bones; if(!bn || !bn.LeftUpLeg) return; g.updateMatrixWorld(true); g.getWorldDirection(_lF); _lF.y=0; if(_lF.lengthSq()<1e-6) return; _lF.normalize(); _lR.set(-_lF.z,0,_lF.x);
    for(const [s,k] of [['Left',-1],['Right',1]]){ const UL=bn[s+'UpLeg'], LG=bn[s+'Leg'], FT=bn[s+'Foot']; if(!UL || !LG || !FT) continue;
      aimL(UL, LG, _ld.copy(_lF).addScaledVector(_lR, k*.06).setY(.03).normalize());
      LG.getWorldPosition(_la); FT.getWorldPosition(_lb); const L2=_la.distanceTo(_lb), drop=Math.min(L2*.98, Math.max(.05, _la.y-(floorY+.09))), fw=Math.sqrt(L2*L2-drop*drop);
      aimL(LG, FT, _ld.copy(_lF).multiplyScalar(fw).setY(-drop).normalize()); const TO=bn[s+'ToeBase']; if(TO) aimL(FT, TO, _ld.copy(_lF).setY(-.5).normalize()); } }
  // tư thế riêng của công viên (yoga, dưỡng sinh, cầu lông, xà đơn): "ngắm" xương theo hướng thế giới như pose.js (không sửa file dùng chung)
  const _pa=new THREE.Vector3(), _pb=new THREE.Vector3(), _pd=new THREE.Vector3(), _pqa=new THREE.Quaternion(), _ppq=new THREE.Quaternion(), _pwq=new THREE.Quaternion(), _PF=new THREE.Vector3(), _PR=new THREE.Vector3(), _PU=new THREE.Vector3(0,1,0);
  function aimB(bn, name, child, f, u, r){ const Bn=bn[name], Cn=bn[child]; if(!Bn||!Cn) return; Bn.getWorldPosition(_pa); Cn.getWorldPosition(_pb); _pb.sub(_pa).normalize();
    _pd.set(0,0,0).addScaledVector(_PF,f).addScaledVector(_PU,u).addScaledVector(_PR,r).normalize(); _pqa.setFromUnitVectors(_pb,_pd);
    Bn.getWorldQuaternion(_pwq); Bn.parent.getWorldQuaternion(_ppq); _pwq.premultiply(_pqa); Bn.quaternion.copy(_ppq.invert().multiply(_pwq)); Bn.updateMatrixWorld(true); }
  function poseX(o, kind, t=0, k=0){ const bn=o.po.bones; if(!bn || !bn.Hips) return; const g=o.a.g; g.updateMatrixWorld(true); g.getWorldDirection(_PF); _PF.y=0; if(_PF.lengthSq()<1e-6) _PF.set(0,0,1); _PF.normalize(); _PR.set(-_PF.z,0,_PF.x);
    const LR=[['Left',-1],['Right',1]];
    switch(kind){
      case 'lotus': for(const [s,q] of LR){ aimB(bn,s+'UpLeg',s+'Leg',.85,-.12,q*.55); aimB(bn,s+'Leg',s+'Foot',.25,-.08,-q*.97); aimB(bn,s+'Arm',s+'ForeArm',.3,-1,q*.35); aimB(bn,s+'ForeArm',s+'Hand',.85,-.35,q*.2); } break;
      case 'yogaUp': for(const [s,q] of LR){ aimB(bn,s+'Arm',s+'ForeArm',0,1,q*.16); aimB(bn,s+'ForeArm',s+'Hand',0,1,-q*.14); } break;
      case 'warrior': for(const [s,q] of LR){ aimB(bn,s+'Arm',s+'ForeArm',0,.04,q); aimB(bn,s+'ForeArm',s+'Hand',0,.04,q); } aimB(bn,'LeftUpLeg','LeftLeg',.15,-1,-.45); aimB(bn,'RightUpLeg','RightLeg',.15,-1,.45); break;
      case 'tree': aimB(bn,'LeftUpLeg','LeftLeg',.35,-.55,-.85); aimB(bn,'LeftLeg','LeftFoot',-.1,-.55,.9); for(const [s,q] of LR){ aimB(bn,s+'Arm',s+'ForeArm',.15,1,q*.25); aimB(bn,s+'ForeArm',s+'Hand',.1,1,-q*.35); } break;
      case 'taichi': { const e=Math.sin(t*.8), c=Math.cos(t*.8); for(const [s,q] of LR){ const w=q>0?e:-e; aimB(bn,s+'Arm',s+'ForeArm',.75,-.25+.55*w,q*.55); aimB(bn,s+'ForeArm',s+'Hand',.9,.15+.35*c,-q*.25); aimB(bn,s+'UpLeg',s+'Leg',.25,-1,q*.22); } break; }
      case 'swing': { const a=clamp(k,0,1); aimB(bn,'RightArm','RightForeArm',-.45+a*1.3,.85-a*.3,.45); aimB(bn,'RightForeArm','RightHand',-.7+a*1.8,.9-a*.5,.15); aimB(bn,'LeftArm','LeftForeArm',.55,.25,-.55); aimB(bn,'LeftForeArm','LeftHand',.6,.5,-.2); break; }
      case 'ready': aimB(bn,'RightArm','RightForeArm',.35,-.2,.75); aimB(bn,'RightForeArm','RightHand',.5,.75,.25); aimB(bn,'LeftArm','LeftForeArm',.5,-.3,-.6); aimB(bn,'LeftForeArm','LeftHand',.8,.3,-.1); break;
      case 'hang': { const p=clamp(k,0,1); for(const [s,q] of LR){ aimB(bn,s+'Arm',s+'ForeArm',.05,1-.75*p,q*(.22+.85*p)); aimB(bn,s+'ForeArm',s+'Hand',0,1,-q*.15*p); aimB(bn,s+'UpLeg',s+'Leg',.1,-1,q*.05); aimB(bn,s+'Leg',s+'Foot',-.35,-1,0); } break; }
    } }
  // vật cản phía trước (bạn · cô Hạnh · bé Vàng) → khoảng cách theo hướng đi
  function blockedBy(x,z,hd,lat=.7,ahead=1.7,self=null){ const fx=Math.sin(hd), fz=Math.cos(hd); const obs=W.inside?[]:[[P.x,P.z]]; if(self!==walker) for(const q of [walker, dog]) if(q && q.x!==undefined) obs.push([q.x,q.z]);
    let best=null; for(const [ox,oz] of obs){ const dx=ox-x, dz=oz-z, a=dx*fx+dz*fz, s=dx*fz-dz*fx; if(a>.1 && a<ahead && Math.abs(s)<lat){ if(!best || a<best.a) best={a, s}; } } return best; }

  // 🏃 chạy bộ trên đường chạy gạch đỏ (Tuấn, Linh: làn ngoài · Khoa: làn trong) – gặp bạn thì giảm tốc / lách, 3 vòng nghỉ giãn cơ
  let walker=null, dog=null, leash=null;
  const joggers=[[sM(611),{shirt:0xff6b3d, pants:0x22262e, shoe:0xffffff},'Tuấn',3.0,0,JOGO],[sF(612),{shirt:0x2fd3c4, pants:0x2a2a3a, shoe:0xff5fa2},'Linh',2.6,.35,JOGO],[sM(711),{shirt:0x2f6fd0, pants:0x1d1f24, shoe:0xffffff},'Khoa',2.85,.7,JOGI]]
    .slice(0, LOW?2:3).map(([seed,of,n,sp,f,L])=>{ const o=person(seed, of, `🏃 ${n} · chạy bộ`, '#ff9f43'); Object.assign(o,{L, s:L.len*f, sp, v:sp, lat:0, latT:0, laps:0, lastS:L.len*f, rest:0, sayCD:0}); const p=L.at(o.s); o.x=p[0]; o.z=p[1]; o.hd=p[2]; return o; });
  function updJog(o, dt, T){ const L=o.L;
    if(o.rest>0){ o.rest-=dt; o.a.play('idle'); put(o); if(vis(o)){ o.a.mixer.update(dt); o.po.apply(o.restPose, T); } if(o.rest<=0) say(o, pick(['Chạy tiếp thôi! 💪','Vòng nữa nè!','Hít sâu… thở ra…']), 2.2); return; }
    const p=L.at(o.s), fx=Math.sin(p[2]), fz=Math.cos(p[2]); let want=o.sp;
    const b=blockedBy(o.x,o.z,o.hd,.65,1.9);
    if(b){ o.latT = b.s>0 ? -.9 : .9; if(b.a<1.0) want=0; else want=Math.min(want, 1.2); if(o.sayCD<=0 && b.a<1.4){ say(o, pick(['Cho mình qua với nha! 🏃','Xin lỗi, nhường đường chút nha 😅','Ối, suýt đụng!']), 2.4); o.sayCD=8; } }
    else if(o.latT!==0 && !blockedBy(o.x,o.z,o.hd,.9,3.2)) o.latT=0;
    for(const q of joggers){ if(q===o || q.L!==L) continue; const ds=((q.s-o.s)%L.len+L.len)%L.len; if(ds<2.4 && Math.abs(q.lat-o.lat)<.5) want=Math.min(want, q.v); }
    o.lat+=(o.latT-o.lat)*Math.min(1,dt*3); o.v+=(want-o.v)*Math.min(1,dt*(want<o.v?7:1.6)); o.s+=o.v*dt; o.sayCD-=dt;
    const q=L.at(o.s); o.x=q[0]+fz*o.lat; o.z=q[1]-fx*o.lat; o.hd=lerpAngle(o.hd, q[2], 1-Math.exp(-dt*10));
    if(o.v>.5){ o.a.play('run'); const ac=o.a.acts.run; if(ac) ac.timeScale=clamp(o.v/3.1,.55,1.1); } else o.a.play('idle');
    if(o.s-o.lastS>L.len){ o.lastS+=L.len; o.laps++; if(o.laps%3===0){ o.rest=8+R()*4; o.restPose=pick(['cross','present']); say(o, pick([`Xong ${o.laps} vòng rồi! 😮‍💨`,'Nghỉ xíu giãn cơ đã…','Không khí công viên trong lành ghê!']), 3); } }
    put(o); if(vis(o)) o.a.mixer.update(dt); }

  // 🐕 cô Hạnh dắt bé Vàng đi dạo trên sàn gỗ ven hồ (dừng cho chó đánh hơi; E để vuốt ve)
  walker=person(sF(621), {shirt:0xf3c6d3, pants:0x3b4a6b, shoe:0xffffff}, '🐕 Cô Hạnh · dắt chó', '#ff8fc2'); Object.assign(walker,{s:DECK.len*.08, v:0, stop:0, stopT:14, sayCD:0});
  try{ const gl=await new GLTFLoader().loadAsync('assets/models/Fox.glb'); const root=W.SkeletonUtils.clone(gl.scene); root.traverse(o=>{ if(o.isMesh){ o.castShadow=!LOW; o.frustumCulled=false; } });
    const g=new THREE.Group(); g.add(root); root.updateMatrixWorld(true); let bb=new THREE.Box3().setFromObject(root); root.scale.multiplyScalar(.5/(bb.max.y-bb.min.y||1)); root.updateMatrixWorld(true); bb=new THREE.Box3().setFromObject(root); root.position.y-=bb.min.y;
    g.userData.dynamic=true; g.position.set(0,-200,0); scene.add(g); const mixer=new THREE.AnimationMixer(root), acts={}; for(const c of gl.animations) acts[c.name]=mixer.clipAction(c);
    const anchor=new THREE.Object3D(); anchor.position.y=.8; g.add(anchor); makeLabel('🐕 Bé Vàng', null, {fs:40, h:.22, follow:anchor, dot:'#ff8fc2', fade:24});
    dog={g, mixer, acts, cur:null, x:0, z:0, h:0, col:{x:1e9,z:1e9,r:.28,owner:true}, play(k){ if(this.cur===k || !acts[k]) return; acts[k].reset().fadeIn(.25).play(); if(this.cur && acts[this.cur]) acts[this.cur].fadeOut(.25); this.cur=k; }};
    circles.push(dog.col); if(W.BLOBSRC) W.BLOBSRC.push({o:g, s:.6});
    leash=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({color:0xc0392b})); leash.frustumCulled=false; leash.userData.dynamic=true; scene.add(leash);
    INTER.push({get x(){ return dog.x; }, get z(){ return dog.z; }, r:1.3, prio:.5, label:'🐕 Vuốt ve bé Vàng (E)', action:()=>{ burst(new THREE.Vector3(dog.x,.8,dog.z), [0xff4f6d,0xff8fc2], 24, 1.4, 1, -1, .14); say(walker, pick(['Bé tên Vàng đó, hiền lắm! 🐕','Vàng thích được gãi cằm lắm 😄','Chào bạn! Vàng vẫy đuôi kìa!']), 3); walker.stop=Math.max(walker.stop,4); }});
  }catch(e){ console.warn('park: không tải được chó', e); }
  const _hand=new THREE.Vector3(); let walkerHand=null; walker.a.g.traverse(o=>{ if(o.isBone && !walkerHand && /RightHand$/.test(o.name)) walkerHand=o; });
  function updWalker(dt, T){ const o=walker;
    if(o.stop>0){ o.stop-=dt; o.v=0; } else { o.stopT-=dt; if(o.stopT<=0){ o.stop=4+R()*3; o.stopT=16+R()*16; if(R()<.6) say(o, pick(['Vàng ơi, đi chậm thôi!','Đánh hơi gì đó con? 😄','Chiều nào cũng dắt bé ra hồ đi dạo 🐕']), 2.6); } }
    const pp=DECK.at(o.s); let want=o.stop>0?0:1.1; const blk=blockedBy(pp[0],pp[1],pp[2],.6,1.6,walker) || (dog ? blockedBy(dog.x,dog.z,pp[2],.5,1.1,walker) : null); if(blk && want>0){ want=0; if(o.sayCD<=0){ say(o, 'Xin lỗi nha, cho cô với bé Vàng qua 😊', 2.6); o.sayCD=9; } }
    o.sayCD-=dt; o.v+=(want-o.v)*Math.min(1,dt*4); o.s+=o.v*dt; const p=DECK.at(o.s); o.x=p[0]; o.z=p[1]; o.hd=lerpAngle(o.hd,p[2],1-Math.exp(-dt*8));
    if(o.v>.2){ o.a.play('walk'); const ac=o.a.acts.walk; if(ac) ac.timeScale=clamp(o.v/1.35,.5,1); } else o.a.play('idle'); put(o, .06); if(vis(o)) o.a.mixer.update(dt);
    if(dog){ const q=DECK.at(o.s+1.45), fx=Math.sin(q[2]), fz=Math.cos(q[2]); const tx=q[0]+fz*.25, tz=q[1]-fx*.25, dx=tx-dog.x, dz=tz-dog.z, d=Math.hypot(dx,dz);
      if(d>4){ dog.x=tx; dog.z=tz; } else if(d>.05){ const sp=Math.min(d*3, 2.4); dog.x+=dx/d*sp*dt; dog.z+=dz/d*sp*dt; dog.h=lerpAngle(dog.h, Math.atan2(dx,dz), 1-Math.exp(-dt*8)); }
      dog.play(o.v>.2 && d>.08 ? 'Walk' : 'Survey'); dog.g.position.set(dog.x, .06, dog.z); dog.g.rotation.y=dog.h; if(dog.g.visible) dog.mixer.update(dt); dog.col.x=dog.x; dog.col.z=dog.z;
      if(leash && leash.visible){ if(walkerHand) walkerHand.getWorldPosition(_hand); else _hand.set(o.x, 1, o.z); const a=leash.geometry.attributes.position; a.setXYZ(0,_hand.x,_hand.y,_hand.z); a.setXYZ(1,dog.x+Math.sin(dog.h)*.18,.42,dog.z+Math.cos(dog.h)*.18); a.needsUpdate=true; } } }
  { const p=DECK.at(walker.s); walker.x=p[0]; walker.z=p[1]; walker.hd=p[2]; if(dog){ const q=DECK.at(walker.s+1.45); dog.x=q[0]; dog.z=q[1]; } }

  // 🎢 trẻ con: bé Na đu xích đu, bé Bin leo cầu trượt → trượt → chơi thú nhún; mẹ đứng trông
  const kidA=person(sF(631), {shirt:0xff8fc2, pants:0xffd23f, shoe:0xffffff}, '👧 Bé Na', '#ffd23f', 1.12);
  const kidB=person(sM(632), {shirt:0x4fc3ff, pants:0x2a3a5a, shoe:0xff4f6d}, '👦 Bé Bin', '#ffd23f', 1.2);
  const mom=person(sF(633), {shirt:0xffffff, pants:0x6b8cff, shoe:0x222222}, '👩 Mẹ bé Na · Bin', '#ffd23f'); mom.x=164.05; mom.z=173.7; mom.hd=dg(150);
  const LAD={x:PLAY.slide.lx-.38, z:PLAY.slide.lz}, RID=PLAY.rider, S2=PLAY.slide;
  const ROUTE={ toRider:[[S2.x1+.35,S2.lz+.75],[RID.x+.1,RID.z-.62]], toLadderR:[[RID.x-.75,RID.z+.15],[167.95,172.4],[LAD.x,LAD.z]], toLadderS:[[S2.x1+.35,S2.lz+.75],[170.9,173.15],[168.8,173.15],[167.95,172.4],[LAD.x,LAD.z]] };
  Object.assign(kidB,{st:'walk', t:0, x:167.95, z:172.4, hd:0, way:[[LAD.x,LAD.z]], then:'climb'});
  function walkTo(o, x, z, dt, sp=1.3){ const dx=x-o.x, dz=z-o.z, d=Math.hypot(dx,dz); if(d<.06){ o.x=x; o.z=z; return true; } const k=Math.min(d, sp*dt); o.x+=dx/d*k; o.z+=dz/d*k; o.hd=lerpAngle(o.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*10)); return false; }
  function updKids(dt, T){ const sw=PLAY.swings;
    for(const s of sw){ const want = s===sw[0] ? .55 : 0; s.amp+=(want-s.amp)*Math.min(1,dt*.8); s.a=Math.sin(T*2.05+s.ph)*s.amp; s.piv.rotation.x=s.a; }
    sw[0].anchor.getWorldPosition(_v); kidA.a.play('idle'); kidA.a.g.position.set(_v.x, _v.y+.04-kidA.hipsH, _v.z); kidA.a.g.rotation.set(-sw[0].a*.6,0,0); kidA.col.x=_v.x; kidA.col.z=_v.z;
    if(vis(kidA)){ kidA.a.mixer.update(dt); kidA.po.apply('sit', T); }
    if(R()<dt*.05) say(kidA, pick(['Mẹ ơi đẩy cao nữa! 😆','Wiii~ bay lên trời!','Xích đu vui quá!']), 2.4);
    updKidB(dt, T);
    mom.a.play('idle'); put(mom); if(vis(mom)){ mom.a.mixer.update(dt); if(((T*.2)%8)<3) mom.po.apply('phone', T); }
    if(R()<dt*.03) say(mom, pick(['Chơi cẩn thận nha hai đứa!','Bin ơi, nhường em trượt với!','Chơi xíu nữa rồi về ăn cơm nha 😊']), 2.8); }
  function updKidB(dt, T){ const b=kidB; b.t+=dt; let pose=null;
    if(b.st==='walk'){ const w=b.way[0]; if(!w || walkTo(b, w[0], w[1], dt, 1.5)){ if(w) b.way.shift(); if(!b.way.length){ b.st=b.then; b.t=0; } } b.a.play(b.way.length?'walk':'idle'); put(b); }
    else if(b.st==='climb'){ const k=Math.min(1,b.t/1.6); b.x=LAD.x+k*.62; b.z=LAD.z; b.hd=Math.PI/2; b.a.play('walk'); put(b, k*S2.top);
      if(k>=1){ b.st='slide'; b.t=0; if(R()<.6) say(b, pick(['Trượt nè! 🎢','Wheee~','Mẹ nhìn con nè!']), 2); } }
    else if(b.st==='slide'){ const k=Math.min(1,b.t/1.25); b.x=S2.x0+(S2.x1-S2.x0)*k; b.z=S2.lz; b.hd=Math.PI/2; b.a.play('idle');
      b.a.g.position.set(b.x, S2.top+(.2-S2.top)*k+.05-b.hipsH*.62, b.z); b.a.g.rotation.set(0,b.hd,0); b.col.x=b.x; b.col.z=b.z; pose='sit';
      if(k>=1){ b.x=S2.x1+.1; if(R()<.5){ b.way=ROUTE.toRider.map(p=>p.slice()); b.then='ride'; } else { b.way=ROUTE.toLadderS.map(p=>p.slice()); b.then='climb'; } b.st='walk'; b.t=0; } }
    else if(b.st==='ride'){ const k=Math.sin(b.t*5)*.18; RID.body.rotation.z=k; b.hd=Math.PI/2; b.a.play('idle'); b.a.g.position.set(RID.x-.06, .66+.04-b.hipsH, RID.z); b.a.g.rotation.set(0,b.hd,k*.6); b.col.x=RID.x; b.col.z=RID.z; pose='sit';
      if(b.t>6){ RID.body.rotation.z=0; b.x=RID.x+.1; b.z=RID.z-.62; b.way=ROUTE.toLadderR.map(p=>p.slice()); b.then='climb'; b.st='walk'; b.t=0; } }
    if(vis(b)){ b.a.mixer.update(dt); if(pose) b.po.apply(pose, T); } }

  // 💪 khu thể dục: ông Sáu (máy đi bộ), bà Tư (xoay eo), anh Dũng kéo xà đơn
  const gymBots=[[GYM[0], person(sM(641), {shirt:0xffffff, pants:0x2a3a5a, long:true, shoe:0x222222}, '👴 Ông Sáu · tập thể dục', '#46d39a')], [GYM[1], person(sF(642), {shirt:0xc94f7c, pants:0x222222, long:true, shoe:0x222222}, '👵 Bà Tư · tập thể dục', '#46d39a')]];
  for(const [m,o] of gymBots) m.busy=o;
  const puller=person(sM(643), {shirt:0x1b1d21, pants:0x2a3a5a, shoe:0xffffff}, '💪 Anh Dũng · xà đơn', '#46d39a'); Object.assign(puller,{t:0, reps:0, rest:0, x:GYM.bar.x, z:GYM.bar.z, hd:0});
  function updGym(dt, T){ for(const m of GYM){ m.t+=dt; m.anim(m.t, !!m.busy); }
    for(const [m,o] of gymBots){ if(m.busy!==o) continue; o.x=m.ux; o.z=m.uz; o.hd=m.face+(m.twist?Math.sin(m.t*2.6)*.6:0); o.a.play(m.clip); put(o, m.uy); if(vis(o)){ o.a.mixer.update(dt); if(m.arms) o.po.apply('present', T); }
      if(R()<dt*.02) say(o, pick(['Tập thể dục mỗi chiều, khoẻ re! 💪','Sống lâu trăm tuổi nhờ đi bộ đó cháu!','Một, hai, ba, bốn…']), 2.8); }
    const o=puller, bar=GYM.bar; o.t+=dt; o.a.play('idle');
    if(o.rest>0){ o.rest-=dt; o.x=bar.x; o.z=bar.z+.85; o.hd=Math.PI; put(o, 0); if(vis(o)){ o.a.mixer.update(dt); o.po.apply('cross', T); } if(o.rest<=0){ o.t=0; say(o, pick(['Hiệp nữa nào! 💪','Lên xà tiếp!']), 2); } return; }
    const k=(1-Math.cos(o.t*2.4))/2; o.x=bar.x; o.z=bar.z; o.hd=0; put(o, bar.h-o.h*1.2+.5*k); o.col.x=bar.x; o.col.z=bar.z;
    if(vis(o)){ o.a.mixer.update(dt); poseX(o,'hang',T,k); }
    if(o.t>2.62*8){ o.rest=7+R()*4; say(o, pick(['8 cái! Xong 1 hiệp 😤','Phù… nghỉ chút đã','Ai tập chung không? 💪']), 2.6); } }

  // 🧘 lớp yoga (cô giáo + học viên) · 2 cụ tập dưỡng sinh
  const YPOSES=['lotus','yogaUp','tree','warrior'], YCUE={lotus:'Ngồi thiền, thả lỏng vai… hít thở sâu 🧘',yogaUp:'Hít vào… vươn hai tay lên cao!',tree:'Tư thế cái cây – giữ thăng bằng nhé 🌳',warrior:'Thở ra… dang tay, tư thế chiến binh!'};
  const yogaPose=T=>YPOSES[Math.floor(T/9)%4];
  const coach=person(sF(651), {shirt:0x7ec8b8, pants:0x2a2a3a, shoe:0xffffff}, '🧘 Cô Thảo · HLV yoga', '#7ec8b8'); coach.x=YOGA.x; coach.z=YOGA.coach; coach.hd=0;
  const yogis=[[sF(652),0xf2a65a],[sM(653),0xb48ad6],[sF(654),0x6fa8dc]].slice(0,LOW?2:3).map(([seed,c],i)=>{ const o=person(seed,{shirt:c, pants:0x222222, shoe:0xffffff},'🧘 Học viên yoga','#7ec8b8'); o.x=YOGA.x; o.z=YOGA.mats[i]; o.hd=Math.PI; return o; });
  const taichi=YOGA.taichi.map(([x,z],i)=>{ const o=person(i?sF(656):sM(655), {shirt:0xf4f2ec, pants:0xf4f2ec, long:true, shoe:0x222222}, i?'👵 Bà Hai · dưỡng sinh':'👴 Ông Bảy · dưỡng sinh', '#c7d2e0'); o.x=x; o.z=z; o.hd=Math.PI/2; return o; });
  let yLast='';
  function updYoga(dt, T){ const ps=yogaPose(T); if(ps!==yLast){ yLast=ps; say(coach, YCUE[ps], 3.4); }
    for(const o of [coach, ...yogis]){ o.a.play('idle'); if(ps==='lotus'){ o.a.g.position.set(o.x,.14-o.hipsH,o.z); o.a.g.rotation.set(0,o.hd,0); o.col.x=o.x; o.col.z=o.z; } else put(o, 0); if(vis(o)){ o.a.mixer.update(dt); poseX(o, ps, T); } }
    for(const [i,o] of taichi.entries()){ o.a.play('idle'); put(o, 0); if(vis(o)){ o.a.mixer.update(dt); poseX(o,'taichi',T+i*.4); } }
    if(R()<dt*.012) say(pick(taichi), pick(['Dưỡng sinh mỗi sáng, chiều – khoẻ cả người!','Chậm thôi, đều hơi thở…','Tập ngoài trời thoáng ghê!']), 2.8); }

  // 🏸 2 bạn đánh cầu lông (quả cầu bay theo đường parabol, vung vợt đúng nhịp)
  const badA=person(sM(661), {shirt:0xffd23f, pants:0x1d1f24, shoe:0xffffff}, '🏸 Hải · cầu lông', '#4fc3ff'), badB=person(sF(662), {shirt:0xff6b8a, pants:0x2a2a3a, shoe:0xffffff}, '🏸 Quyên · cầu lông', '#4fc3ff');
  badA.x=BAD.x; badA.z=BAD.net-4.3; badA.hd=0; badB.x=BAD.x; badB.z=BAD.net+4.3; badB.hd=Math.PI;
  const racketGeo=vcGeo([{g:CY(.014,.014,.3,6), c:0x222222, y:.15}, {g:new THREE.TorusGeometry(.12,.012,6,16), c:0xd8dde3, y:.42, sx:.8}, {g:new THREE.CircleGeometry(.11,12), c:0xf4f4f4, y:.42, sx:.8}]);
  for(const o of [badA, badB]){ let hand=null; o.a.g.traverse(b=>{ if(b.isBone && !hand && /RightHand$/.test(b.name)) hand=b; }); if(!hand) continue;
    const r=new THREE.Mesh(racketGeo, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.5, side:THREE.DoubleSide})); o.a.g.updateMatrixWorld(true); hand.getWorldScale(_v); r.scale.setScalar(1/(_v.x||1)); hand.add(r); }
  const shuttle=new THREE.Mesh(vcGeo([{g:new THREE.SphereGeometry(.03,8,6), c:0xffffff},{g:new THREE.ConeGeometry(.045,.08,8,1,true), c:0xf4f4f4, y:.05}]), new THREE.MeshStandardMaterial({vertexColors:true, roughness:.6, side:THREE.DoubleSide})); shuttle.userData.dynamic=true; scene.add(shuttle);
  const RAL={from:badA, to:badB, t:0, dur:1.25, tx:BAD.x, miss:0};
  function updBad(dt, T){ const R0=RAL; for(const o of [badA, badB]){ o.a.play('idle'); }
    if(R0.miss>0){ R0.miss-=dt; shuttle.position.set(R0.tx, .03, R0.from.z+(R0.from===badA?-.6:.6)); shuttle.rotation.set(Math.PI/2,0,0); for(const o of [badA,badB]){ put(o,0); if(vis(o)){ o.a.mixer.update(dt); poseX(o,'ready'); } } if(R0.miss<=0){ R0.t=0; R0.tx=BAD.x+(R()*2-1)*1.6; } return; }
    R0.t+=dt; const k=Math.min(1,R0.t/R0.dur), A=R0.from, Bp=R0.to;
    const rx=o=>o===badA?-.35:.35;   // tay phải: nhìn về +z → phía −x
    Bp.x+=(R0.tx-rx(Bp)-Bp.x)*Math.min(1,dt*3); A.x+=(BAD.x-A.x)*Math.min(1,dt*1.5);
    const ax=A.x+rx(A), az=A.z+(A===badA?.45:-.45), bx=R0.tx, bz=Bp.z+(Bp===badA?.45:-.45);
    shuttle.position.set(ax+(bx-ax)*k, 2.2+Math.sin(Math.PI*k)*2.6-(k>.5?(k-.5)*.4:0), az+(bz-az)*k); shuttle.rotation.set(Bp===badB?-1.1:1.1,0,0);
    for(const o of [badA, badB]){ put(o,0); if(!vis(o)) continue; o.a.mixer.update(dt); const sw = o===A ? (k<.18 ? .5+k/.36 : -1) : (k>.8 ? (k-.8)/.2*.5 : -1); if(sw>=0) poseX(o,'swing',T,sw); else poseX(o,'ready'); }
    if(k>=1){ if(R()<.1){ R0.miss=2.4; say(Bp, pick(['Ối, hụt rồi! 😅','Cầu xoáy quá!','Ván này bạn thắng!']), 2.2); [R0.from,R0.to]=[Bp,A]; } else { [R0.from,R0.to]=[Bp,A]; R0.t=0; R0.dur=1.1+R()*.35; R0.tx=BAD.x+(R()*2-1)*1.6; if(R()<.08) say(Bp, pick(['Đỡ nè!','Đập nè! 💥','Hay quá!']), 1.6); } } }

  // ♟️ hai cụ đánh cờ cạnh café
  const chessBots=[person(sM(671), {shirt:0xd9c7a1, pants:0x3a3a3a, long:true, shoe:0x222222}, '👴 Ông Ba · đánh cờ', '#c7d2e0'), person(sM(672), {shirt:0x7a9cc6, pants:0x2a2a2a, long:true, shoe:0x222222}, '👴 Ông Năm · đánh cờ', '#c7d2e0')];
  let chessT=6, chessTurn=0;
  const CHESS_L=[['Chiếu tướng! 😤','Khoan, khoan… để tôi tính đã.'],['Ăn xe nè!','Trời ơi, sơ hở rồi!'],['Đi pháo đầu!','Thì tôi lên mã.'],['Ván này ông thua chắc!','Chưa biết đâu nha ông Ba!'],['Hết cờ rồi, ván mới!','Ván này tôi gỡ lại!']];
  function chessWatch(){ const [a,b]=chessBots; say(a, pick(['Ngồi xem đi cháu, ván này căng lắm!','Cháu biết đánh cờ tướng không?','Xem kỹ nước này nè cháu!']), 3); setTimeout(()=>say(b, pick(['Đừng mách nước nha cháu 😄','Ông Ba đánh hay lắm đó!']), 3), 1600); }
  function updChess(dt, T){ CHESS.stools.slice(0,2).forEach((st,i)=>{ const o=chessBots[i], ux=(st.x-CHESS.table.x)/.82, uz=(st.z-CHESS.table.z)/.82; sitAt(o, st.x+ux*.12, .53, st.z+uz*.12, st.rot); o.a.play('idle'); if(!vis(o)) return; o.a.mixer.update(dt); o.po.apply('sit', T); legsToFloor(o.po, o.a.g, .02); if(chessTurn===i && (T*.5+i*2)%7<1.2) o.po.apply('present', T); });   /* S19g rà soát: ngồi lùi về mép sau đôn, hông cao hơn mặt đôn, chân duỗi ra trước (trước cẳng chân thòng xuyên trong đôn đá) */
    chessT-=dt; if(chessT<=0){ const l=pick(CHESS_L); say(chessBots[chessTurn], l[0], 3); const other=chessBots[1-chessTurn]; setTimeout(()=>say(other, l[1], 3), 1700); chessTurn=1-chessTurn; chessT=10+R()*10; } }

  // 🍦 bán kem · 🧃 quầy nước · ☕ pha chế · 🎤 ca sĩ sân khấu
  CART.o=person(sM(681), {shirt:0xff6b8a, pants:0x2a2a2a, shoe:0x222222, style:'cap'}, '🍦 Anh Phát · bán kem', '#ff6b8a'); CART.o.x=CART.x; CART.o.z=CART.z+.85; CART.o.hd=Math.PI;
  KIOSK.o=person(sF(682), {shirt:0x2a9d8f, pants:0x222222, shoe:0x222222}, '🧃 Chị Mai · quầy nước', '#2a9d8f'); KIOSK.o.x=KIOSK.x; KIOSK.o.z=KIOSK.z+1.0; KIOSK.o.hd=Math.PI;   /* S19g rà soát: đứng sau quầy (trước +0,45 → đứng lọt trong khối quầy) */
  CAFE.staff=person(sF(683), {shirt:0x6b3e26, pants:0x222222, shoe:0x222222}, '☕ Chị Ngân · pha chế', '#ffb547'); CAFE.staff.x=225.85; CAFE.staff.z=115.5; CAFE.staff.hd=-Math.PI/2;
  STAGE.o=person(sM(684), {shirt:0x3a0ca3, pants:0x1d1f24, shoe:0xffffff}, '🎸 Anh Toàn · hát acoustic', '#ffd166'); STAGE.o.x=199; STAGE.o.z=168.9; STAGE.o.hd=Math.PI;
  const VENDORS=[[CART.o,['Kem đây! Kem mát lạnh đây! 🍦','Kem dừa ngon nhất công viên nè!']],[KIOSK.o,['Trà đá, nước mía đây!','Nước dừa tươi mát lạnh nè!']],[CAFE.staff,['Cà phê sữa đá ngon nhất bờ hồ!','Ngồi bàn dù ngắm thuyền nha mọi người!']]];
  function updVendors(dt, T){ for(const [v,lines] of VENDORS){ v.a.play('idle'); put(v, 0); if(vis(v)){ v.a.mixer.update(dt); if(((T*.15+v.x)%9)<1.8) v.po.apply('present', T); } if(R()<dt*.02) say(v, pick(lines), 2.6); }
    const s=STAGE.o; s.a.play('idle'); put(s, STAGE.h); if(vis(s)){ s.a.mixer.update(dt); const ph=(T*.12)%3; if(ph<1.6) s.po.apply('dance', T); else s.po.apply('present', T); }
    if(R()<dt*.02) say(s, pick(['🎶 Chiều nay em ra bờ hồ…','🎸 Bài tiếp theo tặng các bạn chạy bộ nè!','🎤 Ai lên song ca với mình không?']), 3); }

  // 🧺 cặp đôi picnic · 🪁 bé thả diều · 🦢 2 khách đạp thuyền
  const sitters=[]; const sitNPC=(seed,of,name,seat,pose,h)=>{ seat.taken='npc'; const o=person(seed,of,name,'#c7d2e0',h); o.seat=seat; o.pose=pose; o.ph=R()*9; sitters.push(o); return o; };
  if(!LOW){ const A=PICNIC[0].seats; sitNPC(sM(724),{shirt:0x2a2a2a, pants:0x3b4a6b, shoe:0x222222},'🧑 Minh · picnic',A[0],'sit'); sitNPC(sF(725),{shirt:0xf3c6d3, pants:0xffffff, shoe:0xffffff},'👩 Thư · picnic',A[2],'eat'); }
  const PIC_TALK=[['Bánh mì này ngon ghê!','Tự tay mình làm đó 😊'],['Chiều nay gió mát quá ha.','Ừ, mai lại ra đây picnic nữa nha!'],['Lát mình đi đạp thuyền thiên nga không?','Đi! Rồi ghé café bên hồ 📸']];
  let picT=6;
  const kite={kid:person(sM(731),{shirt:0xffd23f, pants:0x2a3a5a, shoe:0xff4f6d},'👦 Bé Tí · thả diều','#ffd23f',1.15)}; kite.kid.x=KITE.x; kite.kid.z=KITE.z; kite.kid.hd=dg(143);
  { const g=new THREE.Group(); const body=new THREE.Mesh(vcGeo([{g:new THREE.PlaneGeometry(1.1,1.1), c:0xff4f6d, rz:Math.PI/4, sy:1.35},{g:new THREE.PlaneGeometry(.06,1.5), c:0x2a2a2a, z:.01},{g:new THREE.PlaneGeometry(1.4,.05), c:0x2a2a2a, y:.12, z:.01}]), new THREE.MeshStandardMaterial({vertexColors:true, side:THREE.DoubleSide, roughness:.7}));
    g.add(body); const tail=new THREE.Mesh(vcGeo([0,1,2,3,4].map(i=>({g:new THREE.PlaneGeometry(.18,.12), c:[0xffd23f,0x4fc3ff,0x46d39a,0xff8a2a,0xb06cff][i], y:-.95-i*.32, rz:(i%2?.4:-.4)}))), body.material); g.add(tail); g.userData.dynamic=true; scene.add(g); kite.g=g; kite.tail=tail;
    kite.line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({color:0xeeeeee})); kite.line.frustumCulled=false; kite.line.userData.dynamic=true; scene.add(kite.line);
    kite.kid.a.g.traverse(o=>{ if(o.isBone && !kite.hand && /RightHand$/.test(o.name)) kite.hand=o; }); }
  const riders=[0,1].map(i=>{ const o=person(i?sF(751):sM(752), {shirt:i?0xff9fc4:0x46d39a, pants:0x2a3a5a, shoe:0xffffff}, i?'👩 Khách đạp thuyền':'🧑 Khách đạp thuyền','#4fc3ff'); o.boat=SWANS[i]; return o; });
  function updMisc(dt, T){
    for(const o of sitters){ sitAt(o, o.seat.x, o.seat.y, o.seat.z, o.seat.rot); o.a.play('idle'); if(vis(o)){ o.a.mixer.update(dt); o.po.apply(o.pose, T+o.ph); } }
    if(sitters.length>1){ picT-=dt; if(picT<=0){ picT=12+R()*10; const l=pick(PIC_TALK); say(sitters[0], l[0], 3); setTimeout(()=>say(sitters[1], l[1], 3), 1800); } }
    { const k=kite.kid; k.a.play('idle'); put(k, 0); if(vis(k)){ k.a.mixer.update(dt); k.po.apply('present', T*.4); }
      const kx=k.x+6+Math.sin(T*.37)*1.6, ky=11.5+Math.sin(T*.53)*1.2, kz=k.z-8+Math.cos(T*.29)*1.2; kite.g.position.set(kx,ky,kz); kite.g.lookAt(k.x,ky-3,k.z); kite.tail.rotation.z=Math.sin(T*3)*.25;
      if(kite.hand) kite.hand.getWorldPosition(_hand); else _hand.set(k.x,1.3,k.z); const la=kite.line.geometry.attributes.position; la.setXYZ(0,_hand.x,_hand.y,_hand.z); la.setXYZ(1,kx,ky-.2,kz); la.needsUpdate=true;
      if(R()<dt*.03) say(k, pick(['Diều bay cao quá! 🪁','Gió mạnh ghê!','Thả cao hơn nữa nè!']), 2.6); }
    for(const o of riders){ const b=o.boat; o.x=b.x-Math.sin(b.h)*.25; o.z=b.z-Math.cos(b.h)*.25; o.a.g.position.set(o.x, (b.y??WY)+.55+.04-o.hipsH, o.z); o.a.g.rotation.set(0,b.h,0); o.col.x=1e9; o.a.play('idle'); if(vis(o)){ o.a.mixer.update(dt); o.po.apply('sit',T); } } }

  /* ---------- khách quán: café bên hồ (js/cafe.js) ---------- */
  { if(!W.CAFES) W.CAFES=[];
    const C={name:'Café Bên Hồ', center:{x:222.5, z:125}, max:3, groups:CAFE.groups, drinks:['cà phê sữa đá','trà sữa trân châu','nước dừa','trà sen'],
      spawn:{x:227.6, z:110.0}, entry:[[224.6,112.8]], order:()=>({x:CAFE.order.x, z:CAFE.order.z, face:Math.PI/2}), via:(ap)=>[[223.4,118.4],[ap.x,118.4]],
      talks:[[[0,'Hồ này rộng ghê, chiều đạp thuyền chắc vui!'],[1,'Lát thuê thuyền thiên nga đi một vòng 🦢'],[0,'Chốt! Uống xong ly này đã ☕']],
             [[1,'Ngồi đây nhìn mấy bạn chạy bộ mà có động lực ghê.'],[0,'Mai mình cũng ra chạy 3 vòng nha 🏃']],
             [[0,'Nghe nói đài phun nước đầu cầu ước gì được nấy.'],[1,'Vậy lát ném 1 xu ước hết bug 😆']],
             [[1,'Tối nay sân khấu cỏ có nhạc acoustic đó.'],[0,'Vậy ngồi đây tới tối luôn 🎶']]],
      live:[], active:false, spawnT:0};
    W.CAFES.push(C); out.cafe=C; }

  /* ============================== 26. TẬP THỂ DỤC / YOGA / XÀ ĐƠN (người chơi) ============================== */
  let ex=null; const mePoser=makePoser(THREE, W.me), ME={a:W.me, po:mePoser}, meHips=()=>mePoser.hipsHeight();
  function startEx(m){ if(W.inside || HOOK.vehicle) return; if(m.busy && m.busy!=='me') return toast(`💪 Có người đang tập ${m.name} – chờ chút hoặc chọn máy khác nhé!`, 2600);
    m.busy='me'; m.t=0; ex={m, t:0, k:0, dur:m.yoga?27:m.hang?10.5:8};
    const ctrl={ drive(dt, inp){ if(!ex || HOOK.vehicle!==ctrl) return; if(inp.ix||inp.iz){ stopEx(false); return; }
        if(ex.t>.1 && Math.hypot(P.x-m.ux,P.z-m.uz)>1.2){ m.busy=null; HOOK.vehicle=null; ex=null; return; }   // bị dịch chuyển (bản đồ / taxi) → thôi tập
        ex.t+=dt; let y=m.uy;
        if(m.hang){ ex.k=(1-Math.cos(ex.t*2.4))/2; y=m.bar-(W.me.h||1.75)*1.2+.5*ex.k; }
        if(m.yoga){ ex.pose=yogaPose(W.T||0); y=ex.pose==='lotus' ? .14-meHips() : 0; }
        P.x=m.ux; P.z=m.uz; P.y=Math.max(0,y); P.face=m.face+(m.twist?Math.sin(ex.t*2.6)*.6:0); P.vx=P.vz=0;
        W.me.g.position.set(m.ux, y, m.uz); W.me.g.rotation.set(0,P.face,0); W.me.play(m.clip==='walk'?'walk':'idle');
        if(ex.t>=ex.dur) stopEx(true); } };
    HOOK.vehicle=ctrl; ex.ctrl=ctrl; toast(m.yoga?'🧘 Tập yoga cùng lớp – làm theo cô Thảo nhé… (phím di chuyển để dừng)':`💪 Đang tập ${m.name}… (phím di chuyển để dừng)`, 2600); }
  function stopEx(done){ if(!ex) return; const m=ex.m; m.busy=null; if(HOOK.vehicle===ex.ctrl) HOOK.vehicle=null; P.x=m.inter.x; P.z=m.inter.z; P.px=P.x; P.pz=P.z; P.y=groundAt(P.x,P.z); P.vx=P.vz=0; ex=null;
    if(done){ S.buffs=S.buffs||{}; S.buffs.energy=Math.max(Date.now(), S.buffs.energy||0)+3*60000; save(); burst(new THREE.Vector3(P.x,1.6,P.z), [0x46d39a,0xffd23f], 30, 1.6, 1.2, -2, .12);
      toast(m.yoga?'🧘 Xong buổi yoga! Người nhẹ tênh: +3 phút chạy nhanh ⚡':m.hang?'💪 8 cái xà đơn! Tay cứng như thép: +3 phút chạy nhanh ⚡':'💪 Xong 1 hiệp! Người khoẻ re: +3 phút chạy nhanh ⚡', 2800); } }

  /* ============================== 27. MUA NƯỚC / KEM ============================== */
  function openShop(title, items, after){ const m=ui.modal(title), grid=document.createElement('div'); grid.className='grid';
    for(const it of items){ const [n,price,buff,min,desc]=it; const c=document.createElement('div'); c.className='card'; c.style.cursor='pointer';
      c.innerHTML=`<b>${n}</b><small>${desc}</small><div class="row" style="margin-top:auto"><span class="price">${fmt(price)} 💰</span></div>`;
      c.onclick=()=>{ m.close(); askPay(price, `${n} – ${desc}`, ()=>{ if(!spend(price)) return; if(buff){ S.buffs=S.buffs||{}; S.buffs[buff]=Math.max(Date.now(), S.buffs[buff]||0)+min*60000; } S.stats && (S.stats.drinks=(S.stats.drinks||0)+1); save();
        toast(`${n} – ngon tuyệt! ${buff?desc:'Mát cả người 😌'}`, 3200); if(after) after(it); }); };
      grid.appendChild(c); }
    m.body.innerHTML='<p class="muted">Chọn món – xác nhận trước khi trả tiền. Hiệu ứng (chạy nhanh / thưởng quiz) cộng dồn thời gian.</p>'; m.body.appendChild(grid); }
  function dropCan(V){ V.can.visible=true; V.t=1.6; V.can.position.set(V.x+.2,.42,V.z-.42); burst(new THREE.Vector3(V.x,.5,V.z-.5), [0xffffff,0x8fd3ff], 12, .8, .5, -6, .06); }

  /* ============================== 28. ÂM THANH NỀN (chim hót ban ngày · dế kêu ban đêm) ============================== */
  const AU={ctx:null, out:null, next:0};
  const sfxOn=()=>{ try{ return localStorage.getItem('qcworld-sfx')!=='0'; }catch(e){ return true; } };
  function audio(vol){ if(!sfxOn() || vol<=0){ if(AU.out) AU.out.gain.setTargetAtTime(0, AU.ctx.currentTime, .3); return; }
    if(!AU.ctx){ if(!(navigator.userActivation && navigator.userActivation.hasBeenActive)) return; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; AU.ctx=new AC(); AU.out=AU.ctx.createGain(); AU.out.gain.value=0; AU.out.connect(AU.ctx.destination); }
    const c=AU.ctx; if(c.state==='suspended') c.resume(); AU.out.gain.setTargetAtTime(vol, c.currentTime, .4); if(AU.next>c.currentTime+.3) return;
    const t=c.currentTime+.05;
    if(night()<.5){ const n=2+Math.floor(R()*4), f0=2600+R()*1800; for(let i=0;i<n;i++){ const o=c.createOscillator(), g=c.createGain(), s=t+i*.11; o.type='sine'; o.frequency.setValueAtTime(f0,s); o.frequency.exponentialRampToValueAtTime(f0*(1.3+R()*.4),s+.07); g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(.05,s+.015); g.gain.exponentialRampToValueAtTime(.001,s+.09); o.connect(g); g.connect(AU.out); o.start(s); o.stop(s+.1); } AU.next=t+1.2+R()*3.2; }
    else { for(let i=0;i<6;i++){ const o=c.createOscillator(), g=c.createGain(), s=t+i*.06; o.type='triangle'; o.frequency.value=4300+R()*200; g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(.025,s+.01); g.gain.exponentialRampToValueAtTime(.001,s+.045); o.connect(g); g.connect(AU.out); o.start(s); o.stop(s+.05); } AU.next=t+.8+R()*1.6; } }

  /* ============================== 29. THUYỀN THIÊN NGA (thuê đạp quanh thuỳ Nam) ============================== */
  let ride=null; const rideMesh=new THREE.Mesh(swanGeo, swanMat); rideMesh.visible=false; rideMesh.castShadow=true; rideMesh.userData.dynamic=true; scene.add(rideMesh);
  const lakeIn=lake.poly(-1.1,200), PLAKE=lake.poly(.3,200);
  const boatOK=(x,z)=>z>SLOBE[0]+1.2 && inPoly(x,z,lakeIn) && !(Math.abs(z-DZ)<DW/2+1 && x>DX0-1.2);
  function startRide(){ if(HOOK.vehicle || W.inside) return; const pk=SWANS.find(s=>s.parked && !s.hide); if(!pk) return toast('🦢 Hết thuyền trống, chờ chút nhé!'); pk.hide=true;
    ride={x:pk.x-.8, z:pk.z, h:-Math.PI/2, v:0, pk, t:0, bumpT:0}; rideMesh.visible=true;
    const ctrl={ drive(dt, inp){ if(!ride || HOOK.vehicle!==ctrl) return; ride.t+=dt; if(ride.t>.2 && Math.hypot(P.x-ride.x,P.z-ride.z)>2.5){ endRide(false); return; }
        ride.h-=inp.ix*1.1*dt; const tv=inp.iz>0?1.7:inp.iz<0?-.6:0; ride.v+=(tv-ride.v)*Math.min(1,dt*1.4); const nx=ride.x+Math.sin(ride.h)*ride.v*dt, nz=ride.z+Math.cos(ride.h)*ride.v*dt;
        if(boatOK(nx,nz)){ ride.x=nx; ride.z=nz; } else { ride.v*=-.25; if(ride.bumpT<=0){ toast('🦢 Cộc! Thuyền chạm bờ / bến – lùi lại (S) rồi rẽ nhé. (Thuyền không qua được gầm Cầu Vòm)', 2400); ride.bumpT=3; } } ride.bumpT-=dt;
        const by=WY-.02+Math.sin(W.T*1.6)*.02; rideMesh.position.set(ride.x,by,ride.z); rideMesh.rotation.set(Math.sin(W.T*1.3)*.02,ride.h,0);
        P.x=ride.x; P.z=ride.z; P.px=P.x; P.pz=P.z; P.y=by+.5; P.vx=P.vz=0; P.face=ride.h;
        W.me.g.position.set(ride.x-Math.sin(ride.h)*.25, by+.55+.04-meHips(), ride.z-Math.cos(ride.h)*.25); W.me.g.rotation.set(0,ride.h,0); W.me.play('idle'); } };
    ride.ctrl=ctrl; HOOK.vehicle=ctrl; toast('🦢 Lên thuyền! W/S: đạp tới/lùi · A/D: rẽ · về bến (bờ Đông) bấm E để trả thuyền.', 4200); }
  const onWaterP=(x,z)=>inPoly(x,z,PLAKE) && !(Math.abs(z-DZ)<DW/2+.1 && x>DX0-.1);
  function endRide(atDock){ if(!ride) return; ride.pk.hide=false; rideMesh.visible=false; if(HOOK.vehicle===ride.ctrl) HOOK.vehicle=null;
    if(!atDock && onWaterP(P.x,P.z)) atDock=true;   // bị ngắt giữa hồ (gọi xe, ngồi…) → luôn đưa về bến, không để đứng trên mặt nước
    if(atDock){ P.x=DOCK.tip.x; P.z=DOCK.tip.z; P.px=P.x; P.pz=P.z; P.y=.26; P.vx=P.vz=0; toast('⚓ Đã trả thuyền. Cảm ơn bạn đã đạp thuyền quanh Hồ Ngọc! 🦢', 2600); } ride=null; }
  INTER.push({x:DOCK.tip.x, z:DOCK.tip.z, r:1.6, prio:.8, label:'🦢 Thuê thuyền thiên nga đạp quanh hồ (E · 20 💰)', action:()=>askPay(20,'🦢 Thuê 1 thuyền thiên nga (đạp tự do quanh thuỳ Nam Hồ Ngọc, trả ở bến)',()=>{ if(!spend(20)) return; startRide(); })});
  zl('🦢 Bến thuyền thiên nga', 'Bấm E ở đầu bến để thuê (20 💰)', {x:(DX0+DXS)/2, y:2.4, z:DZ});

  /* ============================== 30. KHUNG HÌNH (chỉ chạy khi bạn ở trong / sát công viên) ============================== */
  let active=false, nearT=0;
  const FISHIM=[koiIM, duckIM, pigIM, swanIM].filter(Boolean); for(const im of FISHIM) im.frustumCulled=false;
  function setActive(on){ active=on; for(const o of NPC){ o.a.g.visible=on; if(!on){ o.col.x=1e9; if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } } } if(dog){ dog.g.visible=on; if(!on) dog.col.x=1e9; }
    for(const m of [leash, kite.g, kite.line, shuttle, ...FISHIM]) if(m) m.visible=on; if(FOUNT.jets) FOUNT.jets.visible=on; }
  setActive(false);
  const NPC_FAR=(LOW?60:85)**2;
  function cullNPC(){ const c=W.camera.position; for(const o of NPC){ const v=(o.a.g.position.x-c.x)**2+(o.a.g.position.z-c.z)**2<NPC_FAR; if(o.a.g.visible!==v) o.a.g.visible=v; }
    if(dog){ dog.g.visible=(dog.x-c.x)**2+(dog.z-c.z)**2<NPC_FAR; if(leash) leash.visible=dog.g.visible; } }
  const parkDist=()=>{ if(W.inside) return 1e9; const dx=Math.max(PK.x0-P.x,0,P.x-PK.x1), dz=Math.max(PK.z0-P.z,0,P.z-PK.z1); return Math.hypot(dx,dz); };
  const _mm=new THREE.Matrix4(), _qq=new THREE.Quaternion(), _ss=new THREE.Vector3(1,1,1), _pp=new THREE.Vector3();
  const fishOK=(x,z)=>inPoly(x,z,LPOLY) && Math.hypot(x-ISL.x,z-ISL.z)>ISL.r+.5 && !(Math.abs(x-IBX)<IBW/2+.3 && z>zA && z<ISL.z) && !(Math.abs(z-DZ)<DW/2+.3 && x>DX0-.3);
  function swim(list, dt, T, im, y, feed, upd){ list.forEach((f,i)=>{ let tx=f.tx, tz=f.tz;
      if(feed){ const side=(P.z<BZ?-1:1); tx=BX+((f.ph*7)%2-1)*4.5; tz=BZ+side*(2.4+(f.ph%1)*1.6); }
      const dx=tx-f.x, dz=tz-f.z, d=Math.hypot(dx,dz);
      if(d<.3 && !feed){ const p=rndWater(f.lobe); f.tx=p[0]; f.tz=p[1]; }
      const sp=f.sp*(feed?2.4:1); if(d>.05){ f.h=lerpAngle(f.h, Math.atan2(dx,dz), 1-Math.exp(-dt*(feed?3:1.2))); const nx=f.x+Math.sin(f.h)*sp*dt, nz=f.z+Math.cos(f.h)*sp*dt; if(fishOK(nx,nz)){ f.x=nx; f.z=nz; } else { const p=rndWater(f.lobe); f.tx=p[0]; f.tz=p[1]; } }
      upd(f, T); _qq.setFromAxisAngle(_v.set(0,1,0), f.yaw ?? f.h); _mm.compose(_pp.set(f.x, f.y ?? y, f.z), _qq, _ss); im.setMatrixAt(i,_mm); }); im.instanceMatrix.needsUpdate=true; }
  function swimSwans(dt, T){ SWANS.forEach((f,i)=>{ if(f.parked){ _mm.compose(_pp.set(f.x,WY-.02+Math.sin(T*1.3+f.ph)*.02,f.z), _qq.setFromAxisAngle(_v.set(0,1,0),f.h), f.hide?_ss.set(0,0,0):_ss.set(1,1,1)); swanIM.setMatrixAt(i,_mm); _ss.set(1,1,1); return; }
      const dx=f.tx-f.x, dz=f.tz-f.z, d=Math.hypot(dx,dz); if(d<.5){ const p=rndWater(SLOBE,1.6); f.tx=p[0]; f.tz=p[1]; }
      if(d>.05){ f.h=lerpAngle(f.h, Math.atan2(dx,dz), 1-Math.exp(-dt*.9)); const nx=f.x+Math.sin(f.h)*f.sp*dt, nz=f.z+Math.cos(f.h)*f.sp*dt; if(freeSwan(nx,nz,.5) || !freeSwan(f.x,f.z,.5)){ f.x=nx; f.z=nz; } else { const p=rndWater(SLOBE,1.6); f.tx=p[0]; f.tz=p[1]; } }
      f.y=WY-.02+Math.sin(T*1.4+f.ph)*.025; _mm.compose(_pp.set(f.x, f.y, f.z), _qq.setFromAxisAngle(_v.set(0,1,0), f.h), _ss); swanIM.setMatrixAt(i,_mm); }); swanIM.instanceMatrix.needsUpdate=true; }
  HOOK.onFrame.push((dt, T)=>{
    swayU.value=T; waterMat.normalMap.offset.set(T*.012, T*.007);
    strM.emissiveIntensity=night()*2.6;
    for(const V of VEND){ if(V.t>0){ V.t-=dt; if(V.t<=0) V.can.visible=false; } }
    if(ex && HOOK.vehicle!==ex.ctrl){ ex.m.busy=null; ex=null; }
    if(ex){ HOOK.vehicleInter=()=>({label:`${ex&&ex.m.yoga?'🧘 Đang tập yoga':'💪 Đang tập '+(ex?ex.m.name:'')} – E để dừng`, action:()=>stopEx(false)});
      if(ex.m.hang) poseX(ME,'hang',T,ex.k); else if(ex.m.yoga) poseX(ME,ex.pose||'lotus',T); else if(ex.m.sit) mePoser.apply('sit',T); else if(ex.m.arms) mePoser.apply('present',T); }
    if(ride){ HOOK.vehicleInter=()=>(ride && Math.hypot(ride.x-DOCK.park[0][0], ride.z-DZ)<4.2) ? {label:'⚓ Cập bến – trả thuyền (E)', action:()=>endRide(true)} : {label:'🦢 Đang đạp thuyền · W/S tới-lùi · A/D rẽ · về bến bờ Đông để trả'}; if(HOOK.vehicle===ride.ctrl) mePoser.apply('sit', T); else endRide(false); }
    nearT-=dt; if(nearT<=0){ nearT=.5; const d=parkDist(); if(!active && d<38) setActive(true); else if(active && d>52) setActive(false); if(active) cullNPC();
      audio(d<30 ? clamp(1-d/30,0,1)*.55 : 0); }
    if(!active) return;
    dt=Math.min(dt,.1);
    for(const o of NPC) if(o.bubble){ o.bubbleT-=dt; if(o.bubbleT<=0){ removeLabel(o.bubble); o.bubble=null; } }
    joggers.forEach(o=>updJog(o, dt, T)); updWalker(dt, T); updKids(dt, T); updGym(dt, T); updYoga(dt, T); updBad(dt, T); updChess(dt, T); updVendors(dt, T); updMisc(dt, T);
    feedT-=dt; const feed=feedT>0 && Math.abs(P.z-BZ)<BWD/2+.2 && P.x>bxa && P.x<bxb;
    if(koiIM) swim(KOI, dt, T, koiIM, WY-.065, feed, (f,T)=>{ f.yaw=f.h+Math.sin(T*6+f.ph)*.18; });
    if(duckIM) swim(DUCK, dt, T, duckIM, WY, feed && feedT>4, (f,T)=>{ f.yaw=f.h; f.y=WY-.02+Math.sin(T*1.7+f.ph)*.012; });
    swimSwans(dt, T);
    if(pigIM){ PIG.forEach((p,i)=>{ const dP=Math.hypot(P.x-p.x,P.z-p.z), fast=(P.speed||0)>2;
        if(p.fly>0){ p.fly-=dt; p.x+=p.vx*dt; p.z+=p.vz*dt; p.y=Math.max(0,p.y+p.vy*dt); p.vy-=dt*.6; if(p.fly<=0){ const [x,z]=pigSpot(); p.x=x; p.z=z; p.y=0; p.vy=0; p.wait=3+R()*6; } }
        else if(dP<(fast?3.6:2.0) && p.wait<=0){ const a=Math.atan2(p.x-P.x, p.z-P.z)+(R()-.5); p.vx=Math.sin(a)*4; p.vz=Math.cos(a)*4; p.vy=3.2; p.fly=2.2; p.h=a; }
        else { p.wait-=dt; p.peck-=dt; if(p.peck<0){ p.peck=1+R()*3; p.h+=(R()-.5)*1.5; } const step=(p.peck%1<.4)?.12*dt:0; p.x+=Math.sin(p.h)*step; p.z+=Math.cos(p.h)*step; }
        const pitch=p.fly>0?0:(Math.sin(T*9+i)>.6?.5:0); _qq.setFromEuler(_e.set(pitch,p.h,0,'YXZ')); _mm.compose(_pp.set(p.x,.05+p.y,p.z), _qq, _ss); pigIM.setMatrixAt(i,_mm); }); pigIM.instanceMatrix.needsUpdate=true; }
    if(FOUNT.jets){ const k=.8+.25*Math.sin(T*2.2); FOUNT.jets.scale.set(1, k*1.6, 1); }
  });

  /* ============================== 32. BẢN ĐỒ + NHÃN ============================== */
  makeLabel('🌳 Đại công viên Hồ Ngọc', 'QC City Central Park · hồ lớn · Cầu Vòm · đường chạy · thể dục · café · sân khấu', {h:.75, x:199, y:6.4, z:16.0, fade:90});
  PLACES.push({icon:'🌳', name:'Đại công viên Hồ Ngọc', sub:'Giữa thành phố: hồ lớn có eo, Cầu Vòm, đảo thủy đình, sàn gỗ ven hồ, đường chạy gạch đỏ, thể dục, yoga, cầu lông, café, sân khấu, sân chơi', go:()=>teleport(199, 19.8, 199, 40)});
  PLACES.push({icon:'🌉', name:'Cầu Vòm Hồ Ngọc', sub:'Giữa hồ – cho cá koi ăn, ngắm 2 thuỳ hồ · đài phun nước ước nguyện ở đầu cầu Tây', go:()=>teleport(PW.x+4.2, BZ+3.4, BX, BZ)});
  PLACES.push({icon:'🦢', name:'Bến thuyền thiên nga · Café Bên Hồ', sub:'Thuê thuyền đạp quanh thuỳ Nam Hồ Ngọc · café bàn dù · bàn cờ đá', go:()=>teleport(DXS+2.6, DZ-3.4, DX0, DZ)});
  try{ const TD=ctx.transit && ctx.transit.TAXI_DEST; if(TD){ TD.push({icon:'🦢', name:'Đại công viên Hồ Ngọc · Cổng Đông (bến thuyền)', x:252, z:BZ}); TD.push({icon:'🎤', name:'Đại công viên Hồ Ngọc · Cổng Nam (sân khấu)', x:199, z:200}); } }catch(e){}

  KO.build(); KG.build();
  out.npc=NPC.length; out.instanced=IMS.length; out.lake={LC, BZ, bxa, bxb, ISL, zA, zB, DOCK, BX};
  out.audit=()=>{ const bad=[]; for(const f of FP){ const w=zoneAt(f.x,f.z); if((w==='track' || w==='lake' || w==='out') && !/cầu|đảo|thủy|bến|đình/.test(f.tag)) bad.push(`${f.tag}@${f.x.toFixed(1)},${f.z.toFixed(1)}:${w}`); }
    return {conflicts:out.conflicts, misplaced:bad, trees:out.trees, planters:out.planters, npc:NPC.length, seats:SEATLIST.length}; };
  Object.assign(out, {TREES, lanterns:LANT, joggers, walker, dog, GYM, VEND, kids:[kidA,kidB,mom], setActive, lanes:{JOGI, JOGO, DECK}, zoneAt, PK, startRide, endRide, getRide:()=>ride, boatOK, SWANS, startEx, stopEx, YM, badminton:RAL, puller, coach});
  if(out.conflicts.length) console.info('[park] chồng lấn:', out.conflicts);
  return out;
}
