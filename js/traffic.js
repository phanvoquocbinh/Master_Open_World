// QC World – S9: ĐƯỜNG PHỐ & GIAO THÔNG
//  🚦 Đèn giao thông ở 6 ngã tư Downtown + 2 ngã ba Phường Khởi Nghiệp (xanh 13 s · vàng 3 s · đỏ cả 2 hướng 1 s), đèn cho người đi bộ (đỏ / xanh)
//  🛣️ Vạch kẻ đường dựng bằng hình (nét ở mọi khoảng cách): mép đường, tim đường vàng (đôi ở đại lộ), vạch dừng đúng làn, vạch qua đường;
//     sơn phản quang sáng hơn ban đêm + đinh phản quang ở tim đường
//  🚗 Xe bot dân thường chạy đúng làn bên phải, dừng đèn đỏ, giữ khoảng cách xe trước, phanh khi có người trên đường / vạch qua đường
//     (xe buýt + taxi cũng tuân theo đèn và giữ khoảng cách qua cùng hàm limit())
//  🚶 Bot đi bộ chỉ đi vỉa hè, qua đường đúng vạch và chờ đèn (bots.js gọi mayStep, nav.js chặn lòng đường qua W.roadBlock)
//  🌉 3 cây cầu có lối đi bộ nâng cao 2 bên (xe chạy giữa)
import { compactGroup } from './perf.js';

