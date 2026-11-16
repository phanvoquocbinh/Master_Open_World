// QC World V2 – PHA 9 (phần Abyssal): BOT CHO ĐẢO HẺM NÚI ABYSSAL (phiên S19g, 16/11/2026 – Bình: "khu này sao không thấy BOT nào")
//  🌀 Ốc đảo Master Dashboard: khách chụp ảnh cổng năng lượng + khách dạo vòng ốc đảo
//  🖥️ 8 đảo công cụ: mỗi đảo 1 khách đứng xem màn hình (đứng lệch sang bên, chừa chỗ bấm E)
//  🛍️ Phố shophouse chân vách: chủ quán đứng cạnh cửa mời khách + khách ngắm tủ kính · người dạo đường ven hồ
//  🎶 QC Live Stage: ca sĩ trên sân khấu nhạc nước + khán giả ngồi khán đài đá
//  🛶 2 người chèo kayak ở 2 vịnh phía Nam (không băng qua cầu kính – cầu chỉ cao hơn mặt nước 0,1 m)
//  🛣️ vành đai +2: người đi bộ / chạy bộ sát mép trong · 💂 bảo vệ đứng cạnh trụ 3 cổng G1 · G2 · G3
// Chỗ đứng và đường đi được KIỂM NGAY LÚC NẠP bằng chính va chạm + mặt đi của game (W.resolve, W.groundAtY):
//  điểm nào nằm trong vật cản / lệch mặt đi → dò chỗ lân cận; đoạn nào vướng lan can → cắt tuyến, bot đi tới lui trên đoạn thông.
// Hiệu năng: chỉ hiện tối đa 16 bot gần camera nhất trong vòng 75 m (máy yếu 10 bot / 55 m); bot ẩn không chạy hoạt hình.
import { makePoser } from './pose.js';

