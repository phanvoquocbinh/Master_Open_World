// QC World – S19g: 💰 NẠP TIỀN – nút "+" cạnh ví → trang 2 gói. CẢ HAI GÓI CHỈ LÀ HOẠT CẢNH VUI TRONG GAME:
// không có thanh toán thật, không gọi API thanh toán, không mở ngân hàng / ví – cuối hoạt cảnh chỉ cộng tiền trong game (ctx.addCoins).
//  • Gói 1 – Nạp 500: cầm điện thoại lên, ngón tay tự bấm 💬 Tin nhắn → "Anh trai Bình Phan" → gõ phím ảo nhắn xin, anh trả lời,
//    gõ số tài khoản, anh báo đã chuyển → thông báo nhận 500 → cộng tiền.
//  • Gói 2 – Ủng hộ nhà phát triển 20k (tặng 2000): hỏi lại "Bạn muốn thực sự ủng hộ…?" [Có chứ] / [Khôngn't] → Có chứ: chiếc mui trần đuôi thuyền màu đỏ "QC Sovereign Boat-Tail" (thiết kế gốc, không logo/hãng)
//    chạy tới; vệ sĩ lái xe xuống mở cửa; anh Bình Phan (áo thun đen, quần kem, đôi cánh vàng sau lưng, dây chuyền vàng to + mặt kim cương lớn, vương miện vàng; mặt lấy từ ảnh data/binhphan_face.png nếu có)
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
  // cấu hình nhân vật + tải sẵn ảnh trải 360° của đầu (nếu máy này có ảnh – ảnh riêng tư, không đưa lên git)
  const CFG={}; let HEADTEX=null, HEADSHAPE=null;
  fetch('data/characters.json', {cache:'no-store'}).then(r=>r.ok ? r.json() : null).then(c=>{ if(!c) return; Object.assign(CFG, c);
    if(c.binhphanHead) fetch('data/binhphan_head_shape.json?v='+encodeURIComponent(c.headVer||1), {cache:'no-store'}).then(r=>r.ok ? r.json() : null).then(s=>{ if(s && Array.isArray(s.r)) HEADSHAPE=s; }).catch(()=>{});
    if(c.binhphanHead) new THREE.TextureLoader().load('data/binhphan_head.jpg?v='+encodeURIComponent(c.headVer||1), t=>{ t.colorSpace=THREE.SRGBColorSpace; t.wrapS=THREE.RepeatWrapping; t.anisotropy=8; t.offset.x=(c.headU ?? .25)-.25; HEADTEX=t; }, undefined, ()=>{}); }).catch(()=>{});

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
    m.body.querySelector('[data-p="2"]').onclick=()=>{ m.close(); askPack2(); }; }
  // gói 2: hỏi lại cho vui – "Có chứ" → diễn tiếp; "Khôngn't" (= Không) → đóng, không làm gì
  function askPack2(){ const m=ui.modal('💛 Ủng hộ nhà phát triển');
    m.body.innerHTML=`<div class="tuAsk"><div class="tuAskIc">🥹</div><p>Bạn muốn thực sự ủng hộ nhà phát triển sao?</p>
      <div class="tuAskBtns"><button class="btn" data-a="no">Khôngn't</button><button class="btn pri" data-a="yes">Có chứ</button></div></div>`;
    m.body.querySelector('[data-a="yes"]').onclick=()=>{ m.close(); setTimeout(pack2, 250); };
    m.body.querySelector('[data-a="no"]').onclick=()=>m.close(); }

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
  function moveFinger(x,y,instant,k=1){ finger.style.transition=instant?'none':`left ${.2*k}s ease-out, top ${.2*k}s ease-out`; finger.style.left=x+'px'; finger.style.top=y+'px'; }
  // k = hệ số thời gian (gõ phím dùng .7 → nhanh hơn 30%)
  async function tap(el, k=1){ if(!el || !finger || !SC.alive) return; if(el.scrollIntoView) el.scrollIntoView({block:'nearest'});
    const r=el.getBoundingClientRect(); moveFinger(r.left+r.width/2, r.top+r.height/2, false, k); await ms(230*k); if(!finger) return;   // bị bỏ qua giữa chừng
    finger.classList.add('tap'); el.classList.add('tuPress'); await ms(110*k); el.classList.remove('tuPress'); if(!finger) return; finger.classList.remove('tap'); await ms(40*k); }
  const KROWS=['1234567890','qwertyuiop','asdfghjkl','zxcvbnm'];
  const kb=document.createElement('div'); kb.className='tuKb';
  kb.innerHTML=`<div class="tuInput"><span class="tuTxt"></span><i class="tuCaret"></i></div>
    <div class="tuKeys">${KROWS.map(r=>`<div class="tuRow">${[...r].map(c=>`<b data-k="${c}">${c}</b>`).join('')}</div>`).join('')}
    <div class="tuRow"><b data-k="sp" class="sp">dấu cách</b><b data-k="send" class="snd">➤</b></div></div>`;
  const kbTxt=kb.querySelector('.tuTxt');
  const baseKey=ch=>{ if(ch===' ') return 'sp'; if(ch==='đ'||ch==='Đ') return 'd'; return ch.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); };
  async function typeText(s){ for(const ch of s){ if(!SC.alive) return; const key=kb.querySelector(`[data-k="${baseKey(ch)}"]`); if(key) await tap(key, .7); else await ms(42); kbTxt.textContent+=ch; } }
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
    await typeText('Hello Bình Vip Pro'); if(!SC.alive) return;
    await tap(kb.querySelector('[data-k="send"]'), .7); sendMine(); await wait(.45); if(!SC.alive) return;
    await bpTyping(1.3); if(!SC.alive) return; bpReply("Who's your daddy"); await wait(.9); if(!SC.alive) return;
    await typeText('Cho xin 500 đồng trải nghiệm game đi bợn hiền'); if(!SC.alive) return;
    await tap(kb.querySelector('[data-k="send"]'), .7); sendMine(); await wait(.5); if(!SC.alive) return;
    await bpTyping(1.6); if(!SC.alive) return; bpReply('OK , đưa số tài khoản đây'); await wait(.9); if(!SC.alive) return;
    await typeText('123456789'); if(!SC.alive) return;
    await tap(kb.querySelector('[data-k="send"]'), .7); sendMine(); await wait(.45); if(!SC.alive) return;
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
  function dropNpc(o){ if(!o) return; if(o.bubble) W.removeLabel(o.bubble); if(o.a.label) W.removeLabel(o.a.label); if(o.a.g.parent) o.a.g.parent.remove(o.a.g); W.ACTORS && W.ACTORS.delete(o.a); for(const x of o.extras){ if(x.parent) x.parent.remove(x); disposeTree(x); } if(o.ownGeo) o.ownGeo.dispose(); }
  function say(o, text, sec){ if(o.bubble) W.removeLabel(o.bubble); o.bubble=W.makeLabel(text, null, {fs:46, h:.3, follow:o.anchor, bg:'rgba(255,255,255,.95)', color:'#1b2233', fade:45}); o.bubT=sec; }
  // gắn vật vào xương theo 1 vị trí/hướng/kích thước mong muốn ở toạ độ thế giới (xương Mixamo có thể bị thu nhỏ 0.01)
  function attach(bone, obj, wp, wq, wsc){ bone.updateWorldMatrix(true,false); const s=wsc && wsc.isVector3 ? wsc : new V3(wsc,wsc,wsc);
    const M=new THREE.Matrix4().compose(wp, wq, s), L=bone.matrixWorld.clone().invert().multiply(M); L.decompose(obj.position, obj.quaternion, obj.scale); bone.add(obj); }
  // aim xương (đã sửa lỗi nội suy: slerp(I, 1-w) thay vì slerpQuaternions(I,q,w) – cách cũ luôn ra 0)
  const _a=new V3(), _b=new V3(), _d=new V3(), _q=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _I=new THREE.Quaternion();
  function aim(bones, name, child, dir, w){ const B=bones[name], C=bones[child]; if(!B||!C||w<=.001) return;
    B.getWorldPosition(_a); C.getWorldPosition(_b); _b.sub(_a).normalize(); _d.copy(dir).normalize(); _q.setFromUnitVectors(_b,_d); if(w<1) _q.slerp(_I, 1-w);
    B.getWorldQuaternion(_wq); B.parent.getWorldQuaternion(_pq); _wq.premultiply(_q); B.quaternion.copy(_pq.invert().multiply(_wq)); B.updateMatrixWorld(true); }
  function basis(o){ const q=new THREE.Quaternion(); o.a.g.getWorldQuaternion(q); const F=new V3(0,0,1).applyQuaternion(q); F.y=0; F.normalize(); return {F, R:new V3(-F.z,0,F.x), U:new V3(0,1,0)}; }
  const Dv=(B,f,u,r)=>new V3().addScaledVector(B.F,f).addScaledVector(B.U,u).addScaledVector(B.R,r);
  // IK 2 khớp cho tay: đưa bàn tay tới target, khuỷu gập về hướng bend
  function ikArm(o, s, target, bend, w){ const B=o.po.bones, A=B[s+'Arm'], E=B[s+'ForeArm'], H=B[s+'Hand']; if(!A||!E||!H||w<=.001) return;
    const pa=A.getWorldPosition(new V3()), pe=E.getWorldPosition(new V3()), phd=H.getWorldPosition(new V3()), la=pa.distanceTo(pe), lb=pe.distanceTo(phd);
    const t=target.clone().sub(pa); let d=t.length(); if(d<1e-4) return; t.divideScalar(d); d=Math.min(d,(la+lb)*.995);
    const x=(la*la-lb*lb+d*d)/(2*d), h=Math.sqrt(Math.max(0,la*la-x*x)), bp=bend.clone().addScaledVector(t,-bend.dot(t)); if(bp.lengthSq()<1e-6) bp.set(0,-1,0); bp.normalize();
    aim(B, s+'Arm', s+'ForeArm', pa.clone().addScaledVector(t,x).addScaledVector(bp,h).sub(pa), w); E.getWorldPosition(pe); aim(B, s+'ForeArm', s+'Hand', target.clone().sub(pe), w); }
  // ---------- đôi cánh đen kiểu cánh chim thật ----------
  // Khung xương cánh 3 đốt (vai → khuỷu → cổ tay → đầu cánh). Lông bay: 10 sơ cấp (bàn cánh, xoè ra ngoài/lên), 12 thứ cấp (cẳng cánh, rủ xuống),
  // 5 lông cận thân; lông phủ lớn/vừa/nhỏ lợp chồng cả mặt lưng lẫn mặt bụng cánh. Mỗi chiếc lông: cuống + tơ lông xiên + khe xơ ở mép,
  // đen ánh xanh tím (kiểu lông quạ), uốn cong nhẹ. Vỗ CHẬM & NHẸ (~4,6 s/nhịp), sóng lan từ vai → khuỷu → cổ tay.
  function featherTex(round){ return canvasTex(128, round?256:512, (g,w,h)=>{
    const xs=round ? w*.5 : w*.4, top=h*.015, lv=round ? w*.42 : w*.27, rv=round ? w*.42 : w*.52;   // cuống lệch: phiến trước hẹp, phiến sau rộng
    const path=new Path2D(); path.moveTo(xs,h);
    path.bezierCurveTo(xs-lv*.55,h*.92, xs-lv,h*.62, xs-lv*.88,h*.3); path.quadraticCurveTo(xs-lv*.55,top+h*.04, xs,top);
    path.quadraticCurveTo(xs+rv*.72,top+h*.06, xs+rv*.96,h*.32); path.bezierCurveTo(xs+rv,h*.62, xs+rv*.6,h*.92, xs,h);
    g.save(); g.clip(path);
    const gr=g.createLinearGradient(0,h,0,0); gr.addColorStop(0,'#45454e'); gr.addColorStop(.16,'#1e1e25'); gr.addColorStop(1,'#0b0b0f'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    for(let y=h; y>-w; y-=2.1) for(const s of [-1,1]){ g.strokeStyle=Math.random()<.45 ? 'rgba(120,122,140,.09)' : 'rgba(0,0,0,.34)'; g.lineWidth=1; g.beginPath(); g.moveTo(xs,y); g.lineTo(xs+s*w*.75, y-w*.42); g.stroke(); }   // tơ lông xiên về ngọn
    const sh=g.createLinearGradient(0,0,w,0); sh.addColorStop(0,'rgba(60,66,100,0)'); sh.addColorStop(.55,'rgba(60,66,100,.1)'); sh.addColorStop(1,'rgba(60,66,100,0)'); g.fillStyle=sh; g.fillRect(0,0,w,h);   // ánh xanh tím
    for(let i=0;i<80;i++){ const y=h-Math.random()*h*.13; g.strokeStyle='rgba(110,110,122,.32)'; g.beginPath(); g.moveTo(xs,y); g.lineTo(xs+(Math.random()-.5)*w*.95, y-Math.random()*h*.05); g.stroke(); }   // bông tơ ở gốc
    g.restore();
    g.globalCompositeOperation='destination-out';   // khe xơ ở mép phiến
    for(let i=0;i<(round?3:7);i++){ const y=h*(.18+Math.random()*.6), s=Math.random()<.5?-1:1, ex=xs+s*(s<0?lv:rv)*1.08; g.beginPath(); g.moveTo(ex,y); g.lineTo(xs+s*w*.05, y-w*.3); g.lineTo(ex, y-w*.09); g.closePath(); g.fill(); }
    g.globalCompositeOperation='source-over';
    const sg=g.createLinearGradient(0,h,0,0); sg.addColorStop(0,'rgba(165,165,175,.95)'); sg.addColorStop(1,'rgba(55,55,66,.7)'); g.strokeStyle=sg; g.lineWidth=round?2:3;
    g.beginPath(); g.moveTo(xs,h); g.quadraticCurveTo(xs-1.5,h*.5, xs,top+h*.03); g.stroke(); }); }
  function featherGeo(bend, cup){ const geo=new THREE.PlaneGeometry(1,1,2,10); geo.translate(0,.5,0); const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i); p.setZ(i, bend*y*y+cup*x*x); } geo.computeVertexNormals(); return geo; }
  function buildWings(){ const g=new THREE.Group(); g.scale.setScalar(.92);
    const mk=tex=>{ const m=new THREE.MeshPhysicalMaterial({map:tex, color:0x8a8a8f, alphaTest:.45, side:THREE.DoubleSide, roughness:.5, metalness:0, sheen:.45, sheenColor:new THREE.Color(0x262a40), sheenRoughness:.4, iridescence:.12, iridescenceIOR:1.3});
      return {m, depth:new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking, map:tex, alphaTest:.45})}; };
    const FL=mk(featherTex(false)), CV=mk(featherTex(true)), boneMat=new THREE.MeshStandardMaterial({color:0x101014, roughness:.62});
    const geoF=featherGeo(.07,.06), geoC=featherGeo(.05,.1);
    // khung cánh (toạ độ phẳng của cánh phải: x ra ngoài, y lên; mặt lưng cánh = -z)
    const S=[0,0], E=[.36,.26], Wr=[.74,.62], H=[1.02,.84];
    const lp=(P,Q,t)=>[P[0]+(Q[0]-P[0])*t, P[1]+(Q[1]-P[1])*t], nrm=(P,Q)=>{ const dx=Q[0]-P[0], dy=Q[1]-P[1], l=Math.hypot(dx,dy); return [-dy/l, dx/l]; };   // pháp tuyến hướng mép trước
    const sides=[];
    for(const sd of [1,-1]){ const side=new THREE.Group(); side.position.x=sd*.09; side.scale.x=sd; g.add(side);   // cánh trái = cánh phải lật gương
      const sh=new THREE.Group(); side.add(sh); const arm=new THREE.Group(); sh.add(arm);
      const fore=new THREE.Group(); fore.position.set(E[0],E[1],0); arm.add(fore); const hand=new THREE.Group(); hand.position.set(Wr[0]-E[0],Wr[1]-E[1],0); fore.add(hand);
      const SEG={arm:{g:arm,o:S}, fore:{g:fore,o:E}, hand:{g:hand,o:Wr}}, L={arm:{F:[],C:[]}, fore:{F:[],C:[]}, hand:{F:[],C:[]}};
      const add=(seg,kind,p,deg,len,wid,z)=>L[seg][kind].push({x:p[0], y:p[1], a:deg*Math.PI/180, len, wid, z});
      for(let i=0;i<10;i++){ const t=i/9; add('hand','F', lp(Wr,H,t), -58+t*88, .5+.14*Math.sin(Math.PI*Math.min(1,t*1.12)), .11, -.0016*i); }       // lông sơ cấp
      for(let i=0;i<12;i++){ const t=i/11; add('fore','F', lp(E,Wr,t), -98+t*36, .57-.05*t, .105, -.0016*i); }                                         // lông thứ cấp
      for(let i=0;i<5;i++){ const t=.15+i*.21; add('arm','F', lp(S,E,t), -114+t*14, .42+.1*t, .1, -.0016*i); }                                         // lông cận thân
      const coverts=(seg,P,Q,n,off,len,wid,deg0,deg1,z)=>{ const nn=nrm(P,Q); for(let i=0;i<n;i++){ const t=(i+.5)/n, p=lp(P,Q,t); add(seg,'C',[p[0]+nn[0]*off, p[1]+nn[1]*off], deg0+(deg1-deg0)*t, len, wid, z); } };
      for(const [z,k] of [[-.022,1],[.016,.78]]){   // mặt lưng (−z) và mặt bụng cánh (+z, ngắn hơn)
        coverts('fore',E,Wr,12,.02,.28*k,.09,-96,-64,z); coverts('hand',Wr,H,8,.02,.25*k,.085,-50,20,z);                        // lông phủ lớn
        coverts('arm',S,E,6,.03,.2*k,.08,-104,-92,z*1.3); coverts('fore',E,Wr,10,.035,.16*k,.075,-88,-70,z*1.3); coverts('hand',Wr,H,5,.035,.14*k,.07,-60,0,z*1.3);   // lông phủ vừa
        for(const off of [.05,.066]){ coverts('arm',S,E,6,off,.09*k,.06,-80,-70,z*1.6); coverts('fore',E,Wr,8,off,.085*k,.055,-75,-62,z*1.6); coverts('hand',Wr,H,5,off,.08*k,.05,-62,-30,z*1.6); } }   // lông phủ nhỏ mép trước
      const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), zA=new V3(0,0,1);
      for(const [k,seg] of Object.entries(SEG)) for(const [kind,MT,GE] of [['F',FL,geoF],['C',CV,geoC]]){ const list=L[k][kind]; if(!list.length) continue;
        const im=new THREE.InstancedMesh(GE, MT.m, list.length); im.customDepthMaterial=MT.depth;
        list.forEach((f,i)=>{ q.setFromAxisAngle(zA, f.a-Math.PI/2); m4.compose(new V3(f.x-seg.o[0], f.y-seg.o[1], f.z), q, new V3(f.wid, f.len, f.len)); im.setMatrixAt(i, m4); });
        im.castShadow=true; im.frustumCulled=false; seg.g.add(im); }
      // xương mép trước cánh (thon dần ra đầu cánh)
      for(const [seg,P,Q,r0,r1] of [[arm,S,E,.03,.024],[fore,E,Wr,.024,.018],[hand,Wr,H,.018,.01]]){ const len=Math.hypot(Q[0]-P[0],Q[1]-P[1]); const b=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,len,10), boneMat);
        const o=seg===arm?S:seg===fore?E:Wr; b.position.set((P[0]+Q[0])/2-o[0], (P[1]+Q[1])/2-o[1], 0); b.rotation.z=Math.atan2(Q[1]-P[1], Q[0]-P[0])-Math.PI/2; b.castShadow=true; seg.add(b); }
      sides.push({sh, arm, fore, hand}); }
    // vỗ cánh chậm & nhẹ; "flap" (lúc hào hứng) chỉ nhanh/rộng hơn chút, chuyển mượt
    let ph=0, fs=0;
    const update=(dt, flap)=>{ dt=Math.min(.1, dt||0); fs+=((flap?1:0)-fs)*Math.min(1, dt*1.2); ph+=dt*Math.PI*2/(4.6-2.2*fs); const k=1+1.3*fs;
      for(const s of sides){ s.sh.rotation.y=.3+.045*k*Math.sin(ph); s.arm.rotation.z=.065*k*Math.sin(ph); s.fore.rotation.z=.05*k*Math.sin(ph-.7); s.hand.rotation.z=.07*k*Math.sin(ph-1.4); } };
    update(0,0);
    return {g, sides, update}; }
  function addWings(o){ const B=o.po.bones, sp=B.Spine2||B.Spine1||B.Spine; const w=buildWings(); o.wings=w; o.extras.push(w.g);
    o.a.g.updateMatrixWorld(true); const bs=basis(o), p=new V3(); (sp||o.a.g).getWorldPosition(p); p.addScaledVector(bs.F,-.16).y+=.05;
    const q=new THREE.Quaternion(); o.a.g.getWorldQuaternion(q); if(sp) attach(sp, w.g, p, q, 1); else { w.g.position.set(0, o.h*.72, -.16); o.a.g.add(w.g); } }
  // khuôn mặt: ảnh mặt của Bình (data/binhphan_face.png) dán lên chỏm cầu phía trước đầu nhân vật
  function addFace(o){ const H=o.po.bones.Head, T=o.po.bones.HeadTop_End; if(!H) return;
    const mat=new THREE.MeshStandardMaterial({transparent:true, roughness:.75, alphaTest:.05}); const mesh=new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18, Math.PI/2-.8, 1.6, Math.PI/2-.95, 1.75), mat); mesh.visible=false; o.extras.push(mesh); o.face=mesh;   /* chỏm cầu phía trước đầu: trán → cằm */
    fetch('data/characters.json', {cache:'no-store'}).then(r=>r.json()).then(cfg=>{ if(!cfg || !cfg.binhphanFace) return;   // chỉ tải ảnh mặt khi đã có (tránh lỗi 404)
      new THREE.TextureLoader().load('data/binhphan_face.png?v='+encodeURIComponent(cfg.faceVer||1), tex=>{ tex.colorSpace=THREE.SRGBColorSpace; mat.map=tex; mat.needsUpdate=true; mesh.visible=true; }, undefined, ()=>{}); }).catch(()=>{});
    o.a.g.updateMatrixWorld(true); const hp=new V3(), tp=new V3(); H.getWorldPosition(hp); let c=hp.clone(), r=o.h*.07;
    if(T){ T.getWorldPosition(tp); const hh=hp.distanceTo(tp); c.lerp(tp,.5); r=hh*.58; }
    // đo thật mặt trước của đầu (bắn tia từ phía trước vào tâm đầu) → đặt ảnh mặt sát ngoài da, không lọt vào trong đầu
    const sc=new V3(r,r,r);
    try{ const bs=basis(o), meshes=bodyMeshes(o);
      const probe=dir=>{ const ray=new THREE.Raycaster(c.clone().addScaledVector(dir, 1), dir.clone().negate(), 0, 1.2); const h=ray.intersectObjects(meshes, false)[0]; return h ? 1-h.distance : null; };
      const front=probe(bs.F), side=Math.max(probe(bs.R)||0, probe(bs.R.clone().negate())||0), top=probe(bs.U);
      if(front && front>r*.5 && front<r*2.5) sc.z=front+.012;
      sc.x=(side && side>r*.5 && side<r*2.5) ? side+.012 : sc.z; sc.y=(top && top>r*.5 && top<r*2.5) ? top+.012 : Math.max(sc.x, sc.z);
      o.faceProbe={front, side, top}; }catch(e){}
    o.faceScale=sc.toArray().map(v=>+v.toFixed(3));
    const q=new THREE.Quaternion(); o.a.g.getWorldQuaternion(q); attach(H, mesh, c, q, sc); }

  // ---------- thân + bộ vest may liền (thay hẳn thân Xbot) ----------
  // Khung chung Xbot có khớp tròn lộ ra (khuỷu, gối, eo…) và dáng nữ → với anh Bình Phan: GIẤU thân Xbot (dồn đỉnh về khớp → không vẽ)
  // rồi may 1 bộ vest liền khối theo ảnh mẫu Bình gửi: áo 2 khuy vai độn, eo ôm nhẹ, vạt phủ qua mông, xẻ chữ V dưới khuy; tay áo thẳng thon;
  // quần ống đứng phủ giày; giày tây đen bóng; sơ mi trắng + cà vạt đen bản nhỏ; ve áo satin; túi ngực + khăn trắng gấp thẳng; nắp túi 2 bên; 2 khuy.
  // Tất cả là 1 SkinnedMesh dùng CHUNG bộ xương → đi, ngồi, giơ tay vẫn theo người. Dựng ở tư thế gốc (T), đơn vị = toạ độ gốc của Xbot (cao 1,82).
  const SUIT=0x16181d;
  const sm01=t=>{ t=Math.max(0,Math.min(1,t)); return t*t*(3-2*t); };
  function shirtTex(){ return canvasTex(256, 512, (g,w,h)=>{
    const sg=g.createLinearGradient(0,0,w,0); sg.addColorStop(0,'#d6d8dc'); sg.addColorStop(.5,'#f8f8f6'); sg.addColorStop(1,'#d6d8dc'); g.fillStyle=sg; g.fillRect(0,0,w,h);
    g.strokeStyle='rgba(0,0,0,.05)'; for(let x=0;x<w;x+=5){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
    g.fillStyle='#fcfcfa'; g.strokeStyle='rgba(0,0,0,.22)'; g.lineWidth=2;   // cổ áo sơ mi: 2 vạt nhọn
    for(const s of [-1,1]){ g.beginPath(); g.moveTo(w/2,h*.025); g.lineTo(w/2+s*w*.46,0); g.lineTo(w/2+s*w*.22,h*.12); g.closePath(); g.fill(); g.stroke(); }
    const tie=new Path2D(); tie.moveTo(w*.435,h*.035); tie.lineTo(w*.565,h*.035); tie.lineTo(w*.548,h*.1); tie.lineTo(w*.6,h*.92); tie.lineTo(w*.5,h*.995); tie.lineTo(w*.4,h*.92); tie.lineTo(w*.452,h*.1); tie.closePath();
    g.save(); g.clip(tie); const tg=g.createLinearGradient(0,0,w,0); tg.addColorStop(0,'#0b0c0f'); tg.addColorStop(.5,'#2a2b33'); tg.addColorStop(1,'#0b0c0f'); g.fillStyle=tg; g.fillRect(0,0,w,h);
    g.fillStyle='rgba(0,0,0,.4)'; g.fillRect(0,h*.098,w,h*.01); g.restore();   // cà vạt đen bản nhỏ (như ảnh mẫu)
    g.strokeStyle='rgba(0,0,0,.5)'; g.lineWidth=1.5; g.stroke(tie); }); }
  function buildSuitBody(o, hideHead){ let sm=null; o.a.root.traverse(m=>{ if(m.isSkinnedMesh && !sm) sm=m; }); if(!sm) return false;
    const src=sm.geometry, P0=src.attributes.position; let ymax=-9; for(let i=0;i<P0.count;i++) ymax=Math.max(ymax, P0.getY(i));
    if(ymax<1.7 || ymax>1.95) return false;   // không phải khung Xbot quen thuộc → để nguyên
    const names=sm.skeleton.bones.map(b=>b.name.replace(/^mixamorig:?/,'')), bi=n=>names.indexOf(n);
    const RP=sm.skeleton.boneInverses.map(m=>new V3().setFromMatrixPosition(m.clone().invert()).applyMatrix4(sm.bindMatrixInverse)), rp=n=>{ const i=bi(n); return i>=0 ? RP[i] : null; };
    // 1) giấu thân Xbot (và đầu, cổ khi có đầu thật)
    const geo=src.clone(); sm.geometry=geo; o.ownGeo=geo; const P=geo.attributes.position, SI=geo.attributes.skinIndex, SW=geo.attributes.skinWeight;
    const HIDE=/^(Hips|Spine|Spine1|Spine2|(Left|Right)(Shoulder|Arm|ForeArm|UpLeg|Leg|Foot|ToeBase|Toe_End))$/, HEADP=/^(Head|HeadTop_End|LeftEye|RightEye)$/;
    for(let i=0;i<P.count;i++){ let b=0, w=-1; for(let k=0;k<4;k++){ const ww=SW.getComponent(i,k); if(ww>w){ w=ww; b=SI.getComponent(i,k); } } const d=names[b]||'', y=P.getY(i), ax=Math.abs(P.getX(i));
      if(HIDE.test(d) || (hideHead && (HEADP.test(d) || d==='Neck')) || (d==='Neck' && (ax>.06 || y<1.515))){ const r=RP[b]; P.setXYZ(i, r.x, r.y, r.z); } }
    P.needsUpdate=true;
    // 2) lưới bộ vest
    const pos=[], uv=[], SIx=[], SWx=[], idx=[], groups=[]; let gS=0, gM=0;
    const mat=m=>{ if(idx.length>gS) groups.push({start:gS, count:idx.length-gS, materialIndex:gM}); gS=idx.length; gM=m; };
    const HIPS=bi('Hips');
    const vert=(p,u,v,inf)=>{ pos.push(p.x,p.y,p.z); uv.push(u,v); let s=inf.filter(x=>x[0]>=0 && x[1]>1e-4).sort((a,b)=>b[1]-a[1]).slice(0,4); if(!s.length) s=[[HIPS,1]];
      const t=s.reduce((a,b)=>a+b[1],0); for(let k=0;k<4;k++){ SIx.push(s[k] ? s[k][0] : 0); SWx.push(s[k] ? s[k][1]/t : 0); } return pos.length/3-1; };
    const loft=(rings, inf, skip)=>{ const M=rings[0].length, n=rings.length, base=pos.length/3;
      for(let j=0;j<n;j++) for(let k=0;k<=M;k++){ const p=rings[j][k%M]; vert(p, k/M, j/(n-1), inf(p)); }
      for(let j=0;j<n-1;j++) for(let k=0;k<M;k++){ if(skip && skip(j,k,M)) continue; const a=base+j*(M+1)+k, b=a+1, c=a+M+1, d=c+1; idx.push(a,b,c, b,d,c); } };
    const cap=(ring, inf)=>{ const c=ring.reduce((a,p)=>a.add(p), new V3()).multiplyScalar(1/ring.length), ci=vert(c,.5,.5,inf(c)), base=pos.length/3;
      ring.forEach(p=>vert(p,.5,.5,inf(p))); for(let k=0;k<ring.length;k++) idx.push(ci, base+k, base+(k+1)%ring.length); };
    const sell=(cx,y,cz,rx,rf,rb,n,M)=>{ const e=2/n, out=[]; for(let k=0;k<M;k++){ const a=k/M*Math.PI*2, s=Math.sin(a), c=Math.cos(a); out.push(new V3(cx+rx*Math.sign(s)*Math.pow(Math.abs(s),e), y, cz+(c>0?rf:rb)*Math.sign(c)*Math.pow(Math.abs(c),e))); } return out; };
    // thân áo: [y, nửa rộng, trước, sau, tâm z, độ vuông]
    const TOR=[[.8,.182,.118,.126,0,2.5],[.9,.182,.118,.128,0,2.5],[1,.178,.116,.125,0,2.5],[1.08,.17,.113,.118,0,2.5],[1.15,.163,.112,.113,.005,2.5],[1.24,.17,.118,.114,.005,2.5],
      [1.32,.182,.124,.114,0,2.5],[1.4,.198,.118,.113,-.005,2.5],[1.46,.214,.104,.104,-.01,2.4],[1.49,.19,.08,.086,-.015,2.3],[1.505,.12,.066,.076,-.02,2.2],[1.52,.072,.06,.068,-.022,2.1],[1.545,.062,.054,.064,-.024,2]];
    const DIP=r=>r[0]>=1.505 ? .015 : 0;   // cổ áo phía trước thấp hơn phía sau (lộ cổ, không che cằm)
    const torAt=y=>{ if(y<=TOR[0][0]) return TOR[0]; for(let i=0;i<TOR.length-1;i++){ const a=TOR[i], b=TOR[i+1]; if(y<=b[0]){ const t=(y-a[0])/(b[0]-a[0]); return a.map((v,k)=>v+(b[k]-v)*t); } } return TOR[TOR.length-1]; };
    const frontZ=(x,y)=>{ const [,rx,rf,,cz,n]=torAt(y), q=Math.min(.999, Math.abs(x)/rx); return cz+rf*Math.pow(1-Math.pow(q,n), 1/n); };
    const SPN=[['Hips',1.0],['Spine',1.14],['Spine1',1.25],['Spine2',1.38],['Neck',1.75]].map(([n,y])=>[bi(n),y]).filter(x=>x[0]>=0);
    const spineInf=y=>{ if(y<=SPN[0][1]) return [[SPN[0][0],1]]; for(let i=0;i<SPN.length-1;i++){ const [a,ya]=SPN[i], [b,yb]=SPN[i+1]; if(y<=yb){ const t=(y-ya)/(yb-ya); return [[a,1-t],[b,t]]; } } return [[SPN[SPN.length-1][0],1]]; };
    const torsoInf=p=>{ const ax=Math.abs(p.x), sd=p.x>=0 ? 'Left' : 'Right', wsh=sm01((ax-.09)/.12)*sm01((p.y-1.36)/.08)*.65, warm=sm01((ax-.17)/.05)*sm01((p.y-1.38)/.06)*.3, k=1-wsh-warm;
      return [...spineInf(p.y).map(([b,w])=>[b,w*k]), [bi(sd+'Shoulder'),wsh], [bi(sd+'Arm'),warm]]; };
    const BTN=1.15, M=56;
    mat(0); loft(TOR.map(r=>sell(0,r[0],r[4],r[1],r[2],r[3],r[5],M).map(p=>{ const d=DIP(r); if(d) p.y-=d*Math.max(0, (p.z-r[4])/r[2]); return p; })), torsoInf, (j,k,MM)=>{ const y=(TOR[j][0]+TOR[j+1][0])/2; if(y>=BTN) return false; let a=(k+.5)/MM*Math.PI*2; if(a>Math.PI) a-=Math.PI*2; return Math.abs(a)<.44*sm01((BTN-y)/(BTN-.8)); });
    // tay áo (dọc theo trục tay ở tư thế T) + cổ tay áo sơ mi trắng
    for(const sd of [1,-1]){ const S=sd>0 ? 'Left' : 'Right', ay=1.438, az=-.05;
      const ring=(x,r,M2=24)=>{ const out=[]; for(let k=0;k<M2;k++){ const a=k/M2*Math.PI*2; out.push(new V3(sd*x, ay+r*Math.cos(a), az+r*.95*Math.sin(a))); } return out; };
      const armInf=p=>{ const x=Math.abs(p.x), wsh=(1-sm01((x-.13)/.09))*.45, t=sm01((x-.38)/.1); return [[bi(S+'Shoulder'),wsh], [bi(S+'Arm'),(1-wsh)*(1-t)], [bi(S+'ForeArm'),(1-wsh)*t]]; };
      mat(0); loft([[.13,.07],[.19,.066],[.26,.061],[.34,.056],[.43,.052],[.52,.049],[.61,.047],[.69,.046]].map(([x,r])=>ring(x,r)), armInf);
      mat(4); loft([[.672,.0415],[.708,.0405]].map(([x,r])=>ring(x,r)), p=>[[bi(S+'ForeArm'),1]]);
      // quần (dưới → trên) + giày
      const lx=sd*.085, czAt=y=>y>.53 ? .01+(y-.53)/(.99-.53)*-.005 : -.015+(y-.06)/(.53-.06)*.025;
      const legInf=p=>{ const t=sm01((p.y-.46)/.16), wh=sm01((p.y-.88)/.1)*.5; return [[bi(S+'Leg'),(1-t)*(1-wh)], [bi(S+'UpLeg'),t*(1-wh)], [HIPS,wh]]; };
      mat(0); loft([[.055,.058,.062,.058],[.1,.056,.058,.058],[.25,.057,.058,.06],[.4,.06,.06,.062],[.53,.062,.063,.064],[.65,.068,.068,.072],[.78,.078,.076,.084],[.9,.088,.085,.096],[.99,.1,.095,.105]]
        .map(([y,rx,rf,rb])=>sell(lx,y,czAt(y),rx,rf,rb,2,28)), legInf);
      const F=rp(S+'Foot')||new V3(lx,.084,-.022), TE=rp(S+'Toe_End'), z0=F.z-.07, z1=TE ? TE.z+.02 : F.z+.2, fx=F.x;
      const SH=[[0,.034,.072],[.12,.042,.088],[.3,.046,.085],[.5,.05,.062],[.7,.049,.05],[.85,.042,.04],[1,.022,.026]];
      const shoeRing=(t,w,h)=>{ const out=[], z=z0+(z1-z0)*t, M3=24; for(let k=0;k<M3;k++){ const a=k/M3*Math.PI*2, s=Math.sin(a), c=Math.cos(a); out.push(new V3(fx+w*Math.sign(c)*Math.pow(Math.abs(c),.8), s>0 ? .004+h*Math.pow(s,.8) : .002, z)); } return out; };
      const shoeInf=p=>{ const t=sm01(((p.z-z0)/(z1-z0)-.55)/.2); return [[bi(S+'Foot'),1-t], [bi(S+'ToeBase'),t]]; };
      const rings=SH.map(([t,w,h])=>shoeRing(t,w,h)); mat(1); loft(rings, shoeInf); cap(rings[0], shoeInf); cap(rings[rings.length-1], shoeInf); }
    // sơ mi + cà vạt (mảng chữ V ôm theo mặt trước thân áo)
    const yTop=1.5, halfW=t=>.066-.058*Math.pow(t,.9), NS=9, NT=18;
    const vpatch=(xa, off, NS2, mi, uvFn)=>{ mat(mi); const base=pos.length/3;
      for(let j=0;j<NT;j++){ const t=j/(NT-1), y=yTop-t*(yTop-BTN); for(let s=0;s<NS2;s++){ const x=xa(t, s/(NS2-1)); const p=new V3(x, y, frontZ(x,y)+off); vert(p, ...uvFn(s/(NS2-1), t), torsoInf(p)); } }
      for(let j=0;j<NT-1;j++) for(let s=0;s<NS2-1;s++){ const a=base+j*NS2+s, b=a+1, c=a+NS2, d=c+1; idx.push(a,c,b, b,c,d); } };
    vpatch((t,u)=>(u*2-1)*halfW(t), .004, NS, 2, (u,t)=>[u, 1-t]);
    for(const sd of [-1,1]) vpatch((t,u)=>{ const hw=halfW(t), notch=(t>.16 && t<.22) ? .022 : 0, lw=.066-.05*t-notch; return sd*(hw+lw*u); }, .007, 4, 3, (u,t)=>[u,t]);
    // khuy, nắp túi, túi ngực + khăn
    const disc=(cx,cy,r,off,mi)=>{ mat(mi); const c=new V3(cx,cy,frontZ(cx,cy)+off), ci=vert(c,.5,.5,torsoInf(c)), base=pos.length/3;
      for(let k=0;k<14;k++){ const a=k/14*Math.PI*2, x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r; const p=new V3(x,y,frontZ(x,y)+off); vert(p,.5,.5,torsoInf(p)); } for(let k=0;k<14;k++) idx.push(ci, base+k, base+(k+1)%14); };
    disc(0, BTN, .0095, .009, 5); disc(0, BTN-.095, .0095, .009, 5);
    const quad=(x0,x1,y0,y1,off,mi)=>{ mat(mi); const base=pos.length/3, NX=6;
      for(let j=0;j<2;j++) for(let i=0;i<=NX;i++){ const x=x0+(x1-x0)*i/NX, y=j ? y1 : y0, p=new V3(x,y,frontZ(x,y)+off); vert(p, i/NX, j, torsoInf(p)); }
      for(let i=0;i<NX;i++){ const a=base+i, b=a+1, c=a+NX+1, d=c+1; idx.push(a,b,c, b,d,c); } };
    for(const sd of [-1,1]) quad(sd*.035+sd*.0, sd*.165, .965, 1.01, .005, 3);   // nắp túi 2 bên hông
    quad(.05, .135, 1.36, 1.372, .005, 3); quad(.064, .118, 1.372, 1.388, .006, 4);   // túi ngực trái + khăn trắng gấp thẳng
    mat(-1);
    const sg=new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); sg.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
    sg.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SIx,4)); sg.setAttribute('skinWeight', new THREE.Float32BufferAttribute(SWx,4)); sg.setIndex(idx);
    for(const g of groups) sg.addGroup(g.start, g.count, g.materialIndex); sg.computeVertexNormals(); sg.computeBoundingSphere();
    const D=THREE.DoubleSide, mats=[
      new THREE.MeshPhysicalMaterial({color:SUIT, roughness:.86, sheen:.45, sheenColor:new THREE.Color(0x3b3e48), sheenRoughness:.6, side:D}),   // vải vest
      new THREE.MeshPhysicalMaterial({color:0x0a0a0c, roughness:.3, metalness:.05, clearcoat:.7, clearcoatRoughness:.2, side:D}),             // da giày bóng
      new THREE.MeshStandardMaterial({map:shirtTex(), roughness:.7, side:D}),                                                              // sơ mi + cà vạt
      new THREE.MeshStandardMaterial({color:0x0f1014, roughness:.36, metalness:.08, side:D}),                                             // ve áo satin / nắp túi
      new THREE.MeshStandardMaterial({color:0xf3f3f1, roughness:.7, side:D}),                                                             // trắng: cổ tay áo, khăn túi
      new THREE.MeshStandardMaterial({color:0x08080a, roughness:.25, metalness:.3, side:D})];                                             // khuy
    const suit=new THREE.SkinnedMesh(sg, mats); suit.name='bpSuit'; suit.castShadow=true; suit.receiveShadow=true; suit.frustumCulled=false;
    sm.parent.add(suit); suit.position.copy(sm.position); suit.quaternion.copy(sm.quaternion); suit.scale.copy(sm.scale); suit.updateMatrixWorld(true);
    suit.bind(sm.skeleton, sm.bindMatrix); o.extras.push(suit); o.suit=suit; o.a.g.updateMatrixWorld(true); return true; }

  // đầu thật: hình đầu dựng từ video (visual hull, data/binhphan_head_shape.json) + ảnh màu 360° chiếu lên đúng hình đó
  function headGeo(){ const g=new THREE.SphereGeometry(1, 72, 44), p=g.attributes.position;   // dự phòng khi thiếu file hình dạng: elip
    for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i), lo=Math.pow(Math.max(0,-y),2); p.setXYZ(i, x*(1-.26*lo), y, z*(z>0 ? 1-.12*lo : 1-.34*lo)); }
    g.computeVertexNormals(); return g; }
  function shapeGeo(S, mpp){ const g=new THREE.SphereGeometry(1, S.w, S.h), p=g.attributes.position; if(p.count!==S.r.length) return null;
    for(let i=0;i<p.count;i++){ const r=S.r[i]*mpp; p.setXYZ(i, p.getX(i)*r, p.getY(i)*r, p.getZ(i)*r); } g.computeVertexNormals(); return g; }
  function addHead(o){ const Hd=o.po.bones.Head; if(!Hd || !HEADTEX) return addFace(o);
    o.a.g.updateMatrixWorld(true); const bs=basis(o), hp=new V3(); Hd.getWorldPosition(hp); const k=o.h/1.82, B=.118*k;
    // tâm đầu thật = ngang tầm mắt (Xbot: mắt cao hơn khớp đầu ~6,5 cm, tâm đầu ~ ngay trên trục cổ)
    const cen=hp.clone().addScaledVector(bs.U, .08*k).addScaledVector(bs.F, .012*k);
    let geo=null, sc=new V3(1,1,1);
    if(HEADSHAPE) geo=shapeGeo(HEADSHAPE, B/(HEADSHAPE.B||232));
    if(!geo){ geo=headGeo(); sc.set(B*178/232, B, B*190/232); }
    const mesh=new THREE.Mesh(geo, new THREE.MeshStandardMaterial({map:HEADTEX, roughness:.62})); mesh.castShadow=true; o.extras.push(mesh); o.face=mesh;
    o.headFit={shape:!!HEADSHAPE, B:+B.toFixed(3)};
    const q=new THREE.Quaternion(); o.a.g.getWorldQuaternion(q); attach(Hd, mesh, cen, q, sc); }

  // ---------- trang sức anh Bình Phan: dây chuyền vàng to bản + mặt kim cương lớn, vương miện vàng ----------
  // Đo thân thật bằng tia (cổ, vai, ngực, đầu) rồi gắn vào xương → đi, ngồi, cúi vẫn ôm theo người, không xuyên áo/da.
  const goldMat=side=>new THREE.MeshStandardMaterial({color:0xf5c544, metalness:1, roughness:.18, emissive:0x452d00, emissiveIntensity:.5, side:side||THREE.FrontSide});
  const gemMat=color=>new THREE.MeshPhysicalMaterial({color, metalness:.15, roughness:.02, clearcoat:1, clearcoatRoughness:0, flatShading:true, emissive:color, emissiveIntensity:.22, envMapIntensity:2.6});
  const diamondMat=()=>new THREE.MeshPhysicalMaterial({color:0xffffff, metalness:.3, roughness:0, clearcoat:1, clearcoatRoughness:0, iridescence:1, iridescenceIOR:2.1, iridescenceThicknessRange:[150,900], flatShading:true, emissive:0x26364a, emissiveIntensity:.4, envMapIntensity:3.4});
  // tia lấp lánh 4 cánh (sprite cộng sáng), nhấp nháy ngẫu nhiên
  const starTex=()=>canvasTex(64,64,(g,w,h)=>{ const c=w/2, gr=g.createRadialGradient(c,c,0,c,c,c*.45); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    for(const hz of [true,false]){ const lg=hz ? g.createLinearGradient(0,0,w,0) : g.createLinearGradient(0,0,0,h); lg.addColorStop(0,'rgba(255,255,255,0)'); lg.addColorStop(.5,'rgba(255,255,255,1)'); lg.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=lg; if(hz) g.fillRect(0,c-1.5,w,3); else g.fillRect(c-1.5,0,3,h); } });
  function sparkle(tex, size){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, opacity:0}));
    s.scale.setScalar(size); s.userData={size, ph:Math.random()*6.28, sp:1.4+Math.random()*1.6}; return s; }
  function twinkle(list, T){ for(const s of list){ const u=s.userData, k=Math.pow(Math.max(0, Math.sin(T*u.sp+u.ph)), 10); s.material.opacity=k; s.scale.setScalar(u.size*(.4+.9*k)); s.material.rotation=T*.6+u.ph; } }
  // bản chụp tư thế hiện tại của thân người → mesh tĩnh để bắn tia đo (bắn thẳng vào SkinnedMesh rất chậm: mỗi tam giác phải tính lại xương,
  // ~65 tia mất 2,3 s; chụp 1 lần rồi đo chỉ còn vài chục ms). Chụp TRƯỚC khi gắn cánh/mặt/trang sức → chỉ có thân người.
  // Thân được cắt thành ~32 lát ngang (mỗi lát 1 mesh có hộp bao riêng) → tia ngang chỉ phải xét 1–2 lát thay vì cả 50 nghìn tam giác.
  function posedProxies(o){ o.a.g.updateMatrixWorld(true); const out=[], v=new V3(), mat=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
    o.a.root.traverse(m=>{ if(!m.isMesh || !m.geometry || !m.geometry.attributes.position) return; const src=m.geometry, pa=src.attributes.position, n=pa.count;
      const arr=new Float32Array(n*3); for(let i=0;i<n;i++){ if(m.isSkinnedMesh) m.getVertexPosition(i, v); else v.fromBufferAttribute(pa, i); arr[i*3]=v.x; arr[i*3+1]=v.y; arr[i*3+2]=v.z; }
      const idx=src.index ? src.index.array : null, nt=idx ? idx.length/3 : n/3; let y0=Infinity, y1=-Infinity; for(let i=0;i<n;i++){ y0=Math.min(y0, arr[i*3+1]); y1=Math.max(y1, arr[i*3+1]); }
      const NB=32, bands=Array.from({length:NB}, ()=>[]), vi=(t,k)=>idx ? idx[t*3+k] : t*3+k;
      for(let t=0;t<nt;t++){ const cy=(arr[vi(t,0)*3+1]+arr[vi(t,1)*3+1]+arr[vi(t,2)*3+1])/3; bands[Math.max(0, Math.min(NB-1, Math.floor((cy-y0)/(y1-y0+1e-6)*NB)))].push(t); }
      for(const b of bands){ if(!b.length) continue; const f=new Float32Array(b.length*9);
        b.forEach((t,j)=>{ for(let k=0;k<3;k++){ const s=vi(t,k)*3; f[j*9+k*3]=arr[s]; f[j*9+k*3+1]=arr[s+1]; f[j*9+k*3+2]=arr[s+2]; } });
        const geo=new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(f,3)); geo.computeBoundingBox(); geo.computeBoundingSphere();
        const p=new THREE.Mesh(geo, mat); p.matrixAutoUpdate=false; p.matrixWorldAutoUpdate=false; p.matrixWorld.copy(m.matrixWorld); out.push(p); } });
    return out; }
  // các mesh thân người để đo (thêm "keep" nếu cần – vd lớp ảnh mặt khi đo vành vương miện)
  function bodyMeshes(o, keep){ if(!o.probe) o.probe=posedProxies(o); return keep ? [...o.probe, keep] : o.probe; }
  // bán kính mặt ngoài tính từ điểm c theo hướng dir (bắn tia từ ngoài vào tâm); null nếu không trúng
  function surf(meshes, c, dir, far=.5){ const h=new THREE.Raycaster(c.clone().addScaledVector(dir, far), dir.clone().negate(), 0, far).intersectObjects(meshes, false)[0]; return h ? far-h.distance : null; }

  // dây chuyền: vòng mắt xích oval to bản móc vào nhau, sau gáy nằm sát chân cổ, hai bên vắt qua vai, phía trước rơi xuống giữa ngực
  function addChain(o){ const B=o.po.bones, N=B.Neck, S=B.Spine2||B.Spine1; if(!N||!S) return;
    o.a.g.updateMatrixWorld(true); const bs=basis(o), meshes=bodyMeshes(o), pN=new V3(), pS=new V3(); N.getWorldPosition(pN); S.getWorldPosition(pS);
    const k=o.h/1.75, drop=.16*k, yN=pN.y, dn=new V3(0,-1,0);
    const axis=y=>pS.clone().lerp(pN, THREE.MathUtils.clamp((y-pS.y)/Math.max(.01, yN-pS.y), 0, 1.3)).setY(y);
    const K=28, pts=[];
    for(let i=0;i<K;i++){ const a=i/K*Math.PI*2, ca=Math.cos(a), d=bs.F.clone().multiplyScalar(ca).addScaledVector(bs.R, Math.sin(a));
      const wf=Math.pow((1+ca)/2, 2.2); let y=yN+.012*k-drop*wf; const ax=axis(y);
      const lim=(.07+.035*Math.abs(Math.sin(a)))*k + (ca>0 ? wf*.12*k : 0);   // quanh cổ ~7–10 cm; phía trước được rơi ra tới ngực
      let r=surf(meshes, ax, d, .45);
      if(r==null || r>lim){ r=Math.min(r ?? lim, lim);   // tia ngang trúng vai/lưng → dây vắt lên mặt trên vai (cơ thang) ở bán kính r
        const top=ax.clone().addScaledVector(d, r+.01*k); top.y=yN+.25*k; const h=new THREE.Raycaster(top, dn, 0, .4*k).intersectObjects(meshes, false)[0];
        if(h && h.point.y<yN+.07*k) y=Math.max(y, h.point.y+.01*k); }
      pts.push(ax.setY(y).addScaledVector(d, r+.016*k)); }
    for(let pass=0;pass<2;pass++){ const cp=pts.map(p=>p.clone()); for(let i=0;i<K;i++) pts[i].copy(cp[(i+K-1)%K]).multiplyScalar(.25).addScaledVector(cp[i],.5).addScaledVector(cp[(i+1)%K],.25); }
    const q=new THREE.Quaternion(); o.a.g.getWorldQuaternion(q); const qi=q.clone().invert(), L=p=>p.clone().sub(pN).applyQuaternion(qi);
    const curve=new THREE.CatmullRomCurve3(pts.map(L), true, 'centripetal');
    const g=new THREE.Group(), gold=goldMat(), Rl=.0135*k, rt=.005*k, step=2*1.25*Rl-2.6*rt;   // mắt xích oval: khoảng cách vừa đủ để 2 mắt móc lồng vào nhau
    const n=Math.max(12, Math.round(curve.getLength()/step));
    const links=new THREE.InstancedMesh(new THREE.TorusGeometry(Rl, rt, 8, 18), gold, n); const m=new THREE.Matrix4(), X=new V3(), Y=new V3(), Z=new V3(), sc=new V3(1.25,1,.8);
    for(let i=0;i<n;i++){ const u=i/n, p=curve.getPointAt(u); X.copy(curve.getTangentAt(u)).normalize(); Z.set(p.x,0,p.z).normalize(); Z.addScaledVector(X, -Z.dot(X)).normalize(); Y.crossVectors(Z, X);
      if(i%2){ const t=Y.clone(); Y.copy(Z); Z.copy(t).negate(); }   // mắt chẵn nằm áp người, mắt lẻ dựng đứng → kiểu xích móc
      m.makeBasis(X,Y,Z).scale(sc).setPosition(p); links.setMatrixAt(i, m); }
    links.castShadow=true; links.frustumCulled=false; g.add(links);
    // mặt dây: viên kim cương giác cắt tròn cỡ lớn, viền vàng, khoen treo; đẩy ra trước cho đáy nhọn không chọc vào ngực
    const fp=curve.getPointAt(0), Dr=.036*k, dc=fp.clone(); dc.y-=.014*k+Rl+Dr*.98;
    const dw=dc.clone().applyQuaternion(q).add(pN), ax2=axis(dw.y), rs=surf(meshes, ax2, bs.F, .45);
    if(rs!=null) dc.z=Math.max(dc.z, L(ax2.clone().addScaledVector(bs.F, rs)).z+.62*Dr+.006*k);
    const prof=[[.001,-.62],[.5,-.3],[1,-.02],[1,.035],[.8,.17],[.56,.27],[.001,.27]].map(([x,y])=>new THREE.Vector2(x,y));
    const dia=new THREE.Mesh(new THREE.LatheGeometry(prof, 16), diamondMat()); dia.scale.setScalar(Dr); dia.rotation.x=Math.PI/2; dia.position.copy(dc); dia.castShadow=true; g.add(dia);
    const bez=new THREE.Mesh(new THREE.TorusGeometry(Dr*1.02, .0035*k, 8, 40), gold); bez.position.copy(dc); g.add(bez);
    const topD=dc.clone(); topD.y+=Dr*1.02; const bail=new THREE.Mesh(new THREE.TorusGeometry(.012*k, .0038*k, 8, 20), gold); bail.position.copy(fp).lerp(topD,.5);
    bail.quaternion.setFromUnitVectors(new V3(0,1,0), fp.clone().sub(topD).normalize()).multiply(new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0), Math.PI/2));
    bail.scale.set(1, Math.max(1, fp.distanceTo(topD)/(.024*k)), 1); g.add(bail);
    const tex=starTex(); for(const [x,y,s] of [[0,0,.075],[-.45,.35,.05],[.5,-.3,.045],[.25,.55,.04]]){ const s1=sparkle(tex, s*k); s1.position.copy(dc).add(new V3(x*Dr, y*Dr, .32*Dr)); g.add(s1); o.sparkles.push(s1); }
    attach(S, g, pN, q, 1); o.extras.push(g); o.chain={g, n, diamond:dia}; }

  // vương miện: dải vàng loe nhẹ, 8 chóp nhọn (chóp giữa ngay trán) có bi vàng, đá quý đỏ/xanh/lục quanh dải, lót nhung đỏ
  function buildCrown(rx, rz, H){ const g=new THREE.Group(), gold=goldMat(THREE.DoubleSide), M=160, NP=8, th=.0055, flare=.16;
    const fy=u=>{ const t=(u/(Math.PI*2)*NP+.5)%1; return H*(.44+.56*Math.pow(1-Math.abs(2*t-1), 2.4)); };
    const P=(u,y,inset=0)=>{ const s=1+flare*y/H; return new V3(Math.sin(u)*(rx*s-inset), y, Math.cos(u)*(rz*s-inset)); };
    const pos=[], quad=(a,b,c,d)=>pos.push(a.x,a.y,a.z, b.x,b.y,b.z, c.x,c.y,c.z, a.x,a.y,a.z, c.x,c.y,c.z, d.x,d.y,d.z);
    for(let i=0;i<M;i++){ const u0=i/M*Math.PI*2, u1=(i+1)/M*Math.PI*2, h0=fy(u0), h1=fy(u1);
      const ob0=P(u0,0), ob1=P(u1,0), ot0=P(u0,h0), ot1=P(u1,h1), ib0=P(u0,0,th), ib1=P(u1,0,th), it0=P(u0,h0,th), it1=P(u1,h1,th);
      quad(ob0,ob1,ot1,ot0); quad(ot0,ot1,it1,it0); quad(it0,it1,ib1,ib0); quad(ib0,ib1,ob1,ob0); }
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); bg.computeVertexNormals();
    const band=new THREE.Mesh(bg, gold); band.castShadow=true; g.add(band);
    const rim=(y,r)=>{ const c=new THREE.CatmullRomCurve3(Array.from({length:48},(_,i)=>P(i/48*Math.PI*2, y, -r*.6)), true); g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 96, r, 8, true), gold)); };
    rim(.003, .0042); rim(H*.4, .0028);
    const ball=new THREE.SphereGeometry(1, 14, 10), oct=new THREE.OctahedronGeometry(1, 0), cols=[0xd0103a, 0x1846c9, 0x0f9d58], gems=[];   // hồng ngọc, lam ngọc, lục bảo
    for(let i=0;i<NP;i++){ const u=i/NP*Math.PI*2, big=i===0;
      const b=new THREE.Mesh(ball, gold); b.position.copy(P(u, H+.0045, th/2)); b.scale.setScalar(big ? .0085 : .0065); g.add(b);
      const gm=new THREE.Mesh(oct, gemMat(big ? 0xd0103a : cols[i%3])), p=P(u, H*.2, -.001); gm.position.copy(p);
      gm.lookAt(p.clone().add(new V3(Math.sin(u)/rx, 0, Math.cos(u)/rz).normalize())); const s=big ? .0125 : .0078; gm.scale.set(s, s*1.3, s*.5); g.add(gm); gems.push(gm); }
    const cap=new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI*2, 0, Math.PI/2), new THREE.MeshStandardMaterial({color:0x7a0d1f, roughness:.92}));
    cap.scale.set(rx*(1+flare*.5)-th, H, rz*(1+flare*.5)-th); g.add(cap);
    const orb=new THREE.Mesh(ball, gold); orb.scale.setScalar(.011); orb.position.y=H+.008; g.add(orb);
    return {g, gems, tip:P(0, H+.0045, 0), flare}; }
  function addCrown(o){ const Hd=o.po.bones.Head, T=o.po.bones.HeadTop_End; if(!Hd) return;
    o.a.g.updateMatrixWorld(true); const bs=basis(o), meshes=bodyMeshes(o, o.face), hp=new V3(), tp=new V3(); Hd.getWorldPosition(hp); const c=hp.clone(); let top=.12;
    if(T){ T.getWorldPosition(tp); c.lerp(tp,.5); top=hp.distanceTo(tp)*.6; }
    const t=surf(meshes, c, bs.U); if(t && t>.05 && t<.25) top=t;
    const cb=c.clone().addScaledVector(bs.U, top*.5);   // vành dưới vương miện ôm ngang trán (trên chân mày)
    const f=surf(meshes, cb, bs.F) || top*.9, b=surf(meshes, cb, bs.F.clone().negate()) || top*.85, r1=surf(meshes, cb, bs.R), r2=surf(meshes, cb, bs.R.clone().negate());
    const rx=Math.max(r1||0, r2||0, .06)+.008, rz=(f+b)/2+.008; cb.addScaledVector(bs.F, (f-b)/2);
    const k=o.h/1.75, cr=buildCrown(rx, rz, .085*k);
    const tex=starTex(); for(const [p,s] of [[cr.gems[0].position.clone().add(new V3(0,0,.008)), .05], [cr.tip.clone().add(new V3(0,.004,.006)), .035]]){ const s1=sparkle(tex, s); s1.position.copy(p); cr.g.add(s1); o.sparkles.push(s1); }
    const q=new THREE.Quaternion(); o.a.g.getWorldQuaternion(q); attach(Hd, cr.g, cb, q, 1); o.extras.push(cr.g); o.crown=cr; o.crownFit={top:+top.toFixed(3), rx:+rx.toFixed(3), rz:+rz.toFixed(3)}; }
  // màn hình điện thoại anh Bình Phan: mã QR ảo (lúc đưa ra cho quét) → "+2000" (sau khi chạm)
  function qrTex(){ return canvasTex(128,256,(c,w,h)=>{ c.fillStyle='#f4f1ea'; c.fillRect(0,0,w,h); c.fillStyle='#1b2233'; c.font='bold 13px Segoe UI'; c.textAlign='center'; c.fillText('Bình Phan Pay',w/2,30);
    const N=21, s=4, x0=(w-N*s)/2, y0=56; let r=4242; const rnd=()=>((r=(r*1103515245+12345)&0x7fffffff)/0x7fffffff);
    c.fillStyle='#fff'; c.fillRect(x0-6,y0-6,N*s+12,N*s+12); c.fillStyle='#111';
    for(let i=0;i<N;i++) for(let j=0;j<N;j++){ const fz=(a,b)=>a>=0&&a<7&&b>=0&&b<7; const inF=fz(i,j)||fz(i-N+7,j)||fz(i,j-N+7); if(!inF && rnd()<.5) c.fillRect(x0+i*s,y0+j*s,s,s); }
    for(const [fi,fj] of [[0,0],[N-7,0],[0,N-7]]){ c.fillRect(x0+fi*s,y0+fj*s,7*s,7*s); c.fillStyle='#fff'; c.fillRect(x0+(fi+1)*s,y0+(fj+1)*s,5*s,5*s); c.fillStyle='#111'; c.fillRect(x0+(fi+2)*s,y0+(fj+2)*s,3*s,3*s); }
    c.fillStyle='#5b6474'; c.font='600 11px Segoe UI'; c.fillText('Quét để nhận quà 💛',w/2,y0+N*s+24); c.fillText('OPPO Find X9 Ultra',w/2,h-14); }); }
  function buildPhone(){ const g=new THREE.Group(); const body=new THREE.MeshStandardMaterial({color:0x2a2c31, metalness:.85, roughness:.25});
    const paid=canvasTex(64,128,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#1b2a52'); gr.addColorStop(1,'#d4a017'); c.fillStyle=gr; c.fillRect(0,0,w,h); c.fillStyle='rgba(255,255,255,.9)'; c.font='bold 16px Segoe UI'; c.textAlign='center'; c.fillText('+2000',w/2,h/2); }), qr=qrTex();
    const scr=new THREE.MeshBasicMaterial({map:qr}); g.userData.screen=k=>{ scr.map=k==='paid'?paid:qr; scr.needsUpdate=true; }; g.userData.texs=[paid,qr];
    const add=(geo,m,x=0,y=0,z=0)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); g.add(o); return o; };
    add(new THREE.BoxGeometry(.076,.162,.009), body); add(new THREE.PlaneGeometry(.07,.154), scr, 0,0,.0047);
    const cam=add(new THREE.CylinderGeometry(.026,.026,.006,24), new THREE.MeshStandardMaterial({color:0x111111, metalness:.6, roughness:.2}), 0,.045,-.0075); cam.rotation.x=Math.PI/2;
    for(const [x,y] of [[-.01,.055],[.01,.055],[-.01,.035],[.01,.035]]){ const l=add(new THREE.CylinderGeometry(.007,.007,.004,14), new THREE.MeshStandardMaterial({color:0x05060a, metalness:.9, roughness:.1}), x,y,-.0105); l.rotation.x=Math.PI/2; }
    return g; }
  // anh Bình Phan: dáng người mẫu nam 1,82 m, vest đen may liền – đầu 3D thật (dựng từ video) nếu máy có ảnh, không thì mặt ảnh phẳng / đầu mặc định
  function makeBP(){ const seed=W.people.pickSeed ? W.people.pickSeed(L=>!L.female, 4242) : 4242, real=!!HEADTEX;
    const skin=/^#?[0-9a-f]{6}$/i.test(CFG.skin||'') ? parseInt(CFG.skin.replace('#',''),16) : 0xc08a6a;
    const o=npc(seed, {female:false, dress:false, skirt:false, shorts:false, long:true, shirt:SUIT, pants:SUIT, shoe:0x0b0b0d, hair:0x0e0d0c, style:real?'bald':'short', skin, glasses:false}, '😎 Anh trai Bình Phan', '#ffd23f', 1.82);
    o.sparkles=[];
    try{ buildSuitBody(o, real); }catch(e){ console.warn('topup suit', e); }
    o.probe=posedProxies(o); addWings(o);
    if(real) addHead(o); else addFace(o);
    try{ addChain(o); }catch(e){ console.warn('topup chain', e); }
    try{ addCrown(o); }catch(e){ console.warn('topup crown', e); }
    o.probe=null; o.bling=T=>twinkle(o.sparkles, T); o.phone=buildPhone(); o.phone.scale.setScalar(1.25); o.phone.visible=false; scene.add(o.phone); o.extras.push(o.phone); return o; }
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
    let tAll=0, lastSpark=0, flying=null, meShoulder=null; me.root.traverse(b=>{ if(!meShoulder && b.isBone && /LeftArm$/.test(b.name)) meShoulder=b; });
    SC.frame=(dt,T)=>{ tAll+=dt;
      for(const o of people){ o.a.mixer.update(dt); const B=o.po.bones;
        if(o.pose) o.po.apply(o.pose, T);
        // đang nói: gật đầu nhẹ + tay đưa lên xuống (tay đang cầm điện thoại / giơ ngón cái / vỗ vai thì để yên)
        o.talkW=(o.talkW||0)+((o.talkT||0)-(o.talkW||0))*Math.min(1,dt*4);
        if(o.talkW>.01){ const bs=basis(o), g=o.talkW;
          aim(B,'Neck','Head',Dv(bs,.1+Math.sin(T*5.5)*.13,1,Math.sin(T*1.7)*.05),g*.9);
          if(o.thumbs<.01){ aim(B,'LeftArm','LeftForeArm',Dv(bs,.3+.18*Math.sin(T*2.3),-1,-.32),g*.7); aim(B,'LeftForeArm','LeftHand',Dv(bs,1,.1+.55*(.5+.5*Math.sin(T*3.4)),-.15),g*.8); }
          if(o.thumbs<.01 && o.reach<.2 && !(o.pat>.01)){ aim(B,'RightArm','RightForeArm',Dv(bs,.25+.15*Math.sin(T*2.9+1),-1,.3),g*.6); aim(B,'RightForeArm','RightHand',Dv(bs,1,.1+.5*(.5+.5*Math.sin(T*3.9+2)),.15),g*.7); } }
        // vỗ vai người chơi (tay phải anh Bình Phan → vai trái người chơi), nhún 3 nhịp
        if(o.pat>.01 && meShoulder){ const bs=basis(o), tg=meShoulder.getWorldPosition(new V3()).add(new V3(0,.06+.08*Math.abs(Math.sin((o.patT||0)*Math.PI*2)),0)).addScaledVector(bs.F,-.04);
          ikArm(o,'Right',tg,Dv(bs,-.2,-1,.7),o.pat); }
        if(o.reach>.001 || o.thumbs>.001){ const bs=basis(o);
          if(o.reach>.001){ aim(B,'RightArm','RightForeArm',Dv(bs,1,-.25,.12),o.reach); aim(B,'RightForeArm','RightHand',Dv(bs,1,.25,-.05),o.reach); }
          if(o.thumbs>.001) for(const [s,k] of [['Left',-1],['Right',1]]){ aim(B,s+'Arm',s+'ForeArm',Dv(bs,.25,-.3,k),o.thumbs); aim(B,s+'ForeArm',s+'Hand',Dv(bs,.35,1,-k*.15),o.thumbs); } }
        if(o.bling) o.bling(T);
        if(o.wings) o.wings.update(dt, o.flap||0);
        if(o.phone){ o.phone.visible=o.reach>.3; if(o.phone.visible && B.RightHand){ B.RightHand.getWorldPosition(_a); const bs=basis(o); o.phone.position.copy(_a).addScaledVector(bs.F,.07).add(new V3(0,.03,0)); o.phone.quaternion.setFromAxisAngle(new V3(0,1,0), Math.atan2(-bs.F.x,-bs.F.z)); } }
        if(o.bubble){ o.bubT-=dt; if(o.bubT<=0){ W.removeLabel(o.bubble); o.bubble=null; } } }
      if(flying){ flying(dt); if(tAll-lastSpark>.12){ lastSpark=tAll; const p=car.g.localToWorld(new V3(0,.6,-3.1)); W.burst(p, [0xffd23f,0xffffff,0xff8fc2], 22, 2, .8, 1, .12); }
        const o=HOOK.camOverride; if(o) o.look.copy(car.g.position).y+=.6; } };
    SC.cleanup=()=>{ G.hold.want=0; if(SC.noMoney){ W.removeLabel(SC.noMoney); SC.noMoney=null; } for(const t of (bp.phone&&bp.phone.userData.texs)||[]) t.dispose(); for(const o of people) dropNpc(o); if(car.g.parent) car.g.parent.remove(car.g); disposeTree(car.g); if(SC.bigLabel){ W.removeLabel(SC.bigLabel); SC.bigLabel=null; } };
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
    // camera đứng sau vai người chơi, NHÌN THẲNG mặt anh Bình Phan, lùi xa đủ thấy cả người + điện thoại + bong bóng thoại
    const faceShot=()=>{ const b=bp.a.g.position, d=new V3(b.x-P.x,0,b.z-P.z).normalize(), sd=new V3(-d.z,0,d.x);
      shot(new V3(P.x,0,P.z).addScaledVector(d,-1.3).addScaledVector(sd,2.6).add(up(P.y+1.85)), new V3(b.x,P.y+1.32,b.z).addScaledVector(d,-.3).addScaledVector(sd,-.25), 2.2); };
    // quét mã / chuyển tiền (không thoại): camera lại gần sau vai người chơi, thấy rõ màn hình 2 điện thoại
    const scanShot=()=>{ const b=bp.a.g.position, d=new V3(b.x-P.x,0,b.z-P.z).normalize(), sd=new V3(-d.z,0,d.x), hp=me.g.localToWorld(new V3(0,(me.h||1.78)*.78,.3));
      const bpPh=bp.phone.visible ? bp.phone.position.clone() : new V3(b.x,P.y+1.2,b.z).addScaledVector(d,-.35);
      shot(hp.clone().addScaledVector(d,-.45).addScaledVector(sd,1.15).add(up(.28)), hp.clone().lerp(bpPh,.55), 2.6); };
    const talk=async(text)=>{ const sec=2.3+text.length*.045; say(bp, text, sec+.4); bp.talkT=1; bp.flap=1; await wait(sec); bp.talkT=0; bp.flap=0; };
    faceShot(); await wait(.6); if(!SC.alive) return;
    // 4) anh đưa điện thoại có mã QR ra trước → người chơi giơ điện thoại quét → báo không đủ tiền
    bp.phone.userData.screen('qr'); await run((()=>{ let t=0; return dt=>{ t+=dt; bp.reach=sm(t/.9); return t>=.9; }; })()); if(!SC.alive) return;
    scanShot(); await wait(1.4); if(!SC.alive) return;
    G.hold.kind='phone'; G.hold.want=1; await wait(1.1); if(!SC.alive) return;
    { const hp=me.g.localToWorld(new V3(0,(me.h||1.78)*.78,.3)); SC.noMoney=W.makeLabel('❌ Không đủ tiền – giao dịch thất bại', null, {fs:40, h:.24, x:hp.x, y:hp.y+.25, z:hp.z, bg:'rgba(180,24,40,.94)', color:'#fff', fade:30}); }
    await wait(2.4); if(SC.noMoney){ W.removeLabel(SC.noMoney); SC.noMoney=null; } if(!SC.alive) return;
    faceShot(); await talk('Không sao, trong này Bình Phan lo'); if(!SC.alive) return;
    await talk('Ra ngoài nhớ cho Bình Phan mượn tiền'); if(!SC.alive) return;
    await talk('Trong này chúng ta là we are one cho đến khi gặp bug'); if(!SC.alive) return;
    // 5) hai chiếc điện thoại chạm nhau → chớp sáng + "+2.000"
    shot(mid.clone().addScaledVector(side2,1.25).add(up(1.4)), mid.clone().add(up(1.2)), 2.6); await wait(.9); if(!SC.alive) return;
    const touch=mid.clone().add(up(1.18)); W.burst(touch, [0xffd23f,0xffffff,0x46d39a], 90, 2.6, 1, -1, .14); bp.phone.userData.screen('paid');
    give(); SC.bigLabel=W.makeLabel('+2.000 💰', null, {fs:64, h:.5, x:touch.x, y:touch.y+.35, z:touch.z, bg:'rgba(0,0,0,0)', color:'#ffd23f', fade:30});
    await wait(1.8); if(SC.bigLabel){ W.removeLabel(SC.bigLabel); SC.bigLabel=null; } if(!SC.alive) return;
    G.hold.want=0; await run((()=>{ let t=0; return dt=>{ t+=dt; bp.reach=1-sm(t/.6); return t>=.6; }; })()); if(!SC.alive) return;
    // 6) "Mãi bên nhau" – giơ hai ngón cái như trong ảnh
    faceShot();
    say(bp, 'Mãi bên nhau bạn nhé 🤝', 3.4); bp.flap=1; await run((()=>{ let t=0; return dt=>{ t+=dt; bp.thumbs=Math.min(1,t/.5)*(t<2.6?1:1-sm((t-2.6)/.5)); return t>=3.1; }; })()); bp.thumbs=0; bp.flap=0; if(!SC.alive) return;
    // 7) bước sát lại, vừa nói vừa vỗ vai người chơi 3 cái
    { const b=bp.a.g.position, d=new V3(b.x-P.x,0,b.z-P.z).normalize(), near=new V3(P.x,0,P.z).addScaledVector(d,.72); await walkTo(bp, near.x, near.z, .8); if(!SC.alive) return; await faceTo(bp, P.x, P.z); if(!SC.alive) return; }
    faceShot();
    { const line='Chú thiếu thì cứ nhắn anh, anh mượn người khác giùm cho', sec=2.3+line.length*.045; say(bp, line, sec+.4); bp.talkT=1; bp.flap=1; bp.patT=0;
      await run(dt=>{ bp.patT+=dt; const a=bp.patT-.6; bp.pat=a<0?0:a<.35?sm(a/.35):a<1.85?1:a<2.2?1-sm((a-1.85)/.35):0; return bp.patT>=Math.max(sec,3); });
      bp.pat=0; bp.talkT=0; bp.flap=0; } if(!SC.alive) return;
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
.tuAsk{text-align:center;padding:4px 6px 2px}.tuAskIc{font-size:52px;line-height:1.1}.tuAsk p{font-size:17px;font-weight:600;margin:10px 0 18px}
.tuAskBtns{display:flex;gap:12px;justify-content:center}.tuAskBtns .btn{min-width:120px;justify-content:center;font-size:15px}
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

  return {open:openShop, pack1, pack2, askPack2, get playing(){ return SC.on; }, skip:()=>finish(),
    _preview(){ const o=makeBP(); o.a.g.position.set(P.x+Math.sin(me.g.rotation.y)*2.2, P.y, P.z+Math.cos(me.g.rotation.y)*2.2); o.a.g.rotation.y=me.g.rotation.y+Math.PI; return {o, drop:()=>dropNpc(o)}; }};
}
