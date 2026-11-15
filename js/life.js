// QC World – hệ thống "cuộc sống": ví tiền, quiz QA, cửa hàng, thú cưng, đất/nhà/vườn/nhà hàng/trang trại,
// rác & thùng rác, ghế ngồi, cử chỉ (vẫy, đấm, cổ vũ…), chat, câu cá, thuyền, xe, hồ sơ, túi đồ.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildCity } from './city.js';
import { makeVehicles } from './vehicles.js';
import { makeBots } from './bots.js';
import { makeBrain } from './brain.js';
import { batchStatic, tuneReflections, compactGroup } from './perf.js';
import { buildDowntown } from './downtown.js';
import { makeInterior } from './interior.js';
import { makeScreens } from './screens.js';
import { makePoser } from './pose.js';
import { buildWard } from './ward.js';
import { makeJobs } from './jobs.js';
import { makePeople } from './people.js';
import { makeWork } from './workpc.js';
import { makeResort } from './resort.js';
import { makeShowroom } from './showroom.js';
import { makeCampus } from './campus.js';
import { makeTransit } from './transit.js';
import { makeArena } from './arena.js';
import { makeHighland } from './highland.js';
import { makeSkyFX } from './skyfx.js';
import { makeMulti } from './multi.js';
import { makeCafeLife } from './cafe.js';
import { makeIsland } from './island.js';
import { makeTraffic } from './traffic.js';
import { makeHills } from './hills.js';
import { makeMonument } from './monument.js';
import { makeFoodStreet } from './foodstreet.js';
import { makeLuxury } from './luxury.js';
import { makeRiverside } from './riverside.js';
import { makeMountainTown } from './mountaintown.js';
import { makeStreetLife } from './streetlife.js';
import { makeSeaLife } from './sealife.js';
import { makeFunIsland } from './funisland.js';
import { makeJobCenter } from './jobcenter.js';

