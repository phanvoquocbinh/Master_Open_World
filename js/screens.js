// QC World – S19g: MÀN HÌNH ỐC ĐẢO (không còn hiển thị Master Dashboard – MD chỉ mở trong app Laptop có kiểm tra thư mục, phím L).
// 9 màn hình đứng trên đảo:
//  • 📰 Tin báo hôm nay · 📈 Chứng khoán · 💻 Công nghệ mới: bấm E → trang Google đã tìm sẵn hiện ngay trên mặt màn hình
//    (CSS3D: DOM thật trong không gian 3D) – lăn chuột để đọc / xem tiếp. Mất mạng → "No internet".
//  • 📘 Kiến thức QA · 🗄️ Database · 🔌 API · ✅ QC thực chiến · 🤖 Automation: câu hỏi (đã đánh sẵn đáp án + giải thích) xen bài giảng,
//    tự lướt mỗi 30 giây (lấy từ data/questions.json + data/courses.json). Bấm E để xem gần: lăn chuột / bấm vào màn hình để lướt.
//  • 🚁 Flycam (quảng trường): camera bay vòng quanh thành phố, vẽ ra texture 320×180 – chỉ khi người chơi ở gần & đang nhìn;
//    vẽ chia lát (mỗi khung 1 phần cảnh, đủ lát mới đổi hình) và chỉ dùng thời gian dư của khung hình → không kéo tụt FPS.
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

