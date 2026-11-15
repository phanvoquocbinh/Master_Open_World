// QC World – S11: THÀNH PHỐ HOÀNH TRÁNG trên Đồi Brand QC
//  🍜 PHỐ ẨM THỰC ĐỒI QC (chân đồi phía Bắc, phố đi bộ dẫn thẳng tới cầu thang lớn lên tháp Brand QC)
//     • 2 dãy nhà phố 2 tầng (mặt tiền kính, mái hiên, ban công cây xanh, bảng hiệu), dây đèn giăng ngang phố, bồn cây, đài phun nước
//     • 2 NHÀ HÀNG SANG đi bộ vào được: "Sky Bug Fine Dining" (đèn chùm, khăn bàn trắng, piano) · "Lẩu Nướng Hotfix" (bàn nướng, đèn lồng)
//     • quán nước bàn ngoài phố + khách bot (cafe.js) · mọi quầy gọi món được (có xác nhận trả tiền, được buff)
//  🏙️ KHU CĂN HỘ SKY QC (góc Đông Bắc): 2 toà 20 tầng ban công kính, đèn cửa sổ ban đêm, sảnh đi bộ vào được (sofa ngồi được),
//     thang máy (E) lên SÂN THƯỢNG HỒ BƠI TRÀN ngắm toàn thành phố.
export function makeFoodStreet(W, ctx){
  const {S, save, ui, askPay, fmt, spend} = ctx;
  const {THREE, scene, P, HOOK, INTER, PLACES, toast, circles, boxes, addPlat, mergeGeometries, GLOW, teleport, makeLabel, makeActor} = W;
  const info=W.hillsInfo; if(!info) return null;
  const Y=info.FLAT, TAU=Math.PI*2;
  let sd=4242; const R=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  const sm=(c,r=.7,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function Kit(){ const parts=new Map(); return { add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
    build(parent){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=!m.transparent; ms.receiveShadow=true; parent.add(ms); } } }; }
  const canvasTex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };
  const M={ wall:[0xf4ede0,0xe9d8c4,0xd9e6ee,0xf1e3cf,0xe4e9e0,0xf3dcd2].map(c=>sm(c,.85)), trim:sm(0x3b3f46,.5,.3), wood:sm(0x8a5a36,.6), woodD:sm(0x5c3b22,.7),
    glass:new THREE.MeshStandardMaterial({color:0x9cc7e0, roughness:.05, metalness:.8, transparent:true, opacity:.32, depthWrite:false, side:THREE.DoubleSide}),
    awn:[0xd94141,0x2f6fd0,0x2e8f57,0xf0a020,0x7a3fb0,0x12a594].map(c=>sm(c,.8,0,{side:THREE.DoubleSide})), white:sm(0xffffff,.6), cloth:sm(0xfbfaf6,.9), gold:sm(0xffcf6a,.3,1,{emissive:0xffa820, emissiveIntensity:.2}),
    plant:sm(0x3f8a3a,.9), pot:sm(0xb7653c,.8), stone:sm(0xcfc8bb,.8), dark:sm(0x22262c,.5), red:sm(0xb3322a,.6), lantern:sm(0xff6a3a,.5,0,{emissive:0xff5020, emissiveIntensity:.5}) };
  const k=Kit(), kin=Kit();   // kin: nội thất (ẩn khi ở xa)
  const inner=new THREE.Group(); scene.add(inner);
  const buff=(id,min)=>{ S.buffs=S.buffs||{}; S.buffs[id]=Math.max(Date.now(), S.buffs[id]||0)+min*60000; save(); };
  function menuModal(title, items){ const m=ui.modal(title); m.body.innerHTML=`<div class="grid">${items.map(([n,p,b,mn,d],i)=>`<div class="card"><b>${n}</b><small>${d}</small><div class="row" style="margin-top:auto"><span class="price">${fmt(p)} 💰</span><div class="sp"></div><button class="btn pri" data-i="${i}">Gọi</button></div></div>`).join('')}</div>`;
    m.body.querySelectorAll('[data-i]').forEach(bt=>bt.onclick=()=>{ const [n,p,b,mn]=items[+bt.dataset.i]; m.close(); askPay(p, `${n} – ${title.replace(/^[^ ]+ /,'')}`, ()=>{ if(!spend(p)) return; if(b) buff(b,mn); toast(`${n} ngon tuyệt! ${b==='energy'?`⚡ chạy nhanh hơn ${mn} phút`:b==='coffee'?`☕ thưởng quiz +20% trong ${mn} phút`:''}`, 3200); }); }); }

  /* ============================== 🍜 PHỐ ẨM THỰC ============================== */
  const F={x0:290, x1:352}, NZ=100, SZ=108, NB=92.4, SB=116.4, FH=4.2;   // mặt tiền dãy Bắc (z=100), dãy Nam (z=108); lưng nhà
  const SHOPS=[
    {row:'N', x0:291, x1:301, name:'Cà phê Bug Free', icon:'☕', kind:'cafe', menu:[['☕ Cà phê sữa đá',20,'coffee',8,'Tỉnh táo săn bug'],['🥥 Cà phê dừa',25,'coffee',10,'Béo thơm'],['🍰 Bánh tiramisu',30,'energy',6,'Ngọt ngào']]},
    {row:'N', x0:301, x1:311, name:'Bánh mì Test Case', icon:'🥖', kind:'shop', menu:[['🥖 Bánh mì đặc biệt',20,'energy',6,'Đủ case'],['🍳 Bánh mì ốp la',15,'energy',4,'Nhanh gọn']]},
    {row:'N', x0:311, x1:331, name:'Sky Bug Fine Dining', icon:'🍷', kind:'fine', menu:[['🥩 Bò Wagyu áp chảo',180,'energy',25,'Đỉnh cao ẩm thực'],['🦞 Tôm hùm nướng bơ tỏi',220,'energy',30,'Sang chảnh'],['🍷 Set tráng miệng',90,'coffee',20,'Kết thúc hoàn hảo']]},
    {row:'N', x0:331, x1:341, name:'Kem Smoke Test', icon:'🍦', kind:'shop', menu:[['🍦 Kem ốc quế',15,'energy',4,'Mát lạnh'],['🍨 Kem ly 3 vị',25,'energy',6,'Đủ 3 môi trường']]},
    {row:'N', x0:341, x1:351, name:'Sushi Unit Test', icon:'🍣', kind:'shop', menu:[['🍣 Sushi set',60,'energy',12,'Từng miếng nhỏ, test kỹ'],['🍜 Ramen',45,'energy',10,'Nóng hổi']]},
    {row:'S', x0:291, x1:301, name:'Trà sữa Regression', icon:'🧋', kind:'cafe', menu:[['🧋 Trà sữa trân châu',25,'coffee',8,'Uống lại vẫn ngon'],['🍵 Trà đào cam sả',20,'coffee',6,'Thanh mát']]},
    {row:'S', x0:301, x1:321, name:'Lẩu Nướng Hotfix', icon:'🍲', kind:'bbq', menu:[['🍲 Lẩu Thái hải sản',120,'energy',20,'Nóng như hotfix 2h sáng'],['🔥 Set nướng BBQ',140,'energy',22,'Cháy cạnh, mềm trong'],['🍺 Nước mía',15,'energy',4,'Giải nhiệt']]},
    {row:'S', x0:321, x1:331, name:'Tiệm bánh Release Day', icon:'🎂', kind:'shop', menu:[['🎂 Bánh kem mừng release',50,'coffee',10,'Mừng bản phát hành'],['🥐 Croissant',20,'energy',5,'Giòn tan']]},
    {row:'S', x0:331, x1:344, name:'Nước ép Sprint', icon:'🥤', kind:'cafe', menu:[['🥤 Nước ép cam',20,'energy',6,'Vitamin cho sprint'],['🍓 Sinh tố dâu',25,'energy',8,'Ngọt mát']]},
  ];
  // bảng hiệu: 1 atlas
  const signAt=canvasTex(1024, 64*SHOPS.length, (g,w,h)=>{ SHOPS.forEach((s,i)=>{ const y=i*64; const gr=g.createLinearGradient(0,y,0,y+64); gr.addColorStop(0,'#1d2330'); gr.addColorStop(1,'#0e1219'); g.fillStyle=gr; g.fillRect(0,y,w,64);
      g.fillStyle=s.kind==='fine'?'#ffd77a':'#ffffff'; g.font='800 38px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(`${s.icon}  ${s.name}`, w/2, y+33); }); });
  const signMat=new THREE.MeshStandardMaterial({map:signAt, emissive:0xffffff, emissiveMap:signAt, emissiveIntensity:.5, roughness:.5});
  const signGeos=[];
  const cafeOrders=[];
  SHOPS.forEach((s,i)=>{ const front=s.row==='N'?NZ:SZ, back=s.row==='N'?NB:SB, fz=s.row==='N'?1:-1, w=s.x1-s.x0, cx=(s.x0+s.x1)/2, d=Math.abs(front-back), cz=(front+back)/2, wall=M.wall[i%M.wall.length];
    const walkIn=s.kind==='fine'||s.kind==='bbq';
    // khối nhà 2 tầng
    if(!walkIn) k.add(new THREE.BoxGeometry(w-.2, FH*2+.6, d-.6), wall, cx, Y+FH+.3, cz-fz*.3);
    else { k.add(new THREE.BoxGeometry(w-.2, FH+.6, d-.6), wall, cx, Y+FH+(FH+.6)/2, cz-fz*.3);   // tầng trên đặc, tầng trệt rỗng (vào được)
      for(const x of [s.x0+.2, s.x1-.2]) k.add(new THREE.BoxGeometry(.4, FH, d-.6), wall, x, Y+FH/2, cz-fz*.3);
      k.add(new THREE.BoxGeometry(w-.2, FH, .4), wall, cx, Y+FH/2, back+fz*.2); }
    // mặt tiền tầng trệt: kính + khung (nhà hàng có cửa giữa rộng 2,4 m)
    const gz=front-fz*.15;
    if(walkIn){ const dw=2.4; for(const [a,b] of [[s.x0+.3, cx-dw/2],[cx+dw/2, s.x1-.3]]){ k.add(new THREE.BoxGeometry(b-a,3.1,.06), M.glass, (a+b)/2, Y+1.65, gz); boxes.push({x0:a, x1:b, z0:Math.min(gz,gz+fz*.01)-.2, z1:Math.max(gz,gz+fz*.01)+.2}); }
      k.add(new THREE.BoxGeometry(dw+.3,.2,.12), M.gold, cx, Y+3.25, gz); }
    else { k.add(new THREE.BoxGeometry(w-.6,3.1,.06), M.glass, cx, Y+1.65, gz); boxes.push({x0:s.x0, x1:s.x1, z0:Math.min(front,back), z1:Math.max(front,back)}); }
    for(const x of [s.x0+.15, s.x1-.15]) k.add(new THREE.BoxGeometry(.3,FH*2+.6,.3), M.trim, x, Y+FH+.3, front-fz*.15);
    k.add(new THREE.BoxGeometry(w,.3,.4), M.trim, cx, Y+3.3, front-fz*.2);
    // mái hiên sọc
    k.add(new THREE.BoxGeometry(w-.6,.08,1.8), M.awn[i%M.awn.length], cx, Y+3.55, front+fz*.85, fz*-.22,0,0);
    // bảng hiệu
    { const g=new THREE.PlaneGeometry(Math.min(w-1,8),.9), uv=g.attributes.uv; for(let j=0;j<uv.count;j++) uv.setY(j, 1-(i+1-uv.getY(j))/SHOPS.length); g.applyMatrix4(new THREE.Matrix4().makeRotationY(fz>0?0:Math.PI)); g.translate(cx, Y+4.15, front+fz*.05); signGeos.push(g); }
    // tầng 2: cửa sổ + ban công cây
    for(let x=s.x0+1.6;x<s.x1-1;x+=3.2){ k.add(new THREE.BoxGeometry(1.8,1.9,.08), M.glass, x, Y+FH+2.0, front+fz*.02); k.add(new THREE.BoxGeometry(2.2,.12,.9), M.stone, x, Y+FH+.9, front+fz*.45); k.add(new THREE.BoxGeometry(2.2,.06,.04), M.trim, x, Y+FH+1.85, front+fz*.88);
      k.add(new THREE.BoxGeometry(1.8,.4,.35), M.pot, x, Y+FH+1.15, front+fz*.6); k.add(new THREE.SphereGeometry(.45,8,6), M.plant, x-.4, Y+FH+1.55, front+fz*.6); k.add(new THREE.SphereGeometry(.4,8,6), M.plant, x+.45, Y+FH+1.5, front+fz*.6); }
    k.add(new THREE.BoxGeometry(w,.5,d), M.trim, cx, Y+FH*2+.85, cz-fz*.3);
    // quầy gọi món / quán nước
    if(!walkIn){ const qx=cx, qz=front+fz*1.2; INTER.push({x:qx, z:qz, r:2.2, prio:.6, label:`${s.icon} ${s.name} – gọi món (E)`, action:()=>menuModal(`${s.icon} ${s.name}`, s.menu)});
      if(s.kind==='cafe') cafeOrders.push({s, x:qx, z:qz+fz*.4, face:fz>0?Math.PI:0}); }
  });
  { const m=new THREE.Mesh(mergeGeometries(signGeos), signMat); scene.add(m); HOOK.onFrame.push(()=>{ signMat.emissiveIntensity=.4+(W.night||0)*1.2; }); }
  // lưng nhà dãy Bắc giáp đường: tường kín (đã là khối nhà). Đầu phố phía Tây: cổng chào
  { const gx=F.x0-.5; for(const z of [NZ+.5, SZ-.5]){ k.add(new THREE.BoxGeometry(.6,6,.6), M.red, gx, Y+3, z); circles.push({x:gx, z, r:.4}); }
    k.add(new THREE.BoxGeometry(.5,.8,SZ-NZ+1.6), M.red, gx, Y+6.2, (NZ+SZ)/2); k.add(new THREE.BoxGeometry(.7,.3,SZ-NZ+2.6), M.dark, gx, Y+6.75, (NZ+SZ)/2);
    const gate=canvasTex(1024,128,(g,w,h)=>{ g.fillStyle='#b3322a'; g.fillRect(0,0,w,h); g.fillStyle='#ffd77a'; g.font='900 68px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('PHỐ ẨM THỰC ĐỒI QC',w/2,h/2+4); });
    const gm=new THREE.MeshStandardMaterial({map:gate, emissive:0xffffff, emissiveMap:gate, emissiveIntensity:.35}); for(const sx of [-1,1]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(SZ-NZ+1.4,.75), gm); p.position.set(gx+sx*.27, Y+6.2, (NZ+SZ)/2); p.rotation.y=sx*Math.PI/2; scene.add(p); } }
  // dây đèn giăng ngang phố (bóng = 1 InstancedMesh) + cột treo
  { const bulbs=[], poles=[]; for(let x=F.x0+4;x<F.x1-6;x+=6){ for(const z of [NZ+.6, SZ-.6]) poles.push([x,z]);
      for(let t=0;t<=1.0001;t+=1/12){ const z=NZ+.6+(SZ-NZ-1.2)*t, sag=Math.sin(t*Math.PI)*.7; bulbs.push([x, Y+5.2-sag, z]); }
      for(let t=1/6;t<.99;t+=1/6){ bulbs.push([x+3, Y+5.3-Math.sin(.5*Math.PI)*.3, NZ+.6+(SZ-NZ-1.2)*t]); } }
    for(const [x,z] of poles){ k.add(new THREE.CylinderGeometry(.05,.06,5.4,6), M.trim, x, Y+2.7, z); circles.push({x, z, r:.1}); }
    const bm=new THREE.MeshStandardMaterial({color:0xfff1c8, emissive:0xffd27a, emissiveIntensity:.4}); const im=new THREE.InstancedMesh(new THREE.SphereGeometry(.09,8,6), bm, bulbs.length), mm=new THREE.Matrix4();
    bulbs.forEach(([x,y,z],i)=>{ mm.makeTranslation(x,y,z); im.setMatrixAt(i,mm); }); im.userData.dynamic=true; scene.add(im); HOOK.onFrame.push(()=>{ bm.emissiveIntensity=.3+(W.night||0)*3; });
    for(let i=0;i<bulbs.length;i+=6) GLOW && GLOW.add(bulbs[i][0], bulbs[i][1], bulbs[i][2], 1.6, 0xffd27a, .8); }
  // bồn cây + đài phun nước giữa phố
  { for(let x=F.x0+9;x<F.x1-8;x+=14){ for(const z of [NZ+1.6, SZ-1.6]){ k.add(new THREE.BoxGeometry(1.4,.6,1.4), M.stone, x, Y+.3, z); k.add(new THREE.CylinderGeometry(.12,.16,1.8,6), M.woodD, x, Y+1.4, z); k.add(new THREE.IcosahedronGeometry(1.1,1), M.plant, x, Y+2.8, z); circles.push({x, z, r:.8}); } }
    const fx=321, fz=(NZ+SZ)/2; k.add(new THREE.CylinderGeometry(2.4,2.6,.7,28), M.stone, fx, Y+.35, fz); k.add(new THREE.CylinderGeometry(2.1,2.1,.08,28), sm(0x3a9ec8,.08,.1,{transparent:true, opacity:.85}), fx, Y+.62, fz); k.add(new THREE.CylinderGeometry(.25,.4,2.0,12), M.stone, fx, Y+1.2, fz); k.add(new THREE.SphereGeometry(.45,12,8), M.gold, fx, Y+2.4, fz); circles.push({x:fx, z:fz, r:2.6}); }

  /* ---------- bàn ngoài phố cho quán nước (khách bot ngồi / bạn ngồi) ---------- */
  const tableM=sm(0xffffff,.5), chairM=sm(0x2f6fd0,.6);
  function streetTables(xa, xb, rowZ, face, umb){ const groups=[]; for(let x=xa;x<=xb;x+=3.2){ const z=rowZ, grp={seats:[], table:{x, z, y:Y+.76}};
      k.add(new THREE.CylinderGeometry(.42,.42,.04,16), tableM, x, Y+.74, z); k.add(new THREE.CylinderGeometry(.04,.05,.72,6), M.trim, x, Y+.37, z); if(umb){ k.add(new THREE.CylinderGeometry(.03,.03,2.4,6), M.white, x, Y+1.2, z); k.add(new THREE.ConeGeometry(1.25,.45,10,1,true), M.awn[(x|0)%6], x, Y+2.4, z); }
      circles.push({x, z, r:.5});
      for(const s of [-1,1]){ const cx=x+s*.85, cz=z; k.add(new THREE.BoxGeometry(.42,.06,.42), chairM, cx, Y+.45, cz); k.add(new THREE.BoxGeometry(.06,.45,.42), chairM, cx+s*.2, Y+.7, cz);
        const st=W.addSeat && W.addSeat({x:cx, z:cz, rot:s>0?-Math.PI/2:Math.PI/2, y:Y+.48, floor:Y, label:'🪑 Ngồi bàn ngoài phố (E · C)'}); if(st) grp.seats.push(st); }
      groups.push(grp); } return groups; }
  const cafeTablesN=streetTables(292, 299, NZ+3.0, 1, true), cafeTablesS=streetTables(292, 299, SZ-3.0, -1, true), juiceTables=streetTables(333, 340, SZ-3.0, -1, true);
  const reg=(o, tables, extra)=>{ (W.CAFES||(W.CAFES=[])).push({name:o.s.name, center:{x:o.x, z:o.z}, max:2, groups:tables, drinks:extra, spawn:{x:F.x0-6, z:(NZ+SZ)/2+(R()-.5)*3}, order:()=>({x:o.x, z:o.z, face:o.face}), via:()=>[]}); };
  for(const o of cafeOrders){ if(o.s.name.startsWith('Cà phê')) reg(o, cafeTablesN, ['cà phê sữa đá','cà phê dừa','bạc xỉu']); else if(o.s.name.startsWith('Trà sữa')) reg(o, cafeTablesS, ['trà sữa trân châu','trà đào']); else reg(o, juiceTables, ['nước ép cam','sinh tố dâu']); }

  /* ---------- 2 NHÀ HÀNG SANG: nội thất đi bộ vào được + khách bot ---------- */
  function restaurant(s, theme){ const fz=s.row==='N'?1:-1, front=s.row==='N'?NZ:SZ, back=s.row==='N'?NB:SB, x0=s.x0+.4, x1=s.x1-.4, zf=front-fz*.25, zb=back+fz*.5, zi0=Math.min(zf,zb), zi1=Math.max(zf,zb), cx=(x0+x1)/2;
    // tường trong (va chạm): 2 bên + lưng
    boxes.push({x0:x0-.3, x1:x0, z0:zi0, z1:zi1}); boxes.push({x0:x1, x1:x1+.3, z0:zi0, z1:zi1}); boxes.push({x0:x0, x1:x1, z0:Math.min(zb,zb+fz*-.3)-.15, z1:Math.max(zb,zb+fz*-.3)+.15});
    // sàn + trần sáng + đèn
    kin.add(new THREE.BoxGeometry(x1-x0,.06,zi1-zi0), theme.floor, cx, Y+.13, (zi0+zi1)/2); addPlat(cx, (zi0+zi1)/2, 0, (x1-x0)/2, (zi1-zi0)/2, Y+.16);   // sàn nhà hàng: đứng trên mặt sàn
    kin.add(new THREE.BoxGeometry(x1-x0,.1,zi1-zi0), theme.ceil, cx, Y+3.6, (zi0+zi1)/2);
    // quầy + bếp phía trong
    const qz=zb+fz*1.6; kin.add(new THREE.BoxGeometry(6,1.1,.8), theme.counter, cx, Y+.55, qz); kin.add(new THREE.BoxGeometry(6.2,.06,.95), M.gold, cx, Y+1.12, qz); boxes.push({x0:cx-3.1, x1:cx+3.1, z0:qz-.45, z1:qz+.45});
    INTER.push({x:cx, z:qz+fz*1.4, r:2.2, prio:.7, label:`${s.icon} ${s.name} – gọi món (E)`, action:()=>menuModal(`${s.icon} ${s.name}`, s.menu)});
    // bàn ăn (4 bàn × 2 ghế đối diện)
    const groups=[];
    for(const tx of [x0+2.4, x0+6.0, x1-6.0, x1-2.4]) for(const tz of [zf-fz*2.4]){ const grp={seats:[], table:{x:tx, z:tz, y:Y+.84}};
      kin.add(new THREE.BoxGeometry(1.4,.06,1.0), theme.table, tx, Y+.8, tz); kin.add(new THREE.BoxGeometry(1.5,.02,1.1), M.cloth, tx, Y+.84, tz); kin.add(new THREE.CylinderGeometry(.06,.08,.8,8), M.trim, tx, Y+.4, tz);
      kin.add(new THREE.CylinderGeometry(.05,.05,.18,8), theme.candle, tx, Y+.95, tz); circles.push({x:tx, z:tz, r:.6});
      for(const sx of [-1,1]){ const cxx=tx+sx*1.0; kin.add(new THREE.BoxGeometry(.48,.08,.48), theme.chair, cxx, Y+.5, tz); kin.add(new THREE.BoxGeometry(.08,.6,.48), theme.chair, cxx+sx*.22, Y+.85, tz);
        const st=W.addSeat && W.addSeat({x:cxx, z:tz, rot:sx>0?-Math.PI/2:Math.PI/2, y:Y+.55, floor:Y+.13, label:`🍽️ Ngồi bàn ${s.name} (E · C)`}); if(st) grp.seats.push(st); }
      groups.push(grp); }
    // trang trí
    if(theme.chandelier) for(const x of [cx-4.5, cx, cx+4.5]){ kin.add(new THREE.SphereGeometry(.5,14,10), theme.chandelier, x, Y+2.9, (zi0+zi1)/2); kin.add(new THREE.CylinderGeometry(.015,.015,.6,4), M.gold, x, Y+3.35, (zi0+zi1)/2); }
    if(theme.piano){ const px=x1-2.0, pz=zb+fz*3.4; kin.add(new THREE.BoxGeometry(1.6,1.0,1.4), M.dark, px, Y+.6, pz); kin.add(new THREE.BoxGeometry(1.5,.06,.4), M.white, px, Y+1.12, pz-fz*.6); circles.push({x:px, z:pz, r:1.0}); }
    if(theme.lanterns) for(let x=x0+1.5;x<x1;x+=2.5) kin.add(new THREE.SphereGeometry(.28,10,8), M.lantern, x, Y+3.0, (zi0+zi1)/2+(x%5<2.5?-1:1));
    (W.CAFES||(W.CAFES=[])).push({name:s.name, center:{x:cx, z:(zi0+zi1)/2}, max:3, groups, drinks:theme.dishes, spawn:{x:cx+(R()-.5)*6, z:(NZ+SZ)/2}, order:()=>({x:cx, z:qz+fz*1.2, face:fz>0?Math.PI:0}), via:()=>[], eat:true,
      entry:[[cx, front+fz*2.2],[cx, front-fz*1.3]], exit:[[cx, front-fz*1.3],[cx, front+fz*2.2]]});
    rooms.push({x0, x1, z0:zi0, z1:zi1});
    makeLabel(`${s.icon} ${s.name}`, 'Vào trong ngồi ăn · gọi món ở quầy', {h:.55, x:cx, y:Y+5.4, z:front+fz*1.4, fade:45}); }
  const rooms=[]; const fine=SHOPS.find(s=>s.kind==='fine'), bbq=SHOPS.find(s=>s.kind==='bbq');
  restaurant(fine, {floor:sm(0x3a2a22,.35), ceil:sm(0xf6efe2,.8,0,{emissive:0xfff0d0, emissiveIntensity:.25}), counter:sm(0x1c1f24,.4,.3), table:sm(0x2b1d14,.5), chair:sm(0x6b1f2a,.7), candle:sm(0xfff2c8,.4,0,{emissive:0xffc860, emissiveIntensity:1.2}), chandelier:sm(0xfff6e0,.2,.6,{emissive:0xffe2a0, emissiveIntensity:1.0, transparent:true, opacity:.9}), piano:true, dishes:['bò Wagyu','tôm hùm nướng','vang đỏ']});
  restaurant(bbq, {floor:sm(0x6b4a2e,.6), ceil:sm(0x3a2418,.8), counter:sm(0x8a5a36,.6), table:sm(0x5c3b22,.6), chair:sm(0x8a5a36,.7), candle:sm(0x222222,.4,.6), lanterns:true, dishes:['lẩu Thái','set nướng','nước mía']});

  /* ============================== 🏙️ KHU CĂN HỘ SKY QC ============================== */
  const A=info.APT, FLOORS=20, FLH=3.2;
  const facade=canvasTex(512,512,(g,w,h)=>{ g.fillStyle='#e9edf1'; g.fillRect(0,0,w,h); for(let r=0;r<4;r++) for(let c=0;c<4;c++){ const x=c*128, y=r*128; g.fillStyle='#2b3f55'; g.fillRect(x+10,y+18,108,84); g.fillStyle='rgba(160,200,230,.35)'; g.fillRect(x+10,y+18,108,14); g.fillStyle='#d5dbe1'; g.fillRect(x+62,y+18,4,84); } });
  facade.wrapS=facade.wrapT=THREE.RepeatWrapping;
  const lit=canvasTex(512,512,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); for(let r=0;r<4;r++) for(let c=0;c<4;c++){ if(R()<.45){ g.fillStyle=R()<.7?'#ffd9a0':'#cfe6ff'; g.fillRect(c*128+10,r*128+18,108,84); } } });
  lit.wrapS=lit.wrapT=THREE.RepeatWrapping;
  const towers=[{x:A.x0+11, z:(A.z0+A.z1)/2}, {x:A.x1-11, z:(A.z0+A.z1)/2}], TW=16, TH=FLOORS*FLH;
  const aptMat=new THREE.MeshStandardMaterial({map:facade, roughness:.4, metalness:.2, emissive:0xffffff, emissiveMap:lit, emissiveIntensity:.08});
  facade.repeat.set(TW/6.4, TH/12.8); lit.repeat.copy(facade.repeat);
  const balK=Kit(), balM=sm(0xf8f8f6,.5), railG=M.glass;
  for(const t of towers){ const lobbyH=4.6;
    // thân toà (trên sảnh)
    const body=new THREE.Mesh(new THREE.BoxGeometry(TW,TH-lobbyH,TW), aptMat); body.position.set(t.x, Y+lobbyH+(TH-lobbyH)/2, t.z); body.castShadow=true; body.receiveShadow=true; scene.add(body);
    for(let f=2;f<FLOORS;f++){ const y=Y+f*FLH; for(const [dx,dz,w,d] of [[0,TW/2+.7,TW*.7,1.4],[0,-TW/2-.7,TW*.7,1.4],[TW/2+.7,0,1.4,TW*.5],[-TW/2-.7,0,1.4,TW*.5]]){ balK.add(new THREE.BoxGeometry(w,.18,d), balM, t.x+dx, y, t.z+dz); balK.add(new THREE.BoxGeometry(w>d?w:.05,.9,w>d?.05:d), railG, t.x+dx+(w>d?0:Math.sign(dx)*.68), y+.55, t.z+dz+(w>d?Math.sign(dz)*.68:0)); } }
    // sảnh kính (đi bộ vào được)
    const L0=t.x-TW/2, L1=t.x+TW/2, Z0=t.z-TW/2, Z1=t.z+TW/2, door=2.6;
    k.add(new THREE.BoxGeometry(TW+.4,.3,TW+.4), M.trim, t.x, Y+lobbyH, t.z);
    for(const [a,b] of [[L0, t.x-door/2],[t.x+door/2, L1]]){ k.add(new THREE.BoxGeometry(b-a,lobbyH,.08), M.glass, (a+b)/2, Y+lobbyH/2, Z0); boxes.push({x0:a, x1:b, z0:Z0-.15, z1:Z0+.15}); }   // mặt Bắc có cửa (nhìn ra đường)
    k.add(new THREE.BoxGeometry(TW,lobbyH,.08), M.glass, t.x, Y+lobbyH/2, Z1); boxes.push({x0:L0, x1:L1, z0:Z1-.15, z1:Z1+.15});
    for(const x of [L0, L1]){ k.add(new THREE.BoxGeometry(.08,lobbyH,TW), M.glass, x, Y+lobbyH/2, t.z); boxes.push({x0:x-.15, x1:x+.15, z0:Z0, z1:Z1}); }
    kin.add(new THREE.BoxGeometry(TW-.4,.06,TW-.4), sm(0xe9e3d7,.35), t.x, Y+.08, t.z);
    kin.add(new THREE.BoxGeometry(3.4,1.1,.8), sm(0x1c1f24,.4,.3), t.x, Y+.55, t.z+3); kin.add(new THREE.BoxGeometry(3.5,.06,.9), M.gold, t.x, Y+1.12, t.z+3); boxes.push({x0:t.x-1.7, x1:t.x+1.7, z0:t.z+2.6, z1:t.z+3.4});
    for(const sx of [-1,1]){ const sx0=t.x+sx*4.5, sz0=t.z-2; kin.add(new THREE.BoxGeometry(2.4,.45,.9), sm(0x6d7f8f,.9), sx0, Y+.3, sz0); kin.add(new THREE.BoxGeometry(2.4,.5,.2), sm(0x6d7f8f,.9), sx0, Y+.7, sz0+.4); circles.push({x:sx0, z:sz0, r:.5});
      for(const o of [-.6,.6]) W.addSeat && W.addSeat({x:sx0+o, z:sz0-.05, rot:Math.PI, y:Y+.5, floor:Y+.08, label:'🛋️ Ngồi sofa sảnh căn hộ (E · C)'}); }
    // thang máy → sân thượng hồ bơi
    const ex=t.x, ez=t.z+TW/2-1.2; kin.add(new THREE.BoxGeometry(2.4,3,.2), sm(0xb8c0c8,.25,.9), ex, Y+1.5, ez+.6);
    const roofY=Y+TH+.2;
    INTER.push({x:ex, z:ez-.4, r:1.8, prio:.8, when:()=>P.y<Y+3, label:'🛗 Thang máy lên sân thượng hồ bơi (E)', action:()=>{ teleport(t.x-4, t.z-4, t.x, t.z+6); P.y=roofY; toast('🛗 Tầng thượng · hồ bơi tràn ngắm toàn thành phố 🌇', 2600); }});
    // sân thượng: sàn, hồ bơi tràn, ghế nằm, lan can kính, thang máy xuống
    k.add(new THREE.BoxGeometry(TW+2.8,.3,TW+2.8), sm(0xd8c7a8,.7), t.x, roofY-.15, t.z); addPlat(t.x, t.z, 0, TW/2+1.3, TW/2+1.3, roofY);
    const pool=new THREE.Mesh(new THREE.BoxGeometry(TW-3,.1,6), new THREE.MeshStandardMaterial({color:0x2fb6e6, roughness:.05, metalness:.2, emissive:0x0a6f9a, emissiveIntensity:.3, transparent:true, opacity:.9})); pool.position.set(t.x, roofY+.06, t.z+4); scene.add(pool);
    boxes.push({x0:t.x-(TW-3)/2, x1:t.x+(TW-3)/2, z0:t.z+1, z1:t.z+7, y0:roofY-.5, y1:roofY+1.5});
    k.add(new THREE.BoxGeometry(TW+2.8,1.1,.06), railG, t.x, roofY+.55, t.z-TW/2-1.4); k.add(new THREE.BoxGeometry(TW+2.8,1.1,.06), railG, t.x, roofY+.55, t.z+TW/2+1.4);
    for(const x of [t.x-TW/2-1.4, t.x+TW/2+1.4]) k.add(new THREE.BoxGeometry(.06,1.1,TW+2.8), railG, x, roofY+.55, t.z);
    for(let i=0;i<Math.ceil((TW+2.8)/.8);i++){ const o=-TW/2-1.3+i*.8; circles.push({x:t.x+o, z:t.z-TW/2-1.35, r:.2, y0:roofY-.3, y1:roofY+1.4}, {x:t.x+o, z:t.z+TW/2+1.35, r:.2, y0:roofY-.3, y1:roofY+1.4}, {x:t.x-TW/2-1.35, z:t.z+o, r:.2, y0:roofY-.3, y1:roofY+1.4}, {x:t.x+TW/2+1.35, z:t.z+o, r:.2, y0:roofY-.3, y1:roofY+1.4}); }
    for(const lx of [-5,-2.5,0,2.5,5]){ k.add(new THREE.BoxGeometry(.7,.3,1.8), M.white, t.x+lx, roofY+.25, t.z-1); W.addSeat && W.addSeat({x:t.x+lx, z:t.z-1.4, rot:Math.PI, y:roofY+.4, floor:roofY, lie:true, r:1.3, label:'🏖️ Nằm ghế tắm nắng trên sân thượng (E · C)'}); }
    INTER.push({x:t.x-6, z:t.z-6, r:1.8, prio:.8, when:()=>P.y>roofY-2, label:'🛗 Thang máy xuống sảnh (E)', action:()=>{ teleport(t.x, t.z-TW/2-3, t.x, t.z); toast('🛗 Đã xuống sảnh', 1500); }});
    k.add(new THREE.BoxGeometry(2.2,2.8,2.2), sm(0xb8c0c8,.3,.8), t.x-6, roofY+1.4, t.z-6); circles.push({x:t.x-6, z:t.z-6, r:1.2, y0:roofY-.3, y1:roofY+3});
    makeLabel('🏙️ Sky QC Residence', 'Căn hộ cao cấp · thang máy lên hồ bơi sân thượng', {h:.7, x:t.x, y:roofY+5, z:t.z, fade:160}); }
  balK.build(scene);
  HOOK.onFrame.push(()=>{ aptMat.emissiveIntensity=.06+(W.night||0)*1.0; });
  // quảng trường giữa 2 toà
  { const px=(towers[0].x+towers[1].x)/2, pz=(A.z0+A.z1)/2; k.add(new THREE.CylinderGeometry(3,3.2,.6,28), M.stone, px, Y+.3, pz); k.add(new THREE.CylinderGeometry(2.7,2.7,.08,28), sm(0x3a9ec8,.08,.1,{transparent:true, opacity:.85}), px, Y+.6, pz); circles.push({x:px, z:pz, r:3.2}); }

  k.build(scene); kin.build(inner);
  let camSet=false;
  HOOK.onFrame.push(()=>{ const near=!W.inside && (Math.hypot(P.x-321, P.z-104)<90 || Math.hypot(P.x-(A.x0+A.x1)/2, P.z-(A.z0+A.z1)/2)<70); if(inner.visible!==near) inner.visible=near;
    // trong nhà hàng / sảnh: camera không xuyên tường sang nhà bên
    const r=!W.inside && P.y<Y+3 ? [...rooms, ...towers.map(t=>({x0:t.x-7.6, x1:t.x+7.6, z0:t.z-7.6, z1:t.z+7.6}))].find(q=>P.x>q.x0 && P.x<q.x1 && P.z>q.z0 && P.z<q.z1) : null;
    if(r){ HOOK.camBox={x0:r.x0+.4, x1:r.x1-.4, z0:r.z0+.4, z1:r.z1-.4, y1:Y+3.3}; camSet=true; } else if(camSet){ camSet=false; HOOK.camBox=null; } });
  PLACES.push({icon:'🍜', name:'Phố ẩm thực Đồi QC', sub:'Nhà hàng sang · quán nước · đi tiếp lên cầu thang lớn tới tháp Brand QC', go:()=>teleport(F.x0+3, (NZ+SZ)/2, F.x0+20, (NZ+SZ)/2)},
              {icon:'🏙️', name:'Căn hộ Sky QC', sub:'2 toà 20 tầng · sảnh · hồ bơi sân thượng', go:()=>teleport(towers[0].x, towers[0].z-TW/2-3.5, towers[0].x, towers[0].z)});   // S-QA: trước nhảy ra z=A.z0-4 = ngoài mép đất → rơi xuống đáy biển
  return {SHOPS, towers};
}
