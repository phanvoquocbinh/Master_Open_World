// QC World – S6: CAO NGUYÊN BÌNH PHAN (phía Bắc Downtown, nối bằng cầu nối dài phố x=178)
//  ⛰️ Dãy núi đá (đỉnh ~70 m) bao phía Bắc/Đông/Tây · 🌊 sông chảy từ núi, qua THÁC NƯỚC cao ~24 m, xuyên phố cổ rồi ra biển
//  🌲 Rừng ~2.000 cây (2 InstancedMesh) · 🏮 PHỐ CỔ RIVERSIDE: nhà nhiều màu kiểu Hội An hai bên sông, đèn lồng giăng phố
//     (quầng sáng ban đêm), 2 cầu gỗ qua sông, chợ đêm, người dạo phố · 🛕 Chòi ngắm cảnh trên đỉnh núi
// Địa hình: hàm độ cao (nhiễu cố định) lấy mẫu sẵn thành lưới 2 m → lưới vẽ và mặt đất va chạm khớp nhau tuyệt đối.
import { createGFX, Kit as GKit, boxM } from './gfxkit.js';
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
  const RIV=[[231,-326,60],[226,-311,45],[216,-266,44],[215.6,-264.2,20],[208.5,-232,19.7],[202,-214,11],[197,-202,7.5],[191,-176,3.4],[190,-150,1.45],[190,-124,1.05],[190,-96,-.7]];
  const RS=[];   // mẫu sông mỗi 1 m: {x,z,h,w,s}
  { let s=0; for(let i=0;i<RIV.length-1;i++){ const [x0,z0,h0]=RIV[i], [x1,z1,h1]=RIV[i+1], L=Math.hypot(x1-x0,z1-z0); for(let t=0;t<L;t+=1){ const k=t/L; RS.push({x:x0+(x1-x0)*k, z:z0+(z1-z0)*k, h:h0+(h1-h0)*k, w:lerp(6,11,clamp((s+t)/300,0,1)), s:s+t}); } s+=L; } RS.push({x:RIV[RIV.length-1][0], z:RIV[RIV.length-1][1], h:RIV[RIV.length-1][2], w:11, s}); }
  function riverAt(x,z){ let bd=1e9, bi=-1; for(let i=0;i<RS.length;i+=2){ const r=RS[i], d=(r.x-x)**2+(r.z-z)**2; if(d<bd){ bd=d; bi=i; } } if(bd>40*40) return null;
    for(let i=Math.max(0,bi-2);i<=Math.min(RS.length-1,bi+2);i++){ const r=RS[i], d=(r.x-x)**2+(r.z-z)**2; if(d<bd){ bd=d; bi=i; } } const r=RS[bi]; return {d:Math.sqrt(bd), h:r.h, w:r.w}; }
  /* ---------- 🌊 THÁC LỚN hình móng ngựa (S-GFX 15/11) – hệ toạ độ thác: a = dọc dòng chảy (xuôi +), b = ngang (Đông +) ---------- */
  const FC={x:216, z:-266}, FU=[-.217,.976], FV=[.976,.217], FHW=26, FD=11, FTOP=44, FBOT=20, FRY=Math.atan2(FU[0],FU[1]);
  const fAB=(x,z)=>[(x-FC.x)*FU[0]+(z-FC.z)*FU[1], (x-FC.x)*FV[0]+(z-FC.z)*FV[1]];
  const fXZ=(a,b)=>[FC.x+FU[0]*a+FV[0]*b, FC.z+FU[1]*a+FV[1]*b];
  const FBE=FHW-2.5;   /* nửa bề rộng rèm nước (hẹp hơn lòng thác 2,5 m mỗi bên – 2 đầu khuất sau trụ đá) */
  const fCrest=b=>Math.abs(b)<FHW ? -FD*(1-(b/FHW)**2) : 0;                       // mép thác: giữa lùi vào 11 m so với 2 đầu
  const fHalf=a=>a<-46?4 : a<-26?lerp(4,FHW,(a+46)/20) : a<=1?FHW : a<24?31 : a<36?lerp(31,6,(a-24)/12) : 6;   // nửa bề rộng mặt nước
  const fTopL=a=>FTOP+Math.max(0,-a-12)*.03;                                       // cao độ mặt hồ trên
  function fallsH(x,z,h,hn){ const [a,b]=fAB(x,z), ab=Math.abs(b); if(a<-48 || a>36 || ab>60) return h;
    const ac=fCrest(b), top=a<=ac, hw=fHalf(a), k=ss(hw, hw+6, ab);
    const bed = top ? fTopL(a)-1.2 : a<ac+1 ? lerp(FTOP-1.2, FBOT-1.6, a-ac) : FBOT-1.6;
    const bank = a<1 ? Math.max(hn, ab<50 ? fTopL(a)+.5 : lerp(fTopL(a)+.5, hn, ss(50,58,ab))) : Math.max(hn, FBOT+.6);   // trên: mặt bằng đỉnh thác · dưới: bờ hồ
    return lerp(bed, bank, k); }
  // lối dạo từ phố cổ → đài ngắm chân thác → lối nối → bậc đá men vách → đài ngắm đỉnh thác  (điểm: [a, b, cao độ])
  const TRAIL=[[88.6,6.9,1.32],[79,14,4.6],[68,17,8.2],[55,22,13],[43,28,17.3],[32,33.5,20.2],[26,37,20.9]], LINK=[[13,45.5,20.9],[10.5,58,21.6],[8.5,66.6,22],[4.2,67.4,22]];
  const LOW={a0:11, a1:27, b0:33, b1:47, y:20.9}, UP={a0:-13, a1:.5, b0:29, b1:44, y:44.6}, ST={a0:.5, a1:6.5, bTop:34, bBot:64, yTop:44.6, yBot:22, n:100};
  const stairY=b=>b<=ST.bTop ? ST.yTop : b>=ST.bBot ? ST.yBot : lerp(ST.yTop, ST.yBot, (b-ST.bTop)/(ST.bBot-ST.bTop));
  const polyD=(P,a,b)=>{ let bd=1e9, by=0; for(let i=0;i<P.length-1;i++){ const A=P[i], B=P[i+1], ex=B[0]-A[0], ey=B[1]-A[1], L2=ex*ex+ey*ey; let t=((a-A[0])*ex+(b-A[1])*ey)/L2; t=t<0?0:t>1?1:t; const d=Math.hypot(a-A[0]-ex*t, b-A[1]-ey*t); if(d<bd){ bd=d; by=A[2]+(B[2]-A[2])*t; } } return [bd,by]; };
  function walkH(x,z,h){ const [a,b]=fAB(x,z); if(a<-16 || a>92 || b<4 || b>77) return h;
    for(const P of [TRAIL, LINK]){ const [d,y]=polyD(P,a,b); if(d<1.6) h=y; else if(d<5.5) h=lerp(y, h, ss(1.6,5.5,d)); }
    if(b>=LOW.b0){ const d=Math.max(LOW.a0-a, a-LOW.a1, b-LOW.b1, 0); if(d<=0) h=LOW.y; else if(d<3.5) h=lerp(LOW.y, h, ss(0,3.5,d)); }      // đài ngắm chân thác (mép nước b=33 dựng đứng)
    if(b>=31 && b<=73 && a>=ST.a0 && a<=10){ let y=stairY(b)-.5; if(b>ST.bBot) y=lerp(y, h, ss(ST.bBot+5.4, 73, b)); h = a<=ST.a1 ? y : lerp(y, h, ss(ST.a1, 10, a)); }   // nền bậc đá ôm sát chân vách
    if(a>=UP.a0-2 && a<=UP.a1 && b>=UP.b0 && b<=UP.b1+2){ const d=Math.max(UP.a0-a, b-UP.b1, 0); h = d<=0 ? UP.y : lerp(UP.y, h, ss(0,2,d)); }                         // đài ngắm đỉnh thác
    return h; }
  function landMask(x,z){ const u=x-NL.x0, v=NL.z1-z, Wd=NL.x1-NL.x0, Hd=NL.z1-NL.z0; let inset=12+fbm(x*.018,z*.018,3)*18; if(v<40) inset-=11*Math.exp(-(((x-182)/26)**2)); return Math.min(u, Wd-u, v, Hd-v)-inset; }
  function hf(x,z){ const m=landMask(x,z); if(m<-16) return -6.5; const u=x-NL.x0, v=NL.z1-z;
    let h=.9+Math.max(0,v-70)*.035+fbm(x*.03,z*.03,4)*2.4;
    const mN=ss(85,185,v), mE=ss(165,238,u)*.85*ss(25,150,v), mW=ss(62,4,u)*.75*ss(40,170,v), mt=Math.max(mN,mE,mW);
    h+=ridged(x*.0115+3.1, z*.0115-1.7, 5)*84*mt + fbm(x*.05,z*.05,3)*7*mt;
    const tw=ss(0,10,Math.min(x-TOWN.x0, TOWN.x1-x, z-TOWN.z0, TOWN.z1-z)); h=lerp(h, 1.3, tw*.97);
    const hn=h; const r=riverAt(x,z); if(r){ const k=ss(r.w*.5, r.w*.5+7, r.d); h=lerp(r.h-1.15, Math.max(h, r.h+.35), k); }
    // S-GFX (15/11): phố cổ phẳng đúng cao độ mặt đá lát (1,3 m) từ dãy nhà tới tận bờ kè 2 bên sông – trước lòng sông khoét lan qua bờ
    // làm đầu cầu gỗ trũng xuống mặt nước (rơi xuống sông, không lên được cầu) và mặt phố chỗ cao chỗ thấp so với lớp đá lát
    if(z>TOWN.z0+1 && z<TOWN.z1-1 && ((x>172.8 && x<184.05) || (x>195.95 && x<207.2))) h=1.3;
    h=walkH(x,z, fallsH(x,z,h,hn));   // S-GFX: thác lớn + lối dạo/đài ngắm
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
    for(let i=0;i<RS.length;i++){ const a=RS[Math.max(0,i-1)], b=RS[Math.min(RS.length-1,i+1)], dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||1, nx=-dz/l, nz=dx/l, r=RS[i], fa=fAB(r.x,r.z)[0], hw=(fa>-48 && fa<35.5) ? .02 : r.w*.5+.6, y=r.h-.32;
      const steep=clamp(Math.abs(b.h-a.h)/Math.max(.5,l)/1.2,0,1); pos.push(r.x+nx*hw,y,r.z+nz*hw, r.x-nx*hw,y,r.z-nz*hw); uv.push(0,r.s/6, 1,r.s/6); const w=lerp(.75,1.6,steep); col.push(w,w,w, w,w,w);
      if(i>0){ const k=i*2; idx.push(k-2,k,k-1, k-1,k,k+1); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals();
    const m=new THREE.Mesh(g, riverMat); m.renderOrder=1; m.receiveShadow=true; m.userData.dynamic=true; m.userData.noFar=true; scene.add(m); }
  // 🌊 THÁC LỚN (S-GFX 15/11) – rèm nước móng ngựa rộng 52 m cao 24 m · hồ trên · hồ dưới · bọt · sương · đá
  //    + ĐÀI NGẮM CHÂN THÁC (sàn gỗ vươn ra mặt hồ, cách rèm nước ~9 m) · 100 BẬC ĐÁ men vách · ĐÀI NGẮM ĐỈNH THÁC · lối dạo từ phố cổ · tiếng thác lớn dần
  const WF={x:215, z:-261.5, top:FTOP, bot:FBOT};
  const fallTex=(()=>{ const cv=document.createElement('canvas'); cv.width=128; cv.height=256; const x=cv.getContext('2d'); const g=x.createLinearGradient(0,0,0,256); g.addColorStop(0,'#cfeff6'); g.addColorStop(1,'#ffffff'); x.fillStyle=g; x.fillRect(0,0,128,256);
    for(let i=0;i<180;i++){ x.fillStyle=`rgba(60,140,170,${.05+R()*.18})`; x.fillRect(R()*128,R()*256,1+R()*2,20+R()*60); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const fallMat=new THREE.MeshStandardMaterial({map:fallTex, transparent:true, opacity:.9, roughness:.2, emissive:0x9fd8e8, emissiveIntensity:.15, side:THREE.DoubleSide, depthWrite:false});

  const GF=W.GFX||(W.GFX=createGFX({quality:W.QUAL||'low', msaa:!W.CINE})), M2=GF.M;
  const fallsKeep=(x,z)=>{ const [a,b]=fAB(x,z), ab=Math.abs(b); if(a<-50 || a>94 || ab>70) return false;
    if(a<38 && ab<fHalf(a)+7) return true; if(a<2 && ab<52) return true;
    if(b>0){ if(polyD(TRAIL,a,b)[0]<4.5 || polyD(LINK,a,b)[0]<4.5) return true; if(a>LOW.a0-3 && a<LOW.a1+3 && b>LOW.b0-2 && b<LOW.b1+3) return true; if(a>-1 && a<12 && b>30 && b<74) return true; }
    return false; };
  { const [bx,bz]=fXZ(fCrest(0)+3.4,0); WF.bx=bx; WF.bz=bz; WF.by=FBOT; WF.dir=FRY; }
  const WFG=new THREE.Group(); WFG.userData.dynamic=true; scene.add(WFG);
  const wStrip=(rows, mat, ro)=>{ const pos=[], uv=[], col=[], idx=[], n=rows[0].length; for(const r of rows) for(const p of r){ pos.push(p[0],p[1],p[2]); uv.push(p[3],p[4]); if(p.length>5) col.push(p[5],p[6],p[7]); }
    for(let i=0;i<rows.length-1;i++) for(let j=0;j<n-1;j++){ const k=i*n+j; idx.push(k,k+1,k+n, k+1,k+n+1,k+n); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); if(col.length) g.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals();
    const m=new THREE.Mesh(g, mat); m.renderOrder=ro; m.userData.dynamic=true; m.userData.noFar=true; m.frustumCulled=false; WFG.add(m); return m; };
  const lakeMat=new THREE.MeshStandardMaterial({map:flowTex, color:0xc4c9c9, roughness:.14, metalness:.05, envMapIntensity:.55, transparent:true, opacity:.9, depthWrite:false, side:THREE.DoubleSide});
  const curtTex=(()=>{ const cv=document.createElement('canvas'); cv.width=256; cv.height=512; const x=cv.getContext('2d'); x.fillStyle='#eef8fa'; x.fillRect(0,0,256,512);
    for(let i=0;i<420;i++){ const w=1+R()*5, h=60+R()*300, c=R(); x.fillStyle=c<.45?`rgba(70,150,165,${.10+R()*.22})`:c<.8?`rgba(255,255,255,${.35+R()*.5})`:`rgba(150,205,215,${.15+R()*.25})`; const px=R()*256, py=R()*512; x.fillRect(px,py,w,h); if(py+h>512) x.fillRect(px,py-512,w,h); }
    const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; })();
  const curtMat=new THREE.MeshStandardMaterial({map:curtTex, vertexColors:true, transparent:true, opacity:.95, roughness:.35, emissive:0xbfe6ee, emissiveIntensity:.14, side:THREE.DoubleSide, depthWrite:false});
  const foamTex=(()=>{ const cv=document.createElement('canvas'); cv.width=256; cv.height=128; const x=cv.getContext('2d'); for(let i=0;i<520;i++){ const v=R(), y=v*128, r=3+R()*9*(1-v*.6); x.fillStyle=`rgba(255,255,255,${(.75-v*.6)*(.4+R()*.6)})`; x.beginPath(); x.arc(R()*256, y, r, 0, 7); x.fill(); }
    const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const foamMat=new THREE.MeshBasicMaterial({map:foamTex, transparent:true, opacity:.85, depthWrite:false, side:THREE.DoubleSide});
  { // hồ trên (trước mép thác)
    const rows=[], TT=[0,.2,.4,.58,.74,.86,.94,1]; for(const t of TT){ const row=[]; for(let j=-17;j<=17;j++){ const s1=j/17, a=lerp(-48, fCrest(s1*FBE)+.3, t), hwv=Math.min(fHalf(a)+3.3, lerp(fHalf(a)+3.3, FBE, clamp((t-.94)/.06,0,1))), b=s1*hwv, [x,z]=fXZ(a,b); row.push([x, fTopL(a)-.32, z, b/8, a/6]); } rows.push(row); } wStrip(rows, lakeMat, 1);
    // mép nước uốn cong + rèm nước đổ thẳng
    const cr=[[-.4,FTOP-.32,0, .5,.78,.8],[1.4,FTOP-.55,-.12, .56,.84,.84],[2.6,FTOP-1.6,-.24, .7,.92,.92],[3.1,FTOP-4,-.42, .86,.97,.98],[3.3,FTOP-13,-1.1, .97,1,1],[3.4,FBOT-.6,-1.9, 1,1,1]];
    wStrip(cr.map(([da,y,v,cr1,cg,cb])=>{ const row=[]; for(let j=-12;j<=12;j++){ const b=j/12*FBE, [x,z]=fXZ(fCrest(b)+da,b); row.push([x,y,z,b/5,v,cr1,cg,cb]); } return row; }), curtMat, 2);
    // hồ dưới
    const rows3=[]; for(let k=0;k<=4;k++){ const row=[]; for(let b=-40;b<=40.01;b+=4){ const a=lerp(fCrest(Math.max(-FHW,Math.min(FHW,b)))+2.6, 37.5, k/4), [x,z]=fXZ(a,b); row.push([x, FBOT-.32, z, b/8, a/6]); } rows3.push(row); } wStrip(rows3, lakeMat, 1);
    // bọt trắng sôi dưới chân thác
    wStrip([0,3.5,8.5].map((da,k)=>{ const row=[]; for(let j=-13;j<=13;j++){ const b=j/13*(FBE+1), [x,z]=fXZ(fCrest(Math.max(-FBE,Math.min(FBE,b)))+2.7+da,b); row.push([x, FBOT-.27, z, b/6, k/2]); } return row; }), foamMat, 3); }
  const mist=(()=>{ const n=170, pos=new Float32Array(n*3), seed=new Float32Array(n*2); for(let i=0;i<n;i++){ seed[i*2]=R(); seed[i*2+1]=R(); pos[i*3]=WF.bx; pos[i*3+1]=WF.by; pos[i*3+2]=WF.bz; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const sp=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'), gr=x.createRadialGradient(32,32,2,32,32,31); gr.addColorStop(0,'rgba(255,255,255,.9)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(cv); })();
    const pts=new THREE.Points(g, new THREE.PointsMaterial({map:sp, size:9, transparent:true, opacity:.3, depthWrite:false, color:0xf2fbff})); pts.userData.dynamic=true; pts.frustumCulled=false; pts.renderOrder=4; scene.add(pts); return {pts, pos, seed, n}; })();
  { const fk=GKit(), addSeg=W.addSeg||(()=>{}), rockM=M2.paint(0x77726a,.95), railM=M2.blackMetal;
    // đá hộc 2 bên bờ hồ và dưới chân thác
    for(let i=0;i<18;i++){ const sg=i%2?1:-1, a=sg>0?3+R()*6:3+R()*20, b=sg*(27+R()*4.5), s=.9+R()*1.9, [x,z]=fXZ(a,b); fk.add(new THREE.DodecahedronGeometry(s,0), rockM, x, FBOT-.6+s*.35, z, R()*6, R()*3, R()*3); }
    for(const e of [-1,1]){ [[-1.0,25.9,FTOP-.9,3.0],[1.2,27.0,FTOP-4.6,4.1],[2.0,26.6,FTOP-9.6,4.3],[2.6,27.1,FTOP-14.6,4.4],[3.1,26.7,FTOP-19.4,4.6],[3.8,27.3,FBOT+.4,5.0]].forEach(([a,b2,y,s2],i)=>{ const [x,z]=fXZ(a,e*b2); fk.add(new THREE.DodecahedronGeometry(s2,0), rockM, x, y, z, i*1.7+e, i*.9, i*1.3+e*.5); if(i===0) circles.push({x, z, r:2.3}); }); }
    for(let i=0;i<5;i++){ const b=-20+i*10+R()*3, s=1.2+R()*1.4, [x,z]=fXZ(fCrest(b)+5+R()*2,b); fk.add(new THREE.DodecahedronGeometry(s,0), rockM, x, FBOT-.7+s*.3, z, R()*6, R()*3, R()*3); }
    const rail=(a0,b0,a1,b1,y,msg)=>{ const L=Math.hypot(a1-a0,b1-b0), n=Math.max(1,Math.round(L/1.8)), [x0,z0]=fXZ(a0,b0), [x1,z1]=fXZ(a1,b1), ry=Math.atan2(x1-x0,z1-z0);
      for(let i=0;i<=n;i++){ const t=i/n; fk.add(new THREE.CylinderGeometry(.04,.04,1.1,6), railM, x0+(x1-x0)*t, y+.55, z0+(z1-z0)*t); }
      fk.add(new THREE.BoxGeometry(.07,.06,L+.08), M2.woodDark, (x0+x1)/2, y+1.1, (z0+z1)/2, ry); fk.add(new THREE.BoxGeometry(.04,.04,L), railM, (x0+x1)/2, y+.6, (z0+z1)/2, ry); fk.add(new THREE.BoxGeometry(.04,.04,L), railM, (x0+x1)/2, y+.22, (z0+z1)/2, ry);
      addSeg(x0,z0,x1,z1,.12,y-1.4,y+1.7,msg); };
    const bench=(a,b,ry,rot,y,label)=>{ const [x,z]=fXZ(a,b), bx=-Math.sin(rot)*.22, bz=-Math.cos(rot)*.22; fk.add(boxM(1.8,.07,.46), M2.woodLight, x, y+.46, z, ry); fk.add(boxM(1.8,.42,.06), M2.woodLight, x+bx, y+.78, z+bz, ry);
      for(const s of [-.75,.75]) fk.add(new THREE.BoxGeometry(.07,.46,.44), railM, x+Math.cos(ry)*s, y+.23, z-Math.sin(ry)*s, ry); circles.push({x, z, r:.55, y0:y-.5, y1:y+1.2});
      W.addBench && W.addBench({x:x-bx*.3, z:z-bz*.3, rot, len:1.7, y:y+.5, floor:y, label}); };
    const lamp=(a,b,y)=>{ const [x,z]=fXZ(a,b); fk.add(new THREE.CylinderGeometry(.05,.07,3.2,8), railM, x, y+1.6, z); fk.add(new THREE.SphereGeometry(.2,12,8), M2.lampWarm, x, y+3.3, z); circles.push({x, z, r:.15, y0:y-.5, y1:y+3}); GLOW && GLOW.add(x, y+3.3, z, 2.4, 0xffd9a0, .9); };
    // ---- ĐÀI NGẮM CHÂN THÁC: sân đá + sàn gỗ vươn ra mặt hồ
    { const D0=26.5, [x,z]=fXZ((LOW.a0+LOW.a1)/2,(LOW.b0+LOW.b1)/2), Y=LOW.y+.12; fk.add(boxM(LOW.b1-LOW.b0,.14,LOW.a1-LOW.a0), M2.pave, x, LOW.y+.05, z, FRY); addPlat(x,z,FRY,(LOW.b1-LOW.b0)/2,(LOW.a1-LOW.a0)/2,Y);
      const [dx,dz]=fXZ(19,(D0+LOW.b0)/2); fk.add(boxM(LOW.b0-D0+.3,.12,14), M2.deck, dx, LOW.y+.06, dz, FRY); addPlat(dx,dz,FRY,(LOW.b0-D0)/2+.15,7,Y);
      for(const a of [12.4,19,25.6]) for(const b of [27,30.2]){ const [px,pz]=fXZ(a,b); fk.add(new THREE.CylinderGeometry(.14,.14,3.2,8), M2.woodDark, px, LOW.y-1.55, pz); }
      rail(12,D0,26,D0,Y,'🌊 Lan can đài ngắm – thác ở ngay trước mặt!'); rail(12,D0,12,LOW.b0,Y); rail(26,D0,26,LOW.b0,Y); rail(LOW.a0,LOW.b0,12,LOW.b0,Y); rail(26,LOW.b0,LOW.a1,LOW.b0,Y);
      for(const [ba,bb] of [[23.5,36.5],[21,43.5]]){ const [bx0,bz0]=fXZ(ba,bb), [tx,tz]=fXZ(-5,2), face=Math.atan2(tx-bx0, tz-bz0); bench(ba,bb,face,face,Y,'🪑 Ngồi ngắm thác (E · C)'); }   // ghế quay thẳng về rèm nước lamp(11.6,46.4,Y); lamp(26.4,46.4,Y);
      W.makeLabel && W.makeLabel('🌊 Đài ngắm Chân Thác', 'Sàn gỗ vươn ra mặt hồ · bậc đá lên đỉnh thác ở phía Đông', {h:.6, x, y:LOW.y+4.2, z, fade:80}); }
    // ---- 100 BẬC ĐÁ men theo chân vách lên đỉnh thác
    { const run=(ST.bBot-ST.bTop)/ST.n, rise=(ST.yTop-ST.yBot)/ST.n, am=4.2, sw=3.6, ar=6.15;
      for(let i=0;i<ST.n;i++){ const b=ST.bBot-(i+.5)*run, y=ST.yBot+(i+1)*rise, [x,z]=fXZ(am,b); fk.add(boxM(run+.02,.9,sw), M2.stoneLight, x, y-.45, z, FRY); addPlat(x,z,FRY,run/2+.01,sw/2,y); }
      { const [lx,lz]=fXZ((ST.a0+ST.a1)/2,(31+ST.bTop)/2); fk.add(boxM(ST.bTop-31+.1,.3,ST.a1-ST.a0), M2.stoneLight, lx, ST.yTop-.13, lz, FRY); addPlat(lx,lz,FRY,(ST.bTop-31)/2+.05,(ST.a1-ST.a0)/2,ST.yTop+.02); }
      { const [lx,lz]=fXZ(am+.6,ST.bBot+2.6); fk.add(boxM(5.2,.3,sw+2.2), M2.stoneLight, lx, ST.yBot-.13, lz, FRY); addPlat(lx,lz,FRY,2.6,(sw+2.2)/2,ST.yBot+.02); }   // chiếu nghỉ dưới: lối vào từ phía hạ lưu
      let pv=null; for(let i=0;i<=ST.n;i+=5){ const b=ST.bBot-i*run, y=ST.yBot+i*rise, [x,z]=fXZ(ar,b); fk.add(new THREE.CylinderGeometry(.045,.045,1.15,6), railM, x, y+.57, z);
        if(pv){ const L=Math.hypot(pv.b-b, y-pv.y), [mx,mz]=fXZ(ar,(pv.b+b)/2); for(const hh of [1.12,.6]) fk.add(new THREE.BoxGeometry(L,.06,.06), hh>1?M2.woodDark:railM, mx,(pv.y+y)/2+hh,mz, FRY, 0, -Math.atan2(rise,run)); } pv={b,y}; }
      { const [x0,z0]=fXZ(ar,ST.bBot-.1), [x1,z1]=fXZ(ar,31); addSeg(x0,z0,x1,z1,.12,ST.yBot-2,ST.yTop+1.8,'⛰️ Lan can bậc đá – bên dưới là hồ chân thác'); }
      rail(ST.a0+.1,31,ar,31,ST.yTop+.02); rail(ar,31,ar,ST.bTop,ST.yTop+.02);
      const [sx,sz]=fXZ(am,ST.bBot+2); W.makeLabel && W.makeLabel('⛰️ Bậc đá lên Đỉnh Thác', '100 bậc men vách · vừa leo vừa ngắm rèm nước', {h:.5, x:sx, y:ST.yBot+3.4, z:sz, fade:45}); }
    // ---- ĐÀI NGẮM ĐỈNH THÁC: ngay mép nước đổ
    { const [x,z]=fXZ((UP.a0+UP.a1)/2,(UP.b0+UP.b1)/2), Y=UP.y+.12; fk.add(boxM(UP.b1-UP.b0,.14,UP.a1-UP.a0), M2.pave, x, UP.y+.05, z, FRY); addPlat(x,z,FRY,(UP.b1-UP.b0)/2,(UP.a1-UP.a0)/2,Y);
      rail(UP.a0,UP.b0,UP.a1,UP.b0,Y,'🌊 Lan can đỉnh thác – nước đổ xuống 24 m ngay dưới chân'); rail(UP.a1,UP.b0,UP.a1,31,Y); rail(UP.a1,36.4,UP.a1,UP.b1,Y);
      bench(-7,40.5,FRY+Math.PI/2,Math.atan2(-FV[0],-FV[1]),Y,'🪑 Ngồi ngắm đỉnh thác (E · C)'); lamp(UP.a0+.6,UP.b1-.6,Y); lamp(UP.a1-.6,UP.b1-.6,Y);
      W.makeLabel && W.makeLabel('🌊 Đài ngắm Đỉnh Thác', 'Đứng ngay mép nước đổ · nhìn xuống hồ và phố cổ', {h:.6, x, y:UP.y+4.2, z, fade:80});
      const [cx,cz]=fXZ(-4,0); W.makeLabel && W.makeLabel('🌊 Thác Móng Ngựa Cao Nguyên', 'Rộng 52 m · cao 24 m', {h:1.0, x:cx, y:FTOP+9, z:cz, fade:260}); }
    for(const [a,b,y] of [[60,24.5,10.9],[38,33.4,18.9],[7,60,21.8]]) lamp(a,b,y);
    fk.build(scene); }
  // mặt lát lối dạo (bám đúng cao độ địa hình)
  for(const [Pl,w] of [[TRAIL,2.8],[LINK,2.4]]){ const pts=[]; for(let i=0;i<Pl.length-1;i++){ const A=Pl[i], B=Pl[i+1], L=Math.hypot(B[0]-A[0],B[1]-A[1]); for(let t=0;t<L;t+=1) pts.push([A[0]+(B[0]-A[0])*t/L, A[1]+(B[1]-A[1])*t/L]); } pts.push([Pl[Pl.length-1][0], Pl[Pl.length-1][1]]);
    const pos=[], uv=[], idx=[]; let sl=0; pts.forEach((q,i)=>{ const A=pts[Math.max(0,i-1)], B=pts[Math.min(pts.length-1,i+1)], dx=B[0]-A[0], dy=B[1]-A[1], l=Math.hypot(dx,dy)||1, nx=-dy/l, ny=dx/l; if(i) sl+=Math.hypot(q[0]-pts[i-1][0], q[1]-pts[i-1][1]);
      for(const f of [-.5,0,.5]){ const [x,z]=fXZ(q[0]+nx*w*f, q[1]+ny*w*f); pos.push(x, (hAt(x,z)??0)+.07, z); uv.push((f+.5)*w, sl); } if(i){ const k=i*3; idx.push(k-3,k-2,k, k-2,k+1,k, k-2,k-1,k+1, k-1,k+2,k+1); } });
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals();
    if(g.attributes.normal.getY(4)<0){ idx.reverse(); g.setIndex(idx); g.computeVertexNormals(); }
    const m=new THREE.Mesh(g, M2.pave); m.receiveShadow=true; m.userData.dynamic=true; scene.add(m); }
  // tiếng thác: ù trầm + rào rào, lớn dần khi lại gần (tôn trọng tuỳ chọn Âm thanh môi trường + đang đeo tai nghe)
  const SND={ctx:null, g:null, lp:null, vol:0};
  function sndInit(){ if(SND.ctx) return; try{ if(localStorage.getItem('qcworld-sfx')==='0') return; }catch(e){} if(!(navigator.userActivation && navigator.userActivation.hasBeenActive)) return;
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; let c; try{ c=(W.ambience && W.ambience.ctx) || new AC(); }catch(e){ return; } SND.ctx=c;
    const sr=c.sampleRate, N=sr*5, X=Math.floor(sr*.3), raw=new Float32Array(N+X); let last=0; for(let i=0;i<N+X;i++){ const r=Math.random()*2-1; last=(last+.03*r)/1.03; raw[i]=last*2.8+r*.2; }
    const buf=c.createBuffer(1,N,sr), d=buf.getChannelData(0); d.set(raw.subarray(0,N)); for(let i=0;i<X;i++){ const k=i/X; d[i]=raw[i]*k+raw[N+i]*(1-k); }
    const s=c.createBufferSource(); s.buffer=buf; s.loop=true; SND.lp=c.createBiquadFilter(); SND.lp.type='lowpass'; SND.lp.frequency.value=700; SND.g=c.createGain(); SND.g.gain.value=0; s.connect(SND.lp); SND.lp.connect(SND.g); SND.g.connect(c.destination); s.start(); }
  WF.update=(dt,T)=>{ const mp=mist.pos; for(let i=0;i<mist.n;i++){ const s=mist.seed[i*2], s2=mist.seed[i*2+1], t=(T*.2+s)%1, b=(s2*2-1)*FBE, [x,z]=fXZ(fCrest(b)+3.2+t*13+Math.sin(s*40)*1.5, b); mp[i*3]=x; mp[i*3+1]=FBOT-.2+Math.pow(t,.6)*17; mp[i*3+2]=z; }
    mist.pts.geometry.attributes.position.needsUpdate=true; foamTex.offset.y-=dt*.22;
    const [pa,pb]=fAB(P.x,P.z), cb=Math.max(-FHW,Math.min(FHW,pb)), d=Math.hypot(pa-(fCrest(cb)+2), pb-cb, (P.y-(FBOT+10))*.5), near=clamp(1-(d-10)/170,0,1);
    let worn=false; try{ const g=W.gadgets; worn=!!(g && g.music && g.music.headphones); }catch(e){} let off=false; try{ off=localStorage.getItem('qcworld-sfx')==='0'; }catch(e){}
    WF.near=near; if(near>0) sndInit(); if(SND.g){ const v=(worn||off||W.inside||d>220) ? 0 : .95*Math.min(1, Math.pow(15/Math.max(d,15),1.6)); /* nhỏ dần theo khoảng cách thật: 30 m ≈ 33 %, 50 m ≈ 15 %, 100 m ≈ 5 % */ SND.vol+=(v-SND.vol)*Math.min(1,dt*3); SND.g.gain.value=SND.vol; SND.lp.frequency.value=500+near*near*3400; } };

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
  // S-GFX (15/11): nhà phố cổ dựng bằng gfxkit.townHouse – tường vữa có vân, cửa gỗ, mái hiên ngói trên cột gỗ, cửa sổ kính thấy phòng (đêm sáng đèn),
  // cửa chớp, ban công gỗ, mái ngói âm dương 2 dốc. Cả 2 dãy nhà gộp chung 1 Kit → vài lượt vẽ cho cả phố (trước: ~15 mesh/nhà).
  const hk=GKit();
  function house(x, z, face, w, d, floors, col){   // face: +1 mặt tiền nhìn +x, -1 nhìn -x · (x,z) = tâm khối nhà
    const gy=Math.max(1.3, hAt(x,z)??1.3)-.05, fl=floors>=3?[3.4,3.1,3.1]:[3.4,3.1];
    const r=GF.build.townHouse(hk, {x:x+face*d/2, y:gy, z, ry:face>0?Math.PI/2:-Math.PI/2, w, d, floors:fl, wall:col, seed:houses.length*7+3, shutter:[0x2f6b4f,0x3f5f7a,0x6b3a2a][houses.length%3]});
    for(const [cx,cz] of r.cols) circles.push({x:cx, z:cz, r:.2});
    for(const s of [-1,1]){ const lx=face*(d/2+.75), lz=s*(w/2-.8); put(new THREE.SphereGeometry(.24,10,8), s>0?lanternMat:lanternMat2, x+lx,gy+2.95,z+lz).castShadow=false; GLOW && GLOW.add(x+lx, gy+2.95, z+lz, 2.2, s>0?0xff5a3a:0xffc23d, 1); }
    boxes.push({x0:x-d/2, x1:x+d/2, z0:z-w/2, z1:z+w/2}); houses.push({x, z, w, d, face}); }
  // 2 dãy nhà dọc 2 phố (Tây sông: phố x=178 · Đông sông: phố x=202)
  { let ci=0; for(const [sx, face, xs] of [[BX-4.8-5,1,BX-4.8],[202+4.8+5,-1,202+4.8]]){ for(let z=TOWN.z1-6; z>TOWN.z0+6; ){ const w=6+Math.floor(R()*3), d=9, fl=2+(R()<.45?1:0); house(sx, z-w/2, face, w, d, fl, COLS[(ci++)%COLS.length]); z-=w+.4; } }
    hk.build(town); }
  // phố lát đá 2 bên sông + kè sông
  { const stone=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=256; const x=cv.getContext('2d'); x.fillStyle='#a79d8b'; x.fillRect(0,0,256,256); for(let r=0;r<16;r++) for(let c=0;c<8;c++){ const v=140+R()*50|0; x.fillStyle=`rgb(${v},${v-8},${v-20})`; x.fillRect(c*32+(r%2)*16+1, r*16+1, 30, 14); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.repeat.set(2,(TOWN.z1-TOWN.z0)/8); return t; })();
    const stM=new THREE.MeshStandardMaterial({map:stone, roughness:.9});
    for(const x of [BX, 202]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(9.4, TOWN.z1-TOWN.z0-2), stM); p.rotation.x=-Math.PI/2; p.position.set(x,1.32,(TOWN.z0+TOWN.z1)/2); p.receiveShadow=true; town.add(p);
      addPlat(x,(TOWN.z0+TOWN.z1)/2,0,4.7,(TOWN.z1-TOWN.z0-2)/2,1.32); }   // S-GFX: chân đứng đúng mặt đá lát (trước: theo địa hình → có chỗ lún chân xuống dưới mặt phố)
    const segs=[[TOWN.z0+1,-158-1.9],[-158+1.9,-131-1.9],[-131+1.9,TOWN.z1-1]];   // kè sông, chừa lối lên 2 cầu gỗ
    for(const x of [184.2, 195.8]) for(const [a,b] of segs){ put(new THREE.BoxGeometry(.5,.9,b-a), sm(0x8d8577,.9), x,1.0,(a+b)/2); boxes.push({x0:x-.3, x1:x+.3, z0:a, z1:b}); } }
  // 2 cầu gỗ cong qua sông (có đèn lồng)
  const bridgesZ=[-131,-158];
  for(const bz of bridgesZ){ const g=new THREE.Group(); g.position.set(190,0,bz); town.add(g); const wood=sm(0x8a5a33,.7), red=sm(0xb3322a,.6);
    for(let i=0;i<9;i++){ const t=i/8, x=-6+t*12, y=1.35+Math.sin(t*Math.PI)*1.1; put(new THREE.BoxGeometry(1.5,.18,3.2), wood, x,y,0, 0,0,-Math.cos(t*Math.PI)*.33,g); }
    for(const s of [-1,1]) for(let i=0;i<=8;i++){ const t=i/8, x=-6+t*12, y=1.35+Math.sin(t*Math.PI)*1.1; put(new THREE.BoxGeometry(.12,1,.12), red, x,y+.5,s*1.55, 0,0,0,g); }
    for(const s of [-1,1]){ const pts=[]; for(let i=0;i<=16;i++){ const t=i/16; pts.push(new THREE.Vector3(-6+t*12, 1.35+Math.sin(t*Math.PI)*1.1+1, s*1.55)); } put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.06,5), red, 0,0,0, 0,0,0,g); }
    for(const s of [-1,1]){ put(new THREE.SphereGeometry(.3,10,8), lanternMat, 0,3.2,s*1.55, 0,0,0,g).castShadow=false; GLOW && GLOW.add(190, 3.2, bz+s*1.55, 2.6, 0xff5a3a, 1); }
    // S-GFX: sàn đứng bám đúng cung cầu (16 đoạn, mỗi bậc ≤ 0,25 m) – trước chỉ 3 tấm, bậc giữa cao 0,7 m > 0,65 m nên đi lọt xuống dưới mặt cầu
    const NS=16; for(let i=0;i<NS;i++){ const t=(i+.5)/NS; addPlat(184+t*12, bz, 0, 12/NS/2+.03, 1.6, 1.35+Math.sin(t*Math.PI)*1.1+.09); }
    for(const s of [-1,1]) boxes.push({x0:184.2, x1:195.8, z0:bz+s*1.55-.06, z1:bz+s*1.55+.06, msg:'🏮 Lan can cầu gỗ'});
    boxes.push({x0:185, x1:195, z0:bz-1.7, z1:bz+1.7, y0:-9, y1:1.0, msg:'🌉 Gầm cầu thấp – lên cầu mà qua sông'}); }   // lội sông không chui xuyên mặt cầu
  // dây đèn lồng giăng ngang 2 phố
  { const lk=[]; for(const x of [BX, 202]) for(let z=TOWN.z1-8; z>TOWN.z0+8; z-=7){ const pts=[]; for(let i=0;i<=10;i++){ const t=i/10; pts.push(new THREE.Vector3(x-4.6+t*9.2, 5.6-Math.sin(t*Math.PI)*.8, z)); }
      put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.025,4), sm(0x222222,.6), 0,0,0);
      for(let i=1;i<10;i+=2){ const p=pts[i]; put(new THREE.SphereGeometry(.2,8,6), (i>>1)%2?lanternMat:lanternMat2, p.x,p.y-.3,p.z).castShadow=false; GLOW && GLOW.add(p.x,p.y-.3,p.z,1.6,(i>>1)%2?0xff5a3a:0xffc23d,.9); } } }
  // chợ đêm ven sông (bờ Đông)
  { const cols=[0xb3322a,0xe8b33f,0x2f9e9a,0x7a4fd8,0xe8735a], SZ=[-137,-143.5,-150,-164.5,-171];   // S-GFX: chừa đầu 2 cầu (z=-131, -158) – trước sạp thứ 4 đặt ngay đầu cầu chắn lối
    for(let i=0;i<5;i++){ const z=SZ[i], x=198.6; put(new THREE.BoxGeometry(2.2,1,3.4), sm(0xf3eee2,.6), x,1.8,z); put(new THREE.BoxGeometry(2.8,.1,4), sm(cols[i],.6), x,3.6,z, 0,0,.12);
      for(const s of [-1,1]) put(new THREE.CylinderGeometry(.05,.05,2.4,6), sm(0x3a3f45,.4), x+s*1.2,2.5,z+1.8); GLOW && GLOW.add(x,3.2,z,2.2,0xffe7b0,.8); boxes.push({x0:x-1.1, x1:x+1.1, z0:z-1.7, z1:z+1.7}); } }
  // người dạo phố
  const strollers=[];
  if(W.people) for(let i=0;i<8;i++){ const k=W.people.kit(8000+i*17,{}); if(!k) continue; const a=W.makeActor(k.gl,{name:`${W.people.nameOf(8000+i*17)} · dạo phố`, height:k.h, face:0, clips:k.clips, compact:false, dot:'#ffb547'});
    const x=(i%2?202:BX)+(R()-.5)*3, z0=TOWN.z1-10, z1=TOWN.z0+10; const st={a, x, z:lerp(z0,z1,R()), dir:R()<.5?1:-1, z0, z1, sp:.9+R()*.5, wait:0}; a.g.position.set(st.x, W.groundAt ? W.groundAt(st.x,st.z) : 0, st.z); a.play('walk',0); strollers.push(st); }   // S19g rà soát 16/11: đặt đúng chỗ ngay (trước chồng ở gốc 0,0)

  /* ============================== 🌲 RỪNG (InstancedMesh) ============================== */
  function treeGeo(kind){ const parts=[], add=(g,c,x,y,z)=>{ g=g.toNonIndexed(); g.translate(x,y,z); const n=g.attributes.position.count, a=new Float32Array(n*3), cc=new THREE.Color(c); for(let i=0;i<n;i++){ a[i*3]=cc.r; a[i*3+1]=cc.g; a[i*3+2]=cc.b; } g.setAttribute('color', new THREE.Float32BufferAttribute(a,3)); g.deleteAttribute('uv'); parts.push(g); };
    if(kind==='pine'){ add(new THREE.CylinderGeometry(.18,.28,2.2,6),0x5a3d26,0,1.1,0); add(new THREE.ConeGeometry(2.0,3.2,8),0x2f5e34,0,3.3,0); add(new THREE.ConeGeometry(1.6,2.8,8),0x386b3a,0,4.8,0); add(new THREE.ConeGeometry(1.1,2.4,8),0x427a41,0,6.2,0); }
    else { add(new THREE.CylinderGeometry(.2,.32,2.6,6),0x5e432b,0,1.3,0); add(new THREE.IcosahedronGeometry(1.9,0),0x4f8a3b,0,3.6,0); add(new THREE.IcosahedronGeometry(1.4,0),0x5c9a44,1.0,4.3,.4); add(new THREE.IcosahedronGeometry(1.3,0),0x467f37,-.9,4.1,-.5); }
    const g=mergeGeometries(parts,false); g.computeVertexNormals(); return g; }
  const forest=[];
  { const spots={pine:[], leaf:[]}; let tries=0; const nearRiver=(x,z)=>{ const r=riverAt(x,z); return r && r.d<r.w*.5+5; };
    while((spots.pine.length+spots.leaf.length)<2100 && tries<26000){ tries++; const x=NL.x0+8+R()*(NL.x1-NL.x0-16), z=NL.z0+8+R()*(NL.z1-NL.z0-16), h=hAt(x,z); if(h===null || h<2.2 || h>56) continue;
      if(x>TOWN.x0-6 && x<TOWN.x1+6 && z>TOWN.z0-6 && z<TOWN.z1+4) continue; if(Math.abs(x-BX)<9 && z>landZ-25) continue; if(nearRiver(x,z) || fallsKeep(x,z)) continue;
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
    if(W.night!==night){ night=W.night; winMat.emissiveIntensity=night*1.4; GF.setTime(1-(night||0)*.95, night||0); lanternMat.color.setRGB(1,.29+night*.1,.18).multiplyScalar(.75+night*.9); lanternMat2.color.setRGB(1,.76,.24).multiplyScalar(.75+night*.9); }
    const near=P.x>NL.x0-80 && P.x<NL.x1+80 && P.z>NL.z0-80 && P.z<NL.z1+120;
    flowTex.offset.y-=dt*.55; fallTex.offset.y+=dt*1.6; curtTex.offset.y+=dt*.95;
    if(!near) return;
    WF.update(dt,T);   // sương, bọt, tiếng thác
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
    {icon:'🌊', name:'Thác Móng Ngựa · Đài ngắm Chân Thác', sub:'Thác rộng 52 m cao 24 m · sàn gỗ sát rèm nước · tiếng thác ầm ầm', go:tp(...fXZ(19,30.5), ...fXZ(-6,2))},
    {icon:'⛰️', name:'Thác Móng Ngựa · Đài ngắm Đỉnh Thác', sub:'Ngay mép nước đổ · leo 100 bậc đá từ chân thác', go:tp(...fXZ(-5,32.5), ...fXZ(-3,6))},
    {icon:'🛕', name:'Chòi ngắm cảnh đỉnh núi', sub:`Đỉnh cao ${Math.round(PEAK.h)} m – nhìn toàn thành phố`, go:tp(PEAK.x+2, PEAK.z+2, 200, -150)},
    {icon:'⛰️', name:'Cầu sang Cao nguyên', sub:'Nối dài phố x=178 ở bờ Bắc Downtown', go:tp(BX+2, D.z0-6, BX, landZ)});

  return {NL, H, hAt, RS, WF, PEAK, landZ, houses, forest};
}
