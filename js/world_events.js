// QC World V2 – Pha 10: BỘ ĐIỀU PHỐI SỰ KIỆN ĐƯỜNG PHỐ (đặc tả docs/PHA10_AN_NINH_SU_KIEN.md · phiên bot đi bộ, 16/11/2026)
//  ĐỢT 1:
//   A 🦹 Trộm móc túi & công an truy đuổi – trộm áp sát người chơi (trừ tạm ≤ 50 💰) hoặc 1 người đi đường (nạn nhân hoảng loạn kêu cứu), bỏ chạy dọc vỉa hè;
//     người chơi đuổi kịp + phím 3 (đấm) → trộm ngã, thưởng +30 💰; xe tuần tra gần nhất hú còi chớp đèn lao tới, 2 cảnh sát chạy 5,8 m/s quật ngã, khoá tay;
//     1 người trả lại tiền + chào điều lệnh, 1 người áp giải trộm lên xe → buồng tạm giữ Sở Cảnh Sát; người xem vỗ tay "👏 Hoan hô các anh công an!".
//   B 🔥 Cháy trên phố & xe cứu hoả 114 – lửa + khói cao ~4 m (ánh cam nhấp nháy), dân lùi ra đứng xem hô "🔥 Cháy rồi! Gọi 114 mau!"; xe cứu hoả từ trạm (CBD)
//     hú còi chạy theo roadNet, 3 lính cứu hoả phun vòi rồng 12 s → lửa nhỏ dần, bốc hơi trắng, tắt; đám đông vỗ tay; xe thu vòi chạy về trạm.
//  Kích hoạt luân phiên quanh người chơi (20–45 m) mỗi ~2–3,5 phút khi ở ngoài trời; gọi thử: Shift+1 (A) · Shift+2 (B)  (phím 1–6 cử chỉ không bị ảnh hưởng).
//  API: W.events.list · W.events.trigger(key) · W.events.active() · W.events.stop()
//  Hiệu năng: rảnh = 0 lượt vẽ (diễn viên ẩn, hiệu ứng ẩn); đang diễn ≈ 15–30 lượt vẽ.

