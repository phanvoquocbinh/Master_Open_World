// QC World – DỜI GỐC TOẠ ĐỘ cho module đã dựng sẵn (phiên thiết bị S19g, 16/11/2026)
// shiftView(W, dx, dz) trả về một "W ảo" để module cũ (Wonderland, Công viên Kỳ Quan…) chạy NGUYÊN toạ độ V1 của nó
// mà vẫn hiện ra ở chỗ mới (x + dx, z + dz) – không phải sửa từng con số trong module:
//  • mesh: W.scene ảo = 1 nhóm gốc đặt ở (dx, 0, dz) → mọi vật module thêm vào đều dời theo (batchStatic/markFar dùng ma trận thế giới nên vẫn đúng)
//  • va chạm & tương tác: circles / boxes / plats / INTER / EXTL / addPlat / addSeg / nhãn / ghế / quầng sáng / dịch chuyển → cộng (dx, dz) khi đẩy vào thế giới
//  • người chơi & camera: P, me.g.position, cam.tx/tz, camera.position, HOOK.camOverride / scope / camBox / fpvCam → module đọc-ghi theo toạ độ cục bộ
//  • W.SHIFT = {dx, dz, root, toW(v), toL(v)}: cho vài chỗ module tự lấy ma trận thế giới (localToWorld, getWorldPosition, lookAt)
// dx = dz = 0 → trả lại đúng W (thế giới V1 không đổi gì).
export function shiftView(W, dx=0, dz=0){
  if(!dx && !dz) return W;
  const {THREE} = W, scene=W.scene, cam0=W.camera, OX=dx, OZ=dz;
  const RAW=new WeakMap(), raw=o=>(o && typeof o==='object' && RAW.get(o)) || o;
  const bindGet=(t,k)=>{ const v=Reflect.get(t,k); return typeof v==='function' ? v.bind(t) : v; };

  /* ---------- nhóm gốc ---------- */
  const root=new THREE.Group(); root.name=`shift(${dx},${dz})`; root.position.set(OX,0,OZ); root.userData.shiftRoot=true; scene.add(root); root.updateMatrixWorld(true);
  for(const k of ['fog','background','environment']) Object.defineProperty(root, k, {get:()=>scene[k], set:v=>{ scene[k]=v; }, configurable:true});
  const add0=THREE.Object3D.prototype.add, rem0=THREE.Object3D.prototype.remove;
  root.add=function(...objs){ for(const o0 of objs){ const o=raw(o0); if(o===cam0) scene.add(o); else add0.call(root, o); } return root; };   // camera luôn ở cảnh thật
  root.remove=function(...objs){ for(const o0 of objs){ const o=raw(o0); if(o===cam0) rem0.call(scene, o); else rem0.call(root, o); } return root; };

  /* ---------- vector / vật thể nhìn theo toạ độ cục bộ ---------- */
  const vview=v=>{ const p=new Proxy(v, {get(t,k){ return k==='x' ? t.x-OX : k==='z' ? t.z-OZ : Reflect.get(t,k); },
    set(t,k,val){ if(k==='x') t.x=val+OX; else if(k==='z') t.z=val+OZ; else t[k]=val; return true; }}); RAW.set(p,v); return p; };
  const oview=o=>{ if(!o) return o; const pos=vview(o.position); const p=new Proxy(o, {get(t,k){ return k==='position' ? pos : bindGet(t,k); }, set(t,k,v){ t[k]=raw(v); return true; }}); RAW.set(p,o); return p; };
  const camV=oview(cam0);
  let gSrc=null, gV=null, skySrc=null, skyV=null;
  const meV=W.me ? new Proxy(W.me, {get(t,k){ if(k==='g'){ if(t.g!==gSrc){ gSrc=t.g; gV=oview(gSrc); } return gV; } return bindGet(t,k); }}) : W.me;
  const LX=new Set(['x','px']), LZ=new Set(['z','pz']);
  const PV=new Proxy(W.P, {get(t,k){ const v=t[k]; return v===undefined ? v : LX.has(k) ? v-OX : LZ.has(k) ? v-OZ : v; },
    set(t,k,v){ t[k]=LX.has(k) ? v+OX : LZ.has(k) ? v+OZ : v; return true; }});
  const camC=W.cam ? new Proxy(W.cam, {get(t,k){ return k==='tx' ? t.tx-OX : k==='tz' ? t.tz-OZ : t[k]; }, set(t,k,v){ t[k]=k==='tx' ? v+OX : k==='tz' ? v+OZ : v; return true; }}) : W.cam;

  /* ---------- HOOK: camOverride / scope (pos, look) · camBox · fpvCam ---------- */
  const _cp=new THREE.Vector3(), _cl=new THREE.Vector3(), _sp=new THREE.Vector3();
  const wrapPL=(o,k0)=>new Proxy(o, {get(t,k){ if(k==='__loc') return t;
      if(k==='pos' || k==='look'){ const s=t[k]; if(!s) return s; return (k0==='scope' ? _sp : k==='pos' ? _cp : _cl).set(s.x+OX, s.y, s.z+OZ); } return Reflect.get(t,k); }});
  const BOXK={x0:OX, x1:OX, z0:OZ, z1:OZ};
  const wrapBox=o=>new Proxy(o, {get(t,k){ if(k==='__loc') return t; const v=Reflect.get(t,k); return (k in BOXK && typeof v==='number') ? v+BOXK[k] : v; }});
  const HV=new Proxy(W.HOOK, {
    get(t,k){ const v=t[k]; return (v && (typeof v==='object' || typeof v==='function') && v.__loc) ? v.__loc : v; },
    set(t,k,v){
      if(v && typeof v==='object' && (k==='camOverride' || k==='scope')) v=wrapPL(v,k);
      else if(v && typeof v==='object' && k==='camBox') v=wrapBox(v);
      else if(typeof v==='function' && k==='fpvCam'){ const f0=v; v=(dt,c)=>f0(dt, c===cam0 ? camV : c); v.__loc=f0; }
      t[k]=v; return true; } });

  /* ---------- mảng va chạm / tương tác: cộng (dx, dz) lúc đẩy vào ---------- */
  const shiftKeys=(o, keys)=>{ if(!o || typeof o!=='object') return o;
    for(const [k,off] of keys){ const d=Object.getOwnPropertyDescriptor(o,k); if(!d) continue;
      if('value' in d){ if(typeof d.value==='number') o[k]=d.value+off; }
      else if(d.get){ const g=d.get, s=d.set; Object.defineProperty(o,k,{get(){ return g.call(this)+off; }, set:s ? function(v){ s.call(this,v); } : undefined, configurable:true, enumerable:true}); } }
    return o; };
  const KXZ=[['x',OX],['z',OZ]], KBOX=[['x0',OX],['x1',OX],['z0',OZ],['z1',OZ]];
  const fixE=e=>{ shiftKeys(e, KBOX); if(typeof e.h==='function'){ const h0=e.h; e.h=(x,z)=>h0(x-OX, z-OZ); } return e; };
  const arrView=(arr, fix)=>arr ? new Proxy(arr, {get(t,k){ if(k==='push') return (...items)=>{ for(const it of items) fix(it); return t.push(...items); };
      if(k==='unshift') return (...items)=>{ for(const it of items) fix(it); return t.unshift(...items); }; return bindGet(t,k); }}) : arr;

  /* ---------- hàm thế giới ---------- */
  const nul=v=>v===undefined || v===null;
  const accXZ=L=>{ for(const [k,off] of KXZ){ let lv=(L[k]||0)-off; Object.defineProperty(L,k,{get:()=>lv+off, set:v=>{ lv=v; }, configurable:true, enumerable:true}); } return L; };
  const GV=W.GLOW ? new Proxy(W.GLOW, {get(t,k){ if(k==='add') return (x,y,z,...r)=>t.add(x+OX,y,z+OZ,...r); if(k==='lampPost') return (x,z,...r)=>t.lampPost(x+OX,z+OZ,...r); return bindGet(t,k); }}) : W.GLOW;
  const _tw=new THREE.Vector3();
  const SHIFT={dx:OX, dz:OZ, root,
    toW:v=>_tw.set(v.x+OX, v.y, v.z+OZ),        // toạ độ cục bộ → thế giới (vector tạm, dùng ngay – vd. lookAt)
    toL:v=>{ v.x-=OX; v.z-=OZ; return v; } };   // toạ độ thế giới → cục bộ (sửa tại chỗ – vd. kết quả localToWorld)
  const OVR={
    scene:root, camera:camV, P:PV, me:meV, cam:camC, HOOK:HV, GLOW:GV, SHIFT,
    circles:arrView(W.circles, c=>shiftKeys(c,KXZ)), boxes:arrView(W.boxes, b=>shiftKeys(b,KBOX)), plats:arrView(W.plats, p=>shiftKeys(p,KXZ)),
    INTER:arrView(W.INTER, it=>shiftKeys(it,KXZ)), EXTL:arrView(W.EXTL, fixE), PLACES:W.PLACES,
    addPlat:(x,z,...r)=>W.addPlat(x+OX, z+OZ, ...r),
    addSeg:(ax,az,bx,bz,...r)=>W.addSeg(ax+OX, az+OZ, bx+OX, bz+OZ, ...r),
    teleport:(x,z,lx,lz)=>W.teleport(x+OX, z+OZ, nul(lx)?lx:lx+OX, nul(lz)?lz:lz+OZ),
    groundAt:(x,z)=>W.groundAt(x+OX, z+OZ), groundH:(x,z)=>W.groundH(x+OX, z+OZ), groundAtY:(x,z,y)=>W.groundAtY(x+OX, z+OZ, y),
    makeLabel:(t,s,o={})=>{ if(o.follow) return W.makeLabel(t,s,o); return accXZ(W.makeLabel(t,s,{...o, x:(o.x||0)+OX, z:(o.z||0)+OZ})); },
    makeActor:(gl,o={})=>W.makeActor(gl, {...o, parent:o.parent ? raw(o.parent) : root}),
    burst:(pos,...r)=>W.burst(new THREE.Vector3(pos.x+OX, pos.y, pos.z+OZ), ...r),
    addBench:o=>W.addBench({...o, x:o.x+OX, z:o.z+OZ}),
    addSeat:s=>W.addSeat(Object.assign(s, {x:s.x+OX, z:s.z+OZ})),
  };
  for(const k of ['addPlat','addSeg','teleport','groundAt','groundH','groundAtY','makeLabel','makeActor','burst','addBench','addSeat']) if(typeof W[k]!=='function') delete OVR[k];   // hàm lõi chưa có → để module tự kiểm tra như cũ
  return new Proxy(W, {
    get(t,k){ if(k==='sky'){ if(t.sky!==skySrc){ skySrc=t.sky; skyV=oview(skySrc); } return skyV; } return (k in OVR) ? OVR[k] : Reflect.get(t,k); },
    set(t,k,v){ t[k]=v; return true; },
    has(t,k){ return (k in OVR) || (k in t); } });
}