export function makeScreens(W, ui){
  const {THREE, scene, camera, mesh, box, ZONES, groundH, circles, HOOK, toast, INTER, P, renderer} = W;
  const css=new CSS3DRenderer(); css.setSize(innerWidth, innerHeight);
  Object.assign(css.domElement.style, {position:'fixed', left:'0', top:'0', zIndex:'4', pointerEvents:'none'});
  document.body.appendChild(css.domElement);
  const cssScene=new THREE.Scene();
  const SW=3.2, SH=2.0, BOTTOM=1.0, CW=1024, CHH=640, ADV=30;   // ADV: số giây tự lướt
  const monitors=[]; let active=null;
  const st=document.createElement('style'); st.textContent=`
    body.screen-mode #top, body.screen-mode #hint, body.screen-mode #music, body.screen-mode #buffs, body.screen-mode #fps, body.screen-mode #prompt, body.screen-mode #chatLog, body.screen-mode #gdDock, body.screen-mode #gdNow{display:none!important}
    .scr3d{background:#fff;border-radius:6px;overflow:hidden;pointer-events:auto;transition:opacity .3s;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
    .scr3d iframe{width:100%;height:100%;border:0;display:block;background:#fff}
    .scr3d .off{width:100%;height:100%;display:grid;place-content:center;text-align:center;gap:14px;font:18px "Segoe UI",sans-serif;color:#e9edf4;background:#141a26}
    .scr3d .off b{font-size:64px;letter-spacing:1px}
    #scrBar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9;display:flex;gap:8px;align-items:center;padding:8px 10px;flex-wrap:wrap;justify-content:center;max-width:96vw}
    #scrBar b{padding:0 8px;font-size:14px}`;
  document.head.appendChild(st);
  const bar=document.createElement('div'); bar.id='scrBar'; bar.className='glass'; bar.hidden=true;
  bar.innerHTML='<b id="scrName"></b><span id="scrBtns" style="display:flex;gap:8px;flex-wrap:wrap"></span><button class="btn pri" id="scrClose">✕ Rời màn hình (Esc)</button>';
  document.body.appendChild(bar);
  bar.querySelector('#scrClose').onclick=()=>close();

  /* ---------- kênh ---------- */
  const GQ=(q,extra='')=>`https://www.google.com/search?igu=1&hl=vi&gl=vn&q=${encodeURIComponent(q)}${extra}`;
  const CH={
    news:{kind:'web', icon:'📰', name:'Tin báo hôm nay', sub:'Google Tin tức · tin mới trong ngày', color:0xe0533d, url:GQ('tin tức hôm nay','&tbm=nws&tbs=qdr:d'), ext:'https://news.google.com/home?hl=vi&gl=VN&ceid=VN:vi'},
    stock:{kind:'web', icon:'📈', name:'Chứng khoán', sub:'VN-Index · thị trường hôm nay', color:0x2fa35f, url:GQ('VN-Index'), ext:'https://www.google.com/search?hl=vi&q=VN-Index'},
    tech:{kind:'web', icon:'💻', name:'Công nghệ mới', sub:'Công nghệ · lập trình · AI trong tuần', color:0x3f7be0, url:GQ('tin công nghệ lập trình AI mới nhất','&tbm=nws&tbs=qdr:w'), ext:'https://www.google.com/search?hl=vi&tbm=nws&q='+encodeURIComponent('tin công nghệ lập trình AI mới nhất')},
    fly:{kind:'fly', icon:'🚁', name:'Flycam thành phố', sub:'Toàn cảnh QC World quay trực tiếp', color:0x4fc3ff},
    qa:{kind:'learn', icon:'📘', name:'Kiến thức QA', sub:'ISTQB · Kỹ thuật thiết kế test', color:0x5b6be8, topics:['istqb','design'], courses:['test-design','bdd','ai-for-qa']},
    db:{kind:'learn', icon:'🗄️', name:'Database', sub:'SQL · Giao dịch · Kiểm thử dữ liệu', color:0x8a55e0, topics:['db'], courses:['sql']},
    api:{kind:'learn', icon:'🔌', name:'API', sub:'HTTP · REST · JSON · Kiểm thử API', color:0x1fa597, topics:['api'], courses:['api','json-regex']},
    qc:{kind:'learn', icon:'✅', name:'QC thực chiến', sub:'Tình huống · Agile · Bảo mật · Mobile', color:0x2e9a4c, topics:['scenario','agile','security','mobile'], courses:['mobile-manual','security-basics']},
    auto:{kind:'learn', icon:'🤖', name:'Automation & Hiệu năng', sub:'Playwright · Selenium · k6 · JMeter · CI/CD', color:0xd04a4f, topics:['automation','performance'],
          courses:['computer-basics','programming-basics','git','playwright','selenium','appium','k6','jmeter','cicd']},
  };
  const ZONE_CH={wiki:'qa', plan:'stock', api:'api', auto:'auto', db:'db', qc:'qc', notes:'news', links:'tech'};
  const hex=c=>'#'+c.toString(16).padStart(6,'0');
  const FONT='"Segoe UI","Segoe UI Emoji",system-ui,sans-serif', MONO='Consolas,"Cascadia Mono","Courier New",monospace';
  const store=(()=>{ try{ return JSON.parse(localStorage.getItem('qcworld-screens')||'{}'); }catch(e){ return {}; } })();
  const saveStore=()=>{ try{ localStorage.setItem('qcworld-screens', JSON.stringify(store)); }catch(e){} };

  /* ---------- vẽ chữ lên canvas ---------- */
  const mctx=document.createElement('canvas').getContext('2d');
  function wrap(text, font, maxW){ mctx.font=font; const out=[];
    for(const para of String(text||'').split('\n')){ if(!para.trim()){ out.push(''); continue; } let line='';
      for(let w of para.split(/\s+/)){ if(!w) continue;
        while(mctx.measureText(w).width>maxW && w.length>1){ let k=w.length-1; while(k>1 && mctx.measureText(w.slice(0,k)).width>maxW) k--; if(line){ out.push(line); line=''; } out.push(w.slice(0,k)); w=w.slice(k); }
        const t=line?line+' '+w:w; if(mctx.measureText(t).width>maxW && line){ out.push(line); line=w; } else line=t; }
      if(line) out.push(line); }
    return out; }
  function rrect(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
  function clip1(text, font, maxW){ mctx.font=font; if(mctx.measureText(text).width<=maxW) return text; let s=text; while(s.length>1 && mctx.measureText(s+'…').width>maxW) s=s.slice(0,-1); return s+'…'; }
  function frameBg(g, ch, tag){
    const gr=g.createLinearGradient(0,0,CW,CHH); gr.addColorStop(0,'#0e1626'); gr.addColorStop(1,'#1a2742'); g.fillStyle=gr; g.fillRect(0,0,CW,CHH);
    g.fillStyle='rgba(255,255,255,.06)'; g.fillRect(0,0,CW,64); g.fillStyle=hex(ch.color); g.fillRect(0,0,10,64); g.fillRect(0,64,CW,4);
    const title=`${ch.icon} ${ch.name}`, tf=`800 28px ${FONT}`;
    g.textBaseline='middle'; g.textAlign='left'; g.fillStyle='#fff'; g.font=tf; g.fillText(title, 26, 33);
    if(tag){ mctx.font=tf; const room=CW-24-(26+mctx.measureText(title).width+36), f=`600 19px ${FONT}`;
      if(room>80){ g.font=f; g.textAlign='right'; g.fillStyle='#b9c4da'; g.fillText(clip1(tag, f, room), CW-24, 33); g.textAlign='left'; } } }

  // bố cục 1 thẻ (tính 1 lần, vẽ lại nhiều lần khi lướt)
  const ROOM=CHH-96-40;
  function layQ(card){ const q=card.q; let L=null;
    for(let s=1; s>=.6; s-=.05){ const R=v=>Math.round(v*s), fq=`700 ${R(31)}px ${FONT}`, fo=`500 ${R(23)}px ${FONT}`, fe=`500 ${R(20)}px ${FONT}`;
      const lq=wrap(q.q, fq, 928), lo=q.options.map(o=>wrap(o, fo, 860)), le=q.explain?wrap('💡 '+q.explain, fe, 900):[];
      const hq=lq.length*R(40), ho=lo.reduce((a,l)=>a+l.length*R(29)+R(16)+R(10),0), he=le.length?le.length*R(27)+20:0;
      L={s,R,fq,fo,fe,lq,lo,le,he}; if(hq+R(12)+ho+(he?he+8:0)<=ROOM) break; }
    return L; }
  function laySlide(card){ const sl=card.slide; let L=null;
    for(let s=1; s>=.6; s-=.05){ const R=v=>Math.round(v*s), fh=`800 ${R(34)}px ${FONT}`, fb=`500 ${R(22)}px ${FONT}`, fc=`500 ${R(18)}px ${MONO}`;
      const lh=wrap(sl.h, fh, 930), lb=wrap(sl.body, fb, 930), lc=sl.code?String(sl.code).split('\n'):[];
      const top=R(30)+lh.length*R(42)+12, hb=lb.length*R(30), hc=lc.length?lc.length*R(24)+28+16:0;
      L={s,R,fh,fb,fc,lh,lb,lc,top,hb,hc}; if(top+hb+hc<=ROOM) return L; }
    // vẫn tràn ở cỡ chữ nhỏ nhất → cắt bớt code rồi tới thân bài
    const R=L.R; let free=ROOM-L.top-L.hb;
    if(L.lc.length){ const n=Math.max(0, Math.floor((free-44)/R(24))); if(n<L.lc.length){ L.lc=n>1?L.lc.slice(0,n-1).concat('…'):[]; } L.hc=L.lc.length?L.lc.length*R(24)+44:0; }
    free=ROOM-L.top-L.hc; const nb=Math.max(2, Math.floor(free/R(30))); if(nb<L.lb.length) L.lb=L.lb.slice(0,nb-1).concat('…');
    return L; }
  function drawCard(g, ch, card, oy, total){
    g.save(); g.translate(0, oy);
    if(!card){ frameBg(g, ch, ''); g.textAlign='center'; g.fillStyle='#fff'; g.font=`700 34px ${FONT}`; g.fillText('Đang tải nội dung…', CW/2, CHH/2); g.restore(); return; }
    if(card.type==='q'){ const L=card.lay||(card.lay=layQ(card)), R=L.R, q=card.q;
      frameBg(g, ch, `❓ Câu hỏi tự học · ${card.topic||''} · cấp ${q.level||1}`);
      let y=94; g.textBaseline='top'; g.textAlign='left'; g.fillStyle='#fff'; g.font=L.fq; for(const l of L.lq){ g.fillText(l, 48, y); y+=R(40); }
      y+=R(12);
      q.options.forEach((o,k)=>{ const lines=L.lo[k], h=lines.length*R(29)+R(16), ok=k===q.answer;
        g.fillStyle=ok?'rgba(46,170,92,.92)':'rgba(255,255,255,.07)'; rrect(g,40,y,944,h,10); g.fill();
        if(ok){ g.strokeStyle='#9bf0b8'; g.lineWidth=2; g.stroke(); }
        g.fillStyle=ok?'#fff':'#c9d2e3'; g.font=`800 ${R(23)}px ${FONT}`; g.fillText(ok?'✓':String.fromCharCode(65+k)+'.', 58, y+R(8));
        g.font=L.fo; let yy=y+R(8); for(const l of lines){ g.fillText(l, 100, yy); yy+=R(29); }
        y+=h+R(10); });
      if(L.le.length){ y+=8; g.fillStyle='rgba(255,210,63,.12)'; rrect(g,40,y,944,L.he,10); g.fill(); g.fillStyle='#ffe28a'; g.font=L.fe; let yy=y+10; for(const l of L.le){ g.fillText(l, 58, yy); yy+=R(27); } } }
    else { const L=card.lay||(card.lay=laySlide(card)), R=L.R;
      frameBg(g, ch, `🎓 ${card.course.icon||''} ${card.course.name} · Bài ${card.li+1}: ${card.lesson.title}`);
      let y=94; g.textBaseline='top'; g.textAlign='left'; g.fillStyle=hex(ch.color); g.font=`700 ${R(18)}px ${FONT}`; g.fillText(`📖 Bài giảng · slide ${card.si+1}/${card.lesson.slides.length}`, 48, y); y+=R(30);
      g.fillStyle='#fff'; g.font=L.fh; for(const l of L.lh){ g.fillText(l, 48, y); y+=R(42); } y+=12;
      g.fillStyle='#dfe6f3'; g.font=L.fb; for(const l of L.lb){ g.fillText(l, 48, y); y+=R(30); }
      if(L.lc.length){ y+=16; g.fillStyle='#0a0f19'; rrect(g,40,y,944,L.hc-16,10); g.fill(); g.fillStyle='#9fe3b4'; g.font=L.fc; let yy=y+14; for(const l of L.lc){ g.fillText(clip1(l, L.fc, 910), 58, yy); yy+=R(24); } } }
    g.textBaseline='alphabetic'; g.textAlign='left'; g.fillStyle='rgba(185,196,218,.75)'; g.font=`500 16px ${FONT}`;
    g.fillText(`${card.n+1}/${total} · tự lướt sau ${ADV} giây · đứng trước màn hình bấm E để xem gần, lăn chuột để lướt`, 26, CHH-16);
    g.restore(); }
  function drawIdle(g, ch, extra){
    frameBg(g, ch, ch.sub); g.textAlign='center'; g.textBaseline='alphabetic';
    if(extra==='offline'){ g.fillStyle='#ff8a8a'; g.font=`900 96px ${FONT}`; g.fillText('No internet', CW/2, 330); g.fillStyle='#b9c4da'; g.font=`500 28px ${FONT}`; g.fillText('Không có kết nối mạng – nội dung trực tuyến tạm dừng', CW/2, 390); }
    else { g.font=`150px ${FONT}`; g.fillStyle='#fff'; g.fillText(ch.icon, CW/2, 300); g.font=`800 60px ${FONT}`; g.fillText(ch.name, CW/2, 390); g.font=`500 30px ${FONT}`; g.fillStyle='#b9c4da'; g.fillText(ch.sub, CW/2, 438); }
    g.fillStyle='#ffd23f'; g.font=`700 32px ${FONT}`;
    g.fillText(ch.kind==='web' ? 'Bấm E để đọc ngay trên màn hình · lăn chuột để xem tiếp' : ch.kind==='fly' ? 'Lại gần để xem trực tiếp · bấm E để bay theo flycam' : 'Bấm E để xem', CW/2, 540); }

  /* ---------- màn hình đứng ---------- */
  function monitor(def){
    const ch=CH[def.ch];
    const g=new THREE.Group(); g.position.set(def.x, groundH(def.x,def.z), def.z); g.rotation.y=def.rot; scene.add(g);
    const frame=new THREE.MeshStandardMaterial({color:0x1c1f25, metalness:.6, roughness:.35});
    for(const s of [-1,1]) mesh(box(.12,BOTTOM+.2,.12), frame, s*(SW/2-.3),(BOTTOM+.2)/2,-.02, g);
    mesh(box(SW/2+.6,.08,.5), frame, 0,.04,-.02, g);
    mesh(box(SW+.2,SH+.2,.12), frame, 0,BOTTOM+SH/2,0, g);
    const cv=document.createElement('canvas'); cv.width=CW; cv.height=CHH; const ctx=cv.getContext('2d');
    const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=8;
    const scr=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH), new THREE.MeshBasicMaterial({map:tex}));
    scr.position.set(0,BOTTOM+SH/2,.065); g.add(scr); scr.userData.dynamic=true;
    let prog=null; if(ch.kind==='learn'){ const pg=new THREE.PlaneGeometry(SW,.035); pg.translate(SW/2,0,0);
      prog=new THREE.Mesh(pg, new THREE.MeshBasicMaterial({color:ch.color})); prog.position.set(-SW/2, BOTTOM+.0175, .067); prog.scale.x=.001; g.add(prog); prog.userData.dynamic=true; }
    g.updateMatrixWorld(true);
    const center=new THREE.Vector3(0,BOTTOM+SH/2,.066).applyMatrix4(g.matrixWorld), normal=new THREE.Vector3(Math.sin(def.rot),0,Math.cos(def.rot));
    circles.push({x:def.x, z:def.z, r:.55});
    const m={...def, ch, g, scr, cv, ctx, tex, prog, center, normal, sphere:new THREE.Sphere(center.clone(), 2.2), obj:null, el:null, deck:null, idx:0, t:0, anim:null, dirty:true, near:false, idleState:'', paused:false};
    monitors.push(m);
    drawIdle(ctx, ch); tex.needsUpdate=true;
    const fx=def.x+normal.x*2.1, fz=def.z+normal.z*2.1;
    const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.8,40), new THREE.MeshBasicMaterial({color:ch.color, transparent:true, opacity:.75, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2}));
    ring.rotation.x=-Math.PI/2; ring.position.set(fx, groundH(fx,fz)+.04, fz); ring.renderOrder=2; scene.add(ring);
    INTER.push({x:fx, z:fz, r:2.3, prio:.4, when:()=>!W.inside, label:`🖥️ Xem ${ch.icon} ${ch.name} trên màn hình (E)`, action:()=>focus(m)});
    return m;
  }
  for(const z of ZONES){ const rot=Math.atan2(-z.x,-z.z), lx=-4.3, lz=5.4;
    monitor({x:z.x+Math.cos(rot)*lx+Math.sin(rot)*lz, z:z.z-Math.sin(rot)*lx+Math.cos(rot)*lz, rot:rot+.4, ch:ZONE_CH[z.id]||'qa', zone:z}); }
  monitor({x:4.9, z:3.4, rot:Math.atan2(-4.9,9-3.4), ch:'fly'});

  /* ---------- nội dung tự học (câu hỏi có sẵn đáp án + bài giảng) ---------- */
  let DATA=null, loading=null;
  function loadData(){ if(DATA || loading) return;
    loading=Promise.all(['data/questions.json','data/courses.json'].map(u=>fetch(u,{cache:'no-store'}).then(r=>{ if(!r.ok) throw new Error(u+' '+r.status); return r.json(); })))
      .then(([q,c])=>{ DATA={q:q.questions||[], topics:Object.fromEntries((q.topics||[]).map(t=>[t.id,t.name])), c:c.courses||[]}; for(const m of monitors) if(m.ch.kind==='learn') buildDeck(m); })
      .catch(e=>{ console.warn('screens: không tải được dữ liệu học', e); setTimeout(()=>{ loading=null; }, 20000); }); }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function buildDeck(m){ const ch=m.ch;
    const qs=shuffle(DATA.q.filter(q=>ch.topics.includes(q.topic) && Array.isArray(q.options) && q.options.length>=2)).map(q=>({type:'q', q, topic:DATA.topics[q.topic]||q.topic}));
    const sl=[]; for(const id of ch.courses){ const c=DATA.c.find(x=>x.id===id); if(!c) continue; (c.lessons||[]).forEach((L,li)=>(L.slides||[]).forEach((s,si)=>sl.push({type:'s', course:c, lesson:L, li, si, slide:s}))); }
    const deck=[]; let a=0, b=0; while(a<qs.length || b<sl.length){ if(a<qs.length) deck.push(qs[a++]); if(b<sl.length) deck.push(sl[b++]); }
    deck.forEach((c,i)=>c.n=i); m.deck=deck; m.idx=deck.length ? Math.min(deck.length-1, Math.max(0, store[m.ch.name]|0)) : 0; m.t=0; m.dirty=true; }
  function step(m, dir){ if(!m.deck || !m.deck.length) return; const from=m.deck[m.idx]; m.idx=(m.idx+dir+m.deck.length)%m.deck.length; m.t=0;
    store[m.ch.name]=m.idx; saveStore(); m.anim={from, to:m.deck[m.idx], t:0, dir}; m.dirty=true; }

  /* ---------- flycam ----------
     Vẽ trọn cả thành phố 1 lần tốn ngang 1 khung hình chính (đo trên Iris Xe: ~30–45 ms) → KHÔNG vẽ trọn 1 lần.
     Cách làm: chỉ vẽ vật thể TĨNH CỠ LỚN (nhà, đất, cây, nước, bầu trời – bỏ người/xe/đồ lặt vặt), chia thành NB nhóm layer;
     mỗi khung vẽ 1 "lát" (vài nhóm) vào bộ đệm sau, đủ lát → đổi bộ đệm lên màn hình (cập nhật mỗi S khung, S tự chỉnh 2…8
     để mỗi khung chỉ tốn ~2 ms). Không cập nhật lại ma trận toàn cảnh (dùng ma trận của khung trước) – tiết kiệm ~15 ms/lần. */
  const L_OP=20, L_TR=28;   // layer 20..27: nhóm vật đục · 28: vật trong suốt (vẽ ở lát cuối)
  const FLY={rt:null, rts:null, front:0, cam:null, curve:null, center:new THREE.Vector3(), follow:false, pos:new THREE.Vector3(), look:new THREE.Vector3(),
    NB:8, S:4, slice:0, cost:0, dtE:1/60, wait:0, tagAt:-1e9, shown:false};
  function flyInit(){ if(FLY.rt) return;
    FLY.rts=[0,1].map(()=>new THREE.WebGLRenderTarget(320, 180, {type:THREE.HalfFloatType})); FLY.rt=FLY.rts[0];
    FLY.cam=new THREE.PerspectiveCamera(55, 320/180, 1, 950);
    const C=W.CITY||{}, regs=[{x:0,z:0,r:80}];
    for(const k of ['downtown','ward','arena']){ const R=C[k]; if(R) regs.push({x:(R.x0+R.x1)/2, z:(R.z0+R.z1)/2, r:Math.max(R.x1-R.x0,R.z1-R.z0)/2}); }
    for(const L of (W.EXTL||[])) if(isFinite(L.x0)&&isFinite(L.x1)&&isFinite(L.z0)&&isFinite(L.z1)) regs.push({x:(L.x0+L.x1)/2, z:(L.z0+L.z1)/2, r:Math.max(L.x1-L.x0,L.z1-L.z0)/2});
    const cx=regs.reduce((a,r)=>a+r.x,0)/regs.length, cz=regs.reduce((a,r)=>a+r.z,0)/regs.length; FLY.center.set(cx,0,cz);
    const R=Math.max(160, ...regs.map(r=>Math.hypot(r.x-cx,r.z-cz)+r.r*.6));
    // vòng bay: 8 điểm quanh tâm thành phố, bán kính lượn sóng để lúc sát khu này lúc sát khu kia
    const pts=[]; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, rr=R*(.72+.22*Math.sin(i*1.7)); pts.push(new THREE.Vector3(cx+Math.cos(a)*rr, 60+(i%2)*20, cz+Math.sin(a)*rr)); }
    FLY.curve=new THREE.CatmullRomCurve3(pts, true, 'centripetal'); }
  // bay theo flycam: phản chiếu nước tính từ camera trên cao ra trắng xoá → giữ ảnh phản chiếu cũ (từ mặt đất) trong lúc bay
  function waterFreeze(on){ const wat=W.water; if(!wat) return;
    if(on && !FLY.wob && Object.prototype.hasOwnProperty.call(wat,'onBeforeRender')){ FLY.wob=wat.onBeforeRender; wat.onBeforeRender=()=>{}; }
    else if(!on && FLY.wob){ wat.onBeforeRender=FLY.wob; FLY.wob=null; } }
  function flyPose(t){ const u=(t/170)%1; FLY.curve.getPointAt(u, FLY.pos); FLY.look.copy(FLY.pos).lerp(FLY.center, .42); FLY.look.y=4; }
  const flyMons=monitors.filter(m=>m.ch.kind==='fly');
  // gán layer flycam: đèn → mọi layer flycam (giữ nguyên số đèn, không phải biên dịch lại shader); vật tĩnh lớn → 1 nhóm
  function flyTag(){ let i=0; const scrs=new Set(flyMons.map(m=>m.scr));
    scene.traverse(o=>{
      if(o.isLight){ for(let l=L_OP;l<=L_TR;l++) o.layers.enable(l); return; }
      if(!o.isMesh || o.isSkinnedMesh || o.userData.flyTag || scrs.has(o)) return;
      const g=o.geometry; if(!g || !g.attributes || !g.attributes.position) return;
      if(!g.boundingSphere) g.computeBoundingSphere(); const r=(g.boundingSphere?g.boundingSphere.radius:0)*o.matrixWorld.getMaxScaleOnAxis();
      if(!(r>=1.4)) return;
      const mats=Array.isArray(o.material)?o.material:[o.material], tr=mats.some(m=>m && m.transparent);
      o.layers.enable(tr?L_TR:L_OP+(i++%FLY.NB)); o.userData.flyTag=1; });
    FLY.tagAt=performance.now(); }
  function flySlice(){
    if(performance.now()-FLY.tagAt>20000) flyTag();   // bắt thêm nhà cửa mới dựng
    const S=FLY.S, s=FLY.slice, back=FLY.rts[1-FLY.front], cam=FLY.cam;
    if(s===0){ cam.position.copy(FLY.pos); cam.lookAt(FLY.look); cam.updateMatrixWorld(); }
    let mask=0; for(let b=0;b<FLY.NB;b++) if(b%S===s) mask|=1<<(L_OP+b); if(s===S-1) mask|=1<<L_TR; cam.layers.mask=mask;
    for(const m of flyMons) m.scr.visible=false;
    const wat=W.water, own=wat && Object.prototype.hasOwnProperty.call(wat,'onBeforeRender'), wob=own?wat.onBeforeRender:null; if(own) wat.onBeforeRender=()=>{};   // không vẽ thêm phản chiếu nước cho flycam
    const sm=renderer.shadowMap.needsUpdate, ac=renderer.autoClear, au=scene.matrixWorldAutoUpdate, prev=renderer.getRenderTarget(), t0=performance.now();
    renderer.shadowMap.needsUpdate=false; renderer.autoClear=(s===0); scene.matrixWorldAutoUpdate=false;
    try{ renderer.setRenderTarget(back); renderer.render(scene, cam); }
    finally{ renderer.setRenderTarget(prev); renderer.autoClear=ac; renderer.shadowMap.needsUpdate=sm; scene.matrixWorldAutoUpdate=au; if(own) wat.onBeforeRender=wob; for(const m of flyMons) m.scr.visible=true; }
    const c=performance.now()-t0; FLY.cost=FLY.cost?FLY.cost*.8+c*.2:c;
    if(++FLY.slice>=S){ FLY.slice=0; FLY.front=1-FLY.front; FLY.rt=FLY.rts[FLY.front];
      for(const m of flyMons){ m.scr.material.map=FLY.rt.texture; if(!FLY.shown) m.scr.material.needsUpdate=true; } FLY.shown=true;
      // tự chỉnh số lát: mỗi khung tốn > 2,5 ms → chia nhỏ hơn; < 0,9 ms → cập nhật nhanh hơn
      if(FLY.cost>2.5 && FLY.S<FLY.NB) FLY.S*=2; else if(FLY.cost<.9 && FLY.S>2) FLY.S/=2; } }

  /* ---------- mạng (chỉ hỏi Google xem có Internet không – khi người chơi ở gần bảng tin) ---------- */
  const NET={ok:null, at:-1e9, busy:null};
  function checkNet(){ if(NET.busy) return NET.busy;
    NET.busy=(async()=>{ let ok=navigator.onLine!==false;
      if(ok){ try{ const c=new AbortController(); const to=setTimeout(()=>c.abort(),4000); await fetch('https://www.google.com/generate_204',{mode:'no-cors',cache:'no-store',signal:c.signal}); clearTimeout(to); }catch(e){ ok=false; } }
      NET.ok=ok; NET.at=performance.now(); NET.busy=null;
      for(const m of monitors) if(m.ch.kind==='web'){ const want=ok?'':'offline'; if(m.idleState!==want){ m.idleState=want; drawIdle(m.ctx, m.ch, want); m.tex.needsUpdate=true; } }
      return ok; })();
    return NET.busy; }

  /* ---------- cập nhật mỗi khung (chỉ màn hình ở gần & đang trong tầm nhìn) ---------- */
  HOOK.onFrame.push((dt, T)=>{
    if(W.inside && !active) return;
    let wantFly=false, wantWeb=false;
    for(const m of monitors){ const d=Math.hypot(P.x-m.center.x, P.z-m.center.z), focused=active===m;
      m.near = focused || (d<46 && (!W.FRUS || W.FRUS.intersectsSphere(m.sphere)));
      if(m.ch.kind==='learn'){
        if(d<70) loadData();
        if(!m.deck) continue;
        if(d<46 || focused){ if(!(focused && m.paused)) m.t+=dt; if(m.t>=ADV) step(m, 1); if(m.prog) m.prog.scale.x=Math.max(.001, Math.min(1, m.t/ADV)); }
        if(!m.near) continue;
        if(m.anim){ m.anim.t=Math.min(1, m.anim.t+dt/.55); m.dirty=true; }
        if(m.dirty){ m.dirty=false; paint(m); if(m.anim && m.anim.t>=1) m.anim=null; } }
      else if(m.ch.kind==='fly'){ if(m.near && d<34) wantFly=true; }
      else if(m.ch.kind==='web'){ if(d<40) wantWeb=true; } }
    if(wantWeb && !NET.busy && performance.now()-NET.at>60000) checkNet();
    FLY.dtE=FLY.dtE*.95+dt*.05;
    if(FLY.follow){ flyInit(); flyPose(T); HOOK.camOverride={pos:FLY.pos.clone(), look:FLY.look.clone(), k:7}; }
    else if(wantFly && !W.inside && !FLY.off){ flyInit(); if(FLY.slice===0) flyPose(T);
      // chỉ dùng thời gian dư: game dưới ~28 FPS → tạm dừng flycam (giữ hình cũ); lát tốn nhiều → giãn nhịp để trung bình ≤ 2,5 ms/khung
      const every=Math.min(8, Math.max(1, Math.ceil(FLY.cost/2.5)));
      if(FLY.dtE<1/28 && ++FLY.wait>=every){ FLY.wait=0; flySlice(); } }
  });
  // vẽ thẻ hiện tại (đang lướt: thẻ cũ trượt lên, thẻ mới trượt vào) – thường + bản nét cao khi đang xem gần
  const HD=1.5, hdCv=document.createElement('canvas'); hdCv.width=CW*HD; hdCv.height=CHH*HD; const hdCtx=hdCv.getContext('2d');
  const hdTex=new THREE.CanvasTexture(hdCv); hdTex.colorSpace=THREE.SRGBColorSpace; hdTex.anisotropy=8;
  function paintTo(g, m){ const total=m.deck.length;
    if(m.anim){ const t=m.anim.t, e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, dir=m.anim.dir;
      drawCard(g, m.ch, m.anim.from, -e*CHH*dir, total); drawCard(g, m.ch, m.anim.to, (1-e)*CHH*dir, total); }
    else drawCard(g, m.ch, m.deck[m.idx], 0, total); }
  function paint(m){ m.ctx.setTransform(1,0,0,1,0,0); paintTo(m.ctx, m); m.tex.needsUpdate=true;
    if(active===m){ hdCtx.setTransform(HD,0,0,HD,0,0); paintTo(hdCtx, m); hdTex.needsUpdate=true;
      if(m.scr.material.map!==hdTex){ m.scr.material.map=hdTex; m.scr.material.needsUpdate=true; } } }

  /* ---------- xem gần (E) ---------- */
  function sizeFor(){ let cw=Math.min(1680, Math.round(innerWidth*.92)), ch=Math.round(cw*SH/SW); const maxH=Math.round(innerHeight*.84); if(ch>maxH){ ch=maxH; cw=Math.round(ch*SW/SH); } return [cw,ch]; }
  function camFor(m){ const [cw,ch]=sizeFor(), fov=camera.fov*Math.PI/180, d=SH*innerHeight/(2*Math.tan(fov/2)*ch);
    if(m.el){ m.el.style.width=cw+'px'; m.el.style.height=ch+'px'; m.obj.scale.setScalar(SW/cw); }
    HOOK.camOverride={pos:m.center.clone().addScaledVector(m.normal,d), look:m.center.clone(), k:4.5}; }
  async function webPage(m){ const el=m.el; if(!el) return; el.innerHTML='';
    const ok=(NET.ok===true && performance.now()-NET.at<60000) ? true : await checkNet();
    if(active!==m || m.el!==el) return;
    if(!ok){ el.innerHTML='<div class="off"><b>No internet</b><div>Không có kết nối mạng.</div><div><button class="btn pri" data-r>↻ Thử lại</button></div></div>'; el.querySelector('[data-r]').onclick=()=>{ NET.at=-1e9; webPage(m); }; return; }
    const f=document.createElement('iframe'); f.src=m.ch.url; f.referrerPolicy='no-referrer'; f.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    f.allow='fullscreen'; el.appendChild(f); }
  function btn(label, fn, pri){ const b=document.createElement('button'); b.className='btn'+(pri?' pri':''); b.textContent=label; b.onclick=fn; return b; }
  function focus(m){
    if(active===m) return true; if(active) close(true);
    active=m; W.clearKeys(); HOOK.blockInput=true; HOOK.labelGroup='none'; document.body.classList.add('screen-mode');
    const ch=m.ch, btns=bar.querySelector('#scrBtns'); btns.innerHTML='';
    bar.querySelector('#scrName').textContent=`🖥️ ${ch.icon} ${ch.name}`;
    if(ch.kind==='web'){
      const el=document.createElement('div'); el.className='scr3d'; el.style.opacity='0'; m.el=el; m.obj=new CSS3DObject(el); m.obj.position.copy(m.center); m.obj.rotation.y=m.rot; cssScene.add(m.obj);
      webPage(m);
      btns.append(btn('⟲ Trang đầu', ()=>webPage(m)), btn('↗ Mở tab riêng', ()=>window.open(ch.ext, '_blank', 'noopener')));
    } else if(ch.kind==='learn'){
      loadData(); m.dirty=true;
      const pb=btn(m.paused?'▶ Tự lướt':'⏸ Dừng tự lướt', ()=>{ m.paused=!m.paused; pb.textContent=m.paused?'▶ Tự lướt':'⏸ Dừng tự lướt'; });
      btns.append(btn('◀ Trước', ()=>step(m,-1)), pb, btn('Sau ▶', ()=>step(m,1)));
    } else if(ch.kind==='fly'){
      const fb=btn('🚁 Bay theo flycam', ()=>{ FLY.follow=!FLY.follow; waterFreeze(FLY.follow); fb.textContent=FLY.follow?'🖥️ Quay lại màn hình':'🚁 Bay theo flycam'; if(!FLY.follow) camFor(m); });
      btns.append(fb);
    }
    camFor(m); bar.hidden=false;
    HOOK.onEscape=()=>{ close(); return true; };
    return true;
  }
  function close(silent){ if(!active) return; const m=active; active=null; FLY.follow=false; waterFreeze(false);
    if(m.ch.kind==='learn'){ m.scr.material.map=m.tex; m.scr.material.needsUpdate=true; m.dirty=true; }
    if(m.obj){ cssScene.remove(m.obj); m.obj=null; m.el=null; }   // CSS3DObject tự gỡ phần tử DOM khi bị remove
    HOOK.camOverride=null; HOOK.blockInput=false; HOOK.labelGroup=W.inside?'interior':'world'; HOOK.onEscape=null; bar.hidden=true; document.body.classList.remove('screen-mode');
    if(!silent) W.canvas.focus(); }
  // bấm chuột: vào màn hình (bảng học) → lướt tiếp; bấm ra ngoài → rời màn hình
  const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
  W.canvas.addEventListener('pointerdown', e=>{ if(!active) return;
    if(active.ch.kind==='learn'){ ndc.set(e.clientX/innerWidth*2-1, -(e.clientY/innerHeight)*2+1); ray.setFromCamera(ndc, camera); if(ray.intersectObject(active.scr, false).length){ step(active, 1); return; } }
    if(active.ch.kind==='fly' && FLY.follow) return;
    close(); });
  let wheelAt=0;
  addEventListener('wheel', e=>{ if(!active || active.ch.kind!=='learn') return; e.preventDefault(); e.stopPropagation();
    const now=performance.now(); if(now-wheelAt<350 || Math.abs(e.deltaY)<4) return; wheelAt=now; step(active, e.deltaY>0?1:-1); }, {capture:true, passive:false});
  addEventListener('resize', ()=>{ css.setSize(innerWidth, innerHeight); if(active && !FLY.follow) camFor(active); });

  // Các nơi khác gọi "mở công cụ Master Dashboard" (cổng Trang chủ, QA Brain…) → chỉ mở trong app Laptop (có kiểm tra thư mục MD)
  function open(z){
    if(z && z.ch && monitors.includes(z)) return focus(z);
    const G=W.gadgets; if(G && G.laptop && G.laptop.openMD){ G.laptop.openMD(z && z.url || '/'); }
    else toast('💻 Master Dashboard chỉ mở trong Laptop (phím L).', 3200);
    return true;
  }
  HOOK.openScreen=open;
  HOOK.afterRender=()=>{ if(!active || !active.obj) return;
    if(HOOK.camOverride && HOOK.camOverride.near && active.el && active.el.style.opacity!=='1') active.el.style.opacity='1';
    css.render(cssScene, camera); };
  const api={open, focus, close, monitors, get active(){ return active; }, net:NET, fly:FLY};   // FLY.off=true: tắt flycam (gỡ lỗi / đo FPS)
  W.screens=api; return api;
}
