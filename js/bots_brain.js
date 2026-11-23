// QC World V2 – PHA 9: BOT SỐNG ĐỘNG VÙNG ĐỈNH QA/QC BRAIN CITADEL (phiên qc-park, 16/11/2026 – theo bible Phần 7, cùng mẫu js/bots_cbd_sky.js)
//  • Phố săn mây: chủ quán / barista, khách săn mây đứng bên lan can chụp biển, đầu bếp hải sản
//  • Cầu Kính Cổng Trời: người đi bộ ngắm cảnh đi lại, nhiếp ảnh gia giơ máy ảnh
//  • Tháp Liên Hoa: nhân viên bảo tàng tầng 1, MC đấu trường tầng 2, kỹ sư trực phòng chỉ huy tầng 3, bartender Sky Bar tầng 4 + 2 cơ thủ Bida tầng 5 · khách tham quan: vào tầng 1 → đọc bảng → cầu thang xoắn lên 2·3·4·5 (xem chơi)·6 → thang máy thật xuống → ra (~2–3 khách/tầng)
//  • Nhân viên vận hành xích đu tử thần + phi công khinh khí cầu · phi công trực thăng ở sân bay Đỉnh Mây (kèm trực thăng đậu trên bãi)
//  • Hiệu năng: chỉ hiện + chạy hoạt hình khi cách camera < 85 m (máy yếu 60 m); cả vùng ngủ khi bạn ở xa > 150 m
//  Gọi từ brain_citadel.js: make(W, {C, FY, ROAD, cafes, GB, hAt, ride})
import { makePoser } from './pose.js';
import { allLifts } from './liftkit.js';

