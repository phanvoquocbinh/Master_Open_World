// QC World V2 – vùng "wonder": ĐẢO QC WONDERLAND + CÔNG VIÊN KỲ QUAN dời về phía Nam (phiên thiết bị S19g, 16/11/2026)
//  • Dùng lại nguyên 2 module V1 (funisland.js, themepark.js + các file con) với tuỳ chọn dời gốc {dx, dz} (js/worldshift.js) –
//    bố cục giữ y như V1 (cầu đá Wonderland → cổng Kỳ Quan vẫn nối liền), chỉ dời cả khối DX = −130, DZ = +265,5.
//  • DZ chọn để đường lát ngang z 634,5 của Kỳ Quan (từ Vòng quay Mắt Thần ra bờ Đông) trùng đúng cổng G9 (220, 900) – cầu G9 do Palm dựng.
//  • Đất thực tế: Wonderland x −138…2 · z 487…628; Kỳ Quan x −400…233 · z 637…1508 (lớn hơn bảng ZONES cũ −320…220 · 520…1350 – phía Tây/Nam là biển trống).
//  • Cổng: G8 = cầu cong 12 m từ cổng Nam Sân bay (0, 380, +4) xuống mũi Bắc Wonderland (−77, 504, +1,75) · G9 = đường lát + mố cầu ra (220, 900, +2).
//  • V2 bỏ cáp treo dài từ đảo chính cũ (đảo Abyssal cách 340 m, phải bay ngang đường băng sân bay – không hợp lý).
import { makeFunIsland } from './funisland.js';
import { makeThemePark } from './themepark.js';
import { shiftView } from './worldshift.js';
import { planeM } from './gfxkit.js';

export const DX=-130, DZ=265.5;

