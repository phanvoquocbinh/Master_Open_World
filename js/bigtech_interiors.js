// QC World V2 – PHA 4: NỘI THẤT 5 TRỤ SỞ BIG TECH QA/QC (phiên qc-park, 15/11/2026) – đi bộ vào thẳng, không dùng hộp phòng 36×24 cũ
//  • Mỗi toà một mặt bằng riêng (khác nhau 100%):
//      🍎 QA Ring: hành lang vành khuyên, bàn gỗ sồi 8 m xếp hướng tâm, buồng họp kính tròn treo lơ lửng, Phòng Giám đốc cung Bắc tầng 5 (bàn nhôm nguyên khối)
//      🐉 Dragonscale: khu phố sáng tạo 2 tầng – xe cafe cổ, sân bóng rổ mini, bàn tổ ong lục giác, lều Glamping họp, gác lửng Giám đốc có bàn Bida, cầu trượt xoắn tầng 2 → 1
//      🌲 Silicon Forest: suối chảy dưới sàn kính giữa các dãy bàn, 3 nhà trên cây ở +8 m nối cầu treo gỗ, biệt thự kính Giám đốc trên vườn mái
//      🔺 Tri-Matrix: Đại cầu thang tam giác rộng 20 m làm khán đài Tech Talk, bàn 3 màn hình cong xếp tam giác đồng tâm, Phòng Giám đốc trong chóp kính
//      🏙️ Cyber Twin: sảnh thang máy 2 tháp → Cổng Trời 95 m: sàn kính nhìn xuống kênh, phòng họp HĐQT, CLB Bida thượng lưu, Phòng Chủ tịch
//  • Luồng việc làm dùng lại W.work (phỏng vấn · quẹt thẻ · máy tính làm ticket · họp Daily · ăn trưa) với danh sách `towers` do river_cbd.js cấp
import * as AK from './archKit.js';

