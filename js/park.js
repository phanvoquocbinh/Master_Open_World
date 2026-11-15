// QC World – S19: 🌳 CÔNG VIÊN TRUNG TÂM (giữa Downtown, lô x 183–215 · z 41–66) + 🌿 CÂY XANH / CHẬU HOA TRÊN PHỐ
//  • Hồ nước ở giữa: mặt nước gợn sóng phản chiếu bầu trời, bờ kè đá granite + đá cảnh, hoa súng, cỏ lau, đảo nhỏ có cây liễu + nhà vịt,
//    cá koi bơi dưới nước, vịt bơi; cầu gỗ vòm bắc ngang hồ (đi lên được, E: cho cá ăn 2 💰 → cá & vịt kéo tới)
//  • Lối dạo lát gạch vòng quanh hồ, ghế đá + băng ghế gỗ (ngồi được), giàn hoa giấy, bàn cờ đá, sân chơi trẻ em (xích đu, cầu trượt,
//    thú nhún), khu thể dục ngoài trời (dùng được), góc giải khát: 3 máy bán nước tự động + quầy nước + xe kem (E → mua, trừ tiền qua askPay)
//  • Đèn lồng công viên + dây đèn ban đêm, cổng vòm, bảng sơ đồ, biển chỉ dẫn, bồ câu (chạy lại gần là bay)
//  • Người: chạy bộ quanh hồ (gặp bạn thì xin đường / vòng qua), cô dắt chó, trẻ con chơi xích đu + cầu trượt, các cụ đánh cờ + tập thể dục,
//    khách mua nước ở quầy rồi ra ghế đá ngồi trò chuyện theo cặp; ngồi cạnh khách đi 1 mình → được hỏi thăm (js/cafe.js, registry W.CAFES)
//  • Cây xanh + chậu hoa dọc vỉa hè Downtown & Phường Khởi Nghiệp: InstancedMesh (mỗi loại cây = 1 lượt vẽ cho cả thành phố), lay nhẹ theo gió,
//    có va chạm; chỉ đặt ở vỉa hè đủ rộng (chừa ≥1 m lối đi), tránh cửa toà nhà, vạch qua đường, trạm xe, ghế, cột đèn
//  • Va chạm: mép hồ = vòng chặn (đứng lại tại chỗ + báo lý do), lan can cầu, mọi đồ vật có circles/boxes/SEGS; bot chạy bộ / dắt chó có va chạm với bạn
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makePoser } from './pose.js';

