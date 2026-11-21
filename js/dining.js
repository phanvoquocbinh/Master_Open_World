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

  /* ============================== ĐỒ UỐNG CẦM TAY (20/11 Bình: mua đồ uống → cầm ly trên tay, thỉnh thoảng nâng lên uống, ~2 phút thì hết;
     gần người khác (bot / người chơi) cũng đang cầm ly → nút 🥂 Cụng ly (phím K), kể cả khi đang nằm ghế tắm nắng; bot cũng cầm ly, uống, cụng ly) ============================== */
  const foam=c=>[new THREE.CircleGeometry(.036,16),c,0,.0605,0,-Math.PI/2];
  const HAND={ espresso:()=>({o:cup().slice(0,3)}), cappu:()=>({o:[...cup().slice(0,3), foam(0xe8d6b8)]}), tea:()=>({o:cup().slice(0,3)}), matcha:()=>({o:[...cup().slice(0,3), foam(0x7bb04a)]}),
    cold:()=>({g:glass(0x3b2412,.15)}), wine:()=>({g:stem(0x7a1022)}), champagne:()=>({g:stem(0xf2e0a0)}), cocktail:()=>({o:[[new THREE.SphereGeometry(.012,8,6),0x5abf3a,.02,.15]], g:glass(0xc8f0c8,.13)}),
    sunset:()=>({g:glass(0xf2902a,.13)}), smoothie:()=>({g:glass(0xf28ca0,.15)}), beer:()=>({g:glass(0xe0a020,.16,.036), o:[[new THREE.CylinderGeometry(.036,.036,.02,14),0xf8f4e6,0,.165]]}),
    coconut:()=>MODEL.coconut(), icecream:()=>MODEL.icecream() };
  const DRINK=new Set(Object.keys(HAND)), handCache={};
  function handMesh(id){ const g=new THREE.Group(); let c=handCache[id]; if(!c){ const m=(HAND[id]||HAND.cappu)(); c=handCache[id]={o:m.o&&m.o.length?build(m.o):null, g:m.g?build(m.g):null}; }
    if(c.o){ const a=new THREE.Mesh(c.o,matV); a.castShadow=false; g.add(a); } if(c.g){ const b=new THREE.Mesh(c.g,matGlass); g.add(b); } g.userData.dynamic=true; return g; }
  const NAME_OF={espresso:'Espresso', cappu:'Cappuccino', tea:'Trà nóng', matcha:'Matcha latte', cold:'Cold brew', wine:'Vang đỏ', champagne:'Champagne', cocktail:'Mojito', sunset:'Tequila Sunset', smoothie:'Sinh tố', beer:'Bia tươi', coconut:'Nước dừa', icecream:'Kem dừa'};
  // đoán đồ uống từ tên món đã trả tiền (mọi quầy trong thế giới đều đi qua hộp xác nhận 💰 của life.js)
  const GUESS=[[/kem/i,'icecream'],[/dừa|coconut/i,'coconut'],[/sinh tố|smoothie|nước ép|juice|soda|chanh|nước cam/i,'smoothie'],[/champagne|sâm panh|prosecco/i,'champagne'],[/vang|wine/i,'wine'],[/cocktail|mojito|margarita|martini|sunset|🍹|🍸/i,'cocktail'],
    [/bia|beer|🍺/i,'beer'],[/matcha/i,'matcha'],[/trà|tea|🍵/i,'tea'],[/cold brew/i,'cold'],[/espresso/i,'espresso'],[/cà phê|cafe|coffee|cappuccino|latte|americano|mocha|bạc xỉu|phin|☕/i,'cappu']];
  const FOOD=/bò|wagyu|tôm|cá |cá hồi|steak|lobster|bánh|croissant|tiramisu|macaron|flan|teppan|set |phòng|vé|combo|thuê|spa|massage|chống nắng|kính|áo|quần|mũ|dép|túi|xe|thẻ|gói/i;
  const guessDrink=t=>{ t=String(t||'').replace(/<[^>]+>/g,' '); if(FOOD.test(t) && !/kem dừa|nước/i.test(t)) return null; for(const [re,id] of GUESS) if(re.test(t)) return id; return null; };
  const HOLD=[], _hp=new THREE.Vector3(), _hq=new THREE.Vector3(), _hF=new THREE.Vector3(), _hR=new THREE.Vector3(), _hU=new THREE.Vector3(0,1,0), _hd1=new THREE.Vector3(), _hd2=new THREE.Vector3(), _qa=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _pq=new THREE.Quaternion();
  const bonesOf=root=>{ const b={}; if(root) root.traverse(x=>{ if(x.isBone){ const k=x.name.replace(/^mixamorig[:_]?/,''); if(!b[k]) b[k]=x; } }); return b; };
  let meB=null; const meBones=()=>meB||(meB=bonesOf(me.root||me.g));
  // xoay xương n sao cho hướng n→c trùng hướng dir (toạ độ thế giới)
  function aimW(B, n, c, dir, w=1){ const b=B[n], cc=B[c]; if(!b || !cc || w<=0) return; b.getWorldPosition(_hp); cc.getWorldPosition(_hq); _hq.sub(_hp).normalize(); _hd1.copy(dir).normalize(); if(w<1) _hd1.lerp(_hq,1-w).normalize();
    _qa.setFromUnitVectors(_hq,_hd1); b.getWorldQuaternion(_wq); b.parent.getWorldQuaternion(_pq); _wq.premultiply(_qa); b.quaternion.copy(_pq.invert().multiply(_wq)); b.updateMatrixWorld(true); }
  const dv=(f,u,r,out)=>out.set(0,0,0).addScaledVector(_hF,f).addScaledVector(_hU,u).addScaledVector(_hR,r);
  // who: 'me' hoặc {a:actor, bones, nm, ext:true (bot tự gọi D.drinks.pose sau khi chạy hoạt hình), say(text), lie:()=>bool}
  function give(who, id, o={}){ if(!HAND[id]) id='cappu'; const isMe=who==='me', a=isMe?me:who.a; if(!a || !a.g) return null; let h=HOLD.find(q=>q.a===a); if(h) drop(h,true);
    const mesh=handMesh(id); mesh.visible=false; scene.add(mesh);
    h={a, B:isMe?meBones():(who.bones||bonesOf(a.g)), nm:isMe?'bạn':(who.nm||'Khách'), id, mesh, t:0, life:o.life??120, nextSip:o.firstSip??(2.5+Math.random()*3), sip:-1, clink:-1, cdir:null, isMe, ext:!!(who.ext), who, lastClink:-99};
    HOLD.push(h); if(isMe){ toast(`${o.nm?'':'🥤 '}Bạn đang cầm ${o.nm||NAME_OF[id]||'đồ uống'} – thỉnh thoảng nhấp một ngụm · ~2 phút là hết · gần ai cũng cầm ly thì bấm 🥂 Cụng ly (phím K).`,4200); } return h; }
  function drop(h, silent){ const i=HOLD.indexOf(h); if(i<0) return; HOLD.splice(i,1); scene.remove(h.mesh); if(h.isMe && !silent) toast(`🥤 Đã uống hết ${NAME_OF[h.id]||'đồ uống'} – ngon quá!`,2200); }
  const holderOf=a=>HOLD.find(q=>q.a===a)||null;
  // tư thế tay phải + đặt ly vào lòng bàn tay (gọi SAU khi hoạt hình / tư thế khác đã chạy trong khung hình)
  function pose(h, dt){ if(!h) return; h.t+=dt; if(h.t>h.life){ drop(h); return; }
    if(h.clink>=0){ h.clink+=dt; if(h.clink>1.5){ h.clink=-1; h.cdir=null; } } else { h.nextSip-=dt; if(h.sip<0 && h.nextSip<=0) h.sip=0; }
    if(h.sip>=0){ h.sip+=dt; if(h.sip>2.4){ h.sip=-1; h.nextSip=8+Math.random()*8; } }
    const a=h.a, vis=a.g.visible && (h.isMe || !h.who.hidden); h.mesh.visible=vis; if(!vis) return;
    a.g.updateMatrixWorld(true); a.g.getWorldDirection(_hF); _hF.y=0; if(_hF.lengthSq()<1e-6) _hF.set(0,0,1); _hF.normalize(); _hR.set(-_hF.z,0,_hF.x);
    const lie=h.isMe ? !!api.meLie : !!(h.who.lie && h.who.lie()), es=h.sip>=0 ? Math.min(1,Math.sin(Math.min(1,h.sip/2.4)*Math.PI)*1.7) : 0, ec=h.clink>=0 ? Math.min(1,Math.sin(Math.min(1,h.clink/1.5)*Math.PI)*1.6) : 0, B=h.B;
    if(B.RightArm && B.RightForeArm && B.RightHand){
      if(lie){ dv(.6,-.45,.45,_hd1); dv(.25,.85,-.25,_hd2); if(es){ _hd1.lerp(dv(.2,-.2,.8,_hq),es); _hd2.lerp(dv(-.7,.55,-.55,_hq),es); } }
      else { dv(.12,-.95,.14,_hd1); dv(.95,.28,-.12,_hd2); if(es){ _hd1.lerp(dv(.5,-.45,.4,_hq),es); _hd2.lerp(dv(-.1,.8,-.6,_hq),es); } }
      if(ec && h.cdir){ const c=h.cdir; _hq.set(c.x,0,c.z).normalize(); _hd1.lerp(_hp.copy(_hq).multiplyScalar(.8).addScaledVector(_hU,lie?.6:.2),ec); _hd2.lerp(_hp.copy(_hq).multiplyScalar(.85).addScaledVector(_hU,lie?.7:.4),ec); }
      aimW(B,'RightArm','RightForeArm',_hd1); aimW(B,'RightForeArm','RightHand',_hd2);
      B.RightHand.getWorldPosition(_hp); const fing=B.RightHandMiddle1||B.RightHandIndex1; if(fing){ fing.getWorldPosition(_hq); _hq.sub(_hp); _hq.y=0; } else _hq.copy(_hd2).setY(0); if(_hq.lengthSq()>1e-6) _hq.normalize().multiplyScalar(.045);
      h.mesh.position.set(_hp.x+_hq.x, _hp.y-.065, _hp.z+_hq.z); }
    else { a.g.getWorldPosition(_hp); h.mesh.position.set(_hp.x+_hF.x*.3-_hR.x*.25, _hp.y+(lie?.75:1.0)+es*.35, _hp.z+_hF.z*.3-_hR.z*.25); }
    h.mesh.rotation.set(-es*1.05, Math.atan2(_hF.x,_hF.z), 0, 'YXZ'); }
  // âm "ting" khi cụng ly (WebAudio, rất nhỏ)
  let actx=null; function ting(){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const t=actx.currentTime, g=actx.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.12,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+.7); g.connect(actx.destination);
      for(const f of [2637,3951,5274]){ const o=actx.createOscillator(); o.type='sine'; o.frequency.value=f; o.connect(g); o.start(t); o.stop(t+.72); } }catch(e){} }
  function clink(h1, h2){ if(!h1 || !h2 || h1.clink>=0 || h2.clink>=0) return false; const p1=h1.a.g.position, p2=h2.a.g.position; h1.cdir={x:p2.x-p1.x, z:p2.z-p1.z}; h2.cdir={x:p1.x-p2.x, z:p1.z-p2.z}; h1.clink=0; h2.clink=0; h1.sip=h2.sip=-1; h1.nextSip=h2.nextSip=1.8;
    h1.lastClink=h2.lastClink=tt; for(const h of [h1,h2]) if(!h.isMe && h.who.say) try{ h.who.say(['Dzô! 🥂','Cạn ly nào! 🥂','Chúc sức khoẻ! 🍻','Vì chuyến đi biển! 🥂'][Math.floor(Math.random()*4)],2.5); }catch(e){}
    if(h1.isMe || h2.isMe || Math.hypot(p1.x-P.x,p1.z-P.z)<14) setTimeout(ting, 650); return true; }
  // nút 🥂 cụng ly (hiện cả khi đang ngồi / nằm – không dùng chung nút E)
  let clinkBtn=null, partner=null; function ensureBtn(){ if(clinkBtn) return clinkBtn; clinkBtn=document.createElement('button'); clinkBtn.id='aby-clink'; clinkBtn.hidden=true;
      clinkBtn.style.cssText='position:fixed;left:50%;bottom:132px;transform:translateX(-50%);z-index:40;padding:10px 18px;border-radius:999px;border:1px solid rgba(255,215,120,.7);background:rgba(30,24,10,.82);color:#ffe7a8;font:700 15px Segoe UI,system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35)';
      clinkBtn.onclick=e=>{ e.preventDefault(); e.stopPropagation(); doClink(); clinkBtn.blur(); }; document.body.appendChild(clinkBtn); return clinkBtn; }
  function doClink(){ const h=holderOf(me); if(!h || !partner) return false; const ok=clink(h, partner); if(ok){ try{ const p=partner.a.g.position, lb=makeLabel('🥂 Dzô!',null,{fs:44, h:.3, x:(p.x+P.x)/2, y:Math.max(p.y,P.y)+1.9, z:(p.z+P.z)/2, fade:30}); setTimeout(()=>removeLabel(lb),1600); }catch(e){} } return ok; }
  { const prev=HOOK.keys && HOOK.keys.KeyK; if(HOOK.keys) HOOK.keys.KeyK=(e)=>{ if(doClink()) return; if(prev) prev(e); }; }
  // mọi lần trả tiền qua hộp xác nhận 💰 (quầy dừa, quầy bar cafe / nhà hàng, khách sạn…) mà là đồ uống → cầm ly trên tay
  if(W.ui && typeof W.ui.confirm==='function' && !W.ui.__drinkWrap){ const orig=W.ui.confirm; W.ui.__drinkWrap=true;
    W.ui.confirm=function(title, html, btn, onOk, ...rest){ if(typeof onOk==='function' && /chi tiêu|💰/.test(String(title))){ const ok0=onOk; onOk=function(...a){ const c0=S.coins; const r=ok0.apply(this,a);
          try{ if(!ST && (S.coins<c0)){ const id=guessDrink(html); if(id) give('me', id, {nm:String(html).replace(/<[^>]+>/g,' ').split(/Giá:|–/)[0].trim().slice(0,40)}); } }catch(e){} return r; }; }
      return orig.call(this, title, html, btn, onOk, ...rest); }; }

  /* ============================== BỮA ĂN TẠI BÀN (20/11 Bình): món + ly hiện trên bàn → ~1 phút nhân vật tự ăn (dao nĩa / thìa đưa lên miệng)
     và uống (cầm ly lên nhấp rồi đặt lại), nhịp ngẫu nhiên tự nhiên; ngắt bất cứ lúc nào (phím di chuyển hoặc nút "Thôi") → món còn trên bàn, ly chuyển sang cầm tay.
     Dùng chung cho người chơi (mọi quán gọi W.dining) và bot ngồi bàn (W.dining.meal.start / pose / stop). ============================== */
  HAND.water=()=>({g:glass(0xd8f0ff,.13)}); DRINK.delete('water'); NAME_OF.water='Nước lọc';
  const UTM=new THREE.MeshStandardMaterial({color:0xdfe4ea, metalness:.9, roughness:.22});
  const UTG={ fork:build([[new THREE.BoxGeometry(.012,.005,.13),0xdfe4ea,0,0,.065],[new THREE.BoxGeometry(.022,.004,.02),0xdfe4ea,0,.001,.135],...[-.008,0,.008].map(x=>[new THREE.BoxGeometry(.003,.003,.045),0xdfe4ea,x,.002,.165])]),
    spoon:build([[new THREE.BoxGeometry(.011,.005,.13),0xdfe4ea,0,0,.065],[new THREE.SphereGeometry(.022,10,6),0xdfe4ea,0,.004,.15,0,0,.85,.3,1.25]]),
    knife:build([[new THREE.BoxGeometry(.013,.008,.1),0x2a2a2a,0,0,.05],[new THREE.BoxGeometry(.018,.002,.11),0xdfe4ea,0,0,.155]]) };
  const UT_OF={steak:['fork','knife'], lobster:['fork','knife'], salmon:['fork','knife'], tiramisu:['spoon'], flan:['spoon'], icecream:['spoon'], macaron:[null], croissant:[null]};
  const MEAL_DRINK={steak:'wine', lobster:'champagne'};
  // tách món: phần ĂN (đĩa + món) để trên bàn; phần UỐNG (ly / tách) là vật riêng cầm lên được
  function mealParts(id){ if(DRINK.has(id) && id!=='icecream') return {food:null, drink:id}; return {food:id, drink:MEAL_DRINK[id]||'water'}; }
  function foodMesh(id){ itemMesh(id); const c=meshCache[id], g=new THREE.Group(); if(c && c.o){ const a=new THREE.Mesh(c.o,matV); a.castShadow=false; g.add(a); } g.userData.dynamic=true; return g; }
  const MEALS=[], _S=new THREE.Vector3(), _E=new THREE.Vector3(), _H=new THREE.Vector3(), _T=new THREE.Vector3(), _D=new THREE.Vector3(), _N=new THREE.Vector3(), _M=new THREE.Vector3(), _bf=new THREE.Vector3(), _br=new THREE.Vector3();
  const ease=u=>u<=0?0:u>=1?1:u*u*(3-2*u), rnd=(a,b)=>a+Math.random()*(b-a);
  // tay 2 khớp: vai → khuỷu (bẻ theo hướng gợi ý: xuống + ra ngoài) → cổ tay chạm điểm T
  function ik(B, s, T, hint){ const A=B[s+'Arm'], F=B[s+'ForeArm'], Hh=B[s+'Hand']; if(!A || !F || !Hh) return; A.getWorldPosition(_S); F.getWorldPosition(_E); Hh.getWorldPosition(_H);
    const a=_S.distanceTo(_E), b=_E.distanceTo(_H); if(a<1e-4 || b<1e-4) return; _D.copy(T).sub(_S); const d=clamp(_D.length(), Math.abs(a-b)+.02, a+b-.004); _D.normalize();
    const ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1), sa=Math.sqrt(1-ca*ca); _N.copy(hint).addScaledVector(_D,-hint.dot(_D)); if(_N.lengthSq()<1e-6) _N.set(0,-1,0); _N.normalize();
    _M.copy(_D).multiplyScalar(a*ca).addScaledVector(_N,a*sa); aimW(B,s+'Arm',s+'ForeArm',_M); F.getWorldPosition(_E); _M.copy(T).sub(_E); aimW(B,s+'ForeArm',s+'Hand',_M); }
  // who: 'me' hoặc {a, bones, nm}; seat: {x,z,yaw,floor,tableY,frame?}; item: id món trong menu
  function mealStart(who, seat, item, o={}){ const isMe=who==='me', a=isMe?me:who.a; if(!a) return null; const parts=mealParts(item), f=[Math.sin(seat.yaw),Math.cos(seat.yaw)], r=[Math.cos(seat.yaw),-Math.sin(seat.yaw)], ty=(seat.tableY ?? seat.floor+.77)+.006;
    const M={isMe, who, a, B:isMe?meBones():(who.bones||bonesOf(a.g)), seat, item, t:0, dur:o.dur ?? rnd(55,68), next:rnd(1.2,2.5), act:null, f, r, last:null, bites:0, sips:0, look:0, lookDir:0};
    if(parts.food){ const g=foodMesh(parts.food); scene.add(g); M.food={g, lx:seat.x+f[0]*.42, ly:ty, lz:seat.z+f[1]*.42}; M.ut=(UT_OF[parts.food]||['fork']).map(k=>{ if(!k) return null; const m=new THREE.Mesh(UTG[k],UTM); m.visible=false; m.userData.dynamic=true; scene.add(m); return {k,m}; }).filter(Boolean); }
    if(parts.drink){ const g=handMesh(parts.drink); scene.add(g); M.cup={g, id:parts.drink, lx:seat.x+f[0]*.36+r[0]*.26, ly:ty, lz:seat.z+f[1]*.36+r[1]*.26, held:false, tilt:0}; }
    MEALS.push(M); placeMeal(M); return M; }
  function placeMeal(M){ const fr=M.seat.frame, yw=M.seat.yaw+frameYaw(fr); if(M.food){ const p=M.food, [x,y,z]=toWorld(fr,p.lx,p.ly,p.lz); p.g.position.set(x,y,z); p.g.rotation.y=yw+.4; } if(M.cup && !M.cup.held){ const p=M.cup, [x,y,z]=toWorld(fr,p.lx,p.ly,p.lz); p.g.position.set(x,y,z); p.g.rotation.set(0,yw,0); } }
  // dừng: tay về tự nhiên, dao nĩa cất; ly → cầm tay (handCup) hoặc để lại bàn; món ăn để lại bàn (dọn sau 60 s, trên tàu đang chạy thì dọn luôn)
  function mealStop(M, o={}){ const i=MEALS.indexOf(M); if(i<0) return; MEALS.splice(i,1); if(M.ut) for(const u of M.ut) scene.remove(u.m);
    if(M.cup){ if(o.handCup && M.isMe){ scene.remove(M.cup.g); give('me', M.cup.id, {life:Math.max(30,120-M.sips*15), firstSip:4}); } else if(o.clear || M.seat.frame){ scene.remove(M.cup.g); } else LEFT.push({g:M.cup.g, at:performance.now()}); }
    if(M.food){ if(o.clear || M.seat.frame) scene.remove(M.food.g); else LEFT.push({g:M.food.g, at:performance.now()}); }
    if(M.isMe) showStop(false); }
  // 1 động tác: ăn 2,2–3 s (với tới đĩa → xắn → đưa lên miệng → nhai → hạ tay) · uống 3–4 s (cầm ly → nâng → nghiêng nhấp → đặt lại)
  function nextAct(M){ const canEat=!!M.food, canDrink=!!M.cup; let k; if(canEat && canDrink) k=(M.last==='drink' || Math.random()<.68) ? 'eat' : 'drink'; else k=canEat?'eat':'drink'; if(k==='eat' && M.last==='eat' && M.bites%3===2 && canDrink) k='drink';
    M.last=k; if(k==='eat'){ M.bites++; M.act={k, t:0, dur:rnd(2.2,3), off:[rnd(-.05,.05), rnd(-.04,.04)], cut:Math.random()<.6}; } else { M.sips++; M.act={k, t:0, dur:rnd(3,4.2), hold:Math.random()<.25 ? rnd(1,2.2) : 0}; M.act.dur+=M.act.hold; }
    M.next=k==='drink' ? rnd(2.5,6.5) : (Math.random()<.2 ? rnd(5,9) : rnd(1.4,4)); }
  function mealPose(M, dt){ M.t+=dt; placeMeal(M); const a=M.a; if(!a.g.visible && !M.isMe){ if(M.ut) for(const u of M.ut) u.m.visible=false; return; }
    if(M.t>M.dur && !M.act){ mealStop(M,{}); if(M.isMe) toast('🍽️ Đã dùng xong – ngồi thêm tuỳ thích, đứng dậy bất cứ lúc nào.',2600); if(M.onDone) try{ M.onDone(); }catch(e){} return; }
    if(!M.act){ M.next-=dt; if(M.next<=0) nextAct(M); } const B=M.B; if(!B.RightArm || !B.Head) return;
    a.g.updateMatrixWorld(true); a.g.getWorldDirection(_bf); _bf.y=0; if(_bf.lengthSq()<1e-6) _bf.set(0,0,1); _bf.normalize(); _br.set(-_bf.z,0,_bf.x);
    const fr=M.seat.frame, ty=(M.food||M.cup).ly, rest=k=>{ const [x,y,z]=toWorld(fr, M.seat.x+M.f[0]*.24+M.r[0]*k*.2, ty+.07, M.seat.z+M.f[1]*.24+M.r[1]*k*.2); return _T.set(x,y,z); };
    const mouth=()=>{ B.Head.getWorldPosition(_T); return _T.addScaledVector(_bf,.12).addScaledVector(_hU,-.045); };
    const hintR=new THREE.Vector3().addScaledVector(_hU,-1).addScaledVector(_br,.55).addScaledVector(_bf,-.15), hintL=new THREE.Vector3().addScaledVector(_hU,-1).addScaledVector(_br,-.55).addScaledVector(_bf,-.15);
    const lerpP=(A,Bv,u)=>A.lerp(Bv,ease(u));
    const act=M.act; let tR=rest(1).clone(), tL=rest(-1).clone(), utOn=!!M.food, cupTilt=0, utDir=null;
    if(act){ act.t+=dt; const u=act.t/act.dur;
      if(act.k==='eat'){ const fp=M.food.g.position, plate=new THREE.Vector3(fp.x+_br.x*act.off[0]+_bf.x*act.off[1], fp.y+.07, fp.z+_br.z*act.off[0]+_bf.z*act.off[1]);
        if(u<.24) lerpP(tR,plate,u/.24); else if(u<.4){ tR.copy(plate); if(act.cut) tR.addScaledVector(_bf,Math.sin((u-.24)/.16*Math.PI*3)*.025); } else if(u<.62) lerpP(tR.copy(plate),mouth(),(u-.4)/.22); else if(u<.74) tR.copy(mouth()); else lerpP(tR.copy(mouth()),rest(1),(u-.74)/.26);
        if(M.ut && M.ut.length>1 && u>.1 && u<.45){ const e=Math.sin((u-.1)/.35*Math.PI); tL.lerp(new THREE.Vector3(fp.x-_br.x*.09, fp.y+.08, fp.z-_br.z*.09),e); }
        if(u>.62 && u<.74) aimW(B,'Neck','Head',new THREE.Vector3().addScaledVector(_hU,1).addScaledVector(_bf,.12+Math.sin(act.t*14)*.04)); }
      else { const C=M.cup, base=(()=>{ const [x,y,z]=toWorld(fr,C.lx,C.ly,C.lz); return new THREE.Vector3(x,y+.075,z); })(), h=act.hold, d=act.dur-h, s=act.t;
        const t1=d*.2, t2=d*.28, t3=d*.5, t4=t3+h, t5=t4+d*.2, t6=t5+d*.14;
        if(s<t1) lerpP(tR,base,s/t1); else if(s<t2){ tR.copy(base); C.held=true; } else if(s<t3){ C.held=true; lerpP(tR.copy(base),mouth().clone().addScaledVector(_bf,.03),(s-t2)/(t3-t2)); cupTilt=ease((s-t2)/(t3-t2))*.6; }
        else if(s<t4){ C.held=true; tR.copy(mouth()).addScaledVector(_bf,.03); cupTilt=.6+Math.min(1,(s-t3)/.6)*.5; }
        else if(s<t5){ C.held=true; lerpP(tR.copy(mouth()).addScaledVector(_bf,.03),base,(s-t4)/(t5-t4)); cupTilt=1.1*(1-ease((s-t4)/(t5-t4))); }
        else if(s<t6){ tR.copy(base); C.held=false; } else { C.held=false; lerpP(tR.copy(base),rest(1),(s-t6)/Math.max(.01,act.dur-t6)); }
        utOn=false; }
      if(act.t>=act.dur){ M.act=null; if(M.cup) M.cup.held=false; } }
    else { /* nghỉ giữa các miếng: thỉnh thoảng ngẩng nhìn cảnh / quay sang bên */ M.look-=dt; if(M.look<=0){ M.look=rnd(3,8); M.lookDir=Math.random()<.5 ? 0 : rnd(-.5,.5); } if(M.lookDir) aimW(B,'Neck','Head',new THREE.Vector3().addScaledVector(_hU,1).addScaledVector(_br,M.lookDir*.5).addScaledVector(_bf,-.05)); }
    ik(B,'Right',tR,hintR); ik(B,'Left',tL,hintL);
    if(M.ut){ for(const [i,u] of M.ut.entries()){ const side=i===0?'Right':'Left', hb=B[side+'Hand'], fb=B[side+'ForeArm']; u.m.visible=utOn && !!hb; if(!u.m.visible) continue; hb.getWorldPosition(_H); fb.getWorldPosition(_E); _D.copy(_H).sub(_E).normalize(); u.m.position.copy(_H).addScaledVector(_D,.035); _N.copy(_D).multiplyScalar(-1); u.m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1), _D.clone().negate()); } }
    if(M.cup && M.cup.held && B.RightHand){ B.RightHand.getWorldPosition(_H); const fing=B.RightHandMiddle1||B.RightHandIndex1; if(fing){ fing.getWorldPosition(_E); _E.sub(_H); _E.y=0; if(_E.lengthSq()>1e-6) _E.normalize().multiplyScalar(.04); } else _E.set(0,0,0); M.cup.g.position.set(_H.x+_E.x, _H.y-.065, _H.z+_E.z); M.cup.g.rotation.set(-cupTilt, Math.atan2(_bf.x,_bf.z), 0, 'YXZ'); } }
  // nút "✋ Thôi" (người chơi đang ăn uống)
  let stopBtn=null; function showStop(on){ if(on && !stopBtn){ stopBtn=document.createElement('button'); stopBtn.id='aby-meal-stop'; stopBtn.textContent='✋ Thôi (để món lại, cầm ly theo)';
      stopBtn.style.cssText='position:fixed;left:50%;bottom:180px;transform:translateX(-50%);z-index:40;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:rgba(20,24,30,.82);color:#fff;font:600 14px Segoe UI,system-ui,sans-serif;cursor:pointer';
      stopBtn.onclick=e=>{ e.preventDefault(); e.stopPropagation(); const M=MEALS.find(m=>m.isMe); if(M){ mealStop(M,{handCup:true}); toast('✋ Đã thôi – món để lại trên bàn, ly cầm theo tay.',2400); } stopBtn.blur(); }; document.body.appendChild(stopBtn); }
    if(stopBtn) stopBtn.hidden=!on; }
  const LEFT=[];

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
    if(!s.lie){ const old=holderOf(me); if(old) drop(old,true); ST.meal=mealStart('me', {...s, tableY:ty}, it.id); ST.placed=null; showStop(true); }   /* 20/11: ngồi bàn → món + ly trên bàn, tự ăn uống ~1 phút */
    else if(DRINK.has(it.id)){ give('me', it.id, {nm:`${it.ic} ${it.nm}`, firstSip:3.5}); }   /* nằm ghế: đồ uống đưa tận tay */
    else { const g=itemMesh(it.id); scene.add(g); ST.placed={g, lx, ly:ty+.005, lz}; ST.placedAt=performance.now(); }
    if(it.b==='both'){ buff('energy',it.mi); buff('coffee',it.mi); } else buff(it.b,it.mi);
    S.diningPaidUntil=Date.now()+HOUR; save(); wsay('Món của quý khách đây ạ. Chúc ngon miệng! 🥂',4);
    toast(`🥂 ${it.ic} ${it.nm} đã lên bàn${it.pr?` · −${fmt(it.pr)} 💰`:''} · ${it.b==='energy'?'⚡ nhanh hơn':it.b==='coffee'?'☕ tỉnh táo':'✨ nhanh + tỉnh'} ${it.mi} phút · 1 tiếng nữa bồi bàn mới hỏi lại.`,5200);
    if(s.lie && !DRINK.has(it.id)) try{ L.emote && L.emote('cheer',2); }catch(e){} }

  /* ============================== NGỒI / ĐỨNG ============================== */
  function onSit(o){ const vn=typeof o.venue==='string' ? V.venues.get(o.venue) : (o.venue||{name:'Phục vụ bàn', kind:'cafe'}); if(!vn) return;
    if(ST) end(true); const left=paidLeft(); if(left>0){ toast(`🪑 Ngồi thoải mái – bạn đã gọi món, ${Math.ceil(left/60000)} phút nữa bồi bàn mới hỏi lại.`,3200); return; }
    if(vn.kind==='lounge' && V.lastDecline && Date.now()-V.lastDecline<90000) return;   /* vừa từ chối xong → không hỏi lại ngay */
    if(!makeWaiter()) return; const seat={x:o.x, y:o.y, z:o.z, yaw:o.yaw, floor:o.floor ?? (o.y-.47), lie:!!o.lie, frame:o.frame||null, tableY:o.tableY ?? (vn.tableH!=null ? (o.floor ?? (o.y-.47))+vn.tableH : null), waiterFrom:o.waiterFrom||vn.waiterFrom||null};
    ST={phase:'approach', seat, venue:vn, t:0, veh:HOOK.vehicle}; const pl=plan(seat); ST.from=pl.from; ST.to=pl.to; ST.wy=pl.y;
    waiter.a.g.visible=true; setWaiter(pl.from[0], pl.from[1], pl.y, Math.atan2(pl.to[0]-pl.from[0], pl.to[1]-pl.from[1])); waiter.tray.visible=false; }
  function end(silent){ if(!ST) return; if(ST.modal){ try{ ST.modal.close(); }catch(e){} ST.modal=null; } fpv(false); if(ST.meal){ mealStop(ST.meal,{handCup:true}); ST.meal=null; }
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
    try{ drinkFrame(dt); }catch(e){ if(!V.dErr){ V.dErr=1; console.warn('[dining] đồ uống', e); } }
    try{ for(const M of MEALS.slice()) if(M.isMe) mealPose(M,dt); }catch(e){ if(!V.mErr){ V.mErr=1; console.warn('[dining] bữa ăn', e); } }
    for(let i=LEFT.length-1;i>=0;i--) if(performance.now()-LEFT[i].at>60000){ scene.remove(LEFT[i].g); LEFT.splice(i,1); }
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
    else if(A.phase==='serve'){ faceSeat(); if(A.t>.9 && !A.served){ A.served=true; w.tray.clear(); w.tray.add(new THREE.Mesh(trayG,trayM)); serve(); } if(A.t>2.4){ fpv(false); A.phase='leave'; A.t=0; } }
    else if(A.phase==='leave'){ w.tray.visible=A.t<.2 && w.tray.visible; if(walkTo(A.from[0],A.from[1]) || A.t>8){ w.a.g.visible=false; w.tray.visible=false; if(V.leaving===A) V.leaving=null; if(ST===A) ST.phase='seated'; } }
    if(w.tray.visible){ const f=[Math.sin(w.lhd),Math.cos(w.lhd)]; const [x,y,z]=toWorld(A.seat.frame, w.lx+f[0]*.42, w.ly+1.08, w.lz+f[1]*.42); w.tray.position.set(x,y,z); w.tray.rotation.y=w.lhd+frameYaw(A.seat.frame); try{ w.po.apply('present',tt); }catch(e){} }
    if(A.placed && A.placed.g){ const p=A.placed; const [x,y,z]=toWorld(A.seat.frame,p.lx,p.ly,p.lz); p.g.position.set(x,y,z); p.g.rotation.y=A.seat.yaw+frameYaw(A.seat.frame)+.4; }
    if(V.leftover && V.leftover.g && A.seat.frame){ /* món còn trên bàn tàu đang chạy */ } });

  // khung hình đồ uống: người chơi (trừ khi abyssal_beachlife tự gọi sau tư thế nằm) + tìm người cụng ly + bot tự cụng ly với nhau
  let pairT=0;
  function drinkFrame(dt){ const mh=holderOf(me); if(mh && !api.extPlayer) pose(mh, dt);
    partner=null; if(mh && !uiOpen()){ let bd=9; const meLying=!!api.meLie; for(const h of HOLD){ if(h===mh || !h.a.g.visible || (h.who && h.who.hidden)) continue; const lim=(meLying || (h.who && h.who.lie && h.who.lie())) ? 3.9 : 2.7, p=h.a.g.position, d=Math.hypot(p.x-P.x,p.z-P.z); if(d<Math.min(bd,lim) && Math.abs(p.y-P.y)<1.9){ bd=d; partner=h; } } }
    const b=(mh||clinkBtn) ? ensureBtn() : null; if(b){ const show=!!partner && mh.clink<0; if(b.hidden===show) b.hidden=!show; if(show){ const t=`🥂 Cụng ly với ${partner.nm.replace(/^[^\p{L}]+/u,'').split('·')[0].trim()||'bạn'} (K)`; if(b.textContent!==t) b.textContent=t; } }
    pairT-=dt; if(pairT<=0){ pairT=1.2; const bots=HOLD.filter(h=>!h.isMe && h.a.g.visible && !(h.who && h.who.hidden) && h.clink<0 && tt-h.lastClink>20);
      for(let i=0;i<bots.length;i++) for(let j=i+1;j<bots.length;j++){ const p=bots[i].a.g.position, q=bots[j].a.g.position; if(Math.hypot(p.x-q.x,p.z-q.z)<2.2 && Math.abs(p.y-q.y)<1.5 && Math.random()<.35){ clink(bots[i],bots[j]); i=bots.length; break; } } }
    for(const h of HOLD.slice()) if(!h.isMe && !h.ext) pose(h, dt); }
  const uiOpen=()=>!!document.querySelector('.modalWrap:not([hidden])');

  const api={ register, onSit, onStand:()=>end(), paidLeft, reset:()=>{ S.diningPaidUntil=0; save(); V.lastDecline=0; }, state:()=>ST?{phase:ST.phase, venue:ST.venue.name, item:ST.item&&ST.item.nm}:(V.leaving?{phase:'leave'}:null), venues:V.venues, TABS, menu:TABS, autoScan,
    meal:{ start:mealStart, pose:mealPose, stop:mealStop, list:MEALS, parts:mealParts, stopBtn:()=>stopBtn },
    drinks:{ give, drop, pose, clink, holderOf, list:HOLD, ids:[...DRINK], guess:guessDrink, doClink, partner:()=>partner, bonesOf, aimW }, meLie:null, extPlayer:false };
  W.dining=api; return api; }