export function makeInteriors(W, env){
  const {THREE, scene, circles, boxes, plats, INTER, HOOK, P, toast, makeLabel, addSeg, GLOW, mergeGeometries} = W;
  const {Y, HQ, towers, Kit, M, std} = env;
  const TAU=Math.PI*2, R=Math.random, LOW=W.QUAL==='low', B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), CY=(a,b,h,n=12)=>new THREE.CylinderGeometry(a,b,h,n), RB=AK.roundedBox;
  const V3=(x,y,z)=>new THREE.Vector3(x,y,z), tube=(pts,r,n=8)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length*3, r, n, false);
  const oak=AK.makeWoodMaterial({col:'#d9c3a0', plank:44, seed:61, rough:.45}), walnut=AK.makeWoodMaterial({col:'#5a3518', plank:30, seed:62, rough:.4});
  const alu=std(0xdfe4ea,{roughness:.18, metalness:1}), fabric=std(0x3d4a5c,{roughness:.9}), fabricO=std(0xe8a33d,{roughness:.9}), screenM=std(0x0e1a24,{emissive:0x3fb8ff, emissiveIntensity:.55, roughness:.2}), plant=std(0x3f8a3a,{roughness:.85});
  const GROUPS={}, NOTE=[];
  const tOf=k=>towers.find(t=>t.hq===k);
  const work=()=>W.work||{};
  const emp=t=>!!(work().isEmployee && work().isEmployee(t));
  const atY=(y,tol=1.6)=>()=>Math.abs((P.y||0)-y)<tol;
  // điểm việc làm chuẩn cho mọi toà (đều có "when" theo tầng)
  function reception(t, x, z, y=Y){ INTER.push({x, z, r:2.2, prio:.7, when:atY(y), get label(){ return emp(t) ? `💳 Quẹt thẻ nhân viên · ${t.name} (E)` : `🧑‍💼 Lễ tân ${t.short} – vào phỏng vấn QA (E)`; },
      action:()=>{ if(emp(t)) return work().swipe && work().swipe(t); if(work().interview) work().interview(t); else toast('🧑‍💼 Phòng phỏng vấn đang chuẩn bị – quay lại sau nhé!', 2600); }}); }
  function deskPC(t, x, z, y=Y, label='💻 Làm ticket trên máy trạm (E)'){ INTER.push({x, z, r:1.5, prio:.55, when:atY(y), label, action:()=>{ if(!emp(t)) return toast(`💻 Máy trạm của nhân viên ${t.short}. Xin việc ở lễ tân (phỏng vấn) trước nhé!`, 3000); work().openPC && work().openPC(t); }}); }
  function meeting(t, x, z, y=Y, label='🗣️ Họp Daily cùng team (E)'){ INTER.push({x, z, r:2, prio:.55, when:atY(y), label, action:()=>{ if(!emp(t)) return toast('🗣️ Phòng họp nội bộ – chỉ nhân viên.', 2400); work().standup && work().standup(t); }}); }
  function canteen(t, x, z, y=Y, label='🍱 Ăn trưa / cà phê (E)'){ INTER.push({x, z, r:2, prio:.5, when:atY(y), label, action:()=>{ work().lunch && work().lunch(); toast('🍱 Ngon! Nạp năng lượng cho buổi chiều debug 💪', 2600); }}); }
  function lift(x, z, from, to, label, guard){ INTER.push({x, z, r:1.6, prio:.8, when:atY(from,1.2), label:`🛗 ${label} (E)`, action:()=>{ if(guard && !guard()) return; P.y=to+.02; if(P.vy!==undefined) P.vy=0; toast(`🛗 Ting! ${label.replace(/^Thang máy /,'')}`, 1800); }}); }
  // ghế văn phòng (InstancedMesh dùng chung) · ghế ngồi được qua W.addSeat
  const CH=[]; const chair=(x,z,y,rot,sit=false,label='🪑 Ngồi ghế làm việc (E · C)')=>{ CH.push([x,y,z,rot]); if(sit && W.addSeat) W.addSeat({x, z, rot, y:y+.5, floor:y, label}); };
  const MON=[]; const monitor=(x,z,y,rot,curved=false)=>MON.push([x,y,z,rot,curved?1:0]);

  /* ============================== 🍎 1. THE INFINITE LOOP QA RING ============================== */
  { const h=HQ.ring, t=tOf('ring'), c=h.c, g=new THREE.Group(); scene.add(g); GROUPS.ring={g, c, r:70}; const K=Kit(c.x,c.z,true);
    // sàn sồi vành khuyên + dải đèn trần
    const fl=AK.arcSlab(h.R0+.3, h.R1-.3, 0, TAU, .08, .02, 120); K.add(fl, oak, c.x,Y-.05,c.z);
    // 24 bàn sồi trắng dài 8 m xếp theo tia hướng tâm (chừa cửa Nam + lõi thang Bắc)
    for(let i=0;i<24;i++){ const a=i/24*TAU+TAU/48; const dS=Math.abs(((a-Math.PI/2+Math.PI)%TAU+TAU)%TAU-Math.PI), dN=Math.abs(((a+Math.PI/2+Math.PI)%TAU+TAU)%TAU-Math.PI); if(dS<.22 || dN<.3) continue;
      const rm=42, x=c.x+Math.cos(a)*rm, z=c.z+Math.sin(a)*rm, rot=Math.atan2(Math.cos(a),Math.sin(a));
      K.add(RB(.95,.06,8,.02,2), oak, x,Y+.74,z, rot); for(const s of [-1,1]) for(const u of [-3.6,3.6]) K.add(B(.06,.72,.06), alu, x+Math.cos(a)*u+Math.cos(a+Math.PI/2)*s*.38,Y+.37,z+Math.sin(a)*u+Math.sin(a+Math.PI/2)*s*.38);
      for(let k=-3;k<=3;k+=2) for(const s of [-1,1]){ const px=x+Math.cos(a)*k+Math.cos(a+Math.PI/2)*s*.85, pz=z+Math.sin(a)*k+Math.sin(a+Math.PI/2)*s*.85; chair(px,pz,Y,rot+(s>0?Math.PI/2:-Math.PI/2)+Math.PI, k===-1); if(k===1) monitor(x+Math.cos(a)*k+Math.cos(a+Math.PI/2)*s*.25, z+Math.sin(a)*k+Math.sin(a+Math.PI/2)*s*.25, Y+.77, rot+(s>0?Math.PI/2:-Math.PI/2)); }
      const L=4.1, hx=Math.cos(a)*L, hz=Math.sin(a)*L; addSeg(x-hx,z-hz,x+hx,z+hz,.55,Y-.2,Y+1.1,'🍎 Bàn sồi dài – đi vòng nhé'); if(i%4===1) deskPC(t, x+Math.cos(a+Math.PI/2)*1.4, z+Math.sin(a+Math.PI/2)*1.4); }
    // buồng họp kính tròn treo lơ lửng (Glass Pods) + 1 buồng ở sàn làm phòng họp Daily
    const podM=new THREE.MeshPhysicalMaterial({color:0xcfe8f5, roughness:.03, transparent:true, opacity:.28, depthWrite:false, side:THREE.DoubleSide});
    for(let i=0;i<7;i++){ const a=-Math.PI/2+.55+i*.7, x=c.x+Math.cos(a)*42, z=c.z+Math.sin(a)*42, y=i===3?Y+1.6:Y+9+(i%3)*2.6; K.add(new THREE.SphereGeometry(2.4,24,16), podM, x,y,z); K.add(new THREE.TorusGeometry(2.42,.06,8,40).rotateX(Math.PI/2), alu, x,y,z); if(i!==3){ K.add(CY(.03,.03,24-(y-Y),6), alu, x,(y+Y+24)/2,z); }
      if(i===3){ circles.push({x,z,r:2.5}); meeting(t, x+Math.cos(a)*-3.2, z+Math.sin(a)*-3.2, Y, '🫧 Họp Daily trong buồng kính tròn (E)'); } }
    // quầy cà phê sát cửa, lễ tân
    { const x=c.x+7, z=c.z+h.R1-5; K.add(RB(5,1.05,1.1,.08,2), oak, x,Y+.53,z); K.add(RB(5.2,.06,1.3,.02,1), alu, x,Y+1.08,z); boxes.push({x0:x-2.6, x1:x+2.6, z0:z-.6, z1:z+.6}); canteen(t, x, z-1.6, Y, '☕ Quầy cà phê Ring – nghỉ giải lao (E)');
      const rx=c.x-6, rz=c.z+h.R1-5; K.add(RB(4.2,1.1,1.2,.15,3), std(0xf4f2ec,{roughness:.3}), rx,Y+.55,rz); boxes.push({x0:rx-2.2, x1:rx+2.2, z0:rz-.7, z1:rz+.7}); reception(t, rx, rz-1.7); }
    // lõi thang máy cung Bắc → tầng 5 Phòng Giám đốc (nhìn 180° ra vườn trong và sông)
    const ex=c.x, ez=c.z-h.R1+8, DY=Y+19.2; K.add(RB(3.2,DY-Y+3,3.2,.2,2), alu, ex,(DY+Y+3)/2,ez-3.2); boxes.push({x0:ex-1.7, x1:ex+1.7, z0:ez-4.9, z1:ez-1.5});
    K.add(B(26,.3,22), oak, ex,DY-.15,ez+3); plats.push({t:'r', x:ex, z:ez+3, c:1, s:0, hw:13, hd:11, h:DY}); for(const [ax,az,bx,bz] of [[ex-13,ez-8,ex+13,ez-8],[ex-13,ez+14,ex+13,ez+14],[ex-13,ez-8,ex-13,ez+14],[ex+13,ez-8,ex+13,ez+14]]) addSeg(ax,az,bx,bz,.15,DY-.4,DY+2.5,'🪟 Kính Phòng Giám đốc');
    K.add(RB(4.4,.08,1.8,.04,3), alu, ex,DY+.76,ez+4); K.add(RB(4.0,.7,1.4,.1,3), alu, ex,DY+.38,ez+4); chair(ex,ez+5.3,DY,Math.PI,true,'🪑 Ghế Giám đốc QA Ring (E · C)'); monitor(ex-1,ez+3.6,DY+.8,0,true); monitor(ex+1,ez+3.6,DY+.8,0,true);
    K.add(RB(6,.45,2,.2,3), fabric, ex+8,DY+.23,ez+9); K.add(RB(6,.8,.5,.2,3), fabric, ex+8,DY+.6,ez+9.9);
    lift(ex, ez-.8, Y, DY, 'Thang máy lên tầng 5 – Phòng Giám đốc', null); lift(ex, ez-.4, DY, Y, 'Thang máy xuống tầng 1', null);
    makeLabel('🍎 Phòng Giám đốc QA Ring · tầng 5', 'Bàn nhôm nguyên khối CNC · nhìn 180°', {h:.4, x:ex, y:DY+3.2, z:ez+4, fade:22});
    K.build(g); NOTE.push('ring'); }

  /* ============================== 🐉 2. DRAGONSCALE AUTO-LABS ============================== */
  { const h=HQ.dragon, t=tOf('dragon'), {x0,z0,w,d,c}=h, g=new THREE.Group(); scene.add(g); GROUPS.dragon={g, c, r:70}; const K=Kit(c.x,c.z,true), MY=Y+6;
    K.add(B(w-1,.08,d-1), AK.makeStoneMaterial({col:'#d8d2c6', joint:'#b8b0a2', blockW:128, blockH:128, seed:63, rough:.5}), c.x,Y-.02,c.z);
    // bàn tổ ong lục giác (cụm 7 bàn)
    const hexG=new THREE.CylinderGeometry(1.2,1.2,.06,6), hexL=CY(.05,.05,.72,6);
    for(const [cx,cz] of [[x0+18,z0+46],[x0+34,z0+54],[x0+50,z0+46]]) for(let i=0;i<7;i++){ const a=i/6*TAU, r=i?2.15:0, x=cx+Math.cos(a)*r, z=cz+Math.sin(a)*r; K.add(hexG, oak, x,Y+.75,z, Math.PI/6); K.add(hexL, alu, x,Y+.37,z); chair(x+.9,z+.9,Y,Math.atan2(-.9,-.9)+Math.PI,i===0); monitor(x,z-.3,Y+.78,0); circles.push({x,z,r:1.15}); if(i===0) deskPC(t, x, z+1.9); }
    // xe Cafe cổ (Citroën-style kiểu chung, không thương hiệu)
    { const x=x0+70, z=z0+52; const van=new THREE.Mesh(mergeGeometries([RB(5,2.3,2.2,.45,3).translate(0,1.55,0), RB(1.6,1.2,2.1,.3,2).translate(2.4,1.0,0), CY(.42,.42,.3,16).rotateX(Math.PI/2).translate(-1.6,.42,1.1), CY(.42,.42,.3,16).rotateX(Math.PI/2).translate(-1.6,.42,-1.1), CY(.42,.42,.3,16).rotateX(Math.PI/2).translate(1.7,.42,1.1), CY(.42,.42,.3,16).rotateX(Math.PI/2).translate(1.7,.42,-1.1)].map(q=>{ q=q.index?q.toNonIndexed():q; return q; })), std(0x9fd8c4,{roughness:.45, metalness:.3}));
      van.position.set(x,Y,z); van.castShadow=true; g.add(van); boxes.push({x0:x-3, x1:x+3, z0:z-1.3, z1:z+1.3}); K.add(B(2.4,.7,.1), std(0xf4e2c0), x,Y+1.4,z+1.15); canteen(t, x, z+2.4, Y, '☕ Xe Cafe cổ – espresso & bánh mì (E)'); }
    // sân bóng rổ mini + rổ
    { const x=x0+72, z=z0+22; const ct=new THREE.PlaneGeometry(14,12); ct.rotateX(-Math.PI/2); K.add(ct, std(0xd27a3c,{roughness:.85, polygonOffset:true, polygonOffsetFactor:-2}), x,Y+.04,z); K.add(CY(.08,.1,3.3), alu, x+6.6,Y+1.65,z); K.add(B(.06,1.05,1.8), std(0xffffff), x+6.2,Y+3.2,z); K.add(new THREE.TorusGeometry(.23,.02,6,16).rotateX(Math.PI/2), std(0xff6b1a), x+5.85,Y+3.05,z); circles.push({x:x+6.6,z,r:.15});
      INTER.push({x:x+3, z, r:2, prio:.4, when:atY(Y), label:'🏀 Ném thử 1 quả (E)', action:()=>toast(R()<.5?'🏀 Vào! Cả team vỗ tay 👏':'🏀 Hụt mất rồi… thử lại nhé!', 2000)}); }
    // 3 lều Glamping làm phòng họp
    for(const [i,[x,z]] of [[x0+16,z0+20],[x0+30,z0+16],[x0+44,z0+20]].entries()){ K.add(new THREE.ConeGeometry(3.4,4.6,6,1,true), std(0xf1e6d0,{side:THREE.DoubleSide, roughness:.9}), x,Y+2.3,z); K.add(CY(3.3,3.3,.08,6), walnut, x,Y+.04,z); K.add(RB(2.2,.08,1,.03,1), oak, x,Y+.72,z); circles.push({x,z,r:1.2});
      if(i===1) meeting(t, x, z+3.8, Y, '⛺ Họp Daily trong lều Glamping (E)'); }
    // lễ tân sát cửa Nam
    { const rx=c.x+6, rz=z0+d-5; K.add(RB(5,1.1,1.2,.2,3), std(0xf4f2ec,{roughness:.3}), rx,Y+.55,rz); boxes.push({x0:rx-2.6, x1:rx+2.6, z0:rz-.7, z1:rz+.7}); reception(t, rx, rz-1.7); }
    // gác lửng tầng 2 (mặt Bắc) + cầu thang thẳng + bàn Bida + bàn Giám đốc
    const MX0=x0+6, MX1=x0+52, MZ0=z0+2, MZ1=z0+10;
    K.add(B(MX1-MX0,.3,MZ1-MZ0), walnut, (MX0+MX1)/2,MY-.15,(MZ0+MZ1)/2); plats.push({t:'r', x:(MX0+MX1)/2, z:(MZ0+MZ1)/2, c:1, s:0, hw:(MX1-MX0)/2, hd:(MZ1-MZ0)/2, h:MY});
    for(let x=MX0;x<=MX1;x+=6) K.add(CY(.15,.15,6), alu, x,Y+3,MZ1-.2); K.add(B(MX1-MX0,1.0,.05), new THREE.MeshPhysicalMaterial({color:0xcfe8f5, transparent:true, opacity:.3, depthWrite:false}), (MX0+MX1)/2,MY+.5,MZ1);
    addSeg(MX0,MZ1,MX1-4,MZ1,.12,MY-.4,MY+2,'🐉 Lan can kính gác lửng'); addSeg(MX0,MZ0,MX0,MZ1,.12,MY-.4,MY+2,'🐉 Mép gác lửng');
    for(let i=0;i<14;i++){ const zz=MZ1+8.6-i*.6, hh=Y+(i+1)*(MY-Y)/14; plats.push({t:'r', x:MX1-2, z:zz, c:1, s:0, hw:1.6, hd:.31, h:hh}); K.add(B(3.2,.16,.6), walnut, MX1-2,hh-.08,zz); }   /* bậc thấp ở phía Nam, bậc cao sát mép gác */
    for(const sx of [-1,1]) addSeg(MX1-2+sx*1.65,MZ1,MX1-2+sx*1.65,MZ1+9,.1,Y+.6,MY+2,'🪜 Lan can cầu thang gác lửng');
    AK.buildBilliardTable(W, MX0+10, MY, (MZ0+MZ1)/2, 0, 0x1f4fbf, 'world');
    K.add(RB(3,.08,1.4,.03,2), walnut, MX0+24,MY+.76,(MZ0+MZ1)/2); K.add(RB(2.8,.7,1.2,.1,2), walnut, MX0+24,MY+.38,(MZ0+MZ1)/2); chair(MX0+24,(MZ0+MZ1)/2+1.1,MY,Math.PI,true,'🪑 Ghế Giám đốc Dragonscale (E · C)'); monitor(MX0+24,(MZ0+MZ1)/2-.3,MY+.79,0,true);
    makeLabel('🐉 Gác lửng Giám đốc · Bida', 'Lên bằng cầu thang gỗ phía Đông gác', {h:.4, x:MX0+16, y:MY+3, z:(MZ0+MZ1)/2, fade:24});
    // cầu trượt ống xoắn từ gác lửng xuống tầng 1
    { const sx=MX0+36, sz=MZ1+5, pts=[]; for(let i=0;i<=40;i++){ const k=i/40, a=k*TAU*1.6; pts.push(V3(sx+Math.cos(a)*3, MY+.4-k*(MY-Y), sz+Math.sin(a)*3)); }
      K.add(tube(pts,.75,14), new THREE.MeshPhysicalMaterial({color:0xffc531, transparent:true, opacity:.55, roughness:.15, side:THREE.DoubleSide, depthWrite:false}), 0,0,0); K.add(CY(.25,.25,MY+1,10), alu, sx,Y+(MY+1)/2,sz); circles.push({x:sx,z:sz,r:.3});
      const top=pts[0]; let slide=null;
      INTER.push({x:top.x, z:MZ1-.8, r:1.6, prio:.8, when:atY(MY), label:'🛝 Trượt cầu trượt xoắn xuống tầng 1 (E)', action:()=>{ if(HOOK.vehicle) return; slide={t:0}; const ctrl={drive(dt){ if(!slide) return; slide.t+=dt/2.6; const k=Math.min(1,slide.t), i=k*40, p=pts[Math.min(40,Math.floor(i))], q=pts[Math.min(40,Math.ceil(i))], f=i-Math.floor(i);
          P.x=p.x+(q.x-p.x)*f; P.z=p.z+(q.z-p.z)*f; P.y=p.y+(q.y-p.y)*f-.3; P.px=P.x; P.pz=P.z; P.vx=P.vz=0; P.face=Math.atan2(q.x-p.x,q.z-p.z); W.me.g.position.set(P.x,P.y,P.z); W.me.g.rotation.set(0,P.face,0); W.me.play && W.me.play('idle');
          if(k>=1){ slide=null; HOOK.vehicle=null; const e=pts[40]; P.x=e.x+1.6; P.z=e.z; P.y=Y; toast('🛝 Wheee~ Xuống tầng 1 nhanh như deploy hotfix!', 2200); } }}; HOOK.vehicle=ctrl; }}); }
    K.build(g); NOTE.push('dragon'); }

  /* ============================== 🌲 3. SILICON FOREST & TREEHOUSE HUB ============================== */
  { const h=HQ.forest, t=tOf('forest'), {x0,x1,z0,z1,c}=h, g=new THREE.Group(); scene.add(g); GROUPS.forest={g, c, r:70}; const K=Kit(c.x,c.z,true);
    // suối chảy dưới sàn kính (dải nước chuyển động + kính + viền gỗ) giữa 2 dãy bàn
    const wN=W.TX && W.TX.waterN ? W.TX.waterN.clone() : null; if(wN){ wN.wrapS=wN.wrapT=THREE.RepeatWrapping; wN.repeat.set(6,.6); wN.needsUpdate=true; }
    const streamM=new THREE.MeshStandardMaterial({color:0x2d7f8a, roughness:.05, metalness:.25, normalMap:wN||null, envMapIntensity:1.5}); streamM.userData.noMerge=true;
    const st=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0-8,3.2), streamM); st.rotation.x=-Math.PI/2; st.position.set(c.x,Y+.02,160); st.userData.dynamic=true; g.add(st); GROUPS.forest.stream=wN;
    K.add(B(x1-x0-8,.04,3.4), new THREE.MeshPhysicalMaterial({color:0xdff3ff, roughness:.02, transparent:true, opacity:.22, depthWrite:false}), c.x,Y+.07,160); for(const s of [-1,1]) K.add(B(x1-x0-8,.1,.18), walnut, c.x,Y+.06,160+s*1.75);
    for(let x=x0+8;x<x1-6;x+=4.2) for(const s of [-1,1]){ const z=160+s*4.2; K.add(RB(3.2,.06,1.1,.02,2), oak, x,Y+.74,z); for(const u of [-1.4,1.4]) K.add(B(.06,.72,.06), alu, x+u,Y+.37,z); chair(x-.7,z+s*.9,Y,s>0?0:Math.PI,(x|0)%3===0); chair(x+.7,z+s*.9,Y,s>0?0:Math.PI); monitor(x-.7,z-s*.25,Y+.77,s>0?Math.PI:0); monitor(x+.7,z-s*.25,Y+.77,s>0?Math.PI:0); boxes.push({x0:x-1.65, x1:x+1.65, z0:z-.6, z1:z+.6}); }
    deskPC(t, x0+16.6, 160+5.6); deskPC(t, x1-16, 160-5.6);
    for(let x=x0+10;x<x1-6;x+=12) K.add(new THREE.IcosahedronGeometry(.7,1).scale(1,.8,1), plant, x,Y+.6,160+7.4);
    // lễ tân (cửa Nam) + quầy ăn (cửa Bắc, cạnh Cầu Kính)
    { const rx=c.x+6, rz=z1-4; K.add(RB(4.4,1.1,1.2,.2,3), M.cedar, rx,Y+.55,rz); boxes.push({x0:rx-2.3, x1:rx+2.3, z0:rz-.7, z1:rz+.7}); reception(t, rx, rz-1.7);
      const kx=c.x+12, kz=z0+5; K.add(RB(5,1.05,1.1,.08,2), M.cedar, kx,Y+.53,kz); boxes.push({x0:kx-2.6, x1:kx+2.6, z0:kz-.6, z1:kz+.6}); canteen(t, kx, kz+1.6, Y, '🥗 Quầy ăn Silicon Forest – salad & nước ép (E)'); }
    // 3 nhà trên cây ở +8 m quanh 3 cây cổ thụ, nối bằng cầu treo gỗ · cầu thang gỗ từ sàn lên
    const TY=Y+8, TH=[HQ.trees6[1], HQ.trees6[0], HQ.trees6[2]];
    for(const [i,[tx,tz]] of TH.entries()){ K.add(CY(4.2,4.2,.35,20), walnut, tx,TY-.17,tz); plats.push({t:'c', x:tx, z:tz, r:4.1, h:TY}); K.add(RB(4.4,2.6,3.2,.25,2), M.cedar, tx+1.2,TY+1.3,tz-1.2); K.add(new THREE.ConeGeometry(3.4,1.8,4).rotateY(Math.PI/4), walnut, tx+1.2,TY+3.5,tz-1.2);
      for(let k=0;k<20;k++){ const a=k/20*TAU; K.add(B(.08,1.0,.08), walnut, tx+Math.cos(a)*4.05,TY+.5,tz+Math.sin(a)*4.05); }
      for(let k=0;k<20;k++){ const a=k/20*TAU, b=(k+1)/20*TAU; if(k%5===2) continue; addSeg(tx+Math.cos(a)*4.1,tz+Math.sin(a)*4.1,tx+Math.cos(b)*4.1,tz+Math.sin(b)*4.1,.12,TY-.4,TY+2,'🌳 Lan can nhà trên cây'); }
      if(i===1) meeting(t, tx-2, tz+1.5, TY, '🌳 Họp Daily trong Nhà Trên Cây (E)'); }
    // cầu treo nối 0–1, 1–2 (dải plat + ván + dây)
    for(const [a,b] of [[TH[0],TH[1]],[TH[1],TH[2]]]){ const dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L, n=Math.ceil((L-8)/1.2);
      for(let k=0;k<=n;k++){ const s=4+k*(L-8)/n, x=a[0]+ux*s, z=a[1]+uz*s, sag=-.6*Math.sin(Math.PI*k/n); K.add(B(1.6,.08,.5), M.cedar, x,TY+sag-.04,z, Math.atan2(ux,uz)+Math.PI/2); plats.push({t:'r', x, z, c:Math.cos(Math.atan2(ux,uz)), s:Math.sin(Math.atan2(ux,uz)), hw:.8, hd:L/n/2+.1, h:TY+sag}); }
      for(const sd of [-1,1]){ const pts=[]; for(let k=0;k<=12;k++){ const s=4+k*(L-8)/12; pts.push(V3(a[0]+ux*s+uz*sd*.8, TY+1+(-.6*Math.sin(Math.PI*k/12)), a[1]+uz*s-ux*sd*.8)); } K.add(tube(pts,.04,5), std(0xc8b48a), 0,0,0); addSeg(a[0]+ux*4+uz*sd*.85, a[1]+uz*4-ux*sd*.85, b[0]-ux*4+uz*sd*.85, b[1]-uz*4-ux*sd*.85, .1, TY-1.2, TY+2, '🌉 Dây cầu treo'); } }
    { const [tx,tz]=TH[0], sx=tx+4.6; for(let i=0;i<20;i++){ const hh=Y+(i+1)*(TY-Y)/20, zz=tz+12-i*.6; plats.push({t:'r', x:sx, z:zz, c:1, s:0, hw:.75, hd:.31, h:hh}); K.add(B(1.5,.12,.6), M.cedar, sx,hh-.06,zz); } for(const s of [-1,1]) addSeg(sx+s*.8,tz+.6,sx+s*.8,tz+12.4,.08,Y+.6,TY+2,'🪜 Lan can cầu thang lên Nhà Trên Cây'); }
    makeLabel('🌳 Nhà Trên Cây · phòng họp +8 m', 'Lên bằng cầu thang gỗ cạnh cây cổ thụ', {h:.4, x:TH[1][0], y:TY+5, z:TH[1][1], fade:28});
    // biệt thự kính Giám đốc trên vườn mái khối Đông Bắc
    { const b=h.blocks[1], ry=Y+5+b.f*4+.42, cx=(b.x0+b.x1)/2, cz=(b.z0+b.z1)/2; K.add(B(12,3.4,9), new THREE.MeshPhysicalMaterial({color:0xcfe8f5, transparent:true, opacity:.3, roughness:.03, depthWrite:false, side:THREE.DoubleSide}), cx,ry+1.7,cz); K.add(B(12.6,.25,9.6), M.white, cx,ry+3.5,cz);
      plats.push({t:'r', x:cx, z:cz, c:1, s:0, hw:(b.x1-b.x0)/2, hd:(b.z1-b.z0)/2, h:ry}); for(const [ax,az,bx,bz] of [[b.x0,b.z0,b.x1,b.z0],[b.x1,b.z0,b.x1,b.z1],[b.x1,b.z1,b.x0,b.z1],[b.x0,b.z1,b.x0,b.z0]]) addSeg(ax,az,bx,bz,.12,ry-.4,ry+2,'🌿 Mép vườn mái');
      K.add(RB(3.4,.08,1.5,.03,2), M.cedar, cx,ry+.76,cz); chair(cx,cz+1.2,ry,Math.PI,true,'🪑 Ghế Giám đốc Silicon Forest (E · C)'); monitor(cx,cz-.3,ry+.79,0,true);
      lift(b.x0+2, b.z1+1.2, Y, ry, 'Thang máy lên vườn mái – biệt thự Giám đốc', null); lift(b.x0+2, b.z1-1.2, ry, Y, 'Thang máy xuống sảnh', null); }
    K.build(g); NOTE.push('forest'); }

  /* ============================== 🔺 4. THE TRI-MATRIX PERF CENTER ============================== */
  { const h=HQ.tri, t=tOf('tri'), c=h.c, g=new THREE.Group(); scene.add(g); GROUPS.tri={g, c, r:70}; const K=Kit(c.x,c.z,true);
    // Đại cầu thang tam giác 20 m (khán đài Tech Talk) – 8 bậc tam giác đồng tâm, mặt sàn bậc đi lên được
    const tri=(r)=>{ const s=new THREE.Shape(); for(let i=0;i<3;i++){ const a=-Math.PI/2+i*TAU/3; i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r); } s.closePath(); return s; };
    for(let k=0;k<8;k++){ const r=13-k*1.45, hh=.45; const g2=new THREE.ExtrudeGeometry(tri(r),{depth:hh, bevelEnabled:false}); g2.rotateX(-Math.PI/2); K.add(g2, oak, c.x,Y+k*hh,c.z+3, 0); plats.push({t:'c', x:c.x, z:c.z+3, r:r*.5, h:Y+(k+1)*hh}); }
    K.add(B(12,6.5,.3), screenM, c.x,Y+6,c.z-14); makeLabel('🎤 Tech Talk: "Load test 1 triệu user không sập"', 'Ngồi trên khán đài tam giác (E · C)', {h:.42, x:c.x, y:Y+10, z:c.z-14, fade:30});
    for(let k=1;k<8;k++) for(const a of [0,TAU/3,2*TAU/3]){ const r=(13-k*1.45)*.42, ang=-Math.PI/2+a+Math.PI/3; if(W.addSeat) W.addSeat({x:c.x+Math.cos(ang)*r, z:c.z+3+Math.sin(ang)*r, rot:Math.atan2(-Math.cos(ang),-Math.sin(ang)), y:Y+k*.45+.45, floor:Y+k*.45, label:'🎤 Ngồi nghe Tech Talk (E · C)'}); }
    // bàn 3 màn hình cong xếp theo tam giác đồng tâm quanh khán đài
    for(const rr of [20,26]) for(let side=0;side<3;side++){ const a0=-Math.PI/2+side*TAU/3+Math.PI/3, nx=Math.cos(a0), nz=Math.sin(a0), tx=-nz, tz=nx;
      for(let k=-3;k<=3;k++){ const x=c.x+nx*rr*.55+tx*k*3.2, z=c.z+3+nz*rr*.55+tz*k*3.2; if(Math.hypot(x-h.door.x,z-h.door.z)<7) continue; const rot=Math.atan2(-nx,-nz);
        K.add(RB(2.6,.06,1.0,.02,2), std(0x2a2f36,{roughness:.35, metalness:.5}), x,Y+.74,z, rot); for(const u of [-.8,0,.8]) monitor(x+tx*u-nx*.25, z+tz*u-nz*.25, Y+.77, rot, true); chair(x+nx*.9,z+nz*.9,Y,rot+Math.PI,k===0); boxes.push({x0:x-1.3, x1:x+1.3, z0:z-1.3, z1:z+1.3}); if(k===0 && rr===20) deskPC(t, x+nx*1.8, z+nz*1.8); } }
    { const rx=h.door.x+7, rz=h.door.z+6; K.add(RB(4.4,1.1,1.2,.2,3), std(0x1d2a24,{roughness:.3, metalness:.4}), rx,Y+.55,rz); boxes.push({x0:rx-2.3, x1:rx+2.3, z0:rz-.7, z1:rz+.7}); reception(t, rx, rz-1.7);
      const kx=h.door.x-9, kz=h.door.z+8; K.add(RB(5,1.05,1.1,.08,2), std(0x1d2a24,{roughness:.3}), kx,Y+.53,kz); boxes.push({x0:kx-2.6, x1:kx+2.6, z0:kz-.6, z1:kz+.6}); canteen(t, kx, kz-1.6, Y, '⚡ Quầy năng lượng Perf – cà phê đen & bánh (E)');
      meeting(t, c.x+16, c.z+18, Y, '📊 Họp Daily – xem dashboard tải (E)'); }
    // Phòng Giám đốc trong chóp kính 30 m (thang máy kính ở góc Tây Nam khán đài)
    const DY=Y+30, ex=c.x-16, ez=c.z+12; K.add(CY(1.4,1.4,DY-Y,16,1,true), new THREE.MeshPhysicalMaterial({color:0xcfe8f5, transparent:true, opacity:.25, roughness:.03, depthWrite:false, side:THREE.DoubleSide}), ex,(DY+Y)/2,ez); circles.push({x:ex,z:ez,r:1.5});
    K.add(CY(6.8,6.8,.3,3).rotateY(Math.PI/6), oak, c.x,DY-.15,c.z); plats.push({t:'c', x:c.x, z:c.z, r:5.6, h:DY}); for(let i=0;i<24;i++){ const a=i/24*TAU, b=(i+1)/24*TAU; addSeg(c.x+Math.cos(a)*5.8,c.z+Math.sin(a)*5.8,c.x+Math.cos(b)*5.8,c.z+Math.sin(b)*5.8,.12,DY-.4,DY+2,'🔺 Kính chóp Tri-Matrix'); }
    K.add(RB(3,.08,1.3,.03,2), std(0x2a2f36,{roughness:.3, metalness:.6}), c.x,DY+.76,c.z); chair(c.x,c.z+1.1,DY,Math.PI,true,'🪑 Ghế Giám đốc Tri-Matrix (E · C)'); for(const u of [-.8,0,.8]) monitor(c.x+u,c.z-.25,DY+.79,0,true);
    lift(ex+1.8, ez, Y, DY, 'Thang máy kính lên chóp – Phòng Giám đốc', null); lift(c.x+3.5, c.z, DY, Y, 'Thang máy xuống đại sảnh', null);
    K.build(g); NOTE.push('tri'); }

  /* ============================== 🏙️ 5. CYBER TWIN-TOWER: SẢNH + CỔNG TRỜI 95 m ============================== */
  { const h=HQ.twin, t=tOf('twin'), g=new THREE.Group(); scene.add(g); const c={x:365, z:(h.z0+h.z1)/2}; GROUPS.twin={g, c, r:90}; const K=Kit(c.x,c.z,true), BY=h.BY0, z0=h.z0+1, z1=h.z1-1, bx0=h.bx0+1, bx1=h.bx1-1;
    const guard=()=>{ if(emp(t)) return true; toast('👮 Bảo vệ: "Cổng Trời chỉ dành cho nhân viên Cyber Twin – mời bạn phỏng vấn ở lễ tân sảnh trước."', 3600); return false; };
    for(const [i,tw] of h.towers.entries()){ const cx=(tw.x0+tw.x1)/2, rz=h.z0+5; K.add(RB(5,1.1,1.2,.2,3), std(0x1b1d22,{roughness:.25, metalness:.6}), cx,Y+.55,rz); boxes.push({x0:cx-2.6, x1:cx+2.6, z0:rz-.7, z1:rz+.7});
      if(i===0) reception(t, cx-4, rz-1.6); K.add(RB(2.6,4,2.6,.2,2), alu, cx+6,Y+2,h.z0+12); boxes.push({x0:cx+4.6, x1:cx+7.4, z0:h.z0+10.6, z1:h.z0+13.4});
      lift(cx+6, h.z0+9.8, Y, BY, 'Thang máy tốc hành lên Cổng Trời 95 m', guard); }
    // sàn kính trong suốt nhìn xuống kênh
    K.add(B(bx1-bx0,.06,z1-z0), new THREE.MeshPhysicalMaterial({color:0xe6f6ff, roughness:.02, transparent:true, opacity:.14, depthWrite:false}), (bx0+bx1)/2,BY+.03,c.z); plats.push({t:'r', x:(bx0+bx1)/2, z:c.z, c:1, s:0, hw:(bx1-bx0)/2, hd:(z1-z0)/2, h:BY});
    for(const [ax,az,bx,bz] of [[bx0,z0,bx1,z0],[bx1,z0,bx1,z1],[bx1,z1,bx0,z1],[bx0,z1,bx0,z0]]) addSeg(ax,az,bx,bz,.2,BY-.5,BY+4,'🏙️ Vách kính Cổng Trời – nhìn xuống kênh Đông Hoa 95 m');
    const lx=bx0+2.5; lift(lx, c.z-6, BY, Y, 'Thang máy xuống sảnh', null);
    // phòng họp HĐQT (bàn óc chó 12 m + 14 ghế) · CLB Bida thượng lưu · Phòng Chủ tịch
    K.add(RB(12,.1,2.6,.04,2), walnut, bx0+14,BY+.76,c.z); K.add(RB(11,.7,1.6,.1,2), walnut, bx0+14,BY+.38,c.z); boxes.push({x0:bx0+8, x1:bx0+20, z0:c.z-1.3, z1:c.z+1.3}); boxes[boxes.length-1].y0=BY-.5; boxes[boxes.length-1].y1=BY+1.2;
    for(let k=-5;k<=5;k+=2) for(const s of [-1,1]) chair(bx0+14+k*1,c.z+s*1.8,BY,s>0?Math.PI:0,k===1);
    meeting(t, bx0+14, c.z+3.4, BY, '🏛️ Họp Hội đồng Quản trị (E)'); makeLabel('🏛️ Phòng họp HĐQT · Cổng Trời 95 m', null, {h:.4, x:bx0+14, y:BY+3.4, z:c.z, fade:20});
    for(const [i,dz] of [-7,7].entries()) AK.buildBilliardTable(W, bx0+34, BY, c.z+dz, Math.PI/2, i?0x7a1020:0x0d5a3c, 'world');
    K.add(RB(6,1.1,1,.1,2), walnut, bx0+42,BY+.55,c.z-14+2.5); canteen(t, bx0+42, c.z-14+4.2, BY, '🥃 Quầy bar CLB Bida thượng lưu (E)');
    makeLabel('🎱 CLB Bida & Cigar thượng lưu', null, {h:.4, x:bx0+34, y:BY+3.4, z:c.z, fade:20});
    K.add(RB(3.6,.08,1.6,.03,2), walnut, bx1-8,BY+.76,c.z); K.add(RB(3.4,.7,1.4,.1,2), walnut, bx1-8,BY+.38,c.z); chair(bx1-8,c.z+1.3,BY,Math.PI,true,'🪑 Ghế Chủ tịch Tập đoàn (E · C)'); deskPC(t, bx1-8, c.z-1.8, BY, '💻 Máy trạm Chủ tịch – xem báo cáo QA toàn tập đoàn (E)');
    K.add(RB(5,.45,2,.2,3), fabric, bx1-8,BY+.23,c.z+9); makeLabel('👔 Phòng Chủ tịch Tập đoàn', null, {h:.4, x:bx1-8, y:BY+3.4, z:c.z, fade:20});
    GROUPS.twin.cam={x0:bx0+.3, x1:bx1-.3, z0:z0+.3, z1:z1-.3, y0:BY, y1:h.BY1-.6};
    K.build(g); NOTE.push('twin'); }

  /* ---------- ghế + màn hình dùng chung (InstancedMesh: 2–3 lượt vẽ cho mọi toà) ---------- */
  const chairG=mergeGeometries([RB(.5,.08,.5,.03,1).translate(0,.47,0), RB(.5,.55,.07,.03,1).translate(0,.78,-.22), CY(.03,.03,.42,6).translate(0,.24,0), CY(.26,.26,.04,5).translate(0,.03,0)].map(q=>q.index?q.toNonIndexed():q));
  const chIM=new THREE.InstancedMesh(chairG, fabric, CH.length); CH.forEach(([x,y,z,r],i)=>{ chIM.setMatrixAt(i, new THREE.Matrix4().compose(V3(x,y,z), new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),r), V3(1,1,1))); }); chIM.castShadow=!LOW; chIM.userData.dynamic=true; scene.add(chIM);
  const monG=mergeGeometries([RB(.62,.38,.04,.015,1).translate(0,.32,0), CY(.02,.02,.14,6).translate(0,.07,0)].map(q=>q.index?q.toNonIndexed():q)); const monS=new THREE.PlaneGeometry(.58,.34).translate(0,.32,.022);
  const mIM=new THREE.InstancedMesh(monG, std(0x1b1d22,{roughness:.35, metalness:.5}), MON.length), sIM=new THREE.InstancedMesh(monS, screenM, MON.length);
  MON.forEach(([x,y,z,r],i)=>{ const m=new THREE.Matrix4().compose(V3(x,y,z), new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),r), V3(1,1,1)); mIM.setMatrixAt(i,m); sIM.setMatrixAt(i,m); }); for(const m of [mIM,sIM]){ m.userData.dynamic=true; m.castShadow=false; scene.add(m); }
  const SHARED=[chIM, mIM, sIM];

  /* ---------- khung hình: ẩn nội thất ở xa · giới hạn camera trong Cổng Trời · suối chảy · HUD ca làm ---------- */
  let near=-1, tick=0;
  HOOK.onFrame.push((dt,T)=>{ tick-=dt; if(GROUPS.forest && GROUPS.forest.stream) GROUPS.forest.stream.offset.x=T*.12;
    if(tick<=0){ tick=.4; let any=false; for(const k in GROUPS){ const G=GROUPS[k], d=Math.hypot(P.x-G.c.x, P.z-G.c.z), v=d<G.r+60; if(G.g.visible!==v) G.g.visible=v; if(v) any=true; } for(const m of SHARED) m.visible=any;
      const tw=GROUPS.twin; if(tw && tw.cam){ const q=tw.cam, inB=P.x>q.x0 && P.x<q.x1 && P.z>q.z0 && P.z<q.z1 && P.y>q.y0-1 && P.y<q.y1; if(inB) HOOK.camBox={x0:q.x0, x1:q.x1, z0:q.z0, z1:q.z1, y1:q.y1}; else if(HOOK.camBox && HOOK.camBox.__twin) HOOK.camBox=null; if(inB) HOOK.camBox.__twin=true; }
      // HUD ca làm khi đang ở trong 1 trụ sở
      let inside=null; for(const t of towers){ const G=GROUPS[t.hq]; if(!G) continue; if(Math.hypot(P.x-G.c.x,P.z-G.c.z)<(t.inR||45)){ inside=t; break; } }
      if(inside!==near){ near=inside; try{ work().onFloor && work().onFloor(inside, inside?{kind:'lobby', n:1, name:'Sảnh'}:null); }catch(e){} } } });
  return {groups:GROUPS, built:NOTE};
}
