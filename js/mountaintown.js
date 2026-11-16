// QC World – 🏮 PHỐ NÚI SƠN THÀNH (lấy cảm hứng từ các thành phố núi: nhà cửa bám vách, tầng tầng lớp lớp, cầu đi bộ trên cao)
//  • NHÀ SÀN BÁM VÁCH dọc mép ngoài đường xoắn ốc lên đồi: sân thượng NGANG MẶT ĐƯỜNG chia 3 bậc theo dốc đường (bước lên được),
//    là quán café / quán ăn có bàn ghế ngồi được, quầy gọi món, dù che, dây đèn; các tầng dưới chồng xuống sườn dốc với mái hiên,
//    ban công và hàng đèn lồng đỏ – ban đêm cả sườn đồi sáng rực.
//  • THÁP CẦU TRỜI: tháp cao mọc từ chân dốc, CẦU ĐI BỘ từ mép đường đi thẳng vào thân tháp (tầng giữa), thang máy lên SÂN THƯỢNG
//    – quán bar/café ngắm cảnh, ống nhòm ngắm toàn thành phố.
//  • THÁP CHUNG CƯ TRÊN SƯỜN ĐỒI: bệ móng bám dốc, mặt tiền nhiều màu, đèn cửa sổ ban đêm, biển LED trên nóc.
//  Va chạm: tường xiên/lan can dùng W.addSeg (đoạn thẳng xoay tự do, giới hạn độ cao) → không đi xuyên vật thể, đứng tầng nào chặn tầng đó.
import { makeLift } from './liftkit.js';

