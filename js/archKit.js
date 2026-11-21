// QC World V2 – PHA 1: archKit.js · BỘ MÁY KIẾN TRÚC CHỐNG THÔ
// (Theo QC_WORLD_V2_MASTER_BIBLE_AND_CODE_SPECS.md – Module 1)
//  • Vật liệu PBR thủ tục: mỗi vật liệu sinh đồng thời map (màu) + roughnessMap (kính bóng / tường nhám) + bumpMap (gờ khung, mạch gạch)
//      makePBRFacade · makeStoneMaterial · makeWoodMaterial · facadeUV (UV theo kích thước thật, căn mép trên = ranh giới tầng)
//  • Hình khối bo cạnh: roundedBox (thay RoundedBoxGeometry của three/addons – repo chưa có file addon này) + ExtrudeGeometry có bevel
//  • buildCurvedTerraceWing: khối nhà cánh cung giật cấp bám vách núi (sàn bo viền đá, lan can kính cong, cây rủ ban công, LED viền sàn,
//      sàn đứng được + lan can va chạm theo từng tầng)
//  • buildAsianCurvedRoof: mái đao cong vút 4 góc (Δy = k·(|x|/(w/2))²·(|z|/(d/2))²), sống mái, đầu đao, đèn lồng đỏ 4 góc, nhiều tầng mái
//  • buildBilliardTable: bàn bida chi tiết + đèn chụp 3 chao + va chạm + E "Đánh một cơ" có bi chạy, va băng thật
//  • Bộ InstancedMesh cấu kiện lặp: khung cửa sổ chữ H, lan can kính kẹp inox, bồn cây rủ ban công, đèn lồng
// Dùng: import * as AK from './archKit.js'; AK.bindNight(W); const m=AK.makePBRFacade({...}); …
import * as THREE from 'three';

/* ============================== tiện ích ============================== */
export function rng(seed=1){ let s=(seed>>>0)||1; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const canvas=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return [c, c.getContext('2d')]; };
const tex=(c, srgb=true)=>{ const t=new THREE.CanvasTexture(c); if(srgb) t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=8; return t; };
const NIGHT=new Set();   // vật liệu có đèn ban đêm: {m, base, k}
export function bindNight(W){ if(W.__akNight) return; W.__akNight=true; let last=-1;
  W.HOOK.onFrame.push(()=>{ const n=W.night||0; if(Math.abs(n-last)<.004) return; last=n; for(const o of NIGHT) o.m.emissiveIntensity=o.base+n*o.k; }); }
const nightMat=(m, base=.03, k=1.15)=>{ NIGHT.add({m, base, k}); m.emissiveIntensity=base; return m; };

/* ============================== hình khối bo cạnh ============================== */
// Hộp bo tròn: chia lưới hộp rồi đẩy đỉnh ra theo hình cầu bán kính r quanh "hộp lõi" (cùng ý tưởng RoundedBoxGeometry)
const RB=new Map();
export function roundedBox(w, h, d, r=.05, seg=3){ r=Math.min(r, w/2-.001, h/2-.001, d/2-.001); const key=`${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}|${r.toFixed(3)}|${seg}`;
  if(RB.has(key)) return RB.get(key);
  const n=seg*2+1, g=new THREE.BoxGeometry(1,1,1,n,n,n), p=g.attributes.position, nr=g.attributes.normal, hw=w/2-r, hh=h/2-r, hd=d/2-r, v=new THREE.Vector3(), c=new THREE.Vector3(), o=new THREE.Vector3();
  // lưới đơn vị n = 2·seg+1 ô: seg ô ngoài cùng mỗi phía trải theo dải bo r, ô giữa là phần phẳng → đẩy về cung tròn quanh hộp lõi
  const map=(t,inner)=>{ const k=Math.round((t+.5)*n); return k<=seg ? -(inner + r*(1-k/seg)) : inner + r*((k-seg-1)/seg); };
  for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); const x=map(v.x,hw), y=map(v.y,hh), z=map(v.z,hd);
    c.set(Math.max(-hw,Math.min(hw,x)), Math.max(-hh,Math.min(hh,y)), Math.max(-hd,Math.min(hd,z))); o.set(x-c.x, y-c.y, z-c.z);
    if(o.lengthSq()<1e-12) o.fromBufferAttribute(nr,i); o.normalize(); p.setXYZ(i, c.x+o.x*r, c.y+o.y*r, c.z+o.z*r); nr.setXYZ(i, o.x, o.y, o.z); }
  g.computeBoundingSphere(); RB.set(key,g); return g; }
