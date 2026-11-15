// QC World – ĐƯỜNG RAY TÀU LƯỢN (toán thuần, không phụ thuộc three.js → chạy thử được bằng node: tools/qa/tracktest.mjs)
// "Rùa bay": đứng ở p, hướng bay d, đỉnh đầu u. Mỗi lệnh xoay khung (ngóc/cúi, lăn, rẽ) rồi tiến lên → đường ray trơn + độ nghiêng do người thiết kế quyết định.
// Quy ước: yaw θ → d=(sin θ, 0, cos θ) (0 = hướng +z/Nam, 90° = +x/Đông). Rẽ TRÁI = góc dương. L = u × d = bên trái.
const G=9.81, RAD=Math.PI/180, Y=[0,1,0];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm=a=>{ const l=Math.hypot(a[0],a[1],a[2])||1; return [a[0]/l,a[1]/l,a[2]/l]; };
const lin=(a,b,ka,kb)=>[a[0]*ka+b[0]*kb, a[1]*ka+b[1]*kb, a[2]*ka+b[2]*kb];
const rotY=(v,a)=>{ const c=Math.cos(a), s=Math.sin(a); return [v[0]*c+v[2]*s, v[1], v[2]*c-v[0]*s]; };
const weights=(kind,n)=>{ const w=[]; let s=0; for(let i=0;i<n;i++){ const t=(i+.5)/n; const v= kind==='lin'?1 : kind==='loop'?1+1.25*(1-Math.cos(2*Math.PI*t))/2 : kind==='s'?1-Math.cos(2*Math.PI*t) : kind==='pull'?(1.6-1.2*t)*Math.min(1,t/.1,(1-t)/.1) : kind==='up'?(.4+1.2*t)*Math.min(1,t/.1,(1-t)/.1) : Math.min(1,t/.22,(1-t)/.22); w.push(v); s+=v; } return w.map(v=>v/s); };

