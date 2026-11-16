// QC World V2 – GIAO THÔNG TOÀN THẾ GIỚI (16/11/2026 · phiên bot đi bộ)
//  🛣️ W.roadNet: đồ thị đường xe chạy được cho CẢ V2 – gom từ sổ đường chung W.V2ROADS (Abyssal, CBD, Skyport, Palm, Wonder) + đường Dev City
//     (ROADS + DECKS cầu/cầu cạn/xoắn ốc, có cao độ) + đường đèo Brain (ROAD + nhánh G6) + cầu G3 sang Swiss; nối xuyên vùng qua 9 cổng G1–G9.
//     API: nodes, edges, route(from,to) (Dijkstra – đường ngắn nhất), nearest(x,z), onRoad(x,z), lanePoint(e,dir,d).
//  🚗 Xe hơi bot: sedan, SUV, xe nhỏ, thể thao, bán tải, taxi, xe van – nhiều màu; chạy bên phải, cua mượt (cung Bezier ở mỗi nút),
//     bám đúng cao độ mặt đường (cầu, dốc, hầm, đèo); nhường nhau ở giao lộ (mỗi lúc 1 xe trong ô giao); giữ khoảng cách; dừng khi người chơi
//     / người đi bộ ở trước mũi xe (bóp còi); người chơi không đi xuyên xe (W.DYN). Chỉ mô phỏng & vẽ xe trong ~200 m quanh người chơi.
//     Vẽ bằng InstancedMesh: mỗi kiểu xe 2 lượt (thân sơn màu + chi tiết) + 1 lượt cho mọi bánh xe ≈ 15 lượt vẽ.
//     W.traffic.spawnVehicle(kind, route) cho xe cảnh sát / cứu hoả / cứu thương (Pha 10).
//  🚶 Người đi bộ bổ sung trên vỉa hè dọc mọi tuyến đường: đi dạo, nghe điện thoại, xách túi, chạy bộ, dắt chó, đi theo cặp, ngồi ghế đá;
//     qua đường ở vạch (vạch kẻ được vẽ) khi không có xe tới; người đang qua nằm trong W.PEDS để xe dừng.
import { makePoser } from './pose.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function make(W, zones={}){
  const {THREE, scene, P, HOOK, circles, boxes, groundAt, lerpAngle, toast} = W;
  const gAtY=(x,z,y)=>W.groundAtY ? W.groundAtY(x,z,y) : groundAt(x,z);
  const QUAL=W.QUAL||'low', RND=Math.random, t0=performance.now(), clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const merge=W.mergeGeometries;

  /* ============================== 1. GOM ĐƯỜNG TỪ CÁC VÙNG ============================== */
  const LINES=[];
  const VMAX={abyssal:11, cbd:12.5, skyport:11, palm:10, wonder:8, devcity:11, brain:9, swiss:6};
  const add=(pts, w, zone, o={})=>{ if(pts.length>=2) LINES.push({pts, w, zone, vmax:o.vmax||VMAX[zone]||10, name:o.name||zone, fixedY:!!o.fixedY, refY:o.refY??2}); };
  const WD={abyssal:9, skyport:10, palm:8, wonder:8};
  for(const R0 of (W.V2ROADS||[])){
    for(const s of R0.segs){ let w=WD[R0.zone]||10;
      // Abyssal: chỉ vành đai +2 (±174) và 3 nhánh ra cổng là đường xe; đường đỉnh vách (+28, lát đá 4 m) + lối vào giếng xoắn ốc là đường đi bộ
      if(R0.zone==='abyssal' && !(Math.max(Math.abs(s[0]),Math.abs(s[1]))>=170 && Math.max(Math.abs(s[2]),Math.abs(s[3]))>=170)) continue;
      if(R0.zone==='cbd'){ const zc=Math.abs(s[1]-s[3])<.5 ? s[1] : null; w=(zc!==null && (Math.abs(zc-66)<1 || Math.abs(zc-236)<1)) ? 24 : 20; }
      add([[s[0],s[1],null],[s[2],s[3],null]], w, R0.zone, {refY:R0.y}); } }
  const dc=zones.devcity||W.devcityV2;
  if(dc){ for(const r of (dc.ROADS||[])){ const p=r.pts.filter((q,i)=>i%2===0 || i===r.pts.length-1).map(q=>[q.x,q.z,q.y]); add(p, r.w||10, 'devcity', {fixedY:true, name:r.name, vmax:r.tunnel?13:11}); }
    for(const d of (dc.DECKS||[])){ if(/^(rail|foot)/i.test(d.name||'') || !d.path || d.path.length<2) continue; /* bỏ dầm tàu điện + cầu đi bộ */ add(d.path.map(q=>[q.x,q.z,q.y]), 10, 'devcity', {fixedY:true, name:'cầu '+(d.name||'')}); }
    add([[220,-121,null],[220,-104,null]], 15, 'cbd', {refY:2, name:'đầu cầu dây văng'}); }
  const br=zones.brain||W.brainV2;
  if(br && br.ROAD){ const pts=[]; for(let i=0;i<br.ROAD.length;i+=2){ const q=br.ROAD[i]; if(q.kind==='glass') break; if(q.kind==='approach' && q.x<586) continue; pts.push([q.x,q.z,q.h]); }
    if(pts.length>2){ add(pts, 10, 'brain', {fixedY:true, name:'đường đèo Brain'}); add([[580,80,2.05],[pts[0][0],pts[0][1],pts[0][2]]], 14, 'cbd', {fixedY:true, name:'cầu G4'}); }
    if(br.G6 && br.G6.pts){ const g=br.G6.pts.filter((q,i)=>i%2===0).map(q=>[q.x,q.z,q.h]); if(br.G6.J) g.push([br.G6.J.x, br.G6.J.z, br.G6.J.h]); add(g, 10, 'brain', {fixedY:true, name:'nhánh G6'}); } }
  if(zones.swiss || W.swissV2){ const p=[]; for(let x=-180; x>=-344; x-=4) p.push([x,-16,null]); add(p, 7, 'swiss', {refY:2, name:'cầu G3 · đại lộ Cổng Đông'}); }

  // làm dày điểm (≤ 2 m) + lấy cao độ mặt đường thật (cầu, dốc) – liên tục theo điểm trước, không nhảy lên tầng trên / rơi xuống nước
  for(const L of LINES){ const out=[];
    for(let i=0;i<L.pts.length-1;i++){ const a=L.pts[i], b=L.pts[i+1], d=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.ceil(d/2));
      for(let k=0;k<n;k++){ const t=k/n; out.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, (a[2]==null||b[2]==null) ? null : a[2]+(b[2]-a[2])*t]); } }
    out.push(L.pts[L.pts.length-1].slice()); L.pts=out;
    if(!L.fixedY){ let ref=L.refY; for(const p of L.pts){ let y=gAtY(p[0],p[1],ref+1.2); if(!(y>ref-1.6) || !(y<ref+1.8)) y=ref; p[2]=y; ref=y; } }
    else for(const p of L.pts){ const y=gAtY(p[0],p[1],p[2]+.8); if(Math.abs(y-p[2])<1.2) p[2]=y; } }   // cao độ trong dữ liệu vùng lệch mặt đi thật (mặt cầu, mép đèo) → bám mặt thật

  /* ============================== 2. DỰNG ĐỒ THỊ ============================== */
  // 2a. điểm cuối nằm giữa tuyến khác (ngã ba T) → cắt tuyến kia + nối ngắn
  const VG=new Map(), vk=(x,z)=>Math.floor(x/12)+','+Math.floor(z/12);
  LINES.forEach((L,li)=>L.pts.forEach((p,i)=>{ const k=vk(p[0],p[1]); let a=VG.get(k); if(!a) VG.set(k,a=[]); a.push(li,i); }));
  const cuts=LINES.map(()=>[]), links=[];
  for(let li=0; li<LINES.length; li++){ const L=LINES[li];
    for(const ei of [0, L.pts.length-1]){ const E=L.pts[ei]; let best=null; const cx=Math.floor(E[0]/12), cz=Math.floor(E[1]/12);
      for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++){ const arr=VG.get((cx+a)+','+(cz+b)); if(!arr) continue;
        for(let k=0;k<arr.length;k+=2){ const lj=arr[k], i=arr[k+1]; if(lj===li) continue; const M=LINES[lj]; if(i>=M.pts.length-1) continue;
          const M0=M.pts[0], M1=M.pts[M.pts.length-1]; if(Math.hypot(E[0]-M0[0], E[1]-M0[1])<3.5 || Math.hypot(E[0]-M1[0], E[1]-M1[1])<3.5) continue;   // chạm đầu tuyến kia → bước gộp nút xử lý
          const p=M.pts[i], q=M.pts[i+1], ex=q[0]-p[0], ez=q[1]-p[1], l2=ex*ex+ez*ez||1e-9, t=((E[0]-p[0])*ex+(E[1]-p[1])*ez)/l2; if(t<-.01 || t>1.01) continue;   // chỉ nhận chân đường vuông góc nằm trong đoạn
          const x=p[0]+ex*t, z=p[1]+ez*t, y=p[2]+(q[2]-p[2])*t, d=Math.hypot(E[0]-x,E[1]-z); if(d>Math.max(3, M.w/2+1.5) || Math.abs(y-E[2])>2) continue;
          if(Math.hypot(x-M0[0], z-M0[1])<3 || Math.hypot(x-M1[0], z-M1[1])<3) continue;
          if(!best || d<best.d) best={d, lj, i, t, x, z, y}; } }
      if(best){ cuts[best.lj].push(best); if(best.d>.6) links.push({pts:[[E[0],E[1],E[2]],[best.x,best.z,best.y]], w:L.w, zone:L.zone, vmax:L.vmax, name:'nối'}); } } }
  // 2b. cắt tuyến thành các đoạn giữa các điểm nối
  const PIECES=[];
  LINES.forEach((L,li)=>{ const C=cuts[li].sort((a,b)=>a.i-b.i || a.t-b.t); let cur=[L.pts[0]], ci=0;
    for(let i=0;i<L.pts.length-1;i++){ while(ci<C.length && C[ci].i===i){ const c=C[ci++], pt=[c.x,c.z,c.y]; cur.push(pt); if(cur.length>=2) PIECES.push({...L, pts:cur}); cur=[pt]; } cur.push(L.pts[i+1]); }
    if(cur.length>=2) PIECES.push({...L, pts:cur}); });
  for(const l of links) PIECES.push({...l, fixedY:true});
  // 2c. gộp đầu mút gần nhau thành nút (cổng nối vùng: bán kính 5 m)
  const GATEPTS=[[180,0],[0,180],[0,220],[-180,-16],[580,80],[384,-120],[388,-120],[700,-100],[450,460],[0,380],[220,900]];
  const nodes=[]; const NG=new Map(), nk=(x,z)=>Math.floor(x/8)+','+Math.floor(z/8);
  function nodeAt(x,z,y){ const r=GATEPTS.some(g=>Math.hypot(g[0]-x,g[1]-z)<8) ? 5 : 3; const cx=Math.floor(x/8), cz=Math.floor(z/8); let best=null, bd=r;
    for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++){ const arr=NG.get((cx+a)+','+(cz+b)); if(!arr) continue; for(const n of arr){ const d=Math.hypot(n.x-x,n.z-z); if(d<bd && Math.abs(n.y-y)<2.2){ bd=d; best=n; } } }
    if(best){ best.sx+=x; best.sz+=z; best.sy+=y; best.k++; return best; }
    const n={id:nodes.length, x, z, y, sx:x, sz:z, sy:y, k:1, adj:[]}; nodes.push(n); const kk=nk(x,z); let arr=NG.get(kk); if(!arr) NG.set(kk, arr=[]); arr.push(n); return n; }
  let edges=[];
  for(const pc of PIECES){ const a=pc.pts[0], b=pc.pts[pc.pts.length-1]; const A=nodeAt(a[0],a[1],a[2]), B=nodeAt(b[0],b[1],b[2]); if(A===B && pc.pts.length<4) continue; edges.push({a:A, b:B, pts:pc.pts, w:pc.w, zone:pc.zone, vmax:pc.vmax, name:pc.name}); }
  for(const n of nodes){ n.x=n.sx/n.k; n.z=n.sz/n.k; n.y=n.sy/n.k; }
  for(const e of edges){ e.pts[0]=[e.a.x,e.a.z,e.a.y]; e.pts[e.pts.length-1]=[e.b.x,e.b.z,e.b.y]; }
  // 2d. nối chuỗi nút bậc 2 (cùng bề rộng, cùng vùng) thành 1 cạnh dài
  const rebuildAdj=()=>{ for(const n of nodes) n.adj=[]; edges.forEach(e=>{ e.a.adj.push(e); if(e.b!==e.a) e.b.adj.push(e); }); };
  rebuildAdj();
  for(let changed=true; changed;){ changed=false;
    for(const n of nodes){ if(n.dead || n.adj.length!==2) continue; const [e1,e2]=n.adj; if(e1===e2 || e1.w!==e2.w || e1.zone!==e2.zone) continue;
      const A=e1.b===n ? e1.a : e1.b, B=e2.a===n ? e2.b : e2.a; if(A===n || B===n) continue;
      const p1=e1.b===n ? e1.pts : e1.pts.slice().reverse(), p2=e2.a===n ? e2.pts : e2.pts.slice().reverse();
      const ne={a:A, b:B, pts:p1.concat(p2.slice(1)), w:e1.w, zone:e1.zone, vmax:Math.min(e1.vmax,e2.vmax), name:e1.name};
      edges=edges.filter(e=>e!==e1 && e!==e2); edges.push(ne); n.dead=true; n.adj=[];
      A.adj=A.adj.filter(e=>e!==e1 && e!==e2); A.adj.push(ne); if(B!==A){ B.adj=B.adj.filter(e=>e!==e1 && e!==e2); B.adj.push(ne); } changed=true; } }
  // 2e. mảng gọn + bỏ mảnh rời quá nhỏ
  const live=nodes.filter(n=>!n.dead);
  for(const e of edges){ const N=e.pts.length; e.x=new Float32Array(N); e.z=new Float32Array(N); e.y=new Float32Array(N); e.cum=new Float32Array(N);
    for(let i=0;i<N;i++){ e.x[i]=e.pts[i][0]; e.z[i]=e.pts[i][1]; e.y[i]=e.pts[i][2]; if(i) e.cum[i]=e.cum[i-1]+Math.hypot(e.x[i]-e.x[i-1], e.z[i]-e.z[i-1]); }
    e.len=e.cum[N-1]; e.off=e.w>=18 ? 3.4 : clamp(e.w*.25, 1.6, 2.6); delete e.pts; }
  edges=edges.filter(e=>e.len>.5); rebuildAdj();
  { const comp=new Map(); for(const n of live){ if(comp.has(n)) continue; const st=[n]; comp.set(n,1); const es=new Set(); let L=0;
      while(st.length){ const u=st.pop(); for(const e of u.adj){ es.add(e); const v=e.a===u?e.b:e.a; if(!comp.has(v)){ comp.set(v,1); st.push(v); } } }
      for(const e of es) L+=e.len; if(L<25) for(const e of es) e.dead=true; }
    edges=edges.filter(e=>!e.dead); }
  edges.forEach((e,i)=>e.id=i); rebuildAdj();
  const NODES=live.filter(n=>n.adj.length); NODES.forEach((n,i)=>{ n.id=i; n.deg=n.adj.length; n.R=Math.max(...n.adj.map(e=>e.w))/2+2.5; n.occ=null; n.occT=0; });

  // tra cứu: lưới điểm mẫu của mọi cạnh
  const EG=new Map(), ek=(x,z)=>Math.floor(x/16)+','+Math.floor(z/16);
  for(const e of edges) for(let i=0;i<e.x.length;i++){ const k=ek(e.x[i],e.z[i]); let a=EG.get(k); if(!a) EG.set(k,a=[]); a.push(e,i); }
  function nearest(x, z, maxD=40, y=null){ const cx=Math.floor(x/16), cz=Math.floor(z/16), rr=Math.ceil(maxD/16); let best=null, bd=maxD*maxD;
    for(let a=-rr;a<=rr;a++) for(let b=-rr;b<=rr;b++){ const arr=EG.get((cx+a)+','+(cz+b)); if(!arr) continue;
      for(let k=0;k<arr.length;k+=2){ const e=arr[k], i=arr[k+1], d=(e.x[i]-x)**2+(e.z[i]-z)**2; if(d<bd && (y===null || Math.abs(e.y[i]-y)<3)){ bd=d; best={e, i, s:e.cum[i], d:Math.sqrt(d), x:e.x[i], z:e.z[i], y:e.y[i]}; } } } return best; }
  function onRoad(x, z, y=null, pad=0){ const n=nearest(x, z, 16, y); return !!n && n.d<n.e.w/2+pad; }
  // điểm trên tim đường cách đầu a một đoạn d (0..len) + hướng
  function edgePt(e, d, o){ const c=e.cum, N=c.length; d=clamp(d,0,e.len); let lo=0, hi=N-1; while(hi-lo>1){ const m=(lo+hi)>>1; if(c[m]<=d) lo=m; else hi=m; }
    const t=(d-c[lo])/((c[hi]-c[lo])||1); o.x=e.x[lo]+(e.x[hi]-e.x[lo])*t; o.z=e.z[lo]+(e.z[hi]-e.z[lo])*t; o.y=e.y[lo]+(e.y[hi]-e.y[lo])*t;
    const l=Math.hypot(e.x[hi]-e.x[lo], e.z[hi]-e.z[lo])||1; o.ux=(e.x[hi]-e.x[lo])/l; o.uz=(e.z[hi]-e.z[lo])/l; return o; }
  // điểm trên làn bên phải theo chiều đi (dir +1: a→b), cách đầu (theo chiều đi) d mét – bên phải của hướng (ux,uz) là (−uz, ux)
  function lanePoint(e, dir, d, o={}, off=e.off){ edgePt(e, dir>0 ? d : e.len-d, o); const ux=o.ux*dir, uz=o.uz*dir; o.ux=ux; o.uz=uz; o.x+=-uz*off; o.z+=ux*off; return o; }
  // Dijkstra: đường ngắn nhất giữa 2 điểm / nút
  function route(from, to){ const A=from.adj ? null : (nearest(from.x, from.z, 80)||{}).e, B=to.adj ? null : (nearest(to.x, to.z, 80)||{}).e; if((!from.adj && !A) || (!to.adj && !B)) return null;
    const src=from.adj ? [from] : [A.a, A.b], dst=to.adj ? new Set([to]) : new Set([B.a, B.b]); const dist=new Map(), prev=new Map(), Q=[];
    for(const s of src){ dist.set(s,0); Q.push(s); }
    while(Q.length){ let bi=0; for(let i=1;i<Q.length;i++) if(dist.get(Q[i])<dist.get(Q[bi])) bi=i; const u=Q.splice(bi,1)[0];
      if(dst.has(u)){ const out=[]; let n=u; while(prev.has(n)){ const [e,p]=prev.get(n); out.unshift({e, dir:e.a===p?1:-1}); n=p; } return {start:n, end:u, edges:out, len:dist.get(u), nodes:[n, ...out.map(s=>s.dir>0?s.e.b:s.e.a)]}; }
      for(const e of u.adj){ const v=e.a===u?e.b:e.a, nd=dist.get(u)+e.len; if(!dist.has(v) || nd<dist.get(v)){ if(!dist.has(v)) Q.push(v); dist.set(v,nd); prev.set(v,[e,u]); } } }
    return null; }
  const roadNet={nodes:NODES, edges, route, nearest, onRoad, lanePoint, edgePt};
  W.roadNet=roadNet;
  const tNet=performance.now()-t0;

  /* ============================== 3. XE HƠI BOT ============================== */
  const POOL={low:14, medium:20, high:28}[QUAL] ?? 18, RANGE={low:170, medium:200, high:220}[QUAL] ?? 200;
  const MODELS=[['sedan',.24],['suv',.17],['mini',.13],['sport',.08],['pickup',.1],['taxi',.16],['van',.12]];
  const COLORS=[0xd7263d,0x1b4f9c,0xf2f2f2,0x1d1f24,0x8a9099,0x2e8b57,0xff7b29,0x6b3fa0,0x0fa3b1,0xc9a227,0x7a1f2a,0xe9e3d5,0x3a6ea5,0x9b2226];
  const SENT=0xff00ff;
  const cars=[], specials=[], carGroup=new THREE.Group(); carGroup.name='v2traffic-dummies'; carGroup.userData.dynamic=true; scene.add(carGroup);
  const IM={}; let wheelIM=null, built=false;
  const PEDS=W.PEDS=[];
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _p=new THREE.Vector3(), _s1=new THREE.Vector3(1,1,1), _z=new THREE.Matrix4().makeScale(0,0,0), _w=new THREE.Matrix4(), _wl=new THREE.Matrix4(), _wq=new THREE.Quaternion(), _we=new THREE.Euler(), _ws=new THREE.Vector3();
  function bake(g){ g.updateMatrixWorld(true); const body=[], trim=[], wheelObjs=new Set(); for(const w of (g.userData.wheels||[])) w.traverse(o=>wheelObjs.add(o));
    const col=new THREE.Color();
    g.traverse(o=>{ if(!o.isMesh || wheelObjs.has(o)) return; const m=Array.isArray(o.material)?o.material[0]:o.material; const geo=o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); geo.applyMatrix4(o.matrixWorld);
      for(const k of Object.keys(geo.attributes)) if(k!=='position' && k!=='normal') geo.deleteAttribute(k); if(!geo.attributes.normal) geo.computeVertexNormals();
      if(m.color && m.color.getHex()===SENT){ body.push(geo); return; }
      col.copy(m.color||new THREE.Color(1,1,1)); if(m.emissive && m.emissiveIntensity>0 && m.emissive.getHex()) col.lerp(m.emissive, .55); if(m.transparent || m.opacity<1) col.multiplyScalar(.55);
      const n=geo.attributes.position.count, ca=new Float32Array(n*3); for(let i=0;i<n;i++){ ca[i*3]=col.r; ca[i*3+1]=col.g; ca[i*3+2]=col.b; } geo.setAttribute('color', new THREE.BufferAttribute(ca,3)); trim.push(geo); });
    const wheels=(g.userData.wheels||[]).map(w=>{ const p=new THREE.Vector3(); w.getWorldPosition(p); return p; });
    return {body:body.length?merge(body):null, trim:trim.length?merge(trim):null, wheels, r:(g.userData.r||.36)*(g.userData.wScale||1)}; }
  function buildModels(){ const V=W.life.V, bodyM=new THREE.MeshStandardMaterial({color:0xffffff, roughness:.3, metalness:.55}), trimM=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.45, metalness:.35});
    const shadow=QUAL!=='low', byModel={}; for(const c of cars) (byModel[c.model] ||= []).push(c);
    for(const [model] of MODELS){ const list=byModel[model]; if(!list || !list.length) continue;
      let g; if(model==='taxi'){ g=V.buildCar(SENT,'sedan'); const sign=new THREE.Mesh(new THREE.BoxGeometry(.7,.24,.3), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xfff3b0, emissiveIntensity:.6})); sign.position.set(0,1.62,-.15); g.add(sign); const t=new THREE.Mesh(new THREE.BoxGeometry(.72,.08,.32), new THREE.MeshStandardMaterial({color:0x1d1f24})); t.position.set(0,1.48,-.15); g.add(t); }
      else if(model==='van'){ g=V.buildCar(SENT,'suv'); g.scale.set(1.06,1.3,1.42); g.userData.wScale=1.08; }
      else g=V.buildCar(SENT, model);
      const B=bake(g), bb=new THREE.Box3(); for(const geo of [B.body,B.trim]) if(geo){ geo.computeBoundingBox(); bb.union(geo.boundingBox); }
      const hl=Math.max(Math.abs(bb.min.z), bb.max.z), hw=(bb.max.x-bb.min.x)/2;
      const ims=[]; for(const [geo,mat] of [[B.body,bodyM],[B.trim,trimM]]){ if(!geo) continue; const im=new THREE.InstancedMesh(geo, mat, list.length); im.frustumCulled=false; im.castShadow=shadow; im.receiveShadow=true; im.userData.dynamic=true; im.name='v2car-'+model; scene.add(im); ims.push(im); }
      IM[model]={ims, body:B.body?ims[0]:null};
      list.forEach((c,i)=>{ c.mi=i; c.hl=hl; c.hw=hw; c.dyn.hl=hl; c.dyn.hw=hw; c.wheels=B.wheels; c.wr=B.r; if(IM[model].body) IM[model].body.setColorAt(i, new THREE.Color(model==='taxi' ? 0xf4c20d : c.color)); });
      if(IM[model].body && IM[model].body.instanceColor) IM[model].body.instanceColor.needsUpdate=true; }
    // bánh xe: 1 lượt vẽ cho mọi xe (lốp + mâm)
    const paint=(g,c)=>{ const n=g.attributes.position.count, a=new Float32Array(n*3), cc=new THREE.Color(c); for(let i=0;i<n;i++){ a[i*3]=cc.r; a[i*3+1]=cc.g; a[i*3+2]=cc.b; } g.setAttribute('color', new THREE.BufferAttribute(a,3)); for(const k of Object.keys(g.attributes)) if(!['position','normal','color'].includes(k)) g.deleteAttribute(k); return g; };
    const tire=new THREE.CylinderGeometry(1,1,.25,20).rotateZ(Math.PI/2).toNonIndexed(), rim=new THREE.CylinderGeometry(.64,.64,.26,14).rotateZ(Math.PI/2).toNonIndexed();
    wheelIM=new THREE.InstancedMesh(merge([paint(tire,0x1a1a1a), paint(rim,0xb8bec6)]), new THREE.MeshStandardMaterial({vertexColors:true, roughness:.5, metalness:.5}), cars.length*4);
    wheelIM.frustumCulled=false; wheelIM.castShadow=false; wheelIM.userData.dynamic=true; wheelIM.name='v2car-wheels'; scene.add(wheelIM);
    built=true; for(const c of cars) if(!c.active) hideCar(c); }

  for(let i=0;i<POOL;i++){ let r=RND(), model='sedan'; for(const [m,w] of MODELS){ r-=w; if(r<=0){ model=m; break; } }
    const dummy=new THREE.Object3D(); carGroup.add(dummy);
    const c={i, model, color:COLORS[(i*5+3)%COLORS.length], g:dummy, mi:0, hl:2.3, hw:.95, v:0, h:0, pitch:0, active:false, near:false, B:null, s:0, spin:0, wr:.36, wheels:[], stuck:0, ghost:0, blk:0, honk:0, hold:null, plan:null, top:1, kind:'car'};
    c.dyn={obj:dummy, hl:2.3, hw:.95, head:()=>c.h, on:()=>c.active && c.near, name:'ô tô'}; if(W.DYN) W.DYN.push(c.dyn); cars.push(c); }

  // bộ đệm đường đi của từng xe (làn phải + cung rẽ ở nút)
  const _o={}, _o2={};
  const newBuf=()=>({x:[], z:[], y:[], cum:[], vc:[], marks:[]});
  function pushPt(B, x, z, y, vmax){ const n=B.x.length; if(n){ const d=Math.hypot(x-B.x[n-1], z-B.z[n-1]); if(d<.25) return; B.cum.push(B.cum[n-1]+d); } else B.cum.push(0); B.x.push(x); B.z.push(z); B.y.push(y); B.vc.push(vmax); }
  function capCurv(B, from){ for(let i=Math.max(1,from); i<B.x.length-1; i++){ const ax=B.x[i]-B.x[i-1], az=B.z[i]-B.z[i-1], bx=B.x[i+1]-B.x[i], bz=B.z[i+1]-B.z[i], la=Math.hypot(ax,az)||1, lb=Math.hypot(bx,bz)||1;
      const ang=Math.acos(clamp((ax*bx+az*bz)/(la*lb),-1,1)), k=ang/((la+lb)/2); if(k>1e-4) B.vc[i]=Math.min(B.vc[i], Math.sqrt(2.4/k)); } }
  const rOf=e=>Math.min(7, e.len/3);
  function appendEdge(c, e, dir, dIn){ const B=c.B, n0=B.x.length, end=e.len-rOf(e); for(let d=dIn; d<end; d+=2){ lanePoint(e, dir, d, _o); pushPt(B, _o.x, _o.z, _o.y, e.vmax); } lanePoint(e, dir, Math.max(dIn,end), _o); pushPt(B, _o.x, _o.z, _o.y, e.vmax); capCurv(B, n0-1); c.e=e; c.dir=dir; }
  function chooseNext(c, nd){ const opts=nd.adj.filter(e=>e!==c.e); if(c.plan){ const s=c.plan.shift(); if(s && nd.adj.includes(s.e)) return s; c.plan=c.special?[]:null; if(c.special) return null; }
    if(!opts.length) return null; const e=opts[Math.floor(RND()*opts.length)]; return {e, dir:e.a===nd?1:-1}; }
  function extend(c){ const e=c.e, dir=c.dir, nd=dir>0?e.b:e.a, B=c.B, n0=B.x.length; const nx=chooseNext(c, nd);
    if(!nx){ if(c.special){ c.done=true; return; }
      // ngõ cụt → quay đầu nửa vòng tròn trong lòng đường
      lanePoint(e, dir, e.len, _o); const R=e.off, ux=_o.ux, uz=_o.uz, cx=_o.x+uz*R-ux*R, cz=_o.z-ux*R-uz*R, rx=-uz, rz=ux;
      for(let k=1;k<=10;k++){ const th=Math.PI*k/10; pushPt(B, cx+rx*R*Math.cos(th)+ux*R*Math.sin(th), cz+rz*R*Math.cos(th)+uz*R*Math.sin(th), _o.y, 3.5); }
      B.marks.push({s:B.cum[B.cum.length-1], nd, uturn:true}); capCurv(B, n0-1); appendEdge(c, e, -dir, Math.max(0, R*2-1)); return; }
    lanePoint(e, dir, e.len-rOf(e), _o); const P0x=_o.x, P0z=_o.z, P0y=_o.y, r2=rOf(nx.e); lanePoint(nx.e, nx.dir, r2, _o2);
    lanePoint(e, dir, e.len, _o); const ax=_o.x, az=_o.z, aux=_o.ux, auz=_o.uz; lanePoint(nx.e, nx.dir, 0, _o); const bx=_o.x, bz=_o.z;
    const dot=aux*_o.ux+auz*_o.uz; let Cx=(ax+bx)/2, Cz=(az+bz)/2; if(dot>-.6){ const k=1/Math.max(.35, 1+dot); Cx=nd.x+((ax-nd.x)+(bx-nd.x))*k; Cz=nd.z+((az-nd.z)+(bz-nd.z))*k; }   // điểm khống chế = giao 2 làn gần nút
    const sMark=B.cum[B.cum.length-1]+rOf(e), yN=nd.y;
    for(let k=1;k<=8;k++){ const t=k/8, u=1-t, x=u*u*P0x+2*u*t*Cx+t*t*_o2.x, z=u*u*P0z+2*u*t*Cz+t*t*_o2.z, y=t<.5 ? P0y+(yN-P0y)*t*2 : yN+(_o2.y-yN)*(t-.5)*2; pushPt(B, x, z, y, Math.min(e.vmax, nx.e.vmax)); }
    B.marks.push({s:sMark, nd}); capCurv(B, n0-1); appendEdge(c, nx.e, nx.dir, r2); }
  function trimBuf(c){ const B=c.B; let k=0; while(k<B.cum.length-2 && B.cum[k+1]<c.s-25) k++; if(k>40){ for(const a of ['x','z','y','cum','vc']) B[a].splice(0,k); } if(B.marks.length && B.marks[0].s<c.s-40) B.marks=B.marks.filter(m=>m.s>c.s-40); }
  function bufAt(B, s, o){ const c=B.cum; let lo=0, hi=c.length-1; while(hi-lo>1){ const m=(lo+hi)>>1; if(c[m]<=s) lo=m; else hi=m; }
    const t=clamp((s-c[lo])/((c[hi]-c[lo])||1),0,1); o.x=B.x[lo]+(B.x[hi]-B.x[lo])*t; o.z=B.z[lo]+(B.z[hi]-B.z[lo])*t; o.y=B.y[lo]+(B.y[hi]-B.y[lo])*t; o.i=lo; return o; }

  const sph=new THREE.Sphere(new THREE.Vector3(), 3);
  const inView=(x,y,z,r=3)=>{ sph.center.set(x,y+1,z); sph.radius=r; return !!W.FRUS && W.FRUS.intersectsSphere(sph); };
  let nearE=[], nearL=0;
  function refreshNear(){ nearE=[]; nearL=0; const r2=(RANGE+40)**2; for(const e of edges){ const m=e.x.length>>1, l=e.x.length-1; if((e.x[0]-P.x)**2+(e.z[0]-P.z)**2<r2 || (e.x[m]-P.x)**2+(e.z[m]-P.z)**2<r2 || (e.x[l]-P.x)**2+(e.z[l]-P.z)**2<r2){ nearE.push(e); nearL+=e.len; } } }
  function spawnCar(c, initial){ hideCar(c);
    for(let t=0;t<16 && nearE.length;t++){ let r=RND()*nearL, e=nearE[nearE.length-1]; for(const q of nearE){ r-=q.len; if(r<=0){ e=q; break; } } if(e.zone==='swiss' && RND()<.6) continue;
      const dir=RND()<.5?1:-1, d=RND()*e.len; lanePoint(e, dir, d, _o); const dist=Math.hypot(_o.x-P.x, _o.z-P.z);
      if(dist>RANGE || dist<(initial?25:60)) continue; if(!initial && dist<110 && inView(_o.x,_o.y,_o.z)) continue;
      if(cars.some(q=>q!==c && q.active && Math.hypot(q.g.position.x-_o.x, q.g.position.z-_o.z)<14)) continue;
      c.B=newBuf(); appendEdge(c, e, dir, d); c.s=0; c.v=Math.min(e.vmax, 7)*(.5+RND()*.5); c.stuck=0; c.ghost=0; c.hold=null; c.plan=null; c.top=.85+RND()*.25; c.active=true;
      bufAt(c.B, 1.5, _o2); c.h=Math.atan2(_o2.x-c.B.x[0], _o2.z-c.B.z[0]); placeCar(c, 0); return true; }
    return false; }
  function hideCar(c){ c.active=false; c.near=false; c.g.position.set(1e6,-1e3,1e6); if(c.hold){ if(c.hold.occ===c) c.hold.occ=null; c.hold=null; }
    if(!built) return; const M=IM[c.model]; if(M) for(const im of M.ims){ im.setMatrixAt(c.mi, _z); im.instanceMatrix.needsUpdate=true; } for(let k=0;k<4;k++) wheelIM.setMatrixAt(c.i*4+k, _z); wheelIM.instanceMatrix.needsUpdate=true; }
  function placeCar(c, dt){ const B=c.B; bufAt(B, c.s, _o); const x=_o.x, z=_o.z, y0=_o.y; bufAt(B, c.s+1.6, _o2); const yF=_o2.y, hx=_o2.x-x, hz=_o2.z-z; bufAt(B, Math.max(0,c.s-1.6), _o2); const yB=_o2.y;
    if(hx*hx+hz*hz>1e-4){ const th=Math.atan2(hx,hz); c.h=dt ? lerpAngle(c.h, th, 1-Math.exp(-dt*10)) : th; }
    c.pitch=-Math.atan2(yF-yB, 3.2); const y=((yF+yB)/2+y0)/2;
    c.g.position.set(x, y, z); c.g.rotation.set(c.pitch, c.h, 0, 'YXZ'); c.spin+=c.v*dt/(c.wr||.36);
    if(!built) return; const M=IM[c.model]; if(!M) return; _e.set(c.pitch, c.h, 0, 'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x, y+.02, z), _q, _s1);
    for(const im of M.ims){ im.setMatrixAt(c.mi, _m); im.instanceMatrix.needsUpdate=true; }
    const r=c.wr; for(let k=0;k<c.wheels.length && k<4;k++){ _we.set(c.spin,0,0); _wq.setFromEuler(_we); _wl.compose(c.wheels[k], _wq, _ws.set(r, r, r)); _w.multiplyMatrices(_m, _wl); wheelIM.setMatrixAt(c.i*4+k, _w); } wheelIM.instanceMatrix.needsUpdate=true; }

  // vật cản trước mũi xe: xe khác, xe đặc biệt, người chơi, người đi bộ đang qua đường
  let obs=[], horn=0;
  function gatherObs(){ obs=[]; for(const c of cars) if(c.active) obs.push({x:c.g.position.x, z:c.g.position.z, y:c.g.position.y, h:c.h, hl:c.hl, hw:c.hw, self:c, veh:true});
    for(const s of specials) obs.push({x:s.g.position.x, z:s.g.position.z, y:s.g.position.y, h:s.h, hl:2.6, hw:1.1, self:s, veh:true});
    if(!W.inside){ const V=W.life && W.life.V, r=V && V.riding && V.riding(); obs.push({x:P.x, z:P.z, y:P.y??0, h:P.face||0, hl:r?2.2:.35, hw:r?.95:.35, player:true}); }
    for(const q of PEDS) obs.push({x:q.x, z:q.z, y:q.y, h:q.h||0, hl:.3, hw:.3, ped:true}); }
  function limitFor(c){ let vt=99; const fx=Math.sin(c.h), fz=Math.cos(c.h), x=c.g.position.x, z=c.g.position.z, y=c.g.position.y; c.blk=0;
    for(const o of obs){ if(o.self===c || Math.abs(o.y-y)>3) continue; if(c.ghost>0 && o.veh) continue; const dx=o.x-x, dz=o.z-z, a=dx*fx+dz*fz; if(a<=0 || a>32) continue;
      const l=dx*(-fz)+dz*fx; if(Math.abs(l)>1.05+o.hw) continue; if(o.veh && Math.cos(o.h-c.h)<-.5 && a>c.hl+o.hl+3) continue;
      const gap=a-c.hl-o.hl, vv=Math.sqrt(2*4.5*Math.max(0, gap-(o.ped||o.player?3:2.2))); if(vv<vt){ vt=vv; c.blk=o.player?2:o.ped?1:(Math.cos(o.h-c.h)<-.3?4:3); } }
    return vt; }
  function curveLimit(c, vt){ const B=c.B, s0=c.s; for(let i=bufAt(B,s0,_o).i; i<B.cum.length && B.cum[i]<s0+34; i++){ const d=Math.max(0,B.cum[i]-s0); vt=Math.min(vt, Math.sqrt(B.vc[i]*B.vc[i]+2*3*d)); } return vt; }

  function updCar(c, dt){ const B=c.B;
    if(B.cum[B.cum.length-1]-c.s<70) extend(c);
    let vt=curveLimit(c, Math.min(c.e ? c.e.vmax : 10, 13)*c.top);
    // nhường nhau ở giao lộ (ô giao có ≥ 3 nhánh: mỗi lúc 1 xe đi qua)
    for(const m of B.marks){ const nd=m.nd; if(nd.deg<3) continue; const d=m.s-c.s; if(d<-nd.R-2){ if(c.hold===nd){ if(nd.occ===c) nd.occ=null; c.hold=null; } continue; }
      if(c.hold===nd) continue; if(d>nd.R+18) break;
      const busy=nd.occ && nd.occ!==c && nd.occ.active && (W.T??0)-nd.occT<9;
      if(busy){ vt=Math.min(vt, Math.sqrt(2*4*Math.max(0, d-nd.R-1.5))); break; }
      if(d<nd.R+6){ if(c.hold && c.hold!==nd && c.hold.occ===c) c.hold.occ=null; nd.occ=c; nd.occT=W.T??0; c.hold=nd; } break; }
    vt=Math.min(vt, limitFor(c));
    c.v+=clamp(vt-c.v, -7*dt, 2.6*dt); if(c.v<0) c.v=0; c.s+=c.v*dt;
    if(c.ghost>0) c.ghost-=dt;
    if(c.v<.1 && (c.blk===3 || c.blk===4)){ c.stuck+=dt; if(c.stuck>(c.blk===4?4:9)){ c.ghost=2.5; c.stuck=0; } } else if(c.v>.6) c.stuck=0;   // kẹt lâu (mặt đối mặt) → lách qua
    if(c.blk===2 && c.v<.3){ c.honk+=dt; if(c.honk>2.2 && horn<=0 && Math.hypot(c.g.position.x-P.x, c.g.position.z-P.z)<16){ horn=9; toast('🚗 Bíp bíp! Xe đang chờ – bước lên vỉa hè nhé.', 2200); } } else c.honk=0;
    trimBuf(c); placeCar(c, dt); }

  /* ---------- xe đặc biệt (Pha 10): cảnh sát · cứu hoả · cứu thương ---------- */
  // spawnVehicle(kind, route) – route = kết quả roadNet.route(...) hoặc điểm đích {x,z}; opt.from = điểm xuất phát (mặc định: đường gần người chơi)
  function spawnVehicle(kind='police', rt=null, opt={}){ const V=W.life && W.life.V; if(!V) return null;
    const SPEC={police:['sedan',0xf4f4f4,0x1546c2], fire:['pickup',0xc8161d,0xffd400], ambulance:['suv',0xffffff,0xd7263d]}[kind]||['sedan',0xf4f4f4,0x1546c2];
    let r=rt; if(r && !r.edges && r.x!==undefined) r=route(opt.from||{x:P.x, z:P.z}, r);
    if(!r || !r.edges || !r.edges.length) return null;
    const g=V.buildCar(SPEC[1], SPEC[0], {stripe:SPEC[2]}); if(kind==='fire') g.scale.set(1.2,1.25,1.35); if(kind==='ambulance') g.scale.set(1.08,1.3,1.4);
    const lamps=[]; for(const [sx,col] of [[-.3,0xff1a1a],[.3,0x1a4dff]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(.45,.14,.25), new THREE.MeshStandardMaterial({color:col, emissive:col, emissiveIntensity:2})); m.position.set(sx,1.6,-.1); g.add(m); lamps.push(m); }
    g.userData.dynamic=true; scene.add(g);
    const s={kind, g, lamps, special:true, v:0, h:0, s:0, B:newBuf(), plan:r.edges.slice(), active:true, hl:2.6, hw:1.1, done:false, arrived:false, t:0, ghost:0, blk:0, route:r};
    const first=s.plan.shift(); appendEdge(s, first.e, first.dir, 0); bufAt(s.B,1.5,_o2); s.h=Math.atan2(_o2.x-s.B.x[0], _o2.z-s.B.z[0]);
    const dyn={obj:g, hl:2.6, hw:1.1, head:()=>s.h, on:()=>s.active, name:{police:'xe cảnh sát', fire:'xe cứu hoả', ambulance:'xe cứu thương'}[kind]||'xe'}; if(W.DYN) W.DYN.push(dyn);
    s.remove=()=>{ s.active=false; scene.remove(g); const i=specials.indexOf(s); if(i>=0) specials.splice(i,1); if(W.DYN){ const j=W.DYN.indexOf(dyn); if(j>=0) W.DYN.splice(j,1); } };
    specials.push(s); return s; }
  function updSpecial(s, dt){ s.t+=dt; const B=s.B; if(!s.done && B.cum[B.cum.length-1]-s.s<70){ if(s.plan.length) extend(s); else s.done=true; }
    let vt=curveLimit(s, 15); const left=B.cum[B.cum.length-1]-s.s; if(s.done) vt=Math.min(vt, Math.sqrt(2*3*Math.max(0,left-1))); vt=Math.min(vt, limitFor(s));
    if(s.ghost>0) s.ghost-=dt; if(s.v<.2 && (s.blk===3 || s.blk===4)){ s.stuck=(s.stuck||0)+dt; if(s.stuck>3){ s.ghost=3; s.stuck=0; } } else s.stuck=0;   // xe ưu tiên kẹt sau xe khác → lách qua
    s.v+=clamp(vt-s.v,-7*dt,3*dt); if(s.v<0) s.v=0; s.s+=s.v*dt; bufAt(B,s.s,_o); bufAt(B,s.s+1.6,_o2); if((_o2.x-_o.x)**2+(_o2.z-_o.z)**2>1e-4) s.h=lerpAngle(s.h, Math.atan2(_o2.x-_o.x,_o2.z-_o.z), 1-Math.exp(-dt*10));
    s.g.position.set(_o.x, (_o.y+_o2.y)/2, _o.z); s.g.rotation.set(-Math.atan2(_o2.y-_o.y,1.6), s.h, 0, 'YXZ'); const on=Math.floor(s.t*4)%2; s.lamps[0].visible=!!on; s.lamps[1].visible=!on;
    if(s.done && left<1.5 && s.v<.05) s.arrived=true; trimBuf(s); }

  /* ============================== 4. NGƯỜI ĐI BỘ BỔ SUNG ============================== */
  let ped=null; try{ ped=await makePeds(); }catch(e){ console.warn('[v2traffic] người đi bộ', e); }
  async function makePeds(){ if(!W.people) return null;
    // 4a. vật cản (lưới băm 4 m) – như js/pedestrians.js
    const G=new Map(), gk=(x,z)=>Math.floor(x/4)*65536+Math.floor(z/4);
    const ins=(o,x0,z0,x1,z1)=>{ for(let i=Math.floor(x0/4); i<=Math.floor(x1/4); i++) for(let j=Math.floor(z0/4); j<=Math.floor(z1/4); j++){ const k=i*65536+j; let L=G.get(k); if(!L) G.set(k,L=[]); L.push(o); } };
    for(const c of circles){ if(c.owner) continue; ins({t:0,o:c}, c.x-c.r-.6, c.z-c.r-.6, c.x+c.r+.6, c.z+c.r+.6); }
    for(const b of boxes){ if(b.x0>1e8 || (b.x1-b.x0)*(b.z1-b.z0)>6e4) continue; ins({t:1,o:b}, b.x0-.6, b.z0-.6, b.x1+.6, b.z1+.6); }
    for(const s of (W.SEGS||[])){ if(Math.hypot(s.bx-s.ax, s.bz-s.az)>300) continue; ins({t:2,o:s}, s.x0-.6, s.z0-.6, s.x1+.6, s.z1+.6); }
    const blocked=(x,z,y,r=.32)=>{ const L=G.get(gk(x,z)); if(!L) return false; for(const q of L){ const o=q.o; if(o.y0!==undefined && y!==undefined && (y<o.y0-.3 || y>o.y1)) continue;
        if(q.t===0){ const dx=x-o.x, dz=z-o.z, m=o.r+r; if(dx*dx+dz*dz<m*m) return true; }
        else if(q.t===1){ const dx=Math.max(o.x0-x,0,x-o.x1), dz=Math.max(o.z0-z,0,z-o.z1); if(dx*dx+dz*dz<r*r) return true; }
        else { const ex=o.bx-o.ax, ez=o.bz-o.az, L2=ex*ex+ez*ez||1e-9; let t=((x-o.ax)*ex+(z-o.az)*ez)/L2; t=t<0?0:t>1?1:t; const dx=x-o.ax-ex*t, dz=z-o.az-ez*t, m=o.r+r; if(dx*dx+dz*dz<m*m) return true; } } return false; };
    const segFree=(x0,z0,x1,z1,y)=>{ const d=Math.hypot(x1-x0,z1-z0), n=Math.ceil(d/.4); for(let k=1;k<n;k++){ const t=k/n; if(blocked(x0+(x1-x0)*t, z0+(z1-z0)*t, y, .28)) return false; } return true; };
    // 4b. làn vỉa hè: 2 bên mọi cạnh đường, cách mép đường 2,2 m, cùng cao độ mặt đường (cầu không có vỉa hè thì không có người)
    const LANES=[];
    for(const e of edges){ if(e.zone==='brain' || e.zone==='swiss' || e.len<20) continue;
      for(const side of [-1,1]){ const off=e.w/2+2.2, run=[]; const flush=()=>{ if(run.length>=9){ const N=run.length, L={x:new Float32Array(N), z:new Float32Array(N), y:new Float32Array(N), cum:new Float32Array(N), e, side};
            run.forEach((p,i)=>{ L.x[i]=p[0]; L.z[i]=p[1]; L.y[i]=p[2]; if(i) L.cum[i]=L.cum[i-1]+Math.hypot(p[0]-run[i-1][0], p[1]-run[i-1][1]); }); L.len=L.cum[N-1]; LANES.push(L); } run.length=0; };
        for(let d=1; d<e.len-1; d+=2){ edgePt(e, d, _o); const x=_o.x-_o.uz*off*side, z=_o.z+_o.ux*off*side, yr=_o.y, y=gAtY(x,z,yr+.8);
          if(Math.abs(y-yr)<.7 && !blocked(x,z,y) && !onRoad(x,z,yr,.4)) run.push([x,z,y]); else flush(); } flush(); } }
    if(!LANES.length) return null;
    // 4c. nối đầu làn: rẽ góc phố (không băng qua đường) hoặc qua đường ở vạch (băng qua đúng 1 lòng đường, gần vuông góc)
    const ENDS=[]; LANES.forEach(L=>{ const n=L.x.length-1; L.ends=[{L, at:0, x:L.x[0], z:L.z[0], y:L.y[0], links:[]}, {L, at:1, x:L.x[n], z:L.z[n], y:L.y[n], links:[]}]; ENDS.push(...L.ends); });
    const ZEB=[];
    for(let i=0;i<ENDS.length;i++) for(let j=i+1;j<ENDS.length;j++){ const A=ENDS[i], B=ENDS[j]; if(A.L===B.L) continue; const d=Math.hypot(A.x-B.x, A.z-B.z); if(d>34 || Math.abs(A.y-B.y)>.8) continue;
      let road=0, prev=false, rc=null; const n=Math.ceil(d/.8); for(let k=1;k<n;k++){ const t=k/n, x=A.x+(B.x-A.x)*t, z=A.z+(B.z-A.z)*t, on=onRoad(x,z,A.y,.2); if(on && !prev){ road++; rc=nearest(x,z,16,A.y); } prev=on; }
      if(road===0){ if(d<10 && segFree(A.x,A.z,B.x,B.z,A.y)){ A.links.push({to:B, cross:false}); B.links.push({to:A, cross:false}); } continue; }
      if(road!==1 || !rc || d>rc.e.w+12 || d<rc.e.w*.8) continue;
      const ux=(B.x-A.x)/d, uz=(B.z-A.z)/d, ei=Math.min(rc.i+1, rc.e.x.length-1), si=Math.max(0,ei-1), tx=rc.e.x[ei]-rc.e.x[si], tz=rc.e.z[ei]-rc.e.z[si], tl=Math.hypot(tx,tz)||1;
      if(Math.abs((tx*ux+tz*uz)/tl)>.35 || A.links.some(l=>l.cross) || B.links.some(l=>l.cross)) continue;
      const z={A, B, e:rc.e, mx:(A.x+B.x)/2, mz:(A.z+B.z)/2, y:rc.y, ux, uz, d}; ZEB.push(z); A.links.push({to:B, cross:true, zb:z}); B.links.push({to:A, cross:true, zb:z}); }
    // vạch qua đường (1 lượt vẽ)
    if(ZEB.length){ const quads=[]; for(const z of ZEB){ const W2=z.e.w/2; for(let k=-W2+.4; k<W2-.3; k+=.9) quads.push([z.mx+z.ux*k, z.mz+z.uz*k, z.y, z.ux, z.uz]); }
      const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2), new THREE.MeshStandardMaterial({color:0xf2f2ee, roughness:.6, polygonOffset:true, polygonOffsetFactor:-4, polygonOffsetUnits:-4}), quads.length);
      const m=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(2.6,1,.5), p=new THREE.Vector3(), up=new THREE.Vector3(0,1,0);
      quads.forEach(([x,z,y,ux,uz],i)=>{ q.setFromAxisAngle(up, Math.atan2(ux,uz)); m.compose(p.set(x,y+.035,z), q, s); im.setMatrixAt(i,m); });
      im.userData.dynamic=true; im.castShadow=false; im.receiveShadow=true; im.name='v2-zebra'; scene.add(im); }
    // 4d. dáng người (people.js) + LOD rút gọn + sải chân đo từ clip (không trượt chân)
    function decimate(geo, cell=.03){ const Pa=geo.attributes.position, Na=geo.attributes.normal, Ca=geo.attributes.color, SI=geo.attributes.skinIndex, SWa=geo.attributes.skinWeight, n=Pa.count; if(!geo.index || !SI || !SWa) return geo;
      const map=new Map(), rep=new Int32Array(n), keep=[], sum=[];
      for(let i=0;i<n;i++){ let db=0, bw=-1; for(let k=0;k<4;k++){ const w=SWa.getComponent(i,k); if(w>bw){ bw=w; db=SI.getComponent(i,k); } }
        const key=(((Math.round(Pa.getX(i)/cell)+512)*1024+(Math.round(Pa.getY(i)/cell)+512))*1024+(Math.round(Pa.getZ(i)/cell)+512))*128+db;
        let r=map.get(key); if(r===undefined){ r=keep.length; map.set(key,r); keep.push(i); sum.push([0,0,0,0,0,0,0]); } rep[i]=r; const s=sum[r]; s[0]+=Pa.getX(i); s[1]+=Pa.getY(i); s[2]+=Pa.getZ(i); if(Na){ s[3]+=Na.getX(i); s[4]+=Na.getY(i); s[5]+=Na.getZ(i); } s[6]++; }
      const src=geo.index.array, tri=[]; for(let t=0;t<src.length;t+=3){ const a=rep[src[t]], b=rep[src[t+1]], c=rep[src[t+2]]; if(a!==b && b!==c && a!==c) tri.push(a,b,c); }
      const m=keep.length, pos=new Float32Array(m*3), nor=new Float32Array(m*3); for(let r=0;r<m;r++){ const s=sum[r]; pos[r*3]=s[0]/s[6]; pos[r*3+1]=s[1]/s[6]; pos[r*3+2]=s[2]/s[6]; const l=Math.hypot(s[3],s[4],s[5])||1; nor[r*3]=s[3]/l; nor[r*3+1]=s[4]/l; nor[r*3+2]=s[5]/l; }
      const cp=(attr,Arr,k)=>{ const out=new Arr(m*k); for(let r=0;r<m;r++){ const i=keep[r]; for(let q=0;q<k;q++) out[r*k+q]=attr.array[i*k+q]; } return out; };
      const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('normal', new THREE.BufferAttribute(nor,3)); if(Ca) g.setAttribute('color', new THREE.BufferAttribute(cp(Ca,Float32Array,3),3));
      g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(cp(SI,Uint16Array,4),4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(cp(SWa,Float32Array,4),4)); g.setIndex(tri); g.computeBoundingSphere(); return g; }
    const skinOf=o=>{ let s=null; o.traverse(m=>{ if(m.isSkinnedMesh && !s) s=m; }); return s; };
    function strideK(a, clip, def){ try{ const act=a.mixer.clipAction(clip), bn={}; a.g.traverse(o=>{ if(o.isBone) bn[o.name.replace(/^mixamorig:?/,'')]=o; }); const L=bn.LeftFoot, Rt=bn.RightFoot; if(!L||!Rt) return def;
        const g=a.g; g.position.set(0,-300,0); g.rotation.y=0; act.reset().play(); const N=48, dur=clip.duration, ql=new THREE.Vector3(), qr=new THREE.Vector3(), pl=new THREE.Vector3(), pr=new THREE.Vector3(), vs=[];
        for(let i=0;i<=N;i++){ act.time=dur*i/N; a.mixer.update(0); g.updateMatrixWorld(true); L.getWorldPosition(ql); Rt.getWorldPosition(qr); if(i){ const lft=pl.y<pr.y; vs.push(-(lft?ql.z-pl.z:qr.z-pr.z)/(dur/N)); } pl.copy(ql); pr.copy(qr); }
        act.stop(); vs.sort((x,y)=>x-y); const v=vs[vs.length>>1]; return v>.4 && v<8 ? v/a.h : def; }catch(e){ return def; } }
    const NPOOL={low:12, medium:18, high:24}[QUAL] ?? 16, NV=Math.min(14, NPOOL), VAR=[];
    for(let i=0;i<NV;i++){ const kk=W.people.kit(W.people.seedFor(i%2?'f':'m', 700+i*23)), sk=skinOf(kk.gl.scene); let lod=sk.geometry, gl=kk.gl;
      try{ lod=decimate(sk.geometry); const tm=W.SkeletonUtils.clone(kk.gl.scene); skinOf(tm).geometry=lod; gl={scene:tm, animations:kk.gl.animations}; }catch(e){}
      VAR.push({kk, gl, full:sk.geometry, lod}); }
    // chó (Fox.glb) – tối đa 3 con, đi cạnh chủ
    let FOX=null; try{ FOX=await new Promise(res=>new GLTFLoader().load('assets/models/Fox.glb', res, undefined, ()=>res(null))); }catch(e){}
    const dogs=[]; if(FOX) for(let i=0;i<3;i++){ const root=W.SkeletonUtils.clone(FOX.scene); root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.frustumCulled=false; } });
      const g=new THREE.Group(); g.add(root); g.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(root), s=.5/((b.max.y-b.min.y)||1); root.scale.multiplyScalar(s); root.position.y=-b.min.y*s; g.visible=false; g.userData.dynamic=true; scene.add(g);
      const mixer=new THREE.AnimationMixer(root), walk=FOX.animations.find(c=>/walk/i.test(c.name)); const A={walk:walk&&mixer.clipAction(walk)}; if(A.walk) A.walk.play();
      dogs.push({g, mixer, A, owner:null, x:0, z:0, h:0}); }
    const NPOOLb=NPOOL, bagIM=new THREE.InstancedMesh(new THREE.BoxGeometry(.3,.34,.12), new THREE.MeshStandardMaterial({color:0xffffff, roughness:.7}), NPOOLb); bagIM.frustumCulled=false; bagIM.userData.dynamic=true; bagIM.castShadow=false; bagIM.name='v2-bags'; scene.add(bagIM);
    const BAGC=[0xd7263d,0x1b4f9c,0xf4c20d,0x2e8b57,0x8a5a3c,0x1d1f24]; for(let i=0;i<NPOOLb;i++){ bagIM.setColorAt(i, new THREE.Color(BAGC[i%BAGC.length])); bagIM.setMatrixAt(i, _z); } bagIM.instanceColor.needsUpdate=true;
    let KW=1.49/1.78, KR=3.4/1.78;
    const peds=[];
    for(let i=0;i<NPOOL;i++){ const V=VAR[i%NV], kk=V.kk, h=kk.h*(i<NV?1:.96+RND()*.08);
      const a=W.makeActor(V.gl, {name:'người đi dạo', height:h, face:0, clips:{idle:kk.clips.idle, walk:kk.clips.walk, run:kk.clips.run}, compact:false}); if(a.label){ W.removeLabel(a.label); a.label=null; }
      a.mesh=skinOf(a.root); a.full=V.full; a.lod=V.lod; if(QUAL==='low') a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
      if(i===0){ KW=strideK(a, kk.clips.walk, KW); KR=strideK(a, kk.clips.run, KR); }
      a.g.visible=false; let hand=null; a.g.traverse(o=>{ if(o.isBone && !hand && /RightHand$/.test(o.name)) hand=o; });
      const p={i, a, h, hand, poser:makePoser(THREE, a), kind:'walk', state:'off', L:null, s:0, dir:1, v:0, v0:1.2, x:1e9, z:1e9, y:0, hd:0, acc:0, bag:false, phone:false, dog:null, partner:null, lead:false, lat:0, seat:null, sitT:0, tgt:null, back:null, cross:null, wait:0, col:{x:1e9, z:1e9, r:.28}};
      p.col.owner=p; circles.push(p.col); peds.push(p); }
    const lanePos=(L,s,lat,o)=>{ const c=L.cum, N=c.length; s=clamp(s,0,L.len); let lo=0, hi=N-1; while(hi-lo>1){ const m=(lo+hi)>>1; if(c[m]<=s) lo=m; else hi=m; } const dl=(c[hi]-c[lo])||1, t=(s-c[lo])/dl;
      const ux=(L.x[hi]-L.x[lo])/dl, uz=(L.z[hi]-L.z[lo])/dl; o.x=L.x[lo]+(L.x[hi]-L.x[lo])*t-uz*lat; o.z=L.z[lo]+(L.z[hi]-L.z[lo])*t+ux*lat; o.y=L.y[lo]+(L.y[hi]-L.y[lo])*t; o.ux=ux; o.uz=uz; return o; };
    let nearLn=[], nearLL=0, want=NPOOL, teleported=true; const PR={low:70, medium:85, high:95}[QUAL] ?? 80;
    function refresh(){ nearLn=[]; nearLL=0; const r2=(PR+30)**2; for(const L of LANES){ const m=L.x.length>>1, l=L.x.length-1; if((L.x[0]-P.x)**2+(L.z[0]-P.z)**2<r2 || (L.x[m]-P.x)**2+(L.z[m]-P.z)**2<r2 || (L.x[l]-P.x)**2+(L.z[l]-P.z)**2<r2){ nearLn.push(L); nearLL+=L.len; } } }
    function hide(p){ p.state='off'; p.a.g.visible=false; p.col.x=p.col.z=1e9; p.x=p.z=1e9; p.v=0; if(p.seat){ if(p.seat.taken===p) p.seat.taken=null; p.seat=null; } if(p.dog){ p.dog.g.visible=false; p.dog.owner=null; p.dog=null; }
      if(p.partner){ const q=p.partner; p.partner=null; if(q.partner===p){ q.partner=null; q.lead=false; } } p.lead=false; if(p.bag){ bagIM.setMatrixAt(p.i,_z); bagIM.instanceMatrix.needsUpdate=true; } }
    function pickKind(p){ const r=RND(); p.kind=r<.14?'jog':r<.27?'dog':'walk'; if(p.kind==='dog'){ const d=dogs.find(d=>!d.owner); if(d){ p.dog=d; d.owner=p; d.g.visible=true; } else p.kind='walk'; }
      p.v0=p.kind==='jog'?2.5+RND()*.6:1.12+RND()*.3; p.bag=p.kind==='walk' && RND()<.3; p.phone=p.kind==='walk' && !p.bag && RND()<.18; p.lat=(RND()-.5)*.5; }
    function spawn(p, initial){ hide(p);
      for(let t=0;t<14 && nearLn.length;t++){ let r=RND()*nearLL, L=nearLn[nearLn.length-1]; for(const q of nearLn){ r-=q.len; if(r<=0){ L=q; break; } }
        const s=RND()*L.len, o=lanePos(L,s,0,{}), d=Math.hypot(o.x-P.x,o.z-P.z); if(d>PR || d<(initial?6:24)) continue; if(!initial && d<55 && inView(o.x,o.y,o.z,1.2)) continue;
        if(peds.some(q=>q!==p && q.state!=='off' && Math.abs(q.x-o.x)+Math.abs(q.z-o.z)<1.6)) continue;
        pickKind(p); p.L=L; p.s=s; p.dir=RND()<.5?1:-1; p.state='walk'; p.v=p.v0*.8; p.x=o.x; p.z=o.z; p.y=o.y; p.hd=Math.atan2(o.ux*p.dir,o.uz*p.dir); p.a.g.visible=true; p.a.play(p.kind==='jog'?'run':'walk',0);
        if(p.dog){ p.dog.x=p.x; p.dog.z=p.z; }
        // đi theo cặp (2 người song song, cùng tốc độ)
        if(p.kind==='walk' && RND()<.25){ const q=peds.find(q=>q!==p && q.state==='off' && q.i<want); if(q){ q.kind='walk'; q.v0=p.v0; q.L=L; q.s=s; q.dir=p.dir; q.state='walk'; q.v=p.v; q.bag=RND()<.3; q.phone=false; q.lat=0;
            q.partner=p; p.partner=q; p.lead=true; q.lead=false; q.a.g.visible=true; q.a.play('walk',0); q.x=p.x; q.z=p.z; q.y=p.y; q.hd=p.hd; } }
        return; } }
    function laneEnd(p){ const end=p.L.ends[p.dir>0?1:0], opts=end.links.filter(l=>!(l.cross && p.partner)); const pick=(opts.length && RND()<.8) ? opts[Math.floor(RND()*opts.length)] : null;
      if(!pick){ p.dir=-p.dir; return; } if(pick.cross){ p.cross={zb:pick.zb, from:end, to:pick.to, t:0}; p.state='curb'; p.wait=0; return; } enterLane(p, pick.to); }
    function enterLane(p, to){ p.L=to.L; p.dir=to.at===0?1:-1; p.s=to.at===0?0:p.L.len; p.state='walk'; }
    function safeToCross(zb){ for(const c of cars){ if(!c.active) continue; const dx=c.g.position.x-zb.mx, dz=c.g.position.z-zb.mz, d=Math.hypot(dx,dz); if(d>30 || Math.abs(c.g.position.y-zb.y)>3) continue; if(d<zb.e.w/2+3) return false;
        if(-(dx*Math.sin(c.h)+dz*Math.cos(c.h))>0 && c.v>.5) return false; } for(const s of specials) if(Math.hypot(s.g.position.x-zb.mx, s.g.position.z-zb.mz)<40) return false; return true; }
    const ahead=(p,fx,fz)=>{ let lim=99; const test=(x,z,rr,v,same)=>{ const dx=x-p.x, dz=z-p.z; if(dx*dx+dz*dz>3) return; const a=dx*fx+dz*fz, l=dx*(-fz)+dz*fx; if(a<=.05 || a>.9+rr || Math.abs(l)>.3+rr) return; const lv=same?Math.max(0,v*.92):0; if(lv<lim) lim=lv; };
      if(!W.inside) test(P.x,P.z,.34,0,false); for(const q of peds){ if(q===p || q.state==='off' || q===p.partner) continue; test(q.x,q.z,.3,q.v,(Math.sin(q.hd)*fx+Math.cos(q.hd)*fz)>.5); } return lim; };
    const seats=W.seats||[];
    function trySit(p){ if(p.partner || p.dog || p.kind==='jog') return false; for(const s of seats){ if(s.taken || (s.scope && s.scope!=='world') || s.lie) continue; const dx=s.x-p.x, dz=s.z-p.z; if(dx*dx+dz*dz>64 || Math.abs((s.floor??s.y)-p.y)>.8) continue;
        const k=s.back?-.75:.75, ax=s.x+Math.sin(s.rot)*k, az=s.z+Math.cos(s.rot)*k; if(!segFree(p.x,p.z,ax,az,p.y)) continue;
        s.taken=p; p.seat=s; p.state='toSeat'; p.tgt={x:ax, z:az}; p.back={L:p.L, s:p.s, dir:p.dir}; p.sitT=12+RND()*25; return true; } return false; }
    let pAcc=0, frameN=0;
    function upd(dt){ frameN++; PEDS.length=0; if(W.inside) return;
      pAcc-=dt; if(pAcc<=0){ pAcc=.6; refresh(); }
      want=Math.round(NPOOL*(W.night>.65?.5:1));
      for(const p of peds){
        if(p.state==='off'){ if(p.i<want && nearLn.length) spawn(p, teleported); if(p.state==='off') continue; }
        else if(p.i>=want && !p.partner && !p.a.root.visible){ hide(p); continue; }
        const d2=(p.x-P.x)**2+(p.z-P.z)**2; if(d2>(PR+25)**2 && (!p.a.root.visible || d2>110*110)){ hide(p); continue; }
        const px=p.x, pz=p.z; let moving=true; const clip=p.kind==='jog'?'run':'walk';
        const follow=p.partner && !p.lead && p.partner.state==='walk' && p.state==='walk';
        if(follow){ const q=p.partner; p.L=q.L; p.dir=q.dir; p.s=q.s; p.v=q.v; const o=lanePos(p.L,p.s,(q.lat>0?q.lat-.75:q.lat+.75)*p.dir,_o); const k=Math.min(1,dt*4); p.x+=(o.x-p.x)*k; p.z+=(o.z-p.z)*k; p.y=o.y; moving=q.v>.15; }
        else if(p.state==='walk'){ lanePos(p.L,p.s,p.lat*p.dir,_o); let v=p.v0; const lim=ahead(p, _o.ux*p.dir, _o.uz*p.dir); if(lim<v) v=lim;
          if(lim<.15){ p.wait+=dt; if(p.wait>2){ p.dir=-p.dir; p.wait=0; } } else p.wait=0;   // bị chặn lâu (người chơi đứng chắn) → quay lại
          p.v+=(v-p.v)*Math.min(1,dt*(v>p.v?3:6)); p.s+=p.dir*p.v*dt;
          if(p.s<0 || p.s>p.L.len){ p.s=clamp(p.s,0,p.L.len); if(!(RND()<.25 && trySit(p))) laneEnd(p); } else if(RND()<dt*.02) trySit(p);
          if(p.state==='walk'){ const o2=lanePos(p.L,p.s,p.lat*p.dir,_o), k=Math.min(1,dt*5); p.x+=(o2.x-p.x)*k; p.z+=(o2.z-p.z)*k; p.y=o2.y; } moving=p.v>.15; }
        else if(p.state==='curb'){ const A=p.cross.from, k=Math.min(1,dt*3); p.x+=(A.x-p.x)*k; p.z+=(A.z-p.z)*k; p.y=A.y; p.v=0; moving=false; p.wait+=dt;
          if(p.wait>.6 && safeToCross(p.cross.zb)){ p.state='cross'; p.cross.t=0; } else if(p.wait>25){ p.dir=-p.dir; p.state='walk'; p.cross=null; } }
        else if(p.state==='cross'){ const c=p.cross, A=c.from, B=c.to, D=Math.hypot(B.x-A.x,B.z-A.z)||1; p.v=Math.max(p.v0,1.45); c.t+=p.v*dt/D; const t=Math.min(1,c.t);
          p.x=A.x+(B.x-A.x)*t; p.z=A.z+(B.z-A.z)*t; p.y=t>.1 && t<.9 ? Math.min(A.y+(B.y-A.y)*t, gAtY(p.x,p.z,A.y+.5)) : A.y+(B.y-A.y)*t;
          PEDS.push({x:p.x, z:p.z, y:p.y, h:p.hd}); if(c.t>=1){ enterLane(p, B); p.cross=null; } }
        else if(p.state==='toSeat'){ const dx=p.tgt.x-p.x, dz=p.tgt.z-p.z, d=Math.hypot(dx,dz); p.v=p.v0; if(d<.12) p.state='sit'; else { const st=Math.min(d,p.v*dt); p.x+=dx/d*st; p.z+=dz/d*st; p.y=gAtY(p.x,p.z,p.y+.5); } }
        else if(p.state==='sit'){ const s=p.seat; p.v=0; moving=false; p.sitT-=dt; if(p.sitT<=0 || s.taken!==p){ if(s.taken===p) s.taken=null; p.seat=null; p.state='fromSeat'; } }
        else if(p.state==='fromSeat'){ const o=lanePos(p.back.L,p.back.s,0,_o), dx=o.x-p.x, dz=o.z-p.z, d=Math.hypot(dx,dz); p.v=p.v0; if(d<.15){ p.L=p.back.L; p.s=p.back.s; p.dir=p.back.dir; p.state='walk'; } else { const st=Math.min(d,p.v*dt); p.x+=dx/d*st; p.z+=dz/d*st; p.y=gAtY(p.x,p.z,o.y+.5); } }
        // hướng mặt theo hướng đi thật
        const mx=p.x-px, mz=p.z-pz, sit=p.state==='sit';
        if(sit) p.hd=p.seat.rot; else if(p.state==='curb') p.hd=lerpAngle(p.hd, Math.atan2(p.cross.to.x-p.cross.from.x, p.cross.to.z-p.cross.from.z), 1-Math.exp(-dt*4)); else if(mx*mx+mz*mz>1e-7) p.hd=lerpAngle(p.hd, Math.atan2(mx,mz), 1-Math.exp(-dt*7));
        p.col.x=sit?1e9:p.x; p.col.z=sit?1e9:p.z;
        const a=p.a; if(sit){ const s=p.seat; a.g.position.set(s.x-Math.sin(s.rot)*.12, (s.y??p.y)-p.poser.hipsHeight()+.12, s.z-Math.cos(s.rot)*.12); } else a.g.position.set(p.x, p.y, p.z);
        a.g.rotation.y=p.hd;
        if(moving && p.v>.15){ a.play(clip,.3); const act=a.acts[clip]; if(act) act.setEffectiveTimeScale(p.v/((clip==='run'?KR:KW)*p.h)); } else a.play('idle',.3);
        if(a.root.visible){ const cd=Math.hypot(p.x-W.camera.position.x, p.z-W.camera.position.z), every=cd<16?1:cd<40?2:3; p.acc+=dt; const geo=cd<14?a.full:a.lod; if(a.mesh && a.mesh.geometry!==geo) a.mesh.geometry=geo;
          if((frameN+p.i)%every===0){ a.mixer.update(Math.min(p.acc,.25)); p.acc=0; if(sit) p.poser.apply('sit', W.T); else if(p.phone && cd<40) p.poser.apply('phone', W.T); } }
        else p.acc=Math.min(.5,p.acc+dt);
        // túi xách trong tay phải
        if(p.bag){ if(p.hand && a.root.visible && !sit){ p.hand.updateWorldMatrix(true,false); _p.setFromMatrixPosition(p.hand.matrixWorld); _e.set(0,p.hd,0); _q.setFromEuler(_e); _m.compose(_p.set(_p.x, _p.y-.24, _p.z), _q, _s1); bagIM.setMatrixAt(p.i,_m); } else bagIM.setMatrixAt(p.i,_z); bagIM.instanceMatrix.needsUpdate=true; }
        // chó đi bên trái-sau chủ
        if(p.dog){ const dg=p.dog, fx=Math.sin(p.hd), fz=Math.cos(p.hd), tx=p.x-fx*1.1-fz*.6, tz=p.z-fz*1.1+fx*.6, dx=tx-dg.x, dz=tz-dg.z, dd=Math.hypot(dx,dz), k=Math.min(1,dt*3);
          dg.x+=dx*k; dg.z+=dz*k; if(dd>.05) dg.h=lerpAngle(dg.h, Math.atan2(dx,dz), 1-Math.exp(-dt*6)); dg.g.position.set(dg.x, gAtY(dg.x,dg.z,p.y+.5), dg.z); dg.g.rotation.y=dg.h;
          if(dg.A.walk) dg.A.walk.setEffectiveTimeScale(clamp(dd*3+p.v*.8, .05, 2.2)); if(a.root.visible) dg.mixer.update(dt); } }
      teleported=false; }
    return {peds, LANES, ZEB, dogs, upd, get KW(){ return KW; }, get KR(){ return KR; }, onTeleport(){ teleported=true; for(const p of peds) hide(p); }};
  }

  /* ============================== 5. KHUNG HÌNH ============================== */
  let nAcc=0, lpx=P.x, lpz=P.z, enabled=true, frameC=0;
  HOOK.onFrame.push((dtIn)=>{ const dt=Math.min(dtIn,.1); frameC++;
    if(!enabled) return;
    if(!built){ if(W.life && W.life.V){ try{ buildModels(); }catch(e){ console.warn('[v2traffic] dựng xe', e); enabled=false; return; } } else return; }
    if(horn>0) horn-=dt;
    const jump=Math.hypot(P.x-lpx, P.z-lpz)>60; lpx=P.x; lpz=P.z;
    if(jump && ped) ped.onTeleport();
    nAcc-=dt; if(nAcc<=0 || jump){ nAcc=.7; refreshNear(); }
    if(W.inside){ PEDS.length=0; return; }
    gatherObs();
    const lim2=(RANGE+40)**2;
    for(const c of cars){
      if(!c.active || jump){ if(nearE.length) spawnCar(c, jump || frameC<4); if(!c.active) continue; }
      const dx=c.g.position.x-P.x, dz=c.g.position.z-P.z, d2=dx*dx+dz*dz;
      if(d2>lim2 && !inView(c.g.position.x, c.g.position.y, c.g.position.z)){ spawnCar(c, false); continue; }
      c.near=d2<45*45; updCar(c, dt); }
    for(const s of specials.slice()) if(s.active) updSpecial(s, dt);
    if(ped) ped.upd(dt); });

  const tAll=performance.now()-t0;
  function stats(){ const by={}; for(const c of cars){ const k=c.active?'chạy':'nghỉ'; by[k]=(by[k]||0)+1; } const pb={}; if(ped) for(const p of ped.peds) pb[p.state]=(pb[p.state]||0)+1;
    return {nodes:NODES.length, edges:edges.length, km:+(edges.reduce((s,e)=>s+e.len,0)/1000).toFixed(2), junctions:NODES.filter(n=>n.deg>=3).length, deadEnds:NODES.filter(n=>n.deg===1).length, cars:by, pool:POOL, built,
      peds:pb, lanes:ped?ped.LANES.length:0, zebras:ped?ped.ZEB.length:0, dogs:ped?ped.dogs.length:0, specials:specials.length, msNet:Math.round(tNet), msAll:Math.round(tAll)}; }
  console.info(`[QC World V2] giao thông: ${NODES.length} nút · ${edges.length} cạnh · ${(edges.reduce((s,e)=>s+e.len,0)/1000).toFixed(1)} km đường · ${POOL} xe · ${ped?ped.peds.length:0} người đi bộ – ${Math.round(tAll)} ms`);
  const IX=NODES.filter(n=>n.deg>=3);
  return {roadNet, cars, specials, spawnVehicle, IX, sig:()=>'G', onRoad, route, nearest, stats, ped,
    mayStep:(x0,z0,x1,z1)=>{ if(!onRoad(x1,z1)) return true; for(const c of cars) if(c.active && Math.hypot(c.g.position.x-x1, c.g.position.z-z1)<10) return false; return true; },
    setEnabled(on){ enabled=!!on; if(!on){ for(const c of cars) hideCar(c); if(ped) ped.onTeleport(); PEDS.length=0; } }, get enabled(){ return enabled; }};
}
