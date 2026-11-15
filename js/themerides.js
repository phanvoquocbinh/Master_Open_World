// QC World – 5 TRÒ CHƠI ĐỢT 1 của Công viên Kỳ Quan (A23, phiên đồ hoạ 15/11/2026) – gọi từ js/themepark.js
//  🐉 Thần Long Cuồng Nộ · 🚀 Tia Chớp Không Gian · 🦅 Song Dực Đại Bàng (2 đường đua) · ⚡ Tháp Sấm Sét 80 m · 🎡 Mắt Thần QC World 90 m
// Quy trình chung: cổng tên trò → quầy vé + cổng soát vé (E trả tiền, thanh chắn mở) → hàng rào xếp hàng zíc-zắc → sân ga → tàu vào ga,
// bấm E thì nhân vật TỰ ĐI BỘ lên ghế, đai an toàn hạ xuống → chạy → về ga, đai mở, bước xuống → ra theo lối ra một chiều. Không có dịch chuyển tức thời.
// Góc nhìn: Q đổi thứ nhất/thứ ba; góc nhìn thứ nhất bám theo khung của toa tàu (lộn vòng thật) qua HOOK.fpvCam (world.html).
import { TRACKS, mirrorZ, frameAt, physStep } from './coastertrack.js';
import { boxM, cylM, cbox, planeM } from './gfxkit.js';