export function trackBuilder(x,y,z,yawDeg){
  let p=[x,y,z], d=[Math.sin(yawDeg*RAD),0,Math.cos(yawDeg*RAD)], u=[0,1,0], tw=0, zone='station', auto=false;
  const P=[], U=[], Z=[], A=[], marks={}, cusps=[], DS=1;
  const outU=()=>{ if(!tw) return u.slice(); const L=cross(u,d); return nrm(lin(u,L,Math.cos(tw),Math.sin(tw))); };
  const put=()=>{ P.push(p.slice()); U.push(outU()); Z.push(zone); A.push(auto); };
  const fix=()=>{ d=nrm(d); u=nrm(lin(u,d,1,-dot(u,d))); };
  put();
  const B={
    zone(n){ zone=n; return B; }, mark(n){ marks[n]=P.length-1; return B; },
    // ĐƯỜNG CỤT: tàu dừng ở đây rồi chạy NGƯỢC lại. retrace(len) = đi lùi lại đúng len mét ray vừa đặt (vùng 'dup' – không vẽ lại), sau đó rẽ nhánh ray mới
    cusp(n){ marks[n]=P.length-1; cusps.push(P.length-1); return B; },
    retrace(len){ const n=Math.min(P.length-2,Math.round(len/DS)), k0=P.length-1, z0=zone; zone='dup'; for(let k=1;k<=n;k++){ p=P[k0-k].slice(); u=U[k0-k].slice(); put(); } d=nrm(lin(P[k0-n],P[k0-n+1],1,-1)); u=U[k0-n].slice(); zone=z0; return B; },
    get pos(){ return p.slice(); }, get dir(){ return d.slice(); }, get up(){ return u.slice(); },
    // đoạn tổng quát: p = ngóc lên (độ), y = rẽ trái quanh trục thẳng đứng, ly = rẽ quanh đỉnh đầu, r = lăn nghiêng trái, tw = xoắn (chỉ xoay "đỉnh đầu" hiển thị),
    // bank = nghiêng vào rồi trả lại trong đoạn, shift = trượt ngang sang trái (m) – tránh ray đè nhau ở chân vòng lộn
    seg(len,o={}){ const n=Math.max(2,Math.round(len/DS)), ds=len/n, w=weights(o.ease||'trap',n), wl=weights('lin',n), S0=cross(u,d), fb=Math.max(2,Math.round(n*(o.fb||.3)));
      const wb=weights('s',fb);
      for(let i=0;i<n;i++){ const a=(o.p||0)*RAD*w[i], c=(o.y||0)*RAD*w[i], e=(o.ly||0)*RAD*w[i]; let b=(o.r||0)*RAD*w[i];
        if(o.bank){ if(i<fb) b+=o.bank*RAD*wb[i]; else if(i>=n-fb) b-=o.bank*RAD*wb[i-(n-fb)]; }
        if(c){ d=rotY(d,c); u=rotY(u,c); }
        if(e){ const L=cross(u,d); d=lin(d,L,Math.cos(e),Math.sin(e)); }
        if(a){ const d2=lin(d,u,Math.cos(a),Math.sin(a)); u=lin(u,d,Math.cos(a),-Math.sin(a)); d=d2; }
        if(b){ const L=cross(u,d); u=lin(u,L,Math.cos(b),Math.sin(b)); }
        fix(); if(o.tw) tw+=o.tw*RAD*wl[i];
        p=lin(p,d,1,ds); if(o.shift) p=lin(p,S0,1,o.shift/n); put(); }
      if(Math.abs(tw)>1e-6 && Math.abs(Math.sin(tw/2))<1e-3) tw=0; return B; },
    fwd(len){ return B.seg(len); },
    turn(deg,R,o={}){ const len=Math.abs(deg)*RAD*R; return B.seg(len,{y:deg, bank:(o.bank??48)*Math.sign(deg), fb:o.fb||Math.min(.42,Math.max(.18,9/len)), p:o.p||0, ease:o.ease}); },
    pitchTo(len,deg,ease){ const cur=Math.asin(Math.max(-1,Math.min(1,d[1])))/RAD; return B.seg(len,{p:deg-cur, ease}); },
    level(len=10){ const L=cross(u,d), us=nrm(lin(Y,d,1,-d[1])), b=Math.atan2(dot(us,L),dot(us,u))/RAD; return Math.abs(b)>.01?B.seg(len,{r:b, ease:'s'}):B; },
    loop(R,shift=3.4){ return B.seg(2*Math.PI*R*.93,{p:360, ease:'loop', shift}); },
    immelmann(R){ B.seg(Math.PI*R,{p:180, ease:'loop'}); return B.seg(R*1.9,{r:180, ease:'s'}); },
    diveLoop(R){ B.seg(R*1.9,{r:180, ease:'s'}); return B.seg(Math.PI*R,{p:180, ease:'loop'}); },
    cork(len,dir=1,al=40){ return B.seg(len,{p:360*Math.sin(al*RAD), r:dir*360*Math.cos(al*RAD)}); },
    cobra(R,dir=1){ const Lb=R*2.3, s=180*Math.SQRT1_2; B.seg(Math.PI*R,{p:180, ease:'loop'}); B.seg(Lb,{p:s, r:dir*s}); B.seg(Lb,{p:s, r:-dir*s}); return B.seg(Math.PI*R,{p:180, ease:'loop'}); },
    // nối trơn tới 1 điểm + hướng cho trước (đường Hermite), tự nghiêng theo độ cong
    to(tx,ty,tz,yawDeg2,k=1){ const t1=[Math.sin(yawDeg2*RAD),0,Math.cos(yawDeg2*RAD)], q=[tx,ty,tz], dist=Math.hypot(tx-p[0],ty-p[1],tz-p[2]), m=dist*k, n=Math.max(4,Math.round(dist*1.15));
      const p0=p.slice(), d0=d.slice(); auto=true;
      for(let i=1;i<=n;i++){ const t=i/n, t2=t*t, t3=t2*t, h00=2*t3-3*t2+1, h10=t3-2*t2+t, h01=-2*t3+3*t2, h11=t3-t2;
        p=[0,1,2].map(j=>h00*p0[j]+h10*m*d0[j]+h01*q[j]+h11*m*t1[j]); u=[0,1,0]; put(); }
      d=t1; u=[0,1,0]; auto=false; A[A.length-1]=false; return B; },
    // KẾT THÚC: đường khép kín (điểm cuối trùng điểm đầu) → lấy mẫu đều 1 m, tiếp tuyến, độ nghiêng tự động cho các đoạn "to", làm trơn
    finish(){ const n0=P.length-1, cum=[0]; for(let i=1;i<=n0;i++) cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1],P[i][2]-P[i-1][2]));
      const Ltot=cum[n0], N=Math.round(Ltot), ds=Ltot/N, RP=[], RU=[], RZ=[], RA=[]; let j=0;
      for(let i=0;i<N;i++){ const s=i*ds; while(j<n0-1 && cum[j+1]<s) j++; const t=(s-cum[j])/Math.max(1e-6,cum[j+1]-cum[j]);
        RP.push(lin(P[j],P[j+1],1-t,t)); RU.push(nrm(lin(U[j],U[j+1],1-t,t))); RZ.push(Z[t<.5?j:j+1]); RA.push(A[j]&&A[j+1]); }
      const mk={}; for(const k in marks) mk[k]=cum[Math.min(n0,marks[k])];
      const w=i=>((i%N)+N)%N, cs=cusps.map(k=>cum[k]), np=cs.length, pid=RP.map((_,i)=>{ let n=0; for(const c of cs) if(i*ds>c) n++; return n; }), same=(a,b)=>pid[a]===pid[b] || (pid[a]===0 && pid[b]===np) || (pid[a]===np && pid[b]===0);
      const T=RP.map((_,i)=>{ const a=w(i-1), b=w(i+1); return same(a,b)?nrm(lin(RP[b],RP[a],1,-1)) : same(i,b)?nrm(lin(RP[b],RP[i],1,-1)) : nrm(lin(RP[i],RP[a],1,-1)); });
      let hmax=-1e9; for(const q of RP) hmax=Math.max(hmax,q[1]);
      const bank=new Float32Array(N); for(let i=0;i<N;i++){ if(!RA[i]) continue; const kv=lin(T[w(i+2)],T[w(i-2)],1/(4*ds),-1/(4*ds)), Lh=nrm(cross(Y,T[i])), v2=Math.min(1100,Math.max(80,2*G*(hmax+2-RP[i][1])));
        bank[i]=Math.max(-1.1,Math.min(1.1,Math.atan(v2*dot(kv,Lh)/G)))*(RZ[i]==='station'?.12:RZ[i]==='brake'?.6:RZ[i].startsWith('cruise')?.35:1); }
      for(let pass=0;pass<4;pass++){ const b2=bank.slice(); for(let i=0;i<N;i++) if(RA[i]) bank[i]=(b2[w(i-3)]+b2[w(i-2)]+b2[w(i-1)]+b2[i]+b2[w(i+1)]+b2[w(i+2)]+b2[w(i+3)])/7; }
      for(let i=0;i<N;i++) if(RA[i]){ const Lh=nrm(cross(Y,T[i])), up=nrm(lin(Y,T[i],1,-T[i][1])); RU[i]=nrm(lin(up,Lh,Math.cos(bank[i]),Math.sin(bank[i]))); }
      for(let pass=0;pass<2;pass++){ const u2=RU.map(v=>v.slice()); for(let i=0;i<N;i++) RU[i]=nrm([0,1,2].map(c=>u2[w(i-1)][c]+2*u2[i][c]+u2[w(i+1)][c])); }
      for(let i=0;i<N;i++) RU[i]=nrm(lin(RU[i],T[i],1,-dot(RU[i],T[i])));
      return {N, L:Ltot, ds, P:RP, T, U:RU, Z:RZ, marks:mk, hmax, cusps:cs}; } };
  return B;
}
// soi gương qua mặt phẳng z = zp (đường đua đôi)
export function mirrorZ(tr,zp){ const f=v=>[v[0],v[1],2*zp-v[2]], g=v=>[v[0],v[1],-v[2]]; return {...tr, P:tr.P.map(f), T:tr.T.map(g), U:tr.U.map(g)}; }
// khung tại quãng đường s (m): vị trí, tiếp tuyến, đỉnh đầu (nội suy)
export function frameAt(tr,s,out){ const N=tr.N, f=(((s/tr.ds)%N)+N)%N, i=Math.floor(f)%N, j=(i+1)%N, t=f-Math.floor(f), o=out||{p:[0,0,0],t:[0,0,0],u:[0,0,0]};
  for(let c=0;c<3;c++){ o.p[c]=tr.P[i][c]+(tr.P[j][c]-tr.P[i][c])*t; o.t[c]=tr.T[i][c]+(tr.T[j][c]-tr.T[i][c])*t; o.u[c]=tr.U[i][c]+(tr.U[j][c]-tr.U[i][c])*t; }
  o.zone=tr.Z[i]; return o; }
