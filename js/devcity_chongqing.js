// QC World V2 – PHA 6: DEV CITY · ĐÔ THỊ NÚI 8D KIỂU TRÙNG KHÁNH (vùng x 100→850, z −950→−120, y 2→135) – theo V2_PLAN.md + Bible Phần 3 / Module 5
//  ĐỊA HÌNH 4 THỀM: T1 bờ sông +2 · T2 lưng núi +24 · T3 cao nguyên +52 (hồ Thiên Cảnh) · T4 đỉnh mây +85 (sân bay) – vách đá giữa các thềm,
//    cao nguyên Tây +46 sau phố cổ, thung lũng sâu +2 chứa nút giao xoắn ốc, 2 đỉnh núi chùa Linh Sơn (72 m · 98 m) cách nhau 1 hẻm vực.
//  GIAO THÔNG 8D (file này): đường đèo bám vách, tàu điện một ray xuyên tầng 6–8 toà chung cư 18 tầng (sân ga trong bụng toà nhà),
//    nút giao xoắn ốc 5 tầng 2→52 m + cầu cạn lên cao nguyên, cầu dây văng 2 tầng, hầm đôi xuyên núi (đèn vòm LED xanh) leo T2 → T3.
//  CÔNG TRÌNH (js/devcity_landmarks.js): tổ hợp 4 tháp cánh buồm + ống kính ngang 95 m, phố cổ treo vách 11 tầng, công viên hồ giữa núi,
//    quần thể chùa (bảo tháp 9 tầng, chánh điện treo vách, cầu xích 80 m, tượng Phật 32 m trong mây), sân bay đỉnh núi, khách sạn, bệnh viện, cứu hoả, trường học.
//  Hiệu năng: hình tĩnh gộp sẵn theo (vật liệu × khu) → ít lượt vẽ; cấu kiện lặp = InstancedMesh; địa hình = 1 lưới.
//  Va chạm: EXTL (độ cao) · plats (sàn tầng / cầu / đường trên cao) · SEGS (lan can, tường) · boxes.
//  Hầm: độ cao vật lý = sàn hầm, mặt núi phía trên chỉ là hình + 1 sàn đi bộ ở +52 (người trong hầm thấp hơn → không bị nhấc lên).
import * as AK from './archKit.js';

