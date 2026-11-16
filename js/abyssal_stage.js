// QC World V2 – Đảo Abyssal · phiên B (abyss-sea), 17/11/2026 – QC LIVE STAGE MỚI 84 × 40 m: SÂN KHẤU NHẠC NƯỚC TỰ ĐỘNG (đặc tả Bình Phần 8.1)
//  • Bệ đá Obsidian giật cấp 3 bậc (Shape bo góc + ExtrudeGeometry bo cạnh), viền nẹp Vàng Champagne (TubeGeometry), dải LED dưới mặt nước đổi màu, vách cong phía sau có chữ.
//  • 160 vòi phun = 1 InstancedMesh (cột nước cộng sáng, màu LED theo từng vòi) + sương đỉnh vòi + bọt chân vòi (Points) → 6 lượt vẽ cho cả màn trình diễn.
//  • Mỗi 10 giây chuyển mượt (1,5 s) qua 6 hình: (1) Đôi Cánh Phượng Hoàng Lửa 32 m · (2) Trái Tim Đôi 26 m · (3) Hoa Sen Nở 3 Tầng · (4) Cầu Vồng & Xoắn Kép ADN ·
//    (5) Vũ Điệu Sóng Thần (sóng sin dài 84 m) · (6) Đại Bác Nước Chọc Trời 50 m. Không có người biểu diễn. Chỉ chạy khi người chơi trong 450 m.
// Vị trí: W.ABY.plots.stage = {x, z, yaw} (yaw: hướng khán giả = +z cục bộ). Chưa có W.ABY → HẰNG SỐ TẠM ngoài bờ Bắc đảo (−100, −205), quay về phía đảo.
import * as AK from './archKit.js';

