// QC World – RÀ SOÁT TƯ THẾ / XUYÊN HÌNH (phiên S19g, 16/11/2026)
// Nạp vào trang game đang chạy (qua CDP hoặc dán vào console) → window.__poseAudit = { scan(opts), meshes(), ... }
// Với từng nhân vật (người chơi + bot trong ACTORS): lấy các đoạn xương (đùi, cẳng chân, gót/mũi bàn chân → đế giày, thân, cổ-đầu, tay)
// rồi bắn tia 2 chiều dọc mỗi đoạn vào lưới cảnh (trừ chính các nhân vật). Đoạn nào cắt qua mặt sàn / ghế / thân xe / mái → ghi lỗi:
//   legs  = chân lún xuống đất, tọt xuống sàn xe, xuyên ghế     head = đầu lòi qua mái / trần
//   torso = thân xuyên vật                                     arms = tay xuyên vật (mức nhẹ)
// Không sửa gì trong game – chỉ đọc.
(()=>{
  const W=__qc.W, T3=W.THREE, scene=W.scene;
  const rc=new T3.Raycaster(); rc.firstHitOnly=false;
  const _a=new T3.Vector3(), _b=new T3.Vector3(), _d=new T3.Vector3(), _s=new T3.Sphere();
  const SKIP=/^(sky|skybox|skydome|sky-?sphere|clouds?|fog|glow|halos?|sparks?|confetti|smoke|puffs?|grass|labels?|rain|snow|mist|spray|bubbles?|beams?|rays?|lightshafts?|godrays?)([\s:_\-.#]|$)|shadowProx/i;
  let MESH=null;
  function actorRoots(){ const s=new Set(); for(const A of (W.ACTORS||[])) if(A && A.g) s.add(A.g); if(W.me && W.me.g) s.add(W.me.g); return s; }
  function meshes(force){ if(MESH && !force) return MESH; const roots=actorRoots(), out=[]; scene.updateMatrixWorld(true);
    const inActor=o=>{ for(let p=o; p; p=p.parent) if(roots.has(p)) return true; return false; };
    scene.traverseVisible(o=>{ if(!o.isMesh || o.isSkinnedMesh) return; if(o.isInstancedMesh && o.count>250) return;
      const m=Array.isArray(o.material)?o.material[0]:o.material; if(!m || m.isShaderMaterial || m.isRawShaderMaterial || m.isPointsMaterial || m.isSpriteMaterial) return;
      if(m.transparent && (m.opacity??1)<.35) return; if(m.depthWrite===false && m.transparent) return; if(o.userData.shadowProxy || o.userData.noRay) return;
      if(SKIP.test(o.name||'') || o===W.water || o===W.ocean || o===W.sky || /^(water|ocean|sea)/i.test(o.name||'')) return; if(inActor(o)) return;
      const g=o.geometry; if(!g || !g.attributes || !g.attributes.position) return; if(!g.boundingSphere) g.computeBoundingSphere(); if(!g.boundingSphere) return;
      _s.copy(g.boundingSphere).applyMatrix4(o.matrixWorld); out.push({o, lc:g.boundingSphere.center.clone(), c:_s.center.clone(), r:_s.radius}); });
    MESH=out; return out; }
  const nameOf=o=>{ const n=[]; for(let p=o; p && p!==scene && n.length<3; p=p.parent) if(p.name) n.push(p.name); const m=Array.isArray(o.material)?o.material[0]:o.material;
    return (n.join(' < ')||'(không tên)')+(m && m.color ? ' #'+m.color.getHexString() : ''); };
  // tia 2 chiều dọc đoạn a→b; bỏ qua tol mét ở 2 đầu (khớp chạm nhẹ là bình thường)
  function cross(a, b, cands, tol){ const L=a.distanceTo(b); if(L<1e-3) return null; const hits=[];
    for(const [p,q] of [[a,b],[b,a]]){ _d.subVectors(q,p).normalize(); rc.set(p,_d); rc.near=tol; rc.far=L-tol; if(rc.far<=rc.near) continue;
      const near=cands.filter(c=>{ const t=Math.max(0,Math.min(L,_a.subVectors(c.c,p).dot(_d))); return _b.copy(p).addScaledVector(_d,t).distanceTo(c.c)<c.r+.05; }).map(c=>c.o);
      if(!near.length) continue; const h=rc.intersectObjects(near,false); if(h.length) hits.push(h[0]); }
    if(!hits.length) return null; hits.sort((x,y)=>x.distance-y.distance); return hits[0]; }
  const BN=['Hips','Spine','Spine1','Spine2','Neck','Head','HeadTop_End','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','RightUpLeg','RightLeg','RightFoot','RightToeBase','LeftArm','LeftForeArm','LeftHand','RightArm','RightForeArm','RightHand'];
  function bonesOf(g){ const B={}; g.traverse(o=>{ if(o.isBone){ const k=o.name.replace(/^mixamorig:?/,''); if(BN.includes(k) && !B[k]) B[k]=o; } }); return B; }
  const BC=new WeakMap(); const bones=g=>{ let b=BC.get(g); if(!b){ b=bonesOf(g); BC.set(g,b); } return b; };
  const wp=b=>b ? b.getWorldPosition(new T3.Vector3()) : null;
  // kiểm tra 1 nhân vật → danh sách lỗi
  function check(A, who, opt={}){ const g=A.g; if(!g || !g.parent) return []; let top=g; while(top.parent && top.parent!==scene) top=top.parent; top.updateMatrixWorld(true); const B=bones(g); if(!B.Hips) return [];
    const P={}; for(const k in B) P[k]=wp(B[k]); const H=A.h || (me()===A ? (W.me.h||1.75) : 1.75), sc=H/1.75, ankle=.085*sc, tol=opt.tol??.03;
    const cands=meshes().filter(c=>{ c.c.copy(c.lc).applyMatrix4(c.o.matrixWorld); return c.c.distanceTo(P.Hips)<c.r+2.6*sc; }); const out=[];   // tâm cầu tính lại theo ma trận hiện tại (vật đang chạy: xe, tàu…)
    const seg=(kind, a, b, label, t=tol)=>{ if(!a||!b) return; const h=cross(a,b,cands,t); if(h) out.push({who, kind, seg:label, obj:nameOf(h.object), at:[+h.point.x.toFixed(2),+h.point.y.toFixed(2),+h.point.z.toFixed(2)], depth:+Math.min(h.distance, a.distanceTo(b)-h.distance).toFixed(3)}); };
    for(const s of ['Left','Right']){ const K=P[s+'Leg'], F=P[s+'Foot'], T=P[s+'ToeBase'];
      const sole=F && F.clone().add(new T3.Vector3(0,-ankle,0)), toe=T && T.clone().add(new T3.Vector3(0,-.03*sc,0));
      seg('legs', P[s+'UpLeg'], K, s+' đùi'); seg('legs', K, sole, s+' cẳng chân→gót', .04); seg('legs', K, toe, s+' cẳng chân→mũi giày', .04); }
    seg('torso', P.Hips, P.Spine2, 'hông→ngực', .06); seg('torso', P.Spine2, P.Neck, 'ngực→cổ', .04);
    seg('head', P.Neck, P.Head, 'cổ→đầu', .03); if(P.HeadTop_End) seg('head', P.Head, P.HeadTop_End.clone().add(new T3.Vector3(0,.02*sc,0)), 'đỉnh đầu', .03);
    if(opt.arms!==false) for(const s of ['Left','Right']){ seg('arms', P[s+'Arm'], P[s+'ForeArm'], s+' cánh tay', .05); seg('arms', P[s+'ForeArm'], P[s+'Hand'], s+' cẳng tay', .04); }
    return out; }
  const me=()=>{ for(const A of (W.ACTORS||[])) if(A.g===W.me.g) return A; return {g:W.me.g, h:W.me.h}; };
  const tagOf=A=>{ try{ return (A.label && A.label.el && A.label.el.textContent) || A.name || A.g.name || '?'; }catch(e){ return '?'; } };
  // quét: người chơi + bot đang hiện trong bán kính R quanh người chơi
  function scan(opts={}){ const R=opts.R??60, res=[], seen=opts.seen||new Set(); MESH=null;
    const list=[]; if(opts.player!==false) list.push([me(), opts.playerTag||'NGƯỜI CHƠI']);
    for(const A of (W.ACTORS||[])){ if(A.g===W.me.g || seen.has(A) && !opts.again) continue; if(!A.g || !A.g.parent || !A.g.visible || (A.root && !A.root.visible)) continue;
      A.g.getWorldPosition(_a); if(Math.hypot(_a.x-W.P.x,_a.z-W.P.z)>R) continue; let vis=true; for(let p=A.g; p; p=p.parent) if(!p.visible){ vis=false; break; } if(!vis) continue; list.push([A, tagOf(A)]); }
    let n=0; for(const [A,tag] of list){ if(A!==me()) seen.add(A); n++; const pos=A.g.getWorldPosition(new T3.Vector3()); for(const e of check(A, tag, opts)) res.push({...e, pos:[+pos.x.toFixed(1),+pos.y.toFixed(1),+pos.z.toFixed(1)]}); }
    return {checked:n, issues:res}; }
  window.__poseAudit={scan, check, meshes, bones, me, tagOf};
  return 'poseaudit ready';
})()