export async function make(W, ctx){
  try{ if(localStorage.getItem('qcworld-park')==='off') return null; }catch(e){}   // công tắc gỡ lỗi / đo A/B hiệu năng (mặc định: bật)
  const {THREE, scene, MAT, colorMat, circles, boxes, INTER, PLACES, HOOK, P, toast, makeLabel, removeLabel, makeActor, groundAt, lerpAngle, burst, teleport, mergeGeometries, addSeg, plats, CITY, GLOW} = W;
  const {S, save, ui, askPay, spend, fmt} = ctx;
  const TAU=Math.PI*2, LOW=W.QUAL==='low', R=Math.random;
  const clamp=(v,a,b)=>v<a?a:v>b?b:v, pick=a=>a[Math.floor(R()*a.length)], rr=(a,b)=>a+R()*(b-a), dg=d=>d*Math.PI/180;
  const rng=(s=>()=>{ s=(s+0x6D2B79F5)|0; let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; })(20261114);
  const hash=(x,y,z)=>{ const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return s-Math.floor(s); };
  const night=()=>W.night||0;
  const out={conflicts:[], seats:[], trees:0, planters:0};
  const FLW=[], BUSH=[], STR=[], CHESS={};   // hoa · bụi cây · bóng đèn dây (InstancedMesh, dựng ở mục 7) · bàn cờ

  /* ============================== 0. TIỆN ÍCH DỰNG HÌNH ============================== */
  const OX=199, OZ=54;   // gốc toạ độ nội bộ của khối tĩnh (giữa công viên) → perf.js batchStatic gộp vào 1 ô
  const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3();
  function Kit(cast){ const parts=new Map();
    return { add(geo, mat, x=0,y=0,z=0, ry=0, rx=0, rz=0, sx=1,sy=1,sz=1){ const g=geo.index?geo.toNonIndexed():geo.clone();
        for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal' && k!=='uv') g.deleteAttribute(k);
        if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
        g.clearGroups(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m4.compose(_v.set(x-OX,y,z-OZ), _q, _s.set(sx,sy,sz)); g.applyMatrix4(_m4);
        if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); return g; },
      build(){ const res=[]; for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.position.set(OX,0,OZ); ms.castShadow=cast; ms.receiveShadow=true; scene.add(ms); res.push(ms); } parts.clear(); return res; } }; }
  const KO=Kit(true), KG=Kit(false);
  const ctex=(w,h,draw,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.userData.live=true; } return t; };
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), CY=(a,b,h,n=10)=>new THREE.CylinderGeometry(a,b,h,n);
  // đa giác (toạ độ thế giới) → hình phẳng nằm ngang (UV = mét)
  const toShape=(pts, S=THREE.Shape)=>{ const s=new S(); pts.forEach(([x,z],i)=>i?s.lineTo(x-OX,-(z-OZ)):s.moveTo(x-OX,-(z-OZ))); s.closePath(); return s; };
  function flat(pts, holes=[]){ const s=toShape(pts); for(const h of holes) s.holes.push(toShape(h, THREE.Path)); const g=new THREE.ShapeGeometry(s); g.rotateX(-Math.PI/2); return g; }
  function slab(pts, holes, depth){ const s=toShape(pts); for(const h of holes) s.holes.push(toShape(h, THREE.Path)); const g=new THREE.ExtrudeGeometry(s, {depth, bevelEnabled:false}); g.rotateX(-Math.PI/2); return g; }
  const rect=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
  const circ=(x,z,r,n=28)=>{ const a=[]; for(let i=0;i<n;i++){ const t=i/n*TAU; a.push([x+Math.cos(t)*r, z+Math.sin(t)*r]); } return a; };

  /* ---------- vật liệu ---------- */
  const paveT=ctex(256,256,(g,w,h)=>{ g.fillStyle='#857a6b'; g.fillRect(0,0,w,h); const n=8, s=w/n;   // gạch 50×25 cm lát so le, 3 tông màu
    for(let r=0;r<n;r++) for(let c=-1;c<n/2;c++){ const x=c*2*s+(r%2)*s, v=rng(), b=v<.5?[205,193,172]:v<.82?[188,176,158]:[214,168,138], k=.9+rng()*.16;
      g.fillStyle=`rgb(${b[0]*k|0},${b[1]*k|0},${b[2]*k|0})`; g.fillRect(x+1,r*s+1,2*s-2,s-2); }
    for(let i=0;i<2200;i++){ g.fillStyle=`rgba(0,0,0,${rng()*.07})`; g.fillRect(rng()*w,rng()*h,2,2); } }, true); paveT.repeat.set(.5,.5);
  const graniteT=ctex(256,256,(g,w,h)=>{ g.fillStyle='#a7a39a'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=64) for(let x=0;x<w;x+=128){ const v=150+rng()*34|0; g.fillStyle=`rgb(${v},${v-3},${v-9})`; g.fillRect(x+((y/64)%2)*64+1,y+1,126,62); g.fillRect(x+((y/64)%2)*64+1-w,y+1,126,62); }
    for(let i=0;i<5000;i++){ const v=rng()<.5?50:235; g.fillStyle=`rgba(${v},${v},${v},${rng()*.28})`; g.fillRect(rng()*w,rng()*h,1.6,1.6); } }, true); graniteT.repeat.set(.6,.6);
  const lawnT=W.TX.grass.clone(); lawnT.wrapS=lawnT.wrapT=THREE.RepeatWrapping; lawnT.repeat.set(1/3.2,1/3.2); lawnT.needsUpdate=true;
  const M={
    lawn: new THREE.MeshStandardMaterial({map:lawnT, color:0xbfdc92, roughness:1, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-1}),
    pave: new THREE.MeshStandardMaterial({map:paveT, roughness:.86, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2}),
    granite: new THREE.MeshStandardMaterial({map:graniteT, roughness:.7}),
    bed: colorMat(0x26372c,{roughness:1}),
    soil: colorMat(0x4a3526,{roughness:1}),
    stoneW: colorMat(0xe6e1d6,{roughness:.7}),      // đá trắng bồn hoa
    stoneG: colorMat(0xb9b3a7,{roughness:.75}),     // ghế đá granite
    rock: colorMat(0x8f8a80,{roughness:.9}),
    iron: colorMat(0x26332c,{roughness:.45, metalness:.5}),   // gang sơn xanh đen
    ironB: colorMat(0x1b1d21,{roughness:.45, metalness:.6}),
    steel: colorMat(0xc9ced4,{roughness:.3, metalness:.85}),
    yellow: colorMat(0xffc531,{roughness:.45, metalness:.2}), blue: colorMat(0x2f7fd8,{roughness:.45, metalness:.2}), red: colorMat(0xe2483a,{roughness:.5}),
    green: colorMat(0x35b26a,{roughness:.5}), orange: colorMat(0xff8a2a,{roughness:.5}), white: colorMat(0xf4f2ec,{roughness:.55}),
    rubR: colorMat(0xb8564a,{roughness:.95, polygonOffset:true, polygonOffsetFactor:-3}), rubB: colorMat(0x3f78b8,{roughness:.95, polygonOffset:true, polygonOffsetFactor:-4}),
    rubG: colorMat(0x4f9a5c,{roughness:.95, polygonOffset:true, polygonOffsetFactor:-3}), rubY: colorMat(0xe8b23a,{roughness:.95, polygonOffset:true, polygonOffsetFactor:-4}),
    wood: MAT.wood, deck: MAT.deck, dark: MAT.dark, stone: MAT.stone, lamp: MAT.lamp,
    lilyG: colorMat(0x3f8a3a,{roughness:.6}), lilyG2: colorMat(0x5aa246,{roughness:.6}), lotus: colorMat(0xff9fc4,{roughness:.6}), lotusW: colorMat(0xfff4f0,{roughness:.6}),
  };

  /* ============================== 1. HÌNH HỌC HỒ + LỐI DẠO ============================== */
  const C0={x:199, z:52.2}, LA=9.0, LB=4.7, BX=199, BW=2.0;
  const wob=t=>1+.025*Math.sin(3*t+.5)+.015*Math.sin(5*t+1.7);
  const base=t=>{ const w=wob(t); return [C0.x+LA*Math.cos(t)*w, C0.z+LB*Math.sin(t)*w]; };
  const nrm=t=>{ const a=base(t-1e-3), b=base(t+1e-3), tx=b[0]-a[0], tz=b[1]-a[1], l=Math.hypot(tx,tz)||1; return [tz/l, -tx/l]; };   // pháp tuyến hướng ra ngoài
  const off=(t,d)=>{ const p=base(t), n=nrm(t); return [p[0]+n[0]*d, p[1]+n[1]*d]; };
  const poly=(d,N=160)=>{ const a=[]; for(let i=0;i<N;i++) a.push(off(i/N*TAU,d)); return a; };
  const inPoly=(x,z,pts)=>{ let c=false; for(let i=0,j=pts.length-1;i<pts.length;j=i++){ const [xi,zi]=pts[i], [xj,zj]=pts[j]; if(((zi>z)!==(zj>z)) && (x<(xj-xi)*(z-zi)/(zj-zi)+xi)) c=!c; } return c; };
  const zAtX=(d,x,north)=>{ const pts=poly(d,720); for(let i=0;i<pts.length;i++){ const a=pts[i], b=pts[(i+1)%pts.length]; if((a[0]-x)*(b[0]-x)<=0 && a[0]!==b[0]){ const z=a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]); if(north ? z<C0.z : z>C0.z) return z; } } return C0.z; };
  const RIM=.55, PATH=2.35;
  const PL=poly(0), PRIM=poly(RIM), POUT=poly(PATH), PPAD=poly(PATH+.25);
  function lane(d,N=240){ const pts=poly(d,N), L=[0]; for(let i=1;i<=N;i++){ const a=pts[i-1], b=pts[i%N]; L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1])); }
    return {pts, L, N, len:L[N], d,
      at(s){ s=((s%this.len)+this.len)%this.len; let lo=0, hi=N; while(hi-lo>1){ const m=(lo+hi)>>1; if(L[m]<=s) lo=m; else hi=m; } const a=pts[lo], b=pts[(lo+1)%N], k=(s-L[lo])/((L[lo+1]-L[lo])||1);
        return [a[0]+(b[0]-a[0])*k, a[1]+(b[1]-a[1])*k, Math.atan2(b[0]-a[0], b[1]-a[1])]; },
      near(x,z){ let bi=0, bd=1e9; for(let i=0;i<N;i++){ const q=(pts[i][0]-x)**2+(pts[i][1]-z)**2; if(q<bd){ bd=q; bi=i; } } return bi; },
      walk(i0,i1){ const o=[]; let f=(i1-i0+N)%N, b=(i0-i1+N)%N; if(f<=b){ for(let k=1;k<=f;k++) o.push(pts[(i0+k)%N].slice()); } else { for(let k=1;k<=b;k++) o.push(pts[(i0-k+N)%N].slice()); } return o; } }; }
  const JOG=lane(1.05), MID=lane(1.45), OUTL=lane(1.95);

  /* ---------- sổ chỗ (tự kiểm tra chồng lấn khi đặt đồ) ---------- */
  const FP=[], KEEP=[];
  function hit(x,z,r){ for(const f of FP){ if(Math.hypot(x-f.x,z-f.z)<f.r+r) return f.tag; } for(const k of KEEP){ if(x>k.x0-r && x<k.x1+r && z>k.z0-r && z<k.z1+r) return k.tag; } if(inPoly(x,z,PPAD) && r>0) return 'lối dạo/hồ'; return null; }
  function reserve(x,z,r,tag,check=true){ const h=check?hit(x,z,r):null; if(h) out.conflicts.push(`${tag} (${x.toFixed(1)},${z.toFixed(1)}) chạm ${h}`); FP.push({x,z,r,tag}); return !h; }
  const keep=(x0,z0,x1,z1,tag)=>KEEP.push({x0,z0,x1,z1,tag});

  /* ============================== 2. MẶT ĐẤT: CỎ, LỐI ĐI, SÂN ============================== */
  const PK={x0:184.9, x1:213.1, z0:42.9, z1:62.4};          // trong lô (chừa dải vỉa hè 1,6 m ở 3 phía cho người đi bộ)
  const SE={x0:204.4, x1:212.6, z0:59.8, z1:66.4};          // góc giải khát (lấn sang đất trống phía Bắc Phường Khởi Nghiệp)
  KG.add(flat(rect(PK.x0,PK.z0,PK.x1,PK.z1)), M.lawn, OX,.036,OZ);
  KG.add(flat(POUT,[PRIM]), M.pave, OX,.05,OZ);                                             // lối dạo vòng hồ
  const plazaN=rect(193.0,PK.z0,205.0,45.6), gateW=rect(PK.x0,51.0,188.4,53.4), gateE=rect(209.6,51.0,PK.x1,53.4);
  const seA=off(dg(42),1.3), seB=[207.4,60.6], seN=[seB[0]-seA[0], seB[1]-seA[1]], seL=Math.hypot(...seN), seR=[-seN[1]/seL*1.15, seN[0]/seL*1.15];
  const sePath=[[seA[0]+seR[0],seA[1]+seR[1]],[seB[0]+seR[0],seB[1]+seR[1]],[seB[0]-seR[0],seB[1]-seR[1]],[seA[0]-seR[0],seA[1]-seR[1]]];
  for(const p of [plazaN, gateW, gateE, sePath, rect(SE.x0,SE.z0,SE.x1,SE.z1), circ(199,61.1,1.9,32), rect(184.9,58.4,191.4,62.4)]) KG.add(flat(p), M.pave, OX,.052,OZ);
  // sân chơi (thảm cao su đỏ + vòng xanh) · sân thể dục (xanh lá + vạch vàng)
  const PG={x0:184.9, x1:192.5, z0:42.9, z1:46.3}, GY={x0:205.6, x1:213.1, z0:42.9, z1:46.3};
  KG.add(flat(rect(PG.x0,PG.z0,PG.x1,PG.z1)), M.rubR, OX,.056,OZ); KG.add(flat(circ(187.2,44.6,1.2)), M.rubB, OX,.058,OZ); KG.add(flat(circ(191.2,45.4,.7)), M.rubY, OX,.058,OZ);
  KG.add(flat(rect(GY.x0,GY.z0,GY.x1,GY.z1)), M.rubG, OX,.056,OZ); for(let x=GY.x0+.4;x<GY.x1;x+=1.8) KG.add(flat(rect(x,GY.z1-.35,x+1.0,GY.z1-.2)), M.rubY, OX,.058,OZ);
  for(const k of [[196.2,PK.z0,201.8,45.6,'lối cổng Bắc'],[PK.x0,51.0,188.4,53.4,'lối cổng Tây'],[209.6,51.0,PK.x1,53.4,'lối cổng Đông']]) keep(...k);
  // vạch trắng lát viền lối dạo (đá trắng mảnh)
  { const a=poly(PATH,120); for(let i=0;i<a.length;i++){ const p=a[i], q=a[(i+1)%a.length], L=Math.hypot(q[0]-p[0],q[1]-p[1]); KG.add(B(L+.02,.05,.12), M.stoneW, (p[0]+q[0])/2,.06,(p[1]+q[1])/2, Math.atan2(q[0]-p[0],q[1]-p[1])+Math.PI/2); } }

  /* ============================== 3. HỒ: BỜ KÈ, NƯỚC, ĐẢO, HOA SÚNG ============================== */
  KG.add(flat(poly(.08)), M.bed, OX,.044,OZ);
  KO.add(slab(PRIM,[poly(-.06)],.22), M.granite, OX,.03,OZ);                                 // bờ kè đá granite cao 25 cm
  for(let i=0;i<34;i++){ const t=i/34*TAU+rng()*.1; if(Math.abs(Math.cos(t))<.18) continue;     // đá cảnh dọc bờ (trừ 2 đầu cầu)
    const [x,z]=off(t,-.05-rng()*.25), s=.22+rng()*.3; KO.add(new THREE.DodecahedronGeometry(s,0), M.rock, x,.16+s*.25,z, rng()*6, rng(), rng(), 1.3,.6+rng()*.3,1); }
  // mặt nước: phản chiếu bầu trời (env map) + gợn sóng (normal map trôi chậm), trong suốt nhẹ để thấy cá koi
  const wN=W.TX.waterN.clone(); wN.wrapS=wN.wrapT=THREE.RepeatWrapping; wN.repeat.set(.22,.22); wN.needsUpdate=true;
  const waterMat=new THREE.MeshStandardMaterial({color:0x2b6f74, roughness:.06, metalness:.15, normalMap:wN, normalScale:new THREE.Vector2(.35,.35), transparent:true, opacity:.84, envMapIntensity:1.35});
  waterMat.userData.noMerge=true;
  const water=new THREE.Mesh(flat(poly(.02)), waterMat); water.position.set(OX,.15,OZ); water.receiveShadow=true; water.castShadow=false; water.renderOrder=1; water.userData.dynamic=true; scene.add(water);
  // đảo nhỏ: gò cỏ + đá + cây liễu + nhà vịt + đèn đá
  const ISL={x:204.7, z:52.5, r:1.45};
  KO.add(new THREE.SphereGeometry(1,20,10,0,TAU,0,Math.PI/2), M.lilyG2, ISL.x,.1,ISL.z, 0,0,0, ISL.r,.38,ISL.r*.85);
  for(let i=0;i<9;i++){ const t=i/9*TAU, s=.22+rng()*.18; KO.add(new THREE.DodecahedronGeometry(s,0), M.rock, ISL.x+Math.cos(t)*ISL.r*.98, .17, ISL.z+Math.sin(t)*ISL.r*.84, rng()*6, rng(), 0, 1.2,.7,1); }
  { const hx=ISL.x+.55, hz=ISL.z+.35; KO.add(CY(.05,.05,.55,6), M.dark, hx,.6,hz); KO.add(B(.5,.34,.4), M.wood, hx,.98,hz, .4); KO.add(new THREE.ConeGeometry(.42,.28,4), M.red, hx,1.29,hz, .4+Math.PI/4); KO.add(new THREE.CircleGeometry(.08,10), M.ironB, hx+Math.sin(.4)*.205,.97,hz+Math.cos(.4)*.205, .4);
    const lx=ISL.x-.6, lz=ISL.z-.4; KO.add(CY(.18,.22,.2,8), M.stoneG, lx,.45,lz); KO.add(CY(.07,.09,.4,8), M.stoneG, lx,.75,lz); KO.add(B(.3,.24,.3), M.stoneG, lx,1.07,lz); KO.add(new THREE.ConeGeometry(.3,.22,4), M.stoneG, lx,1.3,lz, Math.PI/4); }
  // hoa súng + sen (nửa hồ phía Tây) · cỏ lau ven bờ
  for(let i=0;i<22;i++){ let x,z,k=0; do{ x=C0.x-LA*.85+rng()*LA*.65; z=C0.z+(rng()-.5)*LB*1.5; k++; } while(k<20 && (!inPoly(x,z,poly(-.5)) || Math.abs(x-BX)<1.8));
    const r=.22+rng()*.2; KO.add(new THREE.CircleGeometry(r,12,.3,TAU-.6), rng()<.5?M.lilyG:M.lilyG2, x,.162,z, rng()*6, -Math.PI/2);
    if(rng()<.3){ const f=rng()<.6?M.lotus:M.lotusW; KO.add(new THREE.ConeGeometry(.07,.1,6,1,true), f, x+.05,.21,z, 0, Math.PI); KO.add(new THREE.SphereGeometry(.035,6,4), M.yellow, x+.05,.2,z); } }
  const REEDS=[]; for(const t of [dg(160),dg(200),dg(20),dg(-25),dg(120),dg(60)]) for(let i=0;i<10;i++){ const [x,z]=off(t+(rng()-.5)*.18,-.2-rng()*.35); REEDS.push([x,z,.6+rng()*.6]); }
  // lan can thấp quanh hồ: không cần – bờ kè + vòng chặn va chạm (bên dưới)

  /* ---------- va chạm mép hồ: vòng đoạn thẳng có lời nhắn + 2 lan can cầu (khe cầu ở giữa) ---------- */
  const LAKE_MSG='🌊 Mép hồ – không lội xuống nước được nhé! Qua hồ bằng cầu gỗ vòm ở giữa.';
  const ringC=poly(.3,200), gx0=BX-BW/2, gx1=BX+BW/2, cross=[];
  for(let i=0;i<ringC.length;i++){ const a=ringC[i], b=ringC[(i+1)%ringC.length], ia=a[0]>gx0&&a[0]<gx1, ib=b[0]>gx0&&b[0]<gx1;
    if(ia&&ib) continue;
    if(!ia&&!ib){ addSeg(a[0],a[1],b[0],b[1],.06,undefined,undefined,LAKE_MSG); continue; }
    const o=ia?b:a, n=ia?a:b, bx=o[0]<=gx0?gx0:gx1, k=(bx-o[0])/(n[0]-o[0]), c=[bx, o[1]+(n[1]-o[1])*k]; addSeg(o[0],o[1],c[0],c[1],.06,undefined,undefined,LAKE_MSG); cross.push(c); }
  const zN=Math.max(...cross.filter(c=>c[1]<C0.z).map(c=>c[1])), zS=Math.min(...cross.filter(c=>c[1]>C0.z).map(c=>c[1]));
  const zNo=Math.min(...cross.filter(c=>c[1]<C0.z).map(c=>c[1])), zSo=Math.max(...cross.filter(c=>c[1]>C0.z).map(c=>c[1]));
  for(const x of [gx0,gx1]) addSeg(x,zNo,x,zSo,.06,undefined,undefined,'🌉 Lan can cầu gỗ');

  /* ============================== 4. CẦU GỖ VÒM ============================== */
  const bz0=zAtX(RIM+.05,BX,true), bz1=zAtX(RIM+.05,BX,false), BL=bz1-bz0, arch=t=>.31+.52*Math.sin(Math.PI*clamp(t,0,1));
  { const dk=new THREE.BoxGeometry(BW,.12,BL,1,1,22); dk.translate(0,-.06,0); const q=dk.attributes.position; for(let i=0;i<q.count;i++){ const t=(q.getZ(i)+BL/2)/BL; q.setY(i, q.getY(i)+arch(t)); } dk.computeVertexNormals();
    KO.add(dk, M.deck, BX,0,(bz0+bz1)/2);
    // dầm cong 2 bên + lan can (trụ + tay vịn cong) + 2 trụ đá dưới nước
    for(const sx of [-1,1]){ const pts=[], top=[], mid=[]; for(let i=0;i<=24;i++){ const t=i/24, z=bz0+t*BL, y=arch(t); pts.push(new THREE.Vector3(BX+sx*(BW/2+.02), y-.1, z)); top.push(new THREE.Vector3(BX+sx*(BW/2-.06), y+.9, z)); mid.push(new THREE.Vector3(BX+sx*(BW/2-.06), y+.48, z)); }
      KO.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.09,6,false), M.dark, 0,0,0);   // điểm đã ở toạ độ thế giới
      KO.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(top),40,.045,6,false), M.dark, 0,0,0);
      KO.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(mid),40,.025,5,false), M.dark, 0,0,0);
      for(let i=0;i<=10;i++){ const t=i/10, z=bz0+t*BL, y=arch(t); KO.add(B(.08,.92,.08), M.dark, BX+sx*(BW/2-.06), y+.44, z); } }
    for(const t of [.3,.7]){ const z=bz0+t*BL; KO.add(B(BW*.8,arch(t)-.1,.5), M.stone, BX,(arch(t)-.1)/2+.05,z); }
    // bậc lên cầu: sàn đứng được theo từng đoạn (độ cao theo vòm)
    const NS=16; for(let i=0;i<NS;i++){ const t=(i+.5)/NS; plats.push({t:'r', x:BX, z:bz0+t*BL, c:1, s:0, hw:BW/2, hd:BL/NS/2+.02, h:arch(t)}); }
    // 4 đèn lồng đá ở 2 đầu cầu
    for(const [z,sz] of [[zNo-.05,-1],[zSo+.05,1]]) for(const sx of [-1,1]){ const x=BX+sx*(BW/2+.25); KO.add(B(.3,.9,.3), M.stoneG, x,.48,z); KO.add(B(.36,.32,.36), M.lamp, x,1.08,z); KO.add(new THREE.ConeGeometry(.32,.2,4), M.ironB, x,1.34,z, Math.PI/4); GLOW.add(x,1.08,z,1.6,0xffcf8a,.8); circles.push({x,z,r:.24}); reserve(x,z,.25,'đèn đầu cầu',false); } }
  makeLabel('🌉 Cầu Vòm Hồ Ngọc', 'Đứng giữa cầu bấm E để cho cá ăn', {h:.42, x:BX, y:2.6, z:C0.z, fade:34});

  /* ============================== 5. CÂY XANH (InstancedMesh dùng chung cho công viên + phố) ============================== */
  const TREES={shade:[], flame:[], purple:[], willow:[], cone:[]};
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
    shade: vcGeo([{g:CY(.15,.26,3.4,7), c:0x5b4636, y:1.7}, {g:CY(.06,.1,1.6,5), c:0x5b4636, x:.45, y:3.0, rz:-.7}, {g:CY(.06,.1,1.5,5), c:0x5b4636, x:-.4, y:3.1, z:.2, rz:.75},
      ...blobs([[0,4.5,0,2.0],[1.3,4.1,.5,1.45,0x4b8a3c],[-1.2,4.2,-.6,1.5,0x376f30],[.3,5.4,-.3,1.35,0x5a9a42],[-.5,4.8,1.1,1.25,0x447f37],[.9,4.9,-1.1,1.25,0x3d7533]],0x3f7a35)]),
    flame: vcGeo([{g:CY(.14,.24,3.0,7), c:0x5e4a3a, y:1.5}, {g:CY(.05,.09,1.7,5), c:0x5e4a3a, x:.6, y:2.9, rz:-.95}, {g:CY(.05,.09,1.7,5), c:0x5e4a3a, x:-.6, y:2.9, rz:.95},
      ...blobs([[0,3.9,0,2.3,0,.42],[1.6,3.7,.4,1.4,0x58923d,.5],[-1.6,3.75,-.3,1.45,0x4c8636,.5],[.2,3.8,1.5,1.3,0,.5],[-.2,3.8,-1.5,1.3,0,.5]],0x4f8a37),
      ...blobs([[.6,4.45,.3,.62,0xe2462c],[-.9,4.35,.6,.55,0xf0602a],[1.4,4.15,-.6,.5,0xe2462c],[-1.5,4.15,-.8,.52,0xd8402a],[.1,4.5,-1.0,.5,0xf26b2e],[-.3,4.3,1.4,.48,0xe2462c],[1.0,4.2,1.2,.45,0xf0602a]],0xe2462c)]),
    purple: vcGeo([{g:CY(.12,.2,2.8,7), c:0x6e5a4a, y:1.4},
      ...blobs([[0,3.7,0,1.6],[.9,3.4,.4,1.1,0x58964a],[-.9,3.5,-.3,1.15,0x447f3c],[.1,4.4,.1,1.05,0x5d9c4c]],0x4c8a3f),
      ...blobs([[.5,4.4,.6,.48,0xa66fd6],[-.7,4.2,.5,.45,0x9257c4],[.8,3.9,-.7,.44,0xb683e0],[-.4,4.6,-.5,.42,0xa66fd6],[1.2,3.6,.3,.38,0x9257c4],[-1.2,3.7,-.4,.4,0xb683e0]],0xa66fd6)]),
    willow: vcGeo([{g:CY(.17,.3,3.4,7), c:0x5a4a39, y:1.7, rz:.06}, ...blobs([[0,3.9,0,1.55,0,.5],[.7,4.1,.3,1.0,0x6f9d44],[-.6,4.05,-.4,1.05,0x5f8f3a],[0,4.5,0,.9,0x78a84a]],0x5f8f3a)]),
    cone: vcGeo([{g:CY(.08,.12,1.0,6), c:0x5a4636, y:.5}, {g:new THREE.ConeGeometry(1.0,1.8,9), c:0x2f5e34, y:1.6}, {g:new THREE.ConeGeometry(.78,1.5,9), c:0x386b3a, y:2.4}, {g:new THREE.ConeGeometry(.52,1.2,9), c:0x427a41, y:3.1}]),
  };
  const swayU={value:0};
  function swayMat(m, k, key, hang){ m.onBeforeCompile=sh=>{ sh.uniforms.uT=swayU; sh.vertexShader=sh.vertexShader.replace('#include <common>', `#include <common>
uniform float uT;`).replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef USE_INSTANCING
{ float ph=instanceMatrix[3].x*.37+instanceMatrix[3].z*.23; float hk=${hang?'max(0.,4.1-position.y)':'max(0.,position.y-2.)'}*${k};
  transformed.x+=sin(uT*1.3+ph)*hk; transformed.z+=cos(uT*1.05+ph*1.7)*hk*.8; }
#endif`); }; m.customProgramCacheKey=()=>key; return m; }
  const dynMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.5, metalness:.2});   // bộ phận chuyển động (xích đu, thú nhún, máy tập): mỗi cụm 1 lượt vẽ
  // rèm lá liễu rủ: nhiều dải lá treo quanh tán (texture sợi lá có lỗ hở, alphaTest), phần thấp lay mạnh hơn
  const willowT=ctex(128,256,(g,w,h)=>{ g.clearRect(0,0,w,h); const cols=['#3f6b28','#4f7f2f','#5f8f3a','#6f9d44','#7fae4f'];
    for(let i=0;i<16;i++){ let x=4+rng()*(w-8); const len=h*(.5+rng()*.5); for(let y=0;y<len;y+=5){ x+=(rng()-.5)*1.4; g.fillStyle=cols[Math.floor(rng()*cols.length)]; g.save(); g.translate(x,y); g.rotate((rng()-.5)*.9); g.fillRect(-1.6,-3.2,3.2,6.4); g.restore(); } } }, true);
  const willowMat=swayMat(new THREE.MeshStandardMaterial({map:willowT, alphaTest:.5, side:THREE.DoubleSide, roughness:.85}), '.035', 'qcWillowSway', true);
  const willowCurtain=(()=>{ const parts=[]; for(const [r,n,h0] of [[1.5,26,2.5],[1.0,14,2.2]]) for(let i=0;i<n;i++){ const a=i/n*TAU+hash(r,i,1)*.2, h=h0*(.75+hash(r,i,2)*.45), p=new THREE.PlaneGeometry(.75,h);
      p.translate(0,-h/2,0); p.rotateX(.08); p.rotateY(-a+Math.PI/2); p.translate(Math.cos(a)*r, 4.0, Math.sin(a)*r); parts.push(p.toNonIndexed()); } return mergeGeometries(parts,false); })();
  function addTree(kind, x, z, s=1, tag='cây', check=true){ const r=(kind==='cone'?.22:kind==='purple'?.26:.32)*s; reserve(x,z,r+.15,tag,check); TREES[kind].push({x,z,s,r:rng()*TAU}); circles.push({x,z,r:r}); out.trees++; }

  /* ============================== 6. ĐỒ NỘI THẤT CÔNG VIÊN ============================== */
  const SEATLIST=[];
  // ghế đá granite (không tựa) · rot = hướng mặt người ngồi
  function stoneBench(x,z,rot,tag='ghế đá'){ const f=[Math.sin(rot),Math.cos(rot)], r=[Math.cos(rot),-Math.sin(rot)];
    for(const s of [-1,1]) KO.add(B(.26,.4,.42), M.stoneG, x+r[0]*s*.66,.2,z+r[1]*s*.66, rot);
    KO.add(B(1.8,.09,.48), M.stoneG, x,.445,z, rot);
    addSeg(x-r[0]*.88,z-r[1]*.88,x+r[0]*.88,z+r[1]*.88,.25); reserve(x,z,.95,tag);
    const seats=[-1,1].map(s=>W.addSeat({x:x+r[0]*s*.45+f[0]*.02, z:z+r[1]*s*.45+f[1]*.02, rot, y:.49, floor:.02, label:'🪑 Ngồi ghế đá ven hồ (E · C)'}));
    SEATLIST.push(...seats); return {x,z,rot,f,r,seats}; }
  // băng ghế gỗ có tựa, chân gang
  function woodBench(x,z,rot,tag='ghế gỗ', label='🪑 Ngồi băng ghế (E · C)', chk=true){ const f=[Math.sin(rot),Math.cos(rot)], r=[Math.cos(rot),-Math.sin(rot)];
    for(const s of [-1,1]){ const lx=x+r[0]*s*.8, lz=z+r[1]*s*.8; KO.add(B(.06,.44,.5), M.iron, lx,.22,lz, rot); KO.add(B(.06,.5,.06), M.iron, lx-f[0]*.24,.68,lz-f[1]*.24, rot, -.18); KO.add(B(.06,.05,.56), M.iron, lx,.62,lz, rot); }
    for(let i=0;i<4;i++){ const k=-.18+i*.12; KO.add(B(1.82,.04,.09), M.wood, x+f[0]*k,.46,z+f[1]*k, rot); }
    for(let i=0;i<3;i++){ const k=.6+i*.13; KO.add(B(1.82,.08,.035), M.wood, x-f[0]*(.25+(k-.6)*.18),k,z-f[1]*(.25+(k-.6)*.18), rot, -.18); }
    addSeg(x-r[0]*.9,z-r[1]*.9,x+r[0]*.9,z+r[1]*.9,.28); reserve(x,z,1.0,tag,chk);
    const seats=[-1,1].map(s=>W.addSeat({x:x+r[0]*s*.45, z:z+r[1]*s*.45, rot, y:.48, floor:.02, label}));
    SEATLIST.push(...seats); return {x,z,rot,f,r,seats}; }
  // đèn lồng công viên (cột gang + lồng kính phát sáng ban đêm)
  function lantern(x,z,tag='đèn'){ KO.add(CY(.16,.2,.25,8), M.iron, x,.13,z); KO.add(CY(.05,.07,2.7,8), M.iron, x,1.5,z); KO.add(CY(.13,.09,.12,8), M.iron, x,2.86,z);
    KO.add(CY(.15,.11,.36,6), M.lamp, x,3.1,z); KO.add(new THREE.ConeGeometry(.22,.22,6), M.iron, x,3.38,z); KO.add(new THREE.SphereGeometry(.04,6,4), M.iron, x,3.52,z);
    circles.push({x,z,r:.14}); reserve(x,z,.3,tag); GLOW.add(x,3.1,z,2.8,0xffc477,.95); LANT.push([x,z]); }
  const LANT=[];
  function bin(x,z){ KO.add(CY(.22,.2,.7,10), M.iron, x,.35,z); KO.add(CY(.24,.24,.06,10), M.steel, x,.72,z); circles.push({x,z,r:.24}); reserve(x,z,.3,'thùng rác'); }

  /* ---------- 6a. Ghế quanh hồ (ghế đá dùng cho khách bot; ghế gỗ cho bạn) ---------- */
  const benchAt=(deg, d=PATH+.42)=>{ const t=dg(deg), [x,z]=off(t,d), n=nrm(t); return [x,z,Math.atan2(-n[0],-n[1])]; };   // quay mặt vào hồ
  const cafeBenches=[25,68,112,152,208,325].map(d=>{ const [x,z,rot]=benchAt(d); return stoneBench(x,z,rot,`ghế đá ${d}°`); });
  const woodB=[[132],[232],[300],[341]].map(([d,dd])=>{ const [x,z,rot]=benchAt(d,dd); return woodBench(x,z,rot,`ghế gỗ ${d}°`); });
  // đèn lồng quanh hồ + thùng rác
  for(const d of [12,100,141,196,221,311]){ const [x,z]=off(dg(d),PATH+.32); lantern(x,z,`đèn ${d}°`); }
  for(const d of [123,165]){ const [x,z]=off(dg(d),PATH+.35); bin(x,z); }

  /* ---------- 6b. Cổng vòm Bắc + bảng sơ đồ + biển chỉ dẫn ---------- */
  { const gx=[196.5,201.5], gz=43.15;
    for(const x of gx){ KO.add(B(.55,3.5,.55), M.stoneG, x,1.75,gz); KO.add(B(.7,.2,.7), M.stoneG, x,3.55,gz); KO.add(B(.7,.3,.7), M.stoneG, x,.15,gz); circles.push({x,z:gz,r:.4}); reserve(x,gz,.4,'trụ cổng',false);
      KO.add(B(.3,.36,.3), M.lamp, x,3.85,gz); KO.add(new THREE.ConeGeometry(.3,.22,4), M.ironB, x,4.14,gz, Math.PI/4); GLOW.add(x,3.85,gz,2.4,0xffc477,.9); }
    const signT=ctex(1024,192,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#1f5a3a'); gr.addColorStop(1,'#123d27'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.strokeStyle='#e9d48a'; g.lineWidth=8; g.strokeRect(10,10,w-20,h-20);
      g.fillStyle='#fff6d8'; g.textAlign='center'; g.textBaseline='middle'; g.font='800 78px "Segoe UI",sans-serif'; g.fillText('CÔNG VIÊN TRUNG TÂM',w/2,h/2-18); g.font='600 34px "Segoe UI",sans-serif'; g.fillStyle='#e9d48a'; g.fillText('QC CITY · CENTRAL PARK · HỒ NGỌC',w/2,h/2+46); });
    const sm=new THREE.MeshStandardMaterial({map:signT, roughness:.6});
    KO.add(B(4.42,.82,.16), sm, 199,3.3,gz); KO.add(B(5.9,.14,.3), M.dark, 199,3.78,gz); KO.add(B(5.9,.1,.3), M.dark, 199,2.84,gz);
    // bảng sơ đồ công viên (phía Tây cổng)
    const mapT=ctex(512,384,(g,w,h)=>{ g.fillStyle='#f3efe2'; g.fillRect(0,0,w,h); g.fillStyle='#1f5a3a'; g.fillRect(0,0,w,46); g.fillStyle='#fff'; g.font='700 26px "Segoe UI",sans-serif'; g.textAlign='center'; g.fillText('SƠ ĐỒ CÔNG VIÊN',w/2,32);
      const X=x=>(x-182)/34*w, Y=z=>46+(z-40)/28*(h-56); g.fillStyle='#bfe0a0'; g.fillRect(X(184.9),Y(42.9),X(213.1)-X(184.9),Y(62.4)-Y(42.9)); g.fillRect(X(204.4),Y(59.8),X(212.6)-X(204.4),Y(66.4)-Y(59.8));
      g.fillStyle='#d9cdb4'; g.beginPath(); POUT.forEach(([x,z],i)=>i?g.lineTo(X(x),Y(z)):g.moveTo(X(x),Y(z))); g.fill(); g.fillStyle='#4f9fc0'; g.beginPath(); PL.forEach(([x,z],i)=>i?g.lineTo(X(x),Y(z)):g.moveTo(X(x),Y(z))); g.fill();
      g.fillStyle='#8a6440'; g.fillRect(X(198),Y(bz0),X(200)-X(198),Y(bz1)-Y(bz0)); g.fillStyle='#5aa246'; g.beginPath(); g.arc(X(ISL.x),Y(ISL.z),9,0,7); g.fill();
      g.font='22px "Segoe UI Emoji","Segoe UI",sans-serif'; g.textAlign='center'; for(const [t,x,z] of [['🛝',188.7,44.6],['💪',209.3,44.6],['🌸',188,60.4],['🥤',208.5,64],['♟️',206.3,62.2],['🍦',186.6,49.2],['🐟',199,52.2],['📍',191.3,42.6]]) g.fillText(t,X(x),Y(z)+8);
      g.fillStyle='#c0392b'; g.font='600 15px "Segoe UI",sans-serif'; g.fillText('Bạn đang ở đây',X(191.3),Y(41.4)); });
    const bx=191.3, bz=43.3; KO.add(B(.08,1.6,.08), M.iron, bx-.62,.8,bz); KO.add(B(.08,1.6,.08), M.iron, bx+.62,.8,bz); KO.add(B(1.36,1.0,.06), M.iron, bx,1.42,bz);
    const mp=new THREE.Mesh(new THREE.PlaneGeometry(1.26,.92), new THREE.MeshStandardMaterial({map:mapT, roughness:.6})); mp.position.set(bx,1.42,bz-.035); mp.rotation.y=Math.PI; scene.add(mp);
    boxes.push({x0:bx-.72, x1:bx+.72, z0:bz-.1, z1:bz+.1}); reserve(bx,bz,.75,'bảng sơ đồ',false);
    INTER.push({x:bx, z:bz-.9, r:1.3, prio:.4, label:'🗺️ Xem sơ đồ công viên (E)', action:openMapInfo});
    // biển chỉ dẫn nhiều hướng (phía Đông cổng)
    const arrowT=ctex(256,256,(g,w,h)=>{ g.fillStyle='#fff'; g.fillRect(0,0,w,h); const rows=[['#2f7fd8','🛝 Sân chơi ◀'],['#35b26a','▶ Thể dục 💪'],['#ff8a2a','▼ Giải khát 🥤'],['#8a6440','▼ Cầu Vòm 🌉']];
      rows.forEach(([c,t],i)=>{ g.fillStyle=c; g.fillRect(4,4+i*63,w-8,58); g.fillStyle='#fff'; g.font='700 26px "Segoe UI Emoji","Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(t,w/2,33+i*63); }); });
    const sx=205.2, sz=42.95; KO.add(CY(.05,.05,2.6,8), M.iron, sx,1.3,sz); const am=new THREE.MeshStandardMaterial({map:arrowT, roughness:.6});
    KO.add(B(.9,.9,.04), am, sx,1.95,sz, Math.PI); circles.push({x:sx,z:sz,r:.12}); reserve(sx,sz,.3,'biển chỉ dẫn',false);
    // bồn hoa 2 bên lối cổng
    for(const [x0,x1] of [[193.6,196.0],[202.0,204.6]]) flowerBed(rect(x0,44.2,x1,45.2), 'bồn hoa cổng', [0xff4f6d,0xffd23f,0xffffff,0xff9fc4]);
  }
  function openMapInfo(){ const m=ui.modal('🌳 Công viên Trung tâm · Hồ Ngọc');
    m.body.innerHTML=`<p class="muted">Lá phổi xanh giữa Downtown – ngồi chill, trò chuyện, ngắm hồ.</p><div class="grid">${[
      ['🌊','Hồ Ngọc','Cá koi, vịt, hoa súng, đảo liễu. Đứng giữa Cầu Vòm bấm E để cho cá ăn (2 💰).'],
      ['🪑','Ghế đá ven hồ','Ngồi cạnh người đi 1 mình → họ sẽ bắt chuyện hỏi thăm bạn.'],
      ['🥤','Góc giải khát','3 máy bán nước tự động + Quầy nước Bên Hồ (Đông Nam). Nước tăng lực/cà phê có hiệu ứng.'],
      ['🍦','Xe kem','Gần cổng Tây – kem ốc quế, kem que, kem dừa.'],
      ['🛝','Sân chơi','Xích đu (ngồi được), cầu trượt, thú nhún (Tây Bắc).'],
      ['💪','Thể dục','Máy đi bộ trên không, xoay eo, đạp xe, vòng tay – bấm E để tập (Đông Bắc).'],
      ['🌸','Giàn hoa giấy','Băng ghế dưới giàn hoa (Tây Nam) · ♟️ bàn cờ đá cạnh góc giải khát.'],
    ].map(([i,n,d])=>`<div class="card"><div class="ic">${i}</div><b>${n}</b><small>${d}</small></div>`).join('')}</div>`; }

  /* ---------- 6c. Bồn hoa · bụi cây (InstancedMesh) ---------- */
  function flowerBed(pts, tag, cols, h=.32){ KO.add(slab(pts,[],h), M.stoneW, OX,.02,OZ); KG.add(flat(pts), M.soil, OX,h+.025,OZ);
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(const [x,z] of pts){ x0=Math.min(x0,x); x1=Math.max(x1,x); z0=Math.min(z0,z); z1=Math.max(z1,z); }
    const inner=pts; for(let z=z0+.14;z<z1-.08;z+=.17) for(let x=x0+.14;x<x1-.08;x+=.17){ const jx=x+(rng()-.5)*.08, jz=z+(rng()-.5)*.08; if(!inPoly(jx,jz,inner)) continue; FLW.push({x:jx, y:h+.1+rng()*.06, z:jz, s:.8+rng()*.5, c:pick2(cols)}); if(rng()<.35) BUSH.push({x:jx,y:h+.03,z:jz,s:.16+rng()*.06,c:0x3f7f37}); }
    if(pts.length===4 && Math.abs(pts[0][1]-pts[1][1])<1e-6){ boxes.push({x0, x1, z0, z1}); } else circles.push({x:(x0+x1)/2, z:(z0+z1)/2, r:Math.max(x1-x0,z1-z0)/2});
    reserve((x0+x1)/2,(z0+z1)/2,Math.min(x1-x0,z1-z0)/2,tag); }
  function pick2(a){ return a[Math.floor(rng()*a.length)]; }
  function hedge(x0,z0,x1,z1,tag){ const L=Math.hypot(x1-x0,z1-z0), n=Math.max(2,Math.round(L/.55)); for(let i=0;i<=n;i++){ const k=i/n; BUSH.push({x:x0+(x1-x0)*k+(rng()-.5)*.08, y:.25, z:z0+(z1-z0)*k+(rng()-.5)*.08, s:.38+rng()*.1, c:rng()<.5?0x3a7a34:0x467f3a}); if(rng()<.25) FLW.push({x:x0+(x1-x0)*k, y:.62, z:z0+(z1-z0)*k, s:1.2, c:pick2([0xff4fa0,0xff6b8a,0xffffff])}); }
    const w=.38; boxes.push({x0:Math.min(x0,x1)-w, x1:Math.max(x0,x1)+w, z0:Math.min(z0,z1)-w, z1:Math.max(z0,z1)+w}); keep(Math.min(x0,x1)-w,Math.min(z0,z1)-w,Math.max(x0,x1)+w,Math.max(z0,z1)+w,tag); }
  // hàng rào cây bụi viền lô (chừa các cổng)
  hedge(185.35,47.2,185.35,50.6,'giậu Tây'); hedge(185.35,53.9,185.35,57.6,'giậu Tây 2');
  hedge(212.65,47.2,212.65,50.6,'giậu Đông'); hedge(212.65,53.9,212.65,59.2,'giậu Đông 2');
  hedge(191.9,62.0,197.4,62.0,'giậu Nam'); hedge(200.6,62.0,203.9,62.0,'giậu Nam 2'); hedge(204.8,66.2,212.2,66.2,'giậu góc giải khát');
  flowerBed(circ(199,61.1,1.15,24), 'bồn tượng', [0xffd23f,0xff8a2a,0xffffff]);

  /* ---------- 6d. Tượng "Kính lúp QC" giữa bồn hoa phía Nam (trục cổng → cầu → tượng) ---------- */
  { const bronze=colorMat(0x8a6a3a,{roughness:.35, metalness:.8}), x=199, z=61.1;
    KO.add(CY(.35,.42,.6,10), M.stoneG, x,.62,z); KO.add(CY(.06,.08,1.1,8), bronze, x+.2,1.4,z, 0,0,-.5);
    KO.add(new THREE.TorusGeometry(.42,.07,10,28), bronze, x-.12,2.05,z, 0); const lens=new THREE.Mesh(new THREE.CircleGeometry(.4,24), new THREE.MeshStandardMaterial({color:0xbfe6ff, metalness:.2, roughness:.05, transparent:true, opacity:.35, envMapIntensity:2, side:THREE.DoubleSide}));
    lens.position.set(x-.12,2.05,z); lens.userData.dynamic=true; scene.add(lens);
    const bug=colorMat(0x2e7d32,{roughness:.4}); KO.add(new THREE.SphereGeometry(.12,10,8), bug, x-.12,2.05,z+.05, 0,0,0, 1,.7,1.3);
    makeLabel('🔎 Tượng "Kính lúp QC"', 'Soi kỹ từng góc – tinh thần QA', {h:.38, x, y:2.9, z, fade:26}); }

  /* ---------- 6e. Giàn hoa giấy (pergola) + 2 băng ghế ---------- */
  { const x0=185.3, x1=191.0, z0=58.7, z1=62.0, pink=[0xff3fa0,0xe8248a,0xff6fc0,0xffffff,0xff9a3c];
    for(const x of [x0+.15,(x0+x1)/2,x1-.15]) for(const z of [z0+.15,z1-.15]){ KO.add(B(.18,2.6,.18), M.white, x,1.3,z); circles.push({x,z,r:.14}); }
    for(const z of [z0+.15,z1-.15]) KO.add(B(x1-x0+.4,.18,.1), M.white, (x0+x1)/2,2.65,z);
    for(let x=x0;x<=x1+.01;x+=.45) KO.add(B(.07,.1,z1-z0+.5), M.white, x,2.78,(z0+z1)/2);
    for(let i=0;i<160;i++){ const x=x0+rng()*(x1-x0), z=z0+rng()*(z1-z0); FLW.push({x, y:2.88+rng()*.16, z, s:1.3+rng()*.9, c:pick2(pink)}); if(rng()<.5) BUSH.push({x, y:2.84, z, s:.28+rng()*.12, c:0x3d7a33}); }
    for(let i=0;i<40;i++){ const side=rng()<.5, x=side?(rng()<.5?x0+.15:x1-.15):x0+rng()*(x1-x0), z=side?z0+.15+rng()*(z1-z0-.3):(rng()<.5?z0+.15:z1-.15); FLW.push({x:x+(rng()-.5)*.2, y:.6+rng()*2.1, z:z+(rng()-.5)*.2, s:1.1+rng()*.6, c:pick2(pink)}); }
    keep(x0,z0,x1,z1,'giàn hoa');
    woodBench(188.15,59.55,dg(35),'ghế giàn hoa','🌸 Ngồi dưới giàn hoa giấy (E · C)',false);
    // dây đèn dưới giàn (bật ban đêm)
    for(let x=x0+.3;x<x1;x+=.5) for(const z of [z0+.6,(z0+z1)/2,z1-.6]) STR.push([x+(rng()-.5)*.1, 2.55-rng()*.08, z]);
    makeLabel('🌸 Giàn hoa giấy', null, {h:.4, x:(x0+x1)/2, y:3.4, z:(z0+z1)/2, fade:30}); }

  /* ---------- 6f. Sân chơi trẻ em: xích đu (động), cầu trượt, thú nhún ---------- */
  const PLAY={};
  { // xích đu 2 chỗ: xà ngang dọc trục x
    const sx0=185.7, sx1=188.9, sy=2.3, sz=44.55;
    for(const x of [sx0,sx1]) for(const s of [-1,1]){ KO.add(CY(.05,.05,2.45,8), M.blue, x,1.16,sz+s*.55, 0, s*.24); }
    KO.add(CY(.06,.06,sx1-sx0+.3,8), M.yellow, (sx0+sx1)/2,sy,sz, 0,0,Math.PI/2);
    const swings=[186.6,188.0].map((x,i)=>{ const piv=new THREE.Group(); piv.position.set(x,sy,sz); piv.userData.dynamic=true; scene.add(piv);
      const seat=new THREE.Mesh(vcGeo([{g:CY(.012,.012,1.82,4), c:0xc9ced4, x:-.2, y:-.91},{g:CY(.012,.012,1.82,4), c:0xc9ced4, x:.2, y:-.91},{g:B(.48,.05,.22), c:i?0xe2483a:0xff8a2a, y:-1.84}]), dynMat); seat.castShadow=true; piv.add(seat);
      const anchor=new THREE.Object3D(); anchor.position.y=-1.80; piv.add(anchor); return {piv, seat, anchor, x, a:0, amp:i?0:.5, ph:i*1.3}; });
    for(const x of [sx0,sx1]) boxes.push({x0:x-.12, x1:x+.12, z0:sz-.75, z1:sz+.75});
    circles.push({x:swings[1].x, z:sz, r:.26});   // ghế đu trống: không đi xuyên
    PLAY.swings=swings; reserve(187.3,sz,1.2,'xích đu');
    // ghế xích đu thứ 2 cho người chơi (đu tự dừng khi bạn ngồi)
    const s2=W.addSeat({x:swings[1].x, z:sz, rot:0, y:.52, floor:.05, label:'🎠 Ngồi xích đu (E · C)'}); s2.inter.x=swings[1].x; s2.inter.z=sz-.85; PLAY.seat2=s2;
    // cầu trượt: thang (x 190.1) → sàn 1,35 m → máng trượt xuống phía Đông
    const lx=190.15, lz=44.7, top=1.35;
    for(const s of [-1,1]){ KO.add(B(.06,top+.9,.06), M.yellow, lx,(top+.9)/2,lz+s*.32); KO.add(B(.06,top+.9,.06), M.yellow, lx+.62,(top+.9)/2,lz+s*.32); }
    for(let y=.3;y<top;y+=.3) KO.add(CY(.025,.025,.64,6), M.steel, lx-.02,y,lz, 0,Math.PI/2);
    KO.add(B(.7,.08,.7), M.blue, lx+.31,top,lz); KO.add(new THREE.ConeGeometry(.55,.5,4), M.red, lx+.31,top+1.15,lz, Math.PI/4);
    const chL=1.9, ang=Math.atan2(top-.15, chL); KO.add(B(chL/Math.cos(ang)*1.0,.05,.5), M.orange, lx+.66+chL/2,(top+.15)/2+.05,lz, 0,0,-ang);
    for(const s of [-1,1]) KO.add(B(chL/Math.cos(ang),.14,.04), M.orange, lx+.66+chL/2,(top+.15)/2+.12,lz+s*.25, 0,0,-ang);
    boxes.push({x0:lx-.12, x1:lx+.74, z0:lz-.4, z1:lz+.4}); addSeg(lx+.8,lz,lx+.66+chL-.1,lz,.3);
    PLAY.slide={lx, lz, top, x0:lx+.66, x1:lx+.66+chL}; reserve(lx+1.2,lz,1.3,'cầu trượt',false);
    // thú nhún (con vịt vàng trên lò xo)
    const rx=191.5, rz=45.7, rider=new THREE.Group(); rider.position.set(rx,0,rz); rider.userData.dynamic=true; scene.add(rider);
    for(const y of [.12,.24]) KO.add(new THREE.TorusGeometry(.12,.025,6,14), M.steel, rx,y,rz, 0,Math.PI/2);   // lò xo (tĩnh)
    const body=new THREE.Mesh(vcGeo([{g:new THREE.SphereGeometry(.26,12,10), c:0xffc531, y:.18, sx:1.3, sy:.75, sz:.8},{g:new THREE.SphereGeometry(.15,10,8), c:0xffc531, x:.3, y:.44},{g:new THREE.ConeGeometry(.06,.14,6), c:0xff8a2a, x:.47, y:.42, rz:-Math.PI/2}]), dynMat);
    body.position.y=.34; body.castShadow=true; rider.add(body);
    circles.push({x:rx, z:rz, r:.38}); PLAY.rider={g:rider, body, x:rx, z:rz}; reserve(rx,rz,.45,'thú nhún',false);
    makeLabel('🛝 Sân chơi trẻ em', null, {h:.42, x:188.6, y:3.3, z:44.6, fade:34});
  }

  /* ---------- 6g. Khu thể dục ngoài trời (dùng được) ---------- */
  const GYM=[];
  { const z=44.75;
    // 1. máy đi bộ trên không
    { const x=206.6; KO.add(B(.1,1.7,.1), M.blue, x-.35,.85,z); KO.add(B(.1,1.7,.1), M.blue, x+.35,.85,z); KO.add(CY(.04,.04,.8,8), M.yellow, x,1.62,z, 0,0,Math.PI/2); KO.add(CY(.03,.03,.8,8), M.yellow, x,1.25,z+.25, 0,0,Math.PI/2);
      const legGeo=vcGeo([{g:B(.06,1.3,.06), c:0xffc531, y:-.65},{g:B(.16,.04,.3), c:0x1b1d21, y:-1.28, z:.08}]);
      const legs=[-1,1].map(s=>{ const g=new THREE.Mesh(legGeo, dynMat); g.position.set(x+s*.17,1.45,z); g.castShadow=true; g.userData.dynamic=true; scene.add(g); return g; });
      GYM.push({x, z, name:'Máy đi bộ trên không', clip:'walk', face:0, uy:.12, anim:(t,on)=>{ const a=on?Math.sin(t*4.4)*.42:legs[0].rotation.x*.9; legs[0].rotation.x=a; legs[1].rotation.x=-a; } }); }
    // 2. máy xoay eo (đĩa xoay)
    { const x=208.4; KO.add(CY(.05,.05,1.3,8), M.blue, x,.65,z-.35); KO.add(CY(.03,.03,.7,8), M.yellow, x,1.3,z-.35, 0,0,Math.PI/2); const disk=new THREE.Mesh(vcGeo([{g:CY(.32,.34,.08,16), c:0xffc531},{g:B(.5,.012,.06), c:0x1b1d21, y:.045}]), dynMat); disk.position.set(x,.12,z+.05); disk.userData.dynamic=true; scene.add(disk);
      GYM.push({x, z:z+.05, name:'Máy xoay eo', clip:'idle', face:Math.PI, uy:.17, twist:true, anim:(t,on)=>{ disk.rotation.y=on?Math.sin(t*2.6)*.7:disk.rotation.y*.9; } }); }
    // 3. xe đạp tại chỗ
    { const x=210.2; KO.add(B(.1,.55,.9), M.blue, x,.42,z); KO.add(B(.3,.06,.18), M.ironB, x,.72,z-.2); KO.add(CY(.03,.03,.5,8), M.yellow, x,1.0,z+.38, 0,0,Math.PI/2); KO.add(B(.05,.5,.05), M.blue, x,.8,z+.38);
      const crank=new THREE.Mesh(vcGeo([{g:CY(.16,.16,.04,14), c:0xc9ced4, rz:Math.PI/2},{g:B(.04,.3,.04), c:0x1b1d21}]), dynMat); crank.position.set(x,.38,z+.1); crank.userData.dynamic=true; scene.add(crank);
      GYM.push({x, z, name:'Xe đạp tại chỗ', clip:'idle', face:0, uy:.32, sit:true, anim:(t,on)=>{ if(on) crank.rotation.x=t*5; } }); }
    // 4. vòng xoay tay
    { const x=212.0; KO.add(CY(.06,.06,1.9,8), M.blue, x,.95,z+.2); const wh=new THREE.Mesh(vcGeo([{g:new THREE.TorusGeometry(.3,.03,6,20), c:0xffc531}, ...[0,1,2].map(i=>({g:B(.6,.03,.03), c:0xffc531, rz:i*Math.PI/3}))]), dynMat); wh.position.set(x,1.55,z); wh.userData.dynamic=true; scene.add(wh);
      GYM.push({x, z:z-.15, name:'Vòng xoay tay', clip:'idle', face:Math.PI, uy:.02, arms:true, anim:(t,on)=>{ if(on) wh.rotation.z=t*2.2; } }); }
    for(const m of GYM){ circles.push({x:m.x, z:m.z, r:.42}); reserve(m.x,m.z,.45,'máy '+m.name,false); m.busy=null; m.t=0;
      m.ux=m.x; m.uz=m.z; m.fx=m.x; m.fz=GY.z1+.6;
      m.inter={x:m.x, z:m.z+.95, r:1.2, prio:.6, get label(){ return m.busy ? `💪 ${m.busy==='me'?'Đang tập':'Có người đang tập'} – ${m.name}` : `💪 Tập ${m.name} (E)`; }, action:()=>startEx(m)}; INTER.push(m.inter); }
    makeLabel('💪 Khu thể dục', 'Bấm E ở máy trống để tập', {h:.42, x:209.3, y:2.7, z:44.6, fade:34});
  }

  /* ---------- 6h. Góc giải khát: 3 máy bán nước tự động + quầy nước + bàn cờ đá ---------- */
  const VEND=[];
  { const vendT=ctex(768,512,(g,w,h)=>{ const th=[['#1565c0','#64b5f6','NƯỚC SUỐI & TRÀ'],['#c62828','#ff8a80','NƯỚC NGỌT · TĂNG LỰC'],['#2e7d32','#a5d6a7','CÀ PHÊ · SỮA']];
      th.forEach(([a,b,t],i)=>{ const x0=i*256; const gr=g.createLinearGradient(x0,0,x0,h); gr.addColorStop(0,a); gr.addColorStop(1,'#111'); g.fillStyle=gr; g.fillRect(x0,0,256,h);
        g.fillStyle='#0d1117'; g.fillRect(x0+18,70,170,300); for(let r=0;r<4;r++) for(let c=0;c<4;c++){ const hue=(i*90+r*40+c*25)%360; g.fillStyle=`hsl(${hue},70%,55%)`; g.fillRect(x0+28+c*40,82+r*72,26,50); g.fillStyle='#fff'; g.fillRect(x0+30+c*40,84+r*72,6,46); g.fillStyle='#ffd23f'; g.fillRect(x0+28+c*40,136+r*72,26,8); }
        g.fillStyle=b; g.fillRect(x0+196,90,44,120); g.fillStyle='#222'; g.fillRect(x0+204,230,28,40); g.fillStyle='#111'; g.fillRect(x0+30,400,190,70); g.fillStyle='#fff'; g.font='700 22px "Segoe UI",sans-serif'; g.textAlign='center'; g.fillText(t,x0+128,44); g.font='600 16px "Segoe UI",sans-serif'; g.fillText('LẤY NƯỚC',x0+125,440); }); });
    const vendM=new THREE.MeshStandardMaterial({map:vendT, emissive:0xffffff, emissiveMap:vendT, emissiveIntensity:.35, roughness:.35}); vendM.userData.noMerge=true; const VFR=[];
    const KINDS=[
      {name:'Máy nước suối & trà', icon:'💧', col:M.blue, items:[['💧 Nước suối',6,null,0,'Mát lạnh, giải khát tức thì.'],['🍵 Trà xanh không độ',10,null,0,'Thanh mát, ít ngọt.'],['🍋 Trà chanh mật ong',12,'energy',5,'+5 phút chạy nhanh.']]},
      {name:'Máy nước ngọt & tăng lực', icon:'🥤', col:M.red, items:[['🥤 Nước ngọt có ga',10,null,0,'Sảng khoái!'],['⚡ Nước tăng lực',15,'energy',10,'+10 phút chạy nhanh (cộng dồn).'],['🧃 Nước ép cam',12,'energy',4,'Vitamin C + 4 phút chạy nhanh.']]},
      {name:'Máy cà phê & sữa', icon:'☕', col:M.green, items:[['☕ Cà phê sữa lon',12,'coffee',10,'+20% thưởng quiz trong 10 phút.'],['🥛 Sữa tươi',9,null,0,'Bổ dưỡng.'],['🧋 Trà sữa đóng chai',14,'coffee',6,'+20% thưởng quiz 6 phút.']]}];
    KINDS.forEach((k,i)=>{ const x=205.4+i*1.15, z=65.55, rot=Math.PI; // mặt quay về phía Bắc
      KO.add(B(1.0,1.95,.78), k.col, x,1.0,z); KO.add(B(1.04,.12,.82), M.ironB, x,2.02,z); KO.add(B(1.0,.08,.78), M.ironB, x,.04,z);
      const fr=new THREE.PlaneGeometry(.9,1.6); const uv=fr.attributes.uv; for(let j=0;j<uv.count;j++) uv.setX(j,(i+uv.getX(j))/3);
      fr.rotateY(rot); fr.translate(x,1.08,z-.395); VFR.push(fr.toNonIndexed());   // 3 mặt máy gộp 1 lượt vẽ (bên dưới)
      boxes.push({x0:x-.52, x1:x+.52, z0:z-.42, z1:z+.42}); reserve(x,z,.55,'máy bán nước',false);
      const can=new THREE.Mesh(CY(.035,.035,.12,10), k.col); can.visible=false; can.userData.dynamic=true; scene.add(can);
      const V={...k, x, z, can, t:0}; VEND.push(V);
      INTER.push({x, z:z-1.05, r:1.0, prio:.7, label:`${k.icon} ${k.name} – mua nước (E)`, action:()=>openShop(k.icon+' '+k.name, k.items, (it)=>dropCan(V, it))}); });
    { const fm=new THREE.Mesh(mergeGeometries(VFR,false), vendM); fm.userData.dynamic=true; fm.castShadow=false; fm.receiveShadow=true; scene.add(fm); }
    keep(204.9,64.9,208.6,66.2,'dãy máy bán nước');
    W.HOOK.onFrame.push(()=>{ vendM.emissiveIntensity=.3+night()*.9; });
    // quầy nước Bên Hồ (ki-ốt gỗ, mái bạt sọc)
    const kx=210.85, kz=65.0; KO.add(B(2.6,1.05,1.3), M.wood, kx,.53,kz); KO.add(B(2.75,.06,1.45), M.white, kx,1.08,kz); KO.add(B(2.6,1.3,.08), M.wood, kx,1.75,kz+.62);
    for(const s of [-1,1]) KO.add(B(.08,1.4,.08), M.dark, kx+s*1.25,1.8,kz-.6);
    const awT=ctex(256,64,(g,w,h)=>{ for(let i=0;i<8;i++){ g.fillStyle=i%2?'#ffffff':'#2a9d8f'; g.fillRect(i*32,0,32,h); } g.fillStyle='rgba(0,0,0,.15)'; g.fillRect(0,h-8,w,8); });
    KO.add(B(3.0,.06,1.7), new THREE.MeshStandardMaterial({map:awT, roughness:.8}), kx,2.55,kz-.15, 0,.18);
    const ksT=ctex(512,128,(g,w,h)=>{ g.fillStyle='#fff8ec'; g.fillRect(0,0,w,h); g.fillStyle='#1d6b5f'; g.font='800 48px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🧃 QUẦY NƯỚC BÊN HỒ',w/2,h/2); });
    KO.add(B(2.4,.45,.05), new THREE.MeshStandardMaterial({map:ksT, roughness:.6}), kx,2.2,kz+.57);
    for(let i=0;i<5;i++) KO.add(CY(.06,.05,.16,8), [M.orange,M.green,M.red,M.white,M.yellow][i], kx-.9+i*.45,1.19,kz-.2);
    boxes.push({x0:kx-1.35, x1:kx+1.35, z0:kz-.7, z1:kz+.7}); reserve(kx,kz,1.3,'quầy nước',false);
    const MENU=[['🧊 Trà đá',4,null,0,'Đặc sản vỉa hè, mát lạnh.'],['🎋 Nước mía tắc',10,'energy',4,'Ngọt mát + 4 phút chạy nhanh.'],['🥥 Nước dừa tươi',15,'energy',8,'+8 phút chạy nhanh.'],['🫘 Sữa đậu nành',8,null,0,'Thơm béo.'],['☕ Cà phê muối',16,'coffee',12,'+20% thưởng quiz 12 phút.']];
    INTER.push({x:kx, z:kz-1.45, r:1.5, prio:.6, label:'🧃 Quầy nước Bên Hồ – gọi nước (E)', action:()=>openShop('🧃 Quầy nước Bên Hồ', MENU, ()=>{ if(kiosk.o) say(kiosk.o, pick(['Nước của bạn đây! 😊','Uống ngon nha!','Cảm ơn bạn nhiều!']), 2.4); })});
    makeLabel('🥤 Góc giải khát', 'Máy bán nước tự động · Quầy nước Bên Hồ', {h:.5, x:208.4, y:3.4, z:64.6, fade:44});
    // bàn cờ đá + 4 ghế đẩu
    const cx=205.9, cz=61.85; KO.add(CY(.2,.28,.62,10), M.stoneG, cx,.31,cz); KO.add(B(.82,.07,.82), M.stoneG, cx,.66,cz);
    const boardT=ctex(256,256,(g,w,h)=>{ g.fillStyle='#e8d3a6'; g.fillRect(0,0,w,h); g.strokeStyle='#5a3a1a'; g.lineWidth=2; for(let i=0;i<9;i++){ g.beginPath(); g.moveTo(16+i*28,16); g.lineTo(16+i*28,240); g.stroke(); } for(let j=0;j<9;j++){ g.beginPath(); g.moveTo(16,16+j*28); g.lineTo(240,16+j*28); g.stroke(); }
      for(let k=0;k<14;k++){ const x=16+Math.floor(rng()*9)*28, y=16+Math.floor(rng()*9)*28; g.fillStyle='#f6ead0'; g.beginPath(); g.arc(x,y,11,0,7); g.fill(); g.strokeStyle=k%2?'#c0392b':'#1b1b1b'; g.lineWidth=2.5; g.stroke(); g.fillStyle=k%2?'#c0392b':'#1b1b1b'; g.font='700 12px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(['車','馬','炮','兵'][k%4],x,y+1); } });
    KO.add(new THREE.PlaneGeometry(.7,.7), new THREE.MeshStandardMaterial({map:boardT, roughness:.6}), cx,.697,cz, 0,-Math.PI/2);
    circles.push({x:cx, z:cz, r:.48}); reserve(cx,cz,.5,'bàn cờ',false);
    CHESS.table={x:cx, z:cz};
    CHESS.stools=[[0,-1],[0,1],[-1,0],[1,0]].map(([dx,dz],i)=>{ const x=cx+dx*.82, z=cz+dz*.82; KO.add(CY(.17,.2,.42,10), M.stoneG, x,.21,z); circles.push({x,z,r:.2}); const rot=Math.atan2(-dx,-dz);
      const st={x,z,rot}; if(i>=2) st.seat=W.addSeat({x,z,rot,y:.45,floor:.02,label:'♟️ Ngồi xem đánh cờ (E · C)', onSit:()=>chessWatch()}); return st; });
    INTER.push({x:cx, z:cz-1.3, r:1.4, prio:.2, label:'♟️ Xem các cụ đánh cờ (E)', action:()=>chessWatch()});
    makeLabel('♟️ Bàn cờ đá', null, {h:.36, x:cx, y:2.2, z:cz, fade:26});
  }

  /* ---------- 6i. Xe kem (gần cổng Tây) ---------- */
  const CART={x:186.7, z:50.05};
  { const {x,z}=CART; KO.add(B(1.5,.75,.75), M.white, x,.78,z); KO.add(B(1.55,.08,.8), M.blue, x,1.18,z); for(const s of [-1,1]){ KO.add(CY(.22,.22,.06,14), M.ironB, x+s*.55,.22,z+.4, 0,0,Math.PI/2); KO.add(CY(.22,.22,.06,14), M.ironB, x+s*.55,.22,z-.4, 0,0,Math.PI/2); }
    KO.add(CY(.025,.025,1.5,6), M.steel, x,1.9,z); const umb=new THREE.ConeGeometry(1.05,.45,10,1,true); KO.add(umb, new THREE.MeshStandardMaterial({map:ctex(256,32,(g,w,h)=>{ for(let i=0;i<10;i++){ g.fillStyle=['#ff6b8a','#fff4d6','#7ed6df','#fff4d6'][i%4]; g.fillRect(i*25.6,0,25.6,h); } }), side:THREE.DoubleSide, roughness:.8}), x,2.55,z);
    const icT=ctex(256,96,(g,w,h)=>{ g.fillStyle='#ff6b8a'; g.fillRect(0,0,w,h); g.fillStyle='#fff'; g.font='800 40px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🍦 KEM TƯƠI',w/2,h/2); });
    KO.add(B(1.2,.42,.02), new THREE.MeshStandardMaterial({map:icT, roughness:.6}), x,.82,z+.39);
    for(let i=0;i<4;i++) KO.add(new THREE.SphereGeometry(.07,8,6), [M.lotus,M.white,M.orange,M.green][i], x-.45+i*.3,1.27,z);
    boxes.push({x0:x-.8, x1:x+.8, z0:z-.45, z1:z+.45}); reserve(x,z,.85,'xe kem',false);
    const MENU=[['🍦 Kem ốc quế',10,null,0,'Vani + sô-cô-la.'],['🍡 Kem que đậu xanh',6,null,0,'Tuổi thơ ùa về!'],['🥥 Kem dừa trái',18,'energy',5,'Mát lạnh + 5 phút chạy nhanh.'],['🍨 Kem ly 3 viên',14,null,0,'Dâu · sầu riêng · cốm.']];
    INTER.push({x, z:z+1.05, r:1.3, prio:.6, label:'🍦 Mua kem (E)', action:()=>openShop('🍦 Xe kem tươi', MENU, ()=>{ if(icecream.o) say(icecream.o, pick(['Kem đây! Ăn nhanh kẻo chảy nha 😄','Ngon thì ghé nữa nha!','Mát lạnh luôn! 🍦']), 2.4); })});
  }

  /* ---------- 6j. Cây trong công viên ---------- */
  addTree('shade', 186.5, 47.9, 1.0, 'cây Tây Bắc'); addTree('willow', 186.9, 55.7, 1.0, 'liễu Tây'); addTree('flame', 211.6, 47.6, .95, 'phượng Đông');
  addTree('shade', 211.5, 56.4, .95, 'cây Đông'); addTree('purple', 192.3, 61.15, .9, 'bằng lăng Nam 1'); addTree('purple', 196.1, 61.15, .85, 'bằng lăng Nam 2');
  addTree('purple', 202.1, 61.15, .85, 'bằng lăng Nam 3'); addTree('willow', ISL.x-.15, ISL.z+.05, .8, 'liễu đảo', false);
  addTree('flame', 209.6, 61.3, .8, 'phượng góc NE giải khát');

  /* ============================== 7. CÂY XANH + CHẬU HOA TRÊN PHỐ ============================== */
  const POT=[], PLANTER=[], PIT=[];
  { const D=CITY.downtown, WD=CITY.ward, SX=(WD && WD.links)||[178,220], SZ=[-36,0,36], H=5, ST=WD?WD.street:86;
    const towers=(ctx.downtown && ctx.downtown.towers)||[], doors=towers.filter(t=>t.door).map(t=>t.door);
    const PARK={x0:182.5, x1:215.5, z0:40.5, z1:67};
    const segD=(x,z,s)=>{ const ex=s.bx-s.ax, ez=s.bz-s.az, L2=ex*ex+ez*ez||1e-9; let t=((x-s.ax)*ex+(z-s.az)*ez)/L2; t=clamp(t,0,1); return Math.hypot(x-(s.ax+ex*t), z-(s.az+ez*t)); };
    const mine=[];
    function ok(x,z,r){
      if(x>262 || x<D.x0+1) return false;   // khu đồi phía Đông (x>270) để phiên chính làm
      if(!W.inDT(x,z,-.4)) return false;
      if(x>PARK.x0 && x<PARK.x1 && z>PARK.z0 && z<PARK.z1) return false;
      const tr=W.traffic; if(tr){ for(const [dx,dz] of [[0,0],[1.4,0],[-1.4,0],[0,1.4],[0,-1.4]]){ if(tr.zebraAt && tr.zebraAt(x+dx,z+dz)) return false; } if(tr.onRoad && tr.onRoad(x,z)) return false; }
      for(const c of circles){ if(c.owner || c.x>1e8) continue; if(Math.hypot(x-c.x,z-c.z) < c.r+r+.85) return false; }
      for(const b of boxes){ if(b.x0>1e8) continue; const cx=clamp(x,b.x0,b.x1), cz=clamp(z,b.z0,b.z1); if(Math.hypot(x-cx,z-cz) < r+1.95) return false; }
      for(const s of W.SEGS){ if(x<s.x0-4 || x>s.x1+4 || z<s.z0-4 || z>s.z1+4) continue; if(segD(x,z,s) < s.r+r+1.2) return false; }
      for(const p of plats){ if(p.t!=='r') continue; const dx=x-p.x, dz=z-p.z, lx=dx*p.c-dz*p.s, lz=dx*p.s+dz*p.c; if(Math.abs(lx)<p.hw+r+.8 && Math.abs(lz)<p.hd+r+.8) return false; }
      for(const it of INTER){ let ix, iz; try{ ix=+it.x; iz=+it.z; }catch(e){ continue; } if(!isFinite(ix)) continue; if(Math.hypot(x-ix,z-iz) < 2.6) return false; }
      for(const d of doors){ if(Math.abs(x-d.x)<5.2 && Math.abs(z-d.z)<6) return false; }
      for(const m of mine){ if(Math.hypot(x-m.x,z-m.z) < m.r+r+2.2) return false; }
      return true; }
    // đường thẳng song song mép đường: cây cách mép 0,95 m, chậu cách mép 0,6 m
    const LINES=[]; for(const z of SZ) for(const s of [-1,1]) LINES.push({ax:'x', c:z+s*H, s, a:D.x0+3, b:D.x1-3, cross:SX, kind:z===0?['shade','shade','purple']:['purple','flame','shade']});
    for(const x of SX) for(const s of [-1,1]) LINES.push({ax:'z', c:x+s*H, s, a:D.z0+3, b:ST-H-6.5, cross:SZ, kind:['shade','purple','shade']});
    if(WD) for(const s of [-1,1]) LINES.push({ax:'x', c:ST+s*H, s, a:WD.x0+3, b:WD.x1-3, cross:SX, kind:['flame','shade','purple']});
    const FLC=[[0xff4f6d,0xffd23f],[0xff9fc4,0xffffff],[0xb06cff,0xffd23f],[0xff6b3d,0xfff1a8],[0xe8248a,0xff9fc4]];
    let k=0;
    for(const L of LINES){ for(let t=L.a; t<=L.b; t+=4.6){ if(L.cross.some(c=>Math.abs(t-c)<9.6)) continue; if(L.ax==='x' && Math.abs(L.c)<6 && (t<D.x0+7 || t>D.x1-7)) continue;
        const tree=(k++%2)===0, d=tree?.95:.62, r=tree?.28:(L.ax==='x'?.45:.38);
        const x=L.ax==='x'?t:L.c+L.s*d, z=L.ax==='x'?L.c+L.s*d:t;
        if(!ok(x,z,r)) continue;
        if(tree){ const kind=L.kind[Math.floor(rng()*L.kind.length)]; TREES[kind].push({x,z,s:.85+rng()*.3,r:rng()*TAU}); PIT.push({x,z}); circles.push({x,z,r:.26}); out.trees++; }
        else if(L.ax==='x'){ PLANTER.push({x,z,rot:0}); boxes.push({x0:x-.68, x1:x+.68, z0:z-.3, z1:z+.3}); fillPlanter(x,z,1.25,.45,pick2(FLC)); out.planters++; }
        else { POT.push({x,z}); circles.push({x,z,r:.4}); fillPot(x,z,pick2(FLC)); out.planters++; }
        mine.push({x,z,r}); } }
    // 2 chậu hoa tròn đón khách ở hai bên lối vào mỗi toà nhà (sát mặt tiền, không chắn vòng cửa)
    for(const t of towers){ if(!t.door) continue; const fz=t.face>0?1:-1, z=t.z+fz*(t.d/2+1.35); for(const s of [-1,1]){ const x=t.door.x+s*3.35; let blocked=false;
        for(const c of circles){ if(!c.owner && c.x<1e8 && Math.hypot(x-c.x,z-c.z)<c.r+.9){ blocked=true; break; } } if(blocked) continue;
        if(W.traffic && W.traffic.onRoad && W.traffic.onRoad(x,z)) continue;
        POT.push({x,z,big:true}); circles.push({x,z,r:.42}); fillPot(x,z,pick2(FLC),true); out.planters++; } }
  }
  function fillPlanter(x,z,w,d,cols){ for(let i=0;i<10;i++) BUSH.push({x:x+(rng()-.5)*w*.85, y:.58, z:z+(rng()-.5)*d*.7, s:.17+rng()*.06, c:rng()<.5?0x3f7f37:0x4a8a3c}); for(let i=0;i<26;i++) FLW.push({x:x+(rng()-.5)*w*.9, y:.66+rng()*.1, z:z+(rng()-.5)*d*.8, s:.9+rng()*.5, c:cols[i%cols.length]}); }
  function fillPot(x,z,cols,big){ const h=big?.72:.6; BUSH.push({x, y:h+.12, z, s:big?.36:.3, c:0x3f7f37}); for(let i=0;i<(big?18:12);i++){ const a=rng()*TAU, rr2=rng()*(big?.32:.26); FLW.push({x:x+Math.cos(a)*rr2, y:h+.2+rng()*.15, z:z+Math.sin(a)*rr2, s:1+rng()*.5, c:cols[i%cols.length]}); } }

  /* ---------- dựng InstancedMesh: cây · rèm liễu · hố cây · chậu · bồn · bụi · hoa ---------- */
  const IMS=[];
  function inst(geo, mat, list, fn, cast=true){ if(!list.length) return null; const im=new THREE.InstancedMesh(geo, mat, list.length); const col=new THREE.Color();
    list.forEach((p,i)=>{ col.set(0xffffff); fn(p, _m4, col); im.setMatrixAt(i,_m4); im.setColorAt(i, col); });
    im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; im.castShadow=cast; im.receiveShadow=true; im.userData.dynamic=true; im.computeBoundingSphere(); scene.add(im); IMS.push(im); return im; }
  const TR=(p,m)=>{ _q.setFromAxisAngle(_v.set(0,1,0), p.r||0); m.compose(_v.set(p.x, .02, p.z), _q, _s.set(p.s,p.s,p.s)); };
  inst(willowCurtain, willowMat, TREES.willow, (p,m,c)=>{ TR(p,m); c.set(0xffffff); });
  // Cây + hố cây + chậu + bụi + hoa + cỏ lau: "nướng" sẵn thành vài khối tĩnh theo vùng 64 m (màu theo đỉnh + thuộc tính lay gió aSw)
  // → cả thành phố chỉ còn ~4–6 lượt vẽ (trước: 11 InstancedMesh + bóng), vẫn lay theo gió từng cây.
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
  for(const kind of Object.keys(TREES)) for(const p of TREES[kind]){ TR(p,_m4); tintT.setHSL(0,0,1).lerp(_tc.setHSL(.22+hash(p.x,p.z,1)*.1,.4,.6), .18); bake(TGEO[kind], _m4, tintT, p.x*.37+p.z*.23, .016, p.s); }
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
  // dây đèn giàn hoa
  const strM=new THREE.MeshStandardMaterial({color:0xfff1c8, emissive:0xffd27a, emissiveIntensity:0}); strM.userData.noMerge=true;
  inst(new THREE.SphereGeometry(.035,6,4), strM, STR, (p,m,c)=>{ m.makeTranslation(p[0],p[1],p[2]); c.set(0xffffff); }, false);
  for(let i=0;i<STR.length;i+=6) GLOW.add(STR[i][0],STR[i][1],STR[i][2],.9,0xffd27a,.6);

  /* ============================== 8. CÁ KOI · VỊT · BỒ CÂU ============================== */
  const inLakeN=(x,z,k=.78)=>((x-C0.x)/LA)**2+((z-C0.z)/LB)**2<k;
  const freeWater=(x,z)=>inLakeN(x,z,.72) && Math.abs(x-BX)>1.6 && Math.hypot(x-ISL.x,z-ISL.z)>ISL.r+.5;
  function rndWater(){ for(let i=0;i<40;i++){ const x=C0.x+(R()*2-1)*LA, z=C0.z+(R()*2-1)*LB; if(freeWater(x,z)) return [x,z]; } return [C0.x-5,C0.z]; }
  const koiGeo=vcGeo([{g:new THREE.SphereGeometry(.09,10,8), c:0xffffff, sx:1, sy:.55, sz:2.2},{g:new THREE.ConeGeometry(.07,.16,6), c:0xffffff, z:-.25, rx:-Math.PI/2, sx:1.2, sy:1, sz:.3}]);
  const KOI=[]; for(let i=0;i<14;i++){ const [x,z]=rndWater(); KOI.push({x,z,h:R()*TAU,tx:x,tz:z,sp:.25+R()*.2,ph:R()*6,c:pick([0xff7a1a,0xff7a1a,0xffffff,0xffc23a,0xff5a2a,0xf2f2f2])}); }
  const koiIM=inst(koiGeo, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.35}), KOI, (p,m,c)=>{ m.makeTranslation(p.x,.09,p.z); c.set(p.c); }, false);
  const duckGeo=vcGeo([{g:new THREE.SphereGeometry(.16,12,10), c:0xf7f4ea, sx:1, sy:.62, sz:1.45, y:.08},{g:new THREE.SphereGeometry(.09,10,8), c:0xf7f4ea, y:.27, z:.17},{g:new THREE.ConeGeometry(.035,.12,6), c:0xff9a1a, y:.26, z:.29, rx:Math.PI/2, sy:1, sx:1.3},{g:new THREE.ConeGeometry(.07,.12,6), c:0xf7f4ea, y:.14, z:-.24, rx:-2.3}]);
  const DUCK=[]; for(let i=0;i<6;i++){ const [x,z]=rndWater(); DUCK.push({x,z,h:R()*TAU,tx:x,tz:z,sp:.2+R()*.12,ph:R()*6,c:i<4?0xffffff:0xb08a62}); }
  const duckIM=inst(duckGeo, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.6}), DUCK, (p,m,c)=>{ m.makeTranslation(p.x,.15,p.z); c.set(p.c); }, false); if(duckIM && !LOW) duckIM.castShadow=true;
  const pigeonGeo=vcGeo([{g:new THREE.SphereGeometry(.1,8,6), c:0x8d939c, sx:.9, sy:.75, sz:1.4, y:.12},{g:new THREE.SphereGeometry(.055,8,6), c:0x5d646e, y:.21, z:.13},{g:new THREE.ConeGeometry(.012,.04,4), c:0xd8a35a, y:.2, z:.19, rx:Math.PI/2},{g:B(.1,.02,.14), c:0x6b717a, y:.13, z:-.17}]);
  const PIG=[]; const pigSpot=()=>[193.6+R()*10.8, 42.0+R()*2.0]; for(let i=0;i<10;i++){ const [x,z]=pigSpot(); PIG.push({x,z,y:0,h:R()*TAU,peck:R()*5,fly:0,vx:0,vz:0,vy:0,wait:0}); }
  const pigIM=inst(pigeonGeo, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.7}), PIG, (p,m,c)=>{ m.makeTranslation(p.x,.03,p.z); c.set(0xffffff); }, false);
  let feedT=0;
  INTER.push({x:BX, z:C0.z, r:1.3, prio:.8, label:'🐟 Cho cá koi ăn (E · 2 💰)', action:()=>askPay(2, '🐟 Mua 1 gói thức ăn cho cá koi (thả từ trên cầu)', ()=>{ if(!spend(2)) return; feedT=14; S.stats && (S.stats.koi=(S.stats.koi||0)+1); save();
    burst(new THREE.Vector3(P.x+(P.x<BX?-.9:.9), .9, P.z), [0xd9b98a,0xc8a070], 40, 1.4, .5, -9, .05); toast('🐟 Cá koi và vịt đang kéo tới đớp mồi! Nhìn xuống hồ nào 😄', 3200); })});

  /* ============================== 9. NGƯỜI TRONG CÔNG VIÊN ============================== */
  const NPC=[], ACT=new Set();
  const sM=s=>W.people.pickSeed(L=>!L.female,s), sF=s=>W.people.pickSeed(L=>L.female,s);
  function person(seed, outfit, name, dot, h){ const k=W.people.kit(seed,{outfit, h}); const a=makeActor(k.gl,{name, height:k.h, face:0, clips:k.clips, compact:false, dot:dot||'#9fd36a'});
    if(k.look && k.look.width){ a.root.scale.x*=k.look.width; a.root.scale.z*=k.look.width; }
    if(LOW) a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
    a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a); const anchor=new THREE.Object3D(); anchor.position.y=k.h+.75; a.g.add(anchor);
    const o={a, po, hipsH:po.hipsHeight(), anchor, h:k.h, x:0, z:0, hd:0, bubble:null, bubbleT:0, col:{x:1e9, z:1e9, r:.3, owner:true}}; circles.push(o.col); NPC.push(o); return o; }
  function say(o,t,sec=3.2){ if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } o.bubble=makeLabel(t, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:32}); o.bubbleT=sec; }
  function put(o, y){ o.a.g.position.set(o.x, y===undefined?groundAt(o.x,o.z):y, o.z); o.a.g.rotation.set(0,o.hd,0); o.col.x=o.x; o.col.z=o.z; }
  function sitAt(o, x, y, z, rot){ o.a.g.position.set(x, y+.04-o.hipsH, z); o.a.g.rotation.set(0,rot,0); o.col.x=x; o.col.z=z; o.sitting=true; }
  // phía trước có người chơi / người khác chắn? → trả về khoảng cách theo hướng đi
  function blockedBy(x,z,hd,lat=.7,ahead=1.7,self=null){ const fx=Math.sin(hd), fz=Math.cos(hd); const obs=W.inside?[]:[[P.x,P.z]]; if(self!==walker) for(const q of [walker, dog]) if(q && q.x!==undefined) obs.push([q.x,q.z]);
    let best=null; for(const [ox,oz] of obs){ const dx=ox-x, dz=oz-z, a=dx*fx+dz*fz, s=dx*fz-dz*fx; if(a>.1 && a<ahead && Math.abs(s)<lat){ if(!best || a<best.a) best={a, s}; } } return best; }

  // 🏃 chạy bộ quanh hồ (làn trong), gặp vật cản thì giảm tốc / lách sang bên, chạy 3 vòng nghỉ giãn cơ
  const joggers=[[sM(611),{shirt:0xff6b3d, pants:0x22262e, shoe:0xffffff},'Tuấn',2.9,0],[sF(612),{shirt:0x2fd3c4, pants:0x2a2a3a, shoe:0xff5fa2},'Linh',2.55,.5]].map(([seed,of,n,sp,f])=>{
    const o=person(seed, of, `🏃 ${n} · chạy bộ`, '#ff9f43'); Object.assign(o,{s:JOG.len*f, sp, v:sp, lat:0, latT:0, laps:0, lastS:JOG.len*f, rest:0, sayCD:0, stuck:0}); const p=JOG.at(o.s); o.x=p[0]; o.z=p[1]; o.hd=p[2]; return o; });
  function updJog(o, dt, T){
    if(o.rest>0){ o.rest-=dt; o.a.play('idle'); put(o); if(vis(o)){ o.a.mixer.update(dt); o.po.apply(o.restPose, T); } if(o.rest<=0) say(o, pick(['Chạy tiếp thôi! 💪','Vòng nữa nè!','Hít sâu… thở ra…']), 2.2); return; }
    const p=JOG.at(o.s), fx=Math.sin(p[2]), fz=Math.cos(p[2]); let want=o.sp;
    const b=blockedBy(o.x,o.z,o.hd,.65,1.9);
    if(b){ o.latT = b.s>0 ? -.38 : .75; if(b.a<1.0) want=0; else want=Math.min(want, 1.2); if(o.sayCD<=0 && b.a<1.4){ say(o, pick(['Cho mình qua với nha! 🏃','Xin lỗi, nhường đường chút nha 😅','Ối, suýt đụng!']), 2.4); o.sayCD=8; } }
    else if(o.latT!==0 && !blockedBy(o.x,o.z,o.hd,.9,3.2)) o.latT=0;
    for(const q of joggers){ if(q===o) continue; const ds=((q.s-o.s)%JOG.len+JOG.len)%JOG.len; if(ds<2.4 && Math.abs(q.lat-o.lat)<.5) want=Math.min(want, q.v); }
    o.lat+=(o.latT-o.lat)*Math.min(1,dt*3); o.v+=(want-o.v)*Math.min(1,dt*(want<o.v?7:1.6)); o.s+=o.v*dt; o.sayCD-=dt;
    const q=JOG.at(o.s); o.x=q[0]+fz*o.lat; o.z=q[1]-fx*o.lat; o.hd=lerpAngle(o.hd, q[2], 1-Math.exp(-dt*10));
    if(o.v>.5){ o.a.play('run'); const ac=o.a.acts.run; if(ac) ac.timeScale=clamp(o.v/3.1,.55,1.1); } else o.a.play('idle');
    if(o.s-o.lastS>JOG.len){ o.lastS+=JOG.len; o.laps++; if(o.laps%3===0){ o.rest=8+R()*4; o.restPose=pick(['cross','present']); say(o, pick([`Xong ${o.laps} vòng hồ rồi! 😮‍💨`,'Nghỉ xíu giãn cơ đã…','Không khí công viên trong lành ghê!']), 3); } }
    put(o); if(vis(o)) o.a.mixer.update(dt); }

  // 🐕 cô Hạnh dắt chó (làn ngoài), thỉnh thoảng dừng cho chó đánh hơi; E để vuốt ve
  const walker=person(sF(621), {shirt:0xf3c6d3, pants:0x3b4a6b, shoe:0xffffff}, '🐕 Cô Hạnh · dắt chó', '#ff8fc2'); Object.assign(walker,{s:OUTL.len*.22, v:0, stop:0, stopT:14, sayCD:0});
  let dog=null, leash=null;
  try{ const gl=await new GLTFLoader().loadAsync('assets/models/Fox.glb'); const root=W.SkeletonUtils.clone(gl.scene); root.traverse(o=>{ if(o.isMesh){ o.castShadow=!LOW; o.frustumCulled=false; } });
    const g=new THREE.Group(); g.add(root); root.updateMatrixWorld(true); let bb=new THREE.Box3().setFromObject(root); root.scale.multiplyScalar(.5/(bb.max.y-bb.min.y||1)); root.updateMatrixWorld(true); bb=new THREE.Box3().setFromObject(root); root.position.y-=bb.min.y;
    g.userData.dynamic=true; scene.add(g); const mixer=new THREE.AnimationMixer(root), acts={}; for(const c of gl.animations) acts[c.name]=mixer.clipAction(c);
    const anchor=new THREE.Object3D(); anchor.position.y=.8; g.add(anchor); makeLabel('🐕 Bé Vàng', null, {fs:40, h:.22, follow:anchor, dot:'#ff8fc2', fade:24});
    dog={g, mixer, acts, cur:null, x:0, z:0, h:0, col:{x:1e9,z:1e9,r:.28,owner:true}, play(k){ if(this.cur===k || !acts[k]) return; acts[k].reset().fadeIn(.25).play(); if(this.cur && acts[this.cur]) acts[this.cur].fadeOut(.25); this.cur=k; }};
    circles.push(dog.col); if(W.BLOBSRC) W.BLOBSRC.push({o:g, s:.6});
    leash=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({color:0xc0392b})); leash.frustumCulled=false; leash.userData.dynamic=true; scene.add(leash);
    INTER.push({get x(){ return dog.x; }, get z(){ return dog.z; }, r:1.3, prio:.5, label:'🐕 Vuốt ve bé Vàng (E)', action:()=>{ burst(new THREE.Vector3(dog.x,.8,dog.z), [0xff4f6d,0xff8fc2], 24, 1.4, 1, -1, .14); say(walker, pick(['Bé tên Vàng đó, hiền lắm! 🐕','Vàng thích được gãi cằm lắm 😄','Chào bạn! Vàng vẫy đuôi kìa!']), 3); walker.stop=Math.max(walker.stop,4); }});
  }catch(e){ console.warn('park: không tải được chó', e); }
  const _hand=new THREE.Vector3(); let walkerHand=null; walker.a.g.traverse(o=>{ if(o.isBone && !walkerHand && /RightHand$/.test(o.name)) walkerHand=o; });
  function updWalker(dt, T){ const o=walker;
    if(o.stop>0){ o.stop-=dt; o.v=0; } else { o.stopT-=dt; if(o.stopT<=0){ o.stop=4+R()*3; o.stopT=16+R()*16; if(R()<.6) say(o, pick(['Vàng ơi, đi chậm thôi!','Đánh hơi gì đó con? 😄','Chiều nào cũng dắt bé ra hồ đi dạo 🐕']), 2.6); } }
    const pp=OUTL.at(o.s); let want=o.stop>0?0:1.1; const blk=blockedBy(pp[0],pp[1],pp[2],.6,1.6,walker) || (dog ? blockedBy(dog.x,dog.z,pp[2],.5,1.1,walker) : null); if(blk && want>0){ want=0; if(o.sayCD<=0){ say(o, 'Xin lỗi nha, cho cô với bé Vàng qua 😊', 2.6); o.sayCD=9; } }
    o.sayCD-=dt; o.v+=(want-o.v)*Math.min(1,dt*4); o.s+=o.v*dt; const p=OUTL.at(o.s); o.x=p[0]; o.z=p[1]; o.hd=lerpAngle(o.hd,p[2],1-Math.exp(-dt*8));
    if(o.v>.2){ o.a.play('walk'); const ac=o.a.acts.walk; if(ac) ac.timeScale=clamp(o.v/1.35,.5,1); } else o.a.play('idle'); put(o); o.a.mixer.update(dt);
    if(dog){ const q=OUTL.at(o.s+1.45), fx=Math.sin(q[2]), fz=Math.cos(q[2]); const tx=q[0]+fz*.25, tz=q[1]-fx*.25, dx=tx-dog.x, dz=tz-dog.z, d=Math.hypot(dx,dz);
      if(d>4){ dog.x=tx; dog.z=tz; } else if(d>.05){ const sp=Math.min(d*3, 2.4); dog.x+=dx/d*sp*dt; dog.z+=dz/d*sp*dt; dog.h=lerpAngle(dog.h, Math.atan2(dx,dz), 1-Math.exp(-dt*8)); }
      dog.play(o.v>.2 && d>.08 ? 'Walk' : 'Survey'); dog.g.position.set(dog.x, groundAt(dog.x,dog.z), dog.z); dog.g.rotation.y=dog.h; dog.mixer.update(dt); dog.col.x=dog.x; dog.col.z=dog.z;
      if(leash){ if(walkerHand) walkerHand.getWorldPosition(_hand); else _hand.set(o.x, 1, o.z); const a=leash.geometry.attributes.position; a.setXYZ(0,_hand.x,_hand.y,_hand.z); a.setXYZ(1,dog.x+Math.sin(dog.h)*.18,.36,dog.z+Math.cos(dog.h)*.18); a.needsUpdate=true; } } }
  { const p=OUTL.at(walker.s); walker.x=p[0]; walker.z=p[1]; walker.hd=p[2]; if(dog){ const q=OUTL.at(walker.s+1.45); dog.x=q[0]; dog.z=q[1]; } }

  // 🛝 trẻ con: bé Na đu xích đu, bé Bin leo cầu trượt → trượt → chơi thú nhún; mẹ đứng trông
  const kidA=person(sF(631), {shirt:0xff8fc2, pants:0xffd23f, shoe:0xffffff}, '👧 Bé Na', '#ffd23f', 1.12);
  const kidB=person(sM(632), {shirt:0x4fc3ff, pants:0x2a3a5a, shoe:0xff4f6d}, '👦 Bé Bin', '#ffd23f', 1.2);
  const mom=person(sF(633), {shirt:0xffffff, pants:0x6b8cff, shoe:0x222222}, '👩 Mẹ bé Na · Bin', '#ffd23f'); mom.x=185.75; mom.z=46.75; mom.hd=dg(150);
  const LAD={x:PLAY.slide.lx-.38, z:PLAY.slide.lz}, RID=PLAY.rider, S2=PLAY.slide;
  // lộ trình của bé Bin (đi vòng, không xuyên cầu trượt / xích đu)
  const ROUTE={ toRider:[[S2.x1+.35,S2.lz+.75],[RID.x+.1,RID.z-.62]], toLadderR:[[RID.x-.75,RID.z+.15],[189.65,45.45],[LAD.x,LAD.z]], toLadderS:[[S2.x1+.35,S2.lz+.75],[192.6,46.2],[190.5,46.2],[189.65,45.45],[LAD.x,LAD.z]] };
  Object.assign(kidB,{st:'walk', t:0, x:189.65, z:45.45, hd:0, way:[[LAD.x,LAD.z]], then:'climb'});
  const vis=o=>o.a.g.visible && o.a.root.visible;
  function walkTo(o, x, z, dt, sp=1.3){ const dx=x-o.x, dz=z-o.z, d=Math.hypot(dx,dz); if(d<.06){ o.x=x; o.z=z; return true; } const k=Math.min(d, sp*dt); o.x+=dx/d*k; o.z+=dz/d*k; o.hd=lerpAngle(o.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*10)); return false; }
  function updKids(dt, T){ const sw=PLAY.swings;
    // xích đu: bé Na đu chiếc 1 · chiếc 2 đứng yên (bạn ngồi được)
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
      if(k>=1){ b.st='slide'; b.t=0; if(R()<.6) say(b, pick(['Trượt nè! 🛝','Wheee~','Mẹ nhìn con nè!']), 2); } }
    else if(b.st==='slide'){ const k=Math.min(1,b.t/1.25); b.x=S2.x0+(S2.x1-S2.x0)*k; b.z=S2.lz; b.hd=Math.PI/2; b.a.play('idle');
      b.a.g.position.set(b.x, S2.top+(.2-S2.top)*k+.05-b.hipsH*.62, b.z); b.a.g.rotation.set(0,b.hd,0); b.col.x=b.x; b.col.z=b.z; pose='sit';
      if(k>=1){ b.x=S2.x1+.1; if(R()<.5){ b.way=ROUTE.toRider.map(p=>p.slice()); b.then='ride'; } else { b.way=ROUTE.toLadderS.map(p=>p.slice()); b.then='climb'; } b.st='walk'; b.t=0; } }
    else if(b.st==='ride'){ const k=Math.sin(b.t*5)*.18; RID.body.rotation.z=k; b.hd=Math.PI/2; b.a.play('idle'); b.a.g.position.set(RID.x-.06, .66+.04-b.hipsH, RID.z); b.a.g.rotation.set(0,b.hd,k*.6); b.col.x=RID.x; b.col.z=RID.z; pose='sit';
      if(b.t>6){ RID.body.rotation.z=0; b.x=RID.x+.1; b.z=RID.z-.62; b.way=ROUTE.toLadderR.map(p=>p.slice()); b.then='climb'; b.st='walk'; b.t=0; } }
    if(vis(b)){ b.a.mixer.update(dt); if(pose) b.po.apply(pose, T); } }

  // 💪 các cụ tập thể dục
  const gymBots=[[GYM[0], person(sM(641), {shirt:0xffffff, pants:0x2a3a5a, long:true, shoe:0x222222}, '👴 Ông Sáu · tập thể dục', '#46d39a')], [GYM[1], person(sF(642), {shirt:0xc94f7c, pants:0x222222, long:true, shoe:0x222222}, '👵 Bà Tư · tập thể dục', '#46d39a')]];
  for(const [m,o] of gymBots) m.busy=o;
  function updGym(dt, T){ for(const m of GYM){ m.t+=dt; const on=!!m.busy; m.anim(m.t, on); }
    for(const [m,o] of gymBots){ if(m.busy!==o) continue; o.x=m.ux; o.z=m.uz; o.hd=m.face+(m.twist?Math.sin(m.t*2.6)*.6:0); o.a.play(m.clip); put(o, m.uy); if(vis(o)){ o.a.mixer.update(dt); if(m.arms) o.po.apply('present', T); }
      if(R()<dt*.02) say(o, pick(['Tập thể dục mỗi chiều, khoẻ re! 💪','Sống lâu trăm tuổi nhờ đi bộ đó cháu!','Một, hai, ba, bốn…']), 2.8); } }

  // ♟️ hai cụ đánh cờ
  const chessBots=[person(sM(651), {shirt:0xd9c7a1, pants:0x3a3a3a, long:true, shoe:0x222222}, '👴 Ông Ba · đánh cờ', '#c7d2e0'), person(sM(652), {shirt:0x7a9cc6, pants:0x2a2a2a, long:true, shoe:0x222222}, '👴 Ông Năm · đánh cờ', '#c7d2e0')];
  let chessT=6, chessTurn=0;
  const CHESS_L=[['Chiếu tướng! 😤','Khoan, khoan… để tôi tính đã.'],['Ăn xe nè!','Trời ơi, sơ hở rồi!'],['Đi pháo đầu!','Thì tôi lên mã.'],['Ván này ông thua chắc!','Chưa biết đâu nha ông Ba!'],['Hết cờ rồi, ván mới!','Ván này tôi gỡ lại!']];
  function chessWatch(){ const [a,b]=chessBots; say(a, pick(['Ngồi xem đi cháu, ván này căng lắm!','Cháu biết đánh cờ tướng không?','Xem kỹ nước này nè cháu!']), 3); setTimeout(()=>say(b, pick(['Đừng mách nước nha cháu 😄','Ông Ba đánh hay lắm đó!']), 3), 1600); }
  function updChess(dt, T){ CHESS.stools.slice(0,2).forEach((st,i)=>{ const o=chessBots[i]; sitAt(o, st.x, .45, st.z, st.rot); o.a.play('idle'); if(!vis(o)) return; o.a.mixer.update(dt); o.po.apply('sit', T); if(chessTurn===i && (T*.5+i*2)%7<1.2) o.po.apply('present', T); });
    chessT-=dt; if(chessT<=0){ const l=pick(CHESS_L); say(chessBots[chessTurn], l[0], 3); const other=chessBots[1-chessTurn]; setTimeout(()=>say(other, l[1], 3), 1700); chessTurn=1-chessTurn; chessT=10+R()*10; } }

  // 🍦 người bán kem · 🧃 chị bán nước
  const icecream={o:person(sM(661), {shirt:0xff6b8a, pants:0x2a2a2a, shoe:0x222222, style:'cap'}, '🍦 Anh Phát · bán kem', '#ff6b8a')}; icecream.o.x=CART.x; icecream.o.z=CART.z-.85; icecream.o.hd=0;
  const kiosk={o:person(sF(662), {shirt:0x2a9d8f, pants:0x222222, shoe:0x222222}, '🧃 Chị Mai · quầy nước', '#2a9d8f')}; kiosk.o.x=210.85; kiosk.o.z=65.45; kiosk.o.hd=Math.PI;
  function updVendors(dt, T){ for(const [v,lines] of [[icecream.o,['Kem đây! Kem mát lạnh đây! 🍦','Kem dừa ngon nhất công viên nè!']],[kiosk.o,['Trà đá, nước mía đây!','Nước dừa tươi mát lạnh nè!']]]){ v.a.play('idle'); put(v); if(vis(v)){ v.a.mixer.update(dt); if(((T*.15+v.x)%9)<1.8) v.po.apply('present', T); } if(R()<dt*.025) say(v, pick(lines), 2.6); } }

  /* ---------- khách quán: mua nước ở quầy → ra ghế đá ven hồ ngồi (js/cafe.js) ---------- */
  { const groups=cafeBenches.map(bn=>({seats:bn.seats, table:{x:bn.x, z:bn.z, y:.47}, bn}));
    const apKey=(x,z)=>`${x.toFixed(2)},${z.toFixed(2)}`, AP=new Map();
    for(const g of groups) for(let i=0;i<2;i++){ const s=g.seats[i], ap={x:s.x-Math.sin(s.rot)*.6, z:s.z-Math.cos(s.rot)*.6}, side=i?1:-1, bn=g.bn;
      const front=[bn.x+bn.f[0]*.8+bn.r[0]*side*1.35, bn.z+bn.f[1]*.8+bn.r[1]*side*1.35], back=[bn.x-bn.f[0]*.6+bn.r[0]*side*1.35, bn.z-bn.f[1]*.6+bn.r[1]*side*1.35];
      AP.set(apKey(ap.x,ap.z), {li:MID.near(front[0],front[1]), pts:[front, back]}); }
    const SE_IN=[[seB[0],seB[1]+.6],[seB[0]-(seB[0]-seA[0])*.5, seB[1]-(seB[1]-seA[1])*.5]], SE_LI=MID.near(seA[0],seA[1]);
    const ORDER={x:210.85, z:63.55};
    if(!W.CAFES) W.CAFES=[];
    const C={name:'Quầy nước Bên Hồ', center:{x:199, z:54}, max:3, groups, drinks:['trà đá','nước mía','nước dừa','sữa đậu nành','cà phê muối'],
      spawn:{x:208.6, z:64.2}, entry:[[209.4,63.9]],
      order:()=>({x:ORDER.x, z:ORDER.z, face:0}),
      via:(ap)=>{ const a=AP.get(apKey(ap.x,ap.z)); if(!a) return []; return [...SE_IN, ...MID.walk(SE_LI, a.li), ...a.pts.map(p=>p.slice())]; },
      talks:[[[0,'Hồ này chiều gió mát ghê!'],[1,'Ừ, ngồi nhìn cá koi bơi là hết stress 😌'],[0,'Mai tan làm lại ra đây nha.']],
             [[1,'Nghe nói giữa cầu cho cá ăn được đó.'],[0,'Thật hả? Lát ra thử, 2 xu một gói thôi!'],[1,'Mấy con koi đỏ to lắm 🐟']],
             [[0,'Công viên này mới làm đẹp quá ha.'],[1,'Có cả máy bán nước tự động, tiện ghê!'],[0,'Tối lên đèn lồng nhìn lung linh lắm ✨']],
             [[1,'Nhìn mấy cụ đánh cờ vui ghê.'],[0,'Ông Ba thắng 3 ván liền rồi đó 😆']]]};
    C.live=[]; C.active=false; C.spawnT=0;   // cafe.js chỉ khởi tạo quán có sẵn lúc nạp → tự khởi tạo
    W.CAFES.push(C); out.cafe=C; }

  /* ============================== 10. TẬP THỂ DỤC (người chơi) ============================== */
  let ex=null; const mePoser=makePoser(THREE, W.me);
  function startEx(m){ if(W.inside || HOOK.vehicle) return; if(m.busy && m.busy!=='me') return toast(`💪 ${m.busy.a ? 'Có người' : 'Có người'} đang tập ${m.name} – chờ chút hoặc chọn máy khác nhé!`, 2600);
    m.busy='me'; m.t=0; ex={m, t:0, dur:8};
    const ctrl={ drive(dt, inp){ if(!ex || HOOK.vehicle!==ctrl) return; if(inp.ix||inp.iz){ stopEx(false); return; }
        if(ex.t>.1 && Math.hypot(P.x-m.ux,P.z-m.uz)>1.2){ m.busy=null; HOOK.vehicle=null; ex=null; return; }   // bị dịch chuyển (bản đồ / taxi) → thôi tập, giữ nguyên chỗ mới
        ex.t+=dt; P.x=m.ux; P.z=m.uz; P.y=m.uy; P.face=m.face+(m.twist?Math.sin(ex.t*2.6)*.6:0); P.vx=P.vz=0;
        W.me.g.position.set(m.ux, m.uy, m.uz); W.me.g.rotation.set(0,P.face,0); W.me.play(m.clip==='walk'?'walk':'idle');
        if(ex.t>=ex.dur) stopEx(true); } };
    HOOK.vehicle=ctrl; ex.ctrl=ctrl; toast(`💪 Đang tập ${m.name}… (phím di chuyển để dừng)`, 2200); }
  function stopEx(done){ if(!ex) return; const m=ex.m; m.busy=null; if(HOOK.vehicle===ex.ctrl) HOOK.vehicle=null; P.x=m.inter.x; P.z=m.inter.z; P.px=P.x; P.pz=P.z; P.y=groundAt(P.x,P.z); P.vx=P.vz=0; ex=null;
    if(done){ S.buffs=S.buffs||{}; S.buffs.energy=Math.max(Date.now(), S.buffs.energy||0)+3*60000; save(); burst(new THREE.Vector3(P.x,1.6,P.z), [0x46d39a,0xffd23f], 30, 1.6, 1.2, -2, .12); toast('💪 Xong 1 hiệp! Người khoẻ re: +3 phút chạy nhanh ⚡', 2800); } }

  /* ============================== 11. MUA NƯỚC / KEM ============================== */
  function openShop(title, items, after){ const m=ui.modal(title), grid=document.createElement('div'); grid.className='grid';
    for(const it of items){ const [n,price,buff,min,desc]=it; const c=document.createElement('div'); c.className='card'; c.style.cursor='pointer';
      c.innerHTML=`<b>${n}</b><small>${desc}</small><div class="row" style="margin-top:auto"><span class="price">${fmt(price)} 💰</span></div>`;
      c.onclick=()=>{ m.close(); askPay(price, `${n} – ${desc}`, ()=>{ if(!spend(price)) return; if(buff){ S.buffs=S.buffs||{}; S.buffs[buff]=Math.max(Date.now(), S.buffs[buff]||0)+min*60000; } S.stats && (S.stats.drinks=(S.stats.drinks||0)+1); save();
        toast(`${n} – ngon tuyệt! ${buff?desc:'Mát cả người 😌'}`, 3200); if(after) after(it); }); };
      grid.appendChild(c); }
    m.body.innerHTML='<p class="muted">Chọn món – xác nhận trước khi trả tiền. Hiệu ứng (chạy nhanh / thưởng quiz) cộng dồn thời gian.</p>'; m.body.appendChild(grid); }
  function dropCan(V){ V.can.visible=true; V.t=1.6; V.can.position.set(V.x+.2,.42,V.z-.42); burst(new THREE.Vector3(V.x,.5,V.z-.5), [0xffffff,0x8fd3ff], 12, .8, .5, -6, .06); }

  /* ============================== 12. ÂM THANH NỀN (chim hót ban ngày · dế kêu ban đêm) ============================== */
  const AU={ctx:null, out:null, next:0};
  const sfxOn=()=>{ try{ return localStorage.getItem('qcworld-sfx')!=='0'; }catch(e){ return true; } };
  function audio(vol){ if(!sfxOn() || vol<=0){ if(AU.out) AU.out.gain.setTargetAtTime(0, AU.ctx.currentTime, .3); return; }
    if(!AU.ctx){ if(!(navigator.userActivation && navigator.userActivation.hasBeenActive)) return; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; AU.ctx=new AC(); AU.out=AU.ctx.createGain(); AU.out.gain.value=0; AU.out.connect(AU.ctx.destination); }
    const c=AU.ctx; if(c.state==='suspended') c.resume(); AU.out.gain.setTargetAtTime(vol, c.currentTime, .4); if(AU.next>c.currentTime+.3) return;
    const t=c.currentTime+.05;
    if(night()<.5){ const n=2+Math.floor(R()*4), f0=2600+R()*1800; for(let i=0;i<n;i++){ const o=c.createOscillator(), g=c.createGain(), s=t+i*.11; o.type='sine'; o.frequency.setValueAtTime(f0,s); o.frequency.exponentialRampToValueAtTime(f0*(1.3+R()*.4),s+.07); g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(.05,s+.015); g.gain.exponentialRampToValueAtTime(.001,s+.09); o.connect(g); g.connect(AU.out); o.start(s); o.stop(s+.1); } AU.next=t+1.2+R()*3.2; }
    else { for(let i=0;i<6;i++){ const o=c.createOscillator(), g=c.createGain(), s=t+i*.06; o.type='triangle'; o.frequency.value=4300+R()*200; g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(.025,s+.01); g.gain.exponentialRampToValueAtTime(.001,s+.045); o.connect(g); g.connect(AU.out); o.start(s); o.stop(s+.05); } AU.next=t+.8+R()*1.6; } }

  /* ============================== 13. KHUNG HÌNH ============================== */
  const ALL=[...NPC];
  let active=false, nearT=0;
  const FISHIM=[koiIM, duckIM, pigIM].filter(Boolean); for(const im of FISHIM) im.frustumCulled=false;
  function setActive(on){ active=on; for(const o of ALL){ o.a.g.visible=on; if(!on){ o.col.x=1e9; if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } } } if(dog){ dog.g.visible=on; if(!on) dog.col.x=1e9; } if(leash) leash.visible=on; for(const im of FISHIM) im.visible=on; }
  setActive(false);
  // người / chó ở xa camera (> 60 m máy yếu, 85 m máy khoẻ) thì không vẽ, không chạy xương → đỡ lượt vẽ + CPU
  const NPC_FAR=(LOW?60:85)**2, _cp=new THREE.Vector3();
  function cullNPC(){ const c=W.camera.position; for(const o of ALL){ const v=(o.a.g.position.x-c.x)**2+(o.a.g.position.z-c.z)**2<NPC_FAR; if(o.a.g.visible!==v) o.a.g.visible=v; }
    if(dog){ dog.g.visible=(dog.x-c.x)**2+(dog.z-c.z)**2<NPC_FAR; if(leash) leash.visible=dog.g.visible; } }
  const _mm=new THREE.Matrix4(), _qq=new THREE.Quaternion(), _ss=new THREE.Vector3(1,1,1), _pp=new THREE.Vector3();
  function swim(list, dt, T, im, y, feed, upd){ for(const f of list){ let tx=f.tx, tz=f.tz;
      if(feed){ const side=(P.x<BX?-1:1); tx=BX+side*(1.6+(f.ph%1)*1.2); tz=C0.z+((f.ph*7)%2-1)*1.4; }
      const dx=tx-f.x, dz=tz-f.z, d=Math.hypot(dx,dz);
      if(d<.3 && !feed){ const p=rndWater(); f.tx=p[0]; f.tz=p[1]; }
      const sp=f.sp*(feed?2.4:1); if(d>.05){ f.h=lerpAngle(f.h, Math.atan2(dx,dz), 1-Math.exp(-dt*(feed?3:1.2))); f.x+=Math.sin(f.h)*sp*dt; f.z+=Math.cos(f.h)*sp*dt; }
      if(!inLakeN(f.x,f.z,.8)){ f.x-=Math.sin(f.h)*sp*dt*2; f.z-=Math.cos(f.h)*sp*dt*2; const p=rndWater(); f.tx=p[0]; f.tz=p[1]; }
      upd(f, T); }
    list.forEach((f,i)=>{ _qq.setFromAxisAngle(_v.set(0,1,0), f.yaw ?? f.h); _mm.compose(_pp.set(f.x, f.y ?? y, f.z), _qq, _ss); im.setMatrixAt(i,_mm); }); im.instanceMatrix.needsUpdate=true; }
  HOOK.onFrame.push((dt, T)=>{
    swayU.value=T; waterMat.normalMap.offset.set(T*.012, T*.007);
    strM.emissiveIntensity=night()*2.6;
    if(ex && HOOK.vehicle!==ex.ctrl){ ex.m.busy=null; ex=null; }
    if(ex) HOOK.vehicleInter=()=>({label:`💪 Đang tập ${ex?ex.m.name:''} – E để dừng`, action:()=>stopEx(false)});
    for(const V of VEND){ if(V.t>0){ V.t-=dt; if(V.t<=0) V.can.visible=false; } }
    nearT-=dt; if(nearT<=0){ nearT=.5; const d=W.inside?1e9:Math.hypot(P.x-OX, P.z-OZ); if(!active && d<92) setActive(true); else if(active && d>110) setActive(false); audio(!W.inside && d<45 ? clamp(1-(d-12)/33,0,1)*.6 : 0); if(active) cullNPC(); }
    if(!active) return;
    dt=Math.min(dt,.1);
    for(const o of ALL) if(o.bubble){ o.bubbleT-=dt; if(o.bubbleT<=0){ removeLabel(o.bubble); o.bubble=null; } }
    joggers.forEach(o=>updJog(o, dt, T)); updWalker(dt, T); updKids(dt, T); updGym(dt, T); updChess(dt, T); updVendors(dt, T);
    feedT-=dt; const feed=feedT>0 && Math.abs(P.x-BX)<1.4 && P.z>bz0 && P.z<bz1;
    if(koiIM) swim(KOI, dt, T, koiIM, .085, feed, (f,T)=>{ f.yaw=f.h+Math.sin(T*6+f.ph)*.18; });
    if(duckIM) swim(DUCK, dt, T, duckIM, .15, feed && feedT>4, (f,T)=>{ f.yaw=f.h; f.y=.13+Math.sin(T*1.7+f.ph)*.012; });
    if(pigIM){ PIG.forEach((p,i)=>{ const dP=Math.hypot(P.x-p.x,P.z-p.z), fast=(P.speed||0)>2;
        if(p.fly>0){ p.fly-=dt; p.x+=p.vx*dt; p.z+=p.vz*dt; p.y=Math.max(0,p.y+p.vy*dt); p.vy-=dt*.6; if(p.fly<=0){ const [x,z]=pigSpot(); p.x=x; p.z=z; p.y=0; p.vy=0; p.wait=3+R()*6; } }
        else if(dP<(fast?3.6:2.0) && p.wait<=0){ const a=Math.atan2(p.x-P.x, p.z-P.z)+(R()-.5); p.vx=Math.sin(a)*4; p.vz=Math.cos(a)*4; p.vy=3.2; p.fly=2.2; p.h=a; }
        else { p.wait-=dt; p.peck-=dt; if(p.peck<0){ p.peck=1+R()*3; p.h+=(R()-.5)*1.5; } const step=(p.peck%1<.4)?.12*dt:0; p.x+=Math.sin(p.h)*step; p.z+=Math.cos(p.h)*step; }
        const pitch=p.fly>0?0:(Math.sin(T*9+i)>.6?.5:0); _qq.setFromEuler(_e.set(pitch,p.h,0,'YXZ')); _mm.compose(_pp.set(p.x,.03+p.y,p.z), _qq, _ss); pigIM.setMatrixAt(i,_mm); }); pigIM.instanceMatrix.needsUpdate=true; }
  });

  /* ============================== 14. BẢN ĐỒ + NHÃN ============================== */
  makeLabel('🌳 Công viên Trung tâm · Hồ Ngọc', 'Hồ cá koi · cầu gỗ · ghế đá · sân chơi · thể dục · máy bán nước', {h:.75, x:199, y:5.2, z:43.2, fade:95});
  PLACES.push({icon:'🌳', name:'Công viên Trung tâm', sub:'Giữa Downtown: hồ cá koi, cầu gỗ vòm, ghế đá, sân chơi, thể dục, máy bán nước tự động', go:()=>teleport(199, 42.2, 199, 52)});
  try{ const TD=ctx.transit && ctx.transit.TAXI_DEST; if(TD) TD.push({icon:'🌳', name:'Công viên Trung tâm', x:199, z:39}); }catch(e){}

  KO.build(); KG.build();
  out.npc=NPC.length; out.instanced=IMS.length; out.lake={C0, LA, LB, bz0, bz1, zN, zS};
  out.audit=()=>({conflicts:out.conflicts, trees:out.trees, planters:out.planters, npc:NPC.length, seats:SEATLIST.length});
  out.TREES=TREES; out.lanterns=LANT; out.joggers=joggers; out.walker=walker; out.dog=dog; out.GYM=GYM; out.VEND=VEND; out.kids=[kidA,kidB,mom]; out.setActive=setActive; out.lane={JOG, MID, OUTL};
  if(out.conflicts.length) console.info('[park] chồng lấn:', out.conflicts);
  return out;
}
