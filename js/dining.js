// QC World V2 – PHỤC VỤ BÀN TƯƠNG TÁC & MENU GÓC NHÌN THỨ NHẤT (đặc tả Bình Phần 10 · phiên E abyss-life, 17/11/2026)
// Dùng chung: Cafe 3 tầng + Nhà hàng 5 sao (phiên D), Sky Lounge / Lobby Lounge khách sạn (phiên C), bàn dù + quầy dừa bãi biển (phiên A), du thuyền (phiên B).
// Luồng (đúng đặc tả):
//  1. Người chơi ngồi vào ghế (E / C). Nếu Date.now() < S.diningPaidUntil (khoá 3.600.000 ms = 1 tiếng sau lần gọi món gần nhất) → ngồi tự do, không ai làm phiền.
//  2. Hết khoá → BỒI BÀN NPC đi tới cạnh bàn hỏi 2 lựa chọn: [Từ chối – chỉ ngồi ngắm cảnh] (không mất tiền) · [Xem menu & gọi món].
//  3. Xem menu: camera lướt mượt sang GÓC NHÌN THỨ NHẤT nhìn xuống mặt bàn, mở menu 3 tab (Cà phê & Trà · Bánh ngọt · Fine Dining 5 sao; bãi biển có tab Quầy dừa,
//     du thuyền có tab Cocktail). Chọn món → hộp xác nhận trả tiền (askPay).
//  4. Sau 6–8 s bồi bàn hai tay bưng KHAY có mô hình 3D thật của món ra, đặt lên bàn → trừ tiền, bật buff, người chơi nâng ly, khoá 1 tiếng.
//  Đứng dậy giữa chừng → huỷ (chưa trừ tiền thì không mất tiền), bồi bàn rời đi, camera trả lại.
// API (gọi sau khi dining.js đã nạp – bots_abyssal.js nạp file này; module khác gọi qua W.dining, chưa có thì bỏ qua):
//   W.dining.register({ id, name, kind:'cafe'|'restaurant'|'lounge'|'beach'|'coconut'|'yacht', area:{x,z,r,y0,y1}?, seats:[{x,y,z,yaw,floor?}]?, tabs?:['coffee','cake','fine','coconut','cocktail'],
//                       tableH?:số (cao độ mặt bàn so với SÀN, mặc định 0,75), waiterFrom?:{x,z,y}, free?:()=>bool })
//     – area: mọi ghế W.seats (hệ ghế của life.js) nằm trong vùng được gắn phục vụ bàn (ghế thêm sau cũng tự gắn – quét lại mỗi 3 s trong 1 phút đầu).
//     – seats: chỗ chưa có ghế → dining tự tạo ghế (W.addSeat) có phục vụ bàn.
//   W.dining.onSit({ venue:id|obj, x,y,z,yaw,floor, lie?, frame?:Object3D (toạ độ cục bộ của vật đang chạy, vd. du thuyền), tableY?, waiterFrom? })  – hệ ghế riêng tự gọi
//   W.dining.onStand()  · W.dining.paidLeft() → ms còn khoá · W.dining.reset() (test: xoá khoá 1 tiếng) · W.dining.state()
//   Chỗ CHƯA đăng ký: tự tìm ghế W.seats có nhãn ☕ / 🍽️ / 🍸 / quầy dừa / bàn dù… trong vùng Abyssal và tự gắn theo loại.
import { makePoser } from './pose.js';

