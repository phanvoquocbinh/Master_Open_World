// QC World – S19g: THIẾT BỊ CÁ NHÂN của người chơi (nạp từ js/life.js → W.gadgets)
//  💻 LAPTOP (phím L): nhân vật lấy laptop ra, camera góc nhìn thứ nhất, màn hình laptop gần bằng màn hình game.
//     Ứng dụng: Master Dashboard (CHỈ mở khi máy có thư mục Master Dashboard – serve.py kiểm tra, không lộ đường dẫn),
//     Trình duyệt kiểu Chrome (Google nhúng bằng igu=1; trang chặn nhúng → nút mở bằng trình duyệt thật),
//     game QA tự thiết kế: 🐞 Diệt Bug, 🃏 Lật thẻ QA; 📝 Ghi chú. L / Esc / nút ⏏ để cất.
//  🎧 MÁY NGHE NHẠC (phím Y): tìm YouTube (qua serve.py, không cần API key) hoặc dán link → chọn bài → ▶ Phát:
//     cất máy, nhân vật đeo tai nghe (mesh gắn vào xương đầu), nhạc phát bằng YouTube IFrame Player ẩn; ⏯ ⏭ âm lượng ⏹.
//  📱 ĐIỆN THOẠI (phím O): mỗi người 1 số 555-xxx-xxxx cố định (lưu máy), danh bạ, nhắn tin qua server nhiều người chơi
//     (multiplayer_server.py), có thông báo tin mới; chơi một mình → báo cần vào chế độ nhiều người (J).
export async function make(W, ctx){
  const {THREE, me, P, HOOK, toast} = W;
  const DASH=W.DASH||'http://127.0.0.1:8765';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const LS={get(k,d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } }, set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), sm=t=>{ t=clamp(t,0,1); return t*t*(3-2*t); };
  const V3=THREE.Vector3, HH=me.h||1.78;
  const GQ=(q)=>`https://www.google.com/search?igu=1&hl=vi&q=${encodeURIComponent(q)}`;
  injectCSS();

  /* ============================== TƯ THẾ CẦM ĐỒ + ĐỒ VẬT 3D ============================== */
  const bones={}; me.g.traverse(o=>{ if(o.isBone) bones[o.name.replace(/^mixamorig:?/,'')]=o; });
  const _a=new V3(), _b=new V3(), _d=new V3(), _q=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _I=new THREE.Quaternion(), _gq=new THREE.Quaternion();
  function aim(name, child, dir, w){ const B=bones[name], C=bones[child]; if(!B||!C||w<=.001) return;
    B.getWorldPosition(_a); C.getWorldPosition(_b); _b.sub(_a).normalize(); _d.copy(dir).normalize();
    _q.setFromUnitVectors(_b,_d); if(w<1) _q.slerp(_I, 1-w);   // (slerpQuaternions(_I,_q,w) sẽ ghi đè _q trước khi nội suy → luôn ra 0)
    B.getWorldQuaternion(_wq); B.parent.getWorldQuaternion(_pq); _wq.premultiply(_q); B.quaternion.copy(_pq.invert().multiply(_wq)); B.updateMatrixWorld(true); }
  const U=new V3(0,1,0), F=new V3(), R=new V3();
  const D=(f,u,r)=>new V3().addScaledVector(F,f).addScaledVector(U,u).addScaledVector(R,r);
  const POSE={
    laptop(w){ for(const [s,k] of [['Left',-1],['Right',1]]){ aim(s+'Arm',s+'ForeArm',D(.42,-1,k*.12),w); aim(s+'ForeArm',s+'Hand',D(1,.1,-k*.24),w); } aim('Neck','Head',D(.45,1,0),w*.8); },
    hand(w){ for(const [s,k] of [['Left',-1],['Right',1]]){ aim(s+'Arm',s+'ForeArm',D(.25,-1,k*.14),w); aim(s+'ForeArm',s+'Hand',D(.8,.78,-k*.42),w); } aim('Neck','Head',D(.5,1,0),w*.8); },
    ears(w){ for(const [s,k] of [['Left',-1],['Right',1]]){ aim(s+'Arm',s+'ForeArm',D(.15,-.3,k),w); aim(s+'ForeArm',s+'Hand',D(.05,.8,-k*1.1),w); } },   // hai bàn tay áp ngang tai
    reach(w){ aim('RightArm','RightForeArm',D(.05,-1,.32),w); aim('RightForeArm','RightHand',D(.3,-1,.12),w); },   // thò tay xuống túi quần phải
  };
  const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.4, metalness:.3, ...o});
  function addTo(parent, geo, m, x=0,y=0,z=0){ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); o.castShadow=false; o.receiveShadow=false; parent.add(o); return o; }
  function canvasTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
  // laptop: bản lề ở mép xa người chơi, mở nắp 110°
  const lap=new THREE.Group(); lap.visible=false; me.g.add(lap); lap.userData.dynamic=true;
  const alu=mat(0x9aa1ad,{metalness:.75, roughness:.28});
  addTo(lap, new THREE.BoxGeometry(.34,.016,.235), alu, 0,.008,0);
  addTo(lap, new THREE.PlaneGeometry(.3,.1), mat(0x1f2228,{metalness:0, roughness:.8}), 0,.0166,.035).rotation.x=-Math.PI/2;
  addTo(lap, new THREE.PlaneGeometry(.09,.055), mat(0x80868f,{roughness:.5}), 0,.0167,-.07).rotation.x=-Math.PI/2;
  const lidPivot=new THREE.Group(); lidPivot.position.set(0,.016,.1175); lap.add(lidPivot);
  addTo(lidPivot, new THREE.BoxGeometry(.34,.01,.235), alu, 0,.005,-.1175);
  const lapScrTex=canvasTex(256,160,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#16324f'); gr.addColorStop(1,'#3b2a6b'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.fillStyle='rgba(255,255,255,.9)'; g.font='700 30px "Segoe UI"'; g.textAlign='center'; g.fillText('QC OS',w/2,h/2+4); g.fillStyle='rgba(10,14,22,.8)'; g.fillRect(0,h-16,w,16); });
  const lapScr=addTo(lidPivot, new THREE.PlaneGeometry(.31,.2), new THREE.MeshBasicMaterial({map:lapScrTex}), 0,-.0006,-.1175); lapScr.rotation.set(Math.PI/2,0,Math.PI);
  // máy nghe nhạc / điện thoại cầm trước ngực, màn hình hướng về mặt nhân vật
  const dev=new THREE.Group(); dev.visible=false; dev.rotation.order='YXZ'; dev.rotation.set(-.75, Math.PI, 0); me.g.add(dev); dev.userData.dynamic=true;
  const pod=new THREE.Group(); dev.add(pod);
  addTo(pod, new THREE.BoxGeometry(.064,.108,.013), mat(0xeef1f6,{roughness:.25}));
  addTo(pod, new THREE.PlaneGeometry(.052,.044), new THREE.MeshBasicMaterial({color:0x2fb8ff}), 0,.024,.0067);
  addTo(pod, new THREE.CircleGeometry(.021,24), mat(0xc4cad3), 0,-.025,.0067); addTo(pod, new THREE.CircleGeometry(.007,16), mat(0xffffff), 0,-.025,.0068);
  const phn=new THREE.Group(); dev.add(phn);
  addTo(phn, new THREE.BoxGeometry(.072,.148,.009), mat(0x14171c,{metalness:.5}));
  const phTex=canvasTex(64,128,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#2b7de9'); gr.addColorStop(1,'#7a3fe0'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.fillStyle='rgba(255,255,255,.85)'; for(let i=0;i<3;i++) for(let j=0;j<4;j++){ g.beginPath(); g.arc(14+i*18, 34+j*20, 6, 0, 7); g.fill(); } });
  addTo(phn, new THREE.PlaneGeometry(.066,.138), new THREE.MeshBasicMaterial({map:phTex}), 0,0,.0047);
  // tai nghe (dựng 1 lần, gắn vào xương đầu khi phát nhạc). Hoạt cảnh ĐEO: tay phải thò xuống túi lấy tai nghe → hai tay đưa lên
  // → tai nghe theo hai bàn tay lên đầu, áp vào tai → hạ tay. THÁO: hai tay lên tai → nhấc tai nghe ra → tay phải cất xuống túi.
  let hpRoot=null, hpInner=null, hpCal=false;
  const HP={state:'off', t:0}, PUT=1.7, TAKE=1.6;
  const isRiding=()=>!!HOOK.vehicle || !!(W.V && W.V.riding && W.V.riding());
  const canAnim=()=>!!(bones.Head && bones.LeftHand && bones.RightHand);
  const wearing=()=>HP.state==='on' || HP.state==='puton';
  function phonesOn(){ if(wearing()) return; if(!hpRoot) [hpRoot, hpInner]=buildPhones(); hpRoot.userData.dynamic=true; hpCal=true;   // gắn vào đầu ở đầu khung sau (lúc đầu đang đúng tư thế gốc)
    HP.state='puton'; HP.t=(canAnim() && !isRiding()) ? 0 : PUT; }
  function phonesOff(){ if(HP.state==='off' || HP.state==='takeoff') return; HP.state='takeoff'; HP.t=(canAnim() && !isRiding() && HP.t>=PUT*.6) ? 0 : TAKE; }
  function buildPhones(){ const g=new THREE.Group(), inner=new THREE.Group(); g.add(inner);
    const band=mat(0x1d2027,{roughness:.35, metalness:.5}), cup=mat(0x2a2f3a,{roughness:.3, metalness:.4}), padM=mat(0x0f1115,{roughness:.9, metalness:0}), glow=new THREE.MeshBasicMaterial({color:0x4fc3ff});
    addTo(inner, new THREE.TorusGeometry(1.08,.085,8,32,Math.PI), band);
    for(const s of [-1,1]){ addTo(inner, new THREE.CylinderGeometry(.44,.44,.3,24), cup, s*1.06,-.05,0).rotation.z=Math.PI/2;
      addTo(inner, new THREE.TorusGeometry(.33,.11,8,20), padM, s*.9,-.05,0).rotation.y=Math.PI/2;
      addTo(inner, new THREE.TorusGeometry(.3,.045,6,24), glow, s*1.22,-.05,0).rotation.y=Math.PI/2;
      addTo(inner, new THREE.BoxGeometry(.1,.42,.12), band, s*1.07,.22,0); }
    return [g, inner]; }
  function attachPhones(){ if(hpRoot.parent) hpRoot.parent.remove(hpRoot);
    const H=bones.Head; me.g.updateMatrixWorld(true); me.g.getWorldQuaternion(_gq);
    let C=new V3(), r;
    if(H){ const hp=new V3(), tp=new V3(); H.getWorldPosition(hp); const T=bones.HeadTop_End;
      if(T){ T.getWorldPosition(tp); const hh=hp.distanceTo(tp); C.copy(hp).lerp(tp,.5); r=hh*.52; }
      else { const big=W.PROFILE && W.PROFILE.model==='robot'; C.copy(hp).addScaledVector(U, HH*(big?.12:.075)); r=HH*(big?.13:.062); }
      const M=new THREE.Matrix4().compose(C, _gq, new V3(r,r,r)), L=H.matrixWorld.clone().invert().multiply(M);
      L.decompose(hpRoot.position, hpRoot.quaternion, hpRoot.scale); H.add(hpRoot); }
    else { hpRoot.position.set(0,HH*.93,0); hpRoot.quaternion.identity(); hpRoot.scale.setScalar(HH*.062); me.g.add(hpRoot); } }
  // đặt tai nghe theo thời gian hoạt cảnh (gọi SAU khi đã áp tư thế tay trong khung)
  const _h1=new V3(), _h2=new V3(), _hm=new V3(), _ho=new V3(), _QI=new THREE.Quaternion(), _QC=new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.15,0,.4));
  const seg=(t,a,b)=>sm((t-a)/(b-a));
  function placePhones(){ const st=HP.state, t=HP.t; if(!hpRoot || !hpRoot.parent) return;
    let b=1, mid=1, sc=1;   // b: 0 = trong tay → 1 = trên đầu · mid: 0 = tay phải → 1 = giữa hai tay
    if(st==='puton'){ sc=seg(t,.18,.38); mid=seg(t,.35,.85); b=seg(t,.85,1.25); }
    else if(st==='takeoff'){ b=1-seg(t,.4,.7); mid=1-seg(t,.7,1.0); sc=1-seg(t,1.25,1.5); }
    else if(st==='off'){ sc=0; }
    hpRoot.visible=sc>.02;
    if(!hpRoot.visible) return;
    if(b>=.999 || !canAnim()){ hpInner.position.set(0,0,0); hpInner.quaternion.identity(); hpInner.scale.setScalar(Math.max(.001,sc)); return; }
    hpRoot.updateWorldMatrix(true,false);
    bones.RightHand.getWorldPosition(_h1); bones.LeftHand.getWorldPosition(_h2); _hm.copy(_h1).lerp(_h2,.5);
    _h1.addScaledVector(U, .05); _ho.copy(_h1).lerp(_hm, mid);           // cầm ở quai, cao hơn cổ tay chút
    hpRoot.getWorldPosition(_hm); _ho.lerp(_hm, b);
    hpInner.position.copy(hpRoot.worldToLocal(_ho)); hpInner.quaternion.slerpQuaternions(_QC, _QI, b); hpInner.scale.setScalar(Math.max(.001,sc)); }

  const hold={kind:null, w:0, want:0};
  const _e=new V3(), _l=new V3();

  /* ============================== ĐEO TAI NGHE = KHÔNG NGHE ÂM THANH THÀNH PHỐ ==============================
     Mọi module (sóng/gió/bước chân của đảo, sân vận động, phố đi bộ, công viên, đảo vui chơi…) tự tạo AudioContext riêng khi người chơi
     tương tác. Ở đây vá nhẹ Web Audio: mọi nhánh nối ra loa (destination) đi qua 1 nút "giảm âm" của tai nghe → đeo vào thì hạ về 0.
     Context tạo TRƯỚC khi vá (ví dụ bấm chuột lúc đang tải) không chèn được nút → tạm dừng (suspend) context đó trong lúc đeo.
     Nhạc sân khấu (YouTube player của world.html) → mute()/unMute(). Tiếng chuông điện thoại & nhạc tai nghe vẫn nghe (đi qua tai nghe). */
  const AUDQ={on:false, ctxs:new Set(), duck:new Map(), held:new Set(), stage:false, chk:0};
  (function patchAudio(){
    const AN=window.AudioNode, AC0=window.AudioContext, BAC=window.BaseAudioContext||AC0; if(!AN || !AC0 || AN.prototype.__gdPatched) return; AN.prototype.__gdPatched=true;
    const oc=AN.prototype.connect;
    AN.prototype.connect=function(dst, ...rest){
      const ctx=dst && dst.context;
      if(ctx && window.AudioDestinationNode && dst instanceof AudioDestinationNode && !this.__gdDuck && !ctx.__gdKeep){
        let g=AUDQ.duck.get(ctx); if(!g){ g=ctx.createGain(); g.__gdDuck=true; g.gain.value=AUDQ.on?0:1; oc.call(g, dst); AUDQ.duck.set(ctx, g); }
        oc.call(this, g, ...rest); return dst; }
      return oc.call(this, dst, ...rest); };
    try{ const Sub=class extends AC0 { constructor(...a){ super(...a); this.__gdNew=true; } }; window.AudioContext=Sub; if(window.webkitAudioContext===AC0) window.webkitAudioContext=Sub; }catch(e){}
    for(const fn of ['createGain','createOscillator','createBufferSource','createBiquadFilter']){ const of=BAC.prototype[fn]; if(!of) continue;
      BAC.prototype[fn]=function(...a){ if(!this.__gdKeep && !AUDQ.ctxs.has(this)){ AUDQ.ctxs.add(this); if(AUDQ.on) duckCtx(this, true); } return of.apply(this, a); }; }
    const ores=AC0.prototype.resume; if(ores){ AC0.prototype.resume=function(){ return this.__gdHold ? Promise.resolve() : ores.call(this); }; }   // module khác tự resume() → giữ im khi đang đeo
    AUDQ.resume=(c)=>ores ? ores.call(c) : c.resume();
  })();
  function duckCtx(c, on){ if(c.__gdKeep || c.state==='closed') return;
    const g=AUDQ.duck.get(c);
    if(g) g.gain.setTargetAtTime(on?0:1, c.currentTime, .12);
    if(!c.__gdNew){ if(on && !c.__gdHold){ c.__gdHold=true; AUDQ.held.add(c); try{ c.suspend(); }catch(e){} }   // context cũ (tạo trước khi vá) → tạm dừng
      else if(!on && c.__gdHold){ c.__gdHold=false; AUDQ.held.delete(c); try{ AUDQ.resume(c); }catch(e){} } } }
  function muteStage(on){ const p=W.music && W.music.player; if(!p || !p.isMuted) return;
    try{ if(on && !AUDQ.stage && !p.isMuted()){ p.mute(); AUDQ.stage=true; } else if(!on && AUDQ.stage){ p.unMute(); AUDQ.stage=false; } }catch(e){} }
  function setDuck(on){ AUDQ.on=on; for(const c of AUDQ.ctxs) duckCtx(c, on); muteStage(on); renderNow(); }
  function updDuck(dt){ const want=HP.state==='on' || (HP.state==='puton' && HP.t>=1.0) || (HP.state==='takeoff' && HP.t<.45);
    if(want!==AUDQ.on) setDuck(want);
    if(AUDQ.on){ AUDQ.chk-=dt; if(AUDQ.chk<=0){ AUDQ.chk=1; muteStage(true); } } }   // nhạc sân khấu bật lên trong lúc đang đeo
  function updMusicVol(){ const p=MU.player; if(!p || !p.setVolume) return; const t=HP.t;
    const k=HP.state==='on'?1 : HP.state==='puton'?seg(t,1.1,1.6) : HP.state==='takeoff'?1-seg(t,0,.4) : 0;
    const v=Math.round(MU.vol*k); if(v!==MU.lastV){ MU.lastV=v; try{ p.setVolume(v); }catch(e){} } }
  function afterTakeoff(){ const p=MU.player; if(p){ try{ if(MU.on) p.pauseVideo(); else p.stopVideo(); }catch(e){} } renderNow(); }
  HOOK.onFrame.push((dt)=>{
    hookMP(dt);
    hold.w+=Math.sign(hold.want-hold.w)*Math.min(Math.abs(hold.want-hold.w), dt/.35);
    if(hold.w<=0 && hold.want===0) hold.kind=null;
    const riding=!!HOOK.vehicle || !!(W.V && W.V.riding && W.V.riding());
    const e=sm(hold.w);
    lap.visible=hold.kind==='laptop' && hold.w>.02 && !riding;
    if(lap.visible){ lap.scale.setScalar(.45+.55*e); lap.position.set(0, HH*(.46+.095*e), .1+.23*e); lap.rotation.x=-.12*e; lidPivot.rotation.x=1.92*clamp((hold.w-.3)/.7,0,1); }
    dev.visible=(hold.kind==='player'||hold.kind==='phone') && hold.w>.02 && !riding;   // đang lái xe: cất vào túi (chỉ hiện giao diện)
    if(dev.visible){ pod.visible=hold.kind==='player'; phn.visible=hold.kind==='phone'; dev.position.set(-.16*(1-e), HH*(.5+.2*e), .04+.23*e); dev.scale.setScalar(.35+.65*e); }
    // tai nghe: gắn vào đầu lúc đầu còn đúng tư thế gốc (trước khi áp tư thế tay của khung này), rồi chạy hoạt cảnh đeo / tháo
    if(hpCal && hpRoot){ hpCal=false; attachPhones(); }
    let earW=0, reachW=0;
    if(HP.state==='puton' || HP.state==='takeoff'){ HP.t+=dt; const t=HP.t;
      if(HP.state==='puton'){ reachW=Math.sin(clamp(t/.45,0,1)*Math.PI); earW=seg(t,.35,.8)*(1-seg(t,1.3,PUT)); if(t>=PUT) HP.state='on'; }
      else { earW=seg(t,0,.4)*(1-seg(t,1.0,1.35)); reachW=t>1.0 ? Math.sin(clamp((t-1.0)/.6,0,1)*Math.PI) : 0; if(t>=TAKE){ HP.state='off'; afterTakeoff(); } } }
    if(riding){ earW=0; reachW=0; }
    const pw=(hold.kind && !riding) ? e : 0;
    if(pw>.001 || earW>.001 || reachW>.001){ me.g.updateMatrixWorld(true); me.g.getWorldQuaternion(_gq); F.set(0,0,1).applyQuaternion(_gq); F.y=0; if(F.lengthSq()<1e-6) F.set(0,0,1); F.normalize(); R.set(-F.z,0,F.x);
      if(pw>.001) (hold.kind==='laptop'?POSE.laptop:POSE.hand)(pw);
      if(reachW>.001) POSE.reach(reachW*.9);
      if(earW>.001) POSE.ears(earW*.95); }
    if(hpRoot) placePhones();
    updDuck(dt); updMusicVol();
    if(LAP.open){ me.g.localToWorld(_e.set(0, HH*.93, .17)); me.g.localToWorld(_l.set(0, HH*.555+.1, .42));
      const o=HOOK.camOverride; if(o && o.lap){ o.pos.copy(_e); o.look.copy(_l); } else HOOK.camOverride={pos:_e.clone(), look:_l.clone(), k:5, lap:true}; }
  });

  /* ============================== ESC dùng chung cho thiết bị ============================== */
  function setEsc(fn){ HOOK.onEscape=()=>{ fn(); return true; }; HOOK.onEscape.__gd=fn; }
  function clearEsc(fn){ if(HOOK.onEscape && HOOK.onEscape.__gd===fn) HOOK.onEscape=null; }
  let netCache={ok:null, at:-1e9};
  async function netOK(){ if(navigator.onLine===false) return false; if(netCache.ok!==null && performance.now()-netCache.at<45000) return netCache.ok;
    let ok=true; try{ const c=new AbortController(); const to=setTimeout(()=>c.abort(),4000); await fetch('https://www.google.com/generate_204',{mode:'no-cors',cache:'no-store',signal:c.signal}); clearTimeout(to); }catch(e){ ok=false; }
    netCache={ok, at:performance.now()}; return ok; }

  /* ============================== 💻 LAPTOP ============================== */
  const LAP={open:false, openedBy:null};
  const lapEl=document.createElement('div'); lapEl.id='gdLap'; lapEl.hidden=true;
  lapEl.innerHTML=`<div class="lapWrap"><div class="lapLid"><i class="lapCam"></i><div class="lapScr"><div class="os">
      <div class="osDesk"></div>
      <div class="osWin" hidden><div class="osTitle"><b></b><button class="osX" title="Đóng ứng dụng">✕</button></div><div class="osBody"></div></div>
      <div class="osBar"><button class="osStart" title="Màn hình chính">⊞ QC OS</button><span class="osRun"></span><span class="osSp"></span><span class="osClock"></span><button class="osOff" title="Cất laptop (L / Esc)">⏏ Cất laptop</button></div>
    </div></div></div><div class="lapDeck"><div class="lapKeys"></div><div class="lapPad"></div></div>
    <div class="lapHint">L / Esc: cất laptop · đang gõ trong trang web thì bấm ⏏ Cất laptop</div></div>`;
  document.body.appendChild(lapEl);
  { const k=lapEl.querySelector('.lapKeys'); let h=''; for(let r=0;r<4;r++) for(let c=0;c<15;c++) h+='<i></i>'; h+='<i style="grid-column:span 3"></i><i style="grid-column:span 2"></i><i style="grid-column:span 6"></i><i style="grid-column:span 2"></i><i style="grid-column:span 2"></i>'; k.innerHTML=h; }
  const Q=s=>lapEl.querySelector(s), desk=Q('.osDesk'), win=Q('.osWin'), winTitle=Q('.osTitle b'), osBody=Q('.osBody'), osRun=Q('.osRun'), osClock=Q('.osClock');
  Q('.osX').onclick=()=>closeApp(); Q('.osStart').onclick=()=>closeApp(); Q('.osOff').onclick=()=>lapClose();
  const APPS=[
    {id:'md', icon:'🖥️', name:'Master Dashboard', run:mdApp, keep:true},
    {id:'web', icon:'🌐', name:'Trình duyệt', run:browserApp, keep:true},
    {id:'bug', icon:'🐞', name:'Diệt Bug', run:bugGame},
    {id:'cards', icon:'🃏', name:'Lật thẻ QA', run:cardGame},
    {id:'notes', icon:'📝', name:'Ghi chú', run:notesApp, keep:true},
    {id:'music', icon:'🎧', name:'Nghe nhạc', direct:()=>{ lapClose(); setTimeout(()=>podOpen(), 450); }},
    {id:'sound', icon:'🔊', name:'Âm thanh', run:soundApp},   /* S19g 16/11: âm lượng + bật/tắt 'Âm thanh môi trường' */
    {id:'debug', icon:'🛠️', name:'Debug', run:debugApp, when:()=>!!(W.events && Array.isArray(W.events.list))},   /* chỉ hiện khi có công cụ debug (V2: W.events) */
  ];
  for(const A of APPS){ const b=document.createElement('button'); b.className='osIcon'; b.innerHTML=`<b>${A.icon}</b><span>${esc(A.name)}</span>`; b.onclick=()=>launch(A.id); desk.appendChild(b); A.btn=b; }
  const syncIcons=()=>{ for(const A of APPS) if(A.when && A.btn) A.btn.hidden=!A.when(); };   /* V2 nạp W.events sau gadgets → kiểm lại mỗi lần mở laptop */
  const appState={}; let curApp=null, clockT=0;
  function launch(id, arg){ const A=APPS.find(a=>a.id===id); if(!A) return; if(A.direct){ A.direct(arg); return; }
    if(curApp && curApp!==id) hideApp(curApp);
    let s=appState[id];
    if(!s){ const box=document.createElement('div'); box.className='osApp'; osBody.appendChild(box); s=appState[id]={box, api:{}}; s.api=A.run(box, arg)||{}; }
    else { s.box.hidden=false; if(s.api.show) s.api.show(arg); }
    curApp=id; win.hidden=false; winTitle.textContent=`${A.icon} ${A.name}`; osRun.textContent=`${A.icon} ${A.name}`; }
  function hideApp(id){ const s=appState[id], A=APPS.find(a=>a.id===id); if(!s) return;
    if(A.keep) s.box.hidden=true; else { try{ s.api.stop && s.api.stop(); }catch(e){} s.box.remove(); delete appState[id]; } }
  function closeApp(){ if(curApp) hideApp(curApp); curApp=null; win.hidden=true; osRun.textContent=''; }
  function tickClock(){ const d=new Date(); osClock.textContent=d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})+' · '+d.toLocaleDateString('vi-VN'); }
  function lapOpen(app, arg){
    if(LAP.open){ if(app) launch(app, arg); return true; }
    if(HOOK.vehicle || (W.V && W.V.riding && W.V.riding())){ toast('🚲 Xuống xe trước rồi hãy mở laptop (V).', 2600); return false; }
    if(HOOK.blockInput){ return false; }
    if(POD.open) podClose(); if(PHN.open) phClose();
    LAP.open=true; LAP.at=performance.now(); syncIcons(); W.clearKeys(); HOOK.blockInput=true; HOOK.labelGroup='none'; P.dancing=false; document.body.classList.add('gadget-mode');
    hold.kind='laptop'; hold.want=1; setEsc(lapClose);
    tickClock(); clearInterval(clockT); clockT=setInterval(tickClock, 15000);
    setTimeout(()=>{ if(!LAP.open) return; lapEl.hidden=false; requestAnimationFrame(()=>requestAnimationFrame(()=>lapEl.classList.add('on'))); if(app) launch(app, arg); }, 480);
    return true; }
  function lapClose(){ if(!LAP.open) return; LAP.open=false; clearInterval(clockT);
    lapEl.classList.remove('on'); setTimeout(()=>{ if(!LAP.open) lapEl.hidden=true; }, 380);
    if(curApp && !APPS.find(a=>a.id===curApp).keep) closeApp();
    if(document.activeElement && lapEl.contains(document.activeElement)) document.activeElement.blur();
    hold.want=0; if(HOOK.camOverride && HOOK.camOverride.lap) HOOK.camOverride=null;
    HOOK.blockInput=false; HOOK.labelGroup=W.inside?'interior':'world'; clearEsc(lapClose); document.body.classList.remove('gadget-mode'); W.canvas.focus(); }
  // L để cất (khi không gõ chữ). Lúc đang mở thì phím game bị chặn nên tự nghe ở đây.
  addEventListener('keydown', e=>{ if(!LAP.open || e.code!=='KeyL' || e.repeat || performance.now()-LAP.at<400) return;
    const t=e.target; if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return; e.preventDefault(); lapClose(); });

  // --- app: 🔊 Âm thanh – 'Âm thanh môi trường' (ambience.js + ambience_world.js): bật/tắt + âm lượng 0–100 % ---
  function soundApp(box){ const AM=()=>W.ambience;
    const render=()=>{ const a=AM(), on=a ? a.on : true, vol=Math.round((a ? a.volume : .6)*100);
      box.innerHTML=`<div class="dbg"><div class="dbgHead">🔊 Âm thanh môi trường</div><section class="dbgSec"><p class="dbgTip">Tiếng sóng, xe cộ, người nói chuyện, máy bay, còi xe khẩn cấp, thác nước, gió, chim/dế… đều nhỏ dần theo khoảng cách, luôn dịu. Đeo tai nghe nghe nhạc thì tự im.</p>
        <div class="dbgFoot" style="margin:0 0 12px"><button class="sndOn dbgBtn" style="flex:0 0 auto">${on?'🔊 Đang bật – bấm để tắt':'🔇 Đang tắt – bấm để bật'}</button></div>
        <label style="display:flex;align-items:center;gap:12px;font-weight:600">Âm lượng <input class="sndVol" type="range" min="0" max="100" step="5" value="${vol}" style="flex:1"> <b class="sndV" style="min-width:44px;text-align:right">${vol}%</b></label></section></div>`;
      box.querySelector('.sndOn').onclick=()=>{ const a2=AM(); const nv=!(a2 ? a2.on : true); if(a2 && a2.setOn) a2.setOn(nv); else try{ localStorage.setItem('qcworld-sfx', nv?'1':'0'); }catch(e){} try{ W.island && W.island.audio && W.island.audio.set(nv); }catch(e){} if(toast) toast(nv?'🔊 Đã bật âm thanh môi trường':'🔇 Đã tắt âm thanh môi trường', 1600); render(); };
      const sl=box.querySelector('.sndVol'), lb=box.querySelector('.sndV'); sl.oninput=()=>{ lb.textContent=sl.value+'%'; const a2=AM(); if(a2 && a2.setVolume) a2.setVolume(sl.value/100); else try{ localStorage.setItem('qcworld-sfx-vol', String(sl.value/100)); }catch(e){} }; };
    render(); return {show:render}; }

  // --- app: 🛠️ Debug – mục 🧪 Sự kiện thế giới (V2: W.events.list / trigger / active / stop; ẩn khi không có W.events) ---
  function debugApp(box){ let tm=0;
    const render=()=>{ const E=W.events, ok=!!(E && Array.isArray(E.list));
      box.innerHTML=`<div class="dbg"><div class="dbgHead">🛠️ Debug – công cụ thử nhanh</div>${ok ? `<section class="dbgSec"><h4>🧪 Sự kiện thế giới</h4><p class="dbgTip">Bấm để gọi sự kiện ngay (bỏ qua thời gian chờ). Laptop tự cất để bạn xem sự kiện.</p>
        <div class="dbgGrid">${E.list.map(e=>`<button class="dbgBtn" data-k="${esc(e.key)}"><b>${esc(e.key)}</b><span>${esc(e.name)}</span>${e.hotkey?`<i>${esc(e.hotkey)}</i>`:''}</button>`).join('')}</div>
        <div class="dbgFoot"><button class="dbgStop">⏹ Dừng tất cả</button><span class="dbgSt"></span></div></section>` : '<p class="dbgTip">Chế độ này chưa có công cụ debug.</p>'}</div>`;
      box.querySelectorAll('.dbgBtn').forEach(b=>b.onclick=()=>{ try{ W.events.trigger(b.dataset.k,{force:true}); }catch(e){ console.warn('[Debug] sự kiện', e); } lapClose(); });
      const stp=box.querySelector('.dbgStop'); if(stp) stp.onclick=()=>{ try{ W.events.stop(); }catch(e){} status(); if(toast) toast('⏹ Đã dừng mọi sự kiện thế giới', 2000); };
      status(); };
    const status=()=>{ const el=box.querySelector('.dbgSt'); if(!el || !W.events) return; let a=[]; try{ a=(W.events.active && W.events.active())||[]; }catch(e){} const names=(Array.isArray(a)?a:[a]).filter(Boolean).map(x=>typeof x==='string'?x:(x.name||x.key||'?'));
      el.textContent=names.length ? 'Đang chạy: '+names.join(', ') : 'Không có sự kiện nào đang chạy'; };
    render(); tm=setInterval(status, 1000);
    return {show:render, stop:()=>clearInterval(tm)}; }

  // --- app: Master Dashboard (chỉ khi máy có thư mục MD) ---
  async function mdAlive(){ try{ const c=new AbortController(); const t=setTimeout(()=>c.abort(),1800); await fetch(DASH+'/',{mode:'no-cors',cache:'no-store',signal:c.signal}); clearTimeout(t); return true; }catch(e){ return false; } }
  async function mdAvailable(){ try{ const r=await fetch('/api/md/available',{cache:'no-store'}); if(!r.ok) return false; const j=await r.json(); return j && j.available===true; }catch(e){ return false; } }
  function mdApp(box, arg){ let url=arg||'/', frame=null, token=0;
    const msg=(icon, title, sub, retry)=>{ box.innerHTML=`<div class="osMsg"><div class="big">${icon}</div><b>${title}</b>${sub?`<div>${sub}</div>`:''}${retry?'<button class="btn pri" data-r>↻ Thử lại</button>':''}</div>`; const r=box.querySelector('[data-r]'); if(r) r.onclick=()=>check(); frame=null; };
    async function check(){ const my=++token; msg('⏳','Đang kiểm tra Master Dashboard trên máy này…');
      const ok=await mdAvailable(); if(my!==token) return;
      if(!ok){ msg('🔒','Máy này không có Master Dashboard – không truy cập được', 'Ứng dụng chỉ mở được trên máy có cài Master Dashboard.'); return; }
      const up=await mdAlive(); if(my!==token) return;
      if(!up){ msg('😴','Master Dashboard có trên máy nhưng chưa chạy', 'Mở <code>MasterDashboard.vbs</code> (hoặc mở game bằng <code>QCWorld.vbs</code>) rồi bấm Thử lại.', true); return; }
      const zones=[{icon:'🏠', name:'Trang chủ', url:'/'}, ...(W.ZONES||[]).map(z=>({icon:z.icon, name:z.name, url:z.url}))];
      box.innerHTML=`<div class="mdApp"><div class="mdNav">${zones.map((z,i)=>`<button class="mdBtn" data-i="${i}">${z.icon} ${esc(z.name)}</button>`).join('')}<span class="osSp"></span><button class="mdBtn" data-ext>↗ Mở tab riêng</button></div><div class="mdView"></div></div>`;
      frame=document.createElement('iframe'); frame.allow='clipboard-read; clipboard-write'; box.querySelector('.mdView').appendChild(frame);
      box.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>go(zones[+b.dataset.i].url));
      box.querySelector('[data-ext]').onclick=()=>window.open(DASH+url, '_blank', 'noopener');
      go(url); }
    function go(u){ url=u||'/'; if(frame) frame.src=DASH+url; }
    check();
    return {show(a){ if(a!=null) url=a; check(); }}; }

  // --- app: Trình duyệt kiểu Chrome ---
  const BLOCK=['github.com','facebook.com','messenger.com','instagram.com','twitter.com','x.com','linkedin.com','tiktok.com','reddit.com','stackoverflow.com','medium.com',
    'mail.google.com','drive.google.com','docs.google.com','accounts.google.com','translate.google.com','youtube.com','chatgpt.com','openai.com','claude.ai','discord.com','slack.com',
    'notion.so','figma.com','zalo.me','shopee.vn','lazada.vn','tiki.vn','amazon.com','netflix.com','web.whatsapp.com','developer.mozilla.org','news.ycombinator.com'];
  function browserApp(box){
    box.innerHTML=`<div class="br"><div class="brTabs"><span class="brTabList"></span><button class="brNew" title="Tab mới">＋</button></div>
      <div class="brTool"><button data-b title="Lùi">◀</button><button data-f title="Tiến">▶</button><button data-r title="Tải lại">⟳</button><button data-h title="Trang chủ">⌂</button>
        <form class="brForm"><input class="brUrl" spellcheck="false" placeholder="Tìm với Google hoặc nhập địa chỉ web"></form><button data-x title="Mở trang này bằng trình duyệt thật">↗</button></div>
      <div class="brNote">Trang trắng hoặc báo “từ chối kết nối” = trang đó chặn hiển thị lồng → bấm <b>↗</b> để mở bằng trình duyệt thật.</div>
      <div class="brView"></div></div>`;
    const $b=s=>box.querySelector(s), view=$b('.brView'), urlIn=$b('.brUrl'), tabList=$b('.brTabList'); const tabs=[]; let cur=null;
    function resolve(raw){ const s=String(raw||'').trim(); if(!s) return {kind:'home'};
      let url=null; if(/^https?:\/\//i.test(s)) url=s; else if(/^(localhost|127\.0\.0\.1)(:\d+)?(\/\S*)?$/i.test(s)) url='http://'+s; else if(/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/i.test(s) && !/\s/.test(s)) url='https://'+s;
      if(!url) return {kind:'url', url:GQ(s), real:'https://www.google.com/search?hl=vi&q='+encodeURIComponent(s), show:s, title:'🔎 '+s};
      let u; try{ u=new URL(url); }catch(e){ return {kind:'url', url:GQ(s), real:GQ(s).replace('igu=1&',''), show:s, title:'🔎 '+s}; }
      if(/^(127\.0\.0\.1|localhost|\[::1\])$/.test(u.hostname) && u.port==='8765') return {kind:'md', path:u.pathname+u.search+u.hash};
      const real=u.href, host=u.hostname.replace(/^www\./,'');
      if(/(^|\.)google\.[a-z.]+$/.test(u.hostname) && ['/','/search','/webhp'].includes(u.pathname)){ if(u.pathname==='/') u.pathname='/webhp'; u.searchParams.set('igu','1'); }
      let yt=null; if(host==='youtube.com' && u.searchParams.get('v')) yt=u.searchParams.get('v'); if(host==='youtu.be') yt=u.pathname.slice(1,12);
      if(yt) return {kind:'url', url:'https://www.youtube.com/embed/'+encodeURIComponent(yt.slice(0,11)), real, show:real, title:'▶ YouTube'};
      if(BLOCK.some(b=>host===b || host.endsWith('.'+b)) && !(host==='youtube.com' && u.pathname.startsWith('/embed/'))) return {kind:'blocked', url:real, real, show:real, title:host};
      return {kind:'url', url:u.href, real, show:real, title:host}; }
    function renderTabs(){ tabList.innerHTML=''; for(const t of tabs){ const el=document.createElement('span'); el.className='brTab'+(t===cur?' on':''); el.innerHTML=`<span class="tt">${esc(t.title)}</span><button title="Đóng tab">✕</button>`;
        el.onclick=ev=>{ if(ev.target.tagName==='BUTTON'){ closeTab(t); ev.stopPropagation(); } else select(t); }; tabList.appendChild(el); } }
    function select(t){ cur=t; for(const x of tabs) x.view.hidden=x!==t; urlIn.value=t.show||''; renderTabs(); }
    function newTab(input){ if(tabs.length>=6){ toast('Tối đa 6 tab – đóng bớt tab nhé.', 2200); return; }
      const t={title:'Tab mới', show:'', real:'', hist:[], hi:-1, view:document.createElement('div')}; t.view.className='brPane'; view.appendChild(t.view); tabs.push(t); select(t); go(t, input||'', true); }
    function closeTab(t){ const i=tabs.indexOf(t); t.view.remove(); tabs.splice(i,1); if(!tabs.length) return newTab(''); if(cur===t) select(tabs[Math.max(0,i-1)]); else renderTabs(); }
    function homePage(t){ t.view.innerHTML=`<div class="brHome"><div class="brLogo">🔎</div><h2>Tìm kiếm trên Google</h2><form class="brSearch"><input placeholder="Nhập từ khoá hoặc địa chỉ web…" spellcheck="false"><button class="btn pri">Tìm</button></form>
        <div class="brTiles">${TILES.map((x,i)=>`<button data-t="${i}"><b>${x[0]}</b><span>${esc(x[1])}</span></button>`).join('')}</div></div>`;
      const f=t.view.querySelector('form'), inp=f.querySelector('input'); f.onsubmit=ev=>{ ev.preventDefault(); go(t, inp.value, true); };
      t.view.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>go(t, TILES[+b.dataset.t][2], true)); }
    async function go(t, input, push){ const r=resolve(input);
      if(r.kind==='md'){ launch('md', r.path||'/'); return; }
      if(push){ t.hist=t.hist.slice(0,t.hi+1); t.hist.push(input); t.hi=t.hist.length-1; }
      if(r.kind==='home'){ t.title='Tab mới'; t.show=''; t.real=''; homePage(t); if(t===cur) urlIn.value=''; renderTabs(); return; }
      t.title=r.title; t.show=r.show; t.real=r.real; if(t===cur) urlIn.value=r.show; renderTabs();
      if(r.kind==='blocked'){ t.view.innerHTML=`<div class="brHome"><div class="brLogo">🚧</div><h2>${esc(r.title)} không cho hiển thị lồng trong laptop</h2><p>Trang này chặn nhúng (bảo mật của chính trang đó).</p><button class="btn pri" data-o>↗ Mở bằng trình duyệt thật</button></div>`;
        t.view.querySelector('[data-o]').onclick=()=>window.open(r.real,'_blank','noopener'); return; }
      t.view.innerHTML='<div class="brHome"><div class="brLogo">⏳</div></div>';
      const ok=await netOK(); if(t.real!==r.real) return;
      if(!ok){ t.view.innerHTML='<div class="brHome"><div class="brLogo">📡</div><h2>No internet</h2><p>Không có kết nối mạng.</p><button class="btn pri" data-r>↻ Thử lại</button></div>'; t.view.querySelector('[data-r]').onclick=()=>{ netCache.ok=null; go(t, input, false); }; return; }
      t.view.innerHTML=''; const f=document.createElement('iframe'); f.referrerPolicy='no-referrer'; f.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals');
      f.allow='fullscreen; clipboard-write; encrypted-media; autoplay'; f.src=r.url; t.view.appendChild(f); }
    $b('.brNew').onclick=()=>newTab('');
    $b('.brForm').onsubmit=ev=>{ ev.preventDefault(); if(cur) go(cur, urlIn.value, true); };
    $b('[data-b]').onclick=()=>{ if(cur && cur.hi>0){ cur.hi--; go(cur, cur.hist[cur.hi], false); } };
    $b('[data-f]').onclick=()=>{ if(cur && cur.hi<cur.hist.length-1){ cur.hi++; go(cur, cur.hist[cur.hi], false); } };
    $b('[data-r]').onclick=()=>{ if(cur) go(cur, cur.hist[cur.hi]||'', false); };
    $b('[data-h]').onclick=()=>{ if(cur) go(cur, '', true); };
    $b('[data-x]').onclick=()=>{ if(cur) window.open(cur.real||'https://www.google.com/','_blank','noopener'); };
    urlIn.addEventListener('focus', ()=>urlIn.select());
    newTab('');
    return {show(a){ if(a && cur) go(cur, a, true); }, go:(s)=>cur&&go(cur,s,true)}; }
  const TILES=[['🔎','Google','https://www.google.com/webhp?hl=vi'],['📚','Wikipedia','https://vi.wikipedia.org/'],['🗺️','Bản đồ','https://www.google.com/maps?output=embed&hl=vi&q='+encodeURIComponent('Thành phố Hồ Chí Minh')],
    ['📰','Tin tức','tin tức hôm nay'],['🌦️','Thời tiết','thời tiết hôm nay'],['💱','Tỷ giá','tỷ giá USD hôm nay'],['🧑‍💻','W3Schools','https://www.w3schools.com/'],['🧪','ISTQB là gì','ISTQB foundation là gì']];

  // --- game: 🐞 Diệt Bug (tự thiết kế) ---
  function bugGame(box){ let best=LS.get('qcworld-bugbest',0);
    box.innerHTML=`<div class="gm"><div class="gmTop"><b>🐞 Diệt Bug</b><span>Điểm <b data-s>0</b></span><span>Combo <b data-c>0</b></span><span>⏱ <b data-t>30.0</b>s</span><span>Kỷ lục <b data-h>${best}</b></span><span class="osSp"></span><button class="btn pri" data-go>▶ Bắt đầu</button></div>
      <div class="gmGrid">${Array.from({length:12},(_,i)=>`<button class="gmCell" data-i="${i}"><small>TC-${String(i+1).padStart(2,'0')}</small><span></span></button>`).join('')}</div>
      <div class="gmTip">Bấm 🐞 bug (+10) và 🕷️ bug nghiêm trọng (+25) trước khi nó trốn mất. Đừng bấm ✨ tính năng đang chạy đúng (−15)! Diệt liên tiếp được cộng combo.</div><div class="gmEnd" hidden></div></div>`;
    const $g=s=>box.querySelector(s), cells=[...box.querySelectorAll('.gmCell')]; let timer=null, t=0, score=0, combo=0, live=new Array(12).fill(null), spawnIn=0;
    const hud=()=>{ $g('[data-s]').textContent=score; $g('[data-c]').textContent=combo; $g('[data-t]').textContent=Math.max(0,t).toFixed(1); };
    function set(i, it){ live[i]=it; const c=cells[i], sp=c.querySelector('span'); sp.textContent=it?it.e:''; c.className='gmCell'+(it?' on '+it.k:''); }
    function start(){ score=0; combo=0; t=30; spawnIn=.3; for(let i=0;i<12;i++) set(i,null); $g('.gmEnd').hidden=true; $g('[data-go]').textContent='↻ Chơi lại'; clearInterval(timer); timer=setInterval(tick,100); hud(); }
    function tick(){ t-=.1; spawnIn-=.1;
      for(let i=0;i<12;i++){ const it=live[i]; if(it){ it.life-=.1; if(it.life<=0){ if(it.k!=='feat' && !it.dead) combo=0; set(i,null); } } }
      if(spawnIn<=0){ const free=live.map((x,i)=>x?-1:i).filter(i=>i>=0); if(free.length){ const i=free[Math.floor(Math.random()*free.length)], r=Math.random(), speed=1-(30-t)/60;
          set(i, r<.16?{k:'feat',e:'✨',life:1.4}:r<.3?{k:'crit',e:'🕷️',life:.8*speed+.25}:{k:'bug',e:'🐞',life:1.1*speed+.3}); }
        spawnIn=.25+Math.random()*.45*(t/30+.3); }
      hud(); if(t<=0) end(); }
    function end(){ clearInterval(timer); timer=null; for(let i=0;i<12;i++) set(i,null);
      if(score>best){ best=score; LS.set('qcworld-bugbest',best); $g('[data-h]').textContent=best; }
      const rank=score<120?'Tester tập sự 🐣':score<240?'Tester chính hiệu 🔍':score<360?'QC Lead 🛡️':'Thợ săn bug huyền thoại 🏆';
      const en=$g('.gmEnd'); en.hidden=false; en.innerHTML=`<b>Hết giờ!</b><div>Điểm: <b>${score}</b> · Danh hiệu: ${rank}</div><button class="btn pri" data-again>↻ Chơi lại</button>`; en.querySelector('[data-again]').onclick=start; }
    cells.forEach((c,i)=>c.onclick=()=>{ if(!timer) return; const it=live[i];
      if(!it){ combo=0; hud(); return; }
      if(it.k==='feat'){ score=Math.max(0,score-15); combo=0; c.classList.add('bad'); set(i,null); }
      else { score+=(it.k==='crit'?25:10)+Math.min(combo,10)*2; combo++; live[i]=null; c.className='gmCell hit'; c.querySelector('span').textContent='💥'; setTimeout(()=>{ if(!live[i]) set(i,null); }, 180); }
      hud(); });
    $g('[data-go]').onclick=start;
    return {stop(){ clearInterval(timer); }}; }

  // --- game: 🃏 Lật thẻ QA (ghép thuật ngữ ↔ ý nghĩa) ---
  const PAIRS=[['BVA','Phân tích giá trị biên'],['EP','Phân vùng tương đương'],['Smoke test','Kiểm tra nhanh build có chạy được không'],['Regression','Kiểm tra lại tính năng cũ sau khi sửa'],
    ['Severity','Mức độ ảnh hưởng của lỗi'],['Priority','Độ gấp phải sửa lỗi'],['UAT','Người dùng nghiệm thu'],['Flaky test','Lúc pass lúc fail không rõ lý do'],['Test oracle','Nguồn để biết kết quả đúng'],
    ['Stub','Thành phần giả thay phần chưa có'],['Retest','Chạy lại đúng ca đã fail sau khi fix'],['Exploratory','Vừa học vừa thiết kế vừa chạy test'],['Status 404','Không tìm thấy tài nguyên'],
    ['Status 401','Chưa xác thực'],['SQL JOIN','Ghép dòng của 2 bảng theo điều kiện'],['Idempotent','Gọi nhiều lần kết quả như một lần'],['Load test','Đo hệ thống ở tải dự kiến'],['Root cause','Nguyên nhân gốc của lỗi']];
  function cardGame(box){ let best=LS.get('qcworld-cardbest',0), tmo=null;
    function deal(){ const pick=PAIRS.slice().sort(()=>Math.random()-.5).slice(0,8), cards=[];
      pick.forEach((p,k)=>{ cards.push({k,t:p[0],term:true}); cards.push({k,t:p[1]}); }); cards.sort(()=>Math.random()-.5);
      let open=[], moves=0, done=0, lock=false;
      box.innerHTML=`<div class="gm"><div class="gmTop"><b>🃏 Lật thẻ QA</b><span>Lượt <b data-m>0</b></span><span>Đã ghép <b data-d>0</b>/8</span><span>Kỷ lục ${best?best+' lượt':'—'}</span><span class="osSp"></span><button class="btn" data-new>↻ Ván mới</button></div>
        <div class="cdGrid">${cards.map((c,i)=>`<button class="cd${c.term?' term':''}" data-i="${i}"><span>${esc(c.t)}</span></button>`).join('')}</div>
        <div class="gmTip">Lật 2 thẻ: 1 thuật ngữ (thẻ xanh) + đúng ý nghĩa của nó thì ghép được. Càng ít lượt càng giỏi!</div><div class="gmEnd" hidden></div></div>`;
      box.querySelector('[data-new]').onclick=deal;
      box.querySelectorAll('.cd').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i; if(lock || b.classList.contains('up') || b.classList.contains('ok')) return;
        b.classList.add('up'); open.push(i); if(open.length<2) return;
        moves++; box.querySelector('[data-m]').textContent=moves; const [x,y]=open; open=[];
        const bx=box.querySelector(`[data-i="${x}"]`);
        if(cards[x].k===cards[y].k && !!cards[x].term!==!!cards[y].term){ bx.classList.add('ok'); b.classList.add('ok'); done++; box.querySelector('[data-d]').textContent=done;
          if(done===8){ if(!best || moves<best){ best=moves; LS.set('qcworld-cardbest',best); } const en=box.querySelector('.gmEnd'); en.hidden=false; en.innerHTML=`<b>Hoàn thành!</b><div>${moves} lượt${moves<=12?' – trí nhớ siêu đỉnh 🧠':''}</div><button class="btn pri" data-again>↻ Ván mới</button>`; en.querySelector('[data-again]').onclick=deal; } }
        else { lock=true; tmo=setTimeout(()=>{ bx.classList.remove('up'); b.classList.remove('up'); lock=false; }, 900); } }); }
    deal(); return {stop(){ clearTimeout(tmo); }}; }

  // --- app: 📝 Ghi chú ---
  function notesApp(box){ box.innerHTML='<div class="nt"><textarea spellcheck="false" placeholder="Ghi chú nhanh… (tự lưu trên máy này)"></textarea><div class="ntInfo"></div></div>';
    const ta=box.querySelector('textarea'), inf=box.querySelector('.ntInfo'); ta.value=LS.get('qcworld-lapnotes','')||''; let t=0;
    ta.addEventListener('input', ()=>{ clearTimeout(t); inf.textContent='Đang lưu…'; t=setTimeout(()=>{ LS.set('qcworld-lapnotes', ta.value); inf.textContent='Đã lưu ✓'; }, 400); });
    return {}; }

  /* ============================== 🎧 MÁY NGHE NHẠC ============================== */
  const POD={open:false};
  const MU={player:null, list:[], cur:-1, sel:-1, on:false, playing:false, vol:+LS.get('qcworld-pod-vol',70)||70, title:''};
  const BAD=new Set(LS.get('qcworld-pod-bad2',[])||[]), saveBad=()=>LS.set('qcworld-pod-bad2', [...BAD].slice(-400));   // video chủ sở hữu tắt hẳn quyền phát ngoài YouTube (đo khi đã phát qua localhost)
  const podEl=document.createElement('div'); podEl.id='gdPod'; podEl.className='gdDev'; podEl.hidden=true;
  podEl.innerHTML=`<div class="devTop"><b>🎧 QC Pod</b><span class="osSp"></span><button class="devX" title="Cất máy (Y / Esc)">✕</button></div>
    <form class="podSearch"><input placeholder="Tìm bài hát trên YouTube…" spellcheck="false" maxlength="100"><button class="btn pri" title="Tìm">🔎</button></form>
    <form class="podLink"><input placeholder="…hoặc dán link YouTube" spellcheck="false"><button class="btn" title="Thêm link">＋</button></form>
    <div class="podMsg">Gõ tên bài rồi Enter để tìm.</div><div class="podList"></div>
    <div class="podCtl"><div class="podSel">Chưa chọn bài</div><div class="podRow"><button class="btn pri" data-play>▶ Phát</button><button class="btn" data-pp title="Tạm dừng / tiếp tục">⏯</button><button class="btn" data-nx title="Bài tiếp">⏭</button><span>🔊</span><input type="range" min="0" max="100" data-vol><button class="btn" data-stop title="Tắt nhạc, tháo tai nghe">⏹</button></div></div>`;
  document.body.appendChild(podEl);
  const $p=s=>podEl.querySelector(s), podList=$p('.podList'), podMsg=$p('.podMsg');
  $p('[data-vol]').value=MU.vol;
  const nowEl=document.createElement('div'); nowEl.id='gdNow'; nowEl.hidden=true;
  nowEl.innerHTML=`<span class="nIco">🎧</span><div class="nT"><b>—</b><small>Tai nghe</small></div><button data-pp title="Tạm dừng / tiếp tục">⏸</button><button data-nx title="Bài tiếp">⏭</button><input type="range" min="0" max="100" data-vol title="Âm lượng"><button data-hp class="wide">🎧 Tháo</button><button data-op title="Mở máy nghe nhạc (Y)">☰</button><button data-st title="Tắt nhạc, tháo tai nghe">⏹</button>`;
  document.body.appendChild(nowEl);
  nowEl.querySelector('[data-vol]').value=MU.vol;
  function ytId(s){ s=(s||'').trim(); if(/^[\w-]{11}$/.test(s)) return s;
    try{ const u=new URL(s); if(u.hostname.includes('youtu.be')) return u.pathname.slice(1,12)||null; if(u.searchParams.get('v')) return u.searchParams.get('v').slice(0,11);
      const m=u.pathname.match(/\/(shorts|embed|live)\/([\w-]{11})/); if(m) return m[2]; }catch(e){} return null; }
  function renderList(){ podList.innerHTML=''; MU.list.forEach((it,i)=>{ const d=document.createElement('div'); d.className='podItem'+(i===MU.sel?' sel':'')+(i===MU.cur&&MU.on?' now':'')+(it.bad?' bad':'');
      d.innerHTML=`<img alt="" loading="lazy" referrerpolicy="no-referrer" src="https://i.ytimg.com/vi/${encodeURIComponent(it.id)}/mqdefault.jpg"><div><b>${esc(it.title||'Video YouTube')}</b><small>${esc([it.channel,it.len,it.bad?'⛔ chặn phát ngoài YouTube':''].filter(Boolean).join(' · '))}</small>${it.bad?'<button class="podYT" title="Chủ sở hữu không cho phát bài này ngoài YouTube – mở bản gốc bằng trình duyệt">↗ Mở trên YouTube</button>':''}</div>`;
      const yb=d.querySelector('.podYT'); if(yb) yb.onclick=ev=>{ ev.stopPropagation(); window.open('https://www.youtube.com/watch?v='+encodeURIComponent(it.id), '_blank', 'noopener'); };
      d.onclick=()=>{ MU.sel=i; renderList(); }; d.ondblclick=()=>play(i, true); podList.appendChild(d); });
    const s=MU.list[MU.sel]; $p('.podSel').textContent=s?`Đã chọn: ${s.title||s.id}`:'Chưa chọn bài'; }
  const pmsg=t=>{ podMsg.textContent=t; };
  async function search(q){ q=String(q||'').trim(); if(!q) return; pmsg(`⏳ Đang tìm “${q}”…`);
    try{ const c=new AbortController(); const to=setTimeout(()=>c.abort(), 30000);
      const r=await fetch('/api/yt/search?q='+encodeURIComponent(q), {cache:'no-store', signal:c.signal}); clearTimeout(to);
      let j=null; try{ j=await r.json(); }catch(e){ throw new Error('server-cu'); }
      if(!j.ok) throw new Error(j.offline?'offline':'loi');
      MU.list=(j.items||[]).map(x=>BAD.has(x.id) ? {...x, bad:true} : x); const firstOk=MU.list.findIndex(x=>!x.bad);
      MU.sel=MU.list.length ? (firstOk>=0?firstOk:0) : -1; MU.cur=-1; renderList();
      pmsg(MU.list.length?`${MU.list.length} kết quả – chọn bài rồi bấm ▶ Phát (bấm đúp để phát ngay). Phát đúng bản gốc ngay trong game.`:'Không tìm thấy bài nào – thử từ khoá khác.'); }
    catch(e){ pmsg(e.message==='offline'||e.name==='AbortError'||navigator.onLine===false ? 'No internet – không tìm được. Có mạng lại thì thử lại nhé.'
      : e.message==='server-cu' ? 'Máy chủ game là bản cũ – tắt rồi mở lại QC World (QCWorld.vbs) để bật tìm kiếm. Vẫn có thể dán link YouTube.' : 'Chưa tìm được – thử lại hoặc dán link YouTube.'); } }
  $p('.podSearch').onsubmit=ev=>{ ev.preventDefault(); search($p('.podSearch input').value); };
  $p('.podLink').onsubmit=ev=>{ ev.preventDefault(); const inp=$p('.podLink input'), id=ytId(inp.value);
    if(!id){ pmsg('Link YouTube chưa đúng. Ví dụ: https://www.youtube.com/watch?v=…'); return; }
    inp.value=''; MU.list.splice(MU.sel+1, 0, {id, title:'Video YouTube ('+id+')', channel:'link dán'}); MU.sel=MU.sel+1; if(MU.cur>=MU.sel) MU.cur++; renderList(); pmsg('Đã thêm link – bấm ▶ Phát.'); };
  $p('[data-play]').onclick=()=>{ if(MU.sel<0) return pmsg('Chọn 1 bài trong danh sách trước nhé.'); play(MU.sel, true); };
  for(const el of [podEl, nowEl]){
    el.querySelector('[data-pp]').onclick=()=>togglePause(); el.querySelector('[data-nx]').onclick=()=>next();
    el.querySelector('[data-vol]').oninput=e=>setVol(+e.target.value); }
  $p('[data-stop]').onclick=()=>stopMusic(); nowEl.querySelector('[data-st]').onclick=()=>stopMusic(); nowEl.querySelector('[data-op]').onclick=()=>podOpen(); nowEl.querySelector('[data-hp]').onclick=()=>togglePhones();
  $p('.devX').onclick=()=>podClose();
  function setVol(v){ MU.vol=v; LS.set('qcworld-pod-vol',v); for(const el of [podEl, nowEl]){ const s=el.querySelector('[data-vol]'); if(+s.value!==v) s.value=v; } MU.lastV=-1; }   // updMusicVol áp vào player ở khung sau
  /* Trình phát YouTube chạy trong trang nhỏ js/ytframe.html ở địa chỉ "localhost": YouTube chặn nhiều bài nhạc chính thức khi trang nhúng
     là địa chỉ IP (127.0.0.1) – đã thử: cùng bài "Official Video" bị chặn ở 127.0.0.1 nhưng phát được ở localhost.
     Game vẫn ở 127.0.0.1 (giữ nguyên dữ liệu lưu); điều khiển trình phát qua postMessage, chỉ nói chuyện với đúng trang localhost đó. */
  const PS={UNSTARTED:-1, ENDED:0, PLAYING:1, PAUSED:2, BUFFERING:3, CUED:5};
  function makeRemotePlayer(){
    const H=location.protocol+'//localhost'+(location.port?':'+location.port:''), host=document.createElement('div'), f=document.createElement('iframe');
    host.id='gdYTHost'; f.src=H+'/js/ytframe.html'; f.allow='autoplay; encrypted-media'; f.title='Trình phát nhạc tai nghe'; host.appendChild(f); document.body.appendChild(host);
    const st={s:PS.UNSTARTED, title:'', ready:false, q:[]};
    const raw=m=>{ try{ f.contentWindow.postMessage(Object.assign({qcyt:1}, m), H); }catch(e){} };
    const post=m=>{ if(st.ready) raw(m); else st.q.push(m); };
    addEventListener('message', e=>{ if(e.origin!==H || e.source!==f.contentWindow) return; const m=e.data; if(!m || m.qcyt!==1) return;
      if(m.ev==='ready' || (m.ev==='hello' && m.ready)){ if(!st.ready){ st.ready=true; st.q.splice(0).forEach(raw); } }
      else if(m.ev==='state'){ st.s=m.s; if(m.title) st.title=m.title; onYT({data:m.s}); }
      else if(m.ev==='error') onYTErr({data:m.code}); });
    const hello=()=>{ if(st.ready) return; raw({cmd:'hello'}); setTimeout(hello, 400); };
    f.addEventListener('load', hello);
    return {setVolume:v=>post({cmd:'vol', v}), playVideo:()=>post({cmd:'play'}), pauseVideo:()=>post({cmd:'pause'}), stopVideo:()=>post({cmd:'stop'}),
      loadVideoById:id=>{ st.s=PS.UNSTARTED; st.title=''; post({cmd:'load', id}); }, getPlayerState:()=>st.s, getVideoData:()=>({title:st.title}), get ready(){ return st.ready; }}; }
  function play(i, anim){ const it=MU.list[i]; if(!it) return;
    const wasWearing=wearing(); MU.cur=i; MU.sel=i; MU.on=true; MU.playing=false; MU.title=it.title||'Video YouTube'; it.bad=false; renderList(); renderNow();
    if(POD.open) podClose();
    if(!wasWearing){ phonesOn(); if(!MU.hinted){ MU.hinted=true; toast('🎧 Đeo tai nghe: âm thanh thành phố tắt hẳn – bấm 🎧 Tháo để nghe lại xung quanh.', 3800); } }
    MU.lastV=-1;   // âm lượng thật do updMusicVol điều khiển (0 khi chưa đeo xong → nhạc vào dần khi tai nghe áp tai)
    if(!MU.player) MU.player=makeRemotePlayer();
    const p=MU.player; p.loadVideoById(it.id);
    setTimeout(()=>{ if(MU.on && MU.cur===i && !p.ready){ toast('📡 No internet – không tải được YouTube.', 3200); stopMusic(); } }, 20000); }
  function togglePhones(){ if(wearing()){ phonesOff(); return; }
    if(!MU.on){ toast('🎧 Chưa có bài nào – mở máy nghe nhạc (Y) chọn bài nhé.', 2600); return; }
    phonesOn(); try{ MU.player && MU.player.playVideo(); }catch(e){} }
  function onYT(e){ MU.playing=e.data===PS.PLAYING;
    if(MU.playing){ const d=MU.player.getVideoData(); if(d && d.title){ MU.title=d.title; const it=MU.list[MU.cur]; if(it && /^Video YouTube/.test(it.title)) it.title=d.title; } }
    if(e.data===PS.ENDED) next(true); renderNow(); }
  // Bài mà chủ sở hữu tắt hẳn quyền phát ngoài YouTube (mã 101/150/153 cả khi chạy ở localhost): không tự đổi sang bản khác –
  // báo rõ + nút "↗ Mở trên YouTube" để nghe đúng bản gốc bằng trình duyệt.
  function onYTErr(e){ const code=e && e.data, it=MU.list[MU.cur]; MU.playing=false;
    const blocked=code===101 || code===150 || code===153;
    if(it){ it.bad=true; if(blocked){ BAD.add(it.id); saveBad(); } }
    renderList(); if(!MU.on || !it) return;
    const msg=blocked?`⛔ Chủ sở hữu “${it.title}” không cho phát bài này ngoài trang YouTube – bấm “↗ Mở trên YouTube” ở bài đó để nghe bản gốc bằng trình duyệt.`:'⚠️ Bài này không phát được (video lỗi / đã bị xoá) – chọn bài khác nhé.';
    toast(msg, 5000); MU.on=false; phonesOff(); renderNow(); podOpen(); pmsg(msg); renderList(); }
  function togglePause(){ const p=MU.player; if(!MU.on || !p) return;
    if(!wearing()){ togglePhones(); return; }   // đang tháo tai nghe → đeo lại rồi phát
    if(p.getPlayerState()===PS.PLAYING) p.pauseVideo(); else p.playVideo(); }
  function next(auto){ if(!MU.list.length) return; const i=MU.cur+1;
    if(i>=MU.list.length){ if(auto){ MU.playing=false; renderNow(); } toast('🎧 Hết danh sách – mở máy (Y) tìm thêm bài nhé.', 2600); return; }
    play(i, false); }
  function stopMusic(){ const was=wearing(); MU.on=false; MU.playing=false; if(was) phonesOff(); else if(MU.player){ try{ MU.player.stopVideo(); }catch(e){} } renderNow(); renderList(); }   // đang đeo: tháo xong mới dừng hẳn (afterTakeoff)
  function renderNow(){ if(!nowEl) return; nowEl.hidden=!MU.on; if(!MU.on) return; nowEl.querySelector('.nT b').textContent=MU.title||'—';
    const w=wearing(); nowEl.querySelector('.nT small').textContent=!w?'🎧 Đã tháo tai nghe – đang nghe âm thanh thành phố':MU.playing?'🔇 Đang đeo tai nghe – âm thanh xung quanh đã tắt':'Đang tải / tạm dừng';
    nowEl.querySelector('[data-pp]').textContent=MU.playing&&w?'⏸':'▶'; const hb=nowEl.querySelector('[data-hp]'); hb.textContent=w?'🎧 Tháo':'🎧 Đeo'; hb.title=w?'Tháo tai nghe – nghe lại âm thanh thành phố (nhạc tạm dừng)':'Đeo tai nghe – nghe tiếp nhạc'; }
  function podOpen(){ if(LAP.open || HOOK.blockInput) return; if(PHN.open) phClose(); if(POD.open) return;
    POD.open=true; hold.kind='player'; hold.want=1; podEl.hidden=false; requestAnimationFrame(()=>requestAnimationFrame(()=>podEl.classList.add('on'))); setEsc(podClose); renderList(); }
  function podClose(){ if(!POD.open) return; POD.open=false; if(hold.kind==='player') hold.want=0; podEl.classList.remove('on'); setTimeout(()=>{ if(!POD.open) podEl.hidden=true; }, 320);
    clearEsc(podClose); if(document.activeElement && podEl.contains(document.activeElement)) document.activeElement.blur(); W.canvas.focus(); }

  /* ============================== 📱 ĐIỆN THOẠI ============================== */
  const PH=Object.assign({num:'', contacts:[], threads:{}, unread:{}}, LS.get('qcworld-phone',{}));
  const PHONE_RE=/^555-\d{3}-\d{4}$/;
  if(!PHONE_RE.test(PH.num)){ PH.num=`555-${100+Math.floor(Math.random()*900)}-${String(Math.floor(Math.random()*10000)).padStart(4,'0')}`; }
  let phSaveT=0; const savePH=()=>{ clearTimeout(phSaveT); phSaveT=setTimeout(()=>LS.set('qcworld-phone',{num:PH.num, contacts:PH.contacts, threads:PH.threads, unread:PH.unread}),150); };
  savePH();
  const PHN={open:false, view:'home', arg:null, cur:null, temp:false, who:[], whoAt:0};
  const myNum=()=>PHN.cur||PH.num;
  const online=()=>!!(W.multi && W.multi.connected && W.multi.connected());
  const normNum=s=>{ const d=String(s||'').replace(/\D/g,''); return d.length===10 && d.startsWith('555') ? `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}` : null; };
  const nameOf=n=>{ const c=PH.contacts.find(c=>c.num===n); return c?c.name:null; };
  const phEl=document.createElement('div'); phEl.id='gdPhone'; phEl.className='gdDev'; phEl.hidden=true;
  phEl.innerHTML=`<div class="phNotch"></div><div class="phStatus"><span class="phTime"></span><span class="osSp"></span><span class="phSig"></span></div><div class="phBody"></div>
    <div class="phNav"><button data-back title="Quay lại">‹</button><button data-home title="Màn hình chính">●</button><button data-close title="Cất điện thoại (O / Esc)">✕</button></div>`;
  document.body.appendChild(phEl);
  const phBody=phEl.querySelector('.phBody');
  phEl.querySelector('[data-back]').onclick=()=>phGo(PHN.view.startsWith('thread')||PHN.view==='compose'?'msgs':'home');
  phEl.querySelector('[data-home]').onclick=()=>phGo('home'); phEl.querySelector('[data-close]').onclick=()=>phClose();
  const unreadTotal=()=>Object.values(PH.unread).reduce((a,b)=>a+(b|0),0);
  function addMsg(num, m){ const th=PH.threads[num]||(PH.threads[num]=[]); th.push(m); if(th.length>200) th.splice(0, th.length-200); savePH(); }
  function phGo(view, arg){ PHN.view=view; PHN.arg=arg; if(view==='thread' && arg){ delete PH.unread[arg]; savePH(); updBadge(); } if(view==='online') askWho(); phRender(); }
  function phRender(){ if(!PHN.open) return; const ol=online();
    phEl.querySelector('.phTime').textContent=new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
    phEl.querySelector('.phSig').textContent=ol?'📶 QC Mobile':'📵 Offline';
    const offBar=ol?'':`<div class="phOff">📵 Bạn đang chơi một mình. Nhắn tin cần vào <b>chế độ nhiều người</b>.<button class="btn pri" data-mp>👥 Vào chế độ nhiều người (J)</button></div>`;
    const v=PHN.view; let h='';
    if(v==='home'){ const u=unreadTotal();
      h=`<div class="phClock">${new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</div><div class="phDate">${new Date().toLocaleDateString('vi-VN',{weekday:'long', day:'numeric', month:'numeric'})}</div>
        <div class="phMe">☎️ Số của bạn<b>${esc(myNum())}</b>${PHN.temp?'<small>số tạm cho cửa sổ này (số chính đang dùng ở cửa sổ khác)</small>':''}</div>${offBar}
        <div class="phApps"><button data-go="msgs"><b>💬${u?`<i class="gdBadge">${u}</i>`:''}</b>Tin nhắn</button><button data-go="contacts"><b>👥</b>Danh bạ</button><button data-go="online"><b>📡</b>Đang online</button><button data-go="compose"><b>✏️</b>Soạn tin</button></div>`; }
    else if(v==='msgs'){ const nums=Object.keys(PH.threads).filter(n=>PH.threads[n].length).sort((a,b)=>PH.threads[b].at(-1).ts-PH.threads[a].at(-1).ts);
      h=`<div class="phHead">💬 Tin nhắn<button class="btn pri" data-go="compose">✏️ Soạn</button></div>${offBar}<div class="phList">${nums.length?nums.map(n=>{ const L=PH.threads[n].at(-1), u=PH.unread[n]|0;
        return `<button class="phRow" data-th="${esc(n)}"><b>${esc(nameOf(n)||L.name||n)}${u?` <i class="gdBadge">${u}</i>`:''}</b><small>${L.me?'Bạn: ':''}${esc(L.text)}</small></button>`; }).join(''):'<div class="phEmpty">Chưa có tin nhắn nào.</div>'}</div>`; }
    else if(v==='thread'){ const n=PHN.arg, th=PH.threads[n]||[], nm=nameOf(n), title=nm||(th.find(m=>!m.me)||{}).name||n;
      h=`<div class="phHead">${esc(title)}${title!==n?`<small>${esc(n)}</small>`:''}${nm?'':`<button class="btn" data-save="${esc(n)}">＋ Lưu</button>`}</div>${offBar}
        <div class="phChat">${th.map(m=>`<div class="bub ${m.me?'me':'them'}">${esc(m.text)}<small>${new Date(m.ts).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}${m.me?' · '+({sending:'đang gửi…',sent:'✓ đã gửi',queued:'🕓 chờ người nhận online',fail:'⚠️ lỗi'}[m.st]||''):''}</small></div>`).join('')||'<div class="phEmpty">Hãy gửi lời chào 👋</div>'}</div>
        <form class="phSend"><input placeholder="${ol?'Nhập tin nhắn…':'Cần vào chế độ nhiều người để nhắn'}" maxlength="300" ${ol?'':'disabled'}><button class="btn pri" ${ol?'':'disabled'}>➤</button></form>`; }
    else if(v==='compose'){ h=`<div class="phHead">✏️ Tin nhắn mới</div>${offBar}<form class="phForm"><label>Gửi tới số</label><input name="to" list="gdPhList" placeholder="555-123-4567" value="${esc(PHN.arg||'')}">
        <datalist id="gdPhList">${PH.contacts.map(c=>`<option value="${esc(c.num)}">${esc(c.name)}</option>`).join('')}</datalist><label>Nội dung</label><textarea name="text" maxlength="300" placeholder="Nhập tin nhắn…"></textarea><button class="btn pri" ${ol?'':'disabled'}>➤ Gửi</button></form>`; }
    else if(v==='contacts'){ const pre=PHN.arg||{};
      h=`<div class="phHead">👥 Danh bạ</div><div class="phList">${PH.contacts.length?PH.contacts.map((c,i)=>`<div class="phRow"><b>${esc(c.name)}</b><small>${esc(c.num)}</small><span class="phAct"><button class="btn" data-msg="${esc(c.num)}" title="Nhắn tin">💬</button><button class="btn" data-del="${i}" title="Xoá">🗑</button></span></div>`).join(''):'<div class="phEmpty">Danh bạ trống – thêm số bên dưới hoặc lưu từ mục 📡 Đang online.</div>'}</div>
        <form class="phForm add"><input name="cname" placeholder="Tên" maxlength="24" value="${esc(pre.name||'')}"><input name="cnum" placeholder="555-123-4567" value="${esc(pre.num||'')}"><button class="btn pri">＋ Lưu số</button></form>`; }
    else if(v==='online'){ const L=PHN.who.filter(x=>x.num!==myNum());
      h=`<div class="phHead">📡 Đang online<button class="btn" data-who>⟳</button></div>${offBar}<div class="phList">${ol?(L.length?L.map(x=>`<div class="phRow"><b>${esc(x.name)}</b><small>${esc(x.num)}</small><span class="phAct">${nameOf(x.num)?'':`<button class="btn" data-add="${esc(x.num)}" data-nm="${esc(x.name)}" title="Lưu vào danh bạ">＋</button>`}<button class="btn" data-msg="${esc(x.num)}" title="Nhắn tin">💬</button></span></div>`).join(''):'<div class="phEmpty">Chưa có ai khác có điện thoại online.</div>'):''}</div>`; }
    phBody.innerHTML=h; phBody.scrollTop=0;
    const ch=phBody.querySelector('.phChat'); if(ch) ch.scrollTop=ch.scrollHeight;
    phBody.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>phGo(b.dataset.go));
    phBody.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>phGo('thread', b.dataset.th));
    phBody.querySelectorAll('[data-msg]').forEach(b=>b.onclick=()=>phGo('thread', b.dataset.msg));
    phBody.querySelectorAll('[data-mp]').forEach(b=>b.onclick=()=>{ phClose(); if(W.multi && W.multi.open) W.multi.open(); else if(HOOK.keys.KeyJ) HOOK.keys.KeyJ(); });
    phBody.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ PH.contacts.splice(+b.dataset.del,1); savePH(); phRender(); });
    phBody.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{ saveContact(b.dataset.nm, b.dataset.add); phRender(); });
    phBody.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{ const th=PH.threads[b.dataset.save]||[]; phGo('contacts', {num:b.dataset.save, name:(th.find(m=>!m.me)||{}).name||''}); const i=phBody.querySelector('[name=cname]'); if(i) i.focus(); });
    phBody.querySelectorAll('[data-who]').forEach(b=>b.onclick=()=>askWho(true));
    const sf=phBody.querySelector('.phSend'); if(sf) sf.onsubmit=ev=>{ ev.preventDefault(); const inp=sf.querySelector('input'); if(sendSms(PHN.arg, inp.value)){ inp.value=''; phRender(); setTimeout(()=>{ const i=phBody.querySelector('.phSend input'); if(i) i.focus(); },0); } };
    const cf=phBody.querySelector('.phForm:not(.add)'); if(cf) cf.onsubmit=ev=>{ ev.preventDefault(); const to=normNum(cf.querySelector('[name=to]').value); if(!to){ toast('Số điện thoại chưa đúng (dạng 555-123-4567).', 2600); return; } if(sendSms(to, cf.querySelector('[name=text]').value)) phGo('thread', to); };
    const af=phBody.querySelector('.phForm.add'); if(af) af.onsubmit=ev=>{ ev.preventDefault(); const n=normNum(af.querySelector('[name=cnum]').value), nm=af.querySelector('[name=cname]').value.trim(); if(!nm || !n){ toast('Nhập tên và số dạng 555-123-4567 nhé.', 2600); return; } saveContact(nm, n); PHN.arg=null; phRender(); }; }
  function saveContact(name, num){ name=String(name||'').trim().slice(0,24); if(!name || !PHONE_RE.test(num)) return; const c=PH.contacts.find(c=>c.num===num); if(c) c.name=name; else PH.contacts.push({name, num}); PH.contacts.sort((a,b)=>a.name.localeCompare(b.name,'vi')); savePH(); toast(`👥 Đã lưu ${name} (${num})`, 2000); }
  function sendSms(to, text){ to=normNum(to); text=String(text||'').trim().slice(0,300); if(!to || !text) return false;
    if(!online()){ toast('📵 Cần vào chế độ nhiều người (phím J) để nhắn tin.', 3000); return false; }
    if(to===myNum()){ toast('Không tự nhắn cho chính mình được 🙂', 2200); return false; }
    const cid=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    addMsg(to, {me:true, text, ts:Date.now(), st:'sending', cid}); W.multi.send({t:'sms', to, text, cid}); return true; }
  function askWho(force){ if(!online()) return; if(!force && performance.now()-PHN.whoAt<3000) return; PHN.whoAt=performance.now(); W.multi.send({t:'who'}); }
  let AC=null; function ring(){ try{ if(!AC){ AC=new (window.AudioContext||window.webkitAudioContext)(); AC.__gdKeep=true; }   // chuông điện thoại vẫn nghe khi đeo tai nghe
      if(AC.state==='suspended') AC.resume(); const t=AC.currentTime;
      for(const [f,d] of [[988,0],[1319,.13]]){ const o=AC.createOscillator(), g=AC.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0,t+d); g.gain.linearRampToValueAtTime(.09,t+d+.012); g.gain.exponentialRampToValueAtTime(.0005,t+d+.22); o.connect(g).connect(AC.destination); o.start(t+d); o.stop(t+d+.25); } }catch(e){} }
  function onMP(m){
    if(m.t==='phone_ok'){ PHN.cur=m.num; PHN.temp=!!m.temp; if(m.temp) toast(`📱 Số ${PH.num} đang dùng ở cửa sổ khác – cửa sổ này dùng số tạm ${m.num}.`, 4200); phRender(); }
    else if(m.t==='sms'){ const from=normNum(m.from); if(!from) return; addMsg(from, {me:false, text:String(m.text||'').slice(0,300), ts:Date.now(), name:String(m.name||'').slice(0,24)});
      const viewing=PHN.open && PHN.view==='thread' && PHN.arg===from;
      if(!viewing){ PH.unread[from]=(PH.unread[from]|0)+1; savePH(); toast(`💬 ${nameOf(from)||m.name||from}: ${String(m.text||'').slice(0,80)}`, 4200); }
      ring(); updBadge(); phRender(); }
    else if(m.t==='sms_ack'){ for(const th of Object.values(PH.threads)){ const x=th.find(k=>k.cid===m.cid); if(x){ x.st=!m.ok?'fail':m.delivered?'sent':'queued'; savePH(); phRender(); break; } } }
    else if(m.t==='who'){ PHN.who=Array.isArray(m.list)?m.list.filter(x=>x && PHONE_RE.test(x.num)).map(x=>({name:String(x.name||'').slice(0,24), num:x.num})):[]; phRender(); } }
  let mpHooked=false, mpPoll=0;
  function hookMP(dt){ if(mpHooked) return; mpPoll-=dt; if(mpPoll>0) return; mpPoll=1;
    const M=W.multi; if(!M || !M.on || !M.onOpen || !M.send) return; mpHooked=true;
    M.on(onMP); M.onOpen(()=>{ PHN.cur=null; PHN.temp=false; M.send({t:'phone', num:PH.num}); phRender(); });
    if(M.connected()) M.send({t:'phone', num:PH.num}); }
  let phClock=0;
  function phOpen(){ if(LAP.open || HOOK.blockInput) return; if(POD.open) podClose(); if(PHN.open) return;
    PHN.open=true; hold.kind='phone'; hold.want=1; phEl.hidden=false; requestAnimationFrame(()=>requestAnimationFrame(()=>phEl.classList.add('on'))); setEsc(phClose);
    phGo(unreadTotal()?'msgs':PHN.view==='thread'?'thread':'home', PHN.arg); clearInterval(phClock); phClock=setInterval(()=>{ const t=phEl.querySelector('.phTime'); if(t) t.textContent=new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}); }, 20000); }
  function phClose(){ if(!PHN.open) return; PHN.open=false; clearInterval(phClock); if(hold.kind==='phone') hold.want=0; phEl.classList.remove('on'); setTimeout(()=>{ if(!PHN.open) phEl.hidden=true; }, 320);
    clearEsc(phClose); if(document.activeElement && phEl.contains(document.activeElement)) document.activeElement.blur(); W.canvas.focus(); }

  /* ============================== PHÍM TẮT + THANH THIẾT BỊ ============================== */
  const dock=document.createElement('div'); dock.id='gdDock';
  dock.innerHTML=`<button data-k="L" title="💻 Laptop (L)">💻<span class="key">L</span></button><button data-k="Y" title="🎧 Máy nghe nhạc (Y)">🎧<span class="key">Y</span></button><button data-k="O" title="📱 Điện thoại (O)">📱<span class="key">O</span><i class="gdBadge" hidden></i></button>`;
  document.body.appendChild(dock);
  dock.querySelector('[data-k="L"]').onclick=()=>{ LAP.open?lapClose():lapOpen(); };
  dock.querySelector('[data-k="Y"]').onclick=()=>{ POD.open?podClose():podOpen(); };
  dock.querySelector('[data-k="O"]').onclick=()=>{ PHN.open?phClose():phOpen(); };
  function updBadge(){ const b=dock.querySelector('.gdBadge'), u=unreadTotal(); b.hidden=!u; b.textContent=u>9?'9+':u; }
  updBadge();
  HOOK.keys.KeyL=(e)=>{ if(LAP.open) lapClose(); else lapOpen(); };
  HOOK.keys.KeyY=()=>{ POD.open?podClose():podOpen(); };
  HOOK.keys.KeyO=()=>{ PHN.open?phClose():phOpen(); };
  try{ const c=document.getElementById('helpWrap').querySelector('.ctrl');
    for(const [k,t] of [['L','💻 Laptop: Master Dashboard (nếu máy có), trình duyệt, game QA – L/Esc để cất'],['Y','🎧 Máy nghe nhạc: tìm YouTube, đeo tai nghe nghe nhạc'],['O','📱 Điện thoại: số riêng, danh bạ, nhắn tin khi chơi nhiều người']]){
      const a=document.createElement('div'); a.className='ks'; a.innerHTML=`<span class="key">${k}</span>`; const b=document.createElement('div'); b.textContent=t; c.append(a,b); } }catch(e){}

  // âm thanh môi trường 3D (sóng biển, xe cộ theo khoảng cách) – thay cho nhạc nền
  try{ const m=await import('./ambience.js'); W.ambience=m.makeAmbience(W); }catch(e){ console.warn('ambience', e); }

  const api={
    laptop:{open:lapOpen, close:lapClose, openMD:(url)=>lapOpen('md', url||'/'), launch, get isOpen(){ return LAP.open; }},
    music:{open:podOpen, close:podClose, search, play:(i)=>play(i,true), stop:stopMusic, next, state:MU, togglePhones, get headphones(){ return wearing(); }, get hp(){ return HP.state; }, get hpT(){ return HP.t; }, get muted(){ return AUDQ.on; }, audq:AUDQ, get hpObj(){ return hpRoot; }, bones},
    phone:{open:phOpen, close:phClose, send:sendSms, go:phGo, state:PH, get number(){ return myNum(); }, get online(){ return online(); }},
    hold,
  };
  // 💰 nút "+" nạp tiền cạnh ví + 2 đoạn cắt cảnh (js/topup.js) – dùng chung điện thoại & tư thế cầm đồ của module này
  try{ const m=await import('./topup.js');
    api.topup=m.makeTopup(W, ctx, {hold, phone:{open:phOpen, close:phClose, go:phGo, render:phRender, addMsg, el:phEl, body:phBody, state:PH, save:savePH, get isOpen(){ return PHN.open; }, get view(){ return PHN.view; }}});
  }catch(e){ console.warn('topup', e); }
  return api;

  function injectCSS(){ const s=document.createElement('style'); s.textContent=`
body.gadget-mode #top, body.gadget-mode #hint, body.gadget-mode #music, body.gadget-mode #buffs, body.gadget-mode #fps, body.gadget-mode #prompt, body.gadget-mode #chatLog, body.gadget-mode #gdDock, body.gadget-mode #gdNow{display:none!important}
#gdDock{position:fixed;right:16px;bottom:46px;z-index:6;display:flex;gap:6px}
#gdDock button{position:relative;width:46px;height:40px;border-radius:12px;border:1px solid var(--line);background:rgba(18,24,36,.72);color:#fff;font-size:19px;cursor:pointer;display:grid;place-items:center;padding:0}
#gdDock button:hover{background:rgba(44,58,86,.92)}
#gdDock .key{position:absolute;right:2px;bottom:2px;min-width:0;height:13px;padding:0 3px;font-size:9px;border-radius:3px}
.gdBadge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:9px;background:#ff4f6d;color:#fff;font:700 11px/18px "Segoe UI",sans-serif;font-style:normal;text-align:center;padding:0 4px}
.phApps .gdBadge,.phRow .gdBadge{position:static;display:inline-block;margin-left:4px;vertical-align:middle}
#gdNow{position:fixed;right:16px;bottom:94px;z-index:6;width:300px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 10px;border-radius:14px;background:rgba(18,24,36,.82);border:1px solid var(--line);box-shadow:0 8px 24px rgba(0,0,0,.3)}
#gdNow .nIco{font-size:22px}#gdNow .nT{flex:1 1 calc(100% - 40px);min-width:0;display:flex;flex-direction:column}#gdNow .nT b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#gdNow .nT small{font-size:11px;color:var(--mut)}
#gdNow button{background:rgba(255,255,255,.1);border:1px solid var(--line);color:#fff;border-radius:8px;width:30px;height:28px;cursor:pointer;padding:0}
#gdNow input[type=range]{flex:1;min-width:60px}
#gdNow button.wide{width:auto;padding:0 8px;font:600 12px "Segoe UI",sans-serif}
#gdYTHost{position:fixed;left:0;bottom:0;width:200px;height:200px;opacity:0;pointer-events:none;z-index:-1;overflow:hidden}
#gdYTHost iframe{width:200px;height:200px;border:0}
/* laptop */
#gdLap{position:fixed;inset:0;z-index:30;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 52%,rgba(0,0,0,0) 52%,rgba(0,0,0,.6) 100%);opacity:0;transition:opacity .35s;pointer-events:none}
#gdLap.on{opacity:1;pointer-events:auto}
#gdLap .lapWrap{width:min(96vw,150vh);transform:translateY(22vh) scale(.78);transition:transform .45s cubic-bezier(.2,.9,.25,1.08)}
#gdLap.on .lapWrap{transform:none}
.lapLid{position:relative;background:#16191f;border-radius:18px 18px 6px 6px;padding:2.1vh 1.3vw 1.3vh;box-shadow:0 0 0 2px #2c313a inset,0 24px 60px rgba(0,0,0,.65)}
.lapCam{position:absolute;top:.75vh;left:50%;width:7px;height:7px;margin-left:-3px;border-radius:50%;background:#07090c;box-shadow:0 0 0 2px #2a2f38}
.lapScr{height:min(77vh,calc(min(96vw,150vh)*.56));border-radius:4px;overflow:hidden;background:#0f1724}
.lapDeck{position:relative;height:11vh;margin:0 -2.5%;background:linear-gradient(#cfd4dc,#9aa1ad);border-radius:0 0 26px 26px;transform:perspective(900px) rotateX(30deg);transform-origin:top;box-shadow:0 18px 30px rgba(0,0,0,.5)}
.lapKeys{position:absolute;left:12%;right:12%;top:8%;height:62%;display:grid;grid-template-columns:repeat(15,1fr);grid-auto-rows:1fr;gap:4px 5px}
.lapKeys i{background:linear-gradient(#2c3038,#1d2026);border-radius:4px;box-shadow:0 2px 0 #0b0c0f}
.lapPad{position:absolute;left:41%;right:41%;bottom:5%;height:22%;border-radius:6px;background:rgba(0,0,0,.1);box-shadow:inset 0 0 0 1px rgba(0,0,0,.22)}
.lapHint{text-align:center;color:#cfd6e4;font-size:12px;margin-top:.6vh;text-shadow:0 1px 3px #000}
.os{height:100%;display:flex;flex-direction:column;position:relative;font:14px "Segoe UI",system-ui,sans-serif;color:#eef2f8;background:radial-gradient(ellipse at 20% 10%,#2c5d8f,transparent 60%),radial-gradient(ellipse at 90% 90%,#5b3a9b,transparent 55%),#131c2e}
.osDesk{flex:1;min-height:0;padding:22px;display:grid;grid-template-columns:repeat(auto-fill,104px);grid-auto-rows:104px;gap:10px;align-content:start}
.osIcon{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:0;border-radius:12px;background:transparent;color:#fff;cursor:pointer;font:600 12.5px "Segoe UI",sans-serif;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.osIcon b{font-size:40px;line-height:1}.osIcon:hover{background:rgba(255,255,255,.14)}
.osWin{position:absolute;inset:0 0 40px 0;display:flex;flex-direction:column;background:#fff;color:#1b2233}
.osTitle{height:34px;flex:none;display:flex;align-items:center;gap:8px;padding:0 4px 0 12px;background:#e6eaf1;font-size:13px}
.osX{margin-left:auto;width:40px;height:28px;border:0;background:transparent;font-size:14px;cursor:pointer;border-radius:6px}.osX:hover{background:#e5484d;color:#fff}
.osBody{flex:1;min-height:0;position:relative}.osApp{position:absolute;inset:0;overflow:auto}
.osBar{height:40px;flex:none;display:flex;align-items:center;gap:10px;padding:0 10px;background:rgba(8,12,20,.88);color:#fff;font-size:13px;position:relative;z-index:2}
.osBar button{border:0;border-radius:8px;background:rgba(255,255,255,.1);color:#fff;padding:6px 10px;cursor:pointer;font:600 13px "Segoe UI",sans-serif}.osBar button:hover{background:rgba(255,255,255,.2)}
.osBar .osOff{background:#e5484d}.osSp{flex:1}.osClock{color:#cfd6e4}
.osMsg{height:100%;display:grid;place-content:center;justify-items:center;text-align:center;gap:12px;padding:30px;color:#2b3346;background:#f5f7fb;font-size:15px}
.osMsg .big{font-size:60px}.osMsg b{font-size:20px;max-width:640px}
.dbg{height:100%;overflow:auto;padding:16px 18px;background:#f4f6fa;color:#1b2233;font:14px 'Segoe UI',system-ui,sans-serif}.dbgHead{font:700 17px 'Segoe UI',sans-serif;margin-bottom:10px}.dbgSec{background:#fff;border:1px solid #dde2ea;border-radius:12px;padding:12px 14px}.dbgSec h4{margin:0 0 4px;font-size:15px}.dbgTip{margin:0 0 10px;color:#5a6474;font-size:12.5px}.dbgGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}.dbgBtn{display:flex;align-items:center;gap:8px;text-align:left;border:1px solid #d3dae5;background:#f8fafc;border-radius:10px;padding:8px 10px;cursor:pointer;font:600 13px 'Segoe UI',sans-serif;color:#1b2233}.dbgBtn:hover{background:#e9f1ff;border-color:#7aa7f0}.dbgBtn b{flex:0 0 auto;min-width:30px;padding:2px 6px;border-radius:7px;background:#1b2233;color:#ffd166;text-align:center}.dbgBtn span{flex:1}.dbgBtn i{font-style:normal;font-size:11px;color:#6b7686;background:#eef1f6;border-radius:6px;padding:1px 6px}.dbgFoot{display:flex;align-items:center;gap:12px;margin-top:12px}.dbgStop{border:0;border-radius:10px;padding:8px 14px;background:#e0453a;color:#fff;font:700 13px 'Segoe UI',sans-serif;cursor:pointer}.dbgStop:hover{background:#c73a30}.dbgSt{font-size:12.5px;color:#5a6474}
.mdApp{height:100%;display:flex;flex-direction:column}.mdNav{display:flex;gap:6px;padding:6px 8px;background:#f1f3f7;border-bottom:1px solid #dde2ea;flex-wrap:wrap}
.mdBtn{border:1px solid #d5dbe5;background:#fff;border-radius:8px;padding:5px 9px;font:600 12.5px "Segoe UI",sans-serif;cursor:pointer}.mdBtn:hover{background:#e9eef7}
.mdView{flex:1;min-height:0;position:relative}.mdView iframe,.brPane iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff}
.br{height:100%;display:flex;flex-direction:column;background:#fff}
.brTabs{display:flex;align-items:flex-end;gap:2px;padding:6px 6px 0;background:#dee3eb}.brTabList{display:flex;gap:2px;min-width:0;overflow:hidden}
.brTab{display:flex;align-items:center;gap:6px;max-width:190px;min-width:90px;padding:6px 6px 6px 12px;border-radius:9px 9px 0 0;background:#eef1f5;font-size:12.5px;cursor:pointer}
.brTab.on{background:#fff}.brTab .tt{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.brTab button{border:0;background:transparent;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:11px}.brTab button:hover{background:#d5dae3}
.brNew{border:0;background:transparent;font-size:18px;width:30px;height:28px;cursor:pointer;border-radius:8px}.brNew:hover{background:#cfd6e2}
.brTool{display:flex;align-items:center;gap:4px;padding:6px 8px;border-bottom:1px solid #e3e7ee}
.brTool>button{border:0;background:transparent;width:32px;height:30px;border-radius:50%;cursor:pointer;font-size:15px;color:#3b4456}.brTool>button:hover{background:#eceff4}
.brForm{flex:1;display:flex}.brUrl{flex:1;border:1px solid transparent;background:#f0f2f6;border-radius:18px;padding:7px 14px;font:14px "Segoe UI",sans-serif;outline:none;user-select:text}.brUrl:focus{background:#fff;border-color:#7aa7f5}
.brNote{font-size:11.5px;padding:3px 12px;background:#fff8dc;color:#6b5600;border-bottom:1px solid #f0e3b0}
.brView{flex:1;min-height:0;position:relative}.brPane{position:absolute;inset:0}
.brHome{height:100%;display:grid;place-content:center;justify-items:center;gap:14px;text-align:center;background:#fff;color:#202634;padding:20px}
.brLogo{font-size:52px}.brHome h2{margin:0;font-size:22px}
.brSearch{display:flex;gap:8px;width:min(560px,80vw)}.brSearch input{flex:1;border:1px solid #d3d9e3;border-radius:22px;padding:10px 18px;font:15px "Segoe UI",sans-serif;outline:none;user-select:text}.brSearch input:focus{border-color:#7aa7f5;box-shadow:0 1px 6px rgba(32,33,36,.18)}
.brTiles{display:grid;grid-template-columns:repeat(4,104px);gap:10px;margin-top:6px}.brTiles button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 6px;border:0;border-radius:12px;background:#f3f5f9;cursor:pointer;font:600 12px "Segoe UI",sans-serif;color:#2b3346}.brTiles button:hover{background:#e6ebf4}.brTiles b{font-size:26px}
.gm{height:100%;display:flex;flex-direction:column;gap:10px;padding:12px 16px;background:linear-gradient(#f6f8fc,#e9eef7);color:#1e2636;position:relative}
.gmTop{display:flex;align-items:center;gap:16px;font-size:14px}.gmTop>b{font-size:18px}
.gm .btn:not(.pri),.osMsg .btn:not(.pri),.brHome .btn:not(.pri){color:#1e2636;background:#fff;border-color:#cfd6e2}.gm .btn:not(.pri):hover{background:#eef2f8}
.gmGrid{flex:1;min-height:0;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,1fr);gap:10px}
.gmCell{position:relative;border:2px solid #d4dbe7;border-radius:14px;background:#fff;cursor:crosshair;font-size:min(7vh,52px);display:grid;place-items:center;transition:transform .08s}
.gmCell small{position:absolute;left:8px;top:6px;font:600 11px Consolas,monospace;color:#8a94a6}
.gmCell.on{border-color:#ffb547;background:#fff8e8}.gmCell.on.feat{border-color:#7ad3a0;background:#ecfbf2}.gmCell.on.crit{border-color:#ff5a6e;background:#fff0f2}
.gmCell.hit{background:#ffe9c7;transform:scale(.94)}.gmCell.bad{background:#ffd9de}.gmCell:active{transform:scale(.96)}
.gmTip{font-size:12.5px;color:#56607a}
.gmEnd{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:10px;background:rgba(246,248,252,.94);font-size:17px}.gmEnd b{font-size:26px}
.cdGrid{flex:1;min-height:0;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:1fr;gap:8px}
.cd{border:0;border-radius:12px;cursor:pointer;background:linear-gradient(135deg,#4a63d8,#7a3fe0);color:transparent;font:600 13.5px "Segoe UI",sans-serif;padding:6px;position:relative;transition:transform .2s,background .2s}
.cd::after{content:'❓';position:absolute;inset:0;display:grid;place-items:center;font-size:26px;color:rgba(255,255,255,.85)}
.cd.up,.cd.ok{background:#fff;color:#1e2636;box-shadow:inset 0 0 0 2px #cfd8e6}.cd.up::after,.cd.ok::after{content:none}
.cd.term.up,.cd.term.ok{color:#1d4ed8;font-weight:800}.cd.ok{background:#e7f8ee;box-shadow:inset 0 0 0 2px #46d39a}
.nt{height:100%;display:flex;flex-direction:column;background:#fffdf3}.nt textarea{flex:1;border:0;resize:none;padding:18px;font:15px/1.6 "Segoe UI",sans-serif;background:transparent;outline:none;user-select:text}.ntInfo{font-size:12px;color:#8a7d4a;padding:4px 12px}
/* máy nghe nhạc + điện thoại */
.gdDev{position:fixed;right:24px;bottom:24px;z-index:20;display:flex;flex-direction:column;transform:translateY(115%);transition:transform .38s cubic-bezier(.2,.9,.25,1.05);font-family:"Segoe UI",system-ui,sans-serif}
.gdDev.on{transform:none}
#gdPod{width:360px;height:min(600px,80vh);padding:14px;gap:8px;border-radius:30px;background:linear-gradient(160deg,#f4f6fa,#d9dee7);color:#1e2636;box-shadow:0 0 0 2px #fff inset,0 20px 50px rgba(0,0,0,.5)}
.devTop{display:flex;align-items:center;gap:8px;font-size:15px}.devX{border:0;background:#e3e7ee;border-radius:50%;width:30px;height:30px;cursor:pointer}
.podSearch,.podLink{display:flex;gap:6px}.podSearch input,.podLink input{flex:1;min-width:0;border:1px solid #cdd4df;border-radius:12px;padding:8px 12px;font:14px "Segoe UI",sans-serif;outline:none;user-select:text;background:#fff}
.podLink input{font-size:12.5px;padding:6px 10px}.podLink .btn,.podSearch .btn{padding:6px 12px}.podLink .btn{color:#1e2636;background:#fff}
.podMsg{font-size:12px;color:#55607a;min-height:16px}
.podList{flex:1;min-height:0;overflow:auto;background:#0f1724;border-radius:16px;padding:6px}
.podItem{display:flex;gap:8px;align-items:center;padding:6px;border-radius:10px;cursor:pointer;color:#e9edf4}.podItem:hover{background:rgba(255,255,255,.08)}
.podItem.sel{background:rgba(79,195,255,.22);box-shadow:inset 0 0 0 1px #4fc3ff}.podItem.now b::before{content:'🔊 '}.podItem.bad{opacity:.45}
.podItem img{width:72px;height:40px;object-fit:cover;border-radius:6px;background:#26324a;flex:none}.podItem div{min-width:0;display:flex;flex-direction:column}
.podItem b{font-size:12.5px;line-height:1.3;max-height:2.6em;overflow:hidden}
.podYT{align-self:flex-start;margin-top:3px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);color:#fff;border-radius:7px;padding:2px 8px;font:600 11px "Segoe UI",sans-serif;cursor:pointer}.podYT:hover{background:#e5484d}
.podItem.bad{opacity:.7}.podItem small{font-size:11px;color:#9aa6bd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.podCtl{display:flex;flex-direction:column;gap:6px}.podSel{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.podRow{display:flex;align-items:center;gap:5px}.podRow .btn{padding:7px 10px;color:#1e2636;background:#fff;border-color:#cdd4df}.podRow .btn.pri{color:#fff;background:var(--acc)}.podRow input{flex:1;min-width:40px}
#gdPhone{width:330px;height:min(640px,82vh);padding:10px 12px;border-radius:40px;background:#0b0d12;box-shadow:0 0 0 3px #2b303a,0 22px 55px rgba(0,0,0,.6);color:#eef2f8}
.phNotch{width:110px;height:22px;border-radius:0 0 14px 14px;background:#000;margin:-10px auto 0}
.phStatus{display:flex;font-size:12px;padding:2px 14px 6px;color:#cfd6e4}
.phBody{flex:1;min-height:0;overflow:auto;border-radius:24px;background:linear-gradient(170deg,#1c3a63,#3a2368);padding:12px;display:flex;flex-direction:column;gap:10px}
.phNav{display:flex;justify-content:space-around;padding-top:8px}.phNav button{border:0;background:transparent;color:#cfd6e4;font-size:18px;width:60px;height:28px;cursor:pointer;border-radius:10px}.phNav button:hover{background:rgba(255,255,255,.1)}
.phClock{font-size:58px;font-weight:300;text-align:center;margin-top:8px}.phDate{text-align:center;color:#cfd6e4;margin-top:-6px;text-transform:capitalize}
.phMe{display:flex;flex-direction:column;align-items:center;gap:2px;background:rgba(255,255,255,.1);border-radius:16px;padding:10px;font-size:12.5px;color:#cfd6e4}.phMe b{font-size:22px;color:#fff;letter-spacing:1px}.phMe small{font-size:11px;color:#ffd27a;text-align:center}
.phOff{background:rgba(255,180,71,.16);border:1px solid rgba(255,180,71,.5);border-radius:14px;padding:10px;font-size:12.5px;display:flex;flex-direction:column;gap:8px}.phOff .btn{justify-content:center}
.phApps{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:auto}.phApps button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 4px;border:0;border-radius:18px;background:rgba(255,255,255,.12);color:#fff;font:600 12.5px "Segoe UI",sans-serif;cursor:pointer}.phApps button:hover{background:rgba(255,255,255,.2)}.phApps b{font-size:28px;position:relative}
.phHead{display:flex;align-items:center;gap:8px;font-size:17px;font-weight:700}.phHead small{font-size:11.5px;color:#cfd6e4;font-weight:500}.phHead .btn{margin-left:auto;padding:5px 10px;font-size:12.5px}
.phList{display:flex;flex-direction:column;gap:6px}.phRow{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;border:0;border-radius:14px;padding:9px 12px;background:rgba(255,255,255,.1);color:#fff;font-family:inherit;cursor:pointer;position:relative}
.phRow b{font-size:14px}.phRow small{font-size:12px;color:#cfd6e4;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.phAct{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;gap:4px}.phAct .btn{padding:4px 7px}
.phEmpty{color:#cfd6e4;font-size:13px;text-align:center;padding:20px 6px}
.phChat{flex:1;min-height:120px;overflow:auto;display:flex;flex-direction:column;gap:6px;padding:4px}
.bub{max-width:82%;padding:7px 11px;border-radius:16px;font-size:13.5px;line-height:1.4;word-wrap:break-word;user-select:text}.bub small{display:block;font-size:10px;opacity:.75;margin-top:2px}
.bub.me{align-self:flex-end;background:#2f7cf6;border-bottom-right-radius:4px}.bub.them{align-self:flex-start;background:rgba(255,255,255,.18);border-bottom-left-radius:4px}
.phSend{display:flex;gap:6px}.phSend input{flex:1;min-width:0;border:0;border-radius:18px;padding:9px 13px;font:14px "Segoe UI",sans-serif;outline:none;user-select:text}
.phForm{display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:#cfd6e4}.phForm input,.phForm textarea{border:0;border-radius:12px;padding:8px 11px;font:14px "Segoe UI",sans-serif;outline:none;user-select:text}.phForm textarea{min-height:90px;resize:none}
.phForm.add{flex-direction:row;flex-wrap:wrap;margin-top:auto}.phForm.add input{flex:1;min-width:110px}
.phSend .btn[disabled],.phForm .btn[disabled]{opacity:.45;cursor:not-allowed}
`; document.head.appendChild(s); }
}
