// QC World V2 – PHA 4: RIVER TECH CBD (x 180→580 · z −120→460) – phiên qc-park, 15/11/2026 (theo QC_WORLD_V2_MASTER_BIBLE – Phần 2.1–2.2, Module 4)
//  • Đô thị lấn sông: sông chính dọc z = 110 (rộng 36 m) + 2 kênh đào Bắc–Nam ở x = 365 và x = 510 (rộng 24 m) → 6 ô đảo bồi, cao độ mặt đất +0,6
//  • Kè đá granite + lan can LED vàng kim, đường dạo ven sông trồng liễu, đèn lồng đỏ dọc kè, nhạc nước trên sông (ban đêm đổi màu)
//  • Lưới đại lộ khép kín (không đường cụt): đại lộ ven sông 24 m, đường vành đai 20 m (2 làn ô tô + 1 làn xe máy mỗi chiều), vỉa hè 5 m
//  • 12 cây cầu độc bản: 2 cầu vòm thép đỏ qua sông · 8 cầu đá qua kênh · cầu kính 2 tầng · cầu đi bộ phát sáng
//  • 5 trụ sở biểu tượng (ngoại thất ở đây, nội thất đi bộ vào được ở js/bigtech_interiors.js) · 4 tháp căn hộ Beijing Starlight 28 tầng
//  • Bệnh viện · Trạm cứu hoả Thủy–Bộ · Trường học · Trung tâm Việc làm · danh sách `towers` cho jobs/work (phỏng vấn · thẻ nhân viên · đi làm)
import * as AK from './archKit.js';
import { makeInteriors } from './bigtech_interiors.js';

