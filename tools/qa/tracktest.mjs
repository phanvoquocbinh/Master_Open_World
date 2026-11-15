// node tools/qa/tracktest.mjs [tên] [bước]  – kiểm tra 3 đường tàu lượn: khép kín, kích thước, ray đè nhau, sát đất, tốc độ, lực G, thời gian 1 vòng
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const src=path.join(path.dirname(fileURLToPath(import.meta.url)),'../../js/coastertrack.js'), tmp=path.join(os.tmpdir(),'qc_coastertrack_'+process.pid+'.mjs');
fs.copyFileSync(src,tmp); const { TRACKS, physStep, mirrorZ } = await import(pathToFileURL(tmp).href); fs.unlinkSync(tmp);   // node coi .js là CommonJS → chép tạm thành .mjs
const G0=2, CFG={dragon:{lift:6}, space:{launchV:37, launchA:15}, eagle:{lift:5.5}};
for(const name of Object.keys(TRACKS)){ const tr=TRACKS[name](G0), N=tr.N, P=tr.P; let bb=[1e9,-1e9,1e9,-1e9,1e9,-1e9];
  for(const p of P){ bb[0]=Math.min(bb[0],p[0]); bb[1]=Math.max(bb[1],p[0]); bb[2]=Math.min(bb[2],p[1]); bb[3]=Math.max(bb[3],p[1]); bb[4]=Math.min(bb[4],p[2]); bb[5]=Math.max(bb[5],p[2]); }
  const gap=Math.hypot(...[0,1,2].map(c=>P[0][c]-P[N-1][c])); let near=[], low=[];
  for(let i=0;i<N;i+=2) for(let j=i+30;j<N;j+=2){ if(N-j+i<30) continue; const d=Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1],P[i][2]-P[j][2]); if(d<4.2) near.push([i,j,+d.toFixed(1)]); }
  const lim=name==='eagle'?2.9:.7; for(let i=0;i<N;i++) if(P[i][1]<G0+lim) low.push(i);
  const grp=a=>{ const o=[]; for(const [i,j,d] of a){ const l=o[o.length-1]; if(l && Math.abs(l.i1-i)<8 && Math.abs(l.j1-j)<12){ l.i1=i; l.j1=j; l.d=Math.min(l.d,d); } else o.push({i0:i,i1:i,j0:j,j1:j,d}); } return o.map(l=>`${l.i0}-${l.i1}×${l.j0}-${l.j1}:${l.d}m @(${P[l.i0].map(v=>v.toFixed(0))})`); };
  const VV=new Float32Array(N); const st={s:tr.marks.stop, v:0}; let t=0, vmax=0, vmin=99, gmax=-9, gmin=9, glat=0, where={}; const dt=1/60;
  let held=false; while(t<400){ physStep(tr,st,dt,CFG[name]); t+=dt; if(tr.marks.hold && !held && st.s>=tr.marks.hold){ held=true; st.v=2; t+=3.5; } /* treo 3,5 giây trên đỉnh như trong game */ const i=Math.floor(((st.s/tr.ds)%N+N)%N), w=k=>((k%N)+N)%N;
    const kv=[0,1,2].map(c=>(tr.T[w(i+1)][c]-tr.T[w(i-1)][c])/(2*tr.ds)), a=[kv[0]*st.v*st.v, kv[1]*st.v*st.v+9.81, kv[2]*st.v*st.v], U=tr.U[i], T=tr.T[i], L=[U[1]*T[2]-U[2]*T[1],U[2]*T[0]-U[0]*T[2],U[0]*T[1]-U[1]*T[0]];
    const gv=(a[0]*U[0]+a[1]*U[1]+a[2]*U[2])/9.81, gl=(a[0]*L[0]+a[1]*L[1]+a[2]*L[2])/9.81;
    if(st.zone!=='station'){ if(gv>gmax){ gmax=gv; where.gmax=i; } if(gv<gmin){ gmin=gv; where.gmin=i; } if(Math.abs(gl)>Math.abs(glat)){ glat=gl; where.glat=i; } vmax=Math.max(vmax,st.v); if(st.zone==='free' && st.s>tr.marks.stop+60 && st.v<vmin){ vmin=st.v; where.vmin=i; } } VV[i]=st.v;
    if(st.s>=tr.marks.stop+tr.L) break; }
  console.log(`\n== ${name}: dài ${tr.L.toFixed(0)} m, N=${N}, hở đầu-cuối ${gap.toFixed(2)} m, cao nhất ${(tr.hmax-G0).toFixed(1)} m`);
  console.log(`   hộp x ${bb[0].toFixed(0)}…${bb[1].toFixed(0)}  z ${bb[4].toFixed(0)}…${bb[5].toFixed(0)}  y ${bb[2].toFixed(1)}…${bb[3].toFixed(1)}`);
  console.log(`   1 vòng ${t.toFixed(0)} s, vmax ${(vmax*3.6).toFixed(0)} km/h, vmin(tự do) ${(vmin*3.6).toFixed(0)} km/h (i=${where.vmin}), G đứng ${gmin.toFixed(1)}…${gmax.toFixed(1)} (i=${where.gmin}/${where.gmax}), G ngang ${glat.toFixed(1)} (i=${where.glat})`);
  console.log(`   mốc: ${Object.entries(tr.marks).map(([k,v])=>k+'='+v.toFixed(0)).join(', ')}`);
  console.log(`   sát nhau (<4,2 m): ${grp(near).join(' | ')||'không'}`); console.log(`   quá thấp: ${low.length?low[0]+'…'+low[low.length-1]+' ('+low.length+')':'không'}`);
  if(process.argv[2]===name){ for(let i=0;i<N;i+=+process.argv[3]||20) console.log(i, P[i].map(v=>+v.toFixed(1)).join(','), ' u.y', tr.U[i][1].toFixed(2), tr.Z[i], 'v', (VV[i]*3.6).toFixed(0)); }
  if(name==='eagle'){ const B=mirrorZ(tr,620); let m=1e9; for(let i=0;i<N;i+=2) for(let j=0;j<N;j+=2){ const d=Math.hypot(P[i][0]-B.P[j][0],P[i][1]-B.P[j][1],P[i][2]-B.P[j][2]); if(d<m) m=d; } console.log('   A–B gần nhất', m.toFixed(1),'m; z lớn nhất của A', bb[5].toFixed(1)); } }
