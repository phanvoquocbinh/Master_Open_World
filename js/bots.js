// QC World – cộng đồng bot: mỗi bot có nghề, tự đi làm, nghỉ ngơi, nói chuyện
import { makeNav } from './nav.js';
import { makePoser } from './pose.js';
export function makeBots(W, city, life){
  const {THREE, scene, mesh, box, MAT, colorMat, makeActor, makeLabel, removeLabel, clipOf, borrow, MODELS, groundAt, resolve,
         lerpAngle, rnd, P, INTER, CITY, ROAD, burst, toast, circles} = W;
  const SOL=MODELS.soldier, MIC=MODELS.michelle, XB=MODELS.xbot, RB=MODELS.robot;
  const bots=[];
  const samba=clipOf(MIC,'SambaDance');
  const CLIPS={
    soldier:()=>({gl:SOL, h:1.76, face:Math.PI, clips:{idle:clipOf(SOL,'Idle'), walk:clipOf(SOL,'Walk'), run:clipOf(SOL,'Run')}}),
    xbot:   ()=>({gl:XB, h:1.78, face:0, clips:{idle:clipOf(XB,'idle'), walk:clipOf(XB,'walk'), run:clipOf(XB,'run'), agree:clipOf(XB,'agree')}}),
    michelle:()=>({gl:MIC, h:1.66, face:0, clips:{idle:samba&&THREE.AnimationUtils.subclip(samba,'idle',0,2,30), dance:samba}}),   // Michelle không có bước đi gốc → chỉ đứng/nhảy
    person: (o={})=>W.people ? W.people.kit(o.seed ?? [...(o.name||'x')].reduce((h,c)=>(h*31+c.codePointAt(0))>>>0,7), {outfit:o.outfit}) : CLIPS.soldier(),
    robot:  ()=>({gl:RB, h:1.4, face:0, clips:{idle:clipOf(RB,'Idle'), walk:clipOf(RB,'Walking'), run:clipOf(RB,'Running'), dance:clipOf(RB,'Dance'), wave:clipOf(RB,'Wave'), yes:clipOf(RB,'Yes')}}),
  };

  /* ---------- đồ nghề cầm tay ---------- */
  const PROPS={
    broom:()=>{ const g=new THREE.Group(); mesh(new THREE.CylinderGeometry(.02,.02,1.3,6), MAT.wood, 0,-.2,0, g); const h=mesh(box(.28,.12,.06), colorMat(0xc9a35a), 0,-.88,0, g); h.rotation.x=.2; return g; },
    can:()=>{ const g=new THREE.Group(); mesh(new THREE.CylinderGeometry(.1,.12,.22,12), colorMat(0x2e8f47,{metalness:.4,roughness:.4}), 0,-.12,.05, g); const sp=mesh(new THREE.CylinderGeometry(.015,.02,.26,6), colorMat(0x2e8f47), 0,-.08,.2, g); sp.rotation.x=1.1; return g; },
    rod:()=>{ const g=new THREE.Group(); const r=mesh(new THREE.CylinderGeometry(.01,.018,2.2,6), MAT.black, 0,.3,.6, g); r.rotation.x=1.0; return g; },
    tray:()=>{ const g=new THREE.Group(); mesh(new THREE.CylinderGeometry(.18,.18,.02,16), MAT.metal, 0,0,.15, g); mesh(new THREE.CylinderGeometry(.06,.05,.08,12), MAT.white, 0,.05,.15, g); return g; },
    clipboard:()=>{ const g=new THREE.Group(); mesh(box(.22,.3,.02), MAT.wood, 0,0,.1, g); mesh(box(.18,.24,.005), MAT.white, 0,0,.112, g); return g; },
  };
  function attach(a, kind){ let hand=null; a.g.traverse(o=>{ if(o.isBone && !hand && /RightHand$|HandR$/.test(o.name)) hand=o; });
    if(!hand) return null; const p=PROPS[kind](); const ws=new THREE.Vector3(); hand.getWorldScale(ws); p.scale.setScalar(1/ws.x); hand.add(p); return p; }

  /* ---------- lời thoại ---------- */
  function say(b, text, sec=3.2){ if(b.bubble){ removeLabel(b.bubble); b.bubble=null; }
    b.bubble=makeLabel(text, null, {fs:38, h:.26, follow:b.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:30}); b.bubbleT=sec; }

  /* ---------- tạo bot ---------- */
  function spawn(name, model, job, x, z, extra={}){
    const c=CLIPS[model]({...extra, name}); if(!c.gl) return null;
    const a=makeActor(c.gl, {name, height:c.h, face:c.face, dot:extra.dot||'#9fb3c8', clips:c.clips, compact:c.compact});
    if(c.look && c.look.width){ a.root.scale.x*=c.look.width; a.root.scale.z*=c.look.width; }
    a.g.position.set(x, groundAt(x,z), z);
    const anchor=new THREE.Object3D(); anchor.position.y=c.h+.75; a.g.add(anchor);
    const col={x, z, r:.35}; circles.push(col);
    if(W.QUAL==='low') a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });   // máy yếu: bot không đổ bóng
    const b={name, job, a, x, z, h:0, col, anchor, state:'idle', t:rnd()*3, target:null, prop:null, speed:extra.speed||1.35, home:{x,z}, ...extra};
    col.owner=b; if(extra.prop) b.prop=attach(a, extra.prop);
    bots.push(b); return b;
  }
  // đi tới điểm (x,z) theo đường A* trên bản đồ lưới; trả về true khi tới
  const nav=makeNav(W);
  function goTo(b, x, z, dt, run=false){
    const dx=x-b.x, dz=z-b.z, d=Math.hypot(dx,dz);
    if(d<.45){ b.route=null; return true; }
    if(!b.route || b.route.tx!==x || b.route.tz!==z || b.route.redo){
      const pts=nav.built ? nav.find(b.x,b.z,x,z) : null;
      b.route={tx:x, tz:z, pts:pts||[[x,z]], i:0, t:0, best:d}; }
    const R=b.route; let [wx,wz]=R.pts[R.i], wdx=wx-b.x, wdz=wz-b.z, wd=Math.hypot(wdx,wdz);
    if(wd<.6 && R.i<R.pts.length-1){ R.i++; [wx,wz]=R.pts[R.i]; wdx=wx-b.x; wdz=wz-b.z; wd=Math.hypot(wdx,wdz); }
    const sp=(run?3.4:b.speed), step=Math.min(wd, sp*dt);
    const p={x:b.x+wdx/Math.max(wd,1e-4)*step, z:b.z+wdz/Math.max(wd,1e-4)*step, self:b.col};
    if(W.traffic && !W.traffic.mayStep(b.x,b.z,p.x,p.z)){ R.t=0; b.a.play('idle'); return false; }   // S9: đứng ở lề chờ đèn đi bộ xanh
    resolve(p, .35, true);
    const mx=p.x-b.x, mz=p.z-b.z, moved=Math.hypot(mx,mz);
    // kẹt (không tiến gần đích) → tìm đường lại; kẹt nhiều lần → nhích sang điểm kế tiếp
    R.t+=dt; if(d<R.best-.25){ R.best=d; R.t=0; }
    if(R.t>1.5){ R.redo=true; b.stuckN=(b.stuckN||0)+1; if(b.stuckN>2 && nav.ok(wx,wz)){ p.x=wx; p.z=wz; b.stuckN=0; } }
    b.x=p.x; b.z=p.z;
    const walking=moved>sp*dt*.25;
    if(walking) b.h=lerpAngle(b.h, Math.atan2(mx,mz), 1-Math.exp(-dt*9));   // quay mặt theo hướng đi THẬT
    b.a.play(walking ? (run?'run':'walk') : 'idle');
    return false;
  }
  function face(b, x, z, dt){ b.h=lerpAngle(b.h, Math.atan2(x-b.x, z-b.z), 1-Math.exp(-dt*5)); }
  const near=(b,x,z,r)=>Math.hypot(b.x-x,b.z-z)<r;

  /* ---------- công việc ---------- */
  const JOBS={
    // quét rác: tìm rác gần nhất → quét → nhặt
    sweeper(b, dt){
      if(b.state==='rest'){ b.t-=dt; b.a.play('idle'); if(b.t<=0) b.state='idle'; return; }
      if(!b.target || !life.trash.includes(b.target)){ b.target=null;
        let best=null, bd=1e9; for(const t of life.trash){ if(t.claim && t.claim!==b) continue; const d=Math.hypot(t.x-b.x,t.z-b.z); if(d<bd){ bd=d; best=t; } }
        if(best){ best.claim=b; b.target=best; b.state='go'; } else { b.state='rest'; b.t=5+rnd()*5; if(rnd()<.3) say(b,'Sạch bong rồi! 🧹'); return; } }
      const t=b.target;
      if(b.state==='go'){ if(goTo(b,t.x,t.z,dt)){ b.state='work'; b.t=2.4; } }
      else if(b.state==='work'){ b.a.play('idle'); face(b,t.x,t.z,dt); b.t-=dt; if(b.prop) b.prop.rotation.z=Math.sin(W.T*9)*.5;
        if(b.t<=0){ life.removeTrash(t); b.target=null; b.state='idle'; if(b.prop) b.prop.rotation.z=0; if(rnd()<.35) say(b, ['Xả rác là bug đó nha! 🐞','Thêm một cái nữa…','Đảo đẹp nhờ mọi người ❤️'][Math.floor(rnd()*3)]); } }
      else b.state='idle';
    },
    // làm vườn: bồn hoa khô nhất → tưới
    gardener(b, dt){
      if(b.state==='rest'){ b.t-=dt; b.a.play('idle'); if(b.t<=0) b.state='idle'; return; }
      if(!b.target){ let best=null; for(const bed of city.beds){ if(bed.claimed && bed.claimed!==b) continue; if(bed.water<.55 && (!best || bed.water<best.water)) best=bed; }
        if(best){ best.claimed=b; b.target=best; b.state='go'; } else { b.state='rest'; b.t=6+rnd()*6; if(rnd()<.3) say(b,'Hoa nở đẹp quá 🌸'); return; } }
      const bed=b.target;
      if(b.state==='go'){ const s=bedSpot(bed); if(goTo(b,s.x,s.z,dt)){ b.state='work'; b.t=3.2; } }
      else if(b.state==='work'){ b.a.play('idle'); face(b,bed.x,bed.z,dt); b.t-=dt; if(b.prop) b.prop.rotation.x=.5;
        if(Math.random()<dt*14) burst(new THREE.Vector3(bed.x+(Math.random()-.5)*1.6, .9, bed.z+(Math.random()-.5)*.6), [0x8fd3ff,0xffffff], 6, .8, .5, -9, .06);
        if(b.t<=0){ life.waterBed(bed); bed.claimed=null; b.target=null; b.state='idle'; if(b.prop) b.prop.rotation.x=0; } }
      else b.state='idle';
    },
    // câu cá ở cuối cầu tàu
    fisher(b, dt){
      const s=city.spots.fish, spot={x:s.x+.9, z:s.z+.5};
      if(b.state==='idle'){ b.state='go'; }
      if(b.state==='go'){ if(goTo(b,spot.x,spot.z,dt)){ b.state='fish'; b.t=14+rnd()*16; } }
      else if(b.state==='fish'){ b.a.play('idle'); face(b, spot.x, spot.z-5, dt); b.t-=dt;
        if(b.t<=0){ burst(new THREE.Vector3(spot.x, W.WATER_Y+.1, spot.z-4), [0xffffff,0xcfefff], 30, 2, .9, -6, .12); say(b, rnd()<.7?'Dính một con cá thu! 🐟':'Hụt rồi… 😅'); b.state='fish'; b.t=16+rnd()*18; b.catches=(b.catches||0)+1;
          if(b.catches>=3){ b.catches=0; b.state='sell'; } } }
      else if(b.state==='sell'){ const sh=city.shop; if(goTo(b, sh.tx, sh.tz, dt)){ say(b,'Bán cá cho Chợ QC đây!'); b.state='back'; b.t=3; } }
      else if(b.state==='back'){ b.t-=dt; b.a.play('idle'); if(b.t<=0) b.state='go'; }
    },
    // bán hàng: đứng trước quầy, chào khách
    clerk(b, dt){
      const s=b.post; if(!near(b,s.x,s.z,.5)){ goTo(b,s.x,s.z,dt); return; }
      face(b, s.lx, s.lz, dt);
      if(near(b,P.x,P.z,4)){ if(!b.greeted){ b.greeted=true; say(b, b.greet||'Xin chào! Mời vào xem hàng 😊'); b.a.play(b.a.acts.wave?'wave':'agree'); b.t=2.2; } }
      else b.greeted=false;
      b.t-=dt; if(b.t<=0) b.a.play('idle');
    },
    // bảo vệ: tuần tra vòng đường
    guard(b, dt){
      if(b.wp===undefined) b.wp=Math.floor(rnd()*24);
      const a=b.wp/24*Math.PI*2, r=ROAD.r+ROAD.w/2+2.2, x=Math.cos(a)*r, z=Math.sin(a)*r;
      if(b.state==='pause'){ b.t-=dt; b.a.play('idle'); if(b.t<=0) b.state='walk'; return; }
      if(goTo(b,x,z,dt)){ b.wp=(b.wp+1)%24; if(rnd()<.12){ b.state='pause'; b.t=4; say(b, ['Khu vực an toàn ✅','Nhớ khoá xe nha!','Chào buổi '+(W.night>.5?'tối':'sáng')+'!'][Math.floor(rnd()*3)]); } }
    },
    // chạy bộ quanh vành đai
    jogger(b, dt){
      if(b.wp===undefined) b.wp=0;
      const a=-b.wp/36*Math.PI*2, r=ROAD.r+ROAD.w/2+.9, x=Math.cos(a)*r, z=Math.sin(a)*r;
      if(goTo(b,x,z,dt,true)) b.wp=(b.wp+1)%36;
    },
    // khách ăn uống: đi tới quán/ghế, ngồi nghỉ, đi dạo
    walker(b, dt){
      if(b.state==='idle'){
        const opts=[]; for(const r of life.restaurants()) opts.push({x:r.tx, z:r.tz, kind:'eat'});
        for(const be of city.benches) if(!be.taken) opts.push({x:be.x, z:be.z, kind:'bench', be});
        opts.push({x:city.academy.tx, z:city.academy.tz, kind:'study'}); opts.push({x:city.shop.tx, z:city.shop.tz, kind:'shop'});
        const o=opts[Math.floor(rnd()*opts.length)]; b.target=o; if(o.be) o.be.taken=b; b.state='go';
      }
      if(b.state==='go'){ const o=b.target; if(goTo(b,o.x,o.z,dt)){ b.state='stay'; b.t=10+rnd()*14;
          say(b, {eat:'Món này ngon thật! 🍜', bench:'Nghỉ chân chút…', study:'Ôn ISTQB thôi 📘', shop:'Mua ít mồi câu nào 🪱'}[o.kind]); } }
      else if(b.state==='stay'){ b.t-=dt; b.a.play(b.target.kind==='study'&&b.a.acts.agree?'agree':'idle'); if(b.t<=0){ if(b.target.be) b.target.be.taken=null; b.state='idle'; } }
    },
    // dân phố: đi dạo giữa cửa các toà công ty, ghế đá, các chỗ ở Phường Khởi Nghiệp
    citizen(b, dt){
      if(b.state==='idle'){ const T=(W.life&&W.life.downtown&&W.life.downtown.towers)||[], P=W.CITY&&W.CITY.places||{};
        const opts=[...T.filter(t=>t.door).map(t=>({x:t.door.x, z:t.door.z+(t.face>0?2.6:-2.6)})), ...Object.values(P).filter(p=>p&&p.x>60).map(p=>({x:p.x, z:p.z+4}))];
        if(!opts.length){ JOBS.walker(b, dt); return; } b.target=opts[Math.floor(rnd()*opts.length)]; b.state='go'; }
      if(b.state==='go'){ if(goTo(b, b.target.x, b.target.z, dt)){ b.state='stay'; b.t=4+rnd()*8; if(rnd()<.35) say(b, ['Hôm nay trời đẹp ghê ☀️','Đi phỏng vấn thử xem sao…','Công ty này có pantry free cà phê đó!','Lương tháng này về rồi 💰','Tối nay đi ăn lẩu không?'][Math.floor(rnd()*5)]); } }
      else if(b.state==='stay'){ b.t-=dt; b.a.play('idle'); if(b.t<=0) b.state='idle'; }
    },
    // nhảy ở sân khấu khi có nhạc, không thì đi dạo
    fan(b, dt){
      if(W.music.playing){ const s=b.danceSpot; if(goTo(b,s.x,s.z,dt)){ face(b,0,-32,dt); if(b.a.acts.dance) b.a.play('dance'); else { b.a.play('idle'); b.procDance=true; } } return; }
      JOBS.walker(b, dt);
    },
  };
  function bedSpot(bed){ const dx=bed.x, dz=bed.z, d=Math.hypot(dx,dz)||1; return {x:bed.x-dx/d*1.6, z:bed.z-dz/d*1.6}; }

  /* ---------- dân cư ---------- */
  const sh=city.shop, so=city.showroom, lo=city.landOffice;
  spawn('Bác Ba · quét rác', 'person', 'sweeper', 8, 12, {prop:'broom', dot:'#ffb547', seed:W.people&&W.people.pickSeed(L=>!L.female,3), outfit:{shirt:0xff7b29, pants:0x1f2a44, style:'cap'}});
  spawn('Cô Út · quét rác', 'robot', 'sweeper', -30, 30, {prop:'broom', dot:'#ffb547'});
  spawn('Cô Lan · làm vườn', 'person', 'gardener', -9, 9, {prop:'can', dot:'#46d39a', seed:W.people&&W.people.pickSeed(L=>L.female,4), outfit:{shirt:0x46a36b, pants:0x5a3c27}});
  spawn('Chú Sáu · làm vườn', 'person', 'gardener', 20, 50, {prop:'can', dot:'#46d39a', seed:W.people&&W.people.pickSeed(L=>!L.female,5), outfit:{shirt:0x2e4a3a, style:'cap'}});
  spawn('Anh Tư · ngư dân', 'person', 'fisher', 2, -60, {prop:'rod', dot:'#4fc3ff', seed:W.people&&W.people.pickSeed(L=>!L.female,6), outfit:{shirt:0x2f6fd0, shorts:true, long:false}});
  spawn('Chị Hoa · bán hàng', 'person', 'clerk', sh.tx, sh.tz, {post:{x:sh.tx+sh.f[0]*-.8, z:sh.tz+sh.f[1]*-.8, lx:sh.tx+sh.f[0]*5, lz:sh.tz+sh.f[1]*5}, greet:'Chợ QC xin chào! Có mồi câu, vé thuyền nè 🛒', dot:'#ff8fc2', seed:W.people&&W.people.pickSeed(L=>L.female,7), outfit:{shirt:0xd94848}});
  spawn('Anh Khoa · tư vấn xe', 'person', 'clerk', so.tx, so.tz, {post:{x:so.tx+so.f[0]*-.6+so.f[1]*2, z:so.tz+so.f[1]*-.6-so.f[0]*2, lx:so.tx+so.f[0]*5, lz:so.tz+so.f[1]*5}, greet:'Xe máy, ô tô đời mới đây anh/chị ơi! 🏍️', dot:'#c77dff', seed:W.people&&W.people.pickSeed(L=>!L.female,8), outfit:{shirt:0xffffff, pants:0x1f2a44, long:true}});
  spawn('Cô Mai · địa chính', 'person', 'clerk', lo.tx, lo.tz, {post:{x:lo.tx+lo.f[0]*-.6, z:lo.tz+lo.f[1]*-.6, lx:lo.tx+lo.f[0]*5, lz:lo.tz+lo.f[1]*5}, greet:'Đất đẹp, giá tốt, sổ đỏ có ngay 📜', dot:'#ffd23f', seed:W.people&&W.people.pickSeed(L=>L.female,9), outfit:{shirt:0xf2c230, long:true}});
  spawn('Bảo vệ Hùng', 'person', 'guard', 45, 0, {dot:'#9fb3c8', speed:1.2, seed:W.people&&W.people.pickSeed(L=>!L.female,11), outfit:{shirt:0x1f2a44, pants:0x1f2a44, long:true, style:'cap'}});
  spawn('Minh · chạy bộ', 'person', 'jogger', 47, 4, {dot:'#ff7b29', seed:W.people&&W.people.pickSeed(L=>!L.female,10), outfit:{shirt:0xff7b29, shorts:true, long:false, shoe:0xffffff}});
  spawn('Thảo · Automation', 'robot', 'walker', -12, -10, {dot:'#7aa2ff'});
  spawn('Long · API tester', 'person', 'walker', 14, 4, {prop:'clipboard', dot:'#7aa2ff'});
  if(W.people) for(const [i,x,z] of [[0,150,20],[1,175,-20],[2,205,30],[3,232,-10],[4,160,86],[5,200,86],[6,240,86],[7,190,52]]){ const sd=W.people.seedFor(i%2?'f':'m', 40+i);
    spawn(`${W.people.nameOf(sd)} · dân phố`, 'person', 'citizen', x, z, {seed:sd, dot:'#c7d2e0'}); }
  const fanSpots=[[-5.5,-21],[5.5,-20.5],[-1,-25.6]];
  spawn('Vy · fan cứng', 'robot', 'fan', -14, -12, {danceSpot:{x:fanSpots[0][0], z:fanSpots[0][1]}, dot:'#ff4f6d'});
  spawn('Đạt · fan cứng', 'robot', 'fan', 14, -12, {danceSpot:{x:fanSpots[1][0], z:fanSpots[1][1]}, dot:'#ff4f6d'});

  /* ---------- cập nhật mỗi khung hình (giới hạn tần suất cho bot ở xa) ---------- */
  let acc=0;
  function update(dt){
    acc+=dt;
    const visR=W.QUAL==='low'?60:90;
    for(const b of bots){
      const dist=Math.hypot(b.x-P.x,b.z-P.z), far=dist>70, vis=dist<visR;
      if(b.a.g.visible!==vis) b.a.g.visible=vis;   // bot ở xa: ẩn hẳn (không vẽ, không chạy animation)
      if(far && Math.random()>.35) continue;        // bot xa: cập nhật thưa để tiết kiệm CPU
      const d = far ? dt/.35 : dt;
      b.procDance=false; try{ JOBS[b.job](b, Math.min(d,.1)); }catch(e){ console.warn(b.name, e); b.state='idle'; }
      b.col.x=b.x; b.col.z=b.z;
      b.a.g.position.set(b.x, groundAt(b.x,b.z), b.z); b.a.g.rotation.y=b.h;
      const seen=vis && b.a.root.visible;   // ngoài khung nhìn (cullActors) → không cần chạy animation
      if(seen) b.a.mixer.update(Math.min(d,.1)+(b.skipT||0)), b.skipT=0; else b.skipT=Math.min(.5,(b.skipT||0)+d); if(seen && b.procDance){ (b.poser ||= makePoser(THREE, b.a)).apply('dance', W.T); }
      if(b.bubble){ b.bubbleT-=d; if(b.bubbleT<=0){ removeLabel(b.bubble); b.bubble=null; } }
    }
  }
  return {bots, update, say, nav};
}
