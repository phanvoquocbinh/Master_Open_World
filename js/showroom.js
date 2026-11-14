// QC World – S2.4: QC AUTO SHOWROOM – sảnh trưng bày lớn bước vào được (cảnh riêng, nhẹ máy).
// • 11 ô tô (5 mẫu: Mini, Sedan, SUV 7 chỗ, Pickup, Sport GT · nhiều màu) trên bục có đèn, xe chính quay trên bàn xoay + 3 xe tay ga.
// • Tư vấn viên ra đón ở cửa: nghe giới thiệu (đi cùng tới từng mẫu xe) hoặc BỎ QUA để tự xem.
// • Mỗi xe có bảng thông số: bấm E → chọn màu → mua (hỏi xác nhận trước khi trả tiền). Xe mua xong đỗ ở ngoài, bấm V để lái.
import { batchStatic } from './perf.js';
import { makePoser } from './pose.js';

export function makeShowroom(W, L){
  const {THREE, renderPass, scene, camera, me, P, HOOK, circles, boxes, plats, INTER, mesh, box, colorMat, MAT, makeActor, makeLabel, removeLabel, toast, cam, groundAt} = W;
  const {S, save, ui, askPay, fmt, spend, V, exitAt} = L;
  const SS=new THREE.Scene(); SS.background=new THREE.Color(0x0f1520);
  SS.add(new THREE.HemisphereLight(0xffffff, 0x8a8070, .75));
  const dl=new THREE.DirectionalLight(0xfff6ea, 1.0); dl.castShadow=true; dl.shadow.mapSize.set(1024,1024); Object.assign(dl.shadow.camera,{left:-26,right:26,top:26,bottom:-26,near:1,far:70}); dl.shadow.bias=-.0005; dl.shadow.normalBias=.02; SS.add(dl, dl.target);
  const root=new THREE.Group(); SS.add(root);
  const RW=22, RD=14, CH=6, FY=.1, R=Math.random;
  const st={on:false, saved:null, actors:[], talks:[], guide:null, turn:null, greeted:false};
  const fade=document.createElement('div'); fade.style.cssText='position:fixed;inset:0;background:#05080d;opacity:0;pointer-events:none;transition:opacity .28s;z-index:45'; document.body.appendChild(fade);
  const ct=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };
  const M=(geo,mat,x,y,z,parent=root)=>mesh(geo,mat,x,y,z,parent);
  const solid=(x0,x1,z0,z1)=>boxes.push({x0,x1,z0,z1});
  const GL={}, glow=(c,k=1)=>GL[c+'|'+k]||(GL[c+'|'+k]=new THREE.MeshStandardMaterial({color:c, emissive:c, emissiveIntensity:k, roughness:.4}));
  const white=colorMat(0xf6f6f4,{roughness:.4}), dark=colorMat(0x1e2229,{roughness:.5}), steel=new THREE.MeshStandardMaterial({color:0xc8ced6, metalness:.9, roughness:.2});
  const glassM=new THREE.MeshPhysicalMaterial({color:0xcfe8ff, transparent:true, opacity:.2, roughness:.05, side:THREE.DoubleSide, depthWrite:false});
  const MODELS=[['mini',4500,'60 km/h','4 chỗ · nhỏ gọn, dễ đỗ'],['sedan',6000,'70 km/h','5 chỗ · êm ái, tiết kiệm'],['suv',9000,'70 km/h','7 chỗ · gầm cao, đi gia đình'],['pickup',8000,'66 km/h','5 chỗ · thùng chở hàng'],['sport',15000,'90 km/h','2 chỗ · tăng tốc cực nhanh'],
    ['limo',45000,'72 km/h','Limousine VIP · khoang sau da thật, tài xế riêng'],['lux',30000,'80 km/h','Sedan siêu sang 2 tông màu · êm như lướt'],['roadster',40000,'98 km/h','Siêu xe mui trần 2 chỗ · gió lộng tóc bay']];
  const INFO=Object.fromEntries(MODELS.map(([id,price,speed,desc])=>[id,{id,price,speed,desc,name:V.CARS[id].name}]));
  const COLORS=[[0xb3122e,'Đỏ'],[0x111111,'Đen'],[0xf2f2f2,'Trắng'],[0x2a6fdb,'Xanh dương'],[0x9aa3ad,'Bạc'],[0xf2b705,'Vàng'],[0x1f7a4d,'Xanh lá']];
  const hex=c=>'#'+c.toString(16).padStart(6,'0');

  /* ============================== DỰNG SẢNH ============================== */
  function build(){
    const fl=M(box(RW*2,.2,RD*2), new THREE.MeshStandardMaterial({color:0xe9e9ec, roughness:.12, metalness:.05}), 0,FY-.1,0); fl.castShadow=false;
    for(let x=-RW+2;x<RW;x+=4) M(box(.04,.005,RD*2), colorMat(0xd2d2d8), x,FY+.003,0).castShadow=false;
    const ce=M(box(RW*2,.2,RD*2), white, 0,FY+CH+.1,0); ce.castShadow=false;
    for(let x=-RW+3;x<RW;x+=5) for(let z=-RD+3;z<RD;z+=5){ const p=M(box(2.4,.05,.5), glow(0xffffff,1.2), x,FY+CH-.03,z); p.castShadow=false; }
    const wallM=colorMat(0x2a2f38,{roughness:.6});
    const wall=(x,z,w,d)=>{ const m=M(box(w,CH,d), wallM, x,FY+CH/2,z); m.castShadow=false; };
    wall(0,-RD-.1,RW*2,.2); wall(-RW-.1,0,.2,RD*2); wall(RW+.1,0,.2,RD*2);
    // mặt tiền kính + cửa
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(RW*2,CH), glassM); gl.position.set(0,FY+CH/2,RD+.1); root.add(gl);
    const out=ct(2048,512,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#8ec8f2'); gr.addColorStop(1,'#dfeefa'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#4a5160'; g.fillRect(0,h*.78,w,h*.22); g.fillStyle='#f2c230'; for(let x=0;x<w;x+=120) g.fillRect(x,h*.88,60,6);
      for(let i=0;i<18;i++){ const bw=60+R()*120, bh=80+R()*240, x=R()*w; g.fillStyle=`rgb(${120+R()*60|0},${130+R()*60|0},${150+R()*60|0})`; g.fillRect(x,h*.78-bh,bw,bh); } });
    const op=new THREE.Mesh(new THREE.PlaneGeometry(RW*2.6,CH*1.4), new THREE.MeshBasicMaterial({map:out})); op.position.set(0,FY+CH*.55,RD+4); op.rotation.y=Math.PI; root.add(op);
    for(let x=-RW;x<=RW;x+=4) M(box(.12,CH,.14), dark, x,FY+CH/2,RD+.1);
    M(box(3.2,3,.08), steel, 0,FY+1.5,RD+.06);
    INTER.push({x:0, z:RD-1.4, r:1.7, label:'🚪 Ra ngoài phố', action:()=>exit()});
    solid(-RW-2,RW+2,-RD-2,-RD+.15); solid(-RW-2,RW+2,RD-.15,RD+2); solid(-RW-2,-RW+.15,-RD-2,RD+2); solid(RW-.15,RW+2,-RD-2,RD+2);
    plats.push({t:'r', x:0, z:0, c:1, s:0, hw:RW, hd:RD, h:FY});
    // tường thương hiệu
    const logo=ct(2048,512,(g,w,h)=>{ g.fillStyle='#0d1117'; g.fillRect(0,0,w,h); const gr=g.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#ff5a6e'); gr.addColorStop(1,'#ffb547'); g.fillStyle=gr; g.fillRect(0,h-26,w,26);
      g.fillStyle='#fff'; g.font='900 200px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('QC AUTO',w/2,h/2-30); g.font='500 64px "Segoe UI",sans-serif'; g.fillStyle='#aab4c8'; g.fillText('Showroom ô tô · xe máy chính hãng',w/2,h/2+130); });
    M(box(14,3.5,.1), new THREE.MeshStandardMaterial({map:logo, emissive:0xffffff, emissiveMap:logo, emissiveIntensity:.55}), 0,FY+3.6,-RD+.14);
    const ad=(t1,t2,c)=>ct(512,768,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,hex(c)); gr.addColorStop(1,'#10141c'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#fff'; g.font='900 64px "Segoe UI",sans-serif'; g.fillText(t1,30,120); g.font='500 34px "Segoe UI",sans-serif'; g.fillText(t2,30,180);
      g.fillStyle='rgba(255,255,255,.15)'; g.beginPath(); g.ellipse(w/2,h*.62,200,70,0,0,7); g.fill(); g.fillStyle='#fff'; g.font='700 40px "Segoe UI",sans-serif'; g.fillText('Trả góp 0% 🚗',30,h-60); });
    [['SPORT GT','0-100 km/h 4.2s',0xff5a6e],['SUV 7 CHỖ','Cho cả gia đình',0x2a6fdb],['PICKUP','Mạnh mẽ · bền bỉ',0xf2b705],['MINI','Nhỏ xinh · tiết kiệm',0x46d39a]].forEach(([a,b,c],i)=>{ const p=new THREE.Mesh(new THREE.PlaneGeometry(2.4,3.6), new THREE.MeshStandardMaterial({map:ad(a,b,c), emissive:0xffffff, emissiveMap:null, roughness:.5}));
      const side=i<2?-1:1; p.position.set(side*(RW-.08),FY+3.2,-6+(i%2)*9); p.rotation.y=-side*Math.PI/2; root.add(p); });
    // quầy tư vấn + khu chờ
    M(box(4.4,1.1,1), white, -14,FY+.55,9); M(box(4.6,.06,1.2), dark, -14,FY+1.13,9); M(box(4.4,.25,.04), glow(0xff5a6e,.8), -14,FY+.75,9.52); solid(-16.3,-11.7,8.4,9.6);
    const sofa=(x,z,rot)=>{ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; root.add(g); const m=colorMat(0x3d4552,{roughness:.9}); M(box(2.6,.45,.9),m,0,FY+.23,0,g); M(box(2.6,.6,.25),m,0,FY+.6,-.36,g);
      boxes.push({x0:x-1.4,x1:x+1.4,z0:z-.55,z1:z+.55}); for(const k of [-.8,0,.8]) W.addSeat && W.addSeat({x:x+Math.cos(rot)*k, z:z-Math.sin(rot)*k, rot, y:FY+.46, floor:FY, scope:'interior', label:'🛋️ Ngồi chờ (E · C)'}); };
    sofa(-16,4.6,0); sofa(-16,1.4,Math.PI); M(box(1.4,.4,.8), MAT.wood||white, -16,FY+.2,3); solid(-16.7,-15.3,2.6,3.4);
    for(const [x,z] of [[-RW+1,RD-1.2],[RW-1,RD-1.2],[-RW+1,-RD+1.2],[RW-1,-RD+1.2]]){ M(new THREE.CylinderGeometry(.3,.24,.55,12), white, x,FY+.28,z); for(let i=0;i<6;i++){ const l=M(new THREE.SphereGeometry(.3,8,6), colorMat(0x3f8f3a), x+(R()-.5)*.4, FY+.75+R()*.5, z+(R()-.5)*.4); l.scale.y=1.4; } circles.push({x,z,r:.4}); }
    // bục trưng bày + xe
    const DISP=[{m:'sport',c:0xb3122e,x:0,z:-1,hero:true},
      {m:'suv',c:0x111111,x:-14,z:-9},{m:'limo',c:0x111111,x:-14,z:-2.6},{m:'pickup',c:0x9aa3ad,x:-7,z:-9.6},
      {m:'sedan',c:0x2a6fdb,x:14,z:-9},{m:'lux',c:0xf2f2f2,x:14,z:-2.6},{m:'pickup',c:0xf2b705,x:7,z:-9.6},
      {m:'mini',c:0xf2b705,x:-6.5,z:6},{m:'mini',c:0x46d39a,x:6.5,z:6},{m:'roadster',c:0xb3122e,x:14,z:4},{m:'suv',c:0x1f7a4d,x:-3.4,z:-9.6}];
    for(const d of DISP){ const r=d.hero?3.6:2.8;
      M(new THREE.CylinderGeometry(r,r+.1,.16,40), white, d.x,FY+.08,d.z).castShadow=false;
      const ring=M(new THREE.TorusGeometry(r+.02,.035,6,48), glow(d.hero?0xff5a6e:0x4fc3ff,1.6), d.x,FY+.17,d.z); ring.rotation.x=Math.PI/2; ring.castShadow=false;
      const car=V.buildCar(d.c, d.m); car.position.set(d.x,FY+.16,d.z); car.rotation.y=d.hero?0:(d.x<0?.6:-.6)+(d.z>0?Math.PI:0);
      if(d.hero){ const tt=new THREE.Group(); tt.position.set(d.x,0,d.z); root.add(tt); car.position.set(0,FY+.16,0); tt.add(car); tt.userData.dynamic=true; st.turn=tt; }
      else root.add(car);
      circles.push({x:d.x, z:d.z, r:r-.2});
      const I=INFO[d.m], bx=d.x+(d.x<=0?1:-1)*(r+.6), bz=d.z+(d.z<0?r*.7:-r*.7);
      const bt=ct(512,384,(g,w,h)=>{ g.fillStyle='#0f141c'; g.fillRect(0,0,w,h); g.fillStyle=hex(d.c===0x111111?0x444444:d.c); g.fillRect(0,0,w,14); g.fillStyle='#fff'; g.font='800 44px "Segoe UI",sans-serif'; g.fillText(I.name,24,74);
        g.font='500 28px "Segoe UI",sans-serif'; g.fillStyle='#aab4c8'; g.fillText(I.desc,24,124); g.fillText('Tốc độ tối đa: '+I.speed,24,170); g.fillStyle='#ffd23f'; g.font='800 52px "Segoe UI",sans-serif'; g.fillText(fmt(I.price)+' 💰',24,262);
        g.fillStyle='#46d39a'; g.font='600 26px "Segoe UI",sans-serif'; g.fillText('Bấm E để xem & chọn màu',24,334); });
      const sg=new THREE.Group(); sg.position.set(bx,0,bz); sg.rotation.y=Math.atan2(d.x-bx,d.z-bz)+Math.PI;   // bảng quay ra lối đi (ngược phía xe) root.add(sg);
      M(box(.06,1.1,.06), steel, 0,FY+.55,0, sg); const sp=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.82), new THREE.MeshStandardMaterial({map:bt, emissive:0xffffff, emissiveMap:bt, emissiveIntensity:.6})); sp.position.set(0,FY+1.35,.03); sp.rotation.x=-.25; sg.add(sp);
      M(box(1.16,.88,.04), dark, 0,FY+1.35,0, sg).rotation.x=-.25; circles.push({x:bx,z:bz,r:.3});
      INTER.push({x:bx, z:bz, r:1.8, prio:.5, label:`🚗 ${I.name} · ${fmt(I.price)} 💰 – xem & mua (E)`, action:()=>buyCar(d.m, d.c)}); }
    // xe tay ga
    for(const [i,c] of [[0,0xb3122e],[1,0x2a6fdb],[2,0xf2f2f2]]){ const x=16.5, z=9.2-i*1.6; M(box(2.2,.12,1.2), white, x,FY+.06,z).castShadow=false; const b=V.buildBike(c); b.position.set(x,FY+.12,z); b.rotation.y=-Math.PI/2; root.add(b); circles.push({x,z,r:.7}); }
    INTER.push({x:13.6, z:7.6, r:1.9, prio:.5, label:'🛵 Xe tay ga · 2.000 💰 – xem & mua (E)', action:()=>buyBike()});
    const lab=makeLabel('🛵 Xe tay ga', 'Đỏ · Xanh · Trắng', {h:.45, x:16.5, y:2.2, z:7.6, fade:30, group:'interior'}); st.labels=[lab];
    // người: tư vấn viên + khách xem xe
    if(W.people){ const P2=W.people;
      const mk=(seed,outfit,role,x,z,h,mode)=>{ const k=P2.kit(seed,{outfit}); const a=makeActor(k.gl,{name:`${P2.nameOf(seed)} · ${role}`, height:k.h, face:0, clips:k.clips, compact:false, dot:role==='Tư vấn viên'?'#ffd23f':'#9fb3c8', group:'interior', parent:root});
        a.g.position.set(x,FY,z); a.g.rotation.y=h; a.play('idle',0); const p=makePoser(THREE,a); const anchor=new THREE.Object3D(); anchor.position.y=k.h+.7; a.g.add(anchor);
        const o={a,p,x,z,h,mode,t:R()*5,anchor}; st.actors.push(o); if(mode!=='walk'&&mode!=='guide') circles.push({x,z,r:.35}); return o; };
      st.guide=mk(P2.pickSeed(L=>!L.female && L.style!=='cap',71), {shirt:0xffffff, pants:0x1f2a44, long:true}, 'Tư vấn viên', 0, 9.6, Math.PI, 'guide');
      mk(P2.pickSeed(L=>L.female,72), {shirt:0xff5a6e, long:true}, 'Lễ tân', -14, 8.2, 0, 'stand');
      const c1=mk(P2.seedFor('m',73), null, 'Khách', -11.4, -5.6, 2.6, 'stand'), c2=mk(P2.seedFor('f',74), null, 'Khách', -10.6, -6.6, -.6, 'stand'); st.pair=[c1,c2];
      mk(P2.seedFor('m',75), null, 'Khách', 9, 2, 0, 'walk').path=[[9,2],[9,-6],[3,-6],[3,2]];
      mk(P2.seedFor('f',76), null, 'Khách', 10.8, 7.8, -2.2, 'cross'); }
  }
  const sayNow=(o,text,sec=4)=>{ if(!o) return; if(o.bub) removeLabel(o.bub); o.bub=makeLabel(text, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.94)', color:'#1b2233', fade:26, group:'interior'}); o.bubT=sec; };

  /* ============================== MUA XE ============================== */
  function buyCar(model, color){ const I=INFO[model]; let col=color; const own=S.inv.car && (S.carModel||'sedan')===model;
    const m=ui.modal(`🚗 ${I.name}`);
    const render=()=>{ m.body.innerHTML=`<p>${I.desc} · tốc độ tối đa <b>${I.speed}</b></p><p class="muted">Chọn màu:</p><div class="row" style="gap:8px;flex-wrap:wrap">${COLORS.map(([c,n])=>`<button class="swatch ${c===col?'on':''}" data-c="${c}" title="${n}" style="background:${hex(c)}"></button>`).join('')}</div>
      <div class="row" style="margin-top:14px;align-items:center"><span class="price" style="font-size:20px">${fmt(I.price)} 💰</span><div class="sp"></div>${own?'<span class="jok">✓ Bạn đang dùng mẫu này</span> ':''}<button class="btn pri" data-buy>${S.inv.car?'Đổi sang xe này':'Mua xe'}</button></div>
      ${S.inv.car&&!own?'<p class="muted" style="font-size:12px">Bạn đang có '+(V.CARS[S.carModel||'sedan'].name)+' – mua xe mới sẽ thay xe cũ.</p>':''}`;
      m.body.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ col=+b.dataset.c; render(); });
      m.body.querySelector('[data-buy]').onclick=()=>{ m.close(); askPay(I.price, `🚗 Mua <b>${I.name}</b> màu ${COLORS.find(x=>x[0]===col)?.[1]||''}`, ()=>{ if(!spend(I.price)) return;
        S.inv.car=1; S.vehicle='car'; S.carModel=model; S.carColor=col; save(); try{ V.rebuild && V.rebuild('car'); V.recolor && V.recolor('car', col); }catch(e){}
        toast(`🎉 Chúc mừng! ${I.name} đã giao ở bãi đỗ trước showroom. Ra ngoài bấm V để lái.`, 5000); if(st.guide) sayNow(st.guide, 'Chúc mừng anh/chị! Lái xe an toàn nhé 🚗', 4); }); }; };
    render(); }
  function buyBike(){ let col=S.bikeColor||0xb3122e; const m=ui.modal('🛵 Xe tay ga');
    const render=()=>{ m.body.innerHTML=`<p>~50 km/h, đi đường nhựa nhanh, dễ dắt. Bấm V để lên/xuống xe.</p><div class="row" style="gap:8px;flex-wrap:wrap">${COLORS.map(([c,n])=>`<button class="swatch ${c===col?'on':''}" data-c="${c}" title="${n}" style="background:${hex(c)}"></button>`).join('')}</div>
      <div class="row" style="margin-top:14px"><span class="price" style="font-size:20px">2.000 💰</span><div class="sp"></div>${S.inv.bike?'<span class="jok">✓ Đã có xe tay ga</span> <button class="btn" data-paint>Đổi màu (miễn phí)</button>':'<button class="btn pri" data-buy>Mua xe</button>'}</div>`;
      m.body.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ col=+b.dataset.c; render(); });
      const pb=m.body.querySelector('[data-paint]'); if(pb) pb.onclick=()=>{ S.bikeColor=col; save(); V.recolor && V.recolor('bike', col); toast('🎨 Đã đổi màu xe tay ga.'); m.close(); };
      const bb=m.body.querySelector('[data-buy]'); if(bb) bb.onclick=()=>{ m.close(); askPay(2000, '🛵 Mua <b>xe tay ga</b>', ()=>{ if(!spend(2000)) return; S.inv.bike=1; S.vehicle='bike'; S.bikeColor=col; save(); V.recolor && V.recolor('bike', col); toast('🎉 Xe tay ga đã giao trước showroom. Bấm V để lên xe.', 4500); }); }; };
    render(); }

  /* ============================== TƯ VẤN VIÊN ============================== */
  const POIS=[{p:[[0,6.5],[0,3.6]], line:'Đây là QC Sport GT – mẫu xe chủ lực: 0-100 km/h trong 4,2 giây, tốc độ tối đa 90 km/h!'},
    {p:[[-9,3.6],[-9,-5.8]], line:'Bên trái là SUV 7 chỗ: gầm cao, rộng rãi cho cả gia đình, đi phố hay đi biển đều ổn.'},
    {p:[[-9,-6.2],[-4.6,-6.2]], line:'Pickup Ranger: thùng chở hàng to, bền bỉ – hợp làm việc giao hàng ở Phường Khởi Nghiệp.'},
    {p:[[9,-6.2],[9,-5.8]], line:'Bên phải là Sedan S: êm ái, tiết kiệm – mẫu bán chạy nhất tháng này.'},
    {p:[[9,3.6],[3,3.6]], line:'Còn đây là Mini Hatch: nhỏ xinh, dễ đỗ, giá mềm nhất – 4.500 💰. Anh/chị bấm E ở bảng thông số để chọn màu & mua nhé!'}];
  function startIntro(){ const g=st.guide; if(!g) return; g.mode='guide'; g.pois=POIS; g.gi=0; g.route=POIS[0].p.slice(); g.wait=0; g.callT=4; sayNow(g, 'Mời anh/chị đi theo em xem các mẫu xe ạ!', 3); }
  function skip(){ const g=st.guide; if(!g) return; g.pois=null; g.mode='stand'; g.x=-11.6; g.z=8.4; g.h=0; sayNow(g, 'Dạ, anh/chị cứ tự nhiên xem xe, cần gì cứ gọi em ạ 😊', 3.5); }
  const guideInter={get x(){ return st.guide?st.guide.x:1e9; }, get z(){ return st.guide?st.guide.z:1e9; }, r:1.7, prio:.4, when:()=>!!(st.guide && st.guide.pois), label:'⏭️ Bỏ qua giới thiệu (E)', action:()=>skip()};
  function greet(){ const m=ui.modal('🚗 QC Auto Showroom'); const g=st.guide;
    m.body.innerHTML=`<p>👋 <b>Tư vấn viên</b>: “Chào anh/chị, chào mừng tới <b>QC Auto</b>! Em giới thiệu nhanh các mẫu xe nhé?”</p><div class="row" style="gap:8px;justify-content:flex-end"><button class="btn" data-s>⏭️ Bỏ qua, tôi tự xem</button><button class="btn pri" data-i>🎤 Nghe giới thiệu</button></div>`;
    m.body.querySelector('[data-s]').onclick=()=>{ m.close(); skip(); }; m.body.querySelector('[data-i]').onclick=()=>{ m.close(); startIntro(); }; }
  function place(o){ o.a.g.position.set(o.x, FY, o.z); o.a.g.rotation.y=o.h; }
  function updGuide(o, dt){ const dP=Math.hypot(P.x-o.x,P.z-o.z);
    const walkTo=(tx,tz)=>{ const dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<.15) return true; o.x+=dx/d*Math.min(d,1.3*dt); o.z+=dz/d*Math.min(d,1.3*dt); o.h=W.lerpAngle(o.h, Math.atan2(dx,dz), 1-Math.exp(-dt*7)); o.a.play('walk'); place(o); return false; };
    const idle=()=>{ o.h=W.lerpAngle(o.h, Math.atan2(P.x-o.x,P.z-o.z), 1-Math.exp(-dt*4)); o.a.play('idle'); place(o); };
    if(!o.pois){ idle(); return; }
    if(o.gi>=o.pois.length){ o.pois=null; sayNow(o,'Anh/chị cần tư vấn thêm cứ gọi em ở quầy nhé!',3.5); o.mode='stand'; return; }
    if(o.wait>0){ o.wait-=dt; idle(); if(o.wait<=0){ if(dP<6.5){ o.gi++; if(o.gi<o.pois.length) o.route=o.pois[o.gi].p.slice(); } else o.wait=.6; } return; }
    if(dP>9){ idle(); o.callT-=dt; if(o.callT<=0){ o.callT=6; sayNow(o,'Anh/chị ơi, bên này ạ!',3); } return; }
    const wp=o.route[0]; if(!wp){ sayNow(o, o.pois[o.gi].line, 7); o.wait=6.5; return; } if(walkTo(wp[0],wp[1])) o.route.shift(); }

  /* ============================== VÀO / RA ============================== */
  function enter(){ if(st.on || W.inside) return; fade.style.opacity=1;
    setTimeout(()=>{ st.on=true; st.saved={segs:(W.SEGS||[]).splice(0), circles:circles.splice(0), boxes:boxes.splice(0), plats:plats.splice(0), INTER:INTER.splice(0)}; st.camDist=cam.dist; cam.dist=Math.min(cam.dist,6);
      W.inside={name:'QC Auto Showroom', showroom:true, locked:false}; HOOK.labelGroup='interior'; HOOK.camBox={x0:-RW+.5, x1:RW-.5, z0:-RD+.5, z1:RD-.5, y1:FY+CH-.4};
      SS.environment=scene.environment; renderPass.scene=SS; scene.remove(me.g); SS.add(me.g);
      build(); root.updateMatrixWorld(true); try{ batchStatic(W, root); }catch(e){ console.warn('showroom batch', e); }
      INTER.push(guideInter);
      P.x=0; P.z=RD-2.4; P.y=FY; P.vx=P.vz=P.vy=0; P.face=Math.PI; me.g.position.set(P.x,P.y,P.z); me.g.rotation.y=Math.PI; cam.yaw=0; cam.pitch=.22; cam.tx=P.x; cam.tz=P.z; camera.position.set(0,FY+3,RD+2);
      toast('🚗 QC Auto Showroom', 2000); setTimeout(()=>{ fade.style.opacity=0; setTimeout(greet, 500); }, 60); }, 300); }
  function exit(){ if(!st.on) return; fade.style.opacity=1;
    setTimeout(()=>{ W.dropSeats && W.dropSeats(x=>x.scope==='interior');
      for(const o of st.actors){ removeLabel(o.a.label); if(o.bub) removeLabel(o.bub); } for(const l of (st.labels||[])) removeLabel(l);
      const shared=new Set(); for(const o of st.actors) o.a.g.traverse(c=>{ if(c.geometry) shared.add(c.geometry); });
      root.traverse(o=>{ if(o.isMesh && o.geometry && !o.isSkinnedMesh && !shared.has(o.geometry)) o.geometry.dispose(); }); root.clear(); st.actors=[]; st.guide=null; st.turn=null;
      circles.length=0; boxes.length=0; plats.length=0; INTER.length=0; for(const k of ['circles','boxes','plats','INTER']){ const arr={circles,boxes,plats,INTER}[k]; arr.push(...st.saved[k]); } (W.SEGS||[]).push(...(st.saved.segs||[]));
      renderPass.scene=scene; SS.remove(me.g); scene.add(me.g); HOOK.labelGroup='world'; HOOK.camBox=null; W.inside=null; cam.dist=st.camDist||6.5; st.on=false;
      const e=exitAt(); P.x=e.x; P.z=e.z; P.y=groundAt(P.x,P.z); P.face=e.face; me.g.position.set(P.x,P.y,P.z); me.g.rotation.y=e.face; cam.yaw=e.face+Math.PI; cam.tx=P.x; cam.tz=P.z;
      camera.position.set(P.x+Math.sin(cam.yaw)*6, P.y+3, P.z+Math.cos(cam.yaw)*6); setTimeout(()=>fade.style.opacity=0, 60); }, 300); }

  HOOK.onFrame.push((dt, T)=>{ if(!st.on) return;
    if(SS.environment!==scene.environment) SS.environment=scene.environment;
    dl.position.set(P.x+8,16,P.z+9); dl.target.position.set(P.x,0,P.z);
    if(st.turn) st.turn.rotation.y+=dt*.35;
    for(const o of st.actors){ o.t+=dt;
      if(o.mode==='guide') updGuide(o, dt);
      else if(o.mode==='walk' && o.path){ o.wi=o.wi||0; const [tx,tz]=o.path[o.wi], dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<.3) o.wi=(o.wi+1)%o.path.length; else { o.x+=dx/d*1.1*dt; o.z+=dz/d*1.1*dt; o.h=W.lerpAngle(o.h, Math.atan2(dx,dz), 1-Math.exp(-dt*6)); } o.a.play('walk'); place(o); }
      o.a.mixer.update(dt); if(['cross','phone'].includes(o.mode)) o.p.apply(o.mode, o.t);
      if(o.bub){ o.bubT-=dt; if(o.bubT<=0){ removeLabel(o.bub); o.bub=null; } } }
    // 2 khách bàn luận
    st.talkT=(st.talkT||3)-dt; if(st.talkT<=0 && st.pair){ st.talkT=4+R()*4; const L2=[['Con SUV này rộng ghê!','Ừ, đi biển cuối tuần là hết ý.'],['Màu trắng sang hơn nhỉ?','Đen nhìn mạnh mẽ hơn đó.'],['Có trả góp 0% luôn kìa.','Vậy tháng sau mua thôi 😄']][Math.floor(R()*3)]; sayNow(st.pair[0],L2[0],3); setTimeout(()=>st.on&&st.pair&&sayNow(st.pair[1],L2[1],3),1600); }
  });
  return {enter, exit, get on(){ return st.on; }};
}
