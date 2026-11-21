// QC World – 🛡️ BẢNG ADMIN (S19g, 21/11/2026) – công cụ test nhanh, CHỈ cho máy / nhân vật của người tạo thế giới (Bình).
//
//  QUYỀN (không có PIN / hash nào trong mã nguồn hay trên GitHub):
//   • Lần đầu bấm F8: chỉ được ĐẶT PIN khi game chạy ở 127.0.0.1/localhost VÀ serve.py báo máy này có thư mục Master Dashboard cạnh thư mục game
//     (/api/md/available – chỉ máy của Bình có). Máy người khác: F8 không làm gì, không có nút, không có giao diện.
//   • PIN lưu dạng PBKDF2-SHA256 (muối ngẫu nhiên 16 byte, 210.000 vòng) trong localStorage 'qcworld-admin-v1' của trình duyệt trên máy đó.
//   • Mở khoá theo phiên; tuỳ chọn "giữ 12 giờ". Sai 5 lần → khoá 60 giây. Đổi PIN / gỡ quyền khỏi máy ở thẻ 🔒.
//   • Nhiều người chơi: bảng chỉ chạy trên máy mình, KHÔNG gửi gì qua multiplayer; server (multiplayer_server.py) không có lệnh nào tác động người khác.
//  MỞ: F8 (hoặc nút 🛡️ trên thanh trên cùng – chỉ hiện ở máy đã đặt PIN). Esc / F8 / ✕ để đóng.
//  TÍNH NĂNG: tiền (đặt / về 0 có xác nhận / miễn phí mọi khoản chi / mở khoá đồ) · bay tự do (Space lên, Z xuống, Shift ×3) · đi xuyên tường ·
//   bất tử (không té xe) · tốc độ chạy ×1–5 · tốc độ xe ×1–5 · dịch chuyển tới địa điểm / toạ độ / tâm màn hình / điểm đã lưu · giờ trong ngày ·
//   thời tiết (W.weather: mây, mưa, mưa to, sương – âm thanh mưa của ambience_world.js nghe theo) · ẩn bot · tắt giao thông ·
//   HUD toạ độ + FPS + lượt vẽ · hiện va chạm quanh mình · sự kiện thế giới (W.events) · thông số render.
export function makeAdmin(W){
  if(W.ADMIN) return W.ADMIN;
  const {THREE, HOOK, P, me, cam, scene, toast} = W;
  const LS={rec:'qcworld-admin-v1', sess:'qcworld-admin-sess', lock:'qcworld-admin-lock', marks:'qcworld-admin-marks', tab:'qcworld-admin-tab'};
  const lsGet=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } };
  const lsSet=(k,v)=>{ try{ if(v==null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  const fmtN=n=>Math.round(n).toLocaleString('vi-VN');
  const A={unlocked:false, open:false, fly:false, ghost:false, god:false, hud:false, col:false, flySpeed:25, runMul:1, carMul:1, free:false, freeBase:null,
    botsHidden:false, trafficOff:false, weather:'clear', tab:lsGet(LS.tab)||'me'};
  W.ADMIN=A;

  /* ============================== 1. QUYỀN: PIN (PBKDF2) + chỉ máy chủ thế giới ============================== */
  const enc=new TextEncoder(), hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''), unhex=h=>new Uint8Array(h.match(/../g).map(x=>parseInt(x,16)));
  const canCrypto=()=>!!(window.isSecureContext && window.crypto && crypto.subtle);
  const isLocal=()=>['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname);
  async function derive(pin, saltHex, it){ const key=await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
    return hex(await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:unhex(saltHex), iterations:it}, key, 256)); }
  async function ownerMachine(){ if(!isLocal() || !canCrypto()) return false; try{ const r=await fetch('/api/md/available', {cache:'no-store'}); if(!r.ok) return false; return !!(await r.json()).available; }catch(e){ return false; } }
  const rec=()=>lsGet(LS.rec);
  const sessOK=()=>{ const r=rec(), s=lsGet(LS.sess); return !!(r && s && s.exp>Date.now() && s.k===r.hash.slice(0,16)); };
  const lockLeft=()=>{ const l=lsGet(LS.lock); return l && l.until>Date.now() ? Math.ceil((l.until-Date.now())/1000) : 0; };
  async function setPin(pin){ const salt=hex(crypto.getRandomValues(new Uint8Array(16))), it=210000, hash=await derive(pin, salt, it); lsSet(LS.rec, {v:1, salt, it, hash, created:Date.now()}); lsSet(LS.sess, null); }
  async function checkPin(pin){ const r=rec(); if(!r) return false; return (await derive(pin, r.salt, r.it))===r.hash; }
  function remember(on){ const r=rec(); lsSet(LS.sess, on && r ? {exp:Date.now()+12*3600e3, k:r.hash.slice(0,16)} : null); }

  /* ============================== 2. GIAO DIỆN (theo threejs-game-ui-designer: khối gọn, nhãn rõ, trạng thái hover/nhấn/focus) ============================== */
  const css=document.createElement('style'); css.id='admCss'; css.textContent=`
#admPanel,#admGate,#admHud{--ac:#f5b942;--ac2:#ffd27a;--bg:rgba(12,17,26,.94);--ln:rgba(255,255,255,.13);--tx:#eef2f8;--mu:#9aa6b8;font-family:"Segoe UI",system-ui,sans-serif;color:var(--tx);-webkit-font-smoothing:antialiased}
#admPanel{position:fixed;right:16px;top:116px;width:368px;max-height:calc(100vh - 132px);display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--ln);border-top:3px solid var(--ac);border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.45);z-index:40}
#admPanel[hidden],#admGate[hidden],#admHud[hidden]{display:none}
.admHead{display:flex;align-items:center;gap:8px;padding:10px 12px 8px}
.admHead b{font-size:15px;font-weight:800;letter-spacing:.2px;flex:1}.admHead .admK{font:700 11px/1 "Segoe UI";color:#1b2233;background:var(--ac);padding:3px 6px;border-radius:3px}
.admX{background:none;border:0;color:var(--tx);font-size:18px;width:32px;height:32px;border-radius:6px;cursor:pointer}.admX:hover{background:rgba(255,255,255,.08)}
.admTabs{display:grid;grid-template-columns:repeat(6,1fr);gap:2px;padding:0 8px 8px;border-bottom:1px solid var(--ln)}
.admTab{display:grid;justify-items:center;gap:1px;padding:6px 0 5px;background:rgba(255,255,255,.035);border:1px solid transparent;border-radius:6px;color:var(--mu);cursor:pointer;font:600 10.5px/1.2 "Segoe UI"}
.admTab i{font-style:normal;font-size:17px;line-height:1.1}.admTab:hover{color:var(--tx);background:rgba(255,255,255,.07)}
.admTab[aria-selected=true]{color:#1b2233;background:var(--ac);border-color:var(--ac)}
.admBody{overflow:auto;padding:10px 12px 14px;display:grid;gap:12px}
.admSec{display:grid;gap:6px}.admSec h4{margin:0;font:800 11.5px/1 "Segoe UI";color:var(--ac2);text-transform:uppercase;letter-spacing:.6px;display:flex;align-items:center;gap:6px}
.admSec h4::after{content:"";flex:1;height:1px;background:var(--ln)}
.admRow{display:flex;align-items:center;gap:8px;min-height:36px}.admRow>span{flex:1;font-size:13.5px;font-weight:600}.admRow small{display:block;color:var(--mu);font-weight:500;font-size:11.5px}
.admSw{width:46px;height:26px;border-radius:13px;border:1px solid var(--ln);background:#2a3240;position:relative;cursor:pointer;flex:none;padding:0}
.admSw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#c9d2de;transition:left .12s,background .12s}
.admSw[aria-checked=true]{background:#3a2f14;border-color:var(--ac)}.admSw[aria-checked=true]::after{left:23px;background:var(--ac)}
.admSw:focus-visible,.admB:focus-visible,.admTab:focus-visible,.admIn:focus-visible{outline:2px solid #ffd23f;outline-offset:1px}
.admB{min-height:34px;padding:0 11px;border:1px solid var(--ln);border-radius:6px;background:rgba(255,255,255,.06);color:var(--tx);font:700 12.5px "Segoe UI";cursor:pointer;white-space:nowrap}
.admB:hover{background:rgba(255,255,255,.12)}.admB:active{transform:translateY(1px)}.admB:disabled{opacity:.4;cursor:default}
.admB.pri{background:var(--ac);border-color:var(--ac);color:#1b2233}.admB.pri:hover{background:var(--ac2)}.admB.bad{border-color:#e0566a;color:#ffb3be}.admB.bad:hover{background:rgba(224,86,106,.18)}
.admGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.admGrid2{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.admIn{min-height:34px;padding:0 9px;border:1px solid var(--ln);border-radius:6px;background:#0c121b;color:var(--tx);font:600 13px "Segoe UI";font-variant-numeric:tabular-nums;width:100%;box-sizing:border-box}
.admSl{display:grid;grid-template-columns:1fr auto;gap:2px 8px;align-items:center}.admSl span{font-size:13px;font-weight:600}.admSl output{font:800 13px "Segoe UI";font-variant-numeric:tabular-nums;color:var(--ac2);min-width:4.5ch;text-align:right}
.admSl input{grid-column:1/3;width:100%;accent-color:var(--ac)}
.admList{display:grid;gap:2px;max-height:230px;overflow:auto;border:1px solid var(--ln);border-radius:6px;padding:3px}
.admItem{display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:6px;align-items:center;min-height:34px;padding:2px 6px;border-radius:5px;cursor:pointer;font-size:12.5px;font-weight:600}
.admItem:hover{background:rgba(255,255,255,.08)}.admItem i{font-style:normal;text-align:center}.admItem em{font-style:normal;color:var(--mu);font-size:11px;font-variant-numeric:tabular-nums}
.admItem b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
.admNote{font-size:11.5px;color:var(--mu);line-height:1.4}.admStat{font:600 12px "Segoe UI";font-variant-numeric:tabular-nums;color:var(--tx);line-height:1.55;white-space:pre-line;overflow-wrap:anywhere}
.admEv{display:grid;gap:4px}.admEv .admB{white-space:normal;text-align:left;line-height:1.3;padding:6px 10px}
#admGate{position:fixed;inset:0;display:grid;place-items:center;background:rgba(5,10,20,.5);z-index:46}
#admGate .admCard{width:min(360px,calc(100vw - 32px));background:var(--bg);border:1px solid var(--ln);border-top:3px solid var(--ac);border-radius:10px;padding:16px;display:grid;gap:10px;box-shadow:0 14px 40px rgba(0,0,0,.5)}
#admGate h3{margin:0;font-size:16px;font-weight:800}#admGate .admMsg{min-height:18px;font-size:12.5px;color:#ffb3be;font-weight:600}
#admGate label{font-size:12.5px;color:var(--mu);font-weight:600;display:grid;gap:4px}#admGate .admChk{display:flex;align-items:center;gap:8px;color:var(--tx)}
#admHud{position:fixed;left:16px;top:96px;z-index:39;background:rgba(10,14,22,.82);border:1px solid var(--ln);border-left:3px solid var(--ac);border-radius:0 8px 8px 0;padding:7px 10px;pointer-events:none;
  font:700 12.5px/1.5 "Segoe UI";font-variant-numeric:tabular-nums;white-space:pre}
#admBtn{border-color:var(--ac,#f5b942)!important}
@media (max-width:860px){ #admPanel{left:8px;right:8px;width:auto;top:auto;bottom:8px;max-height:62vh} .admTab{padding:8px 0} }`;
  document.head.appendChild(css);
  const el=(tag, attrs={}, kids=[])=>{ const e=document.createElement(tag); for(const [k,v] of Object.entries(attrs)){ if(k==='text') e.textContent=v; else if(k.startsWith('on')) e[k]=v; else if(v!==false && v!=null) e.setAttribute(k, v===true?'':v); } for(const c of [].concat(kids)) if(c) e.append(c); return e; };

  /* ---------- cổng PIN ---------- */
  const gate=el('div', {id:'admGate', hidden:true});
  document.body.appendChild(gate);
  function closeGate(){ gate.hidden=true; gate.innerHTML=''; W.canvas && W.canvas.focus(); }
  function openGate(mode){   // 'setup' | 'unlock' | 'change'
    gate.innerHTML=''; const msg=el('div', {class:'admMsg'}), inputs=[], keep=el('input', {type:'checkbox'});
    const field=(label)=>{ const i=el('input', {class:'admIn', type:'password', inputmode:'numeric', autocomplete:'off', maxlength:'32'}); inputs.push(i); return el('label', {}, [label, i]); };
    const title=mode==='setup' ? '🛡️ Đặt mã PIN admin (lần đầu)' : mode==='change' ? '🔑 Đổi mã PIN admin' : '🛡️ Mở bảng admin';
    const note=mode==='setup' ? 'PIN chỉ lưu dạng mã băm trên trình duyệt của máy này – không nằm trong mã nguồn, không lên GitHub. Ít nhất 4 ký tự.' : '';
    const kids=[el('h3', {text:title})]; if(note) kids.push(el('div', {class:'admNote', text:note}));
    if(mode==='change') kids.push(field('PIN hiện tại'));
    kids.push(field(mode==='unlock' ? 'Mã PIN' : 'PIN mới')); if(mode!=='unlock') kids.push(field('Nhập lại PIN mới'));
    if(mode!=='change') kids.push(el('label', {class:'admChk'}, [keep, 'Giữ mở khoá trên máy này 12 giờ']));
    const ok=el('button', {class:'admB pri', text:mode==='setup' ? 'Lưu PIN & mở' : mode==='change' ? 'Đổi PIN' : 'Mở khoá'}), no=el('button', {class:'admB', text:'Thôi'});
    kids.push(msg, el('div', {class:'admGrid2'}, [no, ok]));
    const card=el('div', {class:'admCard', role:'dialog', 'aria-modal':'true', 'aria-label':title}, kids); gate.append(card); gate.hidden=false; setTimeout(()=>inputs[0].focus(), 30);
    no.onclick=closeGate; gate.onkeydown=e=>{ if(e.key==='Escape'){ e.stopPropagation(); closeGate(); } else if(e.key==='Enter'){ e.preventDefault(); ok.click(); } };
    ok.onclick=async()=>{ const wait=lockLeft(); if(wait){ msg.textContent=`Sai nhiều lần – thử lại sau ${wait} giây.`; return; }
      const v=inputs.map(i=>i.value); ok.disabled=true; msg.textContent='';
      try{
        if(mode==='setup'){ if(v[0].length<4){ msg.textContent='PIN cần ít nhất 4 ký tự.'; return; } if(v[0]!==v[1]){ msg.textContent='2 lần nhập không khớp.'; return; }
          if(!(await ownerMachine())){ msg.textContent='Chỉ đặt được trên máy của người tạo thế giới.'; return; }
          await setPin(v[0]); remember(keep.checked); unlock(); closeGate(); toast('🛡️ Đã đặt PIN admin cho máy này. Mở bảng: F8.', 3500); }
        else if(mode==='change'){ if(!(await checkPin(v[0]))){ bad(msg); return; } if(v[1].length<4 || v[1]!==v[2]){ msg.textContent='PIN mới chưa hợp lệ hoặc 2 lần không khớp.'; return; }
          await setPin(v[1]); A.unlocked=true; closeGate(); toast('🔑 Đã đổi PIN admin.', 2500); }
        else { if(!(await checkPin(v[0]))){ bad(msg); return; } lsSet(LS.lock, null); remember(keep.checked); unlock(); closeGate(); }
      } finally { ok.disabled=false; } };
  }
  function bad(msg){ const l=lsGet(LS.lock)||{n:0, until:0}; l.n=(l.n||0)+1; if(l.n>=5){ l.n=0; l.until=Date.now()+60e3; } lsSet(LS.lock, l); msg.textContent=l.until>Date.now() ? 'Sai 5 lần – khoá 60 giây.' : `Sai PIN (${l.n}/5).`; }
  function unlock(){ A.unlocked=true; addTopBtn(); openPanel(); }
  function lock(){ A.unlocked=false; remember(false); closePanel(); toast('🔒 Đã khoá bảng admin.', 2000); }

  /* ---------- nút trên thanh trên cùng: chỉ máy đã đặt PIN ---------- */
  let topBtn=null;
  function addTopBtn(){ if(topBtn || !rec()) return; const bm=document.getElementById('bMap'); if(!bm || !bm.parentElement) return;
    topBtn=el('button', {class:'btn', id:'admBtn', title:'Bảng admin (F8)'}, [el('span', {class:'key', text:'F8'}), ' 🛡️ Admin']); topBtn.onclick=()=>toggle(); bm.parentElement.appendChild(topBtn); }
  if(rec()) addTopBtn();

  /* ---------- bảng chính ---------- */
  const panel=el('div', {id:'admPanel', hidden:true, role:'dialog', 'aria-label':'Bảng admin'}); document.body.appendChild(panel);
  const TABS=[['me','👤','Nhân vật'],['move','🧭','Đi lại'],['world','🌍','Thế giới'],['money','💰','Kinh tế'],['debug','🛠️','Debug'],['sec','🔒','Bảo mật']];
  const head=el('div', {class:'admHead'}, [el('b', {text:'🛡️ Bảng admin'}), el('span', {class:'admK', text:'F8'}), el('button', {class:'admX', title:'Đóng (Esc · F8)', 'aria-label':'Đóng', text:'✕', onclick:()=>closePanel()})]);
  const tabs=el('div', {class:'admTabs', role:'tablist'}), body=el('div', {class:'admBody'}); panel.append(head, tabs, body);
  for(const [k,ic,lb] of TABS){ const b=el('button', {class:'admTab', role:'tab', 'data-k':k, 'aria-selected':String(A.tab===k)}, [el('i', {text:ic}), lb]); b.onclick=()=>{ A.tab=k; lsSet(LS.tab, k); render(); }; tabs.append(b); }
  const sec=(t, ...kids)=>el('div', {class:'admSec'}, [el('h4', {text:t}), ...kids]);
  const syncers=[];   // cập nhật trạng thái nút gạt khi thay đổi từ bên ngoài (vd. lên xe làm tắt chế độ bay)
  const sw=(label, hint, get, set)=>{ const b=el('button', {class:'admSw', role:'switch', 'aria-label':label}); const s=()=>b.setAttribute('aria-checked', String(!!get())); s(); syncers.push(s);
    b.onclick=()=>{ set(!get()); s(); }; return el('div', {class:'admRow'}, [el('span', {}, [label, hint ? el('small', {text:hint}) : null]), b]); };
  const slider=(label, min, max, step, get, set, f=v=>v)=>{ const o=el('output'), i=el('input', {type:'range', min, max, step, value:get(), 'aria-label':label}); const s=()=>{ o.textContent=f(+i.value); };
    i.oninput=()=>{ set(+i.value); s(); }; s(); syncers.push(()=>{ if(document.activeElement!==i){ i.value=get(); s(); } }); return el('div', {class:'admSl'}, [el('span', {text:label}), o, i]); };
  const btn=(label, fn, cls='')=>el('button', {class:'admB '+cls, text:label, onclick:fn});
  function render(){ syncers.length=0; body.innerHTML=''; for(const b of tabs.children) b.setAttribute('aria-selected', String(b.dataset.k===A.tab)); (PAGES[A.tab]||PAGES.me)(); }
  function openPanel(){ if(!A.unlocked) return; A.open=true; panel.hidden=false; render(); }
  function closePanel(){ A.open=false; panel.hidden=true; W.canvas && W.canvas.focus(); }
  function toggle(){ if(A.open){ closePanel(); return; } if(A.unlocked || sessOK()){ A.unlocked=true; addTopBtn(); openPanel(); return; } openGateFor(); }
  async function openGateFor(){ if(rec()){ openGate('unlock'); return; } if(await ownerMachine()) openGate('setup'); }   // máy khác: im lặng, không lộ gì

  /* ============================== 3. NHÂN VẬT: bay tự do · xuyên tường · bất tử · tốc độ chạy ============================== */
  const KEYS={};
  const L=()=>W.life, V=()=>W.life && W.life.V;
  const fwd=()=>[-Math.sin(cam.yaw), -Math.cos(cam.yaw), Math.cos(cam.yaw), -Math.sin(cam.yaw)];
  const FLY={ admin:'fly', drive(dt, inp){ const sp=A.flySpeed*(inp.boost?3:1), [fx,fz,rx,rz]=fwd(); let mx=fx*inp.iz+rx*inp.ix, mz=fz*inp.iz+rz*inp.ix; const n=Math.hypot(mx,mz); if(n>0){ mx/=n; mz/=n; }
      let my=0; if(inp.free){ if(KEYS.Space) my+=1; if(KEYS.KeyZ) my-=1; }
      P.x+=mx*sp*dt; P.z+=mz*sp*dt; P.y=Math.max(-40, P.y+my*sp*.7*dt); P.vx=P.vz=P.vy=0; P.ground=false; P.dancing=false; P.speed=n>0?sp:0;
      if(n>0) P.face=Math.atan2(mx,mz); me.g.position.set(P.x,P.y,P.z); me.g.rotation.set(0, W.lerpAngle(me.g.rotation.y, P.face, 1-Math.exp(-dt*10)), 0); me.play(n>0||my ? 'run' : 'idle'); } };
  const GHOST={ admin:'ghost', drive(dt, inp){ const sp=(inp.boost?3.4:1.35)*HOOK.speedMul(), [fx,fz,rx,rz]=fwd(); let mx=fx*inp.iz+rx*inp.ix, mz=fz*inp.iz+rz*inp.ix; const n=Math.hypot(mx,mz); if(n>0){ mx/=n; mz/=n; }
      P.x+=mx*sp*dt; P.z+=mz*sp*dt; const gy=W.groundAtY(P.x, P.z, P.y); P.y=W.lerp(P.y, gy, 1-Math.exp(-dt*18)); P.vx=P.vz=P.vy=0; P.ground=true; P.dancing=false; P.speed=n>0?sp:0;
      if(n>0) P.face=Math.atan2(mx,mz); me.g.position.set(P.x,P.y,P.z); me.g.rotation.set(0, W.lerpAngle(me.g.rotation.y, P.face, 1-Math.exp(-dt*14)), 0); me.play(n>0 ? (sp>2.3?'run':'walk') : 'idle'); } };
  function leaveRide(){ const v=V(); if(v && v.riding && v.riding()) v.dismount(); }
  function setMove(kind, on){ if(on){ leaveRide(); HOOK.vehicle=kind==='fly' ? FLY : GHOST; A.fly=kind==='fly'; A.ghost=kind==='ghost'; if(kind==='fly'){ P.y+=.4; } }
    else { if(HOOK.vehicle===FLY || HOOK.vehicle===GHOST){ HOOK.vehicle=null; P.ground=false; P.vy=0; } A.fly=A.ghost=false; } }
  let baseMul=HOOK.speedMul, myMul=null;
  function applyRun(){ if(A.runMul===1){ if(myMul && HOOK.speedMul===myMul) HOOK.speedMul=baseMul; myMul=null; return; }
    if(!myMul || HOOK.speedMul!==myMul){ baseMul=HOOK.speedMul; myMul=()=>baseMul()*A.runMul; HOOK.speedMul=myMul; } }
  // tốc độ xe người chơi lái (vehicles.js đọc W.SPEED mỗi khung): giữ nguyên xe bot (botCar)
  const SPD0=W.SPEED ? {...W.SPEED} : null;
  function applyCar(){ const k=A.carMul;
    if(k===1){ if(SPD0) Object.assign(W.SPEED, SPD0); else delete W.SPEED; return; }
    const b=SPD0||{car:1, moto:1, bike:1, bus:1, rail:1};
    W.SPEED=Object.assign(W.SPEED||{bus:1, rail:1}, {car:b.car*k, moto:b.moto*k, bike:b.bike*k, botCar:b.botCar ?? b.car}); }

  /* ============================== 4. THẾ GIỚI: dịch chuyển · giờ · thời tiết · bot · giao thông ============================== */
  const marks=()=>lsGet(LS.marks)||[];
  function tpXZ(x, z){ if(!isFinite(x) || !isFinite(z)) return; if(A.fly || A.ghost) setMove('fly', false); W.teleport(x, z, x, z-10); }
  function lookTarget(){ const rc=new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(0,0), W.camera); rc.far=1500;
    const hit=rc.intersectObjects(scene.children, true).find(h=>h.object.visible && !h.object.isSprite && !h.object.isSkinnedMesh && h.object!==W.water && !(h.object.userData && h.object.userData.dynamic) && h.object.type!=='Points' && h.object.type!=='LineSegments');
    return hit ? hit.point : null; }
  // thời tiết: nhân hệ số lên ánh sáng / sương HIỆN TẠI (giờ trong ngày đổi → chụp lại nền rồi nhân tiếp) + mưa (vạch rơi tính trong shader, bám quanh camera)
  const WX={clear:{n:'☀️ Nắng', sun:1, hemi:1, fog:1, rain:0, col:null}, cloudy:{n:'⛅ Nhiều mây', sun:.55, hemi:.88, fog:.75, rain:0, col:0xb7c1ca},
    rain:{n:'🌧️ Mưa', sun:.35, hemi:.72, fog:.5, rain:.65, col:0x96a2ad}, storm:{n:'⛈️ Mưa to', sun:.2, hemi:.55, fog:.35, rain:1, col:0x6c7782}, fog:{n:'🌫️ Sương mù', sun:.6, hemi:.9, fog:.16, rain:0, col:0xc9d0d6}};
  W.weather=W.weather||{kind:'clear', rain:0};
  // setTime() (phím N) ghi lại nắng / trời / MÀU sương nhưng không đụng khoảng sương → khoảng sương gốc chỉ chụp 1 lần, trả lại khi về Nắng
  let wxBase=null, fogNF=null, wxSun=-1, rain=null;
  function captureBase(){ wxBase={sun:W.sun.intensity, hemi:W.hemi.intensity, col:scene.fog.color.getHex()}; if(!fogNF) fogNF={near:scene.fog.near, far:scene.fog.far}; }
  function applyWeather(){ const w=WX[A.weather]||WX.clear; if(!wxBase) captureBase();
    W.sun.intensity=wxBase.sun*w.sun; W.hemi.intensity=wxBase.hemi*w.hemi; scene.fog.near=fogNF.near*w.fog; scene.fog.far=Math.max(scene.fog.near+40, fogNF.far*w.fog);
    scene.fog.color.setHex(wxBase.col); if(w.col!=null) scene.fog.color.lerp(new THREE.Color(w.col), .6*(1-(W.night||0)*.7));
    wxSun=W.sun.intensity; W.weather.kind=A.weather; W.weather.rain=w.rain; setRain(w.rain);
    if(A.weather==='clear'){ wxBase=null; fogNF=null; } }   // đã trả nguyên trạng
  function setRain(k){ if(!k){ if(rain) rain.visible=false; return; }
    if(!rain){ const N=W.QUAL==='low' ? 1600 : 3000, pos=new Float32Array(N*6), seed=new Float32Array(N*6), endp=new Float32Array(N*2);
      for(let i=0;i<N;i++){ const s=[Math.random(), Math.random(), Math.random()]; for(let j=0;j<2;j++){ seed.set(s, (i*2+j)*3); endp[i*2+j]=j; } }
      const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('seed', new THREE.BufferAttribute(seed,3)); g.setAttribute('endp', new THREE.BufferAttribute(endp,1));
      const m=new THREE.ShaderMaterial({transparent:true, depthWrite:false, uniforms:{uCam:{value:new THREE.Vector3()}, uT:{value:0}, uA:{value:.4}, uCol:{value:new THREE.Color(0xc8d6e4)}},
        vertexShader:`uniform vec3 uCam;
uniform float uT;
uniform float uA;
attribute vec3 seed;
attribute float endp;
varying float vA;
void main(){
  float B=70.0;
  float H=36.0;
  vec3 p;
  p.x=uCam.x+(fract((seed.x*B-uCam.x)/B)-0.5)*B;
  p.z=uCam.z+(fract((seed.z*B-uCam.z)/B)-0.5)*B;
  p.y=uCam.y-12.0+fract(seed.y-uT*0.52)*H;
  p.y-=endp*0.55;
  p.x+=endp*0.06;
  vA=uA*(1.0-endp*0.65);
  gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0);
}`,
        fragmentShader:`uniform vec3 uCol;
varying float vA;
void main(){
  gl_FragColor=vec4(uCol, vA);
}`});
      rain=new THREE.LineSegments(g, m); rain.frustumCulled=false; rain.renderOrder=4; rain.userData.dynamic=true; rain.userData.noFar=true; rain.userData.farR2=0; rain.castShadow=rain.receiveShadow=false; rain.userData.n=N; scene.add(rain); }
    rain.visible=true; rain.geometry.setDrawRange(0, Math.round(rain.userData.n*2*Math.min(1,k))); rain.material.uniforms.uA.value=.28+.3*k; }
  // bot / giao thông
  // chỉ trả lại những nhân vật do bảng này ẩn (nhân vật vốn đang ẩn – vd. khách đi vắng – giữ nguyên)
  const hidByMe=new Set();
  function hideBots(on){ A.botsHidden=on; const ACT=W.ACTORS;
    if(on){ if(ACT) for(const a of ACT){ if(a===me || !a.g || !a.g.visible) continue; a.g.visible=false; hidByMe.add(a); } }
    else { for(const a of hidByMe) if(a.g) a.g.visible=true; hidByMe.clear(); } }
  function setTraffic(off){ A.trafficOff=off; const T=W.traffic; if(T && T.setEnabled){ T.setEnabled(!off); }
    else if(T && T.cars){ for(const c of T.cars){ const o=c.g||c.obj||c.mesh; if(o) o.visible=!off; } }
    const PD=W.pedestrians||W.peds; if(PD && PD.setEnabled) PD.setEnabled(!off); }   // ?v1: người đi bộ dọc phố (pedestrians.js)

  /* ============================== 5. KINH TẾ ============================== */
  const wallet=()=>{ const e=document.getElementById('wallet'); if(e && L()) e.textContent=`💰 ${fmtN(L().S.coins)}`; };
  function setCoins(n){ if(!L()) return; const S=L().S; S.coins=Math.max(0, Math.min(9.99e9, Math.round(n))); L().save(); wallet(); }
  function confirmBox(text, onOk){ gate.innerHTML=''; const ok=btn('Đồng ý', ()=>{ closeGate(); onOk(); }, 'bad'), no=btn('Thôi', closeGate);
    gate.append(el('div', {class:'admCard', role:'alertdialog', 'aria-modal':'true'}, [el('h3', {text:'Xác nhận'}), el('div', {class:'admStat', text}), el('div', {class:'admGrid2'}, [no, ok])])); gate.hidden=false;
    gate.onkeydown=e=>{ if(e.key==='Escape'){ e.stopPropagation(); closeGate(); } }; setTimeout(()=>no.focus(), 30); }
  function setFree(on){ if(!L()) return; const S=L().S; if(on){ A.freeBase=S.coins; A.free=true; setCoins(999999999); } else { A.free=false; if(A.freeBase!=null) setCoins(A.freeBase); A.freeBase=null; } }
  function unlockAll(){ if(!L()) return; const {S, ITEMS, save}=L(); const DAY=864e5; let n=0;
    for(const it of (ITEMS||[])){ if(it.kind==='perm'){ if(!S.inv[it.id]) n++; S.inv[it.id]=1; } else if(it.kind==='day'){ S.buffs[it.id]=Math.max(S.buffs[it.id]||0, Date.now()+DAY); n++; } else if(it.kind==='stack'){ S.inv[it.id]=(S.inv[it.id]||0)+5; n++; } }
    for(const v of ['car','bike','bicycle']) S.inv[v]=1; save(); toast(`🔓 Đã mở khoá ${n} món + ô tô, xe máy, xe đạp (vé ngày: 24 giờ).`, 3500); }

  /* ============================== 6. DEBUG: HUD · va chạm quanh mình ============================== */
  const hud=el('div', {id:'admHud', hidden:true, 'aria-live':'off'}); document.body.appendChild(hud);
  let fN=0, fT=0, fps=0, hudT=0;
  const zoneName=(x,z)=>{ if(W.inside) return '🏢 '+(W.inside.name||'trong nhà'); const Z=W.V2 && W.V2ZONES ? Object.values(W.V2ZONES).find(q=>x>=q.x0&&x<=q.x1&&z>=q.z0&&z<=q.z1) : null; return Z ? Z.name.split(' – ')[0] : (W.V2 ? 'ngoài vùng' : (W.regionAt ? W.regionAt(x,z) : '')); };
  let colObj=null, colAt=null, colT=0;
  function buildColliders(){ const R=35, pos=[], cols=[], push=(a,b,c)=>{ pos.push(a[0],a[1],a[2], b[0],b[1],b[2]); cols.push(...c, ...c); }, y=P.y+.08;
    const near=(x,z,r=0)=>Math.abs(x-P.x)<R+r && Math.abs(z-P.z)<R+r;
    const CY=[0,.9,1], OR=[1,.6,.1], MG=[1,.3,.9], GR=[.3,1,.45];
    for(const c of (W.circles||[])){ if(c.owner || !near(c.x,c.z,c.r)) continue; for(let i=0;i<16;i++){ const a0=i/16*Math.PI*2, a1=(i+1)/16*Math.PI*2; push([c.x+Math.cos(a0)*c.r, y, c.z+Math.sin(a0)*c.r], [c.x+Math.cos(a1)*c.r, y, c.z+Math.sin(a1)*c.r], CY); } }
    for(const b of (W.boxes||[])){ if(b.x0>1e8 || !(b.x1>P.x-R && b.x0<P.x+R && b.z1>P.z-R && b.z0<P.z+R)) continue; const q=[[b.x0,b.z0],[b.x1,b.z0],[b.x1,b.z1],[b.x0,b.z1]]; for(let i=0;i<4;i++){ const p=q[i], r=q[(i+1)%4]; push([p[0],y,p[1]],[r[0],y,r[1]], OR); } }
    for(const s of (W.SEGS||[])){ if(!near((s.ax+s.bx)/2, (s.az+s.bz)/2, Math.hypot(s.bx-s.ax, s.bz-s.az)/2)) continue; const dx=s.bx-s.ax, dz=s.bz-s.az, l=Math.hypot(dx,dz)||1, nx=-dz/l*s.r, nz=dx/l*s.r;
      push([s.ax+nx,y,s.az+nz],[s.bx+nx,y,s.bz+nz], MG); push([s.ax-nx,y,s.az-nz],[s.bx-nx,y,s.bz-nz], MG); }
    for(const p of (W.plats||[])){ if(p.t!=='r' || !near(p.x,p.z,Math.max(p.hw,p.hd))) continue; const q=[[-p.hw,-p.hd],[p.hw,-p.hd],[p.hw,p.hd],[-p.hw,p.hd]].map(([lx,lz])=>[p.x+lx*p.c+lz*p.s, p.h+.03, p.z-lx*p.s+lz*p.c]);
      for(let i=0;i<4;i++) push(q[i], q[(i+1)%4], GR); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cols,3));
    if(!colObj){ colObj=new THREE.LineSegments(g, new THREE.LineBasicMaterial({vertexColors:true, depthTest:false, transparent:true, opacity:.9})); colObj.frustumCulled=false; colObj.renderOrder=9; colObj.userData.dynamic=true; colObj.userData.noFar=true; scene.add(colObj); }
    else { colObj.geometry.dispose(); colObj.geometry=g; } colObj.visible=true; colAt=[P.x,P.z]; return pos.length/6; }
  function setCol(on){ A.col=on; if(on) buildColliders(); else if(colObj) colObj.visible=false; }

  /* ============================== 7. CÁC THẺ ============================== */
  const num=(ph, v)=>el('input', {class:'admIn', type:'number', step:'any', placeholder:ph, value:v ?? ''});
  const PAGES={
    me(){ body.append(
      sec('Di chuyển đặc biệt',
        sw('🕊️ Bay tự do (noclip)', 'Space lên · Z xuống · Shift ×3', ()=>A.fly, v=>setMove('fly', v)),
        slider('Tốc độ bay', 5, 200, 5, ()=>A.flySpeed, v=>A.flySpeed=v, v=>v+' m/s'),
        sw('👻 Đi xuyên tường', 'Đi trên mặt đất, bỏ va chạm', ()=>A.ghost, v=>setMove('ghost', v)),
        sw('🛡️ Bất tử', 'Không té xe khi đâm', ()=>A.god, v=>A.god=v)),
      sec('Tốc độ',
        slider('🏃 Chạy bộ', 1, 5, .25, ()=>A.runMul, v=>{ A.runMul=v; applyRun(); }, v=>'×'+v.toFixed(2).replace(/\.?0+$/,'')),
        slider('🚗 Xe đang lái (ô tô · xe máy · xe đạp)', 1, 5, .25, ()=>A.carMul, v=>{ A.carMul=v; applyCar(); }, v=>'×'+v.toFixed(2).replace(/\.?0+$/,''))),
      sec('Sửa nhanh', el('div', {class:'admGrid2'}, [btn('⬇️ Đặt lại xuống đất', ()=>{ setMove('fly', false); P.y=W.groundAt(P.x,P.z); P.vy=0; P.ground=true; me.g.position.set(P.x,P.y,P.z); }),
        btn('📋 Chép toạ độ', ()=>{ const t=`${P.x.toFixed(1)}, ${P.y.toFixed(2)}, ${P.z.toFixed(1)}`; try{ navigator.clipboard.writeText(t); toast('📋 '+t, 2000); }catch(e){ toast(t, 3000); } })]))); },
    move(){ const q=el('input', {class:'admIn', type:'search', placeholder:'🔎 Tìm địa điểm…', 'aria-label':'Tìm địa điểm'}), list=el('div', {class:'admList', role:'list'});
      const fill=()=>{ list.innerHTML=''; const k=q.value.trim().toLowerCase(); let n=0; for(const p of (W.PLACES||[])){ if(k && !((p.name||'')+' '+(p.sub||'')).toLowerCase().includes(k)) continue; if(++n>200) break;
          const it=el('div', {class:'admItem', role:'listitem', tabindex:'0', title:(p.name||'')+(p.sub?'\n'+p.sub:'')}, [el('i', {text:p.icon||'📍'}), el('b', {text:p.name||''}), el('em', {text:'bay'})]);
          it.onclick=()=>{ setMove('fly', false); p.go(); }; it.onkeydown=e=>{ if(e.key==='Enter') it.click(); }; list.append(it); } if(!n) list.append(el('div', {class:'admNote', text:'Không có địa điểm khớp.'})); };
      q.oninput=fill; fill();
      const x=num('X', P.x.toFixed(1)), z=num('Z', P.z.toFixed(1));
      const mk=el('div', {class:'admList'}); const fillM=()=>{ mk.innerHTML=''; const M=marks(); if(!M.length) mk.append(el('div', {class:'admNote', text:'Chưa lưu điểm nào.'}));
        M.forEach((m,i)=>{ const del=el('button', {class:'admX', title:'Xoá điểm', 'aria-label':'Xoá điểm', text:'✕'}); del.onclick=e=>{ e.stopPropagation(); const L2=marks(); L2.splice(i,1); lsSet(LS.marks, L2); fillM(); };
          const it=el('div', {class:'admItem', tabindex:'0'}, [el('i', {text:'📌'}), el('b', {text:m.n}), del]); it.onclick=()=>tpXZ(m.x, m.z); mk.append(it); }); };
      fillM();
      body.append(sec('Địa điểm', q, list),
        sec('Toạ độ', el('div', {class:'admGrid'}, [x, z, btn('Bay tới', ()=>tpXZ(+x.value, +z.value), 'pri')]),
          el('div', {class:'admGrid2'}, [btn('🎯 Tới chỗ tâm màn hình', ()=>{ const t=lookTarget(); if(!t){ toast('Không thấy mặt đất / vật ở tâm màn hình.', 2200); return; } tpXZ(t.x, t.z); }),
            btn('📌 Lưu chỗ đang đứng', ()=>{ const M=marks(); M.unshift({n:`${zoneName(P.x,P.z)} · ${P.x.toFixed(0)}, ${P.z.toFixed(0)}`, x:+P.x.toFixed(2), z:+P.z.toFixed(2)}); lsSet(LS.marks, M.slice(0,30)); fillM(); })])),
        sec('Điểm đã lưu', mk)); },
    world(){ const times=el('div', {class:'admGrid'}, ['☀️ Ngày','🌇 Hoàng hôn','🌙 Đêm'].map((t,i)=>btn(t, ()=>{ W.setTime(i); }, W.timeIdx===i?'pri':'')));
      const wx=el('div', {class:'admGrid'}, Object.entries(WX).map(([k,w])=>btn(w.n, ()=>{ A.weather=k; applyWeather(); render(); }, A.weather===k?'pri':'')));
      body.append(sec('Giờ trong ngày', times), sec('Thời tiết', wx, el('div', {class:'admNote', text:'Chỉ trên máy này (để test cảnh / âm thanh mưa). Đổi giờ vẫn giữ thời tiết.'})),
        sec('Bot & giao thông', sw('🧍 Ẩn người / bot', 'Ẩn mọi nhân vật trừ bạn (vẫn chạy ngầm)', ()=>A.botsHidden, v=>hideBots(v)),
          sw('🚦 Tắt giao thông', W.traffic && W.traffic.setEnabled ? 'Xe + người đi bộ dọc đường' : 'Ẩn xe trên đường', ()=>A.trafficOff, v=>setTraffic(v)))); },
    money(){ const S=L() && L().S; const amt=num('Số tiền', S ? S.coins : 0);
      body.append(sec('Ví tiền', el('div', {class:'admStat', text:S ? `Hiện có: ${fmtN(S.coins)} 💰` : 'Chưa nạp hệ thống cuộc sống.'}),
          el('div', {class:'admGrid'}, [amt, btn('Đặt', ()=>{ setCoins(+amt.value||0); render(); }, 'pri'), btn('Về 0…', ()=>confirmBox(`Đặt ví về 0 💰? (hiện có ${fmtN(S?S.coins:0)})`, ()=>{ setCoins(0); render(); }), 'bad')]),
          el('div', {class:'admGrid'}, [1000, 10000, 100000].map(n=>btn('+'+fmtN(n), ()=>{ setCoins((L().S.coins||0)+n); render(); })))),
        sec('Mở khoá để test', sw('🆓 Miễn phí mọi khoản chi', 'Ví luôn đầy; tắt → trả lại số tiền cũ', ()=>A.free, v=>{ setFree(v); render(); }),
          btn('🔓 Mở khoá mọi món trong cửa hàng + xe', unlockAll))); },
    debug(){ const ev=W.events, evBox=el('div', {class:'admEv'}), act=el('div', {class:'admStat'});   // tên sự kiện dài → 1 cột, chữ xuống dòng (không tràn ngang)
      if(ev && Array.isArray(ev.list)) for(const e of ev.list){ const k=e.key||e.id, n=e.label||e.name||k; if(!k) continue; evBox.append(btn((e.icon?e.icon+' ':'')+n, ()=>{ try{ ev.trigger(k, {force:true}); toast('🧪 '+n, 1800); }catch(er){ console.warn('[admin] sự kiện', er); } })); }
      const stat=el('div', {class:'admStat'}); const upd=()=>{ const i=W.renderer.info; stat.textContent=`Lượt vẽ: ${i.render.calls} · tam giác: ${fmtN(i.render.triangles)}\nHình: ${i.memory.geometries} · texture: ${i.memory.textures} · FPS: ${fps.toFixed(0)}`;
        act.textContent=ev && ev.active ? (ev.active().map(a=>`▶ ${a.label||a.key} (${a.phase||''})`).join('\n') || 'Không có sự kiện đang chạy.') : ''; }; upd(); syncers.push(upd);
      body.append(sec('Hiển thị', sw('📍 HUD toạ độ + FPS', 'Góc trái màn hình', ()=>A.hud, v=>{ A.hud=v; hud.hidden=!v; }),
          sw('🧱 Hiện va chạm quanh mình (35 m)', 'Xanh: trụ · cam: hộp · hồng: tường · lục: sàn', ()=>A.col, v=>setCol(v))),
        sec('Sự kiện thế giới (W.events)', ev && Array.isArray(ev.list) ? evBox : el('div', {class:'admNote', text:'Chế độ này không có W.events (chỉ V2).'}), act, ev && ev.stop ? btn('⏹ Dừng mọi sự kiện', ()=>{ try{ ev.stop(); }catch(e){} }, 'bad') : null),
        sec('Render', stat)); },
    sec(){ const r=rec(); body.append(sec('Quyền admin', el('div', {class:'admNote', text:`PIN lưu dạng mã băm trên trình duyệt máy này (đặt lúc ${r ? new Date(r.created).toLocaleString('vi-VN') : '—'}). Không gửi qua mạng, người chơi khác không thấy bảng này.`}),
        el('div', {class:'admGrid'}, [btn('🔒 Khoá ngay', lock), btn('🔑 Đổi PIN', ()=>openGate('change')), btn('Gỡ khỏi máy…', ()=>confirmBox('Gỡ quyền admin khỏi máy này? (xoá PIN, tắt mọi chế độ admin)', ()=>{ resetAll(); lsSet(LS.rec, null); lsSet(LS.sess, null); if(topBtn){ topBtn.remove(); topBtn=null; } A.unlocked=false; closePanel(); toast('Đã gỡ quyền admin khỏi máy này.', 2500); }), 'bad')]))); },
  };
  function resetAll(){ setMove('fly', false); A.god=false; A.runMul=1; applyRun(); A.carMul=1; applyCar(); if(A.free) setFree(false); hideBots(false); if(A.trafficOff) setTraffic(false); A.weather='clear'; applyWeather(); setCol(false); A.hud=false; hud.hidden=true; }

  /* ============================== 8. PHÍM + MỖI KHUNG ============================== */
  addEventListener('keydown', e=>{ KEYS[e.code]=true;
    if(e.code==='F8' && !e.repeat){ e.preventDefault(); if(!gate.hidden) return; toggle(); }
    else if(e.code==='Escape' && A.open && gate.hidden && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){ closePanel(); } }, true);
  addEventListener('keyup', e=>{ KEYS[e.code]=false; }, true);
  addEventListener('blur', ()=>{ for(const k in KEYS) KEYS[k]=false; });
  let syncT=0, hideT=0;
  HOOK.onFrame.push((dt, T)=>{
    fN++; fT+=dt; if(fT>=.5){ fps=fN/fT; fN=0; fT=0; }
    if(A.fly && HOOK.vehicle!==FLY) A.fly=false; if(A.ghost && HOOK.vehicle!==GHOST) A.ghost=false;   // lên xe / bị chiếm điều khiển → tắt chế độ
    if(A.runMul!==1) applyRun();
    if(A.free && L() && L().S.coins<9e8) setCoins(999999999);
    if(wxBase && Math.abs(W.sun.intensity-wxSun)>1e-4){ wxBase=null; applyWeather(); }   // giờ trong ngày đổi → chụp lại nền mới rồi áp thời tiết lại
    if(rain && rain.visible){ rain.material.uniforms.uT.value=T||0; rain.material.uniforms.uCam.value.copy(W.camera.position); }
    if(A.botsHidden) hideBots(true);   // mỗi khung: bot mới sinh / hệ bot tự bật lại → ẩn tiếp
    if(A.col){ colT-=dt; if(colT<=0){ colT=.5; if(!colAt || Math.hypot(P.x-colAt[0], P.z-colAt[1])>3) buildColliders(); } }
    if(A.hud){ hudT-=dt; if(hudT<=0){ hudT=.25; const i=W.renderer.info; hud.textContent=`X ${P.x.toFixed(1)}   Y ${P.y.toFixed(2)}   Z ${P.z.toFixed(1)}\n${zoneName(P.x,P.z)}\nFPS ${fps.toFixed(0)} · vẽ ${i.render.calls} · ${(P.speed||0).toFixed(1)} m/s${A.fly?' · 🕊️ bay':A.ghost?' · 👻 xuyên':''}`; } }
    if(A.open){ syncT-=dt; if(syncT<=0){ syncT=.5; for(const s of syncers) try{ s(); }catch(e){} } }
  });
  A.api={toggle, openPanel, closePanel, setMove, setCoins, setFree, unlockAll, tpXZ, applyWeather, hideBots, setTraffic, setCol, resetAll, isOwnerMachine:ownerMachine};
  return A;
}
