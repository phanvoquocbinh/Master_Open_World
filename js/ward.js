// QC World – Sprint 2: Phường Khởi Nghiệp (thế giới mở, nối liền bờ Nam Downtown) + cổng "Rời đảo" + hiển thị vùng.
// Đảo Master Dashboard = vùng MIỄN PHÍ (tool, học, quiz, concert). Qua cổng ở đầu cầu = THẾ GIỚI MỞ (dịch vụ tính phí, đi làm kiếm tiền).
// Phường có: phố chính, Chợ QC, Showroom xe, Văn phòng địa chính (city.js dựng theo CITY.places), 12 lô đất (life.js),
// Trung tâm Việc làm, Nhà trọ khởi nghiệp (phòng miễn phí cho người mới), quầy Bếp Cơm (việc phụ bếp).
import { roadNet } from './roads.js';
export function buildWard(W){
  const {THREE, scene, mesh, box, MAT, colorMat, CITY, circles, boxes, lampPost, makeLabel, INTER, PLACES, teleport, toast, palm, HOOK, P, regionAt, $} = W;   // bench() bên dưới dùng chung cho phố & đảo
  const Z=CITY.ward, X0=Z.x0, X1=Z.x1, GZ0=62, SZ0=64, Z1=Z.z1, ST=Z.street, SWD=10, LX=Z.links, MAINZ=Z.main??Z.street;
  const R=Math.random, out={spots:{}};
  const canvasTex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };

  /* ---------- 1. Nền phường (quy hoạch 15/11/2026: dải đất x 136–262 từ bờ Nam Downtown tới z=480) ---------- */
  // Mặt đất: gạch vỉa hè lặp (1 texture) + mặt nhựa từng đoạn đường lấy từ CITY.roads (js/roads.js). Bó vỉa + đèn đường do downtown.js dựng cho cả thành phố.
  { const slab=mesh(new THREE.BoxGeometry(X1-X0+4, 8, Z1+2-SZ0), MAT.stone, (X0+X1)/2, -4+.02, (SZ0+Z1+2)/2); slab.castShadow=false;
    const paveT=canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#a49d90'; g.fillRect(0,0,w,h); const t=32; for(let y=0;y<h;y+=t) for(let x=(Math.floor(y/t)%2)*t/2-t;x<w;x+=t){ const v=150+R()*22|0; g.fillStyle=`rgb(${v},${v-7},${v-18})`; g.fillRect(x+1,y+1,t-2,t-2); } for(let i=0;i<1500;i++){ g.fillStyle=`rgba(0,0,0,${R()*.06})`; g.fillRect(R()*w,R()*h,2,2); } });
    paveT.wrapS=paveT.wrapT=THREE.RepeatWrapping; paveT.repeat.set((X1-X0)/4,(Z1-GZ0)/4); paveT.userData.live=true;
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-GZ0), new THREE.MeshStandardMaterial({map:paveT, roughness:.88})); ground.rotation.x=-Math.PI/2; ground.position.set((X0+X1)/2,.03,(GZ0+Z1)/2); ground.receiveShadow=true; ground.userData.noFar=true; scene.add(ground);
    const asT=canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#35373c'; g.fillRect(0,0,w,h); for(let i=0;i<6000;i++){ const v=36+R()*44|0; g.fillStyle=`rgba(${v},${v},${v+4},.55)`; g.fillRect(R()*w,R()*h,1.6,1.6); } });
    asT.wrapS=asT.wrapT=THREE.RepeatWrapping; asT.repeat.set(1/8,1/8); asT.userData.live=true;
    const asM=new THREE.MeshStandardMaterial({map:asT, roughness:.92, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-1});
    const NET=roadNet(CITY);
    for(const r of (NET?NET.rects:[])){ const z0=Math.max(r.z0, GZ0), z1=Math.min(r.z1, Z1); if(z1-z0<.2) continue; const w=r.x1-r.x0, d=z1-z0;
      const g=new THREE.PlaneGeometry(w,d); const uv=g.attributes.uv; for(let i=0;i<uv.count;i++){ uv.setXY(i, (r.x0+uv.getX(i)*w), -(z0+(1-uv.getY(i))*d)); }
      const m=new THREE.Mesh(g, asM); m.rotation.x=-Math.PI/2; m.position.set((r.x0+r.x1)/2,.036,(z0+z1)/2); m.receiveShadow=true; m.castShadow=false; m.userData.noFar=true; scene.add(m); }
    // lan can mép bờ (trang trí) – cạnh Tây/Đông/Nam (cạnh Đông liền 1 đoạn: hills.js tự cắt khe cầu sang Đồi Brand QC ở z = street)
    for(const [x0,z0,x1,z1] of [[X0-1,SZ0,X0-1,Z1+1],[X1+1,SZ0,X1+1,Z1+1],[X0-1,Z1+1,X1+1,Z1+1]]){ const len=Math.hypot(x1-x0,z1-z0), r=mesh(box(.08,.08,len), MAT.metal, (x0+x1)/2,1,(z0+z1)/2); r.rotation.y=Math.atan2(x1-x0,z1-z0); }
    makeLabel('🌱 Phường Khởi Nghiệp', 'Thế giới mở · chợ, đất, việc làm, nhà trọ · bệnh viện, trạm cứu hoả, trường học', {h:1, x:160, y:9, z:MAINZ+14, fade:120});
  }

  /* ---------- 2. Ghế đá (dùng chung cho đảo, xem 6b) ---------- */
  function bench(x, z, rot){ const gy=W.groundH(x,z), g=new THREE.Group(); g.position.set(x,gy,z); g.rotation.y=rot; scene.add(g);
    mesh(box(1.6,.08,.45), MAT.wood, 0,.45,0, g); mesh(box(1.6,.4,.06), MAT.wood, 0,.72,-.2, g); for(const s of [-1,1]) mesh(box(.08,.45,.45), MAT.black, s*.7,.22,0, g);
    circles.push({x, z, r:.7}); const f=[Math.sin(rot),Math.cos(rot)], rx=Math.cos(rot), rz=-Math.sin(rot);
    if(W.addSeat) for(const k of [-.42,.42]) W.addSeat({x:x+f[0]*.1+rx*k, z:z+f[1]*.1+rz*k, rot, y:gy+.49, floor:gy, label:'🪑 Ngồi ghế đá (E · C)'}); }

  /* ---------- 3. Trung tâm Việc làm: tháp mới do jobcenter.js dựng ở khối A (cửa ra đường z=290) ---------- */
  out.spots.jobCenter={x:176, z:277.4};
  /* ---------- 4. Nhà trọ khởi nghiệp (4 phòng, phòng 1 cấp miễn phí cho người mới) ---------- */
  { const x0=139, z=235.5, RW=7.2, n=4, g=new THREE.Group(); scene.add(g);
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
  { const x=180.5, z=238, g=new THREE.Group(); g.position.set(x,0,z); scene.add(g);
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
