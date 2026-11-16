// QC World – S19g (16/11/2026): ÂM THANH THẾ GIỚI 3D – mở rộng js/ambience.js (Bình: "môi trường cũng phải có âm thanh phù hợp…
//   máy bay bay thì phải có tiếng máy bay khi ở gần, cảnh sát cũng phải có âm thanh… tùy môi trường mà lớn nhỏ, dịu nhẹ chứ không gắt").
//  • Mọi tiếng TỔNG HỢP bằng WebAudio (không file, không bản quyền), dùng CHUNG AudioContext của ambience.js.
//  • Nghe theo khoảng cách 3D (to/nhỏ theo 1/(1+(d/ref)²), có TRẦN âm lượng từng loại) + lệch trái/phải theo camera; ngoài tầm thì TẮT HẲN:
//    bộ tổng hợp chỉ được dựng khi có nguồn ở gần và tự huỷ sau ~2 giây im → lúc im không tốn CPU.
//  • Tiếng ngoài trời đi qua bus "outdoor" của ambience.js → vào nhà (W.inside) tự nhỏ lại + đục (lọc trầm).
//  • Nguồn âm: providers() bên dưới (đọc API các vùng, KHÔNG sửa module khác); sự kiện một lần: W.sfx(tên, x, y, z) (vd. thang máy 'lift-ding').
export function attachWorld(W, A, api){
  const c=A.ctx, {P}=W, panFor=api.panFor, TAU=Math.PI*2;
  const sst=(a,b,x)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); }, clamp=(v,a,b)=>v<a?a:v>b?b:v, rnd=(a,b)=>a+Math.random()*(b-a);
  const G=v=>A.gainN(v), F=(type,f,q)=>A.filt(type,f,q);
  const loop=buf=>{ const s=c.createBufferSource(); s.buffer=buf; s.loop=true; s.start(0, Math.random()*buf.duration); return s; };
  const osc=(type,f)=>{ const o=c.createOscillator(); o.type=type; o.frequency.value=f; o.start(); return o; };
  const OUT=G(1); OUT.connect(A.outdoor);          // tiếng ngoài trời (trong nhà tự đục)
  const IN=G(1); IN.connect(A.master);             // tiếng trong toà nhà (thang máy)
  const WH=A.white, BR=A.brown||A.white;

  /* ---------- 1 giọng = 1 nguồn âm cụ thể: dựng lười, tự huỷ khi im ---------- */
  const VOICES=new Map(); let tick=0;
  function mkVoice(kind, id, bus){ const K=KINDS[kind], g=G(0), pan=A.panner(); g.connect(pan); pan.connect(bus||OUT);
    const v={kind, id, g, pan, nodes:[], t0:c.currentTime, quietT:0, st:{}, last:null}; v.track=n=>{ v.nodes.push(n); return n; };
    try{ K.build(v); }catch(e){ console.warn('[ambience_world] build', kind, e); } VOICES.set(id, v); return v; }
  function kill(v){ for(const n of v.nodes){ try{ n.stop && n.stop(); }catch(e){} try{ n.disconnect(); }catch(e){} } try{ v.g.disconnect(); v.pan.disconnect(); }catch(e){} VOICES.delete(v.id); }
  // độ to theo khoảng cách: cap/(1+(d/ref)²), mờ dần về 0 ở 75–100 % tầm
  const lvl=(K,d)=>K.cap/(1+(d/K.ref)**2)*(1-sst(K.range*.75, K.range, d));

  /* ---------- tiện ích phát 1 lần (tiếng ngắn) ---------- */
  function burst(dst, t, {buf=WH, type='bandpass', f=1200, q=1, a=.002, hold=0, rel=.1, peak=.1, dur=null}){ const s=c.createBufferSource(), fl=F(type,f,q), g=G(0); s.buffer=buf;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+a); g.gain.setValueAtTime(peak,t+a+hold); g.gain.exponentialRampToValueAtTime(.0002,t+a+hold+rel);
    s.connect(fl); fl.connect(g); g.connect(dst); const len=dur??(a+hold+rel+.05); s.start(t, Math.random()*(buf.duration-len-.1), len); s.onended=()=>{ try{ g.disconnect(); fl.disconnect(); }catch(e){} }; }
  function tone(dst, t, {type='sine', f=880, f2=null, a=.005, rel=.6, peak=.05, glide=.1}){ const o=c.createOscillator(), g=G(0); o.type=type; o.frequency.setValueAtTime(f,t); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+glide);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+a); g.gain.exponentialRampToValueAtTime(.0002,t+a+rel); o.connect(g); g.connect(dst); o.start(t); o.stop(t+a+rel+.05); o.onended=()=>{ try{ g.disconnect(); }catch(e){} }; }
  const bell=(dst,t,f,peak,rel=2.2)=>{ tone(dst,t,{f, rel, peak}); tone(dst,t,{f:f*2.76, rel:rel*.6, peak:peak*.35}); tone(dst,t,{f:f*5.4, rel:rel*.35, peak:peak*.12}); };

  /* ============================== CÁC LOẠI TIẾNG ============================== */
  const KINDS={
    // ✈️ phản lực: gầm trầm (nâu lọc thấp) + rít nhẹ; to hơn khi tăng tốc / bay thấp
    jet:{max:2, range:300, ref:45, cap:.15, build(v){ const r=v.track(loop(BR)), lp=F('lowpass',300,.7), w=v.track(loop(WH)), bp=F('bandpass',1500,2.2), wg=G(.05); r.connect(lp); lp.connect(v.g); w.connect(bp); bp.connect(wg); wg.connect(v.g); v.st={lp,bp,wg}; },
      upd(v,e,t,dop){ const th=clamp(e.thrust??(e.v||0)/70,0,1); v.st.lp.frequency.setTargetAtTime((220+th*420)*dop, t, .3); v.st.bp.frequency.setTargetAtTime((1300+th*900)*dop, t, .3); v.st.wg.gain.setTargetAtTime(.03+th*.05, t, .3); return .45+.55*th; }},
    // 🛩️ máy bay cánh quạt / thuỷ phi cơ
    prop:{max:2, range:200, ref:30, cap:.1, build(v){ const o=v.track(osc('sawtooth',80)), lp=F('lowpass',520,.8), n=v.track(loop(BR)), nl=F('lowpass',700), ng=G(.4); o.connect(lp); lp.connect(v.g); n.connect(nl); nl.connect(ng); ng.connect(v.g); v.st={o}; },
      upd(v,e,t,dop){ const th=clamp((e.v||0)/45,.25,1); v.st.o.frequency.setTargetAtTime((60+th*60)*dop, t, .3); return .5+.5*th; }},
    // 🚁 trực thăng: tiếng nâu lọc thấp đập theo nhịp cánh quạt ~12 Hz
    heli:{max:2, range:220, ref:28, cap:.12, build(v){ const n=v.track(loop(BR)), lp=F('lowpass',420,.7), am=G(.55), lfo=v.track(osc('square',12.5)), lg=G(.45); n.connect(lp); lp.connect(am); lfo.connect(lg); lg.connect(am.gain); am.connect(v.g);
        const tw=v.track(osc('triangle',38)), tg=G(.25); tw.connect(tg); tg.connect(v.g); v.st={lfo}; }, upd(v,e,t){ v.st.lfo.frequency.setTargetAtTime(e.spin===false?5:12.5, t, .8); return e.spin===false?.25:1; }},
    // 🎈 khinh khí cầu: thỉnh thoảng phụt lửa "phù…" 1–2 giây
    balloon:{max:2, range:90, ref:14, cap:.08, build(v){ v.st.next=c.currentTime+rnd(1,5); },
      upd(v,e,t){ if(t>v.st.next){ v.st.next=t+rnd(6,14); burst(v.g,t,{buf:BR,type:'bandpass',f:520,q:.7,a:.15,hold:rnd(.6,1.4),rel:.5,peak:.9}); } return 1; }},
    // 🚤 thuyền máy / mô tô nước: máy trầm + nước rẽ sóng
    boat:{max:2, range:110, ref:16, cap:.1, build(v){ const o=v.track(osc('sawtooth',46)), lp=F('lowpass',230,.9), n=v.track(loop(WH)), bp=F('bandpass',900,.6), ng=G(.25); o.connect(lp); lp.connect(v.g); n.connect(bp); bp.connect(ng); ng.connect(v.g); v.st={o,ng}; },
      upd(v,e,t,dop){ const sp=clamp((e.v||0)/12,.2,1); v.st.o.frequency.setTargetAtTime((40+sp*40)*dop, t, .3); v.st.ng.gain.setTargetAtTime(.1+sp*.35, t, .3); return .4+.6*sp; }},
    // 🛶 kayak: tiếng mái chèo khua nước đều nhịp
    kayak:{max:2, range:40, ref:7, cap:.06, build(v){ v.st.next=c.currentTime+rnd(0,1); v.st.side=1; },
      upd(v,e,t){ if(t>v.st.next){ v.st.next=t+rnd(1.15,1.5); burst(v.g,t,{type:'bandpass',f:rnd(900,1400),q:.8,a:.01,hold:.04,rel:.28,peak:.8}); } return 1; }},
    // 🚝 tàu điện / tàu treo: ù điện + bánh lăn theo tốc độ
    train:{max:1, range:160, ref:22, cap:.12, build(v){ const o=v.track(osc('sine',98)), o2=v.track(osc('sine',196)), og=G(.5), o2g=G(.18), n=v.track(loop(BR)), lp=F('lowpass',320,.6), ng=G(.8); o.connect(og); o2.connect(o2g); og.connect(v.g); o2g.connect(v.g); n.connect(lp); lp.connect(ng); ng.connect(v.g); v.st={o,o2,ng}; },
      upd(v,e,t,dop){ const sp=clamp((e.v||0)/16,0,1); v.st.o.frequency.setTargetAtTime((80+sp*60)*dop, t, .4); v.st.o2.frequency.setTargetAtTime((160+sp*120)*dop, t, .4); v.st.ng.gain.setTargetAtTime(.2+sp*.8, t, .3); return .25+.75*sp; }},
    // 🚡 cáp treo: rì rì nhẹ + lạch cạch khi qua trụ
    cable:{max:1, range:70, ref:12, cap:.05, build(v){ const n=v.track(loop(BR)), bp=F('bandpass',260,.9); n.connect(bp); bp.connect(v.g); v.st.next=c.currentTime+2; },
      upd(v,e,t){ if(t>v.st.next){ v.st.next=t+rnd(3,6); burst(v.g,t,{type:'bandpass',f:2200,q:3,a:.003,rel:.12,peak:.5}); } return 1; }},
    // 🚓🚒🚑 còi xe khẩn cấp (DỊU: tam giác + sin, lọc 2,2 kHz, trần thấp) – kiểu theo loại xe, có Doppler nhẹ
    siren:{max:3, range:320, ref:30, cap:.065, build(v){ const o=v.track(osc('triangle',700)), o2=v.track(osc('sine',700)), lp=F('lowpass',2200,.6), og=G(.55), o2g=G(.45); o.connect(og); o2.connect(o2g); og.connect(lp); o2g.connect(lp); lp.connect(v.g); v.st={o,o2}; },
      upd(v,e,t,dop){ const ph=t-v.t0; let f;
        if(e.kind==='ambulance') f=(Math.floor(ph/.55)%2?660:880);                    // hai tông hi–lo
        else if(e.kind==='fire') f=470+300*(.5-.5*Math.cos(TAU*ph/5.2));               // rú chậm, trầm
        else f=(Math.floor(ph/7)%2) ? 650+260*(.5-.5*Math.cos(TAU*ph/.42)) : 600+320*(.5-.5*Math.cos(TAU*ph/3.6));   // cảnh sát: rú dài xen kẽ "yelp"
        v.st.o.frequency.setTargetAtTime(f*dop, t, .03); v.st.o2.frequency.setTargetAtTime(f*dop, t, .03); return 1; }},
    // 🔥 lửa cháy: ù trầm + lách tách
    fire:{max:2, range:90, ref:12, cap:.11, build(v){ const n=v.track(loop(BR)), lp=F('lowpass',240,.6), ng=G(.7); n.connect(lp); lp.connect(ng); ng.connect(v.g); v.st={ng, nx:c.currentTime}; },
      upd(v,e,t){ const k=clamp(e.level??1,0,1); v.st.ng.gain.setTargetAtTime(.25+.6*k, t, .5); if(v.st.nx<t) v.st.nx=t; while(v.st.nx<t+.3){ const s=v.st.nx; burst(v.g,s,{type:'bandpass',f:rnd(1800,3800),q:1.2,a:.001,rel:rnd(.01,.04),peak:rnd(.2,.7)*k}); v.st.nx+=rnd(.04,.16)/(.3+k); } return .3+.7*k; }},
    // 🚿 vòi nước chữa cháy
    hose:{max:2, range:60, ref:9, cap:.07, build(v){ const n=v.track(loop(WH)), bp=F('bandpass',1500,.6), b=v.track(loop(BR)), lp=F('lowpass',420), bg=G(.6); n.connect(bp); bp.connect(v.g); b.connect(lp); lp.connect(bg); bg.connect(v.g); }, upd(){ return 1; }},
    // 👾 yêu quái: gầm trầm định kỳ (2 răng cưa lệch nhau, lọc thấp, rung 5 Hz)
    monster:{max:1, range:180, ref:28, cap:.12, build(v){ const o=v.track(osc('sawtooth',44)), o2=v.track(osc('sawtooth',44.9)), lp=F('lowpass',190,1.1), am=G(0), lfo=v.track(osc('sine',5.2)), lg=G(.25); o.connect(lp); o2.connect(lp); lp.connect(am); lfo.connect(lg); lg.connect(am.gain); am.connect(v.g); v.st={am, o, o2, next:c.currentTime+.5}; },
      upd(v,e,t){ if(t>v.st.next){ v.st.next=t+rnd(4,8); const d=rnd(1.4,2.4); v.st.am.gain.setTargetAtTime(.9, t, .25); v.st.am.gain.setTargetAtTime(0, t+d, .5); v.st.o.frequency.setValueAtTime(52,t); v.st.o.frequency.exponentialRampToValueAtTime(38,t+d); v.st.o2.frequency.setValueAtTime(52.8,t); v.st.o2.frequency.exponentialRampToValueAtTime(38.6,t+d); } return 1; }},
    // 👏 đám đông vỗ tay / reo nhẹ
    crowd:{max:1, range:70, ref:12, cap:.07, build(v){ v.st.nx=c.currentTime; v.st.until=0; },
      upd(v,e,t){ const on=e.cheer || t<v.st.until; if(e.cheer && v.st.until<t) v.st.until=t+rnd(3,5); if(!on) return 0; if(v.st.nx<t) v.st.nx=t; while(v.st.nx<t+.3){ burst(v.g,v.st.nx,{type:'bandpass',f:rnd(1300,2600),q:.9,a:.001,rel:rnd(.02,.05),peak:rnd(.15,.5)}); v.st.nx+=rnd(.015,.05); } return 1; }},
    // 🎵 flashmob: nhịp beat nhẹ 112 BPM (trống trầm + hi-hat khẽ + hợp âm nền)
    beat:{max:1, range:70, ref:10, cap:.07, build(v){ const a=v.track(osc('sine',220)), b=v.track(osc('sine',277.2)), d=v.track(osc('sine',329.6)), pg=G(.05), lp=F('lowpass',900); for(const o of [a,b,d]) o.connect(pg); pg.connect(lp); lp.connect(v.g); v.st={nx:c.currentTime, n:0, pg, chords:[[220,277.2,329.6],[196,246.9,293.7],[174.6,220,261.6],[196,246.9,293.7]], osc:[a,b,d]}; },
      upd(v,e,t){ const S=v.st, B=60/112; if(S.nx<t) S.nx=t; while(S.nx<t+.3){ const s=S.nx; if(S.n%2===0) tone(v.g,s,{f:115,f2:48,glide:.18,rel:.28,peak:.75}); else burst(v.g,s,{type:'highpass',f:7000,q:.7,a:.001,rel:.04,peak:.18});
          if(S.n%8===0){ const ch=S.chords[(S.n/8)%4]; S.osc.forEach((o,i)=>o.frequency.setTargetAtTime(ch[i], s, .05)); } S.n++; S.nx+=B/2; } return 1; }},
    // 🤖 robot trà sữa: bíp bíp
    robot:{max:1, range:30, ref:6, cap:.05, build(v){ v.st.next=c.currentTime+.4; },
      upd(v,e,t){ if(t>v.st.next){ v.st.next=t+rnd(1.2,3.2); const n=1+Math.floor(Math.random()*3); for(let i=0;i<n;i++) tone(v.g,t+i*.14,{f:rnd(1100,1900),a:.004,rel:.09,peak:.6}); } return 1; }},
    // 🏮 đèn trời: gió nhẹ + thỉnh thoảng tiếng chuông xa
    lantern:{max:1, range:90, ref:16, cap:.05, build(v){ const n=v.track(loop(BR)), bp=F('bandpass',420,.5), ag=G(.6), l=v.track(osc('sine',.13)), lg=G(.35); n.connect(bp); bp.connect(ag); l.connect(lg); lg.connect(ag.gain); ag.connect(v.g); v.st.next=c.currentTime+3; },
      upd(v,e,t){ if(t>v.st.next){ v.st.next=t+rnd(4,9); bell(v.g,t,rnd(900,1400),.18); } return 1; }},
    // 🎆 pháo hoa (sau khi hạ yêu quái): nổ bụp xa + tràng lách tách
    fireworks:{max:1, range:220, ref:40, cap:.09, build(v){ v.st.next=c.currentTime+.2; },
      upd(v,e,t){ if(t>v.st.next){ v.st.next=t+rnd(.7,1.8); burst(v.g,t,{buf:BR,type:'lowpass',f:180,q:.7,a:.003,rel:.6,peak:.9}); for(let i=0;i<10;i++) burst(v.g,t+.25+Math.random()*.6,{type:'highpass',f:2500,q:.7,a:.001,rel:.03,peak:rnd(.1,.35)}); } return 1; }},
    // 🌊 thác nước / đài phun: ào ào (nhiễu trắng + nâu), to theo khoảng cách
    water:{max:3, range:120, ref:18, cap:.13, build(v){ const n=v.track(loop(WH)), lp=F('lowpass',1600,.5), hp=F('highpass',140), b=v.track(loop(BR)), bl=F('lowpass',380), bg=G(.6); n.connect(lp); lp.connect(hp); hp.connect(v.g); b.connect(bl); bl.connect(bg); bg.connect(v.g); }, upd(v,e){ return e.level??1; }},
    // 🎐 chuông gió phố cổ
    chime:{max:1, range:60, ref:14, cap:.05, build(v){ v.st.next=c.currentTime+rnd(1,3); },
      upd(v,e,t){ if(t>v.st.next){ v.st.next=t+rnd(2.5,7); const base=pick([1046,1174,1318,1568,1760]); bell(v.g,t,base,.55,2.6); if(Math.random()<.5) bell(v.g,t+rnd(.15,.4),base*1.125,.35,2.2); } return 1; }},
  };
  const pick=a=>a[Math.floor(Math.random()*a.length)];

  /* ---------- tiếng nền theo không gian (không gắn nguồn cụ thể): gió trên cao · chim ban ngày · dế ban đêm · mưa ---------- */
  const AMB={wind:null, rain:null, birdsT:0, crickets:null};
  function ambient(t, dt, outdoorOK, prov){
    // gió: mạnh dần theo độ cao (từ +25 m), vẫn nhẹ
    const wl=outdoorOK ? .055*sst(25, 150, P.y) : 0;
    if(wl>.002 && !AMB.wind){ const g=G(0), n=loop(BR), bp=F('bandpass',360,.45), l=osc('sine',.09), lg=G(.4), ag=G(.7); n.connect(bp); bp.connect(ag); l.connect(lg); lg.connect(ag.gain); ag.connect(g); g.connect(OUT); AMB.wind={g, nodes:[n,l], q:0}; }
    if(AMB.wind){ AMB.wind.g.gain.setTargetAtTime(wl, t, 1.2); AMB.wind.q=wl>.002?0:AMB.wind.q+dt; if(AMB.wind.q>4){ for(const n of AMB.wind.nodes){ try{ n.stop(); n.disconnect(); }catch(e){} } AMB.wind.g.disconnect(); AMB.wind=null; } }
    // mưa (nếu có hệ thời tiết)
    const rain=outdoorOK ? clamp(prov.rain||0,0,1) : 0;
    if(rain>.01 && !AMB.rain){ const g=G(0), n=loop(WH), lp=F('lowpass',3800), hp=F('highpass',500); n.connect(lp); lp.connect(hp); hp.connect(g); g.connect(OUT); AMB.rain={g, nodes:[n], q:0}; }
    if(AMB.rain){ AMB.rain.g.gain.setTargetAtTime(.06*rain, t, 1); AMB.rain.q=rain>.01?0:AMB.rain.q+dt; if(AMB.rain.q>4){ try{ AMB.rain.nodes[0].stop(); }catch(e){} AMB.rain.g.disconnect(); AMB.rain=null; } }
    // chim (ngày) / dế (đêm) ở công viên, đồi, vườn
    const nat=outdoorOK ? clamp(prov.nature||0,0,1) : 0, night=clamp(W.night||0,0,1);
    if(nat>.05 && night<.5){ AMB.birdsT-=dt; if(AMB.birdsT<=0){ AMB.birdsT=rnd(.8,3.2)/(.4+nat); const pan=A.panner(); if(pan.pan) pan.pan.value=rnd(-.8,.8); const g=G(.045*nat*(1-night*2)); g.connect(pan); pan.connect(OUT);
        const s=t+.02, f0=rnd(2400,3800), n=2+Math.floor(Math.random()*4); for(let i=0;i<n;i++) tone(g,s+i*rnd(.07,.12),{f:f0*rnd(.9,1.15), f2:f0*rnd(1.1,1.5), glide:.05, a:.003, rel:.07, peak:.6});
        setTimeout(()=>{ try{ g.disconnect(); pan.disconnect(); }catch(e){} }, 1500); } }
    const cl=(nat>.05 && night>.5) ? .02*nat*sst(.5,.8,night) : 0;
    if(cl>.001 && !AMB.crickets){ const g=G(0), o=osc('sine',4300), am=G(0), l=osc('square',28), lg=G(.5), gate=G(0), gl=osc('sine',.7), glg=G(.5); o.connect(am); l.connect(lg); lg.connect(am.gain); am.connect(gate); gl.connect(glg); glg.connect(gate.gain); gate.connect(g); g.connect(OUT); AMB.crickets={g, nodes:[o,l,gl], q:0}; }
    if(AMB.crickets){ AMB.crickets.g.gain.setTargetAtTime(cl, t, 1.5); AMB.crickets.q=cl>.001?0:AMB.crickets.q+dt; if(AMB.crickets.q>5){ for(const n of AMB.crickets.nodes){ try{ n.stop(); n.disconnect(); }catch(e){} } AMB.crickets.g.disconnect(); AMB.crickets=null; } } }

  /* ---------- tiếng một lần từ module khác: W.sfx('lift-ding', x, y, z) ---------- */
  const ONE={
    'lift-ding':(dst,t)=>{ bell(dst,t,1318,.5,1.3); bell(dst,t+.32,1046,.45,1.5); },
    'lift-door':(dst,t)=>{ burst(dst,t,{type:'bandpass',f:700,q:.8,a:.08,hold:.45,rel:.25,peak:.35}); },
    'shock':(dst,t)=>{ tone(dst,t,{f:75,f2:32,glide:1.1,a:.01,rel:1.3,peak:.9}); burst(dst,t,{buf:BR,type:'lowpass',f:140,q:.6,a:.01,rel:1.2,peak:.8}); },
    'pop':(dst,t)=>{ burst(dst,t,{buf:BR,type:'lowpass',f:200,q:.7,a:.002,rel:.4,peak:.8}); },
  };
  const ONE_CAP={'lift-ding':.06, 'lift-door':.035, 'shock':.12, 'pop':.08}, ONE_REF={'lift-ding':5, 'lift-door':4, 'shock':40, 'pop':40}, ONE_RANGE={'lift-ding':30, 'lift-door':20, 'shock':260, 'pop':240};
  function sfx(name, x, y, z){ const f=ONE[name]; if(!f || !A.ctx || A.master.gain.value<.001) return; const d=Math.hypot(x-P.x, (y??P.y)-P.y, z-P.z), rg=ONE_RANGE[name]||40; if(d>rg) return;
    const vol=(ONE_CAP[name]||.05)/(1+(d/(ONE_REF[name]||8))**2)*(1-sst(rg*.75,rg,d)); if(vol<.0008) return;
    const g=G(vol), pan=A.panner(); if(pan.pan) pan.pan.value=panFor(x,z)*.8; g.connect(pan); pan.connect(name.startsWith('lift') ? IN : OUT); const t=c.currentTime+.01; f(g,t); setTimeout(()=>{ try{ g.disconnect(); pan.disconnect(); }catch(e){} }, 3500); }

  /* ---------- mỗi khung: gom nguồn → chọn gần nhất theo loại → cập nhật giọng ---------- */
  const prevD=new Map();
  const providers=makeProviders(W);
  function frame(dt){
    const t=c.currentTime, inside=!!W.inside || !!(W.HOOK && W.HOOK.camBox); tick-=dt;   /* toà V2 dùng camBox thay cho W.inside */ if(tick>0) return; const step=.2; tick=step;
    let prov={list:[], rain:0, nature:0}; try{ prov=providers(prov)||prov; }catch(e){ if(!frame.err){ frame.err=1; console.warn('[ambience_world] providers', e); } }
    const by={}; for(const e of prov.list){ if(!KINDS[e.kind] && !KINDS[e.snd]) continue; const k=e.snd||e.kind; const K=KINDS[k]; const d=Math.hypot(e.x-P.x, (e.y??P.y)-P.y, e.z-P.z); if(d>K.range) continue; e.d=d; (by[k]||(by[k]=[])).push(e); }
    const want=new Set();
    for(const k in by){ const K=KINDS[k]; by[k].sort((a,b)=>a.d-b.d); for(const e of by[k].slice(0,K.max)){ const id=k+':'+e.id; want.add(id); let v=VOICES.get(id); if(!v) v=mkVoice(k, id);
        // Doppler nhẹ: theo vận tốc xuyên tâm (d thay đổi giữa 2 lần đo), làm mềm 60 %
        const pd=prevD.get(id), vr=pd==null ? 0 : (e.d-pd)/step; prevD.set(id, e.d); const dop=clamp(1+(343/(343+clamp(vr,-60,60))-1)*.6, .85, 1.15);
        let m=1; try{ m=K.upd(v,e,t,dop) ?? 1; }catch(err){}
        const out=inside ? .55 : 1;   /* (bus outdoor của ambience.js đã đục + nhỏ khi vào nhà) */
        v.g.gain.setTargetAtTime(lvl(K,e.d)*m*out, t, .25); if(v.pan.pan) v.pan.pan.setTargetAtTime(panFor(e.x, e.z)*.8, t, .15); v.quietT=0; } }
    for(const [id,v] of VOICES){ if(want.has(id)) continue; v.g.gain.setTargetAtTime(0, t, .3); v.quietT+=step; if(v.quietT>2) { kill(v); prevD.delete(id); } }
    ambient(t, step, !inside, prov);
  }
  return {frame, sfx, voices:VOICES, ambient:AMB, kinds:KINDS};
}

