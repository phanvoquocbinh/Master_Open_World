// QC World – tối ưu hiệu năng
// Máy dùng card tích hợp (Intel Iris Xe…) bị nghẽn ở SỐ LƯỢT VẼ (draw call), không phải ở số điểm ảnh →
// gộp càng nhiều mesh càng tốt:
// 1) batchStatic: gộp mesh tĩnh theo (chữ ký vật liệu, đổ bóng, ô lưới) – vật liệu giống hệt nhau (cùng màu/texture) dùng chung 1 khối.
// 2) compactGroup: gộp mesh bên trong 1 nhóm động (bồn hoa, nhà trên lô đất, xe…) theo vật liệu, nhóm vẫn di chuyển/scale được.
// 3) compactRig: nhân vật Robot có 19 mảnh (mỗi mảnh 1 lượt vẽ) → gộp thành 1 SkinnedMesh mỗi vật liệu (3 lượt vẽ), vẫn chuyển động theo xương.
// 4) Không vẽ cỏ / vật nhỏ trong lượt phản chiếu của mặt nước.

const hexOf = c => c ? c.getHex() : '';
const idOf = t => t ? t.uuid : '';
// chữ ký vật liệu: 2 vật liệu cùng chữ ký trông giống hệt nhau → gộp chung được
export function matSig(m){
  if(m.userData && m.userData.noMerge) return m.uuid;
  return [m.type, hexOf(m.color), hexOf(m.emissive), m.emissiveIntensity, m.roughness, m.metalness, idOf(m.map), idOf(m.normalMap), idOf(m.roughnessMap),
    idOf(m.metalnessMap), idOf(m.emissiveMap), idOf(m.alphaMap), idOf(m.aoMap), idOf(m.envMap), m.envMapIntensity, m.transparent, m.opacity, m.side, m.alphaTest,
    m.alphaToCoverage, m.vertexColors, m.flatShading, m.depthWrite, m.depthTest, m.blending, m.toneMapped, m.fog, m.wireframe,
    m.clearcoat, m.clearcoatRoughness, m.transmission, m.ior, m.sheen, m.polygonOffset, m.polygonOffsetFactor, m.name].join('|');
}

function cleanGeo(THREE, src, keep=['position','normal','uv'], mat){
  let g=src.clone();
  if(mat && mat.vertexColors){ keep=[...keep,'color']; if(!g.attributes.color) g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(1),3)); }
  for(const k of Object.keys(g.attributes)) if(!keep.includes(k)) g.deleteAttribute(k);
  if(!g.attributes.normal) g.computeVertexNormals();
  if(keep.includes('uv') && !g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  g.morphAttributes={}; g.morphTargetsRelative=false; g.clearGroups();
  if(!g.index){ const n=g.attributes.position.count, a=n>65535?new Uint32Array(n):new Uint16Array(n); for(let i=0;i<n;i++) a[i]=i; g.setIndex(new THREE.BufferAttribute(a,1)); }
  return g;
}

// Vật liệu màu trơn (không texture, không phát sáng, không trong suốt) → 1 vật liệu chung "màu theo đỉnh" cho mỗi (độ nhám, kim loại):
// hàng trăm vật liệu màu khác nhau gộp thành vài vật liệu → ít lượt vẽ hơn rất nhiều.
const VC=new Map();
function vcKey(m){
  if(!m.isMeshStandardMaterial || m.isMeshPhysicalMaterial || (m.userData && m.userData.noMerge)) return null;
  if(m.map||m.normalMap||m.roughnessMap||m.metalnessMap||m.emissiveMap||m.alphaMap||m.aoMap||m.bumpMap||m.lightMap||m.displacementMap||m.envMap) return null;
  if(m.transparent || m.opacity<1 || m.alphaTest>0 || m.vertexColors || m.wireframe || m.alphaToCoverage) return null;
  if(m.emissive && (m.emissive.r+m.emissive.g+m.emissive.b)>0) return null;     // có phát sáng → có thể đổi theo ngày/đêm
  return `VC|${m.side}|${m.flatShading?1:0}|${m.envMapIntensity}|${m.depthWrite}|${m.polygonOffset?m.polygonOffsetFactor:0}`;   // độ nhám/kim loại lưu theo đỉnh → không tách khối
}
// S3.1: độ nhám + độ kim loại cũng lấy theo đỉnh (thuộc tính 'rm') → mọi vật liệu màu trơn trong 1 ô chỉ còn 1 lượt vẽ
function vcMat(THREE, m, k){ if(!VC.has(k)){ const mat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:1, metalness:0,
      side:m.side, flatShading:m.flatShading, envMapIntensity:m.envMapIntensity, depthWrite:m.depthWrite, polygonOffset:m.polygonOffset, polygonOffsetFactor:m.polygonOffsetFactor});
    mat.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <common>', `#include <common>
