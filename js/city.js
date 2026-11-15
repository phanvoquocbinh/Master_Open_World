// QC World – thành phố: đường vành đai, tháp Brand QA, Học viện, chợ, showroom, địa chính, bến cảng, bồn hoa, ghế, lô đất
export function buildCity(W){
  const {THREE, scene, mesh, box, MAT, colorMat, CITY, ROAD, groundH, circles, boxes, addPlat, lampPost, makeLabel, rnd,
         buildHouse, boardwalk, WATER_Y, ZONES} = W;
  const C = {beds:[], benches:[], kiosks:[], spots:{}};

  /* ---------- tiện ích ---------- */
  const fwdOf = rot => [Math.sin(rot), Math.cos(rot)];
  function ring(x, z, color, y=.16){
    const m=new THREE.Mesh(new THREE.RingGeometry(.85,1.05,48), new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(2.2), transparent:true, opacity:.8, side:THREE.DoubleSide, depthWrite:false}));
    m.rotation.x=-Math.PI/2; m.position.set(x, groundH(x,z)+y, z); scene.add(m); (C.rings ||= []).push(m); return m;
  }
  function canvasTex(w, h, draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'), w, h);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; }
  // Nhà dùng chung mẫu nhà của khu công cụ
  function house(place, icon, name, sub, color){
    const z={kind:'house', icon, name, color}; const g=new THREE.Group(); g.position.set(place.x, groundH(place.x,place.z), place.z); g.rotation.y=place.rot; scene.add(g);
    const d=buildHouse(z, g), f=fwdOf(place.rot);
    addPlat(place.x+f[0]*d.deckZ, place.z+f[1]*d.deckZ, place.rot, d.deckHW, d.deckHD, .22);
    circles.push({x:place.x, z:place.z, r:3.25});
    const tz=d.deckZ+d.deckHD+1.2, tx=place.x+f[0]*tz, tzz=place.z+f[1]*tz;
    ring(tx, tzz, color);
    makeLabel(`${icon} ${name}`, sub, {h:.85, x:place.x, z:place.z, y:7.6, fade:90});
    (C.signs ||= []).push(z);
    return {g, z, tx, tz:tzz, f, place};
  }

  /* ---------- 1. Đường vành đai (nhựa đường + vạch kẻ) ---------- */
  {
    const tex=canvasTex(512,256,(g,w,h)=>{
      g.fillStyle='#38393c'; g.fillRect(0,0,w,h);
      for(let i=0;i<9000;i++){ const v=34+Math.random()*44|0; g.fillStyle=`rgba(${v},${v},${v+4},.55)`; g.fillRect(Math.random()*w, Math.random()*h, 1.6, 1.6); }
      for(let i=0;i<14;i++){ g.strokeStyle=`rgba(20,20,22,${.15+Math.random()*.2})`; g.lineWidth=1; g.beginPath(); let x=Math.random()*w, y=Math.random()*h; g.moveTo(x,y); for(let k=0;k<6;k++){ x+=Math.random()*30-15; y+=Math.random()*20-10; g.lineTo(x,y); } g.stroke(); }
      g.fillStyle='#e9e6dc'; g.fillRect(0,12,w,7); g.fillRect(0,h-19,w,7);
      g.fillStyle='#e8b923'; for(let x=0;x<w;x+=128) g.fillRect(x,h/2-5,74,10);
    });
    tex.wrapS=THREE.RepeatWrapping;
    const N=420, r0=ROAD.r-ROAD.w/2, r1=ROAD.r+ROAD.w/2, pos=[], uv=[], idx=[], rep=Math.round(2*Math.PI*ROAD.r/12);
    // S-GFX (15/11): mặt đường PHẲNG ở .12 m (cao hơn đỉnh gợn cát ~.075) + sàn đứng vòng cùng cao độ → bánh xe/chân người đặt đúng mặt nhựa.
    // Trước: mặt đường vẽ = địa hình + .07 nhưng xe/người đứng theo địa hình → bánh xe lún 7–15 cm dưới mặt đường.
    const RY=.12; W.plats.push({t:'ring', x:0, z:0, r0, r1, h:RY});
    for(let i=0;i<=N;i++){ const a=i/N*Math.PI*2; for(const [k,r] of [[0,r0],[1,r1]]){ const x=Math.cos(a)*r, z=Math.sin(a)*r; pos.push(x, RY, z); uv.push(i/N*rep, k); } }
    for(let i=0;i<N;i++){ const a=i*2; idx.push(a,a+1,a+2, a+1,a+3,a+2); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); geo.setIndex(idx); geo.computeVertexNormals();
    if(geo.attributes.normal.getY(0)<0){ idx.reverse(); geo.setIndex(idx); geo.computeVertexNormals(); }
    const road=new THREE.Mesh(geo, new THREE.MeshStandardMaterial({map:tex, roughness:.92, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2}));
    road.receiveShadow=true; scene.add(road); C.road=road;
    // vỉa hè + đèn đường
    for(const r of [r0-.25, r1+.25]){ const g=new THREE.TorusGeometry(r,.16,6,240); g.rotateX(Math.PI/2); const m=new THREE.Mesh(g, MAT.stone); m.position.y=.08; m.receiveShadow=true; scene.add(m); }
    for(let i=0;i<30;i++){ const a=i/30*Math.PI*2+.05; if(Math.abs(((a+Math.PI/2)%(Math.PI*2)))<.08) continue; if(Math.cos(a)>0 && Math.abs(Math.sin(a)*(r1+1.1))<7.5) continue;   /* S-QA: không dựng đèn giữa đường đầu cầu sang Downtown */ lampPost(Math.cos(a)*(r1+1.1), Math.sin(a)*(r1+1.1)); }
  }

  /* ---------- 2. Tháp Brand QA·QC·QE ---------- */
  {
    const p=CITY.places.tower, g=new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y=p.rot; scene.add(g);
    const glass=new THREE.MeshPhysicalMaterial({color:0x1d3f63, metalness:.55, roughness:.06, envMapIntensity:1.25, clearcoat:1, clearcoatRoughness:.05});
    const frame=new THREE.MeshStandardMaterial({color:0xe8ecf1, metalness:.6, roughness:.3});
    mesh(box(24,.6,20), MAT.stone, 0,.3,0, g);
    mesh(box(16,6,12), glass, 0,3.6,0, g);
    mesh(box(16.4,.4,12.4), frame, 0,6.7,0, g);
    for(const sx of [-1,1]) for(const sz of [-1,1]) mesh(box(.5,6,.5), frame, sx*8,3.6,sz*6, g);
    const H=40, y0=6.9;
    mesh(box(11,H,9), glass, 0,y0+H/2,0, g);
    for(let y=y0+3.6;y<y0+H;y+=3.6) mesh(box(11.25,.22,9.25), frame, 0,y,0, g);
    for(const sx of [-1,-.33,.33,1]) for(const sz of [-1,1]) mesh(box(.3,H,.3), frame, sx*5.5,y0+H/2,sz*4.5, g);
    mesh(box(12,3.4,10), frame, 0,y0+H+1.7,0, g);
    const logo=canvasTex(1024,256,(c,w,h)=>{ c.fillStyle='#0b1424'; c.fillRect(0,0,w,h);
      const gr=c.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#46d39a'); gr.addColorStop(.5,'#4fc3ff'); gr.addColorStop(1,'#c77dff');
      c.fillStyle=gr; c.font='900 130px "Segoe UI",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('QA · QC · QE',w/2,h/2+4); });
    C.logoMats=[];
    for(const [x,z,ry,w] of [[0,5.01,0,11],[0,-5.01,Math.PI,11],[6.01,0,Math.PI/2,9],[-6.01,0,-Math.PI/2,9]]){
      const m=new THREE.MeshStandardMaterial({map:logo, emissive:0xffffff, emissiveMap:logo, emissiveIntensity:.7, roughness:.4});
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(w*.95, w*.95/4), m); pl.position.set(x, y0+H+1.7, z); pl.rotation.y=ry; g.add(pl); C.logoMats.push(m); }
    mesh(new THREE.CylinderGeometry(.12,.2,9,8), MAT.metal, 0,y0+H+3.4+4.5,0, g);
    C.towerBlink=mesh(new THREE.SphereGeometry(.3,12,8), new THREE.MeshStandardMaterial({color:0xff2233, emissive:0xff2233, emissiveIntensity:5}), 0,y0+H+3.4+9.2,0, g);
    // biển tên trên bục
    const nameTex=canvasTex(1024,160,(c,w,h)=>{ c.fillStyle='#f4f1ea'; c.fillRect(0,0,w,h); c.fillStyle='#14324f'; c.font='800 72px "Segoe UI",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('BÌNH PHAN QUALITY HUB',w/2,h/2+3); });
    const nm=mesh(box(12,1.9,.3), new THREE.MeshStandardMaterial({map:nameTex, roughness:.5}), 0,1.5,10.2, g); nm.castShadow=false;
    // cửa kính + đài phun nước
    mesh(box(4,3.2,.12), MAT.glass, 0,2.2,6.06, g);
    const fz=12.6; mesh(new THREE.CylinderGeometry(3.4,3.6,.6,40), MAT.stone, 0,.3,fz, g);
    const wat=mesh(new THREE.CylinderGeometry(3.1,3.1,.1,40), new THREE.MeshPhysicalMaterial({color:0x2f8fb8, roughness:.05, metalness:.1, envMapIntensity:2, transparent:true, opacity:.85}), 0,.55,fz, g); wat.castShadow=false;
    mesh(new THREE.CylinderGeometry(.3,.45,1.6,16), MAT.stone, 0,1.1,fz, g);
    const fw=new THREE.Vector3(0,0,fz); g.updateMatrixWorld(true); g.localToWorld(fw); C.fountain={x:fw.x, z:fw.z, y:1.9};
    circles.push({x:fw.x, z:fw.z, r:3.6});
    boxes.push({x0:p.x-8.3, x1:p.x+8.3, z0:p.z-6.3, z1:p.z+6.3});
    addPlat(p.x, p.z, p.rot, 12, 10, .6);
    const f=fwdOf(p.rot); C.spots.brain={x:p.x+f[0]*7.6, z:p.z+f[1]*7.6};
    ring(C.spots.brain.x, C.spots.brain.z, 0x4fc3ff, .66);
    makeLabel('🧠 Tháp Brand QA · QC · QE', 'QA Brain: phân tích tài liệu, sinh test case', {h:1, x:p.x, z:p.z, y:55, fade:260});
  }

  /* ---------- 3. Học viện QA + kiosk quiz ---------- */
  C.academy=house(CITY.places.academy, '🎓', 'Học viện QA', 'Trả lời câu hỏi QA/QC để kiếm tiền', 0x2f6fd0);
  function kiosk(x, z, rot){
    const g=new THREE.Group(); g.position.set(x, groundH(x,z), z); g.rotation.y=rot; scene.add(g);
    mesh(box(1,.2,.8), MAT.stone, 0,.1,0, g); mesh(box(.7,1.3,.5), MAT.black, 0,.85,0, g);
    const scr=canvasTex(256,320,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#1e3a8a'); gr.addColorStop(1,'#0b1424'); c.fillStyle=gr; c.fillRect(0,0,w,h);
      c.font='120px "Segoe UI Emoji"'; c.textAlign='center'; c.fillText('🎓',w/2,140); c.fillStyle='#fff'; c.font='800 46px "Segoe UI",sans-serif'; c.fillText('QUIZ QA',w/2,220); c.font='500 26px "Segoe UI",sans-serif'; c.fillStyle='#ffd23f'; c.fillText('Đúng = có tiền',w/2,270); });
    const s=new THREE.Mesh(new THREE.PlaneGeometry(.6,.75), new THREE.MeshStandardMaterial({map:scr, emissive:0xffffff, emissiveMap:scr, emissiveIntensity:.8})); s.position.set(0,1.65,.26); g.add(s);
    mesh(box(.75,1.05,.08), MAT.black, 0,1.65,.2, g);
    circles.push({x, z, r:.55});
    const f=fwdOf(rot), k={x:x+f[0]*1.4, z:z+f[1]*1.4}; C.kiosks.push(k); return k;
  }
  kiosk(-5.6, 4.6, Math.atan2(5.6,-4.6));
  kiosk(5.5, -61.5, Math.atan2(-5.5, 61.5));

  /* ---------- 4. Thương mại: Chợ QC, Showroom xe, Văn phòng địa chính ---------- */
  C.shop=house(CITY.places.shop, '🛒', 'Chợ QC', 'Đồ dùng, vé, mồi câu, thuê thuyền', 0xd05f28);
  C.showroom=house(CITY.places.showroom, '🏍️', 'Showroom xe', 'Xe máy · Ô tô', 0x3a3f4b);
  C.landOffice=house(CITY.places.landOffice, '📜', 'Văn phòng địa chính', 'Mua đất · Xây nhà · Mở quán', 0x8b6a2e);
  C.boathouse=house(CITY.places.boathouse, '⚓', 'Nhà thuyền', 'Bến cảng · Câu cá', 0x1f7fa8);

  /* ---------- 5. Bến cảng: cầu tàu, bến thuyền, chỗ câu ---------- */
  {
    const X=0, Z0=-62, Z1=-101;
    boardwalk(X, Z0, X, Z1, 3);
    for(let z=-68; z>=Z1+1; z-=4) for(const s of [-1,1]) mesh(new THREE.CylinderGeometry(.13,.15,3.4,8), MAT.dark, X+s*1.45,-1.6,z);
    boardwalk(X+1.5, -86, X+9, -86, 2.6);
    for(const x of [4,7.5]) for(const s of [-1,1]) mesh(new THREE.CylinderGeometry(.12,.14,3.4,8), MAT.dark, x,-1.6,-86+s*1.2);
    for(const z of [-75,-90]) for(const s of [-1,1]) mesh(new THREE.CylinderGeometry(.09,.1,.5,8), MAT.black, X+s*1.3,.38,z);
    C.spots.fish={x:X, z:Z1+1.6}; C.spots.dock={x:X+8.4, z:-86}; C.spots.boatPark={x:X+11.2, z:-86, h:Math.PI};
    C.pier={x0:X-1.5, x1:X+1.5, z0:Z1, z1:Z0};
    makeLabel('🎣 Chỗ câu cá', 'Cần câu + mồi', {h:.6, x:X, z:Z1+1.6, y:2.6, fade:60});
  }

  /* ---------- 6. Bồn hoa + ghế đá ---------- */
  const segDist=(x,z,x1,z1)=>{ const L=x1*x1+z1*z1, t=Math.max(0,Math.min(1,(x*x1+z*z1)/L)); return Math.hypot(x-x1*t, z-z1*t); };
  const nearPath=(x,z)=>ZONES.some(q=>segDist(x,z,q.tx,q.tz)<2.6) || (Math.abs(x)<3 && z<0 && z>-20);
  const flowerCols=[0xff4f6d,0xffd23f,0xff8fc2,0xc77dff,0xffffff,0xff7b29];
  function bed(x, z, rot){
    const g=new THREE.Group(); g.position.set(x, groundH(x,z), z); g.rotation.y=rot; scene.add(g);
    for(const [w,d,px,pz] of [[2.6,.12,0,.56],[2.6,.12,0,-.56],[.12,1.24,1.25,0],[.12,1.24,-1.25,0]]) mesh(box(w,.42,d), MAT.wood, px,.21,pz, g);
    const soil=mesh(box(2.4,.08,1.0), colorMat(0x4a3424,{roughness:1}), 0,.36,0, g); soil.castShadow=false;
    const plants=new THREE.Group(); plants.position.y=.38; g.add(plants);
    const col=flowerCols[Math.floor(rnd()*flowerCols.length)], stemM=colorMat(0x3f8f3a), headM=colorMat(col,{roughness:.5}), leafM=colorMat(0x4caf50);
    for(let i=0;i<14;i++){ const px=(rnd()-.5)*2.1, pz=(rnd()-.5)*.8, h=.25+rnd()*.25;
      const st=mesh(new THREE.CylinderGeometry(.012,.015,h,5), stemM, px,h/2,pz, plants); st.castShadow=false;
      const hd=mesh(new THREE.SphereGeometry(.06+rnd()*.03,8,6), headM, px,h,pz, plants); hd.scale.y=.6;
      const lf=mesh(new THREE.SphereGeometry(.07,6,4), leafM, px+.04,h*.35,pz, plants); lf.scale.set(1,.3,.5); lf.castShadow=false; }
    circles.push({x, z, r:1.15});
    const b={x, z, g, plants, water:.35+rnd()*.4, growth:.4+rnd()*.3, claimed:null}; C.beds.push(b); return b;
  }
  for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+.31, r=10.5; const x=Math.cos(a)*r, z=Math.sin(a)*r; if(nearPath(x,z) || z<-8) continue; bed(x,z,-a+Math.PI/2); }
  // S-GFX (15/11): bồn hoa + ghế trước tháp Brand QA cách tháp 12–12,5 m (trước 16–18 m → nằm giữa đường vành đai r=43, chắn xe)
  const tw=CITY.places.tower; for(const s of [-1,1]){ const f=fwdOf(tw.rot), rx=Math.cos(tw.rot), rz=-Math.sin(tw.rot); bed(tw.x+f[0]*12.5+rx*s*7, tw.z+f[1]*12.5+rz*s*7, tw.rot); }
  for(const l of CITY.lots.filter(l=>l.kind==='home').slice(0,3)){ const f=fwdOf(l.rot), rx=Math.cos(l.rot), rz=-Math.sin(l.rot); bed(l.x+f[0]*6.2+rx*4.2, l.z+f[1]*6.2+rz*4.2, l.rot); }
  function bench(x, z, rot){
    const g=new THREE.Group(); g.position.set(x, groundH(x,z), z); g.rotation.y=rot; scene.add(g);
    mesh(box(1.6,.08,.45), MAT.wood, 0,.45,0, g); mesh(box(1.6,.4,.06), MAT.wood, 0,.72,-.2, g);
    for(const s of [-1,1]) mesh(box(.08,.45,.45), MAT.black, s*.7,.22,0, g);
    circles.push({x, z, r:.7}); const f=fwdOf(rot); C.benches.push({x:x+f[0]*.9, z:z+f[1]*.9, rot, taken:null});
  }
  for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+.12, r=12.8; const x=Math.cos(a)*r, z=Math.sin(a)*r; if(nearPath(x,z) || (z<-10 && Math.abs(x)<8)) continue; bench(x,z,Math.atan2(-x,-z)); }
  { const f=fwdOf(tw.rot); bench(tw.x+f[0]*12, tw.z+f[1]*12, tw.rot+Math.PI); }

  /* ---------- 7. Điểm rác có thể xuất hiện ---------- */
  C.trashArea=(r)=>{ for(let k=0;k<30;k++){ const a=r()*Math.PI*2, rr = r()<.5 ? 8+r()*8 : ROAD.r-2+r()*4; const x=Math.cos(a)*rr, z=Math.sin(a)*rr;
      if(circles.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+.6)) continue; return {x,z}; } return null; };

  return C;
}
