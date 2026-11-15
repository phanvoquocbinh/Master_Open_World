// Rà vật cản đặt trên tuyến đường xe (đồ thị taxi/bus + đường vành đai): circles/boxes/segs chiếm tâm đường ở độ cao bánh xe
(()=>{ const W=__qc.W, G=W.transit && W.transit.G, pts=[]; if(G) for(const [a,b] of G.edges){ const A=G.nodes[a], B=G.nodes[b], L=Math.hypot(B.x-A.x,B.z-A.z); for(let t=0;t<=L;t+=2) pts.push([A.x+(B.x-A.x)*t/L, A.z+(B.z-A.z)*t/L]); }
  for(let i=0;i<360;i++){ const a=i/360*Math.PI*2; for(const r of [41.2,44.8]) pts.push([Math.cos(a)*r, Math.sin(a)*r]); }
  const hit={}; const add=(k,o,x,z)=>{ if(!hit[k]) hit[k]={...o, at:[+x.toFixed(1),+z.toFixed(1)], n:0}; hit[k].n++; };
  for(const [x,z] of pts){ const y=W.groundAt(x,z);
    W.circles.forEach((c,i)=>{ if(c.y0!==undefined && (y<c.y0-.3||y>c.y1)) return; if(Math.hypot(x-c.x,z-c.z)<c.r+.25) add('c'+i,{kind:'circle', c:[+c.x.toFixed(1),+c.z.toFixed(1)], r:c.r},x,z); });
    W.boxes.forEach((b,i)=>{ if(b.y0!==undefined && (y<b.y0-.3||y>b.y1)) return; if(x>b.x0-.25&&x<b.x1+.25&&z>b.z0-.25&&z<b.z1+.25) add('b'+i,{kind:'box', x:[+b.x0.toFixed(1),+b.x1.toFixed(1)], z:[+b.z0.toFixed(1),+b.z1.toFixed(1)], msg:b.msg},x,z); });
    (W.SEGS||[]).forEach((s,i)=>{ if(s.y0!==undefined && (y<s.y0-.3||y>s.y1)) return; const ex=s.bx-s.ax, ez=s.bz-s.az, L2=ex*ex+ez*ez||1e-9; let t=((x-s.ax)*ex+(z-s.az)*ez)/L2; t=t<0?0:t>1?1:t; if(Math.hypot(x-s.ax-ex*t,z-s.az-ez*t)<s.r+.25) add('s'+i,{kind:'seg', a:[+s.ax.toFixed(1),+s.az.toFixed(1)], b:[+s.bx.toFixed(1),+s.bz.toFixed(1)], msg:s.msg},x,z); }); }
  const list=Object.values(hit).sort((a,b)=>b.n-a.n); return {points:pts.length, blockers:list.length, list:list.slice(0,60)}; })()