export function makeMountainTown(W, ctx){
  const {S, save, ui, askPay, fmt, spend} = ctx;
  const {THREE, scene, P, HOOK, INTER, PLACES, toast, circles, boxes, addPlat, addSeg, mergeGeometries, GLOW, teleport, makeLabel, cam} = W;
  const info=W.hillsInfo; if(!info || !info.TOWN || !addSeg) return null;
  const {hAt, TOWN, SLOPE, HC} = info;
  let sd=90210; const R=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  const sm=(c,r=.7,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function Kit(){ const parts=new Map(); return { add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
    build(parent){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=!m.transparent; ms.receiveShadow=true; parent.add(ms); } } }; }
  const canvasTex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };
  const k=Kit();

  /* ---------- mặt tiền: 1 ô texture = 4 gian × 4 tầng (12 m × 12.8 m) – ngày: tường + cửa sổ, đêm: cửa sổ sáng ngẫu nhiên ---------- */
  function facadeMat(wall, frame, glass, style){
    const day=canvasTex(512,512,(g,w,h)=>{ g.fillStyle=wall; g.fillRect(0,0,w,h); for(let i=0;i<1400;i++){ g.fillStyle=`rgba(0,0,0,${R()*.06})`; g.fillRect(R()*w,R()*h,3,3); }
      for(let r=0;r<4;r++) for(let c=0;c<4;c++){ const x=c*128, y=r*128;
        if(style==='wood'){ g.fillStyle=frame; g.fillRect(x+14,y+26,100,76); g.fillStyle=glass; g.fillRect(x+20,y+32,88,64); g.fillStyle=frame; g.fillRect(x+62,y+32,4,64); g.fillRect(x+20,y+62,88,3); g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(x,y+120,128,8); }
        else if(style==='glass'){ g.fillStyle=glass; g.fillRect(x+4,y+10,120,108); g.fillStyle='rgba(255,255,255,.18)'; g.fillRect(x+4,y+10,120,16); g.fillStyle=frame; g.fillRect(x+62,y+10,4,108); g.fillRect(x,y+118,128,10); }
        else { g.fillStyle=frame; g.fillRect(x+18,y+22,92,82); g.fillStyle=glass; g.fillRect(x+24,y+28,80,70); g.fillStyle='rgba(255,255,255,.2)'; g.fillRect(x+24,y+28,80,10); g.fillStyle=frame; g.fillRect(x+10,y+104,108,8); } } });
    const lit=canvasTex(512,512,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); for(let r=0;r<4;r++) for(let c=0;c<4;c++) for(const half of [0,1]){ if(R()<.5){ const k2=.35+R()*.65; g.fillStyle=R()<.75?`rgba(255,207,138,${k2})`:`rgba(216,236,255,${k2})`; const x=c*128, y=r*128; if(style==='glass') g.fillRect(x+6+half*60,y+14,56,100); else g.fillRect(x+24+half*42,y+30,38,66); } } });
    for(const t of [day,lit]){ t.wrapS=t.wrapT=THREE.RepeatWrapping; }
    return new THREE.MeshStandardMaterial({map:day, emissive:0xffffff, emissiveMap:lit, emissiveIntensity:.05, roughness:style==='glass'?.25:.8, metalness:style==='glass'?.35:0}); }
  const FAC={ timber:facadeMat('#5a3a24','#2b1a10','#3d4a52','wood'), ochre:facadeMat('#c99a5e','#6b3f22','#3a4650','wood'), white:facadeMat('#e9e1cf','#7a4a2a','#3b4852','wood'),
    teal:facadeMat('#8fc7c2','#3b4b52','#2c4a5e','glass'), coral:facadeMat('#f2a28a','#5a4038','#30485a','plain'), lilac:facadeMat('#c6b6e6','#4a4060','#2e4258','plain'), sky:facadeMat('#a9d2f2','#3a4a5a','#2a4660','glass'), lemon:facadeMat('#f3dc8a','#6a5530','#33475a','plain'), mint:facadeMat('#b8e6c4','#3d5a46','#2f4a58','plain') };
  const facMats=Object.values(FAC);
  HOOK.onFrame.push(()=>{ const n=W.night||0, v=.04+n*1.15; for(const m of facMats) m.emissiveIntensity=v; });
  // mặt phẳng mặt tiền: uv theo kích thước thật, căn mép trên = ranh giới tầng
  function facade(mat, w, h, x, y, z, ry){ const g=new THREE.PlaneGeometry(w,h), uv=g.attributes.uv; const off=R()*4|0;
    for(let i=0;i<uv.count;i++){ uv.setX(i, uv.getX(i)*w/12+off*.25); uv.setY(i, (uv.getY(i)-1)*h/12.8); } k.add(g, mat, x, y, z, 0, ry, 0); }
  const M={ wallS:sm(0x8a7f70,.9), stone:sm(0xb9b2a4,.85), deck:sm(0xa77a4c,.75), deckD:sm(0x6b4a2e,.8), eave:sm(0x3b3a3e,.7), trim:sm(0xb3322a,.55), gold:sm(0xd9a640,.35,.7), white:sm(0xf5f2ea,.6), dark:sm(0x24272c,.5,.3),
    glass:new THREE.MeshStandardMaterial({color:0xa8d4ea, roughness:.05, metalness:.6, transparent:true, opacity:.3, depthWrite:false, side:THREE.DoubleSide}), plant:sm(0x3f8a3a,.9), pot:sm(0xb7653c,.8),
    umb:[0xd94141,0x2f6fd0,0x2e8f57,0xf0a020,0x7a3fb0,0x12a594,0xff6fa0].map(c=>sm(c,.8,0,{side:THREE.DoubleSide})), chair:[0x2f6fd0,0xd94141,0x2e8f57,0x3b3f46].map(c=>sm(c,.6)), table:sm(0xf4f1ea,.5), steel:sm(0x8a9098,.4,.7),
    led:new THREE.MeshStandardMaterial({color:0x111111, emissive:0xffffff, emissiveIntensity:.6}) };

  /* ---------- quán xá: tên + thực đơn (gốc, không thương hiệu thật) ---------- */
  const SHOPS=[
    {name:'Café Vách Đá', icon:'☕', drinks:['cà phê muối','bạc xỉu','cà phê trứng'], menu:[['☕ Cà phê muối',25,'coffee',10,'Ngắm mây bay dưới chân'],['🍮 Bánh flan',20,'energy',5,'Mềm mịn']]},
    {name:'Mì Cay Sơn Thành', icon:'🍜', drinks:['mì cay cấp 3','trà chanh'], eat:true, menu:[['🍜 Mì cay 7 cấp độ',45,'energy',12,'Cay như bug production'],['🥟 Sủi cảo chiên',35,'energy',8,'Giòn rụm']]},
    {name:'Lẩu Cay Bám Vách', icon:'🍲', drinks:['lẩu cay','nước sâm'], eat:true, menu:[['🍲 Lẩu cay tê cửu cung',150,'energy',24,'Nồi chín ô, ăn cả team'],['🥬 Rau nhúng thập cẩm',30,'energy',6,'Thanh mát']]},
    {name:'Trà Sữa Mây Bay', icon:'🥤', drinks:['trà sữa khoai môn','trà đào'], menu:[['🥤 Trà sữa khoai môn',28,'coffee',8,'Ngọt như build xanh'],['🍑 Trà đào cam sả',22,'coffee',6,'Mát rượi']]},
    {name:'Xiên Nướng Dốc Đêm', icon:'🍢', drinks:['xiên nướng','nước mía'], eat:true, menu:[['🍢 Set xiên nướng',55,'energy',12,'Thơm cả con dốc'],['🌽 Bắp nướng mỡ hành',20,'energy',5,'Ăn vặt đêm']]},
    {name:'Bánh Ngọt Đỉnh Mây', icon:'🍰', drinks:['bánh tiramisu','cacao nóng'], menu:[['🍰 Bánh tiramisu',30,'energy',6,'Ngọt ngào'],['🍫 Cacao nóng',25,'coffee',8,'Ấm bụng']]},
    {name:'Há Cảo Cầu Treo', icon:'🥟', drinks:['há cảo tôm','trà hoa cúc'], eat:true, menu:[['🥟 Há cảo tôm',40,'energy',10,'Hấp nóng hổi'],['🍵 Trà hoa cúc',18,'coffee',6,'Thư thái']]},
    {name:'Kem Gió Núi', icon:'🍨', drinks:['kem dừa','sinh tố bơ'], menu:[['🍨 Kem dừa',22,'energy',5,'Mát lạnh giữa dốc'],['🥑 Sinh tố bơ',28,'energy',7,'Béo ngậy']]},
    {name:'Cơm Niêu Sườn Đồi', icon:'🍚', drinks:['cơm niêu','canh chua'], eat:true, menu:[['🍚 Cơm niêu cá kho',65,'energy',14,'Cháy giòn đáy niêu'],['🥣 Canh chua',30,'energy',6,'Chua thanh']]},
    {name:'Quán Nước Đèn Lồng', icon:'🏮', drinks:['nước sấu','trà nhài'], menu:[['🍹 Nước sấu đá',18,'energy',5,'Giải nhiệt'],['🍵 Trà nhài ấm',20,'coffee',6,'Thơm dịu']]},
  ];
  const BARS=[
    {name:'Sky Bar Release', icon:'🍸', drinks:['mocktail Release','soda chanh'], menu:[['🍸 Mocktail “Release”',60,'coffee',14,'Mừng bản phát hành'],['🍋 Soda chanh bạc hà',30,'energy',6,'Sảng khoái']]},
    {name:'Café Mây Tầng 9', icon:'☁️', drinks:['cold brew','latte'], menu:[['🧊 Cold brew',35,'coffee',10,'Tỉnh táo trên mây'],['🥛 Latte',35,'coffee',10,'Mịn màng']]},
    {name:'Rooftop Ngắm Thành Phố', icon:'🌃', drinks:['trà sữa nướng','nước ép'], menu:[['🔥 Trà sữa nướng',32,'coffee',8,'Thơm khói'],['🍊 Nước ép cam',28,'energy',6,'Vitamin C']]},
    {name:'Đài Gió Café', icon:'🌬️', drinks:['cà phê dừa','sinh tố'], menu:[['🥥 Cà phê dừa',30,'coffee',10,'Gió lộng'],['🍓 Sinh tố dâu',28,'energy',6,'Ngọt mát']]},
  ];
  const buff=(id,min)=>{ S.buffs=S.buffs||{}; S.buffs[id]=Math.max(Date.now(), S.buffs[id]||0)+min*60000; save(); };
  function menuModal(title, items){ const m=ui.modal(title); m.body.innerHTML=`<div class="grid">${items.map(([n,p,b,mn,d],i)=>`<div class="card"><b>${n}</b><small>${d}</small><div class="row" style="margin-top:auto"><span class="price">${fmt(p)} 💰</span><div class="sp"></div><button class="btn pri" data-i="${i}">Gọi</button></div></div>`).join('')}</div>`;
    m.body.querySelectorAll('[data-i]').forEach(bt=>bt.onclick=()=>{ const [n,p,b,mn]=items[+bt.dataset.i]; m.close(); askPay(p, `${n} – ${title.replace(/^[^ ]+ /,'')}`, ()=>{ if(!spend(p)) return; if(b) buff(b,mn); toast(`${n} ngon tuyệt! ${b==='energy'?`⚡ chạy nhanh hơn ${mn} phút`:b==='coffee'?`☕ thưởng quiz +20% trong ${mn} phút`:''}`, 3200); }); }); }
  // bảng hiệu: 1 atlas cho mọi quán (1 draw call)
  const ALL=[...SHOPS, ...BARS], ROWH=96;
  const signTex=canvasTex(1024, ROWH*(ALL.length+1), (g,w,h)=>{ [...ALL, {icon:'🙏', name:'Cảm ơn quý khách · Hẹn gặp lại'}].forEach((s,i)=>{ const y=i*ROWH; const gr=g.createLinearGradient(0,y,0,y+ROWH); gr.addColorStop(0,'#8e1f18'); gr.addColorStop(1,'#5e140f'); g.fillStyle=gr; g.fillRect(0,y,w,ROWH);
    g.strokeStyle='#e6b04a'; g.lineWidth=6; g.strokeRect(6,y+6,w-12,ROWH-12); g.fillStyle='#ffe2a0'; g.font='800 54px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(`${s.icon} ${s.name}`, w/2, y+ROWH/2+3); }); });
  const signMat=new THREE.MeshStandardMaterial({map:signTex, emissive:0xffffff, emissiveMap:signTex, emissiveIntensity:.35});   // S-QA: 1 mặt – mặt sau có tấm riêng (trước 2 tấm 2 mặt trùng nhau → chữ ngược + nhấp nháy)
  HOOK.onFrame.push(()=>{ signMat.emissiveIntensity=.3+(W.night||0)*1.1; });
  function sign(i, w, hgt, x, y, z, ry){ const g=new THREE.PlaneGeometry(w,hgt), uv=g.attributes.uv; for(let j=0;j<uv.count;j++) uv.setY(j, 1-(i+1-uv.getY(j))/(ALL.length+1)); k.add(g, signMat, x+Math.sin(ry)*.04, y, z+Math.cos(ry)*.04, 0, ry, 0); }

  /* ---------- đèn lồng + bóng đèn dây (InstancedMesh) ---------- */
  const lanterns=[], bulbs=[];
  const lanM=new THREE.MeshStandardMaterial({color:0xd8261c, emissive:0xff3a12, emissiveIntensity:.5, roughness:.5});
  const bulbM=new THREE.MeshStandardMaterial({color:0xfff1c8, emissive:0xffd27a, emissiveIntensity:.4});
  let glowN=0; const glow=(x,y,z,s,c,kk)=>{ if(GLOW && glowN<70){ GLOW.add(x,y,z,s,c,kk); glowN++; } };

  /* ---------- bàn ghế quán (ngồi được) ---------- */
  function tableSet(x, y, z, ry, umb){ const grp={seats:[], table:{x, z, y:y+.76}}; const c=Math.cos(ry), s=Math.sin(ry);
    k.add(new THREE.CylinderGeometry(.42,.42,.04,16), M.table, x, y+.74, z); k.add(new THREE.CylinderGeometry(.04,.05,.72,6), M.dark, x, y+.37, z); circles.push({x, z, r:.45, y0:y-.4, y1:y+1.4});
    if(umb){ k.add(new THREE.CylinderGeometry(.03,.03,2.4,6), M.white, x, y+1.2, z); k.add(new THREE.ConeGeometry(1.3,.45,10,1,true), M.umb[(R()*M.umb.length)|0], x, y+2.4, z); }
    const cm=M.chair[(R()*M.chair.length)|0];
    for(const sd of [-1,1]){ const cx=x+c*sd*.85, cz=z-s*sd*.85; k.add(new THREE.BoxGeometry(.42,.06,.42), cm, cx, y+.45, cz, 0, ry, 0); k.add(new THREE.BoxGeometry(.06,.45,.42), cm, cx+c*sd*.2, y+.7, cz-s*sd*.2, 0, ry, 0);
      const rot=ry+(sd>0?-Math.PI/2:Math.PI/2); const st=W.addSeat && W.addSeat({x:cx, z:cz, rot, y:y+.48, floor:y, label:'🪑 Ngồi quán (E · C)'}); if(st) grp.seats.push(st); }
    return grp; }
  function plantPot(x,y,z,s=1){ k.add(new THREE.CylinderGeometry(.32*s,.26*s,.5*s,10), M.pot, x, y+.25*s, z); k.add(new THREE.IcosahedronGeometry(.45*s,1), M.plant, x, y+.8*s, z); circles.push({x, z, r:.35*s, y0:y-.4, y1:y+1.5}); }
  function stringLights(ax,az,bx,bz,y,sag=.5){ for(let t=0;t<=1.0001;t+=1/10){ bulbs.push([ax+(bx-ax)*t, y-Math.sin(t*Math.PI)*sag, az+(bz-az)*t]); } }

  const cafes=W.CAFES||(W.CAFES=[]);
  let shopI=0, barI=0; const built={stilt:0, tower:0, slope:0};

  /* ============================== NHÀ SÀN BÁM VÁCH ============================== */
  function stilt(t){ const shop=SHOPS[shopI++%SHOPS.length], si=ALL.indexOf(shop);
    const at=(a,b)=>[t.rx+t.ux*a+t.nx*b, t.rz+t.uz*a+t.nz*b];   // a: dọc đường, b: ra phía ngoài (tính từ tim đường)
    const ry=t.yaw, ryOut=t.yaw, ryIn=t.yaw+Math.PI, ryU=Math.atan2(t.ux,t.uz);
    const e=t.e, D=t.D, Wd=t.Wd, b0=e-.35, b1=e+D, sw=Wd/3, pal=[FAC.timber, FAC.ochre, FAC.white][t.i%3];
    // 3 bậc sân thượng theo dốc đường: mỗi bậc cao = mặt đường cao nhất ở mép bậc (+6 cm) – không bao giờ bị đất trồi lên sàn
    const secs=[]; for(let j=0;j<3;j++){ const a0=-Wd/2+j*sw, a1=a0+sw; let lv=-1e9; for(const a of [a0,a1]){ const [x,z]=at(a,e-.4); lv=Math.max(lv, hAt(x,z)??t.h); }
      let gmx=-1e9; for(let a=a0+.2;a<=a1-.19;a+=.6) for(let b=e+.3;b<=b1+.01;b+=.6){ const [x,z]=at(a,b); gmx=Math.max(gmx, hAt(x,z)??-9); }
      lv=Math.max(lv+.06, gmx+.08); secs.push({a0, a1, lv}); }
    const lvMin=Math.min(...secs.map(s=>s.lv)), yb=t.gmin-1.6, topBody=lvMin-.3;
    for(const s of secs){ const am=(s.a0+s.a1)/2, [cx,cz]=at(am,(b0+b1)/2), [bx,bz]=at(am,(e+b1)/2);
      // khối nhà dưới sàn (từ chân dốc lên) + sàn gỗ
      const hb=s.lv-.3-yb; k.add(new THREE.BoxGeometry(sw+.02, hb, D), M.wallS, bx, yb+hb/2, bz, 0, ry, 0);
      k.add(new THREE.BoxGeometry(sw+.02, .3, b1-b0), M.deck, cx, s.lv-.15, cz, 0, ry, 0);
      addPlat(cx, cz, ry, sw/2+.01, (b1-b0)/2, s.lv);
      // mặt tiền ngoài (các tầng chồng xuống dốc)
      { const [fx,fz]=at(am, b1+.02); facade(pal, sw, s.lv-.3-yb, fx, (s.lv-.3+yb)/2, fz, ryOut); }
      // lan can mép ngoài (va chạm chỉ ở độ cao sàn)
      { const [x0,z0]=at(s.a0,b1-.08), [x1,z1]=at(s.a1,b1-.08), [mx,mz]=at(am,b1-.08); k.add(new THREE.BoxGeometry(sw,.06,.08), M.deckD, mx, s.lv+1.0, mz, 0, ry, 0); k.add(new THREE.BoxGeometry(sw,.9,.03), M.glass, mx, s.lv+.52, mz, 0, ry, 0);
        for(const a of [s.a0+.1, am, s.a1-.1]){ const [px,pz]=at(a,b1-.08); k.add(new THREE.BoxGeometry(.08,1.05,.08), M.deckD, px, s.lv+.5, pz, 0, ry, 0); }
        addSeg(x0,z0,x1,z1,.14, s.lv-.5, s.lv+1.6); stringLights(x0,z0,x1,z1, s.lv+2.5, .35); }
      // mép phía đường: ai thấp hơn sàn > 0,65 m (đầu dốc thấp) thì bị chặn, không chui vào gầm sàn
      { const [x0,z0]=at(s.a0,b0), [x1,z1]=at(s.a1,b0); addSeg(x0,z0,x1,z1,.1, s.lv-6, s.lv-.66); }
      // mặt bậc giữa 2 sàn chênh cao → chặn ở sàn thấp
    }
    for(let j=0;j<2;j++){ const A=secs[j], B=secs[j+1], dh=Math.abs(A.lv-B.lv), lo=Math.min(A.lv,B.lv), hi=Math.max(A.lv,B.lv); const [x0,z0]=at(A.a1,b0), [x1,z1]=at(A.a1,b1);
      if(dh>.6) addSeg(x0,z0,x1,z1,.1, lo-.5, hi-.3); }
    // 2 mặt bên: lan can + tường thân nhà
    for(const [a,s] of [[-Wd/2,secs[0]],[Wd/2,secs[2]]]){ const [x0,z0]=at(a,e+.25), [x1,z1]=at(a,b1-.08), [mx,mz]=at(a,(e+.25+b1)/2);
      k.add(new THREE.BoxGeometry(.08,.06,b1-e-.3), M.deckD, mx, s.lv+1.0, mz, 0, ry, 0); k.add(new THREE.BoxGeometry(.03,.9,b1-e-.3), M.glass, mx, s.lv+.52, mz, 0, ry, 0);
      addSeg(x0,z0,x1,z1,.14, s.lv-.5, s.lv+1.6);
      const [fx,fz]=at(a+(a<0?-.02:.02), (e+b1)/2); facade(pal, D, s.lv-.3-yb, fx, (s.lv-.3+yb)/2, fz, a<0?ryU+Math.PI:ryU);
      const [y0x,y0z]=at(a,e), [y1x,y1z]=at(a,b1); addSeg(y0x,y0z,y1x,y1z,.12, yb-2, s.lv-.3); }
    for(const s of secs){ const [x0,z0]=at(s.a0,b1), [x1,z1]=at(s.a1,b1); addSeg(x0,z0,x1,z1,.12, yb-2, s.lv-.3); }
    // mái hiên từng tầng + đèn lồng đỏ + ban công (mặt ngoài)
    const gFront=(()=>{ let m=-1e9; for(let a=-Wd/2-.6;a<=Wd/2+.61;a+=.5){ const [x,z]=at(a,b1+1.0); m=Math.max(m, hAt(x,z)??-9); } return m; })();   // A11: mặt đất ngay trước mặt nhà (không phải điểm thấp nhất) → mái hiên/đèn lồng không bị vùi
    for(let y=topBody-3.2; y>gFront+1.1; y-=3.2){ const [ex,ez]=at(0,b1+.45); k.add(new THREE.BoxGeometry(Wd+1.2,.12,1.0), M.eave, ex, y, ez, 0, ry, 0);
      const [tx,tz]=at(0,b1+.95); k.add(new THREE.BoxGeometry(Wd+1.3,.1,.08), M.trim, tx, y+.06, tz, 0, ry, 0);
      for(let a=-Wd/2+.4;a<=Wd/2-.39;a+=1.45){ const [lx,lz]=at(a,b1+.8); lanterns.push([lx,y-.38,lz]); if(((a*10)|0)%3===0) glow(lx,y-.38,lz,1.6,0xff5a2a,.9); }
      const [bx,bz]=at(0,b1+.55); k.add(new THREE.BoxGeometry(Wd*.7,.05,.05), M.deckD, bx, y+1.05, bz, 0, ry, 0); }
    // bảng hiệu (cổng gỗ) quay ra đường + quầy gọi món + bàn ghế
    const mid=secs[1];
    { const [g0x,g0z]=at(-1.7,e+.15), [g1x,g1z]=at(1.7,e+.15), [gx,gz]=at(0,e+.12); for(const [x,z] of [[g0x,g0z],[g1x,g1z]]){ k.add(new THREE.BoxGeometry(.18,3.2,.18), M.trim, x, mid.lv+1.6, z); circles.push({x, z, r:.14, y0:mid.lv-.5, y1:mid.lv+3}); }
      k.add(new THREE.BoxGeometry(3.9,.16,.3), M.eave, gx, mid.lv+3.25, gz, 0, ry, 0); sign(si, 3.7, .62, gx, mid.lv+2.86, gz, ryIn); sign(ALL.length, 3.7, .62, gx, mid.lv+2.86, gz, ryOut); }
    const [qx,qz]=at(0,b1-1.3); k.add(new THREE.BoxGeometry(2.6,1.0,.7), M.deckD, qx, mid.lv+.5, qz, 0, ry, 0); k.add(new THREE.BoxGeometry(2.8,.06,.85), M.gold, qx, mid.lv+1.03, qz, 0, ry, 0);
    for(const a of [-1.2,0,1.2]){ const [cx,cz]=at(a,b1-1.15); k.add(new THREE.CylinderGeometry(.05,.05,.12,8), M.white, cx, mid.lv+1.12, cz); }
    { const [x0,z0]=at(-1.35,b1-1.3), [x1,z1]=at(1.35,b1-1.3); addSeg(x0,z0,x1,z1,.4, mid.lv-.5, mid.lv+1.4); }
    const [ox,oz]=at(0,b1-2.4); INTER.push({x:ox, z:oz, r:2.0, prio:.6, label:`${shop.icon} ${shop.name} – gọi món (E)`, action:()=>menuModal(`${shop.icon} ${shop.name}`, shop.menu)});
    const groups=[]; for(const s of [secs[0],secs[2]]){ const am=(s.a0+s.a1)/2; for(const b of [e+1.6, e+4.6]){ if(b>b1-1) continue; const [x,z]=at(am,b); groups.push(tableSet(x, s.lv, z, ry, true)); } }
    { const [px,pz]=at(-Wd/2+.5,b1-.6), [px2,pz2]=at(Wd/2-.5,b1-.6); plantPot(px,secs[0].lv,pz); plantPot(px2,secs[2].lv,pz2); }
    const [sx,sz]=at(14, e-1.2), [cx2,cz2]=at(0,(e+b1)/2), [enx,enz]=at(0,e+.6);
    cafes.push({name:shop.name, center:{x:cx2, z:cz2}, max:2, near:36, groups, drinks:shop.drinks, eat:!!shop.eat, spawn:{x:sx, z:sz}, order:()=>({x:ox, z:oz, face:ryOut}), via:()=>[], entry:[[enx,enz]], exit:[[enx,enz]]});
    makeLabel(`${shop.icon} ${shop.name}`, 'Quán sân thượng bám vách · gọi món · ngồi ngắm phố núi', {h:.5, x:at(0,e+1)[0], y:mid.lv+4.3, z:at(0,e+1)[1], fade:40});
    built.stilt++; return {shop, x:cx2, z:cz2, y:mid.lv, road:at(0,e-1.5)}; }

  /* ============================== THÁP CẦU TRỜI ============================== */
  function tower(t){ const bar=BARS[barI++%BARS.length], si=ALL.indexOf(bar);
    const at=(a,b)=>[t.rx+t.ux*a+t.nx*b, t.rz+t.uz*a+t.nz*b]; const ry=t.yaw, ryIn=t.yaw+Math.PI, ryU=Math.atan2(t.ux,t.uz);
    const e=t.e, D=t.D, Wd=t.Wd, gap=t.gap, bw=1.8, tb0=e+gap, tb1=tb0+D, pal=[FAC.teal, FAC.sky, FAC.coral, FAC.lilac][t.i%4];
    // cầu đi bộ: cao độ = mặt đường cao nhất ở miệng cầu
    let BL=-1e9; for(const a of [-bw,bw]){ const [x,z]=at(a,e-.4); BL=Math.max(BL, hAt(x,z)??t.h); } BL+=.06;
    const nUp=Math.max(1, Math.min(3, Math.floor((info.TOPH-3-BL-3.4)/3.2))), top=BL+3.4+3.2*nUp, yb=t.gmin-1.6;
    { const [cx,cz]=at(0,(e-.35+tb0+.3)/2), L=tb0+.3-(e-.35); k.add(new THREE.BoxGeometry(bw*2,.35,L), M.stone, cx, BL-.175, cz, 0, ry, 0); addPlat(cx, cz, ry, bw, L/2, BL);
      for(const sd of [-1,1]){ const [x0,z0]=at(sd*bw,e), [x1,z1]=at(sd*bw,tb0), [mx,mz]=at(sd*bw,(e+tb0)/2); k.add(new THREE.BoxGeometry(.08,.06,gap), M.steel, mx, BL+1.05, mz, 0, ry, 0); k.add(new THREE.BoxGeometry(.03,1.0,gap), M.glass, mx, BL+.55, mz, 0, ry, 0); addSeg(x0,z0,x1,z1,.14, BL-.5, BL+1.6); stringLights(x0,z0,x1,z1,BL+2.2,.25); }
      const [ax,az]=at(-bw,e-.35), [bx2,bz2]=at(bw,e-.35); addSeg(ax,az,bx2,bz2,.1, BL-6, BL-.66);
      // trụ đỡ cầu
      const [px,pz]=at(0,e+gap*.55), gp=hAt(px,pz)??t.gmin, ph=BL-.35-gp+1; if(ph>1){ k.add(new THREE.CylinderGeometry(.35,.45,ph,10), M.stone, px, gp-1+ph/2, pz); circles.push({x:px, z:pz, r:.5, y0:gp-2, y1:BL-.4}); } }
    // thân tháp + mặt tiền 4 phía + cửa sảnh trời ở cao độ cầu
    const VA=1.5, VB=2.4, SB=5.3;   /* sảnh trời: |a| < 1,5 · b từ mặt tháp tới +2,4 m · giếng thang máy: b +2,4 … +5,3 (cửa thang quay ra cầu) */
    const boxL=(a0,a1,b0,b1,y0,y1,m)=>{ const [x,z]=at((a0+a1)/2,(b0+b1)/2); k.add(new THREE.BoxGeometry(a1-a0, y1-y0, b1-b0), m, x, (y0+y1)/2, z, 0, ry, 0); };
    { const [cx,cz]=at(0,(tb0+tb1)/2), hb=top-yb;
      boxL(-Wd/2,Wd/2,tb0+SB,tb1,yb,top,M.wallS); boxL(-Wd/2,-VA,tb0,tb0+SB,yb,top,M.wallS); boxL(VA,Wd/2,tb0,tb0+SB,yb,top,M.wallS);
      boxL(-VA,VA,tb0,tb0+VB,yb,BL,M.wallS); boxL(-VA,VA,tb0+VB,tb0+SB,yb,BL-.45,M.wallS); boxL(-VA,VA,tb0,tb0+VB,BL+2.7,top,M.wallS);
      boxL(-VA+.02,VA-.02,tb0+.02,tb0+VB,BL-.04,BL,M.stone); { const [vx,vz]=at(0,tb0+VB/2); addPlat(vx, vz, ry, VA, VB/2, BL); k.add(new THREE.BoxGeometry(1.6,.04,1.2), M.led, vx, BL+2.66, vz, 0, ry, 0); }
      for(const [a,b,w,r] of [[0,tb1+.02,Wd,ry],[-Wd/2-.02,(tb0+tb1)/2,D,ryU+Math.PI],[Wd/2+.02,(tb0+tb1)/2,D,ryU]]){ const [fx,fz]=at(a,b); facade(pal, w, hb-.6, fx, yb+(hb-.6)/2, fz, r); }
      for(const sd of [-1,1]){ const [fx,fz]=at(sd*(Wd/2+VA)/2,tb0-.02); facade(pal, Wd/2-VA, hb-.6, fx, yb+(hb-.6)/2, fz, ryIn); }   /* mặt cầu đi bộ: chừa ô cửa sảnh trời */
      { const [fx,fz]=at(0,tb0-.02), y0=BL+2.7, y1=top-.6; if(y1-y0>.3) facade(pal, 2*VA, y1-y0, fx, (y0+y1)/2, fz, ryIn); if(BL-yb>.3) facade(pal, 2*VA, BL-yb, fx, (yb+BL)/2, fz, ryIn); }
      const cs=[[-Wd/2,tb0],[Wd/2,tb0],[Wd/2,tb1],[-Wd/2,tb1]].map(([a,b])=>at(a,b)); for(let i=1;i<4;i++){ const [x0,z0]=cs[i], [x1,z1]=cs[(i+1)%4]; addSeg(x0,z0,x1,z1,.1, yb-3, top-.35); }
      { const [ax,az]=at(-VA,tb0), [bx,bz]=at(VA,tb0); addSeg(cs[0][0],cs[0][1],ax,az,.1,yb-3,top-.35); addSeg(bx,bz,cs[1][0],cs[1][1],.1,yb-3,top-.35); addSeg(ax,az,bx,bz,.1,yb-3,BL-.5); addSeg(ax,az,bx,bz,.1,BL+2.6,top-.35);   /* ô cửa sảnh trời */
        for(const sd of [-1,1]){ const [p0,q0]=at(sd*VA,tb0), [p1,q1]=at(sd*VA,tb0+VB+.1); addSeg(p0,q0,p1,q1,.1,BL-.5,BL+2.7,'🏙️ Vách sảnh thang máy'); } }
      // nóc: lan can kính + viền LED
      const [rx,rz]=at(0,(tb0+tb1)/2); for(const r of rectHoles(-Wd/2-.15,Wd/2+.15,tb0-.15,tb1+.15,[{x0:-VA,x1:VA,z0:tb0+VB,z1:tb0+SB}])){ boxL(r.x0,r.x1,r.z0,r.z1,top-.35,top-.05,M.dark); const a0=Math.max(r.x0,-Wd/2+.05), a1=Math.min(r.x1,Wd/2-.05), b0=Math.max(r.z0,tb0+.05), b1=Math.min(r.z1,tb1-.05); if(a1>a0 && b1>b0){ boxL(a0,a1,b0,b1,top-.05,top+.01,M.deck); const [px,pz]=at((a0+a1)/2,(b0+b1)/2); addPlat(px, pz, ry, (a1-a0)/2, (b1-b0)/2, top); } }   /* mái chừa lỗ giếng thang */
      for(const sd of [-1,1]){ boxL(-Wd/2-.16,Wd/2+.16,(sd<0?tb0:tb1)-.16,(sd<0?tb0:tb1)+.16,top-.42,top-.3,M.led); boxL(sd*(Wd/2)-.16,sd*(Wd/2)+.16,tb0,tb1,top-.42,top-.3,M.led); }   // viền LED quanh mái
      for(let i=0;i<4;i++){ const [x0,z0]=cs[i], [x1,z1]=cs[(i+1)%4], L=Math.hypot(x1-x0,z1-z0), mx=(x0+x1)/2, mz=(z0+z1)/2, r=Math.atan2(x1-x0,z1-z0); k.add(new THREE.BoxGeometry(.04,1.05,L), M.glass, mx, top+.55, mz, 0, r, 0); k.add(new THREE.BoxGeometry(.1,.07,L), M.steel, mx, top+1.08, mz, 0, r, 0); addSeg(x0,z0,x1,z1,.16, top-.5, top+1.6); }
      // cửa sảnh trời
      for(const sd of [-1,1]) boxL(sd*VA-.12,sd*VA+.12,tb0-.1,tb0+.1,BL,BL+2.7,M.dark); boxL(-VA-.12,VA+.12,tb0-.1,tb0+.1,BL+2.6,BL+2.85,M.dark);   /* khung ô cửa sảnh trời (đi thẳng vào – thang máy ngay trước mặt) */
      sign(si, 3.6, .55, ...(()=>{ const [x,z]=at(0,tb0-.1); return [x, BL+3.0, z]; })(), ryIn); }
    // sân thượng: quầy bar, bàn ghế, cây, dây đèn, ống nhòm, cabin thang máy
    const R2=(a,b)=>at(a,(tb0+tb1)/2+b);
    { const [lx,lz]=at(0,tb0+VB+1.45); makeLift(W, {x:lx, z:lz, yaw:Math.atan2(-t.nx,-t.nz), name:`Thang ${bar.name}`, color:0xd9a640, floors:[{y:BL, name:'Cầu đi bộ · sảnh trời', short:'C'}, {y:top, name:`Sân thượng · ${bar.name}`, short:'R'}]}); }   /* thang máy thật: cầu đi bộ ↔ sân thượng */
    const [bx,bz]=R2(Wd/2-1.6,0); k.add(new THREE.BoxGeometry(1.0,1.05,4.2), M.deckD, bx, top+.52, bz, 0, ry, 0); k.add(new THREE.BoxGeometry(1.2,.06,4.4), M.gold, bx, top+1.07, bz, 0, ry, 0);
    { const [x0,z0]=R2(Wd/2-1.6,-2.1), [x1,z1]=R2(Wd/2-1.6,2.1); addSeg(x0,z0,x1,z1,.55, top-.5, top+1.4); }
    const [ox,oz]=R2(Wd/2-3.0,0); INTER.push({x:ox, z:oz, r:1.8, prio:.6, when:()=>Math.abs(P.y-top)<1.2, label:`${bar.icon} ${bar.name} – gọi đồ uống (E)`, action:()=>menuModal(`${bar.icon} ${bar.name}`, bar.menu)});
    const groups=[]; for(const [a,b] of [[-3.8,-1.0],[-1.2,2.2],[1.6,3.6],[-3.6,3.6]]){ const [x,z]=R2(a,b); groups.push(tableSet(x, top, z, ry, false)); }
    for(const [a,b] of [[-Wd/2+.6,D/2-.6],[Wd/2-.6,D/2-.6],[Wd/2-.6,-D/2+.6]]){ const [x,z]=R2(a,b); plantPot(x, top, z, 1.2); }
    { const cs=[[-Wd/2+.3,-D/2+.3],[Wd/2-.3,-D/2+.3],[Wd/2-.3,D/2-.3],[-Wd/2+.3,D/2-.3]].map(([a,b])=>R2(a,b)); for(const [x,z] of cs){ k.add(new THREE.CylinderGeometry(.05,.05,3,6), M.dark, x, top+1.5, z); circles.push({x, z, r:.1, y0:top-.4, y1:top+3}); }
      for(let i=0;i<4;i++) stringLights(cs[i][0],cs[i][1],cs[(i+1)%4][0],cs[(i+1)%4][1], top+2.9, .4); stringLights(cs[0][0],cs[0][1],cs[2][0],cs[2][1], top+2.9, .6); }
    // ống nhòm ngắm thành phố (nhìn ra phía ngoài đồi)
    const [tx,tz]=R2(0,D/2-.9); k.add(new THREE.CylinderGeometry(.06,.08,1.2,8), M.steel, tx, top+.6, tz); k.add(new THREE.CylinderGeometry(.11,.08,.55,10), M.gold, tx, top+1.25, tz, Math.PI/2-.15, ry, 0); circles.push({x:tx, z:tz, r:.25, y0:top-.4, y1:top+2});
    INTER.push({x:tx, z:tz, r:1.6, prio:.7, when:()=>Math.abs(P.y-top)<1.2, label:'🔭 Ống nhòm – ngắm toàn thành phố (E)', action:()=>scope(tx, top+1.5, tz, t.nx, t.nz)});
    { const [sx,sz]=R2(-Wd/2+1.3,-D/2+3.6); cafes.push({name:bar.name, center:{x:rx0(R2), z:rz0(R2)}, max:2, near:30, groups, drinks:bar.drinks, spawn:{x:sx, z:sz}, order:()=>({x:ox, z:oz, face:ryU}), via:()=>[]}); }
    makeLabel(`${bar.icon} ${bar.name}`, `Cầu đi bộ → thang máy lên sân thượng tầng ${nUp+2}`, {h:.5, x:at(0,e+1.5)[0], y:BL+3.9, z:at(0,e+1.5)[1], fade:40});
    for(let i=0;i<4;i++){ const [x,z]=R2((i%2?1:-1)*Wd/2, (i<2?-1:1)*D/2); glow(x, top-.36, z, 2.2, [0x6ad7ff,0xff6ad5,0xffd23f,0x7dff9a][t.i%4], .8); }
    built.tower++; return {bar, x:rx0(R2), z:rz0(R2), y:top, bridge:at(0,e+2)}; }
  const rx0=R2=>R2(0,0)[0], rz0=R2=>R2(0,0)[1];

  /* ============================== THÁP CHUNG CƯ TRÊN SƯỜN ĐỒI ============================== */
  const crownCols=[0x46d39a,0xff6ad5,0x4fc3ff,0xffd23f,0xff7b29];
  function slope(t){ const pal=[FAC.coral, FAC.lilac, FAC.lemon, FAC.mint, FAC.sky, FAC.teal][t.i%6], yb=t.gmin-2, top=t.gmin+t.hgt, hb=top-yb;
    // bệ móng đá bám dốc (2 tầng, rộng hơn thân) + thân tháp
    const ph=t.gmax-yb+4; k.add(new THREE.BoxGeometry(t.w+2,ph,t.d+2), M.stone, t.x, yb+ph/2, t.z);
    k.add(new THREE.BoxGeometry(t.w,hb,t.d), M.wallS, t.x, yb+hb/2, t.z);
    for(const [dx,dz,w,r] of [[0,t.d/2+.02,t.w,0],[0,-t.d/2-.02,t.w,Math.PI],[t.w/2+.02,0,t.d,Math.PI/2],[-t.w/2-.02,0,t.d,-Math.PI/2]]) facade(pal, w, top-(yb+ph)-.4, t.x+dx, (top-.4+yb+ph)/2, t.z+dz, r);
    k.add(new THREE.BoxGeometry(t.w+.4,.5,t.d+.4), M.dark, t.x, top+.25, t.z); k.add(new THREE.BoxGeometry(t.w+.42,.16,t.d+.42), M.led, t.x, top-.1, t.z);
    k.add(new THREE.CylinderGeometry(1.1,1.1,2.2,12), M.steel, t.x-t.w/4, top+1.6, t.z-t.d/4); k.add(new THREE.CylinderGeometry(.05,.05,5,6), M.steel, t.x+t.w/4, top+3, t.z+t.d/4);
    boxes.push({x0:t.x-t.w/2-1, x1:t.x+t.w/2+1, z0:t.z-t.d/2-1, z1:t.z+t.d/2+1});
    glow(t.x, top+.1, t.z, 3.0, crownCols[t.i%crownCols.length], .5); built.slope++; }

  /* ---------- dựng ---------- */
  const spots=[];
  for(const t of TOWN){ try{ spots.push(t.type==='tower' ? {t, ...tower(t)} : {t, ...stilt(t)}); }catch(e){ console.warn('mountaintown site', e); } }
  for(const t of SLOPE){ try{ slope(t); }catch(e){ console.warn('mountaintown slope', e); } }
  k.build(scene);
  if(lanterns.length){ const g=new THREE.SphereGeometry(.22,7,5); g.scale(1,1.25,1); const im=new THREE.InstancedMesh(g, lanM, lanterns.length); lanterns.forEach(([x,y,z],i)=>{ _m.makeTranslation(x,y,z); im.setMatrixAt(i,_m); }); im.userData.dynamic=true; im.computeBoundingSphere(); scene.add(im);
    const cap=new THREE.CylinderGeometry(.12,.12,.08,8); const im2=new THREE.InstancedMesh(cap, M.gold, lanterns.length*2); lanterns.forEach(([x,y,z],i)=>{ _m.makeTranslation(x,y+.28,z); im2.setMatrixAt(i*2,_m); _m.makeTranslation(x,y-.28,z); im2.setMatrixAt(i*2+1,_m); }); im2.userData.dynamic=true; im2.computeBoundingSphere(); scene.add(im2); }
  if(bulbs.length){ const im=new THREE.InstancedMesh(new THREE.SphereGeometry(.07,6,5), bulbM, bulbs.length); bulbs.forEach(([x,y,z],i)=>{ _m.makeTranslation(x,y,z); im.setMatrixAt(i,_m); }); im.userData.dynamic=true; im.computeBoundingSphere(); scene.add(im); }
  HOOK.onFrame.push(()=>{ const n=W.night||0; lanM.emissiveIntensity=.35+n*2.6; bulbM.emissiveIntensity=.25+n*3; M.led.emissiveIntensity=.3+n*1.6; M.led.emissive.setHSL((performance.now()/9000)%1, .8, .55); });

  /* ---------- ống nhòm: camera bay ra xa nhìn toàn cảnh, tự quay lại sau 9 giây hoặc khi bấm phím di chuyển ---------- */
  let scopeT=0;
  function scope(x,y,z,nx,nz){ const pos=new THREE.Vector3(x+nx*3, y+1.2, z+nz*3), look=new THREE.Vector3(x+nx*160, y-14, z+nz*160); HOOK.camOverride={pos, look, k:2.2}; scopeT=9; toast('🔭 Đang ngắm thành phố… (bấm W/A/S/D để thôi)', 2400); }
  HOOK.onFrame.push((dt)=>{ if(scopeT<=0) return; scopeT-=dt; const K=W.K||(window.__qc&&window.__qc.K)||{}; if(scopeT<=0 || K.KeyW||K.KeyA||K.KeyS||K.KeyD){ scopeT=0; HOOK.camOverride=null; } });

  /* ---------- bản đồ / dịch chuyển ---------- */
  const first=spots.find(s=>s.road);
  if(first) PLACES.push({icon:'🏮', name:'Phố Núi Sơn Thành', sub:`Đường xoắn ốc lên đồi · ${built.stilt} quán sân thượng bám vách · ${built.tower} tháp cầu trời`, go:()=>teleport(first.road[0], first.road[1], first.x, first.z)});
  const sky=spots.find(s=>s.bridge); if(sky) PLACES.push({icon:'🌉', name:`Tháp cầu trời · ${sky.bar.name}`, sub:'Cầu đi bộ vào thân tháp → thang máy lên sân thượng', go:()=>teleport(sky.bridge[0], sky.bridge[1], sky.x, sky.z)});
  console.info(`[QC World] Phố Núi: ${built.stilt} nhà sàn, ${built.tower} tháp cầu trời, ${built.slope} tháp sườn đồi`);
  return {spots, built};
}

/* Sàn/mái chừa lỗ giếng thang máy: chữ nhật (x0..x1, z0..z1) trừ các lỗ → danh sách chữ nhật đặc */
function rectHoles(x0,x1,z0,z1,holes){ const H=holes.map(h=>({x0:Math.max(x0,h.x0), x1:Math.min(x1,h.x1), z0:Math.max(z0,h.z0), z1:Math.min(z1,h.z1)})).filter(h=>h.x1>h.x0 && h.z1>h.z0);
  const zs=[...new Set([z0,z1,...H.flatMap(h=>[h.z0,h.z1])])].sort((a,b)=>a-b), out=[];
  for(let i=0;i<zs.length-1;i++){ const za=zs[i], zb=zs[i+1], zm=(za+zb)/2, cut=H.filter(h=>zm>h.z0 && zm<h.z1).sort((a,b)=>a.x0-b.x0); let x=x0;
    for(const h of cut){ if(h.x0>x+1e-3) out.push({x0:x, x1:h.x0, z0:za, z1:zb}); x=Math.max(x,h.x1); } if(x1>x+1e-3) out.push({x0:x, x1, z0:za, z1:zb}); }
  return out; }
