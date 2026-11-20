// QC World V2 – Đảo Abyssal · phiên D (abyss-towers), 17/11/2026 – CAFE 3 TẦNG (bờ Tây) + NHÀ HÀNG 5 SAO 3 TẦNG (bờ Đông) – đặc tả Bình Phần 5
//  Đặt đúng W.ABY.plots.cafe / plots.restaurant của phiên A (tựa tường kè, đáy +2,5, mái +16, dùng yaw có sẵn). Nhà hàng = ảnh gương của cafe qua trục x = 0.
//  Tên tầng theo đặc tả: Tầng 3 = dưới cùng (+2,5, cửa ra bãi cát) · Tầng 2 (+7,0) · Tầng 1 (+11,5, sát vỉa hè) · Sân thượng +16 = CỬA TRÊN ra vỉa hè kè.
//   • Khối lõi tựa kè (sâu 6–8 m, vách sau ốp đá + lam gỗ, đèn hắt 2700K) + 3 SÀN LỒI bo cong viền đồng vươn ra vịnh (Tầng 3: 4,5 m · Tầng 2: 7 m · Tầng 1: 9 m),
//     đỡ bằng cột + dầm cong thép mạ đồng; lan can kính tay vịn vàng; hoa giấy rủ mép lan can (cafe).
//   • Cầu thang ngoài trời 3,4 m (2 vế gấp khúc mỗi tầng, bậc gỗ Teak nẹp LED vàng, lan can kính tay vịn đồng) nối sân thượng +16 ↔ Tầng 1 ↔ Tầng 2 ↔ Tầng 3,
//     + 2 THANG MÁY KÍNH (liftkit) chạy 4 điểm dừng. Bậc tam cấp từ sàn Tầng 3 xuống bãi cát.
//   • CAFE "Cliffside Artisan Roastery & Botanical Lounge": quầy bar 14 m đá nâu vân vàng, 2 máy espresso đồng (Lathe), máy xay, tháp cold brew thuỷ tinh,
//     tủ bánh; sofa da Cognac chần nút, ghế Thonet, thảm Ba Tư, kệ sách sát trần, Grand Piano, 30 chậu Monstera; 32 bộ bàn (bình hoa, đèn bàn, menu da);
//     16 dù gỗ 8 cánh Ø 3,6 m vải kem – xanh rêu viền tua vàng.
//   • NHÀ HÀNG "Le Palais de l'Abysse": Tầng 3 hầm rượu gỗ sồi 600 chai phát sáng hổ phách + bàn tiệc Hoàng gia 12 ghế + đèn chùm pha lê 3,5 m;
//     Tầng 2 bếp mở Teppanyaki (3 đầu bếp NPC mũ cao, lửa áp chảo); Tầng 1 + sàn lồi: khăn lụa kép, đĩa sứ viền vàng, ly pha lê (Lathe), chân nến 3 nhánh,
//     khung vòm Pergola đồng + dù Hoàng gia Đỏ–Vàng.
//  Hiệu năng: vỏ + đồ ngoài trời gộp chung 2 quán (≈ 18 lượt vẽ) · nội thất lõi + NPC chỉ dựng khi lại gần (≤ 60 m) · bàn ghế/dù/chai rượu = InstancedMesh.
//  CỬA TRÊN: phiên A chưa chừa khe lan can kè ở 2 lô → file này tự mở khe 3,8 m lúc dựng (tắt đoạn chặn + ẩn con tiện/tay vịn trong khe). Phiên A nên mở khe gốc rồi bỏ bước này.
//  Công bố W.ABY.dining = {cafe, restaurant} (bàn, ghế, quầy, lối vào) cho phiên E (dining.js – phục vụ bàn).
import { makeLiftBank } from './liftkit.js';
import { towerKit } from './abyssal_towers.js';

const TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const rng=(seed=1)=>{ let s=(seed>>>0)||1; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };

