// QC World V2 – Đảo Abyssal · phiên D (abyss-towers), 17/11/2026 – LỘT XÁC 2 TOÀ CÁNH CUNG + 16 SHOPHOUSE TẦNG ĐẾ (đặc tả Bình Phần 6 + 7)
//  Toà Tây "QA · QC · QE Academy & Tech Hub" (12 tầng) + toà Đông "Abyssal Horizon Residences" (14 tầng), dựng lại ĐÚNG cung cánh cũ (W.ABY.plots.towersW/E):
//   • Tầng 1–7 vẫn là hầm dưới bãi cát (không dựng gì). Tầng 8–9 = TẦNG ĐẾ THÔNG TẦNG 9 m ngang mặt bãi cát (+2,3):
//       – Grand Lobby giữa cung: cổng vòm Hoàng gia + sân tam cấp, 2 bảo vệ Navy mũ kê-pi cúi chào, 4 chậu Tùng La Hán, sàn Marble, thảm đỏ,
//         quầy lễ tân hình cung (2 lễ tân), đèn chùm pha lê, sofa nhung, cổng quẹt thẻ 3 làn → 2 thang máy liftkit.
//       – 8 shophouse mỗi toà (12 × 11 × 5,5 m, cửa kính 4,2 m đi bộ vào được) · 4 ngành hàng · mặt tiền Đen Kim Sa / Đồng Đỏ / Teak / Cẩm thạch xanh ngọc,
//         mái hiên vòm vải, biển chữ phát sáng · bấm E ở quầy thu ngân để mua đồ (túi giấy cầm tay 90 giây).
//       – Hành lang cột 3,2 m phía biển; 2 sảnh phụ đầu hồi (gần: cầu kính Hydro-Pulse tầng 8 cắm vào; xa: lounge chờ).
//   • Tầng 10 trở lên: ban công vườn treo (bồn cây + thường xuân rủ) → vách kính Sapphire + đố đồng Titanium + phào vàng → phòng (vách gỗ óc chó, trần đèn ấm,
//     rèm lụa 2 mép kính) → hành lang 3,2 m. Tầng 11 (+15,8) nối thẳng vỉa hè kè +16 qua cổng vòm đầu hồi xa (cổng quẹt thẻ).
//     Tầng 12 (+20,3) nhận cầu kính tháp Hydro-Pulse ở đầu hồi gần (cổng quẹt thẻ). Toà Đỏ: tầng 13–14 lùi đúng cung cũ (cách đường vành đai ≥ 9 m).
//   • Nội thất xuyên kính: lớp học (bàn + màn hình sáng + bảng slide + rack LED), phòng bida, pantry, phòng họp kính / căn hộ (sofa L, TV sáng, đèn cây,
//     giường King, tranh, ban công Jacuzzi + ghế tắm nắng + cây).
//  Hiệu năng (Iris Xe): vỏ ngoài gộp theo vật liệu (cả 2 toà chung ≈ 25 lượt vẽ); vật lặp = InstancedMesh; nội thất xuyên kính = hộp đơn vị InstancedMesh
//   (chỉ hiện khi cách toà < 110 m); sảnh, nội thất shophouse, NPC, bàn bida, nhãn phòng chỉ dựng khi lại gần (dựng 1 lần, sau đó ẩn/hiện).
//  Xong → W.ABY.towersReady = true; W.ABY.towers = {list, shophouses, hasCard, giveCard, retireOldShell(), openGaps()} – phiên A gọi retireOldShell() để gỡ vỏ cánh cũ.
import { makeLiftBank, allLifts } from './liftkit.js';
import { makePoser } from './pose.js';
import { buildBilliardTable } from './archKit.js';
import { buildPenthouses, duplexDef } from './abyssal_penthouse.js';

const TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const rng=(seed=1)=>{ let s=(seed>>>0)||1; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };

/* ============================== BỘ CÔNG CỤ HÌNH HỌC (dùng chung trong file) ============================== */
export function towerKit(THREE, W){
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3(), _c=new THREE.Color();
  const neg=n=>[-n[0],-n[1],-n[2]], Bld=()=>({p:[], n:[]});
  const tri=(B,a,b,c,na,nb,nc)=>{ B.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]); B.n.push(na[0],na[1],na[2],nb[0],nb[1],nb[2],nc[0],nc[1],nc[2]); };
  // tứ giác có hướng: tự đảo thứ tự đỉnh cho mặt trước cùng chiều pháp tuyến (n0..n3 theo từng đỉnh → mặt cong mượt)
  function quad(B,p0,p1,p2,p3,n0,n1=n0,n2=n1,n3=n0){ const ax=p1[0]-p0[0], ay=p1[1]-p0[1], az=p1[2]-p0[2], bx=p3[0]-p0[0], by=p3[1]-p0[1], bz=p3[2]-p0[2];
    const cx=ay*bz-az*by, cy=az*bx-ax*bz, cz=ax*by-ay*bx, nx=n0[0]+n1[0]+n2[0]+n3[0], ny=n0[1]+n1[1]+n2[1]+n3[1], nz=n0[2]+n1[2]+n2[2]+n3[2];
    if(cx*nx+cy*ny+cz*nz>=0){ tri(B,p0,p1,p2,n0,n1,n2); tri(B,p0,p2,p3,n0,n2,n3); } else { tri(B,p0,p2,p1,n0,n2,n1); tri(B,p0,p3,p2,n0,n3,n2); } }
  function toGeo(B){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(B.n,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(B.p.length/3*2),2)); return g; }
  // khối vành khuyên quanh tâm (cx,cz): bán kính r0..r1, góc a0..a1 (x = cos a, z = sin a), cao y0..y1; f = {t,b,i,o,e:false} bỏ mặt
  function ring(B,cx,cz,r0,r1,a0,a1,y0,y1,f={},step=2.4){ if(a1<a0){ const t=a0; a0=a1; a1=t; } if(r1<r0){ const t=r0; r0=r1; r1=t; } const n=Math.max(1,Math.ceil((a1-a0)*Math.max(r1,.5)/step)), P=(a,r,y)=>[cx+Math.cos(a)*r,y,cz+Math.sin(a)*r];
    for(let i=0;i<n;i++){ const a=a0+(a1-a0)*i/n, b=a0+(a1-a0)*(i+1)/n, Na=[Math.cos(a),0,Math.sin(a)], Nb=[Math.cos(b),0,Math.sin(b)];
      if(f.t!==false) quad(B,P(a,r0,y1),P(b,r0,y1),P(b,r1,y1),P(a,r1,y1),[0,1,0]);
      if(f.b!==false) quad(B,P(a,r0,y0),P(b,r0,y0),P(b,r1,y0),P(a,r1,y0),[0,-1,0]);
      if(f.o!==false) quad(B,P(a,r1,y0),P(b,r1,y0),P(b,r1,y1),P(a,r1,y1),Na,Nb,Nb,Na);
      if(f.i!==false && r0>.01) quad(B,P(a,r0,y0),P(b,r0,y0),P(b,r0,y1),P(a,r0,y1),neg(Na),neg(Nb),neg(Nb),neg(Na)); }
    if(f.e!==false) for(const [a,s] of [[a0,-1],[a1,1]]){ const T=[-Math.sin(a)*s,0,Math.cos(a)*s]; quad(B,P(a,r0,y0),P(a,r1,y0),P(a,r1,y1),P(a,r0,y1),T); } }
  // mặt cong 1 lớp (kính, rèm): bán kính r, pháp tuyến hướng vào tâm (vật liệu 2 mặt)
  function surf(B,cx,cz,r,a0,a1,y0,y1,step=2.4){ if(a1<a0){ const t=a0; a0=a1; a1=t; } const n=Math.max(1,Math.ceil((a1-a0)*r/step)), P=(t,y)=>[cx+Math.cos(t)*r,y,cz+Math.sin(t)*r];
    for(let i=0;i<n;i++){ const a=a0+(a1-a0)*i/n, b=a0+(a1-a0)*(i+1)/n, Na=[-Math.cos(a),0,-Math.sin(a)], Nb=[-Math.cos(b),0,-Math.sin(b)]; quad(B,P(a,y0),P(b,y0),P(b,y1),P(a,y1),Na,Nb,Nb,Na); } }
  // bản sao hình có sẵn → biến đổi về toạ độ thế giới (chỉ giữ position/normal/uv, không chỉ mục → gộp được)
  function xf(geo,x,y,z,ry=0,sx=1,sy=1,sz=1,rx=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal' && k!=='uv') g.deleteAttribute(k);
    if(!g.attributes.uv) g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); if(!g.attributes.normal) g.computeVertexNormals();
    _q.setFromEuler(_e.set(rx,ry,0,'YXZ')); _m.compose(_v.set(x,y,z),_q,_s.set(sx,sy,sz)); g.applyMatrix4(_m); return g; }
  // UV theo mét (texture lặp đúng tỉ lệ): mặt ngang → (x,z); mặt cong quanh tâm (cx,cz) → (cung, y); vách hướng tâm → (bán kính, y)
  function wuv(g,S,cx,cz,R0=128){ const p=g.attributes.position, n=g.attributes.normal, uv=g.attributes.uv;
    for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i), nx=n.getX(i), ny=n.getY(i), nz=n.getZ(i); let u, v;
      if(Math.abs(ny)>.7){ u=x/S; v=z/S; }
      else if(cx!=null){ const dx=x-cx, dz=z-cz, L=Math.hypot(dx,dz)||1; if(Math.abs(nx*dx/L+nz*dz/L)>=.5){ u=Math.atan2(dz,dx)*R0/S; } else u=L/S; v=y/S; }
      else { u=(Math.abs(nx)>Math.abs(nz)?z:x)/S; v=y/S; }
      uv.setXY(i,u,v); } uv.needsUpdate=true; return g; }
  const BOX=new THREE.BoxGeometry(1,1,1), CYL=new THREE.CylinderGeometry(.5,.5,1,16), ICO=new THREE.IcosahedronGeometry(.5,1), SPH=new THREE.SphereGeometry(.5,14,10), CONE=new THREE.ConeGeometry(.5,1,16,1,true),
    ARC=new THREE.TorusGeometry(.5,.1,6,16,Math.PI), RING=new THREE.TorusGeometry(.5,.1,6,20), RINGF=new THREE.TorusGeometry(.5,.1,6,20).rotateX(Math.PI/2);
  // gộp theo vật liệu → 1 lượt vẽ / vật liệu
  function Batch(cx=null,cz=null){ const M=new Map(); const B={ cx, cz,
      add(mat,g){ const S=mat.userData && mat.userData.uvS; if(S) wuv(g,S,B.cx,B.cz); let e=M.get(mat); if(!e) M.set(mat,e=[]); e.push(g); return g; },
      ring(mat,cx,cz,r0,r1,a0,a1,y0,y1,f,step){ const b=Bld(); ring(b,cx,cz,r0,r1,a0,a1,y0,y1,f,step); return B.add(mat,toGeo(b)); },
      surf(mat,cx,cz,r,a0,a1,y0,y1,step){ const b=Bld(); surf(b,cx,cz,r,a0,a1,y0,y1,step); return B.add(mat,toGeo(b)); },
      box(mat,x,y,z,ry,sx,sy,sz){ return B.add(mat,xf(BOX,x,y,z,ry,sx,sy,sz)); },
      cyl(mat,x,y,z,ry,sx,sy,sz){ return B.add(mat,xf(CYL,x,y,z,ry,sx,sy,sz)); },
      geo(mat,g,x,y,z,ry,sx,sy,sz,rx){ return B.add(mat,xf(g,x,y,z,ry,sx,sy,sz,rx)); },
      get size(){ let n=0; for(const l of M.values()) n+=l.length; return n; },
      build(parent,o={}){ const out=[]; for(const [mat,list] of M){ if(!list.length) continue; let g=null; try{ g=list.length===1?list[0]:W.mergeGeometries(list,false); }catch(e){ console.warn('[abyssal_towers] gộp hình', e); } if(!g) continue;
          g.computeBoundingSphere(); const m=new THREE.Mesh(g,mat); m.receiveShadow=o.recv!==false; m.castShadow=!!o.cast && !mat.transparent; if(o.dynamic!==false) m.userData.dynamic=true; if(mat.transparent) m.renderOrder=6; m.name=o.name||'aby-tw'; parent.add(m); out.push(m);
          if(list.length>1) list.forEach(x=>x.dispose()); } M.clear(); return out; } }; return B; }
  // hộp/trụ/cầu đơn vị InstancedMesh (nội thất xuyên kính, đồ lặp) – col: màu từng bản (vật liệu nền trắng trung tính)
  function Emit(){ const sets=new Map(); const put=(sh,mat,x,y,z,ry,sx,sy,sz,col)=>{ const key=sh+'|'+mat.uuid; let e=sets.get(key); if(!e) sets.set(key,e={sh,mat,L:[]}); e.L.push([x,y,z,ry,sx,sy,sz,col]); };
    return { box:(m,x,y,z,ry,sx,sy,sz,col)=>put('box',m,x,y,z,ry,sx,sy,sz,col), cyl:(m,x,y,z,ry,sx,sy,sz,col)=>put('cyl',m,x,y,z,ry,sx,sy,sz,col),
      ico:(m,x,y,z,ry,sx,sy,sz,col)=>put('ico',m,x,y,z,ry,sx,sy,sz,col), sph:(m,x,y,z,ry,sx,sy,sz,col)=>put('sph',m,x,y,z,ry,sx,sy,sz,col), cone:(m,x,y,z,ry,sx,sy,sz,col)=>put('cone',m,x,y,z,ry,sx,sy,sz,col),
      arc:(m,x,y,z,ry,sx,sy,sz,col)=>put('arc',m,x,y,z,ry,sx,sy,sz,col), ring:(m,x,y,z,ry,sx,sy,sz,col)=>put('ring',m,x,y,z,ry,sx,sy,sz,col), ringF:(m,x,y,z,ry,sx,sy,sz,col)=>put('ringF',m,x,y,z,ry,sx,sy,sz,col),
      get count(){ let n=0; for(const e of sets.values()) n+=e.L.length; return n; },
      build(parent,o={}){ const out=[]; for(const e of sets.values()){ const geo={box:BOX,cyl:CYL,ico:ICO,sph:SPH,cone:CONE,arc:ARC,ring:RING,ringF:RINGF}[e.sh], im=new THREE.InstancedMesh(geo,e.mat,e.L.length), anyCol=e.L.some(q=>q[7]!=null);
          e.L.forEach(([x,y,z,ry,sx,sy,sz,col],i)=>{ _q.setFromEuler(_e.set(0,ry||0,0)); _m.compose(_v.set(x,y,z),_q,_s.set(sx,sy,sz)); im.setMatrixAt(i,_m); if(anyCol) im.setColorAt(i,_c.set(col??0xffffff)); });
          im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; if(im.computeBoundingSphere) im.computeBoundingSphere(); else im.frustumCulled=false;
          im.castShadow=!!o.cast; im.receiveShadow=o.recv!==false; im.userData.dynamic=true; if(e.mat.transparent) im.renderOrder=6; im.name=o.name||'aby-tw-inst'; parent.add(im); out.push(im); } sets.clear(); return out; } }; }
  function cvTex(w,h,draw,o={}){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); draw(g,w,h); const t=new THREE.CanvasTexture(c); if(o.srgb!==false) t.colorSpace=THREE.SRGBColorSpace; if(o.rep!==false) t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t; }
  // đá vân: nền + vân lượn + ron tấm
  function stoneTex(base, veins, seed, o={}){ return cvTex(512,512,(g,w)=>{ const r=rng(seed); g.fillStyle=base; g.fillRect(0,0,w,w);
    for(let i=0;i<700;i++){ g.fillStyle=`rgba(${r()<.5?'255,255,255':'0,0,0'},${r()*.05})`; g.beginPath(); g.arc(r()*w,r()*w,2+r()*16,0,TAU); g.fill(); }
    for(let i=0;i<(o.veins??22);i++){ g.strokeStyle=veins[i%veins.length]; g.lineWidth=.5+r()*2; g.globalAlpha=.3+r()*.55; let x=r()*w, y=r()*w; const ang=r()*TAU; g.beginPath(); g.moveTo(x,y); for(let k=0;k<16;k++){ x+=Math.cos(ang+(r()-.5)*1.5)*28; y+=Math.sin(ang+(r()-.5)*1.5)*28; g.lineTo(x,y); } g.stroke(); }
    g.globalAlpha=1; if(o.flecks) for(let i=0;i<o.flecks;i++){ g.fillStyle=o.fleckCol||'#d4af37'; g.globalAlpha=.4+r()*.6; g.fillRect(r()*w,r()*w,1+r()*2,1+r()*2); } g.globalAlpha=1;
    if(o.joint!==false){ g.strokeStyle=o.joint||'rgba(40,32,24,.4)'; g.lineWidth=2; g.strokeRect(1,1,w-2,w-2); g.beginPath(); g.moveTo(w/2,0); g.lineTo(w/2,w); g.moveTo(0,w/2); g.lineTo(w,w/2); g.stroke(); } }); }
  // NPC (khung Xbot đa dạng của people.js) – trả {a, po} hoặc null
  function npc(seed, outfit, name, dot='#ffd27a'){ const people=W.people; if(!people || !W.makeActor) return null;
    try{ const kk=people.kit(seed,{outfit}); const a=W.makeActor(kk.gl,{name, height:kk.h, face:0, clips:kk.clips, compact:false, dot}); a.play('idle',0); a.mixer.update(0); const n={a, po:makePoser(THREE,a), t:Math.random()*5}; return n; }catch(e){ console.warn('[abyssal_towers] NPC', e); return null; } }
  // cúi chào: xoay xương Spine quanh trục phải của nhân vật (k 0..1)
  const _bq=new THREE.Quaternion(), _bw=new THREE.Quaternion(), _bp=new THREE.Quaternion(), _ax=new THREE.Vector3();
  function bow(n,k){ const B=n.po && n.po.bones && n.po.bones.Spine; if(!B || k<=.002) return; const yaw=n.a.g.rotation.y; _ax.set(Math.cos(yaw),0,-Math.sin(yaw)); _bq.setFromAxisAngle(_ax,k*.6);
    B.getWorldQuaternion(_bw); _bw.premultiply(_bq); B.parent.getWorldQuaternion(_bp); B.quaternion.copy(_bp.invert().multiply(_bw)); B.updateMatrixWorld(true); }
  // NHÂN VIÊN ĐỨNG: tay buông + thở + nhìn khách + gật đầu chào khi lại gần + thỉnh thoảng gõ máy / ghi sổ (n.work). Ghi đè xương sau mixer → hết tư thế chữ T.
  const _pa=new THREE.Vector3(), _pb=new THREE.Vector3(), _pd=new THREE.Vector3(), _pq2=new THREE.Quaternion(), _ppq=new THREE.Quaternion(), _pwq=new THREE.Quaternion(), _pI=new THREE.Quaternion(),
    _F=new THREE.Vector3(), _U=new THREE.Vector3(0,1,0), _R=new THREE.Vector3(), _tv=new THREE.Vector3();
  function aimB(bones,name,child,dir,w=1){ const B=bones[name], C=bones[child]; if(!B||!C||!B.parent) return; B.getWorldPosition(_pa); C.getWorldPosition(_pb); _pb.sub(_pa); if(_pb.lengthSq()<1e-10) return; _pb.normalize(); _pd.copy(dir).normalize();
    _pq2.setFromUnitVectors(_pb,_pd); if(w<1) _pq2.slerpQuaternions(_pI,_pq2,w); B.getWorldQuaternion(_pwq); B.parent.getWorldQuaternion(_ppq); _pwq.premultiply(_pq2); B.quaternion.copy(_ppq.invert().multiply(_pwq)); B.updateMatrixWorld(true); }
  const VV=(f,u,r)=>new THREE.Vector3().addScaledVector(_F,f).addScaledVector(_U,u).addScaledVector(_R,r);
  function staff(n,dt,Pp,o={}){ const bones=n.po && n.po.bones; if(!bones || !bones.Hips) return; const g=n.a.g; g.updateMatrixWorld(true); g.getWorldDirection(_F); _F.y=0; if(_F.lengthSq()<1e-6) _F.set(0,0,1); _F.normalize(); _R.set(-_F.z,0,_F.x);
    const t=n.t, gp=g.getWorldPosition(_tv), dx=Pp.x-gp.x, dz=Pp.z-gp.z, dist=Math.hypot(dx,dz), near=dist<6 && Math.abs(Pp.y-gp.y)<2.2;
    if(near && !n.wasNear) n.greet=1.8; n.wasNear=near; if(n.greet>0) n.greet-=dt;
    const typing=o.work && !near && (t%11)<4.2, writing=o.work && !near && !typing && (t%11)>7.5;
    for(const [s,k] of [['Left',-1],['Right',1]]){
      if(typing){ aimB(bones,s+'Arm',s+'ForeArm',VV(.5,-1,k*.12)); aimB(bones,s+'ForeArm',s+'Hand',VV(1,-.15+Math.sin(t*14+k)*.05,-k*.22)); }
      else if(writing && k>0){ aimB(bones,s+'Arm',s+'ForeArm',VV(.45,-1,.1)); aimB(bones,s+'ForeArm',s+'Hand',VV(1,-.35+Math.sin(t*5)*.06,-.35+Math.sin(t*3)*.15)); }
      else if(writing){ aimB(bones,s+'Arm',s+'ForeArm',VV(.4,-1,-.1)); aimB(bones,s+'ForeArm',s+'Hand',VV(1,-.3,.3)); }
      else if(o.present && k>0 && near){ const e=Math.sin(t*1.3); aimB(bones,s+'Arm',s+'ForeArm',VV(.5,.05,.7+e*.15)); aimB(bones,s+'ForeArm',s+'Hand',VV(.4,.35,.8)); }
      else { const sw=Math.sin(t*1.1+k)*.03; aimB(bones,s+'Arm',s+'ForeArm',VV(.05+sw,-1,k*.13)); aimB(bones,s+'ForeArm',s+'Hand',VV(.2+sw,-1,k*.04)); } }
    aimB(bones,'Spine','Spine1',VV(.03+.018*Math.sin(t*1.7),1,0));   /* thở */
    let hu=(typing||writing)?-.55:0, hr=0; if(near){ const lx=dx*_R.x+dz*_R.z, lf=dx*_F.x+dz*_F.z; if(lf>-.5){ hr=Math.max(-.9,Math.min(.9,lx/Math.max(.5,lf))); hu=Math.max(-.3,Math.min(.25,(Pp.y+1.5-(gp.y+1.6))/Math.max(1,dist))); } }
    if(n.greet>0) hu+=Math.sin((1.8-n.greet)*7)*.45*Math.min(1,n.greet);   /* gật đầu chào */
    aimB(bones,'Neck','Head',VV(.12-hu,1,hr*.8)); }
  // cập nhật 1 NPC mỗi khung: mixer + tư thế (ngồi / khoanh tay dùng poser; đứng dùng staff)
  function animate(n,dt,Pp){ n.t=(n.t||0)+dt; try{ n.a.mixer.update(dt); }catch(e){} const k=n.pose||'staff';
    if(k==='type'||k==='lap'||k==='cross'||k==='sit'||k==='eat'){ try{ n.po.apply(k,n.t); }catch(e){} return; }
    staff(n,dt,Pp,{work:!!n.work, present:k==='present'}); if(n.guard) bow(n,n.bk||0); }
  // MỞ KHE lan can của đảo (phiên A) ở lối vào của mình: tắt đoạn chặn + ẩn kính/con tiện/tay vịn trong vùng (chạy lúc dựng, có thể hoàn tác)
  function openGap(test, yLo, yHi, o={}){ const rep={segs:0, inst:0, tris:0}, undo=[];
    for(const s of W.SEGS||[]){ if(s._abyGap || s.y0===undefined || s.y0>1e5 || s.y1<yLo || s.y0>yHi) continue; if(o.msg && !o.msg.test(s.msg||'')) continue;
      if(test((s.ax+s.bx)/2,(s.az+s.bz)/2) && (o.mid || (test(s.ax,s.az) && test(s.bx,s.bz)))){ s._abyGap={y0:s.y0}; undo.push(s); s.y0=1e6; rep.segs++; } }
    if(!rep.segs){ rep.undo=()=>{}; return rep; }   /* phiên A đã mở khe gốc → bỏ qua */
    W.scene.traverse(ob=>{ if(ob.isInstancedMesh){ const pr=ob.geometry.parameters||{}, isRL=pr.width===1 && (Math.abs(pr.height-.95)<1e-6 || Math.abs(pr.height-.05)<1e-6) && pr.depth<.1, isBal=ob.name==='abyssal-balusters'; if(!isRL && !isBal) return; let ch=false;
        for(let i=0;i<ob.count;i++){ ob.getMatrixAt(i,_m); _v.setFromMatrixPosition(_m); if(_v.y<yLo-1 || _v.y>yHi+2.5) continue; if(test(_v.x,_v.z)){ ob.setMatrixAt(i,_m.makeScale(0,0,0)); ch=true; rep.inst++; } } if(ch) ob.instanceMatrix.needsUpdate=true; }
      else if(ob.isMesh && o.meshNames && o.meshNames.includes(ob.name)){ const p=ob.geometry.attributes.position; if(!p || ob.geometry.index) return; let ch=false;
        for(let i=0;i<p.count;i+=3){ const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3, y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3, z=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3; if(y<yLo-1 || y>yHi+2.5 || !test(x,z)) continue; for(let k=1;k<3;k++) p.setXYZ(i+k,p.getX(i),p.getY(i),p.getZ(i)); ch=true; rep.tris++; }
        if(ch){ p.needsUpdate=true; ob.geometry.computeBoundingSphere(); } } });
    rep.undo=()=>{ for(const s of undo){ s.y0=s._abyGap.y0; delete s._abyGap; } }; return rep; }
  function compact(g, keep=()=>false){ g.updateMatrix(); const by=new Map(), kill=[]; g.traverse(o=>{ if(o===g || !o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || keep(o)) return; if(o.parent!==g) return; o.updateMatrix();
      const m=Array.isArray(o.material)?null:o.material; if(!m) return; let e=by.get(m); if(!e) by.set(m,e=[]); e.push(xf(o.geometry,0,0,0).applyMatrix4(o.matrix)); kill.push(o); });
    for(const o of kill) o.removeFromParent(); for(const [m,list] of by){ const mg=list.length===1?list[0]:W.mergeGeometries(list,false); if(!mg) continue; const mesh=new THREE.Mesh(mg,m); mesh.castShadow=false; mesh.receiveShadow=true; mesh.userData.dynamic=true; g.add(mesh); } return g; }
  // items: [{name, desc, price, tag}] → HTML lưới thẻ: tên / mô tả / giá + nút Mua xuống dòng rõ ràng, tự co theo bề rộng bảng
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function cards(items, fmt=String, btn='Mua'){ return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,190px),1fr));gap:10px;overflow-x:hidden;width:100%;box-sizing:border-box">${items.map((it,i)=>`<div style="box-sizing:border-box;min-width:0;display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:rgba(255,255,255,.05)">
      <div style="font-weight:700;font-size:15px;line-height:1.3;overflow-wrap:anywhere;white-space:normal">${esc(it.name)}</div>
      ${it.desc?`<div style="font-size:12.5px;opacity:.78;line-height:1.4;overflow-wrap:anywhere;white-space:normal">${esc(it.desc)}</div>`:''}
      ${it.tag?`<div style="font-size:12px;color:#9fe3ff;line-height:1.3;white-space:normal">${esc(it.tag)}</div>`:''}
      <div style="margin-top:auto;padding-top:4px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap"><span style="color:#ffd27a;font-weight:700;white-space:nowrap">${esc(fmt(it.price))} 💰</span><button class="btn pri" data-i="${i}" style="padding:6px 14px">${esc(btn)}</button></div></div>`).join('')}</div>`; }
  return {Bld, quad, toGeo, ring, surf, xf, wuv, Batch, Emit, cvTex, stoneTex, npc, bow, openGap, compact, cards, esc, staff, animate, BOX, CYL, ICO, SPH};
}