// mặt cắt hình vành khăn cung (dùng cho sàn cánh cung): ExtrudeGeometry có bevel
export function arcSlab(r0, r1, a0, a1, thick=.3, bevel=.08, seg=40){ const s=new THREE.Shape(); const N=Math.max(8,Math.round(seg*(a1-a0)/Math.PI));
  for(let i=0;i<=N;i++){ const a=a0+(a1-a0)*i/N; const x=Math.cos(a)*r1, y=Math.sin(a)*r1; i?s.lineTo(x,y):s.moveTo(x,y); }
  for(let i=N;i>=0;i--){ const a=a0+(a1-a0)*i/N; s.lineTo(Math.cos(a)*r0, Math.sin(a)*r0); } s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.01,thick-2*bevel), bevelEnabled:true, bevelThickness:bevel, bevelSize:bevel*.8, bevelSegments:3, curveSegments:40});
  g.rotateX(Math.PI/2); g.translate(0,thick-bevel,0); return g; }   // trục: x = cos a, z = sin a, mặt trên ở y = thick

/* ============================== VẬT LIỆU PBR THỦ TỤC ============================== */
// Mặt tiền: 1 ô texture = cols gian × rows tầng. diffuse + roughness + bump + emissive (đèn ban đêm ngẫu nhiên từng cửa)
export function makePBRFacade(o={}){ const {cols=4, rows=4, frameCol='#d9d4ca', glassCol='#2e4a63', litCol='#ffd08a', litProb=.45, balcony=false, mullionW=8, seed=1, wall='#e6e1d8'}=o;
  const S=512, cw=S/cols, rh=S/rows, R=rng(seed), [cd,d]=canvas(S,S), [cr,r]=canvas(S,S), [cb,b]=canvas(S,S), [ce,e]=canvas(S,S);
  d.fillStyle=wall; d.fillRect(0,0,S,S); r.fillStyle='#d8d8d8'; r.fillRect(0,0,S,S); b.fillStyle='#9a9a9a'; b.fillRect(0,0,S,S); e.fillStyle='#000'; e.fillRect(0,0,S,S);
  for(let i=0;i<2600;i++){ const x=R()*S, y=R()*S, k=R(); d.fillStyle=`rgba(0,0,0,${k*.05})`; d.fillRect(x,y,2,2); b.fillStyle=`rgba(255,255,255,${k*.1})`; b.fillRect(x,y,2,2); }
  for(let ry=0; ry<rows; ry++) for(let cx=0; cx<cols; cx++){ const x0=cx*cw, y0=ry*rh, px=cw*.12, py=rh*.16, gx=x0+px, gy=y0+py, gw=cw-2*px, gh=rh-py-rh*.18;
    // gờ tầng (nổi) + khung cửa
    d.fillStyle=frameCol; d.fillRect(x0, y0+rh-rh*.1, cw, rh*.1); b.fillStyle='#ffffff'; b.fillRect(x0, y0+rh-rh*.1, cw, rh*.1); r.fillStyle='#c8c8c8'; r.fillRect(x0, y0+rh-rh*.1, cw, rh*.1);
    d.fillStyle=frameCol; d.fillRect(gx-4,gy-4,gw+8,gh+8); b.fillStyle='#f2f2f2'; b.fillRect(gx-4,gy-4,gw+8,gh+8);
    // kính: phản chiếu trời (gradient) + rèm mờ phía trong
    const gr=d.createLinearGradient(gx,gy,gx+gw*.6,gy+gh); gr.addColorStop(0, '#9cc3e0'); gr.addColorStop(.35, glassCol); gr.addColorStop(1, '#1b2a38'); d.fillStyle=gr; d.fillRect(gx,gy,gw,gh);
    if(R()<.55){ d.fillStyle=`rgba(235,226,205,${.25+R()*.3})`; d.fillRect(gx, gy, gw*(.25+R()*.5), gh); }
    r.fillStyle='#121212'; r.fillRect(gx,gy,gw,gh); b.fillStyle='#1a1a1a'; b.fillRect(gx,gy,gw,gh);
    // đố kính (mullion) chữ thập
    d.fillStyle=frameCol; d.fillRect(gx+gw/2-mullionW/2, gy, mullionW, gh); d.fillRect(gx, gy+gh*.62, gw, mullionW*.7); b.fillStyle='#e8e8e8'; b.fillRect(gx+gw/2-mullionW/2, gy, mullionW, gh);
    if(balcony){ d.fillStyle='rgba(200,215,225,.55)'; d.fillRect(gx-6, gy+gh*.7, gw+12, gh*.3); d.fillStyle='#8b949c'; d.fillRect(gx-6, gy+gh*.7, gw+12, 4); b.fillStyle='#ffffff'; b.fillRect(gx-6, gy+gh*.7, gw+12, 4); }
    // đèn ban đêm: cửa sáng ngẫu nhiên, độ sáng khác nhau, rèm che 1 phần
    if(R()<litProb){ const k=.45+R()*.55; e.fillStyle=R()<.8?litCol:'#d6ecff'; e.globalAlpha=k; e.fillRect(gx+2,gy+2,gw-4,gh-4); e.globalAlpha=1; if(R()<.4){ e.fillStyle='rgba(0,0,0,.55)'; e.fillRect(gx+2,gy+2,(gw-4)*R()*.6,gh-4); } } }
  const m=new THREE.MeshStandardMaterial({map:tex(cd), roughnessMap:tex(cr,false), bumpMap:tex(cb,false), bumpScale:.22, emissive:0xffffff, emissiveMap:tex(ce), metalness:.35, roughness:1, envMapIntensity:1.5});
  m.userData.tile={w:o.tileW||cols*3, h:o.tileH||rows*3.2}; return nightMat(m, .03, 1.1); }