export async function make(W, ctx={}){
  if(W.abyStage) return W.abyStage;
  const {THREE, scene, P, HOOK, PLACES, makeLabel, teleport} = W;
  const TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  const ABY=W.ABY||{}, WY=ABY.waterY ?? W.WATER_Y ?? -.35, PL=(ABY.plots||{}).stage, PRE=!PL;
  const ST=PL ? {x:PL.x, z:PL.z, yaw:PL.yaw??0} : {x:-100, z:-212, yaw:0};   /* TẠM = lô phiên A chốt 17/11 (ngoài bờ Bắc, khán giả trên đỉnh núi) – W.ABY.plots.stage ghi đè */
  const HW=42, HD=20, CR=8;   /* nửa dài, nửa rộng, bo góc */
  const G=new THREE.Group(); G.name='abyssal-stage'; G.position.set(ST.x,0,ST.z); G.rotation.y=ST.yaw; scene.add(G);
  const D=new THREE.Group(); D.userData.dynamic=true; G.add(D);
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.5, ...o});
  const M={ obs: std(0x1a202c,{roughness:.32, metalness:.45}), obs2: std(0x232a36,{roughness:.4, metalness:.35}), gold: std(0xd4af37,{roughness:.25, metalness:.88}),
    led: new THREE.MeshBasicMaterial({color:0x40e8ff, transparent:true, opacity:.85, blending:THREE.AdditiveBlending, depthWrite:false}) };
  const cvs=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; f(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  // hình chữ nhật bo góc thu vào d mét (toạ độ Shape: x, −z)
  const rr=(d)=>{ const w=HW-d, h=HD-d, r=Math.max(.5,CR-d), s=new THREE.Shape(); s.moveTo(-w+r,-h); s.lineTo(w-r,-h); s.quadraticCurveTo(w,-h,w,-h+r); s.lineTo(w,h-r); s.quadraticCurveTo(w,h,w-r,h); s.lineTo(-w+r,h); s.quadraticCurveTo(-w,h,-w,h-r); s.lineTo(-w,-h+r); s.quadraticCurveTo(-w,-h,-w+r,-h); return s; };
  const ring=(d0,d1)=>{ const s=rr(d0); s.holes.push(new THREE.Path(rr(d1).getPoints(12).reverse())); return s; };
  const ext=(shape,y0,h,bv=.06)=>{ const g=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.01,h-2*bv), bevelEnabled:true, bevelThickness:bv, bevelSize:bv, bevelSegments:3, curveSegments:10}); g.rotateX(-Math.PI/2); g.translate(0,y0+bv,0); return g; };
  const parts={obs:[], obs2:[], gold:[]};
  /* bệ 3 bậc giật cấp: viền ngoài cao +0,7 · bậc giữa +0,35 · bậc trong +0,1 (sát mặt nước) */
  parts.obs.push(ext(ring(0,1.6),WY-1.6,2.3)); parts.obs2.push(ext(ring(1.5,2.9),WY-1.6,1.95)); parts.obs.push(ext(ring(2.8,3.7),WY-1.6,1.72));
  const goldLine=(d,y)=>{ const pts=rr(d).getSpacedPoints(160).map(v=>new THREE.Vector3(v.x,y,-v.y)); parts.gold.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true,'centripetal'),320,.07,6,true)); };
  goldLine(.12,WY+.72); goldLine(1.5,WY+.72); goldLine(2.85,WY+.37);
  /* vách cong phía sau (đá Obsidian, nẹp vàng, chữ QC LIVE STAGE) */
  { const s=new THREE.Shape(), R0=60, a0=-.62, a1=.62, cz=-HD-3+R0; for(let i=0;i<=24;i++){ const a=lerp(a0,a1,i/24); const p=[Math.sin(a)*R0, cz-Math.cos(a)*R0]; i?s.lineTo(p[0],-p[1]):s.moveTo(p[0],-p[1]); } for(let i=24;i>=0;i--){ const a=lerp(a0,a1,i/24); const p=[Math.sin(a)*(R0+1.4), cz-Math.cos(a)*(R0+1.4)]; s.lineTo(p[0],-p[1]); }
    parts.obs.push(ext(s,WY-1.2,8.2,.08)); for(const y of [WY+7.02,WY+.9]){ const pts=[]; for(let i=0;i<=40;i++){ const a=lerp(a0,a1,i/40); pts.push(new THREE.Vector3(Math.sin(a)*(R0-.04),y,cz-Math.cos(a)*(R0-.04))); } parts.gold.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),80,.09,6,false)); }
    const tx=cvs(1024,128,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='#d4af37'; g.font='bold 96px Georgia, serif'; g.textAlign='center'; g.textBaseline='middle'; g.shadowColor='rgba(255,210,120,.6)'; g.shadowBlur=12; g.fillText('QC  LIVE  STAGE',w/2,h/2+4,w-40); });
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(26,3.25),new THREE.MeshBasicMaterial({map:tx, transparent:true, depthWrite:false})); sg.position.set(0,WY+4.4,cz-R0+1.65);   /* đặt trước mặt cong của vách (võng 1,4 m ở mép chữ) */ D.add(sg); M.sign=sg.material; }
  for(const k of ['obs','obs2','gold']){ const g=W.mergeGeometries(parts[k].map(x=>x.index?x.toNonIndexed():x).map(x=>{ for(const a of Object.keys(x.attributes)) if(!['position','normal','uv'].includes(a)) x.deleteAttribute(a); return x; }),false); const m=new THREE.Mesh(g,M[k]); m.castShadow=true; m.receiveShadow=true; m.name='abyssal-stage-'+k; G.add(m); }
  /* dải LED dưới nước (vòng sát bậc trong) */ { const s=ring(3.75,4.25); const g=new THREE.ShapeGeometry(s,8); g.rotateX(-Math.PI/2); const m=new THREE.Mesh(g,M.led); m.position.y=WY+.03; m.renderOrder=3; D.add(m); }

  /* ============================== 160 VÒI PHUN ============================== */
  const J=[]; const add=(x,z,g,j,n)=>J.push({x,z,g,j,n});
  for(let i=0;i<64;i++) add(-37.8+i*75.6/63, 12, 'A', i, 64);
  for(let i=0;i<48;i++){ const a=i/48*TAU; add(Math.cos(a)*28, -1+Math.sin(a)*9, 'B', i, 48); }
  for(let i=0;i<32;i++) add(-15+(i%16)*2, -1+(i<16?-1.6:1.6), 'C', i, 32);
  for(let i=0;i<16;i++) add(-35+i*70/15, -13, 'D', i, 16);
  const NJ=J.length;   /* = 160 */
  const alpha=cvs(8,128,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(.12,'#777'); gr.addColorStop(.6,'#ddd'); gr.addColorStop(1,'#fff'); g.fillStyle=gr; g.fillRect(0,0,w,h); for(let i=0;i<40;i++){ g.fillStyle=`rgba(0,0,0,${Math.random()*.4})`; g.fillRect(Math.random()*w,Math.random()*h,1,6+Math.random()*20); } });
  const jetGeo=new THREE.CylinderGeometry(.1,.3,1,8,4,true); jetGeo.translate(0,.5,0);
  const jetMat=new THREE.MeshBasicMaterial({color:0xffffff, alphaMap:alpha, transparent:true, opacity:.5, depthWrite:false, side:THREE.DoubleSide});   /* ban ngày: nước trắng trong · đêm: cộng sáng màu LED */
  const JM=new THREE.InstancedMesh(jetGeo,jetMat,NJ); JM.frustumCulled=false; JM.userData.dynamic=true; JM.renderOrder=4; D.add(JM);
  const noz=new THREE.InstancedMesh(new THREE.CylinderGeometry(.22,.28,.16,10), std(0x2a2f38,{metalness:.7, roughness:.3}), NJ); noz.userData.dynamic=true; D.add(noz);
  { const m=new THREE.Matrix4(); J.forEach((o,i)=>{ m.makeTranslation(o.x,WY+.02,o.z); noz.setMatrixAt(i,m); }); noz.instanceMatrix.needsUpdate=true; }
  const soft=cvs(64,64,(g,w,h)=>{ const gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.4,'rgba(255,255,255,.45)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
  const pts=(n,size,op)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*3),3)); g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(n*3),3)); const p=new THREE.Points(g,new THREE.PointsMaterial({size, map:soft, vertexColors:true, transparent:true, opacity:op, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true})); p.frustumCulled=false; p.userData.dynamic=true; p.renderOrder=5; D.add(p); return p; };
  const MIST=pts(NJ*2,2.6,.32), SPL=pts(NJ,1.6,.55);
  // 6 hình nước: mỗi vòi → chiều cao h, nghiêng quanh z (rz: lệch theo x) và quanh x (rx: lệch về khán giả), màu
  const C=new THREE.Color(), hsl=(h,s,l)=>C.setHSL(((h%1)+1)%1,s,l);
  const NAMES=['🔥 Đôi Cánh Phượng Hoàng Lửa','💞 Trái Tim Đôi Khổng Lồ','🌸 Hoa Sen Nở 3 Tầng','🌈 Cầu Vồng & Xoắn Kép ADN','🌊 Vũ Điệu Sóng Thần','💥 Đại Bác Nước Chọc Trời'];
  function pat(p,o,t,out){ const x=o.x, z=o.z, u=x/38, g=o.g; let h=0, rz=0, rx=0;
    if(p===0){ /* phượng hoàng: cánh xoè 2 bên cao dần tới 32 m, thân giữa, đuôi ngả sau */
      if(g==='A'){ const k=Math.pow(Math.abs(u),.85); h=5+27*k*(.86+.14*Math.sin(t*2.4-Math.abs(x)*.12)); rz=-Math.sign(x)*(.12+.5*k); rx=-.12; }
      else if(g==='B'){ h=8+2.5*Math.sin(t*3+o.j*.5); rz=-(x/28)*.35; } else if(g==='C'){ h=15+4*Math.sin(t*1.7+o.j*.4); } else { h=20+6*Math.sin(t*1.3+o.j); rx=-.4; rz=-(x/35)*.25; }
      hsl(.02+.1*clamp(h/32,0,1),1,.5+.12*clamp(h/32,0,1)); }
    else if(p===1){ /* 2 trái tim cao 26 m tâm x = ±18 + nhịp tim */ const beat=Math.exp(-((t*1.4)%1)*6)*.5+Math.exp(-(((t*1.4)+.72)%1)*9)*.3;
      if(g==='A'){ const cx=x<0?-18:18, dx=x-cx, uu=dx/14; if(Math.abs(uu)<=1){ const top=.6+.4*Math.sqrt(Math.max(0,1-Math.pow((Math.abs(uu)-.5)/.5,2))); h=26*top*(1+.08*beat); rz=Math.sign(dx)*.32*Math.abs(uu); } else h=1.2; }
      else if(g==='D'){ h=0; } else { h=4+5*beat; }
      hsl(.95+.03*Math.sin(t+o.j),.9,.55+.15*beat); }
    else if(p===2){ /* hoa sen 3 tầng: nhuỵ thẳng · tầng giữa xoè 0,55 · cánh ngoài ngả về khán giả */
      if(g==='C'){ h=13+2*Math.sin(t*2+o.j*.3); hsl(.13,.9,.75); }
      else if(g==='B'){ const dx=o.x/28, dz=(o.z+1)/9, L=Math.hypot(dx,dz)||1; h=10.5; rz=-dx/L*.55; rx=dz/L*.55; hsl(.93,.75,.72); }
      else if(g==='A'){ h=6.5+1.2*Math.sin(t*1.5+o.j*.2); rx=.75; rz=-u*.3; hsl(.9,.8,.62); } else { h=6.5; rx=-.65; hsl(.9,.8,.62); } }
    else if(p===3){ /* cầu vồng (vòi trước bắt chéo) + xoắn kép ADN (2 hàng giữa) */
      if(g==='A'){ h=14+1.5*Math.sin(t*2+o.j*.3); rz=(o.j%2?1:-1)*.75; hsl((u+1)/2*.83,1,.55); }
      else if(g==='C'){ const ph=o.j<16?0:Math.PI; h=12+8*Math.sin(x*.42+t*3+ph); hsl(o.j<16?.52:.83,1,.6); }
      else if(g==='B'){ h=2.5; hsl(.6,.7,.6); } else { h=17+4*Math.sin(t*1.2+o.j*.7); hsl(.75,.8,.62); } }
    else if(p===4){ /* sóng thần: sóng sin chạy dọc 84 m */ const wv=Math.sin(x*(TAU/42)-t*2.6+(g==='B'?1.2:g==='D'?2.4:0));
      if(g==='C'){ h=6+2*wv; } else { h=10+8*wv; rx=g==='A'?.25:0; } hsl(.55+.06*wv,.95,.45+.15*(wv*.5+.5)); }
    else { /* đại bác nước 50 m */
      if(g==='D'){ h=50*(.9+.1*Math.sin(t*5+o.j)); hsl(.12,.4,.85); } else if(g==='C'){ h=22+3*Math.sin(t*4+o.j); hsl(.12,.5,.8); } else if(g==='B'){ h=8; rz=-(x/28)*.25; rx=((o.z+1)/9)*.25; hsl(.58,.6,.7); } else { h=3.5+.8*Math.sin(t*6+o.j); hsl(.58,.6,.7); } }
    out.h=h; out.rz=rz; out.rx=rx; out.r=C.r; out.g=C.g; out.b=C.b; return out; }
  const A={}, B={}, _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _p=new THREE.Vector3(), _s=new THREE.Vector3(), _u=new THREE.Vector3();
  let cur=-1, on=false, t0=0;
  const label=makeLabel('🎆 QC Live Stage – Nhạc nước tự động', '84 × 40 m · 160 vòi · 6 hình nước đổi mỗi 10 giây', {h:.6, x:ST.x, y:WY+12, z:ST.z, fade:320});
  const WHITE=new THREE.Color(1,1,1); let dayMix=.6;
  function update(T){ dayMix=.62*(1-(W.night||0)); const pt=Math.floor(T/10), p=pt%6, q=(p+1)%6, f=ss(8.5,10,T%10); if(p!==cur){ cur=p; if(on && W.toast && Math.hypot(P.x-ST.x,P.z-ST.z)<220) W.toast('⛲ QC Live Stage: '+NAMES[p],2200); }
    const mp=MIST.geometry.attributes.position, mc=MIST.geometry.attributes.color, sp=SPL.geometry.attributes.position, sc=SPL.geometry.attributes.color;
    for(let i=0;i<NJ;i++){ const o=J[i]; pat(p,o,T,A); if(f>0) pat(q,o,T,B); const h=Math.max(0,lerp(A.h,f>0?B.h:A.h,f)), rz=lerp(A.rz,f>0?B.rz:A.rz,f), rx=lerp(A.rx,f>0?B.rx:A.rx,f), r=lerp(A.r,f>0?B.r:A.r,f), g=lerp(A.g,f>0?B.g:A.g,f), b=lerp(A.b,f>0?B.b:A.b,f);
      const w=.5+h*.028; _e.set(rx,0,rz,'XYZ'); _q.setFromEuler(_e); _m.compose(_p.set(o.x,WY+.05,o.z),_q,_s.set(w,Math.max(.01,h),w)); JM.setMatrixAt(i,_m); C.setRGB(r,g,b); if(dayMix>0) C.lerp(WHITE,dayMix); JM.setColorAt(i,C);
      _u.set(0,h,0).applyQuaternion(_q); const tx=o.x+_u.x, ty=WY+_u.y, tz=o.z+_u.z, k=clamp(h/6,0,1);
      mp.setXYZ(i*2,tx,ty,tz); mp.setXYZ(i*2+1,tx+_u.x*.08+Math.sin(T*3+i)*.6,ty-1.2-h*.05,tz+_u.z*.08); mc.setXYZ(i*2,r*k,g*k,b*k); mc.setXYZ(i*2+1,r*k*.7,g*k*.7,b*k*.7);
      sp.setXYZ(i,o.x+Math.sin(T*7+i*1.3)*.2,WY+.25,o.z); sc.setXYZ(i,.8*k,.85*k,.9*k); }
    JM.instanceMatrix.needsUpdate=true; JM.instanceColor.needsUpdate=true; mp.needsUpdate=mc.needsUpdate=sp.needsUpdate=sc.needsUpdate=true;
    const nt=W.night||0; MIST.material.size=2.6+nt*1.2; jetMat.opacity=.5+nt*.15; const bl=nt>.3?THREE.AdditiveBlending:THREE.NormalBlending; if(jetMat.blending!==bl){ jetMat.blending=bl; jetMat.needsUpdate=true; } hsl(T*.05,1,.55); M.led.color.copy(C); M.led.opacity=.55+(W.night||0)*.4; }
  if(PRE) PLACES.push({icon:'⛲', name:'QC Live Stage (nhạc nước mới)', sub:'84 × 40 m · 160 vòi · 6 hình nước', go:()=>{ let d=31; while(d<90 && W.groundH(ST.x-Math.sin(ST.yaw)*0+Math.sin(ST.yaw)*d, ST.z+Math.cos(ST.yaw)*d)<.5) d+=3; teleport(ST.x+Math.sin(ST.yaw)*d, ST.z+Math.cos(ST.yaw)*d, ST.x, ST.z); }});   /* điểm nhìn: chỗ đất liền gần nhất phía khán giả */
  let tt=0; HOOK.onFrame.push((dt)=>{ tt+=Math.min(dt||1/60,.1); const T=(W.T||tt)+api.tOff, d=Math.hypot(P.x-ST.x,P.z-ST.z), want=d<450; if(want!==on){ on=want; D.visible=on; } if(on) update(T); });
  const hit=(x,z,pad=0)=>{ const dx=x-ST.x, dz=z-ST.z, c=Math.cos(ST.yaw), s=Math.sin(ST.yaw), lx=dx*c-dz*s, lz=dx*s+dz*c; return Math.abs(lx)<HW+pad && lz>-HD-6-pad && lz<HD+pad; };
  const api={ tOff:0, pos:ST, pre:PRE, jets:NJ, NAMES, get pattern(){ return cur; }, hit, update,
    soundList(){ return on && Math.hypot(P.x-ST.x,P.z-ST.z)<120 ? [{kind:'water', id:'aby-stage', x:ST.x, y:WY+3, z:ST.z}] : []; } };
  W.abyStage=api; return api; }