export async function make(W, ctx={}){
  if(W.abyDining) return W.abyDining;
  const ABY=W.ABY, PL=ABY && ABY.plots; if(!PL || !PL.cafe || !PL.restaurant) return null;
  const {THREE, scene, P, cam, HOOK, INTER, PLACES, toast, makeLabel, teleport, addSeg, addPlat, circles} = W;
  const S=ctx.S||W.__abyS||(W.__abyS={}), save=ctx.save||(()=>{}), askPay=ctx.askPay, spend=ctx.spend, LOW=W.QUAL==='low', ui=()=>ctx.ui||W.ui, fmt=ctx.fmt||(n=>String(n)), K=towerKit(THREE,W);
  let LUX=W.LUX; if(!LUX){ try{ LUX=W.LUX=(await import('./lux_textures.js')).makeLux(THREE); }catch(e){ LUX=null; } }
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.7, ...o}), mk=(tok,o,fb)=>{ try{ return LUX.mk(tok,o||{}); }catch(e){ return fb||std(0xb59a74); } }, uvs=(m,s)=>{ m.userData.uvS=s; return m; };
  const MT={ trav:uvs(mk('TRAVERTINE_WARM'),2.4), sand:uvs(mk('SANDSTONE_TRIM'),2.4), gold:mk('GOLD_CHAMPAGNE'), bronze:mk('TITANIUM_BRONZE'), copper:std(0xb8693c,{roughness:.3, metalness:.85}),
    walnut:uvs(mk('WALNUT_WOOD'),1.6), mahog:uvs(mk('MAHOGANY_DARK'),1.6), teak:uvs(mk('TEAK_DECK'),1.6), glow:mk('WARM_GLOW'), emerald:mk('EMERALD_VELVET'), bordeaux:mk('BORDEAUX_VELVET'), rug:mk('PERSIAN_RUG'),
    glassC:new THREE.MeshPhysicalMaterial({color:0xd6eef5, roughness:.03, metalness:.05, transparent:true, opacity:.18, depthWrite:false, side:THREE.DoubleSide}),
    glassR:new THREE.MeshPhysicalMaterial({color:0xcfe8f5, roughness:.04, metalness:0, transparent:true, opacity:.28, depthWrite:false, side:THREE.DoubleSide}),
    paint:std(0xffffff,{roughness:.6}), fabric:std(0xffffff,{roughness:.88, side:THREE.DoubleSide}), dark:std(0x24262b,{roughness:.45, metalness:.3}), green:std(0x4f9050,{roughness:.9}), pot:std(0x3a3430,{roughness:.6, metalness:.2}),
    plaster:std(0xd9c4a0,{roughness:.92}), chrome:std(0xd5dbe2,{roughness:.15, metalness:1}),
    amber:new THREE.MeshStandardMaterial({color:0x7a3a10, emissive:0xff9a30, emissiveIntensity:.9, roughness:.2, metalness:.1}),
    crystal:new THREE.MeshStandardMaterial({color:0xfff4dc, emissive:0xffe6b0, emissiveIntensity:.9, roughness:.05, metalness:.2, transparent:true, opacity:.85}),
    flame:new THREE.MeshBasicMaterial({color:0xffa040, transparent:true, opacity:.85, blending:THREE.AdditiveBlending, depthWrite:false}) };
  MT.marbleB=uvs(new THREE.MeshStandardMaterial({map:K.stoneTex('#5a3a26',['#d4af37','#2a1a10','#b08a4a'],61,{veins:24}), roughness:.16, metalness:.1}),2.0);   /* đá nâu vân vàng (quầy bar cafe) */
  MT.marbleK=uvs(new THREE.MeshStandardMaterial({map:K.stoneTex('#121214',['#d4af37','#6a5a30'],62,{veins:20, flecks:300}), roughness:.14, metalness:.2}),2.0);   /* cẩm thạch đen tia vàng (nhà hàng) */
  const root=new THREE.Group(); root.name='aby-dining'; scene.add(root);
  const EXT=K.Batch(), EI=K.Emit(), RHO=ABY.rho||((x,z)=>Math.hypot(x/146,(z+15)/130)), RB=(ABY.beach && ABY.beach.rhoTop)||.8995;
  const seg=(a,b,y0,y1,msg)=>addSeg(a[0],a[1],b[0],b[1],.15,y0,y1,msg);
  /* biển tên: 1 atlas nhỏ cho cả 2 quán */
  const ATL=(()=>{ const c=document.createElement('canvas'); c.width=1024; c.height=512; const g=c.getContext('2d'); g.fillStyle='#0d0b09'; g.fillRect(0,0,1024,512); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
    const cell=(x,y,w,h,txt,sub,o={})=>{ const gr=g.createLinearGradient(0,y,0,y+h); gr.addColorStop(0,o.bg0||'#1d1812'); gr.addColorStop(1,o.bg1||'#0b0907'); g.fillStyle=gr; g.fillRect(x,y,w,h); g.strokeStyle=o.edge||'#c9a54a'; g.lineWidth=4; g.strokeRect(x+3,y+3,w-6,h-6);
      g.save(); g.textAlign='center'; g.textBaseline='middle'; g.shadowColor=o.glow||'#ffcf70'; g.shadowBlur=14; g.fillStyle=o.col||'#ffe2a0'; g.font=`700 ${o.fs||Math.round(h*.4)}px Georgia, 'Times New Roman', serif`; g.fillText(txt,x+w/2,y+h*(sub?.38:.53),w-24);
      if(sub){ g.shadowBlur=6; g.font=`600 ${Math.round(h*.2)}px 'Segoe UI', sans-serif`; g.fillStyle=o.subCol||'#f3e3c0'; g.fillText(sub,x+w/2,y+h*.76,w-24); } g.restore(); t.needsUpdate=true; return [x/1024, 1-(y+h)/512, (x+w)/1024, 1-y/512]; };
    return {t, cell, mat:new THREE.MeshBasicMaterial({map:t, toneMapped:false})}; })();
  const signGeo=(uv,w,h)=>{ const g=new THREE.PlaneGeometry(w,h), a=g.attributes.uv; for(let i=0;i<a.count;i++) a.setXY(i, lerp(uv[0],uv[2],a.getX(i)), lerp(uv[1],uv[3],a.getY(i))); return g; };
  const lathe=(pts,n=16)=>new THREE.LatheGeometry(pts.map(([r,h])=>new THREE.Vector2(r,h)),n);

  /* ============================== BỐ CỤC CHUNG (toạ độ cục bộ: lx dọc tường kè, lz ra vịnh) ============================== */
  const CX0=-8, CX1=13, CF=3.0, SX0=-20.3, SX1=-13.3, SZ0=3.2, SZ1=11.5, RC=3.0, LIFT_X=-4.8, LHW=3.05;
  const DECK=[7.5,10.0,12.0];   /* mép trước sàn lồi Tầng 3 / 2 / 1 (lz) */
  function mkVenue(pl, k, m){ const V={k, pl, m, cafe:k==='cafe', name:k==='cafe'?'Cliffside Artisan Roastery':'Le Palais de l\'Abysse', Y:[pl.yBase, pl.yBase+(pl.yTop-pl.yBase)/3, pl.yBase+2*(pl.yTop-pl.yBase)/3], YR:pl.yTop, tables:[], seats:[], people:[], near:{built:false}};
    const F=[Math.sin(pl.yaw), Math.cos(pl.yaw)], R0=[Math.cos(pl.yaw), -Math.sin(pl.yaw)], R=[R0[0]*m, R0[1]*m], O=[pl.x, pl.z]; Object.assign(V,{F,R,O});
    V.W2=(lx,lz)=>[O[0]+R[0]*lx+F[0]*lz, O[1]+R[1]*lx+F[1]*lz]; V.P3=(lx,y,lz)=>{ const p=V.W2(lx,lz); return [p[0],y,p[1]]; };
    V.N=(nx,ny,nz)=>[R[0]*nx+F[0]*nz, ny, R[1]*nx+F[1]*nz]; V.yaw=(fu,fv)=>Math.atan2(R[0]*fu+F[0]*fv, R[1]*fu+F[1]*fv);
    /* đường mặt tường kè (lz theo lx) – dò ρ = mép kè của phiên A */ const TBL=new Map(); V.lzW=lx=>{ const key=Math.round(lx*4)/4; if(TBL.has(key)) return TBL.get(key); let lo=-16, hi=2; for(let i=0;i<40;i++){ const mm=(lo+hi)/2, p=V.W2(key,mm); if(RHO(p[0],p[1])>RB) lo=mm; else hi=mm; } TBL.set(key,lo); return lo; };
    V.bx=lx=>V.lzW(lx)+.12;   /* mặt sau khối lõi */
    V.lzC=Math.max(V.lzW(LIFT_X-LHW),V.lzW(LIFT_X+LHW),V.lzW(LIFT_X))+.25+1.32;   /* tâm giếng thang (cửa nhìn ra vịnh) */
    return V; }
  const VEN=[mkVenue(PL.cafe,'cafe',1), mkVenue(PL.restaurant,'rest',-1)];

  /* ---------- tiện ích dựng theo toạ độ cục bộ ---------- */
  function prism(B, V, x0, x1, back, front, y0, y1, f={}){ /* khối giữa đường cong sau back(lx) và đường thẳng trước lz = front */ const n=Math.max(1,Math.ceil((x1-x0)/1.5));
    for(let i=0;i<n;i++){ const a=x0+(x1-x0)*i/n, b=x0+(x1-x0)*(i+1)/n, ba=typeof back==='function'?back(a):back, bb=typeof back==='function'?back(b):back;
      if(f.t!==false) K.quad(B,V.P3(a,y1,ba),V.P3(b,y1,bb),V.P3(b,y1,front),V.P3(a,y1,front),[0,1,0]);
      if(f.b!==false) K.quad(B,V.P3(a,y0,ba),V.P3(b,y0,bb),V.P3(b,y0,front),V.P3(a,y0,front),[0,-1,0]);
      if(f.f!==false) K.quad(B,V.P3(a,y0,front),V.P3(b,y0,front),V.P3(b,y1,front),V.P3(a,y1,front),V.N(0,0,1));
      if(f.k) K.quad(B,V.P3(a,y0,ba),V.P3(b,y0,bb),V.P3(b,y1,bb),V.P3(a,y1,ba),V.N(0,0,-1)); }
    if(f.e!==false) for(const [x,s] of [[x0,-1],[x1,1]]){ const bk=typeof back==='function'?back(x):back; K.quad(B,V.P3(x,y0,bk),V.P3(x,y0,front),V.P3(x,y1,front),V.P3(x,y1,bk),V.N(s,0,0)); } }
  const addPrism=(V,mat,x0,x1,back,front,y0,y1,f)=>{ const B=K.Bld(); prism(B,V,x0,x1,back,front,y0,y1,f); EXT.add(mat,K.toGeo(B)); };
  const boxL=(V,mat,lx,y,lz,sx,sy,sz,fu=0,fv=1,B=EXT)=>{ const p=V.W2(lx,lz); B.box(mat,p[0],y,p[1],V.yaw(fu,fv),sx,sy,sz); };
  const platRect=(V,x0,x1,z0,z1,y)=>{ const c=V.W2((x0+x1)/2,(z0+z1)/2); addPlat(c[0],c[1],V.pl.yaw,Math.abs(x1-x0)/2+.03,Math.abs(z1-z0)/2+.03,y); };
  /* đường viền sàn lồi bo góc: (13,3) → (13,D−rc) → cung → (−13+rc,D) … → (−13,3) */
  const outline=(D,rc=RC,n=6)=>{ const pts=[[13,CF]]; for(let i=0;i<=n;i++){ const t=i/n*Math.PI/2; pts.push([13-rc+Math.cos(t)*rc, D-rc+Math.sin(t)*rc]); } for(let i=0;i<=n;i++){ const t=Math.PI/2+i/n*Math.PI/2; pts.push([-13+rc+Math.cos(t)*rc, D-rc+Math.sin(t)*rc]); } pts.push([-13,CF]); const out=[pts[0]]; for(let i=1;i<pts.length;i++){ const [ax,az]=pts[i-1], [bx,bz]=pts[i], n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/1.0)); for(let k=1;k<=n;k++) out.push([ax+(bx-ax)*k/n, az+(bz-az)*k/n]); } return out; };
  const inDeck=(lx,lz,D,pad=0)=>{ if(lz<CF || lz>D-pad || Math.abs(lx)>13-pad) return false; const cx=13-RC, cz=D-RC; if(Math.abs(lx)>cx && lz>cz) return Math.hypot(Math.abs(lx)-cx,lz-cz)<RC-pad; return true; };
  // dải đứng theo polyline cục bộ (kính lan can, viền đồng, váy che gầm) – bỏ các đoạn có trung điểm nằm trong gaps(lx,lz)
  function band(V,mat,pts,y0,y1,gap=()=>false,o={}){ const B=K.Bld(); for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1]; if(gap((ax+bx)/2,(az+bz)/2)) continue; const nx=bz-az, nz=-(bx-ax), l=Math.hypot(nx,nz)||1, n=V.N(nx/l,0,nz/l);
      K.quad(B,V.P3(ax,y0,az),V.P3(bx,y0,bz),V.P3(bx,y1,bz),V.P3(ax,y1,az),n); if(o.top){ const ix=ax-nx/l*o.top, iz=az-nz/l*o.top, jx=bx-nx/l*o.top, jz=bz-nz/l*o.top; K.quad(B,V.P3(ax,y1,az),V.P3(bx,y1,bz),V.P3(jx,y1,jz),V.P3(ix,y1,iz),[0,1,0]); } }
    EXT.add(mat,K.toGeo(B)); }
  function railSegs(V,pts,y,gap=()=>false,msg='🚧 Lan can kính sàn lồi',y0,y1){ for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1]; if(gap((ax+bx)/2,(az+bz)/2)) continue; seg(V.W2(ax,az),V.W2(bx,bz),y0??y-.4,y1??y+1.6,msg); } }
  const inset=(pts,d)=>pts.map(([x,z],i)=>{ const a=pts[Math.max(0,i-1)], b=pts[Math.min(pts.length-1,i+1)], tx=b[0]-a[0], tz=b[1]-a[1], l=Math.hypot(tx,tz)||1; return [x+tz/l*d, z-tx/l*d]; });

  /* ============================== 1. VỎ: khối lõi, sàn lồi, mái, cầu thang ngoài, thang máy ============================== */
  for(const V of VEN){ const [Y3,Y2,Y1]=V.Y, YR=V.YR, cafe=V.cafe, deckMat=cafe?MT.teak:MT.marbleK, backMat=cafe?MT.sand:MT.marbleK, sh0=LIFT_X-LHW, sh1=LIFT_X+LHW, shF=V.lzC+1.32, shB=V.lzC-1.32;
    /* sàn khối lõi 3 tầng + mái (chừa giếng thang) */
    V.Y.forEach((y,i)=>{ const yb=i===0?y-1.6:y-.35; if(i===0) addPrism(V,deckMat,CX0,CX1,V.bx,CF,yb,y,{}); else { addPrism(V,deckMat,CX0,sh0,V.bx,CF,yb,y,{}); addPrism(V,deckMat,sh0,sh1,shF,CF,yb,y,{}); addPrism(V,deckMat,sh1,CX1,V.bx,CF,yb,y,{}); } });
    { const rb=x=>V.lzW(x)+.58; addPrism(V,MT.trav,CX0,sh0,rb,CF+.25,YR-.4,YR,{}); addPrism(V,MT.trav,sh0,sh1,shF,CF+.25,YR-.4,YR,{}); addPrism(V,MT.trav,sh1,CX1,rb,CF+.25,YR-.4,YR,{});
      addPrism(V,MT.trav,SX0,CX0,2.0,CF+.25,YR-.4,YR,{}); addPrism(V,MT.trav,SX0,SX1,CF+.25,SZ0+2.2,YR-.4,YR,{}); band(V,MT.gold,[[SX1,CF+.25],[CX1,CF+.25]],YR-.5,YR-.3,()=>false,{top:.06}); }
    /* trần ốp lam gỗ (cafe: óc chó uốn vòm · nhà hàng: hộp trần gỗ gụ) – mặt dưới sàn trên */ for(let i=0;i<3;i++){ const yc=(i<2?V.Y[i+1]:YR)-.36-.02; for(let lx=CX0+.3; lx<CX1-.2; lx+=cafe?.42:1.4){ const bz=V.bx(lx)+.3, L=CF-bz; if(L<1) continue; const p=V.W2(lx,(bz+CF)/2);
        if(cafe){ EI.box(MT.walnut,p[0],yc-.12-.18*Math.sin(Math.PI*(lx-CX0)/(CX1-CX0)),p[1],V.yaw(0,1),.07,.18,L,null); } else { EI.box(MT.mahog,p[0],yc-.16,p[1],V.yaw(0,1),.16,.28,L,null); } } }
    /* vách 2 bên khối lõi (Travertine) + vách sau ốp đá/lam + đèn hắt vách 2700K */
    for(const [x,s] of [[CX0,-1],[CX1,1]]){ addPrism(V,MT.trav,x-(s<0?.35:0),x+(s>0?.35:0),V.bx,CF,Y3-1.6,YR,{}); seg(V.W2(x,V.bx(x)),V.W2(x,CF),Y3-.5,YR-.1,'🧱 Vách khối lõi'); }
    { const pts=[]; for(let x=CX0; x<=CX1+1e-6; x+=1.5) pts.push([x,V.bx(x)+.05]); band(V,backMat,pts,Y3,YR-.36,()=>false); for(let i=0;i<pts.length-1;i++) seg(V.W2(...pts[i]),V.W2(...pts[i+1]),Y3-.5,YR-.5,'⛰️ Vách kè phía sau quán');
      for(const y of V.Y){ band(V,MT.glow,pts.map(([x,z])=>[x,z+.04]),y+.08,y+.16,()=>false); band(V,MT.glow,pts.map(([x,z])=>[x,z+.04]),y+3.85,y+3.95,()=>false); } }
    /* mặt kính khối lõi + 2 cửa 2,6 m mỗi tầng (lx −1 và 8,5) + đố đồng */
    const doorX=[-1,8.5], inDoor=lx=>doorX.some(d=>Math.abs(lx-d)<1.3);
    for(const y of V.Y){ const yt=y+4.1; band(V,MT.glassC,[[CX0,CF],...doorX.flatMap(d=>[[d-1.3,CF],[d+1.3,CF]]),[CX1,CF]],y,yt,(x)=>inDoor(x)); band(V,MT.glassC,doorX.flatMap(d=>[[d-1.3,CF],[d+1.3,CF]]),y+2.7,yt,(x)=>!inDoor(x));
      for(let lx=CX0+1.4; lx<CX1-.5; lx+=2.1){ if(inDoor(lx)) continue; const p=V.W2(lx,CF); EXT.box(MT.bronze,p[0],(y+yt)/2,p[1],V.yaw(0,1),.09,yt-y,.12); }
      for(const d of doorX) for(const e of [-1,1]){ const p=V.W2(d+e*1.3,CF); EXT.box(MT.gold,p[0],y+1.35,p[1],V.yaw(0,1),.14,2.7,.16); }
      band(V,MT.bronze,[[CX0,CF+.02],[CX1,CF+.02]],y+2.7,y+2.78,()=>false);
      const xs=[CX0,...doorX.flatMap(d=>[d-1.3,d+1.3]),CX1]; for(let i=0;i<xs.length;i+=2) seg(V.W2(xs[i],CF),V.W2(xs[i+1],CF),y-.4,y+3.5,'🪟 Vách kính – vào bằng cửa kính'); }
    /* 3 SÀN LỒI bo cong: mặt sàn (Extrude), viền đồng, lan can kính, tay vịn vàng; cột + dầm cong đồng phía dưới */
    V.Y.forEach((y,i)=>{ const D=DECK[i], sh=new THREE.Shape(), ol=outline(D); sh.moveTo(ol[0][0]*V.m,ol[0][1]); for(const [x,z] of ol.slice(1)) sh.lineTo(x*V.m,z); sh.closePath();
      const g=new THREE.ExtrudeGeometry(sh,{depth:.32, bevelEnabled:false, curveSegments:8}); g.rotateX(Math.PI/2); g.translate(0,y,0); EXT.geo(deckMat,g,V.O[0],0,V.O[1],V.pl.yaw); g.dispose();
      const gapF=(x,z)=>(i===0 && Math.abs(x)<1.75 && z>D-.6) || (x<-12.5 && z>SZ0-.05 && z<SZ0+2.25), rp=inset(ol,.12);
      band(V,MT.copper,ol,y-.45,y+.04,gapF,{top:.1}); band(V,MT.glassR,rp,y+.04,y+1.02,gapF); band(V,MT.gold,inset(ol,.08),y+1.0,y+1.07,gapF,{top:.08}); railSegs(V,rp,y,gapF);
      if(i===0){ const sk=inset(ol,.04); band(V,MT.trav,sk,y-1.9,y-.45,(x,z)=>false); railSegs(V,inset(ol,-.05),y,(x,z)=>Math.abs(x)<1.75 && z>D-.6,'🧱 Chân sàn lồi – lên bằng bậc tam cấp giữa',y-3.5,y-.15); }
      /* sàn đứng được: dải 1,5 m theo lx, cắt theo đường bo */ for(let x=-13; x<13-1e-6;){ const cw=Math.abs(x)>13-RC-1.5-1e-6 && Math.abs(x+1.5)>13-RC-1.5-1e-6 && (Math.abs(x)>=13-RC-1e-6 || Math.abs(x+1.5)>=13-RC-1e-6) ? .5 : 1.5, xe=Math.min(13,x+cw), ax=Math.max(Math.abs(x),Math.abs(xe))-.05; let zf=D; if(ax>13-RC) zf=D-RC+Math.sqrt(Math.max(0,RC*RC-(ax-(13-RC))**2)); platRect(V,x,xe,CF-.05,zf,y); x=xe; }   /* 20/11: góc bo chia dải 0,5 m, mép sàn đứng theo mép ngoài dải (trước dải 1,5 m chìa ra ngoài lan can cong) */
      /* dầm cong đồng đỡ sàn (Tầng 2, 1) + cột trên mép sàn Tầng 3 */ if(i>0){ for(let lx=-11.7; lx<=11.71; lx+=3.9){ if(Math.abs(lx)<2.2) continue; const zf=inDeck(lx,D-.6,D)?D-.5:D-1.5, y0=i===1?Y3+.04:V.Y[i-1]+2.6, z0=i===1?DECK[0]-.35:CF+.15, pts=[]; for(let q=0;q<=12;q++){ const t=q/12, z=lerp(z0,zf,t), yy=lerp(y0,y-.35,t)+Math.sin(t*Math.PI)*(i===1?.25:.55); pts.push(new THREE.Vector3(...V.P3(lx,yy,z))); }
          const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.09,6,false); EXT.add(MT.bronze,K.xf(tg,0,0,0)); tg.dispose(); if(i===1){ const p=V.W2(lx,DECK[0]-.35); EXT.cyl(MT.bronze,p[0],(Y3+y)/2,p[1],0,.24,y-Y3,.24); circles.push({x:p[0], z:p[1], r:.16, y0:Y3-.4, y1:y}); } } } });
    /* bậc tam cấp Tầng 3 → bãi cát (giữa mặt trước) */ { const D=DECK[0]; for(let k=1;k<=12;k++){ const z0=D+(k-1)*.3, z1=z0+.32, yt=Y3-.175*k; addPrism(V,MT.sand,-1.7,1.7,z0,z1,yt-1.2,yt,{}); platRect(V,-1.7,1.7,z0,z1,yt); }
      for(const e of [-1,1]){ const a=V.W2(e*1.78,D), b=V.W2(e*1.78,D+3.7); seg(a,b,Y3-2.6,Y3+1.2,'🧱 Tay vịn bậc tam cấp'); band(V,MT.gold,[[e*1.78,D],[e*1.78,D+3.7]],Y3+.9,Y3+.96,()=>false); } }
    /* ---- CẦU THANG NGOÀI 3,4 m: 2 vế gấp khúc mỗi tầng – phía ngoài khối lõi (lx −20,3…−13,3, lz 3,2–11,5; phía kia có quầy bar dừa của phiên A) ---- */
    { const LA=[SX1-3.4,SX1], LB=[SX0,SX0+3.4], ZL=SZ0+2.2, ZM=SZ1-2.2, NS=13, run=(ZM-ZL)/NS, LEDS=[], STP=[], mid=(LA[0]+LB[1])/2;
      const levels=[Y3,Y2,Y1,YR]; for(let L=0;L<3;L++){ const ya=levels[L], yb=levels[L+1], ym=(ya+yb)/2, rise=(ym-ya)/NS;
        platRect(V,SX0,-12.85,SZ0,ZL,ya); /* chiếu nghỉ tầng (chồm 0,45 m lên mép sàn lồi) */ platRect(V,SX0,SX1,ZM,SZ1,ym); /* chiếu nghỉ giữa */
        addPrism(V,MT.teak,SX0,SX1,ZM,SZ1,ym-.3,ym,{}); addPrism(V,MT.teak,SX0,-13.0,SZ0,ZL,ya-(L===0?1.4:.3),ya,{});
        for(let s=0;s<NS;s++){ /* vế 1 (làn trong A) đi ra phía vịnh, vế 2 (làn ngoài B) quay lại */ const za=ZL+s*run; STP.push([LA,za,za+run,ya+rise*(s+1)]); const zb=ZM-(s+1)*run; STP.push([LB,zb,zb+run,ym+rise*(s+1)]); }
        seg(V.W2(SX0-.05,ZL),V.W2(SX0-.05,SZ1),ya-.4,yb+1.6,'🪵 Lan can cầu thang ngoài'); seg(V.W2(mid,ZL),V.W2(mid,ZM),ya-.4,yb+1.6,'🪵 Vách giữa 2 vế thang'); seg(V.W2(SX0,SZ1+.05),V.W2(SX1,SZ1+.05),ym-.4,ym+1.6,'🪵 Lan can chiếu nghỉ');
        seg(V.W2(SX1+.05,ZL),V.W2(SX1+.05,SZ1),ya+.9,yb+1.6,'🪵 Lan can cầu thang ngoài'); }
      { const yb=YR; seg(V.W2(SX0-.05,2.0),V.W2(SX0-.05,ZL),yb-.4,yb+1.6,'🚧 Lan can sân thượng'); seg(V.W2(LA[0]-.05,ZL+.05),V.W2(SX1+.05,ZL+.05),yb-.4,yb+1.6,'🚧 Lan can sân thượng – xuống bằng vế thang phía ngoài');
        seg(V.W2(SX0,2.0),V.W2(CX0,2.0),yb-.4,yb+1.6,'🚧 Lan can sân thượng'); seg(V.W2(SX1+.05,CF+.13),V.W2(SX1+.05,ZL+.05),yb-.4,yb+1.6,'🚧 Lan can sân thượng');
        band(V,MT.glassR,[[CX0,2.0],[SX0,2.0],[SX0,ZL]],yb,yb+1.0); band(V,MT.glassR,[[LA[0],ZL],[SX1,ZL],[SX1,CF+.13],[CX0,CF+.13]],yb,yb+1.0); band(V,MT.gold,[[CX0,2.0],[SX0,2.0],[SX0,ZL]],yb+1.0,yb+1.07,()=>false,{top:.06}); }
      for(const [ln,z0,z1,yt] of STP){ addPrism(V,MT.teak,ln[0],ln[1],z0,z1+.02,yt-.16,yt,{}); platRect(V,ln[0],ln[1],z0,z1,yt); const p=V.W2((ln[0]+ln[1])/2,z0+.02); LEDS.push([p,yt-.03]); }
      for(const [p,y] of LEDS) EI.box(MT.glow,p[0],y,p[1],V.yaw(1,0),.03,.03,3.2,null);
      /* dầm biên + kính + tay vịn đồng bám theo vế thang */ for(const L of [0,1,2]){ const ya=levels[L], yb=levels[L+1], ym=(ya+yb)/2;
        for(const [x,za,zb,y0,y1] of [[SX1,ZL,ZM,ya,ym],[SX0,ZM,ZL,ym,yb]]){ const nn=V.N(x>SX0+1?1:-1,0,0), B=K.Bld(); K.quad(B,V.P3(x,y0+.05,za),V.P3(x,y1+.05,zb),V.P3(x,y1+1.0,zb),V.P3(x,y0+1.0,za),nn); EXT.add(MT.glassR,K.toGeo(B)); const C=K.Bld(); K.quad(C,V.P3(x,y0+1.0,za),V.P3(x,y1+1.0,zb),V.P3(x,y1+1.07,zb),V.P3(x,y0+1.07,za),nn); EXT.add(MT.copper,K.toGeo(C)); const D2=K.Bld(); K.quad(D2,V.P3(x,y0-.45,za),V.P3(x,y1-.45,zb),V.P3(x,y1+.02,zb),V.P3(x,y0+.02,za),nn); EXT.add(MT.bronze,K.toGeo(D2)); } }
      { const sk=[[SX0,SZ0],[SX1,SZ0],[SX1,SZ1],[SX0,SZ1],[SX0,SZ0]]; for(let q=0;q<sk.length-1;q++) seg(V.W2(...sk[q]),V.W2(...sk[q+1]),Y3-4,Y3-.2,'🪵 Gầm cầu thang ngoài'); band(V,MT.bronze,sk,Y3-1.6,Y3-.3,()=>false); }
      for(const [x,z] of [[SX0,SZ1],[SX1,SZ1],[SX0,SZ0],[SX0,(SZ0+SZ1)/2]]){ const p=V.W2(x,z); EXT.cyl(MT.bronze,p[0],(Y3-1+YR)/2,p[1],0,.3,YR-Y3+1,.3); }
      /* 20/11 (phiên A, theo báo lỗi Bình qua phiên chính): lan can va chạm còn thiếu – lưng chiếu nghỉ tầng + mép sau sàn lồi (lx −13…CX0), mép ngoài chiếu nghỉ tầng, gầm vế B ở tầng trệt */
      for(const y of [Y3,Y2,Y1]){ const msg=y===Y3?'🪵 Lan can chiếu nghỉ – đi vòng ra bậc tam cấp':'🪵 Lan can chiếu nghỉ – bên dưới cao '+Math.round(y-Y3+.5)+' m';
        const pl=[[SX0,SZ0-.05],[-13.0,SZ0-.05],[-13.0,CF-.05],[CX0,CF-.05]]; for(let q=0;q<pl.length-1;q++) seg(V.W2(...pl[q]),V.W2(...pl[q+1]),y-.4,y+1.6,msg);
        seg(V.W2(SX0-.05,SZ0-.05),V.W2(SX0-.05,ZL),y-.4,y+1.6,msg); band(V,MT.glassR,[[SX0,ZL],[SX0,SZ0-.05],[-13.0,SZ0-.05],[-13.0,CF-.05],[CX0,CF-.05]],y+.02,y+1.0); band(V,MT.gold,[[SX0,ZL],[SX0,SZ0-.05],[-13.0,SZ0-.05]],y+1.0,y+1.07,()=>false,{top:.06}); }
      seg(V.W2(SX0,ZL+.05),V.W2(mid,ZL+.05),Y3-.4,Y3+1.6,'🪵 Gầm cầu thang ngoài – lên bằng vế bên trong'); }
    /* lan can mái + sân thượng (kính) – chừa lối sang chiếu nghỉ cầu thang ngoài (lx < −8, lz 2–3,25) */ band(V,MT.glassR,[[CX0+.2,V.lzW(CX0)+.6],[CX0+.2,2.0]],YR,YR+1.0); band(V,MT.glassR,[[CX0,CF+.13],[CX1,CF+.13]],YR,YR+1.0); band(V,MT.gold,[[SX1,CF+.13],[CX1,CF+.13]],YR+1.0,YR+1.07,()=>false,{top:.06});
    seg(V.W2(CX0+.2,V.lzW(CX0)+.6),V.W2(CX0+.2,2.0),YR-.4,YR+1.6,'🚧 Lan can sân thượng'); seg(V.W2(CX1+.05,V.lzW(CX1)+.45),V.W2(CX1+.05,CF+.13),YR-.4,YR+1.6,'🚧 Lan can sân thượng'); band(V,MT.glassR,[[CX1,V.lzW(CX1)+.45],[CX1,CF+.13]],YR,YR+1.0);   /* 20/11: mép mái cuối khối lõi (lx CX1) */
    for(const y of [V.Y[1],V.Y[2],YR]) for(const x of [LIFT_X-LHW,LIFT_X+LHW]) seg(V.W2(x,V.bx(x)),V.W2(x,V.lzC+1.32),y-.4,y+2.2,'⇅ Vách giếng thang kính');   /* 20/11: khe 0,35 m 2 bên dãy thang (lỗ sàn rộng hơn 2 cabin) */ seg(V.W2(SX1,CF+.13),V.W2(CX1,CF+.13),YR-.4,YR+1.6,'🚧 Lan can sân thượng – xuống quán bằng thang máy kính / cầu thang phía ngoài');
    /* biển tên lớn trên mép mái nhìn ra vịnh */ { const uv=ATL.cell(0,V.cafe?0:128,1024,128,V.cafe?'CLIFFSIDE ARTISAN ROASTERY':'LE PALAIS DE L\'ABYSSE',V.cafe?'& BOTANICAL LOUNGE · CAFE 3 TẦNG':'NHÀ HÀNG 5 SAO · FINE DINING 3 TẦNG',{fs:52}), sp=signGeo(uv,14,1.75), p=V.W2(2.5,CF+.3); EXT.geo(ATL.mat,sp,p[0],YR+1.95,p[1],V.yaw(0,1)); sp.dispose();
      for(const e of [-6.4,6.4]){ const q=V.W2(2.5+e,CF+.2); EXT.box(MT.bronze,q[0],YR+1.45,q[1],V.yaw(0,1),.1,2.9,.1); } }
    /* cổng trên (khe lan can kè – vỉa hè +16): khung vòm vàng + biển */ { const gx=[.6,4.4], z=V.lzW(2.5)-.1; for(const x of gx){ const p=V.W2(x,V.lzW(x)+.2); EXT.cyl(MT.gold,p[0],YR+1.5,p[1],0,.22,3,.22); circles.push({x:p[0], z:p[1], r:.14, y0:YR-.5, y1:YR+3}); }
      const pts=[]; for(let i=0;i<=16;i++){ const t=i/16*Math.PI; pts.push(new THREE.Vector3(...V.P3(2.5-Math.cos(t)*1.9,YR+3+Math.sin(t)*.9,z+.3))); } const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.08,6,false); EXT.add(MT.gold,K.xf(tg,0,0,0)); tg.dispose();
      const uv=ATL.cell(V.cafe?0:512,256,512,128,V.cafe?'☕ CAFE · LỐI XUỐNG':'🍽️ NHÀ HÀNG 5 SAO',V.cafe?'3 tầng · thang máy kính':'Le Palais de l\'Abysse',{fs:44}), sp=signGeo(uv,3.2,.8), p=V.W2(2.5,z+.32); EXT.geo(ATL.mat,sp,p[0],YR+3.3,p[1],V.yaw(0,-1)); EXT.geo(ATL.mat,sp,p[0],YR+3.3,p[1],V.yaw(0,1)); sp.dispose(); }
    /* sàn đứng được: khối lõi 3 tầng + mái (dải 1,5 m, chừa giếng thang) */
    for(const y of [...V.Y,YR]){ const roof=y===YR; for(let x=CX0; x<CX1-1e-6; x+=1.5){ const xe=Math.min(CX1,x+1.5), bk=roof?Math.min(V.lzW(x),V.lzW(xe))-.35:Math.max(V.bx(x),V.bx(xe)); if(y!==Y3 && xe>sh0 && x<sh1){ const a0=Math.max(x,sh0), a1=Math.min(xe,sh1); platRect(V,a0,a1,shF,CF+(roof?.25:0),y); if(a0>x+.01) platRect(V,x,a0,bk,CF+(roof?.25:0),y); if(a1<xe-.01) platRect(V,a1,xe,bk,CF+(roof?.25:0),y); continue; } platRect(V,x,xe,bk,CF+(roof?.25:0),y); } }   /* 20/11: dải 1,5 m chạm giếng thang chỉ khoét đúng phần giếng (trước hở cả dải → rơi) */
    platRect(V,SX0,CX0+.2,2.0,CF+.25,YR); platRect(V,SX0,SX1,CF+.2,SZ0+2.2,YR);
    /* THANG MÁY KÍNH (2 cabin, cửa nhìn ra vịnh) */ { const c=V.W2(LIFT_X,V.lzC); V.lifts=makeLiftBank(W,{x:c[0], z:c[1], yaw:V.yaw(0,1), count:2, name:V.cafe?'Thang kính Cafe':'Thang kính Nhà hàng', color:0xd4af37,
        floors:[{y:Y3, name:'Tầng 3 · bãi cát', short:'3'},{y:Y2, name:V.cafe?'Tầng 2 · Lounge sách':'Tầng 2 · Bếp Teppanyaki', short:'2'},{y:Y1, name:V.cafe?'Tầng 1 · Quầy bar 14 m':'Tầng 1 · Phòng ăn chính', short:'1'},{y:YR, name:'Sân thượng · vỉa hè +16', short:'★'}]}); }
    /* nhãn */ { const p=V.W2(2.5,8); makeLabel(V.cafe?'☕ Cliffside Artisan Roastery':'🍽️ Le Palais de l\'Abysse', V.cafe?'Cafe 3 tầng tựa kè · sàn lồi ngắm vịnh · cửa trên ở vỉa hè +16, cửa dưới ở bãi cát':'Nhà hàng 5 sao 3 tầng · hầm rượu · bếp Teppanyaki · cửa trên ở vỉa hè +16', {h:.6, x:p[0], y:YR+6, z:p[1], fade:160}); }
  }

  /* ============================== 2. ĐỒ NGOÀI TRỜI (InstancedMesh, luôn hiện): bàn, ghế, dù, đèn bàn, hoa giấy, Monstera ============================== */
  const UMB=[];
  for(const V of VEN){ const [Y3,Y2,Y1]=V.Y, YR=V.YR, cafe=V.cafe, r=rng(V.m>0?71:72);
    const table=(lx,lz,y,umb)=>{ const p=V.W2(lx,lz); if(cafe){ EI.cyl(MT.paint,p[0],y+.74,p[1],0,.86,.05,.86,0x6a6a62); EI.cyl(MT.copper,p[0],y+.37,p[1],0,.08,.72,.08,null); EI.cyl(MT.copper,p[0],y+.73,p[1],0,.9,.03,.9,null); }
        else { EI.cyl(MT.paint,p[0],y+.75,p[1],0,1.05,.04,1.05,0xe8dcc4); EI.cyl(MT.paint,p[0],y+.6,p[1],0,1.1,.28,1.1,0x6a1420); EI.cyl(MT.gold,p[0],y+.37,p[1],0,.1,.72,.1,null); }
      EI.sph(MT.glow,p[0],y+.86,p[1],0,.13,.16,.13,null); EI.cyl(MT.paint,p[0]+.18,y+.85,p[1],0,.09,.2,.09,cafe?0x3f6f8a:0xd4af37);   /* đèn bàn / bình hoa */
      const seats=[]; for(const e of [-1,1]){ const q=V.W2(lx+e*.78,lz); EI.box(MT.paint,q[0],y+.45,q[1],V.yaw(-e,0),.46,.08,.46,cafe?0x8a6a44:0x5a1e28); EI.box(MT.paint,q[0]+(V.R[0]*e*.22),y+.85,q[1]+(V.R[1]*e*.22),V.yaw(-e,0),.46,.75,.06,cafe?0x6a4a2a:0x3a2a20);
        for(const de of [-.18,.18]) EI.cyl(MT.dark,q[0]+V.F[0]*de,y+.22,q[1]+V.F[1]*de,0,.04,.44,.04,null); seats.push({x:q[0], z:q[1], y:y+.47, face:V.yaw(-e,0), floor:y}); }
      circles.push({x:p[0], z:p[1], r:.48, y0:y-.4, y1:y+1}); const T={x:p[0], z:p[1], y, seats, umb:!!umb}; V.tables.push(T);
      if(W.addBench) for(const s of seats) W.addBench({x:s.x, z:s.z, rot:s.face, len:.6, y:s.y, floor:y, label:cafe?'☕ Ngồi bàn cafe ngắm vịnh (E · C)':'🍽️ Ngồi bàn nhà hàng 5 sao (E · C)'});
      if(umb) UMB.push([p[0],y,p[1],cafe]); return T; };
    /* Tầng 1 (trên): 2 hàng × 7 bàn có dù · Tầng 2: 2 × 5 · Tầng 3: 6 · sân thượng: 2 (có dù) → cafe 32 bàn, 16 dù */
    for(const z of [6.3,9.9]) for(let q=0;q<7;q++) table(-11.1+q*3.7,z,Y1,cafe || q%2===0);
    for(const z of [6.1,8.7]) for(let q=0;q<5;q++) table(-10+q*5,z,Y2,false);
    for(const x of [-11.5,-7.5,-4,4,7.5,11.5]) table(x,6.2,Y3,false);
    for(const x of [5,9.2]) table(x,.9,YR,true);
    /* Monstera + cây xanh (30 chậu cafe), hoa giấy rủ mép lan can (cafe) / hộp hoa đỏ–vàng (nhà hàng) */
    const plantSpots=[]; V.Y.forEach((y,i)=>{ for(const x of [-12.2,12.2]) plantSpots.push([x,CF+.6,y]); for(const x of [-6.5,-2.2,4.6,10.6]) plantSpots.push([x,CF+.55,y]); }); for(const x of [-6,0,11]) plantSpots.push([x,1.5,YR]);
    for(let q=0;q<(cafe?27:12);q++){ const [x,z,y]=plantSpots[q%plantSpots.length]; const p=V.W2(x+(q>=plantSpots.length?.8:0),z); EI.cyl(MT.pot,p[0],y+.3,p[1],0,.6,.6,.6,null); EI.ico(MT.green,p[0],y+1.05,p[1],r()*TAU,1.2,1.1,1.2,null); if(cafe) EI.ico(MT.green,p[0]+.2,y+1.6,p[1],0,.7,.6,.7,null); }
    if(!LOW) V.Y.forEach((y,i)=>{ const ol=outline(DECK[i]); for(let j=0;j<ol.length-1;j++){ const [ax,az]=ol[j], [bx,bz]=ol[j+1], L=Math.hypot(bx-ax,bz-az); for(let t=.3; t<L; t+=.9){ const lx=ax+(bx-ax)*t/L, lz=az+(bz-az)*t/L; if(lx<-12.5 && lz<SZ0+2.4) continue; const p=V.W2(lx,lz);
        EI.ico(MT.paint,p[0],y+1.0-r()*.3,p[1],r()*TAU,.5,.35,.5,cafe?(r()<.5?0xc2185b:0xe0408a):(r()<.5?0x8e1b22:0xd4af37)); if(cafe && r()<.6) EI.ico(MT.paint,p[0],y-.2-r()*.6,p[1],0,.32,.7,.32,0xc2185b); } } });
  }
  { const V=VEN[1], y=V.Y[2]; for(const x of [-.6,3.4,7.4,11.3]){ const z=1.0, p=V.W2(x,z); circles.push({x:p[0], z:p[1], r:.75, y0:y-.4, y1:y+1});
      const seats=[-1,1].map(e=>{ const q2=V.W2(x+e*.85,z); return {x:q2[0], z:q2[1], y:y+.5, face:V.yaw(-e,0), floor:y}; }); if(W.addBench) for(const st of seats) W.addBench({x:st.x, z:st.z, rot:st.face, len:.6, y:st.y, floor:y, label:'🍽️ Ngồi bàn phòng ăn chính (E · C)'});
      V.tables.push({x:p[0], z:p[1], y, seats, indoor:true, lx:x, lz:z}); } }
  /* dù gỗ 8 cánh Ø 3,6 m (cafe: kem – xanh rêu viền tua vàng; nhà hàng: đỏ – vàng Hoàng gia) */
  for(const [x,y,z,cafe] of UMB){ EI.cyl(MT.walnut,x,y+1.35,z,0,.07,2.7,.07,null); EI.cone(MT.fabric,x,y+2.72,z,TAU/16,3.6,.75,3.6,cafe?0xe6d6b4:0x8e1b22); EI.cone(MT.fabric,x,y+2.73,z,TAU/16,3.0,.6,3.0,cafe?0x3f5f3a:0xd4af37);
    EI.cyl(MT.gold,x,y+2.36,z,0,3.62,.08,3.62,null); EI.sph(MT.gold,x,y+3.12,z,0,.12,.12,.12,null); }
  /* khung vòm Pergola đồng uốn hoa văn (nhà hàng, sàn lồi Tầng 1) */ { const V=VEN[1], y=V.Y[2]; for(const lx of [-7.4,0,7.4]){ const pts=[]; for(let i=0;i<=16;i++){ const t=i/16*Math.PI; pts.push(new THREE.Vector3(...V.P3(lx,y+Math.sin(t)*3.2,CF+.4+(1-Math.cos(t))*.5*(DECK[2]-1-CF)))); }
      const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.07,6,false); EXT.add(MT.copper,K.xf(tg,0,0,0)); tg.dispose(); } }

  EXT.build(root,{name:'aby-dining-ext', cast:true, dynamic:false}); EI.build(root,{name:'aby-dining-ext-inst', cast:false});

  /* ============================== 3. NỘI THẤT LÕI + NPC (dựng khi lại gần ≤ 60 m) ============================== */
  function buildNear(V){ if(V.near.built) return; V.near.built=true; const g=new THREE.Group(); g.name='aby-dining-near-'+V.k; root.add(g); V.near.g=g; const B=K.Batch(), E=K.Emit(), [Y3,Y2,Y1]=V.Y, cafe=V.cafe, r=rng(V.m>0?81:82);
    const box=(m,lx,y,lz,sx,sy,sz,fu=0,fv=1,col)=>{ const p=V.W2(lx,lz); E.box(m,p[0],y,p[1],V.yaw(fu,fv),sx,sy,sz,col); };
    const cyl=(m,lx,y,lz,sx,sy,sz,col)=>{ const p=V.W2(lx,lz); E.cyl(m,p[0],y,p[1],0,sx,sy,sz,col); };
    const geo=(m,g2,lx,y,lz,fu=0,fv=1,s=1)=>{ const p=V.W2(lx,lz); B.geo(m,g2,p[0],y,p[1],V.yaw(fu,fv),s,s,s); };
    const rug=(lx,lz,y,w,d)=>{ const pg=new THREE.PlaneGeometry(w,d); pg.rotateX(-Math.PI/2); geo(MT.rug,pg,lx,y+.012,lz); };
    const bz=x=>V.bx(x)+.25;
    if(cafe){ /* ---- CAFE ---- */
      /* TẦNG 1 (+11,5): quầy bar 14 m đá nâu vân vàng, 2 máy espresso đồng, máy xay, tháp cold brew, tủ bánh, kệ quầy sau */ { const y=Y1, z=bz(6)+2.2; seg(V.W2(-1.5,z+.45),V.W2(12.5,z+.45),y-.4,y+1.3,'☕ Quầy bar 14 m – gọi đồ ở mặt quầy (E)'); seg(V.W2(-1.5,z-.5),V.W2(-1.5,z+.45),y-.4,y+1.3,'☕ Quầy bar'); box(MT.marbleB,5.5,y+.55,z,14,1.1,.8); box(MT.marbleB,5.5,y+1.13,z,14.3,.06,1.0); box(MT.gold,5.5,y+.1,z+.41,14,.06,.04);
        for(const x of [1.5,4.3]){ geo(MT.copper,lathe([[0,0],[.28,0],[.3,.06],[.26,.42],[.22,.5],[.12,.62],[.06,.7],[0,.72]],18),x,y+1.16,z-.1); cyl(MT.dark,x,y+1.25,z+.32,.06,.08,.18); }
        geo(MT.chrome,lathe([[0,0],[.1,0],[.12,.3],[.08,.34],[.16,.52],[0,.6]],14),7,y+1.16,z-.1);
        for(let q=0;q<3;q++){ geo(MT.glassR,lathe([[0,0],[.14,0],[.16,.12],[.12,.34],[.04,.42],[0,.44]],12),9+q*.02,y+1.16+q*.5,z-.15); } cyl(MT.bronze,9,y+1.9,z-.15,.04,1.5,.04);
        box(MT.glassR,11.5,y+1.5,z-.1,2.2,.7,.6); for(let q=0;q<10;q++) E.sph(MT.paint,...(()=>{ const p=V.W2(10.6+q*.2,z-.1); return [p[0],y+1.3+(q%2)*.3,p[1]]; })(),0,.14,.08,.14,[0xd9a066,0xb5652a,0xf2d29c,0xe07a9a,0x6a3f2a][q%5]);
        for(let lv=0;lv<3;lv++){ box(MT.walnut,5.5,y+1.7+lv*.7,bz(5.5)+.25,12,.05,.4); box(MT.glow,5.5,y+1.72+lv*.7,bz(5.5)+.43,12,.02,.04); for(let q=0;q<16;q++) box(MT.paint,-.2+q*.75,y+1.88+lv*.7,bz(-.2+q*.75)+.25,.14,.3,.14,0,1,[0x6a3f2a,0x3a5a3a,0xd4af37,0x8a4a26][(q+lv)%4]); }
        INTER.push({x:V.W2(5.5,z+1.4)[0], z:V.W2(5.5,z+1.4)[1], r:3.4, prio:.85, when:()=>Math.abs(P.y-y)<1.5, label:'☕ Gọi đồ ở quầy bar 14 m – Cliffside Roastery (E)', action:()=>openMenu(V)}); }
      /* Grand Piano + sofa da Cognac chần nút + ghế Thonet + thảm Ba Tư + kệ sách sát trần (Tầng 1 + Tầng 2) */
      { const y=Y2; rug(7.2,.5,y,4.4,3.0); for(const [x,z,fu,fv] of [[7.2,-.9,0,1],[4.6,.6,1,0]]){ box(MT.paint,x,y+.4,z,fu?2.2:3.2,.8,.95,fu,fv,0x8a4a26); const p=V.W2(x-fu*.4,z-fv*.4); E.box(MT.paint,p[0],y+.82,p[1],V.yaw(fu,fv),fu?2.2:3.2,.85,.22,0x6e3a1e); }
        cyl(MT.walnut,7.4,y+.42,.7,.9,.06,.9); for(const [x,z] of [[1.6,1.6],[2.6,2.2],[.4,2.0]]){ box(MT.dark,x,y+.45,z,.42,.06,.42,0,-1,0x2a1a10); box(MT.dark,x,y+.9,z-.2,.42,.8,.05,0,-1,0x2a1a10); } cyl(MT.walnut,1.5,y+.72,2.3,.7,.05,.7);
        box(MT.walnut,CX1-.5,y+2.05,-1.6,4.6,4.0,.4,-1,0); for(let lv=0;lv<6;lv++) for(let q=0;q<14;q++) box(MT.paint,CX1-.62,y+.4+lv*.66,-3.6+q*.3,.18,.42+r()*.12,.22,-1,0,[0x8e1b22,0x1f3a5f,0x3f5f3a,0xd4af37,0x6a3f2a,0xd9c9a6][(q+lv)%6]);
        seg(V.W2(CX1-.75,-3.9),V.W2(CX1-.75,.7),y-.4,y+3,'📚 Kệ sách sát trần');
        if(W.addBench){ const p=V.W2(7.2,-.45); W.addBench({x:p[0], z:p[1], rot:V.yaw(0,1), len:2.6, y:y+.47, floor:y, label:'🛋️ Ngồi sofa da Cognac chần nút (E · C)'}); } circles.push({x:V.W2(7.4,.7)[0], z:V.W2(7.4,.7)[1], r:.5, y0:y-.4, y1:y+.8}); }
      { const y=Y1, p=[11.3,1.4]; box(MT.dark,p[0],y+.85,p[1],1.5,.3,2.0,0,1,0x0c0c0e); for(const [dx,dz] of [[-.6,-.8],[.6,-.8],[0,.8]]) cyl(MT.dark,p[0]+dx,y+.4,p[1]+dz,.1,.8,.1,0x0c0c0e); box(MT.paint,p[0],y+1.02,p[1]-.95,1.4,.04,.16,0,1,0xf0e8d8);
        const c=V.W2(...p); circles.push({x:c[0], z:c[1], r:1.1, y0:y-.4, y1:y+1.2}); INTER.push({x:c[0], z:c[1], r:2.6, prio:.6, when:()=>Math.abs(P.y-y)<1.5, label:'🎹 Đánh thử Grand Piano (E)', action:()=>toast('🎹 Bạn dạo một đoạn nhạc jazz – cả quán vỗ tay! Tiếng đàn hoà cùng tiếng sóng vịnh.', 3200)}); }
      /* Tầng 3 (+2,5): quầy bánh mang đi + bàn đứng */ { const y=Y3, z=bz(6)+1.6; seg(V.W2(3,z+.4),V.W2(9,z+.4),y-.4,y+1.3,'🧁 Quầy bánh mang đi'); box(MT.marbleB,6,y+.5,z,6,1.0,.7); box(MT.glassR,6,y+1.3,z-.05,6,.6,.5); for(let q=0;q<12;q++){ const p=V.W2(3.3+q*.48,z-.05); E.sph(MT.paint,p[0],y+1.12,p[1],0,.16,.1,.16,[0xd9a066,0xb5652a,0xf2d29c,0xe07a9a][q%4]); } }
    } else { /* ---- NHÀ HÀNG ---- */
      /* TẦNG 3 (+2,5): HẦM RƯỢU gỗ sồi 600 chai hổ phách + bàn tiệc Hoàng gia 12 ghế + đèn chùm pha lê 3,5 m */ { const y=Y3;
        for(let q=0;q<5;q++){ const x=-.9+q*3, z=bz(x)+.35; box(MT.walnut,x,y+1.75,z,2.9,3.5,.5); for(let lv=0;lv<10;lv++) for(let c2=0;c2<12;c2++){ const p=V.W2(x-1.32+c2*.24,z+.28); E.cyl(MT.amber,p[0],y+.3+lv*.33,p[1],0,.08,.3,.08,null); } }
        /* bàn tiệc 12 ghế đặt lệch phải (lx 1,2–7,2): cửa kính lx −1 đi thẳng tới thang máy không vướng */ const BX=4.2, BZ=0, BL=6.0;
        box(MT.mahog,BX,y+.75,BZ,BL,.08,1.6); box(MT.paint,BX,y+.8,BZ,BL+.1,.02,1.7,0,1,0xe8dcc4); box(MT.paint,BX,y+.805,BZ,BL+.1,.02,.5,0,1,0x6a1420); for(const dx of [-BL/2+.4,BL/2-.4]) box(MT.mahog,BX+dx,y+.37,BZ,.3,.74,1.2);
        for(let q=0;q<5;q++) for(const e of [-1,1]){ const x=BX-2.32+q*1.16, z=BZ+e*1.15; box(MT.bordeaux,x,y+.48,z,.5,.1,.5,0,-e); box(MT.mahog,x,y+1.0,z+e*.23,.5,1.1,.08,0,-e); }
        for(const e of [-1,1]){ box(MT.bordeaux,BX+e*(BL/2+.3),y+.48,BZ,.5,.1,.5,-e,0); box(MT.mahog,BX+e*(BL/2+.55),y+1.0,BZ,.5,1.1,.08,-e,0); }
        { const c=V.W2(BX,BZ), yC=y+3.6; B.geo(MT.gold,new THREE.TorusGeometry(1.75,.07,8,48),c[0],yC,c[1],0,1,1,1,Math.PI/2); B.geo(MT.gold,new THREE.TorusGeometry(1.1,.06,8,40),c[0],yC-.8,c[1],0,1,1,1,Math.PI/2);
          for(const [rr,yy,n] of [[1.75,yC-.3,30],[1.1,yC-1.1,20],[.5,yC-1.7,12]]) for(let q=0;q<n;q++){ const a=q/n*TAU; E.ico(MT.crystal,c[0]+Math.cos(a)*rr,yy-(q%2)*.2,c[1]+Math.sin(a)*rr,0,.07,.18,.07); } E.sph(MT.glow,c[0],yC-.7,c[1],0,.6,.6,.6); }
        { const a=V.W2(BX-BL/2-.5,BZ-.85), b=V.W2(BX+BL/2+.5,BZ-.85), c=V.W2(BX+BL/2+.5,BZ+.85), d=V.W2(BX-BL/2-.5,BZ+.85); for(const [p,q] of [[a,b],[b,c],[c,d],[d,a]]) seg(p,q,y-.4,y+1,'🍷 Bàn tiệc Hoàng gia 12 ghế'); }
        INTER.push({x:V.W2(4,bz(4)+1.8)[0], z:V.W2(4,bz(4)+1.8)[1], r:3, prio:.6, when:()=>Math.abs(P.y-y)<1.5, label:'🍷 Nếm rượu vang hầm gỗ sồi – 60 💰 (E)', action:()=>pay(60,'🍷 Một ly vang đỏ hầm gỗ sồi 12 năm',()=>{ buffMin('energy',8); toast('🍷 Hương mận chín, gỗ sồi và vani – ⚡ thư thái thêm 8 phút!', 3200); })}); }
      /* TẦNG 2 (+7,0): BẾP MỞ TEPPANYAKI – 3 bàn thép nóng, quầy ngồi, hút mùi đồng, lửa áp chảo */ { const y=Y2; V.flames=[];
        for(let q=0;q<3;q++){ const x=q*4.8, z=bz(x)+1.9; box(MT.marbleK,x,y+.45,z,3.6,.9,1.2); box(MT.chrome,x,y+.93,z,3.2,.05,.9); box(MT.copper,x,y+3.3,z-.2,2.6,.5,1.4); box(MT.marbleK,x,y+.5,z+1.35,4,1.0,.5); box(MT.gold,x,y+1.02,z+1.35,4.1,.04,.6);
          for(let s2=0;s2<4;s2++){ const p=V.W2(x-1.4+s2*.95,z+2.1); E.cyl(MT.bordeaux,p[0],y+.72,p[1],0,.42,.08,.42); E.cyl(MT.gold,p[0],y+.36,p[1],0,.06,.72,.06); }
          const fl=new THREE.Mesh(new THREE.ConeGeometry(.22,.7,10,1,true),MT.flame); const p=V.W2(x+.3,z); fl.position.set(p[0],y+1.3,p[1]); fl.userData.dynamic=true; g.add(fl); V.flames.push(fl);
          const a=V.W2(x-2,z+1.65), b=V.W2(x+2,z+1.65); seg(a,b,y-.4,y+1.1,'🔥 Quầy Teppanyaki – ngồi ghế quầy để xem đầu bếp'); }
        INTER.push({x:V.W2(4.8,bz(4.8)+4.4)[0], z:V.W2(4.8,bz(4.8)+4.4)[1], r:3.2, prio:.8, when:()=>Math.abs(P.y-y)<1.5, label:'🔥 Gọi Wagyu Teppanyaki áp chảo (E)', action:()=>openMenu(V,'teppan')}); }
      /* TẦNG 1 (+11,5): phòng ăn chính – bàn khăn lụa kép, đĩa sứ viền vàng, ly pha lê, chân nến 3 nhánh; quầy đón khách */ { const y=Y1;
        for(const T of V.tables){ if(!T.indoor) continue; const x=T.lx, z=T.lz; box(MT.paint,x,y+.74,z,1.3,.04,1.3,0,1,0xe8dcc4); box(MT.paint,x,y+.72,z,1.36,.3,1.36,0,1,0x6a1420); for(const e of [-1,1]){ box(MT.bordeaux,x+e*.85,y+.48,z,.5,.1,.5,-e,0); box(MT.mahog,x+e*1.08,y+1.0,z,.5,1.1,.08,-e,0); } }
        box(MT.marbleK,9.5,y+.55,bz(9.5)+1.2,3,1.1,.7); seg(V.W2(8,bz(9.5)+1.6),V.W2(11,bz(9.5)+1.6),y-.4,y+1.3,'🎩 Quầy đón khách'); INTER.push({x:V.W2(9.5,bz(9.5)+2.4)[0], z:V.W2(9.5,bz(9.5)+2.4)[1], r:3, prio:.85, when:()=>Math.abs(P.y-y)<1.5, label:'🍽️ Đặt bàn – thực đơn Le Palais de l\'Abysse (E)', action:()=>openMenu(V)}); }
      /* đĩa sứ viền vàng + ly pha lê + chân nến 3 nhánh cho mọi bàn (cả sàn lồi) */ const plateG=lathe([[0,0],[.12,0],[.13,.01],[.14,.02],[0,.02]],20), glassG=lathe([[0,0],[.035,0],[.006,.02],[.006,.1],[.04,.14],[.045,.21],[0,.19]],12);
      for(const T of V.tables){ const p=[T.x,T.z]; for(const s of T.seats){ const dx=(p[0]-s.x)*.45, dz=(p[1]-s.z)*.45; E.cyl(MT.paint,s.x+dx,T.y+.77,s.z+dz,0,.32,.02,.32,0xf0e6d2); E.cyl(MT.gold,s.x+dx,T.y+.765,s.z+dz,0,.34,.01,.34,null); B.geo(MT.glassR,glassG,s.x+dx*1.5+.12,T.y+.76,s.z+dz*1.5,0); }
        E.cyl(MT.gold,p[0],T.y+.95,p[1],0,.04,.4,.04,null); for(const a of [0,2.1,4.2]) E.sph(MT.glow,p[0]+Math.cos(a)*.14,T.y+1.2,p[1]+Math.sin(a)*.14,0,.05,.09,.05,null); }
    }
    /* chậu cây trong lõi + đèn thả */ for(const y of V.Y) for(const x of [.4,CX1-1]){ const p=V.W2(x,CF-.8); E.cyl(MT.pot,p[0],y+.35,p[1],0,.7,.7,.7); E.ico(MT.green,p[0],y+1.3,p[1],0,1.3,1.6,1.3,null); }
    for(const y of V.Y) for(let x=CX0+2; x<CX1-1; x+=3.5){ const p=V.W2(x,1.2); E.sph(MT.glow,p[0],y+3.4,p[1],0,.36,.36,.36); E.cyl(MT.bronze,p[0],y+3.85,p[1],0,.02,.8,.02); }
    B.build(g,{name:'aby-dining-near'}); E.build(g,{name:'aby-dining-near-inst'});
    /* NPC */ const add=(seed,outfit,name,lx,lz,y,fu,fv,pose,hat)=>{ const n=K.npc(seed,outfit,name,'#ffd27a'); if(!n) return null; const p=V.W2(lx,lz); n.a.g.position.set(p[0],y,p[1]); n.a.g.rotation.y=V.yaw(fu,fv); n.pose=pose; n.work=true; g.add(n.a.g); V.people.push(n); K.animate(n,0,P);
        if(hat){ const h=new THREE.Mesh(new THREE.CylinderGeometry(.13,.11,.32,14),new THREE.MeshStandardMaterial({color:0xf0e8da, roughness:.8})); h.position.y=(n.a.h||1.75)+.08; n.a.g.add(h); } circles.push({x:p[0], z:p[1], r:.32, y0:y-.4, y1:y+2}); return n; };
    if(cafe){ const z=bz(6)+1.4; add(7101,{shirt:0x2a1a10, pants:0x1c1c22, long:true},'☕ Barista',2.6,z,Y1,0,1,'present'); add(7102,{shirt:0x3f5f3a, pants:0x1c1c22, long:true},'☕ Barista',8.2,z,Y1,0,1,'present'); add(7103,{shirt:0xd9c9a6, pants:0x2a2a30},'🧁 Thợ bánh',6,bz(6)+.9,Y3,0,1,'present'); }
    else { for(let q=0;q<3;q++) add(7201+q,{shirt:0xf0e8da, pants:0x1c1c22, long:true},'👨‍🍳 Đầu bếp Teppanyaki',q*4.8,bz(q*4.8)+1.1,Y2,0,1,'present',true); add(7210,{shirt:0x1c1c1c, pants:0x1c1c1c, long:true},'🍷 Sommelier',4,bz(4)+1.2,Y3,0,1,'present'); add(7211,{shirt:0x5a1e28, pants:0x1c1c22, long:true},'🎩 Quản lý sảnh',9.5,bz(9.5)+.4,Y1,0,1,'present'); }
  }
  function buffMin(id,min){ S.buffs=S.buffs||{}; S.buffs[id]=Math.max(Date.now(),S.buffs[id]||0)+min*60000; save(); }
  function pay(cost, what, go){ if(askPay) askPay(cost, what, ()=>{ if(spend && !spend(cost)) return; go(); }); else go(); }
  const MENU={ cafe:[['☕ Espresso rang mộc',15,'coffee',5],['🥛 Cappuccino hạt Arabica',20,'coffee',6],['🧊 Cold brew tháp thuỷ tinh',25,'coffee',8],['🥐 Croissant bơ Pháp',18,'energy',5],['🍰 Tiramisu nhà làm',30,'energy',6],['🌈 Hộp macaron 6 vị',25,'energy',5]],
    rest:[['🥩 Wagyu A5 Teppanyaki',180,'energy',15],['🦞 Tôm hùm nướng bơ tỏi',150,'energy',12],['🍽️ Set tasting 7 món',350,'energy',25],['🍷 Vang đỏ hầm gỗ sồi (ly)',60,'energy',8],['🍮 Crème brûlée vani',40,'energy',6]],
    teppan:[['🔥 Wagyu A5 áp chảo bốc lửa',180,'energy',15],['🦐 Tôm sú Teppanyaki',90,'energy',10],['🍚 Cơm chiên tỏi bơ',35,'energy',6]] };
  function openMenu(V, which){ const key=which||V.k, L=MENU[key], U=ui(); if(!U || !U.modal){ const [n,p,b,mn]=L[0]; pay(p,n,()=>{ buffMin(b,mn); toast(`${n} – ngon tuyệt!`,2600); }); return; }
    const m=U.modal(V.cafe?'☕ Cliffside Artisan Roastery – thực đơn':key==='teppan'?'🔥 Bếp mở Teppanyaki':'🍽️ Le Palais de l\'Abysse – thực đơn');
    m.body.innerHTML=`<div style="opacity:.8;margin-bottom:10px">${V.cafe?'Rang mộc tại chỗ · ngồi bất kỳ bàn nào trên 3 sàn lồi ngắm vịnh':'Nhà hàng 5 sao · khăn lụa kép, đĩa sứ viền vàng · phục vụ tận bàn'}</div>`+K.cards(L.map(([n,p,b,mn])=>({name:n, tag:`${b==='coffee'?'☕ tỉnh táo':'⚡ khoẻ'} ${mn} phút`, price:p})),fmt,'Gọi món');
    m.body.querySelectorAll('[data-i]').forEach(bt=>bt.onclick=()=>{ const [n,p,b,mn]=L[+bt.dataset.i]; m.close(); pay(p,`${n} – ${V.name}`,()=>{ buffMin(b,mn); S.abyDine=(S.abyDine||0)+1; save(); toast(`${n} đã lên bàn – ngon tuyệt! (${b==='coffee'?'☕':'⚡'} ${mn} phút)`, 3200); }); }); }

  /* ============================== 4. MỞ KHE LAN CAN KÈ (cửa trên ở vỉa hè +16) ============================== */
  const gapRep=(ABY.gapsOpen===true)?[]:VEN.map(V=>{ const test=(x,z)=>{ const dx=x-V.O[0], dz=z-V.O[1], lx=dx*V.R[0]+dz*V.R[1], lz=dx*V.F[0]+dz*V.F[1]; return lx>.6 && lx<4.4 && lz>V.lzW(lx)-1.7 && lz<V.lzW(lx)+.9; };
    return K.openGap(test,14.5,18.5,{mid:true, meshNames:['abyssal-balustrade-rail']}); });

  /* ============================== 5. MỖI KHUNG HÌNH ============================== */
  let tt=0; HOOK.onFrame.push(dt=>{ dt=Math.min(dt||.016,.1); tt+=dt; let box=null;
    for(const V of VEN){ const d=Math.hypot(P.x-V.O[0],P.z-V.O[1]); if(d<60){ buildNear(V); V.near.g.visible=true; } else if(V.near.g) V.near.g.visible=false;
      if(V.near.g && V.near.g.visible && d<35){ for(const n of V.people) K.animate(n,dt,P); if(V.flames) V.flames.forEach((f,i)=>{ const k=.6+.4*Math.abs(Math.sin(tt*7+i*2.1))*Math.abs(Math.sin(tt*3.3+i)); f.scale.set(k,.6+k,k); f.material.opacity=.45+.4*k; }); }
      if(d<24){ const dx=P.x-V.O[0], dz=P.z-V.O[1], lx=dx*V.R[0]+dz*V.R[1], lz=dx*V.F[0]+dz*V.F[1]; if(lx>CX0 && lx<CX1 && lz<CF && lz>V.lzW(lx)) for(let i=0;i<3;i++){ const y=V.Y[i]; if(Math.abs(P.y-y)<2) box={x0:-1e6, x1:1e6, z0:-1e6, z1:1e6, y1:(i<2?V.Y[i+1]:V.YR)-.65, _dv:true}; } } }
    if(box){ HOOK.camBox=box; if(cam.dist>5) cam.dist=5; } else if(HOOK.camBox && HOOK.camBox._dv) HOOK.camBox=null; });

  /* ============================== 6. BẢN ĐỒ + CÔNG BỐ ============================== */
  for(const V of VEN){ const a=V.W2(0,DECK[2]+1.2), l=V.W2(0,0); PLACES.push({icon:V.cafe?'☕':'🍽️', name:`Abyssal · ${V.cafe?'Cafe 3 tầng Cliffside Roastery':'Nhà hàng 5 sao Le Palais de l\'Abysse'}`, sub:V.cafe?'Bờ Tây vịnh · quầy bar 14 m · 16 dù gỗ · cửa trên ở vỉa hè +16':'Bờ Đông vịnh · hầm rượu 600 chai · bếp Teppanyaki · cửa trên ở vỉa hè +16', go:()=>teleport(a[0],a[1],l[0],l[1])}); }
  const API={ ver:1, ready:true, gapReport:gapRep.map(r=>({segs:r.segs, inst:r.inst, tris:r.tris})),
    list:VEN.map(V=>({k:V.k, name:V.name, yaw:V.pl.yaw, center:{x:V.O[0], z:V.O[1]}, entryBeach:V.W2(0,DECK[0]+4.2), entryPromenade:V.W2(2.5,V.lzW(2.5)-1.2), lifts:V.lifts,
      floors:V.Y.map((y,i)=>({name:['Tầng 3 (bãi cát)','Tầng 2','Tầng 1 (sát vỉa hè)'][i], y, c:V.W2(2.5,1.0), deck:V.W2(0,(CF+DECK[i])/2)})).concat([{name:'Sân thượng +16', y:V.YR, c:V.W2(2.5,.6), deck:V.W2(16,2)}]),
      tables:V.tables.map(T=>({x:T.x, z:T.z, y:T.y, umb:T.umb, indoor:!!T.indoor, seats:T.seats})), waiterSpawn:V.W2(5.5,V.bx(5.5)+3.2), barY:V.Y[2]})) };
  API.cafe=API.list[0]; API.restaurant=API.list[1];
  W.abyDining=API; W.ABY.dining=API; try{ W.markShadow && W.markShadow(); }catch(e){}
  console.info(`[abyssal_dining_venues] dựng xong cafe + nhà hàng · ${VEN[0].tables.length}+${VEN[1].tables.length} bàn ngoài trời · cửa trên: ${gapRep.map(r=>r.segs).join('/')} đoạn lan can kè mở`);
  return API;
}
