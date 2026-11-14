// QC World – S2.2: đi làm ở công ty như thật.
// • Phỏng vấn 5 câu QA/QC (lấy từ data/questions.json) – sai 1 câu là trượt (thử lại sau 2 phút); đậu → hợp đồng + THẺ NHÂN VIÊN đeo trước ngực.
// • Quẹt thẻ ở cổng sảnh = chấm công (lương ngày). Bảng "Việc hôm nay": quẹt thẻ → họp Daily → 3 ticket → email PM → ăn trưa → báo cáo cuối ngày.
// • Máy tính ở bàn làm việc: Jira (chạy test run, log bug, verify bug), Email, Chat nhóm, Báo cáo – toàn bộ là việc giả định, chấm tự động.
export function makeWork(W, L){
  const {THREE, toast, me} = W; const {S, save, ui, addCoins, fmt, jobs, towers, interior} = L;
  const today=()=>new Date().toISOString().slice(0,10);
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  S.work.cool=S.work.cool||{};
  const isEmployee=b=>!!(b && S.work.job && S.work.job.company===b.name);
  const towerOf=name=>towers.find(t=>t.name===name);
  function day(){ if(!S.work.day || S.work.day.date!==today()) S.work.day={date:today(), swipe:false, standup:false, tickets:{}, mail:false, lunch:false, report:false}; return S.work.day; }
  const st=document.createElement('style'); st.textContent=`
    #dayHud{position:fixed;left:14px;top:120px;z-index:6;padding:10px 13px;max-width:330px;font-size:13px;line-height:1.55} #dayHud .dh{opacity:.92} #dayHud .dh.ok{opacity:.55;text-decoration:line-through}
    body.screen-mode #dayHud{display:none}
    .ivopts{display:grid;gap:8px;margin-top:6px} .ivopt{text-align:left;white-space:normal;padding:11px 13px;font-size:15px;line-height:1.4}
    .badgecard{width:210px;margin:12px auto;border-radius:12px;background:#fff;color:#1b2233;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.35);text-align:center;font-family:"Segoe UI",sans-serif}
    .badgecard .top{padding:9px;color:#fff;font-weight:800} .badgecard .ph{width:64px;height:64px;border-radius:50%;margin:10px auto 6px;background:#dfe6f0;font-size:34px;line-height:64px}
    .pc{display:grid;grid-template-columns:150px 1fr;gap:12px;min-height:430px} .pc .side{display:flex;flex-direction:column;gap:6px} .pc .side .btn{text-align:left} .pc .side .btn.on{background:#2f6fd0;color:#fff}
    .pc .main{background:rgba(255,255,255,.04);border-radius:12px;padding:12px;overflow:auto;max-height:62vh}
    .tk{display:flex;gap:10px;align-items:center;padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.06);margin:6px 0;cursor:pointer} .tk:hover{outline:2px solid rgba(255,255,255,.3)}
    .tk .id{font-family:Consolas,monospace;color:#9ad7ff} .steps{width:100%;border-collapse:collapse;font-size:13px} .steps td,.steps th{border:1px solid rgba(255,255,255,.14);padding:6px;vertical-align:top}
    .pf{display:flex;gap:6px} .pf button.on.p{background:#2e7d4f;color:#fff} .pf button.on.f{background:#c0392b;color:#fff}
    .chat p{margin:6px 0} .chat b{color:#9ad7ff}`;
  document.head.appendChild(st);

  /* ============================== THẺ NHÂN VIÊN (đeo trước ngực) ============================== */
  let badge=null;
  function badgeTex(){ const j=S.work.job, t=towerOf(j.company)||{color:0x2f6fd0, short:'QA'}; const c=document.createElement('canvas'); c.width=256; c.height=384; const g=c.getContext('2d');
    g.fillStyle='#fff'; g.fillRect(0,0,256,384); g.fillStyle='#'+t.color.toString(16).padStart(6,'0'); g.fillRect(0,0,256,86); g.fillStyle='#fff'; g.font='800 34px "Segoe UI",sans-serif'; g.textAlign='center'; g.fillText(t.short||'QA',128,56);
    g.fillStyle='#dfe6f0'; g.beginPath(); g.arc(128,150,48,0,7); g.fill(); g.font='56px "Segoe UI Emoji"'; g.fillText('🧑‍💻',128,170);
    g.fillStyle='#1b2233'; g.font='800 30px "Segoe UI",sans-serif'; g.fillText((W.PROFILE&&W.PROFILE.name)||'Nhân viên',128,238); g.fillStyle='#5b6474'; g.font='500 22px "Segoe UI",sans-serif'; g.fillText(j.role||'QA Engineer',128,272);
    g.fillStyle='#111'; for(let x=40;x<216;x+=4+((x*7)%5)) g.fillRect(x,300,2+((x*3)%3),46); g.font='600 18px Consolas,monospace'; g.fillText(j.badge||'',128,372);
    const tx=new THREE.CanvasTexture(c); tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=4; return tx; }
  function updateBadge(){ if(badge){ badge.parent && badge.parent.remove(badge); badge=null; } if(!S.work.job) return;
    let bone=null; me.g.traverse(o=>{ if(o.isBone && !bone && /Spine2$/.test(o.name)) bone=o; }); if(!bone) me.g.traverse(o=>{ if(o.isBone && !bone && /(Spine1|Spine|Chest|Body)$/i.test(o.name)) bone=o; }); if(!bone) return;
    const t=towerOf(S.work.job.company)||{color:0x2f6fd0}; const g=new THREE.Group();
    const card=new THREE.Mesh(new THREE.PlaneGeometry(.07,.105), new THREE.MeshStandardMaterial({map:badgeTex(), roughness:.45, side:THREE.DoubleSide})); card.position.set(0,-.07,0); g.add(card);
    const sm=new THREE.MeshStandardMaterial({color:t.color, roughness:.7}); for(const s of [-1,1]){ const sp=new THREE.Mesh(new THREE.BoxGeometry(.008,.17,.003), sm); sp.position.set(s*.032,.06,-.004); sp.rotation.z=s*.32; g.add(sp); }
    me.g.updateMatrixWorld(true); const wp=bone.getWorldPosition(new THREE.Vector3()), q=me.g.getWorldQuaternion(new THREE.Quaternion()), fwd=new THREE.Vector3(0,0,1).applyQuaternion(q);
    const depth={soldier:.2, xbot:.14, robot:.24}[W.PROFILE&&W.PROFILE.model]||.17; wp.addScaledVector(fwd, depth); wp.y-=.02;
    bone.add(g); g.position.copy(bone.worldToLocal(wp.clone())); g.quaternion.copy(bone.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));
    const ws=bone.getWorldScale(new THREE.Vector3()); g.scale.setScalar(1/ws.x); g.traverse(o=>{ o.castShadow=false; }); badge=g; }
  setTimeout(updateBadge, 400);

  /* ============================== PHỎNG VẤN ============================== */
  let QS=null; const loadQ=()=>QS?Promise.resolve(QS):fetch('data/questions.json',{cache:'no-store'}).then(r=>r.json()).then(d=>(QS=d.questions));
  const TOPIC={qa:['istqb','design','agile','scenario'], dev:['automation','api','db'], perf:['performance'], sec:['security'], data:['db'], mobile:['mobile']};
  const badgeHTML=(b,j)=>`<div class="badgecard"><div class="top" style="background:#${b.color.toString(16).padStart(6,'0')}">${esc(b.short||b.name)}</div><div class="ph">🧑‍💻</div><b>${esc((W.PROFILE&&W.PROFILE.name)||'Bạn')}</b><div class="muted" style="color:#5b6474">${esc(j.role)}</div><div style="font:600 14px Consolas,monospace;margin:8px 0 12px">${esc(j.badge)}</div></div>`;
  function interview(b){
    if(isEmployee(b)) return toast('Bạn đã là nhân viên – quẹt thẻ ở cổng để vào làm nhé!');
    if(S.work.job) return ui.confirm('Bạn đang có việc', `Bạn đang làm ở <b>${esc(S.work.job.company)}</b>. Muốn phỏng vấn ở ${esc(b.name)} thì phải nghỉ việc cũ trước.`, 'Nghỉ việc cũ', ()=>{ S.work.job=null; S.work.day=null; save(); updateBadge(); renderHud(); toast('Đã nghỉ việc cũ. Bấm E ở phòng phỏng vấn để bắt đầu.'); });
    const left=(S.work.cool[b.name]||0)-Date.now(); if(left>0) return toast(`⏳ Bạn vừa trượt phỏng vấn ở đây. Thử lại sau ${Math.ceil(left/1000)} giây – ôn bài ở 🎓 Học viện QA nhé!`, 4200);
    loadQ().then(all=>{
      const tp=new Set((b.teams||['qa']).flatMap(t=>TOPIC[t]||[]).concat(TOPIC.qa)), lvOk=q=>b.locked ? q.level>=2 : q.level<=2;
      let pool=all.filter(q=>tp.has(q.topic) && lvOk(q)); if(pool.length<5) pool=all.filter(lvOk);
      pool=pool.sort(()=>Math.random()-.5).slice(0,5); let i=0;
      const m=ui.modal(`📝 Phỏng vấn · ${b.name}`, {wide:true});
      const intro=()=>{ m.body.innerHTML=`<p>Chào bạn! Mình là HR của <b>${esc(b.name)}</b>. Vị trí: <b>QA Engineer</b>.</p><ul style="line-height:1.7"><li><b>5 câu hỏi QA/QC</b>${b.locked?' (mức Vừa – Khó vì đây là toà bảo mật)':''}.</li><li>Đúng cả 5 câu → <b>nhận việc ngay</b>, cấp thẻ nhân viên + thưởng ký hợp đồng.</li><li>Sai 1 câu → trượt, được phỏng vấn lại sau 2 phút.</li></ul><div class="row" style="justify-content:flex-end;gap:8px"><button class="btn" data-x>Để sau</button><button class="btn pri" data-go>Bắt đầu phỏng vấn</button></div>`;
        m.body.querySelector('[data-x]').onclick=m.close; m.body.querySelector('[data-go]').onclick=ask; };
      const ask=()=>{ const q=pool[i]; m.body.innerHTML=`<div class="row" style="justify-content:space-between"><b>Câu ${i+1}/5</b><span class="muted" style="letter-spacing:3px">${'●'.repeat(i)}${'○'.repeat(5-i)}</span></div><p style="font-size:17px;line-height:1.5;margin:10px 0">${esc(q.q)}</p><div class="ivopts">${q.options.map((o,k)=>`<button class="btn ivopt" data-k="${k}">${String.fromCharCode(65+k)}. ${esc(o)}</button>`).join('')}</div>`;
        m.body.querySelectorAll('[data-k]').forEach(bt=>bt.onclick=()=>{ const k=+bt.dataset.k; if(k===q.answer){ i++; if(i>=5) pass(); else ask(); } else fail(q,k); }); };
      const fail=(q,k)=>{ S.work.cool[b.name]=Date.now()+120000; save();
        m.body.innerHTML=`<div class="jbad" style="font-size:19px">❌ Rất tiếc, bạn chưa đạt (đúng ${i}/5).</div><p style="margin-top:10px">${esc(q.q)}</p><p>Bạn chọn: <b>${esc(q.options[k])}</b><br>Đáp án đúng: <b class="jok">${esc(q.options[q.answer])}</b></p>${q.explain?`<p class="muted">💡 ${esc(q.explain)}</p>`:''}<p>Ôn thêm ở 🎓 Học viện QA rồi quay lại sau 2 phút nhé!</p><div class="row" style="justify-content:flex-end"><button class="btn" data-x>Đóng</button></div>`;
        m.body.querySelector('[data-x]').onclick=m.close; };
      const pass=()=>{ const id=`${String(b.short||'QA').replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase()||'QA'}-${1000+Math.floor(Math.random()*9000)}`;
        S.work.job={company:b.name, since:new Date().toLocaleDateString('vi-VN'), badge:id, role:'QA Engineer'}; S.work.day=null; save(); updateBadge(); renderHud();
        m.body.innerHTML=`<div class="jok" style="font-size:20px">🎉 Chúc mừng! Bạn đã đậu phỏng vấn 5/5.</div><p>Bạn chính thức là <b>QA Engineer</b> của <b>${esc(b.name)}</b>. Đây là thẻ nhân viên của bạn (đã đeo trước ngực):</p>${badgeHTML(b,S.work.job)}
          <p>👉 Ra <b>cổng quẹt thẻ</b> sau quầy lễ tân, bấm <b>E</b> để chấm công rồi lên tầng làm việc. Góc trái màn hình có <b>“Việc hôm nay”</b>.</p><div class="row" style="justify-content:flex-end"><button class="btn pri" data-x>Bắt đầu đi làm</button></div>`;
        m.body.querySelector('[data-x]').onclick=m.close; addCoins(50, '🎁 Thưởng ký hợp đồng 50 💰'); };
      intro();
    }).catch(e=>toast('Không tải được câu hỏi phỏng vấn: '+e.message, 4000));
  }

  /* ============================== LỊCH LÀM VIỆC TRONG NGÀY ============================== */
  const hud=document.createElement('div'); hud.id='dayHud'; hud.className='glass'; hud.hidden=true; document.body.appendChild(hud);
  let curB=null;
  const floorNo=(b, test)=>{ const f=interior && interior.floorsOf(b).find(test); return f?f.n:'?'; };
  function renderHud(){ const j=S.work.job; if(!j || !curB || curB.name!==j.company){ hud.hidden=true; return; } const d=day(), n=Object.keys(d.tickets).length;
    const deptN=floorNo(curB, f=>f.dept===interior.myDept(curB)), canN=floorNo(curB, f=>f.kind==='canteen');
    const items=[[d.swipe,'💳 Quẹt thẻ chấm công (cổng ở sảnh)'],[d.standup,`🗣️ Họp Daily (phòng họp kính tầng ${deptN})`],[n>=3,`💻 Làm 3 ticket trên máy tính (${Math.min(n,3)}/3)`],[d.mail,'📧 Trả lời email của PM'],[d.lunch,`🍱 Ăn trưa ở nhà ăn (tầng ${canN})`],[d.report,'📨 Gửi báo cáo cuối ngày (máy tính)']];
    hud.innerHTML=`<b>📋 Việc hôm nay · ${esc(j.company)}</b>${items.map(([ok,t])=>`<div class="dh ${ok?'ok':''}">${ok?'✅':'⬜'} ${t}</div>`).join('')}<div class="muted" style="font-size:11px;margin-top:4px">Bàn của bạn: tầng ${deptN}, có vòng vàng · thẻ ${esc(j.badge||'')}</div>`; hud.hidden=false; }
  function onFloor(b, fl){ curB=b; renderHud();
    if(b && isEmployee(b) && fl && fl.kind==='lobby' && !day().swipe) setTimeout(()=>toast('💳 Đi làm rồi! Quẹt thẻ ở cổng phía sau quầy lễ tân (E) để chấm công.', 4200), 900); }
  function swipe(b){ const d=day(); const t=new Date().toTimeString().slice(0,5);
    if(!d.swipe){ d.swipe=true; save(); jobs && jobs.onEnter(b); toast(`💳 Bíp! Chấm công lúc ${t}. Chúc một ngày làm việc hiệu quả!`, 3200); } else toast('💳 Bíp! Mời vào.', 1500); renderHud(); }
  function lunch(){ const d=day(); if(!d.lunch){ d.lunch=true; save(); renderHud(); } }

  /* ============================== HỌP DAILY ============================== */
  function standup(b, D){ const d=day(); if(d.standup) return toast('Bạn đã họp Daily hôm nay rồi 👍');
    const P=W.people, nm=k=>P?P.nameOf((Date.now()/864e5|0)*7+k*31):['Minh','Lan','Huy'][k];
    const ups=[[nm(1),'Hôm qua mình xong API giỏ hàng. Hôm nay làm phần mã giảm giá. Không có blocker.'],[nm(2),'Hôm qua mình review 3 PR. Hôm nay fix bug thanh toán High. Cần QA verify chiều nay.'],[nm(3),'Hôm qua mình viết test case màn hình đổi mật khẩu. Hôm nay chạy regression. Blocker: thiếu tài khoản test VIP.']];
    const opts=[['Hôm qua em chạy xong 40 test case luồng thanh toán, log 3 bug (1 High). Hôm nay em verify bug thanh toán của anh Huy và chạy regression giỏ hàng. Blocker: cần dữ liệu khuyến mãi trên STG.',1],
      ['Dạ hôm qua em làm nhiều việc lắm, hôm nay chắc cũng vậy ạ.',0],['Em nghĩ team mình nên đổi framework automation sang cái mới, để em kể chi tiết 20 phút…',0]];
    const m=ui.modal(`🗣️ Daily Standup · ${D?D.name:''}`, {wide:true});
    m.body.innerHTML=`<p class="muted">Mỗi người trả lời 3 câu: <b>Hôm qua làm gì? Hôm nay làm gì? Có vướng mắc (blocker) không?</b> – tối đa 1–2 phút.</p>${ups.map(([n,t])=>`<div class="tk" style="cursor:default"><b>${esc(n)}:</b> ${esc(t)}</div>`).join('')}
      <p style="margin-top:12px"><b>Tới lượt bạn:</b></p><div class="ivopts">${opts.sort(()=>Math.random()-.5).map(([t,ok])=>`<button class="btn ivopt" data-ok="${ok}">${esc(t)}</button>`).join('')}</div><div class="jout"></div>`;
    m.body.querySelectorAll('[data-ok]').forEach(bt=>bt.onclick=()=>{ const ok=bt.dataset.ok==='1'; d.standup=true; save(); renderHud();
      m.body.querySelector('.jout').innerHTML = ok ? `<p class="jok">👍 Lead: “Rõ ràng, ngắn gọn! Phần dữ liệu STG để anh nhờ Dev chuẩn bị.” (+15 💰)</p>` : `<p class="jbad">😅 Lead: “Em nói cụ thể hơn nhé: hôm qua – hôm nay – blocker, mỗi ý 1 câu.”</p>`;
      if(ok) addCoins(15); m.body.querySelectorAll('[data-ok]').forEach(x=>x.disabled=true); setTimeout(()=>m.close(), 2600); }); }

  /* ============================== VIỆC GIẢ ĐỊNH TRÊN MÁY TÍNH ============================== */
  const RUN=[
    {t:'Chạy test run: Đăng nhập', steps:[['Mở trang đăng nhập','Hiện form Email + Mật khẩu + nút Đăng nhập','Hiện form Email + Mật khẩu + nút Đăng nhập'],['Nhập email & mật khẩu đúng → Đăng nhập','Vào trang chủ, hiện tên người dùng','Vào trang chủ, hiện tên người dùng'],['Nhập sai mật khẩu 5 lần liên tiếp','Khoá tài khoản 15 phút, hiện thông báo','Vẫn cho nhập tiếp lần thứ 6, không khoá'],['Bấm “Quên mật khẩu”','Gửi email đặt lại mật khẩu','Gửi email đặt lại mật khẩu']]},
    {t:'Chạy test run: Giỏ hàng', steps:[['Thêm 1 sản phẩm 100.000đ vào giỏ','Giỏ hiện 1 sản phẩm, tổng 100.000đ','Giỏ hiện 1 sản phẩm, tổng 100.000đ'],['Tăng số lượng lên 2','Tổng 200.000đ','Tổng 200.000đ'],['Xoá sản phẩm khỏi giỏ','Giỏ trống, hiện “Giỏ hàng trống”, tổng 0đ','Giỏ trống nhưng tổng vẫn hiện 200.000đ'],['Nhập mã giảm giá đã hết hạn','Báo “Mã đã hết hạn”','Báo “Mã đã hết hạn”']]},
    {t:'Chạy test run: Tìm kiếm sản phẩm', steps:[['Tìm “vitamin”','Danh sách sản phẩm có chữ vitamin','Danh sách sản phẩm có chữ vitamin'],['Bấm tìm khi ô trống','Nhắc nhập từ khoá, không gọi API','Gọi API, trả về toàn bộ 5.000 sản phẩm'],['Tìm “VITAMIN” (chữ hoa)','Kết quả giống tìm chữ thường','Không có kết quả nào'],['Tìm chuỗi <script>','Hiển thị như chữ thường, không chạy script','Hiển thị như chữ thường, không chạy script']]},
    {t:'Chạy test run: Đổi mật khẩu', steps:[['Mật khẩu mới 6 ký tự','Báo lỗi: tối thiểu 8 ký tự','Báo lỗi: tối thiểu 8 ký tự'],['Nhập lại mật khẩu không khớp','Báo lỗi “Mật khẩu không khớp”','Báo lỗi “Mật khẩu không khớp”'],['Đổi mật khẩu hợp lệ','Đổi thành công, đăng xuất các thiết bị khác','Đổi thành công nhưng thiết bị khác vẫn đăng nhập'],['Đăng nhập bằng mật khẩu cũ','Không đăng nhập được','Không đăng nhập được']]},
    {t:'Chạy test run: Upload ảnh đại diện', steps:[['Upload ảnh JPG 1MB','Upload thành công, hiện ảnh mới','Upload thành công, hiện ảnh mới'],['Upload ảnh PNG 6MB','Báo lỗi: tối đa 5MB','Upload thành công'],['Upload file .exe','Báo lỗi định dạng không hỗ trợ','Báo lỗi định dạng không hỗ trợ']]},
  ];
  const BUG=[
    {t:'Log bug: trừ tiền 2 lần', story:'Khi thanh toán bằng ví điện tử, tài khoản khách bị trừ tiền 2 lần nhưng hệ thống chỉ tạo 1 đơn hàng. Xảy ra 3/10 lần thử trên STG.', sev:'Critical', pri:'P1', comp:'Thanh toán', why:'Mất tiền của khách → Critical, phải sửa ngay (P1).'},
    {t:'Log bug: logo lệch 2px', story:'Logo ở trang “Giới thiệu” lệch 2px sang trái so với thiết kế Figma. Không ảnh hưởng chức năng.', sev:'Low', pri:'P4', comp:'Giao diện', why:'Lỗi thẩm mỹ rất nhỏ → Low, ưu tiên thấp.'},
    {t:'Log bug: Excel lỗi font', story:'Xuất báo cáo doanh thu ra Excel thì chữ tiếng Việt có dấu hiện thành “?”. Số liệu vẫn đúng.', sev:'Medium', pri:'P3', comp:'Báo cáo', why:'Sai hiển thị nhưng số liệu đúng, có cách đọc khác → Medium.'},
    {t:'Log bug: trang đăng nhập lỗi 500', story:'Sau bản cập nhật sáng nay trên STG, mọi người dùng đăng nhập đều gặp lỗi 500.', sev:'Critical', pri:'P1', comp:'Đăng nhập', why:'Chặn toàn bộ người dùng → Critical/P1.'},
    {t:'Log bug: không lưu được tên có dấu', story:'Form hồ sơ: bấm “Lưu” không có phản hồi khi tên có dấu tiếng Việt (VD: “Nguyễn Văn Á”). Tên không dấu lưu bình thường.', sev:'High', pri:'P2', comp:'Hồ sơ người dùng', why:'Chức năng chính hỏng với nhiều người dùng Việt → High.'},
  ];
  const COMPS=['Đăng nhập','Thanh toán','Giỏ hàng','Báo cáo','Giao diện','Hồ sơ người dùng'];
  const VERIFY=[
    {t:'Verify bug: tên có dấu', bug:'Không lưu được tên có dấu', dev:'Dev: đã sửa encoding UTF-8 ở API lưu hồ sơ.', re:'Tên “Nguyễn Văn Á”: lưu OK ✔ · Tên 50 ký tự có dấu: OK ✔ · Tên rỗng: báo lỗi đúng ✔', ans:'Close', why:'Đã kiểm tra cả trường hợp biên, đều đúng → đóng bug.'},
    {t:'Verify bug: mã giảm giá dùng 2 lần', bug:'Mã giảm giá áp dụng được 2 lần cho 1 đơn', dev:'Dev: đã chặn áp mã lần 2.', re:'Áp mã lần 2 trên cùng tab: bị chặn ✔ · Mở 2 tab cùng lúc: vẫn áp được 2 lần ✘', ans:'Reopen', why:'Còn lỗi ở trường hợp đồng thời → mở lại bug, ghi rõ bước tái hiện.'},
    {t:'Verify bug: chữ nút hơi nhạt', bug:'Chữ trên nút “Mua ngay” nhạt hơn mockup', dev:'Dev: theo brand guideline mới, PO đã đồng ý giữ nguyên.', re:'—', ans:"Won't fix", why:'PO quyết định giữ nguyên → đóng với trạng thái Won’t fix.'},
    {t:'Verify bug: crash khi mất mạng', bug:'App crash khi mất mạng lúc thanh toán', dev:'Dev: bắt lỗi mạng, hiện thông báo thử lại.', re:'Tắt wifi khi thanh toán: hiện thông báo, không crash ✔ · Bật lại mạng: đơn tạo đúng 1 lần ✔', ans:'Close', why:'Cả 2 tình huống đều đúng → đóng.'},
    {t:'Verify bug: tìm kiếm hoa/thường', bug:'Tìm kiếm phân biệt chữ hoa / thường', dev:'Dev: đã chuyển từ khoá về chữ thường.', re:'“VITAMIN” ra kết quả ✔ · “Vitamin C ” (có dấu cách cuối): không ra kết quả ✘', ans:'Reopen', why:'Chưa trim khoảng trắng → mở lại.'},
  ];
  const MAILS=[
    {from:'PM Hằng', sub:'Lỗi trên PROD', body:'Khách báo lỗi thanh toán trên PROD. Em vào PROD test thử luôn được không?', opts:[['Ok chị, em vào PROD chạy thử ngay.',0],['Em không test trên PROD ạ. Em tái hiện trên STG với dữ liệu tương tự, có kết quả em báo chị trong 1 giờ.',1],['Lỗi trên PROD là việc của Dev, em không liên quan.',0]]},
    {from:'Team Lead', sub:'Regression tối nay', body:'Release tối nay có kịp test regression không em?', opts:[['Kịp hết ạ!',0],['Full regression cần 4 tiếng. Nếu chỉ có 2 tiếng, em chạy smoke + luồng thanh toán/đăng nhập trước và ghi rõ rủi ro phần còn lại.',1],['Không kịp đâu, dời release đi anh.',0]]},
    {from:'PM Hằng', sub:'Works on my machine', body:'Dev bảo bug của em “works on my machine”. Em xử lý sao?', opts:[['Đóng bug cho nhanh.',0],['Em gửi thêm bước tái hiện chi tiết, môi trường, log và video; hẹn Dev 10 phút xem cùng trên STG.',1],['Báo sếp là Dev lười.',0]]},
  ];
  const CHAT=[['Huy (Dev)','Build mới lên STG rồi nha QA 🚀'],['Lan (QA)','Ok, mình chạy smoke liền.'],['PM Hằng','Chiều 3h demo cho khách, mọi người nhớ nha'],['Minh (QA)','Ai có tài khoản test VIP cho mình xin với 🙏'],['Huy (Dev)','Đã gửi trong DM nha']];
  function tickets(b){ const k=(new Date().getDate()+b.name.length)>>>0; return [{id:`QA-${400+k%90}`, kind:'run', d:RUN[k%RUN.length]},{id:`QA-${510+k%80}`, kind:'bug', d:BUG[(k+2)%BUG.length]},{id:`QA-${620+k%70}`, kind:'verify', d:VERIFY[(k+1)%VERIFY.length]}]; }
  const PAY=30;
  function doneTicket(id, ok, out, msg){ const d=day(); if(ok && !d.tickets[id]){ d.tickets[id]=1; save(); addCoins(PAY, `✅ Xong ticket ${id} (+${PAY} 💰)`); renderHud(); }
    out.innerHTML = ok ? `<p class="jok">✅ ${esc(msg||'Chính xác!')} ${d.tickets[id]?'':''}</p>` : `<p class="jbad">❌ ${esc(msg||'Chưa đúng, xem lại nhé.')}</p>`; }
  function ticketView(B, tk, back){ const d=tk.d, done=day().tickets[tk.id];
    let h=`<div class="row" style="gap:8px;margin-bottom:8px"><button class="btn" data-back>← Jira</button><b><span class="id">${tk.id}</span> · ${esc(d.t)}</b>${done?'<span class="jok">✓ Done</span>':''}</div>`;
    if(tk.kind==='run'){ h+=`<p class="muted">So sánh <b>Kết quả mong đợi</b> với <b>Kết quả thực tế</b> rồi đánh dấu Pass / Fail cho từng bước.</p><table class="steps"><tr><th>#</th><th>Bước</th><th>Mong đợi</th><th>Thực tế</th><th>Kết quả</th></tr>${d.steps.map((s,i)=>`<tr><td>${i+1}</td><td>${esc(s[0])}</td><td>${esc(s[1])}</td><td>${esc(s[2])}</td><td><div class="pf" data-i="${i}"><button class="btn" data-v="p">Pass</button><button class="btn" data-v="f">Fail</button></div></td></tr>`).join('')}</table><div class="row" style="margin-top:10px"><button class="btn pri" data-sub>✅ Hoàn thành test run</button></div><div class="jout"></div>`; }
    else if(tk.kind==='bug') h+=`<div class="tk" style="cursor:default">🐞 ${esc(d.story)}</div><div class="row" style="gap:10px;flex-wrap:wrap;margin:10px 0"><label>Severity <select class="inp" data-f="sev">${['','Critical','High','Medium','Low'].map(x=>`<option>${x}</option>`).join('')}</select></label><label>Priority <select class="inp" data-f="pri">${['','P1','P2','P3','P4'].map(x=>`<option>${x}</option>`).join('')}</select></label><label>Component <select class="inp" data-f="comp">${['',...COMPS].map(x=>`<option>${x}</option>`).join('')}</select></label></div><button class="btn pri" data-sub>🐞 Tạo bug</button><div class="jout"></div>`;
    else h+=`<div class="tk" style="cursor:default;display:block"><b>Bug:</b> ${esc(d.bug)}<br><b>${esc(d.dev)}</b><br><b>Kết quả test lại:</b> ${esc(d.re)}</div><p>Chuyển trạng thái bug thành:</p><div class="row" style="gap:8px">${['Close','Reopen',"Won't fix"].map(x=>`<button class="btn" data-ans="${x}">${x}</button>`).join('')}</div><div class="jout"></div>`;
    B.innerHTML=h; const out=B.querySelector('.jout'); B.querySelector('[data-back]').onclick=back;
    if(tk.kind==='run'){ const val={}; B.querySelectorAll('.pf').forEach(pf=>pf.querySelectorAll('button').forEach(bt=>bt.onclick=()=>{ val[pf.dataset.i]=bt.dataset.v; pf.querySelectorAll('button').forEach(x=>x.classList.toggle('on', x===bt)); bt.classList.add(bt.dataset.v); }));
      B.querySelector('[data-sub]').onclick=()=>{ if(Object.keys(val).length<d.steps.length) return doneTicket(tk.id,false,out,'Còn bước chưa đánh dấu.'); const wrong=d.steps.filter((s,i)=>(s[1]===s[2]?'p':'f')!==val[i]).length;
        doneTicket(tk.id, !wrong, out, wrong?`Sai ${wrong} bước – bước nào thực tế khác mong đợi thì là Fail (và cần log bug).`:`Test run xong: ${d.steps.filter(s=>s[1]!==s[2]).length} bước Fail → đã gắn bug cho Dev.`); }; }
    else if(tk.kind==='bug') B.querySelector('[data-sub]').onclick=()=>{ const f=k=>B.querySelector(`[data-f=${k}]`).value; if(!f('sev')||!f('pri')||!f('comp')) return doneTicket(tk.id,false,out,'Điền đủ Severity, Priority, Component.');
        const pd=Math.abs(+f('pri').slice(1)-+d.pri.slice(1)), ok=f('sev')===d.sev && f('comp')===d.comp && pd<=1; doneTicket(tk.id, ok, out, ok?`Bug đã tạo. ${d.why}`:`Chưa hợp lý: ${d.why} (Component: ${d.comp})`); };
    else B.querySelectorAll('[data-ans]').forEach(bt=>bt.onclick=()=>doneTicket(tk.id, bt.dataset.ans===d.ans, out, d.why)); }
  function openPC(b){ if(!isEmployee(b)) return toast('Máy tính này của nhân viên công ty.'); const d=day(); if(!d.swipe){ d.swipe=true; save(); jobs && jobs.onEnter(b); }
    const m=ui.modal(`💻 Máy tính làm việc · ${b.name}`, {wide:true}); let app='jira';
    const mail=MAILS[(new Date().getDate()+b.name.length)%MAILS.length];
    const render=()=>{ const n=Object.keys(d.tickets).length;
      m.body.innerHTML=`<div class="pc"><div class="side">${[['jira','📋 Jira'],['mail',`📧 Email${d.mail?'':' (1)'}`],['chat','💬 Chat nhóm'],['report','📨 Báo cáo ngày'],['brain','🧠 Việc trí tuệ']].map(([k,t])=>`<button class="btn ${k===app?'on':''}" data-app="${k}">${t}</button>`).join('')}<div class="muted" style="font-size:12px;margin-top:auto">Ticket hôm nay: ${n}/3<br>Mỗi ticket +${PAY} 💰</div></div><div class="main" id="pcMain"></div></div>`;
      m.body.querySelectorAll('[data-app]').forEach(x=>x.onclick=()=>{ app=x.dataset.app; render(); });
      const B=m.body.querySelector('#pcMain');
      if(app==='jira'){ B.innerHTML=`<b>📋 Sprint 24 · Việc được giao cho bạn</b>${tickets(b).map(t=>`<div class="tk" data-tk="${t.id}"><span class="id">${t.id}</span><span>${esc(t.d.t)}</span><span class="sp" style="flex:1"></span>${d.tickets[t.id]?'<span class="jok">✓ Done</span>':'<span class="muted">To do</span>'}</div>`).join('')}`;
        B.querySelectorAll('[data-tk]').forEach(x=>x.onclick=()=>ticketView(B, tickets(b).find(t=>t.id===x.dataset.tk), render)); }
      else if(app==='mail'){ B.innerHTML=`<b>📧 Hộp thư</b><div class="tk" style="display:block;cursor:default"><b>${esc(mail.from)}</b> · ${esc(mail.sub)}<p>${esc(mail.body)}</p></div>${d.mail?'<p class="jok">✓ Bạn đã trả lời email này.</p>':`<p>Chọn câu trả lời:</p><div class="ivopts">${mail.opts.map(([t,ok],i)=>`<button class="btn ivopt" data-mi="${i}">${esc(t)}</button>`).join('')}</div>`}<div class="jout"></div>`;
        B.querySelectorAll('[data-mi]').forEach(x=>x.onclick=()=>{ const ok=mail.opts[+x.dataset.mi][1]; const out=B.querySelector('.jout'); if(ok){ d.mail=true; save(); renderHud(); addCoins(20); out.innerHTML='<p class="jok">✅ Trả lời chuyên nghiệp! PM: “Cảm ơn em 👍” (+20 💰)</p>'; setTimeout(render,1600); } else out.innerHTML='<p class="jbad">🤔 Câu này chưa ổn – nghĩ tới quy trình chuẩn & giao tiếp lịch sự nhé.</p>'; }); }
      else if(app==='chat') B.innerHTML=`<b>💬 #team-qa</b><div class="chat">${CHAT.map(([n,t])=>`<p><b>${esc(n)}:</b> ${esc(t)}</p>`).join('')}</div>`;
      else if(app==='report'){ const ready=d.swipe && n>=3; B.innerHTML=`<b>📨 Báo cáo cuối ngày</b><div class="tk" style="display:block;cursor:default">✔ Chấm công: ${d.swipe?'có':'chưa'}<br>✔ Họp Daily: ${d.standup?'có':'chưa'}<br>✔ Ticket hoàn thành: ${n}/3 (${tickets(b).filter(t=>d.tickets[t.id]).map(t=>t.id).join(', ')||'—'})<br>✔ Email PM: ${d.mail?'đã trả lời':'chưa'}</div>
          ${d.report?'<p class="jok">✓ Đã gửi báo cáo hôm nay. Hẹn gặp lại ngày mai!</p>':`<button class="btn pri" data-rep ${ready?'':'disabled'}>📨 Gửi báo cáo cho Lead</button> ${ready?'':'<span class="muted">Cần chấm công + xong 3 ticket.</span>'}`}<div class="jout"></div>`;
        const rb=B.querySelector('[data-rep]'); if(rb) rb.onclick=()=>{ d.report=true; save(); renderHud(); const t=towerOf(b.name), bonus=(t&&t.locked)?150:100, perfect=d.standup&&d.mail&&d.lunch; addCoins(bonus+(perfect?50:0), `📨 Đã gửi báo cáo ngày – thưởng ${bonus}${perfect?' + 50 (ngày làm việc hoàn hảo)':''} 💰`); render(); }; }
      else { B.innerHTML='<p>Việc trí tuệ của công ty (SQL, API, tìm bug theo spec, thiết kế test, code JS) – chấm tự động, nhân viên được +25% công.</p><button class="btn pri" data-op>🧠 Mở danh sách việc</button>'; B.querySelector('[data-op]').onclick=()=>{ m.close(); jobs && jobs.open('brain'); }; }
    };
    render(); }

  return {interview, swipe, lunch, standup, openPC, onFloor, isEmployee, day, updateBadge, renderHud};
}
