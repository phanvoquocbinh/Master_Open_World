import { makePoser } from './pose.js';
// QC World – S18: TRUNG TÂM VIỆC LÀM KHỔNG LỒ (Phường Khởi Nghiệp – thay toà nhỏ cũ)
//  🏢 Tháp 11 tầng (~46 m), sảnh kính 20 × 17 m ĐI BỘ VÀO ĐƯỢC: quầy thông tin ở giữa (bảng việc cũ: chân tay · trí tuệ · xin việc công ty),
//     10 QUẦY NGHỀ dọc tường – bot làm nghề gì thì bạn làm được nghề đó, mỗi nghề 3 mức (dễ / vừa / khó), có giờ hạn, có lương:
//     ☕ Pha chế · 🛍️ Bán hàng phố ẩm thực · 🌻 Làm vườn · 👮 Bảo vệ tuần tra · 🔧 Sửa đèn đường · 🛵 Giao đồ ăn · 🚕 Chở khách ·
//     🧭 Hướng dẫn viên (dẫn khách bot đi theo) · 🎣 Ngư dân (canh cá cắn câu) · 🧽 Rửa xe showroom
//  Cột sáng vàng chỉ chỗ làm, khung trên cùng màn hình đếm việc + giờ còn lại; xong → nhận lương (+10% nếu đang là nhân viên công ty).
export function makeJobCenter(W, ctx){
  const {S, save, ui, addCoins, fmt, jobs, ward, towers} = ctx;
  const {THREE, scene, P, HOOK, INTER, PLACES, toast, circles, boxes, mergeGeometries, teleport, makeLabel, removeLabel, labels, makeActor, groundAt, burst, lerpAngle} = W;
  const R=Math.random, pick=a=>a[Math.floor(R()*a.length)];
  const sm=(c,r=.5,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function Kit(){ const parts=new Map(); return { add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
    build(parent){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=!m.transparent; ms.receiveShadow=true; parent.add(ms); } } }; }
  const canvasTex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };
  const mmss=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  /* ============================== 🏢 TOÀ NHÀ ============================== */
  const X0=166, X1=186, Z0=256, Z1=273, CX=(X0+X1)/2, CZ=(Z0+Z1)/2, HH=8, Y=.02;   // quy hoạch 15/11/2026: khối A Phường mới, cửa chính quay ra đường z=290
  // gỡ toà nhỏ cũ (cùng chỗ) – giữ nguyên chức năng bảng việc
  for(const o of scene.children.slice()) if(o.isGroup && Math.abs(o.position.x-193)<.01 && Math.abs(o.position.z-70.5)<.01) scene.remove(o);
  for(let i=boxes.length-1;i>=0;i--){ const b=boxes[i]; if(Math.abs(b.x0-(193-6.3))<.01 && Math.abs(b.z0-(70.5-4))<.01) boxes.splice(i,1); }
  for(const L of (labels||[]).slice()) if(L.el && L.el.textContent && L.el.textContent.includes('Trung tâm Việc làm') && Math.abs((L.x??L.pos?.x??193)-193)<1) removeLabel(L);
  const k=Kit(), M={ glass:new THREE.MeshStandardMaterial({color:0x9fd2f5, roughness:.03, metalness:.85, transparent:true, opacity:.28, depthWrite:false, side:THREE.DoubleSide}), steel:sm(0xcfd5dc,.25,.9), white:sm(0xf3f3f1,.4), dark:sm(0x1c2028,.5,.3), floor:sm(0xe7e4dc,.18,.05), navy:sm(0x16324f,.5), gold:sm(0xffcf6a,.3,1,{emissive:0xffa820, emissiveIntensity:.2}) };
  // sảnh kính 2 tầng
  k.add(new THREE.BoxGeometry(X1-X0,.12,Z1-Z0), M.floor, CX,Y+.06,CZ);
  const door=3.2, DZ=Z1;   // cửa chính nhìn ra phố Phường (phía Nam)
  for(const [a,b] of [[X0,CX-door/2],[CX+door/2,X1]]){ k.add(new THREE.BoxGeometry(b-a,HH,.08), M.glass, (a+b)/2,Y+HH/2,DZ); boxes.push({x0:a, x1:b, z0:DZ-.15, z1:DZ+.15}); }
  k.add(new THREE.BoxGeometry(door,HH-3.2,.08), M.glass, CX,Y+3.2+(HH-3.2)/2,DZ);
  k.add(new THREE.BoxGeometry(X1-X0,HH,.3), M.white, CX,Y+HH/2,Z0); boxes.push({x0:X0, x1:X1, z0:Z0-.2, z1:Z0+.2});
  for(const x of [X0,X1]){ k.add(new THREE.BoxGeometry(.3,HH,Z1-Z0), M.white, x,Y+HH/2,CZ); boxes.push({x0:x-.2, x1:x+.2, z0:Z0, z1:Z1}); }
  for(let x=X0;x<=X1+.01;x+=4) k.add(new THREE.BoxGeometry(.2,HH,.24), M.steel, x,Y+HH/2,DZ);
  k.add(new THREE.BoxGeometry(X1-X0+1.2,.5,Z1-Z0+1.2), M.dark, CX,Y+HH+.25,CZ);
  k.add(new THREE.BoxGeometry(7,.3,3.4), M.white, CX,Y+3.9,DZ+1.6); for(const s of [-1,1]){ k.add(new THREE.CylinderGeometry(.14,.14,3.8,10), M.steel, CX+s*3.2,Y+1.9,DZ+3); circles.push({x:CX+s*3.2, z:DZ+3, r:.2}); }
  // thân tháp phía trên (kính xanh, đèn cửa sổ ban đêm)
  const facade=canvasTex(512,512,(g,w,h)=>{ g.fillStyle='#1d4466'; g.fillRect(0,0,w,h); for(let r=0;r<8;r++) for(let c=0;c<4;c++){ g.fillStyle=`rgb(${40+R()*30|0},${90+R()*40|0},${140+R()*50|0})`; g.fillRect(c*128+6,r*64+6,116,52); } g.fillStyle='#c9d4de'; for(let c=0;c<=4;c++) g.fillRect(c*128-3,0,6,h); for(let r=0;r<=8;r++) g.fillRect(0,r*64-3,w,6); });
  const lit=canvasTex(512,512,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); for(let r=0;r<8;r++) for(let c=0;c<4;c++) if(R()<.5){ g.fillStyle=R()<.7?'#ffe0a8':'#cfe6ff'; g.fillRect(c*128+6,r*64+6,116,52); } });
  for(const t of [facade,lit]){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(4,5); }
  const towerM=new THREE.MeshStandardMaterial({map:facade, roughness:.15, metalness:.5, emissive:0xffffff, emissiveMap:lit, emissiveIntensity:.1});
  const TW=16, TD=12.6, TH=38; const tower=new THREE.Mesh(new THREE.BoxGeometry(TW,TH,TD), towerM); tower.position.set(CX,Y+HH+.5+TH/2,CZ-1.6); tower.castShadow=true; tower.receiveShadow=true; scene.add(tower);
  k.add(new THREE.BoxGeometry(TW+.6,1.2,TD+.6), M.navy, CX,Y+HH+TH+1.1,CZ-1.6);
  const crown=canvasTex(2048,256,(g,w,h)=>{ g.fillStyle='#0b1a2e'; g.fillRect(0,0,w,h); g.fillStyle='#ffd23f'; g.fillRect(0,h-14,w,14); g.fillStyle='#fff'; g.font='900 120px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('TRUNG TÂM VIỆC LÀM QC',w/2,h/2-6); });
  const crownM=new THREE.MeshStandardMaterial({map:crown, emissive:0xffffff, emissiveMap:crown, emissiveIntensity:.7});
  for(const [x,z,ry] of [[CX,CZ-1.6+TD/2+.32,0],[CX,CZ-1.6-TD/2-.32,Math.PI]]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(TW,2.0), crownM); p.position.set(x,Y+HH+TH-1.5,z); p.rotation.y=ry; scene.add(p); }
  { const s=canvasTex(1024,160,(g,w,h)=>{ g.fillStyle='#0f2747'; g.fillRect(0,0,w,h); g.fillStyle='#ffd23f'; g.fillRect(0,h-12,w,12); g.fillStyle='#fff'; g.font='800 64px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🧑‍💼 TRUNG TÂM VIỆC LÀM QC',w/2,h/2-4); });
    const p=new THREE.Mesh(new THREE.PlaneGeometry(14,2.2), new THREE.MeshStandardMaterial({map:s, emissive:0xffffff, emissiveMap:s, emissiveIntensity:.5})); p.position.set(CX,Y+HH-1.2,DZ+.06); scene.add(p); }
  HOOK.onFrame.push(()=>{ const n=W.night||0; towerM.emissiveIntensity=.08+n*1.0; crownM.emissiveIntensity=.5+n*1.0; });
  // quầy thông tin giữa sảnh (bảng việc cũ)
  k.add(new THREE.CylinderGeometry(2.2,2.2,1.1,24,1,false,0,Math.PI*1.4), M.navy, CX,Y+.55,CZ+1.2); k.add(new THREE.TorusGeometry(2.25,.06,6,32,Math.PI*1.4), M.gold, CX,Y+1.12,CZ+1.2, Math.PI/2,0,0); circles.push({x:CX, z:CZ+1.2, r:2.2});
  const infoInter=INTER.find(it=>typeof it.label==='string' && it.label.includes('Xem bảng việc làm')); if(infoInter){ infoInter.x=CX; infoInter.z=CZ+4.0; infoInter.label='🧑‍💼 Quầy thông tin – việc chân tay · việc trí tuệ · xin việc công ty (E)'; }
  // màn hình lớn "việc nóng hôm nay"
  const hot=canvasTex(1024,512,(g,w,h)=>{ g.fillStyle='#07121f'; g.fillRect(0,0,w,h); g.fillStyle='#46d39a'; g.font='800 54px "Segoe UI",sans-serif'; g.fillText('🔥 VIỆC NÓNG HÔM NAY',40,80); g.font='500 34px "Segoe UI","Segoe UI Emoji",sans-serif'; g.fillStyle='#dfe8f5';
    ['☕ Pha chế quán Ngắm Biển ...... 50–150 💰','🛵 Giao đồ ăn Đồi QC ........... 60–170 💰','🚕 Chở khách quanh thành phố ... 70–180 💰','🧭 Hướng dẫn viên du lịch ...... 60–160 💰','🎣 Ngư dân bến cảng ............ 40–130 💰'].forEach((t,i)=>g.fillText(t,40,160+i*66)); });
  { const p=new THREE.Mesh(new THREE.PlaneGeometry(9,4.5), new THREE.MeshStandardMaterial({map:hot, emissive:0xffffff, emissiveMap:hot, emissiveIntensity:.7})); p.position.set(CX,Y+5,Z0+.2); scene.add(p); }

  /* ============================== 🧩 ĐỘNG CƠ CA LÀM ============================== */
  const hud=document.createElement('div'); hud.className='glass'; hud.style.cssText='position:fixed;left:50%;top:112px;transform:translateX(-50%);padding:8px 14px;font-weight:700;font-size:14px;z-index:5;display:none;white-space:nowrap;gap:14px;align-items:center'; document.body.appendChild(hud);
  const beamMat=new THREE.MeshBasicMaterial({color:0xffd23f, transparent:true, opacity:.32, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide});
  function marker(x,z,y){ const g=new THREE.Group(); g.position.set(x, y??groundAt(x,z), z); g.userData.dynamic=true; const b=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,30,14,1,true), beamMat); b.position.y=15; g.add(b);
    const r=new THREE.Mesh(new THREE.RingGeometry(.75,1.0,32), new THREE.MeshBasicMaterial({color:0xffd23f, transparent:true, opacity:.85, depthWrite:false, side:THREE.DoubleSide})); r.rotation.x=-Math.PI/2; r.position.y=.06; g.add(r); scene.add(g); return g; }
  let shift=null;
  function clearShift(){ if(!shift) return; for(const m of shift.markers) scene.remove(m); for(const it of shift.inters){ const i=INTER.indexOf(it); if(i>=0) INTER.splice(i,1); } if(shift.follower){ const a=shift.follower.a; if(a.label) removeLabel(a.label); if(a.g.parent) a.g.parent.remove(a.g); } shift=null; hud.style.display='none'; }
  function stepTo(i){ const st=shift.steps[i]; for(const m of shift.markers) scene.remove(m); shift.markers=[]; for(const it of shift.inters){ const j=INTER.indexOf(it); if(j>=0) INTER.splice(j,1); } shift.inters=[];
    if(!st){ return done(); } shift.i=i; const m=marker(st.x, st.z, st.y); shift.markers.push(m);
    const it={x:st.x, z:st.z, r:st.r||1.8, prio:1.2, when:()=>!!shift && (!st.when || st.when()), label:st.label, action:()=>{ if(st.act && st.act()===false) return; burst && burst(new THREE.Vector3(st.x,(st.y??groundAt(st.x,st.z))+1,st.z),[0xffd23f,0x46d39a,0xffffff],26,1.6,.6,-4,.12); toast(st.ok||'✅', 1200); stepTo(i+1); }};
    INTER.push(it); shift.inters.push(it); if(st.say) toast(st.say, 3600); renderHud(); }
  function done(){ const s=shift, pay=Math.round(s.pay*((S.work && S.work.job)?1.1:1)); clearShift(); S.work=S.work||{}; S.work.manual=(S.work.manual||0)+1; S.work.types=S.work.types||{}; S.work.types[s.id]=(S.work.types[s.id]||0)+1; save(); addCoins(pay, `✅ Xong ca ${s.def.icon} ${s.def.name} (${s.lvName}) – nhận ${fmt(pay)} 💰`); }
  function renderHud(){ if(!shift){ hud.style.display='none'; return; } hud.style.display='flex'; const n=shift.steps.length;
    hud.innerHTML=`<span>${shift.def.icon} <b>${shift.def.name}</b> · ${shift.lvName}</span><span>📍 ${Math.min(shift.i+1,n)}/${n}: ${shift.steps[shift.i]?.hint||''}</span><span>⏱ ${mmss(shift.left)}</span><span>💰 ${fmt(shift.pay)}</span><button class="btn" style="padding:4px 10px">Nghỉ ca</button>`;
    hud.querySelector('button').onclick=()=>ui.confirm('Nghỉ ca?', 'Nghỉ giữa chừng thì chưa được trả lương.', 'Nghỉ ca', ()=>{ clearShift(); toast('Đã nghỉ ca.'); }); }
  HOOK.onFrame.push((dt)=>{ if(!shift) return; shift.left-=dt; if(shift.left<=0){ const n=shift.def.name; clearShift(); toast(`⏱ Hết giờ ca ${n} – chưa xong nên chưa có lương. Quay lại quầy nhận ca mới nhé!`, 4200); return; }
    shift.hudT=(shift.hudT||0)-dt; if(shift.hudT<=0){ shift.hudT=.5; renderHud(); }
    if(shift.follower) updFollower(dt); if(shift.fish) updFish(dt); });

  /* ---------- toạ độ nơi làm ---------- */
  const info=W.hillsInfo, cafes=W.CAFES||[], LV={easy:'Dễ', medium:'Vừa', hard:'Khó'}, N={easy:3, medium:5, hard:8}, T={easy:240, medium:330, hard:420};
  const cafeSpot=name=>{ const c=cafes.find(c=>c.name.includes(name)); return c ? c.order() : null; };
  const randIn=(x0,x1,z0,z1,ok)=>{ for(let i=0;i<80;i++){ const x=x0+R()*(x1-x0), z=z0+R()*(z1-z0); if(ok(x,z)) return {x,z}; } return {x:(x0+x1)/2, z:(z0+z1)/2}; };
  const freeAt=(x,z)=>!circles.some(c=>(c.y0===undefined) && Math.hypot(x-c.x,z-c.z)<c.r+.6) && !boxes.some(b=>b.y0===undefined && x>b.x0-.6 && x<b.x1+.6 && z>b.z0-.6 && z<b.z1+.6);
  const DRINKS=['☕ cà phê sữa đá','🥥 nước dừa','🍓 sinh tố dâu','🧋 trà sữa','🍊 nước cam','🍵 trà đào'];
  const DEFS={
    barista:{icon:'☕', name:'Pha chế', desc:'Đứng quầy quán nước, pha đúng món khách gọi (bấm E ở quầy mỗi khi có đơn).', pay:{easy:50, medium:95, hard:150},
      steps:(n,lv)=>{ const sp=(lv==='easy'?cafeSpot('Ngắm Biển'):cafeSpot('Bug Free'))||cafeSpot('Ngắm Biển')||{x:0,z:0}; return Array.from({length:n},()=>{ const d=pick(DRINKS); return {x:sp.x, z:sp.z, label:`☕ Pha ${d} (E)`, hint:`khách gọi ${d}`, ok:`☕ ${d} xong – khách khen ngon!`}; }); }},
    seller:{icon:'🛍️', name:'Bán hàng phố ẩm thực', desc:'Phụ bán ở các quầy Phố ẩm thực Đồi QC – chạy tới quầy có khách đang chờ.', pay:{easy:55, medium:100, hard:160},
      steps:(n)=>{ const shops=(W.foodStreet && W.foodStreet.SHOPS)||[]; return Array.from({length:n},()=>{ const s=pick(shops.length?shops:[{x0:300,x1:310,row:'N',name:'quầy'}]), x=(s.x0+s.x1)/2, z=s.row==='N'?101.4:106.6; return {x, z, label:`🛍️ Bán hàng ở ${s.name||'quầy'} (E)`, hint:s.name||'quầy hàng', ok:'🛍️ Đã bán – khách cảm ơn!'}; }); }},
    garden:{icon:'🌻', name:'Làm vườn', desc:'Tưới cây, cắt tỉa bồn hoa quanh quảng trường đảo Master Dashboard.', pay:{easy:40, medium:75, hard:120},
      steps:(n)=>Array.from({length:n},()=>{ const a=R()*Math.PI*2, r=14+R()*22, p=randIn(Math.cos(a)*r-2,Math.cos(a)*r+2,Math.sin(a)*r-2,Math.sin(a)*r+2,freeAt); return {x:p.x, z:p.z, label:'🌻 Tưới cây · tỉa lá (E)', hint:'bồn cây cần chăm', ok:'🌻 Cây tươi tốt hẳn!'}; })},
    guard:{icon:'👮', name:'Bảo vệ tuần tra', desc:'Đi tuần các góc ngã tư Downtown, ký sổ tuần tra ở mỗi chốt.', pay:{easy:45, medium:85, hard:130},
      steps:(n)=>{ const IX=(W.traffic && W.traffic.IX)||[{x:178,z:0}]; return Array.from({length:n},()=>{ const ix=pick(IX), sx=R()<.5?-1:1, sz=R()<.5?-1:1; const c=((W.CITY.roads&&W.CITY.roads.hw)||5)+2.4; return {x:ix.x+sx*c, z:ix.z+sz*c, label:'👮 Ký sổ tuần tra (E)', hint:'chốt tuần tra ở góc ngã tư', ok:'👮 Chốt an toàn ✅'}; }); }},
    lamp:{icon:'🔧', name:'Sửa đèn đường', desc:'Kiểm tra và thay bóng đèn đường hỏng ở Downtown & Phường.', pay:{easy:45, medium:90, hard:140},
      steps:(n)=>{ const L=(W.lamps||[]).filter(l=>l.position && l.position.x>136 && l.position.z<480); return Array.from({length:n},()=>{ const l=pick(L.length?L:[{position:{x:190,z:6}}]); return {x:l.position.x-.4, z:l.position.z+.6, label:'🔧 Thay bóng đèn (E)', hint:'đèn đường chập chờn', ok:'💡 Đèn sáng lại rồi!'}; }); }},
    food:{icon:'🛵', name:'Giao đồ ăn', desc:'Nhận món ở nhà hàng Phố ẩm thực rồi giao tới căn hộ, biệt thự hoặc toà công ty (đi xe máy cho nhanh!).', pay:{easy:60, medium:110, hard:170},
      steps:(n)=>{ const out=[], dst=[]; const fsT=(W.foodStreet && W.foodStreet.towers)||[]; for(const t of fsT) dst.push({x:t.x, z:t.z-10, name:'Sky QC Residence'}); for(const t of (towers||[]).filter(t=>t.door&&!t.locked)) dst.push({x:t.door.x, z:t.door.z+(t.face>0?2:-2), name:t.name}); if(W.riverside) dst.push({x:info?info.COAST_X:286, z:(W.riverside.gateZ||205)-6, name:'Cổng khu biệt thự'});
        const k=Math.max(1,Math.round(n/2)); for(let i=0;i<k;i++){ const d=pick(dst.length?dst:[{x:200,z:86,name:'Phường'}]); out.push({x:321, z:104, label:'🍱 Nhận món ở Phố ẩm thực (E)', hint:'lấy món ở giữa phố ẩm thực', ok:'🍱 Đã lấy món – giao ngay!'}); out.push({x:d.x, z:d.z, label:`🛵 Giao món cho khách ở ${d.name} (E)`, hint:`giao tới ${d.name}`, ok:'🛵 Giao xong – được 5 sao ⭐'}); } return out; }},
    taxi:{icon:'🚕', name:'Chở khách', desc:'Đón khách ở điểm hẹn rồi chở tới nơi (lái ô tô / xe máy của bạn – bấm V).', pay:{easy:70, medium:120, hard:180},
      steps:(n)=>{ const G=W.transit && W.transit.G; const nodes=G?G.nodes.filter(q=>q.x>130):[{x:178,z:0}]; const out=[]; const k=Math.max(1,Math.round(n/2)); for(let i=0;i<k;i++){ const a=pick(nodes), b=pick(nodes); out.push({x:a.x, z:a.z, r:4, label:'🚕 Đón khách (E)', hint:'tới điểm đón khách', ok:'🚕 Khách đã lên xe!'}); out.push({x:b.x, z:b.z, r:4, label:'🚕 Trả khách (E)', hint:'chở khách tới nơi', ok:'🚕 Khách trả tiền + tip!'}); } return out; }},
    guide:{icon:'🧭', name:'Hướng dẫn viên', desc:'Dẫn một khách du lịch đi tham quan các điểm nổi tiếng (khách đi theo sau bạn).', pay:{easy:60, medium:105, hard:160}, follower:true,
      steps:(n)=>{ const spots=[{x:-2,z:30,n:'Quảng trường đảo Master Dashboard'},{x:199,z:13,n:'Cổng Bắc Đại công viên Hồ Ngọc'},{x:292,z:104,n:'Cổng Phố ẩm thực Đồi QC'}]; if(W.monument){ const M=W.monument; spots.push({x:M.C.x+Math.cos(M.ENT)*20, z:M.C.z+Math.sin(M.ENT)*20, n:'Tháp Brand QC'}); } if(W.luxury) spots.push({x:W.luxury.door.x-3, z:W.luxury.door.z, n:'QC Auto Luxury Showroom'});
        const k=Math.min(spots.length, n<=3?2:n<=5?3:4), list=spots.sort(()=>R()-.5).slice(0,k); return list.map(s=>({x:s.x, z:s.z, r:3.4, label:`🧭 Giới thiệu ${s.n} cho khách (E)`, hint:`dẫn khách tới ${s.n}`, ok:`🧭 Khách thích ${s.n} lắm!`, when:()=>!shift.follower || Math.hypot(shift.follower.x-s.x, shift.follower.z-s.z)<6})); }},
    fish:{icon:'🎣', name:'Ngư dân', desc:'Ra cuối cầu tàu Bến cảng, thả câu và bấm E đúng lúc cá cắn câu (phao chìm).', pay:{easy:40, medium:85, hard:130}, fish:true,
      steps:(n)=>Array.from({length:n},()=>({x:0, z:-98, label:'🎣 Giật cần (E)', hint:'canh phao – cá cắn thì bấm E', ok:'🐟 Câu được 1 con!', act:()=>fishTry()}))},
    carwash:{icon:'🧽', name:'Rửa xe showroom', desc:'Rửa sạch xe trưng bày và xe khách gửi trước QC Auto Luxury Showroom.', pay:{easy:40, medium:80, hard:125},
      steps:(n)=>{ const L=W.luxury; const bx=L?L.door.x-6:200, bz=L?L.door.z:86; return Array.from({length:n},(v,i)=>({x:bx-(i%3)*3, z:bz-8+Math.floor(i/3)*5, label:'🧽 Rửa xe (E)', hint:'xe cần rửa trước showroom', ok:'✨ Xe sáng bóng!'})); }},
  };
  function startShift(id, lv){ if(shift) return toast('Bạn đang trong ca làm – xong hoặc nghỉ ca đó trước nhé.'); if(jobs && jobs.active) return toast('Bạn đang làm việc khác ở bảng việc – xong việc đó trước nhé.');
    const def=DEFS[id]; const steps=def.steps(N[lv], lv); shift={id, def, lv, lvName:LV[lv], steps, pay:def.pay[lv], left:T[lv]+(id==='taxi'||id==='food'||id==='guide'?120:0), markers:[], inters:[], i:0};
    if(def.follower) spawnFollower(); if(def.fish){ shift.fish={state:'wait', t:2+R()*3}; }
    toast(`${def.icon} Nhận ca ${def.name} (${LV[lv]}) – theo cột sáng vàng. Lương ${fmt(def.pay[lv])} 💰`, 4200); stepTo(0); }
  // khách du lịch đi theo (nghề hướng dẫn viên)
  function spawnFollower(){ if(!W.people) return; const sd=W.people.pickSeed(L=>R()<.5?L.female:!L.female, 900+Math.floor(R()*50)), kk=W.people.kit(sd,{outfit:{shirt:0xff8fc2, shorts:true, long:false}}); const a=makeActor(kk.gl,{name:'🧳 Khách du lịch', height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#ff8fc2'}); a.play('idle',0); shift.follower={a, x:P.x-1.5, z:P.z-1.5, h:0}; }
  function updFollower(dt){ const f=shift.follower, dx=P.x-f.x, dz=P.z-f.z, d=Math.hypot(dx,dz); if(d>40){ f.x=P.x-1.5; f.z=P.z-1.5; } const sp=d>2.2?Math.min(d*1.2, 5):0;
    if(sp>0){ f.x+=dx/d*sp*dt; f.z+=dz/d*sp*dt; f.h=lerpAngle(f.h, Math.atan2(dx,dz), Math.min(1,dt*8)); } f.a.play(sp>3?'run':sp>0?'walk':'idle'); f.a.g.position.set(f.x, groundAt(f.x,f.z), f.z); f.a.g.rotation.y=f.h; f.a.mixer.update(dt); }
  // câu cá: phao + thời điểm cắn câu
  const bobber=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8), sm(0xff3b3b,.4)); bobber.visible=false; scene.add(bobber);
  function updFish(dt){ const f=shift.fish, near=Math.hypot(P.x-0,P.z+98)<4; bobber.visible=near; if(!near) return; f.t-=dt; const bx=0, bz=-103.5, base=W.WATER_Y+.05;
    if(f.state==='wait'){ bobber.position.set(bx, base+Math.sin(performance.now()/300)*.03, bz); if(f.t<=0){ f.state='bite'; f.t=1.3; toast('🎣 Phao chìm – BẤM E!', 1100); } }
    else if(f.state==='bite'){ bobber.position.set(bx, base-.12, bz); if(f.t<=0){ f.state='wait'; f.t=2+R()*3; toast('🐟 Cá sổng mất rồi… canh tiếp!', 1200); } } }
  function fishTry(){ const f=shift && shift.fish; if(!f) return true; if(f.state==='bite'){ f.state='wait'; f.t=2+R()*3; return true; } toast('🎣 Chưa có cá cắn – đợi phao chìm rồi mới giật!', 1400); return false; }

  /* ---------- 10 quầy nghề dọc tường sảnh ---------- */
  const IDS=Object.keys(DEFS);
  const signAt=canvasTex(1024, 96*IDS.length, (g,w)=>{ IDS.forEach((id,i)=>{ const y=i*96, d=DEFS[id]; g.fillStyle='#0f2747'; g.fillRect(0,y,w,96); g.fillStyle='#ffd23f'; g.fillRect(0,y+88,w,8); g.fillStyle='#fff'; g.font='800 52px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(`${d.icon} ${d.name.toUpperCase()}`,w/2,y+46); }); });
  const signGeos=[];
  const booths=IDS.map((id,i)=>{ let x, z, face;   // 4 quầy tường Bắc · 3 quầy mỗi bên Tây/Đông
    if(i<4){ x=X0+3+i*((X1-X0-6)/3); z=Z0+1.4; face=0; } else if(i<7){ x=X0+1.4; z=Z0+4+(i-4)*4; face=Math.PI/2; } else { x=X1-1.4; z=Z0+4+(i-7)*4; face=-Math.PI/2; }
    const f=[Math.sin(face),Math.cos(face)];
    k.add(new THREE.BoxGeometry(3,1.1,.8), M.white, x,Y+.55,z, 0,face,0); k.add(new THREE.BoxGeometry(3.1,.06,.95), M.navy, x,Y+1.12,z, 0,face,0);
    boxes.push({x0:x-(Math.abs(f[1])>.5?1.55:.45), x1:x+(Math.abs(f[1])>.5?1.55:.45), z0:z-(Math.abs(f[1])>.5?.45:1.55), z1:z+(Math.abs(f[1])>.5?.45:1.55)});
    const g=new THREE.PlaneGeometry(3,.36), uv=g.attributes.uv; for(let j=0;j<uv.count;j++) uv.setY(j, 1-(i+1-uv.getY(j))/IDS.length); g.applyMatrix4(new THREE.Matrix4().makeRotationY(face)); g.translate(x-f[0]*.3, Y+2.6, z-f[1]*.3); signGeos.push(g);
    const bx=x+f[0]*1.5, bz=z+f[1]*1.5, def=DEFS[id];
    INTER.push({x:bx, z:bz, r:1.6, prio:.9, label:`${def.icon} Quầy nghề ${def.name} – nhận ca (E)`, action:()=>openBooth(id)});
    return {id, x, z, face}; });
  { const m=new THREE.Mesh(mergeGeometries(signGeos), new THREE.MeshStandardMaterial({map:signAt, emissive:0xffffff, emissiveMap:signAt, emissiveIntensity:.55})); scene.add(m); }
  function openBooth(id){ const d=DEFS[id], m=ui.modal(`${d.icon} Quầy nghề ${d.name}`);
    m.body.innerHTML=`<p>${d.desc}</p><div class="grid">${['easy','medium','hard'].map(lv=>`<div class="card"><b>${LV[lv]}</b><small>${N[lv]} việc · ${mmss(T[lv])} phút</small><div class="row" style="margin-top:auto"><span class="price">${fmt(d.pay[lv])} 💰</span><div class="sp"></div><button class="btn pri" data-lv="${lv}">Nhận ca</button></div></div>`).join('')}</div>
      <p class="muted" style="font-size:12px">Đã làm nghề này: ${(S.work && S.work.types && S.work.types[id])||0} ca. Đang là nhân viên công ty → lương +10%.</p>`;
    m.body.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{ m.close(); startShift(id, b.dataset.lv); }); }
  // nhân viên quầy (bot)
  const advisers=[];
  if(W.people) booths.forEach((b,i)=>{ const sd=W.people.pickSeed(L=>i%2?L.female:!L.female, 800+i), kk=W.people.kit(sd,{outfit:{shirt:0x16324f, pants:0x1d1f24, long:true}}); const a=makeActor(kk.gl,{name:`${W.people.nameOf(sd)} · tư vấn nghề`, height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#46d39a'}); const f=[Math.sin(b.face),Math.cos(b.face)]; const cx=b.x-f[0]*.95, cz=b.z-f[1]*.95;
    // S-QA (15/11): ghế xoay + ngồi ngay ngắn, hai tay đặt trên đùi, thỉnh thoảng khẽ nghiêng đầu
    k.add(new THREE.BoxGeometry(.5,.08,.48), M.navy, cx,Y+.8,cz, 0,b.face,0); k.add(new THREE.BoxGeometry(.48,.5,.07), M.navy, cx-f[0]*.24,Y+1.1,cz-f[1]*.24, 0,b.face,0);
    k.add(new THREE.CylinderGeometry(.03,.03,.76,8), M.steel, cx,Y+.4,cz); k.add(new THREE.TorusGeometry(.2,.015,6,16), M.steel, cx,Y+.32,cz, Math.PI/2,0,0); k.add(new THREE.CylinderGeometry(.26,.26,.03,14), M.steel, cx,Y+.02,cz);
    a.g.rotation.y=b.face; a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a), hh=po.hipsHeight(); a.g.position.set(cx, Y+.86-hh, cz); advisers.push({a, po, ph:i*1.7}); });
  HOOK.onFrame.push((dt,T)=>{ if(W.inside || Math.hypot(P.x-(X0+X1)/2, P.z-(Z0+Z1)/2)>45) return; for(const v of advisers){ v.a.mixer.update(dt); v.po.apply('lap', T+v.ph); } });
  k.build(scene);
  // camera trong sảnh
  let camSet=false; HOOK.onFrame.push(()=>{ const inside=!W.inside && P.x>X0 && P.x<X1 && P.z>Z0 && P.z<Z1 && P.y<HH; if(inside){ HOOK.camBox={x0:X0+.5, x1:X1-.5, z0:Z0+.5, z1:Z1-.5, y1:HH-.6}; camSet=true; } else if(camSet){ camSet=false; HOOK.camBox=null; } });
  makeLabel('🧑‍💼 Trung tâm Việc làm QC', '10 quầy nghề · bảng việc · xin việc công ty', {h:.9, x:CX, y:Y+HH+TH+4, z:CZ, fade:200});
  const pl=PLACES.find(p=>p.name==='Trung tâm Việc làm'); if(pl){ pl.sub='Tháp 11 tầng · 10 quầy nghề · việc chân tay · trí tuệ'; pl.go=()=>teleport(CX, DZ+5, CX, CZ); }
  return {DEFS, startShift, get shift(){ return shift; }, X0, X1, Z0, Z1};
}
