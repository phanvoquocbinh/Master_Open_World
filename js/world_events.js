// QC World V2 – Pha 10: BỘ ĐIỀU PHỐI SỰ KIỆN ĐƯỜNG PHỐ (đặc tả docs/PHA10_AN_NINH_SU_KIEN.md · phiên bot đi bộ, 16/11/2026)
//  ĐỢT 1:
//   A 🦹 Trộm móc túi & công an truy đuổi – trộm áp sát người chơi (trừ tạm ≤ 50 💰) hoặc 1 người đi đường (nạn nhân hoảng loạn kêu cứu), bỏ chạy dọc vỉa hè;
//     người chơi đuổi kịp + phím 3 (đấm) → trộm ngã, thưởng +30 💰; xe tuần tra gần nhất hú còi chớp đèn lao tới, 2 cảnh sát chạy 5,8 m/s quật ngã, khoá tay;
//     1 người trả lại tiền + chào điều lệnh, 1 người áp giải trộm lên xe → buồng tạm giữ Sở Cảnh Sát; người xem vỗ tay "👏 Hoan hô các anh công an!".
//   B 🔥 Cháy trên phố & xe cứu hoả 114 – lửa + khói cao ~4 m (ánh cam nhấp nháy), dân lùi ra đứng xem hô "🔥 Cháy rồi! Gọi 114 mau!"; xe cứu hoả từ trạm (CBD)
//     hú còi chạy theo roadNet, 3 lính cứu hoả phun vòi rồng 12 s → lửa nhỏ dần, bốc hơi trắng, tắt; đám đông vỗ tay; xe thu vòi chạy về trạm.
//  ĐỢT 2:
//   C 👾 Yêu quái "Memory-Leak Behemoth" (thiết kế gốc, cao ~7,5 m) chui ra từ cổng xoáy tím đen, gầm, dân bỏ chạy, xe dừng; siêu nhân "Captain QA"
//     (thiết kế gốc: áo xanh lam, giáp vàng, áo choàng đỏ, huy hiệu QA, khiên) lao xuống từ y +140, đáp kiểu siêu anh hùng + sóng xung kích; đánh 20 s
//     (đấm trên không, đỡ khiên, tụ năng lượng) → tia HOTFIX HYPER BEAM → yêu quái nổ pháo hoa, rơi 10 pha lê (+10 💰/viên khi nhặt); dân vây vỗ tay chụp ảnh; bay vút lên mây.
//   D1 🚑 Cấp cứu 115 · D2 💰 Xe chở tiền rơi 15 túi xu (nhặt +10, trả tài xế thưởng ×3) · D3 💥 Va chạm nhẹ + CSGT hoà giải · D4 🎶 Flashmob (F nhảy cùng +40 💰)
//   D5 🧋 Robot trà sữa lỗi AI (E debug +35 💰) · D6 🏮 Lễ hội đèn trời (chỉ khi W.night > .5).
//  Khi sự kiện bắt đầu: toast chỉ hướng ("📍 bên trái ~32 m") + nhãn 📍 nổi trên hiện trường.
//  Kích hoạt luân phiên quanh người chơi mỗi ~2–3,5 phút khi ở ngoài trời; gọi thử: Shift+1…9 = A, B, C, D1…D6 (phím 1–6 cử chỉ, 3 đấm, F nhảy giữ nguyên).
//  API: W.events.list ({key, name, hotkey} – để gắn menu Debug Laptop) · W.events.trigger(key, {force}) · W.events.active() · W.events.stop()
//  Hiệu năng: rảnh = 0 lượt vẽ (diễn viên ẩn, hiệu ứng ẩn); đang diễn ≈ 10–30 lượt vẽ.