export function make(W, ctx){
  const {THREE, scene, addPlat, addSeg, makeLabel, circles, mergeGeometries} = W;
  const out={DX, DZ, gates:{G8:[0,380], G9:[220,900]}};
  try{ out.fun=makeFunIsland(W, ctx, {dx:DX, dz:DZ, cable:false}); }catch(e){ console.warn('[wonder] funisland', e); }
  try{ out.park=makeThemePark(W, ctx, {dx:DX, dz:DZ, paths:[[220,341,631,638]]}); }catch(e){ console.warn('[wonder] themepark', e); }   // lối ra G9 (cục bộ) – cây ngẫu nhiên tránh ra

  /* ---------- vật liệu + gộp hình theo vật liệu (ít lượt vẽ) ---------- */
  const GM=(W.GFX && W.GFX.M) || {};
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.85, ...o});
  const two=m=>{ m=m.clone(); m.side=THREE.DoubleSide; return m; };
  const MT={ conc:two(GM.stoneLight || std(0xcfc8bb)), asph:std(0x3a3d43,{roughness:.92}), walk:GM.granite || std(0xb9b0a3), line:std(0xf2f0e6,{roughness:.7, polygonOffset:true, polygonOffsetFactor:-2}),
    steel:std(0xdfe4ea,{roughness:.3, metalness:.8, side:THREE.DoubleSide}), pier:std(0xb7b2a8), lamp:std(0x2a2e35,{roughness:.5, metalness:.6}), bulb:new THREE.MeshBasicMaterial({color:0xfff1c8}) };
  const BK=new Map(), put=(g,m)=>{ for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal' && k!=='uv') g.deleteAttribute(k);
    if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); if(!BK.has(m)) BK.set(m,[]); BK.get(m).push(g.index?g.toNonIndexed():g); };
  const flush=()=>{ for(const [m,list] of BK){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; geo.computeBoundingSphere();
      const ms=new THREE.Mesh(geo,m); ms.castShadow=m!==MT.line && m!==MT.bulb; ms.receiveShadow=true; ms.userData.noFar=true; ms.name='wonder:gate'; scene.add(ms); } BK.clear(); };
  const CY=(r0,r1,h,x,y,z,n=12)=>{ const g=new THREE.CylinderGeometry(r0,r1,h,n); g.translate(x,y,z); return g; };
  const BX=(w,h,d,x,y,z,ry=0)=>{ const g=new THREE.BoxGeometry(w,h,d); if(ry) g.rotateY(ry); g.translate(x,y,z); return g; };

  /* ---------- cầu / mố cầu theo đường mẫu S = [{x,z,y}] (toạ độ thế giới) ---------- */
  // cặp điểm [trái, phải] (lệch âm → dương) cho mặt ngửa lên; mặt đứng: [trên, dưới] quay về phía lệch dương
  function deck(S, w, o={}){ const n=S.length, NV=[], acc=[0], msg=o.msg||'🌉 Lan can cầu';
    for(let i=0;i<n;i++){ const a=S[Math.max(0,i-1)], b=S[Math.min(n-1,i+1)], dx=b.x-a.x, dz=b.z-a.z, L=Math.hypot(dx,dz)||1; NV.push([dz/L,-dx/L]); if(i) acc.push(acc[i-1]+Math.hypot(S[i].x-S[i-1].x, S[i].z-S[i-1].z)); }
    const LEN=acc[n-1], Pt=(i,off,dy)=>[S[i].x+NV[i][0]*off, S[i].y+dy, S[i].z+NV[i][1]*off];
    const strip=(f, m, i0=0, i1=n-1, us=4)=>{ const pos=[], uv=[], idx=[]; for(let i=i0;i<=i1;i++){ const [a,b]=f(i); pos.push(...a,...b); uv.push(0,acc[i]/us, 1,acc[i]/us); if(i>i0){ const k=(i-i0-1)*2; idx.push(k,k+2,k+1, k+1,k+2,k+3); } }
      const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); put(g,m); };
    const h=w/2, sw=o.walk??1.3, road=h-sw-.3, DB=o.depth??1.2, PH=1.0;
    if(o.asphalt!==false){ strip(i=>[Pt(i,-road,.03),Pt(i,road,.03)], MT.asph);
      strip(i=>[Pt(i,-road+.1,.045),Pt(i,-road+.25,.045)], MT.line); strip(i=>[Pt(i,road-.25,.045),Pt(i,road-.1,.045)], MT.line);
      for(let i=0;i<n-1;){ let j=i; while(j<n-1 && acc[j]-acc[i]<3) j++; strip(k=>[Pt(k,-.08,.045),Pt(k,.08,.045)], MT.line, i, j); while(j<n-1 && acc[j]-acc[i]<6) j++; i=j; }   // vạch giữa đứt quãng
      strip(i=>[Pt(i,-h+.3,.06),Pt(i,-road,.06)], MT.walk); strip(i=>[Pt(i,road,.06),Pt(i,h-.3,.06)], MT.walk); }
    else strip(i=>[Pt(i,-h+.3,.06),Pt(i,h-.3,.06)], MT.walk);
    for(const sd of [-1,1]){ const o1=sd*h, o2=sd*(h-.3);
      strip(i=>[Pt(i,o1,PH),Pt(i,o1,-DB)], MT.conc); strip(i=>[Pt(i,o2,PH),Pt(i,o2,.06)], MT.conc);                 // mặt ngoài thành cầu · mặt trong lan can (bê tông 2 mặt)
      strip(i=>sd<0?[Pt(i,o1,PH),Pt(i,o2,PH)]:[Pt(i,o2,PH),Pt(i,o1,PH)], MT.conc); strip(i=>[Pt(i,sd*(h-.15),PH+.32),Pt(i,sd*(h-.15),PH+.2)], MT.steel); }
    strip(i=>[Pt(i,h,-DB),Pt(i,-h,-DB)], MT.conc);
    if(o.piers){ let next=o.piers.from; for(let i=0;i<n;i++){ if(acc[i]<next || acc[i]>LEN-o.piers.to) continue; next=acc[i]+o.piers.every;   // trụ đôi + xà mũ
        const yb=S[i].y-DB, ry=Math.atan2(-NV[i][1], NV[i][0]); put(BX(w-2,.9,1.6,S[i].x,yb-.45,S[i].z, ry), MT.conc);
        for(const sd of [-1,1]){ const x=S[i].x+NV[i][0]*sd*(h-2.6), z=S[i].z+NV[i][1]*sd*(h-2.6); put(CY(.75,.95,yb+8,x,(yb-8)/2,z), MT.pier); } } }
    if(o.lamps) for(let s=o.lamps.from, k=0; s<LEN-4; s+=o.lamps.every, k++){ const i=acc.findIndex(v=>v>=s); if(i<0) break; const sd=k%2?1:-1, [x,y,z]=Pt(i,sd*(h-.15),PH), hx=S[i].x+NV[i][0]*sd*(h-1.4), hz=S[i].z+NV[i][1]*sd*(h-1.4);
      put(CY(.07,.09,5.6,x,y+2.8,z,8), MT.lamp); put(BX(.12,.1,1.4,(x+hx)/2,y+5.55,(z+hz)/2, Math.atan2(hx-x,hz-z)), MT.lamp); put(CY(.22,.16,.22,hx,y+5.4,hz,10), MT.bulb);
      if(W.GLOW && W.GLOW.add) W.GLOW.add(hx,y+5.2,hz,3.2,0xffe2a8,1); }
    // va chạm: mặt đứng từng đoạn (xoay theo hướng đoạn) + lan can 2 bên (đoạn chặn ~6 m, có lời nhắn)
    for(let i=0;i<n-1;i++){ const a=S[i], b=S[i+1], L=Math.hypot(b.x-a.x,b.z-a.z); addPlat((a.x+b.x)/2, (a.z+b.z)/2, Math.atan2(b.x-a.x,b.z-a.z), h, L/2+.25, (a.y+b.y)/2); }
    const e0=o.railFrom??0, e1=LEN-(o.railTo??0);
    for(const sd of [-1,1]){ const pts=[]; for(let i=0;i<n;i++) if(acc[i]>=e0 && acc[i]<=e1) pts.push({p:[S[i].x+NV[i][0]*sd*(h-.15), S[i].z+NV[i][1]*sd*(h-.15)], s:acc[i]});
      let a=pts[0]; for(let j=1;j<pts.length;j++){ const b=pts[j]; if(b.s-a.s>=6 || j===pts.length-1){ addSeg(a.p[0],a.p[1],b.p[0],b.p[1],.2,undefined,undefined,msg); a=b; } } }
    return {len:LEN, pts:S}; }
  // đường cong Bézier bậc 3 (x, z) → mẫu đều ~2 m, y theo hàm yf(t)
  const bez=(P,yf,step=2)=>{ const f=t=>{ const u=1-t; return [u*u*u*P[0][0]+3*u*u*t*P[1][0]+3*u*t*t*P[2][0]+t*t*t*P[3][0], u*u*u*P[0][1]+3*u*u*t*P[1][1]+3*u*t*t*P[2][1]+t*t*t*P[3][1]]; };
    const fine=[]; let L=0, prev=f(0); for(let k=0;k<=600;k++){ const p=f(k/600); if(k) L+=Math.hypot(p[0]-prev[0],p[1]-prev[1]); fine.push({p, s:L}); prev=p; }
    const S=[], N=Math.max(2,Math.round(L/step)); let j=0; for(let i=0;i<=N;i++){ const s=L*i/N; while(j<fine.length-2 && fine[j+1].s<s) j++; const a=fine[j], b=fine[j+1], t=(s-a.s)/((b.s-a.s)||1);
      S.push({x:a.p[0]+(b.p[0]-a.p[0])*t, z:a.p[1]+(b.p[1]-a.p[1])*t, y:yf(s/L)}); }
    return S; };
  const smooth=t=>t*t*(3-2*t);

  /* ============================== G8: cầu Sân bay (0, 380, +4) → mũi Bắc Wonderland ============================== */
  // điểm đáp: mũi Bắc đảo (cục bộ 53, 238,5 – chỗ ga cáp treo cũ) → thế giới (−77, 504), đất +1,7
  const G8=bez([[0,379.4],[0,428],[-77,452],[-77,504]], t=>4+(1.75-4)*smooth(t)+2.4*Math.sin(Math.PI*t));
  out.g8=deck(G8, 12, {msg:'🌉 Lan can cầu G8 · Sân bay ↔ Wonderland', piers:{every:16, from:8, to:12}, lamps:{from:10, every:30}, railFrom:.5, railTo:2});
  makeLabel('🌉 Cầu G8 · Sân bay ↔ Đảo QC Wonderland', 'Đi bộ / lái xe xuống công viên', {h:.5, x:-30, y:9.5, z:452, fade:110});
  makeLabel('🚦 G8 · Cổng Bắc Wonderland', '↑ Sân bay Quốc tế · ↓ Đảo QC Wonderland & Kỳ Quan', {h:.5, x:-77, y:8, z:500, fade:80});
  for(const sd of [-1,1]){ const x=-77+sd*7.2, z=501; put(BX(1.1,7.7,1.1,x,3.85,z), MT.conc); put(BX(1.3,.4,1.3,x,7.9,z), MT.steel); circles.push({x, z, r:.7}); }

  /* ============================== G9: đường lát z 634,5 (cục bộ) ra bờ Đông + mố cầu nối cầu Palm (x 218 → 256) ============================== */
  { const V=shiftView(W, DX, DZ), G0=2.0, YP=G0+.05, gr=GM.granite || MT.walk;   // dựng theo toạ độ cục bộ của công viên (giống lối lát 171…220 có sẵn)
    const slab=new THREE.Mesh(planeM(341-220, 7, 220, 631).rotateX(-Math.PI/2), gr); slab.position.set((220+341)/2, YP+.012, 634.5); slab.receiveShadow=true; slab.userData.noFar=true; V.scene.add(slab);
    for(const [lx,sd] of [[236,-1],[268,1],[300,-1],[330,1]]){ const z=634.5+sd*4.1, g=new THREE.Group(); g.position.set(lx,G0,z);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,5,8), MT.lamp); pole.position.y=2.5; g.add(pole); const bulb=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8), MT.bulb); bulb.position.y=5.15; g.add(bulb);
      V.scene.add(g); if(V.GLOW && V.GLOW.add) V.GLOW.add(lx, G0+5.15, z, 3, 0xffe2a8, 1); V.circles.push({x:lx, z, r:.18}); }
    V.makeLabel('🛤️ Đường ra Cổng Đông G9', '→ cầu sang Ốc đảo Palm Dubai', {h:.45, x:300, y:G0+4.2, z:634.5, fade:70});
    // mố cầu: thế giới x 208 → 219,4 (đất +2 tới x 211, rồi dốc xuống biển) – nối liền đầu cầu Palm (bắt đầu ở x 218)
    const S=[]; for(let x=208; x<219.4; x+=1.9) S.push({x, z:900, y:G0}); S.push({x:219.4, z:900, y:G0});
    out.g9=deck(S, 9, {asphalt:false, depth:2.6, msg:'🌉 Lan can mố cầu G9 · Wonderland ↔ Palm', railFrom:2.5, railTo:0});
    for(const sd of [-1,1]){ const x=205.5, z=900+sd*5.6; put(BX(1.1,6,1.1,x,G0+3,z), MT.conc); put(BX(1.3,.4,1.3,x,G0+6.2,z), MT.steel); circles.push({x, z, r:.7}); }
    makeLabel('🚦 G9 · Cổng Đông Wonderland', '→ Ốc đảo Palm Dubai · ← Công viên Kỳ Quan', {h:.5, x:205.5, y:G0+7.6, z:900, fade:80}); }
  flush();

  // sổ đường chung V2 (giống Palm / Skyport): đoạn [x0,z0,x1,z1] + cổng
  const segs=[]; for(let i=0;i<G8.length-1;i+=5){ const j=Math.min(G8.length-1,i+5); segs.push([G8[i].x,G8[i].z,G8[j].x,G8[j].z]); }
  segs.push([90,900,219.4,900]);
  W.V2ROADS=W.V2ROADS||[]; W.V2ROADS.push({zone:'wonder', y:2, segs:segs.map(s=>s.map(v=>Math.round(v*10)/10)), gates:out.gates});
  return out;
}
