// QC World – S19g: ÂM THANH MÔI TRƯỜNG 3D (thay cho "nhạc nền" – game không còn nhạc phát khắp nơi; chỉ nghe tiếng của thứ đang ở quanh mình)
//  • 🌊 Biển: tiếng sóng rì rào dịu êm (nhiễu nâu lọc thấp) + vệt bọt xoá nhẹ theo từng con sóng (5–10 giây/con). Dò khoảng cách tới mặt nước
//    quanh người chơi → càng gần càng to (đứng sát mép nước ~0,2 · cách 25 m ~0,07 · ngoài 50 m im), nghe lệch trái/phải theo hướng biển.
//    Đảo chính đã có sóng riêng (js/island.js) → lớp này mờ dần khi về gần đảo chính để không chồng tiếng.
//  • 🚗 Xe: tiếng máy + tiếng lốp của từng chiếc xe thật (W.traffic.cars, xe buýt W.transit.buses) – 5 chiếc gần nhất trong 45 m,
//    to/nhỏ theo bình phương khoảng cách, cao/trầm theo tốc độ, lệch trái/phải theo vị trí xe. Nhiều xe quanh (≤120 m) → tiếng ồn phố xa trầm nhẹ.
//  • 🗣️ Người: quanh mình có người (W.ACTORS) thì nghe tiếng nói chuyện lầm rầm (giọng tổng hợp, không thành lời rõ, có ngắt nghỉ như thật),
//    trẻ em (nhân vật thấp / nhãn 👧👦) giọng cao, thỉnh thoảng cười khúc khích; mỗi giọng gắn với 1 người gần nhất, nhỏ dần theo khoảng cách.
//  • 🐕🐈 Thú cưng (nhãn có 🐕🐶🐈🐱): thỉnh thoảng sủa / kêu meo khe khẽ.
//  • 🏢 Trong công ty (toà văn phòng của interior.js): tiếng gõ phím lách cách nhẹ + tiếng trao đổi công việc của mọi người trong phòng.
//  • 🏠 Vào trong nhà: mọi tiếng bên ngoài nghe đục và nhỏ hẳn (lọc thấp 500 Hz); tiếng người/thú/gõ phím trong phòng vẫn rõ.
//  Tất cả cố ý để NHỎ và DỊU (không át tiếng khác, không gây khó chịu).
//  • Tôn trọng tuỳ chọn "Âm thanh môi trường" (⚙ Đồ hoạ → localStorage qcworld-sfx); đeo tai nghe (js/gadgets.js) thì tự im như mọi âm thanh thành phố.
//  • W.ambience.panFor(x,z): độ lệch trái/phải (-0,8…0,8) của 1 nguồn âm theo hướng camera – các module khác (ban nhạc phố) dùng chung.
export function makeAmbience(W){
  const {THREE, P, camera, HOOK} = W;
  const A={ctx:null, master:null, outdoor:null, muff:null, sea:null, voices:[], talkers:[], rumble:null, keys:null, tW:0, tV:0, tS:0, tP:0, tPet:6, kNext:0, kBurst:0, water:{d:99, x:0, z:0, f:0}, srcs:{adult:[], kid:[], pet:[]}};
  const sfxOn=()=>{ try{ return localStorage.getItem('qcworld-sfx')!=='0'; }catch(e){ return true; } };
  const sst=(a,b,x)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
  const _v=new THREE.Vector3();
  function panFor(x,z){ camera.getWorldDirection(_v); let fx=_v.x, fz=_v.z; const fl=Math.hypot(fx,fz)||1; fx/=fl; fz/=fl;
    let sx=x-P.x, sz=z-P.z; const sl=Math.hypot(sx,sz); if(sl<.8) return 0; sx/=sl; sz/=sl;
    return Math.max(-1, Math.min(1, sx*(-fz)+sz*fx))*.8; }   // hướng phải của camera = (-fz, fx)

  /* ---------- khởi tạo (chỉ sau khi người chơi đã bấm/gõ – luật tự phát âm thanh của trình duyệt) ---------- */
  function noiseBuf(c, kind){ const sr=c.sampleRate, N=sr*6, X=Math.floor(sr*.25), raw=new Float32Array(N+X); let last=0;
    for(let i=0;i<N+X;i++){ const r=Math.random()*2-1; if(kind==='brown'){ last=(last+.02*r)/1.02; raw[i]=last*3.5; } else raw[i]=r; }
    const b=c.createBuffer(1, N, sr), d=b.getChannelData(0); d.set(raw.subarray(0,N));
    for(let i=0;i<X;i++){ const k=i/X; d[i]=raw[i]*k+raw[N+i]*(1-k); }   // nối vòng không "tạch"
    return b; }
  function init(force){ if(A.ctx || !sfxOn()) return; if(force!==true && !(navigator.userActivation && navigator.userActivation.hasBeenActive)) return;
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    const c=A.ctx=new AC(), white=noiseBuf(c,'white'), brown=noiseBuf(c,'brown');
    const src=(buf)=>{ const s=c.createBufferSource(); s.buffer=buf; s.loop=true; s.start(0, Math.random()*buf.duration); return s; };
    const filt=(type,f,q)=>{ const n=c.createBiquadFilter(); n.type=type; n.frequency.value=f; if(q) n.Q.value=q; return n; };
    const gain=(v)=>{ const g=c.createGain(); g.gain.value=v; return g; };
    const panner=()=>c.createStereoPanner ? c.createStereoPanner() : gain(1);
    A.master=gain(0); A.master.connect(c.destination); A.master.gain.setTargetAtTime(1, c.currentTime, 1.5);   // vào êm, không bật cái "bụp"
    A.outdoor=gain(1); A.muff=filt('lowpass',18000); A.outdoor.connect(A.muff); A.muff.connect(A.master);   // tiếng ngoài trời (trong nhà → đục)
    A.white=white; A.filt=filt; A.gainN=gain; A.panner=panner;
    // người nói chuyện: 4 giọng người lớn + 2 giọng trẻ em, qua bộ lọc mềm cho ra tiếng lầm rầm (không nghe rõ chữ)
    A.people=gain(1); const plp=filt('lowpass',2400,.5); A.people.connect(plp); plp.connect(A.master);
    for(let i=0;i<6;i++){ const kid=i>=4, osc=c.createOscillator(); osc.type='sawtooth'; osc.frequency.value=kid?290:135;
      const nz=gain(.12); src(white).connect(nz); const mix=gain(1); osc.connect(mix); nz.connect(mix);
      const f1=filt('bandpass',700,5), f2=filt('bandpass',1500,7), g2=gain(.55), env=gain(0), vg=gain(0), pan=panner();
      mix.connect(f1); mix.connect(f2); f2.connect(g2); f1.connect(env); g2.connect(env); env.connect(vg); vg.connect(pan); pan.connect(A.people); osc.start();
      A.talkers.push({kid, osc, f1, f2, env, vg, pan, src:null, next:0, phrase:0, base:kid?300:130}); }
    // gõ phím văn phòng
    A.keys=gain(0); const khp=filt('bandpass',3200,.9); A.keys.connect(khp); khp.connect(A.master);
    // biển
    const sea={g:gain(0), pan:panner(), wash:gain(.25), foam:gain(0), next:0};
    sea.g.connect(sea.pan); sea.pan.connect(A.outdoor);
    const lp=filt('lowpass',460,.6); src(brown).connect(lp); lp.connect(sea.wash); sea.wash.connect(sea.g);
    const bp=filt('bandpass',1400,.45), hs=filt('lowpass',3200); src(white).connect(bp); bp.connect(hs); hs.connect(sea.foam); sea.foam.connect(sea.g);
    A.sea=sea;
    // xe: 5 giọng máy dùng lại (gán cho 5 xe gần nhất)
    for(let i=0;i<5;i++){ const o=c.createOscillator(), o2=c.createOscillator(); o.type='sawtooth'; o2.type='triangle'; o.frequency.value=34; o2.frequency.value=68;
      const elp=filt('lowpass',190,.9), eg=gain(.55); o.connect(elp); o2.connect(elp); elp.connect(eg);
      const tbp=filt('bandpass',620,.6), tg=gain(0); src(white).connect(tbp); tbp.connect(tg);
      const g=gain(0), pan=panner(); eg.connect(g); tg.connect(g); g.connect(pan); pan.connect(A.outdoor); o.start(); o2.start();
      A.voices.push({o, o2, elp, tg, g, pan, veh:null}); }
    // tiếng ồn phố xa (trầm, rất nhỏ)
    const rg=gain(0), rlp=filt('lowpass',150,.5); src(brown).connect(rlp); rlp.connect(rg); rg.connect(A.outdoor); A.rumble=rg;
  }
  addEventListener('pointerdown', init); addEventListener('keydown', init);

  /* ---------- dò mặt nước quanh người chơi ---------- */
  const RADII=[2.5,6,11,18,27,38,52], ANG=14;
  function isWater(x,z){ if(W.inDT && W.inDT(x,z,0)) return false; if(W.onExt && W.onExt(x,z)) return false; return W.groundH(x,z) < W.WATER_Y-.08; }
  function scanWater(){ const w=A.water; w.d=99; w.f=0; let vx=0, vz=0;
    for(const r of RADII){ let hit=0; for(let i=0;i<ANG;i++){ const a=i/ANG*Math.PI*2, x=P.x+Math.cos(a)*r, z=P.z+Math.sin(a)*r; if(isWater(x,z)){ hit++; vx+=Math.cos(a); vz+=Math.sin(a); } }
      if(hit){ w.d=r; w.f=hit/ANG; const l=Math.hypot(vx,vz)||1; w.x=P.x+vx/l*r; w.z=P.z+vz/l*r; break; } } }

  /* ---------- người · trẻ em · thú cưng ---------- */
  const rootOf=o=>{ while(o.parent) o=o.parent; return o; };
  const PET_RE=/🐕|🐶|🐈|🐱|🐩|🐾/, KID_RE=/👧|👦|🧒|👶/, CAT_RE=/🐈|🐱/;
  function scanSources(){ const S=A.srcs; S.adult.length=0; S.kid.length=0; S.pet.length=0;
    const cur=(W.renderPass && W.renderPass.scene) || W.scene;
    if(W.ACTORS) for(const a of W.ACTORS){ if(a===W.me || !a.g || !a.g.visible || !a.g.parent) continue;
      a.g.getWorldPosition(_v); const d=Math.hypot(_v.x-P.x, _v.z-P.z); if(d>22 || rootOf(a.g)!==cur) continue;
      (a.h && a.h<1.35 ? S.kid : S.adult).push({x:_v.x, z:_v.z, d}); }
    if(W.labels) for(const L of W.labels){ if(!L.follow || !L.el || !L.follow.parent) continue; const tx=L.el.textContent||'', pet=PET_RE.test(tx);
      if(!pet && !KID_RE.test(tx)) continue; L.follow.getWorldPosition(_v); const d=Math.hypot(_v.x-P.x, _v.z-P.z); if(d>24 || rootOf(L.follow)!==cur) continue;
      if(pet) S.pet.push({x:_v.x, z:_v.z, d, cat:CAT_RE.test(tx)}); else if(!S.kid.some(k=>Math.hypot(k.x-_v.x, k.z-_v.z)<1.2)) S.kid.push({x:_v.x, z:_v.z, d}); }
    S.adult.sort((a,b)=>a.d-b.d); S.kid.sort((a,b)=>a.d-b.d); }
  function updTalkers(t, office){ const S=A.srcs; let ai=0, ki=0;
    for(const tk of A.talkers){ const s=tk.kid ? S.kid[ki++] : S.adult[ai++]; tk.src=s||null;
      if(!s){ tk.vg.gain.setTargetAtTime(0, t, .4); continue; }
      const k=s.d/(tk.kid?5:4); tk.vg.gain.setTargetAtTime((tk.kid?.06:.045)*(office?1.2:1)/(1+k*k), t, .3);
      if(tk.pan.pan) tk.pan.pan.setTargetAtTime(panFor(s.x, s.z)*.85, t, .2); } }
  // nói theo âm tiết: đổi nguyên âm (2 formant) + cao độ mỗi 0,1–0,25 s, ngắt câu 0,5–2,5 s → nghe như người nói chuyện ở xa, không rõ chữ
  const VOW=[[800,1200],[500,1900],[300,2300],[500,900],[350,800],[650,1700],[450,1400]];
  function speak(tk, t){ if(!tk.src || t<tk.next) return;
    if(tk.phrase<=0){ tk.phrase=tk.kid ? 3+Math.floor(Math.random()*6) : 4+Math.floor(Math.random()*9);
      tk.base=tk.kid ? 260+Math.random()*120 : (Math.random()<.5 ? 105+Math.random()*35 : 180+Math.random()*50);   // giọng nam / nữ / trẻ em
      tk.laugh=tk.kid && Math.random()<.25; tk.n=0;
      tk.env.gain.setTargetAtTime(0, t, .05); tk.next=t+.5+Math.random()*(tk.kid?1.2:2.2); return; }
    const kk=tk.kid?1.18:1, dur=tk.laugh ? .1+Math.random()*.04 : (tk.kid?.08:.1)+Math.random()*.15;
    const v=tk.laugh ? [820,1250] : VOW[Math.floor(Math.random()*VOW.length)];
    const f0=tk.laugh ? tk.base*(1.45-.07*tk.n) : tk.base*(1+(Math.random()-.5)*.25)*(tk.phrase<=1 ? .9 : 1);   // cuối câu hạ giọng
    tk.osc.frequency.setTargetAtTime(f0, t, .025); tk.f1.frequency.setTargetAtTime(v[0]*kk, t, .02); tk.f2.frequency.setTargetAtTime(v[1]*kk, t, .02);
    const amp=.55+Math.random()*.45; tk.env.gain.setTargetAtTime(amp, t, .018); tk.env.gain.setTargetAtTime(amp*.12, t+dur*.65, .03);
    tk.next=t+dur; tk.phrase--; tk.n++; }
  function petSound(t){ const S=A.srcs; if(!S.pet.length || W.inside) return; const p=S.pet[Math.floor(Math.random()*S.pet.length)], c=A.ctx, k=p.d/5, vol=.045/(1+k*k); if(vol<.003) return;
    const pan=A.panner(); if(pan.pan) pan.pan.value=panFor(p.x, p.z)*.85; pan.connect(A.master); setTimeout(()=>{ try{ pan.disconnect(); }catch(e){} }, 2500);
    if(p.cat){ // meo… kêu lên rồi xuống
      const o=c.createOscillator(); o.type='sawtooth'; const f1=A.filt('bandpass',700,3), f2=A.filt('bandpass',2300,4), g=A.gainN(0);
      o.frequency.setValueAtTime(420,t); o.frequency.linearRampToValueAtTime(690,t+.18); o.frequency.linearRampToValueAtTime(430,t+.6);
      f1.frequency.setValueAtTime(700,t); f1.frequency.linearRampToValueAtTime(1100,t+.2); f1.frequency.linearRampToValueAtTime(600,t+.6);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol*.8,t+.06); g.gain.setTargetAtTime(0,t+.45,.06);
      o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(pan); o.start(t); o.stop(t+.8); }
    else { const n=1+Math.floor(Math.random()*2); for(let i=0;i<n;i++){ const s=t+i*.3, o=c.createOscillator(), nz=c.createBufferSource(), f=A.filt('bandpass',850,1.6), g=A.gainN(0), ng=A.gainN(.5);   // gâu gâu
        o.type='sawtooth'; nz.buffer=A.white; o.frequency.setValueAtTime(470,s); o.frequency.exponentialRampToValueAtTime(260,s+.13);
        g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(vol,s+.012); g.gain.exponentialRampToValueAtTime(.0005,s+.16);
        o.connect(f); nz.connect(ng); ng.connect(f); f.connect(g); g.connect(pan); o.start(s); o.stop(s+.18); nz.start(s, Math.random()*2, .17); } } }
  // gõ phím: từng đoạn gõ 8–38 phím, nghỉ 0,8–4 giây – rất khẽ
  function typing(t, office){ if(!office){ A.keys.gain.setTargetAtTime(0, t, .3); return; } A.keys.gain.setTargetAtTime(.9, t, .5);
    if(A.kNext<t) A.kNext=t;
    while(A.kNext<t+.12){ if(A.kBurst<=0){ A.kBurst=8+Math.floor(Math.random()*30); A.kNext+=.8+Math.random()*3.2; continue; }
      const s=A.kNext, nz=A.ctx.createBufferSource(), g=A.gainN(0), v=.012+Math.random()*.012; nz.buffer=A.white;
      g.gain.setValueAtTime(v,s); g.gain.exponentialRampToValueAtTime(.0003,s+.025); nz.connect(g); g.connect(A.keys); nz.start(s, Math.random()*5, .03);
      A.kBurst--; A.kNext+=.07+Math.random()*.13; } }

  /* ---------- mỗi khung ---------- */
  function vehicles(){ const out=[], T=W.traffic, TR=W.transit;
    if(T && T.cars) for(const c of T.cars){ const g=c.g; if(!g || !g.parent) continue; out.push({k:c, x:g.position.x, z:g.position.z, v:c.v||0, bus:false}); }
    if(TR && TR.buses) for(const b of TR.buses){ const g=b.g; if(!g || !g.parent) continue; out.push({k:b, x:g.position.x, z:g.position.z, v:b.v||0, bus:true}); }
    return out; }
  HOOK.onFrame.push((dt)=>{
    const c=A.ctx; if(!c) return;
    if(!sfxOn()){ if(A.master) A.master.gain.setTargetAtTime(0, c.currentTime, .3); return; }
    if(c.state==='suspended' && !c.__gdHold){ c.resume(); return; }
    const t=c.currentTime, inside=!!W.inside;
    A.outdoor.gain.setTargetAtTime(inside ? .35 : 1, t, .4); A.muff.frequency.setTargetAtTime(inside ? 500 : 18000, t, .3);   // trong nhà: tiếng ngoài trời nghe đục
    // người · trẻ em · thú cưng · gõ phím văn phòng
    const office=!!(W.inside && W.inside.h!==undefined && !W.inside.campus && !W.inside.showroom);
    A.tP-=dt; if(A.tP<=0){ A.tP=.4; scanSources(); updTalkers(t, office); }
    for(const tk of A.talkers) speak(tk, t);
    A.tPet-=dt; if(A.tPet<=0){ A.tPet=7+Math.random()*16; petSound(t); }
    typing(t, office);
    // biển
    A.tW-=dt; if(A.tW<=0){ A.tW=.3; scanWater(); }
    const sea=A.sea, w=A.water, rMain=Math.hypot(P.x, P.z), mainFade=sst(95, 135, rMain);   // gần đảo chính → để island.js lo
    const gSea=inside ? 0 : .2*Math.pow(1-sst(3, 50, w.d), 1.3)*(.65+.35*w.f)*mainFade;
    sea.g.gain.setTargetAtTime(gSea, t, .6); if(sea.pan.pan) sea.pan.pan.setTargetAtTime(w.d<99 ? panFor(w.x, w.z)*.7 : 0, t, .5);
    if(t>sea.next && gSea>.002){ const pk=.7+Math.random()*.5, per=5.5+Math.random()*4.5;   // 1 con sóng: dâng 2 giây rồi rút, bọt xoá theo sau
      sea.wash.gain.setTargetAtTime(.32+.6*pk, t, 1.1); sea.wash.gain.setTargetAtTime(.22, t+2.1, 1.7);
      sea.foam.gain.setTargetAtTime(.1*pk, t+1.5, .45); sea.foam.gain.setTargetAtTime(0, t+2.5, 1.3); sea.next=t+per; }
    // xe cộ
    A.tV-=dt; if(A.tV<=0){ A.tV=.15;
      const list=vehicles(); let n120=0; for(const v of list){ v.d=Math.hypot(v.x-P.x, v.z-P.z); if(v.d<120) n120++; }
      const near=list.filter(v=>v.d<45).sort((a,b)=>a.d-b.d).slice(0, A.voices.length);
      // giữ giọng cũ cho xe cũ (không nhảy tiếng), giọng rảnh nhận xe mới
      for(const vo of A.voices){ if(vo.veh && !near.some(v=>v.k===vo.veh)) vo.veh=null; }
      for(const v of near){ if(A.voices.some(vo=>vo.veh===v.k)) continue; const free=A.voices.find(vo=>!vo.veh); if(free) free.veh=v.k; }
      for(const vo of A.voices){ const v=near.find(x=>x.k===vo.veh);
        if(!v || inside){ vo.g.gain.setTargetAtTime(0, t, .25); continue; }
        const sp=Math.min(14, v.v), base=v.bus ? .5 : .32, k=v.d/6;
        vo.o.frequency.setTargetAtTime((v.bus?26:33)+sp*(v.bus?2.4:3.4), t, .25); vo.o2.frequency.setTargetAtTime(((v.bus?26:33)+sp*(v.bus?2.4:3.4))*2.01, t, .25);
        vo.elp.frequency.setTargetAtTime(140+sp*26, t, .25); vo.tg.gain.setTargetAtTime(Math.min(1, sp/9)*.55, t, .25);
        vo.g.gain.setTargetAtTime(base*(.3+.7*Math.min(1, sp/7))/(1+k*k)*Math.min(1,(45-v.d)/8), t, .2);
        if(vo.pan.pan) vo.pan.pan.setTargetAtTime(panFor(v.x, v.z), t, .12); }
      A.rumble.gain.setTargetAtTime(inside ? 0 : .045*Math.min(1, n120/10), t, 1); }
  });
  return {panFor, start:()=>init(true), get ctx(){ return A.ctx; }, get water(){ return A.water; }, state:A};
}