export function makeTraffic(W, L){
  const {THREE, scene, CITY, HOOK, P, addPlat, circles, groundAt, toast} = W;
  const TR=L.transit, V=L.V; if(!TR || !TR.route) return null;
  const D=CITY.downtown, WD=CITY.ward, AR=CITY.arena, H=5, SX=(WD && WD.links)||[178,220], SZ=[-36,0,36], ST=WD ? WD.street : null;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const sm=(c,r=.7,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3(), _c=new THREE.Color();
  function Kit(){ const parts=new Map(); return {
    add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
    build(parent){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:W.mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=true; ms.receiveShadow=true; parent.add(ms); } } }; }

  /* ============================== NGÃ TƯ + ĐÈN ============================== */
  const IX=[]; for(const x of SX) for(const z of SZ) IX.push({x,z,t:false}); if(ST!=null) for(const x of SX) IX.push({x,z:ST,t:true});
  IX.forEach((ix,i)=>{ ix.i=i; ix.off=(i*5.3)%32; ix.key=''; });
  const CYC=32; let clock=0;
  const phaseOf=ix=>{ const u=((clock+ix.off)%CYC+CYC)%CYC; return u<13?'GR':u<16?'YR':u<17?'RR':u<28?'RG':u<31?'RY':'RR'; };   // [dọc (ns), ngang (ew)]
  const sig=(ix,axis)=>phaseOf(ix)[axis==='ns'?0:1];
  const ixAt=(x,z)=>{ for(const ix of IX) if(Math.abs(x-ix.x)<H && Math.abs(z-ix.z)<H) return ix; return null; };

  /* ---------- lòng đường + vạch qua đường (cho bot đi bộ) ---------- */
  const ROADS=[], ZEB=[]; const R_=(x0,x1,z0,z1)=>ROADS.push({x0,x1,z0,z1}); const Z_=(x0,x1,z0,z1,ix,road)=>ZEB.push({x0,x1,z0,z1,ix,road});
  for(const z of SZ) R_(D.x0, D.x1, z-H, z+H);
  for(const x of SX){ R_(x-H, x+H, D.z0, D.z1); if(ST!=null) R_(x-H, x+H, D.z1-.1, ST-H); }
  if(ST!=null) R_(WD.x0, WD.x1, ST-H, ST+H);
  const BRW=3.5, landZ=L.highland && L.highland.landZ;
  R_(48.5, D.x0, -BRW, BRW); if(AR) R_(D.x1-.1, AR.x0+.1, -BRW, BRW); if(landZ) R_(178-BRW, 178+BRW, landZ-3, D.z0+.1);
  for(const ix of IX){ const {x,z}=ix;
    if(!ix.t){ for(const s of [-1,1]){ Z_(x+s*7-1.3, x+s*7+1.3, z-H, z+H, ix, 'ew'); Z_(x-H, x+H, z+s*7-1.3, z+s*7+1.3, ix, 'ns'); } }
    else { Z_(x-H, x+H, z-8.8-1.3, z-8.8+1.3, ix, 'ns'); for(const s of [-1,1]) Z_(x+s*7-1.3, x+s*7+1.3, z-H, z+H, ix, 'ew'); } }
  Z_(D.x0+3-1.3, D.x0+3+1.3, -H, H, null, 'ew');
  const inR=(r,x,z)=>x>r.x0 && x<r.x1 && z>r.z0 && z<r.z1;
  const zebraAt=(x,z)=>{ for(const r of ZEB) if(inR(r,x,z)) return r; return null; };
  const onRoad=(x,z)=>{ for(const r of ROADS) if(inR(r,x,z)) return true; return false; };
  const pedOK=zb=>!zb.ix || sig(zb.ix, zb.road)==='R';
  W.roadBlock=(x,z)=>onRoad(x,z) && !zebraAt(x,z);
  // bot đi bộ: đang trên vỉa hè mà bước tiếp vào vạch qua đường lúc đèn chưa cho phép → đứng chờ
  function mayStep(x0,z0,x1,z1){ const zb=zebraAt(x1,z1); if(!zb) return true; if(onRoad(x0,z0)) return true; return pedOK(zb); }

  /* ============================== VẠCH KẺ ĐƯỜNG (hình thật) ============================== */
  const WH=[], YE=[], STUD=[];
  const rect=(arr,x0,z0,x1,z1)=>{ if(x1<x0) [x0,x1]=[x1,x0]; if(z1<z0) [z0,z1]=[z1,z0]; arr.push([x0,z0,x1,z1]); };
  const cutsX=(x0,x1)=>{ const c=[x0, ...SX.flatMap(x=>[x-H,x+H]), x1], o=[]; for(let i=0;i<c.length;i+=2) o.push([c[i],c[i+1]]); return o; };
  const ewRoad=(z, x0, x1, dbl)=>{ for(const [a,b] of cutsX(x0,x1)){ const a2=a+(a===x0?0:4), b2=b-(b===x1?0:4); if(b2-a2<1) continue;
      rect(WH, a2, z-H+.28, b2, z-H+.5); rect(WH, a2, z+H-.5, b2, z+H-.28);
      if(dbl){ rect(YE, a2, z-.27, b2, z-.11); rect(YE, a2, z+.11, b2, z+.27); } else for(let x=a2;x<b2-1.5;x+=4.5) rect(YE, x, z-.08, Math.min(x+2.6,b2), z+.08);
      for(let x=a2+3;x<b2-1;x+=9) STUD.push([x, z]);
      if(a!==x0) rect(WH, a2-.45, z-H+.35, a2, z-.05);     // xe đi về phía Tây (nửa −z) dừng trước ngã tư bên trái
      if(b!==x1) rect(WH, b2, z+.05, b2+.45, z+H-.35); } }  // xe đi về phía Đông (nửa +z)
  for(const z of SZ) ewRoad(z, D.x0, D.x1, z===0);
  if(ST!=null) ewRoad(ST, WD.x0, WD.x1, false);
  for(const x of SX){
    const c=[D.z0, ...SZ.flatMap(z=>[z-H,z+H]), D.z1]; for(let i=0;i<c.length;i+=2){ const a=c[i], b=c[i+1], a2=a+(a===D.z0?0:4), b2=b-(b===D.z1?0:4);
      rect(WH, x-H+.28, a2, x-H+.5, b2); rect(WH, x+H-.5, a2, x+H-.28, b2);
      for(let z=a2;z<b2-1.5;z+=4.5) rect(YE, x-.08, z, x+.08, Math.min(z+2.6,b2)); for(let z=a2+3;z<b2-1;z+=9) STUD.push([x, z]);
      if(a!==D.z0) rect(WH, x+.05, a2-.45, x+H-.35, a2);       // xe đi lên Bắc (nửa +x)
      if(b!==D.z1) rect(WH, x-H+.35, b2, x-.05, b2+.45); }     // xe đi xuống Nam (nửa −x)
    if(ST!=null){ const a=D.z1, b=ST-H-6.2; rect(WH, x-H+.28, a, x-H+.5, b+5.6); rect(WH, x+H-.5, a, x+H-.28, b+5.6);
      for(let z=a;z<b-1.5;z+=4.5) rect(YE, x-.08, z, x+.08, Math.min(z+2.6,b)); rect(WH, x-H+.35, b-.45+.05, x-.05, b+.05); } }
  // vạch qua đường
  for(const zb of ZEB){ const alongX=(zb.x1-zb.x0)<(zb.z1-zb.z0);   // dải hẹp theo x → vạch nằm trên đường ngang (EW)
    if(alongX){ for(let k=zb.z0+.6;k<zb.z1-.6;k+=.9) rect(WH, zb.x0, k, zb.x1, k+.5); } else { for(let k=zb.x0+.6;k<zb.x1-.6;k+=.9) rect(WH, k, zb.z0, k+.5, zb.z1); } }
  const markY=.048;
  function quadsGeo(arr){ const pos=new Float32Array(arr.length*12), nor=new Float32Array(arr.length*12), idx=[];
    arr.forEach(([x0,z0,x1,z1],i)=>{ const v=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]]; v.forEach(([x,z],k)=>{ pos[i*12+k*3]=x; pos[i*12+k*3+1]=markY; pos[i*12+k*3+2]=z; nor[i*12+k*3+1]=1; }); const b=i*4; idx.push(b,b+2,b+1, b,b+3,b+2); });
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('normal', new THREE.BufferAttribute(nor,3)); g.setIndex(idx); g.computeBoundingSphere(); return g; }
  const paint=(c,e)=>new THREE.MeshStandardMaterial({color:c, roughness:.5, emissive:e, emissiveIntensity:.03, side:THREE.DoubleSide, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3});
  const whiteM=paint(0xf6f6f0, 0xffffff), yellowM=paint(0xf4c22b, 0xffc400);
  for(const [arr,mat] of [[WH,whiteM],[YE,yellowM]]){ const m=new THREE.Mesh(quadsGeo(arr), mat); m.receiveShadow=true; m.castShadow=false; m.userData.dynamic=true; m.renderOrder=1; scene.add(m); }
  const studM=new THREE.MeshStandardMaterial({color:0xffcf4a, emissive:0xffb000, emissiveIntensity:.15, roughness:.3, metalness:.4});
  const studs=new THREE.InstancedMesh(new THREE.BoxGeometry(.13,.035,.1), studM, STUD.length); STUD.forEach(([x,z],i)=>{ _m.makeTranslation(x,.06,z); studs.setMatrixAt(i,_m); }); studs.userData.dynamic=true; studs.castShadow=false; scene.add(studs);

  /* ---------- cột đèn tín hiệu ---------- */
  const poleM=sm(0x2d3238,.45,.6), headM=sm(0x14171b,.6,.2), backM=sm(0xf2c230,.6);
  const kit=Kit(), VL=[], PL=[];   // đèn xe: {pos, face, ix, axis, col} · đèn đi bộ: {pos, face, ix, axis}
  const dirOf=h=>[Math.sin(h), Math.cos(h)];
  function pole(x,z,arm){ kit.add(new THREE.CylinderGeometry(.09,.12,5.9,10), poleM, x,2.95,z); kit.add(new THREE.CylinderGeometry(.2,.24,.25,10), poleM, x,.12,z); circles.push({x, z, r:.18}); }
  for(const ix of IX){ const {x,z}=ix;
    const heads = ix.t ? [0, Math.PI/2, -Math.PI/2] : [0, Math.PI/2, Math.PI, -Math.PI/2];
    for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){ const px=x+sx*5.95, pz=z+sz*5.95; pole(px,pz);
      // đèn đi bộ: qua đường dọc (vạch ngang qua đường ns ở phía sz) – mặt quay về đầu kia vạch (−sx); qua đường ngang (ew) – quay về −sz
      const pedNS=!ix.t || sz<0;
      if(pedNS){ const f=sx<0?Math.PI/2:-Math.PI/2, d=dirOf(f); kit.add(new THREE.BoxGeometry(.32,.56,.22), headM, px+d[0]*.2, 2.55, pz+d[1]*.2, 0,f,0); PL.push({x:px+d[0]*.32, y:2.55, z:pz+d[1]*.32, face:f, ix, axis:'ns'}); }
      { const f=sz<0?0:Math.PI, d=dirOf(f); kit.add(new THREE.BoxGeometry(.32,.56,.22), headM, px+d[0]*.2, 2.55, pz+d[1]*.2, 0,f,0); PL.push({x:px+d[0]*.32, y:2.55, z:pz+d[1]*.32, face:f, ix, axis:'ew'}); } }
    for(const h of heads){ const f=dirOf(h), r=[-Math.cos(h), Math.sin(h)], cx=x-f[0]*5.95, cz=z-f[1]*5.95;
      const hx=cx+r[0]*2.4, hz=cz+r[1]*2.4, armL=3.55, ax=cx+r[0]*(5.95-armL/2), az=cz+r[1]*(5.95-armL/2);
      kit.add(new THREE.BoxGeometry(.1,.1,armL), poleM, ax,5.55,az, 0,Math.atan2(r[0],r[1]),0);
      const face=h+Math.PI, fd=dirOf(face); kit.add(new THREE.BoxGeometry(.44,1.14,.3), headM, hx,4.95,hz, 0,face,0); kit.add(new THREE.BoxGeometry(.62,1.32,.04), backM, hx-fd[0]*.17,4.95,hz-fd[1]*.17, 0,face,0);
      const axis=Math.abs(f[0])>Math.abs(f[1])?'ew':'ns';
      ['R','Y','G'].forEach((col,k)=>VL.push({x:hx+fd[0]*.16, y:5.3-k*.35, z:hz+fd[1]*.16, face, ix, axis, col})); } }
  { const g=new THREE.Group(); scene.add(g); kit.build(g); }
  const lampMat=new THREE.MeshBasicMaterial({toneMapped:false});
  const pedTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,64,64); g.fillStyle='#fff'; g.beginPath(); g.arc(32,13,7,0,Math.PI*2); g.fill();
    g.lineCap='round'; g.strokeStyle='#fff'; g.lineWidth=8; g.beginPath(); g.moveTo(32,24); g.lineTo(31,40); g.stroke(); g.lineWidth=6; g.beginPath(); g.moveTo(31,40); g.lineTo(22,57); g.moveTo(31,40); g.lineTo(41,57); g.moveTo(32,27); g.lineTo(21,38); g.moveTo(32,27); g.lineTo(43,36); g.stroke();
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();   // hình người đi bộ (tô màu đỏ/xanh theo đèn)
  const vLamps=new THREE.InstancedMesh(new THREE.CircleGeometry(.135,14), lampMat, VL.length), pLamps=new THREE.InstancedMesh(new THREE.PlaneGeometry(.24,.28), new THREE.MeshBasicMaterial({toneMapped:false, map:pedTex}), PL.length);
  for(const [im,list] of [[vLamps,VL],[pLamps,PL]]){ list.forEach((l,i)=>{ _e.set(0,l.face,0); _q.setFromEuler(_e); _m.compose(_p.set(l.x,l.y,l.z), _q, _s); im.setMatrixAt(i,_m); im.setColorAt(i,_c.set(0x222222)); }); im.userData.dynamic=true; im.castShadow=false; scene.add(im); }
  const ON={R:0xff2a14, Y:0xffb000, G:0x14ff6a}, OFF={R:0x3a120c, Y:0x3a2c08, G:0x0c3a1c};
  function paintSignals(force){ let vd=false, pd=false;
    for(const ix of IX){ const k=phaseOf(ix); if(k===ix.key && !force) continue; ix.key=k;
      VL.forEach((l,i)=>{ if(l.ix!==ix) return; const st=sig(ix,l.axis); vLamps.setColorAt(i,_c.set(st===l.col?ON[l.col]:OFF[l.col])); vd=true; });
      PL.forEach((l,i)=>{ if(l.ix!==ix) return; const walk=sig(ix,l.axis)==='R'; pLamps.setColorAt(i,_c.set(walk?0x2bff7a:0xff3a22)); pd=true; }); }
    if(vd) vLamps.instanceColor.needsUpdate=true; if(pd) pLamps.instanceColor.needsUpdate=true; }
  paintSignals(true);

  /* ============================== 🌉 LỐI ĐI BỘ TRÊN CẦU ============================== */
  { const walkTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'); g.fillStyle='#c9c3b6'; g.fillRect(0,0,128,128); for(let y=0;y<128;y+=16) for(let x=(y/16%2)*8;x<128;x+=16){ const v=180+Math.random()*25|0; g.fillStyle=`rgb(${v},${v-5},${v-14})`; g.fillRect(x+1,y+1,14,14); } const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const k=Kit(), curbM=sm(0xe4e1da,.7), mats=new Map();
    const strip=(x0,z0,x1,z1,base)=>{ const w=x1-x0, d=z1-z0, cx=(x0+x1)/2, cz=(z0+z1)/2; let m=mats.get(w>d?'x':'z'); if(!m){ const t=walkTex.clone(); t.needsUpdate=true; if(w>d) t.repeat.set(w/2,d/2); else t.repeat.set(w/2,d/2); m=sm(0xffffff,.85,0,{map:t}); mats.set(w>d?'x':'z',m); }
      k.add(new THREE.BoxGeometry(w,.18,d), m, cx, base+.09, cz); addPlat(cx, cz, 0, w/2, d/2, base+.18); };
    const curb=(x0,z0,x1,z1,base)=>k.add(new THREE.BoxGeometry(Math.max(.12,x1-x0),.2,Math.max(.12,z1-z0)), curbM, (x0+x1)/2, base+.1, (z0+z1)/2);
    for(const s of [-1,1]){ // cầu đảo ⇄ Downtown (z = ±3.5…±4.85)
      strip(48.5, s>0?3.5:-4.85, D.x0+.6, s>0?4.85:-3.5, .15); curb(48.5, s*3.5-.06, D.x0+.6, s*3.5+.06, .15);
      if(AR){ strip(D.x1+.1, s>0?3.5:-4.85, AR.x0-.1, s>0?4.85:-3.5, .17); curb(D.x1+.1, s*3.5-.06, AR.x0-.1, s*3.5+.06, .17); }
      if(landZ){ strip(s>0?178+3.5:178-4.85, landZ-3, s>0?178+4.85:178-3.5, D.z0-.1, .235); curb(178+s*3.5-.06, landZ-3, 178+s*3.5+.06, D.z0-.1, .235); } }
    const g=new THREE.Group(); scene.add(g); k.build(g); }

  /* ============================== XE: đèn + giữ khoảng cách + nhường người ============================== */
  const EVC=new WeakMap();
  function events(path){ let ev=EVC.get(path); if(ev) return ev; ev=[]; let prev=null; const o={};
    for(let s=0; s<=path.L; s+=.5){ path.at(s,o); const ix=ixAt(o.x,o.z); if(ix && ix!==prev){ const h=path.heading(s+1.5,1.5), axis=Math.abs(Math.sin(h))>Math.abs(Math.cos(h))?'ew':'ns'; ev.push({s, ix, axis, stop:(ix.t && axis==='ns')?5.8:4.1}); } prev=ix; }
    EVC.set(path, ev); return ev; }
  let obs=[], obsStamp=-1, frameN=0, horn=0;
  function obstacles(){ if(obsStamp===frameN) return obs; obsStamp=frameN; obs=[];
    for(const b of TR.buses||[]) obs.push({x:b.g.position.x, z:b.g.position.z, h:b.h, hl:5.6, hw:1.25, self:b, veh:true});
    const tx=TR.taxi && TR.taxi(), to=TR.taxiObj; if(tx && to && to.visible) obs.push({x:to.position.x, z:to.position.z, h:to.rotation.y, hl:2.3, hw:.95, self:to, veh:true});
    for(const c of cars) if(c.g.visible || c.near) obs.push({x:c.g.position.x, z:c.g.position.z, h:c.h, hl:c.hl, hw:c.hw, self:c, veh:true});
    const ride=TR.ride && TR.ride(), r=V && V.riding && V.riding();
    if(!ride && !W.inside){ if(r){ const car=r.type==='car'; obs.push({x:P.x, z:P.z, h:r.h, hl:car?2.2:.9, hw:car?.95:.35, player:true}); } else obs.push({x:P.x, z:P.z, h:P.face, hl:.3, hw:.3, player:true}); }
    const bl=L.bots && L.bots.bots; if(bl) for(const b of bl) if(b.x>120 || Math.abs(b.z)<8) obs.push({x:b.x, z:b.z, h:b.h, hl:.3, hw:.3, ped:true});
    return obs; }
  // tốc độ tối đa cho phép của 1 xe đi theo path tại s (đèn đỏ phía trước · xe / người phía trước)
  function limit(path, s, v, half, h, x, z, self, ghost){ let vt=99;
    const ev=events(path), sf=s+half; let best=null, bd=1e9;
    for(const e of ev){ let d=e.s-e.stop-sf; if(path.loop){ d=((d%path.L)+path.L)%path.L; if(d>path.L-40) d-=path.L; } if(d<-.3 || d>48) continue; if(d<bd){ bd=d; best=e; } }
    if(best){ const st=sig(best.ix, best.axis); if(st!=='G' && !(bd < v*v/(2*6.5) && bd<4)) vt=Math.min(vt, Math.sqrt(2*3.2*Math.max(0, bd-.3))); }
    const f=[Math.sin(h), Math.cos(h)], r=[-Math.cos(h), Math.sin(h)];
    for(const o of obstacles()){ if(o.self===self) continue; if(ghost && o.veh) continue; const dx=o.x-x, dz=o.z-z, a=dx*f[0]+dz*f[1]; if(a<=0 || a>34) continue;
      const l=dx*r[0]+dz*r[1]; if(Math.abs(l)>1.25+o.hw) continue;
      if(o.veh && Math.cos(o.h-h)<-.5 && a>half+o.hl+2) continue;   // xe ngược chiều còn xa: không phanh sớm
      const gap=a-half-o.hl, vv=Math.sqrt(2*4.2*Math.max(0, gap-(o.ped||o.player?2.6:2.2))); if(vv<vt){ vt=vv; if(self && self.blk!==undefined) self.blk=o.player?2:o.ped?1:(Math.cos(o.h-h)<-.3?4:3); } }
    return vt; }

  /* ============================== 🚗 XE BOT DÂN THƯỜNG ============================== */
  const G=TR.G, cars=[];
  const cityNodes=G.nodes.map((n,i)=>i).filter(i=>G.nodes[i].x>130);   // Downtown · Phường · Khu Giải trí · Đồi Brand QC · Cao nguyên
  function trip(c, x, z, h){ // đi tiếp theo hướng đang chạy (không quay đầu tại chỗ)
    const pr=TR.project(x,z); if(!pr) return false; const A=G.nodes[pr.a], B=G.nodes[pr.b], f=[Math.sin(h),Math.cos(h)];
    const fwd=((B.x-A.x)*f[0]+(B.z-A.z)*f[1])>=0 ? pr.b : pr.a; const from={a:fwd, b:fwd, t:0, x:pr.x, z:pr.z, d:pr.d};
    for(let k=0;k<14;k++){ const n=G.nodes[cityNodes[Math.floor(Math.random()*cityNodes.length)]]; if(Math.hypot(n.x-x,n.z-z)<80) continue;
      const to=TR.project(n.x,n.z), r=TR.route(from,to); if(!r || r.pts.length<2 || !(r.len<1e9)) continue; c.path=TR.lanePath(r.pts); c.s=Math.min(c.path.L*.0, 0); return true; }
    return false; }
  // xe bot nhiều màu: thân màu tươi + nóc khác màu / sọc đua / gương & mâm màu nhấn
  const CARS=[['sedan',0xff4d4d,{roof:0xffffff, rim:0x222222}],['suv',0x14b8a6,{roof:0x111111, stripe:0xffa000}],['mini',0xffd23f,{roof:0xffffff, stripe:0xffffff, accent:0xffffff}],['pickup',0x7ac943,{rim:0x1d1f24, accent:0x1d1f24}],['sport',0xff7b29,{stripe:0x111111, rim:0x111111}],
    ['sedan',0x8b5cf6,{roof:0xe5e7eb, accent:0xe5e7eb}],['suv',0x6ee7b7,{roof:0xffffff, rim:0xffffff}],['sedan',0x38bdf8,{stripe:0x1e3a8a, accent:0x1e3a8a}],['mini',0xff6fb5,{roof:0xffffff, accent:0xffffff}],['sport',0x1e40af,{stripe:0xffffff, rim:0xffffff}]];
  const headL=new THREE.MeshStandardMaterial({color:0xfff6dc, emissive:0xfff2c8, emissiveIntensity:.2}), tailL=new THREE.MeshStandardMaterial({color:0x8a0c0c, emissive:0xff1a10, emissiveIntensity:.25});
  if(V && V.buildCar) CARS.forEach(([model,color,opt],i)=>{ const g=V.buildCar(color, model, opt||{}); g.userData.dynamic=true;
    const bb=new THREE.Box3().setFromObject(g), sz=bb.getSize(new THREE.Vector3()), hl=sz.z/2, hw=sz.x/2;
    for(const sx of [-1,1]){ const f=new THREE.Mesh(new THREE.BoxGeometry(.28,.12,.03), headL); f.position.set(sx*(hw-.32),.72,bb.max.z-.02); g.add(f);
      const t=new THREE.Mesh(new THREE.BoxGeometry(.3,.1,.03), tailL); t.position.set(sx*(hw-.28),.82,bb.min.z+.02); g.add(t); }
    for(const w of (g.userData.wheels||[])) w.userData.keep=true; try{ compactGroup(W, g); }catch(e){}
    scene.add(g); const c={g, model, hl, hw, v:0, s:0, h:0, top:9+Math.random()*3, stuck:0, ghost:0, blk:0, blkT:0, near:false, acc:0};
    const n=G.nodes[cityNodes[(i*7+3)%cityNodes.length]], nb=G.nodes[n.adj[0][0]]; c.h=Math.atan2(nb.x-n.x, nb.z-n.z);
    if(trip(c, n.x, n.z, c.h)){ c.s=Math.random()*c.path.L*.6; cars.push(c); W.DYN && W.DYN.push({obj:g, hl, hw, head:()=>c.h, on:()=>g.visible, name:'ô tô'}); placeCar(c, 0); } else scene.remove(g); });
  function placeCar(c, dt){ const p=c.path.at(c.s), h=c.path.heading(c.s,1.2), f=[Math.sin(h),Math.cos(h)], yF=groundAt(p.x+f[0]*1.4,p.z+f[1]*1.4), yB=groundAt(p.x-f[0]*1.4,p.z-f[1]*1.4);
    c.g.position.set(p.x, (yF+yB)/2, p.z); c.g.rotation.set(-Math.atan2(yF-yB,2.8), h, 0, 'YXZ'); c.h=h;   // nghiêng theo dốc
    if(dt) for(const w of (c.g.userData.wheels||[])) w.rotation.x+=c.v*dt/.34; }
  function respawn(c){ for(let k=0;k<20;k++){ const n=G.nodes[cityNodes[Math.floor(Math.random()*cityNodes.length)]]; if(Math.hypot(n.x-P.x,n.z-P.z)<90) continue; const nb=G.nodes[n.adj[0][0]];
      if(trip(c, n.x, n.z, Math.atan2(nb.x-n.x, nb.z-n.z))){ c.v=0; c.stuck=0; placeCar(c,0); return; } } }
  function updCar(c, dt){
    const p=c.path; let vt=c.top; for(let d=0; d<=24; d+=3) vt=Math.min(vt, Math.sqrt(p.vAt(c.s+d)**2+2*3*d));
    c.blk=0; vt=Math.min(vt, limit(p, c.s, c.v, c.hl, c.h, c.g.position.x, c.g.position.z, c, c.ghost>0));
    c.v+=clamp(vt-c.v, -6.5*dt, 2.4*dt); if(c.v<0) c.v=0; c.s+=c.v*dt;
    if(c.ghost>0) c.ghost-=dt;
    // kẹt lâu vì xe khác (giao nhau ngược chiều) → lách qua 2,5 s; kẹt rất lâu → về chỗ khác ngoài tầm nhìn
    if(c.v<.08 && c.blk===4){ c.stuck+=dt; if(c.stuck>5){ c.ghost=2.5; c.stuck=0; } } else if(c.v>.5 || c.blk!==4) c.stuck=0;   // chỉ lách khi kẹt mặt đối mặt với xe ngược chiều
    if(c.v<.05){ c.idle=(c.idle||0)+dt; if(c.idle>40 && Math.hypot(c.g.position.x-P.x,c.g.position.z-P.z)>60){ c.idle=0; respawn(c); return; } } else c.idle=0;
    // bị người chơi chắn đường → bóp còi
    if(c.blk===2 && c.v<.3){ c.blkT+=dt; if(c.blkT>2.5 && horn<=0 && Math.hypot(c.g.position.x-P.x,c.g.position.z-P.z)<14){ horn=9; toast('🚗 Bíp bíp! Ô tô xin đường – bước lên vỉa hè nhé.', 2200); } } else c.blkT=0;
    if(c.s>=p.L-.6){ const x=c.g.position.x, z=c.g.position.z; if(!trip(c, x, z, c.h)) respawn(c); }
    placeCar(c, dt); }

  /* ============================== khung hình ============================== */
  let lastN=-1;
  HOOK.onFrame.push((dt)=>{ clock+=dt; frameN++; if(horn>0) horn-=dt;
    paintSignals(false);
    if(W.night!==lastN){ lastN=W.night; const n=W.night||0; whiteM.emissiveIntensity=yellowM.emissiveIntensity=.03+.22*n; studM.emissiveIntensity=.15+2.2*n; headL.emissiveIntensity=.2+2.6*n; tailL.emissiveIntensity=.25+1.6*n; }
    if(W.inside) return;
    for(const c of cars){ const d=Math.hypot(c.g.position.x-P.x, c.g.position.z-P.z); c.near=d<240; const vis=d<210; if(c.g.visible!==vis) c.g.visible=vis;
      if(c.near) updCar(c, Math.min(dt,.1)); else { c.acc+=dt; if(c.acc>.5){ updCar(c, Math.min(c.acc,.6)); c.acc=0; } } } });

  return {IX, sig, phaseOf, limit, mayStep, zebraAt, onRoad, cars, events, get clock(){ return clock; }};
}