/* ============================== NGUỒN ÂM: đọc API các vùng (chỉ đọc) ============================== */
function makeProviders(W){
  const T3=W.THREE, P=W.P, _m=new T3.Matrix4(), _v=new T3.Vector3(), clamp=(v,a,b)=>v<a?a:v>b?b:v, last=new Map();
  // tốc độ ước lượng từ 2 lần đo (cho vật không có trường vận tốc)
  const speedOf=(id,x,y,z)=>{ const now=performance.now()/1000, l=last.get(id); last.set(id,{x,y,z,t:now}); if(!l || now-l.t>1.5 || now-l.t<.01) return 0; return Math.hypot(x-l.x,y-l.y,z-l.z)/(now-l.t); };
  const rectD=(x,z,r)=>Math.hypot(Math.max(r[0]-x,0,x-r[1]), Math.max(r[2]-z,0,z-r[3]));   // khoảng cách tới hình chữ nhật [x0,x1,z0,z1]
  // vùng thiên nhiên (chim ngày / dế đêm): [x0,x1,z0,z1,(lọc)] hoặc {c:[x,z], r}
  const NATURE=[[-850,-250,-500,250], [110,840,-940,-140, (x,z)=>!(x<620 && z>-200) && !(x<620 && z<-740)], [-386,218,765,1105], {c:[-69,556.5], r:57}, [620,1150,-100,450], {c:[560,-600], r:70}];
  const natureAt=(x,z)=>{ let n=0; for(const a of NATURE){ const d=Array.isArray(a) ? (a[4] && !a[4](x,z) ? 99 : rectD(x,z,a)) : Math.max(0, Math.hypot(x-a.c[0],z-a.c[1])-a.r); n=Math.max(n, 1-clamp(d/20,0,1)); } return n; };
  let palmTrain=null, palmTry=0, palmNext=0;
  const findPalm=()=>{ const now=performance.now(); if(palmTrain || palmTry>6 || now<palmNext) return palmTrain; palmTry++; palmNext=now+15000;
    W.scene.traverse(o=>{ if(!palmTrain && o.isGroup && o.userData && o.userData.zone==='palm' && o.userData.dynamic && Math.abs(o.position.x-650)<1.5 && o.children.length && o.position.z>500 && o.position.z<1300) palmTrain=o; }); return palmTrain; };
  const evPrev=new Map();
  return prov=>{ const L=prov.list, dc=W.devcityV2, sk=W.skyportV2, br=W.brainV2, ab=W.abyssalV2, wo=W.wonderV2;
    /* ✈️ máy bay */
    try{ const to=dc && dc.landmarks && dc.landmarks.takeoff; if(to && to.p && to.p.visible){ to.p.getWorldPosition(_v); const t=to.t||0, th=t<6 ? .2 : t<30 ? .55+.45*(t-6)/24 : 1; L.push({kind:'jet', id:'dc-plane', x:_v.x, y:_v.y, z:_v.z, thrust:th}); } }catch(e){}
    try{ const ai=sk && sk.AI; if(ai && ai.p && ai.p.visible && ai.mode!=='idle'){ ai.p.getWorldPosition(_v); L.push({kind:'jet', id:'sky-ai', x:_v.x, y:_v.y, z:_v.z, v:ai.v||0}); } }catch(e){}
    try{ if(sk && sk.flying && sk.flying()){ const fs=sk.flightState ? sk.flightState() : {}; L.push({kind:'jet', id:'sky-me', x:P.x, y:P.y+1.5, z:P.z, v:fs.v||40}); } }catch(e){}   /* đang bay: nghe từ trong khoang */
    /* 🚁 trực thăng (Dev City nóc bệnh viện · Brain quay chậm) – 🎈 khinh khí cầu */
    const V2=!!W.V2;   /* nguồn cố định theo toạ độ V2 – ở V1 (?v1) không phát */
    if(V2){ L.push({kind:'heli', id:'dc-heli', x:680, y:49, z:-368, spin:true}); L.push({kind:'heli', id:'br-heli', x:954, y:111, z:101, spin:false}); }
    if(V2) try{ const riding=br && br.ride && br.ride.on==='balloon'; L.push(riding ? {kind:'balloon', id:'balloon', x:P.x, y:P.y+4, z:P.z} : {kind:'balloon', id:'balloon', x:925, y:118, z:250}); }catch(e){}
    /* 🛶 kayak · 🚤 thuyền người chơi lái */
    try{ if(ab && ab.KY && ab.KY.on) L.push({kind:'kayak', id:'ab-me', x:ab.KY.x, y:ab.LY ?? -29.5, z:ab.KY.z}); }catch(e){}
    try{ const bl=W.abyssalBots && W.abyssalBots.list; if(bl) bl.forEach((o,i)=>{ if(o.kayak) L.push({kind:'kayak', id:'ab-k'+i, x:o.x, y:o.y+1, z:o.z}); }); }catch(e){}
    try{ const sl=sk && sk.bots && sk.bots.list; if(sl) sl.forEach((o,i)=>{ if(o.x>358 && o.x<372 && Math.abs((o.y ?? 0)-(W.WATER_Y ?? 0))<1.5) L.push({kind:'kayak', id:'cbd-k'+i, x:o.x, y:o.y ?? 0, z:o.z}); }); }catch(e){}
    try{ const r=W.life && W.life.V && W.life.V.riding && W.life.V.riding(); if(r && r.type==='boat' && r.obj){ r.obj.getWorldPosition(_v); L.push({kind:'boat', id:'me-boat', x:_v.x, y:_v.y, z:_v.z, v:Math.abs(r.v||0)}); } }catch(e){}
    /* 🚝 tàu: Dev City · Palm · Swiss · tàu lượn Kỳ Quan */
    try{ if(dc && dc.cars && dc.TR){ let best=null, bd=1e9; for(const g of dc.cars){ g.getWorldPosition(_v); const d=(_v.x-P.x)**2+(_v.y-P.y)**2+(_v.z-P.z)**2; if(d<bd){ bd=d; best=_v.clone(); } } if(best) L.push({kind:'train', id:'dc-mono', x:best.x, y:best.y+2, z:best.z, v:Math.abs(dc.TR.v||0)}); } }catch(e){}
    try{ const pt=findPalm(); if(pt){ pt.getWorldPosition(_v); L.push({kind:'train', id:'palm-mono', x:_v.x, y:15, z:_v.z, v:speedOf('palm',_v.x,15,_v.z)}); } }catch(e){}
    try{ const sc=W.swissV2 && W.swissV2.cars; if(sc && sc.length){ let best=null, bd=1e9; for(const g of sc){ g.getWorldPosition(_v); const d=(_v.x-P.x)**2+(_v.z-P.z)**2; if(d<bd){ bd=d; best=_v.clone(); } } if(best) L.push({kind:'train', id:'swiss-cog', x:best.x, y:best.y+1.5, z:best.z, v:speedOf('swiss',best.x,best.y,best.z)}); } }catch(e){}
    try{ const CO=wo && wo.park && wo.park.rides && wo.park.rides.COASTERS; if(CO) CO.forEach((co,i)=>{ const tr=co.trains && co.trains[0]; if(!tr || !tr.a || !(Math.abs(co.v||0)>.5)) return; tr.a.getMatrixAt(0,_m); _m.premultiply(tr.a.matrixWorld); _v.setFromMatrixPosition(_m); L.push({kind:'train', id:'co'+i, x:_v.x, y:_v.y, z:_v.z, v:Math.abs(co.v)*.8}); }); }catch(e){}
    /* 🚓🚒🚑 còi: xe đặc biệt đang làm nhiệm vụ + xe tuần tra bật còi */
    try{ const TR=W.traffic; if(TR){ (TR.specials||[]).forEach((s,i)=>{ if(s && s.siren && s.active && !s.arrived && !s.done && s.g && /^(police|fire|ambulance)$/.test(s.kind)){ const p=s.g.position; L.push({snd:'siren', kind:s.kind, id:'sp'+i, x:p.x, y:p.y+1.5, z:p.z}); } });
        (TR.cars||[]).forEach((c2,i)=>{ if(c2 && c2.patrol && c2.siren && c2.active && c2.g){ const p=c2.g.position; L.push({snd:'siren', kind:'police', id:'pt'+i, x:p.x, y:p.y+1.5, z:p.z}); } }); } }catch(e){}
    /* 🎬 sự kiện thế giới */
    try{ const EV=W.events; if(EV && EV.active){ const act=EV.active()||[], raw=EV._ACTIVE, dbg=EV._dbg ? EV._dbg() : {};
        const rawOf=k=>{ if(!raw) return null; const arr=Array.isArray(raw) ? raw : (raw.values ? [...raw.values()] : []); return arr.find(e=>e && e.key===k) || null; };
        for(const e of act){ const R=rawOf(e.key)||{}, y=R.y ?? W.groundAt(e.x,e.z), ph=e.phase, id='ev'+e.key, pk=id+':'+ph; const first=!evPrev.has(pk); if(first) evPrev.set(pk, 1);
          if(e.key==='B'){ const lvl=R.fire ?? (ph==='steam'||ph==='pack'||ph==='leave' ? .1 : 1); if(lvl>.03) L.push({kind:'fire', id:id+'f', x:e.x, y:y+1, z:e.z, level:lvl}); if(ph==='spray') L.push({kind:'hose', id:id+'h', x:e.x, y:y+1, z:e.z}); if(ph==='steam') L.push({kind:'hose', id:id+'s', x:e.x, y:y+1.5, z:e.z}); }
          else if(e.key==='C'){ const M=dbg.MON && dbg.MON.g; if(M){ M.getWorldPosition(_v); if(/^(fall|roar|hero|landed|fight)$/.test(ph)) L.push({kind:'monster', id:id+'m', x:_v.x, y:_v.y+4, z:_v.z}); if(ph==='boom' && first && W.sfx) W.sfx('shock', _v.x, _v.y+4, _v.z); }
            if(/^(cheer|leave|crystals)$/.test(ph)){ L.push({kind:'fireworks', id:id+'fw', x:e.x, y:y+35, z:e.z}); if(ph==='cheer') L.push({kind:'crowd', id:id+'c', x:e.x, y:y+1, z:e.z, cheer:true}); } }
          else if(e.key==='D4'){ if(ph==='dance') L.push({kind:'beat', id:id+'b', x:e.x, y:y+1, z:e.z}); if(ph==='bow') L.push({kind:'crowd', id:id+'c', x:e.x, y:y+1, z:e.z, cheer:true}); }
          else if(e.key==='D5'){ const B=dbg.BOT; if(B && (ph==='glitch'||ph==='fixed')) L.push({kind:'robot', id:id+'r', x:B.x ?? e.x, y:y+1, z:B.z ?? e.z}); }
          else if(e.key==='D6'){ L.push({kind:'lantern', id:id+'l', x:e.x, y:y+8, z:e.z}); }
          else if(e.key==='A' && ph==='down') L.push({kind:'crowd', id:id+'c', x:e.x, y:y+1, z:e.z, cheer:first}); }
        if(evPrev.size>200) evPrev.clear(); } }catch(e){}
    /* 🌊 thác nước · đài phun (điểm gần nhất trên vệt thác) – chỉ V2 */
    if(V2){ L.push({kind:'water', id:'ab-dam', x:clamp(P.x,-37,37), y:clamp(P.y,-29.8,.6), z:161.75, level:1});
    for(const sx of [1,-1]) L.push({kind:'water', id:'ab-wall'+sx, x:150*sx, y:clamp(P.y,-28.7,28), z:-19, level:.85});
    if(ab && ab.ST && Math.hypot(P.x-ab.ST.x,P.z-ab.ST.z)<90) L.push({kind:'water', id:'ab-fount', x:ab.ST.x, y:-28.5, z:ab.ST.z+6, level:.5});
    { const a=Math.atan2(P.z-180,P.x-880); L.push({kind:'water', id:'br-pool', x:880+Math.cos(a)*32, y:112, z:180+Math.sin(a)*32, level:.4}); }
    L.push({kind:'water', id:'cbd-fount', x:clamp(P.x,300,346), y:W.WATER_Y ?? 0, z:clamp(P.z,104.5,115.5), level:.45});
    if(sk && sk.FALL) L.push({kind:'water', id:'sky-fall', x:sk.FALL.x, y:clamp(P.y,4,20), z:sk.FALL.z, level:.55});
    L.push({kind:'water', id:'swiss-fall', x:-560, y:clamp(P.y,0,40), z:-378, level:.8});
    if(wo) L.push({kind:'water', id:'kq-lake', x:-90, y:1, z:873.5, level:.4});
    for(const [x,z,i] of [[650,968,1],[650,1292,2]]) L.push({kind:'water', id:'palm-f'+i, x, y:1, z, level:.35});
    /* 🎐 chuông gió phố cổ Lầu Vách Đèn Lồng (nghe khi ở gần mặt tiền các tầng) */
    L.push({kind:'chime', id:'hnd', x:clamp(P.x,148,228), y:clamp(P.y,3,46), z:clamp(P.z,-206,-196)}); }
    /* 🐦 thiên nhiên */
    prov.nature=V2 ? natureAt(P.x, P.z) : 0; prov.rain=(W.weather && W.weather.rain) || 0;
    return prov; };
}

