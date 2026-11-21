// QC World – xe tay ga, ô tô, thuyền (dựng thủ tục, vật liệu PBR) + điều khiển lái
import { compactGroup } from './perf.js';
export function makeVehicles(W, S, save){
  const {THREE, scene, mesh, box, MAT, groundAt, groundH, resolve, P, me, cam, HOOK, lerpAngle, clamp, toast, edgeR, onRoad, WATER_Y, burst} = W;
  const V = {};

  const paint = c => new THREE.MeshPhysicalMaterial({color:c, metalness:.55, roughness:.28, clearcoat:1, clearcoatRoughness:.06});
  const rubber = new THREE.MeshStandardMaterial({color:0x151515, roughness:.9});
  const chrome = new THREE.MeshStandardMaterial({color:0xdadfe5, metalness:1, roughness:.15});
  const tint = new THREE.MeshPhysicalMaterial({color:0x101820, metalness:.2, roughness:.05, envMapIntensity:1.6, transparent:true, opacity:.85, clearcoat:1});
  const headL = new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xfff4d6, emissiveIntensity:1.5});
  const tailL = new THREE.MeshStandardMaterial({color:0x550000, emissive:0xff1a1a, emissiveIntensity:1.2});
  const extrude = (pts, depth, bevel=.05) => { const s=new THREE.Shape(); s.moveTo(pts[0][0],pts[0][1]); for(const [x,y] of pts.slice(1)) s.lineTo(x,y);
    const g=new THREE.ExtrudeGeometry(s,{depth, bevelEnabled:true, bevelThickness:bevel, bevelSize:bevel, bevelSegments:3, curveSegments:8}); g.translate(0,0,-depth/2); g.rotateY(-Math.PI/2); return g; };

  /* ---------- Ô tô: 5 mẫu (S2.4 – showroom) ---------- */
  // body/cab: mặt cắt hông (x dọc thân, y cao) · w: rộng · wz: trục bánh trước/sau · wr: bán kính bánh · roof: [y, z, dài]
  const CARS={
    sedan:{name:'QC Sedan S', body:[[-2.1,.32],[2.05,.32],[2.2,.5],[2.17,.66],[1.9,.86],[.6,.98],[-1.8,1.0],[-2.12,.86],[-2.15,.55]], cab:[[.55,.97],[-.22,1.4],[-1.3,1.42],[-1.86,.99]], w:1.66, cw:1.42, wz:[1.35,-1.32], wr:.34, roof:[1.45,-.76,1.0], f:2.2, b:-2.16},
    mini:{name:'QC Mini Hatch', body:[[-1.6,.32],[1.7,.32],[1.82,.5],[1.8,.66],[1.55,.84],[.55,.94],[-1.5,1.0],[-1.65,.86],[-1.68,.55]], cab:[[.5,.93],[-.1,1.42],[-1.35,1.44],[-1.55,.98]], w:1.6, cw:1.4, wz:[1.08,-1.08], wr:.32, roof:[1.46,-.72,1.1], f:1.82, b:-1.68},
    suv:{name:'QC SUV 7 chỗ', body:[[-2.2,.42],[2.15,.42],[2.3,.62],[2.28,.86],[2.0,1.06],[.9,1.12],[-2.0,1.14],[-2.25,1.0],[-2.28,.66]], cab:[[.85,1.1],[.2,1.78],[-1.9,1.8],[-2.1,1.12]], w:1.84, cw:1.62, wz:[1.42,-1.42], wr:.42, roof:[1.83,-.85,1.9], f:2.3, b:-2.28},
    pickup:{name:'QC Pickup Ranger', body:[[-2.6,.42],[2.25,.42],[2.4,.62],[2.36,.84],[2.05,1.0],[.95,1.06],[-2.6,1.06]], cab:[[.95,1.04],[.35,1.68],[-.85,1.7],[-1.0,1.05]], w:1.8, cw:1.6, wz:[1.5,-1.6], wr:.42, roof:[1.73,-.25,1.1], f:2.4, b:-2.6, bed:true},
    // S10 – xe sang (thiết kế riêng của QC World, không logo hãng)
    limo:{name:'QC Royal Limousine', body:[[-3.05,.36],[3.0,.36],[3.18,.58],[3.15,.84],[2.62,1.0],[1.25,1.05],[-2.85,1.07],[-3.1,.92],[-3.12,.6]], cab:[[1.2,1.04],[.62,1.52],[-2.3,1.54],[-2.8,1.06]], w:1.98, cw:1.74, wz:[2.05,-2.0], wr:.4, roof:[1.57,-.84,2.8], f:3.15, b:-3.1, grille:true},
    lux:{name:'QC Maestro S', body:[[-2.65,.34],[2.62,.34],[2.8,.56],[2.77,.78],[2.3,.95],[.95,1.02],[-2.42,1.04],[-2.7,.9],[-2.72,.58]], cab:[[.9,1.0],[.28,1.5],[-1.72,1.52],[-2.32,1.03]], w:1.96, cw:1.7, wz:[1.76,-1.7], wr:.39, roof:[1.55,-.72,1.9], f:2.78, b:-2.7, grille:true, twoTone:true},
    roadster:{name:'QC Stradale Spider', body:[[-2.25,.27],[2.3,.27],[2.46,.42],[2.36,.52],[1.45,.74],[.45,.82],[-1.55,.86],[-2.22,.74],[-2.27,.46]], cab:null, w:1.94, cw:1.5, wz:[1.45,-1.4], wr:.35, roof:null, f:2.45, b:-2.25, open:true, spoiler:true},
    sport:{name:'QC Sport GT', body:[[-2.2,.26],[2.25,.26],[2.4,.4],[2.3,.5],[1.4,.72],[.3,.8],[-1.7,.86],[-2.2,.72],[-2.24,.45]], cab:[[.3,.79],[-.45,1.16],[-1.1,1.17],[-1.75,.85]], w:1.86, cw:1.4, wz:[1.42,-1.38], wr:.33, roof:[1.2,-.78,.6], f:2.4, b:-2.22, spoiler:true},
  };
  V.CARS=CARS; V.carSpeed={mini:.9, sedan:1, suv:1, pickup:.95, sport:1.28, limo:1.05, lux:1.15, roadster:1.35};
  const rimM={};
  V.buildCar = (color=0xb3122e, model, opt={}) => {
    const M=CARS[model||S.carModel||'sedan']||CARS.sedan, g=new THREE.Group(), body=paint(color);
    mesh(extrude(M.body, M.w, .07), body, 0,0,0, g);
    if(M.cab){ mesh(extrude(M.cab, M.cw, .05), tint, 0,0,0, g); mesh(box(M.cw-.04,.05,M.roof[2]), M.twoTone ? paint(opt.color2??0x1a1a1f) : opt.roof!=null ? paint(opt.roof) : body, 0,M.roof[0],M.roof[1], g); }
    // phối màu: sọc đua dọc thân (bám đúng biên dạng nắp capo/cốp) + sọc trên nóc
    if(opt.stripe!=null){ const sp=paint(opt.stripe), lo=Math.min(...M.body.map(p=>p[1])), prof=M.body.map(([x,y])=>[x, y>lo+.25 ? y+.014 : y]);
      for(const s of [-.2,.2]){ mesh(extrude(prof, .06, .07), sp, s,0,0, g); if(M.cab && M.roof) mesh(box(.2,.012,M.roof[2]-.06), sp, s,M.roof[0]+.032,M.roof[1], g); } }
    if(M.twoTone){ const c2=paint(opt.color2??0x1a1a1f); mesh(box(M.w+.02,.06,M.f-M.b-.4), chrome, 0,(M.body[4][1]+M.body[0][1])/2+.12,(M.f+M.b)/2, g); mesh(extrude(M.body.map(([x,y])=>[x, Math.max(y,(M.body[4][1]+M.body[0][1])/2+.14)]), M.w+.01, .06), c2, 0,0,0, g); }
    if(M.open){ // mui trần: kính chắn gió + 2 ghế da + khung chống lật (người ngồi trong nhìn thấy được)
      const ws=mesh(box(M.cw,.5,.04), tint, 0,1.02,.42, g); ws.rotation.x=-.55; const seatM=new THREE.MeshStandardMaterial({color:opt.seat??0x5a1a14, roughness:.6});
      for(const s of [-1,1]){ mesh(box(.5,.14,.55), seatM, s*.42,.62,-.45, g); mesh(box(.5,.62,.14), seatM, s*.42,.92,-.78, g); mesh(box(.08,.32,.08), chrome, s*.42,1.36,-.86, g); }
      mesh(box(M.cw-.3,.06,.5), MAT.black, 0,.86,.05, g); }
    if(M.grille){ mesh(box(.92,.42,.06), chrome, 0,M.body[2][1]+.16,M.f+.02, g); for(let i=-3;i<=3;i++) mesh(box(.03,.38,.07), MAT.black, i*.12,M.body[2][1]+.16,M.f+.03, g); mesh(box(.05,.14,.05), chrome, 0,M.body[3][1]+.12,M.f-.15, g); }
    const hy=M.body[2][1]+.12, ty=M.body[M.body.length-2][1]-.08;
    for(const s of [-1,1]){ mesh(box(.32,.12,.06), headL, s*M.w*.37,hy,M.f, g); mesh(box(.36,.1,.06), tailL, s*M.w*.36,ty,M.b, g); const mir=opt.accent!=null ? paint(opt.accent) : body; if(M.cab) mesh(box(.06,.06,.18), mir, s*(M.w/2+.12),M.cab[0][1],M.cab[0][0]-.05, g); else mesh(box(.06,.06,.18), mir, s*(M.w/2+.12),.95,.55, g); }
    mesh(box(M.w-.16,.14,.08), chrome, 0,M.body[0][1]+.13,M.f, g); mesh(box(M.w-.16,.12,.08), chrome, 0,M.body[0][1]+.1,M.b+.02, g);
    if(M.bed){ for(const s of [-1,1]) mesh(box(.08,.45,1.55), body, s*(M.w/2-.04),1.28,-1.82, g); mesh(box(M.w,.45,.08), body, 0,1.28,-2.58, g); mesh(box(M.w-.1,.04,1.5), MAT.black, 0,1.08,-1.82, g); }
    if(M.spoiler){ mesh(box(1.6,.05,.3), MAT.black, 0,1.02,-2.05, g); for(const s of [-1,1]) mesh(box(.05,.18,.12), MAT.black, s*.6,.92,-2.0, g); }
    const wheels=[];
    for(const [x,z] of [[-M.w*.52,M.wz[0]],[M.w*.52,M.wz[0]],[-M.w*.52,M.wz[1]],[M.w*.52,M.wz[1]]]){
      const w=new THREE.Group(); w.position.set(x,M.wr,z); g.add(w);
      const t=mesh(new THREE.CylinderGeometry(M.wr,M.wr,.25,28), rubber, 0,0,0, w); t.rotation.z=Math.PI/2;
      const r=mesh(new THREE.CylinderGeometry(M.wr*.64,M.wr*.64,.26,18), opt.rim!=null ? (rimM[opt.rim]||(rimM[opt.rim]=new THREE.MeshStandardMaterial({color:opt.rim, metalness:.8, roughness:.25}))) : chrome, 0,0,0, w); r.rotation.z=Math.PI/2;
      wheels.push(w); }
    g.userData={wheels, r:M.wr, radius:1.2, type:'car', model:model||S.carModel||'sedan'};
    g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    return g;
  };
  /* ---------- Xe tay ga ---------- */
  V.buildBike = (color=0x2a6fdb) => {
    const g=new THREE.Group(), body=paint(color), wheels=[];
    for(const z of [.62,-.6]){ const w=new THREE.Group(); w.position.set(0,.3,z); g.add(w);
      const t=mesh(new THREE.TorusGeometry(.24,.075,10,28), rubber, 0,0,0, w); t.rotation.y=Math.PI/2;
      const r=mesh(new THREE.CylinderGeometry(.16,.16,.1,16), chrome, 0,0,0, w); r.rotation.z=Math.PI/2; wheels.push(w); }
    mesh(box(.38,.12,.9), MAT.black, 0,.38,0, g);                                  // sàn để chân
    const rear=mesh(box(.44,.42,.72), body, 0,.62,-.38, g); rear.rotation.x=.1;    // thân sau
    mesh(box(.36,.1,.66), new THREE.MeshStandardMaterial({color:0x1b1b1b, roughness:.7}), 0,.88,-.34, g); // yên
    const sh=mesh(box(.42,.75,.14), body, 0,.72,.52, g); sh.rotation.x=-.28;     // yếm trước
    mesh(new THREE.CylinderGeometry(.03,.03,.7,8), chrome, 0,.95,.62, g).rotation.x=-.3;
    const hb=mesh(new THREE.CylinderGeometry(.025,.025,.7,8), chrome, 0,1.25,.5, g); hb.rotation.z=Math.PI/2;
    mesh(box(.18,.12,.1), headL, 0,1.12,.66, g); mesh(box(.2,.06,.04), tailL, 0,.78,-.76, g);
    const m1=mesh(box(.08,.08,.08), chrome, .3,1.32,.5, g), m2=mesh(box(.08,.08,.08), chrome, -.3,1.32,.5, g); m1.castShadow=m2.castShadow=false;
    g.userData={wheels, r:.3, radius:.55, type:'bike', seatY:.86, seatZ:-.25};
    g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    return g;
  };
  /* ---------- Xe đạp (miễn phí cho người mới) ---------- */
  V.buildBicycle = (color=0x2e8f47) => {
    const g=new THREE.Group(), frame=paint(color), wheels=[];
    const tube=(a,b,r=.022,m=frame)=>{ const A=new THREE.Vector3(...a), B=new THREE.Vector3(...b), L=A.distanceTo(B); const t=mesh(new THREE.CylinderGeometry(r,r,L,8), m, (a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2, g); t.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), B.clone().sub(A).normalize()); return t; };
    for(const z of [.52,-.52]){ const w=new THREE.Group(); w.position.set(0,.34,z); g.add(w);
      const t=mesh(new THREE.TorusGeometry(.32,.025,8,32), rubber, 0,0,0, w); t.rotation.y=Math.PI/2;
      for(let i=0;i<8;i++){ const s=mesh(new THREE.CylinderGeometry(.004,.004,.62,4), chrome, 0,0,0, w); s.rotation.x=i/8*Math.PI; } wheels.push(w); }
    const BB=[0,.36,-.02], SEAT=[0,.88,-.2], HEAD=[0,.86,.38];
    tube(BB,SEAT); tube(BB,HEAD,.026); tube(SEAT,HEAD); tube(BB,[0,.34,-.52]); tube(SEAT,[0,.34,-.52],.016); tube(HEAD,[0,.34,.52],.02,chrome);
    mesh(box(.14,.05,.24), new THREE.MeshStandardMaterial({color:0x1b1b1b, roughness:.7}), 0,.93,-.22, g);
    tube([-.26,1.0,.36],[.26,1.0,.36],.016,chrome); tube(HEAD,[0,1.0,.36],.02,chrome);
    const crank=new THREE.Group(); crank.position.set(...BB); g.add(crank);
    mesh(new THREE.CylinderGeometry(.09,.09,.02,16), chrome, 0,0,0, crank).rotation.z=Math.PI/2;
    for(const s of [-1,1]){ const arm=mesh(box(.02,.17,.03), chrome, s*.07, s*.08,0, crank); mesh(box(.09,.02,.05), MAT.black, s*.11, s*.16,0, crank); }
    mesh(box(.1,.06,.05), headL, 0,.95,.42, g);
    g.userData={wheels, r:.34, radius:.5, type:'bicycle', seatY:.95, crank};
    g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    return g;
  };
  /* ---------- Thuyền máy ---------- */
  V.buildBoat = () => {
    const g=new THREE.Group(), hull=new THREE.MeshPhysicalMaterial({color:0xf4f6f8, roughness:.25, clearcoat:1});
    const s=new THREE.Shape(); s.moveTo(-.95,-1.9); s.lineTo(.95,-1.9); s.lineTo(1.0,.6); s.quadraticCurveTo(.8,1.7,0,2.3); s.quadraticCurveTo(-.8,1.7,-1.0,.6); s.lineTo(-.95,-1.9);
    const hg=new THREE.ExtrudeGeometry(s,{depth:.7, bevelEnabled:true, bevelThickness:.12, bevelSize:.12, bevelSegments:4}); hg.rotateX(Math.PI/2); hg.translate(0,.55,0);
    mesh(hg, hull, 0,0,0, g);
    mesh(box(1.7,.06,3.4), MAT.deck, 0,.56,-.1, g);
    mesh(box(1.9,.12,.12), new THREE.MeshStandardMaterial({color:0x1f7fa8, roughness:.5}), 0,.62,-1.9, g);
    mesh(box(.5,.7,.4), MAT.black, 0,.75,-2.05, g);
    const ws=mesh(box(1.3,.45,.05), tint, 0,.95,.9, g); ws.rotation.x=-.4;
    mesh(box(.6,.5,.6), new THREE.MeshStandardMaterial({color:0x1f7fa8, roughness:.5}), 0,.82,.2, g);
    g.userData={wheels:[], r:1, radius:1.4, type:'boat'};
    g.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    return g;
  };

  /* ---------- Tư thế ngồi trên xe máy (chỉnh xương sau animation) ---------- */
  const bones={}; me.g.traverse(o=>{ if(o.isBone){ for(const k of ['LeftUpLeg','RightUpLeg','LeftLeg','RightLeg','LeftArm','RightArm','LeftForeArm','RightForeArm']) if(o.name.endsWith(k)) bones[k]=o; } });
  const qx=new THREE.Quaternion(), qz=new THREE.Quaternion(), ax=new THREE.Vector3(1,0,0), az=new THREE.Vector3(0,0,1);
  function sitPose(){
    const rot=(b,axis,a)=>{ if(!bones[b]) return; (axis==='x'?qx.setFromAxisAngle(ax,a):qz.setFromAxisAngle(az,a)); bones[b].quaternion.multiply(axis==='x'?qx:qz); };
    rot('LeftUpLeg','x',-1.35); rot('RightUpLeg','x',-1.35); rot('LeftLeg','x',1.45); rot('RightLeg','x',1.45);
    rot('LeftArm','x',-.9); rot('RightArm','x',-.9); rot('LeftForeArm','x',-.3); rot('RightForeArm','x',-.3);
  }

  /* ---------- Lái xe ---------- */
  const garage={};   // xe đã sở hữu đang đỗ ngoài thế giới
  let ride=null;     // {obj, type, v, h}
  function ensure(type){ if(garage[type]) return garage[type];
    const o = type==='car' ? V.buildCar(S.carColor||0xb3122e) : type==='bike' ? V.buildBike(S.bikeColor||0x2a6fdb) : type==='bicycle' ? V.buildBicycle() : V.buildBoat();
    o.userData.dynamic=true;
    for(const w of (o.userData.wheels||[])) w.userData.keep=true; if(o.userData.crank) o.userData.crank.userData.keep=true;
    try{ compactGroup(W, o); }catch(e){ console.warn('compactGroup xe', e); }   // gộp thân xe theo vật liệu (bánh + giò đạp vẫn quay riêng)
    if(W.QP && W.QP.staticShadow){ o.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); if(type!=='boat' && W.BLOBSRC && !W.BLOBSRC.some(b=>b.o===o)) W.BLOBSRC.push({o, s:type==='car'?3.2:1.5}); }
    scene.add(o); garage[type]=o; return o; }
  V.garage=garage;
  V.riding=()=>ride;
  V.mount=(type, at)=>{
    const o=ensure(type);
    if(at){ o.position.set(at.x, type==='boat'?WATER_Y:groundAt(at.x,at.z), at.z); o.rotation.y=at.h??P.face; }
    else if(type!=='boat' && Math.hypot(o.position.x-P.x, o.position.z-P.z)>8){   // xe ở xa → gọi xe tới
      o.position.set(P.x, W.groundAtY ? W.groundAtY(P.x,P.z,P.y+.3) : groundAt(P.x,P.z), P.z); o.rotation.y=P.face; burst(new THREE.Vector3(P.x,1,P.z), [0xffffff,0x8fe3ff], 50, 3, .8, 0, .15); }
    ride={obj:o, type, v:0, h:o.rotation.y, lean:0};
    P.x=o.position.x; P.z=o.position.z; P.face=ride.h;
    if(type==='car') me.g.visible=false;
    HOOK.vehicle={drive}; HOOK.camDist = type==='car'?9:type==='boat'?10:6.8;
    cam.yaw=ride.h+Math.PI;
    toast(type==='boat' ? '🚤 Lên thuyền! W/S tăng giảm ga, A/D bẻ lái. Về bến bấm E.' : `${({car:'🚗',bike:'🛵',bicycle:'🚲'})[type]} Lên xe! W/S ga/phanh, A/D lái, Shift tăng tốc, V xuống xe.`, 4500);
  };
  V.dismount=(to)=>{
    if(!ride) return; const o=ride.obj, t=ride.type;
    me.g.visible=true; HOOK.vehicle=null; HOOK.camDist=null; me.g.rotation.set(0, ride.h, 0, 'YXZ');
    if(to){ P.x=to.x; P.z=to.z; }
    else { const side=t==='car'?1.6:.9, rx=Math.cos(ride.h), rz=-Math.sin(ride.h); P.x=o.position.x+rx*side; P.z=o.position.z+rz*side; resolve(P); }
    P.y=W.groundAtY ? W.groundAtY(P.x,P.z,P.y+.3) : groundAt(P.x,P.z); P.vx=P.vz=0; ride=null;
    if(t==='boat'){ const pk=V.boatPark; if(pk){ o.position.set(pk.x, WATER_Y, pk.z); o.rotation.y=pk.h; } }
  };
  // té xe: nhân vật ngã ngửa ra đường ~1,5 s rồi tự đứng dậy (không đưa đi chỗ khác)
  function crash(what){ if(W.ADMIN && W.ADMIN.god){ if(ride) ride.v*=-.25; return; }   // 🛡️ bảng admin: bất tử – không té xe
    const face=P.face; V.dismount(); let t=0; const gy=()=>groundAt(P.x,P.z);
    toast(`💥 Bạn đâm vào ${what} và té xe! Đứng dậy sau giây lát…`, 2600);
    HOOK.vehicle={drive(dt){ t+=dt; const down=Math.min(1,t/.3), up=t>1.4?Math.min(1,(t-1.4)/.45):0, k=down*(1-up);
      me.g.position.set(P.x, gy()+.12*k, P.z); me.g.rotation.set(-Math.PI/2*.92*k, face, .25*k, 'YXZ'); me.play('idle');
      if(t>1.9){ HOOK.vehicle=null; me.g.rotation.set(0, face, 0); } }}; }
  function drive(dt, inp){
    const r=ride, o=r.obj, ud=o.userData, boat=r.type==='boat';
    const road=!boat && (onRoad(P.x,P.z,.5) || !!(W.V2 && W.roadNet && W.roadNet.onRoad(P.x, P.z, P.y??null, 1)));   /* V2: đường mới nằm trong W.roadNet (onRoad cũ chỉ biết phố V1 → trước đây xe V2 luôn bị tính là 'ngoài đường' ×0,55) */
    /* 16/11 tối: hệ số tốc độ chung W.SPEED (chỉ V2 – ?v1 không có bảng → 1): ô tô ×1,5 · xe máy ×1,35 · xe đạp ×1,2; ga/phanh tăng theo √hệ số để vẫn dễ lái */
    const SPD=W.SPEED, K=SPD ? ((r.type==='car'?SPD.car:r.type==='bike'?SPD.moto:r.type==='bicycle'?SPD.bike:1)||1) : 1, kA=Math.sqrt(K);
    const vmax=(r.type==='car'?19*(V.carSpeed[S.carModel]||1):r.type==='bike'?14:r.type==='bicycle'?5:11)*K*(boat||road||r.type==='bicycle'?1:.55)*(inp.boost?1.18:1);
    const acc=(r.type==='car'?6.5:r.type==='bike'?7:r.type==='bicycle'?5:4)*kA;
    if(!inp.free){ inp.iz=0; inp.ix=0; }
    if(inp.iz>0) r.v+=acc*dt; else if(inp.iz<0) r.v-= (r.v>0?13*kA:acc*.6)*dt; else r.v-=Math.sign(r.v)*Math.min(Math.abs(r.v), (boat?1.5:3)*dt);
    if(r.v>vmax) r.v=Math.max(vmax, r.v-Math.max(8, acc+1)*dt); r.v=Math.max(r.v,-4);   /* ga mạnh hơn mức hãm 8 m/s² thì xe từng 'nhích' quá tốc độ tối đa */
    const steerRate=(r.type==='bike'?1.9:r.type==='car'?1.5:1.1)*clamp(Math.abs(r.v)/5,0,1)*Math.sign(r.v||1);
    r.h-=inp.ix*steerRate*dt;
    const ox=P.x, oz=P.z;
    P.px=P.x; P.pz=P.z;
    // chạy nhanh: chia nhỏ bước (≤ 0,45 m/bước) để va chạm không "xuyên" cột, tường mỏng, xe khác
    const nSub=(boat || !SPD) ? 1 : Math.min(6, Math.max(1, Math.ceil(Math.abs(r.v*dt)/.45)));
    if(boat){ P.x+=Math.sin(r.h)*r.v*dt; P.z+=Math.cos(r.h)*r.v*dt; }
    if(boat){
      const a=Math.atan2(P.z,P.x), rr=Math.hypot(P.x,P.z), minR=edgeR(a)+2;
      if(rr<minR){ P.x*=minR/rr; P.z*=minR/rr; r.v*=.6; }
      if(rr>190){ P.x*=190/rr; P.z*=190/rr; r.v*=.5; }
      const pr=V.pier; if(pr && P.x>pr.x0-1.6 && P.x<pr.x1+1.6 && P.z>pr.z0-1.6 && P.z<pr.z1){ P.x=ox; P.z=oz; r.v*=-.3; }
    } else {
      HOOK.bumped=null; for(let k=0;k<nSub;k++){ P.x+=Math.sin(r.h)*r.v*dt/nSub; P.z+=Math.cos(r.h)*r.v*dt/nSub; resolve(P, ud.radius, true); if(HOOK.bumped) break; }
      if(HOOK.bumped){ const sp=Math.abs(r.v), what=HOOK.bumped.name||'xe'; HOOK.bumped=null;   // đâm vào xe khác (xe buýt, taxi…)
        if((r.type==='bike'||r.type==='bicycle') && sp>5.5){ crash(what); return; }
        if(sp>3){ r.v*=-.25; toast(`💥 Va chạm với ${what}!`, 1600); } else r.v*=.3; }
      const moved=Math.hypot(P.x-ox,P.z-oz), want=Math.abs(r.v*dt); if(want>.001 && moved<want*.5) r.v*=.4;
    }
    const y = boat ? WATER_Y-.05+Math.sin(W.T*1.6)*.06 : (W.groundAtY ? W.groundAtY(P.x,P.z,P.y+.3) : groundAt(P.x,P.z));   /* bám đúng tầng (nút xoắn ốc, hầm, cầu 2 tầng) */
    P.y=y; P.face=r.h;
    o.position.set(P.x, y, P.z); o.rotation.y=r.h;
    r.lean=lerpAngle(r.lean, (r.type==='bike'||r.type==='bicycle') ? clamp(inp.ix*r.v*.035,-.35,.35) : boat ? Math.sin(W.T*1.3)*.04 : 0, 1-Math.exp(-dt*6));
    o.rotation.z=r.lean; if(boat) o.rotation.x=Math.cos(W.T*1.1)*.03-r.v*.006;
    for(const w of ud.wheels) w.children[0] && (w.rotation.x+=r.v*dt/ud.r);
    // người lái
    // bàn đạp: nhịp đạp thật (tối đa ~60 vòng/phút), chỉ đạp khi đang giữ ga; thả ga → thả trôi, chân đứng yên
    if(ud.crank){ const want = inp.iz>0 ? Math.min(Math.abs(r.v)*.85, 6.3) : 0; r.crankW=(r.crankW||0)+(want-(r.crankW||0))*(1-Math.exp(-dt*4)); ud.crank.rotation.x+=r.crankW*dt; }
    if(r.type==='bike'||r.type==='bicycle'){ const back=r.type==='bicycle'?.22:.3; me.g.position.set(P.x, y+ud.seatY-.95, P.z); me.g.position.x-=Math.sin(r.h)*back; me.g.position.z-=Math.cos(r.h)*back; me.g.rotation.set(0, r.h, r.lean, 'YXZ'); me.play(me.acts.ride?'ride':me.acts.sit?'sit':'idle'); }
    else if(boat){ me.g.position.set(P.x-Math.sin(r.h)*.6, y+.5, P.z-Math.cos(r.h)*.6); me.g.rotation.set(0, r.h, 0, 'YXZ'); me.play(me.acts.ride?'ride':me.acts.sit?'sit':'idle'); }
    else { me.g.position.set(P.x, y, P.z); }
    if(!W.dragging && Math.abs(r.v)>1) cam.yaw=lerpAngle(cam.yaw, r.h+Math.PI, 1-Math.exp(-dt*2.5));
    if(Math.random()<Math.abs(r.v)*dt*.6 && boat) burst(new THREE.Vector3(P.x-Math.sin(r.h)*2.2, WATER_Y+.1, P.z-Math.cos(r.h)*2.2), [0xffffff,0xcfefff], 12, 1.2, .7, -3, .12);
  }
  // tư thế ngồi trên xe máy do life.js áp (W.applyPose('ride')) – chỉnh hướng xương theo thế giới, không phụ thuộc trục xương
  // đổi mẫu xe (mua ở showroom): dựng lại xe trong garage
  V.rebuild=(type)=>{ const o=garage[type]; if(!o) return; if(ride && ride.obj===o) return; const p=o.position.clone(), h=o.rotation.y; scene.remove(o); delete garage[type]; const n=ensure(type); n.position.copy(p); n.rotation.y=h; };
  V.recolor=(type, color)=>{ const o=garage[type]; if(!o) return; o.traverse(m=>{ if(m.isMesh && m.material.isMeshPhysicalMaterial && m.material.clearcoat===1 && m.material.metalness===.55) m.material.color.set(color); }); };
  // S19g 20/11: đỗ xe đã sở hữu vào 1 ô (bãi giao xe showroom Dev City – V2) · at={x, z, y?, h?} · không đụng xe đang lái
  V.park=(type, at)=>{ if(!at || (ride && ride.type===type)) return null; const o=ensure(type); o.position.set(at.x, at.y ?? (type==='boat' ? WATER_Y : groundAt(at.x,at.z)), at.z); o.rotation.set(0, at.h ?? o.rotation.y, 0); return o; };

  return V;
}
