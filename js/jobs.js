// QC World – Sprint 2: Trung tâm Việc làm.
// • Việc chân tay: dọn rác phố, giao hàng, phụ bếp (3 mức độ – khó nhiều tiền).
// • Việc trí tuệ (chấm tự động, chạy ngay trong trình duyệt): SQL trên DB mẫu, đọc API/JSON, tìm bug theo spec, thiết kế test (BVA…), viết code JS.
// • Xin việc công ty ở Downtown → được vào toà "chỉ nhân viên", nhận lương ngày khi đi làm, việc trí tuệ +25%.
import { runSQL, sameResult } from './sqlmini.js';

export function makeJobs(W, L){
  const {THREE, scene, mesh, box, colorMat, INTER, HOOK, P, me, toast, groundAt, CITY, burst} = W;
  const {S, save, ui, addCoins, fmt, spots, towers, city} = L;
  S.work=Object.assign({done:{}, intellect:0, hard:0, manual:0, types:{}, job:null, payday:null}, S.work||{});
  if(S.work.job && /^Ph\w+ Tech Hub$/.test(S.work.job.company||'') && S.work.job.company!=='Bình Phan Tech Hub') S.work.job.company='Bình Phan Tech Hub';   // toà đã đổi tên
  let DATA=null; const load=()=>DATA?Promise.resolve(DATA):fetch('data/jobs.json',{cache:'no-store'}).then(r=>r.json()).then(d=>(DATA=d));
  const LV={easy:'Dễ', medium:'Vừa', hard:'Khó'}, LVC={easy:'#46d39a', medium:'#ffb547', hard:'#ff5a6e'};
  const TY={sql:'🗄️ SQL', api:'🔌 API/JSON', bug:'🐞 Tìm bug', tc:'🧪 Thiết kế test', js:'💻 Code JS'};
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const today=()=>new Date().toISOString().slice(0,10);
  const mmss=s=>`${Math.floor(s/60)}:${String(Math.max(0,Math.floor(s%60))).padStart(2,'0')}`;

  const st=document.createElement('style'); st.textContent=`
    .jtabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px} .jtabs .btn.on{background:var(--acc,#2f6fd0);color:#fff}
    .jcard{padding:12px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}
    .jlv{display:inline-block;padding:2px 8px;border-radius:8px;font-size:12px;font-weight:700;color:#10151f}
    .jlist{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
    .jitem{cursor:pointer} .jitem:hover{outline:2px solid rgba(255,255,255,.35)}
    .jcode{width:100%;min-height:150px;font:14px/1.45 Consolas,"Cascadia Code",monospace;background:#0d1117;color:#e6edf3;border:1px solid #30363d;border-radius:10px;padding:10px;resize:vertical;tab-size:2}
    .jout{margin-top:10px;max-height:260px;overflow:auto;font-size:13px} .jout table{border-collapse:collapse;width:100%} .jout td,.jout th{border:1px solid rgba(255,255,255,.15);padding:4px 8px;text-align:left}
    .jok{color:#46d39a;font-weight:700} .jbad{color:#ff7b7b;font-weight:700}
    .jpre{background:#0d1117;color:#e6edf3;border-radius:10px;padding:10px;font:13px/1.45 Consolas,monospace;white-space:pre;overflow:auto;max-height:240px}
    .jschema{font-size:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:8px} .jschema table{border-collapse:collapse;width:100%} .jschema td,.jschema th{border:1px solid rgba(255,255,255,.12);padding:2px 5px;white-space:nowrap}
    .jchk{display:flex;gap:10px;align-items:flex-start;padding:8px;border-radius:10px;background:rgba(255,255,255,.05);margin:6px 0;cursor:pointer}
    #jobHud{position:fixed;left:14px;top:74px;z-index:6;padding:9px 12px;display:flex;gap:10px;align-items:center;font-weight:600}
    body.screen-mode #jobHud{display:none}
    .kitbtn{font-size:18px;padding:12px 10px} .kitstep{display:inline-block;padding:4px 9px;border-radius:8px;margin:3px;background:rgba(255,255,255,.08)} .kitstep.cur{background:#ffd23f;color:#111} .kitstep.ok{background:#2e7d4f}`;
  document.head.appendChild(st);

  /* ============================== CHẤM CÔNG / LƯƠNG ============================== */
  const company=()=>S.work.job && towers.find(t=>t.name===S.work.job.company);
  function canEnter(t){ return !t.locked || (S.work.job && S.work.job.company===t.name); }
  function onEnter(t){ if(!S.work.job || S.work.job.company!==t.name) return; if(S.work.payday===today()) return;
    S.work.payday=today(); const sal=t.locked?120:60; save(); setTimeout(()=>addCoins(sal, `🕘 Chấm công ở ${t.name} – lương hôm nay ${sal} 💰`), 900); }

  /* ============================== VIỆC CHÂN TAY ============================== */
  const MANUAL={
    trash:{icon:'🧹', name:'Dọn rác phố', desc:'Nhặt rác trên vỉa hè Downtown & Phường Khởi Nghiệp (có cột sáng đánh dấu).', lv:{easy:{n:5,t:240,pay:35}, medium:{n:10,t:360,pay:70}, hard:{n:15,t:420,pay:110}}},
    deliver:{icon:'📦', name:'Giao hàng', desc:'Nhận hàng ở 🛒 Chợ QC rồi giao đúng địa chỉ trước giờ hẹn (đi xe đạp cho nhanh!).', lv:{easy:{t:150,pay:40,where:'ward'}, medium:{t:200,pay:80,where:'downtown'}, hard:{t:280,pay:140,where:'island'}}},
    kitchen:{icon:'🍳', name:'Phụ bếp', desc:'Tới 🍳 Bếp Cơm Khởi Nghiệp, chọn nguyên liệu đúng thứ tự cho từng món.', lv:{easy:{n:3,t:100,pay:30}, medium:{n:5,t:130,pay:60}, hard:{n:8,t:160,pay:100}}},
  };
  let job=null;   // việc đang làm
  const hud=document.createElement('div'); hud.id='jobHud'; hud.className='glass'; hud.hidden=true; document.body.appendChild(hud);
  const beamMat=new THREE.MeshBasicMaterial({color:0xffd23f, transparent:true, opacity:.32, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide});
  function marker(x, z, big=true){ const g=new THREE.Group(); g.position.set(x, groundAt(x,z), z); g.userData.dynamic=true;
    const b=new THREE.Mesh(new THREE.CylinderGeometry(big?.55:.3, big?.55:.3, big?34:9, 14, 1, true), beamMat); b.position.y=big?17:4.5; g.add(b);
    const r=new THREE.Mesh(new THREE.RingGeometry(big?.8:.45, big?1.05:.6, 32), new THREE.MeshBasicMaterial({color:0xffd23f, transparent:true, opacity:.85, depthWrite:false, side:THREE.DoubleSide})); r.rotation.x=-Math.PI/2; r.position.y=.05; g.add(r);
    scene.add(g); return g; }
  function addInter(it){ INTER.push(it); job.inter.push(it); return it; }
  function clearJob(){ if(!job) return; for(const m of job.markers) scene.remove(m); for(const it of job.inter){ const i=INTER.indexOf(it); if(i>=0) INTER.splice(i,1); } if(job.parcel) job.parcel.parent && job.parcel.parent.remove(job.parcel); job=null; hud.hidden=true; }
  function finish(ok, msg){ const j=job; clearJob(); if(ok){ S.work.manual++; save(); addCoins(j.pay, msg||`✅ Xong việc ${j.def.icon} ${j.def.name} (${LV[j.lv]}) – nhận ${fmt(j.pay)} 💰`); } else toast(msg||'⏱ Hết giờ – việc chưa xong nên chưa được trả công. Nhận việc khác ở 🧑‍💼 Trung tâm Việc làm nhé!', 4200); }
  function renderHud(){ if(!job){ hud.hidden=true; return; } hud.hidden=false;
    hud.innerHTML=`<span>${job.def.icon} <b>${job.def.name}</b> · ${LV[job.lv]}</span><span>${job.prog()}</span><span>⏱ ${mmss(job.left)}</span><span>💰 ${fmt(job.pay)}</span><button class="btn" style="padding:4px 10px">Huỷ</button>`;
    hud.querySelector('button').onclick=()=>ui.confirm('Huỷ việc?', 'Huỷ thì không được trả công.', 'Huỷ việc', ()=>{ clearJob(); toast('Đã huỷ việc.'); }); }
  function freeSpot(){ for(let k=0;k<80;k++){ const x=138+Math.random()*122, z=-58+Math.random()*530; if(!W.inDT(x,z,-1)) continue; if(W.botNav && W.botNav.built && !W.botNav.ok(x,z)) continue; if(W.boxes.some(b=>x>b.x0-1&&x<b.x1+1&&z>b.z0-1&&z<b.z1+1)) continue; return {x,z}; } return {x:199, z:-13}; }
  const TRASHM=[colorMat(0xf2efe6,{roughness:.9}), colorMat(0xc8352a,{roughness:.4,metalness:.5}), colorMat(0x2e8f47,{roughness:.3})];
  function startManual(kind, lv){
    if(job) return toast('Bạn đang làm một việc rồi – xong hoặc huỷ việc đó trước nhé.');
    const def=MANUAL[kind], c=def.lv[lv]; job={kind, lv, def, conf:c, pay:Math.round(c.pay*(S.work.job?1.1:1)), left:c.t, markers:[], inter:[], got:0};
    if(kind==='trash'){ job.prog=()=>`🗑️ ${job.got}/${c.n}`;
      for(let i=0;i<c.n;i++){ const p=freeSpot(), o=new THREE.Group(); o.position.set(p.x, groundAt(p.x,p.z)+.06, p.z); o.userData.dynamic=true;
        const k=i%3; if(k===0) mesh(new THREE.IcosahedronGeometry(.13,0), TRASHM[0], 0,.05,0, o); else if(k===1) mesh(new THREE.CylinderGeometry(.06,.06,.2,10), TRASHM[1], 0,.06,0, o).rotation.z=Math.PI/2; else mesh(new THREE.CylinderGeometry(.06,.07,.3,10), TRASHM[2], 0,.08,0, o).rotation.z=Math.PI/2;
        scene.add(o); const m=marker(p.x,p.z,false); job.markers.push(o, m);
        const it=addInter({x:p.x, z:p.z, r:1.4, prio:.5, label:'🧹 Nhặt rác (việc làm)', action:()=>{ scene.remove(o); scene.remove(m); const j=INTER.indexOf(it); if(j>=0) INTER.splice(j,1); job.got++; burst && burst(new THREE.Vector3(p.x,.6,p.z),[0x46d39a,0xffffff],20,1.4,.6,-4,.1);
          if(job.got>=c.n) finish(true); else toast(`🗑️ ${job.got}/${c.n}`, 900); }}); }
      toast(`🧹 Nhặt ${c.n} cụm rác có cột sáng vàng ở Downtown & Phường Khởi Nghiệp trong ${mmss(c.t)}.`, 5000); }
    else if(kind==='deliver'){ const sh=city.shop; job.step=0; job.prog=()=>job.step===0?'📦 Tới Chợ QC nhận hàng':'📦 Đang giao tới cột sáng';
      const m0=marker(sh.tx, sh.tz); job.markers.push(m0);
      const dests={ ward:()=>{ const l=CITY.lots[Math.floor(Math.random()*CITY.lots.length)]; const f=[Math.sin(l.rot),Math.cos(l.rot)]; return {x:l.x+f[0]*7.5, z:l.z+f[1]*7.5, name:`lô ${l.id}`}; },
        downtown:()=>{ const t=towers.filter(t=>!t.locked)[Math.floor(Math.random()*towers.filter(t=>!t.locked).length)]; return {x:t.door.x, z:t.door.z+(t.face>0?1.6:-1.6), name:t.name}; },
        island:()=>{ const a=city.academy; return {x:a.tx, z:a.tz, name:'Học viện QA (đảo MD)'}; } };
      const d=dests[c.where]();
      const pick=addInter({x:sh.tx, z:sh.tz, r:2.2, prio:.6, when:()=>job&&job.step===0, label:'📦 Nhận hàng giao (việc làm)', action:()=>{ job.step=1; scene.remove(m0);
        const pc=mesh(box(.42,.3,.32), colorMat(0xc89b5d,{roughness:.8}), 0,1.05,.38); scene.remove(pc); me.g.add(pc); job.parcel=pc;
        const m1=marker(d.x,d.z); job.markers.push(m1); toast(`📦 Đã nhận hàng! Giao tới ${d.name} (cột sáng vàng).`, 4000); }});
      addInter({x:d.x, z:d.z, r:2.4, prio:.6, when:()=>job&&job.step===1, label:`📦 Giao hàng cho khách (${d.name})`, action:()=>finish(true, `📦 Giao hàng thành công tới ${d.name}! +${fmt(job.pay)} 💰`)});
      toast(`📦 Tới 🛒 Chợ QC (Phường Khởi Nghiệp) nhận hàng, rồi giao tới ${d.name} trong ${mmss(c.t)}.`, 5000); }
    else if(kind==='kitchen'){ const k=spots.kitchen; job.done=0; job.prog=()=>`🍽️ ${job.done}/${c.n} món`;
      job.markers.push(marker(k.x,k.z)); addInter({x:k.x, z:k.z, r:2.2, prio:.6, label:'🍳 Vào bếp làm đơn (việc làm)', action:()=>openKitchen()});
      toast(`🍳 Tới 🍳 Bếp Cơm Khởi Nghiệp (cạnh Chợ QC) làm ${c.n} món trong ${mmss(c.t)}.`, 5000); }
    renderHud();
  }
  const DISHES=[
    {name:'Cơm gà xối mỡ', steps:['🍚 Cơm','🍗 Gà chiên','🥒 Dưa leo','🥣 Nước mắm']},
    {name:'Phở bò', steps:['🍜 Bánh phở','🥩 Thịt bò','🌿 Hành ngò','🍲 Nước dùng']},
    {name:'Bánh mì ốp la', steps:['🥖 Bánh mì','🍳 Trứng','🥒 Dưa leo','🌶️ Tương ớt']},
    {name:'Bún chả', steps:['🍜 Bún','🍖 Chả nướng','🥬 Rau sống','🥣 Nước mắm']},
    {name:'Cơm tấm sườn', steps:['🍚 Cơm','🍖 Sườn nướng','🍳 Trứng','🥣 Nước mắm']},
    {name:'Gỏi cuốn', steps:['🫓 Bánh tráng','🍜 Bún','🦐 Tôm','🥬 Rau sống']},
  ];
  const ING=[...new Set(DISHES.flatMap(d=>d.steps))];
  function openKitchen(){ if(!job||job.kind!=='kitchen') return;
    const m=ui.modal('🍳 Bếp Cơm Khởi Nghiệp', {wide:true}); let dish=null, step=0;
    const order=()=>{ dish=DISHES[Math.floor(Math.random()*DISHES.length)]; step=0; draw(); };
    const draw=()=>{ if(!job){ m.close(); return; }
      m.body.innerHTML=`<div class="row" style="justify-content:space-between;margin-bottom:8px"><b>Đơn ${job.done+1}/${job.conf.n}: ${dish.name}</b><span>⏱ <b id="kT">${mmss(job.left)}</b></span></div>
        <div style="margin-bottom:12px">${dish.steps.map((s,i)=>`<span class="kitstep ${i<step?'ok':i===step?'cur':''}">${i+1}. ${s}</span>`).join('')}</div>
        <p class="muted">Bấm nguyên liệu ĐÚNG THỨ TỰ. Chọn sai bị trừ 3 giây.</p><div class="grid" id="kG"></div>`;
      const g=m.body.querySelector('#kG'); for(const ing of [...ING].sort(()=>Math.random()-.5)){ const b=document.createElement('button'); b.className='btn kitbtn'; b.textContent=ing;
        b.onclick=()=>{ if(!job) return; if(ing===dish.steps[step]){ step++; if(step>=dish.steps.length){ job.done++; renderHud(); if(job.done>=job.conf.n){ m.close(); finish(true); return; } toast(`✅ Xong món ${dish.name}!`, 900); order(); return; } draw(); }
          else { job.left=Math.max(0, job.left-3); b.style.background='#a33'; setTimeout(()=>b.style.background='',250); } }; g.appendChild(b); } };
    order(); const iv=setInterval(()=>{ const t=m.body.querySelector('#kT'); if(!job || !document.body.contains(m.wrap)){ clearInterval(iv); return; } if(t) t.textContent=mmss(job.left); }, 500); }
  let hudAcc=0;
  HOOK.onFrame.push((dt)=>{ if(!job) return; job.left-=dt; hudAcc+=dt; if(hudAcc>.5){ hudAcc=0; renderHud(); } if(job.left<=0) finish(false); });

  /* ============================== VIỆC TRÍ TUỆ ============================== */
  function payFor(t){ const base=DATA.pay[t.level], rep=S.work.done[t.id]; return Math.round(base*(rep?DATA.pay.repeatRate:1)*(S.work.job?1+DATA.pay.employedBonus:1)); }
  function reward(t){ const pay=payFor(t), rep=S.work.done[t.id]; S.work.done[t.id]=(rep||0)+1;
    if(!rep){ S.work.intellect++; if(t.level==='hard') S.work.hard++; S.work.types[t.type]=(S.work.types[t.type]||0)+1; }
    save(); addCoins(pay, `✅ Hoàn thành “${t.title}” – nhận ${fmt(pay)} 💰${rep?' (làm lại: 25%)':''}`); return pay; }
  const drafts={};
  function runJS(code, fname, tests){ return new Promise(res=>{
    const src=`onmessage=e=>{ const {code,fname,tests}=e.data; let fn; try{ fn=(new Function(code+'\\n;return typeof '+fname+'==="function"?'+fname+':null;'))(); }catch(err){ postMessage({err:'Lỗi cú pháp: '+err.message}); return; }
      if(!fn){ postMessage({err:'Không tìm thấy function '+fname+'()'}); return; }
      const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b) || (a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&JSON.stringify(Object.keys(a).sort().reduce((o,k)=>(o[k]=a[k],o),{}))===JSON.stringify(Object.keys(b).sort().reduce((o,k)=>(o[k]=b[k],o),{})));
      postMessage({out:tests.map(t=>{ try{ const got=fn(...JSON.parse(JSON.stringify(t.args))); return {got:got===undefined?'undefined':JSON.stringify(got), ok:eq(got,t.expect)}; }catch(err){ return {got:'Lỗi: '+err.message, ok:false}; } })}); };`;
    const w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
    const to=setTimeout(()=>{ w.terminate(); res({err:'Quá 2 giây – có thể bị vòng lặp vô hạn.'}); }, 2000);
    w.onmessage=e=>{ clearTimeout(to); w.terminate(); res(e.data); }; w.onerror=e=>{ clearTimeout(to); w.terminate(); res({err:e.message}); };
    w.postMessage({code, fname, tests}); }); }
  const resTable=r=>`<div class="muted">${r.rows.length} dòng</div><table><tr>${r.columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>${r.rows.slice(0,60).map(row=>`<tr>${row.map(v=>`<td>${v===null?'<i>NULL</i>':esc(typeof v==='number'?Math.round(v*100)/100:v)}</td>`).join('')}</tr>`).join('')}</table>`;
  function schemaHTML(){ return `<div class="jschema">${Object.entries(DATA.db).map(([t,rows])=>`<div class="jcard"><b>${t}</b> <span class="muted">(${rows.length} dòng)</span><div style="overflow:auto;max-height:180px"><table><tr>${Object.keys(rows[0]).map(c=>`<th>${c}</th>`).join('')}</tr>${rows.map(r=>`<tr>${Object.values(r).map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</table></div></div>`).join('')}</div>`; }
  function taskView(m, t, back){
    const head=`<div class="row" style="gap:8px;margin-bottom:8px"><button class="btn" data-back>← Danh sách</button><b style="font-size:17px">${TY[t.type]} · ${esc(t.title)}</b><span class="jlv" style="background:${LVC[t.level]}">${LV[t.level]}</span><span class="sp"></span><b>💰 ${fmt(payFor(t))}</b>${S.work.done[t.id]?' <span class="jok">✓ đã làm</span>':''}</div>`;
    let body='';
    if(t.type==='sql') body=`<p>${esc(t.text)}</p><details style="margin:8px 0"><summary>📚 Xem dữ liệu mẫu (4 bảng)</summary>${schemaHTML()}</details>
      <textarea class="jcode" spellcheck="false">${esc(drafts[t.id]||'SELECT ')}</textarea>
      <div class="row" style="gap:8px;margin-top:8px"><button class="btn" data-run>▶ Chạy thử</button><button class="btn pri" data-sub>✅ Nộp bài</button>${t.hint?'<button class="btn" data-hint>💡 Gợi ý</button>':''}<span class="muted">Hỗ trợ SELECT · JOIN/LEFT JOIN · WHERE · GROUP BY · HAVING · ORDER BY · LIMIT (chưa có truy vấn con)</span></div><div class="jout"></div>`;
    else if(t.type==='js') body=`<p>${esc(t.text)}</p><textarea class="jcode" spellcheck="false" style="min-height:190px">${esc(drafts[t.id]||t.stub)}</textarea>
      <div class="row" style="gap:8px;margin-top:8px"><button class="btn" data-run>▶ Chạy test</button><button class="btn pri" data-sub>✅ Nộp bài</button><span class="muted">Code chạy riêng trong trình duyệt (Web Worker), tối đa 2 giây.</span></div><div class="jout"></div>`;
    else if(t.type==='api') body=`<p>${esc(t.text)}</p>${t.json?`<div class="jpre">${esc(JSON.stringify(t.json,null,2))}</div>`:''}<div class="row" style="gap:8px;margin-top:10px"><input class="inp" data-ans placeholder="Câu trả lời" style="flex:1"><button class="btn pri" data-sub>✅ Nộp</button></div><div class="jout"></div>`;
    else if(t.type==='bug') body=`<div class="jcard"><b>📄 Spec:</b> ${esc(t.spec)}</div><p style="margin:10px 0 4px">Đánh dấu các kết quả chạy test là <b>BUG</b> (sai so với spec):</p>${t.items.map((s,i)=>`<label class="jchk"><input type="checkbox" data-i="${i}"><span>${esc(s)}</span></label>`).join('')}<div class="row" style="margin-top:8px"><button class="btn pri" data-sub>✅ Nộp</button></div><div class="jout"></div>`;
    else if(t.type==='tc') body=`<p>${esc(t.text)}</p><div class="row" style="gap:8px;margin-top:6px"><input class="inp" data-ans placeholder="Ví dụ: 1, 2, 3" style="flex:1"><button class="btn pri" data-sub>✅ Nộp</button></div><div class="jout"></div>`;
    m.body.innerHTML=head+body; const out=m.body.querySelector('.jout'), ta=m.body.querySelector('textarea');
    m.body.querySelector('[data-back]').onclick=back;
    if(ta){ ta.addEventListener('input',()=>drafts[t.id]=ta.value); ta.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Tab'){ e.preventDefault(); const s=ta.selectionStart; ta.value=ta.value.slice(0,s)+'  '+ta.value.slice(ta.selectionEnd); ta.selectionStart=ta.selectionEnd=s+2; } }); ta.focus(); }
    m.body.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter') m.body.querySelector('[data-sub]').click(); }));
    const okMsg=pay=>`<div class="jok" style="font-size:16px">🎉 Chính xác! +${fmt(pay)} 💰</div>`;
    const hb=m.body.querySelector('[data-hint]'); if(hb) hb.onclick=()=>{ out.innerHTML=`💡 ${esc(t.hint)}`; };
    const run=m.body.querySelector('[data-run]'), sub=m.body.querySelector('[data-sub]');
    if(t.type==='sql'){
      run.onclick=()=>{ try{ out.innerHTML=resTable(runSQL(DATA.db, ta.value)); }catch(e){ out.innerHTML=`<span class="jbad">Lỗi: ${esc(e.message)}</span>`; } };
      sub.onclick=()=>{ let mine; try{ mine=runSQL(DATA.db, ta.value); }catch(e){ out.innerHTML=`<span class="jbad">Lỗi: ${esc(e.message)}</span>`; return; }
        const exp=runSQL(DATA.db, t.ref), r=sameResult(mine, exp, !!t.ordered);
        out.innerHTML = r.ok ? okMsg(reward(t)) : `<span class="jbad">❌ Chưa đúng: ${esc(r.why)}</span>${resTable(mine)}`; };
    } else if(t.type==='js'){
      const show=r=>r.err?`<span class="jbad">${esc(r.err)}</span>`:`<table><tr><th>#</th><th>Đầu vào</th><th>Mong đợi</th><th>Kết quả</th><th></th></tr>${r.out.map((o,i)=>`<tr><td>${i+1}</td><td>${esc(JSON.stringify(t.tests[i].args).slice(1,-1))}</td><td>${esc(JSON.stringify(t.tests[i].expect))}</td><td>${esc(o.got)}</td><td>${o.ok?'<span class="jok">PASS</span>':'<span class="jbad">FAIL</span>'}</td></tr>`).join('')}</table>`;
      run.onclick=async()=>{ out.textContent='Đang chạy…'; out.innerHTML=show(await runJS(ta.value, t.fname, t.tests)); };
      sub.onclick=async()=>{ out.textContent='Đang chấm…'; const r=await runJS(ta.value, t.fname, t.tests); if(!r.err && r.out.every(o=>o.ok)) out.innerHTML=okMsg(reward(t)); else out.innerHTML=`<div class="jbad">❌ Còn test chưa qua – sửa rồi nộp lại.</div>`+show(r); };
    } else if(t.type==='api'){
      sub.onclick=()=>{ const v=m.body.querySelector('[data-ans]').value, n=s=>String(s).trim().toLowerCase().replace(/[\s.,"'đ]/g,'');
        out.innerHTML = t.answers.some(a=>n(a)===n(v)) ? okMsg(reward(t)) : `<span class="jbad">❌ Chưa đúng – đọc kỹ lại response/đề bài nhé.</span>`; };
    } else if(t.type==='bug'){
      sub.onclick=()=>{ const sel=[...m.body.querySelectorAll('input[type=checkbox]')].filter(c=>c.checked).map(c=>+c.dataset.i).sort(), want=[...t.bugs].sort();
        if(JSON.stringify(sel)===JSON.stringify(want)) out.innerHTML=okMsg(reward(t));
        else { const miss=want.filter(i=>!sel.includes(i)).length, extra=sel.filter(i=>!want.includes(i)).length; out.innerHTML=`<span class="jbad">❌ Chưa đúng: ${miss?`còn sót ${miss} bug`:''}${miss&&extra?' · ':''}${extra?`${extra} mục không phải bug`:''}.</span>`; } };
    } else if(t.type==='tc'){
      sub.onclick=()=>{ const raw=m.body.querySelector('[data-ans]').value.replace(/(\d)[.\s](?=\d{3}(?!\d))/g,'$1');   // 199.999 (kiểu Việt) = 199999
        const nums=[...new Set((raw.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number))];
        const miss=t.required.filter(x=>!nums.includes(x)), extra=nums.filter(x=>!t.required.includes(x));
        if(!miss.length && extra.length<=t.extra) out.innerHTML=okMsg(reward(t));
        else out.innerHTML=`<span class="jbad">❌ Chưa đúng: ${miss.length?`thiếu ${miss.length} giá trị quan trọng`:''}${miss.length&&extra.length>t.extra?' · ':''}${extra.length>t.extra?`thừa ${extra.length} giá trị không cần`:''}.</span>`; };
    }
  }

  /* ============================== GIAO DIỆN TRUNG TÂM ============================== */
  let tab='manual', fType='all', fLv='all';
  function open(t0){ if(t0) tab=t0; load().then(()=>{ const m=ui.modal('🧑‍💼 Trung tâm Việc làm', {wide:true}); render(m); }).catch(e=>toast('Không tải được data/jobs.json: '+e.message, 5000)); }
  function render(m){
    const tabs=[['manual','💪 Việc chân tay'],['brain','🧠 Việc trí tuệ'],['hire','🏢 Xin việc công ty'],['me','📊 Hồ sơ việc làm']];
    m.body.innerHTML=`<div class="jtabs">${tabs.map(([k,n])=>`<button class="btn ${k===tab?'on':''}" data-t="${k}">${n}</button>`).join('')}</div><div id="jBody"></div>`;
    m.body.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ tab=b.dataset.t; render(m); });
    const B=m.body.querySelector('#jBody');
    if(tab==='manual'){
      B.innerHTML=`<p class="muted">Lao động chân tay: nhận việc → làm ngoài thế giới (có cột sáng vàng chỉ đường) → xong trong thời hạn thì được trả công.${S.work.job?' Bạn đang có việc ở công ty: +10% công.':''}</p>
        ${job?`<div class="jcard" style="margin-bottom:10px">Đang làm: ${job.def.icon} <b>${job.def.name}</b> (${LV[job.lv]}) · ${job.prog()} · ⏱ ${mmss(job.left)}</div>`:''}
        <div class="jlist">${Object.entries(MANUAL).map(([k,d])=>`<div class="jcard"><div style="font-size:30px">${d.icon}</div><b>${d.name}</b><p class="muted" style="min-height:48px">${d.desc}</p>
          ${Object.entries(d.lv).map(([lv,c])=>`<div class="row" style="justify-content:space-between;margin:5px 0"><span><span class="jlv" style="background:${LVC[lv]}">${LV[lv]}</span> ${c.n?`${c.n} ${k==='trash'?'cụm':'món'} · `:''}${mmss(c.t)}</span><button class="btn" data-m="${k}|${lv}">Nhận · ${c.pay} 💰</button></div>`).join('')}</div>`).join('')}</div>`;
      B.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ const [k,lv]=b.dataset.m.split('|'); m.close(); startManual(k,lv); });
    } else if(tab==='brain'){
      const list=DATA.tasks.filter(t=>(fType==='all'||t.type===fType)&&(fLv==='all'||t.level===fLv));
      B.innerHTML=`<p class="muted">Việc trí tuệ của công ty – làm ngay trong game, máy chấm tự động. Dễ ${DATA.pay.easy} · Vừa ${DATA.pay.medium} · Khó ${DATA.pay.hard} 💰 (làm lại bài đã xong: 25%${S.work.job?' · đang có việc công ty: +25%':''}).</p>
        <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">${[['all','Tất cả'],...Object.entries(TY)].map(([k,n])=>`<button class="btn ${k===fType?'on':''}" data-ft="${k}" style="${k===fType?'background:#2f6fd0;color:#fff':''}">${n}</button>`).join('')}
          <span style="width:12px"></span>${[['all','Mọi mức'],...Object.entries(LV)].map(([k,n])=>`<button class="btn" data-fl="${k}" style="${k===fLv?'background:#2f6fd0;color:#fff':''}">${n}</button>`).join('')}</div>
        <div class="jlist">${list.map(t=>`<div class="jcard jitem" data-id="${t.id}"><div class="row" style="justify-content:space-between"><span>${TY[t.type]}</span><span class="jlv" style="background:${LVC[t.level]}">${LV[t.level]}</span></div><b style="display:block;margin:6px 0">${esc(t.title)}</b><div class="row" style="justify-content:space-between"><span>💰 ${fmt(payFor(t))}</span>${S.work.done[t.id]?'<span class="jok">✓ đã làm</span>':''}</div></div>`).join('')}</div>`;
      B.querySelectorAll('[data-ft]').forEach(b=>b.onclick=()=>{ fType=b.dataset.ft; render(m); }); B.querySelectorAll('[data-fl]').forEach(b=>b.onclick=()=>{ fLv=b.dataset.fl; render(m); });
      B.querySelectorAll('[data-id]').forEach(c=>c.onclick=()=>{ const t=DATA.tasks.find(x=>x.id===c.dataset.id); taskView({body:B, close:m.close}, t, ()=>render(m)); });
    } else if(tab==='hire'){
      const w=S.work, cur=company();
      B.innerHTML=`<p>Từ Sprint 2.2 mỗi công ty <b>tự phỏng vấn</b> ở <b>📝 Phòng phỏng vấn – sảnh tầng 1</b> của toà: <b>5 câu hỏi QA/QC</b> (toà 🔒 mức Vừa–Khó), <b>sai 1 câu là trượt</b> (thử lại sau 2 phút). Đậu → nhận thẻ nhân viên, quẹt thẻ chấm công (lương ngày ${'60–120'} 💰), làm ticket trên máy tính ở bàn riêng.</p>
        ${cur?`<div class="jcard" style="margin-bottom:10px">💼 Đang làm ở <b>${esc(cur.name)}</b> từ ${esc(w.job.since)} · thẻ ${esc(w.job.badge||'')} <button class="btn" data-quit style="margin-left:10px">Nghỉ việc</button></div>`:''}
        <div class="jlist">${towers.map(t=>{ const mine=cur&&cur.name===t.name, cool=(w.cool&&w.cool[t.name]||0)>Date.now(); return `<div class="jcard"><b>${t.locked?'🔒':'🏢'} ${esc(t.name)}</b><div class="muted" style="margin:4px 0">${(t.teams||[]).map(k=>({qa:'QA',dev:'Dev',perf:'Performance',sec:'Bảo mật',data:'Data',mobile:'Mobile'})[k]).join(' · ')} · ${Math.round(t.h/3.6)} tầng</div>
          <div style="font-size:12px;margin:6px 0">${W.life&&W.life.interior?esc(W.life.interior.profileOf(t).kind):''}${cool?' · <span class="jbad">vừa trượt, chờ 2 phút</span>':''}</div>
          ${mine?'<span class="jok">✓ Bạn đang làm ở đây</span>':`<button class="btn pri" data-go="${esc(t.name)}">📍 Chỉ đường tới sảnh</button>`}</div>`; }).join('')}</div>`;
      B.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{ const t=towers.find(x=>x.name===b.dataset.go); const mk=marker(t.door.x, t.door.z); setTimeout(()=>scene.remove(mk), 120000); m.close(); toast(`📍 Cột sáng vàng ở cửa ${t.name} – vào sảnh, tới Phòng phỏng vấn (bên phải) bấm E.`, 5000); });
      const q0=B.querySelector('[data-quit]'); if(q0) q0.onclick=()=>ui.confirm('Nghỉ việc?', `Rời ${esc(cur.name)}? Bạn sẽ mất thẻ nhân viên.`, 'Nghỉ việc', ()=>{ w.job=null; w.day=null; save(); W.work && (W.work.updateBadge(), W.work.renderHud()); toast('Đã nghỉ việc.'); render(m); });
      return;
      const req=t=>t.locked ? {ok:w.intellect>=6 && w.hard>=2, txt:`≥ 6 việc trí tuệ (đang ${w.intellect}) & ≥ 2 việc KHÓ (đang ${w.hard})`} : {ok:w.intellect>=2, txt:`≥ 2 việc trí tuệ (đang ${w.intellect})`};
      B.innerHTML=`<p class="muted">Có việc ở công ty: được vào toà “chỉ nhân viên” (🔒), mỗi ngày vào toà công ty được <b>chấm công nhận lương</b> (60 💰, toà bảo mật 120 💰), việc trí tuệ +25%.</p>
        ${cur?`<div class="jcard" style="margin-bottom:10px">💼 Đang làm ở <b>${esc(cur.name)}</b> từ ${esc(w.job.since)} <button class="btn" data-quit style="margin-left:10px">Nghỉ việc</button></div>`:''}
        <div class="jlist">${towers.map(t=>{ const r=req(t), mine=cur&&cur.name===t.name; return `<div class="jcard"><b>${t.locked?'🔒':'🏢'} ${esc(t.name)}</b><div class="muted" style="margin:4px 0">${(t.teams||[]).map(k=>({qa:'QA',dev:'Dev',perf:'Performance',sec:'Bảo mật',data:'Data',mobile:'Mobile'})[k]).join(' · ')} · ${Math.round(t.h/3.6)} tầng</div>
          <div style="font-size:12px;margin:6px 0">Yêu cầu: ${r.txt} ${r.ok?'<span class="jok">✓</span>':''}</div>
          ${mine?'<span class="jok">✓ Bạn đang làm ở đây</span>':`<button class="btn ${r.ok?'pri':''}" data-hire="${esc(t.name)}" ${r.ok&&!cur?'':'disabled'}>${cur?'Đang có việc nơi khác':r.ok?'📝 Nộp hồ sơ & ký hợp đồng':'Chưa đủ điều kiện'}</button>`}</div>`; }).join('')}</div>`;
      B.querySelectorAll('[data-hire]').forEach(b=>b.onclick=()=>{ const t=towers.find(x=>x.name===b.dataset.hire); w.job={company:t.name, since:new Date().toLocaleDateString('vi-VN')}; save(); toast(`🎉 Chúc mừng! Bạn đã được nhận vào ${t.name}${t.locked?' – giờ bảo vệ sẽ cho bạn vào toà':''}. Vào toà mỗi ngày để chấm công nhận lương.`, 5500); render(m); });
      const q=B.querySelector('[data-quit]'); if(q) q.onclick=()=>ui.confirm('Nghỉ việc?', `Rời ${esc(cur.name)}? Bạn sẽ không vào được toà “chỉ nhân viên” nữa.`, 'Nghỉ việc', ()=>{ w.job=null; save(); toast('Đã nghỉ việc.'); });
    } else {
      const w=S.work; const by=Object.entries(TY).map(([k,n])=>`<span class="chip">${n}: ${w.types[k]||0}</span>`).join(' ');
      B.innerHTML=`<div class="jlist"><div class="jcard"><div style="font-size:28px">🧠</div><b>${w.intellect}</b> việc trí tuệ đã hoàn thành<br><span class="muted">trong đó ${w.hard} việc KHÓ</span></div>
        <div class="jcard"><div style="font-size:28px">💪</div><b>${w.manual}</b> việc chân tay</div><div class="jcard"><div style="font-size:28px">💼</div>${company()?`Đang làm ở <b>${esc(company().name)}</b>`:'Chưa có việc ở công ty'}</div></div>
        <p style="margin-top:12px">${by}</p>`;
    }
  }

  return {open, canEnter, onEnter, get active(){ return job; }, load};
}
