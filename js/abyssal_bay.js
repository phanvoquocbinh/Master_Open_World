// QC World V2 – Đảo Abyssal · VỊNH THÔNG BIỂN (phiên A · abyss-core, 17/11/2026 – phương án B: eo biển hướng Nam)
//  • bayModel(): hàm cao độ dùng chung cho EXTL / lưới địa hình (đáy biển, bãi cát vàng, kè + vỉa hè +16, đường vành đai leo dốc, đảo khách sạn +14, eo biển −12).
//  • buildBay(K): dựng lưới vịnh liền khối (toạ độ cực ρ–φ, không ghép khối), tường kè đá Travertine + lan can con tiện + đèn cột, vỉa hè lát đá,
//    tường chắn đường dốc, đường vành đai 2 làn (vạch đôi vàng, bó vỉa), Cầu Vòm Cửa Vịnh (+16, tĩnh không ≥ 15,5 m), eo biển + vách đá, cầu dẫn G2 (+4),
//    4 cầu thang gỗ xuống bãi cát. Mọi mép cao đều có lan can va chạm (addSeg) kèm lý do.
// Elip vực: tâm (0, CZ), bán trục A × BZ; ρ = hypot(x/A, (z−CZ)/BZ); φ (độ) = atan2((z−CZ)/BZ, x/A).
export function bayModel(c){
  const {A, BZ, CZ, hOut} = c, D = Math.PI/180, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  const R = {T:.755, B:.8995, P:.957, C:.988, O:1.0623}, YP = 16, YT = 28, GX = 38, ZG = 78, WY = -.35;
  const re=(x,z)=>Math.hypot(x/A,(z-CZ)/BZ), el=(f,r)=>[A*r*Math.cos(f), CZ+BZ*r*Math.sin(f)], phiD=(x,z)=>Math.atan2((z-CZ)/BZ,x/A)/D;
  const nrm=f=>{ while(f>180) f-=360; while(f<=-180) f+=360; return f; };
  const isN=f=>f>-171 && f<-9, toE=f=>(f>90 || f<=-171) ? nrm(180-f) : f;   /* nửa Tây soi gương về nửa Đông */
  const zB = CZ+BZ*R.C*Math.sqrt(1-Math.pow(GX/(A*R.C),2)), PHB = phiD(GX,zB), PH0 = -3;   /* đầu cầu vòm / đầu dốc trên đỉnh */
  const NS=400, S=[0]; for(let i=1;i<=NS;i++){ const f0=(PH0+(PHB-PH0)*(i-1)/NS)*D, f1=(PH0+(PHB-PH0)*i/NS)*D, p=el(f0,R.C), q=el(f1,R.C); S.push(S[i-1]+Math.hypot(q[0]-p[0],q[1]-p[1])); }
  const LT = S[NS], grade = (YT-YP)/LT;
  const roadYE=fE=>{ if(fE<=PH0) return YT; if(fE>=PHB) return YP; const t=(fE-PH0)/(PHB-PH0)*NS, i=Math.min(NS-1,Math.floor(t)), s=S[i]+(S[i+1]-S[i])*(t-i); return YT-(YT-YP)*s/LT; };
  const roadY=f=>roadYE(toE(f));
  const flareX=z=>z<=150 ? -GX : -GX-32*Math.pow(clamp((z-150)/29.4,0,1),1.6);   /* cửa eo loe về Tây (x −70 ở mép đảo) – tránh cầu G2 */
  const inStrait=(x,z,zmax=181)=>z>ZG && z<zmax && x<GX && x>flareX(z);
  // trước 2 cánh nhà: đỉnh bãi = mép trước tầng 8 (+2,3), chân bãi cách 20 m; trước tháp Hydro-Pulse là sân +2,3 tới z −110
  function yN(x,z){ const cx=x<0?-8.1:8.1, d=Math.hypot(x-cx,z+4.8); let y=d>=120.2?2.27:d>100?-.5+2.77*(d-100)/20.2:-.5-11.5*ss(100,75,d);
    const w=1-ss(18,30,Math.abs(x)); if(w>0){ const yt=z<=-110?2.27:z<=-90?-.5+2.77*(-90-z)/20:-.5-11.5*ss(-90,-65,z); y=Math.max(y,lerp(y,yt,w)); } return y; }
  function y(x,z){ if(Math.hypot(x,z+12)<58) return 14;   /* đảo khách sạn trung tâm */
    if(Math.abs(x)<GX && z>55) return -12;                   /* lòng eo biển */
    const r=re(x,z), f=phiD(x,z); if(isN(f)) return yN(x,z);
    if(r<R.T) return -.5-11.5*ss(R.T,R.T-.2,r); if(r<R.B) return -.5+3*(r-R.T)/(R.B-R.T); if(r<R.P) return YP;
    const ry=roadY(f); if(r<1.012) return ry; const ho=hOut(x,z); if(ho==null || ho<=ry) return ry;
    return lerp(ry,ho,ss(1.012,R.O,r)*(1-ss(1.5,3,ho-ry))); }
  return {R, YP, YT, GX, ZG, WY, zB, PHB, PH0, LT, grade, re, el, phiD, nrm, isN, toE, roadY, roadYE, flareX, inStrait, yN, y, ss, lerp, clamp};
}

