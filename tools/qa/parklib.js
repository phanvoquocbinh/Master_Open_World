// thư viện thử công viên: window.__pt
(()=>{ const q=__qc, W=q.W, P=q.P, K=q.K;
  const unblock=()=>{ W.HOOK.blockInput=false; for(const id of ['panelWrap','helpWrap']){ const e=document.getElementById(id); if(e) e.hidden=true; } };
  const fr=(n,dt=1/30)=>{ for(let i=0;i<n;i++) q.frame(dt); };
  // đi bộ thật (phím W) tới (x,z); trả {ok, at}
  const go=(x,z,o={})=>{ unblock(); let n=0, stuck=0, lx=P.x, lz=P.z; K.KeyW=true; if(o.run!==false) K.ShiftLeft=true;
    while(n++<(o.max||900)){ const dx=x-P.x, dz=z-P.z, d=Math.hypot(dx,dz); if(d<(o.tol||.45)) break; q.cam.yaw=Math.atan2(-dx,-dz); q.frame(1/30);
      if(n%20===0){ if(Math.hypot(P.x-lx,P.z-lz)<.15){ if(++stuck>=2) break; } else stuck=0; lx=P.x; lz=P.z; } }
    K.KeyW=false; K.ShiftLeft=false; q.frame(1/30); return {ok:Math.hypot(x-P.x,z-P.z)<(o.tol||.45)+.2, at:[+P.x.toFixed(2),+P.z.toFixed(2),+P.y.toFixed(2)], n}; };
  const path=(pts,o)=>{ const out=[]; for(const [x,z] of pts){ const r=go(x,z,o); out.push(r.ok?'ok':'KẸT@'+r.at.join('/')); if(!r.ok) break; } return out; };
  const inter=(re)=>W.INTER.filter(it=>re.test(it.label||'') && Math.hypot(P.x-it.x,P.z-it.z)<it.r && (!it.when||it.when()));
  const act=(re)=>{ const l=inter(re); if(!l.length) return 'KHÔNG THẤY '+re; l[0].action(); return l[0].label; };
  const payOk=()=>{ const b=[...document.querySelectorAll('button')].find(b=>/^Trả /.test(b.textContent.trim()) && b.offsetParent!==null); if(b){ b.click(); return true; } return false; };
  const toastTxt=()=>{ const t=document.getElementById('toast'); return t && !t.hidden ? t.textContent.slice(0,90) : ''; };
  const st=()=>({p:[+P.x.toFixed(1),+P.y.toFixed(1),+P.z.toFixed(1)], ride:W.themePark.rides.ride.kind, veh:!!W.HOOK.vehicle, fpv:!!q.cam.fpv, vis:W.me.root.visible, coins:W.life&&W.life.S?W.life.S.coins:undefined});
  window.__pt={fr, go, path, inter, act, payOk, toastTxt, st, unblock, R:W.themePark.rides}; return 'lib ok'; })()