export function makeRides(T){
  const {W, GF, M, G0, WY, TOWER, WHEEL, kF, kL, kN, gFar, gLand, gMid, gNear, hf, paved, pay, glow, fence, sign, pln, flat, lamp} = T;
  const {THREE, P, me, HOOK, INTER, PLACES, toast, circles, boxes, addPlat, addSeg, makeLabel, makeActor, cam, clamp, lerp, teleport, mergeGeometries} = W;
  const TAU=Math.PI*2, LOW=W.QUAL==='low', V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z), paint=(c,r=.45,m=.3)=>M.paint(c,r,m);
  const ride={kind:null, eye:null, inter:null}, tix={}, BLK=[], CELL=new Set(), cellKey=(x,z)=>Math.round(x/6)+','+Math.round(z/6);
  const _a=V3(), _b=V3(), _c=V3(), _f=V3(), _u=V3(), _r=V3(), _mx=new THREE.Matrix4(), _qa=new THREE.Quaternion(), _qb=new THREE.Quaternion(), _eu=new THREE.Euler(), _one=V3(1,1,1);

  /* ============================== ÂM THANH (tự tạo bằng WebAudio) ============================== */
  const AU={c:null, w:null}; function ac(){ if(AU.c) return AU.c; if(!(navigator.userActivation && navigator.userActivation.hasBeenActive)) return null; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null; try{ AU.c=new AC(); }catch(e){ return null; } return AU.c; }
  function noise(vol=.2, dur=1, f0=400, f1=2400){ const c=ac(); if(!c) return; const n=c.createBuffer(1,Math.max(1,c.sampleRate*dur|0),c.sampleRate), d=n.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const s=c.createBufferSource(); s.buffer=n; const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.setValueAtTime(f0,c.currentTime); f.frequency.exponentialRampToValueAtTime(f1,c.currentTime+dur);
    const g=c.createGain(); g.gain.setValueAtTime(0,c.currentTime); g.gain.linearRampToValueAtTime(vol,c.currentTime+dur*.15); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur); s.connect(f); f.connect(g); g.connect(c.destination); s.start(); }
  function tone(f0, f1, dur=.3, vol=.12, type='sine'){ const c=ac(); if(!c) return; const o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.setValueAtTime(f0,c.currentTime); o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),c.currentTime+dur);
    g.gain.setValueAtTime(vol,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+dur+.02); }
  function wind(k){ const c=ac(); if(!c) return; if(!AU.w){ if(k<=0) return; const n=c.createBuffer(1,c.sampleRate*2,c.sampleRate), d=n.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
      const s=c.createBufferSource(); s.buffer=n; s.loop=true; const f=c.createBiquadFilter(); f.type='lowpass'; const g=c.createGain(); g.gain.value=0; s.connect(f); f.connect(g); g.connect(c.destination); s.start(); AU.w={f,g}; }
    AU.w.g.gain.setTargetAtTime(clamp(k,0,1)*.32, c.currentTime, .12); AU.w.f.frequency.setTargetAtTime(250+clamp(k,0,1)*3600, c.currentTime, .12); }
  const chime=()=>{ tone(880,1320,.18,.1); setTimeout(()=>tone(1320,1760,.22,.1),140); };

  /* ============================== NGƯỜI CHƠI TRÊN TRÒ CHƠI ============================== */
  let camRef=null, fov0=null; const look={y:0, p:0, cy:null, cp:null};
  // góc nhìn thứ nhất bám khung toa tàu: ride.eye() → {pos, t (hướng tới), u (đỉnh đầu), v (m/s)}; kéo chuột nhìn quanh so với hướng tàu
  HOOK.fpvCam=(dt,camera)=>{ const o=ride.eye && ride.eye(); if(!o) return false; camRef=camera; if(fov0===null) fov0=camera.fov;
    if(look.cy===null){ look.cy=cam.yaw; look.cp=cam.pitch; look.y=0; look.p=0; }
    look.y+=cam.yaw-look.cy; look.p=clamp(look.p+cam.pitch-look.cp,-1.25,1.25); look.cy=cam.yaw; look.cp=cam.pitch;
    _f.copy(o.t).normalize(); _r.crossVectors(_f,o.u).normalize(); _u.crossVectors(_r,_f); _mx.makeBasis(_r,_u,_c.copy(_f).negate());
    camera.quaternion.setFromRotationMatrix(_mx).multiply(_qb.setFromEuler(_eu.set(-look.p,look.y,0,'YXZ'))); camera.position.copy(o.pos);
    if(ride.shake>0){ camera.position.x+=(Math.random()-.5)*ride.shake*.16; camera.position.y+=(Math.random()-.5)*ride.shake*.16; camera.position.z+=(Math.random()-.5)*ride.shake*.16; }
    const fv=66+Math.min(16,(o.v||0)*.42); camera.fov+=(fv-camera.fov)*Math.min(1,dt*4); camera.updateProjectionMatrix();
    if(me.root.visible) me.root.visible=false; cam.tx=P.x; cam.ty=P.y+1.45; cam.tz=P.z; return true; };
  const VINT=()=>ride.inter?ride.inter():null;
  function start(kind){ ride.kind=kind; look.cy=null; HOOK.vehicle={drive:()=>{}}; HOOK.vehicleInter=VINT; }
  function end(x,z,y,face){ ride.kind=null; ride.eye=null; ride.inter=null; HOOK.vehicle=null; HOOK.vehicleInter=null; HOOK.camOverride=null; HOOK.camDist=null; me.g.visible=true; me.root.visible=true;
    if(camRef && fov0!==null){ camRef.fov=fov0; camRef.updateProjectionMatrix(); } fov0=null; wind(0);
    P.x=x; P.z=z; P.y=y??W.groundAt(x,z); P.vx=P.vz=0; if(P.vy!==undefined) P.vy=0; if(face!==undefined) P.face=face; me.g.rotation.set(0,P.face,0); me.g.position.set(P.x,P.y,P.z); me.play('idle'); }
  // đặt nhân vật ngồi: hip = điểm hông, f = hướng mặt, u = đỉnh đầu
  function sit(hip,f,u){ P.x=hip.x; P.z=hip.z; P.y=hip.y; P.vx=P.vz=0; P.face=Math.atan2(f.x,f.z); _r.crossVectors(u,f).normalize(); _mx.makeBasis(_r,u,f); me.g.quaternion.setFromRotationMatrix(_mx);
    me.g.position.copy(hip).addScaledVector(u,.04-(me.h||1.75)*.53); me.play(me.acts.sit?'sit':'idle'); ride.seated=true; }
  // đi bộ theo kịch bản tới (x,z) ở cao độ y; trả true khi tới nơi
  function walkTo(x,z,y,dt,sp=2.3){ const dx=x-P.x, dz=z-P.z, d=Math.hypot(dx,dz); ride.seated=false; if(d<.08){ P.x=x; P.z=z; P.y=y; me.g.position.set(x,y,z); return true; }
    const st=Math.min(d,sp*dt); P.x+=dx/d*st; P.z+=dz/d*st; P.y=y; P.face=Math.atan2(dx,dz); me.g.rotation.set(0,P.face,0); me.g.position.set(P.x,P.y,P.z); me.play('walk'); return false; }
  const chase={pos:V3(), look:V3(), k:7};
  function npc(x,y,z,face,role,i){ if(!W.people) return null; try{ const sd=W.people.pickSeed(L=>i%2?L.female:!L.female, 950+i), kk=W.people.kit(sd,{}); const a=makeActor(kk.gl,{name:`${W.people.nameOf(sd)} · ${role}`, height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#58c7ff'});
      a.g.position.set(x,y,z); a.g.rotation.y=face; a.play('idle',0); return a; }catch(e){ return null; } }

  /* ============================== CỔNG SOÁT VÉ · HÀNG RÀO XẾP HÀNG ============================== */
  const TS=[], BARMAX=24, barG=new THREE.BoxGeometry(1.25,.06,.06); barG.translate(.62,0,0);
  const barIM=new THREE.InstancedMesh(barG,paint(0xd9dde3,.3,.8),BARMAX), litIM=new THREE.InstancedMesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),BARMAX); let nBar=0;
  for(const im of [barIM,litIM]){ im.count=0; im.frustumCulled=false; im.userData.dynamic=true; gNear.add(im); }
  const RED=new THREE.Color(0xff3b30), GRN=new THREE.Color(0x35e06a);
  // dãy cổng soát vé: khung cục bộ (gốc X,Z; xoay ry; mir = lật trái/phải); cổng nằm trên đường lz = 0, rộng n làn (1,6 m/làn), khách đi từ lz > 0 vào lz < 0
  function gateLine(o){ const {id, name, price, icon, col, n=3}=o, c=Math.cos(o.ry), s=Math.sin(o.ry), mx=o.mir?-1:1, at=(lx,lz)=>[o.x+mx*lx*c+lz*s, o.z-mx*lx*s+lz*c], loc=(x,z)=>{ const dx=x-o.x, dz=z-o.z; return [mx*(dx*c-dz*s), dx*s+dz*c]; };
    const put=(k,geo,mat,lx,y,lz,ry2=0,rx=0)=>{ const [x,z]=at(lx,lz); return k.add(geo,mat,x,G0+y,z,o.ry+ry2,rx); }, w=n*1.6, t={id, loc, segs:[], i0:nBar, n, k:0, w, bars:[]};
    for(let i=0;i<=n;i++){ put(kN,cbox(.3,1.02,1.3,.03),M.whiteAlu,i*1.6,.51,0); put(kN,cbox(.32,.05,1.34,.01),paint(col,.4),i*1.6,1.05,0); const [x,z]=at(i*1.6,0); circles.push({x,z,r:.2}); }
    for(let i=0;i<n;i++){ const [ax,az]=at(i*1.6+.15,0), [bx,bz]=at(i*1.6+1.45,0); t.segs.push(addSeg(ax,az,bx,bz,.12,undefined,undefined,`🎟 Cổng soát vé ${name} – bấm E để mua vé (${price} 💰), thanh chắn sẽ mở`)); const [px,pz]=at(i*1.6+.16,0), [lx,lz]=at(i*1.6,.5); t.bars.push({px,pz,lx,lz}); nBar++; }
    barIM.count=litIM.count=nBar;
    // quầy vé (quầy mở, thấy nhân viên) bên cạnh
    const bx=o.bx??w+2.0, bz=o.bz||0; put(kN,boxM(2.6,1.05,.5),M.plasterC(0xf6efe2),bx,.525,bz+1.5); put(kN,cbox(2.8,.07,.8,.02),M.woodLight,bx,1.09,bz+1.5); put(kN,boxM(2.6,2.6,.2),M.plasterC(0xf6efe2),bx,1.3,bz-1.1); for(const e of [-1,1]) put(kN,boxM(.2,2.6,1.4),M.plasterC(0xf6efe2),bx+e*1.2,1.3,bz-.5);
    put(kN,boxM(3.2,.2,3.4),paint(col,.5),bx,2.72,bz+.3); put(kN,pln(2.4,.6),sign('🎟 QUẦY VÉ · '+price+' 💰',{fg:'#fff7e6', key:'tk', w:512, h:128, night:1.3, day:.3}),bx,2.3,bz+1.78);
    { const [x0,z0]=at(bx-1.4,bz-1.3), [x1,z1]=at(bx+1.4,bz+1.8); boxes.push({x0:Math.min(x0,x1), x1:Math.max(x0,x1), z0:Math.min(z0,z1), z1:Math.max(z0,z1), msg:'🎟 Quầy vé '+name}); const [nx,nz]=at(bx,bz+.35), d=at(bx,bz+3); npc(nx,G0,nz,Math.atan2(d[0]-nx,d[1]-nz),'nhân viên soát vé '+name,TS.length); }
    // CỔNG TÊN TRÒ cao 8,5 m ở lz = +4,5: 2 trụ + xà + bảng tên phát sáng + bảng LED thời gian chờ / giá vé
    const mz=o.mz??4.5, cxm=o.mcx??w/2, hw=Math.max(4.2,w/2+1.6); for(const e of [-1,1]){ put(kF,boxM(1,7.6,1),paint(col,.5),cxm+e*hw,3.8,mz); put(kF,boxM(1.3,.5,1.3),paint(0x20242b,.5),cxm+e*hw,.25,mz); const [x,z]=at(cxm+e*hw,mz); circles.push({x,z,r:.75}); }
    put(kF,boxM(hw*2+1.6,1.9,1.1),paint(0x161a22,.5),cxm,7.75,mz); put(kF,boxM(hw*2+2,.3,1.4),paint(col,.4),cxm,8.85,mz);
    for(const f of [1,-1]){ put(kF,pln(hw*2+.8,1.45),sign(icon+' '+name.toUpperCase(),{fg:o.fg||'#ffe9a8', key:'mq'+id, w:1024, h:190, night:2.0, day:.45}),cxm,7.8,mz+f*.56,f>0?0:Math.PI);
      put(kF,pln(hw*1.5,.62),sign(`⏱ Thời gian chờ: ${o.wait||'5'} phút   ·   🎟 Giá vé: ${price} 💰`,{bg:'#06120c', fg:'#7dff9a', key:'led'+id, w:1024, h:110, night:1.6, day:.5}),cxm,6.38,mz+f*.3,f>0?0:Math.PI); }
    put(kF,boxM(hw*1.5+.2,.78,.5),paint(0x0d1014,.5),cxm,6.38,mz); if(o.top) o.top(put,cxm,mz,hw);
    const [ix,iz]=at(w/2,1.9); INTER.push({x:ix, z:iz, r:3, prio:.9, when:()=>!ride.kind && !tix[id], label:`🎟 Mua vé ${icon} ${name} – ${price} 💰 (E)`, action:()=>pay(price, `🎟 Vé <b>${name}</b>`, ()=>{ tix[id]=true; chime(); toast(`🎟 Đã có vé ${name}! Cổng soát vé mở – đi theo hàng rào vào sân ga.`, 3600); })});
    const [lbx,lbz]=at(cxm,mz); makeLabel(icon+' '+name, o.sub||'', {h:.55, x:lbx, y:G0+11, z:lbz, fade:150});
    PLACES.push({icon, name:'Công viên Kỳ Quan · '+name, sub:o.sub||'', go:()=>{ const a=at(cxm,mz+7), b=at(cxm,mz); teleport(a[0],a[1],b[0],b[1]); }});
    TS.push(t); return {at, loc, put, w}; }
  // khu xếp hàng zíc-zắc 3 làn × 12 m có mái che + dãy cổng soát vé ở lz = 15,5; lối ra khu xếp hàng ở (0…1,6 ; 0) đi về phía lz < 0
  function entry(o){ const c=Math.cos(o.ry), s=Math.sin(o.ry), mx=o.mir?-1:1, at=(lx,lz)=>[o.x+mx*lx*c+lz*s, o.z-mx*lx*s+lz*c], F=(pts,opt)=>fence(pts.map(p=>at(p[0],p[1])),opt);
    F([[4.8,0],[4.8,15.5]]); F([[0,0],[0,15.5]]); F([[1.6,0],[4.8,0]]); F([[3.2,1.7],[3.2,12]]); F([[1.6,0],[1.6,10.3]]); F([[0,12],[3.2,12]]);
    for(const [lx,lz] of [[-.25,.2],[5.05,.2],[-.25,6],[5.05,6],[-.25,11.8],[5.05,11.8]]){ const [x,z]=at(lx,lz); kN.add(cylM(.07,.07,3.1,8),M.whiteAlu,x,G0+1.55,z); }
    { const [x,z]=at(2.4,6); kN.add(boxM(5.9,.07,12.4),M.fabricC(o.col),x,G0+3.12,z,o.ry); kN.add(boxM(6.1,.16,.16),M.whiteAlu,x,G0+3.02,z,o.ry); }
    const [gx,gz]=at(0,15.5), g=gateLine({...o, x:gx, z:gz, n:3});
    const xs=[at(-2,0),at(8,0),at(-2,22),at(8,22)]; BLK.push([Math.min(...xs.map(p=>p[0]))-2, Math.max(...xs.map(p=>p[0]))+2, Math.min(...xs.map(p=>p[1]))-2, Math.max(...xs.map(p=>p[1]))+2]);
    return {at, gate:g}; }
  function updGates(dt){ for(const t of TS){ const [lx,lz]=t.loc(P.x,P.z), want=(tix[t.id] && lz>-.9 && lz<14 && lx>-6 && lx<t.w+6)?1:0; if(t.k===want && t.done) continue; t.k=clamp(t.k+(want?1:-1)*dt*3,0,1); t.done=t.k===want;
      t.segs.forEach((sg,i)=>{ sg.y0=t.k>.6?1e9:undefined; const b=t.bars[i]; _qa.setFromEuler(_eu.set(0,0,-t.k*1.45,'YXZ')); _qb.setFromAxisAngle(_a.set(0,1,0),Math.atan2(-(sg.bz-sg.az),sg.bx-sg.ax));
        _mx.compose(_b.set(b.px,G0+.92,b.pz),_qb.multiply(_qa),_one); barIM.setMatrixAt(t.i0+i,_mx); _mx.compose(_b.set(b.lx,G0+1.14,b.lz),_qa.identity(),_one); litIM.setMatrixAt(t.i0+i,_mx); litIM.setColorAt(t.i0+i,t.k>.6?GRN:RED); });
      barIM.instanceMatrix.needsUpdate=true; litIM.instanceMatrix.needsUpdate=true; if(litIM.instanceColor) litIM.instanceColor.needsUpdate=true; } }
  // cổng RA một chiều: đoạn chắn chỉ chặn người đứng NGOÀI (inside(x,z) = đang ở phía trong)
  const EXITS=[]; function exitGate(a,b,inside,name){ const sg=addSeg(a[0],a[1],b[0],b[1],.12,undefined,undefined,`🚪 Lối RA một chiều của ${name} – vào bằng cổng soát vé`); EXITS.push({sg,inside});
    for(const p of [a,b]) kN.add(boxM(.14,2.3,.14),railM2,p[0],G0+1.15,p[1]); const L=Math.hypot(b[0]-a[0],b[1]-a[1]), ry=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2;
    kN.add(boxM(L,.5,.08),paint(0x1f7a45,.5),(a[0]+b[0])/2,G0+2.35,(a[1]+b[1])/2,ry); for(const f of [0,Math.PI]) kN.add(pln(L*.9,.4),sign('LỐI RA  →',{fg:'#eafff0', key:'exit', w:512, h:96, night:1.2, day:.35}),(a[0]+b[0])/2+Math.sin(ry+f)*.05,G0+2.35,(a[1]+b[1])/2+Math.cos(ry+f)*.05,ry+f); }
  const railM2=paint(0x2b3038,.45,.6);

  /* ============================== ĐƯỜNG RAY · TRỤ ĐỠ · TOA TÀU ============================== */
  const cr=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  // lưới ray: 2 ống ray + xương sống + tà vẹt, tô màu theo đỉnh (1 lượt vẽ / đường ray)
  function trackMesh(tr,o){ const N=tr.N, RS=5, SS=6, pos=[], nor=[], col=[], idx=[], cR=new THREE.Color(o.rail), cS=new THREE.Color(o.spine), cT=new THREE.Color(o.tie??o.spine), so=o.inv?.55:-.55;
    const ring=(c,L,U,r,n,cc)=>{ for(let k=0;k<n;k++){ const a=k/n*TAU, ca=Math.cos(a), sa=Math.sin(a), nx=L[0]*ca+U[0]*sa, ny=L[1]*ca+U[1]*sa, nz=L[2]*ca+U[2]*sa; pos.push(c[0]+nx*r,c[1]+ny*r,c[2]+nz*r); nor.push(nx,ny,nz); col.push(cc.r,cc.g,cc.b); } };
    // lấy mẫu thưa ở đoạn thẳng / cong nhẹ (2 m), dày ở đoạn cong gắt (1 m) → bớt ~1/3 số tam giác mà vòng lộn vẫn tròn
    const skp=o.railSkip||(()=>false), ix=[]; for(let i=0;i<N;){ if(tr.Z[i]==='dup' || skp(i)){ i++; continue; } ix.push(i); const j=(i+2)%N, t=tr.T[i], t2=tr.T[j], u=tr.U[i], u2=tr.U[j]; i+=(i+2<N && tr.Z[i+1]!=='dup' && tr.Z[j]!=='dup' && t[0]*t2[0]+t[1]*t2[1]+t[2]*t2[2]>.9976 && u[0]*u2[0]+u[1]*u2[1]+u[2]*u2[2]>.995)?2:1; }
    for(const i of ix){ const p=tr.P[i], u=tr.U[i], L=cr(u,tr.T[i]); for(const sg of [-1,1]) ring([p[0]+L[0]*sg*.55,p[1]+L[1]*sg*.55,p[2]+L[2]*sg*.55],L,u,.075,RS,cR); ring([p[0]+u[0]*so,p[1]+u[1]*so,p[2]+u[2]*so],L,u,.24,SS,cS); }
    const per=RS*2+SS, NI=ix.length; for(let i=0;i<NI;i++){ if(((ix[(i+1)%NI]-ix[i]+N)%N)>3) continue; const a=i*per, b=((i+1)%NI)*per, tube=(off,n)=>{ for(let k=0;k<n;k++){ const k2=(k+1)%n; idx.push(a+off+k,a+off+k2,b+off+k, a+off+k2,b+off+k2,b+off+k); } }; tube(0,RS); tube(RS,RS); tube(RS*2,SS); }
    // tà vẹt: hộp nối 2 ray + bản nối xuống xương sống (mỗi 2 m)
    const obox=(c,ax,ay,az,hx,hy,hz,cc)=>{ const b=pos.length/3, A=[ax,ay,az], Hh=[hx,hy,hz]; for(let f=0;f<6;f++){ const n=f>>1, sg=f&1?1:-1, u2=(n+1)%3, v2=(n+2)%3;
        for(const [su,sv] of [[-1,-1],[1,-1],[1,1],[-1,1]]){ pos.push(c[0]+A[n][0]*sg*Hh[n]+A[u2][0]*su*Hh[u2]+A[v2][0]*sv*Hh[v2], c[1]+A[n][1]*sg*Hh[n]+A[u2][1]*su*Hh[u2]+A[v2][1]*sv*Hh[v2], c[2]+A[n][2]*sg*Hh[n]+A[u2][2]*su*Hh[u2]+A[v2][2]*sv*Hh[v2]); nor.push(A[n][0]*sg,A[n][1]*sg,A[n][2]*sg); col.push(cc.r,cc.g,cc.b); }
        const q=b+f*4; if(sg>0) idx.push(q,q+1,q+2,q,q+2,q+3); else idx.push(q,q+2,q+1,q,q+3,q+2); } };
    for(let i=0;i<N;i+=3){ if(tr.Z[i]==='dup' || skp(i)) continue; const p=tr.P[i], u=tr.U[i], t=tr.T[i], L=cr(u,t); obox([p[0]-u[0]*.06*Math.sign(-so),p[1]-u[1]*.06*Math.sign(-so),p[2]-u[2]*.06*Math.sign(-so)],L,u,t,.6,.035,.07,cT); if(i%6===0) obox([p[0]+u[0]*so*.5,p[1]+u[1]*so*.5,p[2]+u[2]*so*.5],L,u,t,.06,.2,.06,cT);
      const z=tr.Z[i]; if(z==='lift'||z==='launch'||z==='brake') obox([p[0]+u[0]*.02,p[1]+u[1]*.02,p[2]+u[2]*.02],L,u,t,.14,.05,.5,z==='lift'?cT:new THREE.Color(z==='launch'?0x29d3ff:0xc0862a)); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeBoundingSphere();
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true, roughness:.42, metalness:.45})); m.castShadow=true; m.userData.noFar=true; gLand.add(m);
    for(let i=0;i<N;i+=3) if(tr.P[i][1]<G0+15) CELL.add(cellKey(tr.P[i][0],tr.P[i][2])); return m; }
  const beamG=(a,b,r0,r1,n=7)=>{ _a.set(a[0],a[1],a[2]); _b.set(b[0],b[1],b[2]); const L=_a.distanceTo(_b), g=new THREE.CylinderGeometry(r1,r0,L,n,1,true); _qa.setFromUnitVectors(_c.set(0,1,0),_f.copy(_b).sub(_a).normalize()); _mx.compose(_r.copy(_a).add(_b).multiplyScalar(.5),_qa,_one); g.applyMatrix4(_mx); return g; };
  const beam=(k,mat,a,b,r0,r1=r0,n=7)=>k.add(beamG(a,b,r0,r1,n),mat);
  const inBLK=(x,z)=>BLK.some(b=>x>b[0] && x<b[1] && z>b[2] && z<b[3]);
  // trụ đỡ: cột đơn (thấp) hoặc chữ A (cao) dưới ray; tàu treo: cột bên hông + tay đỡ phía trên ray. Bỏ trụ nào đâm vào đoạn ray khác / lối đi / sân ga.
  function supports(tr,o,others=[]){ const N=tr.N, mat=paint(o.sup,.5,.35), step=LOW?12:9, all=[tr,...others];
    const clearCol=(x,z,y0,y1,i,self)=>{ for(const t2 of all){ for(let j=0;j<t2.N;j+=2){ if(t2===self){ const d=Math.abs(j-i); if(Math.min(d,N-d)<14) continue; } const q=t2.P[j]; if(q[1]>y0+.5 && q[1]<y1+1.2 && Math.hypot(q[0]-x,q[2]-z)<(o.inv?2.6:1.9)) return false; } } return true; };
    const legClear=(a,b,i,self)=>{ const ns=Math.max(8,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/1.1)); for(let k=1;k<=ns;k++){ const f=k/(ns+1), x=a[0]+(b[0]-a[0])*f, y=a[1]+(b[1]-a[1])*f, z=a[2]+(b[2]-a[2])*f; for(const t2 of all){ for(let j=0;j<t2.N;j+=2){ if(t2===self){ const d=Math.abs(j-i); if(Math.min(d,N-d)<10) continue; } const q=t2.P[j], dx=q[0]-x, dz=q[2]-z, dy=q[1]-y; if(dx*dx+dz*dz<(o.inv?9:5.3) && dy>(o.inv?-4:-1.6) && dy<(o.inv?1.6:3.2)) return false; } } } return true; };
    for(let i=4;i<N;i+=step){ const p=tr.P[i], u=tr.U[i], t=tr.T[i], L=cr(u,t), lh=Math.hypot(L[0],L[2])||1, Lh=[L[0]/lh,0,L[2]/lh]; if(tr.Z[i]==='dup' || (o.noSup && o.noSup(p,i))) continue;
      if(o.inv){ if(u[1]<.55) continue; const sg=o.side(L), bx=p[0]+Lh[0]*sg*2.4, bz=p[2]+Lh[2]*sg*2.4, gy=hf(bx,bz), top=p[1]+1.35; if(gy<.3 || top-gy<1 || inBLK(bx,bz) || paved(bx,bz,-.6) || !clearCol(bx,bz,gy,top,i,tr)) continue;
        beam(kL,mat,[bx,gy-.2,bz],[bx,top,bz],top-gy>20?.4:.3,.24); beam(kL,mat,[bx,top-.15,bz],[p[0]+u[0]*.6,p[1]+u[1]*.6,p[2]+u[2]*.6],.2,.16); kF.add(boxM(1.1,.3,1.1),M.conc,bx,gy+.1,bz); circles.push({x:bx,z:bz,r:.5}); continue; }
      if(u[1]<.3) continue; const ax=p[0]-u[0]*.78, ay=p[1]-u[1]*.78, az=p[2]-u[2]*.78, gy=hf(ax,az), h=ay-gy; if(gy<.3 || h<.9 || inBLK(ax,az) || paved(ax,az,-.6)) continue;
      if(h>15){ const sp=Math.min(9,h*.17), f1=[ax+Lh[0]*sp,0,az+Lh[2]*sp], f2=[ax-Lh[0]*sp,0,az-Lh[2]*sp]; f1[1]=hf(f1[0],f1[2]); f2[1]=hf(f2[0],f2[2]); if(f1[1]<.3 || f2[1]<.3 || !legClear(f1,[ax,ay,az],i,tr) || !legClear(f2,[ax,ay,az],i,tr) || paved(f1[0],f1[2],-.5) || paved(f2[0],f2[2],-.5)) continue;
        const r=h>40?.42:.32; for(const f of [f1,f2]){ beam(kL,mat,[f[0],f[1]-.2,f[2]],[ax,ay,az],r,r*.75); kF.add(boxM(1.2,.3,1.2),M.conc,f[0],f[1]+.1,f[2]); circles.push({x:f[0],z:f[2],r:.55}); }
        for(const k of h>34?[.3,.55,.78]:[.45,.75]){ const a=[lerp(f1[0],ax,k),lerp(f1[1],ay,k),lerp(f1[2],az,k)], b=[lerp(f2[0],ax,k),lerp(f2[1],ay,k),lerp(f2[2],az,k)]; beam(kL,mat,a,b,.13,.13,5); } continue; }
      if(!clearCol(ax,az,gy,ay-1.5,i,tr)) continue; beam(kL,mat,[ax,gy-.2,az],[ax,ay,az],h>8?.3:.22,h>8?.24:.2); kF.add(boxM(.9,.3,.9),M.conc,ax,gy+.1,az); circles.push({x:ax,z:az,r:.42}); } }
  // rào dọc các đoạn ray sát đất (người không bao giờ đi vào đường tàu)
  function lowFence(tr,lim,skip){ const N=tr.N; let run=null; const flush=()=>{ if(run && run.length>1) for(const sg of [-1,1]){ const pts=[]; for(const i of run){ const p=tr.P[i], L=cr(tr.U[i],tr.T[i]), lh=Math.hypot(L[0],L[2])||1; const off=1.75+1.9*Math.hypot(tr.U[i][0],tr.U[i][2]); pts.push([p[0]+L[0]/lh*sg*off,p[2]+L[2]/lh*sg*off]); }
        fence(pts,{h:1.3, msg:'⚠️ Khu vực đường ray – không vào. Lên tàu ở sân ga'}); } run=null; };
    for(let i=0;i<=N;i+=3){ const j=i%N; if(tr.P[j][1]<lim && tr.Z[j]!=='dup' && !skip(j,tr.P[j])){ (run=run||[]).push(j); } else flush(); } flush(); }
  // hình toa tàu (tô màu theo đỉnh). inv: tàu treo (ghế treo dưới ray); riders: có hình khách ngồi sẵn
  function carGeo(o,riders,ps=1){ const parts=[], cc=new THREE.Color(), add=(g,c,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{ _mx.compose(_a.set(x,y,z),_qa.setFromEuler(_eu.set(rx,ry,rz,'YXZ')),_one); g.applyMatrix4(_mx); cc.set(c); const n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=cc.r; a[i*3+1]=cc.g; a[i*3+2]=cc.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); parts.push(g); };
    const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), sy=o.inv?-1.9:.5, SH=[0xd94f4f,0x3f8fd9,0x4fb86a,0xe0b23a];
    if(o.inv){ add(B(1.25,.34,2.35),0x23272e,0,-.3,0); add(B(.5,.5,.9),o.body,0,-.3,1.3,.5); for(const z of [.5,-.6]){ add(B(.14,1.2,.14),0x23272e,0,-1.05,z-.28); add(B(1.5,.12,.12),0x23272e,0,-1.0,z-.28); }
      for(const sx of [-1,1]) add(B(.06,.5,1.7),o.body2,sx*.86,-1.35,-.1,0,0,sx*.5); }
    else { add(B(1.3,.26,2.4),0x23272e,0,.2,0); add(B(1.46,.1,2.4),o.body,0,.36,0); for(const sx of [-1,1]) add(B(.09,.52,2.4),o.body,sx*.73,.62,0); add(B(1.46,.5,.22),o.body,0,.56,1.2,-.25); add(B(1.3,.1,.5),o.body2,0,.78,1.02,.3); add(B(1.46,.5,.12),o.body2,0,.6,-1.2);
      if(o.style==='jeep'){ for(const sx of [-1,1]) for(const z of [1.05,-1.05]) add(B(.07,1.5,.07),0x23272e,sx*.84,1.62,z); for(const sx of [-1,1]) add(B(.07,.07,2.2),0x23272e,sx*.84,2.36,0); for(const z of [1.05,0,-1.05]) add(B(1.74,.07,.07),0x23272e,0,2.36,z); add(B(1.5,.12,.12),0x23272e,0,.5,1.38); }
      if(o.style==='buggy'){ add(B(1.6,1.5,.14),o.body2,0,1.25,-1.24,.12); for(const sx of [-1,1]) add(B(.12,1.05,.9),o.body2,sx*.79,1.05,-.82); add(B(1.5,.1,.46),o.body2,0,.93,1.24,.55); for(const sx of [-1,1]) add(new THREE.SphereGeometry(.11,8,6),0xfff2a0,sx*.5,.62,1.36); }
      if(o.style==='boat'){ add(B(1.8,.4,3.1),o.body,0,.34,0); { const g=new THREE.ConeGeometry(.9,1.5,4); g.rotateY(Math.PI/4); g.scale(1,1,.45); add(g,o.body,0,.34,2.25,Math.PI/2); } add(B(1.9,.06,3.2),o.body2,0,.56,0); add(B(.1,2.5,.1),0x6a4a30,0,2.1,-1.3); add(B(1.5,1.4,.04),0xf3ead7,0,2.55,-1.36); add(new THREE.SphereGeometry(.09,8,6),0xfff2a0,0,.68,2.6); }   /* mũi thuyền thấp dưới tầm mắt */
      if(o.style==='mine'){ for(const z of [-.8,0,.8]) for(const sx of [-1,1]) add(B(.11,.56,.1),0x2b2b2b,sx*.74,.62,z); add(B(1.5,.08,.1),0x2b2b2b,0,.9,1.22); } }
    [.42,-.72].forEach((z,r)=>{ for(const sx of [-1,1]){ const x=sx*.36; add(B(.56,.12,.5),0x2a2e36,x,sy,z); add(B(.56,.86,.12),0x2a2e36,x,sy+.47,z-.3,-.12); add(B(.34,.2,.1),0x2a2e36,x,sy+1.0,z-.36);
        const has=!!riders; if(riders || r>0 || sx!==ps){ for(const e of [-1,1]) add(B(.055,.62,.055),0x30343c,x+e*.2,sy+.62,z-.02,.25); add(B(.44,.13,.11),0xf2c230,x,sy+.36,z+.14); }
        if(has){ const s=SH[(r*2+(sx>0?1:0)+(o.seed||0))%4]; add(B(.4,.52,.24),s,x,sy+.42,z-.1); add(new THREE.SphereGeometry(.125,8,6),0xe8b894,x,sy+.84,z-.1); add(B(.36,.14,.4),0x30343c,x,sy+.12,z+.12); for(const e of [-1,1]) add(B(.075,.42,.075),s,x+e*.25,sy+.8,z-.04,-.25,0,e*-.3); } } });
    return mergeGeometries(parts,false); }
  const carMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.42, metalness:.3});
  const harG=(()=>{ const B=(w,h,d,x,y,z,rx=0)=>{ const g=new THREE.BoxGeometry(w,h,d); _mx.compose(_a.set(x,y,z),_qa.setFromEuler(_eu.set(rx,0,0)),_one); g.applyMatrix4(_mx); return g; }; return mergeGeometries([B(.06,.62,.06,-.2,-.31,.0),B(.06,.62,.06,.2,-.31,0),B(.46,.14,.12,0,-.6,.1)],false); })();
  const harness=new THREE.Mesh(harG,paint(0xf2c230,.4,.4)); harness.visible=false; harness.userData.dynamic=true; harness.matrixAutoUpdate=false; gMid.add(harness);

  /* ============================== TÀU LƯỢN (dùng chung cho 3 đường) ============================== */
  const COASTERS=[];
  function coaster(o){ const tr=o.tr, L=tr.L, NC=o.nc||(LOW?5:6), co={o, tr, dir:1, ci:0, s:tr.marks.stop, v:0, phase:'dock', t:8+COASTERS.length*7, lap:0, riding:false, seq:null, sel:0, vmax:0, time:0, gate:0};
    const tracks=o.trB?[tr,o.trB]:[tr]; tracks.forEach((t2,k)=>{ trackMesh(t2,k?{...o,...o.B}:o); });
    tracks.forEach((t2,k)=>supports(t2,{...o, ...(k?o.B:{}), side:k?o.sideB:o.side}, o.near||[]));
    co.trains=tracks.map((t2,k)=>{ const oo=k?{...o,...o.B,seed:2}:o, a=new THREE.InstancedMesh(carGeo(oo,0,o.seatSide(k)),carMat,1), b=new THREE.InstancedMesh(carGeo(oo,1),carMat,Math.max(1,NC-1)); b.count=NC-1; for(const im of [a,b]){ im.frustumCulled=false; im.castShadow=true; im.userData.dynamic=true; gMid.add(im); } return {a,b,tr:t2}; });
    if(o.head){ co.head=new THREE.Mesh(o.head(),carMat); co.head.userData.dynamic=true; co.head.matrixAutoUpdate=false; co.head.castShadow=true; gMid.add(co.head); }
    const fr={p:[0,0,0],t:[0,0,0],u:[0,0,0]}, hip=V3(), eye=V3(), tv=V3(), uv=V3(), lv=V3();
    const cus=tr.cusps||[], TLN=2.6*(NC-1);
    const place=()=>{ const k=co.dir; for(const tn of co.trains){ for(let i=0;i<NC;i++){ frameAt(tn.tr,co.s-1.25-(k>0?i:NC-1-i)*2.6,fr); const Lx=cr(fr.u,fr.t); let cg=k, sg=0; if(i===0 && co.gz){ cg=Math.cos(co.gz)*k; sg=Math.sin(co.gz)*k; }
          _mx.set(Lx[0]*cg-fr.t[0]*sg,fr.u[0],fr.t[0]*cg+Lx[0]*sg,fr.p[0], Lx[1]*cg-fr.t[1]*sg,fr.u[1],fr.t[1]*cg+Lx[1]*sg,fr.p[1], Lx[2]*cg-fr.t[2]*sg,fr.u[2],fr.t[2]*cg+Lx[2]*sg,fr.p[2], 0,0,0,1);
          if(i===0){ tn.a.setMatrixAt(0,_mx); if(co.head && tn===co.trains[0]) co.head.matrix.copy(_mx); } else tn.b.setMatrixAt(i-1,_mx); } tn.a.instanceMatrix.needsUpdate=true; tn.b.instanceMatrix.needsUpdate=true; } };
    // khung ghế của người chơi (toa đầu, hàng đầu, ghế sát sân ga)
    const seatFrame=()=>{ const t2=co.trains[co.sel].tr, k=co.dir; if(o.gaze){ frameAt(t2,co.s-1.25-(k>0?0:TLN),fr); const Lx=cr(fr.u,fr.t), cg=Math.cos(co.gz||0)*k, sg=Math.sin(co.gz||0)*k, sx=o.seatSide(co.sel)*.36, so=.62; uv.fromArray(fr.u).normalize();
        lv.set(Lx[0]*cg-fr.t[0]*sg,Lx[1]*cg-fr.t[1]*sg,Lx[2]*cg-fr.t[2]*sg); tv.set(fr.t[0]*cg+Lx[0]*sg,fr.t[1]*cg+Lx[1]*sg,fr.t[2]*cg+Lx[2]*sg); hip.fromArray(fr.p).addScaledVector(lv,sx).addScaledVector(tv,.42).addScaledVector(uv,so); eye.copy(hip).addScaledVector(uv,.74).addScaledVector(tv,.12); return; }
      frameAt(t2,co.s-1.25-(k>0?0:TLN)+.42*k,fr); const Lx=cr(fr.u,fr.t).map(v=>v*k), sx=o.seatSide(co.sel)*.36, so=o.inv?-1.78:.62; tv.fromArray(fr.t).multiplyScalar(k).normalize(); uv.fromArray(fr.u).normalize(); lv.fromArray(Lx);
      hip.set(fr.p[0]+Lx[0]*sx+fr.u[0]*so, fr.p[1]+Lx[1]*sx+fr.u[1]*so, fr.p[2]+Lx[2]*sx+fr.u[2]*so); eye.copy(hip).addScaledVector(uv,.74).addScaledVector(tv,.12); };
    const setHarness=k=>{ harness.visible=!(cam.fpv && k>=1); _mx.makeBasis(lv,uv,tv); _qa.setFromRotationMatrix(_mx).multiply(_qb.setFromEuler(_eu.set(-2.3+k*1.7,0,0))); _mx.compose(_a.copy(hip).addScaledVector(uv,.98).addScaledVector(tv,-.2),_qa,_one); harness.matrix.copy(_mx); };
    const eyeFn=()=>({pos:eye, t:tv, u:uv, v:co.v});
    function beginBoard(sel){ co.sel=sel; co.t=Math.max(co.t,9); start(o.id); co.seq={k:'walk', t:0}; toast(`${o.icon} Tàu đang đợi – nhân vật tự bước lên hàng ghế đầu…`, 2600); }
    co.board=(sel=0)=>{ if(co.phase!=='dock' || co.seq) return toast(`${o.icon} Tàu đang chạy – chuyến kế tiếp vào ga sau ~${Math.ceil(Math.max(3,(L-co.lap)/14))} giây.`, 2400);
      if(!tix[o.id]) return pay(o.price, `🎟 Vé <b>${o.name}</b>`, ()=>{ tix[o.id]=true; beginBoard(sel); }); beginBoard(sel); };
    co.update=(dt)=>{ const me_on=ride.kind===o.id; if(o.gaze){ const want=co.phase!=='dock'?o.gaze(co):0; co.gz=(co.gz||0)+(want-(co.gz||0))*Math.min(1,dt*(o.gazeK||2.4)); if(Math.abs(co.gz)<.002 && !want) co.gz=0; }
      if(co.phase==='dock'){ co.t-=dt; co.gate=Math.min(1,co.gate+dt*2); const waiting=!ride.kind && tix[o.id] && o.inZone(P.x,P.z);
        if(co.seq){ const q=co.seq, bp=o.boardPt(co.sel); q.t+=dt; seatFrame();
          if(q.k==='walk'){ if(walkTo(bp[0],bp[1],o.yP,dt)){ q.k='in'; q.t=0; q.from=V3(bp[0],o.yP+(me.h||1.75)*.53,bp[1]); } }
          else if(q.k==='in'){ const k=Math.min(1,q.t/.6), e=k*k*(3-2*k); _a.copy(q.from).lerp(hip,e); _a.y+=Math.sin(k*Math.PI)*.22; sit(_a,tv,uv); setHarness(0); if(k>=1){ q.k='lock'; q.t=0; tone(520,300,.25,.1,'square'); toast('🔒 Đai an toàn đang hạ xuống… giữ chặt nhé!', 2200); } }
          else if(q.k==='lock'){ sit(hip,tv,uv); setHarness(Math.min(1,q.t/1.1)); if(q.t>1.5){ co.seq=null; co.riding=true; co.t=Math.min(co.t,o.launch?3.2:1.2); co.vmax=0; co.time=0; if(co.op) co.op.play('agree'); ride.eye=eyeFn; if(o.fpv && !cam.fpv && window.__qcView){ co.fpvSet=true; window.__qcView(); }
                toast(o.launch?'🚀 Hệ thống phóng từ trường sẵn sàng… 3 · 2 · 1…':'👍 Nhân viên ra hiệu an toàn – XUẤT PHÁT!', 2600); if(o.launch){ for(let i=0;i<3;i++) setTimeout(()=>tone(660,660,.12,.12,'square'),i*900+300); } } }
          else if(q.k==='out'){ if(q.t<.8){ sit(hip,tv,uv); setHarness(1-q.t/.8); } else { harness.visible=false; const k=Math.min(1,(q.t-.8)/.6), e=k*k*(3-2*k); _a.copy(hip).lerp(q.to,e); _a.y+=Math.sin(k*Math.PI)*.2; sit(_a,tv,uv);
              if(k>=1){ co.seq=null; end(bp[0],bp[1],o.yP,P.face); if(co.fpvSet){ co.fpvSet=false; if(cam.fpv && window.__qcView) window.__qcView(); } if(o.onEnd) o.onEnd(co); toast(o.endMsg?o.endMsg(co):`${o.icon} ${o.name}: ${Math.round(co.time)} giây · tốc độ cao nhất ${Math.round(co.vmax*3.6)} km/h. Ra theo biển "LỐI RA" ở cuối sân ga nhé!`, 5200); } } }
          if(me_on && co.seq && co.seq.k!=='walk'){ chase.pos.copy(hip).addScaledVector(tv,-5).addScaledVector(lv,o.seatSide(co.sel)*3.2).add(_b.set(0,2.2,0)); chase.look.copy(hip); HOOK.camOverride=chase; } }
        else if(co.riding){ seatFrame(); sit(hip,tv,uv); setHarness(1); }
        if(!co.seq && co.t<=0 && !(waiting && co.t>-40) && !(o.idle && !co.riding)){ co.phase='run'; co.lap=0; co.held=false; co.dir=1; co.ci=0; co.si=0; co.v=.6; if(o.onGo) o.onGo(co); if(Math.hypot(P.x-tr.P[0][0],P.z-tr.P[0][2])<120) noise(.07,1.4,200,700); } }
      else { co.gate=Math.max(0,co.gate-dt*2);
        if(co.phase==='hold'){ co.t-=dt; if(co.t<=0){ co.phase='run'; co.v=co.hv||2; co.hv=0; if(co.riding && !o.stops) noise(.25,1.2,300,2600); } }
        else if(co.phase==='cusp'){ co.t-=dt; if(co.t<=0){ co.s+=TLN; co.lap+=TLN; co.dir=-co.dir; co.ci++; co.phase='run'; co.v=.5; } }   /* đường cụt: đổi chiều chạy */
        else { const rem=L-co.lap; if(rem<16){ co.v=Math.max(.45,Math.min(co.v,rem*.6+.25)); const d=Math.min(rem,co.v*dt); co.s+=d; co.lap+=d;
            if(L-co.lap<.04){ co.s=tr.marks.stop; co.v=0; co.phase='dock'; co.t=o.dwell||16; if(co.riding){ co.riding=false; tix[o.id]=false; seatFrame(); const bp=o.boardPt(co.sel); co.seq={k:'out', t:0, to:V3(bp[0],o.yP+(me.h||1.75)*.53,bp[1])}; wind(0); tone(300,520,.25,.1,'square'); } } }
          else { const st={s:co.s,v:co.v}; physStep(tr,st,dt,o.cfg); co.lap+=st.s-co.s; co.s=st.s; co.v=st.v; co.zone=st.zone;
            if(co.ci<cus.length){ const r2=cus[co.ci]-co.s; if(r2<8){ const v2=Math.min(co.v,Math.max(.4,r2*.7+.3)), d=(co.v-v2)*dt; co.s-=d; co.lap-=d; co.v=v2; } if(cus[co.ci]-co.s<.05){ co.phase='cusp'; co.t=(o.cuspHold||[])[co.ci]||3; co.v=0; if(o.onCusp) o.onCusp(co,co.ci); } }
            if(o.stops && co.si<o.stops.length && co.s>=o.stops[co.si].s){ const sp=o.stops[co.si++]; co.phase='hold'; co.t=sp.t; co.hv=sp.v||1.2; co.v=0; if(sp.on) sp.on(co); }
            if(o.hold && !co.held && co.lap>=o.hold-tr.marks.stop){ co.held=true; co.phase='hold'; co.t=3.5; co.v=0; if(co.riding) toast('😱 Treo lơ lửng trên đỉnh 60 m… nhìn thẳng xuống đất!', 3000); }
            if(co.riding && st.zone==='lift' && Math.floor(co.lap/1.4)!==Math.floor((co.lap-co.v*dt)/1.4)) tone(180,120,.05,.07,'square'); } }
        if(co.riding){ seatFrame(); sit(hip,tv,uv); setHarness(1); co.time+=dt; co.vmax=Math.max(co.vmax,co.v); wind(co.v/34);
          if(o.inv) chase.pos.copy(hip).addScaledVector(tv,-7).addScaledVector(lv,o.seatSide(co.sel)*3.4).addScaledVector(uv,-.5).add(_b.set(0,.9,0)); else { const cm=o.cam||[7.5,2.4,1.4]; chase.pos.copy(hip).addScaledVector(tv,-cm[0]).addScaledVector(uv,cm[1]).add(_b.set(0,cm[2],0)); }
          chase.look.copy(hip).addScaledVector(tv,o.cam?3:6); chase.k=8; HOOK.camOverride=chase;
          if(co.v>24 && !co.scr){ co.scr=true; noise(.22,1.5,500,2800); } if(co.v<12) co.scr=false; } }
      if(co.riding && me_on && !cam.fpv && !me.root.visible) me.root.visible=true;
      if(co.phase!=='dock' || !co.placed || co.riding || co.seq){ place(); co.placed=true; }
      if(co.gates && co.gate!==co.gateShown){ co.gateShown=co.gate; co.gates(co.gate); }
      if(o.tick) o.tick(co,dt,me_on && co.riding); if(me_on && co.riding && o.dark && o.dark(co)){ darkWant=o.darkCol||0x050608; darkFar=o.darkFar||55; } };
    place(); COASTERS.push(co); return co; }

  // GA BÊN (tàu ngồi): sân ga bên trái hướng chạy, cầu thang sau (vào) + trước (ra), mái che, khu xếp hàng + cổng soát vé, lối ra một chiều
  function sideStation(o){ const tr=o.tr, st=frameAt(tr,tr.marks.stop-7.8), ry=Math.atan2(st.t[0],st.t[2]), c=Math.cos(ry), s=Math.sin(ry), X=st.p[0], Z=st.p[2], yP=st.p[1]+.45, hP=yP-G0;
    const at=(lx,lz)=>[X+lx*c+lz*s, Z-lx*s+lz*c], loc=(x,z)=>{ const dx=x-X, dz=z-Z; return [dx*c-dz*s, dx*s+dz*c]; }, put=(k,geo,mat,lx,y,lz,ry2=0,rx=0)=>{ const [x,z]=at(lx,lz); return k.add(geo,mat,x,y,z,ry+ry2,rx); }, F=(pts,opt)=>fence(pts.map(p=>at(p[0],p[1])),opt);
    put(kF,boxM(5,hP,22),M.conc,3.55,G0+hP/2-.01,0); put(kF,flat(planeM(5,22)),M.terrazzo,3.55,yP+.006,0); put(kF,flat(planeM(.22,22)),paint(0xf2c230,.5),1.4,yP+.012,0); { const [x,z]=at(3.55,0); addPlat(x,z,ry,2.5,11,yP); }
    { const a=at(1.05,-11), b=at(6.05,11); boxes.push({x0:Math.min(a[0],b[0]), x1:Math.max(a[0],b[0]), z0:Math.min(a[1],b[1]), z1:Math.max(a[1],b[1]), y0:G0-2, y1:yP-.45, msg:`🚉 Sân ga ${o.name} – lên bằng cầu thang phía sau, qua cổng soát vé`}); }
    const ns=Math.ceil(hP/.17), rise=hP/(ns+1), zb=-11-ns*.4, zf=11+ns*.4;
    for(const e of [-1,1]) for(let j=0;j<ns;j++){ const h=yP-(j+1)*rise, lz=e*(11+(j+.5)*.4); put(kF,boxM(3,h-G0+.3,.4),M.conc,3.5,(h+G0-.3)/2,lz); const [x,z]=at(3.5,lz); addPlat(x,z,ry,1.5,.21,h); }
    F([[6.05,-11],[6.05,11]],{y:yP}); F([[1.05,-11],[1.05,11]],{vis:false, y0:yP-.4, y1:yP+3, msg:'⚠️ Mép sân ga – đợi tàu vào ga rồi bấm E để lên tàu'});
    for(const e of [-1,1]){ F([[1.05,e*11],[2,e*11]],{y:yP}); F([[5,e*11],[6.05,e*11]],{y:yP}); }
    F([[2,-11],[2,zb],[1.2,zb],[1.2,-19]],{h:1.1+hP*.5}); F([[1.2,-16.2],[8.6,-16.2],[8.6,-12.5]]); F([[5,-11],[5,zb],[7,zb],[7,-12.5]],{h:1.1+hP*.5});
    F([[2,11],[2,zf+1.4]],{h:1.1+hP*.5}); F([[5,11],[5,zf+1.4]],{h:1.1+hP*.5}); F([[1.3,11],[1.3,zf+4]],{vis:false}); F([[-1.75,-19],[-1.75,zf+4]],{h:1.3, msg:'⚠️ Khu vực đường ray – không vào'});
    exitGate(at(2,zf+1.4),at(5,zf+1.4),(x,z)=>{ const [lx,lz]=loc(x,z); return lz<zf+1.5 && lz>10 && lx>1.4 && lx<5.6; },o.name);
    // mái ga
    for(const lz of [-9.5,0,9.5]) for(const lx of [6.35,-2.4]){ const [x,z]=at(lx,lz); kF.add(cylM(.17,.2,yP+4.4-G0,10),paint(0xe9eef5,.4,.3),x,(yP+4.4+G0)/2,z); circles.push({x,z,r:.26}); }
    put(kF,boxM(10.2,.34,24.6),paint(o.roof,.55,.1),2,yP+4.55,0); put(kF,boxM(10.6,.5,.3),paint(0x161a22,.5),2,yP+4.2,12.3); put(kF,boxM(10.6,.5,.3),paint(0x161a22,.5),2,yP+4.2,-12.3);
    for(const lz of [-8,-4,0,4,8]){ put(kN,boxM(1.2,.06,.3),M.lampCool,3.5,yP+4.33,lz); } put(kF,boxM(1.7,2.3,1.7),M.whiteAlu,5.0,yP+1.15,9.7); put(kF,pln(1.3,.9),M.glassHome,5.0,yP+1.5,8.84,Math.PI);
    { const [x,z]=at(5.0,9.7); circles.push({x,z,r:1.1, y0:yP-.3, y1:yP+3}); const [ox,oz]=at(4.2,7.6), d=at(0,7.6); o.op=npc(ox,yP,oz,Math.atan2(d[0]-ox,d[1]-oz),'nhân viên vận hành '+o.name,20+COASTERS.length); }
    // cửa chắn sân ga (mở khi tàu đỗ)
    const NG=10, gg=new THREE.BoxGeometry(.05,.75,.95); gg.translate(0,.45,.475); const gim=new THREE.InstancedMesh(gg,paint(o.gateCol||0xf2c230,.4,.5),NG); gim.frustumCulled=false; gim.userData.dynamic=true; gNear.add(gim);
    const gates=k=>{ for(let i=0;i<NG;i++){ const lz=-9.5+i*2.05, [x,z]=at(1.18,lz); _qa.setFromEuler(_eu.set(0,ry+k*1.45,0)); _mx.compose(_a.set(x,yP,z),_qa,_one); gim.setMatrixAt(i,_mx); } gim.instanceMatrix.needsUpdate=true; }; gates(0);
    for(let i=0;i<=NG;i++){ put(kN,boxM(.08,1.0,.08),railM2,1.18,yP+.5,-9.5+i*2.05-.05); }
    const [ex,ez]=at(7,-12.5), en=entry({...o, x:ex, z:ez, ry}); BLK.push((()=>{ const xs=[at(-4,-20),at(16,-20),at(-4,zf+4),at(16,zf+4)]; return [Math.min(...xs.map(p=>p[0])), Math.max(...xs.map(p=>p[0])), Math.min(...xs.map(p=>p[1])), Math.max(...xs.map(p=>p[1]))]; })());
    const bp=at(1.75,6.97), ip=at(2.6,6.97);
    return {at, loc, yP, zf, gates, op:o.op, inZone:(x,z)=>{ const [lx,lz]=loc(x,z); return lx>.9 && lx<12.2 && lz>-16.6 && lz<zf+1.5; }, boardPt:()=>bp, ip, skip:(x,z)=>{ const [lx,lz]=loc(x,z); return Math.abs(lx)<3 && lz>-17.5 && lz<zf+2.6; }}; }

  /* ---------- 🐉 #1 THẦN LONG CUỒNG NỘ ---------- */
  const dragonHead=()=>{ const parts=[], cc=new THREE.Color(), add=(g,c,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{ _mx.compose(_a.set(x,y,z),_qa.setFromEuler(_eu.set(rx,ry,rz,'YXZ')),_b.set(sx,sy,sz)); g.applyMatrix4(_mx); cc.set(c); const n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=cc.r; a[i*3+1]=cc.g; a[i*3+2]=cc.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); parts.push(g); };
    add(new THREE.SphereGeometry(.55,12,10),0xc41e1e,0,.6,1.9,0,0,0,1,.7,1.25); add(new THREE.BoxGeometry(.66,.3,1.0),0xc41e1e,0,.5,2.62,.08); add(new THREE.BoxGeometry(.58,.14,.9),0x8f1414,0,.3,2.56,-.2);
    for(const s of [-1,1]){ add(new THREE.ConeGeometry(.09,.7,6),0xe8c040,s*.3,.98,1.55,-1.2,0,s*-.25); add(new THREE.SphereGeometry(.09,8,6),0xfff2a0,s*.27,.74,2.28); add(new THREE.ConeGeometry(.045,.5,5),0xe8c040,s*.28,.5,3.15,1.3,0,s*.3); add(new THREE.BoxGeometry(.04,.36,.6),0xe8c040,s*.56,.6,1.6,0,s*.5,0); }
    for(let i=0;i<2;i++) add(new THREE.ConeGeometry(.12,.34,4),0xe8c040,0,.98-i*.06,1.5-i*.28,-.9); for(const s of [-1,1]) for(let i=0;i<3;i++) add(new THREE.ConeGeometry(.045,.16,4),0xfff7e0,s*.2,.36,2.5+i*.18,Math.PI); return mergeGeometries(parts,false); };
  const TRD=TRACKS.dragon(G0), TRS=TRACKS.space(G0), TRE=TRACKS.eagle(G0), TREB=mirrorZ(TRE,620), ALL=[TRD,TRS,TRE,TREB];
  { const o={id:'dragon', name:'Thần Long Cuồng Nộ', icon:'🐉', price:35, wait:'8', sub:'Tàu lượn rồng: dốc 68 m, lao 84°, vòng lộn 39 m, cobra, xoắn trên hồ · 126 km/h', tr:TRD, rail:0xc41e1e, spine:0xd8a628, tie:0x8f1414, sup:0x30343b, body:0xc41e1e, body2:0xe8c040, col:0xb3261e, roof:0x8f1d1d,
      cfg:{lift:6, brakeV:8, stV:7}, seatSide:()=>1, head:dragonHead, near:ALL, dwell:18,
      top:(put,cx,mz,hw)=>{ for(const e of [-1,1]){ put(kF,new THREE.ConeGeometry(.7,2.2,4),paint(0xe8c040,.35,.7),cx+e*hw,9.3,mz,Math.PI/4); put(kF,new THREE.ConeGeometry(.22,1.6,6),paint(0xe8c040,.35,.7),cx+e*1.6,9.9,mz,0,e*.5); } put(kF,new THREE.SphereGeometry(.7,12,10),paint(0xc41e1e,.4,.2),cx,9.6,mz); } };
    const sta=sideStation(o); Object.assign(o,{yP:sta.yP, inZone:sta.inZone, boardPt:sta.boardPt}); const co=coaster(o); co.gates=sta.gates; co.op=sta.op; lowFence(TRD,G0+2.4,(i,p)=>sta.skip(p[0],p[2]));
    INTER.push({x:sta.ip[0], z:sta.ip[1], r:3.6, prio:.95, when:()=>!ride.kind && Math.abs(P.y-sta.yP)<.9, label:'🐉 Lên tàu Thần Long – hàng ghế đầu (E)', action:()=>co.board(0)}); }
  /* ---------- 🚀 #2 TIA CHỚP KHÔNG GIAN ---------- */
  { const o={id:'space', name:'Tia Chớp Không Gian', icon:'🚀', price:35, wait:'6', sub:'Phóng từ trường 0→133 km/h, mũ chóp 60 m dựng đứng 90°, treo 3,5 giây rồi lao thẳng xuống', tr:TRS, rail:0x19c3e6, spine:0x3a2f7a, tie:0x5a4fb0, sup:0xe9eef5, body:0x1b1f3a, body2:0x29d3ff, col:0x3a2f9a, roof:0x241d5a, fg:'#bff4ff',
      cfg:{launchV:37, launchA:15, brakeV:8, stV:5.5}, seatSide:()=>1, near:ALL, launch:true, hold:TRS.marks.hold, dwell:16, gateCol:0x29d3ff,
      top:(put,cx,mz,hw)=>{ put(kF,new THREE.TorusGeometry(1.5,.14,8,28),neon,cx,10.6,mz); put(kF,new THREE.SphereGeometry(.6,14,10),paint(0x29d3ff,.3,.6),cx,10.6,mz); for(const e of [-1,1]) put(kF,new THREE.ConeGeometry(.5,2.4,8),paint(0xe9eef5,.3,.7),cx+e*hw,9.6,mz); } };
    var neon=new THREE.MeshStandardMaterial({color:0x0a2030, emissive:0x29d3ff, emissiveIntensity:1.5, roughness:.4}), neon2=new THREE.MeshStandardMaterial({color:0x200a30, emissive:0xc04bff, emissiveIntensity:1.5, roughness:.4});
    const sta=sideStation(o); Object.assign(o,{yP:sta.yP, inZone:sta.inZone, boardPt:sta.boardPt}); const co=coaster(o); co.gates=sta.gates; co.op=sta.op; lowFence(TRS,G0+2.4,(i,p)=>sta.skip(p[0],p[2]));
    INTER.push({x:sta.ip[0], z:sta.ip[1], r:3.6, prio:.95, when:()=>!ride.kind && Math.abs(P.y-sta.yP)<.9, label:'🚀 Lên tàu Tia Chớp – hàng ghế đầu (E)', action:()=>co.board(0)});
    // hầm phóng 46 m: khung vòm + vòng đèn neon xen kẽ
    const dk=paint(0x1a1d26,.5,.5); for(let x=140, i=0; x<=186; x+=3.3, i++){ for(const e of [-1,1]) kF.add(boxM(.3,4.4,.3),dk,x,G0+2.2,536+e*2.45); kF.add(boxM(.3,.3,5.2),dk,x,G0+4.5,536); const nm=i%2?neon2:neon; for(const e of [-1,1]) kF.add(boxM(.08,3.9,.08),nm,x+.2,G0+2.1,536+e*2.28); kF.add(boxM(.08,.08,4.6),nm,x+.2,G0+4.3,536); }
    for(const e of [-1,1]) kF.add(boxM(46,.25,.25),dk,163,G0+4.5,536+e*2.45); kF.add(boxM(46.6,.12,5.4),paint(0x10131a,.6,.3),163,G0+4.72,536);
    BLK.push([134,190,530,542]); }
  /* ---------- 🦅 #3 SONG DỰC ĐẠI BÀNG (2 đường đua đỏ / xanh, tàu treo) ---------- */
  { const yP=G0+.6, o={id:'eagle', name:'Song Dực Đại Bàng', icon:'🦅', price:35, wait:'7', sub:'2 đoàn tàu TREO đua song song: dốc 41 m, vòng lộn, xoắn không trọng lực, xoắn ốc · 93 km/h', tr:TRE, trB:TREB, inv:true, rail:0xd1232a, spine:0x8a1218, tie:0x30343b, sup:0x30343b, body:0xd1232a, body2:0xf2f2f2, col:0xa32a22, roof:0x3a3f47,
      B:{rail:0x1f6fe0, spine:0x123f8a, body:0x1f6fe0}, cfg:{lift:5.5, brakeV:6, stV:5}, side:L=>L[2]<0?1:-1, sideB:L=>L[2]>0?1:-1, seatSide:sel=>sel?1:-1, near:ALL, dwell:18, yP,
      inZone:(x,z)=>x>-155 && x<-83.5 && z>616.5 && z<623.5, boardPt:sel=>[-150.4,sel?622.6:617.4] };
    // sân ga đảo giữa 2 đường ray + hành lang vào/ra dọc mặt phẳng đối xứng z = 620
    kF.add(boxM(20,.6,6.8),M.conc,-144,G0+.29,620); kF.add(flat(planeM(20,6.8)),M.terrazzo,-144,yP+.006,620); addPlat(-144,620,0,10,3.4,yP);
    for(let j=0;j<3;j++){ const h=yP-(j+1)*.15, x=-134+(j+.5)*.4; kF.add(boxM(.4,h-G0+.3,6.4),M.conc,x,(h+G0-.3)/2,620); addPlat(x,620,0,.21,3.2,h); }
    for(const e of [-1,1]){ kF.add(flat(planeM(20,.22)),paint(0xf2c230,.5),-144,yP+.012,620+e*3.05); fence([[-154,620+e*3.4],[-134,620+e*3.4]],{vis:false, y0:yP-.4, y1:yP+3, msg:'⚠️ Mép sân ga – đợi tàu vào ga rồi bấm E để lên tàu'});
      fence([[-134.2,620+e*3.3],[-83.5,620+e*3.3]],{h:2.1, msg:'⚠️ Tàu treo chạy sát hành lang – không trèo qua rào'}); fence([[-158,620+e*6.1],[-104,620+e*6.1]],{h:1.4, msg:'⚠️ Khu vực đường ray – không vào'});
      { const pts=[[-85.7,620+e*22]]; for(let i=0;i<TRE.N;i+=3){ const p=TRE.P[i], t=TRE.T[i], lh=Math.hypot(t[0],t[2])||1; if((TRE.Z[i]==='brake'||TRE.Z[i]==='station') && p[2]>598.5 && p[2]<615.3 && p[0]>-103 && p[0]<-83) pts.push([p[0]-t[2]/lh*2.7,620+e*(620-(p[2]+t[0]/lh*2.7))]); } pts.push([-104,620+e*6.1]); fence(pts,{h:1.3, msg:'⚠️ Khu vực đường ray – không vào'}); }   /* rào bám theo đúng đường cong ray, cách 2,7 m (trước đây cắt góc → sát chân người ngồi tàu treo) */ fence([[-82.2,620+e*22],[-82.2,620+e*8],[-83.5,620+e*3.3]],{h:1.6, msg:'⚠️ Khu vực đường ray – không vào'}); }
    fence([[-154,616.6],[-154,623.4]],{y:yP}); fence([[-132.6,620],[-87,620]],{h:1.1});
    gateLine({...o, x:-83.6, z:620, ry:Math.PI/2, n:2, mz:6.5, mcx:0, bx:6.8, bz:6}); exitGate([-83.6,620.1],[-83.6,623.3],(x,z)=>x<-83.5 && x>-134 && z>620 && z<623.4,o.name);
    for(const x of [-152,-144,-136]){ kF.add(cylM(.2,.24,6.4,10),paint(0xe9eef5,.4,.3),x,G0+3.5,620); circles.push({x,z:620,r:.3}); } kF.add(boxM(23,.34,17),paint(o.roof,.55,.1),-144,G0+6.85,620); for(const x of [-150,-144,-138]) kN.add(boxM(.3,.06,1.2),M.lampCool,x,G0+6.64,620);
    o.op=npc(-152.6,yP,620,Math.PI/2,'nhân viên vận hành Song Dực Đại Bàng',27); BLK.push([-160,-70,606,634]);
    const co=coaster(o); co.op=o.op; lowFence(TRE,G0+4.6,(i)=>TRE.Z[i]==='station'); lowFence(TREB,G0+4.6,(i)=>TREB.Z[i]==='station');
    INTER.push({x:-150.4, z:620, r:3.6, prio:.95, when:()=>!ride.kind && Math.abs(P.y-yP)<.9, label:'🦅 Lên tàu Song Dực Đại Bàng – đứng nửa Bắc: tàu ĐỎ · nửa Nam: tàu XANH (E)', action:()=>co.board(P.z>620?1:0)}); }

  /* ============================== ⚡ THÁP SẤM SÉT QC – RƠI 80 M ============================== */
  const TW={st:'idle', t:20, y:0, v:0, rot:0, riding:false, seq:null, auto:0};
  { const X=TOWER.x, Z=TOWER.z, HT=82, o={id:'tower', name:'Tháp Sấm Sét QC', icon:'⚡', price:30, wait:'5', col:0x2a4fa8, fg:'#cfe6ff', sub:'Vòng ghế xoay lên 80 m ngắm toàn cảnh → sét đánh → rơi giả → rơi tự do 105 km/h → nảy lên 45 m'};
    const steel=paint(0x39414d,.45,.6), strip=new THREE.MeshStandardMaterial({color:0x0a2030, emissive:0x7fd8ff, emissiveIntensity:1.3}), gold=paint(0xe8c040,.3,.8); TW.strip=strip;
    kL.add(boxM(2.3,HT,2.3),paint(0x1c2028,.5,.4),X,G0+HT/2,Z); for(const sx of [-1,1]) for(const sz of [-1,1]) kL.add(cylM(.26,.3,HT,8),steel,X+sx*1.6,G0+HT/2,Z+sz*1.6);
    for(let y=3;y<HT;y+=4.5) for(const [dx,dz,ry] of [[0,1.6,0],[0,-1.6,0],[1.6,0,Math.PI/2],[-1.6,0,Math.PI/2]]) kL.add(boxM(3.2,.16,.16),steel,X+dx,G0+y,Z+dz,ry);
    for(const [dx,dz,ry] of [[0,1.2,0],[0,-1.2,0],[1.2,0,Math.PI/2],[-1.2,0,Math.PI/2]]) kL.add(boxM(.22,HT-4,.06),strip,X+dx,G0+HT/2,Z+dz,ry);
    kL.add(cylM(3.6,2.4,1.2,8),steel,X,G0+HT+.6,Z); kL.add(new THREE.TorusGeometry(3.7,.2,8,28).rotateX(Math.PI/2),gold,X,G0+HT+1.3,Z); for(let i=0;i<8;i++){ const a=i/8*TAU; kL.add(new THREE.ConeGeometry(.3,i%2?3:4.6,5),gold,X+Math.cos(a)*3.4,G0+HT+(i%2?2.8:3.6),Z+Math.sin(a)*3.4); }
    kL.add(cylM(.08,.14,7,6),steel,X,G0+HT+4.7,Z); kL.add(new THREE.SphereGeometry(.34,10,8),strip,X,G0+HT+8.3,Z); glow(X,G0+HT+8.3,Z,5,0x9fe0ff,1.2); circles.push({x:X,z:Z,r:2.5});
    // bệ lên ghế (vành tròn) + rào quanh, lối vào phía Đông (từ khu xếp hàng), lối ra phía Đông-Nam
    const yB=G0+.45; kF.add(cylM(8.2,8.2,.45,40),M.conc,X,G0+.225,Z); kF.add(cylM(8.7,8.7,.22,40),M.conc,X,G0+.11,Z); { const d=flat(new THREE.RingGeometry(2.4,8.2,40)), u=d.attributes.uv, p=d.attributes.position; for(let i=0;i<u.count;i++) u.setXY(i,p.getX(i),p.getZ(i)); kF.add(d,M.terrazzo,X,yB+.006,Z); }
    W.plats.push({t:'c', x:X, z:Z, r:8.7, h:G0+.22},{t:'c', x:X, z:Z, r:8.2, h:yB});
    { let run=[]; const runs=[], gap=a=>Math.abs(a)<.2 || Math.abs(a-.82)<.19; for(let i=0;i<=48;i++){ let a=i/48*TAU; if(a>Math.PI) a-=TAU; if(gap(a)){ if(run.length>1) runs.push(run); run=[]; continue; } run.push([X+Math.cos(a)*9,Z+Math.sin(a)*9]); } if(run.length>1) runs.push(run); for(const r of runs) fence(r,{h:1.2}); }
    exitGate([X+Math.cos(.63)*9,Z+Math.sin(.63)*9],[X+Math.cos(1.01)*9,Z+Math.sin(1.01)*9],(x,z)=>Math.hypot(x-X,z-Z)<9.05,o.name);
    fence([[X+9*Math.cos(.2),Z+9*Math.sin(.2)],[-42.5,538.8]],{vis:false}); fence([[X+9*Math.cos(-.2),Z+9*Math.sin(-.2)],[-42.5,537.2]],{vis:false});
    entry({...o, x:-42.5, z:538.8, ry:Math.PI/2});
    // vòng ghế 24 chỗ (xoay + nâng)
    const NS=24, RS=3.35, parts=[], cc=new THREE.Color(), add=(g,c,x,y,z,ry=0,rx=0)=>{ _mx.compose(_a.set(x,y,z),_qa.setFromEuler(_eu.set(rx,ry,0,'YXZ')),_one); g.applyMatrix4(_mx); cc.set(c); const n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=cc.r; a[i*3+1]=cc.g; a[i*3+2]=cc.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); parts.push(g); };
    add(new THREE.CylinderGeometry(2.75,2.75,.9,24,1,true),0x2a4fa8,0,.95,0); add(new THREE.CylinderGeometry(2.95,2.75,.16,24),0xe8c040,0,1.48,0); add(new THREE.CylinderGeometry(2.75,2.95,.16,24),0xe8c040,0,.42,0);
    for(let i=0;i<NS;i++){ const a=i/NS*TAU, cx=Math.cos(a), sz=Math.sin(a), ry=Math.atan2(cx,sz); add(new THREE.BoxGeometry(.56,.12,.5),0x23272e,cx*RS,.5,sz*RS,ry); add(new THREE.BoxGeometry(.56,.95,.12),0x23272e,cx*(RS-.3),.98,sz*(RS-.3),ry,-.1); add(new THREE.BoxGeometry(.3,.2,.1),0x23272e,cx*(RS-.34),1.55,sz*(RS-.34),ry);
      if(i!==0){ for(const e of [-1,1]) add(new THREE.BoxGeometry(.06,.62,.06),0xf2c230,cx*(RS-.02)+Math.cos(a+Math.PI/2)*e*.2,1.12,sz*(RS-.02)+Math.sin(a+Math.PI/2)*e*.2,ry,.25); add(new THREE.BoxGeometry(.46,.14,.12),0xf2c230,cx*(RS+.14),.86,sz*(RS+.14),ry);
        if(i%3!==1){ const s=[0xd94f4f,0x3f8fd9,0x4fb86a,0xe0b23a][i%4]; add(new THREE.BoxGeometry(.4,.52,.24),s,cx*(RS-.1),.92,sz*(RS-.1),ry); add(new THREE.SphereGeometry(.125,8,6),0xe8b894,cx*(RS-.1),1.34,sz*(RS-.1)); add(new THREE.BoxGeometry(.36,.14,.4),0x30343c,cx*(RS+.12),.62,sz*(RS+.12),ry); } } }
    const gon=new THREE.Mesh(mergeGeometries(parts,false),carMat); gon.castShadow=true; gon.userData.dynamic=true; gon.position.set(X,yB,Z); gMid.add(gon); TW.gon=gon;
    // tia sét trên đỉnh + khói ở chân tháp
    const bolts=[]; for(let i=0;i<6;i++){ const pts=[], a=i/6*TAU; let r=.4, y=G0+HT+8; for(let k=0;k<9;k++){ pts.push(V3(X+Math.cos(a+Math.sin(k*2.1+i)*.5)*r,y,Z+Math.sin(a+Math.sin(k*2.1+i)*.5)*r)); r+=.9+((k*7+i*3)%4)*.25; y-=.5+((k*5+i)%3)*1.1; }
      const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xcfefff})); ln.visible=false; ln.userData.dynamic=true; gFar.add(ln); bolts.push(ln); }
    const SM=50, sp=new Float32Array(SM*3), smoke=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(sp,3)),new THREE.PointsMaterial({color:0xffffff, size:2.6, transparent:true, opacity:0, depthWrite:false})); smoke.frustumCulled=false; smoke.userData.dynamic=true; gNear.add(smoke); let smT=9;
    const puff=()=>{ smT=0; noise(.22,1.6,900,200); }, hip=V3(), fv=V3(), up=V3(0,1,0), eye=V3(), TOP=G0+78;
    const seatAt=()=>{ const a=TW.rot; fv.set(Math.cos(a),0,Math.sin(a)); hip.set(X+fv.x*RS,gon.position.y+.62,Z+fv.z*RS); eye.copy(hip).addScaledVector(up,.74).addScaledVector(fv,.12); };
    const eyeFn=()=>({pos:eye, t:fv, u:up, v:Math.abs(TW.v)});
    const go=()=>{ TW.st='rise'; TW.t=0; TW.v=0; TW.r0=TW.rot; TW.fk=false; if(Math.hypot(P.x-X,P.z-Z)<120) tone(220,440,.5,.08); };
    TW.update=(dt)=>{ const g=gon, yMin=yB;
      if(TW.seq){ const q=TW.seq; q.t+=dt; seatAt(); const bx=X+fv.x*5.4, bz=Z+fv.z*5.4;
        if(q.k==='walk'){ if(walkTo(bx,bz,yB,dt)){ q.k='in'; q.t=0; q.from=V3(bx,yB+(me.h||1.75)*.53,bz); } }
        else if(q.k==='in'){ const k=Math.min(1,q.t/.6); _a.copy(q.from).lerp(hip,k*k*(3-2*k)); _a.y+=Math.sin(k*Math.PI)*.2; sit(_a,fv,up); if(k>=1){ q.k='lock'; q.t=0; tone(520,300,.25,.1,'square'); toast('🔒 Khoá vai tự động đã đóng. Vòng ghế sẽ vừa xoay vừa lên cao 80 m…', 3000); } }
        else if(q.k==='lock'){ sit(hip,fv,up); if(q.t>1.6){ TW.seq=null; TW.riding=true; ride.eye=eyeFn; go(); } }
        else if(q.k==='out'){ const k=Math.min(1,q.t/.7); _a.copy(hip).lerp(q.to,k*k*(3-2*k)); _a.y+=Math.sin(k*Math.PI)*.2; sit(_a,fv,up); if(k>=1){ TW.seq=null; end(q.to.x,q.to.z,yB,Math.atan2(fv.x,fv.z)); tix.tower=false; toast('⚡ Tháp Sấm Sét: rơi tự do 105 km/h rồi nảy lên 45 m! Ra theo biển "LỐI RA".', 4600); } } }
      if(TW.st==='idle'){ TW.t-=dt; if(TW.t<=0 && !TW.seq && !(tix.tower && Math.hypot(P.x-X,P.z-Z)<24 && TW.t>-40)) go(); }
      else if(TW.st==='rise'){ TW.t+=dt; const k=Math.min(1,TW.t/24), e=k*k*(3-2*k); g.position.y=lerp(yMin,TOP,e); TW.rot=TW.r0+TAU*e; if(k>=1){ TW.st='charge'; TW.t=0; if(TW.riding) toast('⚡ Đỉnh tháp 80 m – năng lượng đang tích tụ…', 3200); } }
      else if(TW.st==='charge'){ TW.t+=dt; strip.emissiveIntensity=1.3+3*Math.abs(Math.sin(TW.t*14))*(TW.t/5); for(const b of bolts) b.visible=Math.random()<.35; if(Math.random()<dt*5 && Math.hypot(P.x-X,P.z-Z)<160) noise(.1+TW.t*.03,.25,1800,300);
        if(TW.t>5){ TW.st='fake'; TW.t=0; TW.v=0; for(const b of bolts) b.visible=false; } }
      else if(TW.st==='fake'){ TW.t+=dt; if(TW.t<.42){ TW.v-=9.81*dt; g.position.y+=TW.v*dt; } else if(TW.v<0){ TW.v=Math.min(0,TW.v+40*dt); g.position.y+=TW.v*dt; if(TW.v===0 && TW.riding && !TW.fk){ TW.fk=true; tone(200,90,.3,.14,'sawtooth'); toast('😨 Hú hồn… mới chỉ là rơi giả thôi!', 1800); } } if(TW.t>2.5){ TW.st='fall'; TW.v=0; TW.b=0; if(Math.hypot(P.x-X,P.z-Z)<200) noise(.3,2.4,400,3200); } }
      else if(TW.st==='fall'){ const lim=TW.b?G0+24:G0+33; TW.v+=(g.position.y>lim?-9.81:(TW.v<0?24:0))*dt; if(g.position.y<=lim && TW.v>=0){ if(!TW.b){ TW.b=1; TW.st='bounce'; TW.t=0; noise(.3,.8,200,1500); } else { TW.st='land'; } }
        g.position.y=Math.max(yMin+.5,g.position.y+TW.v*dt); }
      else if(TW.st==='bounce'){ TW.t+=dt; TW.v+=(TW.t<.62?36:-9.81)*dt; g.position.y+=TW.v*dt; if(TW.t>.62 && TW.v<=0){ TW.st='fall'; } }
      else if(TW.st==='land'){ TW.v=-Math.max(1.2,Math.min(5,(g.position.y-yMin)*.6)); g.position.y+=TW.v*dt; if(g.position.y<=yMin+.02){ g.position.y=yMin; TW.v=0; TW.st='idle'; TW.t=22; strip.emissiveIntensity=1.3; puff();
            if(TW.riding){ TW.riding=false; seatAt(); TW.seq={k:'out', t:0, to:V3(X+fv.x*5.4,yB+(me.h||1.75)*.53,Z+fv.z*5.4)}; wind(0); } } }
      g.rotation.y=-TW.rot;
      if(TW.riding){ seatAt(); sit(hip,fv,up); wind(Math.abs(TW.v)/30); chase.pos.copy(hip).addScaledVector(fv,9).add(_b.set(0,2.5,0)); chase.look.copy(hip); chase.k=9; HOOK.camOverride=chase; if(!cam.fpv && !me.root.visible) me.root.visible=true; }
      else if(TW.seq && TW.seq.k!=='walk'){ chase.pos.copy(hip).addScaledVector(fv,7).add(_b.set(0,2,0)); chase.look.copy(hip); HOOK.camOverride=chase; }
      if(smT<3.2){ smT+=dt; const a=smoke.geometry.attributes.position; for(let i=0;i<SM;i++){ const an=i/SM*TAU, r=3+smT*(2.2+(i%5)*.5); a.setXYZ(i,X+Math.cos(an)*r,G0+.6+smT*(.5+(i%3)*.4),Z+Math.sin(an)*r); } a.needsUpdate=true; smoke.material.opacity=.5*(1-smT/3.2); } };
    INTER.push({x:X+5.6, z:Z, r:3.4, prio:.95, when:()=>!ride.kind && Math.hypot(P.x-X,P.z-Z)<8.6, label:'⚡ Ngồi vào ghế Tháp Sấm Sét (E)', action:()=>{ if(TW.st!=='idle' || TW.seq) return toast('⚡ Vòng ghế đang ở trên cao – đợi lượt sau (~'+Math.ceil(TW.st==='rise'?45-TW.t:20)+' giây).', 2400);
        const begin=()=>{ TW.t=Math.max(TW.t,8); start('tower'); TW.seq={k:'walk', t:0}; }; if(!tix.tower) return pay(o.price,'🎟 Vé <b>Tháp Sấm Sét QC</b>',()=>{ tix.tower=true; begin(); }); begin(); }});
    BLK.push([X-12,X+32,Z-12,Z+12]); }

  /* ============================== 🎡 MẮT THẦN QC WORLD – VÒNG QUAY 90 M ============================== */
  const WH={ang:0, sp:1, riding:false, seq:null, gi:0, a0:0};
  { const X=WHEEL.x, Z=WHEEL.z, R=45, HY=G0+50.5, NG=24, yB=G0+1.6, o={id:'wheel', name:'Mắt Thần QC World', icon:'🎡', price:25, wait:'4', col:0x1f8f8a, fg:'#d8fff6', sub:'Vòng quay 90 m bên Hồ Pha Lê: 24 cabin kính cầu, 1 vòng 3 phút, ngắm toàn cảnh công viên – biển – thành phố'};
    const white=paint(0xf2f5f8,.4,.35), parts=[]; for(const sx of [-1,1]){ const t=new THREE.TorusGeometry(R,.3,6,96); t.rotateY(Math.PI/2); t.translate(sx*2.6,0,0); parts.push(t); const t2=new THREE.TorusGeometry(R*.62,.14,5,64); t2.rotateY(Math.PI/2); t2.translate(sx*2.9,0,0); parts.push(t2);
      for(let i=0;i<NG*2;i++){ const a=i/(NG*2)*TAU; parts.push(beamG([sx*3.3,Math.cos(a+.06)*1.3,Math.sin(a+.06)*1.3],[sx*2.6,Math.cos(a)*R,Math.sin(a)*R],.07,.07,5)); } }
    for(let i=0;i<NG;i++){ const a=i/NG*TAU; parts.push(beamG([-2.6,Math.cos(a)*R,Math.sin(a)*R],[2.6,Math.cos(a)*R,Math.sin(a)*R],.12,.12,6)); }
    { const h=new THREE.CylinderGeometry(1.5,1.5,7.2,20); h.rotateZ(Math.PI/2); parts.push(h); }
    const wg=new THREE.Mesh(mergeGeometries(parts.map(g=>{ const q=g.index?g.toNonIndexed():g; for(const k of Object.keys(q.attributes)) if(k!=='position' && k!=='normal') q.deleteAttribute(k); return q; }),false),white); wg.position.set(X,HY,Z); wg.castShadow=true; wg.userData.dynamic=true; wg.userData.noFar=true; gLand.add(wg);
    for(const sx of [-1,1]) for(const sz of [-1,1]){ beam(kL,white,[X+sx*12,G0-.2,Z+sz*12],[X+sx*4.3,HY,Z],.85,.6,10); kF.add(boxM(2.4,.5,2.4),M.conc,X+sx*12,G0+.2,Z+sz*12); circles.push({x:X+sx*12,z:Z+sz*12,r:1.3}); } for(const sx of [-1,1]) kL.add(cylM(1.9,1.9,.9,20).rotateZ(Math.PI/2),paint(0x1f8f8a,.4,.4),X+sx*4.3,HY,Z);
    // đèn LED trên vành
    const NL=96, led=new THREE.InstancedMesh(new THREE.SphereGeometry(.15,5,4),new THREE.MeshBasicMaterial({color:0xffffff}),NL*2); led.frustumCulled=false; led.userData.dynamic=true; gLand.add(led); const lc=new THREE.Color();
    // cabin kính cầu: phần đặc (sàn, khung, ghế sofa, quang treo) + vỏ kính
    const gp=[], cc=new THREE.Color(), add=(g,c,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{ g=g.index?g.toNonIndexed():g; for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal') g.deleteAttribute(k); _mx.compose(_a.set(x,y,z),_qa.setFromEuler(_eu.set(rx,ry,rz,'YXZ')),_one); g.applyMatrix4(_mx); cc.set(c); const n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=cc.r; a[i*3+1]=cc.g; a[i*3+2]=cc.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); gp.push(g); };
    add(new THREE.CylinderGeometry(1.47,1.3,.12,20),0x3a4048,0,-1.5,0); add(new THREE.TorusGeometry(2.1,.07,6,32),0xf2f5f8,0,0,0,Math.PI/2); add(new THREE.TorusGeometry(2.1,.06,6,32),0xf2f5f8,0,0,0,0,Math.PI/2); add(new THREE.CylinderGeometry(.9,1.2,.2,16),0x1f8f8a,0,2.0,0);
    for(const sx of [-1,1]){ add(new THREE.BoxGeometry(.5,.42,1.9),0x8f3b4a,sx*.95,-1.24,0); add(new THREE.BoxGeometry(.14,.6,1.9),0x8f3b4a,sx*1.22,-.82,0,0,0,sx*-.2); add(new THREE.BoxGeometry(.1,.5,.1),0xf2f5f8,sx*2.35,2.25,0); } add(new THREE.BoxGeometry(4.9,.14,.14),0xf2f5f8,0,2.45,0);
    const gim=new THREE.InstancedMesh(mergeGeometries(gp,false),carMat,NG), sim=new THREE.InstancedMesh(new THREE.SphereGeometry(2.08,16,12),new THREE.MeshStandardMaterial({color:0xbfe8ff, transparent:true, opacity:.22, roughness:.1, metalness:.3, depthWrite:false}),NG);
    for(const im of [gim,sim]){ im.frustumCulled=false; im.userData.dynamic=true; (im===sim?gMid:gLand).add(im); } gim.castShadow=true; sim.renderOrder=2;
    const gpos=(i,out)=>{ const th=i/NG*TAU+WH.ang; return out.set(X,HY+R*Math.cos(th)-2.45,Z+R*Math.sin(th)); };
    const placeW=(tt)=>{ wg.rotation.x=WH.ang; for(let i=0;i<NG;i++){ gpos(i,_a); _mx.makeTranslation(_a.x,_a.y,_a.z); gim.setMatrixAt(i,_mx); sim.setMatrixAt(i,_mx); } gim.instanceMatrix.needsUpdate=true; sim.instanceMatrix.needsUpdate=true;
      const night=W.night||0; for(let i=0;i<NL;i++){ const th=i/NL*TAU+WH.ang; for(let s=0;s<2;s++){ _mx.makeScale(1+night*1.6,1+night*1.6,1+night*1.6).setPosition(X+(s?2.95:-2.95),HY+R*Math.cos(th),Z+R*Math.sin(th)); led.setMatrixAt(i*2+s,_mx);
          if(night>.25) lc.setHSL(((i/NL)*2+tt*.12+(Math.floor(tt/9)%2?Math.sin(i*.4+tt*2)*.2:0))%1,.9,.55); else lc.setRGB(.95,.97,1); led.setColorAt(i*2+s,lc); } } led.instanceMatrix.needsUpdate=true; if(led.instanceColor) led.instanceColor.needsUpdate=true; };
    // sân lên cabin (phía Tây, sát hồ), cầu thang Bắc (vào) + Nam (ra), khu xếp hàng phía Bắc
    kF.add(boxM(6.1,1.6,20),M.conc,167.05,G0+.79,620); kF.add(flat(planeM(6.1,20)),M.terrazzo,167.05,yB+.006,620); addPlat(167.05,620,0,3.05,10,yB); boxes.push({x0:164, x1:170.1, z0:610, z1:630, y0:G0-2, y1:yB-.45, msg:'🎡 Sân lên cabin Mắt Thần – lên bằng cầu thang phía Bắc, qua cổng soát vé'});
    for(const e of [-1,1]) for(let j=0;j<8;j++){ const h=yB-(j+1)*(1.6/9), z=620+e*(10+(j+.5)*.4); kF.add(boxM(4,h-G0+.3,.4),M.conc,166.6,(h+G0-.3)/2,z); addPlat(166.6,z,0,2,.21,h); }
    fence([[164,610],[164,630]],{y:yB}); fence([[170.1,610],[170.1,630]],{vis:false, y0:yB-.4, y1:yB+3, msg:'⚠️ Mép sân – đợi cabin tới rồi bấm E để bước vào'}); for(let z=610;z<=630;z+=2.5) kN.add(boxM(.08,1.0,.08),railM2,170.0,yB+.5,z);
    for(const z of [610,630]){ fence([[164,z],[164.6,z]],{y:yB}); fence([[168.6,z],[170.1,z]],{y:yB}); }
    fence([[164.6,610],[164.6,606.8],[164,606.8],[164,594]],{h:1.9}); fence([[168.6,610],[168.6,606.8],[169.8,606.8],[169.8,589.5],[152.5,589.5],[152.5,594]],{h:1.3}); fence([[154.1,594],[164,594]]); fence([[164.6,630],[164.6,634.6]],{h:1.9}); fence([[168.6,630],[168.6,634.6]],{h:1.9});
    exitGate([164.6,634.6],[168.6,634.6],(x,z)=>z<634.7 && z>629 && x>164 && x<169.2,o.name);
    fence([[170.2,606.6],[176,606.6],[176,634],[170.2,634]],{h:1.4, msg:'⚠️ Vùng cabin quay sát đất – không vào'}); T.slab(kF,M.granite,150,171,631,638,G0+.06);
    entry({...o, x:152.5, z:594, ry:0, bx:-2.0}); fence([[168.6,634.6],[170.2,634]],{vis:false}); BLK.push([146,190,586,640]);
    const hip=V3(), fv=V3(-1,0,0), up=V3(0,1,0), eye=V3(), ctr=V3(), seatAt=()=>{ gpos(WH.gi,ctr); hip.set(ctr.x+.82,ctr.y-.93,ctr.z); eye.copy(hip).addScaledVector(up,.74).addScaledVector(fv,.1); }, eyeFn=()=>({pos:eye, t:fv, u:up, v:0});
    const bottomIdx=()=>{ let best=0, bd=9; for(let i=0;i<NG;i++){ let d=((i/NG*TAU+WH.ang-Math.PI)%TAU+TAU)%TAU; if(d>Math.PI) d-=TAU; if(Math.abs(d)<Math.abs(bd)){ bd=d; best=i; } } return [best,bd*R]; };
    WH.update=(dt,tt)=>{ const w=TAU/180*WH.sp; WH.ang+=w*dt; if(WH.riding){ WH.acc+=w*dt; }
      if(WH.seq){ const q=WH.seq; q.t+=dt; seatAt();
        if(q.k==='walk'){ if(ctr.z<611.5) WH.gi=(WH.gi+NG-1)%NG; else if(walkTo(169.3,clamp(ctr.z,611,629),yB,dt,2.8) && Math.abs(ctr.z-P.z)<.3){ q.k='in'; q.t=0; q.from=V3(169.3,yB+(me.h||1.75)*.53,P.z); } }
        else if(q.k==='in'){ const k=Math.min(1,q.t/.7); _a.copy(q.from).lerp(hip,k*k*(3-2*k)); sit(_a,fv,up); if(k>=1){ WH.seq=null; WH.riding=true; WH.acc=0; WH.ff=false; ride.eye=eyeFn; ride.inter=()=>WH.ff?null:{label:'⏩ Quay nhanh về ga để xuống sớm (E)', action:()=>{ WH.ff=true; toast('⏩ Vòng quay tăng tốc đưa cabin về ga…', 2200); }};
              toast('🎡 Cabin kính Mắt Thần: 1 vòng 3 phút – kéo chuột ngắm 360°, bấm Q đổi góc nhìn thứ nhất / thứ ba.', 5200); } }
        else if(q.k==='out'){ const k=Math.min(1,q.t/.7); _a.copy(hip).lerp(q.to,k*k*(3-2*k)); sit(_a,fv,up); if(k>=1){ WH.seq=null; end(q.to.x,q.to.z,yB,-Math.PI/2); tix.wheel=false; toast('🎡 Hẹn gặp lại ở Mắt Thần QC World! Ra theo cầu thang phía Nam (biển "LỐI RA").', 4200); } } }
      if(WH.riding){ seatAt(); sit(hip,fv,up); WH.sp=lerp(WH.sp,WH.ff?7:1,Math.min(1,dt*1.5)); chase.pos.set(ctr.x-10,ctr.y+1.5,ctr.z+5.5); chase.look.copy(ctr); chase.k=6; HOOK.camOverride=chase; if(!cam.fpv && !me.root.visible) me.root.visible=true;
        if(WH.acc>=TAU-.012){ WH.riding=false; WH.sp=1; WH.ff=false; ride.inter=null; WH.seq={k:'out', t:0, to:V3(168.9,yB+(me.h||1.75)*.53,clamp(ctr.z,611,629))}; } }
      else WH.sp=lerp(WH.sp,1,Math.min(1,dt*2));
      placeW(tt); };
    INTER.push({x:168.6, z:620, r:4.2, prio:.95, when:()=>!ride.kind && Math.abs(P.y-yB)<.9, label:'🎡 Bước vào cabin Mắt Thần (E)', action:()=>{ if(WH.seq) return; const begin=()=>{ const [gi,off]=bottomIdx(); WH.gi=off<-2.5?(gi+NG-1)%NG:gi; start('wheel'); WH.seq={k:'walk', t:0}; toast('🎡 Cabin đang tới – nhân vật tự bước vào…', 2200); };
        if(!tix.wheel) return pay(o.price,'🎟 Vé <b>Mắt Thần QC World</b>',()=>{ tix.wheel=true; begin(); }); begin(); }});
    placeW(0); }

  /* ============================== CẬP NHẬT ============================== */
  // BÓNG TỐI trong hầm/hang (chỉ khi người chơi đang ngồi trên tàu ở trong đó): kéo sương mù của cảnh về gần + tối, ra khỏi hầm thì trả lại như cũ
  let darkWant=0, darkK=0, darkFar=55, fogSave=null; const DC=new THREE.Color();
  function updDark(dt){ const f=W.scene && W.scene.fog; if(!f) return; darkK+=((darkWant?1:0)-darkK)*Math.min(1,dt*3.5); if(darkWant) DC.set(darkWant);
    if(darkK<.01){ if(fogSave){ f.color.copy(fogSave.c); f.near=fogSave.n; f.far=fogSave.f; fogSave=null; } darkK=0; return; }
    if(!fogSave) fogSave={c:f.color.clone(), n:f.near, f:f.far}; f.color.copy(fogSave.c).lerp(DC,darkK); f.near=lerp(fogSave.n,darkFar*.14,darkK); f.far=lerp(fogSave.f,darkFar,darkK); }
  const EXTRA=[];
  function update(dt,tt,near){ if(!near && !ride.kind){ if(darkK>0){ darkWant=0; updDark(1); } return; } updGates(dt); for(const e of EXITS) e.sg.y0=e.inside(P.x,P.z)?1e9:undefined; darkWant=0; if(ride.shake>0) ride.shake=Math.max(0,ride.shake-dt*1.2);
    for(const co of COASTERS) co.update(dt); TW.update(dt); WH.update(dt,tt); for(const f of EXTRA) f(dt,tt); updDark(dt);
    if(ride.kind && ride.seated && W.applyPose) W.applyPose('sit'); if(!ride.kind && harness.visible) harness.visible=false;
    /* GỐC LỖI "mắt tụt lại sau xe": vòng khung hình của game đặt camera TRƯỚC khi trò chơi di chuyển (updateCamera → HOOK.onFrame) → ở góc nhìn thứ nhất mắt luôn trễ 1 khung (v·dt ≈ 0,5–1,2 m lúc 100 km/h) và lọt vào lưng ghế. Đặt lại camera ngay sau khi mọi trò đã cập nhật. */
    if(cam.fpv && ride.eye && !HOOK.scope && W.camera) HOOK.fpvCam(0,W.camera);
    if(ride.kind && HOOK.vehicle) HOOK.vehicleInter=VINT; }   /* life.js xoá HOOK.vehicleInter mỗi khung khi không cưỡi xe → đặt lại để nút E (bắn súng, quay nhanh, bỏ cuộc…) luôn hiện */
  const blocked=(x,z)=>inBLK(x,z) || CELL.has(cellKey(x,z)) || CELL.has(cellKey(x+4,z)) || CELL.has(cellKey(x-4,z)) || CELL.has(cellKey(x,z+4)) || CELL.has(cellKey(x,z-4));
  const kit={coaster, sideStation, entry, gateLine, exitGate, lowFence, beam, beamG, npc, sit, walkTo, start, end, tone, noise, wind, chime, chase, ride, tix, BLK, CELL, cellKey, paint, cr, carMat, EXTRA, ALL, V3, railM2, inBLK, setDark:(c,far)=>{ darkWant=c; darkFar=far||55; }, carGeo, COASTERS, updDarkNow:()=>updDark(1)};
  return {update, blocked, ride, tix, COASTERS, TW, WH, kit, tracks:{dragon:TRD, space:TRS, eagle:TRE, eagleB:TREB}};
}