// UV theo kích thước thật: 1 ô texture = tile.w × tile.h mét; mép trên mặt tiền = ranh giới tầng
export function facadeUV(geo, w, h, mat, alignTop=true, offU=0, offV=0){ const t=(mat && mat.userData.tile)||{w:12,h:12.8}, uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++){ uv.setX(i, uv.getX(i)*w/t.w+offU); uv.setY(i, (alignTop ? (uv.getY(i)-1)*h/t.h : uv.getY(i)*h/t.h)+offV); } uv.needsUpdate=true; return geo; }
// Đá: khối đá xếp so le, mạch vữa lõm (bump), mặt đá nhám
export function makeStoneMaterial(o={}){ const {col='#cfc6b6', joint='#8f877a', blockW=96, blockH=48, seed=3, rough=.85, repeat=1}=o, S=512, R=rng(seed), [cd,d]=canvas(S,S), [cr,r]=canvas(S,S), [cb,b]=canvas(S,S);
  d.fillStyle=joint; d.fillRect(0,0,S,S); r.fillStyle='#f0f0f0'; r.fillRect(0,0,S,S); b.fillStyle='#202020'; b.fillRect(0,0,S,S);
  const base=new THREE.Color(col);
  for(let y=0,row=0;y<S;y+=blockH,row++) for(let x=-(row%2)*blockW/2;x<S;x+=blockW){ const c=base.clone().offsetHSL(0,(R()-.5)*.04,(R()-.5)*.08); d.fillStyle='#'+c.getHexString(); d.fillRect(x+2,y+2,blockW-4,blockH-4);
    r.fillStyle=`rgb(${(rough*255-R()*30)|0},0,0)`.replace(/rgb\((\d+),0,0\)/,(m,v)=>`rgb(${v},${v},${v})`); r.fillRect(x+2,y+2,blockW-4,blockH-4); b.fillStyle=`rgb(${190+R()*50|0},${190+R()*50|0},${190+R()*50|0})`; b.fillRect(x+2,y+2,blockW-4,blockH-4);
    for(let k=0;k<26;k++){ d.fillStyle=`rgba(0,0,0,${R()*.08})`; d.fillRect(x+R()*blockW,y+R()*blockH,3,2); } }
  const mk=(c,s)=>{ const t=tex(c,s); t.repeat.set(repeat,repeat); return t; };
  return new THREE.MeshStandardMaterial({map:mk(cd,true), roughnessMap:mk(cr,false), bumpMap:mk(cb,false), bumpScale:.35, roughness:1, metalness:0}); }
// Gỗ: ván dài có vân, khe ván lõm, bóng nhẹ theo vân
export function makeWoodMaterial(o={}){ const {col='#7a4a28', plank=40, seed=5, rough=.55, repeat=1}=o, S=512, R=rng(seed), [cd,d]=canvas(S,S), [cr,r]=canvas(S,S), [cb,b]=canvas(S,S), base=new THREE.Color(col);
  for(let y=0;y<S;y+=plank){ const c=base.clone().offsetHSL(0,(R()-.5)*.05,(R()-.5)*.09); d.fillStyle='#'+c.getHexString(); d.fillRect(0,y,S,plank-2); r.fillStyle=`rgb(${rough*255|0},${rough*255|0},${rough*255|0})`; r.fillRect(0,y,S,plank-2); b.fillStyle='#bdbdbd'; b.fillRect(0,y,S,plank-2);
    for(let k=0;k<60;k++){ const yy=y+R()*(plank-3); d.strokeStyle=`rgba(40,20,8,${.05+R()*.12})`; d.lineWidth=1+R(); d.beginPath(); d.moveTo(0,yy); d.bezierCurveTo(S*.3,yy+(R()-.5)*6,S*.6,yy+(R()-.5)*6,S,yy+(R()-.5)*4); d.stroke(); }
    let x=-R()*200; while(x<S){ x+=150+R()*220; d.fillStyle='rgba(20,10,4,.7)'; d.fillRect(x,y,2,plank-2); b.fillStyle='#303030'; b.fillRect(x,y,2,plank-2); }
    d.fillStyle='rgba(15,8,3,.85)'; d.fillRect(0,y+plank-2,S,2); b.fillStyle='#101010'; b.fillRect(0,y+plank-2,S,2); }
  const mk=(c,s)=>{ const t=tex(c,s); t.repeat.set(repeat,repeat); return t; };
  return new THREE.MeshStandardMaterial({map:mk(cd,true), roughnessMap:mk(cr,false), bumpMap:mk(cb,false), bumpScale:.15, roughness:1, metalness:0}); }

