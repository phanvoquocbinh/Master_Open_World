// Rà toàn bộ sàn đứng (plats) trong QC World:
//  A "LỌT DƯỚI": sàn cao hơn mặt dưới 0,7–2,3 m, có lối đi vào từ bên dưới mà không vật cản nào chặn → người chơi đi xuyên qua sàn/cầu/thềm
//  B "KHÔNG LÊN ĐƯỢC": không có điểm nào quanh mép (không bị chặn) cao trong khoảng [h-0,65, h+0,65] → bậc quá cao / thiếu bậc (trừ chỗ đi thang máy)
//  C "LỐI VÀO BỊ CHẶN": có điểm bước lên được nhưng TẤT CẢ đều bị vật cản (box/circle/seg) chiếm
(()=>{ const W=__qc.W, plats=W.plats, boxes=W.boxes, circles=W.circles, SEGS=W.SEGS||[], gH=W.groundH, PR=.35;
  const inP=(p,x,z)=>{ if(p.t==='c') return (x-p.x)**2+(z-p.z)**2<p.r*p.r; if(p.t==='ring'){ const d2=(x-p.x)**2+(z-p.z)**2; return d2>p.r0*p.r0&&d2<p.r1*p.r1; }
    const dx=x-p.x, dz=z-p.z, lx=dx*p.c-dz*p.s, lz=dx*p.s+dz*p.c; return Math.abs(lx)<p.hw&&Math.abs(lz)<p.hd; };
  // mặt đứng cao nhất ≤ lim tại (x,z), bỏ qua sàn self
  const surf=(x,z,lim,self)=>{ let g=gH(x,z); for(const q of plats){ if(q===self||q.h>lim||q.h<=g) continue; if(inP(q,x,z)) g=q.h; } return g; };
  const blocked=(x,z,y)=>{ for(const c of circles){ if(c.y0!==undefined&&(y<c.y0-.3||y>c.y1)) continue; if(Math.hypot(x-c.x,z-c.z)<c.r+PR*.9) return true; }
    for(const b of boxes){ if(b.y0!==undefined&&(y<b.y0-.3||y>b.y1)) continue; if(x>b.x0-PR*.9&&x<b.x1+PR*.9&&z>b.z0-PR*.9&&z<b.z1+PR*.9) return true; }
    for(const s of SEGS){ if(s.y0!==undefined&&(y<s.y0-.3||y>s.y1)) continue; const ex=s.bx-s.ax, ez=s.bz-s.az, L2=ex*ex+ez*ez||1e-9; let t=((x-s.ax)*ex+(z-s.az)*ez)/L2; t=t<0?0:t>1?1:t; if(Math.hypot(x-s.ax-ex*t,z-s.az-ez*t)<s.r+PR*.9) return true; } return false; };
  const ring=(p,off)=>{ const P=[]; if(p.t==='r'){ const W2=p.hw+off, D2=p.hd+off, toW=(lx,lz)=>[p.x+lx*p.c+lz*p.s, p.z-lx*p.s+lz*p.c];
      const nx=Math.max(2,Math.ceil(2*W2/.8)), nz=Math.max(2,Math.ceil(2*D2/.8)); for(let i=0;i<=nx;i++){ const lx=-W2+2*W2*i/nx; P.push(toW(lx,-D2),toW(lx,D2)); } for(let i=1;i<nz;i++){ const lz=-D2+2*D2*i/nz; P.push(toW(-W2,lz),toW(W2,lz)); } }
    else { const r=(p.t==='c'?p.r:p.r1)+off, n=Math.max(8,Math.ceil(2*Math.PI*r/.8)); for(let i=0;i<n;i++){ const a=i/n*2*Math.PI; P.push([p.x+Math.cos(a)*r, p.z+Math.sin(a)*r]); } } return P; };
  const A=[], B=[], C=[]; let n=0;
  for(const p of plats){ if(!(p.h>-50)) continue; n++;
    const below=surf(p.x,p.z,p.h-.05,p), gap=p.h-below, edge=ring(p,.45);
    if(gap>.7 && gap<2.3){ let open=0; for(const [x,z] of edge){ const s=surf(x,z,p.h-.05,p); if(Math.abs(s-below)<.45 && !blocked(x,z,s)) open++; } if(open>0) A.push({x:+p.x.toFixed(1), z:+p.z.toFixed(1), h:+p.h.toFixed(2), gap:+gap.toFixed(2), open, hw:p.hw, hd:p.hd, r:p.r}); }
    let feas=0, free=0; for(const [x,z] of edge){ const s=surf(x,z,p.h+.65,p); if(s>=p.h-.65 && s<=p.h+.65){ feas++; if(!blocked(x,z,s)) free++; } }
    if(feas===0) B.push({x:+p.x.toFixed(1), z:+p.z.toFixed(1), h:+p.h.toFixed(2), gap:+gap.toFixed(2), hw:p.hw, hd:p.hd, r:p.r});
    else if(free===0) C.push({x:+p.x.toFixed(1), z:+p.z.toFixed(1), h:+p.h.toFixed(2), feas, hw:p.hw, hd:p.hd, r:p.r}); }
  return {plats:n, boxes:boxes.length, circles:circles.length, segs:SEGS.length, A, B, C}; })()