export async function make(W, ctx={}){
  if(W.dining) return W.dining;
  const {THREE, scene, P, me, cam, HOOK, toast, makeLabel, removeLabel} = W;
  const TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, HOUR=3600000;
  const L=W.life||{}, S=ctx.S||L.S||{}, save=ctx.save||L.save||(()=>{}), ui=()=>ctx.ui||W.ui;
  const askPay=ctx.askPay||L.askPay||null, spend=ctx.spend||((n)=>{ if((S.coins||0)<n) return false; S.coins-=n; save(); try{ L.addCoins && L.addCoins(0); }catch(e){} return true; });
  const fmt=ctx.fmt||(n=>Number(n).toLocaleString('vi-VN'));
  const buff=(id,min)=>{ S.buffs=S.buffs||{}; S.buffs[id]=Math.max(Date.now(), S.buffs[id]||0)+min*60000; save(); };

  /* ============================== MENU (giá 💰, buff, mô hình 3D) ============================== */
  const TABS={
    coffee:{name:'☕ Cà phê & Trà', items:[['espresso','☕','Espresso đơn',25,'coffee',10],['cappu','☕','Cappuccino bọt sữa',35,'coffee',15],['cold','🧊','Cold brew 12 giờ',40,'coffee',20],['tea','🍵','Trà sen Tây Hồ',30,'coffee',12],['matcha','🍵','Matcha latte',38,'coffee',15]]},
    cake:{name:'🍰 Bánh ngọt', items:[['croissant','🥐','Croissant bơ Pháp',30,'energy',8],['tiramisu','🍰','Tiramisu Mascarpone',45,'energy',10],['macaron','🍬','Macaron 3 vị',40,'energy',8],['flan','🍮','Bánh flan caramel',25,'energy',6]]},
    fine:{name:'🍽️ Fine Dining 5 sao', items:[['steak','🥩','Bò Wagyu A5 sốt tiêu',450,'both',30],['lobster','🦞','Tôm hùm nướng bơ tỏi',520,'both',30],['salmon','🐟','Cá hồi áp chảo thì là',280,'both',20],['wine','🍷','Rượu vang đỏ (ly)',120,'coffee',20]]},
    coconut:{name:'🥥 Quầy dừa', items:[['coconut','🥥','Nước dừa xiêm',15,'energy',5],['icecream','🍨','Kem dừa',18,'energy',5],['smoothie','🥤','Sinh tố nhiệt đới',25,'energy',8]]},
    cocktail:{name:'🍹 Cocktail', items:[['cocktail','🍹','Mojito bạc hà',60,'coffee',15],['sunset','🍹','Tequila Sunset',70,'coffee',15],['champagne','🥂','Champagne (ly)',150,'both',20]]} };
  const KIND_TABS={cafe:['coffee','cake','fine'], restaurant:['fine','coffee','cake'], lounge:['cocktail','coffee','fine'], beach:['coconut','coffee','cake'], coconut:['coconut','coffee','cake'], yacht:['cocktail','fine','cake']};

  /* ============================== MÔ HÌNH MÓN ĂN 3D (gộp màu đỉnh → 1 lượt vẽ / món) ============================== */
  const C=new THREE.Color(), lathe=(prof,seg=18)=>new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)),seg);
  function build(parts){ const list=[]; for(const [g0,col,x=0,y=0,z=0,rx=0,ry=0,sx=1,sy=1,sz=1] of parts){ let g=g0.index?g0.toNonIndexed():g0; g.scale(sx,sy,sz); if(rx) g.rotateX(rx); if(ry) g.rotateY(ry); g.translate(x,y,z);
      for(const k of Object.keys(g.attributes)) if(!['position','normal'].includes(k)) g.deleteAttribute(k); const n=g.attributes.position.count, c=new Float32Array(n*3); C.set(col); for(let i=0;i<n;i++){ c[i*3]=C.r; c[i*3+1]=C.g; c[i*3+2]=C.b; } g.setAttribute('color',new THREE.BufferAttribute(c,3)); list.push(g); }
    const g=W.mergeGeometries(list,false); g.computeVertexNormals(); return g; }
  const matV=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.35, metalness:.05}), matGlass=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.05, metalness:.1, transparent:true, opacity:.55, depthWrite:false});
  const plate=(r=.13,col=0xf4f1ea)=>[lathe([[0,0],[r*.6,0],[r,.012],[r*1.05,.02],[0,.008]],24),col];
  const cup=()=>[[lathe([[0,0],[.035,0],[.045,.06],[.047,.07],[.04,.068],[.03,.012],[0,.012]],16),0xf4f1ea,0,.012], [new THREE.TorusGeometry(.016,.004,6,12,Math.PI),0xf4f1ea,.05,.05,0,0,Math.PI/2], [new THREE.CircleGeometry(.038,16),0x4a2a14,0,.06,0,-Math.PI/2], plate(.065)];
  const glass=(liq,h=.14,r=.032)=>[[lathe([[0,0],[r,0],[r*1.05,h],[0,h]],14),liq,0,0,0,0,0,.96,.8,.96]];
  const stem=(liq)=>[[lathe([[0,0],[.035,0],[.006,.012],[.006,.09],[.03,.11],[.038,.16],[0,.15]],16),liq]];
  const MODEL={
    espresso:()=>({o:cup()}), cappu:()=>({o:[...cup(), [new THREE.CircleGeometry(.036,16),0xe8d6b8,0,.0605,0,-Math.PI/2]]}), cold:()=>({o:[plate(.06)], g:glass(0x3b2412,.15)}), tea:()=>({o:cup()}), matcha:()=>({o:[...cup(), [new THREE.CircleGeometry(.036,16),0x7bb04a,0,.0605,0,-Math.PI/2]]}),
    croissant:()=>({o:[plate(), [new THREE.TorusGeometry(.05,.025,8,14,Math.PI*1.3),0xc98a3a,0,.03,0,-Math.PI/2]]}),
    tiramisu:()=>({o:[plate(), [new THREE.BoxGeometry(.08,.05,.07),0xd8b58a,0,.035], [new THREE.BoxGeometry(.082,.008,.072),0x4a2a14,0,.062]]}),
    macaron:()=>({o:[plate(), ...[0xf2a0b8,0xa8d8a0,0xf2d27a].map((c,i)=>[new THREE.CylinderGeometry(.022,.022,.022,12),c,-.04+i*.04,.024])]}),
    flan:()=>({o:[plate(), [lathe([[0,0],[.04,0],[.032,.035],[0,.035]],16),0xf2c14e,0,.012], [new THREE.CircleGeometry(.032,16),0x7a3a10,0,.048,0,-Math.PI/2]]}),
    steak:()=>({o:[plate(.15), [new THREE.BoxGeometry(.1,.03,.07),0x6b2e1e,-.02,.027], [new THREE.SphereGeometry(.02,8,6),0x3f8f3a,.07,.025], [new THREE.SphereGeometry(.018,8,6),0xd94f3a,.06,.025,.04]], g:stem(0x7a1022)}),
    lobster:()=>({o:[plate(.15), [new THREE.CapsuleGeometry(.025,.11,4,10),0xd9452c,0,.035,0,0,0,1,1,1], [new THREE.SphereGeometry(.018,8,6),0xf2e2a0,.06,.03,.03]], g:stem(0xf2e0a0)}),
    salmon:()=>({o:[plate(.15), [new THREE.BoxGeometry(.09,.025,.06),0xf28c5a,0,.025], [new THREE.CylinderGeometry(.005,.005,.08,5),0x4a8f3a,.05,.03,0,0,0]]}),
    wine:()=>({o:[], g:stem(0x7a1022)}), champagne:()=>({o:[], g:stem(0xf2e0a0)}), cocktail:()=>({o:[[new THREE.SphereGeometry(.012,8,6),0x5abf3a,.02,.15]], g:glass(0xc8f0c8,.13)}), sunset:()=>({o:[], g:glass(0xf2902a,.13)}),
    coconut:()=>({o:[[new THREE.SphereGeometry(.07,14,10),0x6b8f2a,0,.065,0,0,0,1,.9,1], [new THREE.CylinderGeometry(.004,.004,.12,5),0xff5a8a,.02,.15,0,.3]]}), icecream:()=>({o:[[lathe([[0,0],[.04,.02],[.045,.05],[0,.05]],14),0x8a5a2a], [new THREE.SphereGeometry(.035,12,10),0xf4f0e0,0,.07]]}), smoothie:()=>({o:[], g:glass(0xf28ca0,.15)}) };
  const meshCache={}; function itemMesh(id){ const g=new THREE.Group(); let c=meshCache[id]; if(!c){ const m=(MODEL[id]||MODEL.espresso)(); c=meshCache[id]={o:m.o&&m.o.length?build(m.o):null, g:m.g?build(m.g):null}; }
    if(c.o){ const a=new THREE.Mesh(c.o,matV); a.castShadow=false; g.add(a); } if(c.g){ const b=new THREE.Mesh(c.g,matGlass); b.position.set(.09,0,.02); g.add(b); } g.userData.dynamic=true; return g; }
  const trayG=new THREE.CylinderGeometry(.24,.24,.018,24), trayM=new THREE.MeshStandardMaterial({color:0xd4af37, roughness:.25, metalness:.85});

  /* ============================== BỒI BÀN NPC (1 người dùng chung, xuất hiện ở nơi khách ngồi) ============================== */
  let waiter=null; function makeWaiter(){ if(waiter || !W.people || !W.makeActor) return waiter; try{ const seed=W.people.pickSeed(L2=>!L2.female, 8800), k=W.people.kit(seed,{outfit:{shirt:0xf4f1ea, pants:0x14181f, shoe:0x111111, long:true}});
      const a=W.makeActor(k.gl,{name:'🤵 Bồi bàn', height:k.h, face:0, clips:k.clips, compact:false, dot:'#ffd166'}); a.play('idle',0); a.mixer.update(0); a.g.visible=false; scene.add(a.g);
      const tray=new THREE.Group(); tray.add(new THREE.Mesh(trayG,trayM)); tray.visible=false; tray.userData.dynamic=true; scene.add(tray); const anchor=new THREE.Object3D(); anchor.position.y=k.h+.6; a.g.add(anchor);
      waiter={a, po:makePoser(THREE,a), tray, anchor, x:0,y:0,z:0, hd:0, bubble:null, bubbleT:0}; }catch(e){ console.warn('[dining] bồi bàn', e); } return waiter; }
  const wsay=(t,sec=3.5)=>{ if(!waiter) return; if(waiter.bubble) removeLabel(waiter.bubble); waiter.bubble=makeLabel(t,null,{fs:38, h:.26, follow:waiter.anchor, bg:'rgba(255,255,255,.94)', color:'#1b2233', fade:40}); waiter.bubbleT=sec; };

  /* ============================== TRẠNG THÁI ============================== */
  const V={venues:new Map(), hooked:new WeakSet()}; let ST=null;   /* ST = {phase, seat, venue, t, from, to, items:[], tray:[]} */
  const paidLeft=()=>Math.max(0,(S.diningPaidUntil||0)-Date.now());
  const _v=new THREE.Vector3();
  const toWorld=(fr,x,y,z)=>{ if(!fr) return [x,y,z]; fr.updateMatrixWorld(true); _v.set(x,y,z).applyMatrix4(fr.matrixWorld); return [_v.x,_v.y,_v.z]; };
  const frameYaw=fr=>{ if(!fr) return 0; const q=new THREE.Quaternion(); fr.getWorldQuaternion(q); const e=new THREE.Euler().setFromQuaternion(q,'YXZ'); return e.y; };
  const floorOK=(x,z,y)=>W.groundAtY && Math.abs(W.groundAtY(x,z,y+.3)-y)<.35;
  const blocked=(x,z,y,r=.35)=>{ if(!W.resolve) return false; const p={x,z,y}; try{ W.resolve(p,r,false); }catch(e){ return true; } return Math.hypot(p.x-x,p.z-z)>.03; };
  const walkable=(a,b,y)=>{ const n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.4)); for(let i=1;i<=n;i++){ const x=a[0]+(b[0]-a[0])*i/n, z=a[1]+(b[1]-a[1])*i/n; if(!floorOK(x,z,y) || blocked(x,z,y,.3)) return false; } return true; };
  // chọn chỗ bồi bàn đứng (cạnh bàn) + chỗ đi ra (cách 3–6 m, đi thẳng tới được)
  function plan(seat){ const f=[Math.sin(seat.yaw),Math.cos(seat.yaw)], r=[Math.cos(seat.yaw),-Math.sin(seat.yaw)], y=seat.floor;
    if(seat.frame){ const to=[seat.x+r[0]*.85+f[0]*.35, seat.z+r[1]*.85+f[1]*.35], fr=seat.waiterFrom?[seat.waiterFrom.x,seat.waiterFrom.z]:[to[0]-f[0]*3, to[1]-f[1]*3]; return {to, from:fr, y}; }
    const cand=[[r[0]*.85+f[0]*.35, r[1]*.85+f[1]*.35],[-r[0]*.85+f[0]*.35,-r[1]*.85+f[1]*.35],[r[0]*.9-f[0]*.5,r[1]*.9-f[1]*.5],[-r[0]*.9-f[0]*.5,-r[1]*.9-f[1]*.5],[-f[0]*.95,-f[1]*.95]];
    let to=null; for(const [dx,dz] of cand){ const x=seat.x+dx, z=seat.z+dz; if(floorOK(x,z,y) && !blocked(x,z,y,.28)){ to=[x,z]; break; } } if(!to) to=[seat.x+cand[0][0], seat.z+cand[0][1]];
    let from=null; if(seat.waiterFrom && walkable([seat.waiterFrom.x,seat.waiterFrom.z],to,y)) from=[seat.waiterFrom.x,seat.waiterFrom.z];
    if(!from) for(const d of [5,4,3.2,2.4]) for(let k=0;k<16 && !from;k++){ const a=k/16*TAU, x=to[0]+Math.cos(a)*d, z=to[1]+Math.sin(a)*d; if(floorOK(x,z,y) && !blocked(x,z,y,.3) && walkable([x,z],to,y)) from=[x,z]; }
    return {to, from:from||[to[0]-f[0]*1.2, to[1]-f[1]*1.2], y}; }
  function setWaiter(lx,lz,ly,hd){ const w=waiter; w.lx=lx; w.lz=lz; w.ly=ly; w.lhd=hd; const [x,y,z]=toWorld(ST&&ST.seat.frame,lx,ly,lz); w.a.g.position.set(x,y,z); w.a.g.rotation.set(0,hd+frameYaw(ST&&ST.seat.frame),0); }

  /* ============================== CAMERA GÓC NHÌN THỨ NHẤT ============================== */
  let camSave=null, camT=null;
  function fpv(on){ if(on){ if(!camSave) camSave={fpv:cam.fpv, yaw:cam.yaw, pitch:cam.pitch}; const s=ST.seat, yw=s.yaw+frameYaw(s.frame)+Math.PI; camT={yaw:yw, pitch:s.lie?.15:.62}; cam.fpv=true; }
    else if(camSave){ cam.fpv=camSave.fpv; cam.pitch=camSave.pitch; camSave=null; camT=null; } }

  /* ============================== MENU (HTML 3 tab) ============================== */
  function openMenu(){ const vn=ST.venue, tabs=(vn.tabs||KIND_TABS[vn.kind]||KIND_TABS.cafe).filter(k=>TABS[k]), free=vn.free && vn.free();
    const m=ui() && ui().modal ? ui().modal(`🍽️ Menu · ${vn.name||'Phục vụ bàn'}`, {wide:true}) : null; if(!m){ order(TABS[tabs[0]].items[0]); return; }
    ST.modal=m; let cur=0; const draw=()=>{ const T=TABS[tabs[cur]];
      m.body.innerHTML=`<div class="row" style="gap:8px;margin-bottom:12px;flex-wrap:wrap">${tabs.map((k,i)=>`<button class="btn${i===cur?' pri':''}" data-t="${i}">${TABS[k].name}</button>`).join('')}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px">${T.items.map(([id,ic,nm,pr,b,mi],j)=>`<div class="card" data-i="${j}" style="cursor:pointer;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05)">
          <div style="font-size:26px">${ic}</div><b>${nm}</b><div style="opacity:.8;font-size:13px">${free?'Miễn phí (combo)':fmt(pr)+' 💰'} · ${b==='energy'?'⚡ nhanh hơn':b==='coffee'?'☕ tỉnh táo':'✨ cả hai'} ${mi} phút</div></div>`).join('')}</div>
        <div style="margin-top:12px;opacity:.75;font-size:13px">Chọn 1 món – bồi bàn mang ra sau 6–8 giây. Đóng menu = chỉ ngồi ngắm cảnh.</div>`;
      m.body.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ cur=+b.dataset.t; draw(); });
      m.body.querySelectorAll('[data-i]').forEach(c=>c.onclick=()=>{ const it=TABS[tabs[cur]].items[+c.dataset.i]; ST.modal=null; m.close(); order(it); }); };
    draw(); ST.idle=0; }   /* đóng menu (✕ / Esc / bấm nền) = chỉ ngồi ngắm cảnh – xem kiểm tra 'không còn hộp thoại' trong khung hình */
  function ask(){ const vn=ST.venue; ST.phase='ask'; wsay('Chào quý khách! Quý khách dùng gì ạ? 😊',4);
    const m=ui() && ui().modal ? ui().modal(`🤵 Bồi bàn · ${vn.name||''}`) : null; if(!m){ ST.phase='menu'; ST.menuOpen=true; fpv(true); openMenu(); return; } ST.modal=m;
    m.body.innerHTML=`<div style="line-height:1.6">Bồi bàn tới cạnh bàn: <i>"Chào quý khách, quý khách muốn gọi món hay chỉ ngồi ngắm cảnh ạ?"</i></div>
      <div class="row" style="margin-top:16px;gap:10px;justify-content:flex-end"><button class="btn" data-x>🙅 Từ chối – chỉ ngồi ngắm cảnh</button><button class="btn pri" data-m>📖 Xem menu & gọi món (góc nhìn thứ nhất)</button></div>`;
    let done=false; m.body.querySelector('[data-x]').onclick=()=>{ done=true; ST.modal=null; m.close(); decline('Dạ vâng, chúc quý khách ngắm cảnh vui vẻ!'); };
    m.body.querySelector('[data-m]').onclick=()=>{ done=true; ST.modal=null; m.close(); ST.phase='menu'; ST.t=0; ST.menuOpen=false; fpv(true); };   /* menu mở sau 0,6 s (giờ game) khi camera đã lướt xuống bàn */
    ST.idle=0; }
  function decline(msg){ if(!ST) return; wsay(msg,3); fpv(false); ST.phase='leave'; ST.t=0; ST.declined=Date.now(); V.lastDecline=Date.now(); }
  function order([id,ic,nm,pr,b,mi]){ if(!ST) return; const vn=ST.venue, free=vn.free && vn.free(); const go=()=>{ if(!ST) return; ST.item={id,ic,nm,pr:free?0:pr,b,mi}; ST.phase='cook'; ST.t=0; ST.cookT=6+Math.random()*2; wsay(`Dạ, ${nm} có ngay ạ! 👌`,3); toast(`🍽️ Đã gọi ${ic} ${nm} – bồi bàn mang ra sau 6–8 giây.`,3000); };
    if(free) return go(); if(askPay){ askPay(pr, `${ic} <b>${nm}</b> (${vn.name||'phục vụ bàn'})`, ()=>{ if(!spend(pr)){ toast('Không đủ tiền 💰',2500); decline('Dạ không sao ạ, lần sau quý khách ghé nhé.'); return; } ST && (ST.paid=pr); go(); }); }
    else { if(!spend(pr)){ toast('Không đủ tiền 💰',2500); decline('Dạ không sao ạ.'); return; } ST.paid=pr; go(); } }
  function serve(){ const it=ST.item, s=ST.seat, f=[Math.sin(s.yaw),Math.cos(s.yaw)], r=[Math.cos(s.yaw),-Math.sin(s.yaw)], ty=s.tableY ?? (s.floor+(s.lie?.45:.75));
    const lx=s.lie ? s.x+r[0]*.75 : s.x+f[0]*.5, lz=s.lie ? s.z+r[1]*.75 : s.z+f[1]*.5;
    const g=itemMesh(it.id); scene.add(g); ST.placed={g, lx, ly:ty+.005, lz}; ST.placedAt=performance.now();
    if(it.b==='both'){ buff('energy',it.mi); buff('coffee',it.mi); } else buff(it.b,it.mi);
    S.diningPaidUntil=Date.now()+HOUR; save(); wsay('Món của quý khách đây ạ. Chúc ngon miệng! 🥂',4);
    toast(`🥂 ${it.ic} ${it.nm} đã lên bàn${it.pr?` · −${fmt(it.pr)} 💰`:''} · ${it.b==='energy'?'⚡ nhanh hơn':it.b==='coffee'?'☕ tỉnh táo':'✨ nhanh + tỉnh'} ${it.mi} phút · 1 tiếng nữa bồi bàn mới hỏi lại.`,5200);
    try{ L.emote && L.emote('cheer',2); }catch(e){} }

  /* ============================== NGỒI / ĐỨNG ============================== */
  function onSit(o){ const vn=typeof o.venue==='string' ? V.venues.get(o.venue) : (o.venue||{name:'Phục vụ bàn', kind:'cafe'}); if(!vn) return;
    if(ST) end(true); const left=paidLeft(); if(left>0){ toast(`🪑 Ngồi thoải mái – bạn đã gọi món, ${Math.ceil(left/60000)} phút nữa bồi bàn mới hỏi lại.`,3200); return; }
    if(vn.kind==='lounge' && V.lastDecline && Date.now()-V.lastDecline<90000) return;   /* vừa từ chối xong → không hỏi lại ngay */
    if(!makeWaiter()) return; const seat={x:o.x, y:o.y, z:o.z, yaw:o.yaw, floor:o.floor ?? (o.y-.47), lie:!!o.lie, frame:o.frame||null, tableY:o.tableY ?? (vn.tableH!=null ? (o.floor ?? (o.y-.47))+vn.tableH : null), waiterFrom:o.waiterFrom||vn.waiterFrom||null};
    ST={phase:'approach', seat, venue:vn, t:0, veh:HOOK.vehicle}; const pl=plan(seat); ST.from=pl.from; ST.to=pl.to; ST.wy=pl.y;
    waiter.a.g.visible=true; setWaiter(pl.from[0], pl.from[1], pl.y, Math.atan2(pl.to[0]-pl.from[0], pl.to[1]-pl.from[1])); waiter.tray.visible=false; }
  function end(silent){ if(!ST) return; if(ST.modal){ try{ ST.modal.close(); }catch(e){} ST.modal=null; } fpv(false);
    if(ST.placed){ if(ST.seat.frame) scene.remove(ST.placed.g); else { if(V.leftover) scene.remove(V.leftover.g); V.leftover=ST.placed; } }   /* món trên bàn tàu đang chạy: dọn luôn */
    if(waiter && ST.phase!=='seated' && ST.phase!=='leave'){ if(!silent) wsay('Cảm ơn quý khách, hẹn gặp lại ạ!',2.5); waiter.tray.visible=false; ST.phase='leave'; ST.t=0; ST.ended=true; V.leaving=ST; } ST=null; }
  function hookSeat(s, vn){ if(!s || V.hooked.has(s)) return; V.hooked.add(s); const prev=s.onSit; s.onSit=()=>{ try{ prev && prev(); }catch(e){} try{ onSit({venue:vn, x:s.x, y:s.y, z:s.z, yaw:s.rot, floor:s.floor, lie:s.lie}); }catch(e){ console.warn('[dining]', e); } }; }
  function register(o){ if(!o || !o.id) return null; const vn={kind:'cafe', ...o}; V.venues.set(o.id, vn);
    if(o.seats && W.addSeat) for(const s of o.seats){ const st=W.addSeat({x:s.x, z:s.z, rot:s.yaw, y:s.y, floor:s.floor ?? s.y-.47, label:s.label||(vn.kind==='beach'||vn.kind==='coconut'?'🥥 Ngồi bàn dù – gọi đồ uống (E · C)':'🍽️ Ngồi bàn – gọi món (E · C)'), solo:!!s.solo}); hookSeat(st, vn); }
    if(o.area) scanArea(vn); return vn; }
  const inArea=(s,a)=>Math.hypot(s.x-a.x,s.z-a.z)<a.r && (a.y0==null || (s.floor ?? s.y)>=a.y0) && (a.y1==null || (s.floor ?? s.y)<=a.y1);
  function scanArea(vn){ for(const s of (W.seats||[])) if(inArea(s,vn.area)) hookSeat(s, vn); }
  // chỗ chưa đăng ký: tự nhận ghế theo nhãn
  const AUTO=[[/☕|cafe|Cafe|Thonet|Cognac/,'cafe','☕ Quán cafe'],[/🍽️|nhà hàng|Nhà hàng|bàn ăn|bàn tiệc/,'restaurant','🍽️ Nhà hàng'],[/🍸|🍹|Lounge|lounge|quầy bar/,'lounge','🍸 Lounge'],[/🥥|dừa|bàn dù|dù lá cọ/,'coconut','🥥 Quầy dừa bãi biển']];
  function autoScan(){ for(const s of (W.seats||[])){ if(V.hooked.has(s) || s.scope==='interior') continue; if(Math.abs(s.x)>300 || Math.abs(s.z)>300) continue; const lb=String(s.label||(s.group&&s.group.label)||'');
      let vn=null; for(const v of V.venues.values()) if(v.area && inArea(s,v.area)){ vn=v; break; } if(!vn) for(const [re,kind,name] of AUTO) if(re.test(lb)){ vn=V.venues.get('auto-'+kind) || register({id:'auto-'+kind, name, kind}); break; }
      if(vn) hookSeat(s, vn); } }

  /* ============================== KHUNG HÌNH ============================== */
  let scanT=0, scanN=0, tt=0;
  HOOK.onFrame.push((dt)=>{ dt=Math.min(dt||1/60,.1); tt+=dt; scanT-=dt; if(scanT<=0 && scanN<25){ scanT=3; scanN++; try{ autoScan(); for(const v of V.venues.values()) if(v.area) scanArea(v); }catch(e){} }
    if(waiter){ if(waiter.bubble){ waiter.bubbleT-=dt; if(waiter.bubbleT<=0){ removeLabel(waiter.bubble); waiter.bubble=null; } } }
    if(camT && ST && ST.seat.frame) camT.yaw=ST.seat.yaw+frameYaw(ST.seat.frame)+Math.PI;   /* bàn trên tàu đang quay: hướng nhìn bám theo tàu */
    if(camT){ cam.yaw+=(((camT.yaw-cam.yaw)%TAU+TAU*1.5)%TAU-Math.PI)*Math.min(1,dt*4); cam.pitch+=(camT.pitch-cam.pitch)*Math.min(1,dt*4); }   /* lướt mượt sang góc nhìn thứ nhất nhìn xuống bàn */
    if(V.leftover){ const p=V.leftover; if(performance.now()-(p.at||(p.at=performance.now()))>60000){ scene.remove(p.g); V.leftover=null; } }
    const A=ST || V.leaving; if(!waiter || !A){ if(waiter && waiter.a.g.visible && !ST && !V.leaving){ waiter.a.g.visible=false; waiter.tray.visible=false; } return; }
    if(ST && ST.veh && HOOK.vehicle!==ST.veh && !ST.seat.frame){ end(); return; }   /* đã đứng dậy (hệ ghế life.js) */
    const w=waiter; A.t+=dt; w.a.mixer.update(dt);
    const walkTo=(tx,tz,sp=1.25)=>{ const dx=tx-w.lx, dz=tz-w.lz, d=Math.hypot(dx,dz); if(d<.08){ w.a.play('idle'); return true; } const k=Math.min(d,sp*dt); const ny=A.seat.frame?A.wy:(W.groundAtY?W.groundAtY(w.lx+dx/d*k, w.lz+dz/d*k, w.ly+.3):w.ly); setWaiter(w.lx+dx/d*k, w.lz+dz/d*k, ny, Math.atan2(dx,dz)); w.a.play('walk'); return false; };
    const faceSeat=()=>setWaiter(w.lx,w.lz,w.ly,Math.atan2(A.seat.x-w.lx,A.seat.z-w.lz));
    if(A.phase==='approach'){ if(walkTo(A.to[0],A.to[1])){ faceSeat(); ask(); } }
    else if(A.phase==='menu' && !A.menuOpen){ faceSeat(); w.a.play('idle'); if(A.t>.6){ A.menuOpen=true; openMenu(); } }
    else if(A.phase==='ask' || A.phase==='menu'){ faceSeat(); w.a.play('idle'); if(A===ST && !document.querySelector('.modalWrap:not([hidden])')){ A.idle=(A.idle||0)+dt; if(A.idle>1.5) decline('Dạ vâng, quý khách cứ thư giãn ngắm cảnh ạ.'); } else A.idle=0; }
    else if(A.phase==='cook'){ if(A.t<A.cookT*.45){ walkTo(A.from[0],A.from[1]); } else { if(!w.tray.visible){ w.tray.visible=true; w.tray.clear(); w.tray.add(new THREE.Mesh(trayG,trayM)); const g=itemMesh(A.item.id); g.position.y=.01; w.tray.add(g); } if(walkTo(A.to[0],A.to[1]) && A.t>A.cookT){ faceSeat(); A.phase='serve'; A.t=0; } } }
    else if(A.phase==='serve'){ faceSeat(); if(A.t>.9 && !A.placed){ w.tray.clear(); w.tray.add(new THREE.Mesh(trayG,trayM)); serve(); } if(A.t>2.4){ fpv(false); A.phase='leave'; A.t=0; } }
    else if(A.phase==='leave'){ w.tray.visible=A.t<.2 && w.tray.visible; if(walkTo(A.from[0],A.from[1]) || A.t>8){ w.a.g.visible=false; w.tray.visible=false; if(V.leaving===A) V.leaving=null; if(ST===A) ST.phase='seated'; } }
    if(w.tray.visible){ const f=[Math.sin(w.lhd),Math.cos(w.lhd)]; const [x,y,z]=toWorld(A.seat.frame, w.lx+f[0]*.42, w.ly+1.08, w.lz+f[1]*.42); w.tray.position.set(x,y,z); w.tray.rotation.y=w.lhd+frameYaw(A.seat.frame); try{ w.po.apply('present',tt); }catch(e){} }
    if(A.placed && A.placed.g){ const p=A.placed; const [x,y,z]=toWorld(A.seat.frame,p.lx,p.ly,p.lz); p.g.position.set(x,y,z); p.g.rotation.y=A.seat.yaw+frameYaw(A.seat.frame)+.4; }
    if(V.leftover && V.leftover.g && A.seat.frame){ /* món còn trên bàn tàu đang chạy */ } });

  const api={ register, onSit, onStand:()=>end(), paidLeft, reset:()=>{ S.diningPaidUntil=0; save(); V.lastDecline=0; }, state:()=>ST?{phase:ST.phase, venue:ST.venue.name, item:ST.item&&ST.item.nm}:(V.leaving?{phase:'leave'}:null), venues:V.venues, TABS, menu:TABS, autoScan };
  W.dining=api; return api; }