/* ============================== BỘ INSTANCEDMESH CẤU KIỆN LẶP ============================== */
// add(x,y,z, ry=0, s=1) · build(parent) → 1 lượt vẽ cho cả nghìn cấu kiện
function instancer(geo, mat, {shadow=true}={}){ const L=[]; const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _p=new THREE.Vector3(), _s=new THREE.Vector3();
  return { list:L, add(x,y,z,ry=0,s=1,sy){ L.push([x,y,z,ry,s,sy??s]); return this; },
    build(parent){ if(!L.length) return null; const im=new THREE.InstancedMesh(geo, mat, L.length); L.forEach(([x,y,z,ry,s,sy],i)=>{ _e.set(0,ry,0); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s.set(s,sy,s)); im.setMatrixAt(i,_m); });
      im.castShadow=shadow; im.receiveShadow=true; im.computeBoundingSphere(); im.userData.dynamic=true; parent.add(im); return im; } }; }
const merge=(parts)=>{ const gs=parts.map(g=>g.index?g.toNonIndexed():g); for(const g of gs){ if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); } return mergeGeos(gs); };
function mergeGeos(gs){ let n=0; for(const g of gs) n+=g.attributes.position.count; const P=new Float32Array(n*3), N=new Float32Array(n*3), U=new Float32Array(n*2); let o=0;
  for(const g of gs){ P.set(g.attributes.position.array,o*3); N.set(g.attributes.normal.array,o*3); U.set(g.attributes.uv.array,o*2); o+=g.attributes.position.count; }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('normal',new THREE.BufferAttribute(N,3)); g.setAttribute('uv',new THREE.BufferAttribute(U,2)); g.computeBoundingSphere(); return g; }
const at=(g,x,y,z,rx=0,ry=0,rz=0)=>{ g.rotateX(rx); g.rotateY(ry); g.rotateZ(rz); g.translate(x,y,z); return g; };
const MATS={};
const mat=(k,f)=>MATS[k]||(MATS[k]=f());
// khung cửa sổ chữ H (2 thanh đứng + 1 thanh ngang giữa) – rộng 1,4 m cao 1,8 m
export function windowFrames(col=0x3a3f46){ const g=merge([at(roundedBox(.08,1.8,.12,.02,1),-.66,.9,0), at(roundedBox(.08,1.8,.12,.02,1),.66,.9,0), at(roundedBox(1.4,.08,.12,.02,1),0,.95,0), at(roundedBox(1.5,.1,.18,.03,1),0,.02,.03)]);
  return instancer(g, mat('wf'+col,()=>new THREE.MeshStandardMaterial({color:col, roughness:.35, metalness:.75}))); }
// lan can kính kẹp inox: 1 tấm 1,2 m (kính + 2 kẹp + tay vịn)
export function glassRails(){ const glass=instancer(new THREE.BoxGeometry(1.18,1.0,.03), mat('gr',()=>new THREE.MeshPhysicalMaterial({color:0xcfe8f5, roughness:.04, metalness:0, transmission:.0, transparent:true, opacity:.32, depthWrite:false, side:THREE.DoubleSide})),{shadow:false});
  const steel=instancer(merge([at(roundedBox(1.22,.06,.07,.025,1),0,1.03,0), at(new THREE.CylinderGeometry(.03,.03,.14,10),-.45,.15,0), at(new THREE.CylinderGeometry(.03,.03,.14,10),.45,.15,0), at(new THREE.CylinderGeometry(.03,.03,.14,10),-.45,.85,0), at(new THREE.CylinderGeometry(.03,.03,.14,10),.45,.85,0)]), mat('st',()=>new THREE.MeshStandardMaterial({color:0xd5dbe2, roughness:.18, metalness:1})));
  return { add(x,y,z,ry=0){ glass.add(x,y+.5,z,ry); steel.add(x,y,z,ry); return this; }, build(p){ steel.build(p); glass.build(p); } }; }