attribute vec2 rm;
varying vec2 vRM;`).replace('#include <begin_vertex>', `#include <begin_vertex>
vRM = rm;`);
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec2 vRM;`).replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vRM.x;').replace('#include <metalnessmap_fragment>', 'float metalnessFactor = vRM.y;'); };
    mat.customProgramCacheKey=()=>'vcRM'; VC.set(k, mat); }
  return VC.get(k); }
function paint(THREE, g, c, m){ const n=g.attributes.position.count, a=new Float32Array(n*3), r=new Float32Array(n*2), ro=m?m.roughness:1, me=m?m.metalness:0;
  for(let i=0;i<n;i++){ a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b; r[i*2]=ro; r[i*2+1]=me; }
  g.setAttribute('color', new THREE.Float32BufferAttribute(a,3)); g.setAttribute('rm', new THREE.Float32BufferAttribute(r,2)); }
// mesh nhiều vật liệu (hộp 6 mặt…) → tách thành từng phần theo vật liệu
function parts(THREE, o){
  const m=o.material;
  if(!Array.isArray(m)) return [[o.geometry, m]];
  const geo=o.geometry; if(!geo.groups.length) return [[geo, m[0]]];
  const base=geo.index ? geo : (()=>{ const g=geo.clone(), n=g.attributes.position.count, a=n>65535?new Uint32Array(n):new Uint16Array(n); for(let i=0;i<n;i++) a[i]=i; g.setIndex(new THREE.BufferAttribute(a,1)); return g; })();
  const byMat=new Map();
  for(const gr of geo.groups){ const mm=m[gr.materialIndex]; if(!mm) continue; (byMat.get(mm) || byMat.set(mm, []).get(mm)).push(gr); }
  const out=[];
  for(const [mm, grs] of byMat){ const idx=[]; for(const gr of grs){ const arr=base.index.array; const end=Math.min(arr.length, gr.start+gr.count); for(let i=gr.start;i<end;i++) idx.push(arr[i]); }
    const sub=new THREE.BufferGeometry(); for(const k of Object.keys(base.attributes)) sub.setAttribute(k, base.attributes[k]); sub.setIndex(idx); out.push([sub, mm]); }
  return out;
}

// Bóng đổ: thay vì cho từng khối hiển thị tự đổ bóng (hơn 100 lượt vẽ mỗi lần cập nhật bóng), gộp TẤT CẢ vật đổ bóng
// trong mỗi ô 48 m thành 1 khối "chỉ để vẽ bóng" (lượt vẽ bóng không cần màu → không cần tách theo vật liệu).
// Khối bóng ẩn khi vẽ cảnh, chỉ hiện trong lượt vẽ bóng (world.html bọc renderer.shadowMap.render).
const PXM=new Map();
function depthKey(m){ const side=m.shadowSide!=null ? m.shadowSide : m.side, at=m.alphaTest>0 && (m.map||m.alphaMap);
  return at ? `AT|${idOf(m.map)}|${idOf(m.alphaMap)}|${m.alphaTest}|${side}` : `OP|${side}`; }
function proxyMat(THREE, m, k){ if(!PXM.has(k)){ const at=k.startsWith('AT');
    PXM.set(k, new THREE.MeshBasicMaterial({side:m.side, shadowSide:m.shadowSide, map:at?m.map:null, alphaMap:at?m.alphaMap:null, alphaTest:at?m.alphaTest:0, colorWrite:false})); }
  return PXM.get(k); }
function proxyGeo(THREE, src, uv){
  const g=new THREE.BufferGeometry(); g.setAttribute('position', src.attributes.position.clone());
  if(uv) g.setAttribute('uv', src.attributes.uv ? src.attributes.uv.clone() : new THREE.Float32BufferAttribute(new Float32Array(src.attributes.position.count*2),2));
  if(src.index) g.setIndex(src.index.clone()); else { const n=src.attributes.position.count, a=n>65535?new Uint32Array(n):new Uint16Array(n); for(let i=0;i<n;i++) a[i]=i; g.setIndex(new THREE.BufferAttribute(a,1)); }
  return g; }

