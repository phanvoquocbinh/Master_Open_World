// QC World – S10: ĐẠI GIA & SIÊU XE
//  🏢 QC AUTO SHOWROOM chuyển lên toà kính lớn ở Đồi Brand QC (44 × 28 m – ĐÚNG bằng phòng trưng bày bên trong): mặt tiền kính 2 tầng,
//     bảng hiệu sáng, xe trưng bày nhìn thấy qua kính (siêu xe mui trần trên bàn xoay), cửa chính E vào phòng trưng bày.
//     Căn nhà nhỏ cũ ở Phường thành "điểm chỉ đường" (E: đi taxi tới showroom mới).
//  💎 3 đại gia lái xe sang (thiết kế riêng, không logo hãng): limousine có tài xế · sedan siêu sang 2 tông màu · siêu xe mui trần
//     – đại gia nam có bạn gái ngồi cạnh, nữ đại gia có bạn trai ngồi cạnh. Lịch sống: sáng rời khu biệt thự ven đầm → vào Downtown
//     đỗ trước toà công ty → làm việc → chiều chạy về biệt thự. Tuân thủ đèn giao thông, giữ khoảng cách, nhường người (traffic.limit).
import { compactGroup } from './perf.js';
import { makePoser } from './pose.js';

export function makeLuxury(W, ctx){
  const {city, transit:TR, V, ui} = ctx;
  const {THREE, scene, P, HOOK, INTER, PLACES, toast, circles, boxes, mergeGeometries, GLOW, teleport, makeLabel, removeLabel, makeActor, groundAt, labels} = W;
  const info=W.hillsInfo; if(!info) return null;
  const Y=info.FLAT, SH=info.SHOW;
  const sm=(c,r=.6,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function Kit(){ const parts=new Map(); return { add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
    build(parent){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=!m.transparent; ms.receiveShadow=true; parent.add(ms); } } }; }
  const canvasTex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };

  /* ============================== 🏢 TOÀ SHOWROOM LỚN ============================== */
  const X0=SH.x0+2, X1=SH.x1-2, Z0=SH.z0+2, Z1=SH.z1-2, CX=(X0+X1)/2, CZ=(Z0+Z1)/2, HT=9;   // 44 × 28 m, cao 9 m (2 tầng kính)
  const door={x:X0-1.4, z:CZ};      // mặt tiền nhìn ra đường ven biển (phía Tây)
  { const k=Kit(), glass=new THREE.MeshStandardMaterial({color:0x9fd2f5, roughness:.03, metalness:.85, transparent:true, opacity:.26, depthWrite:false, side:THREE.DoubleSide, envMapIntensity:1.6}),
      steel=sm(0xd0d5dc,.25,.9), dark=sm(0x1c2028,.5,.3), white=sm(0xf3f3f1,.3), floor=sm(0xe9e9ec,.12,.05);
    k.add(new THREE.BoxGeometry(X1-X0,.3,Z1-Z0), floor, CX, Y+.15, CZ);
    k.add(new THREE.BoxGeometry(X1-X0+2.4,.7,Z1-Z0+2.4), white, CX, Y+HT+.35, CZ); k.add(new THREE.BoxGeometry(X1-X0+2.5,.12,Z1-Z0+2.5), steel, CX, Y+HT+.75, CZ);
    k.add(new THREE.BoxGeometry(X1-X0-.4,.25,8), white, CX+(X1-X0)/2-4.2, Y+4.6, CZ);   // tầng lửng phía sau
    for(const [a,b,c,d] of [[X0,Z0,X1,Z0],[X0,Z1,X1,Z1],[X1,Z0,X1,Z1]]){ const len=Math.hypot(c-a,d-b); k.add(new THREE.BoxGeometry(c===a?.08:len, HT, c===a?len:.08), glass, (a+c)/2, Y+HT/2, (b+d)/2); }
    for(const [z0,z1] of [[Z0,door.z-2],[door.z+2,Z1]]) k.add(new THREE.BoxGeometry(.08,HT,z1-z0), glass, X0, Y+HT/2, (z0+z1)/2);
    k.add(new THREE.BoxGeometry(.08,HT-3.2,4), glass, X0, Y+3.2+(HT-3.2)/2, door.z);
    for(let x=X0;x<=X1+.01;x+=4){ for(const z of [Z0,Z1]) k.add(new THREE.BoxGeometry(.18,HT,.22), steel, x, Y+HT/2, z); }
    for(let z=Z0;z<=Z1+.01;z+=4){ for(const x of [X0,X1]) k.add(new THREE.BoxGeometry(.22,HT,.18), steel, x, Y+HT/2, z); }
    k.add(new THREE.BoxGeometry(4.6,.3,6.5), white, X0-2.2, Y+3.6, door.z); for(const s of [-1,1]) k.add(new THREE.CylinderGeometry(.14,.14,3.5,10), steel, X0-4.2, Y+1.75, door.z+s*2.9);
    for(const s of [-1,1]) circles.push({x:X0-4.2, z:door.z+s*2.9, r:.2});
    // đèn trần
    for(let x=X0+4;x<X1-2;x+=6) for(let z=Z0+4;z<Z1-2;z+=6) k.add(new THREE.BoxGeometry(2.4,.06,.5), sm(0xffffff,.4,0,{emissive:0xffffff, emissiveIntensity:1.0}), x, Y+HT-.05, z);
    const g=new THREE.Group(); scene.add(g); k.build(g);
    boxes.push({x0:X0, x1:X1, z0:Z0, z1:Z1, msg:'🚗 Vào showroom bằng cửa chính phía đường ven biển (E)'});
    // bảng hiệu mái
    const sign=canvasTex(2048,256,(c,w,h)=>{ c.fillStyle='#0d1117'; c.fillRect(0,0,w,h); const gr=c.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#ff5a6e'); gr.addColorStop(1,'#ffb547'); c.fillStyle=gr; c.fillRect(0,h-18,w,18);
      c.fillStyle='#fff'; c.font='900 120px "Segoe UI",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('QC AUTO · LUXURY SHOWROOM',w/2,h/2-8); });
    const sgm=new THREE.MeshStandardMaterial({map:sign, emissive:0xffffff, emissiveMap:sign, emissiveIntensity:.7});
    const sp=new THREE.Mesh(new THREE.PlaneGeometry(26,3.2), sgm); sp.position.set(X0-1.25, Y+HT+2.2, CZ); sp.rotation.y=-Math.PI/2; scene.add(sp);
    const sb=new THREE.Mesh(new THREE.BoxGeometry(.3,3.6,26.6), dark); sb.position.set(X0-1.05, Y+HT+2.2, CZ); scene.add(sb);
    HOOK.onFrame.push(()=>{ sgm.emissiveIntensity=.55+(W.night||0)*1.1; });
    // xe trưng bày nhìn qua kính (giống bố trí phòng trưng bày)
    const disp=[['roadster',0xb3122e,CX-4,CZ,true],['limo',0x111111,X0+8,Z0+5,false],['lux',0xf2f2f2,X0+8,Z1-5,false],['sport',0xf2b705,X1-8,Z0+5,false],['suv',0x1f7a4d,X1-8,Z1-5,false],['sedan',0x2a6fdb,CX+6,Z0+5,false]];
    const podM=sm(0xffffff,.3), ringM=sm(0x4fc3ff,.3,0,{emissive:0x4fc3ff, emissiveIntensity:1.4});
    for(const [m,c,x,z,hero] of disp){ const pod=new THREE.Mesh(new THREE.CylinderGeometry(hero?3.6:2.9,hero?3.7:3.0,.2,40), podM); pod.position.set(x,Y+.4,z); scene.add(pod);
      const rg=new THREE.Mesh(new THREE.TorusGeometry(hero?3.62:2.92,.04,6,48), ringM); rg.rotation.x=Math.PI/2; rg.position.set(x,Y+.5,z); scene.add(rg);
      const car=V.buildCar(c, m, {color2:0x1a1a1f}); car.position.set(0,0,0); try{ compactGroup(W, car); }catch(e){}
      const holder=new THREE.Group(); holder.position.set(x,Y+.5,z); holder.rotation.y=hero?0:(x<CX?.7:-.7); holder.add(car); holder.userData.dynamic=hero; scene.add(holder); if(hero) HOOK.onFrame.push((dt)=>{ holder.rotation.y+=dt*.35; }); }
    INTER.push({x:door.x, z:door.z, r:2.2, prio:.8, label:'🚗 Vào QC Auto Luxury Showroom – ô tô, siêu xe, xe máy (E)', action:()=>W.showroom ? W.showroom.enter() : toast('Showroom đang mở cửa…')});
    makeLabel('🚗 QC Auto · Luxury Showroom', 'Ô tô · siêu xe · limousine · xe máy', {h:.85, x:X0-2, y:Y+HT+5.2, z:CZ, fade:150});
    // chuyển lối ra của phòng trưng bày + điểm chỉ đường ở chỗ cũ
    if(city && city.showroom){ const so=city.showroom; const old={x:so.tx, z:so.tz};
      so.tx=door.x-.4; so.tz=door.z; so.f=[-1,0];
      for(const it of INTER){ if(typeof it.label==='string' && it.label.includes('Vào QC Auto Showroom') && it!==INTER[INTER.length-1]){ it.label='🚗 QC Auto đã chuyển tới toà kính lớn ở Đồi Brand QC (E: đi taxi tới)';
          it.action=()=>{ const go=()=>teleport(door.x-3, door.z, CX, CZ); if(ui && ui.confirm) ui.confirm('🚗 QC Auto Showroom', 'Showroom đã chuyển tới <b>toà kính lớn ở Đồi Brand QC</b> (cạnh phố ẩm thực, đường ven biển). Đi taxi tới ngay?', 'Đi taxi', go); else go(); }; } }
      const pl=PLACES.find(p=>p.name==='Showroom xe'); if(pl){ pl.name='QC Auto Luxury Showroom'; pl.sub='Toà kính lớn ở Đồi Brand QC · ô tô, siêu xe, xe máy'; pl.go=()=>teleport(door.x-3, door.z, CX, CZ); }
      const td=TR && TR.TAXI_DEST && TR.TAXI_DEST.find(d=>d.name.includes('Showroom')); if(td){ td.x=door.x-3; td.z=door.z; }
      void old; } }

  /* ============================== 💎 ĐẠI GIA & XE SANG ============================== */
  const people=W.people, G=TR && TR.G;
  const towers=(W.life && W.life.downtown && W.life.downtown.towers) || ctx.towers || [];
  const VILLAS=info.VILLAS||[];
  const TYC=[
    {model:'limo', color:0x0d0d10, c2:0x0d0d10, name:'Đại gia Tuấn', male:true, partner:'Ngọc', chauffeur:true, villa:0, tower:0, wait:40},
    {model:'lux', color:0xf4f4f2, c2:0x15161a, name:'Nữ đại gia Vy', male:false, partner:'Khang', villa:1, tower:1, wait:50},
    {model:'roadster', color:0xc4161c, c2:0x111111, name:'Đại gia Long', male:true, partner:'Mai', villa:2, tower:2, wait:35},
  ];
  const cars=[];
  const seatY={limo:.62, lux:.6, roadster:.66};   // S-GFX (15/11): mui trần – hông đặt đúng mặt đệm ghế (.69), trước .5 → chìm dưới ghế, chân xuyên thân xe
  function person(seed, outfit, name, dot){ const kk=people.kit(seed,{outfit}); const a=makeActor(kk.gl,{name, height:kk.h, face:0, clips:kk.clips, compact:false, dot}); a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a); const hh=po.hipsHeight(); return {a, po, hh}; }
  if(people && G && V && V.buildCar) TYC.forEach((t,i)=>{
    const g=V.buildCar(t.color, t.model, {color2:t.c2, seat:0x3a1a10}); g.userData.dynamic=true; for(const w of (g.userData.wheels||[])) w.userData.keep=true; try{ compactGroup(W, g); }catch(e){}
    scene.add(g); const bb=new THREE.Box3().setFromObject(g), sz=bb.getSize(new THREE.Vector3());
    const c={...t, g, hl:sz.z/2, hw:sz.x/2, v:0, s:0, h:0, state:'home', t:Math.random()*20, ride:[], idle:0};
    const man=s=>people.pickSeed(L=>!L.female && L.style!=='cap', s), woman=s=>people.pickSeed(L=>L.female, s);
    const suitM={shirt:0x15171c, pants:0x15171c, long:true, shoe:0x111111}, dressF={shirt:[0xd81b60,0xf5d0e0,0xffffff][i], dress:true, long:false, shoe:0xffffff};
    const boss=person(t.male?man(300+i):woman(310+i), t.male?suitM:{...dressF, shirt:0xf2f2f2}, `💎 ${t.name}`, '#ffd23f');
    const partner=person(t.male?woman(320+i):man(330+i), t.male?dressF:{...suitM, shirt:0x2a3550}, `${t.male?'💃':'🕺'} ${t.partner}`, '#ff8fc2');
    const sy=seatY[t.model]||.6;
    if(t.chauffeur){ const drv=person(man(340), {shirt:0x111111, pants:0x111111, long:true, style:'cap'}, '🎩 Tài xế', '#9fb3c8'); c.ride.push({...drv, lx:.42, lz:.55}); c.ride.push({...boss, lx:.45, lz:-1.2}); c.ride.push({...partner, lx:-.45, lz:-1.2}); }
    else { c.ride.push({...boss, lx:.42, lz:t.model==='roadster'?-.45:.1}); c.ride.push({...partner, lx:-.42, lz:t.model==='roadster'?-.45:.1}); }
    for(const r of c.ride){ g.add(r.a.g); r.a.g.position.set(r.lx, sy+.04-r.hh, r.lz); r.a.g.rotation.y=0; }
    W.DYN && W.DYN.push({obj:g, hl:c.hl, hw:c.hw, head:()=>c.h, on:()=>g.visible, name:t.model==='limo'?'limousine':'siêu xe'});
    cars.push(c); });
  // điểm nhà (trước cổng biệt thự) và chỗ làm (trước cửa toà công ty)
  const homeOf=c=>{ const v=VILLAS[c.villa%Math.max(1,VILLAS.length)]; return v ? {x:v.x, z:info.LANE_Z} : {x:300, z:info.LANE_Z}; };
  const workOf=c=>{ const t=towers.filter(t=>t.door)[c.tower%Math.max(1,towers.filter(t=>t.door).length)]; return t ? {x:t.door.x, z:t.door.z+(t.face>0?3.2:-3.2)} : {x:178, z:0}; };
  function planTrip(c, from, to){ const a=TR.project(from.x, from.z), b=TR.project(to.x, to.z); if(!a||!b) return false; const r=TR.route(a,b); if(!r || r.pts.length<2) return false; c.path=TR.lanePath(r.pts); c.s=0; return true; }
  function place(c){ const p=c.path.at(c.s), h=c.path.heading(c.s,1.2), f=[Math.sin(h),Math.cos(h)], yF=groundAt(p.x+f[0]*1.6,p.z+f[1]*1.6), yB=groundAt(p.x-f[0]*1.6,p.z-f[1]*1.6);
    c.g.position.set(p.x,(yF+yB)/2,p.z); c.g.rotation.set(-Math.atan2(yF-yB,3.2), h, 0, 'YXZ'); c.h=h; }
  cars.forEach((c,i)=>{ const h=homeOf(c); if(planTrip(c, h, workOf(c))){ c.state='toWork'; c.s=Math.min(c.path.L*.3*i, c.path.L-5); place(c); } });
  function upd(c, dt){
    if(c.state==='parkWork' || c.state==='parkHome'){ c.t-=dt; c.v=0; if(c.t<=0){ const goHome=c.state==='parkWork'; if(planTrip(c, goHome?workOf(c):homeOf(c), goHome?homeOf(c):workOf(c))){ c.state=goHome?'toHome':'toWork'; } else c.t=10; } return; }
    const p=c.path; let vt=c.model==='roadster'?13:11; for(let d=0; d<=24; d+=3) vt=Math.min(vt, Math.sqrt(p.vAt(c.s+d)**2+2*3*d));
    const rem=p.L-c.s; vt=Math.min(vt, Math.sqrt(2*3*Math.max(0,rem-.4)));
    if(W.traffic) vt=Math.min(vt, W.traffic.limit(p, c.s, c.v, c.hl, c.h, c.g.position.x, c.g.position.z, c));
    c.v+=Math.max(-6.5*dt, Math.min(2.6*dt, vt-c.v)); if(c.v<0) c.v=0; c.s=Math.min(p.L, c.s+c.v*dt); place(c);
    for(const w of (c.g.userData.wheels||[])) w.rotation.x+=c.v*dt/.38;
    if(rem<.8 && c.v<.3){ c.state=c.state==='toWork'?'parkWork':'parkHome'; c.t=c.wait+Math.random()*20;
      if(Math.hypot(P.x-c.g.position.x, P.z-c.g.position.z)<30) toast(c.state==='parkWork' ? `💎 ${c.name} tới công ty, đỗ ${c.model==='limo'?'limousine':'siêu xe'} trước sảnh` : `🏡 ${c.name} về tới biệt thự ven đầm`, 2600); }
    if(c.v<.05){ c.idle+=dt; if(c.idle>45 && Math.hypot(P.x-c.g.position.x,P.z-c.g.position.z)>80){ c.idle=0; c.s=Math.min(p.L, c.s+12); } } else c.idle=0; }
  HOOK.onFrame.push((dt, T)=>{ if(W.inside) return;
    for(const c of cars){ const d=Math.hypot(P.x-c.g.position.x, P.z-c.g.position.z), vis=d<220; if(c.g.visible!==vis) c.g.visible=vis;
      upd(c, Math.min(dt,.1));
      if(vis && d<70) for(const r of c.ride){ r.a.mixer.update(dt); r.po.apply('car', T); } } });   // S-GFX: tư thế ngồi xe hơi (chân không lòi ra gầm)

  PLACES.push({icon:'💎', name:'Xe đại gia (đang chạy)', sub:'Limousine · siêu sang · mui trần – theo dõi đại gia đi làm', go:()=>{ const c=cars[Math.floor(Math.random()*cars.length)]; if(!c) return; const p=c.g.position; teleport(p.x+4, p.z+4, p.x, p.z); }});
  return {cars, door, X0, X1, Z0, Z1};
}
