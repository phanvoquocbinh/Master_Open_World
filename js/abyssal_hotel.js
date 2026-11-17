// QC World V2 – Đảo Abyssal · SIÊU KHÁCH SẠN "THE ROYAL LOTUS-CRESCENT PALACE" (phiên C · abyss-hotel, 17/11/2026)
// Theo đặc tả "Canyon Overhaul" Phần 2 (ảnh mẫu image_d2d71f.jpg) + docs/ABYSSAL_OVERHAUL_PLAN.md (brief C). Nạp từ abyssal_island.js (dòng import an toàn).
// Đặt tại W.ABY.plots.hotel = {x, z, r:58, y:+14, core:38, pavR:47, pavA, bridge, dropoff}: mọi thứ của khách sạn nằm trong lõi r ≤ 38 (vành r 38–58 là của A:
// 8 pavilion, đầu 3 cầu kính, cầu ô tô Nam + vòng sảnh đón (0, 32,5) +14). Khách sạn không dựng cầu, không đụng lan can/va chạm của A; porte-cochère mở về vòng đón.
//  • Thềm đá Travertine +14,6 (3 bậc, r 32,5–33,7), sàn Marble khảm la bàn vàng; mái porte-cochère vươn tới r ≈ 37,5 che làn trong của vòng đón.
//  • 2 THÁP CÁNH CUNG (Đông θ −60…60°, Tây θ 120…240°) ôm KHỐI PHA LÊ giữa (24 mặt kính, r 17,5): 24 tầng × 4,95 m, sàn tầng 1 +14,6, mái +133,4 (≈ 119 m trên quảng trường).
//    Ban công mỗi tầng là ExtrudeGeometry bo cạnh (bevel 0,06/0,05/3) mép lượn sóng lệch pha theo tầng, viền ren filigree vàng (alphaTest), lan can kính
//    + tay vịn ống vàng (TubeGeometry/CatmullRom), bồn cây + ghế tắm nắng + đèn lồng (InstancedMesh). Kính Sapphire + đố đứng mỗi ~3,4 m; từ ngoài thấy
//    vách phòng ấm và trần đèn emissive (không dùng đèn thật).
//  • Tầng 1: Porte-cochère mái vàng uốn cong + thảm đỏ + 2 limousine + 2 doorman + 2 bellboy · Grand Atrium cao 28 m (đài phun nhạc nước mạ vàng + tượng
//    sen vàng, thang cuốn đôi chạy thật, 3 thang máy kính toàn cảnh liftkit, lễ tân + concierge, Lobby Lounge có nghệ sĩ Grand Piano – WebAudio nhẹ).
//  • Tầng 2–5 tiện ích: Buffet + Hầm rượu · Spa/Sauna/Bể sục + Gym · CLB Bida Hoàng gia (4 bàn mạ vàng) + Lounge · Hồ bơi vô cực ngoài trời (tầng 5, phía Bắc).
//  • Tầng 6–23 phòng thuê (E): Deluxe Ocean Suite 5.000 💰 (6–15) · Imperial Gold Suite 15.000 💰 (16–21) · Royal Penthouse 2 tầng 35.000 💰 (22–23 cánh Đông,
//    cầu thang cong nội bộ). Giường King/tròn bọc lụa vàng, sofa da, TV cong 100", tủ rượu, Jacuzzi mạ vàng sát kính, quản gia trực ở cửa phòng đã thuê.
//  • Tầng 20: Sky-Cantilever Infinity Pool đáy kính vươn 24 m từ khối pha lê ra phía Nam · Tầng 24 Sky Lounge · mái: vườn trên mái + Bãi đáp trực thăng VIP.
//  • Giữ cổng năng lượng Master Dashboard (sân bệ phía Bắc, E mở Laptop) + màn hình thứ 9 của screens.js nếu chưa ai đặt.
// HIỆU NĂNG (Iris Xe): vỏ gộp theo vật liệu (1 lượt vẽ / vật liệu), vật lặp dùng InstancedMesh; NỘI THẤT + va chạm chỉ dựng cho tầng người chơi đang đứng
//   (sàn/lan can/vật cản của tầng hiện tại ±1 mới nằm trong plats/SEGS/circles – tầng khác gỡ ra), không đèn thật.
// API thử: W.abyHotel = {floor(), Yf(k), rent(type), goRoom(), goPool(), info(), drawInfo()}.
import * as AK from './archKit.js';
import { makeLiftBank } from './liftkit.js';
import { makeLux } from './lux_textures.js';
import { makePoser } from './pose.js';

