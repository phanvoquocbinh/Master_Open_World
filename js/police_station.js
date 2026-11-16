// QC World V2 – Pha 10: SỞ CẢNH SÁT QC CITY · 113 (đặc tả docs/PHA10_AN_NINH_SU_KIEN.md · phiên bot đi bộ, 16/11/2026)
//  📍 Đất đề xuất (x 215–255, z 278–302) đã có tháp căn hộ River Tech → dời xuống lô trống gần nhất trong CBD: x 214–244, z 354–382 (ghi LAND_CLAIMS.md),
//     mặt tiền quay Tây ra Đường Tây CBD (x = 198). Tông Xanh Navy – Trắng – Vàng Kim, 3 tầng + mái có bãi đáp trực thăng.
//  🏢 Tầng 1: 3 gara mở ra mặt tiền · Sảnh trực ban 113 (quầy, quốc huy sao vàng, ghế chờ) · Khu tạm giữ 3 buồng song sắt (W.police.jail nhốt trộm bắt ngoài phố).
//     Tầng 2: Phòng chỉ huy – màn hình bản đồ an ninh V2 sống (đường, xe tuần tra chớp đỏ–xanh, sự kiện đang diễn ra) + 2 dãy bàn trực.
//     Tầng 3: Phòng giao ban (ghế, bảng giao ban, tủ đồ). Mái: bãi trực thăng (vòng vàng + chữ H) + trực thăng tuần tra đậu sẵn.
//     Lên tầng: thang máy liftkit (bước vào cabin, chọn tầng).
//  🚓 4 xe tuần tra + 8 cảnh sát đi bộ chạy trong js/v2traffic.js (cùng hệ InstancedMesh/bể người – ít lượt vẽ); file này giữ đồn + phòng giam + bản đồ chỉ huy.
import { makeLift } from './liftkit.js';
import { roundedBox } from './archKit.js';