// S3.1 – ẢNH GỘP (atlas) cho bảng hiệu/biển tên vẽ bằng canvas: mỗi canvas riêng = 1 lượt vẽ riêng → xếp chung vào vài ảnh lớn,
// đổi toạ độ UV, các bảng cùng kiểu vật liệu trong 1 ô dùng chung 1 lượt vẽ. Bỏ qua: texture lặp (repeat), có phát sáng
// (đổi theo ngày/đêm), alphaTest, canvas được vẽ lại khi chơi (texture.userData.live).
function canvasOk(pm){ const t=pm.map, im=t && t.image;
  if(!im || typeof HTMLCanvasElement==='undefined' || !(im instanceof HTMLCanvasElement)) return false;
  if((t.userData && t.userData.live) || (pm.userData && (pm.userData.noMerge || pm.userData.live))) return false;
  if(pm.isMeshPhysicalMaterial || !(pm.isMeshStandardMaterial || pm.isMeshBasicMaterial || pm.isMeshLambertMaterial)) return false;
  if(pm.normalMap||pm.roughnessMap||pm.metalnessMap||pm.alphaMap||pm.aoMap||pm.bumpMap||pm.lightMap||pm.envMap||pm.emissiveMap||pm.alphaTest>0) return false;
  if(pm.emissive && (pm.emissive.r+pm.emissive.g+pm.emissive.b)>0) return false;
  if(t.repeat.x!==1 || t.repeat.y!==1 || t.offset.x || t.offset.y || t.rotation) return false;
  return im.width>=8 && im.height>=8 && im.width<=2048 && im.height<=2048; }
function uvOk(geo){ const uv=geo.attributes.uv; if(!uv) return false; const a=uv.array; for(let i=0;i<a.length;i++){ if(a[i]<-.002 || a[i]>1.002) return false; } return true; }
function buildAtlas(THREE, items, maxDim){
  const bad=new Set(), mats=new Map();
  for(const it of items){ const pm=it.pm; if(bad.has(pm)) continue; if(!canvasOk(pm) || !uvOk(it.geo)){ bad.add(pm); mats.delete(pm); continue; } mats.set(pm, true); }
  const bySig=new Map();
  for(const pm of mats.keys()){ const t=pm.map, keep=pm.map; pm.map=null; const sig=matSig(pm)+`|${t.colorSpace}|${t.flipY}|${t.premultiplyAlpha}`; pm.map=keep;
    if(!bySig.has(sig)) bySig.set(sig, []); bySig.get(sig).push(pm); }
  const out=new Map(), PAD=4, PG=2048;
  for(const list of bySig.values()){
    const texs=[...new Set(list.map(m=>m.map))]; if(texs.length<2) continue;
    const boxes=texs.map(t=>{ const im=t.image, k=Math.min(1, maxDim/Math.max(im.width, im.height)); return {t, w:Math.max(4,Math.round(im.width*k)), h:Math.max(4,Math.round(im.height*k))}; }).sort((a,b)=>b.h-a.h);
    const pages=[]; let pg=null, x=0, y=0, rowH=0;
    const newPage=()=>{ pg={boxes:[], w:0, h:0}; pages.push(pg); x=0; y=0; rowH=0; };
    newPage();
    for(const b of boxes){ const W2=b.w+PAD*2, H2=b.h+PAD*2;
      if(x+W2>PG){ x=0; y+=rowH; rowH=0; }
      if(y+H2>PG){ newPage(); }
      b.x=x+PAD; b.y=y+PAD; b.page=pg; pg.boxes.push(b); x+=W2; rowH=Math.max(rowH,H2); pg.w=Math.max(pg.w,x); pg.h=Math.max(pg.h,y+rowH); }
    for(const p of pages){ const cw=Math.min(PG, 1<<Math.ceil(Math.log2(Math.max(p.w,16)))), ch=Math.min(PG, 1<<Math.ceil(Math.log2(Math.max(p.h,16))));
      const cv=document.createElement('canvas'); cv.width=cw; cv.height=ch; const g=cv.getContext('2d');
      for(const b of p.boxes){ g.drawImage(b.t.image, b.x-PAD, b.y-PAD, b.w+PAD*2, b.h+PAD*2); g.drawImage(b.t.image, b.x, b.y, b.w, b.h); }   // viền kéo giãn → không lem màu khi thu nhỏ
      const t0=p.boxes[0].t, tex=new THREE.CanvasTexture(cv); tex.colorSpace=t0.colorSpace; tex.flipY=t0.flipY; tex.premultiplyAlpha=t0.premultiplyAlpha; tex.anisotropy=Math.max(4, ...p.boxes.map(b=>b.t.anisotropy||1));
      p.tex=tex; p.cw=cw; p.ch=ch; p.mats=new Map(); }
    const rect=new Map(); for(const b of boxes) rect.set(b.t, b);
    for(const pm of list){ const b=rect.get(pm.map); if(!b) continue; const p=b.page;
      if(!p.mats.has(pm.type)){ const nm=pm.clone(); nm.map=p.tex; nm.name=(pm.name||'')+'·atlas'; p.mats.set(pm.type, nm); }   // cùng chữ ký → 1 vật liệu chung cho cả trang
      out.set(pm, {mat:p.mats.get(pm.type), x:b.x, y:b.y, w:b.w, h:b.h, cw:p.cw, ch:p.ch, flip:pm.map.flipY}); }
  }
  return out;
}
function remapUV(g, a){ const uv=g.attributes.uv, arr=uv.array; for(let i=0;i<arr.length;i+=2){ const u=Math.min(1,Math.max(0,arr[i])), v=Math.min(1,Math.max(0,arr[i+1]));
    arr[i]=(a.x+u*a.w)/a.cw; arr[i+1]= a.flip ? (a.ch-a.y-a.h+v*a.h)/a.ch : (a.y+v*a.h)/a.ch; } uv.needsUpdate=true; }

