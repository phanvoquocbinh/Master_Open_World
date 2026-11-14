// QC World – S4: GIAO THÔNG CÔNG CỘNG
//  🚌 Xe buýt Tuyến 01: vòng Đảo (chiều kim đồng hồ, làn ngoài) → cầu → Downtown → Phường Khởi Nghiệp → Downtown → cầu → Đảo.
//     9 trạm có mái chờ, bảng tên, bảng quảng cáo phát sáng, khách chờ; 3 xe chạy đều (giảm tốc vào cua/vào trạm, mở cửa,
//     nhường người đi bộ). Vé 5 💰, chọn trạm xuống, tự xuống khi tới.
//  🚡 Cáp treo Vịnh Bình Phan: ga Đảo (bờ Đông Bắc) ⇄ ga Downtown, trụ thép giữa biển cao 26 m, 8 cabin chạy vòng
//     (chậm lại trong ga để lên/xuống). Vé 10 💰. Trên cabin camera tự lượn chậm để ngắm cảnh.
//  🚕 Taxi: phím X gọi xe tới con đường gần nhất, chọn điểm đến, giá theo quãng đường thật; X lần nữa khi đang đi = đi nhanh.
// Hình khối dựng thủ tục, gộp theo vật liệu (mỗi xe buýt ~10 lượt vẽ, 8 cabin dùng chung 3 lượt vẽ nhờ InstancedMesh).
import { compactGroup } from './perf.js';
export function makeTransit(W, ctx){
  const {S, save, ui, askPay, fmt, spend, V, downtown, ward, campus, resort} = ctx;
  const {THREE, scene, groundAt, groundH, P, me, cam, HOOK, INTER, PLACES, toast, clamp, lerpAngle, circles, boxes, CITY, ROAD, makeLabel, mergeGeometries, resolve, edgeR, WATER_Y} = W;
  const R=Math.random, TAU=Math.PI*2;
  S.transit=S.transit||{bus:0, cable:0, taxi:0};
  const st={ride:null};   // chuyến đang đi: {kind:'bus'|'cable'|'taxi', ...}

  /* ============================== TIỆN ÍCH ============================== */
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function prep(geo, color){ const g=geo.index ? geo.toNonIndexed() : geo.clone();
    for(const k of Object.keys(g.attributes)) if(!['position','normal','uv'].includes(k)) g.deleteAttribute(k);
    if(!g.attributes.normal) g.computeVertexNormals();
    if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    if(color!=null){ const c=new THREE.Color(color), n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b; } g.setAttribute('color', new THREE.Float32BufferAttribute(a,3)); }
    return g; }
  // bộ gộp hình: cộng dồn theo vật liệu → mỗi vật liệu đúng 1 mesh
  // stat=true (vật tĩnh): vật liệu màu theo đỉnh → vật liệu màu trơn thường, để batchStatic gộp chung vào khối màu của ô (không thêm lượt vẽ)
  const SMC=new Map(), smat=(c,r,m)=>{ const k=c+'|'+r+'|'+m; if(!SMC.has(k)) SMC.set(k, new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m})); return SMC.get(k); };
  function Kit(stat=false){ const parts=new Map();
    return {
      add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0, color=null){ if(stat && mat.vertexColors){ mat=smat(color??0xffffff, mat.roughness, mat.metalness); color=null; }
        const g=prep(geo, mat.vertexColors ? (color??0xffffff) : null); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); return this; },
      geos(){ const out=[]; for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(geo){ geo.computeBoundingSphere(); out.push([m,geo]); } } return out; },
      build(parent, cast=true){ const out=[]; for(const [m,geo] of this.geos()){ const ms=new THREE.Mesh(geo,m); ms.castShadow=cast && !m.transparent; ms.receiveShadow=true; parent.add(ms); out.push(ms); } return out; } }; }
  function canvasTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'), w, h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
  const font=(c,px,wt=800)=>{ c.font=`${wt} ${px}px "Segoe UI","Segoe UI Emoji",sans-serif`; };
  const fit=(c,t,px,wt,max)=>{ let f=px; do{ font(c,f,wt); f-=2; } while(c.measureText(t).width>max && f>10); };
  const free=(x,z,rad)=>{ for(const c of circles){ if(Math.hypot(c.x-x,c.z-z) < rad+(c.r||0)) return false; } for(const b of boxes){ if(b.x0===undefined) continue; const nx=clamp(x,b.x0,b.x1), nz=clamp(z,b.z0,b.z1); if(Math.hypot(nx-x,nz-z)<rad) return false; } return true; };
  const setSub=(L,t)=>{ const s=L && L.el.querySelector('small'); if(s && s.textContent!==t) s.textContent=t; };
  const modalOpen=()=>!!document.querySelector('.modalWrap:not([hidden])');

  /* ============================== VẬT LIỆU ============================== */
  const M={
    paint: new THREE.MeshPhysicalMaterial({vertexColors:true, metalness:.3, roughness:.3, clearcoat:.8, clearcoatRoughness:.12}),
    matte: new THREE.MeshStandardMaterial({vertexColors:true, roughness:.75, metalness:.05}),
    metal: new THREE.MeshStandardMaterial({vertexColors:true, roughness:.35, metalness:.8}),
    glass: new THREE.MeshPhysicalMaterial({color:0x16232e, metalness:.15, roughness:.05, clearcoat:1, emissive:0xffd9a0, emissiveIntensity:0}),   // ban đêm: đèn trong xe hắt ra
    clear: new THREE.MeshStandardMaterial({color:0xa8dcff, roughness:.05, metalness:.1, transparent:true, opacity:.26, depthWrite:false}),
    lamp:  new THREE.MeshBasicMaterial({vertexColors:true, toneMapped:false}),
    rope:  new THREE.MeshStandardMaterial({color:0x2a2f36, roughness:.5, metalness:.7}),
    cabGlass: new THREE.MeshPhysicalMaterial({color:0x7fb3d1, metalness:.2, roughness:.04, clearcoat:1, emissive:0xffe2b0, emissiveIntensity:0}),
  };
  const TEAL=0x12a594, WHITE=0xf3f6f8, DARK=0x27313b;
  const ledTex=canvasTex(512,96,(c,w,h)=>{ c.fillStyle='#07090c'; c.fillRect(0,0,w,h); c.fillStyle='#ffb21f'; c.textBaseline='middle'; font(c,58,900); c.fillText('01',16,h/2+2); fit(c,'ĐẢO MD ⇄ DOWNTOWN ⇄ PHƯỜNG',36,800,w-120); c.fillText('ĐẢO MD ⇄ DOWNTOWN ⇄ PHƯỜNG',104,h/2+2);
    c.globalAlpha=.18; c.fillStyle='#000'; for(let y=0;y<h;y+=4) c.fillRect(0,y,w,1); });
  const ledMat=new THREE.MeshBasicMaterial({map:ledTex, toneMapped:false});
  const sideTex=canvasTex(512,80,(c,w,h)=>{ c.fillStyle='#f3f6f8'; c.fillRect(0,0,w,h); c.fillStyle='#12a594'; c.fillRect(0,h-12,w,12); c.fillStyle='#16313a'; c.textBaseline='middle'; font(c,44,900); c.fillText('QC WORLD BUS',14,h/2-4); c.fillStyle='#12a594'; font(c,44,900); c.fillText('01',w-74,h/2-4); });
  const sideMat=new THREE.MeshStandardMaterial({map:sideTex, roughness:.4});
  const adTex=canvasTex(256,384,(c,w,h)=>{ const g=c.createLinearGradient(0,0,0,h); g.addColorStop(0,'#0d3b66'); g.addColorStop(1,'#12a594'); c.fillStyle=g; c.fillRect(0,0,w,h);
    c.fillStyle='#ffd23f'; c.textAlign='center'; font(c,30,900); c.fillText('HỌC QA',w/2,70); c.fillText('MIỄN PHÍ',w/2,108); c.fillStyle='#fff'; font(c,20,600); c.fillText('📚 Toà Giáo trình',w/2,160); c.fillText('17 khoá · 128 bài',w/2,190);
    font(c,66,400); c.fillText('🎓',w/2,282); font(c,18,700); c.fillStyle='#bff3ea'; c.fillText('Đi buýt 01 · trạm Toà Giáo trình',w/2,350); });
  const adMat=new THREE.MeshStandardMaterial({map:adTex, emissive:0xffffff, emissiveMap:adTex, emissiveIntensity:.35, roughness:.4});
  const busSignTex=canvasTex(128,128,(c,w,h)=>{ c.fillStyle='#12a594'; c.beginPath(); c.arc(64,64,62,0,TAU); c.fill(); c.fillStyle='#fff'; c.beginPath(); c.arc(64,64,50,0,TAU); c.fill(); c.fillStyle='#12a594'; c.textAlign='center'; c.textBaseline='middle'; font(c,40,900); c.fillText('🚌',64,52); font(c,26,900); c.fillText('01',64,92); });
  const busSignMat=new THREE.MeshStandardMaterial({map:busSignTex, roughness:.5});
  let lastNight=-1;
  HOOK.onFrame.push(()=>{ if(W.night===lastNight) return; lastNight=W.night; M.glass.emissiveIntensity=W.night*.85; M.cabGlass.emissiveIntensity=W.night*.7; adMat.emissiveIntensity=.35+W.night*1.1; });

  /* ============================== ĐƯỜNG ĐI (lấy mẫu đều) ============================== */
  function roundCorners(v, cut=8){ const out=[v[0]];
    for(let i=1;i<v.length-1;i++){ const A=v[i-1], B=v[i], C=v[i+1], ax=B[0]-A[0], az=B[1]-A[1], bx=C[0]-B[0], bz=C[1]-B[1], la=Math.hypot(ax,az), lb=Math.hypot(bx,bz);
      if(la<1e-6 || lb<1e-6) continue;
      const turn=Math.acos(clamp((ax*bx+az*bz)/(la*lb),-1,1)); if(turn<.12){ out.push(B); continue; }
      const d=Math.min(cut, la*.45, lb*.45), p1=[B[0]-ax/la*d, B[1]-az/la*d], p2=[B[0]+bx/lb*d, B[1]+bz/lb*d], n=Math.max(6, Math.ceil(turn*12));
      for(let k=0;k<=n;k++){ const t=k/n, u=1-t; out.push([u*u*p1[0]+2*u*t*B[0]+t*t*p2[0], u*u*p1[1]+2*u*t*B[1]+t*t*p2[1]]); } }
    out.push(v[v.length-1]); return out; }
  function makePath(raw, loop, alat=2.2){
    const STEP=.5, xs=[], zs=[], pts=raw.slice(); if(loop) pts.push(raw[0]);
    xs.push(pts[0][0]); zs.push(pts[0][1]); let carry=0;
    for(let i=1;i<pts.length;i++){ const a=pts[i-1], b=pts[i], L=Math.hypot(b[0]-a[0], b[1]-a[1]); if(L<1e-6) continue;
      let t=STEP-carry; while(t<=L+1e-9){ xs.push(a[0]+(b[0]-a[0])*t/L); zs.push(a[1]+(b[1]-a[1])*t/L); t+=STEP; } carry=L-(t-STEP); }
    if(loop && xs.length>2 && Math.hypot(xs[xs.length-1]-xs[0], zs[zs.length-1]-zs[0])<.25){ xs.pop(); zs.pop(); }
    const n=xs.length, L=loop ? n*STEP : (n-1)*STEP;
    const at=(s,o={})=>{ if(loop){ s%=L; if(s<0) s+=L; } else s=clamp(s,0,L); const f=s/STEP; let i=Math.floor(f); const t=f-i; let j=i+1; if(loop){ i%=n; j%=n; } else { i=Math.min(i,n-1); j=Math.min(j,n-1); }
      o.x=xs[i]+(xs[j]-xs[i])*t; o.z=zs[i]+(zs[j]-zs[i])*t; return o; };
    const _a={}, _b={};
    const heading=(s,d=2)=>{ at(s-d,_a); at(s+d,_b); return Math.atan2(_b.x-_a.x, _b.z-_a.z); };
    const nearest=(x,z)=>{ let bi=0, bd=1e18; for(let i=0;i<n;i++){ const d=(xs[i]-x)**2+(zs[i]-z)**2; if(d<bd){ bd=d; bi=i; } } return {s:bi*STEP, d:Math.sqrt(bd)}; };
    const vmax=new Float32Array(n); for(let i=0;i<n;i++){ const h1=heading(i*STEP-3,1.5), h2=heading(i*STEP+3,1.5); let dh=Math.abs(h2-h1); if(dh>Math.PI) dh=TAU-dh; const k=dh/6; vmax[i]=k>1e-4?Math.sqrt(alat/k):99; }
    const vAt=s=>{ let i=Math.floor((loop?((s%L)+L)%L:clamp(s,0,L))/STEP); if(loop) i%=n; else i=Math.min(i,n-1); return vmax[i]; };
    return {xs, zs, n, L, STEP, loop, at, heading, nearest, vmax, vAt};
  }
  const rightOf=h=>[-Math.cos(h), Math.sin(h)];      // pháp tuyến bên phải hướng đi h (x+=sin h, z+=cos h)
  const bez3=(p0,p1,p2,p3,n=18)=>{ const o=[]; for(let i=1;i<=n;i++){ const t=i/n, u=1-t, a=u*u*u, b=3*u*u*t, c=3*u*t*t, d=t*t*t; o.push([a*p0[0]+b*p1[0]+c*p2[0]+d*p3[0], a*p0[1]+b*p1[1]+c*p2[1]+d*p3[1]]); } return o; };

  /* ============================== 🚌 TUYẾN 01 ============================== */
  const RL=ROAD.r+ROAD.w/4;                       // làn ngoài đường vòng đảo
  const pol=(a,r=RL)=>[Math.cos(a)*r, Math.sin(a)*r], tCW=a=>[Math.sin(a), -Math.cos(a)];
  const A0=-.35, A1=-TAU+.35, BX=58, WD=CITY.ward, SXr=WD.links||[178,220];
  const xa=SXr[0]-2.5, xb=SXr[1]+2.5, zw=WD.street+2.5;
  const cityPart=roundCorners([[BX,2.5],[xa,2.5],[xa,zw],[xb,zw],[xb,-2.5],[BX,-2.5]], 8);
  const e0=pol(A0), te0=tCW(A0), e1=pol(A1), te1=tCW(A1);
  const intoRing=bez3([BX,-2.5],[BX-11,-2.5],[e0[0]-te0[0]*11, e0[1]-te0[1]*11], e0);
  const ring=[]; for(let a=A0-.02; a>A1; a-=.02) ring.push(pol(a));
  const outRing=bez3(e1,[e1[0]+te1[0]*11, e1[1]+te1[1]*11],[BX-11,2.5],[BX,2.5]);
  const ROUTE=makePath([...cityPart, ...intoRing, ...ring, ...outRing.slice(0,-1)], true);

  const STOP_DEF=[
    {name:'Downtown · Trung tâm', at:[xa,22]},
    {name:'Chợ QC · Showroom', at:[xa,70]},
    {name:'Phường Khởi Nghiệp', at:[200,zw]},
    {name:'Downtown · Đông', at:[xb,24]},
    {name:'Đầu cầu Downtown', at:[169,-2.5]},
    {name:'Bến cảng', at:pol(-Math.PI/2)},
    {name:'Toà Giáo trình', at:pol(2.95)},
    {name:'Khu nghỉ dưỡng', at:pol(2.3)},
    {name:'Tháp Brand QA · Học viện', at:pol(Math.PI/2+.14)},
  ];
  const STOPS=STOP_DEF.map(d=>({...d, s:ROUTE.nearest(d.at[0], d.at[1]).s})).sort((a,b)=>a.s-b.s);
  STOPS.forEach((s,i)=>s.i=i);

  // mái chờ xe buýt (tĩnh → được gộp chung ở batchStatic)
  function buildShelter(stop){
    const island=Math.hypot(stop.at[0], stop.at[1])<60, off=island ? 3.75 : 4.5;
    let best=null;
    for(const ds of [0,2,-2,4,-4,6,-6,9,-9,12,-12,16,-16]){ const s=stop.s+ds, p=ROUTE.at(s), h=ROUTE.heading(s,3), r=rightOf(h), cx=p.x+r[0]*off, cz=p.z+r[1]*off;
      if(free(cx,cz,2.4) && free(cx-r[0]*1.2+Math.sin(h)*2.2, cz-r[1]*1.2+Math.cos(h)*2.2, 1) ){ best={s, p, h, r, cx, cz}; break; } }
    if(!best){ const s=stop.s, p=ROUTE.at(s), h=ROUTE.heading(s,3), r=rightOf(h); best={s, p, h, r, cx:p.x+r[0]*off, cz:p.z+r[1]*off}; }
    stop.s=best.s; stop.h=best.h; stop.sx=best.cx; stop.sz=best.cz; stop.board={x:best.p.x+best.r[0]*(off-1.4), z:best.p.z+best.r[1]*(off-1.4)};
    const th=Math.atan2(Math.cos(best.h), -Math.sin(best.h));   // mặt trước mái chờ (local +z) quay ra đường
    const g=new THREE.Group(); g.position.set(best.cx, groundH(best.cx,best.cz), best.cz); g.rotation.y=th; scene.add(g);
    const k=Kit(true);
    for(const [x,z] of [[-1.95,-.72],[1.95,-.72],[-1.95,.72],[1.95,.72]]) k.add(new THREE.CylinderGeometry(.055,.055,2.5,8), M.metal, x,1.25,z, 0,0,0, 0x3a4652);
    k.add(new THREE.BoxGeometry(4.5,.12,1.95), M.paint, 0,2.56,0, .05,0,0, WHITE);
    k.add(new THREE.BoxGeometry(4.52,.16,.08), M.paint, 0,2.55,.98, 0,0,0, TEAL);
    k.add(new THREE.BoxGeometry(3.1,.08,.44), M.matte, -.4,.5,-.42, 0,0,0, 0x9a6a3e);
    for(const x of [-1.8,1]) k.add(new THREE.BoxGeometry(.08,.46,.36), M.metal, x,.25,-.42, 0,0,0, 0x3a4652);
    k.add(new THREE.BoxGeometry(3.95,.06,.06), M.metal, 0,.12,-.75, 0,0,0, 0x3a4652);
    k.add(new THREE.CylinderGeometry(.05,.05,3.1,8), M.metal, -2.75,1.55,.55, 0,0,0, 0x5b6773);
    k.add(new THREE.CylinderGeometry(.34,.34,.04,24), busSignMat, -2.75,3.05,.55, Math.PI/2,0,0);
    const name=canvasTex(512,128,(c,w,h)=>{ c.fillStyle='#16313a'; c.fillRect(0,0,w,h); c.fillStyle='#12a594'; c.fillRect(0,0,14,h); c.fillStyle='#fff'; c.textBaseline='middle'; fit(c,stop.name,52,800,w-60); c.fillText(stop.name,34,h/2-12); c.fillStyle='#9fe6da'; font(c,26,600); c.fillText('🚌 Tuyến 01 · vé 5 💰',34,h-24); });
    k.add(new THREE.BoxGeometry(1.5,.38,.05), new THREE.MeshStandardMaterial({map:name, roughness:.5}), -2.75,2.45,.55);
    k.build(g);
    const k2=Kit();   // kính + quảng cáo: vật liệu riêng
    k2.add(new THREE.BoxGeometry(3.95,1.85,.04), M.clear, 0,1.3,-.75);
    for(const s of [-1,1]) k2.add(new THREE.BoxGeometry(.04,1.85,1.2), M.clear, s*1.99,1.3,-.1);
    k2.add(new THREE.BoxGeometry(1.15,1.75,.08), adMat, 1.35,1.3,-.7);
    k2.build(g, false);
    const wl=(lx,lz)=>({x:best.cx+lx*Math.cos(th)+lz*Math.sin(th), z:best.cz-lx*Math.sin(th)+lz*Math.cos(th)});
    for(const [lx,lz,r] of [[-1.95,-.72,.25],[1.95,-.72,.25],[-1.95,.72,.2],[1.95,.72,.2],[0,-.75,.3],[-1,-.75,.3],[1,-.75,.3],[-2.75,.55,.18]]){ const q=wl(lx,lz); circles.push({x:q.x, z:q.z, r}); }
    const lb=wl(-2.75,.55);
    const anchor=new THREE.Object3D(); anchor.position.set(lb.x, g.position.y+3.6, lb.z); scene.add(anchor); anchor.userData.dynamic=true;
    stop.label=makeLabel(`🚏 ${stop.name}`, 'Tuyến 01', {fs:40, h:.32, follow:anchor, dot:'#12a594', fade:45});
    stop.waiting=[]; stop.g=g; stop.wl=wl;
  }
  STOPS.forEach(buildShelter);

  // khách chờ ở trạm (người thật từ people.js)
  const riders=[];
  function spawnRider(stop){ if(!W.people || stop.waiting.length>=2) return; const seed=(R()*1e6)|0, k=W.people.kit(seed,{}); if(!k) return;
    const a=W.makeActor(k.gl,{name:`${W.people.nameOf(seed)} · chờ xe buýt`, height:k.h, face:0, clips:k.clips, compact:false, dot:'#9fb3c8'});
    const lx=-1.2+stop.waiting.length*1.3+R()*.3, p=stop.wl(lx, .1+R()*.2); a.g.position.set(p.x, groundH(p.x,p.z), p.z); a.g.rotation.y=Math.atan2(Math.cos(stop.h), -Math.sin(stop.h))+(R()-.5)*.6;
    a.play('idle',0); a.mixer.update(R()*3); const r={a, stop, t:0}; stop.waiting.push(r); riders.push(r); }
  function dropRider(r){ const a=r.a; a.g.parent && a.g.parent.remove(a.g); if(a.label) W.removeLabel ? W.removeLabel(a.label) : 0; W.ACTORS && W.ACTORS.delete(a); r.stop.waiting.splice(r.stop.waiting.indexOf(r),1); riders.splice(riders.indexOf(r),1); }
  STOPS.forEach(s=>{ if(R()<.8) spawnRider(s); if(R()<.35) spawnRider(s); s.respawn=8+R()*20; });

  /* ---------- xe buýt ---------- */
  const BUS={L:11.2, W:2.5, H:3.05};
  const axleGeo=(()=>{ const k=Kit(); for(const s of [-1,1]){ k.add(new THREE.CylinderGeometry(.5,.5,.32,20), M.matte, s*(BUS.W/2-.28),0,0, 0,0,Math.PI/2, 0x151515); k.add(new THREE.CylinderGeometry(.3,.3,.34,12), M.matte, s*(BUS.W/2-.28),0,0, 0,0,Math.PI/2, 0x9aa3ad); } return k.geos()[0][1]; })();
  function buildBus(){
    const {L,W:Wd,H}=BUS, g=new THREE.Group(), k=Kit();
    const sh=new THREE.Shape(), x0=-L/2, x1=L/2, y0=.42, y1=H, r=.32, rf=.45;
    sh.moveTo(x0+r,y0); sh.lineTo(x1-r,y0); sh.quadraticCurveTo(x1,y0,x1,y0+r); sh.lineTo(x1,y1-rf); sh.quadraticCurveTo(x1,y1,x1-rf,y1); sh.lineTo(x0+r,y1); sh.quadraticCurveTo(x0,y1,x0,y1-r); sh.lineTo(x0,y0+r); sh.quadraticCurveTo(x0,y0,x0+r,y0);
    const body=new THREE.ExtrudeGeometry(sh,{depth:Wd-.12, bevelEnabled:true, bevelThickness:.06, bevelSize:.06, bevelSegments:2, curveSegments:5}); body.translate(0,0,-(Wd-.12)/2); body.rotateY(-Math.PI/2);
    k.add(body, M.paint, 0,0,0, 0,0,0, WHITE);
    k.add(new THREE.BoxGeometry(Wd+.035,.22,L-.5), M.paint, 0,1.22,0, 0,0,0, TEAL);
    k.add(new THREE.BoxGeometry(Wd+.025,.34,L-.25), M.paint, 0,.62,0, 0,0,0, DARK);
    k.add(new THREE.BoxGeometry(1.5,.28,2.6), M.matte, 0,H+.12,-1.4, 0,0,0, 0xd9dee3);
    for(const z of [L/2+.06, -L/2-.06]) k.add(new THREE.BoxGeometry(Wd-.05,.3,.14), M.matte, 0,.56,z, 0,0,0, 0x1d2329);
    for(const s of [-1,1]){ k.add(new THREE.BoxGeometry(.07,.42,.07), M.matte, s*(Wd/2+.24),2.35,L/2-.15, 0,0,0, 0x1d2329); k.add(new THREE.BoxGeometry(.3,.07,.07), M.matte, s*(Wd/2+.1),2.55,L/2-.15, 0,0,0, 0x1d2329); }
    k.add(new THREE.BoxGeometry(Wd+.03,1.0,8.9), M.glass, 0,2.0,-.65);
    k.add(new THREE.BoxGeometry(Wd+.03,1.0,.9), M.glass, 0,2.0,L/2-1.05);
    k.add(new THREE.BoxGeometry(Wd-.22,1.25,.07), M.glass, 0,1.58,L/2+.02);
    k.add(new THREE.BoxGeometry(Wd-.4,.85,.07), M.glass, 0,2.05,-L/2-.02);
    for(const s of [-1,1]){ k.add(new THREE.BoxGeometry(.42,.16,.05), M.lamp, s*.84,.88,L/2+.08, 0,0,0, 0xfff3d6); k.add(new THREE.BoxGeometry(.2,.1,.05), M.lamp, s*1.12,1.05,L/2+.08, 0,0,0, 0xffa31a);
      k.add(new THREE.BoxGeometry(.26,.42,.05), M.lamp, s*.98,1.0,-L/2-.08, 0,0,0, 0xff2424); }
    k.add(new THREE.PlaneGeometry(1.9,.3), ledMat, 0,2.42,L/2+.07);
    k.add(new THREE.PlaneGeometry(1.5,.26), ledMat, 0,2.72,-L/2-.07, 0,Math.PI,0);
    for(const s of [-1,1]) k.add(new THREE.PlaneGeometry(3.4,.53), sideMat, s*(Wd/2+.02),.98,-1.4, 0,s*Math.PI/2,0);
    k.build(g);
    const doors=[]; for(const z of [L/2-1.62, .25]){ const d=new THREE.Mesh(new THREE.BoxGeometry(.05,2.25,1.12), M.glass); d.position.set(-Wd/2-.035,1.62,z); d.userData.base=z; d.castShadow=false; g.add(d); doors.push(d); }
    const axles=[3.55,-3.35].map(z=>{ const a=new THREE.Mesh(axleGeo, M.matte); a.position.set(0,.5,z); a.castShadow=true; g.add(a); return a; });
    g.userData.dynamic=true; scene.add(g);
    return {g, doors, axles};
  }
  const NBUS=3, buses=[];
  for(let i=0;i<NBUS;i++){ const b=buildBus(); const st0=STOPS[(i*3)%STOPS.length]; Object.assign(b, {i, s:(st0.s+ROUTE.L-25)%ROUTE.L, v:0, dwell:0, next:st0.i, doorK:0, h:0, honk:0}); buses.push(b); placeBus(b);
    W.DYN && W.DYN.push({obj:b.g, hl:BUS.L/2, hw:BUS.W/2, head:()=>b.h, name:'xe buýt'}); }   // xe buýt là khối đặc
  function placeBus(b){ const p=ROUTE.at(b.s), h=ROUTE.heading(b.s,3.5), f=[Math.sin(h), Math.cos(h)];
    const yF=groundAt(p.x+f[0]*3.5, p.z+f[1]*3.5), yB=groundAt(p.x-f[0]*3.4, p.z-f[1]*3.4), y=(yF+yB)/2;
    b.g.position.set(p.x, y, p.z); b.g.rotation.set(-Math.atan2(yF-yB, 6.9), h, 0, 'YXZ'); b.h=h; }
  const gapAhead=b=>{ let g=1e9; for(const o of buses){ if(o===b) continue; let d=o.s-b.s; if(d<=0) d+=ROUTE.L; g=Math.min(g,d); } return g; };
  function playerAhead(b){ if(st.ride && st.ride.bus===b) return false; const f=[Math.sin(b.h), Math.cos(b.h)], r=rightOf(b.h), dx=P.x-b.g.position.x, dz=P.z-b.g.position.z;
    const ahead=dx*f[0]+dz*f[1]-BUS.L/2, lat=dx*r[0]+dz*r[1]; return ahead>-.5 && ahead<7 && Math.abs(lat)<1.9; }
  function etaTo(stop){ let best=1e9; for(const b of buses){ if(b.dwell>0 && b.at===stop) return 0; let d=stop.s-b.s; if(d<0) d+=ROUTE.L; let n=0; for(const s of STOPS){ let ds=s.s-b.s; if(ds<0) ds+=ROUTE.L; if(ds>0 && ds<d) n++; } best=Math.min(best, d/7.5+n*7+(b.dwell||0)); } return best; }
  function updBus(b, dt){
    if(b.dwell>0){
      const hold = b.at===nearStop() && modalOpen();                 // người chơi đang mua vé ở trạm này → chờ
      b.dwell = hold ? Math.max(b.dwell, 1) : b.dwell-dt; b.doorK=Math.min(1, b.doorK+dt*1.6);
      if(b.dwell<=0){ b.dwell=0; b.next=(b.at.i+1)%STOPS.length; b.at=null; }
    } else {
      b.doorK=Math.max(0, b.doorK-dt*1.6);
      const stop=STOPS[b.next]; let ds=stop.s-b.s; if(ds<0) ds+=ROUTE.L; if(ds>ROUTE.L-3) ds=0;
      let vt=10; for(let d=0; d<=27; d+=3) vt=Math.min(vt, Math.sqrt(ROUTE.vAt(b.s+d)**2+2*2*d));
      vt=Math.min(vt, Math.sqrt(2*1.7*Math.max(0, ds-.15)));
      vt=Math.min(vt, Math.sqrt(2*2.5*Math.max(0, gapAhead(b)-20)));
      if(b.doorK>0) vt=0;
      if(W.traffic) vt=Math.min(vt, W.traffic.limit(ROUTE, b.s, b.v, BUS.L/2, b.h, b.g.position.x, b.g.position.z, b));   // S9: đèn đỏ · xe phía trước · người qua đường
      if(playerAhead(b)){ vt=0; b.honk-=dt; if(b.honk<=0 && Math.hypot(P.x-b.g.position.x,P.z-b.g.position.z)<12){ b.honk=6; toast('🚌 Bíp bíp! Xe buýt xin đường – bước sang lề nhé.', 2200); } }
      b.v+=clamp(vt-b.v, -3.2*dt, 1.3*dt); if(b.v<0) b.v=0;
      b.s=(b.s+b.v*dt)%ROUTE.L;
      if(ds<.9 && b.v<.4 && b.doorK===0) dock(b, stop);
    }
    if(b.alightIn>0){ b.alightIn-=dt; if(b.alightIn<=0 && st.ride && st.ride.bus===b) alightBus(); }
    for(const a of b.axles) a.rotation.x+=b.v*dt/.5;
    for(const d of b.doors){ d.position.x=-BUS.W/2-.035-b.doorK*.07; d.position.z=d.userData.base-b.doorK*1.05; }
    placeBus(b);
  }
  function dock(b, stop){ b.at=stop; b.dwell=6+R()*2; b.s=stop.s; b.v=0;
    for(const r of stop.waiting) if(R()<.85) r.boardIn=.8+R()*2.5;   // khách lên xe (đếm theo khung hình)
    if(st.ride && st.ride.kind==='bus' && st.ride.bus===b && st.ride.dest===stop.i) b.alightIn=.9;
  }
  const nearStop=()=>{ let best=null, bd=6; for(const s of STOPS){ const d=Math.hypot(P.x-s.sx, P.z-s.sz); if(d<bd){ bd=d; best=s; } } return best; };

  // lên / xuống xe
  function boardBus(stop){
    const b=buses.find(x=>x.dwell>0 && x.at===stop); if(!b) return toast(`🚏 Chưa có xe – xe kế tới sau ~${Math.ceil(etaTo(stop))} giây.`);
    const m=ui.modal('🚌 Tuyến 01 · chọn trạm xuống'); const list=document.createElement('div'); list.className='grid';
    for(let k=1;k<STOPS.length;k++){ const t=STOPS[(stop.i+k)%STOPS.length], c=document.createElement('div'); c.className='card'; c.style.cursor='pointer';
      c.innerHTML=`<b>🚏 ${t.name}</b><small>${k} trạm · ~${Math.round(((t.s-stop.s+ROUTE.L)%ROUTE.L)/7.5/60*10+k*.12*10)/10} phút</small>`;
      c.onclick=()=>{ m.close(); askPay(5, `🚌 Vé xe buýt Tuyến 01: <b>${stop.name}</b> → <b>${t.name}</b>`, ()=>{ if(!(b.dwell>0 && b.at===stop)) return toast('Xe vừa chạy mất – chờ chuyến sau nhé.'); if(!spend(5)) return; startBus(b, t); }); };
      list.appendChild(c); }
    m.body.innerHTML='<p class="muted">Vé 5 💰 đi bao nhiêu trạm cũng được. Tới trạm bạn chọn sẽ tự xuống; đang đi bấm E khi xe dừng ở trạm bất kỳ để xuống sớm.</p>'; m.body.appendChild(list);
  }
  function startBus(b, dest){ endRide(); st.ride={kind:'bus', bus:b, dest:dest.i}; S.transit.bus++; save();
    me.g.visible=false; HOOK.camDist=15; b.dwell=Math.max(b.dwell,1.5);
    HOOK.vehicle={drive:(dt)=>{ const p=b.g.position; P.x=p.x; P.z=p.z; P.y=p.y+.5; P.face=b.h; me.g.position.set(p.x,p.y+.6,p.z);
      if(!W.dragging && b.v>.5) cam.yaw=lerpAngle(cam.yaw, b.h+Math.PI, 1-Math.exp(-dt*1.4)); }};
    toast(`🚌 Lên xe! Tuyến 01 → ${dest.name}. Ngồi ngắm cảnh, tới nơi sẽ tự xuống.`, 3800); }
  function alightBus(){ const r=st.ride; if(!r || r.kind!=='bus') return; const b=r.bus, stop=b.at||STOPS[r.dest];
    endRide(); P.x=stop.board.x; P.z=stop.board.z; resolve(P); P.y=groundAt(P.x,P.z); P.face=Math.atan2(stop.sx-P.x, stop.sz-P.z); me.g.rotation.set(0,P.face,0);
    toast(`🚏 Đã tới ${stop.name}.`, 2200); }

  // tương tác ở trạm
  for(const stop of STOPS) INTER.push({x:stop.sx, z:stop.sz, r:3.6, prio:.6,
    get label(){ const b=buses.find(x=>x.dwell>0 && x.at===stop); return b ? '🚌 Lên xe buýt Tuyến 01 (E) – vé 5 💰' : `🚏 ${stop.name} – xe tới sau ~${Math.ceil(etaTo(stop))} giây (E: xem tuyến)`; },
    action:()=>boardBus(stop)});

  /* ============================== 🚡 CÁP TREO ============================== */
  const F=.3, YC=F+4.1, YT=26, RW=2.4, LS=4.6;
  const cab=(()=>{ let A=null;   // ga Đảo: bờ Đông Bắc, xa cầu để tuyến cáp không lẫn với trụ cầu
    for(const a of [-.62,-.58,-.66,-.54,-.7]){ for(const r of [60,58,62,56,64]){ const x=Math.cos(a)*r, z=Math.sin(a)*r; if(groundH(x,z)>.15 && edgeR(a)-r>8){ A={x,z}; break; } } if(A) break; }
    if(!A) A={x:49, z:-35};
    const B={x:CITY.downtown.x0+.5, z:-26.5}; return {A, B}; })();
  const CA=cab.A, CB=cab.B, ux=(CB.x-CA.x), uz=(CB.z-CA.z), ul=Math.hypot(ux,uz), U=[ux/ul, uz/ul], N=[-U[1], U[0]];
  const add2=(p,a,ka,b,kb)=>({x:p.x+a[0]*ka+(b?b[0]*kb:0), z:p.z+a[1]*ka+(b?b[1]*kb:0)});
  const TW={x:(CA.x+CB.x)/2, z:(CA.z+CB.z)/2};
  for(let k=0;k<30 && groundH(TW.x,TW.z)>WATER_Y-.5;k++){ TW.x+=U[0]; TW.z+=U[1]; }   // trụ phải đứng dưới biển
  const sag=(y0,y1,t,len)=>y0+(y1-y0)*t-4*(.02*len)*t*(1-t);
  // vòng cáp (toạ độ điểm kẹp cabin) + cờ chậm (trong ga)
  const loop=[];
  const push=(x,y,z,slow)=>loop.push({x,y,z,slow});
  const lineIn=(p,q,slow,n)=>{ for(let i=0;i<n;i++){ const t=i/n; push(p.x+(q.x-p.x)*t, YC, p.z+(q.z-p.z)*t, slow); } };
  const span=(p,q)=>{ const L=Math.hypot(q.x-p.x,q.z-p.z), tm=clamp((((TW.x-p.x)*(q.x-p.x)+(TW.z-p.z)*(q.z-p.z))/(L*L)),.1,.9), n=Math.ceil(L);
    for(let i=0;i<n;i++){ const t=i/n, y = t<tm ? sag(YC,YT,t/tm,L*tm) : sag(YT,YC,(t-tm)/(1-tm),L*(1-tm)); push(p.x+(q.x-p.x)*t, y, p.z+(q.z-p.z)*t, false); } };
  const wheel=(c,from,dir)=>{ for(let i=0;i<12;i++){ const ph=i/12*Math.PI, cx=c.x+RW*(from[0]*Math.cos(ph)+dir[0]*Math.sin(ph)), cz=c.z+RW*(from[1]*Math.cos(ph)+dir[1]*Math.sin(ph)); push(cx, YC, cz, true); } };
  const nN=[-N[0],-N[1]], nU=[-U[0],-U[1]];
  const iA_dep=loop.length; lineIn(add2(CA,N,RW), add2(CA,U,LS,N,RW), true, 8);
  span(add2(CA,U,LS,N,RW), add2(CB,nU,LS,N,RW));
  const iB_arr=loop.length; lineIn(add2(CB,nU,LS,N,RW), add2(CB,N,RW), true, 8);
  wheel(CB, N, U);
  const iB_dep=loop.length; lineIn(add2(CB,nN,RW), add2(CB,nU,LS,nN,RW), true, 8);
  span(add2(CB,nU,LS,nN,RW), add2(CA,U,LS,nN,RW));
  const iA_arr=loop.length; lineIn(add2(CA,U,LS,nN,RW), add2(CA,nN,RW), true, 8);
  wheel(CA, nN, nU);
  // độ dài cung + vận tốc (tăng/giảm tốc êm 0,55 m/s²)
  const nL=loop.length, segL=new Float32Array(nL), vel=new Float32Array(nL), cum=new Float32Array(nL+1);
  for(let i=0;i<nL;i++){ const a=loop[i], b=loop[(i+1)%nL]; segL[i]=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z); cum[i+1]=cum[i]+segL[i]; vel[i]=a.slow?.7:4.2; }
  for(let pass=0;pass<3;pass++){ for(let i=1;i<nL*2;i++){ const k=i%nL, j=(i-1+nL)%nL; vel[k]=Math.min(vel[k], Math.sqrt(vel[j]**2+2*.55*segL[j])); } for(let i=nL*2;i>0;i--){ const k=i%nL, j=(i+1)%nL; vel[k]=Math.min(vel[k], Math.sqrt(vel[j]**2+2*.55*segL[k])); } }
  const LOOPL=cum[nL];
  const idxAt=u=>{ u=((u%LOOPL)+LOOPL)%LOOPL; let lo=0, hi=nL-1; while(lo<hi){ const m=(lo+hi+1)>>1; if(cum[m]<=u) lo=m; else hi=m-1; } return lo; };
  const posAt=(u,o)=>{ u=((u%LOOPL)+LOOPL)%LOOPL; const i=idxAt(u), a=loop[i], b=loop[(i+1)%nL], t=segL[i]>0?(u-cum[i])/segL[i]:0; o.x=a.x+(b.x-a.x)*t; o.y=a.y+(b.y-a.y)*t; o.z=a.z+(b.z-a.z)*t; o.h=Math.atan2(b.x-a.x, b.z-a.z); o.i=i; return o; };
  // thời gian một vòng → rải 8 cabin đều theo thời gian
  let loopT=0; for(let i=0;i<nL;i++) loopT+=segL[i]/Math.max(.2,(vel[i]+vel[(i+1)%nL])/2);
  const NCAB=8, cabins=[];
  { let t=0, k=0; const gap=loopT/NCAB; for(let i=0;i<nL && k<NCAB;i++){ while(k<NCAB && t>=k*gap){ cabins.push({u:cum[i], p:{}, sway:R()*6, pass:false}); k++; } t+=segL[i]/Math.max(.2,(vel[i]+vel[(i+1)%nL])/2); } while(cabins.length<NCAB) cabins.push({u:R()*LOOPL, p:{}, sway:0}); }
  // cabin: 3 InstancedMesh dùng chung (thân · kính · móc treo)
  const cabMeshes=(()=>{ const k=Kit();
    k.add(new THREE.BoxGeometry(.1,1.97,.1), M.metal, 0,-.985,0, 0,0,0, 0x8c96a0);
    k.add(new THREE.BoxGeometry(.4,.24,.6), M.metal, 0,0,0, 0,0,0, 0x58616b);
    k.add(new THREE.BoxGeometry(1.9,.9,1.9), M.paint, 0,-3.55,0, 0,0,0, WHITE);
    k.add(new THREE.BoxGeometry(1.92,.16,1.92), M.paint, 0,-3.2,0, 0,0,0, TEAL);
    k.add(new THREE.BoxGeometry(1.95,.2,1.95), M.paint, 0,-2.06,0, 0,0,0, TEAL);
    k.add(new THREE.CylinderGeometry(.5,.7,.18,16), M.paint, 0,-1.88,0, 0,0,0, WHITE);
    k.add(new THREE.BoxGeometry(1.86,.95,1.86), M.cabGlass, 0,-2.62,0);
    for(const [x,z] of [[-.94,-.94],[.94,-.94],[-.94,.94],[.94,.94],[0,-.95],[0,.95],[-.95,0],[.95,0]]) k.add(new THREE.BoxGeometry(.07,.95,.07), M.paint, x,-2.62,z, 0,0,0, WHITE);
    k.add(new THREE.BoxGeometry(.3,.12,.05), M.lamp, 0,-3.35,.98, 0,0,0, 0xfff3d6);
    return k.geos().map(([m,geo])=>{ const im=new THREE.InstancedMesh(geo, m, NCAB); im.castShadow=!m.isMeshBasicMaterial; im.receiveShadow=true; im.frustumCulled=false; im.userData.dynamic=true; scene.add(im); return im; }); })();
  // ga, trụ, cáp (tĩnh)
  function buildStation(c, title){
    const g=new THREE.Group(), gy=Math.max(groundH(c.x,c.z), .02); g.position.set(c.x, gy, c.z); g.rotation.y=Math.atan2(U[0],U[1]); scene.add(g);   // local +z = hướng U
    const k=Kit(true), hl=LS+2.6, hw=RW+1.6;
    k.add(new THREE.BoxGeometry(hw*2, F, hl*2), M.matte, 0,F/2-.02,-.6, 0,0,0, 0xbfc6cc);
    k.add(new THREE.BoxGeometry(hw*2+.6, .3, hl*2+.6), M.paint, 0,7.15,-.6, 0,0,0, WHITE);
    k.add(new THREE.BoxGeometry(hw*2+.64, .5, .1), M.paint, 0,6.85,hl-.3, 0,0,0, TEAL);
    k.add(new THREE.BoxGeometry(hw*2+.64, .5, .1), M.paint, 0,6.85,-hl-.9, 0,0,0, TEAL);
    for(const s of [-1,1]) for(const z of [-hl+.2-.6, 0-.6, hl-.2-.6]) k.add(new THREE.BoxGeometry(.3,7,.3), M.metal, s*(hw+.1),3.5,z, 0,0,0, 0x56616c);
    k.add(new THREE.TorusGeometry(RW,.13,8,40), M.metal, 0,YC,0, Math.PI/2,0,0, 0x3c4650);
    k.add(new THREE.CylinderGeometry(.35,.35,1.6,12), M.metal, 0,YC+.6,0, 0,0,0, 0x3c4650);
    k.add(new THREE.BoxGeometry(2.2,1.1,2.2), M.paint, 0,YC+1.75,-.2, 0,0,0, 0xe4e9ee);
    k.add(new THREE.BoxGeometry(.9,.5,1.6), M.matte, 0,F+.25,-hl+1.2, 0,0,0, 0x2c3640);
    const sign=canvasTex(1024,128,(cx,w,h)=>{ cx.fillStyle='#12a594'; cx.fillRect(0,0,w,h); cx.fillStyle='#fff'; cx.textAlign='center'; cx.textBaseline='middle'; fit(cx,title,64,900,w-40); cx.fillText(title,w/2,h/2+2); });
    const sm=new THREE.MeshStandardMaterial({map:sign, roughness:.5}); k.add(new THREE.PlaneGeometry(hw*2,.5), sm, 0,6.85,hl-.24); k.add(new THREE.PlaneGeometry(hw*2,.5), sm, 0,6.85,-hl-.96, 0,Math.PI,0);
    k.build(g);
    const k2=Kit(); for(const s of [-1,1]) k2.add(new THREE.BoxGeometry(.05,2.4,hl*2-1), M.clear, s*(hw+.1),1.6,-.6); k2.build(g,false);
    W.addPlat && W.addPlat(c.x, c.z, Math.atan2(U[0],U[1]), hw, hl, gy+F);
    const wl=(lx,lz)=>{ const th=g.rotation.y; return {x:c.x+lx*Math.cos(th)+lz*Math.sin(th), z:c.z-lx*Math.sin(th)+lz*Math.cos(th)}; };
    for(const s of [-1,1]) for(const z of [-hl+.2-.6, -.6, hl-.2-.6]){ const q=wl(s*(hw+.1), z); circles.push({x:q.x, z:q.z, r:.3}); }
    return {g, wl, gy};
  }
  function clearArea(c, a0, a1, hw){
    const inR=(x,z)=>{ const dx=x-c.x, dz=z-c.z, a=dx*U[0]+dz*U[1], n=dx*N[0]+dz*N[1]; return a>=a0 && a<=a1 && Math.abs(n)<=hw; };
    const bb=new THREE.Box3(), sz=new THREE.Vector3(), cc=new THREE.Vector3(); let n=0;
    for(const o of scene.children.slice()){ if(o.isLight || o.isCamera || (o.userData && o.userData.dynamic) || !(o.isGroup||o.isMesh) || o.isInstancedMesh) continue;
      bb.setFromObject(o); if(bb.isEmpty()) continue; bb.getSize(sz); if(sz.x>18 || sz.z>18) continue; bb.getCenter(cc); if(inR(cc.x,cc.z)){ scene.remove(o); n++; } }
    for(let i=circles.length-1;i>=0;i--){ const k=circles[i]; if(inR(k.x,k.z)) circles.splice(i,1); }
    return n; }
  { let coast=10; while(coast<60 && groundH(CA.x+U[0]*coast, CA.z+U[1]*coast)>WATER_Y+.2) coast+=2; clearArea(CA, -9, coast+4, 7); clearArea(CB, -9, 8, 5); }
  { const D=CITY.downtown, xr=D.x0-1; for(const o of scene.children.slice()){ if(!o.isMesh || !o.geometry || !o.geometry.parameters) continue; const pr=o.geometry.parameters;
      if(Math.abs(o.position.x-xr)<.3 && pr.width<.12 && pr.depth>18 && Math.abs(o.rotation.y)<1e-3){ const z0=o.position.z-pr.depth/2, z1=o.position.z+pr.depth/2, c0=CB.z-5, c1=CB.z+5;
        if(c0>z0 && c1<z1){ scene.remove(o); for(const [a,b] of [[z0,c0],[c1,z1]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(pr.width,pr.height,b-a), o.material); m.position.set(o.position.x,o.position.y,(a+b)/2); m.castShadow=o.castShadow; m.receiveShadow=o.receiveShadow; scene.add(m); } } } } }
  const stA=buildStation(CA,'🚡 CÁP TREO VỊNH BÌNH PHAN · GA ĐẢO'), stB=buildStation(CB,'🚡 CÁP TREO VỊNH BÌNH PHAN · GA DOWNTOWN');
  const towerG=new THREE.Group(); towerG.position.set(TW.x,0,TW.z); towerG.rotation.y=Math.atan2(U[0],U[1]); scene.add(towerG);
  { const k=Kit(true);
    k.add(new THREE.CylinderGeometry(2.4,2.9,6,20), M.matte, 0,WATER_Y-1.6,0, 0,0,0, 0xa9a59c);
    k.add(new THREE.CylinderGeometry(.9,2.0,YT-1.2,4,1), M.metal, 0,(YT-1.2)/2+1.2,0, 0,Math.PI/4,0, 0x6b7884);
    for(let y=4;y<YT-2;y+=4.2){ const w=2.0-(y/YT)*1.1; k.add(new THREE.BoxGeometry(w*1.45,.18,.18), M.metal, 0,y,0, 0,0,0, 0x4d5964); }
    k.add(new THREE.BoxGeometry(RW*2+1.6,.5,.5), M.metal, 0,YT-.6,0, 0,Math.PI/2,0, 0x56616c);
    for(const s of [-1,1]) k.add(new THREE.BoxGeometry(.35,.3,2.2), M.metal, s*RW,YT-.2,0, 0,0,0, 0x3c4650);
    k.add(new THREE.BoxGeometry(RW*2+1.4,.1,1.1), M.matte, 0,YT-.95,0, 0,0,0, 0xffcc33);
    k.build(towerG); }
  const beacon=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8), new THREE.MeshBasicMaterial({color:0xff2a2a, toneMapped:false})); beacon.position.set(0,YT+.5,0); beacon.userData.dynamic=true; beacon.castShadow=false; towerG.add(beacon);
  { const pts=loop.map(p=>new THREE.Vector3(p.x,p.y+.12,p.z)); const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true,'catmullrom',.1), nL*2, .045, 5, true), M.rope); tube.castShadow=false; tube.receiveShadow=false; tube.userData.noFar=true; scene.add(tube); }
  const _cp={}, _cm=new THREE.Matrix4(), _cq=new THREE.Quaternion(), _ce=new THREE.Euler(), _cv=new THREE.Vector3(), _one=new THREE.Vector3(1,1,1);
  let cabRide=null;   // {cab, from:'A'|'B', state:'wait'|'ride'}
  function updCable(dt, T){
    for(const c of cabins){ const i=idxAt(c.u), v=(vel[i]+vel[(i+1)%nL])/2; c.u=(c.u+v*dt)%LOOPL; posAt(c.u, c.p);
      const sway=Math.sin(T*1.1+c.sway)*.025*(c.p.y>YC+2?1:.2);
      _ce.set(sway*.5,c.p.h,sway,'YXZ'); _cq.setFromEuler(_ce); _cm.compose(_cv.set(c.p.x,c.p.y,c.p.z), _cq, _one);
      for(const im of cabMeshes) im.setMatrixAt(cabins.indexOf(c), _cm); }
    for(const im of cabMeshes) im.instanceMatrix.needsUpdate=true;
    beacon.visible=Math.sin(T*2.4)>.2;
    if(cabRide){ const r=cabRide;
      if(r.state==='wait'){ const i0 = r.from==='A' ? iA_dep : iB_dep; const c=cabins.find(c=>{ const i=idxAt(c.u); return i>=i0 && i<=i0+3; });
        if(c){ r.cab=c; r.state='ride'; me.g.visible=false; HOOK.camDist=14; toast('🚡 Cabin đã tới – lên! Kéo chuột để ngắm cảnh, tới ga bên kia sẽ tự xuống.', 3600);
          HOOK.vehicle={drive:(dt2)=>{ const p=c.p; P.x=p.x; P.z=p.z; P.y=p.y-3.4; P.face=p.h; me.g.position.set(p.x,p.y-3.9,p.z); if(!W.dragging) cam.yaw+=dt2*.12; }}; } }
      else if(r.state==='ride'){ const i=idxAt(r.cab.u), ia = r.from==='A' ? iB_arr : iA_arr; if(i>=ia+3 && i<=ia+7) alightCable(r.from==='A' ? stB : stA); } }
  }
  const exitOf=stn=>stn.wl(0, stn===stB ? LS+.4 : -LS-.4);
  function alightCable(stn){ endRide(); const q=exitOf(stn); P.x=q.x; P.z=q.z; P.y=groundAt(P.x,P.z); P.face=stn===stB ? Math.atan2(U[0],U[1]) : Math.atan2(-U[0],-U[1]); me.g.rotation.set(0,P.face,0);
    toast(`🚡 Đã tới ${stn===stB?'ga Downtown':'ga Đảo'}.`, 2200); }
  for(const [stn, from] of [[stA,'A'],[stB,'B']]){ const q=stn.wl(0,-1);
    INTER.push({x:q.x, z:q.z, r:5.2, prio:.6, label:`🚡 Đi cáp treo sang ${from==='A'?'Downtown':'Đảo'} (E) – vé 10 💰`,
      action:()=>askPay(10, `🚡 Vé cáp treo Vịnh Bình Phan: <b>${from==='A'?'Ga Đảo → Ga Downtown':'Ga Downtown → Ga Đảo'}</b><br><span class="muted">Bay qua eo biển ở độ cao 26 m, khoảng 40 giây.</span>`, ()=>{ if(!spend(10)) return; endRide(); cabRide={from, state:'wait'}; st.ride={kind:'cable'}; S.transit.cable++; save(); toast('🚡 Đứng trên sân ga chờ cabin kế tiếp…', 3000); })}); }

  /* ============================== 🚕 TAXI ============================== */
  // đồ thị đường (tim đường): vòng đảo · cầu · lưới Downtown · phố Phường
  const G={nodes:[], edges:[]};
  const node=(x,z)=>{ G.nodes.push({x,z,adj:[]}); return G.nodes.length-1; };
  const link=(a,b)=>{ const d=Math.hypot(G.nodes[a].x-G.nodes[b].x, G.nodes[a].z-G.nodes[b].z); G.nodes[a].adj.push([b,d]); G.nodes[b].adj.push([a,d]); G.edges.push([a,b]); };
  const NR=64, ringN=[]; for(let i=0;i<NR;i++){ const a=i/NR*TAU; ringN.push(node(Math.cos(a)*ROAD.r, Math.sin(a)*ROAD.r)); } for(let i=0;i<NR;i++) link(ringN[i], ringN[(i+1)%NR]);
  const D=CITY.downtown, GX=[D.x0, SXr[0], SXr[1], D.x1], GZ=[-36,0,36], gid={};
  const gn=(x,z)=>{ const k=x+','+z; return gid[k]??(gid[k]=node(x,z)); };
  link(ringN[0], gn(D.x0,0));
  for(const z of GZ) for(let i=0;i<GX.length-1;i++) link(gn(GX[i],z), gn(GX[i+1],z));
  for(const x of SXr){ link(gn(x,D.z0), gn(x,-36)); link(gn(x,36), gn(x,D.z1)); link(gn(x,-36), gn(x,0)); link(gn(x,0), gn(x,36)); link(gn(x,D.z1), gn(x,WD.street)); }
  for(let i=0;i<GX.length-1;i++) link(gn(GX[i],WD.street), gn(GX[i+1],WD.street));
  function project(x,z){ let best=null; for(const [a,b] of G.edges){ const A=G.nodes[a], B=G.nodes[b], dx=B.x-A.x, dz=B.z-A.z, L2=dx*dx+dz*dz, t=clamp(((x-A.x)*dx+(z-A.z)*dz)/L2,0,1), px=A.x+dx*t, pz=A.z+dz*t, d=Math.hypot(px-x,pz-z);
      if(!best || d<best.d) best={a,b,t,x:px,z:pz,d}; } return best; }
  function dijkstra(src){ const n=G.nodes.length, dist=new Float64Array(n).fill(Infinity), prev=new Int32Array(n).fill(-1), done=new Uint8Array(n);
    for(const [i,d] of src){ dist[i]=d; }
    for(;;){ let u=-1, bd=Infinity; for(let i=0;i<n;i++) if(!done[i] && dist[i]<bd){ bd=dist[i]; u=i; } if(u<0) break; done[u]=1; for(const [v,w] of G.nodes[u].adj){ if(dist[u]+w<dist[v]){ dist[v]=dist[u]+w; prev[v]=u; } } }
    return {dist, prev}; }
  function route(from, to){   // from/to: kết quả project()
    if((from.a===to.a && from.b===to.b) || (from.a===to.b && from.b===to.a)) return {pts:[[from.x,from.z],[to.x,to.z]], len:Math.hypot(to.x-from.x,to.z-from.z)};
    const A=G.nodes[from.a], B=G.nodes[from.b];
    const {dist, prev}=dijkstra([[from.a, Math.hypot(A.x-from.x,A.z-from.z)],[from.b, Math.hypot(B.x-from.x,B.z-from.z)]]);
    const C=G.nodes[to.a], E=G.nodes[to.b], dc=dist[to.a]+Math.hypot(C.x-to.x,C.z-to.z), de=dist[to.b]+Math.hypot(E.x-to.x,E.z-to.z);
    let end = dc<de ? to.a : to.b; const len=Math.min(dc,de); const chain=[]; for(let u=end; u>=0; u=prev[u]) chain.push(u); chain.reverse();
    return {pts:[[from.x,from.z], ...chain.map(i=>[G.nodes[i].x, G.nodes[i].z]), [to.x,to.z]], len}; }
  function lanePath(pts){ const c=makePath(roundCorners(pts,7), false), out=[]; for(let s=0;s<=c.L;s+=1){ const p=c.at(s), r=rightOf(c.heading(s,1.5)); out.push([p.x+r[0]*2.1, p.z+r[1]*2.1]); } return makePath(out.length>1?out:[pts[0],pts[pts.length-1]], false, 3); }
  const taxi=(()=>{ const o=V.buildCar(0xf5c400,'sedan'); o.userData.dynamic=true; W.DYN && W.DYN.push({obj:o, hl:2.3, hw:.95, head:()=>o.rotation.y, on:()=>o.visible && !!o.parent, name:'taxi'});
    const sign=canvasTex(256,64,(c,w,h)=>{ c.fillStyle='#111'; c.fillRect(0,0,w,h); c.fillStyle='#ffd23f'; c.textAlign='center'; c.textBaseline='middle'; font(c,44,900); c.fillText('TAXI',w/2,h/2+2); });
    const sm=new THREE.MeshStandardMaterial({map:sign, emissive:0xffffff, emissiveMap:sign, emissiveIntensity:.9});
    const box=new THREE.Mesh(new THREE.BoxGeometry(.75,.24,.3), [M.matte, M.matte, M.matte, M.matte, sm, sm]); box.position.set(0,1.6,-.7); o.add(box);
    for(const s of [-1,1]){ const ch=new THREE.Mesh(new THREE.BoxGeometry(.02,.12,2.6), new THREE.MeshStandardMaterial({color:0x111111})); ch.position.set(s*.86,.78,0); o.add(ch); }
    for(const w of (o.userData.wheels||[])) w.userData.keep=true; try{ compactGroup(W, o); }catch(e){ console.warn('taxi compact', e); }
    o.visible=false; scene.add(o); return o; })();
  let tx=null;   // {state:'coming'|'wait'|'ride'|'leave', path, s, v, dest, t}
  const TAXI_DEST=(()=>{ const L=[]; const add=(icon,name,x,z)=>{ if(Number.isFinite(x) && Number.isFinite(z)) L.push({icon,name,x,z}); };
    add('🏠','Quảng trường trung tâm',0,30); add('🎤','Sân khấu QC Live',0,-30); add('⚓','Bến cảng',0,-62); add('🧠','Tháp Brand QA',0,61);
    try{ add('📚','Toà Giáo trình', -50, 0); }catch(e){}
    try{ const h=resort && resort.houses && resort.houses[0]; if(h) add('🏝️','Khu nghỉ dưỡng', h.x, h.z); }catch(e){}
    add('🚡','Ga cáp treo · Đảo', CA.x, CA.z); add('🌉','Cổng Rời đảo (đầu cầu)', CITY.gateX||52, 0);
    add('🌆','Downtown · Trung tâm', SXr[0], 0); add('🚡','Ga cáp treo · Downtown', CB.x, CB.z);
    try{ for(const t of (downtown && downtown.towers || []).filter(t=>!t.locked)) add('🏢', t.name, t.door.x, t.door.z); }catch(e){}
    const pl=CITY.places||{}; if(pl.shop) add('🛒','Chợ QC', pl.shop.x, pl.shop.z); if(pl.showroom) add('🚗','Showroom xe', pl.showroom.x, pl.showroom.z); if(pl.landOffice) add('📜','Văn phòng địa chính', pl.landOffice.x, pl.landOffice.z);
    try{ const sp=ward && ward.spots; if(sp && sp.jobCenter) add('🧑‍💼','Trung tâm Việc làm', sp.jobCenter.x, sp.jobCenter.z); if(sp && sp.tro) add('🛏️','Nhà trọ khởi nghiệp', sp.tro.x, sp.tro.z); }catch(e){}
    return L; })();
  function callTaxi(){
    if(W.inside) return toast('Ra khỏi toà nhà rồi mới gọi taxi nhé.');
    if(st.ride) return st.ride.kind==='taxi' && tx && tx.state==='ride' ? skipTaxi() : toast('Bạn đang đi xe khác.');
    if(HOOK.vehicle) return toast('Xuống xe (V) rồi mới gọi taxi.');
    if(tx && (tx.state==='coming' || tx.state==='wait')) return toast('🚕 Taxi đang tới – đứng yên chờ chút nhé.');
    const pick=project(P.x,P.z); if(!pick || pick.d>45) return toast('🚕 Bạn đứng xa đường quá – ra gần đường vòng đảo, cầu hoặc phố Downtown rồi gọi lại (X).', 3800);
    // xe xuất phát cách 70–140 m theo đường
    const {dist}=dijkstra([[pick.a,0],[pick.b,0]]); let start=-1, bd=-1; for(let i=0;i<G.nodes.length;i++){ const d=dist[i]; if(d>70 && d<140 && d>bd){ bd=d; start=i; } }
    if(start<0){ let far=-1; for(let i=0;i<G.nodes.length;i++) if(dist[i]<Infinity && dist[i]>far){ far=dist[i]; start=i; } }
    const sN=G.nodes[start], nb=G.nodes[sN.adj[0][0]], from={a:start, b:sN.adj[0][0], t:0, x:sN.x, z:sN.z, d:0};
    const r=route(from, pick), path=lanePath(r.pts);
    tx={state:'coming', path, s:0, v:0, pick, t:0}; taxi.visible=true; placeTaxi();
    toast(`🚕 Đã gọi taxi – xe tới sau ~${Math.ceil(r.len/9+3)} giây.`, 3000);
  }
  function placeTaxi(){ const p=tx.path.at(tx.s), h=tx.path.heading(tx.s,1.2); taxi.position.set(p.x, groundAt(p.x,p.z), p.z); taxi.rotation.y=h; tx.h=h;
    for(const w of (taxi.userData.wheels||[])) w.rotation.x+=tx.v*.016/.34; }
  function driveTaxi(dt, vmaxTop){ const rem=tx.path.L-tx.s; let vt=vmaxTop; for(let d=0;d<=24;d+=3) vt=Math.min(vt, Math.sqrt(tx.path.vAt(tx.s+d)**2+2*3*d)); vt=Math.min(vt, Math.sqrt(2*3*Math.max(0,rem-.3)));
    if(W.traffic) vt=Math.min(vt, W.traffic.limit(tx.path, tx.s, tx.v, 2.3, tx.h||0, taxi.position.x, taxi.position.z, taxi));
    tx.v+=clamp(vt-tx.v, -5*dt, 3*dt); if(tx.v<0) tx.v=0; tx.s=Math.min(tx.path.L, tx.s+tx.v*dt); placeTaxi(); return rem<.6 && tx.v<.3; }
  function updTaxi(dt){ if(!tx) return; tx.t+=dt;
    if(tx.state==='coming'){ if(driveTaxi(dt, 12)){ tx.state='wait'; tx.t=0; toast('🚕 Taxi đã tới! Lại gần bấm E để lên xe.', 3000); } }
    else if(tx.state==='wait'){ if(tx.t>75){ tx.state='leave'; tx.t=0; toast('🚕 Taxi đã chờ lâu quá nên đi mất. Bấm X gọi lại.'); } }
    else if(tx.state==='ride'){ if(driveTaxi(dt, 14)) arriveTaxi(); }
    else if(tx.state==='leave'){ tx.s+=dt*8; taxi.position.x+=Math.sin(tx.h||0)*dt*8; taxi.position.z+=Math.cos(tx.h||0)*dt*8; if(tx.t>6){ taxi.visible=false; tx=null; } } }
  INTER.push({get x(){ return taxi.position.x; }, get z(){ return taxi.position.z; }, r:4, prio:1, when:()=>!!tx && tx.state==='wait', label:'🚕 Lên taxi (E) – chọn điểm đến',
    action:()=>{ const pickNow=project(taxi.position.x, taxi.position.z), m=ui.modal('🚕 Taxi · đi đâu?', {wide:true}), grid=document.createElement('div'); grid.className='grid';
      for(const d of TAXI_DEST){ const to=project(d.x,d.z); if(!to) continue; const r=route(pickNow,to); if(r.len<25) continue; const fare=10+Math.round(r.len/20);
        const c=document.createElement('div'); c.className='card'; c.style.cursor='pointer'; c.innerHTML=`<b>${d.icon} ${d.name}</b><small>${Math.round(r.len)} m · ~${Math.ceil(r.len/11)} giây · <b>${fmt(fare)} 💰</b></small>`;
        c.onclick=()=>{ m.close(); askPay(fare, `🚕 Taxi tới <b>${d.icon} ${d.name}</b> (${Math.round(r.len)} m)`, ()=>{ if(!tx || tx.state!=='wait') return toast('Taxi đã đi mất – bấm X gọi lại.'); if(!spend(fare)) return; startTaxi(pickNow, to, d); }); };
        grid.appendChild(c); }
      m.body.innerHTML='<p class="muted">Giá = 10 💰 mở cửa + 1 💰 mỗi 20 m đường thật. Đang đi bấm <b>X</b> để đi nhanh (tới ngay).</p>'; m.body.appendChild(grid); }});
  function startTaxi(from, to, d){ endRide(); const r=route(from, to); tx.path=lanePath(r.pts); tx.s=0; tx.v=0; tx.state='ride'; tx.dest=d; st.ride={kind:'taxi'}; S.transit.taxi++; save();
    me.g.visible=false; HOOK.camDist=9;
    HOOK.vehicle={drive:(dt)=>{ P.x=taxi.position.x; P.z=taxi.position.z; P.y=taxi.position.y; P.face=tx?tx.h:P.face; me.g.position.copy(taxi.position); if(!W.dragging && tx && tx.v>1) cam.yaw=lerpAngle(cam.yaw, tx.h+Math.PI, 1-Math.exp(-dt*2)); }};
    toast(`🚕 Đi tới ${d.icon} ${d.name}. Bấm X để đi nhanh.`, 3200); }
  function skipTaxi(){ if(!tx || tx.state!=='ride') return; tx.s=tx.path.L; tx.v=0; placeTaxi(); arriveTaxi(); }
  function arriveTaxi(){ const d=tx.dest, r=rightOf(tx.h); endRide(); P.x=taxi.position.x+r[0]*2.1; P.z=taxi.position.z+r[1]*2.1; resolve(P); P.y=groundAt(P.x,P.z); P.face=Math.atan2(d.x-P.x, d.z-P.z); me.g.rotation.set(0,P.face,0); cam.yaw=P.face+Math.PI;
    const far=Math.hypot(d.x-P.x, d.z-P.z); toast(`🚕 Đã tới ${d.icon} ${d.name}${far>12?` – đi bộ thêm ~${Math.round(far)} m`:''}. Cảm ơn quý khách!`, 3200); tx.state='leave'; tx.t=0; }
  HOOK.keys.KeyX=callTaxi;

  /* ============================== CHUNG ============================== */
  function endRide(){ if(cabRide) cabRide=null; if(st.ride && st.ride.kind==='taxi' && tx && tx.state==='ride'){ tx.state='leave'; tx.t=0; }
    st.ride=null; me.g.visible=true; if(HOOK.vehicle && !V.riding()) HOOK.vehicle=null; HOOK.camDist=null; HOOK.vehicleInter=null; P.vx=P.vz=P.vy=0; P.ground=true; }
  // HUD khi đang đi
  const hud=document.createElement('div'); hud.className='glass'; hud.style.cssText='position:fixed;left:50%;top:70px;transform:translateX(-50%);padding:8px 14px;font-weight:700;font-size:14px;z-index:4;display:none;white-space:nowrap'; document.body.appendChild(hud);
  let hudT=0, lblT=0;
  HOOK.onFrame.push((dt, T)=>{
    if(W.inside) return;
    for(const b of buses) updBus(b, dt);
    updCable(dt, T); updTaxi(dt);
    for(const r of riders.slice()){ if(r.boardIn>0){ r.boardIn-=dt; if(r.boardIn<=0){ dropRider(r); continue; } } if(r.a.root.visible) r.a.mixer.update(dt); }
    for(const s of STOPS){ if(s.waiting.length<2){ s.respawn-=dt; if(s.respawn<=0){ s.respawn=10+R()*25; if(!buses.some(b=>b.at===s)) spawnRider(s); } } }
    lblT+=dt; if(lblT>.5){ lblT=0; for(const s of STOPS){ const b=buses.find(x=>x.dwell>0 && x.at===s); setSub(s.label, b ? '🚌 Xe đang đỗ – lên ngay!' : `Tuyến 01 · xe tới sau ~${Math.ceil(etaTo(s))} giây`); } }
    // tương tác khi đang đi (life.js xoá vehicleInter mỗi khung → đặt lại ở đây, chạy sau)
    const r=st.ride;
    if(r && r.kind==='bus'){ const b=r.bus; HOOK.vehicleInter=()=> b.dwell>0 && b.at ? {label:`🚏 Xuống xe ở ${b.at.name} (E)`, action:alightBus} : {label:`🚌 Tuyến 01 → ${STOPS[r.dest].name} · trạm kế: ${STOPS[b.next].name}`, action:()=>{}}; }
    else if(r && r.kind==='taxi'){ HOOK.vehicleInter=()=>({label:`🚕 Tới ${tx&&tx.dest?tx.dest.name:'…'} · còn ${tx?Math.max(0,Math.round(tx.path.L-tx.s)):0} m · X: đi nhanh`, action:()=>{}}); }
    else if(r && r.kind==='cable'){ HOOK.vehicleInter=()=>({label: cabRide && cabRide.state==='ride' ? `🚡 Đang bay qua vịnh · độ cao ${Math.max(0,Math.round((cabRide.cab.p.y-3.4)))} m` : '🚡 Chờ cabin…', action:()=>{}}); }
    hudT+=dt; if(hudT>.25){ hudT=0; let t='';
      if(r && r.kind==='bus'){ const b=r.bus; let n=0; for(let k=b.at?b.at.i:b.next, g=0; k!==r.dest && g<20; k=(k+1)%STOPS.length, g++) n++; t=`🚌 Tuyến 01 → <b>${STOPS[r.dest].name}</b> · còn ${n} trạm · ${Math.round(b.v*3.6)} km/h`; }
      else if(r && r.kind==='taxi' && tx) t=`🚕 → <b>${tx.dest?tx.dest.name:''}</b> · ${Math.round(tx.v*3.6)} km/h · <span class="key">X</span> đi nhanh`;
      else if(r && r.kind==='cable') t= cabRide && cabRide.state==='ride' ? `🚡 Cáp treo · ${Math.round(cabRide.cab.p.y-3.4)} m trên mặt biển` : '🚡 Đứng trên sân ga chờ cabin…';
      hud.style.display=t?'block':'none'; if(t && hud.innerHTML!==t) hud.innerHTML=t; }
  });
  // đang ở ga chờ cabin mà bước ra khỏi ga → huỷ (hoàn vé)
  HOOK.onFrame.push(()=>{ if(cabRide && cabRide.state==='wait'){ const stn=cabRide.from==='A'?CA:CB; if(Math.hypot(P.x-stn.x,P.z-stn.z)>12){ cabRide=null; st.ride=null; S.coins+=10; save(); toast('🚡 Bạn rời ga – đã hoàn lại vé 10 💰.'); } } });

  /* ============================== BẢN ĐỒ + HƯỚNG DẪN ============================== */
  const tpTo=(x,z,lx,lz)=>()=>W.teleport(x,z,lx,lz);
  { const qa=exitOf(stA), qb=exitOf(stB);
    PLACES.push({icon:'🚡', name:'Ga cáp treo · Đảo', sub:'Cáp treo qua vịnh sang Downtown · vé 10 💰', go:tpTo(qa.x,qa.z,CA.x,CA.z)});
    PLACES.push({icon:'🚡', name:'Ga cáp treo · Downtown', sub:'Cáp treo về Đảo · vé 10 💰', go:tpTo(qb.x,qb.z,CB.x,CB.z)}); }
  const s0=STOPS.find(s=>s.name.startsWith('Đầu cầu')); if(s0) PLACES.push({icon:'🚏', name:'Trạm buýt Đầu cầu Downtown', sub:'Tuyến 01 về Đảo · vé 5 💰', go:tpTo(s0.board.x, s0.board.z, s0.sx, s0.sz)});
  try{ const c=W.$('helpWrap').querySelector('.ctrl'); for(const [k,t] of [['X','Gọi taxi 🚕 (đứng gần đường) · đang đi: đi nhanh'],['E','Ở trạm 🚏: lên xe buýt · ở ga 🚡: đi cáp treo']]){ const a=document.createElement('div'); a.className='ks'; a.innerHTML=`<span class="key">${k}</span>`; const b=document.createElement('div'); b.textContent=t; c.append(a,b); }
    const h=W.$('hint'); h.innerHTML+=' · <span class="key">X</span> taxi'; }catch(e){}

  return {buses, STOPS, ROUTE, cabins, cab, taxi:()=>tx, taxiObj:taxi, callTaxi, endRide, ride:()=>st.ride, TAXI_DEST, G, route, project, lanePath, makePath, rightOf, BUS};
}
