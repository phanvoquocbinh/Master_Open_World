// QC World V2 – Đảo Abyssal · phiên D (abyss-towers), 20/11/2026 – DUPLEX PENTHOUSE 2 TẦNG THÔNG TẦNG (đặc tả Bình "Penthouse Interior Redesign")
//  Mỗi toà 1 căn ở đầu hồi, ngang ≈ 26 m (2 gian cũ), sâu 13 m trong nhà (xây lùi thêm 3 m vào khe sau nhà – vách núi còn cách ≥ 4 m) + ban công 2–3,2 m:
//   • Học viện "Duplex Giám đốc Học viện": tầng 10 + 11, đầu hồi gần tháp Hydro-Pulse.  • Residences "Duplex Penthouse Abyssal Horizon": tầng 13 + 14, đầu hồi xa.
//  TẦNG DƯỚI: phòng khách THÔNG TẦNG 8,7 m (vách TV ốp Travertine + lam gỗ óc chó, lò sưởi lửa ấm, TV, sofa chữ L có tay/nệm/gối, 2 armchair, bàn trà
//   marble, thảm, đèn chùm thả 4 m) · bàn ăn 8 ghế · bếp (tủ dưới + tủ treo, backsplash marble, bếp từ, bồn rửa + vòi cong, đảo waterfall marble + 3 ghế bar,
//   tủ lạnh 2 cánh inox, tủ rượu cánh kính LED) · sảnh (tủ giày, gương, ghế băng) · WC khách · phòng giặt (máy giặt + sấy, kệ) · kho · cầu thang gỗ LED mũi bậc.
//  TẦNG TRÊN (gác lửng, lan can kính viền khoảng thông tầng): phòng ngủ master (giường King đầu giường lam gỗ + 4 gối, 2 tab + đèn ngủ, ghế cuối giường) ·
//   phòng thay đồ (tủ kính khung đen LED + đảo phụ kiện) · phòng tắm (bồn oval đứng tự do nhìn ra kính, lavabo đôi + 2 gương bầu dục đèn viền, buồng tắm kính
//   đá xám đen sen mưa, bồn cầu, giá khăn) · góc làm việc (kệ sách kịch trần, bàn đôi 2 màn hình, 2 ghế).
//  BAN CÔNG: bồn sục gỗ tròn (bậc cong, nước gợn), 2 ghế mây + bàn trà, 2 ghế tắm nắng teak, quầy BBQ, cây chậu.
//  Tường + cửa thật (cửa gỗ tự mở khi lại gần), va chạm toàn bộ, ngồi (sofa, ghế ăn, ghế bar, ghế làm việc, ghế mây) / nằm (giường, ghế tắm nắng), E: lò sưởi,
//  TV, tủ lạnh, tủ rượu, tủ quần áo, bồn sục, bồn tắm. Ánh sáng ấm = vật liệu tự phát sáng (không thêm đèn thật → không chớp, không tốn FPS).
//  Hiệu năng: vỏ (sàn, vách ngoài, kính) gộp theo vật liệu luôn hiện; nội thất gộp theo vật liệu + InstancedMesh, chỉ hiện khi cách căn < 70 m.
import { roundedBox } from './archKit.js';

const TAU=Math.PI*2;
export const DUPLEX_SPAN=(T)=>{ const ZN=14, rw=(T.sMid-6-ZN)/5; return ZN+rw; };   /* gian sảnh phụ + 1 gian phòng ≈ 25,9 m (đo ở r 128) */
export function duplexDef(T){ const SD=DUPLEX_SPAN(T); return T.acad ? {fL:9, sA:0, sB:SD, gable:0, SD, name:'Duplex Giám đốc Học viện', short:'Học viện'} : {fL:12, sA:T.Ls-SD, sB:T.Ls, gable:T.Ls, SD, name:'Duplex Penthouse Abyssal Horizon', short:'Residences'}; }

