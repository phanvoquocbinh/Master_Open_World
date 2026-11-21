// QC World – bộ nạp model CC0 dùng chung (phiên D abyss-towers, 21/11/2026)
//  • Model thật: assets/models/cc0/polyhaven/<id>/<id>.gltf (Poly Haven, CC0) – thư mục bị gitignore, có thể KHÔNG có trên máy khác.
//  • W.cc0 dùng chung cho mọi module: cache theo id (1 lần tải / id), GLTFLoader nạp động (chỉ khi có module gọi place()).
//  • Thiếu file / lỗi tải → trả null, KHÔNG console.error; module gọi tự giữ đồ dựng bằng code (fallback).
//    Kiểm tra có thư mục bằng 1 yêu cầu duy nhất tới LICENSES_CC0.json (nếu thiếu: trình duyệt ghi đúng 1 dòng mạng 404, không lỗi JS).
//  • place(): mỗi model → InstancedMesh theo từng phần (geometry+material) ⇒ N bản sao chỉ tốn (số phần) draw call; không đổ bóng.
//  • Toạ độ model: đáy ở y=0, tâm x/z ở 0, mặt trước hướng +Z (chuẩn glTF) – kích thước thật (m) của Poly Haven, chỉnh bằng fit / s.
export function cc0Kit(W){
  if(W.cc0) return W.cc0;
  const THREE=W.THREE, BASE=W.cc0Base||'assets/models/cc0/polyhaven/', raw=new Map(), protos=new Map();
  let avail=null, LoaderP=null;
  const probe=()=>avail||(avail=(async()=>{ try{ if(typeof fetch!=='function' || typeof document==='undefined') return null; const r=await fetch(BASE+'LICENSES_CC0.json',{cache:'force-cache'}); if(!r.ok) return null; const j=await r.json(); return new Set((Array.isArray(j)?j:[]).map(x=>x.id)); }catch(e){ return null; } })());
  const loader=()=>LoaderP||(LoaderP=import('three/addons/loaders/GLTFLoader.js').then(m=>new m.GLTFLoader()).catch(()=>null));
  /* tải thô 1 lần / id */
  const loadRaw=id=>{ if(raw.has(id)) return raw.get(id); const p=(async()=>{ const set=await probe(); if(!set || !set.has(id)) return null; const L=await loader(); if(!L) return null;
      return await new Promise(res=>{ try{ L.load(BASE+id+'/'+id+'.gltf', g=>res(g), undefined, ()=>res(null)); }catch(e){ res(null); } }); })().catch(()=>null); raw.set(id,p); return p; };
  /* nguyên mẫu: gộp các mesh (lọc theo tên nút), đưa đáy về 0, tâm về 0; tuỳ chọn lite (bỏ normal/rough map – đồ nhỏ), art (tranh canvas cho khung) */
  const proto=(id,o={})=>{ const key=id+'|'+(o.pick||[]).join(',')+'|'+(o.lite?1:0)+'|'+(o.artKey||'')+'|'+(o.glow?'g':''); if(protos.has(key)) return protos.get(key);
    const p=loadRaw(id).then(g=>{ if(!g) return null; const sc=g.scene; sc.updateMatrixWorld(true); const parts=[], box=new THREE.Box3(), mats=new Map();
      const want=n=>{ if(!o.pick || !o.pick.length) return true; for(let q=n; q; q=q.parent) if(q.name && o.pick.some(s=>q.name.endsWith(s))) return true; return false; };
      sc.traverse(m=>{ if(!m.isMesh || !want(m)) return; const geo=m.geometry.clone(); geo.applyMatrix4(m.matrixWorld); for(const k of Object.keys(geo.attributes)) if(!['position','normal','uv'].includes(k)) geo.deleteAttribute(k);
        geo.computeBoundingBox(); box.union(geo.boundingBox); let mat=m.material;
        if(o.lite || o.art || o.glow){ if(!mats.has(mat)){ let mm=mat; if(o.lite){ mm=mm.clone(); mm.normalMap=null; mm.roughnessMap=null; mm.metalnessMap=null; mm.aoMap=null; }
            if(o.art && /artwork/i.test(mm.name||'')){ mm=mm.clone(); mm.map=o.art; mm.color&&mm.color.set(0xffffff); }
            if(o.glow && o.glow.re.test(mm.name||'') && mm.emissive){ mm=mm.clone(); mm.emissive.set(o.glow.color??0xffd9a0); mm.emissiveIntensity=o.glow.k??1.5; mm.transparent=false; mm.opacity=1; }
            mats.set(mat,mm); } mat=mats.get(mat); }
        parts.push({geo, mat}); });
      if(!parts.length) return null; const c=box.getCenter(new THREE.Vector3()), size=box.getSize(new THREE.Vector3()); for(const pt of parts){ pt.geo.translate(-c.x,-box.min.y,-c.z); pt.geo.computeBoundingSphere(); }
      return {id, parts, size}; }).catch(()=>null); protos.set(key,p); return p; };
  /* đặt N bản: items [{x,y,z,ry,s}] (y = sàn); o.fit {h|w|d: m} co giãn đồng đều cho đúng cỡ thật; o.parent; trả Promise<Group|null> */
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _v=new THREE.Vector3(), _s=new THREE.Vector3(), _up=new THREE.Vector3(0,1,0);
  const place=async(id,items,o={})=>{ if(!items || !items.length) return null; const P=await proto(id,o); if(!P) return null;
    const f=o.fit ? (o.fit.h ? o.fit.h/P.size.y : o.fit.w ? o.fit.w/P.size.x : o.fit.d ? o.fit.d/P.size.z : 1) : 1;
    const grp=new THREE.Group(); grp.name='cc0-'+id;
    for(const pt of P.parts){ const im=new THREE.InstancedMesh(pt.geo, pt.mat, items.length); im.castShadow=false; im.receiveShadow=!!o.receive;
      items.forEach((it,i)=>{ const k=f*(it.s||1); _q.setFromAxisAngle(_up,it.ry||0); _m.compose(_v.set(it.x,it.y,it.z),_q,_s.set(k*(it.sx||1),k*(it.sy||1),k*(it.sz||1))); im.setMatrixAt(i,_m); });
      im.instanceMatrix.needsUpdate=true; im.computeBoundingSphere&&im.computeBoundingSphere(); grp.add(im); }
    (o.parent||W.scene).add(grp); return grp; };
  const stats={get loaded(){ return [...raw.keys()]; }};
  W.cc0={load:loadRaw, proto, place, available:probe, stats};
  return W.cc0;
}
