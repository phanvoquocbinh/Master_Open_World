// QC World V2 – PHA 6: DEV CITY · CÔNG TRÌNH (gọi từ js/devcity_chongqing.js sau khi dựng địa hình + đường)
//  🏙️ DEV SKY-CRYSTAL: 4 tháp cánh buồm 115 m bên sông + ống kính ngang "The Crystal" 140 × 24 m ở +92…+100 (vườn nhiệt đới, hồ bơi vô cực, sàn kính, 5 lớp học Dev)
//  🏮 LẦU VÁCH ĐÈN LỒNG: phố cổ 11 tầng nhà sàn gỗ bám vách (+2 → +46), đèn lồng, cầu thang bộ ngoài trời đi xuyên 11 tầng lên đại lộ trên núi, quán lẩu / mì / trà
//  🚝 DEV RESIDENCY TOWER: chung cư 18 tầng, khoét rỗng tầng 6–8 làm ga tàu điện Xuyên Lầu; bán / thuê căn hộ (luật V2: nội đô chỉ có căn hộ)
//  🏨 khách sạn 5 sao · 🏥 bệnh viện Sơn Thành (sân đỗ trực thăng) · 🚒 trạm cứu hoả · 🏫 trường liên cấp + sân thể thao · cao ốc thương mại / văn phòng
//  🏞️ Công viên hồ Thiên Cảnh (+52): đường dạo, cầu chữ chi, cầu vòm, đình giữa đảo · ✈️ Sân bay đỉnh núi (+85): đường băng, nhà ga, đài kiểm soát, máy bay cất cánh
//  🛕 LINH SƠN VÂN TỰ: cổng Tam Quan đá, bảo tháp bát giác 9 tầng 54 m, cầu xích sắt ~80 m qua hẻm vực, chánh điện treo vách nửa trong hang, tượng Phật 32 m trong mây
import * as AK from './archKit.js';
import { makeLift, makeLiftBank } from './liftkit.js';
import { compactGroup } from './perf.js';
import { createGFX, Kit as GKit, cbox, planeM, cylM } from './gfxkit.js';
import { furnitureLib } from './furniture_lib.js';   // 21/11 phiên A: ghế/sofa/bàn trà showroom dùng W.FURN

