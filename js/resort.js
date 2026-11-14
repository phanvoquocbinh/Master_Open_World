// QC World – S2.3: Đảo nghỉ dưỡng (bờ Tây Nam đảo Master Dashboard được nới rộng + đảo nhỏ ngoài khơi).
// • Nhà nghỉ cho thuê (thuê theo ngày) · dãy Biệt thự Biển Xanh (mua) · Đảo Siêu biệt thự nối bằng cầu gỗ (mua, giá rất cao).
// • Nhà nào cũng VÀO ĐƯỢC & Ở ĐƯỢC: cửa tự mở cho chủ nhà, nội thất thật (phòng khách, bếp, phòng ngủ, phòng tắm), ngủ qua đêm, đặt làm nơi xuất hiện,
//   ngồi sofa/ghế, nằm ghế tắm nắng. Khi bạn ở trong nhà, mái + nửa trên tường tự ẩn để camera nhìn vào được.
// • Quán nước ngắm biển (bờ Đông) + võng nằm thư giãn.
import { compactGroup } from './perf.js';
import { makePoser } from './pose.js';

export function makeResort(W, L){
  const {THREE, scene, mesh, box, MAT, colorMat, circles, INTER, PLACES, P, HOOK, toast, teleport, groundH, addPlat, palm, ISLET, RESORT_A, makeActor, makeLabel} = W;
  const {S, save, ui, askPay, fmt, spend} = L;
  S.resort=Object.assign({own:{}, rent:{}}, S.resort||{});
  const today=()=>new Date().toISOString().slice(0,10);
  const R=Math.random, A=RESORT_A, polar=(a,r)=>({x:Math.cos(a)*r, z:Math.sin(a)*r});
  const houses=[], npcs=[];

  /* ---------- vật liệu ---------- */
  const GL={}, glow=(c,k=1)=>GL[c+'|'+k]||(GL[c+'|'+k]=new THREE.MeshStandardMaterial({color:c, emissive:c, emissiveIntensity:k, roughness:.4}));   // dùng chung → gộp lượt vẽ
  const glassM=new THREE.MeshPhysicalMaterial({color:0xcfe8ff, transparent:true, opacity:.25, roughness:.05, side:THREE.DoubleSide, depthWrite:false});
  const waterM=new THREE.MeshStandardMaterial({color:0x2fb7e0, roughness:.05, metalness:.1, emissive:0x0b5d7a, emissiveIntensity:.45, transparent:true, opacity:.88});
  const woodFloor=(()=>{ const m=MAT.deck||MAT.wood; return m; })();
  const C={white:colorMat(0xf4f1ea,{roughness:.6}), cream:colorMat(0xe9dfcc,{roughness:.8}), dark:colorMat(0x2b2f36,{roughness:.5}), steel:colorMat(0xb8bec6,{roughness:.3,metalness:.8}),
    wood:colorMat(0x8a5a36,{roughness:.6}), walnut:colorMat(0x5a3a24,{roughness:.5}), green:colorMat(0x3f8f3a,{roughness:.85}), stone:colorMat(0xcfc6b6,{roughness:.9}), black:colorMat(0x1a1a1f,{roughness:.4})};
  const ct=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const ART=[0,1,2,3].map(k=>{ const pal=[['#f2e8cf','#386641','#6a994e','#bc4749'],['#edf2f4','#2b2d42','#8d99ae','#ef233c'],['#fefae0','#283618','#dda15e','#bc6c25'],['#f8f9fa','#003049','#f77f00','#fcbf49']][k];
    return new THREE.MeshStandardMaterial({map:ct(256,320,(g,w,h)=>{ g.fillStyle=pal[0]; g.fillRect(0,0,w,h); for(let i=0;i<7;i++){ g.fillStyle=pal[1+i%3]; g.globalAlpha=.75; if(i%2){ g.beginPath(); g.arc(R()*w,R()*h,20+R()*70,0,7); g.fill(); } else g.fillRect(R()*w*.7,R()*h*.7,30+R()*120,20+R()*90); } g.globalAlpha=1; g.strokeStyle='#2a2a2a'; g.lineWidth=14; g.strokeRect(0,0,w,h); }), roughness:.6}); });
  const tvTex=ct(512,288,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#0f2a4a'); gr.addColorStop(1,'#3b1d5a'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#fff'; g.font='800 42px "Segoe UI",sans-serif'; g.fillText('QC TV',30,70); g.font='500 24px "Segoe UI",sans-serif'; g.fillText('Bản tin: Release 2.4 thành công 🎉',30,120); g.fillStyle='#ffd23f'; g.fillRect(30,230,w-60,8); });
  const tvM=new THREE.MeshStandardMaterial({map:tvTex, emissive:0xffffff, emissiveMap:tvTex, emissiveIntensity:.8});

  /* ---------- toạ độ nhà (local: +z = mặt tiền hướng biển) ---------- */
  const toW=(h,lx,lz)=>{ const c=Math.cos(h.rot), s=Math.sin(h.rot); return {x:h.x+lx*c+lz*s, z:h.z-lx*s+lz*c}; };
  const toL=(h,x,z)=>{ const c=Math.cos(h.rot), s=Math.sin(h.rot), dx=x-h.x, dz=z-h.z; return {x:dx*c-dz*s, z:dx*s+dz*c}; };
  function colLine(h, x0,z0,x1,z1, list){ const len=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.ceil(len/.45)); for(let i=0;i<=n;i++){ const t=i/n, p=toW(h, x0+(x1-x0)*t, z0+(z1-z0)*t), c={x:p.x, z:p.z, r:.3}; circles.push(c); if(list) list.push(c); } }
  const M=(h,geo,mat,x,y,z,up=false)=>{ const m=mesh(geo,mat,x,h.y+y,z, up?h.upper:h.g); return m; };
  // tường dọc trục x (tại z) hoặc trục z (tại x), có khoảng trống: {a,b,type:'door'|'win'|'glass'}
  function wall(h, axis, at, from, to, gaps=[]){ const H=h.H, T=.18, wm=h.wallM;
    const piece=(a,b,y0,y1,mat,up)=>{ if(b-a<.02||y1-y0<.02) return; const len=b-a, mid=(a+b)/2, geo=axis==='x'?box(len,y1-y0,T):box(T,y1-y0,len); const x=axis==='x'?mid:at, z=axis==='x'?at:mid; const m=M(h,geo,mat,x,(y0+y1)/2,z,up); if(mat===glassM) m.castShadow=false; };
    const col=(a,b)=>axis==='x'?colLine(h,a,at,b,at):colLine(h,at,a,at,b);
    let cur=from; const gs=[...gaps].sort((p,q)=>p.a-q.a);
    for(const g of gs){ piece(cur,g.a,0,1.05,wm,false); piece(cur,g.a,1.05,H,wm,true); if(g.a>cur) col(cur,g.a);
      if(g.type==='door'){ piece(g.a,g.b,2.2,H,wm,true); }
      else if(g.type==='win'){ piece(g.a,g.b,0,.9,wm,false); piece(g.a,g.b,.9,2.2,glassM,true); piece(g.a,g.b,2.2,H,wm,true); col(g.a,g.b); }
      else { piece(g.a,g.b,0,1.05,glassM,false); piece(g.a,g.b,1.05,H,glassM,true); col(g.a,g.b); for(let k=g.a;k<=g.b+.01;k+=2.2) piece(k-.04,k+.04,0,H,C.dark,false); }
      cur=g.b; }
    piece(cur,to,0,1.05,wm,false); piece(cur,to,1.05,H,wm,true); if(to>cur) col(cur,to); }
  const seatW=(h,lx,lz,lrot,y,o={})=>{ const p=toW(h,lx,lz); return W.addSeat && W.addSeat({x:p.x, z:p.z, rot:h.rot+lrot, y:h.y+y, floor:h.y+.12, ...o}); };
  const circW=(h,lx,lz,r)=>{ const p=toW(h,lx,lz); circles.push({x:p.x,z:p.z,r}); };
  const interW=(h,lx,lz,r,o)=>{ const p=toW(h,lx,lz); const it={x:p.x, z:p.z, r, ...o}; INTER.push(it); return it; };

  /* ---------- nội thất ---------- */
  function sofa(h,x,z,rot,col,w=2.2){ const g=new THREE.Group(); g.position.set(x,h.y,z); g.rotation.y=rot; h.g.add(g); const m=colorMat(col,{roughness:.9});
    mesh(box(w,.42,.9),m,0,.33,0,g); mesh(box(w,.55,.22),m,0,.72,-.36,g); for(const s of [-1,1]) mesh(box(.2,.62,.9),m,s*(w/2-.1),.42,0,g);
    for(let k=-(w/2-.5);k<=w/2-.5+.01;k+=.75){ const lx=x+Math.cos(rot)*k+Math.sin(rot)*.08, lz=z-Math.sin(rot)*k+Math.cos(rot)*.08; seatW(h,lx,lz,rot,.56,{r:2,label:'🛋️ Ngồi sofa (E · C)'}); }
    for(let k=-w/2+.3;k<=w/2-.3+.01;k+=.6) circW(h, x+Math.cos(rot)*k, z-Math.sin(rot)*k, .45); }
  function bed(h,x,z,rot,w=1.8,col=0xdfe8f2){ const g=new THREE.Group(); g.position.set(x,h.y,z); g.rotation.y=rot; h.g.add(g);
    mesh(box(w+.1,.35,2.1),C.walnut,0,.3,0,g); mesh(box(w,.22,2),colorMat(0xffffff,{roughness:.9}),0,.56,0,g); mesh(box(w,.06,1.3),colorMat(col,{roughness:.95}),0,.68,.3,g);
    for(const s of [-1,1]) mesh(box(w*.42,.14,.4),colorMat(0xf7f7f7),s*w*.23,.72,-.75,g); mesh(box(w+.1,1.1,.12),C.walnut,0,.75,-1.06,g);
    for(const s of [-1,1]){ mesh(box(.45,.5,.4),C.walnut,s*(w/2+.35),.35,-.8,g); mesh(new THREE.CylinderGeometry(.08,.12,.3,10),glow(0xfff2c4,.9),s*(w/2+.35),.75,-.8,g); }
    for(let k=-1;k<=1;k++) for(const s of [-.7,.7]) circW(h, x+Math.cos(rot)*s*w/1.6+Math.sin(rot)*k*.7, z-Math.sin(rot)*s*w/1.6+Math.cos(rot)*k*.7, .5);
    const side=toW(h, x+Math.cos(rot)*(w/2+.6), z-Math.sin(rot)*(w/2+.6)); return side; }
  function table(h,x,z,w,d,top=C.walnut){ M(h,box(w,.06,d),top,x,.76,z); for(const sx of [-1,1]) for(const sz of [-1,1]) M(h,box(.06,.73,.06),C.dark,x+sx*(w/2-.1),.37,z+sz*(d/2-.1)); circW(h,x,z,Math.min(w,d)/2+.1); }
  function chair(h,x,z,rot){ const g=new THREE.Group(); g.position.set(x,h.y,z); g.rotation.y=rot; h.g.add(g); mesh(box(.46,.06,.46),C.wood,0,.47,0,g); mesh(box(.46,.5,.05),C.wood,0,.75,-.21,g); for(const sx of [-1,1]) for(const sz of [-1,1]) mesh(box(.04,.45,.04),C.dark,sx*.19,.22,sz*.19,g);
    seatW(h,x+Math.sin(rot)*.04,z+Math.cos(rot)*.04,rot,.5,{label:'🪑 Ngồi ghế (E · C)'}); }
  function rug(h,x,z,w,d,col){ const r=M(h,box(w,.02,d),colorMat(col,{roughness:1}),x,.13,z); r.castShadow=false; }
  function plant(h,x,z,s=1){ M(h,new THREE.CylinderGeometry(.25*s,.2*s,.45*s,12),C.white,x,.12+.22*s,z); for(let i=0;i<5;i++) M(h,new THREE.SphereGeometry(.26*s,8,6),C.green,x+(R()-.5)*.3*s,.12+.65*s+R()*.45*s,z+(R()-.5)*.3*s).scale.y=1.4; circW(h,x,z,.3*s); }
  function art(h,x,y,z,rot,k){ const g=new THREE.Group(); g.position.set(x,h.y+y,z); g.rotation.y=rot; h.g.add(g); mesh(box(1.1,1.35,.04),C.dark,0,0,0,g); const p=new THREE.Mesh(new THREE.PlaneGeometry(1,1.25),ART[k%4]); p.position.z=.025; g.add(p); }
  function tv(h,x,z,rot){ const g=new THREE.Group(); g.position.set(x,h.y,z); g.rotation.y=rot; h.g.add(g); mesh(box(2,.5,.45),C.walnut,0,.25,0,g); mesh(box(1.7,.98,.06),C.black,0,1.25,-.1,g); const s=new THREE.Mesh(new THREE.PlaneGeometry(1.62,.9),tvM); s.position.set(0,1.25,-.065); g.add(s); circW(h,x,z,.5); }
  function kitchen(h,x,z,rot,len=3.2){ const g=new THREE.Group(); g.position.set(x,h.y,z); g.rotation.y=rot; h.g.add(g);
    mesh(box(len,.9,.62),C.white,0,.45,0,g); mesh(box(len+.04,.05,.66),C.dark,0,.92,0,g); mesh(box(len,.7,.36),C.white,0,1.85,-.13,g);
    mesh(box(.7,1.85,.7),C.steel,len/2+.4,.93,0,g); for(const sx of [-.2,.2]) mesh(new THREE.CylinderGeometry(.09,.09,.02,14),C.black,-len/2+.6+sx,.95,0,g);
    for(let k=-len/2;k<=len/2+.6;k+=.5) circW(h, x+Math.cos(rot)*k, z-Math.sin(rot)*k, .42);
    const fr=toW(h, x+Math.sin(rot)*.9, z+Math.cos(rot)*.9); return fr; }
  function bath(h,x,z){ M(h,box(1.7,.55,.8),C.white,x,.39,z); M(h,box(1.5,.04,.6),waterM,x,.6,z); M(h,box(.42,.42,.6),C.white,x+1.6,.33,z+.1); M(h,box(.6,.85,.45),C.white,x+1.4,.55,z-1.1); circW(h,x,z,.6); circW(h,x+1.6,z,.4); }
  function lounger(h,x,z,rot){ const g=new THREE.Group(); g.position.set(x,h.y,z); g.rotation.y=rot; h.g.add(g); mesh(box(.65,.08,1.8),C.white,0,.32,0,g); const b=mesh(box(.65,.08,.7),C.white,0,.55,-.75,g); b.rotation.x=-.55;
    for(const sx of [-1,1]) for(const sz of [-1,1]) mesh(box(.05,.3,.05),C.steel,sx*.28,.15,sz*.8,g);
    seatW(h,x,z,rot,.4,{lie:true, r:1.6, label:'🏖️ Nằm tắm nắng (E · C)'}); }
  function pool(h,x,z,w,d){ M(h,box(w+.6,.42,d+.6),C.stone,x,.09,z).castShadow=false; const wv=M(h,box(w,.04,d),waterM,x,.31,z); wv.castShadow=false; colLine(h,x-w/2,z-d/2,x+w/2,z-d/2); colLine(h,x-w/2,z+d/2,x+w/2,z+d/2); colLine(h,x-w/2,z-d/2,x-w/2,z+d/2); colLine(h,x+w/2,z-d/2,x+w/2,z+d/2); }

  /* ---------- 1 ngôi nhà ---------- */
  function house(o){ const h={...o, rot:Math.atan2(Math.cos(o.face),Math.sin(o.face))}; const p=polar(o.face, o.r); h.x=o.x??p.x; h.z=o.z??p.z; h.y=Math.max(.02, groundH(h.x,h.z));
    h.g=new THREE.Group(); h.g.position.set(h.x,0,h.z); h.g.rotation.y=h.rot; scene.add(h.g);
    h.upper=new THREE.Group(); h.upper.userData.dynamic=true; h.g.add(h.upper);
    const w=h.w, d=h.d; h.wallM=colorMat(h.wallCol,{roughness:.85});
    // nền + sàn
    M(h,box(w+1.2,.5,d+1.2),C.stone,0,-.13,0).castShadow=false; const fl=M(h,box(w,.06,d),h.floorM,0,.15,0); fl.castShadow=false;
    addPlat(h.x,h.z,h.rot,w/2+.6,d/2+.6,h.y+.18);
    // tường ngoài
    const door={a:-.65,b:.65,type:'door'};
    wall(h,'x',d/2,-w/2,w/2,h.front(door)); wall(h,'x',-d/2,-w/2,w/2,h.back||[]); wall(h,'z',-w/2,-d/2,d/2,h.left||[]); wall(h,'z',w/2,-d/2,d/2,h.right||[]);
    // mái
    h.roof(h);
    // cửa (cánh xoay quanh bản lề) + chốt khoá
    const pv=new THREE.Group(); const hp=toW(h,-.65,d/2); pv.position.set(hp.x,h.y+.15,hp.z); pv.rotation.y=h.rot; pv.userData.dynamic=true; scene.add(pv);
    const leaf=new THREE.Mesh(box(1.3,2.05,.06), colorMat(h.doorCol||0x5a3a24,{roughness:.5})); leaf.position.set(.65,1.03,0); leaf.castShadow=true; pv.add(leaf); const knob=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6), C.steel); knob.position.set(1.15,1,.06); pv.add(knob);
    h.door={pv, k:0, cols:[]}; for(let t=-.5;t<=.5;t+=.25){ const q=toW(h,t,d/2); h.door.cols.push({x:q.x,z:q.z,r:.3}); }
    h.lock=(on)=>{ for(const c of h.door.cols){ const i=circles.indexOf(c); if(on && i<0) circles.push(c); if(!on && i>=0) circles.splice(i,1); } };
    h.lock(true);
    // nội thất theo hạng
    h.furnish(h);
    // cửa: thuê / mua / vào nhà
    const out=toW(h,0,d/2+1.1);
    INTER.push({x:out.x, z:out.z, r:1.7, prio:.4, get label(){ return access(h) ? `🚪 ${h.name} – nhà của bạn (cửa tự mở)` : h.kind==='rent' ? `🏠 Thuê ${h.name} hôm nay · ${fmt(h.price)} 💰 (E)` : `${h.kind==='super'?'🏝️':'🏡'} Mua ${h.name} · ${fmt(h.price)} 💰 (E)`; },
      action:()=>{ if(access(h)) return toast(`🏡 Chào mừng về ${h.name}! Giường ở phòng ngủ – bấm E để ngủ / đặt làm nhà chính.`, 3500); buyOrRent(h); }});
    makeLabel(`${h.kind==='super'?'🏝️':h.kind==='villa'?'🏡':'🏠'} ${h.name}`, h.kind==='rent'?`Thuê ${fmt(h.price)} 💰/ngày`:`Giá ${fmt(h.price)} 💰`, {h:.6, x:h.x, y:h.y+h.H+2.2, z:h.z, fade:55});
    compactGroup(W, h.upper); houses.push(h); return h; }
  const access=h=>h.kind==='rent' ? S.resort.rent[h.id]===today() : !!S.resort.own[h.id];
  function buyOrRent(h){ const what = h.kind==='rent' ? `🏠 Thuê <b>${h.name}</b> tới hết hôm nay (có giường, bếp, sofa, phòng tắm)` : `${h.kind==='super'?'🏝️':'🏡'} Mua <b>${h.name}</b> – sở hữu vĩnh viễn, ngủ & đặt làm nhà chính`;
    askPay(h.price, what, ()=>{ if(!spend(h.price)) return; if(h.kind==='rent') S.resort.rent[h.id]=today(); else S.resort.own[h.id]=1; save(); toast(`🎉 ${h.kind==='rent'?'Đã thuê':'Đã mua'} ${h.name}! Cửa sẽ tự mở khi bạn tới gần.`, 4200); }); }
  function homeMenu(h){ const m=ui.modal(`${h.kind==='super'?'🏝️':h.kind==='villa'?'🏡':'🏠'} ${h.name}`); m.body.innerHTML=`<div class="grid">
      <div class="card"><div class="ic">😴</div><b>Ngủ một giấc</b><small>Ngủ tới sáng hôm sau.</small><button class="btn pri" data-a="sleep">Đi ngủ</button></div>
      <div class="card"><div class="ic">📍</div><b>Đặt làm nơi xuất hiện</b><small>${h.kind==='rent'?'Chỉ trong ngày đã thuê.':'Mở game sẽ xuất hiện ở đây.'}</small><button class="btn" data-a="home">${S.home==='res:'+h.id?'Đang là nhà chính':'Đặt'}</button></div></div>`;
    m.body.querySelector('[data-a=sleep]').onclick=()=>{ m.close(); W.setTime(0); toast('☀️ Chào buổi sáng! Ngủ ngon ở '+h.name+'.'); };
    m.body.querySelector('[data-a=home]').onclick=()=>{ S.home='res:'+h.id; save(); m.close(); toast('📍 Đã đặt '+h.name+' làm nơi xuất hiện.'); }; }

  /* ---------- 3 hạng nhà ---------- */
  const gable=(col)=>h=>{ const w=h.w, d=h.d, H=h.H, rise=1.5, ang=Math.atan2(rise,w/2+.5), sl=(w/2+.6)/Math.cos(ang), rm=colorMat(col,{roughness:.8});
    for(const s of [-1,1]){ const r=M(h,box(sl,.14,d+.9),rm,s*(w/2+.6)/2-s*.1,H+rise/2+.05,0,true); r.rotation.z=-s*ang; }
    const tri=new THREE.Shape(); tri.moveTo(-w/2,0); tri.lineTo(w/2,0); tri.lineTo(0,rise); tri.lineTo(-w/2,0); for(const s of [-1,1]){ const m=M(h,new THREE.ShapeGeometry(tri),h.wallM,0,H,s*d/2,true); if(s<0) m.rotation.y=Math.PI; }
    M(h,box(w,.08,d),C.white,0,H,0,true); };
  const flat=(over, col)=>h=>{ const w=h.w, d=h.d, H=h.H; M(h,box(w+over*2,.32,d+over*2),colorMat(col,{roughness:.6}),0,H+.16,0,true); M(h,box(w+over*2+.04,.1,d+over*2+.04),C.walnut,0,H+.02,0,true); };
  const RENT={kind:'rent', w:10, d:8, H:2.8, wallCol:0xf0e2c8, doorCol:0x7a4a2a, floorM:woodFloor, price:80, roof:gable(0xb5502f),
    front:(door)=>[{a:-4.2,b:-2.6,type:'win'},door,{a:2.6,b:4.2,type:'win'}], left:[{a:-1.5,b:.5,type:'win'}], right:[{a:-2.6,b:-1.2,type:'win'}], back:[{a:-3,b:-1.6,type:'win'}],
    furnish(h){ const w=h.w, d=h.d;
      wall(h,'x',-.4,-w/2,w/2,[{a:-3.3,b:-2.2,type:'door'},{a:2.2,b:3.2,type:'door'}]); wall(h,'z',1.3,-d/2,-.4,[]);   // vách: phòng ngủ (trái-sau) · phòng tắm (phải-sau)
      rug(h,-2.4,2,3.2,2.2,0x9b6b43); sofa(h,-2.4,3.1,Math.PI,0x4a6a8a,2.2); M(h,box(1.1,.4,.6),C.walnut,-2.4,.32,2); tv(h,-2.4,.15,0); plant(h,-4.5,3.4,.9); art(h,-4.88,1.7,1.9,Math.PI/2,0);
      const fr=kitchen(h,3.3,.2,-Math.PI/2,2.6); table(h,1.6,2.4,1.2,.8); chair(h,1.6,1.7,0); chair(h,1.6,3.1,Math.PI);
      const bs=bed(h,-2.8,-2.4,Math.PI/2,1.6,0xc8dcef); M(h,box(.6,1.9,1.4),C.walnut,-.6,1.1,-3.2); art(h,-2.8,1.7,-3.88,0,1); bath(h,2.4,-2.6);
      INTER.push({x:bs.x, z:bs.z, r:1.6, prio:.8, when:()=>access(h), label:'🛏️ Giường: ngủ / đặt làm nhà chính (E)', action:()=>homeMenu(h)});
      INTER.push({x:fr.x, z:fr.z, r:1.4, prio:.6, when:()=>access(h), label:'🍳 Nấu bữa ăn (chạy nhanh hơn 10 phút)', action:()=>{ L.S.buffs.energy=Math.max(Date.now(),L.S.buffs.energy||0)+600000; save(); toast('🍳 Bữa cơm nhà nấu ngon tuyệt! Tăng tốc 10 phút.'); }});
      for(const s of [-1,1]) M(h,new THREE.CylinderGeometry(.18,.18,.6,10),colorMat(0xd9534f),s*1.4,.42,d/2+.6);   // chậu hoa trước cửa
    }};
  const VILLA={kind:'villa', w:13, d:10, H:3.2, wallCol:0xfafaf7, doorCol:0x2b2f36, floorM:colorMat(0xd8d2c6,{roughness:.35}), price:6000, roof:flat(.9,0x3a3f47),
    front:(door)=>[{a:-6.2,b:-1.1,type:'glass'},door,{a:1.1,b:6.2,type:'glass'}], left:[{a:-3,b:3,type:'win'}], right:[{a:-3.5,b:-1,type:'win'}], back:[{a:-5,b:-2,type:'win'},{a:2,b:5,type:'win'}],
    furnish(h){ const w=h.w, d=h.d;
      wall(h,'x',-1,-w/2,w/2,[{a:-4.2,b:-3,type:'door'},{a:3,b:4.2,type:'door'}]); wall(h,'z',1.5,-d/2,-1,[]);
      rug(h,-3.2,2.4,4.4,3,0xb8a58c); sofa(h,-3.2,3.9,Math.PI,0xe6e0d4,3); sofa(h,-5.6,2.2,Math.PI/2,0xe6e0d4,1.8); M(h,box(1.4,.38,.8),C.walnut,-3.2,.31,2.4); tv(h,-3.2,-.75,0); plant(h,-6,4.3,1.1); plant(h,-.6,-.6,1); art(h,-6.38,1.9,.2,Math.PI/2,2);
      const fr=kitchen(h,4.9,1.2,-Math.PI/2,3.6); M(h,box(2.2,.95,.9),C.walnut,2.4,.6,1.6); for(const k of [-.7,0,.7]) chair(h,2.4+k,2.5,Math.PI); circW(h,2.4,1.6,.9);
      table(h,1.4,4,2,1); for(const k of [-.6,.6]){ chair(h,1.4+k,3.3,0); chair(h,1.4+k,4.7,Math.PI); }
      const bs=bed(h,-3.6,-3.2,Math.PI/2,2,0xe8d9c5); art(h,-3.6,1.9,-4.88,0,3); M(h,box(.6,2.1,1.8),C.walnut,-.7,1.2,-4.2); bath(h,3,-3.4); plant(h,6,-4.3,.9);
      INTER.push({x:bs.x, z:bs.z, r:1.6, prio:.8, when:()=>access(h), label:'🛏️ Giường: ngủ / đặt làm nhà chính (E)', action:()=>homeMenu(h)});
      INTER.push({x:fr.x, z:fr.z, r:1.4, prio:.6, when:()=>access(h), label:'🍳 Nấu bữa ăn (chạy nhanh hơn 10 phút)', action:()=>{ L.S.buffs.energy=Math.max(Date.now(),L.S.buffs.energy||0)+600000; save(); toast('🍳 Đầu bếp tại gia! Tăng tốc 10 phút.'); }});
      // sân trước: hồ bơi + ghế tắm nắng
      M(h,box(w+1.2,.3,4.6),woodFloor,0,.0,d/2+2.9).castShadow=false; addPlat(...Object.values(toW(h,0,d/2+2.9)), h.rot, w/2+.6, 2.3, h.y+.15);
      pool(h,-2.6,d/2+3,6,2.6); for(const k of [2.4,3.4,4.4]) lounger(h,k+.6,d/2+3,Math.PI); M(h,new THREE.CylinderGeometry(.03,.03,2.2,6),C.steel,5.9,1.1,d/2+3.6); M(h,new THREE.ConeGeometry(1.4,.5,10),colorMat(0xf4f1ea),5.9,2.3,d/2+3.6);
    }};
  const SUPER={kind:'super', w:11.5, d:11, H:3.6, wallCol:0xfdfdfb, doorCol:0x1a1a1f, floorM:colorMat(0xeeeae2,{roughness:.2,metalness:.05}), price:30000, roof:flat(1.6,0x22262c),
    front:(door)=>[{a:-5.4,b:-1.1,type:'glass'},door,{a:1.1,b:5.4,type:'glass'}], left:[{a:-4.6,b:4.6,type:'glass'}], right:[{a:-4.6,b:4.6,type:'glass'}], back:[{a:-3.8,b:3.8,type:'win'}],
    furnish(h){ const w=h.w, d=h.d;
      wall(h,'x',-1.2,-w/2,w/2,[{a:-3.4,b:-2.2,type:'door'},{a:2.2,b:3.4,type:'door'}]); wall(h,'z',.4,-d/2,-1.2,[]);
      rug(h,-2.6,2.6,4.6,3.4,0x2f3a4a); sofa(h,-2.6,4.3,Math.PI,0x1f2a44,3.2); sofa(h,-5,2.4,Math.PI/2,0x1f2a44,2); M(h,box(1.6,.36,.9),colorMat(0xd4af37,{metalness:.8,roughness:.3}),-2.6,.3,2.6); tv(h,-2.6,-.95,0);
      M(h,new THREE.TorusGeometry(.55,.04,8,24),glow(0xfff2c4,1.2),-2.6,3.2,2.6).rotation.x=Math.PI/2;   // đèn chùm
      const fr=kitchen(h,4.6,.9,-Math.PI/2,3.4); M(h,box(2.4,.95,1),C.black,2.2,.6,1.8); for(const k of [-.8,0,.8]) chair(h,2.2+k,2.8,Math.PI); circW(h,2.2,1.8,1);
      table(h,1.8,4.6,2.2,1); for(const k of [-.7,.7]){ chair(h,1.8+k,3.9,0); chair(h,1.8+k,5.3,Math.PI); }
      plant(h,-5.3,5.3,1.2); plant(h,5.3,5.3,1.2); art(h,-.7,1.9,-1.1,0,0);
      const bs=bed(h,-3.4,-3.6,Math.PI/2,2.2,0xf3e9da); M(h,box(.6,2.3,2.2),C.walnut,-.9,1.3,-4.6); bath(h,2.2,-3.8); M(h,new THREE.CylinderGeometry(.9,.9,.5,20),C.white,4.4,.37,-4.4); M(h,new THREE.CylinderGeometry(.8,.8,.04,20),waterM,4.4,.6,-4.4); circW(h,4.4,-4.4,.9);
      INTER.push({x:bs.x, z:bs.z, r:1.6, prio:.8, when:()=>access(h), label:'🛏️ Giường: ngủ / đặt làm nhà chính (E)', action:()=>homeMenu(h)});
      INTER.push({x:fr.x, z:fr.z, r:1.4, prio:.6, when:()=>access(h), label:'🍳 Đầu bếp riêng nấu ăn (chạy nhanh hơn 15 phút)', action:()=>{ L.S.buffs.energy=Math.max(Date.now(),L.S.buffs.energy||0)+900000; save(); toast('👨‍🍳 Đầu bếp riêng phục vụ! Tăng tốc 15 phút.'); }});
      // hồ bơi vô cực + sàn gỗ hướng biển trên cọc
      M(h,box(w+3,.3,6.4),woodFloor,0,0,d/2+3.6).castShadow=false; for(const sx of [-1,1]) for(const k of [0,1]) M(h,box(.2,1.4,.2),C.walnut,sx*(w/2+1),-.7,d/2+1.5+k*4); addPlat(...Object.values(toW(h,0,d/2+3.6)), h.rot, w/2+1.5, 3.2, h.y+.15);
      pool(h,0,d/2+4.6,w-1,2.4); for(const k of [-4,-2.6,2.6,4]) lounger(h,k,d/2+2.3,Math.PI); M(h,box(w+3,1,.05),glassM,0,.65,d/2+6.75).castShadow=false;
    }};

  /* ---------- đặt nhà ---------- */
  house({...RENT, id:'R1', name:'Nhà nghỉ Hoa Sứ', face:A-.36, r:58});
  const VN=['Biệt thự Biển Xanh 1','Biệt thự Biển Xanh 2','Biệt thự Biển Xanh 3'];
  [A-.12,A+.17,A+.46].forEach((a,i)=>house({...VILLA, id:'V'+(i+1), name:VN[i], face:a, r:60, wallCol:[0xfafaf7,0xf3efe6,0xeef3f7][i]}));
  // đảo siêu biệt thự
  const SN=['Siêu biệt thự Hoàng Hôn','Siêu biệt thự Đại Dương','Siêu biệt thự Bình Minh'];
  [-1.85,0,1.85].forEach((da,i)=>{ const a=A+da; house({...SUPER, id:'S'+(i+1), name:SN[i], face:a, x:ISLET.x+Math.cos(a)*14.5, z:ISLET.z+Math.sin(a)*14.5}); });
  // cầu gỗ nối đảo nhỏ
  { const a=A, r0=W.edgeR(a)-6, r1=Math.hypot(ISLET.x,ISLET.z)-ISLET.r+5, x0=Math.cos(a)*r0, z0=Math.sin(a)*r0, x1=Math.cos(a)*r1, z1=Math.sin(a)*r1, len=r1-r0, rot=Math.atan2(x1-x0,z1-z0), cx=(x0+x1)/2, cz=(z0+z1)/2;
    const deck=mesh(box(3,.18,len), MAT.deck||C.wood, cx,.38,cz); deck.rotation.y=rot; deck.castShadow=false;
    for(const s of [-1,1]){ const rl=mesh(box(.08,.08,len), C.walnut, cx+Math.cos(rot)*s*1.45,1.25,cz-Math.sin(rot)*s*1.45); rl.rotation.y=rot; for(let k=-len/2;k<=len/2;k+=2.4){ const px=cx+Math.cos(rot)*s*1.45+Math.sin(rot)*k, pz=cz-Math.sin(rot)*s*1.45+Math.cos(rot)*k; mesh(new THREE.CylinderGeometry(.07,.07,1.8,6), C.walnut, px,.35,pz); mesh(new THREE.SphereGeometry(.09,8,6), glow(0xffc477,.9), px,1.34,pz); } }
    addPlat(cx,cz,rot,1.5,len/2+.5,.47); makeLabel('🌉 Cầu sang Đảo Siêu biệt thự', null, {h:.5, x:x0+Math.cos(a)*2, y:3, z:z0+Math.sin(a)*2, fade:45}); }
  // trang trí đảo nhỏ: dừa + quảng trường hoa
  for(let i=0;i<14;i++){ const a=i/14*Math.PI*2+.2, rr=ISLET.r-3.2-(i%3); const x=ISLET.x+Math.cos(a)*rr, z=ISLET.z+Math.sin(a)*rr; if(houses.some(h=>{ const l=toL(h,x,z); return Math.abs(l.x)<h.w/2+2.5 && l.z>-h.d/2-2 && l.z<h.d/2+9; })) continue; const da=Math.atan2(Math.sin(a-A-Math.PI), Math.cos(a-A-Math.PI)); if(Math.abs(da)<.35) continue; palm(x,z,.9+R()*.4); }
  mesh(new THREE.CylinderGeometry(3.4,3.6,.14,32), C.stone, ISLET.x,groundH(ISLET.x,ISLET.z)+.07,ISLET.z).castShadow=false;
  mesh(new THREE.CylinderGeometry(1.6,1.8,.5,24), C.white, ISLET.x,groundH(ISLET.x,ISLET.z)+.3,ISLET.z); mesh(new THREE.CylinderGeometry(1.45,1.45,.04,24), waterM, ISLET.x,groundH(ISLET.x,ISLET.z)+.55,ISLET.z).castShadow=false; circles.push({x:ISLET.x,z:ISLET.z,r:1.9});
  for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; mesh(new THREE.SphereGeometry(.3,8,6), colorMat([0xff6b9d,0xffd23f,0xffffff,0xff8a3c][i%4]), ISLET.x+Math.cos(a)*2.8,groundH(ISLET.x,ISLET.z)+.35,ISLET.z+Math.sin(a)*2.8); }
  // lối đi gỗ trước dãy nhà + đèn
  { const pts=[A-.42,A-.2,A+.05,A+.3,A+.55].map(a=>polar(a,51.5)); for(let i=0;i+1<pts.length;i++) W.boardwalk(pts[i].x,pts[i].z,pts[i+1].x,pts[i+1].z,2);
    const br=polar(A,51.5), be=polar(A,W.edgeR(A)-6); W.boardwalk(br.x,br.z,be.x,be.z,2.2); for(const p of pts) W.lampPost && W.lampPost(p.x+1.4,p.z); }

  /* ---------- quán nước ngắm biển + võng (bờ Đông Nam) ---------- */
  const CA=.42, cp=polar(CA,62), cy=Math.max(.02,groundH(cp.x,cp.z)), out=[Math.cos(CA),Math.sin(CA)];
  { const g=new THREE.Group(); g.position.set(cp.x,cy,cp.z); scene.add(g);
    mesh(new THREE.CylinderGeometry(6.5,6.7,.16,40), MAT.deck||C.wood, 0,.08,0, g).castShadow=false; addPlat(cp.x,cp.z,0,6.4,6.4,cy+.16);
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; mesh(new THREE.CylinderGeometry(.12,.14,3,8), C.walnut, Math.cos(a)*3.2,1.6,Math.sin(a)*3.2, g); }
    mesh(new THREE.ConeGeometry(4.6,2.2,10,1,true), new THREE.MeshStandardMaterial({color:0xc9a86a, roughness:1, side:THREE.DoubleSide}), 0,4.1,0, g); mesh(new THREE.CylinderGeometry(.3,.3,.3,8), C.walnut, 0,5.2,0, g);
    const bar=mesh(new THREE.CylinderGeometry(1.7,1.7,1.05,24,1,true,0,Math.PI*1.4), colorMat(0x8a5a36,{roughness:.6}), 0,.6,0, g); bar.material=bar.material.clone(); bar.material.side=THREE.DoubleSide; bar.rotation.y=Math.atan2(out[0],out[1])+Math.PI*.3;
    mesh(new THREE.TorusGeometry(1.75,.1,6,24,Math.PI*1.4), C.walnut, 0,1.12,0, g).rotation.set(Math.PI/2,0,Math.atan2(out[0],out[1])+Math.PI*.3-Math.PI/2);
    for(let i=0;i<6;i++){ const b=mesh(new THREE.CylinderGeometry(.06,.06,.12,8), glow([0xff6b9d,0xffd23f,0x46d39a][i%3],.6), Math.cos(i)*.9,1.18,Math.sin(i)*.9, g); }
    circles.push({x:cp.x,z:cp.z,r:2});
    for(let k=0;k<5;k++){ const a=Math.atan2(out[1],out[0])-1.1+k*.55, sx=cp.x+Math.cos(a)*2.45, sz=cp.z+Math.sin(a)*2.45; mesh(new THREE.CylinderGeometry(.22,.22,.06,12), colorMat(0x2f6fd0), sx,cy+.85,sz); mesh(new THREE.CylinderGeometry(.04,.04,.7,6), C.steel, sx,cy+.5,sz);
      W.addSeat && W.addSeat({x:sx, z:sz, rot:Math.atan2(cp.x-sx, cp.z-sz), y:cy+.88, floor:cy+.16, label:'🍹 Ngồi quầy bar (E · C)'}); }
    const cafeTables=[];
    for(let k=0;k<4;k++){ const a=Math.atan2(out[1],out[0])+(-.9+k*.6), tx=cp.x+Math.cos(a)*5, tz=cp.z+Math.sin(a)*5; const grp={seats:[], table:{x:tx, z:tz, y:cy+.89}}; cafeTables.push(grp);
      mesh(new THREE.CylinderGeometry(.5,.5,.05,16), C.white, tx,cy+.86,tz); mesh(new THREE.CylinderGeometry(.04,.04,.7,6), C.steel, tx,cy+.5,tz); mesh(new THREE.CylinderGeometry(.03,.03,2.4,6), C.steel, tx,cy+1.2,tz);
      mesh(new THREE.ConeGeometry(1.3,.45,10), colorMat([0xff6b6b,0xffd23f,0x46d39a,0x4fc3ff][k]), tx,cy+2.45,tz); circles.push({x:tx,z:tz,r:.55});
      for(const s of [-1,1]){ const ca=a+s*.16, chx=cp.x+Math.cos(ca)*5.2, chz=cp.z+Math.sin(ca)*5.2; mesh(box(.5,.06,.5), C.white, chx,cy+.62,chz); const st=W.addSeat && W.addSeat({x:chx, z:chz, rot:Math.atan2(out[0],out[1]), y:cy+.64, floor:cy+.16, label:'🌅 Ngồi ngắm biển (E · C)'}); if(st) grp.seats.push(st); } }
    makeLabel('🍹 Quán nước Ngắm Biển', 'Nước dừa · cà phê · sinh tố', {h:.7, x:cp.x, y:cy+6.3, z:cp.z, fade:70});
    const menu=[['🥥 Nước dừa tươi',15,5],['☕ Cà phê sữa đá',20,8],['🍓 Sinh tố dâu',25,10]];
    INTER.push({x:cp.x+out[0]*-.6, z:cp.z+out[1]*-.6, r:2.4, prio:.3, label:'🍹 Gọi nước ở quầy (E)', action:()=>{ const m=ui.modal('🍹 Quán nước Ngắm Biển'); m.body.innerHTML=`<div class="grid">${menu.map(([n,p,mn],i)=>`<div class="card"><b>${n}</b><small>Thư giãn + chạy nhanh hơn ${mn} phút</small><div class="row" style="margin-top:auto"><span class="price">${p} 💰</span><div class="sp"></div><button class="btn pri" data-i="${i}">Gọi</button></div></div>`).join('')}</div>`;
      m.body.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{ const [n,p,mn]=menu[+b.dataset.i]; m.close(); askPay(p, `${n} ở Quán nước Ngắm Biển`, ()=>{ if(!spend(p)) return; L.S.buffs.energy=Math.max(Date.now(),L.S.buffs.energy||0)+mn*60000; save(); toast(`${n} mát lạnh! Ngồi ngắm biển thôi 🌅 (+${mn} phút chạy nhanh)`, 3500); }); }); }});
    // nhân viên quán + khách
    if(W.people){ const mk=(seed,outfit,x,z,face,mode)=>{ const k=W.people.kit(seed,{outfit}); const a=makeActor(k.gl,{name:`${W.people.nameOf(seed)} · ${mode==='stand'?'Pha chế':'Khách'}`, height:k.h, face:0, clips:k.clips, compact:false, dot:'#ffb547'}); a.g.position.set(x,cy+.16,z); a.g.rotation.y=face; a.play('idle',0); const p=makePoser(THREE,a); npcs.push({a,p,mode,t:R()*5}); return a; };
      mk(W.people.pickSeed(L=>L.female,77), {shirt:0xffffff, long:false}, cp.x, cp.z, Math.atan2(out[0],out[1]), 'stand');
    }
    // S8: khách bot vào gọi nước rồi ra bàn ngồi chill / nói chuyện (js/cafe.js)
    const pr=[-out[1], out[0]];
    (W.CAFES||(W.CAFES=[])).push({name:'Quán nước Ngắm Biển', center:{x:cp.x, z:cp.z}, max:3, groups:cafeTables, drinks:['nước dừa','cà phê sữa đá','sinh tố dâu'],
      spawn:{x:cp.x-out[0]*14, z:cp.z-out[1]*14}, order:()=>({x:cp.x-out[0]*2.7, z:cp.z-out[1]*2.7, face:Math.atan2(out[0],out[1])}),
      via:(ap)=>{ const sd=((ap.x-cp.x)*pr[0]+(ap.z-cp.z)*pr[1])>=0?1:-1; return [[cp.x+pr[0]*sd*2.9, cp.z+pr[1]*sd*2.9]]; },
      talks:[[[0,'Biển hôm nay xanh ghê ha!'],[1,'Ừ, gió mát nữa, ra đây chill đúng bài 🌊'],[0,'Ngồi tới hoàng hôn luôn đi.']],[[1,'Nước dừa ở đây ngọt thật 🥥'],[0,'Uống xong tỉnh cả buổi chiều.']]]});
  }
  // võng giữa 2 cây dừa
  for(let i=0;i<4;i++){ const a=.66+i*.075, rr=66+(i%2)*2.5, c=polar(a,rr), y=Math.max(.02,groundH(c.x,c.z)), t=[-Math.sin(a),Math.cos(a)];
    for(const s of [-1,1]) palm(c.x+t[0]*s*1.7, c.z+t[1]*s*1.7, .95);
    const cloth=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,2.6,14,1,true,Math.PI*1.1,Math.PI*.8), new THREE.MeshStandardMaterial({color:[0xff6b6b,0x4fc3ff,0xffd23f,0x46d39a][i], roughness:.9, side:THREE.DoubleSide}));
    cloth.rotation.z=Math.PI/2; cloth.rotation.y=Math.atan2(t[0],t[1])+Math.PI/2; cloth.position.set(c.x,y+1.15,c.z); cloth.castShadow=true; scene.add(cloth);
    for(const s of [-1,1]){ const rp=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.5,4), C.walnut); rp.position.set(c.x+t[0]*s*1.45,y+1.35,c.z+t[1]*s*1.45); rp.rotation.z=Math.PI/2; rp.rotation.y=Math.atan2(t[0],t[1])+Math.PI/2; scene.add(rp); }
    W.addSeat && W.addSeat({x:c.x, z:c.z, rot:Math.atan2(t[0],t[1]), y:y+.78, floor:y, lie:true, r:1.8, label:'🌴 Nằm võng nghỉ ngơi (E · C)'}); }

  /* ---------- cập nhật: cửa tự mở cho chủ, mái ẩn khi ở trong nhà ---------- */
  let inside=null;
  HOOK.onFrame.push((dt)=>{
    if(W.inside) return;
    let cur=null;
    for(const h of houses){ const dx=P.x-h.x, dz=P.z-h.z; if(dx*dx+dz*dz>900) { if(h.door.k>0){ h.door.k=0; h.door.pv.rotation.y=h.rot; } continue; }
      const l=toL(h,P.x,P.z), inH=Math.abs(l.x)<h.w/2-.1 && Math.abs(l.z)<h.d/2-.1; if(inH) cur=h;
      const ok=access(h), near=ok && Math.hypot(l.x, l.z-h.d/2)<2.6; const want=(near||(inH&&ok&&Math.abs(l.z-h.d/2)<2))?1:0;
      h.door.k=W.lerp(h.door.k, want, 1-Math.exp(-dt*6)); h.door.pv.rotation.y=h.rot-h.door.k*1.45; h.lock(!(ok && h.door.k>.55)); }
    if(cur!==inside){ if(inside) inside.upper.visible=true; if(cur) cur.upper.visible=false; inside=cur; }
    for(const n of npcs){ n.t+=dt; n.a.mixer.update(dt); if(n.mode==='sit') n.p.apply('sit', n.t); }
  });

  /* ---------- chỉ đường ---------- */
  const tp=(h)=>{ const o=toW(h,0,h.d/2+2.6); teleport(o.x,o.z,h.x,h.z); };
  PLACES.push({icon:'🏠', name:'Nhà nghỉ Hoa Sứ (cho thuê)', sub:`Khu nghỉ dưỡng · thuê ${fmt(RENT.price)} 💰/ngày`, go:()=>tp(houses[0])});
  PLACES.push({icon:'🏡', name:'Dãy Biệt thự Biển Xanh', sub:`Mua ${fmt(VILLA.price)} 💰 · hồ bơi riêng`, go:()=>tp(houses[2])});
  PLACES.push({icon:'🏝️', name:'Đảo Siêu biệt thự', sub:`Mua ${fmt(SUPER.price)} 💰 · hồ bơi vô cực hướng biển`, go:()=>tp(houses[5])});
  PLACES.push({icon:'🍹', name:'Quán nước Ngắm Biển', sub:'Võng · ghế ngắm biển · nước dừa', go:()=>teleport(cp.x-out[0]*9, cp.z-out[1]*9, cp.x, cp.z)});
  function spawnHome(){ const id=String(S.home||'').slice(4), h=houses.find(x=>x.id===id); if(!h || !access(h)) return false; const o=toW(h,0,h.d/2-1.4); teleport(o.x,o.z,h.x,h.z); return true; }
  return {houses, spawnHome, access};
}