export function buildBay(K){
  const {THREE, grp, dyn, M, LUX, B, FB, RB, UP, rail, fence, addPlat, addSeg, plats, circles, makeLabel, hAt} = K;
  const {R, re, el, phiD, isN, roadY, y:BY, zB, GX, ZG, flareX, ss} = B, D=Math.PI/180, TAU=Math.PI*2, out={roads:[], ramps:[], stairs:[]};
  const LX = LUX && LUX.mk ? LUX : null, mk=(tok,o,fb)=>{ try{ return LX ? LX.mk(tok,o) : fb; }catch(e){ return fb; } }, std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.8, ...o});
  const MT = { trav: mk('TRAVERTINE_WARM',{},std(0xd1b894)), sand: mk('SANDSTONE_TRIM',{},std(0xbda070)), cob: mk('GRANITE_PROMENADE',{color:0x8a7a6a},std(0x8a7a6a)), gold: mk('GOLD_CHAMPAGNE',{},std(0xd4af37,{metalness:.88, roughness:.25})),
    bronze: mk('TITANIUM_BRONZE',{},std(0x22262e,{metalness:.82, roughness:.32})), teak: mk('TEAK_DECK',{},std(0x7a4a26)), glow: mk('WARM_GLOW',{},new THREE.MeshBasicMaterial({color:0xffcf70})), kerb: std(0x55504a,{roughness:.7}),
    rock: M.cliff || M.rock, seabed: std(0x48584f,{roughness:1}), ground: new THREE.MeshStandardMaterial({vertexColors:true, roughness:.95}) };
  MT.cob.polygonOffset=true; MT.cob.polygonOffsetFactor=-1; MT.cob.polygonOffsetUnits=-2;
  const inwardN=(x,z)=>{ const gx=-x/(K.A*K.A), gz=-(z-K.CZ)/(K.BZ*K.BZ), l=Math.hypot(gx,gz)||1; return [gx/l,0,gz/l]; };
  const STAIR_F=[16,47,133,164];   /* φ (độ) đầu 4 cầu thang gỗ xuống bãi cát (đi theo chiều φ tăng / giảm ra xa đầu cầu vòm) */

  /* ---------- 1. LƯỚI VỊNH LIỀN KHỐI (đáy biển → cát ướt → cát vàng → nền đường/tường chắn) ---------- */
  { const RS=[.38,.45,.52,.58,.63,.67,.70,.72,.735,.745,.755,.765,.78,.80,.82,.84,.86,.875,.89,R.B,R.P,.961,.985,1.012,1.03,1.045,R.O], NC=480, NR=RS.length, pos=[], col=[], idx=[], c=new THREE.Color(), cs=new THREE.Color(0x2f4f4c);
    for(let i=0;i<=NC;i++){ const f=(-180+360*i/NC)*D; for(let j=0;j<NR;j++){ const [x,z]=el(f,RS[j]), y=Math.hypot(x,z+12)<58.6?-12:BY(x,z), n=.93+.07*Math.sin(x*.21+z*.17);
        if(y<-1.2) c.set(0x7a6c4e).lerp(cs,Math.min(1,(-y-1.2)/7)); else if(y<.08) c.set(0xbfa473); else if(y<2.7) c.set(0xebd5a7); else c.set(0x6d6558); c.multiplyScalar(n); pos.push(x,y,z); col.push(c.r,c.g,c.b); } }
    for(let i=0;i<NC;i++){ const fm=(-180+360*(i+.5)/NC); for(let j=0;j<NR-1;j++){ const [x,z]=el(fm*D,(RS[j]+RS[j+1])/2); if(Math.abs(x)<GX && z>ZG) continue; if(j===NR-1-7 && !isN(fm)) continue;   /* khe vỉa hè (lưới riêng lát đá) */
        if(RS[j+1]<=.45 && Math.hypot(x,z+12)<52) continue; const a=i*NR+j, b=a+NR; idx.push(a,b+1,a+1, a,b,b+1); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals(); const m=new THREE.Mesh(g,MT.ground); m.receiveShadow=true; m.name='abyssal-bay-ground'; grp.add(m); }

  /* ---------- 1b. ĐẢO KHÁCH SẠN TRUNG TÂM +14 (kè Travertine; khách sạn của phiên C đặt trong lõi r ≤ 38) ---------- */
  { const wall=new THREE.Mesh(new THREE.CylinderGeometry(58,58.6,26.5,120,1,true),mk('TRAVERTINE_WARM',{repeat:[46,6]},MT.trav)); wall.position.set(0,.75,-12); wall.receiveShadow=true; wall.name='abyssal-hotel-island-wall'; grp.add(wall);
    const top=new THREE.Mesh(new THREE.CircleGeometry(58.05,120),mk('TRAVERTINE_WARM',{repeat:[14,14]},MT.trav)); top.rotation.x=-Math.PI/2; top.position.set(0,14,-12); top.receiveShadow=true; top.name='abyssal-hotel-island-top'; grp.add(top);
    const cap=new THREE.Mesh(new THREE.RingGeometry(57.2,58.35,120),MT.sand); cap.rotation.x=-Math.PI/2; cap.position.set(0,14.03,-12); grp.add(cap);
    const run=[]; for(let i=0;i<=96;i++){ const a=i/96*TAU; run.push([Math.cos(a)*57.6, -12+Math.sin(a)*57.6]); } fence(run,14,'🌊 Lan can mép đảo khách sạn – sang bờ bằng cầu dẫn');
    out.island={x:0, z:-12, r:58, y:14}; }

  /* ---------- 2. TƯỜNG KÈ + VỈA HÈ LÁT ĐÁ +16 + TƯỜNG CHẮN ĐƯỜNG DỐC + TƯỜNG CHẮN NGOÀI ---------- */
  const NF=720, cols=[]; for(let i=0;i<NF;i++){ const f0=-180+360*i/NF, f1=f0+360/NF, fm=(f0+f1)/2, pm=el(fm*D,.93); if(isN(fm) || (Math.abs(pm[0])<GX+.2 && pm[1]>ZG)) continue; cols.push([f0,f1]); }
  const SPAN=12.6, stTop=f=>STAIR_F.some(s=>s<90 ? (f>s-.9 && f<s+.2) : (f>s-.2 && f<s+.9)), stAll=f=>STAIR_F.some(s=>s<90 ? (f>s-SPAN && f<s+.4) : (f>s-.4 && f<s+SPAN));
  { const TW=FB(), SD=FB(), PC=FB(), BAL=[], LAMP=[]; let lampAcc=0;
    for(const [f0,f1] of cols){ const a0=el(f0*D,R.B), a1=el(f1*D,R.B), b0=el(f0*D,R.P), b1=el(f1*D,R.P), nI=inwardN((a0[0]+a1[0])/2,(a0[1]+a1[1])/2), nO=[-nI[0],0,-nI[2]], L=Math.hypot(a1[0]-a0[0],a1[1]-a0[1]);
      TW.f([a0[0],2.2,a0[1]],[a1[0],2.2,a1[1]],[a1[0],16,a1[1]],[a0[0],16,a0[1]],nI,a0[0]/4+a0[1]/4,a1[0]/4+a1[1]/4,2.2/4,4);   /* tường kè Travertine */
      const c0=el(f0*D,R.B-.004), c1=el(f1*D,R.B-.004), d0=el(f0*D,R.B+.006), d1=el(f1*D,R.B+.006);   /* gờ đá Sa thạch đỉnh kè */
      SD.f([c0[0],16.03,c0[1]],[c1[0],16.03,c1[1]],[d1[0],16.03,d1[1]],[d0[0],16.03,d0[1]],UP); SD.f([c0[0],15.75,c0[1]],[c1[0],15.75,c1[1]],[c1[0],16.03,c1[1]],[c0[0],16.03,c0[1]],nI);
      PC.f([a0[0],16,a0[1]],[a1[0],16,a1[1]],[b1[0],16,b1[1]],[b0[0],16,b0[1]],UP,a0[0]/3,a1[0]/3,a0[1]/3,b0[1]/3);   /* vỉa hè lát đá granite */
      const ry0=roadY(f0), ry1=roadY(f1); if(Math.max(ry0,ry1)>16.02){ const top0=ry0>16.5?ry0+.9:ry0, top1=ry1>16.5?ry1+.9:ry1; TW.f([b0[0],16,b0[1]],[b1[0],16,b1[1]],[b1[0],top1,b1[1]],[b0[0],top0,b0[1]],nI,b0[0]/4,b1[0]/4,4,top0/4);
        if(ry0>16.5||ry1>16.5){ SD.f([b0[0],top0,b0[1]],[b1[0],top1,b1[1]],[b1[0]+nO[0]*.35,top1,b1[1]+nO[2]*.35],[b0[0]+nO[0]*.35,top0,b0[1]+nO[2]*.35],UP); SD.f([b0[0]+nO[0]*.35,top0-.9,b0[1]+nO[2]*.35],[b1[0]+nO[0]*.35,top1-.9,b1[1]+nO[2]*.35],[b1[0]+nO[0]*.35,top1,b1[1]+nO[2]*.35],[b0[0]+nO[0]*.35,top0,b0[1]+nO[2]*.35],nO); }
        if(ry0>16.4||ry1>16.4){ const p0=el(f0*D,R.P+.0015), p1=el(f1*D,R.P+.0015); addSeg(p0[0],p0[1],p1[0],p1[1],.18,15,Math.max(ry0,ry1)+2.2,'🛣️ Tường chắn đường dốc vành đai – đi bộ trên vỉa hè'); } }
      /* tường chắn ngoài (đường cao hơn đất ngoài vực ở phía Nam) */ { const o0=el(f0*D,R.O), o1=el(f1*D,R.O), h0=K.hOut(o0[0],o0[1]), h1=K.hOut(o1[0],o1[1]), y0=BY(...el(f0*D,R.O-.0005)), y1=BY(...el(f1*D,R.O-.0005));
        if(h0!=null && h1!=null && (y0>h0+.05 || y1>h1+.05)){ TW.f([o0[0],Math.min(h0,y0)-.4,o0[1]],[o1[0],Math.min(h1,y1)-.4,o1[1]],[o1[0],y1+.9,o1[1]],[o0[0],y0+.9,o0[1]],nO,o0[0]/4,o1[0]/4,0,(y0+.9)/4);
          if(y0-h0>1.2 || y1-h1>1.2){ const q0=el(f0*D,R.O-.004), q1=el(f1*D,R.O-.004); addSeg(q0[0],q0[1],q1[0],q1[1],.18,Math.min(h0,h1)-1.5,Math.max(y0,y1)+2.2,`🚧 Mép tường chắn – bên dưới cao ${Math.round(Math.max(y0-h0,y1-h1))} m`); } } }
      /* lan can con tiện đá + va chạm mép kè (hở đầu cầu thang) */ const fm=(f0+f1)/2, gap=stTop(fm);
      if(!gap){ const n=Math.max(1,Math.round(L/.42)); for(let k=0;k<n;k++){ const t=(k+.5)/n, p=el((f0+(f1-f0)*t)*D,R.B+.003); BAL.push([p[0],p[1]]); } const p0=el(f0*D,R.B+.004), p1=el(f1*D,R.B+.004); addSeg(p0[0],p0[1],p1[0],p1[1],.16,14.8,18.2,'🌊 Lan can đá kè biển – xuống bãi cát bằng cầu thang gỗ'); }
      { const inS=stAll(fm), p0=el(f0*D,inS?R.B-.0007:R.B-.0035), p1=el(f1*D,inS?R.B-.0007:R.B-.0035); if(!stTop(fm)) addSeg(p0[0],p0[1],p1[0],p1[1],.12,-1.5,inS?15.2:6,'🧱 Tường kè 13,5 m – lên vỉa hè bằng cầu thang gỗ'); }   /* EXTL vỉa hè +16 ngay sau mép kè: chặn để không bị 'nhấc' lên */
      lampAcc+=Math.hypot(b1[0]-b0[0],b1[1]-b0[1]); if(lampAcc>=12){ lampAcc=0; const p=el(fm*D,R.P-.009); LAMP.push(p); circles.push({x:p[0], z:p[1], r:.28, y0:15, y1:20}); } }
    for(const [q,mat,nm] of [[TW,MT.trav,'abyssal-seawall'],[SD,MT.sand,'abyssal-seawall-cap'],[PC,MT.cob,'abyssal-promenade']]) q.mesh(mat,nm);
    /* tay vịn đá trên đầu con tiện (dải liền) */ { const HR=FB(); for(const [f0,f1] of cols){ const fm=(f0+f1)/2; if(stTop(fm)) continue; const a0=el(f0*D,R.B-.0005), a1=el(f1*D,R.B-.0005), b0=el(f0*D,R.B+.0065), b1=el(f1*D,R.B+.0065); HR.f([a0[0],16.95,a0[1]],[a1[0],16.95,a1[1]],[b1[0],16.95,b1[1]],[b0[0],16.95,b0[1]],UP); HR.f([a0[0],16.82,a0[1]],[a1[0],16.82,a1[1]],[a1[0],16.95,a1[1]],[a0[0],16.95,a0[1]],inwardN(a0[0],a0[1])); } HR.mesh(MT.sand,'abyssal-balustrade-rail'); }
    { const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.065,.09,.8,6),MT.sand,BAL.length), m=new THREE.Matrix4(); BAL.forEach(([x,z],i)=>{ m.makeTranslation(x,16.42,z); im.setMatrixAt(i,m); }); im.userData.dynamic=true; im.name='abyssal-balusters'; grp.add(im); }
    { const n=LAMP.length, post=new THREE.InstancedMesh(new THREE.CylinderGeometry(.08,.13,3.6,8),MT.bronze,n), arm=new THREE.InstancedMesh(new THREE.BoxGeometry(1.2,.07,.07),MT.bronze,n), glb=new THREE.InstancedMesh(new THREE.SphereGeometry(.2,10,8),MT.glow,n*2), m=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), v=new THREE.Vector3(), s=new THREE.Vector3(1,1,1);
      LAMP.forEach(([x,z],i)=>{ const n2=inwardN(x,z), ry=Math.atan2(n2[0],n2[2]); m.makeTranslation(x,17.8,z); post.setMatrixAt(i,m); q.setFromEuler(e.set(0,ry,0)); m.compose(v.set(x,19.45,z),q,s); arm.setMatrixAt(i,m); const tx=Math.cos(ry), tz=-Math.sin(ry); for(const k of [0,1]){ m.makeTranslation(x+tx*(k?.55:-.55),19.3,z+tz*(k?.55:-.55)); glb.setMatrixAt(i*2+k,m); } });
      for(const im of [post,arm,glb]){ im.userData.dynamic=true; im.castShadow=false; grp.add(im); } } }

  /* vòng nước sâu (sâu > 0,9 m): người đi bộ dừng lại – tắm sát bờ */
  { let prev=null; for(let i=0;i<=720;i++){ const f=(-180+i*.5)*D; let p=null; for(let r=.9; r>.5; r-=.002){ const q=el(f,r); if(Math.abs(q[0])<GX+1 && q[1]>55){ p=null; break; } if(BY(q[0],q[1])<-.9){ p=q; break; } }
      if(p && prev && Math.hypot(p[0]-prev[0],p[1]-prev[1])<5) addSeg(prev[0],prev[1],p[0],p[1],.2,-4,1.4,'🌊 Nước sâu – chỉ tắm sát bờ (du thuyền / mô tô nước ở bến)'); prev=p; } }

  /* ---------- 3. TƯỜNG CHẮN 2 ĐẦU KÈ (giáp cánh nhà phía Bắc) ---------- */
  { const TW=FB(); for(const fb of [-9,-171]){ const sg=fb===-9?-1:1, RS=[.80,.84,.88,R.B,R.P,1.0,R.O]; for(let j=0;j<RS.length-1;j++){ const p0=el(fb*D,RS[j]), p1=el(fb*D,RS[j+1]), q0=el((fb+sg*.05)*D,RS[j]), q1=el((fb+sg*.05)*D,RS[j+1]);
      const yA0=BY(...p0), yA1=BY(...p1), yB0=B.yN(...q0), yB1=B.yN(...q1), n=[q0[0]-p0[0],0,q0[1]-p0[1]], nl=Math.hypot(n[0],n[2]); TW.f([q0[0],Math.min(yA0,yB0)-.3,q0[1]],[q1[0],Math.min(yA1,yB1)-.3,q1[1]],[q1[0],Math.max(yA1,yB1)+(RS[j]>=R.P?.9:0),q1[1]],[q0[0],Math.max(yA0,yB0)+(RS[j]>=R.P?.9:0),q0[1]],[n[0]/nl,0,n[2]/nl],0,1,0,3); }
      const a=el((fb-sg*.08)*D,R.B), b=el((fb-sg*.08)*D,R.P), c2=el((fb-sg*.08)*D,R.O); fence([a,b],16,'🧱 Cuối vỉa hè – vào toà nhà bằng thang máy kính bên cạnh'); { const a2=el((fb-sg*.08)*D,R.B-.001); addSeg(a2[0],a2[1],c2[0],c2[1],.2,-1.5,14.8,'🧱 Tường chắn cuối kè'); } addSeg(b[0],b[1],c2[0],c2[1],.2,26.8,30.2,'🚧 Mép tường chắn – bên dưới là toà nhà'); }
    TW.mesh(MT.trav,'abyssal-end-walls'); }

  /* ---------- 4. EO BIỂN: đáy −12 + vách đá 2 bờ + lan can mép bờ ---------- */
  { const SB=FB(), RK=FB(); for(let z=ZG; z<186-1e-6; z+=2){ const z1=Math.min(186,z+2), xa=flareX(Math.min(z,179.4)), xb=flareX(Math.min(z1,179.4)); SB.f([xa,-12,z],[GX,-12,z],[GX,-12,z1],[xb,-12,z1],UP,0,4,0,1); }
    const bank=[]; for(let z=ZG; z<=179.4+1e-6; z+=2) bank.push(z); if(bank[bank.length-1]<179.4) bank.push(179.4);
    for(let k=0;k<bank.length-1;k++){ const z0=bank[k], z1=bank[k+1]; for(const side of [1,-1]){ const x0=side>0?GX:flareX(z0), x1=side>0?GX:flareX(z1), t0=hAt(x0+side*.35,z0)??2, t1=hAt(x1+side*.35,z1)??2; RK.f([x0,-12.2,z0],[x1,-12.2,z1],[x1,t1+.05,z1],[x0,t0+.05,z0],[-side,0,0],z0/9,z1/9,-12/9,t0/9); } }
    SB.mesh(MT.seabed,'abyssal-strait-bed'); RK.mesh(MT.rock,'abyssal-strait-walls');
    const skipZ=(z,side)=>(z>zB-7 && z<zB+6) || (side>0 && z>168.5) || (side<0 && z>122.5 && z<129.5);   /* hở: cầu vòm, cầu dẫn G2, lối ra bến du thuyền */
    for(const side of [1,-1]) for(let k=0;k<bank.length-1;k++){ const z0=bank[k], z1=bank[k+1], zm=(z0+z1)/2; if(skipZ(zm,side)) continue; const x0=(side>0?GX:flareX(z0))+side*.5, x1=(side>0?GX:flareX(z1))+side*.5, y=hAt(x0+side*.3,zm)??2; fence([[x0,z0],[x1,z1]],y,'🌊 Mép eo biển – du thuyền qua lại bên dưới'); }
    makeLabel('🌊 Eo biển Cửa Nam','Lối du thuyền ra biển Tây Nam · tĩnh không cầu 15,5 m',{h:.5, x:-20, y:6, z:150, fade:120}); }

  /* ---------- 5. ĐƯỜNG VÀNH ĐAI 2 LÀN (vạch đôi vàng, bó vỉa granite) + CẦU VÒM CỬA VỊNH ---------- */
  const KB=FB();
  function roadDY(pts, w, yf, o={}){ let v=0; for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], L=Math.hypot(bx-ax,bz-az); if(L<.01) continue; const n=Math.max(1,Math.ceil(L/1.5)), tx=(bx-ax)/L, tz=(bz-az)/L, nx=tz, nz=-tx;
      for(let k=0;k<n;k++){ const s0=L*k/n, s1=L*(k+1)/n, Q=(s,off,dy=0)=>{ const x=ax+tx*s+nx*off, z=az+tz*s+nz*off; return [x,yf(x,z)+dy,z]; };
        RB.a.f(Q(s0,-w/2),Q(s1,-w/2),Q(s1,w/2),Q(s0,w/2),UP,(v+s0)*.2,(v+s1)*.2,0,w*.2);
        for(const e of [-1,1]){ const off=e*(w/2-.35); RB.w.f(Q(s0,off-.07,.012),Q(s1,off-.07,.012),Q(s1,off+.07,.012),Q(s0,off+.07,.012),UP); }
        for(const off of [-.14,.14]) RB.y.f(Q(s0,off-.055,.012),Q(s1,off-.055,.012),Q(s1,off+.055,.012),Q(s0,off+.055,.012),UP);   /* vạch đôi vàng liền */
        if(o.kerb) for(const e of [-1,1]){ const i0=e*w/2, i1=e*(w/2+.3); KB.f(Q(s0,i0,.18),Q(s1,i0,.18),Q(s1,i1,.18),Q(s0,i1,.18),UP); KB.f(Q(s0,i0,0),Q(s1,i0,0),Q(s1,i0,.18),Q(s0,i0,.18),[-nx*e,0,-nz*e]); const c=Q((s0+s1)/2,e*(w/2+.15),.18); addPlat(c[0],c[2],Math.atan2(tx,tz),.16,(s1-s0)/2+.02,c[1]); } }   /* mặt bó vỉa đi lên được (không lún chân 18 cm) */
      v+=L; } }
  const RC=R.C, yLand=(x,z)=>(Math.abs(x)<GX+.01 && z>ZG) ? 16.03 : (hAt(x,z)??16)+.03;
  const sidePts=e=>{ const p=[el(-5*D,1.105),el(-5*D,1.07),el(-4.7*D,1.035),el(-4*D,1.006)]; for(let f=-3; f<B.PHB-1.2; f+=1) p.push(el(f*D,RC)); p.push([GX,zB]); return p.map(([x,z])=>[x*e,z]); };
  const ringE=sidePts(1), ringW=sidePts(-1).reverse(), ring=[...ringE, ...ringW];
  roadDY(ring,7,yLand,{kerb:true});
  { const R3=v=>Math.round(v*100)/100; out.ramps.push({name:'Đường vành đai vịnh + Cầu Vòm (dốc Canyon Ramps Đông/Tây ≤ 7,5 %)', w:7, vmax:8, pts:ring.map(([x,z])=>[R3(x),R3(z),R3(yLand(x,z))])}); }
  out.ring=ring; out.junction=f=>el(f*D,RC);
  makeLabel('🛣️ Đường vành đai vịnh','2 làn · dốc ' + (B.grade*100).toFixed(1) + ' % lên đỉnh núi +28 · cầu vòm +16',{h:.45, x:el(30*D,RC)[0], y:roadY(30)+4, z:el(30*D,RC)[1], fade:90});
  /* Cầu Vòm Cửa Vịnh: mặt cầu x −38…38, hè đi bộ phía Bắc 3 m, 2 vòm thép mạ vàng nhịp 62 m cao 15 m, cáp treo, đèn LED ấm dưới mép */
  { const zc=zB-.5, z0=zB-6.5, z1=zB+5.5; K.box(2*GX,.6,12,MT.bronze,0,15.7,zc); addPlat(0,zc,Math.PI/2,6,GX,16.0);
    const SW=FB(); SW.f([-GX,16.03,z0],[GX,16.03,z0],[GX,16.03,zB-3.5],[-GX,16.03,zB-3.5],UP,-GX/3,GX/3,z0/3,(zB-3.5)/3); SW.f([-GX,16.03,zB+3.5],[GX,16.03,zB+3.5],[GX,16.03,z1],[-GX,16.03,z1],UP,-GX/3,GX/3,0,.6); SW.mesh(MT.trav,'abyssal-bridge-walk');
    for(const zz of [z0+.12,z1-.12]) fence([[-GX,zz],[GX,zz]],16,'🌉 Lan can Cầu Vòm – bên dưới là eo biển 16 m');
    for(const zz of [z0+.05,z1-.05]) K.box(2*GX,.08,.12,MT.glow,0,15.36,zz);
    const H=[], m4=new THREE.Matrix4(); for(const za of [z0-.45,z1+.45]){ const pts=[]; for(let i=0;i<=40;i++){ const x=-31+62*i/40; pts.push(new THREE.Vector3(x,16+15*(1-(x/31)*(x/31)),za)); } const tb=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,.5,10,false),MT.gold); tb.castShadow=true; grp.add(tb);
      for(const e of [-1,1]){ K.box(2.4,1.6,1.8,MT.bronze,e*31,15.9,za); circles.push({x:e*31, z:za, r:1.3, y0:14, y1:19}); } for(let x=-26; x<=26; x+=4.33){ const yt=16+15*(1-(x/31)*(x/31)); H.push([x,(16+yt)/2,za,yt-16]); } }
    { const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.05,.05,1,6),MT.gold,H.length); H.forEach(([x,y,z,h],i)=>{ m4.makeScale(1,h,1).setPosition(x,y,z); im.setMatrixAt(i,m4); }); im.userData.dynamic=true; grp.add(im); }
    for(const x of [-12,-6,0,6,12]){ const yt=16+15*(1-(x/31)*(x/31)); const br=K.box(.32,.32,z1-z0+.9,MT.gold,x,yt,zc); br.castShadow=false; }
    makeLabel('🌉 Cầu Vòm Cửa Vịnh','Nhịp 76 m · vòm đôi vàng champagne · tĩnh không 15,5 m cho du thuyền',{h:.6, x:0, y:33, z:zc, fade:220}); }

  /* ---------- 6. CẦU DẪN G2 (+4): cổng G2 (0, 180) → bờ Đông eo, nối vành đai ngoài ---------- */
  { K.box(43.2,.55,8,M.conc,17,3.725,174); K.box(12.4,.55,2,M.conc,0,3.725,179); addPlat(17,174,Math.PI/2,4,21.6,4.0); addPlat(0,179,0,6.2,1,4.0);
    for(const x of [7,17,27]) K.cyl(.7,.7,15.5,M.conc,x,-4.3,174,12); K.cyl(.7,.7,15.5,M.conc,-1,-4.3,175,12);
    roadDY([[0,180],[0,176.2],[2.6,174],[39.2,174]],8,()=>4.03);
    fence([[-4.6,170.1],[38,170.1]],4,'🌉 Lan can cầu dẫn G2 – tàu cao đi cửa Tây của eo'); fence([[-4.5,170.1],[-4.5,177.9],[-6.1,177.9],[-6.1,180]],4,'🌉 Lan can cầu dẫn G2'); fence([[6.1,180],[6.1,177.9],[38,177.9]],4,'🌉 Lan can cầu dẫn G2');
    out.roads.push([0,180,0,174],[0,174,39,174]); }

  /* ---------- 7. 4 CẦU THANG GỖ TEAK + SA THẠCH TỪ VỈA HÈ +16 XUỐNG BÃI CÁT (dọc mặt tường kè, LED âm bậc, tay vịn đồng) ---------- */
  { const ST=[], LED=[], ro=R.B-.0105, rr=R.B-.0205, NSTEP=80, RISE=(16-2.45)/NSTEP;
    for(const fs of STAIR_F){ const dir=fs<90?1:-1;   /* đi về phía xa cầu vòm: Đông đi φ giảm? – chọn đi theo chiều ngược đầu cầu */ const sg=fs<90?-1:1; let f=fs, prev=el(fs*D,ro); const seg=[];
      for(let k=0;k<NSTEP;k++){ let p, ff=f; do{ ff+=sg*.02; p=el(ff*D,ro); } while(Math.hypot(p[0]-prev[0],p[1]-prev[1])<.32); const mx=(p[0]+prev[0])/2, mz=(p[1]+prev[1])/2, y=16-RISE*(k+1), ry=Math.atan2(p[0]-prev[0],p[1]-prev[1]);
        const wn=inwardN(mx,mz), wx=mx-wn[0]*.22, wz=mz-wn[2]*.22; ST.push([wx,y,wz,ry]); addPlat(wx,wz,ry,1.62,.17,y);   /* bậc phủ sát mặt kè (không còn khe 20 cm rơi xuống) */ if(k%3===0) LED.push([mx,y,mz,ry]); seg.push([el(ff*D,rr),y]); prev=p; f=ff; }
      out.stairs.push({top:el(fs*D,ro), bottom:prev, f0:fs, f1:f});
      for(let k=0;k<seg.length-3;k+=3){ const [a,y]=seg[k], [b]=seg[k+3]; addSeg(a[0],a[1],b[0],b[1],.14,y-1.4,y+2.2,'🪵 Tay vịn cầu thang gỗ'); }
      const e0=el((fs-sg*.25)*D,R.B), e1=el((fs-sg*.25)*D,rr); fence([e0,e1],16,'🪵 Đầu cầu thang gỗ'); }
    const im=new THREE.InstancedMesh(new THREE.BoxGeometry(3.06,RISE+.06,.34),MT.teak,ST.length), lm=new THREE.InstancedMesh(new THREE.BoxGeometry(2.3,.03,.04),MT.glow,LED.length), m=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), v=new THREE.Vector3(), s=new THREE.Vector3(1,1,1);
    ST.forEach(([x,y,z,ry],i)=>{ q.setFromEuler(e.set(0,ry+Math.PI/2,0)); m.compose(v.set(x,y-RISE/2,z),q,s); im.setMatrixAt(i,m); }); LED.forEach(([x,y,z,ry],i)=>{ q.setFromEuler(e.set(0,ry+Math.PI/2,0)); m.compose(v.set(x,y-RISE-.02,z),q,s); lm.setMatrixAt(i,m); });
    for(const o of [im,lm]){ o.userData.dynamic=true; o.receiveShadow=true; grp.add(o); }
    { const SW=FB(); for(const st of out.stairs){ /* má thang Sa thạch phía biển (liền khối từ cát lên vỉa hè) */ const sg=st.f0<90?-1:1; for(let f=st.f0; sg<0?f>st.f1:f<st.f1; f+=sg*.6){ const f2=sg<0?Math.max(st.f1,f-.6):Math.min(st.f1,f+.6), a=el(f*D,rr-.002), b=el(f2*D,rr-.002), ya=16-(Math.abs(f-st.f0)/Math.abs(st.f1-st.f0))*13.55, yb=16-(Math.abs(f2-st.f0)/Math.abs(st.f1-st.f0))*13.55; SW.f([a[0],2.2,a[1]],[b[0],2.2,b[1]],[b[0],yb+.25,b[1]],[a[0],ya+.25,a[1]],inwardN(a[0],a[1]),0,1,0,1); } } SW.mesh(MT.sand,'abyssal-stair-cheeks'); } }
  KB.mesh(MT.kerb,'abyssal-kerbs');
  out.MT=MT; out.roadDY=roadDY; return out;
}
