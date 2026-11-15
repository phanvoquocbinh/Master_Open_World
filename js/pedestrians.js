// QC World – 🚶 NGƯỜI ĐI BỘ TRÊN PHỐ (15/11/2026)
//  • Mạng vỉa hè dựng tự động từ CITY.roads (js/roads.js): mỗi ngã giao có 4 "góc phố" cách tim đường hw+2,8 m (thẳng hàng tâm vạch qua đường),
//    nối bằng cạnh VỈA HÈ (dọc đường, vòng qua miệng ngã ba) và cạnh QUA ĐƯỜNG (đúng vạch kẻ). Đổi quy hoạch đường → mạng tự đổi theo.
//  • Lối đi trên vỉa hè quét vật cản thật (cây, cột đèn, trạm xe buýt, ghế… = circles / boxes / SEGS) → tự lách mượt, đi bên phải.
//  • Tới vạch qua đường: đèn người đi bộ đỏ → xếp hàng đứng chờ ở mép vỉa hè; xanh và còn đủ thời gian → cả nhóm cùng qua (người hàng đầu đi trước).
//    Đang qua mà đèn sắp đổi → bước nhanh. Không qua khi đang có xe trên vạch. Người đang ở lòng đường nằm trong W.PEDS để xe bot (traffic.js) phanh nhường.
//  • Đi gốc của Xbot (people.js) – tốc độ clip = tốc độ di chuyển / (sải chân đo từ clip × chiều cao) → không trượt chân; quay đầu mượt.
//  • Hiệu năng: 1 "bể" người cố định quanh người chơi (máy yếu 18 · vừa 26 · mạnh 34; ban đêm ít hơn). Ai ra xa được đưa về chỗ khuất gần người chơi.
//    Khuất khung nhìn → không chạy animation; ở xa → cập nhật xương thưa (2–3 khung/lần); rời khu phố → ẩn hết, không tốn gì.
import { roadNet } from './roads.js';
import { makePoser } from './pose.js';

