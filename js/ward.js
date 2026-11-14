// QC World – Sprint 2: Phường Khởi Nghiệp (thế giới mở, nối liền bờ Nam Downtown) + cổng "Rời đảo" + hiển thị vùng.
// Đảo Master Dashboard = vùng MIỄN PHÍ (tool, học, quiz, concert). Qua cổng ở đầu cầu = THẾ GIỚI MỞ (dịch vụ tính phí, đi làm kiếm tiền).
// Phường có: phố chính, Chợ QC, Showroom xe, Văn phòng địa chính (city.js dựng theo CITY.places), 12 lô đất (life.js),
// Trung tâm Việc làm, Nhà trọ khởi nghiệp (phòng miễn phí cho người mới), quầy Bếp Cơm (việc phụ bếp).
export function buildWard(W){
  const {THREE, scene, mesh, box, MAT, colorMat, CITY, circles, boxes, lampPost, makeLabel, INTER, PLACES, teleport, toast, palm, HOOK, P, regionAt, $} = W;   // bench() bên dưới dùng chung cho phố & đảo
  const Z=CITY.ward, X0=Z.x0, X1=Z.x1, GZ0=62, SZ0=64, Z1=Z.z1, ST=Z.street, SWD=10, LX=Z.links;
  const R=Math.random, out={spots:{}};
  const canvasTex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };

  /* ---------- 1. Nền phường + mặt đất vẽ 1 texture (vỉa hè, phố chính, 2 nhánh nối Downtown, vạch kẻ) ---------- */
  { const slab=mesh(new THREE.BoxGeometry(X1-X0+4, 8, Z1+2-SZ0), MAT.stone, (X0+X1)/2, -4+.02, (SZ0+Z1+2)/2); slab.castShadow=false;
    const GW=X1-X0, GD=Z1-GZ0, ppm=W.QUAL==='low'?10:14, TW=Math.round(GW*ppm), TH=Math.round(GD*ppm);
    const X=x=>(x-X0)*ppm, Y=z=>(z-GZ0)*ppm;
    const tex=canvasTex(TW,TH,(g)=>{
      g.fillStyle='#a49d90'; g.fillRect(0,0,TW,TH);
      const t=.5*ppm; for(let y=0;y<TH;y+=t) for(let x=(Math.floor(y/t)%2)*t/2;x<TW;x+=t){ const v=150+R()*22|0; g.fillStyle=`rgb(${v},${v-7},${v-18})`; g.fillRect(x+1,y+1,t-2,t-2); }
      const road=(x0,z0,x1,z1)=>{ g.fillStyle='#35373c'; g.fillRect(X(x0),Y(z0),X(x1)-X(x0),Y(z1)-Y(z0)); };
      road(X0, ST-SWD/2, X1, ST+SWD/2); for(const x of LX) road(x-SWD/2, GZ0, x+SWD/2, ST-SWD/2);
      g.globalAlpha=.3; for(let i=0;i<26000;i++){ const x=X0+R()*GW, z=GZ0+R()*GD; const inR=Math.abs(z-ST)<SWD/2 || (z<ST && LX.some(l=>Math.abs(x-l)<SWD/2)); if(!inR) continue; const v=40+R()*40|0; g.fillStyle=`rgb(${v},${v},${v+4})`; g.fillRect(X(x),Y(z),2,2); } g.globalAlpha=1;
      const lw=.15*ppm, white='#ecebe4', yellow='#e8b923';
      // phố chính: vạch mép trắng, vạch giữa vàng đứt
      const cuts=[X0, ...LX.flatMap(x=>[x-SWD/2, x+SWD/2]), X1];
      for(let i=0;i<cuts.length;i+=2){ const a=cuts[i]+(i?4:0), b=cuts[i+1]-(i+2<cuts.length?4:0);
        g.fillStyle=white; g.fillRect(X(a),Y(ST-SWD/2+.35),X(b)-X(a),lw); g.fillRect(X(a),Y(ST+SWD/2-.35)-lw,X(b)-X(a),lw);
        g.fillStyle=yellow; for(let x=a;x<b-1.5;x+=4.5) g.fillRect(X(x),Y(ST)-lw/2,2.6*ppm,lw); }
      // nhánh nối Downtown
      for(const x of LX){ const a=GZ0, b=ST-SWD/2-4; g.fillStyle=white; g.fillRect(X(x-SWD/2+.35),Y(a),lw,Y(b)-Y(a)); g.fillRect(X(x+SWD/2-.35)-lw,Y(a),lw,Y(b)-Y(a));
        g.fillStyle=yellow; for(let z=a;z<b-1.5;z+=4.5) g.fillRect(X(x)-lw/2,Y(z),lw,2.6*ppm);
        g.fillStyle=white; g.fillRect(X(x),Y(b),(SWD/2-.4)*ppm,.4*ppm);
        for(let k=-SWD/2+.6;k<SWD/2-.6;k+=.9) g.fillRect(X(x+k),Y(b+.2-1.3),.5*ppm,2.6*ppm);   // vạch qua đường
        for(const s of [-1,1]){ const xx=x+s*(SWD/2+2); for(let k=-SWD/2+.6;k<SWD/2-.6;k+=.9) g.fillRect(X(xx-1.3),Y(ST+k),2.6*ppm,.5*ppm); } }
    });
    tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(GW,GD), new THREE.MeshStandardMaterial({map:tex, roughness:.88})); ground.rotation.x=-Math.PI/2; ground.position.set((X0+X1)/2,.03,(GZ0+Z1)/2); ground.receiveShadow=true; scene.add(ground);
    // bó vỉa
    const curbM=colorMat(0xd7d3ca,{roughness:.8});
    for(const s of [-1,1]){ const zz=ST+s*(SWD/2+.12); let a=X0; for(const x of (s<0?[...LX, X1+SWD/2]:[X1+SWD/2])){ const b=x-SWD/2; if(b-a>1){ const c=mesh(box(b-a,.14,.24), curbM, (a+b)/2,.07,zz); c.castShadow=false; } a=x+SWD/2; } }
    for(const x of LX) for(const s of [-1,1]){ const c=mesh(box(.24,.14,ST-SWD/2-GZ0), curbM, x+s*(SWD/2+.12),.07,(GZ0+ST-SWD/2)/2); c.castShadow=false; }
    // lan can mép bờ (trang trí) – cạnh Tây/Đông/Nam
    for(const [x0,z0,x1,z1] of [[X0-1,SZ0,X0-1,Z1+1],[X1+1,SZ0,X1+1,Z1+1],[X0-1,Z1+1,X1+1,Z1+1]]){ const len=Math.hypot(x1-x0,z1-z0), r=mesh(box(.08,.08,len), MAT.metal, (x0+x1)/2,1,(z0+z1)/2); r.rotation.y=Math.atan2(x1-x0,z1-z0); }
    // đèn + cây hai bên phố
    for(let x=X0+6;x<X1-2;x+=16){ if(LX.some(l=>Math.abs(l-x)<7)) continue; lampPost(x, ST-SWD/2-1.1); lampPost(x+8, ST+SWD/2+1.1); }
    for(let x=X0+3;x<X1;x+=22){ if(LX.some(l=>Math.abs(l-x)<8)) continue; palm(x, Z1-1.5, .8+R()*.2); }
    makeLabel('🌱 Phường Khởi Nghiệp', 'Thế giới mở · chợ, đất, việc làm, nhà trọ', {h:1, x:LX[0], y:8, z:ST-8, fade:120});
  }

  /* ---------- 2. Ghế đá dọc phố (ngồi được) ---------- */
  function bench(x, z, rot){ const gy=W.groundH(x,z), g=new THREE.Group(); g.position.set(x,gy,z); g.rotation.y=rot; scene.add(g);
    mesh(box(1.6,.08,.45), MAT.wood, 0,.45,0, g); mesh(box(1.6,.4,.06), MAT.wood, 0,.72,-.2, g); for(const s of [-1,1]) mesh(box(.08,.45,.45), MAT.black, s*.7,.22,0, g);
    circles.push({x, z, r:.7}); const f=[Math.sin(rot),Math.cos(rot)], rx=Math.cos(rot), rz=-Math.sin(rot);
    if(W.addSeat) for(const k of [-.42,.42]) W.addSeat({x:x+f[0]*.1+rx*k, z:z+f[1]*.1+rz*k, rot, y:gy+.49, floor:gy, label:'🪑 Ngồi ghế đá (E · C)'}); }
  for(const x of [171, 186, 214, 229]) bench(x, ST-SWD/2-2.2, Math.PI);

  /* ---------- 3. Trung tâm Việc làm ---------- */
  { const x=193, z=70.5, g=new THREE.Group(); g.position.set(x,0,z); scene.add(g);
    const gtex=canvasTex(512,256,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#2d5d86'); gr.addColorStop(.5,'#1d3f63'); gr.addColorStop(1,'#13304d'); c.fillStyle=gr; c.fillRect(0,0,w,h);
      c.fillStyle='rgba(255,255,255,.09)'; for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(i*110-60,0); c.lineTo(i*110+20,0); c.lineTo(i*110-80,h); c.lineTo(i*110-160,h); c.fill(); }
      c.fillStyle='rgba(255,236,190,.35)'; for(const [x,y] of [[60,150],[180,160],[300,140],[420,155]]) c.fillRect(x,y,60,40);   // bóng người/đèn bên trong
      c.fillStyle='#c9d1d9'; for(let i=0;i<=5;i++) c.fillRect(i*w/5-3,0,6,h); c.fillRect(0,h/2-3,w,6); c.fillRect(0,0,w,6); c.fillRect(0,h-6,w,6); });
    const glass=new THREE.MeshStandardMaterial({map:gtex, metalness:.55, roughness:.12, envMapIntensity:1.5, emissive:0xffffff, emissiveMap:gtex, emissiveIntensity:.08});
    const white=colorMat(0xf1f3f5,{roughness:.5}), dark=colorMat(0x2b3138,{roughness:.5});
    mesh(box(13,.3,8.4), MAT.stone, 0,.15,0, g);
    mesh(box(12.4,7,7.6), white, 0,3.8,-.2, g);
    mesh(box(11.6,5.2,.08), glass, 0,3.6,3.62, g); for(const xx of [-5.9,5.9]) mesh(box(.3,7,.3), dark, xx,3.8,3.6, g); mesh(box(12.6,.3,7.8), dark, 0,7.4,-.2, g); mesh(box(12.4,.18,.3), dark, 0,6.2,3.7, g);
    mesh(box(2.4,2.7,.1), dark, 0,1.6,3.68, g); mesh(box(2.0,2.4,.06), new THREE.MeshStandardMaterial({color:0x0e2035, metalness:.6, roughness:.1}), 0,1.5,3.73, g); mesh(box(4,.12,1.4), dark, 0,3.05,4.3, g);
    const sg=canvasTex(1024,180,(c,w,h)=>{ c.fillStyle='#0f2747'; c.fillRect(0,0,w,h); c.fillStyle='#ffd23f'; c.fillRect(0,h-12,w,12); c.fillStyle='#fff'; c.font='800 74px "Segoe UI","Segoe UI Emoji",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('💼 TRUNG TÂM VIỆC LÀM', w/2, h/2-4); });
    mesh(box(9,1.4,.12), new THREE.MeshStandardMaterial({map:sg, emissive:0xffffff, emissiveMap:sg, emissiveIntensity:.35}), 0,6.9,3.75, g);
    // bảng tin việc làm ngoài cửa
    const bt=canvasTex(1024,640,(c,w,h)=>{ c.fillStyle='#16324f'; c.fillRect(0,0,w,h); c.fillStyle='#fff'; c.font='800 60px "Segoe UI",sans-serif'; c.fillText('BẢNG VIỆC LÀM HÔM NAY',40,80);
      c.font='500 38px "Segoe UI","Segoe UI Emoji",sans-serif'; const L=['🧹 Dọn rác phố ..... 30–110 💰','📦 Giao hàng ........ 40–140 💰','🍳 Phụ bếp ........... 30–100 💰','🧠 SQL · API · Bug · Test · Code','      Dễ 40 · Vừa 90 · Khó 180 💰','🏢 Xin việc công ty → vào toà nhân viên'];
      L.forEach((t,i)=>{ c.fillStyle=i===3||i===4?'#ffd23f':'#dfe8f5'; c.fillText(t,40,170+i*72); }); });
    const bg=new THREE.Group(); bg.position.set(-5.2,0,5.6); bg.rotation.y=.35; g.add(bg);
    for(const s of [-1,1]) mesh(new THREE.CylinderGeometry(.06,.06,2.6,8), MAT.black, s*1.3,1.3,0, bg);
    mesh(box(2.9,1.85,.08), MAT.black, 0,2.0,-.05, bg); const bm=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.75), new THREE.MeshStandardMaterial({map:bt, emissive:0xffffff, emissiveMap:bt, emissiveIntensity:.4})); bm.position.set(0,2,.0); bg.add(bm);
    boxes.push({x0:x-6.3, x1:x+6.3, z0:z-4, z1:z+3.7});
    out.spots.jobCenter={x, z:z+5.6};
    makeLabel('🧑‍💼 Trung tâm Việc làm', 'Việc chân tay · việc trí tuệ · xin việc công ty', {h:.9, x, y:9.2, z, fade:110});
  }

  /* ---------- 4. Nhà trọ khởi nghiệp (4 phòng, phòng 1 cấp miễn phí cho người mới) ---------- */
  { const x0=228.5, z=70, RW=7.2, n=4, g=new THREE.Group(); scene.add(g);
    const wall=colorMat(0xe2d6bf,{roughness:.95}), stain=colorMat(0xbfae8e,{roughness:1}), roof=new THREE.MeshStandardMaterial({color:0x8d9399, metalness:.6, roughness:.45});
    mesh(box(RW*n+.6,.25,6.6), MAT.stone, x0+RW*n/2,.12,z, g);
    mesh(box(RW*n,3.1,5.2), wall, x0+RW*n/2,1.8,z-.4, g);
    for(let i=0;i<n;i++){ const cx=x0+RW*i+RW/2;
      if(i) mesh(box(.12,3.1,5.3), stain, x0+RW*i,1.8,z-.4, g);
      mesh(box(1.1,2.2,.1), colorMat([0x3f6db3,0x8a4b2a,0x2e7d4f,0x7a3a8a][i],{roughness:.6}), cx-1.6,1.35,z+2.23, g);
      mesh(box(1.3,1,.08), MAT.glass, cx+1.4,1.9,z+2.22, g);
      const num=canvasTex(128,128,(c,w,h)=>{ c.fillStyle='#fff'; c.fillRect(0,0,w,h); c.fillStyle='#1b2233'; c.font='800 90px "Segoe UI",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(String(i+1),w/2,h/2+4); });
      mesh(box(.32,.32,.04), new THREE.MeshStandardMaterial({map:num}), cx-1.6,2.75,z+2.25, g);
      if(i>0){ mesh(box(.04,.6,.9), colorMat(0x6b6b6b), cx+.2,.8,z+2.6, g); mesh(new THREE.SphereGeometry(.25,8,6), colorMat(0x3f8f3a), cx+.2,1.25,z+2.6, g); } }   // xe đạp/chậu cây trước phòng có người
    for(let i=0;i<5;i++){ const r=mesh(box(RW*n+.8,.08,1.5), roof, x0+RW*n/2,3.45+.06*i,z-2.6+i*1.25, g); r.rotation.x=-.08; }
    const sg=canvasTex(1024,150,(c,w,h)=>{ c.fillStyle='#f6e7c1'; c.fillRect(0,0,w,h); c.fillStyle='#7a3a1d'; c.font='800 70px "Segoe UI","Segoe UI Emoji",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('🛏️ NHÀ TRỌ KHỞI NGHIỆP', w/2, h/2); });
    mesh(box(10,1.1,.08), new THREE.MeshStandardMaterial({map:sg}), x0+RW*n/2,3.0,z+2.3, g);
    boxes.push({x0:x0-.3, x1:x0+RW*n+.3, z0:z-3.1, z1:z+2.3});
    out.spots.tro={x:x0+RW/2-1.6, z:z+3.6, face:Math.PI, rooms:[0,1,2,3].map(i=>({x:x0+RW*i+RW/2-1.6, z:z+3.2}))};
    makeLabel('🛏️ Nhà trọ khởi nghiệp', 'Phòng 1 cấp miễn phí cho người mới', {h:.8, x:x0+RW*n/2, y:5.6, z, fade:90});
  }

  /* ---------- 5. Quầy Bếp Cơm (việc phụ bếp) ---------- */
  { const x=153.5, z=71, g=new THREE.Group(); g.position.set(x,0,z); scene.add(g);
    mesh(box(4.4,1.05,1.6), colorMat(0xb5452b,{roughness:.6}), 0,.53,.6, g); mesh(box(4.6,.08,1.8), colorMat(0xe9e5dc), 0,1.09,.6, g);
    mesh(box(4.4,2.6,.15), colorMat(0xf1e7d0,{roughness:.9}), 0,1.3,-.9, g);
    const aw=mesh(box(4.8,.06,2.2), new THREE.MeshStandardMaterial({map:W.stripeTex(0xd05f28), roughness:.8, side:THREE.DoubleSide}), 0,2.7,.4, g); aw.rotation.x=.15;
    for(const s of [-1,1]) mesh(new THREE.CylinderGeometry(.05,.05,2.7,8), MAT.dark, s*2.2,1.35,1.4, g);
    for(let i=0;i<3;i++) mesh(new THREE.CylinderGeometry(.22,.18,.28,12), colorMat(0x9aa3ad,{metalness:.8,roughness:.3}), -1.2+i*1.2,1.27,.5, g);
    boxes.push({x0:x-2.3, x1:x+2.3, z0:z-1.1, z1:z+1.5});
    out.spots.kitchen={x, z:z+2.6};
    makeLabel('🍳 Bếp Cơm Khởi Nghiệp', 'Việc phụ bếp (nhận ở Trung tâm Việc làm)', {h:.7, x, y:4, z, fade:70});
  }

  /* ---------- 6. Cổng "Rời đảo" ở đầu cầu ---------- */
  { const gx=CITY.gateX, BW=CITY.downtown.bridgeW, g=new THREE.Group(); g.position.set(gx,0,0); scene.add(g);
    const stone=colorMat(0xe7e3da,{roughness:.6}), accent=colorMat(0x1d6fd8,{roughness:.4});
    for(const s of [-1,1]){ mesh(box(1.1,6.4,1.1), stone, 0,3.2,s*(BW/2+.8), g); mesh(box(1.3,.4,1.3), accent, 0,6.5,s*(BW/2+.8), g); circles.push({x:gx, z:s*(BW/2+.8), r:.8}); }
    mesh(box(1.2,1.5,BW+2.8), stone, 0,6.2,0, g);
    const fit=(c,t,px,wt,max)=>{ let f=px; do{ c.font=`${wt} ${f}px "Segoe UI","Segoe UI Emoji",sans-serif`; f-=2; } while(c.measureText(t).width>max && f>10); };
    const face=(lines, bg, fg)=>canvasTex(1024,180,(c,w,h)=>{ c.fillStyle=bg; c.fillRect(0,0,w,h); c.fillStyle=fg; c.textAlign='center'; c.textBaseline='middle'; fit(c,lines[0],64,800,w-60); c.fillText(lines[0],w/2,64); fit(c,lines[1],36,600,w-60); c.fillText(lines[1],w/2,136); });
    const toOpen=face(['🌆 THẾ GIỚI MỞ ➜','Downtown · Phường Khởi Nghiệp · dịch vụ tính phí · đi làm kiếm tiền'],'#0f2747','#ffffff');
    const toIsland=face(['⬅ 🏝️ ĐẢO MASTER DASHBOARD','Vùng miễn phí: dùng tool, học, quiz, concert'],'#14532d','#ffffff');
    const p1=new THREE.Mesh(new THREE.PlaneGeometry(BW+2.4,1.3), new THREE.MeshStandardMaterial({map:toOpen, emissive:0xffffff, emissiveMap:toOpen, emissiveIntensity:.3})); p1.rotation.y=-Math.PI/2; p1.position.set(-.62,6.2,0); g.add(p1);
    const p2=new THREE.Mesh(new THREE.PlaneGeometry(BW+2.4,1.3), new THREE.MeshStandardMaterial({map:toIsland, emissive:0xffffff, emissiveMap:toIsland, emissiveIntensity:.3})); p2.rotation.y=Math.PI/2; p2.position.set(.62,6.2,0); g.add(p2);
    out.spots.gate={x:gx, z:0};
  }

  /* ---------- 6b. Đảo MD: chỗ chợ/đất cũ → bãi biển công cộng + đất dự trữ cho Sprint 3 ---------- */
  { const at=(a,r)=>({x:Math.cos(a)*r, z:Math.sin(a)*r, rot:Math.atan2(-Math.cos(a), -Math.sin(a))});
    const board=(p, title, sub, color)=>{ const g=new THREE.Group(); g.position.set(p.x, W.groundH(p.x,p.z), p.z); g.rotation.y=p.rot; scene.add(g);
      const t=canvasTex(1024,300,(c,w,h)=>{ c.fillStyle='#f6efe0'; c.fillRect(0,0,w,h); c.fillStyle=color; c.fillRect(0,0,w,26); c.fillStyle='#1b2233'; c.textAlign='center'; c.textBaseline='middle';
        let f=70; do{ c.font=`800 ${f}px "Segoe UI","Segoe UI Emoji",sans-serif`; f-=2; } while(c.measureText(title).width>w-60); c.fillText(title,w/2,120); c.font='600 40px "Segoe UI",sans-serif'; c.fillStyle='#5b6474'; c.fillText(sub,w/2,215); });
      for(const sx of [-1.6,1.6]) mesh(new THREE.CylinderGeometry(.07,.07,2.4,8), MAT.dark, sx,1.2,0, g);
      mesh(box(3.6,1.06,.08), new THREE.MeshStandardMaterial({map:t, roughness:.7}), 0,1.9,.05, g); circles.push({x:p.x, z:p.z, r:.4}); };
    board(at(-.3,55), '🏖️ Bãi biển công cộng', 'Đảo Master Dashboard · miễn phí cho mọi người', '#2ea05a');
    for(const [a,r] of [[-.42,58],[-.18,61],[.22,60],[.48,57],[.82,62],[3.7,62],[4.1,58]]){ const p=at(a,r); palm(p.x, p.z, .85+R()*.25); circles.push({x:p.x, z:p.z, r:.35}); }
    for(const a of [-.22,.24]){ const p=at(a,52); bench(p.x, p.z, p.rot); }   // tránh lối lên cầu (|z| < 6)
  }

  /* ---------- 7. Chỉ báo vùng trên thanh trên cùng + thông báo khi qua cổng ---------- */
  const chip=document.createElement('span'); chip.id='region'; chip.style.cssText='padding:6px 10px;border-radius:10px;font-weight:700;font-size:13px;white-space:nowrap';
  $('top').insertBefore(chip, $('status'));
  let region=null, acc=0;
  const paint=r=>{ chip.textContent = r==='open' ? '🌆 Thế giới mở' : '🏝️ Đảo MD · miễn phí'; chip.style.background = r==='open' ? 'rgba(29,111,216,.35)' : 'rgba(46,160,90,.35)';
    chip.title = r==='open' ? 'Thế giới mở: dịch vụ tính phí (chợ, xe, đất, nhà hàng…). Kiếm tiền ở 🧑‍💼 Trung tâm Việc làm.' : 'Đảo Master Dashboard: mọi tool, học tập, quiz, concert đều miễn phí.'; };
  HOOK.onFrame.push((dt)=>{ acc+=dt; if(acc<.4) return; acc=0; if(W.inside) return; const r=regionAt(P.x,P.z); if(r===region) return;
    const first=region===null; region=r; paint(r); W.region=r;
    if(!first) toast(r==='open' ? '🌆 Bạn đã vào THẾ GIỚI MỞ – chợ, xe, đất, nhà hàng tính phí. Kiếm tiền ở 🧑‍💼 Trung tâm Việc làm (Phường Khởi Nghiệp).' : '🏝️ Về ĐẢO MASTER DASHBOARD – vùng miễn phí: tool, học, quiz, concert.', 4200); });

  /* ---------- 8. Bản đồ ---------- */
  PLACES.push({icon:'🧑‍💼', name:'Trung tâm Việc làm', sub:'Phường Khởi Nghiệp · việc làm kiếm tiền', go:()=>teleport(out.spots.jobCenter.x, out.spots.jobCenter.z+2, out.spots.jobCenter.x, out.spots.jobCenter.z-6)});
  PLACES.push({icon:'🛏️', name:'Nhà trọ khởi nghiệp', sub:'Phòng trọ miễn phí của bạn', go:()=>teleport(out.spots.tro.x, out.spots.tro.z+1.5, out.spots.tro.x, out.spots.tro.z-3)});
  PLACES.push({icon:'🌆', name:'Cổng Rời đảo', sub:'Đầu cầu sang thế giới mở', go:()=>teleport(CITY.gateX-6, 0, CITY.gateX+10, 0)});
  return out;
}
