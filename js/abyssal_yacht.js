// QC World V2 – Đảo Abyssal · phiên B (abyss-sea), 17/11/2026 – MẪU SIÊU DU THUYỀN 3 TẦNG 42 × 9,5 m (đặc tả Bình Phần 3, ảnh mẫu _work/overhaul/image_d1e37b.png)
//  • Vỏ tàu: THREE.Shape (bezierCurveTo) + ExtrudeGeometry bo cạnh (bevel 0,06 / 0,05 / 3), rồi uốn đỉnh: đáy chữ V, mũi nâng (forefoot), đuôi vát → mượt, không ghép hộp.
//    Sơn bằng texture: thân trắng ngọc trai, đáy Navy, chỉ vàng Champagne, 2 dải cửa sổ kính đen dài dọc thân.
//  • Thượng tầng: vách là các DẢI tường mỏng (Shape đùn đứng) → nhìn xuyên kính thấy nội thất; sàn/mái là tấm Shape bo cạnh; lan can inox TubeGeometry (CatmullRom).
//  • HIỆU NĂNG: ngoại thất gộp theo vật liệu → cả đội 7–8 tàu chỉ 8 lượt vẽ (InstancedMesh, kính tối). Riêng tàu GẦN người chơi nhất được dựng bản đầy đủ:
//    kính trong + nội thất 3 tầng (gộp theo vật liệu, ~16 lượt vẽ) + NPC (thuyền trưởng, phục vụ, khách). Nội thất chỉ dựng lần đầu khi lại gần.
//  • ĐI BỘ TRÊN TÀU ĐANG CHẠY: người chơi giữ toạ độ theo hệ của tàu (sàn, cầu thang dốc, vách, lỗ cầu thang tính sẵn) → tàu chạy / quay / chòng chành
//    người vẫn đứng vững, không cần plats động. Camera trong khoang bị giới hạn dưới trần (HOOK.camBox).
// Hệ toạ độ tàu: +z = mũi, +x = mạn phải (starboard), y = 0 ở mặt nước. Sàn 3 tầng: 1,6 · 4,8 · 8,0. Cao nhất (ăng-ten) 12,45 m → lọt gầm cầu tĩnh không 15,5 m.
// API: const kit = makeYachtKit(W) → { L, B, H, D, makeFleet(n,parent), makeNear(parent), deck:{floorAt, ceilAt, collide}, makeRider(opts) }
import * as AK from './archKit.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { makePoser } from './pose.js';