/* ============================== MODULE CHÍNH ============================== */
export async function make(W, ctx={}){
  if(W.abyTowers) return W.abyTowers;
  const ABY=W.ABY, PL=ABY && ABY.plots; if(!PL || !PL.towersW || !PL.towersE) return null;
  const {THREE, scene, P, me, cam, HOOK, INTER, PLACES, toast, makeLabel, teleport, addSeg, addPlat, plats, circles} = W;
  const S=ctx.S||W.__abyS||(W.__abyS={}), save=ctx.save||(()=>{}), askPay=ctx.askPay, spend=ctx.spend, LOW=W.QUAL==='low';
  const ui=()=>ctx.ui||W.ui, fmt=ctx.fmt||(n=>String(n)), K=towerKit(THREE,W);
  let LUX=W.LUX; if(!LUX){ try{ LUX=W.LUX=(await import('./lux_textures.js')).makeLux(THREE); }catch(e){ LUX=null; } }
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.7, ...o});
  const mk=(tok,o,fb)=>{ try{ return LUX.mk(tok,o||{}); }catch(e){ return fb||std(0xb59a74); } };
  const uvs=(m,S2)=>{ m.userData.uvS=S2; return m; };
  /* ---------- VẬT LIỆU (token sang trọng của phiên A + vài texture riêng) ---------- */
  const MT={ trav:uvs(mk('TRAVERTINE_WARM'),2.4), gold:mk('GOLD_CHAMPAGNE'), bronze:mk('TITANIUM_BRONZE'), walnut:uvs(mk('WALNUT_WOOD'),1.6), mahog:uvs(mk('MAHOGANY_DARK'),1.6),
    glow:mk('WARM_GLOW'), teak:uvs(mk('TEAK_DECK'),1.6), emerald:mk('EMERALD_VELVET'), bordeaux:mk('BORDEAUX_VELVET'), sand:uvs(mk('SANDSTONE_TRIM'),2.4), obs:mk('OBSIDIAN_PAVILION'),
    glassS:mk('GLASS_SAPPHIRE',{opacity:.34, color:0x2a6a82}), glassR:new THREE.MeshPhysicalMaterial({color:0xcfe8f5, roughness:.04, metalness:0, transparent:true, opacity:.28, depthWrite:false, side:THREE.DoubleSide}),
    glassC:new THREE.MeshPhysicalMaterial({color:0xd6eef5, roughness:.03, metalness:.05, transparent:true, opacity:.18, depthWrite:false, side:THREE.DoubleSide}),
    plaster:std(0xd9c4a0,{roughness:.92}), dark:std(0x24262b,{roughness:.5, metalness:.3}), copper:std(0xb8693c,{roughness:.3, metalness:.85}), fabric:std(0xffffff,{roughness:.88}),
    paint:std(0xffffff,{roughness:.6}), green:std(0x4f9050,{roughness:.9}), ivy:std(0x4f8f45,{roughness:.95}), pot:std(0x3a3430,{roughness:.6, metalness:.2}),
    screen:new THREE.MeshBasicMaterial({color:0xffffff}), led:new THREE.MeshBasicMaterial({color:0xffffff}), chrome:std(0xd5dbe2,{roughness:.15, metalness:1}),
    crystal:new THREE.MeshStandardMaterial({color:0xfff4dc, emissive:0xffe6b0, emissiveIntensity:.9, roughness:.05, metalness:.2, transparent:true, opacity:.85}) };
  MT.glow.name='aby-glow';
  MT.marble=uvs(new THREE.MeshStandardMaterial({map:K.stoneTex('#d6c6a2',['#b08a4a','#8a7a66','#c9a54a'],51), roughness:.14, metalness:.08}),2.2);
  MT.granite=uvs(new THREE.MeshStandardMaterial({map:K.stoneTex('#151417',['#3a3530','#5a4a30'],52,{flecks:900, veins:8, joint:'rgba(0,0,0,.6)'}), roughness:.22, metalness:.25}),1.2);
  MT.turq=uvs(new THREE.MeshStandardMaterial({map:K.stoneTex('#1e6e68',['#d9e8df','#c9a54a','#0f4440'],53,{veins:26}), roughness:.18, metalness:.1}),2.0);
  MT.marbleD=uvs(new THREE.MeshStandardMaterial({map:K.stoneTex('#3a2a22',['#c9a54a','#6a5040'],54,{veins:18}), roughness:.18, metalness:.1}),2.0);
  MT.carpet=new THREE.MeshStandardMaterial({color:0x8e1b22, roughness:.95});
  MT.wood=uvs(mk('WALNUT_WOOD',{color:0xe8c49a}),1.4);   /* gỗ sáng hơn cho vách ngăn nhìn từ ngoài */
  /* biển chữ phát sáng: 1 atlas cho cả 2 toà (băng rôn 1024×96 ×4 + 16 ô 256×128) */
  const ATL=(()=>{ const c=document.createElement('canvas'); c.width=c.height=1024; const g=c.getContext('2d'); g.fillStyle='#0d0b09'; g.fillRect(0,0,1024,1024); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
    const cell=(x,y,w,h,txt,sub,o={})=>{ const gr=g.createLinearGradient(0,y,0,y+h); gr.addColorStop(0,o.bg0||'#1d1812'); gr.addColorStop(1,o.bg1||'#0b0907'); g.fillStyle=gr; g.fillRect(x,y,w,h); g.strokeStyle=o.edge||'#c9a54a'; g.lineWidth=4; g.strokeRect(x+3,y+3,w-6,h-6);
      g.save(); g.textAlign='center'; g.textBaseline='middle'; g.shadowColor=o.glow||'#ffcf70'; g.shadowBlur=14; g.fillStyle=o.col||'#ffe2a0'; g.font=`700 ${o.fs||Math.round(h*.42)}px Georgia, 'Times New Roman', serif`; g.fillText(txt,x+w/2,y+h*(sub?.4:.53),w-24);
      if(sub){ g.shadowBlur=6; g.font=`600 ${Math.round(h*.2)}px 'Segoe UI', sans-serif`; g.fillStyle=o.subCol||'#f3e3c0'; g.fillText(sub,x+w/2,y+h*.78,w-24); } g.restore(); t.needsUpdate=true;
      return [x/1024, 1-(y+h)/1024, (x+w)/1024, 1-y/1024]; };
    return {t, cell, mat:new THREE.MeshBasicMaterial({map:t, toneMapped:false})}; })();
  const signGeo=(uv,w,h)=>{ const g=new THREE.PlaneGeometry(w,h), a=g.attributes.uv; for(let i=0;i<a.count;i++) a.setXY(i, lerp(uv[0],uv[2],a.getX(i)), lerp(uv[1],uv[3],a.getY(i))); return g; };
  /* vải mái hiên 4 sọc màu (4 dải ngang trong 1 texture) */
  const AWN_COL=['#7a1f2b','#1f3a5f','#3f5f3a','#1d6f6a'];
  MT.awning=new THREE.MeshStandardMaterial({map:K.cvTex(512,512,(g)=>{ for(let k=0;k<4;k++){ for(let i=0;i<16;i++){ g.fillStyle=i%2?'#e6d6b4':AWN_COL[k]; g.fillRect(i*32,k*128,32,128); } g.fillStyle='rgba(0,0,0,.18)'; g.fillRect(0,k*128+118,512,10); } }), roughness:.85, side:THREE.DoubleSide});

  const root=new THREE.Group(); root.name='aby-towers'; scene.add(root);
  const EXT=K.Batch(), EI=K.Emit();   /* vỏ ngoài chung 2 toà + đồ lặp ngoài (bồn cây, thường xuân, rèm, đèn trần) */
  const MYLB=new Set(), lbl=(t,s,o)=>{ const L=makeLabel(t,s,o); MYLB.add(L); return L; };
  const seg=(ax,az,bx,bz,y0,y1,msg,r=.15)=>addSeg(ax,az,bx,bz,r,y0,y1,msg);
  const hasCard=()=>!!(S.abyCard);
  const giveCard=(why)=>{ if(!S.abyCard){ S.abyCard={t:Date.now()}; save(); } toast(why||'💳 Đã nhận THẺ KHÁCH Abyssal – quẹt tự động ở mọi cổng của 2 toà nhà.', 3600); };

  /* ============================== 1. HAI TOÀ: thông số cung + bố cục ============================== */
  const WD=12, SB=1.2, RREF=128, BAL=3.2, COR=3.2, RL=132.8, RH0=131.45, RH1=134.15;
  const COURSES=['Playwright E2E','JMeter Performance','API Testing · REST','Kiểm thử nền tảng','SQL & Database','Mobile Device Farm','Security · ZAP','Game QA Lab','k6 Load Lab','Appium Mobile','Selenium Grid','Accessibility · axe','Contract Testing','Chaos & AI-QA','Robot Framework','Cypress Component'];
  const TW=[PL.towersW, PL.towersE].map((pl,i)=>{ const k=pl.cx<0?'xanh':'do', dN=a=>Math.abs(a-1.5*Math.PI), aN=dN(pl.a0)<dN(pl.a1)?pl.a0:pl.a1, aF=aN===pl.a0?pl.a1:pl.a0, sg=Math.sign(aF-aN)||1;
    const T={i, k, pl, name:pl.name||(k==='xanh'?'QA · QC · QE ACADEMY & TECH HUB':'ABYSSAL HORIZON RESIDENCES'), cx:pl.cx, cz:pl.cz, aN, aF, sg, Ls:Math.abs(aF-aN)*RREF, f7:pl.beachFloor??7, nf:pl.floors, acad:k==='xanh',
      RW:f=>pl.rIn+WD+SB*f, yF:f=>pl.baseY+f*pl.floorH, near:{}, floors:[], shops:[], gates:[], npcs:[], lifts:[] };
    T.Y0=T.yF(T.f7); T.f9=T.f7+2; T.ups=[]; for(let f=T.f9; f<T.nf; f++) T.ups.push(f); T.top=T.nf-1; T.yR=T.yF(T.nf);
    T.R0=T.RW(T.f7)-WD; T.RS=T.R0+3.2; T.RB=T.RW(T.f9)-.2; T.sMid=T.Ls/2;
    T.aAt=s=>T.aN+T.sg*s/RREF; T.P2=(a,r)=>[T.cx+Math.cos(a)*r, T.cz+Math.sin(a)*r]; T.Ps=(s,r)=>T.P2(T.aAt(s),r);
    T.frame=(s,r)=>{ const a=T.aAt(s), o=T.P2(a,r); return {a, s, r, o, t:[-Math.sin(a)*T.sg, Math.cos(a)*T.sg], d:[Math.cos(a), Math.sin(a)]}; };   /* t: gần → xa, d: ra phía vách */
    T.L=(fr,u,v)=>[fr.o[0]+fr.t[0]*u+fr.d[0]*v, fr.o[1]+fr.t[1]*u+fr.d[1]*v];
    T.yaw=(fr,fu,fv)=>Math.atan2(fr.t[0]*fu+fr.d[0]*fv, fr.t[1]*fu+fr.d[1]*fv);
    T.ring=(B,mat,s0,s1,r0,r1,y0,y1,f,step)=>B.ring(mat,T.cx,T.cz,r0,r1,T.aAt(s0),T.aAt(s1),y0,y1,f,step);
    T.surf=(B,mat,s0,s1,r,y0,y1)=>B.surf(mat,T.cx,T.cz,r,T.aAt(s0),T.aAt(s1),y0,y1);
    /* đoạn chặn theo cung (dây cung ≤ 6 m) và theo bán kính */
    T.arcSeg=(r,s0,s1,y0,y1,msg)=>{ const n=Math.max(1,Math.ceil(Math.abs(s1-s0)*r/RREF/6)); for(let k=0;k<n;k++){ const a=T.Ps(s0+(s1-s0)*k/n,r), b=T.Ps(s0+(s1-s0)*(k+1)/n,r); seg(a[0],a[1],b[0],b[1],y0,y1,msg); } };
    T.radSeg=(s,r0,r1,y0,y1,msg)=>{ const a=T.Ps(s,r0), b=T.Ps(s,r1); seg(a[0],a[1],b[0],b[1],y0,y1,msg); };
    /* sàn đứng được: ô chữ nhật theo cung (chừa lỗ giếng thang) */
    T.floorPlats=(r0,r1,y,s0=0,s1=T.Ls,hole=true)=>{ const step=6; for(let s=s0; s<s1-1e-6; s+=step){ const e=Math.min(s1,s+step), parts=[];
        const hs0=T.sMid-2.95*RREF/RL, hs1=T.sMid+2.95*RREF/RL;
        if(hole && e>hs0 && s<hs1 && r1>RH0 && r0<RH1){ if(s<hs0) parts.push([s,hs0,r0,r1]); if(e>hs1) parts.push([hs1,e,r0,r1]); const m0=Math.max(s,hs0), m1=Math.min(e,hs1); if(r0<RH0) parts.push([m0,m1,r0,RH0]); if(r1>RH1) parts.push([m0,m1,RH1,r1]); }
        else parts.push([s,e,r0,r1]);
        for(const [a0,a1,q0,q1] of parts){ if(a1-a0<.05 || q1-q0<.05) continue; const am=T.aAt((a0+a1)/2), rm=(q0+q1)/2, c=T.P2(am,rm), hw=Math.abs(a1-a0)/RREF*q1/2+.06; addPlat(c[0],c[1],Math.atan2(Math.cos(am),Math.sin(am)),hw,(q1-q0)/2+.04,y); } } };
    return T; });

  /* ---------- bố cục cung (s = mét đo ở bán kính 128 từ đầu hồi GẦN tháp Hydro-Pulse) ---------- */
  const ZN=14, SHW=12;
  for(const T of TW){ const sL0=ZN+4*SHW, sL1=T.Ls-sL0; T.sL0=sL0; T.sL1=sL1;
    T.shopS=[ZN, ZN+SHW, ZN+2*SHW, ZN+3*SHW, sL1, sL1+SHW, sL1+2*SHW, sL1+3*SHW];
    const rw=(T.sMid-6-ZN)/5; T.bays=[{kind:'near', s0:0, s1:ZN}]; for(let j=0;j<5;j++) T.bays.push({kind:'room', s0:ZN+j*rw, s1:ZN+(j+1)*rw, j});
    T.bays.push({kind:'lift', s0:T.sMid-6, s1:T.sMid+6}); for(let j=0;j<5;j++) T.bays.push({kind:'room', s0:T.sMid+6+j*rw, s1:T.sMid+6+(j+1)*rw, j:5+j}); T.bays.push({kind:'far', s0:T.Ls-ZN, s1:T.Ls});
    T.dup=duplexDef(T); T.isDupF=f=>f===T.dup.fL || f===T.dup.fL+1; T.inDup=(f,s0,s1)=>T.isDupF(f) && s0>=T.dup.sA-.01 && s1<=T.dup.sB+.01; T.dupRng=f=>T.isDupF(f)?(T.dup.sA<=.01?[[T.dup.sB,T.Ls]]:[[0,T.dup.sA]]):[[0,T.Ls]]; }
  // phòng theo tầng: Học viện (lớp học / bida / pantry / họp / server / lounge) – Residences (căn hộ)
  const ACAD_PLAN={ 0:['class','class','class','class','pantry','class','class','class','class','meeting'], 1:['class','class','server','class','pantry','class','class','class','class','meeting'], 2:['billiard','billiard','lounge','class','pantry','meeting','class','server','class','lounge'] };
  let courseI=0;
  for(const T of TW) for(const f of T.ups){ const k=f-T.f9, y=T.yF(f), rOs=T.RW(f)-WD, rO=f===T.f9?T.R0:rOs, rG=rOs+BAL, rC=T.RW(f)-COR, rW=T.RW(f), yc=T.yF(f+1)-.32;
    const FL={f, k, y, yc, rO, rOs, rG, rC, rW, name:'', rooms:[]}; T.floors.push(FL);
    FL.name=T.acad?['Tầng học thuật · Lớp công cụ kiểm thử','Tầng TestOps · Hiệu năng & Tự động hoá','Sky Billiards Lounge & Phòng họp'][Math.min(2,k)]+(f===10?' · Sảnh vỉa hè +16':'')+(f===11?' · Cầu kính Hydro-Pulse':'')
      :(f===T.top?'Duplex Penthouse':`Sky-Condo ${k+1}`)+(f===10?' · Sảnh vỉa hè +16':'')+(f===11?' · Cầu kính Hydro-Pulse':'');
    let ri=0; for(const b of T.bays){ if(b.kind!=='room') continue; const kind=T.acad?(ACAD_PLAN[Math.min(2,k)]||ACAD_PLAN[0])[ri]:'apt'; ri++; if(T.inDup(f,b.s0,b.s1)) continue;   /* gian thuộc căn duplex */
      const nm=kind==='class'?COURSES[(courseI++)%COURSES.length]:kind==='apt'?`Căn ${f+1}.${String(b.j+1).padStart(2,'0')}${f===T.top?' · Penthouse':''}`:{pantry:'Pantry & Cà phê',meeting:'Phòng họp kính',server:'Server Room · Device Lab',billiard:'Phòng Bida',lounge:'Lounge Sách & Mentoring'}[kind];
      FL.rooms.push({kind, name:nm, s0:b.s0, s1:b.s1}); } }

  /* ============================== 2. VỎ NGOÀI (gộp theo vật liệu) ============================== */
  const CURT=0xe9dcc0, CEIL_N=2;
  for(const T of TW){ EXT.cx=T.cx; EXT.cz=T.cz; const {Y0,R0,RS,RB}=T, Ls=T.Ls, yS=T.yF(T.f9)-.32;   /* yS: mặt dưới sàn tầng 10 = trần tầng đế */
    /* ---- TẦNG ĐẾ (thông tầng +2,3 → +11,3) ---- */
    T.ring(EXT,MT.trav,0,Ls,R0,RS,Y0-.6,Y0+.02);                                   /* sàn hành lang cột phía biển */
    T.ring(EXT,MT.trav,2.6,ZN,RS,RB,Y0-.6,Y0+.02); T.ring(EXT,MT.trav,0,2.6,RS,124.1,Y0-.6,Y0+.02); T.ring(EXT,MT.trav,0,2.6,128.8,RB,Y0-.6,Y0+.02);   /* sảnh phụ gần (chừa mặt cầu kính Hydro) */
    T.ring(EXT,MT.trav,Ls-ZN,Ls,RS,RB,Y0-.6,Y0+.02);
    T.ring(EXT,MT.marble,T.sL0,T.sL1,RS,RB,Y0-.6,Y0+.02);                          /* sàn Marble đại sảnh */
    const SHOPFLOOR=[MT.teak,MT.granite,MT.trav,MT.marble];
    for(let j=0;j<8;j++){ const s0=T.shopS[j]; T.ring(EXT,SHOPFLOOR[[0,1,2,3,0,1,2,3][j]],s0,s0+SHW,RS,RB,Y0-.6,Y0+.02); }
    /* trần shophouse (+5,5) + trần sảnh phụ */ for(let j=0;j<8;j++){ const s0=T.shopS[j]; T.ring(EXT,MT.plaster,s0,s0+SHW,RS,RB,Y0+5.52,Y0+5.62,{t:false}); }
    /* tường sau tầng đế + vách ngăn giữa các gian (thạch cao ấm) */ T.ring(EXT,MT.plaster,0,Ls,RB,RB+.3,Y0,yS,{e:false});
    const PART=[0,...T.shopS,T.shopS[3]+SHW,T.sL1,T.shopS[7]+SHW,Ls].filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a-b);
    for(const s of PART){ if(s<=.01 || s>=Ls-.01) continue; const lob=Math.abs(s-T.sL0)<.01 || Math.abs(s-T.sL1)<.01, h=lob?yS:Y0+5.52;
      T.ring(EXT,MT.plaster,s-.15,s+.15,RS,RB,Y0,h,{}); if(!lob) T.ring(EXT,MT.trav,s-.15,s+.15,RS,RB,Y0+5.62,yS,{}); T.radSeg(s,RS,RB,Y0-.4,Y0+5,'🧱 Vách ngăn shophouse'); }
    /* đầu hồi tầng đế (đá Travertine): gần – cửa cầu kính Hydro r 124,1–128,8; xa – kín */
    for(const [s,door] of [[0,true],[Ls,false]]){ const e=s===0?1:-1, a=s, b=s+e*.4; if(door){ T.ring(EXT,MT.trav,a,b,128.8,RB+.3,Y0,yS); T.ring(EXT,MT.trav,a,b,RS,124.1,Y0,yS); T.ring(EXT,MT.trav,a,b,124.1,128.8,Y0+3.6,yS); T.radSeg(s+e*.2,RS,124.1,Y0-.4,Y0+4,'🧱 Đầu hồi toà nhà'); T.radSeg(s+e*.2,128.8,RB,Y0-.4,Y0+4,'🧱 Đầu hồi toà nhà'); }
      else { T.ring(EXT,MT.trav,a,b,RS,RB+.3,Y0,yS); T.radSeg(s+e*.2,RS,RB,Y0-.4,Y0+4,'🧱 Đầu hồi toà nhà'); } }
    T.arcSeg(RB-.2,0,Ls,Y0-.4,Y0+6,'🧱 Tường sau tầng đế');
    /* mặt tiền trên shophouse (+7,9 → trần) + gờ phào vàng */ T.ring(EXT,MT.trav,0,ZN,RS-.3,RS,Y0+5.62,yS,{e:false}); T.ring(EXT,MT.trav,T.shopS[0],T.sL0,RS-.3,RS,Y0+5.62,yS,{e:false}); T.ring(EXT,MT.trav,T.sL1,Ls-ZN,RS-.3,RS,Y0+5.62,yS,{e:false}); T.ring(EXT,MT.trav,Ls-ZN,Ls,RS-.3,RS,Y0+5.62,yS,{e:false});
    T.ring(EXT,MT.gold,0,Ls,RS-.42,RS-.28,Y0+5.62,Y0+5.8,{});
    /* cột hành lang (Travertine + chân/đầu cột vàng) – chừa cổng vòm sảnh */ { const cs=[]; for(let s=3; s<Ls-1; s+=6) if(Math.abs(s-T.sMid)>6.4) cs.push(s);
      for(const s of cs){ const c=T.Ps(s,R0+.3); EXT.cyl(MT.trav,c[0],(Y0+yS)/2,c[1],0,.56,yS-Y0,.56); EXT.cyl(MT.gold,c[0],Y0+.15,c[1],0,.7,.3,.7); EXT.cyl(MT.gold,c[0],yS-.2,c[1],0,.76,.4,.76); circles.push({x:c[0], z:c[1], r:.3, y0:Y0-.5, y1:yS}); } }
    /* gian sảnh phụ 2 đầu: mặt tiền mở, lan can không cần (cùng mặt bằng); biển chỉ dẫn */
    /* ---- SÂN TAM CẤP + CỔNG VÒM HOÀNG GIA (trước đại sảnh) ---- */
    { const s0=T.sMid-7.5, s1=T.sMid+7.5; T.ring(EXT,MT.trav,s0,s1,116.6,R0,Y0-.6,Y0+.02); for(let k=1;k<=3;k++) T.ring(EXT,MT.sand,s0+.3*k,s1-.3*k,116.6-.4*k,116.6-.4*(k-1),Y0-.6-.2*k,Y0+.02-.2*k);
      T.floorPlats(116.6,R0,Y0+.02,s0,s1,false); for(let k=1;k<=3;k++) T.floorPlats(116.6-.4*k,116.6-.4*(k-1),Y0+.02-.2*k,s0+.3*k,s1-.3*k,false);
      const fr=T.frame(T.sMid,119.55), ry=T.yaw(fr,0,-1), sh=new THREE.Shape(); sh.moveTo(-5.7,0); sh.lineTo(-3.05,0); sh.lineTo(-3.05,5.3); sh.absarc(0,5.3,3.05,Math.PI,0,true); sh.lineTo(3.05,0); sh.lineTo(5.7,0); sh.lineTo(5.7,10.4); sh.lineTo(-5.7,10.4); sh.closePath();
      const ag=new THREE.ExtrudeGeometry(sh,{depth:1.1, bevelEnabled:true, bevelThickness:.06, bevelSize:.06, bevelSegments:2, curveSegments:28}); ag.translate(0,0,-.55);
      EXT.geo(MT.trav,ag,fr.o[0],Y0,fr.o[1],ry); ag.dispose();
      const pts=[]; pts.push(new THREE.Vector3(-3.2,0,.64)); for(let i=0;i<=24;i++){ const t=Math.PI-i/24*Math.PI; pts.push(new THREE.Vector3(Math.cos(t)*3.2,5.3+Math.sin(t)*3.2,.64)); } pts.push(new THREE.Vector3(3.2,0,.64));
      const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'centripetal'),80,.11,8,false); EXT.geo(MT.gold,tg,fr.o[0],Y0,fr.o[1],ry); tg.dispose();
      const K2=(lx,ly,lz,sx,sy,sz,m=MT.gold)=>{ const c=[fr.o[0]+fr.t[0]*lx-fr.d[0]*lz, fr.o[1]+fr.t[1]*lx-fr.d[1]*lz]; EXT.box(m,c[0],Y0+ly,c[1],ry,sx,sy,sz); };
      K2(0,8.75,.6,.8,1.1,.3); K2(0,10.45,0,11.8,.22,1.3); K2(-4.4,5.2,.6,.22,10,.12); K2(4.4,5.2,.6,.22,10,.12);   /* đá khoá + phào đỉnh + 2 gờ đứng */
      const sgUV=ATL.cell(0,T.i*96,1024,96,T.acad?'QA · QC · QE ACADEMY':'ABYSSAL HORIZON RESIDENCES',T.acad?'& TECH HUB · GRAND LOBBY':'GRAND LOBBY · SKY-CONDO',{fs:46});
      const sp=signGeo(sgUV,9.4,.9); const sc=[fr.o[0]-fr.d[0]*.62, fr.o[1]-fr.d[1]*.62]; EXT.geo(ATL.mat,sp,sc[0],Y0+9.55,sc[1],ry); sp.dispose();
      for(const e of [-1,1]){ const b=T.L(fr,e*5.7,0), c=T.L(fr,e*3.05,0); seg(c[0],c[1],b[0],b[1],Y0-.4,Y0+4,'🏛️ Trụ cổng vòm – đi qua lòng vòm',.55); }
      T.portal={fr, ry}; }
    /* ---- MẶT TIỀN ĐẠI SẢNH: vách kính 2 tầng + cửa 6 m ---- */
    { const sA=T.sL0, sB=T.sL1, sd0=T.sMid-3*RREF/RS, sd1=T.sMid+3*RREF/RS;
      T.surf(EXT,MT.glassC,sA+.15,sd0,RS,Y0,yS); T.surf(EXT,MT.glassC,sd1,sB-.15,RS,Y0,yS); T.surf(EXT,MT.glassC,sd0,sd1,RS,Y0+4.6,yS);
      T.arcSeg(RS,sA,sd0,Y0-.4,Y0+4,'🪟 Vách kính đại sảnh – vào qua cổng vòm giữa'); T.arcSeg(RS,sd1,sB,Y0-.4,Y0+4,'🪟 Vách kính đại sảnh – vào qua cổng vòm giữa');
      for(let s=sA+3; s<sB-1; s+=3.2){ if(s>sd0-.4 && s<sd1+.4) continue; const c=T.Ps(s,RS); EXT.box(MT.bronze,c[0],(Y0+yS)/2,c[1],-T.aAt(s),.16,yS-Y0,.12); }
      for(const y of [Y0+4.6,Y0+7.4]) T.ring(EXT,MT.bronze,sA,sB,RS-.06,RS+.06,y-.05,y+.05,{});
      for(const s of [sd0,sd1]){ const c=T.Ps(s,RS); EXT.box(MT.gold,c[0],Y0+2.3,c[1],-T.aAt(s),.24,4.6,.22); } }
    /* ---- 16 SHOPHOUSE: trụ ốp đá, kính, cửa 4,2 m, băng biển hiệu, mái hiên ---- */
    for(let j=0;j<8;j++){ const s0=T.shopS[j], s1=s0+SHW, sc=s0+SHW/2, cat=[0,1,2,3,1,0,3,2][j], fac=[MT.granite,MT.copper,MT.teak,MT.turq][cat], dw=4.2*RREF/RS/2, dS0=sc-dw, dS1=sc+dw;
      T.shops.push({j, s0, s1, sc, cat});
      T.ring(EXT,fac,s0+.15,s0+.85,RS-.25,RS,Y0,Y0+5.62,{}); T.ring(EXT,fac,s1-.85,s1-.15,RS-.25,RS,Y0,Y0+5.62,{});    /* 2 trụ ốp */
      T.ring(EXT,fac,s0+.85,s1-.85,RS-.42,RS,Y0+4.45,Y0+5.62,{});                                                    /* băng biển hiệu */
      T.surf(EXT,MT.glassC,s0+.85,dS0,RS-.06,Y0,Y0+4.45); T.surf(EXT,MT.glassC,dS1,s1-.85,RS-.06,Y0,Y0+4.45); T.surf(EXT,MT.glassC,dS0,dS1,RS-.06,Y0+3.7,Y0+4.45);
      for(const s of [dS0,dS1]){ const c=T.Ps(s,RS-.06); EXT.box(MT.bronze,c[0],Y0+1.85,c[1],-T.aAt(s),.16,3.7,.14); } { const c=T.Ps(sc,RS-.06); EXT.box(MT.bronze,c[0],Y0+3.72,c[1],-T.aAt(sc),.16,.12,4.4); }
      for(const s of [s0+.85+(dS0-s0-.85)/2, dS1+(s1-.85-dS1)/2]){ const c=T.Ps(s,RS-.06); EXT.box(MT.bronze,c[0],Y0+2.2,c[1],-T.aAt(s),.1,4.4,.08); }
      T.arcSeg(RS-.06,s0+.15,dS0,Y0-.4,Y0+4,'🛍️ Kính mặt tiền shophouse – vào bằng cửa kính 4,2 m'); T.arcSeg(RS-.06,dS1,s1-.15,Y0-.4,Y0+4,'🛍️ Kính mặt tiền shophouse – vào bằng cửa kính 4,2 m');
      /* mái hiên vòm vải kiểu Pháp: 1 tấm cong che cửa + 2 cửa sổ */ { const fr=T.frame(sc,RS-.45), W2=(SHW-2.2)/2, n=7, B=K.Bld(), uvA=[];
        for(let i=0;i<n;i++){ const t0=i/n, t1=(i+1)/n, pr=t=>[-Math.sin(t*Math.PI/2)*1.55, Y0+4.35-(1-Math.cos(t*Math.PI/2))*.95];
          const [o0,h0]=pr(t0), [o1,h1]=pr(t1), Pp=(u,o,h)=>{ const q=T.L(fr,u,o); return [q[0],h,q[1]]; }, nn=[-fr.d[0]*.6,.8,-fr.d[1]*.6];
          K.quad(B,Pp(-W2,o0,h0),Pp(W2,o0,h0),Pp(W2,o1,h1),Pp(-W2,o1,h1),nn); for(let q=0;q<6;q++) uvA.push(0,0); }
        const g=K.toGeo(B), uv=g.attributes.uv, pp=g.attributes.position; for(let i=0;i<uv.count;i++){ const x=pp.getX(i), z=pp.getZ(i), u=((x-fr.o[0])*fr.t[0]+(z-fr.o[1])*fr.t[1]+W2)/(2*W2); uv.setXY(i,u*(2*W2/4.8), (3-cat)*.25+.02+.21*((pp.getY(i)-(Y0+3.4))/.95)); }
        EXT.add(MT.awning,g); for(const e of [-1,1]){ const c=T.L(fr,e*W2,-1.5); EXT.box(MT.bronze,c[0],Y0+3.42,c[1],-T.aAt(sc),.05,.05,.05); } }
      /* biển chữ nổi phát sáng */ { const nm=SHOP_NAMES[T.i*8+j], uv=ATL.cell((j%4)*256, 400+(T.i*2+Math.floor(j/4))*128, 256, 128, nm, SHOP_CAT[cat].tag, {fs:34}); const fr=T.frame(sc,RS-.45), sp=signGeo(uv,5.2,1.0), c=T.L(fr,0,-.03); EXT.geo(ATL.mat,sp,c[0],Y0+5.03,c[1],T.yaw(fr,0,-1)); sp.dispose(); }
      /* tường sau gian: dải đèn hắt ấm (nhìn từ biển thấy gian sáng) */ T.ring(EXT,MT.glow,s0+1.2,s1-1.2,RB-.06,RB-.02,Y0+4.6,Y0+4.75,{});
      for(let q=0;q<2;q++){ const c=T.Ps(s0+3+q*6,(RS+RB)/2); EI.box(MT.glow,c[0],Y0+5.47,c[1],-T.aAt(s0+3+q*6),5.2,.04,1.0); } }
    /* ---- CÁC TẦNG TRÊN ---- */
    for(const FL of T.floors){ const {f,y,yc,rO,rOs,rG,rC,rW}=FL, top=f===T.top, hs0=T.sMid-2.95*RREF/RL, hs1=T.sMid+2.95*RREF/RL, liftG=rOs+1.2;
      /* sàn (chừa giếng thang) + phào vàng mép sàn + mép sàn ngoài cùng */
      const slab=(r0,r1)=>{ T.ring(EXT,MT.trav,0,hs0,r0,r1,y-.32,y); T.ring(EXT,MT.trav,hs1,T.Ls,r0,r1,y-.32,y); if(r0<RH0) T.ring(EXT,MT.trav,hs0,hs1,r0,Math.min(r1,RH0),y-.32,y); if(r1>RH1) T.ring(EXT,MT.trav,hs0,hs1,Math.max(r0,RH1),r1,y-.32,y); };
      if(f===11){ /* tầng 12: chừa mặt cầu kính Hydro-Pulse cắm vào đầu hồi gần (r 129–133, 2,6 m đầu) */ T.ring(EXT,MT.trav,0,2.6,rO,128.9,y-.32,y); T.ring(EXT,MT.trav,0,2.6,133.1,rW+.3,y-.32,y); T.ring(EXT,MT.trav,2.6,hs0,rO,rW+.3,y-.32,y); T.ring(EXT,MT.trav,hs1,T.Ls,rO,rW+.3,y-.32,y); T.ring(EXT,MT.trav,hs0,hs1,rO,RH0,y-.32,y); T.ring(EXT,MT.trav,hs0,hs1,RH1,rW+.3,y-.32,y); }
      else if(f===T.dup.fL+1){ for(const [a,b] of T.dupRng(f)){ const pp=(x0,x1,q0,q1)=>{ if(x1-x0>.01 && q1-q0>.01) T.ring(EXT,MT.trav,x0,x1,q0,q1,y-.32,y); }; pp(a,Math.min(b,hs0),rO,rW+.3); pp(Math.max(a,hs1),b,rO,rW+.3); const m0=Math.max(a,hs0), m1=Math.min(b,hs1); if(m1>m0){ pp(m0,m1,rO,RH0); pp(m0,m1,RH1,rW+.3); } } }
      else slab(rO,rW+.3);
      T.ring(EXT,MT.gold,0,T.Ls,rO-.14,rO+.06,y-.44,y+.05,{});
      /* lan can kính ban công + tay vịn vàng */ T.surf(EXT,MT.glassR,0,T.Ls,rO+.12,y,y+1.0); T.ring(EXT,MT.gold,0,T.Ls,rO+.08,rO+.16,y+1.0,y+1.07,{});
      T.arcSeg(rO+.12,0,T.Ls,y-.4,y+1.5,'🌿 Lan can ban công vườn treo');
      /* tường sau (trong: thạch cao ấm, ngoài: Travertine) – chừa đoạn căn duplex (căn xây lùi sâu hơn) */ for(const [a,b] of T.dupRng(f)){ T.ring(EXT,MT.plaster,a,b,rW-.02,rW,y,yc,{t:false,b:false,o:false,e:false}); T.ring(EXT,MT.trav,a,b,rW,rW+.3,y,yc+.32,{i:false});
      T.arcSeg(rW-.2,a,b,y-.4,y+3.5,'🧱 Tường sau – sát vách núi'); }
      /* từng gian: vách kính + cửa trượt + đố đồng + rèm + đèn trần + vách gỗ + vách hành lang */
      for(const b of T.bays){ if(T.inDup(f,b.s0,b.s1)) continue; const isRoom=b.kind==='room', far10=b.kind==='far' && f===10, gl=b.kind==='lift'?liftG:far10?rO+.35:rG, sc=(b.s0+b.s1)/2, dW=2.6*RREF/gl/2, door=b.kind!=='lift';
        const sA=b.s0+.12, sB=b.s1-.12; if(door && !far10){ T.surf(EXT,MT.glassS,sA,sc-dW,gl,y,yc); T.surf(EXT,MT.glassS,sc+dW,sB,gl,y,yc); T.surf(EXT,MT.glassS,sc-dW,sc+dW,gl,y+2.7,yc);
          T.arcSeg(gl,sA,sc-dW,y-.4,y+3.5,'🪟 Vách kính – ra ban công bằng cửa kính trượt'); T.arcSeg(gl,sc+dW,sB,y-.4,y+3.5,'🪟 Vách kính – ra ban công bằng cửa kính trượt');
          for(const s of [sc-dW,sc+dW]){ const c=T.Ps(s,gl); EXT.box(MT.bronze,c[0],y+1.35,c[1],-T.aAt(s),.14,2.7,.1); } { const c=T.Ps(sc,gl); EXT.box(MT.bronze,c[0],y+2.72,c[1],-T.aAt(sc),.14,.1,2.7); } }
        else { T.surf(EXT,MT.glassS,sA,sB,gl,y,yc); T.arcSeg(gl,sA,sB,y-.4,y+3.5,far10?'🪟 Vách kính sảnh vỉa hè':'🪟 Vách kính sảnh thang máy'); }
        for(let s=sA+2.9; s<sB-.6; s+=2.9){ if(door && !far10 && Math.abs(s-sc)<dW+.4) continue; const c=T.Ps(s,gl); EXT.box(MT.bronze,c[0],(y+yc)/2,c[1],-T.aAt(s),.12,yc-y,.08); }
        T.ring(EXT,MT.bronze,sA,sB,gl-.05,gl+.05,y+3.05,y+3.12,{});
        for(const s of [sA+.45,sB-.45]){ const c=T.Ps(s,gl+.16); EI.box(MT.fabric,c[0],(y+yc)/2,c[1],-T.aAt(s),.06,yc-y-.1,.8,CURT); }   /* rèm lụa 2 mép kính */
        for(let q=0;q<CEIL_N;q++){ const s=b.s0+(b.s1-b.s0)*(q+.5)/CEIL_N, c=T.Ps(s,(gl+(isRoom?rC:rW))/2); EI.box(MT.glow,c[0],yc-.05,c[1],-T.aAt(s),1.1,.05,2.6); }   /* trần đèn ấm 2700K */
        { const c=T.Ps(b.s0,gl-.08); EI.box(MT.glow,c[0],y+2.4,c[1],-T.aAt(b.s0),.06,.32,.18); }   /* đèn tường hắt mỗi gian */
        if(isRoom){ T.ring(EXT,MT.wood,sA,sc-dW,rC-.06,rC+.06,y,yc,{}); T.ring(EXT,MT.wood,sc+dW,sB,rC-.06,rC+.06,y,yc,{}); T.ring(EXT,MT.wood,sc-dW,sc+dW,rC-.06,rC+.06,y+2.7,yc,{});
          T.arcSeg(rC,sA,sc-dW,y-.4,y+3.5,'🚪 Vách phòng – vào bằng cửa từ hành lang'); T.arcSeg(rC,sc+dW,sB,y-.4,y+3.5,'🚪 Vách phòng – vào bằng cửa từ hành lang'); } }
      /* vách ngăn gỗ giữa các gian (từ kính tới hành lang; gian sảnh thang / sảnh phụ mở ra hành lang) */
      for(let bi=1; bi<T.bays.length; bi++){ const L2=T.bays[bi-1], R2=T.bays[bi], s=R2.s0, glOf=b=>b.kind==='lift'?liftG:(b.kind==='far'&&f===10)?rO+.35:rG, g0=Math.min(glOf(L2),glOf(R2)), r1=(L2.kind==='room'||R2.kind==='room')?rC:rC; if(T.isDupF(f) && s>=T.dup.sA-.01 && s<=T.dup.sB+.01) continue;
        T.ring(EXT,MT.wood,s-.1,s+.1,g0,r1,y,yc,{}); T.radSeg(s,g0,r1,y-.4,y+3.5,'🧱 Vách ngăn phòng');
      }
      /* đầu hồi tầng: gần (tầng 12 có cửa cầu kính Hydro r 129–133), xa (tầng 11 có cổng vòm ra vỉa hè +16) */
      for(const [s,e] of [[0,1],[T.Ls,-1]]){ if(T.isDupF(f) && Math.abs(s-T.dup.gable)<.01) continue; const a=s, b=s+e*.4, nearDoor=s===0 && f===11, farDoor=s===T.Ls && f===10, gStart=farDoor?rO+.1:rG;
        if(nearDoor){ T.ring(EXT,MT.trav,a,b,rG,129.0,y,yc); T.ring(EXT,MT.trav,a,b,133.0,rW+.3,y,yc); T.ring(EXT,MT.trav,a,b,129.0,133.0,y+3.3,yc); T.radSeg(s+e*.2,rG,129.0,y-.4,y+3.5,'🧱 Đầu hồi toà nhà'); T.radSeg(s+e*.2,133.0,rW,y-.4,y+3.5,'🧱 Đầu hồi toà nhà'); }
        else if(farDoor){ T.ring(EXT,MT.trav,a,b,133.3,rW+.3,y,yc); T.ring(EXT,MT.trav,a,b,rO+.1,133.3,y+3.9,yc); T.radSeg(s+e*.2,133.3,rW,y-.4,y+3.5,'🧱 Đầu hồi toà nhà'); }
        else { T.ring(EXT,MT.trav,a,b,gStart,rW+.3,y,yc); T.radSeg(s+e*.2,gStart,rW,y-.4,y+3.5,'🧱 Đầu hồi toà nhà'); }
        if(!farDoor){ T.radSeg(s+e*.15,rO+.12,gStart,y-.4,y+1.5,'🌿 Lan can đầu ban công'); T.ring(EXT,MT.gold,s,s+e*.06,rO+.12,gStart,y+1.0,y+1.07,{}); } }
      /* bồn cây ban công + thường xuân rủ xuống mép sàn */
      const rnd=rng(T.i*97+f*13); for(let s=1.8; s<T.Ls-1; s+=LOW?5.4:3.6){ const c=T.Ps(s,rO+.42), a=T.aAt(s); EI.box(MT.pot,c[0],y+.22,c[1],-a,.42,.44,.95); EI.ico(MT.green,c[0],y+.62,c[1],-a,.55,.5,1.05);
        if(!LOW){ for(const ds of [-.8,.9]){ const L=1.1+rnd()*1.8, q=T.Ps(s+ds,rO-.12); EI.box(MT.ivy,q[0],y-.35-L/2,q[1],-T.aAt(s+ds),.05,L,.38); } } }
      FL.liftG=liftG; FL.hs=[hs0,hs1]; }
    /* ---- MÁI + BIỂN TÊN TRÊN NÓC ---- */
    { const fT=T.top, rO=T.RW(fT)-WD+1.2, rW=T.RW(fT)+.6, y=T.yR; T.ring(EXT,MT.trav,0,T.Ls,rO,rW,y-.32,y+.1); T.ring(EXT,MT.gold,0,T.Ls,rO-.12,rO+.08,y-.42,y+.15,{}); T.ring(EXT,MT.trav,0,T.Ls,rO,rO+.3,y+.1,y+1.0,{}); T.ring(EXT,MT.gold,0,T.Ls,rO-.04,rO+.34,y+1.0,y+1.08,{});
      const fr=T.frame(T.sMid,rO+2.2), uv=ATL.cell(0,(2+T.i)*96,1024,96,T.name,null,{fs:52}), sp=signGeo(uv,36,3.4); EXT.geo(ATL.mat,sp,fr.o[0],y+2.8,fr.o[1],T.yaw(fr,0,-1)); sp.dispose();
      for(const e of [-14,-5,5,14]){ const c=T.L(fr,e,.15); EXT.box(MT.bronze,c[0],y+1.4,c[1],-T.aAt(T.sMid),.12,2.8,.12); }
      T.lb=lbl((T.acad?'🎓 ':'🏙️ ')+T.name, T.acad?'Học viện 12 tầng · sảnh + 8 shophouse ở tầng 8 ngang bãi cát · tầng 11 nối vỉa hè +16':'Chung cư 14 tầng · Grand Lobby tầng 8 · thuê căn hộ ở quầy lễ tân', {h:.7, x:fr.o[0], y:y+7, z:fr.o[1], fade:230}); }
  }
  /* vách kính ngăn ban công riêng (Residences, sảnh thang) */
  for(const T of TW) for(const FL of T.floors){ const {f,y,rO}=FL, liftG=FL.liftG, rG=FL.rG;
    for(let bi=1; bi<T.bays.length; bi++){ const L2=T.bays[bi-1], R2=T.bays[bi], s=R2.s0, glOf=b=>b.kind==='lift'?liftG:(b.kind==='far'&&f===10)?rO+.35:rG, g0=Math.min(glOf(L2),glOf(R2)); if(T.isDupF(f) && s>T.dup.sA+.01 && s<T.dup.sB-.01) continue;
      const glassDiv=(!T.acad && (L2.kind==='room' || R2.kind==='room')) || L2.kind==='lift' || R2.kind==='lift' || (f===10 && (L2.kind==='far'||R2.kind==='far'));
      if(!glassDiv || g0<=rO+.4) continue; EXT.cx=T.cx; EXT.cz=T.cz; T.ring(EXT,MT.glassR,s-.03,s+.03,rO+.15,g0,y,y+2.2,{}); T.ring(EXT,MT.gold,s-.05,s+.05,rO+.15,g0,y+2.2,y+2.27,{}); T.radSeg(s,rO+.12,g0,y-.4,y+2.6,'🌿 Vách kính ngăn ban công riêng'); } }

  /* ============================== 3. SÀN ĐỨNG ĐƯỢC + CẦU NỐI VỈA HÈ ============================== */
  const CONN=[];
  for(const T of TW){ T.floorPlats(T.R0,T.RB,T.Y0+.02);
    for(const FL of T.floors) for(const [a,b] of T.dupRng(FL.f)) T.floorPlats(FL.rO,FL.rW,FL.y,a,b);
    /* tầng 11: sàn nối từ đầu hồi xa sang đầu vỉa hè kè +16 (đúng mép tường chắn cuối kè của phiên A) */
    const fl10=T.floors.find(q=>q.f===10); if(fl10){ const A=ABY.A||146, BZ=ABY.Bz||130, CZ=(ABY.center&&ABY.center.z)??-15, D=Math.PI/180, fb=T.k==='do'?-9.03:-170.97;
      const phi=(x,z)=>Math.atan2((z-CZ)/BZ,x/A)/D, aWall=r=>{ let lo=T.aF, hi=T.aF+T.sg*.06; for(let k=0;k<40;k++){ const m=(lo+hi)/2, p=T.P2(m,r), dd=((phi(p[0],p[1])-fb+540)%360)-180; if((T.k==='do'?dd<0:dd>0)) lo=m; else hi=m; } return lo; };
      const r0=124.95, r1=133.25, y=16.0, c0=T.P2(T.aF,r0), c1=T.P2(T.aF,r1), d1=T.P2(aWall(r1),r1), d0=T.P2(aWall(r0),r0), B=K.Bld();
      K.quad(B,[c0[0],y,c0[1]],[c1[0],y,c1[1]],[d1[0],y,d1[1]],[d0[0],y,d0[1]],[0,1,0]); K.quad(B,[c0[0],y-.5,c0[1]],[c1[0],y-.5,c1[1]],[d1[0],y-.5,d1[1]],[d0[0],y-.5,d0[1]],[0,-1,0]); EXT.cx=T.cx; EXT.cz=T.cz; EXT.add(MT.trav,K.toGeo(B));
      const am=(T.aF+aWall(129))/2, cm=T.P2(am,(r0+r1)/2), ln=Math.abs(aWall(129)-T.aF)*129; addPlat(cm[0],cm[1],Math.atan2(Math.cos(am),Math.sin(am)),ln/2+.5,(r1-r0)/2,y);
      seg(c0[0],c0[1],d0[0],d0[1],y-.4,y+1.6,'🌊 Lan can cầu nối vỉa hè – bên dưới là bãi cát'); seg(c1[0],c1[1],d1[0],d1[1],y-.4,y+1.6,'🚧 Lan can cầu nối vỉa hè'); T.surf(EXT,MT.glassR,T.Ls,T.Ls+(aWall(r0)-T.aF)*T.sg*RREF+.4,r0,y,y+1.0); T.ring(EXT,MT.gold,T.Ls,T.Ls+(aWall(r0)-T.aF)*T.sg*RREF+.4,r0-.04,r0+.04,y+1.0,y+1.07,{});
      CONN.push({T, line:[d0,d1], c:cm}); } }

  /* ============================== 4. THANG MÁY + CỔNG QUẸT THẺ ============================== */
  const GATES=[];
  function makeGate(T, pts, y, n, name, lanes){ /* pts: [[x,z] đầu, [x,z] cuối] đường cổng; lanes: [[t0,t1]] (0..1 dọc đường) là làn có cánh kính; n: pháp tuyến hướng vào khu an ninh */
    const [A,B]=pts, L=Math.hypot(B[0]-A[0],B[1]-A[1]), G={T, y, n, name, c:[(A[0]+B[0])/2,(A[1]+B[1])/2], segs:[], k:0, open:false, posts:[], flaps:[], lanes:[]}, at=t=>[A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t];
    const cuts=[0]; for(const [t0,t1] of lanes){ cuts.push(t0,t1); } cuts.push(1);
    for(let i=0;i<cuts.length;i+=2){ const a=at(cuts[i]), b=at(cuts[i+1]); if(Math.hypot(b[0]-a[0],b[1]-a[1])>.05) seg(a[0],a[1],b[0],b[1],y-.4,y+2.4,'🛂 Vách kính an ninh – đi qua cổng quẹt thẻ'); G.posts.push([a,b]); }
    for(const [t0,t1] of lanes){ const a=at(t0), b=at(t1), s=seg(a[0],a[1],b[0],b[1],y-.4,y+2.4,`💳 ${name} – quẹt thẻ để qua (thẻ khách miễn phí: bấm E)`); G.segs.push(s); G.lanes.push([a,b]); circles.push({x:a[0], z:a[1], r:.16, y0:y-.4, y1:y+1.3}, {x:b[0], z:b[1], r:.16, y0:y-.4, y1:y+1.3}); }
    G.len=L; G.pts=pts; GATES.push(G); T.gates.push(G);
    INTER.push({x:G.c[0], z:G.c[1], r:3.4, prio:.75, when:()=>Math.abs(P.y-y)<1.5 && !hasCard(), label:`💳 ${name} – nhận THẺ KHÁCH miễn phí để qua cổng (E)`, action:()=>giveCard()});
    return G; }
  for(const T of TW){ const fls=[{y:T.Y0, name:'Tầng 8 · Đại sảnh & Shophouse', short:'G'}]; for(const FL of T.floors) fls.push({y:FL.y, name:`Tầng ${FL.f+1} · ${FL.name}`, short:String(FL.f+1)});
    const c=T.Ps(T.sMid,RL), a=T.aAt(T.sMid); T.lifts=makeLiftBank(W,{x:c[0], z:c[1], yaw:Math.atan2(-Math.cos(a),-Math.sin(a)), count:2, name:T.acad?'Thang Academy':'Thang Horizon', color:0xd4af37, floors:fls});
    /* cổng sảnh chính: đường r = 128 ngang đại sảnh, 3 làn giữa */ { const rG2=128, sA=T.sL0+.2, sB=T.sL1-.2, A=T.Ps(sA,rG2), B=T.Ps(sB,rG2), Lg=(sB-sA)*rG2/RREF, mid=.5, h=2.85/Lg;
      makeGate(T,[A,B],T.Y0,[Math.cos(a),Math.sin(a)],'Cổng quẹt thẻ đại sảnh',[[mid-1.5*h+.125/Lg,mid-.5*h-.125/Lg],[mid-.5*h+.125/Lg,mid+.5*h-.125/Lg],[mid+.5*h+.125/Lg,mid+1.5*h-.125/Lg]]); }
    /* tầng 11 – cổng vòm đầu hồi xa (từ vỉa hè +16) */ { const FL=T.floors.find(q=>q.f===10); if(FL){ const s=T.Ls-1.2, A=T.Ps(s,FL.rO+.1), B=T.Ps(s,133.3), Lg=133.2-FL.rO, t0=(124.5-FL.rO-.1)/Lg, w=2.6/Lg, p=.25/Lg, aa=T.aAt(s);
        makeGate(T,[A,B],FL.y,[Math.sin(aa)*T.sg,-Math.cos(aa)*T.sg],'Cổng quẹt thẻ sảnh vỉa hè',[[t0,t0+w],[t0+w+p,t0+2*w+p],[t0+2*w+2*p,t0+3*w+2*p]]); } }
    /* tầng 12 – cổng ở đầu cầu kính Hydro-Pulse (đầu hồi gần) */ { const FL=T.floors.find(q=>q.f===11); if(FL){ const s=3.0, A=T.Ps(s,FL.rG), B=T.Ps(s,FL.rW), Lg=FL.rW-FL.rG, t0=(129.7-FL.rG)/Lg, aa=T.aAt(s);
        makeGate(T,[A,B],FL.y,[-Math.sin(aa)*T.sg,Math.cos(aa)*T.sg],'Cổng quẹt thẻ cầu kính',[[t0,t0+2.6/Lg]]); } }
    const gg=new THREE.Group(); gg.name='aby-tw-gates-'+T.k; gg.visible=false; root.add(gg); T.near.gates={g:gg, built:true};
    for(const G of T.gates) if(Math.abs(G.y-T.Y0)>1) buildGateVis(G,EXT); }

  /* ============================== 5. NỘI THẤT XUYÊN KÍNH (InstancedMesh, mỗi toà 1 bộ) ============================== */
  const COLS={ sofa:[0x8a4a26,0x2f4f3f,0x5a1e28,0x4a5a6a], art:[0xc94f3a,0x2f7fb0,0xe0b040,0x6a3f8a,0x2e8a6a], shirt:[0x2f5fa0,0xb03a4a,0x2f8a5a,0xd8a030,0x4a4a58] };
  function furnish(E, T, FL, room, near=false){ const {y, rG, rC}=FL, s0=room.s0, s1=room.s1, sc=(s0+s1)/2, fr=T.frame(sc,rG), wR=(s1-s0)*rG/RREF-.5, dep=rC-rG, hw=wR/2, r=rng(Math.round(sc*31+FL.f*7));
    const at=(u,v)=>T.L(fr,u,v), Y=(h)=>y+h, yaw=(fu,fv)=>T.yaw(fr,fu,fv), face=(fu,fv)=>yaw(fu,fv);
    const box=(m,u,v,h,sx,sy,sz,fu=0,fv=-1,col)=>{ const c=at(u,v); E.box(m,c[0],Y(h),c[1],face(fu,fv),sx,sy,sz,col); };
    const cyl=(m,u,v,h,sx,sy,sz,col)=>{ const c=at(u,v); E.cyl(m,c[0],Y(h),c[1],0,sx,sy,sz,col); };
    const ico=(m,u,v,h,sx,sy,sz,col)=>{ const c=at(u,v); E.ico(m,c[0],Y(h),c[1],0,sx,sy,sz,col); };
    const plant=(u,v,s=1)=>{ cyl(MT.pot,u,v,.3*s,.5*s,.6*s,.5*s); ico(MT.green,u,v,.95*s,.9*s,.9*s,.9*s); ico(MT.green,u+.15,v-.1,1.4*s,.6*s,.7*s,.6*s); };
    switch(room.kind){
      case 'class': case 'server': { const srv=room.kind==='server';
        box(MT.screen,-hw+.12,dep/2,2.0,3.4,1.7,.06,1,0,0xdcecff); box(MT.dark,-hw+.08,dep/2,2.0,3.6,1.9,.04,1,0);      /* bảng slide sáng trên vách gần */
        for(const ru of srv?[]:[-1.4,.7,2.8]) for(const rv of [1.1,2.6,4.1]){ if(rv>dep-.8) continue; box(MT.wood,ru,rv,.74,1.3,.05,.75,-1,0); box(MT.dark,ru,rv,.37,1.1,.7,.06,-1,0); box(MT.screen,ru-.18,rv,1.0,.62,.36,.04,1,0,r()<.5?0x9fd8ff:0xbfffd0); box(MT.dark,ru+.55,rv,.44,.48,.08,.48,-1,0,0x2a2c33); box(MT.dark,ru+.8,rv,.75,.48,.6,.05,-1,0,0x2a2c33); box(MT.dark,ru+.55,rv,.21,.06,.42,.06,-1,0,0x2a2c33); }
        const nr=srv?6:1; for(let q=0;q<nr;q++){ const u=srv?-hw+1.6+q*1.25:hw-.5, v=srv?dep/2:dep-.7; box(MT.dark,u,v,1.0,.62,2.0,1.0,0,-1,0x1c1e24); for(let l=0;l<6;l++) box(MT.led,u+.25,v-.52,.3+l*.3,.04,.03,.03,0,-1,[0x40ff90,0xffb040,0x40c8ff][l%3]); }
        if(srv){ for(let q=0;q<4;q++) box(MT.dark,-hw+1.6+q*1.6,dep-.6,.95,.9,.05,.6,0,-1); }
        plant(hw-.6,.6,.9); break; }
      case 'billiard': { for(const u of [-hw/2+.4, hw/2-.4]){ box(MT.wood,u,dep/2,.62,2.9,.4,1.5,1,0); box(MT.fabric,u,dep/2,.84,2.6,.05,1.2,1,0,0x0d7a4f); for(const du of [-.7,0,.7]) ico(MT.glow,u,dep/2+du,1.95,.2,.12,.2); box(MT.gold,u,dep/2,2.2,1.9,.05,.08,1,0); }
        box(MT.wood,0,dep-.35,1.0,2.4,2.0,.4,0,-1); for(let q=0;q<6;q++) box(MT.fabric,-.9+q*.36,dep-.5,1.3,.08,1.2,.08,0,-1,0xd8b27a); plant(hw-.5,.5); plant(-hw+.5,.5); break; }
      case 'pantry': { box(MT.marbleD,0,dep-.45,.46,wR-1.2,.92,.7,0,-1); box(MT.dark,hw-1,dep-.45,1.0,.7,2.0,.7,0,-1,0x30343a); box(MT.chrome,-1,dep-.5,1.1,.45,.4,.35,0,-1); box(MT.glow,0,dep-.05,2.2,wR-1.4,.05,.1,0,-1);
        for(const u of [-2,1.2]){ cyl(MT.marbleD,u,dep/2-.3,1.05,.8,.05,.8); cyl(MT.bronze,u,dep/2-.3,.52,.08,1.04,.08); for(const du of [-.6,.6]) cyl(MT.emerald,u+du,dep/2-.3,.75,.42,.08,.42); } plant(-hw+.5,.6,1.1); break; }
      case 'meeting': { box(MT.glassR,0,dep/2,.76,Math.min(5,wR-2.5),.04,1.5,0,-1); box(MT.bronze,0,dep/2,.38,.9,.74,.12,0,-1);
        for(let q=0;q<4;q++) for(const sv of [-1,1]){ box(MT.fabric,-1.8+q*1.2,dep/2+sv*1.1,.5,.5,.9,.5,0,-sv,0x3a3d44); }
        box(MT.screen,hw-.1,dep/2,1.7,2.0,1.1,.05,-1,0,0xcfe6ff); plant(-hw+.5,.5); break; }
      case 'lounge': { for(const [u,v,w2] of [[-1.5,dep-1,2.6],[1.8,dep-1,2.2]]){ box(MT.emerald,u,v,.42,w2,.84,.9,0,-1); box(MT.emerald,u,v+.35,.8,w2,.9,.2,0,-1); }
        cyl(MT.marbleD,0,1.8,.45,1.1,.06,1.1); box(MT.wood,-hw+.25,dep/2,1.4,2.6,2.8,.4,1,0); for(let q=0;q<10;q++) box(MT.fabric,-hw+.48,dep/2-1.1+q*.24,.9+(q%3)*.7,.16,.5,.2,1,0,COLS.art[q%5]); plant(hw-.6,.6,1.1); plant(hw-.6,dep-.6); break; }
      case 'apt': { const pent=FL.f===T.top;
        box(MT.fabric,-hw/2,dep/2+.2,.02,3.0,.02,2.2,1,0,0x7a2a2a);                                       /* thảm */
        box(MT.fabric,-hw/2-.2,dep-.6,.42,2.6,.84,.9,0,-1,COLS.sofa[r()*4|0]); box(MT.fabric,-hw/2+1.25,dep-1.4,.42,.9,.84,1.6,0,-1,COLS.sofa[r()*4|0]);   /* sofa chữ L */
        box(MT.marbleD,-hw/2,dep/2,.4,1.2,.08,.7,1,0); box(MT.dark,-hw+.12,dep/2,1.5,1.7,.95,.06,1,0); box(MT.screen,-hw+.16,dep/2,1.5,1.58,.85,.02,1,0,r()<.5?0x6fb8ff:0xffd08a);   /* bàn trà + TV bật sáng */
        cyl(MT.bronze,-hw+.6,dep-.5,.8,.05,1.6,.05); ico(MT.glow,-hw+.6,dep-.5,1.65,.32,.38,.32);       /* đèn cây vàng ấm */
        box(MT.wood,.35,dep/2+.8,1.3,dep-1.6,2.6,.12,1,0);                                                 /* vách lửng ngăn phòng ngủ */
        box(MT.fabric,hw-1.15,dep/2,.32,2.1,.5,2.2,-1,0,0xd2c2a6); box(MT.fabric,hw-1.15,dep/2,.6,2.0,.16,2.1,-1,0,0xb8a888); box(MT.wood,hw-.1,dep/2,.85,2.3,1.5,.12,-1,0);   /* giường King */
        box(MT.paint,hw-.16,dep/2,2.2,1.1,.8,.04,-1,0,COLS.art[r()*5|0]);                                   /* tranh */
        for(const dv of [-1.45,1.45]) box(MT.wood,hw-.4,dep/2+dv,.3,.5,.55,.45,-1,0);
        /* ban công riêng: Jacuzzi + 2 ghế tắm nắng + cây */ { const bv=-(rG-FL.rO)/2-.1; cyl(MT.trav,-hw/2,bv,.36,2.2,.72,2.2); cyl(MT.fabric,-hw/2,bv,.7,1.9,.05,1.9,0x3fc4c8);
          for(const du of [1.4,2.4]) box(MT.fabric,du,bv,.24,.68,.32,1.85,0,-1,0xd8c49a); plant(hw-.5,bv,.9); }
        if(pent){ box(MT.dark,-hw/2+.5,1.2,.5,1.5,1,.6,1,0,0x101010); } break; } } }
  for(const T of TW){ const E=K.Emit(); for(const FL of T.floors) for(const rm of FL.rooms) furnish(E,T,FL,rm);
    /* sảnh phụ + sảnh thang các tầng: sofa, cây, quầy */ for(const FL of T.floors) for(const b of T.bays){ if(b.kind==='room' || T.inDup(FL.f,b.s0,b.s1)) continue; const fr=T.frame((b.s0+b.s1)/2,b.kind==='lift'?FL.liftG:FL.rG), y=FL.y;
      const put=(m,u,v,h,sx,sy,sz,col)=>{ const c=T.L(fr,u,v); E.box(m,c[0],y+h,c[1],T.yaw(fr,0,-1),sx,sy,sz,col); };
      if(b.kind==='lift'){ put(MT.wood,-5,1.2,.45,1.4,.9,.6,0x8a5a34); put(MT.wood,5,1.2,.45,1.4,.9,.6); const p=T.L(fr,-4.6,2.6); E.ico(MT.green,p[0],y+.9,p[1],0,.9,1.1,.9); }
      else { put(MT.emerald,0,(FL.rW-FL.rG)/2,.42,2.6,.84,.9); put(MT.marbleD,0,(FL.rW-FL.rG)/2-1.2,.4,1.1,.08,.6); const p=T.L(fr,-3,1); E.ico(MT.green,p[0],y+1,p[1],0,1,1.2,1); } }
    T.far=new THREE.Group(); T.far.name='aby-tw-far-'+T.k; T.far.visible=false; root.add(T.far); E.build(T.far,{recv:false}); }

  /* ============================== 6. GOM VỎ NGOÀI ============================== */
  EXT.cx=null; EXT.cz=null; const extMeshes=EXT.build(root,{name:'aby-tw-ext', cast:true, dynamic:false}); EI.build(root,{name:'aby-tw-ext-inst'});
  for(const m of extMeshes) if(m.material===MT.trav || m.material===MT.plaster) m.castShadow=true;
  /* ============================== 6b. DUPLEX PENTHOUSE (js/abyssal_penthouse.js) ============================== */
  let PH=[]; try{ PH=buildPenthouses({W,THREE,K,MT,TW,root,seg,addPlat,circles,INTER,P,toast,S,save,lbl,PLACES,teleport,LOW}); }catch(e){ console.warn('[abyssal_towers] duplex penthouse', e); }

  /* ============================== 7. SHOPHOUSE: dữ liệu + nội thất gần + E mua đồ ============================== */
  const SHOPS=[]; for(const T of TW) for(const sh of T.shops){ const fr=T.frame(sh.sc,T.RS), cat=SHOP_CAT[sh.cat], nm=SHOP_NAMES[T.i*8+sh.j];
    const o={T, j:sh.j, cat:sh.cat, name:nm, kind:cat.kind, fr, door:T.L(fr,0,-1.2), inside:T.L(fr,0,3), counter:T.L(fr,3.4,8.6), y:T.Y0, half:sh.j<4?0:1, built:false, clerk:null};
    SHOPS.push(o); lbl(`${cat.icon} ${nm}`, `${cat.kind} · bấm E ở quầy thu ngân`, {h:.36, x:o.door[0], y:T.Y0+6.5, z:o.door[1], fade:45});
    /* đồ đặt cố định có va chạm: quầy thu ngân */ { const a=T.L(fr,2.3,8.1), b=T.L(fr,4.6,8.1); seg(a[0],a[1],b[0],b[1],T.Y0-.4,T.Y0+1.2,'🧾 Quầy thu ngân'); }
    INTER.push({x:o.counter[0], z:o.counter[1], r:2.6, prio:.8, when:()=>Math.abs(P.y-T.Y0)<1.6, label:`${cat.icon} ${nm} – xem hàng & mua (E)`, action:()=>openShop(o)}); }
  // Nội thất 1 gian (toạ độ cục bộ: u ngang mặt tiền, v sâu vào trong 0…11). E = bộ InstancedMesh (null: chỉ đăng ký va chạm – chạy 1 lần lúc nạp)
  function shopInterior(E, o, solid){ const T=o.T, fr=o.fr, y=T.Y0, cat=o.cat, r=rng(o.j*17+T.i*5+3), at=(u,v)=>T.L(fr,u,v), F=(fu,fv)=>T.yaw(fr,fu,fv), hw=v=>6*(T.RS+v)/RREF-.17;
    const put=(sh,m,u,v,h,sx,sy,sz,fu=0,fv=-1,col)=>{ if(!E) return; const c=at(u,v); E[sh](m,c[0],y+h,c[1],F(fu,fv),sx,sy,sz,col); };
    const box=(m,u,v,h,sx,sy,sz,fu,fv,col)=>put('box',m,u,v,h,sx,sy,sz,fu,fv,col), cyl=(m,u,v,h,sx,sy,sz,col)=>put('cyl',m,u,v,h,sx,sy,sz,0,-1,col), ico=(m,u,v,h,sx,sy,sz,col)=>put('ico',m,u,v,h,sx,sy,sz,0,-1,col);
    const SEG=(u0,v0,u1,v1,msg,top=1.9)=>{ if(!solid) return; const a=at(u0,v0), b=at(u1,v1); seg(a[0],a[1],b[0],b[1],y-.4,y+top,msg); };
    const CIRC=(u,v,rr,top=1.6)=>{ if(!solid) return; const c=at(u,v); circles.push({x:c[0], z:c[1], r:rr, y0:y-.4, y1:y+top}); };
    const RECT=(u0,v0,u1,v1,msg,top)=>{ SEG(u0,v0,u1,v0,msg,top); SEG(u1,v0,u1,v1,msg,top); SEG(u1,v1,u0,v1,msg,top); SEG(u0,v1,u0,v0,msg,top); };
    /* ---- món hàng hình thật (đơn giản nhưng nhận ra được), đặt tại (u,v) mặt kệ cao h, mặt hướng (fu,fv) ---- */
    const shoe=(u,v,h,fu,fv,col,heel)=>{ const L=.27; box(MT.dark,u,v,h+.012,.095,.024,L,fu,fv,0x1c1814); put('sph',MT.paint,u+fu*.045,v+fv*.045,h+.05,.095,.075,.19,fu,fv,col);
      put('box',MT.paint,u-fu*.08,v-fv*.08,h+.075,.09,.1,.09,fu,fv,col); if(heel) cyl(MT.dark,u-fu*.11,v-fv*.11,h-.03,.025,.09,.025,0x1c1814); };
    const bag=(u,v,h,fu,fv,col)=>{ box(MT.paint,u,v,h+.11,.3,.22,.12,fu,fv,col); box(MT.gold,u,v,h+.2,.06,.025,.13,fu,fv); put('arc',MT.paint,u,v,h+.22,.2,.24,.2,fu,fv,col); };
    const belt=(u,v,h,col)=>{ put('ringF',MT.paint,u,v,h+.02,.22,.25,.22,0,-1,col); box(MT.gold,u,v-.11,h+.03,.05,.03,.035,0,-1); };
    const glasses=(u,v,h,fu,fv,col)=>{ cyl(MT.dark,u,v,h+.05,.05,.1,.05,0x2a2a2e); for(const e of [-1,1]){ const su=fv?e*.045:0, sv=fu?e*.045:0; put('ring',MT.paint,u+su,v+sv,h+.12,.08,.06,.08,fu,fv,col); } box(MT.gold,u,v,h+.13,.03,.008,.008,fu,fv); };
    const watch=(u,v,h,fu,fv)=>{ put('ring',MT.dark,u,v,h+.06,.11,.1,.11,fu,fv,0x2a2420); put('cyl',MT.gold,u,v,h+.06,.06,.02,.06,fu,fv); };
    const cup=(u,v,h,col)=>{ cyl(MT.paint,u,v,h+.06,.08,.12,.08,col); put('ring',MT.paint,u+.05,v,h+.07,.05,.05,.05,1,0,col); };
    const phones=(u,v,h,fu,fv)=>{ put('arc',MT.dark,u,v,h+.1,.16,.2,.16,fu,fv,0x2a2c33); for(const e of [-1,1]){ const su=fv?e*.08:0, sv=fu?e*.08:0; put('cyl',MT.paint,u+su,v+sv,h+.06,.06,.045,.06,fu,fv,0x3a3d44); } };
    const keychain=(u,v,h,col)=>{ put('ring',MT.gold,u,v,h+.05,.05,.05,.05,0,-1); ico(MT.paint,u,v,h+.0,.05,.06,.05,col); };
    const croissant=(u,v,h)=>{ put('arc',MT.paint,u,v,h+.02,.16,.12,.24,1,0,0xd9a066); };
    const cake=(u,v,h,col)=>{ cyl(MT.paint,u,v,h+.05,.16,.1,.16,col); cyl(MT.paint,u,v,h+.11,.16,.02,.16,0xf2e6d0); ico(MT.paint,u,v,h+.135,.035,.035,.035,0xc0283a); };
    const loaf=(u,v,h)=>{ put('sph',MT.paint,u,v,h+.06,.3,.13,.14,0,-1,0xc8823e); };
    const shirt=(u,v,h,fu,fv,col)=>{ box(MT.paint,u,v,h,.05,.62,.4,fu,fv,col); box(MT.paint,u,v,h+.27,.05,.1,.56,fu,fv,col); box(MT.chrome,u,v,h+.36,.02,.02,.3,fu,fv); };
    const dress=(u,v,h,fu,fv,col)=>{ put('cone',MT.paint,u,v,h-.1,.42,.85,.2,fu,fv,col); box(MT.paint,u,v,h+.38,.05,.22,.26,fu,fv,col); box(MT.chrome,u,v,h+.52,.02,.02,.3,fu,fv); };
    /* kệ tường: lưng kệ sát vách bên (side ±1), từ v0→v1, các tầng ở cao hs[], sâu 'deep' – trả về hàm đặt món trên từng tầng */
    const wallShelf=(side,v0,v1,hs,deep=.42,led=true)=>{ const vm=(v0+v1)/2, L=v1-v0, uw=u=>side*(hw(u)-deep/2), fu=-side, top=hs[hs.length-1]+.35;
      box(MT.wood,side*(hw(vm)-.02),vm,top/2,L,top,.03,fu,0); for(const h of hs){ box(MT.wood,uw(vm),vm,h,L,.035,deep,fu,0); if(led) box(MT.glow,uw(vm)-side*(deep/2-.02),vm,h-.025,L-.1,.015,.02,fu,0); }
      for(const vv of [v0,v1]) box(MT.wood,uw(vv),vv,top/2,.04,top,deep,fu,0); box(MT.wood,uw(vm),vm,top,L,.05,deep,fu,0);
      SEG(side*(hw(v0)-deep-.03),v0,side*(hw(v1)-deep-.03),v1,'🛍️ Kệ trưng bày sát tường',top);
      return (fn,n=6)=>{ hs.forEach((h,k)=>{ for(let q=0;q<n;q++){ const vv=v0+.35+(L-.7)*(n>1?q/(n-1):.5); fn(side*(hw(vv)-deep/2),vv,h+.018,fu,0,k,q); } }); }; };
    /* quầy thu ngân (đã có va chạm cố định) + máy tính tiền + đèn rọi trần */ box(cat===2?MT.marbleD:MT.wood,3.45,8.6,.55,2.4,1.1,.8,0,-1); box(MT.marble,3.45,8.6,1.12,2.5,.06,.9,0,-1); box(MT.dark,3.1,8.6,1.3,.4,.3,.3,0,-1);
    for(let q=0;q<6;q++) cyl(MT.glow,-4+q*1.6,2+((q%2)*4),5.46,.22,.04,.22);
    if(cat===0){ /* THỜI TRANG LUXURY: 4 ma-nơ-canh sau kính, 2 dãy giá treo sát tường, bàn đảo áo gấp, 2 phòng thử rèm nhung + gương LED */
      for(const u of [-4.4,-3.2,3.2,4.4]){ cyl(MT.dark,u,1.0,.04,.5,.08,.5); cyl(MT.chrome,u,1.0,.5,.04,.9,.04); const col=COLS.shirt[r()*5|0]; put('cone',MT.paint,u,1.0,1.05,.46,.75,.34,0,-1,col); cyl(MT.paint,u,1.0,1.48,.34,.14,.24,col); ico(MT.paint,u,1.0,1.68,.2,.24,.2,0xd8c6a8); CIRC(u,1.0,.32); }
      for(const side of [-1,1]){ const v0=2.4, v1=8.4, vm=(v0+v1)/2, uu=v=>side*(hw(v)-.32); box(MT.wood,side*(hw(vm)-.02),vm,1.1,v1-v0,2.2,.03,-side,0); box(MT.chrome,uu(vm),vm,1.75,v1-v0,.03,.03,-side,0); box(MT.chrome,uu(vm),vm,1.0,v1-v0,.03,.03,-side,0);
        for(let q=0;q<12;q++){ const v=v0+.3+q*(v1-v0-.6)/11, col=COLS.shirt[(q+o.j)%5]; if(q%2) shirt(uu(v),v,1.38,-side,0,col); else dress(uu(v),v,.95-.0,-side,0,col); }
        SEG(side*(hw(v0)-.62),v0,side*(hw(v1)-.62),v1,'👗 Giá treo đồ sát tường',2.1); }
      box(MT.wood,0,5,.45,1.8,.9,1.0,0,-1); for(let q=0;q<6;q++) box(MT.paint,-.6+(q%3)*.6,4.75+(q>2?.5:0),.93,.4,.07,.32,0,-1,COLS.shirt[q%5]); RECT(-.95,4.45,.95,5.55,'👕 Bàn đảo áo gấp',1);
      for(const u of [-4.6,-2.6]){ box(MT.wood,u-.95,10.0,1.2,1.6,2.4,.08,1,0); box(MT.bordeaux,u,9.25,1.2,1.7,2.3,.06,0,-1); box(MT.glow,u,10.8,1.3,.9,1.9,.04,0,-1); } SEG(-5.8,9.1,-1.6,9.1,'🪞 Phòng thử đồ (rèm nhung)',2.3); }
    else if(cat===1){ /* GIÀY DÉP & PHỤ KIỆN: 2 kệ tường phát sáng 4 tầng (giày, túi, thắt lưng, kính, đồng hồ), bục kính xoay, 3 ghế đôn thử giày */
      const SC=[0x1c1814,0x6e3a1e,0xd8c6a8,0x8e1b22,0x2f4f8f,0xc9a54a];
      wallShelf(-1,2.0,8.6,[.3,.75,1.2,1.65])((u,v,h,fu,fv,k,q)=>{ shoe(u,v,h,fu,fv,SC[(q+k)%6],(k+q)%3===0); },9);
      wallShelf(1,2.0,8.6,[.3,.75,1.2,1.65])((u,v,h,fu,fv,k,q)=>{ if(k===0) bag(u,v,h,fu,fv,SC[q%6]); else if(k===1) belt(u,v,h,SC[(q+1)%6]); else if(k===2) glasses(u,v,h,fu,fv,[0x1c1c1c,0x6e3a1e,0xc9a54a][q%3]); else watch(u,v,h,fu,fv); },6);
      cyl(MT.glassR,0,4.6,.5,1.1,1.0,1.1); cyl(MT.gold,0,4.6,1.03,1.2,.06,1.2); o.spin=at(0,4.6); CIRC(0,4.6,.62,1.1);
      box(MT.dark,0,10.6,1.25,5.5,2.5,.25,0,-1,0x2a2224); box(MT.glow,0,10.45,2.3,5.2,.04,.04,0,-1); for(let q=0;q<5;q++){ bag(-2+q,10.38,1.0,0,-1,SC[(q+2)%6]); shoe(-2.2+q*1.1,10.38,1.6,0,-1,SC[q%6],q%2===0); } SEG(-2.9,10.2,2.9,10.2,'👜 Tủ trưng bày',2.4);
      for(const u of [-2,0,2]){ cyl(MT.emerald,u,7.0,.23,.8,.46,.8); CIRC(u,7.0,.42,.5); } }
    else if(cat===2){ /* TIỆM BÁNH & BISTRO: quầy kính cong bày bánh, lò nướng, menu điện tử, kệ bánh mì sát tường, 4 bộ bàn ghế */
      box(MT.marbleD,-1.5,7.6,.48,5,.95,.9,0,-1); box(MT.glassR,-1.5,7.35,1.25,5,.6,.5,0,-1); for(let q=0;q<12;q++){ const u=-3.7+q*.4; if(q%3===0) croissant(u,7.55,.97); else cake(u,7.55,.97,[0xd9a066,0xe07a9a,0x6a3f2a,0xf2d29c][q%4]); } RECT(-4.05,7.1,1.05,8.1,'🥐 Quầy kính bánh ngọt',1.3);
      box(MT.dark,-3,10.3,1.2,2.2,2.2,1.0,0,-1,0x2a2a2e); box(MT.glow,-3,9.78,1.0,1.2,.5,.04,0,-1); box(MT.screen,1.5,10.75,2.6,3.2,1.2,.05,0,-1,0x2a2014); SEG(-4.2,9.75,-1.8,9.75,'🔥 Lò nướng',2.2);
      wallShelf(1,2.0,6.4,[.5,1.0,1.5],.45)((u,v,h)=>loaf(u,v,h),5);
      for(const [u,v] of [[-1.4,2.8],[-3.7,2.8],[-1.4,5.2],[-3.7,5.2]]){ cyl(MT.marble,u,v,.74,.8,.05,.8); cyl(MT.bronze,u,v,.37,.08,.72,.08); for(const du of [-.7,.7]){ box(MT.wood,u+du,v,.45,.42,.06,.42,-Math.sign(du),0); box(MT.wood,u+du*1.3,v,.75,.42,.6,.05,-Math.sign(du),0); } cyl(MT.paint,u,v,.86,.07,.16,.07,0xd96a4a); CIRC(u,v,.95,1); } }
    else { /* TRÀ SỮA · CAFE · LƯU NIỆM: quầy Marble, kệ tường cốc/móc khoá/tai nghe/túi quà, sofa chờ */
      box(MT.turq,-.5,8.2,.55,4.6,1.1,.85,0,-1); box(MT.chrome,-1.6,8.4,1.3,.5,.45,.4,0,-1); for(let q=0;q<4;q++) cup(-2.4+q*.35,8.25,1.13,[0xe6d2b4,0x9fd8c8,0xd8b27a,0xf2c4c4][q]); box(MT.screen,-.5,10.75,2.8,3.4,1.1,.05,0,-1,0x1d4a46); RECT(-2.8,7.75,1.8,8.65,'🧋 Quầy trà sữa',1.3);
      const GC=[0xe0b040,0x2f7fb0,0xc94f3a,0x2e8a6a,0xd8c6a8,0x6a3f8a];
      wallShelf(-1,2.2,6.8,[.6,1.1,1.6],.4)((u,v,h,fu,fv,k,q)=>{ if(k===0) cup(u,v,h,GC[q%6]); else if(k===1) keychain(u,v,h+.04,GC[(q+2)%6]); else phones(u,v,h,fu,fv); },6);
      wallShelf(1,2.2,6.8,[.6,1.1,1.6],.4)((u,v,h,fu,fv,k,q)=>{ if(k===2) cup(u,v,h,GC[q%6]); else bag(u,v,h,fu,fv,GC[(q+k)%6]); },5);
      box(MT.emerald,-1.75,3.6,.42,2.4,.84,.9,0,1); box(MT.emerald,-1.75,3.25,.8,2.4,.9,.2,0,1); cyl(MT.marbleD,-1.75,4.6,.45,.7,.05,.7); RECT(-3.0,3.1,-.5,4.1,'🛋️ Sofa chờ',.9); CIRC(-1.75,4.6,.38,.6); }
    ico(MT.green,-5.2,10.3,1.1,.9,1.3,.9); cyl(MT.pot,-5.2,10.3,.35,.6,.7,.6); CIRC(-5.2,10.3,.38); }
  for(const o of SHOPS) shopInterior(null,o,true);   /* va chạm kệ/quầy/ghế đôn… có ngay từ lúc nạp */
  for(const T of TW) for(const half of [0,1]){ const g=new THREE.Group(); g.name=`aby-tw-shops-${T.k}-${half}`; g.visible=false; root.add(g); T.near['shops'+half]={g, built:false}; }
  function buildShops(T, half){ const N=T.near['shops'+half]; if(N.built) return N; N.built=true; const E=K.Emit(); for(const o of SHOPS) if(o.T===T && o.half===half) shopInterior(E,o,false); E.build(N.g,{recv:true});
    for(const o of SHOPS) if(o.T===T && o.half===half && o.spin){ const g=new THREE.Group(); g.position.set(o.spin[0],T.Y0+1.15,o.spin[1]); const sh=new THREE.Mesh(new THREE.BoxGeometry(.32,.12,.12),MT.copper); sh.position.y=.08; g.add(sh); N.g.add(g); o.spinG=g; }
    return N; }
  function openShop(o){ const U=ui(), C=SHOP_CAT[o.cat]; if(!U || !U.modal){ toast(`${C.icon} ${o.name} – tạm chưa mở quầy.`, 2400); return; }
    const m=U.modal(`${C.icon} ${o.name}`); m.body.innerHTML=`<div style="opacity:.8;margin-bottom:10px;line-height:1.45">${K.esc(C.kind)} · ${o.T.acad?'tầng đế Học viện':'tầng đế Residences'} · thanh toán bằng 💰, nhận túi giấy cầm tay</div>`+K.cards(C.items.map(([n,p,d,buff])=>({name:n, desc:d, price:p, tag:buff?'⚡ khoẻ hơn 5 phút':''})),fmt);
    m.body.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{ const [n,p,d,buff]=C.items[+b.dataset.i]; m.close(); const go=()=>{ S.abyShop=S.abyShop||{n:0, last:[]}; S.abyShop.n++; S.abyShop.last=[n,...(S.abyShop.last||[])].slice(0,12);
        if(buff){ S.buffs=S.buffs||{}; S.buffs[buff]=Math.max(Date.now(),S.buffs[buff]||0)+5*60000; } save(); carryBag(C.bag); toast(`🛍️ Đã mua ${n} tại ${o.name}${buff?' – ⚡ khoẻ hơn 5 phút':''}. Túi giấy trên tay!`, 3400); };
      if(askPay) askPay(p, `${C.icon} Mua <b>${n}</b> tại ${o.name}`, ()=>{ if(spend && !spend(p)) return; go(); }); else go(); }); }
  /* túi giấy cầm tay (90 giây) */
  let BAG=null, bagUntil=0; function carryBag(col){ try{ if(!BAG){ let hand=null; me.g.traverse(q=>{ if(!hand && q.isBone && /RightHand$/.test(q.name)) hand=q; }); BAG=new THREE.Group(); const bm=new THREE.MeshStandardMaterial({color:0xc8a878, roughness:.9});
        const b=new THREE.Mesh(new THREE.BoxGeometry(.3,.34,.12),bm); b.position.y=-.26; BAG.add(b); const hm=new THREE.Mesh(new THREE.TorusGeometry(.08,.012,6,16,Math.PI),new THREE.MeshStandardMaterial({color:0x1c1c1c})); hm.position.y=-.09; BAG.add(hm); BAG.userData.dynamic=true;
        (hand||me.g).add(BAG); if(hand){ const s=1/Math.max(1e-3,hand.getWorldScale(new THREE.Vector3()).x); BAG.scale.setScalar(s); } else BAG.position.set(.32,.85,0); BAG.bm=bm; }
      BAG.bm.color.set(col||0xc8a878); BAG.visible=true; bagUntil=(W.T||0)+90; }catch(e){ console.warn('[abyssal_towers] túi', e); } }

  /* ============================== 8. ĐẠI SẢNH (dựng khi lại gần) ============================== */
  for(const T of TW){ const fr=T.frame(T.sMid,T.RS), y=T.Y0;
    /* va chạm cố định: quầy lễ tân hình cung, sofa, chậu cây */ const dc=T.L(fr,-8.6,3.0), dirE=T.L(fr,0,-3.5), aC=Math.atan2(dirE[1]-dc[1],dirE[0]-dc[0]); T.desk={c:dc, a:aC};
    for(let q=0;q<4;q++){ const a0=aC-.95+q*.475, a1=a0+.475, p=[dc[0]+Math.cos(a0)*2.5,dc[1]+Math.sin(a0)*2.5], p2=[dc[0]+Math.cos(a1)*2.5,dc[1]+Math.sin(a1)*2.5]; seg(p[0],p[1],p2[0],p2[1],y-.4,y+1.3,'🛎️ Quầy lễ tân'); }
    for(const [u,v] of [[8.6,2.2],[11.4,2.2],[10,4.4]]){ const c=T.L(fr,u,v); circles.push({x:c[0], z:c[1], r:.9, y0:y-.4, y1:y+1.2}); }
    for(const e of [-1,1]) for(const u of [4.4,6.4]){ const c=T.L(fr,e*u,-5.4); circles.push({x:c[0], z:c[1], r:.55, y0:y-.8, y1:y+2}); }
    if(W.addBench) for(const [u,v,fu,fv,len] of [[10,1.2,0,-1,2.4],[8.4,2.6,1,0,1.6]]){ const c=T.L(fr,u,v); W.addBench({x:c[0], z:c[1], rot:T.yaw(fr,fu,fv), len, y:y+.47, floor:y, label:'🛋️ Ngồi sofa đại sảnh (E · C)'}); }
    INTER.push({x:T.L(fr,-8.6,1.3)[0], z:T.L(fr,-8.6,1.3)[1], r:2.8, prio:.85, when:()=>Math.abs(P.y-y)<1.5, label:T.acad?'🛎️ Lễ tân Học viện – thẻ học viên, sơ đồ tầng (E)':'🛎️ Lễ tân Residences – thẻ khách, thuê căn hộ (E)', action:()=>openReception(T)});
    const g=new THREE.Group(); g.name='aby-tw-lobby-'+T.k; g.visible=false; root.add(g); T.near.lobby={g, built:false}; }
  function buildLobby(T){ const N=T.near.lobby; if(N.built) return; N.built=true; const fr=T.frame(T.sMid,T.RS), y=T.Y0, B=K.Batch(T.cx,T.cz), E=K.Emit(), at=(u,v)=>T.L(fr,u,v), F=(fu,fv)=>T.yaw(fr,fu,fv);
    const box=(m,u,v,h,sx,sy,sz,fu=0,fv=-1)=>{ const c=at(u,v); B.box(m,c[0],y+h,c[1],F(fu,fv),sx,sy,sz); };
    /* thảm đỏ viền vàng từ sân tam cấp tới cổng quẹt thẻ */ box(MT.carpet,0,-.9,.024,2.4,.008,11.8); for(const e of [-1,1]) box(MT.gold,e*1.25,-.9,.025,.08,.008,11.8);   /* thảm phủ sát sàn (mặt +2,328 – không lún giày) */
    /* quầy lễ tân hình cung: thân đá Marble tối + mặt Marble sáng + chỉ vàng */ { const {c,a}=T.desk; B.ring(MT.marbleD,c[0],c[1],2.2,2.8,a-.95,a+.95,y,y+1.05,{},.8); B.ring(MT.marble,c[0],c[1],2.15,2.95,a-.98,a+.98,y+1.05,y+1.12,{},.8); B.ring(MT.gold,c[0],c[1],2.79,2.83,a-.95,a+.95,y+.3,y+.38,{t:true},.8);
      const lg=at(-8.6,T.RB-T.RS-.45); B.box(MT.gold,lg[0],y+3.6,lg[1],F(0,-1),3.4,.9,.08); }
    /* sofa nhung lục bảo + bàn đá + đèn bàn */ for(const [u,v,fu,fv,w2] of [[10,1.2,0,-1,2.6],[8.4,2.6,1,0,1.8],[11.6,2.6,-1,0,1.8]]){ box(MT.emerald,u,v,.4,w2,.8,.9,fu,fv); const c=at(u-fu*.35,v-fv*.35); B.box(MT.emerald,c[0],y+.8,c[1],F(fu,fv),w2,.9,.2); }
    { const c=at(10,2.7); B.cyl(MT.marbleD,c[0],y+.42,c[1],0,1.4,.08,1.4); B.cyl(MT.gold,c[0],y+.2,c[1],0,.12,.4,.12); }
    /* ốp gỗ óc chó + nẹp vàng 2 vách bên đại sảnh, cụm thang máy */ for(const s of [T.sL0+.2,T.sL1-.2]){ T.ring(B,MT.walnut,s-.04,s+.04,T.RS+.4,T.RB-.3,y,y+6); T.ring(B,MT.gold,s-.06,s+.06,T.RS+.4,T.RB-.3,y+6,y+6.12); }
    { const w=(T.sL1-T.sL0)-1; T.ring(B,MT.walnut,T.sMid-w/2,T.sMid-3.6,T.RB-.35,T.RB-.3,y,y+7); T.ring(B,MT.walnut,T.sMid+3.6,T.sMid+w/2,T.RB-.35,T.RB-.3,y,y+7); T.ring(B,MT.gold,T.sMid-3.4,T.sMid+3.4,130.95,131.05,y+3.1,y+3.25,{}); }
    /* cổng quẹt thẻ: vách kính an ninh + trụ đồng + cánh kính (động) */ for(const G of T.gates){ if(Math.abs(G.y-y)>1) continue; buildGateVis(G,B); }
    /* đèn chùm pha lê 3 tầng */ { const c=at(0,1.8), yC=y+7.2; B.geo(MT.gold,new THREE.TorusGeometry(1.7,.06,8,48),c[0],yC,c[1],0,1,1,1,Math.PI/2); B.geo(MT.gold,new THREE.TorusGeometry(1.1,.05,8,40),c[0],yC-.7,c[1],0,1,1,1,Math.PI/2); B.cyl(MT.gold,c[0],yC+.9,c[1],0,.05,1.8,.05);
      for(const [rr,yy,n] of [[1.7,yC-.25,28],[1.1,yC-.95,20],[.55,yC-1.5,12]]) for(let q=0;q<n;q++){ const a=q/n*TAU; E.ico(MT.crystal,c[0]+Math.cos(a)*rr,yy-(q%2)*.18,c[1]+Math.sin(a)*rr,0,.07,.17,.07); }
      E.sph(MT.glow,c[0],yC-.6,c[1],0,.7,.7,.7); }
    /* 4 chậu Tùng La Hán (bonsai tầng mây) */ for(const e of [-1,1]) for(const u of [4.4,6.4]){ const c=at(e*u,-5.4); B.cyl(MT.obs,c[0],y+.4,c[1],0,1.0,.8,1.0); B.cyl(MT.gold,c[0],y+.78,c[1],0,1.06,.06,1.06); B.cyl(MT.walnut,c[0],y+1.4,c[1],0,.14,1.3,.14);
      for(const [h,s2,ox] of [[1.4,1.1,.25],[2.0,.9,-.2],[2.5,.65,.1]]) E.ico(MT.green,c[0]+ox,y+h,c[1],0,s2,s2*.42,s2,0x9ec89a); }
    /* cây lớn trong sảnh */ for(const [u,v] of [[-15,1.2],[15,1.2],[-15,7.5],[15,7.5]]){ const c=at(u,v); B.cyl(MT.pot,c[0],y+.4,c[1],0,.9,.8,.9); E.ico(MT.green,c[0],y+1.8,c[1],0,1.4,2.2,1.4,null); }
    B.build(N.g,{name:'aby-tw-lobby'}); E.build(N.g,{name:'aby-tw-lobby-inst'});
    /* NPC: 2 bảo vệ Navy mũ kê-pi (cúi chào) + 2 lễ tân */ const people=[];
    for(const e of [-1,1]){ const c=at(e*2.1,-6.0), n=K.npc(4100+T.i*10+(e>0?1:0),{shirt:0x1b2a4a, pants:0x141c30, long:true, style:'cap'}, '👮 Bảo vệ '+(T.acad?'Học viện':'Residences'), '#7fb0ff'); if(!n) continue; n.a.g.position.set(c[0],y+.02,c[1]); n.a.g.rotation.y=F(0,-1); N.g.add(n.a.g); n.guard=true; people.push(n); circles.push({x:c[0], z:c[1], r:.35, y0:y-.4, y1:y+2}); }
    { const {c,a}=T.desk; for(const da of [-.4,.4]){ const p=[c[0]+Math.cos(a+da)*1.4, c[1]+Math.sin(a+da)*1.4], n=K.npc(4200+T.i*10+(da>0?1:0),{shirt:0x5a1e28, pants:0x1c1c22, long:true}, '🛎️ Lễ tân', '#ffd27a'); if(!n) continue; n.a.g.position.set(p[0],y+.02,p[1]); n.a.g.rotation.y=Math.atan2(Math.cos(a),Math.sin(a)); N.g.add(n.a.g); n.pose='staff'; n.work=true; people.push(n); } }
    N.people=people; for(const n of people) K.animate(n,0,P); }
  function buildGateVis(G, B){ const y=G.y; for(const [a,b] of G.posts){ const L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(L<.05) continue; const ry=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2; B.box(MT.glassR,(a[0]+b[0])/2,y+1.1,(a[1]+b[1])/2,ry,L,2.2,.04); B.box(MT.gold,(a[0]+b[0])/2,y+2.22,(a[1]+b[1])/2,ry,L,.05,.07); }
    G.flapsG=new THREE.Group(); G.flapsG.userData.dynamic=true; for(const [a,b] of G.lanes){ const L=Math.hypot(b[0]-a[0],b[1]-a[1]), ry=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2;
      for(const p of [a,b]){ B.box(MT.bronze,p[0],y+.55,p[1],ry,.26,1.1,.9); B.box(MT.glow,p[0],y+1.11,p[1],ry,.2,.02,.6); }
      for(const [p,sgn] of [[a,-1],[b,1]]){ const pv=new THREE.Group(); pv.position.set(p[0],y+.65,p[1]); pv.rotation.y=ry; const fl=new THREE.Mesh(new THREE.BoxGeometry(L/2-.16,.8,.03),MT.glassR); fl.position.x=sgn*(L/4+.05); fl.renderOrder=6; pv.add(fl); pv.userData.sgn=sgn; G.flapsG.add(pv); G.flaps.push(pv); } }
    (Math.abs(G.y-G.T.Y0)<1 ? G.T.near.lobby.g : G.T.near.gates.g).add(G.flapsG); }
  function openReception(T){ const U=ui(); if(!U || !U.modal){ giveCard(); return; } const m=U.modal(T.acad?'🛎️ Lễ tân · QA · QC · QE Academy & Tech Hub':'🛎️ Lễ tân · Abyssal Horizon Residences');
    const fl=T.floors.map(F=>`<li><b>Tầng ${F.f+1}</b> · ${F.name}${T.acad?' – '+F.rooms.filter(r=>r.kind==='class').map(r=>r.name).slice(0,5).join(', '):''}</li>`).join('');
    const apt=S.abyApt && S.abyApt.until>Date.now() ? `<div style="margin:8px 0;color:#9fe3ff">🔑 Bạn đang thuê căn <b>${S.abyApt.unit}</b> (còn ${Math.ceil((S.abyApt.until-Date.now())/86400000)} ngày).</div>`:'';
    m.body.innerHTML=`<div style="line-height:1.55">${T.acad?'Chào mừng tới Học viện QA · QC · QE! Tầng 8 là đại sảnh + 8 shophouse; các tầng 10–12 là lớp học, phòng bida, pantry, phòng họp.':'Chào mừng tới Abyssal Horizon Residences – căn hộ cao cấp tầng 10–14, ban công Jacuzzi nhìn ra vịnh.'}
      <ul style="margin:8px 0 8px 18px">${fl}</ul>${apt}<div style="opacity:.75;font-size:12px">Tầng 1–7 là hầm kỹ thuật dưới bãi cát. Tầng 11 có cổng vòm ra vỉa hè kè +16, tầng ${T.acad?12:12} có cầu kính sang tháp Hydro-Pulse.</div></div>
      <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap;display:flex"><button class="btn pri" data-a="card">💳 ${hasCard()?'Đã có thẻ – in lại':'Nhận thẻ khách miễn phí'}</button>${T.acad?'':`<button class="btn" data-a="rent">🔑 Thuê căn hộ 7 ngày – 3.000 💰</button>`}<button class="btn" data-a="x">Đóng</button></div>`;
    m.body.querySelector('[data-a=card]').onclick=()=>{ m.close(); giveCard(); }; m.body.querySelector('[data-a=x]').onclick=m.close;
    const rb=m.body.querySelector('[data-a=rent]'); if(rb) rb.onclick=()=>{ m.close(); const go=()=>{ const FL=T.floors[(Math.random()*T.floors.length)|0], rm=FL.rooms[(Math.random()*FL.rooms.length)|0], c=T.frame((rm.s0+rm.s1)/2,(FL.rG+FL.rC)/2).o;
        S.abyApt={tower:T.k, f:FL.f, unit:rm.name, x:c[0], z:c[1], y:FL.y, until:Date.now()+7*86400000}; if(!S.abyCard) S.abyCard={t:Date.now()}; save(); toast(`🔑 Đã thuê ${rm.name} (tầng ${FL.f+1}) 7 ngày – bản đồ có mục "Về căn hộ Abyssal". Thẻ cư dân đã kích hoạt.`, 4600); };
      if(askPay) askPay(3000,'🔑 Thuê căn hộ Sky-Condo 7 ngày – Abyssal Horizon Residences',()=>{ if(spend && !spend(3000)) return; go(); }); else go(); }; }

  /* ============================== 9. CHI TIẾT TẦNG (dựng khi lên tầng): nhãn phòng, NPC, bàn bida, E ============================== */
  function buildFloor(T, FL){ if(FL.built) return FL; FL.built=true; const g=new THREE.Group(); g.name=`aby-tw-floor-${T.k}-${FL.f}`; root.add(g); FL.g=g; FL.people=[]; const y=FL.y;
    lbl(`Tầng ${FL.f+1} · ${FL.name}`, T.acad?'QA · QC · QE Academy & Tech Hub':'Abyssal Horizon Residences', {h:.4, x:T.Ps(T.sMid,(FL.liftG+RH0)/2)[0], y:y+3.4, z:T.Ps(T.sMid,(FL.liftG+RH0)/2)[1], fade:22});
    let npcN=0; for(const rm of FL.rooms){ const sc=(rm.s0+rm.s1)/2, fr=T.frame(sc,FL.rG), dep=FL.rC-FL.rG, hw=(rm.s1-rm.s0)*FL.rG/RREF/2-.25, dp=T.Ps(sc,FL.rC+.9);
      lbl(rm.kind==='class'?`📚 ${rm.name}`:rm.kind==='apt'?`🏠 ${rm.name}`:rm.kind==='billiard'?'🎱 Phòng Bida':rm.kind==='pantry'?'☕ Pantry & Cà phê':rm.kind==='meeting'?'🧑‍💼 Phòng họp kính':rm.kind==='server'?'🖥️ Server Room · Device Lab':'📖 Lounge Sách & Mentoring', null, {h:.3, x:dp[0], y:y+2.9, z:dp[1], fade:14});
      if(rm.kind==='class'){ /* bảng tên khoá học trên slide */ const cv=K.cvTex(512,256,(c2,w,h)=>{ c2.fillStyle='#0d1b2a'; c2.fillRect(0,0,w,h); c2.fillStyle='#6dffb0'; c2.font='700 40px Segoe UI, sans-serif'; c2.fillText(rm.name,24,70,w-40); c2.fillStyle='#cfe6ff'; c2.font='500 24px Segoe UI'; ['• Mục tiêu bài học & demo','• Lab thực hành 45 phút','• Bug bash cuối buổi'].forEach((t,i)=>c2.fillText(t,28,130+i*36)); },{rep:false});
        const pm=new THREE.Mesh(new THREE.PlaneGeometry(3.3,1.6),new THREE.MeshBasicMaterial({map:cv})), c=T.L(fr,-hw+.2,dep/2); pm.position.set(c[0],y+2.0,c[1]); pm.rotation.y=T.yaw(fr,1,0); g.add(pm);
        if(npcN<3){ const lc=T.L(fr,-hw+1.2,dep/2+.6), n=K.npc(5100+FL.f*20+npcN,{shirt:0x2a2a2a, pants:0x2a2a30, long:true},'🧑‍🏫 Giảng viên '+rm.name.split(' ')[0],'#6dffb0'); if(n){ n.a.g.position.set(lc[0],y,lc[1]); n.a.g.rotation.y=T.yaw(fr,1,0); n.pose='present'; g.add(n.a.g); FL.people.push(n); npcN++; }
          for(const [u,v] of [[.7+.55,2.6],[2.8+.55,1.1]]){ if(npcN>=3) break; const sc2=T.L(fr,u,v), s2=K.npc(5200+FL.f*20+npcN,{shirt:COLS.shirt[npcN%5], shorts:false},'🎒 Học viên','#9fe3ff'); if(!s2) continue; const hh=s2.po.hipsHeight(); s2.a.g.position.set(sc2[0],y+.48+.06-hh,sc2[1]); s2.a.g.rotation.y=T.yaw(fr,-1,0); s2.pose='type'; g.add(s2.a.g); FL.people.push(s2); npcN++; } }
        INTER.push({x:dp[0], z:dp[1], r:2.4, prio:.5, when:()=>Math.abs(P.y-y)<1.3, label:`📚 Vào học thử: ${rm.name} (E)`, action:()=>{ S.abyClass=S.abyClass||{}; S.abyClass[rm.name]=(S.abyClass[rm.name]||0)+1; save(); toast(`📚 Học thử ${rm.name}: đã ghi danh buổi ${S.abyClass[rm.name]} – xem slide trên bảng, ngồi vào bàn để thực hành!`, 3800); }}); }
      else if(rm.kind==='billiard'){ for(const u of [-hw/2+.2, hw/2-.2]){ const c=T.L(fr,u,dep/2); try{ const bt=buildBilliardTable(W,c[0],y,c[1],T.yaw(fr,1,0)+Math.PI/2,u<0?0x0d7a4f:0x8e1b22,'world',{parent:g}); K.compact(bt,o=>o.geometry && o.geometry.type==='SphereGeometry' && o.geometry.parameters.radius<.04); }catch(e){ console.warn('[abyssal_towers] bida', e); } }
        const c=T.L(fr,hw-1,dep/2+.6), n=K.npc(5300+FL.f,{shirt:0x3a3a48, pants:0x1c1c22, long:true},'🎱 Cơ thủ','#ffd27a'); if(n){ n.a.g.position.set(c[0],y,c[1]); n.a.g.rotation.y=T.yaw(fr,-1,0); n.pose='cross'; g.add(n.a.g); FL.people.push(n); } }
      else if(rm.kind==='pantry'){ INTER.push({x:dp[0], z:dp[1], r:2.4, prio:.5, when:()=>Math.abs(P.y-y)<1.3, label:'☕ Pha cà phê miễn phí ở pantry (E)', action:()=>{ S.buffs=S.buffs||{}; S.buffs.coffee=Math.max(Date.now(),S.buffs.coffee||0)+5*60000; save(); toast('☕ Một tách cà phê rang mộc – tỉnh táo thêm 5 phút!', 2600); }}); }
      else if(rm.kind==='apt'){ if(W.addBench){ const c=T.L(fr,-hw/2-.2,dep-.95); W.addBench({x:c[0], z:c[1], rot:T.yaw(fr,0,-1), len:2.2, y:y+.47, floor:y, label:'🛋️ Ngồi sofa căn hộ (E · C)'}); }
        const jc=T.L(fr,-hw/2,-(FL.rG-FL.rO)/2-.1); circles.push({x:jc[0], z:jc[1], r:1.15, y0:y-.4, y1:y+1});
        INTER.push({x:jc[0], z:jc[1], r:2.2, prio:.5, when:()=>Math.abs(P.y-y)<1.3, label:'🛁 Ngâm Jacuzzi ban công ngắm vịnh (E)', action:()=>{ S.buffs=S.buffs||{}; S.buffs.energy=Math.max(Date.now(),S.buffs.energy||0)+5*60000; save(); toast('🛁 Nước ấm sủi bọt, vịnh Song Nguyệt lấp lánh dưới chân – ⚡ khoẻ hơn 5 phút!', 3200); }});
        if(npcN<1 && (rm.name.endsWith('.03')||rm.name.endsWith('.08'))){ const c=T.L(fr,-hw/2-.2,dep-.9), n=K.npc(5400+FL.f*3,{shirt:COLS.shirt[FL.f%5], shorts:true},'🏠 Cư dân','#ffc0c8'); if(n){ const hh=n.po.hipsHeight(); n.a.g.position.set(c[0],y+.47+.06-hh,c[1]); n.a.g.rotation.y=T.yaw(fr,0,-1); n.pose='lap'; g.add(n.a.g); FL.people.push(n); npcN++; } } } }
    return FL; }

  /* ============================== 10. MỖI KHUNG HÌNH ============================== */
  const tower=(x,z,pad=0)=>{ for(const T of TW){ const dx=x-T.cx, dz=z-T.cz, r=Math.hypot(dx,dz); let a=Math.atan2(dz,dx); const lo=Math.min(T.aN,T.aF), hi=Math.max(T.aN,T.aF); while(a<lo-1) a+=TAU; while(a>hi+1) a-=TAU;
      const da=a<lo?(lo-a)*r:a>hi?(a-hi)*r:0, dr=r<116?116-r:r>T.RW(T.top)?r-T.RW(T.top):0; T._d=Math.hypot(da,dr); T._r=r; T._s=(a-T.aN)*T.sg*RREF; } };
  let tt=0, upd=0;
  HOOK.onFrame.push(dt=>{ dt=Math.min(dt||.016,.1); tt+=dt; const near=Math.abs(P.x)<300 && Math.abs(P.z)<300;
    if(BAG && BAG.visible && (W.T||tt)>bagUntil) BAG.visible=false;
    if(!near){ if(upd!==-1){ upd=-1; for(const T of TW){ T.far.visible=false; for(const k in T.near) if(T.near[k].g) T.near[k].g.visible=false; } if(HOOK.camBox && HOOK.camBox._tw) HOOK.camBox=null; } return; }
    upd=1; tower(P.x,P.z); let inBox=null; for(const ph of PH){ try{ ph.update(dt); }catch(e){} }
    for(const T of TW){ const d=T._d; T.far.visible=d<75; T.near.gates.g.visible=d<45;
      /* đại sảnh */ const dl=Math.hypot(P.x-T.Ps(T.sMid,126)[0],P.z-T.Ps(T.sMid,126)[1]); if(dl<70){ buildLobby(T); T.near.lobby.g.visible=true; } else T.near.lobby.g.visible=false;
      const lob=T.near.lobby; if(lob.people && lob.g.visible){ for(const n of lob.people){
          if(n.guard){ const dd=Math.hypot(P.x-n.a.g.position.x,P.z-n.a.g.position.z), want=dd<6 && Math.abs(P.y-T.Y0)<2 ? 1:0; n.bk=lerp(n.bk||0,want,1-Math.exp(-dt*(want?3:2))); if(want && !n.said){ n.said=true; toast('👮 Bảo vệ cúi chào: "Kính chào quý khách – chúc một ngày tốt lành!"', 2400); } if(!want && n.bk<.05) n.said=false; } K.animate(n,dt,P); } }
      /* shophouse (2 nửa) */ for(const half of [0,1]){ const N=T.near['shops'+half], ss=half?T.sL1+24:T.shopS[0]+24, c=T.Ps(ss,126), dd=Math.hypot(P.x-c[0],P.z-c[1]); const on=dd<40 && Math.abs(P.y-T.Y0)<9; if(on) buildShops(T,half); N.g.visible=on;
        if(on) for(const o of SHOPS){ if(o.T!==T || o.half!==half) continue; if(o.spinG) o.spinG.rotation.y+=dt*.8; const dc=Math.hypot(P.x-o.counter[0],P.z-o.counter[1]);
          if(!o.clerk && dc<16 && Math.abs(P.y-T.Y0)<2){ const c=T.L(o.fr,3.45,9.6); o.clerk=K.npc(6000+T.i*16+o.j,{shirt:[0x1c1c1c,0x8a4a26,0xd8c6a8,0x1d6f6a][o.cat], pants:0x1c1c22, long:true},`🛍️ Nhân viên ${o.name}`,'#ffd27a') || 0; if(o.clerk){ o.clerk.a.g.position.set(c[0],T.Y0+.02,c[1]); o.clerk.a.g.rotation.y=T.yaw(o.fr,0,-1); o.clerk.pose='staff'; o.clerk.work=true; N.g.add(o.clerk.a.g); K.animate(o.clerk,0,P); } }
          if(o.clerk && dc<40) K.animate(o.clerk,dt,P); } }
      /* tầng đang đứng */ for(const FL of T.floors){ const on=T._d<2 && Math.abs(P.y-FL.y)<2.2; if(on) buildFloor(T,FL); if(FL.g) FL.g.visible=on || (T._d<30 && Math.abs(P.y-FL.y)<6);
        if(FL.g && FL.g.visible && FL.people) for(const n of FL.people) K.animate(n,dt,P);
        if(on && T._r>FL.rG-.3){ inBox={x0:-1e6, x1:1e6, z0:-1e6, z1:1e6, y1:FL.yc-.3, _tw:true}; } }
      if(T._d<2 && Math.abs(P.y-T.Y0)<2.2 && T._r>T.RS+.3 && T._r<T.RB){ const inShop=T.shops.some(sh=>T._s>sh.s0 && T._s<sh.s1); if(inShop) inBox={x0:-1e6, x1:1e6, z0:-1e6, z1:1e6, y1:T.Y0+5.2, _tw:true}; }
      /* cổng quẹt thẻ: mở khi có thẻ (hoặc đi từ phía trong ra) */ for(const G of T.gates){ const dx=P.x-G.c[0], dz=P.z-G.c[1], dd=Math.hypot(dx,dz), lane=dd<Math.max(3,G.len/2+1.2) && Math.abs(P.y-G.y)<1.6, inner=(dx*G.n[0]+dz*G.n[1])>0;
          const want=lane && (hasCard() || inner) && Math.min(...G.lanes.map(([a,b])=>Math.hypot(P.x-(a[0]+b[0])/2,P.z-(a[1]+b[1])/2)))<3.2;
          if(want && !G.open){ G.open=true; if(!inner && (tt-(G.beep||-9))>4){ G.beep=tt; toast(`💳 Bíp! ${G.name} mở – mời vào.`, 1600); if(W.sfx) try{ W.sfx('lift-ding',G.c[0],G.y+1,G.c[1]); }catch(e){} } }
          if(!want && G.open && !G.lanes.some(([a,b])=>Math.hypot(P.x-(a[0]+b[0])/2,P.z-(a[1]+b[1])/2)<1.2)) G.open=false;
          for(const s of G.segs) s.y0=G.open?1e6:G.y-.4; G.k=lerp(G.k,G.open?1:0,1-Math.exp(-dt*7)); for(const pv of G.flaps){ const base=pv.userData.base??(pv.userData.base=pv.rotation.y); pv.rotation.y=base+pv.userData.sgn*G.k*1.45; } } }
    for(const ph of PH) if(ph.inside(P.x,P.z,P.y)) inBox={x0:-1e6, x1:1e6, z0:-1e6, z1:1e6, y1:ph.ceilAt(P.y)-.3, _tw:true};
    if(inBox){ HOOK.camBox=inBox; if(cam.dist>4.6) cam.dist=4.6; } else if(HOOK.camBox && HOOK.camBox._tw) HOOK.camBox=null; });

  /* ============================== 11. GỠ VỎ CÁNH CŨ (phiên A gọi khi W.ABY.towersReady) ============================== */
  function retireOldShell(){ const rep={groups:0, meshes:0, plats:0, segs:0, rl:0, lifts:0, labels:0, inter:0};
    const WG=TW.map(T=>({T, a0:Math.min(T.pl.a0,T.pl.a1), a1:Math.max(T.pl.a0,T.pl.a1), RWo:f=>T.pl.rIn+WD+SB*f, yF:T.yF}));
    const polar=(w,x,z)=>{ const dx=x-w.T.cx, dz=z-w.T.cz; let a=Math.atan2(dz,dx); if(a<0) a+=TAU; return [Math.hypot(dx,dz), a]; };
    for(const nm of ['abyssal-xanh','abyssal-do']){ const g=scene.getObjectByName(nm); if(g){ g.removeFromParent(); rep.groups++; } }
    const grp=scene.getObjectByName('abyssal'); if(grp) for(const m of grp.children.slice()){ if(!m.isMesh || !m.geometry) continue; const pr=m.geometry.parameters||{}, ty=m.geometry.type;
      const roof=ty==='ExtrudeGeometry' && Math.abs(Math.abs(m.position.x)-8.1)<.02 && Math.abs(m.position.z-TW[0].cz)<.02, sign=ty==='PlaneGeometry' && pr.width===36 && Math.abs(pr.height-3.4)<1e-6, lob=ty==='BoxGeometry' && Math.abs(pr.height-.22)<1e-6 && Math.abs(pr.depth-2.6)<1e-6;
      if(roof||sign||lob){ m.removeFromParent(); rep.meshes++; } }
    /* sàn cũ: ô sàn từng tầng (hd 6 = sâu 12/2, tâm ở RW(f)−6) + sàn sảnh thang cũ (hd 1,3) */
    for(let i=plats.length-1;i>=0;i--){ const p=plats[i]; if(p.t!=='r') continue; let kill=false;
      for(const w of WG){ const [r,a]=polar(w,p.x,p.z); if(a<w.a0-.06 || a>w.a1+.06) continue;
        if(Math.abs(p.hd-6)<1e-6){ for(let f=0;f<w.T.nf;f++) if(Math.abs(p.h-w.yF(f))<1e-4 && Math.abs(r-(w.RWo(f)-6))<.05){ kill=true; break; } }
        else if(Math.abs(p.hd-1.3)<1e-6 && r>120 && r<130){ kill=true; } if(kill) break; }
      if(kill){ plats.splice(i,1); rep.plats++; } }
    const OLD=new Set(['🏢 Mặt tiền – nội thất các tầng sẽ mở ở bước sau','🌊 Lan can mép hồ','⛰️ Khe sau nhà – không có lối đi','🚧 Lan can đầu hồi – sảnh thang máy ở giữa','🚧 Lan can đầu hồi','🚧 Lan can sảnh thang','🏢 Đầu hồi nhà']);
    for(const s of W.SEGS||[]){ if(s.y0>1e5) continue; let kill=OLD.has(s.msg);
      if(!kill && !s.msg && Math.abs(s.r-.14)<1e-6 && s.y1-s.y0>1.85 && s.y1-s.y0<1.95) for(const w of WG){ const [ra,aa]=polar(w,s.ax,s.az), [rb]=polar(w,s.bx,s.bz); if(aa<w.a0-.01 || aa>w.a1+.01) continue; for(let f=0;f<w.T.nf;f++) if(Math.abs(ra-(w.RWo(f)-WD+.12))<.03 && Math.abs(rb-(w.RWo(f)-WD+.12))<.03 && Math.abs(s.y0-(w.yF(f)-.4))<.01){ kill=true; break; } if(kill) break; }
      if(kill){ s.y0=1e6; s._abyOld=true; rep.segs++; } }
    /* kính lan can trực quan của đảo (RL) trong vùng 2 cánh – giữ lan can cầu kính Hydro (chạy theo trục x, |x| ≤ 22,6) và lan can sảnh tháp (|x| ≤ 18,1) */
    const _m4=new THREE.Matrix4(), _p=new THREE.Vector3(), _qq=new THREE.Quaternion(), _sc=new THREE.Vector3(), _eu=new THREE.Euler();
    scene.traverse(ob=>{ if(!ob.isInstancedMesh) return; const pr=ob.geometry.parameters||{}; if(!(pr.width===1 && pr.depth<.1 && (Math.abs(pr.height-.95)<1e-6 || Math.abs(pr.height-.05)<1e-6))) return; let ch=false;
      for(let i=0;i<ob.count;i++){ ob.getMatrixAt(i,_m4); _m4.decompose(_p,_qq,_sc); if(_sc.x<1e-4) continue; if(Math.abs(_p.x)<=18.1) continue; _eu.setFromQuaternion(_qq,'YXZ'); if(Math.abs(_p.x)<=22.7 && Math.abs(Math.sin(_eu.y))<.3) continue;
        for(const w of WG){ const [r,a]=polar(w,_p.x,_p.z); if(r>108 && r<142 && a>w.a0-.045 && a<w.a1+.045){ ob.setMatrixAt(i,_m4.makeScale(0,0,0)); ch=true; rep.rl++; break; } } }
      if(ch) ob.instanceMatrix.needsUpdate=true; });
    /* thang máy cũ ở đầu hồi xa (liftkit 'Thang Học viện' / 'Thang Residences') */
    for(const L of allLifts()){ if(!/^(Thang Học viện|Thang Residences)/.test(L.name||'') || L._retired) continue; L._retired=true; try{ L.g.removeFromParent(); }catch(e){} L.update=()=>{}; for(const s of L.segs||[]) s.y0=1e6; for(const lv of L.doors||[]){ lv.y0=1e6; if(lv.seg) lv.seg.y0=1e6; } if(L.plat) L.plat.h=-1e9;
      for(let i=plats.length-1;i>=0;i--){ const p=plats[i]; if(p.t==='r' && Math.abs(p.hd-.42)<1e-6 && Math.hypot(p.x-L.cx,p.z-L.cz)<3.5){ plats.splice(i,1); rep.plats++; } } rep.lifts++; }
    for(const it of INTER){ let lb=''; try{ lb=it.label; }catch(e){} if(typeof lb==='string' && /Thang Học viện|Thang Residences/.test(lb)){ it.when=()=>false; rep.inter++; } }
    for(const L of (W.labels||[]).slice()){ if(MYLB.has(L)) continue; const t=(L.el && L.el.textContent)||''; let kill=/^🎓 QA · QC · QE ACADEMY|^🏙️ ABYSSAL HORIZON/.test(t);
      if(!kill && /^Tầng \d+ · /.test(t)) for(const w of WG){ const [r,a]=polar(w,L.x,L.z); if(r>118 && r<132 && a>w.a0-.06 && a<w.a1+.06){ kill=true; break; } }
      if(kill){ try{ W.removeLabel(L); }catch(e){} rep.labels++; } }
    console.info('[abyssal_towers] gỡ vỏ cánh cũ:', rep); return rep; }

  /* ============================== 12. MỞ KHE LAN CAN ĐẦU VỈA HÈ (lối vào tầng 11) ============================== */
  function openGaps(){ const out=[]; for(const C of CONN){ const [d0,d1]=C.line, ex=d1[0]-d0[0], ez=d1[1]-d0[1], L2=ex*ex+ez*ez;
      const test=(x,z)=>{ const t=((x-d0[0])*ex+(z-d0[1])*ez)/L2; if(t<-.12 || t>1.12) return false; const px=d0[0]+ex*clamp(t,0,1), pz=d0[1]+ez*clamp(t,0,1); return Math.hypot(x-px,z-pz)<1.6; };
      out.push(K.openGap(test,14.5,18.5,{msg:/Cuối vỉa hè/})); } return out; }
  const gapRep=(ABY.gapsOpen===true)?[]:openGaps();   /* phiên A đặt W.ABY.gapsOpen = true khi đã mở khe gốc */

  /* ============================== 13. CÔNG BỐ CHO CÁC PHIÊN KHÁC + BẢN ĐỒ ============================== */
  for(const T of TW){ const c=T.Ps(T.sMid,115.6);
    PLACES.push({icon:T.acad?'🎓':'🏙️', name:`Abyssal · Grand Lobby ${T.acad?'Học viện QA · QC · QE':'Abyssal Horizon Residences'}`, sub:'Tầng 8 ngang bãi cát · lễ tân, cổng quẹt thẻ, thang máy · 8 shophouse 2 bên', go:()=>teleport(c[0],c[1],T.Ps(T.sMid,126)[0],T.Ps(T.sMid,126)[1])}); }
  { const T=TW[1], c=T.Ps(T.shopS[1]+6,118.6), l=T.Ps(T.shopS[1]+6,126);   /* đứng trên bãi cát trước hành lang (teleport lấy mặt sàn CAO NHẤT tại điểm – tránh chỗ có tầng chồng) */ PLACES.push({icon:'🛍️', name:'Abyssal · Phố Shophouse tầng đế', sub:'16 gian: thời trang · giày & phụ kiện · bánh & bistro · trà sữa & lưu niệm – bấm E mua đồ', go:()=>teleport(c[0],c[1],l[0],l[1])}); }
  PLACES.push({icon:'🔑', name:'Abyssal · Về căn hộ đang thuê', sub:'Chỉ dùng được khi đã thuê căn hộ ở lễ tân Residences', go:()=>{ const a=S.abyApt; if(!a || a.until<Date.now()) return toast('🔑 Bạn chưa thuê căn hộ – tới lễ tân Abyssal Horizon Residences (tầng 8) để thuê.', 3400); teleport(a.x,a.z,a.x,a.z); P.y=a.y; P.vy=0; P.ground=true; }});
  const API={ ver:1, ready:true,
    list:TW.map(T=>({k:T.k, name:T.name, center:{x:T.cx, z:T.cz}, aN:T.aN, aF:T.aF, podiumY:T.Y0, lobby:{x:T.Ps(T.sMid,126)[0], z:T.Ps(T.sMid,126)[1], y:T.Y0, door:T.Ps(T.sMid,119.4), forecourt:T.Ps(T.sMid,117.2)}, lifts:T.lifts,
      gates:T.gates.map(G=>({name:G.name, x:G.c[0], z:G.c[1], y:G.y})), entries:{promenade:CONN.filter(c=>c.T===T).map(c=>({x:c.c[0], z:c.c[1], y:16})), hydroBridgeY:[T.Y0, T.yF(11)]},
      floors:T.floors.map(F=>({f:F.f, y:F.y, name:`Tầng ${F.f+1} · ${F.name}`, rooms:F.rooms.map(r=>{ const sc=(r.s0+r.s1)/2; return {name:r.name, kind:r.kind, c:T.Ps(sc,(F.rG+F.rC)/2), door:T.Ps(sc,F.rC+.9), balcony:T.Ps(sc,(F.rO+F.rG)/2)}; })})) })),
    shophouses:SHOPS.map(o=>({tower:o.T.k, name:o.name, kind:o.kind, cat:o.cat, y:o.y, door:o.door, inside:o.inside, counter:o.counter, browse:[T2(o,-2.5,4),T2(o,2.5,4),T2(o,0,6)]})),
    penthouses:PH.map(p=>({k:p.T.k, name:p.def.name, floors:[p.def.fL+1,p.def.fL+2], yL:p.yL, yU:p.yU, rooms:p.rooms, pt:p.pt, SD:p.SD, VB:p.VB, VOL:p.VOL, VGU:p.VGU, DOOR_V:p.DOOR_V})),
    hasCard, giveCard, retireOldShell, openGaps, gapReport:gapRep, root };
  function T2(o,u,v){ return o.T.L(o.fr,u,v); }
  W.abyTowers=API; W.ABY.towers=API; W.ABY.towersReady=true; try{ W.markShadow && W.markShadow(); }catch(e){}
  console.info(`[abyssal_towers] dựng xong 2 toà + ${SHOPS.length} shophouse · cửa vỉa hè: ${gapRep.map(r=>r.segs).join('/')} đoạn lan can mở`);
  return API;
}