export function batchStatic(W, target, cell){
  const {THREE, mergeGeometries} = W; const scene = target || W.scene;
  const CELL=cell || (W.QUAL==='low' ? 128 : 48), groups=new Map(), victims=[], v=new THREE.Vector3();
  const PROXY=!!W.SHPROXY, SHCELL=48, pgroups=new Map();
  scene.updateMatrixWorld(true);
  const isDyn=o=>{ for(let p=o; p; p=p.parent){ if(p.userData && p.userData.dynamic) return true; } return false; };
  const okMat=m=>m && !m.isShaderMaterial && !m.isRawShaderMaterial;
  const items=[];
  scene.traverse(o=>{
    if(!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || !o.visible) return;
    const m=o.material; if(!m || (Array.isArray(m) ? !m.every(okMat) : !okMat(m))) return;
    if(o.geometry.morphAttributes && Object.keys(o.geometry.morphAttributes).length) return;
    if(o.onBeforeRender && o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender) return;
    if(isDyn(o)) return;
    o.getWorldPosition(v);
    const cellKey=`${PROXY?0:o.castShadow?1:0}${o.receiveShadow?1:0}|${o.renderOrder}|${Math.floor(v.x/CELL)},${Math.floor(v.z/CELL)}`;
    for(const [geo, pm] of parts(THREE, o)) items.push({o, geo, pm, cellKey, cx:Math.floor(v.x/SHCELL), cz:Math.floor(v.z/SHCELL)});
    victims.push(o);
  });
  const AT = target ? null : buildAtlas(THREE, items, W.QUAL==='low' ? 640 : 1024);   // S3.1: bảng hiệu vẽ bằng canvas → chung 1 ảnh lớn
  for(const {o, geo, pm, cellKey, cx, cz} of items){
    if(PROXY && o.castShadow){ const dk=depthKey(pm), pk=`${dk}#${cx},${cz}`, pg=proxyGeo(THREE, geo, dk.startsWith('AT')); pg.applyMatrix4(o.matrixWorld);
      if(!pgroups.has(pk)) pgroups.set(pk, {m:proxyMat(THREE, pm, dk), list:[]}); pgroups.get(pk).list.push(pg); }
    const vk=vcKey(pm), at=!vk && AT && AT.get(pm), mat=vk ? vcMat(THREE, pm, vk) : at ? at.mat : pm;
    const g=cleanGeo(THREE, geo, vk ? ['position','normal','uv','color'] : undefined, vk ? null : mat); if(vk) paint(THREE, g, pm.color, pm);
    if(at) remapUV(g, at);
    g.applyMatrix4(o.matrixWorld);
    const key=`${vk || matSig(mat)}#${cellKey}`;
    if(!groups.has(key)) groups.set(key, {m:mat, cast:o.castShadow, recv:o.receiveShadow, ro:o.renderOrder, list:[]});
    groups.get(key).list.push(g);
  }
  let before=victims.length, after=0;
  for(const o of victims) o.parent && o.parent.remove(o);
  for(const {m, cast, recv, ro, list} of groups.values()){
    const merged=list.length===1 ? list[0] : mergeGeometries(list, false);
    if(!merged){ console.warn('batchStatic: không gộp được nhóm', m.type, list.length); continue; }
    merged.computeBoundingSphere();
    const mesh=new THREE.Mesh(merged, m); mesh.castShadow=PROXY?false:cast; mesh.receiveShadow=recv; mesh.renderOrder=ro; mesh.matrixAutoUpdate=false; mesh.userData.batched=true;
    scene.add(mesh); after++;
  }
  let shadow=0;
  if(PROXY && pgroups.size){ const root=new THREE.Group(); root.name='shadowProxies'; root.visible=false; root.userData.dynamic=true;
    for(const {m, list} of pgroups.values()){ const merged=list.length===1 ? list[0] : mergeGeometries(list, false); if(!merged) continue;
      merged.computeBoundingSphere(); const pm=new THREE.Mesh(merged, m); pm.castShadow=true; pm.receiveShadow=false; pm.matrixAutoUpdate=false; pm.userData.shadowProxy=true; root.add(pm); shadow++; }
    scene.add(root); W.SHPROXY.push(root); }
  return {before, after, shadow};
}