export function makeYachtKit(W){
  if(W.__abyYachtKit) return W.__abyYachtKit;
  const {THREE} = W, TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  const D1=1.6, D2=4.8, D3=8.0, HT=10.35;   /* cao độ sàn 3 tầng + mái che sun deck */
  const rnd=AK.rng(4207);

  /* ============================== TEXTURE PROCEDURAL (canvas) ============================== */
  const cvs=(w,h,f,live)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; f(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; if(live) t.userData.live=true; return t; };
  const rep=(t,x,y)=>{ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(x,y); return t; };
  // vỏ tàu: u theo chiều dọc tàu (z −21 → 21), v theo cao độ (y −2,2 → 1,8)
  const hullTex=cvs(1024,256,(g,w,h)=>{ const Y=y=>(1-(y+2.2)/4)*h, U=z=>(z+21)/42*w, band=(y0,y1,c)=>{ g.fillStyle=c; g.fillRect(0,Y(y1),w,Y(y0)-Y(y1)); };
    const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#f7f4ee'); gr.addColorStop(.7,'#eee9df'); gr.addColorStop(1,'#e4ded2'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    band(-2.2,-.03,'#14284f'); band(-.03,.1,'#d4af37'); band(1.02,1.3,'#14284f'); band(.9,.95,'#d4af37');
    const cap=(z0,z1,y0,y1)=>{ const x0=U(z0), x1=U(z1), t=Y(y1), b=Y(y0), r=(b-t)/2; g.beginPath(); g.moveTo(x0+r,t); g.lineTo(x1-r,t); g.arc(x1-r,t+r,r,-Math.PI/2,Math.PI/2); g.lineTo(x0+r,b); g.arc(x0+r,t+r,r,Math.PI/2,Math.PI*1.5); g.closePath();
      const wg=g.createLinearGradient(0,t,0,b); wg.addColorStop(0,'#2a3b4c'); wg.addColorStop(.45,'#0b131b'); wg.addColorStop(1,'#05090d'); g.fillStyle=wg; g.fill(); g.strokeStyle='rgba(212,175,55,.55)'; g.lineWidth=1.5; g.stroke(); };
    cap(-11.5,-2.2,.36,.74); cap(-.8,8.2,.36,.74); for(const z of [10.2,11.6,13]){ g.beginPath(); g.arc(U(z),Y(.55),5,0,TAU); g.fillStyle='#0b131b'; g.fill(); g.strokeStyle='#c9ced4'; g.lineWidth=1.5; g.stroke(); }
    g.fillStyle='rgba(255,255,255,.06)'; for(let i=0;i<40;i++) g.fillRect(rnd()*w,Y(1.5)+rnd()*30,40+rnd()*90,1); });
  const teakTex=rep(cvs(512,512,(g,w,h)=>{ const n=16, pw=w/n; for(let i=0;i<n;i++){ let y=0; while(y<h){ const L=90+rnd()*260, c=new THREE.Color().setHSL(.075+rnd()*.012,.48+rnd()*.12,.3+rnd()*.07); g.fillStyle='#'+c.getHexString(); g.fillRect(i*pw,y,pw,L);
        g.strokeStyle='rgba(60,32,14,.18)'; g.lineWidth=1; for(let k=0;k<5;k++){ const xx=i*pw+3+rnd()*(pw-6); g.beginPath(); g.moveTo(xx,y); g.bezierCurveTo(xx+rnd()*4-2,y+L*.3,xx+rnd()*4-2,y+L*.7,xx+rnd()*3-1.5,y+L); g.stroke(); }
        g.fillStyle='#17110c'; g.fillRect(i*pw,y,pw,2); y+=L; } g.fillStyle='#17110c'; g.fillRect(i*pw,0,2,h); } }),.5,.5);
  const rugTex=cvs(512,768,(g,w,h)=>{ g.fillStyle='#6e1a1e'; g.fillRect(0,0,w,h); const fr=(m,c,lw)=>{ g.strokeStyle=c; g.lineWidth=lw; g.strokeRect(m,m,w-2*m,h-2*m); };
    g.fillStyle='#1d3b2e'; g.fillRect(14,14,w-28,h-28); g.fillStyle='#7a1d22'; g.fillRect(46,46,w-92,h-92); fr(14,'#d4af37',4); fr(46,'#d4af37',3); fr(30,'#b9842e',2);
    for(let i=0;i<28;i++){ const t=i/28; for(const [x,y] of [[30+t*(w-60),30],[30+t*(w-60),h-30]]){ g.fillStyle=i%2?'#d4af37':'#e7d2a0'; g.beginPath(); g.ellipse(x,y,6,9,0,0,TAU); g.fill(); } }
    for(let i=0;i<40;i++){ const t=i/40; for(const [x,y] of [[30,30+t*(h-60)],[w-30,30+t*(h-60)]]){ g.fillStyle=i%2?'#d4af37':'#e7d2a0'; g.beginPath(); g.ellipse(x,y,9,6,0,0,TAU); g.fill(); } }
    g.save(); g.translate(w/2,h/2); for(let r=0;r<6;r++){ g.rotate(Math.PI/3); g.fillStyle=r%2?'#1d3b2e':'#d4af37'; g.beginPath(); g.ellipse(0,92,30,74,0,0,TAU); g.fill(); }
    g.fillStyle='#e8d5a6'; g.beginPath(); g.arc(0,0,46,0,TAU); g.fill(); g.fillStyle='#6e1a1e'; g.beginPath(); g.arc(0,0,26,0,TAU); g.fill(); g.restore();
    for(const [x,y] of [[w*.25,h*.2],[w*.75,h*.2],[w*.25,h*.8],[w*.75,h*.8]]){ g.fillStyle='#d4af37'; g.beginPath(); g.moveTo(x,y-26); g.lineTo(x+18,y); g.lineTo(x,y+26); g.lineTo(x-18,y); g.closePath(); g.fill(); g.fillStyle='#1d3b2e'; g.beginPath(); g.arc(x,y,7,0,TAU); g.fill(); }
    for(let i=0;i<5000;i++){ g.fillStyle=`rgba(${rnd()<.5?'0,0,0':'255,230,190'},.05)`; g.fillRect(rnd()*w,rnd()*h,2,2); } });
  const marbleTex=rep(cvs(256,256,(g,w,h)=>{ g.fillStyle='#ece6da'; g.fillRect(0,0,w,h); for(let i=0;i<22;i++){ g.strokeStyle=`rgba(120,110,100,${.12+rnd()*.25})`; g.lineWidth=.6+rnd()*1.6; g.beginPath(); let x=rnd()*w, y=rnd()*h; g.moveTo(x,y); for(let k=0;k<8;k++){ x+=(rnd()-.4)*60; y+=(rnd()-.5)*40; g.lineTo(x,y); } g.stroke(); } }),1,1);
  const tvTex=cvs(256,144,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#1b2c5a'); gr.addColorStop(.55,'#f08a4b'); gr.addColorStop(.6,'#ffd38a'); gr.addColorStop(.62,'#215a7a'); gr.addColorStop(1,'#0b2a3d'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.fillStyle='#ffe6a8'; g.beginPath(); g.arc(w*.62,h*.56,14,Math.PI,0); g.fill(); g.fillStyle='#06121c'; for(const [x,hh] of [[40,40],[70,62],[100,34],[190,48],[222,30]]){ g.beginPath(); g.moveTo(x-18,h*.61); g.quadraticCurveTo(x-10,h*.61-hh,x,h*.61-hh); g.quadraticCurveTo(x+10,h*.61-hh,x+18,h*.61); g.fill(); }
    g.fillStyle='rgba(255,255,255,.85)'; g.font='bold 13px sans-serif'; g.fillText('QC WORLD · OCEAN TV',10,18); });
  const radarTex=cvs(256,128,(g,w,h)=>{ g.fillStyle='#04120c'; g.fillRect(0,0,w,h); for(const cx of [64,192]){ g.strokeStyle='#1f8a4c'; g.lineWidth=1.5; for(const r of [16,32,48]){ g.beginPath(); g.arc(cx,64,r,0,TAU); g.stroke(); } g.beginPath(); g.moveTo(cx-56,64); g.lineTo(cx+56,64); g.moveTo(cx,8); g.lineTo(cx,120); g.stroke();
      const sw=g.createRadialGradient(cx,64,0,cx,64,56); sw.addColorStop(0,'rgba(80,255,150,.7)'); sw.addColorStop(1,'rgba(80,255,150,0)'); g.fillStyle=sw; g.beginPath(); g.moveTo(cx,64); g.arc(cx,64,56,-.9,-.2); g.fill(); g.fillStyle='#7dffb0'; for(let i=0;i<7;i++){ g.fillRect(cx-40+rnd()*80,24+rnd()*80,3,3); } } g.fillStyle='#ffd166'; g.font='10px monospace'; g.fillText('HDG 312° · 14.2 kn',6,124); });

  /* ============================== VẬT LIỆU (token theo đặc tả 0.4) ============================== */
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.5, ...o});
  const M={
    hull: std(0xffffff,{map:hullTex, roughness:.2, metalness:.12}),                    /* MAT_YACHT_HULL + sọc Navy / chỉ vàng trong texture */
    white: std(0xf4f1ea,{roughness:.22, metalness:.12}),
    glassFar: std(0x0b131b,{roughness:.06, metalness:.75, emissive:0x000000}),          /* tàu ở xa: kính đen phản quang (đêm sáng ấm nhẹ) */
    glassNear: new THREE.MeshStandardMaterial({color:0x27394a, roughness:.04, metalness:.35, transparent:true, opacity:.3, depthWrite:false, side:THREE.DoubleSide}),
    teak: std(0xffffff,{map:teakTex, roughness:.6}),
    chrome: std(0xdfe4ea,{roughness:.14, metalness:.95}),
    gold: std(0xd4af37,{roughness:.25, metalness:.88}),
    navy: std(0x14284f,{roughness:.35, metalness:.2}),
    dark: std(0x1c2026,{roughness:.4, metalness:.35}),
  };
  const IM={
    cream: std(0xe6d9bf,{roughness:.55}), brown: std(0x6b4a33,{roughness:.48}), mahog: std(0x421812,{roughness:.38, metalness:.1}), walnut: std(0x3d2314,{roughness:.45, metalness:.08}),
    marble: std(0xffffff,{map:marbleTex, roughness:.14, metalness:.05}), rug: std(0xffffff,{map:rugTex, roughness:.92, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}),
    glow: std(0xffcf70,{roughness:.2, emissive:0xffb84d, emissiveIntensity:1.35}),     /* MAT_WARM_GLOW: trần đèn, chụp đèn, đèn chùm */
    fabric: std(0xeae0cf,{roughness:.9}), velvet: std(0x1e4637,{roughness:.82}), bordeaux: std(0x591622,{roughness:.85}), lacquer: std(0x0a0a0c,{roughness:.12, metalness:.3}),
    screen: new THREE.MeshBasicMaterial({map:tvTex}), radar: new THREE.MeshBasicMaterial({map:radarTex}),
    water: new THREE.MeshStandardMaterial({color:0x3fb7c9, roughness:.04, metalness:.1, transparent:true, opacity:.82}),
  };
  if(W.TX && W.TX.waterN){ const n=W.TX.waterN.clone(); n.wrapS=n.wrapT=THREE.RepeatWrapping; n.repeat.set(.6,.6); n.needsUpdate=true; IM.water.normalMap=n; IM.water.normalScale=new THREE.Vector2(.5,.5); }

  /* ============================== HÌNH HỌC: tiện ích ============================== */
  // Shape trên mặt phẳng boong: toạ độ (x, z) → Vector2(x, −z); đùn lên theo +y từ y0, cao h (bevel nằm trọn trong [y0, y0+h])
  const sh=cmds=>{ const s=new THREE.Shape(); for(const c of cmds){ const [o,...a]=c; if(o==='M') s.moveTo(a[0],-a[1]); else if(o==='L') s.lineTo(a[0],-a[1]); else if(o==='Q') s.quadraticCurveTo(a[0],-a[1],a[2],-a[3]); else if(o==='C') s.bezierCurveTo(a[0],-a[1],a[2],-a[3],a[4],-a[5]); } return s; };
  const rectPath=(x0,x1,z0,z1)=>{ const p=new THREE.Path(); p.moveTo(x0,-z0); p.lineTo(x0,-z1); p.lineTo(x1,-z1); p.lineTo(x1,-z0); p.closePath(); return p; };
  function ext(shape, y0, h, o={}){ const bv=o.bevel??.05, bt=bv>0?Math.min(bv,h*.3):0;
    const g=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.002,h-2*bt), steps:o.steps||1, curveSegments:o.cs||14, bevelEnabled:bv>0, bevelThickness:bt, bevelSize:o.bs??Math.min(bv,.05), bevelSegments:o.bseg??2});
    g.rotateX(-Math.PI/2); g.translate(0,y0+bt,0); return g; }
  const outline=(s,n)=>s.getSpacedPoints(n).slice(0,-1).map(v=>[v.x,-v.y]);   /* điểm dày đều trên đường viền shape → [x,z] */
  // đường song song lệch d về phía TRONG (phía điểm tham chiếu ref(x,z))
  function offsetLine(pts, d, closed, ref=(x,z)=>[0,clamp(z,-12,9)]){ const n=pts.length, out=[];
    for(let i=0;i<n;i++){ const a=pts[closed?(i-1+n)%n:Math.max(0,i-1)], b=pts[closed?(i+1)%n:Math.min(n-1,i+1)]; let tx=b[0]-a[0], tz=b[1]-a[1]; const L=Math.hypot(tx,tz)||1; tx/=L; tz/=L; let nx=-tz, nz=tx; const [rx,rz]=ref(pts[i][0],pts[i][1]); if(nx*(rx-pts[i][0])+nz*(rz-pts[i][1])<0){ nx=-nx; nz=-nz; } out.push([pts[i][0]+nx*d, pts[i][1]+nz*d]); }
    return out; }
  // cắt đường viền kín thành các đoạn hở theo hàm gap(x,z) (cửa ra vào)
  function splitGaps(pts, closed, gap){ const n=pts.length, isG=pts.map(p=>gap(p[0],p[1])); if(!isG.some(Boolean)) return closed?null:[pts];
    let s=0; if(closed) while(!isG[s]) s++; const out=[]; let cur=[];
    for(let k=0;k<=n;k++){ const i=(s+k)%n; if(!closed && k===n) break; if(isG[i]){ if(cur.length>1) out.push(cur); cur=[]; } else cur.push(pts[i]); } if(cur.length>1) out.push(cur); return out; }
  // dải tường mỏng dày t (vào trong) theo đường viền; trả về các Shape
  function stripShapes(pts, t, closed, gap=()=>false, ref){ const pieces=splitGaps(pts, closed, gap);
    if(pieces===null){ const inn=offsetLine(pts,t,true,ref), s=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0],-p[1]))); s.holes.push(new THREE.Path(inn.map(p=>new THREE.Vector2(p[0],-p[1])))); return [s]; }
    return pieces.map(pc=>{ const inn=offsetLine(pc,t,false,ref); return new THREE.Shape([...pc, ...inn.reverse()].map(p=>new THREE.Vector2(p[0],-p[1]))); }); }
  const tube=(pts,r,closed=false,seg)=>{ const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)),closed,'centripetal'); return new THREE.TubeGeometry(c, seg||Math.max(6,Math.round(c.getLength()*2.2)), r, 6, closed); };
  const rbox=(w,h,d,r=.05,seg=2)=>AK.roundedBox(w,h,d,r,seg).clone();
  const lathe=(prof,seg=18)=>new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)),seg);
  function bag(){ const m=new Map(); return { put(mat, geo, x=0,y=0,z=0, ry=0, rx=0, rz=0){ let g=geo.index?geo.toNonIndexed():geo; if(!g.attributes.uv){ g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); }
        for(const k of Object.keys(g.attributes)) if(!['position','normal','uv'].includes(k)) g.deleteAttribute(k); if(!g.attributes.normal) g.computeVertexNormals();
        if(rz) g.rotateZ(rz); if(rx) g.rotateX(rx); if(ry) g.rotateY(ry); g.translate(x,y,z); if(!m.has(mat)) m.set(mat,[]); m.get(mat).push(g); return g; },
      merged(){ const out=[]; for(const [mat,list] of m){ const g=list.length>1?mergeGeometries(list,false):list[0]; if(g){ g.computeBoundingSphere(); out.push({mat, geo:g}); } } return out; } }; }

  /* ============================== VỎ TÀU ============================== */
  const HULL_CMDS=[['M',-4.35,-20.4],['L',-4.75,-12],['L',-4.75,3],['C',-4.75,12,-2.6,19.5,0,21.4],['C',2.6,19.5,4.75,12,4.75,3],['L',4.75,-12],['L',4.35,-20.4],['Q',0,-20.75,-4.35,-20.4]];
  const HY0=-2.0, HY1=1.52;
  function hullGeo(){ const H=HY1-HY0, g=new THREE.ExtrudeGeometry(sh(HULL_CMDS),{depth:H, steps:14, curveSegments:30, bevelEnabled:true, bevelThickness:.06, bevelSize:.05, bevelSegments:3});
    g.rotateX(-Math.PI/2); const p=g.attributes.position, uv=g.attributes.uv;
    for(let i=0;i<p.count;i++){ let x=p.getX(i), y=p.getY(i); const z=p.getZ(i), t=y/H, bow=ss(1,21.4,z), stern=ss(-12,-20.6,z), yb=HY0+bow*bow*2.25+stern*.45;
      const k=.3+.7*Math.sin(clamp(t/.62,0,1)*Math.PI/2), flare=1+.035*ss(.5,1,t)*ss(4,16,z);   /* đáy chữ V + loe nhẹ mạn mũi */
      x*=k*flare; y=yb+t*(HY1-yb); p.setXYZ(i,x,y,z); uv.setXY(i,(z+21)/42,(y+2.2)/4); }
    g.deleteAttribute('normal'); const m=mergeVertices(g,1e-4); m.computeVertexNormals(); return m; }
  const DECK_PTS=outline(sh(HULL_CMDS),200).map(([x,z])=>[x*.985,z<0?z:z*.99]);   /* mép boong chính (bên trong mép vỏ) */
  const MS_CMDS=[['M',3.5,-13],['L',3.5,7.5],['C',3.5,11.6,2.2,13.6,0,13.6],['C',-2.2,13.6,-3.5,11.6,-3.5,7.5],['L',-3.5,-13],['L',3.5,-13]];   /* thượng tầng boong chính */
  const US_CMDS=[['M',3.3,-8],['L',3.3,6.2],['C',3.3,8.6,2.2,9.6,0,9.6],['C',-2.2,9.6,-3.3,8.6,-3.3,6.2],['L',-3.3,-8],['L',3.3,-8]];                 /* thượng tầng boong trên */
  const UD_CMDS=[['M',3.78,-14.6],['L',3.78,7.6],['C',3.78,12.2,2.4,14,0,14],['C',-2.4,14,-3.78,12.2,-3.78,7.6],['L',-3.78,-14.6],['L',3.78,-14.6]];   /* sàn boong trên = mái boong chính */
  const SD_CMDS=[['M',3.6,-14.6],['L',3.6,5.5],['C',3.6,8.6,2.4,9.9,0,9.9],['C',-2.4,9.9,-3.6,8.6,-3.6,5.5],['L',-3.6,-14.6],['L',3.6,-14.6]];             /* sun deck = mái boong trên */
  const HT_CMDS=[['M',3.2,-8.2],['L',3.2,.2],['Q',3.2,1.6,0,1.8],['Q',-3.2,1.6,-3.2,.2],['L',-3.2,-8.2],['L',3.2,-8.2]];
  const STAIR={A:[-3.35,-2.15,-4.6,-.4,D1,D2], B:[-3.7,-2.5,-18.6,-14.6,D1,D2], C:[2.1,3.3,-13.3,-9.5,D3,D2], S:[-1.1,1.1,-21.9,-20.4,.45,D1]};
  const msPts=outline(sh(MS_CMDS),180), usPts=outline(sh(US_CMDS),150), sdPts=outline(sh(SD_CMDS),150);
  const gapMS=(x,z)=>(z<-12.9 && Math.abs(x)<1.6) || (x>3 && z>3.4 && z<4.4), gapUS=(x,z)=>z<-7.9 && Math.abs(x)<1.4;

  function buildExterior(){ const B=bag();
    B.put(M.hull, hullGeo());
    { const s=sh(HULL_CMDS.map(c=>c[0]==='M'||c[0]==='L'?[c[0],c[1]*.985,c[2]*(c[2]>0?.99:1)]:c[0]==='C'?['C',c[1]*.985,c[2]*.99,c[3]*.985,c[4]*.99,c[5]*.985,c[6]*.99]:['Q',c[1]*.985,c[2],c[3]*.985,c[4]])); B.put(M.teak, ext(s,HY1,D1-HY1,{bevel:0})); }   /* boong gỗ teak */
    /* mạn chắn sóng (bulwark): cao 0,95 m ở đuôi → 1,25 m ở mũi, chừa lối cầu thang bơi giữa đuôi; nẹp vàng trên đỉnh */
    for(const s of stripShapes(offsetLine(DECK_PTS,.02,true),.13,true,(x,z)=>z<-19.9 && Math.abs(x)<1.15)){ const g=ext(s,D1-.04,1,{bevel:.02,steps:1}), p=g.attributes.position; for(let i=0;i<p.count;i++){ const y=p.getY(i); if(y>D1+.4) p.setY(i,D1+.95+.3*ss(-4,21,p.getZ(i))); } g.computeVertexNormals(); B.put(M.white,g); }
    { const top=offsetLine(DECK_PTS,.085,true).filter(([x,z])=>!(z<-19.9 && Math.abs(x)<1.15)); let run=[]; const flush=()=>{ if(run.length>3) B.put(M.gold, tube(run.map(([x,z])=>[x,D1+.97+.3*ss(-4,21,z),z]),.045)); run=[]; };
      for(let i=0;i<top.length;i++){ if(i && Math.hypot(top[i][0]-top[i-1][0],top[i][1]-top[i-1][1])>1.2) flush(); run.push(top[i]); } flush(); }
    /* bệ bơi đuôi tàu + bậc lên boong */ B.put(M.teak, ext(sh([['M',-4.2,-22.6],['L',4.2,-22.6],['L',4.2,-20.3],['L',-4.2,-20.3],['L',-4.2,-22.6]]),.25,.2,{bevel:.04}));
    for(let i=0;i<6;i++){ const z=-21.9+i*.25, y=.45+(i+1)*(D1-.45)/6; B.put(M.teak, rbox(2.2,.06,.27,.02,1),0,y-.03,z+.12); B.put(M.white, rbox(2.2,y-.45,.04,.01,1),0,(y+.45)/2,z); }
    /* THƯỢNG TẦNG BOONG CHÍNH: chân trắng · dải kính lớn · gờ trên; mái = sàn boong trên (lỗ cầu thang A) */
    const band=(pts,gap,y0,h,mat,t=.12)=>{ for(const s of stripShapes(pts,t,true,gap)) B.put(mat, ext(s,y0,h,{bevel:.02})); };
    band(msPts,gapMS,D1,.62,M.white); band(msPts,gapMS,D1+.62,1.98,M.glassFar,.05); band(msPts,()=>false,D1+2.6,.4,M.white);
    for(let i=0;i<msPts.length;i+=12){ const [x,z]=msPts[i]; if(gapMS(x,z)) continue; const [a,b]=[msPts[(i+1)%msPts.length],msPts[(i-1+msPts.length)%msPts.length]]; B.put(M.white, rbox(.1,1.98,.16,.03,1), x, D1+1.61, z, Math.atan2(a[0]-b[0],a[1]-b[1])); }
    { const s=sh(UD_CMDS); s.holes.push(rectPath(...STAIR.A.slice(0,4))); B.put(M.white, ext(s,D2-.2,.2,{bevel:.06})); const s2=sh(UD_CMDS.map(c=>c.map((v,i)=>i?v*.985:v))); s2.holes.push(rectPath(...STAIR.A.slice(0,4))); B.put(M.teak, ext(s2,D2,.03,{bevel:0})); }
    /* cột đỡ phần sàn trên nhô ra boong sau */ for(const x of [-3.55,3.55]) B.put(M.chrome, new THREE.CylinderGeometry(.07,.07,D2-D1-.2,10), x, (D1+D2-.2)/2, -14.3);
    /* THƯỢNG TẦNG BOONG TRÊN (Sky Lounge · VIP · buồng lái) */
    band(usPts,gapUS,D2,.5,M.white); band(usPts,gapUS,D2+.5,2.05,M.glassFar,.05); band(usPts,()=>false,D2+2.55,.45,M.white);
    for(let i=0;i<usPts.length;i+=12){ const [x,z]=usPts[i]; if(gapUS(x,z)) continue; const [a,b]=[usPts[(i+1)%usPts.length],usPts[(i-1+usPts.length)%usPts.length]]; B.put(M.white, rbox(.1,2.05,.15,.03,1), x, D2+1.52, z, Math.atan2(a[0]-b[0],a[1]-b[1])); }
    { const s=sh(SD_CMDS); s.holes.push(rectPath(...STAIR.C.slice(0,4))); B.put(M.white, ext(s,D3-.2,.2,{bevel:.06})); const s2=sh(SD_CMDS.map(c=>c.map((v,i)=>i?v*.985:v))); s2.holes.push(rectPath(...STAIR.C.slice(0,4))); B.put(M.teak, ext(s2,D3,.03,{bevel:0})); }
    for(const x of [-3.5,3.5]) for(const z of [-14.2,-9]) B.put(M.chrome, new THREE.CylinderGeometry(.06,.06,D3-D2-.2,10), x, (D2+D3-.2)/2, z);
    /* lan can inox: sun deck (2 tầng ống + cột), boong trên phía sau */
    { const rl=offsetLine(sdPts,.1,true); for(const h of [.55,1.0]) B.put(M.chrome, tube(rl.map(([x,z])=>[x,D3+h,z]),.03,true,220)); for(let i=0;i<rl.length;i+=6){ const [x,z]=rl[i]; B.put(M.chrome, new THREE.CylinderGeometry(.022,.022,1.0,6), x, D3+.5, z); } }
    { const pa=[[-3.72,-8],[-3.72,-14.5]], pb=[[-2.5,-14.55],[3.72,-14.55],[3.72,-8]]; for(const pp of [pa,pb]) for(const h of [.5,1.0]) B.put(M.chrome, tube(pp.map(([x,z])=>[x,D2+h,z]),.03,false,40));
      for(const [x,z] of [[-3.72,-8.6],[-3.72,-10.8],[-3.72,-13],[-3.72,-14.5],[-2.5,-14.55],[-.3,-14.55],[1.8,-14.55],[3.72,-14.55],[3.72,-12],[3.72,-9.5]]) B.put(M.chrome, new THREE.CylinderGeometry(.022,.022,1,6), x, D2+.5, z); }
    /* mái che sun deck (hard-top) + 4 cột + vòm radar + radome + ăng-ten */
    B.put(M.white, ext(sh(HT_CMDS),HT,.2,{bevel:.06})); for(const [x,z] of [[-2.95,-7.9],[2.95,-7.9],[-2.9,-.2],[2.9,-.2]]) B.put(M.chrome, new THREE.CylinderGeometry(.06,.07,HT-D3,10), x, (HT+D3)/2, z);
    { const a=new THREE.Shape(); a.moveTo(-3.05,D3); a.lineTo(-2.55,D3); a.quadraticCurveTo(-1.9,10.9,-1.2,10.95); a.lineTo(1.2,10.95); a.quadraticCurveTo(1.9,10.9,2.55,D3); a.lineTo(3.05,D3); a.quadraticCurveTo(2.2,11.55,1.3,11.55); a.lineTo(-1.3,11.55); a.quadraticCurveTo(-2.2,11.55,-3.05,D3);
      const g=new THREE.ExtrudeGeometry(a,{depth:.5, bevelEnabled:true, bevelThickness:.05, bevelSize:.05, bevelSegments:3, curveSegments:16}); g.translate(0,0,1.15); B.put(M.white,g); }
    B.put(M.white, new THREE.SphereGeometry(.42,18,12), 0, 11.98, 1.42); B.put(M.white, new THREE.SphereGeometry(.26,14,10), 1.3, 11.8, 1.42); B.put(M.dark, new THREE.CylinderGeometry(.09,.12,.4,10), 0, 11.6, 1.42);
    for(const x of [-1.6,1.6]) B.put(M.dark, new THREE.CylinderGeometry(.018,.03,1.0,6), x, 11.95, 1.4);
    B.put(M.dark, rbox(1.6,.1,.18,.04,1), 0, 11.7, 1.0);   /* thanh radar quét */
    /* cầu thang ngoài B (boong sau → boong trên) và C (boong trên → sun deck): bậc teak + nẹp vàng + cốn trắng + tay vịn inox */
    const stairs=(st,mat=B)=>{ const [x0,x1,z0,z1,h0,h1]=st, n=Math.round(Math.abs(h1-h0)/.2), w=x1-x0, cx=(x0+x1)/2;
      for(let i=0;i<n;i++){ const t=(i+.5)/n, z=lerp(z0,z1,t), y=lerp(h0,h1,(i+1)/n); mat.put(M.teak, rbox(w-.08,.06,Math.abs(z1-z0)/n+.04,.015,1), cx, y-.03, z); mat.put(M.gold, rbox(w-.1,.02,.03,.008,1), cx, y+.004, z+(z1>z0?-1:1)*(Math.abs(z1-z0)/n/2-.02)); }
      for(const x of [x0+.03,x1-.03]){ const s=new THREE.Shape([new THREE.Vector2(z0,h0-.25),new THREE.Vector2(z1,h1-.25),new THREE.Vector2(z1,h1+.05),new THREE.Vector2(z0,h0+.05)]); const g=new THREE.ExtrudeGeometry(s,{depth:.05, bevelEnabled:false}); g.rotateY(-Math.PI/2); g.translate(x+.025,0,0); mat.put(M.white,g); mat.put(M.chrome, tube([[x,h0+1.0,z0],[x,h1+1.0,z1]],.028,false,6)); } };
    stairs(STAIR.B); stairs(STAIR.C);
    /* cờ đuôi + cột */ B.put(M.chrome, new THREE.CylinderGeometry(.025,.03,2.2,6), 0, D1+1.1+.95, -20.2); B.put(M.navy, rbox(.9,.55,.02,.01,1), .45, D1+2.9, -20.2, Math.PI/2); B.put(M.gold, rbox(.5,.08,.025,.01,1), .45, D1+2.9, -20.2, Math.PI/2);
    /* xuồng máy nhỏ neo sau đuôi (tender 5,2 m) + dây neo */
    { const ts=sh([['M',-.95,-2.6],['L',.95,-2.6],['L',1,0],['Q',.95,1.9,0,2.6],['Q',-.95,1.9,-1,0],['L',-.95,-2.6]]); const g=ext(ts,-.35,.95,{bevel:.06,cs:10}), p=g.attributes.position; for(let i=0;i<p.count;i++){ const t=clamp((p.getY(i)+.35)/.95,0,1); p.setX(i,p.getX(i)*(.45+.55*Math.sin(t*Math.PI/2))); } g.computeVertexNormals(); B.put(M.white,g,0,0,-28);
      B.put(M.teak, rbox(1.4,.04,3.2,.05,1),0,.55,-28.4); B.put(M.navy, rbox(.8,.5,.9,.08,2),0,.8,-27.6); B.put(M.dark, rbox(.4,.5,.4,.06,1),0,.62,-30.45); B.put(M.chrome, tube([[0,.62,-22.55],[0,.15,-24.2],[0,.55,-25.5]],.02,false,10)); }
    return B.merged(); }

  /* ============================== NỘI THẤT (chỉ tàu gần người chơi) + va chạm / ghế / điểm E ============================== */
  const WALLS=[], CIRC=[], SEATS=[], SPOTS={};
  const MAIN=[1.2,4.5], UP=[4.4,7.7], SUN=[7.6,10.6], ALL=[1.2,10.6];
  const wall=(ax,az,bx,bz,r)=>WALLS.push([ax,az,bx,bz,r[0],r[1]]);
  const wallPts=(pts,r,closed,gap=()=>false,step=3)=>{ const sp=[]; for(let i=0;i<pts.length;i+=step) sp.push(pts[i]); if(closed) sp.push(pts[0]); for(let i=0;i<sp.length-1;i++){ const a=sp[i], b=sp[i+1]; if(gap((a[0]+b[0])/2,(a[1]+b[1])/2)) continue; wall(a[0],a[1],b[0],b[1],r); } };
  const boxWall=(x0,x1,z0,z1,r)=>{ wall(x0,z0,x1,z0,r); wall(x1,z0,x1,z1,r); wall(x1,z1,x0,z1,r); wall(x0,z1,x0,z0,r); };
  wallPts(offsetLine(DECK_PTS,.12,true),MAIN,true,(x,z)=>z<-19.9 && Math.abs(x)<1.15);
  wallPts(msPts,MAIN,true,gapMS); wallPts(usPts,UP,true,gapUS); wallPts(offsetLine(sdPts,.1,true),SUN,true);
  wall(-3.5,4.8,-.7,4.8,MAIN); wall(.7,4.8,3.5,4.8,MAIN); wall(1,4.8,1,5.9,MAIN); wall(1,6.9,1,7.8,MAIN); wall(1,7.8,3.5,7.8,MAIN);
  wall(-2.15,-4.6,-2.15,-.4,[1.2,7.7]); wall(-3.5,-.4,-2.15,-.4,[1.2,3.2]); wall(-3.35,-4.6,-2.15,-4.6,UP);
  wall(-3.7,-18.6,-3.7,-14.6,[1.2,7.7]); wall(-2.5,-18.6,-2.5,-14.6,[1.2,7.7]); wall(-3.7,-14.6,-2.5,-14.6,[1.2,3.2]);
  wall(-2.5,-14.6,3.75,-14.6,UP); wall(-3.75,-14.6,-3.75,-8,UP); wall(3.75,-14.6,3.75,-8,UP);
  wall(2.1,-13.3,2.1,-9.5,[4.4,10.6]); wall(3.3,-13.3,3.3,-9.5,[4.4,10.6]); wall(2.1,-13.3,3.3,-13.3,[4.4,6.4]); wall(2.1,-9.5,3.3,-9.5,SUN);
  for(const e of [-1,1]){ wall(e*2.5,1.1,e*3.1,1.1,SUN); wall(e*3.1,1.1,e*3.1,1.7,SUN); wall(e*3.1,1.7,e*2.5,1.7,SUN); wall(e*2.5,1.7,e*2.5,1.1,SUN); }   /* chân vòm radar */
  for(const [x,z] of [[-2.95,-7.9],[2.95,-7.9],[-2.9,-.2],[2.9,-.2]]) CIRC.push([x,z,.12,SUN[0],SUN[1]]);   /* cột mái che */
  wall(-3.3,1,-.6,1,UP); wall(.6,1,3.3,1,UP); for(const x of [-.6,.6]){ wall(x,1,x,2.6,UP); wall(x,3.6,x,5.5,UP); } wall(-3.3,5.5,-.6,5.5,UP); wall(.6,5.5,3.3,5.5,UP);
  const FLOORS=[[-4.5,4.5,-20.4,9.4,D1],[-4.2,4.2,9.4,14.8,D1],[-3.2,3.2,14.8,18.9,D1],[-1.7,1.7,18.9,20.6,D1],[-4.2,4.2,-22.6,-20.45,.45],[-3.72,3.72,-14.6,-8,D2],[-3.15,3.15,-8,9.3,D2],[-3.5,3.5,-14.6,8.6,D3]];
  const HOLES=[[...STAIR.A.slice(0,4),D2],[...STAIR.C.slice(0,4),D3]], RAMPS=[STAIR.S,STAIR.B,STAIR.A,STAIR.C];
  const seat=(x,z,y,face,floor,o={})=>SEATS.push({x,z,y,face,floor,label:o.label||'🪑 Ngồi (E)',lie:!!o.lie,soak:!!o.soak,dine:!!o.dine,taken:false});   /* face = hướng mặt (nằm: hướng về phía chân) */

  function buildInterior(){ const B=bag();
    const sofa=(x,z,len,ry,floor,mat=IM.cream,seats=true)=>{ const c=Math.cos(ry), s=Math.sin(ry), P=(lx,lz)=>[x+lx*c+lz*s, z-lx*s+lz*c];
      B.put(mat, rbox(len,.42,.86,.08,2), ...[P(0,0)].map(([a,b])=>[a,floor+.21,b])[0], ry); B.put(mat, rbox(len,.5,.22,.08,2), ...[P(0,-.36)].map(([a,b])=>[a,floor+.62,b])[0], ry);
      for(const e of [-1,1]){ const [a,b]=P(e*(len/2+.1),-.02); B.put(mat, rbox(.22,.62,.9,.07,2), a, floor+.31, b, ry); }
      const n=Math.max(1,Math.round(len/.75)); if(seats) for(let i=0;i<n;i++){ const [a,b]=P((i-(n-1)/2)*len/n,.08); seat(a,b,floor+.45,ry,floor); }
      const hw=len/2+.22, hd=.48, cs=[P(-hw,-hd),P(hw,-hd),P(hw,hd),P(-hw,hd)], r=floor<2?MAIN:floor<6?UP:SUN; for(let i=0;i<4;i++) wall(...cs[i],...cs[(i+1)%4],r); };
    const table=(x,z,w,d,floor,top=IM.marble,base=M.gold,h=.45)=>{ B.put(top, rbox(w,.06,d,.03,2), x, floor+h, z); B.put(base, lathe([[0,0],[.28,0],[.3,.03],[.08,.08],[.06,h-.06],[.16,h-.03],[0,h-.03]],16), x, floor, z); };
    const lamp=(x,z,y)=>{ B.put(M.gold, lathe([[0,0],[.09,0],[.1,.02],[.03,.05],[.025,.28],[0,.3]],12), x, y, z); B.put(IM.glow, lathe([[.07,0],[.14,.18],[.0,.18]],14), x, y+.26, z); };
    const ceilGlow=(x0,x1,z0,z1,y)=>B.put(IM.glow, rbox(x1-x0,.03,z1-z0,.01,1), (x0+x1)/2, y, (z0+z1)/2);
    /* ----- TẦNG 1 · BOONG SAU: sofa chữ U ôm bàn ăn teak ngoài trời ----- */
    sofa(.6,-19.2,3.0,0,D1); sofa(2.35,-17.2,2.6,-Math.PI/2,D1);   /* sofa chữ L ôm bàn ăn, chừa lối mạn trái lên cầu thang B */ table(0,-17.3,2.6,1.2,D1,M.teak,M.chrome,.72); boxWall(-1.3,1.3,-17.9,-16.7,MAIN);
    for(const x of [-.7,.6]){ B.put(M.teak, rbox(.46,.06,.46,.02,1), x, D1+.45, -16.2); B.put(M.teak, rbox(.46,.5,.06,.02,1), x, D1+.72, -15.97); for(const [a,b] of [[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]]) B.put(M.chrome, new THREE.CylinderGeometry(.018,.018,.44,6), x+a, D1+.22, -16.2+b); seat(x,-16.2,D1+.5,Math.PI,D1,{label:'🍽️ Ngồi bàn boong sau – gọi món (E)', dine:true}); }
    /* ----- MAIN SALON: thảm Ba Tư · 2 sofa da kem-nâu · bàn trà cẩm thạch · TV 85" · quầy bar ----- */
    B.put(IM.rug, new THREE.PlaneGeometry(4.2,5.2), 0, D1+.015, -8.6, 0, -Math.PI/2);
    sofa(-2.6,-8.6,3.0,Math.PI/2,D1,IM.cream); sofa(1.0,-11.2,2.4,0,D1,IM.brown);
    table(-.4,-8.6,1.1,1.8,D1); boxWall(-1.0,.2,-9.55,-7.65,MAIN);
    B.put(M.dark, rbox(2.0,1.18,.08,.03,1), 2.95, D1+1.45, -8.4, -Math.PI/2); B.put(IM.screen, new THREE.PlaneGeometry(1.9,1.07), 2.9, D1+1.45, -8.4, -Math.PI/2); B.put(IM.walnut, rbox(.5,.5,2.4,.05,2), 3.1, D1+.25, -8.4); boxWall(2.85,3.4,-9.6,-7.2,MAIN);
    B.put(IM.mahog, rbox(.62,1.05,2.6,.06,2), 2.9, D1+.52, -5.6); B.put(IM.marble, rbox(.72,.05,2.7,.02,2), 2.86, D1+1.08, -5.6); B.put(M.gold, tube([[2.5,D1+.18,-6.9],[2.5,D1+.18,-4.3]],.025,false,6)); boxWall(2.55,3.4,-6.95,-4.25,MAIN);
    for(const z of [-6.4,-5.6,-4.8]){ B.put(M.chrome, lathe([[0,0],[.2,0],[.2,.02],[.03,.06],[.03,.72],[0,.72]],12), 2.15, D1, z); B.put(IM.brown, lathe([[0,0],[.2,0],[.21,.05],[.18,.1],[0,.1]],14), 2.15, D1+.72, z); seat(2.15,z,D1+.8,Math.PI/2,D1,{label:'🍸 Ngồi quầy bar (E)'}); }
    SPOTS.bar={x:2.0,z:-5.6,y:D1,label:'🍸 Gọi đồ uống ở quầy bar'};
    for(let i=0;i<5;i++) B.put(i%2?M.gold:IM.glow, lathe([[0,0],[.04,0],[.045,.18],[.015,.24],[.015,.3],[0,.3]],10), 3.12, D1+1.11, -6.6+i*.45);
    ceilGlow(-3,3,-12.4,-4.6,D2-.25);
    /* ----- PHÒNG ĂN: bàn gụ 10 ghế + đèn chùm pha lê ----- */
    B.put(IM.mahog, rbox(1.1,.07,3.9,.03,2), .9, D1+.74, .7); for(const z of [-.4,1.8]) B.put(M.gold, lathe([[0,0],[.32,0],[.33,.03],[.07,.1],[.05,.7],[.2,.72],[0,.72]],16), .9, D1, z); boxWall(-.42,2.22,-2.0,3.42,MAIN);
    const chair=(x,z,ry)=>{ const c=Math.cos(ry), s=Math.sin(ry); B.put(IM.cream, rbox(.48,.09,.48,.03,1), x, D1+.46, z, ry); B.put(IM.cream, rbox(.48,.62,.07,.03,1), x-s*.22, D1+.8, z-c*.22, ry); for(const [a,b] of [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]]) B.put(IM.walnut, new THREE.CylinderGeometry(.02,.018,.44,6), x+a*c+b*s, D1+.22, z-a*s+b*c); seat(x,z,D1+.52,ry,D1,{label:'🍽️ Ngồi bàn ăn – gọi món (E)', dine:true}); };
    for(const z of [-.6,.3,1.2,2.1]){ chair(-.15,z,Math.PI/2); chair(1.95,z,-Math.PI/2); } chair(.9,-1.75,0); chair(.9,3.15,Math.PI);
    SPOTS.dining={x:.9,z:.7,y:D1};
    B.put(IM.glow, lathe([[0,-.55],[.22,-.45],[.42,-.22],[.5,0],[.38,.12],[0,.16]],20), .9, D2-.95, .7); B.put(M.gold, new THREE.TorusGeometry(.55,.025,6,28), .9, D2-.95, .7, 0, Math.PI/2); B.put(M.gold, new THREE.CylinderGeometry(.015,.015,.6,6), .9, D2-.5, .7);
    ceilGlow(-1.8,3,-4.2,4.4,D2-.25);
    /* cầu thang A gỗ-kính (phòng ăn → Sky Lounge) */
    { const [x0,x1,z0,z1,h0,h1]=STAIR.A, n=16; for(let i=0;i<n;i++){ const t=(i+.5)/n; B.put(IM.walnut, rbox(x1-x0-.06,.06,(z1-z0)/n+.04,.015,1), (x0+x1)/2, lerp(h0,h1,(i+1)/n)-.03, lerp(z0,z1,t)); B.put(M.gold, rbox(x1-x0-.08,.015,.025,.006,1), (x0+x1)/2, lerp(h0,h1,(i+1)/n)+.003, lerp(z0,z1,t)-(z1-z0)/n/2+.02); }
      const s=new THREE.Shape([new THREE.Vector2(z0,h0),new THREE.Vector2(z1,h1),new THREE.Vector2(z1,h1+.95),new THREE.Vector2(z0,h0+.95)]), g=new THREE.ExtrudeGeometry(s,{depth:.02, bevelEnabled:false}); g.rotateY(-Math.PI/2); g.translate(x1+.01,0,0); B.put(M.glassNear,g); B.put(M.gold, tube([[x1,h0+.98,z0],[x1,h1+.98,z1]],.03,false,6)); B.put(M.chrome, new THREE.CylinderGeometry(.05,.05,1.1,10), x1, h0+.55, z0); }
    /* ----- MASTER SUITE (mũi tàu): giường King, kính cong 270°, phòng tắm cẩm thạch ----- */
    for(const e of [-1,1]) B.put(IM.walnut, rbox(2.75,2.9,.1,.02,1), e*2.1, D1+1.45, 4.86);   /* vách gỗ ngăn phòng ăn – cửa giữa rộng 1,4 m */
    B.put(IM.walnut, rbox(2.3,.38,2.25,.06,2), -.3, D1+.19, 9.2); B.put(IM.fabric, rbox(2.15,.26,2.1,.1,2), -.3, D1+.5, 9.25); B.put(IM.velvet, rbox(2.5,1.15,.14,.06,2), -.3, D1+.75, 8.0);
    B.put(IM.bordeaux, rbox(2.18,.05,.7,.03,1), -.3, D1+.65, 9.95); for(const x of [-.85,.25]) B.put(IM.cream, rbox(.7,.16,.42,.08,2), x, D1+.72, 8.4);
    for(const x of [-1.85,1.25]){ B.put(IM.walnut, rbox(.5,.5,.45,.04,2), x, D1+.25, 8.3); lamp(x,8.3,D1+.5); } boxWall(-1.5,.9,7.9,10.4,MAIN);
    seat(-.3,9.35,D1+.62,0,D1,{lie:true,label:'🛏️ Nằm giường King (E)'});
    sofa(-.2,12.0,2.2,Math.PI,D1,IM.cream);
    B.put(IM.marble, new THREE.PlaneGeometry(2.4,2.9), 2.25, D1+.012, 6.35, 0, -Math.PI/2); B.put(IM.marble, rbox(.6,.85,1.6,.03,1), 3.15, D1+.43, 6.3); B.put(M.white, lathe([[0,.0],[.2,0],[.24,.08],[.22,.16],[0,.12]],18), 3.15, D1+.86, 6.3);
    B.put(M.chrome, rbox(.04,1.0,1.4,.01,1), 3.42, D1+1.6, 6.3); B.put(M.glassNear, rbox(.02,2.0,1.1,.005,1), 1.6, D1+1.0, 7.25, Math.PI/2); B.put(M.white, lathe([[0,0],[.2,0],[.22,.38],[.18,.42],[0,.4]],16), 1.4, D1, 5.25);
    B.put(IM.marble, rbox(.1,2.9,1.1,.02,1), 1.0, D1+1.45, 5.35); B.put(IM.marble, rbox(.1,2.9,.9,.02,1), 1.0, D1+1.45, 7.35); B.put(IM.marble, rbox(2.5,2.9,.1,.02,1), 2.25, D1+1.45, 7.8); boxWall(2.8,3.5,5.4,7.2,MAIN);
    ceilGlow(-2.4,.6,6,11,D2-.25); ceilGlow(1.3,3.2,5.1,7.5,D2-.25);
    SPOTS.suite={x:-.3,z:11,y:D1};
    /* ----- TẦNG 2 · SKY LOUNGE: sofa nhung lục bảo, đàn grand piano, bàn trà ----- */
    sofa(2.55,-4.0,3.4,-Math.PI/2,D2,IM.velvet); sofa(-2.55,-6.0,2.4,Math.PI/2,D2,IM.velvet); table(.6,-4.2,1.0,1.6,D2); boxWall(.05,1.15,-5.05,-3.35,UP);
    { const p=sh([['M',-.75,-1],['L',.75,-1],['L',.75,.2],['C',.75,1.0,.3,1.0,.1,1.3],['Q',-.1,1.7,-.5,1.7],['Q',-.75,1.7,-.75,1.2],['L',-.75,-1]]); B.put(IM.lacquer, ext(p,D2+.62,.32,{bevel:.03}), -1.4, 0, -2.3); const lid=ext(p,0,.03,{bevel:0}); lid.rotateZ(.38); lid.translate(-1.4+.05,D2+1.02,-2.3); B.put(IM.lacquer,lid);
      for(const [x,z] of [[-.6,-.85],[.6,-.85],[-.55,1.4]]) B.put(IM.lacquer, new THREE.CylinderGeometry(.05,.04,.62,8), -1.4+x, D2+.31, -2.3+z); B.put(M.white, rbox(1.4,.03,.18,.01,1), -1.4, D2+.95, -3.4); B.put(IM.lacquer, rbox(.9,.45,.35,.04,1), -1.4, D2+.23, -3.9); boxWall(-2.15,-.6,-3.5,-.55,UP);
      SPOTS.piano={x:-1.4,z:-4.4,y:D2,label:'🎹 Đàn vài nốt trên grand piano (E)'}; seat(-1.4,-3.9,D2+.47,0,D2,{label:'🎹 Ngồi ghế đàn piano (E)'}); }
    ceilGlow(-3,3,-7.6,.6,D3-.25);
    /* ----- 2 PHÒNG VIP (giường đôi, đèn ngủ vàng ấm) + hành lang ----- */
    for(const e of [-1,1]){ const cx=e*1.95; B.put(IM.walnut, rbox(.08,2.9,1.6,.02,1), e*.62, D2+1.45, 1.8); B.put(IM.walnut, rbox(.08,2.9,1.9,.02,1), e*.62, D2+1.45, 4.55); B.put(IM.walnut, rbox(2.7,2.9,.08,.02,1), cx, D2+1.45, .98); B.put(IM.walnut, rbox(2.7,2.9,.08,.02,1), cx, D2+1.45, 5.52);
      B.put(IM.walnut, rbox(1.55,.34,2.05,.05,2), e*2.35, D2+.17, 3.75); B.put(IM.fabric, rbox(1.45,.22,1.95,.08,2), e*2.35, D2+.44, 3.72); B.put(IM.bordeaux, rbox(1.47,.05,.55,.03,1), e*2.35, D2+.56, 3.05); B.put(IM.velvet, rbox(1.6,1.0,.1,.04,1), e*2.35, D2+.7, 4.85);
      for(const x of [1.6,2.0]) B.put(IM.cream, rbox(.36,.14,.3,.07,2), e*(x+.15), D2+.62, 4.5); B.put(IM.walnut, rbox(.4,.45,.4,.03,1), e*1.3, D2+.22, 5.0); lamp(e*1.3,5.0,D2+.45); boxWall(e>0?1.55:-3.15, e>0?3.15:-1.55, 2.65, 4.95, UP);
      seat(e*2.35,3.75,D2+.56,Math.PI,D2,{lie:true,label:'🛏️ Nằm nghỉ phòng VIP (E)'}); ceilGlow(e>0?.8:-3.1, e>0?3.1:-.8, 1.2, 5.3, D3-.25); }
    /* ----- BUỒNG LÁI: bàn điều khiển cong, vô lăng, 3 màn radar, ghế thuyền trưởng ----- */
    { const c=sh([['M',-2.6,7.6],['Q',0,9.3,2.6,7.6],['L',2.6,8.15],['Q',0,9.85,-2.6,8.15],['L',-2.6,7.6]]); B.put(M.dark, ext(c,D2,.95,{bevel:.04,cs:20})); boxWall(-2.6,2.6,7.5,9.3,UP);
      for(const [x,r] of [[-1.3,.38],[0,0],[1.3,-.38]]) B.put(IM.radar, new THREE.PlaneGeometry(.9,.45), x, D2+1.18, 8.55-Math.abs(x)*.28, Math.PI-r, .5);
      B.put(IM.mahog, new THREE.TorusGeometry(.32,.035,8,24), .9, D2+1.15, 7.45, 0, -.6); for(let i=0;i<3;i++) B.put(M.chrome, rbox(.6,.025,.025,.01,1), .9, D2+1.15, 7.45, 0, -.6, i*Math.PI/3);
      B.put(M.chrome, lathe([[0,0],[.28,0],[.28,.03],[.05,.06],[.05,.5],[0,.5]],14), .9, D2, 6.75); B.put(IM.brown, rbox(.62,.14,.6,.06,2), .9, D2+.55, 6.75); B.put(IM.brown, rbox(.6,.7,.12,.06,2), .9, D2+.95, 6.45);
      B.put(M.gold, lathe([[0,0],[.12,0],[.12,.05],[0,.08]],14), -.9, D2+.97, 8.2); SPOTS.helm={x:.9,z:6.2,y:D2,label:'⚓ Hỏi chuyện thuyền trưởng (E)'}; }
    ceilGlow(-2.4,2.4,5.7,7.4,D3-.25);
    /* ----- TẦNG 3 · SUN DECK: Jacuzzi kính sủi bọt, 4 ghế tắm nắng, quầy cocktail + BBQ dưới mái che ----- */
    B.put(M.teak, lathe([[1.45,0],[1.5,.05],[1.5,.55],[1.4,.62],[1.25,.62],[1.22,.1],[0,.1]],32), 0, D3, 5.4); B.put(IM.water, new THREE.CircleGeometry(1.22,32), 0, D3+.48, 5.4, 0, -Math.PI/2); B.put(M.chrome, new THREE.TorusGeometry(1.36,.03,6,40), 0, D3+.64, 5.4, 0, Math.PI/2);
    CIRC.push([0,5.4,1.55,SUN[0],SUN[1]]); for(const a of [Math.PI*.75,Math.PI*1.25]) seat(Math.sin(a)*.8,5.4+Math.cos(a)*.8,D3+.15,a+Math.PI,D3,{soak:true,label:'♨️ Ngâm bồn sục Jacuzzi (E)'}); SPOTS.jacuzzi={x:0,z:5.4,y:D3};
    const lounger=(x,z,feet)=>{ B.put(M.teak, rbox(.72,.24,1.95,.04,2), x, D3+.12, z); B.put(IM.cream, rbox(.68,.1,1.3,.04,2), x, D3+.29, z+feet*.3); B.put(IM.cream, rbox(.68,.1,.66,.04,2), x, D3+.5, z-feet*.62, 0, feet*.7);   /* lưng tựa nghiêng phía đầu */
      seat(x,z+feet*.15,D3+.42,feet>0?0:Math.PI,D3,{lie:true,label:'🌞 Nằm ghế tắm nắng (E)'}); boxWall(x-.42,x+.42,z-1.0,z+1.0,SUN); };
    lounger(-.9,-12.6,-1); lounger(-2.2,-12.6,-1); lounger(-1.6,7.6,1); lounger(1.6,7.6,1);
    B.put(IM.mahog, rbox(.62,1.05,2.4,.06,2), -2.75, D3+.52, -4.5); B.put(IM.marble, rbox(.72,.05,2.5,.02,1), -2.7, D3+1.08, -4.5); boxWall(-3.4,-2.4,-5.8,-3.2,SUN);
    for(const z of [-5.3,-4.5,-3.7]){ B.put(M.chrome, lathe([[0,0],[.18,0],[.18,.02],[.03,.05],[.03,.72],[0,.72]],12), -2.05, D3, z); B.put(IM.cream, lathe([[0,0],[.19,0],[.2,.05],[0,.09]],14), -2.05, D3+.72, z); seat(-2.05,z,D3+.8,-Math.PI/2,D3,{label:'🍹 Ngồi quầy cocktail (E)'}); }
    for(let i=0;i<6;i++) B.put([IM.glow,M.gold,M.navy][i%3], lathe([[0,0],[.04,0],[.045,.2],[.015,.27],[.015,.32],[0,.32]],10), -2.9, D3+1.11, -5.4+i*.35);
    SPOTS.cocktail={x:-1.8,z:-4.5,y:D3,label:'🍹 Gọi cocktail ở quầy Sun Deck'};
    B.put(M.chrome, rbox(.7,.9,1.4,.05,2), 2.8, D3+.45, -4.6); B.put(M.dark, rbox(.6,.04,1.2,.01,1), 2.8, D3+.92, -4.6); for(let i=0;i<7;i++) B.put(M.chrome, rbox(.56,.02,.02,.005,1), 2.8, D3+.95, -5.1+i*.17); boxWall(2.4,3.3,-5.4,-3.8,SUN);
    table(0,-2.2,1.2,2.0,D3,M.teak,M.chrome,.72); for(const x of [-1.0,1.0]) for(const z of [-2.8,-1.6]){ B.put(IM.cream, rbox(.46,.08,.46,.02,1), x, D3+.45, z); B.put(M.chrome, new THREE.CylinderGeometry(.025,.025,.45,6), x, D3+.22, z); seat(x,z,D3+.5,x<0?Math.PI/2:-Math.PI/2,D3,{label:'🍹 Ngồi bàn Sun Deck – gọi món (E)', dine:true}); } boxWall(-.62,.62,-3.25,-1.15,SUN);
    ceilGlow(-2.9,2.9,-7.9,1.2,HT-.04);
    /* ----- BOONG TRÊN PHÍA SAU: 2 ghế lounge + bàn nhỏ ----- */
    sofa(-1.0,-13.9,2.2,0,D2,IM.cream); table(-1.0,-12.6,.9,.6,D2,M.teak,M.chrome,.42); boxWall(-1.5,-.5,-12.95,-12.25,UP);
    SPOTS.gangway={x:3.7,z:-15.6,y:D1}; SPOTS.swim={x:0,z:-21.9,y:.45};
    return B.merged(); }

  /* ============================== SÀN · TRẦN · VA CHẠM (hệ toạ độ tàu) ============================== */
  const deck={
    floorAt(x,z,y){ let best=-1e9; for(const f of FLOORS){ if(x<f[0]||x>f[1]||z<f[2]||z>f[3]) continue; const h=f[4]; if(h>y+.65 || h<=best) continue; if(HOLES.some(o=>o[4]===h && x>o[0]&&x<o[1]&&z>o[2]&&z<o[3])) continue; best=h; }
      for(const r of RAMPS){ if(x<r[0]||x>r[1]) continue; const lo=Math.min(r[2],r[3]), hi=Math.max(r[2],r[3]); if(z<lo||z>hi) continue; const h=lerp(r[4],r[5],(z-r[2])/(r[3]-r[2])); if(h<=y+.65 && h>best) best=h; }
      return best>-1e8?best:null; },
    ceilAt(x,z,y){ if(y<D2-1 && z>-14.6 && z<14 && Math.abs(x)<3.8) return D2-.35; if(y>=D2-1 && y<D3-1 && z>-14.6 && z<9.9 && Math.abs(x)<3.65) return D3-.35; if(y>=D3-1 && z>-8.2 && z<1.8 && Math.abs(x)<3.2) return HT-.25; return null; },
    collide(p,y,r=.32){ for(const w of WALLS){ if(y<w[4]-.3||y>w[5]) continue; const ex=w[2]-w[0], ez=w[3]-w[1], L2=ex*ex+ez*ez||1e-9; let t=((p.x-w[0])*ex+(p.z-w[1])*ez)/L2; t=t<0?0:t>1?1:t; const cx=w[0]+ex*t, cz=w[1]+ez*t, dx=p.x-cx, dz=p.z-cz, d=Math.hypot(dx,dz); if(d<r){ if(d>1e-5){ p.x=cx+dx/d*r; p.z=cz+dz/d*r; } p.hit=true; } }
      for(const c of CIRC){ if(y<c[3]-.3||y>c[4]) continue; const dx=p.x-c[0], dz=p.z-c[1], d=Math.hypot(dx,dz), m=c[2]+r*.5; if(d<m && d>1e-5){ p.x=c[0]+dx/d*m; p.z=c[1]+dz/d*m; p.hit=true; } } },
    WALLS, SEATS, SPOTS, FLOORS };

  /* ============================== ĐỘI TÀU (InstancedMesh) + TÀU GẦN (bản đầy đủ) ============================== */
  const EXT=buildExterior(); let INT=null;
  const farMat=m=>m===M.glassNear?M.glassFar:m;
  function makeFleet(n, parent){ const meshes=EXT.map(({mat,geo})=>{ const im=new THREE.InstancedMesh(geo,mat,n); im.castShadow=mat===M.hull||mat===M.white; im.receiveShadow=true; im.frustumCulled=false; im.userData.dynamic=true; im.name='aby-yacht-'+(mat===M.hull?'hull':'part'); parent.add(im); return im; });
    const Z=new THREE.Matrix4().makeScale(0,0,0);
    return { meshes, set(i,m){ for(const im of meshes) im.setMatrixAt(i,m); }, hide(i){ for(const im of meshes) im.setMatrixAt(i,Z); }, commit(){ for(const im of meshes) im.instanceMatrix.needsUpdate=true; } }; }
  function makeNear(parent){ const g=new THREE.Group(); g.name='aby-yacht-near'; g.userData.dynamic=true; parent.add(g);
    for(const {mat,geo} of EXT){ const m=new THREE.Mesh(geo, mat===M.glassFar?M.glassNear:mat); m.castShadow=mat===M.hull||mat===M.white; m.receiveShadow=true; m.userData.dynamic=true; g.add(m); }
    const N={ g, built:false, actors:[], build(){ if(N.built) return; N.built=true; if(!INT) INT=buildInterior(); for(const {mat,geo} of INT){ const m=new THREE.Mesh(geo,mat); m.receiveShadow=true; m.castShadow=false; m.userData.dynamic=true; g.add(m); if(mat===IM.water) N.water=m; } N.npc(); },
      npc(){ const people=W.people; if(!people || !W.makeActor) return;
        /* pose 'sit': y = mặt ghế (hông đặt đúng mặt ghế) · 'tray'/'look': y = sàn */
        const add=(seed,outfit,name,x,z,y,face,pose)=>{ try{ const kk=people.kit(seed,{outfit}); const a=W.makeActor(kk.gl,{name, height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#4fc3ff'}); a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a), hh=po.hipsHeight();
            a.g.position.set(x, pose==='sit'?y+.06-hh:y, z); a.g.rotation.y=face; g.add(a.g); N.actors.push({a,po,pose,x,z,y,face,name:/Thuyền trưởng/.test(name)?'cap':'p'}); const s=SEATS.find(o=>Math.hypot(o.x-x,o.z-z)<.35 && Math.abs(o.floor-(pose==='sit'?y-.5:y))<1); if(s) s.taken='npc'; else if(pose!=='sit') CIRC.push([x,z,.3,y-.4,y+2]); return a; }catch(e){ console.warn('[abyssal_yacht] npc', e); } };
        const pick=(f,s)=>people.pickSeed(L=>f?L.female:!L.female,s);
        add(pick(0,701),{shirt:0xf4f1ea, pants:0x14284f, long:true, style:'cap'},'⚓ Thuyền trưởng',.9,6.78,D2+.62,0,'sit');
        add(pick(1,702),{shirt:0xf4f1ea, pants:0x1c2026, long:true},'🍸 Phục vụ boong sau',1.3,-15.4,D1,-Math.PI/2,'tray');
        add(pick(0,703),{shirt:0xf4f1ea, pants:0x1c2026, long:true},'🍹 Bartender Sun Deck',-3.18,-4.5,D3,Math.PI/2,'tray');
        add(pick(1,704),{shirt:0xd94f6a, shorts:true},'🧳 Khách du thuyền',.23,-19.12,D1+.45,0,'sit');
        add(pick(0,705),{shirt:0x3f8fd9, shorts:true},'🧳 Khách du thuyền',0,16.6,D1,0,'look');
        add(pick(1,706),{shirt:0xf2c14e, shorts:true},'🧳 Khách du thuyền',2.47,-3.32,D2+.45,-Math.PI/2,'sit');
        N.tray=[]; for(const ac of N.actors) if(ac.pose==='tray'){ const t=new THREE.Group(); const disk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.02,18),M.chrome); t.add(disk); for(const [x,z,c] of [[-.08,.04,0xffb84d],[.08,-.03,0xd94f6a]]){ const gl=new THREE.Mesh(lathe([[0,0],[.03,0],[.008,.02],[.008,.08],[.045,.12],[.05,.18],[0,.16]],10),new THREE.MeshStandardMaterial({color:c, roughness:.1, transparent:true, opacity:.75})); gl.position.set(x,.01,z); t.add(gl); } t.position.set(ac.x+Math.sin(ac.face)*.38, ac.y+1.08, ac.z+Math.cos(ac.face)*.38); g.add(t); N.tray.push(t); } },
      update(dt,T,clap,aboard){ if(N.water && N.water.material.normalMap) N.water.material.normalMap.offset.set(T*.05,T*.04);
        if(aboard && W.P){ N.chatT=(N.chatT||0)-dt; if(N.chatT<=0){ N.chatT=1; for(const ac of N.actors){ if((ac.pose!=='sit' && ac.pose!=='look') || ac.name==='cap') continue; ac.a.g.getWorldPosition(_cw); if(Math.hypot(_cw.x-W.P.x,_cw.z-W.P.z)<3.2 && Math.abs(_cw.y-W.P.y)<2.2 && Math.random()<.35){ chat(ac, clap?pick(LINES_CLAP):pick(LINES)); break; } } } }
        for(const ac of N.actors) if(ac.bub){ ac.bubT-=dt; if(ac.bubT<=0){ W.removeLabel(ac.bub); ac.bub=null; } }
        for(const ac of N.actors){ ac.a.mixer.update(dt); const k=ac.pose==='sit'?'sit':ac.pose==='tray'?'present':null; if(k) try{ ac.po.apply(k,T); }catch(e){} if(clap && (ac.pose==='look' || (ac.pose==='sit' && ac.name!=='cap'))) clapArms(ac,T); } } };
    const _cw=new THREE.Vector3(), pick=a=>a[Math.floor(Math.random()*a.length)], LINES=['Chào bạn! Lần đầu đi du thuyền à? 🛥️','Sun Deck có Jacuzzi đấy, lên thử đi!','Combo VIP có cocktail miễn phí nha 🍹','Thuyền trưởng lái êm ghê!'], LINES_CLAP=['Woa, đảo đá vôi kìa! 👏','Đẹp quá trời luôn! 📸','Cổng vòm đá kìa, chụp ngay! 👏'];
    const chat=(ac,t)=>{ if(ac.bub) W.removeLabel(ac.bub); if(!ac.anchor){ ac.anchor=new THREE.Object3D(); ac.anchor.position.y=2.4; ac.a.g.add(ac.anchor); } ac.bub=W.makeLabel(t,null,{fs:38, h:.26, follow:ac.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:20}); ac.bubT=3.2; };
    const _a=new THREE.Vector3(), _b=new THREE.Vector3(), _d=new THREE.Vector3(), _q=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _F=new THREE.Vector3(), _R=new THREE.Vector3(), _U=new THREE.Vector3(0,1,0);
    const aimB=(bn,n,c,f,u,r)=>{ const B0=bn[n], C0=bn[c]; if(!B0||!C0) return; B0.getWorldPosition(_a); C0.getWorldPosition(_b); _b.sub(_a).normalize(); _d.set(0,0,0).addScaledVector(_F,f).addScaledVector(_U,u).addScaledVector(_R,r).normalize(); _q.setFromUnitVectors(_b,_d); B0.getWorldQuaternion(_wq); B0.parent.getWorldQuaternion(_pq); _wq.premultiply(_q); B0.quaternion.copy(_pq.invert().multiply(_wq)); B0.updateMatrixWorld(true); };
    const clapArms=(ac,t)=>{ const bn=ac.po && ac.po.bones; if(!bn || !bn.Hips) return; ac.a.g.updateMatrixWorld(true); ac.a.g.getWorldDirection(_F); _F.y=0; _F.normalize(); _R.set(-_F.z,0,_F.x); const e=Math.abs(Math.sin(t*7+ac.x)); for(const [s2,k] of [['Left',-1],['Right',1]]){ aimB(bn,s2+'Arm',s2+'ForeArm',.7,-.45,k*.25); aimB(bn,s2+'ForeArm',s2+'Hand',.6,.5,-k*(.55+e*.35)); } };
    return N; }

  /* ============================== NGƯỜI CHƠI ĐI BỘ TRÊN TÀU ============================== */
  // opts: { sync(): cập nhật vị trí tàu cho khung hình hiện tại, obj(): Object3D của tàu đang đi, yaw(): hướng tàu, onInter(): danh sách điểm E thêm, onLeave() }
  function makeRider(opts){ const {P, me, cam, HOOK, toast}=W; const v=new THREE.Vector3(), R={on:false, lx:0, lz:0, ly:D1, face:0, vx:0, vz:0, sit:null, hips:null, hipOff:.9};
    me.g.traverse(o=>{ if(!R.hips && o.isBone && /Hips$/.test(o.name)) R.hips=o; });
    const place=()=>{ const o=opts.obj(); o.updateMatrixWorld(true); const s=R.sit; if(s) v.set(s.x, s.y, s.z); else v.set(R.lx,R.ly,R.lz); v.applyMatrix4(o.matrixWorld); return v; };
    const drive=(dt,inp)=>{ if(R.wx!==undefined && Math.hypot(P.x-R.wx,P.z-R.wz)>4){ R.on=false; R.sit=null; HOOK.vehicle=null; HOOK.vehicleInter=null; if(HOOK.camBox && HOOK.camBox._ys) HOOK.camBox=null; if(opts.onAbort) opts.onAbort(); return; }   /* đã dịch chuyển đi (bản đồ M) → rời tàu */
      opts.sync(); const o=opts.obj(), yaw=opts.yaw(); dt=Math.min(dt,.1);
      if(R.sit){ if(inp.ix||inp.iz){ standUp(); return; } const s=R.sit; place(); P.x=v.x; P.z=v.z; P.face=yaw+s.face; P.vx=P.vz=0;
        if(s.lie){ const f=[Math.sin(P.face),Math.cos(P.face)], L=(me.h||1.75)*.53; me.g.position.set(v.x+f[0]*L, v.y+.08, v.z+f[1]*L); me.g.rotation.set(-Math.PI/2+.08, P.face, 0, 'YXZ'); me.play('idle'); P.y=v.y; R.wx=P.x; R.wz=P.z; return; }   /* như life.js: gốc ở phía chân, ngửa mặt */
        if(R.hips){ me.g.updateMatrixWorld(true); const hp=new THREE.Vector3(); R.hips.getWorldPosition(hp); R.hipOff=lerp(R.hipOff, hp.y-me.g.position.y, .5); }
        me.g.position.set(v.x, v.y+.04-(s.soak?R.hipOff+.18:R.hipOff), v.z); me.g.rotation.set(0,P.face,0); me.play(me.acts.sit?'sit':'idle'); P.y=v.y; R.wx=P.x; R.wz=P.z; return; }
      const fx=-Math.sin(cam.yaw), fz=-Math.cos(cam.yaw), rx=Math.cos(cam.yaw), rz=-Math.sin(cam.yaw); let mx=fx*inp.iz+rx*inp.ix, mz=fz*inp.iz+rz*inp.ix; const len=Math.hypot(mx,mz), sp=(inp.boost?3.0:1.35); if(len>0){ mx/=len; mz/=len; }
      const c=Math.cos(yaw), s=Math.sin(yaw), lmx=mx*c-mz*s, lmz=mx*s+mz*c, k=1-Math.exp(-dt*10); R.vx=lerp(R.vx,lmx*sp*(len>0?1:0),k); R.vz=lerp(R.vz,lmz*sp*(len>0?1:0),k);
      const ox=R.lx, oz=R.lz, tryAt=(x,z)=>{ const p={x,z}; deck.collide(p,R.ly); const h=deck.floorAt(p.x,p.z,R.ly); if(h===null || h<R.ly-.8) return null; return {x:p.x,z:p.z,h}; };
      let q=tryAt(R.lx+R.vx*dt, R.lz+R.vz*dt) || tryAt(R.lx+R.vx*dt, R.lz) || tryAt(R.lx, R.lz+R.vz*dt);
      if(q){ R.lx=q.x; R.lz=q.z; R.ly=lerp(R.ly,q.h,1-Math.exp(-dt*16)); if(Math.abs(R.ly-q.h)<.01) R.ly=q.h; }
      const ax=(R.lx-ox)/Math.max(dt,1e-4), az=(R.lz-oz)/Math.max(dt,1e-4), aspd=Math.hypot(ax,az); if(!(len>0) || aspd<.2){ R.vx*=.5; R.vz*=.5; }
      if(!cam.fpv){ if(aspd>.4) R.face=Math.atan2(ax,az); else if(len>0) R.face=Math.atan2(lmx,lmz); }
      place(); P.x=v.x; P.y=v.y; P.z=v.z; R.wx=P.x; R.wz=P.z; P.vx=P.vz=P.vy=0; P.ground=true; P.face=yaw+R.face; me.g.position.copy(v); me.g.rotation.set(0,P.face,0);
      R.speed=lerp(R.speed||0,aspd,1-Math.exp(-dt*12)); if(R.speed>2.2) me.play('run'); else if(R.speed>.25) me.play('walk'); else me.play('idle');
      const cl=deck.ceilAt(R.lx,R.lz,R.ly); if(cl!==null){ HOOK.camBox={x0:-1e6,x1:1e6,z0:-1e6,z1:1e6,y1:o.position.y+cl, _ys:true}; if(cam.dist>5) cam.dist=5; } else if(HOOK.camBox && HOOK.camBox._ys) HOOK.camBox=null; };
    function standUp(){ const s=R.sit; if(!s) return; s.taken=false; R.sit=null; try{ opts.onStand && opts.onStand(s); }catch(e){} const f=[Math.sin(s.face),Math.cos(s.face)]; for(const k of [.75,.5,1.0,-.75]){ const x=s.x+f[0]*k, z=s.z+f[1]*k, h=deck.floorAt(x,z,s.floor+.1); if(h!==null && Math.abs(h-s.floor)<.3){ R.lx=x; R.lz=z; break; } } R.ly=s.floor; me.g.rotation.set(0,P.face,0); }
    R.sitOn=s=>{ if(s.taken) return toast('Chỗ này có người rồi – chọn chỗ khác nhé!',2200); s.taken=true; R.sit=s; toast(s.lie?'Đang nằm thư giãn – bấm E hoặc phím di chuyển để dậy':s.soak?'♨️ Ngâm mình trong bồn sục – bấm E hoặc phím di chuyển để ra':'Đang ngồi – bấm E hoặc phím di chuyển để đứng dậy',2600);  try{ opts.onSit && opts.onSit(s); }catch(e){} };
    R.inter=()=>{ if(R.sit) return {label:'🧍 Đứng dậy (E · phím di chuyển)', action:standUp};
      let best=null, bd=1.35; for(const s of SEATS){ if(s.taken || Math.abs(s.floor-R.ly)>.6) continue; const d=Math.hypot(s.x-R.lx,s.z-R.lz); if(d<bd){ bd=d; best={label:s.label, action:()=>R.sitOn(s)}; } }
      const extra=opts.onInter ? opts.onInter(R) : null; if(extra && (!best || extra.prio)) return extra; return best; };
    R.board=(lx,lz,face=0)=>{ R.on=true; R.wx=undefined; R.lx=lx; R.lz=lz; R.ly=deck.floorAt(lx,lz,9)??D1; R.face=face; R.vx=R.vz=0; R.sit=null; if(P.dancing) P.dancing=false; HOOK.vehicle={drive, yachtRider:true}; HOOK.vehicleInter=R.inter; };
    R.leave=(x,z,face)=>{ if(R.sit) standUp(); R.on=false; HOOK.vehicle=null; HOOK.vehicleInter=null; if(HOOK.camBox && HOOK.camBox._ys) HOOK.camBox=null; P.x=x; P.z=z; P.px=x; P.pz=z; P.y=W.groundAt(x,z); P.vx=P.vz=P.vy=0; P.ground=true; if(face!=null){ P.face=face; me.g.rotation.set(0,face,0); } me.g.position.set(P.x,P.y,P.z); };
    return R; }

  const kit={ L:42, B:9.5, H:12.45, D:[D1,D2,D3], M, IM, makeFleet, makeNear, deck, makeRider, SEATS, SPOTS, STAIR };
  W.__abyYachtKit=kit; return kit; }