export async function initLife(W){
  const {THREE, scene, $, toast, store, mesh, box, MAT, colorMat, clamp, lerp, lerpAngle, rnd, P, me, HOOK, INTER, PLACES, CITY,
         groundH, groundAt, burst, makeLabel, removeLabel, teleport, buildHouse, addPlat, MODELS, clipOf, borrow, SkeletonUtils, PROFILE, circles, boxes, resolve} = W;
  injectCSS();

  /* ============================== LƯU TRỮ ============================== */
  const KEY='qcworld-save';
  const S=Object.assign({coins:300, inv:{}, buffs:{}, lots:{}, pets:[], stats:{answered:0, correct:0, streak:0, best:0, earned:0, trash:0, fish:0, harvest:0},
    mastered:{}, vehicle:null, home:null, carColor:0xb3122e, bikeColor:0x2a6fdb}, store.get(KEY,{}));
  S.stats=Object.assign({answered:0, correct:0, streak:0, best:0, earned:0, trash:0, fish:0, harvest:0}, S.stats);
  const firstBike=!S.inv.bicycle; if(firstBike){ S.inv.bicycle=1; if(!S.vehicle) S.vehicle='bicycle'; }   // người mới được tặng xe đạp
  let saveT=0; const save=()=>{ clearTimeout(saveT); saveT=setTimeout(()=>store.set(KEY,S),150); };
  const fmt=n=>Math.round(n).toLocaleString('vi-VN');
  const DAY=24*3600*1000, now=()=>Date.now();
  const buffOn=id=>(S.buffs[id]||0)>now();
  const has=id=>!!S.inv[id];
  const left=ms=>{ const m=Math.max(0,Math.round(ms/60000)); return m>=60?`${Math.floor(m/60)}g${String(m%60).padStart(2,'0')}`:`${m} phút`; };

  /* ============================== UI chung ============================== */
  const ui={
    modal(title, {wide=false}={}){
      const wrap=document.createElement('div'); wrap.className='modalWrap';
      wrap.innerHTML=`<div class="modal glass lmodal${wide?' wide':''}"><div class="lhead"><h2></h2><span class="lcoins"></span><button class="ico" title="Đóng (Esc)">✕</button></div><div class="lbody"></div></div>`;
      wrap.querySelector('h2').textContent=title; wrap.querySelector('.lcoins').textContent=`💰 ${fmt(S.coins)}`;
      document.body.appendChild(wrap); W.clearKeys();
      const close=()=>{ wrap.remove(); W.canvas.focus(); };
      wrap.querySelector('.ico').onclick=close;
      wrap.addEventListener('pointerdown', e=>{ if(e.target===wrap) close(); });
      wrap.addEventListener('close', ()=>wrap.remove());
      return {wrap, body:wrap.querySelector('.lbody'), close, coins:()=>wrap.querySelector('.lcoins').textContent=`💰 ${fmt(S.coins)}`};
    },
    confirm(title, html, okText, onOk){ const m=ui.modal(title); m.body.innerHTML=`<div style="line-height:1.6">${html}</div><div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn" data-x>Thôi</button><button class="btn pri" data-ok></button></div>`;
      m.body.querySelector('[data-ok]').textContent=okText; m.body.querySelector('[data-x]').onclick=m.close; m.body.querySelector('[data-ok]').onclick=()=>{ m.close(); onOk(); }; return m; },
  };
  W.ui=ui;

  /* ============================== VÍ TIỀN + HUD ============================== */
  const top=$('top');
  const wal=document.createElement('span'); wal.id='wallet'; wal.title='Ví tiền (kiếm bằng cách trả lời quiz QA ở Học viện / kiosk)'; top.insertBefore(wal, $('status'));
  const mkBtn=(k,label,fn)=>{ const b=document.createElement('button'); b.className='btn'; b.innerHTML=`<span class="key">${k}</span> ${label}`; b.onclick=()=>{ fn(); }; top.insertBefore(b, $('status')); return b; };
  mkBtn('I','Túi đồ',()=>openInventory()); mkBtn('P','Hồ sơ',()=>openProfile()); mkBtn('⚙','Đồ hoạ',()=>openQuality());
  function openQuality(){ const m=ui.modal('⚙️ Chất lượng đồ hoạ');
    const cur=W.QUAL_SET, opts=[['auto','🤖 Tự động',`Máy bạn: ${W.GPU||'không rõ'} → đang dùng mức “${({low:'Thấp',medium:'Vừa',high:'Cao'})[W.QUAL]}”`],['low','🐢 Thấp','Mượt nhất cho laptop văn phòng: tắt bloom, ít cỏ, nước nhẹ'],['medium','⚖️ Vừa','Cân bằng: bloom, khử răng cưa 4x, nước nhẹ'],['high','💎 Cao','Đẹp nhất: nước phản chiếu thật, nhiều cỏ (cần card rời)']];
    m.body.innerHTML='<p class="muted">Đổi xong trang sẽ tải lại (tiến trình chơi vẫn giữ nguyên).</p><div class="grid" id="qlt"></div><h4 style="margin:16px 0 6px">🎞️ Nhịp khung hình</h4><div class="grid" id="qfps"></div><h4 style="margin:16px 0 6px">🎬 Hậu kỳ điện ảnh</h4><div class="grid" id="qcine"></div><h4 style="margin:16px 0 6px">🔊 Âm thanh môi trường</h4><div class="grid" id="qsnd"></div>';
    const g=m.body.querySelector('#qlt'), gf=m.body.querySelector('#qfps'), gc=m.body.querySelector('#qcine');
    for(const [k,n,d] of [['1','✨ Bật (khuyên dùng)','Đèn, biển hiệu, cửa sổ ban đêm toả sáng; màu điện ảnh; viền tối nhẹ'],['0','⚪ Tắt','Vẽ thẳng như cũ – dùng khi máy quá yếu']]){
      const c=document.createElement('div'); c.className='card'+((W.CINE?'1':'0')===k?' sel':''); c.style.cursor='pointer'; c.innerHTML=`<b>${n}</b><small>${d}</small>`;
      c.onclick=()=>{ try{ localStorage.setItem('qcworld-cine',k); }catch(e){} store.set(KEY,S); location.reload(); }; gc.appendChild(c); }
    const gs=m.body.querySelector('#qsnd'), au=W.island && W.island.audio;
    if(au) for(const [k,n,d] of [[true,'🔊 Bật','Sóng vỗ, gió, hải âu, tiếng bước chân theo mặt đất'],[false,'🔇 Tắt','Yên lặng (nhạc sân khấu / concert vẫn nghe được)']]){
      const c=document.createElement('div'); c.className='card'+(au.on===k?' sel':''); c.style.cursor='pointer'; c.innerHTML=`<b>${n}</b><small>${d}</small>`;
      c.onclick=()=>{ au.set(k); gs.querySelectorAll('.card').forEach(x=>x.classList.remove('sel')); c.classList.add('sel'); toast(k?'🔊 Đã bật âm thanh môi trường':'🔇 Đã tắt âm thanh môi trường', 1800); }; gs.appendChild(c); }
    for(const [k,n,d] of opts){ const c=document.createElement('div'); c.className='card'+(k===cur?' sel':''); c.style.cursor='pointer'; c.innerHTML=`<b>${n}</b><small>${d}</small>`;
      c.onclick=()=>{ try{ localStorage.setItem('qcworld-quality',k); }catch(e){} store.set(KEY,S); location.reload(); }; g.appendChild(c); }
    for(const [k,n,d] of [['auto','🤖 Tự động','Không giữ nổi 60 FPS thì khoá 30 FPS đều – hết giật khi quay camera'],['30','🎬 Khoá 30 FPS','Luôn đều nhất, nhẹ máy nhất'],['60','⚡ Không khoá','Nhanh nhất có thể (có thể giật nhẹ khi FPS dao động)']]){
      const c=document.createElement('div'); c.className='card'+(k===W.FPSCAP?' sel':''); c.style.cursor='pointer'; c.innerHTML=`<b>${n}</b><small>${d}</small>`;
      c.onclick=()=>{ try{ localStorage.setItem('qcworld-fpscap',k); }catch(e){} store.set(KEY,S); location.reload(); }; gf.appendChild(c); } }
  const buffBar=document.createElement('div'); buffBar.id='buffs'; document.body.appendChild(buffBar);
  function renderWallet(){ wal.textContent=`💰 ${fmt(S.coins)}`; }
  function renderBuffs(){ const out=[]; for(const it of ITEMS) if(it.kind==='day' && buffOn(it.id)) out.push(`<span class="chip">${it.icon} ${left(S.buffs[it.id]-now())}</span>`);
    if(has('shoes')) out.push('<span class="chip">👟</span>'); if(carry) out.push('<span class="chip">🗑️ đang cầm rác – tới thùng rác hoặc G để ném</span>');
    buffBar.innerHTML=out.join(''); }
  const anchorHead=new THREE.Object3D(); anchorHead.position.y=2.15; me.g.add(anchorHead);
  function floatText(text, color='#ffd23f'){ const L=makeLabel(text, null, {fs:44, h:.3, follow:anchorHead, bg:'rgba(0,0,0,0)', color, fade:40}); let t=0;
    const f=(dt)=>{ t+=dt; L.y=.2+t*.7; L.alpha=Math.max(0,1-t/1.6); if(t>1.6){ removeLabel(L); HOOK.onFrame.splice(HOOK.onFrame.indexOf(f),1); } }; HOOK.onFrame.push(f); }
  function addCoins(n, why){ S.coins+=n; if(n>0) S.stats.earned+=n; save(); renderWallet(); floatText(`${n>0?'+':''}${fmt(n)} 💰`); if(why) toast(why, 2600); }
  function spend(n){ if(S.coins<n){ toast(`Không đủ tiền (cần ${fmt(n)} 💰). Ghé 🎓 Học viện QA hoặc kiosk Quiz để kiếm thêm!`, 4000); return false; } S.coins-=n; save(); renderWallet(); floatText(`-${fmt(n)} 💰`, '#ff8a8a'); return true; }
  // hỏi xác nhận trước MỌI khoản chi (mua đồ, xây nhà, sơn, ăn trưa…)
  function askPay(n, what, onOk){ if(S.coins<n){ toast(`Không đủ tiền (cần ${fmt(n)} 💰, bạn có ${fmt(S.coins)}). Làm việc ở 💼 Trung tâm Việc làm hoặc quiz để kiếm thêm!`, 4000); return; }
    ui.confirm('💰 Xác nhận chi tiêu', `${what}<br>Giá: <b class="price">${fmt(n)} 💰</b><br><span class="muted">Số dư: ${fmt(S.coins)} → <b>${fmt(S.coins-n)}</b> 💰</span>`, `Trả ${fmt(n)} 💰`, onOk); }
  W.lifeReward=(k)=>{ if(k==='brain' && !S.brainBonus){ S.brainBonus=1; addCoins(100,'🧠 Lần đầu dùng QA Brain: thưởng 100 💰'); } };
  renderWallet();

  /* ============================== VẬT PHẨM ============================== */
  const ITEMS=[
    {id:'shoes', icon:'👟', name:'Giày chạy bộ', desc:'Đi/chạy nhanh hơn 20%. Vĩnh viễn.', price:600, kind:'perm', tab:'goods'},
    {id:'energy', icon:'⚡', name:'Nước tăng lực', desc:'Nhanh hơn 40% trong 24 giờ.', price:120, kind:'day', tab:'goods'},
    {id:'coffee', icon:'☕', name:'Cà phê sữa đá', desc:'+20% tiền thưởng quiz trong 24 giờ.', price:90, kind:'day', tab:'goods'},
    {id:'rod', icon:'🎣', name:'Cần câu', desc:'Câu cá ở cuối cầu cảng (phía Bắc). Vĩnh viễn.', price:300, kind:'perm', tab:'goods'},
    {id:'bait', icon:'🪱', name:'Mồi câu ×10', desc:'Mỗi lần thả câu tốn 1 mồi.', price:40, kind:'stack', qty:10, tab:'goods'},
    {id:'can', icon:'🚿', name:'Bình tưới', desc:'Tưới bồn hoa của đảo (+5 💰/lần) và vườn nhà bạn. Vĩnh viễn.', price:150, kind:'perm', tab:'goods'},
    {id:'boat', icon:'🚤', name:'Vé thuê thuyền', desc:'Lái thuyền quanh đảo trong 24 giờ. Lên thuyền ở bến (cầu cảng phía Bắc).', price:250, kind:'day', tab:'fun'},
    {id:'vip', icon:'🎫', name:'Vé concert VIP', desc:'Lên sân khấu + bắn pháo hoa ở bàn DJ trong 24 giờ.', price:150, kind:'day', tab:'fun'},
    {id:'seed_rau', icon:'🥬', name:'Hạt rau muống ×5', desc:'Lớn sau 2 phút. Bán 18 💰/bó.', price:30, kind:'stack', qty:5, tab:'seed', crop:{name:'Rau muống', grow:120, sell:18, col:0x43a047, fruit:0x66bb6a}},
    {id:'seed_ca', icon:'🍅', name:'Hạt cà chua ×5', desc:'Lớn sau 6 phút. Bán 45 💰.', price:80, kind:'stack', qty:5, tab:'seed', crop:{name:'Cà chua', grow:360, sell:45, col:0x2e7d32, fruit:0xe53935}},
    {id:'seed_dau', icon:'🍓', name:'Hạt dâu tây ×5', desc:'Lớn sau 15 phút. Bán 110 💰.', price:180, kind:'stack', qty:5, tab:'seed', crop:{name:'Dâu tây', grow:900, sell:110, col:0x388e3c, fruit:0xff1744}},
    {id:'seed_hoa', icon:'🌻', name:'Hạt hướng dương ×5', desc:'Lớn sau 30 phút. Bán 240 💰.', price:350, kind:'stack', qty:5, tab:'seed', crop:{name:'Hướng dương', grow:1800, sell:240, col:0x558b2f, fruit:0xffc107}},
    {id:'pet_shiba', icon:'🐕', name:'Chó Shiba', desc:'Theo bạn khắp đảo, vuốt ve được, chạy theo khi bạn chạy.', price:900, kind:'pet', pet:'shiba', tab:'pet'},
    {id:'pet_cat', icon:'🐈', name:'Mèo mướp', desc:'Mèo cam lười biếng, thích ngồi cạnh bạn.', price:700, kind:'pet', pet:'cat', tab:'pet'},
    {id:'pet_parrot', icon:'🦜', name:'Vẹt', desc:'Bay quanh bạn và nhại lại câu chat.', price:500, kind:'pet', pet:'parrot', tab:'pet'},
    {id:'bike', icon:'🛵', name:'Xe tay ga', desc:'~50 km/h, đi đường nhựa nhanh nhất. Bấm V để lên/xuống xe.', price:2000, kind:'perm', tab:'car'},
    {id:'car', icon:'🚗', name:'Ô tô sedan', desc:'~70 km/h. Bấm V để lên/xuống xe.', price:6000, kind:'perm', tab:'car'},
    {id:'bicycle', icon:'🚲', name:'Xe đạp', desc:'Quà cho người mới. ~23 km/h, đi được mọi địa hình. Bấm V.', price:0, kind:'perm', tab:'gift'},
  ];
  const ITEM=Object.fromEntries(ITEMS.map(i=>[i.id,i]));
  function buy(it, extra){
    if(it.kind==='perm' && has(it.id)){ toast('Bạn đã có món này rồi.'); return false; }
    if(!spend(it.price)) return false;
    if(it.kind==='perm') S.inv[it.id]=1;
    else if(it.kind==='stack') S.inv[it.id]=(S.inv[it.id]||0)+(it.qty||1);
    else if(it.kind==='day') S.buffs[it.id]=Math.max(now(), S.buffs[it.id]||0)+DAY;
    else if(it.kind==='pet'){ const p={type:it.pet, name:extra||defaultPetName(it.pet)}; S.pets.push(p); spawnPet(p, true); }
    if(it.id==='car'||it.id==='bike') S.vehicle=it.id;
    save(); renderBuffs(); burst(new THREE.Vector3(P.x,1.6,P.z), [0xffd23f,0xffffff,0x46d39a], 60, 3, 1, -4, .14);
    toast(`${it.icon} Đã mua ${it.name}!` + (it.id==='car'||it.id==='bike' ? ' Bấm V để lên xe.' : it.kind==='pet' ? ' Bé đang chạy tới bạn.' : ''), 3500);
    return true;
  }
  HOOK.speedMul=()=>(has('shoes')?1.2:1)*(buffOn('energy')?1.4:1);

  function openShop(tabsWanted, title){
    const m=ui.modal(title, {wide:true});
    const TABS={goods:'🧺 Đồ dùng', fun:'🎟️ Giải trí', seed:'🌱 Hạt giống', pet:'🐾 Thú cưng', car:'🚘 Xe'};
    let cur=tabsWanted[0]; const bar=document.createElement('div'); bar.className='tabs'; const grid=document.createElement('div'); grid.className='grid'; m.body.append(bar, grid);
    const render=()=>{ m.coins(); bar.innerHTML=''; if(tabsWanted.length>1) for(const t of tabsWanted){ const b=document.createElement('button'); b.className='btn'+(t===cur?' on':''); b.textContent=TABS[t]; b.onclick=()=>{cur=t; render();}; bar.appendChild(b); }
      grid.innerHTML='';
      for(const it of ITEMS.filter(i=>i.tab===cur)){
        const c=document.createElement('div'); c.className='card';
        let st=''; if(it.kind==='perm' && has(it.id)) st='<span class="tag">Đã có</span>'; else if(it.kind==='day' && buffOn(it.id)) st=`<span class="tag">Còn ${left(S.buffs[it.id]-now())}</span>`; else if(it.kind==='stack' && S.inv[it.id]) st=`<span class="tag">Đang có ${S.inv[it.id]}</span>`;
        else if(it.kind==='pet'){ const n=S.pets.filter(p=>p.type===it.pet).length; if(n) st=`<span class="tag">Đang nuôi ${n}</span>`; }
        c.innerHTML=`<div class="row"><div class="ic">${it.icon}</div><div class="sp"></div>${st}</div><b>${it.name}</b><small>${it.desc}</small><div class="row" style="margin-top:auto"><span class="price">${fmt(it.price)} 💰</span><div class="sp"></div></div>`;
        const b=document.createElement('button'); b.className='btn pri'; b.textContent = it.kind==='day' && buffOn(it.id) ? 'Gia hạn' : it.kind==='perm' && has(it.id) ? 'Đã có' : 'Mua'; b.disabled=it.kind==='perm' && has(it.id);
        if(it.id==='car'||it.id==='bike'){ const sel=document.createElement('select'); sel.className='inp'; sel.style.maxWidth='110px';
          for(const [v,n] of [[0xb3122e,'Đỏ'],[0x111111,'Đen'],[0xf2f2f2,'Trắng'],[0x2a6fdb,'Xanh dương'],[0x9aa3ad,'Bạc'],[0xf2b705,'Vàng']]){ const o=document.createElement('option'); o.value=v; o.textContent=n; sel.appendChild(o); }
          sel.value=String(it.id==='car'?S.carColor:S.bikeColor); sel.onchange=()=>{ if(it.id==='car') S.carColor=+sel.value; else S.bikeColor=+sel.value; save(); toast('Đã chọn màu – áp dụng cho xe của bạn'); V.recolor && V.recolor(it.id, +sel.value); };
          c.querySelector('.row:last-child').insertBefore(sel, c.querySelector('.row:last-child .sp')); }
        b.onclick=()=>{ if(it.kind==='perm' && has(it.id)) return toast('Bạn đã có món này rồi.');
          askPay(it.price, `${it.icon} ${it.kind==='day' && buffOn(it.id) ? 'Gia hạn' : 'Mua'} <b>${it.name}</b>`, ()=>{ if(buy(it)) render(); }); };
        c.querySelector('.row:last-child').appendChild(b); grid.appendChild(c);
      } };
    render();
  }

  /* ============================== QUIZ QA ============================== */
  const FALLBACK={version:0, topics:[{id:'istqb',name:'ISTQB nền tảng',icon:'📘'}], questions:[
    {id:'fb-1',topic:'istqb',level:1,q:'Mục đích chính của kiểm thử là gì?',options:['Chứng minh phần mềm không còn lỗi','Tìm lỗi và giảm rủi ro chất lượng','Thay thế việc review code','Làm chậm tiến độ dự án'],answer:1,explain:'Kiểm thử giúp phát hiện lỗi và giảm rủi ro; không thể chứng minh phần mềm hết lỗi.'},
    {id:'fb-2',topic:'istqb',level:1,q:'"Kiểm thử toàn diện là không thể" thuộc nhóm nào?',options:['7 nguyên tắc kiểm thử','Kỹ thuật hộp trắng','Mức kiểm thử','Loại kiểm thử phi chức năng'],answer:0,explain:'Đây là một trong 7 nguyên tắc kiểm thử của ISTQB.'},
    {id:'fb-3',topic:'istqb',level:2,q:'Trường tuổi hợp lệ 18–60. Bộ giá trị BVA 2 điểm nào đúng?',options:['18, 60','17, 18, 60, 61','0, 18, 60, 100','19, 59'],answer:1,explain:'BVA 2 giá trị lấy biên và giá trị ngay ngoài biên: 17, 18, 60, 61.'},
  ]};
  let QB=null;
  async function loadQB(){ if(QB) return QB; try{ const r=await fetch('data/questions.json',{cache:'no-store'}); if(!r.ok) throw new Error(r.status); QB=await r.json(); if(!QB.questions?.length) throw new Error('rỗng'); }catch(e){ QB=FALLBACK; } return QB; }
  const REWARD={1:20, 2:35, 3:55};
  async function openQuiz(){
    const qb=await loadQB(); const m=ui.modal('🎓 Học viện QA · Vừa học vừa kiếm tiền', {wide:true});
    const counts={}; for(const q of qb.questions){ (counts[q.topic] ||= {n:0, m:0}).n++; if(S.mastered[q.id]) counts[q.topic].m++; }
    const pick=()=>{ m.body.innerHTML=`<p class="muted">Chọn chủ đề. Trả lời <b>đúng</b> được tiền (Cơ bản 20 · Trung bình 35 · Nâng cao 55 💰, chuỗi đúng liên tiếp có thưởng thêm), <b>sai không mất gì</b> và được giải thích. Câu đã thuộc chỉ còn 5 💰.</p>
        <div class="row" style="gap:16px;margin:6px 0 12px"><span>📊 Đã trả lời <b>${S.stats.answered}</b></span><span>✅ Đúng <b>${S.stats.correct}</b></span><span>🔥 Chuỗi tốt nhất <b>${S.stats.best}</b></span>${buffOn('coffee')?'<span class="tag">☕ +20% thưởng</span>':''}</div><div class="grid" id="qTopics"></div>`;
      const g=m.body.querySelector('#qTopics');
      const all={id:'*', name:'Trộn tất cả', icon:'🎲'};
      for(const t of [all, ...qb.topics]){ const c=t.id==='*' ? {n:qb.questions.length, m:Object.keys(S.mastered).length} : (counts[t.id]||{n:0,m:0}); if(!c.n) continue;
        const d=document.createElement('div'); d.className='card'; d.style.cursor='pointer';
        d.innerHTML=`<div class="ic">${t.icon||'❓'}</div><b>${t.name}</b><small>${c.n} câu · đã thuộc ${c.m}</small><div class="bar2"><i style="width:${Math.round(c.m/c.n*100)}%"></i></div>`;
        d.onclick=()=>ask(t.id); g.appendChild(d); } };
    const ask=(topic)=>{
      const pool=qb.questions.filter(q=>topic==='*'||q.topic===topic); const fresh=pool.filter(q=>!S.mastered[q.id]);
      const src=fresh.length && Math.random()<.85 ? fresh : pool; const q=src[Math.floor(Math.random()*src.length)];
      const tp=qb.topics.find(t=>t.id===q.topic)||{name:q.topic, icon:'❓'};
      let base=S.mastered[q.id]?5:(REWARD[q.level]||20);
      m.body.innerHTML=`<div class="row"><span class="tag">${tp.icon||''} ${tp.name}</span><span class="tag warn">${'★'.repeat(q.level||1)}${'☆'.repeat(3-(q.level||1))}</span><div class="sp"></div><span class="muted">🔥 Chuỗi ${S.stats.streak} · Thưởng tới ${base} 💰</span></div>
        <h3 style="line-height:1.5;margin:14px 0"></h3><div id="qOpts"></div><div id="qRes"></div>
        <div class="row" style="margin-top:12px"><button class="btn" id="qBack">← Đổi chủ đề</button><div class="sp"></div><button class="btn pri" id="qNext" hidden>Câu tiếp →</button></div>`;
      m.body.querySelector('h3').textContent=q.q;
      const box=m.body.querySelector('#qOpts'); let done=false;
      q.options.forEach((o,i)=>{ const b=document.createElement('button'); b.className='qopt'; b.textContent=`${'ABCD'[i]}. ${o}`; box.appendChild(b);
        b.onclick=()=>{ if(done) return; done=true; S.stats.answered++;
          const ok=i===q.answer; box.children[q.answer].classList.add('ok'); if(!ok) b.classList.add('bad');
          let msg='';
          if(ok){ S.stats.correct++; S.stats.streak++; S.stats.best=Math.max(S.stats.best,S.stats.streak);
            let rw=base + (base>5 ? 5*Math.min(5,Math.floor(S.stats.streak/3)) : 0); if(buffOn('coffee')) rw=Math.round(rw*1.2);
            S.mastered[q.id]=1; addCoins(rw); msg=`<b style="color:#46d39a">✅ Chính xác! +${rw} 💰</b>`; m.coins();
            if(S.stats.streak%5===0) burst(new THREE.Vector3(P.x,2,P.z), [0xffd23f,0x46d39a,0x4fc3ff], 90, 4, 1.4, -5, .16);
          } else { S.stats.streak=0; msg=`<b style="color:#ff8a8a">❌ Chưa đúng – không sao, không mất tiền.</b> Đáp án: <b>${'ABCD'[q.answer]}</b>`; }
          save();
          const r=m.body.querySelector('#qRes'); r.innerHTML=`<div class="qexp">${msg}<div style="margin-top:6px"></div></div>`; r.querySelector('.qexp div').textContent='💡 '+(q.explain||'');
          m.body.querySelector('#qNext').hidden=false; m.body.querySelector('#qNext').focus(); }; });
      m.body.querySelector('#qNext').onclick=()=>ask(topic); m.body.querySelector('#qBack').onclick=pick;
    };
    pick();
  }

  /* ============================== THÀNH PHỐ ============================== */
  const city=buildCity(W);
  await W.yieldUI('Đang dựng Downtown…');
  const V=makeVehicles(W, S, save);
  try{ W.people=makePeople(W); }catch(e){ console.warn('people', e); W.people=null; }   // người đa dạng (khung Xbot)
  const interior=makeInterior(W);
  const downtown=buildDowntown(W, interior);
  await W.yieldUI('Đang lắp màn hình Dashboard…');
  const screens=makeScreens(W, ui);
  const brain=makeBrain(W, ui);
  V.pier=city.pier; V.boatPark=city.spots.boatPark;
  { const b=V.garage.boat || (V.mount && null); }
  // thuyền đậu sẵn ở bến
  { const o=V.buildBoat(); o.userData.dynamic=true; o.position.set(city.spots.boatPark.x, W.WATER_Y, city.spots.boatPark.z); o.rotation.y=city.spots.boatPark.h; scene.add(o); V.garage.boat=o; W.floaters.push({o, ph:2}); }
  // xe trưng bày ở showroom
  { const s=city.showroom, rx=Math.cos(s.place.rot), rz=-Math.sin(s.place.rot);
    const car=V.buildCar(0xf2f2f2), bike=V.buildBike(0xb3122e);
    for(const [o,off] of [[car,3.6],[bike,-3.4]]){ const x=s.tx+rx*off-s.f[0]*.5, z=s.tz+rz*off-s.f[1]*.5;
      mesh(new THREE.CylinderGeometry(off>0?2.6:1.3,off>0?2.7:1.4,.2,40), MAT.stone, x,.1,z); o.position.set(x,.2,z); o.rotation.y=s.place.rot+Math.PI*.75; scene.add(o); circles.push({x,z,r:off>0?2.4:1.1}); } }

  // tương tác các toà nhà
  INTER.push({x:city.academy.tx, z:city.academy.tz, r:1.5, label:'🎓 Vào Học viện QA – phòng thi trắc nghiệm (E)', action:()=>W.campus ? W.campus.enter('academy') : openQuiz()});
  for(const k of city.kiosks) INTER.push({x:k.x, z:k.z, r:1.3, label:'🎓 Kiosk Quiz QA (kiếm tiền)', action:openQuiz});
  INTER.push({x:city.shop.tx, z:city.shop.tz, r:1.5, label:'🛒 Vào Chợ QC', action:()=>openShop(['goods','fun','seed','pet'],'🛒 Chợ QC')});
  // S2.4: showroom lớn bước vào được (cảnh riêng) – tư vấn viên, 11 ô tô 5 mẫu + xe tay ga
  { const so=city.showroom; W.showroom=makeShowroom(W, {S, save, ui, askPay, fmt, spend, V, exitAt:()=>({x:so.tx+so.f[0]*1.6, z:so.tz+so.f[1]*1.6, face:Math.atan2(so.f[0],so.f[1])})}); }
  INTER.push({x:city.showroom.tx, z:city.showroom.tz, r:1.6, label:'🚗 Vào QC Auto Showroom – ô tô & xe máy (E)', action:()=>W.showroom ? W.showroom.enter() : openShop(['car'],'🏍️ Showroom xe')});
  INTER.push({x:city.landOffice.tx, z:city.landOffice.tz, r:1.5, label:'📜 Văn phòng địa chính (mua đất)', action:()=>openLandOffice()});
  INTER.push({x:city.boathouse.tx, z:city.boathouse.tz, r:1.5, label:'⚓ Nhà thuyền: thuê thuyền, mua mồi', action:()=>openShop(['fun','goods'],'⚓ Nhà thuyền')});
  INTER.push({x:city.spots.brain.x, z:city.spots.brain.z, r:1.8, label:'🧠 Vào QA Brain (phân tích tài liệu, sinh test case)', action:()=>brain.open()});

  /* ============================== RÁC + THÙNG RÁC ============================== */
  const trash=[]; let carry=null; const bins=[];
  const TRASH_KINDS=[
    ()=>{ const m=mesh(new THREE.IcosahedronGeometry(.09,0), colorMat(0xe8e4da,{roughness:1})); m.scale.set(1,.8,1.1); return m; },
    ()=>{ const g=new THREE.Group(); const c=mesh(new THREE.CylinderGeometry(.035,.035,.12,10), colorMat(0xd32f2f,{metalness:.6,roughness:.3}),0,0,0,g); c.rotation.z=Math.PI/2; return g; },
    ()=>{ const g=new THREE.Group(); const c=mesh(new THREE.CylinderGeometry(.035,.035,.22,10), new THREE.MeshPhysicalMaterial({color:0x7fc8a9, roughness:.1, transparent:true, opacity:.7}),0,0,0,g); c.rotation.z=Math.PI/2; return g; },
    ()=>{ const m=mesh(box(.16,.02,.12), colorMat(0xffffff,{roughness:.9})); return m; },
  ];
  function spawnTrash(at){ const p=at||city.trashArea(Math.random); if(!p) return;
    const o=TRASH_KINDS[Math.floor(Math.random()*TRASH_KINDS.length)](); o.userData.dynamic=true; o.position.set(p.x, groundAt(p.x,p.z)+.05, p.z); o.rotation.y=Math.random()*6; scene.add(o);
    const t={x:p.x, z:p.z, o, claim:null}; trash.push(t);
    t.inter={x:p.x, z:p.z, r:1.1, when:()=>!carry && trash.includes(t), label:'🗑️ Nhặt rác', action:()=>pickTrash(t)}; INTER.push(t.inter); return t; }
  function removeTrash(t){ const i=trash.indexOf(t); if(i<0) return; trash.splice(i,1); scene.remove(t.o); const j=INTER.indexOf(t.inter); if(j>=0) INTER.splice(j,1); }
  let handR=null; me.g.traverse(o=>{ if(o.isBone && !handR && /RightHand$/.test(o.name)) handR=o; });
  function pickTrash(t){ removeTrash(t); carry=TRASH_KINDS[Math.floor(Math.random()*TRASH_KINDS.length)](); carry.userData.dynamic=true;
    if(handR){ const ws=new THREE.Vector3(); handR.getWorldScale(ws); carry.scale.multiplyScalar(1/ws.x); carry.position.set(0, .08/ws.x, 0); handR.add(carry); } else { me.g.add(carry); carry.position.set(.3,1,.2); }
    toast('Đã nhặt rác. Mang tới ♻️ thùng rác (E) hoặc bấm G để ném vào thùng!', 3500); renderBuffs(); }
  function dropCarry(){ if(!carry) return; carry.parent && carry.parent.remove(carry); carry=null; renderBuffs(); }
  function binAt(x,z){ const g=new THREE.Group(); g.position.set(x, groundH(x,z), z); scene.add(g);
    mesh(new THREE.CylinderGeometry(.32,.28,.85,16), colorMat(0x2e7d32,{metalness:.3,roughness:.5}), 0,.43,0, g);
    mesh(new THREE.CylinderGeometry(.35,.35,.07,16), colorMat(0x1b5e20,{metalness:.3,roughness:.5}), 0,.89,0, g);
    mesh(new THREE.CylinderGeometry(.33,.33,.12,16,1,true), colorMat(0xffffff), 0,.6,0, g);
    circles.push({x, z, r:.35}); const b={x, z}; bins.push(b);
    INTER.push({x, z, r:1.3, when:()=>!!carry, label:'♻️ Bỏ rác vào thùng (+6 💰)', action:()=>{ dropCarry(); S.stats.trash++; addCoins(6); if(S.stats.trash%10===0) toast(`🌿 Bạn đã dọn ${S.stats.trash} món rác. Đảo cảm ơn bạn!`); }}); }
  for(const a of [.55,2.1,3.7,5.3]) binAt(Math.cos(a)*8.6, Math.sin(a)*8.6);
  for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+.2; binAt(Math.cos(a)*(CITY.road.r+CITY.road.w/2+2), Math.sin(a)*(CITY.road.r+CITY.road.w/2+2)); }
  binAt(2.2,-63); binAt(city.spots.brain.x+4, city.spots.brain.z+1);
  for(let i=0;i<9;i++) spawnTrash();
  // ném rác (G): bay theo đường cong; rơi gần thùng thì tính là ném trúng
  const thrown=[];
  HOOK.keys.KeyG=()=>{ if(!carry){ toast('Bạn không cầm gì để ném. Nhặt rác trước (E).'); return; } const wp=new THREE.Vector3(); carry.getWorldPosition(wp); dropCarry();
    const o=TRASH_KINDS[0](); o.userData.dynamic=true; o.position.copy(wp); scene.add(o); const f=[Math.sin(P.face), Math.cos(P.face)];
    thrown.push({o, vx:f[0]*6, vy:4.2, vz:f[1]*6}); emote('throw'); };
  function updateThrown(dt){ for(let i=thrown.length-1;i>=0;i--){ const t=thrown[i]; t.vy-=12*dt; t.o.position.x+=t.vx*dt; t.o.position.y+=t.vy*dt; t.o.position.z+=t.vz*dt; t.o.rotation.x+=dt*8;
      const gx=t.o.position.x, gz=t.o.position.z; const bin=bins.find(b=>Math.hypot(b.x-gx,b.z-gz)<.55);
      if(bin && t.o.position.y<1.1 && t.o.position.y>.6){ scene.remove(t.o); thrown.splice(i,1); S.stats.trash++; addCoins(12,'🏀 Ném trúng thùng rác! +12 💰'); burst(new THREE.Vector3(bin.x,1,bin.z),[0x46d39a,0xffffff],40,2.5,.8,-4,.12); continue; }
      if(t.o.position.y<=groundAt(gx,gz)+.05){ scene.remove(t.o); thrown.splice(i,1); spawnTrash({x:gx, z:gz}); toast('Trượt rồi 😅 Nhặt lại và thử lần nữa!'); } } }
  let trashT=0;

  /* ============================== BỒN HOA (tưới) ============================== */
  function waterBed(bed){ bed.water=1; bed.growth=Math.min(1, bed.growth+.15); }
  for(const bed of city.beds){ bed.plants.userData.dynamic=true; try{ compactGroup(W, bed.plants); }catch(e){ console.warn('compact bed', e); }
    INTER.push({x:bed.x, z:bed.z, r:2, get label(){ return has('can') ? (bed.water<.7?'🚿 Tưới bồn hoa (+5 💰)':'🌸 Bồn hoa đang tươi tốt') : '🌸 Bồn hoa (mua 🚿 Bình tưới ở Chợ QC để tưới)'; },
      action:()=>{ if(!has('can')) return toast('Cần 🚿 Bình tưới (Chợ QC).'); if(bed.water>=.7) return toast('Bồn này vừa được tưới rồi 🌸');
        waterBed(bed); emote('water'); addCoins(5); for(let i=0;i<5;i++) setTimeout(()=>burst(new THREE.Vector3(bed.x+(Math.random()-.5)*1.4,.9,bed.z),[0x8fd3ff,0xffffff],10,1,.6,-8,.08), i*120); }}); }
  function updateBeds(dt){ for(const b of city.beds){ b.water=Math.max(0, b.water-dt/240); if(b.water>.3) b.growth=Math.min(1, b.growth+dt/400); else b.growth=Math.max(.25, b.growth-dt/900);
      const s=.45+b.growth*.75, droop=b.water<.25?.7:1; b.plants.scale.set(1, s*droop, 1); } }

  /* ============================== GHẾ NGỒI + CỬ CHỈ ============================== */
  const bones={}; me.g.traverse(o=>{ if(o.isBone){ bones[o.name.replace(/^mixamorig:?/,'')]=o; } });
  const hips=bones.Hips; let hipsH=1; { me.g.updateMatrixWorld(true); if(hips){ const v=new THREE.Vector3(); hips.getWorldPosition(v); hipsH=v.y-me.g.position.y; } }
  const _a=new THREE.Vector3(), _b=new THREE.Vector3(), _q=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _I=new THREE.Quaternion(), _d=new THREE.Vector3();
  function aim(name, childName, dir, w=1){ const b=bones[name], c=bones[childName]; if(!b||!c||w<=0) return;
    b.getWorldPosition(_a); c.getWorldPosition(_b); _b.sub(_a).normalize(); _d.copy(dir).normalize();
    _q.setFromUnitVectors(_b, _d); if(w<1) _q.slerpQuaternions(_I, _q, w);
    b.getWorldQuaternion(_wq); b.parent.getWorldQuaternion(_pq); _wq.premultiply(_q); b.quaternion.copy(_pq.invert().multiply(_wq)); b.updateMatrixWorld(true); }
  const U=new THREE.Vector3(0,1,0);
  const _ia=new THREE.Vector3(), _ib=new THREE.Vector3(), _ic=new THREE.Vector3(), _it=new THREE.Vector3(), _ip=new THREE.Vector3(), _ik=new THREE.Vector3();
  // IK 2 khớp: đưa đầu chi (n3) tới điểm target, khớp giữa (n2) gập về hướng bend
  function ik2(n1,n2,n3,target,bend){ const A=bones[n1], B=bones[n2], C=bones[n3]; if(!A||!B||!C) return;
    A.getWorldPosition(_ia); B.getWorldPosition(_ib); C.getWorldPosition(_ic);
    const la=_ia.distanceTo(_ib), lb=_ib.distanceTo(_ic); _it.copy(target).sub(_ia); let d=_it.length(); if(d<1e-4) return; _it.multiplyScalar(1/d); d=Math.min(d,(la+lb)*.995);
    const x=(la*la-lb*lb+d*d)/(2*d), h=Math.sqrt(Math.max(0,la*la-x*x));
    _ip.copy(bend).addScaledVector(_it,-bend.dot(_it)); if(_ip.lengthSq()<1e-6) _ip.set(0,1,0); _ip.normalize();
    _ik.copy(_ia).addScaledVector(_it,x).addScaledVector(_ip,h);
    aim(n1,n2,_ik.clone().sub(_ia)); B.getWorldPosition(_ib); aim(n2,n3,target.clone().sub(_ib)); }
  const _fq=new THREE.Vector3();
  function frame(){ _fq.set(0,0,1).applyQuaternion(me.g.quaternion); _fq.y=0; if(_fq.lengthSq()<1e-6) _fq.set(0,0,1); _fq.normalize(); return {F:new THREE.Vector3(_fq.x,0,_fq.z), R:new THREE.Vector3(-_fq.z,0,_fq.x)}; }
  const POSES={
    sit(F,R){ for(const s of ['Left','Right']){ aim(s+'UpLeg', s+'Leg', F.clone().addScaledVector(U,-.12)); aim(s+'Leg', s+'Foot', F.clone().multiplyScalar(.15).addScaledVector(U,-1)); }
      for(const [s,k] of [['Left',-1],['Right',1]]){ aim(s+'Arm', s+'ForeArm', U.clone().multiplyScalar(-1).addScaledVector(F,.45).addScaledVector(R,k*.1)); aim(s+'ForeArm', s+'Hand', F.clone().addScaledVector(U,-.35)); } },
    // lái xe: IK 2 khớp – bàn chân bám bàn đạp/sàn xe, bàn tay bám tay lái (điểm lấy từ chính model xe)
    ride(F,R){ const r=V.riding(); if(!r) return; const o=r.obj, ud=o.userData; o.updateMatrixWorld(true);
      for(const [s,k] of [['Left',-1],['Right',1]]){
        let foot; if(ud.crank){ foot=new THREE.Vector3(-k*.13, -k*.16, 0); ud.crank.localToWorld(foot); foot.y+=.05; } else foot=o.localToWorld(new THREE.Vector3(-k*.17,.5,.1));
        const grip=o.localToWorld(ud.type==='bicycle' ? new THREE.Vector3(-k*.24,1.0,.34) : new THREE.Vector3(-k*.3,1.25,.5));
        ik2(s+'UpLeg', s+'Leg', s+'Foot', foot, F.clone().addScaledVector(U,.25));
        ik2(s+'Arm', s+'ForeArm', s+'Hand', grip, U.clone().multiplyScalar(-.7).addScaledVector(R,k*.5).addScaledVector(F,-.3)); } },
    wave(F,R,t){ aim('RightArm','RightForeArm', U.clone().multiplyScalar(.9).addScaledVector(R,.5)); aim('RightForeArm','RightHand', U.clone().addScaledVector(R, Math.sin(t*11)*.65)); },
    cheer(F,R,t){ const b=Math.abs(Math.sin(t*6))*.25; for(const [s,k] of [['Left',-1],['Right',1]]){ aim(s+'Arm', s+'ForeArm', U.clone().addScaledVector(R,k*(.35+b))); aim(s+'ForeArm', s+'Hand', U.clone().addScaledVector(R,k*.15)); } },
    punch(F,R,t,d){ const e=Math.sin(Math.min(1,t/d)*Math.PI); aim('RightArm','RightForeArm', F.clone().addScaledVector(U,.12).addScaledVector(R,-.1), e); aim('RightForeArm','RightHand', F.clone().addScaledVector(U,.1), e);
      aim('LeftArm','LeftForeArm', F.clone().multiplyScalar(.5).addScaledVector(U,-.6), .8); aim('LeftForeArm','LeftHand', U.clone().multiplyScalar(.7).addScaledVector(F,.6), .8); },
    throw(F,R,t,d){ const e=Math.sin(Math.min(1,t/d)*Math.PI); aim('RightArm','RightForeArm', F.clone().addScaledVector(U,.7), e); aim('RightForeArm','RightHand', F.clone().addScaledVector(U,.5), e); },
    water(F,R,t,d){ const e=Math.sin(Math.min(1,t/d)*Math.PI); aim('RightArm','RightForeArm', F.clone().addScaledVector(U,-.2).addScaledVector(R,.2), e); aim('RightForeArm','RightHand', F.clone().addScaledVector(U,-.6), e); },
    fish(F,R){ aim('RightArm','RightForeArm', F.clone().addScaledVector(U,-.3).addScaledVector(R,.15)); aim('RightForeArm','RightHand', F.clone().addScaledVector(U,.4)); aim('LeftArm','LeftForeArm', F.clone().addScaledVector(U,-.5).addScaledVector(R,-.1)); aim('LeftForeArm','LeftHand', F.clone().addScaledVector(R,.4)); },
  };
  let pose=null;   // {kind, t, dur}
  function emote(kind, dur){ pose={kind, t:0, dur:dur||({wave:2.4, cheer:2.2, punch:.38, throw:.45, water:1.6}[kind]||2)}; if(kind==='punch') onPunch(); }
  W.applyPose=(k)=>{ const {F,R}=frame(); me.g.updateMatrixWorld(true); POSES[k](F,R,W.T,1); };
  // cử chỉ mượn animation Mixamo (gật đầu / lắc đầu)
  // cử chỉ: nhân vật có animation gốc (Robot/Xbot) thì phát clip gốc; không có thì dùng tư thế thủ tục
  const mePoser=makePoser(THREE, me); let procT=0;
  function playOnce(k){ const a=me.acts[k]; if(!a) return false; HOOK.emoteClip=true; me.play(k,.2); a.reset().play();
    setTimeout(()=>{ HOOK.emoteClip=false; if(me.cur===k) me.play('idle',.3); }, a.getClip().duration*1000-150); return true; }
  let proc=null; const procEmote=(kind,dur)=>{ proc={kind, t:0, dur}; };
  /* ---------- CHỖ NGỒI: ghế đá, bàn picnic, ghế/sofa/ghế đẩu trong toà nhà ----------
     seat = {x,z: chỗ đặt mông · rot: hướng mặt khi ngồi · y: độ cao mặt ghế (tuyệt đối) · floor: độ cao sàn · back: lại gần từ phía sau (bàn picnic) · scope} */
  let sitting=null; const seats=[], _hp=new THREE.Vector3();
  // S-GFX (15/11): GHẾ NHIỀU CHỖ – các chỗ ngồi kề nhau (cùng hướng, cùng độ cao, cách ≤ 1,5 m) tự gộp thành 1 BĂNG GHẾ: 1 nút E chung,
  // tự xếp vào chỗ trống gần nhất, nhãn "còn x/y chỗ", hết chỗ thì báo (trước: mỗi chỗ 1 nút riêng, có người ngồi thì nút biến mất, không báo gì).
  // W.addBench({x,z,rot,len,y,floor,label,…}) chia chỗ theo chiều dài ghế (~0,6 m/người, ghế 1,6–2 m → 3 người).
  const benches=[], dA=(a,b)=>{ let d=(a-b)%(Math.PI*2); if(d>Math.PI) d-=Math.PI*2; if(d<-Math.PI) d+=Math.PI*2; return d; };
  function benchInter(g){ const f=[Math.sin(g.rot), Math.cos(g.rot)], k=g.back?-.5:.55; let cx=0, cz=0, ext=0; for(const o of g.seats){ cx+=o.x; cz+=o.z; } cx/=g.seats.length; cz/=g.seats.length;
    for(const o of g.seats) ext=Math.max(ext, Math.hypot(o.x-cx, o.z-cz)); g.inter.x=cx+f[0]*k; g.inter.z=cz+f[1]*k; g.inter.r=Math.max(g.r0, ext+1.1); }
  function addSeat(s){ s.taken=s.taken||null; s.scope=s.scope||'world'; seats.push(s);
    let g=(s.lie||s.solo) ? null : benches.find(b=>b.scope===s.scope && !b.lie && !!b.back===!!s.back && Math.abs(dA(b.rot,s.rot))<.06 && Math.abs(b.y-s.y)<.06 && b.seats.some(o=>Math.hypot(o.x-s.x,o.z-s.z)<1.5));
    if(g){ g.seats.push(s); s.group=g; s.inter=g.inter; benchInter(g); return s; }
    g={seats:[s], rot:s.rot, y:s.y, scope:s.scope, back:s.back, lie:s.lie, r0:s.r||1.35, label:s.label||'🪑 Ngồi xuống (E · hoặc phím C)'}; s.group=g; benches.push(g);
    g.inter={x:s.x, z:s.z, r:g.r0, prio:.7, when:()=>!sitting && !V.riding() && g.seats.some(o=>o.floor===undefined || Math.abs(P.y-o.floor)<1.2),   // S-QA: cùng tầng mới ngồi được (trước bấm từ tầng trên/dưới rồi rớt xuyên tầng)
      get label(){ const n=g.seats.length, fr=g.seats.filter(o=>!o.taken).length; return fr ? (n>1 ? `${g.label} · còn ${fr}/${n} chỗ` : g.label) : (n>1 ? `🪑 Ghế đã kín chỗ (${n}/${n})` : '🪑 Ghế đã có người ngồi'); },
      action:()=>sitGroup(g)};
    benchInter(g); s.inter=g.inter; INTER.push(g.inter); return s; }
  function sitGroup(g){ const fr=g.seats.filter(o=>!o.taken); if(!fr.length) return toast(g.seats.length>1 ? '🪑 Ghế này đã kín chỗ – tìm ghế khác nhé!' : '🪑 Ghế này đã có người ngồi – tìm ghế khác nhé!', 2600);
    fr.sort((a,b)=>Math.hypot(P.x-a.x,P.z-a.z)-Math.hypot(P.x-b.x,P.z-b.z)); sitOn(fr[0]); }
  function addBench(o){ const L=o.len||1.6, n=Math.max(1, Math.round(L/.6)), sp=L/n, r=[Math.cos(o.rot), -Math.sin(o.rot)], out=[];
    for(let i=0;i<n;i++){ const t=(i-(n-1)/2)*sp; out.push(addSeat({...o, x:o.x+r[0]*t, z:o.z+r[1]*t})); } return out; }
  function dropSeats(test){ for(let i=seats.length-1;i>=0;i--){ const s=seats[i]; if(!test(s)) continue; if(s===sitting?.seat) standUp(); const g=s.group;
      if(g){ g.seats.splice(g.seats.indexOf(s),1); if(!g.seats.length){ const j=INTER.indexOf(g.inter); if(j>=0) INTER.splice(j,1); benches.splice(benches.indexOf(g),1); } else benchInter(g); }
      else { const j=INTER.indexOf(s.inter); if(j>=0) INTER.splice(j,1); }
      seats.splice(i,1); } }
  const sitCtrl={ drive(dt, inp){ if(inp.ix||inp.iz){ standUp(); return; } const st=sitting; P.x=st.x; P.z=st.z; P.face=st.face;
      if(st.seat.lie){ const f=[Math.sin(st.face), Math.cos(st.face)], L=(me.h||1.75)*.53;   // nằm (võng, ghế tắm nắng): ngửa mặt, chân hướng về phía trước
        me.g.position.set(st.x+f[0]*L, st.y+.1, st.z+f[1]*L); me.g.rotation.set(-Math.PI/2+.08, st.face, 0, 'YXZ'); me.play('idle'); return; }
      me.g.position.set(st.x, st.y+.04-(st.off??hipsH), st.z); me.g.rotation.set(0, st.face, 0); me.play(me.acts.sit?'sit':'idle'); } };
  function sitOn(s){ if(sitting || V.riding()) return; sitting={x:s.x, z:s.z, face:s.rot, y:s.y, seat:s, off:null}; s.taken='me';
    HOOK.vehicle=sitCtrl; HOOK.vehicleInter=()=>({label:'🧍 Đứng dậy (E / C / phím di chuyển)', action:standUp}); if(s.onSit) try{ s.onSit(); }catch(e){} toast(s.lie?'Đang nằm thư giãn 🌴 – bấm E, C hoặc phím di chuyển để dậy':'Đang ngồi nghỉ 🪑 – bấm E, C hoặc phím di chuyển để đứng dậy', 2500); }
  function standUp(){ if(!sitting) return; const st=sitting, s=st.seat; s.taken=null; const f=[Math.sin(st.face), Math.cos(st.face)], k=s.back?-.75:.75;
    P.x=st.x+f[0]*k; P.z=st.z+f[1]*k; sitting=null; HOOK.vehicle=null; HOOK.vehicleInter=null; if(s.scope==='world') resolve(P); P.y=s.floor ?? groundAt(P.x,P.z); P.vx=P.vz=0; }
  // độ cao hông thực tế lúc ngồi (Robot có clip "Sitting" riêng) → đặt mông đúng mặt ghế
  HOOK.onFrame.push(()=>{ if(sitting && hips && !sitting.seat.lie){ hips.getWorldPosition(_hp); sitting.off=_hp.y-me.g.position.y; } });
  function nearestSeat(maxD=3.2){ let best=null, bd=maxD; const scope=W.inside?'interior':'world';
    for(const s of seats){ if(s.taken || s.scope!==scope || (s.floor!==undefined && Math.abs(P.y-s.floor)>1.2)) continue; const d=Math.hypot(P.x-s.x, P.z-s.z); if(d<bd){ bd=d; best=s; } } return best; }
  HOOK.keys.KeyC=()=>{ if(sitting) return standUp(); if(V.riding()) return; const s=nearestSeat(); if(s) sitOn(s); else toast('Không có ghế trống ở gần – lại gần ghế đá, bàn picnic hoặc ghế trong toà nhà rồi bấm C.', 2600); };
  // ghế đá: 2 chỗ mỗi ghế
  for(const b of city.benches){ const f=[Math.sin(b.rot), Math.cos(b.rot)], rx=Math.cos(b.rot), rz=-Math.sin(b.rot), cx=b.x-f[0]*.9, cz=b.z-f[1]*.9, gy=groundH(cx,cz);
    addBench({x:cx+f[0]*.1, z:cz+f[1]*.1, rot:b.rot, len:1.5, y:gy+.49, floor:gy, label:'🪑 Ngồi ghế đá (E · C)'}); }   // S-GFX: ghế 1,6 m → 3 chỗ
  // bàn picnic: 4 chỗ (2 băng ghế), lại gần từ phía ngoài
  function picnicSeats(o, tag){ o.updateMatrixWorld(true); const q=new THREE.Quaternion(); o.getWorldQuaternion(q); const fw=new THREE.Vector3(0,0,1).applyQuaternion(q), base=Math.atan2(fw.x, fw.z), ws=new THREE.Vector3(); o.getWorldScale(ws);
    for(const lx of [-.9,.9]) for(const lz of [-.72,.72]){ const p=o.localToWorld(new THREE.Vector3(lx,0,lz)), gy=groundH(p.x,p.z);
      addSeat({x:p.x, z:p.z, rot:base+(lx>0?-Math.PI/2:Math.PI/2), y:gy+.46*ws.y, floor:gy, back:true, tag, label:'🪑 Ngồi bàn picnic (E · C)'}); } }
  for(const t of (W.PICNICS||[])) picnicSeats(t, 'picnic');
  W.addSeat=addSeat; W.addBench=addBench; W.dropSeats=dropSeats; W.seats=seats;

  /* ============================== SPRINT 2: PHƯỜNG KHỞI NGHIỆP + VIỆC LÀM ============================== */
  const ward=buildWard(W);
  const jobs=makeJobs(W, {S, save, ui, addCoins, fmt, spots:ward.spots, towers:downtown.towers, city}); W.jobs=jobs;
  W.work=makeWork(W, {S, save, ui, addCoins, fmt, jobs, towers:downtown.towers, interior});   // phỏng vấn · thẻ nhân viên · đi làm
  INTER.push({x:ward.spots.jobCenter.x, z:ward.spots.jobCenter.z, r:2.6, prio:.3, label:'🧑‍💼 Xem bảng việc làm (E)', action:()=>jobs.open()});
  // nhà trọ: phòng 1 cấp miễn phí cho người mới, phòng 2–4 có người thuê
  ward.spots.tro.rooms.forEach((rm,i)=>INTER.push({x:rm.x, z:rm.z, r:1.6, label: i? `🚪 Phòng ${i+1} – đã có người thuê` : '🛏️ Phòng trọ của bạn (miễn phí) – vào nghỉ',
    action:()=>{ if(i) return toast('🚪 Phòng này đã có người thuê. Phòng 1 là của bạn!'); openTro(); }}));
  function openTro(){ const m=ui.modal('🛏️ Phòng trọ khởi nghiệp · Phòng 1');
    m.body.innerHTML=`<p class="muted">Phòng nhỏ nhưng miễn phí 😄 – chỗ nghỉ chân cho người mới vào thế giới mở. Có tiền thì mua đất xây nhà ở 📜 Văn phòng địa chính (ngay cạnh).</p>
      <div class="grid"><div class="card"><div class="ic">😴</div><b>Ngủ một giấc</b><small>Chuyển sang buổi sáng.</small><button class="btn pri" data-a="sleep">Đi ngủ</button></div>
      <div class="card"><div class="ic">📍</div><b>Đặt làm nơi xuất hiện</b><small>Mở game sẽ xuất hiện ở phòng trọ.</small><button class="btn" data-a="home">${S.home==='tro'?'Đang là nơi xuất hiện':'Đặt'}</button></div>
      <div class="card"><div class="ic">🧑‍💼</div><b>Đi kiếm việc</b><small>Trung tâm Việc làm ngay đầu phố.</small><button class="btn" data-a="job">Xem việc</button></div></div>`;
    m.body.querySelector('[data-a=sleep]').onclick=()=>{ m.close(); W.setTime(0); toast('☀️ Chào buổi sáng! Hôm nay đi làm kiếm tiền nào.'); };
    m.body.querySelector('[data-a=home]').onclick=()=>{ S.home='tro'; save(); m.close(); toast('📍 Đã đặt phòng trọ làm nơi xuất hiện.'); };
    m.body.querySelector('[data-a=job]').onclick=()=>{ m.close(); jobs.open(); }; }
  const troSpawn=()=>{ const t=ward.spots.tro; teleport(t.x, t.z+1.6, t.x, t.z-3); };
  HOOK.keys.Digit1=()=>{ if(!playOnce('wave')) emote('wave'); }; HOOK.keys.Digit2=()=>{ P.dancing=!P.dancing; };
  HOOK.keys.Digit3=()=>{ if(playOnce('punch')) onPunch(); else emote('punch'); };
  HOOK.keys.Digit4=()=>{ if(!playOnce('thumbs')) emote('cheer'); };
  HOOK.keys.Digit5=()=>{ if(!playOnce('agree')) procEmote('nod',1.4); }; HOOK.keys.Digit6=()=>{ if(!playOnce('shake')) procEmote('shake',1.4); };
  function onPunch(){ const F=[Math.sin(P.face), Math.cos(P.face)];
    for(const b of bots.bots){ const dx=b.x-P.x, dz=b.z-P.z, d=Math.hypot(dx,dz); if(d<1.5 && (dx*F[0]+dz*F[1])/Math.max(d,.01)>.4){
      setTimeout(()=>{ bots.say(b, ['Ui da! 😵','Đánh người là bug nghiêm trọng đó!','Bình tĩnh nào bạn ơi 😅','Tôi báo bảo vệ Hùng nha!'][Math.floor(Math.random()*4)]); b.x+=dx/d*.6; b.z+=dz/d*.6; burst(new THREE.Vector3(b.x,1.4,b.z),[0xffffff,0xffd23f],20,2,.4,0,.1); }, 150); } }
    for(const p of pets){ if(Math.hypot(p.x-P.x,p.z-P.z)<1.3){ p.say && p.say('😾'); } } }

  /* ============================== CHAT ============================== */
  const chatLog=document.createElement('div'); chatLog.id='chatLog'; document.body.appendChild(chatLog);
  const chatIn=document.createElement('input'); chatIn.id='chatIn'; chatIn.className='inp'; chatIn.placeholder='Nhập tin nhắn rồi Enter (Esc để thoát)…'; chatIn.maxLength=120; chatIn.hidden=true; document.body.appendChild(chatIn);
  let myBubble=null, bubT=0;
  function logChat(who, text, color='#ffd23f'){ const d=document.createElement('div'); d.innerHTML='<b></b> <span></span>'; d.querySelector('b').textContent=who+':'; d.querySelector('b').style.color=color; d.querySelector('span').textContent=text; chatLog.appendChild(d); while(chatLog.children.length>7) chatLog.firstChild.remove(); chatLog.style.opacity=1; clearTimeout(chatLog._t); chatLog._t=setTimeout(()=>chatLog.style.opacity=.35, 9000); }
  function mySay(text){ if(myBubble) removeLabel(myBubble); myBubble=makeLabel(text, null, {fs:40, h:.28, follow:anchorHead, bg:'rgba(255,255,255,.95)', color:'#1b2233', fade:40}); myBubble.y=.35; bubT=5; logChat(PROFILE.name, text); }
  const REPLIES=[[/chào|hello|hi\b|xin chào/i,['Chào {n}! 👋','Hello {n}, hôm nay test gì?','Chào bạn, chúc một ngày ít bug!']],[/bug|lỗi/i,['Report Jira chưa? 🐞','Ghi steps tái hiện rõ ràng nha!','Severity hay priority vậy?']],
    [/test|qc|qa/i,['Nhớ viết test case trước khi test nha 📋','Regression chưa đó?','QA là nghề tuyệt vời ✨']],[/đói|ăn|phở|cà phê|cafe/i,['Ra quán ăn ở khu Thương mại đi!','Tui cũng đói 🍜']],[/tiền|giàu|money/i,['Vào Học viện QA làm quiz kiếm tiền đó!','Mở nhà hàng có thu nhập đều nha 💵']],
    [/nhạc|concert|nhảy/i,['Ra sân khấu quẩy thôi! 🎶','Bàn DJ có nhạc YouTube đó']]];
  W.logChat=logChat;
  function sendChat(){ const t=chatIn.value.trim(); chatIn.value=''; chatIn.hidden=true; W.canvas.focus(); if(!t) return; mySay(t); if(W.multi) W.multi.chat(t);   // S7: gửi cho người chơi khác
    const near=bots.bots.filter(b=>Math.hypot(b.x-P.x,b.z-P.z)<10).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)).slice(0,2);
    near.forEach((b,i)=>setTimeout(()=>{ const set=REPLIES.find(([re])=>re.test(t)); const arr=set?set[1]:['Ờ ha 😄','Nghe hay đó!','Đồng ý luôn!','Để tui nghĩ đã 🤔','Chuẩn QA luôn!'];
      const r=arr[Math.floor(Math.random()*arr.length)].replace('{n}', PROFILE.name); bots.say(b, r, 4); logChat(b.name.split(' · ')[0], r, '#7aa2ff'); }, 900+i*900));
    for(const p of pets) if(p.type==='parrot') setTimeout(()=>p.say(`"${t.slice(0,30)}" 🦜`), 1500); }
  const openChat=()=>{ chatIn.hidden=false; W.clearKeys(); setTimeout(()=>chatIn.focus(),0); };
  HOOK.keys.KeyT=openChat; HOOK.keys.Enter=openChat;
  chatIn.addEventListener('keydown', e=>{ if(e.code==='Enter'){ e.stopPropagation(); sendChat(); } else if(e.code==='Escape'){ chatIn.value=''; chatIn.hidden=true; W.canvas.focus(); } });

  /* ============================== THÚ CƯNG ============================== */
  const loader=new GLTFLoader();
  const loadG=p=>new Promise(res=>loader.load(p,res,undefined,()=>res(null)));
  const [FOX, PARROT, HORSE, FLAMINGO, STORK]=await Promise.all(['Fox.glb','Parrot.glb','Horse.glb','Flamingo.glb','Stork.glb'].map(f=>loadG('assets/models/'+f)));
  const pets=[];
  const defaultPetName=t=>({shiba:'Shiba', cat:'Mướp', parrot:'Vẹt Xanh'}[t])+(S.pets.filter(p=>p.type===t).length?(' '+(S.pets.filter(p=>p.type===t).length+1)):'');
  function normalize(root, size, axis='y'){ const g=new THREE.Group(); g.add(root); g.updateMatrixWorld(true); let b=new THREE.Box3().setFromObject(root); const s=size/((axis==='y'?b.max.y-b.min.y:b.max.z-b.min.z)||1); root.scale.multiplyScalar(s); g.updateMatrixWorld(true); b=new THREE.Box3().setFromObject(root); root.position.y-=b.min.y; return g; }
  function buildCat(){ const g=new THREE.Group(), fur=new THREE.MeshStandardMaterial({color:0xe39b4f, roughness:.9}), white=new THREE.MeshStandardMaterial({color:0xf6efe6, roughness:.9});
    const body=mesh(new THREE.CapsuleGeometry(.11,.26,6,12), fur, 0,.22,0, g); body.rotation.x=Math.PI/2;
    const head=new THREE.Group(); head.position.set(0,.33,.2); g.add(head);
    mesh(new THREE.SphereGeometry(.1,16,12), fur, 0,0,0, head); mesh(new THREE.SphereGeometry(.055,10,8), white, 0,-.03,.07, head).scale.set(1,.7,.8);
    for(const s of [-1,1]){ const e=mesh(new THREE.ConeGeometry(.04,.08,4), fur, s*.06,.09,-.01, head); e.rotation.z=-s*.25; mesh(new THREE.SphereGeometry(.014,8,6), new THREE.MeshStandardMaterial({color:0x2a5d1f, roughness:.2}), s*.04,.02,.09, head); }
    const legs=[]; for(const [x,z] of [[-.06,.12],[.06,.12],[-.06,-.12],[.06,-.12]]){ const l=new THREE.Group(); l.position.set(x,.17,z); g.add(l); mesh(new THREE.CylinderGeometry(.022,.02,.17,8), z>0?white:fur, 0,-.085,0, l); legs.push(l); }
    const tail=new THREE.Group(); tail.position.set(0,.26,-.22); g.add(tail); const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,.08,-.08),new THREE.Vector3(0,.2,-.1),new THREE.Vector3(0,.28,-.04)]),12,.018,6); mesh(tg, fur, 0,0,0, tail);
    g.userData={legs, tail, head}; return g; }
  function spawnPet(p, near){
    let g, mixer=null, acts={}, h=.5;
    if(p.type==='shiba' && FOX){ const root=SkeletonUtils.clone(FOX.scene); root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.frustumCulled=false; } }); g=normalize(root,.5); mixer=new THREE.AnimationMixer(root); for(const c of FOX.animations) acts[c.name]=mixer.clipAction(c); h=.5; }
    else if(p.type==='parrot' && PARROT){ const root=PARROT.scene.clone(); root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; } }); g=normalize(root,.32,'z'); mixer=new THREE.AnimationMixer(root); acts.fly=mixer.clipAction(PARROT.animations[0]); acts.fly.play(); h=.3; }
    else { g=buildCat(); h=.4; }
    g.userData.dynamic=true; scene.add(g); if(p.type!=='parrot') W.BLOBSRC && W.BLOBSRC.push({o:g, s:.6});
    const ang=Math.random()*6.28, pet={...p, g, mixer, acts, x:P.x+Math.cos(ang)*(near?6:1.5), z:P.z+Math.sin(ang)*(near?6:1.5), h:0, cur:null, phase:0, off:pets.length};
    const anchor=new THREE.Object3D(); anchor.position.y=h+.25; g.add(anchor);
    const ico={shiba:'🐕', cat:'🐈', parrot:'🦜'}[p.type]; makeLabel(`${ico} ${p.name}`, null, {fs:40, h:.22, follow:anchor, dot:'#ff8fc2', fade:25});
    pet.say=(t)=>{ if(pet.bub) removeLabel(pet.bub); pet.bub=makeLabel(t,null,{fs:40,h:.24,follow:anchor,bg:'rgba(255,255,255,.95)',color:'#1b2233',fade:30}); pet.bub.y=.2; pet.bubT=3; };
    pet.play=(k)=>{ if(pet.cur===k || !acts[k]) return; acts[k].reset().fadeIn(.25).play(); if(pet.cur && acts[pet.cur]) acts[pet.cur].fadeOut(.25); pet.cur=k; };
    pet.inter={get x(){return pet.x;}, get z(){return pet.z;}, r:1.3, label:`🤚 Vuốt ve ${p.name}`, action:()=>{ burst(new THREE.Vector3(pet.x,.8,pet.z),[0xff4f6d,0xff8fc2],25,1.5,1,-1,.15); pet.say(p.type==='cat'?'Meo~ ❤️':p.type==='parrot'?'Test đi! Test đi! 🦜':'Gâu gâu! ❤️'); }};
    INTER.push(pet.inter); pets.push(pet); return pet; }
  function updatePets(dt){
    for(const p of pets){
      const i=p.off, side=(i%2?1:-1)*(.9+Math.floor(i/2)*.6), F=[Math.sin(P.face), Math.cos(P.face)], R=[-Math.cos(P.face), Math.sin(P.face)];
      const tx=P.x-F[0]*1.2+R[0]*side, tz=P.z-F[1]*1.2+R[1]*side, dx=tx-p.x, dz=tz-p.z, d=Math.hypot(dx,dz);
      if(d>30){ p.x=tx; p.z=tz; }
      const fast=d>4 || (HOOK.vehicle && d>2), sp=Math.min(d*2.2, fast?(HOOK.vehicle?16:7):2.2);
      if(d>.3){ const q={x:p.x+dx/d*sp*dt, z:p.z+dz/d*sp*dt}; if(p.type!=='parrot') W.resolve(q,.2,true); p.x=q.x; p.z=q.z; p.h=lerpAngle(p.h, Math.atan2(dx,dz), 1-Math.exp(-dt*8)); }
      if(p.type==='parrot'){ p.phase+=dt; const hy=groundAt(p.x,p.z)+2.1+Math.sin(p.phase*2)*.25; p.g.position.set(p.x+Math.cos(p.phase)*.4, hy, p.z+Math.sin(p.phase)*.4); p.g.rotation.y=p.h; }
      else { p.g.position.set(p.x, groundAt(p.x,p.z), p.z); p.g.rotation.y=p.h;
        if(p.type==='shiba'){ p.play(sp>3.5?'Run':d>.3?'Walk':'Survey'); }
        else { const ud=p.g.userData; p.phase+=dt*(d>.3?sp*7:0); ud.legs.forEach((l,k)=>l.rotation.x=d>.3?Math.sin(p.phase+(k%2?Math.PI:0)+(k>1?Math.PI/2:0))*.6:0); ud.tail.rotation.x=Math.sin(W.T*2)*.2; ud.head.rotation.y=Math.sin(W.T*.7)*.3; } }
      p.mixer && p.mixer.update(dt);
      if(p.bub){ p.bubT-=dt; if(p.bubT<=0){ removeLabel(p.bub); p.bub=null; } }
    }
  }
  for(const p of S.pets) spawnPet(p, false);
  // thú nuôi của hàng xóm (chó, mèo) + chim trời
  const neighborPets=[];
  if(FOX){ const root=SkeletonUtils.clone(FOX.scene); root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.frustumCulled=false; } }); const g=normalize(root,.5); g.userData.dynamic=true; scene.add(g); W.BLOBSRC && W.BLOBSRC.push({o:g, s:.6});
    const mixer=new THREE.AnimationMixer(root); const acts={}; for(const c of FOX.animations) acts[c.name]=mixer.clipAction(c); acts.Walk.play();
    makeLabel('🐕 Lu (chó nhà hàng xóm)', null, {fs:40,h:.22,follow:(()=>{const a=new THREE.Object3D(); a.position.y=.75; g.add(a); return a;})(), dot:'#9fb3c8', fade:25});
    neighborPets.push({g, mixer, a:0, r:50, sp:.045, kind:'dog'}); }
  { const g=buildCat(); g.userData.dynamic=true; W.BLOBSRC && W.BLOBSRC.push({o:g, s:.55}); const b=city.benches[0]; if(b){ g.position.set(b.x+.5, groundH(b.x,b.z), b.z); g.rotation.y=b.rot; } scene.add(g); g.userData.legs.forEach(l=>l.rotation.x=0);
    makeLabel('🐈 Miu (mèo của quảng trường)', null, {fs:40,h:.22,follow:(()=>{const a=new THREE.Object3D(); a.position.y=.62; g.add(a); return a;})(), dot:'#9fb3c8', fade:25}); neighborPets.push({g, kind:'cat'}); }
  const birds=[];
  for(const [gl,n,r,y,sz] of [[STORK,3,60,30,1.6],[FLAMINGO,2,95,9,1.3]]){ if(!gl) continue; for(let i=0;i<n;i++){ const o=gl.scene.clone(); const g=normalize(o,sz,'z'); g.userData.dynamic=true; scene.add(g);
      const mx=new THREE.AnimationMixer(o); const a=mx.clipAction(gl.animations[0]); a.play(); a.time=Math.random(); birds.push({g, mx, a:Math.random()*6.28, r:r+i*8, y:y+i*3, sp:.05+Math.random()*.03}); } }
  function updateAmbient(dt){
    for(const n of neighborPets){ if(n.kind==='dog'){ n.a+=n.sp*dt; const x=Math.cos(n.a)*n.r, z=Math.sin(n.a)*n.r; n.g.position.set(x, groundAt(x,z), z); n.g.rotation.y=Math.atan2(-Math.sin(n.a), Math.cos(n.a)); n.mixer.update(dt); }
      else { n.g.userData.tail.rotation.x=Math.sin(W.T*1.5)*.25; } }
    for(const b of birds){ b.a+=b.sp*dt; const x=Math.cos(b.a)*b.r, z=Math.sin(b.a)*b.r; b.g.position.set(x, b.y+Math.sin(b.a*3)*2, z); b.g.rotation.y=Math.atan2(-Math.sin(b.a), Math.cos(b.a)); b.mx.update(dt); }
  }

  /* ============================== ĐẤT, NHÀ, VƯỜN, NHÀ HÀNG, TRANG TRẠI ============================== */
  const TYPES={
    c4:   {kind:'home', icon:'🏠', name:'Nhà cấp 4', price:1200, slots:3, desc:'Nhà mái ngói ấm cúng, 3 luống rau.'},
    villa:{kind:'home', icon:'🏡', name:'Biệt thự hiện đại', price:4500, slots:6, desc:'2 tầng, kính lớn, 6 luống rau.'},
    banhmi:{kind:'biz', icon:'🥖', name:'Tiệm bánh mì', price:1500, rate:4, desc:'+4 💰/phút (kể cả lúc bạn offline, tối đa 8 giờ).'},
    cafe: {kind:'biz', icon:'☕', name:'Quán cà phê', price:2200, rate:5, desc:'+5 💰/phút, tối đa 8 giờ.'},
    pho:  {kind:'biz', icon:'🍜', name:'Quán phở', price:3000, rate:7, desc:'+7 💰/phút, tối đa 8 giờ.'},
    farm: {kind:'biz', icon:'🐎', name:'Trang trại ngựa', price:3800, rate:9, slots:4, desc:'+9 💰/phút + 4 luống trồng, có ngựa thả rông.'},
  };
  const COLORS=[0xc0392b,0x2e86de,0x27ae60,0x8e44ad,0xe67e22,0x34495e];
  const lotState=id=>S.lots[id]||null;
  const lots=CITY.lots.map(l=>({...l, f:[Math.sin(l.rot),Math.cos(l.rot)], g:null, slots:[], horses:[]}));
  const lotFront=l=>({x:l.x+l.f[0]*5.9, z:l.z+l.f[1]*5.9});
  function pendingIncome(l){ const s=lotState(l.id); if(!s||!s.type||!TYPES[s.type].rate) return 0; const min=Math.min(8*60,(now()-(s.last||now()))/60000); return Math.floor(min*TYPES[s.type].rate); }
  function stake(g,x,z){ mesh(new THREE.CylinderGeometry(.04,.04,.6,6), MAT.wood, x,.3,z, g); mesh(box(.1,.06,.02), colorMat(0xff5a2a), x,.55,z, g); }
  function signBoard(g, text, sub, z=4.6){ const c=document.createElement('canvas'); c.width=512; c.height=256; const x=c.getContext('2d'); x.fillStyle='#fff8e7'; x.fillRect(0,0,512,256); x.strokeStyle='#8a5a2b'; x.lineWidth=12; x.strokeRect(6,6,500,244);
    x.fillStyle='#1b2233'; x.textAlign='center'; x.font='800 60px "Segoe UI","Segoe UI Emoji",sans-serif'; x.fillText(text,256,100); x.font='600 40px "Segoe UI","Segoe UI Emoji",sans-serif'; x.fillStyle='#b23a1d'; x.fillText(sub,256,180);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; for(const s of [-1,1]) mesh(new THREE.CylinderGeometry(.04,.04,1.6,6), MAT.dark, s*.6,.8,z, g);
    mesh(box(1.4,.7,.05), new THREE.MeshStandardMaterial({map:t, roughness:.7}), 0,1.35,z+.03, g); }
  function buildVilla(g, color){
    const white=colorMat(0xf3f1ec,{roughness:.55}), dark=colorMat(0x2b2f36,{roughness:.5});
    mesh(box(7.4,.3,6.2), MAT.stone, 0,.15,0, g);
    mesh(box(7,3.1,5.6), white, 0,1.85,0, g);
    mesh(box(5.8,2.9,4.8), white, .5,4.85,-.3, g);
    mesh(box(7.4,.22,6), dark, 0,3.45,0, g); mesh(box(6.2,.22,5.2), dark, .5,6.35,-.3, g);
    mesh(box(2.6,2.6,.08), MAT.wood, -2,4.85,2.12, g);
    for(const [x,y,w,h] of [[1.6,1.9,3.2,2.2],[-2.3,1.9,1.6,2.2],[2.1,4.85,2.6,2.1]]) mesh(box(w,h,.06), MAT.glass, x,y,2.83-(y>3?.68:0), g);
    mesh(box(1.1,2.3,.08), colorMat(color,{roughness:.4}), -.3,1.45,2.84, g);
    const rail=new THREE.MeshPhysicalMaterial({color:0xaee0ff, transparent:true, opacity:.35, roughness:.05}); mesh(box(5.6,.9,.05), rail, .5,4.0,2.4, g);
    const pool=mesh(box(2.4,.05,1.6), new THREE.MeshPhysicalMaterial({color:0x2bb3d9, roughness:.05, envMapIntensity:2}), -2.2,.33,3.9, g); pool.castShadow=false;
    mesh(box(2.7,.3,1.9), MAT.stone, -2.2,.15,3.9, g);
    const lamp=mesh(new THREE.SphereGeometry(.12,12,8), MAT.lamp, -.95,2.6,2.95, g); lamp.castShadow=false; W.lamps.push(lamp);
    return {deckZ:3.4, deckHW:1.8, deckHD:.8};
  }
  function planter(l, g, i, lx, lz){
    const p=new THREE.Group(); p.position.set(lx,0,lz); g.add(p);
    for(const [w,d,px,pz] of [[1.3,.08,0,.42],[1.3,.08,0,-.42],[.08,.84,.61,0],[.08,.84,-.61,0]]) mesh(box(w,.3,d), MAT.wood, px,.15,pz, p);
    const soil=mesh(box(1.18,.06,.78), colorMat(0x3e2a1c,{roughness:1}), 0,.26,0, p); soil.castShadow=false;
    const crop=new THREE.Group(); crop.position.y=.28; crop.userData.keep=true; p.add(crop);
    const wpos=new THREE.Vector3(lx,0,lz); g.localToWorld(wpos);
    const slot={l, i, p, crop, x:wpos.x, z:wpos.z};
    slot.inter={x:wpos.x, z:wpos.z, r:1, get label(){ const st=slotState(slot); if(!st) return '🌱 Trồng cây ở luống này'; const it=ITEM[st.seed], el=(now()-st.t)/1000, pct=Math.min(100,Math.round(el/it.crop.grow*100));
        return pct>=100 ? `🧺 Thu hoạch ${it.crop.name} (+${it.crop.sell} 💰)` : `${it.icon} ${it.crop.name} đang lớn ${pct}% (còn ${left((it.crop.grow-el)*1000)})`; },
      action:()=>{ const st=slotState(slot); if(!st) return openPlant(slot); const it=ITEM[st.seed]; if((now()-st.t)/1000>=it.crop.grow){ harvest(slot); } else toast(`${it.crop.name} chưa chín, quay lại sau nhé 🌱`); }};
    INTER.push(slot.inter); l.slots.push(slot); renderCrop(slot); return slot; }
  const slotState=s=>{ const ls=lotState(s.l.id); return ls && ls.crops && ls.crops[s.i] || null; };
  function renderCrop(s){ s.crop.clear(); const st=slotState(s); if(!st) return; const it=ITEM[st.seed]; if(!it) return; const k=Math.min(1,(now()-st.t)/1000/it.crop.grow);
    const leaf=colorMat(it.crop.col,{roughness:.8}), fruit=colorMat(it.crop.fruit,{roughness:.45});
    for(let r=0;r<2;r++) for(let c=0;c<4;c++){ const x=-.42+c*.28, z=-.18+r*.36, h=.06+k*(it.id==='seed_hoa'?.9:.32);
      const st=mesh(new THREE.CylinderGeometry(.012,.016,h,5), leaf, x,h/2,z, s.crop); st.castShadow=false;
      const lf=mesh(new THREE.SphereGeometry(.05+k*.06,6,4), leaf, x,h*.7,z, s.crop); lf.scale.set(1,.5,1); lf.castShadow=false;
      if(k>=1){ mesh(new THREE.SphereGeometry(it.id==='seed_hoa'?.09:.045,8,6), fruit, x+.03,h,z, s.crop); } }
    s.k=k; }
  function openPlant(slot){ const seeds=ITEMS.filter(i=>i.tab==='seed' && S.inv[i.id]>0);
    if(!seeds.length){ toast('Bạn chưa có hạt giống. Mua ở 🛒 Chợ QC (tab Hạt giống).', 3500); return; }
    const m=ui.modal('🌱 Chọn hạt giống'); const g=document.createElement('div'); g.className='grid'; m.body.appendChild(g);
    for(const it of seeds){ const c=document.createElement('div'); c.className='card'; c.style.cursor='pointer'; c.innerHTML=`<div class="ic">${it.icon}</div><b>${it.crop.name}</b><small>Còn ${S.inv[it.id]} hạt · lớn sau ${left(it.crop.grow*1000)} · bán ${it.crop.sell} 💰</small>`;
      c.onclick=()=>{ S.inv[it.id]--; const ls=S.lots[slot.l.id]; (ls.crops ||= {})[slot.i]={seed:it.id, t:now()}; save(); renderCrop(slot); m.close(); emote('water'); toast(`Đã gieo ${it.crop.name} 🌱`); }; g.appendChild(c); } }
  function harvest(slot){ const ls=S.lots[slot.l.id], st=ls.crops[slot.i], it=ITEM[st.seed]; delete ls.crops[slot.i]; S.stats.harvest++; save(); renderCrop(slot);
    burst(new THREE.Vector3(slot.x,.8,slot.z),[it.crop.fruit,0xffffff],30,2,.9,-4,.12); addCoins(it.crop.sell, `🧺 Thu hoạch ${it.crop.name}, bán được ${it.crop.sell} 💰`); }
  function buildLot(l){ buildLot0(l); dropSeats(s=>s.tag===l.id); l.g.traverse(o=>{ if(o.userData.picnic) picnicSeats(o, l.id); }); try{ compactGroup(W, l.g); }catch(e){ console.warn('compact lot', e); }
    l.g.userData.staticShadow=true; W.markShadow && W.markShadow(); }
  function buildLot0(l){
    if(l.g){ scene.remove(l.g); for(const s of l.slots){ const j=INTER.indexOf(s.inter); if(j>=0) INTER.splice(j,1); } l.slots=[]; l.horses=[]; }
    const g=new THREE.Group(); g.position.set(l.x, groundH(l.x,l.z), l.z); g.rotation.y=l.rot; g.userData.dynamic=true; scene.add(g); l.g=g;
    const st=lotState(l.id), mine=PROFILE.name;
    for(const [x,z] of [[-5,-5],[5,-5],[-5,5],[5,5]]) stake(g,x,z);
    if(!st){ signBoard(g, `ĐẤT BÁN · ${l.id}`, `${fmt(l.price)} 💰`, 5); return; }
    if(!st.type){ signBoard(g, `Đất của ${mine}`, l.kind==='home'?'Bấm E để xây nhà':'Bấm E để mở quán', 5); return; }
    const T=TYPES[st.type], col=st.color||COLORS[0];
    let d;
    if(st.type==='villa') d=buildVilla(g, col);
    else { const z={kind:'house', icon:T.icon, name: T.kind==='home' ? `Nhà ${mine}` : `${T.name} ${mine}`, color:col}; d=buildHouse(z, g); z.signMat && (z.signMat.emissiveIntensity=W.night*.6); }
    if(st.type==='farm'){ g.children.forEach(c=>{ if(c.isMesh){ c.scale.multiplyScalar(.8); c.position.multiplyScalar(.8); c.position.z-=1.6; } });
      const rail=MAT.wood; for(const [ax,az,len,rot] of [[0,-5.2,10.4,0],[-5.2,0,10.4,Math.PI/2],[5.2,0,10.4,Math.PI/2]]) for(const y of [.4,.8]){ const r=mesh(box(len,.08,.06), rail, ax,y,az, g); r.rotation.y=rot; }
      if(HORSE) for(let i=0;i<3;i++){ const o=HORSE.scene.clone(); const hg=normalize(o,1.6,'y'); hg.userData.dynamic=true; g.add(hg); const mx=new THREE.AnimationMixer(o); const a=mx.clipAction(HORSE.animations[0]); a.play(); a.time=Math.random(); a.timeScale=.35;
        l.horses.push({g:hg, mx, a:Math.random()*6.28, r:2+i*.9}); } }
    if(T.kind==='biz' && st.type!=='farm' && MODELS.picnic){ for(const s of [-1,1]){ const o=MODELS.picnic.scene.clone(true); o.traverse(m=>{ if(m.isMesh){ m.castShadow=true; } }); o.position.set(s*4.1,0,2.6); o.rotation.y=Math.PI/2; o.scale.setScalar(.8); o.userData.picnic=true; g.add(o); } }
    const n=T.slots||0; const pos=n===3?[[-4.1,-1.6],[-4.1,0],[-4.1,1.6]] : n===6?[[-4.35,-1.8],[-4.35,0],[-4.35,1.8],[4.35,-1.8],[4.35,0],[4.35,1.8]] : n===4?[[3.4,-3.4],[3.4,-2.2],[-3.4,-3.4],[-3.4,-2.2]]:[];
    g.updateMatrixWorld(true); pos.forEach(([x,z],i)=>{ const s=planter(l,g,i,x,z); if(n===6){ s.p.scale.x=.7; } });
    if(d && d.deckZ) addPlat(l.x+l.f[0]*d.deckZ, l.z+l.f[1]*d.deckZ, l.rot, d.deckHW, d.deckHD, .22);
  }
  for(const l of lots){
    buildLot(l);
    const col={x:l.x, z:l.z, r:0}; circles.push(col); l.col=col;
    const fr=lotFront(l);
    INTER.push({x:fr.x, z:fr.z, r:1.6, get label(){ const st=lotState(l.id); if(!st) return `📜 Mua lô ${l.id} – ${fmt(l.price)} 💰`; if(!st.type) return `🔨 Xây trên lô ${l.id}`;
        const T=TYPES[st.type]; return T.kind==='home' ? `${T.icon} Về nhà nghỉ ngơi` : `💵 Thu tiền ${T.name} (+${fmt(pendingIncome(l))} 💰)`; },
      action:()=>lotAction(l)});
  }
  function refreshCols(){ for(const l of lots){ const st=lotState(l.id); l.col.r = st && st.type ? (st.type==='villa'?3.9:st.type==='farm'?2.4:3.25) : 0; if(st && st.type==='farm'){ l.col.x=l.x-l.f[0]*1.6; l.col.z=l.z-l.f[1]*1.6; }
    if(l.col.r>0 && W.botNav && W.botNav.built) W.botNav.stampCircle(l.col.x, l.col.z, l.col.r+.45); } }
  refreshCols();
  function lotAction(l){ const st=lotState(l.id);
    if(!st) return ui.confirm(`📜 Mua lô đất ${l.id}`, `Lô <b>${l.id}</b> (${l.kind==='home'?'đất ở – xây nhà, trồng rau':'đất kinh doanh – mở quán, trang trại'}).<br>Giá: <b class="price">${fmt(l.price)} 💰</b> · Bạn có ${fmt(S.coins)} 💰`, 'Mua lô này', ()=>{ if(!spend(l.price)) return; S.lots[l.id]={type:null}; save(); buildLot(l); refreshCols(); burst(new THREE.Vector3(l.x,2,l.z),[0xffd23f,0x46d39a],80,4,1.2,-4,.16); toast(`🎉 Chúc mừng! Lô ${l.id} là của bạn. Bấm E ở biển để xây.`, 4000); });
    if(!st.type) return openBuild(l);
    const T=TYPES[st.type];
    if(T.kind==='home'){ const m=ui.modal(`${T.icon} ${T.name} của ${PROFILE.name}`); m.body.innerHTML=`<div class="grid">
        <div class="card"><div class="ic">😴</div><b>Ngủ một giấc</b><small>Chuyển sang buổi sáng.</small><button class="btn pri" data-a="sleep">Đi ngủ</button></div>
        <div class="card"><div class="ic">📍</div><b>Đặt làm nhà chính</b><small>Mở game sẽ xuất hiện ở đây.</small><button class="btn" data-a="home">${S.home===l.id?'Đang là nhà chính':'Đặt'}</button></div>
        <div class="card"><div class="ic">🎨</div><b>Sơn lại</b><small>Đổi màu cửa / mái che (50 💰).</small><button class="btn" data-a="paint">Sơn</button></div></div>`;
      m.body.querySelector('[data-a=sleep]').onclick=()=>{ m.close(); W.setTime(0); toast('☀️ Chào buổi sáng! Ngủ ngon lấy sức test tiếp nào.'); };
      m.body.querySelector('[data-a=home]').onclick=()=>{ S.home=l.id; save(); m.close(); toast('📍 Đã đặt làm nhà chính.'); };
      m.body.querySelector('[data-a=paint]').onclick=()=>askPay(50, '🎨 Sơn lại nhà (đổi màu cửa / mái che)', ()=>{ if(!spend(50)) return; st.color=COLORS[(COLORS.indexOf(st.color)+1)%COLORS.length]; save(); buildLot(l); m.close(); });
      return; }
    const amt=pendingIncome(l); if(amt<=0){ toast(`${T.icon} Quán vừa thu tiền xong. Khách đang tới…`); return; }
    st.last=now(); save(); addCoins(amt, `💵 ${T.name}: thu ${fmt(amt)} 💰`); }
  function openBuild(l){ const m=ui.modal(`🔨 Xây dựng trên lô ${l.id}`, {wide:true}); const g=document.createElement('div'); g.className='grid'; m.body.appendChild(g);
    let color=COLORS[Math.floor(Math.random()*COLORS.length)];
    const sw=document.createElement('div'); sw.className='row'; sw.style.margin='0 0 12px'; sw.innerHTML='<span class="muted">Màu chủ đạo:</span>';
    for(const c of COLORS){ const b=document.createElement('button'); b.className='swatch'; b.style.background='#'+c.toString(16).padStart(6,'0'); b.onclick=()=>{ color=c; sw.querySelectorAll('.swatch').forEach(x=>x.classList.toggle('on', x===b)); }; if(c===color) b.classList.add('on'); sw.appendChild(b); }
    m.body.insertBefore(sw, g);
    for(const [id,T] of Object.entries(TYPES).filter(([,T])=>T.kind===l.kind)){ const c=document.createElement('div'); c.className='card';
      c.innerHTML=`<div class="ic">${T.icon}</div><b>${T.name}</b><small>${T.desc}</small><div class="row" style="margin-top:auto"><span class="price">${fmt(T.price)} 💰</span><div class="sp"></div><button class="btn pri">Xây</button></div>`;
      c.querySelector('button').onclick=()=>askPay(T.price, `${T.icon} Xây <b>${T.name}</b> trên lô ${l.id}`, ()=>{ if(!spend(T.price)) return; S.lots[l.id]={type:id, color, last:now(), crops:{}}; if(T.kind==='home' && !S.home) S.home=l.id; save(); m.close(); buildLot(l); refreshCols();
        for(let i=0;i<6;i++) setTimeout(()=>burst(new THREE.Vector3(l.x+(Math.random()-.5)*6, 2+Math.random()*3, l.z+(Math.random()-.5)*6),[0xffd23f,0xffffff,0xff8fc2],50,3,1,-3,.16), i*160);
        toast(`🏗️ Đã xây xong ${T.name}!${T.rate?' Quay lại bấm E để thu tiền.':''}${T.slots?' Mua hạt giống ở Chợ QC để trồng.':''}`, 4500); }); g.appendChild(c); } }
  function openLandOffice(){ const m=ui.modal('📜 Văn phòng địa chính', {wide:true});
    m.body.innerHTML='<p class="muted">Đất ở (R) xây nhà + trồng rau. Đất kinh doanh (B) mở quán / trang trại để có dòng tiền đều kể cả khi bạn offline (tối đa 8 giờ).</p><div class="grid" id="lList"></div>';
    const g=m.body.querySelector('#lList');
    for(const l of lots){ const st=lotState(l.id); const c=document.createElement('div'); c.className='card';
      c.innerHTML=`<div class="row"><b>${l.kind==='home'?'🏘️':'🏪'} Lô ${l.id}</b><div class="sp"></div>${st?`<span class="tag">${st.type?TYPES[st.type].icon+' '+TYPES[st.type].name:'Của bạn'}</span>`:`<span class="price">${fmt(l.price)} 💰</span>`}</div><small>${l.kind==='home'?'Khu dân cư (phía Đông)':'Khu thương mại (phía Tây/Tây Bắc)'}</small><div class="row"><button class="btn" data-go>✨ Bay tới</button>${st?'':'<button class="btn pri" data-buy>Mua</button>'}</div>`;
      c.querySelector('[data-go]').onclick=()=>{ m.close(); const fr=lotFront(l); teleport(fr.x+l.f[0]*1.5, fr.z+l.f[1]*1.5, l.x, l.z); };
      const bb=c.querySelector('[data-buy]'); if(bb) bb.onclick=()=>{ m.close(); lotAction(l); }; g.appendChild(c); } }
  const restaurants=()=>lots.filter(l=>{ const s=lotState(l.id); return s && s.type && TYPES[s.type].kind==='biz'; }).map(l=>{ const fr=lotFront(l); return {tx:fr.x, tz:fr.z}; });

  /* ============================== CÂU CÁ ============================== */
  const FISH=[['Cá cơm',12,30],['Cá nục',22,24],['Mực ống',35,12],['Cá thu',48,15],['Cá mú',85,9],['Cá ngừ đại dương',170,4],['Chiếc giày cũ 👟',0,3],['Rùa biển (thả lại 🐢)',0,3]];
  let fishing=null, bobber=null, rodProp=null;
  const fs=city.spots.fish;
  INTER.push({x:fs.x, z:fs.z, r:1.8, get label(){ if(!has('rod')) return '🎣 Cần mua Cần câu ở Chợ QC / Nhà thuyền'; if(fishing) return fishing.state==='bite'?'❗ CÁ CẮN CÂU! BẤM E NGAY!':'⏳ Chờ cá cắn câu… (bấm E để thu dây)';
      if(!(S.inv.bait>0)) return '🪱 Hết mồi – mua ở Chợ QC / Nhà thuyền'; return `🎣 Thả câu (còn ${S.inv.bait} mồi)`; }, action:fishAction});
  function fishAction(){ if(!has('rod')||(!fishing && !(S.inv.bait>0))) return toast('Cần 🎣 cần câu và 🪱 mồi (Chợ QC / Nhà thuyền).');
    if(!fishing){ S.inv.bait--; save(); fishing={state:'wait', t:2.5+Math.random()*5}; P.face=Math.PI; me.g.rotation.y=Math.PI;
      if(!bobber){ bobber=new THREE.Group(); mesh(new THREE.SphereGeometry(.07,10,8), colorMat(0xff3b30), 0,0,0, bobber); mesh(new THREE.SphereGeometry(.06,10,8), MAT.white, 0,-.05,0, bobber); bobber.userData.dynamic=true; scene.add(bobber); }
      bobber.visible=true; bobber.position.set(fs.x+(Math.random()-.5)*2, W.WATER_Y+.03, fs.z-6); toast('🎣 Đã thả câu… chờ phao chìm!', 2000);
      if(!rodProp && handR){ rodProp=new THREE.Group(); const r=mesh(new THREE.CylinderGeometry(.01,.02,2.2,6), MAT.black, 0,1.1,0, rodProp); r.castShadow=false; const ws=new THREE.Vector3(); handR.getWorldScale(ws); rodProp.scale.setScalar(1/ws.x); handR.add(rodProp); }
      if(rodProp) rodProp.visible=true; return; }
    if(fishing.state==='bite'){ let tot=FISH.reduce((a,f)=>a+f[2],0), r=Math.random()*tot, f=FISH[0]; for(const x of FISH){ if((r-=x[2])<=0){ f=x; break; } }
      S.stats.fish++; burst(bobber.position.clone().setY(.2),[0xffffff,0x8fe3ff],40,2.5,.9,-6,.12); if(f[1]>0) addCoins(f[1], `🐟 Câu được ${f[0]}! Bán cho Chợ QC +${f[1]} 💰`); else toast(`😂 Câu được ${f[0]}`, 3000); }
    else toast('Thu dây sớm quá, cá chưa cắn 😅');
    endFish(); }
  function endFish(){ fishing=null; if(bobber) bobber.visible=false; if(rodProp) rodProp.visible=false; }
  function updateFish(dt){ if(!fishing) return; if(Math.hypot(P.x-fs.x,P.z-fs.z)>3){ endFish(); toast('Bạn rời chỗ câu – thu dây.'); return; }
    fishing.t-=dt; bobber.position.y=W.WATER_Y+.03+(fishing.state==='bite'?-.06+Math.sin(W.T*20)*.04:Math.sin(W.T*2)*.02);
    if(fishing.state==='wait' && fishing.t<=0){ fishing.state='bite'; fishing.t=1.5; burst(bobber.position.clone(),[0xffffff],15,1.5,.5,-5,.1); }
    else if(fishing.state==='bite' && fishing.t<=0){ toast('Cá chạy mất rồi 🐟💨 Thử lại nhé!'); endFish(); } }

  /* ============================== THUYỀN + XE ============================== */
  const dock=city.spots.dock;
  INTER.push({x:dock.x, z:dock.z, r:2, get label(){ return buffOn('boat') ? '🚤 Lên thuyền' : '🚤 Thuê thuyền (vé 250 💰/ngày ở Chợ QC / Nhà thuyền)'; },
    action:()=>{ if(!buffOn('boat')) return openShop(['fun','goods'],'⚓ Nhà thuyền'); const pk=city.spots.boatPark; V.mount('boat', {x:pk.x, z:pk.z, h:pk.h}); }});
  HOOK.vehicleInter=null;
  const vInter=()=>{ const r=V.riding(); if(!r) return null; if(r.type==='boat'){ if(Math.hypot(P.x-dock.x,P.z-dock.z)<8) return {label:'⚓ Cập bến (E)', action:()=>{ V.dismount({x:dock.x, z:dock.z}); }}; return {label:'🚤 Đang lái thuyền – về bến cầu cảng để cập bến'}; } return null; };
  HOOK.keys.KeyV=()=>{ if(sitting) return standUp(); const r=V.riding(); if(r){ if(r.type==='boat') return toast('Lái về bến (cầu cảng phía Bắc) rồi bấm E để cập bến.'); V.dismount(); return; }
    if(W.inside) return toast('Đang ở trong toà nhà – ra ngoài rồi mới lên xe nhé.');
    const t=S.vehicle && has(S.vehicle) ? S.vehicle : has('car')?'car':has('bike')?'bike':has('bicycle')?'bicycle':null; if(!t) return toast('Bạn chưa có xe. Ghé 🏍️ Showroom xe ở khu Thương mại (phía Tây).', 3500); V.mount(t); HOOK.vehicleInter=vInter; };
  HOOK.onFrame.push(()=>{ if(V.riding() && !sitting) HOOK.vehicleInter=vInter; else if(!sitting) HOOK.vehicleInter=null; });
  // pose ngồi xe máy
  HOOK.onFrame.push(()=>{ const r=V.riding(); if(r && (r.type==='bike'||r.type==='bicycle')) W.applyPose('ride'); });
  // VIP: mở lối lên sân khấu + pháo hoa
  const stageBox=boxes.find(b=>b.x0===-12.6 && b.x1===12.6); const stageOrig=stageBox?{...stageBox}:null;
  boxes.push({x0:-10.2, x1:10.2, z0:-38, z1:-36.6}); boxes.push({x0:-12.6,x1:-10.1,z0:-31,z1:-29}); boxes.push({x0:10.1,x1:12.6,z0:-31,z1:-29});
  addPlat(0,-32.4,0,10,4.4,1.2);
  let lastFw=0;
  INTER.push({x:12.6, z:-23.2, r:1.2, when:()=>buffOn('vip'), label:'🎆 Bắn pháo hoa (VIP)', action:()=>{ if(now()-lastFw<15000) return toast('Pháo hoa đang nạp lại…'); lastFw=now(); W.fireworks(); }});

  /* ============================== HỒ SƠ + TÚI ĐỒ ============================== */
  function openProfile(){ const m=ui.modal('👤 Hồ sơ người chơi'); let model=PROFILE.model;
    m.body.innerHTML=`<p class="muted">Tên hiện trên đầu nhân vật. Đổi xong trang sẽ tải lại.</p><label>Tên hiển thị</label><input class="inp" id="pfName" maxlength="20" style="margin:6px 0 14px;width:100%">
      <label>Nhân vật</label><div class="grid" id="pfAv" style="margin-top:6px"></div><div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn pri" id="pfSave">💾 Lưu & vào lại</button></div>`;
    m.body.querySelector('#pfName').value=PROFILE.name;
    const g=m.body.querySelector('#pfAv'); for(const [k,ic,n,d] of [['robot','🤖','Robot QC (khuyên dùng)','Đủ bộ động tác gốc: nhảy múa, vẫy, đấm, like, gật/lắc đầu'],['soldier','🧑‍✈️','Anh Lính','Người thật, đi/chạy chân thực'],['xbot','🦾','Ma-nơ-canh','Người thật, có gật/lắc đầu']]){
      const c=document.createElement('div'); c.className='card'+(k===model?' sel':''); c.style.cursor='pointer'; c.innerHTML=`<div class="ic">${ic}</div><b>${n}</b><small>${d}</small>`; c.onclick=()=>{ model=k; g.querySelectorAll('.card').forEach(x=>x.classList.toggle('sel',x===c)); }; g.appendChild(c); }
    m.body.querySelector('#pfSave').onclick=()=>{ const name=m.body.querySelector('#pfName').value.trim()||'Bình'; store.set('qcworld-profile',{name, model}); store.set(KEY,S); location.reload(); }; }
  function openInventory(){ const m=ui.modal('🎒 Túi đồ & tài sản', {wide:true});
    const perm=ITEMS.filter(i=>i.kind==='perm'&&has(i.id)), day=ITEMS.filter(i=>i.kind==='day'&&buffOn(i.id)), stk=ITEMS.filter(i=>i.kind==='stack'&&S.inv[i.id]>0);
    const myLots=lots.filter(l=>lotState(l.id));
    m.body.innerHTML=`<div class="row" style="gap:18px;flex-wrap:wrap"><span>💰 <b>${fmt(S.coins)}</b></span><span>📈 Đã kiếm ${fmt(S.stats.earned)}</span><span>✅ Quiz đúng ${S.stats.correct}/${S.stats.answered}</span><span>🗑️ Dọn rác ${S.stats.trash}</span><span>🐟 Câu cá ${S.stats.fish}</span><span>🧺 Thu hoạch ${S.stats.harvest}</span></div>
      <h3>Vật phẩm</h3><div class="grid">${[...perm.map(i=>`<div class="card"><div class="ic">${i.icon}</div><b>${i.name}</b><small>Vĩnh viễn</small>${(i.id==='car'||i.id==='bike'||i.id==='bicycle')?`<button class="btn${S.vehicle===i.id?' pri':''}" data-veh="${i.id}">${S.vehicle===i.id?'Đang dùng (V)':'Dùng xe này'}</button>`:''}</div>`),
        ...day.map(i=>`<div class="card"><div class="ic">${i.icon}</div><b>${i.name}</b><small>Còn ${left(S.buffs[i.id]-now())}</small></div>`),
        ...stk.map(i=>`<div class="card"><div class="ic">${i.icon}</div><b>${i.name.replace(/ ×\d+/,'')}</b><small>Số lượng: ${S.inv[i.id]}</small></div>`)].join('')||'<p class="muted">Chưa có gì. Ghé 🛒 Chợ QC nhé!</p>'}</div>
      <h3>Thú cưng</h3><div class="grid">${S.pets.map(p=>`<div class="card"><div class="ic">${({shiba:'🐕',cat:'🐈',parrot:'🦜'})[p.type]}</div><b>${p.name}</b><small>Đang theo bạn</small></div>`).join('')||'<p class="muted">Chưa nuôi bé nào (Chợ QC → Thú cưng).</p>'}</div>
      <h3>Nhà đất</h3><div class="grid">${myLots.map(l=>{ const st=lotState(l.id); return `<div class="card"><b>${st.type?TYPES[st.type].icon+' '+TYPES[st.type].name:'📜 Đất trống'} · ${l.id}</b><small>${st.type&&TYPES[st.type].rate?`Chờ thu: ${fmt(pendingIncome(l))} 💰`:''}</small><button class="btn" data-lot="${l.id}">✨ Bay tới</button></div>`; }).join('')||'<p class="muted">Chưa có đất (📜 Văn phòng địa chính).</p>'}</div>`;
    m.body.querySelectorAll('[data-veh]').forEach(b=>b.onclick=()=>{ S.vehicle=b.dataset.veh; save(); m.close(); toast('Đã chọn xe. Bấm V để lên xe.'); });
    m.body.querySelectorAll('[data-lot]').forEach(b=>b.onclick=()=>{ const l=lots.find(x=>x.id===b.dataset.lot); m.close(); const fr=lotFront(l); teleport(fr.x+l.f[0]*1.5, fr.z+l.f[1]*1.5, l.x, l.z); }); }
  HOOK.keys.KeyI=openInventory; HOOK.keys.KeyP=openProfile;

  /* ============================== BẢN ĐỒ + HƯỚNG DẪN ============================== */
  const tp=(o,face)=>()=>teleport(o.tx??o.x, o.tz??o.z, face?.x, face?.z);
  PLACES.push(
    {icon:'🧠', name:'Tháp Brand QA·QC·QE', sub:'QA Brain: phân tích tài liệu, sinh test case', go:tp(city.spots.brain, CITY.places.tower)},
    {icon:'🎓', name:'Học viện QA', sub:'Quiz kiếm tiền', go:tp(city.academy, CITY.places.academy)},
    {icon:'🛒', name:'Chợ QC', sub:'Đồ dùng, hạt giống, thú cưng', go:tp(city.shop, CITY.places.shop)},
    {icon:'🏍️', name:'Showroom xe', sub:'Xe máy, ô tô', go:tp(city.showroom, CITY.places.showroom)},
    {icon:'📜', name:'Văn phòng địa chính', sub:'Mua đất, xây nhà, mở quán', go:tp(city.landOffice, CITY.places.landOffice)},
    {icon:'⚓', name:'Bến cảng', sub:'Câu cá, thuê thuyền', go:()=>teleport(1,-66,0,-100)},
    {icon:'🏘️', name:'Khu dân cư (Phường Khởi Nghiệp)', sub:'Lô đất R1–R8, quán B1–B4', go:()=>{ const l=lots[2], fr=lotFront(l); teleport(fr.x+l.f[0]*2, fr.z+l.f[1]*2, l.x, l.z); }},
    {icon:'🏠', name:'Nhà của bạn', sub:'Nhà chính / phòng trọ', go:()=>{ if(S.home==='tro' || !S.home) return troSpawn(); const l=lots.find(x=>x.id===S.home); if(!l) return troSpawn(); const fr=lotFront(l); teleport(fr.x+l.f[0]*1.5, fr.z+l.f[1]*1.5, l.x, l.z); }},
  );
  { const c=$('helpWrap').querySelector('.ctrl'); const rows=[['V','Lên / xuống xe (khi đã mua)'],['1–6','Cử chỉ: vẫy tay · nhảy · đấm · cổ vũ · gật đầu · lắc đầu'],['T','Chat (bot gần đó sẽ trả lời)'],['G','Ném rác đang cầm (trúng thùng +12 💰)'],['I','Túi đồ & tài sản'],['P','Hồ sơ: tên, nhân vật']];
    for(const [k,t] of rows){ const a=document.createElement('div'); a.className='ks'; a.innerHTML=`<span class="key">${k}</span>`; const b=document.createElement('div'); b.textContent=t; c.append(a,b); }
    const p=document.createElement('p'); p.style.fontSize='13px'; p.innerHTML='🏝️ <b>Đảo Master Dashboard</b> miễn phí: tool, học, quiz, concert. 🌆 Qua cổng ở đầu cầu phía Đông là <b>thế giới mở</b>: Downtown + Phường Khởi Nghiệp (chợ, xe, đất, nhà trọ miễn phí cho người mới).<br>💰 Kiếm tiền: <b>🧑‍💼 Trung tâm Việc làm</b> (dọn rác, giao hàng, phụ bếp; SQL, API, tìm bug, thiết kế test, code JS), quiz ở 🎓 Học viện QA, câu cá, trồng rau, mở quán. Có việc ở công ty → vào được toà 🔒 + lương ngày.'; c.after(p);
    const h=$('hint'); h.innerHTML+=' &nbsp;·&nbsp; <span class="key">V</span> xe · <span class="key">C</span> ngồi · <span class="key">1-6</span> cử chỉ · <span class="key">T</span> chat'; }

  /* ============================== BOT ============================== */
  await W.yieldUI('Đang gọi cư dân…');
  const life={trash, removeTrash, waterBed, restaurants};
  const bots=makeBots(W, city, life); W.botNav=bots.nav;

  /* ============================== KHUNG HÌNH ============================== */
  let buffT=0, nightPrev=-1;
  HOOK.onFrame.push((dt, T)=>{
    if(W.inside){ buffT+=dt; if(buffT>1){ buffT=0; renderBuffs(); } return; }   // trong toà nhà: tạm dừng thế giới bên ngoài cho nhẹ máy
    bots.update(dt); updatePets(dt); updateAmbient(dt); updateBeds(dt); updateFish(dt); updateThrown(dt);
    for(const a of (W.downtownActors||[])) a.mixer.update(dt);
    for(const l of lots) for(const h of l.horses){ h.a+=dt*.25; h.g.position.set(Math.cos(h.a)*h.r, 0, Math.sin(h.a)*h.r+1.2); h.g.rotation.y=Math.atan2(-Math.sin(h.a), Math.cos(h.a)); h.mx.update(dt); }
    trashT+=dt; if(trashT>14){ trashT=0; if(trash.length<16) spawnTrash(); }
    buffT+=dt; if(buffT>1){ buffT=0; renderBuffs(); for(const l of lots) for(const s of l.slots){ const st=slotState(s); if(st){ const it=ITEM[st.seed]; const k=Math.min(1,(now()-st.t)/1000/it.crop.grow); if(Math.abs(k-(s.k||0))>.08 || (k>=1 && s.k<1)) renderCrop(s); } } }
    if(stageBox){ const vip=buffOn('vip'); if(vip && stageBox.x0!==1e9){ stageBox.x0=stageBox.x1=1e9; } else if(!vip && stageBox.x0===1e9){ Object.assign(stageBox, stageOrig); } }
    if(myBubble){ bubT-=dt; if(bubT<=0){ removeLabel(myBubble); myBubble=null; } }
    if(W.night!==nightPrev){ nightPrev=W.night; for(const m of city.logoMats) m.emissiveIntensity=.7+W.night*2.2; }
    if(city.towerBlink) city.towerBlink.visible=Math.sin(T*3)>0;
  });
  // tư thế người chơi (ngồi, nhảy múa, cảm xúc, câu cá, bật nhảy) – chạy cả khi ở TRONG toà nhà
  let airK=0;
  HOOK.onFrame.push((dt)=>{
    if(P.procDance && !sitting && !V.riding()){ procT+=dt; mePoser.apply('dance', procT); }
    if(proc){ proc.t+=dt; mePoser.apply(proc.kind, proc.t); if(proc.t>=proc.dur) proc=null; }
    if(pose){ pose.t+=dt; const {F,R}=frame(); me.g.updateMatrixWorld(true); POSES[pose.kind](F,R,pose.t,pose.dur); if(pose.t>=pose.dur) pose=null; }
    if(sitting && !me.acts.sit && !sitting.seat.lie){ const {F,R}=frame(); me.g.updateMatrixWorld(true); POSES.sit(F,R,0,1); }
    if(fishing){ const {F,R}=frame(); me.g.updateMatrixWorld(true); POSES.fish(F,R,0,1); }
    // bật nhảy: co gối + vung tay khi đang ở trên không (mượt vào/ra)
    const air=!P.ground && !sitting && !HOOK.vehicle && !fishing;
    airK=W.lerp(airK, air?1:0, 1-Math.exp(-dt*(air?14:9)));
    if(airK>.02){ const tuck=Math.min(1, .45+.55*(1-Math.min(1,Math.abs(P.vy||0)/5.2))); mePoser.apply('jump', tuck, airK); }
  });

  /* ============================== TỐI ƯU ============================== */
  W.terrain.userData.dynamic=true; W.terrain.userData.staticShadow=true;
  for(const z of W.ZONES) if(z.ring) z.ring.material.userData.noMerge=true; for(const t of W.stage.tiles) t.material.userData.noMerge=true;
  for(const z of W.ZONES){ if(z.spin) z.spin.userData.dynamic=true; if(z.blink) z.blink.userData.dynamic=true; }
  if(city.towerBlink) city.towerBlink.userData.dynamic=true;
  W.portal.ring.userData.dynamic=true;
  for(const b of W.stage.beams) b.pv.userData.dynamic=true; for(const d of W.stage.discs) d.userData.dynamic=true; for(const s of (W.stage.subs||[])) s.userData.dynamic=true;
  if(W.QUAL==='low'){ const noSh=o=>o.traverse(c=>{ c.castShadow=false; }); W.stage.beams.forEach(b=>noSh(b.pv)); W.stage.discs.forEach(noSh); (W.stage.subs||[]).forEach(noSh); W.floaters.forEach(f=>noSh(f.o)); }   // vật nhỏ chuyển động ở sân khấu/biển: bỏ đổ bóng (bớt lượt vẽ bóng)
  W.bottle.userData.dynamic=true; for(const f of W.floaters) f.o.userData.dynamic=true;
  for(const o of Object.values(V.garage)) o.userData.dynamic=true;
  await W.yieldUI('Đang tối ưu đồ hoạ…');
  try{ W.resort=makeResort(W, {S, save, ui, askPay, fmt, spend}); }catch(e){ console.warn('resort', e); }   // S2.3: khu nghỉ dưỡng
  try{ W.campus=makeCampus(W, {S, save, ui, addCoins, fmt, openQuiz, city}); }catch(e){ console.warn('campus', e); }   // S3: Toà Giáo trình · Học viện · bộ não
  try{ W.transit=makeTransit(W, {S, save, ui, askPay, fmt, spend, V, downtown, ward, campus:W.campus, resort:W.resort}); }catch(e){ console.warn('transit', e); }   // S4: xe buýt · cáp treo · taxi
  try{ W.arena=makeArena(W, {S, save, ui, askPay, fmt, spend, transit:W.transit}); }catch(e){ console.warn('arena', e); }   // S5: Khu Giải trí (sân bóng · concert · rạp · ẩm thực · vòng quay)
  try{ W.highland=makeHighland(W, {S, save, transit:W.transit}); }catch(e){ console.warn('highland', e); }   // S6: Cao nguyên – núi, sông, thác, rừng, phố cổ
  try{ W.island=makeIsland(W); }catch(e){ console.warn('island', e); }
  try{ W.hills=makeHills(W, {transit:W.transit}); }catch(e){ console.warn('hills', e); }   // Đồi Brand QC: địa hình đồi, đường xoắn ốc, cầu thang lớn
  try{ W.monument=makeMonument(W); }catch(e){ console.warn('monument', e); }
  try{ W.mountainTown=makeMountainTown(W, {S, save, ui, askPay, fmt, spend}); }catch(e){ console.warn('mountaintown', e); }   // Phố Núi: nhà sàn bám vách, tháp cầu trời, tháp sườn đồi
  try{ W.foodStreet=makeFoodStreet(W, {S, save, ui, askPay, fmt, spend}); }catch(e){ console.warn('foodstreet', e); }
  try{ W.luxury=makeLuxury(W, {city, transit:W.transit, V, ui, towers:downtown.towers}); }catch(e){ console.warn('luxury', e); }   // S10: showroom kính lớn + đại gia lái xe sang
  try{ W.jobCenter=makeJobCenter(W, {S, save, ui, addCoins, fmt, jobs, ward, towers:downtown.towers}); }catch(e){ console.warn('jobcenter', e); }   // S18: tháp Trung tâm Việc làm + 10 quầy nghề
  try{ W.funIsland=makeFunIsland(W, {askPay, spend, ui}); }catch(e){ console.warn('funisland', e); }   // S14: đảo QC Wonderland + cáp treo dài
  try{ W.seaLife=makeSeaLife(W, {askPay, spend, ui}); }catch(e){ console.warn('sealife', e); }   // S13: du thuyền, lướt ván, mô tô nước, dù bay
  try{ W.streetLife=makeStreetLife(W, {S, save, askPay, spend, fmt}); }catch(e){ console.warn('streetlife', e); }   // S17: người đeo tai nghe, cosplay, ban nhạc rock dạo, ảo thuật gia
  try{ W.riverside=makeRiverside(W, {S, save, ui, askPay, fmt, spend, transit:W.transit, V}); }catch(e){ console.warn('riverside', e); }   // S12: biệt thự ven đầm + cổng gác + tham quan có hướng dẫn viên   // S11: phố ẩm thực + nhà hàng sang + căn hộ Sky QC   // Tháp Brand QC trên đỉnh đồi (đi bộ vào, cầu thang xoắn, trưng bày, phòng bí ẩn)
  try{ W.traffic=makeTraffic(W, {V, transit:W.transit, highland:W.highland, bots}); }catch(e){ console.warn('traffic', e); }   // S9: đèn giao thông, vạch kẻ, xe bot, lối đi bộ trên cầu   // S15: đảo chính như đảo thật (sóng vỗ bờ, rặng dừa, chòi lá, cứu hộ, thuyền thúng, cua, hải âu, âm thanh)
  try{ W.skyfx=makeSkyFX(W); }catch(e){ console.warn('skyfx', e); }
  try{ W.cafeLife=makeCafeLife(W); }catch(e){ console.warn('cafe', e); }   // S8: khách bot gọi nước, ngồi chill, nói chuyện / hỏi thăm bạn   // S6: mây trôi · núi xa chân trời · trăng
  // S19+: module mở rộng (mỗi file export make(W, ctx)) – làm song song ở các phiên khác nhau, nạp trước khi gộp mesh & dựng bản đồ bot
  for(const [key,file] of [['park','./park.js'],['gadgets','./gadgets.js'],['lang','./langcenter.js'],['pedestrians','./pedestrians.js']]){ try{ const m=await import(file); if(m && m.make) W[key]=await m.make(W, {S, save, ui, askPay, fmt, spend, addCoins, V, transit:W.transit, city, downtown, ward, bots, jobs}); }catch(e){ console.warn(key, e); } }
  const st=batchStatic(W); console.info(`[QC World] gộp ${st.before} mesh tĩnh → ${st.after} khối`); W.markShadow && W.markShadow();
  for(const o of Object.values(V.garage)) if(W.BLOBSRC && o.userData.type!=='boat' && !W.BLOBSRC.some(b=>b.o===o)) W.BLOBSRC.push({o, s:o.userData.type==='car'?3.2:1.5});
  await W.yieldUI('Đang vẽ bản đồ đường đi cho bot…');
  bots.nav && bots.nav.build();
  tuneReflections(W, ()=>[W.GRASS, ...bots.bots.map(b=>b.a.g), ...pets.map(p=>p.g), ...trash.map(t=>t.o)].filter(Boolean));

  // xuất hiện ở nhà chính
  if(S.home==='tro') troSpawn();
  else if(String(S.home||'').startsWith('res:')){ if(!(W.resort && W.resort.spawnHome())) troSpawn(); }
  else if(S.home){ const l=lots.find(x=>x.id===S.home); if(l && lotState(l.id)?.type){ const fr=lotFront(l); teleport(fr.x+l.f[0]*1.5, fr.z+l.f[1]*1.5, l.x, l.z); } }
  if(!S.s2seen){ S.s2seen=1; save(); setTimeout(()=>toast('🛏️ Bạn được cấp PHÒNG TRỌ MIỄN PHÍ ở Phường Khởi Nghiệp (qua cầu phía Đông). Đảo này miễn phí; kiếm tiền ở 🧑‍💼 Trung tâm Việc làm.', 7000), 8500); }
  if(!localStorage.getItem('qcworld-profile')) setTimeout(openProfile, 900);
  renderBuffs();
  if(firstBike) setTimeout(()=>toast('🎁 Người mới được tặng 🚲 xe đạp! Bấm V để đạp xe đi học, đi làm.', 5500), 2500);
  try{ W.multi=makeMulti(W, {S, save, ui, V}); }catch(e){ console.warn('multi', e); }   // S7: nhiều người chơi
  W.life={S, save, interior, downtown, ITEMS, buy, openQuiz, openShop, openLandOffice, openInventory, openProfile, brain, V, bots, city, lots, pets, emote, addCoins, askPay, sitOn, standUp};
}