// bồn cây rủ ban công: bồn bo góc + cụm lá + dây lá rủ
export function hangingPlanters(){ const pot=instancer(roundedBox(1.0,.32,.38,.06,2), mat('pot',()=>new THREE.MeshStandardMaterial({color:0x4a4f57, roughness:.6, metalness:.2})));
  const leafG=merge([at(new THREE.IcosahedronGeometry(.32,1),-.25,.3,0), at(new THREE.IcosahedronGeometry(.3,1),.22,.32,.02), at(new THREE.IcosahedronGeometry(.22,1),0,.42,-.05), at(new THREE.ConeGeometry(.12,.9,6),-.32,-.25,.12,Math.PI), at(new THREE.ConeGeometry(.1,.7,6),.1,-.18,.15,Math.PI), at(new THREE.ConeGeometry(.11,.8,6),.36,-.22,.12,Math.PI)]);
  const leaf=instancer(leafG, mat('leaf',()=>new THREE.MeshStandardMaterial({color:0x3f8f3a, roughness:.85})));
  return { add(x,y,z,ry=0){ pot.add(x,y+.16,z,ry); leaf.add(x,y+.16,z,ry); return this; }, build(p){ pot.build(p); leaf.build(p); } }; }
// đèn lồng đỏ (thân + 2 nắp vàng + tua)
export function lanterns(){ const body=new THREE.SphereGeometry(.26,12,9); body.scale(1,1.25,1);
  const lm=mat('lan',()=>nightMat(new THREE.MeshStandardMaterial({color:0xd8261c, emissive:0xff3a12, roughness:.5}), .35, 2.4));
  const b=instancer(body, lm, {shadow:false}), cap=instancer(merge([at(new THREE.CylinderGeometry(.13,.13,.07,10),0,.34,0), at(new THREE.CylinderGeometry(.13,.13,.07,10),0,-.34,0), at(new THREE.CylinderGeometry(.015,.015,.3,4),0,-.52,0)]), mat('cap',()=>new THREE.MeshStandardMaterial({color:0xd9a640, roughness:.35, metalness:.8})),{shadow:false});
  return { add(x,y,z){ b.add(x,y,z); cap.add(x,y,z); return this; }, build(p){ b.build(p); cap.build(p); } }; }

/* ============================== KHỐI NHÀ CÁNH CUNG GIẬT CẤP BÁM VÁCH ============================== */
// cfg: {cx,cz, rIn (bán kính mặt tường sát núi), depth (sâu sàn), a0,a1 (rad, x=cos a, z=sin a), floors, floorH, baseY, setback (m lùi mỗi tầng: >0 lùi về vách),
//       facing: 'in' (ban công hướng vào tâm – kiểu khách sạn lòng mỏ đá quanh hồ) | 'out', led (màu LED), facade, parent, colliders=true, name}
export function buildCurvedTerraceWing(W, cfg){ const {THREE:T=THREE}=W||{}; const c={cx:0, cz:0, rIn:40, depth:7, a0:0, a1:Math.PI/2, floors:6, floorH:3.6, baseY:0, setback:.6, led:0x10b981, facing:'in', ...cfg}, dir=c.facing==='in'?-1:1;
  const g=new THREE.Group(); g.name=c.name||'terraceWing'; (c.parent||W.scene).add(g); g.position.set(c.cx,0,c.cz);
  const slabM=mat('slab',()=>makeStoneMaterial({col:'#e9e4da', joint:'#cfc8bb', blockW:128, blockH:128, rough:.75})), edgeM=mat('edge',()=>new THREE.MeshStandardMaterial({color:0xf4f1ea, roughness:.5}));
  const ledM=mat('led'+c.led,()=>nightMat(new THREE.MeshStandardMaterial({color:c.led, emissive:c.led, roughness:.4}), .5, 2.2));
  const fac=c.facade || makePBRFacade({cols:4, rows:2, balcony:true, seed:c.seed||7, tileW:12, tileH:c.floorH*2});
  const plants=hangingPlanters(), floorsOut=[];
  for(let f=0; f<c.floors; f++){ const y=c.baseY+f*c.floorH, sb=f*c.setback, rWall=c.rIn-dir*sb, rOut=rWall+dir*c.depth, span=c.a1-c.a0, lo=Math.min(rWall,rOut), hi=Math.max(rWall,rOut), rRail=rOut-dir*.12;
    // sàn bê tông viền đá trắng bo tròn
    const slab=new THREE.Mesh(arcSlab(lo-(dir>0?.2:0), hi+(dir<0?.2:0), c.a0, c.a1, .32, .1), slabM); slab.position.y=y-.32; slab.receiveShadow=slab.castShadow=true; g.add(slab);
    const lip=new THREE.Mesh(arcSlab(Math.min(rOut-dir*.25,rOut+dir*.05), Math.max(rOut-dir*.25,rOut+dir*.05), c.a0, c.a1, .42, .08), edgeM); lip.position.y=y-.36; g.add(lip);
    // mặt tường tầng (cong, mặt tiền PBR) – giữa sàn này và sàn trên
    const wallG=new THREE.CylinderGeometry(rWall, rWall, c.floorH-.32, Math.max(12,Math.round(span*24)), 1, true, Math.PI/2-c.a1, span); if(dir<0) flipNormals(wallG);   // mặt tường quay vào tâm
    facadeUV(wallG, rWall*span, c.floorH-.32, fac, true, (f*.37)%1, f*.5); /* mỗi tầng lấy 1 hàng/1 đoạn texture khác → đèn cửa không lặp */ const wall=new THREE.Mesh(wallG, fac); wall.position.y=y+(c.floorH-.32)/2; g.add(wall);
    // lan can kính cong (trụ rỗng cắt theo cung) + tay vịn + LED viền sàn
    const railG=new THREE.CylinderGeometry(rRail, rRail, 1.0, Math.max(16,Math.round(span*32)), 1, true, Math.PI/2-c.a1, span);
    const rail=new THREE.Mesh(railG, mat('rg',()=>new THREE.MeshPhysicalMaterial({color:0xcfe8f5, roughness:.04, transparent:true, opacity:.3, depthWrite:false, side:THREE.DoubleSide}))); rail.position.y=y+.5; g.add(rail);
    const top=[], led=[]; for(let i=0;i<=48;i++){ const a=c.a0+span*i/48; top.push(new THREE.Vector3(Math.cos(a)*rRail, y+1.02, Math.sin(a)*rRail)); led.push(new THREE.Vector3(Math.cos(a)*(rOut+dir*.06), y-.18, Math.sin(a)*(rOut+dir*.06))); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(top),64,.035,6,false), mat('steel',()=>new THREE.MeshStandardMaterial({color:0xd5dbe2, roughness:.2, metalness:1}))));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(led),64,.04,5,false), ledM));
    // cây rủ dọc mép ban công
    for(let a=c.a0+.02; a<c.a1; a+=1.6/rOut){ const rp=rOut-dir*.45; plants.add(Math.cos(a)*rp, y, Math.sin(a)*rp, Math.PI/2-a); }
    // sàn đứng được (ghép các tấm chữ nhật theo cung) + lan can va chạm đúng tầng
    if(W && c.colliders!==false){ const seg=Math.max(4, Math.round(span*rOut/2.2));
      for(let i=0;i<seg;i++){ const a=c.a0+span*(i+.5)/seg, rm=(rWall+rOut)/2, len=span*hi/seg; W.addPlat && W.addPlat(c.cx+Math.cos(a)*rm, c.cz+Math.sin(a)*rm, Math.atan2(Math.cos(a),Math.sin(a)), len/2+.05, (hi-lo)/2, y); }
      if(W.addSeg) for(let i=0;i<48;i++){ const a=c.a0+span*i/48, b=c.a0+span*(i+1)/48, r=rRail; W.addSeg(c.cx+Math.cos(a)*r, c.cz+Math.sin(a)*r, c.cx+Math.cos(b)*r, c.cz+Math.sin(b)*r, .14, y-.4, y+1.5); } }
    floorsOut.push({f, y, rWall, rOut}); }
  plants.build(g); return {group:g, floors:floorsOut}; }

