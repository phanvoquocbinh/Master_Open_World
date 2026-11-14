// QC World – ĐỒI BRAND QC: khu đô thị trên đồi (Đông Nam, đi tiếp phố chính Phường Khởi Nghiệp qua cầu z=86)
//  ⛰️ Đồi chính cao 32 m, đường xoắn ốc 2 làn bám sườn đồi (dốc ~11%) lên đỉnh · 🪜 cầu thang lớn từ phố ẩm thực thẳng lên đỉnh
//  🏛️ Đỉnh đồi: THÁP BRAND QC (js/monument.js) · 🏙️ chỗ dành sẵn: phố ẩm thực (chân đồi phía Bắc), chung cư (góc Đông Bắc),
//     biệt thự ven đầm (góc Tây Nam, đường ven biển x=286) – các module khác dựng trên các "pad" phẳng này
//  Địa hình = hàm độ cao lấy mẫu lưới 2 m (va chạm khớp hình vẽ), đường/cầu thang/pad được san phẳng theo đúng cao độ.
export function makeHills(W, ctx){
  const {THREE, scene, P, HOOK, PLACES, toast, clamp, lerp, circles, CITY, mergeGeometries, addPlat, WATER_Y, EXTL, GLOW, teleport} = W;
  const TR=ctx.transit;
  const R=(()=>{ let a=777123>>>0; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; })();
  const TAU=Math.PI*2, ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  const hash=(x,z)=>{ let h=Math.imul(x|0,374761393)^Math.imul(z|0,668265263); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967295; };
  const vn=(x,z)=>{ const xi=Math.floor(x), zi=Math.floor(z), xf=x-xi, zf=z-zi, u=xf*xf*(3-2*xf), v=zf*zf*(3-2*zf), a=hash(xi,zi), b=hash(xi+1,zi), c=hash(xi,zi+1), d=hash(xi+1,zi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  const fbm=(x,z,o=4)=>{ let s=0, a=.5, f=1; for(let i=0;i<o;i++){ s+=a*vn(x*f,z*f); f*=2.03; a*=.5; } return s; };

  /* ============================== QUY HOẠCH ============================== */
  const HZ={x0:276, x1:476, z0:66, z1:274};
  const HC={x:392, z:170}, PADR=24, TOPH=32, FLAT=1.7;
  const ST=(CITY.ward && CITY.ward.street) || 86;
  const FOOD={x0:289, x1:353, z0:91, z1:118};          // phố ẩm thực (S11): 2 dãy nhà + phố đi bộ giữa (z 100–108)
  const APT={x0:428, x1:472, z0:68, z1:100};           // chung cư (S11)
  const SHOW={x0:289, x1:337, z0:120, z1:152};         // toà showroom ô tô lớn (S10) – mặt tiền nhìn ra đường ven biển
  const LAG={x:306, z:254, rx:31, rz:13};              // đầm nước mặn nối biển (S12)
  const VILLA_Z=231, VILLAS=[286,302,318,334].map((x,i)=>({x, z:VILLA_Z, w:13, d:11, i}));   // 4 lô biệt thự ven đầm
  const LANE_Z=218, COAST_X=286;
  const hill=d=>TOPH*(1-ss(14,84,d));
  const rInv=h=>{ let a=14, b=84; for(let i=0;i<30;i++){ const m=(a+b)/2; if(hill(m)>h) a=m; else b=m; } return (a+b)/2; };

  /* ---------- đường: lối vào + đường xoắn ốc + đường ven biển + ngõ biệt thự (mẫu mỗi 1 m: x,z,h,w) ---------- */
  const PATHS=[]; const lampKit={pole:[], head:[]};
  function polyPath(pts, w, kind){ const out=[]; for(let i=0;i<pts.length-1;i++){ const [x0,z0,h0]=pts[i], [x1,z1,h1]=pts[i+1], L=Math.hypot(x1-x0,z1-z0); for(let t=0;t<L;t+=1){ const k=t/L; out.push({x:x0+(x1-x0)*k, z:z0+(z1-z0)*k, h:h0+(h1-h0)*k}); } }
    const e=pts[pts.length-1]; out.push({x:e[0], z:e[1], h:e[2]}); const p={pts:out, w, kind}; PATHS.push(p); return p; }
  const TH0=-Math.PI/2, DTH=5.1, spiral=[];
  { const N=520; for(let i=0;i<=N;i++){ const u=i/N, h=FLAT+(TOPH-FLAT)*u, r=Math.max(PADR+.5, rInv(h)), th=TH0+DTH*u; spiral.push([HC.x+Math.cos(th)*r, HC.z+Math.sin(th)*r, h]); } }
  const entry=[[262,ST,FLAT-.05],[276,ST,FLAT],[300,ST+1,FLAT],[340,ST+2.5,FLAT],[spiral[0][0]-14, spiral[0][1]-1.2, FLAT]];
  const MAIN=polyPath([...entry, ...spiral], 8, 'main');
  const COAST=polyPath([[COAST_X,ST+5,FLAT],[COAST_X,LANE_Z,FLAT],[352,LANE_Z,FLAT]], 7, 'lane');
  const roadPts=PATHS.flatMap(p=>p.pts.map(q=>({...q, w:p.w})));
  // cầu thang lớn: từ cuối phố ẩm thực lên mép sân đỉnh đồi
  const STH=4.12, SA={x:HC.x+Math.cos(STH)*rInv(FLAT+.4), z:HC.z+Math.sin(STH)*rInv(FLAT+.4), h:FLAT}, SB={x:HC.x+Math.cos(STH)*(PADR-.5), z:HC.z+Math.sin(STH)*(PADR-.5), h:TOPH};
  const STW=7;
  function stairAt(x,z){ const dx=SB.x-SA.x, dz=SB.z-SA.z, L2=dx*dx+dz*dz, t=((x-SA.x)*dx+(z-SA.z)*dz)/L2; if(t<-.02 || t>1.02) return null; const px=SA.x+dx*t, pz=SA.z+dz*t; return {d:Math.hypot(x-px,z-pz), h:lerp(SA.h,SB.h,clamp(t,0,1)), t}; }
  // tra cứu nhanh điểm đường gần nhất theo ô 8 m
  const GRID=new Map(), gk=(x,z)=>(Math.floor(x/8))+','+(Math.floor(z/8));
  roadPts.forEach((q,i)=>{ const k=gk(q.x,q.z); if(!GRID.has(k)) GRID.set(k,[]); GRID.get(k).push(i); });
  function nearRoad(x,z,maxD=22){ let bd=maxD*maxD, best=null; const cx=Math.floor(x/8), cz=Math.floor(z/8), rr=Math.ceil(maxD/8);
    for(let a=-rr;a<=rr;a++) for(let b=-rr;b<=rr;b++){ const l=GRID.get((cx+a)+','+(cz+b)); if(!l) continue; for(const i of l){ const q=roadPts[i], d=(q.x-x)**2+(q.z-z)**2; if(d<bd){ bd=d; best=q; } } }
    return best ? {d:Math.sqrt(bd), h:best.h, w:best.w} : null; }

  /* ============================== ĐỊA HÌNH ============================== */
  function landMask(x,z){ const u=x-HZ.x0, v=z-HZ.z0, Wd=HZ.x1-HZ.x0, Hd=HZ.z1-HZ.z0; let inset=9+fbm(x*.02,z*.02,3)*14;
    inset-= 9*Math.exp(-(((z-ST)/12)**2))*Math.exp(-((u/30)**2));   // lối vào cầu
    // đất liền chắc chắn: khu chung cư, phố ẩm thực, showroom, dải đường ven biển + khu biệt thự (đường không bao giờ chìm)
    if(rect(APT,x,z,12)>0 || rect(FOOD,x,z,10)>0 || rect(SHOW,x,z,10)>0 || rect({x0:276, x1:300, z0:ST, z1:LANE_Z+10},x,z,0)>0 || rect({x0:276, x1:360, z0:LANE_Z-8, z1:LAG.z-LAG.rz+2},x,z,0)>0) inset=Math.min(inset, 1.2);
    const base=Math.min(u, Wd-u, v, Hd-v)-inset; if(Math.abs(z-ST)<8.5 && u>-1 && u<40) return Math.max(base, 7);   // đất liền ngay chân cầu
    return base; }
  const rect=(r,x,z,pad)=>Math.min(x-r.x0, r.x1-x, z-r.z0, r.z1-z)+pad;   // >0 bên trong
  function hf(x,z){ const m=landMask(x,z); if(m<-14) return -6;
    const d=Math.hypot(x-HC.x, z-HC.z);
    let h=FLAT+.2+fbm(x*.03,z*.03,4)*2.4*ss(10,40,m);
    h=Math.max(h, hill(d)+(fbm(x*.05+7,z*.05-3,3)-.5)*6*ss(26,50,d)*(1-ss(70,84,d)));
    // pad phẳng
    const flat=(r,hh,b=6)=>{ const k=rect(r,x,z,0); if(k>-b) h=lerp(h, hh, ss(-b,0,k)); };
    flat(FOOD, FLAT, 7); flat(APT, FLAT, 6); flat(SHOW, FLAT, 7);
    for(const v of VILLAS) flat({x0:v.x-v.w/2-1, x1:v.x+v.w/2+1, z0:v.z-v.d/2-1, z1:v.z+v.d/2+2}, FLAT+.1, 5);
    // đầm nước
    const le=Math.hypot((x-LAG.x)/LAG.rx, (z-LAG.z)/LAG.rz); if(le<1.6){ const k=ss(.8,1.15,le); h=Math.min(h, lerp(-2.3, h, k)); if(le<1.12 && le>.9) h=Math.min(h, lerp(-.6, 1.0, ss(.92,1.1,le))); }
    // đường + cầu thang (san theo đúng cao độ, 2 bên taluy mềm)
    const r=nearRoad(x,z); if(r){ const half=r.w/2+.6; if(r.d<half) h=r.h; else if(r.d<half+11) h=lerp(r.h, h, ss(half, half+11, r.d)); }
    const s=stairAt(x,z); if(s){ const half=STW/2+.8; if(s.d<half) h=s.h; else if(s.d<half+9) h=lerp(s.h, h, ss(half, half+9, s.d)); }
    if(d<PADR+.5) h=TOPH; else if(d<PADR+7) h=lerp(TOPH, h, ss(PADR+.5, PADR+7, d));
    // bờ biển
    if(m<0) h=Math.min(h, lerp(-.4,-6,clamp(-m/14,0,1))); else if(m<6) h=lerp(.3, h, ss(0,6,m));
    return h; }
  const RES=2, NX=Math.round((HZ.x1-HZ.x0)/RES)+1, NZ=Math.round((HZ.z1-HZ.z0)/RES)+1, H=new Float32Array(NX*NZ);
  for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++) H[j*NX+i]=hf(HZ.x0+i*RES, HZ.z0+j*RES);
  const hAt=(x,z)=>{ const fx=(x-HZ.x0)/RES, fz=(z-HZ.z0)/RES; if(fx<0||fz<0||fx>=NX-1||fz>=NZ-1) return null; const i=Math.floor(fx), j=Math.floor(fz), tx=fx-i, tz=fz-j, a=H[j*NX+i], b=H[j*NX+i+1], c=H[(j+1)*NX+i], d=H[(j+1)*NX+i+1];
    return tx+tz<=1 ? a+(b-a)*tx+(c-a)*tz : d+(c-d)*(1-tx)+(b-d)*(1-tz); };
  EXTL.push({x0:HZ.x0, x1:HZ.x1-RES, z0:HZ.z0, z1:HZ.z1-RES, h:hAt, name:'ĐỒI BRAND QC · PHỐ NÚI'});
  { const pos=new Float32Array(NX*NZ*3), col=new Float32Array(NX*NZ*3), uv=new Float32Array(NX*NZ*2), c=new THREE.Color();
    const SAND=new THREE.Color(0xdcc89d), GRASS=new THREE.Color(0x5e9a3c), GRASS2=new THREE.Color(0x86b04c), DRY=new THREE.Color(0xa3a35a), ROCK=new THREE.Color(0x8c877c), PAVE=new THREE.Color(0xbdb6a6), MUD=new THREE.Color(0x7a6a4c);
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const k=j*NX+i, x=HZ.x0+i*RES, z=HZ.z0+j*RES, h=H[k]; pos[k*3]=x; pos[k*3+1]=h; pos[k*3+2]=z; uv[k*2]=x/5; uv[k*2+1]=z/5;
      const hx=(H[j*NX+Math.min(i+1,NX-1)]-H[j*NX+Math.max(i-1,0)])/(2*RES), hz=(H[Math.min(j+1,NZ-1)*NX+i]-H[Math.max(j-1,0)*NX+i])/(2*RES), slope=Math.hypot(hx,hz), n=fbm(x*.09,z*.09,2);
      c.copy(GRASS).lerp(GRASS2, n); c.lerp(DRY, ss(14,30,h)*.35); c.lerp(ROCK, ss(.55,1.1,slope)*.85);
      if(h<1.15) c.lerp(SAND, ss(1.15,.5,h)); if(h<-.3) c.lerp(MUD,.5);
      const fk=Math.max(rect(FOOD,x,z,0), rect(APT,x,z,0), rect(SHOW,x,z,0)); if(fk>-1) c.lerp(PAVE, ss(-1,1,fk)*.9);
      c.offsetHSL(0,0,(n-.5)*.06); col[k*3]=c.r; col[k*3+1]=c.g; col[k*3+2]=c.b; }
    const idx=new Uint32Array((NX-1)*(NZ-1)*6); let q=0; for(let j=0;j<NZ-1;j++) for(let i=0;i<NX-1;i++){ const a=j*NX+i, b=a+1, cc=a+NX, d=cc+1; idx[q++]=a; idx[q++]=cc; idx[q++]=b; idx[q++]=b; idx[q++]=cc; idx[q++]=d; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('color', new THREE.BufferAttribute(col,3)); g.setAttribute('uv', new THREE.BufferAttribute(uv,2)); g.setIndex(new THREE.BufferAttribute(idx,1)); g.computeVertexNormals(); g.computeBoundingSphere();
    const det=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=256; const x=cv.getContext('2d'); x.fillStyle='#c4c4c4'; x.fillRect(0,0,256,256); for(let i=0;i<9000;i++){ const v=150+R()*105|0; x.fillStyle=`rgba(${v},${v},${v},.5)`; x.fillRect(R()*256,R()*256,1+R()*3,1+R()*2); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const terr=new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors:true, map:det, roughness:.95})); terr.receiveShadow=true; terr.userData.dynamic=true; terr.userData.noFar=true; scene.add(terr); }

  /* ============================== 🏮 PHỐ NÚI (kiểu thành phố núi): chọn chỗ dựng nhà (js/mountaintown.js dựng) ============================== */
  //  • 'stilt': nhà sàn bám vách – sân thượng ngang mặt đường (quán café/quán ăn), các tầng dưới chồng xuống sườn dốc, đèn lồng
  //  • 'tower': tháp cao mọc từ chân dốc – cầu đi bộ từ mép đường vào tháp, thang máy lên sân thượng (quán bar/café ngắm cảnh)
  //  • 'slope': tháp chung cư đứng trên sườn đồi (bệ móng bám dốc) – tạo cảnh đô thị dày đặc nhiều tầng cao độ
  const TOWN=[], SLOPE=[];
  const freeAt=(x,z,pad)=>!(rect(FOOD,x,z,pad)>0 || rect(APT,x,z,pad)>0 || rect(SHOW,x,z,pad)>0 || VILLAS.some(v=>Math.abs(x-v.x)<v.w/2+pad+4 && Math.abs(z-v.z)<v.d/2+pad+6)
    || Math.hypot((x-LAG.x)/(LAG.rx+pad+4),(z-LAG.z)/(LAG.rz+pad+4))<1 || (()=>{ const s=stairAt(x,z); return !!(s && s.d<STW/2+pad+3); })() || Math.hypot(x-HC.x,z-HC.z)<PADR+8);
  const inTown=(x,z,pad=0)=>TOWN.some(t=>{ const dx=x-t.x, dz=z-t.z, a=Math.abs(dx*t.ux+dz*t.uz), b=dx*t.nx+dz*t.nz; return a<t.Wd/2+pad && b>-(t.D/2+t.gap+pad) && b<t.D/2+pad; }) || SLOPE.some(t=>Math.abs(x-t.x)<t.w/2+pad && Math.abs(z-t.z)<t.d/2+pad);
  { const pts=MAIN.pts; const i0=pts.findIndex(p=>p.h>FLAT+2.5); let last=-1e9, k=0, nTw=0, lastTw=-9;
    for(let i=Math.max(i0,4); i<pts.length-6; i++){ const p=pts[i]; if(p.h>TOPH-2.5) break; if(i-last<21) continue;
      const a=pts[i-3], b=pts[i+3], tl=Math.hypot(b.x-a.x,b.z-a.z)||1, ux=(b.x-a.x)/tl, uz=(b.z-a.z)/tl, gr=(b.h-a.h)/tl; let nx=-uz, nz=ux; if((p.x-HC.x)*nx+(p.z-HC.z)*nz<0){ nx=-nx; nz=-nz; }
      for(const type of (k%3===1?['tower','stilt']:['stilt','tower'])){ if(type==='tower' && (nTw>=4 || k-lastTw<3)) continue;
        const e=MAIN.w/2+.7, D=type==='tower'?12:8.5, Wd=type==='tower'?12:11, gap=type==='tower'?7:0, o=e+gap+D/2, cx=p.x+nx*o, cz=p.z+nz*o;
        let gmin=1e9, ok=true;
        for(let v=0; v<=1.0001 && ok; v+=.08) for(let u=-.5; u<=.5001; u+=.1){ const off=e+.5+(gap+D-.5)*v, half=(off<e+gap?1.8:Wd/2+.4), al=u*2*half, x=p.x+nx*off+ux*al, z=p.z+nz*off+uz*al, g=hAt(x,z);
          if(g===null || g>p.h+gr*al+.05+Math.abs(gr)*.6){ ok=false; break; } gmin=Math.min(gmin,g); const r=nearRoad(x,z,7); if(r && r.d<r.w/2+1.5 && Math.abs(r.h-(p.h+gr*al))>1.2){ ok=false; break; } }
        if(!ok || gmin<.9 || !freeAt(cx,cz,3) || inTown(cx,cz,6)) continue;
        const drop=p.h-gmin; if(type==='tower' && drop<9) continue; if(type==='stilt' && drop<2.4) continue;
        TOWN.push({type, i:k, x:cx, z:cz, h:p.h, gmin, yaw:Math.atan2(nx,nz), nx, nz, ux, uz, D, Wd, gap, e, rx:p.x, rz:p.z}); if(type==='tower'){ nTw++; lastTw=k; } last=i; k++; break; } }
    // tháp chung cư trên sườn dốc (xa đường ≥ 12 m)
    for(let n=0; n<4000 && SLOPE.length<16; n++){ const x=HZ.x0+14+R()*(HZ.x1-HZ.x0-28), z=HZ.z0+14+R()*(HZ.z1-HZ.z0-28), g=hAt(x,z), d=Math.hypot(x-HC.x,z-HC.z); if(g===null || g<2.5 || g>16 || d<44) continue;
      const w=9+R()*5, dd=9+R()*5; let gmin=1e9, gmax=-1e9; for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1],[0,0]]){ const h=hAt(x+sx*w/2,z+sz*dd/2); if(h===null){ gmin=-1; break; } gmin=Math.min(gmin,h); gmax=Math.max(gmax,h); }
      if(gmin<1.2 || gmax-gmin>12) continue; const r=nearRoad(x,z,22); if(r && r.d<Math.max(w,dd)/2+9) continue; if(!freeAt(x,z,8) || inTown(x,z,10)) continue;
      if(SLOPE.some(t=>Math.hypot(t.x-x,t.z-z)<(t.w+w)/2+9)) continue; const hgt=Math.min(22+R()*30, TOPH-4-gmin); if(hgt<14) continue; SLOPE.push({x, z, w, d:dd, gmin, gmax, hgt, i:SLOPE.length}); } }

  /* ============================== MẶT ĐƯỜNG (dải nhựa bám địa hình) ============================== */
  const asphalt=(()=>{ const cv=document.createElement('canvas'); cv.width=128; cv.height=256; const g=cv.getContext('2d'); g.fillStyle='#35373b'; g.fillRect(0,0,128,256);
    for(let i=0;i<3500;i++){ const v=30+R()*42|0; g.fillStyle=`rgba(${v},${v},${v+4},.6)`; g.fillRect(R()*128,R()*256,1.5,1.5); }
    g.fillStyle='#f2f1ea'; g.fillRect(6,0,5,256); g.fillRect(117,0,5,256); g.fillStyle='#f0c12a'; for(let y=0;y<256;y+=96) g.fillRect(61,y,6,52);
    const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; })();
  const laneTex=(()=>{ const cv=document.createElement('canvas'); cv.width=128; cv.height=128; const g=cv.getContext('2d'); g.fillStyle='#8f8a80'; g.fillRect(0,0,128,128); for(let y=0;y<128;y+=16) for(let x=(y/16%2)*8;x<128;x+=16){ const v=140+R()*35|0; g.fillStyle=`rgb(${v},${v-4},${v-10})`; g.fillRect(x+1,y+1,14,14); }
    const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const roadMat=new THREE.MeshStandardMaterial({map:asphalt, roughness:.9, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2});
  const laneMat=new THREE.MeshStandardMaterial({map:laneTex, roughness:.9, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2});
  function ribbon(pts, w, mat, vScale){ const pos=[], uv=[], idx=[]; let s=0;
    for(let i=0;i<pts.length;i++){ const a=pts[Math.max(0,i-1)], b=pts[Math.min(pts.length-1,i+1)], dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||1, nx=-dz/l, nz=dx/l, q=pts[i]; if(i) s+=Math.hypot(q.x-pts[i-1].x, q.z-pts[i-1].z);
      for(const side of [-1,1]){ const x=q.x+nx*w/2*side, z=q.z+nz*w/2*side, y=(hAt(x,z)??q.h)+.05; pos.push(x,y,z); uv.push(side<0?0:1, s/vScale); }
      if(i){ const k=i*2; idx.push(k-2,k-1,k, k-1,k+1,k); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals();
    const m=new THREE.Mesh(g, mat); m.receiveShadow=true; m.userData.dynamic=true; scene.add(m); return m; }
  ribbon(MAIN.pts.filter(p=>p.x>=262), 8, roadMat, 16);
  ribbon(COAST.pts, 7, laneMat, 6);
  // cầu thang lớn: bậc đá + lan can + đèn (cao độ theo đúng dốc thang → chân không lún quá nửa bậc)
  const stoneM=new THREE.MeshStandardMaterial({color:0xe2ddd2, roughness:.7}), railM=new THREE.MeshStandardMaterial({color:0xd8b25a, roughness:.35, metalness:.75});
  { const L=Math.hypot(SB.x-SA.x, SB.z-SA.z), rise=SB.h-SA.h, n=Math.round(rise/.2), run=L/n, yaw=Math.atan2(SB.x-SA.x, SB.z-SA.z), parts=[], rails=[];
    const m=new THREE.Matrix4(), q=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0));
    for(let i=0;i<n;i++){ const t=(i+.5)/n, x=lerp(SA.x,SB.x,t), z=lerp(SA.z,SB.z,t), y=SA.h+rise*(i+1)/n; const g=new THREE.BoxGeometry(STW,.2,run+.02); m.compose(new THREE.Vector3(x,y-.1,z), q, new THREE.Vector3(1,1,1)); g.applyMatrix4(m); parts.push(g);
      const g2=new THREE.BoxGeometry(STW+.6,1.0,run+.02); m.compose(new THREE.Vector3(x,y-.7,z), q, new THREE.Vector3(1,1,1)); g2.applyMatrix4(m); parts.push(g2);
      addPlat(x, z, yaw, STW/2, run/2+.01, y); }   // mặt từng bậc → chân đặt đúng mặt bậc
    const st=new THREE.Mesh(mergeGeometries(parts.map(g=>g.toNonIndexed())), stoneM); st.castShadow=true; st.receiveShadow=true; scene.add(st);
    const nx=Math.cos(yaw), nz=-Math.sin(yaw);
    for(const side of [-1,1]){ const ox=nx*(STW/2+.1)*side, oz=nz*(STW/2+.1)*side;
      for(let i=0;i<=n;i+=8){ const t=i/n, x=lerp(SA.x,SB.x,t)+ox, z=lerp(SA.z,SB.z,t)+oz, y=lerp(SA.h,SB.h,t); const g=new THREE.CylinderGeometry(.06,.06,1.0,8); g.translate(x,y+.5,z); rails.push(g.toNonIndexed());
        circles.push({x, z, r:.16, y0:y-1, y1:y+1.2}); }
      const top=new THREE.CylinderGeometry(.05,.05,L,8); top.rotateX(Math.PI/2); const tilt=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.atan2(rise,L),yaw,0,'YXZ')); top.applyMatrix4(tilt); top.translate((SA.x+SB.x)/2+ox, (SA.h+SB.h)/2+1.0, (SA.z+SB.z)/2+oz); rails.push(top.toNonIndexed());
      for(let t=.12;t<.95;t+=.2){ const x=lerp(SA.x,SB.x,t)+ox*1.25, z=lerp(SA.z,SB.z,t)+oz*1.25, y=lerp(SA.h,SB.h,t); lamp(x,z,y); } }
    const rm=new THREE.Mesh(mergeGeometries(rails), railM); rm.castShadow=true; scene.add(rm);
    // lan can 2 bên = vật cản chạy dọc thang (không bước hụt ra ngoài)
    for(const side of [-1,1]) for(let i=0;i<=n;i++){ const t=i/n, x=lerp(SA.x,SB.x,t)+nx*(STW/2+.15)*side, z=lerp(SA.z,SB.z,t)+nz*(STW/2+.15)*side, y=lerp(SA.h,SB.h,t); if(i%2===0) circles.push({x, z, r:.14, y0:y-1.2, y1:y+1.4}); } }

  /* ---------- đèn đường (đặt đúng cao độ) ---------- */
  function lamp(x,z,y0){ const y=y0??(hAt(x,z)??0); const k=lampKit; const g1=new THREE.CylinderGeometry(.07,.1,4.2,8); g1.translate(x,y+2.1,z); k.pole.push(g1.toNonIndexed()); const g2=new THREE.SphereGeometry(.26,12,8); g2.translate(x,y+4.35,z); k.head.push(g2.toNonIndexed()); circles.push({x,z,r:.14}); GLOW && GLOW.add(x,y+4.35,z,2.8,0xffd9a0,1); }
  for(const p of PATHS){ const pts=p.pts; for(let i=10;i<pts.length-4;i+=22){ const a=pts[i-1], b=pts[i+1], dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||1, nx=-dz/l, nz=dx/l, side=(Math.floor(i/22)%2)?1:-1, off=p.w/2+.9; const x=pts[i].x+nx*off*side, z=pts[i].z+nz*off*side; if(x<278 || inTown(x,z,1.2)) continue; lamp(x,z); } }
  { const pm=new THREE.Mesh(mergeGeometries(lampKit.pole), new THREE.MeshStandardMaterial({color:0x2c3036, roughness:.5, metalness:.6})); pm.castShadow=true; scene.add(pm);
    const hm=new THREE.Mesh(mergeGeometries(lampKit.head), new THREE.MeshStandardMaterial({color:0xfff2d6, emissive:0xffd9a0, emissiveIntensity:.2})); scene.add(hm); HOOK.onFrame.push(()=>{ hm.material.emissiveIntensity=.15+(W.night||0)*2.2; }); }

  /* ---------- cầu nối Phường → khu đồi ---------- */
  { const x0=262, x1=278.5, L=x1-x0, xm=(x0+x1)/2, g=new THREE.Group(); scene.add(g);
    // cầu dốc thoai thoải: mặt Phường (0,1 m) → mặt đồi (1,7 m), mỗi đoạn 1,5 m cao thêm ~0,15 m (đi bộ / xe đều lên êm)
    const yA=.12, yB=FLAT-.02, tilt=Math.atan2(yB-yA, L);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(L+.6,.5,11), new THREE.MeshStandardMaterial({color:0x9aa1a8, roughness:.8})); deck.position.set(xm,(yA+yB)/2-.28,ST); deck.rotation.z=tilt; g.add(deck);
    const as=new THREE.Mesh(new THREE.BoxGeometry(L+.6,.04,8), roadMat); as.position.set(xm,(yA+yB)/2-.01,ST); as.rotation.z=tilt; g.add(as);
    for(const s of [-1,1]){ const rail=new THREE.Mesh(new THREE.BoxGeometry(L,.08,.08), railM); rail.position.set(xm,(yA+yB)/2+.95,ST+s*5.3); rail.rotation.z=tilt; g.add(rail); W.boxes.push({x0, x1, z0:ST+s*5.3-.12, z1:ST+s*5.3+.12}); }
    const NS=11; for(let i=0;i<NS;i++){ const t0=i/NS, t1=(i+1)/NS, xc=x0+(t0+t1)/2*L; addPlat(xc, ST, 0, L/NS/2+.02, 5.4, yA+(yB-yA)*(t1)); }
    // cắt lan can bờ Đông Phường chỗ chân cầu
    for(const o of scene.children.slice()){ if(!o.isMesh || !o.geometry || !o.geometry.parameters) continue; const pr=o.geometry.parameters;
      if(Math.abs(o.position.x-263)<.3 && pr.width<.12 && pr.depth>30 && Math.abs(o.rotation.y)<1e-3){ const za=o.position.z-pr.depth/2, zb=o.position.z+pr.depth/2; scene.remove(o);
        for(const [a,b] of [[za,ST-5.8],[ST+5.8,zb]]){ if(b-a<.3) continue; const m2=new THREE.Mesh(new THREE.BoxGeometry(pr.width,pr.height,b-a), o.material); m2.position.set(o.position.x,o.position.y,(a+b)/2); scene.add(m2); } } } }

  /* ============================== 🌳 CÂY XANH TRÊN ĐỒI ============================== */
  { const trunkG=new THREE.CylinderGeometry(.16,.24,3.2,7); trunkG.translate(0,1.6,0); const crownG=new THREE.IcosahedronGeometry(1.9,1); crownG.scale(1,1.15,1); crownG.translate(0,4.3,0);
    const pineG=new THREE.ConeGeometry(1.5,5.2,8); pineG.translate(0,4.6,0);
    const spots=[]; for(let k=0;k<2600 && spots.length<340;k++){ const x=HZ.x0+8+R()*(HZ.x1-HZ.x0-16), z=HZ.z0+8+R()*(HZ.z1-HZ.z0-16), h=hAt(x,z); if(h===null || h<1.3) continue;
      const d=Math.hypot(x-HC.x,z-HC.z); if(d<PADR+9) continue; const r=nearRoad(x,z,12); if(r && r.d<r.w/2+3.5) continue; const s=stairAt(x,z); if(s && s.d<STW/2+3) continue;
      if(rect(FOOD,x,z,9)>0 || rect(APT,x,z,8)>0 || rect(SHOW,x,z,8)>0 || VILLAS.some(v=>Math.abs(x-v.x)<v.w/2+5 && Math.abs(z-v.z)<v.d/2+8) || Math.hypot((x-LAG.x)/(LAG.rx+5),(z-LAG.z)/(LAG.rz+5))<1) continue;
      if(inTown(x,z,3)) continue;
      if(spots.some(p=>Math.hypot(p.x-x,p.z-z)<4.2)) continue; spots.push({x,z,h,s:.8+R()*.6, pine:h>12 && R()<.55}); }
    const mk=(geo,mat,list)=>{ const im=new THREE.InstancedMesh(geo,mat,list.length), m=new THREE.Matrix4(); list.forEach((p,i)=>{ m.makeRotationY(R()*TAU); m.scale(new THREE.Vector3(p.s,p.s,p.s)); m.setPosition(p.x,p.h-.1,p.z); im.setMatrixAt(i,m); }); im.castShadow=true; im.receiveShadow=true; im.userData.dynamic=true; im.computeBoundingSphere(); scene.add(im); };
    const broad=spots.filter(p=>!p.pine), pines=spots.filter(p=>p.pine);
    mk(trunkG, new THREE.MeshStandardMaterial({color:0x6b4a2e, roughness:.95}), spots);
    mk(crownG, new THREE.MeshStandardMaterial({color:0x4f8a35, roughness:.9}), broad); mk(pineG, new THREE.MeshStandardMaterial({color:0x2f5e2c, roughness:.9}), pines);
    for(const p of spots) circles.push({x:p.x, z:p.z, r:.32*p.s}); }

  /* ============================== 🚕 nối đồ thị đường (taxi, xe bot đi lên đồi) ============================== */
  if(TR && TR.G){ const G=TR.G; const node=(x,z)=>{ G.nodes.push({x,z,adj:[]}); return G.nodes.length-1; }; const link=(a,b)=>{ const d=Math.hypot(G.nodes[a].x-G.nodes[b].x, G.nodes[a].z-G.nodes[b].z); G.nodes[a].adj.push([b,d]); G.nodes[b].adj.push([a,d]); G.edges.push([a,b]); };
    let start=G.nodes.findIndex(n=>Math.abs(n.x-262)<1 && Math.abs(n.z-ST)<1); if(start<0){ start=node(262,ST); }
    let prev=start; const pts=MAIN.pts, junction={}; for(let i=14;i<pts.length;i+=14){ const n=node(pts[i].x, pts[i].z); link(prev,n); prev=n; if(!junction.coast && Math.abs(pts[i].x-COAST_X)<8) junction.coast=n; }
    if(junction.coast){ let pv=junction.coast; for(let i=14;i<COAST.pts.length;i+=14){ const n=node(COAST.pts[i].x, COAST.pts[i].z); link(pv,n); pv=n; } } }

  /* ---------- địa điểm ---------- */
  PLACES.push({icon:'⛰️', name:'Đồi Brand QC', sub:'Khu đô thị trên đồi · đường xoắn ốc · cầu thang lớn lên tháp Brand QC (qua cầu cuối phố Phường)', go:()=>teleport(300, ST+1, 340, ST+2)});
  W.hillsInfo={HC, PADR, TOPH, FLAT, FOOD, APT, SHOW, LAG, VILLAS, LANE_Z, COAST_X, SA, SB, STW, hAt, MAIN, COAST, rect, TOWN, SLOPE, nearRoad, HZ};
  return W.hillsInfo;
}
