// QC World – sinh "người" đa dạng từ khung Xbot (Mixamo):
// tô màu da / áo / quần / váy / giày theo xương + tóc, mũ, kính, mắt → mỗi người là 1 SkinnedMesh duy nhất (1 lượt vẽ).
// Không cần tải thêm model: mỗi "seed" ra 1 người khác nhau (giới tính, chiều cao, màu da, trang phục, kiểu tóc).
export function makePeople(W){
  const {THREE, MODELS, clipOf, SkeletonUtils} = W;
  const XB=MODELS.xbot; if(!XB || !SkeletonUtils) return null;
  XB.scene.updateMatrixWorld(true);
  const skins=[]; XB.scene.traverse(o=>{ if(o.isSkinnedMesh) skins.push(o); });
  const body=skins.find(s=>/Surface/i.test(s.name)) || skins[0];
  const bones=body.skeleton.bones, bname=bones.map(b=>b.name.replace(/^mixamorig:?/,'')), bi=n=>bname.indexOf(n);
  const R2={skin:0, hand:1, fore:2, shirt:3, hips:4, thigh:5, shin:6, shoe:7};
  const reg=bname.map(n=>{
    if(/^(Head|HeadTop_End|LeftEye|RightEye|Neck)$/.test(n)) return R2.skin;
    if(/Hand/.test(n)) return R2.hand;
    if(/ForeArm/.test(n)) return R2.fore;
    if(/(Arm|Shoulder|Spine)/.test(n)) return R2.shirt;
    if(n==='Hips') return R2.hips;
    if(/UpLeg/.test(n)) return R2.thigh;
    if(/Leg$/.test(n)) return R2.shin;
    if(/(Foot|Toe)/.test(n)) return R2.shoe;
    return R2.shirt; });

  /* ---------- hình gốc: thân + khớp gộp 1 lần (toạ độ nội bộ của mesh thân) ---------- */
  const inv=new THREE.Matrix4().copy(body.matrixWorld).invert();
  const parts=skins.filter(s=>s.skeleton.bones.length===bones.length && s.skeleton.bones.every((b,i)=>b.name===bones[i].name));
  let NV=0, NI=0; for(const s of parts){ NV+=s.geometry.attributes.position.count; NI+=s.geometry.index ? s.geometry.index.count : s.geometry.attributes.position.count; }
  const BP=new Float32Array(NV*3), BN=new Float32Array(NV*3), BSI=new Uint16Array(NV*4), BSW=new Float32Array(NV*4), BI=new Uint32Array(NI), BR=new Uint8Array(NV), BJ=new Uint8Array(NV);
  { let vo=0, io=0; const v=new THREE.Vector3(), rel=new THREE.Matrix4();
    for(const s of parts){ const g=s.geometry, P=g.attributes.position, N=g.attributes.normal, SI=g.attributes.skinIndex, SW=g.attributes.skinWeight, n=P.count; rel.multiplyMatrices(inv, s.matrixWorld);
      const nm=new THREE.Matrix3().getNormalMatrix(rel), joint=s!==body;
      for(let i=0;i<n;i++){ v.fromBufferAttribute(P,i).applyMatrix4(rel); BP.set([v.x,v.y,v.z], (vo+i)*3);
        v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize(); BN.set([v.x,v.y,v.z], (vo+i)*3);
        let best=0, bw=-1; for(let k=0;k<4;k++){ const ix=SI.getComponent(i,k), w=SW.getComponent(i,k); BSI[(vo+i)*4+k]=ix; BSW[(vo+i)*4+k]=w; if(w>bw){ bw=w; best=ix; } }
        BR[vo+i]=reg[best]; BJ[vo+i]=joint?1:0; }
      if(g.index){ const A=g.index.array; for(let k=0;k<A.length;k++) BI[io+k]=A[k]+vo; io+=A.length; } else { for(let k=0;k<n;k++) BI[io+k]=vo+k; io+=n; }
      vo+=n; } }
  // hộp đầu → dựng tóc/mũ/kính quanh đầu. Lưu ý: toạ độ đỉnh của Xbot (mét) = toạ độ thế giới lúc đứng nghỉ (bindMatrix = I), KHÔNG nhân matrixWorld (0.01)
  const hb=new THREE.Box3(); { const v=new THREE.Vector3(), hi=[bi('Head'),bi('HeadTop_End')];
    for(let i=0;i<body.geometry.attributes.position.count;i++){ const SI=body.geometry.attributes.skinIndex, SW=body.geometry.attributes.skinWeight; let best=0,bw=-1; for(let k=0;k<4;k++){ const w=SW.getComponent(i,k); if(w>bw){ bw=w; best=SI.getComponent(i,k); } }
      if(hi.includes(best)){ v.fromBufferAttribute(body.geometry.attributes.position,i); hb.expandByPoint(v); } } }
  const HC=hb.getCenter(new THREE.Vector3()), HS=hb.getSize(new THREE.Vector3()).multiplyScalar(.5);   // tâm + nửa kích thước đầu
  const eyeW=n=>{ const b=bones[bi(n)]; return b ? b.getWorldPosition(new THREE.Vector3()) : null; };
  const EL=eyeW('LeftEye'), ER=eyeW('RightEye'), HEAD=bi('Head');

  /* ---------- bảng màu ---------- */
  const SKIN=[0xf3d2b8,0xeec3a0,0xe0ac85,0xc68e66,0xa86f4c,0x7d4f35];
  const HAIR=[0x1b1512,0x2a1d16,0x3b2a20,0x5a3c27,0x7a5232,0x8f6b4a,0xb08d57,0x6b2e2e,0x2c2c3a,0x9a9a9a];
  const SHIRT=[0xffffff,0xf1f1ee,0x1f2a44,0x2f6fd0,0x8fc2f0,0x46a36b,0xd94848,0xf2c230,0xff8fc2,0x6b4fa0,0x222222,0x9aa3ad,0xe87b3a,0x2bb3a6,0xc7b299,0x8b1e3f];
  const PANTS=[0x1f2a44,0x2c3e66,0x3d5a8a,0x111111,0x3a3a3a,0x6b6b6b,0xc2b280,0x8a7357,0x4b3b2a,0x2e4a3a];
  const SHOE=[0xf5f5f5,0x111111,0x5a3a22,0x2f6fd0,0xd94848,0x8a8a8a];
  const CAP=[0xd94848,0x1f2a44,0x111111,0xf2c230,0x46a36b,0xffffff];

  /* ---------- dựng tóc / mũ / kính / mắt (toạ độ thế giới mẫu) ---------- */
  const tmpM=new THREE.Matrix4();
  function piece(geo, col, list, mat4){ let g=geo.index ? geo.toNonIndexed() : geo; g=g.clone(); if(mat4) g.applyMatrix4(mat4); g.computeVertexNormals();
    list.push({g, col}); }
  const sph=(r,ws,hs,ps,pl,ts,tl)=>new THREE.SphereGeometry(r,ws,hs,ps,pl,ts,tl);
  const TRS=(x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>tmpM.clone().compose(new THREE.Vector3(x,y,z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)), new THREE.Vector3(sx,sy,sz));
  function hair(style, col, list){
    const r=1, cx=HC.x, cy=HC.y, cz=HC.z, hx=HS.x*1.12, hy=HS.y*1.02, hz=HS.z*1.14;
    // chỏm tóc: nửa sau phủ thấp, nửa trước chỉ tới trán (lộ mặt)
    const cap=(tl=.53, tf=.3, k=1)=>{ const m=TRS(cx, cy+hy*.06, cz-hz*.04, hx*k, hy*k, hz*k); piece(sph(r,18,10,Math.PI,Math.PI,0,Math.PI*tl), col, list, m); piece(sph(r,18,6,0,Math.PI,0,Math.PI*tf), col, list, m); };
    const back=(t0=.42,t1=.86,k=1)=>piece(sph(r,16,10,Math.PI,Math.PI,Math.PI*t0,Math.PI*(t1-t0)), col, list, TRS(cx, cy+hy*.04, cz-hz*.03, hx*k, hy*k, hz*k));
    switch(style){
      case 'buzz': cap(.47,.27,.96); break;
      case 'short': cap(); back(.45,.78); break;
      case 'spiky': cap(); back(.45,.76); for(let i=0;i<7;i++){ const a=i/7*Math.PI*2; piece(new THREE.ConeGeometry(.022,.07,5), col, list, TRS(cx+Math.cos(a)*hx*.5, cy+hy*.95, cz+Math.sin(a)*hz*.5-.01, 1,1,1, Math.sin(a)*.5, 0, -Math.cos(a)*.5)); } break;
      case 'bob': cap(.5); piece(sph(r,18,10,Math.PI/2+.62,Math.PI*2-1.24,Math.PI*.3,Math.PI*.45), col, list, TRS(cx, cy+hy*.02, cz-hz*.02, hx*1.08, hy*1.08, hz*1.08)); break;
      case 'long': cap(.5); piece(sph(r,18,10,Math.PI/2+.7,Math.PI*2-1.4,Math.PI*.3,Math.PI*.52), col, list, TRS(cx, cy+hy*.02, cz-hz*.02, hx*1.08, hy*1.08, hz*1.08));
        piece(new THREE.CylinderGeometry(hx*.95, hx*1.15, .3, 14, 1, true, Math.PI/2+.35, Math.PI-.7), col, list, TRS(cx, cy-hy*1.02-.1, cz-hz*.22, 1,1,1.05)); break;
      case 'ponytail': cap(); back(.45,.8); piece(sph(.045,10,8), col, list, TRS(cx, cy-hy*.1, cz-hz*1.18, 1,2.6,1, -.35)); piece(sph(.03,8,6), col, list, TRS(cx, cy+hy*.25, cz-hz*1.02)); break;
      case 'bun': cap(); back(.45,.8); piece(sph(.06,12,8), col, list, TRS(cx, cy+hy*.72, cz-hz*.62)); break;
      case 'cap': { const cc=CAP[(col>>3)%CAP.length]; piece(sph(r,18,8,0,Math.PI*2,0,Math.PI*.38), cc, list, TRS(cx, cy+hy*.22, cz-hz*.02, hx*1.06, hy*1.0, hz*1.08));
        piece(new THREE.CylinderGeometry(hx*.85, hx*.85, .012, 16, 1, false, -Math.PI/2, Math.PI), cc, list, TRS(cx, cy+hy*.38, cz+hz*.55, 1,1,1.3)); back(.48,.74,.98); break; }
      case 'bald': default: break;
    }
  }
  function face(list, glasses){
    for(const e of [EL,ER]) if(e) piece(sph(.0115,8,6), 0x1a1a1f, list, TRS(e.x, e.y+.004, e.z+.012));
    if(glasses && EL && ER){ const gc=0x202024, y=EL.y+.004, z=Math.max(EL.z,ER.z)+.03;
      for(const e of [EL,ER]) piece(new THREE.TorusGeometry(.024,.0035,6,14), gc, list, TRS(e.x, y, z));
      piece(new THREE.BoxGeometry(Math.abs(EL.x-ER.x)-.045,.004,.004), gc, list, TRS((EL.x+ER.x)/2, y+.006, z)); }
  }

  /* ---------- 1 biến thể = 1 SkinnedMesh ---------- */
  const mat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.78, metalness:0, side:THREE.DoubleSide});
  const C=new THREE.Color();
  function rng(seed){ let s=(seed*2654435761)>>>0 || 1; return ()=>((s=(s*1664525+1013904223)>>>0)/4294967296); }
  function look(seed){ const r=rng(seed+17), p=a=>a[Math.floor(r()*a.length)];
    const female=r()<.5, dress=female && r()<.28, skirt=female && !dress && r()<.3, shorts=!female && r()<.12;
    return { seed, female, dress, skirt, shorts, long:r()<.62,
      skin:p(SKIN), hair:p(HAIR), shirt:p(SHIRT), pants:p(PANTS), shoe:p(SHOE),
      style: female ? p(['long','long','bob','ponytail','bun','short']) : p(['short','short','buzz','spiky','cap','bald','short']),
      glasses:r()<.24, height: female ? 1.56+r()*.14 : 1.66+r()*.18, width:.94+r()*.12 }; }
  const cache=new Map();
  function variant(seed, ov){ const key=seed+(ov?JSON.stringify(ov):''); if(cache.has(key)) return cache.get(key);
    const L=Object.assign(look(seed), ov||{}), extra=[]; hair(L.style, L.hair, extra); face(extra, L.glasses);
    // màu theo vùng
    const regionCol=[L.skin, L.skin, L.long?L.shirt:L.skin, L.shirt, L.dress?L.shirt:L.pants, (L.dress)?L.shirt:(L.skirt?L.pants:L.pants), (L.dress||L.skirt||L.shorts)?L.skin:L.pants, L.shoe];
    if(L.shorts) regionCol[R2.thigh]=L.pants;
    let ev=0; for(const e of extra) ev+=e.g.attributes.position.count;
    const n=NV+ev, P=new Float32Array(n*3), N=new Float32Array(n*3), CO=new Float32Array(n*3), SI=new Uint16Array(n*4), SW=new Float32Array(n*4), IX=new Uint32Array(NI+ev);
    P.set(BP); N.set(BN); SI.set(BSI); SW.set(BSW); IX.set(BI);
    const cols=regionCol.map(h=>C.set(h).toArray()), dark=cols.map(c=>c.map(x=>x*.82));
    for(let i=0;i<NV;i++){ const c=(BJ[i]?dark:cols)[BR[i]]; CO[i*3]=c[0]; CO[i*3+1]=c[1]; CO[i*3+2]=c[2]; }
    let vo=NV, io=NI; const v=new THREE.Vector3();
    for(const e of extra){ const g=e.g, EP=g.attributes.position, EN=g.attributes.normal, k=EP.count; C.set(e.col);
      for(let i=0;i<k;i++){ v.fromBufferAttribute(EP,i); P.set([v.x,v.y,v.z],(vo+i)*3);
        v.fromBufferAttribute(EN,i).normalize(); N.set([v.x,v.y,v.z],(vo+i)*3);
        CO[(vo+i)*3]=C.r; CO[(vo+i)*3+1]=C.g; CO[(vo+i)*3+2]=C.b; SI[(vo+i)*4]=HEAD; SW[(vo+i)*4]=1; IX[io+i]=vo+i; }
      vo+=k; io+=k; }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(P,3)); geo.setAttribute('normal', new THREE.BufferAttribute(N,3)); geo.setAttribute('color', new THREE.BufferAttribute(CO,3));
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI,4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(SW,4)); geo.setIndex(new THREE.BufferAttribute(IX,1));
    geo.computeBoundingSphere();
    // mẫu: bản sao bộ xương Xbot + 1 SkinnedMesh duy nhất
    const tmpl=SkeletonUtils.clone(XB.scene); let tb=null; const old=[]; tmpl.traverse(o=>{ if(o.isSkinnedMesh){ old.push(o); if(/Surface/i.test(o.name)||!tb) tb=o; } });
    const sm=new THREE.SkinnedMesh(geo, mat); sm.name='person'; sm.castShadow=true; sm.receiveShadow=true; sm.frustumCulled=false;
    tb.parent.add(sm); sm.position.copy(tb.position); sm.quaternion.copy(tb.quaternion); sm.scale.copy(tb.scale); tmpl.updateMatrixWorld(true);
    sm.bind(tb.skeleton, tb.bindMatrix);
    for(const o of old) o.parent.remove(o);
    const out={gl:{scene:tmpl, animations:XB.animations}, look:L}; cache.set(key, out); return out; }

  const clips={idle:clipOf(XB,'idle'), walk:clipOf(XB,'walk'), run:clipOf(XB,'run'), agree:clipOf(XB,'agree'), shake:clipOf(XB,'headShake')};
  // kit: dùng chung với makeActor ({gl, h, face, clips}) – seed giống nhau → cùng 1 người
  function kit(seed, o={}){ const v=variant(((seed>>>0)%997)+1, o.outfit); return {gl:v.gl, h:o.h||v.look.height, face:0, clips, look:v.look, compact:false}; }
  const names={ f:['Lan','Linh','Mai','Ngọc','Quỳnh','Thảo','Trang','Uyên','Vy','Nhi','Hà','Hạnh','Châu','Giang','My','Thư','Yến','Hương','Ánh','Diệp'],
                m:['An','Bình','Dũng','Hải','Huy','Khánh','Long','Minh','Nam','Phúc','Quân','Sơn','Tâm','Tuấn','Việt','Khoa','Đạt','Hiếu','Kiên','Lộc'] };
  // người ngẫu nhiên có giới tính mong muốn (nữ/nam) – trả về seed phù hợp
  function seedFor(want, salt=0){ for(let s=salt*131+7, k=0; k<400; k++, s+=13){ const L=look(((s>>>0)%997)+1); if(!want || (want==='f')===L.female) return s; } return salt; }
  function nameOf(seed){ const L=look(((seed>>>0)%997)+1), a=L.female?names.f:names.m; return a[(seed>>>3)%a.length]; }
  // tìm seed thoả điều kiện (vd. nữ, tóc dài) – ổn định theo salt
  function pickSeed(pred, salt=0){ for(let k=0;k<600;k++){ const s=(salt*7919+k*104729+11)>>>0; if(pred(look((s%997)+1))) return s; } return salt; }
  return {kit, look:s=>look(((s>>>0)%997)+1), seedFor, pickSeed, nameOf, material:mat};
}