function flipNormals(g){ if(g.index){ const ix=g.index.array; for(let i=0;i<ix.length;i+=3){ const t=ix[i]; ix[i]=ix[i+2]; ix[i+2]=t; } } const n=g.attributes.normal; for(let i=0;i<n.array.length;i++) n.array[i]*=-1; return g; }

/* ============================== MÁI ĐAO CONG VÚT (chùa / Tô Châu / Kyoto) ============================== */
// w×d: kích thước mái tầng dưới cùng, h: chiều cao mái, eaves: độ vươn hiên, tiers: số tầng mái (mỗi tầng nhỏ lại, cách 0,55·h)
export function buildAsianCurvedRoof(w=10, d=8, h=3, eaves=1.2, color=0x3b3a40, tiers=1, o={}){ const grp=new THREE.Group(), k=o.lift??h*.38;
  const roofM=mat('roof'+color,()=>{ const [c,x]=canvas(256,256); x.fillStyle='#'+new THREE.Color(color).getHexString(); x.fillRect(0,0,256,256); for(let i=0;i<256;i+=16){ x.fillStyle='rgba(0,0,0,.28)'; x.fillRect(i,0,4,256); x.fillStyle='rgba(255,255,255,.06)'; x.fillRect(i+5,0,3,256); } for(let j=0;j<256;j+=24){ x.fillStyle='rgba(0,0,0,.18)'; x.fillRect(0,j,256,2); }
    const t=tex(c); return new THREE.MeshStandardMaterial({map:t, roughness:.62, metalness:.15, side:THREE.DoubleSide}); });
  const trimM=mat('trimR',()=>new THREE.MeshStandardMaterial({color:o.trim??0xb3322a, roughness:.45})), goldM=mat('gold',()=>new THREE.MeshStandardMaterial({color:0xe0b04a, roughness:.3, metalness:.9}));
  const lan=lanterns();
  const wallM=mat('roofWall',()=>new THREE.MeshStandardMaterial({color:o.wall??0xb3322a, roughness:.55}));
  for(let t=0;t<tiers;t++){ const s=1-t*.24, W2=(w/2+eaves)*s, D2=(d/2+eaves)*s, H=h*s*.8, y0=t*h*1.05;
    if(t>0){ const bw=w*s*.78, bd=d*s*.78, wall=new THREE.Mesh(roundedBox(bw, h*.55, bd, .08, 2), wallM); wall.position.y=y0-h*.28; wall.castShadow=true; grp.add(wall); }   // thân tầng giữa 2 lớp mái
    // lưới mái 4 mái (hip roof) → đẩy y lên theo hàm parabol 4 góc
    const N=24, pos=[], uv=[], idx=[];
    for(let j=0;j<=N;j++) for(let i=0;i<=N;i++){ const u=i/N*2-1, v=j/N*2-1, x=u*W2, z=v*D2, m=Math.max(Math.abs(u),Math.abs(v));
      let y=H*Math.pow(1-m,1.15); y+=k*s*(Math.abs(x)/W2)**2*(Math.abs(z)/D2)**2; pos.push(x,y0+y,z); uv.push(u*W2/2,v*D2/2); }
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const a=j*(N+1)+i, b=a+1, cc=a+N+1, dd=cc+1; idx.push(a,cc,b, b,cc,dd); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals();
    const roof=new THREE.Mesh(g, roofM); roof.castShadow=true; roof.receiveShadow=true; grp.add(roof);
    // sống mái chính + 4 sống góc (theo đường chéo, cong lên ở đầu) + đầu đao
    const ridgeL=Math.max(.2,(W2-D2)*2); const ridge=new THREE.Mesh(roundedBox(ridgeL+.6,.28,.32,.1,2), trimM); ridge.position.y=y0+H+.12; grp.add(ridge);
    for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const pts=[]; for(let q=0;q<=12;q++){ const m=q/12, x=sx*W2*m, z=sz*D2*m; let y=H*Math.pow(1-m,1.15)+k*s*m**4; pts.push(new THREE.Vector3(x, y0+y+.1, z)); }
      grp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.09*s+.04,6,false), trimM));
      const tip=new THREE.Mesh(new THREE.ConeGeometry(.12,.7,8), goldM); const e=pts[12]; tip.position.set(e.x+sx*.15, e.y+.25, e.z+sz*.15); tip.rotation.z=-sx*.6; tip.rotation.x=sz*.6; grp.add(tip);
      lan.add(e.x-sx*.35, e.y-.75, e.z-sz*.35); }
    if(t===tiers-1){ const fin=new THREE.Mesh(new THREE.ConeGeometry(.22,1.1,10), goldM); fin.position.y=y0+H+.75; grp.add(fin); } }
  lan.build(grp); return grp; }

