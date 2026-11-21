// QC World – S2.4: QC AUTO SHOWROOM – sảnh trưng bày lớn bước vào được (cảnh riêng, nhẹ máy).
// • 11 ô tô (5 mẫu: Mini, Sedan, SUV 7 chỗ, Pickup, Sport GT · nhiều màu) trên bục có đèn, xe chính quay trên bàn xoay + 3 xe tay ga.
// • Tư vấn viên ra đón ở cửa: nghe giới thiệu (đi cùng tới từng mẫu xe) hoặc BỎ QUA để tự xem.
// • Mỗi xe có bảng thông số: bấm E → chọn màu → mua (hỏi xác nhận trước khi trả tiền). Xe mua xong đỗ ở ngoài, bấm V để lái.
import { batchStatic } from './perf.js';
import { makePoser } from './pose.js';
import { createGFX, Kit as GKit, cbox, planeM, cylM } from './gfxkit.js';

export function makeShowroom(W, L){
  const {THREE, renderPass, scene, camera, me, P, HOOK, circles, boxes, plats, INTER, mesh, box, colorMat, MAT, makeActor, makeLabel, removeLabel, toast, cam, groundAt} = W;
  const {S, save, ui, askPay, fmt, spend, V, exitAt} = L;
  /* S19g 20/11 (V2): cửa ra + sau-khi-mua đổi được từ bên ngoài – V2 dời lối vào showroom sang Dev City (devcity_landmarks.js) */
  let exitFn=exitAt; const buyHooks=[];
  const afterBuy=(info, msg)=>{ for(const f of buyHooks){ try{ const m=f(info); if(typeof m==='string') msg=m; }catch(e){ console.warn('[showroom] onBuy', e); } } return msg; };
  const SS=new THREE.Scene(); SS.background=new THREE.Color(0x0f1520);
  SS.add(new THREE.HemisphereLight(0xfff4e6, 0x8a8070, .75));   // ánh trời ấm nhẹ (chuẩn 3D: nội thất ấm 2700–3000K)
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
  // S19g 20/11 – nâng theo chuẩn .claude/skills/qc-world-3d-design. BẢNG KIỂM sảnh (44 × 28 m, trần 6 m):
  //  sàn đá bóng khổ 1,2 m · trần thạch cao + dải đèn hắt ấm dọc 2 tường + đèn thanh ấm · tường hông thạch cao ấm + len chân đồng đen + 4 hộp đèn quảng cáo có khung
  //  · tường hậu ốp gỗ óc chó + nẹp đồng đen + logo QC AUTO hộp đèn · mặt tiền kính khung đồng đen + cửa kính 2 cánh (khung, tay nắm) + biển LỐI RA
  //  · quầy lễ tân (thân ốp nhôm composite, mặt đá granite, LED, màn hình, bàn phím) · góc chờ: 2 sofa có cấu trúc (khung gỗ, 3 đệm ngồi tách múi, 3 đệm lưng ngả,
  //    2 tay vịn, chân inox) + bàn trà gỗ chân inox + thảm · 4 cây chậu gốm (LatheGeometry) · 11 bục xe (nhôm + mặt đá + vòng LED) + bóng AO dưới xe
  //  · bảng thông số chân inox khung đồng · 3 bục xe tay ga đá
  //  DÙNG ĐƯỢC: ngồi sofa (E · C) · E ở bảng thông số → chọn màu & mua · tư vấn viên dẫn xem · lễ tân quay nhìn + gật chào khi lại gần · cửa → ra phố
  //  VA CHẠM: 4 tường, quầy, sofa, bàn trà, cây, bục xe, bảng thông số, bục xe tay ga (nạp ngay khi vào sảnh)
  let MATS=null;
  const mats=()=>MATS||(MATS=(()=>{ const GF=W.GFX||(W.GFX=createGFX({quality:W.QUAL||'low', msaa:!W.CINE})), GM=GF.M;
    const pbrOf=(set,o={})=>new THREE.MeshStandardMaterial({map:set.map, normalMap:set.normalMap, roughnessMap:set.orm, aoMap:set.orm, roughness:1, metalness:0, ...o});
    const warm=new THREE.MeshStandardMaterial({color:0xfff1dc, emissive:0xffd9a8, emissiveIntensity:1.15, roughness:.4}); warm.userData.noMerge=true; warm.userData.noCast=true;
    const rug=pbrOf(GF.T.fabric(0x8a7a66), {polygonOffset:true, polygonOffsetFactor:-2}); rug.userData.noMerge=true; rug.userData.noCast=true;
    const pot=new THREE.LatheGeometry([[0,0],[.19,0],[.21,.03],[.27,.42],[.3,.45],[.28,.47]].map(([r,y])=>new THREE.Vector2(r,y)), 24);
    return {GF, GM, warm, rug, pot, floor:pbrOf(GF.T.tile(0xcac5bc, 1.2, 2.4, .14)), plaster:pbrOf(GF.T.plaster(0xddd7cc)), acp:pbrOf(GF.T.tile(0x3b4048, 1.2, 2.4, .32), {metalness:.35}),
      fab:pbrOf(GF.T.fabric(0x59616c)), alu:new THREE.MeshStandardMaterial({color:0xc6c0b6, roughness:.3, metalness:.75}), ceramic:new THREE.MeshStandardMaterial({color:0x2c3138, roughness:.35, metalness:.1}),
      red:new THREE.MeshStandardMaterial({color:0xff4d61, emissive:0xff4d61, emissiveIntensity:1.4, roughness:.4}),
      logo:(()=>{ const t=ct(512,128,(g,w,h)=>{ g.fillStyle='#0d1117'; g.fillRect(0,0,w,h); const gr=g.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#ff5a6e'); gr.addColorStop(1,'#ffb547'); g.fillStyle=gr; g.fillRect(0,h-8,w,8);
          g.fillStyle='#f3efe6'; g.font='900 62px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('QC AUTO',w/2,h/2-14,w*.9); g.font='500 18px "Segoe UI",sans-serif'; g.fillStyle='#aab4c8'; g.fillText('Showroom ô tô · xe máy chính hãng',w/2,h/2+30,w*.9); });
        const m=new THREE.MeshStandardMaterial({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:.6, roughness:.4}); m.userData.noMerge=true; return m; })(),
      exitSign:(()=>{ const t=ct(256,64,(g,w,h)=>{ g.fillStyle='#0e5e3a'; g.fillRect(0,0,w,h); g.fillStyle='#f3efe6'; g.font='800 34px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('LỐI RA ➜',w/2,h/2+1); });
        const m=new THREE.MeshStandardMaterial({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:.8}); m.userData.noMerge=true; return m; })() }; })());
  function build(){
    const X=mats(), GF=X.GF, GM=X.GM, K=GKit(), KS=GKit(), bronze=GM.mullionDark, chrome=GM.chrome, walnut=GM.woodDark;
    const aoD=(K2,x,y,z,w,d,ry=0,pad=.4)=>K2.add(new THREE.PlaneGeometry(w+2*pad, d+2*pad), GM.aoDecal, x, y+.02, z, ry, -Math.PI/2);   // bóng AO giả: UV 0..1 (GF.aoDecal lặp ô mỗi mét)
    const P0=(geo,mat,x,y,z,ry=0,rx=0,rz=0)=>K.add(geo,mat,x,y,z,ry,rx,rz), S0=(geo,mat,x,y,z,ry=0,rx=0,rz=0)=>KS.add(geo,mat,x,y,z,ry,rx,rz);   // K: đồ đổ bóng · KS: vỏ sảnh (sàn/trần/tường/đèn) không đổ bóng – trần đổ bóng sẽ che tối cả sàn
    const loc=(x0,y0,z0,ry)=>{ const c=Math.cos(ry), s=Math.sin(ry); return (geo,mat,lx=0,ly=0,lz=0,rx=0,rz=0,ry2=0)=>K.add(geo, mat, x0+lx*c+lz*s, y0+ly, z0-lx*s+lz*c, ry+ry2, rx, rz); };
    // sàn đá bóng + trần thạch cao + đèn
    S0(planeM(RW*2, RD*2), X.floor, 0, FY, 0, 0, -Math.PI/2);
    S0(planeM(RW*2, RD*2), X.plaster, 0, FY+CH, 0, 0, Math.PI/2);
    for(const s of [-1,1]) S0(cbox(.3, .06, RD*2-1.2, .01), X.warm, s*(RW-.7), FY+CH-.06, 0);                         // đèn hắt dọc 2 tường
    for(let x=-RW+3;x<RW;x+=5) for(let z=-RD+3;z<RD;z+=5) S0(cbox(2.4, .06, .18, .01), X.warm, x, FY+CH-.05, z);      // đèn thanh ấm
    // tường: hậu gỗ óc chó + nẹp đồng · hông thạch cao + len chân
    S0(planeM(RW*2, CH), walnut, 0, FY+CH/2, -RD+.01); for(let x=-RW+1.2; x<RW-.5; x+=1.2) S0(cbox(.06, CH-.2, .06, .01), bronze, x, FY+CH/2, -RD+.05);
    for(const s of [-1,1]){ S0(planeM(RD*2, CH), X.plaster, s*(RW-.01), FY+CH/2, 0, -s*Math.PI/2); S0(cbox(.05, .14, RD*2, .01), bronze, s*(RW-.03), FY+.07, 0); }
    // mặt tiền kính + khung đồng đen + cửa 2 cánh
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(RW*2,CH), glassM); gl.position.set(0,FY+CH/2,RD+.1); root.add(gl);
    const out=ct(512,256,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#8ec8f2'); gr.addColorStop(1,'#dfeefa'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#4a5160'; g.fillRect(0,h*.78,w,h*.22); g.fillStyle='#f2c230'; for(let x=0;x<w;x+=30) g.fillRect(x,h*.88,15,2);
      for(let i=0;i<18;i++){ const bw=15+R()*30, bh=20+R()*60, x=R()*w; g.fillStyle=`rgb(${120+R()*60|0},${130+R()*60|0},${150+R()*60|0})`; g.fillRect(x,h*.78-bh,bw,bh); } });
    const op=new THREE.Mesh(new THREE.PlaneGeometry(RW*2.6,CH*1.4), new THREE.MeshBasicMaterial({map:out})); op.position.set(0,FY+CH*.55,RD+4); op.rotation.y=Math.PI; root.add(op);
    for(let x=-RW;x<=RW;x+=4){ if(Math.abs(x)<2) continue; S0(cbox(.12, CH, .2, .02), bronze, x, FY+CH/2, RD+.1); }
    for(const y of [FY+.06, FY+CH-.08]) S0(cbox(RW*2, .12, .2, .02), bronze, 0, y, RD+.1);
    { const DW=1.75; for(const s of [-1,1]) S0(cbox(.14, 3.1, .22, .02), bronze, s*DW, FY+1.55, RD+.06); S0(cbox(2*DW+.14, .2, .22, .02), bronze, 0, FY+3.1, RD+.06);
      for(const s of [-1,1]){ const cx=s*DW/2, lw=DW-.06; for(const [w,h,x,y] of [[lw,.07,cx,FY+.035],[lw,.07,cx,FY+2.96],[.07,2.96,cx-lw/2+.035,FY+1.5],[.07,2.96,cx+lw/2-.035,FY+1.5]]) S0(cbox(w,h,.06,.01), bronze, x, y, RD+.02);
        S0(planeM(lw-.1, 2.85), GM.glassClear, cx, FY+1.5, RD+.02); S0(cylM(.018,.018,1.2,24), chrome, s*.16, FY+1.15, RD-.05); }
      S0(cbox(1.3, .36, .06, .01), bronze, 0, FY+3.5, RD-.02); S0(new THREE.PlaneGeometry(1.2, .3), X.exitSign, 0, FY+3.5, RD-.06, Math.PI); }
    INTER.push({x:0, z:RD-1.4, r:1.7, label:'🚪 Ra ngoài phố', action:()=>exit()});
    solid(-RW-2,RW+2,-RD-2,-RD+.15); solid(-RW-2,RW+2,RD-.15,RD+2); solid(-RW-2,-RW+.15,-RD-2,RD+2); solid(RW-.15,RW+2,-RD-2,RD+2);
    plats.push({t:'r', x:0, z:0, c:1, s:0, hw:RW, hd:RD, h:FY});
    // tường thương hiệu: hộp đèn logo khung đồng
    S0(cbox(14.4, 3.9, .22, .03), bronze, 0, FY+3.6, -RD+.15); S0(new THREE.PlaneGeometry(14, 3.5), X.logo, 0, FY+3.6, -RD+.27);
    const ad=(t1,t2,c)=>ct(256,384,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,hex(c)); gr.addColorStop(1,'#10141c'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#f3efe6'; g.font='900 32px "Segoe UI",sans-serif'; g.fillText(t1,15,60,w-30); g.font='500 17px "Segoe UI",sans-serif'; g.fillText(t2,15,90,w-30);
      g.fillStyle='rgba(255,255,255,.15)'; g.beginPath(); g.ellipse(w/2,h*.62,100,35,0,0,7); g.fill(); g.fillStyle='#f3efe6'; g.font='700 20px "Segoe UI",sans-serif'; g.fillText('Trả góp 0% 🚗',15,h-30); });
    [['SPORT GT','0-100 km/h 4.2s',0xff5a6e],['SUV 7 CHỖ','Cho cả gia đình',0x2a6fdb],['PICKUP','Mạnh mẽ · bền bỉ',0xf2b705],['MINI','Nhỏ xinh · tiết kiệm',0x46d39a]].forEach(([a,b,c],i)=>{ const tex=ad(a,b,c), side=i<2?-1:1, z=-6+(i%2)*9;
      const p=new THREE.Mesh(new THREE.PlaneGeometry(2.4,3.6), new THREE.MeshStandardMaterial({map:tex, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:.35, roughness:.5}));
      p.position.set(side*(RW-.12),FY+3.2,z); p.rotation.y=-side*Math.PI/2; root.add(p); S0(cbox(.1, 3.9, 2.7, .02), bronze, side*(RW-.06), FY+3.2, z); });
    // quầy lễ tân: thân ốp, mặt đá, LED, màn hình + bàn phím (quay về phía lễ tân)
    { const P2=loc(-14, FY, 9, 0); P2(cbox(4.4, 1.1, .8, .04), X.acp, 0, .55, 0); P2(cbox(4.6, .06, 1.0, .02), GM.granite, 0, 1.13, .05); P2(cbox(4.4, .04, .03, .01), X.red, 0, .2, .41);
      P2(cbox(.62, .38, .04, .01), X.ceramic, .8, 1.42, -.15); P2(cylM(.02,.02,.22,16), chrome, .8, 1.22, -.15); P2(new THREE.PlaneGeometry(.56,.32), GM.screen, .8, 1.42, -.173, 0, 0, Math.PI); P2(cbox(.45,.02,.15,.01), X.ceramic, .8, 1.17, -.38); }
    solid(-16.3,-11.7,8.4,9.6);
    // góc chờ: sofa có cấu trúc (khung gỗ, 3 đệm ngồi tách múi, 3 đệm lưng ngả, 2 tay vịn, chân inox) – ghế ngồi được (E · C)
    const sofa=(x,z,rot)=>{ const P2=loc(x, FY, z, rot);
      P2(cbox(2.6, .22, .9, .03), walnut, 0, .21, 0); for(const [lx,lz] of [[-1.2,-.36],[1.2,-.36],[-1.2,.36],[1.2,.36]]) P2(cylM(.025,.02,.1,16), chrome, lx, .05, lz);
      for(const k of [-.82, 0, .82]){ P2(cbox(.8, .16, .74, .05), X.fab, k, .38, .06); P2(cbox(.8, .5, .18, .06), X.fab, k, .7, -.3, -.12); }
      P2(cbox(2.6, .62, .14, .03), X.fab, 0, .62, -.39); for(const s of [-1,1]) P2(cbox(.16, .5, .9, .04), X.fab, s*1.3, .45, 0);
      aoD(K, x, FY, z, 2.6, .9, rot, .3);
      boxes.push({x0:x-1.4,x1:x+1.4,z0:z-.55,z1:z+.55}); for(const k of [-.8,0,.8]) W.addSeat && W.addSeat({x:x+Math.cos(rot)*k, z:z-Math.sin(rot)*k, rot, y:FY+.46, floor:FY, scope:'interior', label:'🛋️ Ngồi chờ (E · C)'}); };
    sofa(-16,4.6,0); sofa(-16,1.4,Math.PI);
    S0(planeM(4.6, 5.6), X.rug, -16, FY+.008, 3, 0, -Math.PI/2);
    P0(cbox(1.4, .05, .8, .02), walnut, -16, FY+.42, 3); for(const [dx,dz] of [[-.6,-.32],[.6,-.32],[-.6,.32],[.6,.32]]) P0(cylM(.018,.018,.4,16), chrome, -16+dx, FY+.2, 3+dz);
    solid(-16.7,-15.3,2.6,3.4);
    // cây chậu gốm ở 4 góc
    let seed=31; for(const [x,z] of [[-RW+1,RD-1.2],[RW-1,RD-1.2],[-RW+1,-RD+1.2],[RW-1,-RD+1.2]]){ P0(X.pot, X.ceramic, x, FY, z); GF.addTree(K, 'fig', x, FY+.44, z, 1.15, R()*6.28, seed++); circles.push({x,z,r:.4}); }
    // bục trưng bày (nhôm + mặt đá + vòng LED) + xe + bóng AO
    const DISP=[{m:'sport',c:0xb3122e,x:0,z:-1,hero:true},
      {m:'suv',c:0x111111,x:-14,z:-9},{m:'limo',c:0x111111,x:-14,z:-2.6},{m:'pickup',c:0x9aa3ad,x:-7,z:-9.6},
      {m:'sedan',c:0x2a6fdb,x:14,z:-9},{m:'lux',c:0x8e9aa6,x:14,z:-2.6},{m:'pickup',c:0xf2b705,x:7,z:-9.6},
      {m:'mini',c:0xf2b705,x:-6.5,z:6},{m:'mini',c:0x46d39a,x:6.5,z:6},{m:'roadster',c:0xb3122e,x:14,z:4},{m:'suv',c:0x1f7a4d,x:-3.4,z:-9.6}];
    for(const d of DISP){ const r=d.hero?3.6:2.8;
      P0(cylM(r, r+.1, .16, 48), X.alu, d.x, FY+.08, d.z); P0(cylM(r-.15, r-.15, .02, 48), GM.stoneDark, d.x, FY+.165, d.z);
      const ring=M(new THREE.TorusGeometry(r+.02,.035,6,48), glow(d.hero?0xff5a6e:0x4fc3ff,1.6), d.x,FY+.17,d.z); ring.rotation.x=Math.PI/2; ring.castShadow=false;
      const car=V.buildCar(d.c, d.m); car.position.set(d.x,FY+.16,d.z); car.rotation.y=d.hero?0:(d.x<0?.6:-.6)+(d.z>0?Math.PI:0);
      if(d.hero){ const tt=new THREE.Group(); tt.position.set(d.x,0,d.z); root.add(tt); car.position.set(0,FY+.16,0); tt.add(car); tt.userData.dynamic=true; st.turn=tt; aoD(K, d.x, FY+.16, d.z, 3.2, 3.2, 0, .2); }
      else { root.add(car); aoD(K, d.x, FY+.16, d.z, 1.9, 4.6, car.rotation.y, .4); }
      circles.push({x:d.x, z:d.z, r:r-.2});
      const I=INFO[d.m], bx=d.x+(d.x<=0?1:-1)*(r+.6), bz=d.z+(d.z<0?r*.7:-r*.7);
      const bt=ct(512,384,(g,w,h)=>{ g.fillStyle='#0f141c'; g.fillRect(0,0,w,h); g.fillStyle=hex(d.c===0x111111?0x444444:d.c); g.fillRect(0,0,w,14); g.fillStyle='#f3efe6'; g.font='800 44px "Segoe UI",sans-serif'; g.fillText(I.name,24,74,w-48);
        g.font='500 28px "Segoe UI",sans-serif'; g.fillStyle='#aab4c8'; g.fillText(I.desc,24,124,w-48); g.fillText('Tốc độ tối đa: '+I.speed,24,170); g.fillStyle='#ffd23f'; g.font='800 52px "Segoe UI",sans-serif'; g.fillText(fmt(I.price)+' 💰',24,262);
        g.fillStyle='#46d39a'; g.font='600 26px "Segoe UI",sans-serif'; g.fillText('Bấm E để xem & chọn màu',24,334); });
      const ry=Math.atan2(d.x-bx,d.z-bz)+Math.PI, P2=loc(bx, FY, bz, ry);   // bảng quay ra lối đi (ngược phía xe)
      P2(cbox(.4,.04,.3,.01), bronze, 0, .02, 0); P2(cylM(.03,.03,1.1,24), chrome, 0, .55, 0); P2(cbox(1.16,.88,.05,.01), bronze, 0, 1.35, 0, -.25);
      const sg=new THREE.Group(); sg.position.set(bx,0,bz); sg.rotation.y=ry; root.add(sg);
      const sp=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.82), new THREE.MeshStandardMaterial({map:bt, emissive:0xffffff, emissiveMap:bt, emissiveIntensity:.6})); sp.position.set(0,FY+1.35+.006,.03); sp.rotation.x=-.25; sg.add(sp);
      circles.push({x:bx,z:bz,r:.3});
      INTER.push({x:bx, z:bz, r:1.8, prio:.5, label:`🚗 ${I.name} · ${fmt(I.price)} 💰 – xem & mua (E)`, action:()=>buyCar(d.m, d.c)}); }
    // xe tay ga trên bục đá
    for(const [i,c] of [[0,0xb3122e],[1,0x2a6fdb],[2,0xf2f2f2]]){ const x=16.5, z=9.2-i*1.6; P0(cbox(2.2,.14,1.2,.03), GM.granite, x, FY+.07, z); const b=V.buildBike(c); b.position.set(x,FY+.14,z); b.rotation.y=-Math.PI/2; root.add(b); aoD(K, x, FY+.14, z, .6, 1.7, -Math.PI/2, .2); circles.push({x,z,r:.7}); }
    INTER.push({x:13.6, z:7.6, r:1.9, prio:.5, label:'🛵 Xe tay ga · 2.000 💰 – xem & mua (E)', action:()=>buyBike()});
    const lab=makeLabel('🛵 Xe tay ga', 'Đỏ · Xanh · Trắng', {h:.45, x:16.5, y:2.2, z:7.6, fade:30, group:'interior'}); st.labels=[lab];
    K.build(root); KS.build(root, {cast:false});
    // người: tư vấn viên + lễ tân (quay nhìn + gật chào khách) + khách xem xe
    if(W.people){ const P2=W.people;
      const mk=(seed,outfit,role,x,z,h,mode)=>{ const k=P2.kit(seed,{outfit}); const a=makeActor(k.gl,{name:`${P2.nameOf(seed)} · ${role}`, height:k.h, face:0, clips:k.clips, compact:false, dot:role==='Tư vấn viên'?'#ffd23f':'#9fb3c8', group:'interior', parent:root});
        a.g.position.set(x,FY,z); a.g.rotation.y=h; a.play('idle',0); const p=makePoser(THREE,a); const anchor=new THREE.Object3D(); anchor.position.y=k.h+.7; a.g.add(anchor);
        const o={a,p,x,z,h,mode,t:R()*5,anchor}; st.actors.push(o); if(mode!=='walk'&&mode!=='guide') circles.push({x,z,r:.35}); return o; };
      st.guide=mk(P2.pickSeed(L=>!L.female && L.style!=='cap',71), {shirt:0xffffff, pants:0x1f2a44, long:true}, 'Tư vấn viên', 0, 9.6, Math.PI, 'guide');
      mk(P2.pickSeed(L=>L.female,72), {shirt:0xff5a6e, long:true}, 'Lễ tân', -14, 8.2, 0, 'desk');
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
        toast(afterBuy({type:'car', model, color:col}, `🎉 Chúc mừng! ${I.name} đã giao ở bãi đỗ trước showroom. Ra ngoài bấm V để lái.`), 5000); if(st.guide) sayNow(st.guide, 'Chúc mừng anh/chị! Lái xe an toàn nhé 🚗', 4); }); }; };
    render(); }
  function buyBike(){ let col=S.bikeColor||0xb3122e; const m=ui.modal('🛵 Xe tay ga');
    const render=()=>{ m.body.innerHTML=`<p>~50 km/h, đi đường nhựa nhanh, dễ dắt. Bấm V để lên/xuống xe.</p><div class="row" style="gap:8px;flex-wrap:wrap">${COLORS.map(([c,n])=>`<button class="swatch ${c===col?'on':''}" data-c="${c}" title="${n}" style="background:${hex(c)}"></button>`).join('')}</div>
      <div class="row" style="margin-top:14px"><span class="price" style="font-size:20px">2.000 💰</span><div class="sp"></div>${S.inv.bike?'<span class="jok">✓ Đã có xe tay ga</span> <button class="btn" data-paint>Đổi màu (miễn phí)</button>':'<button class="btn pri" data-buy>Mua xe</button>'}</div>`;
      m.body.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ col=+b.dataset.c; render(); });
      const pb=m.body.querySelector('[data-paint]'); if(pb) pb.onclick=()=>{ S.bikeColor=col; save(); V.recolor && V.recolor('bike', col); toast('🎨 Đã đổi màu xe tay ga.'); m.close(); };
      const bb=m.body.querySelector('[data-buy]'); if(bb) bb.onclick=()=>{ m.close(); askPay(2000, '🛵 Mua <b>xe tay ga</b>', ()=>{ if(!spend(2000)) return; S.inv.bike=1; S.vehicle='bike'; S.bikeColor=col; save(); V.recolor && V.recolor('bike', col); toast(afterBuy({type:'bike', color:col}, '🎉 Xe tay ga đã giao trước showroom. Bấm V để lên xe.'), 4500); }); }; };
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
      /* S19g 21/11: sảnh dựng quanh gốc (0,0) – ở V2 địa hình đảo Abyssal (EXTL) chỗ đó cao ~+14 m → người chơi bị nhấc khỏi sàn, camera kẹt trần (màn hình xám).
         Trong lúc ở sảnh: đặt 1 mảnh đất phẳng +0 lên ĐẦU danh sách EXTL, chỉ phủ đúng vùng sảnh (extH lấy mảnh khớp đầu tiên); gỡ ra khi rời sảnh. */
      if(W.EXTL){ st.ext={x0:-RW-3, x1:RW+3, z0:-RD-3, z1:RD+3, h:()=>0}; W.EXTL.unshift(st.ext); }
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
      if(st.ext && W.EXTL){ const i=W.EXTL.indexOf(st.ext); if(i>=0) W.EXTL.splice(i,1); st.ext=null; }   // trả địa hình thật trước khi đặt người chơi ra cửa
      const e=exitFn(); P.x=e.x; P.z=e.z; P.y=groundAt(P.x,P.z); P.face=e.face; me.g.position.set(P.x,P.y,P.z); me.g.rotation.y=e.face; cam.yaw=e.face+Math.PI; cam.tx=P.x; cam.tz=P.z;
      camera.position.set(P.x+Math.sin(cam.yaw)*6, P.y+3, P.z+Math.cos(cam.yaw)*6); setTimeout(()=>fade.style.opacity=0, 60); }, 300); }

  HOOK.onFrame.push((dt, T)=>{ if(!st.on) return;
    if(SS.environment!==scene.environment) SS.environment=scene.environment;
    dl.position.set(P.x+8,16,P.z+9); dl.target.position.set(P.x,0,P.z);
    if(st.turn) st.turn.rotation.y+=dt*.35;
    for(const o of st.actors){ o.t+=dt;
      if(o.mode==='guide') updGuide(o, dt);
      else if(o.mode==='desk'){ const dP=Math.hypot(P.x-o.x,P.z-o.z), tg=dP<8 ? Math.atan2(P.x-o.x,P.z-o.z) : 0; o.h=W.lerpAngle(o.h, tg, 1-Math.exp(-dt*3)); place(o); o.a.play('idle');   // lễ tân: quay nhìn khách, gật chào khi lại gần
        if(dP<4){ if(!o.greeted){ o.greeted=true; o.nod=1.4; sayNow(o,'Dạ, QC Auto xin chào anh/chị ạ! 😊',2.6); } } else if(dP>6) o.greeted=false; if(o.nod>0) o.nod-=dt; }
      else if(o.mode==='walk' && o.path){ o.wi=o.wi||0; const [tx,tz]=o.path[o.wi], dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<.3) o.wi=(o.wi+1)%o.path.length; else { o.x+=dx/d*1.1*dt; o.z+=dz/d*1.1*dt; o.h=W.lerpAngle(o.h, Math.atan2(dx,dz), 1-Math.exp(-dt*6)); } o.a.play('walk'); place(o); }
      o.a.mixer.update(dt); if(['cross','phone'].includes(o.mode)) o.p.apply(o.mode, o.t); else if(o.mode==='desk' && o.nod>0) o.p.apply('nod', o.t);
      if(o.bub){ o.bubT-=dt; if(o.bubT<=0){ removeLabel(o.bub); o.bub=null; } } }
    // 2 khách bàn luận
    st.talkT=(st.talkT||3)-dt; if(st.talkT<=0 && st.pair){ st.talkT=4+R()*4; const L2=[['Con SUV này rộng ghê!','Ừ, đi biển cuối tuần là hết ý.'],['Màu trắng sang hơn nhỉ?','Đen nhìn mạnh mẽ hơn đó.'],['Có trả góp 0% luôn kìa.','Vậy tháng sau mua thôi 😄']][Math.floor(R()*3)]; sayNow(st.pair[0],L2[0],3); setTimeout(()=>st.on&&st.pair&&sayNow(st.pair[1],L2[1],3),1600); }
  });
  return {enter, exit, get on(){ return st.on; },
    setExit:f=>{ if(typeof f==='function') exitFn=f; },   // cửa ra mới: f() → {x, z, face}
    onBuy:f=>{ if(typeof f==='function') buyHooks.push(f); },   // f({type:'car'|'bike', model, color}) → chuỗi thông báo thay thế (tuỳ chọn)
    buy:(model, color)=>{ if(INFO[model]) buyCar(model, color??0xb3122e); }, buyBike:()=>buyBike(), INFO, COLORS};
}