export async function make(W, A){
  const {THREE, scene, circles, HOOK, P, makeActor, makeLabel, removeLabel, lerpAngle, mergeGeometries} = W;
  if(!W.people || !makeActor || !A || !W.resolve || !W.groundAtY) return null;
  const LOW=W.QUAL==='low', TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, V3=THREE.Vector3;
  const R=(s=>()=>{ s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; })(180716), pick=a=>a[Math.floor(R()*a.length)];
  const FY=A.FY, LY=A.LY, GY=2, OC=A.OC||[0,-10], el=A.el;
  const NPC=[], sM=s=>W.people.pickSeed(L=>!L.female,s), sF=s=>W.people.pickSeed(L=>L.female,s), nm=s=>(W.people.nameOf ? W.people.nameOf(s) : 'Khách');
  const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.5}, o));

  /* ---------- kiểm chỗ đứng / đường đi bằng va chạm thật của game ---------- */
  const blocked=(x,z,y,r)=>{ const p={x,z,y}; try{ W.resolve(p,r,false); }catch(e){ return true; } return Math.hypot(p.x-x,p.z-z)>.03; };
  const okPt=(x,z,y,r=.45)=>Math.abs(W.groundAtY(x,z,y+.3)-y)<.3 && !blocked(x,z,y,r);
  /* chừa lối: không đứng / dừng nghỉ trên trục cầu (≥ 2,5 m), trước cửa thang máy (≥ 5,5 m), trên điểm bấm E (≥ 1,5 m) */
  const AX=[]; for(const p of (W.plats||[])){ if(p.t!=='r' || Math.abs(p.h-FY)>.06 || p.hw<1.4 || p.hw>3.2 || p.hd<3) continue; const e=p.hd+10; AX.push([p.x-p.s*e, p.z-p.c*e, p.x+p.s*e, p.z+p.c*e]); }   /* tấm sàn cầu (dọc theo trục hd) nối dài 10 m vào đảo / bờ */
  for(const S of (A.SAT||[])) AX.push([OC[0], OC[1], OC[0]+Math.cos(S.a)*27, OC[1]+Math.sin(S.a)*27]);   /* 8 lối từ tâm ốc đảo ra 8 cầu */
  const LIFT=(A.LIFTS||[]).filter(L=>L && typeof L.cx==='number').map(L=>[L.cx, L.cz]), INT=(W.INTER||[]).filter(i=>i && typeof i.x==='number' && Math.abs(i.x)<190 && Math.abs(i.z)<190).map(i=>[i.x, i.z]);
  const segD=(x,z,q)=>{ const ex=q[2]-q[0], ez=q[3]-q[1], L2=ex*ex+ez*ez||1e-9, t=clamp(((x-q[0])*ex+(z-q[1])*ez)/L2,0,1); return Math.hypot(x-q[0]-ex*t, z-q[1]-ez*t); };
  const clearOf=(x,z)=>AX.every(q=>segD(x,z,q)>=2.5) && LIFT.every(([lx,lz])=>Math.hypot(x-lx,z-lz)>=5.5) && INT.every(([ix,iz])=>Math.hypot(x-ix,z-iz)>=1.5);
  function findSpot(x,z,y,r=.45){ const ok=(X,Z)=>okPt(X,Z,y,r) && clearOf(X,Z); if(ok(x,z)) return [x,z]; for(const d of [.35,.7,1.05,1.4,1.8,2.3,2.9]) for(let k=0;k<12;k++){ const a=k/12*TAU, X=x+Math.cos(a)*d, Z=z+Math.sin(a)*d; if(ok(X,Z)) return [X,Z]; } return null; }
  function okSeg(a,b,y){ const L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.ceil(L/.35)); let py=y;
    for(let i=1;i<=n;i++){ const x=a[0]+(b[0]-a[0])*i/n, z=a[1]+(b[1]-a[1])*i/n, g=W.groundAtY(x,z,py+.3); if(Math.abs(g-py)>.35 || blocked(x,z,g,.35)) return false; py=g; } return true; }
  // tách tuyến ứng viên thành các đoạn thông (điểm hợp lệ + đoạn nối không vướng); vòng kín thì nối đầu-cuối
  function runs(pts, y, closed){ const n=pts.length, Y=pts.map(p=>W.groundAtY(p[0],p[1],y+.3)), okP=pts.map((p,i)=>Math.abs(Y[i]-y)<1.5 && okPt(p[0],p[1],Y[i],.4)),
      okS=pts.map((p,i)=>(i<n-1 || closed) && okP[i] && okP[(i+1)%n] && okSeg(p,pts[(i+1)%n],Y[i]));
    if(closed && okS.every(Boolean)) return [{pts, loop:true}]; const out=[]; let cur=null;
    const start=closed ? Math.max(0, okS.findIndex(v=>!v)+1) : 0; for(let k=0;k<n+(closed?1:0);k++){ const i=(start+k)%n; if(!cur){ if(okP[i]) cur=[pts[i]]; } else cur.push(pts[i]); if(!okS[i] || (!closed && i===n-1)){ if(cur && cur.length>2) out.push({pts:cur, loop:false}); cur=null; } }
    return out.sort((a,b)=>b.pts.length-a.pts.length); }

  /* ---------- nhân vật ---------- */
  function person(seed, outfit, name, dot, h){ const k=W.people.kit(seed,{outfit, h}); const a=makeActor(k.gl,{name, height:k.h, face:0, clips:k.clips, compact:false, dot:dot||'#7fe0ff'});
    if(k.look && k.look.width){ a.root.scale.x*=k.look.width; a.root.scale.z*=k.look.width; } if(LOW) a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
    a.g.position.set(0,-200,0); a.g.visible=false; a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a), anchor=new THREE.Object3D(); anchor.position.y=k.h+.75; a.g.add(anchor);
    const o={a, po, h:k.h, hips:po.hipsHeight(), anchor, x:0, y:FY, z:0, hd:0, bubble:null, bubbleT:0, col:{x:1e9, z:1e9, r:.3, owner:true}, upd:null, lines:null, ph:R()*9}; circles.push(o.col); NPC.push(o); return o; }
  const say=(o,t,sec=3)=>{ if(o.bubble) removeLabel(o.bubble); o.bubble=makeLabel(t, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:30}); o.bubbleT=sec; };
  const put=(o,col=true)=>{ o.a.g.position.set(o.x,o.y+(o.lift||0),o.z); o.a.g.rotation.set(0,o.hd,0); if(col && o.a.g.visible){ o.col.x=o.x; o.col.z=o.z; } else o.col.x=1e9; };
  const stand=(o,x,z,hd,y)=>{ o.x=x; o.z=z; o.hd=hd; o.y=y; o.upd=o.upd||(()=>put(o)); return o; };
  const face=(x,z,tx,tz)=>Math.atan2(tx-x,tz-z);
  const _v=new V3(), _pa=new V3(), _pb=new V3(), _pd=new V3(), _qa=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _F=new V3(), _R=new V3(), _U=new V3(0,1,0);
  function aim(bn,n,c,f,u,r){ const B=bn[n], Cc=bn[c]; if(!B||!Cc) return; B.getWorldPosition(_pa); Cc.getWorldPosition(_pb); _pb.sub(_pa).normalize(); _pd.set(0,0,0).addScaledVector(_F,f).addScaledVector(_U,u).addScaledVector(_R,r).normalize(); _qa.setFromUnitVectors(_pb,_pd); B.getWorldQuaternion(_wq); B.parent.getWorldQuaternion(_pq); _wq.premultiply(_qa); B.quaternion.copy(_pq.invert().multiply(_wq)); B.updateMatrixWorld(true); }
  function arms(o, kind, t=0){ const bn=o.po.bones; if(!bn || !bn.Hips || !o.a.g.visible) return; o.a.g.updateMatrixWorld(true); o.a.g.getWorldDirection(_F); _F.y=0; _F.normalize(); _R.set(-_F.z,0,_F.x); const LR=[['Left',-1],['Right',1]];
    if(kind==='camera'){ for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.75,.15,k*.35); aim(bn,s+'ForeArm',s+'Hand',.55,.75,-k*.35); } aim(bn,'Neck','Head',1,.15,0); }
    else if(kind==='paddle'){ const e=Math.sin(t*2.4); for(const [s,k] of LR){ const w=k>0?e:-e; aim(bn,s+'Arm',s+'ForeArm',.85,.05+w*.3,k*.3); aim(bn,s+'ForeArm',s+'Hand',.9,.1+w*.25,-k*.35); } }
    else if(kind==='clap'){ const e=Math.abs(Math.sin(t*7)); for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.7,-.5,k*.25); aim(bn,s+'ForeArm',s+'Hand',.6,.45,-k*(.55+e*.35)); } }
    else if(kind==='wave'){ const e=Math.sin(t*5); aim(bn,'RightArm','RightForeArm',.15,.75,.6); aim(bn,'RightForeArm','RightHand',.1,1,.25+e*.35); }
    else if(kind==='behind'){ for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',-.35,-1,k*.12); aim(bn,s+'ForeArm',s+'Hand',-.7,-.25,-k*.6); } } }
  // chân người ngồi: đùi gần nằm ngang, cẳng chân thả vừa chạm sàn floorY (floorY=null → duỗi thẳng ra trước, như ngồi trong kayak)
  function legs(o, floorY){ const bn=o.po.bones; if(!bn || !bn.LeftUpLeg || !o.a.g.visible) return; o.a.g.updateMatrixWorld(true); o.a.g.getWorldDirection(_F); _F.y=0; _F.normalize(); _R.set(-_F.z,0,_F.x);
    for(const [s,k] of [['Left',-1],['Right',1]]){ const LG=bn[s+'Leg'], FT=bn[s+'Foot']; if(!LG || !FT) continue; aim(bn,s+'UpLeg',s+'Leg',1,floorY==null?-.02:.03,k*.07);
      if(floorY==null){ aim(bn,s+'Leg',s+'Foot',1,-.04,k*.03); aim(bn,s+'Foot',s+'ToeBase',.8,.6,0); continue; }   /* trong kayak: chân duỗi gần ngang, nằm gọn dưới mặt boong (thân thuyền cao .34) và trên mặt nước */
      LG.getWorldPosition(_pa); FT.getWorldPosition(_pb); const L2=_pa.distanceTo(_pb), drop=Math.min(L2*.98, Math.max(.05, _pa.y-(floorY+.09))), fw=Math.sqrt(Math.max(0,L2*L2-drop*drop));
      aim(bn,s+'Leg',s+'Foot',fw,-drop,0); aim(bn,s+'Foot',s+'ToeBase',1,-.5,0); } }
  function attach(o, mesh, side='Right'){ let h=null; o.a.g.traverse(b=>{ if(b.isBone && !h && new RegExp(side+'Hand$').test(b.name)) h=b; }); if(!h) return null; o.a.g.updateMatrixWorld(true); h.getWorldScale(_v); mesh.scale.multiplyScalar(1/(_v.x||1)); h.add(mesh); return mesh; }
  // đi theo tuyến: vòng kín thì đi vòng, đoạn hở thì đi tới lui; y bám mặt đi thật (theo độ cao chân hiện tại)
  function walker(o, run, sp, wait=.12){ const pts=run.pts; Object.assign(o,{pts, loop:run.loop, wi:1+Math.floor(R()*(pts.length-1)), dir:1, sp, wait:0}); const s=pts[o.wi-1]; o.x=s[0]; o.z=s[1]; o.y=W.groundAtY(o.x,o.z,o.y+.3); if(clearOf(o.x,o.z)) o.wait=R()*3;
    o.upd=dt=>{ if(o.wait>0){ o.wait-=dt; o.a.play('idle'); put(o); return; }
      const [tx,tz]=o.pts[o.wi], dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz);
      if(d<.2){ if(o.loop) o.wi=(o.wi+1)%o.pts.length; else { if(o.wi+o.dir<0 || o.wi+o.dir>=o.pts.length) o.dir*=-1; o.wi+=o.dir; } if(R()<wait && clearOf(o.x,o.z)) o.wait=1.5+R()*4; return; }   /* chỉ dừng nghỉ ở chỗ không chắn lối */
      const k=Math.min(d,o.sp*dt); o.x+=dx/d*k; o.z+=dz/d*k; o.y=W.groundAtY(o.x,o.z,o.y+.3); o.hd=lerpAngle(o.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*8));
      const run=o.sp>2.2, ac=o.a.acts && o.a.acts[run?'run':'walk']; o.a.play(run?'run':'walk'); if(ac) ac.timeScale=clamp(o.sp/(run?3.4:1.35),.6,1.15); put(o); }; return o; }
  const SHIRT=[0x2f6fd0,0xe0593c,0x2bb673,0xf2b632,0x8e5bd6,0xf4f2ec,0x1f2a3a,0xe86aa6,0x15a5b8,0x9a6b3f], PANT=[0x22262e,0x3a4a66,0x5a4a3a,0x2f3d2a,0x6b6f78];
  const casual=()=>({shirt:pick(SHIRT), pants:pick(PANT), shoe:pick([0x1b1d21,0xf4f4f4,0x7a4a2a])});
  const any=()=>{ const salt=1000+Math.floor(R()*90000); return R()<.5 ? sM(salt) : sF(salt); };   /* muối ngẫu nhiên (cố định theo hạt) → tên + dáng người không lặp */

  /* ============================== 🌀 ỐC ĐẢO MASTER DASHBOARD ============================== */
  { const GN=Math.PI*.625, sp=findSpot(OC[0]+Math.cos(GN)*8, OC[1]+Math.sin(GN)*8, FY); if(sp){ const s=any(), o=person(s, casual(), `📸 ${nm(s)} · khách ốc đảo`); stand(o, sp[0], sp[1], face(sp[0],sp[1],OC[0],OC[1]), FY);
      const ph=new THREE.Mesh(new THREE.BoxGeometry(.08,.15,.012), std(0x15181d,{roughness:.3})); ph.userData.noRay=true; attach(o, ph); o.lines=['Cổng năng lượng 12 m đẹp quá! 📸','Chụp kiểu nữa cho đủ góc 😄','Ốc đảo Master Dashboard đây rồi!'];
      o.upd=(dt,T)=>{ put(o); arms(o,'camera',T); }; } }
  { const ring=Array.from({length:28},(_,i)=>{ const a=i/28*TAU; return [OC[0]+Math.cos(a)*15.5, OC[1]+Math.sin(a)*15.5]; }), rs=runs(ring, FY, true);
    for(let i=0;i<2 && rs.length;i++){ const s=any(), o=person(s, casual(), `🚶 ${nm(s)} · dạo ốc đảo`); walker(o, rs[i%rs.length], .9+R()*.3); } }

  /* ============================== 🖥️ 8 ĐẢO CÔNG CỤ – khách xem màn hình ============================== */
  { const MON=(W.screens && W.screens.monitors) || []; const VIEW=['Số liệu hôm nay ổn đấy 📊','Test pass hết rồi, ngon! ✅','Biểu đồ này cập nhật trực tiếp à?','Để xem bug nào còn mở… 🐞','Dashboard nhìn rõ ghê!'];
    (A.SAT||[]).forEach((S,i)=>{ const m=MON[i]; let mx, mz, rot;
      if(m && m.g && Math.abs(m.g.position.y-FY)<1.5 && Math.hypot(m.x-S.x,m.z-S.z)<9){ mx=m.x; mz=m.z; rot=m.rot; } else { mx=S.x+Math.cos(S.a+1.2)*5.2; mz=S.z+Math.sin(S.a+1.2)*5.2; rot=Math.atan2(S.x-mx,S.z-mz); }
      const nx=Math.sin(rot), nz=Math.cos(rot), side=i%2?1:-1, x=mx+nx*2.4+nz*1.3*side, z=mz+nz*2.4-nx*1.3*side, sp=findSpot(x,z,FY,.4); if(!sp) return;   /* đứng lệch sang bên điểm bấm E trước màn hình */
      const s=any(), o=person(s, casual(), `🖥️ ${nm(s)} · xem ${S.zone ? S.zone.name : 'màn hình'}`); stand(o, sp[0], sp[1], face(sp[0],sp[1],mx,mz), FY); o.lines=VIEW;
      const k=i%3; o.upd=(dt,T)=>{ put(o); if(o.a.g.visible){ if(k===0) o.po.apply('cross',T); else if(k===1) arms(o,'behind',T); else o.po.apply('phone',T); } }; }); }

  /* ============================== 🛍️ PHỐ SHOPHOUSE CHÂN VÁCH ============================== */
  const SA=[6,10,14,18,22,26,30,34,38,42,60,64], DEG=Math.PI/180;
  const shop=i=>{ const row=i<12?0:1, k=i%12, f=(row?180-SA[k]:SA[k])*DEG, c=el(f,.945), fr=el(f,.898), il=Math.hypot(fr[0]-c[0],fr[1]-c[1]), inx=(fr[0]-c[0])/il, inz=(fr[1]-c[1])/il; return {c, inx, inz, ux:-inz, uz:inx}; };
  { const OWN=[[1,'👟 chủ tiệm Sneaker Tăng Tốc'],[6,'🍜 chủ quán Phở Regression'],[8,'☕ barista Specialty Coffee'],[13,'🖥️ chủ Cyber Cafe 240Hz'],[18,'🥤 chủ Trà Sữa Pipeline'],[21,'🌸 chủ Tiệm Hoa Song Nguyệt']];
    const INV=['Mời anh chị ghé xem ạ! 😊','Hôm nay giảm giá cho khách QA nè!','Vào uống ly nước nghỉ chân đi ạ ☕','Hàng mới về, xem thử đi bạn ơi!'];
    OWN.forEach(([i,title],j)=>{ const S=shop(i), side=i%2?1:-1, x=S.c[0]+S.inx*4.0+S.ux*3.0*side, z=S.c[1]+S.inz*4.0+S.uz*3.0*side, sp=findSpot(x,z,FY,.4); if(!sp) return;
      const s=i%2?sF(7300+i):sM(7300+i), o=person(s, {shirt:[0xf4f2ec,0x2f6fd0,0x6b3e26,0x1f2a3a,0xe86aa6,0x2bb673][j], pants:0x22262e, shoe:0x1b1d21}, `${title} · ${nm(s)}`, '#ffd23f');
      stand(o, sp[0], sp[1], Math.atan2(S.inx,S.inz), FY); o.lines=INV; o.upd=(dt,T)=>{ put(o); if(o.a.g.visible){ if(Math.sin(T*.35+o.ph)>.55) arms(o,'wave',T); else o.po.apply('cross',T); } }; });
    for(const i of [3,16]){ const S=shop(i), x=S.c[0]+S.inx*4.6-S.ux*2.2, z=S.c[1]+S.inz*4.6-S.uz*2.2, sp=findSpot(x,z,FY,.4); if(!sp) continue;   /* khách ngắm tủ kính – sát mặt tiền, không đứng giữa lối */
      const s=any(), o=person(s, casual(), `🛍️ ${nm(s)} · khách phố shophouse`); stand(o, sp[0], sp[1], Math.atan2(-S.inx,-S.inz), FY); o.upd=(dt,T)=>{ put(o); if(o.a.g.visible && Math.sin(T*.5+o.ph)>0) o.po.apply('phone',T); }; } }
  // đường dạo ven hồ (giữa lan can mép hồ và mặt tiền shophouse): kiểm từng đoạn, bot đi trên các đoạn thông
  { const ring=Array.from({length:180},(_,i)=>el(i/180*TAU,.872)), rs=runs(ring, FY, true);
    for(let i=0;i<5 && rs.length;i++){ const s=any(), o=person(s, casual(), `🚶 ${nm(s)} · dạo ven hồ`); walker(o, rs[i%Math.min(rs.length,3)], .95+R()*.35); } }

  /* ============================== 🎶 QC LIVE STAGE: ca sĩ + khán giả ngồi khán đài đá ============================== */
  const ST=A.ST; if(ST){ const SX=ST.x, SZ=ST.z+6;
    { const o=person(sF(7501), {shirt:0xff4fa3, pants:0x1b1d21, shoe:0xf4f4f4}, '🎤 Ca sĩ QC Live Stage', '#ff8ad8'); stand(o, SX, SZ-1.2, Math.PI, FY+.8); o.lines=['🎶 La la la… cảm ơn mọi người!','Bài tiếp theo tên là "Zero Bug" 🎤','Cùng vỗ tay nào cả nhà! 👏'];
      o.upd=(dt,T)=>{ put(o,false); if(o.a.g.visible){ if(Math.sin(T*.5)>.2) arms(o,'wave',T); else o.po.apply('present',T); } }; }
    // khán đài: arcSlab bậc k bán kính 9+2,4k → 11,4+2,4k, góc .15π→.85π, quay 180° quanh tâm sân khấu; mặt bậc cao .45(k+1)
    [[0,.36],[0,.5],[0,.64],[1,.43],[1,.58]].forEach(([k,u])=>{ const a=Math.PI*u, r=9+2.4*k+.28, x=ST.x-Math.cos(a)*r, z=ST.z-Math.sin(a)*r, top=FY+.45*(k+1); if(blocked(x,z,top,.3)) return;
      const s=any(), o=person(s, casual(), `👏 ${nm(s)} · khán giả`); stand(o, x, z, face(x,z,SX,SZ), top+.13-o.hips);   /* ngồi mép bậc, chân thả chạm bậc dưới (thấp hơn .45) */
      o.upd=(dt,T)=>{ put(o,false); if(o.a.g.visible){ o.po.apply('sit',T); legs(o, top-.45); if(Math.sin(T*.6+o.ph*3)>.7) arms(o,'clap',T); } }; }); }

  /* ============================== 🛶 KAYAK Ở 2 VỊNH PHÍA NAM ============================== */
  const KAY=[]; { const hullG=mergeGeometries([new THREE.SphereGeometry(1,14,8).scale(.44,.34,2.0), new THREE.CylinderGeometry(.32,.32,.08,12).translate(0,.32,-.1)]), paddleG=mergeGeometries([new THREE.CylinderGeometry(.025,.025,2.2,6).rotateZ(Math.PI/2), new THREE.BoxGeometry(.04,.32,.18).translate(1.12,0,0), new THREE.BoxGeometry(.04,.32,.18).translate(-1.12,0,0)]);
    const hullM=[std(0xff8a20,{roughness:.4}), std(0x23b0e0,{roughness:.4})], padM=std(0x2b2f36,{roughness:.6});
    const water=(x,z)=>{ for(const [dx,dz] of [[0,0],[2.4,0],[-2.4,0],[0,2.6],[0,-2.6],[1.7,1.7],[-1.7,1.7],[1.7,-1.7],[-1.7,-1.7]]){ if(W.groundAtY(x+dx,z+dz,LY+.6)>LY-1) return false; } return true; };
    [[-30,70],[30,70]].forEach(([cx,cz],j)=>{ let rx=16, rz=12, pts=null; for(let t=0;t<5 && !pts;t++,rx*=.82,rz*=.82){ const c=Array.from({length:36},(_,i)=>{ const a=i/36*TAU; return [cx+Math.cos(a)*rx, cz+Math.sin(a)*rz]; }); if(c.every(p=>water(p[0],p[1]))) pts=c; } if(!pts) return;
      const g=new THREE.Group(), hull=new THREE.Mesh(hullG, hullM[j]), pad=new THREE.Mesh(paddleG, padM); hull.userData.noRay=pad.userData.noRay=true; pad.position.set(0,.7,.42); g.add(hull, pad); g.visible=false; g.userData.dynamic=true; scene.add(g);
      const s=j?sF(7601):sM(7602), o=person(s, {shirt:[0xffd23f,0xff6b3d][j], pants:0x22262e, shoe:0x1b1d21}, `🛶 ${nm(s)} · chèo kayak`); o.kayak=g; let ph=R()*TAU; const sp=.07*(j?-1:1);
      o.upd=(dt,T)=>{ ph+=sp*dt; const x=cx+Math.cos(ph)*rx, z=cz+Math.sin(ph)*rz, tx=-Math.sin(ph)*rx*Math.sign(sp), tz=Math.cos(ph)*rz*Math.sign(sp), bob=Math.sin(T*1.7+j)*.03;
        o.x=x; o.z=z; o.hd=Math.atan2(tx,tz); o.y=LY+.26+bob-o.hips; g.position.set(x,LY+.05+bob,z); g.rotation.set(Math.sin(T*1.3)*.03,o.hd,Math.sin(T*2.4)*.05); pad.rotation.z=Math.sin(T*2.4)*.55; put(o,false);
        if(o.a.g.visible){ o.po.apply('car',T); legs(o, null); arms(o,'paddle',T); } }; KAY.push(o); }); }

  /* ============================== 🛣️ VÀNH ĐAI +2 + 💂 BẢO VỆ 3 CỔNG ============================== */
  { const C=171, sq=[]; for(const [a,b] of [[[C,-C],[C,C]],[[C,C],[-C,C]],[[-C,C],[-C,-C]],[[-C,-C],[C,-C]]]){ const L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.ceil(L/6); for(let i=0;i<n;i++) sq.push([a[0]+(b[0]-a[0])*i/n, a[1]+(b[1]-a[1])*i/n]); }
    const rs=runs(sq, GY, true); for(let i=0;i<3 && rs.length;i++){ const s=any(), jog=i===0, o=person(s, jog?{shirt:0xff6b3d, pants:0x22262e, shoe:0xf4f4f4}:casual(), jog?`🏃 ${nm(s)} · chạy bộ vành đai`:`🚶 ${nm(s)} · đi bộ vành đai`); o.y=GY; walker(o, rs[i%rs.length], jog?2.7:1.15, jog?.02:.08); o.lift=.03; } }   /* mặt nhựa vành đai vẽ cao hơn mặt đi 3 cm */
  { const G=A.GATES||{}; const SPOT={G1:[[179.0,6.6],-Math.PI/2], G2:[[6.6,179.0],Math.PI], G3:[[-179.0,-22.6],Math.PI/2]};
    for(const [k,[[x,z],hd]] of Object.entries(SPOT)){ const g=G[k]; if(!g) continue; const y=g[2]??GY, sp=findSpot(x,z,y,.4); if(!sp) continue;
      const o=person(sM(7700+k.charCodeAt(1)), {shirt:0x1f2a3a, pants:0x1f2a3a, shoe:0x111111, style:'cap'}, `💂 Bảo vệ cổng ${k}`, '#ffd23f'); stand(o, sp[0], sp[1], hd, W.groundAtY(sp[0],sp[1],y+.3)); o.lines=['Chào mừng tới Abyssal Canyon! 👋','Đi thẳng là tới tháp đường xoắn ốc xuống đáy vực.','Nhớ đi đúng lối có lan can nhé!'];
      o.upd=(dt,T)=>{ put(o); if(o.a.g.visible) arms(o,'behind',T); }; } }

  /* ============================== KHUNG HÌNH: chỉ hiện bot gần camera nhất ============================== */
  const FAR=LOW?55:75, MAXV=LOW?10:16; let tick=0; const vis=new Set();
  HOOK.onFrame.push((dt,T)=>{ dt=Math.min(dt,.1); tick-=dt; const c=W.camera.position, near=!W.inside && Math.hypot(P.x,P.z)<260;
    if(tick<=0){ tick=.4; vis.clear(); if(near){ const L=[]; for(const o of NPC){ const d=Math.hypot(o.x-c.x,o.y+1-c.y,o.z-c.z); if(d<FAR) L.push([d,o]); } L.sort((a,b)=>a[0]-b[0]); for(let i=0;i<Math.min(MAXV,L.length);i++) vis.add(L[i][1]); }
      for(const o of NPC){ const v=vis.has(o); if(o.a.g.visible!==v){ o.a.g.visible=v; if(o.kayak) o.kayak.visible=v; if(!v){ o.col.x=1e9; if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } } } } }
    if(!near) return;
    for(const o of NPC){ if(o.bubble){ o.bubbleT-=dt; if(o.bubbleT<=0){ removeLabel(o.bubble); o.bubble=null; } } if(o.a.g.visible) o.a.mixer.update(dt); if(o.upd) o.upd(dt,T);   /* hoạt hình trước, tư thế (ngồi, giơ máy ảnh…) đè lên sau */
      if(o.a.g.visible){
        if(o.lines && !o.bubble && Math.hypot(o.x-P.x,o.z-P.z)<5 && Math.abs(o.y-P.y)<3 && R()<dt*.25) say(o, pick(o.lines), 3); } } });
  const out={npc:NPC.length, kayak:KAY.length}; Object.defineProperty(out,'list',{value:NPC, enumerable:false}); console.info('[Bot Abyssal]', out); return out;
}
