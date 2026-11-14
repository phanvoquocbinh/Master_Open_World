// QC World – S17: NGƯỜI TRÊN PHỐ ĐỦ KIỂU
//  🎧 Người đeo tai nghe đi dọc vỉa hè, thỉnh thoảng dừng lại nhún nhảy theo nhạc
//  🦸 Nhóm cosplay ở cổng Công viên Trung tâm (trang phục thiết kế riêng: Siêu anh hùng Áo Choàng Đỏ, Phi hành gia Bug Hunter,
//     Hiệp sĩ Test Case, Ninja Regression) – E để chụp ảnh cùng
//  🎸 Ban nhạc rock dạo: đi một đoạn vỉa hè rồi dừng lại dựng trống, chơi 1 bài (nhạc tự tạo WebAudio, nghe to dần khi lại gần),
//     người đi đường đứng xem – E để ủng hộ tiền
//  🎩 Ảo thuật gia đường phố ở Phố ẩm thực Đồi QC: bóng bay lơ lửng, bài bay vòng, pháo sáng – E để ủng hộ tiền
import { makePoser } from './pose.js';

export function makeStreetLife(W, ctx){
  const {S, save, askPay, spend, fmt} = ctx;
  const {THREE, scene, P, HOOK, INTER, PLACES, toast, circles, makeActor, makeLabel, removeLabel, groundAt, lerpAngle, burst, teleport} = W;
  if(!W.people) return null;
  const R=Math.random, TAU=Math.PI*2, pick=a=>a[Math.floor(R()*a.length)];
  const sm=(c,r=.6,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  function person(seed, outfit, name, dot){ const kk=W.people.kit(seed,{outfit}); const a=makeActor(kk.gl,{name, height:kk.h, face:0, clips:kk.clips, compact:false, dot:dot||'#ffb547'}); a.play('idle',0); a.mixer.update(0);
    const anchor=new THREE.Object3D(); anchor.position.y=kk.h+.75; a.g.add(anchor); return {a, po:makePoser(THREE,a), h:kk.h, anchor, bubble:null, bubbleT:0, x:0, z:0, hd:0}; }
  function say(o, text, sec=3.2){ if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } o.bubble=makeLabel(text, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:34}); o.bubbleT=sec; }
  const tickBubble=(o,dt)=>{ if(o.bubble){ o.bubbleT-=dt; if(o.bubbleT<=0){ removeLabel(o.bubble); o.bubble=null; } } };
  const place=o=>{ o.a.g.position.set(o.x, groundAt(o.x,o.z), o.z); o.a.g.rotation.y=o.hd; };
  const seedM=s=>W.people.pickSeed(L=>!L.female,s), seedF=s=>W.people.pickSeed(L=>L.female,s);
  const all=[];

  /* ============================== 🎧 NGƯỜI ĐEO TAI NGHE ============================== */
  const walkers=[{x0:186, x1:212, z:7.6, seed:seedF(501)}, {x0:144, x1:170, z:-7.6, seed:seedM(502)}].map((w,i)=>{ const o=person(w.seed, {shirt:[0xff4f9a,0x2f6fd0][i], pants:0x1d1f24, shoe:0xffffff}, `🎧 ${W.people.nameOf(w.seed)} · nghe nhạc`, '#c77dff');
    const hp=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,6,16,Math.PI), sm(0x111111,.4)); hp.position.set(0,o.h-.06,0); o.a.g.add(hp); for(const s of [-1,1]){ const cup=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.05,10), sm(0x15161a,.4)); cup.rotation.z=Math.PI/2; cup.position.set(s*.13,o.h-.16,0); o.a.g.add(cup); }
    Object.assign(o, {kind:'walker', ...w, dir:1, x:w.x0+R()*(w.x1-w.x0), z:w.z, t:4+R()*6, dance:0}); place(o); all.push(o); return o; });
  function updWalker(o, dt, T){ if(o.dance>0){ o.dance-=dt; o.a.play('idle'); o.po.apply('dance', T); if(o.dance<=0) o.t=8+R()*8; return; }
    o.t-=dt; if(o.t<=0){ o.dance=5+R()*3; say(o, pick(['🎧 ♪♫ Nhạc hay quá!','♪ Lên nhạc nào~','🎶 Bài này cuốn ghê']), 2.6); return; }
    const sp=1.3; o.x+=o.dir*sp*dt; if(o.x>o.x1){ o.x=o.x1; o.dir=-1; } if(o.x<o.x0){ o.x=o.x0; o.dir=1; } o.hd=lerpAngle(o.hd, o.dir>0?Math.PI/2:-Math.PI/2, Math.min(1,dt*6)); o.a.play('walk'); }

  /* ============================== 🦸 COSPLAY (công viên trung tâm) ============================== */
  const COS=[
    // S19: đứng 2 bên cổng vòm Công viên Trung tâm mới (js/park.js), chừa lối cổng x 196.5–201.5 và sân chơi / khu thể dục
    {n:'Siêu anh hùng Áo Choàng Đỏ', suit:{shirt:0x1f4fd6, pants:0x1f4fd6, long:true, shoe:0xd61f2f}, cape:0xd61f2f, x:193.7, z:43.45},
    {n:'Phi hành gia Bug Hunter', suit:{shirt:0xf2f2f2, pants:0xf2f2f2, long:true, shoe:0x9aa3ad}, helmet:true, x:195.3, z:43.25},
    {n:'Hiệp sĩ Test Case', suit:{shirt:0xb8c0c8, pants:0x8a929a, long:true, shoe:0x5a6068}, shield:true, x:202.7, z:43.25},
    {n:'Ninja Regression', suit:{shirt:0x15161a, pants:0x15161a, long:true, shoe:0x15161a}, scarf:true, x:204.3, z:43.45}];
  const cosplayers=COS.map((c,i)=>{ const o=person(i%2?seedF(510+i):seedM(510+i), c.suit, `🦸 ${c.n} (cosplay)`, '#ff4f6d'); o.x=c.x; o.z=c.z; o.hd=Math.PI; o.kind='cos'; o.c=c; o.t=R()*4; place(o); circles.push({x:c.x, z:c.z, r:.4});
    if(c.cape){ const cape=new THREE.Mesh(new THREE.PlaneGeometry(.62,1.05), sm(c.cape,.8,0,{side:THREE.DoubleSide})); cape.position.set(0,o.h*.58,-.17); cape.rotation.x=.12; o.a.g.add(cape); const st=new THREE.Mesh(new THREE.CircleGeometry(.08,5), sm(0xffd23f,.4,0,{emissive:0xffb000, emissiveIntensity:.5})); st.position.set(0,o.h*.72,.16); o.a.g.add(st); o.cape=cape; }
    if(c.helmet){ const hm=new THREE.Mesh(new THREE.SphereGeometry(.21,16,12), new THREE.MeshStandardMaterial({color:0xcfe8ff, roughness:.05, metalness:.3, transparent:true, opacity:.45})); hm.position.set(0,o.h-.12,0); o.a.g.add(hm); const pack=new THREE.Mesh(new THREE.BoxGeometry(.38,.45,.18), sm(0xe8e8e8,.5)); pack.position.set(0,o.h*.66,-.2); o.a.g.add(pack); }
    if(c.shield){ const sh=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.05,20), sm(0xc8ced6,.25,.9)); sh.rotation.x=Math.PI/2; sh.position.set(-.32,o.h*.55,.12); o.a.g.add(sh); const cr=new THREE.Mesh(new THREE.BoxGeometry(.06,.4,.06), sm(0xd61f2f,.5)); cr.position.set(-.32,o.h*.55,.16); o.a.g.add(cr); }
    if(c.scarf){ const sc=new THREE.Mesh(new THREE.PlaneGeometry(.12,.7), sm(0xd61f2f,.8,0,{side:THREE.DoubleSide})); sc.position.set(.08,o.h*.68,-.16); sc.rotation.z=-.4; o.a.g.add(sc); o.scarf=sc; }
    all.push(o); return o; });
  INTER.push({x:199, z:43.4, r:4.6, prio:.5, label:'📸 Chụp ảnh cùng nhóm cosplay (E)', action:()=>{ const o=pick(cosplayers); say(o, pick(['📸 Cười lên nào!','✌️ Chụp đẹp nha!','🦸 Sẵn sàng cứu thế giới khỏi bug!']), 3); burst(new THREE.Vector3(P.x, P.y+1.6, P.z), [0xffffff,0xfff2a0], 60, 4, .5, 0, .2); toast(`📸 Tách! Ảnh chụp cùng ${o.c.n} đã lưu vào kỷ niệm 😄`, 2600); }});
  makeLabel('🦸 Góc cosplay', 'Bấm E để chụp ảnh cùng', {h:.5, x:199, y:2.6, z:42.8, fade:40});

  /* ============================== 🎸 BAN NHẠC ROCK DẠO ============================== */
  const SPOTS=[{x:152, z:7.4}, {x:166, z:-7.4}, {x:240, z:7.4}];
  const band={members:[], spot:0, state:'walk', t:0, x:SPOTS[0].x-14, z:SPOTS[0].z, drums:null, tipped:0};
  [['🎸 Khánh · guitar', seedM(520), 0x15161a],['🎸 Tú · bass', seedF(521), 0x7a1f2a],['🥁 Nam · trống', seedM(522), 0x1f2a44]].forEach(([n,s,c],i)=>{ const o=person(s, {shirt:c, pants:0x0f1012, long:true, shoe:0x111111}, `${n} (ban nhạc QC Rock)`, '#ff7b29'); o.role=i; all.push(o); band.members.push(o);
    o.x=band.x-i*1.3; o.z=band.z; o.hd=Math.PI/2; place(o);
    if(i<2){ const gtr=new THREE.Group(); const body=new THREE.Mesh(new THREE.BoxGeometry(.36,.48,.08), sm(i?0x2a6fdb:0xd61f2f,.35,.2)); body.position.set(0,0,0); gtr.add(body); const neck=new THREE.Mesh(new THREE.BoxGeometry(.06,.6,.05), sm(0x5c3b22,.5)); neck.position.set(.05,.5,0); gtr.add(neck); gtr.position.set(.05,o.h*.52,.2); gtr.rotation.z=-.9; o.a.g.add(gtr); o.inst=gtr; } });
  band.drums=(()=>{ const g=new THREE.Group(); const kick=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.3,18), sm(0x1d1f24,.4)); kick.rotation.x=Math.PI/2; kick.position.y=.32; g.add(kick); for(const [x,y] of [[-.42,.62],[.42,.62]]){ const t=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.16,14), sm(0xc8ced6,.3,.8)); t.position.set(x,y,.1); g.add(t); } const cy=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.01,16), sm(0xffcf6a,.3,1)); cy.position.set(.55,1.1,-.1); g.add(cy); g.visible=false; scene.add(g); return g; })();
  INTER.push({get x(){ return band.x; }, get z(){ return band.z+(band.z>0?1.6:-1.6); }, r:4, prio:.6, when:()=>band.state==='play', label:'🤘 Ủng hộ ban nhạc QC Rock (E)', action:()=>askPay(10, '🤘 Ủng hộ ban nhạc dạo <b>QC Rock</b>', ()=>{ if(!spend(10)) return; band.tipped++; say(band.members[0], 'Cảm ơn bạn! 🤘 Bài sau tặng bạn!', 3); toast('🤘 Ban nhạc cúi chào cảm ơn bạn!', 2200); })});
  // nhạc rock tự tạo (WebAudio)
  const AU={ctx:null, out:null, next:0, step:0};
  function audioOK(){ if(AU.ctx) return true; if(!(navigator.userActivation && navigator.userActivation.hasBeenActive)) return false; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return false; AU.ctx=new AC(); AU.out=AU.ctx.createGain(); AU.out.gain.value=0; AU.out.connect(AU.ctx.destination);
    const n=AU.ctx.createBuffer(1, AU.ctx.sampleRate, AU.ctx.sampleRate), d=n.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; AU.noise=n;
    AU.dist=AU.ctx.createWaveShaper(); const cv=new Float32Array(1024); for(let i=0;i<1024;i++){ const x=i/512-1; cv[i]=Math.tanh(x*6); } AU.dist.curve=cv; AU.dist.connect(AU.out); return true; }
  const BPM=132, SPB=60/BPM/2;   // nốt móc đơn
  const RIFF=[40,40,43,45, 40,40,47,45, 40,40,43,45, 38,38,43,43];   // E5 power chord riff (MIDI)
  function hz(m){ return 440*Math.pow(2,(m-69)/12); }
  function sched(t, step){ const c=AU.ctx, m=RIFF[step%RIFF.length];
    // guitar power chord (méo tiếng)
    for(const iv of [0,7,12]){ const o=c.createOscillator(), g=c.createGain(); o.type='sawtooth'; o.frequency.value=hz(m+12+iv); g.gain.setValueAtTime(.0,t); g.gain.linearRampToValueAtTime(.07,t+.01); g.gain.exponentialRampToValueAtTime(.01,t+SPB*.95); o.connect(g); g.connect(AU.dist); o.start(t); o.stop(t+SPB); }
    // bass
    { const o=c.createOscillator(), g=c.createGain(); o.type='square'; o.frequency.value=hz(m); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.01,t+SPB*.9); o.connect(g); g.connect(AU.out); o.start(t); o.stop(t+SPB); }
    // trống: kick nhịp 1,3 · snare nhịp 2,4 · hi-hat móc đơn
    const beat=step%4;
    if(beat===0){ const o=c.createOscillator(), g=c.createGain(); o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(45,t+.12); g.gain.setValueAtTime(.5,t); g.gain.exponentialRampToValueAtTime(.001,t+.18); o.connect(g); g.connect(AU.out); o.start(t); o.stop(t+.2); }
    if(beat===2){ const s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); s.buffer=AU.noise; f.type='bandpass'; f.frequency.value=1800; g.gain.setValueAtTime(.32,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); s.connect(f); f.connect(g); g.connect(AU.out); s.start(t, R(), .18); }
    { const s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); s.buffer=AU.noise; f.type='highpass'; f.frequency.value=7000; g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.001,t+.04); s.connect(f); f.connect(g); g.connect(AU.out); s.start(t, R(), .05); } }
  function updBand(dt, T){ const sp=SPOTS[band.spot]; band.t+=dt;
    if(band.state==='walk'){ const dx=sp.x-band.x; const v=Math.sign(dx)*Math.min(Math.abs(dx), 1.25*dt); band.x+=v; const hd=dx>0?Math.PI/2:-Math.PI/2;
      band.members.forEach((o,i)=>{ o.x=band.x-Math.sign(dx||1)*i*1.3; o.z=band.z+(i%2?.5:-.3); o.hd=lerpAngle(o.hd, hd, Math.min(1,dt*6)); o.a.play(Math.abs(v)>1e-4?'walk':'idle'); });
      if(Math.abs(dx)<.05){ band.state='setup'; band.t=0; band.z=sp.z; } }
    else if(band.state==='setup'){ if(band.t>3){ band.state='play'; band.t=0; band.drums.visible=true; band.drums.position.set(band.x+1.6, groundAt(band.x+1.6,band.z), band.z+(band.z>0?-.2:.2)); say(band.members[0], '🎸 Xin chào Downtown! Bài này tên là "Hotfix lúc 2 giờ sáng"!', 4); }
      band.members.forEach(o=>{ o.a.play('idle'); o.hd=lerpAngle(o.hd, band.z>0?Math.PI:0, Math.min(1,dt*4)); }); }
    else if(band.state==='play'){ band.members.forEach((o,i)=>{ o.a.play('idle'); const face=band.z>0?Math.PI:0; o.hd=face; if(i===2){ o.x=band.x+1.6; o.z=band.z+(band.z>0?.6:-.6); o.hd=face+Math.PI; } else { o.x=band.x-i*1.4; o.z=band.z; } o.po.apply('dance', T*1.15+i); });
      if(band.t>48){ band.state='walk'; band.t=0; band.drums.visible=false; band.spot=(band.spot+1)%SPOTS.length; say(band.members[0], 'Cảm ơn mọi người! Hẹn gặp ở góc phố sau 🤘', 3); } }
    for(const o of band.members) place(o);
    // âm thanh: nghe to dần khi lại gần
    const d=Math.hypot(P.x-band.x, P.z-band.z), vol=band.state==='play' && !W.inside ? Math.max(0, 1-d/48)*.5 : 0;
    if(vol>0 && audioOK()){ const c=AU.ctx; if(c.state==='suspended') c.resume(); AU.out.gain.setTargetAtTime(vol, c.currentTime, .2); if(AU.next<c.currentTime) AU.next=c.currentTime+.05; while(AU.next<c.currentTime+.25){ sched(AU.next, AU.step++); AU.next+=SPB; } }
    else if(AU.ctx){ AU.out.gain.setTargetAtTime(0, AU.ctx.currentTime, .3); } }
  // khán giả đứng xem ban nhạc
  const fans=[0,1,2,3].map(i=>{ const s=i%2?seedF(530+i):seedM(530+i), o=person(s, null, `${W.people.nameOf(s)} · người đi đường`, '#c7d2e0'); o.kind='fan'; o.i=i; o.x=band.x+3+i*2.4; o.z=band.z+(band.z>0?1.6:-1.6); place(o); all.push(o); return o; });
  function updFans(dt, T){ fans.forEach((o,i)=>{ if(band.state==='play'){ const tx=band.x-1.5+i*1.4, tz=band.z+(band.z>0?2.6:-2.6)+(i%2)*.6; o.x+=(tx-o.x)*Math.min(1,dt*1.2); o.z+=(tz-o.z)*Math.min(1,dt*1.2); o.hd=Math.atan2(band.x-o.x, band.z-o.z); const moving=Math.hypot(tx-o.x,tz-o.z)>.3; o.a.play(moving?'walk':'idle'); if(!moving && (i%2)) o.po.apply('nod', T+i, 1); }
      else { if(o.x===0){ o.x=band.x+i*3; o.z=band.z+(band.z>0?1.2:-1.2); } o.a.play('idle'); } place(o); }); }

  /* ============================== 🎩 ẢO THUẬT GIA (Phố ẩm thực Đồi QC) ============================== */
  let magic=null; const info=W.hillsInfo;
  if(info){ const mx=307, mz=104, Y=info.FLAT; const o=person(seedM(540), {shirt:0x15161a, pants:0x15161a, long:true, shoe:0x111111}, '🎩 Ảo thuật gia Bình Minh', '#c77dff'); o.x=mx; o.z=mz-.4; o.hd=Math.PI; place(o); all.push(o); circles.push({x:mx, z:mz-.4, r:.4});
    const hat=new THREE.Group(); const brim=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.02,16), sm(0x111111,.5)); hat.add(brim); const top=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.24,16), sm(0x111111,.5)); top.position.y=.12; hat.add(top); hat.position.y=o.h+.02; o.a.g.add(hat);
    const tbl=new THREE.Group(); tbl.position.set(mx, Y, mz+.6); scene.add(tbl); const top2=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.04,20), sm(0x5a1a6a,.6)); top2.position.y=.85; tbl.add(top2); const leg=new THREE.Mesh(new THREE.CylinderGeometry(.04,.06,.85,8), sm(0x111111,.4)); leg.position.y=.42; tbl.add(leg); circles.push({x:mx, z:mz+.6, r:.5});
    const ball=new THREE.Mesh(new THREE.SphereGeometry(.12,16,12), sm(0xffffff,.1,.2,{emissive:0xa060ff, emissiveIntensity:.8})); scene.add(ball);
    const cards=[]; for(let i=0;i<8;i++){ const cd=new THREE.Mesh(new THREE.PlaneGeometry(.12,.17), sm(i%2?0xd61f2f:0xffffff,.5,0,{side:THREE.DoubleSide})); scene.add(cd); cards.push(cd); }
    const crowd=[0,1,2,3,4].map(i=>{ const s=i%2?seedF(550+i):seedM(550+i), c=person(s, null, `${W.people.nameOf(s)} · khán giả`, '#c7d2e0'); const a=-.9+i*.45; c.x=mx+Math.sin(a)*2.8; c.z=mz+.6+Math.cos(a)*2.8; c.hd=Math.atan2(mx-c.x, mz+.6-c.z); place(c); circles.push({x:c.x, z:c.z, r:.35}); all.push(c); return c; });
    magic={o, x:mx, z:mz, Y, ball, cards, crowd, t:0, trick:0};
    INTER.push({x:mx, z:mz+3.6, r:3.2, prio:.6, label:'🎩 Ủng hộ ảo thuật gia (E)', action:()=>askPay(10, '🎩 Ủng hộ ảo thuật gia đường phố', ()=>{ if(!spend(10)) return; say(o, 'Cảm ơn quý khách! ✨ Xem tiếp màn sau nhé!', 3); burst(new THREE.Vector3(mx, Y+1.6, mz+.6), [0xc77dff,0xffd23f,0xffffff], 90, 4, 1.2, -2, .18); })});
    makeLabel('🎩 Ảo thuật đường phố', 'Bấm E để ủng hộ', {h:.5, x:mx, y:Y+3.6, z:mz, fade:40}); }
  function updMagic(dt, T){ if(!magic) return; const m=magic; m.t+=dt; const y=m.Y+1.15+Math.sin(T*1.6)*.25+(m.t%20<6?.6:0);
    m.ball.position.set(m.x+Math.sin(T*.9)*.15, y, m.z+.6); m.cards.forEach((c,i)=>{ const a=T*1.8+i*TAU/8; c.position.set(m.x+Math.cos(a)*.7, m.Y+1.4+Math.sin(T*2+i)*.15, m.z+.6+Math.sin(a)*.7); c.rotation.y=-a; c.visible=m.t%20>6 && m.t%20<14; });
    m.o.a.play('idle'); if(m.t%20<6) m.o.po.apply('present', T, 1);
    if(Math.floor(m.t/20)!==m.trick){ m.trick=Math.floor(m.t/20); say(m.o, pick(['✨ Abracadabra! Bóng biết bay!','🃏 Lá bài bạn chọn… chính là lá này!','🎩 Bug biến mất! (đừng tin lời QC nhé)']), 3.5); burst(new THREE.Vector3(m.x, m.Y+1.6, m.z+.6), [0xc77dff,0xffd23f], 70, 3, 1, -2, .16); m.crowd.forEach((c,i)=>{ if(i%2===0) say(c, pick(['Wow! 😮','Hay quá! 👏','Làm sao hay vậy?!']), 2.2); }); }
    m.crowd.forEach((c,i)=>{ c.a.play('idle'); if(m.t%20<1.6) c.po.apply('nod', T+i, 1); }); }

  /* ============================== khung hình ============================== */
  HOOK.onFrame.push((dt, T)=>{ if(W.inside) return; dt=Math.min(dt,.1);
    const nearDT=P.x>120 && P.x<280 && Math.abs(P.z)<90, nearFood=magic && Math.hypot(P.x-magic.x, P.z-magic.z)<70;
    if(nearDT){ walkers.forEach(o=>{ updWalker(o,dt,T); place(o); }); cosplayers.forEach((o,i)=>{ o.a.play('idle'); if(o.cape) o.cape.rotation.x=.12+Math.sin(T*2.2+i)*.08; if(o.scarf) o.scarf.rotation.z=-.4+Math.sin(T*3+i)*.15; if(((T*.25+i)%6)<1.2) o.po.apply('present', T, 1); }); updBand(dt, T); updFans(dt, T); }
    else if(AU.ctx) AU.out.gain.setTargetAtTime(0, AU.ctx.currentTime, .3);
    if(nearFood) updMagic(dt, T);
    for(const o of all){ tickBubble(o, dt); if(o.a.root.visible && Math.hypot(P.x-o.a.g.position.x, P.z-o.a.g.position.z)<80) o.a.mixer.update(dt); } });
  PLACES.push({icon:'🎸', name:'Ban nhạc rock dạo (Downtown)', sub:'Đi theo ban nhạc · cosplay ở cổng công viên · người nghe nhạc nhún nhảy', go:()=>teleport(band.x, band.z+(band.z>0?4:-4), band.x, band.z)});
  return {band, magic, cosplayers, walkers};
}
