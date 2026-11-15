// QC World – CÔNG VIÊN KỲ QUAN · ĐỢT 2 phần A (phiên đồ hoạ 15/11/2026) – gọi từ js/themepark.js sau makeRides
// Khu Nam (x −256…348 · z 840…1230), nối với khu Bắc bằng Đại lộ Phiêu Lưu (x 208–220) và đại lộ ngang z 884–896:
//  🦖 #4 Kỷ Jura Tuyệt Diệt · 🌋 #5 Lời Nguyền Hầm Mỏ Dung Nham (có đoạn tàu TRƯỢT LÙI) · 🔱 #6 Đền Thờ Atlantis Chìm Đắm
//  🏴‍☠️ #11 Con Tàu Ma Ngọc Trai Đen (xoay 360°) · 🎠 #12 Khúc Nhạc Cung Đình (ngựa gỗ 2 tầng) · 🌤 #17 Vũ Điệu Gió Trời (đu quay dây văng 60 m) · 🌀 #18 Con Lắc Thần Sấm
// Toàn bộ sinh vật / công trình tự dựng bằng khối hình + tô màu theo đỉnh (không dùng tài sản có bản quyền).
import { TRACKS, MOUNDS, moundH } from './coastertrack.js';
import { boxM, cylM } from './gfxkit.js';