// Gộp mesh bên trong nhóm g theo vật liệu (toạ độ nội bộ của g). Bỏ qua nhánh con có userData.dynamic / keep.
export function compactGroup(W, g){
  const {THREE, mergeGeometries} = W; g.updateMatrixWorld(true);
  const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(), groups=new Map(), victims=[], tmp=new THREE.Matrix4();
  const skip=o=>{ for(let p=o; p && p!==g; p=p.parent){ if(p.userData && (p.userData.dynamic || p.userData.keep)) return true; } return false; };
  g.traverse(o=>{
    if(o===g || !o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || !o.visible) return;
    const m=o.material; if(!m || Array.isArray(m) || m.isShaderMaterial) return;
    if(o.geometry.morphAttributes && Object.keys(o.geometry.morphAttributes).length) return;
    if(skip(o)) return;
    const key=`${matSig(m)}#${o.castShadow?1:0}${o.receiveShadow?1:0}|${o.renderOrder}`;
    const geo=cleanGeo(THREE, o.geometry, undefined, m); geo.applyMatrix4(tmp.multiplyMatrices(inv, o.matrixWorld));
    if(!groups.has(key)) groups.set(key, {m, cast:o.castShadow, recv:o.receiveShadow, ro:o.renderOrder, list:[]});
    groups.get(key).list.push(geo); victims.push(o);
  });
  if(victims.length<2) return 0;
  for(const o of victims) o.parent && o.parent.remove(o);
  // dọn Group rỗng còn sót
  const empty=[]; g.traverse(o=>{ if(o!==g && !o.isMesh && o.children.length===0 && o.type==='Group' && !o.userData.dynamic && !o.userData.keep) empty.push(o); }); for(const o of empty) o.parent && o.parent.remove(o);
  let n=0;
  for(const {m, cast, recv, ro, list} of groups.values()){
    const merged=list.length===1 ? list[0] : mergeGeometries(list, false); if(!merged) continue;
    merged.computeBoundingSphere(); const mesh=new THREE.Mesh(merged, m); mesh.castShadow=cast; mesh.receiveShadow=recv; mesh.renderOrder=ro; g.add(mesh); n++;
  }
  return victims.length-n;
}

