// QC World V2 – Đảo Abyssal · TIỆN ÍCH VỊNH (phiên A · abyss-core, đợt 2, 17/11/2026)
//  • 8 pavilion công cụ trên vành đảo khách sạn (+14): bệ Obsidian 2 bậc viền Travertine, sàn Teak, 6 cột mảnh vát cạnh, vòm khung vàng champagne,
//    4 bồn cây, vòng LED theo màu từng công cụ; 9 màn hình của screens.js dời về pavilion; cổng Master Dashboard ở đầu cầu Bắc.
//  • Cầu kính xanh ngọc khung vàng, tay vịn gỗ óc chó, LED ấm dưới gầm: Bắc (sang tháp Hydro-Pulse +16), Đông, Tây (sang vỉa hè +16);
//    cầu ô tô phía Nam (10 m) từ giữa Cầu Vòm xuống đảo (dốc 7,4 %) + vòng quay đầu sảnh đón khách.
//  • Hydro-Pulse Core: 3 đĩa kính khung vàng lơ lửng (+9,2 · +16 · +24,5; r 15,5, lỗ 5,5 ôm cột thác), quầy bar đồng, sofa nhung lục bảo,
//    bàn đá, cọ cảnh; bãi đỗ ngắm cảnh Sky-Shaft trên đỉnh tháp (+28).
//  • Bãi đỗ xe biển 12 ô (vạch vàng, cục chặn bánh vàng-đen, barie tự động) sát đường vành đai phía Đông-Nam + cầu thang gỗ thứ 5 xuống bãi;
//    2 nhà tắm gỗ teak mái lá cọ; 4 quầy bar cây dừa + 24 ghế tắm nắng + 12 dù lá cọ.
// Mọi vật lặp lại dùng InstancedMesh; va chạm đầy đủ (lan can / cột / quầy) kèm lý do.
export function buildAmenities(K){
  const {THREE, W, grp, dyn, M, MT, B, BAYB, box, cyl, fence, rail, addPlat, addSeg, plats, circles, makeLabel, INTER, P, toast, PLACES, teleport, RAMPS, LIFTK} = K;
  const D=Math.PI/180, TAU=Math.PI*2, el=(f,r)=>B.el(f*D,r), BY=B.y, out={}, std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.8, ...o});
  const mk=(tok,o,fb)=>{ try{ return W.LUX ? W.LUX.mk(tok,o||{}) : fb; }catch(e){ return fb; } };
  const MAT={ obs:mk('OBSIDIAN_PAVILION',{},std(0x1a202c,{roughness:.35, metalness:.45})), trav:MT.trav, sand:MT.sand, teak:MT.teak, gold:MT.gold, bronze:MT.bronze, glow:MT.glow,
    walnut:mk('WALNUT_WOOD',{},std(0x3d2314)), emerald:mk('EMERALD_VELVET',{},std(0x1e4637,{roughness:.9})), marble:mk('TRAVERTINE_WARM',{color:0xe8dcc8},std(0xe8dcc8,{roughness:.3})),
    turq:std(0x2fb5b0,{roughness:.18, metalness:.15}), glass:mk('GLASS_SAPPHIRE',{},new THREE.MeshPhysicalMaterial({color:0x0e3342, transparent:true, opacity:.5, depthWrite:false, side:THREE.DoubleSide})),
    leaf:std(0x3f7f3a,{roughness:.9}), trunk:std(0x7a5a3a,{roughness:.95}), thatch:std(0x9a7a45,{roughness:1}), cushion:std(0xe2c99a,{roughness:.9}), yel:std(0xf2c230,{roughness:.6}), blk:std(0x1b1b1b,{roughness:.7}),
    lineY:new THREE.MeshStandardMaterial({color:0xf2c230, roughness:.6, polygonOffset:true, polygonOffsetFactor:-5, polygonOffsetUnits:-10}), red:std(0xc8332e,{roughness:.5}) };
  const M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), E=new THREE.Euler(), V=new THREE.Vector3(), S=new THREE.Vector3();
  function inst(geo, mat, list, o={}){ /* list: [x,y,z, ry, sx,sy,sz, rx, rz] */ if(!list.length) return null; const im=new THREE.InstancedMesh(geo,mat,list.length);
    list.forEach((a,i)=>{ Q.setFromEuler(E.set(a[7]||0,a[3]||0,a[8]||0,'YXZ')); M4.compose(V.set(a[0],a[1],a[2]),Q,S.set(a[4]??1,a[5]??1,a[6]??1)); im.setMatrixAt(i,M4); });
    if(o.colors){ const c=new THREE.Color(); o.colors.forEach((h,i)=>im.setColorAt(i,c.set(h))); } im.castShadow=!!o.cast; im.receiveShadow=true; im.userData.dynamic=true; (o.parent||grp).add(im); return im; }
  const ring=(cx,cz,r,a0,a1,n)=>{ const p=[]; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; p.push([cx+Math.cos(a)*r, cz+Math.sin(a)*r]); } return p; };
  const IC=[0,-12], IY=14, IR=58;

  /* ======================= 1. 8 PAVILION CÔNG CỤ + MÀN HÌNH + CỔNG MASTER DASHBOARD ======================= */
  const PAV=[]; { const TZ=W.ZONES||[], PR=47, FY2=IY+.64, L={st1:[],st2:[],band:[],floor:[],col:[],top:[],arc:[],fin:[],pl:[],plant:[],led:[]}, ledC=[];
    for(let i=0;i<8;i++){ const a=(-67.5+45*i)*D, x=IC[0]+Math.cos(a)*PR, z=IC[1]+Math.sin(a)*PR, zn=TZ[i]; PAV.push({x, z, a, zone:zn});
      L.st1.push([x,IY+.15,z]); L.st2.push([x,IY+.45,z]); L.band.push([x,IY+.27,z]); L.floor.push([x,IY+.62,z]); L.top.push([x,FY2+3.4,z,0,1,1,1,Math.PI/2]); L.fin.push([x,FY2+3.4+3.9,z]); L.led.push([x,IY+.63,z,0,1,1,1,Math.PI/2]); ledC.push(zn&&zn.color!=null?zn.color:0x40e8ff);
      for(let k=0;k<6;k++){ const b=a+k*TAU/6+TAU/12, cx=x+Math.cos(b)*3.9, cz=z+Math.sin(b)*3.9; L.col.push([cx,FY2+1.7,cz]); circles.push({x:cx, z:cz, r:.24, y0:IY-.5, y1:IY+5}); }
      for(let k=0;k<3;k++) L.arc.push([x,FY2+3.4,z,k*Math.PI/3]);
      for(let k=0;k<4;k++){ const b=a+Math.PI/4+k*Math.PI/2, px=x+Math.cos(b)*4.2, pz=z+Math.sin(b)*4.2; L.pl.push([px,FY2+.35,pz,b]); L.plant.push([px,FY2+1.05,pz]); circles.push({x:px, z:pz, r:.62, y0:IY-.5, y1:IY+3}); }
      plats.push({t:'c', x, z, r:5.3, h:IY+.3}); plats.push({t:'c', x, z, r:4.65, h:FY2});
      if(zn){ makeLabel(`${zn.icon} ${zn.name}`, zn.sub, {h:.5, x, y:FY2+8.6, z, fade:80}); INTER.push({x, z, r:3.2, prio:.6, when:()=>Math.abs(P.y-FY2)<1.2, label:`${zn.icon} Mở ${zn.name} (E)`, action:()=>W.openTool && W.openTool(zn)}); } }
    inst(new THREE.CylinderGeometry(5.4,5.6,.3,40),MAT.obs,L.st1); inst(new THREE.CylinderGeometry(4.7,4.9,.3,40),MAT.obs,L.st2); inst(new THREE.CylinderGeometry(5.66,5.66,.1,40,1,true),MAT.trav,L.band);
    inst(new THREE.CylinderGeometry(4.66,4.66,.04,40),MAT.teak,L.floor); inst(new THREE.CylinderGeometry(.12,.16,3.4,6),MAT.bronze,L.col,{cast:true});
    inst(new THREE.TorusGeometry(3.9,.11,8,48),MAT.gold,L.top); inst(new THREE.TorusGeometry(3.9,.08,6,28,Math.PI),MAT.gold,L.arc,{cast:true}); inst(new THREE.SphereGeometry(.28,12,10),MAT.gold,L.fin);
    inst(new THREE.BoxGeometry(.9,.7,.9),MAT.bronze,L.pl); inst(new THREE.SphereGeometry(.6,10,8),MAT.leaf,L.plant); inst(new THREE.TorusGeometry(4.72,.05,6,64),new THREE.MeshBasicMaterial({color:0xffffff}),L.led,{colors:ledC});
    for(const p of PAV) fence(ring(p.x,p.z,5.45,p.a+Math.PI+.42,p.a+Math.PI+TAU-.42,18),IY,'🏛️ Bậc pavilion – lên bằng lối trước mặt hướng tâm đảo');   /* chỉ chừa lối lên ở phía tâm đảo */
    // 9 màn hình (screens.js) dời về pavilion: đặt sau lưng (phía biển), quay mặt về tâm đảo; màn 9 ở đầu cầu Bắc
    try{ const SC=W.screens; if(SC && SC.monitors){ SC.monitors.forEach((m,i)=>{ const p=PAV[i%8], nine=i>=8, x=nine?IC[0]+8:p.x+Math.cos(p.a)*2.4, z=nine?IC[1]-46:p.z+Math.sin(p.a)*2.4, y=nine?IY:FY2, rot=nine?Math.PI:Math.atan2(-Math.cos(p.a),-Math.sin(p.a));
        m.x=x; m.z=z; m.rot=rot; m.g.position.set(x,y,z); m.g.rotation.y=rot; m.g.userData.dynamic=true; W.scene.add(m.g); m.g.updateMatrixWorld(true); m.center.set(0,2.0,.066).applyMatrix4(m.g.matrixWorld); m.normal.set(Math.sin(rot),0,Math.cos(rot)); m.sphere.center.copy(m.center); circles.push({x,z,r:.55,y0:y-1,y1:y+4});
        const fx=x+m.normal.x*2.1, fz=z+m.normal.z*2.1; INTER.push({x:fx, z:fz, r:2.2, prio:.4, when:()=>!W.inside && Math.abs(P.y-y)<1.5, label:`🖥️ Xem ${m.ch.icon} ${m.ch.name} trên màn hình (E)`, action:()=>SC.focus(m)}); }); } }catch(e){ console.warn('[abyssal] màn hình', e); }
    { /* cổng Master Dashboard (đầu cầu Bắc, r 50): 2 trụ Obsidian + dầm vàng + màn năng lượng */ const gz=IC[1]-50; for(const e of [-1,1]){ box(1.4,11,1.4,MAT.obs,e*5.2,IY+5.5,gz); circles.push({x:e*5.2, z:gz, r:1.0, y0:IY-.5, y1:IY+12}); } box(12,1.4,1.6,MAT.gold,0,IY+11.6,gz);
      const pm=new THREE.MeshBasicMaterial({color:0x40e8ff, transparent:true, opacity:.4, side:THREE.DoubleSide, depthWrite:false}), pl=new THREE.Mesh(new THREE.PlaneGeometry(9,10.6),pm); pl.position.set(0,IY+5.4,gz); pl.userData.dynamic=true; pl.renderOrder=6; dyn.add(pl); out.portal=pm;
      makeLabel('🌀 Cổng Master Dashboard','Đảo khách sạn +14 · 8 pavilion công cụ quanh quảng trường',{h:.7, x:0, y:IY+14.5, z:gz, fade:160});
      INTER.push({x:0, z:gz+2, r:3, prio:.6, when:()=>Math.abs(P.y-IY)<1.5, label:'🌀 Cổng Master Dashboard – mở trên Laptop (E)', action:()=>{ if(K.HOOK.openScreen) K.HOOK.openScreen({url:'/'}); else toast('💻 Master Dashboard mở trong Laptop (phím L).',3000); }}); } }
  out.PAV=PAV;

  /* ======================= 2. CẦU KÍNH XANH NGỌC + CẦU Ô TÔ PHÍA NAM ======================= */
  const BR=[]; function glassBridge(ax,az,bx,bz,w,y,name){ const L=Math.hypot(bx-ax,bz-az), ry=Math.atan2(bx-ax,bz-az), mx=(ax+bx)/2, mz=(az+bz)/2, nx=Math.cos(ry), nz=-Math.sin(ry);
    box(w,.32,L,MAT.turq,mx,y-.16,mz,ry); for(const e of [-1,1]){ box(.22,.5,L,MAT.gold,mx+nx*e*(w/2+.06),y-.2,mz+nz*e*(w/2+.06),ry); box(.12,.07,L,MAT.walnut,mx+nx*e*(w/2-.08),y+1.02,mz+nz*e*(w/2-.08),ry); }
    box(.5,.05,L,MAT.glow,mx,y-.36,mz,ry); addPlat(mx,mz,ry,w/2,L/2+.05,y);
    for(const e of [-1,1]) fence([[ax+nx*e*(w/2-.12),az+nz*e*(w/2-.12)],[bx+nx*e*(w/2-.12),bz+nz*e*(w/2-.12)]],y,`🌉 Lan can ${name} – bên dưới là vịnh 16 m`); BR.push({ax,az,bx,bz,w,y,name}); }
  function headSteps(a,w){ /* bậc Travertine trên đảo: +16 (mặt cầu) → +14 (quảng trường), 12 bậc × 0,167 m */ const ux=-Math.cos(a), uz=-Math.sin(a), ry=Math.atan2(ux,uz), list=[], nx=Math.cos(ry), nz=-Math.sin(ry), r0=IR-.15;
    for(let k=0;k<12;k++){ const r=r0-k*.6-.3, x=IC[0]+Math.cos(a)*r, z=IC[1]+Math.sin(a)*r, y=16-(k+1)*.1667; list.push([x,(y+IY)/2,z,ry,w,y-IY+.02,.62]); addPlat(x,z,ry,w/2,.31,y); }
    inst(new THREE.BoxGeometry(1,1,1),MAT.trav,list); const e0=[IC[0]+Math.cos(a)*(r0+.1), IC[1]+Math.sin(a)*(r0+.1)], e1=[IC[0]+Math.cos(a)*(r0-7.4), IC[1]+Math.sin(a)*(r0-7.4)];
    for(const e of [-1,1]) fence([[e0[0]+nx*e*w/2,e0[1]+nz*e*w/2],[e1[0]+nx*e*w/2,e1[1]+nz*e*w/2]],15,'🪜 Lan can bậc đầu cầu'); }
  { const pE=[B.el(0,1)[0]*.8995, IC[1]], fE=B.phiD(pE[0],IC[1]);   /* đầu cầu Đông/Tây trên vỉa hè */ const xE=(()=>{ let lo=60, hi=146; for(let k=0;k<40;k++){ const m=(lo+hi)/2; if(B.re(m,IC[1])<B.R.B+.0015) lo=m; else hi=m; } return lo; })();
    glassBridge(IR-.1,IC[1],xE+.6,IC[1],4,16,'cầu kính Đông'); glassBridge(-IR+.1,IC[1],-xE-.6,IC[1],4,16,'cầu kính Tây'); glassBridge(0,IC[1]-IR+.1,0,-108.4,4,16,'cầu kính Bắc (sang tháp Hydro-Pulse)');
    headSteps(0,4); headSteps(Math.PI,4); headSteps(-Math.PI/2,4); out.bridgeF=[B.phiD(xE,IC[1]), B.phiD(-xE,IC[1])]; }
  if(K.buildSouthBridge){ /* (TẮT 17/11: phiên C dựng cầu dẫn khách sạn x = 0, +16, rộng 10 m – W.ABY.plots.hotel.bridge) cầu ô tô Nam 10 m: giữa Cầu Vòm (+16) → mép đảo (+14) */ const zN=B.zB-6.5, zI=IC[1]+IR+.36, zF=73, yAt=z=>z>=zF?16:IY+2*(z-zI)/(zF-zI), w=10, q=K.FB();
    for(let z=zI; z<zN-1e-6; z+=1){ const z1=Math.min(zN,z+1), y0=yAt(z), y1=yAt(z1); q.f([-w/2,y0,z],[w/2,y0,z],[w/2,y1,z1],[-w/2,y1,z1],[0,1,0]); q.f([-w/2,y0-.8,z],[w/2,y0-.8,z],[w/2,y1-.8,z1],[-w/2,y1-.8,z1],[0,-1,0]); for(const e of [-1,1]) q.f([e*w/2,y0-.8,z],[e*w/2,y1-.8,z1],[e*w/2,y1,z1],[e*w/2,y0,z],[e,0,0]); addPlat(0,(z+z1)/2,0,w/2,(z1-z)/2+.02,(y0+y1)/2); }
    addPlat(0,zI-.45,0,w/2,.6,IY);   /* nối mặt cầu với mép đảo (không hụt xuống biển) */ q.mesh(MAT.trav,'abyssal-south-bridge'); for(const e of [-1,1]){ for(let z=zI; z<zN-2.9; z+=3) fence([[e*(w/2-.15),z],[e*(w/2-.15),Math.min(zN,z+3)]],yAt(z+1.5),'🌉 Lan can cầu dẫn đảo khách sạn'); }
    { const g=K.FB(); for(let z=zI; z<zN-1e-6; z+=1){ const z1=Math.min(zN,z+1); for(const e of [-1,1]) g.f([e*(w/2+.02),yAt(z)-.35,z],[e*(w/2+.02),yAt(z1)-.35,z1],[e*(w/2+.02),yAt(z1)-.2,z1],[e*(w/2+.02),yAt(z)-.2,z],[e,0,0]); } g.mesh(MAT.glow,'abyssal-south-bridge-led'); }
    BAYB.roadDY([[0,B.zB],[0,zN],[0,zI],[0,IC[1]+52.5]],7,(x,z)=>z>zN?16.03:z<=zI?IY+.05:yAt(z)+.03);
    const LC=[0,IC[1]+44.5], LR=6.5; { const lp=[]; for(let k=0;k<=36;k++){ const t=Math.PI/2+k/36*TAU; lp.push([LC[0]+Math.cos(t)*LR, LC[1]+Math.sin(t)*LR]); } BAYB.roadDY(lp,6,()=>IY+.03); cyl(3,3,.35,MAT.obs,LC[0],IY+.17,LC[1],32); cyl(2.6,2.6,.06,MAT.leaf,LC[0],IY+.37,LC[1],32); circles.push({x:LC[0], z:LC[1], r:3.1, y0:IY-.5, y1:IY+2});
      const R3=v=>Math.round(v*100)/100, pts=[[0,R3(B.zB),16.03]]; for(let z=B.zB-3; z>zI; z-=3) pts.push([0,R3(z),R3(yAt(z)+.03)]); const L0=[0,R3(LC[1]+LR),IY+.03]; pts.push([0,R3(zI-1),IY+.03],L0); const loop=[L0.slice()]; for(let k=1;k<24;k++){ const t=Math.PI/2+k/24*TAU; loop.push([R3(LC[0]+Math.cos(t)*LR)||0,R3(LC[1]+Math.sin(t)*LR),IY+.03]); } loop.push(L0.slice());   /* khép vòng đúng điểm đầu (không lệch −0) */
      RAMPS.push({name:'Cầu dẫn đảo khách sạn (Nam)', w:7, vmax:6, pts}, {name:'Vòng sảnh đón đảo khách sạn', w:6, vmax:4, pts:loop});   /* 2 tuyến riêng: nút (0, 39) có đủ 3 cạnh */ makeLabel('🚖 Sảnh đón khách sạn','Cầu dẫn 10 m từ Cầu Vòm · vòng quay đầu xe',{h:.5, x:0, y:IY+4, z:LC[1], fade:80}); }
    out.southBridge={x:0, z0:zI, z1:zN, w, yIsland:IY, yArch:16, flatFrom:zF}; out.dropoff={c:LC, r:LR, w:6, y:IY+.03, hub:3.1}; }

  /* ======================= 3. HYDRO-PULSE CORE: 3 ĐĨA KÍNH + CỘT THÁC + BÃI ĐỖ NGẮM CẢNH +28 ======================= */
  const HC=[0,-124], DISC=[9.2,16,24.5], RO=15.5, RI=5.5, SPA=1.15, SPR=18.6, SPC=[HC[0]+Math.cos(SPA)*SPR, HC[1]+Math.sin(SPA)*SPR];   /* cầu thang xoắn: tâm ngoài mép đĩa, phía Nam-Đông (ngoài sàn tháp z ≥ −114) */ { const rings=[], ribs=[], sofa=[], tbl=[], palmT=[], palmC=[], bar=[], led=[];
    for(const y of DISC){ const g=new THREE.Mesh(new THREE.RingGeometry(RI,RO,64,1),MAT.glass); g.rotation.x=-Math.PI/2; g.position.set(HC[0],y-.02,HC[1]); g.userData.dynamic=true; g.renderOrder=6; grp.add(g);
      rings.push([HC[0],y-.05,HC[1],0,RO/RO,1,1,Math.PI/2],[HC[0],y-.05,HC[1],0,RI/RO,1,RI/RO,Math.PI/2]); led.push([HC[0],y-.2,HC[1],0,1,1,1,Math.PI/2]);
      for(let k=0;k<8;k++){ const a=k/8*TAU+TAU/16; ribs.push([HC[0]+Math.cos(a)*(RO+RI)/2,y-.13,HC[1]+Math.sin(a)*(RO+RI)/2,-a,RO-RI,1,1]); }
      for(let k=0;k<24;k++){ const a=k/24*TAU, a1=(k+1)/24*TAU, am=(a+a1)/2, tx=-Math.sin(am), tz=Math.cos(am); for(const [r0,r1] of [[RI,10.5],[10.5,RO]]){ const rm=(r0+r1)/2; addPlat(HC[0]+Math.cos(am)*rm,HC[1]+Math.sin(am)*rm,Math.atan2(tx,tz),(r1-r0)/2+.05,r1*Math.sin((a1-a)/2)+.08,y); } }
      const GP=[[SPA,.075]].concat(y===16?[[Math.PI/2,.16]]:[]), inGap=t=>GP.some(([g,w])=>Math.abs(Math.atan2(Math.sin(t-g),Math.cos(t-g)))<w); { let run=[]; const flush=()=>{ if(run.length>1) fence(run,y,'💠 Lan can đĩa kính – bên dưới là bãi cát'); run=[]; }; for(let i=0;i<=128;i++){ const t=i/128*TAU; if(inGap(t)){ flush(); continue; } run.push([HC[0]+Math.cos(t)*(RO-.2), HC[1]+Math.sin(t)*(RO-.2)]); if(run.length>=9){ const l=run[run.length-1]; flush(); run=[l]; } } flush(); }   /* khe: cầu kính Bắc (+16) + cầu nối cầu thang xoắn */ fence(ring(HC[0],HC[1],RI+.2,0,TAU,24),y,'💧 Lan can cột thác giữa đĩa kính');
      for(let k=0;k<5;k++){ const a=Math.PI/2+(k-2)*.24, x=HC[0]+Math.cos(a)*7.6, z=HC[1]+Math.sin(a)*7.6; bar.push([x,y+.55,z,-a+Math.PI/2]); circles.push({x,z,r:.85,y0:y-.5,y1:y+1.5}); }
      for(const a of [.25,.9,2.25,2.9,-.5,-2.65].map(v=>v)){ const x=HC[0]+Math.cos(a)*12.6, z=HC[1]+Math.sin(a)*12.6, x2=HC[0]+Math.cos(a)*10.9, z2=HC[1]+Math.sin(a)*10.9; sofa.push([x,y+.42,z,-a+Math.PI/2]); tbl.push([x2,y+.38,z2]); circles.push({x,z,r:1.0,y0:y-.5,y1:y+1.4},{x:x2,z:z2,r:.5,y0:y-.5,y1:y+1.2}); }
      for(const a of [0,Math.PI,Math.PI*.25,Math.PI*.75]){ const x=HC[0]+Math.cos(a)*14.4, z=HC[1]+Math.sin(a)*14.4; palmT.push([x,y+1.4,z]); palmC.push([x,y+3.1,z,a,1,.45,1]); circles.push({x,z,r:.45,y0:y-.5,y1:y+3.5}); }
      makeLabel(`💠 Đĩa kính Hydro-Pulse +${y}`,'Lounge 360° · bar đồng · sofa lục bảo · thang máy kính',{h:.4, x:HC[0], y:y+3.4, z:HC[1]+RO-2, fade:45});
      INTER.push({x:HC[0]+Math.cos(Math.PI/2)*9.2, z:HC[1]+Math.sin(Math.PI/2)*9.2, r:2.4, prio:.5, when:()=>Math.abs(P.y-y)<1.2, label:'🍸 Quầy bar Hydro-Pulse – mocktail 30 💰 (E)', action:()=>{ const L=W.life; if(L && L.askPay) L.askPay(30,'🍸 Mocktail Hydro-Pulse',()=>{ if(L.S.coins<30) return toast('Không đủ 30 💰'); L.addCoins(-30); toast('🍸 Mát lạnh! Ngắm vịnh 360° từ đĩa kính.',3000); }); else toast('🍸 Quầy bar đang pha chế…',2400); }}); }
    inst(new THREE.TorusGeometry(RO,.16,8,96),MAT.gold,rings); inst(new THREE.BoxGeometry(1,.12,.18),MAT.gold,ribs); inst(new THREE.TorusGeometry(RO-.4,.05,6,96),MAT.glow,led);
    inst(new THREE.BoxGeometry(1.6,1.1,.7),MAT.bronze,bar); inst(new THREE.BoxGeometry(2.1,.8,.95),MAT.emerald,sofa); inst(new THREE.CylinderGeometry(.48,.4,.75,16),MAT.marble,tbl);
    inst(new THREE.CylinderGeometry(.12,.18,2.8,8),MAT.trunk,palmT); inst(new THREE.ConeGeometry(1.5,1.6,7),MAT.leaf,palmC);
    { const c=new THREE.Mesh(new THREE.CylinderGeometry(RI-.6,RI-.6,26.2,28,1,true),M.fall); const uv=c.geometry.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*3,uv.getY(i)*1.2); c.position.set(HC[0],2.3+13.1,HC[1]); c.userData.dynamic=true; c.renderOrder=4; dyn.add(c);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(RI-.2,32),std(0x0f6f7e,{roughness:.1, metalness:.3})); pool.rotation.x=-Math.PI/2; pool.position.set(HC[0],2.33,HC[1]); grp.add(pool); circles.push({x:HC[0], z:HC[1], r:RI+.1, y0:0, y1:30}); }
    /* bãi đỗ ngắm cảnh Sky-Shaft trên đỉnh tháp (+28): 6 ô kẻ vạch vàng, lối xe vào từ đường đỉnh vách phía Bắc */ { const q=K.FB(), Y=28.03+.012; for(const sx of [-1,1]) for(let k=0;k<=3;k++){ const x=sx*(5.5+k*3.6); q.f([x-.06,Y,-156.6],[x+.06,Y,-156.6],[x+.06,Y,-151.4],[x-.06,Y,-151.4],[0,1,0]); } q.f([-16.4,Y,-151.5],[16.4,Y,-151.5],[16.4,Y,-151.38],[-16.4,Y,-151.38],[0,1,0]); q.mesh(MAT.lineY,'abyssal-skyshaft-bays');
      makeLabel('🅿️ Sky-Shaft Drive-In','Bãi đỗ ngắm cảnh đỉnh tháp Hydro-Pulse · 6 chỗ · thang máy xuống 3 đĩa kính',{h:.5, x:0, y:32, z:-154, fade:90}); } }
  /* ---- CẦU THANG XOẮN KÍNH – ĐỒNG: sân +2,3 → đĩa +9,2 → +16 → +24,5 (mỗi đoạn đúng 1 vòng, ra cầu nối ở cùng hướng nhìn vào lõi tháp) ---- */
  { const C=SPC, R0=.26, R1=2.3, RM=1.25, PHD=Math.atan2(HC[1]-C[1],HC[0]-C[0]), th0=-Math.PI/2, SEG=[[2.3,9.2,th0,PHD+TAU,32],[9.2,16,PHD,PHD+TAU,36],[16,24.5,PHD,PHD+TAU,42]];
    const TR=[], ED=[], LDG=[], RL2=[]; let lastY=2.3;
    for(const [ya,yb,ta,tb,n] of SEG){ const dth=(tb-ta)/n, rise=(yb-ya)/n;
      for(let k=0;k<n;k++){ const th=ta+(k+.5)*dth, y=ya+(k+1)*rise, ex=k===n-1;   /* bậc cuối mỗi đoạn = chiếu nghỉ ra cầu nối */
        const cx=C[0]+Math.cos(th)*RM, cz=C[1]+Math.sin(th)*RM, rot=-th; TR.push([cx,y-.03,cz,rot,R1-R0,.06,R1*Math.abs(dth)+.02]); ED.push([C[0]+Math.cos(th)*(R1-.03),y-.03,C[1]+Math.sin(th)*(R1-.03),rot,.06,.1,R1*Math.abs(dth)+.03]);
        for(const [r0,r1] of [[R0,1.2],[1.2,R1]]){ const rm=(r0+r1)/2; addPlat(C[0]+Math.cos(th)*rm, C[1]+Math.sin(th)*rm, rot, (r1-r0)/2+.02, r1*Math.abs(dth)/2+.03, y); }
        if(ex){ /* cầu nối 1,6 m sang mép đĩa */ const L=SPR-RO+.3-R1, bx=C[0]+Math.cos(PHD)*(R1+L/2-.1), bz=C[1]+Math.sin(PHD)*(R1+L/2-.1); LDG.push([bx,y-.05,bz,-PHD,L+.2,.1,1.7]); addPlat(bx,bz,Math.atan2(Math.cos(PHD),Math.sin(PHD)),.85,L/2+.15,y);
          const nx=-Math.sin(PHD), nz=Math.cos(PHD); for(const e of [-1,1]){ const a0=[C[0]+Math.cos(PHD)*(R1-.1)+nx*e*.85, C[1]+Math.sin(PHD)*(R1-.1)+nz*e*.85], a1=[a0[0]+Math.cos(PHD)*(L+.1), a0[1]+Math.sin(PHD)*(L+.1)]; fence([a0,a1],y,'🌀 Lan can cầu nối cầu thang xoắn'); } }
        RL2.push({th, y, ex}); lastY=y; } }
    /* lan can ngoài (va chạm) theo từng bậc – hở đúng cầu nối; tay vịn đồng xoắn TubeGeometry + trụ kính */
    const EXY=[9.2,16,24.5], adist=(t,g)=>Math.abs(Math.atan2(Math.sin(t-g),Math.cos(t-g))); for(let i=0;i<RL2.length-1;i++){ const a=RL2[i], b=RL2[i+1], tm=a.th+Math.atan2(Math.sin(b.th-a.th),Math.cos(b.th-a.th))/2, ym=(a.y+b.y)/2;   /* trung bình góc theo vòng tròn (2 đoạn nối nhau lệch 2π) */ if(i<2) continue;   /* lối vào từ sân */ if(EXY.some(Y=>Math.abs(ym-Y)<.6) && adist(tm,PHD)<.46) continue; const p0=[C[0]+Math.cos(a.th)*(R1-.05), C[1]+Math.sin(a.th)*(R1-.05)], p1=[C[0]+Math.cos(b.th)*(R1-.05), C[1]+Math.sin(b.th)*(R1-.05)]; addSeg(p0[0],p0[1],p1[0],p1[1],.12,Math.min(a.y,b.y)-1.1,Math.max(a.y,b.y)+1.6,'🌀 Tay vịn cầu thang xoắn kính – đồng'); }
    { const l=RL2[RL2.length-1], p0=[C[0]+Math.cos(l.th+.2)*R0,C[1]+Math.sin(l.th+.2)*R0], p1=[C[0]+Math.cos(l.th+.2)*R1,C[1]+Math.sin(l.th+.2)*R1]; addSeg(p0[0],p0[1],p1[0],p1[1],.12,l.y-1.1,l.y+1.6,'🌀 Đỉnh cầu thang xoắn – ra cầu nối sang đĩa kính'); }
    { const pts=[]; for(const r of RL2){ if(r.ex){ pts.length && (out.spiralRails=(out.spiralRails||[]).concat([pts.splice(0)])); continue; } pts.push(new THREE.Vector3(C[0]+Math.cos(r.th)*(R1-.05), r.y+.95, C[1]+Math.sin(r.th)*(R1-.05))); } if(pts.length>1) out.spiralRails=(out.spiralRails||[]).concat([pts]);
      for(const P2 of out.spiralRails||[]){ if(P2.length<2) continue; const tb=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P2),P2.length*3,.045,6,false),MAT.gold); tb.userData.dynamic=true; grp.add(tb); }
      const posts=[]; RL2.forEach((r,i)=>{ if(i%2 || r.ex) return; posts.push([C[0]+Math.cos(r.th)*(R1-.05), r.y+.47, C[1]+Math.sin(r.th)*(R1-.05)]); }); inst(new THREE.CylinderGeometry(.02,.02,.95,5),MAT.bronze,posts); }
    inst(new THREE.BoxGeometry(1,1,1),MAT.turq,TR); inst(new THREE.BoxGeometry(1,1,1),MAT.gold,ED); inst(new THREE.BoxGeometry(1,1,1),MAT.bronze,LDG);
    { const pole=cyl(.18,.18,lastY+1.6,MAT.gold,C[0],(lastY+1.6)/2+.2,C[1],14); pole.castShadow=true; circles.push({x:C[0], z:C[1], r:R0+.04, y0:-2, y1:lastY+3}); }
    /* chân thang: sân lát Travertine +2,3 nối sân trước tháp (z ≤ −112) – lan can 2 bên; vòng chặn dưới gầm thang (không chui gầm) */
    { const ex=C[0]+Math.cos(th0)*RM, zf=C[1]+Math.sin(th0)*R1-.05, z0=C[1]+Math.sin(th0)*1.0, z1=-112.6, w=2.4; box(w,.4,z0-z1,MAT.trav,ex,2.1,(z0+z1)/2); addPlat(ex,(z0+z1)/2,0,w/2,(z0-z1)/2+.05,2.3);   /* sân lấn dưới 2 bậc đầu: hụt chân ở mép ngoài thì rơi xuống sân, không xuống gầm */
      for(const e of [-1,1]) fence([[ex+e*w/2,z1],[ex+e*w/2,zf]],2.3,'🌀 Lan can lối lên cầu thang xoắn');
      { const r2=RL2[2], q2=[C[0]+Math.cos(r2.th)*(R1-.05), C[1]+Math.sin(r2.th)*(R1-.05)]; addSeg(ex+w/2,zf,q2[0],q2[1],.12,1.1,r2.y+1.6,'🌀 Tay vịn cầu thang xoắn kính – đồng'); }
      const ring2=[]; for(let i=0;i<=40;i++){ const t=th0+.46+i/40*(TAU-.92); ring2.push([C[0]+Math.cos(t)*(R1+.12), C[1]+Math.sin(t)*(R1+.12)]); } rail(ring2,0,'🌀 Gầm cầu thang xoắn – lên từ sân trước tháp',{y0:-2,y1:2.2}); }
    makeLabel('🌀 Cầu thang xoắn kính – đồng','Sân +2,3 → đĩa kính +9,2 · +16 · +24,5',{h:.42, x:C[0], y:lastY+2.6, z:C[1], fade:60});
    out.spiral={c:C, r:R1, exitAngle:PHD, levels:[2.3,...DISC]}; }
  out.discs={c:HC, y:DISC, rOut:RO, rIn:RI};

  /* ======================= 4. BÃI ĐỖ XE BIỂN (12 ô) + CẦU THANG THỨ 5 + 2 NHÀ TẮM + 4 QUẦY DỪA + 24 GHẾ ======================= */
  { const F0=58.6, NB=12, rr=[1.016,1.054], q=K.FB(), stops=[], stopB=[], bays=[]; let f=F0; for(let k=0;k<=NB;k++){ const fa=f, p0=el(fa,rr[0]), p1=el(fa,rr[1]), y0=BY(p0[0],p0[1])+.045, y1=BY(p1[0],p1[1])+.045, nx=p1[0]-p0[0], nz=p1[1]-p0[1], nl=Math.hypot(nx,nz), tx=-nz/nl*.06, tz=nx/nl*.06;
      q.f([p0[0]-tx,y0,p0[1]-tz],[p0[0]+tx,y0,p0[1]+tz],[p1[0]+tx,y1,p1[1]+tz],[p1[0]-tx,y1,p1[1]-tz],[0,1,0]);
      if(k<NB){ const fm=fa+1.1, c=el(fm,1.047), cy=BY(c[0],c[1]), ry=Math.atan2(nx,nz)+Math.PI/2; stops.push([c[0],cy+.07,c[1],ry]); addPlat(c[0],c[1],ry+Math.PI/2,.12,.86,cy+.14); for(const e of [-.55,.55]){ const s2=el(fm+e*.5,1.047); stopB.push([s2[0],cy+.075,s2[1],ry]); } bays.push(el(fm,1.035)); }
      f+=1.1; }
    q.mesh(MAT.lineY,'abyssal-beach-parking-lines'); inst(new THREE.BoxGeometry(1.7,.14,.22),MAT.yel,stops); inst(new THREE.BoxGeometry(.32,.15,.24),MAT.blk,stopB);
    { /* barie tự động ở đầu bãi (nâng khi có xe tới gần) */ const fb=F0-1.2, b=el(fb,1.05), by=BY(b[0],b[1]); box(1.4,2.4,1.4,MAT.bronze,b[0],by+1.2,b[1]); circles.push({x:b[0], z:b[1], r:1.0, y0:by-1, y1:by+3}); const arm=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,5.4),MAT.red); const piv=new THREE.Group(); piv.position.set(b[0],by+1.1,b[1]); const dir=el(fb+2.4,1.035); piv.rotation.y=Math.atan2(dir[0]-b[0],dir[1]-b[1]); arm.position.z=2.7; piv.add(arm); piv.userData.dynamic=true; dyn.add(piv); out.barrier={piv, x:b[0], z:b[1]}; }
    makeLabel('🅿️ Bãi đỗ xe biển','12 ô · vạch vàng · cục chặn bánh · cầu thang gỗ xuống bãi cát ngay bên cạnh',{h:.5, x:bays[6][0], y:BY(bays[6][0],bays[6][1])+4, z:bays[6][1], fade:90});
    { /* vạch qua đường cho người đi bộ ở φ 72,6° (đường ngang vỉa hè, không có tường chắn) */ const z=K.FB(); for(let k=0;k<6;k++){ const r0=.9655+k*.0082, r1=r0+.0039, a=el(72,r0), b=el(73.2,r0), c2=el(73.2,r1), d=el(72,r1), yy=(x,zz)=>BY(x,zz)+.046; z.f([a[0],yy(a[0],a[1]),a[1]],[b[0],yy(b[0],b[1]),b[1]],[c2[0],yy(c2[0],c2[1]),c2[1]],[d[0],yy(d[0],d[1]),d[1]],[0,1,0]); } z.mesh(new THREE.MeshStandardMaterial({color:0xf3f3ee, roughness:.6, polygonOffset:true, polygonOffsetFactor:-5, polygonOffsetUnits:-10}),'abyssal-zebra'); }
    out.parking={bays, f0:F0, f1:F0+NB*1.1}; }
  /* nhà tắm gỗ teak mái lá cọ (2 tầng thông gió) – φ 51° và 129° */ for(const fb of [51,129]){ const c=el(fb,.872), y=BY(c[0],c[1]), n=B.el(fb*D,1), ry=Math.atan2(c[0]-n[0],c[1]-n[1]), w=9, d=5.2, h=5.6, ux=Math.cos(ry), uz=-Math.sin(ry), fx=Math.sin(ry), fz=Math.cos(ry);
    const base=y+.25; box(w+.4,.5,d+.4,MAT.teak,c[0],y,c[1],ry); box(w,h*.55,d,MAT.teak,c[0],base+h*.275,c[1],ry); box(w,.12,d+.6,MAT.walnut,c[0],base+h*.55+.06,c[1],ry);
    for(const e of [-1,1]) for(const g of [-1,1]) box(.22,h*.4,.22,MAT.walnut,c[0]+ux*e*(w/2-.15)+fx*g*(d/2-.15),base+h*.55+h*.2,c[1]+uz*e*(w/2-.15)+fz*g*(d/2-.15),ry);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w,d)/2+1.2,2.6,4),MAT.thatch); roof.position.set(c[0],base+h+.9,c[1]); roof.rotation.y=ry+Math.PI/4; roof.scale.set(1,1,d/w+.25); roof.castShadow=true; grp.add(roof);
    const P4=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b2])=>[c[0]+ux*a*w/2+fx*b2*d/2, c[1]+uz*a*w/2+fz*b2*d/2]); rail([P4[0],P4[1],P4[2],P4[3],P4[0]],base,'🚿 Nhà tắm gỗ – vào bằng cửa phía biển (bấm E)',{y0:base-1.5,y1:base+5});
    addPlat(c[0],c[1],ry,w/2,d/2,base);
    INTER.push({x:c[0]+fx*(d/2+1.3), z:c[1]+fz*(d/2+1.3), r:2.6, prio:.6, when:()=>Math.abs(P.y-y)<2, label:'🚿 Tắm tráng nước ngọt / Thay đồ bơi (E)', action:()=>{ toast('🚿 Mát quá! Đã tắm tráng nước ngọt và thay đồ bơi – sẵn sàng tắm biển.',3200); if(W.life && W.life.S && W.life.S.buffs) W.life.S.buffs.energy=Math.max(Date.now(),W.life.S.buffs.energy||0)+180000; }});
    makeLabel('🚿 Nhà tắm & thay đồ','Vòi sen nước ngọt · bồn rửa chân · tủ đồ',{h:.45, x:c[0], y:base+h+3, z:c[1], fade:70}); }
  { /* 4 quầy bar cây dừa + string lights + 24 ghế tắm nắng + 12 dù lá cọ */ const BARS=[-3,12,168,183], trunkG=(()=>{ const pts=[]; for(let i=0;i<=8;i++){ const t=i/8; pts.push(new THREE.Vector3(Math.sin(t*1.3)*1.1*t, t*7.2, 0)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.24,8,false); })();
    const trunks=[], leaves=[], counters=[], tops=[], stools=[], lights=[], frame=[], cush=[], backs=[], poles=[], canopy=[], fringe=[];
    BARS.forEach((fb,bi)=>{ const c=el(fb,.835), y=BY(c[0],c[1]), n=el(fb,.6), face=Math.atan2(n[0]-c[0],n[1]-c[1]);   /* mặt quầy nhìn ra biển */
      trunks.push([c[0],y,c[1],face-Math.PI/2]); const tipx=c[0]+Math.sin(face)*1.06, tipz=c[1]+Math.cos(face)*1.06;   /* thân dừa uốn ra phía biển */
      for(let k=0;k<7;k++) leaves.push([tipx,y+7.1,tipz,k/7*TAU,1,1,1,1.05,0]);
      counters.push([c[0],y+.55,c[1],face-Math.PI/2]); tops.push([c[0],y+1.12,c[1],face-Math.PI/2]);
      for(let k=0;k<4;k++){ const a=face-Math.PI/2+(k+.5)/4*Math.PI, sx=c[0]+Math.sin(a)*3.1, sz=c[1]+Math.cos(a)*3.1; stools.push([sx,y+.35,sz]); circles.push({x:sx, z:sz, r:.3, y0:y-1, y1:y+1}); }
      for(let k=0;k<=14;k++){ const a=face-Math.PI/2+k/14*Math.PI, r=2.9, sag=Math.sin(k/14*Math.PI)*.5; lights.push([c[0]+Math.sin(a)*r,y+3.1-sag,c[1]+Math.cos(a)*r]); }
      { const arc=[]; for(let k=0;k<=10;k++){ const a=face-Math.PI/2+k/10*Math.PI; arc.push([c[0]+Math.sin(a)*2.45, c[1]+Math.cos(a)*2.45]); } rail(arc,y,'🥥 Quầy bar dừa – gọi món ở mặt quầy (E)',{y0:y-1.5,y1:y+1.4}); circles.push({x:c[0], z:c[1], r:.4, y0:y-1, y1:y+8}); }
      const items=[['🥥 Nước dừa tươi',15,'🥥 Ngọt mát! Năng lượng hồi phục.'],['🍨 Kem dừa',18,'🍨 Kem dừa mát lạnh tan trong miệng.'],['🥤 Sinh tố nhiệt đới',25,'🥤 Sinh tố xoài – dứa – chanh dây sảng khoái!']];
      items.forEach(([nm,price,msg],k)=>{ const a=face-.55+k*.55, ix=c[0]+Math.sin(a)*3.4, iz=c[1]+Math.cos(a)*3.4; INTER.push({x:ix, z:iz, r:1.3, prio:.6, when:()=>Math.abs(P.y-y)<2, label:`${nm} – ${price} 💰 (E)`, action:()=>{ const L=W.life; if(!L || !L.askPay) return toast(msg,2600); L.askPay(price,nm,()=>{ if(L.S.coins<price) return toast(`Không đủ ${price} 💰`); L.addCoins(-price); if(L.S.buffs) L.S.buffs.energy=Math.max(Date.now(),L.S.buffs.energy||0)+120000; toast(msg,3000); }); }}); });
      makeLabel('🥥 Quầy bar cây dừa','Nước dừa 15 💰 · kem dừa 18 💰 · sinh tố 25 💰',{h:.45, x:c[0], y:y+8.6, z:c[1], fade:70});
      for(let p2=0;p2<3;p2++){ const fo=fb+(p2-1)*3.2+(bi%2?1.6:-1.6), uc=el(fo,.79), uy=BY(uc[0],uc[1]); poles.push([uc[0],uy+1.3,uc[1]]); canopy.push([uc[0],uy+2.75,uc[1]]); fringe.push([uc[0],uy+2.32,uc[1]]); circles.push({x:uc[0], z:uc[1], r:.18, y0:uy-1, y1:uy+3});
        for(const e of [-1,1]){ const lc=el(fo+e*.85,.79), ly=BY(lc[0],lc[1]), lr=Math.atan2(n[0]-lc[0],n[1]-lc[1]), bx=lc[0]-Math.sin(lr)*.75, bz=lc[1]-Math.cos(lr)*.75; frame.push([lc[0],ly+.22,lc[1],lr]); cush.push([lc[0],ly+.4,lc[1],lr]); backs.push([bx,ly+.62,bz,lr,1,1,1,-.75]);
          if(W.addBench) W.addBench({x:lc[0], z:lc[1], rot:lr+Math.PI, len:1.4, y:ly+.45, floor:ly, label:'🏖️ Nằm thư giãn ghế tắm nắng (E · C)'}); else circles.push({x:lc[0], z:lc[1], r:.55, y0:ly-1, y1:ly+1}); } } });
    inst(trunkG,MAT.trunk,trunks,{cast:true}); { const lg=new THREE.ConeGeometry(.7,4.2,4); lg.translate(0,2.1,0); lg.rotateX(Math.PI/2); lg.scale(1,.18,1); inst(lg,MAT.leaf,leaves.map(a=>[a[0],a[1],a[2],a[3],1,1,1,.35,0])); }
    inst(new THREE.CylinderGeometry(2.45,2.45,1.1,24,1,true,0,Math.PI),MAT.teak,counters); inst(new THREE.CylinderGeometry(2.7,2.7,.08,24,1,false,0,Math.PI),MAT.walnut,tops); inst(new THREE.CylinderGeometry(.22,.18,.7,10),MAT.walnut,stools);
    inst(new THREE.SphereGeometry(.07,6,5),MAT.glow,lights); inst(new THREE.BoxGeometry(.72,.24,1.95),MAT.teak,frame); inst(new THREE.BoxGeometry(.66,.12,1.3),MAT.cushion,cush); inst(new THREE.BoxGeometry(.66,.1,.75),MAT.cushion,backs);
    inst(new THREE.CylinderGeometry(.05,.05,2.6,6),MAT.walnut,poles); inst(new THREE.ConeGeometry(1.9,.9,10),MAT.thatch,canopy,{cast:true}); inst(new THREE.CylinderGeometry(1.9,1.95,.35,10,1,true),MAT.thatch,fringe); }

  PLACES.push({icon:'🏛️', name:'Abyssal · Đảo khách sạn & 8 pavilion', sub:'Quảng trường +14 · cổng Master Dashboard · màn hình kênh', go:()=>teleport(0,IC[1]-44,0,IC[1])},
    {icon:'💠', name:'Abyssal · Đĩa kính Hydro-Pulse +16', sub:'Lounge 360° ôm cột thác · bar đồng', go:()=>teleport(HC[0],HC[1]+11,HC[0],HC[1])},
    {icon:'🅿️', name:'Abyssal · Sky-Shaft Drive-In (+28)', sub:'Bãi đỗ ngắm cảnh đỉnh tháp', go:()=>teleport(0,-153,0,-120)},
    {icon:'🥥', name:'Abyssal · Quầy bar dừa & ghế tắm nắng', sub:'Bãi cát vàng · nước dừa · kem dừa · sinh tố', go:()=>{ const p=el(12,.8); teleport(p[0],p[1],0,-12); }});
  out.tick=(dt)=>{ const b=out.barrier; if(b){ const near=Math.hypot(P.x-b.x,P.z-b.z)<9 && !!K.HOOK.vehicle, t=near?-1.35:0; b.piv.rotation.x+= (t-b.piv.rotation.x)*Math.min(1,dt*3); } if(out.portal) out.portal.opacity=.32+.15*Math.sin(performance.now()/450); };
  return out;
}