export function make(W, B){
  const {THREE, scene, circles, HOOK, P, makeActor, makeLabel, removeLabel, lerpAngle, mergeGeometries} = W;
  if(!W.people || !B || !B.C) return null;
  const R=Math.random, pick=a=>a[Math.floor(R()*a.length)], LOW=W.QUAL==='low', clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const {C, FY=[], cafes=[], GB, hAt} = B;
  const NPC=[], sM=s=>W.people.pickSeed(L=>!L.female,s), sF=s=>W.people.pickSeed(L=>L.female,s);
  const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.5}, o));
  const at=(a,r)=>[C.x+Math.cos(a)*r, C.z+Math.sin(a)*r], yawOut=a=>Math.atan2(Math.cos(a),Math.sin(a));
  const ENT=GB && GB.b ? Math.atan2(GB.b.z-C.z, GB.b.x-C.x) : 0, A0=ENT+Math.PI/2;
  function person(seed, outfit, name, dot){ const k=W.people.kit(seed,{outfit}); const a=makeActor(k.gl,{name, height:k.h, face:0, clips:k.clips, compact:false, dot:dot||'#9fd36a'});
    if(k.look && k.look.width){ a.root.scale.x*=k.look.width; a.root.scale.z*=k.look.width; } if(LOW) a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
    a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a); const anchor=new THREE.Object3D(); anchor.position.y=k.h+.75; a.g.add(anchor);
    const o={a, po, h:k.h, hips:po.hipsHeight(), anchor, x:0, y:0, z:0, hd:0, bubble:null, bubbleT:0, col:{x:1e9, z:1e9, r:.3, owner:true, y0:-1e9, y1:1e9}, upd:null, ph:R()*9}; circles.push(o.col); NPC.push(o); return o; }
  const say=(o,t,sec=3)=>{ if(o.bubble) removeLabel(o.bubble); o.bubble=makeLabel(t, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:30}); o.bubbleT=sec; };
  // va chạm theo tầng: chỉ chặn trong khoảng cao độ của bot (đứng tầng nào chặn tầng đó)
  const put=o=>{ o.a.g.position.set(o.x,o.y,o.z); o.a.g.rotation.set(0,o.hd,0); o.col.x=o.x; o.col.z=o.z; o.col.y0=o.y-.5; o.col.y1=o.y+2; };
  const _v=new THREE.Vector3();
  function attach(o, mesh, side='Right'){ let h=null; o.a.g.traverse(b=>{ if(b.isBone && !h && new RegExp(side+'Hand$').test(b.name)) h=b; }); if(!h) return null; o.a.g.updateMatrixWorld(true); h.getWorldScale(_v); mesh.scale.multiplyScalar(1/(_v.x||1)); h.add(mesh); return mesh; }
  const _pa=new THREE.Vector3(), _pb=new THREE.Vector3(), _pd=new THREE.Vector3(), _qa=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _F=new THREE.Vector3(), _R=new THREE.Vector3(), _U=new THREE.Vector3(0,1,0);
  function aim(bn,n,c,f,u,r){ const Bn=bn[n], Cc=bn[c]; if(!Bn||!Cc) return; Bn.getWorldPosition(_pa); Cc.getWorldPosition(_pb); _pb.sub(_pa).normalize(); _pd.set(0,0,0).addScaledVector(_F,f).addScaledVector(_U,u).addScaledVector(_R,r).normalize(); _qa.setFromUnitVectors(_pb,_pd); Bn.getWorldQuaternion(_wq); Bn.parent.getWorldQuaternion(_pq); _wq.premultiply(_qa); Bn.quaternion.copy(_pq.invert().multiply(_wq)); Bn.updateMatrixWorld(true); }
  function pose(o, kind, t=0){ const bn=o.po.bones; if(!bn || !bn.Hips || !o.a.g.visible) return; o.a.g.updateMatrixWorld(true); o.a.g.getWorldDirection(_F); _F.y=0; _F.normalize(); _R.set(-_F.z,0,_F.x); const LR=[['Left',-1],['Right',1]];
    switch(kind){
      case 'camera': for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.6,-.5,k*.35); aim(bn,s+'ForeArm',s+'Hand',.55,.8,-k*.45); } aim(bn,'Neck','Head',1,.15,0); break;
      case 'cue': aim(bn,'Spine','Spine1',.75,.65,0); { const e=Math.max(0,Math.sin(t*2.2)); aim(bn,'RightArm','RightForeArm',-.4+e*.3,-.9,.3); aim(bn,'RightForeArm','RightHand',.9,-.25,0); aim(bn,'LeftArm','LeftForeArm',.9,-.45,-.15); aim(bn,'LeftForeArm','LeftHand',1,-.2,0); } break;
      case 'bar': for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.8,-.55,k*.2); aim(bn,s+'ForeArm',s+'Hand',1,.15+(k>0?Math.sin(t*3)*.25:0),-k*.15); } break;
      case 'mic': aim(bn,'RightArm','RightForeArm',.35,-.6,.4); aim(bn,'RightForeArm','RightHand',.2,1,-.6); { const e=Math.sin(t*1.6); aim(bn,'LeftArm','LeftForeArm',.4,.2+e*.4,-.9); aim(bn,'LeftForeArm','LeftHand',.5,.6,-.4); } break;
      case 'lean': for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.8,-.7,k*.3); aim(bn,s+'ForeArm',s+'Hand',1,-.1,0); } aim(bn,'Spine','Spine1',.25,1,0); break;
      case 'signal': { const e=Math.sin(t*2); aim(bn,'RightArm','RightForeArm',.1,.5+e*.4,.9); aim(bn,'RightForeArm','RightHand',.1,1,.2); } break;
      /* 23/11 khách tham quan: đọc bảng (tay phải lên cằm, tay trái đỡ khuỷu, gật gù) · chắp tay sau lưng · chỉ tay vào bảng */
      case 'think': { const nod=Math.max(0,Math.sin(t*1.9)); aim(bn,'RightArm','RightForeArm',.8,-.35,.15); aim(bn,'RightForeArm','RightHand',-.15,1,-.45); aim(bn,'LeftArm','LeftForeArm',.25,-.95,-.12); aim(bn,'LeftForeArm','LeftHand',.8,.15,.55); aim(bn,'Neck','Head',.12+nod*.22,1,0); } break;
      case 'behind': for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',-.3,-.95,k*.12); aim(bn,s+'ForeArm',s+'Hand',-.55,-.3,-k*.55); } aim(bn,'Neck','Head',.15+Math.sin(t*1.3)*.08,1,Math.sin(t*.7)*.15); break;
      case 'point': aim(bn,'RightArm','RightForeArm',.85,.15,.3); aim(bn,'RightForeArm','RightHand',1,.25,0); aim(bn,'Neck','Head',.2,1,0); break;
    } }
  // đi qua lại giữa 2 điểm (cao độ nội suy) – người ngắm cảnh trên cầu kính
  function shuttle(o, a, b, sp=1.1){ Object.assign(o,{A:a, Bp:b, k:R(), dir:1, sp, wait:0}); o.upd=(dt,T)=>{ if(o.wait>0){ o.wait-=dt; o.a.play('idle'); put(o); return 'idle'; }
      const L=Math.hypot(o.Bp.x-o.A.x, o.Bp.z-o.A.z)||1; o.k+=o.dir*o.sp*dt/L; if(o.k>1||o.k<0){ o.k=clamp(o.k,0,1); o.dir*=-1; o.wait=2+R()*4; } else if(R()<dt*.05) o.wait=3+R()*4;
      const x=o.A.x+(o.Bp.x-o.A.x)*o.k, z=o.A.z+(o.Bp.z-o.A.z)*o.k; o.hd=lerpAngle(o.hd, Math.atan2((o.Bp.x-o.A.x)*o.dir,(o.Bp.z-o.A.z)*o.dir), 1-Math.exp(-dt*6)); o.x=x+o.off*Math.cos(o.hd); o.z=z-o.off*Math.sin(o.hd); o.y=o.A.h+(o.Bp.h-o.A.h)*o.k;
      o.a.play('walk'); put(o); return 'walk'; }; return o; }
  const cam=()=>new THREE.Mesh(mergeGeometries([new THREE.BoxGeometry(.16,.1,.08), new THREE.CylinderGeometry(.035,.035,.08,10).rotateX(Math.PI/2).translate(0,0,.07)]), std(0x1b1d22,{metalness:.5}));

  /* ============================== 1. PHỐ SĂN MÂY: chủ quán · khách săn mây · đầu bếp hải sản ============================== */
  const LINES_OWNER=['Mời bạn ngồi, mây sắp tràn qua đèo rồi ☁️','Cà phê muối view biển đây!','Hôm nay biển lặng, ngắm hoàng hôn đẹp lắm!'], LINES_GUEST=['Mây trôi dưới chân luôn nè ☁️','Chụp tấm này đăng story mới được 📸','Biển xanh quá trời!'];
  cafes.slice(0, LOW?6:9).forEach((c,i)=>{ const rx=c.road?c.road[0]:c.x, rz=c.road?c.road[1]:c.z, ox=c.x-rx, oz=c.z-rz, L=Math.hypot(ox,oz)||1, ux=ox/L, uz=oz/L, out=Math.atan2(ux,uz);
    const chef=i===3, own=person(i%2?sF(5101+i):sM(5101+i), chef?{shirt:0xffffff, pants:0x1b1d22, shoe:0x111111}:{shirt:[0x6b3e26,0x2a9d8f,0xc94f7c][i%3], pants:0x1b1d22, shoe:0x111111}, chef?'🦐 Đầu bếp hải sản':(i%2?'☕ Chủ quán săn mây':'☕ Barista quán săn mây'), '#ffb547');
    own.x=c.x-ux*1.7; own.z=c.z-uz*1.7; own.y=c.y; own.hd=out+Math.PI;   /* S19g rà soát 16/11: đứng sau quầy, quay ra phía khách (trước đứng lọt trong khối quầy) */
    own.upd=(dt,T)=>{ put(own); if(((T*.35+own.ph)%6)<2.6) pose(own,'bar',T); if(R()<dt*.006) say(own, chef?pick(['Tôm hùm nướng phô mai vừa ra lò! 🦞','Mực một nắng nướng than đây!']):pick(LINES_OWNER), 2.8); };
    if(i%2===0){ const g=person(i%4?sF(5201+i):sM(5201+i), {shirt:[0xff6b6b,0x46d39a,0xffd23f,0x4fc3ff,0xff9fc4][i%5], pants:0x2a3a5a, shoe:0x1b1d21}, '☁️ Khách săn mây', '#ffd23f');
      g.x=c.x+ux*3.2; g.z=c.z+uz*3.2; g.y=c.y; g.hd=out; if(i%4===0) attach(g, cam());
      g.upd=(dt,T)=>{ put(g); pose(g, i%4===0?'camera':'lean', T); if(R()<dt*.006) say(g, pick(LINES_GUEST), 2.6); }; } });

  /* ============================== 2. CẦU KÍNH CỔNG TRỜI: người ngắm cảnh + nhiếp ảnh gia ============================== */
  if(GB && GB.a && GB.b){ const a={x:GB.a.x, z:GB.a.z, h:GB.a.h ?? 100}, b={x:GB.b.x, z:GB.b.z, h:GB.b.h ?? FY[0] ?? 110};
    for(let i=0;i<(LOW?2:3);i++){ const o=person(i%2?sF(5301+i):sM(5301+i), {shirt:[0x2f6fd0,0xff8a5a,0x46d39a][i], pants:0x2a2f3a, shoe:0x1b1d21}, '🚶 Khách ngắm cảnh Cầu Kính', '#7fe7ff'); o.off=(i-1)*1.4; shuttle(o, a, b, 1+R()*.3);
      const u=o.upd; o.upd=(dt,T)=>{ u(dt,T); if(R()<dt*.004) say(o, pick(['Nhìn xuống chóng mặt luôn 😵','Sàn kính trong veo!','Khe vực sâu ghê!']), 2.6); }; }
    const ph=person(sM(5310), {shirt:0x1b1d22, pants:0x6b5a3a, shoe:0x111111, style:'cap'}, '📸 Nhiếp ảnh gia', '#ff9fc4'); ph.x=(a.x+b.x)/2+1.2; ph.z=(a.z+b.z)/2; ph.y=(a.h+b.h)/2; ph.hd=Math.atan2(b.x-a.x,b.z-a.z)+Math.PI/2; attach(ph, cam());
    ph.upd=(dt,T)=>{ put(ph); pose(ph,'camera',T); if(R()<dt*.005) say(ph, pick(['📸 Tách! Khoảnh khắc mây tràn khe vực','Góc này chụp tháp Liên Hoa đẹp nhất!']), 2.8); }; }

  /* ============================== 3. THÁP LIÊN HOA: bảo tàng · đấu trường · phòng chỉ huy · Sky Bar · Bida ============================== */
  const FL=[[0, A0+1.5, 15, '🏛️ Nhân viên bảo tàng', 0x7a1020, 'phone', ['Đây là con bug Y2K huyền thoại nè!','Bảo tàng thảm hoạ phần mềm – xem để không lặp lại 😅']],
    [1, A0+Math.PI+.4, 13.5, '🎤 MC Đấu trường Test Design', 0x3a0ca3, 'mic', ['Ai trả lời đúng 5 câu liên tiếp nào?! 🎤','Phân vùng tương đương – câu hỏi tiếp theo!']],
    [2, A0+Math.PI*.5+.2, 15, '🧑‍💻 Kỹ sư trực phòng chỉ huy', 0x2a2f3a, 'phone', ['TPS ổn định 12.000, không lỗi 🟢','Đã chặn 3 lượt quét cổng đáng ngờ 🛡️']]];
  for(const [f,a,r,nm,col,ps,lines] of FL){ if(FY[f]==null) continue; const [x,z]=at(a,r), o=person(f===1?sF(5401+f):sM(5401+f), {shirt:col, pants:0x1b1d22, shoe:0x111111, long:true}, nm, '#c7d2e0'); o.x=x; o.z=z; o.y=FY[f]; o.hd=yawOut(a)+Math.PI;
    if(ps==='mic') attach(o, new THREE.Mesh(new THREE.CylinderGeometry(.025,.02,.18,8), std(0x222222)));
    o.upd=(dt,T)=>{ put(o); if(ps==='phone'){ if(o.a.g.visible) o.po.apply('phone',T); } else pose(o,ps,T); if(R()<dt*.006) say(o, pick(lines), 3); }; }
  if(FY[4]!=null){ const y=FY[4], ba=A0+Math.PI+.2, [bx,bz]=at(ba,16.6), bt=person(sM(5501), {shirt:0x1b1d22, pants:0x1b1d22, shoe:0x111111, long:true}, '🍸 Bartender Sky Bar', '#ffd166'); bt.x=bx; bt.z=bz; bt.y=FY[3]; bt.hd=yawOut(ba)+Math.PI;   /* 21/11: Sky Bar dời xuống tầng 4 (tầng 5 chỉ còn khu trò chơi) */
    bt.upd=(dt,T)=>{ put(bt); pose(bt,'bar',T); if(R()<dt*.006) say(bt, pick(['Mocktail Liên Hoa, lắc nhẹ là xong 🍸','Ngồi ngắm 360° thành phố đi bạn!']), 2.8); };
    for(let k=0;k<2;k++){ const a=A0+Math.PI*.5+.55+k*.42, [tx,tz]=at(a,15.5), yo=yawOut(a), o=person(sM(5511+k), {shirt:k?0x7a1020:0xf4f2ec, pants:0x1b1d22, shoe:0x111111, long:true}, '🎱 Cơ thủ Bida Hoàng gia', '#c7d2e0');
      const s=k?-1:1; o.x=tx+Math.cos(yo)*s*1.95; o.z=tz-Math.sin(yo)*s*1.95; o.y=y; o.hd=yo+(s>0?-Math.PI/2:Math.PI/2);
      attach(o, new THREE.Mesh(new THREE.CylinderGeometry(.006,.014,1.45,8).rotateX(Math.PI/2).translate(0,0,.5), std(0xd8b27a)));
      o.upd=(dt,T)=>{ put(o); pose(o,'cue',T+o.ph); if(R()<dt*.005) say(o, pick(['Ba băng… vào! 🎱','Thoa lơ cái đã.','Cú này tính bằng hình học!']), 2.4); }; } }

  /* ============================== 4. XÍCH ĐU TỬ THẦN · KHINH KHÍ CẦU · SÂN BAY ĐỈNH MÂY ============================== */
  for(const [x,z,nm,seed,lines] of [[880,265-9.5,'🦺 Nhân viên vận hành xích đu tử thần',5601,['Kiểm tra đai an toàn 2 lần rồi nha! ✅','Ai dám thử xích đu vượt vực nào? 😱']],[925-4.6,250,'🎈 Phi công khinh khí cầu',5602,['Gió nhẹ, khinh khí cầu sẵn sàng cất cánh 🎈','Lên 210 m ngắm trọn đảo luôn!']]]){
    const base=(hAt && hAt(x,z)) ?? 110, o=person(sM(seed), {shirt:0xffb547, pants:0x2a2f3a, shoe:0x111111, style:'cap'}, nm, '#ffb547'); o.x=x; o.z=z; o.y=base; o.hd=Math.PI;
    o.upd=(dt,T)=>{ const busy=B.ride && B.ride.on; put(o); if(busy) pose(o,'signal',T); else if(((T*.3+o.ph)%7)<2 && o.a.g.visible) o.po.apply('present',T); if(R()<dt*.005) say(o, pick(lines), 2.8); }; }
  { const ap=(W.AIRPORTS||[]).find(a=>a.key==='brain'); if(ap && ap.spawn){ const x0=ap.spawn.x-30, x1=2*ap.x-x0, z1=ap.spawn.z+23, hx=x1-26, hz=z1-24, y=ap.y;
      const o=person(sM(5701), {shirt:0x16324f, pants:0x16324f, shoe:0x111111, long:true, style:'cap'}, '🚁 Phi công trực thăng', '#4fc3ff'); o.x=hx+4.5; o.z=hz+2; o.y=y; o.hd=-Math.PI/2;
      // trực thăng đậu trên bãi
      const hel=new THREE.Group(), body=std(0xc8102e,{metalness:.35, roughness:.35}), dark=std(0x1b1d22,{metalness:.5});
      const parts=[[new THREE.SphereGeometry(1.6,20,14).scale(1.5,1,1).translate(0,1.8,0), body], [new THREE.CylinderGeometry(.35,.18,5,10).rotateZ(Math.PI/2).translate(-4.2,2,0), body], [new THREE.BoxGeometry(.15,1.4,.8).translate(-6.6,2.6,0), body],
        [new THREE.BoxGeometry(5,.12,.12).translate(0,.25,.9), dark], [new THREE.BoxGeometry(5,.12,.12).translate(0,.25,-.9), dark], [new THREE.CylinderGeometry(.12,.12,.8,8).translate(0,3.4,0), dark], [new THREE.SphereGeometry(1.2,16,10).scale(.9,.7,1).translate(1.4,2,0), std(0x9fc6dd,{roughness:.05, metalness:.3, transparent:true, opacity:.6})]];
      for(const [g,m] of parts){ const ms=new THREE.Mesh(g,m); ms.castShadow=true; hel.add(ms); } const rotor=new THREE.Mesh(new THREE.BoxGeometry(11,.06,.35), dark); rotor.position.y=3.85; hel.add(rotor);
      hel.position.set(hx,y,hz); hel.userData.dynamic=true; hel.visible=false; scene.add(hel); circles.push({x:hx, z:hz, r:2.6, y0:y-.5, y1:y+4});
      o.upd=(dt,T)=>{ put(o); if(((T*.25+o.ph)%8)<3 && o.a.g.visible) o.po.apply('phone',T); rotor.rotation.y+=dt*.6; hel.visible=(P.x-hx)**2+(P.z-hz)**2<250**2; if(R()<dt*.004) say(o, pick(['🚁 Bay ngắm đảo 10 phút, ai đi không?','Trực thăng đã tiếp nhiên liệu xong!']), 2.8); }; } }

  /* ============================== 5. KHÁCH THAM QUAN – HÀNH TRÌNH QUA 6 TẦNG (23/11, Bình) ==============================
     Vào từ cửa tầng 1 → đọc các bảng tầng 1 → ĐI CẦU THANG XOẮN (bám từng bậc 0,25 m, 32 bậc/tầng) lên tầng 2 → đọc → 3 → 4 →
     tầng 5 (khu trò chơi: ra chiếu nghỉ đứng xem một lúc) → tầng 6 → xem bia vinh danh / Brain Core / Đình Vọng Cảnh →
     đi THANG MÁY THẬT (liftkit: đứng chờ, gọi, cửa mở, vào cabin, cabin chạy, cửa mở, ra) xuống tầng 1 → ra cửa. Khách ra thì khách khác vào.
     Vào lệch giờ + lúc mở game rải sẵn khách ở các tầng → tầng nào cũng ~2–3 khách. Vòng đi bộ / điểm đứng: B.view (brain_citadel.js). */
  if(Array.isArray(B.view) && FY.length>=6){ const VIEW=B.view, STEP=.25, SPT=32, DA=Math.PI*2/SPT, RM=6.2, RL=10.85, YT=FY[0];
    const OUTF=[0x2f6fd0,0xff8a5a,0x46d39a,0xffd23f,0xc94f7c,0x7a9cc6,0xe9e4d8,0x1b1d22,0x6b3e26,0x8e5bb5,0x2a9d8f,0xb5543c];
    const LINESV=['Hay quá, phải ghi lại mới được 📝','À, ra là vậy… 🤔','Mục này đáng đọc kỹ!','Áp dụng ngay vào dự án thôi 💡','Chụp lại để tối ôn 📚','Đúng cái mình đang cần!'];
    const LINES={0:['Bảo tàng thảm hoạ phần mềm – rùng mình thật 😅','Một con bug mà thiệt hại cả triệu đô!'], 1:['Thử kiosk đố vui Test Design xem nào 🧠'], 2:['Màn hình giám sát đẹp ghê 📈'], 3:['Danh nhân ngành kiểm thử đây rồi 🏛️','Lát ghé nhà hàng xoay nhé 🍽️'], 4:['Bàn bi lắc vui ghê ⚽','Xem người ta đánh bida chút 🎱'], 5:['Bảng vinh danh đẹp quá 🏆','Ngắm 360° từ sân thượng tuyệt thật!']};
    const angOf=(x,z)=>Math.atan2(z-C.z, x-C.x), dA=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a)), ringOf=f=>VIEW[f] ? VIEW[f].ring : 12.2;
    const route=(f, x, z, tx, tz)=>{ const Rr=ringOf(f), a0=angOf(x,z), a1=angOf(tx,tz), d=dA(a0,a1), n=Math.max(1,Math.ceil(Math.abs(d)*Rr/2.2)), out=[];
      const [rx0,rz0]=at(a0,Rr); if(Math.hypot(rx0-x,rz0-z)>.3) out.push([rx0,rz0]); for(let i=1;i<=n;i++) out.push(at(a0+d*i/n, Rr)); out.push([tx,tz]); return out; };
    const LIFTS=(()=>{ try{ return allLifts().filter(l=>Math.hypot(l.cx-C.x,l.cz-C.z)<20 && l.floors && l.floors.length>=6); }catch(e){ return []; } })();
    const lyaw=L=>L.g ? L.g.rotation.y : yawOut(angOf(L.cx,L.cz)), liftFront=L=>{ const y=lyaw(L); return [L.cx+Math.sin(y)*2.45, L.cz+Math.cos(y)*2.45]; };   /* cửa cabin quay theo yaw của thang */
    const POOL=[], USED=[0,1,2,3,4,5].map(()=>new Set()), N=LOW?10:15;
    const cnt=f=>POOL.reduce((n,o)=>n+(!o.gone && o.f===f && o.st!=='liftride' ? 1 : 0),0);
    for(let i=0;i<N;i++){ const seed=6101+i, fem=i%2===1;
      const o=person(fem?sF(seed):sM(seed), {shirt:OUTF[i%OUTF.length], pants:[0x2a3a5a,0x1b1d22,0x3a3a3a,0x6b5a3a][i%4], shoe:0x1b1d21, style:i%3===2?'cap':undefined}, '🚶 Khách tham quan tháp', '#9fd36a');
      Object.assign(o,{floorOnly:true, gone:true, f:0, y:YT, x:C.x, z:C.z, path:[], st:'gone', tm:0, spot:null, hx:i%2, style:i%3, then:null, s:null, lift:null}); o.upd=(dt,T)=>step(o,dt,T); POOL.push(o); }
    const goto=(o, pts, then)=>{ o.path=pts; o.then=then; o.st='walk'; };
    const free=(f,not)=>{ const V=VIEW[f]; if(!V) return null; const L=V.spots.filter(s=>!USED[f].has(s) && s!==not); return L.length ? L[Math.floor(R()*L.length)] : null; };
    const release=o=>{ if(o.spot){ USED[o.sf].delete(o.spot); o.spot=null; } };
    // tới 1 tầng: lên kế hoạch đọc (tầng 5: đứng xem trò chơi ở chiếu nghỉ)
    function onFloor(o, f){ o.f=f; o.y=FY[f];
      if(f===4){ const sa=A0+o.hx*Math.PI, w=at(sa+(R()<.5?-1:1)*.14, 11.7); goto(o, [at(sa,RL), w], ()=>{ o.st='watch'; o.tm=8+R()*7; o.whd=yawOut(angOf(w[0],w[1])); }); return; }
      o.reads=1+(R()<.55?1:0)+(cnt(f)<2?1:0); nextRead(o); }
    function nextRead(o){ const f=o.f; release(o);
      if(o.reads>0){ const s=free(f,o.last); if(s){ o.reads--; o.spot=s; o.sf=f; USED[f].add(s); o.last=s; goto(o, route(f, o.x, o.z, s.x, s.z), ()=>{ o.st='read'; o.tm=25+R()*10; }); return; } }
      if(f===5) goLift(o); else goUp(o); }
    // lên tầng bằng cầu thang xoắn: ra vòng → tới góc cầu thang → vào lòng thang (r 6,2) → leo từng bậc tới tầng trên → ra chiếu nghỉ
    function goUp(o){ const f=o.f, sa=A0+o.hx*Math.PI; release(o);
      goto(o, route(f, o.x, o.z, ...at(sa,10.5)).concat([at(sa,RM), {stair:true, s0:f*SPT, s1:(f+1)*SPT}, at(sa,RL)]), ()=>onFloor(o, f+1)); }
    // tầng 6 → thang máy thật xuống tầng 1
    function goLift(o){ release(o); const L=LIFTS.filter(l=>!l.botBy).sort((p,q)=>Math.hypot(p.cx-o.x,p.cz-o.z)-Math.hypot(q.cx-o.x,q.cz-o.z))[0];
      if(!L){ o.reads=1; return nextRead(o); } L.botBy=o; o.lift=L; const fr=liftFront(L); goto(o, route(5, o.x, o.z, fr[0], fr[1]), ()=>{ o.st='liftwait'; o.tm=0; o.hd=lyaw(L)+Math.PI; }); }
    function exitOut(o){ const E=VIEW[0].entry, e=E[Math.floor(R()*E.length)], d=at(e.a, e.r); goto(o, route(0, o.x, o.z, d[0], d[1]), ()=>{ o.gone=true; o.st='gone'; o.a.g.visible=false; o.col.x=1e9; if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } }); }
    function spawn(o, f){ o.gone=false; o.lift=null; o.s=null; o.last=null; o.hd=0;
      if(f===0){ const E=VIEW[0].entry, e=E[Math.floor(R()*E.length)], [x,z]=at(e.a,e.r); o.x=x; o.z=z; o.f=0; o.y=FY[0]; o.hd=yawOut(e.a)+Math.PI; onFloor(o,0); }
      else { const sa=A0+o.hx*Math.PI, [x,z]=at(sa,RL); o.x=x; o.z=z; onFloor(o,f); } }
    function step(o, dt, T){ if(o.gone){ o.col.x=1e9; return; }
      if(o.st==='walk'){ const wp=o.path[0];
        if(!wp){ const t=o.then; o.then=null; o.st='idle'; o.a.play('idle'); put(o); if(t) t(); return; }
        if(wp.stair){ if(o.s==null) o.s=wp.s0; o.s=Math.min(wp.s1, o.s+dt*.72); const a=A0+o.hx*Math.PI+o.s*DA, [x,z]=at(a,RM), ty=YT+Math.round(o.s)*STEP;   /* chân đặt đúng mặt bậc đang đứng */
          o.x=x; o.z=z; o.y+=(ty-o.y)*(1-Math.exp(-dt*16)); o.hd=lerpAngle(o.hd, Math.atan2(-Math.sin(a),Math.cos(a)), 1-Math.exp(-dt*8)); o.a.play('walk'); const ac=o.a.acts.walk; if(ac) ac.timeScale=.75; put(o);
          if(o.s>=wp.s1){ o.y=YT+wp.s1*STEP; o.s=null; o.path.shift(); } return; }
        const [tx,tz]=wp, dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<.2){ o.path.shift(); return; }
        const k=Math.min(d,1.05*dt); o.x+=dx/d*k; o.z+=dz/d*k; o.hd=lerpAngle(o.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*7)); o.a.play('walk'); const ac=o.a.acts.walk; if(ac) ac.timeScale=.8; put(o); return; }
      if(o.st==='read' || o.st==='watch'){ o.tm-=dt; const hd=o.st==='read' && o.spot ? o.spot.hd : o.whd; if(hd!=null) o.hd=lerpAngle(o.hd, hd, 1-Math.exp(-dt*5)); o.a.play('idle'); put(o);
        const ph=(T*.12+o.ph)%10; pose(o, o.st==='watch' ? (o.style===1 ? 'behind' : 'think') : (o.style===1 && ph<4 ? 'behind' : ph>8.6 ? 'point' : 'think'), T+o.ph);
        if(R()<dt*.012) say(o, R()<.5 && o.st==='read' ? pick(LINESV) : pick(LINES[o.f]||LINESV), 2.8);
        if(o.tm<=0){ if(o.st==='watch'){ const sa=A0+o.hx*Math.PI; o.st='walk'; goto(o, [at(sa,10.5), at(sa,RM), {stair:true, s0:4*SPT, s1:5*SPT}, at(sa,RL)], ()=>onFloor(o,5)); } else nextRead(o); } return; }
      const L=o.lift;
      if(o.st==='liftwait'){ o.tm+=dt; o.a.play('idle'); put(o); if(((T*.2+o.ph)%8)<2.5) pose(o,'behind',T);
        if(!L || o.tm>40){ /* thang không chạy (bạn ở quá xa) → coi như đã xuống, vẫn đi ra cửa */ if(L) L.botBy=null; o.lift=null; const fr=L?liftFront(L):at(ENT,15.6); o.x=fr[0]; o.z=fr[1]; o.f=0; o.y=FY[0]; return exitOut(o); }
        if(L.ph==='idle' && L.at!==5 && L.queue==null) L.go(5,false);
        if(L.ph==='idle' && L.at===5){ L.wantOpen=true; if(L.open>.92){ o.st='walk'; goto(o, [[L.cx, L.cz]], ()=>{ o.st='liftin'; o.tm=0; }); } } return; }
      if(o.st==='liftin'){ L.wantOpen=true; o.tm+=dt; o.hd=lerpAngle(o.hd, lyaw(L), 1-Math.exp(-dt*6)); o.a.play('idle'); put(o); if(o.tm>1.2){ L.go(0,false); o.st='liftride'; } return; }
      if(o.st==='liftride'){ o.x=L.cx; o.z=L.cz; o.y=L.y; o.a.play('idle'); put(o); if(((T*.2+o.ph)%9)<3) pose(o,'behind',T);
        if(L.ph==='idle' && L.at===0){ L.wantOpen=true; if(L.open>.92){ o.f=0; o.y=FY[0]; const fr=liftFront(L); o.st='walk'; goto(o, [fr], ()=>{ L.botBy=null; o.lift=null; exitOut(o); }); } }
        else if(L.ph==='idle' && L.at!==0 && L.queue==null) L.go(0,false); return; }
      o.a.play('idle'); put(o); }
    // lúc mở game: rải sẵn khách ở các tầng (lệch giờ) · sau đó cứ 18–30 s 1 khách mới vào từ tầng 1 khi còn thiếu
    { let k=0; for(const f of [0,1,2,3,5]) for(let j=0;j<2 && k<POOL.length;j++){ const o=POOL[k++]; spawn(o,f); if(o.st==='walk' && o.path.length>1) o.path.splice(0, Math.floor(R()*Math.min(3,o.path.length-1))); } }
    let tickV=0, cool=6; const TARGET=LOW?9:13;
    HOOK.onFrame.push(dt=>{ dt=Math.min(dt||1/60,.1); if((tickV-=dt)>0) return; tickV=.5; cool-=.5;
      const act=POOL.filter(o=>!o.gone).length; if(cool<=0 && act<TARGET && cnt(0)<3){ const o=POOL.find(q=>q.gone); if(o){ spawn(o,0); cool=18+R()*12; } } });
    W.brainVisitors={get floors(){ return [0,1,2,3,4,5].map(f=>({f, y:FY[f], n:cnt(f)})); }, list:POOL, lifts:LIFTS.length}; }


  /* ============================== KHUNG HÌNH: ẩn/hiện theo khoảng cách ============================== */
  const FAR=(LOW?60:85)**2, Z={x0:620, x1:1150, z0:-100, z1:450}; let tick=0, awake=false;
  for(const o of NPC) o.a.g.visible=false;
  HOOK.onFrame.push((dt,T)=>{ dt=Math.min(dt,.1); tick-=dt;
    if(tick<=0){ tick=.5; const d=W.inside?1e9:Math.hypot(Math.max(Z.x0-P.x,0,P.x-Z.x1), Math.max(Z.z0-P.z,0,P.z-Z.z1)); awake=d<150;
      const c=W.camera.position; for(const o of NPC){ const v=awake && !o.gone && (!o.floorOnly || Math.abs(o.y-P.y)<5) && ((o.x-c.x)**2+(o.z-c.z)**2<FAR) && Math.abs(o.y-c.y)<60; if(o.a.g.visible!==v){ o.a.g.visible=v; if(!v){ o.col.x=1e9; if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } } } } }
    if(!awake) return;
    for(const o of NPC){ if(o.bubble){ o.bubbleT-=dt; if(o.bubbleT<=0){ removeLabel(o.bubble); o.bubble=null; } } if(o.a.g.visible) o.a.mixer.update(dt); if(o.upd) o.upd(dt,T); } });   /* hoạt hình trước, tư thế ghi đè sau */
  const res={npc:NPC.length}; Object.defineProperty(res,'list',{value:NPC, enumerable:false});
  W.brainBots=res; console.info('[Bot Brain Citadel]', res); return res;
}
