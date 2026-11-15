// QC World – CÔNG VIÊN KỲ QUAN (A23 · đợt 1, phiên đồ hoạ 15/11/2026)
// Đảo mới phía Nam Đảo QC Wonderland: "cổ chai" (cổng + Đại lộ Ánh Sao + phố ẩm thực) x −40…116 · z 384…500 và "thân" x −256…348 · z 500…840
// (Hồ Pha Lê ở giữa, 5 trò đợt 1 quanh hồ – xem js/themerides.js). Tất cả là nội dung tự thiết kế của QC World, không dùng tên/nhân vật có bản quyền.
// Mặt đất công viên phẳng ở cao độ G0; lối lát đá là lưới riêng nằm trên mặt đất (đất bên dưới được hạ thấp trong LƯỚI VẼ, không đổi độ cao đi bộ → không nhấp nháy).
import { createGFX, Kit as GKit, boxM, planeM, cylM, cbox, local, rng } from './gfxkit.js';
import { makeRides } from './themerides.js';
import { makeLand2 } from './themeland2.js';
import { makeDark } from './themedark.js';
import { makePlay } from './themeplay.js';
import { shiftView } from './worldshift.js';

export function makeThemePark(W, ctx, opt={}){
  W=shiftView(W, opt.dx||0, opt.dz||0);   // V2 (wonder_v2.js): dời cả công viên theo (dx, dz); các file con nhận W này qua T.W – V1 không truyền opt → W giữ nguyên
  const {THREE, scene, P, HOOK, INTER, PLACES, toast, circles, boxes, addPlat, addSeg, makeLabel, makeActor, EXTL, clamp, lerp, teleport} = W;
  const GF=W.GFX||(W.GFX=createGFX({quality:W.QUAL||'low', msaa:!W.CINE})), M=GF.M, TAU=Math.PI*2, G0=2.0, LOW=W.QUAL==='low';
  const ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  const pay=(price,what,fn)=>ctx.askPay(price, what, ()=>{ if(!ctx.spend(price)) return; fn(); });
  const glow=(x,y,z,s,c,k)=>{ if(W.GLOW && W.GLOW.add) W.GLOW.add(x,y,z,s,c,k); };

  /* ============================== 1. ĐẤT ============================== */
  const LG={x:40, z:620, a:100, b:58}, ISR=22, HUB={x:40, z:526, r:21}, TOWER={x:-52, z:538}, WHEEL={x:172, z:620};
  const LAKES=[{x:236,z:1152,a:68,b:26,f:.7,wy:1.6,name:'Hồ Atlantis'},{x:170.7,z:1031,a:14,b:14,f:-.8,wy:.3,name:'Hồ khủng long'}];
  const sdB=(x,z,cx,cz,hx,hz,r)=>{ const qx=Math.abs(x-cx)-(hx-r), qz=Math.abs(z-cz)-(hz-r); return Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-r; };
  const sdf=(x,z)=>{ const a=sdB(x,z,38,452,78,68,26), b=sdB(x,z,46,865,302,365,48), k=24, h=clamp(.5+.5*(b-a)/k,0,1);
    return lerp(b,a,h)-k*h*(1-h)+2.2*Math.sin(x*.045+1.3)*Math.cos(z*.05+.4)+1.2*Math.sin(x*.11+z*.09); };
  // khoảng cách (m) ra ngoài mép Hồ Pha Lê (âm = trong hồ)
  const dLG=(x,z)=>{ const ux=(x-LG.x)/LG.a, uz=(z-LG.z)/LG.b, e=Math.hypot(ux,uz); if(e<1e-4) return -LG.b; return (e-1)/Math.hypot(ux/LG.a,uz/LG.b)*e; };
  const hf=(x,z)=>{ const d=sdf(x,z); if(d>10) return -6; if(d>0) return lerp(.2,-6,ss(0,10,d)); let h=d>-8?lerp(G0,.25,ss(-8,0,d)):G0;
    if(z<500 && d<-8){ const bx=Math.abs(x-38); h+=7*ss(38,49,bx)*(1-ss(57,69,bx))*ss(398,414,z)*(1-ss(476,496,z)); }      // gò cây 2 bên Đại lộ – che thành phố
    const dl=dLG(x,z); if(dl<2.6){ const ri=Math.hypot(x-LG.x,z-LG.z); h=ri<ISR+3?lerp(G0,.45,ss(ISR-.6,ISR+2.6,ri)):lerp(G0,.45,ss(2.6,-1.5,dl)); }
    for(const L of LAKES){ const e=Math.hypot((x-L.x)/L.a,(z-L.z)/L.b); if(e<1.1) h=Math.min(h,lerp(G0,L.f,ss(1.1,.88,e))); }   /* hồ của đợt 2 */
    return h; };
  const BX={x0:-270, x1:363, z0:372, z1:1242}, RES=3, NX=Math.round((BX.x1-BX.x0)/RES)+1, NZ=Math.round((BX.z1-BX.z0)/RES)+1, H=new Float32Array(NX*NZ);
  for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++) H[j*NX+i]=hf(BX.x0+i*RES, BX.z0+j*RES);
  const hAt=(x,z)=>{ const fx=(x-BX.x0)/RES, fz=(z-BX.z0)/RES; if(fx<0||fz<0||fx>=NX-1||fz>=NZ-1) return null; const i=Math.floor(fx), j=Math.floor(fz), tx=fx-i, tz=fz-j, a=H[j*NX+i], b=H[j*NX+i+1], c=H[(j+1)*NX+i], d=H[(j+1)*NX+i+1];
    const h=tx+tz<=1 ? a+(b-a)*tx+(c-a)*tz : d+(c-d)*(1-tx)+(b-d)*(1-tz); return h<-5.9?null:h; };
  EXTL.push({x0:BX.x0, x1:BX.x1-RES, z0:BX.z0, z1:BX.z1-RES, h:hAt, name:'CÔNG VIÊN KỲ QUAN QC WORLD'});

  // lối lát đá: [x0,x1,z0,z1] và đĩa tròn [x,z,r]; viền hồ = dải 3,2…12,2 m quanh mép hồ
  const PR=[[27,53,394,508],[20,60,394,414],[34,46,540,552],[58,132,514,522],[130,148,512,533],[-40,22,534,542],[-132,-70,616.8,623.2],[58,76,686,710.6],[150,165,614,626],
    [171,220,631,638],[208,220,634,884],[-210,330,884,896],[108,120,896,1100],[108,186,1086,1104],[136,157,896,936],[14,44,896,912],[-166,-154,896,962],
    /* đợt 2B */ [-236,-212,871,884],[-124,-100,871,884],[-12,12,871,884],[-166,-154,991,1096],[-244,108,1096,1104]];
  const PD=[[HUB.x,HUB.z,HUB.r],[TOWER.x,TOWER.z,14],[-160,975,16]];
  if(opt.paths) PR.push(...opt.paths);   // V2: lối lát thêm do wonder_v2.js vẽ (đường ra cổng G9) – cây ngẫu nhiên tránh ra
  const paved=(x,z,m=0)=>{ for(const r of PR) if(x>r[0]+m && x<r[1]-m && z>r[2]+m && z<r[3]-m) return true; for(const c of PD) if(Math.hypot(x-c[0],z-c[1])<c[2]-m) return true;
    const dl=dLG(x,z); return dl>3.2+m && dl<12.2-m; };
  { // lưới địa hình: cỏ (có vân) + cát/đáy hồ; đỉnh nằm hẳn dưới lối lát được hạ 0,35 m (chỉ trong lưới vẽ)
    const pos=new Float32Array(NX*NZ*3), col=new Float32Array(NX*NZ*3), uv=new Float32Array(NX*NZ*2), sand=new Uint8Array(NX*NZ), c=new THREE.Color(), SAND=new THREE.Color(0xe3cf9f), BED=new THREE.Color(0x8fb7b0);
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const k=j*NX+i, x=BX.x0+i*RES, z=BX.z0+j*RES; let h=H[k];
      if(h>G0-.01 && paved(x,z,0) && paved(x+RES,z,0) && paved(x-RES,z,0) && paved(x,z+RES,0) && paved(x,z-RES,0)) h-=.35;
      pos[k*3]=x; pos[k*3+1]=h; pos[k*3+2]=z; uv[k*2]=x*.25; uv[k*2+1]=z*.25;
      const n=.86+.2*Math.sin(x*.13+z*.07)*Math.cos(z*.11-x*.05)+.06*Math.sin(x*1.7+z*2.3); c.setRGB(n,n*1.02,n);
      if(H[k]<G0-.12){ sand[k]=1; c.copy(dLG(x,z)<3?BED:SAND).multiplyScalar(.92+.1*Math.sin(x*.9+z*1.3)); }
      col[k*3]=c.r; col[k*3+1]=c.g; col[k*3+2]=c.b; }
    const ig=[], is=[], done=new Uint8Array(NX*NZ), flatV=k=>pos[k*3+1]===G0 && !sand[k];
    for(let j=0;j<NZ-1;j++) for(let i=0;i<NX-1;i++){ const a=j*NX+i, b=a+1, cc=a+NX, d=cc+1; if(done[a] || Math.max(H[a],H[b],H[cc],H[d])<-5.9) continue;
      if(i%2===0 && j%2===0 && i<NX-2 && j<NZ-2){ let ok=true; for(let dj=0;dj<=2 && ok;dj++) for(let di=0;di<=2;di++) if(!flatV(a+dj*NX+di)){ ok=false; break; }
        if(ok){ const b2=a+2, c2=a+2*NX, d2=c2+2; ig.push(a,c2,b2,b2,c2,d2); done[a]=done[a+1]=done[a+NX]=done[a+NX+1]=1; continue; } }
      (sand[a]+sand[b]+sand[cc]+sand[d]>=3?is:ig).push(a,cc,b,b,cc,d); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('color', new THREE.BufferAttribute(col,3)); g.setAttribute('uv', new THREE.BufferAttribute(uv,2));
    g.setIndex(ig.concat(is)); g.addGroup(0,ig.length,0); g.addGroup(ig.length,is.length,1); g.computeVertexNormals(); g.computeBoundingSphere();
    const grass=M.lawn.clone(); grass.vertexColors=true; const sandM=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.95});
    const t=new THREE.Mesh(g,[grass,sandM]); t.receiveShadow=true; t.userData.dynamic=true; t.userData.noFar=true; scene.add(t); }

  /* ============================== 2. BỘ DỰNG ============================== */
  // 4 mức chi tiết theo khoảng cách người chơi tới công viên (giữ nhẹ máy khi đứng ở thành phố nhìn sang):
  //  gLand < 1050 m: ray, trụ, vòng quay, tháp, cổng, lõi tán cây · gFar < 560 m: lối lát, nhà, cầu, ga · gMid < 520 m: tán lá, đoàn tàu, kính cabin · gNear < 430 m: rào, ghế, đèn, quầy
  const mkSet=(cx,cz)=>{ const S={cx, cz, d:0, kL:GKit(), kF:GKit(), kN:GKit(), gLand:new THREE.Group(), gFar:new THREE.Group(), gMid:new THREE.Group(), gNear:new THREE.Group()}; for(const g of [S.gLand,S.gFar,S.gMid,S.gNear]){ g.userData.dynamic=true; g.userData.staticShadow=true; scene.add(g); } return S; };
  const SETS=[mkSet(46,640), mkSet(46,1040)]; let cur=SETS[0];   /* cur: bộ đang nhận hình (đổi bằng T.useSet) */
  const pk=n=>({add:(...a)=>cur[n].add(...a), addMat:(...a)=>cur[n].addMat(...a)}), pg=n=>({add:o=>cur[n].add(o)});
  const gLand=pg('gLand'), gFar=pg('gFar'), gMid=pg('gMid'), gNear=pg('gNear');
  const kL=pk('kL'), kF=pk('kF'), kN=pk('kN'), lift=(k,dy)=>({add:(geo,mat,x=0,y=0,z=0,...r)=>k.add(geo,mat,x,y+dy,z,...r)});
  const flat=g=>{ g.rotateX(-Math.PI/2); return g; };
  const slab=(k,mat,x0,x1,z0,z1,y)=>k.add(flat(planeM(x1-x0,z1-z0,x0,z0)),mat,(x0+x1)/2,y,(z0+z1)/2);
  // dải nối 2 dãy điểm 3D (A[i] → B[i]); nrm = hướng pháp tuyến mong muốn (để chọn chiều quấn tam giác); UV theo mét
  function strip(k,mat,A,B,nrm,closed){ const n=A.length, pos=[], uv=[], idx=[]; let u=0;
    for(let i=0;i<n;i++){ if(i) u+=Math.hypot(A[i][0]-A[i-1][0],A[i][1]-A[i-1][1],A[i][2]-A[i-1][2]); const v=Math.hypot(B[i][0]-A[i][0],B[i][1]-A[i][1],B[i][2]-A[i][2]); pos.push(...A[i],...B[i]); uv.push(u,0,u,v); }
    const e1=[A[1][0]-A[0][0],A[1][1]-A[0][1],A[1][2]-A[0][2]], e2=[B[0][0]-A[0][0],B[0][1]-A[0][1],B[0][2]-A[0][2]], cx=[e1[1]*e2[2]-e1[2]*e2[1], e1[2]*e2[0]-e1[0]*e2[2], e1[0]*e2[1]-e1[1]*e2[0]], f=cx[0]*nrm[0]+cx[1]*nrm[1]+cx[2]*nrm[2]>0;
    for(let i=0;i<n-1;i++){ const a=i*2, b=a+1, c=a+2, d=a+3; if(f) idx.push(a,c,b,b,c,d); else idx.push(a,b,c,b,d,c); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return k.add(g,mat); }
  // rào chắn: vẽ lan can (trụ + 2 thanh) và chặn người chơi. pts = [[x,z],…]; o.y = cao độ chân, o.h = cao, o.msg, o.vis=false → chỉ chặn
  const railM=M.paint(0x2b3038,.45,.6);
  function fence(pts,o={}){ const y=o.y??G0, h=o.h??1.05, k=o.k||kN;
    for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], L=Math.hypot(bx-ax,bz-az); if(L<.05) continue;
      addSeg(ax,az,bx,bz,o.r??.1,o.y0,o.y1,o.msg||'🚧 Lan can – mời đi theo lối');
      if(o.vis===false) continue; const ry=Math.atan2(bx-ax,bz-az), mx=(ax+bx)/2, mz=(az+bz)/2, mat=o.mat||railM;
      k.add(boxM(.05,.05,L),mat,mx,y+h,mz,ry); k.add(boxM(.035,.035,L),mat,mx,y+h*.52,mz,ry);
      const n=Math.max(1,Math.round(L/1.6)); for(let j=0;j<=n;j++){ if(j===n && i<pts.length-2) continue; const t=j/n; k.add(boxM(.06,h,.06),mat,ax+(bx-ax)*t,y+h/2,az+(bz-az)*t,ry); } } }
  // ghế băng (ngồi được, 3 chỗ) – rot: hướng mặt ghế
  function bench(x,z,rot,y=G0){ const Pn=local(kN,x,y,z,rot); Pn(cbox(1.7,.06,.5,.02),M.wood,0,.46,0); Pn(cbox(1.7,.34,.05,.02),M.wood,0,.78,-.24,-.18); for(const s of [-.7,.7]){ Pn(cbox(.06,.46,.46,.01),M.blackMetal,s,.23,0); Pn(cbox(.05,.5,.05,.01),M.blackMetal,s,.68,-.25); }
    circles.push({x,z,r:.5}); if(W.addBench) W.addBench({x:x+Math.sin(rot)*.1, z:z+Math.cos(rot)*.1, rot, len:1.6, y:y+.49, floor:y, label:'🪑 Ngồi ghế (E · C)'}); }
  function lamp(x,z,ry=0,kind='garden'){ GF.streetLight(lift(kN,G0),x,z,ry,kind,(gx,gy,gz,s,c,k)=>glow(gx,gy+G0,gz,s,c,k)); circles.push({x,z,r:.14}); }
  function bin(x,z){ kN.add(cylM(.24,.2,.8,12),M.paint(0x2f6b4f,.5,.2),x,G0+.4,z); kN.add(cylM(.26,.26,.05,12),M.blackMetal,x,G0+.82,z); circles.push({x,z,r:.3}); }
  const trees={shade:[], round:[], tier:[], palm:[]}, tree=(kind,x,z,s=1,y)=>{ trees[kind].push({x, z, y:y??hf(x,z)-.05, s, r:(x*7.3+z*3.1)%6.28}); circles.push({x,z,r:kind==='palm'?.22:.3}); };
  const sign=(text,o)=>GF.signMat(text,o), pln=(w,h)=>new THREE.PlaneGeometry(w,h);

  /* ============================== 3. LỐI ĐI · QUẢNG TRƯỜNG ============================== */
  const YP=G0+.05;
  slab(kF,M.pave,27,53,394,508,YP+.005); slab(kF,M.granite,20,60,394,414,YP+.012); slab(kF,M.pave,34,46,540,552,YP+.004); slab(kF,M.pave,58,132,514,522,YP+.004);
  slab(kF,M.granite,130,148,512,533,YP+.012); slab(kF,M.pave,-40,22,534,542,YP+.004); slab(kF,M.pave,-132,-70,616.8,623.2,YP+.008); slab(kF,M.granite,58,76,686,710.6,YP+.012); slab(kF,M.granite,150,165,614,626,YP+.012);
  slab(kF,M.granite,171,220,631,638,YP+.012); slab(kF,M.pave,208,220,634,884,YP+.004);   /* Đại lộ Phiêu Lưu xuống khu Nam (đợt 2) */
  { const d=flat(new THREE.CircleGeometry(HUB.r,64)), u=d.attributes.uv, p=d.attributes.position; for(let i=0;i<u.count;i++) u.setXY(i,p.getX(i)+HUB.x,p.getZ(i)+HUB.z); kF.add(d,M.terrazzo,HUB.x,YP+.02,HUB.z);
    const t=flat(new THREE.CircleGeometry(14,48)), u2=t.attributes.uv, p2=t.attributes.position; for(let i=0;i<u2.count;i++) u2.setXY(i,p2.getX(i)+TOWER.x,p2.getZ(i)+TOWER.z); kF.add(t,M.granite,TOWER.x,YP+.016,TOWER.z); }
  for(const x of [27.15,52.85]) kF.add(boxM(.3,.16,94),M.stoneLight,x,G0+.06,461);       // bó vỉa Đại lộ
  // --- Hồ Pha Lê: kè bậc đá, lối dạo ven hồ, mặt nước, cọc xích
  const EN=120, ell=(th,d,y)=>{ const c=Math.cos(th), s=Math.sin(th), nx=c/LG.a, nz=s/LG.b, nl=Math.hypot(nx,nz); return [LG.x+LG.a*c+nx/nl*d, y, LG.z+LG.b*s+nz/nl*d]; };
  const ering=(d,y)=>Array.from({length:EN+1},(_,i)=>ell(i/EN*TAU,d,y)), UP=[0,1,0];
  strip(kF,M.pave,ering(3.2,YP),ering(12.2,YP),UP); strip(kF,M.granite,ering(1.5,G0+.06),ering(3.2,G0+.06),UP); strip(kF,M.stoneLight,ering(0,G0-.2),ering(1.5,G0-.2),UP);
  strip(kF,M.stoneLight,ering(1.5,G0+.06),ering(1.5,G0-.2),[-1,0,0]); strip(kF,M.stoneLight,ering(0,G0-.2),ering(0,.9),[-1,0,0]);
  const WY=1.55; { const g=flat(new THREE.CircleGeometry(1,96)); g.scale(LG.a+.2,1,LG.b+.2); const wm=new THREE.Mesh(g,M.water); wm.position.set(LG.x,WY,LG.z); wm.userData.noFar=true; wm.receiveShadow=true; gFar.add(wm); }
  { const pts=[]; let run=[]; for(let i=0;i<=EN;i++){ const q=ell(i/EN*TAU,3,0), gap=Math.abs(q[0]-LG.x)<2.7; if(gap){ if(run.length>1) pts.push(run); run=[]; continue; } run.push([q[0],q[2]]);
      if(i<EN){ kN.add(cylM(.06,.08,.8,8),M.blackMetal,q[0],G0+.46,q[2]); kN.add(new THREE.SphereGeometry(.09,8,6),M.chrome,q[0],G0+.9,q[2]); const n=ell((i+1)/EN*TAU,3,0); if(Math.abs(n[0]-LG.x)>=2.7){ const L=Math.hypot(n[0]-q[0],n[2]-q[2]); kN.add(boxM(.03,.03,L),M.blackMetal,(q[0]+n[0])/2,G0+.66,(q[2]+n[2])/2,Math.atan2(n[0]-q[0],n[2]-q[2])); } } }
    if(run.length>1) pts.push(run);
    // 2 khe hở ở đầu cầu Bắc/Nam: nối mép khe vào lan can cầu
    for(const r of pts){ fence(r,{vis:false, r:.25, msg:'🌊 Hồ Pha Lê – không xuống nước. Qua đảo giữa hồ bằng cầu đá ở hai đầu Bắc/Nam'});
      for(const e of [r[0],r[r.length-1]]) if(Math.abs(e[0]-LG.x)<8){ const sx=Math.sign(e[0]-LG.x)||1, zb=e[1]<LG.z?LG.z-LG.b-3.2:LG.z+LG.b+3.2; fence([e,[LG.x+sx*2.6,zb]],{vis:false, r:.2}); } } }
  // --- đảo giữa hồ + 2 cầu vòm đá
  { const N=48, cr=(r,y)=>Array.from({length:N+1},(_,i)=>[LG.x+Math.cos(i/N*TAU)*r, y, LG.z+Math.sin(i/N*TAU)*r]);
    strip(kF,M.granite,cr(ISR-2.2,G0+.06),cr(ISR-.4,G0+.06),UP); strip(kF,M.stoneLight,cr(ISR-.4,G0-.2),cr(ISR+1,G0-.2),UP); strip(kF,M.stoneLight,cr(ISR-.4,G0+.06),cr(ISR-.4,G0-.2),[1,0,0]); strip(kF,M.stoneLight,cr(ISR+1,G0-.2),cr(ISR+1,.9),[1,0,0]);
    { const d=flat(new THREE.CircleGeometry(ISR-2.2,48)), u=d.attributes.uv, p=d.attributes.position; for(let i=0;i<u.count;i++) u.setXY(i,p.getX(i),p.getZ(i)); kF.add(d,M.pave,LG.x,YP,LG.z); }
    let run=[]; const runs=[]; for(let i=0;i<=N;i++){ const a=i/N*TAU, x=LG.x+Math.cos(a)*(ISR-.9), z=LG.z+Math.sin(a)*(ISR-.9); if(Math.abs(x-LG.x)<2.7){ if(run.length>1) runs.push(run); run=[]; continue; } run.push([x,z]); } if(run.length>1) runs.push(run);
    for(const r of runs){ fence(r,{h:.9, msg:'🌊 Mép đảo – không xuống nước'}); for(const e of [r[0],r[r.length-1]]){ const sx=Math.sign(e[0]-LG.x)||1, zb=e[1]<LG.z?LG.z-ISR+.6:LG.z+ISR-.6; fence([e,[LG.x+sx*2.6,zb]],{vis:false, r:.15}); } }
    for(const sg of [-1,1]){ const z0=LG.z+sg*(LG.b+3.4), z1=LG.z+sg*(ISR-.5), Lb=Math.abs(z1-z0), NS=20, RISE=2.0, yb=t=>G0+.06+RISE*Math.sin(Math.PI*t);
      for(let i=0;i<NS;i++){ const t0=i/NS, t1=(i+1)/NS, za=z0+(z1-z0)*t0, zb=z0+(z1-z0)*t1, ya=yb(t0), yc=yb(t1), L=Math.hypot(zb-za,yc-ya), rx=-Math.atan2(yc-ya,zb-za);
        kF.add(boxM(5.4,.4,L+.04),M.granite,LG.x,(ya+yc)/2-.2,(za+zb)/2,0,rx); for(const s of [-1,1]){ kF.add(boxM(.3,.24,L+.04),M.stoneLight,LG.x+s*2.75,(ya+yc)/2+.92,(za+zb)/2,0,rx); for(let j=0;j<3;j++){ const tt=(j+.5)/3; kF.add(boxM(.14,.82,.14),M.stoneLight,LG.x+s*2.75,ya+(yc-ya)*tt+.4,za+(zb-za)*tt); } } }
      const NP=Math.round(Lb); for(let i=0;i<NP;i++){ const t=(i+.5)/NP; addPlat(LG.x,z0+(z1-z0)*t,0,2.75,Lb/NP/2+.02,yb(t)); }
      for(const s of [-1,1]) addSeg(LG.x+s*2.6,z0,LG.x+s*2.6,z1,.15,undefined,undefined,'🌉 Lan can cầu đá');
      for(const t of [.3,.7]){ const zz=z0+(z1-z0)*t, top=yb(t)-.4; kF.add(boxM(5.6,top-.3,1.3),M.stoneLight,LG.x,(top+.3)/2,zz); }
      for(const t of [0,1]) for(const s of [-1,1]){ const zz=z0+(z1-z0)*t; kF.add(boxM(.5,1.5,.5),M.stoneLight,LG.x+s*2.75,G0+.75,zz); kF.add(new THREE.SphereGeometry(.24,12,8),M.lampWarm,LG.x+s*2.75,G0+1.7,zz); glow(LG.x+s*2.75,G0+1.7,zz,1.8,0xffd9a0,.8); } }
    // vọng lâu bát giác giữa đảo
    const Pg=local(kF,LG.x,G0+.06,LG.z,0); Pg(cylM(6.2,6.4,.36,8),M.stoneLight,0,.18,0,0,0,Math.PI/8); addPlat(LG.x,LG.z,0,4.3,4.3,G0+.42);
    for(let i=0;i<8;i++){ const a=i/8*TAU+Math.PI/8, x=Math.cos(a)*5.3, z=Math.sin(a)*5.3; Pg(cylM(.16,.2,3.6,10),M.white,x,2.16,z); circles.push({x:LG.x+x, z:LG.z+z, r:.26}); }
    Pg(cylM(6.9,6.9,.22,8),M.white,0,4.05,0,0,0,Math.PI/8); Pg(new THREE.ConeGeometry(7.4,3.2,8),M.rooftile,0,5.76,0,0,0,Math.PI/8); Pg(new THREE.SphereGeometry(.36,12,8),M.chrome,0,7.6,0);
    for(const a of [0,Math.PI/2,Math.PI,-Math.PI/2]) bench(LG.x+Math.sin(a)*2.6, LG.z+Math.cos(a)*2.6, a+Math.PI, G0+.42);
    for(let i=0;i<8;i++){ const a=i/8*TAU+.4; if(Math.abs(Math.cos(a))<.35) continue; tree(i%2?'round':'tier',LG.x+Math.cos(a)*13.5,LG.z+Math.sin(a)*13.5,i%2?1.2:.9,G0); }
    for(let i=0;i<6;i++){ const a=i/6*TAU+.2; lamp(LG.x+Math.cos(a)*17.5, LG.z+Math.sin(a)*17.5, -a); } }

  /* ============================== 4. CẦU VÀO · CỔNG · ĐẠI LỘ ÁNH SAO · PHỐ ẨM THỰC ============================== */
  { // cầu đá từ bờ Nam Đảo QC Wonderland (40,338) sang cổng (40,394)
    const z0=337, z1=395.5, y0=1.72, y1=G0+.06, NS=24, yb=t=>lerp(y0,y1,t)+1.6*Math.sin(Math.PI*t), Lb=z1-z0;
    for(let i=0;i<NS;i++){ const t0=i/NS, t1=(i+1)/NS, za=z0+Lb*t0, zb=z0+Lb*t1, ya=yb(t0), yc=yb(t1), L=Math.hypot(zb-za,yc-ya), rx=-Math.atan2(yc-ya,zb-za);
      kF.add(boxM(8.4,.5,L+.04),M.granite,40,(ya+yc)/2-.25,(za+zb)/2,0,rx); for(const s of [-1,1]){ kF.add(boxM(.34,.26,L+.04),M.stoneLight,40+s*4.2,(ya+yc)/2+1.0,(za+zb)/2,0,rx); for(let j=0;j<3;j++){ const tt=(j+.5)/3; kF.add(boxM(.16,.9,.16),M.stoneLight,40+s*4.2,ya+(yc-ya)*tt+.44,za+(zb-za)*tt); } } }
    const NP=Math.round(Lb); for(let i=0;i<NP;i++){ const t=(i+.5)/NP; addPlat(40,z0+Lb*t,0,4.2,Lb/NP/2+.02,yb(t)); }
    for(const s of [-1,1]) addSeg(40+s*4.05,z0,40+s*4.05,z1,.15,undefined,undefined,'🌉 Lan can cầu vào Công viên Kỳ Quan');
    for(const t of [.2,.5,.8]){ const zz=z0+Lb*t, top=yb(t)-.5; kF.add(boxM(8.8,top+3,1.6),M.stoneLight,40,(top-3)/2,zz); for(const s of [-1,1]){ kF.add(cylM(.07,.09,3.4,8),M.blackMetal,40+s*4.2,yb(t)+2.6,zz); kF.add(new THREE.SphereGeometry(.26,12,8),M.lampWarm,40+s*4.2,yb(t)+4.4,zz); glow(40+s*4.2,yb(t)+4.4,zz,2.4,0xffd9a0,.9); } }
    // dải lát trên Đảo Wonderland dẫn tới đầu cầu
    kF.add(flat(planeM(6,22,0,0)),M.pave,40,1.79,326.5);
    // CỔNG: 2 tháp + vòm + bảng tên
    const Pg=local(kL,40,G0,402,0), wallC=M.plasterC(0xf2e6cf), trimC=M.plasterC(0xfff7e6), roofC=M.paint(0x1f5f8f,.5,.1), goldM=M.paint(0xd8b25a,.3,.9);
    for(const s of [-1,1]){ Pg(boxM(6,15,6),wallC,s*12,7.5,0); Pg(boxM(6.6,.7,6.6),trimC,s*12,15.2,0); Pg(boxM(6.6,.5,6.6),trimC,s*12,5.2,0); Pg(new THREE.ConeGeometry(4.6,7,4),roofC,s*12,19.0,0,0,0,Math.PI/4); Pg(cylM(.05,.05,3,6),goldM,s*12,23.9,0); Pg(new THREE.SphereGeometry(.3,10,8),goldM,s*12,22.6,0);
      Pg(pln(1.9,1.1),sign(s<0?'★':'☆',{bg:'#c8312b', fg:'#ffe9a8', key:'flag'+s, w:128, h:64, double:true}),s*12+1,24.6,0);
      for(const y of [8.5,12]) for(const f of [-1,1]) Pg(pln(1.5,2.2),M.glassHome,s*12,y,f*3.01,0,0,f>0?0:Math.PI);
      boxes.push({x0:40+s*12-3, x1:40+s*12+3, z0:399, z1:405, msg:'🏰 Tháp cổng Công viên Kỳ Quan'});
      // tường rào 2 bên nối tháp tới gò cây
      Pg(boxM(24,3.2,.6),wallC,s*27,1.6,0); Pg(boxM(24.4,.3,.9),trimC,s*27,3.3,0); boxes.push({x0:Math.min(40+s*15,40+s*39), x1:Math.max(40+s*15,40+s*39), z0:401.6, z1:402.4, msg:'🧱 Tường rào công viên – vào bằng cổng chính'}); }
    Pg(boxM(18.4,3.4,2.4),wallC,0,11.3,0); Pg(boxM(18.8,.5,2.9),trimC,0,13.2,0); Pg(boxM(18.8,.4,2.9),trimC,0,9.5,0);
    for(const f of [1,-1]){ Pg(pln(17,2.5),sign('CÔNG VIÊN KỲ QUAN',{bg:'#12305a', fg:'#ffe9a8', border:'#d8b25a', key:'gate', w:2048, h:300, font:'"Times New Roman",serif', weight:700, night:1.8, day:.35}),0,11.3,f*1.22,0,0,f>0?0:Math.PI);
      Pg(pln(9,.9),sign('QC WORLD · 5 siêu trò chơi · Hồ Pha Lê · Phố ẩm thực',{fg:'#fff7e6', key:'gate2', w:1024, h:96, night:1.4}),0,8.9,f*1.47,0,0,f>0?0:Math.PI); }
    for(let i=0;i<9;i++){ const x=-8+i*2; Pg(new THREE.SphereGeometry(.16,8,6),M.bulb,x,9.2,1.3); if(i%2===0) glow(40+x,G0+9.2,403.3,1.2,0xffc070,.8); }
    makeLabel('🎢 Công viên Kỳ Quan QC World', 'Tàu lượn Thần Long · Tia Chớp · Song Dực Đại Bàng · Tháp Sấm Sét · Mắt Thần', {h:1.0, x:40, y:G0+30, z:402, fade:420});
  }
  { // ĐẠI LỘ ÁNH SAO (x 27…53, z 414…508): dải hoa giữa, đèn, ghế, thùng rác; nhà phố + 8 quầy ẩm thực
    for(let z=418; z<500; z+=20.5){ kF.add(boxM(2.6,.3,15),M.stoneLight,40,G0+.15,z+7.5); kF.add(flat(planeM(2.2,14.6,0,0)),M.lawn,40,G0+.31,z+7.5); boxes.push({x0:38.7, x1:41.3, z0:z, z1:z+15, msg:'🌷 Dải hoa giữa Đại lộ Ánh Sao'});
      for(let i=0;i<7;i++) GF.addTree(kN,i%3===1?'bush':'flower',40+((i%2)-.5)*.7,G0+.3,z+1.2+i*2.1,.8+((i*7)%5)*.06,i*1.7,i+z); tree('tier',40,z+7.5,.85,G0+.3); }
    for(let z=420; z<=504; z+=12){ lamp(31.4,z,Math.PI/2); lamp(48.6,z,-Math.PI/2); }
    for(let z=432; z<=496; z+=25){ bench(30.6,z+5,Math.PI/2); bench(49.4,z+5,-Math.PI/2); bin(30.6,z+7.4); bin(49.4,z+7.4); }
    const WALLS=[0xe8c9a0,0xd9a7a0,0xa9c4d6,0xe6dcc0,0xc7d8b0,0xe2b98a], SHUT=[0x2f6b4f,0x7a3b2e,0x1f4e79,0x8a6d1f];
    const FOOD=[['🍜','Phở Bò Kỳ Quan','Phở bò tái chín',18,0xc8312b],['🥖','Bánh Mì Ánh Sao','Bánh mì thập cẩm',12,0xd98e2b],['🍔','Burger Thần Long','Burger bò phô mai 2 tầng',22,0xb5342a],['🍕','Pizza Thiên Hà','Pizza hải sản lát lớn',20,0x4b3fa8],
      ['🧋','Trà Sữa Mây Bay','Trà sữa trân châu',14,0x9a5fc0],['🍦','Kem Tuyết Pha Lê','Kem ốc quế 3 vị',12,0x2f9fbf],['🍗','Gà Rán Đại Bàng','Gà rán giòn 3 miếng',20,0xd9642b],['🍿','Bắp Rang Sấm Sét','Bắp rang bơ + xúc xích',15,0xe0b020]];
    let fi=0; const chefs=[];
    [422,442.5,463,483.5].forEach((z,i)=>{ for(const s of [-1,1]){ const house=(i%2===0)===(s<0), fx=40+s*14, ry=s<0?Math.PI/2:-Math.PI/2;
        if(house){ const r=GF.build.townHouse(kF,{x:fx-s*.5, y:G0, z:z+8, ry, w:16, d:9.5, floors:i===0?[3.8,3.3,3.1]:[3.6,3.2], wall:WALLS[(i*2+(s>0?1:0))%6], seed:31+i*7+(s>0?3:0), shutter:SHUT[(i+(s>0?1:0))%4]});
          for(const [cx,cz] of (r && r.cols)||[]) circles.push({x:cx, z:cz, r:.2}); const hx=fx-s*.5; boxes.push({x0:Math.min(hx+s*.9,hx+s*9.5), x1:Math.max(hx+s*.9,hx+s*9.5), z0:z, z1:z+16, msg:'🏠 Nhà phố Đại lộ Ánh Sao'}); continue; }
        for(let j=0;j<2;j++){ const [ic,name,dish,price,colr]=FOOD[fi++], zz=z+4+j*8.2, Pk=local(kN,fx,G0,zz,ry), aw=M.fabricC(colr), aw2=M.fabricC(0xfff4e0), body=M.plasterC(0xf6efe2);
          Pk(boxM(5.6,1.05,.7),body,0,.525,-.9); Pk(cbox(5.8,.08,1.0,.02),M.woodLight,0,1.09,-.9); Pk(boxM(5.6,3.1,.25),body,0,1.55,-3.4); for(const e of [-1,1]) Pk(boxM(.25,3.1,2.9),body,e*2.8,1.55,-2.1);
          Pk(boxM(6.2,.22,3.6),M.whiteAlu,0,3.2,-2.0); for(let a=0;a<8;a++) Pk(boxM(.74,.06,1.9),a%2?aw:aw2,-2.59+a*.74,2.86,-.2,-.42);
          Pk(boxM(5.9,.9,.2),M.paint(colr,.5),0,3.85,-.3); Pk(pln(5.6,.72),sign(ic+' '+name.toUpperCase(),{fg:'#fff7e6', key:'food', w:1024, h:128, night:1.5, day:.3}),0,3.85,-.19);
          Pk(pln(2.2,1.3),sign(dish+' · '+price+' 💰',{bg:'#1d2b25', fg:'#ffe9a8', border:'#c9a96a', key:'menu', w:512, h:300, fs:44, night:1.0}),0,2.15,-3.26);
          for(const e of [-1.9,1.9]){ Pk(cylM(.16,.16,.3,10),M.chrome,e,1.28,-.9); Pk(new THREE.SphereGeometry(.12,8,6),M.bulb,e,2.7,-.3); } { const [gx,gz]=Pk.at(0,-.2); glow(gx,G0+2.7,gz,1.6,0xffc070,.7); }
          { const [x0,z0]=Pk.at(-2.9,-3.6), [x1,z1]=Pk.at(2.9,-.5); boxes.push({x0:Math.min(x0,x1), x1:Math.max(x0,x1), z0:Math.min(z0,z1), z1:Math.max(z0,z1), msg:ic+' Quầy '+name+' – gọi món ở mặt trước quầy'}); }
          const [ix,iz]=Pk.at(0,.5); INTER.push({x:ix, z:iz, r:2.4, prio:.6, label:`${ic} ${name}: ${dish} – ${price} 💰 (E)`, action:()=>pay(price, `${ic} <b>${dish}</b> ở quầy ${name}`, ()=>toast(`${ic} ${dish} nóng hổi đây! Ngồi bàn dù bên cạnh ăn rồi chơi tiếp nhé 😋`, 3000))});
          const [cx,cz]=Pk.at(0,-2.0); chefs.push([cx,cz,ry,name]);
          // bàn dù + 3 ghế
          const [tx,tz]=Pk.at(j?2.2:-2.2,2.9), Pt=local(kN,tx,G0,tz,ry); Pt(cylM(.55,.55,.05,16),M.woodLight,0,.74,0); Pt(cylM(.05,.05,2.5,8),M.whiteAlu,0,1.25,0); Pt(cylM(.3,.34,.04,12),M.blackMetal,0,.02,0); Pt(new THREE.ConeGeometry(1.5,.55,10),j?aw:aw2,0,2.6,0); circles.push({x:tx, z:tz, r:.6});
          for(let c=0;c<3;c++){ const a=ry+Math.PI/2+(c-1)*1.9+(j?0:Math.PI), sx=tx+Math.sin(a)*1.05, sz=tz+Math.cos(a)*1.05; kN.add(cylM(.22,.22,.05,12),M.rattan,sx,G0+.46,sz); kN.add(cylM(.03,.16,.44,8),M.blackMetal,sx,G0+.22,sz);
            if(W.addBench) W.addBench({x:sx, z:sz, rot:a+Math.PI, len:.6, y:G0+.49, floor:G0, label:'🪑 Ngồi bàn dù (E · C)'}); } } } });
    // đầu bếp đứng quầy
    if(W.people) chefs.forEach(([x,z,ry,name],i)=>{ try{ const sd=W.people.pickSeed(L=>i%2?L.female:!L.female, 910+i), kk=W.people.kit(sd,{}); const a=makeActor(kk.gl,{name:`${W.people.nameOf(sd)} · đầu bếp ${name}`, height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#ffb547'});
        a.g.position.set(x,G0,z); a.g.rotation.y=ry; a.play('idle',0); }catch(e){} });
    // quảng trường trung tâm: đài phun 3 tầng + 4 cột chỉ đường
    const Ph=local(kF,HUB.x,G0,HUB.z,0); Ph(cylM(5.4,5.6,.55,32),M.stoneLight,0,.28,0); Ph(cylM(5.0,5.0,.5,32,true),M.poolTile,0,.3,0); { const wm=new THREE.Mesh(flat(new THREE.CircleGeometry(5,32)),M.water); wm.position.set(HUB.x,G0+.46,HUB.z); gFar.add(wm); }
    Ph(cylM(.5,.7,2.2,12),M.stoneLight,0,1.1,0); Ph(cylM(2.3,.6,.3,24),M.stoneLight,0,2.3,0); Ph(cylM(.3,.4,1.5,10),M.stoneLight,0,3.1,0); Ph(cylM(1.2,.3,.24,20),M.stoneLight,0,3.9,0); Ph(new THREE.SphereGeometry(.42,14,10),M.chrome,0,4.5,0); circles.push({x:HUB.x, z:HUB.z, r:5.7});
    const SP=[[1,0,'🚀 Tia Chớp Không Gian →'],[-1,0,'← 🗼 Tháp Sấm Sét'],[.6,.8,'🎡 Mắt Thần · 🐉 Thần Long ↓'],[-.6,.8,'🦅 Song Dực Đại Bàng ↓']];
    for(const [dx,dz,txt] of SP){ const x=HUB.x+dx*17.5, z=HUB.z+dz*17.5, ry=Math.atan2(-dx,-dz); kN.add(cylM(.07,.09,3.2,8),M.blackMetal,x,G0+1.6,z); kN.add(boxM(2.9,.56,.08),M.paint(0x12305a,.5),x,G0+2.9,z,ry);
      for(const f of [1,-1]) kN.add(pln(2.8,.48),sign(txt,{fg:'#ffe9a8', key:'sp', w:512, h:88, night:1.2, day:.3}),x+Math.sin(ry)*.05*f,G0+2.9,z+Math.cos(ry)*.05*f,ry+(f>0?0:Math.PI)); circles.push({x,z,r:.15}); }
    for(let i=0;i<8;i++){ const a=i/8*TAU+.39; if(i%2) bench(HUB.x+Math.cos(a)*9.5,HUB.z+Math.sin(a)*9.5,Math.atan2(-Math.cos(a),-Math.sin(a))); else lamp(HUB.x+Math.cos(a)*19,HUB.z+Math.sin(a)*19,0); }
  }

  /* ============================== 5. ĐÀI PHUN NƯỚC NHẠC (trên hồ) ============================== */
  const JETS=[]; { const R=rng(5); for(let i=0;i<14;i++){ const a=-Math.PI*.5+(i-6.5)*.21; JETS.push({x:LG.x+Math.cos(a)*62, z:LG.z+Math.sin(a)*34, h:9+R()*3, ph:i*.45, k:0}); }
    for(let i=0;i<10;i++){ const a=i/10*TAU; JETS.push({x:LG.x+Math.cos(a)*72, z:LG.z+Math.sin(a)*40-(Math.sin(a)>0?6:0), h:6, ph:i*.63, k:1}); } for(const s of [-1,1]) JETS.push({x:LG.x+s*52, z:LG.z-8, h:22, ph:s, k:2}); }
  const jg=new THREE.CylinderGeometry(.05,.3,1,6,1,true); jg.translate(0,.5,0);
  const jets=new THREE.InstancedMesh(jg,new THREE.MeshBasicMaterial({color:0xeaf6ff, transparent:true, opacity:.5, depthWrite:false}),JETS.length); jets.frustumCulled=false; jets.userData.dynamic=true; gNear.add(jets);
  const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _s=new THREE.Vector3(), _p=new THREE.Vector3();
  function updJets(t){ JETS.forEach((j,i)=>{ const w=j.k===0?.5+.5*Math.sin(t*1.1-j.ph):j.k===1?.5+.5*Math.sin(t*.7+j.ph*2):Math.max(0,Math.sin(t*.35+j.ph)), h=Math.max(.05,j.h*w*w);
      _m4.compose(_p.set(j.x,WY,j.z),_q,_s.set(1+h*.05,h,1+h*.05)); jets.setMatrixAt(i,_m4); }); jets.instanceMatrix.needsUpdate=true; }
  updJets(0);

  /* ============================== 6. TRÒ CHƠI (themerides.js) ============================== */
  const T={W, ctx, GF, M, G0, WY, LG, TOWER, WHEEL, HUB, kL, kF, kN, gLand, gFar, gMid, gNear, hf, sdf, paved, dLG, LAKES, pay, glow, fence, bench, lamp, bin, tree, sign, pln, slab, strip, lift, flat, ss, railM, useSet:i=>{ cur=SETS[i]; }};
  const MS={}, tm0=performance.now(); let rides=null; try{ rides=makeRides(T); }catch(e){ console.warn('themerides', e); } MS.rides=Math.round(performance.now()-tm0);
  let land2=null, dark=null, play=null; if(rides){ cur=SETS[1]; { const t1=performance.now(); try{ land2=makeLand2(T, rides.kit); }catch(e){ console.warn('themeland2', e); } MS.land2=Math.round(performance.now()-t1); }
    { const t1=performance.now(); try{ dark=makeDark(T, rides.kit); }catch(e){ console.warn('themedark', e); } MS.dark=Math.round(performance.now()-t1); } { const t1=performance.now(); try{ play=makePlay(T, rides.kit); }catch(e){ console.warn('themeplay', e); } MS.play=Math.round(performance.now()-t1); } cur=SETS[0]; }

  /* ============================== 7. CÂY · ĐÈN VEN HỒ ============================== */
  { const R=rng(77), clear=(x,z)=>!paved(x,z,-2.5) && dLG(x,z)>13 && sdf(x,z)<-10 && !(rides && rides.blocked(x,z)) && !(land2 && land2.blocked(x,z)) && !LAKES.some(L=>Math.hypot((x-L.x)/L.a,(z-L.z)/L.b)<1.2) && !(Math.abs(x-40)<30 && z<414);
    // cây mọc thành cụm 3–6 cây (trông có chủ ý hơn rải đều)
    for(let i=0, n=0; i<4200 && n<(LOW?400:680); i++){ const x=BX.x0+R()*(BX.x1-BX.x0), z=BX.z0+R()*(BX.z1-BX.z0); if(!clear(x,z)) continue; const berm=hf(x,z)>G0+1.5, kind=berm?(R()<.6?'shade':'tier'):R()<.45?'shade':R()<.75?'round':'tier';
      tree(kind,x,z,.9+R()*.45); n++; for(let j=0, m=2+Math.floor(R()*4); j<m; j++){ const a=R()*TAU, r=4+R()*7, x2=x+Math.cos(a)*r, z2=z+Math.sin(a)*r; if(!clear(x2,z2)) continue; tree(R()<.7?kind:'round',x2,z2,.8+R()*.5); n++; } }
    for(let i=0;i<EN;i+=3){ const q=ell(i/EN*TAU,13.6,0); if(paved(q[0],q[2],-1.5) || (rides && rides.blocked(q[0],q[2]))) continue; tree('palm',q[0],q[2],.95+R()*.25,G0); }
    for(let i=1;i<EN;i+=5){ const th=i/EN*TAU, q=ell(th,11.4,0); if(Math.abs(q[0]-LG.x)<6) continue; lamp(q[0],q[2],Math.atan2(LG.x-q[0],LG.z-q[2])); if(i%10===1){ const b=ell(th+.045,10.6,0); bench(b[0],b[2],Math.atan2(LG.x-b[0],LG.z-b[2])); } }
    // rừng cây chia theo 2 bộ (Bắc / Nam) để ẩn hiện theo khoảng cách riêng; lõi tán đặc bên trong tán lá: nhìn từ xa / từ trên cao lá thẻ mỏng biến mất, lõi giữ cho cây vẫn là cây
    const BL={shade:[6.0,2.3,1.8], round:[3.1,1.3,1.0], tier:[4.0,1.5,2.0]}, bg=new THREE.IcosahedronGeometry(1,1), bm=new THREE.MeshStandardMaterial({color:0xffffff, roughness:.95, flatShading:true}), cq=new THREE.Quaternion(), cs=new THREE.Vector3(), cp=new THREE.Vector3(), cm=new THREE.Matrix4(), cc=new THREE.Color(), upY=new THREE.Vector3(0,1,0);
    SETS.forEach((S,si)=>{ for(const kind of Object.keys(trees)){ const L=trees[kind].filter(o=>(o.z<862)===(si===0)); if(!L.length) continue;
        const f=GF.forest(kind,L,kind.length+si); f.userData.dynamic=true; f.traverse(o=>{ if(o.isMesh) o.userData.noFar=true; }); S.gMid.add(f); if(!BL[kind]) continue;
        const [cy,rx,ry]=BL[kind], im=new THREE.InstancedMesh(bg,bm,L.length); L.forEach((o,i)=>{ cq.setFromAxisAngle(upY,o.r); cm.compose(cp.set(o.x,o.y+cy*o.s,o.z),cq,cs.set(rx*o.s,ry*o.s,rx*o.s)); im.setMatrixAt(i,cm); im.setColorAt(i,cc.setHSL(.29+((i*37)%10)/150,.5,.09+((i*13)%7)/110)); });
        im.castShadow=false; im.receiveShadow=true; im.userData.dynamic=true; im.computeBoundingSphere(); S.gLand.add(im); } }); }

  for(const S of SETS){ for(const m of S.kL.build(S.gLand)) m.userData.noFar=true; for(const m of S.kF.build(S.gFar)) m.userData.noFar=true; S.kN.build(S.gNear,{cast:false}); }
  PLACES.push({icon:'🎢', name:'Công viên Kỳ Quan · Cổng chính', sub:'Công viên chủ đề mới: Đại lộ Ánh Sao, phố ẩm thực, Hồ Pha Lê + 5 siêu trò chơi', go:()=>teleport(40,410,40,440)},
    {icon:'⛲', name:'Công viên Kỳ Quan · Quảng trường & Hồ Pha Lê', sub:'Đài phun nước nhạc, cầu đá, vọng lâu giữa hồ', go:()=>teleport(40,549,40,620)});

  /* ============================== khung hình ============================== */
  MS.all=Math.round(performance.now()-tm0); const API={G0, hf, sdf, dLG, paved, rides, land2, dark, play, SETS, hide:false, ms:MS};
  let tt=0; HOOK.onFrame.push((dt)=>{ dt=Math.min(dt,.1); tt+=dt; let anyNear=false;
    for(const S of SETS){ const d=S.d=Math.hypot(P.x-S.cx,P.z-clamp(P.z,S.cz-60,S.cz+60)), near=d<430 && !API.hide, mid=d<520 && !API.hide, far=d<560 && !API.hide, land=d<1050 && !API.hide;   /* API.hide: chỉ dùng khi đo hiệu năng */
      if(S.gMid.visible!==mid) S.gMid.visible=mid; if(S.gLand.visible!==land) S.gLand.visible=land; if(S.gNear.visible!==near) S.gNear.visible=near; if(S.gFar.visible!==far) S.gFar.visible=far; anyNear=anyNear||near; }
    if(SETS[0].gNear.visible && SETS[0].d<330) updJets(tt); if(rides) rides.update(dt,tt,anyNear);
    /* hộp trời của game chỉ rộng ±1000 m quanh gốc – khu Nam (z tới 1230) nằm ngoài nên trời bị đen → cho hộp trời đi theo người chơi */
    if(W.sky){ W.sky.position.x=P.x; W.sky.position.z=P.z; } });
  return API;
}
