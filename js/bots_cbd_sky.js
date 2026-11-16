// QC World V2 – PHA 9 (phần phiên qc-park): BOT SỐNG ĐỘNG CHO RIVER TECH CBD + SÂN BAY QUỐC TẾ QA/QC (theo bible Phần 7 – bảng 55 loại bot)
//  CBD: nhân viên văn phòng đi lại trong 4 trụ sở · B01 công nhân lau kính trên gondola treo (tháp Beijing Starlight) · B03 cơ thủ Bida ở Cổng Trời 95 m
//       · B06 người chèo kayak trên kênh Đông Hoa · B08 barista ở quầy cafe Ring + xe cafe Dragonscale · B10 nghệ sĩ violin chơi theo nhạc nước (Cầu Kính)
//       · Principal Architect cầm tablet trên Cầu Kính · người bán kẹo hồ lô ven sông · bảo vệ đi Segway vòng sân vườn Ring · bác sĩ trực thăng trên mái bệnh viện
//  Sân bay: cơ trưởng + 2 tiếp viên kéo vali đi qua nhà ga · hành khách kéo vali · nhân viên check-in · an ninh soi chiếu
//       · nhân viên vẫy 2 gậy đèn LED (marshaller) trước máy bay · xe kéo hành lý + 3 toa chạy vòng sân đỗ
//  Hiệu năng: bot chỉ hiện + chạy hoạt hình khi cách camera < 85 m (máy yếu 60 m); cả vùng ngủ khi bạn ở xa > 120 m
import { makePoser } from './pose.js';

