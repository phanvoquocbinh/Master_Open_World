(()=>{ const q=__qc, W=q.W, T=W.THREE, I=W.hillsInfo||{}, rc=new T.Raycaster(); rc.far=10; const down=new T.Vector3(0,-1,0), o=new T.Vector3();
  const roads=q.scene.children.filter(m=>m.isMesh && m.userData && m.userData.dynamic && m.material && m.material.polygonOffset && m.material.map && m.geometry.attributes.position.count>200);
  const out={roads:roads.length};
  for(const [k,P] of [['MAIN',I.MAIN],['COAST',I.COAST]]){ if(!P) continue; const bad=[]; let n=0;
    for(let i=0;i<P.pts.length;i+=2){ const p=P.pts[i]; for(const off of [0,-.35,.35]){ const a=P.pts[Math.max(0,i-1)], b=P.pts[Math.min(P.pts.length-1,i+1)], dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||1, x=p.x-dz/l*P.w*off, z=p.z+dx/l*P.w*off;
        const ga=W.groundAt(x,z); o.set(x,ga+6,z); rc.set(o,down); const h=rc.intersectObjects(roads,false)[0]; n++; if(!h) continue; const d=h.point.y-ga; if(d>.08) bad.push([+x.toFixed(1),+z.toFixed(1),+ga.toFixed(2),+d.toFixed(2)]); } }
    bad.sort((a,b)=>b[3]-a[3]); out[k]={samples:n, bad:bad.length, worst:bad.slice(0,15), hist:[.08,.15,.3,.5,1,2].map(t=>bad.filter(b=>b[3]>t).length)}; }
  return out; })()
