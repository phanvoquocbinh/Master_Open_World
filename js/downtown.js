// QC World – Downtown: đảo trung tâm thương mại, cầu dây văng, lưới phố, toà công ty cao tầng (8 kiểu), công viên
export function buildDowntown(W, interior){
  const {THREE, scene, mesh, box, MAT, colorMat, CITY, circles, boxes, addPlat, lampPost, makeLabel, makeActor, INTER, PLACES, teleport, MODELS, clipOf, toast, rnd} = W;
  const D=CITY.downtown, DW=D.x1-D.x0, DH=D.z1-D.z0, cx=(D.x0+D.x1)/2, cz=(D.z0+D.z1)/2;
  const towers=[], winMats=[], ledMats=[];
  const doorRingMat=new THREE.MeshBasicMaterial({color:0xffd23f, transparent:true, opacity:.85, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, toneMapped:false});
  const doorDiscMat=new THREE.MeshBasicMaterial({color:0xffe27a, transparent:true, opacity:.22, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, toneMapped:false});
  W.HOOK.onFrame.push((dt,T)=>{ const k=.5+.5*Math.sin(T*3.2); doorRingMat.opacity=.6+.35*k; doorDiscMat.opacity=.12+.16*k; });   // vòng cửa nhấp nháy nhẹ

  /* ---------- texture thủ tục ---------- */
  const canvasTex=(w,h,draw,srgb=true)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); if(srgb) t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=8; return t; };
  const R=Math.random;
  // mỗi ô texture = 4 cột cửa sổ × 4 tầng (6.4m × 14.4m)
  const FACADE={
    glass:{ map:canvasTex(256,256,(g)=>{ for(let r=0;r<4;r++) for(let c=0;c<4;c++){ const v=40+R()*30|0; const gr=g.createLinearGradient(c*64,r*64,c*64+64,r*64+64); gr.addColorStop(0,`rgb(${v-10},${v+25},${v+60})`); gr.addColorStop(1,`rgb(${v-25},${v},${v+35})`); g.fillStyle=gr; g.fillRect(c*64,r*64,64,64); }
        g.fillStyle='#b9c3cc'; for(let i=0;i<=4;i++){ g.fillRect(i*64-2,0,4,256); g.fillRect(0,i*64-3,256,6); } }), rough:.12, metal:.55 },
    concrete:{ map:canvasTex(256,256,(g)=>{ g.fillStyle='#d9d3c7'; g.fillRect(0,0,256,256); for(let i=0;i<900;i++){ g.fillStyle=`rgba(0,0,0,${R()*.05})`; g.fillRect(R()*256,R()*256,3,3); }
        for(let r=0;r<4;r++) for(let c=0;c<4;c++){ g.fillStyle='#2a3440'; g.fillRect(c*64+10,r*64+12,44,40); g.fillStyle='rgba(255,255,255,.15)'; g.fillRect(c*64+10,r*64+12,44,6); g.fillStyle='#bcb5a8'; g.fillRect(c*64+6,r*64+52,52,5); } }), rough:.8, metal:0 },
    brick:{ map:canvasTex(256,256,(g)=>{ g.fillStyle='#8f3f2c'; g.fillRect(0,0,256,256); for(let y=0;y<256;y+=8){ for(let x=(y/8%2)*8;x<256;x+=16){ const v=120+R()*40|0; g.fillStyle=`rgb(${v},${v*.45|0},${v*.33|0})`; g.fillRect(x+1,y+1,14,6); } }
        for(let r=0;r<4;r++) for(let c=0;c<4;c++){ g.fillStyle='#e9e2d4'; g.fillRect(c*64+14,r*64+10,36,46); g.fillStyle='#24303c'; g.fillRect(c*64+17,r*64+13,30,40); g.fillStyle='#e9e2d4'; g.fillRect(c*64+31,r*64+13,2,40); } }), rough:.85, metal:0 },
    dark:{ map:canvasTex(256,256,(g)=>{ g.fillStyle='#14181f'; g.fillRect(0,0,256,256); for(let r=0;r<4;r++) for(let c=0;c<4;c++){ const v=30+R()*20|0; g.fillStyle=`rgb(${v},${v+8},${v+18})`; g.fillRect(c*64+4,r*64+6,56,50); } g.fillStyle='#3a414c'; for(let i=0;i<=4;i++) g.fillRect(0,i*64-2,256,4); }), rough:.2, metal:.6 },
  };
  // cửa sổ sáng đèn ban đêm: vài biến thể ngẫu nhiên
  const litTex=[0,1,2,3].map(()=>canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h);
    for(let r=0;r<4;r++) for(let c=0;c<4;c++){ if(R()<.42){ const warm=R()<.7; g.fillStyle=warm?`rgb(255,${200+R()*40|0},${130+R()*50|0})`:`rgb(${190+R()*40|0},${220+R()*30|0},255)`; const blind=R()*20; g.fillRect(c*64+8,r*64+10+blind,48,42-blind); } } }));
  function facadeMat(style, wpx, hpx, lit=true){
    const F=FACADE[style], m=F.map.clone(); m.repeat.set(Math.max(1,Math.round(wpx/6.4)), Math.max(1,Math.round(hpx/14.4))); m.needsUpdate=true;
    const mat=new THREE.MeshStandardMaterial({map:m, roughness:F.rough, metalness:F.metal, envMapIntensity:1.2});
    if(lit){ const e=litTex[Math.floor(R()*litTex.length)].clone(); e.repeat.copy(m.repeat); e.needsUpdate=true; mat.emissiveMap=e; mat.emissive=new THREE.Color(0xffffff); mat.emissiveIntensity=.12; winMats.push(mat); }
    return mat; }
  const roofMat=colorMat(0x5b6068,{roughness:.8});
  const trim=new THREE.MeshStandardMaterial({color:0xd8dde3, metalness:.6, roughness:.3});
  const led=(c,k=3)=>{ const m=new THREE.MeshStandardMaterial({color:c, emissive:c, emissiveIntensity:k*.3}); ledMats.push([m,k]); return m; };
  const boxMats=(side)=>[side,side,roofMat,roofMat,side,side];

  /* ---------- 1. Nền đảo + kè đá ---------- */
  const pave=canvasTex(512,512,(g)=>{ g.fillStyle='#b9b4aa'; g.fillRect(0,0,512,512); for(let y=0;y<512;y+=64) for(let x=0;x<512;x+=64){ const v=170+R()*25|0; g.fillStyle=`rgb(${v},${v-4},${v-12})`; g.fillRect(x+2,y+2,60,60); } for(let i=0;i<3000;i++){ g.fillStyle=`rgba(0,0,0,${R()*.06})`; g.fillRect(R()*512,R()*512,2,2); } });
  pave.repeat.set(DW/8, DH/8);
  const slab=mesh(new THREE.BoxGeometry(DW+4, 8, DH+4), [MAT.stone,MAT.stone,new THREE.MeshStandardMaterial({map:pave, roughness:.85}),MAT.stone,MAT.stone,MAT.stone], cx, -4+.02, cz); slab.castShadow=false;
  for(const [x0,z0,x1,z1] of [[D.x0-1,D.z0-1,D.x1+1,D.z0-1],[D.x1+1,D.z0-1,D.x1+1,D.z1+1],[D.x0-1,D.z0-1,D.x0-1,-6],[D.x0-1,6,D.x0-1,D.z1+1]]){   // bờ Nam để trống: nối liền Phường Khởi Nghiệp
    const len=Math.hypot(x1-x0,z1-z0), r=mesh(box(.08,.08,len), MAT.metal, (x0+x1)/2, 1.0, (z0+z1)/2); r.rotation.y=Math.atan2(x1-x0,z1-z0); }

  /* ---------- 2. Đường phố ---------- */
  const asphalt=(dashed)=>canvasTex(256,512,(g,w,h)=>{ g.fillStyle='#34363a'; g.fillRect(0,0,w,h); for(let i=0;i<5000;i++){ const v=30+R()*40|0; g.fillStyle=`rgba(${v},${v},${v+4},.6)`; g.fillRect(R()*w,R()*h,1.5,1.5); }
    g.fillStyle='#e9e6dc'; g.fillRect(10,0,6,h); g.fillRect(w-16,0,6,h); if(dashed){ g.fillStyle='#e8b923'; for(let y=0;y<h;y+=128) g.fillRect(w/2-4,y,8,70); } });
  const AS=asphalt(true);
  const SX=[178,220], SZ=[-36,0,36], SWD=10;
  // Toàn bộ mặt đất Downtown vẽ trên MỘT texture: vỉa hè lát gạch, đường nhựa, ngã tư sạch, vạch giữa/mép/dừng, vạch qua đường đúng chỗ
  {
    const PX=W.QUAL==='low'?2048:3072, ppm=PX/Math.max(DW,DH), TW=Math.round(DW*ppm), TH=Math.round(DH*ppm);
    const X=x=>(x-D.x0)*ppm, Y=z=>(z-D.z0)*ppm;
    const tex=canvasTex(TW,TH,(g)=>{
      // vỉa hè: gạch 0.5m
      g.fillStyle='#bdb8ad'; g.fillRect(0,0,TW,TH);
      const t=.5*ppm; for(let y=0;y<TH;y+=t) for(let x=(Math.floor(y/t)%2)*t/2;x<TW;x+=t){ const v=178+R()*20|0; g.fillStyle=`rgb(${v},${v-4},${v-12})`; g.fillRect(x+1,y+1,t-2,t-2); }
      // mặt đường
      const road=(x0,z0,x1,z1)=>{ g.fillStyle='#34363b'; g.fillRect(X(x0),Y(z0),X(x1)-X(x0),Y(z1)-Y(z0)); };
      for(const z of SZ) road(D.x0, z-SWD/2, D.x1, z+SWD/2);
      for(const x of SX) road(x-SWD/2, D.z0, x+SWD/2, D.z1);
      const inRoad=(x,z)=>SZ.some(s=>Math.abs(z-s)<SWD/2)||SX.some(s=>Math.abs(x-s)<SWD/2);
      g.globalAlpha=.35; for(let i=0;i<50000;i++){ const x=D.x0+R()*DW, z=D.z0+R()*DH; if(!inRoad(x,z)) continue; const v=40+R()*40|0; g.fillStyle=`rgb(${v},${v},${v+4})`; g.fillRect(X(x),Y(z),2,2); } g.globalAlpha=1;
      // đoạn đường giữa 2 ngã tư (theo trục x và z)
      const lineW=.15*ppm, yellow='#e8b923', white='#ecebe4';
      const segX=(z)=>{ const cuts=[D.x0, ...SX.flatMap(x=>[x-SWD/2, x+SWD/2]), D.x1]; const out=[]; for(let i=0;i<cuts.length;i+=2) out.push([cuts[i],cuts[i+1]]); return out; };
      const segZ=(x)=>{ const cuts=[D.z0, ...SZ.flatMap(z=>[z-SWD/2, z+SWD/2]), D.z1]; const out=[]; for(let i=0;i<cuts.length;i+=2) out.push([cuts[i],cuts[i+1]]); return out; };
      for(const z of SZ) for(const [a,b] of segX(z)){ const a2=a+(a===D.x0?0:4), b2=b-(b===D.x1?0:4);
        g.fillStyle=white; g.fillRect(X(a2),Y(z-SWD/2+.35),X(b2)-X(a2),lineW); g.fillRect(X(a2),Y(z+SWD/2-.35)-lineW,X(b2)-X(a2),lineW);
        g.fillStyle=yellow; if(z===0){ g.fillRect(X(a2),Y(z)-lineW*1.6,X(b2)-X(a2),lineW); g.fillRect(X(a2),Y(z)+lineW*.6,X(b2)-X(a2),lineW); } else for(let x=a2;x<b2-1.5;x+=4.5) g.fillRect(X(x),Y(z)-lineW/2,2.6*ppm,lineW);
        g.fillStyle=white; if(a!==D.x0) g.fillRect(X(a2-.4),Y(z-SWD/2+.4),.4*ppm,(SWD/2-.4)*ppm); if(b!==D.x1) g.fillRect(X(b2),Y(z),.4*ppm,(SWD/2-.4)*ppm); }   // vạch dừng đúng làn xe tới (đi bên phải)
      for(const x of SX) for(const [a,b] of segZ(x)){ const a2=a+(a===D.z0?0:4), b2=b-(b===D.z1?0:4);
        g.fillStyle=white; g.fillRect(X(x-SWD/2+.35),Y(a2),lineW,Y(b2)-Y(a2)); g.fillRect(X(x+SWD/2-.35)-lineW,Y(a2),lineW,Y(b2)-Y(a2));
        g.fillStyle=yellow; for(let z=a2;z<b2-1.5;z+=4.5) g.fillRect(X(x)-lineW/2,Y(z),lineW,2.6*ppm);
        g.fillStyle=white; if(a!==D.z0) g.fillRect(X(x),Y(a2-.4),(SWD/2-.4)*ppm,.4*ppm); if(b!==D.z1) g.fillRect(X(x-SWD/2+.4),Y(b2),(SWD/2-.4)*ppm,.4*ppm); }
      // vạch qua đường (zebra) ở 4 phía mỗi ngã tư, nằm giữa vạch dừng và ngã tư
      g.fillStyle=white;
      for(const x of SX) for(const z of SZ){
        for(const s of [-1,1]){ const zz=z+s*(SWD/2+2); for(let k=-SWD/2+.6;k<SWD/2-.6;k+=.9) g.fillRect(X(x+k),Y(zz-1.3),.5*ppm,2.6*ppm);
          const xx=x+s*(SWD/2+2); for(let k=-SWD/2+.6;k<SWD/2-.6;k+=.9) g.fillRect(X(xx-1.3),Y(z+k),2.6*ppm,.5*ppm); } }
      // vạch qua đường ở cuối đại lộ (đầu cầu)
      for(let k=-SWD/2+.6;k<SWD/2-.6;k+=.9) g.fillRect(X(D.x0+3-1.3),Y(k),2.6*ppm,.5*ppm);
    });
    tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping; tex.anisotropy=16;
    const gm=new THREE.MeshStandardMaterial({map:tex, roughness:.88});
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(DW,DH), gm); ground.rotation.x=-Math.PI/2; ground.position.set(cx,.03,cz); ground.receiveShadow=true; scene.add(ground);
    // bó vỉa nổi dọc mép đường (để phố có chiều sâu thật)
    const curbM=colorMat(0xd7d3ca,{roughness:.8});
    for(const z of SZ) for(const s of [-1,1]){ const zz=z+s*(SWD/2+.12); let a=D.x0; for(const x of [...SX, D.x1+SWD/2]){ const b=x-SWD/2; if(b-a>1){ const c=mesh(box(b-a,.14,.24), curbM, (a+b)/2,.07,zz); c.castShadow=false; } a=x+SWD/2; } }
    for(const x of SX) for(const s of [-1,1]){ const xx=x+s*(SWD/2+.12); let a=D.z0; for(const z of [...SZ, D.z1+SWD/2]){ const b=z-SWD/2; if(b-a>1){ const c=mesh(box(.24,.14,b-a), curbM, xx,.07,(a+b)/2); c.castShadow=false; } a=z+SWD/2; } }
  }

  /* ---------- 3. Cầu dây văng nối đảo chính ---------- */
  {
    const X0=46.5, X1=D.x0+1, len=X1-X0, mid=(X0+X1)/2, BW=D.bridgeW;
    const deckTex=AS.clone(); deckTex.repeat.set(1,len/20); deckTex.needsUpdate=true;
    const deck=mesh(box(BW,.3,len), [MAT.stone,MAT.stone,new THREE.MeshStandardMaterial({map:deckTex, roughness:.9}),MAT.stone,MAT.stone,MAT.stone], mid, 0, 0); deck.rotation.y=Math.PI/2;
    addPlat(mid, 0, Math.PI/2, BW/2, len/2, .15);
    // lan can thật: trụ đứng mỗi 2m + 2 thanh ngang (nhìn xuyên qua được)
    const rail=new THREE.MeshStandardMaterial({color:0xcfd5db, metalness:.85, roughness:.3});
    for(const s of [-1,1]){ const z=s*(BW/2-.1); mesh(box(len,.07,.07), rail, mid,1.05,z).castShadow=false; mesh(box(len,.04,.04), rail, mid,.6,z).castShadow=false;
      for(let x=X0+1;x<X1;x+=2){ const p=mesh(new THREE.CylinderGeometry(.03,.03,.95,6), rail, x,.6,z); p.castShadow=false; } }
    boxes.push({x0:X0+2, x1:X1, z0:BW/2-.35, z1:BW/2+.3}); boxes.push({x0:X0+2, x1:X1, z0:-BW/2-.3, z1:-BW/2+.35});
    for(let x=74;x<X1;x+=8) for(const s of [-1,1]) mesh(new THREE.CylinderGeometry(.5,.6,6,12), MAT.stone, x,-3,s*3);
    // trụ tháp + dây văng
    const PX=104, PH=26;
    for(const s of [-1,1]) mesh(box(1.4,PH,1.4), new THREE.MeshStandardMaterial({color:0xe7e9ec, roughness:.4, metalness:.2}), PX, PH/2-1, s*(BW/2+.9));
    mesh(box(1.2,1.2,BW+3.2), new THREE.MeshStandardMaterial({color:0xe7e9ec, roughness:.4}), PX, PH-3, 0);
    const cableM=new THREE.MeshStandardMaterial({color:0xcfd5db, metalness:.8, roughness:.3});
    for(const s of [-1,1]) for(let k=1;k<=6;k++) for(const dir of [-1,1]){ const ax=PX, ay=PH-2-k*.9, az=s*(BW/2+.9), bx=PX+dir*k*4.2, by=.8, bz=s*(BW/2-.1);
      const L=Math.hypot(bx-ax,by-ay,bz-az), c=mesh(new THREE.CylinderGeometry(.04,.04,L,5), cableM, (ax+bx)/2,(ay+by)/2,(az+bz)/2); c.castShadow=false;
      c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(bx-ax,by-ay,bz-az).normalize()); }
    for(let x=60;x<X1;x+=16) for(const s of [-1,1]) lampPost(x, s*(BW/2-.6));
    makeLabel('🏙️ Downtown · QC City', 'Khu công ty cao tầng – vào được bên trong', {h:1.1, x:D.x0+4, y:9, z:0, fade:160});
  }

  /* ---------- 4. Toà nhà ---------- */
  const TEAMS={qa:['Phòng QA Manual','Phòng QA Automation'], dev:['Phòng Dev Backend','Phòng Dev Frontend'], perf:['Phòng Performance','Phòng SRE'], sec:['Phòng Pentest','Phòng SOC'], data:['Phòng Data QA','Phòng BI'], mobile:['Phòng Mobile QA','Lab thiết bị']};
  const DEFS=[
    {name:'Bình Phan Tech Hub', short:'BP Tech', style:'hq',       x:154.5, z:-18,  w:22, d:18, h:96,  face:1,  teams:['qa','dev'], color:0x46d39a},
    {name:'AutoQA Labs',         short:'AutoQA',   style:'twist',    x:199,   z:-18,  w:16, d:16, h:84,  face:1,  teams:['qa','dev'], color:0x4fc3ff},
    {name:'PerfMax Performance', short:'PerfMax',  style:'cylinder', x:243.5, z:-18,  w:18, d:18, h:70,  face:1,  teams:['perf'],     color:0xc77dff},
    {name:'BugBusters Inc.',     short:'BugBusters',style:'setback', x:154.5, z:18,   w:24, d:18, h:72,  face:-1, teams:['qa'],       color:0xff5a6e},
    {name:'API Hub Tower',       short:'API Hub',  style:'spire',    x:199,   z:18,   w:17, d:17, h:108, face:-1, teams:['dev','qa'], color:0xffd23f},
    {name:'DataCheck Corp',      short:'DataCheck',style:'glass',    x:243.5, z:18,   w:20, d:16, h:60,  face:-1, teams:['data'],     color:0x4fc3ff},
    {name:'Manual Test Studio',  short:'MTS',      style:'brick',    x:146,   z:-51.5,w:16, d:14, h:28,  face:1,  teams:['qa'],       color:0xffb547},
    {name:'SecureQA',            short:'SecureQA', style:'dark',     x:165,   z:-51.5,w:12, d:12, h:46,  face:1,  teams:['sec'],      color:0xff3b30, locked:true},
    {name:'QA Federation',       short:'QA Fed',   style:'artdeco',  x:199,   z:-51.5,w:18, d:14, h:88,  face:1,  teams:['qa','data'],color:0xffc44d},
    {name:'Mobile First QA',     short:'MobileFirst',style:'brick',  x:243.5, z:-51.5,w:22, d:14, h:34,  face:1,  teams:['mobile'],   color:0x46d39a},
    {name:'Cloud Test Co.',      short:'CloudTest',style:'setback', x:154.5, z:51.5, w:20, d:14, h:50,  face:-1, teams:['perf','dev'],color:0x7aa2ff},
    {name:'DevOps Center',       short:'DevOps',   style:'dark',     x:235,   z:51.5, w:13, d:12, h:40,  face:-1, teams:['dev'],      color:0x46d39a, locked:true},
    {name:'Contract Testing Ltd',short:'Contract', style:'cylinder', x:254,   z:51.5, w:10, d:10, h:44,  face:-1, teams:['qa'],       color:0xff8fc2},
  ];
  function sign(text, color){ return canvasTex(1024,192,(g,w,h)=>{ g.fillStyle='#0e131b'; g.fillRect(0,0,w,h); g.fillStyle='#'+color.toString(16).padStart(6,'0'); g.fillRect(0,h-14,w,14);
    g.fillStyle='#fff'; g.font='800 88px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; let fs=88; while(g.measureText(text).width>w-60){ fs-=6; g.font=`800 ${fs}px "Segoe UI",sans-serif`; } g.fillText(text,w/2,h/2-4); }); }
  function build(t){
    const g=new THREE.Group(); g.position.set(t.x,0,t.z); scene.add(g); const {w,d,h}=t;
    const glassy=['hq','twist','spire','glass','cylinder'].includes(t.style);
    const podium=Math.min(6, h*.12);
    // khối đế (sảnh)
    mesh(box(w+1.2,podium,d+1.2), boxMats(facadeMat('dark', w, podium, false)), 0,podium/2,0, g);
    mesh(box(w+1.6,.4,d+1.6), trim, 0,podium+.2,0, g);
    const body=h-podium, y0=podium+.4;
    switch(t.style){
      case 'glass': case 'dark': case 'brick': case 'hq': {
        const st=t.style==='hq'?'glass':t.style; mesh(box(w,body,d), boxMats(facadeMat(st, w, body)), 0,y0+body/2,0, g);
        if(t.style!=='brick'){ for(const sx of [-1,1]) for(const sz of [-1,1]) mesh(box(.5,body,.5), trim, sx*w/2,y0+body/2,sz*d/2, g); }
        if(t.style==='hq'){ mesh(box(w*.7,6,d*.7), boxMats(facadeMat('dark',w*.7,6)), 0,h+3.4,0, g); const hp=mesh(new THREE.CylinderGeometry(w*.3,w*.3,.3,32), roofMat, 0,h+6.6,0, g); mesh(new THREE.TorusGeometry(w*.24,.15,6,40), led(0xffd23f), 0,h+6.8,0, g).rotation.x=Math.PI/2; }
        if(t.style==='brick'){ mesh(box(w+.6,.8,d+.6), colorMat(0xe9e2d4), 0,h+.4,0, g); for(let i=0;i<3;i++) mesh(box(2,1.5,2), colorMat(0x8a8f99), -w/3+i*w/3,h+1.4,-d/4, g); }
        else mesh(new THREE.CylinderGeometry(.15,.25,10,6), MAT.metal, w*.25,h+5,0, g);
        break; }
      case 'setback': { let cw=w, cd=d, y=y0; const tiers=[.45,.33,.22];
        for(const k of tiers){ const th=body*k; mesh(box(cw,th,cd), boxMats(facadeMat('concrete', cw, th)), 0,y+th/2,0, g); mesh(box(cw+.4,.5,cd+.4), led(t.color,2), 0,y+th,0, g); y+=th; cw*=.78; cd*=.78; }
        mesh(new THREE.CylinderGeometry(.2,.3,12,6), MAT.metal, 0,y+6,0, g); break; }
      case 'twist': { const fl=Math.round(body/3.6), m=facadeMat('glass', w, 3.6); m.map.repeat.y=.25; m.emissiveMap.repeat.y=.25;
        for(let i=0;i<fl;i++){ const s=mesh(box(w,3.5,d), boxMats(m), 0,y0+i*3.6+1.75,0, g); s.rotation.y=i/fl*Math.PI/2; s.castShadow=i%3===0; }
        mesh(box(w*.9,1,d*.9), led(t.color,3), 0,h+.6,0, g).rotation.y=Math.PI/2; break; }
      case 'cylinder': { const r=w/2, m=facadeMat('glass', Math.PI*w, body); mesh(new THREE.CylinderGeometry(r,r,body,40,1), [m,roofMat,roofMat], 0,y0+body/2,0, g);
        const pts=[]; for(let i=0;i<=240;i++){ const a=i/240*Math.PI*8, yy=y0+i/240*body; pts.push(new THREE.Vector3(Math.cos(a)*(r+.15), yy, Math.sin(a)*(r+.15))); }
        mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),480,.12,6,false), led(t.color,4), 0,0,0, g).castShadow=false;
        mesh(new THREE.TorusGeometry(r+.2,.2,8,48), led(t.color,3), 0,h,0, g).rotation.x=Math.PI/2; break; }
      case 'spire': { const m=facadeMat('glass', w*2.8, body); const c=mesh(new THREE.CylinderGeometry(w*.12,w*.72,body,4,1), [m,roofMat,roofMat], 0,y0+body/2,0, g); c.rotation.y=Math.PI/4;
        mesh(new THREE.CylinderGeometry(.08,.3,14,6), MAT.metal, 0,h+7,0, g); mesh(new THREE.SphereGeometry(.4,10,8), led(0xff2233,6), 0,h+14,0, g); break; }
      case 'artdeco': { let y=y0; const parts=[[1,.5],[.8,.25],[.6,.15]]; for(const [k,f] of parts){ const th=body*f, cw=w*k, cd=d*k; mesh(box(cw,th,cd), boxMats(facadeMat('concrete',cw,th)), 0,y+th/2,0, g); y+=th; }
        for(let i=0;i<3;i++){ const s=w*(.45-i*.1); mesh(box(s,2.4,s), led(0xffc44d,2+i), 0,y+1.2+i*2.4,0, g); }
        mesh(new THREE.CylinderGeometry(.1,.5,16,8), trim, 0,y+7.2+8,0, g); break; }
    }
    // lối vào
    const fz=t.face*(d/2+.6), door={x:t.x, z:t.z+t.face*(d/2+2.3), face:t.face>0?0:Math.PI};
    const ent=new THREE.Group(); ent.position.set(0,0,fz); if(t.face<0) ent.rotation.y=Math.PI; g.add(ent);
    mesh(box(5,3.2,.12), MAT.glass, 0,1.6,.05, ent);
    mesh(box(6.4,.25,3), trim, 0,3.6,1.4, ent);
    mesh(box(.12,3.5,.12), MAT.metal, -3,1.75,2.8, ent); mesh(box(.12,3.5,.12), MAT.metal, 3,1.75,2.8, ent);
    const sg=mesh(box(8,1.3,.15), new THREE.MeshStandardMaterial({map:sign(t.name,t.color), emissive:0xffffff, emissiveMap:null, roughness:.4}), 0,podium-.9,.12, ent);
    sg.material.emissiveMap=sg.material.map; sg.material.emissiveIntensity=.35; ledMats.push([sg.material,1.2]);
    boxes.push({x0:t.x-w/2-.8, x1:t.x+w/2+.8, z0:t.z-d/2-.8, z1:t.z+d/2+.8});
    t.door=door; t.g=g;
    // vòng sáng dưới đất trước cửa: đứng vào đây bấm E để vào toà
    { const y=(W.groundAt?W.groundAt(door.x,door.z):0)+.05;
      const rg=new THREE.Mesh(new THREE.RingGeometry(1.0,1.25,48), doorRingMat); rg.rotation.x=-Math.PI/2; rg.position.set(door.x,y,door.z); rg.renderOrder=2; rg.castShadow=rg.receiveShadow=false; W.scene.add(rg);
      const dc=new THREE.Mesh(new THREE.CircleGeometry(1.0,40), doorDiscMat); dc.rotation.x=-Math.PI/2; dc.position.set(door.x,y-.01,door.z); dc.renderOrder=2; dc.castShadow=dc.receiveShadow=false; W.scene.add(dc); }
    makeLabel(`${t.locked?'🔒':'🏢'} ${t.name}`, t.locked?'Bảo vệ canh cửa · chỉ nhân viên (xin việc ở Trung tâm Việc làm)':`${Math.round(h/3.6)} tầng · bấm E để vào`, {h:.75, x:door.x, y:6.2, z:door.z, fade:70});
    if(t.locked){ const gd=makeActor(MODELS.soldier, {name:'Bảo vệ '+['Tâm','Phúc','Kiên'][towers.length%3], height:1.78, face:Math.PI, dot:'#9fb3c8', clips:{idle:clipOf(MODELS.soldier,'Idle')}});
      gd.g.position.set(door.x+2.4, .02, door.z-t.face*.6); gd.g.rotation.y=t.face>0?0:Math.PI; gd.play('idle',0); (W.downtownActors ||= []).push(gd); circles.push({x:door.x+2.4, z:door.z-t.face*.6, r:.4}); }
    INTER.push({x:door.x, z:door.z, r:2, get label(){ const emp=W.work && W.work.isEmployee(t); return emp ? `💳 Đi làm ở ${t.name} (E)` : t.locked ? `🔒 ${t.name}: vào sảnh phỏng vấn (E)` : `🏢 Vào ${t.name} (E)`; },
      action:()=>{ const emp=W.work && W.work.isEmployee(t);
        if(t.locked && !emp) toast('👮 Bảo vệ: "Toà bảo mật – khách chỉ ở sảnh. Bạn đến phỏng vấn? Phòng phỏng vấn ở bên phải sảnh nhé!"', 4200);
        else if(emp) toast('👮 Bảo vệ: "Chào đồng nghiệp! Nhớ quẹt thẻ ở cổng nhé."', 2400);
        interior.enter(t); }});
    towers.push(t);
  }
  DEFS.forEach(build);

  /* ---------- 5. Công viên trung tâm + cây xanh + đèn đường ---------- */
  // S19: Công viên Trung tâm (hồ nước, cầu gỗ, sân chơi, thể dục, máy bán nước…) và cây xanh / chậu hoa vỉa hè (InstancedMesh, có va chạm)
  // dựng trong js/park.js (life.js nạp trước khi gộp mesh tĩnh). Ở đây chỉ còn đèn đường; chừa nguyên lô công viên x 183–215 · z 41–63.
  const PARKLOT={x0:182, x1:216, z0:40.5, z1:63};
  const inParkLot=(x,z)=>x>PARKLOT.x0 && x<PARKLOT.x1 && z>PARKLOT.z0 && z<PARKLOT.z1;
  const nearDoor=(x,z)=>towers.some(t=>t.door && Math.abs(x-t.door.x)<4.6 && Math.abs(z-t.door.z)<5);   // không dựng đèn chắn lối vào toà
  for(let x=D.x0+6;x<D.x1;x+=18) for(const z of SZ) for(const s of [-1,1]){ if(SX.some(sx=>Math.abs(sx-x)<7) || nearDoor(x+3, z+s*5.8) || inParkLot(x+3, z+s*5.8)) continue; lampPost(x+3, z+s*5.8); }
  for(const x of SX) for(let z=D.z0+8;z<D.z1;z+=18) for(const s of [-1,1]){ if(SZ.some(sz=>Math.abs(sz-z)<7) || nearDoor(x+s*5.8, z)) continue; lampPost(x+s*5.8, z); }

  /* ---------- 6. Bản đồ + đêm ---------- */
  PLACES.push({icon:'🏙️', name:'Downtown · QC City', sub:'Khu công ty cao tầng (đi qua cầu phía Đông)', go:()=>teleport(D.x0+6, 0, D.x0+30, 0)});
  for(const t of towers.filter(t=>!t.locked)) PLACES.push({icon:'🏢', name:t.name, sub:`Toà ${Math.round(t.h/3.6)} tầng · Downtown`, go:()=>teleport(t.door.x, t.door.z+(t.face>0?1.5:-1.5), t.x, t.z)});
  let lastN=-1;
  W.HOOK.onFrame.push(()=>{ if(W.night===lastN) return; lastN=W.night; const k=.1+W.night*.95; for(const m of winMats) m.emissiveIntensity=k; for(const [m,b] of ledMats) m.emissiveIntensity=b*(.35+W.night*.8); });
  return {towers};
}