export async function make(W, ctx, opt={}){
  const {THREE, scene, circles, HOOK, P, makeActor, makeLabel, removeLabel, lerpAngle, mergeGeometries} = W;
  const C=opt.cbd, K=opt.sky; if(!W.people || !C || !K) return null;
  const R=Math.random, pick=a=>a[Math.floor(R()*a.length)], TAU=Math.PI*2, LOW=W.QUAL==='low', clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const Y=C.layout.Y, GY=K.layout.GY;
  const NPC=[], sM=s=>W.people.pickSeed(L=>!L.female,s), sF=s=>W.people.pickSeed(L=>L.female,s);
  const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.5}, o));
  function person(seed, outfit, name, dot, zone){ const k=W.people.kit(seed,{outfit}); const a=makeActor(k.gl,{name, height:k.h, face:0, clips:k.clips, compact:false, dot:dot||'#9fd36a'});
    if(k.look && k.look.width){ a.root.scale.x*=k.look.width; a.root.scale.z*=k.look.width; } if(LOW) a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
    a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a); const anchor=new THREE.Object3D(); anchor.position.y=k.h+.75; a.g.add(anchor);
    const o={a, po, h:k.h, hips:po.hipsHeight(), anchor, x:0, y:0, z:0, hd:0, zone, bubble:null, bubbleT:0, col:{x:1e9, z:1e9, r:.3, owner:true}, upd:null, ph:R()*9}; circles.push(o.col); NPC.push(o); return o; }
  const say=(o,t,sec=3)=>{ if(o.bubble) removeLabel(o.bubble); o.bubble=makeLabel(t, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:30}); o.bubbleT=sec; };
  const put=(o,col=true)=>{ o.a.g.position.set(o.x,o.y,o.z); o.a.g.rotation.set(0,o.hd,0); if(col){ o.col.x=o.x; o.col.z=o.z; } else o.col.x=1e9; };
  const handOf=(o,side='Right')=>{ let h=null; o.a.g.traverse(b=>{ if(b.isBone && !h && new RegExp(side+'Hand$').test(b.name)) h=b; }); return h; };
  const _v=new THREE.Vector3();
  function attach(o, mesh, side='Right'){ const h=handOf(o,side); if(!h) return null; o.a.g.updateMatrixWorld(true); h.getWorldScale(_v); mesh.scale.multiplyScalar(1/(_v.x||1)); h.add(mesh); return mesh; }
  // tư thế riêng (ngắm xương theo hướng thế giới như pose.js)
  const _pa=new THREE.Vector3(), _pb=new THREE.Vector3(), _pd=new THREE.Vector3(), _qa=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _F=new THREE.Vector3(), _R=new THREE.Vector3(), _U=new THREE.Vector3(0,1,0);
  function aim(bn,n,c,f,u,r){ const B=bn[n], Cc=bn[c]; if(!B||!Cc) return; B.getWorldPosition(_pa); Cc.getWorldPosition(_pb); _pb.sub(_pa).normalize(); _pd.set(0,0,0).addScaledVector(_F,f).addScaledVector(_U,u).addScaledVector(_R,r).normalize(); _qa.setFromUnitVectors(_pb,_pd); B.getWorldQuaternion(_wq); B.parent.getWorldQuaternion(_pq); _wq.premultiply(_qa); B.quaternion.copy(_pq.invert().multiply(_wq)); B.updateMatrixWorld(true); }
  function pose(o, kind, t=0){ const bn=o.po.bones; if(!bn || !bn.Hips || !o.a.g.visible) return; o.a.g.updateMatrixWorld(true); o.a.g.getWorldDirection(_F); _F.y=0; _F.normalize(); _R.set(-_F.z,0,_F.x); const LR=[['Left',-1],['Right',1]];
    switch(kind){
      case 'wipe': { const e=Math.sin(t*3); aim(bn,'RightArm','RightForeArm',.75,.45,.35+e*.35); aim(bn,'RightForeArm','RightHand',.8,.6,e*.5); aim(bn,'LeftArm','LeftForeArm',.3,-1,-.2); break; }
      case 'cue': aim(bn,'Spine','Spine1',.75,.65,0); { const e=Math.max(0,Math.sin(t*2.2)); aim(bn,'RightArm','RightForeArm',-.4+e*.3,-.9,.3); aim(bn,'RightForeArm','RightHand',.9,-.25,0); aim(bn,'LeftArm','LeftForeArm',.9,-.45,-.15); aim(bn,'LeftForeArm','LeftHand',1,-.2,0); } break;
      case 'violin': { const e=Math.sin(t*3.4); aim(bn,'LeftArm','LeftForeArm',.75,.3,-.55); aim(bn,'LeftForeArm','LeftHand',.6,.55,.2); aim(bn,'RightArm','RightForeArm',.45,.1,.6); aim(bn,'RightForeArm','RightHand',.3+e*.4,.35,-.8); aim(bn,'Neck','Head',.25,1,-.25); break; }
      case 'wands': { const e=Math.sin(t*2.6); for(const [s,k] of LR){ const w=k>0?e:-e; aim(bn,s+'Arm',s+'ForeArm',.15,.35+w*.6,k*.9); aim(bn,s+'ForeArm',s+'Hand',.2,.9,k*(.2-w*.5)); } break; }
      case 'paddle': { const e=Math.sin(t*2.8); for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.9,-.2+(k*e)*.35,k*.35); aim(bn,s+'ForeArm',s+'Hand',1,(k*e)*.3,-k*.4); } aim(bn,'Spine','Spine1',.2,1,e*.15); break; }
      case 'bar': for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.8,-.55,k*.2); aim(bn,s+'ForeArm',s+'Hand',1,.15,-k*.15); } break;
      case 'sit': for(const [s,k] of LR){ aim(bn,s+'UpLeg',s+'Leg',1,-.12,k*.05); aim(bn,s+'Leg',s+'Foot',.15,-1,0); } break;
      case 'stick': aim(bn,'RightArm','RightForeArm',.35,-.4,.6); aim(bn,'RightForeArm','RightHand',.4,.9,.1); break;
    } }
  // đi theo chuỗi điểm (vòng lặp), dừng nghỉ ngẫu nhiên
  function walker(o, pts, sp=1.25, y=Y){ Object.assign(o,{pts, wi:0, sp, y, wait:R()*3}); o.x=pts[0][0]; o.z=pts[0][1]; o.upd=(dt,T)=>{ if(o.wait>0){ o.wait-=dt; o.a.play('idle'); put(o); return 'idle'; }
      const [tx,tz]=o.pts[o.wi], dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<.25){ o.wi=(o.wi+1)%o.pts.length; if(R()<.35) o.wait=2+R()*5; return 'idle'; }
      const k=Math.min(d, o.sp*dt); o.x+=dx/d*k; o.z+=dz/d*k; o.hd=lerpAngle(o.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*8)); o.a.play('walk'); const ac=o.a.acts.walk; if(ac) ac.timeScale=clamp(o.sp/1.35,.6,1.1); put(o); return 'walk'; }; return o; }
  const OUT={shirt:0xf4f2ec, pants:0x2a2f3a, shoe:0x1b1d21};
  const H=C.hq;

  /* ============================== CBD ============================== */
  // nhân viên văn phòng (8) – đi giữa bàn, quầy cafe, phòng họp trong 4 trụ sở
  { const ring=H.ring, rp=a=>[ring.c.x+Math.cos(a)*42, ring.c.z+Math.sin(a)*42];
    const routes=[[rp(.4),rp(1.2),rp(2.1),[ring.c.x+7,ring.c.z+ring.R1-7]], [rp(-2.6),rp(-1.9),rp(-1.0),rp(-.2)],
      [[H.dragon.x0+18,H.dragon.z0+42],[H.dragon.x0+50,H.dragon.z0+42],[H.dragon.x0+66,H.dragon.z0+48],[H.dragon.x0+30,H.dragon.z0+26]], [[H.dragon.x0+40,H.dragon.z0+60],[H.dragon.x0+70,H.dragon.z0+36],[H.dragon.x0+36,H.dragon.z0+34]],
      [[H.forest.x0+10,152],[H.forest.x1-10,152],[H.forest.x1-10,168],[H.forest.x0+10,168]], [[H.forest.c.x+12,H.forest.z0+8],[H.forest.c.x,H.forest.z1-8],[H.forest.x0+12,160+5]],
      [[H.tri.c.x-12,H.tri.c.z-9],[H.tri.c.x+12,H.tri.c.z-9],[H.tri.c.x,H.tri.c.z-15]], [[H.tri.door.x,H.tri.door.z+8],[H.tri.c.x+16,H.tri.c.z-12],[H.tri.c.x-16,H.tri.c.z-12]]];   /* sảnh Bắc Tri-Matrix: giữa màn hình Tech Talk và thang máy kính ở tâm – né bàn, quầy, giếng thang */
    const SH=[0x2f6fd0,0xffffff,0xc94f7c,0x46d39a,0x2a2f3a,0xf2c230,0x7a9cc6,0xff8a5a]; const LINES=['Bug này chỉ lỗi trên Safari…','Chiều nay demo cho khách nha!','Ai review giúp PR #482 với 🙏','Pipeline xanh rồi, deploy thôi!','Cà phê đã, rồi viết test case tiếp ☕'];
    routes.forEach((pts,i)=>{ const o=person(i%2?sF(2101+i):sM(2101+i), {shirt:SH[i], pants:0x2a2f3a, shoe:0x1b1d21}, `💼 ${W.people.nameOf(2101+i)} · nhân viên`, '#7fe7ff', 'cbd'); walker(o, pts, 1.15+R()*.25); const u=o.upd;
      o.upd=(dt,T)=>{ const st=u(dt,T); if(st==='idle' && ((T*.3+o.ph)%6)<2) pose(o,'stick',T); if(R()<dt*.008) say(o, pick(LINES), 2.6); }; }); }
  // B01 công nhân lau kính: 2 gondola trên mặt Nam 2 tháp Beijing Starlight (mỗi gondola 2 người)
  const GOND=[]; for(const [i,t] of (C.condos||[]).slice(0,2).entries()){ const g=new THREE.Group(); const plat=new THREE.Mesh(new THREE.BoxGeometry(6,.25,1.2), std(0xff8a2a,{metalness:.4})); g.add(plat);
      for(const sx of [-1,1]){ const rail=new THREE.Mesh(new THREE.BoxGeometry(.06,1,1.2), std(0xc9ced4,{metalness:.8})); rail.position.set(sx*3,.6,0); g.add(rail); } const rr=new THREE.Mesh(new THREE.BoxGeometry(6,.06,.06), std(0xc9ced4,{metalness:.8})); rr.position.set(0,1.1,.6); g.add(rr);
      const cab=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1,4), std(0x222222)); g.add(cab); g.userData.dynamic=true; scene.add(g);
      const G={g, cab, t, z:t.z+12+.75, y0:Y+12, y1:Y+t.h-6, ph:i*7, men:[]}; GOND.push(G);
      for(const sx of [-1.3,1.3]){ const o=person(sM(2201+i*2+(sx>0?1:0)), {shirt:0xff8a2a, pants:0x2a3a5a, shoe:0x1b1d21, style:'cap'}, '🔳 Công nhân lau kính', '#ffb547', 'cbd'); o.gx=sx; o.G=G; o.hd=Math.PI;
        const sq=new THREE.Mesh(mergeGeometries([new THREE.CylinderGeometry(.02,.02,.5,6).translate(0,.25,0), new THREE.BoxGeometry(.4,.06,.05).translate(0,.52,0)]), std(0x4fc3ff)); attach(o, sq);
        o.upd=(dt,T)=>{ o.x=G.t.x+o.gx; o.z=G.z-.2; o.y=G.g.position.y+.13; o.hd=Math.PI; put(o,false); pose(o,'wipe',T+o.ph); if(R()<dt*.004) say(o, pick(['Lau xong tầng này rồi! 🔳','Trên này gió mạnh ghê!','Chào bạn ở dưới nha 👋']), 2.4); }; G.men.push(o); } }
  // B03 cơ thủ Bida ở CLB Cổng Trời (2 bàn)
  { const tw=H.twin, BY=tw.BY0, cz=(tw.z0+tw.z1)/2; [[-7,1],[7,-1]].forEach(([dz,s],i)=>{ const o=person(sM(2301+i), {shirt:i?0x1b1d22:0x7a1020, pants:0x1b1d22, shoe:0x111111, long:true}, '🎱 Cơ thủ Bida Carom', '#c7d2e0', 'cbd'); o.x=tw.bx0+1+34+s*1.9; o.z=cz+dz; o.y=BY; o.hd=s>0?-Math.PI/2:Math.PI/2;
    const cue=new THREE.Mesh(new THREE.CylinderGeometry(.006,.014,1.45,8).rotateX(Math.PI/2).translate(0,0,.5), std(0xd8b27a)); attach(o, cue);
    o.upd=(dt,T)=>{ put(o); pose(o,'cue',T+o.ph); if(R()<dt*.006) say(o, pick(['Ba băng… vào! 🎱','Thoa lơ cái đã.','Đường này khó đây.']), 2.4); }; }); }
  // B06 kayak trên kênh Đông Hoa (2 thuyền)
  const KAY=[]; { const can=C.layout.CAN[0], kx=(can.x0+can.x1)/2; for(let i=0;i<2;i++){ const boat=new THREE.Mesh(mergeGeometries([new THREE.CapsuleGeometry(.4,3.2,4,10).rotateX(Math.PI/2).scale(1,.45,1)]), std(i?0xffc531:0xff4f6d,{roughness:.35}));
      boat.userData.dynamic=true; scene.add(boat); const pad=new THREE.Mesh(mergeGeometries([new THREE.CylinderGeometry(.03,.03,2.2,6).rotateZ(Math.PI/2), new THREE.BoxGeometry(.05,.35,.18).translate(1.1,0,0), new THREE.BoxGeometry(.05,.35,.18).translate(-1.1,0,0)]), std(0x222222)); pad.userData.dynamic=true; scene.add(pad);
      const o=person(i?sF(2401):sM(2402), {shirt:i?0x46d39a:0xff6b3d, pants:0x2a3a5a, shoe:0x1b1d21}, '🛶 Người chèo kayak', '#4fc3ff', 'cbd'); const K2={boat, pad, o, x:kx+(i?-3:3), z:i?-80:300, dir:i?1:-1};
      KAY.push(K2); o.upd=(dt,T)=>{ K2.z+=K2.dir*1.6*dt; if(K2.z>430){ K2.dir=-1; } if(K2.z<-110){ K2.dir=1; } const hd=K2.dir>0?0:Math.PI, wy=W.WATER_Y+.05;
        boat.position.set(K2.x,wy,K2.z); boat.rotation.y=hd; o.x=K2.x; o.z=K2.z; o.y=wy+.12-o.hips*.55; o.hd=hd; put(o,false); pose(o,'sit',T); pose(o,'paddle',T*1.0+i);
        pad.position.set(K2.x,wy+.75,K2.z+Math.sin(hd)*.3); pad.rotation.set(Math.sin(T*2.8+i)*.6,hd,0); }; } }
  // B08 barista (quầy cafe Ring + xe cafe cổ Dragonscale)
  for(const [i,[x,z,hd]] of [[H.ring.c.x+7,H.ring.c.z+H.ring.R1-4.1,Math.PI],[H.dragon.x0+70,H.dragon.z0+53.6,Math.PI]].entries()){ const o=person(sF(2501+i), {shirt:0x6b3e26, pants:0x1b1d21, shoe:0x111111}, '☕ Barista pha cà phê thủ công', '#ffb547', 'cbd'); o.x=x; o.z=z; o.y=Y; o.hd=hd;
    o.upd=(dt,T)=>{ put(o); if(((T*.4+o.ph)%5)<2.5) pose(o,'bar',T); if(R()<dt*.008) say(o, pick(['Pour-over đang chảy, chờ mình 2 phút nhé ☕','Rang mới sáng nay, thơm lắm!','Một ly cold brew cho anh chị nè!']), 2.6); }; }
  // B10 nghệ sĩ violin trên tầng kính Cầu Kính (chơi theo nhạc nước) · Principal Architect cầm tablet ở tầng dưới
  { const gb=C.layout.BR.find(b=>b.kind==='glass'); if(gb){ const UY=Y+5.26, cx=(gb.x0+gb.x1)/2;
      const v=person(sF(2601), {shirt:0x1b1d22, pants:0x1b1d22, shoe:0x111111, long:true}, '🎻 Nghệ sĩ violin · nhạc nước', '#ff9fc4', 'cbd'); v.x=cx+1; v.z=112; v.y=UY; v.hd=Math.PI/2;
      const vio=new THREE.Mesh(mergeGeometries([new THREE.BoxGeometry(.2,.06,.55), new THREE.BoxGeometry(.04,.03,.3).translate(0,0,.4)]), std(0x8a3d1a,{roughness:.35})); attach(v, vio, 'Left');
      v.upd=(dt,T)=>{ put(v); pose(v,'violin',T); if(R()<dt*.006) say(v, pick(['🎶 Bản này tặng những ai đang ngắm nhạc nước!','🎻 Canon in D, phối lại theo vòi phun','🎶 Tối nay sông đẹp quá!']), 3); };
      const ar=person(sM(2602), {shirt:0xf4f2ec, pants:0x3a3a3a, shoe:0x1b1d21, long:true}, '📐 Principal Architect', '#c7d2e0', 'cbd'); ar.x=cx-1.2; ar.z=104; ar.y=Y; ar.hd=Math.PI/2;
      const tab=new THREE.Mesh(new THREE.BoxGeometry(.25,.02,.18), std(0x1b1d22,{emissive:0x3fb8ff, emissiveIntensity:.5})); attach(ar, tab);
      ar.upd=(dt,T)=>{ put(ar); ar.po.apply('phone',T); if(R()<dt*.005) say(ar, pick(['Khối Cổng Trời này vươn ra 30 m mà không cần cột 😎','Kè sông chịu được lũ 100 năm đó!','Đêm nay LED trên tháp đổi theo nhạc nước.']), 3.2); }; } }
  // người bán kẹo hồ lô (2) ven sông Bắc, cạnh nhạc nước
  for(const [i,x] of [306,334].entries()){ const o=person(i?sF(2701):sM(2702), {shirt:0xc8102e, pants:0x2a2a2a, shoe:0x1b1d21, style:'cap'}, '🍡 Người bán kẹo hồ lô', '#ff6b6b', 'cbd'); o.x=x; o.z=86.6; o.y=Y; o.hd=0;
    const pole=new THREE.Group(); const st=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,2.4,8), std(0xd9b27a)); st.position.y=1.2; pole.add(st); const hay=new THREE.Mesh(new THREE.CylinderGeometry(.28,.22,.7,10), std(0xd8c27a,{roughness:.95})); hay.position.y=2.2; pole.add(hay);
    for(let k=0;k<14;k++){ const a=k/14*TAU, sk=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.5,4), std(0xd9b27a)); sk.position.set(Math.cos(a)*.3,2.35,Math.sin(a)*.3); sk.rotation.set(Math.sin(a)*.6,0,-Math.cos(a)*.6); pole.add(sk); for(let b=0;b<3;b++){ const ball=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6), std(0xd6211f,{roughness:.2})); ball.position.set(Math.cos(a)*(.38+b*.07),2.48+b*.07,Math.sin(a)*(.38+b*.07)); pole.add(ball); } }
    pole.position.set(x+.9,Y,86.6); pole.userData.dynamic=true; scene.add(pole); circles.push({x:x+.9, z:86.6, r:.35});
    o.upd=(dt,T)=>{ put(o); if(((T*.3+o.ph)%7)<2) o.po.apply('present',T); if(R()<dt*.01) say(o, pick(['Kẹo hồ lô đây! Chua chua ngọt ngọt 🍡','Mua 1 xiên ngắm nhạc nước đi bạn ơi!','Kẹo mới nhúng đường, giòn tan!']), 2.8); }; }
  // bảo vệ đi Segway vòng sân vườn trong QA Ring
  { const ring=H.ring, o=person(sM(2801), {shirt:0x1b1d22, pants:0x1b1d22, shoe:0x111111, style:'cap'}, '🛴 Bảo vệ Segway · QA Ring', '#9fb3c8', 'cbd');
    const seg=new THREE.Group(); const base=new THREE.Mesh(new THREE.BoxGeometry(.55,.12,.42), std(0x2a2e35)); base.position.y=.22; seg.add(base); for(const s of [-1,1]){ const wh=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.12,16).rotateZ(Math.PI/2), std(0x111111)); wh.position.set(s*.34,.22,0); seg.add(wh); } const st=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1,6), std(0xc9ced4,{metalness:.8})); st.position.set(0,.75,.42); st.rotation.x=-.12; seg.add(st); const hb=new THREE.Mesh(new THREE.BoxGeometry(.55,.04,.04), std(0x222222)); hb.position.set(0,1.22,.36); seg.add(hb);
    seg.userData.dynamic=true; scene.add(seg); let a=0;
    o.upd=(dt,T)=>{ a+=dt*2.2/24; const r=24; o.x=ring.c.x+Math.cos(a)*r; o.z=ring.c.z+Math.sin(a)*r; o.y=Y+.3; o.hd=Math.atan2(-Math.sin(a),Math.cos(a)); put(o); pose(o,'bar',T); seg.position.set(o.x,Y,o.z); seg.rotation.y=o.hd; if(R()<dt*.005) say(o, pick(['Tuần tra vườn táo, mọi thứ an toàn 👮','Chào bạn! Nhớ giữ vườn sạch nha.']), 2.6); }; }
  // bác sĩ trực thăng trên bãi đáp mái bệnh viện
  if(C.civic && C.civic.H){ const h=C.civic.H, o=person(sF(2901), {shirt:0xffffff, pants:0x3a7bd5, shoe:0xffffff}, '👩‍⚕️ Bác sĩ trực thăng cấp cứu', '#6fd3ff', 'cbd'); o.x=(h.x0+h.x1)/2-6+204.5+4; o.z=(h.z0+h.z1)/2+50; o.y=Y+h.h+.52; o.hd=-Math.PI/2;
    o.upd=(dt,T)=>{ put(o,false); if(((T*.2)%8)<3) o.po.apply('phone',T); if(R()<dt*.004) say(o, '🚁 Trực thăng cấp cứu sẵn sàng 24/7!', 2.8); }; }

  /* ============================== SÂN BAY ============================== */
  const cz=K.cz, hz=K.halfZ, G=K.GATES;
  const suitcase=(c)=>{ const m=new THREE.Mesh(mergeGeometries([new THREE.BoxGeometry(.42,.6,.24).translate(0,.4,0), new THREE.CylinderGeometry(.015,.015,.5,5).translate(0,.95,0), new THREE.BoxGeometry(.2,.03,.03).translate(0,1.2,0)]), std(c,{roughness:.4})); m.userData.dynamic=true; scene.add(m); return m; };
  function withCase(o, c){ o.case=suitcase(c); const u=o.upd; o.upd=(dt,T)=>{ const st=u(dt,T); const bx=o.x-Math.sin(o.hd)*.85-Math.cos(o.hd)*.42, bz=o.z-Math.cos(o.hd)*.85+Math.sin(o.hd)*.42;   /* vali kéo phía sau bên tay phải, không chạm chân */ o.case.position.set(bx,o.y,bz); o.case.rotation.set(st==='walk'?.25:0,o.hd,0); o.case.visible=o.a.g.visible; return st; }; return o; }
  const IN=[[K.layout.TERM.x1-6,cz],[150,cz-6],[146,cz+4],[127,cz],[112,cz+10],[G[3].x,G[3].z-8],[G[1].x,G[1].z-8],[K.FALL.x+22,cz-12]];
  // cơ trưởng + 2 tiếp viên (đi thành nhóm)
  { const crew=[[sM(3001),{shirt:0xf4f2ec, pants:0x16324f, shoe:0x111111, long:true, style:'cap'},'👨‍✈️ Cơ trưởng QC Airlines'],[sF(3002),{shirt:0x1d6ab8, pants:0x1d6ab8, shoe:0x111111, long:true},'💁‍♀️ Tiếp viên QC Airlines'],[sF(3003),{shirt:0x1d6ab8, pants:0x1d6ab8, shoe:0x111111, long:true},'💁‍♀️ Tiếp viên QC Airlines']];
    const route=[[K.layout.TERM.x1-8,cz],[127,cz],[G[4].x,G[4].z-6],[G[2].x,G[2].z-6],[127,cz+8],[150,cz+2]];
    crew.forEach(([seed,of,nm],i)=>{ const o=person(seed, of, nm, '#4fc3ff', 'sky'); walker(o, route.map(([x,z])=>[x-i*1.1, z+(i%2?1:-1)*i*.6]), 1.2, GY); withCase(o, i?0x16324f:0x1b1d22); const u=o.upd; o.upd=(dt,T)=>{ u(dt,T); if(i===0 && R()<dt*.004) say(o, pick(['Chuyến QC 102 đi Brain Skyport, cất cánh đúng giờ ✈️','Thời tiết đẹp, tầm nhìn 10 km!']), 2.8); }; o.wait=0; }); }
  // hành khách (6) kéo vali
  for(let i=0;i<(LOW?4:6);i++){ const pts=[]; for(let k=0;k<4;k++) pts.push(IN[(i*3+k*2)%IN.length]); const o=person(i%2?sF(3101+i):sM(3101+i), {shirt:[0xff6b6b,0x46d39a,0xffd23f,0x7a9cc6,0xff9fc4,0xffffff][i], pants:0x2a3a5a, shoe:0x1b1d21}, `🧳 Hành khách ${W.people.nameOf(3101+i)}`, '#ffd23f', 'sky');
    walker(o, pts, 1.1+R()*.3, GY); withCase(o, [0x2f6fd0,0xc8102e,0x46d39a,0xffc531,0x8a5a32,0x1b1d22][i]); }
  // nhân viên check-in (2) + an ninh (1)
  for(const [i,[x,z]] of [[138,251.9],[143.4,251.9]].entries()){ const o=person(sF(3201+i), {shirt:0x1d6ab8, pants:0x16324f, shoe:0x111111}, '🧳 Nhân viên check-in', '#4fc3ff', 'sky'); o.x=x; o.z=z+1; o.y=GY; o.hd=Math.PI; o.upd=(dt,T)=>{ put(o); if(((T*.3+o.ph)%6)<2) o.po.apply('present',T); if(R()<dt*.004) say(o, 'Xin chào! Cho mình xem hộ chiếu nha 😊', 2.4); }; }
  { const o=person(sM(3203), {shirt:0x2a2f3a, pants:0x2a2f3a, shoe:0x111111, style:'cap'}, '🛂 Nhân viên an ninh soi chiếu', '#9fb3c8', 'sky'); o.x=129.5; o.z=cz+2.2; o.y=GY; o.hd=-Math.PI/2; o.upd=(dt,T)=>{ put(o); if(((T*.25)%7)<2) o.po.apply('cross',T); if(R()<dt*.004) say(o, 'Mời anh chị bỏ điện thoại vào khay nhé!', 2.4); }; }
  // marshaller vẫy 2 gậy đèn LED trước mũi máy bay đậu số 3
  { const pl=K.PARK[2]; if(pl){ const o=person(sM(3301), {shirt:0xffd23f, pants:0x2a2f3a, shoe:0x111111, style:'cap'}, '🦺 Nhân viên điều hướng máy bay', '#ffb547', 'sky'); o.x=pl.position.x-26; o.z=pl.position.z; o.y=GY; o.hd=Math.PI/2;
      const wm=std(0xff7a1a,{emissive:0xff5a00, emissiveIntensity:1.4}); for(const side of ['Right','Left']){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.5,8).translate(0,.25,0), wm); attach(o, w, side); }
      o.upd=(dt,T)=>{ put(o); pose(o,'wands',T); }; } }
  // xe kéo hành lý + 3 toa (chạy vòng sân đỗ)
  { const tg=new THREE.Group(); const body=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.1,1.6), std(0xffc531,{metalness:.3})); body.position.y=.75; tg.add(body); const seat=new THREE.Mesh(new THREE.BoxGeometry(.6,.1,.6), std(0x222222)); seat.position.set(-.4,1.35,0); tg.add(seat);
    const carts=[]; for(let i=0;i<3;i++){ const c=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(2.4,.8,1.5), std(0xc9ced4,{metalness:.5})); b.position.y=.7; c.add(b); for(let k=0;k<3;k++){ const bag=new THREE.Mesh(new THREE.BoxGeometry(.5,.35,.35), std([0x2f6fd0,0xc8102e,0x46d39a][k])); bag.position.set(-.7+k*.7,1.28,0); c.add(bag); } c.userData.dynamic=true; scene.add(c); carts.push(c); }
    tg.userData.dynamic=true; scene.add(tg); const drv=person(sM(3401), {shirt:0xffd23f, pants:0x2a2f3a, shoe:0x111111}, '🚜 Lái xe kéo hành lý', '#ffb547', 'sky');
    const x0=K.layout.TERM.x0+10, x1=K.layout.TERM.x1+2, zz=324; let s=0, hist=[];
    drv.upd=(dt,T)=>{ s+=dt*4; const L=(x1-x0)*2, u=s%L, fwd=u<(x1-x0), x=fwd?x0+u:x1-(u-(x1-x0)), hd=fwd?Math.PI/2:-Math.PI/2; tg.position.set(x,GY,zz); tg.rotation.y=hd-Math.PI/2; hist.unshift([x,hd]); if(hist.length>60) hist.length=60;
      carts.forEach((c,i)=>{ const h=hist[Math.min(hist.length-1,(i+1)*12)]; c.position.set(h[0],GY,zz); c.rotation.y=h[1]-Math.PI/2; c.visible=drv.a.g.visible; }); tg.visible=drv.a.g.visible;
      drv.x=x-Math.sin(hd)*.4; drv.z=zz; drv.y=GY+1.4-drv.hips; drv.hd=hd; put(drv,false); pose(drv,'sit',T); pose(drv,'bar',T); }; }

  /* ============================== KHUNG HÌNH: ẩn/hiện theo khoảng cách ============================== */
  const FAR=(LOW?60:85)**2, ZB={cbd:{x0:180,x1:580,z0:-120,z1:460}, sky:{x0:-250,x1:181,z0:180,z1:380}}; let tick=0; const awake={cbd:false, sky:false};
  for(const o of NPC){ o.a.g.visible=false; }
  for(const G2 of GOND) G2.g.visible=false; for(const k of KAY){ k.boat.visible=false; k.pad.visible=false; }
  HOOK.onFrame.push((dt,T)=>{ dt=Math.min(dt,.1); tick-=dt;
    if(tick<=0){ tick=.5; for(const z of ['cbd','sky']){ const Z=ZB[z]; const d=W.inside?1e9:Math.hypot(Math.max(Z.x0-P.x,0,P.x-Z.x1), Math.max(Z.z0-P.z,0,P.z-Z.z1)); awake[z]=d<120; }
      const c=W.camera.position; for(const o of NPC){ const v=awake[o.zone] && ((o.a.g.position.x-c.x)**2+(o.a.g.position.z-c.z)**2<FAR || (o.x-c.x)**2+(o.z-c.z)**2<FAR); if(o.a.g.visible!==v){ o.a.g.visible=v; if(!v){ o.col.x=1e9; if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } } } }
      for(const G2 of GOND) G2.g.visible=awake.cbd; for(const k of KAY){ k.boat.visible=awake.cbd; k.pad.visible=awake.cbd; } }
    for(const G2 of GOND){ if(!awake.cbd) break; const k=(Math.sin(T*.05+G2.ph)+1)/2, y=G2.y0+(G2.y1-G2.y0)*k; G2.g.position.set(G2.t.x,y,G2.z); G2.cab.scale.y=Math.max(.1,G2.t.h+Y-y); G2.cab.position.set(0,(G2.t.h+Y-y)/2,0); }
    for(const o of NPC){ if(!awake[o.zone]) continue; if(o.bubble){ o.bubbleT-=dt; if(o.bubbleT<=0){ removeLabel(o.bubble); o.bubble=null; } }
      if(o.a.g.visible) o.a.mixer.update(dt); if(o.upd) o.upd(dt,T); } });   /* hoạt hình trước, tư thế ghi đè sau */
  const out={npc:NPC.length, cbd:NPC.filter(o=>o.zone==='cbd').length, sky:NPC.filter(o=>o.zone==='sky').length, gondolas:GOND.length, kayaks:KAY.length};
  Object.defineProperty(out,'list',{value:NPC, enumerable:false}); console.info('[Bot CBD + Sân bay]', out); return out;
}
