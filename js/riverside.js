// QC World – S12: BIỆT THỰ VEN ĐẦM + THAM QUAN CÓ HƯỚNG DẪN VIÊN (góc Tây Nam Đồi Brand QC)
//  🏡 4 biệt thự hiện đại 2 tầng (bê tông trắng, ốp gỗ, kính lớn, tầng trên đua ra phía đầm): phòng khách sofa, bếp đảo, bàn ăn,
//     CẦU THANG lên tầng 2 (phòng ngủ, ban công kính), hồ bơi tràn sau nhà + ghế tắm nắng, bến gỗ riêng + ca nô
//  🚧 Khu dân cư có cổng gác + hàng rào: người lạ bị chặn ngay tại cổng (báo lý do). Cư dân / khách đi cùng hướng dẫn viên được vào.
//  🚗 Hướng dẫn viên (E ở cổng) lái xe sang chở bạn chạy chậm dọc khu, dừng trước từng căn giới thiệu số phòng + GIÁ,
//     cuối tuyến mời bạn xuống xe vào xem căn mẫu (đi bộ vào trong, lên tầng). Có thể MUA biệt thự (thành cư dân, cổng luôn mở).
export function makeRiverside(W, ctx){
  const {S, save, ui, askPay, fmt, spend, transit:TR, V} = ctx;
  const {THREE, scene, P, me, HOOK, INTER, PLACES, toast, circles, boxes, addPlat, mergeGeometries, GLOW, teleport, makeLabel, removeLabel, makeActor, cam, groundAt} = W;
  const info=W.hillsInfo; if(!info) return null;
  const Y=info.FLAT+.1, LZ=info.LANE_Z, LAG=info.LAG;
  const sm=(c,r=.6,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function Kit(){ const parts=new Map(); return { add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
    build(parent){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=!m.transparent; ms.receiveShadow=true; parent.add(ms); } } }; }
  const woodTex=(()=>{ const c=document.createElement('canvas'); c.width=256; c.height=256; const g=c.getContext('2d'); g.fillStyle='#8a5a36'; g.fillRect(0,0,256,256); for(let y=0;y<256;y+=16){ const v=110+Math.random()*50|0; g.fillStyle=`rgb(${v},${v*.65|0},${v*.4|0})`; g.fillRect(0,y+1,256,14); for(let i=0;i<30;i++){ g.fillStyle='rgba(60,35,18,.25)'; g.fillRect(Math.random()*256,y+2+Math.random()*12,20+Math.random()*40,1); } } const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const M={ concrete:sm(0xf4f2ee,.55), wood:sm(0xffffff,.65,0,{map:woodTex}), frame:sm(0x1c1f24,.4,.5), glass:new THREE.MeshStandardMaterial({color:0x9ccbe6, roughness:.03, metalness:.85, transparent:true, opacity:.28, depthWrite:false, side:THREE.DoubleSide}),
    floor:sm(0xd8cfc0,.35), stone:sm(0xc9c2b4,.8), deck:sm(0xffffff,.7,0,{map:woodTex}), pool:new THREE.MeshStandardMaterial({color:0x37c1ec, roughness:.04, metalness:.15, emissive:0x0a7aa8, emissiveIntensity:.25, transparent:true, opacity:.9}),
    sofa:sm(0x5d6b78,.9), cushion:sm(0xe8e2d6,.9), white:sm(0xffffff,.5), dark:sm(0x22262c,.5), bed:sm(0xf3efe7,.9), plant:sm(0x3f8a3a,.9), pot:sm(0x2b2f35,.6), gold:sm(0xffcf6a,.3,1) };
  const inner=new THREE.Group(); scene.add(inner);
  const kin=Kit(), k=Kit();

  /* ============================== 🏡 BIỆT THỰ ============================== */
  const NAMES=['Hoàng Hôn','Gió Biển','Mặt Trăng','Bình Minh'], PRICE=[32000,28000,36000,30000], BED=[4,3,5,4];
  const VIL=info.VILLAS.map((v,i)=>({...v, name:`Biệt thự ${NAMES[i]}`, price:PRICE[i], beds:BED[i]}));
  const FH=3.6;
  for(const v of VIL){ const x0=v.x-v.w/2, x1=v.x+v.w/2, z0=v.z-v.d/2, z1=v.z+v.d/2, cx=v.x, cz=v.z;
    // ---- tầng trệt: sàn, tường ốp gỗ 2 bên, mặt kính trước/sau, cửa chính phía đường (Bắc)
    k.add(new THREE.BoxGeometry(v.w+.4,.3,v.d+.4), M.stone, cx, Y-.12, cz);
    kin.add(new THREE.BoxGeometry(v.w-.4,.04,v.d-.4), M.floor, cx, Y+.04, cz);
    for(const x of [x0+.15, x1-.15]){ k.add(new THREE.BoxGeometry(.3,FH,v.d), M.wood, x, Y+FH/2, cz); boxes.push({x0:x-.2, x1:x+.2, z0, z1, y0:Y-1, y1:Y+FH*2+.5}); }
    const door=2.0;
    for(const [a,b] of [[x0+.3, cx-door/2],[cx+door/2, x1-.3]]){ k.add(new THREE.BoxGeometry(b-a,FH-.2,.08), M.glass, (a+b)/2, Y+FH/2, z0); boxes.push({x0:a, x1:b, z0:z0-.15, z1:z0+.15, y0:Y-1, y1:Y+FH}); }
    k.add(new THREE.BoxGeometry(v.w-.6,FH-.2,.08), M.glass, cx, Y+FH/2, z1); boxes.push({x0:x0, x1:cx-1.1, z0:z1-.15, z1:z1+.15, y0:Y-1, y1:Y+FH}); boxes.push({x0:cx+1.1, x1:x1, z0:z1-.15, z1:z1+.15, y0:Y-1, y1:Y+FH});   // cửa kính trượt ra hồ bơi (giữa)
    for(let x=x0+.3;x<=x1-.3+.01;x+=(v.w-.6)/4){ k.add(new THREE.BoxGeometry(.1,FH,.12), M.frame, x, Y+FH/2, z1); if(Math.abs(x-cx)>door/2+.1) k.add(new THREE.BoxGeometry(.1,FH,.12), M.frame, x, Y+FH/2, z0); }
    // ---- sàn tầng 2 + mái (đua ra phía đầm 2 m)
    const z1b=z1+2.2, upY=Y+FH;
    k.add(new THREE.BoxGeometry(v.w+.6,.35,v.d+2.4), M.concrete, cx, upY-.05, (z0+z1b)/2);
    k.add(new THREE.BoxGeometry(v.w+1.4,.4,v.d+3.4), M.concrete, cx, upY+FH+.15, (z0+z1b)/2+.2);
    // tường tầng 2: ốp gỗ 2 bên, kính trước/sau, ban công kính phía đầm
    for(const x of [x0+.15, x1-.15]) k.add(new THREE.BoxGeometry(.3,FH,v.d+.2), M.wood, x, upY+FH/2, cz+.1);
    k.add(new THREE.BoxGeometry(v.w-.6,FH-.3,.08), M.glass, cx, upY+FH/2, z0+.1); boxes.push({x0, x1, z0:z0-.05, z1:z0+.3, y0:upY-.3, y1:upY+FH});
    k.add(new THREE.BoxGeometry(v.w-.6,FH-.3,.08), M.glass, cx, upY+FH/2, z1);
    k.add(new THREE.BoxGeometry(v.w+.4,1.05,.06), M.glass, cx, upY+.6, z1b); k.add(new THREE.BoxGeometry(v.w+.4,.06,.08), M.frame, cx, upY+1.12, z1b);
    for(let x=x0;x<=x1+.01;x+=.8) circles.push({x, z:z1b-.1, r:.2, y0:upY-.3, y1:upY+1.4});
    for(const x of [x0, x1]) for(let z=z1;z<=z1b;z+=.6) circles.push({x, z, r:.2, y0:upY-.3, y1:upY+1.4});
    // cửa kính trượt tầng 2 ra ban công (giữa mặt kính sau)
    // ---- cầu thang thẳng dọc tường Đông (từ Bắc → Nam), 15 bậc × 0,24 m
    const sx=x1-1.0, sw=1.3, n=15, rise=FH/n, run=.32, sz0=z0+1.2;
    for(let i=1;i<=n;i++){ const z=sz0+(i-.5)*run, y=Y+i*rise; kin.add(new THREE.BoxGeometry(sw,.12,run+.02), M.concrete, sx, y-.06, z); kin.add(new THREE.BoxGeometry(sw,y-Y-.1,run+.02), M.floor, sx, Y+(y-Y-.1)/2, z); addPlat(sx, z, 0, sw/2, run/2+.01, y);
      if(i>3) circles.push({x:sx-sw/2-.12, z, r:.14, y0:y-.3, y1:y+1.1}); }
    kin.add(new THREE.BoxGeometry(.05,.05,n*run), M.gold, sx-sw/2-.1, Y+FH/2+1.0, sz0+n*run/2);
    boxes.push({x0:sx-sw/2, x1:sx+sw/2, z0:sz0+2*run, z1:sz0+n*run, y0:Y-1, y1:Y+.3});   // gầm cầu thang: không đi xuyên từ bên hông
    // sàn tầng 2 (chừa lỗ cầu thang) = 2 tấm
    const holeZ0=sz0, holeZ1=sz0+n*run;
    addPlat((x0+sx-sw/2)/2, (z0+z1b)/2, 0, (sx-sw/2-x0)/2, (z1b-z0)/2, upY+.12);
    addPlat(sx, (holeZ1+z1b)/2, 0, sw/2+.05, (z1b-holeZ1)/2, upY+.12);
    addPlat(sx, (z0+holeZ0)/2, 0, sw/2+.05, (holeZ0-z0)/2, upY+.12);
    for(let z=holeZ0+.3;z<holeZ1-.6;z+=.5) circles.push({x:sx-sw/2-.12, z, r:.14, y0:upY-.2, y1:upY+1.2});   // lan can mép lỗ thang trên tầng 2
    // ---- nội thất trệt: sofa chữ L, bàn trà, bếp đảo, bàn ăn; tầng 2: giường + đèn
    const sofaX=x0+2.6, sofaZ=z1-2.4;
    kin.add(new THREE.BoxGeometry(3,.45,.9), M.sofa, sofaX, Y+.25, sofaZ); kin.add(new THREE.BoxGeometry(3,.55,.25), M.sofa, sofaX, Y+.65, sofaZ+.4); kin.add(new THREE.BoxGeometry(.9,.45,2), M.sofa, sofaX-1.05, Y+.25, sofaZ-1.3);
    for(let i=0;i<3;i++) kin.add(new THREE.BoxGeometry(.8,.15,.7), M.cushion, sofaX-1+i, Y+.52, sofaZ-.05);
    boxes.push({x0:sofaX-1.6, x1:sofaX+1.6, z0:sofaZ-.5, z1:sofaZ+.55, y0:Y-1, y1:Y+1}); boxes.push({x0:sofaX-1.55, x1:sofaX-.55, z0:sofaZ-2.3, z1:sofaZ-.4, y0:Y-1, y1:Y+1});
    for(const o of [-.9,0,.9]) W.addSeat && W.addSeat({x:sofaX+o, z:sofaZ-.05, rot:Math.PI, y:Y+.5, floor:Y, label:'🛋️ Ngồi sofa phòng khách (E · C)'});
    kin.add(new THREE.BoxGeometry(1.4,.4,.8), M.wood, sofaX, Y+.2, sofaZ-1.5); circles.push({x:sofaX, z:sofaZ-1.5, r:.6, y0:Y-1, y1:Y+1});
    kin.add(new THREE.BoxGeometry(2.6,.95,1.0), M.white, cx-.2, Y+.48, z0+2.6); kin.add(new THREE.BoxGeometry(2.8,.06,1.2), M.dark, cx-.2, Y+.98, z0+2.6); boxes.push({x0:cx-1.6, x1:cx+1.2, z0:z0+2, z1:z0+3.2, y0:Y-1, y1:Y+1.2});
    kin.add(new THREE.BoxGeometry(2.2,.06,1.1), M.wood, cx+.6, Y+.78, cz+.6); kin.add(new THREE.CylinderGeometry(.08,.1,.76,8), M.frame, cx+.6, Y+.38, cz+.6); circles.push({x:cx+.6, z:cz+.6, r:.7, y0:Y-1, y1:Y+1});
    // tầng 2: giường đôi nhìn ra đầm
    const bx=cx-1.5, bz=cz+1.2; kin.add(new THREE.BoxGeometry(2.0,.5,2.3), M.bed, bx, upY+.4, bz); kin.add(new THREE.BoxGeometry(2.1,1.0,.15), M.wood, bx, upY+.65, bz-1.2); boxes.push({x0:bx-1.05, x1:bx+1.05, z0:bz-1.25, z1:bz+1.15, y0:upY-.3, y1:upY+1.2});
    W.addSeat && W.addSeat({x:bx, z:bz, rot:0, y:upY+.65, floor:upY+.12, lie:true, r:1.6, label:'🛏️ Nằm giường ngắm đầm (E · C)'});
    for(const p of [[x0+.8,z0+.8],[x1-.8,z1-.8]]){ kin.add(new THREE.CylinderGeometry(.3,.25,.5,10), M.pot, p[0], Y+.25, p[1]); kin.add(new THREE.IcosahedronGeometry(.45,1), M.plant, p[0], Y+.85, p[1]); circles.push({x:p[0], z:p[1], r:.35, y0:Y-1, y1:Y+1.2}); }
    // đèn trần ấm (tầng trệt + tầng 2) – sáng hơn ban đêm
    for(const yy of [Y+FH-.18, upY+FH-.2]) for(const xx of [cx-3, cx+3]) kin.add(new THREE.BoxGeometry(1.4,.05,.5), V_LIGHT(), xx, yy, cz);
    // ---- sân sau: hồ bơi tràn + sàn gỗ + ghế nằm, bến gỗ ra đầm + ca nô
    const pz0=z1b+.6, pz1=pz0+3.2;
    k.add(new THREE.BoxGeometry(v.w+.4,.1,pz1-z1+1.4), M.deck, cx, Y+.02, (z1+pz1+1)/2); addPlat(cx, (z1+pz1+1)/2, 0, (v.w+.4)/2, (pz1-z1+1.4)/2, Y+.07);
    const pool=new THREE.Mesh(new THREE.BoxGeometry(v.w-2.5,.12,pz1-pz0), M.pool); pool.position.set(cx-.4, Y+.06, (pz0+pz1)/2); scene.add(pool);
    boxes.push({x0:cx-.4-(v.w-2.5)/2, x1:cx-.4+(v.w-2.5)/2, z0:pz0, z1:pz1, msg:'🏊 Hồ bơi riêng của biệt thự'});
    for(const lx of [-3.5,-1.5]){ k.add(new THREE.BoxGeometry(.7,.3,1.8), M.white, cx+lx, Y+.25, z1+1.0); W.addSeat && W.addSeat({x:cx+lx, z:z1+1.0, rot:Math.PI, y:Y+.42, floor:Y+.07, lie:true, r:1.2, label:'🏖️ Nằm ghế cạnh hồ bơi (E · C)'}); }
    const dockX=cx+v.w/2-1.4, dz0=pz1+.5, dz1=LAG.z-LAG.rz+6;
    k.add(new THREE.BoxGeometry(1.6,.15,dz1-dz0), M.deck, dockX, Y-.2, (dz0+dz1)/2); addPlat(dockX, (dz0+dz1)/2, 0, .8, (dz1-dz0)/2, Y-.12);
    for(let z=dz0;z<dz1;z+=2.5) for(const s of [-1,1]) k.add(new THREE.CylinderGeometry(.08,.08,2.2,6), M.frame, dockX+s*.8, Y-1.1, z);
    boat(dockX+1.6, dz1-2.2, v.i);
    // ---- cổng trước + đèn sân vườn
    for(const s of [-1,1]){ const gx=cx+s*1.6, gz=z0-1.6; k.add(new THREE.BoxGeometry(.4,1.6,.4), M.concrete, gx, Y+.8, gz); circles.push({x:gx, z:gz, r:.3}); GLOW && GLOW.add(gx, Y+1.75, gz, 1.6, 0xffd9a0, .9); k.add(new THREE.SphereGeometry(.14,8,6), sm(0xfff1c8,.3,0,{emissive:0xffd27a, emissiveIntensity:1}), gx, Y+1.75, gz); }
    v.door={x:cx, z:z0-.9}; v.label=makeLabel(`🏡 ${v.name}`, `${v.beds} phòng ngủ · hồ bơi tràn · bến riêng · ${fmt(v.price)} 💰`, {h:.55, x:cx, y:Y+FH*2+1.6, z:cz, fade:60}); }
  function V_LIGHT(){ return V_LIGHT.m || (V_LIGHT.m=sm(0xfff6e0,.3,0,{emissive:0xffe2b0, emissiveIntensity:.6})); }
  HOOK.onFrame.push(()=>{ if(V_LIGHT.m) V_LIGHT.m.emissiveIntensity=.4+(W.night||0)*1.8; });
  // ca nô ở bến
  function boat(x,z,i){ const g=new THREE.Group(); g.position.set(x, W.WATER_Y+.05, z); scene.add(g); const hull=new THREE.Mesh(new THREE.CylinderGeometry(.9,.6,4.2,12,1,false,0,Math.PI), sm([0xffffff,0xf2f2f2,0x1a1f2a,0xffffff][i],.35,.2)); hull.rotation.set(Math.PI/2,0,0); hull.scale.set(1,1,.6); g.add(hull);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(1.2,.5,1.4), M.glass); cab.position.set(0,.5,.2); g.add(cab); g.userData.dynamic=true; HOOK.onFrame.push((dt,T)=>{ g.position.y=W.WATER_Y+.05+Math.sin(T*1.3+i)*.05; g.rotation.z=Math.sin(T*1.1+i)*.03; }); }

  /* ============================== 🚧 CỔNG GÁC + HÀNG RÀO ============================== */
  const GZ=LZ-13, CXR=info.COAST_X, FX1=356;   // hàng rào chạy ngang z=GZ từ bờ biển tới x=FX1, rồi xuống đầm theo x=FX1
  const owner=()=>S.villa!=null, pass={until:0};
  const fenceM=sm(0xe8e4dc,.6), fenceDark=sm(0x2b2f35,.4,.5);
  for(let x=276;x<FX1;x+=2.4){ if(Math.abs(x+1.2-CXR)<4.6) continue; k.add(new THREE.BoxGeometry(2.3,1.6,.18), fenceM, x+1.2, Y+.8, GZ); k.add(new THREE.BoxGeometry(.2,1.9,.24), fenceDark, x, Y+.95, GZ); }
  for(let z=GZ;z<LAG.z-LAG.rz+3;z+=2.4){ k.add(new THREE.BoxGeometry(.18,1.6,2.3), fenceM, FX1, Y+.8, z+1.2); k.add(new THREE.BoxGeometry(.24,1.9,.2), fenceDark, FX1, Y+.95, z); }
  boxes.push({x0:270, x1:CXR-4.6, z0:GZ-.2, z1:GZ+.2, msg:'🚧 Khu biệt thự ven đầm – chỉ cư dân. Muốn tham quan? Gặp hướng dẫn viên ở cổng gác.'});
  boxes.push({x0:CXR+4.6, x1:FX1, z0:GZ-.2, z1:GZ+.2, msg:'🚧 Khu biệt thự ven đầm – chỉ cư dân. Muốn tham quan? Gặp hướng dẫn viên ở cổng gác.'});
  boxes.push({x0:FX1-.2, x1:FX1+.2, z0:GZ, z1:LAG.z, msg:'🚧 Khu biệt thự ven đầm – chỉ cư dân. Muốn tham quan? Gặp hướng dẫn viên ở cổng gác.'});
  const barrierBox={x0:CXR-4.6, x1:CXR+4.6, z0:GZ-.25, z1:GZ+.25, msg:'🚧 Cổng gác: khu biệt thự chỉ dành cho cư dân. Bấm E gặp hướng dẫn viên để được dẫn đi tham quan.'};
  boxes.push(barrierBox);
  const booth=new THREE.Group(); booth.position.set(CXR+6.2, Y, GZ-1.4); scene.add(booth);
  { const b=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.6,2.2), M.concrete); b.position.y=1.3; booth.add(b); const r=new THREE.Mesh(new THREE.BoxGeometry(2.9,.2,2.7), M.frame); r.position.y=2.7; booth.add(r); const gl=new THREE.Mesh(new THREE.BoxGeometry(2.42,1,2.22), M.glass); gl.position.y=1.7; booth.add(gl); circles.push({x:CXR+6.2, z:GZ-1.4, r:1.5}); }
  const arm=new THREE.Group(); arm.position.set(CXR-4.3, Y+1.05, GZ); scene.add(arm); { const bar=new THREE.Mesh(new THREE.BoxGeometry(8.6,.14,.14), sm(0xd94141,.5)); bar.position.x=4.3; arm.add(bar); for(let i=0;i<4;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(.9,.15,.15), M.white); s.position.x=1+i*2; arm.add(s); } const post=new THREE.Mesh(new THREE.BoxGeometry(.4,1.2,.4), fenceDark); post.position.y=-.5; arm.add(post); arm.userData.dynamic=true; }
  makeLabel('🚧 Cổng gác · Khu biệt thự Ven Đầm', 'Chỉ cư dân · tham quan cùng hướng dẫn viên', {h:.55, x:CXR, y:Y+4.2, z:GZ-1, fade:60});
  // nhân viên: bảo vệ + hướng dẫn viên
  let guide=null; if(W.people){ const mk=(seed,outfit,name,x,z,h)=>{ const kk=W.people.kit(seed,{outfit}); const a=makeActor(kk.gl,{name, height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#ffd23f'}); a.g.position.set(x,Y,z); a.g.rotation.y=h; a.play('idle',0); circles.push({x,z,r:.35}); return a; };
    mk(W.people.pickSeed(L=>!L.female,91), {shirt:0x1f2a44, pants:0x1f2a44, long:true, style:'cap'}, '👮 Bảo vệ khu biệt thự', CXR+6.2, GZ-3.2, Math.PI);
    guide=mk(W.people.pickSeed(L=>L.female && ['long','bob','ponytail'].includes(L.style),92), {shirt:0xffffff, dress:true, shoe:0x111111}, '👩‍💼 Linh · Hướng dẫn viên', CXR-6.5, GZ-2.2, Math.PI);
    HOOK.onFrame.push((dt)=>{ if(Math.hypot(P.x-guide.g.position.x,P.z-guide.g.position.z)<60) guide.mixer.update(dt); }); }

  /* ============================== 🚗 THAM QUAN CÓ HƯỚNG DẪN VIÊN ============================== */
  let tour=null; const tourCar=V && V.buildCar ? V.buildCar(0xf4f4f2, 'lux', {color2:0x15161a}) : null;
  if(tourCar){ tourCar.visible=false; tourCar.userData.dynamic=true; scene.add(tourCar); }
  const tourPts=[[CXR-1.8, GZ-24],[CXR-1.8, LZ-1],[CXR+4, LZ+1.9],[FX1-8, LZ+1.9]];   // đi đúng làn bên phải
  const tourPath=TR && TR.makePath ? TR.makePath(tourPts, false, 1.5) : null;
  function startTour(){
    if(!tourCar || !tourPath) return toast('Xe tham quan đang bảo dưỡng – thử lại sau.');
    if(tour) return; tour={s:0, v:0, stop:-1, hold:0, said:{}, stops:VIL.map(v=>({v, s:tourPath.nearest(v.x, LZ+1.9).s}))};
    tourCar.visible=true; me.g.visible=false; HOOK.camDist=9; pass.until=Date.now()+15*60000; openGate(true);
    HOOK.vehicle={drive:(dt)=>{ P.x=tourCar.position.x; P.z=tourCar.position.z; P.y=tourCar.position.y; P.face=tour?tour.h:P.face; me.g.position.copy(tourCar.position); }};
    toast('🚗 Linh: "Chào anh/chị! Mình chở đi một vòng khu Biệt thự Ven Đầm nhé – 4 căn, mỗi căn mình dừng giới thiệu."', 5200); }
  function endTour(atVilla){ const v=atVilla; tourCar.visible=false; HOOK.vehicle=null; HOOK.camDist=null; HOOK.camOverride=null; me.g.visible=true; tour=null;
    if(v){ P.x=v.door.x; P.z=v.door.z-1.2; P.y=groundAt(P.x,P.z); P.face=0; me.g.rotation.set(0,0,0); cam.yaw=Math.PI; }
    showPrices(); }
  function showPrices(){ const m=ui.modal('🏡 Khu Biệt thự Ven Đầm – bảng giá'); const g=document.createElement('div'); g.className='grid'; m.body.appendChild(g);
    m.body.insertAdjacentHTML('afterbegin', `<p>4 căn biệt thự 2 tầng, hồ bơi tràn, bến du thuyền riêng. Bạn đang có <b>${fmt(S.coins)} 💰</b>. Cổng mở cho bạn tham quan thêm 15 phút – cứ đi bộ vào từng căn, lên tầng 2 ngắm đầm.</p>`);
    for(const v of VIL){ const own=S.villa===v.i, c=document.createElement('div'); c.className='card'; c.innerHTML=`<b>🏡 ${v.name}</b><small>${v.beds} phòng ngủ · ${v.w}×${v.d} m · hồ bơi · bến riêng</small><div class="row" style="margin-top:auto"><span class="price">${fmt(v.price)} 💰</span><div class="sp"></div>${own?'<span class="jok">✓ Của bạn</span>':`<button class="btn pri">Mua</button>`}</div>`;
      const b=c.querySelector('button'); if(b) b.onclick=()=>{ m.close(); askPay(v.price, `🏡 Mua <b>${v.name}</b> (${v.beds} phòng ngủ)`, ()=>{ if(!spend(v.price)) return; S.villa=v.i; save(); openGate(true); toast(`🎉 Chúc mừng! Bạn là chủ ${v.name}. Cổng gác luôn mở cho bạn.`, 4200); }); };
      g.appendChild(c); } }
  let gateK=0, gateOpen=false;
  function openGate(on){ gateOpen=on; const i=boxes.indexOf(barrierBox); if(on && i>=0) boxes.splice(i,1); else if(!on && i<0) boxes.push(barrierBox); }
  if(guide) INTER.push({get x(){ return guide.g.position.x; }, get z(){ return guide.g.position.z; }, r:2.4, prio:.9, when:()=>!tour, get label(){ return owner() ? '🏡 Linh: "Chào cư dân! Xem lại bảng giá / tham quan (E)"' : '🚗 Tham quan khu biệt thự cùng hướng dẫn viên Linh (E)'; },
    action:()=>{ if(ui && ui.confirm) ui.confirm('🚗 Tham quan Khu Biệt thự Ven Đầm', 'Hướng dẫn viên <b>Linh</b> sẽ lái xe chở bạn đi một vòng khu, dừng trước từng căn giới thiệu <b>số phòng và giá</b>, rồi mời bạn <b>vào xem căn mẫu</b>. Miễn phí!', 'Lên xe', startTour); else startTour(); }});
  // cập nhật
  HOOK.onFrame.push((dt, T)=>{
    // cổng: cư dân / đang có lượt tham quan / xe đại gia đi qua → mở
    const carNear=(W.luxury && W.luxury.cars || []).some(c=>Math.hypot(c.g.position.x-CXR, c.g.position.z-GZ)<16) || (tour && Math.hypot(tourCar.position.x-CXR, tourCar.position.z-GZ)<16);
    const want=owner() || Date.now()<pass.until; if(want!==gateOpen) openGate(want);
    gateK+=(((want||carNear)?1:0)-gateK)*Math.min(1,dt*3); arm.rotation.z=gateK*1.35;
    if(!tour) return;
    const p=tourPath; let vt=4.5; const st=tour.stops.find((q,i)=>i>tour.stop && q.s>tour.s-1); if(st){ vt=Math.min(vt, Math.sqrt(2*1.6*Math.max(0, st.s-tour.s-.2))); }
    if(tour.hold>0){ tour.hold-=dt; vt=0; if(tour.hold<=0){ HOOK.camOverride=null; } }
    else if(st && st.s-tour.s<.4 && tour.v<.3){ const idx=tour.stops.indexOf(st); tour.stop=idx; tour.hold=5.5; const v=st.v;
      toast(`🏡 Linh: "${v.name} – ${v.beds} phòng ngủ, hồ bơi tràn, bến du thuyền riêng. Giá ${fmt(v.price)} 💰."`, 5200);
      HOOK.camOverride={pos:new THREE.Vector3(v.x-7, Y+6.5, LZ-6), look:new THREE.Vector3(v.x, Y+3, v.z), k:2.2}; }
    tour.v+=Math.max(-3*dt, Math.min(1.5*dt, vt-tour.v)); tour.s=Math.min(p.L, tour.s+tour.v*dt);
    const q=p.at(tour.s), h=p.heading(tour.s,1.2); tourCar.position.set(q.x, groundAt(q.x,q.z), q.z); tourCar.rotation.y=h; tour.h=h; for(const w of (tourCar.userData.wheels||[])) w.rotation.x+=tour.v*dt/.38;
    if(tour.stop>=tour.stops.length-1 && tour.hold<=0 && tour.s>=p.L-.5){ toast('🚗 Linh: "Mời anh/chị xuống xe vào xem căn mẫu Gió Biển – cứ tự nhiên lên tầng 2 ngắm đầm nhé!"', 5200); endTour(VIL[1]); } });

  kin.build(inner); k.build(scene);
  HOOK.onFrame.push(()=>{ const near=!W.inside && Math.hypot(P.x-318, P.z-231)<80; if(inner.visible!==near) inner.visible=near; });
  PLACES.push({icon:'🏡', name:'Khu Biệt thự Ven Đầm', sub:'Cổng gác · hướng dẫn viên chở đi tham quan · giá từ 28.000 💰', go:()=>teleport(CXR, GZ-7, CXR, GZ)});
  PLACES.push({icon:'🔑', name:'Biệt thự của bạn', sub:'Chỉ khi đã mua biệt thự ven đầm', go:()=>{ if(S.villa==null) return toast('Bạn chưa có biệt thự – gặp hướng dẫn viên Linh ở cổng khu Ven Đầm nhé.', 3200); const v=VIL[S.villa]; teleport(v.door.x, v.door.z-2, v.x, v.z); }});
  return {VIL, gateZ:GZ, startTour, showPrices, get touring(){ return !!tour; }};
}