import { makePoser } from './pose.js';

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
      case 'kneel': for(const [s,k] of [['Left',-1],['Right',1]]){ aim(o,s+'UpLeg',s+'Leg',k<0?V3(.95,-.3,-.12):V3(-.05,-1,.12)); aim(o,s+'Leg',s+'Foot',k<0?V3(-.05,-1,0):V3(-1,-.1,0)); aim(o,s+'Arm',s+'ForeArm',V3(.7,-.7,k*.2)); aim(o,s+'ForeArm',s+'Hand',V3(.6,-.8,-k*.15)); } break;   // quỳ sơ cứu
      case 'hand': aim(o,'RightArm','RightForeArm',V3(.75,-.6,.12)); aim(o,'RightForeArm','RightHand',V3(1,Math.sin(t*7)*.15,-.1)); break;   // bắt tay
      case 'clap': { const c=Math.abs(Math.sin(t*9))*.22; for(const [s,k] of [['Left',-1],['Right',1]]){ aim(o,s+'Arm',s+'ForeArm',V3(.55,-.55,k*.35)); aim(o,s+'ForeArm',s+'Hand',V3(.75,.45,-k*(.35+c))); } } break;
    } }
  const _u=new THREE.Vector3();
  function tickActor(o, dt, t){ if(!o.on) return; const a=o.a;
    if(o.lie>0){ a.g.position.set(o.x, o.y+.18, o.z); a.g.rotation.set(-Math.PI/2+.05, o.hd, 0, 'YXZ'); a.play('idle',.2); }
    else if(o.fly){ a.g.position.set(o.x,o.y,o.z); a.g.rotation.set(o.pitch||0, o.hd, 0, 'YXZ'); a.play('idle',.25); }   /* bay (siêu nhân): không bám mặt đất */
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
  // vị trí (m tính từ đầu a) của điểm gần (x,z) nhất trên cạnh e – cạnh là polyline thưa nên quét đều 2 m
  function projS(e, x, z){ const o={}; let best=0, bd=1e9; for(let d=0; d<=e.len; d+=2){ W.roadNet.edgePt(e,d,o); const dd=(o.x-x)**2+(o.z-z)**2; if(dd<bd){ bd=dd; best=d; } } return best; }
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
    { const nn2=W.roadNet.nearest(x, z, 40); if(nn2 && nn2.e.w>=9){ const e=nn2.e, sA=projS(e, x, z);   // ưu tiên: xe chạy dọc chính đoạn đường hiện trường, xuất phát cách ~95 m
        for(const [nd, rr] of (R()<.5 ? [[e.a, sA],[e.b, e.len-sA]] : [[e.b, e.len-sA],[e.a, sA]])){ if(rr<45) continue; const s=tr.spawnVehicle(kind, {x, z}, {from:nd, stop:stopR}); if(s){ s.s=Math.max(0, rr-95); s.v=10; E._resp='xe trực chiến gần'; if(kind==='police'){ E.special=s; E.specOnArrive=onArrive; } return s; } } } }
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
    if(E.end) try{ E.end(); }catch(e){ console.warn('[events] end', E.key, e); }
    if(E.mark){ W.removeLabel(E.mark); E.mark=null; }
    NEXT=150+R()*90; }

  /* ============================== CHỈ HƯỚNG: toast có hướng + nhãn 📍 tại hiện trường ============================== */
  function announce(E, text){ const dx=E.x-P.x, dz=E.z-P.z, d=Math.round(Math.hypot(dx,dz)); const fw=new THREE.Vector3(); W.camera.getWorldDirection(fw); fw.y=0; fw.normalize();
    const a=dx*fw.x+dz*fw.z, b=dx*(-fw.z)+dz*fw.x, dir=a>Math.abs(b)*1.2 ? 'phía trước mặt' : a<-Math.abs(b) ? 'phía sau lưng' : b>0 ? 'bên phải' : 'bên trái';
    toast(`${text} 📍 ${dir} ~${d} m`, 5200); if(W.makeLabel && !E.mark) E.mark=W.makeLabel('📍 '+E.label, 'Sự kiện đường phố', {x:E.x, y:(E.y??P.y??2)+6.5, z:E.z, h:.55, fade:180}); }
  const pdPick=(x, z, r, n, pred=()=>true)=>{ const pd=PD(); if(!pd) return []; return pd.peds.filter(p=>p.state==='walk' && !p.cop && p.kind==='walk' && !p.fol.length && !p.lead && Math.hypot(p.x-x,p.z-z)<r && pred(p)).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)).slice(0,n).map(p=>pd.borrow(p)).filter(Boolean); };
  const pedLie=(p, on)=>{ const a=p.a; if(on){ a.g.position.set(p.x, p.y+.18, p.z); a.g.rotation.set(-Math.PI/2+.05, p.hd, 0, 'YXZ'); } else a.g.rotation.set(0, p.hd, 0); };
  const stepPed=(p, x, z, v, dt)=>{ const dx=x-p.x, dz=z-p.z, d=Math.hypot(dx,dz); if(d<.06){ p.v=0; return 0; } const st=Math.min(d, v*dt); p.x+=dx/d*st; p.z+=dz/d*st; p.y=gAtY(p.x,p.z,p.y+.5); p.v=v; p.hd=lerpAngle(p.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*8)); return d-st; };
  // gắn vật vào xương (bù tỉ lệ khung xương Mixamo)
  function onBone(o, name, mesh, x=0, y=0, z=0){ const b=o.bones[name]; if(!b) return null; const ws=new THREE.Vector3(); b.getWorldScale(ws); mesh.scale.multiplyScalar(1/(ws.x||1)); mesh.position.set(x/(ws.x||1), y/(ws.y||1), z/(ws.z||1)); b.add(mesh); return mesh; }
  let RING=null; const ringFX=(()=>{ let m=null; return (x,y,z,col,t0)=>{ if(!m){ m=new THREE.Mesh(new THREE.RingGeometry(.8,1.2,40), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, toneMapped:false})); m.rotation.x=-Math.PI/2; m.userData.dynamic=true; m.visible=false; scene.add(m); }
    m.material.color.set(col); m.position.set(x,y+.08,z); m.visible=true; m.userData.t0=t0; RING=m; return m; }; })();
  function updRing(t){ if(!RING || !RING.visible) return; const u=t-RING.userData.t0; if(u>1.1 || u<0){ RING.visible=false; return; } RING.scale.setScalar(1+u*11); RING.material.opacity=1-u/1.1; }   /* sóng xung kích lan rộng rồi tắt */

  /* ============================== C. YÊU QUÁI "MEMORY-LEAK BEHEMOTH" & SIÊU NHÂN "CAPTAIN QA" (thiết kế gốc) ============================== */
  let MON=null;
  function buildMonster(){ if(MON) return MON; const g=new THREE.Group(); g.visible=false; g.userData.dynamic=true; scene.add(g);
    const skin=new THREE.MeshStandardMaterial({color:0x3b2a5c, roughness:.55, metalness:.15, emissive:0x1a0830, emissiveIntensity:.5}), dark=new THREE.MeshStandardMaterial({color:0x22163a, roughness:.7});
    const glow=new THREE.MeshStandardMaterial({color:0x6ef2ff, emissive:0x3ae8ff, emissiveIntensity:2.2, roughness:.3}), eyeM=new THREE.MeshBasicMaterial({color:0xff3b3b, toneMapped:false});
    const M=(geo,mat,x,y,z,parent=g)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); parent.add(m); return m; };
    const body=M(new THREE.SphereGeometry(1,20,16),skin,0,3.7,0); body.scale.set(2.1,2.3,1.7);
    const head=new THREE.Group(); head.position.set(0,6.25,.35); g.add(head); const hd=M(new THREE.SphereGeometry(1,18,14),skin,0,0,0,head); hd.scale.set(1.15,.9,1.05);
    const jaw=M(new THREE.BoxGeometry(1.6,.45,1.1),dark,0,-.55,.45,head); for(const s of [-1,1]){ M(new THREE.SphereGeometry(.16,10,8),eyeM,s*.42,.18,.92,head); const h=M(new THREE.ConeGeometry(.22,1.1,10),dark,s*.7,.75,0,head); h.rotation.z=-s*.45; }
    for(let k=-2;k<=2;k++){ const t=M(new THREE.ConeGeometry(.08,.3,6),new THREE.MeshStandardMaterial({color:0xeeeeee}),k*.28,-.38,1.0,head); t.rotation.x=Math.PI; }
    const arms=[]; for(const s of [-1,1]){ const sh=new THREE.Group(); sh.position.set(s*2.05,5.0,0); g.add(sh); const up=M(new THREE.CylinderGeometry(.55,.45,2.8,12),skin,0,-1.35,0,sh); const fist=M(new THREE.SphereGeometry(.75,14,12),dark,0,-2.9,.1,sh); void up; void fist; arms.push(sh); }
    for(const s of [-1,1]){ M(new THREE.CylinderGeometry(.75,.65,2.4,12),skin,s*1.05,1.25,0); M(new THREE.BoxGeometry(1.2,.4,1.6),dark,s*1.05,.2,.25); }
    // khối "bộ nhớ" phát sáng trên lưng + giọt dữ liệu rò rỉ
    const blocks=new THREE.InstancedMesh(new THREE.BoxGeometry(.42,.42,.42), glow, 16), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler();
    for(let i=0;i<16;i++){ const a=(i/16)*Math.PI*1.6-Math.PI*.8, yy=2.6+(i%4)*.75; e.set(R()*.6,R()*.6,R()*.6); q.setFromEuler(e); m4.compose(new THREE.Vector3(Math.sin(a)*1.9, yy, -Math.cos(a)*1.45), q, new THREE.Vector3(1,1,1)); blocks.setMatrixAt(i,m4); } g.add(blocks);
    const drips=new THREE.InstancedMesh(new THREE.SphereGeometry(.12,8,6), glow, 18); drips.frustumCulled=false; g.add(drips);
    const anchor=new THREE.Object3D(); anchor.position.set(0,8.2,0); g.add(anchor);
    MON={g, head, jaw, arms, drips, dd:Array.from({length:18},()=>({x:(R()-.5)*3, y:2+R()*4, z:-1-R(), v:0})), anchor}; return MON; }
  function heroActor(){ const o=actor('hero', W.people.seedFor('m', 2026), {shirt:0x1d4ed8, pants:0xd4a017, long:true, shoe:0xd4a017, style:'short', hair:0x2a1d16, glasses:false, dress:false, skirt:false, shorts:false}, '⚡ Captain QA');
    if(!o.cape){ const capeM=new THREE.MeshStandardMaterial({color:0xc81d25, roughness:.6, side:THREE.DoubleSide}); o.cape=onBone(o,'Spine2', new THREE.Mesh(new THREE.PlaneGeometry(.78,1.35,1,4).translate(0,-.62,0), capeM), 0, .12, -.17); if(o.cape) o.cape.rotation.x=.18;
      const c=document.createElement('canvas'); c.width=c.height=128; const g2=c.getContext('2d'); g2.fillStyle='#d4a017'; g2.beginPath(); g2.arc(64,64,60,0,7); g2.fill(); g2.fillStyle='#0b2a6b'; g2.font='900 64px "Segoe UI",sans-serif'; g2.textAlign='center'; g2.textBaseline='middle'; g2.fillText('QA',64,68);
      const tx=new THREE.CanvasTexture(c); tx.colorSpace=THREE.SRGBColorSpace; onBone(o,'Spine2', new THREE.Mesh(new THREE.CircleGeometry(.13,24), new THREE.MeshBasicMaterial({map:tx})), 0, .08, .16);
      o.visor=onBone(o,'Head', new THREE.Mesh(new THREE.BoxGeometry(.2,.05,.04), new THREE.MeshStandardMaterial({color:0xffd23f, emissive:0xffb000, emissiveIntensity:1.2})), 0, .08, .11);
      o.shield=onBone(o,'LeftForeArm', new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.05,28).rotateZ(Math.PI/2), new THREE.MeshStandardMaterial({color:0x1d4ed8, metalness:.7, roughness:.3, emissive:0x0a2a8a, emissiveIntensity:.6})), 0, .16, 0); if(o.shield) o.shield.visible=false; }
    return o; }
  // tư thế riêng cho siêu nhân (ngắm xương)
  function heroPose(o, kind, t){ F.set(Math.sin(o.hd),0,Math.cos(o.hd)); Rt.set(-F.z,0,F.x);
    if(kind==='hover'){ for(const [s,k] of [['Left',-1],['Right',1]]){ aim(o,s+'Arm',s+'ForeArm',V3(.2,-.55,k*.8)); aim(o,s+'ForeArm',s+'Hand',V3(.3,-.3,k*.9)); aim(o,s+'UpLeg',s+'Leg',V3(-.05,-1,k*.08)); aim(o,s+'Leg',s+'Foot',V3(-.25,-1,0)); } }
    else if(kind==='dive'){ aim(o,'RightArm','RightForeArm',V3(.25,1,.2)); aim(o,'RightForeArm','RightHand',V3(.1,1,0)); aim(o,'LeftArm','LeftForeArm',V3(-.2,-.6,-.7)); }
    else if(kind==='land'){ aim(o,'LeftUpLeg','LeftLeg',V3(.9,-.35,-.15)); aim(o,'LeftLeg','LeftFoot',V3(-.1,-1,0)); aim(o,'RightUpLeg','RightLeg',V3(-.15,-.75,.15)); aim(o,'RightLeg','RightFoot',V3(-1,-.15,0));
      aim(o,'RightArm','RightForeArm',V3(.25,-1,.25)); aim(o,'RightForeArm','RightHand',V3(.1,-1,0)); aim(o,'LeftArm','LeftForeArm',V3(-.5,-.2,-.8)); aim(o,'LeftForeArm','LeftHand',V3(-.6,.1,-.7)); }
    else if(kind==='punch'){ aim(o,'RightArm','RightForeArm',V3(1,.05,.05)); aim(o,'RightForeArm','RightHand',V3(1,0,0)); aim(o,'LeftArm','LeftForeArm',V3(.2,-.6,-.6)); aim(o,'LeftForeArm','LeftHand',V3(.7,.6,.2)); }
    else if(kind==='block'){ aim(o,'LeftArm','LeftForeArm',V3(.75,.15,-.25)); aim(o,'LeftForeArm','LeftHand',V3(.2,.9,.4)); aim(o,'RightArm','RightForeArm',V3(.2,-.8,.4)); }
    else if(kind==='beam'){ for(const [s,k] of [['Left',-1],['Right',1]]){ aim(o,s+'Arm',s+'ForeArm',V3(1,.1,k*.12)); aim(o,s+'ForeArm',s+'Hand',V3(1,.05,-k*.12)); } }
    else if(kind==='wave'){ aim(o,'RightArm','RightForeArm',V3(.1,.8,.6)); aim(o,'RightForeArm','RightHand',V3(Math.sin(t*8)*.5,1,.2)); } }
  let CFX=null; function cfx(){ if(CFX) return CFX; const add=(geo,col,op=.9)=>{ const m=new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:op, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, toneMapped:false})); m.visible=false; m.userData.dynamic=true; m.renderOrder=4; scene.add(m); return m; };
    const swirl=tex((g,w,h)=>{ const cx=w/2, cy=h/2; for(let r=w/2;r>2;r-=2){ g.strokeStyle=`rgba(${120+((r*7)%80)},${20},${200-((r*5)%90)},${.5*(r/(w/2))})`; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,r,r*.15,r*.15+Math.PI*1.4); g.stroke(); } const gr=g.createRadialGradient(cx,cy,0,cx,cy,w*.25); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(30,0,50,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); },256,256);
    const portal=new THREE.Mesh(new THREE.CircleGeometry(6,48), new THREE.MeshBasicMaterial({map:swirl, transparent:true, depthWrite:false, side:THREE.DoubleSide, toneMapped:false})); portal.rotation.x=Math.PI/2; portal.visible=false; portal.userData.dynamic=true; portal.renderOrder=3; scene.add(portal);
    const prim=add(new THREE.TorusGeometry(6,.35,10,48), 0xb44dff, .85); prim.rotation.x=Math.PI/2;
    const ball=add(new THREE.SphereGeometry(.5,18,14), 0xfff3b0, .95), beam=add(new THREE.CylinderGeometry(.35,.35,1,14,1,true).rotateX(Math.PI/2).translate(0,0,.5), 0xfff6c8, .85);
    const crys=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.32,0), new THREE.MeshStandardMaterial({color:0x7ef9ff, emissive:0x2bd9ff, emissiveIntensity:1.6, roughness:.15, metalness:.3}), 10); crys.frustumCulled=false; crys.visible=false; crys.userData.dynamic=true; scene.add(crys);
    CFX={portal, prim, ball, beam, crys}; return CFX; }
  function startMonster(){ const spot=pickSpot(26,44); if(!spot) return 'Không tìm được quảng trường / đại lộ gần.'; const pd=PD();
    const n=W.roadNet.nearest(spot.x, spot.z, 40); const x=n ? n.x+(spot.x-n.x)*.35 : spot.x, z=n ? n.z+(spot.z-n.z)*.35 : spot.z;   // đáp giữa đại lộ / mép vỉa hè
    const E={key:'C', label:'👾 Yêu quái & Captain QA', x, z, y:gAtY(x,z,(spot.y??2)+2), t:0, phase:'portal', crys:[], got:0};
    const mon=buildMonster(), f=cfx(); mon.g.visible=false; f.portal.visible=f.prim.visible=true; f.portal.position.set(x,E.y+22,z); f.prim.position.copy(f.portal.position); f.portal.scale.setScalar(.01); f.prim.scale.setScalar(.01);
    E.col={x, z, r:2.6}; announce(E, '🌀 Cổng xoáy tím đen mở ra trên trời – yêu quái sắp xuất hiện!');
    E.upd=(dt,t)=>updMonster(E,dt,t); E.end=()=>{ mon.g.visible=false; f.portal.visible=f.prim.visible=f.ball.visible=f.beam.visible=f.crys.visible=false; const j=W.circles.indexOf(E.col); if(j>=0) W.circles.splice(j,1); const h=CAST.get('hero'); if(h){ hide(h); h.fly=false; if(h.shield) h.shield.visible=false; } if(MON.bub){ W.removeLabel(MON.bub); MON.bub=null; } };
    ACTIVE.push(E); stats.C=(stats.C||0)+1; return E; }
  function monSay(text, sec=2.5){ if(MON.bub) W.removeLabel(MON.bub); MON.bub=W.makeLabel(text, null, {fs:40, h:.32, follow:MON.anchor, bg:'rgba(40,0,60,.9)', color:'#ffd6ff', fade:90}); MON.bubT=sec; }
  function updMonster(E, dt, t){ const pd=PD(), f=cfx(), mon=MON, g=mon.g, T0=E.t;
    // cổng xoáy: lớn dần (0–2,5 s) → yêu quái rơi xuống (2,5–4,2 s) → cổng thu nhỏ
    const ps=T0<2.5 ? T0/2.5 : T0<6 ? 1 : Math.max(0, 1-(T0-6)/1.5); f.portal.scale.setScalar(Math.max(.01,ps)); f.prim.scale.setScalar(Math.max(.01,ps)); f.portal.rotation.z=t*1.6; f.prim.rotation.z=-t*.8; if(ps<=.01){ f.portal.visible=f.prim.visible=false; }
    if(E.phase==='portal' && T0>=2.5){ E.phase='fall'; g.visible=true; g.position.set(E.x, E.y+20, E.z); g.scale.setScalar(.25); g.rotation.set(0, Math.atan2(P.x-E.x, P.z-E.z), 0); }
    if(E.phase==='fall'){ const u=Math.min(1,(T0-2.5)/1.7); g.position.y=E.y+20-20*u*u; g.scale.setScalar(.25+.75*u);
      if(u>=1){ E.phase='roar'; W.burst && W.burst(new THREE.Vector3(E.x,E.y+.5,E.z), [0x8a7a6a,0x5a4a3a], 160, 9, 1.4, -6, .5); ringFX(E.x,E.y,E.z,0xb44dff,t); W.circles.push(E.col); monSay('GRAAAH!! 💥 Tôi là MEMORY-LEAK BEHEMOTH!', 3);
        if(pd) pd.crowd(E.x, E.z, 'flee', {r:45, t:20}); toast('👾 Yêu quái "Memory-Leak Behemoth" đáp xuống phố! Dân chạy tán loạn…', 3500); } }
    if(g.visible && E.phase!=='fall'){ // thở, vung tay, gầm
      const roar=Math.max(0, Math.sin(t*2.2)); mon.jaw.position.y=-.55-roar*.25; mon.head.rotation.x=-roar*.12; const hit=E.phase==='fight' ? Math.max(0, Math.sin(t*1.6)) : .3+.3*Math.sin(t*1.2);
      mon.arms[0].rotation.x=-hit*1.1; mon.arms[1].rotation.x=-(Math.max(0,Math.sin(t*1.6+Math.PI)))*1.1; mon.arms[0].rotation.z=.25; mon.arms[1].rotation.z=-.25; g.position.y=E.y+Math.abs(Math.sin(t*1.1))*.12;
      if(E.hero){ const h=E.hero; g.rotation.y=lerpAngle(g.rotation.y, Math.atan2(h.x-E.x, h.z-E.z), 1-Math.exp(-dt*2)); }
      PEDSblock(E); }
    else if(E.phase==='boom' || E.phase==='cheer' || E.phase==='leave' || (E.phase==='crystals' && E.t-E.leaveT<30)) PEDSblock(E, 8);   /* xe vẫn dừng khi siêu nhân + pha lê còn trên đường */
    // giọt dữ liệu rò rỉ
    if(g.visible){ const m4=_m; mon.dd.forEach((d,i)=>{ d.v+=9.8*dt; d.y-=d.v*dt; if(d.y<0){ d.y=2+R()*4; d.v=0; d.x=(R()-.5)*3; } m4.makeTranslation(d.x, d.y, d.z); mon.drips.setMatrixAt(i, m4); }); mon.drips.instanceMatrix.needsUpdate=true; }
    if(mon.bubT>0){ mon.bubT-=dt; if(mon.bubT<=0 && mon.bub){ W.removeLabel(mon.bub); mon.bub=null; } }
    // Captain QA bay xuống từ y +140
    if(E.phase==='roar' && T0>5.2){ E.phase='hero'; const h=heroActor(); E.hero=h; show(h, E.x+7, E.z+7, Math.atan2(E.x-(E.x+7), E.z-(E.z+7))); h.fly=true; h.y=E.y+140; E.heroT=T0; toast('⚡ Nhìn lên trời! CAPTAIN QA đang lao xuống!', 3000); sayA(h, '⚡ Captain QA đây! Không bug nào thoát!', 3.5); }
    if(E.hero){ const h=E.hero; h.pose=null;
      if(E.phase==='hero'){ const u=Math.min(1,(T0-E.heroT)/3); h.y=E.y+140*(1-u*u*(3-2*u)); h.hpose='dive'; if(u>=1){ E.phase='landed'; h.y=E.y; h.landT=T0; ringFX(h.x,E.y,h.z,0xffd23f,t); W.burst && W.burst(new THREE.Vector3(h.x,E.y+.4,h.z), [0xffd23f,0xffffff,0x6ec8ff], 140, 8, 1.1, -5, .35); } }
      else if(E.phase==='landed'){ h.y=E.y-.5; h.hpose='land'; if(T0-h.landT>1.4){ E.phase='fight'; E.fightT=T0; h.y=E.y+2; } }
      else if(E.phase==='fight'){ const u=T0-E.fightT, th=u*.95+.6, r=6.5+Math.sin(u*1.3)*.8; let tx=E.x+Math.sin(th)*r, tz=E.z+Math.cos(th)*r, ty=E.y+2.5+Math.sin(u*2.1)*1.2; h.hpose='hover';
          const cyc=u%3.2; if(cyc>2.4 && u<16){ const k=(cyc-2.4)/.8, ix=E.x+Math.sin(th)*2.4, iz=E.z+Math.cos(th)*2.4; tx=tx+(ix-tx)*Math.sin(k*Math.PI); tz=tz+(iz-tz)*Math.sin(k*Math.PI); ty=E.y+4.2; h.hpose='punch';
            if(!E.hitDone || E.hitDone<Math.floor(u/3.2)+1){ if(k>.45){ E.hitDone=Math.floor(u/3.2)+1; W.burst && W.burst(new THREE.Vector3(ix,E.y+4.4,iz), [0xffd23f,0xffffff], 90, 6, .6, -2, .3); sayA(h, ['💥 Unit test… FAIL cho mày!','💥 Regression đây!','💥 Assert! Assert!','💥 Code review cực gắt!'][E.hitDone%4], 1.4); mon.g.rotation.x=-.18; } } }
          else mon.g.rotation.x*=Math.exp(-dt*4);
          const sw=u%4; if(sw>3.2 && sw<3.9 && u<16){ h.hpose='block'; if(h.shield) h.shield.visible=true; if(!E.blockFX || E.blockFX<Math.floor(u/4)+1){ E.blockFX=Math.floor(u/4)+1; W.burst && W.burst(new THREE.Vector3(h.x,h.y+1.3,h.z), [0x6ec8ff,0xffffff], 60, 5, .5, 0, .25); monSay('ROAAR! 👊', 1.2); } } else if(h.shield) h.shield.visible=false;
          if(u>=16){ // tụ năng lượng + tia HOTFIX HYPER BEAM
            tx=E.x+Math.sin(E.beamA ??= th)*9; tz=E.z+Math.cos(E.beamA)*9; ty=E.y+4; h.hpose='beam'; if(h.shield) h.shield.visible=false; const hx=h.x+Math.sin(h.hd)*.8, hz=h.z+Math.cos(h.hd)*.8, hy=h.y+1.35;
            f.ball.visible=true; f.ball.position.set(hx,hy,hz); f.ball.scale.setScalar(Math.min(2.2, .3+(u-16)*1.1)+Math.sin(t*30)*.08);
            if(u>=17.8){ f.beam.visible=true; f.beam.position.set(hx,hy,hz); f.beam.lookAt(E.x, E.y+4.2, E.z); const L=Math.hypot(E.x-hx, E.z-hz, E.y+4.2-hy); f.beam.scale.set(1+Math.sin(t*40)*.15, 1+Math.sin(t*40)*.15, L); if(!E.beamSaid){ E.beamSaid=1; sayA(h, '⚡ HOTFIX HYPER BEAM!!!', 2.4); toast('⚡ HOTFIX HYPER BEAM!!!', 2200); }
              mon.g.traverse(m=>{ if(m.material && m.material.emissive && !m.isInstancedMesh) m.material.emissiveIntensity=2.5+Math.sin(t*40); }); }
            if(u>=19.6){ E.phase='boom'; E.boomT=T0; f.ball.visible=f.beam.visible=false; mon.g.visible=false; const j=W.circles.indexOf(E.col); if(j>=0) W.circles.splice(j,1); mon.g.traverse(m=>{ if(m.material && m.material.emissive && !m.isInstancedMesh) m.material.emissiveIntensity=.5; });
              const sets=[[0xff4f6d,0xffd23f],[0x4fc3ff,0xffffff],[0x46d39a,0xb4ff6b],[0xc77dff,0xff8fc2],[0xffa94d,0xfff3a0]]; for(let k=0;k<8;k++) setTimeoutF(()=>W.burst && W.burst(new THREE.Vector3(E.x+(R()-.5)*8, E.y+6+R()*10, E.z+(R()-.5)*8), sets[k%5], 200, 9, 2.2, -3, .5), k*.35);
              dropCrystals(E); toast('🎆 Yêu quái nổ tung thành pháo hoa! Nhặt 10 viên pha lê 💎 (+10 💰/viên)', 4500); } }
          const k2=1-Math.exp(-dt*5); h.x+=(tx-h.x)*k2; h.z+=(tz-h.z)*k2; h.y+=(ty-h.y)*k2; h.hd=lerpAngle(h.hd, Math.atan2(E.x-h.x, E.z-h.z), 1-Math.exp(-dt*8)); h.pitch=h.hpose==='punch'?-.35:0; }
      else if(E.phase==='boom' || E.phase==='cheer'){ // đáp xuống cạnh đám đông, vẫy chào
        const tx=E.x+3, tz=E.z+3; h.x+=(tx-h.x)*Math.min(1,dt*2); h.z+=(tz-h.z)*Math.min(1,dt*2); h.y+=(E.y-h.y)*Math.min(1,dt*2.5); h.pitch=0; h.hpose=E.phase==='cheer'?'wave':'hover'; h.hd=lerpAngle(h.hd, Math.atan2(P.x-h.x, P.z-h.z), 1-Math.exp(-dt*4));
        if(E.phase==='boom' && T0-E.boomT>2.2){ E.phase='cheer'; E.cheerT=T0; if(pd){ pd.crowd(E.x, E.z, 'watch', {r:60, t:16, ring:8}); setTimeoutF(()=>cheerAt(E.x, E.z, '📸👏 Captain QA vô địch!', 4), 2.5); } sayA(h, 'Thành phố an toàn rồi! Nhớ viết test đầy đủ nhé! 👋', 4); }
        if(E.phase==='cheer'){ if(R()<dt*6){ const w=pd && pd.peds.filter(p=>p.state==='watch'); const p=w && w.length && w[Math.floor(R()*w.length)]; if(p) W.burst && W.burst(new THREE.Vector3(p.x, p.y+1.6, p.z), [0xffffff], 14, 1.2, .25, 0, .25); }   // đèn flash chụp ảnh
          if(T0-E.cheerT>6){ E.phase='leave'; E.leaveT=T0; sayA(h,'Hẹn gặp lại! 🚀',2); } } }
      else if(E.phase==='leave' || E.phase==='crystals'){ if(h.on){ h.hpose='dive'; h.y+=dt*(10+(T0-E.leaveT)*28); if(h.y>E.y+160) hide(h); } }
      }
    if(E.phase==='leave' && T0-E.leaveT>4) E.phase='crystals';
    updCrystals(E, dt, t);
    if(E.phase==='crystals' && (E.got>=10 || T0-E.leaveT>60)) endEvent(E);
    if(T0>150) endEvent(E); }
  function PEDSblock(E, r=3.2){ const PE=W.PEDS; if(PE) PE.push({x:E.x, z:E.z, y:E.y, h:0, hw:r, hl:r}); }   // xe dừng trước yêu quái
  function dropCrystals(E){ E.crys=[]; for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+R()*.4, r=3+R()*4.5; let x=E.x+Math.cos(a)*r, z=E.z+Math.sin(a)*r; E.crys.push({x, z, y:E.y+7+R()*3, vy:0, gy:gAtY(x,z,E.y+3)+.5, on:true, ph:R()*6}); } cfx().crys.visible=true; }
  function updCrystals(E, dt, t){ if(!E.crys.length) return; const im=cfx().crys; E.crys.forEach((c,i)=>{ if(c.on){ if(c.y>c.gy){ c.vy-=14*dt; c.y=Math.max(c.gy, c.y+c.vy*dt); if(c.y===c.gy) c.vy=0; }
        if(Math.hypot(P.x-c.x, P.z-c.z)<1.5 && Math.abs((P.y??c.gy)-c.gy)<2.5 && c.y<=c.gy+.3){ c.on=false; E.got++; give(10, `💎 +10 💰 – pha lê ${E.got}/10`); W.burst && W.burst(new THREE.Vector3(c.x,c.y,c.z), [0x7ef9ff,0xffffff], 40, 3, .6, -2, .2); } }
      _e2.set(0, t*2+c.ph, 0); _q2.setFromEuler(_e2); _m.compose(_p.set(c.x, c.y+(c.on && c.y<=c.gy+.01 ? Math.sin(t*3+c.ph)*.12 : 0), c.z), _q2, c.on ? _s.set(1,1.4,1) : _s.set(0,0,0)); im.setMatrixAt(i,_m); }); im.instanceMatrix.needsUpdate=true; }
  const _e2=new THREE.Euler(), _q2=new THREE.Quaternion();

  /* ============================== D1. CẤP CỨU 115 ============================== */
  const MED_OUT={shirt:0xffffff, pants:0xffffff, long:true, shoe:0xf2f2f2, style:'cap', hair:40, glasses:false, dress:false, skirt:false, shorts:false};
  function hospital(){ const cv=W.cbdV2 && W.cbdV2.civic; return cv && cv.H ? {x:cv.H.door.x+204.5, z:cv.H.door.z+50-3} : null; }
  function startMedic(){ const pd=PD(); const ps=pdPick(P.x, P.z, 45, 1, p=>Math.hypot(p.x-P.x,p.z-P.z)>12); if(!ps.length) return 'Không có người đi đường gần đây.'; const p=ps[0];
    const E={key:'D1', label:'🚑 Cấp cứu 115', x:p.x, z:p.z, y:p.y, t:0, phase:'dizzy', p, med:[]}; pd.say(p, '😵 Chóng mặt quá… thức khuya fix bug 3 đêm liền…', 3); p.sclip=null; p.v=0;
    announce(E, '🚑 Có người ngất xỉu trên phố!');
    E.upd=(dt,t)=>{ const pdd=PD();
      if(E.phase==='dizzy'){ p.hd+=Math.sin(t*6)*dt*.6; if(E.t>2){ E.phase='down'; pdd.crowd(E.x, E.z, 'watch', {r:28, t:60, ring:6}); setTimeoutF(()=>{ const w=pdd.peds.filter(q=>q.state==='watch' && Math.hypot(q.x-E.x,q.z-E.z)<14)[0]; if(w) pdd.say(w,'🚑 Gọi 115 mau!',3); }, 1.5);
          let from=hospital(); if(from){ const r=W.roadNet.route(from,{x:E.x,z:E.z}); if(!r || r.len>140) from=null; }   /* bệnh viện gần → xuất phát từ bệnh viện, xa → xe 115 trực gần nhất */ const nn=W.roadNet.nearest(E.x,E.z,40), stop=(nn?nn.d:10)+5;
          E.amb=from ? TR().spawnVehicle('ambulance', {x:E.x, z:E.z}, {from, stop, top:1.45}) : null;   /* xe ưu tiên hú còi chạy nhanh hơn xe thường */ if(!E.amb) E.amb=callResponder(E, 'ambulance', E.x, E.z); } }
      if(E.phase!=='dizzy' && E.phase!=='up' && E.phase!=='leave') pedLie(p, true);
      if(E.phase==='down' && ((E.amb && E.amb.arrived) || E.t>45)){ E.phase='medics'; const a=E.amb, g=a ? a.g.position : {x:E.x+6, z:E.z+6}, h=a ? a.h : 0; E.ap={x:g.x-Math.cos(h)*2, z:g.z+Math.sin(h)*2};
        for(let i=0;i<2;i++){ const o=actor('med'+i, W.people.seedFor(i?'f':'m', 1600+i*9), MED_OUT, '🚑 Nhân viên y tế 115'); show(o, E.ap.x+i*.9, E.ap.z, h); E.med.push(o); } toast('🚑 Xe cấp cứu 115 đã tới!', 2500); }
      if(E.phase==='medics'){ let ok=true; E.med.forEach((o,i)=>{ const d=moveTo(o, E.x+(i?-.9:.9), E.z+.6, 2.2, dt); if(d>.1) ok=false; else { o.v=0; o.hd=Math.atan2(E.x-o.x, E.z-o.z); o.pose='kneel'; } }); if(ok){ E.phase='treat'; E.tt=E.t; sayA(E.med[0], '🩺 Sơ cứu… thở đều nào, uống chút nước!', 4); } }
      if(E.phase==='treat' && E.t-E.tt>6){ E.phase='up'; E.med.forEach(o=>o.pose=null); pedLie(p,false); p.y=gAtY(p.x,p.z,p.y+.5); pdd.say(p, 'Cảm ơn bác sĩ! Từ nay ngủ sớm 😅', 3.5); cheerAt(E.x, E.z, '👏 Tỉnh rồi! Cảm ơn 115!', 3); E.tu=E.t; }
      if(E.phase==='up' && E.t-E.tu>4){ E.phase='leave'; pdd.give(p); E.pGiven=true; }
      if(E.phase==='leave'){ let all=true; for(const o of E.med){ if(!o.on) continue; const d=moveTo(o, E.ap.x, E.ap.z, 2, dt); if(d<.5) hide(o); else all=false; } if(all || E.t-E.tu>25){ if(E.amb){ E.amb.siren=false; const hp=hospital(); if(!(hp && E.amb.goTo(hp,{siren:false}))) E.amb.remove(); E.lv=E.amb; E.amb=null; E.tl=E.t; } if(!E.lv || E.lv.arrived || E.t-E.tl>25){ endEvent(E); } } }
      if(E.t>130) endEvent(E); };
    E.end=()=>{ E.med.forEach(hide); if(!E.pGiven){ pedLie(p,false); PD() && PD().give(p); } if(E.amb) E.amb.remove(); if(E.lv) E.lv.remove(); };
    ACTIVE.push(E); return E; }

  // khoảng cách gần nhất từ 1 tuyến (roadNet.route) tới điểm (x,z) – lấy mẫu đều 5 m dọc tim đường (cạnh đường là polyline thưa)
  function routeMinD(r, x, z){ const RN=W.roadNet, o={}; let md=1e9; for(const sg of r.edges){ const e=sg.e; for(let d=0; d<=e.len; d+=5){ RN.edgePt(e,d,o); md=Math.min(md, Math.hypot(o.x-x, o.z-z)); } } return md; }
  const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(R()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

  /* ============================== D2. XE CHỞ TIỀN RƠI TÚI XU ============================== */
  let BAGS=null; function bagsIM(){ if(BAGS) return BAGS; const g1=new THREE.SphereGeometry(.28,12,10).scale(1,.85,1), g2=new THREE.ConeGeometry(.12,.22,10).translate(0,.3,0); const geo=W.mergeGeometries([g1.toNonIndexed(), g2.toNonIndexed()]);
    BAGS=new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({color:0xc9a227, roughness:.55, metalness:.35, emissive:0x3a2a00, emissiveIntensity:.4}), 15); BAGS.frustumCulled=false; BAGS.visible=false; BAGS.userData.dynamic=true; scene.add(BAGS); return BAGS; }
  function startCash(){ const RN=W.roadNet, cam=W.camera, fw=new THREE.Vector3(); cam.getWorldDirection(fw); fw.y=0; fw.normalize();
    const ok=n=>n.adj.length && Math.abs(n.y-(P.y??2))<5, dn=n=>Math.hypot(n.x-P.x,n.z-P.z), fwd=n=>((n.x-P.x)*fw.x+(n.z-P.z)*fw.z);
    const behind=shuffle(RN.nodes.filter(n=>ok(n) && dn(n)>45 && dn(n)<260 && fwd(n)<5)).slice(0,10), ahead=shuffle(RN.nodes.filter(n=>ok(n) && dn(n)>40 && dn(n)<200 && fwd(n)>-5)).slice(0,10);
    let best=null; const nr=RN.nearest(P.x, P.z, 40, P.y??null);
    if(nr && nr.e.w>=9){ const e=nr.e, o={}; for(const [st, sgn] of shuffle([[e.a,1],[e.b,-1]])){ const run=sgn>0 ? nr.s : e.len-nr.s; if(run<25 || run>230) continue;   // xe chạy dọc chính đoạn đường cạnh người chơi
        const ts=clamp(nr.s+sgn*90, 4, e.len-4); RN.edgePt(e, ts, o); if(Math.hypot(o.x-P.x,o.z-P.z)<20) continue; best={a:st, b:{x:o.x, z:o.z}, md:nr.d}; break; } }
    if(!best) for(const a of behind){ for(const b of ahead){ if(a===b) continue; const r=RN.route(a,b); if(!r || !r.edges.length || r.len>420) continue; const md=routeMinD(r, P.x, P.z); if(md<32 && (!best || md+r.len*.02<best.sc)) best={a, b, md, sc:md+r.len*.02}; } if(best && best.md<18) break; }
    if(!best) return 'Không có tuyến đường chạy ngang qua chỗ bạn.';
    const truck=TR().spawnVehicle('armored', {x:best.b.x, z:best.b.z}, {from:best.a, stop:6, top:.55});   /* from = nút đồ thị → xuất phát đúng nút đó */ if(!truck) return 'Không gọi được xe chở tiền.';
    const E={key:'D2', label:'💰 Xe chở tiền rơi túi xu', x:P.x, z:P.z, y:P.y, t:0, phase:'drive', truck, bags:[], dropT:0, mine:0, peds:[]}; bagsIM().visible=true;
    announce(E, '💰 Xe chở tiền bị bung cửa sau, túi xu rơi dọc đường!'); E.mark && (E.mark.x=best.b.x, E.mark.z=best.b.z);
    E.upd=(dt,t)=>{ const tr=truck, g=tr.g.position;
      if(E.phase==='drive'){ E.dropT-=dt; if(tr.v>2 && Math.hypot(g.x-P.x,g.z-P.z)<80 && E.dropT<=0 && E.bags.length<15){ E.dropT=1.2; const bx=g.x-Math.sin(tr.h)*2.8-Math.cos(tr.h)*1.3, bz=g.z-Math.cos(tr.h)*2.8+Math.sin(tr.h)*1.3; E.bags.push({x:bx, z:bz, y:g.y+1.2, gy:gAtY(bx,bz,g.y+1)+.22, vy:0, on:true}); W.burst && W.burst(new THREE.Vector3(bx,g.y+1,bz), [0xffd23f], 20, 2.5, .5, -6, .15); }
        if(tr.arrived || E.t>45){ E.phase='driver'; tr.hazard=true; const o=actor('drv', W.people.seedFor('m', 1700), {shirt:0x4b5563, pants:0x1d1f24, long:true, shoe:0x111111, style:'cap', hair:8}, '🚚 Tài xế xe chở tiền'); show(o, g.x-Math.cos(tr.h)*2.2, g.z+Math.sin(tr.h)*2.2, tr.h+Math.PI); E.drv=o; sayA(o, 'Ối! Rơi hết túi tiền rồi… ai nhặt được trả giúp với 😭', 5);
          E.inter={get x(){ return o.x; }, get z(){ return o.z; }, r:3, prio:.8, when:()=>E.mine>0 && E.phase==='driver', get label(){ return `🤝 Trả ${E.mine} túi tiền cho tài xế (E · thưởng ${E.mine*30} 💰)`; }, action:()=>{ const n=E.mine; E.mine=0; give(-10*n); give(30*n, `🏆 Tài xế thưởng ${30*n} 💰 cho người tốt bụng! (trả lại ${n} túi)`); sayA(o, 'Cảm ơn bạn rất nhiều! 🙏💰', 3.5); cheerAt(o.x, o.z, '👏 Người tốt việc tốt!', 3); E.tReturn=E.t; }}; W.INTER.push(E.inter); E.dt0=E.t; } }
      // túi rơi + người nhặt
      const im=bagsIM(); E.bags.forEach((b,i)=>{ if(b.on){ if(b.y>b.gy){ b.vy-=12*dt; b.y=Math.max(b.gy,b.y+b.vy*dt); } if(Math.hypot(P.x-b.x,P.z-b.z)<1.4 && b.y<=b.gy+.2){ b.on=false; E.mine++; give(10, `💰 Nhặt được túi xu +10 (đang giữ ${E.mine} túi – có thể đem trả tài xế để nhận thưởng lớn)`); } }
        _m.compose(_p.set(b.x,b.y,b.z), _q2.identity(), b.on ? _s.set(1,1,1) : _s.set(0,0,0)); im.setMatrixAt(i,_m); }); for(let i=E.bags.length;i<15;i++) im.setMatrixAt(i,_z); im.instanceMatrix.needsUpdate=true;
      if(E.t>3 && E.peds.length<4 && R()<dt*1.5){ const free=E.bags.filter(b=>b.on && b.y<=b.gy+.2 && !b.claim); const b=free[Math.floor(R()*free.length)]; if(b){ const q=pdPick(b.x, b.z, 26, 1)[0]; if(q){ b.claim=q; E.peds.push({p:q, b}); } } }
      for(const k of E.peds.slice()){ const q=k.p, d=stepPed(q, k.b.x, k.b.z, 1.9, dt); if(!k.b.on){ PD().give(q); E.peds.splice(E.peds.indexOf(k),1); continue; } if(d<.4){ k.b.on=false; PD().say(q, '💰 Của rơi! Để tôi đem trả tài xế…', 2.5); PD().give(q); E.peds.splice(E.peds.indexOf(k),1); } }
      if(E.phase==='driver' && (E.t-E.dt0>30 || (E.tReturn && E.t-E.tReturn>5))){ E.phase='go'; if(E.drv) hide(E.drv); tr.hazard=false; const far=farRoadPoint(g.x, g.z, 120, 220); if(!(far && tr.goTo(far,{siren:false}))) tr.remove(); E.tg=E.t; }
      if(E.phase==='go' && (tr.arrived || E.t-E.tg>20 || !tr.active)) endEvent(E);
      if(E.t>120) endEvent(E); };
    E.end=()=>{ if(E.inter){ const j=W.INTER.indexOf(E.inter); if(j>=0) W.INTER.splice(j,1); } if(E.drv) hide(E.drv); bagsIM().visible=false; for(const k of E.peds) PD() && PD().give(k.p); if(truck.active) truck.remove(); };
    ACTIVE.push(E); return E; }

  /* ============================== D3. VA CHẠM GIAO THÔNG NHẸ + CSGT HOÀ GIẢI ============================== */
  function startBump(){ const RN=W.roadNet, cam=W.camera, fw=new THREE.Vector3(); cam.getWorldDirection(fw); fw.y=0; fw.normalize(); const o={}, cands=[];
    for(const e of RN.edges){ if(e.zone==='brain' || e.zone==='swiss' || e.w<9) continue; for(let d=6; d<=e.len-6; d+=4){ RN.edgePt(e,d,o); const dx=o.x-P.x, dz=o.z-P.z, dd=Math.hypot(dx,dz); if(dd<20 || dd>48 || Math.abs(o.y-(P.y??2))>3 || (dx*fw.x+dz*fw.z)/dd<.35) continue; cands.push({x:o.x, z:o.z, e, dd}); } }
    if(!cands.length) return 'Không có đoạn đường thẳng trước mặt.';
    // 2 xe chạy dọc CHÍNH đoạn đường hiện trường, đặt sẵn cách ~80 m (đồ thị đường thưa – nút đầu đoạn có khi xa 200 m)
    let tgt=null, from=null, run=0; for(const c of shuffle(cands)){ const e=c.e;
        const sA=projS(e, c.x, c.z);
        for(const [nd, rr] of shuffle([[e.a, sA],[e.b, e.len-sA]])){ if(rr>=40){ tgt=c; from=nd; run=rr; break; } } if(tgt) break; }
    if(!tgt) return 'Không tìm được đường cho xe tới.';
    const nn=RN.nearest(tgt.x,tgt.z,20), stop=(nn?nn.d:0)+3.5;
    const A=TR().spawnVehicle('civil', {x:tgt.x, z:tgt.z}, {from, stop, color:0xd7263d}); if(!A) return 'Không gọi được xe.'; A.s=Math.max(0, run-75); A.v=8;
    const E={key:'D3', label:'💥 Va chạm giao thông nhẹ', x:tgt.x, z:tgt.z, y:gAtY(tgt.x,tgt.z,(P.y??2)+2), t:0, phase:'drive', A, B:null, drv:[]};
    E.B=TR().spawnVehicle('civil', {x:tgt.x, z:tgt.z}, {from, stop:1, color:0x1b6fd1}); if(E.B){ E.B.s=Math.max(0, run-95); E.B.v=9; }   /* xe B bám sau 20 m, không kịp phanh → chạm đuôi */
    E.upd=(dt,t)=>{ const pd=PD();
      if(E.phase==='drive' && (A.arrived || A.v<3) && E.B){ const B=E.B, d=Math.hypot(B.g.position.x-A.g.position.x, B.g.position.z-A.g.position.z); if(d<A.hl+B.hl+3.2 && (B.v<1.5 || d<A.hl+B.hl+.6) && !E.bumped){ E.bumped=true; B.stopNow=true; B.v=0; if(d>A.hl+B.hl+.15) B.s+=d-A.hl-B.hl-.15;   /* nhích tới chạm cản sau xe A */ W.burst && W.burst(new THREE.Vector3((A.g.position.x+B.g.position.x)/2, A.g.position.y+.8, (A.g.position.z+B.g.position.z)/2), [0xffffff,0xcccccc], 40, 3, .5, -4, .2);
          A.hazard=B.hazard=true; E.phase='argue'; E.ta=E.t; announce(E, '💥 Cạch! Hai xe vừa chạm đuôi nhẹ!');
          const h=A.h, rx=-Math.cos(h), rz=Math.sin(h), mx=(A.g.position.x+B.g.position.x)/2+rx*2.6, mz=(A.g.position.z+B.g.position.z)/2+rz*2.6;
          for(let i=0;i<2;i++){ const o=actor('drv'+i, W.people.seedFor(i?'f':'m', 1800+i*5), {shirt:i?0xff8fc2:0x2e8b57, pants:0x1f2a44, long:true}, i?'🚗 Chị Mai (xe xanh)':'🚗 Anh Tuấn (xe đỏ)'); const src=i?B:A; show(o, src.g.position.x+rx*1.6, src.g.position.z+rz*1.6, h); o.meet={x:mx+Math.sin(h)*(i?-.75:.75), z:mz+Math.cos(h)*(i?-.75:.75)}; E.drv.push(o); }
          pd && pd.crowd(mx, mz, 'watch', {r:26, t:50, ring:7}); E.mid={x:mx, z:mz}; } }
      if(E.mid && !E.gone) W.PEDS && W.PEDS.push({x:E.mid.x, z:E.mid.z, y:E.y, h:0, hw:4.5, hl:4.5});   /* xe khác dừng/lách – không lao vào người đứng dưới đường */
      if(E.phase==='drive' && E.t>50) endEvent(E);
      if(E.phase==='argue'){ E.drv.forEach((o,i)=>{ const d=moveTo(o, o.meet.x, o.meet.z, 1.6, dt); if(d<.1){ o.v=0; o.hd=Math.atan2(E.drv[1-i].x-o.x, E.drv[1-i].z-o.z); o.clip='agree'; } });
        const LINES=[[0,'Anh đi kiểu gì vậy! Đèn phanh tôi sáng rõ mà! 😤'],[1,'Xin lỗi anh, tôi mải nhìn bản đồ nên phanh không kịp 😅'],[0,'Trầy cả cản sau rồi đây này…'],[1,'Để em gọi CSGT giải quyết cho đúng luật nhé!']]; const k=Math.floor((E.t-E.ta-1.2)/2.6);
        if(k>=0 && k<LINES.length && E.said!==k){ E.said=k; sayA(E.drv[LINES[k][0]], LINES[k][1], 2.5); }
        if(E.t-E.ta>3 && !E.copCalled){ E.copCalled=true; callResponder(E, 'police', E.mid.x, E.mid.z, (car)=>{ E.copCar=car; }); }
        const cv=E.car || E.special, near=cv && Math.hypot(cv.g.position.x-E.mid.x, cv.g.position.z-E.mid.z)<28;   /* xe tới gần (có thể kẹt sau 2 xe đang dừng) → đỗ luôn, CSGT đi bộ tới */
        if(!E.cop && near && !(cv.arrived || (cv.target && cv.target.arrived))){ if(cv.special) cv.stopNow=true; else if(cv.target) cv.target.arrived=true; }
        if(!E.cop && ((cv && (near || (cv.target && cv.target.arrived) || cv.arrived)) || E.t-E.ta>32)){ const g=cv ? cv.g.position : {x:E.mid.x+8, z:E.mid.z+8}; E.cop=actor('csgt', W.people.seedFor('m',1850), COP_OUT, '👮 CSGT · Thượng sĩ Hùng'); show(E.cop, g.x-Math.cos(cv?cv.h:0)*2.2, g.z+Math.sin(cv?cv.h:0)*2.2, 0); E.phase='cop'; } }
      if(E.phase==='cop'){ const c=E.cop, d=moveTo(c, E.mid.x+.8, E.mid.z+.8, 3.2, dt); if(d<.2){ c.v=0; c.hd=Math.atan2(E.mid.x-c.x, E.mid.z-c.z); if(!E.ts){ E.ts=E.t; sayA(c, 'Hai bên bình tĩnh nhé! Xe chỉ trầy nhẹ – chụp ảnh hiện trường rồi tự thoả thuận bồi thường 👮', 4.5); } }
        if(E.ts && E.t-E.ts>5 && !E.shake){ E.shake=true; E.drv.forEach((o,i)=>{ o.clip='idle'; o.pose='hand'; o.hd=Math.atan2(E.drv[1-i].x-o.x, E.drv[1-i].z-o.z); }); sayA(E.drv[0], '🤝 Thôi làm hoà nhé, đi đường cẩn thận!', 3); sayA(E.drv[1], '🤝 Dạ cảm ơn anh, em đền phần sơn nhé!', 3); cheerAt(E.mid.x, E.mid.z, '👏 Đẹp quá, làm hoà rồi!', 3); E.th2=E.t; }
        if(E.shake && E.t-E.th2>4){ E.phase='leave'; E.drv.forEach(o=>o.pose=null); E.tl=E.t; } }
      if(E.phase==='leave'){ let all=true; E.drv.forEach((o,i)=>{ if(!o.on) return; const src=i?E.B:A, d=moveTo(o, src.g.position.x-Math.cos(src.h)*1.6, src.g.position.z+Math.sin(src.h)*1.6, 1.6, dt); if(d<.4) hide(o); else all=false; });
        if(E.cop && E.cop.on){ const cv=E.car || E.special, g=cv ? cv.g.position : E.cop; const d=moveTo(E.cop, g.x-Math.cos(cv?cv.h:0)*2, g.z+Math.sin(cv?cv.h:0)*2, 2, dt); if(d<.5 || !cv) hide(E.cop); else all=false; }
        if((all || E.t-E.tl>15) && !E.gone){ E.gone=true; for(const v of [A, E.B]){ if(!v || !v.active) continue; v.hazard=false; v.stopNow=false; const far=farRoadPoint(v.g.position.x, v.g.position.z, 120, 220); if(!(far && v.goTo(far,{siren:false}))) v.remove(); } if(E.car){ TR().release(E.car); E.car=null; } if(E.special){ E.special.siren=false; E.special.remove(); E.special=null; } E.tg=E.t; }
        if(E.gone && E.t-E.tg>18) endEvent(E); }
      if(E.t>140) endEvent(E); };
    E.end=()=>{ E.drv.forEach(hide); if(E.cop) hide(E.cop); for(const v of [A, E.B]) if(v && v.active) v.remove(); if(E.car){ TR().release(E.car); } if(E.special) E.special.remove(); };
    ACTIVE.push(E); return E; }

  /* ============================== D4. FLASHMOB ============================== */
  const posers=new Map(); const poserOf=o=>{ if(o.poser) return o.poser; let p=posers.get(o); if(!p){ p=makePoser(THREE, o.a); posers.set(o,p); } return p; };   /* người đi đường đã có poser riêng */
  function startFlash(){ const spot=pickSpot(16,32); if(!spot) return 'Không có vỉa hè rộng gần đây.'; const pd=PD(), o={}, slots=[];
    const n=W.roadNet.nearest(spot.x, spot.z, 40); let ox=0, oz=0; if(n){ const dx=spot.x-n.x, dz=spot.z-n.z, l=Math.hypot(dx,dz)||1; ox=dx/l; oz=dz/l; }
    for(let r=0;r<2;r++) for(let c=0;c<5;c++){ const s=Math.min(spot.L.len, Math.max(0, spot.s+(c-2)*1.5)); pd.lanePos(spot.L, s, 0, o); slots.push({x:o.x+ox*(r*1.3-.4), z:o.z+oz*(r*1.3-.4)}); }
    const E={key:'D4', label:'🎶 Flashmob QC City', x:spot.x, z:spot.z, y:spot.y, t:0, phase:'gather', dancers:[], extra:[], joined:false, face:Math.atan2(P.x-spot.x, P.z-spot.z)};
    const side=p=>!n || ((p.x-n.x)*ox+(p.z-n.z)*oz)>(n.e.w/2-.5);   /* chỉ người cùng phía đường – không băng qua lòng đường */
    const got=pdPick(spot.x, spot.z, 50, 10, side); got.forEach((p,i)=>E.dancers.push({p, slot:slots[i]})); for(let i=got.length;i<10;i++){ const a=actor('fm'+i, W.people.seedFor(i%2?'f':'m', 1900+i*7), {shirt:[0xff4f9a,0x2f6fd0,0xffd23f,0x46d39a,0xff7b29][i%5], pants:0x1d1f24, long:true}, '💃 Vũ công flashmob'); show(a, slots[i].x+ox*6, slots[i].z+oz*6, 0); E.extra.push({a, slot:slots[i]}); }
    announce(E, '🎶 Flashmob! 10 người đang tụ lại nhảy đồng diễn – bấm F để nhảy cùng (+40 💰)');
    E.upd=(dt,t)=>{ const pdd=PD();
      if(E.phase==='gather'){ let ok=true; for(const d of E.dancers){ const r=stepPed(d.p, d.slot.x, d.slot.z, 2.6, dt); d.p.sclip=r>.1?'run':null; if(r>.1) ok=false; else { d.p.v=0; d.p.hd=E.face; } } for(const d of E.extra){ const r=moveTo(d.a, d.slot.x, d.slot.z, 2.6, dt); if(r>.1) ok=false; else { d.a.v=0; d.a.hd=E.face; } }
        if(ok || E.t>12){ E.phase='dance'; E.td=E.t; for(const d of E.dancers.slice()){ if(Math.hypot(d.p.x-d.slot.x, d.p.z-d.slot.z)>.6){ pdd.give(d.p); E.dancers.splice(E.dancers.indexOf(d),1); } } for(const d of E.extra) if(Math.hypot(d.a.x-d.slot.x, d.a.z-d.slot.z)>.6){ d.a.x=d.slot.x; d.a.z=d.slot.z; } pdd.crowd(E.x, E.z, 'watch', {r:30, t:40, ring:7}); toast('🎶 Nhạc lên! Flashmob bắt đầu – bấm F để nhảy cùng (+40 💰)', 3500); } }
      if(E.phase==='dance'){ const u=E.t-E.td, beat=Math.sin(u*Math.PI*2*1.1), step=Math.floor(u/4)%3;
        const dance=(a, o, base)=>{ a.g.position.y=o.y+Math.abs(beat)*.09; a.g.rotation.y=base+(step===1 ? Math.sin(u*2.2)*.6 : step===2 ? u*2.5 : Math.sin(u*4.4)*.15); poserOf(o).apply('dance', u*1.6); };
        for(const d of E.dancers){ d.p.v=0; dance(d.p.a, d.p, E.face); } for(const d of E.extra) if(d.a.on){ d.a.v=0; d.a.hd=E.face; }
        if(u>25){ E.phase='bow'; E.tb=E.t; cheerAt(E.x, E.z, '👏 Hay quá! Bis! Bis!', 4); } }
      if(E.phase==='bow'){ for(const d of E.dancers) d.p.v=0; if(E.t-E.tb>4){ E.phase='leave'; for(const d of E.dancers) pdd.give(d.p); E.given=true; E.tl=E.t; } }
      if(E.phase==='leave'){ let all=true; for(const d of E.extra){ if(!d.a.on) continue; const r=moveTo(d.a, d.slot.x+ox*14, d.slot.z+oz*14, 1.5, dt); if(r<.5 || E.t-E.tl>10) hide(d.a); else all=false; } if(all) endEvent(E); }
      if(E.t>90) endEvent(E); };
    E.post=(t)=>{ if(E.phase!=='dance') return; const u=E.t-E.td; for(const d of E.extra) if(d.a.on){ d.a.a.g.position.y=d.a.y+Math.abs(Math.sin(u*Math.PI*2*1.1))*.09; poserOf(d.a).apply('dance', u*1.6); } };
    E.end=()=>{ if(!E.given) for(const d of E.dancers) PD() && PD().give(d.p); for(const d of E.extra) hide(d.a); };
    ACTIVE.push(E); return E; }
  addEventListener('keydown', (e)=>{ if(e.code!=='KeyF' || e.shiftKey) return; for(const E of ACTIVE){ if(E.key!=='D4' || E.phase!=='dance' || E.joined) continue; if(Math.hypot(P.x-E.x, P.z-E.z)<12){ E.joined=true; give(40, '💃 Bạn nhảy cùng flashmob! +40 💰'); } } });

  /* ============================== D5. ROBOT GIAO TRÀ SỮA LỖI AI ============================== */
  let BOT=null, BUB=null;
  function robot(){ if(BOT) return BOT; const RB=W.MODELS && W.MODELS.robot; if(!RB) return null; const c=n=>W.clipOf(RB,n);
    const a=W.makeActor(RB, {name:'🤖 BobaBot 3000 · giao trà sữa', height:1.35, face:0, compact:false, clips:{idle:c('Idle'), walk:c('Walking'), dance:c('Dance'), yes:c('Yes')}, dot:'#ff8fc2'}); a.g.visible=false; if(a.label) a.label.alpha=0;
    const tray=new THREE.Group(); tray.position.y=1.42; a.g.add(tray); const tm=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.03,20), new THREE.MeshStandardMaterial({color:0xd8d8dc, metalness:.7, roughness:.3})); tray.add(tm);
    const cupGeo=[]; for(let i=0;i<3;i++){ const a2=i*2.1; cupGeo.push(new THREE.CylinderGeometry(.07,.055,.2,12).translate(Math.cos(a2)*.18,.11,Math.sin(a2)*.18).toNonIndexed()); } tray.add(new THREE.Mesh(W.mergeGeometries(cupGeo), new THREE.MeshStandardMaterial({color:0xc8a27a, roughness:.5, transparent:true, opacity:.92})));
    const anchor=new THREE.Object3D(); anchor.position.y=2.2; a.g.add(anchor);
    BOT={a, anchor, x:0, z:0, hd:0, on:false}; BUB=new THREE.InstancedMesh(new THREE.SphereGeometry(.09,8,6), new THREE.MeshStandardMaterial({color:0xffffff, roughness:.2, transparent:true, opacity:.85}), 40); BUB.frustumCulled=false; BUB.visible=false; BUB.userData.dynamic=true; scene.add(BUB);
    const pal=[0xffb3d1,0xb3e5ff,0xfff0a8,0xc8f7c5,0xe1c8ff]; for(let i=0;i<40;i++){ BUB.setColorAt(i, new THREE.Color(pal[i%5])); BUB.setMatrixAt(i,_z); } BUB.instanceColor.needsUpdate=true; return BOT; }
  function botSay(text, sec=3){ if(BOT.bub) W.removeLabel(BOT.bub); BOT.bub=W.makeLabel(text, null, {fs:36, h:.26, follow:BOT.anchor, bg:'rgba(255,240,250,.95)', color:'#5a1a3a', fade:45}); BOT.bubT=sec; }
  function startRobot(){ const spot=pickSpot(14,30); if(!spot) return 'Không có vỉa hè gần đây.'; const b=robot(); if(!b) return 'Thiếu model robot.';
    { const n=W.roadNet.nearest(spot.x, spot.z, 40); if(n){ const dx=spot.x-n.x, dz=spot.z-n.z, l=Math.hypot(dx,dz)||1; spot.x+=dx/l*1.8; spot.z+=dz/l*1.8; } }   /* lùi vào trong 1,8 m – xa cột đèn mép đường */
    const E={key:'D5', label:'🧋 Robot trà sữa lỗi AI', x:spot.x, z:spot.z, y:spot.y, t:0, phase:'glitch', bubs:Array.from({length:40},()=>({on:false})), bi:0};
    b.on=true; b.x=spot.x+2; b.z=spot.z; b.a.g.visible=true; if(b.a.label) b.a.label.alpha=1; b.a.play('walk',0); botSay('⚠️ ERR_BOBA_OVERFLOW… 🧋🧋🧋 GIAO… GIAO… GIAO…', 4); BUB.visible=true;
    announce(E, '🤖 Robot giao trà sữa bị lỗi AI, chạy vòng vòng bắn bong bóng!');
    E.inter={get x(){ return b.x; }, get z(){ return b.z; }, r:2.8, prio:.9, when:()=>E.phase==='glitch', label:'🛠️ Debug robot trà sữa lỗi AI (E · +35 💰)', action:()=>{ E.phase='fixed'; E.tf=E.t; b.a.play('yes',.2); botSay('✅ Đã fix bug! Cảm ơn kỹ sư QA – tặng bạn ly trà sữa 🧋', 4); give(35, '🛠️ Bạn đã debug xong robot trà sữa! +35 💰'); cheerAt(b.x, b.z, '👏 QA đỉnh quá!', 2); }};
    W.INTER.push(E.inter); const pd=PD(); pd && pd.crowd(spot.x, spot.z, 'watch', {r:22, t:35, ring:6}); setTimeoutF(()=>{ const w=PD().peds.find(q=>q.state==='watch'); if(w) PD().say(w,'Robot bị sao vậy? 😂',3); }, 2);
    E.upd=(dt,t)=>{ const a=b.a;
      if(E.phase==='glitch'){ const ang=t*.55, tx=E.x+Math.cos(ang)*2.2, tz=E.z+Math.sin(ang)*2.2, dx=tx-b.x, dz=tz-b.z; b.x+=dx*Math.min(1,dt*3); b.z+=dz*Math.min(1,dt*3); b.hd+=dt*(3+Math.sin(t*2)*2); a.play(Math.floor(t/3)%2?'dance':'walk',.3);
        if(R()<dt*12){ const k=E.bi++%40, bb=E.bubs[k]; bb.on=true; bb.x=b.x; bb.y=gAtY(b.x,b.z,E.y+1)+1.5; bb.z=b.z; const d=R()*6.3; bb.vx=Math.cos(d)*1.6; bb.vz=Math.sin(d)*1.6; bb.vy=1+R(); bb.life=2.5; }
        if(E.t>60){ E.phase='fixed'; E.tf=E.t; botSay('🔄 Tự khởi động lại… đã ổn định!', 3); } }
      if(E.phase==='fixed' && E.t-E.tf>4.5){ E.phase='leave'; E.tl=E.t; a.play('walk',.3); }
      if(E.phase==='leave'){ const dx=Math.sin(b.hd), dz=Math.cos(b.hd); b.x+=dx*1.2*dt; b.z+=dz*1.2*dt; if(E.t-E.tl>8 || !a.root.visible && E.t-E.tl>2) endEvent(E); }
      a.g.position.set(b.x, gAtY(b.x,b.z,E.y+1), b.z); a.g.rotation.y=b.hd; if(a.root.visible) a.mixer.update(dt);
      E.bubs.forEach((bb,i)=>{ if(bb.on){ bb.life-=dt; bb.x+=bb.vx*dt; bb.z+=bb.vz*dt; bb.y+=bb.vy*dt; if(bb.life<=0) bb.on=false; } const s=bb.on ? .6+(2.5-bb.life)*.5 : 0; _m.compose(_p.set(bb.x||0,bb.y||0,bb.z||0), _q2.identity(), _s.set(s,s,s)); BUB.setMatrixAt(i,_m); }); BUB.instanceMatrix.needsUpdate=true;
      if(b.bubT>0){ b.bubT-=dt; if(b.bubT<=0 && b.bub){ W.removeLabel(b.bub); b.bub=null; } }
      if(E.t>100) endEvent(E); };
    E.end=()=>{ const j=W.INTER.indexOf(E.inter); if(j>=0) W.INTER.splice(j,1); b.on=false; b.a.g.visible=false; if(b.a.label) b.a.label.alpha=0; if(b.bub){ W.removeLabel(b.bub); b.bub=null; } BUB.visible=false; };
    ACTIVE.push(E); return E; }

  /* ============================== D6. LỄ HỘI ĐÈN TRỜI (ban đêm) ============================== */
  let LAN=null; function lanterns(){ if(LAN) return LAN; const body=new THREE.CylinderGeometry(.32,.24,.62,10,1,true), mat=new THREE.MeshBasicMaterial({color:0xffb347, transparent:true, opacity:.92, side:THREE.DoubleSide, toneMapped:false});
    const im=new THREE.InstancedMesh(body, mat, 48); im.frustumCulled=false; im.visible=false; im.userData.dynamic=true; scene.add(im);
    const glow=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({map:puffT, color:0xff9a30, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false}), 48); glow.frustumCulled=false; glow.visible=false; glow.userData.dynamic=true; scene.add(glow);
    LAN={im, glow}; return LAN; }
  function startLanterns(opt={}){ if(!(W.night>.5) && !opt.force) return '🏮 Lễ hội đèn trời chỉ diễn ra ban đêm (trời đã tối hẳn).'; const L=lanterns(), pd=PD();
    const E={key:'D6', label:'🏮 Lễ hội đèn trời', x:P.x, z:P.z, y:P.y, t:0, phase:'fly', list:[], launchers:pdPick(P.x, P.z, 45, 8), next:0};
    E.launchers.forEach(p=>{ p.v=0; p.sclip=null; p.hd=Math.atan2(P.x-p.x, P.z-p.z); }); L.im.visible=L.glow.visible=true;
    announce(E, '🏮 Lễ hội đèn trời! Người dân thả đèn ước nguyện bay lên khắp phố');
    setTimeoutF(()=>{ E.launchers.slice(0,3).forEach((p,i)=>setTimeoutF(()=>PD().say(p,['🏮 Ước nguyện bình an!','🏮 Mong năm nay release không bug!','🏮 Gia đình hạnh phúc nhé!'][i],3.5), i*.9)); }, 1);
    E.upd=(dt,t)=>{ const cq=W.camera.quaternion;
      if(E.t<20 && E.list.length<48){ E.next-=dt; if(E.next<=0){ E.next=.42; const p=E.launchers.length ? E.launchers[E.list.length%E.launchers.length] : null; let x, z, y;
          if(p && E.list.length<E.launchers.length*3){ x=p.x+Math.sin(p.hd)*.5; z=p.z+Math.cos(p.hd)*.5; y=p.y+1.8; } else { const a=R()*6.28, r=12+R()*40; x=P.x+Math.cos(a)*r; z=P.z+Math.sin(a)*r; y=gAtY(x,z,(P.y??2)+3)+1.6; }
          E.list.push({x, z, y, vy:1.1+R()*.7, ph:R()*6, sw:.4+R()*.5}); } }
      E.launchers.forEach(p=>{ p.v=0; if(E.t<12) poserOf(p).apply('present', t); });
      E.list.forEach((l,i)=>{ l.y+=l.vy*dt; l.x+=Math.sin(t*.4+l.ph)*l.sw*dt; l.z+=Math.cos(t*.33+l.ph)*l.sw*dt; const fl=1+Math.sin(t*9+l.ph)*.08; _m.compose(_p.set(l.x,l.y,l.z), _q2.identity(), _s.set(fl,1,fl)); L.im.setMatrixAt(i,_m); _m.compose(_p.set(l.x,l.y+.05,l.z), cq, _s.set(2.2*fl,2.2*fl,1)); L.glow.setMatrixAt(i,_m); });
      for(let i=E.list.length;i<48;i++){ L.im.setMatrixAt(i,_z); L.glow.setMatrixAt(i,_z); } L.im.instanceMatrix.needsUpdate=true; L.glow.instanceMatrix.needsUpdate=true;
      if(E.t>12 && !E.freed){ E.freed=true; E.launchers.forEach(p=>PD().give(p)); }
      if(E.t>70) endEvent(E); };
    E.end=()=>{ L.im.visible=L.glow.visible=false; if(!E.freed) E.launchers.forEach(p=>PD() && PD().give(p)); };
    ACTIVE.push(E); return E; }

  /* ============================== PHÍM: 3 đấm (giữ nguyên hành vi gốc) · Shift+1…9 diễn tập ============================== */
  if(HOOK.keys){ const orig=HOOK.keys.Digit3; HOOK.keys.Digit3=(...a)=>{ const r=orig ? orig(...a) : undefined; try{ onPunch(); }catch(e){} return r; }; }
  function onPunch(){ for(const E of ACTIVE){ if(E.key!=='A' || !E.th || !E.th.on || E.th.lie>0 || E.caught || !['flee','approach'].includes(E.phase)) continue; const th=E.th, dx=th.x-P.x, dz=th.z-P.z, d=Math.hypot(dx,dz);
      const fx=Math.sin(P.face||0), fz=Math.cos(P.face||0); if(d<1.8 && (dx*fx+dz*fz)/Math.max(d,.01)>.2){ th.lie=1; th.v=0; E.phase=E.cops.length?'chase':'down'; E.caught=false; give(30, '👊 Bạn đã hạ gục tên trộm! +30 💰 – chờ công an tới còng tay'); sayA(th,'😵 Á…',1.5); } } }
  const KEYS={Digit1:'A', Digit2:'B', Digit3:'C', Digit4:'D1', Digit5:'D2', Digit6:'D3', Digit7:'D4', Digit8:'D5', Digit9:'D6'};
  addEventListener('keydown', (e)=>{ if(!e.shiftKey || !/^Digit[1-9]$/.test(e.code)) return; const tg=document.activeElement; if(tg && /input|textarea|select/i.test(tg.tagName)) return;
    e.preventDefault(); e.stopImmediatePropagation(); trigger(KEYS[e.code]); }, true);

  /* ============================== KHUNG HÌNH + HẸN GIỜ ============================== */
  let NEXT=150+R()*60, lastT=0;
  const STARTERS={A:startTheft, B:startFire, C:startMonster, D1:startMedic, D2:startCash, D3:startBump, D4:startFlash, D5:startRobot, D6:startLanterns};
  function trigger(key, opt={}){ if(!STARTERS[key]){ toast('🧪 Không có sự kiện '+key, 2000); return null; } if(ACTIVE.some(e=>e.key===key)){ toast('⏳ Sự kiện này đang diễn ra.', 2000); return null; }
    const r=STARTERS[key](opt); if(typeof r==='string' || !r){ toast('🧪 '+(r||'Chưa diễn được sự kiện này ở đây.'), 2800); return null; } if((key==='A' || key==='B') && !r.mark) announce(r, key==='A' ? '🦹 Có trộm móc túi!' : '🔥 Có cháy trên phố!'); return r; }
  HOOK.onFrame.push((dtIn)=>{ const dt=Math.min(dtIn,.1), t=W.T??0; lastT=t;
    for(let i=timers.length-1;i>=0;i--){ timers[i].t-=dt; if(timers[i].t<=0){ const f=timers[i].fn; timers.splice(i,1); try{ f(); }catch(e){} } }
    for(const E of ACTIVE.slice()){ E.t+=dt; try{ if(E.upd) E.upd(dt, t); else if(E.key==='A') updTheft(E, dt, t); else if(E.key==='B') updFire(E, dt, t); }catch(err){ console.warn('[events]', E.key, err); endEvent(E); } }
    for(const o of CAST.values()) if(o.on) tickActor(o, dt, t);
    for(const E of ACTIVE) if(E.post) try{ E.post(t); }catch(e){}
    updRing(t);
    for(const E of ACTIVE) if(E.key==='C' && E.hero && E.hero.on && E.hero.hpose && E.hero.a.root.visible) heroPose(E.hero, E.hero.hpose, t);
    if(ACTIVE.length && Math.hypot(P.x-ACTIVE[0].x, P.z-ACTIVE[0].z)>180) for(const E of ACTIVE.slice()) endEvent(E);   // người chơi đi xa / dịch chuyển → kết thúc gọn
    if(W.inside || ACTIVE.length) return; NEXT-=dt;
    if(NEXT<=0){ NEXT=30; const pd=PD(); if(pd && pd.LANES && pd.peds.some(p=>p.state!=='off')){ const ROT=['A','B','C','D1','D2','D3','D4','D5']; let k=ROT[(T0++)%ROT.length]; if(W.night>.5 && R()<.35) k='D6'; const r=STARTERS[k](); if(typeof r==='string' || !r) NEXT=45; else if(!r.mark) announce(r, r.label); } } });

  const LIST=[{key:'A', name:'🦹 Trộm móc túi & công an truy đuổi', hotkey:'Shift+1'}, {key:'B', name:'🔥 Cháy trên phố & xe cứu hoả 114', hotkey:'Shift+2'},
    {key:'C', name:'👾 Yêu quái Memory-Leak Behemoth & siêu nhân Captain QA', hotkey:'Shift+3'}, {key:'D1', name:'🚑 Cấp cứu 115 – người ngất vì thức khuya', hotkey:'Shift+4'},
    {key:'D2', name:'💰 Xe chở tiền rơi túi xu', hotkey:'Shift+5'}, {key:'D3', name:'💥 Va chạm giao thông nhẹ – CSGT hoà giải', hotkey:'Shift+6'},
    {key:'D4', name:'🎶 Flashmob nhảy đồng diễn (F nhảy cùng +40 💰)', hotkey:'Shift+7'}, {key:'D5', name:'🧋 Robot trà sữa lỗi AI (E debug +35 💰)', hotkey:'Shift+8'},
    {key:'D6', name:'🏮 Lễ hội đèn trời (ban đêm)', hotkey:'Shift+9'}];
  console.info('[QC World V2] Sự kiện đường phố (Pha 10): A trộm · B cháy · C yêu quái & Captain QA · D1–D6 – Shift+1…9');
  return {list:LIST, trigger, active:()=>ACTIVE.map(e=>({key:e.key, label:e.label, x:e.x, z:e.z, phase:e.phase, t:e.t})), stop(){ for(const E of ACTIVE.slice()) endEvent(E); }, stats, _ACTIVE:ACTIVE, _CAST:CAST, _dbg:()=>({MON, CFX, BAGS, BOT, BUB, LAN, RING, FX})};
}
