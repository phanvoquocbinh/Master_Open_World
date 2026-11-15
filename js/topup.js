// QC World – S19g: 💰 NẠP TIỀN – nút "+" cạnh ví → trang 2 gói. CẢ HAI GÓI CHỈ LÀ HOẠT CẢNH VUI TRONG GAME:
// không có thanh toán thật, không gọi API thanh toán, không mở ngân hàng / ví – cuối hoạt cảnh chỉ cộng tiền trong game (ctx.addCoins).
//  • Gói 1 – Nạp 500: cầm điện thoại lên, ngón tay tự bấm 💬 Tin nhắn → "Anh trai Bình Phan" → gõ phím ảo nhắn xin, anh trả lời,
//    gõ số tài khoản, anh báo đã chuyển → thông báo nhận 500 → cộng tiền.
//  • Gói 2 – Ủng hộ nhà phát triển 20k (tặng 2000): chiếc mui trần đuôi thuyền màu đỏ "QC Sovereign Boat-Tail" (thiết kế gốc, không logo/hãng)
//    chạy tới; vệ sĩ lái xe xuống mở cửa; anh Bình Phan (áo thun đen, quần kem, đôi cánh vàng sau lưng, mặt lấy từ ảnh data/binhphan_face.png nếu có)
//    bước ra nói chuyện, đưa điện thoại chạm điện thoại người chơi → +2000; chào rồi lên xe, xe bay lên trời biến mất.
//  Trong lúc diễn: khoá điều khiển, có nút ⏭ Bỏ qua (Esc) – bỏ qua vẫn được cộng tiền.
import { makePoser } from './pose.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export function makeTopup(W, ctx, G){
  const {THREE, HOOK, toast, P, me, scene} = W;
  const {ui, addCoins} = ctx;
  const V3=THREE.Vector3;
  const BP_NAME='Anh trai Bình Phan', BP_NUM='555-999-9999';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), sm=t=>{ t=clamp(t,0,1); return t*t*(3-2*t); };
  const lerpAngle=(a,b,t)=>{ const d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; return a+d*t; };
  injectCSS();

  /* ============================== nút "+" cạnh ví + trang nạp ============================== */
  const plus=document.createElement('button'); plus.className='tuPlus'; plus.title='Nạp tiền'; plus.textContent='+'; plus.onclick=()=>openShop();
  const wal=document.getElementById('wallet'); if(wal) wal.after(plus); else (document.getElementById('top')||document.body).appendChild(plus);
  function openShop(){ if(SC.on) return; const m=ui.modal('💰 Nạp tiền', {wide:true});
    m.body.innerHTML=`<p class="muted" style="margin-top:0">Hoạt cảnh vui trong game – không có giao dịch thật, không trừ tiền thật.</p>
      <div class="tuPacks">
        <div class="tuPack"><div class="tuIc">📱</div><b>Gói 1 · Nạp 500 💰</b><small>Liên hệ anh Bình Phan để xin code nạp vô</small><button class="btn pri" data-p="1">💬 Liên hệ anh Bình Phan</button></div>
        <div class="tuPack gold"><div class="tuIc">🚗</div><b>Gói 2 · Ủng hộ nhà phát triển 20k</b><small>Được tặng 2.000 💰 – anh Bình Phan tới tận nơi trao quà</small><button class="btn pri" data-p="2">💛 Ủng hộ</button></div>
      </div>`;
    m.body.querySelector('[data-p="1"]').onclick=()=>{ m.close(); setTimeout(pack1, 250); };
    m.body.querySelector('[data-p="2"]').onclick=()=>{ m.close(); setTimeout(pack2, 250); }; }

  /* ============================== khung đoạn cắt cảnh ============================== */
  const SC={on:false, alive:false, given:false, coins:0, why:'', cleanup:null, frame:null};
  const tasks=new Set();
  const run=fn=>new Promise(res=>{ const t=dt=>{ if(!SC.alive || fn(dt)){ res(); return true; } return false; }; tasks.add(t); });
  const wait=s=>{ let t=0; return run(dt=>(t+=dt)>=s); };
  const ms=n=>new Promise(r=>setTimeout(r,n));
  HOOK.onFrame.push((dt,T)=>{ for(const t of [...tasks]) if(t(dt)) tasks.delete(t); if(SC.frame) SC.frame(dt,T); });
  const cine=document.createElement('div'); cine.id='tuCine'; cine.hidden=true;
  cine.innerHTML='<div class="tuBarT"></div><div class="tuBarB"></div><button class="btn" id="tuSkip">⏭ Bỏ qua (Esc)</button>';
  document.body.appendChild(cine); cine.querySelector('#tuSkip').onclick=()=>finish();
  const setEscSkip=()=>{ const f=()=>{ finish(); return true; }; f.__tu=1; HOOK.onEscape=f; };
  function begin(coins, why){ SC.on=true; SC.alive=true; SC.given=false; SC.coins=coins; SC.why=why; cine.hidden=false; document.body.classList.add('tu-cine'); W.clearKeys(); setEscSkip(); }
  function give(){ if(SC.given) return; SC.given=true; addCoins(SC.coins, SC.why); }
  function finish(){ if(!SC.on) return; SC.alive=false; for(const t of [...tasks]) t(0); tasks.clear(); give();
    try{ SC.cleanup && SC.cleanup(); }catch(e){ console.warn('topup cleanup', e); } SC.cleanup=null; SC.frame=null;
    SC.on=false; cine.hidden=true; document.body.classList.remove('tu-cine','tu-phone'); HOOK.camOverride=null; HOOK.blockInput=false;
    if(HOOK.onEscape && HOOK.onEscape.__tu) HOOK.onEscape=null; W.canvas.focus(); }

  /* ============================== GÓI 1 – nhắn tin xin tiền ============================== */
  const ph=G.phone;
  const qs=s=>ph.body.querySelector(s) || ph.el.querySelector(s);
  let finger=null;
  function makeFinger(){ if(finger) return; finger=document.createElement('div'); finger.id='tuFinger'; document.body.appendChild(finger);
    const r=ph.el.getBoundingClientRect(); moveFinger(r.left+r.width*.62, r.bottom+30, true); }
  function moveFinger(x,y,instant){ finger.style.transition=instant?'none':'left .2s ease-out, top .2s ease-out'; finger.style.left=x+'px'; finger.style.top=y+'px'; }
  async function tap(el){ if(!el || !finger || !SC.alive) return; if(el.scrollIntoView) el.scrollIntoView({block:'nearest'});
    const r=el.getBoundingClientRect(); moveFinger(r.left+r.width/2, r.top+r.height/2); await ms(230); if(!finger) return;   // bị bỏ qua giữa chừng
    finger.classList.add('tap'); el.classList.add('tuPress'); await ms(110); el.classList.remove('tuPress'); if(!finger) return; finger.classList.remove('tap'); await ms(40); }
  const KROWS=['1234567890','qwertyuiop','asdfghjkl','zxcvbnm'];
  const kb=document.createElement('div'); kb.className='tuKb';
  kb.innerHTML=`<div class="tuInput"><span class="tuTxt"></span><i class="tuCaret"></i></div>
    <div class="tuKeys">${KROWS.map(r=>`<div class="tuRow">${[...r].map(c=>`<b data-k="${c}">${c}</b>`).join('')}</div>`).join('')}
    <div class="tuRow"><b data-k="sp" class="sp">dấu cách</b><b data-k="send" class="snd">➤</b></div></div>`;
  const kbTxt=kb.querySelector('.tuTxt');
  const baseKey=ch=>{ if(ch===' ') return 'sp'; if(ch==='đ'||ch==='Đ') return 'd'; return ch.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); };
  async function typeText(s){ for(const ch of s){ if(!SC.alive) return; const key=kb.querySelector(`[data-k="${baseKey(ch)}"]`); if(key) await tap(key); else await ms(60); kbTxt.textContent+=ch; } }
  function sendMine(){ const text=kbTxt.textContent.trim(); kbTxt.textContent=''; if(!text) return; ph.addMsg(BP_NUM, {me:true, text, ts:Date.now(), st:'sent'}); ph.render(); }
  async function bpTyping(sec){ const chat=qs('.phChat'); let b=null; if(chat){ b=document.createElement('div'); b.className='bub them tuTyping'; b.textContent='Anh trai Bình Phan đang nhập…'; chat.appendChild(b); chat.scrollTop=chat.scrollHeight; } await wait(sec); if(b) b.remove(); }
  function bpReply(text){ ph.addMsg(BP_NUM, {me:false, text, ts:Date.now(), name:BP_NAME}); ph.render(); }
  const notif=document.createElement('div'); notif.className='tuNotif';
  function showNotif(title, sub){ notif.innerHTML=`<b>${title}</b><small>${sub}</small>`; ph.el.appendChild(notif); requestAnimationFrame(()=>requestAnimationFrame(()=>notif.classList.add('on'))); }
  function ensureContact(){ const S=ph.state; if(!S.contacts.some(c=>c.num===BP_NUM)){ S.contacts.push({name:BP_NAME, num:BP_NUM}); S.contacts.sort((a,b)=>a.name.localeCompare(b.name,'vi')); }
    const th=S.threads[BP_NUM]; if(!th || !th.length) ph.addMsg(BP_NUM, {me:false, text:'Chào em 😎 Cần gì cứ nhắn anh nhé!', ts:Date.now()-3600e3, name:BP_NAME}); ph.save(); }
  async function pack1(){ if(SC.on) return;
    if(HOOK.blockInput || W.gadgets && W.gadgets.laptop && W.gadgets.laptop.isOpen){ toast('Đóng màn hình / laptop đang mở trước đã nhé.', 2400); return; }
    if(ph.isOpen) ph.close();
    begin(500, `💰 Đã nhận 500 tiền từ ${BP_NAME}!`); ensureContact();
    SC.cleanup=()=>{ if(finger){ finger.remove(); finger=null; } kb.remove(); kbTxt.textContent=''; notif.remove(); notif.classList.remove('on'); if(ph.isOpen) ph.close(); };
    await ms(120); ph.open(); setEscSkip(); HOOK.blockInput=true; document.body.classList.add('tu-phone');
    await wait(.8); if(!SC.alive) return;
    ph.go('home'); await ms(120); makeFinger(); await ms(250);
    await tap(qs('[data-go="msgs"]')); if(!SC.alive) return; ph.go('msgs'); await wait(.55); if(!SC.alive) return;
    await tap(qs(`[data-th="${BP_NUM}"]`)); if(!SC.alive) return; ph.go('thread', BP_NUM); await wait(.35); if(!SC.alive) return;
    ph.el.appendChild(kb); await wait(.45); if(!SC.alive) return;
    await typeText('Cho xin 500 đồng trải nghiệm game đi bợn hiền'); if(!SC.alive) return;
    await tap(kb.querySelector('[data-k="send"]')); sendMine(); await wait(.5); if(!SC.alive) return;
    await bpTyping(1.6); if(!SC.alive) return; bpReply('OK , đưa số tài khoản đây'); await wait(.9); if(!SC.alive) return;
    await typeText('123456789'); if(!SC.alive) return;
    await tap(kb.querySelector('[data-k="send"]')); sendMine(); await wait(.45); if(!SC.alive) return;
    await bpTyping(1.8); if(!SC.alive) return; bpReply('Đã chuyển, trải nghiệm nhé'); await wait(.9); if(!SC.alive) return;
    showNotif('🏦 Ví QC · +500 💰', `${BP_NAME} vừa chuyển cho bạn 500 tiền`); give(); await wait(2.8);
    finish(); }

  /* ============================== GÓI 2 – xe mui trần + anh Bình Phan ============================== */
  function canvasTex(w,h,draw,srgb=true){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); if(srgb) t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; }
  // gỗ sàn đuôi thuyền: ván dọc thân xe, đường ron sáng, vân gỗ
  const woodTex=()=>canvasTex(512,512,(g,w,h)=>{ const N=9, pw=w/N; for(let i=0;i<N;i++){ const base=[150+((i*37)%25),88+((i*19)%14),48]; g.fillStyle=`rgb(${base})`; g.fillRect(i*pw,0,pw,h);
      for(let k=0;k<26;k++){ g.strokeStyle=`rgba(60,30,10,${.08+Math.random()*.12})`; g.lineWidth=1+Math.random()*1.5; const x=i*pw+Math.random()*pw; g.beginPath(); g.moveTo(x,0); g.bezierCurveTo(x+6,h*.3,x-6,h*.7,x+3,h); g.stroke(); }
      g.fillStyle='#e9dcc0'; g.fillRect(i*pw,0,3,h); } });
  // hoạ tiết vàng chạy dọc hông xe: dây leo uốn lượn + lá + chỉ viền
  const goldTex=()=>canvasTex(2048,160,(g,w,h)=>{ g.clearRect(0,0,w,h); const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#fff1b0'); gr.addColorStop(.5,'#e0a933'); gr.addColorStop(1,'#a8711c');
      g.strokeStyle=gr; g.fillStyle=gr; g.lineWidth=5; g.beginPath(); g.moveTo(0,10); g.lineTo(w,10); g.moveTo(0,h-10); g.lineTo(w,h-10); g.stroke();
      g.lineWidth=4; g.beginPath(); for(let x=0;x<=w;x+=8){ const y=h/2+Math.sin(x/90)*28; x?g.lineTo(x,y):g.moveTo(x,y); } g.stroke();
      for(let x=60;x<w;x+=180){ const y=h/2+Math.sin(x/90)*28, s=Math.sin(x/90)>0?-1:1; g.lineWidth=3; g.beginPath(); for(let a=0;a<Math.PI*3.2;a+=.15){ const r=4+a*5; g.lineTo(x+Math.cos(a)*r, y+s*(Math.sin(a)*r)); } g.stroke();
        for(const d of [-1,1]){ g.save(); g.translate(x+d*40, y+s*18); g.rotate(d*.6); g.beginPath(); g.ellipse(0,0,16,6,0,0,Math.PI*2); g.fill(); g.restore(); } } });
  function buildCar(){
    const g=new THREE.Group(); g.name='QC Sovereign Boat-Tail'; g.rotation.order='YXZ';
    const paint=new THREE.MeshPhysicalMaterial({color:0x9e0b18, metalness:.5, roughness:.26, clearcoat:1, clearcoatRoughness:.05});
    const chrome=new THREE.MeshStandardMaterial({color:0xf3f5f8, metalness:1, roughness:.1});
    const rubber=new THREE.MeshStandardMaterial({color:0x121214, roughness:.92});
    const leather=new THREE.MeshStandardMaterial({color:0xf0e5cf, roughness:.5});
    const piping=new THREE.MeshStandardMaterial({color:0x8a1520, roughness:.45});
    const carpet=new THREE.MeshStandardMaterial({color:0xd6c8ad, roughness:.95});
    const wood=new THREE.MeshPhysicalMaterial({map:woodTex(), roughness:.35, clearcoat:.9, clearcoatRoughness:.1});
    const deco=new THREE.MeshStandardMaterial({map:goldTex(), transparent:true, metalness:.85, roughness:.3, polygonOffset:true, polygonOffsetFactor:-2, depthWrite:false});
    const glass=new THREE.MeshPhysicalMaterial({color:0xd8ecff, roughness:.05, metalness:0, transparent:true, opacity:.25, depthWrite:false});
    const lamp=new THREE.MeshBasicMaterial({color:0xfff6dc}), tail=new THREE.MeshBasicMaterial({color:0xff2a2a});
    const add=(geo,m,x=0,y=0,z=0,par=g)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; par.add(o); return o; };
    // thân: mặt cắt dọc (z,y) đùn theo bề ngang, vuốt hẹp phần đuôi thuyền; khoang lái thả thấp (mui trần)
    const s=new THREE.Shape(); s.moveTo(2.82,.3); s.lineTo(2.98,.48); s.splineThru([new THREE.Vector2(2.97,.72), new THREE.Vector2(2.75,.87), new THREE.Vector2(2.1,.94), new THREE.Vector2(1.0,.97)]);
    s.lineTo(.86,.97); s.lineTo(.8,.5); s.lineTo(-1.42,.5); s.lineTo(-1.5,.93); s.splineThru([new THREE.Vector2(-2.2,.88), new THREE.Vector2(-2.75,.74), new THREE.Vector2(-3.05,.55)]);
    s.lineTo(-3.06,.42); s.lineTo(-2.82,.3); s.lineTo(2.82,.3);
    let bg=new THREE.ExtrudeGeometry(s, {depth:1.74, bevelEnabled:true, bevelThickness:.09, bevelSize:.09, bevelSegments:4, curveSegments:18});
    bg.translate(0,0,-.87); bg.rotateY(-Math.PI/2); bg.deleteAttribute('uv'); bg.deleteAttribute('normal'); bg=mergeVertices(bg);
    { const p=bg.attributes.position; for(let i=0;i<p.count;i++){ const z=p.getZ(i); let k=0; if(z<-1.5) k=Math.pow(Math.min(1,(-1.5-z)/1.6),1.6)*.48; else if(z>2.35) k=Math.pow((z-2.35)/.7,2)*.14; p.setX(i, p.getX(i)*(1-k)); } }
    bg.computeVertexNormals(); add(bg, paint);
    // gờ crôm chạy dọc sống nắp capo + đuôi thuyền
    add(new THREE.BoxGeometry(.03,.025,1.85), chrome, 0,1.0,1.92); add(new THREE.BoxGeometry(.03,.025,1.35), chrome, 0,.95,-2.2).rotation.x=-.12;
    // sàn gỗ đuôi thuyền
    const dk=add(new THREE.PlaneGeometry(1.0,1.3), wood, 0,.97,-2.12); dk.rotation.x=-Math.PI/2-.13; dk.receiveShadow=true;
    // hoạ tiết vàng hai bên hông (phần cố định trước cửa)
    for(const sd of [-1,1]){ const d=add(new THREE.PlaneGeometry(1.5,.16), deco, sd*.985,.7,1.6); d.rotation.y=sd*Math.PI/2; d.castShadow=false; }
    // kính chắn gió + khung crôm
    const ws=new THREE.Group(); ws.position.set(0,.97,.88); ws.rotation.x=-.42; g.add(ws);
    add(new THREE.PlaneGeometry(1.62,.36), glass, 0,.19,0, ws).castShadow=false;
    add(new THREE.BoxGeometry(1.68,.03,.03), chrome, 0,.38,0, ws); for(const sd of [-1,1]) add(new THREE.BoxGeometry(.03,.4,.03), chrome, sd*.83,.19,0, ws);
    // lưới tản nhiệt (thiết kế riêng: khung crôm + thanh ngang) + đèn
    add(new THREE.BoxGeometry(.66,.4,.06), chrome, 0,.66,3.02); add(new THREE.BoxGeometry(.58,.32,.05), new THREE.MeshStandardMaterial({color:0x101010, roughness:.6}), 0,.66,3.035);
    for(let i=0;i<6;i++) add(new THREE.BoxGeometry(.56,.018,.03), chrome, 0,.53+i*.052,3.06);
    for(const sd of [-1,1]){ const hl=add(new THREE.SphereGeometry(.11,16,12), lamp, sd*.62,.7,2.86); hl.scale.set(1.25,.75,.5); add(new THREE.TorusGeometry(.12,.012,6,24), chrome, sd*.62,.7,2.92).scale.set(1.25,.75,1);
      add(new THREE.BoxGeometry(.32,.05,.04), tail, sd*.38,.6,-3.0); }
    // bánh xe: lốp + mâm crôm nhiều chấu
    const wheels=[];
    for(const [x,z] of [[.97,1.95],[-.97,1.95],[.97,-1.85],[-.97,-1.85]]){ const wg=new THREE.Group(); wg.position.set(x,.4,z); g.add(wg); wheels.push(wg);
      add(new THREE.TorusGeometry(.31,.1,10,28), rubber, 0,0,0, wg).rotation.y=Math.PI/2;
      add(new THREE.CylinderGeometry(.25,.25,.15,24), chrome, 0,0,0, wg).rotation.z=Math.PI/2;
      for(let i=0;i<8;i++){ const sp=add(new THREE.BoxGeometry(.03,.42,.035), chrome, Math.sign(x)*.085,0,0, wg); sp.rotation.x=i*Math.PI/8; }
      add(new THREE.CylinderGeometry(.06,.06,.18,16), new THREE.MeshStandardMaterial({color:0x9e0b18, metalness:.6, roughness:.3}), 0,0,0, wg).rotation.z=Math.PI/2; }
    // nội thất: sàn thảm, 4 ghế da kem viền đỏ, táp-lô gỗ + đồng hồ, vô lăng gỗ, bệ tì tay
    add(new THREE.BoxGeometry(1.7,.02,2.15), carpet, 0,.51,-.3);
    const seats={FL:new V3(.45,.68,.05), FR:new V3(-.45,.68,.05), RL:new V3(.45,.68,-.95), RR:new V3(-.45,.68,-.95)};
    for(const k in seats){ const p=seats[k]; add(new THREE.BoxGeometry(.52,.13,.5), leather, p.x,p.y-.06,p.z); const bk=add(new THREE.BoxGeometry(.52,.56,.11), leather, p.x,p.y+.26,p.z-.27); bk.rotation.x=-.16;
      add(new THREE.BoxGeometry(.54,.03,.13), piping, p.x,p.y+.55,p.z-.31); add(new THREE.BoxGeometry(.04,.5,.12), piping, p.x,p.y+.26,p.z-.28).position.x+=.0; }
    add(new THREE.BoxGeometry(1.7,.26,.2), wood, 0,.84,.74);
    for(const [x,r] of [[.32,.06],[.5,.06],[.0,.045],[-.4,.05]]){ const gz=add(new THREE.CircleGeometry(r,24), new THREE.MeshBasicMaterial({color:0xe9f6ff}), x,.88,.635); gz.rotation.y=Math.PI; add(new THREE.TorusGeometry(r,.008,6,24), chrome, x,.88,.633).rotation.y=Math.PI; }
    const sw=new THREE.Group(); sw.position.set(.45,.92,.5); sw.rotation.x=.42; g.add(sw); add(new THREE.TorusGeometry(.18,.018,8,32), wood, 0,0,0, sw);
    for(let i=0;i<3;i++){ const sp=add(new THREE.BoxGeometry(.015,.17,.012), chrome, 0,0,0, sw); sp.rotation.z=i*Math.PI*2/3; sp.position.set(Math.sin(i*Math.PI*2/3)*-.085, Math.cos(i*Math.PI*2/3)*.085, 0); }
    add(new THREE.BoxGeometry(.2,.16,1.15), wood, 0,.6,-.42);
    // cửa dài (bản lề phía trước), mặt ngoài sơn + hoạ tiết, mặt trong bọc da
    const doors={};
    for(const [k,sd] of [['L',1],['R',-1]]){ const pv=new THREE.Group(); pv.position.set(sd*.93,.5,.8); g.add(pv);
      add(new THREE.BoxGeometry(.07,.42,2.02), paint, 0,.2,-1.01, pv); add(new THREE.BoxGeometry(.02,.32,1.9), leather, -sd*.045,.2,-1.0, pv);
      add(new THREE.BoxGeometry(.075,.025,2.02), chrome, 0,.415,-1.01, pv);
      const dd=add(new THREE.PlaneGeometry(1.95,.16), deco, sd*.038,.2,-1.0, pv); dd.rotation.y=sd*Math.PI/2; dd.castShadow=false;
      doors[k]=pv; }
    return {g, wheels, seats, doors};
  }
  function disposeTree(o){ o.traverse(m=>{ if(m.geometry) m.geometry.dispose(); const ms=Array.isArray(m.material)?m.material:(m.material?[m.material]:[]); for(const x of ms){ if(x.map && x.map.isCanvasTexture) x.map.dispose(); x.dispose(); } }); }

  // ---------- người: vệ sĩ + anh Bình Phan (thân 3D có xương → đi, ngồi, giơ tay được) ----------
  function npc(seed, ov, name, dot, h){ const kk=W.people.kit(seed, {outfit:ov, h}); const a=W.makeActor(kk.gl, {name, height:kk.h, face:0, clips:kk.clips, compact:false, dot});
    a.play('idle',0); a.mixer.update(0); const anchor=new THREE.Object3D(); anchor.position.y=kk.h+.75; a.g.add(anchor);
    return {a, po:makePoser(THREE,a), h:kk.h, anchor, bubble:null, bubT:0, pose:null, reach:0, thumbs:0, extras:[]}; }
  function dropNpc(o){ if(!o) return; if(o.bubble) W.removeLabel(o.bubble); if(o.a.label) W.removeLabel(o.a.label); if(o.a.g.parent) o.a.g.parent.remove(o.a.g); W.ACTORS && W.ACTORS.delete(o.a); for(const x of o.extras){ if(x.parent) x.parent.remove(x); disposeTree(x); } }
  function say(o, text, sec){ if(o.bubble) W.removeLabel(o.bubble); o.bubble=W.makeLabel(text, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.95)', color:'#1b2233', fade:45}); o.bubT=sec; }
  // gắn vật vào xương theo 1 vị trí/hướng/kích thước mong muốn ở toạ độ thế giới (xương Mixamo có thể bị thu nhỏ 0.01)
  function attach(bone, obj, wp, wq, wsc){ bone.updateWorldMatrix(true,false); const M=new THREE.Matrix4().compose(wp, wq, new V3(wsc,wsc,wsc)), L=bone.matrixWorld.clone().invert().multiply(M); L.decompose(obj.position, obj.quaternion, obj.scale); bone.add(obj); }
  // aim xương (đã sửa lỗi nội suy: slerp(I, 1-w) thay vì slerpQuaternions(I,q,w) – cách cũ luôn ra 0)
  const _a=new V3(), _b=new V3(), _d=new V3(), _q=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _I=new THREE.Quaternion();
  function aim(bones, name, child, dir, w){ const B=bones[name], C=bones[child]; if(!B||!C||w<=.001) return;
    B.getWorldPosition(_a); C.getWorldPosition(_b); _b.sub(_a).normalize(); _d.copy(dir).normalize(); _q.setFromUnitVectors(_b,_d); if(w<1) _q.slerp(_I, 1-w);
    B.getWorldQuaternion(_wq); B.parent.getWorldQuaternion(_pq); _wq.premultiply(_q); B.quaternion.copy(_pq.invert().multiply(_wq)); B.updateMatrixWorld(true); }
  function basis(o){ const q=new THREE.Quaternion(); o.a.g.getWorldQuaternion(q); const F=new V3(0,0,1).applyQuaternion(q); F.y=0; F.normalize(); return {F, R:new V3(-F.z,0,F.x), U:new V3(0,1,0)}; }
  const Dv=(B,f,u,r)=>new V3().addScaledVector(B.F,f).addScaledVector(B.U,u).addScaledVector(B.R,r);
  // đôi cánh vàng: ~200 lông vũ vàng xếp nhiều tầng toả ra từ bả vai, vỗ nhẹ theo nhịp thở
  function buildWings(){ const g=new THREE.Group(); g.scale.setScalar(.92);
    const gold=new THREE.MeshStandardMaterial({color:0xe9b83f, metalness:1, roughness:.26, emissive:0x3d2800, emissiveIntensity:.55, side:THREE.DoubleSide});
    const goldDeep=new THREE.MeshStandardMaterial({color:0xc48d1c, metalness:1, roughness:.34, emissive:0x2a1a00, emissiveIntensity:.45, side:THREE.DoubleSide});
    // nền cánh liền khối (dáng cánh thiên thần) để lông vũ phủ lên không hở
    const ws=new THREE.Shape(); ws.moveTo(0,.05); ws.bezierCurveTo(.25,.55,.7,1.0,1.25,1.12); ws.bezierCurveTo(1.38,1.0,1.3,.7,1.15,.45); ws.bezierCurveTo(.95,.1,.6,-.35,.22,-.62); ws.bezierCurveTo(.1,-.4,.03,-.15,0,.05);
    const baseG=new THREE.ShapeGeometry(ws, 18);
    // lông vũ to bản (dáng lá thuôn, có chóp nhọn)
    const fs=new THREE.Shape(); fs.moveTo(0,0); fs.quadraticCurveTo(.12,.2,.025,.6); fs.lineTo(0,.66); fs.lineTo(-.025,.6); fs.quadraticCurveTo(-.12,.2,0,0);
    const fg=new THREE.ShapeGeometry(fs, 6); const sides=[];
    for(const sd of [-1,1]){ const pv=new THREE.Group(); pv.position.set(sd*.1,0,0); g.add(pv);
      const base=new THREE.Mesh(baseG, goldDeep); base.scale.set(sd,1,1); base.position.z=-.03; base.castShadow=true; pv.add(base);
      const list=[];
      for(let k=0;k<5;k++){ const rho=.3+k*.2, L=.24+k*.09, n=12+k*4, th0=1.05-k*.04, th1=-1.0+k*.06;   // 5 tầng toả ra từ bả vai: tầng trong ngắn, tầng ngoài dài
        for(let i=0;i<n;i++){ const t=i/(n-1), th=th0+(th1-th0)*t;
          list.push({x:sd*Math.cos(th)*rho, y:Math.sin(th)*rho+.05, z:.012*(4-k)+.004, rot:sd>0 ? th-Math.PI/2 : Math.PI/2-th, s:L/.66*(1-.12*Math.abs(t-.4))}); } }
      const im=new THREE.InstancedMesh(fg, gold, list.length); const m=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler();
      list.forEach((f,i)=>{ e.set(0,0,f.rot+sd*.06); q.setFromEuler(e); m.compose(new V3(f.x,f.y,f.z), q, new V3(f.s,f.s,f.s)); im.setMatrixAt(i,m); });
      im.castShadow=true; im.frustumCulled=false; pv.add(im); sides.push({pv, sd}); }
    return {g, sides}; }
  function addWings(o){ const B=o.po.bones, sp=B.Spine2||B.Spine1||B.Spine; const w=buildWings(); o.wings=w; o.extras.push(w.g);
    o.a.g.updateMatrixWorld(true); const bs=basis(o), p=new V3(); (sp||o.a.g).getWorldPosition(p); p.addScaledVector(bs.F,-.16).y+=.05;
    const q=new THREE.Quaternion(); o.a.g.getWorldQuaternion(q); if(sp) attach(sp, w.g, p, q, 1); else { w.g.position.set(0, o.h*.72, -.16); o.a.g.add(w.g); } }
  // khuôn mặt: ảnh mặt của Bình (data/binhphan_face.png) dán lên chỏm cầu phía trước đầu nhân vật
  function addFace(o){ const H=o.po.bones.Head, T=o.po.bones.HeadTop_End; if(!H) return;
    const mat=new THREE.MeshStandardMaterial({transparent:true, roughness:.75, alphaTest:.05}); const mesh=new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18, Math.PI/2-.8, 1.6, Math.PI/2-.95, 1.75), mat); mesh.visible=false; o.extras.push(mesh);
    fetch('data/characters.json', {cache:'no-store'}).then(r=>r.json()).then(cfg=>{ if(!cfg || !cfg.binhphanFace) return;   // chỉ tải ảnh mặt khi đã có (tránh lỗi 404)
      new THREE.TextureLoader().load('data/binhphan_face.png', tex=>{ tex.colorSpace=THREE.SRGBColorSpace; mat.map=tex; mat.needsUpdate=true; mesh.visible=true; }, undefined, ()=>{}); }).catch(()=>{});
    o.a.g.updateMatrixWorld(true); const hp=new V3(), tp=new V3(); H.getWorldPosition(hp); let c=hp.clone(), r=o.h*.07;
    if(T){ T.getWorldPosition(tp); const hh=hp.distanceTo(tp); c.lerp(tp,.5); r=hh*.58; }
    const q=new THREE.Quaternion(); o.a.g.getWorldQuaternion(q); attach(H, mesh, c, q, r); }
  function buildPhone(){ const g=new THREE.Group(); const body=new THREE.MeshStandardMaterial({color:0x2a2c31, metalness:.85, roughness:.25});
    const scr=new THREE.MeshBasicMaterial({map:canvasTex(64,128,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#1b2a52'); gr.addColorStop(1,'#d4a017'); c.fillStyle=gr; c.fillRect(0,0,w,h); c.fillStyle='rgba(255,255,255,.9)'; c.font='bold 16px Segoe UI'; c.textAlign='center'; c.fillText('+2000',w/2,h/2); })});
    const add=(geo,m,x=0,y=0,z=0)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); g.add(o); return o; };
    add(new THREE.BoxGeometry(.076,.162,.009), body); add(new THREE.PlaneGeometry(.07,.154), scr, 0,0,.0047);
    const cam=add(new THREE.CylinderGeometry(.026,.026,.006,24), new THREE.MeshStandardMaterial({color:0x111111, metalness:.6, roughness:.2}), 0,.045,-.0075); cam.rotation.x=Math.PI/2;
    for(const [x,y] of [[-.01,.055],[.01,.055],[-.01,.035],[.01,.035]]){ const l=add(new THREE.CylinderGeometry(.007,.007,.004,14), new THREE.MeshStandardMaterial({color:0x05060a, metalness:.9, roughness:.1}), x,y,-.0105); l.rotation.x=Math.PI/2; }
    return g; }
  function makeBP(){ const seed=W.people.pickSeed ? W.people.pickSeed(L=>!L.female, 4242) : 4242;
    const o=npc(seed, {female:false, dress:false, skirt:false, shorts:false, long:false, shirt:0x141416, pants:0xe8e0d0, shoe:0xd7cfc2, hair:0x0e0d0c, style:'short', skin:0xd6a47f, glasses:false, width:1.12}, '😎 Anh trai Bình Phan', '#ffd23f', 1.72);
    addWings(o); addFace(o); o.phone=buildPhone(); o.phone.visible=false; scene.add(o.phone); o.extras.push(o.phone); return o; }
  function makeGuard(){ const seed=W.people.pickSeed ? W.people.pickSeed(L=>!L.female, 9191) : 9191;
    const o=npc(seed, {female:false, dress:false, skirt:false, shorts:false, long:true, shirt:0x0f1013, pants:0x0f1013, shoe:0x050505, hair:0x0a0a0a, style:'buzz', glasses:false, width:1.1}, '🕶️ Vệ sĩ', '#9aa4b5', 1.84);
    const H=o.po.bones.Head; if(H){ const gl=new THREE.Mesh(new THREE.BoxGeometry(.17,.045,.02), new THREE.MeshStandardMaterial({color:0x050505, metalness:.6, roughness:.15})); o.extras.push(gl);
      o.a.g.updateMatrixWorld(true); const bs=basis(o), hp=new V3(); H.getWorldPosition(hp); const T=o.po.bones.HeadTop_End, tp=new V3(); if(T) T.getWorldPosition(tp); const hh=T?hp.distanceTo(tp):.2;
      const p=hp.clone().lerp(tp,.42).addScaledVector(bs.F, hh*.5); const q=new THREE.Quaternion(); o.a.g.getWorldQuaternion(q); attach(H, gl, p, q, 1); }
    return o; }

  async function pack2(){ if(SC.on) return;
    if(W.inside || HOOK.vehicle || HOOK.blockInput){ toast('🚗 Ra ngoài trời (và xuống xe) để anh Bình Phan tới tận nơi trao quà nhé!', 3200); return; }
    if(!W.people || !W.people.kit){ toast('Chưa tải xong nhân vật – thử lại sau ít giây.', 2400); return; }
    begin(2000, `💸 ${BP_NAME} tặng 2.000 tiền – mãi bên nhau nhé!`); HOOK.blockInput=true; P.dancing=false;
    const f=me.g.rotation.y, F=new V3(Math.sin(f),0,Math.cos(f)), yaw=f-Math.PI/2, D=new V3(Math.sin(yaw),0,Math.cos(yaw)), R=new V3(-F.z,0,F.x);
    const S=new V3(P.x+F.x*4.3, 0, P.z+F.z*4.3), from=S.clone().addScaledVector(D,-42);
    const car=buildCar(); car.g.rotation.y=yaw; car.g.position.set(from.x, W.groundAt(from.x,from.z)+.02, from.z); scene.add(car.g);
    const guard=makeGuard(), bp=makeBP(); const people=[guard, bp];
    const seatIn=(o,k)=>{ const s=car.seats[k]; car.g.add(o.a.g); o.a.g.rotation.set(0,0,0); o.a.g.position.set(s.x, s.y+.04-o.po.hipsHeight(), s.z); o.pose=k==='FL'?'type':'sit'; };
    seatIn(guard,'FL'); seatIn(bp,'RR');
    const L2W=(x,z)=>car.g.localToWorld(new V3(x,0,z));
    let tAll=0, lastSpark=0, flying=null;
    SC.frame=(dt,T)=>{ tAll+=dt;
      for(const o of people){ o.a.mixer.update(dt); const B=o.po.bones;
        if(o.pose) o.po.apply(o.pose, T);
        if(o.reach>.001 || o.thumbs>.001){ const bs=basis(o);
          if(o.reach>.001){ aim(B,'RightArm','RightForeArm',Dv(bs,1,-.25,.12),o.reach); aim(B,'RightForeArm','RightHand',Dv(bs,1,.25,-.05),o.reach); }
          if(o.thumbs>.001) for(const [s,k] of [['Left',-1],['Right',1]]){ aim(B,s+'Arm',s+'ForeArm',Dv(bs,.25,-.3,k),o.thumbs); aim(B,s+'ForeArm',s+'Hand',Dv(bs,.35,1,-k*.15),o.thumbs); } }
        if(o.wings) for(const w of o.wings.sides){ const fl=Math.sin(T*2.2)*.12+(o.flap||0)*Math.sin(T*9)*.25; w.pv.rotation.y=-w.sd*(.42+fl); w.pv.rotation.z=w.sd*(.05+fl*.4); }
        if(o.phone){ o.phone.visible=o.reach>.3; if(o.phone.visible && B.RightHand){ B.RightHand.getWorldPosition(_a); const bs=basis(o); o.phone.position.copy(_a).addScaledVector(bs.F,.07).add(new V3(0,.03,0)); o.phone.quaternion.setFromAxisAngle(new V3(0,1,0), Math.atan2(-bs.F.x,-bs.F.z)); } }
        if(o.bubble){ o.bubT-=dt; if(o.bubT<=0){ W.removeLabel(o.bubble); o.bubble=null; } } }
      if(flying){ flying(dt); if(tAll-lastSpark>.12){ lastSpark=tAll; const p=car.g.localToWorld(new V3(0,.6,-3.1)); W.burst(p, [0xffd23f,0xffffff,0xff8fc2], 22, 2, .8, 1, .12); }
        const o=HOOK.camOverride; if(o) o.look.copy(car.g.position).y+=.6; } };
    SC.cleanup=()=>{ G.hold.want=0; for(const o of people) dropNpc(o); if(car.g.parent) car.g.parent.remove(car.g); disposeTree(car.g); if(SC.bigLabel){ W.removeLabel(SC.bigLabel); SC.bigLabel=null; } };
    const shot=(pos, look, k=2.2)=>{ HOOK.camOverride={pos:pos.clone(), look:look.clone(), k}; };
    const up=y=>new V3(0,y,0);
    // 1) xe chạy tới
    shot(new V3(P.x,0,P.z).addScaledVector(F,-2.4).addScaledVector(R,-2.2).add(up(P.y+2.0)), S.clone().add(up(P.y+.6)).addScaledVector(D,-6), 1.8);
    await (()=>{ let t=0; const dur=6; return run(dt=>{ t+=dt; const k=Math.min(1,t/dur), e=1-Math.pow(1-k,3), x=from.x+(S.x-from.x)*e, z=from.z+(S.z-from.z)*e;
      const dd=Math.hypot(x-car.g.position.x, z-car.g.position.z); car.g.position.set(x, W.groundAt(x,z)+.02, z); for(const w of car.wheels) w.rotation.x+=dd/.4; return k>=1; }); })();
    if(!SC.alive) return;
    const doorAnim=(pv, to, dur)=>{ const fr=pv.rotation.y; let t=0; return run(dt=>{ t+=dt; pv.rotation.y=fr+(to-fr)*sm(t/dur); return t>=dur; }); };
    const exitSeat=async(o, sd, z)=>{ const wp=new V3(); o.a.g.getWorldPosition(wp); scene.attach(o.a.g); o.a.g.rotation.x=0; o.a.g.rotation.z=0; o.pose=null; o.a.play('walk',.3);
      const out=L2W(sd*1.6, z); let t=0; const st=o.a.g.position.clone(); await run(dt=>{ t+=dt; const k=sm(t/1.1); o.a.g.position.lerpVectors(st, out, k); o.a.g.position.y=st.y+(W.groundAt(out.x,out.z)-st.y)*k; o.a.g.rotation.y=lerpAngle(o.a.g.rotation.y, Math.atan2(out.x-st.x, out.z-st.z), Math.min(1,dt*6)); return t>=1.1; }); o.a.play('idle',.3); };
    const walkTo=(o, x, z, sp=1.3)=>{ o.a.play('walk',.25); return run(dt=>{ const g=o.a.g, dx=x-g.position.x, dz=z-g.position.z, d=Math.hypot(dx,dz); if(d<.06){ o.a.play('idle',.3); return true; }
      const s=Math.min(d, sp*dt); g.position.x+=dx/d*s; g.position.z+=dz/d*s; g.position.y=W.groundAt(g.position.x, g.position.z); g.rotation.y=lerpAngle(g.rotation.y, Math.atan2(dx,dz), Math.min(1,dt*7)); return false; }); };
    const walkPath=async(o, pts)=>{ for(const [x,z] of pts){ const w=L2W(x,z); await walkTo(o, w.x, w.z); if(!SC.alive) return; } };
    const faceTo=(o, x, z)=>{ const g=o.a.g; const to=Math.atan2(x-g.position.x, z-g.position.z); return run(dt=>{ g.rotation.y=lerpAngle(g.rotation.y, to, Math.min(1,dt*6)); return Math.abs(((g.rotation.y-to+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI)<.05; }); };
    const enterSeat=async(o, sd, z, k)=>{ const w=L2W(sd*1.6, z); await walkTo(o, w.x, w.z); if(!SC.alive) return; const s=car.seats[k], tgt=car.g.localToWorld(new V3(s.x, s.y+.04-o.po.hipsHeight(), s.z)); const st=o.a.g.position.clone(); let t=0;
      await run(dt=>{ t+=dt; o.a.g.position.lerpVectors(st, tgt, sm(t/1.0)); o.a.g.rotation.y=lerpAngle(o.a.g.rotation.y, car.g.rotation.y, Math.min(1,dt*6)); return t>=1.0; }); if(!SC.alive) return; seatIn(o, k); };
    await wait(.5); if(!SC.alive) return;
    // 2) vệ sĩ xuống xe, vòng đầu xe sang mở cửa cho anh Bình Phan
    const side=S.clone().addScaledVector(F,-6.5).addScaledVector(D,1.5).add(up(P.y+2.2)); shot(side, S.clone().add(up(P.y+.8)), 1.6);
    await doorAnim(car.doors.L, -1.05, .9); if(!SC.alive) return;
    await exitSeat(guard, 1, .1); if(!SC.alive) return;
    await doorAnim(car.doors.L, 0, .7); if(!SC.alive) return;
    await walkPath(guard, [[1.6,3.6],[-1.6,3.6],[-1.75,1.05]]); if(!SC.alive) return;
    await doorAnim(car.doors.R, 1.05, .9); if(!SC.alive) return;
    const gs=L2W(-1.9,1.3); await walkTo(guard, gs.x, gs.z, 1); if(!SC.alive) return; await faceTo(guard, P.x, P.z);
    // 3) anh Bình Phan bước ra, tới trước mặt người chơi
    await exitSeat(bp, -1, -.85); if(!SC.alive) return;
    const meet=new V3(P.x,0,P.z).addScaledVector(F,1.05); await walkTo(bp, meet.x, meet.z, 1.2); if(!SC.alive) return;
    await faceTo(bp, P.x, P.z); P.face=Math.atan2(bp.a.g.position.x-P.x, bp.a.g.position.z-P.z); me.g.rotation.y=P.face;
    const mid=new V3((P.x+bp.a.g.position.x)/2, P.y, (P.z+bp.a.g.position.z)/2), side2=new V3(-(bp.a.g.position.z-P.z),0,bp.a.g.position.x-P.x).normalize();
    shot(mid.clone().addScaledVector(side2,3.1).add(up(1.75)), mid.clone().add(up(1.4)), 2.2);
    say(bp, 'Sao hay dị quá, giàu quá ha mà bay đặt nhấn gói này 😏', 4); bp.flap=1; await wait(4); bp.flap=0; if(!SC.alive) return;
    // 4) hai chiếc điện thoại chạm nhau → +2000
    shot(mid.clone().addScaledVector(side2,1.6).add(up(1.35)), mid.clone().add(up(1.15)), 2.4);
    G.hold.kind='phone'; G.hold.want=1; await run((()=>{ let t=0; return dt=>{ t+=dt; bp.reach=sm(t/.9); return t>=.9; }; })()); if(!SC.alive) return;
    await wait(.35); if(!SC.alive) return;
    const touch=mid.clone().add(up(1.18)); W.burst(touch, [0xffd23f,0xffffff,0x46d39a], 90, 2.6, 1, -1, .14);
    give(); SC.bigLabel=W.makeLabel('+2.000 💰', null, {fs:64, h:.5, x:touch.x, y:touch.y+.35, z:touch.z, bg:'rgba(0,0,0,0)', color:'#ffd23f', fade:30});
    await wait(1.8); if(SC.bigLabel){ W.removeLabel(SC.bigLabel); SC.bigLabel=null; } if(!SC.alive) return;
    G.hold.want=0; await run((()=>{ let t=0; return dt=>{ t+=dt; bp.reach=1-sm(t/.6); return t>=.6; }; })()); if(!SC.alive) return;
    // 5) chào – giơ hai ngón cái như trong ảnh
    shot(mid.clone().addScaledVector(side2,3).add(up(1.7)), mid.clone().add(up(1.35)), 2.2);
    say(bp, 'Mãi bên nhau bạn nhé 🤝', 3.2); bp.flap=1; await run((()=>{ let t=0; return dt=>{ t+=dt; bp.thumbs=Math.min(1,t/.5)*(t<2.6?1:1-sm((t-2.6)/.5)); return t>=3.1; }; })()); bp.thumbs=0; bp.flap=0; if(!SC.alive) return;
    // 6) lên xe, vệ sĩ đóng cửa, về ghế lái
    shot(side, S.clone().add(up(P.y+.8)), 1.6);
    await enterSeat(bp, -1, -.85, 'RR'); if(!SC.alive) return;
    await doorAnim(car.doors.R, 0, .8); if(!SC.alive) return;
    await walkPath(guard, [[-1.6,3.6],[1.6,3.6]]); if(!SC.alive) return;
    await doorAnim(car.doors.L, -1.05, .7); if(!SC.alive) return;
    await enterSeat(guard, 1, .1, 'FL'); if(!SC.alive) return;
    await doorAnim(car.doors.L, 0, .7); if(!SC.alive) return;
    await wait(.4); if(!SC.alive) return;
    // 7) xe bay lên trời rồi biến mất
    shot(new V3(P.x,0,P.z).addScaledVector(F,-1.6).add(up(P.y+1.7)), car.g.position.clone().add(up(.6)), 3);
    let vy=0, vf=0, tf=0;
    flying=dt=>{ tf+=dt; vy+=dt*6.5; vf+=dt*4; car.g.position.y+=vy*dt; car.g.position.addScaledVector(D, vf*dt); car.g.rotation.x=-Math.min(.32, tf*.16); for(const w of car.wheels) w.rotation.x+=dt*8; };
    await wait(4.2); if(!SC.alive) return;
    W.burst(car.g.position.clone(), [0xffd23f,0xffffff], 140, 6, 1.2, 0, .2); car.g.visible=false; flying=null;
    await wait(1.2);
    finish(); }

  function injectCSS(){ const s=document.createElement('style'); s.textContent=`
.tuPlus{width:24px;height:24px;border-radius:50%;border:0;background:#46d39a;color:#0d1320;font:900 18px/24px "Segoe UI",sans-serif;cursor:pointer;padding:0;margin:0 6px 0 -2px;box-shadow:0 0 0 2px rgba(255,255,255,.25)}
.tuPlus:hover{filter:brightness(1.12);transform:scale(1.08)}
.tuPacks{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
.tuPack{display:flex;flex-direction:column;gap:8px;padding:18px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid var(--line);text-align:center;align-items:center}
.tuPack.gold{background:linear-gradient(160deg,rgba(255,210,63,.18),rgba(255,140,0,.08));border-color:rgba(255,210,63,.5)}
.tuPack .tuIc{font-size:44px}.tuPack b{font-size:17px}.tuPack small{color:var(--mut);min-height:34px}.tuPack .btn{justify-content:center;width:100%}
#tuCine .tuBarT,#tuCine .tuBarB{position:fixed;left:0;right:0;height:9vh;background:#000;z-index:28;pointer-events:none}#tuCine .tuBarT{top:0}#tuCine .tuBarB{bottom:0}
body.tu-phone #tuCine .tuBarT,body.tu-phone #tuCine .tuBarB{display:none}
#tuSkip{position:fixed;right:18px;top:calc(9vh + 12px);z-index:45}
body.tu-cine #top,body.tu-cine #hint,body.tu-cine #music,body.tu-cine #buffs,body.tu-cine #prompt,body.tu-cine #chatLog,body.tu-cine #gdDock,body.tu-cine #gdNow{display:none!important}
body.tu-cine #gdPhone .phOff,body.tu-cine #gdPhone .phSend,body.tu-cine #gdPhone .phNav{visibility:hidden}
body.tu-phone #gdPhone .phBody{padding-bottom:236px}
#tuFinger{position:fixed;z-index:46;width:34px;height:48px;margin:-6px 0 0 -17px;border-radius:50% 50% 42% 42%/58% 58% 42% 42%;pointer-events:none;
  background:radial-gradient(ellipse at 50% 30%,#f7d2b4 0%,#e9b48f 55%,#c98d68 100%);box-shadow:0 6px 14px rgba(0,0,0,.35),inset 0 -4px 6px rgba(0,0,0,.12);transition:transform .1s}
#tuFinger::after{content:'';position:absolute;left:9px;top:6px;width:16px;height:14px;border-radius:45% 45% 40% 40%;background:rgba(255,236,226,.75);box-shadow:inset 0 -1px 2px rgba(0,0,0,.15)}
#tuFinger.tap{transform:scale(.86) translateY(2px)}
.tuPress{filter:brightness(1.6);transform:scale(.95)}
.tuKb{position:absolute;left:12px;right:12px;bottom:12px;padding:6px 6px 8px;background:#1d2028;border-radius:0 0 28px 28px;z-index:3}
.tuInput{display:flex;align-items:center;min-height:36px;margin-bottom:6px;padding:7px 12px;border-radius:18px;background:#fff;color:#1b2233;font:14px "Segoe UI",sans-serif}
.tuTxt{white-space:pre-wrap;word-break:break-word}.tuCaret{width:2px;height:16px;background:#2f7cf6;margin-left:1px;animation:tuBlink 1s steps(1) infinite}@keyframes tuBlink{50%{opacity:0}}
.tuKeys{display:flex;flex-direction:column;gap:5px}.tuRow{display:flex;justify-content:center;gap:4px}
.tuRow b{flex:1;max-width:27px;height:32px;display:grid;place-items:center;border-radius:6px;background:#3a3f4b;color:#fff;font:600 14px "Segoe UI",sans-serif;box-shadow:0 2px 0 #111;transition:transform .08s,filter .08s}
.tuRow b.sp{max-width:none;flex:5;font-size:12px;color:#cfd6e4}.tuRow b.snd{max-width:none;flex:1.5;background:#2f7cf6}
.bub.tuTyping{font-style:italic;opacity:.75}
.tuNotif{position:absolute;left:16px;right:16px;top:-90px;z-index:4;display:flex;flex-direction:column;gap:2px;padding:10px 14px;border-radius:16px;background:rgba(255,255,255,.96);color:#1b2233;box-shadow:0 8px 24px rgba(0,0,0,.4);transition:top .4s cubic-bezier(.2,.9,.25,1.1)}
.tuNotif.on{top:44px}.tuNotif b{font-size:15px;color:#13803d}.tuNotif small{font-size:12px;color:#55607a}
`; document.head.appendChild(s); }

  return {open:openShop, pack1, pack2, get playing(){ return SC.on; }, skip:()=>finish(),
    _preview(){ const o=makeBP(); o.a.g.position.set(P.x+Math.sin(me.g.rotation.y)*2.2, P.y, P.z+Math.cos(me.g.rotation.y)*2.2); o.a.g.rotation.y=me.g.rotation.y+Math.PI; return {o, drop:()=>dropNpc(o)}; }};
}
