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
  const P=[], U=[], Z=[], A=[], marks={}, DS=1;
  const outU=()=>{ if(!tw) return u.slice(); const L=cross(u,d); return nrm(lin(u,L,Math.cos(tw),Math.sin(tw))); };
  const put=()=>{ P.push(p.slice()); U.push(outU()); Z.push(zone); A.push(auto); };
  const fix=()=>{ d=nrm(d); u=nrm(lin(u,d,1,-dot(u,d))); };
  put();
  const B={
    zone(n){ zone=n; return B; }, mark(n){ marks[n]=P.length-1; return B; },
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
      const w=i=>((i%N)+N)%N, T=RP.map((_,i)=>nrm(lin(RP[w(i+1)],RP[w(i-1)],1,-1)));
      let hmax=-1e9; for(const q of RP) hmax=Math.max(hmax,q[1]);
      const bank=new Float32Array(N); for(let i=0;i<N;i++){ if(!RA[i]) continue; const kv=lin(T[w(i+2)],T[w(i-2)],1/(4*ds),-1/(4*ds)), Lh=nrm(cross(Y,T[i])), v2=Math.min(1100,Math.max(80,2*G*(hmax+2-RP[i][1])));
        bank[i]=Math.max(-1.1,Math.min(1.1,Math.atan(v2*dot(kv,Lh)/G))); }
      for(let pass=0;pass<4;pass++){ const b2=bank.slice(); for(let i=0;i<N;i++) if(RA[i]) bank[i]=(b2[w(i-3)]+b2[w(i-2)]+b2[w(i-1)]+b2[i]+b2[w(i+1)]+b2[w(i+2)]+b2[w(i+3)])/7; }
      for(let i=0;i<N;i++) if(RA[i]){ const Lh=nrm(cross(Y,T[i])), up=nrm(lin(Y,T[i],1,-T[i][1])); RU[i]=nrm(lin(up,Lh,Math.cos(bank[i]),Math.sin(bank[i]))); }
      for(let pass=0;pass<2;pass++){ const u2=RU.map(v=>v.slice()); for(let i=0;i<N;i++) RU[i]=nrm([0,1,2].map(c=>u2[w(i-1)][c]+2*u2[i][c]+u2[w(i+1)][c])); }
      for(let i=0;i<N;i++) RU[i]=nrm(lin(RU[i],T[i],1,-dot(RU[i],T[i])));
      return {N, L:Ltot, ds, P:RP, T, U:RU, Z:RZ, marks:mk, hmax}; } };
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
  else if(z==='station'){ const sv=cfg.stV||3; v=v<sv?Math.min(sv, v+3*dt):Math.max(sv, v-6*dt); }
  else { v+=(-G*ty-.12-.00038*v*v)*dt; if(v<(cfg.vmin||4)) v=cfg.vmin||4; }
  st.v=v; st.s+=v*dt; st.zone=z; return st; }

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
    b.zone('brake').to(-84,g+5.5,582,0,.9).to(-84,g+3.4,598,0,.5).zone('station').to(-104,g+2.95,615.5,-90,.75).to(-122,g+2.95,615.5,-90,.5); return b.finish(); }
};