export async function make(W, zones={}){
  const {THREE, scene, P, HOOK, toast} = W;
  if(!W.V2 || !W.people) return null;
  const gAtY=(x,z,y)=>W.groundAtY ? W.groundAtY(x,z,y) : W.groundAt(x,z), R=Math.random, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerpAngle=W.lerpAngle;
  const TR=()=>W.traffic, PD=()=>W.traffic && W.traffic.ped, QUAL=W.QUAL||'low';
  const coins=()=>(W.life && W.life.S ? W.life.S.coins : 0), give=(n,why)=>{ try{ W.life && W.life.addCoins(n, why); }catch(e){} };

  /* ============================== DIỄN VIÊN (dáng people.js, dùng lại giữa các lần) ============================== */
  const CAST=new Map(); let KW=1.49/1.78, KR=3.4/1.78;
  function actor(key, seed, outfit, name){ let o=CAST.get(key); if(o) return o;
    const kk=W.people.kit(seed, {outfit}), a=W.makeActor(kk.gl, {name, height:kk.h, face:0, clips:{idle:kk.clips.idle, walk:kk.clips.walk, run:kk.clips.run, agree:kk.clips.agree}, compact:false, dot:'#ff8a4a'});
    if(QUAL==='low') a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); a.g.visible=false; if(a.label) a.label.alpha=0;
    const bones={}; a.g.traverse(b=>{ if(b.isBone) bones[b.name.replace(/^mixamorig:?/,'')]=b; });
    o={key, a, h:kk.h, bones, x:0, y:0, z:0, hd:0, v:0, clip:'idle', lie:0, pose:null, on:false}; CAST.set(key,o); if(PD()){ KW=PD().KW||KW; KR=PD().KR||KR; } return o; }
  function show(o, x, z, hd=0){ o.x=x; o.z=z; o.y=gAtY(x,z,(P.y??2)+3); o.hd=hd; o.v=0; o.clip='idle'; o.lie=0; o.pose=null; o.on=true; o.a.g.visible=true; o.a.g.rotation.set(0,hd,0); if(o.a.label) o.a.label.alpha=1; o.a.play('idle',0); }
  function hide(o){ if(!o) return; o.on=false; o.a.g.visible=false; if(o.a.label) o.a.label.alpha=0; if(o.bub){ W.removeLabel(o.bub); o.bub=null; } }
  function sayA(o, text, sec=3.5){ if(!o.anchor){ o.anchor=new THREE.Object3D(); o.anchor.position.y=o.h+.6; o.a.g.add(o.anchor); } if(o.bub) W.removeLabel(o.bub); o.bub=W.makeLabel(text, null, {fs:36, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.94)', color:'#1b2233', fade:45}); o.bubT=sec; }
  // tiến thẳng tới (x,z) với tốc độ v; trả về khoảng cách còn lại
  function moveTo(o, x, z, v, dt){ const dx=x-o.x, dz=z-o.z, d=Math.hypot(dx,dz); if(d<.05){ o.v=0; return 0; } const st=Math.min(d, v*dt); o.x+=dx/d*st; o.z+=dz/d*st; o.v=v; o.hd=lerpAngle(o.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*9)); return d-st; }
  // tư thế thủ tục: ngắm xương theo hướng thế giới (cách của pose.js)
  const _a=new THREE.Vector3(), _b=new THREE.Vector3(), _d=new THREE.Vector3(), _q=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion();
  function aim(o, name, child, dir){ const B=o.bones[name], C=o.bones[child]; if(!B || !C) return; B.getWorldPosition(_a); C.getWorldPosition(_b); _b.sub(_a).normalize(); _q.setFromUnitVectors(_b, _d.copy(dir).normalize());
    B.getWorldQuaternion(_wq); B.parent.getWorldQuaternion(_pq); _wq.premultiply(_q); B.quaternion.copy(_pq.invert().multiply(_wq)); B.updateMatrixWorld(true); }
  const F=new THREE.Vector3(), U=new THREE.Vector3(0,1,0), Rt=new THREE.Vector3(), V3=(f,u,r)=>new THREE.Vector3().addScaledVector(F,f).addScaledVector(U,u).addScaledVector(Rt,r);
  function applyPose(o, t){ if(!o.pose) return; F.set(Math.sin(o.hd),0,Math.cos(o.hd)); Rt.set(-F.z,0,F.x);
    switch(o.pose){
      case 'salute': aim(o,'RightArm','RightForeArm',V3(.35,.25,-.9)); aim(o,'RightForeArm','RightHand',V3(.25,.75,.65)); break;                 // chào điều lệnh: tay phải đưa lên vành mũ
      case 'cuffed': for(const [s,k] of [['Left',-1],['Right',1]]){ aim(o,s+'Arm',s+'ForeArm',V3(-.45,-1,k*.12)); aim(o,s+'ForeArm',s+'Hand',V3(-.6,-.1,-k*.9)); } break;   // khoá tay sau lưng
      case 'grab': aim(o,'RightArm','RightForeArm',V3(.8,-.4,-.2)); aim(o,'RightForeArm','RightHand',V3(1,-.1,.2)); break;                        // giữ vai trộm
      case 'hose': for(const [s,k] of [['Left',-1],['Right',1]]){ aim(o,s+'Arm',s+'ForeArm',V3(1,-.25,k*.18)); aim(o,s+'ForeArm',s+'Hand',V3(1,.12+Math.sin(t*3+k)*.03,-k*.25)); } break;   // ôm vòi rồng
      case 'panic': for(const [s,k] of [['Left',-1],['Right',1]]){ aim(o,s+'Arm',s+'ForeArm',V3(.1,.9,k*.5)); aim(o,s+'ForeArm',s+'Hand',V3(0,1,k*.2+Math.sin(t*12)*.2)); } break;   // giơ tay kêu cứu
      case 'clap': { const c=Math.abs(Math.sin(t*9))*.22; for(const [s,k] of [['Left',-1],['Right',1]]){ aim(o,s+'Arm',s+'ForeArm',V3(.55,-.55,k*.35)); aim(o,s+'ForeArm',s+'Hand',V3(.75,.45,-k*(.35+c))); } } break;
    } }
  const _u=new THREE.Vector3();
  function tickActor(o, dt, t){ if(!o.on) return; const a=o.a;
    if(o.lie>0){ a.g.position.set(o.x, o.y+.18, o.z); a.g.rotation.set(-Math.PI/2+.05, o.hd, 0, 'YXZ'); a.play('idle',.2); }
    else { o.y=gAtY(o.x,o.z,o.y+.6); a.g.position.set(o.x,o.y,o.z); a.g.rotation.set(0,o.hd,0);
      if(o.v>.15){ const clip=o.v>2.4?'run':'walk'; a.play(clip,.2); const act=a.acts[clip]; if(act) act.setEffectiveTimeScale(o.v/((clip==='run'?KR:KW)*o.h)); } else a.play(o.clip==='agree'&&a.acts.agree?'agree':'idle',.25); }
    if(a.root.visible){ a.mixer.update(dt); applyPose(o, t); }
    if(o.bubT>0){ o.bubT-=dt; if(o.bubT<=0 && o.bub){ W.removeLabel(o.bub); o.bub=null; } } }
  const COP_OUT={shirt:0x1f2c5c, pants:0x182246, long:true, shoe:0x111111, style:'cap', hair:8, glasses:false, dress:false, skirt:false, shorts:false};
  const FIRE_OUT={shirt:0x2a2f3a, pants:0x2a2f3a, long:true, shoe:0x111111, style:'cap', hair:0, glasses:false, dress:false, skirt:false, shorts:false};
  const THIEF_OUT={shirt:0x15161a, pants:0x15161a, long:true, shoe:0x15161a, style:'cap', hair:16, glasses:false, dress:false, skirt:false, shorts:false};
  const seedM=s=>W.people.seedFor('m', s);
  function thiefActor(){ const o=actor('thief'+(thiefN), seedM(1300+thiefN*7), THIEF_OUT, '🦹 Tên trộm');
    if(!o.mask && o.bones.Head){ const m=new THREE.Mesh(new THREE.BoxGeometry(.2,.1,.06), new THREE.MeshStandardMaterial({color:0x0c0c0e, roughness:.8})); const ws=new THREE.Vector3(); o.bones.Head.getWorldScale(ws); m.scale.setScalar(1/(ws.x||1)); m.position.set(0, .07/(ws.y||1), .1/(ws.z||1)); o.bones.Head.add(m); o.mask=m; } return o; }
  let thiefN=0;

  /* ============================== CHỌN CHỖ: vỉa hè trước mặt người chơi 20–45 m ============================== */
  function pickSpot(min=20, max=45){ const pd=PD(); if(!pd || !pd.LANES) return null; const cam=W.camera, fw=new THREE.Vector3(); cam.getWorldDirection(fw); fw.y=0; fw.normalize(); let best=null, bs=-1e9;
    for(const L of pd.LANES){ for(let i=0;i<L.x.length;i+=3){ const x=L.x[i], z=L.z[i], d=Math.hypot(x-P.x, z-P.z); if(d<min || d>max || Math.abs(L.y[i]-(P.y??2))>3) continue; const dot=((x-P.x)*fw.x+(z-P.z)*fw.z)/d, sc=dot*2-Math.abs(d-30)/15+R()*.6; if(sc>bs){ bs=sc; best={L, s:L.cum[i], i, x, z, y:L.y[i]}; } } }
    return best; }
  function farRoadPoint(x, z, dmin=90, dmax=170){ const RN=W.roadNet; if(!RN) return null; const c=RN.nodes.filter(n=>{ const d=Math.hypot(n.x-x,n.z-z); return d>dmin && d<dmax && n.adj.length; }); if(!c.length) return null; c.sort(()=>R()-.5); return {x:c[0].x, z:c[0].z}; }

  /* ============================== HIỆU ỨNG LỬA · KHÓI · NƯỚC (InstancedMesh billboard) ============================== */
  const tex=(draw,w=64,h=128)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const flameT=tex((g,w,h)=>{ const gr=g.createRadialGradient(w/2,h*.7,2,w/2,h*.6,w*.55); gr.addColorStop(0,'rgba(255,250,210,1)'); gr.addColorStop(.25,'rgba(255,200,60,.95)'); gr.addColorStop(.6,'rgba(255,90,10,.75)'); gr.addColorStop(1,'rgba(160,20,0,0)'); g.fillStyle=gr; g.beginPath(); g.ellipse(w/2,h*.62,w*.46,h*.4,0,0,7); g.fill(); });
  const puffT=tex((g,w,h)=>{ const gr=g.createRadialGradient(w/2,h/2,2,w/2,h/2,w/2); gr.addColorStop(0,'rgba(255,255,255,.9)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); },64,64);
  const FX={}; const mkIM=(name,n,mat,geo=new THREE.PlaneGeometry(1,1))=>{ const im=new THREE.InstancedMesh(geo, mat, n); im.frustumCulled=false; im.castShadow=false; im.renderOrder=3; im.userData.dynamic=true; im.visible=false; im.name=name; scene.add(im); return im; };
  function fx(){ if(FX.flame) return FX;
    FX.flame=mkIM('ev-flame',18,new THREE.MeshBasicMaterial({map:flameT, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false}));
    FX.smoke=mkIM('ev-smoke',16,new THREE.MeshBasicMaterial({map:puffT, transparent:true, depthWrite:false, color:0x3a3a3a, opacity:.55}));
    FX.steam=mkIM('ev-steam',14,new THREE.MeshBasicMaterial({map:puffT, transparent:true, depthWrite:false, color:0xffffff, opacity:.6}));
    FX.water=mkIM('ev-water',72,new THREE.MeshBasicMaterial({color:0xe8f6ff, transparent:true, opacity:.85}), new THREE.SphereGeometry(.07,6,4));
    const glow=new THREE.Mesh(new THREE.CircleGeometry(3.2,24), new THREE.MeshBasicMaterial({map:puffT, color:0xff7a20, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:.8, toneMapped:false})); glow.rotation.x=-Math.PI/2; glow.visible=false; glow.renderOrder=2; glow.userData.dynamic=true; scene.add(glow); FX.glow=glow;
    const bin=new THREE.Group(); const sm=(c)=>new THREE.MeshStandardMaterial({color:c, roughness:.7, metalness:.2});
    const b1=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.1,1.0), sm(0x2f5a3a)); b1.position.y=.6; bin.add(b1); const lid=new THREE.Mesh(new THREE.BoxGeometry(1.7,.08,1.1), sm(0x1d1f24)); lid.position.set(0,1.2,-.3); lid.rotation.x=-.9; bin.add(lid); for(const x of [-.6,.6]) for(const z of [-.35,.35]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.08,8), sm(0x111111)); w.rotation.z=Math.PI/2; w.position.set(x,.09,z); bin.add(w); }
    bin.visible=false; bin.userData.dynamic=true; scene.add(bin); FX.bin=bin; return FX; }
  const _m=new THREE.Matrix4(), _p=new THREE.Vector3(), _s=new THREE.Vector3(), _z=new THREE.Matrix4().makeScale(0,0,0);
  function drawFire(E, t){ const f=fx(), k=E.fire, cq=W.camera.quaternion; f.flame.visible=f.smoke.visible=k>0.01; f.glow.visible=k>0.01; f.steam.visible=E.steam>0.01;
    for(let i=0;i<18;i++){ const ph=i*1.7+t*(2.2+i%3), r=.25+((i*37)%10)/10*.7*k, a=i*2.4; const s=(.9+Math.sin(ph)*.25)*(.7+.9*k)*(i<6?1.6:1); _p.set(E.x+Math.cos(a)*r, E.y+1.0+(i%6)*.38*k+Math.sin(ph*1.3)*.15+s*.45, E.z+Math.sin(a)*r); _s.set(s*.9, s*1.6, 1);
      if(k<=0.01) _m.copy(_z); else _m.compose(_p, cq, _s); f.flame.setMatrixAt(i,_m); } f.flame.instanceMatrix.needsUpdate=true;
    for(let i=0;i<16;i++){ const u=((t*.35+i/16)%1), s=(.8+u*2.6)*(.5+.6*k); _p.set(E.x+Math.sin(i*1.3+t*.3)*u*.8, E.y+2.2+u*4.2*(.6+.4*k), E.z+Math.cos(i*1.7)*u*.8); _s.set(s,s,1); if(k<=0.01) _m.copy(_z); else _m.compose(_p,cq,_s); f.smoke.setMatrixAt(i,_m); } f.smoke.instanceMatrix.needsUpdate=true;
    for(let i=0;i<14;i++){ const u=((t*.5+i/14)%1), s=(.6+u*2.2)*E.steam; _p.set(E.x+Math.sin(i*2.1)*u, E.y+1.0+u*3.5, E.z+Math.cos(i*1.1)*u); _s.set(s,s,1); if(E.steam<=0.01) _m.copy(_z); else _m.compose(_p,cq,_s); f.steam.setMatrixAt(i,_m); } f.steam.instanceMatrix.needsUpdate=true;
    f.glow.position.set(E.x, E.y+.05, E.z); f.glow.material.opacity=k*(.55+Math.sin(t*17)*.15+Math.sin(t*7.3)*.1); f.glow.scale.setScalar(.6+k*.6); }
  function drawWater(E, t, on){ const f=fx(); f.water.visible=on; if(!on) return; let n=0; for(const ff of E.crew){ if(!ff.on) continue; const hx=ff.x+Math.sin(ff.hd)*.7, hz=ff.z+Math.cos(ff.hd)*.7, hy=ff.y+1.15;
      for(let k=0;k<24;k++){ const u=((t*1.6+k/24)%1), tx=E.x+(R()-.5)*.6, tz=E.z+(R()-.5)*.6; _p.set(hx+(tx-hx)*u, hy+Math.sin(u*Math.PI)*1.6+(E.y+.8-hy)*u, hz+(tz-hz)*u); const s=.8+u*1.4; _s.set(s,s,s); _m.compose(_p, W.camera.quaternion, _s); f.water.setMatrixAt(n++, _m); } }
    for(;n<72;n++) f.water.setMatrixAt(n,_z); f.water.instanceMatrix.needsUpdate=true; }

  /* ============================== SỰ KIỆN ============================== */
  const ACTIVE=[]; let T0=0;
  const stats={A:0, B:0};
  function cheerAt(x, z, text, n=3){ const pd=PD(); if(!pd) return; const got=pd.crowd(x, z, 'cheer', {t:5, r:30}); got.sort(()=>R()-.5).slice(0,n).forEach((p,i)=>setTimeoutF(()=>pd.say(p, text, 3.2), i*.5)); }
  const timers=[]; const setTimeoutF=(fn, s)=>timers.push({t:s, fn});   // hẹn giờ theo khung hình (setTimeout không chạy khi test điều khiển khung)

  // ---------- A. TRỘM MÓC TÚI ----------
  function startTheft(){ const pd=PD(); const spot=pickSpot(16,38); if(!spot || !pd) return 'Không có vỉa hè gần để diễn sự kiện.';
    const riding=W.life && W.life.V && W.life.V.riding && W.life.V.riding();
    let victim=null, vp=null; if(riding || R()<.5){ const cands=pd.peds.filter(p=>p.state==='walk' && !p.cop && p.kind==='walk' && !p.fol.length && !p.lead && Math.hypot(p.x-P.x,p.z-P.z)<45 && Math.hypot(p.x-P.x,p.z-P.z)>8); if(cands.length){ vp=pd.borrow(cands[Math.floor(R()*cands.length)]); } }
    if(!vp && riding) return 'Đang lái xe – để lần sau.';
    victim=vp ? {ped:vp} : {player:true};
    const vx=vp?vp.x:P.x, vz=vp?vp.z:P.z; let st=pd.nearestLane(vx, vz, 40) || spot; const o={}; const s0=clamp(st.s+(R()<.5?-14:14), 0, st.L.len); pd.lanePos(st.L, s0, 0, o);
    thiefN++; const th=thiefActor(); show(th, o.x, o.z, Math.atan2(vx-o.x, vz-o.z));
    const E={key:'A', label:'🦹 Trộm móc túi', x:vx, z:vz, t:0, phase:'approach', th, victim, stolen:0, cops:[], car:null, special:null, L:st.L, s:s0, dir:1, crowd:false};
    E.dir=(s0>st.s)?1:-1; ACTIVE.push(E); stats.A++; return E; }
  function theftSteal(E){ const pd=PD(), th=E.th;
    if(E.victim.player){ const n=Math.min(50, coins()); E.stolen=n; if(n>0) give(-n); toast('🚨 Bạn vừa bị móc túi! Cảnh sát 113 đang lao tới trong 10 giây!', 4500); sayA(th, '😈 Hehe…', 2); }
    else { const p=E.victim.ped; pd.say(p, '😱 Cướp! Cướp! Ai cứu tôi với, nó lấy mất ví tiền rồi!', 5); p.sclip='run'; E.panic=0; }
    E.x=th.x; E.z=th.z; pd.crowd(th.x, th.z, 'watch', {r:26, t:45, ring:9}); E.crowd=true;
    // gọi 113: xe tuần tra gần nhất (hoặc xe từ ~120 m nếu không có)
    E.phase='flee'; E.tFlee=E.t; callResponder(E, 'police', th.x, th.z, (car)=>copsOut(E, car)); }
  // chọn xe tới nhanh nhất: xe tuần tra đang chạy VỀ PHÍA hiện trường trong ~200 m; không có thì gọi xe từ điểm đường cách 80–130 m (tới trong ~10 s)
  function callResponder(E, kind, x, z, onArrive){ const tr=TR(); if(!tr) return; const nn=W.roadNet.nearest(x, z, 40), stopR=(nn ? nn.d : 10)+5;   /* bán kính dừng = khoảng cách hiện trường ↔ tim đường + 5 m */
    if(kind==='police'){ let best=null, bs=1e9; for(const c of tr.cars){ if(!c.patrol || !c.active || c.target) continue; const dx=x-c.g.position.x, dz=z-c.g.position.z, d=Math.hypot(dx,dz); if(d>120 || d<12) continue;
        const toward=(dx*Math.sin(c.h)+dz*Math.cos(c.h))/d; if(toward<.5) continue; const sc=d*(1.6-toward); if(sc<bs){ bs=sc; best=c; } }
      if(best && tr.dispatch(best, {x, z}, {onArrive, stop:stopR})){ E.car=best; E._resp='xe tuần tra'; return; } }
    for(let k=0;k<6;k++){ const from=farRoadPoint(x, z, 80, 130+k*15); if(!from) break; const r=W.roadNet.route(from, {x, z}); if(!r || r.len>230) continue;
      const s=tr.spawnVehicle(kind, {x, z}, {from, stop:stopR}); if(s){ E._resp='xe trực chiến gần'; if(kind==='police'){ E.special=s; E.specOnArrive=onArrive; } return s; } }
    return null; }
  function copsOut(E, car){ if(E.cops.length) return; const g=car.g.position, h=car.h, rx=-Math.cos(h), rz=Math.sin(h), fx=Math.sin(h), fz=Math.cos(h);
    for(let i=0;i<2;i++){ const o=actor('cop'+i, W.people.seedFor(i?'f':'m', 1400+i*13), COP_OUT, i?'👮 Cảnh sát 113 · Ngọc':'👮 Cảnh sát 113 · Dũng'); show(o, g.x+rx*(car.hw||1)*1.6+fx*(i?-1.2:1.2), g.z+rz*(car.hw||1)*1.6+fz*(i?-1.2:1.2), h); E.cops.push(o); }
    E.carPos={x:g.x, z:g.z, h}; E._copsAt=Math.round(E.t*10)/10; if(car.target) car.target.arrived=true; if(car.special){ car.stopNow=true; }   /* xe đỗ lại ngay chỗ công an xuống */ sayA(E.cops[0], '🚨 Công an đây! Đứng lại!', 2.5); if(E.phase==='flee' || E.phase==='down') E.phase='chase'; }
  function updTheft(E, dt, t){ const pd=PD(), th=E.th;
    if(E.phase==='approach'){ const tx=E.victim.player?P.x:E.victim.ped.x, tz=E.victim.player?P.z:E.victim.ped.z; const d=moveTo(th, tx, tz, 3.6, dt); if(d<1.1 || E.t>12) theftSteal(E); }
    else if(E.phase==='flee' || (E.phase==='chase' && th.lie<=0 && !E.caught)){ // chạy dọc vỉa hè, xa người chơi
      const o={}; E.s+=E.dir*2.6*dt; if(E.s<0 || E.s>E.L.len){ const end=E.L.ends[E.s<0?0:1], nx=end.links.find(l=>!l.cross); if(nx){ E.L=nx.to.L; E.dir=nx.to.at===0?1:-1; E.s=nx.to.at===0?0:E.L.len; } else { E.dir=-E.dir; E.s=clamp(E.s,0,E.L.len); } }
      pd.lanePos(E.L, E.s, 0, o); moveTo(th, o.x, o.z, 2.6, dt); th.v=2.6;
      if(E.special && E.special.arrived && !E.cops.length && E.specOnArrive) E.specOnArrive(E.special);
      if(E.phase==='flee' && E.t-E.tFlee>22 && !E.cops.length){ const v=E.car || E.special; if(v && Math.hypot(v.g.position.x-th.x, v.g.position.z-th.z)<90) copsOut(E, v); else if(E.t-E.tFlee>30){ const g={g:{position:{x:th.x+8, z:th.z+8}}, h:0, hw:1}; copsOut(E, g); } }   // xe chưa tới kịp → công an xuống xe chạy bộ đuổi
    }
    if(E.phase==='chase'){ if(th.lie>0) th.v=0; let caught=false;
      E.cops.forEach((c,i)=>{ if(E.caught) return; const d=moveTo(c, th.x+(i?-.6:.6), th.z+(i?.4:-.4), 5.8, dt); if(d<.9) caught=true; });
      if(caught && !E.caught){ E.caught=true; th.lie=1; th.v=0; E.tCaught=E.t; sayA(E.cops[0], '👮 Khoá tay! Đi về đồn!', 2.5); } }
    if(E.caught && E.phase==='chase' && E.t-E.tCaught>1.6){ th.lie=0; th.pose='cuffed'; E.cops[0].pose='grab'; E.phase='return';
      // dẫn trộm ra mép đường gần nhất; xe chạy tới đón (không bắt đi bộ xa)
      const n=W.roadNet.nearest(th.x, th.z, 40); if(n){ const dx=th.x-n.x, dz=th.z-n.z, l=Math.hypot(dx,dz)||1, k=n.e.w/2+.9; E.curb={x:n.x+dx/l*k, z:n.z+dz/l*k}; } else E.curb={x:th.x, z:th.z};
 }
    if(E.phase==='down'){ th.v=0; }   // bị người chơi hạ – chờ công an
    // nạn nhân (người đi đường) hoảng loạn chạy vòng kêu cứu
    if(!E.victim.player && E.victim.ped && E.victim.ped.state==='script' && E.phase!=='approach'){ const p=E.victim.ped; E.panic=(E.panic||0)+dt*1.4; const cx=E.x, cz=E.z, r=2.6, a=E.panic;
      if(!E.calm){ const tx=cx+Math.cos(a)*r, tz=cz+Math.sin(a)*r, dx=tx-p.x, dz=tz-p.z, d=Math.hypot(dx,dz); if(d>.05){ const st=Math.min(d,2.8*dt); p.x+=dx/d*st; p.z+=dz/d*st; p.v=2.8; p.hd=lerpAngle(p.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*8)); } if(E.t>14) E.calm=true; }
      else { p.v=0; p.sclip=null; } }
    if(E.phase==='return'){ const c0=E.cops[0], c1=E.cops[1];
      // cảnh sát 1 áp giải trộm về cửa sau xe
      const carOk=E.car && E.car.active && E.car.target && E.car.target.arrived, spOk=E.special && E.special.arrived;   // chỉ áp giải ra xe khi xe đã đỗ
      const cp=carOk ? E.car.g.position : spOk ? E.special.g.position : E.carPos, ch=carOk ? E.car.h : spOk ? E.special.h : E.carPos.h;
      const bx=cp.x-Math.sin(ch)*3.2-Math.cos(ch)*1.4, bz=cp.z-Math.cos(ch)*3.2+Math.sin(ch)*1.4;
      const atCar=carOk || spOk || !(E.car || E.special), d0=moveTo(th, bx, bz, 2.2, dt);   /* áp giải về xe đang đỗ (công an chạy bộ tới thì về chỗ hẹn) */ c0.x=th.x+Math.cos(th.hd)*.55; c0.z=th.z-Math.sin(th.hd)*.55; c0.hd=th.hd; c0.v=th.v;
      if(!E.tEsc) E.tEsc=E.t; if(!E.jailed && E.t-E.tEsc>30 && !th.a.root.visible){ th.x=bx; th.z=bz; }   /* áp giải quá lâu (ngoài tầm nhìn) → coi như đã lên xe */
      if(atCar && (d0<.4 || (E.t-E.tEsc>30 && !th.a.root.visible)) && !E.jailed){ E.jailed=true; hide(c0); try{ if(W.police && W.police.jail){ W.police.jail(th.a); th.on=false; CAST.delete(th.key); } else hide(th); }catch(e){ hide(th); } }
      // cảnh sát 2 tới chỗ nạn nhân, chào, trả tiền
      const vx=E.victim.player?P.x:E.victim.ped.x, vz=E.victim.player?P.z:E.victim.ped.z;
      if(!E.returned){ const d1=moveTo(c1, vx-Math.sin(c1.hd)*.0, vz, 2.2, dt); if(d1<1.6){ c1.v=0; c1.hd=Math.atan2(vx-c1.x, vz-c1.z); c1.pose='salute'; E.returned=true; E.tRet=E.t;
          sayA(c1, 'Của rơi đã thu hồi! Gửi lại bạn số tiền bị mất nhé! 👮‍♂️✅', 4.5);
          if(E.victim.player){ if(E.stolen>0) give(E.stolen, `✅ +${E.stolen} 💰 Công an trả lại tiền`); else toast('👮 Công an: "May quá, bạn chưa mất gì!"', 2600); }
          else { pd.say(E.victim.ped, 'Cảm ơn các anh công an! 🙏', 3); }
          if(W.police && W.police.stats) W.police.stats.returned++; cheerAt(E.x, E.z, '👏 Hoan hô các anh công an!', 3); } }
      else if(E.t-E.tRet>3.5){ c1.pose=null; const d2=moveTo(c1, bx, bz, 2.0, dt); if(d2<.6) hide(c1); if((!c1.on || E.t-E.tRet>40) && (E.jailed || E.t-E.tRet>45)){ hide(c1); E.phase='leave'; E.tLeave=E.t; } } }
    if(E.phase==='leave'){ if(E.car){ TR().release(E.car); E.car=null; } if(E.special){ E.special.siren=false; const st=W.police && W.police.station; if(st) E.special.goTo(st.front, {siren:false}); else E.special.remove(); E.spec2=E.special; E.special=null; }
      if(E.spec2 && (E.t-E.tLeave>25 || E.spec2.arrived)){ E.spec2.remove(); E.spec2=null; }
      if(!E.spec2) endEvent(E); }
    if(E.t>140) endEvent(E); }

  // ---------- B. CHÁY + XE CỨU HOẢ ----------
  function fireStation(){ const cv=W.cbdV2 && W.cbdV2.civic; if(cv && cv.F){ const F=cv.F; return {x:F.bays[1]+204.5, z:F.z1+50+3.4}; } return null; }   // civic.js dời vào CBD (dx 204.5, dz 50)
  function startFire(){ const spot=pickSpot(22,42); if(!spot) return 'Không có vỉa hè gần để diễn sự kiện.'; const pd=PD();
    // thùng rác bốc cháy sát mép trong vỉa hè (phía nhà), không chắn lối giữa
    const o={}; pd.lanePos(spot.L, spot.s, spot.L.side*0, o); const e=spot.L.e; const n=W.roadNet.nearest(o.x,o.z,30); let ox=0, oz=0; if(n){ const dx=o.x-n.x, dz=o.z-n.z, l=Math.hypot(dx,dz)||1; ox=dx/l*1.6; oz=dz/l*1.6; } void e;
    const E={key:'B', label:'🔥 Cháy trên phố', x:o.x+ox, z:o.z+oz, y:gAtY(o.x+ox,o.z+oz,(spot.y??2)+1), t:0, phase:'burn', fire:0, steam:0, crew:[], truck:null};
    const f=fx(); f.bin.position.set(E.x, E.y, E.z); f.bin.rotation.y=R()*6; f.bin.visible=true; E.col={x:E.x, z:E.z, r:1.1}; W.circles.push(E.col);
    pd.crowd(E.x, E.z, 'watch', {r:30, t:80, ring:12}); setTimeoutF(()=>{ const w=pd.peds.filter(p=>p.state==='watch' && Math.hypot(p.x-E.x,p.z-E.z)<20).slice(0,2); w.forEach((p,i)=>setTimeoutF(()=>pd.say(p,'🔥 Cháy rồi! Gọi 114 mau!',3.5), i*.8)); }, 2.5);
    toast('🔥 Có cháy trên phố! Xe cứu hoả 114 đang tới…', 3500);
    const tr=TR(); let from=fireStation(); if(from){ const r=W.roadNet.route(from, {x:E.x, z:E.z}); if(!r || r.len>260) from=null; }   // trạm cứu hoả CBD gần → xuất phát từ trạm
    const nn=W.roadNet.nearest(E.x, E.z, 40); E.truck=tr && from ? tr.spawnVehicle('fire', {x:E.x, z:E.z}, {from, stop:(nn ? nn.d : 10)+5}) : null; if(!E.truck) E.truck=callResponder(E, 'fire', E.x, E.z);   // xa → xe trực chiến gần nhất (~80–130 m)
    E.tArr=null;
    ACTIVE.push(E); stats.B++; return E; }
  function updFire(E, dt, t){ const pd=PD();
    if(E.phase==='burn'){ E.fire=Math.min(1, E.fire+dt*.5); if((E.truck && E.truck.arrived) || (!E.truck && E.t>18) || E.t>70){ E.phase='crew'; crewOut(E); } }
    else if(E.phase==='crew'){ let ready=true; E.crew.forEach((c,i)=>{ const a=(i-1)*.55+Math.atan2(c.sx-E.x, c.sz-E.z), r=5.2, tx=E.x+Math.sin(a)*r, tz=E.z+Math.cos(a)*r; const d=moveTo(c, tx, tz, 2.4, dt); if(d>.15) ready=false; else { c.v=0; c.hd=lerpAngle(c.hd, Math.atan2(E.x-c.x, E.z-c.z), 1-Math.exp(-dt*6)); } });
      if(ready || E.t-E.tCrew>25){ E.phase='spray'; E.tSpray=E.t; E.crew.forEach(c=>{ c.pose='hose'; c.hd=Math.atan2(E.x-c.x, E.z-c.z); }); sayA(E.crew[0], '💦 Phun nước! Dập lửa!', 2.5); } }
    else if(E.phase==='spray'){ const u=(E.t-E.tSpray)/12; E.fire=Math.max(0, 1-u*1.08); E.steam=Math.min(1, u*1.4); drawWater(E, t, true);
      if(u>=1){ E.phase='steam'; E.tSteam=E.t; drawWater(E,t,false); E.crew.forEach(c=>c.pose=null); if(W.police && W.police.stats) W.police.stats.fires++; cheerAt(E.x, E.z, '👏 Cảm ơn lính cứu hoả!', 3); sayA(E.crew[1], '✅ Đã dập tắt hoàn toàn!', 3); } }
    else if(E.phase==='steam'){ E.steam=Math.max(0, 1-(E.t-E.tSteam)/5); if(E.t-E.tSteam>5){ E.phase='pack'; E.tPack=E.t; } }
    else if(E.phase==='pack'){ let all=true; for(const c of E.crew){ if(!c.on) continue; const d=moveTo(c, E.tp.x, E.tp.z, 2.0, dt); if(d<.6) hide(c); else all=false; } if(all || E.t-E.tPack>15){ E.crew.forEach(hide);
        if(E.truck){ E.truck.siren=false; const st=fireStation(); if(st && E.truck.goTo(st, {siren:false})){ E.leaving=E.truck; E.tGo=E.t; } else E.truck.remove(); E.truck=null; } E.phase='leave'; } }
    else if(E.phase==='leave'){ if(!E.leaving || E.leaving.arrived || E.t-E.tGo>25){ if(E.leaving) E.leaving.remove(); E.leaving=null; endEvent(E); } }
    drawFire(E, t); if(E.t>150) endEvent(E); }
  function crewOut(E){ const s=E.truck, g=s ? s.g.position : {x:E.x+8, z:E.z+8}, h=s ? s.h : 0, rx=-Math.cos(h), rz=Math.sin(h); E.tp={x:g.x+rx*2.2, z:g.z+rz*2.2}; E.tCrew=E.t;
    for(let i=0;i<3;i++){ const o=actor('ff'+i, W.people.seedFor('m', 1500+i*11), FIRE_OUT, '🚒 Lính cứu hoả 114'); show(o, E.tp.x-Math.sin(h)*(i-1)*1.4, E.tp.z-Math.cos(h)*(i-1)*1.4, h+Math.PI/2); o.sx=o.x; o.sz=o.z; E.crew.push(o); }
    toast('🚒 Lính cứu hoả 114 đã tới hiện trường!', 2500); }

  function endEvent(E){ const i=ACTIVE.indexOf(E); if(i<0) return; ACTIVE.splice(i,1); const pd=PD();
    if(E.key==='A'){ if(E.th && E.th.on) hide(E.th); E.cops.forEach(hide); if(E.car){ TR().release(E.car); E.car=null; } if(E.special){ E.special.remove(); } if(E.spec2) E.spec2.remove(); if(E.victim && E.victim.ped && pd) pd.give(E.victim.ped); }
    if(E.key==='B'){ const f=fx(); f.flame.visible=f.smoke.visible=f.steam.visible=f.water.visible=f.glow.visible=false; f.bin.visible=false; const j=W.circles.indexOf(E.col); if(j>=0) W.circles.splice(j,1); E.crew.forEach(hide); if(E.truck) E.truck.remove(); if(E.leaving) E.leaving.remove(); }
    NEXT=150+R()*90; }

  /* ============================== PHÍM: 3 đấm (giữ nguyên hành vi gốc) · Shift+1…9 diễn tập ============================== */
  if(HOOK.keys){ const orig=HOOK.keys.Digit3; HOOK.keys.Digit3=(...a)=>{ const r=orig ? orig(...a) : undefined; try{ onPunch(); }catch(e){} return r; }; }
  function onPunch(){ for(const E of ACTIVE){ if(E.key!=='A' || !E.th || !E.th.on || E.th.lie>0 || E.caught || !['flee','approach'].includes(E.phase)) continue; const th=E.th, dx=th.x-P.x, dz=th.z-P.z, d=Math.hypot(dx,dz);
      const fx=Math.sin(P.face||0), fz=Math.cos(P.face||0); if(d<1.8 && (dx*fx+dz*fz)/Math.max(d,.01)>.2){ th.lie=1; th.v=0; E.phase=E.cops.length?'chase':'down'; E.caught=false; give(30, '👊 Bạn đã hạ gục tên trộm! +30 💰 – chờ công an tới còng tay'); sayA(th,'😵 Á…',1.5); if(E.phase==='down' && E.cops.length===0){ /* công an vẫn đang tới */ } } } }
  const KEYS={Digit1:'A', Digit2:'B'};
  addEventListener('keydown', (e)=>{ if(!e.shiftKey || !/^Digit[1-9]$/.test(e.code)) return; const tg=document.activeElement; if(tg && /input|textarea|select/i.test(tg.tagName)) return;
    e.preventDefault(); e.stopImmediatePropagation(); const k=KEYS[e.code]; if(!k){ toast('🧪 Sự kiện C · D sẽ có ở đợt 2 của Pha 10.', 2500); return; } trigger(k); }, true);

  /* ============================== KHUNG HÌNH + HẸN GIỜ ============================== */
  let NEXT=150+R()*60, lastT=0;
  function trigger(key){ if(ACTIVE.some(e=>e.key===key)){ toast('⏳ Sự kiện này đang diễn ra.', 2000); return null; } const r=key==='A' ? startTheft() : key==='B' ? startFire() : 'Chưa có sự kiện '+key; if(typeof r==='string'){ toast('🧪 '+r, 2600); return null; } return r; }
  HOOK.onFrame.push((dtIn)=>{ const dt=Math.min(dtIn,.1), t=W.T??0; lastT=t;
    for(let i=timers.length-1;i>=0;i--){ timers[i].t-=dt; if(timers[i].t<=0){ const f=timers[i].fn; timers.splice(i,1); try{ f(); }catch(e){} } }
    for(const E of ACTIVE.slice()){ E.t+=dt; try{ if(E.key==='A') updTheft(E, dt, t); else if(E.key==='B') updFire(E, dt, t); }catch(err){ console.warn('[events]', E.key, err); endEvent(E); } }
    for(const o of CAST.values()) if(o.on) tickActor(o, dt, t);
    if(Math.hypot(P.x-(ACTIVE[0]?.x??P.x), P.z-(ACTIVE[0]?.z??P.z))>160) for(const E of ACTIVE.slice()) endEvent(E);   // người chơi đi xa / dịch chuyển → kết thúc gọn
    if(W.inside || ACTIVE.length) return; NEXT-=dt;
    if(NEXT<=0){ NEXT=30; const pd=PD(); if(pd && pd.LANES && pd.peds.some(p=>p.state!=='off')){ const k=(T0++)%2 ? 'B' : 'A'; const r=key2(k); if(!r) NEXT=45; } } });
  const key2=k=>{ const r=k==='A' ? startTheft() : startFire(); return typeof r==='string' ? null : r; };

  const LIST=[{key:'A', name:'🦹 Trộm móc túi & công an truy đuổi', hotkey:'Shift+1'}, {key:'B', name:'🔥 Cháy trên phố & xe cứu hoả 114', hotkey:'Shift+2'}];
  console.info('[QC World V2] Sự kiện đường phố (Pha 10 – đợt 1): A trộm & truy đuổi · B cháy & cứu hoả – Shift+1 / Shift+2');
  return {list:LIST, trigger, active:()=>ACTIVE.map(e=>({key:e.key, label:e.label, x:e.x, z:e.z, phase:e.phase, t:e.t})), stop(){ for(const E of ACTIVE.slice()) endEvent(E); }, stats, _ACTIVE:ACTIVE, _CAST:CAST};
}