export async function build(K){
  const {W, ctx, root, MAT, FAC, put, xf, rb, cyl, beam, inst, canvas, std, ss, R, hAt, Y1, Y2, Y3, Y4, YW, LAKE, PA, PB, abu, STAIR, ST, NIGHTL, deck, shoreD} = K;
  const {THREE, INTER, PLACES, addPlat, addSeg, makeLabel, toast, teleport, boxes, circles, P, HOOK, clamp, lerp} = W;
  const V3=THREE.Vector3, TAU=Math.PI*2;
  const out={};
  const OCC=[];   // dấu chân công trình (để rải cây không đè lên)
  const occ=(x0,x1,z0,z1)=>OCC.push({x0:Math.min(x0,x1), x1:Math.max(x0,x1), z0:Math.min(z0,z1), z1:Math.max(z0,z1)});
  const block=(x0,x1,z0,z1,y0,y1,msg)=>{ boxes.push({x0:Math.min(x0,x1), x1:Math.max(x0,x1), z0:Math.min(z0,z1), z1:Math.max(z0,z1), y0, y1, msg}); occ(x0,x1,z0,z1); };
  const label=(t,s,x,y,z,f=300,h=.7)=>makeLabel && makeLabel(t, s, {x, y, z, h, fade:f});
  const place=(icon,name,sub,x,z,lx,lz)=>PLACES && PLACES.push({icon, name, sub, go:()=>teleport(x,z,lx,lz)});
  const S=ctx.S||{}, save=ctx.save||(()=>{}), askPay=ctx.askPay, spend=ctx.spend, fmt=ctx.fmt||(n=>n);

  /* ============================== KHỐI LĂNG TRỤ (UV mặt tiền theo mét, mép trên = ranh giới tầng) ============================== */
  function prism(pts, y0, y1, fac, dist, o={}){ const t=(fac.userData && fac.userData.tile)||{w:12, h:12.8}, n=pts.length, pos=[], uv=[];
    let A=0; for(let i=0;i<n;i++){ const [x0,z0]=pts[i], [x1,z1]=pts[(i+1)%n]; A+=x0*z1-x1*z0; }
    let acc=o.u0||0; for(let i=0;i<n;i++){ const [ax,az]=pts[i], [bx,bz]=pts[(i+1)%n], L=Math.hypot(bx-ax,bz-az); if(L<1e-4) continue;
      const u0=acc/t.w, u1=(acc+L)/t.w, v0=(y0-y1)/t.h; acc+=L;
      const q=[[ax,y0,az,u0,v0],[bx,y0,bz,u1,v0],[bx,y1,bz,u1,0],[ax,y1,az,u0,0]], tris=A>0 ? [[0,2,1],[0,3,2]] : [[0,1,2],[0,2,3]];
      for(const tr of tris) for(const k of tr){ pos.push(q[k][0],q[k][1],q[k][2]); uv.push(q[k][3],q[k][4]); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.computeVertexNormals(); put(fac, g, dist);
    if(o.cap!==false){ const c=capGeo(pts, y1); put(o.roof || MAT.roofDark, c, dist); }
    return g; }
  function capGeo(pts, y){ const v2=pts.map(([x,z])=>new THREE.Vector2(x,z)), tri=THREE.ShapeUtils.triangulateShape(v2, []), pos=[], uv=[];
    for(const [a,b,c] of tri){ let A=pts[a], B=pts[b], C=pts[c]; const ny=(B[1]-A[1])*(C[0]-A[0])-(B[0]-A[0])*(C[1]-A[1]); if(ny<0){ const t=B; B=C; C=t; } for(const P2 of [A,B,C]){ pos.push(P2[0],y,P2[1]); uv.push(P2[0]/8,P2[1]/8); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.computeVertexNormals(); return g; }
  function rrect(cx,cz,w,d,r,rot=0,seg=3){ r=Math.min(r, w/2-.01, d/2-.01); const pts=[], hw=w/2-r, hd=d/2-r;
    for(const [x,z,a0] of [[hw,hd,0],[-hw,hd,Math.PI/2],[-hw,-hd,Math.PI],[hw,-hd,1.5*Math.PI]]) for(let k=0;k<=seg;k++){ const a=a0+k/seg*Math.PI/2; pts.push([x+Math.cos(a)*r, z+Math.sin(a)*r]); }
    const c=Math.cos(rot), s=Math.sin(rot); return pts.map(([x,z])=>[cx+x*c+z*s, cz-x*s+z*c]); }
  function lens(cx,cz,L,Wd,rot=0,n=32){ const pts=[]; for(let i=0;i<n;i++){ const a=i/n*TAU, s=Math.sin(a), c=Math.cos(a); pts.push([L/2*c, Wd/2*Math.sign(s)*Math.pow(Math.abs(s),1.35)]); }
    const cr=Math.cos(rot), sr=Math.sin(rot); return pts.map(([x,z])=>[cx+x*cr+z*sr, cz-x*sr+z*cr]); }
  // cao ốc: bệ 2 tầng + thân + tầng đỉnh lùi + thiết bị mái
  function tower(o){ const {x, z, w, d, h, y0, fac, dist='t3', r=2.5, rot=0} = o; const top=y0+h;
    if(o.podium!==false) prism(rrect(x,z,w+6,d+6,r+1.5,rot), y0, y0+7, FAC.office, dist, {roof:MAT.paving});
    prism(rrect(x,z,w,d,r,rot), y0+(o.podium===false?0:7), top, fac, dist, {u0:R()*12});
    prism(rrect(x,z,w*.78,d*.78,r*.8,rot), top, top+4.2, fac, dist, {u0:R()*12});
    for(let k=0;k<3;k++){ const ox=(R()-.5)*w*.4, oz=(R()-.5)*d*.4; put(MAT.steel, xf(rb(3+R()*3,1.8,2.5+R()*2,.2,1), x+ox, top+4.2+.9, z+oz, rot), dist); }
    if(o.antenna) put(MAT.steel, xf(cyl(.18,.3,o.antenna,8), x, top+4.2+o.antenna/2, z), dist);
    const W2=(w+6)/2, D2=(d+6)/2; if(Math.abs(rot)<.01) block(x-W2, x+W2, z-D2, z+D2, y0-3, top+6, o.msg || 'Toà nhà'); else { circles.push({x, z, r:Math.max(w,d)/2+2, y0:y0-3, y1:top}); occ(x-W2,x+W2,z-D2,z+D2); }
    if(o.name) label(o.name, o.sub||'', x, top+10, z, 240, .6); return top; }
  // bảng hiệu phát sáng (canvas)
  function sign(text, w, h, x, y, z, ry=0, o={}){ const t=canvas(1024, Math.round(1024*h/w), (g,W2,H2)=>{ g.fillStyle=o.bg||'#10233d'; g.fillRect(0,0,W2,H2); g.strokeStyle=o.edge||'#e2b24a'; g.lineWidth=H2*.06; g.strokeRect(H2*.05,H2*.05,W2-H2*.1,H2-H2*.1);
      g.fillStyle=o.fg||'#ffe6a8'; g.font=`bold ${Math.round(H2*.5)}px "Segoe UI",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText(text, W2/2, H2/2+H2*.03, W2*.92); });
    const m=std({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:o.glow??.55, roughness:.5}); const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h), m); p.position.set(x,y,z); p.rotation.y=ry; root.add(p); return p; }

  /* ============================== 🏙️ DEV SKY-CRYSTAL (T1, x 420–560) ============================== */
  { const Z=-198, xs=[437.5,472.5,507.5,542.5], dist='crystal', FY=93.2;
    for(const x of xs){ prism(lens(x,Z,26,15), Y1, 92, FAC.glass, dist, {u0:x}); prism(lens(x,Z+1,24,13.5), 100, 112, FAC.glass, dist, {u0:x+3}); prism(lens(x,Z+1.6,19,10), 112, 117, FAC.glass, dist, {u0:x+5});
      for(const s of [-1,1]) put(MAT.white, xf(rb(1.4, 115, 1.8, .5, 2), x+s*13, Y1+57.5, Z), dist);                  // sống cánh buồm trắng
      put(MAT.white, xf(rb(17, .5, 6, .2, 1), x, 8, Z+10.5), dist); for(const s of [-1,1]) put(MAT.steel, xf(cyl(.25,.25,6,10), x+s*7, 5, Z+12.6), dist);   // sảnh: mái hiên
      block(x-13, x+13, Z-7.5, Z+7.5, -5, 92, 'Tháp DEV SKY-CRYSTAL'); boxes.push({x0:x-5, x1:x+5, z0:Z-4, z1:Z+4, y0:91, y1:118, msg:'Lõi thang máy tháp'});
    }
    /* S19g 16/11 (V2_PLAN 3b): thang dịch chuyển cũ → 2 dãy thang liftkit ở khe giữa các tháp (x 455, 490): cửa mở ra phố ở mặt đất, mở vào ống kính ở +93 */
    const LIFTX=[455, 490]; for(const lx of LIFTX){ const gy=hAt(lx, Z+5)??Y1; makeLiftBank(W, {x:lx, z:Z+3, yaw:0, count:2, name:'Thang The Crystal '+(lx<470?'Tây':'Giữa'), color:0x7fd3ff,
      floors:[{y:gy, name:'Mặt đất · Đại lộ Bến Sông', short:'G'}, {y:FY+.03, name:'THE CRYSTAL · vườn trên mây (+93 m)', short:'93'}]}); }
    // ống kính ngang 140 × 24 × 8 m: vỏ kính bo tròn + khung sườn trắng + sàn (đoạn đầu Tây là sàn kính) + vườn + hồ bơi + 5 lớp học
    const sh=new THREE.Shape(), hw=12, hh=4, r=3.6; sh.moveTo(-hw+r,-hh); sh.lineTo(hw-r,-hh); sh.quadraticCurveTo(hw,-hh,hw,-hh+r); sh.lineTo(hw,hh-r); sh.quadraticCurveTo(hw,hh,hw-r,hh); sh.lineTo(-hw+r,hh); sh.quadraticCurveTo(-hw,hh,-hw,hh-r); sh.lineTo(-hw,-hh+r); sh.quadraticCurveTo(-hw,-hh,-hw+r,-hh);
    const tube=new THREE.ExtrudeGeometry(sh, {depth:140, bevelEnabled:false, curveSegments:8}); tube.rotateY(Math.PI/2); tube.translate(420, 96, Z); put(MAT.glass, tube, dist);
    for(let x=420; x<=560; x+=7){ for(const [w2,h2,oy,oz] of [[.7,.5,4,0],[.7,.5,-4,0]]) put(MAT.white, xf(rb(w2, h2, 23, .15, 1), x, 96+oy, Z+oz), dist); for(const s of [-1,1]) put(MAT.white, xf(rb(.7, 7, .5, .15, 1), x, 96, Z+s*11.8), dist); }
    put(MAT.dark, xf(rb(141, .7, 24.5, .3, 2), 490, 91.9, Z), dist);
    put(MAT.paving, xf(rb(119, .25, 22, .05, 1), 500.5, FY-.12, Z), dist); put(MAT.glass, xf(rb(20.5, .18, 22, .05, 1), 430.3, FY-.09, Z), dist);   // sàn kính nhìn xuống sông
    addPlat(490, Z, 0, 70, 11, FY); addSeg(420,Z-11.4,560,Z-11.4,.3,FY-1,FY+6,'Vách kính The Crystal'); addSeg(420,Z+11.4,560,Z+11.4,.3,FY-1,FY+6,'Vách kính The Crystal'); addSeg(420.4,Z-12,420.4,Z+12,.3,FY-1,FY+6,'Vách kính The Crystal'); addSeg(559.6,Z-12,559.6,Z+12,.3,FY-1,FY+6,'Vách kính The Crystal');
    // hồ bơi vô cực đầu Đông
    put(MAT.pool, xf(rb(28, .5, 13, .1, 1), 541, FY+.15, Z+2), dist); put(MAT.glass, xf(rb(28, 1, .12, .03, 1), 541, FY+.5, Z+8.6), dist);
    // vườn nhiệt đới + 5 lớp học kính
    const palmT=inst(cyl(.18,.28,5,7), MAT.bark), palmL=inst(new THREE.IcosahedronGeometry(1.6,1), MAT.leaf);
    for(let x=452; x<=520; x+=6) for(const s of [-1,1]){ if(s<0 && x<518) continue; if(s>0 && LIFTX.some(lx=>Math.abs(x-lx)<4.6)) continue;   /* chừa lối trước cửa thang */ palmT.add(x, FY+2.5, Z+s*7.5); palmL.add(x, FY+5.4, Z+s*7.5, R()*3, 1, .75); put(MAT.paving, xf(rb(2.6,.6,2.6,.15,1), x, FY+.3, Z+s*7.5), dist); boxes.push({x0:x-1.35, x1:x+1.35, z0:Z+s*7.5-1.35, z1:Z+s*7.5+1.35, y0:FY-.5, y1:FY+3, msg:'🌴 Bồn cây'}); }   /* S19g rà soát: bồn cây có va chạm (trước đi xuyên); bỏ hàng cọ trùng lặp ở Z+7,5 */
    palmT.build(); palmL.build();
    ['Backend','Frontend','System Design','DevOps','AI'].forEach((nm,i)=>{ const x=448+i*15, z=Z-6.5; put(MAT.glass, xf(rb(11, 3.4, 7, .3, 2), x, FY+1.7, z), dist); put(MAT.white, xf(rb(11.2, .25, 7.2, .1, 1), x, FY+3.45, z), dist);
      sign('LỚP '+nm.toUpperCase(), 7, .9, x, FY+2.9, z+3.55, 0, {bg:'#0e3b5c', fg:'#d8f1ff', edge:'#7fd3ff'});
      INTER.push({x, z:z+4.8, r:3.2, prio:.3, when:()=>P.y>90, label:`💻 Lớp ${nm} – học thử khoá Dev (E)`, action:()=>toast(`💻 Khoá ${nm} đang được biên soạn – sẽ mở trong bản cập nhật tới. Ghé lại sau nhé!`, 3600)}); });
    sign('DEV SKY-CRYSTAL', 26, 3.2, 490, 101.6, Z+12.3, 0, {glow:.8});
    label('🏙️ DEV SKY-CRYSTAL', '4 tháp 115 m · ống kính ngang 140 m ở +93 m', 490, 124, Z, 420, .9);
    place('🏙️','Dev City – The Crystal (+93 m)','Vườn trên mây · hồ bơi vô cực · sàn kính', 445, Z+6, 430, Z); }

  /* ============================== 🏮 LẦU VÁCH ĐÈN LỒNG – phố cổ 11 tầng treo vách (x 148–228) ============================== */
  { const dist='hyd', X0=148, X1=228, BACK=-233, FL=4, N=11;
    const front=k=>-(196+k*.8);
    const wallTex=canvas(512,256,(g,w,h)=>{ g.fillStyle='#4a2a16'; g.fillRect(0,0,w,h);
      for(let x=8;x<w;x+=64){ g.fillStyle='#2a170b'; g.fillRect(x-6,0,6,h); g.fillStyle='#f6c37a'; g.fillRect(x+4,40,48,150); g.strokeStyle='#5a3218'; g.lineWidth=3; for(let k=0;k<6;k++){ g.beginPath(); g.moveTo(x+4,40+k*25); g.lineTo(x+52,40+k*25); g.stroke(); } for(let k=0;k<4;k++){ g.beginPath(); g.moveTo(x+4+k*16,40); g.lineTo(x+4+k*16,190); g.stroke(); } }
      g.fillStyle='#3a200e'; g.fillRect(0,0,w,26); g.fillRect(0,h-40,w,40); });
    const wallEm=canvas(512,256,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); for(let x=8;x<w;x+=64){ g.fillStyle=`rgba(255,${150+R()*60|0},70,${.55+R()*.4})`; g.fillRect(x+6,42,44,146); } });
    const hydWall=std({map:wallTex, emissive:0xffffff, emissiveMap:wallEm, emissiveIntensity:.06, roughness:.7}); NIGHTL.push(hydWall); hydWall.userData.nightK=1;
    const tileM=std({map:canvas(256,256,(g,w,h)=>{ g.fillStyle='#34373d'; g.fillRect(0,0,w,h); for(let x=0;x<w;x+=16){ g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(x,0,4,h); g.fillStyle='rgba(255,255,255,.07)'; g.fillRect(x+5,0,3,h); } }), roughness:.6, metalness:.15});
    const cols=inst(cyl(.22,.26,3.7,10), MAT.red), posts=inst(rb(.12,1.05,.12,.03,1), MAT.woodDark), lan=AK.lanterns();
    for(let k=0;k<N;k++){ const y=Y1+k*FL, zf=front(k), depth=-BACK+zf, zc=(zf+BACK)/2;
      put(MAT.woodDark, xf(rb(X1-X0, .42, depth, .08, 1), (X0+X1)/2, y-.21, zc), dist);
      // vách mặt tiền (lùi 1,9 m chừa hành lang) + vách 2 đầu hồi
      const wg=new THREE.PlaneGeometry(X1-X0-1, FL-.45); wg.translate((X0+X1)/2, y+(FL-.45)/2, zf-1.9); const uvA=wg.attributes.uv; for(let i=0;i<uvA.count;i++) uvA.setX(i, uvA.getX(i)*(X1-X0)/8); put(hydWall, wg, dist);
      for(const xe of [X0+.3, X1-.3]){ const sg=new THREE.PlaneGeometry(depth-1.9, FL-.45); sg.rotateY(xe<200?-Math.PI/2:Math.PI/2); sg.translate(xe, y+(FL-.45)/2, (zf-1.9+BACK)/2); put(hydWall, sg, dist); }
      for(let x=X0+1.5; x<X1; x+=3.2) cols.add(x, y+1.85, zf-.35);
      for(let x=X0+.6; x<X1-6; x+=1.5) posts.add(x, y+.52, zf-.12);
      put(MAT.woodDark, xf(rb(X1-X0-6, .12, .16, .04, 1), (X0+X1-6)/2, y+1.05, zf-.12), dist);
      // hiên mái ngói + đèn lồng đỏ dưới hiên
      const eave=rb(X1-X0+1.2, .16, 2.8, .05, 1); xf(eave, (X0+X1)/2, y+FL-.3, zf-.4, 0, -.38); put(tileM, eave, dist);
      for(let x=X0+1.2; x<X1; x+=2.4) lan.add(x, y+FL-1.25, zf+.25);
      // va chạm: sàn cả tầng + lan can trước (chừa lối ra cầu thang ở đầu Đông) + vách sau + vách Tây
      addPlat((X0+X1)/2+1, zc, 0, (X1-X0)/2+1, depth/2, y);
      addSeg(X0, zf+.1, X1-6.5, zf+.1, .22, y-.4, y+1.7, 'Lan can phố cổ'); addSeg(X0, BACK, X1, BACK, .3, y-.4, y+FL-.2, 'Vách núi phía sau phố cổ'); addSeg(X0, zf, X0, BACK, .3, y-.4, y+FL-.2, 'Vách hồi phố cổ'); }
    cols.build(); posts.build(); lan.build(root);
    // sân thượng +46 nối thẳng lên đại lộ trên núi + 3 đình mái cong
    put(MAT.paving, xf(rb(X1-X0, .5, 46, .1, 1), (X0+X1)/2, YW-.25, -(196+N*.8+23)), dist); addPlat((X0+X1)/2, -(196+N*.8+23), 0, (X1-X0)/2, 23, YW);
    const HLX=225; addSeg(X0, front(N)+.1, HLX-1.45, front(N)+.1, .22, YW-.4, YW+1.7, 'Lan can sân thượng phố cổ'); addSeg(HLX+1.45, front(N)+.1, X1, front(N)+.1, .22, YW-.4, YW+1.7, 'Lan can sân thượng phố cổ');   /* hở đúng đầu cầu kính từ thang máy */
    for(const x of [161,188,215]){ const rf=AK.buildAsianCurvedRoof(10, 8, 2.6, 1.4, 0x34363c, 2); rf.position.set(x, YW+4.1, front(N)-6); root.add(rf); for(const [ox,oz] of [[-4,-3],[4,-3],[-4,3],[4,3]]) put(MAT.red, xf(cyl(.25,.25,4.1,10), x+ox, YW+2.05, front(N)-6+oz), dist); }
    // cầu thang bộ ngoài trời (đầu Đông, x 229–237): mỗi tầng 2 vế × 7 bậc, chiếu nghỉ, lan can
    const steps=inst(rb(2.6,.18,1.38,.04,1), MAT.woodDark);
    for(let k=0;k<N;k++){ const y=Y1+k*FL, zf=front(k), zA=zf-1, zB=zA-10, xA=230.6, xB=234.6;
      addPlat(232.6, zf-.5, 0, 4.4, 1.6, y); put(MAT.woodDark, xf(rb(8.6,.3,3.2,.06,1), 232.6, y-.15, zf-.5), dist);   // chiếu nghỉ ngang sàn tầng
      for(let s=0;s<7;s++){ const t=(s+.5)/7, yy=y+(s+1)*FL/14, zz=lerp(zA,zB,t); addPlat(xA, zz, 0, 1.3, .72, yy); steps.add(xA, yy-.09, zz); }
      addPlat(232.6, zB-1, 0, 4.4, 1.3, y+FL/2); put(MAT.woodDark, xf(rb(8.6,.3,2.6,.06,1), 232.6, y+FL/2-.15, zB-1), dist);
      for(let s=0;s<7;s++){ const t=(s+.5)/7, yy=y+FL/2+(s+1)*FL/14, zz=lerp(zB,zA,t); addPlat(xB, zz, 0, 1.3, .72, yy); steps.add(xB, yy-.09, zz); }
      addSeg(229,zf+.6,229,zB-2.3,.18,y-.3,y+FL+1.5,'Lan can cầu thang'); addSeg(236.9,zf+.6,236.9,zB-2.3,.18,y-.3,y+FL+1.5,'Lan can cầu thang'); addSeg(232.6,zA-.3,232.6,zB+.3,.12,y+.2,y+FL-.2,'Thành cầu thang');
      put(MAT.red, xf(cyl(.2,.2,FL,8), 229.2, y+FL/2, zf-.5), dist); put(MAT.red, xf(cyl(.2,.2,FL,8), 236.7, y+FL/2, zB-1), dist); }
    steps.build();
    // biển hiệu dọc + quán ăn
    sign('LẦU VÁCH ĐÈN LỒNG', 30, 3.6, 188, YW+1.2, front(N)+.2, 0, {bg:'#7a1410', fg:'#ffd27a', edge:'#e2b24a', glow:.9});
    const shops=[[1,162,'🍲 Lẩu cay Dev City','LẨU CAY',45,'Nồi lẩu tê cay đỏ rực, nóng hổi! 🌶️🔥'],[4,190,'🍜 Mì kéo sợi','MÌ KÉO SỢI',30,'Sợi mì kéo tay dai giòn, nước dùng bò thơm lừng 🍜'],[7,214,'🍵 Trà đạo','TRÀ ĐẠO',25,'Chén trà nóng ngắm sông về đêm – thư thái quá 🍵']];
    for(const [k,x,name,short,price,msg] of shops){ const y=Y1+k*FL, zf=front(k); sign(short, 5, 1.1, x, y+2.6, zf-1.75, 0, {bg:'#8a1d14', fg:'#ffe08a', edge:'#e2b24a', glow:.8});
      INTER.push({x, z:zf-1, r:2.6, prio:.4, when:()=>Math.abs(P.y-y)<1.2, label:`${name} – ${fmt(price)} 💰 (E)`, action:()=>{ if(!askPay) return toast(msg, 3000); askPay(price, `${name} – Lầu Vách Đèn Lồng`, ()=>{ if(spend && !spend(price)) return; toast(msg, 3400); }); }}); }
    /* S19g 16/11 (V2_PLAN 3b): thang kính bờ sông (liftkit) cửa quay vào phố cổ + cầu kính 10 m ở +46 nối sân thượng (thay thang dịch chuyển cũ) */
    { const LZ=front(0)+3, gy=hAt(HLX, front(0)+1)??Y1; makeLift(W, {x:HLX, z:LZ, yaw:Math.PI, name:'Thang kính Lầu Vách Đèn Lồng', color:0xe2b24a,
        floors:[{y:gy, name:'Bờ sông · tầng trệt phố cổ', short:'G'}, {y:YW, name:'Sân thượng +46 · đại lộ trên núi', short:'46'}]});
      const z0=LZ-1.75, z1=front(N)+.15, L=z0-z1, zc=(z0+z1)/2, pz1=front(N)-.6; addPlat(HLX, (z0+pz1)/2, 0, 1.35, (z0-pz1)/2, YW); put(MAT.paving, xf(rb(2.8, .3, L, .06, 1), HLX, YW-.15, zc), dist);   /* mặt đi chồng 0,6 m vào sân thượng (không hở khe) */
      for(const s of [-1,1]){ put(MAT.glass, xf(rb(.06, 1.05, L, .02, 1), HLX+s*1.38, YW+.55, zc), dist); put(MAT.steel, xf(rb(.1, .08, L, .02, 1), HLX+s*1.38, YW+1.1, zc), dist); addSeg(HLX+s*1.38, z0, HLX+s*1.38, z1-.3, .15, YW-.5, YW+1.7, 'Lan can cầu kính'); } }
    occ(X0, 238, front(0)+1, BACK); boxes.push({x0:X0, x1:X1, z0:BACK-1, z1:front(0), y0:-5, y1:1.2, msg:'Chân phố cổ'});
    label('🏮 LẦU VÁCH ĐÈN LỒNG', 'Phố cổ treo vách 11 tầng · lẩu cay · mì kéo · trà đạo', 188, YW+9, front(N), 380, .85);
    place('🏮','Dev City – Lầu Vách Đèn Lồng','Phố cổ 11 tầng bên sông', 200, -186, 188, -215); }

  /* ============================== 🚝 DEV RESIDENCY TOWER (380, −420) – ga Xuyên Lầu trong bụng toà nhà ============================== */
  { const dist='res', x=380, z=-420, w=30, d=24, y0=Y2, yH0=36.8, yH1=48.4, top=78, sy=ST[1].y;
    prism(rrect(x,z,w,d,2.2), y0, yH0, FAC.resi, dist, {cap:false}); prism(rrect(x,z,w,d,2.2), yH1, top, FAC.resi, dist, {u0:3});
    prism(rrect(x,z,w*.8,d*.8,2), top, top+4, FAC.glass, dist); put(MAT.leaf, xf(rb(18,1.2,12,.4,2), x, top+4.6, z), dist);
    for(const [cx,cz] of [[x-12,z-9.5],[x+12,z-9.5],[x-12,z+9.5],[x+12,z+9.5]]) put(MAT.concrete, xf(rb(6, yH1-yH0, 5, .4, 2), cx, (yH0+yH1)/2, cz), dist);
    put(MAT.concrete, xf(rb(w+.6, .9, d+.6, .2, 1), x, yH1-.45, z), dist); put(MAT.concrete, xf(rb(w+.6, .9, d+.6, .2, 1), x, yH0+.45, z), dist);
    for(const s of [-1,1]){ put(MAT.paving, xf(rb(18, .45, 3.6, .1, 1), x, sy-.22, z+s*5.2), dist); addPlat(x, z+s*5.2, 0, 9, 1.8, sy);
      put(MAT.glass, xf(rb(18, 1.1, .08, .03, 1), x, sy+.55, z+s*3.45), dist); addSeg(x-9, z+s*3.4, x+9, z+s*3.4, .15, sy-.5, sy+2, 'Lan can kính sân ga – tàu chạy giữa');
      if(s>0){ addSeg(x-9, z+s*7.1, x-7, z+s*7.1, .25, sy-.5, sy+6, 'Vách ga'); addSeg(x-1, z+s*7.1, x+9, z+s*7.1, .25, sy-.5, sy+6, 'Vách ga'); }   /* hở x 373–379: lối kính từ thang máy vào sân ga */
      else addSeg(x-9, z+s*7.1, x+9, z+s*7.1, .25, sy-.5, sy+6, 'Vách ga'); }
    for(const [cx,cz] of [[x-12,z-9.5],[x+12,z-9.5],[x-12,z+9.5],[x+12,z+9.5]]) boxes.push({x0:cx-3, x1:cx+3, z0:cz-2.5, z1:cz+2.5, y0:yH0-1, y1:yH1, msg:'Lõi kết cấu toà nhà'});
    sign('GA XUYÊN LẦU', 16, 1.6, x, sy+5.2, z+d/2+.3, 0, {bg:'#123a5a', fg:'#ffe08a', glow:.9}); sign('GA XUYÊN LẦU', 16, 1.6, x, sy+5.2, z-d/2-.3, Math.PI, {bg:'#123a5a', fg:'#ffe08a', glow:.9});
    sign('DEV RESIDENCY', 18, 2.2, x, top-3, z+d/2+.25, 0, {bg:'#202833', fg:'#ffffff', edge:'#7fd3ff'});
    block(x-w/2, x+w/2, z-d/2, z+d/2, -5, yH0, 'Dev Residency Tower'); boxes.push({x0:x-w/2, x1:x+w/2, z0:z-d/2, z1:z+d/2, y0:yH1-1, y1:top+6, msg:'Dev Residency Tower'});
    put(MAT.white, xf(rb(14,.5,5,.2,1), x, y0+5, z+d/2+3), dist); for(const s of [-1,1]) put(MAT.steel, xf(cyl(.2,.2,5,8), x+s*6, y0+2.5, z+d/2+5), dist);
    /* S19g 16/11 (V2_PLAN 3b): thang kính liftkit trước mặt tiền (x 371) – tầng ga có lối kính vòng vào sân ga qua khoảng hở vách ga x 373–379 */
    { const LX=x-9, LZ=z+d/2+1.4, gy=hAt(LX, z+d/2+3)??y0; makeLift(W, {x:LX, z:LZ, yaw:0, name:'Thang kính Dev Residency', color:0x7fd3ff,
        floors:[{y:gy, name:'Sảnh Dev Residency', short:'G'}, {y:sy, name:'Sân ga Xuyên Lầu (tầng 6)', short:'6'}]});
      const fz0=LZ+1.2, fz1=fz0+1.7, bx0=x-7.2, bx1=x-.8;   /* ban công trước cửa thang (z fz0..fz1) + lối vào trong (x bx0..bx1, z tới vách ga) */
      addPlat((LX-1.3+bx1)/2, (fz0+fz1)/2, 0, (bx1-LX+1.3)/2, (fz1-fz0)/2, sy); put(MAT.paving, xf(rb(bx1-LX+1.3, .3, fz1-fz0, .06, 1), (LX-1.3+bx1)/2, sy-.15, (fz0+fz1)/2), dist);
      const iz0=z+7.0, iz1=fz0, izc=(iz0+iz1)/2; addPlat((bx0+bx1)/2, izc, 0, (bx1-bx0)/2, (iz1-iz0)/2+.05, sy); put(MAT.paving, xf(rb(bx1-bx0, .3, iz1-iz0, .06, 1), (bx0+bx1)/2, sy-.15, izc), dist);
      const rail=(ax,az,bx,bz)=>{ addSeg(ax,az,bx,bz,.15,sy-.5,sy+1.7,'Lan can lối kính ga'); const L=Math.hypot(bx-ax,bz-az); put(MAT.glass, xf(rb(.06,1.05,L,.02,1), (ax+bx)/2, sy+.55, (az+bz)/2, Math.atan2(bx-ax,bz-az)), dist); };
      rail(LX-1.3, fz1, bx1, fz1); rail(bx1, fz1, bx1, iz0); rail(bx0, fz0, bx0, iz0); rail(LX-1.3, fz0, LX-1.3, fz1); }
    // căn hộ: mua / thuê → về ban công tầng 15
    const BY=y0+14*3.05, BZ=z+d/2+1.2; addPlat(x, BZ, 0, 12, 1.3, BY); addSeg(x-12, BZ+1.25, x+12, BZ+1.25, .15, BY-.5, BY+1.7, 'Lan can ban công'); put(MAT.paving, xf(rb(24,.3,2.6,.08,1), x, BY-.15, BZ), dist); put(MAT.glass, xf(rb(24,1.05,.08,.03,1), x, BY+.55, BZ+1.25), dist);
    INTER.push({x:x+9, z:z+d/2+2.4, r:2.6, prio:.3, when:()=>Math.abs(P.y-y0)<2, get label(){ return S.devcityApt ? '🏠 Về căn hộ Dev Residency (tầng 15) (E)' : '🏢 Căn hộ Dev Residency – mua 3.000 💰 / thuê 250 💰 (E)'; },
      action:()=>{ if(S.devcityApt){ teleport(x, BZ, x, BZ+20); toast('🏠 Ban công căn hộ tầng 15 – ngắm tàu điện chạy xuyên toà nhà bên dưới!', 3600); return; }
        const ui=ctx.ui; if(!ui || !ui.modal || !askPay) return; const m=ui.modal('🏢 Căn hộ Dev Residency Tower');
        m.body.innerHTML=`<p style="line-height:1.6;margin-top:0">Chung cư 18 tầng – ga tàu điện Xuyên Lầu ngay trong toà nhà (tầng 6–8). Theo luật V2, nội đô Dev City chỉ có <b>căn hộ</b>.</p>
          <div class="row" style="gap:10px;flex-wrap:wrap"><button class="btn pri" data-k="buy">🔑 Mua căn hộ – 3.000 💰</button><button class="btn" data-k="rent">📅 Thuê – 250 💰</button></div>`;
        m.body.querySelector('[data-k="buy"]').onclick=()=>{ m.close(); askPay(3000, 'Mua căn hộ Dev Residency (tầng 15)', ()=>{ if(spend && !spend(3000)) return; S.devcityApt={type:'own', t:Date.now()}; save(); toast('🎉 Bạn đã sở hữu căn hộ tầng 15 Dev Residency! Bấm E ở sảnh để về nhà.', 4200); }); };
        m.body.querySelector('[data-k="rent"]').onclick=()=>{ m.close(); askPay(250, 'Thuê căn hộ Dev Residency (tầng 15)', ()=>{ if(spend && !spend(250)) return; S.devcityApt={type:'rent', t:Date.now()}; save(); toast('🔑 Đã thuê căn hộ tầng 15 Dev Residency! Bấm E ở sảnh để về nhà.', 4200); }); }; }});
    label('🚝 DEV RESIDENCY · GA LÝ TỬ BÁ', 'Tàu điện chạy xuyên tầng 6–8 · căn hộ bán / thuê', x, top+12, z, 380, .8); }

  /* ============================== THỀM 2 (+24): khách sạn · bệnh viện · cứu hoả · trường học · cao ốc ============================== */
  { const dist='t2';
    // 🏫 trường liên cấp (chữ U) + sân thể thao
    prism(rrect(519,-281,58,10,1.2), Y2, Y2+16, FAC.warm, dist); prism(rrect(495,-264,10,24,1.2), Y2, Y2+16, FAC.warm, dist, {u0:4}); prism(rrect(543,-264,10,24,1.2), Y2, Y2+16, FAC.warm, dist, {u0:8});
    block(490,548,-286,-276,Y2-3,Y2+17,'Trường liên cấp Dev Sơn Thành'); block(490,500,-276,-252,Y2-3,Y2+17,'Trường học'); block(538,548,-276,-252,Y2-3,Y2+17,'Trường học');
    for(const [x,c] of [[505,0xe94f37],[519,0xf6c343],[533,0x3fa7d6]]) put(std({color:c, roughness:.5}), xf(rb(12,1.2,.4,.2,1), x, Y2+12, -275.6), dist);
    sign('TRƯỜNG LIÊN CẤP DEV SƠN THÀNH', 26, 2.2, 519, Y2+14.4, -275.7, 0, {bg:'#1b4f8a', fg:'#fff', edge:'#f6c343'});
    const field=canvas(512,512,(g,w,h)=>{ g.fillStyle='#b8452e'; g.fillRect(0,0,w,h); g.fillStyle='#3f8f3a'; g.beginPath(); g.ellipse(w/2,h/2,w*.36,h*.4,0,0,TAU); g.fill(); g.strokeStyle='#fff'; g.lineWidth=3; for(const k of [.4,.44,.48]){ g.beginPath(); g.ellipse(w/2,h/2,w*k*.9,h*k,0,0,TAU); g.stroke(); } g.strokeRect(w*.22,h*.18,w*.56,h*.64); g.beginPath(); g.moveTo(w*.22,h/2); g.lineTo(w*.78,h/2); g.stroke(); g.beginPath(); g.arc(w/2,h/2,w*.08,0,TAU); g.stroke(); });
    const fg=new THREE.PlaneGeometry(40,34); fg.rotateX(-Math.PI/2); fg.translate(578, Y2+.012, -266); const fm=std({map:field, roughness:.9, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3}); fm.userData.LU=1; put(fm, fg, dist);
    // 🏨 khách sạn 5 sao: bệ + thân cong + vương miện vàng
    prism(rrect(721,-263,58,36,3), Y2, Y2+8, FAC.office, dist, {roof:MAT.paving}); prism(lens(721,-266,42,17), Y2+8, Y2+62, FAC.warm, dist); prism(lens(721,-266,36,14), Y2+62, Y2+67, FAC.glass, dist);
    put(MAT.gold, xf(new THREE.TorusGeometry(10,.35,8,40), 721, Y2+67.6, -266, 0, Math.PI/2, 0, 1.75, 1, .72), dist);
    block(692,750,-281,-245,Y2-3,Y2+70,'Dev Grand Hotel'); sign('DEV GRAND HOTEL ★★★★★', 24, 2.4, 721, Y2+6, -244.8, 0, {bg:'#2a1d10', fg:'#ffd98a', edge:'#e2b24a', glow:.9});
    label('🏨 Dev Grand Hotel', 'Khách sạn 5 sao lưng núi', 721, Y2+76, -266, 320, .7);
    // 🏥 bệnh viện Sơn Thành (chữ H) + sân đỗ trực thăng
    prism(rrect(680,-345,72,14,2), Y2, Y2+21, FAC.office, dist); prism(rrect(680,-391,72,14,2), Y2, Y2+21, FAC.office, dist, {u0:6}); prism(rrect(680,-368,18,34,2), Y2, Y2+24, FAC.office, dist, {u0:2});
    block(644,716,-352,-338,Y2-3,Y2+22,'Bệnh viện Sơn Thành'); block(644,716,-398,-384,Y2-3,Y2+22,'Bệnh viện Sơn Thành'); block(671,689,-385,-351,Y2-3,Y2+25,'Bệnh viện Sơn Thành');
    const heli=canvas(256,256,(g,w,h)=>{ g.fillStyle='#2f3338'; g.fillRect(0,0,w,h); g.strokeStyle='#f3d03a'; g.lineWidth=10; g.beginPath(); g.arc(w/2,h/2,w*.42,0,TAU); g.stroke(); g.fillStyle='#fff'; g.font='bold 150px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('H',w/2,h/2+6); });
    const hg=new THREE.CircleGeometry(8,40); hg.rotateX(-Math.PI/2); hg.translate(680, Y2+24.08, -368); put(std({map:heli, roughness:.8}), hg, dist);
    for(const [cx,cz,ry] of [[680,-337.8,0],[680,-383.8,0],[680,-352.2,Math.PI],[680,-398.2,Math.PI]]){ const cr=canvas(128,128,(g,w,h)=>{ g.fillStyle='#fff'; g.fillRect(0,0,w,h); g.fillStyle='#e0262a'; g.fillRect(w*.38,h*.12,w*.24,h*.76); g.fillRect(w*.12,h*.38,w*.76,h*.24); });
      const cp=new THREE.Mesh(new THREE.PlaneGeometry(4,4), std({map:cr, emissive:0xff3030, emissiveMap:cr, emissiveIntensity:.35})); cp.position.set(cx, Y2+17, cz+(ry?-.05:.05)); cp.rotation.y=ry; root.add(cp); }
    sign('BỆNH VIỆN SƠN THÀNH', 22, 2.2, 680, Y2+22.3, -337.7, 0, {bg:'#ffffff', fg:'#c81e24', edge:'#c81e24'}); label('🏥 Bệnh viện Sơn Thành', 'Cấp cứu 24/7 · sân đỗ trực thăng', 680, Y2+32, -368, 320, .7);
    // xe cứu thương + xe cứu hoả (hộp bo tròn)
    const van=(x,z,ry,col,len=6)=>{ put(std({color:col, roughness:.4, metalness:.2}), xf(rb(2.3,2.5,len,.35,2), x, Y2+1.55, z, ry), dist); put(MAT.dark, xf(rb(2.4,.8,len-.6,.2,1), x, Y2+.45, z, ry), dist); circles.push({x, z, r:len/2-.4}); };
    van(660,-333,Math.PI/2,0xf4f4f2); van(700,-333,Math.PI/2,0xf4f4f2);
    // 🚒 trạm cứu hoả: 3 cửa đỏ + tháp tập luyện
    prism(rrect(800,-345,46,22,1.5), Y2, Y2+10, FAC.office, dist); prism(rrect(820,-360,7,7,.6), Y2+10, Y2+26, FAC.warm, dist); block(777,823,-356,-334,Y2-3,Y2+11,'Trạm cứu hoả'); block(816,824,-364,-356,Y2-3,Y2+27,'Tháp tập luyện');
    for(const x of [786,800,814]) put(std({color:0xc8231c, roughness:.4}), xf(rb(9,6.5,.3,.15,1), x, Y2+3.3, -333.9), dist);
    sign('TRẠM CỨU HOẢ LƯNG NÚI · 114', 20, 2, 800, Y2+8.2, -333.6, 0, {bg:'#c8231c', fg:'#fff', edge:'#fff'});
    van(786,-326,0,0xd0201a,8.5); van(800,-326,0,0xd0201a,8.5);
    // cao ốc thương mại dọc Đại lộ Lưng Núi
    tower({x:396, z:-345, w:30, d:24, h:30, y0:Y2, fac:FAC.office, dist, name:'🏬 Trung tâm thương mại Lưng Núi'});
    tower({x:505, z:-344, w:34, d:22, h:24, y0:Y2, fac:FAC.warm, dist});
    tower({x:545, z:-352, w:24, d:18, h:34, y0:Y2, fac:FAC.glass, dist, antenna:10});
    tower({x:788, z:-270, w:28, d:20, h:22, y0:Y2, fac:FAC.resi, dist});
    place('🏨','Dev City – Lưng Núi (+24 m)','Khách sạn · bệnh viện · trường học', 640, -306, 680, -345); }

  /* ============================== THỀM 3 (+52): khu cao ốc trung tâm ============================== */
  { const dist='t3', T=[
      [360,-522,30,24,66,FAC.glass],[402,-532,26,26,74,FAC.dark],[364,-578,28,22,58,FAC.resi],[404,-592,24,24,70,FAC.glass],[365,-642,30,26,62,FAC.office],[406,-662,26,24,72,FAC.dark],
      [500,-520,24,22,62,FAC.resi],[548,-523,28,20,72,FAC.glass],[598,-520,24,22,56,FAC.office],[632,-522,16,18,48,FAC.warm],
      [498,-676,24,20,54,FAC.office],[548,-678,26,20,64,FAC.dark],[600,-676,24,20,52,FAC.resi],
      [250,-522,30,26,60,FAC.office],[290,-545,24,22,70,FAC.glass],[250,-602,28,28,76,FAC.dark],[292,-614,24,24,64,FAC.resi],[255,-668,30,24,58,FAC.office],[296,-676,22,22,70,FAC.warm],
      [682,-522,26,22,58,FAC.resi],[684,-568,24,20,52,FAC.office]];
    T.forEach(([x,z,w,d,h,fac],i)=>tower({x, z, w, d, h, y0:Y3, fac, dist, antenna:i%3===0?9:0, name:i===4?'🏢 Dev Tower – Trung tâm Cao nguyên':'' }));
    place('🏢','Dev City – Trung tâm Cao nguyên (+52 m)','Khu cao ốc quanh hồ Thiên Cảnh', 470, -496, 400, -560); }

  /* ============================== 🏞️ CÔNG VIÊN HỒ THIÊN CẢNH ============================== */
  { const dist='lake', yP=Y3+.08, cx=LAKE.x, cz=-LAKE.d;
    // đường dạo quanh hồ
    const pts=[]; for(let i=0;i<=128;i++){ const a=i/128*TAU; pts.push([cx+Math.cos(a)*(LAKE.rx+8), cz+Math.sin(a)*(LAKE.rz+8)]); }
    { const pos=[], uv=[], idx=[]; let acc=0; pts.forEach(([x,z],i)=>{ const a=i/128*TAU, nx=Math.cos(a)*LAKE.rz, nz=Math.sin(a)*LAKE.rx, nl=Math.hypot(nx,nz), ox=nx/nl*2.2, oz=nz/nl*2.2; if(i) acc+=Math.hypot(x-pts[i-1][0], z-pts[i-1][1]);
        const y=(hAt(x,z)??Y3)+.02; pos.push(x-ox,y,z-oz, x+ox,y,z+oz);   /* S19g rà soát: +0,06 → +0,02 (chân không lún vào lối dạo); lệch sâu bằng polygonOffset */ uv.push(0,acc/4.4, 1,acc/4.4); if(i<128){ const q=i*2; idx.push(q,q+1,q+2, q+1,q+3,q+2); } });
      const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); MAT.paving.polygonOffset=true; MAT.paving.polygonOffsetFactor=-3; MAT.paving.polygonOffsetUnits=-3; put(MAT.paving, g, dist); }
    // cầu chữ chi (Nam) + cầu vòm (Bắc) ra đảo
    const zig=[]; { const P0=[[cx,cz+LAKE.rz+3],[cx-6,cz+33],[cx+6,cz+26],[cx-6,cz+19],[cx,cz+13]]; for(let i=0;i<P0.length-1;i++){ const [x0,z0]=P0[i], [x1,z1]=P0[i+1], L=Math.hypot(x1-x0,z1-z0); for(let t=0;t<L;t+=1.5) zig.push({x:x0+(x1-x0)*t/L, z:z0+(z1-z0)*t/L, y:52.4}); } zig.push({x:cx, z:cz+13, y:52.7}); }
    deck(zig, 2.8, dist, {mat:MAT.wood, th:.35, parapet:.95, piers:false, msg:'Lan can cầu chữ chi', name:'foot: cầu chữ chi'});
    const arc=[]; for(let t=0;t<=1.0001;t+=.04){ const z=lerp(cz-LAKE.rz-3, cz-12.5, t); arc.push({x:cx, z, y:52.3+2.4*Math.sin(Math.PI*t)}); } deck(arc, 3, dist, {mat:MAT.stone, th:.6, parapet:1, piers:false, msg:'Lan can cầu vòm', name:'foot: cầu vòm'});
    // đình giữa đảo
    const rf=AK.buildAsianCurvedRoof(8, 8, 2.4, 1.4, 0x2f3238, 2); rf.position.set(cx, 52.7+3.6, cz); root.add(rf);
    for(const [ox,oz] of [[-3,-3],[3,-3],[-3,3],[3,3]]){ put(MAT.red, xf(cyl(.24,.26,3.6,10), cx+ox, 52.7+1.8, cz+oz), dist); circles.push({x:cx+ox, z:cz+oz, r:.35}); }
    put(MAT.stone, xf(rb(8.4,.4,8.4,.1,1), cx, 52.75, cz), dist); addPlat(cx, cz, 0, 4.15, 4.15, 52.95);   // S19g rà soát: sàn đình đi được (trước chân lún 25 cm vào bệ đá)
    // ghế đá + đèn công viên
    const bench=(x,z,rot)=>{ put(MAT.stone, xf(rb(1.7,.12,.5,.04,1), x, yP+.45, z, rot), dist); for(const s of [-.65,.65]) put(MAT.stone, xf(rb(.16,.42,.4,.04,1), x+Math.cos(rot)*s, yP+.21, z-Math.sin(rot)*s, rot), dist);
      W.addBench && W.addBench({x, z, rot, len:1.6, y:yP+.5, floor:yP, label:'🪑 Ngồi ghế ven hồ (E · C)'}); };
    for(let i=0;i<16;i++){ const a=i/16*TAU+.1, x=cx+Math.cos(a)*(LAKE.rx+12.5), z=cz+Math.sin(a)*(LAKE.rz+12.5); bench(x, z, Math.atan2(cx-x, cz-z)); }
    label('🏞️ Công viên hồ Thiên Cảnh', 'Hồ giữa núi +52 m · đảo xanh · cầu chữ chi', cx, 66, cz, 300, .75);
    place('🏞️','Dev City – Đình giữa hồ Thiên Cảnh','Đảo xanh giữa hồ trên núi', cx+2, cz+4, cx, cz-10);
    occ(cx-LAKE.rx-11, cx+LAKE.rx+11, cz-LAKE.rz-11, cz+LAKE.rz+11); }

  /* ============================== ✈️ SÂN BAY ĐỈNH NÚI (+85) ============================== */
  const plane=(livery=0x1fb5a6)=>{ const g=new THREE.Group(), white=std({color:0xf4f6f8, roughness:.35, metalness:.2}), tail=std({color:livery, roughness:.4, metalness:.2});
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(2.1, 30, 8, 18), white); body.rotation.x=Math.PI/2; body.scale.set(1,1,1); g.add(body);
    const ws=new THREE.Shape(); ws.moveTo(0,0); ws.lineTo(17,-6); ws.lineTo(17,-8.4); ws.lineTo(0,-6.4); ws.closePath(); for(const s of [-1,1]){ const wg=new THREE.ExtrudeGeometry(ws,{depth:.35, bevelEnabled:false}); wg.rotateX(Math.PI/2); if(s<0) wg.scale(-1,1,1); const w=new THREE.Mesh(wg, white); w.position.set(s*1.4,-.6,4); g.add(w);
      const eng=new THREE.Mesh(new THREE.CylinderGeometry(.95,.85,3.6,14), MAT.dark); eng.rotation.x=Math.PI/2; eng.position.set(s*6.5,-1.9,1.2); g.add(eng); }
    const ts=new THREE.Shape(); ts.moveTo(0,0); ts.lineTo(5.6,0); ts.lineTo(7.6,7.2); ts.lineTo(5.4,7.2); ts.closePath(); const tg=new THREE.ExtrudeGeometry(ts,{depth:.3, bevelEnabled:false}); tg.rotateY(-Math.PI/2); const fin=new THREE.Mesh(tg, tail); fin.position.set(.15,1.4,-11); g.add(fin);
    for(const s of [-1,1]){ const hs=new THREE.Shape(); hs.moveTo(0,0); hs.lineTo(6,-2.4); hs.lineTo(6,-3.6); hs.lineTo(0,-3); hs.closePath(); const hg=new THREE.ExtrudeGeometry(hs,{depth:.25, bevelEnabled:false}); hg.rotateX(Math.PI/2); if(s<0) hg.scale(-1,1,1); const h=new THREE.Mesh(hg, white); h.position.set(s*.8,.7,-12.4); g.add(h); }
    g.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; } }); return g; };
  { const dist='air', y=Y4+.012;   /* S19g rà soát: +0,05 → +0,012 (chân/bánh xe không lún vào đường băng) */
    const rwT=canvas(256,1024,(g,w,h)=>{ g.fillStyle='#3a3c40'; g.fillRect(0,0,w,h); for(let i=0;i<8000;i++){ const v=40+R()*40|0; g.fillStyle=`rgba(${v},${v},${v},.5)`; g.fillRect(R()*w,R()*h,2,2); }
      g.fillStyle='#f2f2ee'; g.fillRect(6,0,6,h); g.fillRect(w-12,0,6,h); for(let yy=20;yy<h;yy+=60) g.fillRect(w/2-3,yy,6,34); for(let k=0;k<8;k++){ g.fillRect(22+k*28,4,14,60); g.fillRect(22+k*28,h-64,14,60); } });
    const rwM=std({map:rwT, roughness:.85, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3}); rwM.userData.LU=1;
    const rw=new THREE.PlaneGeometry(40, 470); rw.rotateX(-Math.PI/2); rw.rotateY(Math.PI/2); rw.translate(375, y, -885); put(rwM, rw, dist);
    const tw=new THREE.PlaneGeometry(14, 440); tw.rotateX(-Math.PI/2); tw.rotateY(Math.PI/2); tw.translate(380, y-.01, -840); put(MAT.road2, tw, dist);
    put(MAT.concrete, xf(rb(190, .12, 32, .05, 1), 375, y-.04, -818), dist);
    for(const x of [200, 560]){ const c=new THREE.PlaneGeometry(14, 32); c.rotateX(-Math.PI/2); c.translate(x, y-.02, -853); put(MAT.road2, c, dist); }
    // nhà ga: mặt kính + mái sóng
    prism(rrect(370,-787,160,26,4), Y4, Y4+13, FAC.glass, dist, {cap:false});
    { const pos=[], idx=[], NXr=64, NZr=6; for(let j=0;j<=NZr;j++) for(let i=0;i<=NXr;i++){ const x=286+i*168/NXr, z=-803+j*32/NZr; pos.push(x, Y4+13.6+1.6*Math.sin(i/NXr*TAU*3)+(j/NZr-.5)*1.4, z); }
      for(let j=0;j<NZr;j++) for(let i=0;i<NXr;i++){ const a=j*(NXr+1)+i, b=a+1, c=a+NXr+1, d=c+1; idx.push(a,c,b, b,c,d); } const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); put(MAT.white, g, dist); }
    block(290,450,-800,-774,Y4-3,Y4+16,'Nhà ga sân bay'); sign('SÂN BAY ĐỈNH NÚI DEV CITY · DEV CITY SUMMIT AIRPORT', 46, 2.6, 370, Y4+10.6, -773.7, 0, {bg:'#0f2742', fg:'#e8f4ff', edge:'#5fb8ff', glow:.8});
    // đài kiểm soát
    put(MAT.concrete, xf(cyl(2.4,3,32,20), 482, Y4+16, -800), dist); put(MAT.glass, xf(cyl(5.2,4.4,4.5,8), 482, Y4+34.2, -800), dist); put(MAT.white, xf(cyl(5.8,5.8,.8,8), 482, Y4+36.9, -800), dist); put(MAT.white, xf(cyl(4.6,4.6,.6,8), 482, Y4+31.7, -800), dist);
    put(MAT.steel, xf(cyl(.12,.12,6,6), 482, Y4+40.3, -800), dist); circles.push({x:482, z:-800, r:3.2}); occ(476,488,-806,-794);
    // máy bay đỗ + máy bay cất cánh định kỳ
    for(const [x,c] of [[322,0x1fb5a6],[372,0x7b3fc4],[422,0xf08a24]]){ const p=plane(c); p.position.set(x, Y4+3.3, -822); root.add(p); circles.push({x, z:-816, r:3}, {x, z:-828, r:3}); (out.parked=out.parked||[]).push({x, z:-822}); }   // mũi quay về nhà ga
    const tk=plane(0x18a999); tk.userData.dynamic=true; tk.userData.noObs=true; root.add(tk); out.takeoff={t:0, p:tk};   /* noObs: không tính là chướng ngại khi lập quỹ đạo bay */
    label('✈️ Sân bay đỉnh núi Dev City', 'Đường băng 470 m ở độ cao +85 m', 375, Y4+28, -860, 450, .85);
    place('✈️','Dev City – Sân bay đỉnh núi (+85 m)','Nhà ga · đường băng · đài kiểm soát', 370, -746, 370, -790);
    if(!(W.AIRPORTS||(W.AIRPORTS=[])).find(a=>a.key==='devcity')) W.AIRPORTS.push({key:'devcity', name:'Sân bay Đỉnh Núi Dev City', x:375, z:-885, y:Y4, rwy:{x0:140, x1:610, z:-885, y:Y4}, spawn:{x:370, z:-746, lx:370, lz:-790}});   /* S19g 16/11: sổ sân bay chung (skyport.js) – chuyến QC Airlines → Dev City hạ cánh thật */ }

  /* ============================== 🛕 LINH SƠN VÂN TỰ ============================== */
  { const dist='temple', A={x:PA.x, z:-PA.d, y:PA.top}, Bc={x:PB.x, z:-PB.d, y:PB.top}, u=[abu[0], -abu[1]];   // u: hướng A → B trong toạ độ thế giới (x, z)
    // sân đỉnh A + lan can đá (chừa lối cầu thang phía Nam và đầu cầu xích phía B)
    { const g=new THREE.CylinderGeometry(PA.r+.6, PA.r+1.6, 1.2, 48); xf(g, A.x, A.y-.6, A.z); put(MAT.stone, g, dist); }
    const balG=inst(rb(.32,1,.32,.06,1), MAT.stone); { const n=64; for(let i=0;i<n;i++){ const a=i/n*TAU, x=A.x+Math.cos(a)*(PA.r+.2), z=A.z+Math.sin(a)*(PA.r+.2), toS=Math.abs(((a-Math.PI/2)+TAU*1.5)%TAU-Math.PI)<.2, toB=Math.abs(((a-Math.atan2(u[1],u[0]))+TAU*1.5)%TAU-Math.PI)<.12;
        if(toS || toB) continue; balG.add(x, A.y+.5, z); const b=(i+1)/n*TAU; addSeg(x, z, A.x+Math.cos(b)*(PA.r+.2), A.z+Math.sin(b)*(PA.r+.2), .2, A.y-1, A.y+1.6, 'Lan can đá sân bảo tháp'); } }
    // bậc đá lên đồi (hình bậc thang trên dốc trơn) + cổng Tam Quan
    { const dx=STAIR.x1-STAIR.x0, dz=STAIR.z1-STAIR.z0, L=Math.hypot(dx,dz), n=Math.round((STAIR.y1-STAIR.y0)/.3), ang=Math.atan2(dx,dz); const st=inst(rb(STAIR.w,.32,L/n+.05,.04,1), MAT.stone);
      for(let i=0;i<n;i++){ const t=(i+.5)/n; st.add(STAIR.x0+dx*t, lerp(STAIR.y0,STAIR.y1,(i+1)/n)-.16, STAIR.z0+dz*t, ang); balG.add(STAIR.x0+dx*t+Math.cos(ang)*(STAIR.w/2+.2), lerp(STAIR.y0,STAIR.y1,t)+.5, STAIR.z0+dz*t-Math.sin(ang)*(STAIR.w/2+.2)); balG.add(STAIR.x0+dx*t-Math.cos(ang)*(STAIR.w/2+.2), lerp(STAIR.y0,STAIR.y1,t)+.5, STAIR.z0+dz*t+Math.sin(ang)*(STAIR.w/2+.2)); }
      st.build(); for(const s of [-1,1]) addSeg(STAIR.x0+Math.cos(ang)*s*(STAIR.w/2+.2), STAIR.z0-Math.sin(ang)*s*(STAIR.w/2+.2), STAIR.x1+Math.cos(ang)*s*(STAIR.w/2+.2), STAIR.z1-Math.sin(ang)*s*(STAIR.w/2+.2), .2, STAIR.y0-1, STAIR.y1+2, 'Lan can bậc đá');
      const gt=.55, gx=STAIR.x0+dx*gt, gz=STAIR.z0+dz*gt, gy=lerp(STAIR.y0,STAIR.y1,gt);
      for(const s of [-1,-.33,.33,1]) put(MAT.stone, xf(rb(1.3, 6.2, 1.3, .15, 2), gx+Math.cos(ang)*s*5.2, gy+3.1, gz-Math.sin(ang)*s*5.2, ang), dist);
      put(MAT.stone, xf(rb(13, 1.1, 2.2, .2, 2), gx, gy+6.5, gz, ang), dist); const rf=AK.buildAsianCurvedRoof(12, 3.2, 2, 1.2, 0x2c2f35, 1); rf.position.set(gx, gy+7.1, gz); rf.rotation.y=ang; root.add(rf);
      for(const s of [-1,-.33,.33,1]) circles.push({x:gx+Math.cos(ang)*s*5.2, z:gz-Math.sin(ang)*s*5.2, r:.85});
      sign('LINH SƠN VÂN TỰ', 8, 1.2, gx-Math.sin(ang)*1.2, gy+5.4, gz-Math.cos(ang)*1.2, ang+Math.PI, {bg:'#7a1410', fg:'#ffd27a', glow:.7});
      label('⛩️ Cổng Tam Quan · Linh Sơn Vân Tự', 'Bậc đá lên bảo tháp 9 tầng', gx, gy+12, gz, 260, .65); }
    // bảo tháp bát giác 9 tầng (~54 m)
    { let y=A.y; put(MAT.stone, xf(cyl(10,11,2,8), A.x, y+1, A.z, Math.PI/8), dist); y+=2;
      for(let k=0;k<9;k++){ const r=7.4-k*.45, h=4.1; put(k%2?MAT.white:std({color:0xe9dfc8, roughness:.6}), xf(cyl(r*.92,r,h,8), A.x, y+h/2, A.z, Math.PI/8), dist);
        for(let s=0;s<8;s++){ const a=s/8*TAU+Math.PI/8; put(MAT.red, xf(cyl(.18,.18,h,6), A.x+Math.cos(a)*r*.96, y+h/2, A.z+Math.sin(a)*r*.96), dist); }
        const rf=AK.buildAsianCurvedRoof(r*1.9, r*1.9, 1.7, 1.5, 0x2c2f35, 1, {lift:1.1}); rf.position.set(A.x, y+h, A.z); rf.rotation.y=Math.PI/8; root.add(rf); y+=h+1.15; }
      for(let k=0;k<7;k++) put(MAT.gold, xf(new THREE.TorusGeometry(1.1-k*.1,.18,8,20), A.x, y+.6+k*.75, A.z, 0, Math.PI/2), dist);
      put(MAT.gold, xf(cyl(.12,.35,6.5,10), A.x, y+3.2, A.z), dist); put(MAT.gold, xf(new THREE.SphereGeometry(.6,12,8), A.x, y+6.6, A.z), dist);
      circles.push({x:A.x, z:A.z, r:9.2, y0:A.y-2, y1:A.y+60});
      label('🛕 Bảo tháp bát giác 9 tầng', 'Linh Sơn Vân Tự · cao 54 m', A.x, y+12, A.z, 480, .8);
      INTER.push({x:A.x, z:A.z+10.5, r:3, prio:.3, when:()=>Math.abs(P.y-A.y)<2, label:'🙏 Thắp nén hương cầu an (E)', action:()=>{ W.burst && W.burst(new V3(A.x, A.y+1.5, A.z+9.6), [0xffd27a,0xff9f43,0xffffff], 40, 1.4, .6, 1.5, .06); toast('🙏 Một nén tâm hương – chúc bạn và team QA bình an, release nào cũng xanh!', 3600); }}); }
    // cầu xích sắt qua hẻm vực: A (mép sân) → gờ đá đỉnh B (y 72), võng 2,2 m giữa nhịp
    const ax=A.x+u[0]*(PA.r+.4), az=A.z+u[1]*(PA.r+.4), bx=Bc.x-u[0]*33, bz=Bc.z-u[1]*33, Lb=Math.hypot(bx-ax,bz-az), ang=Math.atan2(bx-ax,bz-az), sag=2.2;
    { const path=[]; for(let t=0;t<=1.0001;t+=1/Math.round(Lb/1.2)){ path.push({x:lerp(ax,bx,t), z:lerp(az,bz,t), y:72-sag*4*t*(1-t)}); }
      deck(path, 2.6, dist, {mat:MAT.wood, th:.25, parapet:.15, piers:false, msg:'Xích sắt hai bên cầu – vực sâu bên dưới', name:'foot: cầu xích sắt'});
      for(const s of [-1,1]){ const pts=[]; for(let t=0;t<=1.0001;t+=.04) pts.push(new V3(lerp(ax,bx,t)+Math.cos(ang)*s*1.5, 72+1.1-sag*1.25*4*t*(1-t), lerp(az,bz,t)-Math.sin(ang)*s*1.5)); put(MAT.dark, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .09, 6, false), dist);
        for(let t=0;t<=1.0001;t+=.04){ const x=lerp(ax,bx,t)+Math.cos(ang)*s*1.5, z=lerp(az,bz,t)-Math.sin(ang)*s*1.5, y0=72-sag*4*t*(1-t), y1=72+1.1-sag*1.25*4*t*(1-t); put(MAT.dark, beam(cyl(.03,.03,1,4), new V3(x,y0,z), new V3(x,y1,z)), dist); } }
      for(const [px,pz] of [[ax,az],[bx,bz]]) for(const s of [-1,1]) put(MAT.stone, xf(rb(.9,2.6,.9,.15,1), px+Math.cos(ang)*s*1.9, 73.3, pz-Math.sin(ang)*s*1.9, ang), dist);
      label('🌉 Cầu xích sắt Linh Sơn', 'Vắt qua hẻm vực ~80 m', (ax+bx)/2, 80, (az+bz)/2, 300, .65); }
    // chánh điện treo vách (gờ đá 72 m của đỉnh B): nửa sau khoét vào hang, nửa trước trên cột gỗ chìa ra vực
    { const hc={x:Bc.x-u[0]*36.5, z:Bc.z-u[1]*36.5}, ry=Math.atan2(-u[0],-u[1]), w2=22, d2=14, fy=72;
      put(MAT.wood, xf(rb(w2+2, .6, d2+6, .1, 1), hc.x-u[0]*2, fy-.3, hc.z-u[1]*2, ry), dist); addPlat(hc.x-u[0]*2, hc.z-u[1]*2, ry, (w2+2)/2, (d2+6)/2, fy);
      const stilt=inst(cyl(.3,.34,1,8), MAT.woodDark); for(let i=-4;i<=4;i++) for(const k of [4,8]){ const px=hc.x-u[0]*k+Math.cos(ry)*i*2.7, pz=hc.z-u[1]*k-Math.sin(ry)*i*2.7, gy=hAt(px,pz)??44, H=fy-.6-gy; if(H>.6) stilt.add(px, gy+H/2, pz, 0, 1, H); }
      stilt.build();
      for(let i=-3;i<=3;i++) for(const k of [-4,3]) put(MAT.red, xf(cyl(.32,.34,6,10), hc.x+u[0]*k+Math.cos(ry)*i*3.2, fy+3, hc.z+u[1]*k-Math.sin(ry)*i*3.2), dist);
      put(std({map:canvas(256,128,(g,w,h)=>{ g.fillStyle='#5a2a14'; g.fillRect(0,0,w,h); g.strokeStyle='#e0b25a'; g.lineWidth=3; for(let x=8;x<w;x+=24){ g.strokeRect(x,14,18,96); } }), roughness:.7}), xf(rb(w2-2, 5.6, .3, .05, 1), hc.x+u[0]*4.4, fy+2.8, hc.z+u[1]*4.4, ry), dist);
      const rf=AK.buildAsianCurvedRoof(w2, d2, 3.2, 1.8, 0x2a2d33, 2); rf.position.set(hc.x, fy+6, hc.z); rf.rotation.y=ry; root.add(rf);
      // đá trần hang phủ nửa sau mái
      const rock=new THREE.IcosahedronGeometry(1, 3); { const p=rock.attributes.position; for(let i=0;i<p.count;i++){ const v=new V3().fromBufferAttribute(p,i); const n=.75+.35*Math.sin(v.x*3+v.y*2)*Math.cos(v.z*4); p.setXYZ(i, v.x*n, v.y*n, v.z*n); } }
      xf(rock, hc.x+u[0]*6, fy+12, hc.z+u[1]*6, ry, 0, 0, 16, 7, 12); put(MAT.rock, rock, dist);
      addSeg(hc.x-u[0]*11.8+Math.cos(ry)*12, hc.z-u[1]*11.8-Math.sin(ry)*12, hc.x-u[0]*11.8-Math.cos(ry)*12, hc.z-u[1]*11.8+Math.sin(ry)*12, .25, fy-1, fy+1.7, 'Lan can chánh điện – vực sâu');
      const lan=AK.lanterns(); for(let i=-4;i<=4;i++) lan.add(hc.x-u[0]*7+Math.cos(ry)*i*2.6, fy+4.6, hc.z-u[1]*7-Math.sin(ry)*i*2.6); lan.build(root);
      sign('ĐẠI HÙNG BẢO ĐIỆN', 10, 1.4, hc.x-u[0]*7.2, fy+5.4, hc.z-u[1]*7.2, ry+Math.PI, {bg:'#7a1410', fg:'#ffd27a', glow:.7});
      label('🏯 Đại Hùng Bảo Điện', 'Chánh điện treo vách – nửa trong hang đá', hc.x, fy+16, hc.z, 300, .7);
      INTER.push({x:hc.x-u[0]*4, z:hc.z-u[1]*4, r:3.2, prio:.3, when:()=>Math.abs(P.y-fy)<2, label:'⬆️ Lối vách đá lên đỉnh tượng Phật (+98 m) (E)', action:()=>teleport(Bc.x-u[0]*14, Bc.z-u[1]*14, Bc.x, Bc.z)});
      place('🏯','Dev City – Chánh điện treo vách','Cầu xích · hang đá · vực sâu', hc.x-u[0]*8, hc.z-u[1]*8, Bc.x, Bc.z); }
    // tượng Phật ngồi 32 m trên đỉnh B (nhìn về phía bảo tháp) + mây trôi quanh chân
    { const g=new THREE.Group(), gold=MAT.gold, ry=Math.atan2(-u[0],-u[1]); g.position.set(Bc.x, Bc.y, Bc.z); g.rotation.y=ry;
      const add=(geo, x,y,z, sx=1,sy=1,sz=1, rx=0,rz=0)=>{ const m=new THREE.Mesh(geo, gold); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.rotation.set(rx,0,rz); m.castShadow=true; g.add(m); return m; };
      const lot=new THREE.LatheGeometry([[0,0],[9.5,0],[10.2,.9],[9.4,1.6],[10.4,2.4],[9.2,3.4],[6.5,3.9],[0,3.9]].map(([r,h])=>new THREE.Vector2(r,h)), 32); add(lot,0,0,0);
      // đài sen: 2 vòng cánh sen (cánh cong, đầu nhọn) quanh bệ
      const petal=new THREE.SphereGeometry(1,12,8,0,TAU,0,Math.PI/2); petal.scale(1.5,3.2,.7); petal.translate(0,0,.5);
      for(const [n,r,y,tilt,sc] of [[18,9.3,.6,.55,1],[14,7.6,1.9,.35,.85]]) for(let i=0;i<n;i++){ const a=(i+(r<9?.5:0))/n*TAU, m=new THREE.Mesh(petal, gold); m.position.set(Math.sin(a)*r, y, Math.cos(a)*r); m.rotation.set(tilt, a, 0, 'YXZ'); m.scale.setScalar(sc); m.castShadow=true; g.add(m); }
      add(new THREE.SphereGeometry(1,24,16), 0,6.1,0, 10.5,3.6,7.6);                 // chân xếp bằng (kiết già)
      for(const s of [-1,1]) add(new THREE.SphereGeometry(1,16,12), s*3.6,6.4,4.4, 2.2,1.1,1.6);   // 2 bàn chân ngửa trên đùi
      add(new THREE.LatheGeometry([[0,0],[5.2,0],[5.6,2],[5.2,5],[4.6,7.5],[5.6,10.6],[5.9,12.4],[4.8,14.6],[2.4,15.8],[0,16]].map(([r,h])=>new THREE.Vector2(r,h)), 28), 0,7.4,-.6, 1,1,.72);   // thân: eo thon, vai rộng
      { const sash=new THREE.Mesh(new THREE.CapsuleGeometry(1.1,15,6,10), gold); sash.position.set(-1.2,15.6,1.9); sash.rotation.set(.06,0,-.62); sash.scale.set(1,1,.45); g.add(sash); }   // vạt cà sa chéo vai trái
      for(const s of [-1,1]){ add(new THREE.CapsuleGeometry(1.45,6.6,6,12), s*5.9,15.6,-.2, 1,1,1, -.12, s*.32); add(new THREE.CapsuleGeometry(1.2,5.4,6,12), s*3.5,9.6,3, 1,1,1, 1.25, -s*.78); }   // cánh tay + cẳng tay vào lòng
      add(new THREE.SphereGeometry(1,16,12), 0,8.6,4.5, 2.7,.85,1.9);                // đôi tay kết ấn thiền định
      add(new THREE.CylinderGeometry(1.7,2,2.2,16), 0,23.4,-.5);                    // cổ (3 ngấn)
      for(const y of [23,23.8]) add(new THREE.TorusGeometry(1.85,.12,6,20), 0,y,-.5, 1,1,1, Math.PI/2);
      add(new THREE.SphereGeometry(3.4,28,20), 0,27.4,-.3, 1,1.12,1);                // đầu (hơi dài)
      // tóc xoắn ốc: hàng trăm lọn tròn nhỏ phủ đỉnh + sau đầu
      { const curls=new THREE.InstancedMesh(new THREE.SphereGeometry(.38,8,6), gold, 260); let n=0; const m4=new THREE.Matrix4();
        for(let j=0;j<10;j++){ const th=.12+j*.16, rr=3.42, ring=Math.max(6,Math.round(Math.sin(th)*30)); for(let i=0;i<ring && n<260;i++){ const ph=i/ring*TAU, x=Math.sin(th)*Math.sin(ph)*rr, y=Math.cos(th)*rr*1.12, z=Math.sin(th)*Math.cos(ph)*rr; if(z>1.6 && y<2.6) continue; m4.makeTranslation(x, 27.4+y, -.3+z); curls.setMatrixAt(n++, m4); } }
        curls.count=n; curls.castShadow=true; g.add(curls); }
      add(new THREE.SphereGeometry(1.6,16,12), 0,31.4,-.4, 1,.9,1);                 // nhục kế (búi tóc trên đỉnh)
      for(const s of [-1,1]) add(new THREE.SphereGeometry(1,12,10), s*3.35,26.2,-.3, .5,2.1,.85);   // tai dài chạm vai
      // nét mặt: mắt khép hờ, mày cong, sống mũi, môi, ấn đường (vàng sẫm để nổi khối)
      const darkGold=std({color:0x8a6420, roughness:.4, metalness:.85});
      for(const s of [-1,1]){ const eye=new THREE.Mesh(new THREE.TorusGeometry(.62,.09,6,16,Math.PI*.9), darkGold); eye.position.set(s*1.25,27.6,2.92); eye.rotation.set(0,0,Math.PI+.15*s); g.add(eye);
        const brow=new THREE.Mesh(new THREE.TorusGeometry(.95,.1,6,18,Math.PI*.8), gold); brow.position.set(s*1.25,28.15,2.85); brow.rotation.set(-.2,0,.15*s+.12); g.add(brow); }
      add(new THREE.SphereGeometry(.5,12,10), 0,26.9,3.25, .8,1.6,1);                 // mũi
      { const lips=new THREE.Mesh(new THREE.TorusGeometry(.55,.1,6,14,Math.PI), darkGold); lips.position.set(0,25.55,3.05); lips.rotation.z=Math.PI; g.add(lips); }
      add(new THREE.SphereGeometry(.16,8,6), 0,28.5,3.2);                             // ấn đường (urna)
      const halo=new THREE.Mesh(new THREE.TorusGeometry(6.4,.32,10,56), gold); halo.position.set(0,27.4,-4.2); g.add(halo);
      const halo2=new THREE.Mesh(new THREE.TorusGeometry(10,.22,8,64), gold); halo2.position.set(0,18,-5.6); g.add(halo2);
      root.add(g); circles.push({x:Bc.x, z:Bc.z, r:10.6, y0:Bc.y-2, y1:Bc.y+40});
      label('🙏 Tượng Phật Linh Sơn', 'Cao 32 m trên đỉnh núi +98 m', Bc.x, Bc.y+40, Bc.z, 600, .9);
      place('🙏','Dev City – Đỉnh tượng Phật Linh Sơn (+98 m)','Mây trôi quanh chân tượng', Bc.x-u[0]*15, Bc.z-u[1]*15, Bc.x, Bc.z); }
    // mây trôi
    { const ct=canvas(256,128,(g,w,h)=>{ g.clearRect(0,0,w,h); for(let i=0;i<26;i++){ const x=w*(.15+R()*.7), y=h*(.35+R()*.35), r=h*(.18+R()*.22), gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(255,255,255,.85)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); } });
      const cm=new THREE.SpriteMaterial({map:ct, transparent:true, depthWrite:false, opacity:.85, fog:true}); const cg=new THREE.Group(); cg.position.set(Bc.x, 0, Bc.z); cg.userData.dynamic=true; root.add(cg);
      for(let i=0;i<16;i++){ const s=new THREE.Sprite(cm), a=i/16*TAU, r=26+R()*34; s.position.set(Math.cos(a)*r, 88+R()*14, Math.sin(a)*r); s.scale.set(34+R()*20, 14+R()*6, 1); cg.add(s); }
      out.clouds=cg; } }

  /* ============================== ⛵ BẾN DU THUYỀN (T1, x 640–770) ============================== */
  { const dist='river', yD=.75;
    for(const x of [652, 742, 778]){ put(MAT.wood, xf(rb(3.2, .35, 26, .06, 1), x, yD, -146), dist); addPlat(x, -146, 0, 1.6, 13, yD+.18);
      { const zq=-shoreD(x), z0=zq-2.6, z1=-158.6, n=6; for(let k=0;k<n;k++){ const t=(k+.5)/n, z=z0+(z1-z0)*t, y=Y1+(yD+.18-Y1)*t; addPlat(x, z, 0, 1.6, Math.abs(z1-z0)/n/2+.05, y); }   // S19g rà soát: dốc xuống bến (trước không có lối xuống – bước hụt xuống mái kè)
        const L0=Math.hypot(z1-z0, Y1-(yD+.18)), rg=rb(3.2,.25,L0,.05,1); xf(rg, x, (Y1+yD+.18)/2-.12, (z0+z1)/2, 0, Math.atan2(Y1-(yD+.18), z1-z0)); put(MAT.wood, rg, dist);
        for(const s of [-1,1]) addSeg(x+s*1.7, z0, x+s*1.7, -133, .15, -2, Y1+2, '⛵ Lan can cầu tàu'); addSeg(x-1.7, -133, x+1.7, -133, .15, -2, Y1+2, '⛵ Cuối cầu tàu'); }
      for(let z=-158; z<=-134; z+=4) for(const s of [-1,1]) put(MAT.woodDark, xf(cyl(.16,.16,3,8), x+s*1.5, yD-1, z), dist);
      for(const s of [-1,1]){ const yacht=new THREE.Group(); const hull=new THREE.Mesh(rb(3.4,1.6,12,.7,3), std({color:0xf7f7f5, roughness:.3})); hull.position.y=.3; yacht.add(hull);
        const cab=new THREE.Mesh(rb(2.6,1.4,5.5,.5,2), std({color:0x1d2b38, roughness:.15, metalness:.3})); cab.position.set(0,1.6,-.8); yacht.add(cab); yacht.position.set(x+s*4.6, -.2, -144); yacht.rotation.y=(s>0?.06:-.05); yacht.userData.dynamic=true; yacht.userData.bob=R()*6; root.add(yacht); (out.yachts=out.yachts||[]).push(yacht); } }
    // lối xuống bến: dốc nhỏ qua kè (tách lan can kè ở 3 bến)
    label('⛵ Bến du thuyền Dev City', 'Thềm 1 · bờ sông Bắc', 742, 9, -150, 300, .65); place('⛵','Dev City – Bến du thuyền','Bờ sông Bắc · du thuyền', 742, -163, 742, -140); }

  /* ============================== 🚗 QC AUTO SHOWROOM DEV CITY (T1 +2, x 320–412, sát Đại lộ Bến Sông) ============================== */
  // S19g 20/11 – theo chuẩn .claude/skills/qc-world-3d-design. BẢNG KIỂM (mẫu tự mô tả: "showroom ô tô chính hãng 2 tầng ven đại lộ"):
  //  NGOÀI: mặt dựng kính khung đồng đen (đố đứng 3,2 m, đố ngang chân/lửng/đỉnh) · tường hông + hậu ốp nhôm composite xám than (ron 1,2 m) · bệ đá granite
  //         · mái đua 3,6 m: tấm nhôm champagne, trần gỗ, đèn âm trần ấm, dải LED đỏ thương hiệu, cột tròn · hộp đèn chữ "QC AUTO" trên mái · máy lạnh mái
  //         · cửa trượt kính tự động 2 cánh (khung, kính, tay nắm 2 mặt – tự mở khi lại gần ≤ 4,5 m, E để vào) · bậc đá + thảm đỏ · băng rôn tường Tây
  //         · trụ totem 2 mặt đầu Tây · 4 bồn cây đá + bụi cây · cọc chắn xe (người lọt, xe không lọt) · 2 bàn xoay xe chủ lực · bãi trưng bày 2 bên
  //           (bóng AO dưới xe, giá bảng giá đứng – 1 texture 512² cho mọi mẫu) · Khu giao xe (vạch vàng + chữ sơn sàn)
  //  TRONG (nhìn qua kính, chi tiết chỉ dựng hiện khi ≤ 75 m): sàn đá bóng 1,2 m · trần thạch cao + đèn hắt ấm + đèn thả thanh · tường hậu ốp gỗ óc chó + logo đèn
  //         · tầng lửng lan can kính tay vịn inox + thang máy kính · 3 xe trên bục LED + 2 xe tầng lửng · quầy lễ tân (thân ốp, mặt đá, LED, màn hình) + ghế xoay
  //         · góc chờ: sofa (khung gỗ, 3 đệm ngồi tách múi, 3 đệm lưng, 2 tay vịn, chân inox) + bàn trà + thảm + cây chậu
  //  DÙNG ĐƯỢC: cửa trượt · E ở cửa → sảnh QC Auto (js/showroom.js: tư vấn viên, ngồi sofa, xem & mua) · E ở từng xe ngoài bãi → chọn màu & mua
  //             · xe mua giao bằng W.traffic.spawnVehicle → rẽ vào Khu giao xe → V.park → bấm V lái
  //  VA CHẠM (nạp ngay): toà (hộp), cột mái hiên, trụ totem, bồn cây, cọc chắn, xe trưng bày (2 vòng/xe), bàn xoay, giá bảng giá; bậc cửa = addPlat
  { const dist='showroom', SY=Y1+.08, V=ctx.V, SR=()=>W.showroom, CX=370, FZ=-197.6, BZ=-211.2, X0=344, X1=396, H=10, YT=Y1+H, FY=Y1+.3;
    const LOT={x0:320, x1:412, z0:-212.5, z1:-185};
    const GF=W.GFX||(W.GFX=createGFX({quality:W.QUAL||'low', msaa:!W.CINE})), GM=GF.M, KX=GKit(), KI=GKit();
    const pbrOf=(set,o={})=>new THREE.MeshStandardMaterial({map:set.map, normalMap:set.normalMap, roughnessMap:set.orm, aoMap:set.orm, roughness:1, metalness:0, ...o});
    const acp=pbrOf(GF.T.tile(0x3b4048, 1.2, 2.4, .32), {metalness:.35}), floorIn=pbrOf(GF.T.tile(0xcac5bc, 1.2, 2.4, .16)), plaster=pbrOf(GF.T.plaster(0xddd7cc));
    const alu=new THREE.MeshStandardMaterial({color:0xc6c0b6, roughness:.3, metalness:.75}), bronze=GM.mullionDark, glass=GM.glassClear, chrome=GM.chrome, granite=GM.granite, wood=GM.woodLight, walnut=GM.woodDark, warm=GM.lampWarm;
    const redLed=std({color:0xff4d61, emissive:0xff4d61, emissiveIntensity:1.4, roughness:.4}), dark=std({color:0x1d2127, roughness:.5, metalness:.3}),
      yel=std({color:0xe0b021, roughness:.6, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-6}), fabSofa=pbrOf(GF.T.fabric(0x59616c)),
      fabRug=pbrOf(GF.T.fabric(0x8a7a66), {polygonOffset:true, polygonOffsetFactor:-2}), carpet=pbrOf(GF.T.fabric(0x7e1d27), {polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-6});
    for(const m of [redLed, yel, fabRug, carpet]){ m.userData.noCast=true; m.userData.noMerge=true; }
    // ---- texture chữ (≤ 512², mỗi cái dùng chung cho mọi chỗ cùng nội dung) ----
    const ctex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
    const litM=(t,k=.8)=>{ const m=new THREE.MeshStandardMaterial({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:k, roughness:.45}); m.userData.noCast=true; m.userData.noMerge=true; return m; };
    const brand=(g,w)=>{ const gr=g.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#ff5a6e'); gr.addColorStop(1,'#ffb547'); return gr; };
    const logoM=litM(ctex(512,128,(g,w,h)=>{ g.fillStyle='#0d1117'; g.fillRect(0,0,w,h); g.fillStyle=brand(g,w); g.fillRect(0,h-12,w,12); g.fillStyle='#f3efe6'; g.font='900 80px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('QC AUTO', w/2, h/2-6, w*.9); }));
    const totemM=litM(ctex(256,512,(g,w,h)=>{ g.fillStyle='#0d1117'; g.fillRect(0,0,w,h); g.fillStyle=brand(g,w); g.fillRect(0,h*.62,w,10); g.fillStyle='#f3efe6'; g.textAlign='center'; g.textBaseline='middle';
      g.font='900 120px "Segoe UI",sans-serif'; g.fillText('QC',w/2,h*.26); g.font='800 64px "Segoe UI",sans-serif'; g.fillText('AUTO',w/2,h*.48); g.font='600 26px "Segoe UI",sans-serif'; g.fillStyle='#c9cfd8'; g.fillText('SHOWROOM Ô TÔ',w/2,h*.74,w*.9); g.fillText('XE MÁY · GIAO XE',w/2,h*.82,w*.9); }));
    const doorM=litM(ctex(512,96,(g,w,h)=>{ g.fillStyle='#10161e'; g.fillRect(0,0,w,h); g.fillStyle='#46d39a'; g.fillRect(0,0,8,h); g.fillStyle='#f3efe6'; g.font='700 40px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('LỐI VÀO SHOWROOM', w/2+4, h/2, w*.9); }), .6);
    const bannerM=litM(ctex(512,96,(g,w,h)=>{ g.fillStyle='#b8243a'; g.fillRect(0,0,w,h); g.strokeStyle='#f3efe6'; g.lineWidth=4; g.strokeRect(6,6,w-12,h-12); g.fillStyle='#f3efe6'; g.font='800 36px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('TRẢ GÓP 0% · GIAO XE TẬN BÃI', w/2, h/2, w*.92); }), .5);
    const floorTxtM=new THREE.MeshStandardMaterial({map:ctex(512,128,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='#e0b021'; g.font='900 72px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('KHU GIAO XE', w/2, h/2, w*.94); }),
      transparent:true, roughness:.7, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-6}); floorTxtM.userData.noCast=true;
    const MODELS=['mini','sedan','suv','pickup','sport','limo','lux','roadster'], infoOf=m=>{ const I=SR() && SR().INFO && SR().INFO[m]; return I || {name:(V && V.CARS && V.CARS[m] && V.CARS[m].name)||m, price:null}; };
    const atlasM=litM(ctex(512,512,(g,w)=>{ MODELS.forEach((m,i)=>{ const I=infoOf(m), x=(i%2)*256, y=Math.floor(i/2)*128; g.fillStyle='#10151d'; g.fillRect(x,y,256,128); g.fillStyle=brand(g,w); g.fillRect(x,y,256,8);
      g.textAlign='left'; g.textBaseline='alphabetic'; g.fillStyle='#f3efe6'; g.font='800 26px "Segoe UI",sans-serif'; g.fillText(I.name, x+14, y+46, 228); g.fillStyle='#ffd23f'; g.font='800 32px "Segoe UI",sans-serif'; g.fillText(I.price!=null ? fmt(I.price)+' 💰' : '—', x+14, y+88, 228);
      g.fillStyle='#8fd9b6'; g.font='600 17px "Segoe UI",sans-serif'; g.fillText('Bấm E: chọn màu & mua', x+14, y+116, 228); }); }), .55);
    const cellGeo=i=>{ const g=new THREE.PlaneGeometry(.58,.29), uv=g.attributes.uv, c=i%2, r=Math.floor(i/2); for(let k=0;k<uv.count;k++) uv.setXY(k, (c+uv.getX(k))/2, (3-r+uv.getY(k))/4); return g; };
    // bóng AO giả dưới đồ: mặt phẳng UV 0..1 (GF.aoDecal dùng UV theo mét → texture lặp mỗi mét thành ô vuông tối – thấy khi chạy thử 21/11)
    const aoD=(K,x,y,z,w,d,ry=0,pad=.4)=>K.add(new THREE.PlaneGeometry(w+2*pad, d+2*pad), GM.aoDecal, x, y+.02, z, ry, -Math.PI/2);
    const loc=(K,X,Y,Z,ry)=>{ const c=Math.cos(ry), s=Math.sin(ry); return (geo,mat,lx=0,ly=0,lz=0,rx=0,rz=0,ry2=0)=>K.add(geo, mat, X+lx*c+lz*s, Y+ly, Z-lx*s+lz*c, ry+ry2, rx, rz); };

    // ---- nền lát + bó vỉa đá + sàn đứng ----
    put(MAT.paving, capGeo([[LOT.x0,LOT.z0],[LOT.x1,LOT.z0],[LOT.x1,LOT.z1],[LOT.x0,LOT.z1]], SY), dist);
    for(const [x0,x1,z0,z1] of [[LOT.x0,LOT.x1,LOT.z1-.3,LOT.z1],[LOT.x0,LOT.x0+.3,LOT.z0,LOT.z1],[LOT.x1-.3,LOT.x1,LOT.z0,LOT.z1]]) KX.add(cbox(x1-x0, .3, z1-z0, .03), granite, (x0+x1)/2, SY-.13, (z0+z1)/2);
    addPlat((LOT.x0+LOT.x1)/2, (LOT.z0+LOT.z1)/2, 0, (LOT.x1-LOT.x0)/2, (LOT.z1-LOT.z0)/2, SY);
    occ(LOT.x0-2, LOT.x1+2, LOT.z0-1, LOT.z1);

    // ---- vỏ toà ----
    KX.add(cbox(X1-X0+.6, .32, FZ-BZ+.6, .03), granite, CX, Y1+.16, (FZ+BZ)/2);                                   // bệ đá
    KX.add(cbox(X1-X0, H, .5, .03), acp, CX, Y1+H/2, BZ);                                                         // tường hậu
    for(const x of [X0, X1]) KX.add(cbox(.5, H, FZ-BZ, .03), acp, x, Y1+H/2, (FZ+BZ)/2);                          // tường hông
    const DW=1.65, GY0=FY, GY1=YT-.45;
    for(const [a,b] of [[X0+.25, CX-DW],[CX+DW, X1-.25]]){ KX.add(planeM(b-a, GY1-GY0), glass, (a+b)/2, (GY0+GY1)/2, FZ); KX.add(cbox(b-a, .14, .24, .02), bronze, (a+b)/2, GY0+.07, FZ); }
    KX.add(planeM(2*DW, GY1-(FY+2.97)), glass, CX, (FY+2.97+GY1)/2, FZ);                                             // kính trên cửa
    for(let x=X0+.25; x<=X1-.24; x+=3.2){ if(Math.abs(x-CX)<DW+.1) continue; KX.add(cbox(.12, GY1-GY0, .22, .02), bronze, x, (GY0+GY1)/2, FZ); }
    for(const y of [Y1+5, GY1-.07]) KX.add(cbox(X1-X0-.5, .14, .24, .02), bronze, CX, y, FZ);
    KX.add(cbox(.12, 1.7, 7.6, .02), dark, X0-.3, Y1+6.6, (FZ+BZ)/2); KX.add(new THREE.PlaneGeometry(7.2, 1.35), bannerM, X0-.37, Y1+6.6, (FZ+BZ)/2, -Math.PI/2);   // băng rôn tường Tây
    // ---- mái + mái hiên đua 3,6 m ----
    const RZ0=-194, RZ1=BZ-.4, RC=(RZ0+RZ1)/2, RW=X1-X0+4;
    KX.add(cbox(RW, .9, RZ0-RZ1, .05), alu, CX, YT+.45, RC);
    for(const [w,d,x,z] of [[RW,.14,CX,RZ0+.07],[RW,.14,CX,RZ1-.07],[.14,RZ0-RZ1,CX-RW/2+.07,RC],[.14,RZ0-RZ1,CX+RW/2-.07,RC]]) KX.add(cbox(w,.4,d,.02), alu, x, YT+1.1, z);   // gờ mái
    KX.add(planeM(RW-.3, RZ0-FZ-.15), wood, CX, YT-.01, (FZ+RZ0)/2, 0, Math.PI/2);                                  // trần gỗ mái hiên
    for(let x=CX-24; x<=CX+24.01; x+=4) for(const z of [-195.1,-196.6]) KX.add(cylM(.09,.09,.03,24), warm, x, YT-.03, z);   // đèn âm trần
    KX.add(cbox(RW, .12, .08, .01), redLed, CX, YT+.2, RZ0-.03);                                                   // LED thương hiệu
    for(const x of [346, 358, 382, 394]){ KX.add(cylM(.2,.2,H,24), alu, x, Y1+H/2, -194.9); KX.add(cylM(.32,.32,.08,24), bronze, x, SY+.04, -194.9); circles.push({x, z:-194.9, r:.34, y0:Y1-1, y1:YT}); }
    KX.add(cbox(10, 2.7, .5, .05), bronze, CX, YT+2.25, RZ0-.7); KX.add(new THREE.PlaneGeometry(9.6, 2.4), logoM, CX, YT+2.25, RZ0-.44);   // hộp đèn chữ trên mái
    for(const [dx,dz] of [[-15,-206],[0,-208],[14,-205]]){ KX.add(cbox(3, 1.3, 2, .05), GM.shutter, CX+dx, YT+.9+.65, dz); KX.add(cylM(.6,.6,.05,24), dark, CX+dx, YT+.9+1.32, dz); }
    // ---- cửa: khung, bậc đá, thảm, biển "lối vào" ----
    for(const s of [-1,1]) KX.add(cbox(.16, 2.9, .26, .02), bronze, CX+s*DW, FY+1.45, FZ);
    KX.add(cbox(2*DW+.16, .22, .26, .02), bronze, CX, FY+2.86, FZ);
    KX.add(cbox(3.7, .8, .1, .02), dark, CX, FY+3.4, FZ+.08); KX.add(new THREE.PlaneGeometry(3.5, .656), doorM, CX, FY+3.4, FZ+.14);
    KX.add(cbox(2*DW+1.2, .14, .7, .02), granite, CX, SY+.07, FZ+.5); addPlat(CX, FZ+.5, 0, DW+.6, .35, SY+.14);
    KX.add(planeM(3, 4.2), carpet, CX, SY+.03, FZ+2.95, 0, -Math.PI/2);   // 21/11 test: 1,2 cm thua lớp lát (zfix kéo lát lên) → 3 cm
    // cánh cửa trượt (động): khung đồng đen + kính + tay nắm inox 2 mặt
    const LW=DW-.06, leaves=[-1,1].map(s=>{ const g=new THREE.Group(), k=GKit();
      k.add(cbox(LW, .08, .07, .01), bronze, 0, .04, 0); k.add(cbox(LW, .08, .07, .01), bronze, 0, 2.62, 0); for(const e of [-1,1]) k.add(cbox(.08, 2.66, .07, .01), bronze, e*(LW/2-.04), 1.33, 0);
      k.add(planeM(LW-.12, 2.5), glass, 0, 1.33, 0); for(const e of [-1,1]) k.add(cylM(.018,.018,1.2,24), chrome, -s*(LW/2-.16), 1.15, e*.07);
      k.build(g, {cast:false}); g.name='showroomDoor'; g.userData.dynamic=true; g.position.set(CX+s*LW/2, FY, FZ-.1); root.add(g); return {g, s}; });
    const DOOR={o:0, hold:0, pend:null};
    // ---- trụ totem 2 mặt (đầu Tây) ----
    { const px=321.8, pz=-187.2; KX.add(cbox(1.2,.5,1.9,.04), granite, px, SY+.25, pz); KX.add(cbox(.8, 8.6, 1.5, .05), acp, px, SY+.5+4.3, pz); KX.add(cbox(.9,.2,1.6,.03), alu, px, SY+9.2, pz);
      for(const s of [-1,1]) KX.add(new THREE.PlaneGeometry(1.3, 2.6), totemM, px+s*.41, SY+6.2, pz, s*Math.PI/2);
      block(px-.6, px+.6, pz-.95, pz+.95, Y1-1, Y1+10, 'Trụ biển hiệu QC Auto'); }
    // ---- bồn cây đá + cọc chắn xe dọc vỉa hè (chừa lối xe: bãi Tây x < 330 · Khu giao xe x > 398) ----
    const PZ=LOT.z1-.8; let seed=7;
    for(const [a,b] of [[331,337],[362,366.6],[373.4,378],[391,397]]){ const x=(a+b)/2; KX.add(cbox(b-a,.6,.9,.04), granite, x, SY+.3, PZ); KX.add(planeM(b-a-.16,.74), GM.moss, x, SY+.565, PZ, 0, -Math.PI/2);
      for(let u=a+.7; u<b-.4; u+=1.3) GF.addTree(KX, 'bush', u, SY+.55, PZ+(R()-.5)*.2, .8+R()*.25, R()*TAU, seed++);
      boxes.push({x0:a, x1:b, z0:PZ-.45, z1:PZ+.45, y0:Y1-1, y1:Y1+1.5, msg:'Bồn cây'}); }
    { const bol=inst(cylM(.11,.13,.85,24), bronze), add=x=>{ bol.add(x, SY+.42, LOT.z1-.6); circles.push({x, z:LOT.z1-.6, r:.15, y0:Y1-1, y1:Y1+1.2}); };
      for(const [a,b] of [[338.2,361],[379.2,389.8]]){ const n=Math.ceil((b-a)/2.2); for(let i=0;i<=n;i++) add(a+(b-a)*i/n); } for(const x of [368.2,370,371.8]) add(x); bol.build(); }
    block(X0-.3, X1+.3, BZ-.4, FZ+.15, Y1-3, YT+3, '🚗 QC Auto Showroom – vào bằng cửa chính (E)');

    // ---- xe trưng bày: gộp theo vật liệu (sơn mỗi xe là vật liệu riêng → gom theo thuộc tính) + bóng AO dưới gầm ----
    const MC=new Map(), canon=m=>{ const k=[m.type, m.color?m.color.getHex():'', m.metalness, m.roughness, m.opacity, m.transparent, m.clearcoat, m.map?m.map.uuid:'', m.emissive?m.emissive.getHex():'', m.side].join('|'); let r=MC.get(k); if(!r) MC.set(k, r=m); return r; };
    const carInto=(K,model,color,x,y,z,h)=>{ if(!V || !V.buildCar) return; const g=V.buildCar(color, model); g.position.set(x,y,z); g.rotation.y=h; g.updateMatrixWorld(true);
      g.traverse(o=>{ if(o.isMesh && o.geometry && o.material && !Array.isArray(o.material)) K.add(o.geometry.clone().applyMatrix4(o.matrixWorld), canon(o.material)); }); aoD(K, x, y, z, 1.9, 4.6, h, .45); };
    const stand=(model,x,z,h)=>{ const i=MODELS.indexOf(model); if(i<0) return; const P2=loc(KX, x, SY, z, h);
      P2(cbox(.44,.04,.32,.01), bronze, 0, .02, 0); P2(cylM(.03,.03,1.02,24), chrome, 0, .53, 0); P2(cbox(.66,.37,.05,.01), bronze, 0, 1.18, 0, -.22); P2(cellGeo(i), atlasM, 0, 1.18+.006, .03, -.22);
      circles.push({x, z, r:.26, y0:Y1-1, y1:Y1+1.6}); };
    const TURN=[];
    const showCar=(model,color,x,z,h,turn)=>{ const I=infoOf(model), f=[Math.sin(h),Math.cos(h)], rt=[-Math.cos(h),Math.sin(h)];
      if(turn){ KX.add(cylM(3.3,3.4,.2,48), alu, x, SY+.1, z); KX.add(cylM(3.15,3.15,.04,48), GM.stoneDark, x, SY+.22, z); const ring=new THREE.TorusGeometry(3.33,.045,6,64); ring.rotateX(Math.PI/2); KX.add(ring, redLed, x, SY+.2, z);
        circles.push({x, z, r:3.3, y0:Y1-1, y1:Y1+2.4});
        if(V && V.buildCar){ const tt=new THREE.Group(); tt.position.set(x, SY+.24, z); tt.rotation.y=h; tt.add(V.buildCar(color, model)); try{ compactGroup(W, tt); }catch(e){} tt.userData.dynamic=true; root.add(tt); TURN.push(tt); }
        stand(model, x+(x<CX?-4.7:4.7), z+.4, 0); }
      else { carInto(KX, model, color, x, SY, z, h); for(const k of [-1.25, 1.25]) circles.push({x:x+f[0]*k, z:z+f[1]*k, r:1.05, y0:Y1-1, y1:Y1+2.2}); stand(model, x+rt[0]*2.2+f[0]*1.1, z+rt[1]*2.2+f[1]*1.1, h); }
      INTER.push({x, z, r:turn?4.6:3.4, prio:.4, label:`🚗 ${I.name}${I.price?` · ${fmt(I.price)} 💰`:''} – xem màu & mua (E)`, action:()=>{ const s=SR(); if(s && s.buy) s.buy(model, color); else toast('Showroom đang chuẩn bị, thử lại sau nhé.'); }}); };
    showCar('sport', 0xb3122e, 355, -190.6, .5, true); showCar('roadster', 0xf2b705, 385, -190.6, -.5, true);              // sân trước: 2 bàn xoay
    [['suv',0x111111],['pickup',0x9aa3ad],['sedan',0x2a6fdb],['mini',0x46d39a],['lux',0x8e9aa6],['limo',0x111111]].forEach(([m,c],i)=>showCar(m, c, i%2 ? 336.4 : 326.4, -190.6-Math.floor(i/2)*7, i%2 ? -.42 : .42));   // bãi Tây
    showCar('pickup', 0xf2b705, 405.5, -202.2, -.35); showCar('mini', 0xb3122e, 405.5, -208.8, -.35);                       // bãi Đông (sau Khu giao xe)

    // ---- Khu giao xe (góc Đông) ----
    const BAY={x:405, z:-193.6, h:Math.PI}, BIKE={x:410.4, z:-192.4, h:0}, LANE={x:411, z:-178.6};   // làn hướng Tây của đại lộ 4 làn: tim −176, lệch 2,6 m (v2traffic e.off)
    for(const s of [-1,1]) KX.add(planeM(.14, 5.8), yel, BAY.x+s*1.5, SY+.025, BAY.z, 0, -Math.PI/2); KX.add(planeM(3.14, .14), yel, BAY.x, SY+.025, BAY.z-2.9, 0, -Math.PI/2);
    for(const s of [-1,1]) KX.add(planeM(.1, 2.4), yel, BIKE.x+s*.6, SY+.025, BIKE.z, 0, -Math.PI/2);
    KX.add(new THREE.PlaneGeometry(4.4, 1.1), floorTxtM, BAY.x, SY+.028, -189.3, 0, -Math.PI/2);

    // ---- TRONG TOÀ (thấy qua kính) – nhóm riêng, chỉ hiện khi ≤ 75 m ----
    { const MZ0=-204.6, MZ1=BZ+.25, MY=Y1+5, IW=X1-X0-.5;
      KI.add(planeM(IW, FZ-BZ-.5), floorIn, CX, FY+.035, (FZ+BZ)/2, 0, -Math.PI/2);   // trên mặt bệ đá (FY+.02) 1,5 cm
      KI.add(planeM(IW, FZ-BZ-.5), plaster, CX, YT-.02, (FZ+BZ)/2, 0, Math.PI/2);
      for(const s of [-1,1]) KI.add(planeM(FZ-BZ-.5, H-.4), plaster, s<0 ? X0+.26 : X1-.26, Y1+H/2, (FZ+BZ)/2, -s*Math.PI/2);
      KI.add(planeM(IW-.1, 4.6), walnut, CX, FY+2.3, BZ+.27); for(let x=X0+1; x<X1-.5; x+=1.2) KI.add(cbox(.06, 4.6, .06, .01), bronze, x, FY+2.3, BZ+.31);
      KI.add(cbox(10.4, 2.8, .2, .03), bronze, CX, Y1+7.7, BZ+.36); KI.add(new THREE.PlaneGeometry(10, 2.5), logoM, CX, Y1+7.7, BZ+.47);
      // tầng lửng: sàn đá, mép nhôm, lan can kính + tay vịn inox
      KI.add(cbox(IW-.1, .32, MZ0-MZ1, .03), plaster, CX, MY-.16, (MZ0+MZ1)/2); KI.add(planeM(IW-.1, MZ0-MZ1), floorIn, CX, MY+.005, (MZ0+MZ1)/2, 0, -Math.PI/2);
      KI.add(cbox(IW-.1, .1, .08, .01), alu, CX, MY-.27, MZ0); KI.add(planeM(IW-.3, 1.0), glass, CX, MY+.55, MZ0+.05);
      KI.add(cylM(.03,.03,IW-.3,24), chrome, CX, MY+1.08, MZ0+.05, 0, 0, Math.PI/2); for(let x=X0+1.5; x<X1-1; x+=2.4) KI.add(cbox(.05, 1.05, .05, .01), chrome, x, MY+.53, MZ0+.05);
      { const lx=X1-2.4, lz=-206; KI.add(cylM(1,1,H-.5,32,true), glass, lx, Y1+H/2, lz); for(const y of [FY+.05, MY, YT-.3]) KI.add(cylM(1.03,1.03,.1,32), chrome, lx, y, lz); }   // thang máy kính
      // đèn: hắt trần ấm 2 dải + đèn thả thanh trên xe + đèn âm dưới sàn lửng
      for(const z of [FZ-.7, MZ0+.6]) KI.add(cbox(IW-1, .06, .3, .01), warm, CX, YT-.12, z);
      for(const x of [357, 370, 383]){ KI.add(cbox(6, .07, .12, .01), warm, x, YT-1.6, -202.3); for(const e of [-2.6, 2.6]) KI.add(cylM(.006,.006,1.55,6), dark, x+e, YT-.8, -202.3); }
      for(let x=X0+3; x<X1-2; x+=4) KI.add(cylM(.09,.09,.03,24), warm, x, MY-.34, -207.8);
      // xe + bục LED
      for(const [m,c,x,h] of [['suv',0x1f7a4d,357,.6],['lux',0x111111,CX,0],['sedan',0xb3122e,383,-.6]]){ KI.add(cylM(2.8,2.9,.16,48), alu, x, FY+.08, -202.3); const rg=new THREE.TorusGeometry(2.86,.035,6,64); rg.rotateX(Math.PI/2); KI.add(rg, redLed, x, FY+.15, -202.3); carInto(KI, m, c, x, FY+.16, -202.3, h); }
      for(const [m,c,x,h] of [['roadster',0xb3122e,358,.5],['sport',0x2a6fdb,382,-.5]]) carInto(KI, m, c, x, MY, -208, h);
      // quầy lễ tân (góc Đông, quay về cửa) + ghế xoay + màn hình
      { const P2=loc(KI, 390.6, FY, -201.4, -Math.PI/2);
        P2(cbox(4.2, 1.05, .8, .04), acp, 0, .525, 0); P2(cbox(4.4, .06, 1.0, .02), granite, 0, 1.08, .05); P2(cbox(4.2, .04, .03, .01), redLed, 0, .18, .41);
        P2(cbox(.62, .38, .04, .01), dark, .8, 1.36, -.2); P2(cylM(.02,.02,.2,16), chrome, .8, 1.15, -.2); P2(new THREE.PlaneGeometry(.56,.32), GM.screen, .8, 1.36, -.223, 0, 0, Math.PI);   // màn hình quay về phía lễ tân
        furnitureLib(W).place('officeChairExec', {x:390.6+.95, y:FY, z:-201.4, yaw:-Math.PI/2, material:'leather', color:'#2a2523', sit:false}); }   // 21/11: ghế xoay da lưng cao W.FURN (bản khối cũ: backup _20261121_furn)
      // góc chờ: sofa có cấu trúc + bàn trà + thảm + cây chậu
      { const P2=loc(KI, 349.4, FY, -201.6, Math.PI/2);
        P2(planeM(3.2, 2.6), fabRug, 0, .045, .7, -Math.PI/2);
        { const F=furnitureLib(W); F.place('sofa', {x:349.4, y:FY, z:-201.6, yaw:Math.PI/2, w:2.4, material:'boucle', color:'#59616c', frame:'chrome', accent:'velvet:#b3122e', sit:false});   // 21/11: sofa + bàn trà W.FURN
          F.place('coffeeTable', {x:349.4+1.25, y:FY, z:-201.6, yaw:Math.PI/2, material:'walnut', sit:false}); }
        aoD(KI, 349.4, FY+.03, -201.6, 2.4, .9, Math.PI/2, .25); }
      { const prof=[[0,0],[.19,0],[.21,.03],[.27,.42],[.3,.45],[.28,.47]].map(([r,y])=>new THREE.Vector2(r,y)), pot=new THREE.LatheGeometry(prof, 24);
        for(const [x,z] of [[346.2,-199],[393.6,-199.2],[346.2,-209.6]]){ KI.add(pot, dark, x, FY, z); GF.addTree(KI, 'fig', x, FY+.44, z, 1.2, R()*TAU, seed++); } } }

    // ---- dựng: ngoài (luôn hiện) · trong (gần mới hiện) ----
    const exG=new THREE.Group(); exG.name='showroomExterior'; root.add(exG); KX.build(exG);
    const inG=new THREE.Group(); inG.name='showroomInterior'; root.add(inG); KI.build(inG, {cast:false}); inG.visible=false; inG.userData.dynamic=true;   // dynamic: batchStatic không gộp ra khỏi nhóm → bật/tắt theo khoảng cách vẫn đúng
    label('🚗 QC Auto Showroom', 'Dev City · ô tô · xe máy · mua xe giao tận bãi', CX, YT+5.2, FZ+1, 320, .7);
    label('🔑 Khu giao xe', 'Xe mua ở showroom được giao tới đây · bấm V để lái', BAY.x+2.4, Y1+3.2, BAY.z-1, 60, .45);
    place('🚗','Dev City – QC Auto Showroom','Showroom ô tô & xe máy · bãi trưng bày · mua xe giao tận nơi', CX, -188.6, CX, -205);
    INTER.push({x:CX, z:FZ+1.4, r:2.6, label:'🚗 Vào QC Auto Showroom – xem & mua xe (E)', action:()=>{ const s=SR(); if(!s || !s.enter){ toast('Showroom đang chuẩn bị, thử lại sau nhé.'); return; } DOOR.hold=1.5; if(DOOR.o>.85) s.enter(); else DOOR.pend=s; }});

    // ---- nối với sảnh showroom (js/showroom.js): cửa ra + giao xe sau khi mua ----
    const DLV={pending:null, inside:false, s:null, g:null, st:'', t:0, A:null};
    const garageV=()=>(W.life && W.life.V) || V;
    const unhide=()=>{ if(DLV.hid){ DLV.hid.visible=true; DLV.hid=null; } };
    const parkNow=type=>{ unhide(); const L=garageV(), b=type==='bike' ? BIKE : BAY; if(!L || !L.park) return false; const o=L.park(type, {x:b.x, z:b.z, y:SY, h:b.h}); if(o) o.visible=true; return true; };
    const cancel=()=>{ unhide(); if(DLV.s && DLV.s.active) DLV.s.remove(); if(DLV.g && DLV.g.parent) DLV.g.parent.remove(DLV.g); DLV.s=null; DLV.g=null; DLV.st=''; };
    function startDelivery(){ const info=DLV.pending, loud=DLV.inside; DLV.pending=null; cancel();
      if(info.type==='bike'){ parkNow('bike'); if(loud) toast('🛵 Xe tay ga đỗ sẵn ở Khu giao xe (góc Đông showroom) – bấm V để lên xe.', 4500); return; }
      const tr=W.traffic, RN=W.roadNet; let s=null;
      // xuất phát từ nút ĐÔNG của chính cạnh đại lộ trước showroom → luôn chạy về hướng Tây, đúng làn sát showroom (route từ 1 điểm cùng cạnh sẽ chọn nút Tây → chạy ngược, không dừng)
      try{ const n=RN && RN.nearest ? RN.nearest(LANE.x, LANE.z, 30) : null, e=n && n.e, from=e ? (e.a.x>e.b.x ? e.a : e.b) : null;
        if(tr && tr.spawnVehicle && from && Math.abs(from.x-LANE.x)>25) s=tr.spawnVehicle('civil', {x:LANE.x, z:LANE.z}, {from, stop:3, color:info.color, top:.75}); }catch(e){ console.warn('[devcity showroom] giao xe', e); }
      if(!s){ parkNow('car'); toast('🔑 Xe mới đã đỗ ở Khu giao xe trước showroom – bấm V để lái!', 4500); return; }
      // thân xe giao = đúng mẫu + màu vừa mua (xe 'civil' của giao thông mặc định là sedan) – đèn khẩn cấp vẫn của xe gốc
      if(V && V.buildCar){ for(const c of s.g.children) if(!(s.lamps||[]).includes(c)) c.visible=false; s.g.add(V.buildCar(info.color, info.model)); }
      DLV.s=s; DLV.g=s.g; DLV.st='drive'; DLV.t=0;
      { const gc=garageV() && garageV().garage && garageV().garage.car; if(gc){ gc.visible=false; DLV.hid=gc; } }   // xe cũ (đã đổi sang mẫu mới) đang đỗ chỗ khác: ẩn tới khi xe giao tới → không thấy 2 chiếc
      if(loud) toast('🚚 Xe của bạn đang được giao tới theo Đại lộ Bến Sông – đứng chờ ở Khu giao xe (góc Đông) nhé!', 5000); }
    const hook=()=>{ const s=SR(); if(!s || !s.setExit || !s.onBuy) return; hook.done=true;
      s.setExit(()=>({x:CX, z:FZ+2.6, face:0}));   // ra cửa: đứng trên thảm đỏ, quay mặt ra đại lộ (cửa trượt tự mở vì đứng gần)
      s.onBuy(info=>{ DLV.pending=info; DLV.inside=!!s.on; const I=infoOf(info.model||'');
        return info.type==='car' ? `🎉 Chúc mừng! ${I.name||'Xe mới'} đang được giao tới Khu giao xe (góc Đông showroom)${s.on?' – ra ngoài xem xe chạy tới nhé':''}. Tới nơi bấm V để lái.` : '🎉 Đã mua xe tay ga – xe đỗ sẵn ở Khu giao xe trước showroom.'; }); };
    hook();   // W.showroom dựng trong life.js trước khi nạp module V2 – phòng hờ: thử lại ở khung hình sau
    const yawTo=(h0,h1,t)=>{ let d=h1-h0; d=Math.atan2(Math.sin(d), Math.cos(d)); return h0+d*t; };
    let lastN=-1;
    HOOK.onFrame.push((dt)=>{ dt=Math.min(dt,.1); if(!hook.done) hook();
      const nk=W.night||0; if(Math.abs(nk-lastN)>.02){ lastN=nk; try{ GF.setTime(1-nk*.95, nk); }catch(e){} }   // đèn ấm / màn hình bộ GFX sáng theo đêm
      const dP=Math.hypot(P.x-CX, P.z+204); inG.visible=!W.inside && (inG.visible ? dP<85 : dP<75);
      for(const t of TURN) t.rotation.y+=dt*.3;
      // cửa trượt: tự mở khi người chơi đứng gần cửa (ngoài trời), đóng lại khi đi xa · E ở cửa: mở hẳn rồi mới vào sảnh
      if(DOOR.hold>0) DOOR.hold-=dt; const want=(DOOR.hold>0 || (!W.inside && Math.hypot(P.x-CX, P.z-(FZ+1.2))<4.5)) ? 1 : 0;
      if(DOOR.o!==want){ DOOR.o=clamp(DOOR.o+Math.sign(want-DOOR.o)*dt*1.8, 0, 1); const k=DOOR.o*DOOR.o*(3-2*DOOR.o); for(const L of leaves) L.g.position.x=CX+L.s*(LW/2+LW*.96*k); }
      if(DOOR.pend && DOOR.o>.85){ const s=DOOR.pend; DOOR.pend=null; s.enter(); }
      if(DLV.pending && !(SR() && SR().on) && !W.inside) startDelivery();
      if(!DLV.st) return; DLV.t+=dt; const s=DLV.s, g=DLV.g, L=garageV();
      if(L && L.riding && L.riding() && L.riding().type==='car'){ cancel(); return; }   // người chơi đã tự gọi xe (V) → bỏ màn giao
      if(DLV.st==='drive'){ if(!s.active){ cancel(); parkNow('car'); return; }
        if(s.arrived || DLV.t>120){ if(!s.arrived){ cancel(); parkNow('car'); return; } DLV.A={x:g.position.x, z:g.position.z, h:s.h}; s.remove(); W.scene.add(g); DLV.st='turn'; DLV.t=0; } return; }
      // rẽ phải vào Khu giao xe theo cung Bézier, nháy đèn khẩn cấp
      const u=clamp(DLV.t/5.5,0,1), k=u*u*(3-2*u), A=DLV.A, C={x:BAY.x+1.5, z:A.z}, a=(1-k)*(1-k), b=2*k*(1-k), c=k*k, x=A.x*a+C.x*b+BAY.x*c, z=A.z*a+C.z*b+BAY.z*c;
      g.position.set(x, z<LOT.z1 ? SY : Y1, z); g.rotation.set(0, yawTo(A.h, BAY.h, k), 0); const bl=Math.floor(DLV.t*2.5)%2; for(const l of (s.lamps||[])) l.visible=!!bl;
      if(u>=1){ W.scene.remove(g); DLV.g=null; DLV.s=null; DLV.st=''; parkNow('car'); toast('🔑 Xe mới đã giao tới Khu giao xe! Lại gần bấm V để lái.', 5000); } });
    out.showroom={DLV, BAY, LOT, DOOR, startDelivery, TURN, exG, inG}; }

  /* ============================== CÂY XANH (rải trên nền cỏ thoải, tránh đường / công trình / mặt nước) ============================== */
  { const trunk=inst(cyl(.18,.3,3.2,7), MAT.bark), crown1=inst(new THREE.IcosahedronGeometry(1.9,1), MAT.leaf), crown2=inst(new THREE.IcosahedronGeometry(1.5,1), MAT.leaf2), pine=inst(new THREE.ConeGeometry(1.8,6.5,8), MAT.leaf2);
    const near=(x,z)=>{ for(const q of OCC) if(x>q.x0-3 && x<q.x1+3 && z>q.z0-3 && z<q.z1+3) return true; return false; };
    let n=0; for(let i=0;i<5200 && n<1300;i++){ const x=110+R()*730, z=-940+R()*800, h=hAt(x,z); if(h===null || h<2.5) continue;
      const hx=(hAt(x+2,z)??h)-(hAt(x-2,z)??h), hz=(hAt(x,z+2)??h)-(hAt(x,z-2)??h); if(Math.hypot(hx,hz)/4>.55) continue;
      const rr=K.RS && (()=>{ let bd=1e9; for(let k=0;k<K.RS.length;k+=7){ const q=K.RS[k], dd=(q.x-x)**2+(q.z-z)**2; if(dd<bd) bd=dd; } return Math.sqrt(bd); })(); if(rr<9) continue;
      if(near(x,z)) continue; if(Math.hypot((x-LAKE.x)/(LAKE.rx+6),(-z-LAKE.d)/(LAKE.rz+6))<1) continue; if(-z<200 && x<620) continue;   // bờ sông phía Tây là phố
      if(z<-740 && x<620) continue;   // khu sân bay
      const s=.8+R()*.6, rot=R()*TAU; if(h>70 || Math.hypot(x-PB.x, -z-PB.d)<70 || Math.hypot(x-PA.x, -z-PA.d)<60){ pine.add(x, h+3.1*s, z, rot, s); trunk.add(x, h+1.2*s, z, rot, s*.8); }
      else { trunk.add(x, h+1.6*s, z, rot, s); (R()<.5?crown1:crown2).add(x, h+4.2*s, z, rot, s); } circles.push({x, z, r:.4*s}); n++; }
    trunk.build(); crown1.build(); crown2.build(); pine.build(); out.trees=n; }

  /* ============================== CẬP NHẬT MỖI KHUNG: máy bay cất cánh · mây · du thuyền nhấp nhô ============================== */
  HOOK.onFrame.push((dt,T)=>{ dt=Math.min(dt,.1);
    const tk=out.takeoff; if(tk){ tk.t=(tk.t+dt)%80; const t=tk.t, p=tk.p; if(t<6){ p.visible=true; p.position.set(150, Y4+3.3, -885); p.rotation.set(0, Math.PI/2, 0); }
      else if(t<30){ const k=t-6, s=.5*1.45*k*k; p.position.set(150+Math.min(s,460), Y4+3.3+(s>300 ? (s-300)*.12 : 0), -885); p.rotation.set(s>280 ? -Math.min(.22,(s-280)*.003) : 0, Math.PI/2, 0, 'YXZ'); }
      else if(t<42){ const k=t-30; p.position.x+=dt*78; p.position.y+=dt*16; p.rotation.set(-.22, Math.PI/2, 0, 'YXZ'); } else p.visible=false; }
    if(out.clouds) out.clouds.rotation.y+=dt*.012;
    if(out.yachts) for(const y of out.yachts){ y.position.y=-.2+Math.sin(T*1.1+y.userData.bob)*.08; y.rotation.z=Math.sin(T*.8+y.userData.bob)*.025; } });
  return out;
}