export function make(W, ctx={}){
  const {THREE, scene, P, HOOK, CITY, makeActor, removeLabel, groundAt, lerpAngle, circles, boxes, inDT, platH} = W;
  if(!W.people || !CITY || !CITY.roads) return null;
  const t0=performance.now(), NET=roadNet(CITY); if(!NET || !NET.J.length) return null;
  const SEGS=W.SEGS||[], HW=NET.hw, D0=NET.ZOFF-HW, C=HW+D0, STEP=.5, RAD=.32, KEEP=.45;
  const QUAL=W.QUAL||'low', R=Math.random;
  const POOL={low:18, medium:26, high:34}[QUAL] ?? 22, RANGE={low:70, medium:85, high:100}[QUAL] ?? 80;
  const T=()=>W.traffic;

  /* ============================== VẬT CẢN (lưới băm 4 m) ============================== */
  let bx0=1e9, bz0=1e9, bx1=-1e9, bz1=-1e9; for(const r of NET.rects){ bx0=Math.min(bx0,r.x0); bz0=Math.min(bz0,r.z0); bx1=Math.max(bx1,r.x1); bz1=Math.max(bz1,r.z1); }
  bx0-=HW+10; bz0-=HW+10; bx1+=HW+10; bz1+=HW+10;
  const CELL=4, grid=new Map(), pgrid=new Map(), gk=(x,z)=>Math.floor((x-bx0)/CELL)*65536+Math.floor((z-bz0)/CELL);
  function ins(o, x0, z0, x1, z1, G=grid){ if(x1<bx0 || x0>bx1 || z1<bz0 || z0>bz1) return;
    for(let i=Math.floor((Math.max(x0,bx0)-bx0)/CELL); i<=Math.floor((Math.min(x1,bx1)-bx0)/CELL); i++) for(let j=Math.floor((Math.max(z0,bz0)-bz0)/CELL); j<=Math.floor((Math.min(z1,bz1)-bz0)/CELL); j++){
      const k=i*65536+j; let L=G.get(k); if(!L) G.set(k, L=[]); L.push(o); } }
  // sàn / cầu (plats) cũng băm lưới → kiểm "đứng được" nhanh (platH gốc duyệt cả trăm sàn mỗi lần)
  for(const p of (W.plats||[])){ if(p.t==='ring') continue; const r=p.t==='c' ? p.r : Math.hypot(p.hw,p.hd); ins(p, p.x-r, p.z-r, p.x+r, p.z+r, pgrid); }
  function onPlat(x, z){ const L=pgrid.get(gk(x,z)); if(!L) return false;
    for(const p of L){ if(p.t==='c'){ if((x-p.x)**2+(z-p.z)**2<p.r*p.r) return true; } else { const dx=x-p.x, dz=z-p.z, lx=dx*p.c-dz*p.s, lz=dx*p.s+dz*p.c; if(Math.abs(lx)<p.hw && Math.abs(lz)<p.hd) return true; } }
    return false; }
  const lowO=o=>o.y0===undefined || o.y0<1.2;   // vật cản ở tầng trên (lan can, tường tầng 2…) không chặn vỉa hè
  for(const c of circles){ if(c.owner || !lowO(c)) continue; ins({t:0, o:c}, c.x-c.r-.6, c.z-c.r-.6, c.x+c.r+.6, c.z+c.r+.6); }
  for(const b of boxes){ if(b.x0>1e8 || !lowO(b)) continue; ins({t:1, o:b}, b.x0-.6, b.z0-.6, b.x1+.6, b.z1+.6); }
  for(const s of SEGS){ if(!lowO(s)) continue; ins({t:2, o:s}, s.x0-.6, s.z0-.6, s.x1+.6, s.z1+.6); }
  function blocked(x, z, r=RAD){ const L=grid.get(gk(x,z)); if(!L) return false;
    for(const q of L){ const o=q.o;
      if(q.t===0){ const dx=x-o.x, dz=z-o.z, m=o.r+r; if(dx*dx+dz*dz<m*m) return true; }
      else if(q.t===1){ const dx=Math.max(o.x0-x,0,x-o.x1), dz=Math.max(o.z0-z,0,z-o.z1); if(dx*dx+dz*dz<r*r) return true; }
      else { const ex=o.bx-o.ax, ez=o.bz-o.az, L2=ex*ex+ez*ez||1e-9; let t=((x-o.ax)*ex+(z-o.az)*ez)/L2; t=t<0?0:t>1?1:t; const dx=x-o.ax-ex*t, dz=z-o.az-ez*t, m=o.r+r; if(dx*dx+dz*dz<m*m) return true; } }
    return false; }
  const land=(x,z)=>inDT(x,z) || (W.plats ? onPlat(x,z) : (!!platH && platH(x,z)>-1e8));
  const walkable=(x,z)=>land(x,z) && !NET.onRoad(x,z,.12) && !blocked(x,z);
  function segFree(x0, z0, x1, z1, r=.27){ const d=Math.hypot(x1-x0,z1-z0), n=Math.ceil(d/.2); for(let k=1;k<n;k++){ const t=k/n; if(blocked(x0+(x1-x0)*t, z0+(z1-z0)*t, r)) return false; } return true; }

  /* ============================== LỐI ĐI TRÊN VỈA HÈ (tránh vật cản) ============================== */
  // o = khoảng cách tới mép đường (bó vỉa); lối chuẩn o = D0 (2,8 m – thẳng tâm vạch qua đường). Viterbi chọn o liên tục (lệch ≤ 0,2 m mỗi 0,5 m).
  const OS=[]; for(let k=0;k<=31;k++) OS.push(1.6+k*.1); const NO=OS.length;
  function profile(ax, az, ux, uz, nx, nz, len){
    const n=Math.max(2, Math.ceil(len/STEP)+1), st=len/(n-1), fr=new Uint8Array(n*NO);
    for(let i=0;i<n;i++){ const s=i*st, px=ax+ux*s, pz=az+uz*s; for(let k=0;k<NO;k++){ const d=OS[k]-D0; fr[i*NO+k]=walkable(px+nx*d, pz+nz*d)?1:0; } }
    const cost=new Float32Array(n*NO), from=new Int8Array(n*NO), runs=[], un=k=>Math.abs(OS[k]-D0)*1.5; let r0=-1;
    for(let i=0;i<n;i++){ let any=false;
      for(let k=0;k<NO;k++){ const id=i*NO+k; cost[id]=Infinity; from[id]=0; if(!fr[id]) continue;
        if(r0<0){ cost[id]=un(k); }
        else { let best=Infinity, bd=0; for(let d=-2; d<=2; d++){ const kk=k+d; if(kk<0 || kk>=NO) continue; const c=cost[(i-1)*NO+kk]+Math.abs(d)*.25; if(c<best){ best=c; bd=d; } }
          if(best<Infinity){ cost[id]=best+un(k); from[id]=bd; } }
        if(cost[id]<Infinity) any=true; }
      if(any){ if(r0<0) r0=i; continue; }
      if(r0>=0){ runs.push([r0,i-1]); r0=-1; }
      let any2=false; for(let k=0;k<NO;k++){ const id=i*NO+k; if(fr[id]){ cost[id]=un(k); any2=true; } } if(any2) r0=i; }
    if(r0>=0) runs.push([r0,n-1]);
    const c=new Float32Array(n), kp=new Float32Array(n), km=new Float32Array(n), y=new Float32Array(n);
    for(const [i0,i1] of runs){ let k=0, b=Infinity; for(let kk=0;kk<NO;kk++) if(cost[i1*NO+kk]<b){ b=cost[i1*NO+kk]; k=kk; }
      for(let i=i1;i>=i0;i--){ c[i]=OS[k]; let u=0; while(u<6 && k+u+1<NO && fr[i*NO+k+u+1]) u++; let m=0; while(m<6 && k-m-1>=0 && fr[i*NO+k-m-1]) m++; kp[i]=u*.1; km[i]=m*.1;
        const d=c[i]-D0, px=ax+ux*i*st+nx*d, pz=az+uz*i*st+nz*d; y[i]=groundAt(px,pz); k+=from[i*NO+k]; }
      // khoảng lệch phải/trái được phép thay đổi từ từ (≤ 0,35 m mỗi mét) → lách cây/cột từ xa, không giật
      const sl=.35*st; for(let i=i0+1;i<=i1;i++){ kp[i]=Math.min(kp[i],kp[i-1]+sl); km[i]=Math.min(km[i],km[i-1]+sl); }
      for(let i=i1-1;i>=i0;i--){ kp[i]=Math.min(kp[i],kp[i+1]+sl); km[i]=Math.min(km[i],km[i+1]+sl); } }
    return {n, st, runs, c, kp, km, y}; }

  /* ============================== ĐỒ THỊ: góc phố · vỉa hè · vạch qua đường ============================== */
  const nodes=[], edges=[];
  const node=(x,z,kind,j=null)=>{ const nd={id:nodes.length, x, z, x0:x, z0:z, kind, j, adj:[]}; nodes.push(nd); return nd; };
  const qk=(sx,sz)=>(sz<0?'n':'s')+(sx<0?'w':'e');
  const Jat=(x,z)=>NET.J.find(j=>Math.abs(j.x-x)<1e-3 && Math.abs(j.z-z)<1e-3);
  // góc phố: điểm chuẩn (x0,z0) thẳng tâm 2 vạch; nếu bị vật cản (hàng rào, cột…) chiếm → dời tới chỗ trống gần nhất trong ô góc vỉa hè
  for(const j of NET.J){ j.pc={}; for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const x=j.x+sx*C, z=j.z+sz*C; if(!land(x,z) || NET.onRoad(x,z,.12)) continue;
    const nd=node(x,z,'corner',j); j.pc[qk(sx,sz)]=nd;
    if(blocked(x,z)){ let bd=1e9; for(let a=1.6;a<=4.41;a+=.2) for(let b=1.6;b<=4.41;b+=.2){ const px=j.x+sx*(HW+a), pz=j.z+sz*(HW+b), d=(a-D0)**2+(b-D0)**2; if(d<bd && walkable(px,pz)){ bd=d; nd.x=px; nd.z=pz; } } } } }
  function addWalk(A, B, ax, az, bx, bz, nx, nz){ const len=Math.hypot(bx-ax,bz-az); if(len<1) return; const ux=(bx-ax)/len, uz=(bz-az)/len, pr=profile(ax,az,ux,uz,nx,nz,len);
    for(const [i0,i1] of pr.runs){ const l=(i1-i0)*pr.st; if(l<2.5) continue; const s0=i0*pr.st;
      const e={id:edges.length, kind:'walk', ax:ax+ux*s0, az:az+uz*s0, ux, uz, nx, nz, len:l, n:i1-i0+1, st:pr.st, c:pr.c.slice(i0,i1+1), kp:pr.kp.slice(i0,i1+1), km:pr.km.slice(i0,i1+1), y:pr.y.slice(i0,i1+1)};
      e.rs=Math.sign(-uz*nx+ux*nz)||1;   // bên phải (khi đi a→b) là phía ngoài (+) hay phía mép đường (−)
      const pt=(i)=>{ const s=(i-i0)*pr.st, d=pr.c[i]-D0; return [e.ax+ux*s+nx*d, e.az+uz*s+nz*d]; };
      e.a=(i0===0 && A) ? A : node(...pt(i0), 'end'); e.b=(i1===pr.n-1 && B) ? B : node(...pt(i1), 'end');
      e.cx=(e.a.x+e.b.x)/2; e.cz=(e.a.z+e.b.z)/2;
      edges.push(e); e.a.adj.push({e, dir:1}); e.b.adj.push({e, dir:-1}); } }
  // 1) vỉa hè dọc từng khúc đường (2 bên)
  for(const s of NET.segs) for(const p of NET.pieces(s)) for(const sd of [-1,1]){
    const ja=p.ja ? Jat(s.ns?s.x:p.a-HW, s.ns?p.a-HW:s.z) : null, jb=p.jb ? Jat(s.ns?s.x:p.b+HW, s.ns?p.b+HW:s.z) : null;
    const u0=p.ja ? p.a+D0 : p.a+.3, u1=p.jb ? p.b-D0 : p.b-.3; if(u1-u0<1) continue;
    if(s.ns){ const x=s.x+sd*C; addWalk(ja && ja.pc[qk(sd,1)], jb && jb.pc[qk(sd,-1)], x, u0, x, u1, sd, 0); }
    else    { const z=s.z+sd*C; addWalk(ja && ja.pc[qk(1,sd)], jb && jb.pc[qk(-1,sd)], u0, z, u1, z, 0, sd); } }
  // 2) ở mỗi ngã: miệng không có nhánh đường → vỉa hè liền; có nhánh + có vạch → cạnh QUA ĐƯỜNG
  const ARMQ={n:['nw','ne',0,-1], s:['sw','se',0,1], e:['ne','se',1,0], w:['nw','sw',-1,0]};
  const IXof=j=>{ const t=T(); return t && t.IX ? (t.IX.find(ix=>Math.abs(ix.x-j.x)<1e-3 && Math.abs(ix.z-j.z)<1e-3)||null) : null; };
  for(const j of NET.J) for(const [arm,[q1,q2,nx,nz]] of Object.entries(ARMQ)){ const A=j.pc[q1], B=j.pc[q2]; if(!A || !B) continue;
    if(!(j.arms[arm]>1e-3)) addWalk(A, B, A.x0, A.z0, B.x0, B.z0, nx, nz);
    else { const zb=NET.zebras.find(z=>z.j===j && z.side===arm); if(zb) addCross(A, B, zb, IXof(j)); } }
  function addCross(A, B, zb, ix){ const ax=A.x0, az=A.z0, len=Math.hypot(B.x0-ax,B.z0-az), ux=(B.x0-ax)/len, uz=(B.z0-az)/len, n=Math.ceil(len/STEP)+1, st=len/(n-1), y=new Float32Array(n);
    for(let i=0;i<n;i++) y[i]=groundAt(ax+ux*i*st, az+uz*i*st);
    const e={id:edges.length, kind:'cross', a:A, b:B, ax, az, ux, uz, len, n, st, y, zb, ix, road:zb.road, slots:[[],[]], taken:[[],[]], cx:(ax+B.x0)/2, cz:(az+B.z0)/2};
    // làn hợp lệ ở mỗi đầu vạch: đường thẳng từ góc phố → mép đường ở độ lệch w không vướng vật cản (vd. hàng rào sát góc)
    const at=(s,w)=>[ax+ux*s-uz*w, az+uz*s+ux*w];
    const lanes=(nd, end)=>{ const out=[]; for(let w=-1.1; w<=1.101; w+=.1){ let ok=true; const [sx,sz]=at(end?len:0, w); if(!segFree(nd.x, nd.z, sx, sz)) continue;
        for(let pr=0; pr<=D0+.01 && ok; pr+=.25){ const [x,z]=at(end?len-pr:pr, w); if(!land(x,z) || blocked(x,z,.3)) ok=false; } if(ok) out.push(+w.toFixed(2)); } return out; };
    e.vw=[lanes(A,false), lanes(B,true)]; if(!e.vw[0].length || !e.vw[1].length) return;
    const near=(L,w)=>L.reduce((b,v)=>Math.abs(v-w)<Math.abs(b-w)?v:b, L[0]);
    // chỗ đứng chờ ở mép vỉa hè: 3 hàng × 3 người, ưu tiên nửa bên phải vạch theo chiều đi (2 chiều tách 2 nửa vạch), vướng thì dùng nửa kia
    for(const dir of [1,-1]){ const L=e.slots[dir>0?0:1], V0=e.vw[dir>0?0:1], V1=e.vw[dir>0?1:0], ws=[];
      for(const c of [.28,.68,1.08,-.28,-.68,-1.08]){ const w=dir*c; if(V0.some(v=>Math.abs(v-w)<.06) && ws.length<3) ws.push(w); }
      for(let row=0;row<3;row++) for(const w of ws) L.push({p:D0-.45-row*.75, w, wEnd:near(V1,w), row});
      e.taken[dir>0?0:1]=L.map(()=>null); }
    edges.push(e); A.adj.push({e, dir:1}); B.adj.push({e, dir:-1}); }
  // 3) tỉa: góc chỉ có vạch qua đường mà không có vỉa hè (vd. đầu cầu) → bỏ
  for(let changed=true; changed;){ changed=false;
    for(const nd of nodes){ if(nd.dead) continue; const live=nd.adj.filter(a=>!a.e.dead);
      if(!live.some(a=>a.e.kind==='walk')){ for(const a of live){ a.e.dead=true; changed=true; } nd.dead=true; } } }
  for(const nd of nodes) nd.adj=nd.adj.filter(a=>!a.e.dead);
  const E=edges.filter(e=>!e.dead), WALK=E.filter(e=>e.kind==='walk'), CROSS=E.filter(e=>e.kind==='cross');
  if(!WALK.length) return null;

  /* ============================== ĐÈN NGƯỜI ĐI BỘ (theo pha đèn xe của traffic.js) ============================== */
  // xanh cho người qua vạch trên đường trục 'ew' khi đèn xe trục 'ew' ĐỎ (giống traffic.mayStep). Thời gian xanh còn lại: tự đo từ lúc đèn chuyển.
  const SG=new Map();
  const sgOf=e=>{ const k=e.ix.i+'|'+e.road; let s=SG.get(k); if(!s) SG.set(k, s={ix:e.ix, road:e.road, g:null, t0:-1e9, dur:16, rem:0}); return s; };
  for(const e of CROSS) if(e.ix) sgOf(e);
  function updSignals(){ const t=T(); if(!t) return; const now=t.clock;
    for(const s of SG.values()){ const g=t.sig(s.ix, s.road)==='R';
      if(s.g===null){ s.g=g; s.t0=-1e9; }                        // lần đầu thấy đang xanh: không biết đã xanh bao lâu → chờ lượt sau cho chắc
      else if(g && !s.g){ s.t0=now; s.g=true; }
      else if(!g && s.g){ if(s.t0>-1e8){ const d=now-s.t0; if(d>4 && d<90) s.dur=d; } s.g=false; }
      s.rem=s.g && s.t0>-1e8 ? s.dur-(now-s.t0) : 0; } }
  const pedGreen=e=>!e.ix || !T() || sgOf(e).g;
  function carOn(e){ const t=T(), r=e.zb, m=2.4; const hit=(x,z)=>x>r.x0-m && x<r.x1+m && z>r.z0-m && z<r.z1+m;
    if(t && t.cars) for(const c of t.cars){ if(c.g.visible && hit(c.g.position.x, c.g.position.z)) return true; }
    const bs=W.transit && W.transit.buses; if(bs) for(const b of bs){ if(b.g && hit(b.g.position.x, b.g.position.z)) return true; }
    return false; }
  const crossNeed=e=>(e.len-2*D0+1.4)/1.5+.4;   // giây cần để đi hết lòng đường ở 1,5 m/s
  function canGo(e){ if(e.ix && T()){ const s=sgOf(e); if(!s.g || s.rem<crossNeed(e)) return false; } return !carOn(e); }

  /* ============================== NGƯỜI ============================== */
  // dáng người: dùng lại các biến thể people.js (tối đa 16 kiểu) → đỡ bộ nhớ đồ hoạ; chiều cao lệch nhẹ để không thấy "sinh đôi"
  const NV=Math.min(16, POOL), seeds=[]; for(let i=0;i<NV;i++) seeds.push(W.people.seedFor(i%2?'f':'m', 300+i*17));
  let KST=1.49/1.78;   // sải chân chuẩn (m/s cho mỗi mét chiều cao) – đo lại từ clip ở người đầu tiên
  function strideK(a){ try{ const act=a.acts.walk, bn={}; a.g.traverse(o=>{ if(o.isBone) bn[o.name.replace(/^mixamorig:?/,'')]=o; });
      const L=bn.LeftFoot, Rt=bn.RightFoot; if(!act || !L || !Rt) return KST; const g=a.g; g.position.set(0,-300,0); g.rotation.y=0; act.reset().play();
      const N=48, dur=act.getClip().duration, ql=new THREE.Vector3(), qr=new THREE.Vector3(), pl=new THREE.Vector3(), pr=new THREE.Vector3(), vs=[];
      for(let i=0;i<=N;i++){ act.time=dur*i/N; a.mixer.update(0); g.updateMatrixWorld(true); L.getWorldPosition(ql); Rt.getWorldPosition(qr);
        if(i){ const lft=pl.y<pr.y; vs.push(-(lft ? ql.z-pl.z : qr.z-pr.z)/(dur/N)); } pl.copy(ql); pr.copy(qr); }
      act.stop(); vs.sort((x,y)=>x-y); const v=vs[vs.length>>1]; return v>.4 && v<4 ? v/a.h : KST; }catch(e){ return KST; } }
  // LOD: người Xbot ~50k tam giác → bản rút gọn (gộp đỉnh theo ô 3 cm, tách theo xương chính để không dính 2 chân) ~1/8, dùng khi camera xa > 14 m
  function decimate(geo, cell=.03){ const Pa=geo.attributes.position, Na=geo.attributes.normal, Ca=geo.attributes.color, SI=geo.attributes.skinIndex, SWa=geo.attributes.skinWeight, n=Pa.count;
    if(!geo.index || !SI || !SWa) return geo;
    const map=new Map(), rep=new Int32Array(n), keep=[], sum=[];
    for(let i=0;i<n;i++){ let db=0, bw=-1; for(let k=0;k<4;k++){ const w=SWa.getComponent(i,k); if(w>bw){ bw=w; db=SI.getComponent(i,k); } }
      const key=(((Math.round(Pa.getX(i)/cell)+512)*1024+(Math.round(Pa.getY(i)/cell)+512))*1024+(Math.round(Pa.getZ(i)/cell)+512))*128+db;
      let r=map.get(key); if(r===undefined){ r=keep.length; map.set(key,r); keep.push(i); sum.push([0,0,0,0,0,0,0]); } rep[i]=r;
      const s=sum[r]; s[0]+=Pa.getX(i); s[1]+=Pa.getY(i); s[2]+=Pa.getZ(i); if(Na){ s[3]+=Na.getX(i); s[4]+=Na.getY(i); s[5]+=Na.getZ(i); } s[6]++; }
    const src=geo.index.array, tri=[]; for(let t=0;t<src.length;t+=3){ const a=rep[src[t]], b=rep[src[t+1]], c=rep[src[t+2]]; if(a!==b && b!==c && a!==c) tri.push(a,b,c); }
    const m=keep.length, pos=new Float32Array(m*3), nor=new Float32Array(m*3);
    for(let r=0;r<m;r++){ const s=sum[r]; pos[r*3]=s[0]/s[6]; pos[r*3+1]=s[1]/s[6]; pos[r*3+2]=s[2]/s[6]; const l=Math.hypot(s[3],s[4],s[5])||1; nor[r*3]=s[3]/l; nor[r*3+1]=s[4]/l; nor[r*3+2]=s[5]/l; }
    const cp=(attr, Arr, k)=>{ const out=new Arr(m*k); for(let r=0;r<m;r++){ const i=keep[r]; for(let q=0;q<k;q++) out[r*k+q]=attr.array[i*k+q]; } return out; };
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('normal', new THREE.BufferAttribute(nor,3));
    if(Ca) g.setAttribute('color', new THREE.BufferAttribute(cp(Ca,Float32Array,3),3));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(cp(SI,Uint16Array,4),4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(cp(SWa,Float32Array,4),4));
    g.setIndex(tri); g.computeBoundingSphere(); return g; }
  const skinOf=o=>{ let s=null; o.traverse(m=>{ if(m.isSkinnedMesh && !s) s=m; }); return s; };
  const tV=performance.now(), VAR=[];
  for(let i=0;i<NV;i++){ const kk=W.people.kit(seeds[i]), sk=skinOf(kk.gl.scene); let lod=null, gl=kk.gl;
    try{ lod=decimate(sk.geometry); const tm=W.SkeletonUtils.clone(kk.gl.scene); skinOf(tm).geometry=lod; gl={scene:tm, animations:kk.gl.animations}; }catch(e){ console.warn('pedestrians LOD', e); lod=null; }
    VAR.push({kk, gl, full:sk.geometry, lod}); }
  const tA=performance.now();
  const peds=[];
  for(let i=0;i<POOL;i++){ const V=VAR[i%NV], kk=V.kk, h=kk.h*(i<NV?1:.96+R()*.08);
    const a=makeActor(V.gl, {name:'người đi bộ', height:h, face:0, clips:{idle:kk.clips.idle, walk:kk.clips.walk}, compact:false});
    if(a.label){ removeLabel(a.label); a.label=null; }
    a.mesh=skinOf(a.root); a.full=V.full; a.lod=V.lod||V.full;
    if(QUAL==='low') a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });   // máy yếu: không đổ bóng thật (có bóng mờ dưới chân)
    if(i===0) KST=strideK(a);
    a.g.visible=false;
    const p={i, a, h, v0:1.15+R()*.3, state:'off', e:null, dir:1, s:0, w:0, wEnd:0, via:null, jit:(R()-.5)*.24, bias:0, stopT:0, v:0, x:1e9, z:1e9, y:0, tx:0, tz:0, ty:0, ox:0, oz:0, hd:0, acc:0, slot:null, sk:-1, delay:0,
      col:{x:1e9, z:1e9, r:.28}, phone:R()<.15 ? makePoser(THREE, a) : null};
    p.col.owner=p; circles.push(p.col); peds.push(p); }
  const tEnd=performance.now(), TIM={graph:Math.round(tV-t0), variants:Math.round(tA-tV), actors:Math.round(tEnd-tA)};

  /* ---------- vị trí trên cạnh ---------- */
  const tmp={x:0, z:0, y:0};
  function lerpArr(A, e, s){ const f=s/e.st; let i=Math.floor(f); if(i<0) return A[0]; if(i>=e.n-1) return A[e.n-1]; return A[i]+(A[i+1]-A[i])*(f-i); }
  function walkPos(e, s, lat, out){ const c=lerpArr(e.c,e,s), kp=lerpArr(e.kp,e,s), km=lerpArr(e.km,e,s), o=c+Math.max(-km, Math.min(kp, lat))-D0;
    out.x=e.ax+e.ux*s+e.nx*o; out.z=e.az+e.uz*s+e.nz*o; out.y=lerpArr(e.y,e,s); return out; }
  function crossPos(e, s, w, out){ out.x=e.ax+e.ux*s-e.uz*w; out.z=e.az+e.uz*s+e.ux*w; out.y=lerpArr(e.y,e,s); return out; }
  const prog=p=>p.dir>0 ? p.s : p.e.len-p.s;
  // trên vạch: độ lệch ngang đổi dần từ làn hợp lệ ở mép bên này sang làn hợp lệ ở mép bên kia (chỉ đổi khi đang ở lòng đường); né người chỉ ở lòng đường
  function wAt(p){ const e=p.e, pr=prog(p), t=Math.max(0, Math.min(1, (pr-D0)/Math.max(1, e.len-2*D0))), road=pr>D0-.2 && pr<e.len-D0+.2; return p.w+(p.wEnd-p.w)*t+(road?p.bias:0); }
  function track(p, out=tmp){ const e=p.e; return e.kind==='walk' ? walkPos(e, p.s, p.dir*e.rs*KEEP+p.jit+p.bias, out) : crossPos(e, p.s, wAt(p), out); }

  /* ---------- hàng chờ ở vạch ---------- */
  function release(p){ if(p.slot && p.e && p.e.kind==='cross'){ const t=p.e.taken[p.dir>0?0:1]; if(t[p.sk]===p) t[p.sk]=null; } p.slot=null; p.sk=-1; }
  function join(p, e, dir){ const t=e.taken[dir>0?0:1]; for(let k=0;k<t.length;k++) if(!t[k]){ t[k]=p; p.sk=k; p.slot=e.slots[dir>0?0:1][k]; return true; } return false; }
  const qFree=(e,dir)=>e.taken[dir>0?0:1].some(x=>!x);

  /* ---------- chọn đường ở góc phố ---------- */
  function choose(p, nd){ const from=p.e; let opts=nd.adj.filter(a=>a.e!==from); if(!opts.length) opts=nd.adj;
    let sum=0; const wts=opts.map(a=>{ let w=1; if(a.e.kind==='cross'){ if(!qFree(a.e,a.dir)) w=0; else w=canGo(a.e) ? 2.2 : .85; } sum+=w; return w; });
    if(sum<=0) return null; let r=R()*sum; for(let k=0;k<opts.length;k++){ r-=wts[k]; if(r<=0) return opts[k]; } return opts[opts.length-1]; }
  function enter(p, e, dir){ release(p); p.e=e; p.dir=dir; p.s=dir>0?0:e.len; p.bias=0;
    if(e.kind==='cross'){ if(!join(p, e, dir)){ p.e=null; return false; } p.w=p.slot.w; p.wEnd=p.slot.wEnd; p.state='queue'; } else p.state='walk';
    track(p); p.tx=tmp.x; p.tz=tmp.z; p.ty=tmp.y;
    if(p.x>1e8){ p.ox=p.oz=0; return true; }
    const nd=dir>0 ? e.a : e.b; if(!segFree(p.x, p.z, tmp.x, tmp.z) && segFree(p.x, p.z, nd.x, nd.z)) p.via={x:nd.x, z:nd.z};   // đi tắt sẽ vướng (vd. hàng rào sát góc) → vòng qua góc phố
    p.ox=p.x-tmp.x; p.oz=p.z-tmp.z; return true; }   // độ lệch cũ tắt dần → rẽ góc mượt
  function arrive(p){ const nd=p.dir>0 ? p.e.b : p.e.a, prev=p.e, pd=p.dir;
    for(let t=0;t<3;t++){ const o=choose(p, nd); if(o && enter(p, o.e, o.dir)) return; }
    p.e=prev; p.dir=-pd; p.state='walk'; if(prev.kind==='cross'){ p.dir=pd; enter(p, prev, -pd) || hide(p); } }   // ngõ cụt → quay lại

  /* ---------- tránh người chơi / bot / người khác ---------- */
  function ahead(p){ const fx=p.e.ux*p.dir, fz=p.e.uz*p.dir; let lim=99, side=0, ped=false;
    const test=(x, z, rr, v, same, isPed)=>{ const dx=x-p.x, dz=z-p.z; if(dx*dx+dz*dz>2.6) return; const a=dx*fx+dz*fz, l=dx*(-fz)+dz*fx; if(a<=.05 || a>.85+rr || Math.abs(l)>.3+rr) return;
      const lv=same ? Math.max(0, v*.92-(a<.7?.35:0)) : 0; if(lv<lim){ lim=lv; side=l>0?-1:1; ped=!!isPed; } };   // l>0: vật cản lệch phải → né trái
    const r=W.life && W.life.V && W.life.V.riding && W.life.V.riding();
    if(!W.inside) test(P.x, P.z, r ? .9 : .32, 0, false);
    const bl=ctx.bots && ctx.bots.bots; if(bl) for(const b of bl) test(b.x, b.z, .32, 0, false);
    if(!(p.ghost>0)) for(const q of peds){ if(q===p || q.state==='off' || !q.e) continue;
      if(p.state==='queue' && q.e===p.e && q.dir===p.dir && (q.state==='wait' || q.state==='queue')) continue;   // chỗ chờ đã chia sẵn, không chồng nhau
      const same=(q.e.ux*q.dir*fx+q.e.uz*q.dir*fz)>.5; test(q.x, q.z, .3, q.v, same, true); }
    return lim<99 ? {v:lim, side, ped} : null; }

  /* ---------- bước đi mỗi khung ---------- */
  function step(p, dt){
    if(p.via){ const dx=p.via.x-p.x, dz=p.via.z-p.z, d=Math.hypot(dx,dz), sp=p.v0*dt; p.v=p.v0;   // đang vòng qua điểm góc phố
      if(d<=sp+1e-3){ p.ox=p.via.x-p.tx; p.oz=p.via.z-p.tz; p.via=null; } else { p.ox=p.x+dx/d*sp-p.tx; p.oz=p.z+dz/d*sp-p.tz; } return; }
    const e=p.e; let v=p.v0;
    if(p.state==='wait'){ v=0;
      if(p.delay>0){ p.delay-=dt; if(p.delay<=0){ if(pedGreen(e)){ release(p); p.state='cross'; } } }
      else if(canGo(e)) p.delay=.15+p.slot.row*.45+R()*.45; }   // đèn xanh: hàng đầu bước trước, hàng sau theo sau
    else if(p.state==='queue'){ if(prog(p)>=p.slot.p-.02){ if(canGo(e)){ release(p); p.state='cross'; } else { p.s=p.dir>0?p.slot.p:e.len-p.slot.p; p.state='wait'; v=0; p.delay=0; } } }
    if(p.state==='cross'){ v=Math.max(p.v0, 1.45); const sg=e.ix && T() ? sgOf(e) : null; if(sg && (!sg.g || sg.rem<(e.len-prog(p)-D0)/1.45)) v=Math.min(2.05, v*1.38); }   // đèn sắp đổi → đi nhanh
    if(p.ghost>0) p.ghost-=dt;
    if(v>0){ const b=ahead(p); if(b){ if(b.v<v) v=b.v; if(v<.2){ p.stopT+=dt; if(b.ped && p.stopT>2.5){ p.ghost=1.5; p.stopT=0; }   // kẹt mặt đối mặt với người khác lâu → lách qua (như xe bot)
        if(p.stopT>.7){ const mag=e.kind==='walk' ? .75 : .55; p.bias+=(b.side*p.dir*(e.kind==='walk'?e.rs:1)*mag-p.bias)*Math.min(1,dt*3); } } } else { p.stopT=0; p.bias*=Math.exp(-dt*.7); } }
    if(p.state==='queue' && v>0){ const left=p.slot.p-prog(p); if(left<v*dt) v=Math.max(0,left/dt); }
    if(p.state==='wait') p.v=0; else if(p.state==='queue' && v<p.v) p.v=v; else p.v+=(v-p.v)*Math.min(1, dt*(v>p.v?3.5:6));   // tới chỗ chờ: dừng đúng vạch, không trôi
    p.s+=p.dir*p.v*dt;
    if(prog(p)>=e.len){ p.s=p.dir>0?e.len:0; arrive(p); }
    if(p.state==='off') return;
    track(p); p.tx=tmp.x; p.tz=tmp.z; p.ty=tmp.y; }

  /* ---------- xuất hiện / ẩn quanh người chơi ---------- */
  let near=[], nearLen=0, active=false;
  function refreshNear(){ near=[]; nearLen=0; const r2=(RANGE+30)**2;
    for(const e of WALK){ const ex=e.ax+e.ux*e.len, ez=e.az+e.uz*e.len; let t=((P.x-e.ax)*e.ux+(P.z-e.az)*e.uz); t=Math.max(0,Math.min(e.len,t)); const dx=e.ax+e.ux*t-P.x, dz=e.az+e.uz*t-P.z;
      if(dx*dx+dz*dz<r2){ near.push(e); nearLen+=e.len; } void ex; void ez; }
    return near.length>0; }
  const sph=new THREE.Sphere(new THREE.Vector3(), 1.1);
  const inView=(x,y,z)=>{ sph.center.set(x,y+.9,z); return !!W.FRUS && W.FRUS.intersectsSphere(sph); };
  function hide(p){ release(p); p.state='off'; p.e=null; p.a.g.visible=false; p.col.x=p.col.z=1e9; p.x=p.z=1e9; p.v=0; }
  function spawn(p, initial){ release(p); p.state='off';
    for(let t=0;t<18;t++){ let r=R()*nearLen, e=null; for(const q of near){ r-=q.len; if(r<=0){ e=q; break; } } if(!e) e=near[near.length-1]; if(!e) break;
      const s=R()*e.len; walkPos(e, s, 0, tmp); const d=Math.hypot(tmp.x-P.x, tmp.z-P.z);
      if(d>RANGE || d<(initial?6:26)) continue; if(!initial && d<62 && inView(tmp.x,tmp.y,tmp.z)) continue;
      if(peds.some(q=>q!==p && q.state!=='off' && Math.abs(q.x-tmp.x)+Math.abs(q.z-tmp.z)<1.6)) continue;
      p.e=e; p.dir=R()<.5?1:-1; p.s=s; p.state='walk'; p.bias=0; p.via=null; p.stopT=0; p.ox=p.oz=0; p.v=p.v0*.8; p.acc=.3; track(p); p.tx=p.x=tmp.x; p.tz=p.z=tmp.z; p.ty=p.y=tmp.y;
      p.hd=Math.atan2(e.ux*p.dir, e.uz*p.dir); p.a.g.visible=true; p.a.play('walk',0); return true; }
    hide(p); return false; }

  /* ============================== KHUNG HÌNH ============================== */
  const PEDS=W.PEDS=[]; const pool=[]; for(let i=0;i<POOL;i++) pool.push({x:0, z:0, h:0});
  let cityT=0, fill=true, lpx=P.x, lpz=P.z, frameN=0, enabled=true;
  const cam=W.camera;
  HOOK.onFrame.push((dtIn)=>{ const dt=Math.min(dtIn,.1); frameN++; PEDS.length=0;
    if(W.inside || !enabled) return;
    cityT-=dt; if(cityT<=0){ cityT=.5; const was=active; active=refreshNear(); if(active && !was) fill=true; if(!active && was) for(const p of peds) hide(p); }
    if(!active) return;
    if(Math.hypot(P.x-lpx, P.z-lpz)>40){ fill=true; refreshNear(); } lpx=P.x; lpz=P.z;
    updSignals();
    const want=Math.round(POOL*(W.night>.65 ? .55 : 1)), lim2=(RANGE+18)**2;
    for(const p of peds){
      if(p.i>=want){ if(p.state!=='off' && (!p.a.root.visible || fill)) hide(p); if(p.state==='off') continue; }
      else if(p.state==='off' || fill){ spawn(p, fill); if(p.state==='off') continue; }
      const px=p.x, pz=p.z;
      step(p, dt); if(p.state==='off') continue;
      if(!p.via){ const k=Math.exp(-dt*3.2); p.ox*=k; p.oz*=k; }
      const rx=p.tx+p.ox, rz=p.tz+p.oz, mx=rx-px, mz=rz-pz;
      if(p.state==='wait'){ const f=Math.atan2(p.e.ux*p.dir, p.e.uz*p.dir); p.hd=lerpAngle(p.hd, f, 1-Math.exp(-dt*4)); }
      else if(mx*mx+mz*mz>1e-7 && p.v>.05) p.hd=lerpAngle(p.hd, Math.atan2(mx,mz), 1-Math.exp(-dt*7));   // quay mặt theo hướng đi THẬT (cả lúc lượn góc)
      p.x=rx; p.z=rz; p.y=p.ty; p.col.x=rx; p.col.z=rz;
      const dx=rx-P.x, dz=rz-P.z;
      if(dx*dx+dz*dz>lim2 && (!p.a.root.visible || dx*dx+dz*dz>95*95)){ spawn(p, false); continue; }   // đi quá xa → về chỗ khuất gần người chơi
      if(p.state==='cross'){ const q=pool[PEDS.length]; if(q && prog(p)>D0-.3 && prog(p)<p.e.len-D0+.3){ q.x=rx; q.z=rz; q.h=p.hd; PEDS.push(q); } }
      // hiển thị + animation
      const a=p.a; a.g.position.set(rx, p.y, rz); a.g.rotation.y=p.hd;
      const moving=p.v>.18; a.play(moving?'walk':'idle', .3); if(moving) a.acts.walk.setEffectiveTimeScale(p.v/(KST*p.h));
      if(a.root.visible){ const cd=Math.hypot(rx-cam.position.x, rz-cam.position.z), every=cd<16?1:cd<40?2:3; p.acc+=dt;   // xa: xương cập nhật thưa (tích luỹ dt nên nhịp bước vẫn đúng)
        const geo=cd<14 ? a.full : a.lod; if(a.mesh && a.mesh.geometry!==geo) a.mesh.geometry=geo;   // gần: đủ chi tiết · xa: bản rút gọn
        if((frameN+p.i)%every===0){ a.mixer.update(Math.min(p.acc,.25)); p.acc=0; if(p.phone && cd<40) p.phone.apply('phone', W.T); } }
      else p.acc=Math.min(.5, p.acc+dt); }
    fill=false; });

  /* ============================== GỠ LỖI / KIỂM THỬ ============================== */
  let dbg=null;
  function debug(on=true){ if(dbg){ scene.remove(dbg); dbg.geometry.dispose(); dbg=null; } if(!on) return;
    const v=[], col=[], c1=new THREE.Color(0x22ff66), c2=new THREE.Color(0xffd000);
    for(const e of E){ const c=e.kind==='walk'?c1:c2; for(let s=0; s<e.len; s+=.5){ const a=e.kind==='walk'?walkPos(e,s,0,{}):crossPos(e,s,0,{}), b=e.kind==='walk'?walkPos(e,Math.min(e.len,s+.5),0,{}):crossPos(e,Math.min(e.len,s+.5),0,{});
      v.push(a.x,a.y+.12,a.z, b.x,b.y+.12,b.z); col.push(c.r,c.g,c.b, c.r,c.g,c.b); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v,3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
    dbg=new THREE.LineSegments(g, new THREE.LineBasicMaterial({vertexColors:true, depthTest:false})); dbg.renderOrder=9; dbg.userData.dynamic=true; scene.add(dbg); }
  function stats(){ const by={}; for(const p of peds) by[p.state]=(by[p.state]||0)+1;
    return {pool:POOL, range:RANGE, stride:+(KST*1.78).toFixed(3), nodes:nodes.filter(n=>!n.dead).length, walkEdges:WALK.length, crossEdges:CROSS.length, walkLen:Math.round(WALK.reduce((s,e)=>s+e.len,0)),
      active, near:near.length, by, onRoad:PEDS.length, ms:TIM, lodVerts:VAR.map(v=>v.lod?v.lod.attributes.position.count:0).slice(0,4), fullVerts:VAR[0].full.attributes.position.count}; }
  console.info(`[QC World] 🚶 người đi bộ: ${POOL} người · ${WALK.length} đoạn vỉa hè (${Math.round(WALK.reduce((s,e)=>s+e.len,0))} m) · ${CROSS.length} vạch qua đường`);
  function setEnabled(on){ enabled=!!on; if(!enabled){ for(const p of peds) hide(p); active=false; } else { cityT=0; fill=true; } }
  return {peds, nodes, edges:E, WALK, CROSS, SG, stats, debug, canGo, pedGreen, sgOf, setEnabled, get enabled(){ return enabled; }, get KST(){ return KST; }};
}