/* ============================== CSS ============================== */
function injectCSS(){ const s=document.createElement('style'); s.textContent=`
.lmodal{width:min(780px,100%);padding:18px 22px 22px;max-height:88vh;overflow:auto}
.lmodal.wide{width:min(1080px,100%)}
.lhead{display:flex;align-items:center;gap:12px;margin-bottom:10px;position:sticky;top:-18px;background:inherit;padding-top:4px;z-index:1}
.lhead h2{margin:0;font-size:21px;flex:1}
.lcoins{font-weight:800;color:#ffd23f}
.lbody h3{margin:16px 0 8px;font-size:16px}
.muted{color:var(--mut)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.card{border:1px solid var(--line);border-radius:14px;padding:12px;background:rgba(255,255,255,.05);display:flex;flex-direction:column;gap:6px;transition:background .15s}
.card:hover{background:rgba(255,255,255,.09)}
.card.sel{border-color:#ffd23f;background:rgba(255,210,63,.12)}
.card .ic{font-size:28px;line-height:1}
.card b{font-size:15px} .card small{color:var(--mut);line-height:1.45}
.price{font-weight:800;color:#ffd23f}
.tag{font-size:11px;padding:3px 9px;border-radius:20px;background:rgba(70,211,154,.18);color:#86f0c4;font-weight:700;white-space:nowrap}
.tag.warn{background:rgba(255,181,71,.18);color:#ffcf7a}
.qopt{display:block;width:100%;text-align:left;padding:12px 14px;margin:8px 0;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--txt);font:inherit;font-size:15px;cursor:pointer;line-height:1.45}
.qopt:hover{background:rgba(255,255,255,.11)} .qopt.ok{background:rgba(70,211,154,.25);border-color:#46d39a} .qopt.bad{background:rgba(255,90,110,.22);border-color:#ff5a6e}
.qexp{padding:12px 14px;border-radius:12px;background:rgba(79,195,255,.12);border:1px solid rgba(79,195,255,.3);line-height:1.55;margin-top:10px}
#wallet{font-weight:800;color:#ffd23f;padding:0 8px;font-size:15px}
#buffs{position:fixed;left:16px;top:76px;display:flex;gap:6px;flex-wrap:wrap;z-index:5;max-width:60vw}
#buffs .chip{background:rgba(18,24,36,.72);border:1px solid var(--line);border-radius:20px;padding:4px 10px;font-size:13px;font-weight:600}
.bar2{height:6px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden}.bar2 i{display:block;height:100%;background:linear-gradient(90deg,#46d39a,#4fc3ff)}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}.tabs .btn.on{background:var(--acc);border-color:transparent}
.btn:disabled{opacity:.5;cursor:default}
textarea.inp{width:100%;min-height:170px;resize:vertical;font-family:Consolas,monospace;line-height:1.5}
select.inp{padding:7px 8px}
table.tc{width:100%;border-collapse:collapse;font-size:13px} table.tc th,table.tc td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top} table.tc th{background:rgba(255,255,255,.07);position:sticky;top:0}
.swatch{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.3);cursor:pointer;margin-left:6px}.swatch.on{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.35)}
#chatLog{position:fixed;left:16px;bottom:62px;z-index:4;font-size:13px;line-height:1.55;max-width:min(440px,60vw);text-shadow:0 1px 3px rgba(0,0,0,.8);transition:opacity .5s;pointer-events:none}
#chatLog div{background:rgba(18,24,36,.45);padding:2px 8px;border-radius:8px;margin-top:3px;width:fit-content}
#chatIn{position:fixed;left:50%;bottom:160px;transform:translateX(-50%);width:min(520px,90vw);z-index:25;font-size:15px;padding:12px 14px;background:rgba(18,24,36,.88)}
`; document.head.appendChild(s); }
