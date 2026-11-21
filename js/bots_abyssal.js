// QC World V2 – BOT ĐẢO ABYSSAL sau đợt nâng cấp vịnh (phiên E · abyss-life, 17/11/2026 – đặc tả Bình Phần 9 + 10). Bản cũ (đáy vực −29): _backup/bots_abyssal.backup_20261117_E.js
// 6 CHU TRÌNH SỐNG (máy trạng thái):
//  1. 🏙️ Cư dân Abyssal Horizon Residences: sinh hoạt trong căn hộ / ra ban công → đi thang máy xuống sảnh → ra bãi cát vàng tắm nắng → quay về căn hộ.
//  2. 🎓 Học viên + giảng viên QA · QC · QE Academy: nghe giảng trong lớp (giảng viên thuyết trình) → giải lao ở phòng bida / pantry → quay lại lớp.
//  3. 🚗 Xe gia đình: mỗi 25–40 s (khi người chơi ở gần) 1 xe dân sự chạy từ thành phố (W.traffic.spawnVehicle + W.roadNet) tới bãi đỗ biển → bật xi-nhan,
//     vào đúng ô → 2–4 người bước ra → xuống cầu thang ra quầy dừa trên bãi cát uống nước 60–90 s → quay lại xe → lùi ra, chạy đi.
//  4. 🏖️ Khách bãi biển: xuống cầu thang → dạo cát → nằm ghế tắm nắng 45 s (chiếm ghế thật, người chơi không ngồi chồng) → rời đi khu khác.
//  5. 🛍️ Khách mua sắm 16 shophouse (phiên D): vào cửa → xem hàng 10–15 s → trả tiền ở quầy → cầm túi giấy bước ra → sang tiệm khác.
//  6. 🛥️ Khách du thuyền: xếp hàng ở Bến Siêu Du Thuyền → lên tàu khi tàu cập (W.abySea) · trên tàu: khách vỗ tay khi qua quần đảo đá vôi, trò chuyện với người chơi.
//  + Giữ: khách xem 9 màn hình ở pavilion, người đi / chạy bộ vành đai +2, bảo vệ 3 cổng G1 · G2 · G3. Bỏ: bot ở đáy vực cũ (ốc đảo, hồ, sân khấu cũ, kayak cũ).
//  + Nạp js/dining.js (phục vụ bàn góc nhìn thứ nhất) và đăng ký cafe + nhà hàng (phiên D), Sky Lounge khách sạn (phiên C), quầy dừa bãi biển (phiên A).
// Chỗ đứng / đường đi được KIỂM LÚC CHẠY bằng va chạm + mặt đi thật (W.resolve, W.groundAtY): đoạn không đi thẳng được → bot ẩn 1–2 s rồi hiện ở đầu kia (không đi xuyên tường).
// Hiệu năng: chỉ hiện tối đa 18 bot gần camera nhất trong 80 m (máy yếu 10 bot / 55 m); bot ẩn vẫn chạy máy trạng thái nhưng không chạy hoạt hình.
import { makePoser } from './pose.js';

