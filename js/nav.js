// QC World – bản đồ đường đi cho bot: lưới 1m (đất liền + cầu/sàn gỗ, trừ vật cản), A* 8 hướng + làm mượt đường (line-of-sight)
export function makeNav(W, opt={}){
  const {groundH, plats, circles, boxes, inDT} = W;
  const X0=opt.x0??-100, Z0=opt.z0??-118, NX=opt.nx??370, NZ=opt.nz??600, CS=1, INF=opt.inflate??.45;
  const N=NX*NZ, walk=new Uint8Array(N);
  const idx=(i,j)=>j*NX+i, ci=x=>Math.floor((x-X0)/CS), cj=z=>Math.floor((z-Z0)/CS), cx=i=>X0+(i+.5)*CS, cz=j=>Z0+(j+.5)*CS;
  function build(){
    walk.fill(0);
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const x=cx(i), z=cz(j); if(groundH(x,z)>-.22 || inDT(x,z,-.5)) walk[idx(i,j)]=1; }
    const rb=W.roadBlock; if(rb) for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const n=idx(i,j); if(walk[n] && rb(cx(i),cz(j))) walk[n]=0; }   // S9: người đi bộ không đi giữa lòng đường (chỉ qua ở vạch)
    for(const p of plats){ if(p.t==='ring') continue; const r=p.t==='c'?p.r:Math.hypot(p.hw,p.hd); for(let j=Math.max(0,cj(p.z-r));j<=Math.min(NZ-1,cj(p.z+r));j++) for(let i=Math.max(0,ci(p.x-r));i<=Math.min(NX-1,ci(p.x+r));i++){
        const x=cx(i)-p.x, z=cz(j)-p.z; let inside;
        if(p.t==='c') inside=x*x+z*z<p.r*p.r; else { const lx=x*p.c-z*p.s, lz=x*p.s+z*p.c; inside=Math.abs(lx)<p.hw-.3 && Math.abs(lz)<p.hd; }
        if(inside) walk[idx(i,j)]=1; } }
    for(const c of circles){ if(c.owner) continue; stampCircle(c.x,c.z,c.r+INF); }
    for(const sg of (W.SEGS||[])){ if(sg.noNav) continue; const L=Math.hypot(sg.bx-sg.ax,sg.bz-sg.az), n=Math.max(1,Math.ceil(L/.5)); for(let k=0;k<=n;k++) stampCircle(sg.ax+(sg.bx-sg.ax)*k/n, sg.az+(sg.bz-sg.az)*k/n, sg.r+INF); }
    for(const b of boxes){ if(b.x0>1e8) continue; for(let j=Math.max(0,cj(b.z0-INF));j<=Math.min(NZ-1,cj(b.z1+INF));j++) for(let i=Math.max(0,ci(b.x0-INF));i<=Math.min(NX-1,ci(b.x1+INF));i++) walk[idx(i,j)]=0; }
    built=true;
  }
  function stampCircle(x,z,r){ for(let j=Math.max(0,cj(z-r));j<=Math.min(NZ-1,cj(z+r));j++) for(let i=Math.max(0,ci(x-r));i<=Math.min(NX-1,ci(x+r));i++){ const dx=cx(i)-x, dz=cz(j)-z; if(dx*dx+dz*dz<r*r) walk[idx(i,j)]=0; } }
  let built=false;
  const ok=(i,j)=>i>=0&&j>=0&&i<NX&&j<NZ&&walk[idx(i,j)]===1;
  function nearestFree(i,j){ if(ok(i,j)) return [i,j]; for(let r=1;r<8;r++) for(let dj=-r;dj<=r;dj++) for(let di=-r;di<=r;di++){ if(Math.max(Math.abs(di),Math.abs(dj))!==r) continue; if(ok(i+di,j+dj)) return [i+di,j+dj]; } return null; }
  function los(i0,j0,i1,j1){ let di=Math.abs(i1-i0), dj=Math.abs(j1-j0), si=i0<i1?1:-1, sj=j0<j1?1:-1, err=di-dj, i=i0, j=j0;
    while(true){ if(!ok(i,j)) return false; if(i===i1&&j===j1) return true; const e2=2*err; if(e2>-dj){ err-=dj; i+=si; } if(e2<di){ err+=di; j+=sj; } } }
  // A* với heap nhị phân
  const g=new Float32Array(N), from=new Int32Array(N), stamp=new Uint32Array(N), closed=new Uint32Array(N); let gen=1;
  const heap=[], hf=[];
  function push(n,f){ heap.push(n); hf.push(f); let k=heap.length-1; while(k>0){ const p=(k-1)>>1; if(hf[p]<=hf[k]) break; [heap[p],heap[k]]=[heap[k],heap[p]]; [hf[p],hf[k]]=[hf[k],hf[p]]; k=p; } }
  function pop(){ const top=heap[0], last=heap.pop(), lf=hf.pop(); if(heap.length){ heap[0]=last; hf[0]=lf; let k=0; for(;;){ const l=2*k+1, r=l+1; let m=k; if(l<heap.length&&hf[l]<hf[m]) m=l; if(r<heap.length&&hf[r]<hf[m]) m=r; if(m===k) break; [heap[m],heap[k]]=[heap[k],heap[m]]; [hf[m],hf[k]]=[hf[k],hf[m]]; k=m; } } return top; }
  const D=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
  function find(x0,z0,x1,z1, maxExp=60000){
    if(!built) return null;
    const s=nearestFree(ci(x0),cj(z0)), t=nearestFree(ci(x1),cj(z1)); if(!s||!t) return null;
    const fin = ok(ci(x1),cj(z1)) ? [x1,z1] : [cx(t[0]),cz(t[1])];   // đích nằm chỗ không đi được (lòng đường…) → dừng ở ô đi được gần nhất
    if(los(s[0],s[1],t[0],t[1])) return [fin];
    gen++; heap.length=0; hf.length=0; const sn=idx(s[0],s[1]), tn=idx(t[0],t[1]);
    g[sn]=0; stamp[sn]=gen; from[sn]=-1; push(sn, 0); let exp=0, found=false;
    while(heap.length && exp<maxExp){ const n=pop(); if(closed[n]===gen) continue; closed[n]=gen; exp++; if(n===tn){ found=true; break; }
      const i=n%NX, j=(n/NX)|0;
      for(const [di,dj,c] of D){ const ni=i+di, nj=j+dj; if(!ok(ni,nj)) continue; if(di&&dj && (!ok(i+di,j)||!ok(i,j+dj))) continue;
        const nn=idx(ni,nj); if(closed[nn]===gen) continue; const ng=g[n]+c;
        if(stamp[nn]!==gen || ng<g[nn]){ stamp[nn]=gen; g[nn]=ng; from[nn]=n; const hx=Math.abs(ni-t[0]), hz=Math.abs(nj-t[1]); push(nn, ng+(hx+hz)+(1.414-2)*Math.min(hx,hz)); } } }
    if(!found) return null;
    const cells=[]; for(let n=tn; n!==-1; n=from[n]) cells.push([n%NX,(n/NX)|0]); cells.reverse();
    // làm mượt: giữ điểm xa nhất còn nhìn thấy được
    const out=[]; let a=0; while(a<cells.length-1){ let b=cells.length-1; while(b>a+1 && !los(cells[a][0],cells[a][1],cells[b][0],cells[b][1])) b--; out.push([cx(cells[b][0]),cz(cells[b][1])]); a=b; }
    if(out.length) out[out.length-1]=fin; else out.push(fin);
    return out;
  }
  return {build, find, stampCircle, ok:(x,z)=>ok(ci(x),cj(z)), get built(){ return built; }};
}
