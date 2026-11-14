// QC World – S6: CAO NGUYÊN BÌNH PHAN (phía Bắc Downtown, nối bằng cầu nối dài phố x=178)
//  ⛰️ Dãy núi đá (đỉnh ~70 m) bao phía Bắc/Đông/Tây · 🌊 sông chảy từ núi, qua THÁC NƯỚC cao ~24 m, xuyên phố cổ rồi ra biển
//  🌲 Rừng ~2.000 cây (2 InstancedMesh) · 🏮 PHỐ CỔ RIVERSIDE: nhà nhiều màu kiểu Hội An hai bên sông, đèn lồng giăng phố
//     (quầng sáng ban đêm), 2 cầu gỗ qua sông, chợ đêm, người dạo phố · 🛕 Chòi ngắm cảnh trên đỉnh núi
// Địa hình: hàm độ cao (nhiễu cố định) lấy mẫu sẵn thành lưới 2 m → lưới vẽ và mặt đất va chạm khớp nhau tuyệt đối.
export function makeHighland(W, ctx){
  const {S, save, transit} = ctx;
  const {THREE, scene, MAT, P, HOOK, INTER, PLACES, toast, clamp, lerp, circles, boxes, CITY, mergeGeometries, addPlat, lampPost, WATER_Y, EXTL, GLOW} = W;
  const R=(()=>{ let a=20261114>>>0; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; })();   // mulberry32 có seed → mỗi lần mở giống nhau
  const TAU=Math.PI*2, ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };

  /* ============================== NHIỄU ============================== */
  const hash=(x,z)=>{ let h=Math.imul(x|0,374761393)^Math.imul(z|0,668265263); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967295; };
  const vn=(x,z)=>{ const xi=Math.floor(x), zi=Math.floor(z), xf=x-xi, zf=z-zi, u=xf*xf*(3-2*xf), v=zf*zf*(3-2*zf), a=hash(xi,zi), b=hash(xi+1,zi), c=hash(xi,zi+1), d=hash(xi+1,zi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  const fbm=(x,z,o=5)=>{ let s=0, a=.5, f=1; for(let i=0;i<o;i++){ s+=a*vn(x*f,z*f); f*=2.03; a*=.5; } return s; };
  const ridged=(x,z,o=5)=>{ let s=0, a=.5, f=1, w=1; for(let i=0;i<o;i++){ let n=1-Math.abs(vn(x*f,z*f)*2-1); n*=n; n*=w; w=clamp(n*1.7,0,1); s+=a*n; f*=2.07; a*=.5; } return s; };

  /* ============================== ĐỊA HÌNH ============================== */
  const NL={x0:88, x1:332, z0:-342, z1:-100};
  const TOWN={x0:150, x1:256, z0:-182, z1:-108};
  const RIV=[[231,-326,60],[223,-296,52],[216,-266,44],[214,-257,20],[206,-230,13],[197,-202,7.5],[191,-176,3.4],[190,-150,1.45],[190,-124,1.05],[190,-96,-.7]];
  const RS=[];   // mẫu sông mỗi 1 m: {x,z,h,w,s}
  { let s=0; for(let i=0;i<RIV.length-1;i++){ const [x0,z0,h0]=RIV[i], [x1,z1,h1]=RIV[i+1], L=Math.hypot(x1-x0,z1-z0); for(let t=0;t<L;t+=1){ const k=t/L; RS.push({x:x0+(x1-x0)*k, z:z0+(z1-z0)*k, h:h0+(h1-h0)*k, w:lerp(6,11,clamp((s+t)/300,0,1)), s:s+t}); } s+=L; } RS.push({x:RIV[RIV.length-1][0], z:RIV[RIV.length-1][1], h:RIV[RIV.length-1][2], w:11, s}); }
  function riverAt(x,z){ let bd=1e9, bi=-1; for(let i=0;i<RS.length;i+=2){ const r=RS[i], d=(r.x-x)**2+(r.z-z)**2; if(d<bd){ bd=d; bi=i; } } if(bd>40*40) return null;
    for(let i=Math.max(0,bi-2);i<=Math.min(RS.length-1,bi+2);i++){ const r=RS[i], d=(r.x-x)**2+(r.z-z)**2; if(d<bd){ bd=d; bi=i; } } const r=RS[bi]; return {d:Math.sqrt(bd), h:r.h, w:r.w}; }
  function landMask(x,z){ const u=x-NL.x0, v=NL.z1-z, Wd=NL.x1-NL.x0, Hd=NL.z1-NL.z0; let inset=12+fbm(x*.018,z*.018,3)*18; if(v<40) inset-=11*Math.exp(-(((x-182)/26)**2)); return Math.min(u, Wd-u, v, Hd-v)-inset; }
  function hf(x,z){ const m=landMask(x,z); if(m<-16) return -6.5; const u=x-NL.x0, v=NL.z1-z;
    let h=.9+Math.max(0,v-70)*.035+fbm(x*.03,z*.03,4)*2.4;
    const mN=ss(85,185,v), mE=ss(165,238,u)*.85*ss(25,150,v), mW=ss(62,4,u)*.75*ss(40,170,v), mt=Math.max(mN,mE,mW);
    h+=ridged(x*.0115+3.1, z*.0115-1.7, 5)*84*mt + fbm(x*.05,z*.05,3)*7*mt;
    const tw=ss(0,10,Math.min(x-TOWN.x0, TOWN.x1-x, z-TOWN.z0, TOWN.z1-z)); h=lerp(h, 1.3, tw*.97);
    const r=riverAt(x,z); if(r){ const k=ss(r.w*.5, r.w*.5+7, r.d); h=lerp(r.h-1.15, Math.max(h, r.h+.35), k); }
    if(m<0) h=Math.min(h, lerp(-.5,-6.5,clamp(-m/16,0,1))); else if(m<7) h=lerp(.25, h, ss(0,7,m));
    return h; }
  const RES=2, NX=Math.round((NL.x1-NL.x0)/RES)+1, NZ=Math.round((NL.z1-NL.z0)/RES)+1, H=new Float32Array(NX*NZ);
  for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++) H[j*NX+i]=hf(NL.x0+i*RES, NL.z0+j*RES);
  const hAt=(x,z)=>{ const fx=(x-NL.x0)/RES, fz=(z-NL.z0)/RES; if(fx<0||fz<0||fx>=NX-1||fz>=NZ-1) return null; const i=Math.floor(fx), j=Math.floor(fz), tx=fx-i, tz=fz-j, a=H[j*NX+i], b=H[j*NX+i+1], c=H[(j+1)*NX+i], d=H[(j+1)*NX+i+1];
    return tx+tz<=1 ? a+(b-a)*tx+(c-a)*tz : d+(c-d)*(1-tx)+(b-d)*(1-tz); };   // nội suy đúng theo 2 tam giác của lưới vẽ
  EXTL.push({x0:NL.x0, x1:NL.x1-RES, z0:NL.z0, z1:NL.z1-RES, h:hAt});
  // lưới vẽ: màu theo độ cao / độ dốc / gần sông / bờ biển
  { const pos=new Float32Array(NX*NZ*3), col=new Float32Array(NX*NZ*3), uv=new Float32Array(NX*NZ*2), c=new THREE.Color();
    const SAND=new THREE.Color(0xd9c79c), GRASS=new THREE.Color(0x5f9b3f), GRASS2=new THREE.Color(0x7aa848), FOREST=new THREE.Color(0x3d6f33), ROCK=new THREE.Color(0x8a857c), ROCK2=new THREE.Color(0x6e6a63), MUD=new THREE.Color(0x76664a), TOWNC=new THREE.Color(0xb9ad94);
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const k=j*NX+i, x=NL.x0+i*RES, z=NL.z0+j*RES, h=H[k]; pos[k*3]=x; pos[k*3+1]=h; pos[k*3+2]=z; uv[k*2]=x/6; uv[k*2+1]=z/6;
      const hx=(H[j*NX+Math.min(i+1,NX-1)]-H[j*NX+Math.max(i-1,0)])/(2*RES), hz=(H[Math.min(j+1,NZ-1)*NX+i]-H[Math.max(j-1,0)*NX+i])/(2*RES), slope=Math.hypot(hx,hz), n=fbm(x*.08,z*.08,2);
      if(h<1.0) c.copy(SAND).lerp(MUD, clamp((h-.2)*1.5,0,1)*.0);
      else { c.copy(GRASS).lerp(GRASS2, n); c.lerp(FOREST, ss(4,18,h)*.65); c.lerp(ROCK, ss(.55,1.0,slope)); c.lerp(ROCK2, ss(42,70,h)*.8); }
      const tw=ss(0,6,Math.min(x-TOWN.x0, TOWN.x1-x, z-TOWN.z0, TOWN.z1-z)); if(tw>0) c.lerp(TOWNC, tw*.85);
      const r=riverAt(x,z); if(r && r.d<r.w*.5+5) c.lerp(MUD, ss(r.w*.5+5, r.w*.5, r.d)*.7);
      if(h<.9 && h>-1) c.lerp(SAND, .8);
      c.offsetHSL(0,0,(n-.5)*.05); col[k*3]=c.r; col[k*3+1]=c.g; col[k*3+2]=c.b; }
    const idx=new Uint32Array((NX-1)*(NZ-1)*6); let q=0; for(let j=0;j<NZ-1;j++) for(let i=0;i<NX-1;i++){ const a=j*NX+i, b=a+1, cc=a+NX, d=cc+1; idx[q++]=a; idx[q++]=cc; idx[q++]=b; idx[q++]=b; idx[q++]=cc; idx[q++]=d; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('color', new THREE.BufferAttribute(col,3)); g.setAttribute('uv', new THREE.BufferAttribute(uv,2)); g.setIndex(new THREE.BufferAttribute(idx,1)); g.computeVertexNormals(); g.computeBoundingSphere();
    const det=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=256; const x=cv.getContext('2d'); x.fillStyle='#bdbdbd'; x.fillRect(0,0,256,256); for(let i=0;i<9000;i++){ const v=150+R()*105|0; x.fillStyle=`rgba(${v},${v},${v},.5)`; x.fillRect(R()*256,R()*256,2+R()*3,1+R()*2); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const terr=new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors:true, map:det, roughness:.95})); terr.receiveShadow=true; terr.castShadow=false; terr.userData.dynamic=true; terr.userData.noFar=true; scene.add(terr); }

  /* ============================== SÔNG + THÁC ============================== */
  const flowTex=(()=>{ const cv=document.createElement('canvas'); cv.width=128; cv.height=256; const x=cv.getContext('2d'); x.fillStyle='#2f7f8f'; x.fillRect(0,0,128,256);
    for(let i=0;i<260;i++){ x.fillStyle=`rgba(${200+R()*55|0},${235+R()*20|0},255,${.08+R()*.22})`; x.fillRect(R()*128, R()*256, 1+R()*3, 8+R()*30); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const riverMat=new THREE.MeshStandardMaterial({map:flowTex, vertexColors:true, roughness:.15, metalness:.05, transparent:true, opacity:.88, depthWrite:false});
  { const L=[], Rr=[], cols=[]; const pos=[], uv=[], col=[], idx=[];
    for(let i=0;i<RS.length;i++){ const a=RS[Math.max(0,i-1)], b=RS[Math.min(RS.length-1,i+1)], dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||1, nx=-dz/l, nz=dx/l, r=RS[i], hw=r.w*.5+.6, y=r.h-.32;
      const steep=clamp(Math.abs(b.h-a.h)/Math.max(.5,l)/1.2,0,1); pos.push(r.x+nx*hw,y,r.z+nz*hw, r.x-nx*hw,y,r.z-nz*hw); uv.push(0,r.s/6, 1,r.s/6); const w=lerp(.75,1.6,steep); col.push(w,w,w, w,w,w);
      if(i>0){ const k=i*2; idx.push(k-2,k,k-1, k-1,k,k+1); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals();
    const m=new THREE.Mesh(g, riverMat); m.renderOrder=1; m.receiveShadow=true; m.userData.dynamic=true; m.userData.noFar=true; scene.add(m); }
  // thác: rèm nước + bọt + sương mù dưới chân thác
  const WF={x:215, z:-261.5, top:44, bot:20};
  const fallTex=(()=>{ const cv=document.createElement('canvas'); cv.width=128; cv.height=256; const x=cv.getContext('2d'); const g=x.createLinearGradient(0,0,0,256); g.addColorStop(0,'#cfeff6'); g.addColorStop(1,'#ffffff'); x.fillStyle=g; x.fillRect(0,0,128,256);
    for(let i=0;i<180;i++){ x.fillStyle=`rgba(60,140,170,${.05+R()*.18})`; x.fillRect(R()*128,R()*256,1+R()*2,20+R()*60); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const fallMat=new THREE.MeshStandardMaterial({map:fallTex, transparent:true, opacity:.9, roughness:.2, emissive:0x9fd8e8, emissiveIntensity:.15, side:THREE.DoubleSide, depthWrite:false});
  { const a=RIV[2], b=RIV[3], dir=Math.atan2(b[0]-a[0], b[1]-a[1]), wv=8.5;
    const fall=new THREE.Mesh(new THREE.PlaneGeometry(wv, WF.top-WF.bot+2, 1, 8), fallMat); fall.position.set((a[0]+b[0])/2, (WF.top+WF.bot)/2, (a[1]+b[1])/2); fall.rotation.y=dir; fall.userData.dynamic=true; fall.renderOrder=2; scene.add(fall);
    const foam=new THREE.Mesh(new THREE.CircleGeometry(7,24), new THREE.MeshBasicMaterial({color:0xeaf8ff, transparent:true, opacity:.55, depthWrite:false})); foam.rotation.x=-Math.PI/2; foam.position.set(b[0], b[2]-.25, b[1]); foam.userData.dynamic=true; foam.renderOrder=2; scene.add(foam); WF.foam=foam; WF.dir=dir; WF.bx=b[0]; WF.bz=b[1]; WF.by=b[2]; }
  const mist=(()=>{ const n=140, pos=new Float32Array(n*3), seed=new Float32Array(n); for(let i=0;i<n;i++){ seed[i]=R(); pos[i*3]=WF.bx; pos[i*3+1]=WF.by; pos[i*3+2]=WF.bz; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const sp=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'), gr=x.createRadialGradient(32,32,2,32,32,31); gr.addColorStop(0,'rgba(255,255,255,.9)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); })();
    const pts=new THREE.Points(g, new THREE.PointsMaterial({map:sp, size:4.2, transparent:true, opacity:.35, depthWrite:false, color:0xf2fbff})); pts.userData.dynamic=true; pts.frustumCulled=false; scene.add(pts); return {pts, pos, seed, n}; })();
  for(let i=0;i<14;i++){ const a=R()*TAU, d=5+R()*5, x=WF.bx+Math.cos(a)*d, z=WF.bz+Math.sin(a)*d, s=.8+R()*1.8; const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0), new THREE.MeshStandardMaterial({color:0x77726a, roughness:.95})); rk.position.set(x, (hAt(x,z)??WF.by)+s*.3, z); rk.rotation.set(R()*3,R()*3,R()*3); rk.castShadow=true; scene.add(rk); }

  /* ============================== CẦU TỪ DOWNTOWN ============================== */
  const D=CITY.downtown, BX=178; let landZ=-130; for(let z=D.z0-4; z>-200; z-=1){ const h=hAt(BX,z); if(h!==null && h>.6){ landZ=z; break; } }
  { const z0=D.z0, z1=landZ-3, L=z0-z1, zm=(z0+z1)/2, g=new THREE.Group(); scene.add(g);
    const deckM=new THREE.MeshStandardMaterial({color:0x9aa1a8, roughness:.8}), asM=new THREE.MeshStandardMaterial({color:0x2f3237, roughness:.9}), railM=new THREE.MeshStandardMaterial({color:0xc8ced6, roughness:.3, metalness:.8});
    const add=(geo,m,x,y,z)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; g.add(o); return o; };
    add(new THREE.BoxGeometry(10,.5,L+.4), deckM, BX,-.05,zm); add(new THREE.BoxGeometry(7,.03,L+.4), asM, BX,.22,zm);
    for(const s of [-1,1]){ add(new THREE.BoxGeometry(.08,.08,L), railM, BX+s*4.9,1.1,zm); for(let z=z1;z<=z0;z+=2.5) add(new THREE.BoxGeometry(.06,1.05,.06), railM, BX+s*4.9,.6,z); boxes.push({x0:BX+s*4.9-.15, x1:BX+s*4.9+.15, z0:z1, z1:z0}); }
    for(let z=z1+5;z<z0-3;z+=11) add(new THREE.CylinderGeometry(.5,.7,4,10), deckM, BX+((z/11|0)%2?4.2:-4.2),-2.2,z);
    for(let z=z1+4;z<z0;z+=12){ lampPost(BX-5.6,z); }
    addPlat(BX,zm,0,5,L/2+.2,.22);
    // cắt lan can bờ Bắc Downtown chỗ chân cầu
    for(const o of scene.children.slice()){ if(!o.isMesh || !o.geometry || !o.geometry.parameters) continue; const pr=o.geometry.parameters;
      if(Math.abs(o.position.z-(D.z0-1))<.3 && pr.width<.12 && pr.depth>60 && Math.abs(Math.abs(o.rotation.y)-Math.PI/2)<1e-3){ const xa=o.position.x-pr.depth/2, xb=o.position.x+pr.depth/2; scene.remove(o);
        for(const [a,b] of [[xa,BX-5.5],[BX+5.5,xb]]){ if(b-a<.3) continue; const m=new THREE.Mesh(new THREE.BoxGeometry(pr.width,pr.height,b-a), o.material); m.position.set((a+b)/2,o.position.y,o.position.z); m.rotation.y=Math.PI/2; scene.add(m); } } } }

  /* ============================== 🏮 PHỐ CỔ RIVERSIDE ============================== */
  const SM=new Map(), sm=(c,r=.75,m=0)=>{ const k=c+'|'+r+'|'+m; if(!SM.has(k)) SM.set(k, new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m})); return SM.get(k); };
  const town=new THREE.Group(); scene.add(town);
  const put=(geo,mat,x,y,z,ry=0,rx=0,rz=0,parent=town)=>{ const o=new THREE.Mesh(geo,mat); o.position.set(x,y,z); o.rotation.set(rx,ry,rz); o.castShadow=o.receiveShadow=true; parent.add(o); return o; };
  const COLS=[0xe8b33f,0x2f9e9a,0xe8735a,0xf2e6c9,0x4f7fc4,0xe89ab0,0xd9a441,0x7bb37a];
  const winTex=(()=>{ const cv=document.createElement('canvas'); cv.width=128; cv.height=128; const x=cv.getContext('2d'); x.fillStyle='rgba(0,0,0,0)'; x.clearRect(0,0,128,128);
    x.fillStyle='#3b2a1c'; x.fillRect(30,22,68,84); x.fillStyle='#ffd88a'; x.fillRect(38,30,52,68); x.fillStyle='#2a6b4f'; x.fillRect(16,22,14,84); x.fillRect(98,22,14,84); x.strokeStyle='#3b2a1c'; x.lineWidth=3; x.strokeRect(38,30,52,68); x.beginPath(); x.moveTo(64,30); x.lineTo(64,98); x.stroke();
    const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const winMat=new THREE.MeshStandardMaterial({map:winTex, transparent:true, alphaTest:.5, emissive:0xffb35c, emissiveMap:winTex, emissiveIntensity:0, roughness:.6});
  const lanternMat=new THREE.MeshBasicMaterial({color:0xff4a2e, toneMapped:false}), lanternMat2=new THREE.MeshBasicMaterial({color:0xffc23d, toneMapped:false});
  const houses=[];
  function house(x, z, face, w, d, floors, col){   // face: +1 mặt tiền nhìn +x, -1 nhìn -x
    const fh=3.1, h=floors*fh, gy=Math.max(1.3, hAt(x,z)??1.3)-.05, g=new THREE.Group(); g.position.set(x,gy,z); town.add(g);
    put(new THREE.BoxGeometry(d,h,w), sm(col,.85), 0,h/2,0, 0,0,0,g);
    put(new THREE.BoxGeometry(d+.3,.25,w+.3), sm(0xf3eee2,.7), 0,fh,0, 0,0,0,g);
    // mái ngói (lăng trụ)
    const roofG=new THREE.CylinderGeometry(.01, (d+1.2)/Math.SQRT2, w+1.2, 4, 1); roofG.rotateY(Math.PI/4); roofG.rotateX(Math.PI/2); roofG.scale(1,.55,1);
    put(roofG, sm(0xa8452c,.8), 0,h+(d+1.2)*.27,0, 0,0,0,g);
    for(let f=0;f<floors;f++) for(let k=0;k<Math.max(1,Math.floor(w/2.6));k++){ const zz=-w/2+1.3+k*2.6+(w-Math.floor(w/2.6)*2.6)/2; const pw=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.6), winMat); pw.position.set(face*(d/2+.02), f*fh+1.7, zz); pw.rotation.y=face>0?Math.PI/2:-Math.PI/2; g.add(pw); }
    if(floors>1){ put(new THREE.BoxGeometry(1.1,.12,w-.6), sm(0x6b4a2e,.7), face*(d/2+.55),fh+.1,0, 0,0,0,g); put(new THREE.BoxGeometry(.06,.8,w-.6), sm(0x3b2a1c,.6), face*(d/2+1.05),fh+.55,0, 0,0,0,g); }
    put(new THREE.BoxGeometry(.12,2.2,1.4), sm(0x5a3a22,.6), face*(d/2+.03),1.1,0, 0,0,0,g);
    for(const s of [-1,1]){ const lx=face*(d/2+.45), lz=s*(w/2-.8); put(new THREE.SphereGeometry(.24,10,8), s>0?lanternMat:lanternMat2, lx,2.55,lz, 0,0,0,g).castShadow=false; GLOW && GLOW.add(x+lx, gy+2.55, z+lz, 2.2, s>0?0xff5a3a:0xffc23d, 1); }
    boxes.push({x0:x-d/2, x1:x+d/2, z0:z-w/2, z1:z+w/2}); houses.push(g); }
  // 2 dãy nhà dọc 2 phố (Tây sông: phố x=178 · Đông sông: phố x=202)
  { let ci=0; for(const [sx, face, xs] of [[BX-4.8-5,1,BX-4.8],[202+4.8+5,-1,202+4.8]]){ for(let z=TOWN.z1-6; z>TOWN.z0+6; ){ const w=6+Math.floor(R()*3), d=9, fl=2+(R()<.45?1:0); house(sx, z-w/2, face, w, d, fl, COLS[(ci++)%COLS.length]); z-=w+.4; } } }
  // phố lát đá 2 bên sông + kè sông
  { const stone=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=256; const x=cv.getContext('2d'); x.fillStyle='#a79d8b'; x.fillRect(0,0,256,256); for(let r=0;r<16;r++) for(let c=0;c<8;c++){ const v=140+R()*50|0; x.fillStyle=`rgb(${v},${v-8},${v-20})`; x.fillRect(c*32+(r%2)*16+1, r*16+1, 30, 14); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.repeat.set(2,(TOWN.z1-TOWN.z0)/8); return t; })();
    const stM=new THREE.MeshStandardMaterial({map:stone, roughness:.9});
    for(const x of [BX, 202]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(9.4, TOWN.z1-TOWN.z0-2), stM); p.rotation.x=-Math.PI/2; p.position.set(x,1.32,(TOWN.z0+TOWN.z1)/2); p.receiveShadow=true; town.add(p); }
    const segs=[[TOWN.z0+1,-158-1.9],[-158+1.9,-131-1.9],[-131+1.9,TOWN.z1-1]];   // kè sông, chừa lối lên 2 cầu gỗ
    for(const x of [184.2, 195.8]) for(const [a,b] of segs){ put(new THREE.BoxGeometry(.5,.9,b-a), sm(0x8d8577,.9), x,1.0,(a+b)/2); boxes.push({x0:x-.3, x1:x+.3, z0:a, z1:b}); } }
  // 2 cầu gỗ cong qua sông (có đèn lồng)
  const bridgesZ=[-131,-158];
  for(const bz of bridgesZ){ const g=new THREE.Group(); g.position.set(190,0,bz); town.add(g); const wood=sm(0x8a5a33,.7), red=sm(0xb3322a,.6);
    for(let i=0;i<9;i++){ const t=i/8, x=-6+t*12, y=1.35+Math.sin(t*Math.PI)*1.1; put(new THREE.BoxGeometry(1.5,.18,3.2), wood, x,y,0, 0,0,-Math.cos(t*Math.PI)*.33,g); }
    for(const s of [-1,1]) for(let i=0;i<=8;i++){ const t=i/8, x=-6+t*12, y=1.35+Math.sin(t*Math.PI)*1.1; put(new THREE.BoxGeometry(.12,1,.12), red, x,y+.5,s*1.55, 0,0,0,g); }
    for(const s of [-1,1]){ const pts=[]; for(let i=0;i<=16;i++){ const t=i/16; pts.push(new THREE.Vector3(-6+t*12, 1.35+Math.sin(t*Math.PI)*1.1+1, s*1.55)); } put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.06,5), red, 0,0,0, 0,0,0,g); }
    for(const s of [-1,1]){ put(new THREE.SphereGeometry(.3,10,8), lanternMat, 0,3.2,s*1.55, 0,0,0,g).castShadow=false; GLOW && GLOW.add(190, 3.2, bz+s*1.55, 2.6, 0xff5a3a, 1); }
    addPlat(185.2,bz,0,1.4,1.6,1.65); addPlat(190,bz,0,3.6,1.6,2.35); addPlat(194.8,bz,0,1.4,1.6,1.65); }
  // dây đèn lồng giăng ngang 2 phố
  { const lk=[]; for(const x of [BX, 202]) for(let z=TOWN.z1-8; z>TOWN.z0+8; z-=7){ const pts=[]; for(let i=0;i<=10;i++){ const t=i/10; pts.push(new THREE.Vector3(x-4.6+t*9.2, 5.6-Math.sin(t*Math.PI)*.8, z)); }
      put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.025,4), sm(0x222222,.6), 0,0,0);
      for(let i=1;i<10;i+=2){ const p=pts[i]; put(new THREE.SphereGeometry(.2,8,6), (i>>1)%2?lanternMat:lanternMat2, p.x,p.y-.3,p.z).castShadow=false; GLOW && GLOW.add(p.x,p.y-.3,p.z,1.6,(i>>1)%2?0xff5a3a:0xffc23d,.9); } } }
  // chợ đêm ven sông (bờ Đông)
  { const cols=[0xb3322a,0xe8b33f,0x2f9e9a,0x7a4fd8,0xe8735a]; for(let i=0;i<5;i++){ const z=-138-i*6.5, x=198.6; put(new THREE.BoxGeometry(2.2,1,3.4), sm(0xf3eee2,.6), x,1.8,z); put(new THREE.BoxGeometry(2.8,.1,4), sm(cols[i],.6), x,3.6,z, 0,0,.12);
      for(const s of [-1,1]) put(new THREE.CylinderGeometry(.05,.05,2.4,6), sm(0x3a3f45,.4), x+s*1.2,2.5,z+1.8); GLOW && GLOW.add(x,3.2,z,2.2,0xffe7b0,.8); boxes.push({x0:x-1.1, x1:x+1.1, z0:z-1.7, z1:z+1.7}); } }
  // người dạo phố
  const strollers=[];
  if(W.people) for(let i=0;i<8;i++){ const k=W.people.kit(8000+i*17,{}); if(!k) continue; const a=W.makeActor(k.gl,{name:`${W.people.nameOf(8000+i*17)} · dạo phố`, height:k.h, face:0, clips:k.clips, compact:false, dot:'#ffb547'});
    const x=(i%2?202:BX)+(R()-.5)*3, z0=TOWN.z1-10, z1=TOWN.z0+10; const st={a, x, z:lerp(z0,z1,R()), dir:R()<.5?1:-1, z0, z1, sp:.9+R()*.5, wait:0}; a.play('walk',0); strollers.push(st); }

  /* ============================== 🌲 RỪNG (InstancedMesh) ============================== */
  function treeGeo(kind){ const parts=[], add=(g,c,x,y,z)=>{ g=g.toNonIndexed(); g.translate(x,y,z); const n=g.attributes.position.count, a=new Float32Array(n*3), cc=new THREE.Color(c); for(let i=0;i<n;i++){ a[i*3]=cc.r; a[i*3+1]=cc.g; a[i*3+2]=cc.b; } g.setAttribute('color', new THREE.Float32BufferAttribute(a,3)); g.deleteAttribute('uv'); parts.push(g); };
    if(kind==='pine'){ add(new THREE.CylinderGeometry(.18,.28,2.2,6),0x5a3d26,0,1.1,0); add(new THREE.ConeGeometry(2.0,3.2,8),0x2f5e34,0,3.3,0); add(new THREE.ConeGeometry(1.6,2.8,8),0x386b3a,0,4.8,0); add(new THREE.ConeGeometry(1.1,2.4,8),0x427a41,0,6.2,0); }
    else { add(new THREE.CylinderGeometry(.2,.32,2.6,6),0x5e432b,0,1.3,0); add(new THREE.IcosahedronGeometry(1.9,0),0x4f8a3b,0,3.6,0); add(new THREE.IcosahedronGeometry(1.4,0),0x5c9a44,1.0,4.3,.4); add(new THREE.IcosahedronGeometry(1.3,0),0x467f37,-.9,4.1,-.5); }
    const g=mergeGeometries(parts,false); g.computeVertexNormals(); return g; }
  const forest=[];
  { const spots={pine:[], leaf:[]}; let tries=0; const nearRiver=(x,z)=>{ const r=riverAt(x,z); return r && r.d<r.w*.5+5; };
    while((spots.pine.length+spots.leaf.length)<2100 && tries<26000){ tries++; const x=NL.x0+8+R()*(NL.x1-NL.x0-16), z=NL.z0+8+R()*(NL.z1-NL.z0-16), h=hAt(x,z); if(h===null || h<2.2 || h>56) continue;
      if(x>TOWN.x0-6 && x<TOWN.x1+6 && z>TOWN.z0-6 && z<TOWN.z1+4) continue; if(Math.abs(x-BX)<9 && z>landZ-25) continue; if(nearRiver(x,z)) continue;
      const hx=(hAt(x+1,z)??h)-h, hz=(hAt(x,z+1)??h)-h; if(Math.hypot(hx,hz)>.9) continue;
      const dens=.35+.65*fbm(x*.02+7,z*.02-3,3); if(R()>dens) continue;
      (h>14 || R()<.45 ? spots.pine : spots.leaf).push({x,y:h-.1,z,s:.8+R()*.7,r:R()*TAU}); }
    const mat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.85, flatShading:true}); const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), sc=new THREE.Vector3(), ps=new THREE.Vector3(), c=new THREE.Color();
    let added=0;
    for(const kind of ['pine','leaf']){ const L=spots[kind]; if(!L.length) continue; const im=new THREE.InstancedMesh(treeGeo(kind), mat, L.length);
      L.forEach((t,i)=>{ q.setFromAxisAngle(new THREE.Vector3(0,1,0), t.r); sc.setScalar(t.s); ps.set(t.x,t.y,t.z); m4.compose(ps,q,sc); im.setMatrixAt(i,m4); im.setColorAt(i, c.setHSL(.25+R()*.08, .35+R()*.2, .45+R()*.15).lerp(new THREE.Color(0xffffff), .35));
        if(t.y<16 && added<380){ circles.push({x:t.x, z:t.z, r:.35*t.s}); added++; } });
      im.instanceMatrix.needsUpdate=true; im.instanceColor.needsUpdate=true; im.castShadow=true; im.receiveShadow=true; im.userData.dynamic=true; im.computeBoundingSphere(); scene.add(im); forest.push(im); } }

  /* ============================== 🛕 CHÒI NGẮM CẢNH TRÊN ĐỈNH ============================== */
  const PEAK=(()=>{ let best={h:-1}; for(let j=4;j<NZ-4;j+=2) for(let i=4;i<NX-4;i+=2){ const h=H[j*NX+i], x=NL.x0+i*RES, z=NL.z0+j*RES; if(h>best.h && Math.hypot(x-WF.x, z-WF.z)>30) best={h,x,z}; } return best; })();
  { const g=new THREE.Group(); g.position.set(PEAK.x, PEAK.h-.2, PEAK.z); scene.add(g); const wood=sm(0x7a4a2a,.7), red=sm(0xa8452c,.8);
    put(new THREE.CylinderGeometry(3.6,3.9,.5,8), sm(0x8a857c,.9), 0,.25,0, 0,0,0,g);
    for(let i=0;i<6;i++){ const a=i/6*TAU; put(new THREE.CylinderGeometry(.14,.16,3,8), wood, Math.cos(a)*3,1.9,Math.sin(a)*3, 0,0,0,g); }
    put(new THREE.ConeGeometry(4.6,2.2,6), red, 0,4.4,0, 0,0,0,g); put(new THREE.ConeGeometry(2.4,1.5,6), red, 0,5.7,0, 0,0,0,g);
    put(new THREE.CylinderGeometry(.05,.05,3,6), sm(0xdddddd,.4), 0,7.4,0, 0,0,0,g); const flag=put(new THREE.PlaneGeometry(1.4,.8), new THREE.MeshStandardMaterial({color:0xda251d, side:THREE.DoubleSide}), .72,8.4,0, 0,0,0,g); flag.userData.dynamic=true; PEAK.flag=flag;
    GLOW && GLOW.add(PEAK.x, PEAK.h+5.4, PEAK.z, 6, 0xffd27a, 1);
    addPlat(PEAK.x, PEAK.z, 0, 3.5, 3.5, PEAK.h+.3);
    INTER.push({x:PEAK.x, z:PEAK.z, r:3.5, prio:.4, label:'🛕 Chòi ngắm cảnh – cao '+Math.round(PEAK.h)+' m (E: ảnh toàn cảnh)', action:()=>{ W.HOOK.camOverride={pos:new THREE.Vector3(PEAK.x+30, PEAK.h+28, PEAK.z+55), look:new THREE.Vector3(200, 10, -150), k:1.2}; toast('📸 Toàn cảnh cao nguyên – di chuyển để thoát.', 3000); const q=()=>{ if(W.HOOK.camOverride && (Math.abs(P.vx)+Math.abs(P.vz)>.3)) { W.HOOK.camOverride=null; return; } if(W.HOOK.camOverride) requestAnimationFrame(q); }; setTimeout(q, 800); }}); }
  if(!S.hlSeen){ /* lần đầu tới cao nguyên: chúc mừng */ }

  /* ============================== KHUNG HÌNH ============================== */
  let night=-1, acc=0;
  HOOK.onFrame.push((dt, T)=>{
    if(W.inside) return;
    if(W.night!==night){ night=W.night; winMat.emissiveIntensity=night*1.4; lanternMat.color.setRGB(1,.29+night*.1,.18).multiplyScalar(.75+night*.9); lanternMat2.color.setRGB(1,.76,.24).multiplyScalar(.75+night*.9); }
    const near=P.x>NL.x0-80 && P.x<NL.x1+80 && P.z>NL.z0-80 && P.z<NL.z1+120;
    flowTex.offset.y-=dt*.55; fallTex.offset.y+=dt*1.6;
    if(!near) return;
    // sương mù chân thác
    const mp=mist.pos; for(let i=0;i<mist.n;i++){ const s=mist.seed[i], t=(T*.35+s)%1, a=s*TAU*7; mp[i*3]=WF.bx+Math.cos(a)*(1+t*7); mp[i*3+1]=WF.by+.2+t*5; mp[i*3+2]=WF.bz+Math.sin(a)*(1+t*7); } mist.pts.geometry.attributes.position.needsUpdate=true;
    WF.foam.scale.setScalar(1+Math.sin(T*3)*.04);
    if(PEAK.flag) PEAK.flag.rotation.y=Math.sin(T*2.3)*.35;
    // người dạo phố đi qua lại
    for(const st of strollers){ if(st.wait>0){ st.wait-=dt; if(st.wait<=0) st.a.play('walk',.3); } else { st.z+=st.dir*st.sp*dt; if(st.z<st.z1 || st.z>st.z0){ st.dir*=-1; st.wait=2+R()*4; st.a.play('idle',.3); } }
      const y=hAt(st.x,st.z)??1.3; st.a.g.position.set(st.x, y, st.z); st.a.g.rotation.y=st.dir>0?0:Math.PI; if(st.a.root.visible) st.a.mixer.update(dt); }
  });

  /* ============================== TAXI · BẢN ĐỒ ============================== */
  try{ if(transit && transit.G){ const G=transit.G, node=(x,z)=>{ G.nodes.push({x,z,adj:[]}); return G.nodes.length-1; }, link=(a,b)=>{ const d=Math.hypot(G.nodes[a].x-G.nodes[b].x, G.nodes[a].z-G.nodes[b].z); G.nodes[a].adj.push([b,d]); G.nodes[b].adj.push([a,d]); G.edges.push([a,b]); };
      let j=-1, bd=1e9; G.nodes.forEach((n,i)=>{ const d=Math.hypot(n.x-BX, n.z-D.z0); if(d<bd){ bd=d; j=i; } });
      const a=node(BX,landZ-4), b=node(BX,TOWN.z0+8); link(j,a); link(a,b);
      transit.TAXI_DEST.push({icon:'🏮',name:'Phố cổ Riverside (Cao nguyên)',x:BX,z:-135},{icon:'🌊',name:'Đường lên Thác nước',x:BX,z:TOWN.z0+6}); } }catch(e){ console.warn('highland taxi', e); }
  const tp=(x,z,lx,lz)=>()=>W.teleport(x,z,lx,lz);
  PLACES.push({icon:'🏮', name:'Phố cổ Riverside', sub:'Cao nguyên Bình Phan · nhà màu, đèn lồng, cầu gỗ, chợ đêm (qua cầu phía Bắc Downtown)', go:tp(BX, -128, 190, -140)},
    {icon:'🌊', name:'Thác nước Cao nguyên', sub:'Thác cao ~24 m giữa rừng thông', go:tp(WF.bx+3, WF.bz+16, WF.bx, WF.bz)},
    {icon:'🛕', name:'Chòi ngắm cảnh đỉnh núi', sub:`Đỉnh cao ${Math.round(PEAK.h)} m – nhìn toàn thành phố`, go:tp(PEAK.x+2, PEAK.z+2, 200, -150)},
    {icon:'⛰️', name:'Cầu sang Cao nguyên', sub:'Nối dài phố x=178 ở bờ Bắc Downtown', go:tp(BX+2, D.z0-6, BX, landZ)});

  return {NL, H, hAt, RS, WF, PEAK, landZ, houses, forest};
}