// một bước vật lý của đoàn tàu (st = {s, v}); vùng: lift (xích kéo), launch (phóng từ trường), brake (phanh từ), station (lăn chậm trong ga)
export function physStep(tr,st,dt,cfg={}){ const N=tr.N, i=Math.floor((((st.s/tr.ds)%N)+N)%N), z=tr.Z[i], ty=tr.T[i][1]; let v=st.v;
  if(z==='lift') v=v<(cfg.lift||5.5)?Math.min(cfg.lift||5.5, v+7*dt):Math.max(cfg.lift||5.5, v-9*dt);
  else if(z==='launch') v=Math.min(cfg.launchV||36, v+(cfg.launchA||14)*dt);
  else if(z==='brake') v=Math.max(cfg.brakeV||5, v-(cfg.brakeA||7.5)*dt);
  else if(z.charCodeAt(0)===99 && z.startsWith('cruise')){ const cv=+z.slice(7)||5; v=v<cv?Math.min(cv, v+4*dt):Math.max(cv, v-9*dt); }   /* cruise:N – bánh lốp đẩy tàu đi đều N m/s qua các cảnh diễn */
  else if(z==='station'){ const sv=cfg.stV||3; v=v<sv?Math.min(sv, v+3*dt):Math.max(sv, v-6*dt); }
  else { v+=(-G*ty-.12-.00038*v*v)*dt; if(v<(cfg.vmin||4)) v=cfg.vmin||4; }
  st.v=v; st.s+=v*dt; st.zone=z; return st; }