/* ============================== DỮ LIỆU SHOPHOUSE (tên tự đặt – không dùng thương hiệu thật) ============================== */
const SHOP_NAMES=['Atelier Lụa Ngọc','Gót Ngọc Boutique','Tiệm Bánh Bơ Sữa','Trà Sữa Mây Trắng','Bước Vàng Shoes','Maison Kim Sa','Quà Lưu Niệm Abyssal','Lò Bánh Hoàng Hôn',
  'Couture Hừng Đông','Da Thật Atelier','Bistro Mùa Gió','Cà Phê Vách Đá','Phụ Kiện Ánh Kim','Nhà Mốt Sapphire','Trà & Quà Ngọc Bích','Bánh Ngọt Cửa Vịnh'];
const SHOP_CAT=[
  {kind:'Thời trang Luxury', tag:'THỜI TRANG', icon:'👗', bag:0xe6d2b4, items:[['Áo sơ mi lụa tơ tằm',180,'Lụa 22 momme, cúc xà cừ'],['Váy dạ hội Sapphire',450,'Đính đá thủ công, may đo trong 3 ngày'],['Vest may đo 2 lớp',520,'Len Ý, lót lụa đỏ rượu vang'],['Khăn lụa hoạ tiết vịnh',90,'In hình vịnh Song Nguyệt'],['Áo khoác dạ lông cừu',380,'Ấm áp, phom suông thanh lịch']]},
  {kind:'Giày dép & Phụ kiện', tag:'GIÀY & PHỤ KIỆN', icon:'👠', bag:0xc8a878, items:[['Giày tây da bò',260,'Đế khâu tay, đánh xi bóng'],['Giày cao gót 7 cm',240,'Mũi nhọn, quai mảnh'],['Sneaker trắng kem',190,'Êm chân cả ngày test'],['Túi xách da thật',320,'Khoá đồng, dây đeo chéo'],['Thắt lưng da cá sấu giả',110,'Khoá vàng champagne'],['Kính râm gọng đồi mồi',140,'Chống tia UV400']]},
  {kind:'Tiệm bánh & Bistro', tag:'BÁNH & BISTRO', icon:'🥐', bag:0xd9b98a, items:[['Croissant bơ Pháp',18,'Nướng mỗi 30 phút','energy'],['Bánh tiramisu ly',32,'Cà phê rang mộc + mascarpone','energy'],['Hộp macaron 6 vị',28,'Pistachio, mâm xôi, sô-cô-la…','energy'],['Bánh mì bistro thịt nướng',25,'Kèm salad dầu giấm','energy'],['Súp kem nấm truffle',30,'Ăn kèm bánh mì nướng bơ tỏi','energy']]},
  {kind:'Trà sữa · Cafe · Lưu niệm', tag:'TRÀ · CAFE · QUÀ', icon:'🧋', bag:0x9fd8c8, items:[['Trà sữa trân châu hoàng kim',22,'Ít đá, 50% đường','coffee'],['Cà phê muối',20,'Kem muối béo nhẹ','coffee'],['Móc khoá Đảo Abyssal',35,'Đồng mạ vàng, khắc tên'],['Cốc sứ QC World',60,'Hoạ tiết bug & test case'],['Tai nghe mini không dây',150,'Pin 20 giờ, hộp sạc đá Travertine']]} ];