// Gộp nhân vật có mảnh cứng gắn vào xương (Robot): mọi mảnh + mọi SkinnedMesh cùng bộ xương → 1 SkinnedMesh / vật liệu.
export function compactRig(W, root){
  const {THREE, mergeGeometries} = W; root.updateMatrixWorld(true);
  const skins=[]; root.traverse(o=>{ if(o.isSkinnedMesh) skins.push(o); });
  if(!skins.length) return 0;
  const T=skins[0], sk=T.skeleton, bones=sk.bones, idx=new Map(bones.map((b,i)=>[b,i]));
  const BMi=T.bindMatrix.clone().invert();
  const same=(a,b)=>{ for(let i=0;i<16;i++) if(Math.abs(a.elements[i]-b.elements[i])>1e-5) return false; return true; };
  const groups=new Map(), victims=[], M=new THREE.Matrix4(), rel=new THREE.Matrix4(), bw=new THREE.Matrix4();
  const add=(o, geo)=>{ const key=`${o.material.uuid}|${o.castShadow?1:0}`; if(!groups.has(key)) groups.set(key,{m:o.material, cast:o.castShadow, recv:o.receiveShadow, list:[]}); groups.get(key).list.push(geo); victims.push(o); };
  // SkinnedMesh khác cùng xương + cùng tư thế bind → gộp thẳng
  for(const s of skins){
    if(Array.isArray(s.material)) continue;
    if(s!==T){ if(s.skeleton.bones.length!==bones.length || s.skeleton.bones.some((b,i)=>b!==bones[i])) continue;
      if(!same(s.bindMatrix, T.bindMatrix) || s.skeleton.boneInverses.some((m,i)=>!same(m, sk.boneInverses[i]))) continue; }
    const geo=cleanGeo(THREE, s.geometry, ['position','normal','uv','skinIndex','skinWeight']);
    const si=geo.attributes.skinIndex, sw=geo.attributes.skinWeight, n=si.count, a=new Uint16Array(n*4), w=new Float32Array(n*4);
    for(let i=0;i<n;i++){ a[i*4]=si.getX(i); a[i*4+1]=si.getY(i); a[i*4+2]=si.getZ(i); a[i*4+3]=si.getW(i); w[i*4]=sw.getX(i); w[i*4+1]=sw.getY(i); w[i*4+2]=sw.getZ(i); w[i*4+3]=sw.getW(i); }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(a,4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(w,4));
    add(s, geo);
  }
  // mảnh cứng nằm dưới 1 xương → trọng số 100% cho xương đó
  root.traverse(o=>{
    if(!o.isMesh || o.isSkinnedMesh || Array.isArray(o.material)) return;
    let b=o.parent; while(b && !b.isBone && b!==root) b=b.parent; if(!b || !b.isBone || !idx.has(b)) return;
    const i=idx.get(b);
    rel.copy(b.matrixWorld).invert().multiply(o.matrixWorld);          // mảnh so với xương (cố định)
    bw.copy(sk.boneInverses[i]).invert();                               // xương lúc bind
    M.multiplyMatrices(BMi, bw).multiply(rel);
    const geo=cleanGeo(THREE, o.geometry, ['position','normal','uv']); geo.applyMatrix4(M);
    const n=geo.attributes.position.count, a=new Uint16Array(n*4), w=new Float32Array(n*4); for(let k=0;k<n;k++){ a[k*4]=i; w[k*4]=1; }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(a,4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(w,4));
    add(o, geo);
  });
  if(victims.length<2 || groups.size>=victims.length) return 0;   // không gộp được gì → giữ nguyên
  const parent=T.parent;
  for(const o of victims) o.parent && o.parent.remove(o);
  let n=0;
  for(const {m, cast, recv, list} of groups.values()){
    for(const g of list){ if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); }
    const merged=list.length===1 ? list[0] : mergeGeometries(list, false); if(!merged) continue;
    merged.computeBoundingSphere();
    const sm=new THREE.SkinnedMesh(merged, m); sm.castShadow=cast; sm.receiveShadow=recv; sm.frustumCulled=false;
    parent.add(sm); sm.bind(sk, T.bindMatrix); n++;
  }
  return victims.length-n;
}

export function tuneReflections(W, hide){
  const {water} = W; if(!water.material.uniforms) return;   // nước nhẹ: không có lượt phản chiếu
  const orig=water.onBeforeRender;
  water.onBeforeRender=function(renderer, scene, camera){
    const st=hide().map(o=>{ const v=o.visible; o.visible=false; return [o,v]; });
    orig.call(this, renderer, scene, camera);
    for(const [o,v] of st) o.visible=v;
  };
}