// GÒ ĐÁ / NÚI (đợt 2): elip tâm (x,z), bán trục rx/rz, cao h. e = độ "bằng đỉnh"; cone = núi lửa hình nón (số mũ), crater = bán kính miệng (tỉ lệ), depth = sâu miệng
export const MOUNDS={ jura1:{x:272,z:992,rx:66,rz:60,h:66,e:3.5}, jura2:{x:160,z:1064,rx:24,rz:20,h:15,e:2.5}, volc:{x:24,z:1010,rx:72,rz:72,h:55,cone:.8,crater:.14,depth:7}, volcN:{x:8,z:950,rx:30,rz:16,h:9,e:2.5}, crys:{x:98.7,z:999,rx:8,rz:36,h:13,e:2.5} };
export function moundH(m,x,z){ const r=Math.hypot((x-m.x)/m.rx,(z-m.z)/m.rz); if(r>=1) return 0; if(m.cone){ const rr=Math.max(r,m.crater||0), hh=m.h*Math.pow(1-rr,m.cone); return r<(m.crater||0)?hh-m.depth*(1-Math.pow(r/m.crater,2)):hh; } return m.h*(1-Math.pow(r,m.e||2.5)); }

/* ====================== 3 ĐƯỜNG TÀU LƯỢN ĐỢT 1 (toạ độ thế giới; g = cao độ mặt đất công viên) ====================== */
export const TRACKS={
  // #1 THẦN LONG CUỒNG NỘ – ga (20…58, 712) chạy về Đông; dốc xích 68 m, lao 84°, vòng lộn 39 m, cobra, xoắn không trọng lực, 2 xoắn ốc trên hồ, xoáy 540°
  dragon(g){ const b=trackBuilder(20,g+.8,712,90);
    b.fwd(38).mark('stop'); b.zone('free').fwd(6).zone('lift').pitchTo(14,42).fwd(85).pitchTo(16,0).zone('free');
    b.turn(-180,15,{bank:30}); b.pitchTo(20,-84).fwd(24).seg(58,{p:84, ease:'pull'}); b.fwd(4).loop(19.5,-5.2); b.fwd(42).cobra(22,1); b.fwd(6);
    b.pitchTo(24,30).seg(64,{p:-60, tw:360, ease:'lin'}).pitchTo(24,0);
    b.turn(90,30,{bank:62}); b.pitchTo(18,26).fwd(34).pitchTo(18,0); b.turn(130,30,{bank:60}); b.level(4).cork(56,-1).fwd(5).cork(56,-1).fwd(4);
    b.to(-40,g+17,742,0,1); b.pitchTo(8,-4.6).seg(2*Math.PI*17*1.5,{y:-540, bank:-62, fb:.1}).mark('helixEnd');
    b.zone('brake').to(-44,g+.8,712,90,1.05).zone('station').to(20,g+.8,712,90,.6); return b.finish(); },
  // #2 TIA CHỚP KHÔNG GIAN – ga (100…130, 536) chạy về Đông; hầm phóng 52 m, mũ chóp 60 m dựng đứng 90°, Immelmann, lao dốc, 3 đồi lạc đà, vòng thắt nút
  space(g){ const b=trackBuilder(100,g+.8,536,90);
    b.fwd(30).mark('stop'); b.zone('free').fwd(4).zone('launch').fwd(52).zone('free');
    b.seg(52,{p:90, ease:'up'}).fwd(18).seg(40,{p:-180}).mark('hold').fwd(12).seg(60,{p:90, ease:'pull'});
    b.fwd(2).turn(-90,34,{bank:62}); b.fwd(4).immelmann(19); b.level(4);
    b.turn(180,15,{bank:62}); b.pitchTo(24,-50).fwd(12).seg(40,{p:50, ease:'pull'});
    for(const [h,l] of [[24,50],[20,44]]) b.pitchTo(20,h).seg(l,{p:-2*h, ease:'lin'}).pitchTo(20,0);
    b.fwd(3).turn(-180,22,{bank:64}); b.fwd(4).pitchTo(20,18).seg(34,{p:-36, ease:'lin'}).pitchTo(20,0); b.fwd(4).loop(12,-4.8).fwd(6);
    b.to(262,g+6,640,180,.5).to(196,g+2.6,556,-90,.85).zone('brake').to(100,g+.8,556,-90,.5).zone('station');
    b.to(90,g+.8,546,180,.75).to(100,g+.8,536,90,.75); return b.finish(); },
  // #3 SONG DỰC ĐẠI BÀNG – tàu TREO, 2 đường đua soi gương qua z = 620; đường A (đỏ) phía Bắc. Ga (-122…-152, 615.5) chạy về Tây
  eagle(g){ const b=trackBuilder(-122,g+2.95,615.5,-90);
    b.fwd(30).mark('stop'); b.zone('free').fwd(5).zone('lift').pitchTo(12,40).fwd(46).pitchTo(14,0).zone('free');
    b.turn(-180,12,{bank:35}); b.pitchTo(16,-70).fwd(9).seg(40,{p:70, ease:'pull'}); b.fwd(3).loop(13.5,4.8).fwd(2);
    b.turn(180,18,{bank:66}); b.fwd(2).pitchTo(16,22).seg(34,{p:-44, tw:-360, ease:'lin'}).pitchTo(16,0);
    b.turn(-220,16,{bank:66}); b.level(3).cork(52,1).fwd(2).turn(40,24,{bank:25}).level(3).seg(34,{tw:360, ease:'lin'}).fwd(2);
    b.zone('brake').to(-84,g+5.5,582,0,.9).to(-84,g+3.4,598,0,.5).zone('station').to(-104,g+2.95,615.5,-90,.75).to(-122,g+2.95,615.5,-90,.5); return b.finish(); },
  // ---------------- ĐỢT 2: 3 tàu lượn phiêu lưu (đi đều qua cảnh diễn 'cruise:N', chui núi, đoạn chạy giật lùi) ----------------
  // #4 KỶ JURA TUYỆT DIỆT – ga (158, 975→937) chạy về Bắc; thung lũng ăn cỏ → hầm báo động → hang raptor → dốc xích trong núi → T-Rex → lao 75° → xoắn trên hồ → thác → hầm 2
  jura(g){ const b=trackBuilder(158,g+.8,975,180);
    b.fwd(38).mark('stop'); b.zone('cruise:5').fwd(6).turn(-90,18,{bank:8}); b.fwd(20).turn(-20,50,{bank:5}).fwd(14).turn(20,50,{bank:5}).fwd(55);
    b.turn(-90,18,{bank:8}).mark('tun1'); b.zone('cruise:7').fwd(30); b.turn(-90,16,{bank:6}).mark('cave'); b.zone('cruise:4').fwd(14);
    b.zone('lift').pitchTo(10,35).fwd(42).pitchTo(12,0).mark('trex'); b.zone('cruise:3').fwd(4); b.zone('free').pitchTo(12,-75).fwd(10).seg(30,{p:75,ease:'pull'}).mark('out');
    b.turn(90,22,{bank:62}); b.fwd(2).seg(36,{tw:360,ease:'lin'}); b.zone('cruise:11').fwd(6).mark('fall'); b.turn(-180,12,{bank:40}).mark('tun2end');
    b.zone('brake').to(158,g+.8,992,180,.6).zone('station').to(158,g+.8,975,180,.5); return b.finish(); },
  // #5 LỜI NGUYỀN HẦM MỎ DUNG NHAM – ga (−20…18, 916) chạy về Đông; núi lửa tâm (24,1010). Vào lòng núi → leo đường cụt (quái đá) → TRƯỢT LÙI 1,5 vòng xoáy → đáy lõi dung nham → phóng vọt qua miệng núi lửa
  volcano(g){ const b=trackBuilder(-20,g+.8,916,90);
    b.fwd(38).mark('stop'); b.zone('cruise:7').fwd(62).turn(-90,20,{bank:10}); b.pitchTo(10,10).fwd(14).pitchTo(10,0).mark('crys'); b.zone('cruise:6').fwd(60).mark('crysEnd'); b.zone('cruise:7').fwd(40).turn(-90,20,{bank:10});
    b.zone('lift').pitchTo(10,14).fwd(40).pitchTo(10,0); b.zone('cruise:7').fwd(57).turn(-90,20,{bank:10}).fwd(39).turn(-90,16,{bank:8}).mark('enter'); b.zone('cruise:5').fwd(34).mark('s1');
    b.zone('lift').pitchTo(8,38).fwd(20).pitchTo(8,0).cusp('golem'); b.retrace(36);
    b.zone('free').pitchTo(6,-8.1).seg(2*Math.PI*12*1.5,{y:-540,bank:-50,fb:.1,ease:'lin'}).pitchTo(6,0); b.zone('brake').fwd(20).cusp('core'); b.retrace(18);
    b.zone('cruise:6').turn(-90,10,{bank:5}).fwd(22).turn(-90,10,{bank:5}).fwd(13).turn(-90,10,{bank:5}).mark('throat');
    b.zone('launch').seg(26,{p:50,ease:'up'}).fwd(30); b.zone('free').fwd(18).seg(30,{p:-88}).mark('crater');
    b.turn(-90,30,{bank:35}).pitchTo(16,-6).fwd(6).turn(-90,24,{bank:40}); b.zone('brake').pitchTo(8,0).fwd(40).to(-20,g+.8,916,90,.8); return b.finish(); },
  // #6 ĐỀN THỜ ATLANTIS – ga (118…156, 1108) chạy về Đông; phế tích → cổng xoáy nước → đại điện đáy biển (Kraken) → leo đỉnh đền 35 m → lao xuống hồ (sóng 2 bên) → lướt mặt nước về ga
  atlantis(g){ const b=trackBuilder(118,g+.8,1108,90);
    b.fwd(38).mark('stop'); b.zone('cruise:6').fwd(7).mark('ruins').fwd(22).mark('vortex').fwd(18).mark('hall').fwd(34).mark('hallEnd');
    b.zone('lift').pitchTo(10,36).fwd(46).pitchTo(12,0); b.zone('cruise:5').fwd(3).turn(-180,21,{bank:15}); b.zone('free').pitchTo(12,-62).fwd(19).seg(30,{p:62,ease:'pull'}).mark('splash');
    b.zone('brake').fwd(60); b.zone('cruise:8').to(118,g+.8,1150,-90,.5); b.zone('station').to(97,g+.8,1129,180,.75).to(118,g+.8,1108,90,.75); return b.finish(); }
};

