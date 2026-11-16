// QC World – QUÁN XÁ SỐNG ĐỘNG (S8)
//  • Khách bot đi vào quán → ra quầy gọi nước → mang ly ra bàn ngồi chill
//  • Đi theo CẶP → ngồi chung bàn, nói chuyện qua lại (bong bóng thoại)
//  • Đi MỘT MÌNH → ngồi 1 bàn trống; bạn ngồi xuống chung bàn → bot hỏi thăm bạn (công việc, chỗ ở, khu vui chơi…), nhân vật bạn trả lời
//  • Chỉ chạy khi bạn ở gần quán (≤ 75 m), đi xa thì khách về hết → không tốn CPU ở chỗ khác
// Quán khai báo vào W.CAFES (resort.js, arena.js):
//   {name, center:{x,z}, spawn:{x,z}, order:()=>({x,z,face}), via:(approach, order)=>[[x,z],…], drinks:[…], groups:[{seats:[seat,seat], table:{x,z,y}}], talks:[…], max}
import { makePoser } from './pose.js';

export function makeCafeLife(W){
  const {THREE, scene, makeActor, makeLabel, removeLabel, groundAt, lerpAngle, HOOK, P, me} = W;
  // S19g rà soát 16/11: chân người ngồi – đùi gần ngang, cẳng chân chéo ra trước đủ dài để gót chạm đúng sàn
  // (tư thế 'sit' của pose.js để cẳng chân thẳng đứng → ghế thấp thì bàn chân tọt 10–18 cm xuống sàn, hông đặt thấp thì đùi lún vào đệm)
  const _la=new THREE.Vector3(), _lb=new THREE.Vector3(), _ld=new THREE.Vector3(), _lF=new THREE.Vector3(), _lR=new THREE.Vector3(), _lq=new THREE.Quaternion(), _lp=new THREE.Quaternion(), _lw=new THREE.Quaternion();
  const aimL=(B,C,d)=>{ B.getWorldPosition(_la); C.getWorldPosition(_lb); _lb.sub(_la).normalize(); _lq.setFromUnitVectors(_lb, d); B.getWorldQuaternion(_lw); B.parent.getWorldQuaternion(_lp); _lw.premultiply(_lq); B.quaternion.copy(_lp.invert().multiply(_lw)); B.updateMatrixWorld(true); };
  function legsToFloor(po, g, floorY){ const bn=po && po.bones; if(!bn || !bn.LeftUpLeg) return; g.updateMatrixWorld(true); g.getWorldDirection(_lF); _lF.y=0; if(_lF.lengthSq()<1e-6) return; _lF.normalize(); _lR.set(-_lF.z,0,_lF.x);
    for(const [s,k] of [['Left',-1],['Right',1]]){ const UL=bn[s+'UpLeg'], LG=bn[s+'Leg'], FT=bn[s+'Foot']; if(!UL || !LG || !FT) continue;
      aimL(UL, LG, _ld.copy(_lF).addScaledVector(_lR, k*.06).setY(.03).normalize());
      LG.getWorldPosition(_la); FT.getWorldPosition(_lb); const L2=_la.distanceTo(_lb), drop=Math.min(L2*.98, Math.max(.05, _la.y-(floorY+.09))), fw=Math.sqrt(L2*L2-drop*drop);
      aimL(LG, FT, _ld.copy(_lF).multiplyScalar(fw).setY(-drop).normalize()); const TO=bn[s+'ToeBase']; if(TO) aimL(FT, TO, _ld.copy(_lF).setY(-.5).normalize()); } }
  const CAFES=W.CAFES||[];
  if(!W.people || !CAFES.length) return null;
  const R=Math.random, pick=a=>a[Math.floor(R()*a.length)], rr=(a,b)=>a+R()*(b-a);
  const myName=()=>(W.PROFILE && W.PROFILE.name) || 'bạn';
  const S=()=>(W.life && W.life.S) || {};

  /* ---------- lời thoại ---------- */
  const PAIR_TALKS=[
    [[0,'Sprint này team bà nhiều bug không?'],[1,'Hơn 20 cái, toàn bug giao diện thôi.'],[0,'Vậy còn đỡ, bên tui dính bug thanh toán 😵'],[1,'Thôi uống nước đã, mai tính!']],
    [[1,'Cuối tuần đi concert ở khu Giải trí không?'],[0,'Đi chứ! Nghe nói có laser với DJ.'],[1,'Chốt nha, tui mua vé trước 🎤']],
    [[0,'Ông thi ISTQB chưa?'],[1,'Tháng sau thi, đang ôn ở Học viện QA.'],[0,'Đậu rồi bao tui ly sinh tố nha 😄']],
    [[0,'Hôm qua deploy lúc 11 giờ đêm…'],[1,'Lại hotfix hả? Tội ghê.'],[0,'May mà test kỹ, không phải rollback.'],[1,'QC mình là lá chắn cuối mà 💪']],
    [[1,'Ông lên Phố cổ Riverside chưa?'],[0,'Rồi, tối có đèn lồng đẹp lắm 🏮'],[1,'Cuối tuần lên đó chụp hình mới được.']],
    [[0,'Tối nay xem bóng không? QC FC đá với Bug United.'],[1,'Xem! Mong QC FC thắng đậm ⚽'],[0,'Bug United thủ yếu lắm, chắc thắng 😎']],
    [[1,'Đồ uống ở đây ngon thật.'],[0,'Ngon hơn quán gần công ty nhiều.'],[1,'Lần sau rủ cả team ra đây họp luôn 😂']],
    [[0,'Dạo này bà viết automation chưa?'],[1,'Đang tập Playwright, vui mà khó.'],[0,'Cố lên, chạy được rồi đỡ test tay lắm.']],
  ];
  const SOLO_LINES=['Chill thật sự…','Ly này ngon ghê 😋','Nghỉ xíu rồi về làm tiếp.','Ước gì ngày nào cũng được ra đây.','Để coi hôm nay có ticket gì mới…'];
  const ASKS=[
    ['Bạn đang làm ở đâu vậy?', ()=>{ const j=S().work && S().work.job; return j ? `Mình làm ${j.role||'QA'} ở ${j.company} đó.` : 'Mình đang tìm việc, chắc mai đi phỏng vấn ở Downtown 😅'; }],
    ['Dạo này test có nhiều bug không?', ()=>pick(['Nhiều lắm, mà bắt được hết 😎','Cũng vừa, toàn bug nhỏ thôi.','Sprint này căng lắm bạn ơi…'])],
    ['Bạn ở khu nào vậy?', ()=>{ const h=S().home; return h && h!=='tro' ? 'Mình có nhà riêng ở Phường Khởi Nghiệp 🏠' : 'Mình ở phòng trọ khởi nghiệp, đang để dành mua nhà!'; }],
    ['Đi khu Giải trí chưa? Concert vui lắm!', ()=>pick(['Chưa, để lát mình qua xem 🎤','Rồi, laser đẹp mê luôn!','Mình thích xem bóng hơn ⚽'])],
    ['Bạn hay uống gì?', ()=>pick(['Cà phê sữa đá, có cà phê mới test nổi ☕','Nước dừa, mát lắm 🥥','Sinh tố dâu, ngọt ngọt dễ chịu 🍓'])],
    ['Bạn có giỏi SQL không?', ()=>pick(['Cũng tạm, JOIN thì được 😄','Ra Hầm Database luyện suốt đó!'])],
    ['Có mẹo nào viết test case nhanh không?', ()=>pick(['Phân vùng tương đương + giá trị biên là nhanh nhất!','Cứ nghĩ như người dùng đang phá app là ra 😆'])],
    ['Cuối tuần bạn hay đi đâu chơi?', ()=>pick(['Lên Cao nguyên ngắm thác 🏞️','Ra biển câu cá thư giãn 🎣','Ở nhà ngủ bù thôi 😴'])],
  ];

  /* ---------- bong bóng thoại ---------- */
  function say(o, text, sec=3.4){ if(o.bubble){ removeLabel(o.bubble); o.bubble=null; }
    o.bubble=makeLabel(text, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:30}); o.bubbleT=sec; }
  const meTalk={anchor:new THREE.Object3D(), bubble:null, bubbleT:0}; meTalk.anchor.position.y=(me.h||1.75)+.75; me.g.add(meTalk.anchor);

  /* ---------- ly nước trên bàn ---------- */
  const cupGeo=new THREE.CylinderGeometry(.045,.035,.13,10), strawGeo=new THREE.CylinderGeometry(.006,.006,.16,4);
  const cupMats=[0xf6e7c8,0x6b3e26,0xff6b8a,0xffb347,0xd9f2e6].map(c=>new THREE.MeshStandardMaterial({color:c, roughness:.35})), strawMat=new THREE.MeshStandardMaterial({color:0xff4f6d});
  function makeCup(seat, table){ const g=new THREE.Group(), x=seat.x+(table.x-seat.x)*.55, z=seat.z+(table.z-seat.z)*.55;
    const c=new THREE.Mesh(cupGeo, pick(cupMats)); c.position.y=.065; g.add(c); const s=new THREE.Mesh(strawGeo, strawMat); s.position.set(.012,.15,0); s.rotation.z=.25; g.add(s);
    g.position.set(x, table.y, z); g.userData.dynamic=true; scene.add(g); return g; }

  /* ---------- khách ---------- */
  function makeGuest(){ const seed=1000+Math.floor(R()*90000), k=W.people.kit(seed, {}), name=W.people.nameOf(seed);
    const a=makeActor(k.gl, {name:`${name} · Khách`, height:k.h, face:0, clips:k.clips, compact:false, dot:'#ffb547'});
    if(k.look && k.look.width){ a.root.scale.x*=k.look.width; a.root.scale.z*=k.look.width; }
    a.play('idle',0); a.mixer.update(0); const poser=makePoser(THREE, a), hipsH=poser.hipsHeight();
    const anchor=new THREE.Object3D(); anchor.position.y=k.h+.75; a.g.add(anchor);
    return {a, poser, hipsH, anchor, name, x:0, z:0, h:0, path:[], next:null, state:'walk', t:0, bubble:null, bubbleT:0}; }
  function removeGuest(b){ if(b.bubble){ removeLabel(b.bubble); b.bubble=null; } if(b.cup){ scene.remove(b.cup); b.cup=null; }
    if(b.seat && b.seat.taken===b) b.seat.taken=null; if(b.a.label) removeLabel(b.a.label); if(b.a.g.parent) b.a.g.parent.remove(b.a.g); }
  const approachOf=s=>({x:s.x-Math.sin(s.rot)*.6, z:s.z-Math.cos(s.rot)*.6});   // tới ghế từ phía sau lưng ghế

  function sitDown(b){ const s=b.seat; b.state='sit'; b.t=0; b.x=s.x; b.z=s.z; b.h=s.rot; b.cup=makeCup(s, b.group.table); b.a.play('idle',.3); }
  function startLeave(b, C){ if(b.state==='leave') return; const ap=approachOf(b.seat); if(b.cup){ scene.remove(b.cup); b.cup=null; }
    if(b.seat.taken===b) b.seat.taken=null; b.state='walk'; b.x=ap.x; b.z=ap.z;
    b.path=[...C.via(ap, b.ord).reverse(), ...(C.exit||[]), [C.spawn.x+rr(-2,2), C.spawn.z+rr(-2,2)]]; b.next=()=>{ b.gone=true; }; }

  // nhóm khách: 1 hoặc 2 người, giữ trước bàn (mọi ghế của bàn đang trống) – khách đi 1 mình chừa ghế cho bạn ngồi chung
  function spawnGroup(C, seated){
    const free=C.groups.filter(g=>g.seats.length>=2 && g.seats.every(s=>!s.taken)); if(!free.length) return;
    const grp=pick(free), pair=R()<.6, n=pair?2:1, ord=C.order(), drink=pick(C.drinks), G={cafe:C, grp, guests:[], pair, talkI:-1, line:0, talkT:rr(2,5), stay:rr(80,150), joined:false, askI:0, asks:null, chatT:0};
    const seats=pair ? grp.seats.slice(0,2) : [grp.seats[R()<.5?0:1]];
    seats.forEach((s,i)=>{ const b=makeGuest(); b.seat=s; b.group=grp; b.G=G; b.ord=ord; s.taken=b; G.guests.push(b);
      if(seated){ sitDown(b); return; }
      b.x=C.spawn.x+rr(-1.5,1.5)+i*.8; b.z=C.spawn.z+rr(-1.5,1.5); b.delay=i*.9;
      const side=[-Math.cos(ord.face), Math.sin(ord.face)], ox=ord.x+side[0]*(i?.85:0), oz=ord.z+side[1]*(i?.85:0);
      b.path=[...(C.entry||[]).map(p=>[p[0]+(i?.5:0),p[1]]), [ox,oz]]; b.next=()=>{ b.state='order'; b.t=0; b.h=ord.face;
        if(i===0) say(b, pair ? `Cho 2 ly ${drink} nha!` : `Cho mình 1 ly ${drink}!`, 2.6); }; });
    C.live.push(G); }

  function guestStep(b, dt){ const wp=b.path[0]; if(!wp){ if(b.next){ const f=b.next; b.next=null; f(); } return; }
    const dx=wp[0]-b.x, dz=wp[1]-b.z, d=Math.hypot(dx,dz), sp=1.35*dt;
    if(d<=sp){ b.x=wp[0]; b.z=wp[1]; b.path.shift(); } else { b.x+=dx/d*sp; b.z+=dz/d*sp; }
    if(d>.05) b.h=lerpAngle(b.h, Math.atan2(dx,dz), 1-Math.exp(-dt*9)); }

  function updGuest(b, dt, T){ const a=b.a;
    if(b.bubble){ b.bubbleT-=dt; if(b.bubbleT<=0){ removeLabel(b.bubble); b.bubble=null; } }
    if(b.delay>0){ b.delay-=dt; a.play('idle'); }
    else if(b.state==='walk'){ guestStep(b, dt); a.play(b.path.length?'walk':'idle'); }
    else if(b.state==='order'){ b.t+=dt; a.play('idle'); b.h=lerpAngle(b.h, b.ord.face, 1-Math.exp(-dt*6));
      if(b.t>3.2){ if(b===b.G.guests[0]) say(b, 'Cảm ơn nha! 😊', 1.8); const ap=approachOf(b.seat); b.state='walk'; b.path=[...b.cafe_via(ap), [ap.x, ap.z]]; b.next=()=>sitDown(b); } }
    if(b.state==='sit'){ a.g.position.set(b.seat.x, b.seat.y+.12-b.hipsH, b.seat.z); a.g.rotation.set(0, b.seat.rot, 0); }   // S19g: +0,12 (trước +0,04 → đùi lún 13–23 cm vào đệm)
    else { a.g.position.set(b.x, groundAt(b.x,b.z), b.z); a.g.rotation.set(0, b.h, 0); }
    if(a.root.visible){ a.mixer.update(dt); if(b.state==='sit'){ b.poser.apply(b.G && b.G.cafe.eat ? 'eat' : 'sit', T); legsToFloor(b.poser, a.g, b.seat.floor ?? groundAt(b.seat.x, b.seat.z)); } } }

  // nói chuyện trong nhóm
  function updTalk(G, dt){ const C=G.cafe, gs=G.guests, sat=gs.every(b=>b.state==='sit'); if(!sat) return;
    const meHere=G.grp.seats.some(s=>s.taken==='me');
    if(!G.pair){ const b=gs[0];
      if(meHere && !G.joined){ G.joined=true; G.asks=[...ASKS].sort(()=>R()-.5).slice(0,4); G.askI=0; G.chatT=4.6; G.stay=Math.max(G.stay, 30);
        say(b, `Chào ${myName()}! Ngồi chung bàn nha 😄`, 3); setTimeout(()=>{ if(G.joined) say(meTalk, 'Chào bạn! Cho mình ngồi chung với nha.', 3); }, 2000); return; }
      if(!meHere && G.joined){ G.joined=false; say(b, `Hẹn gặp lại nha ${myName()}! 👋`, 3); G.stay=Math.min(G.stay, 25); return; }
      if(G.joined){ G.chatT-=dt; G.stay=Math.max(G.stay, 20); if(G.chatT>0) return;
        if(G.askI<G.asks.length){ const [q, ans]=G.asks[G.askI++]; say(b, q, 3.6); G.chatT=6.2; setTimeout(()=>{ if(G.joined) say(meTalk, ans(), 3.8); }, 2300); }
        else { say(b, pick(['Nói chuyện với bạn vui ghê 😄','Có gì cần cứ hỏi mình nha!','Ngồi đây ngắm cảnh đã thật.']), 3.2); G.chatT=rr(14,22); }
        return; }
      G.talkT-=dt; if(G.talkT<=0){ say(b, pick(SOLO_LINES), 3); G.talkT=rr(14,26); } return; }
    G.talkT-=dt; if(G.talkT>0) return;
    const pool=C.talks ? PAIR_TALKS.concat(C.talks) : PAIR_TALKS;
    if(G.talkI<0 || G.line>=pool[G.talkI].length){ if(G.talkI>=0){ G.talkI=-1; G.talkT=rr(7,12); return; } G.talkI=Math.floor(R()*pool.length); G.line=0; }
    const [who, text]=pool[G.talkI][G.line++]; say(gs[who], text, 3.6); G.talkT=rr(3.8,4.8); }

  /* ---------- vòng đời mỗi quán ---------- */
  for(const C of CAFES){ C.live=[]; C.active=false; C.spawnT=0; C.max=C.max||3; }
  const viaFor=(C,b)=>ap=>C.via(ap, b.ord);
  let acc=0;
  HOOK.onFrame.push((dt, T)=>{
    if(meTalk.bubble){ meTalk.bubbleT-=dt; if(meTalk.bubbleT<=0){ removeLabel(meTalk.bubble); meTalk.bubble=null; } }
    acc+=dt; const check=acc>.5; if(check) acc=0;
    for(const C of CAFES){
      if(check){ const d=W.inside ? 1e9 : Math.hypot(P.x-C.center.x, P.z-C.center.z);
        if(!C.active && d<(C.near||75)){ C.active=true; C.spawnT=rr(6,12); spawnGroup(C, true); if(R()<.8) spawnGroup(C, true); }   // tới nơi đã có khách ngồi sẵn
        else if(C.active && d>(C.near||75)+20){ C.active=false; for(const G of C.live) for(const b of G.guests) removeGuest(b); C.live.length=0; } }
      if(!C.active) continue;
      C.spawnT-=dt; if(C.spawnT<=0){ C.spawnT=rr(16,32); if(C.live.length<C.max) spawnGroup(C, false); }
      for(let i=C.live.length-1;i>=0;i--){ const G=C.live[i];
        for(const b of G.guests){ if(!b.cafe_via) b.cafe_via=viaFor(C,b); updGuest(b, dt, T); }
        updTalk(G, dt);
        if(G.guests.every(b=>b.state==='sit')){ G.stay-=dt; if(G.stay<=0 && !G.joined) G.guests.forEach(b=>startLeave(b, C)); }
        if(G.guests.every(b=>b.gone)){ G.guests.forEach(removeGuest); C.live.splice(i,1); } } }
  });
  return {cafes:CAFES};
}