export async function make(W, ctx={}){
  const {THREE, scene, plats, circles, INTER, PLACES, HOOK, P, cam, toast, makeLabel, teleport} = W;
  if(!THREE || !scene || !W.addSeg) return null;
  const SEGS=W.SEGS || [];
  const ABY=W.ABY || {}, PLOT=(ABY.plots && ABY.plots.hotel) || {x:0, z:-12, r:58, y:14, core:38, pavR:47};
  const CX=PLOT.x, CZ=PLOT.z, GY=PLOT.y, Y0=GY+.6, FH=4.95, Yf=k=>Y0+FH*(k-1), TOPY=Yf(25);
  const D=Math.PI/180, TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
  const R_IN=17.5, R_COR=20.1, R_GL=29.5, R_POD=32.5, R_ST=33.7, CORE=Math.min(38, PLOT.core||38);
  const WINGS=[{key:'E', a0:-60, a1:60, tc:0, name:'Cánh Đông'}, {key:'W', a0:120, a1:240, tc:180, name:'Cánh Tây'}];
  const rb=(td,k)=>31.7+.95*(1+Math.sin(td*D*5+k*.55));           /* mép ban công lượn sóng (r 31,7…33,6), lệch pha theo tầng */
  const XZ=(r,td)=>[CX+r*Math.cos(td*D), CZ+r*Math.sin(td*D)];
  const yawOut=td=>Math.atan2(Math.cos(td*D), Math.sin(td*D));     /* rotation.y để trục +z cục bộ hướng ra ngoài theo bán kính */
  const LOW=W.QUAL==='low';
  /* vòng sảnh đón của phiên A (porte-cochère mở về đây) */
  const DROP=Object.assign({c:[0,32.5], r:6.5, w:6, y:14.03, hub:3.1}, PLOT.dropoff||{}), DV=DROP.c[1]-CZ;   /* DV: khoảng cách tâm vòng đón tới tâm đảo theo z (≈ 44,5) */
  const A_GATE=(W.labels||[]).some(L=>/Cổng Master Dashboard/.test((L.el && L.el.textContent)||''));
  /* góc 8 pavilion của phiên A (nếu A công bố) – trục Nam θ 90° (cầu + vòng đón của A) phải trống ±14° */
  try{ const pa=PLOT.pavA || (ABY.pavilions && ABY.pavilions.map(p=>Math.atan2(p.z-CZ,p.x-CX)/D)); if(pa && pa.some(a=>{ let d=Math.abs(((a-90)%360+540)%360-180); return d<14; })) console.warn('[abyssal_hotel] pavilion nằm trên trục cầu dẫn θ 90° – cần dời pavilion', pa); }catch(e){}

  /* ============================== VẬT LIỆU ============================== */
  W.LUX=W.LUX || makeLux(THREE); const LUX=W.LUX, mk=(t,o)=>LUX.mk(t,o), std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.6, ...o});
  const M={
    trav: mk('TRAVERTINE_WARM',{repeat:[.16,.16]}), sand: mk('SANDSTONE_TRIM',{repeat:[.2,.2]}), gold: mk('GOLD_CHAMPAGNE'), bronze: mk('TITANIUM_BRONZE'),
    glass: mk('GLASS_SAPPHIRE',{opacity:.5, envMapIntensity:1.4}), crys: mk('GLASS_TURQUOISE',{color:0x86c9d8, opacity:.3, roughness:.04, metalness:.5}),
    rail: mk('GLASS_TURQUOISE',{color:0xa9dbe4, opacity:.26}), fili: mk('FILIGREE_GOLD'), glow: mk('WARM_GLOW'), teak: mk('TEAK_DECK',{repeat:[.45,.45]}),
    cob: mk('GRANITE_PROMENADE',{repeat:[.3,.3], color:0x8a7a6a}), asph: mk('BASALT_ASPHALT'), walnut: mk('WALNUT_WOOD',{repeat:[.6,.6]}), mahog: mk('MAHOGANY_DARK',{repeat:[.6,.6]}),
    bord: mk('BORDEAUX_VELVET'), emer: mk('EMERALD_VELVET'), rug: mk('PERSIAN_RUG',{repeat:[.4,.4]}), obsid: mk('OBSIDIAN_PAVILION'),
    plaster: std(0xd8c49c,{roughness:.88}), silk: std(0xc9a24a,{roughness:.34, metalness:.35}), leather: std(0x7a4a2c,{roughness:.48}), cream: std(0xe3d2ae,{roughness:.8}),
    lacq: std(0x0c0e12,{roughness:.12, metalness:.25}), chrome: std(0xc4c9d0,{roughness:.14, metalness:1}), leaf: std(0x2f6b3a,{roughness:.82}), leaf2: std(0x3f8a45,{roughness:.8}),
    trunk: std(0x5a4030,{roughness:.9}), felt: std(0x0d6b45,{roughness:.95}), screen: std(0x0a121c,{roughness:.2, metalness:.3, emissive:0x10263a, emissiveIntensity:.6}),
    portal: new THREE.MeshBasicMaterial({color:0x40e8ff, transparent:true, opacity:.5, side:THREE.DoubleSide, depthWrite:false}),
    pad: std(0x23272e,{roughness:.7}), red: std(0x8c1a24,{roughness:.55}), white2: std(0xd9d2c4,{roughness:.5}), steam: new THREE.MeshBasicMaterial({color:0xdfe8ea, transparent:true, opacity:.18, depthWrite:false}) };
  M.water=new THREE.MeshStandardMaterial({color:0x1b9fb6, roughness:.04, metalness:.15, transparent:true, opacity:.8, depthWrite:false});
  try{ const wn=LUX.tex.waterN.clone(); wn.repeat.set(.25,.25); wn.needsUpdate=true; M.water.normalMap=wn; M.water.normalScale=new THREE.Vector2(.6,.6); }catch(e){}
  M.jet=new THREE.MeshStandardMaterial({color:0xcff3ff, roughness:.1, transparent:true, opacity:.55, depthWrite:false, emissive:0x3aa8c8, emissiveIntensity:.25});
  M.glowSoft=M.glow.clone(); M.glowSoft.emissiveIntensity=.8;
  M.marble=marbleMat(false); M.compass=marbleMat(true); M.roomGlow=roomGlowMat();
  for(const m of [M.glass, M.crys, M.rail, M.water, M.jet, M.portal, M.steam]) m.userData.trans=true;
  for(const m of [M.cob, M.asph]){ m.polygonOffset=true; m.polygonOffsetFactor=-1; m.polygonOffsetUnits=-2; }
  M.red.polygonOffset=true; M.red.polygonOffsetFactor=-2; M.red.polygonOffsetUnits=-4;

  function canvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return [c,c.getContext('2d')]; }
  function ctex(c, srgb=true){ const t=new THREE.CanvasTexture(c); if(srgb) t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t; }
  /* Marble kem vân vàng bóng loáng; compass=true → khảm la bàn Vàng Champagne + đá Bazan ở tâm (dùng cho mặt bệ r 32,5) */
  function marbleMat(compass){ const N=compass?1024:512, [c,g]=canvas(N,N), R=AK.rng(compass?71:72);
    g.fillStyle='#e6d7b8'; g.fillRect(0,0,N,N);
    for(let i=0;i<46;i++){ g.strokeStyle=`rgba(${R()<.5?'176,140,84':'120,104,86'},${.12+R()*.22})`; g.lineWidth=.6+R()*2.2; g.beginPath(); let x=R()*N, y=R()*N; g.moveTo(x,y); for(let k=0;k<14;k++){ x+=(R()-.5)*N*.18; y+=(R()-.3)*N*.12; g.lineTo(x,y); } g.stroke(); }
    if(!compass){ g.strokeStyle='rgba(150,120,80,.45)'; g.lineWidth=2; for(let i=0;i<=2;i++){ g.beginPath(); g.moveTo(i*N/2,0); g.lineTo(i*N/2,N); g.stroke(); g.beginPath(); g.moveTo(0,i*N/2); g.lineTo(N,i*N/2); g.stroke(); } }
    else { const cx=N/2, cy=N/2, S=N/2;   /* toạ độ UV của CircleGeometry: tâm = giữa ảnh, mép = bán kính 32,5 m */
      const ring=(r,w,col)=>{ g.strokeStyle=col; g.lineWidth=w; g.beginPath(); g.arc(cx,cy,r,0,TAU); g.stroke(); };
      ring(S*.985,10,'#2a2622'); ring(S*.955,4,'#c9a24a'); ring(S*.62,8,'#2a2622'); ring(S*.6,3,'#c9a24a'); ring(S*.36,6,'#c9a24a');
      for(let i=0;i<48;i++){ const a=i/48*TAU; g.fillStyle=i%2?'#2f2b27':'#b8913f'; g.beginPath(); g.moveTo(cx+Math.cos(a)*S*.62,cy+Math.sin(a)*S*.62); g.lineTo(cx+Math.cos(a+TAU/96)*S*.955,cy+Math.sin(a+TAU/96)*S*.955); g.lineTo(cx+Math.cos(a+TAU/48)*S*.62,cy+Math.sin(a+TAU/48)*S*.62); g.closePath(); g.globalAlpha=.32; g.fill(); g.globalAlpha=1; }
      for(let i=0;i<16;i++){ const a=i/16*TAU, L=i%4===0?S*.34:i%2===0?S*.24:S*.16, w=i%4===0?.12:.08; for(const sd of [1,-1]){ g.fillStyle=sd>0?'#c9a24a':'#2a2622'; g.beginPath(); g.moveTo(cx,cy); g.lineTo(cx+Math.cos(a+sd*w)*L*.32,cy+Math.sin(a+sd*w)*L*.32); g.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L); g.closePath(); g.fill(); } }
      g.fillStyle='#c9a24a'; g.beginPath(); g.arc(cx,cy,S*.03,0,TAU); g.fill(); }
    const t=ctex(c); if(compass) t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; else t.repeat.set(.2,.2);
    return new THREE.MeshStandardMaterial({map:t, roughness:compass?.16:.12, metalness:.04, envMapIntensity:1.2}); }
  /* vách sau phòng nhìn từ ngoài: 18 tầng × 6 phòng mỗi cánh – phòng sáng ấm / phòng tối, rèm, đèn hắt (emissiveMap, mạnh lên khi đêm) */
  function roomGlowMat(){ const [c,g]=canvas(768,1152), R=AK.rng(73), cw=128, rh=64;
    for(let row=0; row<18; row++) for(let col=0; col<6; col++){ const x=col*cw, y=row*rh, lit=R()<.72, warm=lit?(R()<.5?'#ffcf86':'#ffb866'):'#3a2a1c';
      const gr=g.createLinearGradient(x,y,x,y+rh); gr.addColorStop(0,lit?'#6a4426':'#1e1610'); gr.addColorStop(.45,warm); gr.addColorStop(1,lit?'#8a5a30':'#22180f'); g.fillStyle=gr; g.fillRect(x,y,cw,rh);
      if(lit){ const rg=g.createRadialGradient(x+cw*(.3+R()*.4),y+rh*.35,2,x+cw*.5,y+rh*.4,cw*.5); rg.addColorStop(0,'rgba(255,240,200,.85)'); rg.addColorStop(1,'rgba(255,200,120,0)'); g.fillStyle=rg; g.fillRect(x,y,cw,rh); }
      g.fillStyle='rgba(70,30,20,.55)'; for(const sx of [x+3,x+cw-17]){ for(let k=0;k<4;k++) g.fillRect(sx+k*3.5,y+4,2,rh-8); }
      g.fillStyle='rgba(40,24,14,.9)'; g.fillRect(x,y,cw,3); g.fillRect(x,y+rh-3,cw,3); g.fillRect(x,y,3,rh); }
    const t=ctex(c); t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
    return new THREE.MeshStandardMaterial({map:t, emissiveMap:t, emissive:0xffffff, emissiveIntensity:.55, roughness:.8}); }

  /* ============================== BỘ GỘP HÌNH THEO VẬT LIỆU (1 lượt vẽ / vật liệu / nhóm) ============================== */
  const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3();
  const M4=(x,y,z,ry=0,sx=1,sy=1,sz=1,rx=0,rz=0)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz,'YXZ')), new THREE.Vector3(sx,sy,sz));
  function Bins(){ const map=new Map(); return {
    put(mat, geo, m4){ let g=geo.index ? geo.toNonIndexed() : geo.clone(); for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal' && k!=='uv') g.deleteAttribute(k);
      if(!g.attributes.normal) g.computeVertexNormals(); if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
      g.clearGroups(); if(m4) g.applyMatrix4(m4); let a=map.get(mat); if(!a){ a=[]; map.set(mat,a); } a.push(g); },
    flush(parent, o={}){ const out=[]; for(const [mat,arr] of map){ if(!arr.length) continue; const g=W.mergeGeometries(arr,false); if(!g) continue; g.computeBoundingSphere();
        const m=new THREE.Mesh(g,mat); m.name=(o.name||'aby-hotel')+'-'+(mat.name||out.length); m.castShadow=!!o.cast && !mat.userData.trans; m.receiveShadow=!mat.userData.trans; if(mat.userData.trans) m.renderOrder=6; if(o.dynamic) m.userData.dynamic=true; parent.add(m); out.push(m); }
      map.clear(); return out; } }; }
  // lưới (i, j) → tam giác; mặc định pháp tuyến = (∂/∂i) × (∂/∂j); flip đảo chiều
  function grid(ni, nj, pf, uvf, flip){ const pos=[], uv=[], idx=[]; for(let i=0;i<=ni;i++) for(let j=0;j<=nj;j++){ const p=pf(i,j); pos.push(p[0],p[1],p[2]); const u=uvf?uvf(i,j,p):[i/ni,j/nj]; uv.push(u[0],u[1]); }
    for(let i=0;i<ni;i++) for(let j=0;j<nj;j++){ const a=i*(nj+1)+j, b=(i+1)*(nj+1)+j, c=b+1, d=a+1; if(flip) idx.push(a,c,b, a,d,c); else idx.push(a,b,c, a,c,d); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g; }
  // dải đứng cong: bán kính r (số hoặc hàm θ°), θ0→θ1 (độ), y0→y1 (số hoặc hàm θ°); out=true → mặt nhìn ra ngoài
  function band(r, t0, t1, y0, y1, out=true, step=2.5, uS=3, vS=3){ const rf=typeof r==='function'?r:()=>r, yf0=typeof y0==='function'?y0:()=>y0, yf1=typeof y1==='function'?y1:()=>y1, n=Math.max(1,Math.ceil(Math.abs(t1-t0)/step));
    return grid(n,1,(i,j)=>{ const t=t0+(t1-t0)*i/n, R=rf(t); return [CX+R*Math.cos(t*D), j?yf1(t):yf0(t), CZ+R*Math.sin(t*D)]; }, (i,j)=>{ const t=t0+(t1-t0)*i/n; return [rf(t)*t*D/uS, (j?yf1(t):yf0(t))/vS]; }, (t1>t0)===out); }
  // mặt ngang hình quạt: r0→r1 (số/hàm), θ0→θ1, cao y; up=true mặt nhìn lên
  function sector(r0, r1, t0, t1, y, up=true, step=2.5, uvS=3){ const f0=typeof r0==='function'?r0:()=>r0, f1=typeof r1==='function'?r1:()=>r1, n=Math.max(1,Math.ceil(Math.abs(t1-t0)/step));
    return grid(n,1,(i,j)=>{ const t=t0+(t1-t0)*i/n, R=j?f1(t):f0(t); return [CX+R*Math.cos(t*D), y, CZ+R*Math.sin(t*D)]; }, (i,j,p)=>[p[0]/uvS, p[2]/uvS], (t1>t0)!==up); }
  // mặt phẳng tứ giác bất kỳ (4 điểm xyz), uv theo mét
  function quad(a,b,c,d, uS=3){ const g=new THREE.BufferGeometry(), p=[...a,...b,...c,...a,...c,...d], L=Math.hypot(b[0]-a[0],b[2]-a[2]), H=Math.hypot(d[0]-a[0],d[1]-a[1],d[2]-a[2]);
    g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,L/uS,0,L/uS,H/uS,0,0,L/uS,H/uS,0,H/uS],2)); g.computeVertexNormals(); return g; }
  const lathe=(pts,seg=20,p0=0,pl=TAU)=>new THREE.LatheGeometry(pts.map(([r,h])=>new THREE.Vector2(r,h)),seg,p0,pl);
  const rbox=(w,h,d,r=.04,s=2)=>AK.roundedBox(w,h,d,r,s), ni=g=>g.index?g.toNonIndexed():g.clone();
  const tube=(pts,r=.03,rs=6,closed=false)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)),closed,'centripetal'), Math.max(4,Math.min(pts.length*3,Math.ceil(pts.length*1.25))), r, r<.06?Math.min(rs,4):rs, closed);
  // khối ép đùn bo cạnh từ 1 Shape (hình chiếu bằng, toạ độ thế giới x/z) dày h, mặt trên ở yTop
  function slabShape(pts, holes=[]){ const s=new THREE.Shape(pts.map(([x,z])=>new THREE.Vector2(x,-z))); for(const h of holes) s.holes.push(new THREE.Path(h.map(([x,z])=>new THREE.Vector2(x,-z)))); return s; }
  function extrude(shape, yTop, depth=.3, bev=true){ const g=new THREE.ExtrudeGeometry(shape,{depth, bevelEnabled:bev, bevelThickness:.06, bevelSize:.05, bevelSegments:3, curveSegments:4, steps:1}); g.rotateX(-Math.PI/2); g.translate(0,yTop-depth-(bev?.06:0),0); return g; }
  // InstancedMesh từ danh sách ma trận
  function inst(geo, mat, list, parent, o={}){ if(!list.length) return null; const im=new THREE.InstancedMesh(geo, mat, list.length); list.forEach((m,i)=>im.setMatrixAt(i,m)); im.instanceMatrix.needsUpdate=true; im.castShadow=!!o.cast; im.receiveShadow=true; im.userData.dynamic=true; if(mat.userData.trans) im.renderOrder=6; if(o.name) im.name=o.name; parent.add(im); return im; }
  const at=(r,td,y,ry=0,sx=1,sy=1,sz=1)=>{ const [x,z]=XZ(r,td); return M4(x,y,z,yawOut(td)+ry,sx,sy,sz); };

  /* ============================== VA CHẠM: vật thể tự tạo (không đẩy thẳng vào mảng) – bật/tắt theo tầng ============================== */
  const mkS=(ax,az,bx,bz,r,y0,y1,msg)=>({ax,az,bx,bz,r,y0,y1,msg, x0:Math.min(ax,bx)-r, x1:Math.max(ax,bx)+r, z0:Math.min(az,bz)-r, z1:Math.max(az,bz)+r});
  const mkR=(x,z,rot,hw,hd,h)=>({t:'r',x,z,c:Math.cos(rot),s:Math.sin(rot),hw,hd,h});
  const turnOn=(arr,list)=>{ for(const o of list) if(!o._on){ arr.push(o); o._on=true; } };
  const turnOff=(arr,list)=>{ for(const o of list) if(o._on){ const i=arr.lastIndexOf(o); if(i>=0) arr.splice(i,1); o._on=false; } };
  // lan can theo cung: các đoạn ≤ 2,5°; gaps = [[θa,θb],…] (độ) bỏ trống
  function arcSegs(out, r, t0, t1, y0, y1, msg, gaps=[], step=2.5, rr=.1){ const n=Math.max(1,Math.ceil(Math.abs(t1-t0)/step)); for(let i=0;i<n;i++){ let a=t0+(t1-t0)*i/n, b=t0+(t1-t0)*(i+1)/n; const lo=Math.min(a,b), hi=Math.max(a,b);
      let segs=[[lo,hi]]; for(const [ga,gb] of gaps){ const nx=[]; for(const [p,q] of segs){ if(gb<=p || ga>=q){ nx.push([p,q]); continue; } if(ga>p) nx.push([p,ga]); if(gb<q) nx.push([gb,q]); } segs=nx; }
      for(const [p,q] of segs){ if(q-p<.05) continue; const rf=typeof r==='function'?r:()=>r, A=XZ(rf(p),p), B=XZ(rf(q),q); out.push(mkS(A[0],A[1],B[0],B[1],rr,y0,y1,msg)); } } }
  function radSegs(out, td, r0, r1, y0, y1, msg, gaps=[], rr=.1){ let segs=[[r0,r1]]; for(const [ga,gb] of gaps){ const nx=[]; for(const [p,q] of segs){ if(gb<=p || ga>=q){ nx.push([p,q]); continue; } if(ga>p) nx.push([p,ga]); if(gb<q) nx.push([gb,q]); } segs=nx; }
    for(const [p,q] of segs){ const A=XZ(p,td), B=XZ(q,td); out.push(mkS(A[0],A[1],B[0],B[1],rr,y0,y1,msg)); } }

  /* ============================== NHÓM ============================== */
  const root=new THREE.Group(); root.name='aby-hotel'; scene.add(root);
  const shell=new THREE.Group(); shell.name='aby-hotel-shell'; root.add(shell);
  const mid=new THREE.Group(); mid.name='aby-hotel-mid'; mid.userData.dynamic=true; root.add(mid);          /* đồ ban công, đèn cầu, xe, cây – ẩn khi ở xa */
  const lobby=new THREE.Group(); lobby.name='aby-hotel-lobby'; lobby.userData.dynamic=true; root.add(lobby);  /* nội thất tầng 1 – chỉ hiện khi ở gần */
  const S1=Bins(), S2=Bins(), SL=Bins();   /* S1 vỏ tĩnh · S2 vật nhỏ (ẩn khi xa) · SL sảnh */
  const STATIC={segs:[], plats:[], circ:[]};   /* va chạm luôn bật (bệ, cầu, sảnh tầng 1) */
  const room=(w,j)=>{ const t0=w.a0+20*j; return {t0, t1:t0+20, tc:t0+10}; };
  const isRoomFloor=k=>k>=6 && k<=23, isPent=(w,k)=>w.key==='E' && (k===22 || k===23);
  const TYPES={ deluxe:{name:'Deluxe Ocean Suite', price:5000, icon:'🌊', k0:6, k1:15}, imperial:{name:'Imperial Gold Suite', price:15000, icon:'👑', k0:16, k1:21}, pent:{name:'Royal Penthouse 2 tầng', price:35000, icon:'💎', k0:22, k1:23} };
  const typeOf=(w,k)=>isPent(w,k)?'pent':k<=15?'deluxe':'imperial';
  const roomNo=(w,k,j)=>`${k}${String((w.key==='E'?0:6)+j+1).padStart(2,'0')}`;
  const gapsCut=(lo,hi,gaps)=>{ let s=[[lo,hi]]; for(const [ga,gb] of gaps){ const nx=[]; for(const [p,q] of s){ if(gb<=p||ga>=q){ nx.push([p,q]); continue; } if(ga>p) nx.push([p,ga]); if(gb<q) nx.push([gb,q]); } s=nx; } return s; };
  function stairHole(){ const p=[]; for(let t=-49;t<=-32;t+=2) p.push(XZ(23.45,t)); p.push(XZ(23.45,-32)); for(let t=-32;t>=-49;t-=2) p.push(XZ(21.55,t)); p.push(XZ(21.55,-49)); return p; }

  /* ============================== 1. HAI THÁP CÁNH CUNG: sàn ban công lượn sóng + ren filigree + lan can kính + tay vịn vàng ============================== */
  for(const w of WINGS){
    for(let k=2;k<=25;k++){ const y=Yf(k), outer=[], inner=[];
      for(let t=w.a0; t<=w.a1+1e-6; t+=2.5) outer.push(XZ(rb(t,k),t));
      for(let t=w.a1; t>=w.a0-1e-6; t-=5) inner.push(XZ(R_IN,t));
      S1.put(M.trav, extrude(slabShape([...outer,...inner], (w.key==='E' && k===23) ? [stairHole()] : []), y));
      /* viền ren filigree mạ vàng dưới mép ban công (cao 0,65 m) */
      const fg=band(t=>rb(t,k)+.07, w.a0, w.a1, y-1.08, y-.43, true, 2.5); { const uv=fg.attributes.uv, n=uv.count/2; for(let i=0;i<n;i++){ const t=w.a0+(w.a1-w.a0)*i/(n-1), s=rb(t,k)*t*D; uv.setXY(i*2, s/.7*.25, 0); uv.setXY(i*2+1, s/.7*.25, .25); } }
      S1.put(M.fili, fg);
      /* lan can kính + tay vịn ống vàng theo mép ban công (cả mái) */
      S1.put(M.rail, band(t=>rb(t,k)-.14, w.a0, w.a1, y+.02, y+1.04, true, 2.5));
      { const hp=[]; for(let t=w.a0; t<=w.a1+1e-6; t+=2.5){ const [x,z]=XZ(rb(t,k)-.14,t); hp.push([x,y+1.08,z]); } S1.put(M.gold, tube(hp,.035,6)); }
      for(const te of [w.a0,w.a1]){ const a=XZ(k===25?R_IN+.05:R_GL+.05,te), b=XZ(rb(te,k)-.14,te); S1.put(M.rail, quad([a[0],y+.02,a[1]],[b[0],y+.02,b[1]],[b[0],y+1.04,b[1]],[a[0],y+1.04,a[1]])); S1.put(M.gold, tube([[a[0],y+1.08,a[1]],[b[0],y+1.08,b[1]]],.035,6)); }
      if(k<=24){ /* lan can kính mép trong (hành lang nhìn vào khối pha lê) – hở cầu nối giữa + đầu thang cuốn tầng 2 */
        const gaps=[[w.tc-7,w.tc+7]]; if(k===2) gaps.push(w.key==='E'?[8.4,17.6]:[162.4,171.6]);
        for(const [p,q] of gapsCut(w.a0,w.a1,gaps)){ S1.put(M.rail, band(R_IN+.08,p,q,y+.02,y+1.04,false,2.5)); const hp=[]; const st=Math.max(.5,(q-p)/8); for(let t=p;t<=q+1e-6;t+=st){ const [x,z]=XZ(R_IN+.08,t); hp.push([x,y+1.08,z]); } if(hp.length>1) S1.put(M.gold, tube(hp,.03,6)); } }
    }
    /* vách kính Sapphire cong r 29,5 (tầng 1 → 24) + đố đứng đồng đen mỗi 6,67° (~3,4 m) + chân tường đá 0,45 m */
    S1.put(M.glass, band(R_GL, w.a0, w.a1, Y0, TOPY-.42, true, 2.5));
    for(let t=w.a0; t<=w.a1+1e-6; t+=20/3){ const [x,z]=XZ(R_GL+.06,t); S1.put(M.bronze, new THREE.BoxGeometry(.08,TOPY-Y0,.12), M4(x,(Y0+TOPY)/2,z,yawOut(t))); }
    S1.put(M.sand, band(R_GL+.04, w.a0, w.a1, Y0, Y0+.45, true, 2.5));
    /* 2 đầu hồi: vách kính khung vàng */
    for(const te of [w.a0,w.a1]){ const a=XZ(R_IN,te), b=XZ(R_GL,te); S1.put(M.glass, quad([a[0],Y0,a[1]],[b[0],Y0,b[1]],[b[0],TOPY-.42,b[1]],[a[0],TOPY-.42,a[1]])); for(const rr of [R_IN+.1,R_GL-.1]){ const p=XZ(rr,te); S1.put(M.gold, new THREE.BoxGeometry(.18,TOPY-Y0,.18), M4(p[0],(Y0+TOPY)/2,p[1],yawOut(te))); } }
    /* vách sau phòng (r 20,1) tầng 6–23 có ô cửa: mặt trong phòng ánh đèn ấm (nhìn thấy từ ngoài), mặt hành lang ốp gỗ óc chó; vách ngăn phòng + ngăn ban công */
    for(let k=6;k<=23;k++){ if(isPent(w,k)) continue; const y=Yf(k), yT=Yf(k+1)-.42, row=w.key==='E'?k-6:(k+3)%18;
      for(let j=0;j<6;j++){ const {t0,t1}=room(w,j), dA=t0+2.5, dB=t0+7.1;
        for(const [p,q] of [[t0,dA],[dB,t1]]){ const gl=band(R_COR+.06,p,q,y,yT,true,2.5), uv=gl.attributes.uv, n=uv.count/2;
          for(let i=0;i<n;i++){ const u=(j+((p-t0)+(q-p)*i/(n-1))/20)/6; uv.setXY(i*2, Math.min(.999,u), 1-(row+1)/18+.003); uv.setXY(i*2+1, Math.min(.999,u), 1-row/18-.003); } S1.put(M.roomGlow, gl);
          S1.put(M.walnut, band(R_COR-.06,p,q,y,yT,false,2.5,1.5,1.5)); }
        S1.put(M.walnut, band(R_COR-.06,dA,dB,y+2.45,yT,false,2.5,1.5,1.5)); S1.put(M.plaster, band(R_COR+.06,dA,dB,y+2.45,yT,true,2.5));
        if(j>0){ const a=XZ(R_COR,t0), b=XZ(R_GL-.05,t0); S1.put(M.plaster, new THREE.BoxGeometry(.14,yT-y,R_GL-R_COR), M4((a[0]+b[0])/2,(y+yT)/2,(a[1]+b[1])/2,yawOut(t0)));
          const c=XZ(R_GL+.1,t0), d=XZ(rb(t0,k)-.2,t0); S1.put(M.rail, quad([c[0],y+.02,c[1]],[d[0],y+.02,d[1]],[d[0],y+2.2,d[1]],[c[0],y+2.2,c[1]])); } } }
    /* trần đèn ấm emissive (mọi tầng, mỗi phòng 1 tấm) */
    for(let k=1;k<=24;k++){ const yc=Yf(k+1)-.44; for(let j=0;j<6;j++){ const {t0,t1}=room(w,j); S1.put(M.glow, sector(21.2,28.6,t0+1.6,t1-1.6,yc,false,4)); } }
  }

  /* tầng 1: va chạm vách kính khối pha lê (2 khe, hở cửa chính Nam + cửa sân Bắc), vách kính 2 cánh (3 cửa mỗi cánh) + đầu hồi; khung cửa vàng */
  { const y0=Y0-.3, y1=Y0+3.6;
    arcSegs(STATIC.segs, R_IN, 60, 120, y0, y1, '💎 Vách kính khối pha lê – vào sảnh bằng cửa chính phía Nam', [[81.5,98.5]], 15);
    arcSegs(STATIC.segs, R_IN, -120, -60, y0, y1, '💎 Vách kính khối pha lê – cửa ra sân Bắc ở giữa', [[-98.5,-81.5]], 15);
    for(const w of WINGS){ const dg=[w.a0+30,w.a0+60,w.a0+90].map(t=>[t-2.6,t+2.6]); arcSegs(STATIC.segs, R_GL, w.a0, w.a1, y0, y1, '🪟 Vách kính sảnh – cửa ra sân bệ có khung vàng', dg);
      for(const te of [w.a0,w.a1]) radSegs(STATIC.segs, te, R_IN-.05, R_GL+.05, y0, y1, '🧱 Đầu hồi sảnh – đi vòng qua cửa chính');
      for(const [ta,tb] of dg){ for(const t of [ta,tb]){ const p=XZ(R_GL+.08,t); S1.put(M.gold, new THREE.BoxGeometry(.16,3.3,.2), M4(p[0],Y0+1.65,p[1],yawOut(t))); } const m=XZ(R_GL+.1,(ta+tb)/2); S1.put(M.gold, new THREE.BoxGeometry(2.9,.22,.24), M4(m[0],Y0+3.35,m[1],yawOut((ta+tb)/2)+Math.PI/2)); S1.put(M.glow, new THREE.BoxGeometry(2.6,.05,.1), M4(m[0],Y0+3.2,m[1],yawOut((ta+tb)/2)+Math.PI/2)); } } }

  /* ============================== 2. KHỐI PHA LÊ GIỮA (24 mặt, r 17,5) – lộ ở 2 khe Bắc/Nam, gân vàng; mái + 12 cánh sen pha lê ============================== */
  for(const [g0,g1] of [[60,120],[-120,-60]]){
    for(let t=g0;t<g1;t+=15){ const a=XZ(R_IN,t), b=XZ(R_IN,t+15); S1.put(M.crys, quad([a[0],Y0,a[1]],[b[0],Y0,b[1]],[b[0],TOPY,b[1]],[a[0],TOPY,a[1]])); }
    for(let t=g0;t<=g1;t+=15){ const p=XZ(R_IN+.05,t); S1.put(M.gold, new THREE.BoxGeometry(.22,TOPY-Y0,.22), M4(p[0],(Y0+TOPY)/2,p[1],yawOut(t))); }
    for(let k=2;k<=25;k++){ const pts=[]; for(let t=g0;t<=g1;t+=15){ const [x,z]=XZ(R_IN+.08,t); pts.push([x,Yf(k)-.2,z]); } S1.put(M.gold, tube(pts,.06,6)); }
    /* khung cửa vàng 5 m (cửa chính Nam / cửa ra sân Bắc) */
    const tm=(g0+g1)/2, pA=XZ(R_IN+.12,tm-8.5), pB=XZ(R_IN+.12,tm+8.5); for(const p of [pA,pB]) S1.put(M.gold, new THREE.BoxGeometry(.3,4.4,.3), M4(p[0],Y0+2.2,p[1]));
    S1.put(M.gold, new THREE.BoxGeometry(5.6,.4,.36), M4((pA[0]+pB[0])/2,Y0+4.4,(pA[1]+pB[1])/2,yawOut(tm)+Math.PI/2));
  }
  /* mái khối pha lê +133,4 (sàn đá, hở 3 đầu thang) + 6 cánh sen kính khung vàng ở 2 khe (không chắn lối sang mái 2 cánh) */
  { const ring=[]; for(let t=0;t<360;t+=7.5) ring.push(XZ(R_IN+.1,t)); const hole=[[CX-4.8,CZ-4.8],[CX+4.8,CZ-4.8],[CX+4.8,CZ-1.9],[CX-4.8,CZ-1.9]];
    S1.put(M.trav, extrude(slabShape(ring,[hole]), TOPY));
    const sh=new THREE.Shape(); sh.moveTo(-2.6,0); sh.bezierCurveTo(-2.8,1.6,-1.2,3.2,0,3.9); sh.bezierCurveTo(1.2,3.2,2.8,1.6,2.6,0); sh.lineTo(-2.6,0);
    const pg=new THREE.ExtrudeGeometry(sh,{depth:.06, bevelEnabled:true, bevelThickness:.03, bevelSize:.04, bevelSegments:2}), eg=tube([[-2.6,0,.08],[-2.7,1.6,.08],[-1.2,3.2,.08],[0,3.9,.08],[1.2,3.2,.08],[2.7,1.6,.08],[2.6,0,.08]],.05,5);
    for(const td of [67.5,90,112.5,247.5,270,292.5]){ const p=XZ(R_IN-.3,td), m=M4(p[0],TOPY+.02,p[1],yawOut(td)+Math.PI,1,1,1,-.32); S1.put(M.crys, pg, m); S1.put(M.gold, eg, m); } }
  /* trần giếng trời sảnh ở +45,2 (Grand Atrium cao 28 m): vòng kính + vòng LED, hở giếng thang + cầu */
  { const ring=[]; for(let t=0;t<360;t+=7.5) ring.push(XZ(R_IN-.05,t)); const hole=[[CX-4.9,CZ-4.9],[CX+4.9,CZ-4.9],[CX+4.9,CZ+2.1],[CX-4.9,CZ+2.1]];
    const yA=Y0+28, g=new THREE.ShapeGeometry(slabShape(ring,[hole]),4); g.rotateX(-Math.PI/2); g.translate(0,yA,0); S1.put(M.crys, g);
    S1.put(M.glowSoft, new THREE.TorusGeometry(15.5,.12,6,64), M4(CX,yA-.1,CZ,0,1,1,1,Math.PI/2)); }

  /* ============================== 3. SKY BRIDGE mỗi tầng (trong khối pha lê, nối 2 cánh, đi ngang cửa 3 thang máy) ============================== */
  for(let k=2;k<=24;k++){ const y=Yf(k); S1.put(M.trav, rbox(35.4,.4,4.1,.06,2), M4(CX,y-.2,CZ));
    S1.put(M.rail, quad([CX-17.6,y,CZ+2.02],[CX+17.6,y,CZ+2.02],[CX+17.6,y+1.04,CZ+2.02],[CX-17.6,y+1.04,CZ+2.02])); S1.put(M.gold, tube([[CX-17.6,y+1.08,CZ+2.02],[CX+17.6,y+1.08,CZ+2.02]],.03,6));
    for(const [a,b] of [[-17.6,-4.65],[4.65,17.6]]){ S1.put(M.rail, quad([CX+a,y,CZ-2.02],[CX+b,y,CZ-2.02],[CX+b,y+1.04,CZ-2.02],[CX+a,y+1.04,CZ-2.02])); S1.put(M.gold, tube([[CX+a,y+1.08,CZ-2.02],[CX+b,y+1.08,CZ-2.02]],.03,6)); }
    for(const dz of [2,-2]) S1.put(M.glow, new THREE.BoxGeometry(35,.05,.08), M4(CX,y-.42,CZ+dz)); }

  /* ============================== 4. THỀM +14,6: sàn Marble khảm la bàn + 3 bậc vòng (LED nẹp bậc) ============================== */
  const LAMPPOS=[];   /* trụ đèn đồng 2 nhánh (InstancedMesh, dựng sau) */
  const STEP_N=3, STEP_R=(R_ST-R_POD)/STEP_N, STEP_H=(Y0-GY)/STEP_N, GAP0=90, GAP1=90;
  { const top=new THREE.CircleGeometry(R_POD,144); top.rotateX(-Math.PI/2); top.translate(CX,Y0,CZ); S1.put(M.compass, top);
    for(let i=0;i<STEP_N-1;i++){ const r0=R_POD+i*STEP_R, r1=r0+STEP_R, y=Y0-(i+1)*STEP_H; S1.put(M.trav, sector(r0-.02,r1,GAP1,GAP0+360,y,true,2.5));
      S1.put(M.sand, band(r0,GAP1,GAP0+360,y,y+STEP_H,true,2.5)); S1.put(M.glow, band(r0+.012,GAP1,GAP0+360,y+STEP_H-.05,y+STEP_H-.015,true,2.5)); }
    S1.put(M.sand, band(R_ST-STEP_R,GAP1,GAP0+360,GY,GY+STEP_H,true,2.5));
    /* va chạm: bệ + bậc (vòng) */
    STATIC.plats.push({t:'c', x:CX, z:CZ, r:R_POD+.05, h:Y0});
    for(let i=0;i<STEP_N-1;i++) STATIC.plats.push({t:'ring', x:CX, z:CZ, r0:R_POD+i*STEP_R-.03, r1:R_POD+(i+1)*STEP_R+.03, h:Y0-(i+1)*STEP_H});
    /* hoa + đèn trụ quanh mép bệ (r 31,6), chừa cửa và đầu cầu */
    const POTS=[], LAMPS=[]; for(let t=-172.5;t<180;t+=15){ const tn=((t%360)+360)%360; if(Math.abs(tn-90)<16 || Math.abs(tn-270)<16 || Math.abs(tn)<5 || Math.abs(tn-180)<5) continue; (Math.round(t/15)%2 ? POTS : LAMPS).push(t); }
    const potG=lathe([[0,0],[.55,0],[.62,.12],[.5,.7],[.58,.78],[0,.78]],18);
    for(const t of POTS){ const [x,z]=XZ(31.6,t); S2.put(M.trav, potG, M4(x,Y0,z)); S2.put(M.leaf, new THREE.IcosahedronGeometry(.62,1), M4(x,Y0+1.2,z,0,1,.9,1)); STATIC.circ.push({x,z,r:.65,y0:Y0-.3,y1:Y0+2}); }
    for(const t of LAMPS){ const [x,z]=XZ(31.6,t); STATIC.circ.push({x,z,r:.22,y0:Y0-.3,y1:Y0+3.8}); LAMPPOS.push([x,Y0,z,yawOut(t)]); } }

  /* (17/11) cầu ô tô Nam + vòng sảnh đón (0, 32,5) +14 là của phiên A (W.ABY.plots.hotel.bridge / .dropoff) – khách sạn không dựng cầu, không đụng lan can của A */
  const BR={hangers:[]}, JOINT={bridge:'A', dropoff:DROP};


  /* ============================== 6. PORTE-COCHÈRE: mái vàng uốn cong + trần đèn ấm + 4 cột tiện + thảm đỏ + dây nhung + 2 limousine + 2 xe hành lý ============================== */
  const qb=(p0,p1,p2,n=10)=>{ const o=[]; for(let i=1;i<=n;i++){ const t=i/n, a=(1-t)*(1-t), b=2*(1-t)*t, c=t*t; o.push([a*p0[0]+b*p1[0]+c*p2[0], a*p0[1]+b*p1[1]+c*p2[1]]); } return o; };
  { const L=(u,v)=>[CX+u,CZ+v], pts=[L(-8.4,20.2), ...qb(L(-8.4,20.2),L(-11,31),L(-4.6,36.4)), ...qb(L(-4.6,36.4),L(0,38.2),L(4.6,36.4)), ...qb(L(4.6,36.4),L(11,31),L(8.4,20.2)), ...qb(L(8.4,20.2),L(0,18.6),L(-8.4,20.2))];   /* mái vươn tới r ≈ 37,5 – che làn trong của vòng đón (0, 32,5) */
    const yT=Y0+6.6; S1.put(M.gold, extrude(slabShape(pts), yT, .32));
    const sg=new THREE.ShapeGeometry(slabShape(pts.map(([x,z])=>[CX+(x-CX)*.93, CZ+28+(z-CZ-28)*.93])),2); sg.rotateX(-Math.PI/2); sg.translate(0,yT-.46,0); S1.put(M.glow, sg);
    const colG=lathe([[0,0],[.42,0],[.42,.18],[.3,.32],[.24,.6],[.22,5.1],[.3,5.5],[.46,5.85],[.46,5.98],[0,5.98]],18);
    for(const [u,v] of [[-6.4,31.6],[6.4,31.6],[-6.4,22.4],[6.4,22.4]]){ S1.put(M.gold, colG, M4(CX+u,Y0,CZ+v)); STATIC.circ.push({x:CX+u,z:CZ+v,r:.5,y0:Y0-.3,y1:Y0+6}); }
    /* thảm đỏ từ vòng sảnh đón vào cửa chính + cột chặn dây nhung */
    S1.put(M.red, quad([CX-1.15,GY+.035,CZ+DV-9.6],[CX+1.15,GY+.035,CZ+DV-9.6],[CX+1.15,GY+.035,CZ+R_ST],[CX-1.15,GY+.035,CZ+R_ST]));
    S1.put(M.red, quad([CX-1.15,Y0+.014,CZ+R_POD-.1],[CX+1.15,Y0+.014,CZ+R_POD-.1],[CX+1.15,Y0+.014,CZ+17.4],[CX-1.15,Y0+.014,CZ+17.4]));
    for(const s of [-1,1]){ const ps=[]; for(let v=20; v<=30.01; v+=2.5){ ps.push(v); S2.put(M.gold, lathe([[0,0],[.16,0],[.16,.04],[.04,.08],[.035,.92],[.07,.98],[0,1.02]],12), M4(CX+s*1.75,Y0,CZ+v)); }
      for(let i=0;i<ps.length-1;i++){ const a=ps[i], b=ps[i+1]; S2.put(M.bord, tube([[CX+s*1.75,Y0+.9,CZ+a],[CX+s*1.75,Y0+.7,CZ+(a+b)/2],[CX+s*1.75,Y0+.9,CZ+b]],.025,5)); }
      STATIC.segs.push(mkS(CX+s*1.75,CZ+20,CX+s*1.75,CZ+30,.08,Y0-.3,Y0+1.1,'🎗️ Dây nhung thảm đỏ – đi theo thảm vào sảnh')); }
    /* 2 limousine đen viền vàng đỗ chờ khách */
    const sh=new THREE.Shape(); sh.moveTo(-3.6,.34); sh.lineTo(3.6,.34); sh.lineTo(3.68,.82); sh.quadraticCurveTo(3.55,1.0,2.6,1.04); sh.lineTo(1.85,1.42); sh.lineTo(-2.45,1.46); sh.lineTo(-3.05,1.08); sh.quadraticCurveTo(-3.62,1.02,-3.66,.78); sh.lineTo(-3.6,.34);
    const body=new THREE.ExtrudeGeometry(sh,{depth:1.78, bevelEnabled:true, bevelThickness:.09, bevelSize:.08, bevelSegments:3}); body.translate(0,0,-.89);
    const win=new THREE.Shape(); win.moveTo(1.7,1.08); win.lineTo(1.82,1.38); win.lineTo(-2.4,1.41); win.lineTo(-2.9,1.1); win.lineTo(1.7,1.08); const wg=new THREE.ExtrudeGeometry(win,{depth:1.92, bevelEnabled:false}); wg.translate(0,0,-.96);
    const wh=new THREE.CylinderGeometry(.36,.36,.26,18); wh.rotateX(Math.PI/2); const rim=new THREE.CylinderGeometry(.22,.22,.28,14); rim.rotateX(Math.PI/2);
    for(const s of [-1,1]){ const x=CX+s*10.5, z=CZ+34.7, ry=s>0?0:Math.PI, base=M4(x,GY,z,ry);
      S2.put(M.lacq, body, base); S2.put(M.screen, wg, base); S2.put(M.gold, new THREE.BoxGeometry(7.1,.05,1.98), base.clone().multiply(M4(0,.82,0)));
      for(const [lx,lz] of [[2.45,.86],[2.45,-.86],[-2.5,.86],[-2.5,-.86]]){ const m=base.clone().multiply(M4(lx,.36,lz)); S2.put(M.pad, wh, m); S2.put(M.chrome, rim, m); }
      const c=Math.cos(ry), sn=Math.sin(ry), cw=(lx,lz)=>[x+lx*c+lz*sn, z-lx*sn+lz*c], K=[cw(-3.75,-1.02),cw(3.75,-1.02),cw(3.75,1.02),cw(-3.75,1.02)]; for(let i=0;i<4;i++){ const a=K[i], b=K[(i+1)%4]; STATIC.segs.push(mkS(a[0],a[1],b[0],b[1],.1,GY-.3,GY+1.6,'🚘 Limousine của khách sạn')); } }
    /* 2 xe đẩy hành lý mạ vàng */
    for(const s of [-1,1]){ const x=CX+s*5.4, z=CZ+22.8; S2.put(M.bronze, rbox(1.2,.08,.7,.03,1), M4(x,Y0+.28,z)); for(const dx of [-.55,.55]) S2.put(M.gold, tube([[x+dx,Y0+.3,z-.3],[x+dx,Y0+1.9,z-.3],[x+dx*.6,Y0+2.05,z],[x+dx,Y0+1.9,z+.3],[x+dx,Y0+.3,z+.3]],.025,6));
      S2.put(M.gold, tube([[x-.55,Y0+2.0,z],[x+.55,Y0+2.0,z]],.03,6)); S2.put(M.leather, rbox(.8,.55,.32,.05,2), M4(x,Y0+.6,z-.1)); S2.put(M.bord, rbox(.7,.45,.28,.05,2), M4(x,Y0+1.1,z+.05)); S2.put(M.emer, rbox(.5,.35,.25,.05,2), M4(x+.1,Y0+1.5,z));
      for(const [dx,dz] of [[-.5,-.3],[.5,-.3],[-.5,.3],[.5,.3]]) S2.put(M.pad, new THREE.CylinderGeometry(.09,.09,.06,10), M4(x+dx,Y0+.09,z+dz,0,1,1,1,Math.PI/2)); STATIC.circ.push({x,z,r:.8,y0:Y0-.3,y1:Y0+2.1}); }
    makeLabel('🏨 The Royal Lotus-Crescent Palace','Siêu khách sạn 7 sao · 24 tầng · lễ tân bên trái sảnh – thuê phòng (E)',{h:.85, x:CX, y:TOPY+9, z:CZ, fade:420});
    makeLabel('🚪 Sảnh chính Grand Atrium','Porte-cochère · thảm đỏ',{h:.4, x:CX, y:Y0+7.6, z:CZ+26, fade:45}); }

  /* ============================== 7. HỒ BƠI VÔ CỰC: tầng 5 (sân Bắc giữa 2 cánh) + Sky-Cantilever Pool tầng 20 (đáy kính, vươn ra phía Nam tới r 38) ============================== */
  const POOLS=[{k:5, g0:-120, g1:-60, rOut:33, u0:-5.5, u1:5.5, v0:-32.4, v1:-22, inner:-22, glass:false, name:'🏊 Hồ bơi vô cực ngoài trời · tầng 5'},
               {k:20, g0:60, g1:120, rOut:CORE, u0:-5, u1:5, v0:22, v1:37.2, inner:22, glass:true, name:'🏊 Sky-Cantilever Infinity Pool · tầng 20'}];
  M.tile=std(0x2aa3b3,{roughness:.25, metalness:.05});
  for(const pl of POOLS){ const y=Yf(pl.k), out=[], hole=[[CX+pl.u0,CZ+pl.v0],[CX+pl.u1,CZ+pl.v0],[CX+pl.u1,CZ+pl.v1],[CX+pl.u0,CZ+pl.v1]];
    for(let t=pl.g0;t<=pl.g1+1e-6;t+=2.5) out.push(XZ(pl.rOut,t)); for(let t=pl.g1;t>=pl.g0-1e-6;t-=5) out.push(XZ(R_IN+.12,t));
    S1.put(M.teak, extrude(slabShape(out,[hole]), y, .5));
    /* lòng hồ: 4 vách gạch men + đáy (kính ở hồ tầng 20) + nước */
    const x0=CX+pl.u0, x1=CX+pl.u1, z0=CZ+pl.v0, z1=CZ+pl.v1, yb=y-1.25;
    for(const [a,b] of [[[x0,z0],[x1,z0]],[[x1,z0],[x1,z1]],[[x1,z1],[x0,z1]],[[x0,z1],[x0,z0]]]) S1.put(pl.glass?M.crys:M.tile, quad([a[0],yb,a[1]],[b[0],yb,b[1]],[b[0],y,b[1]],[a[0],y,a[1]]));
    S1.put(pl.glass?M.crys:M.tile, quad([x0,yb,z1],[x1,yb,z1],[x1,yb,z0],[x0,yb,z0])); if(pl.glass){ for(const u of [pl.u0+.1,(pl.u0+pl.u1)/2,pl.u1-.1]) S1.put(M.gold, new THREE.BoxGeometry(.14,.16,z1-z0), M4(CX+u,yb-.09,(z0+z1)/2)); for(let v=pl.v0+.1; v<=pl.v1; v+=2.5) S1.put(M.gold, new THREE.BoxGeometry(x1-x0,.16,.12), M4((x0+x1)/2,yb-.09,CZ+v)); }
    const wq=quad([x0,y-.14,z1],[x1,y-.14,z1],[x1,y-.14,z0],[x0,y-.14,z0], 4); pl.water=wq; S1.put(M.water, wq);
    /* bậc xuống hồ ở đầu trong */ const sv=pl.inner<0?-1:1; for(let i=0;i<2;i++){ const za=CZ+pl.inner+sv*i*.9, zb=za+sv*.9; S1.put(M.tile, new THREE.BoxGeometry(3,.4*(2-i),Math.abs(zb-za)), M4(CX,yb+.4*(2-i)/2+.0,(za+zb)/2)); }
    /* lan can kính mép ngoài + 2 mép bên + tay vịn vàng; đèn hắt dưới mép (cantilever) */
    S1.put(M.rail, band(pl.rOut-.15,pl.g0,pl.g1,y+.02,y+1.1,true,2.5)); { const hp=[]; for(let t=pl.g0;t<=pl.g1+1e-6;t+=2.5){ const [x,z]=XZ(pl.rOut-.15,t); hp.push([x,y+1.14,z]); } S1.put(M.gold, tube(hp,.04,6)); }
    for(const t of [pl.g0,pl.g1]){ const a=XZ(rb(t,pl.k)-.15,t), b=XZ(pl.rOut-.15,t); S1.put(M.rail, quad([a[0],y+.02,a[1]],[b[0],y+.02,b[1]],[b[0],y+1.1,b[1]],[a[0],y+1.1,a[1]])); S1.put(M.gold, tube([[a[0],y+1.14,a[1]],[b[0],y+1.14,b[1]]],.04,6)); }
    S1.put(M.glow, band(pl.rOut+.06,pl.g0,pl.g1,y-.62,y-.52,true,2.5));
    if(pl.k===5) for(const t of [-108,-90,-72]){ const [x,z]=XZ(31,t); S1.put(M.gold, lathe([[0,0],[.45,0],[.32,.3],[.3,y-.62-Y0-.3],[.5,y-.62-Y0],[0,y-.62-Y0]],16), M4(x,Y0,z)); STATIC.circ.push({x,z,r:.55,y0:Y0-.3,y1:y-1}); }
    else { /* dầm công-xôn vàng dưới sàn hồ tầng 20 */ for(const u of [-7,0,7]) S1.put(M.gold, new THREE.BoxGeometry(.5,.9,CORE-R_IN-1), M4(CX+u,y-1.1,CZ+(CORE+R_IN)/2)); }
    makeLabel(pl.name, pl.k===20?'Đáy kính · vươn 24 m trên vịnh · đi lối cuối hành lang tầng 20':'Lối ra ở cuối hành lang cánh Đông / Tây tầng 5',{h:.4, x:CX, y:y+3.2, z:CZ+(pl.v0+pl.v1)/2, fade:50}); }

  /* ============================== 8. MÁI: vườn trên mái (cánh Đông) + Bãi đáp trực thăng VIP (cánh Tây) ============================== */
  const HELI={x:XZ(23.5,180)[0], z:XZ(23.5,180)[1], y:TOPY+.35};
  { S1.put(M.pad, new THREE.CylinderGeometry(5.6,5.8,.35,48), M4(HELI.x,TOPY+.175,HELI.z)); S1.put(M.gold, new THREE.TorusGeometry(4.9,.09,6,64), M4(HELI.x,HELI.y+.01,HELI.z,0,1,1,1,Math.PI/2));
    for(const [w,d,dx] of [[.5,3.4,-1.1],[.5,3.4,1.1],[2.2,.5,0]]) S1.put(M.gold, new THREE.BoxGeometry(w,.02,d), M4(HELI.x+dx,HELI.y+.012,HELI.z));
    /* trực thăng VIP đen viền vàng */ const hx=HELI.x+.4, hz=HELI.z, hy=HELI.y;
    S1.put(M.lacq, lathe([[0,-1.9],[.55,-1.75],[.95,-1.0],[1.05,.2],[.9,1.2],[.45,2.2],[.12,2.6],[0,2.62]],18), M4(hx,hy+1.45,hz,0,1,1,1,Math.PI/2));
    S1.put(M.screen, new THREE.SphereGeometry(.98,18,12,0,TAU,0,Math.PI/2.2), M4(hx,hy+1.65,hz-1.0,0,1,.85,1.2,-1.2));
    S1.put(M.lacq, new THREE.CylinderGeometry(.16,.3,4.6,10), M4(hx,hy+1.7,hz+4.3,0,1,1,1,Math.PI/2)); S1.put(M.gold, new THREE.BoxGeometry(.08,1.6,.9), M4(hx,hy+2.3,hz+6.4));
    for(const s of [-1,1]){ S1.put(M.chrome, tube([[hx+s*.8,hy+.12,hz-1.8],[hx+s*.82,hy+.1,hz+1.6],[hx+s*.75,hy+.25,hz+1.9]],.05,6)); for(const dz of [-1,.9]) S1.put(M.chrome, tube([[hx+s*.8,hy+.12,hz+dz],[hx+s*.45,hy+.75,hz+dz]],.04,5)); }
    S1.put(M.gold, new THREE.CylinderGeometry(.1,.12,.5,10), M4(hx,hy+2.6,hz)); for(let i=0;i<4;i++) S1.put(M.lacq, new THREE.BoxGeometry(.22,.04,10.6), M4(hx,hy+2.86,hz,i*Math.PI/4+.3));
    S1.put(M.gold, new THREE.BoxGeometry(.06,.25,2.1), M4(hx+.25,hy+2.2,hz+6.4));
    STATIC.circ.push({x:hx,z:hz,r:1.4,y0:TOPY,y1:TOPY+3.5},{x:hx,z:hz+3.4,r:.6,y0:TOPY,y1:TOPY+3.5});
    makeLabel('🚁 Bãi đáp trực thăng VIP','Mái cánh Tây · +132 m · E: bay ngắm vịnh',{h:.42, x:HELI.x, y:TOPY+5.5, z:HELI.z, fade:60}); }

  /* ============================== 9. CỔNG NĂNG LƯỢNG MASTER DASHBOARD (sân bệ phía Bắc, giữ từ ốc đảo cũ) ============================== */
  const GATE={x:CX, z:CZ-26.2};
  if(!A_GATE){ for(const s of [-1,1]){ S1.put(M.obsid, rbox(1.5,12,1.5,.12,3), M4(GATE.x+s*5,Y0+6,GATE.z)); S1.put(M.gold, rbox(1.7,.3,1.7,.08,2), M4(GATE.x+s*5,Y0+.15,GATE.z)); S1.put(M.gold, rbox(1.7,.3,1.7,.08,2), M4(GATE.x+s*5,Y0+11.2,GATE.z)); STATIC.circ.push({x:GATE.x+s*5,z:GATE.z,r:1.1,y0:Y0-.3,y1:Y0+12}); }
    S1.put(M.obsid, rbox(13.4,1.7,1.8,.14,3), M4(GATE.x,Y0+12.6,GATE.z)); S1.put(M.gold, new THREE.BoxGeometry(13.6,.14,1.9), M4(GATE.x,Y0+11.78,GATE.z)); S1.put(M.glow, new THREE.BoxGeometry(12.6,.08,.08), M4(GATE.x,Y0+12.6,GATE.z+.92));
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(8.4,11),M.portal); pl.position.set(GATE.x,Y0+5.6,GATE.z); pl.renderOrder=6; pl.userData.dynamic=true; mid.add(pl); GATE.mesh=pl;
    INTER.push({x:GATE.x, z:GATE.z+2.4, r:2.8, prio:.6, when:()=>Math.abs(P.y-Y0)<1.5, label:'🌀 Cổng Master Dashboard – mở trên Laptop (E)', action:()=>{ if(HOOK.openScreen) HOOK.openScreen({url:'/'}); else toast('💻 Master Dashboard mở trong Laptop (phím L).',3000); }});
    makeLabel('🌀 Cổng Master Dashboard','Cổng năng lượng 12 m · sân Bắc khách sạn · mở bằng Laptop (L)',{h:.55, x:GATE.x, y:Y0+15, z:GATE.z, fade:120});
    /* màn hình thứ 9 của screens.js (nếu chưa ai dời ra) đặt cạnh cổng */
    try{ const SC=W.screens; if(SC && SC.monitors) SC.monitors.forEach((m,i)=>{ if(i<8 || (m.g && m.g.parent)) return; const x=GATE.x+8.6, z=GATE.z+1.5, rot=Math.atan2(CX-x,(CZ-6)-z);
      m.x=x; m.z=z; m.rot=rot; m.g.position.set(x,Y0,z); m.g.rotation.y=rot; m.g.userData.dynamic=true; scene.add(m.g); m.g.updateMatrixWorld(true); m.center.set(0,2.0,.066).applyMatrix4(m.g.matrixWorld); m.normal.set(Math.sin(rot),0,Math.cos(rot)); m.sphere.center.copy(m.center); STATIC.circ.push({x,z,r:.55,y0:Y0-.3,y1:Y0+3});
      INTER.push({x:x+m.normal.x*2.1, z:z+m.normal.z*2.1, r:2.3, prio:.4, when:()=>Math.abs(P.y-Y0)<1.5, label:`🖥️ Xem ${m.ch.icon} ${m.ch.name} trên màn hình (E)`, action:()=>SC.focus(m)}); }); }catch(e){ console.warn('[abyssal_hotel] màn hình', e); } }

  /* ============================== 10. GRAND ATRIUM TẦNG 1: đài phun nhạc nước mạ vàng + tượng sen vàng + đèn chùm, thang cuốn đôi, lễ tân, concierge, lounge + Grand Piano ============================== */
  const FT={x:CX, z:CZ+8}, JETS=[], ESC=[], PIANO={};
  { const {x:fx,z:fz}=FT;
    SL.put(M.marble, lathe([[0,0],[3.75,0],[3.8,.1],[3.8,.56],[3.6,.64],[3.48,.52],[3.42,.14],[0,.14]],40), M4(fx,Y0,fz)); SL.put(M.gold, new THREE.TorusGeometry(3.62,.07,8,64), M4(fx,Y0+.64,fz,0,1,1,1,Math.PI/2));
    SL.put(M.water, new THREE.CircleGeometry(3.44,48), M4(fx,Y0+.44,fz,0,1,1,1,-Math.PI/2));
    SL.put(M.gold, lathe([[0,0],[.62,0],[.42,.4],[.36,1.2],[1.82,1.36],[1.88,1.5],[1.72,1.56],[.32,1.46],[.26,2.2],[.92,2.36],[.97,2.46],[.86,2.52],[.22,2.46],[.2,2.92],[0,2.92]],32), M4(fx,Y0,fz));
    SL.put(M.water, new THREE.CircleGeometry(1.7,32), M4(fx,Y0+1.5,fz,0,1,1,1,-Math.PI/2));
    /* tượng sen vàng 10 cánh + nụ */ const pet=new THREE.Shape(); pet.moveTo(0,0); pet.bezierCurveTo(.55,.35,.6,1.2,0,1.75); pet.bezierCurveTo(-.6,1.2,-.55,.35,0,0);
    const pg=new THREE.ExtrudeGeometry(pet,{depth:.04, bevelEnabled:true, bevelThickness:.03, bevelSize:.03, bevelSegments:3});
    for(let i=0;i<10;i++){ const a=i/10*TAU, inner=i%2; SL.put(M.gold, pg, M4(fx+Math.cos(a)*.2,Y0+2.9,fz+Math.sin(a)*.2,Math.atan2(Math.cos(a),Math.sin(a)),inner?.8:1,inner?.8:1,1,inner?-.35:-.6)); }
    SL.put(M.gold, lathe([[0,0],[.28,.1],[.34,.5],[.22,.95],[0,1.25]],18), M4(fx,Y0+2.95,fz));
    const jg=new THREE.CylinderGeometry(.045,.025,1,6); jg.translate(0,.5,0); const jets=[]; for(let i=0;i<18;i++){ const a=i/18*TAU; jets.push(M4(fx+Math.cos(a)*2.75,Y0+.44,fz+Math.sin(a)*2.75)); JETS.push({x:fx+Math.cos(a)*2.75, z:fz+Math.sin(a)*2.75, a}); }
    FT.jets=inst(jg, M.jet, jets, lobby, {name:'aby-hotel-jets'}); JETS.push({x:fx,z:fz,a:-1}); FT.c=inst(jg, M.jet, [M4(fx,Y0+4.1,fz)], lobby);
    STATIC.circ.push({x:fx,z:fz,r:3.9,y0:Y0-.3,y1:Y0+4});
    INTER.push({x:fx, z:fz+4.6, r:2.2, prio:.4, when:()=>Math.abs(P.y-Y0)<1.4, label:'⛲ Xem đài phun nhạc nước (E)', action:()=>{ FT.show=12; toast('⛲ Đài phun đổi điệu: "Sen nở" – nước nhảy theo nhịp piano sảnh',2600); }});
    /* đèn chùm pha lê 3 tầng treo giếng trời */ const yC=Y0+20; for(const [r,dy] of [[3.2,0],[2.4,2],[1.5,3.8]]) SL.put(M.gold, new THREE.TorusGeometry(r,.07,8,48), M4(fx,yC+dy,fz,0,1,1,1,Math.PI/2));
    for(let i=0;i<3;i++){ const a=i/3*TAU; SL.put(M.gold, tube([[fx+Math.cos(a)*3.2,yC,fz+Math.sin(a)*3.2],[fx+Math.cos(a)*1.5,yC+3.8,fz+Math.sin(a)*1.5],[fx,Y0+27.9,fz]],.025,4)); }
    const drops=[]; for(const [r,dy,n] of [[3.2,0,40],[2.4,2,30],[1.5,3.8,20]]) for(let i=0;i<n;i++){ const a=i/n*TAU, L=.5+((i*7)%5)*.18; drops.push(M4(fx+Math.cos(a)*r,yC+dy-L/2,fz+Math.sin(a)*r,0,1,L/.3,1)); }
    inst(new THREE.OctahedronGeometry(.11,0), M.glowSoft, drops, lobby, {name:'aby-hotel-chandelier'});
    /* THANG CUỐN ĐÔI mạ vàng (tầng 1 ↔ tầng 2) – 2 bên Đông/Tây, chạy thật */
    const EL=17.5-8.84, ER=Yf(2)-Y0, ang=Math.atan2(ER,EL), LL=Math.hypot(EL,ER), stepG=rbox(.4,.08,1.08,.02,1);
    for(const s of [-1,1]){ const u0=s*8.84, u1=s*17.5, cu=(u0+u1)/2, rz=s*ang;
      SL.put(M.bronze, new THREE.BoxGeometry(LL,.7,2.62), M4(CX+cu,Y0+ER/2-.48,CZ+4.0,0,1,1,1,0,rz));
      for(const v of [2.7,4.0,5.3]){ SL.put(M.rail, quad([CX+u0,Y0+.06,CZ+v],[CX+u1,Yf(2)+.06,CZ+v],[CX+u1,Yf(2)+1.0,CZ+v],[CX+u0,Y0+1.0,CZ+v])); SL.put(M.gold, tube([[CX+u0-s*.6,Y0+.9,CZ+v],[CX+u0,Y0+1.02,CZ+v],[CX+u1,Yf(2)+1.02,CZ+v],[CX+u1+s*.6,Yf(2)+.9,CZ+v]],.045,6));
        SL.put(M.gold, new THREE.BoxGeometry(LL,.32,.1), M4(CX+cu,Y0+ER/2-.12,CZ+v,0,1,1,1,0,rz)); }
      for(const [u,y] of [[u0,Y0],[u1,Yf(2)]]) SL.put(M.gold, new THREE.BoxGeometry(.7,.03,2.6), M4(CX+u-s*.3*(u===u0?1:-1),y+.015,CZ+4.0));
      for(const [vz,dir] of [[3.33,1],[4.67,-1]]){ const im=new THREE.InstancedMesh(stepG, M.gold, 22); im.userData.dynamic=true; im.frustumCulled=false; lobby.add(im); ESC.push({im, s, vz, dir, u0, u1, n:22, ph:0}); }
      STATIC.segs.push(mkS(CX+u0,CZ+2.7,CX+u1,CZ+2.7,.1,Y0-.3,Yf(2)+2.2,'⇧ Thành thang cuốn'), mkS(CX+u0,CZ+5.3,CX+u1,CZ+5.3,.1,Y0-.3,Yf(2)+2.2,'⇧ Thành thang cuốn'), mkS(CX+u0+s*.4,CZ+4.0,CX+u1,CZ+4.0,.05,Y0-.3,Yf(2)+2.2,'⇧ Giữa 2 thang cuốn: bên trong đi LÊN, bên ngoài đi XUỐNG'),
        mkS(CX+s*17.62,CZ+2.7,CX+s*17.62,CZ+5.3,.1,Y0-.3,Y0+2.3,'⇧ Gầm thang cuốn'));
      const n=22, du=EL/n; for(let i=0;i<n;i++) STATIC.plats.push(mkR(CX+s*(8.84+(i+.5)*du),CZ+4.0,0,du/2+.02,1.32,Y0+ER*(i+1)/n));
      makeLabel('⇧ Thang cuốn đôi','Lên tầng 2 · Buffet / Hầm rượu',{h:.3, x:CX+s*9.6, y:Y0+2.6, z:CZ+4, fade:22}); }
    /* QUẦY LỄ TÂN (cánh Tây, θ 168–192°) + vách logo + CONCIERGE (θ 148°) */
    { const arc=(r0,r1,t0,t1)=>{ const p=[]; for(let t=t0;t<=t1+1e-6;t+=3) p.push(XZ(r1,t)); for(let t=t1;t>=t0-1e-6;t-=3) p.push(XZ(r0,t)); return p; };
      SL.put(M.walnut, extrude(slabShape(arc(22.65,23.4,168,192)), Y0+1.02, .9)); SL.put(M.marble, extrude(slabShape(arc(22.5,23.5,167.5,192.5)), Y0+1.16, .08));
      SL.put(M.gold, band(22.62,168,192,Y0+.12,Y0+.2,false,3)); SL.put(M.gold, band(22.62,168,192,Y0+.86,Y0+.92,false,3));
      arcSegs(STATIC.segs, 23.0, 168, 192, Y0-.3, Y0+1.3, '🛎️ Quầy lễ tân', [], 3, .45);
      const [c,g]=canvas(1024,256); g.fillStyle='#1d1814'; g.fillRect(0,0,1024,256); g.strokeStyle='#c9a24a'; g.lineWidth=6; g.strokeRect(10,10,1004,236); g.fillStyle='#d9b45a'; g.textAlign='center'; g.font='700 64px Georgia,serif'; g.fillText('THE ROYAL LOTUS-CRESCENT',512,112); g.font='600 52px Georgia,serif'; g.fillText('P A L A C E',512,186);
      const lm=new THREE.MeshStandardMaterial({map:ctex(c), roughness:.35, metalness:.3, emissive:0x2a2010, emissiveIntensity:.3}); const lg=band(26.3,170,190,Y0+1.4,Y0+3.6,false,2); const uv=lg.attributes.uv, nn=uv.count/2; for(let i=0;i<nn;i++){ uv.setXY(i*2,1-i/(nn-1),0); uv.setXY(i*2+1,1-i/(nn-1),1); } SL.put(lm, lg);
      SL.put(M.marble, band(26.42,169,191,Y0,Y0+4.2,false,2)); SL.put(M.marble, band(26.62,169,191,Y0,Y0+4.2,true,2)); arcSegs(STATIC.segs, 26.5, 169, 191, Y0-.3, Y0+4.2, '🛎️ Vách sau quầy lễ tân', [], 3, .2);
      { const p=XZ(22.6,148); SL.put(M.walnut, lathe([[0,0],[.75,0],[.8,.1],[.62,.95],[.82,1.04],[.82,1.12],[0,1.12]],24), M4(p[0],Y0,p[1])); SL.put(M.gold, new THREE.TorusGeometry(.8,.035,6,32), M4(p[0],Y0+1.1,p[1],0,1,1,1,Math.PI/2)); STATIC.circ.push({x:p[0],z:p[1],r:.85,y0:Y0-.3,y1:Y0+1.2}); }
      makeLabel('🛎️ Lễ tân','Thuê phòng · Deluxe / Imperial / Penthouse',{h:.36, x:XZ(23,180)[0], y:Y0+3.9, z:XZ(23,180)[1], fade:30}); }
    /* LOBBY LOUNGE (cánh Đông): 2 cụm sofa nhung lục bảo + bàn đá + thảm Ba Tư, Grand Piano + nghệ sĩ */
    { const sofaG=(L)=>{ const g=[ni(rbox(L,.42,.9,.08,2)).translate(0,.25,0), ni(rbox(L,.62,.22,.08,2)).translate(0,.66,-.36)]; for(const s of [-1,1]) g.push(ni(rbox(.2,.55,.9,.06,2)).translate(s*(L/2-.1),.45,0)); return W.mergeGeometries(g,false); };
      const sof=sofaG(2.6), arm=sofaG(1.0), tbl=lathe([[0,0],[.3,0],[.12,.08],[.1,.36],[.62,.4],[.62,.46],[0,.46]],24);
      for(const t of [-36,-12]){ const r=24.6, [x,z]=XZ(r,t), yo=yawOut(t);
        SL.put(M.rug, new THREE.PlaneGeometry(4.4,3.4), M4(x,Y0+.012,z,yo,1,1,1,-Math.PI/2)); SL.put(M.marble, tbl, M4(x,Y0+.01,z)); SL.put(M.gold, new THREE.TorusGeometry(.62,.025,6,32), M4(x,Y0+.46,z,0,1,1,1,Math.PI/2));
        for(const [dr,dt,ry,g] of [[1.55,0,Math.PI,sof],[-1.55,0,0,sof],[0,3.3,-Math.PI/2,arm],[0,-3.3,Math.PI/2,arm]]){ const p=XZ(r+dr,t+dt); SL.put(M.emer, g, M4(p[0],Y0,p[1],yo+ry)); STATIC.circ.push({x:p[0],z:p[1],r:g===sof?.9:.55,y0:Y0-.3,y1:Y0+1}); } STATIC.circ.push({x,z,r:.65,y0:Y0-.3,y1:Y0+.5}); }
      /* Grand Piano đen bóng viền vàng */ const [px,pz]=XZ(24.2,22), py=yawOut(22)+Math.PI*.85; PIANO.x=px; PIANO.z=pz; const pm=M4(px,Y0,pz,py);
      const ps=new THREE.Shape(); ps.moveTo(-.78,0); ps.lineTo(.78,0); ps.lineTo(.78,.9); ps.bezierCurveTo(.78,1.6,.2,1.55,.05,1.95); ps.bezierCurveTo(-.15,2.35,-.78,2.1,-.78,1.6); ps.lineTo(-.78,0);
      const pb=new THREE.ExtrudeGeometry(ps,{depth:.36, bevelEnabled:true, bevelThickness:.03, bevelSize:.03, bevelSegments:3}); pb.rotateX(-Math.PI/2); pb.translate(0,.62,0); SL.put(M.lacq, pb, pm);
      const lid=new THREE.ExtrudeGeometry(ps,{depth:.025, bevelEnabled:false}); lid.rotateX(-Math.PI/2); lid.translate(.78,0,0); SL.put(M.lacq, lid, pm.clone().multiply(M4(-.78,1.05,0,0,1,1,1,0,.62)));
      SL.put(M.gold, tube([[-.78,1.03,-.3],[-.2,1.62,-.9]],.012,4), pm); SL.put(M.cream, new THREE.BoxGeometry(1.5,.04,.16), pm.clone().multiply(M4(0,.8,.1))); for(let i=0;i<36;i++) if([1,3,6,8,10].includes(i%12)) SL.put(M.lacq, new THREE.BoxGeometry(.022,.035,.09), pm.clone().multiply(M4(-.72+i*.0412,.83,.07)));
      for(const [lx,lz] of [[-.65,.05],[.65,.05],[-.3,-1.7]]) SL.put(M.gold, lathe([[.06,0],[.09,.08],[.05,.3],[.07,.62],[0,.62]],12), pm.clone().multiply(M4(lx,0,-lz)));
      SL.put(M.lacq, rbox(.9,.12,.38,.04,2), pm.clone().multiply(M4(0,.5,.62))); for(const lx of [-.38,.38]) SL.put(M.gold, new THREE.CylinderGeometry(.025,.025,.48,6), pm.clone().multiply(M4(lx,.24,.62)));
      STATIC.circ.push({x:px,z:pz,r:1.35,y0:Y0-.3,y1:Y0+1.3}); PIANO.seat=pm.clone().multiply(M4(0,.56,.62)); PIANO.yaw=py;
      INTER.push({x:XZ(21.6,22)[0], z:XZ(21.6,22)[1], r:2.4, prio:.5, when:()=>Math.abs(P.y-Y0)<1.4, label:'🎹 Nghe Grand Piano · Lobby Lounge (E)', action:()=>{ PIANO.boost=40; toast('🎹 Nghệ sĩ chuyển sang bản "Trăng trên vịnh" – ngồi nghe nhé',2600); try{ W.ambience && W.ambience.start && W.ambience.start(); }catch(e){} }});
      makeLabel('🎹 Lobby Lounge','Grand Piano · sofa nhung lục bảo',{h:.32, x:px, y:Y0+3.4, z:pz, fade:28}); }
    /* bảng sơ đồ tầng cạnh thang máy */
    { const [c,g]=canvas(512,768); g.fillStyle='#14110e'; g.fillRect(0,0,512,768); g.strokeStyle='#c9a24a'; g.lineWidth=5; g.strokeRect(8,8,496,752); g.fillStyle='#e8c66a'; g.textAlign='left'; g.font='700 30px Georgia,serif'; g.fillText('SƠ ĐỒ TẦNG',30,54);
      const L=[['★','Sân thượng · Trực thăng VIP'],['24','Sky Lounge & Bar'],['22–23','Royal Penthouse (Đông)'],['20','Sky-Cantilever Pool'],['16–21','Imperial Gold Suite'],['6–15','Deluxe Ocean Suite'],['5','Hồ bơi vô cực · Pool bar'],['4','CLB Bida Hoàng gia · Lounge'],['3','Spa · Sauna · Gym'],['2','Buffet · Hầm rượu'],['1','Grand Atrium · Lễ tân']];
      g.font='600 25px Segoe UI,sans-serif'; L.forEach(([a,b],i)=>{ g.fillStyle='#d9b45a'; g.fillText(a,30,112+i*58); g.fillStyle='#efe2c4'; g.fillText(b,130,112+i*58); });
      const sm=new THREE.MeshStandardMaterial({map:ctex(c), roughness:.4, emissive:0x2a1e0c, emissiveIntensity:.35}); const sx=CX+7.2, sz=CZ-3.0;
      SL.put(sm, new THREE.PlaneGeometry(1.3,1.95), M4(sx,Y0+1.6,sz+.04)); SL.put(M.gold, rbox(1.45,2.1,.08,.03,2), M4(sx,Y0+1.6,sz)); SL.put(M.gold, new THREE.CylinderGeometry(.05,.05,.6,8), M4(sx,Y0+.3,sz)); STATIC.circ.push({x:sx,z:sz,r:.5,y0:Y0-.3,y1:Y0+2.7}); }
  }

  /* ============================== 11. 3 THANG MÁY KÍNH TOÀN CẢNH (liftkit) – 25 điểm dừng: tầng 1 → 24 + sân thượng ============================== */
  const FLOOR_NAME=k=>k===1?'Tầng 1 · Grand Atrium & Lễ tân':k===2?'Tầng 2 · Buffet & Hầm rượu':k===3?'Tầng 3 · Spa & Gym':k===4?'Tầng 4 · CLB Bida Hoàng gia':k===5?'Tầng 5 · Hồ bơi vô cực':k===20?'Tầng 20 · Imperial + Sky Pool':k===24?'Tầng 24 · Sky Lounge':k===25?'Sân thượng · Trực thăng VIP':k>=22?`Tầng ${k} · Royal Penthouse / Imperial`:k>=16?`Tầng ${k} · Imperial Gold Suite`:`Tầng ${k} · Deluxe Ocean Suite`;
  let LIFTS=[]; try{ LIFTS=makeLiftBank(W,{x:CX, z:CZ-3.28, yaw:0, count:3, w:2.4, d:2.4, gap:.6, name:'Thang kính Royal', color:0xd4af37, floors:Array.from({length:25},(_,i)=>({y:Yf(i+1), name:FLOOR_NAME(i+1), short:i===0?'G':i===24?'★':String(i+1)}))}); }catch(e){ console.warn('[abyssal_hotel] liftkit', e); }

  /* ============================== 12. ĐỒ BAN CÔNG (InstancedMesh): ghế tắm nắng đôi, bồn cây nhiệt đới, đèn lồng trụ + đèn cầu + dây treo + cây mái ============================== */
  const LOUNGE={frame:[], cush:[], pot:[], leaf:[], lan:[]};
  for(const w of WINGS) for(let k=2;k<=24;k++) for(let j=0;j<6;j++){ const {t0,t1,tc}=room(w,j), y=Yf(k);
    for(const dt of [3.6,6.6]){ LOUNGE.frame.push(at(30.62,tc+dt,y,0)); LOUNGE.cush.push(at(30.62,tc+dt,y,0)); }
    LOUNGE.pot.push(at(30.7,t0+2.2,y)); LOUNGE.leaf.push(at(30.7,t0+2.2,y+.95,j*.7,1,1.1,1)); LOUNGE.lan.push(at(30.35,t1-1.2,y)); }
  for(const pl of POOLS){ const y=Yf(pl.k); for(const s of [-1,1]) for(let i=0;i<3;i++){ const u=s*(pl.k===20?7.6:8.2), v=pl.inner+(pl.inner<0?-1:1)*(3+i*2.6); LOUNGE.frame.push(M4(CX+u,y,CZ+v,s>0?-Math.PI/2:Math.PI/2)); LOUNGE.cush.push(M4(CX+u,y,CZ+v,s>0?-Math.PI/2:Math.PI/2)); } }
  { const fr=W.mergeGeometries([ni(new THREE.BoxGeometry(.66,.1,1.86)).translate(0,.32,0), ...[[-.28,-.8],[.28,-.8],[-.28,.8],[.28,.8]].map(([x,z])=>ni(new THREE.BoxGeometry(.05,.3,.05)).translate(x,.15,z))],false);
    const cu=W.mergeGeometries([ni(new THREE.BoxGeometry(.6,.1,1.2)).translate(0,.43,.3), ni(new THREE.BoxGeometry(.6,.1,.66)).rotateX(-.75).translate(0,.62,-.55)],false);
    inst(fr, M.teak, LOUNGE.frame, mid, {name:'aby-hotel-loungers'}); inst(cu, M.cream, LOUNGE.cush, mid);
    inst(lathe([[0,0],[.42,0],[.5,.1],[.4,.78],[.46,.86],[0,.86]],8), M.trav, LOUNGE.pot, mid); inst(new THREE.IcosahedronGeometry(.6,0), M.leaf2, LOUNGE.leaf, mid);
    inst(lathe([[0,0],[.13,0],[.09,.1],[.11,.62],[0,.7]],6), M.glow, LOUNGE.lan, mid);
    const post=lathe([[0,0],[.16,0],[.12,.2],[.07,.4],[.06,3.4],[.1,3.5],[0,3.5]],10), armG=tube([[-.62,3.15,0],[-.4,3.5,0],[0,3.42,0],[.4,3.5,0],[.62,3.15,0]],.03,5), glb=new THREE.SphereGeometry(.17,10,8), PM=[], GM=[];
    for(const [x,y,z,ry] of LAMPPOS){ const m=M4(x,y,z,ry); PM.push(m); for(const s of [-1,1]) GM.push(m.clone().multiply(M4(s*.62,3.02,0))); }
    inst(W.mergeGeometries([ni(post),ni(armG)],false), M.bronze, PM, mid, {name:'aby-hotel-lamps'}); inst(glb, M.glow, GM, mid);
    inst(new THREE.CylinderGeometry(.04,.04,1,5), M.gold, BR.hangers, mid, {name:'aby-hotel-hangers'});
    /* vườn trên mái cánh Đông */ const TR=[], CR=[]; for(let t=-48;t<=48;t+=12) for(const r of [21.2,27.4]){ const y=TOPY; TR.push(at(r,t+(r>24?6:0),y)); CR.push(at(r,t+(r>24?6:0),y+2.6,t,1.3,1.1,1.3)); }
    inst(lathe([[0,0],[.18,0],[.12,1.2],[.1,2.2],[0,2.3]],8), M.trunk, TR, mid); inst(new THREE.IcosahedronGeometry(1,1), M.leaf, CR, mid);
    for(const m of TR){ const p=new THREE.Vector3().setFromMatrixPosition(m); STATIC.circ.push({x:p.x,z:p.z,r:.4,y0:TOPY-.3,y1:TOPY+2.5}); } }

  /* ============================== 13. NỘI THẤT THEO TẦNG (chỉ dựng tầng người chơi đang đứng – dựng lần đầu khi tới, sau đó chỉ bật/tắt) ============================== */
  const sofaG=(L)=>{ const b=ni(rbox(L,.42,.9,.08,2)).translate(0,.25,0), bk=ni(rbox(L,.62,.22,.08,2)).translate(0,.66,-.36), a1=ni(rbox(.2,.55,.9,.06,2)).translate(-(L/2-.1),.45,0), a2=ni(rbox(.2,.55,.9,.06,2)).translate(L/2-.1,.45,0); return W.mergeGeometries([b,bk,a1,a2],false); };
  const GEO={ sofa:sofaG(2.4), arm:sofaG(1.0), sofaL:sofaG(3.4), ctab:lathe([[0,0],[.28,0],[.1,.08],[.08,.36],[.55,.4],[.55,.45],[0,.45]],20), stool:lathe([[0,0],[.22,0],[.05,.06],[.04,.68],[.2,.7],[.2,.78],[0,.8]],14),
    lamp:lathe([[0,0],[.1,0],[.04,.04],[.03,.32],[.06,.36],[0,.36]],12), shade:lathe([[.1,0],[.18,0],[.12,.24],[.06,.24]],14), tub:lathe([[0,0],[.95,0],[1.02,.06],[1.02,.6],[.92,.62],[.84,.12],[0,.12]],28),
    basin:lathe([[0,0],[.24,0],[.28,.05],[.3,.16],[.26,.17],[.2,.06],[0,.06]],16), barrel:lathe([[.36,0],[.42,.25],[.44,.5],[.42,.75],[.36,1]],14), tvc:(()=>{ const g=new THREE.CylinderGeometry(4,4,1.3,20,1,true,-.28,.56); g.translate(0,0,-4); return g; })(),
    chair:(()=>{ const s=ni(rbox(.48,.08,.48,.03,1)).translate(0,.46,0), b=ni(rbox(.48,.55,.07,.03,1)).translate(0,.76,-.22), l=[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].map(([x,z])=>ni(new THREE.CylinderGeometry(.025,.02,.46,6)).translate(x,.23,z)); return W.mergeGeometries([s,b,...l],false); })() };
  const IG=new Map(); const getGroup=(key,build)=>{ let g=IG.get(key); if(!g){ g=new THREE.Group(); g.name='aby-hotel-int-'+key; g.userData.dynamic=true; g.visible=false; root.add(g); try{ build(g); }catch(e){ console.warn('[abyssal_hotel] nội thất', key, e); } IG.set(key,g); } return g; };
  const flushTo=(B,g)=>B.flush(g,{dynamic:true, name:'aby-hotel-int'});
  /* phòng nghỉ 1 cánh (6 phòng) ở cao độ 0 – nhóm được dời lên tầng hiện tại */
  function buildRooms(ws, type, g){ const B=Bins(), imp=type==='imperial', vel=imp?M.bord:M.emer, wood=imp?M.mahog:M.walnut;
    for(const w of ws) for(let j=0;j<6;j++){ const {t0,t1,tc}=room(w,j);
      B.put(M.floorWood, sector(R_COR+.08,R_GL-.06,t0+.12,t1-.12,.012,true,2.5,2));
      B.put(M.rug, new THREE.PlaneGeometry(3.6,2.8), at(26.6,tc-3.4,.02,0,1,1,1).multiply(M4(0,0,0,0,1,1,1,-Math.PI/2)));
      /* giường King (Deluxe) / giường tròn (Imperial) bọc lụa vàng, đầu giường nhung */
      const bt=t1-1.35/23.6/D, bm=at(23.6,bt,0,Math.PI/2);
      if(!imp){ B.put(wood, rbox(2.1,.42,2.25,.06,2), bm.clone().multiply(M4(0,.21,0))); B.put(M.cream, rbox(1.98,.26,2.12,.1,3), bm.clone().multiply(M4(0,.55,0))); B.put(M.silk, rbox(2.04,.07,1.0,.03,2), bm.clone().multiply(M4(0,.71,.52)));
        B.put(vel, rbox(2.4,1.45,.18,.07,3), bm.clone().multiply(M4(0,.95,-1.12))); for(const s of [-1,1]) B.put(M.cream, rbox(.62,.17,.4,.08,2), bm.clone().multiply(M4(s*.46,.76,-.78))); }
      else { B.put(wood, new THREE.CylinderGeometry(1.42,1.42,.42,40), bm.clone().multiply(M4(0,.21,0))); B.put(M.cream, lathe([[0,0],[1.34,0],[1.36,.12],[1.3,.26],[0,.27]],40), bm.clone().multiply(M4(0,.42,0)));
        B.put(M.silk, new THREE.CylinderGeometry(1.0,1.0,.04,32,1,false,-1.2,2.4), bm.clone().multiply(M4(0,.7,.25))); B.put(M.gold, new THREE.TorusGeometry(1.42,.04,6,48), bm.clone().multiply(M4(0,.42,0,0,1,1,1,Math.PI/2)));
        B.put(vel, new THREE.CylinderGeometry(1.6,1.6,1.5,24,1,true,Math.PI-.9,1.8), bm.clone().multiply(M4(0,.95,.3))); for(const s of [-1,1]) B.put(M.cream, rbox(.62,.17,.4,.08,2), bm.clone().multiply(M4(s*.42,.78,-.95))); }
      for(const s of [-1,1]){ const nm=bm.clone().multiply(M4(s*1.45,0,-.9)); B.put(wood, rbox(.5,.55,.45,.04,2), nm.clone().multiply(M4(0,.275,0))); B.put(M.gold, GEO.lamp, nm.clone().multiply(M4(0,.55,0))); B.put(M.glowSoft, GEO.shade, nm.clone().multiply(M4(0,.88,0))); }
      /* TV cong 100" + kệ */ const tm=at(23.6,t0+.16/23.6/D,0,-Math.PI/2); B.put(M.lacq, GEO.tvc, tm.clone().multiply(M4(0,1.55,.04))); B.put(M.screen, GEO.tvc, tm.clone().multiply(M4(0,1.55,.075,0,.97,.94,1))); B.put(wood, rbox(2.2,.48,.45,.04,2), tm.clone().multiply(M4(0,.24,.3)));
      /* sofa da Ý + bàn đá + ghế bành + Jacuzzi mạ vàng sát kính + tủ rượu + lavabo */
      B.put(M.leather, GEO.sofa, at(26.9,tc-2.5,0,Math.PI/2)); B.put(M.marble, GEO.ctab, at(26.9,tc-6.1,0)); B.put(M.leather, GEO.arm, at(28.4,tc-7.4,0,Math.PI));
      const jm=at(27.85,t1-3.3,0); B.put(M.gold, GEO.tub, jm); B.put(M.water, new THREE.CircleGeometry(.86,28), jm.clone().multiply(M4(0,.5,0,0,1,1,1,-Math.PI/2))); B.put(M.gold, new THREE.TorusGeometry(1.0,.05,6,40), jm.clone().multiply(M4(0,.62,0,0,1,1,1,Math.PI/2)));
      const wm=at(20.72,tc+1,0); B.put(wood, rbox(1.1,1.9,.46,.04,2), wm.clone().multiply(M4(0,.95,0))); B.put(M.rail, new THREE.PlaneGeometry(.9,1.6), wm.clone().multiply(M4(0,1.0,.24))); for(let r=0;r<4;r++) for(let c=0;c<4;c++) B.put(M.glowSoft, new THREE.CylinderGeometry(.035,.035,.3,6), wm.clone().multiply(M4(-.33+c*.22,.42+r*.38,.05,0,1,1,1,Math.PI/2)));
      const lv=at(20.55,t1-2.3,0); B.put(M.marble, rbox(1.3,.12,.55,.03,2), lv.clone().multiply(M4(0,.86,0))); B.put(wood, rbox(1.2,.8,.5,.04,2), lv.clone().multiply(M4(0,.4,0))); B.put(M.cream, GEO.basin, lv.clone().multiply(M4(0,.92,.02))); B.put(M.gold, tube([[0,.92,-.2],[0,1.12,-.2],[0,1.14,-.08],[0,1.06,-.02]],.018,5), lv); B.put(M.chrome, new THREE.PlaneGeometry(1.1,1.0), lv.clone().multiply(M4(0,1.75,-.22)));
      /* cửa trượt phòng (InstancedMesh, cửa phòng đã thuê mở) + đèn tường hành lang */
      B.put(M.glowSoft, rbox(.18,.32,.08,.03,1), at(R_COR-.1,t0+8.4,1.9,0)); }
    for(const w of ws) B.put(M.rug, sector(17.8,19.9,w.a0+.5,w.a1-.5,.014,true,2.5,1.2));
    flushTo(B,g);
    const dg=ni(rbox(1.5,2.38,.07,.02,1)).translate(0,1.2,0), dh=ni(new THREE.CylinderGeometry(.02,.02,.5,6)).translate(-.55,1.15,-.06);
    const leaf=new THREE.InstancedMesh(dg, wood, ws.length*6), hand=new THREE.InstancedMesh(dh, M.gold, ws.length*6); for(const im of [leaf,hand]){ im.userData.dynamic=true; im.frustumCulled=false; g.add(im); } g.userData.doors={leaf, hand, ws}; setDoors(g, null); }
  function setDoors(g, open){ const d=g.userData.doors; if(!d) return; d.ws.forEach((w,wi)=>{ for(let j=0;j<6;j++){ const {t0}=room(w,j), op=!!open && open.w===w.key && open.j===j, tm=t0+4.8+(op?3.9:0), m=at(R_COR-.12,tm,0,Math.PI); d.leaf.setMatrixAt(wi*6+j,m); d.hand.setMatrixAt(wi*6+j,m); } }); d.leaf.instanceMatrix.needsUpdate=true; d.hand.instanceMatrix.needsUpdate=true; }
  M.floorWood=mk('WALNUT_WOOD',{repeat:[.5,.5], color:0x8a5a36}); M.floorWood.polygonOffset=true; M.floorWood.polygonOffsetFactor=-2; M.floorWood.polygonOffsetUnits=-4;
  M.rug.polygonOffset=true; M.rug.polygonOffsetFactor=-3; M.rug.polygonOffsetUnits=-6;

  /* Royal Penthouse (cánh Đông tầng 22 + 23, cầu thang cong nội bộ θ −48°→−32°) */
  const ST_T0=-48, ST_T1=-32, ST_N=24, ST_R0=21.8, ST_R1=23.2;
  function buildPent(k, g){ const B=Bins(), y=Yf(k);
    B.put(M.floorWood, sector(R_COR+.08,R_GL-.06,-59.8,59.8,y+.012,true,2.5,2)); B.put(M.rug, sector(17.8,19.9,-59.5,59.5,y+.014,true,2.5,1.2));
    if(k===22){ B.put(M.rug, new THREE.PlaneGeometry(5,4), at(25.4,-14,y+.02,0).multiply(M4(0,0,0,0,1,1,1,-Math.PI/2)));
      B.put(M.bord, GEO.sofaL, at(27.3,-14,y,Math.PI)); B.put(M.bord, GEO.sofaL, at(25.4,-21.5,y,-Math.PI/2)); B.put(M.marble, GEO.ctab, at(25.4,-14,y,0).multiply(M4(0,0,0,0,1.4,1,1.4)));
      const dm=at(24.6,14,y,Math.PI/2); B.put(M.mahog, rbox(3.6,.08,1.3,.04,2), dm.clone().multiply(M4(0,.76,0))); for(const lx of [-1.4,1.4]) B.put(M.gold, lathe([[.1,0],[.16,.05],[.06,.2],[.05,.72],[0,.72]],12), dm.clone().multiply(M4(lx,0,0)));
      for(let i=0;i<8;i++){ const lx=i<4?-1.35+i*.9:-1.35+(i-4)*.9, lz=i<4?-.9:.9; B.put(M.bord, GEO.chair, dm.clone().multiply(M4(lx,0,lz,i<4?0:Math.PI))); }
      B.put(M.glowSoft, new THREE.TorusGeometry(.9,.05,6,32), dm.clone().multiply(M4(0,3.6,0,0,1,1,1,Math.PI/2)));
      const bar=[]; for(let t=40;t<=54.01;t+=2) bar.push(XZ(21.6,t)); for(let t=54;t>=39.99;t-=2) bar.push(XZ(21.0,t)); B.put(M.mahog, extrude(slabShape(bar), y+1.08, .95)); B.put(M.gold, band(21.62,40,54,y+1.0,y+1.08,true,2));
      for(let t=42;t<=52;t+=2.5) B.put(M.gold, GEO.stool, at(22.4,t,y)); B.put(M.lacq, GEO.tvc, at(28.6,-34,y,-Math.PI*.35).multiply(M4(0,1.7,0,0,1.15,1.15,1)));
      /* cầu thang cong lên tầng 23: bậc gỗ óc chó nẹp LED vàng + cốn vàng + lan can kính + tay vịn */
      const SM=[], LM=[]; for(let i=0;i<ST_N;i++){ const tA=ST_T0+(ST_T1-ST_T0)*i/ST_N, tB=ST_T0+(ST_T1-ST_T0)*(i+1)/ST_N, ys=y+(i+1)*FH/ST_N; B.put(M.walnut, sector(ST_R0,ST_R1,tA-.05,tB+.05,ys,true,1,1)); B.put(M.walnut, band(ST_R1,tA,tB,ys-.2,ys,true,1)); B.put(M.walnut, band(ST_R0,tA,tB,ys-.2,ys,false,1)); B.put(M.walnut, sector(ST_R0,ST_R1,tA-.05,tB+.05,ys-.2,false,1,1));
        const a=XZ(ST_R0,tA), b=XZ(ST_R1,tA); B.put(M.glow, quad([a[0],ys-.2,a[1]],[b[0],ys-.2,b[1]],[b[0],ys-.17,b[1]],[a[0],ys-.17,a[1]])); }
      for(const r of [ST_R0-.05,ST_R1+.05]){ const yf=t=>y+FH*(t-ST_T0)/(ST_T1-ST_T0); B.put(M.rail, band(r,ST_T0,ST_T1,yf,t=>yf(t)+1.0,r>22,1)); const hp=[]; for(let t=ST_T0;t<=ST_T1+1e-6;t+=2){ const [x,z]=XZ(r,t); hp.push([x,yf(t)+1.05,z]); } B.put(M.gold, tube(hp,.03,6)); const sp=[]; for(let t=ST_T0;t<=ST_T1+1e-6;t+=2){ const [x,z]=XZ(r,t); sp.push([x,yf(t)-.3,z]); } B.put(M.gold, tube(sp,.07,6)); } }
    else { /* tầng 23: phòng ngủ chủ – giường tròn lụa vàng, Jacuzzi mạ vàng sát kính, TV cong, tủ quần áo, bàn trang điểm */
      const bm=at(24.8,18,y,Math.PI/2); B.put(M.mahog, new THREE.CylinderGeometry(1.7,1.7,.45,48), bm.clone().multiply(M4(0,.225,0))); B.put(M.cream, lathe([[0,0],[1.62,0],[1.64,.14],[1.56,.3],[0,.31]],48), bm.clone().multiply(M4(0,.45,0)));
      B.put(M.silk, new THREE.CylinderGeometry(1.25,1.25,.04,32,1,false,-1.2,2.4), bm.clone().multiply(M4(0,.77,.3))); B.put(M.gold, new THREE.TorusGeometry(1.7,.05,6,56), bm.clone().multiply(M4(0,.45,0,0,1,1,1,Math.PI/2))); B.put(M.bord, new THREE.CylinderGeometry(1.95,1.95,1.7,24,1,true,Math.PI-.95,1.9), bm.clone().multiply(M4(0,1.05,.3)));
      const jm=at(27.4,44,y,0); B.put(M.gold, GEO.tub, jm.clone().multiply(M4(0,0,0,0,1.35,1,1.35))); B.put(M.water, new THREE.CircleGeometry(1.16,28), jm.clone().multiply(M4(0,.5,0,0,1,1,1,-Math.PI/2)));
      B.put(M.lacq, GEO.tvc, at(23.6,4.2,y,-Math.PI/2).multiply(M4(0,1.6,.04,0,1.15,1.15,1))); B.put(M.screen, GEO.tvc, at(23.6,4.2,y,-Math.PI/2).multiply(M4(0,1.6,.08,0,1.1,1.08,1)));
      for(let t=-26;t<=-14;t+=3) B.put(M.mahog, rbox(1.2,2.4,.6,.04,2), at(20.5,t,y).multiply(M4(0,1.2,0))); B.put(M.leather, GEO.arm, at(28.2,-6,y,Math.PI)); B.put(M.leather, GEO.arm, at(28.2,2,y,Math.PI));
      const ring=[]; for(let t=-50;t<=-31.5;t+=2) ring.push([...XZ(21.5,t)]); for(const r of [21.5,23.5]){ const hp=[]; for(let t=-49.5;t<=-32+1e-6;t+=2){ const [x,z]=XZ(r,t); hp.push([x,y+1.05,z]); } B.put(M.rail, band(r,-49.5,-32,y+.02,y+1.0,r>22,2)); B.put(M.gold, tube(hp,.03,6)); }
      { const a=XZ(21.5,-49.5), b=XZ(23.5,-49.5); B.put(M.rail, quad([a[0],y+.02,a[1]],[b[0],y+.02,b[1]],[b[0],y+1,b[1]],[a[0],y+1,a[1]])); } }
    flushTo(B,g); }
  /* vách hành lang penthouse (r 20,1) – 1 cửa chính θ 8–12,6° */
  for(const k of [22,23]){ const y=Yf(k), yT=Yf(k+1)-.42; for(const [p,q] of [[-60,8],[12.6,60]]){ S1.put(M.walnut, band(R_COR-.06,p,q,y,yT,false,2.5,1.5,1.5)); S1.put(M.plaster, band(R_COR+.06,p,q,y,yT,true,2.5)); } S1.put(M.walnut, band(R_COR-.06,8,12.6,y+2.45,yT,false,2.5,1.5,1.5)); S1.put(M.gold, new THREE.BoxGeometry(.12,2.5,.12), at(R_COR-.1,8,y+1.25)); S1.put(M.gold, new THREE.BoxGeometry(.12,2.5,.12), at(R_COR-.1,12.6,y+1.25)); }

  /* tầng tiện ích 2–5 + Sky Lounge 24 */
  const AMEN={}; const amenItem=(k,o)=>{ (AMEN[k]=AMEN[k]||[]).push(o); };
  function buildAmen(k, g){ const B=Bins(), y=Yf(k), C=[];   /* C: va chạm đồ đạc (trả về cho floorData) */
    const circ=(x,z,r,h=1.6)=>C.push({x,z,r,y0:y-.3,y1:y+h}), cAt=(r,t,rr,h)=>{ const p=XZ(r,t); circ(p[0],p[1],rr,h); };
    for(const w of WINGS) B.put(k===2&&w.key==='W'?M.mahog:k===3&&w.key==='E'?M.teak:M.floorWood, sector(17.7,R_GL-.06,w.a0+.1,w.a1-.1,y+.012,true,2.5,2));
    if(k===2){ /* BUFFET (Đông) */ for(const [a,b] of [[-46,-16],[16,46]]){ const pts=[]; for(let t=a;t<=b+1e-6;t+=2) pts.push(XZ(22.6,t)); for(let t=b;t>=a-1e-6;t-=2) pts.push(XZ(21.6,t)); B.put(M.marble, extrude(slabShape(pts), y+.92, .85)); B.put(M.gold, band(22.62,a,b,y+.84,y+.92,true,2));
        const sg=[]; for(let t=a;t<=b+1e-6;t+=2){ const [x,z]=XZ(22.1,t); sg.push([x,y+1.42,z]); } B.put(M.gold, tube(sg,.025,5)); B.put(M.rail, band(22.1,a,b,y+1.0,y+1.4,true,2)); for(let t=a+2;t<b;t+=3){ B.put(M.glowSoft, rbox(.6,.08,.42,.03,1), at(22.1,t,y+.98)); B.put(M.chrome, new THREE.SphereGeometry(.28,12,6,0,TAU,0,Math.PI/2), at(22.1,t,y+1.02,0,1,.6,1)); }
        arcSegs(C, 22.1, a, b, y-.3, y+1.2, '🍽️ Quầy buffet', [], 3, .55); }
      for(const t of [-52,-36,-22,22,36,52]) for(const r of [26.6]){ const m=at(r,t,y); B.put(M.cream, new THREE.CylinderGeometry(.75,.75,.05,28), m.clone().multiply(M4(0,.76,0))); B.put(M.gold, lathe([[.3,0],[.36,.04],[.08,.12],[.06,.74],[0,.74]],14), m); B.put(M.glowSoft, new THREE.SphereGeometry(.07,8,6), m.clone().multiply(M4(0,.86,0)));
        for(let i=0;i<4;i++){ const a2=i*Math.PI/2+.4; B.put(M.bord, GEO.chair, m.clone().multiply(M4(Math.cos(a2)*1.05,0,Math.sin(a2)*1.05,-a2-Math.PI/2))); } cAt(r,t,1.25,1.1); }
      amenItem(2,{w:'E', r:21, t:-30, label:'🍽️ Ăn buffet hải sản & bò Wagyu – 250 💰 (E)', cost:250, msg:'🍽️ Ngon tuyệt! Tôm hùm, bò Wagyu, sushi… Năng lượng đầy ắp.'});
      /* HẦM RƯỢU (Tây) */ const BR2=[]; for(const [a,b] of [[124,154],[206,236]]) for(let t=a;t<=b;t+=3.2) for(const r of [20.6,21.5]) for(let h=0;h<2;h++) BR2.push([r,t,h]);
      for(const [r,t,h] of BR2) B.put(M.walnut, GEO.barrel, at(r,t,y+.05+h*.92,0,1,1,1).multiply(M4(0,.46,0,0,1,1,1,Math.PI/2)));
      for(const [a,b] of [[124,154],[206,236]]) arcSegs(C, 21.05, a, b, y-.3, y+1.9, '🍷 Giá thùng rượu sồi', [], 3, .6);
      for(const t of [140,160,200,220]){ const m=at(25,t,y,Math.PI/2); B.put(M.mahog, rbox(3.2,2.4,.4,.03,2), m.clone().multiply(M4(0,1.2,0))); for(let r2=0;r2<5;r2++) for(let c2=0;c2<12;c2++) B.put(r2%2?M.glowSoft:M.bord, new THREE.CylinderGeometry(.04,.04,.28,6), m.clone().multiply(M4(-1.4+c2*.255,.35+r2*.45,.12,0,1,1,1,Math.PI/2))); const p=XZ(25,t); radSegs(C,t,23.4,26.6,y-.3,y+2.4,'🍷 Kệ rượu vang'); void p; }
      { const pts=[]; for(let t=172;t<=188.01;t+=2) pts.push(XZ(25.6,t)); for(let t=188;t>=171.99;t-=2) pts.push(XZ(24.9,t)); B.put(M.mahog, extrude(slabShape(pts), y+1.08, .95)); B.put(M.gold, band(24.88,172,188,y+1.0,y+1.08,false,2)); for(let t=174;t<=186;t+=4) B.put(M.gold, GEO.stool, at(24.1,t,y)); arcSegs(C, 25.25, 172, 188, y-.3, y+1.2, '🍷 Quầy nếm rượu', [], 2, .45); }
      amenItem(2,{w:'W', r:23.6, t:180, label:'🍷 Nếm rượu vang 3 loại – 180 💰 (E)', cost:180, msg:'🍷 Vang đỏ thơm mùi gỗ sồi… sommelier gật gù.'}); }
    if(k===3){ /* SPA (Đông): giường massage, bể sục, phòng xông hơi */ for(const t of [-46,-32,32,46]){ const m=at(24.6,t,y,0); B.put(M.walnut, rbox(.85,.62,2.0,.05,2), m.clone().multiply(M4(0,.31,0))); B.put(M.cream, rbox(.8,.14,1.95,.07,2), m.clone().multiply(M4(0,.69,0))); B.put(M.emer, rbox(.4,.12,.5,.05,2), m.clone().multiply(M4(0,.82,-.7))); cAt(24.6,t,1.0,1); }
      { const m=at(25,-14,y); B.put(M.marble, lathe([[0,0],[1.75,0],[1.8,.08],[1.8,.62],[1.66,.66],[1.58,.12],[0,.12]],32), m); B.put(M.water, new THREE.CircleGeometry(1.6,32), m.clone().multiply(M4(0,.55,0,0,1,1,1,-Math.PI/2))); B.put(M.gold, new THREE.TorusGeometry(1.75,.05,6,48), m.clone().multiply(M4(0,.66,0,0,1,1,1,Math.PI/2))); cAt(25,-14,1.85,1); }
      { const m=at(25.8,18,y,-Math.PI/2); B.put(M.teak, rbox(3.2,2.6,.1,.03,1), m.clone().multiply(M4(0,1.3,-1.2))); B.put(M.teak, rbox(3.2,2.6,.1,.03,1), m.clone().multiply(M4(0,1.3,1.2))); B.put(M.teak, rbox(.1,2.6,2.4,.03,1), m.clone().multiply(M4(-1.6,1.3,0))); B.put(M.teak, rbox(3.3,.1,2.5,.03,1), m.clone().multiply(M4(0,2.62,0))); B.put(M.rail, new THREE.PlaneGeometry(2.4,2.5), m.clone().multiply(M4(1.6,1.3,0,Math.PI/2))); B.put(M.teak, rbox(3.0,.08,.6,.03,1), m.clone().multiply(M4(0,.5,-.8)));
        const p=XZ(25.8,18); C.push(...rectSegs(p[0],p[1],yawOut(18)-Math.PI/2,1.65,1.25,y-.3,y+2.6,'🧖 Phòng xông hơi Sauna (bấm E ngoài cửa)')); }
      amenItem(3,{w:'E', r:23.4, t:-38, label:'💆 Massage đá nóng 60 phút – 300 💰 (E)', cost:300, msg:'💆 Thư giãn toàn thân… hồi phục 100% năng lượng.'}); amenItem(3,{w:'E', r:22.6, t:-14, label:'🛁 Ngâm bể sục nước khoáng (E)', cost:0, msg:'🛁 Nước ấm 38°C, bọt khí massage – dễ chịu quá!'}); amenItem(3,{w:'E', r:22.8, t:18, label:'🧖 Xông hơi Sauna gỗ (E)', cost:0, msg:'🧖 Hơi nóng 80°C… nhớ uống nước nhé.'});
      /* GYM (Tây) */ for(let t=130;t<=230;t+=20){ if(Math.abs(t-180)<8) continue; const m=at(27.4,t,y,0); B.put(M.lacq, rbox(.8,.18,1.9,.04,2), m.clone().multiply(M4(0,.2,0))); B.put(M.pad, rbox(.55,.03,1.5,.01,1), m.clone().multiply(M4(0,.3,.05))); for(const s of [-1,1]) B.put(M.chrome, tube([[s*.36,.2,-.8],[s*.36,1.15,-.85]],.03,5), m); B.put(M.lacq, rbox(.8,.3,.12,.03,1), m.clone().multiply(M4(0,1.2,-.88))); cAt(27.4,t,1.0,1.3); }
      for(const t of [150,210]){ const m=at(23.2,t,y,Math.PI/2); B.put(M.leather, rbox(.35,.1,1.3,.04,1), m.clone().multiply(M4(0,.45,0))); B.put(M.chrome, tube([[-.5,1.2,0],[.5,1.2,0]],.025,5), m); for(const s of [-1,1]){ B.put(M.chrome, tube([[s*.5,0,0],[s*.5,1.25,0]],.03,5), m); B.put(M.lacq, new THREE.CylinderGeometry(.22,.22,.05,16), m.clone().multiply(M4(s*.62,1.2,0,0,1,1,1,0,Math.PI/2))); } cAt(23.2,t,.9,1.3); }
      { const m=at(20.7,195,y); B.put(M.chrome, rbox(1.6,.06,.4,.02,1), m.clone().multiply(M4(0,.7,0))); B.put(M.chrome, rbox(1.6,.06,.4,.02,1), m.clone().multiply(M4(0,.35,0))); for(let i=0;i<8;i++) B.put(M.lacq, new THREE.CylinderGeometry(.06,.06,.32,8), m.clone().multiply(M4(-.65+i*.185,i%2?.78:.43,0,0,1,1,1,Math.PI/2))); cAt(20.7,195,.85,1); }
      amenItem(3,{w:'W', r:24.5, t:170, label:'🏋️ Tập gym 15 phút với HLV (E)', cost:0, msg:'🏋️ Chạy 3 km + nâng tạ – đổ mồ hôi sảng khoái!'}); }
    if(k===4){ /* CLB BIDA HOÀNG GIA (Đông): 4 bàn khung mạ vàng + đèn chụp 3 chao */ for(const t of [-42,-18,18,42]){ const m=at(24.6,t,y,Math.PI/2); B.put(M.gold, rbox(2.9,.26,1.48,.06,3), m.clone().multiply(M4(0,.66,0))); B.put(M.felt, rbox(2.62,.05,1.22,.01,1), m.clone().multiply(M4(0,.8,0)));
        for(const [lx,lz] of [[-1.25,-.55],[0,-.55],[1.25,-.55],[-1.25,.55],[0,.55],[1.25,.55]]) B.put(M.gold, lathe([[.07,0],[.1,.06],[.06,.2],[.08,.36],[.05,.53],[0,.53]],12), m.clone().multiply(M4(lx,0,lz)));
        B.put(M.gold, rbox(1.9,.05,.08,.02,1), m.clone().multiply(M4(0,2.6,0))); for(const lx of [-.7,0,.7]){ B.put(M.emer, new THREE.ConeGeometry(.24,.22,18,1,true), m.clone().multiply(M4(lx,2.3,0))); B.put(M.glowSoft, new THREE.SphereGeometry(.06,8,6), m.clone().multiply(M4(lx,2.24,0))); }
        const p=XZ(24.6,t); C.push(...rectSegs(p[0],p[1],yawOut(t)+Math.PI/2,1.5,.78,y-.3,y+1.0,'🎱 Bàn bida mạ vàng')); }
      BIL.y=y; { const m=at(24.6,-18,y,Math.PI/2); BIL.m=m; }
      amenItem(4,{w:'E', r:22.4, t:-18, label:'🎱 Đánh một cơ Bida 3 băng (E)', cost:0, act:()=>BIL.shot()});
      /* LOUNGE XÌ-GÀ & THƯ VIỆN (Tây): sofa da Chesterfield + giá sách */ for(const t of [140,165,195,220]){ B.put(M.leather, GEO.sofa, at(26.6,t,y,Math.PI)); B.put(M.marble, GEO.ctab, at(25,t,y)); B.put(M.leather, GEO.arm, at(23.4,t,y,0)); cAt(26.6,t,1.25,1); cAt(25,t,.6,.5); cAt(23.4,t,.6,1); }
      for(const t of [128,232]){ const m=at(24.5,t,y,Math.PI/2); B.put(M.walnut, rbox(4,2.6,.4,.03,2), m.clone().multiply(M4(0,1.3,0))); for(let r2=0;r2<5;r2++) for(let c2=0;c2<14;c2++) B.put([M.bord,M.emer,M.leather][(r2*3+c2)%3], rbox(.12,.36+((c2*5)%3)*.04,.28,.01,1), m.clone().multiply(M4(-1.75+c2*.26,.32+r2*.5,.05))); radSegs(C,t,22.4,26.6,y-.3,y+2.6,'📚 Giá sách'); }
      amenItem(4,{w:'W', r:24.4, t:180, label:'📚 Đọc sách · thưởng trà Ô long (E)', cost:0, msg:'📚 Một góc yên tĩnh nhìn ra vịnh – thư thái.'}); }
    if(k===5){ /* POOL BAR (Đông, sát cửa ra hồ) + PHÒNG THAY ĐỒ (Tây) */ const pts=[]; for(let t=-50;t<=-28.01;t+=2) pts.push(XZ(24.6,t)); for(let t=-28;t>=-50.01;t-=2) pts.push(XZ(23.8,t)); B.put(M.teak, extrude(slabShape(pts), y+1.08, .95)); B.put(M.gold, band(23.78,-50,-28,y+1.0,y+1.08,false,2));
      for(let t=-48;t<=-30;t+=4.5) B.put(M.gold, GEO.stool, at(22.9,t,y)); for(let t=-49;t<=-29;t+=1.2) B.put(t%2.4<1.2?M.glowSoft:M.emer, new THREE.CylinderGeometry(.04,.04,.3,6), at(25.2,t,y+1.25)); arcSegs(C, 24.2, -50, -28, y-.3, y+1.2, '🍹 Quầy bar hồ bơi', [], 2, .45);
      amenItem(5,{w:'E', r:22.4, t:-39, label:'🍹 Gọi nước dừa tươi – 40 💰 (E)', cost:40, msg:'🥥 Nước dừa mát lạnh – ra hồ bơi phía Bắc thôi!'});
      for(let t=206;t<=236;t+=1.4) B.put(M.walnut, rbox(.5,2.0,.5,.02,1), at(20.6,t,y).multiply(M4(0,1.0,0))); arcSegs(C, 20.6, 205, 237, y-.3, y+2, '🔐 Tủ đồ', [], 3, .3);
      for(const t of [215,228]){ B.put(M.teak, rbox(2.2,.08,.45,.03,1), at(23,t,y,Math.PI/2).multiply(M4(0,.45,0))); cAt(23,t,.6,.6); }
      amenItem(5,{w:'W', r:22.6, t:220, label:'🩱 Thay đồ bơi + lấy khăn (E)', cost:0, msg:'🩱 Đã thay đồ bơi – ra cửa cuối hành lang phía Bắc tới hồ bơi vô cực.'}); }
    if(k===24){ /* SKY LOUNGE & BAR (2 cánh) */ for(const [a,b] of [[-30,-8],[188,210]]){ const pts=[]; for(let t=a;t<=b+1e-6;t+=2) pts.push(XZ(22.2,t)); for(let t=b;t>=a-1e-6;t-=2) pts.push(XZ(21.4,t)); B.put(M.mahog, extrude(slabShape(pts), y+1.08, .95)); B.put(M.gold, band(22.22,a,b,y+1.0,y+1.08,true,2)); for(let t=a+2;t<b;t+=4) B.put(M.gold, GEO.stool, at(23,t,y)); arcSegs(C, 21.8, a, b, y-.3, y+1.2, '🍸 Quầy bar Sky Lounge', [], 2, .45); }
      for(const t of [-48,26,44,138,158,226]){ B.put(M.bord, GEO.sofa, at(27.6,t,y,Math.PI)); B.put(M.marble, GEO.ctab, at(26.1,t,y)); cAt(27.6,t,1.25,1); cAt(26.1,t,.6,.5); }
      amenItem(24,{w:'E', r:23.6, t:-19, label:'🍸 Gọi cocktail hoàng hôn – 120 💰 (E)', cost:120, msg:'🍸 Cocktail "Royal Lotus" – ngắm vịnh từ độ cao 110 m.'}); amenItem(24,{w:'W', r:23.6, t:199, label:'🍸 Gọi rượu vang sủi – 120 💰 (E)', cost:120, msg:'🥂 Chúc mừng! Ánh đèn vịnh lấp lánh bên dưới.'}); }
    flushTo(B,g); g.position.y=0; return C; }
  const BIL={y:0, m:null, balls:null, t:0, shot(){ if(!BIL.balls) return; const a=Math.random()*TAU, sp=2.4+Math.random()*1.4; BIL.balls[0].vx=Math.cos(a)*sp; BIL.balls[0].vz=Math.sin(a)*sp; BIL.t=7; toast('🎱 Cốc! Bi trắng lao đi trên bàn mạ vàng…',2200); }};
  function rectSegs(cx,cz,ry,hw,hd,y0,y1,msg){ const c=Math.cos(ry), s=Math.sin(ry), Pt=(lx,lz)=>[cx+lx*c+lz*s, cz-lx*s+lz*c], K=[Pt(-hw,-hd),Pt(hw,-hd),Pt(hw,hd),Pt(-hw,hd)], o=[]; for(let i=0;i<4;i++){ const a=K[i], b=K[(i+1)%4]; o.push(mkS(a[0],a[1],b[0],b[1],.08,y0,y1,msg)); } return o; }

  /* ============================== 14. DỮ LIỆU VA CHẠM TỪNG TẦNG (dựng lần đầu khi cần, chỉ tầng hiện tại ±1 nằm trong plats/SEGS/circles) ============================== */
  const FD={}, DOOR={}, posOf=m=>new THREE.Vector3().setFromMatrixPosition(m);
  const rectAt=(rc,tc,hw,hd,h)=>{ const [x,z]=XZ(rc,tc); return mkR(x,z,yawOut(tc),hw,hd,h); };
  const poolEnds=k=>k===5?[-60,240]:k===20?[60,120]:[];
  let RENT=null;
  const rentedHere=(k,wk,j)=>!!RENT && RENT.k===k && RENT.w===wk && (RENT.type==='pent' || RENT.j===j);
  function roomColl(w,j,k,type){ const y=Yf(k), o=[], {t0,t1,tc}=room(w,j), y0=y-.3, imp=type==='imperial';
    const bt=t1-1.35/23.6/D, bm=at(23.6,bt,y,Math.PI/2), bp=posOf(bm); o.push(...rectSegs(bp.x,bp.z,yawOut(bt)+Math.PI/2,imp?1.45:1.08,imp?1.45:1.15,y0,y+1.1,'🛏️ Giường'));
    for(const s of [-1,1]){ const p=posOf(bm.clone().multiply(M4(s*1.45,0,-.9))); o.push({x:p.x,z:p.z,r:.3,y0,y1:y+1.3}); }
    { const p=posOf(at(23.6,t0+.16/23.6/D,y,-Math.PI/2).multiply(M4(0,0,.3))); o.push({x:p.x,z:p.z,r:.5,y0,y1:y+.6}); }
    { const p=posOf(at(26.9,tc-2.5,y)); o.push(...rectSegs(p.x,p.z,yawOut(tc-2.5)+Math.PI/2,1.2,.45,y0,y+1,'🛋️ Sofa')); }
    for(const [r,t,rr] of [[26.9,tc-6.1,.5],[28.4,tc-7.4,.55],[27.85,t1-3.3,1.06],[20.72,tc+1,.6],[20.55,t1-2.3,.62]]){ const p=XZ(r,t); o.push({x:p[0],z:p[1],r:rr,y0,y1:y+1.6}); }
    for(const dt of [3.6,6.6]){ const m=at(30.62,tc+dt,y); o.push(...rectSegs(posOf(m).x,posOf(m).z,yawOut(tc+dt),.34,.94,y0,y+.6,'🌴 Ghế tắm nắng')); }
    { const p=XZ(30.7,t0+2.2); o.push({x:p[0],z:p[1],r:.5,y0,y1:y+1.8}); const q=XZ(30.35,t1-1.2); o.push({x:q[0],z:q[1],r:.2,y0,y1:y+.8}); }
    return o; }
  function floorData(k){ if(FD[k]) return FD[k]; const y=Yf(k), y0=y-.3, y1=y+2.2, Pl=[], S=[], C=[];
    for(const w of WINGS) for(let j=0;j<6;j++){ if(w.key==='E' && k===23 && j<2) continue; Pl.push(rectAt(25.47,w.a0+10+20*j,5.9,8.3,y)); }
    if(k===23) Pl.push(rectAt(18.875,-40,7.44,2.575,y), rectAt(28.675,-40,11.65,5.125,y), rectAt(22.5,-54.5,2.36,1.1,y), rectAt(22.5,-26,2.56,1.1,y));
    if(k<=24) Pl.push(mkR(CX,CZ,0,17.75,2.05,y)); else Pl.push({t:'c', x:CX, z:CZ, r:R_IN+.15, h:y}, {t:'c', x:HELI.x, z:HELI.z, r:5.6, h:HELI.y});
    for(const w of WINGS){ const pe=poolEnds(k);
      arcSegs(S, t=>rb(t,k)-.14, w.a0, w.a1, y0, y1, `🌇 Lan can ban công tầng ${k} – cao ${Math.round(y)} m`);
      for(const te of [w.a0,w.a1]){ if(k<=24){ radSegs(S, te, R_IN-.05, R_GL, y0, y1, pe.includes(te)?'🚪 Cửa ra hồ bơi ở cuối hành lang':'🧱 Đầu hồi toà nhà', pe.includes(te)?[[17.7,20.0]]:[]); radSegs(S, te, R_GL, rb(te,k)-.14, y0, y1, '🌇 Lan can đầu ban công'); }
        else radSegs(S, te, R_IN-.05, rb(te,k)-.14, y0, y1, '🌇 Lan can mép mái'); }
      if(k<=24){ const gaps=[[w.tc-7,w.tc+7]]; if(k===2) gaps.push(w.key==='E'?[8.4,17.6]:[162.4,171.6]); arcSegs(S, R_IN+.05, w.a0, w.a1, y0, y1, '🔭 Lan can kính nhìn xuống khối pha lê', gaps);
        const bg=[]; for(let j=0;j<6;j++){ const {tc}=room(w,j); bg.push([tc-5,tc-1.4]); } arcSegs(S, R_GL, w.a0, w.a1, y0, y1, '🪟 Vách kính – ra ban công qua cửa trượt', bg); }
      if(k<=24 && isRoomFloor(k) && !isPent(w,k)){ const type=typeOf(w,k);
        for(let j=0;j<6;j++){ const {t0,t1}=room(w,j); arcSegs(S, R_COR, t0, t1, y0, y1, '🚪 Vách phòng – vào bằng cửa (E để thuê)', [[t0+2.5,t0+7.1]]);
          const a=XZ(R_COR,t0+2.5), b=XZ(R_COR,t0+7.1), ds=mkS(a[0],a[1],b[0],b[1],.1,y0,y1,`🔒 Phòng ${roomNo(w,k,j)} đã khoá – bấm E để thuê`); ds._y=[y0,y1]; S.push(ds); ((DOOR[k]=DOOR[k]||{})[w.key]=DOOR[k][w.key]||[])[j]=ds;
          if(j>0){ radSegs(S, t0, R_COR, R_GL, y0, y1, '🧱 Vách ngăn phòng'); radSegs(S, t0, R_GL, rb(t0,k)-.14, y0, y1, '🧱 Vách ngăn ban công'); }
          C.push(...roomColl(w,j,k,type)); } }
      if(isPent(w,k)){ arcSegs(S, R_COR, w.a0, w.a1, y0, y1, '🚪 Royal Penthouse – cửa chính cạnh sảnh thang', [[8,12.6]]); const a=XZ(R_COR,8), b=XZ(R_COR,12.6), ds=mkS(a[0],a[1],b[0],b[1],.1,y0,y1,'🔒 Royal Penthouse đã khoá – bấm E để thuê'); ds._y=[y0,y1]; S.push(ds); ((DOOR[k]=DOOR[k]||{}).P=ds); } }
    if(k===22){ for(let i=0;i<ST_N;i++){ const tA=ST_T0+(ST_T1-ST_T0)*i/ST_N, tB=ST_T0+(ST_T1-ST_T0)*(i+1)/ST_N; Pl.push(rectAt((ST_R0+ST_R1)/2,(tA+tB)/2,(tB-tA)*D*22.5/2+.04,(ST_R1-ST_R0)/2,y+(i+1)*FH/ST_N)); }
      for(const r of [ST_R0-.12,ST_R1+.12]) arcSegs(S, r, ST_T0, ST_T1, y0, Yf(23)-.05, '🪜 Lan can cầu thang penthouse', [], 2); radSegs(S, ST_T1, ST_R0-.1, ST_R1+.1, y0, y+2.2, '🪜 Gầm cầu thang');
      for(const [r,t,rr] of [[27.3,-14,1.7],[25.4,-21.5,1.7],[25.4,-14,.8],[24.6,14,2.0],[24.2,30,1.4]]){ const p=XZ(r,t); C.push({x:p[0],z:p[1],r:rr,y0,y1:y+1.1}); } arcSegs(S, 21.3, 40, 54, y0, y+1.2, '🍸 Quầy bar penthouse', [], 2); }
    if(k===23){ for(const r of [21.5,23.5]) arcSegs(S, r, -49.5, -32, y0, y1, '🪜 Lan can giếng thang', [], 2); radSegs(S, -49.5, 21.4, 23.6, y0, y1, '🪜 Lan can giếng thang');
      for(const [r,t,rr] of [[24.8,18,1.8],[27.4,44,1.4],[28.2,-6,.6],[28.2,2,.6]]){ const p=XZ(r,t); C.push({x:p[0],z:p[1],r:rr,y0,y1:y+1.1}); } arcSegs(S, 20.5, -27, -13, y0, y1, '🚪 Tủ quần áo', [], 2); }
    for(const pl of POOLS) if(pl.k===k){ const sv=pl.inner<0?-1:1, rect=(u0,u1,v0,v1,h)=>Pl.push(mkR(CX+(u0+u1)/2,CZ+(v0+v1)/2,0,(u1-u0)/2+.04,(v1-v0)/2+.04,h)), vi=pl.inner, vo=pl.inner<0?pl.v0:pl.v1, ve=sv*(pl.rOut+1.2);
      rect(-9.6,9.6,Math.min(vi,sv*14.6),Math.max(vi,sv*14.6),y); rect(-pl.rOut*.52,pl.u0,Math.min(vi,ve),Math.max(vi,ve),y); rect(pl.u1,pl.rOut*.52,Math.min(vi,ve),Math.max(vi,ve),y); rect(pl.u0,pl.u1,Math.min(vo,ve),Math.max(vo,ve),y);
      rect(pl.u0+.02,pl.u1-.02,pl.v0+.02,pl.v1-.02,y-1.25); for(let i=0;i<2;i++){ const za=vi+sv*i*.9, zb=za+sv*.9; rect(-1.5,1.5,Math.min(za,zb),Math.max(za,zb),y-.45-.4*i); }
      { /* thành hồ: chặn người đang ở dưới lòng hồ (không chặn người trên sàn) – hở đúng chỗ bậc lên ở đầu trong */ const yb0=y-1.25-.1, yb1=y-.6, X0=CX+pl.u0, X1=CX+pl.u1, Za=CZ+pl.v0, Zb=CZ+pl.v1, zin=CZ+pl.inner, msg='🏊 Thành hồ – lên bằng bậc ở đầu hồ';
        S.push(mkS(X0,Za,X0,Zb,.08,yb0,yb1,msg), mkS(X1,Za,X1,Zb,.08,yb0,yb1,msg)); const zout=pl.inner<0?Za:Zb; S.push(mkS(X0,zout,X1,zout,.08,yb0,yb1,msg)); S.push(mkS(X0,zin,CX-1.55,zin,.08,yb0,yb1,msg), mkS(CX+1.55,zin,X1,zin,.08,yb0,yb1,msg));
        for(const sx of [-1.55,1.55]) S.push(mkS(CX+sx,zin,CX+sx,zin+sv*1.8,.06,yb0,yb1+.4,msg)); }
      arcSegs(S, pl.rOut-.15, pl.g0, pl.g1, y0, y1, '🌊 Lan can kính hồ bơi vô cực'); for(const t of [pl.g0,pl.g1]) radSegs(S, t, rb(t,k)-.15, pl.rOut-.1, y0, y1, '🌊 Lan can kính hồ bơi'); arcSegs(S, R_IN-.02, pl.g0, pl.g1, y0, y1, '💎 Vách kính khối pha lê', [], 15);
      for(const s of [-1,1]) for(let i=0;i<3;i++){ const u=s*(pl.k===20?7.6:8.2), v=pl.inner+sv*(3+i*2.6); C.push(...rectSegs(CX+u,CZ+v,s>0?-Math.PI/2:Math.PI/2,.34,.94,y0,y+.6,'🌴 Ghế tắm nắng')); } }
    if(k===25){ for(const [g0,g1] of [[60,120],[-120,-60]]) arcSegs(S, R_IN+.05, g0, g1, y0, y1, '🌇 Mép mái khối pha lê', [], 7.5); }
    if([2,3,4,5,24].includes(k)){ const g=getGroup('amen'+k, gg=>{ gg.userData.coll=buildAmen(k,gg); }); C.push(...(g.userData.coll||[])); }
    for(const ds of S) if(ds._y) applyDoor(ds,k);
    return FD[k]={plats:Pl, segs:S, circ:C}; }
  function applyDoor(ds,k){ const d=DOOR[k]||{}; let open=false; if(ds===d.P) open=!!RENT && RENT.type==='pent'; else for(const wk of ['E','W']) (d[wk]||[]).forEach((s,j)=>{ if(s===ds && rentedHere(k,wk,j)) open=true; }); ds.y0=open?1e6:ds._y[0]; ds.y1=open?-1e6:ds._y[1]; }
  function refreshDoors(){ for(const k of Object.keys(FD)) for(const ds of FD[k].segs) if(ds._y) applyDoor(ds,+k); }
  let WIN=[], WINS=[];   /* WIN: tầng có sàn đứng (hiện tại ±1) · WINS: tầng bật lan can + đồ đạc (chỉ tầng hiện tại) */
  function setWindow(ks, fc){ const ss=(fc>=2 && fc<=25)?[fc]:[];
    for(const k of WIN) if(!ks.includes(k)) turnOff(plats,FD[k].plats); for(const k of ks) if(!WIN.includes(k)) turnOn(plats,floorData(k).plats); WIN=ks.slice();
    for(const k of WINS) if(!ss.includes(k)){ turnOff(SEGS,FD[k].segs); turnOff(circles,FD[k].circ); } for(const k of ss) if(!WINS.includes(k)){ const d=floorData(k); turnOn(SEGS,d.segs); turnOn(circles,d.circ); } WINS=ss; }

  /* ============================== 15. THUÊ PHÒNG (E) – lễ tân hoặc ngay cửa phòng · lưu theo ngày ============================== */
  const today=()=>new Date().toISOString().slice(0,10), S0=ctx.S||null, fmt=ctx.fmt||(n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.'));
  try{ const r=S0 && S0.abyHotel; if(r && r.day===today()) RENT=r; }catch(e){}
  const saveRent=()=>{ try{ if(S0){ S0.abyHotel=RENT; ctx.save && ctx.save(); } }catch(e){} };
  const rentName=r=>!r?'':r.type==='pent'?'Royal Penthouse (tầng 22–23, cánh Đông)':`Phòng ${roomNo(WINGS.find(w=>w.key===r.w),r.k,r.j)} · ${TYPES[r.type].name}`;
  function pay(cost, what, go){ if(!cost || !ctx.askPay) return go(); ctx.askPay(cost, what, ()=>{ if(ctx.spend && !ctx.spend(cost)) return; go(); }); }
  function doRent(r){ const T=TYPES[r.type]; pay(T.price, `${T.icon} Thuê <b>${r.type==='pent'?'Royal Penthouse 2 tầng':'Phòng '+roomNo(WINGS.find(w=>w.key===r.w),r.k,r.j)}</b> · ${T.name} tới hết hôm nay<br><span class="muted">Giường bọc lụa vàng · sofa da Ý · TV cong 100" · tủ rượu · Jacuzzi mạ vàng · quản gia trực</span>`, ()=>{
      RENT={...r, day:today()}; saveRent(); refreshDoors(); refreshFloor(true); toast(`🔑 Đã thuê ${rentName(RENT)}! Cửa phòng tự mở · đi thang kính tới tầng ${r.k}.`,5200); }); }
  function pickRoom(type){ const T=TYPES[type]; if(type==='pent') return {type, k:22, w:'E', j:0}; const k=T.k0+Math.floor(Math.random()*(T.k1-T.k0+1)); return {type, k, w:Math.random()<.5?'E':'W', j:Math.floor(Math.random()*6)}; }
  function receptionMenu(){ const ui=ctx.ui; if(!ui || !ui.modal){ doRent(pickRoom('deluxe')); return; } const m=ui.modal('🛎️ Lễ tân · The Royal Lotus-Crescent Palace');
    m.body.innerHTML=`${RENT?`<p>🔑 Bạn đang thuê: <b>${rentName(RENT)}</b> (hết hạn cuối ngày).</p>`:'<p>Chào mừng quý khách! Chọn hạng phòng – nhận phòng ngay, quản gia trực tầng.</p>'}<div class="grid">${Object.entries(TYPES).map(([id,T])=>`<div class="card"><div class="ic">${T.icon}</div><b>${T.name}</b><small>${id==='pent'?'Cả cánh Đông tầng 22–23 · cầu thang cong nội bộ · piano · bàn tiệc 8 ghế':id==='imperial'?`Tầng ${T.k0}–${T.k1} · giường tròn lụa vàng · nhung đỏ rượu vang`:`Tầng ${T.k0}–${T.k1} · giường King · nhìn ra vịnh`}</small><button class="btn pri" data-t="${id}">${fmt(T.price)} 💰</button></div>`).join('')}
      ${RENT?'<div class="card"><div class="ic">🛏️</div><b>Về phòng</b><small>Đưa bạn tới cửa phòng đã thuê.</small><button class="btn" data-go="1">Đi ngay</button></div>':''}</div>`;
    m.body.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ m.close(); doRent(pickRoom(b.dataset.t)); }); const g=m.body.querySelector('[data-go]'); if(g) g.onclick=()=>{ m.close(); goRoom(); }; }
  function conciergeMenu(){ const ui=ctx.ui; if(!ui || !ui.modal){ toast('🗝️ Concierge: Sky Pool tầng 20 · Spa tầng 3 · Bida tầng 4 · trực thăng trên mái',4000); return; } const m=ui.modal('🗝️ Concierge – gợi ý trong khách sạn');
    const L=[['🏊','Sky-Cantilever Pool','Tầng 20 · đáy kính','pool'],['🚁','Bãi đáp trực thăng VIP','Sân thượng','heli'],['💆','Spa · Sauna · Gym','Tầng 3','f3'],['🎱','CLB Bida Hoàng gia','Tầng 4','f4'],['🍸','Sky Lounge','Tầng 24','f24']];
    m.body.innerHTML=`<div class="grid">${L.map(([i,n,s,id])=>`<div class="card"><div class="ic">${i}</div><b>${n}</b><small>${s}</small><button class="btn pri" data-g="${id}">Đưa tôi tới</button></div>`).join('')}</div>`;
    m.body.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ m.close(); const id=b.dataset.g; if(id==='pool') goPool(); else if(id==='heli') goFloor(25,HELI.x+6.5,HELI.z,HELI.x,HELI.z); else { const k=+id.slice(1), p=XZ(R_IN+1.2,4); goFloor(k,p[0],p[1],XZ(25,4)[0],XZ(25,4)[1]); } }); }
  function goFloor(k,x,z,lx,lz){ setWindow([k],k); FORCE=1.2; teleport(x,z,lx,lz); }
  function goRoom(){ if(!RENT){ toast('🛎️ Bạn chưa thuê phòng – tới quầy lễ tân (cánh Tây, tầng 1) hoặc bấm E ở cửa phòng.',3600); return; } const w=WINGS.find(q=>q.key===RENT.w), tD=RENT.type==='pent'?10.3:room(w,RENT.j).t0+4.8, p=XZ(18.8,tD), q=XZ(24,tD); goFloor(RENT.k,p[0],p[1],q[0],q[1]); }
  function goPool(){ goFloor(20, CX+7.5, CZ+19.8, CX, CZ+30); }
  let FORCE=0;
  /* cửa phòng: 12 điểm E dùng chung cho mọi tầng phòng (vị trí giống nhau) */
  for(const w of WINGS) for(let j=0;j<6;j++){ const {t0}=room(w,j), p=XZ(18.7,t0+4.8);
    const it={x:p[0], z:p[1], r:1.5, prio:.7, when:()=>isRoomFloor(curF) && !isPent(w,curF) && Math.abs(P.y-Yf(curF))<1.2, label:'', action:()=>{ const k=curF; if(rentedHere(k,w.key,j)) return toast(`🔑 ${rentName(RENT)} – phòng của bạn, cửa đã mở. Giường / Jacuzzi / TV / tủ rượu: bấm E.`,3600); doRent({type:typeOf(w,k), k, w:w.key, j}); }};
    Object.defineProperty(it,'label',{get(){ const k=curF; if(!isRoomFloor(k)) return ''; return rentedHere(k,w.key,j) ? `🔑 Phòng ${roomNo(w,k,j)} của bạn (E)` : `🛎️ Phòng ${roomNo(w,k,j)} · ${TYPES[typeOf(w,k)].name} – thuê ${fmt(TYPES[typeOf(w,k)].price)} 💰 (E)`; }}); INTER.push(it); }
  { const p=XZ(18.7,10.3); const it={x:p[0], z:p[1], r:1.6, prio:.7, when:()=>(curF===22 || curF===23) && Math.abs(P.y-Yf(curF))<1.2, label:'', action:()=>{ if(RENT && RENT.type==='pent') return toast('💎 Royal Penthouse của bạn – cầu thang cong nội bộ nối tầng 22 ↔ 23.',3400); doRent({type:'pent', k:22, w:'E', j:0}); }};
    Object.defineProperty(it,'label',{get(){ return RENT && RENT.type==='pent' ? '💎 Royal Penthouse của bạn (E)' : `💎 Royal Penthouse 2 tầng – thuê ${fmt(35000)} 💰 (E)`; }}); INTER.push(it); }
  { const p=XZ(21.0,180); INTER.push({x:p[0], z:p[1], r:2.4, prio:.8, when:()=>Math.abs(P.y-Y0)<1.4, label:'🛎️ Lễ tân – thuê phòng / về phòng (E)', action:receptionMenu}); const q=XZ(21.3,148); INTER.push({x:q[0], z:q[1], r:2.0, prio:.6, when:()=>Math.abs(P.y-Y0)<1.4, label:'🗝️ Concierge – đưa tới Sky Pool / Spa / trực thăng (E)', action:conciergeMenu}); }
  /* đồ trong phòng đã thuê (vị trí tính theo phòng) */
  const RI={}; const riPos=()=>{ if(!RENT) return null; const k=RENT.k; if(RENT.type==='pent') return {k, bed:[XZ(22.6,18),23], tub:[XZ(26,44),23], tv:[XZ(25.6,-14),22], wine:[XZ(22.6,47),22], bal:[XZ(29.9,0),22]}; const w=WINGS.find(q=>q.key===RENT.w), {t0,t1,tc}=room(w,RENT.j);
    return {k, bed:[XZ(25.3,t1-4),k], tub:[XZ(26.4,t1-5.6),k], tv:[XZ(24.6,t0+4),k], wine:[XZ(21.5,tc+1),k], bal:[XZ(30.2,tc-3.2),k]}; };
  for(const [id,label,fn] of [['bed','😴 Ngủ một giấc tới sáng (E)',()=>{ try{ W.setTime && W.setTime(0); }catch(e){} toast('☀️ Chào buổi sáng! Quản gia đã chuẩn bị bữa sáng trên ban công.',4200); }],
    ['tub','🛁 Ngâm Jacuzzi mạ vàng sát kính (E)',()=>toast('🛁 Bồn sục ấm áp, ngắm vịnh qua vách kính cong…',3600)], ['tv','📺 Bật TV cong 100" (E)',()=>{ RI.tvOn=!RI.tvOn; M.screen.emissive.setHex(RI.tvOn?0x3a78c8:0x10263a); M.screen.emissiveIntensity=RI.tvOn?1.4:.6; toast(RI.tvOn?'📺 TV: kênh thiên nhiên 8K – cá voi ngoài khơi':'📺 Đã tắt TV',2600); }],
    ['wine','🍷 Mở tủ rượu – rót 1 ly vang (E)',()=>toast('🍷 Vang đỏ 2015 – quản gia đã ướp lạnh vừa đủ.',3000)], ['bal','🌅 Ra ban công nằm ghế tắm nắng (E)',()=>toast('🌅 Gió vịnh mát rượi – nằm thư giãn trên ghế đôi.',3000)]]){
    INTER.push({get x(){ const r=riPos(); return r?r[id][0][0]:1e6; }, get z(){ const r=riPos(); return r?r[id][0][1]:1e6; }, r:1.9, prio:.75, when:()=>{ const r=riPos(); return !!r && curF===r[id][1] && Math.abs(P.y-Yf(r[id][1]))<1.3; }, label, action:fn}); }
  /* tiện ích các tầng 2–5, 24 */
  function amenInter(){ for(const k of Object.keys(AMEN)) for(const a of AMEN[k]){ if(a._i) continue; a._i=true; const p=XZ(a.r,a.t); INTER.push({x:p[0], z:p[1], r:2.0, prio:.6, when:()=>curF===+k && Math.abs(P.y-Yf(+k))<1.3, label:a.label, action:()=>{ if(a.act) return a.act(); pay(a.cost, a.label.replace(/ – .*| \(E\)/g,''), ()=>toast(a.msg,3600)); }}); } }
  /* hồ bơi + trực thăng */
  for(const pl of POOLS){ const sv=pl.inner<0?-1:1; INTER.push({x:CX, z:CZ+pl.inner+sv*.4, r:2.2, prio:.5, when:()=>curF===pl.k && Math.abs(P.y-Yf(pl.k))<1.3, label:'🏊 Xuống hồ bơi theo bậc ở đây · nước sâu 1,1 m (E)', action:()=>toast(pl.glass?'🏊 Bơi trên đáy kính – bên dưới là vịnh và porte-cochère cách 90 m!':'🏊 Nước 28°C, mép tràn vô cực nhìn ra 2 toà tháp phía Bắc.',3800)}); }
  const FLY={t:0}; INTER.push({x:HELI.x+3.2, z:HELI.z, r:2.4, prio:.6, when:()=>curF===25 && Math.abs(P.y-TOPY)<1.6, label:'🚁 Bay trực thăng VIP ngắm vịnh 12 giây (E)', action:()=>{ FLY.t=12; toast('🚁 Cất cánh! Vòng quanh vịnh Abyssal…',2600); }});

  /* ============================== 16. NHÂN VIÊN (doorman, bellboy, lễ tân, concierge, nghệ sĩ piano, quản gia) – tạo khi lại gần ============================== */
  const npcG=new THREE.Group(); npcG.name='aby-hotel-npc'; npcG.userData.dynamic=true; root.add(npcG); const NPC=[]; let npcBuilt=false, BUTLER=null; const hatM=new THREE.MeshStandardMaterial({color:0x14110e, roughness:.5});
  function npc(salt, female, outfit, name, x, y, z, face, pose, hat){ const people=W.people; if(!people || !people.kit || !W.makeActor) return null;
    try{ const seed=people.pickSeed ? people.pickSeed(L=>female?L.female:!L.female, salt) : salt, kk=people.kit(seed,{outfit}); const a=W.makeActor(kk.gl,{name, height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#d4af37', parent:npcG}); a.play('idle',0); a.mixer.update(0);
      const po=makePoser(THREE,a), hh=po.hipsHeight ? po.hipsHeight() : .95; a.g.position.set(x, (pose==='sit'||pose==='type') ? y+.06-hh : y, z); a.g.rotation.y=face; let head=null; a.root.traverse(o=>{ if(!head && o.isBone && /Head$/.test(o.name)) head=o; });
      let hm=null; if(hat){ hm=new THREE.Group(); const g1=new THREE.Mesh(hat==='top'?new THREE.CylinderGeometry(.13,.13,.24,16):new THREE.CylinderGeometry(.1,.11,.09,14), hat==='top'?hatM:M.red); g1.position.y=hat==='top'?.12:.045; hm.add(g1); const b1=new THREE.Mesh(hat==='top'?new THREE.CylinderGeometry(.2,.2,.015,18):new THREE.TorusGeometry(.105,.012,5,16), M.gold); if(hat!=='top') b1.rotation.x=Math.PI/2; b1.position.y=hat==='top'?.0:.07; hm.add(b1); if(hat==='top'){ const bd=new THREE.Mesh(new THREE.CylinderGeometry(.132,.132,.04,16),M.gold); bd.position.y=.03; hm.add(bd); } hm.userData.dynamic=true; npcG.add(hm); }
      const o={a,po,pose,x,y,z,head,hat:hm,h:kk.h}; NPC.push(o); if(pose!=='sit' && pose!=='type'){ o.c={x,z,r:.32,y0:y-.3,y1:y+1.9}; circles.push(o.c); } return o; }catch(e){ console.warn('[abyssal_hotel] npc', e); return null; } }
  function buildNPC(){ if(npcBuilt) return; npcBuilt=true;
    for(const s of [-1,1]){ npc(901+s, false, {shirt:0x8c1a24, pants:0x16130f, long:true}, '🎩 Doorman', CX+s*2.5, Y0, CZ+19.2, 0, 'stand', 'top'); npc(905+s, s>0, {shirt:0x8c1a24, pants:0x8c1a24, long:true}, '🧳 Bellboy', CX+s*4.3, Y0, CZ+21.6, s>0?-Math.PI/2:Math.PI/2, 'present', 'cap'); }
    { const p=XZ(24.3,180); npc(911, true, {shirt:0x1e4637, pants:0x16130f, long:true}, '🛎️ Lễ tân', p[0], Y0, p[1], yawOut(180)+Math.PI, 'stand'); }
    { const p=XZ(23.75,148); npc(913, false, {shirt:0x14284f, pants:0x16130f, long:true}, '🗝️ Concierge', p[0], Y0, p[1], yawOut(148)+Math.PI, 'phone'); }
    if(PIANO.seat){ const p=posOf(PIANO.seat); npc(917, true, {shirt:0x16130f, pants:0x16130f, long:true, dress:true}, '🎹 Nghệ sĩ Piano', p.x, Y0+.52, p.z, PIANO.yaw+Math.PI, 'type'); }
    BUTLER=npc(921, false, {shirt:0x16130f, pants:0x16130f, long:true}, '🤵 Quản gia', 0, -500, 0, 0, 'stand'); placeButler(); }
  function placeButler(){ if(!BUTLER) return; const on=!!RENT && curF===RENT.k; if(on){ const w=WINGS.find(q=>q.key===RENT.w), tD=RENT.type==='pent'?10.3+3:room(w,RENT.j).t0+8.6, p=XZ(18.6,tD); BUTLER.a.g.position.set(p[0],Yf(RENT.k),p[1]); BUTLER.a.g.rotation.y=yawOut(tD); if(BUTLER.c){ BUTLER.c.x=p[0]; BUTLER.c.z=p[1]; BUTLER.c.y0=Yf(RENT.k)-.3; BUTLER.c.y1=Yf(RENT.k)+1.9; } }
    else { BUTLER.a.g.position.y=-500; if(BUTLER.c){ BUTLER.c.y0=1e6; BUTLER.c.y1=-1e6; } } BUTLER.a.g.visible=on; if(BUTLER.a.label) BUTLER.a.label.alpha=on?1:0; }

  /* ============================== 17. ÂM THANH: Grand Piano nhẹ (WebAudio, qua kênh âm thanh môi trường – tôn trọng âm lượng / tắt tiếng) ============================== */
  const PNO={next:0, i:0}; const CH=[[261.6,329.6,392,493.9],[220,261.6,329.6,392],[174.6,220,261.6,329.6],[196,246.9,293.7,392]];
  function pianoTick(dist){ const amb=W.ambience, c=amb && amb.ctx, out=amb && amb.state && amb.state.master; if(!c || !out || c.state!=='running') return; if(amb.on===false) return;
    if(c.currentTime<PNO.next) return; const ch=CH[Math.floor(PNO.i/8)%4], step=PNO.i%8, f=ch[[0,1,2,3,2,1,2,3][step]]*(step===0?.5:1), g0=.055*(1-dist/18)*(PIANO.boost>0?1.4:1);
    const t=Math.max(c.currentTime,PNO.next)+.02, o=c.createOscillator(), o2=c.createOscillator(), g=c.createGain(), lp=c.createBiquadFilter(); o.type='triangle'; o2.type='sine'; o.frequency.value=f; o2.frequency.value=f*2.001; lp.type='lowpass'; lp.frequency.value=2200;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(g0,t+.012); g.gain.exponentialRampToValueAtTime(.0008,t+1.9); o.connect(g); o2.connect(g); g.connect(lp); lp.connect(out); o.start(t); o2.start(t); o.stop(t+2); o2.stop(t+2);
    PNO.i++; PNO.next=t+(step===7?.62:.36); }

  /* ============================== 18. GỘP + BẬT VA CHẠM TĨNH ============================== */
  M.glow.side=THREE.DoubleSide;
  S1.flush(shell,{cast:true, name:'aby-hotel-shell'}); S2.flush(mid,{dynamic:true, name:'aby-hotel-mid'}); SL.flush(lobby,{dynamic:true, name:'aby-hotel-lobby'});
  turnOn(plats, STATIC.plats); turnOn(SEGS, STATIC.segs); turnOn(circles, STATIC.circ);
  const LBL=[]; /* nhãn trong nhà chỉ hiện đúng tầng (W.labels) */ try{ for(const L of (W.labels||[])) if(!L.follow && Math.hypot(L.x-CX,L.z-CZ)<39 && L.y>Y0 && L.y<TOPY+20 && !/Royal Lotus-Crescent|Cổng Master|trực thăng|Sảnh chính|Cầu dẫn/i.test(L.el.textContent||'')) LBL.push(L); }catch(e){}
  PLACES.push({icon:'🏨', name:'Khách sạn The Royal Lotus-Crescent Palace', sub:'Đảo trung tâm vịnh Abyssal · porte-cochère, sảnh 28 m, thuê phòng', go:()=>teleport(CX, CZ+30.5, CX, CZ)},
    {icon:'🏊', name:'Royal Lotus · Sky Pool tầng 20', sub:'Hồ bơi vô cực đáy kính vươn ra vịnh', go:goPool}, {icon:'🛏️', name:'Royal Lotus · Về phòng đã thuê', sub:'Cần thuê phòng trước ở lễ tân', go:goRoom});

  /* ============================== 19. MỖI KHUNG HÌNH ============================== */
  let curF=-1, camSaved=null, tt=0, lastN=-1; const D2=(a,b)=>Math.hypot(a,b);
  function refreshFloor(force){ const f=curF; for(const [key,g] of IG) g.visible=false;
    if(f>=2){ if([2,3,4,5,24].includes(f)){ const g=getGroup('amen'+f, gg=>{ gg.userData.coll=buildAmen(f,gg); }); g.visible=true; amenInter(); if(f===4 && !BIL.balls) makeBalls(); }
      if(isRoomFloor(f)){ const ws=WINGS.filter(w=>!isPent(w,f)), type=typeOf(ws[0],f), g=getGroup((ws.length>1?'EW':'W')+type, gg=>buildRooms(ws,type,gg)); g.position.y=Yf(f); g.visible=true; setDoors(g, RENT && RENT.k===f && RENT.type!=='pent' ? RENT : null); if(ws.length<2) getGroup('pent'+f, gg=>buildPent(f,gg)).visible=true; } }
    for(const o of NPC) if(o!==BUTLER && o.a.label) o.a.label.alpha=f<=1?1:0; placeButler(); for(const L of LBL) L.alpha=(Math.abs(L.y-(f<1?Y0:Yf(f)))<5.5)?1:0; }
  function makeBalls(){ if(!BIL.m) return; const R=.031, cols=[0xe9e2d0,0xf2c230,0xc8231c]; BIL.balls=cols.map((c,i)=>{ const m=new THREE.Mesh(new THREE.SphereGeometry(R,14,10), new THREE.MeshStandardMaterial({color:c, roughness:.15})); m.userData.dynamic=true; const g=IG.get('amen4'); (g||root).add(m); m.userData.lx=-.5+i*.35; m.userData.lz=(i-1)*.18; return {m, x:-.5+i*.35, z:(i-1)*.18, vx:0, vz:0}; }); placeBalls(); }
  function placeBalls(){ for(const b of BIL.balls){ const p=new THREE.Vector3(b.x,.86,b.z).applyMatrix4(BIL.m); b.m.position.copy(p); } }
  HOOK.onFrame.push((dt)=>{ dt=Math.min(dt||1/60,.1); tt+=dt; const dx=P.x-CX, dz=P.z-CZ, dH=D2(dx,dz), far=dH>520;
    mid.visible=dH<460; lobby.visible=dH<62 && P.y<Y0+31; if(far){ if(WIN.length || WINS.length) setWindow([],0); curF=-1; return; }
    /* tầng hiện tại + cửa sổ va chạm ±1 tầng */
    let f=0; if(dH<39 && P.y>Y0-1.6 && P.y<TOPY+60) f=clamp(Math.round((P.y-Y0)/FH)+1,1,25);   /* 17/11 (phiên A, Bình báo rơi từ mái): nhảy / đứng trên vật trang trí / trực thăng cao hơn mái > 8 m không còn tắt hết sàn → không rơi xuyên xuống tầng trệt */
    if(FORCE>0){ FORCE-=dt; } else { const ks=f?[f-1,f,f+1].filter(k=>k>=2 && k<=25):[]; if(ks.join()!==WIN.join() || (WINS[0]||0)!==(f>=2?f:0)) setWindow(ks,f); }
    if(f!==curF){ curF=f; refreshFloor(); }
    /* camera: trong phòng/hành lang các cánh → không vượt trần, lùi gần nhân vật */
    const th=((Math.atan2(dz,dx)/D)%360+360)%360, inWing=(th>=300||th<=60||(th>=120&&th<=240)), inside=f>=1 && f<=24 && ((inWing && dH>17.4 && dH<(f===1?29.6:34)) || (f>=2 && dH<=17.6));
    if(inside && !(f===1 && dH<17.6)){ HOOK.camBox={x0:-1e6, x1:1e6, z0:-1e6, z1:1e6, y1:Yf(f)+(f===1?FH-.7:FH-.75), _hot:true}; if(camSaved==null){ camSaved=cam.dist; cam.dist=Math.min(cam.dist,3.6); } }
    else { if(HOOK.camBox && HOOK.camBox._hot) HOOK.camBox=null; if(camSaved!=null){ cam.dist=Math.max(cam.dist,camSaved); camSaved=null; } }
    /* đêm: vách phòng + đèn trần ấm hơn */ const n=W.night||0; if(Math.abs(n-lastN)>.01){ lastN=n; M.roomGlow.emissiveIntensity=.5+.95*n; M.glow.emissiveIntensity=.9+.9*n; M.glowSoft.emissiveIntensity=.6+.9*n; }
    if(M.water.normalMap) M.water.normalMap.offset.set(tt*.02,tt*.015);
    if(GATE.mesh) M.portal.opacity=.35+.2*Math.sin(tt*2.2);
    if(lobby.visible && dH<70){ /* đài phun nhạc nước + thang cuốn */ if(FT.show>0) FT.show-=dt; const beat=Math.max(0,Math.sin(tt*3.1)), sh=FT.show>0;
      if(FT.jets){ for(let i=0;i<18;i++){ const J=JETS[i], h=sh ? .6+2.4*Math.max(0,Math.sin(tt*2.4+i*.7)) : .9+1.4*Math.abs(Math.sin(tt*1.3+(i%3)*2.1))*(.6+.4*beat); _m4.compose(_v.set(J.x,Y0+.44,J.z), _q.identity(), _s.set(1,h,1)); FT.jets.setMatrixAt(i,_m4); } FT.jets.instanceMatrix.needsUpdate=true; }
      if(FT.c){ _m4.compose(_v.set(FT.x,Y0+4.05,FT.z), _q.identity(), _s.set(1.4,1.2+1.6*beat,1.4)); FT.c.setMatrixAt(0,_m4); FT.c.instanceMatrix.needsUpdate=true; }
      for(const E of ESC){ E.ph=(E.ph+dt*.5*E.dir/(Math.abs(E.u1-E.u0)/E.n)+E.n)%E.n; for(let i=0;i<E.n;i++){ const t=((i+E.ph)%E.n)/E.n, u=E.u0+(E.u1-E.u0)*t, y=Y0+(Yf(2)-Y0)*t; _m4.compose(_v.set(CX+u,y+.02,CZ+E.vz), _q.identity(), _s.set(1,1,1)); E.im.setMatrixAt(i,_m4); } E.im.instanceMatrix.needsUpdate=true; }
      /* đứng trên thang cuốn → được chở đi (trong: lên, ngoài: xuống) */ if(!HOOK.vehicle && P.y>Y0-.05 && P.y<Yf(2)+.05){ const u=P.x-CX, v=P.z-CZ, au=Math.abs(u); if(au>8.84 && au<17.5 && v>2.7 && v<5.3){ const s=Math.sign(u), up=v<4; P.x+=s*(up?.6:-.6)*dt; } } }
    /* bida tầng 4 */ if(BIL.t>0 && BIL.balls){ BIL.t-=dt; const hx=1.31-.031, hz=.61-.031, h=Math.min(dt,1/30); for(const b of BIL.balls){ b.x+=b.vx*h; b.z+=b.vz*h; if(Math.abs(b.x)>hx){ b.x=Math.sign(b.x)*hx; b.vx*=-.88; } if(Math.abs(b.z)>hz){ b.z=Math.sign(b.z)*hz; b.vz*=-.88; } const sp=Math.hypot(b.vx,b.vz); if(sp>0){ const k=Math.max(0,sp-.55*h)/sp; b.vx*=k; b.vz*=k; } }
      for(let i=0;i<3;i++) for(let j=i+1;j<3;j++){ const A=BIL.balls[i], B=BIL.balls[j], ex=B.x-A.x, ez=B.z-A.z, dd=Math.hypot(ex,ez); if(dd>0 && dd<.062){ const nx=ex/dd, nz=ez/dd, rv=(A.vx-B.vx)*nx+(A.vz-B.vz)*nz; if(rv>0){ A.vx-=rv*nx; A.vz-=rv*nz; B.vx+=rv*nx; B.vz+=rv*nz; } } } placeBalls(); }
    /* nhân viên */ if(dH<85) buildNPC(); if(NPC.length){ const low=dH<70 && P.y<Y0+31; for(const o of NPC){ if(o!==BUTLER){ o.a.g.visible=low; if(o.hat) o.hat.visible=low; } } }
    if(NPC.length && dH<70){ for(const o of NPC){ if(!o.a.g.visible) continue; o.a.mixer.update(dt); try{ if(o.pose==='present') o.po.apply(D2(P.x-o.x,P.z-o.z)<7?'present':'nod',tt); else if(o.pose==='type') o.po.apply('type',tt); else if(o.pose==='phone') o.po.apply('phone',tt); else if(o.pose==='stand' && o.hat && D2(P.x-o.x,P.z-o.z)<6) o.po.apply('nod',tt*.4); }catch(e){}
        if(o.hat && o.head){ o.head.getWorldPosition(_v); o.hat.position.set(_v.x,_v.y+.16,_v.z); o.hat.rotation.y=o.a.g.rotation.y; } } }
    if(!RI.greet && D2(P.x-CX,P.z-(CZ+21))<5 && Math.abs(P.y-Y0)<1){ RI.greet=true; toast('🎩 "Chào mừng quý khách tới The Royal Lotus-Crescent Palace!" – lễ tân ở bên trái sảnh.',3800); }
    /* piano */ if(PIANO.boost>0) PIANO.boost-=dt; if(f===1 && D2(P.x-PIANO.x,P.z-PIANO.z)<18) pianoTick(D2(P.x-PIANO.x,P.z-PIANO.z));
    /* bay trực thăng ngắm vịnh */ if(FLY.t>0){ FLY.t-=dt; const a=(12-FLY.t)/12*TAU*.9; HOOK.camOverride={pos:new THREE.Vector3(CX+Math.cos(a)*150, 150+20*Math.sin(a*1.5), CZ+Math.sin(a)*150), look:new THREE.Vector3(CX,60,CZ), k:2}; if(FLY.t<=0){ HOOK.camOverride=null; toast('🚁 Đã hạ cánh xuống mái khách sạn.',2400); } }
  });

  const out={ floor:()=>curF, Yf, rent:(type='deluxe')=>doRent(pickRoom(type)), goRoom, goPool, goFloor, get RENT(){ return RENT; },
    info:()=>({center:[CX,CZ], y0:Y0, top:TOPY, floors:24, heightAbovePlaza:+(TOPY-GY).toFixed(1), topY:+(TOPY+3.7).toFixed(1), core:CORE, bridge:'A', dropoff:DROP, gateBy:A_GATE?'A':'C', joint:JOINT, lifts:LIFTS.length, win:WIN.slice(), wins:WINS.slice(), staticSegs:STATIC.segs.length, staticPlats:STATIC.plats.length}),
    drawInfo:()=>{ let n=0, tri=0; root.traverse(o=>{ if((o.isMesh||o.isInstancedMesh) && o.visible){ let vis=true; for(let p=o;p;p=p.parent) if(!p.visible){ vis=false; break; } if(vis){ n++; const g=o.geometry; tri+=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1); } } }); return {draws:n, tris:Math.round(tri)}; } };
  W.abyHotel=out; return out;
}
