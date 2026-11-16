// QC World V2 – PHA 3: QA/QC ABYSSAL CANYON ISLAND (x −180→180 · z −180→180 · y −42→+34) – phiên đồ hoạ/QA, 16/11/2026
// Theo QC_WORLD_V2_MASTER_BIBLE – Phần 1 + Module 2 và V2_PLAN.md (mục 2b: 3 cổng nối, không đường cụt). Thiết kế gốc của QC World.
//  • Hẻm núi "Song Nguyệt": miệng elip 292 × 260 m tâm (0, −15), vành đỉnh +28, hồ ngầm −29,5 (đáy −42), khe cửa vực phía Nam bị ĐẬP TRÀN chặn ở z = 162
//    (biển −0,35 đổ thành thác 30 m xuống hồ) – mặt biển của game được khoét lỗ đúng miệng vực nên lòng hẻm không bị nước biển cắt ngang.
//  • Cánh Xanh (Học viện QA/QC 12 tầng) + Cánh Đỏ (Abyssal Horizon Residences 12 tầng + sân thượng): cánh cung giật cấp bám vách (AK.buildCurvedTerraceWing).
//  • Tháp thang máy kính đôi Hydro-Pulse Core cao 76 m: cabin chạy thật giữa 5 sảnh (đáy vực, tầng 4, tầng 8, tầng 12, đỉnh núi); 3 tầng cầu kính nối 2 cánh.
//  • Đáy vực: đường dạo vòng hồ, 24 shophouse chân vách, ốc đảo Master Dashboard + 8 đảo công cụ (9 màn hình của screens.js được dời về đây),
//    bán đảo sân khấu nhạc nước 48 vòi, bến kayak (tự chèo W/A/S/D), 2 ĐƯỜNG XOẮN Ô TÔ 2 LÀN dốc ≤ 9 % (vành đai +2 → hầm xe → bãi đỗ đáy vực; lên tiếp đỉnh +28).
//  • ĐƯỜNG KHÔNG CỤT: vành đai +2 quanh đảo nối 3 cổng G1 (180, 0) · G2 (0, 180, +4 trên mặt đập) · G3 (−180, −16); 2 tháp xoắn nối vành đai ↔ đường dạo đáy vực ↔ đường đỉnh vách.
// Va chạm: mọi mép nước / mép vực / mép sàn đều có lan can (addSeg) – bị chặn thì đứng tại chỗ và hiện lý do. Nội thất 12 tầng (abyssal_interior.js) làm ở bước sau.
import * as AK from './archKit.js';
import { makeLiftBank } from './liftkit.js';
import { bayModel, buildBay } from './abyssal_bay.js';
import { buildAmenities } from './abyssal_amenities.js';
import { makeLux } from './lux_textures.js';