export async function make(W, zones={}){
  const {THREE, scene, P, HOOK, INTER, PLACES, addPlat, addSeg, boxes, toast, makeLabel, teleport} = W;
  if(!W.V2) return null;
  const X0=214, X1=244, Z0=354, Z1=382, G=2, FY=[2,6,10], ROOF=14, T=.3;
  const LIFT={x:241, z:377, w:2.4, d:2.4}, HOLE={x0:LIFT.x-1.35, x1:LIFT.x+1.35, z0:LIFT.z-1.35, z1:LIFT.z+1.35};
  const root=new THREE.Group(); root.name='police-station'; scene.add(root);
  const mats={}; const sm=(k,c,o={})=>mats[k] ||= new THREE.MeshStandardMaterial({color:c, roughness:.6, ...o});
  const NAVY=sm('navy',0x14284f,{roughness:.5}), WHITE=sm('white',0xf1f0ea,{roughness:.55}), GOLD=sm('gold',0xd8b25a,{metalness:.85, roughness:.3}), DARK=sm('dark',0x23262b,{roughness:.7}),
        FLOOR=sm('floor',0xd8d4cb,{roughness:.8}), TILE=sm('tile',0xb9c0c8,{roughness:.5}), STEEL=sm('steel',0x9aa3ad,{metalness:.85, roughness:.3}), WOOD=sm('wood',0x7a5232,{roughness:.6}),
        GLASS=mats.glass ||= new THREE.MeshPhysicalMaterial({color:0x8fb3cf, roughness:.08, metalness:.1, transparent:true, opacity:.32, depthWrite:false, side:THREE.DoubleSide});
  // khối bo cạnh (archKit.roundedBox) – không ghép hộp vuông thô; tâm (x,y,z), kích thước theo trục thế giới
  const blk=(w,h,d,m,x,y,z,r=.03)=>{ const g=roundedBox(Math.max(w,.02),Math.max(h,.02),Math.max(d,.02),Math.min(r, w/2-.005, h/2-.005, d/2-.005)).clone(); const ms=new THREE.Mesh(g,m); ms.position.set(x,y,z); ms.castShadow=ms.receiveShadow=true; root.add(ms); return ms; };
  const pane=(w,h,m,x,y,z,ry=0)=>{ const ms=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m); ms.position.set(x,y,z); ms.rotation.y=ry; root.add(ms); return ms; };
  const seg=(ax,az,bx,bz,y0,y1,msg)=>addSeg(ax,az,bx,bz,.16,y0,y1,msg);
  const MSG='🚓 Tường Sở Cảnh Sát – đi cửa chính / gara phía Tây';

  /* ============================== VỎ NGOÀI ============================== */
  // nền móng + sàn tầng 1 (lát gạch đá, nhô 2 cm khỏi mặt đất – không chớp)
  blk(X1-X0+.6, .5, Z1-Z0+.6, NAVY, (X0+X1)/2, G-.23, (Z0+Z1)/2, .06);
  blk(X1-X0-.4, .06, Z1-Z0-.4, TILE, (X0+X1)/2, G+.03, (Z0+Z1)/2, .01);
  // 3 mặt kín (Bắc, Nam, Đông): tường trắng, chân navy, dải cửa sổ kính mỗi tầng, gờ vàng kim
  for(const [ax,az,bx,bz] of [[X0,Z0,X1,Z0],[X0,Z1,X1,Z1],[X1,Z0,X1,Z1]]){ const L=Math.hypot(bx-ax,bz-az), cx=(ax+bx)/2, cz=(az+bz)/2, alongX=Math.abs(bz-az)<.1, w=alongX?L:T, d=alongX?T:L, out=alongX?(az<(Z0+Z1)/2?-1:1):1;
    blk(w, ROOF-G+.9, d, WHITE, cx, (G+ROOF+.9)/2, cz); blk(alongX?L+.04:T+.06, 1.0, alongX?T+.06:L+.04, NAVY, cx, G+.5, cz);
    for(const fy of FY){ const gw=alongX?L-3:.04, gd=alongX?.04:L-3, ox=alongX?0:out*(T/2+.03), oz=alongX?out*(T/2+.03):0; blk(gw, 1.5, gd, GLASS, cx+ox, fy+2.1, cz+oz, .01); blk(alongX?L-2.8:.08, .1, alongX?.08:L-2.8, GOLD, cx+ox*1.4, fy+1.3, cz+oz*1.4, .02); }
    seg(ax,az,bx,bz, G-.5, ROOF+1.2, MSG); }
  // mặt tiền Tây (x = 214): tầng 1 = mảng tường giữa 3 gara + cửa sảnh; tầng 2–3 = vách kính khung navy, trụ trắng
  const GAR=[[355.0,359.6],[361.0,365.5],[366.8,371.2]], DOOR=[375.0,379.0];
  { const open=[...GAR, DOOR].sort((a,b)=>a[0]-b[0]); let z=Z0;
    for(const [a,b] of open){ if(a-z>.05){ blk(T,4,a-z,WHITE,X0,G+2,(z+a)/2); seg(X0,z,X0,a,G-.5,G+3.8,MSG); } z=b; }
    if(Z1-z>.05){ blk(T,4,Z1-z,WHITE,X0,G+2,(z+Z1)/2); seg(X0,z,X0,Z1,G-.5,G+3.8,MSG); }
    for(const [a,b] of GAR){ blk(T+.06,.45,b-a+.3,NAVY,X0,G+3.82,(a+b)/2); blk(.5,.35,b-a-.1,NAVY,X0+.35,G+3.45,(a+b)/2); }   // lanh tô + cuộn cửa cuốn đã kéo lên
    blk(T+.06,.8,DOOR[1]-DOOR[0]+.4,NAVY,X0,G+3.6,(DOOR[0]+DOOR[1])/2);
    blk(.35,4,.35,GOLD,X0-.1,G+2,DOOR[0]-.25); blk(.35,4,.35,GOLD,X0-.1,G+2,DOOR[1]+.25);
    // tầng 2–3: dải kính + trụ
    blk(T,ROOF-6+.9,.02+.001,WHITE,X0,(6+ROOF+.9)/2,Z0+.01);
    for(let z=Z0+.2; z<=Z1-.1; z+=3.5) blk(.45,ROOF-5.6+.9,.35,WHITE,X0-.05,(5.8+ROOF+.9)/2,Math.min(z,Z1-.2));
    for(const fy of [6,10]){ pane(Z1-Z0-.4,3.3,GLASS,X0+.02,fy+1.95,(Z0+Z1)/2,Math.PI/2); blk(.5,.55,Z1-Z0+.2,WHITE,X0-.05,fy+.15,(Z0+Z1)/2); }
    seg(X0,Z0,X0,Z1, 5.5, ROOF+1.2, MSG); }
  // mái + lan can + gờ vàng kim
  blk(.5,.5,Z1-Z0+.4,GOLD,X0-.12,ROOF+.95,(Z0+Z1)/2,.05);
  for(const [ax,az,bx,bz] of [[X0,Z0,X1,Z0],[X0,Z1,X1,Z1],[X1,Z0,X1,Z1],[X0,Z0,X0,Z1]]){ const alongX=Math.abs(bz-az)<.1, L=Math.hypot(bx-ax,bz-az); blk(alongX?L:.25,.12,alongX?.25:L,GOLD,(ax+bx)/2,ROOF+1.12,(az+bz)/2,.03); seg(ax,az,bx,bz,ROOF-.5,ROOF+1.6,'🚁 Lan can mái – không ra mép mái'); }
  // biển hiệu mặt tiền (canvas) + quốc huy sao vàng
  const signTex=(w,h,lines,bg='#14284f')=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.fillStyle=bg; g.fillRect(0,0,w,h); g.strokeStyle='#d8b25a'; g.lineWidth=h*.06; g.strokeRect(h*.05,h*.05,w-h*.1,h-h*.1);
    g.textAlign='center'; g.textBaseline='middle'; for(const [t,font,col,y] of lines){ g.fillStyle=col; g.font=font; g.fillText(t,w/2,h*y); } const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
  { const t=signTex(2048,256,[['SỞ CẢNH SÁT QC CITY · 113','900 128px "Segoe UI",sans-serif','#ffd98a',.5]]); const s=pane(16,2,new THREE.MeshStandardMaterial({map:t, roughness:.5, emissive:0xffffff, emissiveMap:t, emissiveIntensity:.25}),X0-.33,G+5.05+.15,363.2,-Math.PI/2); s.position.y=G+4.95;
    const st=new THREE.Shape(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?.33:.8; st[i?'lineTo':'moveTo'](Math.cos(a)*r, Math.sin(a)*r); }
    const star=new THREE.Mesh(new THREE.ExtrudeGeometry(st,{depth:.08, bevelEnabled:true, bevelSize:.03, bevelThickness:.03, bevelSegments:1}), GOLD); star.rotation.set(Math.PI,-Math.PI/2,0); star.position.set(X0-.42,G+5.0,377); root.add(star);
    const t2=signTex(512,256,[['113','900 150px "Segoe UI",sans-serif','#ffd98a',.55]]); pane(1.6,.8,new THREE.MeshStandardMaterial({map:t2, emissive:0xffffff, emissiveMap:t2, emissiveIntensity:.35}),X0-.36,G+4.05,377,-Math.PI/2);
    GAR.forEach(([a,b],i)=>{ const t3=signTex(256,256,[[String(i+1),'900 170px "Segoe UI",sans-serif','#ffffff',.55]]); pane(.6,.6,new THREE.MeshBasicMaterial({map:t3}),X0-.25,G+4.25,(a+b)/2,-Math.PI/2); }); }

  /* ============================== SÀN TẦNG 2 · 3 · MÁI (chừa lỗ giếng thang) ============================== */
  function slab(y, th=.3, mat=FLOOR){ const parts=[[X0+.15,HOLE.x0,Z0+.15,Z1-.15],[HOLE.x1,X1-.15,Z0+.15,Z1-.15],[HOLE.x0,HOLE.x1,Z0+.15,HOLE.z0],[HOLE.x0,HOLE.x1,HOLE.z1,Z1-.15]];
    for(const [x0,x1,z0,z1] of parts){ if(x1-x0<.1 || z1-z0<.1) continue; blk(x1-x0,th,z1-z0,mat,(x0+x1)/2,y-th/2,(z0+z1)/2,.01); addPlat((x0+x1)/2,(z0+z1)/2,0,(x1-x0)/2+.02,(z1-z0)/2+.02,y); } }
  slab(6); slab(10); slab(ROOF,.32,sm('roof',0x4a4f57,{roughness:.85}));

  /* ============================== TẦNG 1: GARA · SẢNH 113 · KHU TẠM GIỮ ============================== */
  const iw=(ax,az,bx,bz,y0,y1,m=WHITE)=>{ const alongX=Math.abs(bz-az)<.1, L=Math.hypot(bx-ax,bz-az); blk(alongX?L:.2,y1-y0,alongX?.2:L,m,(ax+bx)/2,(y0+y1)/2,(az+bz)/2,.02); seg(ax,az,bx,bz,y0-.5,y1-.2,'🧱 Vách ngăn'); };
  // gara: 3 ô, vạch sơn vàng, giá đồ nghề
  iw(X0+.15,360.3,226,360.3,G,5.85); iw(X0+.15,366.1,226,366.1,G,5.85); iw(226,Z0+.15,226,371.6,G,5.85); iw(X0+.15,371.6,226,371.6,G,5.85);
  for(const [a,b] of GAR){ blk(10,.012,.1,sm('yel',0xf2c230),220.5,G+.066,a+.3,.004); blk(10,.012,.1,sm('yel',0xf2c230),220.5,G+.066,b-.3,.004);
    blk(.5,1.8,1.6,STEEL,225.5,G+.9,(a+b)/2); }
  // khu tạm giữ (x 226–244, z 354–371.6): 3 buồng song sắt, hành lang, bàn trực
  iw(226,371.6,229,371.6,G,5.85); iw(232,371.6,X1-.15,371.6,G,5.85); blk(3.4,.6,.25,NAVY,230.5,G+3.55,371.6);   // cửa vào khu tạm giữ (x 229–232)
  const CELLS=[[226.3,232],[232.3,238],[238.3,243.7]].map(([a,b])=>({x0:a, x1:b, x:(a+b)/2, z:356.8, who:null}));
  for(const c of CELLS){ blk(c.x1-c.x0-.4,.45,.8,sm('conc',0x9a9a96),c.x,G+.23,355.0); }   // bệ ngồi trong buồng
  iw(232.15,Z0+.15,232.15,360,G,5.85); iw(238.15,Z0+.15,238.15,360,G,5.85);
  { const bars=[], step=.16; for(let x=226.4; x<X1-.2; x+=step) bars.push(x); const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.025,.025,3.4,6), STEEL, bars.length), m=new THREE.Matrix4();
    bars.forEach((x,i)=>{ m.makeTranslation(x,G+1.7,360); im.setMatrixAt(i,m); }); im.castShadow=false; root.add(im);
    for(const y of [G+.08, G+1.2, G+3.35]) blk(X1-226.4,.08,.08,STEEL,(226.4+X1)/2,y,360,.02);
    seg(226.2,360,X1-.15,360,G-.5,G+3.4,'🔒 Song sắt buồng tạm giữ'); }
  blk(2.4,.85,1.0,NAVY,240,G+.43,368.5); blk(2.5,.06,1.1,GOLD,240,G+.88,368.5,.02); boxes.push({x0:238.8, x1:241.2, z0:368, z1:369, y0:G-.5, y1:G+1.2});
  // sảnh trực ban 113 (x 214–244, z 371.6–382): quầy navy mặt vàng kim, tường quốc huy, ghế chờ, cây xanh
  blk(11,1.05,1.2,NAVY,228,G+.53,373.3,.05); blk(11.2,.07,1.35,GOLD,228,G+1.08,373.3,.02); boxes.push({x0:222.4, x1:233.6, z0:372.6, z1:374, y0:G-.5, y1:G+1.4});
  { const t=signTex(1024,512,[['🚓','160px "Segoe UI Emoji",sans-serif','#ffffff',.3],['TRỰC BAN 113','900 110px "Segoe UI",sans-serif','#ffd98a',.65],['Phục vụ nhân dân 24/7','600 54px "Segoe UI",sans-serif','#dfe6f2',.86]]);
    pane(5,2.5,new THREE.MeshStandardMaterial({map:t, roughness:.5}),228,G+2.4,371.72,0); }
  for(const [x,z] of [[215.2,372.6],[243,381]]){ blk(.6,.5,.6,DARK,x,G+.25,z); const tr=new THREE.Mesh(new THREE.SphereGeometry(.5,10,8), sm('leaf',0x2f7d3b,{roughness:.8})); tr.position.set(x,G+1.05,z); root.add(tr); boxes.push({x0:x-.35,x1:x+.35,z0:z-.35,z1:z+.35,y0:G-.5,y1:G+1.4}); }
  for(const x of [219,224]){ blk(2.2,.12,.6,WOOD,x,G+.47,381.2); blk(2.2,.5,.1,WOOD,x,G+.75,381.5); for(const s of [-1,1]) blk(.08,.45,.5,DARK,x+s*1,G+.22,381.2); W.addBench && W.addBench({x, z:381.15, rot:Math.PI, len:2, y:G+.53, floor:G, label:'🪑 Ngồi chờ ở sảnh 113 (E · C)'}); boxes.push({x0:x-1.15,x1:x+1.15,z0:380.85,z1:381.75,y0:G-.5,y1:G+.95}); }

  /* ============================== TẦNG 2: PHÒNG CHỈ HUY – BẢN ĐỒ AN NINH SỐNG ============================== */
  const MAPW=1024, MAPH=576, mc=document.createElement('canvas'); mc.width=MAPW; mc.height=MAPH; const mg=mc.getContext('2d'); const mapTex=new THREE.CanvasTexture(mc); mapTex.colorSpace=THREE.SRGBColorSpace; mapTex.userData.live=true;
  const MB={x0:-900, x1:1200, z0:-1000, z1:1550}, mx=x=>40+(x-MB.x0)/(MB.x1-MB.x0)*(MAPW-80), mz=z=>40+(z-MB.z0)/(MB.z1-MB.z0)*(MAPH-80);
  let mapBase=null;
  function drawMap(){ const net=W.roadNet, Z=W.V2ZONES||{};
    if(!mapBase){ const c=document.createElement('canvas'); c.width=MAPW; c.height=MAPH; const g=c.getContext('2d'); g.fillStyle='#071226'; g.fillRect(0,0,MAPW,MAPH);
      g.strokeStyle='rgba(80,140,220,.25)'; g.lineWidth=1; for(let x=0;x<MAPW;x+=32){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,MAPH); g.stroke(); } for(let y=0;y<MAPH;y+=32){ g.beginPath(); g.moveTo(0,y); g.lineTo(MAPW,y); g.stroke(); }
      g.font='600 15px "Segoe UI",sans-serif'; g.textAlign='center';
      for(const [k,z] of Object.entries(Z)){ g.fillStyle='rgba(40,90,160,.35)'; g.strokeStyle='rgba(120,180,255,.6)'; const x0=mx(z.x0), y0=mz(z.z0), w=mx(z.x1)-x0, h=mz(z.z1)-y0; g.fillRect(x0,y0,w,h); g.strokeRect(x0,y0,w,h); g.fillStyle='#bcd6ff'; g.fillText((z.name||k).split(' ').slice(0,3).join(' '), x0+w/2, y0+16); }
      if(net){ g.strokeStyle='#ffd98a'; g.lineWidth=2.2; for(const e of net.edges){ g.beginPath(); for(let i=0;i<e.x.length;i+=3){ const X=mx(e.x[i]), Y=mz(e.z[i]); i?g.lineTo(X,Y):g.moveTo(X,Y); } g.lineTo(mx(e.x[e.x.length-1]), mz(e.z[e.z.length-1])); g.stroke(); } }
      g.fillStyle='#ffd98a'; g.font='900 22px "Segoe UI",sans-serif'; g.textAlign='left'; g.fillText('🚓 BẢN ĐỒ AN NINH QC CITY · TRUNG TÂM CHỈ HUY 113', 22, 30); mapBase=c; }
    mg.drawImage(mapBase,0,0); const t=W.T??0, on=Math.floor(t*3)%2;
    const tr=W.traffic; if(tr && tr.cars) for(const c of tr.cars){ if(!c.patrol || !c.active) continue; const X=mx(c.g.position.x), Y=mz(c.g.position.z); mg.fillStyle=c.siren ? (on?'#ff3030':'#3070ff') : '#9fd0ff'; mg.beginPath(); mg.arc(X,Y,6,0,7); mg.fill(); }
    const ev=W.events && W.events.active ? W.events.active() : []; for(const e of ev){ const X=mx(e.x), Y=mz(e.z); mg.strokeStyle=on?'#ff5050':'#ffd050'; mg.lineWidth=3; mg.beginPath(); mg.arc(X,Y,12+on*4,0,7); mg.stroke(); mg.fillStyle='#fff'; mg.font='600 14px "Segoe UI",sans-serif'; mg.fillText(e.label||e.key, X+16, Y+5); }
    mg.fillStyle='#ffffff'; mg.beginPath(); mg.arc(mx(P.x), mz(P.z), 5, 0, 7); mg.fill(); mg.strokeStyle='#00ffa0'; mg.lineWidth=2; mg.stroke();
    mg.fillStyle='#9fd0ff'; mg.font='600 15px "Segoe UI",sans-serif'; mg.fillText(`Đã bắt: ${STATS.caught} · Cháy đã dập: ${STATS.fires} · Đang tạm giữ: ${CELLS.filter(c=>c.who).length}`, 22, MAPH-16);
    mapTex.needsUpdate=true; }
  const STATS={caught:0, fires:0, returned:0};
  { const scr=pane(15,4.6,new THREE.MeshBasicMaterial({map:mapTex, toneMapped:false}),229,8.05,381.72,Math.PI); scr.userData.dynamic=true; blk(15.5,5,.12,DARK,229,8.05,381.82,.03); }
  for(const row of [372.5,376]) for(let x=219; x<=231; x+=5.5){ /* chừa lối ≥ 2,5 m trước cửa thang (x ≈ 239,8) */ blk(4.6,.08,1.1,WOOD,x,6.76,row,.02); blk(4.6,.7,.08,DARK,x,6.38,row-.5,.02); for(const s of [-1.3,0,1.3]){ blk(.9,.55,.05,DARK,x+s,7.12,row+.25,.01); blk(.85,.48,.02,sm('scr',0x2a6fdb,{emissive:0x184080, emissiveIntensity:.8}),x+s,7.12,row+.28,.005); } boxes.push({x0:x-2.3,x1:x+2.3,z0:row-.6,z1:row+.6,y0:5.5,y1:7.3}); }
  blk(3.2,.08,3.2,WOOD,224,6.8,365.5,.3); blk(.5,.75,.5,DARK,224,6.38,365.5); boxes.push({x0:222.4,x1:225.6,z0:363.9,z1:367.1,y0:5.5,y1:7.2});   // bàn tròn chỉ huy (vuông bo)

  /* ============================== TẦNG 3: PHÒNG GIAO BAN ============================== */
  for(let r=0;r<4;r++) for(let c=0;c<6;c++){ const x=218+c*2.6, z=364+r*2.2; blk(.55,.08,.55,NAVY,x,10.48,z,.03); blk(.55,.6,.07,NAVY,x,10.8,z+.27,.02); }
  { const t=signTex(1024,512,[['📋 GIAO BAN CA TRỰC','900 76px "Segoe UI",sans-serif','#ffd98a',.2],['• Tuần tra Abyssal · CBD · Dev City','600 46px "Segoe UI",sans-serif','#ffffff',.45],['• Xe tuần tra: 4 · Cảnh sát đi bộ: 8','600 46px "Segoe UI",sans-serif','#ffffff',.63],['• Phản ứng nhanh 113 – có mặt trong 10 giây','600 46px "Segoe UI",sans-serif','#ffffff',.81]],'#1b2d4f');
    pane(6,3,new THREE.MeshStandardMaterial({map:t, roughness:.6}),226,12,354.32,0); }
  for(let x=231; x<=243; x+=1.1){ blk(1,2.1,.55,STEEL,x,11.05,381.4,.03); } boxes.push({x0:230.4,x1:243.6,z0:381.05,z1:381.8,y0:9.5,y1:12.2});

  /* ============================== MÁI: BÃI ĐÁP TRỰC THĂNG ============================== */
  const HP={x:226, z:366};
  { const r=new THREE.Mesh(new THREE.CircleGeometry(6.2,48), sm('pad',0x2b3036,{roughness:.9})); r.rotation.x=-Math.PI/2; r.position.set(HP.x,ROOF+.02,HP.z); root.add(r);
    const ring=new THREE.Mesh(new THREE.RingGeometry(5.5,5.9,48), sm('yel',0xf2c230)); ring.rotation.x=-Math.PI/2; ring.position.set(HP.x,ROOF+.035,HP.z); root.add(ring);
    for(const [w,d,x,z] of [[.55,3.2,-1.1,0],[.55,3.2,1.1,0],[1.7,.5,0,0]]){ const h=new THREE.Mesh(new THREE.PlaneGeometry(w,d), WHITE); h.rotation.x=-Math.PI/2; h.position.set(HP.x+x,ROOF+.04,HP.z+z); root.add(h); }
    // trực thăng tuần tra đậu sẵn (trắng – navy)
    const hg=new THREE.Group(); hg.position.set(HP.x,ROOF+.04,HP.z); hg.rotation.y=-.6; root.add(hg);
    const body=new THREE.Mesh(new THREE.SphereGeometry(1.25,18,14), WHITE); body.scale.set(1,1,1.7); body.position.set(0,1.45,0); hg.add(body);
    const can=new THREE.Mesh(new THREE.SphereGeometry(1.0,16,12,0,Math.PI*2,0,Math.PI/2), sm('hgl',0x1d2b36,{roughness:.1, metalness:.4})); can.scale.set(1.05,.9,1.3); can.position.set(0,1.55,.75); hg.add(can);
    const tail=new THREE.Mesh(new THREE.CylinderGeometry(.18,.35,4.2,10), NAVY); tail.rotation.x=Math.PI/2; tail.position.set(0,1.6,-3.6); hg.add(tail);
    const fin=new THREE.Mesh(new THREE.BoxGeometry(.08,1.0,.7), NAVY); fin.position.set(0,2.0,-5.5); hg.add(fin);
    for(const s of [-1,1]){ const sk=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,3.2,8), DARK); sk.rotation.x=Math.PI/2; sk.position.set(s*.9,.12,0); hg.add(sk); for(const z of [-.8,.8]){ const st=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.6,6), DARK); st.position.set(s*.75,.42,z); hg.add(st); } }
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.5,8), DARK); mast.position.set(0,2.9,0); hg.add(mast);
    for(let k=0;k<4;k++){ const b=new THREE.Mesh(new THREE.BoxGeometry(.22,.04,4.6), DARK); b.position.set(0,3.16,0); b.rotation.y=k*Math.PI/4; hg.add(b); }
    const stripe=new THREE.Mesh(new THREE.SphereGeometry(1.27,18,6,0,Math.PI*2,Math.PI*.52,Math.PI*.12), NAVY); stripe.scale.set(1,1,1.7); stripe.position.copy(body.position); hg.add(stripe);
    W.addSeg && addSeg(HP.x-2.2,HP.z,HP.x+2.2,HP.z,2.0,ROOF-.5,ROOF+3,'🚁 Trực thăng tuần tra QC Police'); }

  /* ============================== THANG MÁY (liftkit) ============================== */
  let lift=null; try{ lift=makeLift(W, {x:LIFT.x, z:LIFT.z, yaw:-Math.PI/2, w:LIFT.w, d:LIFT.d, name:'Thang Sở Cảnh Sát', color:0xd8b25a,
      floors:[{y:2, name:'Tầng 1 · Sảnh trực ban 113 · Khu tạm giữ'}, {y:6, name:'Tầng 2 · Phòng chỉ huy'}, {y:10, name:'Tầng 3 · Phòng giao ban'}, {y:14, name:'Mái · Bãi đáp trực thăng', short:'M'}]}); }catch(e){ console.warn('[police] thang', e); }

  /* ============================== NHÂN VIÊN TRỰC (2 người – dáng people.js, sắc phục navy) ============================== */
  const staff=[]; function officer(x,y,z,face,name,seed){ if(!W.people) return null; const kk=W.people.kit(W.people.seedFor(seed%2?'f':'m', seed), {outfit:{shirt:0x1f2c5c, pants:0x182246, long:true, shoe:0x111111, style:'cap', hair:8, glasses:false, dress:false, skirt:false, shorts:false}});
    const a=W.makeActor(kk.gl, {name, height:kk.h, face:0, clips:{idle:kk.clips.idle, agree:kk.clips.agree}, compact:false, dot:'#4f8cff'}); if(QUAL==='low') a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
    a.g.position.set(x,y,z); a.g.rotation.y=face; a.play('idle',0); a.mixer.update(Math.random()); staff.push({a, x, y, z}); return a; }
  const QUAL=W.QUAL||'low';
  officer(228,G,372.35,0,'👮 Trung uý Minh · trực ban 113',911); officer(222,6,366,Math.PI/2,'👮‍♀️ Thiếu tá Lan · chỉ huy ca',912);
  for(const [x,z] of [[228,372.35],[222,366]]) W.circles.push({x, z, r:.35, y0:(z>370?G:6)-.5, y1:(z>370?G:6)+2});

  /* ============================== ĐIỂM E · BẢN ĐỒ (M) ============================== */
  INTER.push({x:228, z:374.6, r:2.2, prio:.6, when:()=>Math.abs(P.y-G)<1.2, label:'🚨 Trực ban 113 – báo tin / xem tình hình (E)', action:()=>{ const a=W.events && W.events.active ? W.events.active() : [];
    toast(a.length ? `🚨 Đang xử lý: ${a.map(e=>e.label).join(' · ')}` : `👮 Trực ban 113: khu vực bình yên. Đã bắt ${STATS.caught} đối tượng, dập ${STATS.fires} đám cháy. (Shift+1…9 để diễn tập sự kiện)`, 4200); }});
  INTER.push({x:229, z:380, r:3, prio:.6, when:()=>Math.abs(P.y-6)<1.2, label:'🗺️ Bản đồ an ninh – trung tâm chỉ huy (E)', action:()=>{ const tr=W.traffic, pat=tr&&tr.cars?tr.cars.filter(c=>c.patrol&&c.active):[]; toast(`🗺️ ${pat.length} xe tuần tra đang chạy (${pat.filter(c=>c.siren).length} xe đang làm nhiệm vụ) · ${CELLS.filter(c=>c.who).length} người đang tạm giữ`, 4000); }});
  INTER.push({x:235, z:361.5, r:3, prio:.5, when:()=>Math.abs(P.y-G)<1.2, label:'🔒 Khu tạm giữ (E)', action:()=>{ const n=CELLS.filter(c=>c.who).length; toast(n ? `🔒 ${n} đối tượng đang bị tạm giữ chờ xử lý.` : '🔒 Các buồng tạm giữ đang trống.', 3000); }});
  PLACES.push({icon:'🚓', name:'Sở Cảnh Sát QC City · 113', sub:'CBD · Đường Tây (x 198) · gara, sảnh 113, phòng chỉ huy, bãi trực thăng', go:()=>teleport(210.6, 377, 220, 377)});
  makeLabel && makeLabel('🚓 Sở Cảnh Sát QC City · 113', 'Trực ban 24/7 · gọi 113', {h:.55, x:211, y:G+7.6, z:377, fade:90});

  /* ============================== PHÒNG GIAM: nhốt người bị bắt ============================== */
  // jail(actor, sec) – đặt nhân vật vào buồng trống (ngồi trên bệ, quay ra song sắt); hết giờ thì thả (ẩn)
  function jail(a, sec=300){ const c=CELLS.find(c=>!c.who) || CELLS[0]; if(c.who && c.who.a!==a){ try{ c.who.a.g.visible=false; }catch(e){} } c.who={a, t:sec}; a.g.visible=true; a.g.rotation.set(0,0,0); a.g.position.set(c.x+(Math.random()-.5), G, 357.4); a.g.rotation.y=0; if(a.play) a.play('idle',.2); STATS.caught++; return c; }

  /* ============================== KHUNG HÌNH ============================== */
  let mapT=0, inB=false;
  HOOK.onFrame.push((dt)=>{ dt=Math.min(dt,.1);
    // camera trong nhà: không xuyên tường, không lên quá trần tầng đang đứng
    const inside=P.x>X0+.2 && P.x<X1-.2 && P.z>Z0+.2 && P.z<Z1-.2 && P.y>G-.6 && P.y<ROOF-.3 && !W.inside;
    if(inside){ const fy=P.y<5.5?G:P.y<9.5?6:10; HOOK.camBox={x0:X0+.4, x1:X1-.4, z0:Z0+.4, z1:Z1-.4, y1:fy+3.55, _pol:true}; inB=true; }
    else if(inB){ inB=false; if(HOOK.camBox && HOOK.camBox._pol) HOOK.camBox=null; }
    for(const c of CELLS) if(c.who){ c.who.t-=dt; if(c.who.t<=0){ try{ c.who.a.g.visible=false; }catch(e){} c.who=null; } else { const a=c.who.a; if(a.mixer && a.root && a.root.visible) a.mixer.update(dt); } }
    const near=Math.hypot(P.x-229, P.z-368)<60; if(!near) return;
    for(const s of staff){ if(s.a.root.visible) s.a.mixer.update(dt); }
    mapT-=dt; if(mapT<=0 && Math.abs(P.y-6)<4 && Math.hypot(P.x-229,P.z-376)<20){ mapT=.5; try{ drawMap(); }catch(e){} } });
  try{ drawMap(); }catch(e){}

  console.info('[QC World V2] Sở Cảnh Sát QC City 113 – x 214–244, z 354–382 · 3 tầng + bãi trực thăng · 3 buồng tạm giữ');
  return {station:{x0:X0, x1:X1, z0:Z0, z1:Z1, y:G, door:{x:212.5, z:377}, front:{x:206, z:377}, garages:GAR.map(([a,b])=>({x:212, z:(a+b)/2}))}, heli:HP, cells:CELLS, jail, stats:STATS, lift, drawMap};
}
