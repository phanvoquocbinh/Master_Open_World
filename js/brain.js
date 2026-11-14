// QC World – QA Brain (Tháp Brand QA·QC·QE): phân tích tài liệu yêu cầu → sinh test case (chạy offline bằng heuristic)
export function makeBrain(W, ui){
  const {store, openTool, toast} = W;
  const KEY='qcworld-brain';
  const RISK=[['thanh toán','Thanh toán'],['payment','Thanh toán'],['otp','OTP / SMS'],['sms','OTP / SMS'],['khuyến mãi','Khuyến mãi'],['promotion','Khuyến mãi'],['voucher','Khuyến mãi'],
    ['tồn kho','Tồn kho'],['stock','Tồn kho'],['mật khẩu','Bảo mật'],['password','Bảo mật'],['token','Bảo mật'],['phân quyền','Phân quyền'],['permission','Phân quyền'],
    ['đơn hàng','Đơn hàng'],['order','Đơn hàng'],['giá','Giá'],['price','Giá'],['đồng bộ','Đồng bộ dữ liệu'],['sync','Đồng bộ dữ liệu'],['prod','Môi trường PROD']];
  const VAGUE=['nhanh','chậm','thân thiện','hợp lý','phù hợp','tốt','dễ dùng','khoảng','tầm','v.v','vv','etc','tbd','sau này','có thể','linh hoạt','tối ưu','đẹp','mượt'];
  const REQ=/(phải|cần|bắt buộc|không được|cho phép|chỉ được|tối đa|tối thiểu|ít nhất|khi |nếu |must|should|shall|allow|required|only)/i;

  function analyze(text){
    const sents=text.replace(/\r/g,'').split(/(?<=[.!?。])\s+|\n+/).map(s=>s.replace(/^[-*•\d.)\s]+/,'').trim()).filter(s=>s.length>3);
    const reqs=sents.filter(s=>REQ.test(s));
    const low=text.toLowerCase();
    const risks=[...new Set(RISK.filter(([k])=>low.includes(k)).map(([,v])=>v))];
    const vague=[]; for(const s of sents){ const hit=VAGUE.filter(w=>new RegExp(`(^|[^\\p{L}])${w.replace('.','\\.')}([^\\p{L}]|$)`,'iu').test(s)); if(hit.length) vague.push({s, hit}); }
    // giá trị số / khoảng
    const ranges=[];
    const pat=[
      [/từ\s*(\d+(?:[.,]\d+)?)\s*(?:đến|tới|-|–)\s*(\d+(?:[.,]\d+)?)\s*([\p{L}%]*)/giu, m=>({min:+m[1].replace(',','.'), max:+m[2].replace(',','.'), unit:m[3]})],
      [/(\d+(?:[.,]\d+)?)\s*(?:-|–|~)\s*(\d+(?:[.,]\d+)?)\s*([\p{L}%]*)/giu, m=>({min:+m[1].replace(',','.'), max:+m[2].replace(',','.'), unit:m[3]})],
      [/(?:tối đa|không quá|max(?:imum)?|<=|≤)\s*(\d+(?:[.,]\d+)?)\s*([\p{L}%]*)/giu, m=>({max:+m[1].replace(',','.'), unit:m[2]})],
      [/(?:tối thiểu|ít nhất|min(?:imum)?|>=|≥)\s*(\d+(?:[.,]\d+)?)\s*([\p{L}%]*)/giu, m=>({min:+m[1].replace(',','.'), unit:m[2]})],
    ];
    for(const s of sents) for(const [re,fn] of pat){ re.lastIndex=0; let m; while((m=re.exec(s))){ const r=fn(m); r.src=s; if(!ranges.some(x=>x.src===s && x.min===r.min && x.max===r.max)) ranges.push(r); } }
    // trường dữ liệu: "Tên trường:" hoặc trong ngoặc kép
    const fields=[...new Set([...text.matchAll(/["“']([^"”']{2,40})["”']/g)].map(m=>m[1]).concat([...text.matchAll(/^\s*[-*•]?\s*([\p{L}\s]{2,30}):/gmu)].map(m=>m[1].trim())))].slice(0,30);
    return {sents:sents.length, reqs, risks, vague, ranges, fields, at:Date.now()};
  }
  function genCases(a){
    const out=[]; let n=1; const id=()=>'TC-'+String(n++).padStart(3,'0');
    for(const r of a.reqs.slice(0,60)){
      out.push({id:id(), title:'Kiểm tra: '+r.slice(0,90), steps:'Thực hiện đúng luồng mô tả trong yêu cầu', data:'Dữ liệu hợp lệ', expect:'Hệ thống đáp ứng đúng: '+r.slice(0,120), tech:'Use case / positive'});
      if(/không được|chỉ được|bắt buộc|required|must/i.test(r)) out.push({id:id(), title:'Vi phạm ràng buộc: '+r.slice(0,80), steps:'Cố tình làm sai điều kiện trong yêu cầu', data:'Dữ liệu vi phạm', expect:'Bị chặn, hiển thị thông báo lỗi rõ ràng, dữ liệu không thay đổi', tech:'Negative'});
    }
    for(const g of a.ranges){
      const u=g.unit?(' '+g.unit):'', step=(Number.isInteger(g.min??0) && Number.isInteger(g.max??0)) ? 1 : 0.01;
      const vals=[]; if(g.min!=null){ vals.push([g.min-step,'ngoài biên dưới','Từ chối']); vals.push([g.min,'biên dưới','Chấp nhận']); }
      if(g.max!=null){ vals.push([g.max,'biên trên','Chấp nhận']); vals.push([+(g.max+step).toFixed(2),'ngoài biên trên','Từ chối']); }
      if(g.min!=null && g.max!=null) vals.push([+((g.min+g.max)/2).toFixed(2),'giá trị đại diện (EP hợp lệ)','Chấp nhận']);
      for(const [v,lbl,ex] of vals) out.push({id:id(), title:`Giá trị ${v}${u} (${lbl})`, steps:'Nhập giá trị vào trường liên quan: '+g.src.slice(0,70), data:`${v}${u}`, expect:ex, tech:lbl.includes('EP')?'EP':'BVA'});
    }
    for(const f of a.fields.slice(0,15)){ out.push({id:id(), title:`Trường "${f}" để trống`, steps:`Bỏ trống "${f}" rồi lưu/gửi`, data:'(rỗng)', expect:'Báo lỗi nếu trường bắt buộc; nếu không bắt buộc thì lưu thành công', tech:'Negative'});
      out.push({id:id(), title:`Trường "${f}" có ký tự đặc biệt / emoji / tiếng Việt có dấu`, steps:`Nhập "Ñgùyễn <b>😀' OR 1=1" vào "${f}"`, data:"Ñgùyễn <b>😀' OR 1=1", expect:'Không lỗi hiển thị, không XSS/SQLi, lưu và hiển thị đúng', tech:'Error guessing / Security'}); }
    for(const r of a.risks) out.push({id:id(), title:`Rủi ro ${r}: kiểm thử hồi quy trọng điểm`, steps:`Chạy bộ regression liên quan ${r}`, data:'Dữ liệu DEV', expect:'Không phát sinh lỗi; log/DB đúng', tech:'Risk-based'});
    return out;
  }
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function csv(rows){ const head=['ID','Tiêu đề','Bước','Dữ liệu','Kỳ vọng','Kỹ thuật']; const q=v=>'"'+String(v).replace(/"/g,'""')+'"';
    return '﻿'+[head.map(q).join(','), ...rows.map(r=>[r.id,r.title,r.steps,r.data,r.expect,r.tech].map(q).join(','))].join('\r\n'); }

  function open(){
    const st=store.get(KEY,{text:'', a:null});
    const m=ui.modal('🧠 QA Brain · Tháp Brand QA·QC·QE', {wide:true});
    const tabs=[['doc','📄 Phân tích tài liệu'],['tc','🧪 Test case'],['run','▶️ Tự test'],['road','🗺️ Lộ trình']];
    let cur='doc';
    const bar=document.createElement('div'); bar.className='tabs'; m.body.appendChild(bar);
    const pane=document.createElement('div'); m.body.appendChild(pane);
    const render=()=>{ bar.innerHTML=''; for(const [k,l] of tabs){ const b=document.createElement('button'); b.className='btn'+(k===cur?' on':''); b.textContent=l; b.onclick=()=>{cur=k; render();}; bar.appendChild(b); } views[cur](); };
    const views={
      doc(){ pane.innerHTML=`<p class="muted">Dán nội dung tài liệu yêu cầu (BRD/SRS/user story) hoặc chọn file <b>.txt .md .csv .json</b>. Với PDF/Word: mở file, copy nội dung rồi dán vào đây. Mọi xử lý chạy trên máy bạn.</p>
        <textarea class="inp" id="bzText" placeholder="VD: Mật khẩu phải từ 8 đến 32 ký tự. Khi khách nhập sai OTP quá 5 lần thì khóa 15 phút…"></textarea>
        <div class="row" style="margin-top:8px"><input type="file" id="bzFile" accept=".txt,.md,.csv,.json" class="inp" style="max-width:300px"><div class="sp"></div><button class="btn pri" id="bzGo">🔍 Phân tích</button></div><div id="bzOut" style="margin-top:12px"></div>`;
        const ta=pane.querySelector('#bzText'); ta.value=st.text||'';
        pane.querySelector('#bzFile').onchange=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ ta.value=String(r.result); }; r.readAsText(f,'utf-8'); };
        const show=a=>{ if(!a) return; const o=pane.querySelector('#bzOut');
          o.innerHTML=`<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
            <div class="card"><small>Số câu</small><b style="font-size:24px">${a.sents}</b></div><div class="card"><small>Yêu cầu nhận diện</small><b style="font-size:24px">${a.reqs.length}</b></div>
            <div class="card"><small>Giá trị biên</small><b style="font-size:24px">${a.ranges.length}</b></div><div class="card"><small>Điểm mơ hồ</small><b style="font-size:24px;color:#ffcf7a">${a.vague.length}</b></div></div>
            ${a.risks.length?`<h3>⚠️ Vùng rủi ro cao</h3><div class="row" style="flex-wrap:wrap">${a.risks.map(r=>`<span class="tag warn">${esc(r)}</span>`).join('')}</div>`:''}
            ${a.vague.length?`<h3>❓ Cần hỏi lại BA (từ ngữ mơ hồ)</h3><ul>${a.vague.slice(0,20).map(v=>`<li>${esc(v.s)} <span class="tag warn">${esc(v.hit.join(', '))}</span></li>`).join('')}</ul>`:''}
            <h3>📌 Yêu cầu nhận diện</h3><ol>${a.reqs.slice(0,40).map(r=>`<li>${esc(r)}</li>`).join('')||'<li>Chưa thấy câu yêu cầu rõ ràng.</li>'}</ol>
            ${a.ranges.length?`<h3>📏 Giá trị biên</h3><ul>${a.ranges.map(g=>`<li>${g.min??'–'} → ${g.max??'–'} ${esc(g.unit||'')} <small class="muted">(${esc(g.src.slice(0,80))})</small></li>`).join('')}</ul>`:''}
            <button class="btn pri" id="bzToTc" style="margin-top:8px">🧪 Sinh test case →</button>`;
          o.querySelector('#bzToTc').onclick=()=>{ cur='tc'; render(); }; };
        pane.querySelector('#bzGo').onclick=()=>{ const t=ta.value.trim(); if(!t){ toast('Hãy dán nội dung tài liệu trước.'); return; } st.text=t; st.a=analyze(t); store.set(KEY,st); show(st.a); W.lifeReward && W.lifeReward('brain'); };
        show(st.a);
      },
      tc(){ if(!st.a){ pane.innerHTML='<p>Chưa có phân tích. Qua tab <b>📄 Phân tích tài liệu</b> trước.</p>'; return; }
        const rows=genCases(st.a);
        pane.innerHTML=`<div class="row"><b>${rows.length} test case</b> <small class="muted">(EP · BVA · Negative · Error guessing · Risk-based)</small><div class="sp"></div><button class="btn" id="bzCsv">⬇️ Xuất CSV</button></div>
          <div style="overflow:auto;max-height:55vh;margin-top:10px"><table class="tc"><tr><th>ID</th><th>Tiêu đề</th><th>Bước</th><th>Dữ liệu</th><th>Kỳ vọng</th><th>Kỹ thuật</th></tr>
          ${rows.map(r=>`<tr><td>${r.id}</td><td>${esc(r.title)}</td><td>${esc(r.steps)}</td><td>${esc(r.data)}</td><td>${esc(r.expect)}</td><td>${esc(r.tech)}</td></tr>`).join('')}</table></div>`;
        pane.querySelector('#bzCsv').onclick=()=>{ const b=new Blob([csv(rows)],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='testcases_qabrain.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); };
      },
      run(){ pane.innerHTML=`<p class="muted">Chạy test thật bằng các tool của Master Dashboard (chỉ môi trường DEV – theo quy tắc của team):</p>
        <div class="grid">${[['⚙️','API Client','Gọi API, chạy Chuỗi chạy','/#/m/apiclient'],['🤖','Automation','JMeter + test tự động','/automation'],['🗄️','Database','SQL Editor, Custom Query','/#/m/db'],['📋','Plan','Tạo việc từ test case','/#/m/plan']]
          .map(([i,n,d,u])=>`<div class="card"><div class="ic">${i}</div><b>${n}</b><small>${d}</small><button class="btn" data-u="${u}" data-n="${n}" data-i="${i}">Mở</button></div>`).join('')}</div>`;
        pane.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{ m.close(); openTool({icon:b.dataset.i, name:b.dataset.n, sub:'Từ QA Brain', url:b.dataset.u}); });
      },
      road(){ pane.innerHTML=`<p>Lộ trình để Tháp Brand QA·QC·QE thành “bộ não” tự động của team:</p><ol style="line-height:1.8">
        <li>✅ Phân tích tài liệu cục bộ: yêu cầu, biên, từ mơ hồ, vùng rủi ro (đang có).</li>
        <li>✅ Sinh test case EP/BVA/Negative + xuất CSV (đang có).</li>
        <li>⏳ Nối AI chạy local qua Master Dashboard (khóa API để ở máy, không lộ ra web) để đọc PDF/Word, hiểu ngữ cảnh nghiệp vụ Bình Phan.</li>
        <li>⏳ Tự sinh kịch bản API Client / JMeter từ test case, chạy trên DEV, ghi kết quả.</li>
        <li>⏳ Báo cáo tự động + tạo việc Plan cho bug, theo dõi trong thế giới (NPC báo tin).</li></ol>`; },
    };
    render();
  }
  return {open, analyze, genCases};
}
