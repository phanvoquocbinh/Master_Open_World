// QC World V2 – PHA 5: CẢNG HÀNG KHÔNG QUỐC TẾ QA/QC (x −180→175 · z 220→380 · cao độ sân +4 m) – phiên qc-park, 15/11/2026
//  • Nhà ga "The Manta Ray" 160 × 72 m, mái cá đuối cao 28 m, thác nước trong nhà đổ từ giếng trời kính xuống thung lũng cây (kiểu Jewel),
//    quầy check-in, cổng soi chiếu an ninh, phòng chờ thương gia (bàn Bida + buffet), 6 cổng Boarding + ống lồng, sân đỗ 4 máy bay QC Airlines
//  • 2 đường băng song song trên hàng trụ nổi trên biển (dài ~348 m – vùng được giao chỉ rộng 355 m), đèn biên + đèn tiếp cận chạy nhấp nháy
//  • Đài Không lưu ATC 68 m (thang máy lên cabin ngắm toàn cảnh) · dốc + cầu nối sang River Tech CBD (x 175 → 180)
//  • CHUYẾN BAY THẬT: E ở cổng Boarding → chọn điểm đến · vé Phổ thông 25 💰 / Thương gia 80 💰 → máy bay lăn đà (45 m/s), ngóc mũi 15°,
//    bay lên tầng mây (≈ 240 m) theo CatmullRomCurve3 tới sân bay đích, hạ cánh êm; xoay chuột ngắm cảnh, X = hạ cánh nhanh
//  • W.AIRPORTS: sổ sân bay dùng chung – sân bay vùng khác (Dev City, Brain, Đảo Ngoại ngữ…) tự đăng ký {key,name,x,z,y,rwy:{x0,x1,z,y},spawn};
//    chưa đăng ký thì chuyến bay là "bay ngắm vùng đó rồi hạ cánh về đây"
import * as AK from './archKit.js';