export async function make(W, ctx){
  const {THREE, scene, circles, boxes, plats, INTER, PLACES, HOOK, P, me, cam, toast, makeLabel, teleport, addSeg, addPlat, EXTL} = W;
  const TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  AK.bindNight(W); if(W.terrain) W.terrain.visible=false;
  if(W.labels) for(const L of W.labels.slice()){ if(!L.follow && Math.abs(L.x)<=180 && Math.abs(L.z)<=180){ try{ L.el.remove(); }catch(e){} const i=W.labels.indexOf(L); if(i>=0) W.labels.splice(i,1); } }   /* nhãn của đảo V1 (Thư viện, Sân khấu…) không bị clearLegacy gỡ */
  const A=146, BZ=130, CZ=-15, FY=-29.2, LY=-29.5, RIM=28, GY=2, ZB=179.4, LOW=W.QUAL==='low';
  const re=(x,z)=>Math.hypot(x/A,(z-CZ)/BZ), el=(phi,rho)=>[A*rho*Math.cos(phi), CZ+BZ*rho*Math.sin(phi)];
  const HX=[{x:112, z:112, s:1}, {x:-112, z:112, s:-1}], HR=19.5, GX=38, DAMZ=162;
  const inGorge=(x,z)=>Math.abs(x)<GX && z>60 && z<DAMZ;
  const TUN=[], ARCH=d=>3.6+2.8*Math.sqrt(Math.max(0,1-d*d/25));   /* vòm hầm: nửa rộng 5 m, chân vòm 3,6 m, đỉnh 6,4 m */
  const tunLat=(x,z)=>{ let bd=99; for(const t of TUN){ const ax=x-t.px, az=z-t.pz, al=ax*t.ux+az*t.uz; if(al>-6 && al<t.L) bd=Math.min(bd,Math.abs(ax*t.uz-az*t.ux)); } return bd; };
  const inTunH=(x,z)=>HX.find(h=>{ if(!h.tun) return false; const [px,pz,ux,uz,L]=h.tun, t=(x-px)*ux+(z-pz)*uz; return t>-.3 && t<L-HR+2 && Math.abs((x-px)*uz-(z-pz)*ux)<5.4; });
  const inTun=(x,z)=>!!inTunH(x,z);
  const fbm=(x,z)=>Math.sin(x*.07+z*.05)*.6+Math.sin(x*.19-z*.13)*.3+Math.sin(x*.41+z*.37)*.12;
  // cao độ ngoài miệng vực: vành đỉnh +28 → đất thấp phía Nam +2 → thềm vành đai +2 quanh mép đảo (mặt đập +4)
  function hOut(x,z){ const d=Math.min(ZB-Math.abs(x), ZB-Math.abs(z)); if(d<0) return null; const base=lerp(GY,lerp(GY,4,clamp((70-Math.abs(x))/30,0,1)),ss(140,156,z));   /* bờ Đông eo: +4 (cầu dẫn G2) hạ êm 6,7 % về vành đai +2 */
    let kf=ss(.028,.07,Math.abs(re(x,z)-1.105)); kf=Math.min(kf,Math.max(ss(22,32,Math.abs(x)),ss(-132,-122,z))); for(const hx of HX) kf=Math.min(kf,ss(HR+10,HR+18,Math.hypot(x-hx.x,z-hx.z)));
    let h=lerp(RIM+fbm(x,z)*1.4*kf, base, ss(96,118,z)); if(d<11.5) h=base; else if(d<15.3) h=lerp(base,h,ss(11.5,15.3,d)); return h; }
  const BAY=bayModel({A, BZ, CZ, hOut:(x,z)=>hOut(x,z)});   /* vịnh thông biển (phương án B, 17/11): js/abyssal_bay.js */
  for(const h of HX){ /* hầm xe mới ở +19,7: từ giếng xoắn thẳng ra đường vành đai vịnh tại φ ±52° */ const J=BAY.el((h.s>0?52:128)*Math.PI/180,BAY.R.C), dx=J[0]-h.x, dz=J[1]-h.z, Lj=Math.hypot(dx,dz), vx=dx/Lj, vz=dz/Lj; let lo=HR, hi=Lj; for(let k=0;k<40;k++){ const m=(lo+hi)/2; if(re(h.x+vx*m,h.z+vz*m)>BAY.R.O) lo=m; else hi=m; }
    const px=h.x+vx*lo, pz=h.z+vz*lo; h.tun=[px,pz,-vx,-vz,lo]; h.J=J; h.TY=BAY.y(px-vx*.8,pz-vz*.8); TUN.push({px, pz, ux:-vx, uz:-vz, L:lo}); }
  const TYT=HX[0].TY;
  function hAt(x,z){ if(Math.abs(x)>=ZB || Math.abs(z)>=ZB){ /* hành lang cổng G1/G3 (G2 giờ là cầu dẫn +4 trên cửa eo) */ if(x>0 && Math.abs(z)<9) return GY; if(x<0 && Math.abs(z+16)<9) return GY; return null; }
    if(z>BAY.ZG && BAY.inStrait(x,z)) return -12; for(const h of HX) if(Math.hypot(x-h.x,z-h.z)<HR) return GY-.3; { const th=inTunH(x,z); if(th) return th.TY-.3; }
    if(re(x,z)<BAY.R.O) return BAY.y(x,z); return hOut(x,z); }
  EXTL.push({x0:-180, x1:180, z0:-180, z1:180, h:hAt, name:'QA/QC Abyssal Canyon Island'});

  /* ============================== VẬT LIỆU ============================== */
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.8, ...o}), M={
    rock: AK.makeStoneMaterial({col:'#6f6a66', joint:'#3d3a38', blockW:170, blockH:64, seed:31, rough:.92}), granite: AK.makeStoneMaterial({col:'#b9b4aa', joint:'#7a756c', blockW:128, blockH:64, seed:32, rough:.6}),
    wood: AK.makeWoodMaterial({col:'#8a5a32', plank:36, seed:33}), asphalt: std(0x1c2026,{roughness:.9}), conc: std(0xb9bcc0,{roughness:.85}), white: std(0xf2f4f5,{roughness:.5}), dark: std(0x23272e,{roughness:.5, metalness:.4}),
    gold: std(0xe8c040,{roughness:.3, metalness:.85}), steel: std(0xd5dbe2,{roughness:.2, metalness:1}), glass: new THREE.MeshPhysicalMaterial({color:0x9fd8ee, roughness:.05, metalness:.1, transparent:true, opacity:.3, depthWrite:false, side:THREE.DoubleSide, envMapIntensity:1.5}),
    ground: new THREE.MeshStandardMaterial({vertexColors:true, roughness:1}), rock2:null, fall:null, led: new THREE.MeshBasicMaterial({color:0x40e8ff}) };
  { const cv=document.createElement('canvas'); cv.width=64; cv.height=256; const g=cv.getContext('2d'); g.fillStyle='#7cc2e0'; g.fillRect(0,0,64,256); for(let i=0;i<460;i++){ const wv=i<210; g.fillStyle=wv?`rgba(30,104,150,${.14+Math.random()*.26})`:`rgba(255,255,255,${.22+Math.random()*.42})`; const px=Math.random()*64, py=Math.random()*256, w2=1+Math.random()*1.4, h2=18+Math.random()*90; g.fillRect(px,py,w2,h2); if(py+h2>256) g.fillRect(px,py-256,w2,h2); }
    const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; M.fallTex=t; M.fall=new THREE.MeshBasicMaterial({map:t, transparent:true, opacity:.93, depthWrite:false, side:THREE.DoubleSide}); }
  W.LUX=W.LUX||makeLux(THREE); try{ const LM=W.LUX.mk; M.granite=LM('TRAVERTINE_WARM'); M.white=LM('SANDSTONE_TRIM'); }catch(e){}   /* cấm nền trắng (đặc tả 0.2) */ M.rock2=M.rock.clone(); M.rock2.side=THREE.DoubleSide; M.deck=std(0x2fb5b0,{roughness:.25, metalness:.1}); M.frost=std(0x2fb5b0,{roughness:.2, metalness:.12});   /* mặt cầu / sàn sảnh đặc màu sáng – kính trong suốt nhìn thấu xuống tấm thép tối trông như lỗ hổng (Bình 17/11) */ const grp=new THREE.Group(); grp.name='abyssal'; scene.add(grp); const dyn=new THREE.Group(); dyn.userData.dynamic=true; scene.add(dyn);
  // dải tứ giác tự dựng: quad(p0,p1,p2,p3[,màu]) – mặt nhìn thấy theo (p1−p0)×(p3−p0); uv theo mét
  function QB(vc){ const pos=[], uv=[], col=[], c=new THREE.Color(); return { quad(p0,p1,p2,p3,u0=0,u1=1,v0=0,v1=1,hex){ for(const [q,u,v] of [[p0,u0,v0],[p1,u1,v0],[p2,u1,v1],[p0,u0,v0],[p2,u1,v1],[p3,u0,v1]]){ pos.push(q[0],q[1],q[2]); uv.push(u,v); if(vc){ c.set(hex); col.push(c.r,c.g,c.b); } } },
    mesh(mat,parent=grp,o={}){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); if(vc) g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals(); g.computeBoundingSphere(); const m=new THREE.Mesh(g,mat); m.receiveShadow=true; m.castShadow=!!o.cast; if(o.dynamic) m.userData.dynamic=true; parent.add(m); return m; } }; }
  const box=(w,h,d,mat,x,y,z,ry=0,parent=grp)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); m.rotation.y=ry; m.castShadow=m.receiveShadow=true; parent.add(m); return m; };
  const cyl=(r0,r1,h,mat,x,y,z,n=20,parent=grp)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,n),mat); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; parent.add(m); return m; };
  const rail=(pts,y,msg,o={})=>{ for(let i=0;i<pts.length-1;i++) addSeg(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],.14,o.y0??y-1.2,o.y1??y+2.2,msg); };   /* lan can chặn (va chạm theo đúng tầng) */
  const RLL=[], railVis=(pts,y)=>{ for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], L=Math.hypot(bx-ax,bz-az); if(L<.05) continue; const n=Math.max(1,Math.round(L/4)), ry=Math.atan2(-(bz-az),bx-ax); for(let k=0;k<n;k++){ const t=(k+.5)/n; RLL.push([ax+(bx-ax)*t, y, az+(bz-az)*t, ry, L/n]); } } };
  const RL={build(parent){ const g=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.95,.03),M.glass,RLL.length), t=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.05,.07),M.steel,RLL.length), m=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), v=new THREE.Vector3(), sc=new THREE.Vector3(); RLL.forEach(([x,y,z,ry,len],i)=>{ q.setFromEuler(e.set(0,ry,0)); m.compose(v.set(x,y+.5,z),q,sc.set(len,1,1)); g.setMatrixAt(i,m); m.compose(v.set(x,y+1.0,z),q,sc.set(len,1,1)); t.setMatrixAt(i,m); }); for(const im of [g,t]){ im.userData.dynamic=true; im.frustumCulled=false; parent.add(im); } }};
  const fence=(pts,y,msg,vis=true)=>{ rail(pts,y,msg); if(vis) railVis(pts,y); };

  /* ============================== 1. ĐỊA HÌNH: vành đỉnh + đất thấp + thềm vành đai (lưới 4 m, bỏ lòng vực / giếng xoắn) ============================== */
  { const RS=4, N=Math.round(360/RS)+1, q=QB(true), c=new THREE.Color(), colAt=(x,z,h)=>{ const n=.9+.14*Math.sin(x*.13+z*.07)*Math.cos(z*.11-x*.05); if(h<3.2) return c.setRGB(.56*n,.6*n,.44*n); if(h<24) return c.setRGB(.36*n,.34*n,.33*n); return c.setRGB(.33*n,.5*n,.26*n); };
    const hole=(x,z)=>re(x,z)<1.062 || (z>95 && BAY.inStrait(x,z,ZB+2)) || HX.some(h=>Math.hypot(x-h.x,z-h.z)<HR);
    const snap=(x,z)=>{ let best=null, bd=1e9; const tryP=(qx,qz)=>{ const d=Math.hypot(qx-x,qz-z); if(d<bd && !hole(qx,qz)){ bd=d; best=[qx,qz]; } }; const r=re(x,z); if(r<1.062){ const k=1.0623/Math.max(r,.01); tryP(x*k,CZ+(z-CZ)*k); }
      if(z>95 && BAY.inStrait(x,z,ZB+2)){ tryP(x>0?GX+.03:BAY.flareX(z)-.03,z); } for(const h of HX){ const d=Math.hypot(x-h.x,z-h.z); if(d<HR){ const k=(HR+.03)/Math.max(d,.01); tryP(h.x+(x-h.x)*k,h.z+(z-h.z)*k); } } return bd<7?best:null; };
    const NP=new Array(N*N), OUT=new Uint8Array(N*N), VI=new Int32Array(N*N).fill(-1), pos=[], col=[], idx=[]; for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const x=-180+i*RS, z=-180+j*RS, k=j*N+i; if(!hole(x,z)){ OUT[k]=1; NP[k]=[x,z]; } else NP[k]=snap(x,z); }
    const vtx=k=>{ if(VI[k]>=0) return VI[k]; const [x,z]=NP[k], h=hOut(clamp(x,-ZB+.01,ZB-.01),clamp(z,-ZB+.01,ZB-.01))??GY; colAt(x,z,h); pos.push(x,h,z); col.push(c.r,c.g,c.b); return VI[k]=pos.length/3-1; };
    for(let j=0;j<N-1;j++) for(let i=0;i<N-1;i++){ const a=j*N+i, b2=a+1, e=a+N, d=e+1; if(!(OUT[a]||OUT[b2]||OUT[e]||OUT[d]) || !NP[a] || !NP[b2] || !NP[e] || !NP[d]) continue; const va=vtx(a), ve=vtx(e), vd=vtx(d), vb=vtx(b2); idx.push(va,ve,vd,va,vd,vb); }
    { const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals(); const m=new THREE.Mesh(g,M.ground); m.receiveShadow=true; m.name='abyssal-terrain'; grp.add(m); }
    /* tường kè biển quanh đảo */ for(const [ax,az,bx,bz] of [[-180,-180,180,-180],[180,-180,180,180],[180,180,GX,180],[BAY.flareX(179.4),180,-180,180],[-180,180,-180,-180]]) q.quad([ax,GY+.2,az],[bx,GY+.2,bz],[bx,-6,bz],[ax,-6,az],0,1,0,1,0x8a8680);
    q.mesh(M.ground); }
  // VÁCH VỰC LIỀN KHỐI (Bình 17/11: "tường thì vuông vức được, nhưng địa hình núi phải cong mềm mại", không ghép khối rời):
  //  1 lưới liên tục 180 cột (dày gấp 8 quanh 2 cửa hầm) × 26 hàng; mặt cắt bo tròn 2 bậc cũ (chỉ LÙI vào núi, không nhô ra lòng vực → không chạm 2 cánh nhà),
  //  gợn đá tự nhiên, chân vách khoét đúng vòm cửa hầm, đỉnh vách phủ lên mép địa hình (ρ 1,0635, cao hơn 6 cm) → không khe lọt sáng, không gờ.
  const PROF=[[.995,-31],[1.0,-13],[1.022,-11],[1.03,9],[1.055,11],[1.062,RIM+.3]], rhoOld=y=>{ for(let k=0;k<PROF.length-1;k++){ const [ra,ya]=PROF[k], [rb,yb]=PROF[k+1]; if(y<=yb) return ra+(rb-ra)*clamp((y-ya)/(yb-ya),0,1); } return PROF[PROF.length-1][0]; };
  const rhoW=y=>{ let s=0; for(let k=-5;k<=5;k++) s+=rhoOld(clamp(y+k*.8,-31,RIM+.3)); return Math.max(rhoOld(y), s/11); };
  { /* vân đá tự nhiên (lặp liền mép): đốm sáng tối + vỉa ngang lượn sóng + khe nứt */ const cv=document.createElement('canvas'); cv.width=cv.height=512; const g=cv.getContext('2d'), rr=AK.rng(4242), W9=f=>{ for(const ox of [-512,0,512]) for(const oy of [-512,0,512]) f(ox,oy); };
    g.fillStyle='#6d6862'; g.fillRect(0,0,512,512);
    for(let i=0;i<1500;i++){ const x=rr()*512, y=rr()*512, r=2+rr()*13, dk=rr()<.5, a=.05+rr()*.11; g.fillStyle=dk?`rgba(40,36,34,${a})`:`rgba(172,164,152,${a*.9})`; W9((ox,oy)=>{ g.beginPath(); g.ellipse(x+ox,y+oy,r*1.9,r,0,0,TAU); g.fill(); }); }
    for(let i=0;i<30;i++){ const y0=rr()*512, am=2+rr()*5, ph=rr()*TAU, k=1+Math.floor(rr()*3); g.strokeStyle=`rgba(${rr()<.5?'35,32,30':'150,142,132'},${.16+rr()*.2})`; g.lineWidth=1+rr()*3; W9((ox,oy)=>{ if(ox) return; g.beginPath(); for(let x=0;x<=512;x+=8){ const y=y0+oy+am*Math.sin(x/512*TAU*k+ph); if(x===0) g.moveTo(x,y); else g.lineTo(x,y); } g.stroke(); }); }
    for(let i=0;i<60;i++){ const pts=[]; let x=rr()*512, y=rr()*512; pts.push([x,y]); for(let k=0;k<5;k++){ x+=(rr()-.5)*14; y+=6+rr()*14; pts.push([x,y]); } g.strokeStyle=`rgba(25,22,20,${.22+rr()*.3})`; g.lineWidth=1+rr()*1.5; W9((ox,oy)=>{ g.beginPath(); pts.forEach(([px2,py2],k)=>k?g.lineTo(px2+ox,py2+oy):g.moveTo(px2+ox,py2+oy)); g.stroke(); }); }
    const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; M.cliff=new THREE.MeshStandardMaterial({map:t, roughness:.95}); }
  { const NS=180, cols=[]; for(let i=0;i<NS;i++){ const f0=i/NS*TAU, c0=el(f0+TAU/NS/2,1.0), sub=tunLat(c0[0],c0[1])<12?8:1; for(let m=0;m<sub;m++) cols.push(f0+TAU/NS*m/sub); } cols.push(TAU);
    const skipF=f=>Math.abs(A*Math.cos(f))<GX+3 && Math.sin(f)>0, NR=26, pos=[], uv=[], idx=[], noise=(f,y)=>.0028*(.5+.5*Math.sin(f*31+y*.23)*Math.cos(f*11-y*.11)); let cum=0, prev=null;
    for(const f of cols){ const pb=el(f,1.0), dl=tunLat(pb[0],pb[1]), yb=dl<5?TYT+ARCH(dl):-31, nk=dl<8?0:1, tp=el(f,1.0635), T=Math.min(RIM+.3,(hOut(tp[0],tp[1])??RIM)+.06), q0=el(f,1.03); if(prev) cum+=Math.hypot(q0[0]-prev[0],q0[1]-prev[1]); prev=q0;
      for(let k=0;k<=NR;k++){ const y=yb+(T-yb)*k/NR, ro=k===NR?1.0635:rhoW(y)+nk*noise(f,y); pos.push(A*ro*Math.cos(f), y, CZ+BZ*ro*Math.sin(f)); uv.push(cum/14, y/9); } }
    for(let c=0;c<cols.length-1;c++){ if(skipF((cols[c]+cols[c+1])/2)) continue; const a=c*(NR+1), b=(c+1)*(NR+1); for(let k=0;k<NR;k++) idx.push(a+k,b+k,b+k+1, a+k,b+k+1,a+k+1); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); const m=new THREE.Mesh(g,M.cliff); m.receiveShadow=true; m.castShadow=true; m.name='abyssal-cliff'; grp.add(m); }
  M.water=null;   /* 17/11 phương án B: vịnh dùng chung mặt biển của game (−0,35) – bỏ đập, hồ ngầm, đường dạo đáy vực */

  /* ============================== 3. HAI CÁNH NHÀ GIẬT CẤP + SÀN/LAN CAN ĐẦU HỒI ============================== */
  // Cung tròn tâm (∓8,1; −4,8) bán kính 138,2 m ôm sát vách elip (lệch < 0,7 m, đo bằng node) → tầng trên cùng tựa đúng vào vách, các tầng dưới giật cấp nhô dần ra mặt hồ.
  const FH=4.5, NF=12, WD=12, SB=1.2, RTOP=137, RIN=RTOP-SB*(NF-1), WCZ=-4.8, TX0=-18, TX1=18, TZ0=-135.5, TZ1=-114, BRF=[7,11], yF=f=>FY+f*FH;
  const WING=[{k:'xanh', cx:-8.1, a0:3.38, a1:4.62, near:4.62, far:3.38, led:0x10b981, name:'QA · QC · QE ACADEMY & TECH HUB', seed:11, e:-1, nf:NF}, {k:'do', cx:8.1, a0:4.805, a1:6.045, near:4.805, far:6.045, led:0xff4466, name:'ABYSSAL HORIZON RESIDENCES', seed:23, e:1, nf:NF+2}];
  const brZ=f=>WCZ+Math.sin(4.62)*(RIN+SB*f-WD/2);   /* z của cầu nối cánh ↔ tháp ở tầng f (giữa mép đầu hồi) */
  const inWing=(x,z)=>WING.some(w=>{ const dx=x-w.cx, dz=z-WCZ, r=Math.hypot(dx,dz); let a=Math.atan2(dz,dx); if(a<0) a+=TAU; return r>RIN-WD-1 && r<RTOP+1 && a>w.a0-.01 && a<w.a1+.01; });
  for(const w of WING){ const fac=AK.makePBRFacade({cols:4, rows:2, balcony:true, seed:w.seed, tileW:12, tileH:FH*2, glassCol:w.k==='do'?'#4a3440':'#2e4a63', litCol:w.k==='do'?'#ffc890':'#bfe8ff'});
    const r=AK.buildCurvedTerraceWing(W,{cx:w.cx, cz:WCZ, rIn:RIN, depth:WD, a0:w.a0, a1:w.a1, floors:w.nf, floorH:FH, baseY:FY, setback:SB, facing:'in', led:w.led, facade:fac, parent:grp, name:'abyssal-'+w.k, seed:w.seed}); w.floors=r.floors;
    r.group.traverse(o=>{ if(o.isInstancedMesh && o.count>300){ const m=new THREE.Matrix4(); let n=0; for(let i=0;i<o.count;i+=4){ o.getMatrixAt(i,m); o.setMatrixAt(n++,m); } o.count=n; o.instanceMatrix.needsUpdate=true; } });
    for(const fl of r.floors){ const y=fl.y, lo=Math.min(fl.rOut,fl.rWall), hi=Math.max(fl.rOut,fl.rWall), P2=(a,rr)=>[w.cx+Math.cos(a)*rr,WCZ+Math.sin(a)*rr];
      /* vách sau (mặt tiền) chặn người */ for(let i=0;i<24;i++){ const a=w.a0+(w.a1-w.a0)*i/24, b=w.a0+(w.a1-w.a0)*(i+1)/24, p=P2(a,hi-.3), q2=P2(b,hi-.3); addSeg(p[0],p[1],q2[0],q2[1],.2,y-.4,y+3.6,'🏢 Mặt tiền – nội thất các tầng sẽ mở ở bước sau'); }
      /* đầu hồi xa tháp: kín; đầu hồi sát tháp: hở đúng chỗ cầu kính ở tầng 4/8/12 */ if(fl.f===0){ for(const a of [w.far,w.near]){ fence([P2(a,lo),P2(a,lo+4.8)],y,'🌊 Lan can mép hồ'); rail([P2(a,hi-.4),P2(a,hi+17)],y,'⛰️ Khe sau nhà – không có lối đi'); } continue; } { const LR1=Math.max(128.4,lo+3.5), g0=Math.max(lo+.3,122.1), g1=Math.min(hi-.4,LR1-.1), mf='🚧 Lan can đầu hồi – sảnh thang máy ở giữa'; if(g1-g0>1.2){ fence([P2(w.far,lo),P2(w.far,g0)],y,mf); if(hi-.4>g1+.3) fence([P2(w.far,g1),P2(w.far,hi)],y,mf); } else fence([P2(w.far,lo),P2(w.far,hi)],y,mf); }
      const n0=P2(w.near,lo), n1=P2(w.near,hi); if(!BRF.includes(fl.f)) fence([n0,n1],y,'🚧 Lan can đầu hồi'); else { const zc=brZ(fl.f), pt=z=>[n0[0]+(n1[0]-n0[0])*(z-n0[1])/(n1[1]-n0[1]),z]; fence([n0,pt(zc+2)],y,'🚧 Lan can đầu hồi'); fence([pt(zc-2),n1],y,'🚧 Lan can đầu hồi'); } }
    const mid=(w.a0+w.a1)/2, tp=r.floors[w.nf-1], tlo=Math.min(tp.rOut,tp.rWall), thi=Math.max(tp.rOut,tp.rWall); makeLabel((w.k==='xanh'?'🎓 ':'🏙️ ')+w.name, w.k==='xanh'?'12 tầng học viện & phòng ban QA bám vách đá · lên bằng thang máy':'Chung cư luxury 14 tầng bám vách (2 tầng penthouse vượt đỉnh núi) · căn hộ mở bán ở bước sau', {h:.7, x:w.cx+Math.cos(mid)*(tlo-2), y:yF(w.nf)+4, z:WCZ+Math.sin(mid)*(tlo-2), fade:200});
    /* mái + bảng chữ phát sáng trên đỉnh */ { const m=new THREE.Mesh(AK.arcSlab(tlo-.4, thi+.6, w.a0, w.a1, .5, .12),M.white); m.position.set(w.cx,yF(w.nf)-.5,WCZ); m.castShadow=true; grp.add(m);
      const cv=document.createElement('canvas'); cv.width=1024; cv.height=96; const g2=cv.getContext('2d'); g2.fillStyle='#0b1220'; g2.fillRect(0,0,1024,96); g2.fillStyle=w.k==='xanh'?'#6dffb0':'#ffc0c8'; g2.font='bold 56px sans-serif'; g2.textAlign='center'; g2.textBaseline='middle'; g2.fillText(w.name,512,50,990);
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(36,3.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv)})); sg.position.set(w.cx+Math.cos(mid)*(tlo+.3),yF(w.nf)+2,WCZ+Math.sin(mid)*(tlo+.3)); sg.rotation.y=Math.atan2(-Math.cos(mid),-Math.sin(mid)); sg.userData.dynamic=true; grp.add(sg); } }

  /* ============================== 4. THÁP THANG MÁY KÍNH ĐÔI + CẦU KÍNH + THANG MÁY CHẠY THẬT ============================== */
  const STOPS=[yF(7), 16, yF(11), RIM], SNAME=['Tầng 8 – bãi cát vịnh','Sảnh kính +16','Tầng 12 – cầu kính','Đỉnh núi (+28 m)'], DECO=[];
  { /* 2 trục kính 9 × 9 m sát vách + khung vàng + chóp + thác giữa */ for(const e of [-1,1]){ const sx=e*9, sz=-140.5; box(9,76,9,M.glass,sx,-4,sz).userData.dynamic=true; for(const [dx,dz] of [[-4.5,-4.5],[4.5,-4.5],[-4.5,4.5],[4.5,4.5]]) box(.45,76,.45,M.gold,sx+dx,-4,sz+dz); for(let y=-36;y<=32;y+=8.5) for(const dz of [-4.5,4.5]) box(9,.26,.26,M.gold,sx,y,sz+dz); const cap=new THREE.Mesh(new THREE.ConeGeometry(6.4,7,4),M.gold); cap.rotation.y=Math.PI/4; cap.position.set(sx,37.5,sz); grp.add(cap); circles.push({x:sx,z:sz,r:4.9});
      for(const dz of [-3,3]){ const c=new THREE.Mesh(new THREE.CapsuleGeometry(1.1,1.6,4,10),M.glass); c.position.set(sx+e*5.7,0,sz+dz); c.userData.dynamic=true; dyn.add(c); DECO.push(c); } }
    const wf=new THREE.Mesh(new THREE.PlaneGeometry(8.6,58),M.fall); { const uv=wf.geometry.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*1.1,uv.getY(i)*2.6); } wf.position.set(0,-1,-141.5); wf.userData.dynamic=true; dyn.add(wf); box(9,1.2,5,M.rock,0,RIM-.3,-145); rail([[-4.7,-147.7],[-4.7,-142.3],[4.7,-142.3],[4.7,-147.7],[-4.7,-147.7]],RIM,'🌊 Gờ đá đầu thác – không bước lên được');
    /* sàn sảnh kính từng điểm dừng = CẦU KÍNH xuyên tháp nối 2 cánh; mép sảnh hở đúng chỗ nối sang đầu hồi 2 cánh */ STOPS.forEach((y,i)=>{ if(i===1) return;   /* +16: đĩa kính Hydro-Pulse (abyssal_amenities.js) thay sàn sảnh */ const top=i===STOPS.length-1, z0=top?-157.5:TZ0, z1=top?-108:TZ1; { const solid=top||i===0; if(top){ for(const [bx0,bx1,bz0,bz1] of [[TX0,TX1,-135.5,z1],[TX0,TX1,z0,-138.02],[TX0,-2.98,-138.02,-135.5],[-.42,.42,-138.02,-135.5],[2.98,TX1,-138.02,-135.5]]) box(bx1-bx0,.3,bz1-bz0,M.granite,(bx0+bx1)/2,y-.12,(bz0+bz1)/2); } else box(TX1-TX0,.3,z1-z0,solid?M.granite:M.frost,0,y-.15,(z0+z1)/2);   /* đài đỉnh cao hơn mặt đất đỉnh núi 3 cm (không trùng mặt) */ if(!top) for(const z of [z0,z1]) box(TX1-TX0,.4,.4,M.steel,0,y-.3,z); } addPlat(0,(z0+z1)/2,0,(TX1-TX0)/2,(z1-z0)/2,y);
        const bi=i===0?0:i===2?1:-1; if(i===1) fence([[TX0,z0+.3],[TX0,z1],[TX1,z1],[TX1,z0+.3]],y,'🚧 Lan can sảnh kính +16 – ngắm vịnh'); if(bi>=0){ const zc=brZ(BRF[bi]); for(const e of [-1,1]){ box(4.2,.26,4,M.frost,e*20,y-.11,zc); addPlat(e*20,zc,0,2.6,2,y); for(const z of [zc-2,zc+2]) fence([[e*18,z],[e*22.4,z]],y,'🚧 Lan can cầu kính'); fence([[e*18,z0],[e*18,zc-2]],y,'🚧 Lan can cầu kính xuyên tháp'); fence([[e*18,zc+2],[e*18,z1]],y,'🚧 Lan can cầu kính xuyên tháp'); } if(i!==0) fence([[TX0,z1],[TX1,z1]],y,'🚧 Lan can cầu kính – ngắm vịnh bên dưới'); rail([[TX0,z0],[-3.15,z0]],y,'⛰️ Vách đá sau tháp'); rail([[3.15,z0],[TX1,z0]],y,'⛰️ Vách đá sau tháp'); }
        if(top){ fence([[TX0,-155.6],[TX0,z1],[TX1,z1],[TX1,-155.6]],y,'🚧 Lan can đài ngắm đỉnh thác'); } });
    makeLabel('🚪 Hydro-Pulse Core','Tháp thang máy kính đôi 76 m · bước vào cabin rồi chọn tầng trên bảng nút',{h:.7, x:0, y:yF(7)+7, z:TZ1+2, fade:120}); }
  const FNAME={xanh:['Đại sảnh Học viện & Cấp chứng chỉ','Manual Technical & ISTQB Academy','Game QA & Hitbox Profiler Lab','ERP · POS · Payment Gateway Lab','CI/CD · Docker · TestOps Grid','Security & Pentest Vault','Mobile Testing & Real Device Farm','API Testing & Microservices','Playwright & Web Automation','Performance & Load Testing Lab','AI-Driven QA & Chaos Engineering','Sky Billiards Lounge'], do:['Sảnh Abyssal Horizon Residences','Sky-Condo 1','Sky-Condo 2','Sky-Condo 3','Sky-Condo 4','Sky-Condo 5','Sky-Condo 6','Sky-Condo 7','Sky-Condo 8','Sky-Condo 9','Sky-Condo 10','Sky-Condo 11','Duplex Cliff Penthouse (tầng dưới)','Duplex Cliff Penthouse (tầng trên – trên đỉnh núi)']};
  const LIFTK=[];   /* thang máy bộ liftkit (cabin bước vào, cửa trượt, bảng nút) */
  LIFTK.push(...makeLiftBank(W,{x:0, z:-136.78, yaw:0, count:2, name:'Thang Hydro-Pulse', color:0xe8c040, floors:[{y:yF(7), name:'Bãi cát vịnh · tầng 8', short:'B'},{y:9.2, name:'Đĩa kính lounge +9', short:'D1'},{y:16, name:'Đĩa kính lounge +16 · cầu sang đảo', short:'D2'},{y:yF(11), name:'Tầng 12 · cầu kính', short:'12'},{y:24.5, name:'Đĩa kính lounge +24', short:'D3'},{y:RIM, name:'Đỉnh núi +28 · Sky-Shaft Drive-In', short:'★'}]}));
  for(const w of WING){ /* giếng thang đứng ngoài đầu hồi phía thác (các tầng giật cấp 1,2 m nên không có đường thẳng đứng nào xuyên hết các sân tầng) – mỗi tầng có 1 sảnh thang nối sân tầng ↔ cửa thang */
    const a=w.far, ca=Math.cos(a), sa=Math.sin(a), Tx=-w.e*sa, Tz=w.e*ca, E=(r,s2=0)=>[w.cx+ca*r+Tx*s2,WCZ+sa*r+Tz*s2], R0=122, S0=2.3, RS=125.2, fls=[], ms='🚧 Lan can sảnh thang';
    for(const fl of w.floors){ const y=fl.y, lo=Math.min(fl.rOut,fl.rWall), hi=Math.max(fl.rOut,fl.rWall), R1=Math.max(128.4,lo+3.5); fls.push({y, name:`Tầng ${fl.f+1} · ${FNAME[w.k][fl.f]}`, short:String(fl.f+1)}); { const lp=E(RS,1.0); makeLabel(`Tầng ${fl.f+1} · ${FNAME[w.k][fl.f]}`, null, {h:.34, x:lp[0], y:y+3.3, z:lp[1], fade:30}); }
      if(fl.f===0) continue; const c=E((R0+R1)/2,S0/2-.1); box(R1-R0,.22,S0+.3,M.white,c[0],y-.12,c[1],-a); addPlat(c[0],c[1],Math.atan2(Tx,Tz),(R1-R0)/2,(S0+.3)/2,y);
      fence([E(R0,-.2),E(R0,S0+.05)],y,ms); fence([E(R1,-.2),E(R1,S0+.05)],y,ms); if(R1>128.35) fence([E(128.25,S0+.05),E(R1,S0+.05)],y,ms); rail([E(R0,S0+.05),E(122.25,S0+.05)],y,ms); rail([E(124.85,S0+.05),E(125.55,S0+.05)],y,ms);
      if(lo+.3>R0+.25) fence([E(R0,-.2),E(lo+.3,-.2)],y,ms); if(R1>hi-.3) rail([E(hi-.4,-.2),E(R1,-.2)],y,'🏢 Đầu hồi nhà'); }
    const bc=E(RS,S0+1.22); LIFTK.push(...makeLiftBank(W,{x:bc[0], z:bc[1], yaw:Math.atan2(-Tx,-Tz), count:2, name:w.k==='xanh'?'Thang Học viện':'Thang Residences', color:w.led, floors:fls})); }


  /* mục 5–7 cũ (ốc đảo + 8 đảo công cụ, sân khấu nhạc nước, bến kayak, 24 shophouse chân vách) bỏ 17/11: đáy vực thành vịnh biển. Đảo khách sạn +14, 8 pavilion → abyssal_bay.js / abyssal_hotel.js */
  const OC=[0,-12], SAT=[], ST=null, KD=null, KY={on:false};

  /* ============================== 8. 2 ĐƯỜNG XOẮN Ô TÔ 2 LÀN (vành đai +2 ↔ đáy vực −29 ↔ đỉnh +28) + HẦM XE + BÃI ĐỖ ĐÁY VỰC ============================== */
  // Bình 17/11: "làm đường trải nhựa cho xe hơi lưu thông xuống luôn… mỗi bên 1 làn… sao chạy dằn dữ vậy… sao cấm ngay đó vậy".
  //  • Mặt đường là DẢI LIỀN (bước 2°, không ghép hộp): nhựa 9 m = 2 làn 3,5 m + lề, vạch tim vàng đứt + 2 vạch mép trắng, lan can bê tông 2 mép, gờ + mặt dưới.
  //  • Dốc ≤ 9 % (đoạn dưới 7,9 %, đoạn trên 8,9 %), mặt đi bậc 5° (≤ 0,11 m) → xe chạy êm; mép không còn khe giữa các tấm.
  //  • 3 chiếu nghỉ PHẲNG mở ra ngoài (lan can mở đúng chỗ, sân nhựa hình quạt nối ra): đáy (hầm xe → bãi đỗ & quay đầu) · +2 (nhánh 2 làn ra vành đai) · +28 (ra đường đỉnh vách).
  const ROADS=[], RAMPS=[], PLAZA=[], HRC=14, HWD=9, DEG=Math.PI/180, RIn=HRC-HWD/2, ROut=HRC+HWD/2, md=v=>((v%360)+360)%360;
  for(const m of [M.asphalt]){ m.polygonOffset=true; m.polygonOffsetFactor=-2; m.polygonOffsetUnits=-4; }
  M.lineW=new THREE.MeshStandardMaterial({color:0xf3f3ee, roughness:.6, polygonOffset:true, polygonOffsetFactor:-5, polygonOffsetUnits:-10}); M.lineY=new THREE.MeshStandardMaterial({color:0xf2c230, roughness:.6, polygonOffset:true, polygonOffsetFactor:-5, polygonOffsetUnits:-10}); M.parap=std(0xc8cbcf,{roughness:.85});
  // dải mặt có hướng: f(p0,p1,p2,p3,want) tự đảo thứ tự đỉnh cho pháp tuyến cùng chiều want
  function FB(){ const pos=[], uv=[]; return { f(p0,p1,p2,p3,want,u0=0,u1=1,v0=0,v1=1){ const ax=p1[0]-p0[0], ay=p1[1]-p0[1], az=p1[2]-p0[2], bx=p3[0]-p0[0], by=p3[1]-p0[1], bz=p3[2]-p0[2], nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx;
      const q=(nx*want[0]+ny*want[1]+nz*want[2])>=0 ? [[p0,u0,v0],[p1,u1,v0],[p2,u1,v1],[p0,u0,v0],[p2,u1,v1],[p3,u0,v1]] : [[p0,u0,v0],[p3,u0,v1],[p2,u1,v1],[p0,u0,v0],[p2,u1,v1],[p1,u1,v0]]; for(const [p,u,v] of q){ pos.push(p[0],p[1],p[2]); uv.push(u,v); } },
    mesh(mat,name){ if(!pos.length) return null; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.computeVertexNormals(); g.computeBoundingSphere(); const m=new THREE.Mesh(g,mat); m.receiveShadow=true; if(name) m.name=name; grp.add(m); return m; } }; }
  const UP=[0,1,0], DN=[0,-1,0], RB={a:FB(), p:FB(), w:FB(), y:FB()}, COLS=[];
  // đường nhựa theo đường gấp khúc (mặt yf): nhựa + 2 vạch mép trắng liền + vạch tim vàng đứt 3 m
  function road(pts, w, yf){ let v=0; for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], L=Math.hypot(bx-ax,bz-az); if(L<.01) continue; const n=Math.max(1,Math.ceil(L)), tx=(bx-ax)/L, tz=(bz-az)/L, nx=tz, nz=-tx;
      for(let k=0;k<n;k++){ const s0=L*k/n, s1=L*(k+1)/n, Q=(s2,off,dy=0)=>{ const x=ax+tx*s2+nx*off, z=az+tz*s2+nz*off; return [x,yf(x,z)+dy,z]; };
        RB.a.f(Q(s0,-w/2),Q(s1,-w/2),Q(s1,w/2),Q(s0,w/2),UP,(v+s0)*.2,(v+s1)*.2,0,w*.2);
        for(const e of [-1,1]){ const off=e*(w/2-.55); RB.w.f(Q(s0,off-.08,.012),Q(s1,off-.08,.012),Q(s1,off+.08,.012),Q(s0,off+.08,.012),UP); }
        if(Math.floor((v+(s0+s1)/2)/3)%2===0) RB.y.f(Q(s0,-.08,.012),Q(s1,-.08,.012),Q(s1,.08,.012),Q(s0,.08,.012),UP); }
      v+=L; } }
  for(const h of HX){ const [px,pz,tux,tuz,TL]=h.tun, dir=h.s, tht=Math.atan2(pz-h.z,px-h.x), a0=tht-dir*20*DEG;   /* d = độ quay từ đầu đường (đáy, ngay cửa hầm); Đông quay thuận, Tây đối xứng gương */
    const b1=md((90-a0/DEG)*dir), D1=b1+360*Math.ceil((1560-b1)/360), b2=md((270-a0/DEG)*dir), D2=b2+360*Math.ceil((D1+1236-b2)/360)+360, dM=20+360*Math.round((D1+840)/360), lm1=dM-24, lm2=dM+24;   /* D1: chiếu nghỉ +2 ở đúng hướng Nam · D2: chiếu nghỉ đỉnh ở hướng Bắc */
    const lo1=6*Math.floor((D1-24)/6), hi1=6*Math.ceil((D1+24)/6), lo3=6*Math.floor((D2-24)/6), DE=6*Math.ceil((D2+20)/6), OPEN=[[lo1,hi1],[lm1,lm2],[lo3,DE]];
    const Y1=GY+.03, YM=h.TY+.03, Y2=RIM+.03, lc=hi1+2, ld=lo3-2, EE=.04, sm=t=>t<EE?t*t/(2*EE*(1-EE)):t>1-EE?1-(1-t)*(1-t)/(2*EE*(1-EE)):(t-EE/2)/(1-EE);
    const yAt=d=>d<=lc?Y1:d<lm1?Y1+(YM-Y1)*sm((d-lc)/(lm1-lc)):d<=lm2?YM:d<ld?YM+(Y2-YM)*sm((d-lm2)/(ld-lm2)):Y2;
    const ang=d=>a0+dir*d*DEG, P3=(d,r,dy=0)=>{ const a=ang(d); return [h.x+Math.cos(a)*r,yAt(d)+dy,h.z+Math.sin(a)*r,a]; }, pt=(d,r,dy=0)=>{ const a=ang(d); return [h.x+Math.cos(a)*r,yAt(d)+dy,h.z+Math.sin(a)*r]; }, ptY=(d,r,y)=>{ const a=ang(d); return [h.x+Math.cos(a)*r,y,h.z+Math.sin(a)*r]; };
    const isOpen=d=>OPEN.some(([a,b])=>d>a && d<b), inSec=(f,[a,b])=>{ let d=md((f-a0)/DEG*dir); d+=360*Math.ceil((a-d)/360); return d<=b; };
    Object.assign(h,{P3, yAt, D1, D2, DE, dM, lo1, a0, dir, tht, OPEN, top:[h.x,h.z-HR-8]});
    /* mặt đường + mặt dưới + gờ mép ngoài + lan can bê tông 2 bên (ngoài: hở ở 3 chiếu nghỉ) + vạch kẻ */
    for(let d0=lo1; d0<DE-1e-6; d0+=2){ const d1=Math.min(DE,d0+2), dm=(d0+d1)/2, am=ang(dm), out=[Math.cos(am),0,Math.sin(am)], inn=[-out[0],0,-out[2]], u0=d0*DEG*HRC*.2, u1=d1*DEG*HRC*.2, op=isOpen(dm);
      RB.a.f(pt(d0,RIn),pt(d1,RIn),pt(d1,ROut),pt(d0,ROut),UP,u0,u1,0,1.8);
      RB.p.f(pt(d0,RIn,-.45),pt(d1,RIn,-.45),pt(d1,ROut,-.45),pt(d0,ROut,-.45),DN); RB.p.f(pt(d0,ROut,-.45),pt(d1,ROut,-.45),pt(d1,ROut,0),pt(d0,ROut,0),out);
      RB.p.f(pt(d0,RIn+.5),pt(d1,RIn+.5),pt(d1,RIn+.5,.9),pt(d0,RIn+.5,.9),out); RB.p.f(pt(d0,RIn,.9),pt(d1,RIn,.9),pt(d1,RIn+.5,.9),pt(d0,RIn+.5,.9),UP);
      if(!op){ RB.p.f(pt(d0,ROut-.5),pt(d1,ROut-.5),pt(d1,ROut-.5,1),pt(d0,ROut-.5,1),inn); RB.p.f(pt(d0,ROut-.5,1),pt(d1,ROut-.5,1),pt(d1,ROut,1),pt(d0,ROut,1),UP); RB.p.f(pt(d0,ROut,0),pt(d1,ROut,0),pt(d1,ROut,1),pt(d0,ROut,1),out);
        RB.w.f(pt(d0,ROut-1.05,.012),pt(d1,ROut-1.05,.012),pt(d1,ROut-.89,.012),pt(d0,ROut-.89,.012),UP); }
      RB.w.f(pt(d0,RIn+.89,.012),pt(d1,RIn+.89,.012),pt(d1,RIn+1.05,.012),pt(d0,RIn+1.05,.012),UP);
      if(Math.floor(dm*DEG*HRC/3)%2===0) RB.y.f(pt(d0,HRC-.08,.012),pt(d1,HRC-.08,.012),pt(d1,HRC+.08,.012),pt(d0,HRC+.08,.012),UP); }
    /* mặt đi: tấm bậc 5° (≤ 0,11 m/bậc), phủ kín cả mép ngoài; lan can chặn theo đúng tầng */
    for(let d0=lo1; d0<DE-1e-6; d0+=5){ const d1=Math.min(DE,d0+5), dm=(d0+d1)/2, q=P3(dm,HRC), tx=-Math.sin(q[3])*dir, tz=Math.cos(q[3])*dir; addPlat(q[0],q[2],Math.atan2(tx,tz),HWD/2+.1,ROut*Math.sin((d1-d0)/2*DEG)+.06,yAt(dm)); }
    for(let d0=lo1; d0<DE-1e-6; d0+=6){ const d1=Math.min(DE,d0+6), dm=(d0+d1)/2, y=yAt(dm), i0=ptY(d0,RIn+.6,0), i1=ptY(d1,RIn+.6,0); addSeg(i0[0],i0[2],i1[0],i1[2],.15,y-1,y+2.4,'🛣️ Lan can trong đường xoắn');
      if(!isOpen(dm)){ const o0=ptY(d0,ROut-.3,0), o1=ptY(d1,ROut-.3,0); addSeg(o0[0],o0[2],o1[0],o1[2],.15,y-1,y+2.4,'🛣️ Lan can đường xoắn – lối ra ở chiếu nghỉ đáy / +2 / đỉnh'); } }
    for(const d of [lo1,DE]){ const a=ang(d), r1=HR+.05, c=[h.x+Math.cos(a)*(RIn+r1)/2, h.z+Math.sin(a)*(RIn+r1)/2]; box(r1-RIn,1.0,.5,M.parap,c[0],yAt(d)+.5,c[1],-a); const e0=ptY(d,RIn,0), e1=ptY(d,r1,0); addSeg(e0[0],e0[2],e1[0],e1[2],.3,yAt(d)-1,yAt(d)+2.4,'🛣️ Đầu đường xoắn – quay xe ở chiếu nghỉ'); }
    /* sân nhựa hình quạt ở 3 chiếu nghỉ (thấp hơn mặt đường 1,5 cm, nối kín ra hầm / ra mặt đất) + mặt đi + lan can 2 cạnh */
    const apron=(dA,dB,r0,r1,y)=>{ for(let d0=dA; d0<dB-1e-6; d0+=2){ const d1=Math.min(dB,d0+2); RB.a.f(ptY(d0,r0,y-.015),ptY(d1,r0,y-.015),ptY(d1,r1,y-.015),ptY(d0,r1,y-.015),UP); }
      for(let d0=dA; d0<dB-1e-6; d0+=6){ const d1=Math.min(dB,d0+6), a=ang((d0+d1)/2), rm=(r0+r1)/2, tx=-Math.sin(a)*dir, tz=Math.cos(a)*dir; addPlat(h.x+Math.cos(a)*rm,h.z+Math.sin(a)*rm,Math.atan2(tx,tz),(r1-r0)/2,r1*Math.sin((d1-d0)/2*DEG)+.1,y); } };
    apron(lm1,lm2,17.6,HR+.45,YM); apron(lo1,hi1,17.6,HR+1.6,Y1); apron(lo3,DE,17.6,HR+1.6,Y2);
    const sideRail=(d,r0,r1,y)=>{ const e0=ptY(d,r0,0), e1=ptY(d,r1,0); fence([[e0[0],e0[2]],[e1[0],e1[2]]],y,'🚧 Lan can miệng giếng đường xoắn'); };
    sideRail(lm1,ROut-.4,HR-.05,YM); sideRail(lm2,ROut-.4,HR-.05,YM); sideRail(lo1,ROut-.4,HR+.6,Y1); sideRail(hi1,ROut-.4,HR+.6,Y1); sideRail(lo3,ROut-.4,HR+.6,Y2);
    { const tw=Math.asin(5/(HR-.1))/DEG; for(const [dA,dB] of [[lm1,dM-tw-.2],[dM+tw+.2,lm2]]){ const run=[]; for(let k=0;k<=4;k++){ const q=ptY(dA+(dB-dA)*k/4,HR-.1,0); run.push([q[0],q[2]]); } rail(run,YM,'⛰️ Vách giếng'); } }   /* 2 hốc nhỏ giữa vách hầm và lan can – chặn sát vách giếng, chừa đúng miệng hầm */
    /* lõi bê tông giữa (sát lan can trong) + sàn đáy giếng + cột đỡ mép ngoài (bỏ ở 3 chiếu nghỉ) */
    cyl(RIn,RIn,RIM+1.5-GY,M.conc,h.x,(RIM+.9+GY)/2,h.z,40); circles.push({x:h.x,z:h.z,r:RIn-.1});
    { const g=new THREE.RingGeometry(RIn-.1,HR+.1,64,1); g.rotateX(-Math.PI/2); const m=new THREE.Mesh(g,M.granite); m.position.set(h.x,GY-.02,h.z); m.receiveShadow=true; grp.add(m); }
    for(let k=0;k<20;k++){ const al=k*18*DEG; if(inSec(al,[lm1-8,lm2+8]) || inSec(al,[lo1-8,hi1+8]) || inSec(al,[lo3-8,DE+8])) continue; let d=md((al-a0)/DEG*dir); while(d+360<=DE) d+=360; const top=yAt(d)-.45; COLS.push([h.x+Math.cos(al)*(ROut-.25),(top+GY-.3)/2,h.z+Math.sin(al)*(ROut-.25),top-(GY-.3)]); }
    /* vách giếng: vân đá liền (u theo chu vi, v theo cao độ từng đỉnh), đỉnh vách hạ dưới mặt sân ở 2 lối ra mặt đất */
    { const NW=120, yB=(x,z)=>{ const dd=tunLat(x,z); return dd<5?h.TY+ARCH(dd):GY-.3; }, topY=f=>{ let t=(hOut(h.x+Math.cos(f)*(HR+2),h.z+Math.sin(f)*(HR+2))??GY)+.2; if(inSec(f,[lo1-2,hi1+2])) t=Math.min(t,GY-.06); if(inSec(f,[lo3-2,DE+2])) t=Math.min(t,RIM-.06); return t; }, pos=[], uv=[], idx=[];
      for(let i=0;i<=NW;i++){ const f=i/NW*TAU, x=h.x+Math.cos(f)*HR, z=h.z+Math.sin(f)*HR, y0=yB(x,z), y1=topY(f), u=i*HR*TAU/NW/14; pos.push(x,y0,z, x,y1,z); uv.push(u,y0/9, u,y1/9); }
      for(let i=0;i<NW;i++){ const a=i*2, b=a+2; idx.push(a,b,b+1, a,b+1,a+1); } const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); const m=new THREE.Mesh(g,M.rock); m.receiveShadow=true; grp.add(m); }
    /* phần vách giếng DƯỚI miệng hầm (từ sàn giếng +1,7 lên tới nền hầm) */ { const q=QB(false), NW=120; let prev=null; for(let i=0;i<=NW;i++){ const f=i/NW*TAU, x=h.x+Math.cos(f)*HR, z=h.z+Math.sin(f)*HR, ok=tunLat(x,z)<5.6; if(ok && prev) q.quad([prev[0],GY-.3,prev[1]],[x,GY-.3,z],[x,h.TY-.01,z],[prev[0],h.TY-.01,prev[1]],0,1,0,2); prev=ok?[x,z]:null; } const rm=M.rock.clone(); rm.side=THREE.DoubleSide; q.mesh(rm); }
    /* hầm xe: vòm đá liền từ mặt vách tới ĐÚNG vách giếng (đầu ống cắt theo cung giếng, lấn 25 cm – hết khe hở lọt sáng), nền nhựa 2 làn */
    { const TYh=h.TY, ux=tux, uz=tuz, L=TL, e0=-.3, e1=L-HR+1.5, mx=px+ux*(e0+e1)/2, mz=pz+uz*(e0+e1)/2, ry=Math.atan2(ux,uz), nx=uz, nz=-ux; addPlat(mx,mz,ry,5,(e1-e0)/2,TYh+.03);
      const t0=-1.1, tEnd=d=>L-Math.sqrt(Math.max(0,HR*HR-d*d))+.25, P3d=(e,d,y)=>[px+ux*e+nx*d,y,pz+uz*e+nz*d], PF=[[-5,TYh-.05]]; for(let j=0;j<=18;j++){ const d=-5+10*j/18; PF.push([d,TYh+ARCH(Math.abs(d))]); } PF.push([5,TYh-.05]);
      { const q=QB(false); for(let j=0;j<PF.length-1;j++){ const a=PF[j], b=PF[j+1]; q.quad(P3d(t0,a[0],a[1]),P3d(tEnd(a[0]),a[0],a[1]),P3d(tEnd(b[0]),b[0],b[1]),P3d(t0,b[0],b[1]),0,(L-HR-t0)*.12,j*.11,(j+1)*.11); } const rm=M.rock.clone(); rm.side=THREE.DoubleSide; q.mesh(rm); }
      { const q=QB(false); q.quad(P3d(.6,5,TYh-.01),P3d(tEnd(5),5,TYh-.01),P3d(tEnd(-5),-5,TYh-.01),P3d(.6,-5,TYh-.01),0,3,0,1); q.mesh(M.rock2);   /* nền đá bắt đầu TRONG cửa hầm (ngoài cửa là sàn phố) – không còn 2 mặt gần trùng nhau */ }
      { /* vành đá ốp cửa hầm phía phố: dày 0,7 m, nhô 0,35 m khỏi mặt vách */ const q=QB(false), OF=PF.map(([d,y])=>[d*1.14,TYh+(y-TYh)*1.11+(y>TYh?.25:0)]), fz=t0-.35, bz=t0+.9; for(let j=0;j<PF.length-1;j++){ const a=PF[j], b=PF[j+1], oa=OF[j], ob=OF[j+1]; q.quad(P3d(fz,a[0],a[1]),P3d(fz,b[0],b[1]),P3d(fz,ob[0],ob[1]),P3d(fz,oa[0],oa[1]),j*.2,(j+1)*.2,0,.3); q.quad(P3d(fz,oa[0],oa[1]),P3d(fz,ob[0],ob[1]),P3d(bz,ob[0],ob[1]),P3d(bz,oa[0],oa[1]),j*.2,(j+1)*.2,.3,.8); q.quad(P3d(fz,b[0],b[1]),P3d(fz,a[0],a[1]),P3d(t0+.1,a[0],a[1]),P3d(t0+.1,b[0],b[1]),j*.2,(j+1)*.2,.8,1); } const pm=M.conc.clone(); pm.side=THREE.DoubleSide; q.mesh(pm); }
      for(const e of [-1,1]) addSeg(px+ux*2+nx*e*5,pz+uz*2+nz*e*5,px+ux*(L-HR+.1)+nx*e*5,pz+uz*(L-HR+.1)+nz*e*5,.3,TYh-1,TYh+6,'⛰️ Vách hầm'); addPlat(px+ux*(L-HR)/2,pz+uz*(L-HR)/2,ry,5.8,(L-HR)/2+.6,RIM);   /* mặt đỉnh núi phía trên hầm */
      road([[h.J[0],h.J[1]],[px,pz],[px+ux*(L-HR+.6),pz+uz*(L-HR+.6)]],9,(x,z)=>Math.max(YM-.03,hAt(x,z)??YM));   /* 2 bên cửa hầm: chặn đúng chân vách (lan can chân vách bỏ trọn đoạn 9 m quanh cửa hầm) */
      /* lan can miệng giếng (bước 1°, hở ĐÚNG 2 sân nhựa lối ra mặt đất / đỉnh) */ { let run=[]; const flush=()=>{ if(run.length>1) fence(run,(hOut(run[0][0],run[0][1])??GY),'🌀 Lan can miệng giếng đường xoắn – sâu 26 m'); run=[]; }; for(let i=0;i<=360;i++){ const f=i*DEG, x=h.x+Math.cos(f)*(HR+.5), z=h.z+Math.sin(f)*(HR+.5); if(inSec(f,[lo1,hi1]) || inSec(f,[lo3,DE])){ flush(); continue; } run.push([x,z]); if(run.length>=5){ const last=run[run.length-1]; flush(); run=[last]; } } flush(); }
      /* tuyến xe bot (cao độ từng điểm): vành đai +2 → chiếu nghỉ +2 → đường xoắn → chiếu nghỉ hầm → hầm → đường vành đai vịnh */
      const R3=v=>Math.round(v*100)/100, pts=[[R3(h.x),174,Y1],[R3(h.x),R3(h.z+HR+1.4),Y1],[R3(h.x),R3(h.z+HRC),Y1]];
      for(let d=D1+6; d<dM; d+=6){ const q=P3(d,HRC); pts.push([R3(q[0]),R3(q[2]),R3(yAt(d)*1000)/1000]); }
      { const q=P3(dM,HRC); pts.push([R3(q[0]),R3(q[2]),R3(YM)]); } pts.push([R3(px),R3(pz),R3(YM)],[R3(h.J[0]),R3(h.J[1]),R3(hAt(h.J[0],h.J[1])??YM)]);
      RAMPS.push({name:'Đường xoắn ô tô '+(dir>0?'Đông':'Tây')+' · vành đai +2 ↔ đường vành đai vịnh', w:9, vmax:7, pts}); }
    /* nhánh 2 làn ra vành đai (+2, hướng Nam) và ra đường đỉnh vách (+28, hướng Bắc) – phẳng, nối liền sân nhựa chiếu nghỉ */
    road([[h.x,h.z+HR+1.2],[h.x,170.05]],9,()=>Y1); road([[h.x,h.z-HR-1.2],[h.x,h.top[1]+.2]],9,()=>Y2); ROADS.push([h.x,h.z+HR+1.2,h.x,174],[h.x,h.z-HR-1.2,h.x,h.top[1]]);
    makeLabel('🌀 Đường xoắn ô tô '+(dir>0?'Đông':'Tây'),'2 làn · dốc ≤ 9 % · vành đai +2 ↔ hầm ra đường vịnh +'+h.TY.toFixed(1)+' ↔ đỉnh núi +28 m',{h:.5, x:h.x, y:RIM+6, z:h.z, fade:140}); }
  { const cg=new THREE.CylinderGeometry(.32,.32,1,10), im=new THREE.InstancedMesh(cg,M.parap,COLS.length), m=new THREE.Matrix4(); COLS.forEach(([x,y,z,hh],i)=>{ m.makeScale(1,hh,1).setPosition(x,y,z); im.setMatrixAt(i,m); }); im.castShadow=im.receiveShadow=true; im.userData.dynamic=true; grp.add(im); }

  /* ============================== 9. ĐƯỜNG: vành đai +2 nối 3 cổng · đường đỉnh vách · lan can mép vực ============================== */
  const BAYB=buildBay({THREE, W, grp, dyn, M, LUX:W.LUX, B:BAY, FB, RB, UP, box, cyl, rail, fence, addPlat, addSeg, plats, circles, makeLabel, hAt, hOut, A, BZ, CZ, tunLat}); ROADS.push(...BAYB.roads); RAMPS.push(...BAYB.ramps);
  const AMN=buildAmenities({THREE, W, grp, dyn, M, MT:BAYB.MT, B:BAY, BAYB, box, cyl, fence, rail, addPlat, addSeg, plats, circles, makeLabel, INTER, P, toast, PLACES, teleport, RAMPS, LIFTK, HOOK, FB});
  for(const m of [M.asphalt]){ m.polygonOffset=true; m.polygonOffsetFactor=-2; m.polygonOffsetUnits=-4; } M.roadStone=M.granite.clone(); M.roadStone.polygonOffset=true; M.roadStone.polygonOffsetFactor=-2; M.roadStone.polygonOffsetUnits=-4;
  const strip=(pts,w,mat,dy=.03)=>{ const q=QB(false), N=pts.length, closed=N>2 && Math.hypot(pts[0][0]-pts[N-1][0],pts[0][1]-pts[N-1][1])<.01, sn=(i)=>{ const a=pts[i], b=pts[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]); return [(b[1]-a[1])/L,-(b[0]-a[0])/L]; }, H=(x,z)=>(hAt(clamp(x,-ZB+.1,ZB-.1),clamp(z,-ZB+.1,ZB-.1))??GY)+dy, E=[];
    /* mép trái/phải tại từng đỉnh: vát chéo theo phân giác 2 đoạn kề → 2 đoạn không chồng lên nhau */ for(let i=0;i<N;i++){ const n0=i>0?sn(i-1):(closed?sn(N-2):sn(0)), n1=i<N-1?sn(i):(closed?sn(0):sn(N-2)); let mx=n0[0]+n1[0], mz=n0[1]+n1[1]; const ml=Math.hypot(mx,mz)||1; mx/=ml; mz/=ml; const sc=Math.min(2.2,1/Math.max(.2,mx*n1[0]+mz*n1[1]))*w/2; E.push([[pts[i][0]+mx*sc,pts[i][1]+mz*sc],[pts[i][0]-mx*sc,pts[i][1]-mz*sc]]); }
    let v=0; for(let i=0;i<N-1;i++){ const L=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]), n=Math.max(1,Math.round(L/2)); for(let k=0;k<n;k++){ const t0=k/n, t1=(k+1)/n, P4=(e,t)=>[lerp(E[i][e][0],E[i+1][e][0],t),lerp(E[i][e][1],E[i+1][e][1],t)], a0=P4(0,t0), b0=P4(1,t0), a1=P4(0,t1), b1=P4(1,t1);
          q.quad([a0[0],H(a0[0],a0[1]),a0[1]],[b0[0],H(b0[0],b0[1]),b0[1]],[b1[0],H(b1[0],b1[1]),b1[1]],[a1[0],H(a1[0],a1[1]),a1[1]],0,1,(v+t0*L)*.2,(v+t1*L)*.2); } v+=L; } return q.mesh(mat); };
  const RG=[[-112,174],[-174,174],[-174,-16],[-174,-174],[174,-174],[174,0],[174,174],[112,174],[39.2,174]]; strip(RG,8,M.asphalt); for(let i=0;i<RG.length-2;i++) ROADS.push([...RG[i],...RG[i+1]].map(v=>v===39.2?39:v));   /* vành đai ngoài hình chữ C: eo biển cắt đoạn Nam, 2 đầu nối cầu dẫn G2 / nhánh tháp xoắn Tây */
  const GATES={G1:[180,0,GY], G2:[0,180,4], G3:[-180,-16,GY]}; strip([[178,0],[180,0]],8,M.asphalt); strip([[-178,-16],[-180,-16]],8,M.asphalt);   /* nhánh cổng nối tiếp mép ngoài vành đai (không chồng lên vành đai) */ ROADS.push([174,0,180,0],[-174,-16,-180,-16]);
  for(const [nm,[gx,gz,gy]] of Object.entries(GATES)){ const hz=Math.abs(gx)>1; for(const e of [-1,1]){ const x=gx+(hz?-Math.sign(gx)*1.2:e*5.2), z=gz+(hz?e*5.2:-Math.sign(gz)*1.2); box(1.2,7,1.2,M.granite,x,gy+3.5,z); circles.push({x,z,r:.9}); } box(hz?1.4:11.8,1.2,hz?11.8:1.4,M.dark,gx+(hz?-Math.sign(gx)*1.2:0),gy+7.4,gz+(hz?0:-Math.sign(gz)*1.2)); }
  // đường đỉnh vách (elip ρ = 1,115) từ lối ra đỉnh tháp xoắn Đông vòng qua phía Bắc tới tháp xoắn Tây – 2 đầu đổ xuống vành đai qua tháp xoắn → không cụt
  { const pts=[HX[0].top]; for(let d=36;d>=-216;d-=4){ pts.push(el(d*DEG,1.105)); } pts.push(HX[1].top); strip(pts,4,M.roadStone); for(let i=0;i<pts.length-1;i+=4) ROADS.push([...pts[i],...pts[Math.min(pts.length-1,i+4)]]);
    /* lan can kính mép vực phía trong (ρ = 1,078) – hở ở khe cửa vực và ở đài ngắm tháp thang máy */ { let run=[]; const flush=()=>{ if(run.length>1) fence(run,(hOut(run[0][0],run[0][1])??RIM),'🚧 Lan can mép vực – bên dưới sâu 57 m'); run=[]; }; for(let i=0;i<=150;i++){ const f=i/150*TAU, p=el(f,1.078); const fdg=(f*180/Math.PI+540)%360-180; if((Math.abs(p[0])<GX+3 && Math.sin(f)>0) || (Math.abs(p[0])<TX1 && p[1]<-140) || (fdg>53 && fdg<127) || Math.abs(fdg+5)<3.5 || Math.abs(Math.abs(fdg)-175)<3.5){ flush(); continue; } run.push(p); if(run.length>=5){ const last=run[run.length-1]; flush(); run=[last]; } } flush(); }

    /* mép ngoài vành đỉnh + chân vách ngoài (vách dựng đứng 26 m giữa thềm vành đai và đỉnh) */ const o1=[[-ZB+16.5,-ZB+16.5],[ZB-16.5,-ZB+16.5]], o2=[[-ZB+9.6,-ZB+9.6],[ZB-9.6,-ZB+9.6]]; rail(o1,RIM,'⛰️ Mép vách ngoài – xuống thềm vành đai bằng tháp đường xoắn ốc'); rail(o2,GY,'⛰️ Chân vách đá – lên đỉnh bằng tháp đường xoắn ốc');
    for(const e of [-1,1]){ rail([[e*(ZB-16.5),-ZB+16.5],[e*(ZB-16.5),94]],RIM,'⛰️ Mép vách ngoài – xuống thềm vành đai bằng tháp đường xoắn ốc'); rail([[e*(ZB-9.6),-ZB+9.6],[e*(ZB-9.6),100]],GY,'⛰️ Chân vách đá – lên đỉnh bằng tháp đường xoắn ốc'); } }
  RB.a.mesh(M.asphalt,'abyssal-roads'); RB.p.mesh(M.parap,'abyssal-road-parapets'); RB.w.mesh(M.lineW,'abyssal-road-lines'); RB.y.mesh(M.lineY,'abyssal-road-centre');
  const FALLS=[];   /* đập tràn + 2 thác đầu nguồn bỏ 17/11 (vịnh thông biển) */
  // thông trên đỉnh vách
  { const tr=new THREE.CylinderGeometry(.18,.26,2.2,6), cn=new THREE.ConeGeometry(1.5,4.6,7), rnd=AK.rng(907), L=[]; for(let i=0;i<900 && L.length<(LOW?90:170);i++){ const x=(rnd()*2-1)*164, z=(rnd()*2-1)*164, h=hOut(x,z); if(h===null || h<24 || re(x,z)<1.16 || re(x,z)>1.6 && rnd()<.4) continue; if(HX.some(q=>Math.hypot(x-q.x,z-q.z)<HR+6)) continue; const d=Math.abs(re(x,z)-1.118)*A; if(d<4.5) continue; L.push([x,h,z,.8+rnd()*.7]); }
    const t1=new THREE.InstancedMesh(tr,std(0x5a4030),L.length), t2=new THREE.InstancedMesh(cn,std(0x2f6b3f,{roughness:1}),L.length), m=new THREE.Matrix4(); L.forEach(([x,h,z,s],i)=>{ m.makeScale(s,s,s).setPosition(x,h+1.1*s,z); t1.setMatrixAt(i,m); m.makeScale(s,s,s).setPosition(x,h+4.2*s,z); t2.setMatrixAt(i,m); circles.push({x,z,r:.35}); }); for(const im of [t1,t2]){ im.castShadow=true; im.userData.dynamic=true; grp.add(im); } }

  RL.build(grp);

  /* ============================== 11. ĐIỂM XUẤT HIỆN · BẢN ĐỒ · MẠNG ĐƯỜNG · KHUNG HÌNH ============================== */
  const SPW=BAY.el(40*Math.PI/180,.93); W.V2SPAWN={x:SPW[0], z:SPW[1], lx:0, lz:-12};
  { const D1=Math.PI/180, pB=BAY.el(60*D1,.84), pP=BAY.el(25*D1,.93);
    PLACES.push({icon:'🏖️', name:'Abyssal · Bãi cát vàng vịnh', sub:'Bãi cát quanh vịnh thông biển · 4 cầu thang gỗ lên vỉa hè +16', go:()=>teleport(pB[0],pB[1],0,-12)},
      {icon:'🚶', name:'Abyssal · Vỉa hè kè biển +16', sub:'Lát đá granite, lan can con tiện, đèn đồng 12 m', go:()=>teleport(pP[0],pP[1],0,-12)},
      {icon:'🌉', name:'Abyssal · Cầu Vòm Cửa Vịnh', sub:'Nhịp 76 m · tĩnh không 15,5 m · eo biển hướng Nam', go:()=>teleport(-30,BAY.zB-5,0,BAY.zB-5)},
      {icon:'🚪', name:'Abyssal · Tháp thang máy Hydro-Pulse', sub:'Sân bãi cát +2,3 – E để lên sảnh kính +16 / tầng 12 / đỉnh núi', go:()=>teleport(0,-108,0,-131)},
      {icon:'⛰️', name:'Abyssal · Đài ngắm đỉnh thác (+28 m)', sub:'Nhìn toàn cảnh vịnh Song Nguyệt', go:()=>teleport(0,-111,0,-10)},
      {icon:'🚪', name:'Abyssal · Cổng Đông (sang CBD)', sub:'Vành đai +2 quanh đảo · G1 (180, 0)', go:()=>teleport(172,0,180,0)}); }
  W.V2ROADS=W.V2ROADS||[]; W.V2ROADS.push({zone:'abyssal', y:GY, segs:ROADS, gates:{G1:[180,0], G2:[0,180], G3:[-180,-16]}, ramps:RAMPS});   /* ramps: tuyến ô tô có cao độ từng điểm [x,z,y] (đường xoắn + bãi đỗ đáy vực) – v2traffic cần đọc R0.ramps như tuyến fixedY */
  try{ const G=W.transit && W.transit.G; if(G && G.nodes){ const key=new Map(), nd=(x,z)=>{ const k=x.toFixed(0)+','+z.toFixed(0); if(!key.has(k)){ G.nodes.push({x,z,adj:[]}); key.set(k,G.nodes.length-1); } return key.get(k); }; for(const [ax,az,bx,bz] of ROADS){ const a=nd(ax,az), b=nd(bx,bz), d=Math.hypot(bx-ax,bz-az); G.nodes[a].adj.push([b,d]); G.nodes[b].adj.push([a,d]); } } const TD=ctx.transit && ctx.transit.TAXI_DEST; if(TD) TD.push({icon:'🌀', name:'Đảo Abyssal · cổng Đông', x:172, z:0}); }catch(e){}
  let tt=0; const _m=new THREE.Matrix4(), _p=new THREE.Vector3(), _q=new THREE.Quaternion(), _s=new THREE.Vector3(), spin=dyn.children.filter(o=>o.userData.spin);
  HOOK.onFrame.push((dt)=>{ dt=Math.min(dt,.1); tt+=dt; const near=Math.abs(P.x)<260 && Math.abs(P.z)<260; if(!near){ if(HOOK.camBox && HOOK.camBox._ab) HOOK.camBox=null; return; }
    M.fallTex.offset.y=tt*.8; AMN.tick(dt); 
    /* trong lòng vực (dưới mực biển) camera của game bị ép lên trên mặt biển → mở khoá bằng camBox theo đúng độ cao mong muốn */
    /* lưới an toàn: trượt xuống nước sâu trong vịnh → đưa lên bãi cát */ if(P.y<-3 && !HOOK.vehicle && re(P.x,P.z)<1.0){ const sp=BAY.el(60*Math.PI/180,.85); teleport(sp[0],sp[1],0,-12); toast('🌊 Bạn trượt xuống nước sâu – đã đưa lên bãi cát',2600); }
    const deep=P.y<-1.5 && !W.inside; if(deep){ const want=cam.ty+Math.sin(cam.pitch)*(cam.occ||cam.dist||6); HOOK.camBox={x0:-1e6, x1:1e6, z0:-1e6, z1:1e6, y1:Math.max(want,(P.y<LY+1?LY:P.y)+.5), _ab:true}; } else if(HOOK.camBox && HOOK.camBox._ab) HOOK.camBox=null;

    /* thang máy */ DECO.forEach((c,i)=>{ c.position.y=lerp(-25,30,.5+.5*Math.sin(tt*.3+i*1.7)); });
  });
  /* vật trong suốt: kính (cabin thang, trục tháp, cầu, lan can) luôn vẽ SAU mặt nước – kính không ghi độ sâu nên nếu nước vẽ sau sẽ đè mất kính (ống kính thang máy lúc hiện lúc biến) */ for(const root of [grp,dyn]) root.traverse(o=>{ if(!o.isMesh) return; const m=Array.isArray(o.material)?o.material[0]:o.material; if(!m || !m.transparent) return; o.renderOrder=m===M.water?1:m===M.fall?4:6; });
  /* ============================== 12. W.ABY – BỐ CỤC CHUNG CHO CÁC PHIÊN B/C/D/E + NẠP MODULE PHỤ (thiếu file thì bỏ qua) ============================== */
  { const D1=Math.PI/180, cafeP=BAY.el(150*D1,.87), restP=BAY.el(30*D1,.87), wing=w=>({cx:w.cx, cz:WCZ, rIn:RIN-WD, rTop:RTOP, a0:w.a0, a1:w.a1, baseY:FY, floorH:FH, floors:w.nf, beachFloor:7, beachY:yF(7), promFloor:10, promY:yF(10), name:w.name});
    W.ABY=Object.assign(W.ABY||{}, {ver:1, center:{x:0, z:CZ}, A, Bz:BZ, rho:re, el, waterY:-.35, R_bay:104, bay:{cx:0, cz:CZ, a:111, b:99},
      beach:{rhoToe:BAY.R.T, rhoTop:BAY.R.B, yToe:-.5, yTop:2.5, wetW:2.5}, promY:16, R_road:Math.round(A*BAY.R.C), roadY:15.8, road:{rho:BAY.R.C, w:7, grade:BAY.grade, yAt:BAY.roadY, ring:BAYB.ring},
      strait:{dir:'S', x:0, z:140, nx:0, nz:1, w:76, x0:-GX, x1:GX, z0:96, z1:179.4, mouth:{x0:-70, x1:-15, z:179.4}, bridge:{z:BAY.zB, y:16, clear:15.5, span:76}, flareX:BAY.flareX, note:'cầu dẫn G2 (+4) chặn x −15…38 ở z 170–180: tàu cao đi x −70…−15 rồi rẽ Tây'},
      bayLoop:{x:0, z:-12, r:80},
      seaOut:[[-8,100],[-10,135],[-28,165],[-42,186],[-80,201],[-170,204],[-212,232],[-232,268],[-270,305],[-340,355],[-405,392]],
      seaBack:[[-420,402],[-350,368],[-280,318],[-240,282],[-220,250],[-180,196],[-90,194],[-55,192],[-24.65,190.4]],
      karst:{x0:-600, x1:-255, z0:398, z1:660, cut:[{x0:-405, x1:-255, z0:478, z1:660}], keepOut:[{x0:-1800, x1:-250, z0:300, z1:398, hMax:12}], hMax:100},
      plots:{ hotel:{x:0, z:-12, r:58, y:14, core:38, pavR:47, pavA:[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5], bridge:{x:0, z0:-12+57.6, z1:102, y:16, w:10, note:'phiên C dựng mặt cầu + lan can; phiên A đã mở khe 10 m ở lan can mép đảo phía Nam và lan can Bắc Cầu Vòm, nút ngã ba (0, z 108,9) có trong đường vành đai'}}, towersW:wing(WING[0]), towersE:wing(WING[1]),
        cafe:{x:cafeP[0], z:cafeP[1], yaw:Math.atan2(-cafeP[0],-12-cafeP[1]), w:26, d:9, yBase:2.5, yTop:16, note:'tựa tường kè, mặt nhìn ra vịnh; cửa trên ở vỉa hè +16, cửa dưới ở bãi cát'},
        restaurant:{x:restP[0], z:restP[1], yaw:Math.atan2(-restP[0],-12-restP[1]), w:26, d:9, yBase:2.5, yTop:16},
        stage:{x:-100, z:-212, yaw:0}, marina:{x:-GX, z:126, nx:1, nz:0, deckY:2.0, stem:8},
        beach:{parking:{x:66, z:132, y:3.5}, stairs:BAYB.stairs}, watersports:{x:-215, z:40, rx:18, rz:70}, parasail:{x:-170, z:-262, rx:38, rz:26} },
      towersReady:!!(W.ABY && W.ABY.towersReady)}); }
  for(const f of ['./abyssal_hotel.js','./abyssal_towers.js','./abyssal_dining_venues.js','./abyssal_sea.js','./abyssal_stage.js']){ try{ const m=await import(f); if(m && m.make) await m.make(W, ctx); }
    catch(e){ if(!/Failed to fetch|Cannot find module|error loading dynamically imported/i.test(String(e))) console.warn('[abyssal] module phụ', f, e); } }   /* abyssal_yacht.js là thư viện – abyssal_sea.js tự nạp */

  return {BAY, BAYB, hAt, re, el, FY, LY, RIM, STOPS, LIFTS:LIFTK, RAMPS, PLAZA, rhoW, SAT, KY, HX, ROADS, GATES, WING, brZ, yF, OC, ST, KD, grp, dyn};
}