/* ====================== ĐỢT 2B: ĐƯỜNG XE TRONG NHÀ (nhà ma, lâu đài) – mặt bằng ghép đoạn thẳng + cung tròn, KHÔNG nghiêng ====================== */
// planTrack(x,y,z,yaw, segs, prof): segs = [{l:m} | {a:độ (+ = rẽ trái), r:m}]; prof tính theo QUÃNG ĐƯỜNG NGANG hd: ramps [{a,b,dy}] (đổi cao mượt), zones [[hd,'vùng']], marks {tên:hd}
export function planTrack(x,y,z,yawDeg,segs,prof={}){ const P=[[x,y,z]], HD=[0]; let px=x, pz=z, yaw=yawDeg*RAD, hd=0; const H=.25, ramps=prof.ramps||[], yAt=h=>{ let v=y; for(const r of ramps){ const t=Math.max(0,Math.min(1,(h-r.a)/(r.b-r.a))); v+=r.dy*t*t*(3-2*t); } return v; };
  for(const s of segs){ const len=s.l!==undefined?s.l:Math.abs(s.a)*RAD*s.r, n=Math.max(1,Math.round(len/H)), da=s.l!==undefined?0:s.a*RAD/n, st=s.l!==undefined?len/n:2*s.r*Math.sin(Math.abs(da)/2);
    for(let i=1;i<=n;i++){ yaw+=da/2; px+=Math.sin(yaw)*st; pz+=Math.cos(yaw)*st; yaw+=da/2; hd+=len/n; P.push([px,yAt(hd),pz]); HD.push(hd); } }
  const n0=P.length-1, cum=[0]; for(let i=1;i<=n0;i++) cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1],P[i][2]-P[i-1][2]));
  const sOf=h=>{ let a=0, b=n0; while(b-a>1){ const m=(a+b)>>1; if(HD[m]<=h) a=m; else b=m; } return cum[a]+(cum[b]-cum[a])*(h-HD[a])/Math.max(1e-6,HD[b]-HD[a]); };
  const Ltot=cum[n0], N=Math.round(Ltot), ds=Ltot/N, RP=[], RZ=[], zs=(prof.zones||[]).map(([h,zn])=>[sOf(h),zn]).sort((a,b)=>a[0]-b[0]); let j=0;
  for(let i=0;i<N;i++){ const s=i*ds; while(j<n0-1 && cum[j+1]<s) j++; const t=(s-cum[j])/Math.max(1e-6,cum[j+1]-cum[j]); RP.push(lin(P[j],P[j+1],1-t,t)); let zn='station'; for(const q of zs) if(s>=q[0]) zn=q[1]; RZ.push(zn); }
  const w=i=>((i%N)+N)%N, T=RP.map((_,i)=>nrm(lin(RP[w(i+1)],RP[w(i-1)],1,-1))), U=T.map(t=>nrm(lin(Y,t,1,-t[1]))), mk={}; for(const k in (prof.marks||{})) mk[k]=sOf(prof.marks[k]); let hmax=-1e9; for(const q of RP) hmax=Math.max(hmax,q[1]);
  return {N, L:Ltot, ds, P:RP, T, U, Z:RZ, marks:mk, hmax, cusps:[], gap:Math.hypot(P[n0][0]-x,P[n0][1]-y,P[n0][2]-z)}; }

