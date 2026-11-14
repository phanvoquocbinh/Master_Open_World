// QC World – S13: BIỂN SỐNG ĐỘNG
//  🛥️ DU THUYỀN "QC Ocean Pearl" (24 m, 2 tầng, boong gỗ, khách bot tắm nắng ở mũi, quầy bar ở đuôi, thuyền trưởng trên flybridge)
//     cập cầu tàu Bến cảng – mua vé (30 💰) lên tàu, ngồi sofa đuôi tàu đi 1 vòng vịnh phía Bắc ngắm Downtown, cáp treo, Cao nguyên
//  🏄 Người lướt ván cưỡi sóng vào bờ Đông Nam đảo rồi nằm sấp chèo ra · 🚤 mô tô nước bot chạy hình số 8 ở vịnh phía Nam (vệt bọt)
//  🪂 Ca nô kéo dù bay ngoài khơi phía Nam (người treo dưới dù)
import { makePoser } from './pose.js';

export function makeSeaLife(W, ctx){
  const {askPay, spend, ui} = ctx;
  const {THREE, scene, P, me, HOOK, INTER, PLACES, toast, mergeGeometries, makeActor, makeLabel, edgeR, WATER_Y, teleport, cam} = W;
  const TAU=Math.PI*2, R=Math.random;
  const sm=(c,r=.5,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function Kit(){ const parts=new Map(); return { add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
    build(parent){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=!m.transparent; ms.receiveShadow=true; parent.add(ms); } } }; }
  const people=W.people;
  function person(seed, outfit, name, parent){ if(!people) return null; const kk=people.kit(seed,{outfit}); const a=makeActor(kk.gl,{name, height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#4fc3ff'}); a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a), hh=po.hipsHeight(); if(parent) parent.add(a.g); return {a, po, hh, h:kk.h}; }
  const seedM=s=>people && people.pickSeed(L=>!L.female,s), seedF=s=>people && people.pickSeed(L=>L.female,s);
  const smoothPath=(pts,loop)=>{ // Catmull-Rom → mẫu đều 1 m
    const c=new THREE.CatmullRomCurve3(pts.map(([x,z])=>new THREE.Vector3(x,0,z)), loop, 'centripetal'), L=c.getLength(), n=Math.ceil(L), arr=c.getSpacedPoints(n);
    return {L, at:(s)=>{ s=loop?((s%L)+L)%L:Math.max(0,Math.min(L,s)); const f=s/L*n, i=Math.min(n-1,Math.floor(f)), t=f-i, a=arr[i], b=arr[i+1]||arr[i]; return {x:a.x+(b.x-a.x)*t, z:a.z+(b.z-a.z)*t, h:Math.atan2(b.x-a.x, b.z-a.z)}; }}; };
  const actors=[];

  /* ============================== 🛥️ DU THUYỀN ============================== */
  const yacht=new THREE.Group(); yacht.userData.dynamic=true; scene.add(yacht);
  { const k=Kit(), white=sm(0xf7f7f5,.35,.1), navy=sm(0x14284a,.4,.2), teak=sm(0xa0703f,.6,0,{side:THREE.DoubleSide}), glass=sm(0x1b2a3a,.1,.6), chrome=sm(0xd0d6de,.2,.95), cush=sm(0xf0ece2,.9), blue=sm(0x2f6fd0,.6);
    // thân tàu: mặt cắt nhìn từ trên (mũi nhọn) đùn theo chiều cao
    const sh=new THREE.Shape(); sh.moveTo(-3,-11); sh.lineTo(3,-11); sh.lineTo(3.1,4); sh.quadraticCurveTo(2.6,10,0,13); sh.quadraticCurveTo(-2.6,10,-3.1,4); sh.lineTo(-3,-11);
    const hull=new THREE.ExtrudeGeometry(sh,{depth:2.6, bevelEnabled:false, curveSegments:12}); hull.rotateX(Math.PI/2); hull.translate(0,1.6,0); k.add(hull, white);
    const stripe=new THREE.ExtrudeGeometry(sh,{depth:.35, bevelEnabled:false, curveSegments:12}); stripe.rotateX(Math.PI/2); stripe.scale(1.01,1,1.005); stripe.translate(0,.6,0); k.add(stripe, navy);
    const deck=new THREE.ShapeGeometry(sh,12); deck.rotateX(Math.PI/2); deck.translate(0,1.62,0); k.add(deck, teak);   // cùng chiều mũi tàu với thân
    // cabin tầng 1 + kính, tầng 2 + flybridge
    k.add(new THREE.BoxGeometry(5.0,2.2,11), white, 0,2.75,-1.5); k.add(new THREE.BoxGeometry(5.06,.8,10.6), glass, 0,2.95,-1.5); k.add(new THREE.BoxGeometry(4.2,.12,12.5), white, 0,3.9,-2.0);
    k.add(new THREE.BoxGeometry(3.6,1.6,5.5), white, 0,4.75,-1.0); k.add(new THREE.BoxGeometry(3.66,.6,5.2), glass, 0,4.9,-1.0); k.add(new THREE.BoxGeometry(3.4,.1,6.5), white, 0,5.6,-1.2);
    k.add(new THREE.CylinderGeometry(.06,.08,3.2,8), chrome, 0,7.2,-1.8); k.add(new THREE.BoxGeometry(1.6,.08,.3), chrome, 0,8.1,-1.8); k.add(new THREE.BoxGeometry(.6,.3,.6), white, 0,8.6,-1.8);
    // lan can quanh boong
    for(const s of [-1,1]){ k.add(new THREE.BoxGeometry(.05,.05,20), chrome, s*2.95,2.55,0.5); for(let z=-10;z<=9;z+=1.5) k.add(new THREE.BoxGeometry(.04,.9,.04), chrome, s*2.95,2.1,z); }
    // mũi: đệm tắm nắng · đuôi: sofa chữ U + quầy bar
    k.add(new THREE.BoxGeometry(3.6,.35,3.6), cush, 0,1.82,7.6); k.add(new THREE.BoxGeometry(3.4,.4,.7), blue, 0,1.9,-9.9); for(const s of [-1,1]) k.add(new THREE.BoxGeometry(.7,.4,2.6), blue, s*2.2,1.9,-8.7);
    k.add(new THREE.BoxGeometry(.6,.65,.6), white, 0,1.95,-8.6); k.add(new THREE.BoxGeometry(1.8,1.0,.5), teak, 1.4,2.1,-6.5);
    k.build(yacht); }
  const YROUTE=smoothPath([[-7,-92],[-18,-120],[25,-136],[75,-112],[110,-76],[96,-50],[55,-58],[18,-80]], true);
  const Y={s:0, v:0, dock:20, ride:false, dwell:0, h:Math.PI, nar:new Set()};
  const DOCK_S=0;   // vị trí cập bến (đầu tuyến)
  if(people){ const lie=(seed,o,x,z)=>{ const p=person(seed,o,'☀️ Khách du thuyền',yacht); if(!p) return; p.a.g.position.set(x,2.02,z); p.a.g.rotation.set(-Math.PI/2+.12,Math.PI,0,'YXZ'); actors.push(p); };
    lie(seedF(601), {shirt:0xff8fc2, shorts:true, long:false}, -.8, 8.4); lie(seedM(602), {shirt:0x2f6fd0, shorts:true, long:false}, .8, 8.4);
    for(const [i,x,z,h,s] of [[0,1.0,-5.6,Math.PI,603],[1,1.8,-5.4,-2.6,604]]){ const p=person(i?seedF(s):seedM(s), null, i?'🍹 Khách du thuyền':'🍹 Khách du thuyền', yacht); if(p){ p.a.g.position.set(x,1.62,z); p.a.g.rotation.y=h; actors.push(p); } }
    const cap=person(seedM(605), {shirt:0xffffff, pants:0x14284a, long:true, style:'cap'}, '⚓ Thuyền trưởng', yacht); if(cap){ cap.a.g.position.set(.4,5.62+.4-cap.hh,-2.4); cap.sit=true; actors.push(cap); } }
  makeLabel('🛥️ Du thuyền QC Ocean Pearl', 'Vé 30 💰 · 1 vòng vịnh ~1 phút', {h:.6, x:-7, y:9, z:-92, fade:80});
  const seatLocal=new THREE.Vector3(0,1.9,-9.2);
  function placeYacht(T){ const p=YROUTE.at(Y.s); yacht.position.set(p.x, WATER_Y-.15+Math.sin(T*1.1)*.08, p.z); yacht.rotation.set(Math.sin(T*.9)*.012, Y.h=p.h, Math.sin(T*.7)*.018, 'YXZ'); }
  INTER.push({x:-1.6, z:-92, r:3, prio:.9, when:()=>Y.dwell>0 && !Y.ride, label:'🛥️ Lên du thuyền QC Ocean Pearl – vé 30 💰 (E)', action:()=>askPay(30, '🛥️ Vé du thuyền <b>QC Ocean Pearl</b> – 1 vòng vịnh', ()=>{ if(!spend(30)) return; board(); })});
  function board(){ Y.ride=true; Y.nar.clear(); HOOK.camDist=12; me.g.visible=true;
    HOOK.vehicle={drive:(dt)=>{ const w=seatLocal.clone(); yacht.localToWorld(w); P.x=w.x; P.z=w.z; P.y=w.y; P.face=Y.h+Math.PI; me.g.position.set(w.x, w.y+.04-(me.h||1.75)*.53, w.z); me.g.rotation.set(0, Y.h+Math.PI, 0); me.play(me.acts.sit?'sit':'idle'); }};
    HOOK.vehicleInter=yInter;
    toast('🛥️ Chào mừng lên du thuyền! Tàu sẽ rời bến sau ít giây – kéo chuột để ngắm cảnh.', 4000); }
  const yInter=()=>Y.dwell>0 ? {label:'🛥️ Xuống tàu (E)', action:leave} : {label:'🛥️ Đang đi du thuyền… (cập bến mới xuống được)', action:()=>toast('Chờ tàu cập bến nhé ⚓', 1500)};
  function leave(){ Y.ride=false; HOOK.vehicle=null; HOOK.vehicleInter=null; HOOK.camDist=null; P.x=-1.4; P.z=-92; P.y=W.groundAt(P.x,P.z); P.face=Math.PI/2; me.g.rotation.set(0,P.face,0); toast('⚓ Cảm ơn quý khách đã đi du thuyền!', 2400); }
  const NARR=[[60,'🛥️ Thuyền trưởng: "Bên phải là Cao nguyên Bình Phan với thác nước 24 m!"'],[140,'🛥️ "Phía trước: Downtown QC City – nhìn lên sẽ thấy cáp treo bay qua vịnh."'],[230,'🛥️ "Bên trái là đảo Master Dashboard – nơi mọi chuyện bắt đầu!"']];
  function updYacht(dt, T){ if(Y.dwell>0){ Y.dwell-=dt; Y.v=0; if(Y.dwell<=0){ Y.s=(DOCK_S+1)%YROUTE.L; if(Y.ride) toast('🛥️ Tàu rời bến!', 1800); } }
    else { const toDock=((DOCK_S-Y.s)%YROUTE.L+YROUTE.L)%YROUTE.L; let vt=5.2; if(toDock<30) vt=Math.min(vt, Math.max(.6, toDock*.2)); Y.v+=Math.max(-1*dt, Math.min(.6*dt, vt-Y.v)); Y.s=(Y.s+Y.v*dt)%YROUTE.L;
      if(toDock<.6){ Y.s=DOCK_S; Y.dwell=22; Y.v=0; if(Y.ride){ toast('⚓ Đã cập bến – bấm E để xuống tàu, hoặc ngồi tiếp vòng sau.', 4000); } }
      if(Y.ride) for(const [s,t] of NARR) if(!Y.nar.has(s) && Y.s>s && Y.s<s+20){ Y.nar.add(s); toast(t, 4200); } }
    placeYacht(T); }

  /* ============================== 🏄 LƯỚT VÁN ============================== */
  const boardM=[0xffd23f,0xff5a6e,0x46d39a].map(c=>sm(c,.4));
  const surfers=[0,1,2].map(i=>{ const g=new THREE.Group(); g.userData.dynamic=true; scene.add(g); const bd=new THREE.Mesh(new THREE.CapsuleGeometry(.28,1.9,4,10), boardM[i]); bd.rotation.x=Math.PI/2; bd.scale.set(1,1,.25); bd.position.y=.05; g.add(bd);
    const p=person(i%2?seedF(610+i):seedM(610+i), {shirt:[0x111111,0x2f6fd0,0xff7b29][i], shorts:true, long:false}, '🏄 Người lướt ván', g); if(p){ p.a.g.position.y=.1; actors.push(p); }
    return {g, p, a:.62+i*.22, ph:R()*TAU, mode:'ride', t:R()*6}; });
  function updSurf(dt, T){ for(const s of surfers){ s.t+=dt; const e=edgeR(s.a); let r;
      if(s.mode==='ride'){ const k=Math.min(1,s.t/7); r=e+32-k*26; if(k>=1){ s.mode='paddle'; s.t=0; } }
      else { const k=Math.min(1,s.t/14); r=e+6+k*26; if(k>=1){ s.mode='ride'; s.t=0; s.a=.6+R()*.62; } }
      const carve=s.mode==='ride'?Math.sin(T*1.4+s.ph)*.04:0, a=s.a+carve, x=Math.cos(a)*r, z=Math.sin(a)*r, inward=Math.atan2(-Math.cos(a),-Math.sin(a));
      s.g.position.set(x, WATER_Y+.02+Math.sin(T*2+s.ph)*.06, z); s.g.rotation.set(0, s.mode==='ride'?inward+carve*6:inward+Math.PI, s.mode==='ride'?Math.sin(T*1.4+s.ph)*.12:0, 'YXZ');
      if(s.p){ if(s.mode==='ride'){ s.p.a.g.rotation.set(0,Math.PI/2,0); s.p.a.g.position.set(0,.1,0); } else { s.p.a.g.rotation.set(-Math.PI/2+.05,0,0); s.p.a.g.position.set(0,.22,.6); } } } }

  /* ============================== 🚤 MÔ TÔ NƯỚC (vịnh phía Nam) ============================== */
  const wakeTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), gr=g.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,'rgba(255,255,255,.9)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
  const skis=[0,1].map(i=>{ const g=new THREE.Group(); g.userData.dynamic=true; scene.add(g); const hull=new THREE.Mesh(new THREE.CapsuleGeometry(.45,2.0,4,10), sm([0xd61f2f,0x1f6fd6][i],.35,.2)); hull.rotation.x=Math.PI/2; hull.scale.set(1,1,.5); hull.position.y=.2; g.add(hull);
    const seat=new THREE.Mesh(new THREE.BoxGeometry(.4,.2,1.1), sm(0x111111,.6)); seat.position.set(0,.5,-.2); g.add(seat);
    const p=person(i?seedF(620):seedM(621), {shirt:[0xffd23f,0x46d39a][i], shorts:true, long:false}, '🚤 Mô tô nước', g); if(p){ p.a.g.position.set(0,.55-p.hh+.15,-.2); p.sit=true; actors.push(p); }
    const n=40, pos=new Float32Array(n*3), geo=new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos,3)); const pts=new THREE.Points(geo, new THREE.PointsMaterial({map:wakeTex, size:1.6, transparent:true, opacity:.7, depthWrite:false})); pts.frustumCulled=false; pts.userData.dynamic=true; scene.add(pts);
    return {g, p, ph:i*Math.PI, trail:[], pos, pts, n, acc:0}; });
  function updSkis(dt, T){ for(const k of skis){ const t=T*.32+k.ph, cx=106, cz=52, x=cx+Math.sin(t)*20, z=cz+Math.sin(t*2)*11, dx=Math.cos(t)*20, dz=Math.cos(t*2)*22;
      k.g.position.set(x, WATER_Y+.05+Math.sin(T*6+k.ph)*.04, z); k.g.rotation.set(-.08, Math.atan2(dx,dz), -Math.cos(t)*.25, 'YXZ');
      k.acc+=dt; if(k.acc>.08){ k.acc=0; k.trail.unshift([x,z]); if(k.trail.length>k.n) k.trail.pop(); }
      for(let i=0;i<k.n;i++){ const q=k.trail[i]||[x,z]; k.pos[i*3]=q[0]; k.pos[i*3+1]=WATER_Y+.06; k.pos[i*3+2]=q[1]; } k.pts.geometry.attributes.position.needsUpdate=true; } }

  /* ============================== 🪂 CA NÔ KÉO DÙ ============================== */
  const para=(()=>{ const boat=new THREE.Group(); boat.userData.dynamic=true; scene.add(boat); const hull=new THREE.Mesh(new THREE.CapsuleGeometry(.9,4,4,12), sm(0xffffff,.35,.15)); hull.rotation.x=Math.PI/2; hull.scale.set(1,1,.45); hull.position.y=.25; boat.add(hull);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(1.4,.6,1.2), sm(0x1b2a3a,.1,.6)); cab.position.set(0,.8,.6); boat.add(cab);
    const chute=new THREE.Group(); chute.userData.dynamic=true; scene.add(chute); const cols=[0xff5a6e,0xffd23f,0x46d39a,0x4fc3ff,0xc77dff,0xff7b29];
    for(let i=0;i<6;i++){ const seg=new THREE.Mesh(new THREE.SphereGeometry(3.4,8,6,i*Math.PI/3,Math.PI/3,0,Math.PI/2.6), sm(cols[i],.7,0,{side:THREE.DoubleSide})); seg.scale.set(1,.5,1); chute.add(seg); }
    const rider=person(seedF(630), {shirt:0xffffff, shorts:true, long:false}, '🪂 Người chơi dù bay', chute); if(rider){ rider.a.g.position.set(0,-4.2-rider.hh+.5,0); rider.sit=true; actors.push(rider); }
    const lineM=new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:.7}), lg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), line=new THREE.Line(lg, lineM); line.frustumCulled=false; scene.add(line);
    return {boat, chute, line}; })();
  function updPara(dt, T){ const t=T*.05, cx=-60, cz=190, x=cx+Math.cos(t)*48, z=cz+Math.sin(t)*38, h=Math.atan2(-Math.sin(t)*55, Math.cos(t)*42);
    para.boat.position.set(x, WATER_Y+.05, z); para.boat.rotation.y=h; const back=[-Math.sin(h)*40, -Math.cos(h)*40];
    para.chute.position.set(x+back[0], 26+Math.sin(T*.6)*2, z+back[1]); para.chute.rotation.y=h;
    const a=para.line.geometry.attributes.position; a.setXYZ(0, x-Math.sin(h)*2, WATER_Y+1.2, z-Math.cos(h)*2); a.setXYZ(1, para.chute.position.x, para.chute.position.y-3.8, para.chute.position.z); a.needsUpdate=true; }

  /* ============================== khung hình ============================== */
  HOOK.onFrame.push((dt, T)=>{ dt=Math.min(dt,.1);
    updYacht(dt, T); if(W.inside) return;
    const near=(x,z,r)=>Math.hypot(P.x-x,P.z-z)<r;
    if(near(0,0,170)) updSurf(dt, T);
    if(near(106,52,160)) updSkis(dt, T);
    if(near(-60,190,200)) updPara(dt, T);
    for(const p of actors){ const wp=p.a.g.getWorldPosition(_p); const d=Math.hypot(P.x-wp.x,P.z-wp.z); if(d<90){ p.a.mixer.update(dt); if(p.sit) p.po.apply('sit', T); } }
    if(Y.ride){ HOOK.vehicleInter=yInter; if(W.applyPose) W.applyPose('sit'); } });   // life.js xoá vehicleInter mỗi khung → đặt lại
  PLACES.push({icon:'🛥️', name:'Du thuyền QC Ocean Pearl', sub:'Bến cảng · vé 30 💰 · 1 vòng vịnh ngắm thành phố', go:()=>teleport(-1.4, -84, -1.4, -95)});
  return {yacht:Y, surfers, skis, para};
}
