// Rà "bánh xe lún dưới mặt đường": dọc mọi cạnh đồ thị đường xe (taxi/bus), bắn tia thẳng đứng xuống, lấy mặt nhìn thấy cao nhất
// trong khoảng [groundAt-0.3, groundAt+0.6] (bỏ người, xe, vật trong suốt, quầng sáng) rồi so với groundAt (độ cao bánh xe đặt lên).
(()=>{ const q=__qc, W=q.W, T=W.THREE, G=W.transit && W.transit.G; if(!G) return 'no graph';
  const rc=new T.Raycaster(), down=new T.Vector3(0,-1,0), o=new T.Vector3(); rc.far=200;
  const skip=m=>{ for(let p=m; p; p=p.parent){ if(p.userData && (p.userData.dynamic||p.userData.wheels)) return true; if(p.isInstancedMesh) return true; } const mt=m.material; return !mt || mt.transparent || mt.isShaderMaterial || m.isSkinnedMesh || m.isPoints || m.isLine || m.isSprite; };
  const meshes=[]; q.scene.traverse(m=>{ if(m.isMesh && m.visible && !skip(m)) meshes.push(m); });
  const bad=[]; let n=0;
  for(const [a,b] of G.edges){ const A=G.nodes[a], B=G.nodes[b], L=Math.hypot(B.x-A.x,B.z-A.z); for(let t=0;t<L;t+=4){ const x=A.x+(B.x-A.x)*t/L, z=A.z+(B.z-A.z)*t/L, g=W.groundAt(x,z); n++;
      o.set(x,g+0.6,z); rc.set(o,down); rc.far=0.95; const hits=rc.intersectObjects(meshes,false); if(!hits.length) continue; const top=hits[0].point.y;
      if(top-g>.05) bad.push({x:+x.toFixed(1), z:+z.toFixed(1), g:+g.toFixed(2), surf:+top.toFixed(2), d:+(top-g).toFixed(2), obj:(hits[0].object.name||hits[0].object.material.type)+(hits[0].object.parent&&hits[0].object.parent.name?'/'+hits[0].object.parent.name:'')}); } }
  // gom theo vùng 20 m
  const grp={}; for(const r of bad){ const k=Math.round(r.x/20)+','+Math.round(r.z/20); (grp[k] ||= []).push(r); }
  return {samples:n, bad:bad.length, zones:Object.values(grp).map(l=>({at:[l[0].x,l[0].z], n:l.length, dmax:Math.max(...l.map(r=>r.d)), g:l[0].g, surf:l[0].surf, obj:l[0].obj})).sort((a,b)=>b.n-a.n).slice(0,40)}; })()