/* ============================== BÀN BIDA CHI TIẾT + HOẠT CẢNH BI ============================== */
export function buildBilliardTable(W, x, y, z, rotY=0, feltColor=0x0d7a4f, scope='interior', o={}){ const L=2.84, Wd=1.42, H=.78, g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rotY; (o.parent||W.scene).add(g);
  const wood=mat('walnut',()=>makeWoodMaterial({col:'#5a3518', plank:28, rough:.35})), felt=mat('felt'+feltColor,()=>new THREE.MeshStandardMaterial({color:feltColor, roughness:.95})), brass=mat('brass',()=>new THREE.MeshStandardMaterial({color:0xc9a050, roughness:.25, metalness:1}));
  const add=(geo,m,px,py,pz)=>{ const me=new THREE.Mesh(geo,m); me.position.set(px,py,pz); me.castShadow=me.receiveShadow=true; g.add(me); return me; };
  add(roundedBox(L,.24,Wd,.06,3), wood, 0,H-.12,0);                       // khung gỗ óc chó bo góc
  add(roundedBox(L-.24,.04,Wd-.24,.01,1), felt, 0,H+.01,0);               // mặt nỉ
  for(const sx of [-1,1]){ add(roundedBox(L-.2,.06,.1,.03,2), felt, 0,H+.04,sx*(Wd/2-.11)); } for(const sx of [-1,1]) add(roundedBox(.1,.06,Wd-.2,.03,2), felt, sx*(L/2-.11),H+.04,0);   // băng
  for(const [lx,lz] of [[-1,-1],[0,-1],[1,-1],[-1,1],[0,1],[1,1]]){ const leg=new THREE.LatheGeometry([[.07,0],[.09,.06],[.06,.2],[.08,.36],[.05,.5],[.065,.66]].map(([r,h])=>new THREE.Vector2(r,h)),14); add(leg, brass, lx*(L/2-.2), 0, lz*(Wd/2-.18)); }
  // bi Carom: trắng, vàng, đỏ + 2 cây cơ
  const R=.031, balls=[0xf5f2e8,0xf2c230,0xc8231c].map((c,i)=>{ const m=add(new THREE.SphereGeometry(R,16,12), new THREE.MeshStandardMaterial({color:c, roughness:.15, metalness:.05}), -.5+i*.35, H+.03+R, (i-1)*.18); m.userData.dynamic=true; return {m, vx:0, vz:0}; });   /* 21/11 (phiên B): bi là vật động – batchStatic không gộp, không thì bi lăn nhưng hình vẫn đứng yên */
  for(const s of [-1,1]){ const cue=add(new THREE.CylinderGeometry(.006,.016,1.45,10), mat('cue',()=>new THREE.MeshStandardMaterial({color:0xd8b27a, roughness:.4})), .15*s, H+.06, s*.42); cue.rotation.z=Math.PI/2; cue.rotation.y=.08*s; }
  // đèn chụp 3 chao treo ở y + 1,85
  const lampM=mat('lampG',()=>new THREE.MeshStandardMaterial({color:0x1f5a3a, roughness:.4, metalness:.4, side:THREE.DoubleSide})), bulbM=mat('bulbB',()=>new THREE.MeshStandardMaterial({color:0xfff2d0, emissive:0xffe2a0, emissiveIntensity:1.6}));
  add(roundedBox(1.9,.05,.08,.02,1), brass, 0,1.85+.32,0); for(const sx of [-.7,0,.7]){ add(new THREE.CylinderGeometry(.008,.008,.3,4), brass, sx,1.85+.17,0); const sh=add(new THREE.ConeGeometry(.22,.2,20,1,true), lampM, sx,1.85,0); sh.castShadow=false; add(new THREE.SphereGeometry(.05,10,8), bulbM, sx,1.81,0); }
  // va chạm (hộp xoay → 4 đoạn thẳng giới hạn độ cao) + E đánh 1 cơ
  if(W){ const c=Math.cos(rotY), s=Math.sin(rotY), P=(lx,lz)=>[x+lx*c+lz*s, z-lx*s+lz*c], hl=L/2+.05, hw=Wd/2+.05, cs=[P(-hl,-hw),P(hl,-hw),P(hl,hw),P(-hl,hw)];
    if(W.addSeg) for(let i=0;i<4;i++){ const [ax,az]=cs[i], [bx,bz]=cs[(i+1)%4]; W.addSeg(ax,az,bx,bz,.1, y-.4, y+1.2); }
    const sim={t:0};
    W.INTER && W.INTER.push({x, z, r:2.6, prio:.6, scope, when:()=>!W.P || Math.abs((W.P.y||0)-y)<1.3, label:'🎱 Đánh một cơ Bida 3 băng (E)', action:()=>{ const a=Math.random()*Math.PI*2, sp=2.6+Math.random()*1.4; balls[0].vx=Math.cos(a)*sp; balls[0].vz=Math.sin(a)*sp; sim.t=7; W.toast && W.toast('🎱 Cốc! Bi trắng lao đi – xem có ăn điểm 3 băng không nhé…', 2200); }});
    W.HOOK && W.HOOK.onFrame.push(dt=>{ if(sim.t<=0) return; sim.t-=dt; const hx=L/2-.16-R, hz=Wd/2-.16-R, h=Math.min(dt,1/30);
      for(const b of balls){ b.m.position.x+=b.vx*h; b.m.position.z+=b.vz*h; if(Math.abs(b.m.position.x)>hx){ b.m.position.x=Math.sign(b.m.position.x)*hx; b.vx*=-.88; } if(Math.abs(b.m.position.z)>hz){ b.m.position.z=Math.sign(b.m.position.z)*hz; b.vz*=-.88; }
        const sp=Math.hypot(b.vx,b.vz); if(sp>0){ const f=Math.max(0,sp-.55*h)/sp; b.vx*=f; b.vz*=f; b.m.rotation.x+=b.vz*h/R; b.m.rotation.z-=b.vx*h/R; } }
      for(let i=0;i<3;i++) for(let j=i+1;j<3;j++){ const A=balls[i], B=balls[j], dx=B.m.position.x-A.m.position.x, dz=B.m.position.z-A.m.position.z, dd=Math.hypot(dx,dz); if(dd>0 && dd<2*R){ const nx=dx/dd, nz=dz/dd, rv=(A.vx-B.vx)*nx+(A.vz-B.vz)*nz; if(rv>0){ A.vx-=rv*nx; A.vz-=rv*nz; B.vx+=rv*nx; B.vz+=rv*nz; } const o2=(2*R-dd)/2; A.m.position.x-=nx*o2; A.m.position.z-=nz*o2; B.m.position.x+=nx*o2; B.m.position.z+=nz*o2; } } }); }
  return g; }