export async function make(W, A){
  const {THREE, scene, circles, HOOK, P, makeActor, makeLabel, removeLabel, lerpAngle} = W;
  if(!W.people || !makeActor || !W.resolve || !W.groundAtY) return null;
  const LOW=W.QUAL==='low', TAU=Math.PI*2, D2R=Math.PI/180, clamp=(v,a,b)=>v<a?a:v>b?b:v, V3=THREE.Vector3, ABY=W.ABY||{}, WY=ABY.waterY ?? W.WATER_Y ?? -.35;
  const R=(s=>()=>{ s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; })(171117), pick=a=>a[Math.floor(R()*a.length)], rr=(a,b)=>a+R()*(b-a);
  const el=(fdeg,rho)=>ABY.el ? ABY.el(fdeg*D2R,rho) : [146*rho*Math.cos(fdeg*D2R), -15+130*rho*Math.sin(fdeg*D2R)];
  const NPC=[], sM=s=>W.people.pickSeed(L=>!L.female,s), sF=s=>W.people.pickSeed(L=>L.female,s), nm=s=>(W.people.nameOf ? W.people.nameOf(s) : 'Khách');
  const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.5}, o));
  const LOG={}; let BL=null, DR=null;

  /* ---------- kiểm chỗ đứng / đường đi bằng va chạm thật ---------- */
  // 20/11 (Bình: bot rơi khỏi sàn / lơ lửng / lún ở sảnh tầng trên nhà hàng cạnh thang máy): mặt đứng của bot KHÔNG tính sàn cabin thang máy
  // (sàn cabin chạy lên xuống → bot bị nhấc theo hoặc rơi xuống giếng), không đứng dưới sàn khác (lún dưới sàn nhà hàng), không bước hụt tầng.
  let LIFTS=[]; try{ const lk=await import('./liftkit.js'); LIFTS=lk.allLifts ? lk.allLifts() : []; }catch(e){}
  const gY=(x,z,y)=>{ const sv=[]; for(const L of LIFTS) if(L.plat && Math.abs(L.cx-x)<4 && Math.abs(L.cz-z)<4){ sv.push([L.plat,L.plat.h]); L.plat.h=-1e9; }
    const g=W.groundAtY(x,z,y+.3); for(const [p,h] of sv) p.h=h; return g; };
  const nearLift=(x,z)=>LIFTS.some(L=>Math.hypot(x-L.cx,z-L.cz)<1.75);
  const inPl=(p,x,z)=>p.t==='c' ? (x-p.x)**2+(z-p.z)**2<p.r*p.r : p.t==='ring' ? (()=>{ const d2=(x-p.x)**2+(z-p.z)**2; return d2>p.r0*p.r0 && d2<p.r1*p.r1; })() : (()=>{ const dx=x-p.x, dz=z-p.z; return Math.abs(dx*p.c-dz*p.s)<p.hw && Math.abs(dx*p.s+dz*p.c)<p.hd; })();
  const headroom=(x,z,y)=>{ for(const p of (W.plats||[])){ if(p.h>y+.95 && p.h<y+1.9 && inPl(p,x,z)) return false; } return true; };   /* không có sàn nào ngay trên đầu */
  const blocked=(x,z,y,r,o)=>{ const p={x,z,y}; if(o && o.col) p.self=o.col; try{ W.resolve(p,r,false); }catch(e){ return true; } return Math.hypot(p.x-x,p.z-z)>.03; };
  const dry=(x,z,y)=>y>WY+.25;
  const okPt=(x,z,y,r=.42)=>Math.abs(gY(x,z,y)-y)<.3 && dry(x,z,y) && !blocked(x,z,y,r) && !nearLift(x,z) && headroom(x,z,y);
  const LIFT=[], INT=()=>(W.INTER||[]).filter(i=>i && typeof i.x==='number');
  const clearOf=(x,z,y)=>LIFT.every(([lx,lz,ly])=>Math.hypot(x-lx,z-lz)>=4.5 || Math.abs(y-ly)>3) && INT().every(i=>Math.hypot(x-i.x,z-i.z)>=1.5);
  function findSpot(x,z,y,r=.42,free=true){ y=gY(x,z,y); const ok=(X,Z)=>{ const Y=gY(X,Z,y); return Math.abs(Y-y)<.6 && okPt(X,Z,Y,r) && (!free || clearOf(X,Z,Y)); }; if(ok(x,z)) return [x,z,gY(x,z,y)];
    for(const d of [.4,.8,1.2,1.7,2.3,3,3.8]) for(let k=0;k<12;k++){ const a=k/12*TAU, X=x+Math.cos(a)*d, Z=z+Math.sin(a)*d; if(ok(X,Z)) return [X,Z,gY(X,Z,y)]; } return null; }
  function okSeg(a,b,y,o){ const L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.ceil(L/.35)); let py=y;
    for(let i=1;i<=n;i++){ const x=a[0]+(b[0]-a[0])*i/n, z=a[1]+(b[1]-a[1])*i/n, g=gY(x,z,py); if(Math.abs(g-py)>.42 || !dry(x,z,g) || blocked(x,z,g,.3,o) || nearLift(x,z)) return false; py=g; } return true; }
  function runs(pts, y, closed){ const n=pts.length, Y=pts.map(p=>gY(p[0],p[1],y)), okP=pts.map((p,i)=>Math.abs(Y[i]-y)<1.5 && okPt(p[0],p[1],Y[i],.4)),
      okS=pts.map((p,i)=>(i<n-1 || closed) && okP[i] && okP[(i+1)%n] && okSeg(p,pts[(i+1)%n],Y[i]));
    if(closed && okS.every(Boolean)) return [{pts, loop:true}]; const out=[]; let cur=null;
    const start=closed ? Math.max(0, okS.findIndex(v=>!v)+1) : 0; for(let k=0;k<n+(closed?1:0);k++){ const i=(start+k)%n; if(!cur){ if(okP[i]) cur=[pts[i]]; } else cur.push(pts[i]); if(!okS[i] || (!closed && i===n-1)){ if(cur && cur.length>2) out.push({pts:cur, loop:false}); cur=null; } }
    return out.sort((a,b)=>b.pts.length-a.pts.length); }

  /* ---------- nhân vật ---------- */
  function person(seed, outfit, name, dot, h){ const k=W.people.kit(seed,{outfit, h}); const a=makeActor(k.gl,{name, height:k.h, face:0, clips:k.clips, compact:false, dot:dot||'#7fe0ff'});
    if(k.look && k.look.width){ a.root.scale.x*=k.look.width; a.root.scale.z*=k.look.width; } if(LOW) a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
    a.g.position.set(0,-200,0); a.g.visible=false; a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a), anchor=new THREE.Object3D(); anchor.position.y=k.h+.75; a.g.add(anchor);
    const o={nm:name, a, po, h:k.h, hips:po.hipsHeight(), anchor, x:0, y:0, z:0, hd:0, bubble:null, bubbleT:0, col:{x:1e9, z:1e9, r:.3, owner:true}, upd:null, lines:null, ph:R()*9, hidden:false, pose:null}; circles.push(o.col); NPC.push(o); return o; }
  const say=(o,t,sec=3)=>{ if(o.bubble) removeLabel(o.bubble); o.bubble=makeLabel(t, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:30}); o.bubbleT=sec; };
  const put=(o,col=true)=>{ if(o.lie && o.lie.cx!==undefined && BL){ BL.placeLie(o.a, o.hips, o.lie); o.col.x=1e9; return; }
    if(o.lie){ const f=[Math.sin(o.hd),Math.cos(o.hd)], L=o.h*.53; o.a.g.position.set(o.x+f[0]*L, o.y+.1, o.z+f[1]*L); o.a.g.rotation.set(-Math.PI/2+.08, o.hd, 0, 'YXZ'); o.col.x=1e9; return; }
    o.a.g.position.set(o.x,o.y+(o.lift||0),o.z); o.a.g.rotation.set(0,o.hd,0); if(col && o.a.g.visible && !o.hidden){ o.col.x=o.x; o.col.z=o.z; o.col.y0=o.y-.4; o.col.y1=o.y+2; } else o.col.x=1e9; };
  const stand=(o,x,z,hd,y)=>{ o.x=x; o.z=z; o.hd=hd; o.y=y; o.upd=o.upd||(()=>put(o)); return o; };
  const face=(x,z,tx,tz)=>Math.atan2(tx-x,tz-z);
  const _pa=new V3(), _pb=new V3(), _pd=new V3(), _qa=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _F=new V3(), _R=new V3(), _U=new V3(0,1,0), _v=new V3();
  function aim(bn,n,c,f,u,r){ const B=bn[n], Cc=bn[c]; if(!B||!Cc) return; B.getWorldPosition(_pa); Cc.getWorldPosition(_pb); _pb.sub(_pa).normalize(); _pd.set(0,0,0).addScaledVector(_F,f).addScaledVector(_U,u).addScaledVector(_R,r).normalize(); _qa.setFromUnitVectors(_pb,_pd); B.getWorldQuaternion(_wq); B.parent.getWorldQuaternion(_pq); _wq.premultiply(_qa); B.quaternion.copy(_pq.invert().multiply(_wq)); B.updateMatrixWorld(true); }
  function arms(o, kind, t=0){ const bn=o.po.bones; if(!bn || !bn.Hips || !o.a.g.visible) return; o.a.g.updateMatrixWorld(true); o.a.g.getWorldDirection(_F); _F.y=0; _F.normalize(); _R.set(-_F.z,0,_F.x); const LR=[['Left',-1],['Right',1]];
    if(kind==='clap'){ const e=Math.abs(Math.sin(t*7)); for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.7,-.5,k*.25); aim(bn,s+'ForeArm',s+'Hand',.6,.45,-k*(.55+e*.35)); } }
    else if(kind==='wave'){ const e=Math.sin(t*5); aim(bn,'RightArm','RightForeArm',.15,.75,.6); aim(bn,'RightForeArm','RightHand',.1,1,.25+e*.35); }
    else if(kind==='behind'){ for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',-.35,-1,k*.12); aim(bn,s+'ForeArm',s+'Hand',-.7,-.25,-k*.6); } }
    else if(kind==='drink'){ aim(bn,'RightArm','RightForeArm',.35,-.6,.25); aim(bn,'RightForeArm','RightHand',.2,1,-.3); } }
  function attach(o, mesh, side='Right'){ let h=null; o.a.g.traverse(b=>{ if(b.isBone && !h && new RegExp(side+'Hand$').test(b.name)) h=b; }); if(!h) return null; o.a.g.updateMatrixWorld(true); h.getWorldScale(_v); mesh.scale.multiplyScalar(1/(_v.x||1)); h.add(mesh); return mesh; }
  const SHIRT=[0x2f6fd0,0xe0593c,0x2bb673,0xf2b632,0x8e5bd6,0xf4f2ec,0x1f2a3a,0xe86aa6,0x15a5b8,0x9a6b3f], PANT=[0x22262e,0x3a4a66,0x5a4a3a,0x2f3d2a,0x6b6f78];
  const casual=()=>({shirt:pick(SHIRT), pants:pick(PANT), shoe:pick([0x1b1d21,0xf4f4f4,0x7a4a2a])}), beachwear=()=>({shirt:pick([0xff6b3d,0x15a5b8,0xf2c14e,0xe86aa6,0xf4f2ec]), shorts:true, long:false, shoe:0xd8b48a});
  const any=()=>{ const salt=1000+Math.floor(R()*90000); return R()<.5 ? sM(salt) : sF(salt); };

  /* ---------- đi theo hành trình: mỗi điểm [x,z,y?] – đoạn đi thẳng được thì đi bộ (y bám mặt đi), không được thì ẩn rồi hiện ở điểm tới ---------- */
  function go(o, pts, sp, done){ o.rt={pts:pts.filter(Boolean), i:0, sp:sp||1.25, done, fade:0}; o.lie=false; }
  function stepGo(o, dt){ const r=o.rt; if(!r) return false; if(r.fade>0){ r.fade-=dt; if(r.fade<=0){ const p=r.pts[r.i], y0=p[2]??o.y; o.x=p[0]; o.z=p[1]; o.y=gY(p[0],p[1],y0);   /* hiện ra trên mặt đứng thật, không lấy nguyên y ghi tay */
        if(Math.abs(o.y-y0)>.7 || !headroom(o.x,o.z,o.y)){ const sp=findSpot(p[0],p[1],y0,.4,false); if(sp){ o.x=sp[0]; o.z=sp[1]; o.y=sp[2]; } } o.hidden=false; r.i++; } return true; }
    if(r.i>=r.pts.length){ o.rt=null; o.a.play('idle'); if(r.done) r.done(); return true; }
    const p=r.pts[r.i]; if(r.chk!==r.i){ r.chk=r.i; r.ok=p[3]==='jump' ? false : okSeg([o.x,o.z],[p[0],p[1]],o.y,o); if(!r.ok){ o.hidden=true; r.fade=1.2+Math.hypot(p[0]-o.x,p[1]-o.z)/6; return true; } }
    const dx=p[0]-o.x, dz=p[1]-o.z, d=Math.hypot(dx,dz); if(d<.12){ r.i++; return true; }
    const k=Math.min(d,r.sp*dt), nx=o.x+dx/d*k, nz=o.z+dz/d*k, ny=gY(nx,nz,o.y);
    if(Math.abs(ny-o.y)>.45 || nearLift(nx,nz) || !dry(nx,nz,ny)){ o.hidden=true; r.fade=1+d/6; return true; }   /* bước tới hụt sàn / giếng thang → không rơi: ẩn rồi hiện ở điểm tới */
    o.x=nx; o.z=nz; o.y=ny; o.hd=lerpAngle(o.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*8)); o.a.play(r.sp>2.2?'run':'walk'); put(o); return true; }
  const wait=(o,sec,then)=>{ o.wt=sec; o.wthen=then; };
  // điểm trên cung tròn quanh tâm toà (giữ đi trong hành lang / hàng hiên, không cắt ngang phòng)
  const arcPts=(c,a,b,n)=>{ const ra=Math.hypot(a[0]-c.x,a[1]-c.z), rb=Math.hypot(b[0]-c.x,b[1]-c.z), fa=Math.atan2(a[1]-c.z,a[0]-c.x); let fb=Math.atan2(b[1]-c.z,b[0]-c.x); while(fb-fa>Math.PI) fb-=TAU; while(fa-fb>Math.PI) fb+=TAU;
    const m=n||Math.max(1,Math.ceil(Math.abs(fb-fa)*(ra+rb)/2/4)), out=[]; for(let i=1;i<=m;i++){ const t=i/m, f=fa+(fb-fa)*t, r2=ra+(rb-ra)*t; out.push([c.x+Math.cos(f)*r2, c.z+Math.sin(f)*r2]); } return out; };

  /* ============================== DỊCH VỤ BÀN (dining.js) + ĐĂNG KÝ CÁC QUÁN ============================== */
  try{ const m=await import('./dining.js'); const DN=await m.make(W, W.__abyPay||{});
    const DV=W.abyDining||(W.ABY&&W.ABY.dining), DVL=DV ? (DV.list || [DV.cafe, DV.restaurant].filter(Boolean)) : []; for(const v of DVL){ const c=v.center||{}, ws=v.waiterSpawn; DN.register({id:'aby-'+v.k, name:v.name, kind:/rest|nha|palais/i.test(v.k+v.name)?'restaurant':'cafe', tableH:.785, area:{x:c.x, z:c.z, r:42}, waiterFrom:ws?{x:ws[0], z:ws[1], y:v.barY}:null}); }
    if(W.abyHotel && typeof W.abyHotel.Yf==='function'){ const y=W.abyHotel.Yf(24), seats=[]; for(const t of [-48,26,44,138,158,226]) for(const e of [-.55,.55]){ const a=t*D2R, r=27.25, tx=-Math.sin(a), tz=Math.cos(a); seats.push({x:Math.cos(a)*r+tx*e, z:-12+Math.sin(a)*r+tz*e, y:y+.47, floor:y, yaw:Math.atan2(-Math.cos(a),-Math.sin(a)), label:'🍸 Ngồi sofa Sky Lounge – gọi đồ uống (E · C)'}); }
      DN.register({id:'aby-skylounge', name:'Sky Lounge · tầng 24', kind:'lounge', seats, tableH:.45}); }
    [-3,20,160,183].forEach((f,i)=>{ const c=el(f,.835); DN.register({id:'aby-coconut'+i, name:'Quầy dừa bãi biển', kind:'coconut', area:{x:c[0], z:c[1], r:14, y0:-1, y1:4}, waiterFrom:{x:c[0], z:c[1]}}); });
    LOG.dining=DN.venues.size; DR=DN.drinks||null; }catch(e){ console.warn('[Bot Abyssal] dining', e); }
  // đồ uống cầm tay cho bot (dining.js): cầm ly, thỉnh thoảng nâng lên uống, tự cụng ly với người gần đó (bot hoặc người chơi)
  const giveBot=(o,id,life)=>{ if(!DR) return null; o.drink=DR.give({a:o.a, bones:o.po.bones, nm:o.nm, ext:true, say:(t,sec)=>say(o,t,sec), lie:()=>!!o.lie, get hidden(){ return o.hidden; }}, id, {life:life||120, firstSip:1+R()*4}); return o.drink; };
  const dropBot=o=>{ if(o.drink && DR){ DR.drop(o.drink,true); } o.drink=null; };

  /* ============================== 🖥️ KHÁCH XEM 9 MÀN HÌNH (pavilion trên đảo khách sạn) ============================== */
  { const MON=(W.screens && W.screens.monitors) || []; const VIEW=['Số liệu hôm nay ổn đấy 📊','Test pass hết rồi, ngon! ✅','Biểu đồ này cập nhật trực tiếp à?','Để xem bug nào còn mở… 🐞','Dashboard nhìn rõ ghê!'];
    MON.forEach((m,i)=>{ if(!m || !m.g || typeof m.x!=='number' || Math.hypot(m.x,m.z)>200) return; const my=m.g.position.y||0, rot=m.rot||0, nx=Math.sin(rot), nz=Math.cos(rot), side=i%2?1:-1;
      const sp=findSpot(m.x+nx*2.4+nz*1.3*side, m.z+nz*2.4-nx*1.3*side, my+.5); if(!sp || Math.abs(sp[2]-my)>3) return;
      const s=any(), o=person(s, casual(), `🖥️ ${nm(s)} · xem màn hình`); stand(o, sp[0], sp[1], face(sp[0],sp[1],m.x,m.z), sp[2]); o.lines=VIEW; const k=i%3;
      o.upd=(dt,T)=>{ put(o); if(o.a.g.visible){ if(k===0) o.po.apply('cross',T); else if(k===1) arms(o,'behind',T); else o.po.apply('phone',T); } }; }); }

  /* ============================== 1. 🏙️ CƯ DÂN RESIDENCES + 2. 🎓 HỌC VIỆN ============================== */
  const TWS=(W.abyTowers && W.abyTowers.list) || [], TW={}; for(const t of TWS) TW[t.k]=t;
  for(const t of TWS) for(const L of (t.lifts||[])) if(L && typeof L.cx==='number') LIFT.push([L.cx, L.cz, t.podiumY]);
  const liftFront=(t,y)=>{ const L=(t.lifts||[])[0], lb=t.lobby; if(!L) return [lb.x,lb.z]; const dx=lb.x-L.cx, dz=lb.z-L.cz, d=Math.hypot(dx,dz)||1; return [L.cx+dx/d*2.2, L.cz+dz/d*2.2]; };
  const beachFrom=(t,f)=>{ const fc=t.lobby.forecourt, lb=t.lobby, dx=fc[0]-lb.x, dz=fc[1]-lb.z, d=Math.hypot(dx,dz)||1; return [fc[0]+dx/d*(10+f*5), fc[1]+dz/d*(10+f*5)]; };
  { const T=TW.do; if(T){ const apts=[]; for(const F of (T.floors||[])) for(const rm of (F.rooms||[])) if(rm.kind==='apt' && rm.c) apts.push({F, rm}); LOG.apts=apts.length;
      for(let i=0;i<Math.min(5,apts.length);i++){ const {F,rm}=apts[Math.floor(i*apts.length/5)], s=i%2?sF(8100+i):sM(8100+i), o=person(s, casual(), `🏙️ ${nm(s)} · cư dân Residences`);
        const home=findSpot(rm.c[0],rm.c[1],F.y,.35,false)||[rm.c[0],rm.c[1],F.y], bal=rm.balcony?(findSpot(rm.balcony[0],rm.balcony[1],F.y,.35,false)):null; stand(o,home[0],home[1],0,home[2]); o.lines=['Chào bạn hàng xóm! 👋','Xuống biển tắm nắng chút đã 🏖️','View vịnh từ căn hộ đẹp lắm!','Tối nay lên Sky Lounge không?'];
        const L=liftFront(T), lob=[T.lobby.x,T.lobby.z,T.podiumY], door=[...T.lobby.door,T.podiumY], fc=[...T.lobby.forecourt,T.podiumY];
        let st='home'; o.wt=rr(5,25);
        const plan=()=>{ if(st==='home'){ st=bal&&R()<.5?'balcony':'down'; if(st==='balcony'){ go(o,[bal],1.1,()=>{ st='balc'; o.hd=face(bal[0],bal[1],0,-12); o.wt=rr(15,30); }); } else {
              const up=[rm.door?[...rm.door,F.y]:null]; go(o,[...up, [L[0],L[1],F.y,'jump'], [L[0],L[1],T.podiumY,'jump'], lob, door, fc, (()=>{ const b=beachFrom(T,R()); const sp=findSpot(b[0],b[1],2.5,.45); return sp; })()], 1.2, ()=>{ st='beach'; o.wt=rr(35,50); o.sun=R()<.5; }); } }
          else if(st==='balc'){ st='home'; go(o,[home],1,()=>{ o.wt=rr(15,40); }); }
          else if(st==='beach'){ st='back'; go(o,[fc,door,lob,[L[0],L[1],T.podiumY],[L[0],L[1],F.y,'jump'], rm.door?[...rm.door,F.y,'jump']:null, home],1.2,()=>{ st='home'; o.wt=rr(20,40); }); } };
        o.upd=(dt,T2)=>{ if(stepGo(o,dt)) return; if(o.wt>0){ o.wt-=dt; o.a.play('idle'); put(o); if(o.a.g.visible){ if(st==='beach' && o.sun) arms(o,'behind',T2); else if(st==='balc') o.po.apply('phone',T2); } if(o.wt<=0) plan(); } }; } } }
  { const T=TW.xanh; if(T){ const byKind={}; for(const F of (T.floors||[])) for(const rm of (F.rooms||[])) (byKind[rm.kind]=byKind[rm.kind]||[]).push({F,rm}); LOG.rooms=Object.fromEntries(Object.entries(byKind).map(([k,v])=>[k,v.length]));
      const cls=(byKind.class||[]).slice(0,3), brk=[...(byKind.billiard||[]),...(byKind.pantry||[]),...(byKind.lounge||[])];
      cls.forEach(({F,rm},ci)=>{ const c=T.center, ra=Math.hypot(rm.c[0]-c.x,rm.c[1]-c.z), fa=Math.atan2(rm.c[1]-c.z,rm.c[0]-c.x), at=(du,dr)=>{ const f=fa+du/ra; return [c.x+Math.cos(f)*(ra+dr), c.z+Math.sin(f)*(ra+dr)]; };
        const tp=findSpot(...at(0,-1.6),F.y,.35,false); if(tp){ const s=sF(8200+ci), o=person(s,{shirt:0x1f2a3a, pants:0x22262e, shoe:0x1b1d21},`🎓 ${nm(s)} · giảng viên`,'#6dffb0'); const look=at(0,1.8); stand(o,tp[0],tp[1],face(tp[0],tp[1],look[0],look[1]),tp[2]); o.lines=['Hôm nay học Playwright nhé cả lớp!','Test case phải có expected result rõ ràng 📋','Ai trả lời được: smoke test khác sanity test chỗ nào?'];
          o.upd=(dt,T2)=>{ put(o); if(o.a.g.visible) o.po.apply('present',T2); }; }
        for(let j=0;j<2;j++){ const sp=findSpot(...at((j-.5)*1.6,1.6),F.y,.32,false); if(!sp) continue; const s=any(), o=person(s,casual(),`🎓 ${nm(s)} · học viên QA`); const tch=tp||at(0,-1.6); stand(o,sp[0],sp[1],face(sp[0],sp[1],tch[0],tch[1]),sp[2]); o.lines=['Ghi chép đã, chiều làm lab 📝','Thầy ơi cho em hỏi về boundary value!','Giải lao đánh bida không? 🎱'];
          const seat={x:sp[0],z:sp[1],y:sp[2]}; let st='class'; o.wt=rr(20,60);
          const plan=()=>{ if(st==='class' && brk.length && j===ci%2){ const b=pick(brk), bs=findSpot(b.rm.c[0]+rr(-1,1),b.rm.c[1]+rr(-1,1),b.F.y,.35,false); if(!bs){ o.wt=30; return; } st='break';
                const route=[rm.door?[...rm.door,F.y]:null, ...(b.F===F && rm.door && b.rm.door ? arcPts(T.center,rm.door,b.rm.door).map(p=>[p[0],p[1],F.y]) : [[...(b.rm.door||b.rm.c),b.F.y,'jump']]), b.rm.door?[...b.rm.door,b.F.y]:null, bs];
                go(o,route,1.25,()=>{ st='rest'; o.wt=rr(20,35); o.back=[bs, b.rm.door?[...b.rm.door,b.F.y]:null, ...(b.F===F && rm.door && b.rm.door ? arcPts(T.center,b.rm.door,rm.door).map(p=>[p[0],p[1],F.y]) : [[...(rm.door||rm.c),F.y,'jump']]), rm.door?[...rm.door,F.y]:null, [seat.x,seat.z,seat.y]]; }); }
              else if(st==='rest'){ st='ret'; go(o,o.back,1.25,()=>{ st='class'; o.hd=face(o.x,o.z,tch[0],tch[1]); o.wt=rr(40,80); }); } else o.wt=rr(30,60); };
          o.upd=(dt,T2)=>{ if(stepGo(o,dt)) return; o.wt-=dt; o.a.play('idle'); put(o); if(o.a.g.visible){ if(st==='rest') o.po.apply(R()<.5?'phone':'cross',T2); else if(Math.sin(T2*.4+o.ph)>.6) o.po.apply('nod',T2); } if(o.wt<=0) plan(); }; } }); } }

  /* ============================== 5. 🛍️ KHÁCH MUA SẮM 16 SHOPHOUSE ============================== */
  { const SH=(W.abyTowers && W.abyTowers.shophouses) || []; LOG.shops=SH.length; const bagG=new THREE.BoxGeometry(.26,.32,.1), bagM=[std(0xc8a06a,{roughness:.9}), std(0xf4f1ea,{roughness:.9}), std(0x591622,{roughness:.8})];
    for(let i=0;i<Math.min(6,Math.floor(SH.length/2));i++){ const tw=i<3?'xanh':'do', mine=SH.filter(s=>s.tower===tw); if(mine.length<2) continue; const T=TW[tw]||{center:{x:0,z:-5}}, s=any(), o=person(s,casual(),`🛍️ ${nm(s)} · khách mua sắm`);
      let cur=mine[(i*3)%mine.length]; const y0=cur.y; const sp=findSpot(cur.door[0],cur.door[1],y0,.38)||[cur.door[0],cur.door[1],y0]; stand(o,sp[0],sp[1],0,sp[2]); o.lines=['Mua được món ưng ý rồi 🛍️','Tiệm này giảm giá cho QA nè!','Đi thêm vòng nữa nhé'];
      const bag=new THREE.Mesh(bagG, bagM[i%3]); bag.visible=false; bag.position.set(0,-.1,0); attach(o,bag,'Left'); let st='walk'; o.wt=rr(1,6);
      const visit=()=>{ const sh=cur, Y=sh.y; const br=sh.browse.map(b=>findSpot(b[0],b[1],Y,.32,false)).filter(Boolean); const ct=findSpot(sh.counter[0]-(sh.counter[0]-sh.inside[0])*.25, sh.counter[1]-(sh.counter[1]-sh.inside[1])*.25, Y,.32,false);
          st='in'; go(o,[[...sh.door,Y],[...sh.inside,Y], br[0]||null],1.1,()=>{ st='browse'; o.wt=rr(4,6); o.bi=1; o.br=br; o.ct=ct; }); };
      const plan=()=>{ if(st==='walk'){ visit(); }
          else if(st==='browse'){ if(o.bi<o.br.length){ const b=o.br[o.bi++]; go(o,[b],1,()=>{ o.wt=rr(3.5,5); }); } else { st='pay'; go(o,[o.ct],1,()=>{ o.wt=3; }); } }
          else if(st==='pay'){ bag.visible=true; say(o,'💳 Thanh toán xong, cảm ơn nhé!',2.5); st='out'; const sh=cur; go(o,[[...sh.inside,sh.y],[...sh.door,sh.y]],1.15,()=>{ st='stroll'; o.wt=rr(1,3); }); }
          else if(st==='stroll'){ const nx=pick(mine.filter(s=>s!==cur)); const path=arcPts(T.center,cur.door,nx.door).map(p=>[p[0],p[1],nx.y]); cur=nx; st='walk'; go(o,path,1.2,()=>{ o.wt=rr(2,6); if(R()<.4) bag.visible=false; }); } };
      o.upd=(dt,T2)=>{ if(stepGo(o,dt)) return; o.wt-=dt; o.a.play('idle'); put(o); if(o.a.g.visible && st==='pay') o.po.apply('present',T2); if(o.wt<=0) plan(); }; } }

  /* ============================== 4. 🏖️ KHÁCH BÃI BIỂN (nằm duỗi trên ghế tắm nắng thật 50–90 s, nhiều người cầm ly nước dừa / cocktail, rồi rời đi) ============================== */
  const STAIRS=((ABY.plots||{}).beach||{}).stairs||[];
  /* bơi · tắm · chơi bóng · nhà thay đồ: js/abyssal_beachlife.js (nạp ở dưới, dùng chung các hàm của file này) */
  try{ const m=await import('./abyssal_beachlife.js'); BL=await m.make(W, {R, rr, pick, el, person, put, stand, go, stepGo, wait, findSpot, gY, okPt, blocked, dry, sM, sF, nm, say, NPC, WY, LOW, STAIRS, giveBot, dropBot, casual, beachwear, face, arms, aim}); LOG.beach=BL && BL.log; }catch(e){ console.warn('[Bot Abyssal] beachlife', e); }
  { const stairOf=(x,z)=>{ let b=null, bd=1e9; for(const s of STAIRS){ if(!s.top || !s.bottom) continue; const d=Math.hypot(s.bottom[0]-x,s.bottom[1]-z); if(d<bd){ bd=d; b=s; } } return b; };
    for(let i=0;i<6;i++){ const s=i%2?sF(8300+i):sM(8300+i), o=person(s,beachwear(),`🏖️ ${nm(s)} · khách bãi biển`); o.lines=['Nắng đẹp quá! ☀️','Nước vịnh trong ghê 🌊','Lát ra quầy dừa nhé 🥥','Nằm hóng gió biển sướng thật 🌴'];
      const f0=rr(-10,190), start=findSpot(...el(f0,.81),1.5,.4)||[...el(f0,.81),1.2]; stand(o,start[0],start[1],R()*TAU,start[2]); let st='stroll', seat=null; o.wt=rr(1,10);
      const plan=()=>{ if(st==='stroll'){ const Lg=BL ? BL.freeLounger(o.x,o.z) : null; const side=Lg ? BL.sideSpot(Lg) : null;
            if(Lg && side && R()<.75){ seat=Lg; BL.take(Lg,o); st='toSeat'; go(o,[side],1.1,()=>{ if(seat.taken!==o){ st='stroll'; seat=null; o.wt=2; return; } st='lie'; o.lie=seat; o.lieV=R()<.5?1:0; o.x=seat.cx; o.z=seat.cz; o.y=seat.floor; o.hd=seat.yaw; o.wt=rr(50,90); if(R()<.65) giveBot(o, pick(['coconut','coconut','smoothie','cocktail','champagne']), o.wt+5); }); }
            else { const f=rr(-10,190), p=findSpot(...el(f,rr(.79,.86)),1.5,.4); go(o,[p],1.05,()=>{ o.wt=rr(4,12); }); } }
          else if(st==='lie'){ o.lie=null; dropBot(o); const side=seat ? BL.sideSpot(seat) : null; if(side){ o.x=side[0]; o.z=side[1]; o.y=side[2]; } if(seat){ BL.release(seat); seat=null; } const S2=stairOf(o.x,o.z); st='leave'; go(o,[S2?[...S2.bottom,2.5]:null, S2?[...S2.top,16]:null],1.15,()=>{ o.hidden=true; st='away'; o.wt=rr(15,40); }); }
          else if(st==='toSeat'){ st='stroll'; if(seat){ BL.release(seat); seat=null; } o.wt=1; }
          else if(st==='away'){ const S2=pick(STAIRS.filter(q=>q.top&&q.bottom)); if(S2){ o.x=S2.top[0]; o.z=S2.top[1]; o.y=gY(o.x,o.z,16); o.hidden=false; st='stroll'; go(o,[[...S2.bottom,2.5], findSpot(...el(rr(-10,190),.82),1.5,.4)],1.1,()=>{ o.wt=rr(3,8); }); } else { o.hidden=false; st='stroll'; o.wt=5; } } };
      o.upd=(dt,T2)=>{ if(stepGo(o,dt)) return; o.wt-=dt; o.a.play('idle'); put(o); if(o.wt<=0) plan(); }; } }

  /* ============================== 3. 🚗 XE GIA ĐÌNH (spawnVehicle + roadNet → ô đỗ bãi biển → quầy dừa → về) ============================== */
  const FAM={pool:[], cars:[], next:8, bays:[], bars:[-3,20,160,183].map(f=>el(f,.835))};
  for(let k=0;k<11;k++){ const f=58.6+1.1*k+.55, c=el(f,1.035), a=el(f,1.016), b=el(f,1.054); FAM.bays.push({c, yaw:Math.atan2(b[0]-a[0],b[1]-a[1]), f, used:false}); }
  for(let i=0;i<4;i++){ const s=i<2?(i?sF(8400):sM(8401)):(i===2?sM(8402):sF(8403)), o=person(s,i<2?casual():{...casual(), h:i===2?1.25:1.35},`👨‍👩‍👧 ${nm(s)} · gia đình đi biển`, '#ffd166', i<2?null:(i===2?1.25:1.35)); o.hidden=true; o.fam=true; FAM.pool.push(o); o.lines=['Cả nhà ra biển chơi nè! 🏖️','Con muốn uống nước dừa! 🥥','Chụp tấm ảnh gia đình nào 📸']; o.upd=(dt)=>{ if(o.delay>0){ o.delay-=dt; o.a.play('idle'); put(o); return; } stepGo(o,dt); if(o.famUpd) o.famUpd(dt); else put(o); }; }   /* delay: cả nhà đi thành hàng, không chồng lên nhau */
  const ePt=(e,s)=>{ s=clamp(s,0,e.len); let lo=0, hi=e.cum.length-1; while(hi-lo>1){ const m=(lo+hi)>>1; if(e.cum[m]<=s) lo=m; else hi=m; } const t=(s-e.cum[lo])/Math.max(1e-6,e.cum[hi]-e.cum[lo]); return [e.x[lo]+(e.x[hi]-e.x[lo])*t, e.y?e.y[lo]+(e.y[hi]-e.y[lo])*t:0, e.z[lo]+(e.z[hi]-e.z[lo])*t]; };
  function famTrip(){ const tr=W.traffic, RN=W.roadNet; if(!tr || !tr.spawnVehicle || !RN) return false; if(FAM.cars.length || FAM.pool.some(o=>!o.hidden)) return false;
    const bay=pick(FAM.bays.filter(b=>!b.used)); if(!bay) return false; const lane=el(bay.f,.99), from=Math.hypot(P.x-180,P.z)>140?{x:178,z:0}:{x:-178,z:-16};
    const s=tr.spawnVehicle('civil', {x:lane[0], z:lane[1]}, {from, stop:7, color:pick([0x3a6ea5,0xb3122e,0xf4f1ea,0x2f3d2a,0x1f2a3a]), top:.8}); if(!s){ LOG.carFail=(LOG.carFail||0)+1; return false; }
    bay.used=true; const n=2+Math.floor(R()*3), fam=FAM.pool.slice(0,n); const C={s, bay, fam, st:'drive', t:0}; FAM.cars.push(C); LOG.cars=(LOG.cars||0)+1; return true; }
  function famStep(C, dt){ C.t+=dt; const s=C.s, g=s.g;
    if(C.st==='drive'){ if(s.arrived || (C.t>150)){ if(!s.arrived){ s.remove(); C.bay.used=false; FAM.cars.splice(FAM.cars.indexOf(C),1); return; } s.hazard=true; C.st='turn'; C.t=0; C.A={x:g.position.x, y:g.position.y, z:g.position.z, h:s.h}; s.remove(); scene.add(g); C.dyn={obj:g, hl:2.6, hw:1.1, head:()=>g.rotation.y, on:()=>true, name:'xe gia đình'}; if(W.DYN) W.DYN.push(C.dyn); } return; }
    const B={x:C.bay.c[0], z:C.bay.c[1]}; B.y=gY(B.x,B.z,C.A.y+1)-.0; const M=el(C.bay.f,1.0), Cp={x:M[0], z:M[1]};
    const bez=(t)=>{ const a=(1-t)*(1-t), b=2*t*(1-t), c=t*t; return [C.A.x*a+Cp.x*b+B.x*c, C.A.z*a+Cp.z*b+B.z*c]; }, yawTo=(h0,h1,t)=>{ let d=h1-h0; d=Math.atan2(Math.sin(d),Math.cos(d)); return h0+d*t; };
    if(C.st==='turn' || C.st==='out'){ const u=clamp(C.t/6,0,1), t=C.st==='turn'?u*u*(3-2*u):1-u*u*(3-2*u); const [x,z]=bez(t); g.position.set(x, gY(x,z,C.A.y+.5), z); g.rotation.set(0, yawTo(C.A.h, C.bay.yaw, t), 0);
      const blink=Math.floor(C.t*2.5)%2; if(s.lamps) for(const l of s.lamps) l.visible=!!blink;
      if(u>=1){ if(C.st==='turn'){ C.st='park'; C.t=0; const off=[Math.cos(C.bay.yaw),-Math.sin(C.bay.yaw)]; C.fam.forEach((o,i)=>{ const side=i%2?1:-1; o.x=B.x+off[0]*1.6*side; o.z=B.z+off[1]*1.6*side; o.y=gY(o.x,o.z,B.y+.5); o.hidden=false; o.hd=C.bay.yaw+Math.PI; });
            const st=(()=>{ let b=null, bd=1e9; for(const q of STAIRS){ if(!q.top) continue; const d=Math.hypot(q.top[0]-B.x,q.top[1]-B.z); if(d<bd){ bd=d; b=q; } } return b; })(), bar=FAM.bars.slice().sort((a,b)=>Math.hypot(a[0]-B.x,a[1]-B.z)-Math.hypot(b[0]-B.x,b[1]-B.z))[0];
            C.stair=st; C.bar=bar; say(C.fam[0],'Tới rồi! Cả nhà xuống biển nào 🏖️',3);
            C.fam.forEach((o,i)=>{ const a=i/C.fam.length*TAU+.5, spot=findSpot(bar[0]+Math.cos(a)*3.6, bar[1]+Math.sin(a)*3.6, 1.5, .35, false); o.spot=spot; o.delay=i*.9; go(o,[st?[...st.top,16]:null, st?[...st.bottom,2.5]:null, spot],1.1+i*.04,()=>{ o.hd=face(o.x,o.z,bar[0],bar[1]); o.drinking=true; giveBot(o, i>=2 ? pick(['coconut','smoothie','icecream']) : pick(['coconut','coconut','beer','smoothie']), (C.stay||80)+30); }); o.famUpd=(dt2)=>{ if(!o.rt){ put(o); if(o.a.g.visible && o.drinking && !o.drink) arms(o,'drink',0); } }; });
            C.stay=rr(60,90); }
        else { /* đã lùi ra làn → chạy đi theo đường vành đai rồi biến mất */ C.st='leave'; C.t=0; const RN=W.roadNet, n=RN && RN.nearest ? RN.nearest(g.position.x,g.position.z,30) : null; C.e=n?n.e:null; C.es=n?n.s:0; C.v=0; const p1=C.e?ePt(C.e,C.es+2):null; C.dir=p1 ? (Math.cos(Math.atan2(p1[0]-g.position.x,p1[2]-g.position.z)-g.rotation.y)>0?1:-1) : 1; } } return; }
    if(C.st==='park'){ const back=C.fam.every(o=>o.hidden); if(C.t>C.stay && !C.called){ C.called=true; say(C.fam[0],'Về thôi cả nhà! 🚗',3); C.fam.forEach((o,i)=>{ o.drinking=false; dropBot(o); o.delay=i*.9; go(o,[C.stair?[...C.stair.bottom,2.5]:null, C.stair?[...C.stair.top,16]:null, [B.x,B.z,gY(B.x,B.z,B.y+.5)]],1.15,()=>{ o.hidden=true; o.famUpd=null; }); }); }
      if(C.called && back){ C.st='out'; C.t=0; } return; }
    if(C.st==='leave'){ C.v=Math.min(9,C.v+3*dt); C.es+=C.dir*C.v*dt; if(!C.e || C.t>18){ scene.remove(g); if(C.dyn && W.DYN){ const j=W.DYN.indexOf(C.dyn); if(j>=0) W.DYN.splice(j,1); } C.bay.used=false; FAM.cars.splice(FAM.cars.indexOf(C),1); return; }
      const p=ePt(C.e,C.es), q=ePt(C.e,C.es+C.dir*2), rx=-(q[2]-p[2]), rz=q[0]-p[0], rl=Math.hypot(rx,rz)||1; g.position.set(p[0]-rx/rl*1.8, p[1], p[2]-rz/rl*1.8);   /* làn bên phải chiều chạy */ g.rotation.set(0,Math.atan2(q[0]-p[0],q[2]-p[2]),0); if(s.lamps) for(const l of s.lamps) l.visible=false; } }

  /* ============================== 6. 🛥️ KHÁCH DU THUYỀN XẾP HÀNG Ở BẾN ============================== */
  const SEA=W.abySea; if(SEA && SEA.quay){ const Q=SEA.quay; const N=4; const qs=[]; for(let i=0;i<N;i++){ const s=any(), o=person(s,casual(),`🛥️ ${nm(s)} · khách du thuyền`); o.lines=['Hồi hộp quá, sắp lên du thuyền rồi! 🛥️','Nghe nói tour đi qua 5 đảo đá vôi đẹp lắm!','Mua combo VIP chưa bạn?']; qs.push(o);
      const spot=()=>{ const [x,z]=Q.at(-3-i*1.6, Q.PB-2.6); return findSpot(x,z,Q.DY,.32,false)||[x,z,Q.DY]; }; const sp=spot(); stand(o,sp[0],sp[1],0,sp[2]); const gw=Q.at(0,Q.PB-1.4); o.hd=face(sp[0],sp[1],gw[0],gw[1]);
      let st='queue'; o.wt=rr(2,6);
      o.upd=(dt,T2)=>{ if(stepGo(o,dt)) return; o.wt-=dt; o.a.play('idle'); put(o); if(o.a.g.visible && st==='queue') o.po.apply(i%2?'phone':'cross',T2);
        if(o.wt>0) return; const k=SEA.dockedK(), y=k>=0?SEA.yachts[k]:null;
        if(st==='queue' && y && y.tau>4+i*2.5 && y.tau<SEA.route.DWELL-6){ st='board'; const g2=Q.at(0,Q.PB-.6); go(o,[[g2[0],g2[1],Q.DY]],1.2,()=>{ o.hidden=true; st='aboard'; o.wt=rr(SEA.route.PER*.6, SEA.route.PER*.9); }); }
        else if(st==='aboard'){ const p=spot(); const e=Q.at(-26,Q.PB-3); o.x=e[0]; o.z=e[1]; o.y=gY(e[0],e[1],Q.DY); o.hidden=false; st='queue'; go(o,[p],1.15,()=>{ o.hd=face(o.x,o.z,gw[0],gw[1]); o.wt=rr(3,8); }); }
        else o.wt=1; }; } LOG.yachtQ=N; }

  /* ============================== 🍽️ THỰC KHÁCH NGỒI BÀN CAFE / NHÀ HÀNG (W.dining.meal – ăn bằng dao nĩa / thìa, cầm ly lên uống, ~1 phút rồi ngồi chơi, sau đó rời quán) ============================== */
  { const MEAL=W.dining && W.dining.meal, DVL2=(W.abyDining && W.abyDining.list) || [], TBL=[];
    for(const v of DVL2) for(const T of (v.tables||[])) for(const st of (T.seats||[])) if(typeof st.x==='number' && typeof st.face==='number') TBL.push({v, T, st, life:(W.seats||[]).find(q=>Math.hypot(q.x-st.x,q.z-st.z)<.2 && Math.abs((q.floor ?? q.y)-(st.floor ?? st.y-.47))<.6)||null, used:null});
    const DISH={cafe:['cappu','espresso','matcha','croissant','tiramisu','macaron','cold','tea'], restaurant:['steak','lobster','salmon','wine','champagne','flan']};
    LOG.diners=0; if(MEAL && TBL.length){ for(let i=0;i<(LOW?2:4);i++){ const sd=any(), o=person(sd, casual(), `🍽️ ${nm(sd)} · thực khách`); o.lines=['Món này ngon tuyệt! 😋','Ngồi đây ngắm vịnh thích thật','Lần sau dẫn cả nhà tới nhé 🍷']; o.hidden=true; o.noSnap=true; o.wt=2+i*6; let cur=null; LOG.diners++;
        const camD=(x,z)=>Math.hypot(x-W.camera.position.x, z-W.camera.position.z);
        const sitDown=()=>{ const free=TBL.filter(t=>!t.used && !(t.life && t.life.taken) && Math.hypot(t.st.x-P.x,t.st.z-P.z)>2 && camD(t.st.x,t.st.z)>14); if(!free.length){ o.wt=8; return; } cur=pick(free); cur.used=o; if(cur.life) cur.life.taken='bot';
            const st=cur.st, fl=st.floor ?? st.y-.47; o.x=st.x; o.z=st.z; o.hd=st.face; o.y=st.y+.04-o.hips; o.seated=true; o.hidden=false; o.col.x=1e9;
            const kind=/rest|nha|palais/i.test(cur.v.k+cur.v.name)?'restaurant':'cafe'; o.meal=MEAL.start({a:o.a, bones:o.po.bones, nm:o.nm}, {x:st.x, z:st.z, yaw:st.face, floor:fl, tableY:fl+.785}, pick(DISH[kind]), {dur:rr(55,75)}); if(o.meal) o.meal.ext=true; o.wt=rr(80,110); };
        const leave=()=>{ if(camD(o.x,o.z)<14 || Math.hypot(o.x-P.x,o.z-P.z)<6){ o.wt=6; return; } if(o.meal){ MEAL.stop(o.meal,{}); o.meal=null; } if(cur){ if(cur.life && cur.life.taken==='bot') cur.life.taken=null; cur.used=null; cur=null; } o.seated=false; o.hidden=true; o.wt=rr(20,45); };
        o.upd=(dt,T2)=>{ o.wt-=dt; if(o.hidden){ if(o.wt<=0) sitDown(); return; } o.a.play('idle'); o.a.g.position.set(o.x,o.y,o.z); o.a.g.rotation.set(0,o.hd,0); if(o.a.g.visible) o.po.apply('sit',T2); if(o.wt<=0) leave(); }; } } }

  /* ============================== 🛣️ VÀNH ĐAI +2 + 💂 BẢO VỆ 3 CỔNG (giữ) ============================== */
  { const GY=2, C=171, sq=[]; for(const [a,b] of [[[C,-C],[C,C]],[[C,C],[-C,C]],[[-C,C],[-C,-C]],[[-C,-C],[C,-C]]]){ const L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.ceil(L/6); for(let i=0;i<n;i++) sq.push([a[0]+(b[0]-a[0])*i/n, a[1]+(b[1]-a[1])*i/n]); }
    const rs=runs(sq, GY, true); for(let i=0;i<3 && rs.length;i++){ const s=any(), jog=i===0, o=person(s, jog?{shirt:0xff6b3d, pants:0x22262e, shoe:0xf4f4f4}:casual(), jog?`🏃 ${nm(s)} · chạy bộ vành đai`:`🚶 ${nm(s)} · đi bộ vành đai`); o.y=GY;
      const run=rs[i%rs.length], pts=run.pts; let wi=1+Math.floor(R()*(pts.length-1)), dir=1; o.x=pts[wi-1][0]; o.z=pts[wi-1][1]; o.y=gY(o.x,o.z,GY); const sp=jog?2.7:1.15; o.lift=.03;
      o.upd=(dt)=>{ const [tx,tz]=pts[wi], dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<.2){ if(run.loop) wi=(wi+1)%pts.length; else { if(wi+dir<0 || wi+dir>=pts.length) dir*=-1; wi+=dir; } return; }
        const k=Math.min(d,sp*dt); o.x+=dx/d*k; o.z+=dz/d*k; o.y=gY(o.x,o.z,o.y); o.hd=lerpAngle(o.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*8)); o.a.play(jog?'run':'walk'); put(o); }; } }
  { const G=A&&A.GATES||{}; const SPOT={G1:[[179.0,6.6],-Math.PI/2], G2:[[6.6,179.0],Math.PI], G3:[[-179.0,-22.6],Math.PI/2]};
    for(const [k,[[x,z],hd]] of Object.entries(SPOT)){ const g=G[k]; if(!g) continue; const y=g[2]??2, sp=findSpot(x,z,y,.4); if(!sp) continue;
      const o=person(sM(7700+k.charCodeAt(1)), {shirt:0x1f2a3a, pants:0x1f2a3a, shoe:0x111111, style:'cap'}, `💂 Bảo vệ cổng ${k}`, '#ffd23f'); stand(o, sp[0], sp[1], hd, sp[2]); o.lines=['Chào mừng tới Vịnh Abyssal! 👋','Xuống bãi cát vàng thì đi cầu thang gỗ nhé.','Bến Siêu Du Thuyền ở vách Tây eo biển, dưới Cầu Vòm.'];
      o.upd=(dt,T)=>{ put(o); if(o.a.g.visible) arms(o,'behind',T); }; } }

  /* ============================== KHUNG HÌNH: máy trạng thái mọi bot + chỉ hiện bot gần camera ============================== */
  const FAR=LOW?55:80, MAXV=LOW?10:18; let tick=0, snapT=0; const vis=new Set();
  HOOK.onFrame.push((dt,T)=>{ dt=Math.min(dt||1/60,.1); tick-=dt; const c=W.camera.position, near=!W.inside && Math.hypot(P.x,P.z+12)<300;
    /* xe gia đình: mỗi 25–40 s khi người chơi ở gần bãi đỗ biển */ FAM.next-=dt; if(FAM.next<=0){ FAM.next=rr(25,40); const pk=el(64,1.035); if(near && Math.hypot(P.x-pk[0],P.z-pk[1])<260) try{ famTrip(); }catch(e){ console.warn('[Bot Abyssal] xe gia đình', e); FAM.next=120; } }
    for(const C of FAM.cars.slice()) try{ famStep(C,dt); }catch(e){ console.warn('[Bot Abyssal] xe', e); FAM.cars.splice(FAM.cars.indexOf(C),1); }
    if(tick<=0){ tick=.4; vis.clear(); if(near){ const L=[]; for(const o of NPC){ if(o.hidden) continue; const d=Math.hypot(o.x-c.x,o.y+1-c.y,o.z-c.z); if(d<FAR) L.push([d,o]); } L.sort((a,b)=>a[0]-b[0]); for(let i=0;i<Math.min(MAXV,L.length);i++) vis.add(L[i][1]); }
      for(const o of NPC){ const v=vis.has(o); if(o.a.g.visible!==v){ o.a.g.visible=v; if(!v){ o.col.x=1e9; if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } } } } }
    snapT-=dt; const doSnap=snapT<=0; if(doSnap) snapT=.5;
    for(const o of NPC){ if(o.hidden && o.a.g.visible){ o.a.g.visible=false; o.col.x=1e9; } if(o.bubble){ o.bubbleT-=dt; if(o.bubbleT<=0){ removeLabel(o.bubble); o.bubble=null; } } if(o.a.g.visible) o.a.mixer.update(dt); if(o.upd) o.upd(dt,T);
      if(o.a.g.visible){ if(o.lie && o.lie.cx!==undefined && BL) BL.poseLie(o); else if(o.water && BL) BL.poseWater(o,T); }
      if(o.drink){ if(DR && DR.list.includes(o.drink)) DR.pose(o.drink,dt); else o.drink=null; }
      if(o.meal){ const ML=W.dining && W.dining.meal; if(ML && ML.list.includes(o.meal)) ML.pose(o.meal,dt); else o.meal=null; }
      /* chốt an toàn: bot đứng yên mà sàn dưới chân lệch (sàn cabin thang đi mất, rơi khỏi mép…) → về mặt đứng thật gần nhất, không lơ lửng / lún */
      if(doSnap && !o.rt && !o.lie && !o.water && !o.hidden && !o.noSnap && o.a.g.visible){ const g=gY(o.x,o.z,o.y); if(Math.abs(g-o.y)>.12){ if(Math.abs(g-o.y)<.5 && !nearLift(o.x,o.z)) o.y=g; else { const sp=findSpot(o.x,o.z,o.y,.4,false); if(sp){ o.x=sp[0]; o.z=sp[1]; o.y=sp[2]; } else o.hidden=true; } put(o); LOG.snap=(LOG.snap||0)+1; } }
      if(o.a.g.visible && o.lines && !o.bubble && Math.hypot(o.x-P.x,o.z-P.z)<5 && Math.abs(o.y-P.y)<3 && R()<dt*.25) say(o, pick(o.lines), 3); } });
  const out={npc:NPC.length, ...LOG}; Object.defineProperty(out,'list',{value:NPC, enumerable:false}); Object.defineProperty(out,'fam',{value:FAM, enumerable:false}); out.famTrip=famTrip; out.gY=gY; out.okPt=okPt; out.nearLift=nearLift; Object.defineProperty(out,'BL',{value:BL, enumerable:false}); console.info('[Bot Abyssal]', JSON.stringify(out)); return out;
}
