// Kiểm tra bố cục nhà ma / lâu đài (đợt 2B): node tools/qa/darktest.mjs
//  - đường khép kín · không phòng nào chồng nhau / lòi khỏi vỏ nhà · xe đi qua các phòng đúng thứ tự · xe cách vách bên ≥ 1,7 m · các nhà không chồng nhau · thời lượng 1 lượt
import fs from 'fs'; import os from 'os'; import path from 'path'; import { pathToFileURL, fileURLToPath } from 'url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'), tmp=path.join(os.tmpdir(),'ct_dark_'+Date.now()+'.mjs'); fs.copyFileSync(path.join(root,'js/coastertrack.js'),tmp);
const m=await import(pathToFileURL(tmp).href); fs.unlinkSync(tmp);
const STOPS={mansion:[['s1',5.5],['s2',4],['s3',4.5]], asylum:[['s1',4],['s2',6],['s3',8]], tomb:[['s1',5],['s2',4],['s3',5]], castle:[]}, CFG={lift:2.6, launchV:6.5, launchA:8, brakeV:2.5, brakeA:9, stV:2.6, vmin:3};
let bad=0; const all=[];
for(const [name,fn] of Object.entries(m.DARK)){ const lay=fn(2.0), tr=lay.tr, R=lay.rooms, mk=tr.marks, S=lay.shell; all.push({name,S});
  console.log(`== ${name}: dài ${tr.L.toFixed(0)} m, hở đầu-cuối ${tr.gap.toFixed(3)} m, cao nhất ${(tr.hmax-2).toFixed(1)} m, vỏ nhà x ${S.x0.toFixed(0)}…${S.x1.toFixed(0)} · z ${S.z0.toFixed(0)}…${S.z1.toFixed(0)}`);
  if(tr.gap>.05){ console.log('  LỖI: đường không khép kín'); bad++; }
  for(let a=0;a<R.length;a++) for(let b=a+1;b<R.length;b++){ const ox=Math.min(R[a].x1,R[b].x1)-Math.max(R[a].x0,R[b].x0), oz=Math.min(R[a].z1,R[b].z1)-Math.max(R[a].z0,R[b].z0); if(ox>.01 && oz>.01){ console.log(`  LỖI: phòng ${a+1} chồng phòng ${b+1}`); bad++; } }
  for(const r of R) if(r.x0<S.x0+.5 || r.x1>S.x1-.5 || r.z0<S.z0-.01 || r.z1>S.z1+.01){ console.log(`  LỖI: phòng ${r.i} lòi ra ngoài vỏ nhà`); bad++; }
  const seq=[]; let minW=9; const i0=Math.ceil(mk.in/tr.ds), i1=Math.floor(mk.out/tr.ds);
  for(let i=i0;i<=i1;i++){ const p=tr.P[i], t=tr.T[i], ins=R.filter(r=>p[0]>r.x0 && p[0]<r.x1 && p[2]>r.z0 && p[2]<r.z1); if(ins.length>1){ console.log('  LỖI: mẫu nằm trong 2 phòng',i); bad++; }
    const k=ins.length?ins[0].i:0; if(seq[seq.length-1]!==k) seq.push(k); const alongX=Math.abs(t[0])>.98, alongZ=Math.abs(t[2])>.98;
    if(k){ const r=ins[0]; if(alongX) minW=Math.min(minW,p[2]-r.z0,r.z1-p[2]); else if(alongZ) minW=Math.min(minW,p[0]-r.x0,r.x1-p[0]); }
    else for(const r of R){ const dx=Math.max(r.x0-p[0],0,p[0]-r.x1), dz=Math.max(r.z0-p[2],0,p[2]-r.z1), side=alongX?dz:alongZ?dx:Math.hypot(dx,dz), ahead=alongX?dx:alongZ?dz:0; if(side>.01 && side<1.7 && ahead<.01){ console.log(`  LỖI: hành lang sát vách phòng ${r.i} tại mẫu ${i} (${side.toFixed(2)} m)`); bad++; break; } } }
  console.log('  thứ tự phòng:',seq.join(' → '),'| cách vách bên nhỏ nhất',minW.toFixed(1),'m'); if(minW<1.7){ console.log('  LỖI: xe sát vách'); bad++; }
  if(seq.filter(v=>v).join()!==R.map(r=>r.i).join()){ console.log('  LỖI: thứ tự phòng sai'); bad++; }
  const st={s:mk.stop, v:.6}; let t=0, lap=0, si=0, vmax=0; const stops=(STOPS[name]||[]).map(([k,d])=>[mk[k],d]);
  while(lap<tr.L-.05 && t<900){ const dt=1/30, s0=st.s, rem=tr.L-lap; if(rem<16){ st.v=Math.max(.45,Math.min(st.v,rem*.6+.25)); st.s+=Math.min(rem,st.v*dt); } else m.physStep(tr,st,dt,CFG); lap+=st.s-s0; t+=dt; vmax=Math.max(vmax,st.v);
    if(si<stops.length && st.s>=stops[si][0]){ t+=stops[si][1]; st.v=1; si++; } }
  console.log(`  1 lượt: ${Math.floor(t/60)} phút ${Math.round(t%60)} giây · nhanh nhất ${(vmax*3.6).toFixed(0)} km/h · mốc:`,Object.entries(mk).map(([k,v])=>k+'='+v.toFixed(0)).join(' ')); }
for(let a=0;a<all.length;a++) for(let b=a+1;b<all.length;b++){ const A=all[a].S, B=all[b].S; if(Math.min(A.x1,B.x1)-Math.max(A.x0,B.x0)>0 && Math.min(A.z1,B.z1)-Math.max(A.z0,B.z0)>0){ console.log(`LỖI: nhà ${all[a].name} chồng nhà ${all[b].name}`); bad++; } }
console.log(bad?`CÓ ${bad} LỖI`:'TẤT CẢ ĐẠT');
