// QC World – THANG MÁY CHO CẢNH NỘI THẤT 1 TẦNG (interior.js · campus.js) – qc-park, 16/11/2026
// Bình: "phải có cái ô thang máy để bước vô, trong đó sẽ hiện các nút trên bảng thang máy, user muốn chọn tầng mấy thì chọn".
// Cảnh nội thất chỉ dựng 1 tầng mỗi lúc (đổi tầng = xoá + dựng lại ở cùng cao độ FY) nên không dùng liftkit.js được;
// bộ này làm dãy 2–3 cabin thật sau tường Bắc:
//  • Mỗi tầng: ô cửa trượt 2 cánh + số tầng phía trên + nút gọi (E) bên phải cửa. Đứng trước cửa / bấm E → cửa mở.
//  • Bước vào cabin → hiện BẢNG NÚT (#ilPanel, cùng kiểu #liftPanel) → chọn tầng → cửa đóng, nhân vật đứng yên giữa cabin
//    (HOOK.vehicle), số tầng chạy; khi cửa ĐÃ ĐÓNG HẲN mới dựng tầng mới (cabin dựng lại đúng chỗ) → "ting" → cửa mở ở tầng mới.
//  • Ra khỏi cảnh giữa chừng (ra phố, bản đồ M…) → tự trả HOOK.vehicle và ẩn bảng nút.
// API: const FL = makeFloorLift(W, {RW, RD, FY, CH, xs:[-2.9,0,2.9], name, color, floors:()=>[{short,name}], idx:()=>i, canGo:i=>true|'lý do',
//        switchTo:i=>{ xoá tầng + dựng tầng i (gọi lại FL.build) }, active:()=>đang ở trong cảnh, arrived:i=>{} });
//      Trong hàm dựng vỏ mỗi tầng: FL.build(root)  (dựng tường Bắc có ô cửa + cabin + va chạm + điểm E).   FL.reset() khi thoát cảnh.
let PANEL=null, OWNER=null;   // 1 bảng nút dùng chung cho mọi cảnh (interior + campus) – chỉ cảnh đang giữ mới được ẩn/hiện
export function makeFloorLift(W, o){
  const ME={};
  const {THREE, P, me, HOOK, INTER, boxes, plats, toast} = W;
  const RD=o.RD, RW=o.RW, FY=o.FY, CH=o.CH, xs=o.xs||[-2.9,0,2.9], DW=1.3, CW=2.2, CD=2.4, ZW=-RD-.1, ZB=-RD-.2-CD;
  const cars=xs.map(x=>({x, open:0, idle:9, want:false, box:null, ref:null}));
  let ride=null, inCar=-1, hidden=false;
  const sfx=(n,x)=>{ try{ W.sfx && W.sfx(n, x, FY+1.5, ZW); }catch(e){} };
  const steel=new THREE.MeshStandardMaterial({color:0xc9ced4, metalness:.9, roughness:.22}), frameM=new THREE.MeshStandardMaterial({color:o.color??0xd8b25a, metalness:.85, roughness:.3}),
    cabW=new THREE.MeshStandardMaterial({color:0xd9d4c8, roughness:.5, metalness:.2}), cabF=new THREE.MeshStandardMaterial({color:0x2b2f36, roughness:.6}),
    mirror=new THREE.MeshStandardMaterial({color:0xb8c2cc, metalness:.95, roughness:.08}), lampM=new THREE.MeshStandardMaterial({color:0xfff6e0, emissive:0xfff0cc, emissiveIntensity:1.1}),
    btnOff=new THREE.MeshBasicMaterial({color:0x3a3d44}), btnOn=new THREE.MeshBasicMaterial({color:0xffd166});
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  const fls=()=>o.floors(), cur=()=>o.idx();
  const carOf=()=>{ for(let i=0;i<cars.length;i++){ const c=cars[i]; if(Math.abs(P.x-c.x)<CW/2-.15 && P.z<ZW-.1 && P.z>ZB+.15) return i; } return -1; };

  /* ---------- bảng nút HTML (cùng kiểu #liftPanel của liftkit.js, id riêng) ---------- */
  function css(){ if(document.getElementById('ilPanel-css')) return; const s=document.createElement('style'); s.id='ilPanel-css'; s.textContent=`
#ilPanel{position:fixed;right:22px;top:50%;transform:translateY(-50%);z-index:40;min-width:230px;max-height:78vh;overflow:auto;padding:14px 14px 12px;border-radius:16px;
 background:linear-gradient(180deg,rgba(28,32,40,.94),rgba(16,18,24,.94));border:1px solid rgba(216,178,90,.55);box-shadow:0 10px 40px rgba(0,0,0,.45);color:#f3efe6;font:600 14px 'Segoe UI',system-ui,sans-serif;display:none}
#ilPanel .lp-h{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
#ilPanel .lp-t{font-size:15px;color:#ffd98a}#ilPanel .lp-x{cursor:pointer;border:0;background:rgba(255,255,255,.08);color:#ddd;border-radius:8px;padding:3px 9px;font:600 13px inherit}
#ilPanel .lp-cur{font-size:12px;color:#9fe3ff;margin-bottom:10px}
#ilPanel .lp-g{display:flex;flex-direction:column;gap:6px}
#ilPanel button.lp-b{display:flex;align-items:center;gap:10px;width:100%;cursor:pointer;text-align:left;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#f3efe6;border-radius:12px;padding:7px 10px;font:600 13px 'Segoe UI',system-ui,sans-serif}
#ilPanel button.lp-b:hover{background:rgba(216,178,90,.22);border-color:rgba(216,178,90,.7)}
#ilPanel button.lp-b .n{flex:0 0 34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#20242c;border:2px solid #8a8f99;color:#fff;font:800 14px 'Segoe UI',sans-serif}
#ilPanel button.lp-b.on .n{border-color:#ffd166;color:#ffd166;box-shadow:0 0 10px rgba(255,209,102,.7)}
#ilPanel button.lp-b.here{opacity:.55;cursor:default}#ilPanel button.lp-b.lock{opacity:.45}
#ilPanel .lp-f{margin-top:9px;font-size:11px;color:#a9a39a;font-weight:500}`; document.head.appendChild(s); }
  function showPanel(){ css(); if(!PANEL){ PANEL=document.createElement('div'); PANEL.id='ilPanel'; document.body.appendChild(PANEL); for(const ev of ['mousedown','pointerdown','wheel','click']) PANEL.addEventListener(ev,e=>e.stopPropagation()); } const panel=PANEL; OWNER=ME;
    const F=fls(), here=cur(), tgt=ride?ride.target:-1;
    panel.innerHTML=`<div class="lp-h"><span class="lp-t">⇅ ${o.name||'Thang máy'}</span><button class="lp-x" title="Ẩn bảng">✕</button></div>
      <div class="lp-cur">Đang ở: <b>${F[here]?F[here].name:''}</b>${tgt>=0?` → ${F[tgt].name}`:''}</div>
      <div class="lp-g">${F.map((f,i)=>({f,i})).reverse().map(({f,i})=>{ const ok=o.canGo?o.canGo(i):true; return `<button class="lp-b${i===here&&tgt<0?' here':''}${i===tgt?' on':''}${ok!==true&&i!==here?' lock':''}" data-i="${i}"><span class="n">${f.short}</span><span>${f.name}${ok!==true&&i!==here?' 🔒':''}</span></button>`; }).join('')}</div>
      <div class="lp-f">Bấm số tầng muốn tới · ra khỏi cabin để đóng bảng</div>`;
    panel.querySelector('.lp-x').onclick=()=>{ hidden=true; hidePanel(); };
    panel.querySelectorAll('button.lp-b').forEach(b=>b.onclick=()=>press(+b.dataset.i));
    panel.style.display='block'; }
  function hidePanel(){ if(PANEL && OWNER===ME){ PANEL.style.display='none'; OWNER=null; } }
  function press(i){ if(ride) return; const c=carOf(); if(c<0) return; if(i===cur()){ cars[c].want=true; return; }
    const ok=o.canGo?o.canGo(i):true; if(ok!==true){ toast(ok, 3200); return; }
    ride={car:c, target:i, from:cur(), ph:'close', t:0, T:Math.min(7, 2.2+Math.abs(i-cur())*.9), switched:false};
    const car=cars[c]; ride.veh={drive:()=>{ P.x=car.x; P.z=ZW-CD/2-.1; P.y=FY; P.vx=P.vz=P.vy=0; me.g.position.set(P.x,P.y,P.z); if(me.play) me.play('idle'); }}; HOOK.vehicle=ride.veh; sfx('lift-door', car.x); showPanel(); }
  function endRide(arrived){ if(!ride) return; if(HOOK.vehicle===ride.veh) HOOK.vehicle=null; if(arrived){ P.y=FY; P.ground=true; const f=fls()[ride.target]; cars[ride.car].want=true; sfx('lift-ding', cars[ride.car].x); sfx('lift-door', cars[ride.car].x); toast(`⇅ Đã tới ${f?f.name:''}`, 2000); o.arrived && o.arrived(ride.target); } ride=null; if(inCar>=0) showPanel(); }

  /* ---------- dựng tường Bắc + cabin (gọi trong hàm dựng vỏ MỖI tầng) ---------- */
  function build(root){ const add=(geo,mat,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=false; m.receiveShadow=true; root.add(m); return m; };
    const F=fls(), here=cur(), wallM=o.wallM||cabW;
    // tường Bắc có ô cửa (tấm tường giữa các cửa + lanh tô trên cửa)
    const xsS=[...xs].sort((a,b)=>a-b); let x0=-RW; for(const x of xsS){ const a=x-DW/2; if(a-x0>.01){ add(B(a-x0,CH,.2), wallM, (x0+a)/2, FY+CH/2, ZW); boxes.push({x0:x0, x1:a, z0:-RD-2, z1:-RD+.15}); } add(B(DW,CH-2.3,.2), wallM, x, FY+2.3+(CH-2.3)/2, ZW); x0=x+DW/2; }
    if(RW-x0>.01){ add(B(RW-x0,CH,.2), wallM, (x0+RW)/2, FY+CH/2, ZW); boxes.push({x0:x0, x1:RW+2, z0:-RD-2, z1:-RD+.15}); } boxes.push({x0:-RW-2, x1:-RW, z0:-RD-2, z1:-RD+.15});
    cars.forEach((c,i)=>{ const x=c.x;
      // cabin: sàn, vách gương sau, 2 vách bên, trần + đèn, tay vịn, bảng nút
      add(B(CW,.1,CD), cabF, x, FY-.05, ZW-.1-CD/2); plats.push({t:'r', x, z:(ZB-RD+.05)/2, c:1, s:0, hw:CW/2, hd:(-RD+.05-ZB)/2, h:FY});   // sàn cabin nối liền sàn phòng
      add(B(CW,2.5,.06), mirror, x, FY+1.25, ZB+.03); for(const s of [-1,1]){ add(B(.06,2.5,CD), cabW, x+s*CW/2, FY+1.25, ZW-.1-CD/2); add(B(.05,.05,CD-.4), frameM, x+s*(CW/2-.08), FY+.95, ZW-.1-CD/2); }
      add(B(CW,.08,CD), steel, x, FY+2.54, ZW-.1-CD/2); add(B(CW-.5,.04,CD-.6), lampM, x, FY+2.48, ZW-.1-CD/2);
      boxes.push({x0:x-CW/2-.15, x1:x+CW/2+.15, z0:ZB-.3, z1:ZB+.05}); for(const s of [-1,1]) boxes.push({x0:x+s*CW/2-.08, x1:x+s*CW/2+.08, z0:ZB-.3, z1:ZW-.05});
      const pc=document.createElement('canvas'); pc.width=128; pc.height=256; const pt=new THREE.CanvasTexture(pc); pt.colorSpace=THREE.SRGBColorSpace;
      const pn=add(new THREE.PlaneGeometry(.3,.6), new THREE.MeshBasicMaterial({map:pt}), x+CW/2-.04, FY+1.25, ZW-.55); pn.rotation.y=-Math.PI/2;
      // khung cửa + số tầng + nút gọi (mặt phía phòng)
      add(B(DW+.24,.12,.08), frameM, x, FY+2.36, -RD+.03); for(const s of [-1,1]) add(B(.12,2.42,.08), frameM, x+s*(DW/2+.06), FY+1.2, -RD+.03);
      const ic=document.createElement('canvas'); ic.width=256; ic.height=64; const it=new THREE.CanvasTexture(ic); it.colorSpace=THREE.SRGBColorSpace;
      add(new THREE.PlaneGeometry(.8,.2), new THREE.MeshBasicMaterial({map:it}), x, FY+2.62, -RD+.05);
      const btn=add(new THREE.CylinderGeometry(.06,.06,.03,16).rotateX(Math.PI/2), btnOff, x+DW/2+.32, FY+1.15, -RD+.05);
      // 2 cánh cửa trượt
      const dl=add(B(DW/2,2.3,.05), steel, x-DW/4, FY+1.15, ZW), dr=add(B(DW/2,2.3,.05), steel, x+DW/4, FY+1.15, ZW);
      c.ref={dl, dr, btn, pc, pt, ic, it}; c.box={x0:x-DW/2-.1, x1:x+DW/2+.1, z0:ZW-.12, z1:ZW+.12}; c.boxOn=false; c.drawn='';
      INTER.push({x, z:-RD+1.2, r:1.6, prio:.85, when:()=>!ride && carOf()<0, get label(){ return cars[i].open>.9 ? `⇅ ${o.name||'Thang máy'} – mời vào cabin` : `⇅ Gọi thang (E) · đang ở ${(fls()[cur()]||{}).name||''}`; }, action:()=>{ cars[i].want=true; sfx('lift-door', x); }});
      setDoor(c); });
  }
  function setDoor(c){ const r=c.ref; if(!r) return; const op=c.open; r.dl.position.x=c.x-DW/4-op*(DW/2-.04); r.dr.position.x=c.x+DW/4+op*(DW/2-.04);
    const shut=op<.85; if(shut && !c.boxOn){ boxes.push(c.box); c.boxOn=true; } else if(!shut && c.boxOn){ const k=boxes.indexOf(c.box); if(k>=0) boxes.splice(k,1); c.boxOn=false; } }
  function draw(c, i){ const r=c.ref; if(!r) return; const F=fls(), here=cur(), mv=ride && ride.car===i && ride.ph==='move', k=mv?Math.min(1,ride.t/ride.T):0,
      shown=mv ? F[Math.round(ride.from+(ride.target-ride.from)*k)] : F[here], arrow=mv?(ride.target>ride.from?'▲ ':'▼ '):'', key=`${arrow}${shown?shown.short:''}|${ride?ride.target:-1}`;
    if(key===c.drawn) return; c.drawn=key;
    const x=r.ic.getContext('2d'); x.clearRect(0,0,256,64); x.fillStyle='rgba(10,12,16,.92)'; x.fillRect(0,0,256,64); x.fillStyle=mv?'#ffd166':'#7fe3ff'; x.font='800 40px Segoe UI'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(arrow+(shown?shown.short:''),128,34); r.it.needsUpdate=true;
    const p=r.pc.getContext('2d'), n=F.length, cols=n>6?2:1, rows=Math.ceil(n/cols); p.fillStyle='#1b1f26'; p.fillRect(0,0,128,256); p.strokeStyle='#d8b25a'; p.lineWidth=4; p.strokeRect(2,2,124,252);
    for(let j=0;j<n;j++){ const col=cols===2?(j%2):0, row=cols===2?Math.floor(j/2):j, cx=cols===2?(col?88:40):64, cy=230-row*(200/Math.max(rows,1)); p.beginPath(); p.arc(cx,cy,15,0,7); p.fillStyle=ride&&j===ride.target?'#ffd166':(j===here?'#7fe3ff':'#3a404b'); p.fill(); p.fillStyle='#10131a'; p.font='800 14px Segoe UI'; p.textAlign='center'; p.textBaseline='middle'; p.fillText(F[j].short,cx,cy+1); }
    r.pt.needsUpdate=true; r.btn.material=ride&&ride.car===i?btnOn:btnOff; }

  /* ---------- cập nhật mỗi khung hình ---------- */
  HOOK.onFrame.push((dt)=>{ dt=Math.min(dt||1/60,.1);
    if(!o.active()){ if(ride) endRide(false); inCar=-1; hidePanel(); return; }
    const c0=carOf(); if(c0!==inCar){ inCar=c0; if(c0>=0){ if(!hidden) showPanel(); } else { hidden=false; hidePanel(); } }
    if(ride){ const car=cars[ride.car];
      if(ride.ph==='close'){ car.open=Math.max(0,car.open-dt*1.6); if(car.open<=0){ ride.ph='move'; ride.t=0; if(!ride.switched){ ride.switched=true; o.switchTo(ride.target); } showPanel(); } }   // đổi tầng khi cửa đã đóng hẳn
      else if(ride.ph==='move'){ ride.t+=dt; if(ride.t>=ride.T) endRide(true); } }
    cars.forEach((c,i)=>{ const busy=ride && ride.car===i;
      if(!busy){ const near=Math.abs(P.x-c.x)<1.5 && P.z>-RD && P.z<-RD+2.4 && Math.abs(P.y-FY)<1, ins=carOf()===i;
        if(near || ins || c.want){ c.open=Math.min(1,c.open+dt*1.6); c.idle=0; if(c.open>=1) c.want=false; } else { c.idle+=dt; if(c.idle>2.5) c.open=Math.max(0,c.open-dt*1.4); } }
      setDoor(c); draw(c,i); });
  });
  function reset(){ if(ride) endRide(false); for(const c of cars){ c.open=0; c.want=false; c.ref=null; c.boxOn=false; } inCar=-1; hidePanel(); }
  return {build, reset, press, get riding(){ return !!ride; }, cars, carOf};
}