export function makeLand2(T, K){
  const {W, GF, M, G0, kL, kF, kN, gLand, gFar, gMid, gNear, hf, pay, glow, fence, sign, pln, flat, slab, lamp, bench, bin, LAKES} = T;
  const {THREE, P, me, HOOK, INTER, toast, circles, addPlat, cam, clamp, lerp, mergeGeometries} = W;
  const {coaster, sideStation, entry, exitGate, lowFence, beam, beamG, sit, walkTo, start, end, tone, noise, wind, chase, ride, tix, BLK, paint, cr, EXTRA, ALL, V3} = K;
  const TAU=Math.PI*2, LOW=W.QUAL==='low', YP=G0+.05, hipH=()=>(me.h||1.75)*.53;
  const _a=V3(), _b=V3(), _mx=new THREE.Matrix4(), _qa=new THREE.Quaternion(), _qb=new THREE.Quaternion(), _eu=new THREE.Euler(), _one=V3(1,1,1), UP=V3(0,1,0);
  const vcMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.85, metalness:.05}), rockMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.96, flatShading:true});
  const caveMat=new THREE.MeshBasicMaterial({vertexColors:true, side:THREE.BackSide}), tubeMat=new THREE.MeshBasicMaterial({vertexColors:true}), glowMat=new THREE.MeshBasicMaterial({vertexColors:true}), blackMat=new THREE.MeshBasicMaterial({color:0x020203});
  const puffTex=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'), gr=x.createRadialGradient(32,32,2,32,32,31); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.55,'rgba(255,255,255,.55)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); })();
  const S=(r,w=12,h=9)=>new THREE.SphereGeometry(r,w,h), B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), Cy=(a,b,h,n=10,open=false)=>new THREE.CylinderGeometry(a,b,h,n,1,open), Co=(r,h,n=8)=>new THREE.ConeGeometry(r,h,n);
  // gom nhiều khối hình thành 1 lưới tô màu theo đỉnh
  function VG(){ const parts=[], cc=new THREE.Color(), self={ add(g,c,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){ g=g.index?g.toNonIndexed():g; for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal') g.deleteAttribute(k);
        _mx.compose(_a.set(x,y,z),_qa.setFromEuler(_eu.set(rx,ry,rz,'YXZ')),_b.set(sx,sy,sz)); g.applyMatrix4(_mx); cc.set(c); const n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=cc.r; a[i*3+1]=cc.g; a[i*3+2]=cc.b; }
        g.setAttribute('color',new THREE.BufferAttribute(a,3)); parts.push(g); return self; }, limb(a,b,r0,r1,c,n=7){ return self.add(beamG(a,b,r0,r1,n),c); }, geo(){ return mergeGeometries(parts,false); },
      mesh(mat=vcMat,parent=gMid,cast=true){ const m=new THREE.Mesh(self.geo(),mat); m.castShadow=cast; m.userData.dynamic=true; parent.add(m); return m; } }; return self; }
  const uvXZ=g=>{ const u=g.attributes.uv, p=g.attributes.position; for(let i=0;i<u.count;i++) u.setXY(i,p.getX(i),p.getZ(i)); return g; };
  const MND=Object.values(MOUNDS), mH=(x,z)=>{ let h=0; for(const m of MND) h=Math.max(h,moundH(m,x,z)); return h; };
  const TRJ=TRACKS.jura(G0), TRV=TRACKS.volcano(G0), TRA=TRACKS.atlantis(G0); ALL.push(TRJ,TRV,TRA);
  // IN[i] = mẫu ray nằm trong lòng núi (dùng cho: bóng tối, bỏ trụ đỡ, bỏ rào)
  const burial=p=>G0+mH(p[0],p[2])-p[1], inside=tr=>tr.P.map(p=>burial(p)>3.4), runIn=(IN,from)=>{ let a=Math.round(from); while(!IN[a]) a++; let b=a; while(IN[b+1]) b++; return [a,b]; };
  // CHỖ PHẢI KHOÉT MẶT NÚI: nơi mặt núi cắt ngang thân tàu / người ngồi (ray chôn nông < 3,4 m hoặc nổi < 1,5 m) và quanh mọi cửa hầm → không bao giờ có đá đâm xuyên qua tàu hay người
  const holesOf=(tr,IN)=>{ const H=[], N=tr.N; for(let i=0;i<N;i++){ if(tr.Z[i]==='dup') continue; const q=tr.P[i], b=burial(q); if(mH(q[0],q[2])>0 && b>-1.5 && b<3.4) H.push([q[0],q[2],3.6]);
      if(i && IN[i]!==IN[i-1]){ const d=IN[i]?1:-1, r=Math.hypot(tr.T[i][0],tr.T[i][2])<.8?5.4:4.4; for(let k=-6;k<=2;k++){ const w=tr.P[(i+k*d+N)%N]; H.push([w[0],w[2],r]); } } } return H; };
  const PW=pts=>i=>{ for(let k=1;k<pts.length;k++) if(i<=pts[k][0]){ const [i0,v0]=pts[k-1], [i1,v1]=pts[k]; return lerp(v0,v1,clamp((i-i0)/Math.max(1,i1-i0),0,1)); } return pts[pts.length-1][1]; };
  // bỏ các tam giác của 1 khối hình mà tâm tam giác thoả test(x,y,z) (khoét cửa trên vòm)
  const cutGeo=(geo,test)=>{ const g=geo.index?geo.toNonIndexed():geo, a=g.attributes.position, keep=[]; for(let i=0;i<a.count;i+=3){ const x=(a.getX(i)+a.getX(i+1)+a.getX(i+2))/3, y=(a.getY(i)+a.getY(i+1)+a.getY(i+2))/3, z=(a.getZ(i)+a.getZ(i+1)+a.getZ(i+2))/3; if(!test(x,y,z)) keep.push(i,i+1,i+2); }
    const o=new THREE.BufferGeometry(); for(const k of Object.keys(g.attributes)){ const src=g.attributes[k], n=src.itemSize, arr=new Float32Array(keep.length*n); keep.forEach((v,j)=>{ for(let c=0;c<n;c++) arr[j*n+c]=src.array[v*n+c]; }); o.setAttribute(k,new THREE.BufferAttribute(arr,n)); } return o; };

  /* ============================== LỐI ĐI KHU NAM ============================== */
  slab(kF,M.pave,-210,330,884,896,YP+.004); slab(kF,M.pave,108,120,896,1100,YP+.006); slab(kF,M.granite,108,186,1086,1104,YP+.012); slab(kF,M.granite,136,157,896,936,YP+.012); slab(kF,M.granite,14,44,896,912,YP+.012); slab(kF,M.pave,-166,-154,896,962,YP+.006);
  kF.add(uvXZ(flat(new THREE.CircleGeometry(16,48))),M.terrazzo,-160,YP+.016,975);
  for(let x=-200;x<=320;x+=26){ if(Math.abs(x-214)<10 || Math.abs(x-114)<8 || Math.abs(x+160)<8) continue; lamp(x,883.2,0); if(x%52===0) bench(x+6,896.9,Math.PI); }
  for(let z=660;z<=870;z+=30){ lamp(207.2,z,Math.PI/2); if(z%60===0) bench(221,z+8,-Math.PI/2); }
  { const x=214, z=878; kN.add(cylM(.08,.1,3.6,8),M.blackMetal,x,G0+1.8,z); [['🦖 Kỷ Jura · 🔱 Atlantis →',0,3.3],['← 🌋 Hầm Mỏ Dung Nham',0,2.6],['← 🏴‍☠️ 🎠 🌤 🌀 Khu Lễ Hội',0,1.9]].forEach(([t,ry,y])=>{ kN.add(boxM(3.6,.56,.08),M.paint(0x12305a,.5),x,G0+y,z,ry);
      for(const f of [0,Math.PI]) kN.add(pln(3.5,.48),sign(t,{fg:'#ffe9a8', key:'sp2', w:640, h:88, night:1.2, day:.3}),x+Math.sin(f)*.05,G0+y,z+Math.cos(f)*.05,f); }); circles.push({x,z,r:.16}); }

  /* ============================== NÚI · HANG · HẦM ============================== */
  // núi đá: lưới độ cao theo MOUNDS, mặt đá phẳng từng mảng; chân núi ngả màu cỏ. Người chơi không leo được (rào vô hình quanh chân núi).
  function mound(name,pal,holes=[]){ const m=MOUNDS[name], R=m.rx>40?4:3, x0=m.x-m.rx-R, z0=m.z-m.rz-R, nx=Math.ceil((m.rx*2+R*2)/R)+1, nz=Math.ceil((m.rz*2+R*2)/R)+1, pos=[], col=[], idx=[], c=new THREE.Color(), c1=new THREE.Color(pal[0]), c2=new THREE.Color(pal[1]), c3=new THREE.Color(pal[2]||pal[1]), gr=new THREE.Color(0x5f8a3c), hs=[];
    for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const x=x0+i*R, z=z0+j*R, h=moundH(m,x,z), n=(Math.sin(x*.37+z*.21)*Math.cos(z*.29-x*.17)+.5*Math.sin(x*.9+z*1.3))*Math.min(.9,h*.1); hs.push(h); pos.push(x,G0-.2+(h>0?h+n:0),z);
        const k=clamp(h/m.h,0,1); c.copy(c1).lerp(c2,k).lerp(c3,Math.max(0,k-.8)*5).multiplyScalar(.82+.3*Math.abs(Math.sin(h*.9+x*.13))); if(h<3.5) c.lerp(gr,1-h/3.5); col.push(c.r,c.g,c.b); }
    for(let j=0;j<nz-1;j++) for(let i=0;i<nx-1;i++){ const a=j*nx+i, b=a+1, cc=a+nx, d=cc+1; if(hs[a]+hs[b]+hs[cc]+hs[d]<=0) continue; const qx=x0+(i+.5)*R, qz=z0+(j+.5)*R; if(holes.some(h=>(qx-h[0])**2+(qz-h[1])**2<h[2]*h[2])) continue;
        /* ô nằm CHÌM trong thân một ngọn núi khác cao hơn → bỏ (nếu không, mặt gò thấp sẽ cắt ngang lòng hang rỗng của núi lớn, đâm qua đầu người ngồi tàu) */ if(MND.some(o2=>o2!==m && moundH(o2,qx,qz)>Math.max(hs[a],hs[b],hs[cc],hs[d])+.4)) continue; idx.push(a,cc,b,b,cc,d); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
    const ms=new THREE.Mesh(g,rockMat); ms.castShadow=ms.receiveShadow=true; ms.userData.dynamic=true; ms.userData.noFar=true; gLand.add(ms);
    const ring=[]; for(let i=0;i<=28;i++){ const a=i/28*TAU; ring.push([m.x+Math.cos(a)*m.rx*.99,m.z+Math.sin(a)*m.rz*.99]); } fence(ring,{vis:false, r:.3, msg:'⛰️ Vách núi dựng đứng – không leo được. Vào trong núi bằng tàu lượn nhé!'});
    BLK.push([m.x-m.rx-3,m.x+m.rx+3,m.z-m.rz-3,m.z+m.rz+3]); return ms; }
  // lòng núi rỗng (vỏ trong, nhìn từ bên trong): cách mặt núi 3,2 m, dưới thấp ngả màu theo ánh dung nham / đuốc
  function cavern(names,lo,hi,holes=[]){ const ms=names.map(n=>MOUNDS[n]), x0=Math.min(...ms.map(m=>m.x-m.rx)), x1=Math.max(...ms.map(m=>m.x+m.rx)), z0=Math.min(...ms.map(m=>m.z-m.rz)), z1=Math.max(...ms.map(m=>m.z+m.rz)), R=4, nx=Math.ceil((x1-x0)/R)+1, nz=Math.ceil((z1-z0)/R)+1, pos=[], col=[], idx=[], hs=[], c=new THREE.Color(), cl=new THREE.Color(lo), ch=new THREE.Color(hi);
    for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const x=x0+i*R, z=z0+j*R; let h=0; for(const m of ms) h=Math.max(h,moundH(m,x,z)); h=Math.max(0,h-1.3); hs.push(h); pos.push(x,G0+h+(h>0?Math.sin(x*.5+z*.3)*.2:0),z); c.copy(cl).lerp(ch,clamp(h/24,0,1)).multiplyScalar(.75+.4*Math.abs(Math.sin(x*.41+z*.77))); col.push(c.r,c.g,c.b); }
    for(let j=0;j<nz-1;j++) for(let i=0;i<nx-1;i++){ const a=j*nx+i, b=a+1, cc=a+nx, d=cc+1; if(Math.max(hs[a],hs[b],hs[cc],hs[d])<=0) continue; const qx=x0+(i+.5)*R, qz=z0+(j+.5)*R; if(holes.some(h=>(qx-h[0])**2+(qz-h[1])**2<h[2]*h[2])) continue; idx.push(a,cc,b,b,cc,d); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeBoundingSphere(); const ms2=new THREE.Mesh(g,caveMat); ms2.userData.dynamic=true; gMid.add(ms2); return ms2; }
  // hầm hộp chữ nhật bám theo ray từ mẫu i0 tới i1 (nhìn từ trong: vách tối, mỗi khoang đậm nhạt khác nhau)
  function tube(tr,i0,i1,o={}){ const pos=[], col=[], idx=[], c=new THREE.Color(), base=new THREE.Color(o.col||0x3a332c); let n=0;
    for(let i=i0;i<=i1;i+=2){ const p=tr.P[i], t=tr.T[i], L=cr(tr.U[i],t), lh=Math.hypot(L[0],L[2])||1, lx=L[0]/lh, lz=L[2]/lh, th=Math.max(.3,Math.hypot(t[0],t[2])), hw=o.wf?o.wf(i):(o.w||2.7), hc=(o.hf?o.hf(i):(o.h||4.3))/th, fl=.95/th, k=.55+.5*Math.abs(Math.sin(i*1.7)); c.copy(base).multiplyScalar(k);
      for(const [sx,dy] of [[-1,-fl],[1,-fl],[1,hc],[-1,hc]]){ pos.push(p[0]+lx*sx*hw,p[1]+dy,p[2]+lz*sx*hw); col.push(c.r,c.g,c.b); } if(n){ const a=(n-1)*4, b=n*4; for(let k2=0;k2<4;k2++){ const k3=(k2+1)%4; idx.push(a+k2,b+k2,a+k3,a+k3,b+k2,b+k3); } } n++; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeBoundingSphere(); const ms=new THREE.Mesh(g,tubeMat); ms.userData.dynamic=true; gMid.add(ms); return ms; }
  function portals(tr,IN,stone){ const N=tr.N; for(let i=1;i<N;i++){ if(IN[i]===IN[i-1] || tr.Z[i]==='dup' || tr.Z[i-1]==='dup') continue; const p=tr.P[i], t=tr.T[i], out=IN[i]?-1:1; if(Math.abs(t[1])>.2 || Math.hypot(tr.U[i][0],tr.U[i][2])>.25) continue;
      const ry=Math.atan2(t[0]*out,t[2]*out), c=Math.cos(ry), s=Math.sin(ry), at=(lx,lz)=>[p[0]+lx*c+lz*s,p[2]-lx*s+lz*c], y0=p[1]-.95, put=(g,mat,lx,y,lz)=>{ const [x,z]=at(lx,lz); return kF.add(g,mat,x,y0+y,z,ry); };
      for(const e of [-1,1]){ put(boxM(.9,5.8,.9),stone,e*4.4,2.9,5.2); put(boxM(.6,5.6,10),stone,e*4.45,2.8,.6); } put(boxM(9.8,1,1.1),stone,0,6.1,5.2); put(boxM(9.5,.6,10),stone,0,5.85,.6); } }
  // chạy theo quãng đường của đầu tàu: k = 0…1 khi đầu tàu đi từ mốc+a tới mốc+b
  const prog=(co,mark,a,b)=>clamp((co.s-(co.tr.marks[mark]+a))/(b-a),0,1), seatIdx=(co)=>Math.floor((((co.s-(co.dir>0?1:11))/co.tr.ds)%co.tr.N+co.tr.N)%co.tr.N);
  const waterDisc=(L,parent=gFar)=>{ const g=flat(new THREE.CircleGeometry(1,48)); g.scale(L.a*1.02,1,L.b*1.02); const wm=new THREE.Mesh(g,M.water); wm.position.set(L.x,L.wy,L.z); wm.receiveShadow=true; wm.userData.dynamic=true; parent.add(wm);
    const ring=[]; for(let i=0;i<=24;i++){ const a=i/24*TAU; ring.push([L.x+Math.cos(a)*L.a*1.08,L.z+Math.sin(a)*L.b*1.08]); } fence(ring,{vis:false, r:.25, msg:`🌊 ${L.name} – không xuống nước`}); BLK.push([L.x-L.a-2,L.x+L.a+2,L.z-L.b-2,L.z+L.b+2]); };
  for(const L of LAKES) waterDisc(L);

  /* ============================== 🦖 #4 KỶ JURA TUYỆT DIỆT ============================== */
  { const tr=TRJ, IN=inside(tr), mk=tr.marks;
    const HJ=holesOf(tr,IN), iT=Math.round(mk.trex), iC=Math.round(mk.cave), iEx=tr.P.findIndex((q,i)=>i>iT+10 && !IN[i]), a0=runIn(IN,mk.tun1)[0];
    mound('jura1',[0x6f6a58,0x8a8068,0x9a927c],HJ); mound('jura2',[0x6f6a58,0x857a62],HJ); portals(tr,IN,M.stoneDark);
    tube(tr,a0,iEx+1,{col:0x4a4238, wf:PW([[a0,2.7],[iC-2,2.7],[iC+4,3.6],[iT-16,3.6],[iT-8,7.6],[iT+8,7.6],[iEx,3.8]]), hf:PW([[a0,4.3],[iC-2,4.3],[iC+4,5],[iT-16,5],[iT-8,13],[iT+8,13],[iEx,5.5]])}); { const [a,b]=runIn(IN,mk.fall-14); tube(tr,a,b,{col:0x40382e}); }
    /* (đại sảnh T-Rex giờ là một phần của khoang hầm liền khối ở trên) */
    // khủng long ăn cỏ ở thung lũng: 2 con cổ dài (cổ + đầu đung đưa) + 3 con ba sừng
    const brachio=()=>{ const g=VG(), c=0x6f8a5a, c2=0x86a06e; g.add(S(1),c,0,5.2,0,0,0,0,2.3,2.1,4.2); for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(Cy(.62,.5,4.4),c,sx*1.45,2.2,sz*2.3); g.limb([0,5.6,-3.6],[0,3.2,-8.4],1.05,.5,c).limb([0,3.2,-8.4],[0,1.4,-11.6],.5,.12,c); g.add(S(1),c2,0,4.5,.2,0,0,0,2.0,1.4,3.6); return g; };
    const neck=()=>{ const g=VG(), c=0x6f8a5a, pts=[[0,0,0],[0,2.4,1.5],[0,4.9,2.6],[0,7.2,3.2],[0,8.6,4.3]]; for(let i=0;i<4;i++) g.limb(pts[i],pts[i+1],1.0-i*.17,.84-i*.17,c); g.add(S(1),c,0,8.9,5.1,.25,0,0,.5,.45,1.0); for(const sx of [-1,1]) g.add(S(.09,6,5),0x1a1a1a,sx*.36,9.05,5.5); return g; };
    const BR=[[226,941,2.2],[262,907.5,-.5]].map(([x,z,ry])=>{ const b=brachio().mesh(); b.position.set(x,G0,z); b.rotation.y=ry; const n=neck().mesh(); n.position.set(x+Math.sin(ry)*3.3,G0+6.1,z+Math.cos(ry)*3.3); n.rotation.order='YXZ'; n.rotation.y=ry; circles.push({x,z,r:3.2}); return n; });
    { const g=VG(), c=0x8a6f4a; for(const [x,z,ry] of [[205,929,1.2],[241,937.5,-1.9],[197,934,2.4]]){ const cs=Math.cos(ry), sn=Math.sin(ry), at=(lx,lz)=>[x+lx*cs+lz*sn,z-lx*sn+lz*cs], ad=(geo,cl,lx,y,lz,rx=0,sx=1,sy=1,sz=1)=>{ const [wx,wz]=at(lx,lz); g.add(geo,cl,wx,G0+y,wz,rx,ry,0,sx,sy,sz); };
        ad(S(1),c,0,1.35,0,0,1.15,1.05,2.3); for(const sx of [-1,1]) for(const sz of [-1,1]) ad(Cy(.3,.26,1.1),c,sx*.7,.55,sz*1.2); ad(S(1),c,0,1.45,2.6,0,.62,.6,1.0); ad(Cy(1.15,1.15,.16,10),0x7a5a3a,0,2.0,2.1,1.1); ad(Co(.1,.9,6),0xf2ead6,.3,2.05,3.1,1.2); ad(Co(.1,.9,6),0xf2ead6,-.3,2.05,3.1,1.2); ad(Co(.08,.4,6),0xf2ead6,0,1.6,3.6,1.3); ad(Co(.5,2.4,6),c,0,1.3,-3.2,-1.5); circles.push({x,z,r:1.9}); }
      g.mesh(); }
    for(const [x,z,s] of [[214,905,1.2],[236,903,1],[250,946,1.3],[188,925,1.1],[268,940,1.2],[292,912,1.1],[181,1022,1],[186,1040,1.2],[158,1003,1]]) T.tree('palm',x,z,s,G0);
    // hầm báo động: đèn đỏ chớp + xe thám hiểm lật
    const alarm=new THREE.MeshBasicMaterial({color:0xff2a1a}); { const g=VG(); for(let i=Math.round(mk.tun1)+8;i<mk.cave-6;i+=8){ const p=tr.P[i], L=cr(tr.U[i],tr.T[i]); for(const sx of [-1,1]) g.add(S(.22,8,6),0xffffff,p[0]+L[0]*sx*2.4,p[1]+3.4,p[2]+L[2]*sx*2.4); } const ms=new THREE.Mesh(g.geo(),alarm); ms.userData.dynamic=true; gMid.add(ms);
      const p=tr.P[Math.round(mk.tun1)+18], w=VG(); w.add(B(1.6,.9,3),0x5a6a3a,0,.3,0,0,.4,2.6).add(B(1.5,.5,1.4),0x2a2e24,0,.9,-.2,0,.4,2.6); const m2=w.mesh(); m2.position.set(p[0]+2.0,p[1]-.6,p[2]); }
    // 4 con raptor phục kích trong hang (1 lưới dựng nhiều bản)
    const rap=(()=>{ const g=VG(), c=0x6a7a3a, c2=0x3a4a22; g.add(S(1),c,0,1.15,0,-.25,0,0,.34,.42,1.0).limb([0,1.2,-.8],[0,1.05,-2.6],.22,.04,c).limb([0,1.35,.7],[0,1.85,1.25],.2,.15,c).add(B(.26,.26,.62),c,0,1.95,1.55,.1).add(B(.22,.1,.5),c2,0,1.78,1.6,.35);
      for(const sx of [-1,1]){ g.limb([sx*.22,1.0,-.1],[sx*.26,.5,.15],.13,.08,c).limb([sx*.26,.5,.15],[sx*.26,.05,-.05],.07,.05,c).add(B(.14,.06,.36),c2,sx*.26,.04,.1).limb([sx*.2,1.25,.55],[sx*.26,.95,.95],.06,.04,c).add(S(.05,6,5),0xffd23a,sx*.14,2.02,1.7); }
      const im=new THREE.InstancedMesh(g.geo(),vcMat,4); im.frustumCulled=false; im.userData.dynamic=true; gMid.add(im); return im; })();
    const RP=[0,1,2,3].map(j=>{ const i=Math.round(mk.cave)+3+j*3, p=tr.P[i], L=cr(tr.U[i],tr.T[i]), sx=j%2?1:-1; return {x:p[0], y:p[1]-.9, z:p[2], lx:L[0]*sx, lz:L[2]*sx, ry:Math.atan2(-L[0]*sx,-L[2]*sx), k:0, at:3+j*3}; });
    RP.forEach((r,j)=>{ _mx.compose(_a.set(r.x+r.lx*4.4,r.y+1.6,r.z+r.lz*4.4),_qa.setFromEuler(_eu.set(0,r.ry,0,'YXZ')),_one); rap.setMatrixAt(j,_mx); });
    // T-Rex: thân + đầu lao ra, hàm dưới há
    const rexHead=()=>{ const g=VG(), c=0x5b4a32, c2=0x7a6648; g.add(S(1),c,0,0,0,0,0,0,1.25,1.2,1.7).add(B(1.7,1.25,2.4),c,0,.05,2.0).add(B(1.5,.5,1.1),c2,0,.55,2.9).add(B(.5,.34,.6),c,-.62,.95,.9).add(B(.5,.34,.6),c,.62,.95,.9);
      for(const sx of [-1,1]){ g.add(S(.17,8,6),0xffc21a,sx*.74,.6,1.15).add(S(.08,6,5),0x111111,sx*.86,.6,1.2); for(let i=0;i<8;i++) g.add(Co(.09,.34,5),0xf5efdc,sx*.72,-.72,1.0+i*.3,Math.PI); } for(let i=0;i<5;i++) g.add(Co(.09,.34,5),0xf5efdc,-.5+i*.25,-.72,3.15,Math.PI); return g; };
    const rexJaw=()=>{ const g=VG(), c=0x4f3f2a; g.add(B(1.45,.42,2.9),c,0,-.2,1.5).add(B(1.2,.1,2.6),0x8a2a2a,0,.02,1.5); for(const sx of [-1,1]) for(let i=0;i<7;i++) g.add(Co(.08,.28,5),0xf5efdc,sx*.62,.18,.5+i*.34); return g; };
    const REX=new THREE.Group(); REX.userData.dynamic=true; gMid.add(REX); { const pt=tr.P[Math.round(mk.trex)], body=VG(); body.add(S(1),0x5b4a32,0,-2.6,-4.2,.5,0,0,2.4,2.9,4.0).limb([0,-1.2,-1.6],[0,0,0],1.7,1.25,0x5b4a32); for(const sx of [-1,1]) body.limb([sx*1.6,-2.4,-1.6],[sx*1.3,-3.6,-.2],.22,.12,0x5b4a32);
      const bm=new THREE.Mesh(body.geo(),vcMat), hm=new THREE.Mesh(rexHead().geo(),vcMat), jm=new THREE.Mesh(rexJaw().geo(),vcMat); jm.position.set(0,-.62,.1); hm.add(jm); REX.add(bm,hm); REX.userData={dynamic:true, jaw:jm, head:hm, x:pt[0]-9, y:pt[1]+2.4, z:pt[2]-4.2, k:0}; REX.position.set(pt[0]-11.8,pt[1]+2.4,pt[2]-7); REX.rotation.y=Math.PI/4; }   /* nấp sau vách đại sảnh phía trước-bên phải, lao chéo ra đón đầu tàu */
    // bộ xương hoá thạch ở cửa ra vách núi + thác nước trước hầm 2
    { const i0=tr.P.findIndex((p,i)=>i>mk.trex+10 && !IN[i]), g=VG(), c=0xe8e0c8; for(let j=0;j<5;j++){ const p=tr.P[i0+j*3], L=cr(tr.U[i0+j*3],tr.T[i0+j*3]), u=tr.U[i0+j*3]; for(const sx of [-1,1]) for(let k=0;k<5;k++){ const a0=k/5*1.5, a1=(k+1)/5*1.5, pt=a=>[p[0]+L[0]*sx*3.4*Math.cos(a)+u[0]*(3.6*Math.sin(a)-.6),p[1]+L[1]*sx*3.4*Math.cos(a)+u[1]*(3.6*Math.sin(a)-.6),p[2]+L[2]*sx*3.4*Math.cos(a)+u[2]*(3.6*Math.sin(a)-.6)]; g.limb(pt(a0),pt(a1),.2,.17,c,6); } }
      g.mesh(vcMat,gFar); }
    const fallTex=(()=>{ const cv=document.createElement('canvas'); cv.width=64; cv.height=256; const x=cv.getContext('2d'); x.fillStyle='#bfe6ff'; x.fillRect(0,0,64,256); for(let i=0;i<260;i++){ x.fillStyle=`rgba(255,255,255,${.25+Math.random()*.6})`; x.fillRect(Math.random()*64,Math.random()*256,1+Math.random()*2,10+Math.random()*40); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,1); return t; })();
    const fallMat=new THREE.MeshBasicMaterial({map:fallTex, transparent:true, opacity:.8, depthWrite:false, side:THREE.DoubleSide}); { const i=tr.P.findIndex((p,k)=>k>mk.fall-12 && IN[k]), p=tr.P[i], t=tr.T[i], ms=new THREE.Mesh(new THREE.PlaneGeometry(9,9),fallMat); ms.position.set(p[0]-t[0]*3.2,p[1]+3.4,p[2]-t[2]*3.2); ms.rotation.y=Math.atan2(t[0],t[2]); ms.userData.dynamic=true; gMid.add(ms); }
    const o={id:'jura', name:'Kỷ Jura Tuyệt Diệt', icon:'🦖', price:35, wait:'9', sub:'Tàu thám hiểm xuyên rừng tiền sử: thung lũng khủng long → hầm báo động → hang raptor → T-Rex → lao 75° → xoắn trên hồ → xuyên thác', tr, rail:0x6b5a3a, spine:0x4a3f2c, tie:0x3a3226, sup:0x5a4a34, body:0x4a5a34, body2:0xd9b23a, col:0x5a4a2c, roof:0x3f4a2c, fg:'#ffe0a0', style:'jeep',
      cfg:{lift:4.5, brakeV:6, stV:5}, seatSide:()=>1, near:ALL, dwell:18, noSup:(p,i)=>IN[i], dark:co=>IN[seatIdx(co)], darkCol:0x070604,
      top:(put,cx,mz,hw)=>{ for(const e of [-1,1]){ put(kF,cylM(.16,.2,2.6,8),M.woodDark,cx+e*hw,9.6,mz); put(kF,new THREE.ConeGeometry(.5,1.5,8),M.bulb,cx+e*hw,11.5,mz); } put(kF,boxM(hw*2+3,.6,1.5),M.woodDark,cx,9.3,mz); },
      tick:(co,dt,riding)=>{ const t=performance.now()/1000; BR.forEach((n,i)=>{ n.rotation.x=.1*Math.sin(t*.5+i*2); n.rotation.y+=(Math.sin(t*.23+i)*.25+(i?-.5:2.2)-n.rotation.y)*dt; }); alarm.color.setRGB(.25+.75*Math.abs(Math.sin(t*5)),.03,.02); fallTex.offset.y=t*.9;
        const kc=co.phase==='dock'?-1:co.s-mk.cave; RP.forEach((r,j)=>{ const want=kc>r.at-7 && kc<r.at+9?1:0; r.k+=(want-r.k)*Math.min(1,dt*(want?7:2)); const d=4.4-1.4*r.k;   /* mõm raptor dừng cách tim ray 1,1 m (ngoài khung xe) – trước đây thò vào tận ghế */ _mx.compose(_a.set(r.x+r.lx*d,r.y+1.6*(1-r.k),r.z+r.lz*d),_qa.setFromEuler(_eu.set(-.5*r.k,r.ry,0,'YXZ')),_one); rap.setMatrixAt(j,_mx); if(riding && want && r.k<.15 && !r.sn){ r.sn=1; noise(.2,.5,900,2400); } if(!want) r.sn=0; }); rap.instanceMatrix.needsUpdate=true;
        const kr=co.phase==='dock'?0:prog(co,'trex',-16,-2)*(1-prog(co,'trex',16,34)), U=REX.userData; U.k+=(kr-U.k)*Math.min(1,dt*5); REX.position.set(U.x-2.83*(1-U.k),U.y-1.0*U.k,U.z-2.83*(1-U.k)); U.head.rotation.x=.42*kr; U.jaw.rotation.x=.75*kr*(.6+.4*Math.abs(Math.sin(t*9)));
        if(riding && kr>.5 && !U.roar){ U.roar=1; noise(.34,2.4,160,60); tone(90,48,2.2,.16,'sawtooth'); ride.shake=1; toast('🦖 T-REX! Bám chặt – tàu lao thẳng xuống vực!', 2600); } if(kr<.1) U.roar=0; if(riding && kr>.5) ride.shake=Math.max(ride.shake||0,.6);
        if(riding && co.phase!=='dock'){ const kf=co.s-mk.fall; if(kf>-2 && kf<1 && !co.fx){ co.fx=1; noise(.3,1.2,1200,400); toast('💦 Xuyên qua thác nước!', 1800); } if(kf>20) co.fx=0; } } };
    const sta=sideStation(o); Object.assign(o,{yP:sta.yP, inZone:sta.inZone, boardPt:sta.boardPt}); const co=coaster(o); co.gates=sta.gates; co.op=sta.op; lowFence(tr,G0+2.4,(i,p)=>sta.skip(p[0],p[2]) || IN[i] || hf(p[0],p[2])<G0-.3);
    INTER.push({x:sta.ip[0], z:sta.ip[1], r:3.6, prio:.95, when:()=>!ride.kind && Math.abs(P.y-sta.yP)<.9, label:'🦖 Lên xe thám hiểm Kỷ Jura – hàng ghế đầu (E)', action:()=>co.board(0)}); }

  /* ============================== 🌋 #5 LỜI NGUYỀN HẦM MỎ DUNG NHAM ============================== */
  { const tr=TRV, IN=inside(tr), mk=tr.marks, VC=MOUNDS.volc;
    const HV=holesOf(tr,IN); mound('volc',[0x4a3d36,0x3a302c,0x7a2a16],HV); mound('volcN',[0x4a3d36,0x3f3430],HV); mound('crys',[0x5a4c40,0x4a4038],HV); portals(tr,IN,M.woodDark);
    cavern(['volc','volcN'],0x7a2c0c,0x140c0a,HV); { const [a,b]=runIn(IN,mk.crys-12); tube(tr,a,b,{col:0x2c2a3a}); }
    // mặt dung nham trong lõi + suối dung nham ngoài sườn + khói miệng núi
    const lava=new THREE.MeshBasicMaterial({color:0xff7a1a}); { const g=flat(new THREE.CircleGeometry(50,40)); const ms=new THREE.Mesh(g,lava); ms.position.set(VC.x-4,G0+.12,VC.z-8); ms.userData.dynamic=true; gMid.add(ms);
      const st=VG(); for(let k=0;k<7;k++){ const a=k/7*TAU+.4; let pr=null; for(let r=.16;r<.98;r+=.09){ const rr=r*VC.rx, x=VC.x+Math.cos(a+Math.sin(r*7+k)*.12)*rr, z=VC.z+Math.sin(a+Math.sin(r*7+k)*.12)*rr, q=[x,G0+moundH(VC,x,z)+.5,z]; if(pr) st.limb(pr,q,.9-r*.55,.85-r*.55,0xffffff,5); pr=q; } } const sm=new THREE.Mesh(st.geo(),lava); sm.userData.dynamic=true; gLand.add(sm); }
    const SMK=40, sp=new Float32Array(SMK*3), smoke=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(sp,3)),new THREE.PointsMaterial({map:puffTex, color:0x5a5450, size:13, transparent:true, opacity:.55, depthWrite:false})); smoke.frustumCulled=false; smoke.userData.dynamic=true; gLand.add(smoke);
    // pha lê phát sáng trong hầm mỏ số 1
    const crysMat=new THREE.MeshBasicMaterial({color:0xffffff}); { const g=new THREE.OctahedronGeometry(.34), n=64, im=new THREE.InstancedMesh(g,crysMat,n), c=new THREE.Color(); for(let j=0;j<n;j++){ const i=Math.round(mk.crys)+3+Math.floor(j*(mk.crysEnd-mk.crys-6)/n), p=tr.P[i], L=cr(tr.U[i],tr.T[i]), sx=j%2?1:-1, hy=(j*37%10)/10;
        _mx.compose(_a.set(p[0]+L[0]*sx*(2.45-hy*.5),p[1]-.6+hy*4.2,p[2]+L[2]*sx*(2.45-hy*.5)),_qa.setFromEuler(_eu.set(j,j*2,j*3)),_b.set(.6+hy,1.2+hy*1.4,.6+hy)); im.setMatrixAt(j,_mx); im.setColorAt(j,c.setHSL((j*.137)%1,.85,.6)); } im.userData.dynamic=true; gMid.add(im); }
    // quái vật đá dung nham trên đỉnh đường cụt: 2 tay đập xuống
    const GOL=new THREE.Group(); GOL.userData.dynamic=true; gMid.add(GOL); { const p=tr.P[Math.round(mk.golem)], t=tr.T[Math.round(mk.golem)-3], b=VG(), c=0x3a302c; b.add(S(1,9,7),c,0,0,0,0,0,0,2.6,3.0,2.2).add(S(1,8,6),c,0,3.4,.3,0,0,0,1.3,1.2,1.2); const body=new THREE.Mesh(b.geo(),rockMat);
      const e=VG(); for(const sx of [-1,1]) e.add(S(.26,8,6),0xffffff,sx*.5,3.6,1.3); e.add(S(.7,8,6),0xffffff,0,.6,2.0); for(let k=0;k<6;k++) e.add(B(.16,.9,.1),0xffffff,-1.4+k*.56,.2+Math.sin(k*2)*1.0,2.05,0,0,k); const eyes=new THREE.Mesh(e.geo(),lava);
      const arm=sx=>{ const g=new THREE.Group(), a=VG(); a.add(S(1,8,6),c,0,-2.2,0,0,0,0,.95,2.6,.95).add(S(1.25,8,6),c,0,-5.0,0); g.add(new THREE.Mesh(a.geo(),rockMat)); g.position.set(sx*3.2,2.4,.4); return g; }, al=arm(-1), ar=arm(1); GOL.add(body,eyes,al,ar);
      GOL.position.set(p[0]+t[0]*7.5,p[1]+3.4,p[2]+t[2]*7.5); GOL.rotation.y=Math.atan2(-t[0],-t[2]); GOL.userData={dynamic:true, al, ar, k:0}; al.rotation.x=ar.rotation.x=-2.6; }
    // cột lửa ở đáy lõi
    const fire=(()=>{ const g=new THREE.ConeGeometry(1.1,1,8,1,true); g.translate(0,.5,0); const im=new THREE.InstancedMesh(g,new THREE.MeshBasicMaterial({color:0xffb23a, transparent:true, opacity:.8, depthWrite:false}),6); im.frustumCulled=false; im.userData.dynamic=true; gMid.add(im); return im; })();
    const FP=[[2,1002],[30,996],[14,976],[40,1016],[-4,982],[26,1024]]; let boom=0;
    const o={id:'volcano', name:'Lời Nguyền Hầm Mỏ Dung Nham', icon:'🌋', price:35, wait:'10', sub:'Xe goòng mỏ quanh núi lửa 55 m: hầm pha lê → đường ray đứt, TRƯỢT LÙI 1,5 vòng xoáy trong lòng núi → đáy lõi dung nham → phóng vọt qua miệng núi lửa', tr, rail:0x5a4632, spine:0x3a2d22, tie:0x2a211a, sup:0x6b4a2e, body:0x7a5230, body2:0x2b2b2b, col:0x8a3a1e, roof:0x5a2d1c, fg:'#ffd0a0', style:'mine',
      cfg:{lift:5, launchV:24, launchA:22, brakeV:7, stV:6}, cuspHold:[4.6,4.2], seatSide:()=>1, near:ALL, dwell:18, noSup:(p,i)=>IN[i], dark:co=>IN[seatIdx(co)], darkCol:0x1a0a05,
      top:(put,cx,mz,hw)=>{ put(kF,new THREE.ConeGeometry(2.2,3,8),paint(0x3a302c,.9),cx,10.4,mz); put(kF,new THREE.ConeGeometry(.9,1.2,8),M.bulb,cx,11.6,mz); },
      onCusp:(co,ci)=>{ const me_on=co.riding && ride.kind==='volcano'; if(ci===0){ GOL.userData.k=1; if(me_on){ ride.shake=1.2; noise(.4,1.4,300,60); tone(70,40,1.2,.2,'sawtooth'); toast('💥 Đường ray đứt gãy! Quái vật Đá Dung Nham đập xuống – tàu TRƯỢT LÙI vào bóng tối!', 4200); } }
        else { boom=4.2; if(me_on){ noise(.2,3.5,120,900); toast('🌋 Đáy lõi núi lửa… áp suất đang dồn lên… 3 · 2 · 1 – PHÓNG!', 4000); for(let i=0;i<3;i++) setTimeout(()=>tone(220+i*110,220+i*110,.14,.12,'square'),i*1000+900); } } },
      tick:(co,dt,riding)=>{ const t=performance.now()/1000, U=GOL.userData; lava.color.setRGB(1,.42+.12*Math.sin(t*2.1),.08+.05*Math.sin(t*3.3)); crysMat.color.setScalar(.75+.25*Math.sin(t*3));
        U.k=Math.max(0,U.k-dt*.22); const sw=U.k>0?Math.min(1,(1-U.k)*9):0, ang=U.k>0?lerp(-2.6,-.35,sw):lerp(U.al.rotation.x,-2.6,Math.min(1,dt*2)); U.al.rotation.x=U.ar.rotation.x=ang;
        boom=Math.max(0,boom-dt); FP.forEach(([x,z],i)=>{ const h=2.5+2*Math.abs(Math.sin(t*2+i*1.7))+(boom>0?16*Math.min(1,(4.2-boom)*.5):0); _mx.compose(_a.set(x,G0+.1,z),_qa.identity(),_b.set(1+h*.04,h,1+h*.04)); fire.setMatrixAt(i,_mx); }); fire.instanceMatrix.needsUpdate=true; if(riding && boom>0) ride.shake=Math.max(ride.shake||0,.5);
        const a=smoke.geometry.attributes.position; for(let i=0;i<SMK;i++){ const ph=(t*.06+i/SMK)%1, an=i*2.4; a.setXYZ(i,VC.x+Math.cos(an)*(3+ph*14)+ph*18,G0+50+ph*46,VC.z+Math.sin(an)*(3+ph*14)); } a.needsUpdate=true;
        if(riding && co.phase==='run'){ if(co.dir<0 && !co.bk){ co.bk=1; noise(.28,2.2,500,2600); } if(co.dir>0) co.bk=0; const kc=co.s-mk.crater; if(kc>-22 && kc<-18 && !co.cr){ co.cr=1; noise(.4,2.2,200,3000); toast('🌋 Vọt qua miệng núi lửa!', 2200); } if(kc>40) co.cr=0; } } };
    const sta=sideStation(o); Object.assign(o,{yP:sta.yP, inZone:sta.inZone, boardPt:sta.boardPt}); const co=coaster(o); co.gates=sta.gates; co.op=sta.op; lowFence(tr,G0+2.4,(i,p)=>sta.skip(p[0],p[2]) || IN[i] || mH(p[0],p[2])>0);
    INTER.push({x:sta.ip[0], z:sta.ip[1], r:3.6, prio:.95, when:()=>!ride.kind && Math.abs(P.y-sta.yP)<.9, label:'🌋 Lên xe goòng Hầm Mỏ Dung Nham – hàng ghế đầu (E)', action:()=>co.board(0)}); }

  /* ============================== 🔱 #6 ĐỀN THỜ ATLANTIS CHÌM ĐẮM ============================== */
  { const tr=TRA, mk=tr.marks, marble=M.paint(0xe8e2d0,.5,.05), teal=M.paint(0x1f7f8f,.4,.3), gold=M.paint(0xe8c040,.3,.8), Z0=1108, HX=(tr.P[Math.round(mk.hall)][0]+tr.P[Math.round(mk.hallEnd)][0])/2, IN=tr.P.map((p,i)=>i>mk.hall+1 && i<mk.hallEnd-1);
    // phế tích: 2 hàng cột cẩm thạch (vài cây đổ nghiêng)
    for(let i=0;i<9;i++){ const x=tr.P[Math.round(mk.ruins)][0]+1+i*2.6; for(const e of [-1,1]){ const tilt=(i*7+e*3)%5===0?.38*e:0, h=(i*5+e)%4===0?3.2:6.2; kF.add(cylM(.42,.5,h,12),marble,x,G0+h/2,Z0+e*3.6,0,tilt); kF.add(boxM(1.2,.3,1.2),marble,x,G0+.15,Z0+e*3.6); if(h>4 && !tilt) kF.add(boxM(1.25,.35,1.25),marble,x,G0+h+.17,Z0+e*3.6); circles.push({x,z:Z0+e*3.6,r:.6}); } }
    for(const e of [-1,1]) kF.add(boxM(13,.6,1.1),marble,tr.P[Math.round(mk.ruins)][0]+6.5,G0+6.7,Z0+e*3.6);
    // cổng xoáy nước: 6 vòng nước quay quanh ray
    const VOR=new THREE.Group(); VOR.userData.dynamic=true; gMid.add(VOR); { const mat=new THREE.MeshBasicMaterial({color:0x7fd8ff, transparent:true, opacity:.45, depthWrite:false, side:THREE.DoubleSide}); for(let j=0;j<6;j++){ const p=tr.P[Math.round(mk.vortex)+2+j*3], g=new THREE.TorusGeometry(3.3,.26,6,28,5.2), ms=new THREE.Mesh(g,mat); ms.position.set(p[0],p[1]+1.3,p[2]); ms.rotation.y=Math.PI/2; VOR.add(ms); } }
    // đại điện đáy biển: vòm ngoài (nhìn từ ngoài) + vỏ trong xanh thẳm (nhìn từ trong), cá voi + rùa "ảnh nổi" bơi trên đầu, 6 xúc tu Kraken
    { const door=(x,y,z)=>Math.abs(z)<3.5 && y<5.8 && Math.abs(x)>15.5; kF.add(cutGeo(new THREE.SphereGeometry(19.5,36,18,0,TAU,0,Math.PI/2),door),teal,HX,G0-.2,Z0);
      for(const th of [Math.PI/2+.19,Math.PI*1.5+.19]) kF.add(new THREE.CylinderGeometry(20.2,20.2,1.2,14,1,true,th,Math.PI-.38),marble,HX,G0+.6,Z0); kF.add(new THREE.SphereGeometry(1.6,14,10),gold,HX,G0+20.4,Z0);
      const g=cutGeo(S(18.6,36,24),(x,y,z)=>Math.abs(z)<3.5 && y<5.6 && y>-1.2 && Math.abs(x)>14.5), a=g.attributes.position, cl=new Float32Array(a.count*3); for(let i=0;i<a.count;i++){ const y=a.getY(i)/18.6, k=.25+.5*Math.max(0,y)+.12*Math.abs(Math.sin(a.getX(i)*.8+a.getZ(i)*.6)); cl[i*3]=.03*k; cl[i*3+1]=.28*k; cl[i*3+2]=.5*k; } g.setAttribute('color',new THREE.BufferAttribute(cl,3)); const ms=new THREE.Mesh(g,caveMat); ms.position.set(HX,G0,Z0); ms.userData.dynamic=true; gMid.add(ms);
      { const fl=new THREE.Mesh(flat(new THREE.CircleGeometry(18.4,32)),new THREE.MeshBasicMaterial({color:0x0b3550})); fl.position.set(HX,G0+.08,Z0); fl.userData.dynamic=true; gMid.add(fl); }
      for(const e of [-1,1]){ const x=HX+e*19.6, st=M.stoneLight; for(const sd of [-1,1]) kF.add(boxM(1,6,.9),st,x+e*.9,G0+2.8,Z0+sd*4.0); kF.add(boxM(1.2,1,9),st,x+e*.9,G0+6.2,Z0); }
      BLK.push([HX-22,HX+22,Z0-22,Z0+22]); const ring=[]; for(let i=0;i<=24;i++){ const an=i/24*TAU; ring.push([HX+Math.cos(an)*20.4,Z0+Math.sin(an)*20.4]); } fence(ring,{vis:false, r:.3, msg:'🔱 Đại điện Atlantis – vào bằng tàu lượn'}); }
    const holo=new THREE.MeshBasicMaterial({color:0x7ff0ff, transparent:true, opacity:.5, depthWrite:false}), SEA=new THREE.Group(); SEA.userData.dynamic=true; gMid.add(SEA); SEA.position.set(HX,G0+11,Z0);
    { const w=VG(); w.add(S(1),0xffffff,0,0,0,0,0,0,1.5,1.25,4.6).add(B(3.4,.16,1.2),0xffffff,0,0,-4.9).add(B(.2,.9,1.6),0xffffff,1.4,-.5,1.2,0,0,-.9).add(B(.2,.9,1.6),0xffffff,-1.4,-.5,1.2,0,0,.9); const wm=new THREE.Mesh(w.geo(),holo); wm.position.set(9,0,0); SEA.add(wm);
      const tu=VG(); tu.add(S(1),0xffffff,0,0,0,0,0,0,1.1,.42,1.4).add(S(.3,8,6),0xffffff,0,.05,1.6); for(const sx of [-1,1]) tu.add(B(1.3,.08,.5),0xffffff,sx*1.3,0,.5,0,sx*.5).add(B(.7,.08,.34),0xffffff,sx*.9,0,-1.1,0,sx*-.6); const tm=new THREE.Mesh(tu.geo(),holo); tm.position.set(-6,-3,2); SEA.add(tm); }
    const kra=(()=>{ const g=VG(), c=0x7a2f4f; let pr=[0,0,0]; for(let k=1;k<=9;k++){ const y=k*2.1, q=[Math.sin(k*.55)*2.2*(k/9),y,Math.cos(k*.4)*1.2*(k/9)]; g.limb(pr,q,1.25-k*.125,1.15-k*.125,c,7); if(k%2) g.add(S(.22,6,5),0xd98aa8,q[0]+.8-k*.07,y,q[2]); pr=q; } const im=new THREE.InstancedMesh(g.geo(),vcMat,6); im.frustumCulled=false; im.userData.dynamic=true; gMid.add(im); return im; })();
    const KP=[0,1,2,3,4,5].map(j=>({x:HX-11+j*4.6, z:Z0+(j%2?1:-1)*(6.2+(j%3)), ph:j*1.3, sx:j%2?-1:1}));
    // đền trên đỉnh: bệ bậc thang + hàng cột + mái
    { const cx=307, cz=1125; for(let k=0;k<4;k++){ const w=46-k*8; kL.add(boxM(w,3.2,w),marble,cx,G0+1.6+k*3.2,cz); } for(const sx of [-1,1]) for(let i=0;i<5;i++){ kL.add(cylM(.7,.8,14,12),marble,cx+sx*8,G0+12.8+7,cz-8+i*4); } kL.add(boxM(20,1.6,22),marble,cx,G0+27.6,cz); kL.add(boxM(22,1,24),teal,cx,G0+28.9,cz); kL.add(new THREE.SphereGeometry(1.2,12,8),gold,cx,G0+30.6,cz);
      BLK.push([cx-25,cx+25,cz-25,cz+25]); const q=[[cx-23.5,cz-23.5],[cx+23.5,cz-23.5],[cx+23.5,cz+23.5],[cx-23.5,cz+23.5],[cx-23.5,cz-23.5]]; fence(q,{vis:false, r:.3, msg:'🏛 Đền Atlantis – lên đỉnh bằng tàu lượn'}); }
    // sóng nước 2 bên khi tàu lao xuống hồ
    const NSP=80, spl=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(NSP*3),3)),new THREE.PointsMaterial({map:puffTex, color:0xf2fbff, size:3.6, transparent:true, opacity:0, depthWrite:false})); spl.frustumCulled=false; spl.userData.dynamic=true; gMid.add(spl); let splT=9; const SPX=tr.P[Math.round(mk.splash)];
    const prow=()=>{ const g=VG(); g.add(Co(.42,1.5,6),0xe8c040,0,.62,2.15,1.35).limb([0,.7,1.7],[0,.95,2.9],.06,.05,0xe8c040); for(const sx of [-1,0,1]) g.limb([sx*.22,.93,2.8],[sx*.3,1.02,3.35],.045,.02,0xe8c040); for(const sx of [-1,1]) g.add(B(.06,.3,1.5),0x1f7f8f,sx*.8,.72,.3,0,0,sx*-.4); return g.geo(); };
    const o={id:'atlantis', name:'Đền Thờ Atlantis Chìm Đắm', icon:'🔱', price:35, wait:'8', sub:'Chiến thuyền Hải Vương: phế tích → cổng xoáy nước → đại điện đáy biển, thuỷ quái Kraken → leo đỉnh đền 35 m → lao xuống hồ, sóng tung 2 bên', tr, rail:0xd8c27a, spine:0x2a7f8f, tie:0x1f5f6f, sup:0xe8e2d0, body:0x1f7f8f, body2:0xe8c040, col:0x1f6f8f, roof:0x1a5f7a, fg:'#d8fbff', head:prow,
      cfg:{lift:5, brakeV:9, brakeA:9, stV:5}, seatSide:()=>1, near:ALL, dwell:18, dark:co=>IN[seatIdx(co)], darkCol:0x042a40, noSup:q=>Math.abs(q[0]-307)<24 && Math.abs(q[2]-1125)<24,
      top:(put,cx,mz,hw)=>{ put(kF,boxM(hw*2+3,.5,1.6),marble,cx,9.3,mz); for(const e of [-1,0,1]) put(kF,new THREE.ConeGeometry(.22,2.2,6),gold,cx+e*.9,10.9+(e?0:.5),mz); put(kF,cylM(.1,.1,1.4,6),gold,cx,9.9,mz); },
      tick:(co,dt,riding)=>{ const t=performance.now()/1000; VOR.children.forEach((r,j)=>{ r.rotation.x=t*(1.6+j*.2)*(j%2?1:-1); }); SEA.rotation.y=t*.12; SEA.children[1].rotation.y=-t*.3;
        const kh=co.phase==='dock'?0:prog(co,'hall',2,10)*(1-prog(co,'hallEnd',-2,6)); KP.forEach((k,j)=>{ const sw=Math.sin(t*(1.1+kh*2.4)+k.ph)*(.22+.5*kh); _mx.compose(_a.set(k.x,G0-1,k.z),_qa.setFromEuler(_eu.set(sw*.8*k.sx,k.ph,sw,'YXZ')),_one); kra.setMatrixAt(j,_mx); }); kra.instanceMatrix.needsUpdate=true;
        if(riding && kh>.6){ ride.shake=Math.max(ride.shake||0,.35); if(!co.kr){ co.kr=1; noise(.3,1.8,200,80); toast('🐙 Thuỷ quái Kraken quật xúc tu!', 2400); } } if(kh<.05) co.kr=0;
        if(co.phase==='run'){ const ks=co.s-mk.splash; if(ks>-4 && ks<0 && splT>3){ splT=0; if(Math.hypot(P.x-SPX[0],P.z-SPX[2])<220) noise(.4,2,1500,300); if(riding) toast('🌊 Ùm! Sóng nước tung cao 12 m hai bên!', 2400); } }
        if(splT<3.2){ splT+=dt; const a=spl.geometry.attributes.position, t2=splT; for(let i=0;i<NSP;i++){ const e=i%2?1:-1, u=(i*.618)%1, w=(i*.371)%1, vy=9+7*u, vx=e*(2.5+5*w); a.setXYZ(i,SPX[0]+6-u*26-t2*4,Math.max(LAKES[0].wy,LAKES[0].wy+vy*t2-6.5*t2*t2),SPX[2]+vx*t2+e*1.2); } a.needsUpdate=true; spl.material.opacity=.85*(1-splT/3.2); } } };
    const sta=sideStation(o); Object.assign(o,{yP:sta.yP, inZone:sta.inZone, boardPt:sta.boardPt}); const co=coaster(o); co.gates=sta.gates; co.op=sta.op; lowFence(tr,G0+2.4,(i,p)=>sta.skip(p[0],p[2]) || IN[i] || hf(p[0],p[2])<G0-.3);
    INTER.push({x:sta.ip[0], z:sta.ip[1], r:3.6, prio:.95, when:()=>!ride.kind && Math.abs(P.y-sta.yP)<.9, label:'🔱 Lên chiến thuyền Atlantis – hàng ghế đầu (E)', action:()=>co.board(0)}); }

  /* ============================== KHU LỄ HỘI: 4 TRÒ KHÔNG RAY ============================== */
  const adiff=(t,a)=>{ let d=(t-a)%TAU; if(d>Math.PI) d-=TAU; if(d<-Math.PI) d+=TAU; return d; };
  // bãi tròn có rào: khe vào (nối hàng rào xếp hàng + cổng soát vé, hướng ain) và cổng ra một chiều (aout)
  function site(o){ const {x:X,z:Z,R}=o, a=o.ain, ca=Math.cos(a), sa=Math.sin(a), ry=Math.atan2(ca,sa), c=Math.cos(ry), s=Math.sin(ry), gw=1.25/R, ew=1.9/R, eo=o.aout; let run=[]; const runs=[];
    for(let i=0;i<=56;i++){ const t=i/56*TAU; if(Math.abs(adiff(t,a))<gw || Math.abs(adiff(t,eo))<ew){ if(run.length>1) runs.push(run); run=[]; continue; } run.push([X+Math.cos(t)*R,Z+Math.sin(t)*R]); } if(run.length>1) runs.push(run); for(const r of runs) fence(r,{h:1.2});
    exitGate([X+Math.cos(eo-ew)*R,Z+Math.sin(eo-ew)*R],[X+Math.cos(eo+ew)*R,Z+Math.sin(eo+ew)*R],(x,z)=>Math.hypot(x-X,z-Z)<R+.05,o.name);
    const gx=X+ca*(R+.9), gz=Z+sa*(R+.9), ox=gx-.8*c, oz=gz+.8*s, A=(lx,lz)=>[ox+lx*c+lz*s,oz-lx*s+lz*c]; entry({...o, x:ox, z:oz, ry});
    fence([[X+Math.cos(a+gw)*R,Z+Math.sin(a+gw)*R],A(0,0)],{vis:false}); fence([[X+Math.cos(a-gw)*R,Z+Math.sin(a-gw)*R],A(1.6,0)],{vis:false}); BLK.push([X-R-3,X+R+3,Z-R-3,Z+R+3]); return {ca, sa, ry}; }
  // lên / xuống ghế theo kịch bản (đi bộ → bước vào → khoá đai → chơi → bước ra). R cần: id,name,icon,price,yB, walk()→[x,z], seat() (đặt R.hip/R.f/R.u), canBoard(), begin(), camFn(chase)
  const FR={};
  function board(R){ FR[R.id]=R; R.seq=null; R.riding=false; R.hip=V3(); R.f=V3(0,0,1); R.u=V3(0,1,0); R.eye=V3(); const eyeFn=()=>({pos:R.eye, t:R.f, u:R.u, v:R.speed||0});
    R.tryBoard=()=>{ const c=R.canBoard(); if(c!==true) return toast(c,2600); const go=()=>{ start(R.id); R.seq={k:'walk', t:0}; }; if(!tix[R.id]) return pay(R.price,`🎟 Vé <b>${R.name}</b>`,()=>{ tix[R.id]=true; go(); }); go(); };
    R.finish=()=>{ if(!R.riding) return; R.riding=false; R.seat(); const w=R.walk(); R.seq={k:'out', t:0, to:V3(w[0],R.yB+hipH(),w[1])}; wind(0); };
    R.step=(dt)=>{ if(R.seq){ const q=R.seq; q.t+=dt; R.seat(); const w=R.walk();
        if(q.k==='walk'){ if(walkTo(w[0],w[1],R.yB,dt)){ q.k='in'; q.t=0; q.from=V3(w[0],R.yB+hipH(),w[1]); q.dur=Math.max(.6,q.from.distanceTo(R.hip)/3.2); } }
        else if(q.k==='in'){ const k=Math.min(1,q.t/q.dur); _a.copy(q.from).lerp(R.hip,k*k*(3-2*k)); _a.y+=Math.sin(k*Math.PI)*.18; sit(_a,R.f,R.u); if(k>=1){ q.k='lock'; q.t=0; tone(520,300,.25,.1,'square'); toast(R.lockMsg||'🔒 Thanh an toàn đã khoá – giữ chặt nhé!', 2400); } }
        else if(q.k==='lock'){ sit(R.hip,R.f,R.u); if(q.t>1.4){ R.seq=null; R.riding=true; ride.eye=eyeFn; R.begin(); } }
        else if(q.k==='out'){ const k=Math.min(1,q.t/.8); _a.copy(R.hip).lerp(q.to,k*k*(3-2*k)); _a.y+=Math.sin(k*Math.PI)*.18; sit(_a,R.f,R.u); if(k>=1){ R.seq=null; end(q.to.x,q.to.z,R.yB,P.face); tix[R.id]=false; toast(R.endMsg||`${R.icon} Hẹn gặp lại ở ${R.name}! Ra theo biển "LỐI RA".`, 3800); } }
        if(R.seq && R.seq.k!=='walk'){ R.camFn(chase); HOOK.camOverride=chase; } }
      if(R.riding){ R.seat(); sit(R.hip,R.f,R.u); R.camFn(chase); HOOK.camOverride=chase; if(!cam.fpv && !me.root.visible) me.root.visible=true; }
      R.eye.copy(R.hip).addScaledVector(R.u,.74).addScaledVector(R.f,.1); };
    INTER.push({x:R.ix, z:R.iz, r:R.ir||4, prio:.95, when:()=>!ride.kind && Math.hypot(P.x-R.x,P.z-R.z)<R.R, label:`${R.icon} Vào chỗ ngồi ${R.name} (E)`, action:R.tryBoard}); return R; }
  const SX=W.SHIFT ? W.SHIFT.dx : 0, SZ=W.SHIFT ? W.SHIFT.dz : 0;   // V2: công viên được dời gốc (worldshift.js) → ma trận thế giới trừ độ dời
  const nodePose=(R,node)=>{ node.updateWorldMatrix(true,false); const e=node.matrixWorld.elements; R.hip.set(e[12]-SX,e[13],e[14]-SZ); R.u.set(e[4],e[5],e[6]).normalize(); R.f.set(e[8],e[9],e[10]).normalize(); };
  const hub=[-160,975];

  /* ---------- 🏴‍☠️ #11 CON TÀU MA NGỌC TRAI ĐEN – xoay 360° ---------- */
  { const X=-120.4, Z=935.4, R={id:'pirate', name:'Con Tàu Ma Ngọc Trai Đen', icon:'🏴‍☠️', price:25, wait:'5', col:0x3a2a20, fg:'#f2e2b8', sub:'Chiến hạm hải tặc 22 m đu lên 30° → 60° → 90° rồi vượt đỉnh xoay trọn 2 vòng 360°', x:X, z:Z, R:17, ain:Math.atan2(hub[1]-Z,hub[0]-X)}; R.aout=R.ain-.42;
    const st=site(R), AY=G0+15.3, yD=AY-13.1, phi=Math.atan2(-st.sa,st.ca), wood=M.paint(0x5a3a26,.7), dk=M.paint(0x2a2622,.6,.4);
    // khung chữ A + hồ nước + cầu tàu
    for(const e of [-1,1]) for(const f of [-1,1]){ const top=[X+st.ca*e*4.2,AY,Z+st.sa*e*4.2], ft=[X+st.ca*e*5.4-st.sa*f*9.5,G0-.2,Z+st.sa*e*5.4+st.ca*f*9.5]; beam(kL,dk,ft,top,.55,.4,8); circles.push({x:ft[0],z:ft[2],r:.8}); } beam(kL,dk,[X-st.ca*4.6,AY,Z-st.sa*4.6],[X+st.ca*4.6,AY,Z+st.sa*4.6],.6,.6,10);
    { const wm=new THREE.Mesh(flat(new THREE.CircleGeometry(14.2,40)),M.water); wm.position.set(X,G0+.07,Z); wm.userData.dynamic=true; gFar.add(wm); kF.add(cylM(14.6,14.6,.34,40,true),M.stoneLight,X,G0+.17,Z);
      const n=11; for(let j=0;j<n;j++){ const r=R.R-1-(j+.5)*1.2, h=G0+(j+1)*(yD-G0)/n, x=X+st.ca*r, z=Z+st.sa*r; kF.add(boxM(2.6,.18,1.24),wood,x,h-.09,z,st.ry); kF.add(boxM(.2,h-G0,.2),wood,x,(h+G0)/2-.1,z,st.ry); addPlat(x,z,st.ry,1.3,.63,h); }
      addPlat(X+st.ca*2.2,Z+st.sa*2.2,st.ry,1.3,1.1,yD); kF.add(boxM(2.6,.18,2.2),wood,X+st.ca*2.2,yD-.09,Z+st.sa*2.2,st.ry);
      for(const e of [-1,1]) fence([[X+st.ca*14.6-st.sa*e*1.45,Z+st.sa*14.6+st.ca*e*1.45],[X+st.ca*1.2-st.sa*e*1.45,Z+st.sa*1.2+st.ca*e*1.45]],{h:1.0, y:G0+1.2, msg:'🌊 Hồ dưới thân tàu – đi theo cầu gỗ'});
      const kr=[]; for(let i=0;i<=44;i++){ const an=R.ain+.1+i/44*(TAU-.2); kr.push([X+Math.cos(an)*14.6,Z+Math.sin(an)*14.6]); } fence(kr,{vis:false, r:.2, msg:'🌊 Hồ dưới thân tàu – đi theo cầu gỗ'}); }
    // thân tàu (gốc = trục treo)
    const g=VG(), cH=0x33261f, cD=0x8a6a48, cG=0xd8b25a; g.add(new THREE.SphereGeometry(1,18,9,0,TAU,Math.PI/2,Math.PI/2),cH,0,-13.0,0,0,0,0,2.75,2.7,11).add(Cy(1,1,.14,18),cD,0,-13.1,0,0,0,0,2.6,1,10.5).add(Cy(1,1,.7,18,true),0x4a3327,0,-12.7,0,0,0,0,2.74,1,10.95);
    for(let i=0;i<9;i++){ const z=-8+i*2; if(Math.abs(z)<1.2) continue; g.add(B(4.4,.12,.5),0x6a4a30,0,-12.62,z).add(B(4.4,.5,.1),0x6a4a30,0,-12.3,z+(z<0?-.3:.3)); if(i>0) for(const sx of [-1.4,0,1.4]){ const sc=[0xd94f4f,0x3f8fd9,0x4fb86a,0xe0b23a][(i+Math.round(sx))&3]; g.add(B(.4,.5,.24),sc,sx,-12.3,z).add(S(.125,8,6),0xe8b894,sx,-11.9,z); } }
    for(const sz of [-5,5]){ g.limb([2.3,-12.6,sz],[1.2,-.2,0],.2,.2,0x23272e).limb([-2.3,-12.6,sz],[-1.2,-.2,0],.2,.2,0x23272e); } g.add(Cy(.9,.9,3,12),0x23272e,0,0,0,0,0,Math.PI/2);
    for(const sz of [-3.6,3.6]){ g.add(Cy(.15,.19,7.4,8),0x4a3327,0,-9.3,sz).add(B(3.8,.12,.12),0x4a3327,0,-7.2,sz).add(B(3.6,2.6,.05),0xd9d2bc,0,-8.6,sz+.08,.08).add(B(1.1,.7,.05),0x33261f,.9,-9.4,sz+.12,.08); }
    g.limb([0,-12.4,10.4],[0,-10.8,13.6],.16,.07,0x4a3327).add(S(.62,10,8),cG,0,-12.0,11.3).add(S(.16,6,5),0x111111,.24,-11.9,11.8).add(S(.16,6,5),0x111111,-.24,-11.9,11.8); for(const sx of [-1,1]) for(const z of [-5,-1.5,2,5.5]) g.add(Cy(.17,.21,1.2,8),0x1a1a1a,sx*2.8,-12.35,z,0,0,Math.PI/2);
    g.add(B(.5,.7,.5),cG,0,-11.9,-10.9).add(S(.3,8,6),0xfff2a0,0,-11.3,-10.9);
    const ship=new THREE.Group(); ship.rotation.order='YXZ'; ship.rotation.y=phi; ship.position.set(X,AY,Z); ship.userData.dynamic=true; const sm=new THREE.Mesh(g.geo(),vcMat); sm.castShadow=true; ship.add(sm); gMid.add(ship); const node=new THREE.Object3D(); node.position.set(0,-12.5,-8); ship.add(node);
    let st2='idle', t=18, th=0, w=0, A=0, ph=0, rev=0;
    Object.assign(R,{yB:yD, ix:X+st.ca*2.4, iz:Z+st.sa*2.4, ir:5, walk:()=>[X+st.ca*2.4,Z+st.sa*2.4], seat:()=>nodePose(R,node), canBoard:()=>st2==='idle'?true:'🏴‍☠️ Tàu đang đu – đợi lượt sau nhé!', begin:()=>{ st2='swing'; t=0; A=0; ph=0; toast('🏴‍☠️ Nhổ neo! Tàu đu cao dần rồi vượt đỉnh xoay 360°…', 3600); },
      camFn:c=>{ c.pos.set(X+st.ca*36,G0+15,Z+st.sa*36); c.look.set(X,AY-3,Z); c.k=5; }, lockMsg:'🔒 Thanh chắn hạ xuống – bám chặt mạn tàu!'}); board(R);
    EXTRA.push((dt)=>{ if(st2==='idle'){ th*=Math.max(0,1-dt*3); t-=dt; if(t<=0 && !R.seq && !(tix.pirate && Math.hypot(P.x-X,P.z-Z)<30 && t>-40)){ st2='swing'; t=0; A=0; ph=0; } }
      else if(st2==='swing'){ t+=dt; A=Math.min(2.95,A+dt*.045*(1+A)); ph+=dt*(1.25-A*.16); const pv=th; th=A*Math.sin(ph); w=(th-pv)/Math.max(dt,1e-3); if(A>=2.9 && pv<0 && th>=0){ st2='spin'; rev=0; w=Math.max(w,1.6); } }
      else if(st2==='spin'){ w+=(1.9-w)*Math.min(1,dt*.8); th+=w*dt; rev+=w*dt; if(rev>=TAU*2-.05){ st2='decay'; A=2.2; ph=0; th=0; } }
      else if(st2==='decay'){ A=Math.max(0,A-dt*.11*(1+A*.4)); ph+=dt*(1.25-A*.16); th=A*Math.sin(ph); if(A<.04){ st2='idle'; t=24; th=0; R.finish(); } }
      ship.rotation.x=th; R.step(dt); R.speed=Math.abs(w)*12; if(R.riding){ wind(Math.min(1,Math.abs(w)*.35)); if(Math.abs(Math.sin(th))<.08 && Math.abs(w)>1.4 && !R.wh){ R.wh=1; noise(.18,.7,400,1800); } if(Math.abs(Math.sin(th))>.5) R.wh=0; } }); }

  /* ---------- 🎠 #12 KHÚC NHẠC CUNG ĐÌNH – ngựa gỗ 2 tầng ---------- */
  { const X=-199.6, Z=935.4, R={id:'carousel', name:'Khúc Nhạc Cung Đình', icon:'🎠', price:15, wait:'3', col:0xb3261e, fg:'#ffe9a8', sub:'Đài quay hoàng gia 2 tầng: 36 ngựa gỗ phi lên xuống, mái vòm dát vàng', x:X, z:Z, R:13.5, ain:Math.atan2(hub[1]-Z,hub[0]-X)}; R.aout=R.ain+.5; site(R);
    const yD=G0+.55; kF.add(cylM(10.6,10.6,.3,40),M.stoneLight,X,G0+.15,Z); W.plats.push({t:'c', x:X, z:Z, r:10.6, h:G0+.3},{t:'c', x:X, z:Z, r:9.6, h:yD}); circles.push({x:X,z:Z,r:2.1});
    const g=VG(), cG=0xe0b23a, cR=0xb3261e, cC=0xf3ead7; g.add(Cy(9.6,9.6,.25,40),0x8a5a36,0,-.125,0).add(Cy(1.8,1.8,6.6,16),cC,0,3.3,0).add(Cy(1.9,1.9,.3,16),cG,0,.5,0).add(Cy(1.9,1.9,.3,16),cG,0,6.2,0).add(Cy(5.7,5.7,.22,32),0x8a5a36,0,3.3,0).add(new THREE.TorusGeometry(5.7,.07,6,40),cG,0,4.2,0,Math.PI/2);
    for(let i=0;i<8;i++){ const a=i/8*TAU; g.add(B(.9,1.6,.06),0xbfe0ff,Math.cos(a)*1.84,2.2,Math.sin(a)*1.84,0,-a+Math.PI/2); } for(let i=0;i<12;i++){ const a=i/12*TAU; g.add(Cy(.07,.07,7.2,6),cG,Math.cos(a)*9.2,3.6,Math.sin(a)*9.2); if(i%2) g.add(Cy(.05,.05,.9,6),cG,Math.cos(a)*5.7,3.8,Math.sin(a)*5.7); }
    for(let i=0;i<11;i++){ const a=1.2+i*.3; g.add(B(1.3,.1,.5),0x6a4a30,Math.cos(a)*2.6,.3+i*.28,Math.sin(a)*2.6,0,-a); }
    for(let i=0;i<24;i++){ const a0=i/24*TAU, a1=(i+1)/24*TAU, tri=new THREE.BufferGeometry(); tri.setAttribute('position',new THREE.Float32BufferAttribute([0,10.4,0, Math.cos(a1)*10.8,7.3,Math.sin(a1)*10.8, Math.cos(a0)*10.8,7.3,Math.sin(a0)*10.8],3)); tri.computeVertexNormals(); g.add(tri,i%2?cR:cC); g.add(S(.14,6,5),0xfff2a0,Math.cos(a0)*10.7,7.05,Math.sin(a0)*10.7); }
    g.add(Cy(10.8,10.8,.6,24,true),cG,0,7.0,0).add(S(.6,10,8),cG,0,10.7,0).add(Co(.2,1.4,6),cG,0,11.7,0);
    for(const a of [.9,4.0]){ g.add(S(1,10,8),a<2?0xe08a2a:0xf2f2f2,Math.cos(a)*6.8,.95,Math.sin(a)*6.8,0,0,0,1.25,.95,1.25).add(B(1.6,.12,.6),cR,Math.cos(a)*6.8,.6,Math.sin(a)*6.8,0,-a); }
    const car=new THREE.Group(); car.position.set(X,yD,Z); car.rotation.y=-R.ain; car.userData.dynamic=true; const cm=new THREE.Mesh(g.geo(),vcMat); cm.castShadow=true; car.add(cm); gMid.add(car);
    const hg=VG(); hg.add(S(1,10,8),0xffffff,0,1.05,0,0,0,0,.27,.3,.72).limb([0,1.2,.5],[0,1.7,.95],.16,.12,0xffffff).add(B(.16,.22,.46),0xffffff,0,1.78,1.16,.5).limb([0,1.15,-.66],[0,.7,-1.0],.06,.02,0x3a2a20).add(B(.36,.1,.5),0xb3261e,0,1.36,-.05);
    for(const sx of [-1,1]){ hg.limb([sx*.14,.9,.48],[sx*.14,.42,.7],.06,.045,0xffffff).limb([sx*.14,.9,-.48],[sx*.14,.4,-.62],.06,.045,0xffffff).add(Co(.03,.16,5),0xffffff,sx*.07,1.98,1.02); } hg.add(Cy(.03,.03,3.4,6),0xe0b23a,0,1.7,.5);
    const NH=36, HS=[], him=new THREE.InstancedMesh(hg.geo(),vcMat,NH), hc=new THREE.Color(); for(let i=0;i<NH;i++){ const up=i>=24, r=up?4.3:(i%2?7.7:6.0), a=up?(i-24)/12*TAU:(Math.floor(i/2)/12*TAU+(i%2?0:.13)); HS.push({r,a,y:up?3.4:0,ph:i*1.7}); him.setColorAt(i,hc.set([0xffffff,0xf0e0c8,0xd0d4dc,0xc8a078,0x4a4a52][i%5])); } him.frustumCulled=false; him.userData.dynamic=true; car.add(him);
    const node=new THREE.Object3D(); car.add(node); let st2='idle', t=14, w=0, tk=0;
    const placeH=(tt)=>{ HS.forEach((h,i)=>{ const y=h.y+.05+.2*(.5+.5*Math.sin(tt*2.2+h.ph))*(w/.5), x=Math.cos(h.a)*h.r, z=Math.sin(h.a)*h.r; _mx.compose(_a.set(x,y,z),_qa.setFromAxisAngle(UP,Math.atan2(Math.sin(h.a),-Math.cos(h.a))),_one); him.setMatrixAt(i,_mx); if(i===1){ node.position.set(x,y+1.27,z); node.quaternion.copy(_qa); } }); him.instanceMatrix.needsUpdate=true; }; placeH(0);
    Object.assign(R,{yB:yD, ix:X+Math.cos(R.ain)*8.6, iz:Z+Math.sin(R.ain)*8.6, ir:6, walk:()=>{ node.updateWorldMatrix(true,false); const e=node.matrixWorld.elements, ex=e[12]-SX, ez=e[14]-SZ, d=Math.hypot(ex-X,ez-Z); return [X+(ex-X)/d*(d+1.2),Z+(ez-Z)/d*(d+1.2)]; }, seat:()=>nodePose(R,node), canBoard:()=>st2==='idle'?true:'🎠 Đài quay đang chạy – đợi lượt sau nhé!',
      begin:()=>{ st2='run'; t=0; toast('🎠 Khúc nhạc cung đình vang lên – ngựa phi nhịp nhàng…', 3200); }, camFn:c=>{ c.pos.copy(R.hip).addScaledVector(_b.set(R.hip.x-X,0,R.hip.z-Z).normalize(),6.5).add(_a.set(0,2.2,0)); c.look.copy(R.hip); c.k=6; }, lockMsg:'🎠 Nắm chắc cột vàng nhé!'}); board(R);
    const NOTE=[523,659,784,659,587,698,880,698];
    EXTRA.push((dt,tt)=>{ if(st2==='idle'){ w=Math.max(0,w-dt*.25); t-=dt; if(w===0){ const d=-R.ain+Math.round((car.rotation.y+R.ain)/TAU)*TAU-car.rotation.y; if(Math.abs(d)>.004){ car.rotation.y+=Math.sign(d)*Math.min(Math.abs(d),dt*.45); placeH(tt); } else if(R.riding) R.finish(); }
        if(t<=0 && w===0 && !R.seq && !R.riding && !(tix.carousel && Math.hypot(P.x-X,P.z-Z)<26 && t>-40)){ st2='run'; t=0; } }
      else { t+=dt; w=Math.min(.5,w+dt*.12); if(t>62){ st2='idle'; t=20; } if(R.riding){ tk+=dt; if(tk>.42){ tk=0; tone(NOTE[Math.floor(t/.42)%8],NOTE[Math.floor(t/.42)%8],.3,.07,'triangle'); } } }
      car.rotation.y+=w*dt; if(w>0 || R.seq) placeH(tt); R.step(dt); R.speed=w*7.7; }); }

  /* ---------- 🌤 #17 VŨ ĐIỆU GIÓ TRỜI – đu quay dây văng 60 m ---------- */
  { const X=-120.4, Z=1014.6, R={id:'flyer', name:'Vũ Điệu Gió Trời', icon:'🌤', price:25, wait:'5', col:0x2f8fd0, fg:'#fff4c8', sub:'Đu quay dây văng: bàn xoay lên cao 56 m, 16 ghế treo xích 8 m văng nghiêng 45° giữa trời', x:X, z:Z, R:13, ain:Math.atan2(hub[1]-Z,hub[0]-X)}; R.aout=R.ain-.55; site(R);
    const yB=G0+.35, white=M.paint(0xf2f5f8,.4,.3), gold=M.paint(0xe8c040,.3,.8), sky=M.paint(0x2f8fd0,.45,.2); kL.add(cylM(.9,1.15,62,14),white,X,G0+31,Z); for(let y=8;y<60;y+=13) kL.add(cylM(.98,.98,2.2,14),sky,X,G0+y,Z); kL.add(new THREE.SphereGeometry(1.7,14,10),gold,X,G0+63.6,Z); for(let i=0;i<10;i++){ const a=i/10*TAU; kL.add(new THREE.ConeGeometry(.3,2.2,5),gold,X+Math.cos(a)*2.4,G0+63.6,Z+Math.sin(a)*2.4,0,0,0); }
    kF.add(cylM(2.3,2.5,1,16),sky,X,G0+.5,Z); circles.push({x:X,z:Z,r:2.6}); kF.add(uvXZ(new THREE.RingGeometry(6,10.6,40).rotateX(-Math.PI/2)),M.terrazzo,X,yB+.006,Z); kF.add(cylM(10.6,10.6,.35,40,true),M.stoneLight,X,G0+.175,Z); kF.add(cylM(6,6,.35,32,true),M.stoneLight,X,G0+.175,Z); W.plats.push({t:'ring', x:X, z:Z, r0:6, r1:10.6, h:yB});
    const NS=16, AR=8.2, CH=8, cg=VG(); cg.add(new THREE.TorusGeometry(2.6,.4,8,24),0x2f8fd0,0,0,0,Math.PI/2).add(Cy(2.2,2.2,.9,16),0xf2f5f8,0,0,0); for(let i=0;i<NS;i++){ const a=i/NS*TAU; cg.limb([Math.cos(a)*1.6,.2,Math.sin(a)*1.6],[Math.cos(a)*AR,0,Math.sin(a)*AR],.14,.09,i%2?0xe8c040:0xf2f5f8,6); cg.add(S(.2,6,5),0xfff2a0,Math.cos(a)*AR,0,Math.sin(a)*AR); }
    const car=new THREE.Mesh(cg.geo(),vcMat); car.userData.dynamic=true; car.castShadow=true; gMid.add(car);
    const sg=VG(); for(const sx of [-1,1]) sg.add(Cy(.02,.02,CH-.9,4),0x9aa0a8,sx*.38,-(CH-.9)/2,0); sg.add(B(.9,.1,.46),0x2a2e36,0,-CH+.1,0).add(B(.9,.7,.08),0x2f8fd0,0,-CH+.5,-.24).add(B(.9,.05,.05),0xe8c040,0,-CH+.5,.26);
    const sim=new THREE.InstancedMesh(sg.geo(),vcMat,NS); sim.frustumCulled=false; sim.userData.dynamic=true; gMid.add(sim);
    let st2='idle', t=16, cy=G0+CH+.9, w=0, be=0, phi=R.ain; const tip=V3(), rad=V3(), tan=V3(), dwn=V3();
    const place=(tt)=>{ car.position.set(X,cy,Z); car.rotation.y=-phi; for(let i=0;i<NS;i++){ const a=i/NS*TAU+phi, wv=st2==='fly'?1.2*Math.sin(a*2+tt*.8)*Math.min(1,w):0; rad.set(Math.cos(a),0,Math.sin(a)); tan.set(-Math.sin(a),0,Math.cos(a)); dwn.copy(rad).multiplyScalar(Math.sin(be)).addScaledVector(UP,-Math.cos(be)); tip.set(X+rad.x*AR,cy+wv*.0,Z+rad.z*AR);
        _b.copy(dwn).negate(); _a.crossVectors(_b,tan).normalize(); _mx.makeBasis(_a,_b,tan).setPosition(tip); sim.setMatrixAt(i,_mx); if(i===0){ R.hip.copy(tip).addScaledVector(dwn,CH-.22); R.u.copy(_b); R.f.copy(tan); } } sim.instanceMatrix.needsUpdate=true; };
    Object.assign(R,{yB, ix:X+Math.cos(R.ain)*8.4, iz:Z+Math.sin(R.ain)*8.4, ir:6, walk:()=>[X+Math.cos(phi)*(AR-1),Z+Math.sin(phi)*(AR-1)], seat:()=>{}, canBoard:()=>st2==='idle'?true:'🌤 Ghế đang bay trên cao – đợi lượt sau nhé!',
      begin:()=>{ st2='fly'; t=0; toast('🌤 Bàn xoay nâng lên 56 m – dang tay đón gió nào!', 3200); }, camFn:c=>{ c.pos.copy(R.hip).addScaledVector(R.f,-8).add(_a.set(0,3.2,0)); c.look.copy(R.hip).addScaledVector(R.f,4); c.k=7; }, lockMsg:'🔒 Thanh chắn ghế đã khoá – chân buông thõng giữa trời!'}); board(R); place(0);
    EXTRA.push((dt,tt)=>{ if(st2==='idle'){ t-=dt; if(t<=0 && !R.seq && !(tix.flyer && Math.hypot(P.x-X,P.z-Z)<26 && t>-40)){ st2='fly'; t=0; } }
      else { t+=dt; const up=clamp(t/22,0,1), dn=clamp((t-70)/22,0,1), k=up*up*(3-2*up)*(1-dn*dn*(3-2*dn)); cy=lerp(G0+CH+.9,G0+56,k)+(t>22 && t<70?1.4*Math.sin(tt*.6):0); w=1.25*k; if(t>=92){ st2='idle'; t=22; w=0; be=0; cy=G0+CH+.9; phi=R.ain+Math.round((phi-R.ain)/TAU)*TAU; place(tt); R.finish(); } }
      phi+=w*dt; be+=(Math.min(.8,Math.atan(w*w*(AR+CH*Math.sin(be))/9.81))-be)*Math.min(1,dt*2); R.speed=w*(AR+CH*Math.sin(be)); if(st2!=='idle' || R.seq) place(tt); R.step(dt); if(R.riding) wind(Math.min(1,w*.5)); }); }

  /* ---------- 🌀 #18 CON LẮC THẦN SẤM – đĩa bay 360° ---------- */
  { const X=-199.6, Z=1014.6, R={id:'frisbee', name:'Con Lắc Thần Sấm', icon:'🌀', price:25, wait:'5', col:0x6a3fb0, fg:'#f0e0ff', sub:'Đĩa 24 ghế vừa xoay 15 vòng/phút vừa bị cánh tay đòn 20 m quăng lắc lên góc 120°', x:X, z:Z, R:14, ain:Math.atan2(hub[1]-Z,hub[0]-X)}; R.aout=R.ain+.5;
    const st=site(R), AY=G0+24, yB=G0+.5, ARM=20.3, dk=M.paint(0x2b2440,.5,.4), phi=Math.atan2(-st.sa,st.ca);
    for(const e of [-1,1]) for(const f of [-1,1]){ const top=[X+st.ca*e*7,AY,Z+st.sa*e*7], ft=[X+st.ca*e*8.6-st.sa*f*9.6,G0-.2,Z+st.sa*e*8.6+st.ca*f*9.6]; beam(kL,dk,ft,top,.6,.42,8); circles.push({x:ft[0],z:ft[2],r:.85}); (R.legs||(R.legs=[])).push([ft,top]); } beam(kL,dk,[X-st.ca*7.4,AY,Z-st.sa*7.4],[X+st.ca*7.4,AY,Z+st.sa*7.4],.65,.65,10);
    kF.add(uvXZ(new THREE.RingGeometry(3.2,8.6,40).rotateX(-Math.PI/2)),M.terrazzo,X,yB+.006,Z); kF.add(cylM(8.6,8.6,.5,40,true),M.stoneLight,X,G0+.25,Z); W.plats.push({t:'ring', x:X, z:Z, r0:3.2, r1:8.6, h:yB});
    const ag=VG(); ag.limb([0,0,0],[0,-ARM+.4,0],.55,.42,0x6a3fb0,10).add(Cy(1.1,1.1,2.4,12),0x2b2440,0,0,0,0,0,Math.PI/2).add(B(1.6,2.2,1.6),0x2b2440,0,2.2,0);
    const arm=new THREE.Group(); arm.rotation.order='YXZ'; arm.rotation.y=phi; arm.position.set(X,AY,Z); arm.userData.dynamic=true; const am=new THREE.Mesh(ag.geo(),vcMat); am.castShadow=true; arm.add(am); gMid.add(arm);
    const dg=VG(), NS=24; dg.add(Cy(4.3,4.7,.55,24),0x6a3fb0,0,0,0).add(Cy(4.75,4.75,.2,24),0xe8c040,0,-.3,0).add(S(1.2,12,8),0xe8c040,0,.5,0);
    for(let i=0;i<NS;i++){ const a=i/NS*TAU, cx=Math.cos(a), sz=Math.sin(a), ry=Math.atan2(cx,sz); dg.limb([cx*4.4,-.3,sz*4.4],[cx*4.9,-1.0,sz*4.9],.09,.09,0x23272e,5).add(B(.56,.12,.5),0x23272e,cx*5.2,-2.6,sz*5.2,0,ry).add(B(.56,1.7,.12),0x23272e,cx*4.92,-1.8,sz*4.92,-.08,ry);
      if(i){ for(const e of [-1,1]) dg.add(B(.055,.62,.055),0x30343c,cx*5.18+Math.cos(a+Math.PI/2)*e*.2,-2.0,sz*5.18+Math.sin(a+Math.PI/2)*e*.2,.25,ry); dg.add(B(.44,.13,.11),0xf2c230,cx*5.34,-2.24,sz*5.34,0,ry); if(i%3!==1){ const s=[0xd94f4f,0x3f8fd9,0x4fb86a,0xe0b23a][i%4]; dg.add(B(.4,.52,.24),s,cx*5.1,-2.18,sz*5.1,0,ry).add(S(.125,8,6),0xe8b894,cx*5.1,-1.76,sz*5.1); } } }
    const disc=new THREE.Mesh(dg.geo(),vcMat); disc.position.set(0,-ARM,0); disc.castShadow=true; arm.add(disc); const node=new THREE.Object3D(); node.position.set(5.2,-2.48,0); node.rotation.y=Math.PI/2; disc.add(node);
    let st2='idle', t=20, A=0, ph=0, th=0, psi=0, ws=0, pv=0;
    Object.assign(R,{yB, ix:X+st.ca*6.6, iz:Z+st.sa*6.6, ir:5.5, walk:()=>[X+st.ca*6.6,Z+st.sa*6.6], seat:()=>nodePose(R,node), canBoard:()=>st2==='idle'?true:'🌀 Con lắc đang quăng – đợi lượt sau nhé!', begin:()=>{ st2='run'; t=0; A=0; ph=0; toast('🌀 Đĩa bắt đầu xoay… cánh tay đòn quăng cao dần tới 120°!', 3400); },
      camFn:c=>{ c.pos.set(X+st.ca*31,G0+11,Z+st.sa*31); c.look.set(X,G0+12,Z); c.k=5; }, lockMsg:'🔒 Khoá vai đã đóng – chân buông lơ lửng!'}); board(R);
    EXTRA.push((dt)=>{ if(st2==='idle'){ ws=Math.max(0,ws-dt*.5); th*=Math.max(0,1-dt*2); if(ws===0) psi+=(Math.round(psi/TAU)*TAU-psi)*Math.min(1,dt*3); t-=dt; if(t<=0 && ws===0 && !R.seq && !(tix.frisbee && Math.hypot(P.x-X,P.z-Z)<26 && t>-40)){ st2='run'; t=0; A=0; ph=0; } if(ws===0 && Math.abs(th)<.01 && R.riding) R.finish(); }
      else { t+=dt; ws=Math.min(1.57,ws+dt*.35); A=t<34?2.09*Math.min(1,t/30):t<52?2.09:Math.max(0,2.09*(1-(t-52)/22)); ph+=dt*1.05; pv=th; th=A*Math.sin(ph); if(t>74.5){ st2='idle'; t=24; } }
      psi+=ws*dt; arm.rotation.x=th; disc.rotation.y=psi; R.step(dt); R.speed=Math.abs(th-pv)/Math.max(dt,1e-3)*ARM; if(R.riding){ wind(Math.min(1,R.speed/26)); if(Math.abs(th)<.1 && R.speed>14 && !R.wh){ R.wh=1; noise(.2,.8,300,1600); } if(Math.abs(th)>.6) R.wh=0; } }); }

  const blocked=(x,z)=>mH(x,z)>0;
  return {blocked, flat:FR, burial, mH, tracks:{jura:TRJ, volcano:TRV, atlantis:TRA}};
}