export function buildPenthouses(C){ const {W,THREE,K,MT,TW,root,seg,addPlat,circles,INTER,P,toast,S,save,lbl,PLACES,teleport,LOW}=C, out=[];
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.7, ...o}), uvs=(m,s)=>{ m.userData.uvS=s; return m; };
  /* vật liệu riêng căn hộ (tông ấm, không trắng tinh) */
  const oakTex=K.cvTex(512,512,(g,w)=>{ const r=(()=>{ let s=77; return ()=>{ s=s*16807%2147483647; return s/2147483647; }; })(); for(let i=0;i<8;i++){ const x=i*64; g.fillStyle=`hsl(${28+r()*6},${38+r()*10}%,${46+r()*8}%)`; g.fillRect(x,0,64,512);
      for(let k=0;k<22;k++){ g.strokeStyle=`rgba(80,48,24,${.08+r()*.14})`; g.lineWidth=.6+r()*1.4; const xx=x+3+r()*58; g.beginPath(); g.moveTo(xx,0); for(let y=0;y<=512;y+=32) g.lineTo(xx+Math.sin(y*.02+k)*1.6,y); g.stroke(); }
      g.fillStyle='rgba(40,24,12,.55)'; g.fillRect(x,0,2,512); const jy=(i*173)%512; g.fillRect(x,jy,64,2); } });
  const M={ oak:uvs(new THREE.MeshStandardMaterial({map:oakTex, roughness:.5}),2.2), wall:std(0xe6dccb,{roughness:.9}), navy:std(0x2c3e50,{roughness:.92}), navy2:std(0x3a4f66,{roughness:.92}),
    cream:std(0xede2cc,{roughness:.9}), linen:std(0xd9d0c1,{roughness:.95}), steel:std(0xb9c0c8,{roughness:.22, metalness:.9}), black:std(0x1d1d20,{roughness:.4, metalness:.3}),
    water:new THREE.MeshStandardMaterial({color:0x3fc4c8, emissive:0x0d4a50, emissiveIntensity:.6, roughness:.05, metalness:.1, transparent:true, opacity:.85}),
    flame:new THREE.MeshBasicMaterial({color:0xffa040, transparent:true, opacity:.9, blending:THREE.AdditiveBlending, depthWrite:false}), led:std(0xffdfa8,{emissive:0xffcf80, emissiveIntensity:1.25, roughness:.3}),
    mirror:std(0xcfd8de,{roughness:.04, metalness:1}), screenOff:std(0x0b0d10,{roughness:.2, metalness:.4}), rattan:std(0xb8915a,{roughness:.85}) };
  /* thảm len kem dệt sọc mảnh + viền nâu nhạt (giống tông ảnh mẫu, thay thảm Ba Tư sặc sỡ) */
  M.rug=new THREE.MeshStandardMaterial({roughness:.97, map:K.cvTex(512,512,(g,w,h)=>{ g.fillStyle='#e7ddcb'; g.fillRect(0,0,w,h); let r=11; const rn=()=>{ r=r*16807%2147483647; return r/2147483647; };
    for(let i=0;i<9000;i++){ const x=rn()*w, y=rn()*h, l=200+rn()*40|0; g.fillStyle=`rgba(${l},${l-12},${l-30},.35)`; g.fillRect(x,y,2,1+rn()*3); }
    for(let y=0;y<h;y+=6){ g.fillStyle='rgba(150,130,100,.06)'; g.fillRect(0,y,w,2); }
    g.strokeStyle='#a88e6a'; g.lineWidth=10; g.strokeRect(22,22,w-44,h-44); g.strokeStyle='rgba(168,142,106,.55)'; g.lineWidth=3; g.strokeRect(42,42,w-84,h-84); },{rep:false})});
  M.screenOn=new THREE.MeshBasicMaterial({map:K.cvTex(512,288,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#0e5a7a'); gr.addColorStop(.6,'#0a2f4a'); gr.addColorStop(1,'#04121e'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    for(let i=0;i<40;i++){ g.fillStyle=`rgba(180,230,255,${.05+Math.random()*.15})`; g.fillRect(Math.random()*w,0,2+Math.random()*4,h*.7); }
    for(let i=0;i<9;i++){ const x=40+Math.random()*(w-80), y=60+Math.random()*(h-120), s2=8+Math.random()*16; g.fillStyle='rgba(255,190,90,.9)'; g.beginPath(); g.ellipse(x,y,s2*1.6,s2*.7,0,0,TAU); g.fill(); g.beginPath(); g.moveTo(x-s2*1.5,y); g.lineTo(x-s2*2.4,y-s2*.7); g.lineTo(x-s2*2.4,y+s2*.7); g.fill(); }
    g.fillStyle='rgba(255,255,255,.85)'; g.font='700 26px Segoe UI, sans-serif'; g.fillText('ĐẠI DƯƠNG SÂU · TẬP 3',20,h-22); },{rep:false}), toneMapped:false});
  M.mon=new THREE.MeshBasicMaterial({color:0x6fb8ff});
  M.ao=new THREE.MeshBasicMaterial({map:K.cvTex(128,128,(g,w)=>{ const gr=g.createRadialGradient(w/2,w/2,4,w/2,w/2,w/2); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(.55,'rgba(0,0,0,.65)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,w,w); },{rep:false}),
    color:0x000000, transparent:true, opacity:.34, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-6});
  M.flow=new THREE.MeshStandardMaterial({color:0xbfe8ff, transparent:true, opacity:.45, roughness:.05, depthWrite:false});
  const RB=(w,h,d,r=.04)=>roundedBox(Math.max(.02,w),Math.max(.02,h),Math.max(.02,d),Math.max(.003,Math.min(r,w/2-.004,h/2-.004,d/2-.004)),2);
  const lathe=(pts,n=24)=>new THREE.LatheGeometry(pts.map(([r,h])=>new THREE.Vector2(r,h)),n);

  for(const T of TW){ const D=duplexDef(T), FLL=T.floors.find(F=>F.f===D.fL), FLU=T.floors.find(F=>F.f===D.fL+1); if(!FLL || !FLU) continue;
    const yL=FLL.y, yU=FLU.y, CL=yU-.32, CU=FLU.yc, rGL=FLL.rG, rGU=FLU.rG, rOL=FLL.rO, rOU=FLU.rO, rWL=FLL.rW, rWU=FLU.rW, rBk=rWU+3.0, SD=D.SD, dir=D.gable===0?1:-1;
    const VB=rBk-rGL, VOL=rOL-rGL, VOU=rOU-rGL, VGU=rGU-rGL, VC=FLL.rC-rGL, VWU=rWU-rGL;   /* v = khoảng cách vào trong tính từ kính tầng dưới */
    const sOf=a=>D.gable+dir*a, R=v=>rGL+v, P2=(a,v)=>T.Ps(sOf(a),R(v));
    const tanA=a=>{ const A=T.aAt(sOf(a)); return [-Math.sin(A)*T.sg*dir, Math.cos(A)*T.sg*dir]; }, radA=a=>{ const A=T.aAt(sOf(a)); return [Math.cos(A), Math.sin(A)]; };
    const yawAt=(a,fa,fv)=>{ const t=tanA(a), d=radA(a); return Math.atan2(t[0]*fa+d[0]*fv, t[1]*fa+d[1]*fv); };
    const off=(a,v,fa,fv,u,w)=>[a+(-fv)*u+fa*w, v+fa*u+fv*w];   /* u: ngang (bên phải khi nhìn theo hướng mặt), w: tiến theo hướng mặt */
    const SH=K.Batch(T.cx,T.cz), IN=K.Batch(T.cx,T.cz), E=K.Emit(), G=new THREE.Group(); G.name='aby-ph-'+T.k; G.visible=false; root.add(G);
    const DY=new THREE.Group(); DY.userData.dynamic=true; G.add(DY);
    const ringA=(B,mat,a0,a1,v0,v1,y0,y1,f)=>T.ring(B,mat,sOf(a0),sOf(a1),R(v0),R(v1),y0,y1,f);
    const platA=(a0,a1,v0,v1,y)=>{ if(a1-a0<.05 || v1-v0<.05) return; const s0=sOf(a0), s1=sOf(a1); T.floorPlats(R(v0),R(v1),y,Math.min(s0,s1),Math.max(s0,s1),false); };
    const segP=(p,q,y0,y1,msg)=>seg(p[0],p[1],q[0],q[1],y0,y1,msg);
    const arcS=(v,a0,a1,y0,y1,msg)=>{ if(a1-a0>.05) T.arcSeg(R(v),sOf(a0),sOf(a1),y0,y1,msg); }, radS=(a,v0,v1,y0,y1,msg)=>{ if(v1-v0>.05) T.radSeg(sOf(a),R(v0),R(v1),y0,y1,msg); };
    const put=(B,mat,g,a,v,y,fa=0,fv=-1,sx=1,sy=1,sz=1,rx=0)=>{ const p=P2(a,v); B.geo(mat,g,p[0],y,p[1],yawAt(a,fa,fv),sx,sy,sz,rx); };
    const rb=(mat,a,v,y,w,h,d,fa=0,fv=-1,r=.05,B=IN)=>put(B,mat,RB(w,h,d,r),a,v,y,fa,fv);   /* y = tâm hộp */
    const eb=(sh,mat,a,v,y,sx,sy,sz,fa=0,fv=-1,col)=>{ const p=P2(a,v); E[sh](mat,p[0],y,p[1],yawAt(a,fa,fv),sx,sy,sz,col); };
    /* va chạm khối chữ nhật theo hướng mặt (rộng w ngang, sâu d dọc hướng mặt) */
    const aoGeo=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2), ao=(a,v,y,w,d,fa=0,fv=-1)=>put(IN,M.ao,aoGeo,a,v,y+.022,fa,fv,w*1.18+.25,1,d*1.18+.25);
    const blk=(a,v,w,d,fa,fv,y,h,msg)=>{ const c=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,ww])=>P2(...off(a,v,fa,fv,u,ww))); for(let i=0;i<4;i++) segP(c[i],c[(i+1)%4],y-.4,y+h,msg); ao(a,v,y,w,d,fa,fv); };
    const circ=(a,v,r,y,h=1.4)=>{ const p=P2(a,v); circles.push({x:p[0], z:p[1], r, y0:y-.4, y1:y+h}); ao(a,v,y,2*r,2*r); };
    const bench=(a,v,fa,fv,len,seatY,floorY,label,lie,onSit)=>{ if(!W.addBench) return; const p=P2(a,v); W.addBench({x:p[0], z:p[1], rot:yawAt(a,fa,fv), len, y:seatY, floor:floorY, label, lie:!!lie, solo:!!lie||!!onSit, onSit}); };
    const buff=(min,msg)=>()=>{ S.buffs=S.buffs||{}; S.buffs.energy=Math.max(Date.now(),S.buffs.energy||0)+min*60000; save&&save(); toast(msg,3000); };
    const inter=(a,v,y,r,label,action)=>{ const p=P2(a,v); INTER.push({x:p[0], z:p[1], r, prio:.7, when:()=>Math.abs(P.y-y)<1.6 && G.visible, label, action}); };
    const doors=[], ANIM={flames:[], water:null, tv:null, fire:true, slide:[], flows:[], fridge:null};

    /* ============ VỎ: sàn tầng trên (khoét thông tầng + lỗ cầu thang), sàn nới sau, mái nới, vách sau, đầu hồi, vách bên, kính mặt tiền ============ */
    const VOID=[0,9.2,0,7.0], STA=[5.1,12.6,10.75,VB];   /* [a0,a1,v0,v1] */
    { const y=yU, slab=(a0,a1,v0,v1)=>{ if(a1-a0>.05 && v1-v0>.05) ringA(SH,MT.trav,a0,a1,v0,v1,y-.32,y,{}); platA(a0,a1,v0,v1,y); };
      slab(0,9.2,VOU,0); slab(0,9.2,7.0,10.75); slab(0,5.1,10.75,VB); slab(9.2,12.6,VOU,10.75); slab(12.6,SD,VOU,VB); }
    ringA(SH,MT.trav,0,SD,rWL+.3-rGL,VB,yL-.32,yL,{}); platA(0,SD,VOL,VB,yL);                                             /* sàn tầng dưới (cả phần nới) */
    ringA(SH,MT.trav,0,SD,VWU+.25,VB+.3,CU,CU+.42,{});                                                                   /* nắp mái phần nới */
    ringA(SH,M.wall,0,SD,VB-.02,VB,yL,CU,{t:false,b:false,o:false,e:false}); ringA(SH,MT.trav,0,SD,VB,VB+.3,yL-.32,CU+.42,{i:false});   /* vách sau */
    arcS(VB-.2,0,SD,yL-.4,yL+3.6,'🧱 Tường sau căn duplex'); arcS(VB-.2,0,SD,yU-.4,yU+3.6,'🧱 Tường sau căn duplex');
    /* đầu hồi (Travertine ngoài) + lan can đầu ban công */ ringA(SH,MT.trav,-.4,0,0,VB+.3,yL-.32,CU+.42,{}); radS(.2,0,VB,yL-.4,yL+3.6,'🧱 Đầu hồi căn duplex'); radS(.2,0,VB,yU-.4,yU+3.6,'🧱 Đầu hồi căn duplex');
    for(const [y,v0] of [[yL,VOL],[yU,VOU]]){ radS(.15,v0+.12,0,y-.4,y+1.5,'🌿 Lan can đầu ban công'); ringA(SH,MT.gold,0,.06,v0+.12,0,y+1.0,y+1.07,{}); ringA(SH,MT.glassR,0,.02,v0+.12,0,y,y+1.0,{}); }
    /* vách bên phía phần còn lại của tầng (cửa chính ở tầng dưới, đúng hành lang) + vách kính ngăn ban công */
    const DOOR_V=[VC+.6,VC+2.2];
    ringA(SH,M.wall,SD-.12,SD,0,DOOR_V[0],yL,CL,{}); ringA(SH,M.wall,SD-.12,SD,DOOR_V[1],VB,yL,CL,{}); ringA(SH,M.wall,SD-.12,SD,DOOR_V[0],DOOR_V[1],yL+2.35,CL,{});
    radS(SD-.06,0,DOOR_V[0],yL-.4,yL+3.6,'🧱 Vách căn duplex'); radS(SD-.06,DOOR_V[1],VB,yL-.4,yL+3.6,'🧱 Vách căn duplex');
    ringA(SH,M.wall,SD-.12,SD,VGU,VB,yU,CU,{}); radS(SD-.06,VGU,VB,yU-.4,yU+3.6,'🧱 Vách căn duplex'); ringA(SH,MT.trav,SD-.12,SD,VWU,VB,CL,yU,{});
    for(const [y,v0,v1] of [[yL,VOL,0],[yU,VOU,VGU]]){ ringA(SH,MT.glassR,SD-.03,SD,v0+.15,v1,y,y+2.2,{}); ringA(SH,MT.gold,SD-.05,SD+.02,v0+.15,v1,y+2.2,y+2.27,{}); radS(SD,v0+.12,v1,y-.4,y+2.6,'🌿 Vách kính ngăn ban công riêng'); }
    /* kính mặt tiền: phòng khách cao trọn 2 tầng; phần còn lại kính từng tầng; cửa lùa ra ban công */
    const glassLine=(v,a0,a1,y0,y1,gaps)=>{ let cur=a0; for(const [g0,g1] of gaps){ if(g0>cur){ T.surf(SH,MT.glassS,sOf(cur),sOf(g0),R(v),y0,y1); arcS(v,cur,g0,y0-.4,y0+3.5,'🪟 Vách kính – ra ban công bằng cửa lùa'); } T.surf(SH,MT.glassS,sOf(g0),sOf(g1),R(v),y0+2.7,y1); cur=g1; }
      if(a1>cur){ T.surf(SH,MT.glassS,sOf(cur),sOf(a1),R(v),y0,y1); arcS(v,cur,a1,y0-.4,y0+3.5,'🪟 Vách kính – ra ban công bằng cửa lùa'); }
      for(let a=a0+1.6; a<a1-.3; a+=1.6){ if(gaps.some(([g0,g1])=>a>g0-.15 && a<g1+.15)) continue; const p=P2(a,v); SH.box(MT.bronze,p[0],(y0+y1)/2,p[1],-T.aAt(sOf(a)),.12,y1-y0,.07); }
      for(const [g0,g1] of gaps) for(const a of [g0,g1]){ const p=P2(a,v); SH.box(MT.gold,p[0],y0+1.35,p[1],-T.aAt(sOf(a)),.14,2.7,.1); } };
    glassLine(0,0,9.2,yL,CU,[[6.0,7.6]]); glassLine(0,9.2,SD,yL,CL,[[20.4,22.0]]); glassLine(VGU,9.2,SD,yU,CU,[[13.2,14.8]]);
    ringA(SH,MT.bronze,0,SD,-.05,.05,CL-.02,yU+.02,{});   /* dầm đồng ngang mặt kính ở cao độ sàn trên */
    ringA(SH,MT.glassS,9.18,9.22,0,VGU,yU,CU,{}); radS(9.2,0,VGU,yU-.4,yU+3.5,'🪟 Vách kính');
    /* đèn hắt trần giật cấp (LED ấm #ffdfa8) – vỏ, luôn hiện để nhìn từ ngoài thấy căn sáng ấm */
    for(const [y,v0] of [[CU,VGU],[CL,0]]){ ringA(SH,M.led,y===CL?9.4:.3,SD-.3,v0+.25,v0+.32,y-.08,y-.04,{}); ringA(SH,M.led,y===CL?9.4:.3,SD-.3,VB-.32,VB-.25,y-.08,y-.04,{}); }

    /* ============ VÁCH TRONG + CỬA ============ */
    const H=4.18;
    function wallArc(v,a0,a1,y,gaps=[],mat=M.wall,msg='🧱 Vách phòng'){ let cur=a0; for(const [g0,g1] of gaps){ if(g0>cur){ ringA(IN,mat,cur,g0,v-.06,v+.06,y,y+H,{}); arcS(v,cur,g0,y-.4,y+3.6,msg); } ringA(IN,mat,g0,g1,v-.06,v+.06,y+2.35,y+H,{}); cur=g1; } if(a1>cur){ ringA(IN,mat,cur,a1,v-.06,v+.06,y,y+H,{}); arcS(v,cur,a1,y-.4,y+3.6,msg); } }
    function wallRad(a,v0,v1,y,gaps=[],mat=M.wall,msg='🧱 Vách phòng'){ let cur=v0; for(const [g0,g1] of gaps){ if(g0>cur){ ringA(IN,mat,a-.06,a+.06,cur,g0,y,y+H,{}); radS(a,cur,g0,y-.4,y+3.6,msg); } ringA(IN,mat,a-.06,a+.06,g0,g1,y+2.35,y+H,{}); cur=g1; } if(v1>cur){ ringA(IN,mat,a-.06,a+.06,cur,v1,y,y+H,{}); radS(a,cur,v1,y-.4,y+3.6,msg); } }
    /* cửa gỗ bản lề: tự mở khi lại gần (cùng tầng), đóng lại sau đó; khung gỗ + tay nắm vàng */
    function door(p0,p1,y,name){ const dx=p1[0]-p0[0], dz=p1[1]-p0[1], w=Math.hypot(dx,dz), pv=new THREE.Group(); pv.position.set(p0[0],y,p0[1]); pv.rotation.y=Math.atan2(-dz,dx);
      const pan=new THREE.Mesh(RB(w-.06,2.28,.05,.02),MT.walnut); pan.position.set(w/2,1.16,0); pv.add(pan); const hd=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.2,8),MT.gold); hd.rotation.z=Math.PI/2; hd.position.set(w-.14,1.05,.05); pv.add(hd);
      DY.add(pv); const s=seg(p0[0],p0[1],p1[0],p1[1],y-.4,y+2.4,`🚪 ${name} đang đóng – bấm E để mở`); const d={pv, s, y, y0:y-.4, c:[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2], base:pv.rotation.y, k:0, open:false}; doors.push(d);
      INTER.push({x:d.c[0], z:d.c[1], r:1.9, prio:.9, when:()=>Math.abs(P.y-y)<1.6 && G.visible, get label(){ return (d.open?'🚪 Đóng ':'🚪 Mở ')+name+' (E)'; }, action:()=>{ d.open=!d.open; if(W.sfx) try{ W.sfx('lift-door',d.c[0],y+1,d.c[1]); }catch(e){} }}); return d; }
    const doorArc=(v,a0,a1,y,name)=>door(P2(a0,v),P2(a1,v),y,name), doorRad=(a,v0,v1,y,name)=>door(P2(a,v0),P2(a,v1),y,name);
    /* — tầng dưới — */
    wallArc(8.3,0,5.6,yL,[[3.8,5.0]],MT.walnut,'🧱 Vách lam gỗ'); wallArc(8.3,13.6,16.6,yL,[[14.4,15.6]]); wallArc(8.3,16.6,SD-.12,yL,[[21.2,22.4]]);
    wallRad(5.6,8.3,VB,yL); wallRad(13.6,8.3,VB,yL); wallRad(16.6,8.3,VB,yL);
    doorArc(8.3,3.8,5.0,yL,'Cửa kho'); doorArc(8.3,14.4,15.6,yL,'Cửa WC khách'); doorArc(8.3,21.2,22.4,yL,'Cửa phòng giặt'); doorRad(SD-.06,DOOR_V[1],DOOR_V[0],yL,'Cửa chính căn duplex');
    /* — tầng trên — */
    wallArc(8.3,10.6,19.0,yU,[[16.6,17.8]]); wallRad(10.6,VGU,8.3,yU,[[6.6,7.8]]); wallRad(18.2,VGU,8.3,yU,[[6.6,7.8]]); wallRad(13.0,8.3,VB,yU); wallRad(19.0,8.3,VB,yU,[],M.wall,'🧱 Vách phòng thay đồ');
    doorRad(10.6,6.6,7.8,yU,'Cửa phòng ngủ master'); doorRad(18.2,6.6,7.8,yU,'Cửa phòng tắm'); doorArc(8.3,16.6,17.8,yU,'Cửa phòng thay đồ');
    /* lan can kính khoảng thông tầng + lỗ cầu thang (tầng trên) */
    const railG=(pts,y)=>{ for(let i=0;i<pts.length-1;i++){ const [a0,v0]=pts[i], [a1,v1]=pts[i+1]; if(Math.abs(v0-v1)<1e-6){ ringA(IN,MT.glassR,a0,a1,v0-.015,v0+.015,y,y+1.0,{}); ringA(IN,MT.gold,a0,a1,v0-.04,v0+.04,y+1.0,y+1.07,{}); arcS(v0,a0,a1,y-.4,y+1.5,'🌿 Lan can kính thông tầng'); }
        else { ringA(IN,MT.glassR,a0-.015,a0+.015,Math.min(v0,v1),Math.max(v0,v1),y,y+1.0,{}); ringA(IN,MT.gold,a0-.04,a0+.04,Math.min(v0,v1),Math.max(v0,v1),y+1.0,y+1.07,{}); radS(a0,Math.min(v0,v1),Math.max(v0,v1),y-.4,y+1.5,'🌿 Lan can kính thông tầng'); } } };
    railG([[.4,7.0],[9.2,7.0]],yU); railG([[9.2,VGU],[9.2,7.0]],yU); railG([[5.1,10.75],[12.6,10.75]],yU); railG([[12.6,10.75],[12.6,VB]],yU);

    /* ============ SÀN GỖ + TRẦN ============ */
    ringA(IN,M.oak,.3,SD-.15,0,VB,yL+.004,yL+.014,{b:false,i:false,o:false,e:false});
    for(const [a0,a1,v0,v1] of [[9.2,12.6,VGU,10.75],[12.6,18.2,VGU,VB],[0,9.2,7.0,10.75],[0,5.1,10.75,VB]]) ringA(IN,M.oak,a0,a1,v0,v1,yU+.004,yU+.014,{b:false,i:false,o:false,e:false});
    ringA(IN,MT.marbleD,18.2,SD-.15,VGU,VB,yU+.006,yU+.016,{b:false,i:false,o:false,e:false}); ringA(IN,MT.marbleD,13.6,16.6,8.3,VB,yL+.016,yL+.026,{b:false,i:false,o:false,e:false});

    /* ============ PHÒNG KHÁCH THÔNG TẦNG ============ */
    { const y=yL; ringA(IN,MT.trav,.3,.7,1.2,6.8,y,y+5.6,{}); for(let v=.45; v<8.2; v+=.18){ if(v>1.1 && v<6.9) continue; eb('box',MT.walnut,.36,v,y+3.2,.06,6.4,.09,1,0); }   /* vách TV: Travertine kẹp lam gỗ óc chó */
      rb(M.black,.78,4.0,y+.55,1.9,.95,.12,1,0,.02); const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.55),M.flame); const fp=P2(.86,4.0); fl.position.set(fp[0],y+.5,fp[1]); fl.rotation.y=yawAt(.86,1,0); DY.add(fl); ANIM.flames.push(fl);   /* lò sưởi âm tường */
      rb(MT.trav,.95,4.0,y+.06,2.6,.12,.5,1,0,.02); rb(MT.marble,.95,4.0,y+1.16,2.3,.06,.32,1,0,.01);
      rb(M.black,.78,4.0,y+2.45,2.5,1.45,.07,1,0,.02); { const sc=new THREE.Mesh(new THREE.PlaneGeometry(2.36,1.32),M.screenOff); const p=P2(.83,4.0); sc.position.set(p[0],y+2.45,p[1]); sc.rotation.y=yawAt(.83,1,0); DY.add(sc); ANIM.tv=sc; }
      inter(1.6,4.0,y,2.2,'🔥 Bật / tắt lò sưởi (E)',()=>{ ANIM.fire=!ANIM.fire; toast(ANIM.fire?'🔥 Lò sưởi bập bùng – phòng khách ấm hẳn lên':'🔥 Đã tắt lò sưởi',2000); });
      inter(1.6,5.2,y,2.0,'📺 Bật / tắt TV (E)',()=>{ const on=ANIM.tv.material!==M.screenOn; ANIM.tv.material=on?M.screenOn:M.screenOff; toast(on?'📺 TV đang chiếu phim tài liệu biển sâu':'📺 Đã tắt TV',2000); });
      blk(.75,4.0,6.0,.5,1,0,y,1.2,'🔥 Vách TV & lò sưởi');
      /* thảm + sofa chữ L (đệm ngồi, gối tựa, tay vịn, gối ôm) + 2 armchair + bàn trà marble */
      { const pg=new THREE.PlaneGeometry(4.6,5.0); pg.rotateX(-Math.PI/2); put(IN,M.rug,pg,3.4,4.0,y+.018,1,0); }
      const sofa=(a,v,len,fa,fv,col)=>{ const o=(u,w)=>off(a,v,fa,fv,u,w); rb(col,...o(0,-.05),y+.22,len,.3,.92,fa,fv,.06); const n=Math.max(1,Math.round(len/.85));
        for(let i=0;i<n;i++){ const u=-len/2+(i+.5)*len/n; rb(col,...o(u,.06),y+.44,len/n-.05,.17,.72,fa,fv,.07); rb(col===M.navy?M.navy2:col,...o(u,-.3),y+.74,len/n-.08,.46,.18,fa,fv,.08); }
        rb(col,...o(0,-.42),y+.62,len+.02,.62,.14,fa,fv,.05); for(const e of [-1,1]) rb(col,...o(e*(len/2+.11),-.02),y+.36,.22,.56,.92,fa,fv,.07);
        for(const e of [-1,1]) rb(M.cream,...o(e*(len/2-.3),-.18),y+.74,.42,.36,.12,fa,fv,.06); for(const [u,w] of [[-len/2-.12,-.4],[len/2+.12,-.4],[-len/2-.12,.38],[len/2+.12,.38]]){ const q=P2(...o(u,w)); E.cyl(MT.walnut,q[0],y+.04,q[1],0,.06,.08,.06,null); } blk(...o(0,-.02),len+.44,.96,fa,fv,y,.9,'🛋️ Sofa'); bench(...o(0,.14),fa,fv,len-.2,y+.47,y,'🛋️ Ngồi sofa (E · C)'); };
      sofa(5.6,4.0,3.2,-1,0,M.navy); sofa(4.15,6.25,1.9,0,-1,M.navy);
      const chair=(a,v,fa,fv)=>{ const o=(u,w)=>off(a,v,fa,fv,u,w); rb(M.cream,...o(0,0),y+.26,.82,.34,.8,fa,fv,.08); rb(M.cream,...o(0,.04),y+.46,.6,.12,.62,fa,fv,.06); rb(M.cream,...o(0,-.33),y+.7,.8,.5,.16,fa,fv,.07); for(const e of [-1,1]) rb(M.cream,...o(e*.36,0),y+.5,.12,.32,.78,fa,fv,.05); circ(a,v,.45,y,.9); bench(...o(0,.08),fa,fv,.6,y+.47,y,'🛋️ Ngồi armchair (E · C)'); };
      chair(2.4,1.7,0,1); chair(3.7,1.7,0,1);
      rb(MT.marble,3.4,4.0,y+.42,.75,.05,1.3,1,0,.02); rb(MT.walnut,3.4,4.0,y+.2,.5,.38,1.0,1,0,.03); blk(3.4,4.0,1.3,.8,1,0,y,.5,'☕ Bàn trà');
      /* đèn chùm thả thông tầng */ { const c=P2(4.5,4.0), yC=y+5.0; IN.cyl(MT.gold,c[0],(yC+CU)/2+.6,c[1],0,.03,CU-yC-1.2,.03);
        for(const [rr,yy] of [[1.15,yC+.6],[.8,yC],[.45,yC-.55]]){ IN.geo(MT.gold,new THREE.TorusGeometry(rr,.03,6,40),c[0],yy,c[1],0,1,1,1,Math.PI/2); for(let q=0;q<Math.round(rr*22);q++){ const a=q/Math.round(rr*22)*TAU; E.cone(M.led,c[0]+Math.cos(a)*rr,yy-.16,c[1]+Math.sin(a)*rr,0,.07,.24,.07,null); } } }
      /* cây cọ lá xẻ trong chậu đá (lá = nan cong xoay tỏa, không dùng khối cầu) */ }
    const palm=(a,v,y,s=1)=>{ const p=P2(a,v); IN.geo(MT.trav,lathe([[0,0],[.24,0],[.3,.1],[.3,.52],[.26,.56],[0,.56]],18),p[0],y,p[1],0,s,s,s); IN.cyl(MT.walnut,p[0],y+.56+.5*s,p[1],0,.05*s,1.0*s,.05*s);
      for(let i=0;i<8;i++){ const yaw=i/8*TAU+a; IN.geo(MT.green,new THREE.ConeGeometry(.16,1.3,4,1),p[0]+Math.sin(yaw)*.45*s,y+1.25*s,p[1]+Math.cos(yaw)*.45*s,yaw,s,s,.25*s,1.05); } circ(a,v,.34,y,1.2); };
    palm(.9,.7,yL); palm(8.5,7.6,yL,.9);
    /* ============ BÀN ĂN 8 GHẾ ============ */
    { const y=yL, ta=12.2, tv=3.6; rb(MT.marble,ta,tv,y+.76,1.1,.06,3.0,1,0,.02); for(const e of [-1,1]) rb(MT.walnut,ta+e*1.1,tv,y+.37,.16,.72,.9,1,0,.03); blk(ta,tv,1.15,3.05,1,0,y,.8,'🍽️ Bàn ăn');
      const dchair=(a,v,fa,fv)=>{ const o=(u,w)=>off(a,v,fa,fv,u,w); rb(M.linen,...o(0,0),y+.47,.46,.08,.46,fa,fv,.04); rb(M.linen,...o(0,-.21),y+.78,.44,.56,.06,fa,fv,.03); for(const [u,w] of [[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]]){ const q=P2(...o(u,w)); E.cyl(MT.walnut,q[0],y+.22,q[1],0,.035,.44,.035,null); }
        bench(...o(0,.05),fa,fv,.5,y+.5,y,'🍽️ Ngồi bàn ăn (E · C)'); };
      for(const da of [-1,0,1]){ dchair(ta+da*1.0,tv-.95,0,1); dchair(ta+da*1.0,tv+.95,0,-1); } dchair(ta-1.85,tv,1,0); dchair(ta+1.85,tv,-1,0);
      { const c=P2(ta,tv); IN.box(MT.bronze,c[0],y+2.7,c[1],yawAt(ta,1,0),.08,.06,2.2); for(const e of [-.8,0,.8]){ const q=P2(ta+e,tv); E.cone(M.led,q[0],y+2.45,q[1],0,.32,.3,.32,null); IN.cyl(MT.bronze,q[0],(y+2.6+CL)/2,q[1],0,.012,CL-y-2.6,.012); } } }
    /* ============ BẾP ============ */
    { const y=yL, aw=SD-.45;
      rb(MT.walnut,aw,2.95,y+.44,4.9,.88,.62,-1,0,.03); rb(MT.marble,aw-.02,2.95,y+.9,5.0,.05,.68,-1,0,.01); rb(MT.marble,SD-.18,2.95,y+1.5,4.9,1.1,.04,-1,0,.01); rb(MT.walnut,SD-.33,2.95,y+2.45,4.9,.8,.36,-1,0,.03);
      rb(M.black,aw,4.15,y+.94,.75,.02,.55,-1,0,.01); { const p=P2(aw,1.75); IN.geo(M.steel,lathe([[0,0],[.22,0],[.24,.02],[.24,.18],[.26,.2],[0,.2]],20),p[0],y+.72,p[1],0,1.2,1,1);
        const fc=[]; for(let i=0;i<=10;i++){ const t=i/10*Math.PI; fc.push(new THREE.Vector3(-Math.cos(t)*.18,y+.95+Math.sin(t)*.28,0)); } const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fc),16,.018,6,false); put(IN,M.steel,tg,aw+.22,1.75,0,0,1); }
      eb('box',M.led,SD-.3,2.95,y+2.02,.02,.02,4.8,-1,0,null); blk(aw,2.95,4.95,.7,-1,0,y,1.1,'🍳 Tủ bếp');
      { const fl=new THREE.Mesh(new THREE.CylinderGeometry(.012,.02,.42,8),M.flow); const q=P2(aw-.08,1.75); fl.position.set(q[0],y+1.0,q[1]); fl.visible=false; DY.add(fl); const F={mesh:fl, on:false}; ANIM.flows.push(F); inter(aw-1.2,1.75,y,1.6,'🚰 Mở / khoá vòi nước bồn rửa (E)',()=>{ F.on=!F.on; }); }
      /* tủ lạnh 2 cánh, tủ rượu kính LED, tủ cao */ rb(M.steel,16.55,8.0,y+1.0,1.0,2.0,.6,0,-1,.04); rb(M.cream,16.55,7.75,y+1.0,.9,1.9,.04,0,-1,.01); for(let lv=0;lv<4;lv++) eb('box',MT.glassR,16.55,7.95,y+.4+lv*.42,.9,.02,.5,0,-1,null); blk(16.55,7.9,1.05,.72,0,-1,y,2,'🧊 Tủ lạnh');
      { const h0=P2(16.05,7.62), h1=P2(17.05,7.62), pv=new THREE.Group(), dx=h1[0]-h0[0], dz=h1[1]-h0[1]; pv.position.set(h0[0],y,h0[1]); pv.rotation.y=Math.atan2(-dz,dx); const oq=P2(16.55,6.9), zl=[-dz,dx], fsg=((oq[0]-h0[0])*zl[0]+(oq[1]-h0[1])*zl[1])>0?-1:1; const dm=new THREE.Mesh(RB(.98,1.98,.07,.03),M.steel); dm.position.set(.49,1.0,0); pv.add(dm); const hd=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.9,8),MT.chrome); hd.position.set(.9,1.1,.06); pv.add(hd); DY.add(pv); ANIM.fridge={pv, base:pv.rotation.y, k:0, open:false, sg:fsg};
        inter(16.55,6.9,y,1.6,'🧊 Mở / đóng tủ lạnh (E)',()=>{ const F2=ANIM.fridge; F2.open=!F2.open; if(F2.open){ S.buffs=S.buffs||{}; S.buffs.energy=Math.max(Date.now(),S.buffs.energy||0)+3*60000; save&&save(); toast('🧊 Lấy một chai nước khoáng mát lạnh – ⚡ khoẻ thêm 3 phút',2200); } }); }
      rb(MT.walnut,17.85,7.9,y+1.1,1.25,2.2,.62,0,-1,.03); rb(MT.glassR,17.85,7.57,y+1.1,1.15,2.1,.03,0,-1,.01); for(let lv=0;lv<6;lv++){ eb('box',M.led,17.85,7.62,y+.35+lv*.33,1.05,.015,.02,0,-1,null); for(let q=0;q<6;q++) eb('cyl',MT.amber||M.led,17.4+q*.17,7.85,y+.45+lv*.33,.07,.26,.07,0,-1,null); }
      blk(17.85,7.9,1.3,.66,0,-1,y,2.2,'🍷 Tủ rượu'); inter(17.85,6.9,y,1.6,'🍷 Mở tủ rượu – chọn một chai vang (E)',()=>toast('🍷 Bạn chọn một chai vang đỏ 12 năm – để dành cho bữa tối trên ban công',2600));
      rb(MT.walnut,19.3,7.9,y+1.1,1.25,2.2,.62,0,-1,.03); blk(19.3,7.9,1.3,.66,0,-1,y,2.2,'🍳 Tủ cao');
      /* đảo bếp waterfall marble + 3 ghế bar */ rb(MT.marble,20.3,3.6,y+.92,2.9,.06,1.05,1,0,.01); for(const e of [-1,1]) rb(MT.marble,20.3,3.6+e*1.42,y+.45,.06,.9,1.05,1,0,.01); rb(MT.walnut,20.45,3.6,y+.45,2.7,.86,.7,1,0,.02);
      blk(20.3,3.6,2.95,1.1,1,0,y,1.0,'🍳 Đảo bếp');
      for(const v of [2.7,3.6,4.5]){ const p=P2(19.25,v); IN.cyl(MT.bronze,p[0],y+.38,p[1],0,.04,.74,.04); IN.cyl(MT.bronze,p[0],y+.06,p[1],0,.36,.03,.36); rb(MT.bordeaux,19.25,v,y+.77,.4,.08,.4,1,0,.04); circ(19.25,v,.2,y,.8); bench(19.25,v,1,0,.45,y+.8,y,'🍸 Ngồi ghế bar (E · C)'); } }
    /* ============ SẢNH (tủ giày, gương, ghế băng) ============ */
    { const y=yL; rb(MT.walnut,24.0,8.05,y+.45,2.6,.9,.36,0,-1,.03); eb('box',M.led,24.0,7.86,y+.12,2.5,.015,.02,0,-1,null); rb(M.mirror,23.4,8.22,y+1.55,.6,1.3,.02,0,-1,.01); rb(MT.gold,23.4,8.23,y+1.55,.66,1.36,.015,0,-1,.005);
      rb(M.cream,24.0,7.62,y+.48,1.0,.08,.36,0,-1,.04); blk(24.0,8.05,2.65,.4,0,-1,y,1,'👞 Tủ giày'); bench(24.0,7.62,0,-1,.9,y+.52,y,'👞 Ngồi tủ giày thay giày (E · C)'); }
    /* ============ WC KHÁCH (a 13,6–16,6) · KHO (0,4–5,6) · PHÒNG GIẶT (16,6–25,5) ============ */
    const toilet=(a,v,y,fa,fv)=>{ const p=P2(a,v); IN.geo(M.cream,lathe([[0,0],[.16,0],[.2,.25],[.22,.4],[.2,.42],[0,.42]],18),p[0],y,p[1],0,1,1,1.3); rb(M.cream,...off(a,v,fa,fv,0,-.28),y+.62,.4,.4,.16,fa,fv,.05); circ(a,v,.3,y,.6); };
    { const y=yL; toilet(15.1,12.4,y,0,-1); rb(MT.marbleD,13.95,10.2,y+.82,.5,.06,1.1,1,0,.01); { const p=P2(13.95,10.2); IN.geo(M.cream,lathe([[0,0],[.18,0],[.2,.12],[.22,.14],[0,.14]],18),p[0],y+.85,p[1],0,1,1,1); }
      { const m=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,8,32),M.led); const p=P2(13.72,10.2); m.position.set(p[0],y+1.65,p[1]); m.rotation.y=yawAt(13.72,1,0)+Math.PI/2; DY.add(m); rb(M.mirror,13.7,10.2,y+1.65,.6,.6,.01,1,0,.29); }
      blk(13.95,10.2,1.15,.55,1,0,y,1,'🚽 Lavabo'); }
    { const y=yL; for(const v of [12.4]) for(let lv=0;lv<4;lv++){ rb(MT.walnut,3.0,v,y+.4+lv*.5,4.6,.04,.5,0,v<10?1:-1,.01); for(let q=0;q<5;q++) eb('box',MT.paint,1.2+q*.9,v,y+.55+lv*.5,.5,.26,.36,0,1,[0xb8915a,0x8a6a44,0x5c3d2e,0xd9c9a6][(q+lv)%4]); }
      blk(3.0,12.4,4.7,.55,0,-1,y,2,'📦 Kệ kho'); }
    { const y=yL; for(const [a,nm] of [[18.0,'🫧 Máy giặt'],[19.0,'🔥 Máy sấy']]){ rb(M.linen,a,12.5,y+.45,.66,.88,.66,0,-1,.06); const m=new THREE.Mesh(new THREE.TorusGeometry(.2,.03,8,24),MT.chrome); const p=P2(a,12.15); m.position.set(p[0],y+.5,p[1]); m.rotation.y=yawAt(a,0,-1); DY.add(m); blk(a,12.5,.7,.7,0,-1,y,1,nm); }
      inter(18.5,11.3,y,1.8,'🫧 Giặt đồ (E)',()=>toast('🫧 Máy giặt chạy chế độ nhẹ 30 phút – đồ thơm mùi oải hương',2400));
      for(let lv=0;lv<3;lv++){ rb(MT.walnut,22.5,12.75,y+.6+lv*.55,5.0,.04,.4,0,-1,.01); for(let q=0;q<7;q++) eb('box',MT.paint,20.4+q*.7,12.75,y+.75+lv*.55,.4,.24,.3,0,-1,[0xede2cc,0x9fb8c8,0xd9c9a6][q%3]); } blk(22.5,12.75,5.05,.45,0,-1,y,1.9,'🧺 Kệ đồ'); }
    /* ============ CẦU THANG GỖ (24 bậc, LED mũi bậc, lan can kính tay vịn vàng) ============ */
    { const N=26, run=.28, rise=(yU-yL)/N, a0=12.4, v0=10.75, v1=12.45;
      for(let k=0;k<N;k++){ const aT=a0-k*run, yt=yL+rise*(k+1); rb(MT.walnut,aT-run/2,(v0+v1)/2,yt-.03,run+.02,.06,v1-v0,1,0,.01); eb('box',M.led,aT-run+.02,(v0+v1)/2,yt-.065,.02,.015,v1-v0-.1,1,0,null);
        platA(aT-run,aT,v0,v1,yt); }
      for(let k=0;k<N;k+=3){ const aT=a0-k*run, yt=yL+rise*(k+2); segP(P2(aT,v0-.05),P2(aT-3*run,v0-.05),yt-.5,yt+1.5,'🪜 Lan can cầu thang'.replace('🪜','🌿')); segP(P2(aT,v1+.05),P2(aT-3*run,v1+.05),yt-.5,yt+1.5,'🌿 Lan can cầu thang'); }
      { const B=K.Bld(), C2=K.Bld(); const top=(a)=>yL+rise*((a0-a)/run); for(let k=0;k<N;k+=2){ const aA=a0-k*run, aB=a0-(k+2)*run, pA=P2(aA,v0-.04), pB=P2(aB,v0-.04);
          K.quad(B,[pA[0],top(aA)+.02,pA[1]],[pB[0],top(aB)+.02,pB[1]],[pB[0],top(aB)+.98,pB[1]],[pA[0],top(aA)+.98,pA[1]],[radA(aA)[0]*-1,0,radA(aA)[1]*-1]);
          K.quad(C2,[pA[0],top(aA)+.98,pA[1]],[pB[0],top(aB)+.98,pB[1]],[pB[0],top(aB)+1.05,pB[1]],[pA[0],top(aA)+1.05,pA[1]],[0,1,0]); } IN.add(MT.glassR,K.toGeo(B)); IN.add(MT.gold,K.toGeo(C2));
        const hr=[]; for(let k=0;k<=N;k+=2){ const aa=a0-k*run, q=P2(aa,v1+.1); hr.push(new THREE.Vector3(q[0],top(aa)+.9,q[1])); } IN.add(MT.walnut,K.xf(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hr),48,.03,8,false),0,0,0)); }
      arcS(10.7,5.6,9.6,yL-.4,yL+1.8,'🌿 Gầm cầu thang – kho chứa'); }

    /* ============ TẦNG TRÊN: GÓC LÀM VIỆC + KỆ SÁCH KỊCH TRẦN ============ */
    { const y=yU; rb(MT.walnut,.62,10.9,y+2.05,.4,4.0,4.1,1,0,.02); for(let lv=0;lv<8;lv++){ rb(MT.walnut,.7,10.9,y+.25+lv*.5,.36,.03,4.0,1,0,.005); for(let q=0;q<22;q++) eb('box',MT.paint,.66,9.05+q*.17,y+.42+lv*.5,.24,.3+((q*7+lv)%4)*.03,.12,1,0,[0x8e1b22,0x1f3a5f,0x3f5f3a,0xd4af37,0x6a3f2a,0xd9c9a6][(q+lv)%6]); }
      blk(.62,10.9,4.15,.45,1,0,y,3,'📚 Kệ sách');
      rb(MT.walnut,2.6,10.9,y+.74,.8,.05,2.4,1,0,.02); for(const e of [-1,1]) rb(MT.walnut,2.6,10.9+e*1.1,y+.36,.75,.72,.05,1,0,.01); blk(2.6,10.9,2.45,.85,1,0,y,.8,'💻 Bàn làm việc đôi');
      for(const e of [-.55,.55]){ rb(M.black,2.35,10.9+e,y+1.08,.05,.4,.62,1,0,.01); eb('box',M.mon,2.38,10.9+e,y+1.08,.58,.35,.01,1,0,null);
        const cv=10.9+e; rb(M.black,3.45,cv,y+.48,.5,.08,.5,-1,0,.05); rb(M.black,3.7,cv,y+.85,.5,.62,.06,-1,0,.04); { const p=P2(3.45,cv); IN.cyl(MT.bronze,p[0],y+.24,p[1],0,.04,.44,.04); IN.cyl(MT.bronze,p[0],y+.03,p[1],0,.5,.03,.5); }
        circ(3.45,cv,.28,y,.9); bench(3.45,cv,-1,0,.45,y+.5,y,'💻 Ngồi làm việc (E · C)'); }
      { const p=P2(2.4,9.9); IN.cyl(MT.bronze,p[0],y+.95,p[1],0,.02,.4,.02); IN.geo(M.led,new THREE.ConeGeometry(.12,.14,16,1,true),p[0],y+1.18,p[1],0,1,1,1); } }
    /* ============ PHÒNG NGỦ MASTER (a 10,6–18,2) ============ */
    { const y=yU, ba=13.6, bv=7.0, fa=0, fv=-1, o=(u,w)=>off(ba,bv,fa,fv,u,w);
      { const pg=new THREE.PlaneGeometry(3.6,3.0); pg.rotateX(-Math.PI/2); put(IN,M.rug,pg,ba,5.6,y+.018,0,-1); }
      rb(MT.walnut,...o(0,0),y+.18,2.15,.36,2.25,fa,fv,.05); rb(M.cream,...o(0,.02),y+.47,2.0,.24,2.12,fa,fv,.1); rb(M.navy2,...o(0,.42),y+.6,2.06,.07,1.3,fa,fv,.04); rb(M.linen,...o(0,-.25),y+.62,2.06,.05,.32,fa,fv,.03);
      for(const u of [-.75,-.25,.25,.75]) rb(u*u<.1?M.linen:M.cream,...o(u,-.82),y+.69,.46,.16,.36,fa,fv,.07);
      for(let u=-1.15; u<=1.16; u+=.14) eb('box',MT.walnut,...o(u,-1.18),y+1.0,.08,1.6,.05,fa,fv,null); rb(MT.trav,...o(0,-1.2),y+1.95,2.6,.5,.04,fa,fv,.01); eb('box',M.led,...o(0,-1.16),y+1.68,2.4,.02,.02,fa,fv,null);
      for(const e of [-1,1]){ rb(MT.walnut,...o(e*1.45,-.85),y+.27,.5,.54,.42,fa,fv,.04); const q=P2(...o(e*1.45,-.85)); IN.geo(MT.gold,lathe([[0,0],[.06,0],[.04,.3],[0,.3]],12),q[0],y+.54,q[1],0,1,1,1); IN.geo(M.led,new THREE.CylinderGeometry(.11,.16,.22,16,1,true),q[0],y+.94,q[1],0,1,1,1); }
      rb(M.cream,...o(0,1.45),y+.24,1.5,.42,.42,fa,fv,.08); blk(...o(0,-.05),2.2,2.5,fa,fv,y,.7,'🛏️ Giường King'); blk(...o(0,1.45),1.55,.45,fa,fv,y,.5,'🛋️ Ghế cuối giường');
      bench(...o(0,.25),fa,fv,.8,y+.62,y,'🛏️ Nằm giường King – ngủ tới sáng (E · C)',true,()=>{ if((W.night||0)>.3 && W.setTime){ try{ W.setTime(0); }catch(e){} toast('😴 Một giấc ngon lành… trời đã sáng, nắng vịnh rọi qua kính',3200); } else toast('🛏️ Nằm thư giãn trên giường King – nệm êm, chăn mát',2400); }); bench(...o(0,1.45),fa,fv,1.2,y+.47,y,'🛋️ Ngồi ghế cuối giường (E · C)');
      palm(17.6,VGU+.5,y,.8); }
    /* ============ PHÒNG THAY ĐỒ (a 13–19, v 8,3–13): tủ kính cánh lùa khung đen LED + đảo phụ kiện ============ */
    { const y=yU, CL2=[0x2c3e50,0x8e1b22,0xd9c9a6,0x3f5f3a,0x1d1d20,0xb8915a];
      const ward=(a,v,len,fa,fv)=>{ const o=(u,w)=>off(a,v,fa,fv,u,w); rb(M.black,...o(0,-.24),y+1.25,len,2.5,.14,fa,fv,.02); for(const e of [-1,1]) rb(M.black,...o(e*(len/2-.02),0),y+1.25,.05,2.5,.62,fa,fv,.01); rb(M.black,...o(0,0),y+2.48,len,.05,.62,fa,fv,.01); rb(M.black,...o(0,0),y+.06,len,.12,.62,fa,fv,.01); eb('box',M.led,...o(0,.25),y+2.4,len-.1,.02,.03,fa,fv,null);
        { const nP=2, pw=len/nP; for(let i=0;i<nP;i++){ const c=o(-len/2+pw*(i+.5),.33+(i%2)*.05), p=P2(...c), m=new THREE.Mesh(RB(pw,2.36,.03,.01),MT.glassC); m.position.set(p[0],y+1.25,p[1]); m.rotation.y=yawAt(c[0],fa,fv); m.renderOrder=6; DY.add(m);
            const t=tanA(c[0]), d=radA(c[0]), ax=[-fv*t[0]+fa*d[0], -fv*t[1]+fa*d[1]]; ANIM.slide.push({mesh:m, p0:p, y:y+1.25, dir:ax, dist:i===0?pw*.94:0, k:0, open:false, grp:'ward'}); } }
        for(let u=-len/2+.12; u<len/2-.05; u+=.13) eb('box',MT.paint,...o(u,0),y+1.55,.04,.9,.42,fa,fv,CL2[Math.abs(Math.round(u*7))%6]); eb('box',MT.chrome,...o(0,0),y+2.05,len-.1,.02,.02,fa,fv,null); blk(...o(0,-.02),len,.66,fa,fv,y,2.4,'👔 Tủ kính'); };
      ward(16.0,VB-.4,5.6,0,-1); ward(13.45,10.6,3.0,1,0);
      rb(MT.walnut,16.2,10.6,y+.45,1.6,.9,1.0,0,-1,.03); rb(MT.glassR,16.2,10.6,y+.93,1.66,.04,1.06,0,-1,.01); for(let q=0;q<4;q++) eb('box',MT.paint,15.7+q*.33,10.6,y+1.05,.24,.18,.12,0,-1,CL2[q]); blk(16.2,10.6,1.65,1.05,0,-1,y,1,'💍 Đảo phụ kiện');
      inter(16.2,9.5,y,2.2,'👔 Mở / đóng tủ kính lùa (E)',()=>{ const op=!ANIM.slide.some(m=>m.grp==='ward' && m.open); for(const m of ANIM.slide) if(m.grp==='ward') m.open=op; if(op) toast('👔 Cánh kính lùa mở, đèn LED trong tủ sáng ấm – chọn trang phục nào',2400); }); }
    /* ============ PHÒNG TẮM MASTER (a 18,2–25,5): bồn oval đứng tự do nhìn ra kính, lavabo đôi + 2 gương bầu dục LED, buồng tắm kính đá đen, WC, giá khăn ============ */
    { const y=yU, ta=21.6, tv=VGU+1.35;
      const tubG=lathe([[0,0],[.5,0],[.62,.08],[.7,.45],[.74,.6],[.68,.62],[.6,.58],[.55,.14],[0,.14]],32); put(IN,M.cream,tubG,ta,tv,y,1,0,1,1,1.45); { const wg=new THREE.CircleGeometry(.55,28); wg.rotateX(-Math.PI/2); put(IN,M.water,wg,ta,tv,y+.48,1,0,1,1,1.42); }
      { const fc=[]; for(let i=0;i<=10;i++){ const t=i/10; fc.push(new THREE.Vector3(0,y+t*1.0,0)); } fc.push(new THREE.Vector3(0,y+1.05,.15)); fc.push(new THREE.Vector3(0,y+.95,.3)); const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fc),16,.02,6,false); put(IN,MT.gold,tg,ta+1.3,tv,0,-1,0); }
      blk(ta,tv,1.75,1.0,1,0,y,.7,'🛁 Bồn tắm'); bench(ta-.15,tv,1,0,.6,y+.26,y,'🛁 Nằm ngâm bồn tắm oval ngắm vịnh (E · C)',true,buff(6,'🛁 Nước ấm, vịnh lấp lánh ngoài kính – ⚡ khoẻ thêm 6 phút'));
      const va=SD-.45; rb(MT.walnut,va,5.4,y+.42,2.6,.8,.55,-1,0,.03); rb(MT.marble,va,5.4,y+.85,2.7,.06,.6,-1,0,.01); blk(va,5.4,2.7,.6,-1,0,y,1,'🪞 Lavabo đôi');
      for(const e of [-.65,.65]){ const p=P2(va,5.4+e); IN.geo(M.cream,lathe([[0,0],[.16,0],[.2,.1],[.22,.12],[0,.12]],18),p[0],y+.88,p[1],0,1.3,1,1);
        const mp=P2(SD-.17,5.4+e), m=new THREE.Mesh(new THREE.TorusGeometry(.36,.025,8,32),M.led); m.scale.set(.75,1,1); m.position.set(mp[0],y+1.7,mp[1]); m.rotation.y=yawAt(SD-.17,-1,0)+Math.PI/2; DY.add(m);
        const mr=new THREE.Mesh(new THREE.CircleGeometry(.35,28),M.mirror); mr.scale.set(.75,1,1); mr.position.set(mp[0],y+1.7,mp[1]); mr.rotation.y=yawAt(SD-.18,-1,0); DY.add(mr); }
      /* buồng tắm đứng kính – đá xám đen, sen mưa */ ringA(IN,MT.marbleD,21.0,SD-.15,VB-.12,VB-.05,y,y+2.6,{}); ringA(IN,MT.glassR,21.0,21.04,9.6,VB,y,y+2.2,{}); ringA(IN,MT.glassR,21.0,23.2,9.56,9.6,y,y+2.2,{}); radS(21.0,9.6,VB,y-.4,y+2.4,'🚿 Vách kính buồng tắm'); arcS(9.6,21.0,23.2,y-.4,y+2.4,'🚿 Vách kính buồng tắm');
      { const p=P2(23.6,11.6); IN.cyl(MT.chrome,p[0],y+2.35,p[1],0,.36,.03,.36); IN.cyl(MT.chrome,p[0],y+2.45,p[1],0,.02,.2,.02); const fl=new THREE.Mesh(new THREE.CylinderGeometry(.3,.16,2.3,16,1,true),M.flow); fl.position.set(p[0],y+1.17,p[1]); fl.visible=false; DY.add(fl); const F={mesh:fl, on:false}; ANIM.flows.push(F);
        inter(23.6,10.6,y,1.8,'🚿 Bật / tắt sen mưa (E)',()=>{ F.on=!F.on; if(F.on) toast('🚿 Sen mưa ấm áp – tỉnh cả người',1800); }); }
      toilet(19.7,12.4,y,0,-1); { const pts=[]; for(let i=0;i<=8;i++) pts.push(new THREE.Vector3(-.4+i*.1,y+1.25,0)); const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),8,.015,6,false); put(IN,MT.gold,tg,SD-.2,8.9,0,-1,0); eb('box',M.linen,SD-.24,8.9,y+1.05,.6,.4,.05,-1,0,null); } }
    /* ============ BAN CÔNG: bồn sục gỗ tròn + bậc cong, ghế mây + bàn trà, 2 ghế tắm nắng teak, quầy BBQ, cây chậu ============ */
    { const y=yL, vb=VOL/2, ja=3.2, jv=Math.max(VOL+1.3,vb), jr=1.05, p=P2(ja,jv);
      IN.geo(MT.walnut,new THREE.CylinderGeometry(jr,jr,.78,32,1,true),p[0],y+.39,p[1],0,1,1,1); for(let i=0;i<28;i++){ const t=i/28*TAU; E.box(MT.teak,p[0]+Math.cos(t)*(jr+.02),y+.39,p[1]+Math.sin(t)*(jr+.02),-t,.04,.8,.12,null); }
      IN.geo(MT.gold,new THREE.TorusGeometry(jr,.035,6,40),p[0],y+.79,p[1],0,1,1,1,Math.PI/2); const wg=new THREE.CircleGeometry(jr-.05,32); wg.rotateX(-Math.PI/2); const wm=new THREE.Mesh(wg,M.water); wm.position.set(p[0],y+.66,p[1]); DY.add(wm); ANIM.water=wm;
      for(let k=0;k<2;k++) ringA(IN,MT.teak,ja-.9,ja+.9,jv+jr+.02+k*.28,jv+jr+.3+k*.28,y,y+.42-k*.2,{});
      circles.push({x:p[0], z:p[1], r:jr+.05, y0:y-.4, y1:y+.7}); ao(ja,jv,y,2*jr,2*jr); bench(ja,jv,0,1,.6,y+.28,y,'♨️ Xuống bồn sục gỗ ngâm mình (E · C)',false,buff(6,'♨️ Bồn sục gỗ ấm sủi bọt, gió biển mát rượi – ⚡ khoẻ thêm 6 phút'));
      const rattan=(a,v,fa,fv)=>{ const o=(u,w)=>off(a,v,fa,fv,u,w); rb(M.rattan,...o(0,0),y+.22,.78,.4,.74,fa,fv,.08); rb(M.cream,...o(0,.04),y+.47,.62,.12,.6,fa,fv,.06); rb(M.rattan,...o(0,-.32),y+.68,.78,.56,.12,fa,fv,.06); circ(a,v,.4,y,.8); bench(...o(0,.08),fa,fv,.6,y+.5,y,'🌴 Ngồi ghế mây ngắm biển (E · C)'); };
      rattan(9.4,vb,1,0); rattan(11.6,vb,-1,0); rb(MT.teak,10.5,vb,y+.22,.7,.44,.7,1,0,.05); circ(10.5,vb,.4,y,.5);
      const lounger=(a)=>{ rb(MT.teak,a,vb,y+.2,.7,.12,Math.min(1.85,-VOL-.5),0,-1,.04); rb(M.cream,a,vb+.1,y+.32,.62,.08,Math.min(1.6,-VOL-.7),0,-1,.04); put(IN,MT.teak,RB(.66,.62,.07,.03),a,vb+Math.min(1.85,-VOL-.5)/2-.3,y+.55,0,-1,1,1,1,.62); put(IN,M.cream,RB(.6,.56,.06,.03),a,vb+Math.min(1.85,-VOL-.5)/2-.36,y+.58,0,-1,1,1,1,.62);
        blk(a,vb,.72,Math.min(1.85,-VOL-.5),0,-1,y,.5,'🌞 Ghế tắm nắng'); bench(a,vb-.3,0,-1,.6,y+.36,y,'🌞 Nằm ghế tắm nắng (E · C)',true); };
      lounger(14.6); lounger(16.0);
      rb(MT.trav,21.2,VOL+.55,y+.45,1.9,.9,.62,0,1,.03); rb(M.black,21.2,VOL+.55,y+.92,1.2,.05,.5,0,1,.01); rb(M.steel,21.2,VOL+.52,y+1.2,1.2,.5,.08,0,1,.03); blk(21.2,VOL+.55,1.95,.66,0,1,y,1,'🔥 Quầy BBQ');
      inter(21.2,VOL+1.5,y,1.8,'🔥 Nướng BBQ hải sản (E)',()=>toast('🔥 Xèo xèo… tôm hùm & sò điệp nướng bơ tỏi thơm lừng ban công',2600));
      palm(7.8,VOL+.5,y,.8); palm(24.6,VOL+.5,y,.9); palm(12.4,VOU+.5,yU,.7); }

    /* ============ ĐÈN HẮT VIỀN TRẦN CÁC PHÒNG (vật liệu tự phát sáng) ============ */
    for(const [a0,a1,v0,v1,y] of [[13.6,16.6,8.3,VB,CL],[16.6,SD,8.3,VB,CL],[.4,5.6,8.3,VB,CL],[10.6,18.2,VGU,8.3,CU],[13.0,19.0,8.3,VB,CU],[18.2,SD,VGU,VB,CU],[9.4,SD,0,8.3,CL]])
      for(const v of [v0+.2,v1-.2]) ringA(IN,M.led,a0+.25,a1-.25,v-.03,v+.03,y-.08,y-.04,{});

    /* ============ GOM HÌNH ============ */
    SH.build(root,{name:'aby-ph-shell-'+T.k, cast:true, dynamic:false}); IN.build(G,{name:'aby-ph-in-'+T.k}); E.build(G,{name:'aby-ph-inst-'+T.k});
    const cA=P2(SD/2,4), lp=P2(SD/2,8.3);
    lbl(`🏠 ${D.name}`, T.acad?'Tầng 10–11 · căn hộ mẫu 2 tầng thông tầng · cửa chính ở hành lang tầng 10':'Tầng 13–14 · căn hộ mẫu 2 tầng thông tầng · cửa chính ở hành lang tầng 13', {h:.42, x:cA[0], y:yL+4.6, z:cA[1], fade:30});
    { const ent=P2(SD+1.2,(DOOR_V[0]+DOOR_V[1])/2), inn=P2(SD-2.5,(DOOR_V[0]+DOOR_V[1])/2); PLACES.push({icon:'🏠', name:`Abyssal · ${D.name}`, sub:T.acad?'Tầng 10–11 Học viện · phòng khách thông tầng 8,7 m, bếp đảo, ban công bồn sục gỗ':'Tầng 13–14 Residences · phòng khách thông tầng 8,7 m, bếp đảo, ban công bồn sục gỗ',
      go:()=>{ teleport(ent[0],ent[1],inn[0],inn[1]); P.y=yL; P.vy=0; P.ground=true; }}); }
    /* ============ MỖI KHUNG HÌNH ============ */
    let tt=0; const center=P2(SD/2,5);
    const update=(dt)=>{ tt+=dt; const d=Math.hypot(P.x-center[0],P.z-center[1]), vis=d<70 && Math.abs(P.y-(yL+4))<40; if(G.visible!==vis) G.visible=vis; if(!vis) return;
      for(const dr of doors){ if(dr.open && Math.hypot(P.x-dr.c[0],P.z-dr.c[1])>12) dr.open=false; const want=dr.open?1:0; dr.k+=(want-dr.k)*Math.min(1,dt*5); dr.pv.rotation.y=dr.base+dr.k*1.45; dr.s.y0=dr.k>.35?1e6:dr.y0; }
      for(const m of ANIM.slide){ m.k+=((m.open?1:0)-m.k)*Math.min(1,dt*4); m.mesh.position.set(m.p0[0]+m.dir[0]*m.k*m.dist, m.y, m.p0[1]+m.dir[1]*m.k*m.dist); }
      for(const f of ANIM.flows) f.mesh.visible=f.on; if(ANIM.fridge){ const F2=ANIM.fridge; F2.k+=((F2.open?1:0)-F2.k)*Math.min(1,dt*4); F2.pv.rotation.y=F2.base+F2.sg*F2.k*1.6; }
      for(const f of ANIM.flames){ f.visible=ANIM.fire; const k=.75+.25*Math.abs(Math.sin(tt*6.3))*Math.abs(Math.sin(tt*2.7+1)); f.scale.set(1,k,1); }
      if(ANIM.water){ ANIM.water.position.y=yL+.66+Math.sin(tt*2.2)*.012; ANIM.water.rotation.y=tt*.15; } };
    const api={T, def:D, yL, yU, center, update, inside:(x,z,y)=>{ const dx=x-T.cx, dz=z-T.cz, r=Math.hypot(dx,dz); let a=Math.atan2(dz,dx); const lo=Math.min(T.aN,T.aF); while(a<lo-1) a+=TAU; const s=(a-T.aN)*T.sg*128, aa=(s-D.gable)*dir; return aa>-.3 && aa<SD+.3 && r>rOL-.2 && r<rBk+.2 && y>yL-1 && y<CU+.5; },
      ceilAt:(y)=>y<yU-1?CL:CU, pt:P2, SD, VB, VOL, VGU, DOOR_V, rooms:{living:P2(4.5,4), kitchen:P2(20,4), bedroom:P2(13.6,4.5), bath:P2(21.6,4), office:P2(2.6,10.9), balcony:P2(3.2,VOL/2), door:P2(SD+1,(DOOR_V[0]+DOOR_V[1])/2)}};
    out.push(api); }
  return out; }