// BỐ CỤC NHÀ 3 DÃY PHÒNG KÍN (toạ độ cục bộ: lx dọc nhà, lz theo chiều sâu; dãy A lz 0–16 · B 18–34 · C 36–52 · mặt tiền lz 52 · ga lz 60):
//  ga (chạy về −lx) → cửa vào mặt tiền (lx 0) → hành lang dốc (lx 0, lz 52→14) → dãy A (+lx) → quay đầu → dãy B (−lx) → quay đầu → dãy C (+lx) → cửa ra mặt tiền (lx 62) → về ga.
//  o: {ox, oz, flip (xoay 180°: ga chạy về +x, nhà nằm phía Nam ga), A/B/C: chiều dài từng phòng theo thứ tự xe đi (ΣA−ΣB+ΣC = 57, ΣA−ΣB ≥ −3),
//      ramps:[[mốc, lùi, dài, dy]], zones:[[mốc, lùi, 'vùng']], marks:{tên:[mốc, lùi]}}. Mốc có sẵn: start, stop, in, r1…rN (cửa vào phòng), gA, gB, out, end.
export function darkLayout(g,o){ const sum=a=>a.reduce((s,v)=>s+v,0), sA=sum(o.A), sB=sum(o.B), sC=sum(o.C), XEA=8+sA, XWB=XEA-sB, XEC=65, ev={start:0}, segs=[]; let hd=0, c=0;
  const L=l=>{ segs.push({l}); hd+=l; }, Arc=(a,r)=>{ segs.push({a,r}); hd+=Math.abs(a)*RAD*r; }, nA=o.A.length, nB=o.B.length;
  if(Math.abs(XWB+sC-XEC)>1e-6 || XWB<5) throw new Error('darkLayout: cần ΣA−ΣB+ΣC = 57 và ΣA−ΣB ≥ −3');
  L(38); ev.stop=hd; L(12); Arc(-90,6); L(2); ev.in=hd; L(38); Arc(-90,6); L(2); ev.r1=hd; o.A.forEach((l,i)=>{ if(i) ev['r'+(i+1)]=ev.r1+c; c+=l; });
  L(sA-8); Arc(-90,5); L(3); ev.gA=hd; L(2); ev['r'+(nA+1)]=hd; L(3); Arc(-90,5); { const h0=hd; c=0; o.B.forEach((l,i)=>{ if(i) ev['r'+(nA+1+i)]=h0+c-8; c+=l; }); }
  L(sB-16); Arc(90,5); L(3); ev.gB=hd; L(2); ev['r'+(nA+nB+1)]=hd; L(3); Arc(90,5); { const h0=hd; c=0; o.C.forEach((l,i)=>{ if(i) ev['r'+(nA+nB+1+i)]=h0+c-8; c+=l; }); }
  L(sC-16); Arc(-90,5); L(3); ev.out=hd; L(2); Arc(-90,6); ev.end=hd;
  const W=(lx,lz)=>o.flip?[o.ox-lx,o.oz-lz]:[o.ox+lx,o.oz+lz], rooms=[], box=(a,b,z0,z1,dir,zc)=>{ const p=W(a,z0), q=W(b,z1); rooms.push({i:rooms.length+1, x0:Math.min(p[0],q[0]), x1:Math.max(p[0],q[0]), z0:Math.min(p[1],q[1]), z1:Math.max(p[1],q[1]), dir:o.flip?-dir:dir, zc:W(0,zc)[1], L:b-a}); };
  c=8; for(const l of o.A){ box(c,c+l,0,16,1,8); c+=l; } c=XEA; for(const l of o.B){ box(c-l,c,18,34,-1,26); c-=l; } c=XWB; for(const l of o.C){ box(c,c+l,36,52,1,44); c+=l; }
  const marks={...ev}; for(const k in (o.marks||{})) marks[k]=ev[o.marks[k][0]]+o.marks[k][1];
  const st=W(56,60), tr=planTrack(st[0],g+1.15,st[1],o.flip?90:-90,segs,{ramps:(o.ramps||[]).map(([m,d,len,dy])=>({a:ev[m]+d, b:ev[m]+d+len, dy})), zones:(o.zones||[]).map(([m,d,z])=>[ev[m]+d,z]), marks});
  const s0=W(-6,-3), s1=W(Math.max(XEA,XEC)+3,52); return {tr, rooms, flip:!!o.flip, W, shell:{x0:Math.min(s0[0],s1[0]), x1:Math.max(s0[0],s1[0]), z0:Math.min(s0[1],s1[1]), z1:Math.max(s0[1],s1[1])}, front:W(0,52)[1], sgn:o.flip?-1:1}; }