export async function make(W, ctx){
  const {THREE, scene, HOOK, EXTL, PLACES, INTER, addPlat, addSeg, mergeGeometries, makeLabel, toast, teleport, clamp, lerp, P} = W;
  if(!THREE || !mergeGeometries || !EXTL) return null;
  AK.bindNight(W);
  const V3=THREE.Vector3, TAU=Math.PI*2;
  const X0=100, X1=850, Z0=-950, Z1=-120;
  const Y1=2, Y2=24, Y3=52, Y4=85, YW=46;
  const ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  const R=AK.rng(860606);
  const hash=(x,z)=>{ let h=Math.imul(x|0,374761393)^Math.imul(z|0,668265263); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967295; };
  const vn=(x,z)=>{ const xi=Math.floor(x), zi=Math.floor(z), xf=x-xi, zf=z-zi, u=xf*xf*(3-2*xf), v=zf*zf*(3-2*zf), a=hash(xi,zi), b=hash(xi+1,zi), c=hash(xi,zi+1), d=hash(xi+1,zi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  const fbm=(x,z,o=4)=>{ let s=0, a=.5, f=1; for(let i=0;i<o;i++){ s+=a*vn(x*f,z*f); f*=2.03; a*=.5; } return s; };
  const t0=performance.now();
  const root=new THREE.Group(); root.name='devcityV2'; scene.add(root);

  /* ============================== GỘP HÌNH TĨNH: (vật liệu × khu) → 1 mesh ============================== */
  const BAT=new Map();
  function put(mat, geo, dist='c'){ let g=geo.index ? geo.toNonIndexed() : geo;
    if(!g.attributes.normal) g.computeVertexNormals();
    if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    for(const k of Object.keys(g.attributes)) if(!(k==='position' || k==='normal' || k==='uv' || (k==='color' && mat.vertexColors))) g.deleteAttribute(k);
    g.clearGroups(); g.morphAttributes={}; const key=mat.uuid+'|'+dist; let e=BAT.get(key); if(!e){ e={mat, list:[], dist}; BAT.set(key,e); } e.list.push(g); return g; }
  function flush(parent=root){ let n=0; for(const e of BAT.values()){ const geo=e.list.length>1 ? mergeGeometries(e.list,false) : e.list[0]; if(!geo){ console.warn('[devcity] gộp lỗi', e.mat.type, e.dist); continue; }
      geo.computeBoundingSphere(); const m=new THREE.Mesh(geo, e.mat); /* gốc (0,0,0): batchStatic gộp tiếp cùng vật liệu → ít lượt vẽ (mục tiêu ≤ 150/khu) */ m.castShadow=!e.mat.transparent && !e.mat.userData.noShadow; m.receiveShadow=true; m.name='dc:'+e.dist; m.userData.noFar=true; parent.add(m); n++; }
    BAT.clear(); return n; }
  const M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), E=new THREE.Euler();
  const xf=(g,x=0,y=0,z=0,ry=0,rx=0,rz=0,sx=1,sy=1,sz=1)=>{ E.set(rx,ry,rz,'YXZ'); Q.setFromEuler(E); M4.compose(new V3(x,y,z), Q, new V3(sx,sy,sz)); return g.applyMatrix4(M4); };
  const rb=(w,h,d,r=.08,s=2)=>AK.roundedBox(w,h,d,r,s).clone();     // hộp bo cạnh (bản sao – hình gốc dùng chung trong archKit)
  const cyl=(r0,r1,h,n=16,open=false)=>new THREE.CylinderGeometry(r0,r1,h,n,1,open);
  // khối nối 2 điểm (dầm, cột xiên, dây cáp): hình trụ/hộp đặt dọc đoạn a→b
  const beam=(geo, a, b)=>{ const d=new V3().subVectors(b,a), L=d.length(); geo.scale(1,L,1); geo.translate(0,L/2,0); Q.setFromUnitVectors(new V3(0,1,0), d.normalize()); M4.compose(a, Q, new V3(1,1,1)); return geo.applyMatrix4(M4); };
  // bộ InstancedMesh đơn giản (vị trí, xoay y, tỉ lệ)
  function inst(geo, mat, {shadow=true, dyn=false}={}){ const L=[]; return { L, add(x,y,z,ry=0,s=1,sy){ L.push([x,y,z,ry,s,sy??s]); },
    build(parent=root){ if(!L.length) return null; const im=new THREE.InstancedMesh(geo, mat, L.length); const p=new V3(), sc=new V3();
      L.forEach(([x,y,z,ry,s,sy],i)=>{ E.set(0,ry,0); Q.setFromEuler(E); M4.compose(p.set(x,y,z), Q, sc.set(s,sy,s)); im.setMatrixAt(i,M4); });
      im.castShadow=shadow; im.receiveShadow=true; im.computeBoundingSphere(); if(dyn) im.userData.dynamic=true; parent.add(im); return im; } }; }

  /* ============================== VẬT LIỆU ============================== */
  const canvas=(w,h,draw,srgb=true)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); if(srgb) t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=8; return t; };
  const std=o=>new THREE.MeshStandardMaterial(o);
  const MAT={
    concrete: std({map:canvas(256,256,(g,w,h)=>{ g.fillStyle='#bdbab2'; g.fillRect(0,0,w,h); for(let i=0;i<5000;i++){ const v=150+R()*80|0; g.fillStyle=`rgba(${v},${v},${v-6},.22)`; g.fillRect(R()*w,R()*h,1+R()*3,1+R()*2); } g.fillStyle='rgba(0,0,0,.1)'; for(let y=0;y<h;y+=64) g.fillRect(0,y,w,2); }), roughness:.88}),
    stone: AK.makeStoneMaterial({col:'#bfb5a3', joint:'#7f776b', blockW:110, blockH:52, seed:11}),
    rock: AK.makeStoneMaterial({col:'#8b8376', joint:'#5d574e', blockW:150, blockH:90, seed:12, rough:.95}),
    wood: AK.makeWoodMaterial({col:'#6b3d1f', plank:34, seed:13}),
    woodDark: AK.makeWoodMaterial({col:'#3f2614', plank:30, seed:14}),
    red: std({color:0xa82a1f, roughness:.5}),
    gold: std({color:0xe2b24a, roughness:.28, metalness:1}),
    white: std({color:0xf1efe9, roughness:.45}),
    steel: std({color:0xc9d1d9, roughness:.25, metalness:.9}),
    dark: std({color:0x2b2f36, roughness:.6, metalness:.3}),
    roofDark: std({color:0x3a3f47, roughness:.7, metalness:.2}),
    tunnel: std({map:canvas(256,256,(g,w,h)=>{ g.fillStyle='#d9d6cc'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(0,0,0,.22)'; for(let x=0;x<w;x+=32){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); } for(let y=0;y<h;y+=16){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); } }), roughness:.55}),
    glass: new THREE.MeshPhysicalMaterial({color:0xbfe2f2, roughness:.05, metalness:.1, transparent:true, opacity:.35, depthWrite:false, side:THREE.DoubleSide}),
    water: new THREE.MeshPhysicalMaterial({color:0x2a7f98, roughness:.08, metalness:0, transparent:true, opacity:.88, clearcoat:.6}),
    pool: new THREE.MeshPhysicalMaterial({color:0x35c6e6, roughness:.05, transparent:true, opacity:.9, clearcoat:1}),
    led: std({color:0x0e7bff, emissive:0x2a8cff, emissiveIntensity:1.8, roughness:.4}),
    ledWarm: std({color:0xffc56a, emissive:0xffa63a, emissiveIntensity:1.2, roughness:.4}),
    paving: AK.makeStoneMaterial({col:'#cfc8bb', joint:'#a49c8d', blockW:64, blockH:64, seed:15, rough:.8}),
    leaf: std({color:0x3f7f34, roughness:.85}), leaf2: std({color:0x2f6a3a, roughness:.85}), bark: std({color:0x5a4030, roughness:.9}),
  };
  for(const k of ['glass','water','pool','led','ledWarm']) MAT[k].userData.noShadow=true;
  MAT.concrete.side=THREE.DoubleSide; MAT.tunnel.side=THREE.DoubleSide;   // khối quét theo tuyến (bản cầu, dầm, vòm hầm): không phụ thuộc chiều dựng mặt
  MAT.paving.map.repeat.set(1,1);
  const FAC={   // mặt tiền PBR (archKit): ô = cols gian × rows tầng
    glass: AK.makePBRFacade({cols:6, rows:4, frameCol:'#8fa0b0', glassCol:'#2f5576', wall:'#8fa0b0', mullionW:4, litProb:.5, seed:21, tileW:12, tileH:12.8}),
    office: AK.makePBRFacade({cols:5, rows:4, frameCol:'#c9c4bb', glassCol:'#33506a', wall:'#d7d2c8', litProb:.45, seed:22, tileW:12.5, tileH:12.8}),
    resi: AK.makePBRFacade({cols:4, rows:4, frameCol:'#e9e4da', glassCol:'#3d5a70', wall:'#efe9df', balcony:true, litProb:.55, seed:23, tileW:12, tileH:12}),
    warm: AK.makePBRFacade({cols:4, rows:4, frameCol:'#b98d5a', glassCol:'#3a4c5c', wall:'#d9b98c', litProb:.6, seed:24, litCol:'#ffc77a', tileW:12, tileH:12.8}),
    dark: AK.makePBRFacade({cols:6, rows:4, frameCol:'#2b3138', glassCol:'#1b2c3c', wall:'#2b3138', mullionW:3, litProb:.5, seed:25, tileW:12, tileH:12.8}),
  };
  const roadTex=lanes=>canvas(256,512,(g,w,h)=>{ g.fillStyle='#3b3d41'; g.fillRect(0,0,w,h); for(let i=0;i<6000;i++){ const v=40+R()*50|0; g.fillStyle=`rgba(${v},${v},${v+3},.5)`; g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2); }
    g.fillStyle='#e9e6dc'; g.fillRect(w*.035,0,5,h); g.fillRect(w*.965-5,0,5,h);
    g.fillStyle='#e8b923'; g.fillRect(w/2-7,0,4,h); g.fillRect(w/2+3,0,4,h);
    if(lanes>2){ g.fillStyle='#e9e6dc'; for(const u of [.27,.73]) for(let y=0;y<h;y+=128) g.fillRect(w*u-2,y,4,64); } });
  MAT.road2=std({map:roadTex(2), roughness:.9}); MAT.road4=std({map:roadTex(4), roughness:.9});

  /* ============================== ĐỊA HÌNH ============================== */
  const shoreD=x=>x<178 ? 192 : x<206 ? lerp(192,158,ss(178,206,x)) : 158+2.5*Math.sin(x*.031);   // d = −z của mép bờ sông
  const c12=x=>x<250 ? 230 : x<275 ? lerp(230,214,ss(250,275,x)) : 214+4*Math.sin(x*.021);       // chân vách T1→T2 (phía Tây lùi vào nhường phố cổ)
  const c23=x=>440+5*Math.sin(x*.017+1)*ss(35,60,Math.abs(x-450)), c34=x=>712+6*Math.sin(x*.013+2);
  const VAL={x:280, d:310, r:50};                                   // lòng chảo thung lũng (nút giao xoắn ốc)
  const LAKE={x:560, d:600, rx:65, rz:42, y:51.6};                  // hồ Thiên Cảnh
  const PA={x:720, d:675, top:72, r:22};                            // đỉnh A – bảo tháp
  const PB={x:785, d:790, top:98, r:22};                            // đỉnh B – tượng Phật
  const TUN={x0:440, x1:460, d0:440, d1:663, dOpen:605, y0:24, y1:52};   // hầm đôi: leo 12% từ T2 lên T3, đoạn cuối là hào đào hở
  const tunY=d=>TUN.y0+(TUN.y1-TUN.y0)*clamp((d-TUN.d0)/(TUN.d1-TUN.d0),0,1);
  const abx=PB.x-PA.x, abd=PB.d-PA.d, abL=Math.hypot(abx,abd), abu=[abx/abL, abd/abL];          // hướng A → B
  function baseH(x,d){
    // vách T2→T3 dựng đứng quanh cửa hầm (x 415–485) để cửa hầm áp sát vách
    const kT=1-ss(18,34,Math.abs(x-450)), s23=lerp(ss(c23(x), c23(x)+28, d), ss(441,447,d), kT);
    let h=Y1+(Y2-Y1)*ss(c12(x), c12(x)+22, d)+(Y3-Y2)*s23+(Y4-Y3)*ss(c34(x), c34(x)+30, d);
    // cao nguyên Tây +46 sau phố cổ (vách gần như dựng đứng 2 → 46)
    const mw=(1-ss(222,236,x))*ss(232,242,d); h=Math.max(h, Y1+(YW-Y1)*mw);
    // đá lởm chởm trên vách
    const ck=(c,w)=>ss(c-2,c+4,d)*(1-ss(c+w-6,c+w+2,d));
    h+=(fbm(x*.08,d*.08,3)-.5)*5*Math.max(ck(c12(x),22), ck(c23(x),28)*(1-kT), ck(c34(x),30));
    // thung lũng sâu (+2) từ bờ sông vào lòng chảo nút giao
    const vm=Math.max(1-ss(VAL.r-10, VAL.r, Math.hypot(x-VAL.x, d-VAL.d)), (1-ss(24,32,Math.abs(x-285)))*(1-ss(300,318,d))); if(vm>0) h=lerp(h, Y1, vm);
    // hồ trên núi
    const le=Math.hypot((x-LAKE.x)/LAKE.rx, (d-LAKE.d)/LAKE.rz); if(le<1.2){ h=lerp(48.6, h, ss(.84,1.06,le)); const ri=Math.hypot(x-LAKE.x, d-LAKE.d); if(ri<17) h=Math.max(h, lerp(52.7, 48.6, ss(12,17,ri))); }   // đảo xanh giữa hồ
    // đỉnh A (đồi bảo tháp)
    const ra=Math.hypot(x-PA.x, d-PA.d); if(ra<75){ const ha=ra<PA.r ? PA.top : lerp(PA.top, Y3-2, ss(PA.r, 70, ra))+(fbm(x*.06,d*.06,3)-.5)*6*ss(PA.r+3,40,ra)*(1-ss(55,72,ra)); h=Math.max(h, ha); }
    // đỉnh B: sân 98; phía đỉnh A là vách → gờ đá 72 (chánh điện treo vách) → hẻm vực; phía khác thoải xuống thềm 4
    const bx=x-PB.x, bd=d-PB.d, br=Math.hypot(bx,bd); if(br<85){ const face=br>1 ? -(bx*abu[0]+bd*abu[1])/br : 0, sw=ss(.55,.85,face);
      const hRound=br<PB.r ? PB.top : lerp(PB.top, Y4, ss(PB.r, 50, br))+(fbm(x*.07,d*.07,3)-.5)*5*ss(PB.r+2,35,br);
      const hCliff=br<PB.r ? PB.top : br<27 ? lerp(PB.top,72,ss(PB.r,27,br)) : br<41 ? 72 : lerp(72,44,ss(41,54,br));
      const hb=lerp(hRound, hCliff, sw); h=lerp(Math.max(h,hb), hb, sw); }
    // hẻm vực giữa 2 đỉnh (sàn +44)
    { const px=x-PA.x, pd=d-PA.d, t=(px*abu[0]+pd*abu[1])/abL, lat=Math.abs(px*abu[1]-pd*abu[0]); if(t>.28 && t<.72 && lat<62){ const k=(1-ss(.1,.17,Math.abs(t-.5)))*(1-ss(42,62,lat)); h=lerp(h, 44, k); } }
    return h; }

  /* ---------- ĐƯỜNG XE (bám địa hình, dốc ≤ 10%) – mẫu mỗi 1 m: {x,z,y,w,emb,tun} ---------- */
  const ROADS=[], RS=[];
  function road(pts, w, opt={}){ const out=[]; for(let i=0;i<pts.length-1;i++){ const [x0,z0,y0]=pts[i], [x1,z1,y1]=pts[i+1], L=Math.hypot(x1-x0,z1-z0); for(let t=0;t<L;t+=1){ const k=t/L; out.push({x:x0+(x1-x0)*k, z:z0+(z1-z0)*k, y:y0+(y1-y0)*k}); } }
    const e=pts[pts.length-1]; out.push({x:e[0], z:e[1], y:e[2]}); const r={pts:out, w, lanes:opt.lanes||2, name:opt.name||'', emb:opt.emb??12, tunnel:!!opt.tunnel}; ROADS.push(r);
    for(const q of out){ const dd=-q.z; RS.push({...q, w, emb:r.emb, tun:r.tunnel && dd>TUN.d0-1 && dd<TUN.dOpen+1, cut:r.tunnel && dd>=TUN.dOpen-1}); } return r; }
  // MẠNG ĐƯỜNG KHÉP KÍN (V2_PLAN 2b: không đường cụt) – mọi tuyến nằm trong vòng hoặc dẫn ra cổng G5 (CBD) / G6 (Brain) / cầu dây văng (CBD)
  road([[220,-176,Y1],[700,-176,Y1]], 14, {lanes:4, name:'Đại lộ Bến Sông'});                                   // đầu Tây: cầu dây văng → CBD · đầu Đông: cầu G6 → Brain
  road([[600,-182,Y1],[622,-190,Y1+.4],[832,-240,Y2],[840,-252,Y2]], 10, {name:'Đường đèo Vách Đông', emb:8});
  road([[840,-252,Y2],[840,-300,Y2],[345,-300,Y2],[331,-301.9,22.73]], 12, {name:'Đại lộ Lưng Núi'});                               // đầu Tây: nhánh dốc vào nút giao xoắn ốc (+21,7)
  road([[600,-300,Y2],[600,-395,Y2],[365,-395,Y2],[365,-300,Y2]], 9, {name:'Phố Bệnh viện – Lý Tử Bá'});         // vòng Lưng Núi Tây (cắt ngang đường hầm)
  road([[300,-176,Y1],[300,-246,Y1],[293,-266,Y1],[281,-274,Y1]], 10, {name:'Đường Thung lũng'});                 // → chân nút giao xoắn ốc
  road([[450,-300,Y2],[450,-430,Y2],[450,-663,Y3],[450,-700,Y3]], 20, {lanes:4, name:'Hầm đôi Nam Sơn', tunnel:true, emb:2.5});
  road([[330,-490,Y3],[650,-490,Y3],[650,-700,Y3],[330,-700,Y3],[330,-490,Y3]], 12, {name:'Vành đai Cao nguyên'});
  road([[214,-246,YW],[178,-252,YW],[176,-428,YW],[222,-482,Y3],[330,-490,Y3]], 10, {name:'Đại lộ Giải Phóng'});
  road([[214,-246,YW],[216,-430,YW],[222,-482,Y3]], 9, {name:'Phố Cao nguyên Tây', emb:4});                       // khép vòng cao nguyên Tây
  road([[650,-700,Y3],[602,-708,Y3+.3],[262,-758,Y4],[252,-760,Y4]], 10, {name:'Đường đèo Mây Trắng', emb:8});
  road([[252,-760,Y4],[262,-768,Y4],[452,-768,Y4],[462,-760,Y4],[452,-752,Y4],[262,-752,Y4],[252,-760,Y4]], 10, {name:'Vòng đón khách Sân bay'});
  road([[650,-600,Y3],[702,-597,Y3]], 8, {name:'Đường lên chùa'});
  { const c=[702+9,-596], pts=[]; for(let i=0;i<=24;i++){ const a=Math.PI+i/24*TAU; pts.push([c[0]+Math.cos(a)*9, c[1]+Math.sin(a)*9, Y3]); } road(pts, 7, {name:'Vòng xuyến chân chùa'}); }
  const RGRID=new Map(), rk=(x,z)=>Math.floor(x/8)+','+Math.floor(z/8);
  RS.forEach((q,i)=>{ const k=rk(q.x,q.z); if(!RGRID.has(k)) RGRID.set(k,[]); RGRID.get(k).push(i); });
  // điểm đường gần nhất: [cho hình (bỏ đoạn trong hầm), cho va chạm]
  function nearRoad2(x,z,maxD=24){ let bv=maxD*maxD, bp=bv, v=null, p=null; const cx=Math.floor(x/8), cz=Math.floor(z/8), rr=Math.ceil(maxD/8);
    for(let a=-rr;a<=rr;a++) for(let b=-rr;b<=rr;b++){ const l=RGRID.get((cx+a)+','+(cz+b)); if(!l) continue; for(const i of l){ const q=RS[i], dd=(q.x-x)**2+(q.z-z)**2; if(dd<bp){ bp=dd; p=q; } if(!q.tun && dd<bv){ bv=dd; v=q; } } }
    return [v ? {d:Math.sqrt(bv), q:v} : null, p ? {d:Math.sqrt(bp), q:p} : null]; }
  const carve=(h, r)=>{ if(!r) return h; const half=r.q.w/2+.8, B=r.q.emb; if(r.d<half) return r.q.y; if(r.d<half+B) return lerp(r.q.y, h, ss(half, half+B, r.d)); return h; };
  // bậc đá lên đồi bảo tháp (va chạm = dốc trơn, hình = bậc thang)
  const STAIR={x0:716, z0:-604, x1:720, z1:-652, y0:Y3, y1:PA.top, w:7};
  function stairAt(x,z){ const dx=STAIR.x1-STAIR.x0, dz=STAIR.z1-STAIR.z0, L2=dx*dx+dz*dz, t=((x-STAIR.x0)*dx+(z-STAIR.z0)*dz)/L2; if(t<-.03 || t>1.03) return null; const px=STAIR.x0+dx*t, pz=STAIR.z0+dz*t; return {d:Math.hypot(x-px,z-pz), y:lerp(STAIR.y0,STAIR.y1,clamp(t,0,1)), t}; }
  // nền phẳng cho công trình (x0..x1, z0..z1 theo toạ độ thế giới)
  const PADS=[
    {x0:358, x1:402, z0:-438, z1:-402, y:Y2, b:5},     // Dev Residency Tower
    {x0:486, x1:604, z0:-288, z1:-244, y:Y2, b:5},     // trường học + sân thể thao
    {x0:690, x1:752, z0:-284, z1:-242, y:Y2, b:5},     // khách sạn
    {x0:640, x1:720, z0:-398, z1:-338, y:Y2, b:5},     // bệnh viện
    {x0:772, x1:830, z0:-368, z1:-322, y:Y2, b:5},     // cứu hoả
    {x0:760, x1:812, z0:-436, z1:-406, y:Y2, b:5},     // ga Đông Sơn
  ];
  function hf(x,z,phys){ const d=-z, sd=shoreD(x);
    if(x<180 && z>-186) return null;                                  // trùng góc đảo Abyssal → nhường
    if(d<sd-.5) return lerp(-1.4,-6,clamp((sd-.5-d)/16,0,1));         // lòng sông
    let h=baseH(x,d);
    for(const p of PADS){ const k=Math.min(x-p.x0, p.x1-x, z-p.z0, p.z1-z); if(k>-p.b) h=lerp(h, p.y, ss(-p.b, 0, k)); }
    const [rv, rp]=nearRoad2(x,z); h=carve(h, phys ? rp : rv);
    if(!phys && rp && rp.q.tun && rp.d<rp.q.w/2+.8){ /* trên nóc hầm: giữ hình mặt núi */ }
    const s=stairAt(x,z); if(s){ const half=STAIR.w/2+.6; if(s.d<half) h=s.y; else if(s.d<half+5) h=lerp(s.y, h, ss(half, half+5, s.d)); }
    if(d<sd+.6) h=Math.min(h, lerp(-1.4, Y1, ss(sd-.5, sd+.5, d)));    // kè bờ sông thẳng đứng
    return h; }

  const RES=2.5, NX=Math.round((X1-X0)/RES)+1, NZ=Math.round((Z1-Z0)/RES)+1, HP=new Float32Array(NX*NZ), HV=new Float32Array(NX*NZ);
  for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const x=X0+i*RES, z=Z0+j*RES, k=j*NX+i, hp=hf(x,z,true); HP[k]=hp===null ? NaN : hp; const hv=hf(x,z,false); HV[k]=hv===null ? NaN : hv; }
  const sample=(G,x,z)=>{ const fx=(x-X0)/RES, fz=(z-Z0)/RES; if(fx<0||fz<0||fx>=NX-1||fz>=NZ-1) return null; const i=Math.floor(fx), j=Math.floor(fz), tx=fx-i, tz=fz-j, a=G[j*NX+i], b=G[j*NX+i+1], c=G[(j+1)*NX+i], d=G[(j+1)*NX+i+1];
    if(a!==a || b!==b || c!==c || d!==d) return null; return tx+tz<=1 ? a+(b-a)*tx+(c-a)*tz : d+(c-d)*(1-tx)+(b-d)*(1-tz); };
  const hAt=(x,z)=>sample(HP,x,z), hVis=(x,z)=>sample(HV,x,z);
  EXTL.push({x0:X0, x1:X1-RES, z0:Z0, z1:Z1-RES, h:hAt, name:'DEV CITY · TRÙNG KHÁNH 8D'});

  // lưới hình địa hình (màu theo độ dốc/độ cao), chừa lỗ ở 2 cửa hầm
  { const pos=new Float32Array(NX*NZ*3), col=new Float32Array(NX*NZ*3), uv=new Float32Array(NX*NZ*2), c=new THREE.Color();
    const GR=new THREE.Color(0x5d8f3c), GR2=new THREE.Color(0x7fa94a), FOREST=new THREE.Color(0x2f5a2c), ROCK=new THREE.Color(0x857f73), ROCK2=new THREE.Color(0x6f675c), PAVE=new THREE.Color(0xc9c2b4), MUD=new THREE.Color(0x5a503f), SAND=new THREE.Color(0xd7c7a0), RIVER=new THREE.Color(0x24515a);
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const k=j*NX+i, x=X0+i*RES, z=Z0+j*RES, d=-z; let h=HV[k]; if(h!==h) h=-6; pos[k*3]=x; pos[k*3+1]=h; pos[k*3+2]=z; uv[k*2]=x/6; uv[k*2+1]=z/6;
      const hl=HV[j*NX+Math.max(i-1,0)], hr=HV[j*NX+Math.min(i+1,NX-1)], hd=HV[Math.max(j-1,0)*NX+i], hu=HV[Math.min(j+1,NZ-1)*NX+i];
      const slope=Math.hypot(((hr===hr?hr:h)-(hl===hl?hl:h))/(2*RES), ((hu===hu?hu:h)-(hd===hd?hd:h))/(2*RES)), n=fbm(x*.07,z*.07,2);
      c.copy(GR).lerp(GR2, n*.8);
      const peak=Math.max(1-ss(30,70,Math.hypot(x-PA.x,d-PA.d)), 1-ss(30,75,Math.hypot(x-PB.x,d-PB.d))); c.lerp(FOREST, peak*.7);
      if(d<c12(x)+2 && h<4) c.lerp(PAVE, .85);                              // bờ sông T1: lát đá
      c.lerp(ROCK, ss(.75,1.25,slope)*.9); c.lerp(ROCK2, ss(1.6,2.6,slope)*.6*n);
      if(h<1.2) c.lerp(h<-.6 ? RIVER : SAND, ss(1.2,-.4,h));
      if(Math.hypot((x-LAKE.x)/LAKE.rx,(d-LAKE.d)/LAKE.rz)<.98 && h<51.4) c.lerp(MUD, .6);
      c.offsetHSL(0,0,(n-.5)*.06); col[k*3]=c.r; col[k*3+1]=c.g; col[k*3+2]=c.b; }
    const hole=(x,z)=>{ const d=-z; return x>TUN.x0-1 && x<TUN.x1+1 && ((d>436 && d<448) || (d>600 && d<609)); };
    const idx=[]; for(let j=0;j<NZ-1;j++) for(let i=0;i<NX-1;i++){ const a=j*NX+i, b=a+1, cc=a+NX, d=cc+1;
      if(HV[a]!==HV[a] && HV[b]!==HV[b] && HV[cc]!==HV[cc] && HV[d]!==HV[d]) continue;
      if(hole(X0+(i+.5)*RES, Z0+(j+.5)*RES)) continue; idx.push(a,cc,b, b,cc,d); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('color', new THREE.BufferAttribute(col,3)); g.setAttribute('uv', new THREE.BufferAttribute(uv,2));
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(idx),1)); g.computeVertexNormals(); g.computeBoundingSphere();
    const det=canvas(256,256,(x,w,h)=>{ x.fillStyle='#c6c6c6'; x.fillRect(0,0,w,h); for(let i=0;i<9000;i++){ const v=150+R()*105|0; x.fillStyle=`rgba(${v},${v},${v},.5)`; x.fillRect(R()*w,R()*h,1+R()*3,1+R()*2); } });
    const terr=new THREE.Mesh(g, std({vertexColors:true, map:det, roughness:.95})); terr.receiveShadow=true; terr.userData.dynamic=true; terr.userData.noFar=true; terr.name='dc:terrain'; root.add(terr); }

  /* ============================== MỎM ĐÁ LỞM CHỞM TRÊN VÁCH (1 lượt vẽ) ============================== */
  { const rg=new THREE.IcosahedronGeometry(1, 1), p=rg.attributes.position; for(let i=0;i<p.count;i++){ const v=new V3().fromBufferAttribute(p,i), k=.72+.5*vn(v.x*2.3+5, v.z*2.1+v.y*1.7); p.setXYZ(i, v.x*k*1.3, v.y*k*.8, v.z*k); } rg.computeVertexNormals();
    const rocks=inst(rg, MAT.rock); let n=0;
    for(let j=2;j<NZ-2 && n<1400;j+=2) for(let i=2;i<NX-2;i+=2){ const k=j*NX+i, h=HV[k]; if(h!==h || h<3) continue; const x=X0+i*RES, z=Z0+j*RES, d=-z;
      const sl=Math.hypot((HV[k+1]-HV[k-1])/(2*RES), (HV[k+NX]-HV[k-NX])/(2*RES)); if(!(sl>1.05) || hash(i*7+3, j*13+1)>.16) continue;
      if(x>136 && x<244 && d>186 && d<250) continue;                              // phố cổ
      if(x>415 && x<485 && d>430 && d<470) continue;                              // vách cửa hầm (đã ốp đá)
      const [rv]=nearRoad2(x,z); if(rv && rv.d<rv.q.w/2+3) continue;
      const s=1.6+hash(i,j)*3.4; rocks.add(x+(hash(j,i)-.5)*2, h-s*.25, z+(hash(i+9,j)-.5)*2, hash(i+3,j+5)*TAU, s, s*(.7+hash(j+1,i)*.6)); n++; }
    rocks.build(); }

  /* ============================== ĐƯỜNG: mặt nhựa + đèn đường + hộ lan ============================== */
  const lampPole=inst(cyl(.09,.13,7.2,8), MAT.dark), lampHead=inst(rb(1.3,.18,.42,.08,1), (()=>{ const m=std({color:0xfff2d0, emissive:0xffd9a0, roughness:.4}); m.emissiveIntensity=.2; return m; })(), {shadow:false});
  const lampMat=lampHead; const NIGHTL=[];
  const railPost=inst(rb(.22,.8,.22,.05,1), MAT.steel), railBeam=[];
  for(const r of ROADS){ const pts=r.pts, N=pts.length; if(N<2) continue; const mat=r.lanes>2 ? MAT.road4 : MAT.road2, pos=[], uv=[], idx=[]; let acc=0;
    for(let i=0;i<N;i++){ const a=pts[Math.max(0,i-1)], b=pts[Math.min(N-1,i+1)], tx=b.x-a.x, tz=b.z-a.z, tl=Math.hypot(tx,tz)||1, nx=-tz/tl, nz=tx/tl; if(i) acc+=Math.hypot(pts[i].x-pts[i-1].x, pts[i].z-pts[i-1].z);
      const y=pts[i].y+.06; pos.push(pts[i].x+nx*r.w/2, y, pts[i].z+nz*r.w/2, pts[i].x-nx*r.w/2, y, pts[i].z-nz*r.w/2); uv.push(0, acc/r.w*.5, 1, acc/r.w*.5);
      if(i<N-1){ const q=i*2; idx.push(q,q+2,q+1, q+1,q+2,q+3); }
      // đèn đường mỗi 26 m (so le 2 bên), không đặt trong hầm
      const dd=-pts[i].z; const inTun=r.tunnel && dd>TUN.d0-3 && dd<TUN.dOpen+3;
      if(!inTun && i%26===13){ const side=(Math.floor(i/26)%2)?1:-1, lx=pts[i].x+nx*side*(r.w/2+.9), lz=pts[i].z+nz*side*(r.w/2+.9), gy=hAt(lx,lz); if(gy!==null && Math.abs(gy-pts[i].y)<1.2){ const ang=Math.atan2(nz*side, -nx*side); lampPole.add(lx,gy+3.6,lz); lampHead.add(lx-nx*side*.7, gy+7.1, lz-nz*side*.7, ang); } }
      // hộ lan bên phía vực (mặt đất ngoài mép đường thấp hơn > 1,5 m)
      if(!inTun && i%3===0) for(const side of [-1,1]){ const ox=pts[i].x+nx*side*(r.w/2+1.4), oz=pts[i].z+nz*side*(r.w/2+1.4), gy=hAt(ox,oz); if(gy!==null && gy<pts[i].y-1.5){ const px=pts[i].x+nx*side*(r.w/2+.35), pz=pts[i].z+nz*side*(r.w/2+.35); railPost.add(px, pts[i].y+.4, pz); railBeam.push({x:px, z:pz, y:pts[i].y, i, side, r}); } } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); put(mat, g, 'road'); }
  // thanh hộ lan nối các cột liền nhau + va chạm
  for(let k=1;k<railBeam.length;k++){ const a=railBeam[k-1], b=railBeam[k]; if(a.r!==b.r || a.side!==b.side || b.i-a.i!==3) continue;
    put(MAT.steel, beam(rb(.06,1,.32,.03,1), new V3(a.x,a.y+.72,a.z), new V3(b.x,b.y+.72,b.z)), 'road'); addSeg(a.x,a.z,b.x,b.z,.2, Math.min(a.y,b.y)-.5, Math.max(a.y,b.y)+2, 'Hộ lan đường đèo – vực sâu phía dưới'); }
  lampPole.build(); const lampIM=lampHead.build(); if(lampIM){ lampIM.material.userData.night=1; NIGHTL.push(lampIM.material); }

  /* ============================== KÈ BỜ SÔNG (đá xếp) + lan can ============================== */
  const QGAP=[[210,230],[376,392],[692,708]], inGap=(a,b)=>QGAP.some(([g0,g1])=>b>g0 && a<g1);
  { const pts=[]; for(let x=206;x<=848;x+=4) pts.push([x, -shoreD(x)]); for(let k=1;k<pts.length;k++){ const [ax,az]=pts[k-1], [bx,bz]=pts[k];
      const L=Math.hypot(bx-ax,bz-az), g=rb(L+.1, 3.6, 1.2, .1, 1); xf(g, (ax+bx)/2, Y1-1.8+.02, (az+bz)/2-.25, -Math.atan2(bz-az,bx-ax)); put(MAT.stone, g, 'river');
      if(!inGap(ax,bx)) addSeg(ax,az+.4,bx,bz+.4,.25, Y1-1, Y1+2, 'Kè bờ sông – lan can'); }
    const posts=inst(cyl(.06,.06,1.05,8), MAT.steel); for(let x=208;x<=846;x+=2) if(!inGap(x-.5,x+.5)) posts.add(x, Y1+.52, -shoreD(x)-.6);
    posts.build(); for(let k=1;k<pts.length;k++){ const [ax,az]=pts[k-1], [bx,bz]=pts[k]; if(inGap(ax,bx)) continue; put(MAT.steel, beam(cyl(.05,.05,1,6), new V3(ax,Y1+1.05,az-.6), new V3(bx,Y1+1.05,bz-.6)), 'river'); } }

  /* ============================== HỒ THIÊN CẢNH (mặt nước +51,6) ============================== */
  { const g=new THREE.CircleGeometry(1, 64); g.rotateX(-Math.PI/2); g.scale(LAKE.rx*1.02, 1, LAKE.rz*1.02); g.translate(LAKE.x, LAKE.y, -LAKE.d); const m=new THREE.Mesh(g, MAT.water); m.receiveShadow=true; m.userData.dynamic=true; root.add(m); }

  const kit={W, ctx, root, MAT, FAC, put, flush, xf, rb, cyl, beam, inst, canvas, std, ss, fbm, hash, R, hAt, hVis, ROADS, RS, TUN, tunY, VAL, LAKE, PA, PB, abu, STAIR, PADS, shoreD, c12, c23, c34, Y1, Y2, Y3, Y4, YW, NIGHTL};

  /* ============================== GIAO THÔNG TRÊN CAO ============================== */
  // mặt cầu/đường trên cao theo dãy điểm {x,z,y}: bản bê tông + mặt nhựa + 2 tường chắn + sàn đứng được + va chạm + trụ đỡ
  const DECKS=[];
  function deck(path, w, dist, o={}){ const N=path.length; DECKS.push({name:o.name||o.msg||dist, a:path[0], b:path[N-1], path}); const pos=[], uv=[], idx=[], side=[]; let acc=0; const th=o.th??1.1, par=o.parapet??1.05;
    const gapAt=(i,s)=>{ if(!o.gap) return false; const p=path[Math.min(N-1,i)], [nx,nz]=nrm(Math.min(N-1,i)), ex=p.x+nx*s*(w/2+.45), ez=p.z+nz*s*(w/2+.45); return o.gap.some(g=>Math.hypot(ex-g.x,ez-g.z)<g.r); };
    const nrm=i=>{ const a=path[Math.max(0,i-1)], b=path[Math.min(N-1,i+1)], tx=b.x-a.x, tz=b.z-a.z, tl=Math.hypot(tx,tz)||1; return [-tz/tl, tx/tl]; };
    const slabP=[], slabI=[];
    for(let i=0;i<N;i++){ const p=path[i], [nx,nz]=nrm(i); if(i) acc+=Math.hypot(p.x-path[i-1].x, p.z-path[i-1].z);
      pos.push(p.x+nx*w/2, p.y+.09, p.z+nz*w/2, p.x-nx*w/2, p.y+.09, p.z-nz*w/2); uv.push(0, acc/w*.5, 1, acc/w*.5);
      // mặt cắt bản (ngoài mép, dưới đáy) + tường chắn
      const W2=w/2+.45, pL=gapAt(i,1)?.06:par, pR=gapAt(i,-1)?.06:par; for(const [ox,oy] of [[W2,0],[W2,pL],[W2-.35,pL],[W2-.35,.05],[-W2+.35,.05],[-W2+.35,pR],[-W2,pR],[-W2,0],[-W2+.6,-th],[W2-.6,-th]]) slabP.push(p.x+nx*ox, p.y+oy, p.z+nz*ox);
      if(i<N-1){ const q=i*2; idx.push(q,q+2,q+1, q+1,q+2,q+3); const s=10, a=i*s, b=(i+1)*s; for(let k=0;k<s;k++){ const k2=(k+1)%s; slabI.push(a+k, b+k, a+k2, a+k2, b+k, b+k2); } } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); put(o.mat || (w>11 ? MAT.road4 : MAT.road2), g, dist);
    const sg=new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(slabP,3)); sg.setIndex(slabI); put(MAT.concrete, sg, dist);   // pháp tuyến phẳng tính sau khi tách đỉnh
    // va chạm: sàn mỗi ~3 m (bậc ≤ 0,3 m) + tường 2 bên   (addPlat: rot = hướng đoạn → nửa dài hd nằm dọc tuyến)
    if(o.collide!==false){ for(let i=0;i<N-1;i+=3){ const a=path[i], b=path[Math.min(N-1,i+3)], mx=(a.x+b.x)/2, mz=(a.z+b.z)/2, L=Math.hypot(b.x-a.x,b.z-a.z)+.4, ang=Math.atan2(b.x-a.x,b.z-a.z);
        addPlat(mx, mz, ang, w/2+.1, L/2, Math.max(a.y,b.y)); }
      for(let i=0;i<N-1;i+=2){ const a=path[i], b=path[Math.min(N-1,i+2)], [nx,nz]=nrm(i), [mx2,mz2]=nrm(Math.min(N-1,i+2)); for(const s of [1,-1]){ if(gapAt(i,s) || gapAt(i+2,s)) continue; addSeg(a.x+nx*s*(w/2+.2), a.z+nz*s*(w/2+.2), b.x+mx2*s*(w/2+.2), b.z+mz2*s*(w/2+.2), .25, Math.min(a.y,b.y)-.3, Math.max(a.y,b.y)+1.6, o.msg||'Tường chắn cầu cạn'); } } }
    // trụ đỡ
    if(o.piers!==false){ const every=o.every||14; let last=-1e9, s=0; for(let i=0;i<N;i++){ if(i) s+=Math.hypot(path[i].x-path[i-1].x, path[i].z-path[i-1].z); if(s-last<every) continue; last=s;
        const p=path[i], gy=hAt(p.x,p.z); if(gy===null || p.y-th-gy<1.2) continue; const H=p.y-th-gy, [nx,nz]=nrm(i);
        const col=cyl(.75,.85,H+.4,16); xf(col, p.x, gy+H/2-.2, p.z); put(MAT.concrete, col, dist);
        const cap=rb(w*.8, .9, 1.8, .2, 1); xf(cap, p.x, p.y-th-.35, p.z, Math.atan2(nx,nz)); put(MAT.concrete, cap, dist); W.circles && W.circles.push({x:p.x, z:p.z, r:.9, y0:gy-1, y1:gy+H}); } }
    return {path}; }

  // ----- NÚT GIAO XOẮN ỐC 5 TẦNG (thung lũng, 2 → 52 m, bán kính 36) + cầu cạn lên cao nguyên -----
  const SP={x:VAL.x, z:-VAL.d, r:36, a0:Math.PI/2, turns:4.5, y0:Y1, y1:Y3};
  const spiral=[]; { const A=SP.turns*TAU, n=Math.round(A*SP.r/2); for(let i=0;i<=n;i++){ const a=SP.a0+A*i/n; spiral.push({x:SP.x+SP.r*Math.cos(a), z:SP.z+SP.r*Math.sin(a), y:SP.y0+(SP.y1-SP.y0)*i/n}); } }
  const MERGE={a:.163}; MERGE.x=SP.x+(SP.r+4.5)*Math.cos(MERGE.a); MERGE.z=SP.z+(SP.r+4.5)*Math.sin(MERGE.a); MERGE.y=SP.y0+(SP.y1-SP.y0)*((4*Math.PI+MERGE.a-SP.a0)/(SP.turns*TAU));
  deck(spiral, 9, 'spiral', {piers:false, msg:'Tường chắn nút giao xoắn ốc', gap:[{x:MERGE.x, z:MERGE.z, r:5.6}]});
  { const ramp=[], A={x:331, z:-301.9, y:22.73}, B={x:MERGE.x+.4, z:MERGE.z, y:MERGE.y}, L=Math.hypot(B.x-A.x,B.z-A.z); for(let t=0;t<=L+.01;t+=2){ const k=Math.min(1,t/L); ramp.push({x:lerp(A.x,B.x,k), z:lerp(A.z,B.z,k), y:lerp(A.y,B.y,k)}); }
    deck(ramp, 9, 'spiral', {every:10, msg:'Tường chắn nhánh nhập nút giao'});
    const ra=Math.atan2(B.x-A.x, B.z-A.z); addPlat(MERGE.x, MERGE.z, ra, 4.6, 3.2, MERGE.y+.02); }   // sàn nối chồng lên mặt nút giao (không hở khe)
  // cột đỡ chung cho mọi tầng (16 cột quanh vòng, cao tới tầng trên cùng)
  for(let k=0;k<16;k++){ const a=k/16*TAU, x=SP.x+SP.r*Math.cos(a), z=SP.z+SP.r*Math.sin(a); let top=0; for(const p of spiral) if(Math.hypot(p.x-x,p.z-z)<1.5) top=Math.max(top,p.y);
    if(top<6) continue; const col=cyl(1.05,1.2,top-1.1-Y1,18); xf(col, x, Y1+(top-1.1-Y1)/2, z); put(MAT.concrete, col, 'spiral'); W.circles && W.circles.push({x, z, r:1.25});
    for(const p of spiral) if(Math.hypot(p.x-x,p.z-z)<1.2 && p.y>6){ const cap=rb(9,.8,2.2,.2,1); xf(cap, x, p.y-1.45, z, -a); put(MAT.concrete, cap, 'spiral'); } }
  const VIA=[]; { const pts=[[SP.x, SP.z-SP.r, Y3],[296,-350,Y3],[312,-362,Y3],[320,-382,Y3],[322,-402,Y3],[322,-470,Y3],[326,-484,Y3]]; for(let i=0;i<pts.length-1;i++){ const [x0,z0,y0]=pts[i], [x1,z1,y1]=pts[i+1], L=Math.hypot(x1-x0,z1-z0); for(let t=0;t<L;t+=2) VIA.push({x:x0+(x1-x0)*t/L, z:z0+(z1-z0)*t/L, y:y0}); } VIA.push({x:326, z:-484, y:Y3}); }
  deck(VIA, 9, 'spiral', {every:18, msg:'Tường chắn cầu cạn'});

  // ----- CẦU DÂY VĂNG 2 TẦNG (x = 220): tầng dưới +3,2 đường xe + vỉa hè (hạ thẳng xuống Đại lộ Bến Sông), tầng trên dầm hộp chở tàu điện một ray -----
  { const lo=[]; for(let d=121; d<=177; d+=2) lo.push({x:220, z:-d, y:d<140 ? lerp(.7, 2.6, ss(121,140,d)) : d<152 ? 2.6 : lerp(2.6, Y1, ss(152,170,d))}); deck(lo, 15, 'bridge', {every:12, th:.9, msg:'Lan can cầu dây văng'});
    const up=[]; for(let d=121; d<=152; d+=2) up.push({x:222, z:-d, y:10}); deck(up, 5.4, 'bridge', {mat:MAT.concrete, piers:false, collide:false, name:'rail: dầm tàu điện trên cầu'});
    // tháp chữ H cao 60 m giữa sông, 2 chân kẹp 2 tầng mặt cầu + dây văng toả xuống mép tầng dưới
    for(const s of [-1,1]){ put(MAT.concrete, beam(cyl(1.1,1.5,1,14), new V3(220+s*12, -2, -132), new V3(220+s*3.2, 58, -132)), 'bridge'); W.circles && W.circles.push({x:220+s*11.4, z:-132, r:1.6}); }
    put(MAT.concrete, xf(rb(8.4,8,3.2,.45,2), 220, 58, -132), 'bridge'); put(MAT.concrete, xf(rb(23.5,1.2,3,.3,1), 220, 8.15, -132), 'bridge');
    for(const d of [121,124,127,137,140,143,146,149]) for(const s of [-1,1]){ const a=new V3(220+s*3.4, 56.5-Math.abs(d-132)*.3, -132), b=new V3(220+s*8.1, 4.4, -d); put(MAT.steel, beam(cyl(.075,.075,1,6), a, b), 'bridge'); } }

  // ----- CẦU CỔNG: G5 (Dev City Nam ↔ CBD Bắc, x 384) · G6 (Dev City Đông Nam ↔ Brain Bắc, x 700 → (700, −100, +4)) -----
  const cbdY=(()=>{ const g=W.groundH ? W.groundH(384,-116) : .6; return (g>-.2 && g<3) ? g : .6; })();
  { const g5=[]; for(let d=169; d>=119; d-=2) g5.push({x:384, z:-d, y:lerp(Y1, cbdY+.05, ss(160,121,d))}); deck(g5, 12, 'bridge', {every:14, th:.8, msg:'Lan can cầu cổng Nam (sang CBD)'});
    const g6=[]; for(let d=177; d>=98; d-=2) g6.push({x:700, z:-d, y:d>158 ? Y1 : lerp(Y1, 4.05, ss(158,104,d))+1.2*Math.sin(Math.PI*clamp((158-d)/54,0,1))}); deck(g6, 12, 'bridge', {every:14, th:.9, msg:'Lan can cầu cổng Đông Nam (sang Brain Citadel)'}); }
  const GATES=[{key:'G5', x:384, z:-120, y:cbdY, to:'CBD Bắc'}, {key:'G6', x:700, z:-100, y:4, to:'Brain Citadel Bắc'}];

  // ----- TÀU ĐIỆN MỘT RAY "LIZIBA": dầm bê tông + trụ chữ T; tầng trên cầu dây văng → ga Bến Sông bắc ngang đại lộ → xuyên tầng 6–8 Dev Residency Tower (380, −420) ở +38,6 -----
  const MR=[[222,-121,11.4],[222,-150,11.4],[223,-168,11.8],[226,-186,12.4],[238,-199,13.2],[262,-212,14.8],[292,-228,17.8],[325,-248,21.6],[343,-276,26],[346,-300,31],[346,-360,34],[349,-398,37],[360,-416,38.6],[380,-420,38.6],[600,-420,38.6],[788,-420,38.6]];
  const mrCurve=new THREE.CatmullRomCurve3(MR.map(([x,z,y])=>new V3(x,y,z)), false, 'centripetal', .2), mrLen=mrCurve.getLength();
  const MRN=Math.ceil(mrLen/2), mrPts=mrCurve.getSpacedPoints(MRN);
  const sOf=(x,z)=>{ let best=0, bd=1e9; mrPts.forEach((p,i)=>{ const d=(p.x-x)**2+(p.z-z)**2; if(d<bd){ bd=d; best=i; } }); return best/MRN*mrLen; };
  { const pos=[], idx=[]; const prof=[[-.45,0],[.45,0],[.45,-1.4],[-.45,-1.4]];
    for(let i=0;i<=MRN;i++){ const p=mrPts[i], t=mrCurve.getTangentAt(i/MRN), nx=-t.z, nz=t.x, nl=Math.hypot(nx,nz)||1; for(const [o,dy] of prof) pos.push(p.x+nx/nl*o, p.y+dy, p.z+nz/nl*o);
      if(i<MRN){ const a=i*4, b=a+4; for(let k=0;k<4;k++){ const k2=(k+1)%4; idx.push(a+k,b+k,a+k2, a+k2,b+k,b+k2); } } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); put(MAT.concrete, g, 'monorail');
    let s=0; for(let i=0;i<=MRN;i+=10){ const p=mrPts[i], gy=hAt(p.x,p.z); if(gy===null) continue; const dd=-p.z; if(p.x>358 && p.x<402 && dd>402 && dd<438) continue;   // trong toà nhà: không cột
      const H=p.y-1.4-gy; if(H<1.5) continue; const t=mrCurve.getTangentAt(i/MRN); put(MAT.concrete, xf(cyl(.55,.7,H,12), p.x, gy+H/2, p.z), 'monorail'); put(MAT.concrete, xf(rb(3.2,.7,1.4,.15,1), p.x, p.y-1.75, p.z, Math.atan2(t.x,t.z)), 'monorail'); W.circles && W.circles.push({x:p.x, z:p.z, r:.75, y0:gy-1, y1:gy+H}); } }
  // ga: [tên, s trên tuyến, chỗ đứng chờ dưới đất, sàn ga]
  const ST=[{name:'Ga Bến Sông', key:'s1', s:sOf(224,-177), ground:{x:234, z:-163, y:Y1}, y:12.6},
            {name:'Ga Lý Tử Bá (trong Dev Residency Tower)', key:'s2', s:sOf(380,-420), ground:{x:380, z:-405.6, y:Y2}, y:39.2},
            {name:'Ga Đông Sơn', key:'s3', s:sOf(780,-420), ground:{x:780, z:-404, y:Y2}, y:39.2}];
  // sân ga S1 + S3 (S2 dựng cùng toà nhà ở devcity_landmarks.js) : sàn 2 bên dầm + mái + cột + thang máy
  for(const st of [ST[0], ST[2]]){ const p=mrCurve.getPointAt(st.s/mrLen), t=mrCurve.getTangentAt(st.s/mrLen), ang=Math.atan2(t.x,t.z), nx=Math.cos(ang), nz=-Math.sin(ang), L=50;
    for(const sd of [-1,1]){ const cx=p.x+nx*sd*3.4, cz=p.z+nz*sd*3.4; put(MAT.paving, xf(rb(3.6,.5,L,.12,1), cx, st.y-.25, cz, ang), 'monorail'); addPlat(cx, cz, ang, 1.8, L/2, st.y);
      addSeg(cx+nx*sd*1.75-Math.sin(ang)*L/2, cz+nz*sd*1.75-Math.cos(ang)*L/2, cx+nx*sd*1.75+Math.sin(ang)*L/2, cz+nz*sd*1.75+Math.cos(ang)*L/2, .2, st.y-.5, st.y+2, 'Lan can sân ga');
      for(let k=-2;k<=2;k++){ const ox=Math.sin(ang)*k*11, oz=Math.cos(ang)*k*11, px=cx+ox+nx*sd*1.4, pz=cz+oz+nz*sd*1.4, rr=nearRoad2(px,pz)[1]; if(rr && rr.d<rr.q.w/2+1) continue;   // không dựng cột giữa lòng đường
        const gy=hAt(px,pz)??st.y-8; put(MAT.steel, xf(cyl(.25,.25,st.y+4.6-gy,10), px, (st.y+4.6+gy)/2, pz), 'monorail'); W.circles && W.circles.push({x:px, z:pz, r:.35, y0:gy-1, y1:st.y-1}); } }
    put(MAT.white, xf(rb(12,.45,L+4,.2,2), p.x, st.y+4.8, p.z, ang), 'monorail'); put(MAT.glass, xf(rb(11.4,.08,L+3,.03,1), p.x, st.y+4.5, p.z, ang), 'monorail');
    // tháp thang máy kính từ mặt đất lên sân ga
    const ex=st.ground.x, ez=st.ground.z, gy=hAt(ex,ez)??st.ground.y; put(MAT.glass, xf(rb(3,st.y-gy+3,3,.2,2), ex, (st.y+gy+3)/2, ez+3.5), 'monorail'); put(MAT.white, xf(rb(3.4,.4,3.4,.12,1), ex, st.y+3.2, ez+3.5), 'monorail'); }
  // đoàn tàu 4 toa xanh – tím – cam – xanh
  const train=new THREE.Group(); train.name='devcity:monorail'; train.userData.dynamic=true; root.add(train);
  const CAR=11, GAP=.6, cars=[];
  { const winTex=canvas(512,128,(g,w,h)=>{ g.fillStyle='#fff'; g.fillRect(0,0,w,h); g.fillStyle='#1d2b38'; for(let x=24;x<w-24;x+=58) g.fillRect(x, 26, 44, 52); g.fillStyle='rgba(255,255,255,.35)'; for(let x=24;x<w-24;x+=58) g.fillRect(x+4, 30, 12, 44); });
    const cols=[0x18a999, 0x7b3fc4, 0xf08a24, 0x18a999];
    for(let i=0;i<4;i++){ const body=std({color:cols[i], roughness:.35, metalness:.25}), win=std({map:winTex, roughness:.2, transparent:true, color:cols[i]}), car=new THREE.Group();
      const shell=new THREE.Mesh(rb(3,3.1,CAR,.65,3), body); shell.position.y=1.9; car.add(shell);
      for(const s of [-1,1]){ const w=new THREE.Mesh(new THREE.PlaneGeometry(CAR*.92,1.6), win); w.position.set(s*1.52, 2.25, 0); w.rotation.y=s*Math.PI/2; car.add(w); }
      const skirt=new THREE.Mesh(rb(3.1,.9,CAR-.4,.2,1), MAT.dark); skirt.position.y=.15; car.add(skirt);
      if(i===0 || i===3){ const nose=new THREE.Mesh(new THREE.SphereGeometry(1.5,16,10,0,TAU,0,Math.PI/2), body); nose.rotation.x=(i===0?1:-1)*Math.PI/2; nose.scale.set(1,1.4,1); nose.position.set(0,1.9,(i===0?1:-1)*CAR/2); car.add(nose); }
      car.traverse(m=>{ if(m.isMesh){ m.castShadow=true; } }); train.add(car); cars.push(car); } }
  const TR={s:ST[0].s, dir:1, v:0, wait:4, last:ST[0], ride:null, pending:null};
  const stopsOrder=()=>TR.dir>0 ? ST : [...ST].reverse();
  function nextStop(){ return stopsOrder().find(st=>st!==TR.last && (TR.dir>0 ? st.s>TR.s-2 : st.s<TR.s+2)); }   // ga kế tiếp theo chiều chạy (bỏ ga vừa dừng)
  function placeTrain(){ for(let i=0;i<4;i++){ const s=clamp(TR.s-TR.dir*(i*(CAR+GAP)), 0, mrLen), u=s/mrLen, p=mrCurve.getPointAt(u), t=mrCurve.getTangentAt(u);
      cars[i].position.set(p.x, p.y, p.z); cars[i].rotation.order='YXZ'; cars[i].rotation.set(-Math.asin(clamp(t.y,-1,1))*(TR.dir<0?-1:1), Math.atan2(t.x,t.z)+(TR.dir<0?Math.PI:0), 0); } }
  placeTrain();

  /* ----- ĐI TÀU: bấm E ở chân thang máy ga → lên tàu khi tàu dừng ở ga đó → tự xuống ở ga kế tiếp ----- */
  function board(st){ const car=cars[1];
    TR.ride={from:st, t:0}; HOOK.camDist=13;
    HOOK.vehicle={drive(dt){ car.updateMatrixWorld(); const p=car.getWorldPosition(new V3()); P.x=p.x; P.z=p.z; P.y=p.y+.5; P.vx=P.vz=0; W.me.g.position.set(P.x,P.y,P.z); W.me.g.rotation.y=car.rotation.y; W.me.play && W.me.play('idle'); }};
    toast(`🚝 Đã lên tàu tại ${st.name} – tàu chạy qua bụng toà chung cư 18 tầng!`, 3600); }
  function alight(st){ HOOK.vehicle=null; HOOK.camDist=null; TR.ride=null; HOOK.camOverride=null; const g=st.ground, gy=hAt(g.x,g.z)??g.y; P.x=g.x; P.z=g.z; P.y=gy; P.vx=P.vz=P.vy=0; P.ground=true; W.me.g.position.set(P.x,P.y,P.z); toast(`🚉 Đã tới ${st.name}`, 2600); }
  for(const st of ST) INTER.push({x:st.ground.x, z:st.ground.z, r:3.4, prio:.5, when:()=>Math.abs(P.y-(hAt(st.ground.x,st.ground.z)??st.ground.y))<3,
    label:`🚝 ${st.name} – đi tàu điện một ray (E)`, action:()=>{ if(TR.ride) return; if(TR.wait>0 && Math.abs(TR.s-st.s)<2){ board(st); return; } TR.pending=st; toast('🚝 Tàu đang tới ga, đứng chờ một chút nhé…', 2600); }});

  /* ============================== HẦM ĐÔI XUYÊN NÚI (x 440–460, T2 +24 → T3 +52, đèn vòm LED xanh) ============================== */
  { const bores=[[441,449.4],[450.6,459]];   // 2 lòng hầm (mỗi lòng 8,4 m) + vách giữa
    const arch=(cx, hw, d, y)=>{ const pts=[]; pts.push([cx-hw, y-.2],[cx-hw, y+3.6]); for(let k=1;k<12;k++){ const a=Math.PI-k/12*Math.PI; pts.push([cx+Math.cos(a)*hw, y+3.6+Math.sin(a)*hw*.62]); } pts.push([cx+hw, y+3.6],[cx+hw, y-.2]); return pts; };
    for(const [xa,xb] of bores){ const cx=(xa+xb)/2, hw=(xb-xa)/2, pos=[], uv=[], idx=[]; const steps=[]; for(let d=TUN.d0; d<=TUN.dOpen+.01; d+=3) steps.push(d);
      steps.forEach((d,i)=>{ const ring=arch(cx,hw,d,tunY(d)); let acc=0; ring.forEach(([x,y],k)=>{ if(k) acc+=Math.hypot(x-ring[k-1][0], y-ring[k-1][1]); pos.push(x,y,-d); uv.push(acc/4, d/4); });
        if(i<steps.length-1){ const n=ring.length, a=i*n, b=a+n; for(let k=0;k<n-1;k++) idx.push(a+k,b+k,a+k+1, a+k+1,b+k,b+k+1); } });
      const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); g.scale(1,1,1);
      const ig=g.index.array; for(let i=0;i<ig.length;i+=3){ const t=ig[i]; ig[i]=ig[i+2]; ig[i+2]=t; } g.computeVertexNormals(); put(MAT.tunnel, g, 'tunnel');   // mặt trong nhìn vào lòng hầm
      // vòm LED xanh mỗi 12 m
      for(let d=TUN.d0+6; d<TUN.dOpen-2; d+=12){ const y=tunY(d), tor=new THREE.TorusGeometry(hw*.97, .09, 6, 24, Math.PI); xf(tor, cx, y+3.6, -d, 0); tor.scale(1,.62,1); tor.translate(0, (y+3.6)*(1-.62), 0); put(MAT.led, tor, 'tunnel'); }
      // vạch đèn LED chạy dọc chân vách
      for(const s of [-1,1]) put(MAT.led, beam(rb(.12,1,.12,.04,1), new V3(cx+s*(hw-.08), tunY(TUN.d0)+.9, -TUN.d0), new V3(cx+s*(hw-.08), tunY(TUN.dOpen)+.9, -TUN.dOpen)), 'tunnel'); }
    // vách giữa 2 lòng hầm + tường 2 bên (va chạm)
    put(MAT.tunnel, beam(rb(1.2,1,4.2,.1,1), new V3(450, tunY(TUN.d0)+2, -TUN.d0), new V3(450, tunY(TUN.dOpen)+2, -TUN.dOpen)), 'tunnel');
    for(let d=TUN.d0; d<TUN.d1; d+=6){ const a=d, b=Math.min(TUN.d1, d+6); for(const x of [440.6,459.4]) addSeg(x,-a,x,-b,.25, tunY(a)-1, tunY(b)+8, 'Vách hầm'); if(b<=TUN.dOpen) addSeg(450,-a,450,-b,.65, tunY(a)-1, tunY(b)+8, 'Vách giữa 2 lòng hầm'); }
    // cửa hầm: mặt đá ốp + 2 vòm (cửa Nam áp vách cao 30 m; cửa Bắc trong hào chỉ cao tới mặt cao nguyên)
    for(const [d, yb, front] of [[TUN.d0, TUN.y0, 1],[TUN.dOpen, tunY(TUN.dOpen), -1]]){ const HH=front>0 ? 31 : Y3+1.2-yb, HW=front>0 ? 26 : 11.2; const s=new THREE.Shape(); s.moveTo(-HW,-.5); s.lineTo(HW,-.5); s.lineTo(HW,HH); s.lineTo(-HW,HH); s.closePath();
      for(const [xa,xb] of bores){ const cx=(xa+xb)/2-450, hw=(xb-xa)/2, hp=new THREE.Path(); hp.moveTo(cx-hw,0); hp.lineTo(cx-hw,3.6); hp.absellipse(cx,3.6,hw,hw*.62,Math.PI,0,true); hp.lineTo(cx+hw,0); hp.closePath(); s.holes.push(hp); }
      const g=new THREE.ExtrudeGeometry(s,{depth:2.2, bevelEnabled:true, bevelThickness:.3, bevelSize:.3, bevelSegments:2, curveSegments:18}); xf(g, 450, yb, front>0 ? -d+.2 : -d-2.4); put(MAT.stone, g, 'tunnel');
      const zf=front>0 ? -d+2.75 : -d-2.75;   // mặt ngoài của cửa hầm
      for(const [xa,xb] of bores){ const cx=(xa+xb)/2, hw=(xb-xa)/2, tor=new THREE.TorusGeometry(hw+.25,.18,6,28,Math.PI); tor.scale(1,.62,1); xf(tor, cx, yb+3.6, zf); put(MAT.led, tor, 'tunnel'); }
      const sign=canvas(1024,128,(g,w,h)=>{ g.fillStyle='#0f2a4a'; g.fillRect(0,0,w,h); g.fillStyle='#bfe3ff'; g.font='bold 72px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('HẦM ĐÔI NAM SƠN · DEV CITY', w/2, h/2+4); });
      const sm=std({map:sign, emissive:0xffffff, emissiveMap:sign, emissiveIntensity:.5}); const sp=new THREE.Mesh(new THREE.PlaneGeometry(front>0?20:16, front>0?2.5:2), sm); sp.position.set(450, yb+(front>0?11.5:6.6), zf+front*.05); if(front<0) sp.rotation.y=Math.PI; root.add(sp); }
    // tường chắn 2 bên hào đào hở (d 605 → 663)
    for(const x of [439.2,460.8]){ for(let d=TUN.dOpen; d<TUN.d1; d+=4){ const y=tunY(d), top=Y3+1; if(top-y<.6) continue; put(MAT.concrete, xf(rb(.8,top-y+.4,4.1,.1,1), x, (top+y)/2-.2, -(d+2)), 'tunnel'); }
      for(let d=TUN.dOpen; d<TUN.d1-3; d+=4) addSeg(x+(x<450?-1:1)*.6,-d,x+(x<450?-1:1)*.6,-(d+4),.25, Y3-1, Y3+2, 'Lan can hào đường hầm – vực sâu'); }
    // mặt cao nguyên phía trên hầm vẫn đi bộ được (sàn +52; người trong hầm thấp hơn nên không bị nhấc lên)
    addPlat(450, -(447+TUN.dOpen)/2, 0, 12, (TUN.dOpen-447)/2, Y3);
    for(const x of [438.6,461.4]) addSeg(x,-436,x,-470,.3, 30, 60, 'Vách núi phía trên cửa hầm – không đi được'); }
  // camera trong hầm: giới hạn trong lòng hầm, không xuyên lên mặt núi
  let camMine=false;
  HOOK.onFrame.push(()=>{ const d=-P.z, inTun=P.x>440 && P.x<460 && d>TUN.d0-2 && d<TUN.dOpen+2 && P.y<tunY(d)+8;
    if(inTun){ const left=P.x<450, bx=left?[441.2,449]:[451,458.8]; HOOK.camBox={x0:bx[0], x1:bx[1], z0:-TUN.dOpen-4, z1:-TUN.d0+6, y1:tunY(d)+5.8}; camMine=true; }
    else if(camMine){ if(HOOK.camBox && HOOK.camBox.y1!==undefined) HOOK.camBox=null; camMine=false; } });

  /* ============================== CÔNG TRÌNH (file riêng) ============================== */
  let LM=null; try{ const m=await import('./devcity_landmarks.js'); LM=m.build ? await m.build({...kit, ST, mrCurve, mrLen, sOf, deck, board}) : null; }catch(e){ console.warn('[devcity] landmarks', e); }

  const draws=flush();

  /* ============================== TÊN KHU + ĐIỂM NHẢY BẢN ĐỒ ============================== */
  const L=(t,s,x,y,z,f=420)=>makeLabel && makeLabel(t, s, {x, y, z, h:.9, fade:f});
  L('🏙️ DEV CITY · TRÙNG KHÁNH 8D', '4 thềm · tàu điện xuyên lầu · nút giao xoắn ốc · hầm xuyên núi', 520, 140, -480, 1200);
  L('🌀 Nút giao xoắn ốc 5 tầng', 'Thung lũng → Cao nguyên +52 m', SP.x, 62, SP.z, 320);
  L('🚇 Hầm đôi Nam Sơn', 'Đèn vòm LED xanh · T2 +24 → T3 +52', 450, 40, -432, 280);
  L('🌉 Cầu dây văng 2 tầng', 'Tầng trên: xe · tầng dưới: đi bộ + tàu điện', 220, 64, -132, 300);
  if(PLACES){ const add=(icon,name,sub,x,z,lx,lz)=>PLACES.push({icon, name, sub, go:()=>teleport(x,z,lx,lz)});
    add('🏙️','Dev City – Bến Sông','Đại lộ ven sông · thềm 1 (+2 m)', 380, -172, 380, -230);
    add('🌀','Dev City – Nút giao xoắn ốc','Chân nút giao trong thung lũng', 300, -250, SP.x, SP.z);
    add('🚇','Dev City – Hầm đôi Nam Sơn','Cửa hầm thềm 2 (+24 m)', 450, -412, 450, -440);
    add('🏞️','Dev City – Cao nguyên & hồ Thiên Cảnh','Thềm 3 (+52 m)', 560, -520, 560, -600);
    add('🚝','Dev City – Ga Lý Tử Bá','Tàu điện xuyên toà chung cư', ST[1].ground.x, ST[1].ground.z+4, 380, -420); }

  /* ============================== CHẠY TÀU (con thoi Bến Sông ⇄ Lý Tử Bá ⇄ Đông Sơn) ============================== */
  let nightLast=-1;
  HOOK.onFrame.push((dt)=>{ dt=Math.min(dt,.1);
    const nk=W.night||0; if(Math.abs(nk-nightLast)>.01){ nightLast=nk; for(const m of NIGHTL) m.emissiveIntensity=.12+nk*2.4; }
    if(TR.wait>0){ TR.wait-=dt;
      const here=ST.find(st=>Math.abs(st.s-TR.s)<2);
      if(here && TR.pending===here && !TR.ride){ TR.pending=null; board(here); }
      if(TR.wait<=0){ if(TR.ride) TR.ride.leaving=true; if(here===ST[ST.length-1] && TR.dir>0) TR.dir=-1; else if(here===ST[0] && TR.dir<0) TR.dir=1; }
      return; }
    const st=nextStop(); if(!st){ TR.dir*=-1; return; }
    const dist=Math.abs(st.s-TR.s), vmax=22, a=2.2, vStop=Math.sqrt(2*a*Math.max(0,dist-1));
    TR.v=Math.min(vmax, TR.v+a*dt, vStop+.6); TR.s+=TR.dir*TR.v*dt;
    if(dist<.8){ TR.s=st.s; TR.v=0; TR.last=st; TR.wait=st.key==='s2' ? 8 : 10; if(TR.ride && TR.ride.from!==st){ alight(st); } }
    placeTrain(); });
  // camera khi đi tàu: bám theo đường ray (lùi sau tàu 24 m, cao 5,5 m) → chui theo tàu qua khoảng rỗng tầng 6–8, không kẹt trong tường
  const _cp=new V3(), _cl=new V3();
  HOOK.onFrame.push(()=>{ if(!TR.ride) return; const back=clamp(TR.s-TR.dir*24, 0, mrLen); _cp.copy(mrCurve.getPointAt(back/mrLen)); _cp.y+=5.5;
    const lead=TR.dir>0 ? cars[0] : cars[3]; _cl.copy(lead.position); _cl.y+=1.6;
    if(!HOOK.camOverride || !HOOK.camOverride.devRide) HOOK.camOverride={pos:_cp.clone(), look:_cl.clone(), k:4, devRide:true}; else { HOOK.camOverride.pos.copy(_cp); HOOK.camOverride.look.copy(_cl); } });

  console.info(`[QC World V2] Dev City: địa hình ${NX}×${NZ}, ${ROADS.length} tuyến đường, ${draws} khối gộp – ${Math.round(performance.now()-t0)} ms`);
  const API={root, hAt, ROADS, DECKS, GATES, TR, ST, cars, mrCurve, landmarks:LM, tunnel:TUN, spiral:SP, merge:MERGE, LAKE, PA, PB, STAIR, Y1, Y2, Y3, Y4, YW};
  // bot sống động của Dev City (Pha 9 – bible Phần 7): nạp sau cùng, lỗi thì bỏ qua
  try{ const bm=await import('./bots_devcity.js'); API.bots=bm.make ? await bm.make(W, ctx, API) : null; }catch(e){ console.warn('[devcity] bots', e); }
  return API;
}
