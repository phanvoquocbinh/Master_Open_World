// QC World – S7: NHIỀU NGƯỜI CHƠI (cùng máy / mạng LAN)
//  Nút 👥 Online (phím J): nhập địa chỉ server (mặc định ws://127.0.0.1:8790), chọn màu tên → thấy người chơi thật (đúng avatar,
//  tên trên đầu), chat chung (phím T như cũ – tin nhắn hiện bong bóng trên đầu người gửi), cử chỉ 1–6 đồng bộ.
//  Chuyển động người khác được NỘI SUY ở thời điểm trễ 160 ms giữa các gói 10 lần/giây → đi/chạy mượt, không giật cục.
//  Server: multiplayer_server.py (không chứa token, không đọc DB, mặc định chỉ 127.0.0.1; chơi LAN chạy bản --lan).
export function makeMulti(W, ctx){
  const {S, save, ui, V} = ctx;
  const {THREE, P, me, HOOK, toast, makeActor, AVATARS, makeLabel, removeLabel, PROFILE, $, clamp, lerpAngle} = W;
  S.mp=S.mp||{}; S.mp.url=S.mp.url||'ws://127.0.0.1:8790'; S.mp.color=S.mp.color||'#46d39a';
  const COLORS=['#46d39a','#4fc3ff','#ffd23f','#ff8fc2','#c77dff','#ff7b29'];
  const EMO={wave:'👋', jump:'🦘', punch:'👊', cheer:'🙌', agree:'👍', shake:'🙅'};
  const DIGIT=['wave','jump','punch','cheer','agree','shake'];
  let ws=null, myId=null, connected=false, wantOn=false, retry=0, sendT=0, offset=null, count=0;
  const extMsg=[], extOpen=[];   // S19g: thiết bị khác (điện thoại) nghe tin riêng + biết lúc vừa kết nối
  const fire=(arr, ...a)=>{ for(const f of arr){ try{ f(...a); }catch(e){ console.warn('multi ext', e); } } };
  const remotes=new Map(), DELAY=.16, nowS=()=>performance.now()/1000;

  /* ---------- kết nối ---------- */
  function connect(url){
    stop(true); wantOn=true; S.mp.url=url; save();
    try{ ws=new WebSocket(url); }catch(e){ toast('👥 Địa chỉ server không hợp lệ: '+url, 3500); wantOn=false; return; }
    const me_ws=ws;
    ws.onopen=()=>{ if(ws!==me_ws) return; connected=true; retry=0; offset=null; ws.send(JSON.stringify({t:'hi', name:PROFILE.name||'Bình', c:S.mp.color})); toast('👥 Đã vào chế độ nhiều người chơi!', 2600); render(); fire(extOpen); };
    ws.onmessage=e=>{ if(ws!==me_ws) return; let m; try{ m=JSON.parse(e.data); }catch(_){ return; } onMsg(m); };
    ws.onerror=()=>{ if(ws===me_ws && !connected && retry===0) toast('👥 Không kết nối được '+url+' – mở ChoiNhieuNguoi_Server.bat (hoặc bản LAN) trước nhé.', 5000); };
    ws.onclose=()=>{ if(ws!==me_ws) return; const was=connected; connected=false; ws=null; clearRemotes(); render();
      if(was) toast('👥 Mất kết nối server nhiều người chơi – đang thử lại…', 3000);
      if(wantOn && retry<6){ retry++; setTimeout(()=>{ if(wantOn && !ws) connect(S.mp.url); }, 1500*retry); } };
  }
  function stop(silent){ wantOn=false; const w=ws; ws=null; connected=false; if(w){ try{ w.close(); }catch(e){} } clearRemotes(); render(); if(!silent) toast('👥 Đã thoát chế độ nhiều người chơi.', 2200); }
  const sendJ=o=>{ if(ws && connected && ws.readyState===1) ws.send(JSON.stringify(o)); };

  /* ---------- người chơi khác ---------- */
  function addRemote(p){
    const mk=AVATARS[p.m]||AVATARS.soldier; let av=mk(); if(!av.gl) av=AVATARS.soldier();
    const a=makeActor(av.gl, {name:`👤 ${p.name}`, height:av.height, face:av.face, dot:p.c||'#46d39a', clips:av.clips});
    a.play('idle',0); const head=new THREE.Object3D(); head.position.y=av.height+.75; a.g.add(head);
    const r={id:p.id, a, name:p.name, m:p.m, c:p.c, buf:[], head, bubble:null, bubT:0, anim:'idle', inside:''}; remotes.set(p.id, r); return r; }
  function dropRemote(id){ const r=remotes.get(id); if(!r) return; r.a.g.parent && r.a.g.parent.remove(r.a.g); if(r.a.label) removeLabel(r.a.label); if(r.bubble) removeLabel(r.bubble); W.ACTORS && W.ACTORS.delete(r.a); remotes.delete(id); }
  function clearRemotes(){ for(const id of [...remotes.keys()]) dropRemote(id); count=0; updBtn(); }
  function bubble(r, text, sec=5){ if(r.bubble) removeLabel(r.bubble); r.bubble=makeLabel(text, null, {fs:40, h:.28, follow:r.head, bg:'rgba(255,255,255,.95)', color:'#1b2233', fade:45}); r.bubT=sec; }
  function onMsg(m){
    if(m.t==='hello'){ myId=m.id; }
    else if(m.t==='snap'){ const off=m.ts-nowS(); offset = offset===null ? off : off<offset ? off : offset+(off-offset)*.02;   // bám độ trễ nhỏ nhất
      const seen=new Set();
      for(const p of m.p){ if(p.id===myId) continue; seen.add(p.id); let r=remotes.get(p.id);
        if(r && (r.m!==p.m || r.c!==p.c || r.name!==p.name)){ dropRemote(p.id); r=null; }   // đổi avatar / tên / màu → dựng lại
        if(!r) r=addRemote(p);
        r.buf.push({ts:m.ts, x:p.x, y:p.y, z:p.z, f:p.f}); if(r.buf.length>40) r.buf.shift(); r.anim=p.a||'idle'; r.v=p.v||''; r.inside=p.in||''; }
      for(const id of [...remotes.keys()]) if(!seen.has(id)) dropRemote(id);
      count=m.p.length; updBtn(); }
    else if(m.t==='chat'){ if(m.id===myId) return; W.logChat && W.logChat('👤 '+m.name, m.text, '#46d39a'); const r=remotes.get(m.id); if(r) bubble(r, m.text); }
    else if(m.t==='join'){ if(m.id!==myId) toast(`👋 ${m.name} vừa vào QC World`, 2600); }
    else if(m.t==='leave'){ toast(`👋 ${m.name} đã rời game`, 2200); dropRemote(m.id); }
    else if(m.t==='emote'){ const r=remotes.get(m.id); if(!r) return; const k=m.k, act=r.a.acts[k];
      if(act){ act.setLoop(THREE.LoopOnce); act.clampWhenFinished=false; r.a.play(k,.2); r.emoT=act.getClip().duration; } bubble(r, EMO[k]||'✨', 2); }
    else if(m.t==='full') toast('👥 Server đã đủ 32 người.', 3000);
    else fire(extMsg, m);   // S19g: phone_ok / sms / sms_ack / who → điện thoại (js/gadgets.js)
  }

  /* ---------- mỗi khung hình ---------- */
  HOOK.onFrame.push((dt)=>{
    if(!connected) return;
    sendT+=dt; if(sendT>=.1){ sendT=0; const rd=V && V.riding && V.riding();
      sendJ({t:'s', x:+P.x.toFixed(2), y:+P.y.toFixed(2), z:+P.z.toFixed(2), f:+me.g.rotation.y.toFixed(3), a: HOOK.vehicle ? 'ride' : (me.cur||'idle'), m:PROFILE.model||'soldier', v: rd ? rd.type : '', in: W.inside ? String((W.inside.b && W.inside.b.name) || W.inside.kind || 'inside') : ''}); }
    const rt=nowS()+(offset||0)-DELAY, myIn=W.inside ? String((W.inside.b && W.inside.b.name) || W.inside.kind || 'inside') : '';
    for(const r of remotes.values()){ const b=r.buf; if(!b.length) continue;
      let A=b[0], B=b[0]; for(let i=b.length-1;i>0;i--){ if(b[i-1].ts<=rt){ A=b[i-1]; B=b[i]; break; } } if(rt>b[b.length-1].ts){ A=b[Math.max(0,b.length-2)]; B=b[b.length-1]; }
      const span=Math.max(.02, B.ts-A.ts), k=clamp((rt-A.ts)/span, 0, 1.3);   // vượt quá gói cuối tối đa 30% (ngoại suy nhẹ)
      const x=A.x+(B.x-A.x)*k, y=A.y+(B.y-A.y)*k, z=A.z+(B.z-A.z)*k, sp=Math.hypot(B.x-A.x, B.z-A.z)/span;
      const g=r.a.g; g.position.set(x,y,z); g.rotation.y=lerpAngle(A.f, B.f, clamp(k,0,1));
      g.visible = !r.inside;   // người đang trong toà nhà (cảnh riêng) không hiện ngoài phố
      if(r.emoT>0) r.emoT-=dt;
      else { const want = r.v==='car' ? 'idle' : r.anim==='ride' ? 'idle' : sp>3.8 ? (r.a.acts.run?'run':'walk') : sp>.25 ? 'walk' : (r.a.acts[r.anim] && r.anim!=='walk' && r.anim!=='run' ? r.anim : 'idle'); r.a.play(want,.25);
        if(r.a.cur==='walk' && r.a.acts.walk) r.a.acts.walk.timeScale=clamp(sp/1.5,.6,1.9); if(r.a.cur==='run' && r.a.acts.run) r.a.acts.run.timeScale=clamp(sp/5,.8,1.8); }
      if(g.visible && r.a.root.visible) r.a.mixer.update(dt);
      if(r.bubble){ r.bubT-=dt; if(r.bubT<=0){ removeLabel(r.bubble); r.bubble=null; } } }
  });
  // cử chỉ 1–6 → gửi cho mọi người
  for(let d=1; d<=6; d++){ const code='Digit'+d, f=HOOK.keys[code]; HOOK.keys[code]=(e)=>{ if(f) f(e); sendJ({t:'emote', k:DIGIT[d-1]}); }; }

  /* ---------- giao diện ---------- */
  const btn=document.createElement('button'); btn.className='btn'; btn.innerHTML='<span class="key">J</span> 👥 Online'; btn.onclick=()=>open(); const top=$('top'); if(top) top.insertBefore(btn, $('status'));
  function updBtn(){ btn.innerHTML = connected ? `<span class="key">J</span> 👥 ${count} online` : '<span class="key">J</span> 👥 Online'; btn.style.boxShadow = connected ? '0 0 0 2px #46d39a inset' : ''; }
  let modal=null;
  function render(){ updBtn(); if(!modal || !modal.wrap.isConnected) return;
    const st=modal.body.querySelector('#mpSt'); if(st) st.innerHTML = connected ? `🟢 Đã kết nối – <b>${count}</b> người đang online` : wantOn ? '🟡 Đang kết nối…' : '⚪ Chưa kết nối';
    const list=modal.body.querySelector('#mpList'); if(list){ list.innerHTML=''; if(connected){ const me2=document.createElement('div'); me2.textContent=`⭐ ${PROFILE.name} (bạn)`; list.appendChild(me2); for(const r of remotes.values()){ const d=document.createElement('div'); d.textContent=`👤 ${r.name}${r.inside?' · trong toà nhà':''}`; d.style.color=r.c; list.appendChild(d); } } }
    const b1=modal.body.querySelector('#mpGo'), b2=modal.body.querySelector('#mpStop'); if(b1) b1.hidden=connected; if(b2) b2.hidden=!connected && !wantOn; }
  function open(){ modal=ui.modal('👥 Nhiều người chơi');
    modal.body.innerHTML=`<p id="mpSt" style="font-weight:700"></p>
      <label class="muted">Địa chỉ server</label><input id="mpUrl" class="inp" style="width:100%;margin:4px 0 10px" value="">
      <label class="muted">Màu tên của bạn (${PROFILE.name})</label><div id="mpCol" class="row" style="gap:8px;margin:6px 0 12px"></div>
      <label style="display:flex;gap:8px;align-items:center;margin-bottom:12px"><input type="checkbox" id="mpAuto"> Tự kết nối khi mở game</label>
      <div class="row" style="gap:10px"><button class="btn pri" id="mpGo">🔌 Kết nối</button><button class="btn" id="mpStop">⏏ Thoát</button></div>
      <div id="mpList" style="margin-top:12px;line-height:1.7"></div>
      <p class="muted" style="font-size:12.5px;margin-top:12px">• Chơi nhiều cửa sổ trên máy này: chạy <b>ChoiNhieuNguoi_Server.bat</b> rồi bấm Kết nối.<br>• Chơi với bạn cùng mạng LAN: máy chủ chạy <b>ChoiNhieuNguoi_Server_LAN.bat</b> (cửa sổ server hiện địa chỉ ws://IP:8790), các máy khác mở QC World của họ và nhập địa chỉ đó.<br>• Server chỉ chuyển vị trí / tên / chat / cử chỉ – không chứa token, không đọc dữ liệu Dashboard.</p>`;
    const u=modal.body.querySelector('#mpUrl'); u.value=S.mp.url; u.addEventListener('keydown', e=>{ e.stopPropagation(); if(e.key==='Enter') connect(u.value.trim()); });
    const cc=modal.body.querySelector('#mpCol'); for(const c of COLORS){ const s=document.createElement('button'); s.className='btn'; s.style.cssText=`width:30px;height:30px;padding:0;border-radius:50%;background:${c};${c===S.mp.color?'outline:3px solid #fff':''}`; s.onclick=()=>{ S.mp.color=c; save(); [...cc.children].forEach(x=>x.style.outline=''); s.style.outline='3px solid #fff'; if(connected) sendJ({t:'hi', name:PROFILE.name, c}); }; cc.appendChild(s); }
    const au=modal.body.querySelector('#mpAuto'); au.checked=!!S.mp.auto; au.onchange=()=>{ S.mp.auto=au.checked; save(); };
    modal.body.querySelector('#mpGo').onclick=()=>connect(u.value.trim()||'ws://127.0.0.1:8790');
    modal.body.querySelector('#mpStop').onclick=()=>stop(false);
    render(); }
  HOOK.keys.KeyJ=()=>open();
  try{ const c=$('helpWrap').querySelector('.ctrl'); const a=document.createElement('div'); a.className='ks'; a.innerHTML='<span class="key">J</span>'; const b=document.createElement('div'); b.textContent='Nhiều người chơi (👥 Online) – chat T, cử chỉ 1–6 hiện cho mọi người'; c.append(a,b); }catch(e){}
  if(S.mp.auto) setTimeout(()=>connect(S.mp.url), 1500);

  return {connect, stop, chat:(t)=>sendJ({t:'chat', text:String(t).slice(0,140)}), connected:()=>connected, remotes, get count(){ return count; },
    open, send:(o)=>{ if(!(ws && connected && ws.readyState===1)) return false; sendJ(o); return true; }, on:(f)=>extMsg.push(f), onOpen:(f)=>extOpen.push(f)};
}