export const DARK={
  // 🩸 #7 DINH THỰ HUYẾT NGUYỆT – 9 phòng: lên 6,8 m ở hành lang cầu thang, phòng 5 xuống hầm 3 m, phòng 8 sập sàn rơi 3,8 m
  mansion:g=>darkLayout(g,{ox:-236, oz:808, A:[22,26,22], B:[24,26,20], C:[20,15,22], ramps:[['in',4,30,6.8],['r5',3,12,-3],['r8',8.7,1.5,-3.8]],
    zones:[['stop',.5,'cruise:2.4'],['in',2,'lift'],['in',35,'cruise:1.8'],['r3',3,'cruise:1.4'],['r3',16,'cruise:1.8'],['r5',1,'cruise:1.7'],['r5',19.3,'launch'],['r5',25,'cruise:2.5'],['r7',2,'cruise:1.5'],['r8',1,'cruise:1.3'],['r8',8.6,'free'],['r9',1.5,'brake'],['r9',5,'cruise:1.4'],['r9',10,'cruise:3'],['out',1,'station']],
    marks:{s1:['r5',19], s2:['r8',8.5], s3:['r9',9.5]}}),
  // 🧪 #8 PHÒNG THÍ NGHIỆM TỬ THẦN KHU 13 – 9 phòng (8 cảnh + hành lang bảng điểm): lên 5 m, phòng 8 xuống hố trùm sâu 5 m
  asylum:g=>darkLayout(g,{ox:-124, oz:808, A:[22,24,24], B:[22,24,24], C:[19,24,14], ramps:[['in',6,26,5],['r8',2,12,-5]],
    zones:[['stop',.5,'cruise:2.4'],['in',2,'lift'],['in',34,'cruise:2'],['r1',2,'cruise:1.3'],['r2',1,'cruise:2'],['r5',1,'cruise:1.6'],['r5',16,'cruise:2.2'],['r8',1,'cruise:1.6'],['r9',1,'cruise:2.4'],['out',1,'station']],
    marks:{s1:['r1',15], s2:['r5',11], s3:['r8',16]}}),
  // 🏺 #9 LỜI NGUYỀN XÁC ƯỚP HOÀNG ĐẾ – 9 phòng: lên 6 m, phòng 6 sập sàn rơi 4 m, phòng 8 lao dốc 2 m qua khe cửa đá
  tomb:g=>darkLayout(g,{ox:-12, oz:808, A:[24,26,20], B:[22,24,24], C:[21,18,18], ramps:[['in',6,28,6],['r6',11.2,1.5,-4],['r8',4,10,-2]],
    zones:[['stop',.5,'cruise:2.4'],['in',2,'lift'],['in',35,'cruise:1.8'],['r2',1,'cruise:1.5'],['r3',1,'cruise:1.8'],['r4',1,'cruise:1.4'],['r5',1,'cruise:2.4'],['r6',1,'cruise:1.5'],['r6',11.1,'free'],['r6',15,'brake'],['r7',1,'cruise:1.5'],['r8',3,'launch'],['r9',2,'brake'],['r9',8,'cruise:2.2'],['out',1,'station']],
    marks:{s1:['r4',12], s2:['r6',11], s3:['r7',12]}}),
  // 🏰 #13 HUYỀN THOẠI XỨ SỞ THẦN TIÊN – thuyền bay trong lâu đài (ga quay mặt Bắc, lâu đài phía Nam): bay cao 9 m rồi hạ dần qua 5 cảnh lớn
  castle:g=>darkLayout(g,{ox:60, oz:1180, flip:true, A:[70], B:[36,34], C:[30,27], ramps:[['in',4,32,9],['r2',6,14,-2.5],['r4',6,14,-3],['r5',4,14,-3.5]],
    zones:[['stop',.5,'cruise:2.4'],['in',2,'lift'],['in',37,'cruise:2.6'],['r5',18,'cruise:2.2'],['out',1,'station']], marks:{}})
};