export async function make(W, ctx){
  const {THREE, scene, circles, boxes, plats, INTER, PLACES, HOOK, P, toast, makeLabel, teleport, mergeGeometries, addSeg, addPlat, GLOW, EXTL} = W;
  const {S, save, ui, askPay, spend, fmt} = ctx;
  const Z=ctx.zone||{x0:180, x1:580, z0:-120, z1:460}, Y=2,   /* cao độ mặt đất +2 = cao độ cổng nối vùng (V2_PLAN 2b) */ LOW=W.QUAL==='low', TAU=Math.PI*2, R=Math.random;
  const rng=AK.rng(4115), pick=a=>a[Math.floor(R()*a.length)], clamp=(v,a,b)=>v<a?a:v>b?b:v;
  AK.bindNight(W);
  const out={towers:[], hq:{}};

  /* ============================== 0. QUY HOẠCH (toạ độ dùng chung) ============================== */
  const RIV={z0:92, z1:128}, CAN=[{x0:353, x1:377}, {x0:498, x1:522}];
  const XC=[[Z.x0,CAN[0].x0],[CAN[0].x1,CAN[1].x0],[CAN[1].x1,Z.x1]], ZR=[[Z.z0,RIV.z0],[RIV.z1,Z.z1]];
  const PARC=[]; for(const [z0,z1] of ZR) for(const [x0,x1] of XC) PARC.push({x0,x1,z0,z1});
  const onLand=(x,z,pad=0)=>PARC.some(p=>x>p.x0+pad && x<p.x1-pad && z>p.z0+pad && z<p.z1-pad);
  // đường (lòng đường; vỉa hè 5 m mỗi bên): E–W & N–S
  const SW=5, ROADS=[{ew:true, c:-100, w:20, a:188, b:572, name:'Đường Bắc CBD'}, {ew:true, c:66, w:24, a:188, b:572, name:'Đại lộ Ven Sông'}, {ew:true, c:236, w:24, a:188, b:572, name:'Đại lộ Quốc Mậu'}, {ew:true, c:440, w:20, a:188, b:572, name:'Đường Nam CBD'},
    {ew:false, c:198, w:20, a:-110, b:450, name:'Đường Tây CBD'}, {ew:false, c:562, w:20, a:-110, b:450, name:'Đường Đông CBD'},
    // đoạn ra 4 cổng nối vùng (V2_PLAN 2b): G1 Tây (180,0) → Abyssal · G4 Đông (580,86) → đèo Brain · G5 Bắc (380,−120) → Dev City · G7 Nam (450,460) → Palm
    {ew:true, c:0, w:20, a:180, b:188, name:'Cổng Tây · đi Abyssal', gate:'G1'}, {ew:true, c:80, w:20, a:572, b:580, name:'Cổng Đông · đèo Brain Citadel', gate:'G4'},
    {ew:false, c:388, w:20, a:-120, b:-110, name:'Cổng Bắc · đi Dev City', gate:'G5'}, {ew:false, c:450, w:20, a:450, b:460, name:'Cổng Nam · đi Palm Dubai', gate:'G7'}];
  const rr=r=>r.ew ? {x0:r.a, x1:r.b, z0:r.c-r.w/2, z1:r.c+r.w/2} : {x0:r.c-r.w/2, x1:r.c+r.w/2, z0:r.a, z1:r.b};
  const onRoad=(x,z,pad=0)=>ROADS.some(r=>{ const q=rr(r); return x>q.x0-pad && x<q.x1+pad && z>q.z0-pad && z<q.z1+pad; });
  const inWaterBand=(x,z)=>(z>RIV.z0 && z<RIV.z1) || CAN.some(c=>x>c.x0 && x<c.x1);
  // cầu: {x0,x1,z0,z1, kind, name} – mặt cầu bằng cao độ đất (đi thẳng qua), lan can 2 mép
  const BR=[];
  // đoạn đường nối cổng (gate) không dựng cầu: trước đây sinh 2 cầu vòm đỏ thừa qua sông (x 373–403, 435–465 – đầu vòm chạm đất ở z≈129) + 4 cầu đá thừa qua kênh
  for(const r of ROADS) if(r.ew && !r.gate) for(const c of CAN) BR.push({x0:c.x0-1, x1:c.x1+1, z0:r.c-r.w/2-SW, z1:r.c+r.w/2+SW, ew:true, kind:'stone', name:`Cầu ${r.name} qua kênh ${c.x0<400?'Đông Hoa':'Tây Hoa'}`});
  for(const r of ROADS) if(!r.ew && !r.gate) BR.push({x0:r.c-r.w/2-SW, x1:r.c+r.w/2+SW, z0:RIV.z0-1, z1:RIV.z1+1, ew:false, kind:'arch', name:`Cầu Vòm Đỏ ${r.c<300?'Tây':'Đông'}`});
  BR.push({x0:276, x1:284, z0:RIV.z0-1, z1:RIV.z1+1, ew:false, kind:'glass', name:'Cầu Kính Hai Tầng'});
  BR.push({x0:437, x1:443, z0:RIV.z0-1, z1:RIV.z1+1, ew:false, kind:'glow', name:'Cầu Ánh Sáng'});
  const onBridge=(x,z,pad=0)=>BR.some(b=>x>b.x0-pad && x<b.x1+pad && z>b.z0-pad && z<b.z1+pad);
  const CUTS=[{x0:247.5, x1:332.5, z0:122, z1:129}, {x0:179, x1:181, z0:250, z1:262},
    {x0:179, x1:181, z0:-15, z1:15}, {x0:579, x1:581, z0:65, z1:95}, {x0:377, x1:399, z0:-121, z1:-119}, {x0:439, x1:461, z0:459, z1:461}];   // khe lan can kè ở 4 cổng nối vùng   // sàn Silicon Forest lấn mép sông Nam · đầu cầu sang Sân bay (skyport.js)   // sàn Silicon Forest lấn ra mép sông Nam: không dựng lan can kè đoạn này
  out.layout={PARC, ROADS, BR, RIV, CAN, Y};

  /* ============================== 1. TIỆN ÍCH DỰNG HÌNH (gộp theo vật liệu) ============================== */
  const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3();
  function Kit(ox, oz, cast=true){ const parts=new Map();
    return { add(geo, mat, x=0,y=0,z=0, ry=0, rx=0, rz=0, sx=1,sy=1,sz=1){ const g=geo.index?geo.toNonIndexed():geo.clone();
        for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal' && k!=='uv') g.deleteAttribute(k);
        if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
        g.clearGroups(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m4.compose(_v.set(x-ox,y,z-oz), _q, _s.set(sx,sy,sz)); g.applyMatrix4(_m4);
        if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); return g; },
      build(parent=scene){ const res=[]; for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.position.set(ox,0,oz); ms.castShadow=cast; ms.receiveShadow=true; parent.add(ms); res.push(ms); } parts.clear(); return res; } }; }
  const ctex=(w,h,draw,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; } return t; };
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), CY=(a,b,h,n=12)=>new THREE.CylinderGeometry(a,b,h,n), RB=AK.roundedBox;
  const NIGHT=[]; const night=(m,base,k)=>{ NIGHT.push({m,base,k}); m.emissiveIntensity=base; return m; };
  const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.6}, o));
  // vật liệu
  const M={
    stone: AK.makeStoneMaterial({col:'#cfc7b8', joint:'#8f877a', blockW:128, blockH:64, seed:41}),
    granite: AK.makeStoneMaterial({col:'#b7b3ab', joint:'#6f6b64', blockW:160, blockH:80, seed:42, rough:.6}),
    wood: AK.makeWoodMaterial({col:'#8a5a32', plank:36, seed:43}),
    cedar: AK.makeWoodMaterial({col:'#b07a48', plank:30, seed:44}),
    asphalt: null, pave: null, line: std(0xf4f2ec,{roughness:.5, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3}), yellow: std(0xf2c230,{roughness:.5, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3}),
    steel: std(0xd5dbe2,{roughness:.2, metalness:1}), dark: std(0x262a31,{roughness:.5, metalness:.4}), red: std(0xc8102e,{roughness:.4, metalness:.3}), white: std(0xf2f4f5,{roughness:.55}),
    glass: new THREE.MeshPhysicalMaterial({color:0x9fc6dd, roughness:.05, metalness:.15, transparent:true, opacity:.38, depthWrite:false, side:THREE.DoubleSide, envMapIntensity:1.6}),
    glassD: std(0x2c4a5e,{roughness:.08, metalness:.75, envMapIntensity:1.6}), silver: std(0xc8cdd3,{roughness:.25, metalness:.9}), lawn: std(0x6f9a4a,{roughness:1}),
    gold: night(std(0xffcc55,{emissive:0xffc040, roughness:.4}), .25, 2.2), ledC: night(std(0x7fe7ff,{emissive:0x40d8ff, roughness:.4}), .15, 2.6), ledR: night(std(0xff3355,{emissive:0xff2040, roughness:.4}), .15, 2.4),
    ledG: night(std(0x8dff9a,{emissive:0x5cff6a, roughness:.4}), .25, 2.4), curb: std(0xd7d3ca,{roughness:.8}),
  };
  M.asphalt=new THREE.MeshStandardMaterial({map:ctex(256,256,(g,w,h)=>{ g.fillStyle='#34363b'; g.fillRect(0,0,w,h); for(let i=0;i<6000;i++){ const v=36+R()*44|0; g.fillStyle=`rgba(${v},${v},${v+4},.55)`; g.fillRect(R()*w,R()*h,1.6,1.6); } }, true), roughness:.92, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2});
  M.pave=new THREE.MeshStandardMaterial({map:ctex(256,256,(g,w,h)=>{ g.fillStyle='#9d968a'; g.fillRect(0,0,w,h); const t=32; for(let y=0;y<h;y+=t) for(let x=(Math.floor(y/t)%2)*t/2-t;x<w;x+=t){ const v=168+R()*26|0; g.fillStyle=`rgb(${v},${v-6},${v-16})`; g.fillRect(x+1,y+1,t-2,t-2); } }, true), roughness:.85});
  const uvWorld=(g, sc=.25)=>{ const p=g.attributes.position, uv=g.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i, p.getX(i)*sc, p.getZ(i)*sc); return g; };

  /* ============================== 2. ĐẤT BỒI + KÈ ĐÁ + LAN CAN LED ============================== */
  EXTL.push({x0:Z.x0, x1:Z.x1, z0:Z.z0, z1:Z.z1, name:'River Tech CBD', h:(x,z)=>(onLand(x,z) || onBridge(x,z)) ? Y : null});
  // mặt nước sông + kênh + biển quanh khu (nằm dưới các khối đất – chỉ lộ ra ở lòng sông/kênh)
  { const wN=W.TX && W.TX.waterN ? W.TX.waterN.clone() : null; if(wN){ wN.wrapS=wN.wrapT=THREE.RepeatWrapping; wN.repeat.set(40,56); wN.needsUpdate=true; }
    const wm=new THREE.MeshStandardMaterial({color:0x1f6f86, roughness:.08, metalness:.25, normalMap:wN, normalScale:new THREE.Vector2(.45,.45), envMapIntensity:1.5, transparent:true, opacity:.92});
    const wg=new THREE.PlaneGeometry(Z.x1-Z.x0+40, Z.z1-Z.z0+40); wg.rotateX(-Math.PI/2); const wmesh=new THREE.Mesh(wg, wm); wmesh.position.set((Z.x0+Z.x1)/2, W.WATER_Y+.03, (Z.z0+Z.z1)/2); wmesh.receiveShadow=true; wmesh.userData.dynamic=true; wmesh.userData.noFar=true; scene.add(wmesh); out.water=wm; }
  const KL=Kit(380,170,false), KS=Kit(380,170,true);
  for(const p of PARC){ const w=p.x1-p.x0, d=p.z1-p.z0, cx=(p.x0+p.x1)/2, cz=(p.z0+p.z1)/2;
    KS.add(B(w,6,d), M.granite, cx,Y-3.01,cz);                                   // thân đất bồi (mặt bên = kè đá)
    const top=new THREE.PlaneGeometry(w,d); top.rotateX(-Math.PI/2); top.translate(cx,0,cz); uvWorld(top,.22); KL.add(top, M.pave, 0,Y+.005,0); }
  // lan can kè: gờ đá + tay vịn thép + dải LED vàng kim, chừa đầu cầu
  const EDGEMSG='🌊 Kè sông River Tech – không lội xuống nước được. Qua sông bằng cầu nhé!';
  const posts=[]; function edgeRun(ax,az,bx,bz){ const L=Math.hypot(bx-ax,bz-az); if(L<.4) return; const mx=(ax+bx)/2, mz=(az+bz)/2, ry=Math.atan2(bx-ax,bz-az);
    KS.add(B(.5,.35,L), M.granite, mx,Y+.17,mz, ry); KS.add(B(.08,.08,L), M.steel, mx,Y+1.05,mz, ry); KL.add(B(.05,.05,L), M.gold, mx,Y+.95,mz, ry);
    for(let s=0;s<=L;s+=2.2){ const k=s/L; posts.push([ax+(bx-ax)*k, az+(bz-az)*k]); } addSeg(ax,az,bx,bz,.25,undefined,undefined,EDGEMSG); }
  for(const p of PARC){ const ed=[[p.x0,p.z0,p.x1,p.z0],[p.x1,p.z0,p.x1,p.z1],[p.x1,p.z1,p.x0,p.z1],[p.x0,p.z1,p.x0,p.z0]];
    for(const [ax,az,bx,bz] of ed){ const ex=ax===bx, lo=ex?Math.min(az,bz):Math.min(ax,bx), hi=ex?Math.max(az,bz):Math.max(ax,bx), cut=[];
      for(const b of [...BR, ...CUTS]){ if(ex){ if(Math.abs(ax-b.x0)<1.6 || Math.abs(ax-b.x1)<1.6 || (ax>b.x0-1.6 && ax<b.x1+1.6)) cut.push([b.z0+.6,b.z1-.6]); } else { if(az>b.z0-1.6 && az<b.z1+1.6) cut.push([b.x0+.6,b.x1-.6]); } }
      cut.sort((a,b)=>a[0]-b[0]); let s=lo+.25; for(const [c0,c1] of cut){ if(c1<lo || c0>hi) continue; if(c0>s) ex?edgeRun(ax,s,ax,c0):edgeRun(s,az,c0,az); s=Math.max(s,c1); } if(hi-.25>s) ex?edgeRun(ax,s,ax,hi-.25):edgeRun(s,az,hi-.25,az); } }
  { const g=mergeGeometries([CY(.045,.05,1.0,8).translate(0,.5,0), new THREE.SphereGeometry(.07,8,6).translate(0,1.05,0)]); const im=new THREE.InstancedMesh(g, M.steel, posts.length);
    posts.forEach(([x,z],i)=>{ _m4.makeTranslation(x,Y+.3,z); im.setMatrixAt(i,_m4); }); im.userData.dynamic=true; im.castShadow=false; scene.add(im); }

  /* ============================== 3. ĐƯỜNG + VẠCH KẺ + BÓ VỈA ============================== */
  { const WH=[], YE=[];
    const quad=(arr,x0,z0,x1,z1)=>arr.push([Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]);
    for(const r of ROADS){ const q=rr(r), w=q.x1-q.x0, d=q.z1-q.z0, g=new THREE.PlaneGeometry(w,d); g.rotateX(-Math.PI/2); g.translate((q.x0+q.x1)/2,0,(q.z0+q.z1)/2); uvWorld(g,.12); KL.add(g, M.asphalt, 0,Y+.02,0);
      const hw=r.w/2, lanes=r.w>=24?[2.05+.3,5.35+.3]:[2.05,5.35], CM=r.w>=24?7.0+.6:7.0;
      const seg=(u0,u1,v0,v1,arr)=>r.ew?quad(arr,u0,r.c+v0,u1,r.c+v1):quad(arr,r.c+v0,u0,r.c+v1,u1);
      const L0=r.a+1, L1=r.b-1; seg(L0,L1,-.27,-.11,YE); seg(L0,L1,.11,.27,YE); seg(L0,L1,-hw+.25,-hw+.42,WH); seg(L0,L1,hw-.42,hw-.25,WH);
      for(const sd of [-1,1]){ seg(L0,L1,sd*CM-.08,sd*CM+.08,WH); for(let u=L0;u<L1-3;u+=4.5) seg(u,u+2.4,sd*(lanes[0]+1.65)-.07,sd*(lanes[0]+1.65)+.07,WH); }
      for(const sd of [-1,1]){ const v=sd*(hw+.12); r.ew ? KL.add(B(r.b-r.a,.03,.24), M.curb, (r.a+r.b)/2,Y+.015,r.c+v) : KL.add(B(.24,.03,r.b-r.a), M.curb, r.c+v,Y+.015,(r.a+r.b)/2);   /* bó vỉa sát mặt: chân không lún khi bước qua */ } }
    // vạch qua đường ở mỗi giao lộ (4 nhánh)
    for(const a of ROADS.filter(r=>r.ew)) for(const b of ROADS.filter(r=>!r.ew)){ const x=b.c, z=a.c;
      for(const sd of [-1,1]){ const zz=z+sd*(a.w/2+2.4); if(onRoad(x,zz)) for(let k=-b.w/2+.6;k<b.w/2-.4;k+=1.1) quad(WH, x+k, zz-1.4, x+k+.55, zz+1.4); const xx=x+sd*(b.w/2+2.4); if(onRoad(xx,z)) for(let k=-a.w/2+.6;k<a.w/2-.4;k+=1.1) quad(WH, xx-1.4, z+k, xx+1.4, z+k+.55); } }   /* chỉ sơn vạch ở nhánh có đường */
    const qg=arr=>{ const pos=[], idx=[]; arr.forEach(([x0,z0,x1,z1],i)=>{ pos.push(x0,0,z0, x1,0,z0, x1,0,z1, x0,0,z1); const o=i*4; idx.push(o,o+2,o+1, o,o+3,o+2); }); const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
    for(const [arr,m] of [[WH,M.line],[YE,M.yellow]]){ const ms=new THREE.Mesh(qg(arr), m); ms.position.y=Y+.035; ms.receiveShadow=true; ms.userData.dynamic=true; ms.userData.noFar=true; scene.add(ms); } }
  out.onRoad=onRoad;


  /* ============================== 4. MƯỜI HAI CÂY CẦU ============================== */
  const V3=(x,y,z)=>new THREE.Vector3(x,y,z), tube=(pts,r,n=8)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length*3, r, n, false);
  const KB=Kit(380,110,true);
  for(const b of BR){ const w=b.x1-b.x0, d=b.z1-b.z0, cx=(b.x0+b.x1)/2, cz=(b.z0+b.z1)/2, L=b.ew?w:d, Wd=b.ew?d:w;
    const along=(u,v,y)=>b.ew?[b.x0+u, y, b.z0+v]:[b.x0+v, y, b.z0+u];   // u: dọc cầu (0..L) · v: ngang cầu (0..Wd)
    // mặt cầu + dầm
    KB.add(B(w,.7,d), b.kind==='glass'||b.kind==='glow' ? M.white : M.granite, cx,Y-.35,cz);
    if(b.kind==='stone' || b.kind==='arch'){ const g=new THREE.PlaneGeometry(b.ew?w:Wd-2*SW, b.ew?Wd-2*SW:d); g.rotateX(-Math.PI/2); g.translate(cx,0,cz); uvWorld(g,.12); KL.add(g, M.asphalt, 0,Y+.021,0); }
    // lan can 2 mép + va chạm (mỗi mép kéo vào đất 1 m)
    for(const v of [.25, Wd-.25]){ const [ax,,az]=along(-1,v,0), [bx,,bz]=along(L+1,v,0); const mx=(ax+bx)/2, mz=(az+bz)/2, len=L+2, ry=b.ew?Math.PI/2:0;
      KB.add(B(.35,.5,len), b.kind==='stone'?M.granite:M.steel, mx,Y+.25,mz, ry); KB.add(B(.1,.1,len), M.steel, mx,Y+1.1,mz, ry); KL.add(B(.06,.06,len), b.kind==='glow'?M.ledC:M.gold, mx,Y+.98,mz, ry);
      addSeg(ax,az,bx,bz,.22,undefined,undefined,`🌉 Lan can ${b.name}`); }
    if(b.kind==='stone'){ for(const v of [.6, Wd/2, Wd-.6]){ const pts=[]; for(let i=0;i<=16;i++){ const u=1+i/16*(L-2), hh=Y-.7-3.2*(1-Math.sin(Math.PI*i/16)); const [x,,z]=along(u,v,0); pts.push(V3(x,hh,z)); } KB.add(tube(pts,.45,8), M.stone, 0,0,0); }   // 3 vòm đá dưới mặt cầu
      for(const u of [1, L-1]) for(const v of [.6, Wd-.6]){ const [x,,z]=along(u,v,0); KB.add(B(1.6,4.4,1.6), M.granite, x,Y-2.9,z); } }
    if(b.kind==='arch'){   // 2 vòm thép đỏ vươn cao 14 m + dây treo
      for(const v of [1.2, Wd-1.2]){ const pts=[]; for(let i=0;i<=16;i++){ const u=i/16*L, h=14*Math.sin(Math.PI*i/16); const [x,,z]=along(u,v,0); pts.push(V3(x,Y+.6+h,z)); }
        KB.add(tube(pts,.45,10), M.red, 0,0,0); for(let i=1;i<16;i++){ const p=pts[i]; KB.add(CY(.05,.05,p.y-Y-.6,6), M.steel, p.x,(p.y+Y+.6)/2,p.z); } const led=pts.map(p=>V3(p.x,p.y+.5,p.z)); KL.add(tube(led,.09,6), M.ledR, 0,0,0); }
      for(let i=2;i<15;i+=3){ const u=i/16*L, h=14*Math.sin(Math.PI*i/16); const [x0,,z0]=along(u,1.2,0), [x1,,z1]=along(u,Wd-1.2,0); KB.add(B(b.ew?.4:Math.abs(x1-x0),.4,b.ew?Math.abs(z1-z0):.4), M.red, (x0+x1)/2,Y+.6+h,(z0+z1)/2); } }
    if(b.kind==='glass'){   // cầu kính 2 tầng: tầng dưới đi bộ, tầng trên sàn kính ngắm sông (lên bằng cầu thang đầu Bắc)
      const UY=Y+5.2; KB.add(B(w,.12,d), M.glass, cx,UY,cz); for(const v of [.2,Wd-.2]){ const [ax,,az]=along(0,v,0); for(let u=0;u<=L;u+=4) KB.add(B(.16,5.2,.16), M.steel, ax,Y+2.6,b.z0+u); KB.add(B(.06,1.0,L), M.glass, ax,UY+.55,cz); KB.add(B(.08,.08,L), M.steel, ax,UY+1.08,cz); addSeg(ax,b.z0-.3,ax,b.z1,.12,UY-.5,UY+2,'🌉 Lan can kính tầng trên'); }
      for(let u=0;u<=L;u+=4){ const [x,,z]=along(u,Wd/2,0); KB.add(B(Wd,.25,.25), M.steel, x,UY-.15,z); }
      plats.push({t:'r', x:cx, z:(b.z0-.3+b.z1-1.2)/2, c:1, s:0, hw:w/2, hd:(b.z1-1.2-(b.z0-.3))/2, h:UY+.06});
      const st=[]; for(let i=0;i<12;i++){ const z=b.z0-1-i*.55, h=Y+(12-i)*(UY+.06-Y)/12; plats.push({t:'r', x:cx, z:z-.27, c:1, s:0, hw:w/2-.3, hd:.3, h}); KB.add(B(w-.6,.18,.55), M.granite, cx,h-.09,z-.27); }
      for(const sx of [-1,1]) addSeg(cx+sx*(w/2-.15), b.z0-7.6, cx+sx*(w/2-.15), b.z0, .12, Y+.6, UY+2, '⤴ Lan can cầu thang lên tầng ngắm sông');
      addSeg(b.x0, b.z1-1.3, b.x1, b.z1-1.3, .1, UY-.5, UY+2, '🌉 Mép sàn kính tầng trên – quay lại cầu thang phía Bắc');
      INTER.push({x:cx, z:b.z0-.6, r:2, prio:.3, when:()=>P.y<Y+1.5, label:'🌉 Cầu Kính Hai Tầng – lên sàn kính tầng trên bằng cầu thang phía Bắc', action:()=>toast('⤴ Đi lên bậc thang ngay phía Bắc đầu cầu để lên sàn kính ngắm nhạc nước 🎶', 2600)}); }
    if(b.kind==='glow'){ for(let u=0;u<=L;u+=3){ const [x,,z]=along(u,Wd/2,0), h=3.2*Math.sin(Math.PI*u/L); KB.add(B(Wd+.6,.14,.14), M.white, x,Y+2.7+h,z);   /* thanh vòm trên đầu người (trước 1,2 m chắn ngang lối đi ở đầu cầu) */ } const pts=[]; for(let i=0;i<=16;i++){ const u=i/16*L; const [x,,z]=along(u,Wd/2,0); pts.push(V3(x,Y-.72,z)); } KL.add(tube(pts,.12,6), M.ledC, 0,0,0); }
    makeLabel(`🌉 ${b.name}`, null, {h:.4, x:cx, y:Y+(b.kind==='arch'?15.5:3.2), z:cz, fade:60}); }
  out.bridges=BR.length;

  /* ============================== 5. ĐƯỜNG DẠO VEN SÔNG: liễu · đèn lồng đỏ · ghế · đèn đường LED ============================== */
  // vùng các toà lớn (chặn đặt đồ trang trí) – toạ độ theo bible (tâm) + bố cục tránh đường
  const HQFOOT=[[225,335,-85,25],[395,485,-55,15],[247.5,332.5,122.5,197.5],[407.5,492.5,141.5,215],[323,352,318,362],[378,407,318,362],
    [222,248,267,293],[277,303,267,293],[222,248,322,348],[277,303,322,348],[418,470,262,328],[416,468,352,417],[369,378,297,303],[268,302,386,414],[523,546,281,319]].map(([x0,x1,z0,z1])=>({x0,x1,z0,z1}));
  const HQDOOR=[[280,25.6],[440,16.6],[290,199],[280,121.7],[450,139.7],[337.5,316.4],[392.5,316.4],[285,386.6],[235,265.4],[290,265.4],[235,320.4],[290,320.4]];   // cửa các toà – không dựng đèn chắn lối
  const freeDecor=(x,z,r=1)=>HQDOOR.every(([dx,dz])=>Math.hypot(x-dx,z-dz)>r+4) && onLand(x,z,.8) && !onRoad(x,z,r+.5) && !onBridge(x,z,r+1) && !HQFOOT.some(f=>x>f.x0-r && x<f.x1+r && z>f.z0-r && z<f.z1+r);
  const willowG=(()=>{ const parts=[]; const T=CY(.22,.32,4.2,8); T.translate(0,2.1,0); parts.push(T); for(let i=0;i<4;i++){ const s=new THREE.IcosahedronGeometry(1.5-i*.2,1); s.scale(1,.7,1); s.translate((i%2-.5)*1.2,4.6+i*.35,(i>1?.6:-.6)); parts.push(s); }
    for(let i=0;i<14;i++){ const a=i/14*TAU, c=new THREE.ConeGeometry(.35,3.2,5,1,true); c.rotateX(Math.PI); c.translate(Math.cos(a)*1.7,3.0,Math.sin(a)*1.7); parts.push(c); }
    return mergeGeometries(parts.map((g,k)=>{ const q=g.index?g.toNonIndexed():g; if(q.attributes.uv) q.deleteAttribute('uv'); const col=new THREE.Color(k===0?0x5e4632:k<5?0x5f8f3a:0x7fae4f), n=q.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ const f=.85+.3*((i*7919)%11)/11; a[i*3]=col.r*f; a[i*3+1]=col.g*f; a[i*3+2]=col.b*f; } q.setAttribute('color', new THREE.Float32BufferAttribute(a,3)); return q; })); })();
  const willowM=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.85, side:THREE.DoubleSide});
  const WIL=[], LAN=AK.lanterns(), LANP=[], BEN=[], LAMP=[];
  // điểm dọc các mép đất (cách kè 3 m)
  for(const p of PARC){ const ed=[[p.x0,p.z0,p.x1,p.z0,0,1],[p.x1,p.z0,p.x1,p.z1,-1,0],[p.x1,p.z1,p.x0,p.z1,0,-1],[p.x0,p.z1,p.x0,p.z0,1,0]];
    for(const [ax,az,bx,bz,nx,nz] of ed){ const L=Math.hypot(bx-ax,bz-az); const river=(az===bz) && (az===RIV.z0 || az===RIV.z1), canal=(ax===bx) && CAN.some(c=>ax===c.x0||ax===c.x1);
      if(!river && !canal) continue;
      for(let s=6;s<L-6;s+=7){ const k=s/L, ex=ax+(bx-ax)*k, ez=az+(bz-az)*k, i=Math.round(s/7);
        if(i%2===0){ const x=ex+nx*3.4, z=ez+nz*3.4; if(freeDecor(x,z,1.8)){ WIL.push([x,z,R()*TAU,.9+R()*.25]); circles.push({x,z,r:.35}); } }
        else { const x=ex+nx*1.2, z=ez+nz*1.2; if(freeDecor(x,z,.6)){ LANP.push([x,z]); LAN.add(x,Y+2.55,z); circles.push({x,z,r:.15}); if(i%3===1){ const bx2=ex+nx*2.2+(bz-az)/L*1.6, bz2=ez+nz*2.2-(bx-ax)/L*1.6; if(freeDecor(bx2,bz2,1)) BEN.push([bx2,bz2,Math.atan2(-nx,-nz)]); } } } } } }
  { const im=new THREE.InstancedMesh(willowG, willowM, WIL.length); WIL.forEach(([x,z,r,s],i)=>{ _e.set(0,r,0); _q.setFromEuler(_e); _m4.compose(_v.set(x,Y,z), _q, _s.set(s,s,s)); im.setMatrixAt(i,_m4); }); im.castShadow=!LOW; im.receiveShadow=true; im.userData.dynamic=true; scene.add(im);
    const pg=mergeGeometries([CY(.06,.08,2.2,8).translate(0,1.1,0), B(.6,.06,.06).translate(.0,2.2,0)]); const pm=new THREE.InstancedMesh(pg, M.dark, LANP.length); LANP.forEach(([x,z],i)=>{ _m4.makeTranslation(x,Y,z); pm.setMatrixAt(i,_m4); }); pm.userData.dynamic=true; scene.add(pm); LAN.build(scene);
    for(const [x,z,rot] of BEN){ const f=[Math.sin(rot),Math.cos(rot)], r=[Math.cos(rot),-Math.sin(rot)]; KS.add(RB(1.9,.1,.5,.03,1), M.wood, x,Y+.46,z, rot); KS.add(RB(1.9,.42,.08,.03,1), M.wood, x-f[0]*.24,Y+.72,z-f[1]*.24, rot);
      for(const s of [-1,1]) KS.add(B(.08,.46,.5), M.dark, x+r[0]*s*.8,Y+.23,z+r[1]*s*.8, rot); addSeg(x-r[0]*.95,z-r[1]*.95,x+r[0]*.95,z+r[1]*.95,.28); W.addBench && W.addBench({x, z, rot, len:1.75, y:Y+.5, floor:Y+.02, label:'🪑 Ngồi ghế ven sông (E · C)'}); } }
  // đèn đường LED kiểu CBD (cột đôi tay vươn + dải LED xanh lạnh) dọc vỉa hè mọi đường
  for(const r of ROADS) for(let u=r.a+14;u<r.b-14;u+=26){ for(const sd of [-1,1]){ const v=r.c+sd*(r.w/2+1.1), x=r.ew?u:v, z=r.ew?v:u; if(onBridge(x,z,5) || !onLand(x,z,.5) || HQDOOR.some(([dx,dz])=>Math.hypot(x-dx,z-dz)<7) || (r.ew && [280,290,440,450,285].some(a=>Math.abs(x-a)<5)) || HQFOOT.some(f=>x>f.x0-1&&x<f.x1+1&&z>f.z0-1&&z<f.z1+1)) continue; if(ROADS.some(q=>{ if(q===r) return false; const Q=rr(q); return x>Q.x0-6 && x<Q.x1+6 && z>Q.z0-6 && z<Q.z1+6; })) continue; LAMP.push([x,z,r.ew?(sd<0?0:Math.PI):(sd<0?Math.PI/2:-Math.PI/2)]); circles.push({x,z,r:.16}); } }
  { const g=mergeGeometries([CY(.09,.13,8,10).translate(0,4,0), B(.12,.12,2.4).translate(0,7.9,1.1), B(.5,.08,.9).translate(0,7.82,2.2)]); const im=new THREE.InstancedMesh(g, M.dark, LAMP.length);
    const lg=B(.08,4.6,.08).translate(.1,4.3,0); const il=new THREE.InstancedMesh(lg, M.ledC, LAMP.length);
    LAMP.forEach(([x,z,ry],i)=>{ _e.set(0,ry,0); _q.setFromEuler(_e); _m4.compose(_v.set(x,Y,z), _q, _s.set(1,1,1)); im.setMatrixAt(i,_m4); il.setMatrixAt(i,_m4); const f=[Math.sin(ry),Math.cos(ry)]; GLOW.add(x+f[0]*2.2,Y+7.7,z+f[1]*2.2,3.2,0xfff1d6,.9); });
    for(const m of [im,il]){ m.userData.dynamic=true; m.castShadow=false; scene.add(m); } }

  /* ============================== 6. NHẠC NƯỚC TRÊN SÔNG (giữa cầu kính và kênh Đông Hoa) ============================== */
  const FT=[]; for(let x=300;x<=346;x+=2.3) for(const z of [104.5,110,115.5]) FT.push({x,z,ph:x*.2+z});
  const jetG=new THREE.ConeGeometry(.16,1,8,1,true); jetG.translate(0,.5,0);
  const jetM=new THREE.MeshStandardMaterial({color:0xdff4ff, emissive:0xffffff, emissiveIntensity:.15, transparent:true, opacity:.6, depthWrite:false, roughness:.1});
  const jets=new THREE.InstancedMesh(jetG, jetM, FT.length); jets.userData.dynamic=true; jets.frustumCulled=false; scene.add(jets); const jcol=new THREE.Color();
  FT.forEach((f,i)=>jets.setColorAt(i, jcol.set(0xffffff))); const nozzle=new THREE.InstancedMesh(CY(.25,.3,.2,10), M.dark, FT.length); FT.forEach((f,i)=>{ _m4.makeTranslation(f.x,W.WATER_Y+.02,f.z); nozzle.setMatrixAt(i,_m4); }); nozzle.userData.dynamic=true; scene.add(nozzle);
  makeLabel('🎶 Nhạc nước River Tech', 'Đẹp nhất ban đêm – ngắm từ Cầu Kính Hai Tầng', {h:.5, x:323, y:9, z:110, fade:90});
  function updFountain(T){ const n=W.night||0; for(let i=0;i<FT.length;i++){ const f=FT[i], beat=Math.max(0,Math.sin(T*1.7+f.ph*.35))*Math.max(.3,Math.sin(T*.45+f.x*.08)), h=.6+beat*(5+3*Math.sin(T*.3+f.z));
      _m4.compose(_v.set(f.x,W.WATER_Y,f.z), _q.identity(), _s.set(1+beat*.4,h,1+beat*.4)); jets.setMatrixAt(i,_m4); if(n>.2){ jcol.setHSL(((T*.05+f.x*.01)%1),.85,.6); jets.setColorAt(i,jcol); } }
    jets.instanceMatrix.needsUpdate=true; if(jets.instanceColor) jets.instanceColor.needsUpdate=true; jetM.emissiveIntensity=.12+n*1.4; }


  /* ============================== 7. NĂM TRỤ SỞ BIỂU TƯỢNG – NGOẠI THẤT ============================== */
  const flipN=g=>{ if(g.index){ const ix=g.index.array; for(let i=0;i<ix.length;i+=3){ const t=ix[i]; ix[i]=ix[i+2]; ix[i+2]=t; } } const n=g.attributes.normal; for(let i=0;i<n.array.length;i++) n.array[i]*=-1; return g; };
  const ledStrip=(pts,m=M.ledC,r=.09)=>KL.add(tube(pts,r,6), m, 0,0,0);
  const HQ=out.hq;
  const vcM=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.85});
  const vcG=parts=>mergeGeometries(parts.map(([g,c])=>{ const q=g.index?g.toNonIndexed():g; if(q.attributes.uv) q.deleteAttribute('uv'); const col=new THREE.Color(c), n=q.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ const k=.85+.3*((i*7919)%13)/13; a[i*3]=col.r*k; a[i*3+1]=col.g*k; a[i*3+2]=col.b*k; } q.setAttribute('color', new THREE.Float32BufferAttribute(a,3)); return q; }));
  const facG=AK.makePBRFacade({cols:4, rows:3, glassCol:'#24465c', frameCol:'#cfd6dc', wall:'#cfd6dc', seed:51, litProb:.55, tileW:12, tileH:14.4});
  const facW=AK.makePBRFacade({cols:3, rows:2, glassCol:'#2f4a3c', frameCol:'#8a5a32', wall:'#9a6a3e', seed:52, litProb:.5, tileW:9, tileH:8});
  const facT=AK.makePBRFacade({cols:5, rows:4, glassCol:'#1d2f45', frameCol:'#7f8a95', wall:'#5d6873', seed:53, litProb:.6, tileW:12, tileH:14});
  const facC=AK.makePBRFacade({cols:4, rows:4, glassCol:'#2a3d52', frameCol:'#e8e2d6', wall:'#e8e2d6', seed:54, litProb:.62, balcony:true, tileW:12, tileH:13.6});
  const KH=Kit(380,170,true);

  // 7.1 THE INFINITE LOOP QA RING – nhẫn kính cong Ø110, sân vườn Ø60, cao 24, mái pin mặt trời bạc
  { const c={x:280, z:-30}, R1=54, R0=30, H=24, door=Math.PI/2, gap=.06;
    const gO=3.6/R1, gI=3.6/R0;   // khe cửa ở θ = 0 (phía Nam, z = c.z + R)
    const wallO=new THREE.CylinderGeometry(R1,R1,H,160,1,true,gO,TAU-2*gO); AK.facadeUV(wallO, TAU*R1, H, facG); KH.add(wallO, facG, c.x,Y+H/2,c.z);
    const wallI=flipN(new THREE.CylinderGeometry(R0,R0,H,110,1,true,gI,TAU-2*gI)); AK.facadeUV(wallI, TAU*R0, H, facG); KH.add(wallI, facG, c.x,Y+H/2,c.z);
    for(const r of [R1,R0]){ KH.add(B(7.6,.5,4), M.silver, c.x,Y+4.4,c.z+r+(r===R1?1.6:-1.6)); KH.add(B(7.4,4.2,.1), M.glass, c.x,Y+2.1,c.z+r); for(const sx of [-1,1]) KH.add(B(.3,H,.3), M.silver, c.x+sx*3.7,Y+H/2,c.z+r); }
    const roof=new THREE.RingGeometry(R0-1.5,R1+2.5,120,2); roof.rotateX(-Math.PI/2); const solT=ctex(256,256,(g,w,h)=>{ g.fillStyle='#c9ced4'; g.fillRect(0,0,w,h); g.fillStyle='#22324a'; for(let y=8;y<h;y+=32) for(let x=8;x<w;x+=64) g.fillRect(x,y,56,26); g.strokeStyle='rgba(255,255,255,.25)'; for(let y=8;y<h;y+=32) for(let x=8;x<w;x+=64){ g.strokeRect(x+14,y,0,26); g.strokeRect(x+28,y,0,26); g.strokeRect(x+42,y,0,26); } }, true);
    solT.repeat.set(6,6); KH.add(roof, new THREE.MeshStandardMaterial({map:solT, roughness:.35, metalness:.7, side:THREE.DoubleSide}), c.x,Y+H+.3,c.z);
    for(const r of [R1+2.5, R0-1.5]){ const pts=[]; for(let i=0;i<=120;i++){ const a=i/120*TAU; pts.push(V3(c.x+Math.cos(a)*r, Y+H+.25, c.z+Math.sin(a)*r)); } ledStrip(pts, M.ledC, .12); }
    for(let i=0;i<120;i++){ const a=i/120*TAU; if(Math.abs(((a-door+Math.PI)%TAU+TAU)%TAU-Math.PI)<gap*1.4) continue; KH.add(B(.25,H,.5), M.silver, c.x+Math.cos(a)*(R1+.25),Y+H/2,c.z+Math.sin(a)*(R1+.25), -a+Math.PI/2); }
    // sân vườn trong: cỏ, vườn cây ăn quả, hồ koi, nhà vòm kính
    const lawn=new THREE.CircleGeometry(R0-.2,80); lawn.rotateX(-Math.PI/2); KL.add(lawn, M.lawn, c.x,Y+.03,c.z);
    const pond=new THREE.CircleGeometry(7,40); pond.rotateX(-Math.PI/2); KL.add(pond, std(0x2b6f74,{roughness:.05, metalness:.3}), c.x+10,Y+.05,c.z+6); KS.add(new THREE.TorusGeometry(7,.35,8,40).rotateX(Math.PI/2), M.granite, c.x+10,Y+.2,c.z+6); circles.push({x:c.x+10, z:c.z+6, r:7.3});
    KS.add(new THREE.SphereGeometry(8,32,16,0,TAU,0,Math.PI/2), M.glass, c.x-9,Y,c.z-6); circles.push({x:c.x-9, z:c.z-6, r:8.1});
    const fruit=[]; for(let i=0;i<34;i++){ const a=R()*TAU, r=12+R()*15, x=c.x+Math.cos(a)*r, z=c.z+Math.sin(a)*r; if(Math.hypot(x-c.x-10,z-c.z-6)<9 || Math.hypot(x-c.x+9,z-c.z+6)<10 || Math.abs(x-c.x)<2.5 && z>c.z) continue; fruit.push([x,z]); circles.push({x,z,r:.3}); }
    const tg=vcG([[CY(.18,.25,2.4,8).translate(0,1.2,0),0x6b4a32],[new THREE.IcosahedronGeometry(1.6,1).scale(1,.85,1).translate(0,3.3,0),0x4f8a37],[new THREE.IcosahedronGeometry(.18,0).translate(.9,3.4,.9),0xff6a2a],[new THREE.IcosahedronGeometry(.18,0).translate(-.8,3.0,.6),0xffc531],[new THREE.IcosahedronGeometry(.18,0).translate(.2,3.6,-1.1),0xff6a2a]]);
    const fim=new THREE.InstancedMesh(tg, vcM, fruit.length); fruit.forEach(([x,z],i)=>{ _m4.makeTranslation(x,Y,z); fim.setMatrixAt(i,_m4); }); fim.castShadow=true; fim.userData.dynamic=true; scene.add(fim);
    // va chạm: tường ngoài + tường sân trong (khe cửa phía Nam, nhìn ra sông)
    const ringCol=(r,msg)=>{ for(let i=0;i<96;i++){ const a=i/96*TAU, b=(i+1)/96*TAU, m=(a+b)/2; if(Math.abs(((m-door+Math.PI)%TAU+TAU)%TAU-Math.PI)<gap*(R1/r)) continue; addSeg(c.x+Math.cos(a)*r, c.z+Math.sin(a)*r, c.x+Math.cos(b)*r, c.z+Math.sin(b)*r, .3, undefined, Y+H+1, msg); } };
    ringCol(R1+.1, '🍎 Tường kính QA Ring – vào bằng cửa chính phía Nam (hướng ra sông)'); ringCol(R0-.1, '🍎 Kính sân vườn trong – ra vườn bằng cửa phía Nam hành lang');
    HQ.ring={c, R0, R1, H, door:{x:c.x, z:c.z+R1+1.6}, inDoor:{x:c.x, z:c.z+R0-1.4}};
    makeLabel('🍎 The Infinite Loop QA Ring', 'Trụ sở QA · vòng nhẫn kính Ø110 m · vào bằng cửa phía Nam (E)', {h:.75, x:c.x, y:Y+H+5, z:c.z+R1, fade:160}); }

  // 7.2 DRAGONSCALE AUTO-LABS – mái lượn sóng vảy rồng bạc trên cột nghiêng (90×70, cao 28)
  { const c={x:440, z:-20}, w=90, d=70, x0=c.x-w/2, z0=c.z-d/2, roofH=(u,v)=>12+9*Math.pow(Math.sin(Math.PI*u*1.5+.3),2)*Math.sin(Math.PI*v)+5*Math.sin(Math.PI*v);
    const N=60, Mz=46, pos=[], uv=[], idx=[]; for(let j=0;j<=Mz;j++) for(let i=0;i<=N;i++){ const u=i/N, v=j/Mz; pos.push(x0+u*w-c.x, roofH(u,v), z0+v*d-c.z); uv.push(u*12,v*9); }
    for(let j=0;j<Mz;j++) for(let i=0;i<N;i++){ const a=j*(N+1)+i, b=a+1, cc=a+N+1, dd=cc+1; idx.push(a,cc,b, b,cc,dd); }
    const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); rg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); rg.setIndex(idx); rg.computeVertexNormals();
    const scT=ctex(256,256,(g,W2,H2)=>{ g.fillStyle='#8e979f'; g.fillRect(0,0,W2,H2); for(let r=0;r<9;r++) for(let k=-1;k<9;k++){ const x=k*32+(r%2)*16, y=r*30; const gr=g.createRadialGradient(x+16,y+4,2,x+16,y+10,22); gr.addColorStop(0,'#eef2f5'); gr.addColorStop(.7,'#aab3bb'); gr.addColorStop(1,'#5f6870'); g.fillStyle=gr; g.beginPath(); g.ellipse(x+16,y+12,15,18,0,0,Math.PI); g.fill(); } }, true);
    const roofM=new THREE.MeshStandardMaterial({map:scT, roughness:.3, metalness:.85, side:THREE.DoubleSide}); KH.add(rg, roofM, c.x,Y,c.z);
    // tường kính bao quanh (cao theo mép mái) + cột nghiêng đón gió sông
    const edge=(ax,az,bx,bz,ua,va,ub,vb)=>{ const n=24; for(let i=0;i<n;i++){ const t0=i/n, t1=(i+1)/n, x=ax+(bx-ax)*(t0+t1)/2, z=az+(bz-az)*(t0+t1)/2, h=roofH(ua+(ub-ua)*(t0+t1)/2, va+(vb-va)*(t0+t1)/2), L=Math.hypot(bx-ax,bz-az)/n;
      const g=new THREE.PlaneGeometry(L,h); g.translate(0,h/2,0); KH.add(g, M.glass, x,Y,z, Math.atan2(bx-ax,bz-az)+Math.PI/2); } };
    edge(x0,z0,x0+w,z0,0,0,1,0); edge(x0+w,z0+d,x0,z0+d,1,1,0,1); edge(x0,z0+d,x0,z0,0,1,0,0); edge(x0+w,z0,x0+w,z0+d,1,0,1,1);
    for(let i=0;i<=8;i++){ const u=i/8; for(const [v,s] of [[0,-1],[1,1]]){ const x=x0+u*w, z=z0+v*d, h=roofH(u,v); if(Math.abs(x-c.x)<5) continue; /* chừa lối cửa chính */ KH.add(CY(.35,.5,h+1.5,10), M.silver, x,Y+h/2,z+s*2.2, 0, -s*.22); circles.push({x, z:z+s*2.2+s*0, r:.5}); } }
    const ledE=[]; for(let i=0;i<=40;i++){ const u=i/40; ledE.push(V3(x0+u*w, Y+roofH(u,1)+.3, z0+d)); } ledStrip(ledE, M.ledC, .12);
    // va chạm 4 mặt kính, cửa chính giữa mặt Nam (nhìn ra sông)
    const MSG='🐉 Vách kính Dragonscale – cửa chính ở giữa mặt Nam (hướng ra sông)';
    addSeg(x0,z0,x0+w,z0,.2,undefined,undefined,MSG); addSeg(x0,z0,x0,z0+d,.2,undefined,undefined,MSG); addSeg(x0+w,z0,x0+w,z0+d,.2,undefined,undefined,MSG);
    addSeg(x0,z0+d,c.x-3.5,z0+d,.2,undefined,undefined,MSG); addSeg(c.x+3.5,z0+d,x0+w,z0+d,.2,undefined,undefined,MSG);
    HQ.dragon={c, w, d, x0, z0, roofH, door:{x:c.x, z:z0+d+1.6}};
    makeLabel('🐉 Dragonscale Auto-Labs', 'Trụ sở Automation · mái vảy rồng bạc · cửa giữa mặt Nam (E)', {h:.75, x:c.x, y:Y+31, z:z0+d, fade:160}); }

  // 7.3 SILICON FOREST & TREEHOUSE HUB – 4 khối gỗ tuyết tùng + kính lệch tầng, 6 cây cổ thụ 32 m mọc xuyên mái
  { const c={x:290, z:160}, x0=247.5, x1=332.5, z0=122.5, z1=197.5;
    // sàn nhà nổi trên mép sông (cọc) – mép Bắc lấn ra mặt nước 5,5 m
    KS.add(B(x1-x0,.5,RIV.z1-z0+.5), M.cedar, c.x,Y-.25,(z0+RIV.z1)/2); for(let x=x0+2;x<x1;x+=6) KS.add(CY(.35,.35,4,8), M.dark, x,Y-2.2,z0+1.5);
    plats.push({t:'r', x:c.x, z:(z0+RIV.z1)/2, c:1, s:0, hw:(x1-x0)/2, hd:(RIV.z1-z0)/2+.25, h:Y});
    const blocks=[{x0:252,x1:284,z0:127,z1:157,f:3},{x0:296,x1:329,z0:126,z1:152,f:4},{x0:251,x1:281,z0:166,z1:195,f:2},{x0:294,x1:328,z0:162,z1:194,f:3}];
    for(const b of blocks){ const w=b.x1-b.x0, d=b.z1-b.z0, h=b.f*4, yb=Y+5;   // tầng trệt mở (sảnh làm việc chung cao 5 m), khối gỗ phía trên
      for(const [px,pz,ry,L] of [[(b.x0+b.x1)/2,b.z0,Math.PI,w],[(b.x0+b.x1)/2,b.z1,0,w],[b.x0,(b.z0+b.z1)/2,-Math.PI/2,d],[b.x1,(b.z0+b.z1)/2,Math.PI/2,d]]){ const g=new THREE.PlaneGeometry(L,h); AK.facadeUV(g,L,h,facW); KH.add(g, facW, px,yb+h/2,pz, ry); }
      KH.add(B(w+1.4,.6,d+1.4), M.cedar, (b.x0+b.x1)/2,yb-.3,(b.z0+b.z1)/2); KH.add(B(w+2,.4,d+2), M.dark, (b.x0+b.x1)/2,yb+h+.2,(b.z0+b.z1)/2);
      const roofG=new THREE.PlaneGeometry(w,d); roofG.rotateX(-Math.PI/2); KL.add(roofG, M.lawn, (b.x0+b.x1)/2,yb+h+.42,(b.z0+b.z1)/2);   // mái vườn
      for(const [x,z] of [[b.x0+1,b.z0+1],[b.x1-1,b.z0+1],[b.x0+1,b.z1-1],[b.x1-1,b.z1-1]]){ KH.add(CY(.4,.4,5,10), M.cedar, x,Y+2.5,z); circles.push({x,z,r:.45}); } }
    // vách kính tầng trệt bao quanh khu (cửa Bắc nối Cầu Kính, cửa Nam ra đại lộ)
    const gw=(ax,az,bx,bz)=>{ const L=Math.hypot(bx-ax,bz-az); if(L<.3) return; const g=new THREE.PlaneGeometry(L,5); KH.add(g, M.glass, (ax+bx)/2,Y+2.5,(az+bz)/2, Math.atan2(bx-ax,bz-az)+Math.PI/2); addSeg(ax,az,bx,bz,.2,undefined,Y+5,'🌲 Vách kính Silicon Forest – cửa ở giữa mặt Bắc (Cầu Kính) và mặt Nam'); };
    gw(x0,z0,276,z0); gw(284,z0,x1,z0); gw(x1,z0,x1,z1); gw(x1,z1,293,z1); gw(287,z1,x0,z1); gw(x0,z1,x0,z0);
    KH.add(B(x1-x0+1,.35,z1-z0+1), M.glass, c.x,Y+5,c.z);   // mái kính tầng trệt giữa các khối
    const TREES6=[[288,140],[263,161],[312,158],[289,180],[268,133],[316,190]]; HQ.trees6=TREES6;
    const bigT=vcG([[CY(.9,1.5,32,12).translate(0,16,0),0x6b4a32], [CY(.25,.4,8,6).rotateZ(-.7).translate(3,22,0),0x6b4a32], [CY(.25,.4,8,6).rotateZ(.7).translate(-3,23,0),0x6b4a32], ...[[0,30,0,7,0x3f7a35],[4,27,2,5,0x4b8a3c],[-4,27.5,-2,5.2,0x376f30],[2,33,-3,4.5,0x5a9a42],[-3,31,3,4.4,0x447f37]].map(([x,y,z,r,c])=>[new THREE.IcosahedronGeometry(r,1).scale(1,.75,1).translate(x,y,z),c])]);
    const bt=new THREE.InstancedMesh(bigT, vcM, TREES6.length); TREES6.forEach(([x,z],i)=>{ _m4.compose(_v.set(x,Y-2,z), _q.identity(), _s.set(1,1,1)); bt.setMatrixAt(i,_m4); circles.push({x,z,r:1.6}); }); bt.castShadow=true; bt.userData.dynamic=true; scene.add(bt);
    HQ.forest={c, x0, x1, z0, z1, blocks, door:{x:290, z:z1+1.6}, doorN:{x:280, z:z0-.8}};
    makeLabel('🌲 Silicon Forest & Treehouse Hub', 'Trụ sở QA · 4 khối gỗ–kính · 6 cây cổ thụ xuyên mái · cửa Nam / Cầu Kính (E)', {h:.75, x:c.x, y:Y+26, z:z1, fade:160}); }

  // 7.4 THE TRI-MATRIX PERF CENTER – kim tự tháp tam giác cạnh 85, cao 38, ô giếng trời tam giác phát sáng xanh lá
  { const c={x:450, z:166}, s=85, H=38, hT=s*Math.sqrt(3)/2, A=[c.x-s/2, c.z-hT/3], Bp=[c.x+s/2, c.z-hT/3], C=[c.x, c.z+hT*2/3], AP=[c.x, Y+H, c.z];
    const triT=ctex(512,512,(g,w,h)=>{ g.fillStyle='#1a2a24'; g.fillRect(0,0,w,h); const n=8; for(let j=0;j<n;j++) for(let i=0;i<=j;i++){ const x=w/2+(i-j/2)*w/n, y=j*h/n; for(const up of [1,-1]){ if(up<0 && i===j) continue; const xx=up>0?x:x+w/n/2; g.beginPath(); if(up>0){ g.moveTo(xx,y+6); g.lineTo(xx-w/n/2+6,y+h/n-4); g.lineTo(xx+w/n/2-6,y+h/n-4); } else { g.moveTo(xx-w/n/2+6,y+6); g.lineTo(xx+w/n/2-6,y+6); g.lineTo(xx,y+h/n-4); } g.closePath(); g.fillStyle=R()<.35?'#9dff5c':'#2f4a3e'; g.fill(); } } });
    const triM=new THREE.MeshStandardMaterial({map:triT, emissive:0xffffff, emissiveMap:triT, emissiveIntensity:.15, roughness:.15, metalness:.6, side:THREE.DoubleSide}); NIGHT.push({m:triM, base:.12, k:1.6});
    const face=(p,q)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([p[0],Y,p[1], q[0],Y,q[1], AP[0],AP[1],AP[2]],3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0,0, 1,0, .5,1],2)); g.computeVertexNormals(); return g; };
    // cắt vát đỉnh: chóp kính giám đốc ở 30–38 m
    for(const [p,q] of [[A,Bp],[Bp,C],[C,A]]){ const g=face(p,q); KH.add(g, triM, 0,0,0); const pts=[V3(p[0],Y+.3,p[1]), V3(AP[0],AP[1],AP[2])]; ledStrip(pts, M.ledG, .14); }
    KH.add(new THREE.ConeGeometry(7.4,8.2,3,1).rotateY(Math.PI/6), M.glass, c.x,Y+30+4.1,c.z);
    // cửa chính: hốc vát giữa cạnh Bắc (đón Cầu Ánh Sáng)
    const dx=c.x, dz=A[1]; KH.add(B(10,6,1.2), M.glass, dx,Y+3,dz-.2); KH.add(B(12,.5,4), M.silver, dx,Y+6.2,dz-1.6);
    const MSG='🔺 Vách kính Tri-Matrix – cửa chính ở giữa cạnh Bắc (hướng ra sông)';
    addSeg(A[0],A[1],dx-5,A[1],.25,undefined,undefined,MSG); addSeg(dx+5,A[1],Bp[0],Bp[1],.25,undefined,undefined,MSG); addSeg(Bp[0],Bp[1],C[0],C[1],.25,undefined,undefined,MSG); addSeg(C[0],C[1],A[0],A[1],.25,undefined,undefined,MSG);
    HQ.tri={c, s, H, A, B:Bp, C, door:{x:dx, z:dz-1.8}};
    makeLabel('🔺 The Tri-Matrix Perf Center', 'Trụ sở Performance · kim tự tháp tam giác · cửa giữa cạnh Bắc (E)', {h:.75, x:c.x, y:Y+H+4, z:c.z, fade:170}); }

  // 7.5 CANTILEVER CYBER TWIN-TOWER – 2 tháp nghiêng mọc từ 2 bờ kênh Đông Hoa, khối cầu kính nối ở 95–115 m (Cổng Trời)
  { const towersT=[{x0:323,x1:352,lean:9},{x0:378,x1:407,lean:-9}], z0=318, z1=362, H=120, BY0=Y+95, BY1=Y+115;
    for(const t of towersT){ const w=t.x1-t.x0, d=z1-z0, g=new THREE.BoxGeometry(w,H,d,1,24,1); g.translate(0,H/2,0); const p=g.attributes.position; for(let i=0;i<p.count;i++) p.setX(i, p.getX(i)+t.lean*p.getY(i)/H); g.computeVertexNormals();
      const uvA=g.attributes.uv; for(let i=0;i<uvA.count;i++){ uvA.setXY(i, uvA.getX(i)*Math.max(w,d)/12, uvA.getY(i)*H/14); }
      KH.add(g, facT, (t.x0+t.x1)/2,Y,(z0+z1)/2);
      for(const [ex,ez] of [[t.x0,z0],[t.x1,z0],[t.x0,z1],[t.x1,z1]]) ledStrip([V3(ex,Y,ez), V3(ex+t.lean,Y+H,ez)], M.ledC, .12);
      const MSG='🏙️ Tường Cyber Twin-Tower – sảnh thang máy ở cửa phía Bắc'; const cx=(t.x0+t.x1)/2;
      addSeg(t.x0,z0,cx-3,z0,.25,undefined,Y+6,MSG); addSeg(cx+3,z0,t.x1,z0,.25,undefined,Y+6,MSG); addSeg(t.x1,z0,t.x1,z1,.25,undefined,Y+6,MSG); addSeg(t.x1,z1,t.x0,z1,.25,undefined,Y+6,MSG); addSeg(t.x0,z1,t.x0,z0,.25,undefined,Y+6,MSG);
      KH.add(B(8,.4,4), M.silver, cx,Y+4.4,z0-2); }
    // khối cầu kính nối 2 tháp (đáy kính trong suốt nhìn xuống kênh)
    const bx0=323+9*95/H, bx1=407-9*95/H; KH.add(B(bx1-bx0,BY1-BY0,z1-z0), facT, (bx0+bx1)/2,(BY0+BY1)/2,(z0+z1)/2); KH.add(B(bx1-bx0-.4,.15,z1-z0-.4), M.glass, (bx0+bx1)/2,BY0-.1,(z0+z1)/2);
    { const inM=new THREE.MeshStandardMaterial({map:facT.map, roughness:.2, metalness:.5, side:THREE.BackSide, emissive:0x223344, emissiveIntensity:.2}); const ig=new THREE.BoxGeometry(bx1-bx0-.3,BY1-BY0-.3,z1-z0-.3); const ua=ig.attributes.uv; for(let i=0;i<ua.count;i++) ua.setXY(i, ua.getX(i)*5, ua.getY(i)*1.4); const im=new THREE.Mesh(ig, [inM,inM,inM,new THREE.MeshBasicMaterial({visible:false}),inM,inM]);   /* đáy để trống: nhìn xuyên sàn kính xuống kênh */ im.position.set((bx0+bx1)/2,(BY0+BY1)/2,(z0+z1)/2); scene.add(im); }
    ledStrip([V3(bx0,BY0,z0), V3(bx1,BY0,z0)], M.ledC, .14); ledStrip([V3(bx0,BY0,z1), V3(bx1,BY0,z1)], M.ledC, .14);
    HQ.twin={towers:towersT, z0, z1, H, BY0, BY1, bx0, bx1, doors:towersT.map(t=>({x:(t.x0+t.x1)/2, z:z0-1.6}))};
    makeLabel('🏙️ Cantilever Cyber Twin-Tower', 'Trụ sở Tập đoàn · Cổng Trời nối 2 tháp ở 95 m · sảnh thang máy phía Bắc (E)', {h:.8, x:365, y:Y+H+6, z:(z0+z1)/2, fade:220}); }

  /* ============================== 8. 4 THÁP CĂN HỘ BEIJING STARLIGHT (28 tầng) ============================== */
  const CONDO=[[235,280],[290,280],[235,335],[290,335]].map(([x,z],i)=>({x, z, id:'starlight-'+(i+1), name:`Beijing Starlight ${'ABCD'[i]}`, h:28*3.4}));
  for(const t of CONDO){ const w=24, d=24, h=t.h; const g=new THREE.BoxGeometry(w,h,d); g.translate(0,h/2,0); const uvA=g.attributes.uv; for(let i=0;i<uvA.count;i++) uvA.setXY(i, uvA.getX(i)*w/12, uvA.getY(i)*h/13.6); KH.add(g, facC, t.x,Y,t.z);
    KH.add(B(w-6,6,d-6), facC, t.x,Y+h+3,t.z); KH.add(B(w+1,.6,d+1), M.white, t.x,Y+h+.3,t.z); KH.add(B(w+3,4.6,d+3), M.glassD, t.x,Y+2.3,t.z);
    for(const [ex,ez] of [[-1,-1],[1,-1],[-1,1],[1,1]]) ledStrip([V3(t.x+ex*w/2,Y+5,t.z+ez*d/2), V3(t.x+ex*w/2,Y+h,t.z+ez*d/2)], M.gold, .1);
    plats.push({t:'r', x:t.x, z:t.z, c:1, s:0, hw:(w-6)/2, hd:(d-6)/2, h:Y+h+6});   // sân thượng ngắm cảnh
    const MSG='🏙️ Tường tháp căn hộ – sảnh ở mặt Bắc (E)'; addSeg(t.x-w/2-1.5,t.z-d/2-1.5,t.x-2,t.z-d/2-1.5,.25,undefined,Y+5,MSG); addSeg(t.x+2,t.z-d/2-1.5,t.x+w/2+1.5,t.z-d/2-1.5,.25,undefined,Y+5,MSG);
    addSeg(t.x+w/2+1.5,t.z-d/2-1.5,t.x+w/2+1.5,t.z+d/2+1.5,.25,undefined,Y+5,MSG); addSeg(t.x+w/2+1.5,t.z+d/2+1.5,t.x-w/2-1.5,t.z+d/2+1.5,.25,undefined,Y+5,MSG); addSeg(t.x-w/2-1.5,t.z+d/2+1.5,t.x-w/2-1.5,t.z-d/2-1.5,.25,undefined,Y+5,MSG);
    t.door={x:t.x, z:t.z-d/2-2.6};
    INTER.push({x:t.door.x, z:t.door.z, r:2, prio:.6, label:`🏙️ ${t.name} – mua căn hộ cao tầng (E)`, action:()=>openCondo(t)});
    makeLabel(`🏙️ ${t.name}`, '28 tầng · căn hộ cao cấp · Penthouse', {h:.6, x:t.x, y:Y+8, z:t.door.z, fade:80}); }
  function openCondo(t){ const m=ui.modal(`🏙️ ${t.name} · căn hộ cao cấp River Tech`); const own=(S.condos||[]).filter(c=>c.tower===t.id);
    const OPT=[['🏠 Căn 2 phòng ngủ · tầng 8–15',1800,'2PN'],['🌇 Căn 3 phòng ngủ view sông · tầng 16–24',3200,'3PN'],['👑 Penthouse tầng 28 + sân thượng riêng',7500,'PH']];
    m.body.innerHTML=`<p class="muted">Khu nội đô River Tech chỉ bán căn hộ chung cư cao tầng. ${own.length?`Bạn đang sở hữu: <b>${own.map(c=>c.kind).join(', ')}</b>.`:''}</p><div class="grid">${OPT.map(([n,p,k])=>`<div class="card" data-k="${k}" style="cursor:pointer"><b>${n}</b><small>Giá ${fmt(p)} 💰 · về nhà bằng bản đồ (M) › "Căn hộ của bạn"</small></div>`).join('')}</div>`;
    m.body.querySelectorAll('[data-k]').forEach(el=>el.onclick=()=>{ const o=OPT.find(q=>q[2]===el.dataset.k); m.close(); askPay(o[1], `${o[0]} – ${t.name}`, ()=>{ if(!spend(o[1])) return; S.condos=S.condos||[]; S.condos.push({tower:t.id, kind:o[2], at:Date.now()}); save(); toast(`🎉 Chúc mừng! Bạn đã sở hữu ${o[0]} tại ${t.name}. Lên sân thượng ngắm cả River Tech nhé!`, 4200); }); }); }
  PLACES.push({icon:'🏠', name:'Căn hộ của bạn (River Tech)', sub:'Sân thượng tháp Beijing Starlight bạn sở hữu', go:()=>{ const c=(S.condos||[])[0], t=CONDO.find(q=>c && q.id===c.tower)||CONDO[0]; if(!c) toast('🏙️ Bạn chưa có căn hộ – tới sảnh tháp Beijing Starlight (E) để mua nhé.', 3200); teleport(t.x-4, t.z-4, t.x+20, t.z-60); P.y=Y+t.h+6; }});
  out.condos=CONDO;


  /* ============================== 9. BỆNH VIỆN · TRẠM CỨU HOẢ THỦY–BỘ · TRƯỜNG HỌC (js/civic.js dời vào CBD) ============================== */
  try{ const civ=await import('./civic.js'); out.civic=await civ.make(W, ctx, {dx:204.5, dz:50, y:Y}); }catch(e){ console.warn('[CBD] civic.js:', e); }
  // tàu cứu hoả + cầu tàu trên kênh Đông Hoa (bờ Đông) → "Thủy–Bộ"
  { const px=377, pz=300; KS.add(B(7,.3,3), M.wood, px-3.5,Y-.15,pz); plats.push({t:'r', x:px-3.5, z:pz, c:1, s:0, hw:3.5, hd:1.5, h:Y}); for(const s of [-1,1]) addSeg(px-7,pz+s*1.5,px,pz+s*1.5,.1,undefined,undefined,'⚓ Mép cầu tàu cứu hoả'); addSeg(px-7,pz-1.5,px-7,pz+1.5,.1,undefined,undefined,'⚓ Mép cầu tàu cứu hoả');
    const boat=new THREE.Mesh(mergeGeometries([RB(9,1.4,3,.5,3).translate(0,.2,0), RB(3.4,1.8,2.4,.3,2).translate(-1.2,1.7,0), CY(.12,.12,2.2,8).rotateZ(-.9).translate(2.6,2.2,0)].map(q=>q.index?q.toNonIndexed():q)), std(0xc8102e,{roughness:.4, metalness:.3}));
    boat.position.set(px-11,W.WATER_Y+.3,pz); boat.rotation.y=Math.PI/2; boat.castShadow=true; scene.add(boat); GLOW.add(px-12,W.WATER_Y+3.2,pz,1,0x3a7bd5,.8);
    makeLabel('🚤 Tàu cứu hoả · Trạm Thủy–Bộ', 'Cứu hộ trên sông & kênh 24/7', {h:.45, x:px-11, y:4.5, z:pz, fade:60}); }
  // Trung tâm Việc làm (bảng việc của jobs.js)
  { const x=285, z=400, w=30, d=24, h=18; const g=new THREE.BoxGeometry(w,h,d); g.translate(0,h/2,0); const uvA=g.attributes.uv; for(let i=0;i<uvA.count;i++) uvA.setXY(i, uvA.getX(i)*w/12, uvA.getY(i)*h/14.4); KH.add(g, facG, x,Y,z);
    KH.add(B(w+2,.6,d+2), M.white, x,Y+h+.3,z); KH.add(B(10,.4,4), M.silver, x,Y+4.2,z-d/2-2); for(const s of [-1,1]){ KH.add(CY(.18,.18,4,10), M.steel, x+s*4.6,Y+2,z-d/2-3.6); circles.push({x:x+s*4.6, z:z-d/2-3.6, r:.22}); }
    const MSG='🧑‍💼 Tường Trung tâm Việc làm – cửa ở mặt Bắc'; for(const [ax,az,bx,bz] of [[x-w/2,z-d/2,x-2.5,z-d/2],[x+2.5,z-d/2,x+w/2,z-d/2],[x+w/2,z-d/2,x+w/2,z+d/2],[x+w/2,z+d/2,x-w/2,z+d/2],[x-w/2,z+d/2,x-w/2,z-d/2]]) addSeg(ax,az,bx,bz,.25,undefined,undefined,MSG);
    INTER.push({x, z:z-d/2-1.4, r:2, prio:.7, label:'🧑‍💼 Trung tâm Việc làm – bảng việc & xin việc (E)', action:()=>{ if(W.jobs && W.jobs.open) W.jobs.open(); else toast('🧑‍💼 Bảng việc đang cập nhật…', 2200); }});
    makeLabel('🧑‍💼 Trung tâm Việc làm River Tech', 'Việc trí tuệ · xin việc 5 trụ sở Big Tech (E)', {h:.6, x, y:Y+h+3, z:z-d/2, fade:120}); out.jobCenter={x, z:z-d/2-1.4}; }

  /* ============================== 10. DANH SÁCH TOÀ CHO jobs / work (phỏng vấn · thẻ nhân viên · đi làm) ============================== */
  const H5=out.hq, TW=[
    {hq:'ring',   name:'The Infinite Loop QA Ring',      short:'QA Ring',   style:'hq', x:280, z:-30, w:108, d:108, h:24,  face:1,  door:H5.ring.door,     teams:['qa','dev'],   color:0xd9e2ea, inR:56},
    {hq:'dragon', name:'Dragonscale Auto-Labs',          short:'AutoLabs',  style:'hq', x:440, z:-20, w:90,  d:70,  h:28,  face:1,  door:H5.dragon.door,   teams:['qa','dev'],   color:0x9aa6b2, inR:48},
    {hq:'forest', name:'Silicon Forest Treehouse Hub',   short:'SiForest',  style:'hq', x:290, z:160, w:85,  d:75,  h:22,  face:1,  door:H5.forest.door,   teams:['qa'],         color:0x46d39a, inR:44},
    {hq:'tri',    name:'The Tri-Matrix Perf Center',     short:'TriMatrix', style:'hq', x:450, z:166, w:85,  d:74,  h:38,  face:-1, door:H5.tri.door,      teams:['perf'],       color:0x9dff5c, inR:40},
    {hq:'twin',   name:'Cantilever Cyber Twin-Tower',    short:'CyberTwin', style:'hq', x:365, z:340, w:90,  d:44,  h:120, face:-1, door:H5.twin.doors[0], teams:['qa','dev'],   color:0x4fc3ff, inR:30, locked:true}];
  out.towers=TW;
  // jobs.js · workpc.js giữ tham chiếu mảng downtown.towers → thay nội dung tại chỗ (W.life có thể chưa gán lúc module V2 nạp → chờ 1 khung)
  const swapTowers=()=>{ const L=W.life && W.life.downtown; if(!L) return false; if(Array.isArray(L.towers)){ if(L.towers[0]!==TW[0]){ L.towers.length=0; L.towers.push(...TW); } } else L.towers=TW; return true; };
  if(!swapTowers()){ const fn=()=>{ if(swapTowers()){ const i=HOOK.onFrame.indexOf(fn); if(i>=0) HOOK.onFrame.splice(i,1); } }; HOOK.onFrame.push(fn); }
  for(const t of TW){ makeLabel(`${t.locked?'🔒':'🏢'} ${t.name}`, t.locked?'Bảo vệ canh thang máy · chỉ nhân viên lên Cổng Trời':'Đi bộ vào thẳng · lễ tân phỏng vấn / quẹt thẻ (E)', {h:.55, x:t.door.x, y:Y+5.4, z:t.door.z, fade:60});
    const ring=new THREE.Mesh(new THREE.RingGeometry(1,1.25,32), new THREE.MeshBasicMaterial({color:0xffd23f, transparent:true, opacity:.75, side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.set(t.door.x,Y+.04,t.door.z); ring.userData.dynamic=true; scene.add(ring); t.doorRing=ring; }
  try{ out.interiors=makeInteriors(W, {Y, HQ:H5, towers:TW, Kit, M, std}); }catch(e){ console.warn('[CBD] bigtech_interiors:', e); }

  /* ============================== 10b. CỔNG NỐI VÙNG (biển cổng + nhãn) ============================== */
  for(const r of ROADS.filter(q=>q.gate)){ const gx=r.ew?(r.a===Z.x0?Z.x0:Z.x1):r.c, gz=r.ew?r.c:(r.a===Z.z0?Z.z0:Z.z1);
    for(const sd of [-1,1]){ const px=r.ew?gx+(gx<300?3:-3):gx+sd*(r.w/2+1.5), pz=r.ew?gz+sd*(r.w/2+1.5):gz+(gz<0?3:-3); KS.add(RB(1.2,6,1.2,.15,2), M.granite, px,Y+3,pz); KL.add(B(.5,.5,.5), M.gold, px,Y+6.3,pz); circles.push({x:px, z:pz, r:.7}); }
    makeLabel(`🚦 ${r.gate} · ${r.name}`, 'Đường nối sang vùng bên cạnh (V2)', {h:.5, x:gx, y:Y+7.5, z:gz, fade:90}); }
  out.gates=ROADS.filter(q=>q.gate).map(r=>({gate:r.gate, name:r.name}));

  /* ============================== 10c. ĐỒ THỊ ĐƯỜNG (cho taxi / xe bot xuyên vùng) ============================== */
  { const EW=ROADS.filter(r=>r.ew), NS=ROADS.filter(r=>!r.ew), segs=[];
    const snap=(r,v)=>{ for(const q of (r.ew?NS:EW)) if(Math.abs(v-q.c)<=q.w/2+.1 && r.c>=q.a-q.w && r.c<=q.b+q.w) return q.c; return v; };   // đầu đường nằm trong lòng đường cắt ngang → nối vào tâm giao lộ
    for(const r of ROADS){ const cuts=[snap(r,r.a), snap(r,r.b)]; for(const q of (r.ew?NS:EW)) if(q.c>=r.a-q.w/2-.1 && q.c<=r.b+q.w/2+.1 && r.c>=q.a-r.w/2-.1 && r.c<=q.b+r.w/2+.1) cuts.push(q.c); const u=[...new Set(cuts.map(v=>Math.round(v*10)/10))].sort((x,y)=>x-y);
      for(let i=0;i<u.length-1;i++) segs.push(r.ew?[u[i],r.c,u[i+1],r.c]:[r.c,u[i],r.c,u[i+1]]); }
    W.V2ROADS=W.V2ROADS||[]; W.V2ROADS.push({zone:'cbd', y:Y, segs, gates:{G1:[180,0], G4:[580,80], G5:[388,-120], G7:[450,460]}}); out.roadSegs=segs;
    const G=W.transit && W.transit.G; if(G && G.nodes){ const key=new Map(), nd=(x,z)=>{ const k=x.toFixed(1)+','+z.toFixed(1); if(!key.has(k)){ G.nodes.push({x,z,adj:[]}); key.set(k,G.nodes.length-1); } return key.get(k); };
      for(const [x0,z0,x1,z1] of segs){ const a=nd(x0,z0), b2=nd(x1,z1), d=Math.hypot(x1-x0,z1-z0); G.nodes[a].adj.push([b2,d]); G.nodes[b2].adj.push([a,d]); G.edges.push([a,b2]); } } }

  /* ============================== 11. BẢN ĐỒ (M) · ĐIỂM NHẢY ============================== */
  PLACES.push({icon:'🌃', name:'River Tech CBD · Nhạc nước', sub:'Đô thị lấn sông 3 kênh, 12 cầu, 5 trụ sở Big Tech – đứng trên Cầu Kính Hai Tầng', go:()=>teleport(280, 86, 300, 110)});
  for(const t of TW) PLACES.push({icon:t.locked?'🏙️':'🏢', name:t.name, sub:`Trụ sở ${t.short} · River Tech CBD`, go:()=>teleport(t.door.x, t.door.z+t.face*5, t.x, t.z)});
  PLACES.push({icon:'🏙️', name:'Beijing Starlight Towers', sub:'4 tháp căn hộ 28 tầng · mua căn hộ ở sảnh (E)', go:()=>teleport(262, 254, 262, 300)});
  PLACES.push({icon:'🧑‍💼', name:'Trung tâm Việc làm River Tech', sub:'Bảng việc & xin việc', go:()=>teleport(out.jobCenter.x, out.jobCenter.z-4, out.jobCenter.x, out.jobCenter.z+10)});
  try{ const TD=ctx.transit && ctx.transit.TAXI_DEST; if(TD) for(const t of TW) TD.push({icon:'🏢', name:t.name, x:t.door.x, z:t.door.z+t.face*8}); }catch(e){}

  /* ============================== 12. DỰNG KHỐI + KHUNG HÌNH ============================== */
  KL.build(); KS.build(); KB.build(); KH.build();
  let lastN=-1;
  HOOK.onFrame.push((dt,T)=>{ const n=W.night||0; if(Math.abs(n-lastN)>.004){ lastN=n; for(const o of NIGHT) o.m.emissiveIntensity=o.base+n*o.k; }
    const d=Math.hypot(Math.max(Z.x0-P.x,0,P.x-Z.x1), Math.max(Z.z0-P.z,0,P.z-Z.z1)); if(d<160) updFountain(T); jets.visible=d<260;
    for(const t of TW){ if(t.doorRing){ t.doorRing.material.opacity=.45+.35*Math.sin(T*3); } } });
  out.audit=()=>({towers:TW.map(t=>t.name), bridges:BR.length, willows:WIL.length, lamps:LAMP.length, interiors:out.interiors&&out.interiors.built});
  console.info('[River Tech CBD] dựng xong:', out.audit());
  return out;
}
