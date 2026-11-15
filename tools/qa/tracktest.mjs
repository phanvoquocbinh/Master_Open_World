// node tools/qa/tracktest.mjs [tên] [bước]  – kiểm tra các đường tàu lượn: khép kín, kích thước, ray đè nhau, sát đất, tốc độ, lực G, thời gian 1 vòng,
// đường cụt (tàu chạy lùi) và độ vùi trong núi (MOUNDS). Có tên → in thêm toạ độ dọc đường ray mỗi [bước] mét.
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const src=path.join(path.dirname(fileURLToPath(import.meta.url)),'../../js/coastertrack.js'), tmp=path.join(os.tmpdir(),'qc_coastertrack_'+process.pid+'.mjs');
fs.copyFileSync(src,tmp); const { TRACKS, physStep, mirrorZ, MOUNDS, moundH } = await import(pathToFileURL(tmp).href); fs.unlinkSync(tmp);   /* node coi .js là CommonJS → chép tạm thành .mjs */
const G0=2, TL=13, CFG={dragon:{lift:6}, space:{launchV:37, launchA:15}, eagle:{lift:5.5}, jura:{lift:4.5}, volcano:{lift:5, launchV:24, launchA:22}, atlantis:{lift:5, brakeV:9}};
const only=process.argv[2];
for(const name of Object.keys(TRACKS)){ if(only && only!=='all' && only!==name) continue; const tr=TRACKS[name](G0), N=tr.N, P=tr.P; let bb=[1e9,-1e9,1e9,-1e9,1e9,-1e9];
  for(const p of P){ bb[0]=Math.min(bb[0],p[0]); bb[1]=Math.max(bb[1],p[0]); bb[2]=Math.min(bb[2],p[1]); bb[3]=Math.max(bb[3],p[1]); bb[4]=Math.min(bb[4],p[2]); bb[5]=Math.max(bb[5],p[2]); }
  const gap=Math.hypot(...[0,1,2].map(c=>P[0][c]-P[N-1][c])); let near=[], low=[];
  for(let i=0;i<N;i+=2){ if(tr.Z[i]==='dup') continue; for(let j=i+30;j<N;j+=2){ if(N-j+i<30 || tr.Z[j]==='dup') continue; const d=Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1],P[i][2]-P[j][2]); if(d<4.2) near.push([i,j,+d.toFixed(1)]); } }
  const lim=name==='eagle'?2.9:name==='atlantis'?-.4:name==='volcano'?-1.5:.7; for(let i=0;i<N;i++) if(P[i][1]<G0+lim) low.push(i);
  const grp=a=>{ const o=[]; for(const [i,j,d] of a){ const l=o[o.length-1]; if(l && Math.abs(l.i1-i)<8 && Math.abs(l.j1-j)<12){ l.i1=i; l.j1=j; l.d=Math.min(l.d,d); } else o.push({i0:i,i1:i,j0:j,j1:j,d}); } return o.map(l=>`${l.i0}-${l.i1}×${l.j0}-${l.j1}:${l.d}m @(${P[l.i0].map(v=>v.toFixed(0))})`); };
  const VV=new Float32Array(N), st={s:tr.marks.stop, v:0}; let t=0, vmax=0, vmin=99, gmax=-9, gmin=9, glat=0, where={}, held=false, ci=0; const dt=1/60, cus=(tr.cusps||[]).slice();
  while(t<600){ const s0=st.s; physStep(tr,st,dt,CFG[name]); t+=dt;
    if(ci<cus.length){ const rem=cus[ci]-st.s; if(rem<8){ st.v=Math.min(st.v,Math.max(.4,rem*.7+.3)); st.s=s0+st.v*dt; } if(cus[ci]-st.s<.05){ st.s=cus[ci]+TL; st.v=.3; t+=3; ci++; } }   /* đường cụt: dừng 3 s rồi chạy ngược */
    if(tr.marks.hold && !held && st.s>=tr.marks.hold){ held=true; st.v=2; t+=3.5; }
    const i=Math.floor(((st.s/tr.ds)%N+N)%N), w=k=>((k%N)+N)%N;
    const kv=[0,1,2].map(c=>(tr.T[w(i+1)][c]-tr.T[w(i-1)][c])/(2*tr.ds)), a=[kv[0]*st.v*st.v, kv[1]*st.v*st.v+9.81, kv[2]*st.v*st.v], U=tr.U[i], T=tr.T[i], L=[U[1]*T[2]-U[2]*T[1],U[2]*T[0]-U[0]*T[2],U[0]*T[1]-U[1]*T[0]];
    const gv=(a[0]*U[0]+a[1]*U[1]+a[2]*U[2])/9.81, gl=(a[0]*L[0]+a[1]*L[1]+a[2]*L[2])/9.81, nc=cus.some(c=>Math.abs(c-i*tr.ds)<3 || Math.abs(c+TL-i*tr.ds)<3);
    if(st.zone!=='station' && !nc){ if(gv>gmax){ gmax=gv; where.gmax=i; } if(gv<gmin){ gmin=gv; where.gmin=i; } if(Math.abs(gl)>Math.abs(glat)){ glat=gl; where.glat=i; } vmax=Math.max(vmax,st.v); if(st.zone==='free' && st.s>tr.marks.stop+60 && st.v<vmin){ vmin=st.v; where.vmin=i; } } VV[i]=st.v;
    if(st.s>=tr.marks.stop+tr.L) break; }
  console.log(`\n== ${name}: dài ${tr.L.toFixed(0)} m, N=${N}, hở đầu-cuối ${gap.toFixed(2)} m, cao nhất ${(tr.hmax-G0).toFixed(1)} m`);
  console.log(`   hộp x ${bb[0].toFixed(0)}…${bb[1].toFixed(0)}  z ${bb[4].toFixed(0)}…${bb[5].toFixed(0)}  y ${bb[2].toFixed(1)}…${bb[3].toFixed(1)}`);
  console.log(`   1 vòng ${t.toFixed(0)} s, vmax ${(vmax*3.6).toFixed(0)} km/h, vmin(tự do) ${(vmin*3.6).toFixed(0)} km/h (i=${where.vmin}), G đứng ${gmin.toFixed(1)}…${gmax.toFixed(1)} (i=${where.gmin}/${where.gmax}), G ngang ${glat.toFixed(1)} (i=${where.glat})`);
  console.log(`   mốc: ${Object.entries(tr.marks).map(([k,v])=>k+'='+v.toFixed(0)).join(', ')}${cus.length?'  · đường cụt: '+cus.map(c=>c.toFixed(0)).join(', '):''}`);
  console.log(`   sát nhau (<4,2 m): ${grp(near).join(' | ')||'không'}`); console.log(`   quá thấp: ${low.length?low[0]+'…'+low[low.length-1]+' ('+low.length+')':'không'}`);
  // độ vùi trong núi: d = mặt núi − cao độ ray (dương = nằm trong núi)
  for(const [mn,m] of Object.entries(MOUNDS)){ const runs=[]; let r=null; for(let i=0;i<N;i++){ const h=moundH(m,P[i][0],P[i][2]); if(h>0 && tr.Z[i]!=='dup'){ const d=G0+h-P[i][1]; if(!r){ r={i0:i,i1:i,mn:d,mx:d}; runs.push(r); } r.i1=i; r.mn=Math.min(r.mn,d); r.mx=Math.max(r.mx,d); } else r=null; }
    if(runs.length) console.log(`   trong ${mn}: `+runs.map(r=>`${r.i0}–${r.i1} (vùi ${r.mn.toFixed(0)}…${r.mx.toFixed(0)} m)`).join(' · ')); }
  if(only===name){ for(let i=0;i<N;i+=+process.argv[3]||20) console.log(i, P[i].map(v=>+v.toFixed(1)).join(','), ' u.y', tr.U[i][1].toFixed(2), tr.Z[i], 'v', (VV[i]*3.6).toFixed(0), 'núi', Math.max(...Object.values(MOUNDS).map(m=>moundH(m,P[i][0],P[i][2]))).toFixed(0)); }
  if(name==='eagle'){ const B=mirrorZ(tr,620); let m=1e9; for(let i=0;i<N;i+=2) for(let j=0;j<N;j+=2){ const d=Math.hypot(P[i][0]-B.P[j][0],P[i][1]-B.P[j][1],P[i][2]-B.P[j][2]); if(d<m) m=d; } console.log('   A–B gần nhất', m.toFixed(1),'m; z lớn nhất của A', bb[5].toFixed(1)); } }