export async function make(W, ctx){
  const {THREE, scene, circles, boxes, plats, INTER, PLACES, HOOK, P, toast, makeLabel, teleport, mergeGeometries, addSeg, EXTL} = W;
  const {S, save, ui, askPay, spend} = ctx;
  const Z=ctx.zone||{x0:-180, x1:175, z0:220, z1:380}, GY=4, TAU=Math.PI*2, R=Math.random;
  AK.bindNight(W);
  const out={};
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), CY=(a,b,h,n=12)=>new THREE.CylinderGeometry(a,b,h,n), RB=AK.roundedBox, V3=(x,y,z)=>new THREE.Vector3(x,y,z);
  const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.6}, o));
  const ctex=(w,h,draw,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; if(rep) t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; };
  const clampN=(v,a,b)=>v<a?a:v>b?b:v, pick=a=>a[Math.floor(R()*a.length)];
  const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3();
  function Kit(ox, oz, cast=true){ const parts=new Map();
    return { add(geo, mat, x=0,y=0,z=0, ry=0, rx=0, rz=0, sx=1,sy=1,sz=1){ const g=geo.index?geo.toNonIndexed():geo.clone();
        for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal' && k!=='uv') g.deleteAttribute(k);
        if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
        g.clearGroups(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m4.compose(_v.set(x-ox,y,z-oz), _q, _s.set(sx,sy,sz)); g.applyMatrix4(_m4);
        if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); return g; },
      build(parent=scene){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.position.set(ox,0,oz); ms.castShadow=cast; ms.receiveShadow=true; parent.add(ms); } parts.clear(); } }; }
  const NIGHT=[]; const night=(m,base,k)=>{ NIGHT.push({m,base,k}); m.emissiveIntensity=base; return m; };
  const M={ conc:AK.makeStoneMaterial({col:'#c9c6bf', joint:'#a9a59c', blockW:192, blockH:192, seed:71, rough:.85}), tile:AK.makeStoneMaterial({col:'#e9e6df', joint:'#cfcac0', blockW:128, blockH:128, seed:72, rough:.35}),
    asph:std(0x2f3136,{roughness:.9}), white:std(0xf2f4f5,{roughness:.5}), line:std(0xf4f2ec,{roughness:.5, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3}), yel:std(0xf2c230,{roughness:.5, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3}),
    steel:std(0xd5dbe2,{roughness:.2, metalness:1}), dark:std(0x262a31,{roughness:.5, metalness:.4}),
    glass:new THREE.MeshPhysicalMaterial({color:0x9fc6dd, roughness:.05, metalness:.15, transparent:true, opacity:.32, depthWrite:false, side:THREE.DoubleSide}), plant:std(0x4f8a37,{roughness:.85}),
    pier:std(0x8d8a84,{roughness:.9}), ledB:night(std(0x6fb6ff,{emissive:0x3f9bff, roughness:.4}),.3,2.4) };
  const KL=Kit(0,300,false), KS=Kit(0,300,true);

  /* ============================== 0. MẶT BẰNG ============================== */
  const TERM={x0:15, x1:165, z0:222, z1:294, H:28, wallH:12}, APRON={z0:294, z1:328}, RW=[{z:345, w:30, name:'Đường băng 09L/27R'}, {z:370, w:18, name:'Đường băng 09R/27L'}], RX0=-176, RX1=172;
  const RAMP={x0:165, x1:174.5, z0:250, z1:262}, BRG={x0:174.5, x1:180.5, z0:250, z1:262}, CBDY=2, ROADX=0, RDW=20;   // bậc thang xuống cầu sang CBD (+2) · đường xuyên cổng Bắc (0,220) ↔ cổng Nam (0,380)
  const inZone=(x,z)=>x>Z.x0+.5 && x<Z.x1-.5 && z>Z.z0+.5 && z<Z.z1-.5;
  const hAt=(x,z)=>GY;
  EXTL.push({x0:Z.x0, x1:BRG.x1, z0:Z.z0, z1:Z.z1, name:'QA/QC International Skyport', h:(x,z)=>{ if(inZone(x,z)) return hAt(x,z); if(x>=BRG.x0 && x<=BRG.x1 && z>BRG.z0 && z<BRG.z1) return CBDY; return null; }});
  out.layout={TERM, APRON, RW, RAMP, BRG, GY};
  const cx=(TERM.x0+TERM.x1)/2, cz=(TERM.z0+TERM.z1)/2, hw=(TERM.x1-TERM.x0)/2, hd=(TERM.z1-TERM.z0)/2;
  const wHalf=u=>Math.pow(Math.max(0,1-Math.pow(Math.abs(u),1.7)),.75);
  const halfZ=x=>(wHalf((x-cx)/hw)*.92+.08)*hd;   // nửa bề rộng nhà ga (theo z) tại x – đường viền cánh cá đuối
  const roofY=(u,t)=>GY+TERM.wallH+(TERM.H-TERM.wallH)*Math.pow(Math.max(0,1-u*u),1.1)*Math.pow(Math.max(0,1-t*t),.55);

  /* ============================== 1. NỀN + TRỤ NỔI TRÊN BIỂN + DỐC/CẦU SANG CBD + LAN CAN RÌA ============================== */
  { const top=new THREE.PlaneGeometry(Z.x1-Z.x0, APRON.z1-Z.z0); top.rotateX(-Math.PI/2); const uv=top.attributes.uv, p=top.attributes.position; for(let i=0;i<p.count;i++) uv.setXY(i, p.getX(i)/12, p.getZ(i)/12);
    KL.add(top, M.conc, (Z.x0+Z.x1)/2,GY+.01,(Z.z0+APRON.z1)/2); KS.add(B(Z.x1-Z.x0,GY+6,APRON.z1-Z.z0), M.conc, (Z.x0+Z.x1)/2,(GY-6)/2,(Z.z0+APRON.z1)/2);
    KS.add(B(Z.x1-Z.x0, 1.2, Z.z1-APRON.z1), M.conc, (Z.x0+Z.x1)/2,GY-.6,(APRON.z1+Z.z1)/2);
    for(let x=Z.x0+8;x<Z.x1;x+=16) for(let z=APRON.z1+6;z<Z.z1;z+=14) KS.add(CY(1.1,1.4,GY+6,10), M.pier, x,(GY-1.2-6)/2,z);
    const NST=10, sw=(RAMP.x1-RAMP.x0)/NST; for(let i=0;i<NST;i++){ const x=RAMP.x0+(i+.5)*sw, h=GY-(i+1)*(GY-CBDY)/NST; plats.push({t:'r', x, z:(RAMP.z0+RAMP.z1)/2, c:1, s:0, hw:sw/2+.02, hd:(RAMP.z1-RAMP.z0)/2, h}); KS.add(B(sw,h,RAMP.z1-RAMP.z0), M.tile, x,h/2,(RAMP.z0+RAMP.z1)/2); }
    KS.add(B(BRG.x1-BRG.x0+1,.6,BRG.z1-BRG.z0), M.white, (BRG.x0+BRG.x1)/2,CBDY-.3,(BRG.z0+BRG.z1)/2);
    for(const z of [BRG.z0+.2, BRG.z1-.2]){ KS.add(B(BRG.x1-BRG.x0+1,1.1,.12), M.glass, (BRG.x0+BRG.x1)/2,CBDY+.55,z); addSeg(BRG.x0-.5,z,BRG.x1+.5,z,.12,undefined,undefined,'🌉 Lan can cầu sang River Tech'); }
    for(const z of [RAMP.z0, RAMP.z1]){ for(let x=RAMP.x0;x<RAMP.x1;x+=1.5) KS.add(B(.08,1,.08), M.steel, x,GY-(x-RAMP.x0)/(RAMP.x1-RAMP.x0)*(GY-CBDY)+.5,z); addSeg(RAMP.x0,z,RAMP.x1,z,.12,undefined,undefined,'🛬 Lan can bậc thang nhà ga'); }
    const MSG='🌊 Rìa sân bay – không nhảy xuống biển được. Sang River Tech bằng cầu phía Đông.';
    const GX0=ROADX-RDW/2-5, GX1=ROADX+RDW/2+5;
    for(const [ax,az,bx,bz] of [[Z.x0+.5,Z.z0+.5,GX0,Z.z0+.5],[GX1,Z.z0+.5,Z.x1-.5,Z.z0+.5],[Z.x0+.5,Z.z1-.5,GX0,Z.z1-.5],[GX1,Z.z1-.5,Z.x1-.5,Z.z1-.5],[Z.x0+.5,Z.z0+.5,Z.x0+.5,Z.z1-.5],[Z.x1-.5,Z.z0+.5,Z.x1-.5,BRG.z0],[Z.x1-.5,BRG.z1,Z.x1-.5,Z.z1-.5]]){
      const L=Math.hypot(bx-ax,bz-az), mx=(ax+bx)/2, mz=(az+bz)/2; KS.add(B(.3,1.0,L), M.steel, mx,hAt(mx,mz)+.5,mz, Math.atan2(bx-ax,bz-az)); addSeg(ax,az,bx,bz,.25,undefined,undefined,MSG); } }

  /* ============================== 2. ĐƯỜNG BĂNG + ĐÈN DẪN ĐƯỜNG ============================== */
  const RL=[], AL=[];
  { const WH=[], YE=[], quad=(arr,x0,z0,x1,z1)=>arr.push([Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]);
    for(const r of RW){ const g=new THREE.PlaneGeometry(RX1-RX0, r.w); g.rotateX(-Math.PI/2); KL.add(g, M.asph, (RX0+RX1)/2,GY+.02,r.z);
      for(let x=RX0+30;x<RX1-30;x+=18) quad(WH, x, r.z-.4, x+9, r.z+.4);
      for(const x0 of [RX0+3, RX1-27]) for(let k=-r.w/2+2;k<r.w/2-2;k+=2.4) quad(WH, x0, r.z+k, x0+24, r.z+k+1.2);
      for(const sd of [-1,1]) quad(WH, RX0, r.z+sd*(r.w/2-.6)-.25, RX1, r.z+sd*(r.w/2-.6)+.25);
      for(let x=RX0+2;x<RX1;x+=12) for(const sd of [-1,1]) RL.push([x, r.z+sd*(r.w/2+.4)]);
      for(const [xe,dir] of [[RX0,-1],[RX1,1]]) for(let k=1;k<=6;k++) AL.push([xe+dir*k*.9, r.z, k]); }
    quad(YE, Z.x0+4, 311, RX1-10, 311.4); quad(YE, RX0+20, 311, RX0+20.4, RW[0].z-RW[0].w/2); quad(YE, RX1-20, 311, RX1-19.6, RW[0].z-RW[0].w/2);
    const qg=arr=>{ const pos=[], idx=[]; arr.forEach(([x0,z0,x1,z1],i)=>{ pos.push(x0,0,z0, x1,0,z0, x1,0,z1, x0,0,z1); const o=i*4; idx.push(o,o+2,o+1, o,o+3,o+2); }); const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
    for(const [arr,m] of [[WH,M.line],[YE,M.yel]]){ const ms=new THREE.Mesh(qg(arr), m); ms.position.y=GY+.035; ms.userData.dynamic=true; ms.userData.noFar=true; scene.add(ms); }
    const rl=new THREE.InstancedMesh(B(.35,.2,.35), M.ledB, RL.length); RL.forEach(([x,z],i)=>{ _m4.makeTranslation(x,GY+.1,z); rl.setMatrixAt(i,_m4); }); rl.userData.dynamic=true; scene.add(rl);
    const al=new THREE.InstancedMesh(new THREE.SphereGeometry(.35,8,6), new THREE.MeshBasicMaterial({color:0xffffff}), AL.length); al.userData.dynamic=true; al.frustumCulled=false; scene.add(al); out.approach={al, AL};
    for(const r of RW) makeLabel(`🛫 ${r.name}`, null, {h:.5, x:RX0+40, y:GY+3, z:r.z, fade:80}); }

  /* ============================== 2b. ĐƯỜNG XUYÊN SÂN BAY: cổng Bắc G2 (0,220) ↔ cổng Nam G8 (0,380), cắt ngang 2 đường băng có barie (kiểu Gibraltar) ============================== */
  const BAR=[];
  { const asph=new THREE.PlaneGeometry(RDW, Z.z1-Z.z0); asph.rotateX(-Math.PI/2); KL.add(asph, M.asph, ROADX,GY+.025,(Z.z0+Z.z1)/2);
    const WH=[], YE=[]; for(let z=Z.z0+2;z<Z.z1-2;z+=4.5) WH.push([ROADX-3.6,z,ROADX-3.4,z+2.4],[ROADX+3.4,z,ROADX+3.6,z+2.4]); YE.push([ROADX-.27,Z.z0,ROADX-.11,Z.z1],[ROADX+.11,Z.z0,ROADX+.27,Z.z1]); WH.push([ROADX-RDW/2+.25,Z.z0,ROADX-RDW/2+.42,Z.z1],[ROADX+RDW/2-.42,Z.z0,ROADX+RDW/2-.25,Z.z1]);
    const qg=arr=>{ const pos=[], idx=[]; arr.forEach(([x0,z0,x1,z1],i)=>{ pos.push(x0,0,z0, x1,0,z0, x1,0,z1, x0,0,z1); const o=i*4; idx.push(o,o+2,o+1, o,o+3,o+2); }); const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
    for(const [arr,m] of [[WH,M.line],[YE,M.yel]]){ const ms=new THREE.Mesh(qg(arr), m); ms.position.y=GY+.04; ms.userData.dynamic=true; ms.userData.noFar=true; scene.add(ms); }
    for(const sd of [-1,1]) KL.add(B(.24,.15,Z.z1-Z.z0), M.white, ROADX+sd*(RDW/2+.12),GY+.075,(Z.z0+Z.z1)/2);
    const armM=std(0xff3030,{roughness:.4}), lampM=new THREE.MeshBasicMaterial({color:0x330000});
    for(const r of RW) for(const sd of [-1,1]){ const z=r.z+sd*(r.w/2+4); if(z>Z.z1-1) continue; const side=sd<0?-1:1, px=ROADX+side*(RDW/2+1.2);
      KS.add(CY(.15,.18,1.2,10), M.dark, px,GY+.6,z); const ag=B(RDW,.18,.18); ag.translate(-side*RDW/2,0,0); const arm=new THREE.Mesh(ag, armM); arm.position.set(px,GY+1.15,z); arm.userData.dynamic=true; scene.add(arm);
      const lamp=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8), lampM); lamp.position.set(px,GY+2.2,z); lamp.userData.dynamic=true; scene.add(lamp); KS.add(CY(.08,.08,2,8), M.dark, px,GY+1.2,z); BAR.push({arm, side, z}); circles.push({x:px, z, r:.25}); }
    out.barLamp=lampM; out.BAR=BAR;
    makeLabel('🚧 Đường cắt ngang đường băng', 'Barie hạ + đèn đỏ khi máy bay lăn / cất / hạ cánh', {h:.5, x:ROADX+14, y:GY+4, z:RW[0].z, fade:90});
    for(const [gz,nm,to] of [[Z.z0,'G2 · Cổng Bắc','đi QA/QC Abyssal Island'],[Z.z1,'G8 · Cổng Nam','đi Wonderland & Kỳ Quan']]){ for(const sd of [-1,1]){ const px=ROADX+sd*(RDW/2+3), pz=gz+(gz<300?2:-2); KS.add(RB(1.2,6,1.2,.15,2), M.white, px,GY+3,pz); circles.push({x:px, z:pz, r:.7}); } makeLabel(`🚦 ${nm}`, to, {h:.5, x:ROADX, y:GY+7.5, z:gz, fade:90}); } }
  // cầu G2: cổng Nam đảo Abyssal (0,180,+4) → cổng Bắc sân bay (0,220,+4) – Skyport dựng (V2_PLAN 2b)
  { const z0=180, z1=Z.z0+.5, w=RDW+10; KS.add(B(w,.8,z1-z0), M.conc, ROADX,GY-.4,(z0+z1)/2); const g=new THREE.PlaneGeometry(RDW,z1-z0); g.rotateX(-Math.PI/2); KL.add(g, M.asph, ROADX,GY+.02,(z0+z1)/2);
    for(let z=z0+4;z<z1;z+=10) for(const sd of [-1,1]) KS.add(CY(.9,1.1,GY+5,10), M.pier, ROADX+sd*(RDW/2+2),(GY-5)/2,z);
    for(const sd of [-1,1]){ const x=ROADX+sd*(w/2-.2); KS.add(B(.3,1.0,z1-z0), M.steel, x,GY+.5,(z0+z1)/2); addSeg(x,z0-.5,x,z1+.5,.2,undefined,undefined,'🌉 Lan can cầu nối đảo Abyssal ↔ Sân bay'); }
    plats.push({t:'r', x:ROADX, z:(z0+z1)/2, c:1, s:0, hw:w/2, hd:(z1-z0)/2, h:GY});
    makeLabel('🌉 Cầu G2 · Abyssal ↔ Sân bay', null, {h:.45, x:ROADX, y:GY+3.5, z:(z0+z1)/2, fade:70}); }

  /* ============================== 3. NHÀ GA "THE MANTA RAY" ============================== */
  { const N=64, Mt=24, pos=[], uvA=[], idx=[];
    for(let j=0;j<=Mt;j++) for(let i=0;i<=N;i++){ const u=i/N*2-1, t=j/Mt*2-1, w=wHalf(u)*.92+.08; pos.push(cx+u*hw, roofY(u,t), cz+t*w*hd); uvA.push(u*8,t*4); }
    for(let j=0;j<Mt;j++) for(let i=0;i<N;i++){ const a=j*(N+1)+i, b=a+1, c=a+N+1, d=c+1; idx.push(a,c,b, b,c,d); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uvA,2)); g.setIndex(idx); g.computeVertexNormals();
    const rt=ctex(256,256,(x,w,h)=>{ x.fillStyle='#e9edf0'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(120,135,150,.5)'; x.lineWidth=2; for(let k=0;k<w;k+=32){ x.beginPath(); x.moveTo(k,0); x.lineTo(k,h); x.stroke(); } x.fillStyle='rgba(150,190,220,.6)'; for(let k=0;k<w;k+=64) x.fillRect(k+8,0,16,h); }, true);
    const roof=new THREE.Mesh(g, new THREE.MeshStandardMaterial({map:rt, roughness:.3, metalness:.6, side:THREE.DoubleSide})); roof.castShadow=true; roof.receiveShadow=true; scene.add(roof);
    const outline=[]; for(let i=0;i<=N;i++){ const u=i/N*2-1; outline.push([cx+u*hw, cz-(wHalf(u)*.92+.08)*hd, u, -1]); } for(let i=N;i>=0;i--){ const u=i/N*2-1; outline.push([cx+u*hw, cz+(wHalf(u)*.92+.08)*hd, u, 1]); }
    out.doorE={x:TERM.x1-3, z:cz};
    for(let i=0;i<outline.length-1;i++){ const [ax,az,ua,ta]=outline[i], [bx,bz,ub,tb]=outline[i+1], L=Math.hypot(bx-ax,bz-az); if(L<.05) continue; const h=roofY((ua+ub)/2,(ta+tb)/2)-GY;
      const mx=(ax+bx)/2, mz=(az+bz)/2; const pl=new THREE.PlaneGeometry(L,h); pl.translate(0,h/2,0); KS.add(pl, M.glass, mx,GY,mz, Math.atan2(bx-ax,bz-az)+Math.PI/2);
      if(mx>TERM.x1-6) continue; addSeg(ax,az,bx,bz,.25,undefined,undefined,'✈️ Vách kính nhà ga Manta Ray – cửa vào ở mũi cánh Đông (dốc từ River Tech)'); }
    for(const [u,t] of [[-.55,-.4],[-.55,.4],[-.2,-.5],[-.2,.5],[.2,-.5],[.2,.5],[.55,-.4],[.55,.4]]){ const x=cx+u*hw, z=cz+t*wHalf(u)*hd, h=roofY(u,t)-GY;
      KS.add(CY(.5,.8,h*.7,12), M.white, x,GY+h*.35,z); for(let k=0;k<4;k++){ const a=k/4*TAU+.4; KS.add(CY(.15,.3,h*.45,8), M.white, x+Math.cos(a)*1.8,GY+h*.85,z+Math.sin(a)*1.8, 0, Math.sin(a)*.5, -Math.cos(a)*.5); } circles.push({x,z,r:.9}); }
    const fl=new THREE.PlaneGeometry(TERM.x1-TERM.x0-2, TERM.z1-TERM.z0-2); fl.rotateX(-Math.PI/2); const uv=fl.attributes.uv, p=fl.attributes.position; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i)/6,p.getZ(i)/6); KL.add(fl, M.tile, cx,GY+.025,cz); }

  /* ---------- 3a. THÁC NƯỚC TRONG NHÀ ---------- */
  const FALL={x:85, z:258};
  { const {x,z}=FALL, top=roofY((x-cx)/hw,0)+.5;
    KS.add(new THREE.CylinderGeometry(9,3.5,4,40,1,true), M.glass, x,top-1,z); KS.add(new THREE.TorusGeometry(9,.3,8,48).rotateX(Math.PI/2), M.steel, x,top+1,z);
    const ft=ctex(64,256,(g,w,h)=>{ g.clearRect(0,0,w,h); for(let i=0;i<220;i++){ g.fillStyle=`rgba(255,255,255,${.15+R()*.5})`; g.fillRect(R()*w, R()*h, 1+R()*2, 6+R()*24); } }, true); ft.repeat.set(6,2);
    const fm=new THREE.MeshStandardMaterial({map:ft, color:0xcfefff, transparent:true, opacity:.75, depthWrite:false, roughness:.1, emissive:0x9fd8ff, emissiveIntensity:.15, side:THREE.DoubleSide});
    const PT=GY+1.9, fall=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.6,top-PT-1.5,32,1,true), fm); fall.position.set(x,PT+(top-PT-1.5)/2,z); fall.userData.dynamic=true; scene.add(fall); out.fall={fall, ft};
    const pool=new THREE.Mesh(new THREE.CircleGeometry(8,48), std(0x2b7f8f,{roughness:.05, metalness:.3})); pool.rotation.x=-Math.PI/2; pool.position.set(x,PT+.05,z); scene.add(pool);
    KS.add(new THREE.TorusGeometry(8,.4,10,48).rotateX(Math.PI/2), M.conc, x,PT+.15,z);
    for(let k=0;k<3;k++){ const r0=18.5-k*3.4, hh=.62*(k+1); KS.add(new THREE.CylinderGeometry(r0,r0+.5,hh,48,1,false), M.plant, x,GY+hh/2,z); KS.add(new THREE.TorusGeometry(r0+.1,.12,6,48).rotateX(Math.PI/2), M.conc, x,GY+hh,z); }   /* gò cây bậc thang: vòng ngoài thấp, vòng trong cao */
    const trees=[]; for(let i=0;i<26;i++){ const a=i/26*TAU, k=i%3, r=[16.8,13.4,10][k]; trees.push([x+Math.cos(a)*r, z+Math.sin(a)*r, GY+.62*(k+1)]); }
    const tg=mergeGeometries([CY(.15,.22,2.6,7).translate(0,1.3,0), new THREE.IcosahedronGeometry(1.3,1).translate(0,3.2,0)].map(q=>{ q=q.index?q.toNonIndexed():q; q.deleteAttribute('uv'); return q; }));
    const ti=new THREE.InstancedMesh(tg, M.plant, trees.length); trees.forEach(([tx,tz,ty],i)=>{ _m4.makeTranslation(tx,ty,tz); ti.setMatrixAt(i,_m4); }); ti.userData.dynamic=true; scene.add(ti);
    circles.push({x,z,r:19.5}); makeLabel('💧 Thác nước Manta Ray', 'Đổ từ giếng trời kính xuống thung lũng cây', {h:.5, x, y:GY+8, z:z-20, fade:45}); }

  /* ---------- 3b. CHECK-IN · SOI CHIẾU AN NINH · 6 CỔNG BOARDING · PHÒNG CHỜ THƯƠNG GIA ---------- */
  const scr=std(0x0e1a24,{emissive:0x3fb8ff, emissiveIntensity:.6, roughness:.2});
  for(let i=0;i<8;i++){ const x=138+(i%4)*5.4, z=i<4?251:265; KS.add(RB(3.8,1.1,1.0,.12,2), M.white, x,GY+.55,z); KS.add(B(.9,.6,.08), scr, x,GY+1.5,z+.4); KS.add(B(3.8,.25,1.2), M.dark, x,GY+.25,z-1.1); boxes.push({x0:x-1.95, x1:x+1.95, z0:z-.55, z1:z+.55}); }
  INTER.push({x:146, z:258, r:3, prio:.5, label:'🧳 Quầy check-in QC Airlines (E)', action:()=>toast(`🧳 Chào ${(W.PROFILE&&W.PROFILE.name)||'bạn'}! Qua cổng soi chiếu rồi tới 6 cổng Boarding phía Nam để mua vé (Phổ thông 25 💰 · Thương gia 80 💰).`, 4000)});
  makeLabel('🧳 Check-in · QC Airlines', null, {h:.5, x:146, y:GY+4, z:258, fade:40});
  { const x=127, zA=cz-halfZ(x)+1, zB=cz+halfZ(x)-1, gates=[cz-8,cz,cz+8];
    for(const z of gates){ KS.add(B(1.6,2.4,.4), M.dark, x,GY+1.2,z-1); KS.add(B(1.6,2.4,.4), M.dark, x,GY+1.2,z+1); KS.add(B(1.6,.4,2.4), M.dark, x,GY+2.4,z); KS.add(B(.4,.08,1.6), std(0x40ff80,{emissive:0x40ff80, emissiveIntensity:1}), x-.6,GY+2.65,z);
      boxes.push({x0:x-.8, x1:x+.8, z0:z-1.25, z1:z-.75}, {x0:x-.8, x1:x+.8, z0:z+.75, z1:z+1.25}); }   /* lối đi qua cổng soi theo trục x */
    let s=zA; for(const z of gates){ addSeg(x,s,x,z-.8,.15,undefined,GY+2.2,'🛂 Vách soi chiếu an ninh – đi qua 1 trong 3 cổng soi (đèn xanh)'); s=z+.8; } addSeg(x,s,x,zB,.15,undefined,GY+2.2,'🛂 Vách soi chiếu an ninh – đi qua 1 trong 3 cổng soi (đèn xanh)');
    for(let z=zA;z<zB;z+=2.4) KS.add(B(.1,2.2,2.2), M.glass, x,GY+1.1,z+1.1);
    INTER.push({x:x+2.5, z:cz, r:2.2, prio:.5, label:'🛂 Soi chiếu an ninh (E)', action:()=>toast('🛂 Bíp xanh! Hành lý an toàn – mời bạn vào khu cổng ra máy bay.', 2600)}); }
  const GATES=[]; for(let i=0;i<6;i++){ const x=39+i*15, wz=cz+halfZ(x), z=wz-5; GATES.push({x, z, wz, no:i+1}); KS.add(RB(3,1.1,1,.12,2), std(0x1d6ab8,{roughness:.35}), x,GY+.55,z); KS.add(B(1.6,.9,.08), scr, x,GY+2.4,z-.4); boxes.push({x0:x-1.55, x1:x+1.55, z0:z-.55, z1:z+.55});
    for(let k=0;k<2;k++){ const bz=z-5-k*2.6; KS.add(RB(5,.45,.6,.1,2), std(0x30363f,{roughness:.6}), x,GY+.45,bz); W.addBench && W.addBench({x, z:bz, rot:Math.PI, len:4.6, y:GY+.48, floor:GY, label:`🪑 Ngồi chờ cổng ${i+1} (E · C)`}); boxes.push({x0:x-2.5, x1:x+2.5, z0:bz-.3, z1:bz+.3}); }
    makeLabel(`🛫 Cổng ${i+1}`, 'Mua vé & lên máy bay (E ở quầy cổng)', {h:.42, x, y:GY+4, z, fade:30}); }
  const VIP={x0:101, x1:123, z0:cz-halfZ(112)+1.5, z1:cz-halfZ(112)+15};
  { const {x0,x1,z0,z1}=VIP, mx=(x0+x1)/2, mz=(z0+z1)/2;
    for(const [ax,az,bx,bz] of [[x0,z0,x1,z0],[x1,z0,x1,z1-4],[x0,z1,x1,z1],[x0,z0,x0,z1]]){ KS.add(B(Math.abs(bx-ax)||.1,3.2,Math.abs(bz-az)||.1), M.glass, (ax+bx)/2,GY+1.6,(az+bz)/2); addSeg(ax,az,bx,bz,.12,undefined,GY+3.4,'🥂 Vách kính phòng chờ thương gia – cửa ở góc Đông Nam'); }
    KS.add(B(x1-x0,.08,z1-z0), AK.makeWoodMaterial({col:'#5a3518', plank:30, seed:74}), mx,GY+.05,mz);
    AK.buildBilliardTable(W, x0+5.5, GY+.09, mz, Math.PI/2, 0x0d5a3c, 'world');
    KS.add(RB(7,1,1.2,.12,2), M.white, x1-6,GY+.5,z0+2.2); for(let k=0;k<5;k++) KS.add(CY(.35,.35,.12,16), std([0xffb547,0xff6b6b,0x46d39a,0xfff1c8,0x4fc3ff][k]), x1-8.8+k*1.4,GY+1.08,z0+2.2); boxes.push({x0:x1-9.5, x1:x1-2.5, z0:z0+1.6, z1:z0+2.8});
    for(const sx of [x1-6, x1-12]){ const sz=z1-3; KS.add(RB(3,.5,1.1,.2,3), std(0x3d4a5c,{roughness:.9}), sx,GY+.3,sz); KS.add(RB(3,.8,.3,.15,3), std(0x3d4a5c,{roughness:.9}), sx,GY+.6,sz+.5); W.addBench && W.addBench({x:sx, z:sz, rot:Math.PI, len:2.8, y:GY+.55, floor:GY, label:'🛋️ Ngồi sofa phòng chờ thương gia (E · C)'}); boxes.push({x0:sx-1.5, x1:sx+1.5, z0:sz-.6, z1:sz+.6}); }
    INTER.push({x:x1-6, z:z0+4, r:2, prio:.5, label:'🍣 Buffet thương gia (E)', action:()=>{ S.buffs=S.buffs||{}; S.buffs.energy=Math.max(Date.now(), S.buffs.energy||0)+5*60000; save(); toast('🍣 Sushi, phở bò, bánh flan… no nê! +5 phút chạy nhanh ⚡', 3000); }});
    makeLabel('🥂 Phòng chờ Thương gia · QC Airlines', 'Bida · buffet · sofa', {h:.5, x:mx, y:GY+5, z:mz, fade:40}); }

  /* ============================== 4. MÁY BAY QC AIRLINES ============================== */
  const liv=ctex(1024,128,(g,w,h)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); g.fillStyle='#1d6ab8'; g.fillRect(0,h*.62,w,h*.16); g.fillStyle='#ffc531'; g.fillRect(0,h*.78,w,h*.06);
    g.fillStyle='#16324f'; for(let x=140;x<w-120;x+=17) g.fillRect(x,h*.32,9,h*.16); g.fillStyle='#1d6ab8'; g.font='800 46px "Segoe UI",sans-serif'; g.textAlign='left'; g.fillText('QC AIRLINES',150,h*.26); });
  const fusM=new THREE.MeshStandardMaterial({map:liv, roughness:.35, metalness:.3}), wingM=std(0xd9dfe5,{roughness:.35, metalness:.5}), finM=std(0x1d6ab8,{roughness:.35, metalness:.3}), engM=std(0xbfc6cd,{roughness:.25, metalness:.8});
  function planeGroup(){ const g=new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(2,2,30,24,1,true).rotateZ(Math.PI/2), fusM));
    const nose=new THREE.Mesh(new THREE.SphereGeometry(2,24,16,0,TAU,0,Math.PI/2).rotateZ(-Math.PI/2).scale(2.2,1,1), wingM); nose.position.x=15; g.add(nose);
    const tail=new THREE.Mesh(new THREE.ConeGeometry(2,8,24).rotateZ(Math.PI/2), wingM); tail.position.set(-19,.6,0); g.add(tail);
    const wingS=new THREE.Shape(); wingS.moveTo(2,0); wingS.lineTo(-3,16.5); wingS.lineTo(-6,16.5); wingS.lineTo(-6,0); wingS.closePath();
    for(const s of [-1,1]){ const wg=new THREE.ExtrudeGeometry(wingS,{depth:.35, bevelEnabled:false}); wg.rotateX(Math.PI/2); const w=new THREE.Mesh(wg, wingM); w.scale.z=s; w.position.set(0,-.8,0); g.add(w); }
    const stS=new THREE.Shape(); stS.moveTo(0,0); stS.lineTo(-3,6); stS.lineTo(-5,6); stS.lineTo(-4,0); stS.closePath();
    for(const s of [-1,1]){ const sg=new THREE.ExtrudeGeometry(stS,{depth:.2, bevelEnabled:false}); sg.rotateX(Math.PI/2); const m=new THREE.Mesh(sg, wingM); m.scale.z=s; m.position.set(-17,1,0); g.add(m); }
    const finS=new THREE.Shape(); finS.moveTo(0,0); finS.lineTo(-5,7.5); finS.lineTo(-7.5,7.5); finS.lineTo(-6,0); finS.closePath(); const fin=new THREE.Mesh(new THREE.ExtrudeGeometry(finS,{depth:.3, bevelEnabled:false}), finM); fin.position.set(-15,1.5,-.15); g.add(fin);
    for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.0,4.2,18).rotateZ(Math.PI/2), engM); e.position.set(1.2,-2.0,s*6.5); g.add(e); }
    for(const [x,z] of [[11,0],[-1,-3],[-1,3]]){ const gear=new THREE.Mesh(CY(.45,.45,.5,10).rotateX(Math.PI/2), M.dark); gear.position.set(x,-3.1,z); g.add(gear); const leg=new THREE.Mesh(CY(.12,.12,1.4,6), M.steel); leg.position.set(x,-2.4,z); g.add(leg); }
    for(const [c,x,z] of [[0xff3030,-2.6,-16.6],[0x30ff60,-2.6,16.6]]){ const l=new THREE.Mesh(new THREE.SphereGeometry(.25,8,6), new THREE.MeshBasicMaterial({color:c})); l.position.set(x,-.6,z); g.add(l); }
    // gộp theo vật liệu → 1 máy bay ≈ 6 lượt vẽ thay vì ~25
    g.updateMatrixWorld(true); const byM=new Map(); g.traverse(o=>{ if(!o.isMesh) return; let q=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); q.applyMatrix4(o.matrixWorld); for(const k of Object.keys(q.attributes)) if(k!=='position'&&k!=='normal'&&k!=='uv') q.deleteAttribute(k); if(!q.attributes.uv) q.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(q.attributes.position.count*2),2)); q.clearGroups(); if(!byM.has(o.material)) byM.set(o.material,[]); byM.get(o.material).push(q); });
    const out2=new THREE.Group(); for(const [m,list] of byM){ const ms=new THREE.Mesh(mergeGeometries(list,false), m); ms.castShadow=true; out2.add(ms); } out2.userData.dynamic=true; return out2; }
  const PLANE_Y=GY+3.55;
  const PARK=[]; for(let i=0;i<4;i++){ const x=TERM.x0+20+i*36, z=310.5; const p=planeGroup(); p.position.set(x,PLANE_Y,z); p.rotation.y=Math.PI; scene.add(p); PARK.push(p);
    boxes.push({x0:x-20, x1:x+23, z0:z-2.3, z1:z+2.3}); const wb={x0:x-2, x1:x+6, z0:z-17, z1:z+17, y0:GY+1.6, y1:GY+3.5}; boxes.push(wb); }
  for(const g of GATES){ const L=308.2-g.wz; KS.add(RB(3,3,L,.4,2), M.white, g.x,GY+4,g.wz+L/2); KS.add(CY(.5,.5,3.6,10), M.dark, g.x,GY+1.8,308.2-1); circles.push({x:g.x, z:307.2, r:.55}); }

  /* ============================== 5. ĐÀI KHÔNG LƯU ATC 68 m ============================== */
  const ATC={x:-58, z:252, H:68};
  { const {x,z,H}=ATC; KS.add(CY(3.2,4.2,H-8,24), M.white, x,GY+(H-8)/2,z); for(let y=8;y<H-10;y+=6) KS.add(new THREE.TorusGeometry(3.4,.12,6,32).rotateX(Math.PI/2), M.steel, x,GY+y,z);
    KS.add(CY(7.5,4,3,24), M.white, x,GY+H-9,z); KS.add(CY(8.2,7.6,4.2,24,1,true), M.glass, x,GY+H-5.4,z); KS.add(CY(8.6,8.2,.6,24), M.white, x,GY+H-7.5,z); KS.add(CY(8.8,7,1.4,24), M.dark, x,GY+H-2.6,z); KS.add(CY(.15,.15,9,8), M.steel, x,GY+H+2.6,z);
    const bcn=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8), new THREE.MeshBasicMaterial({color:0xff2020})); bcn.position.set(x,GY+H+7.2,z); bcn.userData.dynamic=true; scene.add(bcn); out.beacon=bcn;
    circles.push({x,z,r:4.4}); const CY0=GY+H-7.2; plats.push({t:'c', x, z, r:7.6, h:CY0});
    for(let i=0;i<32;i++){ const a=i/32*TAU, b=(i+1)/32*TAU; addSeg(x+Math.cos(a)*7.8,z+Math.sin(a)*7.8,x+Math.cos(b)*7.8,z+Math.sin(b)*7.8,.12,CY0-.4,CY0+3,'🗼 Kính cabin không lưu'); }
    for(let k=0;k<6;k++){ const a=k/6*TAU; KS.add(RB(2.2,.9,1,.1,2), M.dark, x+Math.cos(a)*5.6,CY0+.45,z+Math.sin(a)*5.6, -a); }
    INTER.push({x, z:z+5.6, r:2, prio:.7, when:()=>P.y<GY+2, label:'🛗 Thang máy lên cabin Đài Không lưu 60 m (E)', action:()=>{ P.x=x; P.z=z+5; P.y=CY0+.02; toast('🗼 Cabin không lưu: nhìn toàn cảnh 2 đường băng, River Tech và biển!', 3200); }});
    INTER.push({x, z:z+5, r:2.2, prio:.7, when:()=>P.y>CY0-1, label:'🛗 Thang máy xuống chân đài (E)', action:()=>{ P.x=x; P.z=z+6.4; P.y=GY+.02; }});
    INTER.push({x:x+5.6, z, r:2, prio:.5, when:()=>P.y>CY0-1, label:'🎧 Nghe tần số không lưu (E)', action:()=>toast(pick(['🎧 "QC 102, cleared for takeoff runway 27R, wind 090 at 8."','🎧 "QC 215, descend and maintain 3000, expect ILS 09L."','🎧 "Ground, QC 77 request pushback gate 3."']), 3600)});
    makeLabel('🗼 Đài Không lưu ATC · 68 m', 'Thang máy lên cabin ngắm cảnh (E)', {h:.6, x, y:GY+H+9, z, fade:240}); }

  /* ============================== 6. SỔ SÂN BAY + CHUYẾN BAY THẬT ============================== */
  W.AIRPORTS=W.AIRPORTS||[];
  const HOME={key:'skyport', name:'QA/QC International Skyport', x:cx, z:RW[0].z, y:GY, rwy:{x0:RX0, x1:RX1, z:RW[0].z, y:GY}, spawn:{x:GATES[2].x, z:GATES[2].z-8, lx:GATES[2].x, lz:TERM.z0}};
  if(!W.AIRPORTS.find(a=>a.key==='skyport')) W.AIRPORTS.push(HOME);
  const DEST=[{key:'devcity', name:'Dev City Trùng Khánh (Sân bay Đỉnh Núi)', icon:'🌆', x:500, z:-850}, {key:'brain', name:'Đỉnh QA/QC Brain (Brain Skyport)', icon:'🧠', x:900, z:78},
    {key:'swiss', name:'Đảo Ngoại ngữ (Sân bay Thảo nguyên & Thủy phi cơ)', icon:'🗻', x:-305, z:175}, {key:'palm', name:'Ốc đảo Palm Dubai', icon:'🌴', x:650, z:920}, {key:'tour', name:'Chuyến bay ngắm cảnh QC World (quay về)', icon:'🌅', x:380, z:100}];
  let flight=null, plane=null, savedDist=null, fastKey=false;
  addEventListener('keydown', e=>{ if(flight && e.code==='KeyX') fastKey=true; });
  function boardingModal(g){ const m=ui.modal(`🛫 Cổng ${g.no} · QC Airlines – chọn điểm đến`);
    const rows=DEST.map(d=>{ const real=!!W.AIRPORTS.find(a=>a.key===d.key) || d.key==='tour'; return `<div class="card"><div class="ic">${d.icon}</div><b>${d.name}</b><small>${real?(d.key==='tour'?'Bay vòng qua các vùng rồi hạ cánh lại đây':'Hạ cánh ở sân bay đích'):'Sân bay đích đang xây → bay ngắm vùng đó rồi hạ cánh về đây'}</small><div class="row" style="gap:6px;margin-top:6px"><button class="btn" data-c="eco" data-k="${d.key}">Phổ thông 25 💰</button><button class="btn pri" data-c="biz" data-k="${d.key}">Thương gia 80 💰</button></div></div>`; }).join('');
    m.body.innerHTML=`<p class="muted">Máy bay lăn đà, cất cánh lên tầng mây rồi hạ cánh thật. Xoay chuột để ngắm cảnh, bấm <b>X</b> để hạ cánh nhanh.</p><div class="grid">${rows}</div>`;
    m.body.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ const d=DEST.find(q=>q.key===b.dataset.k), biz=b.dataset.c==='biz', price=biz?80:25; m.close();
      askPay(price, `✈️ Vé ${biz?'Thương gia':'Phổ thông'} QC Airlines → ${d.name}`, ()=>{ if(!spend(price)) return; S.flights=(S.flights||0)+1; save(); startFlight(d, biz?'biz':'eco'); }); }); }
  for(const g of GATES) INTER.push({x:g.x, z:g.z-1.6, r:1.8, prio:.8, label:`🛫 Boarding cổng ${g.no} – mua vé & lên máy bay (E)`, action:()=>boardingModal(g)});
  // đường bay: lăn đà trên 09L (Tây → Đông), cất cánh, lên tầng mây, tới đích, hạ cánh (sân đích đã đăng ký) hoặc vòng về hạ cánh 09L
  function buildPath(d){ const r=RW[0], y0=PLANE_Y, pts=[V3(RX0+10,y0,r.z), V3(RX0+110,y0,r.z), V3(RX0+190,y0+3,r.z), V3(RX1+120,y0+60,r.z), V3(RX1+380,GY+170,r.z-120)];
    const ap=W.AIRPORTS.find(a=>a.key===d.key && a.key!=='skyport');
    if(ap){ const rw=ap.rwy||{x0:ap.x-120, x1:ap.x+120, z:ap.z, y:ap.y||0}; pts.push(V3(rw.x0-700, rw.y+240, rw.z+300)); pts.push(V3(rw.x0-420, rw.y+90, rw.z)); pts.push(V3(rw.x0-120, rw.y+20, rw.z)); pts.push(V3(rw.x0+20, rw.y+3.55, rw.z)); pts.push(V3(rw.x0+160, rw.y+3.55, rw.z)); pts.push(V3(rw.x0+230, rw.y+3.55, rw.z)); return {curve:new THREE.CatmullRomCurve3(pts), land:ap, landAt:pts.length-3}; }
    if(d.key==='tour') for(const [x,z] of [[480,40],[900,180],[700,900],[-60,950],[-560,-60],[-420,330]]) pts.push(V3(x,235+R()*30,z));
    else { pts.push(V3(d.x-200, 240, d.z-200)); pts.push(V3(d.x+150, 230, d.z)); pts.push(V3(d.x, 250, d.z+200)); }
    pts.push(V3(RX0-700, GY+200, r.z+300)); pts.push(V3(RX0-420, GY+90, r.z)); pts.push(V3(RX0-120, GY+20, r.z)); pts.push(V3(RX0+20, PLANE_Y, r.z)); pts.push(V3(RX0+170, PLANE_Y, r.z)); pts.push(V3(RX0+260, PLANE_Y, r.z));
    return {curve:new THREE.CatmullRomCurve3(pts), land:HOME, landAt:pts.length-3}; }
  function startFlight(d, cls){ if(HOOK.vehicle || flight) return; const {curve, land, landAt}=buildPath(d); const L=curve.getLength(); 
    const uLand=(()=>{ const pts=curve.points; let best=0, bd=1e18; for(let i=100;i<=400;i++){ const u=i/400, p=curve.getPointAt(u), q=p.distanceToSquared(pts[landAt]);   /* nửa sau quãng bay (điểm chạm đất trùng gần điểm cất cánh) */ if(q<bd){ bd=q; best=u; } } return best; })();
    plane=plane||planeGroup(); scene.add(plane); plane.visible=true; W.me.g.visible=false; savedDist=W.cam && W.cam.dist; if(W.cam) W.cam.dist=46; fastKey=false;
    flight={d, cls, curve, L, s:0, v:0, uLand, land, bank:0, t:0}; const ctrl={ drive(dt){ if(!flight || HOOK.vehicle!==ctrl) return; stepFlight(dt); } }; flight.ctrl=ctrl; HOOK.vehicle=ctrl;
    toast(`✈️ ${cls==='biz'?'Ghế Thương gia':'Ghế Phổ thông'} cạnh cửa sổ · Cơ trưởng: "Tổ bay chuẩn bị cất cánh – thắt dây an toàn nhé!" (X: hạ cánh nhanh)`, 4200); }
  const _tg=new THREE.Vector3(), _ta=new THREE.Vector3(), _pt=new THREE.Vector3();
  function stepFlight(dt){ const f=flight; f.t+=dt; const sLand=f.uLand*f.L, rollEnd=190, tail=Math.max(30,f.L-sLand);
    if(fastKey && f.s<sLand-900){ f.s=sLand-900; f.v=60; fastKey=false; toast('⏩ Hạ cánh nhanh – máy bay đang tiếp cận đường băng…', 2200); } fastKey=false;
    let vT; if(f.s<rollEnd) vT=Math.min(45,Math.max(6, Math.sqrt(2*5.3*(f.s+1)))); else if(f.s<sLand-1200) vT=72; else if(f.s<sLand) vT=58; else vT=Math.max(0, 40*(1-(f.s-sLand)/tail));
    f.v+=(vT-f.v)*Math.min(1,dt*(f.s<rollEnd?3:1.2)); f.s=Math.min(f.L, f.s+Math.max(f.v,1.5)*dt);
    const u=f.s/f.L; f.curve.getPointAt(u,_pt); f.curve.getTangentAt(u,_tg); f.curve.getTangentAt(Math.min(1,u+.01),_ta);
    const turn=Math.atan2(_tg.x*_ta.z-_tg.z*_ta.x, _tg.x*_ta.x+_tg.z*_ta.z); f.bank+=(clampN(-turn*14,-.6,.6)-f.bank)*Math.min(1,dt*1.2);
    const ground=f.s<rollEnd-30 || f.s>sLand; const pitch=ground ? 0 : Math.max(Math.asin(clampN(_tg.y,-1,1)), f.s<rollEnd+60 ? .26*clampN((f.s-rollEnd+30)/30,0,1) : -1);
    plane.position.copy(_pt); plane.rotation.set(0,0,0); plane.rotateY(Math.atan2(_tg.x,_tg.z)-Math.PI/2); plane.rotateZ(pitch); plane.rotateX(ground?0:f.bank);
    P.x=_pt.x; P.z=_pt.z; P.y=_pt.y-PLANE_Y+GY; P.px=P.x; P.pz=P.z; P.vx=P.vz=0; W.me.g.position.set(_pt.x,_pt.y-2,_pt.z);
    if(f.s>=f.L-.5 || (f.s>sLand+40 && f.v<1.5)) endFlight(); }
  function endFlight(){ const f=flight; if(!f) return; flight=null; if(HOOK.vehicle===f.ctrl) HOOK.vehicle=null; W.me.g.visible=true; if(W.cam && savedDist) W.cam.dist=savedDist; plane.visible=false;
    const ap=f.land||HOME, sp=ap.spawn||{x:ap.x, z:ap.z, lx:ap.x, lz:ap.z+10}; teleport(sp.x, sp.z, sp.lx??sp.x, sp.lz??sp.z+10);
    toast(ap===HOME ? `🛬 Hạ cánh êm ái về ${HOME.name}! Cảm ơn bạn đã bay cùng QC Airlines ✈️` : `🛬 Chào mừng tới ${ap.name}! Cảm ơn bạn đã bay cùng QC Airlines ✈️`, 4200); }
  out.startFlight=startFlight; out.flying=()=>!!flight; out.flightState=()=>flight&&{s:+flight.s.toFixed(0), L:+flight.L.toFixed(0), v:+flight.v.toFixed(1), y:+P.y.toFixed(1), uLand:+flight.uLand.toFixed(3)}; out.fast=()=>{ fastKey=true; };

  /* ============================== 7. MÁY BAY AI CẤT / HẠ CÁNH (khi bạn ở gần) ============================== */
  const AI={p:planeGroup(), mode:'idle', t:8, s:0, v:0, curve:null, L:1}; AI.p.visible=false; scene.add(AI.p);
  const aiPaths={ land:new THREE.CatmullRomCurve3([V3(RX1+900,GY+220,RW[1].z+300), V3(RX1+420,GY+90,RW[1].z), V3(RX1+120,GY+22,RW[1].z), V3(RX1-20,PLANE_Y,RW[1].z), V3(RX1-180,PLANE_Y,RW[1].z), V3(RX1-250,PLANE_Y,RW[1].z)]),
    take:new THREE.CatmullRomCurve3([V3(RX1-10,PLANE_Y,RW[1].z), V3(RX1-120,PLANE_Y,RW[1].z), V3(RX1-210,PLANE_Y+4,RW[1].z), V3(RX0-150,GY+70,RW[1].z), V3(RX0-600,GY+220,RW[1].z-200)]) };
  function stepAI(dt){ AI.t-=dt; if(AI.mode==='idle'){ AI.p.visible=false; if(AI.t<=0){ AI.mode=R()<.5?'land':'take'; AI.curve=aiPaths[AI.mode]; AI.L=AI.curve.getLength(); AI.s=0; AI.v=AI.mode==='land'?60:4; AI.p.visible=true; } return; }
    if(AI.mode==='take') AI.v=Math.min(70, AI.v+dt*(AI.s<200?5:6)); else AI.v=AI.s>AI.L-260 ? Math.max(6, AI.v-dt*9) : 60; AI.s+=AI.v*dt; const u=Math.min(1,AI.s/AI.L);
    AI.curve.getPointAt(u,_pt); AI.curve.getTangentAt(u,_tg); AI.p.position.copy(_pt); AI.p.rotation.set(0,0,0); AI.p.rotateY(Math.atan2(_tg.x,_tg.z)-Math.PI/2); AI.p.rotateZ(Math.asin(clampN(_tg.y,-1,1)));
    if(u>=1){ AI.mode='idle'; AI.t=50+R()*40; } }

  /* ============================== 8. BẢN ĐỒ + KHUNG HÌNH ============================== */
  KL.build(); KS.build();
  PLACES.push({icon:'✈️', name:'Sân bay Quốc tế QA/QC · nhà ga Manta Ray', sub:'Thác nước trong nhà · check-in · 6 cổng Boarding (bay thật) · phòng chờ thương gia', go:()=>teleport(TERM.x1-9, cz, cx, cz)});
  PLACES.push({icon:'🗼', name:'Đài Không lưu ATC 68 m', sub:'Thang máy lên cabin ngắm 2 đường băng', go:()=>teleport(ATC.x+2, ATC.z+9, ATC.x, ATC.z)});
  makeLabel('✈️ QA/QC International Skyport', 'Nhà ga Manta Ray · 2 đường băng trên biển · bay tới mọi vùng QC World', {h:.85, x:cx, y:GY+TERM.H+6, z:cz, fade:320});
  try{ const TD=ctx.transit && ctx.transit.TAXI_DEST; if(TD) TD.push({icon:'✈️', name:'Sân bay Quốc tế QA/QC · cổng Bắc', x:ROADX, z:Z.z0+6}); }catch(e){}
  W.V2AIRPORT=HOME;
  W.V2ROADS=W.V2ROADS||[]; W.V2ROADS.push({zone:'skyport', y:GY, segs:[[ROADX,180,ROADX,Z.z0],[ROADX,Z.z0,ROADX,Z.z1]], gates:{G2:[ROADX,180], G8:[ROADX,Z.z1]}});   /* G2 nối thẳng tới cổng Nam đảo Abyssal (0,180) qua cầu */
  { const G=W.transit && W.transit.G; if(G && G.nodes){ const n=[[ROADX,180],[ROADX,Z.z0],[ROADX,Z.z1]].map(([x,z])=>{ G.nodes.push({x,z,adj:[]}); return G.nodes.length-1; }); for(let i=0;i<2;i++){ const a=n[i], b=n[i+1], d=Math.hypot(G.nodes[a].x-G.nodes[b].x, G.nodes[a].z-G.nodes[b].z); G.nodes[a].adj.push([b,d]); G.nodes[b].adj.push([a,d]); G.edges.push([a,b]); } } }
  let lastN=-1;
  HOOK.onFrame.push((dt,T)=>{ const n=W.night||0; if(Math.abs(n-lastN)>.004){ lastN=n; for(const o of NIGHT) o.m.emissiveIntensity=o.base+n*o.k; }
    if(out.fall) out.fall.ft.offset.y=-T*.9;
    const near=Math.hypot(Math.max(Z.x0-P.x,0,P.x-Z.x1), Math.max(Z.z0-P.z,0,P.z-Z.z1))<400 || !!flight;
    if(near){ const k=(T*2.2)%1; out.approach.AL.forEach(([x,z,i],j)=>{ const on=Math.abs(k*6-(6-i))<.8; _m4.compose(_v.set(x,GY+.4,z), _q.identity(), _s.setScalar(on?1.4:.35)); out.approach.al.setMatrixAt(j,_m4); }); out.approach.al.instanceMatrix.needsUpdate=true;
      if(out.beacon) out.beacon.visible=((T*1.2)%1)<.5; stepAI(Math.min(dt,.1));
      const busy=[AI.mode!=='idle'?AI.p.position:null, flight&&plane?plane.position:null].some(p=>p && Math.abs(p.x-ROADX)<120 && p.y<GY+40 && p.z>RW[0].z-30);
      for(const b of BAR){ const tgt=busy?0:-b.side*1.45; b.arm.rotation.z+=(tgt-b.arm.rotation.z)*Math.min(1,dt*3); } out.barLamp.color.setHex(busy && ((T*2)%1)<.5 ? 0xff2020 : 0x330000); }
    if(flight) HOOK.vehicleInter=()=>({label:`✈️ QC Airlines → ${flight?flight.d.name:''} · X: hạ cánh nhanh`}); });
  out.audit=()=>({gates:GATES.length, parked:PARK.length, runways:RW.length, airports:W.AIRPORTS.map(a=>a.key)});
  console.info('[Skyport] dựng xong:', out.audit());
  return out;
}
