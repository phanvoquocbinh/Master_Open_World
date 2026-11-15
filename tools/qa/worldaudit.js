// QC World – RÀ SOÁT CẢNH VẬT TOÀN THẾ GIỚI (phiên S19g, 16/11/2026) – chỉ đọc, không sửa gì trong game.
// Nạp vào trang game đang chạy → window.__worldAudit:
//  • vray(x,z,yTop)    : tia thẳng đứng từ trên xuống → mọi mặt lưới cắt qua (y, pháp tuyến, vật) – dùng lưới tam giác chia ô 4 m nên nhanh
//  • ground(cx,cz,R,s) : so mặt đứng VẬT LÝ (W.groundAt – chỗ chân người chơi đặt) với MẶT NHÌN THẤY ngay dưới/ trên chân:
//       sink  = mặt đất/sàn nhìn thấy cao hơn chỗ chân đặt (chân lún vào đất/sàn)
//       float = dưới chân không có gì nhìn thấy trong 15 cm (đứng trên "sàn tàng hình", lơ lửng)
//  • water(R)          : mặt nước (hồ/sông/thác) cắt vào vách dốc, hoặc đất lòi lên giữa mặt nước
//  • instances(R)      : cây/đá/đèn… dạng InstancedMesh lơ lửng hoặc chìm hẳn xuống đất
(()=>{
  const W=__qc.W, T3=W.THREE, scene=W.scene, P=W.P;
  const roots=()=>{ const s=new Set(); for(const A of (W.ACTORS||[])) if(A && A.g) s.add(A.g); if(W.me && W.me.g) s.add(W.me.g); return s; };
  const SKIP=/^(sky|skybox|skydome|sky-?sphere|clouds?|fog|glow|halos?|sparks?|confetti|smoke|puffs?|grass|labels?|rain|snow|mist|spray|bubbles?|beams?|rays?|lightshafts?|godrays?)([\s:_\-.#]|$)|shadowProx/i;   // chỉ tên HIỆU ỨNG đúng nghĩa (trước lọc chuỗi con → loại oan 'terrain', 'skyport'…)
  // nước: tên gợi ý, hoặc vật liệu trong suốt (đục ≥ 50%), mịn (nhám ≤ 0,4) và rộng ≥ 6 m (hồ, sông, rèm thác, bọt) – kính cửa thường đục < 50%
  const isWaterMat=(o,m)=>{ const n=(o.name||'')+' '+(m.name||''); if(/water|nước|lake|river|sông|hồ|thác|fall|ocean|sea\b|pool|bể bơi|foam|bọt/i.test(n)) return true;
    if(!m.transparent || (m.opacity??1)<.5 || (m.roughness??1)>.4) return false; const g=o.geometry; if(!g.boundingBox) g.computeBoundingBox(); const bb=g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    return Math.max(bb.max.x-bb.min.x, bb.max.z-bb.min.z)>=6; };
  let LIST=null;
  function list(force){ if(LIST && !force) return LIST; const R=roots(), out=[]; scene.updateMatrixWorld(true);
    scene.traverseVisible(o=>{ if(!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh) return; for(let p=o;p;p=p.parent) if(R.has(p)) return;
      const m=Array.isArray(o.material)?o.material[0]:o.material; if(!m || m.isShaderMaterial || m.isRawShaderMaterial || m.isSpriteMaterial || m.isPointsMaterial) return; if(o.userData.shadowProxy) return;
      if(o===W.sky || (o.geometry && o.geometry.boundingSphere && o.geometry.boundingSphere.radius>1500 && o!==W.water && o!==W.ocean)) return;
      const water=o===W.water || o===W.ocean || isWaterMat(o,m); if(!water){ if(SKIP.test(o.name||'')) return; if(m.transparent && (m.opacity??1)<.35) return; if(m.depthWrite===false && m.transparent) return; if(m.colorWrite===false || m.visible===false) return; }
      const g=o.geometry; if(!g || !g.attributes || !g.attributes.position) return; if(!g.boundingBox) g.computeBoundingBox(); const bb=g.boundingBox.clone().applyMatrix4(o.matrixWorld);
      out.push({o, bb, water, big:o===W.water || o===W.ocean}); });
    LIST=out; GRID=null; return out; }
  // lưới 32 m: vật nào phủ ô nào
  let GRID=null; const GC=32, gk=(i,j)=>i*100003+j;
  function grid(){ if(GRID) return GRID; GRID=new Map(); for(const e of list()){ if(e.big) continue; const i0=Math.floor(e.bb.min.x/GC), i1=Math.floor(e.bb.max.x/GC), j0=Math.floor(e.bb.min.z/GC), j1=Math.floor(e.bb.max.z/GC);
      if((i1-i0+1)*(j1-j0+1)>4000) continue; for(let i=i0;i<=i1;i++) for(let j=j0;j<=j1;j++){ const k=gk(i,j); let a=GRID.get(k); if(!a) GRID.set(k,a=[]); a.push(e); } } return GRID; }
  // chia tam giác của 1 lưới theo ô 4 m (toạ độ thế giới) – lười: chỉ khi cần
  let IDX=new WeakMap(); const TC=4, tk=(i,j)=>i*100003+j;
  function idx(e){ const o=e.o; let X=IDX.get(o); if(X && X.g===o.geometry && X.m.every((v,i)=>v===o.matrixWorld.elements[i])) return X; const g=o.geometry, pos=g.attributes.position, ix=g.index, mw=o.matrixWorld, n=ix ? ix.count/3|0 : pos.count/3|0;
    const T=new Float32Array(n*9), v=new T3.Vector3(); for(let t=0;t<n;t++) for(let k=0;k<3;k++){ const i=ix ? ix.getX(t*3+k) : t*3+k; v.fromBufferAttribute(pos,i).applyMatrix4(mw); T.set([v.x,v.y,v.z], t*9+k*3); }
    const B=new Map(); for(let t=0;t<n;t++){ const a=t*9, x0=Math.min(T[a],T[a+3],T[a+6]), x1=Math.max(T[a],T[a+3],T[a+6]), z0=Math.min(T[a+2],T[a+5],T[a+8]), z1=Math.max(T[a+2],T[a+5],T[a+8]);
      for(let i=Math.floor(x0/TC); i<=Math.floor(x1/TC); i++) for(let j=Math.floor(z0/TC); j<=Math.floor(z1/TC); j++){ const k=tk(i,j); let b=B.get(k); if(!b) B.set(k,b=[]); b.push(t); } }
    X={T,B,g,m:o.matrixWorld.elements.slice()}; IDX.set(o,X); return X; }
  // tia thẳng đứng tại (x,z): mọi giao điểm có y ≤ yTop – {y, ny (|pháp tuyến y|, có dấu theo chiều quấn), e}
  function vray(x,z,yTop=1e9, opt={}){ const out=[], cand=(grid().get(gk(Math.floor(x/GC),Math.floor(z/GC)))||[]);
    const consider=opt.water===true ? cand.filter(e=>e.water) : opt.water===false ? cand.filter(e=>!e.water) : cand;
    for(const e of consider){ if(x<e.bb.min.x-.01 || x>e.bb.max.x+.01 || z<e.bb.min.z-.01 || z>e.bb.max.z+.01 || e.bb.min.y>yTop) continue; const {T,B}=idx(e), ts=B.get(tk(Math.floor(x/TC),Math.floor(z/TC))); if(!ts) continue;
      for(const t of ts){ const a=t*9, ax=T[a],ay=T[a+1],az=T[a+2], bx=T[a+3],by=T[a+4],bz=T[a+5], cx=T[a+6],cy=T[a+7],cz=T[a+8];
        const d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz); if(Math.abs(d)<1e-9) continue; const l1=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/d, l2=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/d, l3=1-l1-l2;
        if(l1<-1e-6 || l2<-1e-6 || l3<-1e-6) continue; const y=l1*ay+l2*by+l3*cy; if(y>yTop) continue;
        const ux=bx-ax,uy=by-ay,uz=bz-az, vx=cx-ax,vy=cy-ay,vz=cz-az, nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, nl=Math.hypot(nx,ny,nz)||1;
        out.push({y, ny:ny/nl, e}); } }
    if(opt.water!==false) for(const e of list()) if(e.big){ const y=e.o.position.y+(e.o.geometry.boundingBox?0:0); if(y<=yTop) out.push({y:e.bb.max.y, ny:1, e}); }
    out.sort((p,q)=>q.y-p.y); return out; }
  const nameOf=o=>{ const n=[]; for(let p=o; p && p!==scene && n.length<3; p=p.parent) if(p.name) n.push(p.name); const m=Array.isArray(o.material)?o.material[0]:o.material; return (n.join(' < ')||'(không tên)')+(m && m.color ? ' #'+m.color.getHexString() : ''); };
  const blocked=(x,z,y)=>{ const p={x, z, y}; try{ W.resolve(p, .3); }catch(e){ return false; } return Math.hypot(p.x-x,p.z-z)>.05; };   // điểm nằm trong vật cản (người chơi không tới được)

  // ---------- 1) mặt đứng vật lý ↔ mặt nhìn thấy (chỉ ở chỗ người chơi THẬT SỰ đi tới được) ----------
  // loang ô lưới từ chỗ đang đứng: bước sang ô kề nếu không lên dốc quá 0,65 m, không nằm trong vật cản, không cắt tường/lan can (SEGS)
  const sd2=(px,pz,ax,az,bx,bz)=>{ const dx=bx-ax, dz=bz-az, L=dx*dx+dz*dz, t=L ? Math.max(0,Math.min(1,((px-ax)*dx+(pz-az)*dz)/L)) : 0; return Math.hypot(px-ax-dx*t, pz-az-dz*t); };
  const ssd=(a1x,a1z,a2x,a2z,b1x,b1z,b2x,b2z)=>{ const o=(px,pz,qx,qz,rx,rz)=>(qx-px)*(rz-pz)-(qz-pz)*(rx-px);
    const d1=o(b1x,b1z,b2x,b2z,a1x,a1z), d2=o(b1x,b1z,b2x,b2z,a2x,a2z), d3=o(a1x,a1z,a2x,a2z,b1x,b1z), d4=o(a1x,a1z,a2x,a2z,b2x,b2z);
    if(((d1>0)!==(d2>0)) && ((d3>0)!==(d4>0))) return 0; return Math.min(sd2(a1x,a1z,b1x,b1z,b2x,b2z), sd2(a2x,a2z,b1x,b1z,b2x,b2z), sd2(b1x,b1z,a1x,a1z,a2x,a2z), sd2(b2x,b2z,a1x,a1z,a2x,a2z)); };
  function reach(cx, cz, y0, R=40, s=1.5){ const N=Math.ceil(R/s), K=(i,j)=>i*100003+j, map=new Map(), q=[[0,0,y0]]; map.set(K(0,0), y0);
    const segs=(W.SEGS||[]).filter(g=>g.x1>cx-R-2 && g.x0<cx+R+2 && g.z1>cz-R-2 && g.z0<cz+R+2);
    const crosses=(ax,az,bx,bz,y)=>{ for(const g of segs){ if(g.y0!==undefined && (y<g.y0-.3 || y>g.y1)) continue; if(Math.max(ax,bx)<g.x0-.3 || Math.min(ax,bx)>g.x1+.3 || Math.max(az,bz)<g.z0-.3 || Math.min(az,bz)>g.z1+.3) continue;
        if(ssd(ax,az,bx,bz,g.ax,g.az,g.bx,g.bz)<(g.r||.15)+.28) return true; } return false; };
    for(let h=0; h<q.length; h++){ const [i,j,y]=q[h];
      for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=i+di, nj=j+dj; if(Math.abs(ni)>N || Math.abs(nj)>N) continue; const k=K(ni,nj); if(map.has(k)) continue;
        const ax=cx+i*s, az=cz+j*s, bx=cx+ni*s, bz=cz+nj*s, yb=W.groundAtY ? W.groundAtY(bx,bz,y) : W.groundAt(bx,bz); if(!isFinite(yb) || yb>y+.65) continue;
        if(yb<-.2 && W.groundH(bx,bz)<-.2) continue; if(blocked(bx,bz,yb) || crosses(ax,az,bx,bz,Math.max(y,yb)+.1)) continue; map.set(k,yb); q.push([ni,nj,yb]); } }
    return {map, s, cx, cz, N}; }
  // vật đang chuyển động (xe, tàu, người…) – chụp vị trí 2 lần cách nhau vài khung hình; vật nào dịch > 1 cm thì bỏ qua khi so mặt đất
  let SNAP=null, MOVING=new Set(); function markMoving(second){ const L=list(); if(!second){ SNAP=new Map(L.map(e=>[e.o, e.o.matrixWorld.elements.slice(12,15)])); return 0; }
    MOVING=new Set(); for(const e of L){ const a=SNAP.get(e.o), m=e.o.matrixWorld.elements; if(a && Math.hypot(a[0]-m[12],a[1]-m[13],a[2]-m[14])>.01) MOVING.add(e.o); } return MOVING.size; }
  function ground(cx, cz, R=40, s=1.5, opt={}){ list(); const res=[], RG=reach(cx, cz, opt.y0??W.P.y, R, s); let n=0;
    for(const [k,y] of RG.map){ const i=Math.round(k/100003), j=k-i*100003, x=cx+i*s, z=cz+j*s; n++;
      const hits=vray(x,z,y+1.6,{water:false}).filter(h=>!MOVING.has(h.e.o)); const top=hits[0];
      if(top && top.y>y+.07 && top.ny>.5){ res.push({kind:'sink', at:[+x.toFixed(1),+y.toFixed(2),+z.toFixed(1)], by:+(top.y-y).toFixed(2), obj:nameOf(top.e.o)}); continue; }
      const under=hits.find(h=>h.y<=y+.07); if(!under || under.y<y-.15){ const wat=vray(x,z,y+.2,{water:true})[0]; res.push({kind:'float', at:[+x.toFixed(1),+y.toFixed(2),+z.toFixed(1)], gap:under ? +(y-under.y).toFixed(2) : null, obj:under ? nameOf(under.e.o) : '(không có gì)', water:!!(wat && wat.y>y-.6)}); } }
    res.reached=n; return res; }
  // ---------- 2) nước ↔ đất ----------
  function water(cx, cz, R=400, opt={}){ list(); const res=[], seen=new Set(), step=opt.step||2;
    for(const e of list()){ if(!e.water || e.big) continue; const c=e.bb.getCenter(new T3.Vector3()); if(Math.hypot(c.x-cx,c.z-cz)>R+Math.max(e.bb.max.x-e.bb.min.x, e.bb.max.z-e.bb.min.z)/2) continue;
      for(let x=e.bb.min.x+step/2; x<=e.bb.max.x; x+=step) for(let z=e.bb.min.z+step/2; z<=e.bb.max.z; z+=step){ if(Math.hypot(x-cx,z-cz)>R) continue;
        const wh=vray(x,z,1e9,{water:true}).filter(h=>h.e===e); if(!wh.length) continue;
        for(const w of wh){ const gs=vray(x,z,w.y+30,{water:false}); const above=gs.filter(h=>h.y>w.y+.05), below=gs.find(h=>h.y<=w.y+.05);
          const steep=g=>g && Math.abs(g.ny)<.6;
          if(below && w.y-below.y<.12 && steep(below)){ const k='c'+Math.round(x/4)+','+Math.round(z/4); if(!seen.has(k)){ seen.add(k); res.push({kind:'cliffcut', at:[+x.toFixed(1),+w.y.toFixed(2),+z.toFixed(1)], water:nameOf(e.o), ground:nameOf(below.e.o)}); } }
          const up=above.length ? above[above.length-1] : null;   // mặt đất thấp nhất phía trên mặt nước
          if(up && up.ny>.5 && up.y-w.y<.6 && Math.abs(w.ny)>.8){   // đất nhô lên khỏi nước (≤ 60 cm) – kiểm tra xung quanh có phải đang là mặt nước lộ ra không
            let open=0; for(const [dx,dz] of [[3,0],[-3,0],[0,3],[0,-3]]){ const ww=vray(x+dx,z+dz,1e9,{water:true}).find(h=>h.e===e); if(!ww) continue; const g2=vray(x+dx,z+dz,ww.y+30,{water:false}).filter(h=>h.y>ww.y+.02); if(!g2.length) open++; }
            if(open>=3){ const k='i'+Math.round(x/4)+','+Math.round(z/4); if(!seen.has(k)){ seen.add(k); res.push({kind:'pokes', at:[+x.toFixed(1),+w.y.toFixed(2),+z.toFixed(1)], by:+(up.y-w.y).toFixed(2), water:nameOf(e.o), ground:nameOf(up.e.o)}); } } } } } }
    return res; }
  // ---------- 3) InstancedMesh lơ lửng / chìm ----------
  // gom các phần cùng chỗ (thân + tán cây, cột + bóng đèn…) thành 1 vật theo (x,z) làm tròn 0,4 m → xét đáy thấp nhất của cả vật
  function instances(cx, cz, R=400){ list(); const res=[], m=new T3.Matrix4(), p=new T3.Vector3(), q=new T3.Quaternion(), s=new T3.Vector3(), R0=roots(), G=new Map();
    scene.traverseVisible(o=>{ if(!o.isInstancedMesh || o.count>6000) return; for(let a=o;a;a=a.parent) if(R0.has(a)) return; const mat=Array.isArray(o.material)?o.material[0]:o.material; if(!mat || mat.isShaderMaterial) return; if(SKIP.test(o.name||'')) return;
      const g=o.geometry; if(!g.boundingBox) g.computeBoundingBox(); const bb=g.boundingBox; o.updateMatrixWorld(true);
      for(let i=0;i<o.count;i++){ o.getMatrixAt(i,m); m.premultiply(o.matrixWorld); m.decompose(p,q,s); if(s.x<1e-4 || s.y<1e-4) continue; if(Math.hypot(p.x-cx,p.z-cz)>R) continue;
        const k=Math.round(p.x/.4)+','+Math.round(p.z/.4); let e=G.get(k); if(!e) G.set(k, e={x:p.x, z:p.z, base:1e9, top:-1e9, h:0, mesh:'', i}); const b0=p.y+bb.min.y*s.y, t0=p.y+bb.max.y*s.y;
        if(b0<e.base){ e.base=b0; e.mesh=nameOf(o); e.i=i; } e.top=Math.max(e.top,t0); } });
    for(const e of G.values()){ if(e.top-e.base<.12) continue; const hs=vray(e.x,e.z,e.base+.6,{water:false}), sup=hs.find(h=>h.y<=e.base+.6);
      if(!sup || e.base-sup.y>.25){ const wat=vray(e.x,e.z,e.base+.3,{water:true})[0]; if(wat && wat.y>e.base-.5) continue;   // phao / lá súng trên mặt nước
        const below=vray(e.x,e.z,e.base,{water:false})[0]; const gap=below ? e.base-below.y : 1e9; if(gap>2.5) continue;   // treo tường / cabin trên cao: bỏ qua – chỉ báo vật hở đất 0,25…2,5 m
        res.push({kind:'iFloat', at:[+e.x.toFixed(1),+e.base.toFixed(2),+e.z.toFixed(1)], gap:+gap.toFixed(2), mesh:e.mesh, i:e.i}); }
      else { const gy=W.groundH(e.x,e.z); if(e.top<gy-.05) res.push({kind:'iBuried', at:[+e.x.toFixed(1),+e.top.toFixed(2),+e.z.toFixed(1)], mesh:e.mesh, i:e.i}); } }
    return res; }
  window.__worldAudit={list, vray, ground, water, instances, nameOf, blocked, reach, markMoving};
  return 'worldaudit ready';
})()
