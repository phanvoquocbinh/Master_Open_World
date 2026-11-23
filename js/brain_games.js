// QC World V2 – TẦNG GIẢI TRÍ & BIDA · THÁP QA/QC BRAIN (phiên B · abyss-sea · 21–23/11/2026 – yêu cầu Bình qua phiên chính)
// TẦNG 5 (y 142) chỉ là khu trò chơi. Đọc W.brainV2.gameFloor lúc chạy, TỰ XẾP từng bàn vào chỗ trống (né keepOut, vật cản, chừa lối đi).
// 8 trò, trò nào cũng CHƠI ĐƯỢC THẬT · mỗi trò 2 bàn (bida dùng 2 bàn có sẵn của tầng):
//  ⚽ Bi lắc (2–4 người: mỗi người 2 thanh, góc nhìn thứ nhất sau tay cầm) · ⛳ Golf mini 3 lỗ (1–4 lần lượt) · 🏒 Khúc côn cầu (2) · 🏓 Bóng bàn (2)
//  🎯 Phi tiêu (1–4 lần lượt) · 🏀 Ném bóng rổ arcade (1–4 lần lượt) · 🎳 Bowling mini (1–4 lần lượt) · 🎱 Bida 3 bi carom (2).
// Bấm E ở bàn → chọn "🤖 Chơi với máy" hoặc "👥 Chơi cùng bạn" (chế độ nhiều người 👥 Online): bàn mở chỗ, người chơi khác tới bấm E là vào;
//   20 giây không ai vào / bạn bè thoát hết → quay về chơi với máy. Thoát: E hoặc Esc → nhân vật đứng lại cạnh bàn (không kẹt trong bàn).
// 9 BOT ĐANG CHƠI THẬT (bàn đầu của mỗi trò; bóng bàn 2 bot): cầm cơ đánh bida, ném phi tiêu, đánh bóng bàn, xoay thanh bi lắc, lăn bowling,
//   ném rổ, gạt đĩa khúc côn cầu, đánh golf – tay chân bám đúng dụng cụ (IK 2 khớp). Bạn chọn "chơi cùng bạn" → bot nhường bàn; "chơi với máy" → bot làm đối thủ.
// Mạng: chủ bàn mô phỏng vật lý + gửi trạng thái 15 lần/giây; khách gửi thao tác (tin t:'game', g:'bg' qua W.multi).
//   multiplayer_server.py cần chuyển tiếp tin 'game' – xem cuối file. Chưa có thì mọi trò vẫn chơi với máy bình thường.
// API: export make(W, ctx, floor) – floor = W.brainV2.gameFloor. W.brainGames {tables, enter(kind,i,mode), exit(), state(), log, net}
import { roundedBox, makeWoodMaterial } from './archKit.js';

export async function make(W, ctx={}, floor={}){
  if(W.brainGames) return W.brainGames;
  const {THREE, scene, P, me, HOOK, INTER, toast, makeLabel} = W;
  const TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, V3=THREE.Vector3, LOW=W.QUAL==='low';
  const lerpA=W.lerpAngle || ((a,b,t)=>{ const d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI; return a+d*t; });
  let seed=20261123; const rnd=()=>{ seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }, rr=(a,b)=>a+rnd()*(b-a);
  const S=(W.life && W.life.S) || {}, save=()=>{ try{ W.life && W.life.save && W.life.save(); }catch(e){} }; S.brainGames=S.brainGames||{};
  const reward=(n,msg)=>{ try{ if(W.life && W.life.addCoins) W.life.addCoins(n,msg); else toast(msg,3000); }catch(e){} };
  const MYNAME=(W.PROFILE && W.PROFILE.name) || 'Bạn';

  /* ============================== TẦNG & XẾP CHỖ ============================== */
  const GF=(floor && floor.y!=null) ? floor : ((W.brainV2 && W.brainV2.gameFloor) || {}); const F={cx:880, cz:180, y:142, ...GF};
  if(F.A0==null) F.A0=0;
  const dAng=(a,b)=>{ let d=(a-b)%TAU; if(d>Math.PI) d-=TAU; if(d<-Math.PI) d+=TAU; return Math.abs(d); };
  const RIN=F.rIn ?? 11.5, ROUT=F.rOut ?? 21, KO=F.keepOut ? [...F.keepOut] : [{a:F.A0,da:.45},{a:F.A0+Math.PI,da:.45}];
  const BILL=((F.existing||{}).billiards||[]).filter(t=>typeof t.x==='number');
  for(const t of BILL) KO.push({ox:t.x, oz:t.z, yaw:t.yaw||0, hl:(t.len||2.84)/2+1.2, hw:(t.wid||1.42)/2+1.2, what:'bàn bida'});
  const CELL=2, GRID=new Map(), yT=F.y+.5, MG=.7;
  const addOb=(o,x0,x1,z0,z1)=>{ for(let i=Math.floor((x0-MG)/CELL);i<=Math.floor((x1+MG)/CELL);i++) for(let j=Math.floor((z0-MG)/CELL);j<=Math.floor((z1+MG)/CELL);j++){ const k=i+','+j; let l=GRID.get(k); if(!l) GRID.set(k,l=[]); l.push(o); } };
  const nearT=(x,z,ext)=>Math.hypot(x-F.cx,z-F.cz)<ROUT+ext+4 && Math.hypot(x-F.cx,z-F.cz)>RIN-ext-2;
  for(const c of (W.circles||[])){ if(!c || c.owner || !(Math.abs(c.x)<1e8)) continue; if(c.y0!==undefined && (yT<c.y0-.3 || yT>c.y1)) continue; if(!nearT(c.x,c.z,c.r)) continue; addOb({t:'c',x:c.x,z:c.z,r:c.r},c.x-c.r,c.x+c.r,c.z-c.r,c.z+c.r); }
  for(const q of (W.SEGS||[])){ if(!q) continue; if(q.y0!==undefined && (yT<q.y0-.3 || yT>q.y1)) continue; const mx=(q.ax+q.bx)/2, mz=(q.az+q.bz)/2, hl=Math.hypot(q.bx-q.ax,q.bz-q.az)/2; if(!nearT(mx,mz,hl)) continue; const o={t:'s',ax:q.ax,az:q.az,bx:q.bx,bz:q.bz,r:q.r||.1}; addOb(o,Math.min(q.ax,q.bx)-o.r,Math.max(q.ax,q.bx)+o.r,Math.min(q.az,q.bz)-o.r,Math.max(q.az,q.bz)+o.r); }
  for(const b of (W.boxes||[])){ if(!b) continue; if(b.y0!==undefined && (yT<b.y0-.3 || yT>b.y1)) continue; if(!nearT((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.hypot(b.x1-b.x0,b.z1-b.z0)/2)) continue; addOb({t:'b',x0:b.x0,x1:b.x1,z0:b.z0,z1:b.z1},b.x0,b.x1,b.z0,b.z1); }
  const segD=(px,pz,o)=>{ const ex=o.bx-o.ax, ez=o.bz-o.az, L2=ex*ex+ez*ez||1e-9; let t=((px-o.ax)*ex+(pz-o.az)*ez)/L2; t=t<0?0:t>1?1:t; return Math.hypot(px-o.ax-ex*t, pz-o.az-ez*t); };
  function pointFree(x,z,m){ const r=Math.hypot(x-F.cx,z-F.cz); if(r<RIN+1.3 || r>ROUT-.2) return false; const a=Math.atan2(z-F.cz,x-F.cx);
    for(const k of KO){ if(k.ox!=null){ const dx=x-k.ox, dz=z-k.oz, c=Math.cos(k.yaw), sn=Math.sin(k.yaw), u=dx*c-dz*sn, v=dx*sn+dz*c; if(Math.abs(u)<k.hl+m && Math.abs(v)<k.hw+m) return false; continue; } if(k.x0!=null){ if(x>k.x0-m && x<k.x1+m && z>k.z0-m && z<k.z1+m) return false; continue; } if(k.x!=null){ if(Math.hypot(x-k.x,z-k.z)<(k.r||1)+m) return false; continue; }
      if(dAng(a,k.a)<(k.da??.3)+m/Math.max(r,1) && (!k.r || (r>k.r[0]-m && r<k.r[1]+m))) return false; }
    const l=GRID.get(Math.floor(x/CELL)+','+Math.floor(z/CELL)); if(l) for(const o of l){ if(o.t==='c'){ if(Math.hypot(x-o.x,z-o.z)<o.r+m) return false; } else if(o.t==='s'){ if(segD(x,z,o)<o.r+m) return false; } else if(x>o.x0-m && x<o.x1+m && z>o.z0-m && z<o.z1+m) return false; }
    return true; }
  const PLACED=[]; const toL=(pl,x,z)=>{ const dx=x-pl.px, dz=z-pl.pz, c=Math.cos(pl.th), sn=Math.sin(pl.th); return [dx*c-dz*sn, dx*sn+dz*c]; };
  const inPlaced=(x,z,m)=>PLACED.some(pl=>{ const [u,v]=toL(pl,x,z), f=pl.fp; return u>f[0]-m && u<f[1]+m && v>f[2]-m && v<f[3]+m; });
  function fits(fp,px,pz,th){ const c=Math.cos(th), sn=Math.sin(th), W2=(u,v)=>[px+u*c+v*sn, pz-u*sn+v*c], A=.3, x0=fp[0]-A, x1=fp[1]+A, z0=fp[2]-A, z1=fp[3]+A;
      const quick=[[x0,z0],[x1,z0],[x0,z1],[x1,z1],[(x0+x1)/2,(z0+z1)/2]]; for(const [u,v] of quick){ const [x,z]=W2(u,v); if(!pointFree(x,z,.25) || inPlaced(x,z,.55)) return false; }
      const nu=Math.max(2,Math.ceil((x1-x0)/.45)), nv=Math.max(2,Math.ceil((z1-z0)/.45)); for(let i=0;i<=nu;i++) for(let j=0;j<=nv;j++){ const [x,z]=W2(x0+(x1-x0)*i/nu, z0+(z1-z0)*j/nv); if(!pointFree(x,z,.25) || inPlaced(x,z,.55)) return false; }
      return true; }
  function place(fp){ let best=null; const rMid=(RIN+1.3+ROUT)/2;
    for(let ai=0;ai<240;ai++){ const a=F.A0+ai/240*TAU; for(let r=RIN+1.6; r<=ROUT-.5; r+=.45){ const px=F.cx+Math.cos(a)*r, pz=F.cz+Math.sin(a)*r, th0=Math.atan2(Math.cos(a),Math.sin(a));
        for(const dth of [0,Math.PI,Math.PI/2,-Math.PI/2]){ if(!fits(fp,px,pz,th0+dth)) continue; let dmin=9; for(const pl of PLACED) dmin=Math.min(dmin,Math.hypot(pl.px-px,pl.pz-pz)); const sc=dmin-Math.abs(r-rMid)*.12; if(!best || sc>best.sc) best={px,pz,th:th0+dth,sc,a,r}; } } }
    if(!best) return null; const g=new THREE.Group(); g.position.set(best.px,F.y,best.pz); g.rotation.y=best.th; g.userData.dynamic=true; scene.add(g); g.updateMatrixWorld(true); PLACED.push({...best, fp}); return {g, ...best}; }

  /* ============================== VẬT LIỆU & TIỆN ÍCH ============================== */
  const std=(c,r=.5,m=0,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:r, metalness:m}, o));
  const M={ wood:makeWoodMaterial({col:'#6a4126', plank:30, rough:.42, seed:21}), woodL:makeWoodMaterial({col:'#c99c66', plank:22, rough:.36, seed:22}), black:std(0x1b1d22,.45,.25), steel:std(0xc9ced4,.25,1), chrome:std(0xf0f3f6,.07,1),
    red:std(0xc8231c,.4), blue:std(0x1f5fbf,.4), white:std(0xf3f1ea,.35), rubber:std(0x121212,.9), dark:std(0x0c0f14,.8), net:std(0xf4f4f4,.8,0,{transparent:true, opacity:.55, side:THREE.DoubleSide}) };
  const add=(p,geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0,cast=true)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow=cast && !LOW; m.receiveShadow=true; p.add(m); return m; };
  const rb=(w,h,d,r=.02,s=2)=>roundedBox(w,h,d,r,s);
  const canvasTex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
  const C=new THREE.Color(); function vcol(parts){ const list=[]; for(const [g0,col,x=0,y=0,z=0,rx=0,ry=0,rz=0] of parts){ let g=g0.index?g0.toNonIndexed():g0.clone(); if(rx||ry||rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx,ry,rz))); g.translate(x,y,z);
      for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal') g.deleteAttribute(k); const n=g.attributes.position.count, a=new Float32Array(n*3); C.set(col); for(let i=0;i<n;i++){ a[i*3]=C.r; a[i*3+1]=C.g; a[i*3+2]=C.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); list.push(g); }
    const g=W.mergeGeometries(list,false); g.computeVertexNormals(); return g; }
  function colRect(g, cx, cz, hw, hd, y0=-.4, y1=1.6, msg='🎮 Bàn trò chơi'){ g.updateMatrixWorld(true); const pts=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([a,b])=>new V3(cx+a,0,cz+b).applyMatrix4(g.matrixWorld)); for(let i=0;i<4;i++){ const p=pts[i], q=pts[(i+1)%4]; W.addSeg && W.addSeg(p.x,p.z,q.x,q.z,.05,F.y+y0,F.y+y1,msg); } }
  const wp=(g,x,y,z)=>{ g.updateMatrixWorld(true); return new V3(x,y,z).applyMatrix4(g.matrixWorld); };
  const wyaw=(g,ly=0)=>{ const q=new THREE.Quaternion(); g.getWorldQuaternion(q); return new THREE.Euler().setFromQuaternion(q,'YXZ').y+ly; };
  const st=(g,x,z,ly)=>{ const p=wp(g,x,0,z); return {x:p.x, z:p.z, yaw:wyaw(g,ly)}; };
  /* xương + IK 2 khớp (tay bot bám đúng dụng cụ) */
  const bonesOf=root=>{ const b={}; if(root) root.traverse(x=>{ if(x.isBone){ const k=x.name.replace(/^mixamorig[:_]?/,''); if(!b[k]) b[k]=x; } }); return b; };
  const _a=new V3(), _b=new V3(), _d=new V3(), _q=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _S=new V3(), _E=new V3(), _H=new V3(), _D=new V3(), _N=new V3(), _Mv=new V3();
  function aimB(B,n,c,dir){ const b=B[n], cc=B[c]; if(!b||!cc) return; b.getWorldPosition(_a); cc.getWorldPosition(_b); _b.sub(_a); if(_b.lengthSq()<1e-9) return; _b.normalize(); _d.copy(dir).normalize(); _q.setFromUnitVectors(_b,_d); b.getWorldQuaternion(_wq); b.parent.getWorldQuaternion(_pq); _wq.premultiply(_q); b.quaternion.copy(_pq.invert().multiply(_wq)); b.updateMatrixWorld(true); }
  function ik(B,s,T,hint){ const A=B[s+'Arm'], Fm=B[s+'ForeArm'], Hh=B[s+'Hand']; if(!A||!Fm||!Hh||!T) return; A.getWorldPosition(_S); Fm.getWorldPosition(_E); Hh.getWorldPosition(_H); const a=_S.distanceTo(_E), b=_E.distanceTo(_H); if(a<1e-4||b<1e-4) return;
    _D.copy(T).sub(_S); const d=clamp(_D.length(),Math.abs(a-b)+.02,a+b-.004); _D.normalize(); const ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1), sa=Math.sqrt(1-ca*ca); _N.copy(hint).addScaledVector(_D,-hint.dot(_D)); if(_N.lengthSq()<1e-6) _N.set(0,-1,0); _N.normalize();
    _Mv.copy(_D).multiplyScalar(a*ca).addScaledVector(_N,a*sa); aimB(B,s+'Arm',s+'ForeArm',_Mv); Fm.getWorldPosition(_E); _Mv.copy(T).sub(_E); aimB(B,s+'ForeArm',s+'Hand',_Mv); }
  const bodyFR=bot=>{ const f=new V3(Math.sin(bot.yaw),0,Math.cos(bot.yaw)), r=new V3(-f.z,0,f.x); return [f,r]; };
  const hintOut=(bot,k)=>{ const [f,r]=bodyFR(bot); return new V3(0,-1,0).addScaledVector(r,k*.6).addScaledVector(f,-.2); };
  const lean=(bot,fw)=>{ const [f]=bodyFR(bot); aimB(bot.B,'Spine','Neck',new V3(0,1,0).addScaledVector(f,fw)); };

  /* ---------- âm thanh (WebAudio tổng hợp – rất nhỏ) ---------- */
  let AC=null; const snd=(f=440,d=.08,type='sine',v=.1,f2)=>{ try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); const t=AC.currentTime, o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+d); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+d+.02); }catch(e){} };
  let sndK=1; const tick=(k=1)=>snd(820+rnd()*380,.03,'triangle',.05*sndK*clamp(k,.2,1.5)), thud=(k=1)=>snd(120+rnd()*50,.1,'sine',.16*sndK*clamp(k,.2,1.2)), clack=(k=1)=>snd(1500+rnd()*500,.025,'square',.035*sndK*clamp(k,.2,1.3));
  const cheer=()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>snd(f,.2,'triangle',.11),i*85)), boo=()=>snd(220,.4,'sawtooth',.06,110);

  /* ---------- HUD ---------- */
  let hud=null; const hq=k=>hud.querySelector(`[data-${k}]`);
  function hudSet(title, score, help, bar){ if(!hud){ hud=document.createElement('div'); hud.id='bg-hud';
      hud.style.cssText='position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:42;min-width:340px;max-width:92vw;padding:10px 18px;border-radius:14px;background:rgba(12,16,24,.86);border:1px solid rgba(255,215,120,.45);color:#f4f1ea;font:600 14px Segoe UI,system-ui,sans-serif;text-align:center;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,.35)';
      hud.innerHTML='<div data-t style="font:800 15px Segoe UI,system-ui;color:#ffd77a"></div><div data-s style="font:800 22px Segoe UI,system-ui;margin:2px 0"></div><div data-b style="height:9px;border-radius:5px;background:rgba(255,255,255,.12);overflow:hidden;margin:5px auto;max-width:300px"><div style="height:100%;width:0;background:linear-gradient(90deg,#46d39a,#ffd23f,#ff5a3c)"></div></div><div data-h style="opacity:.82;font-size:12.5px;line-height:1.45"></div>';
      document.body.appendChild(hud); }
    hud.hidden=false; if(hq('t').textContent!==title) hq('t').textContent=title; if(hq('s').textContent!==score) hq('s').textContent=score; if(hq('h').textContent!==help) hq('h').textContent=help;
    const b=hq('b'); b.style.display=bar==null?'none':'block'; if(bar!=null) b.firstChild.style.width=`${clamp(bar,0,1)*100}%`; }
  const hudPunch=()=>{ try{ hq('s').animate([{transform:'scale(1.25)', color:'#ffd23f'},{transform:'scale(1)', color:'#f4f1ea'}],{duration:380, easing:'ease-out'}); }catch(e){} };

  /* ============================== NHẬP LIỆU (người chơi tại máy) ============================== */
  const LI={ix:0,iz:0,mx:0,my:0,boost:false,ev:[]}; let G=null, LOCALSEAT=0, shake=0, savedVis=true, exitCool=0;
  const KEYDOWN={};
  addEventListener('keydown',e=>{ if(!G) return; if(e.code==='Escape' || (e.code==='KeyE' && !e.repeat && !document.querySelector('.modalWrap:not([hidden])'))){ e.preventDefault(); e.stopPropagation(); exitGame(); return; } if(e.repeat || KEYDOWN[e.code]) return; KEYDOWN[e.code]=true;
    if(e.code==='Space') LI.ev.push('d'); else if(e.code==='KeyA'||e.code==='ArrowLeft') LI.ev.push('L'); else if(e.code==='KeyD'||e.code==='ArrowRight') LI.ev.push('R'); else if(e.code==='KeyR') LI.ev.push('S');
    if(['Space','ShiftLeft','ShiftRight','KeyR','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); }, true);
  addEventListener('keyup',e=>{ KEYDOWN[e.code]=false; if(!G) return; if(e.code==='Space') LI.ev.push('u'); }, true);
  addEventListener('mousemove',e=>{ if(!G) return; LI.mx+=e.movementX||0; LI.my+=e.movementY||0; });
  addEventListener('mousedown',e=>{ if(!G || e.button!==0 || (e.target && e.target.closest && e.target.closest('button,.modalWrap,input,#bg-hud'))) return; LI.ev.push('d'); });
  addEventListener('mouseup',e=>{ if(!G || e.button!==0) return; LI.ev.push('u'); });
  const IN0=()=>({ix:0,iz:0,mx:0,my:0,boost:false,ev:[]});
  /* ghế: {k:'me'|'bot'|'net'|'open'|'idle', name, gid} – 'open' = chỗ trống đang chờ bạn bè (chơi tạm như máy) */
  function seatIn(T,i){ const s=T.sess && T.sess.seats[i]; if(!s) return null; if(s.k==='me') return T===G && LOCALSEAT===i ? LI : null; if(s.k==='net') return T.RI[i]||(T.RI[i]=IN0()); return null; }
  const isAI=(T,i)=>{ const s=T.sess && T.sess.seats[i]; return !!s && (s.k==='bot' || s.k==='open'); };
  const humanSeats=T=>T.sess.seats.map((s,i)=>[s,i]).filter(([s])=>s.k==='me'||s.k==='net').map(([,i])=>i);
  const turnOrder=T=>T.sess.seats.map((s,i)=>[s,i]).filter(([s])=>s.k==='me'||s.k==='net'||s.k==='bot').map(([,i])=>i);
  const seatName=(T,i)=>{ const s=T.sess && T.sess.seats[i]; if(!s) return '?'; return s.k==='me' ? (T===G && LOCALSEAT===i ? 'Bạn' : s.name||MYNAME) : s.k==='net' ? (s.name||'Bạn bè') : s.k==='bot' ? (T.botName||'Máy') : s.k==='open' ? 'Chờ bạn…' : '–'; };

  /* ============================== MẠNG (W.multi – tin t:'game', g:'bg') ============================== */
  const NET={ gid:'g'+Math.floor(Math.random()*1e9).toString(36), open:new Map(), loop:false, sent:[], pending:null,
    ok(){ return this.loop || !!(W.multi && W.multi.connected && W.multi.connected()); },
    send(o){ const m=Object.assign({t:'game', g:'bg'}, o); if(this.loop){ this.sent.push(m); return true; } return !!(W.multi && W.multi.send && W.multi.send(m)); } };
  function onNet(m){ if(!m || m.t!=='game' || m.g!=='bg') return; const now=performance.now(), T=TBL.get(m.tid);
    if(m.k==='open'){ if(!(G && G.id===m.tid && G.sess.host)) NET.open.set(m.tid,{...m, at:now}); return; }
    if(m.k==='close'){ NET.open.delete(m.tid); if(G && G.id===m.tid && !G.sess.host){ toast('👥 Chủ bàn đã thôi chơi.',2400); exitGame(true); } return; }
    if(!T) return;
    if(m.k==='join' && G===T && T.sess.host && T.sess.mode==='friends'){ let si=T.sess.seats.findIndex(s=>s.k==='open'); if(T.turn && T.sess.started) si=-1;
        if(si<0){ NET.send({k:'seat', tid:T.id, gid:m.gid, ok:false, why:T.sess.started?'Bàn đang chơi giữa ván':'Bàn đã đủ người'}); return; }
        T.sess.seats[si]={k:'net', name:m.name||'Bạn bè', gid:m.gid, at:now}; T.RI[si]=IN0(); NET.send({k:'seat', tid:T.id, gid:m.gid, ok:true, seat:si, kind:T.kind, n:T.sess.seats.length});
        toast(`👥 ${m.name||'Bạn bè'} đã vào ${T.title}!`,2600); if(T.onJoin) T.onJoin(si); return; }
    if(m.k==='seat' && m.gid===NET.gid && NET.pending===m.tid){ NET.pending=null; if(!m.ok){ toast('👥 Không vào được: '+(m.why||'bàn đã đủ người'),2600); return; } enterAsGuest(T, m.seat, m.n); return; }
    if(m.k==='in' && G===T && T.sess.host){ const si=T.sess.seats.findIndex(s=>s.k==='net' && s.gid===m.gid); if(si<0) return; const r=T.RI[si]||(T.RI[si]=IN0()); r.ix=m.ix||0; r.iz=m.iz||0; r.boost=!!m.b; r.mx+=m.mx||0; r.my+=m.my||0; if(m.ev) r.ev.push(...m.ev); T.sess.seats[si].at=now; return; }
    if(m.k==='st' && G===T && !T.sess.host){ T.snapIn=m; return; }
    if(m.k==='bye' && G===T && T.sess.host){ const si=T.sess.seats.findIndex(s=>s.k==='net' && s.gid===m.gid); if(si>=0) dropSeat(T,si); } }
  try{ if(W.multi && W.multi.on) W.multi.on(onNet); }catch(e){}
  function dropSeat(T,si){ const nm=T.sess.seats[si].name; T.sess.seats[si]= T.turn ? {k:'idle'} : {k:'bot'}; delete T.RI[si]; toast(`👥 ${nm||'Bạn bè'} đã rời bàn.`,2200);
    if(T.turn && T.onLeave) T.onLeave(si); if(!humanSeats(T).some(i=>T.sess.seats[i].k==='net')) toBotMode(T,'Không còn bạn bè – chơi tiếp với máy.'); }
  function toBotMode(T,msg){ if(T.sess.mode!=='friends') return; T.sess.mode='bot'; const bs=T.botSeats(); T.sess.seats=T.sess.seats.map((s,i)=>s.k==='net'?s:(bs[i]||{k:'idle'})); for(let i=0;i<bs.length;i++) if(!T.sess.seats[i]) T.sess.seats[i]=bs[i]; T.sess.started=true; residentPlay(T); if(T.onMode) T.onMode(); if(msg) toast('🤖 '+msg,2800); }

  /* ============================== CHỌN CHẾ ĐỘ (hộp E) ============================== */
  function choose(T){ if(G) return; if(HOOK.vehicle){ toast('🎮 Đang ngồi / đang lái – đứng dậy rồi vào chơi nhé.',2400); return; }
    const m=W.ui && W.ui.modal ? W.ui.modal(`${T.icon} ${T.title}`) : null; if(!m){ enterTable(T,'bot'); return; }
    const netOk=NET.ok(), rng=T.seatsTxt;
    m.body.innerHTML=`<div style="line-height:1.6;margin-bottom:12px">${T.desc}</div><div class="row" style="gap:10px;flex-wrap:wrap;justify-content:flex-end">
      <button class="btn pri" data-b>🤖 Chơi với máy</button><button class="btn" data-f ${netOk?'':'title="Cần bật 👥 Online (phím J) trước"'}>👥 Chơi cùng bạn (${rng})</button></div>
      <div style="margin-top:10px;opacity:.7;font-size:12.5px">${netOk?'Chơi cùng bạn: bàn mở chỗ – người chơi khác tới bàn bấm E là vào. 20 giây không ai vào thì chơi với máy.':'Chơi cùng bạn cần bật 👥 Online (phím J) – chưa bật thì chỉ chơi với máy.'}</div>`;
    m.body.querySelector('[data-b]').onclick=()=>{ m.close(); enterTable(T,'bot'); };
    m.body.querySelector('[data-f]').onclick=()=>{ m.close(); if(!NET.ok()){ toast('👥 Bật 👥 Online (phím J) để chơi cùng bạn – giờ chơi với máy nhé.',3200); enterTable(T,'bot'); return; } enterTable(T,'friends'); }; }

  /* ============================== VÀO / RA BÀN ============================== */
  function lockPlayer(T){ HOOK.vehicle={brainGame:true, drive:(dt,inp)=>{ LI.ix=inp.ix||0; LI.iz=inp.iz||0; LI.boost=!!inp.boost; const s=T.standFor(LOCALSEAT); P.x=s.x; P.z=s.z; P.y=F.y; P.vx=P.vz=P.vy=0; me.g.position.set(P.x,P.y,P.z); me.g.rotation.set(0,s.yaw,0); me.play('idle'); }};
    HOOK.vehicleInter=()=>({label:`🚪 Thôi chơi ${T.title} (E · Esc)`, action:()=>exitGame()}); savedVis=me.g.visible; me.g.visible=false; HOOK.camOverride={pos:new V3(), look:new V3(), k:60}; setTimeout(()=>{ if(HOOK.camOverride) HOOK.camOverride.k=9; },250); LI.ev=[]; LI.mx=LI.my=0; }
  function enterTable(T, mode){ if(G) return; G=T; LOCALSEAT=0; T.RI={}; const seats=mode==='friends'?T.friendSeats():T.botSeats();
    T.sess={mode, host:true, seats, started:mode!=='friends' || !T.turn, wait:mode==='friends'?20:0, sendT:0, openT:0};
    if(mode==='friends') residentAway(T); else residentPlay(T);
    T.reset(); lockPlayer(T); try{ T.cam(HOOK.camOverride, LOCALSEAT); }catch(e){} }
  function enterAsGuest(T, seat, n){ if(G) return; G=T; LOCALSEAT=seat; T.RI={}; T.sess={mode:'guest', host:false, seats:[...Array(n||T.seatsMax)].map((_,i)=>i===seat?{k:'me', name:MYNAME}:{k:'net'}), started:true, sendT:0}; T.snapIn=null; residentAway(T); lockPlayer(T);
    toast(`👥 Đã vào ${T.title} cùng bạn bè – bạn ở ghế ${seat+1}.`,3000); }
  /* thoát: luôn trả nhân vật về chỗ đứng TRỐNG cạnh bàn (dò va chạm) + chặn vào lại 1,2 s (không còn "dính bàn") */
  function freeSpotNear(x,z){ const ok=(px,pz)=>{ const p={x:px,z:pz,y:F.y}; try{ W.resolve(p,.32,false); }catch(e){ return false; } return Math.hypot(p.x-px,p.z-pz)<.02; };
    if(ok(x,z)) return [x,z]; for(let d=.35; d<3.2; d+=.3) for(let k=0;k<16;k++){ const a=k/16*TAU, px=x+Math.cos(a)*d, pz=z+Math.sin(a)*d; if(ok(px,pz)) return [px,pz]; } return [x,z]; }
  function exitGame(silent){ const T=G; if(!T) return; G=null;
    if(T.sess.host && T.sess.mode==='friends') NET.send({k:'close', tid:T.id}); if(!T.sess.host) NET.send({k:'bye', tid:T.id, gid:NET.gid});
    try{ T.stopPlay && T.stopPlay(); }catch(e){}
    const s=T.exitSpot ? T.exitSpot(LOCALSEAT) : T.standFor(LOCALSEAT), [x,z]=freeSpotNear(s.x,s.z);
    if(HOOK.vehicle && HOOK.vehicle.brainGame) HOOK.vehicle=null; HOOK.vehicleInter=null; HOOK.camOverride=null; me.g.visible=savedVis!==false; P.x=x; P.z=z; P.y=F.y; P.vx=P.vz=P.vy=0; me.g.position.set(x,F.y,z);
    if(hud) hud.hidden=true; T.cool=1.2; exitCool=.8; LI.ev=[];
    T.sess={mode:'demo', host:true, seats:T.demoSeats(), started:true}; T.RI={}; T.reset(); residentBack(T); }

  /* ============================== BOT (người thật trên tầng) ============================== */
  const BOTS=[]; const OUTFITS=[{shirt:0x2f6fd0, pants:0x22262e},{shirt:0xe0593c, pants:0x3a4a66},{shirt:0x2bb673, pants:0x22262e},{shirt:0xf2b632, pants:0x5a4a3a},{shirt:0x8e5bd6, pants:0x22262e},{shirt:0xf4f2ec, pants:0x1f2a3a},{shirt:0x15a5b8, pants:0x3a4a66},{shirt:0xe86aa6, pants:0x22262e},{shirt:0x1f2a3a, pants:0x6b6f78},{shirt:0x9a6b3f, pants:0x22262e}];
  const BOTNAMES=['Minh','Lan','Huy','Thảo','Khoa','Vy','Nam','Ngọc','Tuấn','Linh','Đạt','Mai'];
  function mkBot(i){ if(!W.people || !W.makeActor) return null; try{ const fem=i%2===1, s=W.people.pickSeed(L=>L.female===fem && L.style!=='cap', 7300+i*13), k=W.people.kit(s,{outfit:{...OUTFITS[i%OUTFITS.length], shoe:0x1b1d21, long:i%3===0}});
      const nm=(W.people.nameOf?W.people.nameOf(s):BOTNAMES[i%BOTNAMES.length]); const a=W.makeActor(k.gl,{name:`🎮 ${nm} · đang chơi`, height:k.h, face:0, clips:k.clips, compact:false, dot:'#ffd166'}); a.play('idle',0); a.mixer.update(0); a.g.visible=false; if(a.label) a.label.alpha=0;
      const bot={a, B:bonesOf(a.root||a.g), name:nm, x:0, z:0, yaw:0, tx:0, tz:0, tyaw:0, hidden:false, away:false, T:null, seat:1, i}; BOTS.push(bot); return bot; }catch(e){ console.warn('[brain_games] bot', e); return null; } }
  function botGoto(bot, s, snap){ bot.tx=s.x; bot.tz=s.z; bot.tyaw=s.yaw; if(snap){ bot.x=s.x; bot.z=s.z; bot.yaw=s.yaw; } }
  function residentAway(T){ for(const b of [T.bot,T.bot2]) if(b){ b.away=true; const s=T.standFor(b.seat), [ax,az]=[s.x+(F.cx-s.x)*.18, s.z+(F.cz-s.z)*.18]; bot_aside(b, ax, az); } }
  function bot_aside(b,x,z){ b.tx=x; b.tz=z; b.leaveT=2.2; }
  function residentPlay(T){ if(T.bot2){ T.bot2.away=true; const s=T.standFor(T.bot2.seat); bot_aside(T.bot2, s.x+(F.cx-s.x)*.18, s.z+(F.cz-s.z)*.18); }
    if(!T.bot && T.needBot){ T.bot=mkBot(40+TABLES.indexOf(T)); if(T.bot){ T.bot.T=T; T.bot.seat=T.botSeat; botGoto(T.bot, T.standFor(T.botSeat), true); T.bot.temp=true; } } if(T.bot){ T.bot.away=false; T.bot.hidden=false; T.bot.seat=T.botSeat; botGoto(T.bot, T.standFor(T.botSeat)); } }
  function residentBack(T){ for(const b of [T.bot,T.bot2]) if(b){ if(b.temp && T.sess.mode==='demo'){ b.hidden=true; b.a.g.visible=false; continue; } b.away=false; b.hidden=false; b.seat=b===T.bot2?T.botSeat2:T.botSeat; botGoto(b, T.standFor(b.seat)); } }
  function botFrame(b, dt){ const a=b.a, c=W.camera.position, near=Math.hypot(c.x-b.x,c.z-b.z)<30 && Math.abs(c.y-F.y-1.2)<6;
    if(b.T && !b.away && !b.hidden){ const s=b.T.standFor(b.seat); b.tx=s.x; b.tz=s.z; b.tyaw=s.yaw; }
    const dx=b.tx-b.x, dz=b.tz-b.z, d=Math.hypot(dx,dz), walk=d>.05; if(walk){ const k=Math.min(d,(d>1?1.25:.8)*dt); b.x+=dx/d*k; b.z+=dz/d*k; b.yaw=lerpA(b.yaw,Math.atan2(dx,dz),1-Math.exp(-dt*8)); } else b.yaw=lerpA(b.yaw,b.tyaw,1-Math.exp(-dt*7));
    if(b.away && b.leaveT!=null){ b.leaveT-=dt; if(b.leaveT<=0) b.hidden=true; }
    const vis=near && !b.hidden; if(a.g.visible!==vis){ a.g.visible=vis; if(a.label) a.label.alpha=vis?1:0; } if(!vis) return; a.play(walk?'walk':'idle'); a.mixer.update(dt); a.g.position.set(b.x,F.y,b.z); a.g.rotation.set(0,b.yaw,0); a.g.updateMatrixWorld(true);
    if(!walk && !b.away && b.T && b.T.botPose) try{ b.T.botPose(b, b.seat, dt); }catch(e){} }

  /* ============================== BÀN CHƠI – ĐĂNG KÝ ============================== */
  const TABLES=[], TBL=new Map();
  function reg(T){ TABLES.push(T); TBL.set(T.id,T); T.cool=0; T.RI={}; T.sess={mode:'demo', host:true, seats:T.demoSeats(), started:true}; T.reset(); const ip=T.inter();
    INTER.push({x:ip.x, z:ip.z, r:T.r||1.4, prio:1, when:()=>!G && (T.cool||0)<=0 && exitCool<=0 && Math.abs(P.y-F.y)<1.4, get label(){ const o=NET.open.get(T.id); return o && performance.now()-o.at<3000 ? `👥 Vào chơi ${T.title} cùng ${o.name||'bạn bè'} (E)` : `${T.icon} ${T.title} – E để chọn: chơi với máy / chơi cùng bạn`; },
      action:()=>{ const o=NET.open.get(T.id); if(o && performance.now()-o.at<3000){ NET.pending=T.id; NET.send({k:'join', tid:T.id, gid:NET.gid, name:MYNAME}); toast('👥 Đang xin vào bàn…',1500); setTimeout(()=>{ if(NET.pending===T.id){ NET.pending=null; toast('👥 Chủ bàn chưa trả lời – thử lại nhé.',2200); } },3500); } else choose(T); }});
    return T; }
  const cheerFor=(T,team)=>{ if(T===G){ (team?cheer:boo)(); hudPunch(); } };

  /* ============================================================================================
     ⚽ BI LẮC – 4 ghế: 0 = đỏ trên (tiền vệ 5 + tiền đạo 3), 1 = đỏ dưới (thủ môn + hậu vệ), 2 = xanh trên, 3 = xanh dưới
     ============================================================================================ */
  function buildFoos(slot, idx){ const g=slot.g;
    const L=1.16, WF=.68, FY=.80, RY=.868, GH=.095, R=.0175, FOOT=.072;
    const fieldT=canvasTex(512,300,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,w,0); for(let i=0;i<10;i++){ gr.addColorStop(i/10, i%2?'#2a8a4c':'#24803f'); gr.addColorStop((i+1)/10-.001, i%2?'#2a8a4c':'#24803f'); } c.fillStyle=gr; c.fillRect(0,0,w,h); c.strokeStyle='rgba(255,255,255,.92)'; c.lineWidth=4; c.strokeRect(6,6,w-12,h-12); c.beginPath(); c.moveTo(w/2,6); c.lineTo(w/2,h-6); c.stroke(); c.beginPath(); c.arc(w/2,h/2,46,0,TAU); c.stroke(); c.strokeRect(6,h/2-70,52,140); c.strokeRect(w-58,h/2-70,52,140); });
    add(g, rb(1.38,.18,.9,.035,3), M.wood, 0,FY-.09,0); add(g, new THREE.PlaneGeometry(L,WF), std(0xffffff,.85,0,{map:fieldT}), 0,FY+.002,0,-Math.PI/2,0,0,false);
    for(const s of [-1,1]) add(g, rb(1.38,.15,.08,.025,2), M.wood, 0,FY+.06,s*(WF/2+.04));
    for(const e of [-1,1]){ for(const s of [-1,1]) add(g, rb(.08,.15,WF/2-GH,.02,2), M.wood, e*(L/2+.04), FY+.06, s*(GH+(WF/2-GH)/2)); add(g, rb(.08,.05,GH*2,.012,1), M.wood, e*(L/2+.04), FY+.115, 0); add(g, rb(.14,.12,GH*2+.04,.02,1), M.dark, e*(L/2+.13), FY-.01, 0); }
    for(const a of [-1,1]) for(const b of [-1,1]){ add(g, new THREE.CylinderGeometry(.05,.038,FY-.18,14), M.black, a*.57, (FY-.18)/2, b*.34); add(g, new THREE.CylinderGeometry(.06,.06,.03,14), M.rubber, a*.57, .015, b*.34); }
    for(const b of [-1,1]) add(g, rb(1.1,.05,.05,.015,1), M.black, 0,.24,b*.34);
    const sbT=canvasTex(256,64,()=>{}), sbM=std(0xffffff,.5,0,{map:sbT, emissive:0xffffff, emissiveMap:sbT, emissiveIntensity:.35}); for(const e of [-1,1]) add(g, new THREE.PlaneGeometry(.34,.085), sbM, e*(L/2+.081), FY+.1, 0, 0, e*Math.PI/2, 0, false);
    const drawSB=(a,b)=>{ const c=sbT.image.getContext('2d'); c.fillStyle='#14171c'; c.fillRect(0,0,256,64); c.font='900 44px Segoe UI'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#ff5a4c'; c.fillText(String(a),70,34); c.fillStyle='#fff'; c.fillText(':',128,30); c.fillStyle='#5aa0ff'; c.fillText(String(b),186,34); sbT.needsUpdate=true; };
    const RODS=[[0,-.525,1,0],[0,-.375,2,.24],[1,-.225,3,.2],[0,-.075,5,.12],[1,.075,5,.12],[0,.225,3,.2],[1,.375,2,.24],[1,.525,1,0]].map(([team,x,n,sp],i)=>{ const offs=[...Array(n)].map((_,k)=>(k-(n-1)/2)*sp), mo=Math.max(0,...offs.map(Math.abs)); return {i, team, x, n, offs, max:n===1?.13:WF/2-.035-mo, slide:0, sv:0, th:0, om:0, kickT:-1, lift:false, cool:0}; });
    const SEATR=[[3,5],[0,1],[4,2],[7,6]], seatOfRod=i=>SEATR.findIndex(p=>p.includes(i)), teamOf=s=>s<2?0:1;
    const figG=t=>vcol([[rb(.024,.05,.03,.008,1), t?0x1f5fbf:0xc8231c, 0,-.022,0],[new THREE.SphereGeometry(.0125,10,8),0xf0c8a0,0,.016,0],[rb(.022,.022,.034,.006,1), t?0x14408a:0x8a1712, 0,-.058,0],[rb(.02,.012,.036,.005,1),0x1a1a1a,.004,-.074,0],[new THREE.CylinderGeometry(.012,.012,.03,10), t?0x1f5fbf:0xc8231c, 0,0,0,Math.PI/2,0,0]]);
    const figMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.42, metalness:.05}), NF=[0,1].map(t=>RODS.filter(r=>r.team===t).reduce((s,r)=>s+r.n,0));
    const FIG=[0,1].map(t=>{ const im=new THREE.InstancedMesh(figG(t),figMat,NF[t]); im.castShadow=!LOW; im.frustumCulled=false; g.add(im); return im; });
    const rodIM=new THREE.InstancedMesh(new THREE.CylinderGeometry(.0075,.0075,1.36,10).rotateX(Math.PI/2), M.chrome, 8), grips=new THREE.InstancedMesh(new THREE.CylinderGeometry(.018,.016,.12,14).rotateX(Math.PI/2), M.rubber, 8), bump=new THREE.InstancedMesh(new THREE.CylinderGeometry(.024,.024,.02,14).rotateX(Math.PI/2), M.black, 8);
    for(const im of [rodIM,grips,bump]){ im.frustumCulled=false; g.add(im); }
    const ball=add(g, new THREE.SphereGeometry(R,16,12), std(0xf7f3e8,.35), 0,FY+R,0); const _m=new THREE.Matrix4(), _qq=new THREE.Quaternion(), _e=new THREE.Euler(), _p=new V3(), _s=new V3(1,1,1);
    colRect(slot.g, 0, 0, .74, .62, -.4, 1.2, '⚽ Bàn bi lắc');
    const B={x:0,z:0,vx:0,vz:0,still:0}, ST={score:[0,0], phase:'serve', t:0, act:[5,1,2,6], man:[0,0,0,0], lastSB:''};
    const kick=r=>{ if(r.kickT<0 && r.cool<=0){ r.kickT=0; r.cool=.32; } };
    function serve(){ const sd=rnd()<.5?-1:1; B.x=rr(-.02,.02); B.z=sd*(WF/2-.03); B.vx=(rnd()<.5?-1:1)*rr(.05,.18); B.vz=-sd*rr(.55,.85); ST.phase='play'; B.still=0; }
    function goal(team){ ST.score[team]++; ST.phase='goal'; ST.t=1.3; B.vx=B.vz=0; B.x=Math.sign(B.x)*(L/2+.07); if(T===G){ (teamOf(LOCALSEAT)===team?cheer:boo)(); shake=.35; hudPunch(); } else thud(.5);
      if(ST.score[team]>=5){ ST.phase='over'; ST.t=T.sess.mode==='demo'?3:99; if(T===G && teamOf(LOCALSEAT)===team && T.sess.host) reward(30,'⚽ Thắng bi lắc 5–'+ST.score[1-team]+'! +30 💰'); } }
    function rodAI(r, dt, sk){ const s=r.team?-1:1; let tz=B.z; if(Math.abs(B.vx)>.05){ const t=(r.x-B.x)/B.vx; if(t>0 && t<1.2){ tz=B.z+B.vz*t; const lim=WF/2-R; for(let k=0;k<3;k++){ if(tz>lim) tz=2*lim-tz; if(tz<-lim) tz=-2*lim-tz; } } }
      if(r.n===1 && s*(B.x-r.x)>.25) tz=B.z*.45; let best=r.slide, bd=1e9; for(const o of r.offs){ const want=clamp(tz-o,-r.max,r.max), d=Math.abs(want-r.slide); if(d<bd){ bd=d; best=want; } }
      const dv=clamp((best-r.slide)*14,-sk.v,sk.v); r.sv=lerp(r.sv,dv,1-Math.exp(-dt*18)); r.slide=clamp(r.slide+r.sv*dt,-r.max,r.max);
      const dx=s*(B.x-r.x); if(dx>-.012 && dx<.05 && r.offs.some(o=>Math.abs(B.z-(r.slide+o))<.022) && rnd()<sk.k*dt*60) kick(r);
      r.lift = s*B.vx>.9 && dx<-.015 && dx>-.22 && r.team===(B.vx>0?0:1); }
    function seatManual(si, inp, dt){ const pair=SEATR[si], team=teamOf(si);
      for(const e of inp.ev){ if(e==='d'){ if(ST.phase==='over' && si===0 && T.sess.host){ T.reset(); return; } kick(RODS[ST.act[si]]); } else if(e==='L'){ ST.act[si]=pair[0]; ST.man[si]=2; } else if(e==='R'){ ST.act[si]=pair[1]; ST.man[si]=2; } else if(e==='S'){ ST.act[si]=ST.act[si]===pair[0]?pair[1]:pair[0]; ST.man[si]=2.5; } }
      ST.man[si]=Math.max(0,ST.man[si]-dt); if(!ST.man[si]){ const d0=Math.abs(B.x-RODS[pair[0]].x), d1=Math.abs(B.x-RODS[pair[1]].x); ST.act[si]=d1<d0?pair[1]:pair[0]; }
      for(const ri of pair){ const r=RODS[ri]; if(ri===ST.act[si]){ const tv=clamp((team?1:-1)*inp.iz*1.9,-2.2,2.2); r.sv=lerp(r.sv,tv,1-Math.exp(-dt*14)); r.slide=clamp(r.slide+r.sv*dt+(team?-1:1)*inp.my*.0021,-r.max,r.max); } else rodAI(r,dt,{v:.9,k:0}); r.lift=!!inp.boost; } }
    const T={kind:'foos', idx, id:'foos-'+idx, icon:'⚽', title:'Bi lắc', g, seatsMax:4, seatsTxt:'2–4 người', r:1.5, botSeat:2, botName:'Máy',
      desc:'Bi lắc 2 đội × 2 người – mỗi người 2 thanh, góc nhìn thứ nhất sau tay cầm. W/S hoặc chuột: đẩy/kéo · Space / chuột trái: xoay đá · Shift: nhấc thanh · A/D: đổi thanh. Chạm 5.',
      demoSeats:()=>[{k:'idle'},{k:'idle'},{k:'bot'},{k:'idle'}], botSeats:()=>[{k:'me'},{k:'bot'},{k:'bot'},{k:'bot'}], friendSeats:()=>[{k:'me'},{k:'open'},{k:'open'},{k:'open'}],
      onJoin(){ T.reset(); },
      reset(){ ST.score=[0,0]; ST.phase='serve'; for(const r of RODS){ r.slide=0; r.th=0; r.kickT=-1; } T.draw(); },
      sim(dt){ const n=Math.max(1,Math.ceil(dt/.004)), h=dt/n;
        const done=new Set(); for(let si=0;si<4;si++){ const inp=seatIn(T,si); if(inp){ seatManual(si,inp,dt); for(const ri of SEATR[si]) done.add(ri); } }
        for(const r of RODS){ r.cool-=dt; const si=seatOfRod(r.i); if(!done.has(r.i)){ if(isAI(T,si)) rodAI(r,dt,r.team===0?{v:1.25,k:.55}:{v:T.sess.mode==='demo'?1.15:1.45,k:.65}); else { r.lift=false; r.sv=0; } }
          let tgt=r.lift?-1.45:0, th=r.th; if(r.kickT>=0){ r.kickT+=dt; const t=r.kickT; tgt= t<.06 ? -.55*t/.06 : t<.14 ? -.55+2.05*(t-.06)/.08 : t<.42 ? 1.5*(1-(t-.14)/.28) : 0; if(t>=.42) r.kickT=-1; th=tgt; } else th=lerp(r.th,tgt,1-Math.exp(-dt*16)); r.om=(th-r.th)/Math.max(dt,1e-4); r.th=th; }
        if(ST.phase==='play'){ for(let k=0;k<n;k++){ B.x+=B.vx*h; B.z+=B.vz*h; const zw=WF/2-R; if(B.z>zw){ B.z=zw; B.vz=-Math.abs(B.vz)*.78; if(Math.abs(B.vz)>.3) tick(Math.abs(B.vz)); } else if(B.z<-zw){ B.z=-zw; B.vz=Math.abs(B.vz)*.78; if(Math.abs(B.vz)>.3) tick(Math.abs(B.vz)); }
            const xw=L/2-R; if(Math.abs(B.x)>xw){ if(Math.abs(B.z)<GH-R*.4){ if(Math.abs(B.x)>L/2+.02){ goal(B.x>0?0:1); break; } } else { B.x=Math.sign(B.x)*xw; B.vx=-B.vx*.75; if(Math.abs(B.vx)>.3) thud(Math.abs(B.vx)*.4); } }
            for(const r of RODS){ if(Math.abs(r.th)>1.05) continue; const s=r.team?-1:1, fx=r.x+s*Math.sin(r.th)*FOOT; if(Math.abs(B.x-fx)>R+.017) continue;
              for(const o of r.offs){ const fz=r.slide+o, dx=B.x-fx, dz=B.z-fz, d=Math.hypot(dx,dz); if(d>=R+.015 || d<1e-6) continue; const nx=dx/d, nz=dz/d; B.x=fx+nx*(R+.015); B.z=fz+nz*(R+.015);
                const vfx=s*Math.cos(r.th)*FOOT*r.om, vfz=r.sv, rvx=B.vx-vfx, rvz=B.vz-vfz, vn=rvx*nx+rvz*nz; if(vn<0){ B.vx-=1.55*vn*nx; B.vz-=1.55*vn*nz; const sp=Math.hypot(B.vx,B.vz); if(sp>2.2) clack(sp/4); else tick(sp); } } }
            const sp=Math.hypot(B.vx,B.vz); if(sp>6.5){ B.vx*=6.5/sp; B.vz*=6.5/sp; } const f=Math.max(0,1-.32*h); B.vx*=f; B.vz*=f; }
          if(ST.phase==='play'){ const sp=Math.hypot(B.vx,B.vz); B.still=sp<.04?B.still+dt:0; if(B.still>2.2){ B.still=0; B.vz+=(B.z>0?-1:1)*.35; B.vx+=rr(-.2,.2); } } }
        else if(ST.phase==='goal'){ ST.t-=dt; if(ST.t<=0) serve(); } else if(ST.phase==='serve') serve(); else if(ST.phase==='over'){ ST.t-=dt; if(ST.t<=0 && T.sess.mode==='demo') T.reset(); } },
      draw(){ const cnt=[0,0]; for(const r of RODS){ const s=r.team?-1:1; _qq.setFromEuler(_e.set(0,0,s*r.th)); for(const o of r.offs){ _p.set(r.x,RY,r.slide+o); _m.compose(_p,_qq,_s); FIG[r.team].setMatrixAt(cnt[r.team]++,_m); } _qq.identity(); _p.set(r.x,RY,r.slide); _m.compose(_p,_qq,_s); rodIM.setMatrixAt(r.i,_m); const hs=r.team?-1:1; _p.set(r.x,RY,r.slide+hs*(WF/2+.2)); _m.compose(_p,_qq,_s); grips.setMatrixAt(r.i,_m); _p.set(r.x,RY,r.slide+hs*(WF/2+.125)); _m.compose(_p,_qq,_s); bump.setMatrixAt(r.i,_m); }
        for(const im of [...FIG,rodIM,grips,bump]) im.instanceMatrix.needsUpdate=true; ball.position.set(B.x,FY+R,B.z); const sb=ST.score.join(':'); if(sb!==ST.lastSB){ ST.lastSB=sb; drawSB(ST.score[0],ST.score[1]); } },
      snap:()=>[B.x,B.z,B.vx,B.vz,ST.score[0],ST.score[1],['serve','play','goal','over'].indexOf(ST.phase),...RODS.flatMap(r=>[r.slide,r.th])].map(v=>+(+v).toFixed(4)),
      unsnap(a){ [B.x,B.z,B.vx,B.vz]=a; ST.score=[a[4],a[5]]; ST.phase=['serve','play','goal','over'][a[6]]||'play'; RODS.forEach((r,i)=>{ r.slide=a[7+i*2]; r.th=a[8+i*2]; }); },
      cam(o,seat){ const z=teamOf(seat)?-1:1, xo=seat===1||seat===3?(seat===1?-.18:.18):0; o.pos.copy(wp(g,B.x*.18+xo,1.5,z*1.0)); o.look.copy(wp(g,B.x*.3,FY,-z*.06)); },
      standFor(seat){ const t=teamOf(seat), x=[.08,-.45,-.08,.45][seat]; return st(g,x,t?-1.0:1.0,t?0:Math.PI); },
      inter:()=>wp(g,0,0,.95),
      hud(seat){ const t=teamOf(seat), you=seat===LOCALSEAT; const names=[0,1,2,3].map(i=>seatName(T,i)); return ['⚽ Bi lắc · chạm 5', `🔴 ${names[0]} & ${names[1]}  ${ST.score[0]} : ${ST.score[1]}  ${names[2]} & ${names[3]} 🔵`,
        ST.phase==='over' ? `${ST.score[t]>ST.score[1-t]?'🏆 Đội bạn thắng!':'😅 Đội bạn thua'}${T.sess.host?' · Space: ván mới':''} · Esc: thôi` : `Bạn cầm 2 thanh ${seat%2?'thủ môn + hậu vệ':'tiền vệ + tiền đạo'} đội ${t?'xanh':'đỏ'} · W/S · chuột: đẩy/kéo · Space: đá · Shift: nhấc · A/D: đổi thanh · Esc: thôi`]; },
      botPose(bot, seat){ const pair=SEATR[seat], hs=teamOf(seat)?-1:1, hp=ri=>{ const r=RODS[ri]; return wp(g,r.x,RY,r.slide+hs*(WF/2+.22)); }; const a=hp(pair[0]), b=hp(pair[1]); const [, rgt]=bodyFR(bot);
        const ar=a.clone().sub(new V3(bot.x,0,bot.z)).dot(rgt)>b.clone().sub(new V3(bot.x,0,bot.z)).dot(rgt); lean(bot,.35); ik(bot.B,'Right',ar?a:b,hintOut(bot,1)); ik(bot.B,'Left',ar?b:a,hintOut(bot,-1)); } };
    return reg(T); }

  /* ============================================================================================
     🏒 KHÚC CÔN CẦU – ghế 0 = đầu +X (đỏ), ghế 1 = đầu −X (xanh)
     ============================================================================================ */
  function buildHockey(slot, idx){ const g=slot.g; const L=2.0, WD=1.0, TY=.8, GW=.15, PR=.04, MR=.05;
    const surf=canvasTex(512,256,(c,w,h)=>{ c.fillStyle='#f4f6f8'; c.fillRect(0,0,w,h); c.fillStyle='rgba(30,40,60,.22)'; for(let x=8;x<w;x+=12) for(let y=8;y<h;y+=12){ c.beginPath(); c.arc(x,y,1.1,0,TAU); c.fill(); } c.strokeStyle='#d62828'; c.lineWidth=5; c.beginPath(); c.moveTo(w/2,0); c.lineTo(w/2,h); c.stroke(); c.beginPath(); c.arc(w/2,h/2,34,0,TAU); c.stroke(); c.strokeStyle='#1f5fbf'; for(const x of [0,w]){ c.beginPath(); c.arc(x,h/2,60,0,TAU); c.stroke(); } });
    add(g, rb(L+.2,.22,WD+.2,.05,3), M.black, 0,TY-.12,0); add(g, new THREE.PlaneGeometry(L,WD), std(0xffffff,.18,0,{map:surf}), 0,TY+.002,0,-Math.PI/2,0,0,false);
    for(const s of [-1,1]) add(g, rb(L+.2,.06,.1,.03,2), s<0?M.blue:M.red, 0,TY+.03,s*(WD/2+.05));
    for(const e of [-1,1]){ for(const s of [-1,1]) add(g, rb(.1,.06,WD/2-GW,.025,2), e<0?M.blue:M.red, e*(L/2+.05),TY+.03,s*(GW+(WD/2-GW)/2)); add(g, rb(.12,.1,GW*2+.04,.02,1), M.dark, e*(L/2+.09), TY-.06, 0); }
    for(const a of [-1,1]) for(const b of [-1,1]) add(g, rb(.12,TY-.23,.12,.03,2), M.black, a*(L/2-.1), (TY-.23)/2, b*(WD/2-.08));
    const skirtT=canvasTex(512,64,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#1f5fbf'); gr.addColorStop(.5,'#101318'); gr.addColorStop(1,'#c8231c'); c.fillStyle=gr; c.fillRect(0,0,w,h); c.fillStyle='#fff'; c.font='900 34px Segoe UI'; c.textAlign='center'; c.fillText('AIR HOCKEY · QA ARENA',w/2,44); });
    for(const s of [-1,1]) add(g, new THREE.PlaneGeometry(L,.14), std(0xffffff,.5,0,{map:skirtT, emissive:0xffffff, emissiveMap:skirtT, emissiveIntensity:.25}), 0,TY-.14,s*(WD/2+.101),0,s<0?Math.PI:0,0,false);
    const puck=add(g, new THREE.CylinderGeometry(PR,PR,.012,24), std(0xe0201c,.4), 0,TY+.008,0);
    const malG=new THREE.LatheGeometry([[0,0],[.05,0],[.05,.016],[.028,.024],[.02,.06],[.026,.075],[0,.08]].map(([x,y])=>new THREE.Vector2(x,y)),24);
    const MAL=[{x:.7,z:0,vx:0,vz:0,m:add(g,malG,M.red,.7,TY,0)},{x:-.7,z:0,vx:0,vz:0,m:add(g,malG,M.blue,-.7,TY,0)}], SIDE=[1,-1];
    colRect(slot.g, 0, 0, 1.12, .55, -.4, 1.2, '🏒 Bàn khúc côn cầu');
    const pk={x:0,z:0,vx:0,vz:0}, ST={score:[0,0], phase:'serve', t:0};
    const clampM=(m,side)=>{ const x0=side>0?MR+.02:-L/2+MR, x1=side>0?L/2-MR:-MR-.02; m.x=clamp(m.x,x0,x1); m.z=clamp(m.z,-WD/2+MR,WD/2-MR); };
    function moveM(m,tx,tz,vmax,dt,side){ const dx=tx-m.x, dz=tz-m.z, d=Math.hypot(dx,dz), sp=Math.min(vmax,d*12), vx=d>1e-4?dx/d*sp:0, vz=d>1e-4?dz/d*sp:0; m.vx=lerp(m.vx,vx,1-Math.exp(-dt*20)); m.vz=lerp(m.vz,vz,1-Math.exp(-dt*20)); m.x+=m.vx*dt; m.z+=m.vz*dt; clampM(m,side); }
    function botM(m,side,dt,v){ const own=side*L/2; if(side*pk.x>0){ const tx=-own, dx=tx-pk.x, dz=-pk.z, dl=Math.hypot(dx,dz)||1, ux=dx/dl, uz=dz/dl, gap=PR+MR+.03, bx=pk.x-ux*gap, bz=pk.z-uz*gap, behind=side*(m.x-pk.x)>0;
        if(behind && Math.hypot(m.x-bx,m.z-bz)<.07) moveM(m,pk.x+ux*.2,pk.z+uz*.2,v,dt,side); else if(!behind) moveM(m,bx,pk.z+(m.z>pk.z?1:-1)*(gap+.06),v,dt,side); else moveM(m,bx,bz,v,dt,side); }
      else moveM(m,own-side*.18,clamp(pk.z*.6,-.28,.28),v*.85,dt,side); }
    const hitM=m=>{ const dx=pk.x-m.x, dz=pk.z-m.z, d=Math.hypot(dx,dz); if(d>=PR+MR || d<1e-6) return; const nx=dx/d, nz=dz/d; pk.x=m.x+nx*(PR+MR); pk.z=m.z+nz*(PR+MR); const rvx=pk.vx-m.vx, rvz=pk.vz-m.vz, vn=rvx*nx+rvz*nz; if(vn<0){ pk.vx-=1.9*vn*nx; pk.vz-=1.9*vn*nz; clack(Math.hypot(pk.vx,pk.vz)/3); } };
    function serve(side){ pk.x=side*.3; pk.z=rr(-.2,.2); pk.vx=pk.vz=0; ST.phase='play'; }
    function goal(team){ ST.score[team]++; ST.phase='goal'; ST.t=1.2; if(T===G){ (LOCALSEAT===team?cheer:boo)(); shake=.3; hudPunch(); } else thud(.5); if(ST.score[team]>=7){ ST.phase='over'; ST.t=T.sess.mode==='demo'?3:99; if(T===G && LOCALSEAT===team && T.sess.host) reward(25,'🏒 Thắng khúc côn cầu! +25 💰'); } }
    const T={kind:'hockey', idx, id:'hockey-'+idx, icon:'🏒', title:'Khúc côn cầu', g, seatsMax:2, seatsTxt:'2 người', r:1.4, botSeat:1,
      desc:'Khúc côn cầu đĩa hơi 1 đấu 1. WASD / phím mũi tên / di chuột: điều khiển chày, đánh đĩa vào khe gôn đối thủ. Chạm 7.',
      demoSeats:()=>[{k:'idle'},{k:'bot'}], botSeats:()=>[{k:'me'},{k:'bot'}], friendSeats:()=>[{k:'me'},{k:'open'}], onJoin(){ T.reset(); },
      reset(){ ST.score=[0,0]; ST.phase='serve'; MAL[0].x=.7; MAL[0].z=0; MAL[1].x=-.7; MAL[1].z=0; pk.x=pk.z=pk.vx=pk.vz=0; T.draw(); },
      sim(dt){ const n=Math.max(1,Math.ceil(dt/.004)), h=dt/n;
        for(let si=0;si<2;si++){ const m=MAL[si], side=SIDE[si], inp=seatIn(T,si);
          if(inp){ for(const e of inp.ev) if(e==='d' && ST.phase==='over' && si===0 && T.sess.host) T.reset(); const tvx=-side*inp.iz*2.8, tvz=-side*inp.ix*2.8; m.vx=lerp(m.vx,tvx,1-Math.exp(-dt*16)); m.vz=lerp(m.vz,tvz,1-Math.exp(-dt*16)); const ox=m.x, oz=m.z; m.x+=m.vx*dt+side*inp.my*.003; m.z+=m.vz*dt-side*inp.mx*.003; clampM(m,side); m.vx=(m.x-ox)/dt; m.vz=(m.z-oz)/dt; }
          else if(isAI(T,si)) botM(m,side,dt,T.sess.mode==='demo'?1.6:2.1); else moveM(m,side*(L/2-.15),0,1,dt,side); }
        if(ST.phase==='play'){ for(let k=0;k<n;k++){ pk.x+=pk.vx*h; pk.z+=pk.vz*h; const zw=WD/2-PR; if(Math.abs(pk.z)>zw){ pk.z=Math.sign(pk.z)*zw; pk.vz*=-.9; tick(Math.abs(pk.vz)/2); }
            const xw=L/2-PR; if(Math.abs(pk.x)>xw){ if(Math.abs(pk.z)<GW-PR*.3){ if(Math.abs(pk.x)>L/2+.03){ goal(pk.x<0?0:1); break; } } else { pk.x=Math.sign(pk.x)*xw; pk.vx*=-.9; tick(Math.abs(pk.vx)/2); } }
            hitM(MAL[0]); hitM(MAL[1]); const sp=Math.hypot(pk.vx,pk.vz); if(sp>7){ pk.vx*=7/sp; pk.vz*=7/sp; } const f=Math.max(0,1-.12*h); pk.vx*=f; pk.vz*=f; } }
        else if(ST.phase==='goal'){ ST.t-=dt; if(ST.t<=0) serve(ST.score[0]>ST.score[1]?-1:1); } else if(ST.phase==='serve') serve(1); else if(ST.phase==='over'){ ST.t-=dt; if(ST.t<=0 && T.sess.mode==='demo') T.reset(); } },
      draw(){ puck.position.set(pk.x,TY+.008,pk.z); MAL.forEach(m=>m.m.position.set(m.x,TY,m.z)); },
      snap:()=>[pk.x,pk.z,pk.vx,pk.vz,MAL[0].x,MAL[0].z,MAL[1].x,MAL[1].z,ST.score[0],ST.score[1],['serve','play','goal','over'].indexOf(ST.phase)].map(v=>+(+v).toFixed(4)),
      unsnap(a){ [pk.x,pk.z,pk.vx,pk.vz,MAL[0].x,MAL[0].z,MAL[1].x,MAL[1].z]=a; ST.score=[a[8],a[9]]; ST.phase=['serve','play','goal','over'][a[10]]||'play'; },
      cam(o,seat){ const s=SIDE[seat]; o.pos.copy(wp(g,s*(L/2+.78),1.62,0)); o.look.copy(wp(g,-s*.15,TY,0)); },
      standFor(seat){ const s=SIDE[seat]; return st(g,s*(L/2+.5),0,s>0?-Math.PI/2:Math.PI/2); }, inter:()=>wp(g,L/2+.5,0,0),
      hud(seat){ return ['🏒 Khúc côn cầu đĩa hơi · chạm 7', `🔴 ${seatName(T,0)}  ${ST.score[0]} : ${ST.score[1]}  ${seatName(T,1)} 🔵`, ST.phase==='over' ? `${ST.score[seat]>ST.score[1-seat]?'🏆 Bạn thắng!':'😅 Thua rồi'}${T.sess.host?' · Space: ván mới':''} · Esc: thôi` : 'WASD / phím mũi tên / di chuột: điều khiển chày · đánh đĩa vào khe gôn đối thủ · Esc: thôi']; },
      botPose(bot, seat){ const m=MAL[seat], s=SIDE[seat]; lean(bot,.45); ik(bot.B,'Right',wp(g,m.x,TY+.08,m.z),hintOut(bot,1)); ik(bot.B,'Left',wp(g,s*(L/2+.06),TY+.04,s*.3),hintOut(bot,-1)); } };
    return reg(T); }

  /* ============================================================================================
     🏓 BÓNG BÀN – ghế 0 = đầu +X, ghế 1 = đầu −X
     ============================================================================================ */
  function buildPong(slot, idx){ const g=slot.g; const L=2.74, WD=1.525, TY=.76, NH=.1525, BR=.02, GR=9.8;
    const topT=canvasTex(512,286,(c,w,h)=>{ c.fillStyle='#1d4f8f'; c.fillRect(0,0,w,h); c.strokeStyle='#fff'; c.lineWidth=5; c.strokeRect(3,3,w-6,h-6); c.lineWidth=2; c.beginPath(); c.moveTo(0,h/2); c.lineTo(w,h/2); c.stroke(); });
    add(g, rb(L,.035,WD,.008,1), std(0xffffff,.32,0,{map:topT}), 0,TY-.018,0); add(g, rb(L-.2,.06,WD-.2,.01,1), M.black, 0,TY-.06,0);
    for(const a of [-1,1]) for(const b of [-1,1]){ add(g, new THREE.CylinderGeometry(.03,.03,TY-.09,10), M.steel, a*(L/2-.25),(TY-.09)/2,b*(WD/2-.15)); add(g, new THREE.CylinderGeometry(.045,.045,.04,12), M.rubber, a*(L/2-.25),.02,b*(WD/2-.15)); }
    const netT=canvasTex(256,32,(c,w,h)=>{ c.clearRect(0,0,w,h); c.strokeStyle='rgba(20,20,20,.75)'; c.lineWidth=1; for(let x=0;x<w;x+=6){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); } for(let y=0;y<h;y+=6){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); } c.fillStyle='#fff'; c.fillRect(0,0,w,4); });
    add(g, new THREE.PlaneGeometry(WD+.3,NH), std(0xffffff,.8,0,{map:netT, transparent:true, side:THREE.DoubleSide, alphaTest:.05}), 0,TY+NH/2,0,0,Math.PI/2,0,false); for(const s of [-1,1]) add(g, new THREE.CylinderGeometry(.012,.012,NH+.02,8), M.black, 0,TY+NH/2,s*(WD/2+.15));
    const ballM=add(g, new THREE.SphereGeometry(BR,14,10), std(0xff8a1e,.4), 0,TY+.3,0);
    const padG=vcol([[new THREE.CylinderGeometry(.075,.075,.012,22),0xc8231c,0,0,0,Math.PI/2,0,0],[rb(.025,.1,.022,.006,1),0x7a4a26,0,-.11,0]]), padM=std(0xffffff,.5,0,{vertexColors:true});
    const PD=[{x:L/2+.35,z:0,sw:0,m:add(g,padG,padM,L/2+.3,TY+.25,0)},{x:-L/2-.35,z:0,sw:0,m:add(g,padG,padM,-L/2-.3,TY+.25,0)}], SG=[1,-1];
    colRect(slot.g, 0, 0, L/2+.05, WD/2+.05, -.4, 1.0, '🏓 Bàn bóng bàn');
    const b={x:0,y:TY+.3,z:0,vx:0,vy:0,vz:0}, ST={score:[0,0], phase:'serve', server:0, t:0, last:-1, bounces:[0,0], msg:''};
    function shot(tx,tz,T2){ for(let k=0;k<6;k++){ const vx=(tx-b.x)/T2, vz=(tz-b.z)/T2, vy=(TY+BR-b.y+.5*GR*T2*T2)/T2, tn=(0-b.x)/vx, yn=b.y+vy*tn-.5*GR*tn*tn; if(tn<0 || yn>TY+NH+BR+.03){ b.vx=vx; b.vy=vy; b.vz=vz; return; } T2*=1.12; } b.vx=(tx-b.x)/T2; b.vz=(tz-b.z)/T2; b.vy=(TY+BR-b.y+.5*GR*T2*T2)/T2; }
    function point(team,why){ ST.score[team]++; ST.phase='dead'; ST.t=1.3; ST.msg=why; if(T===G){ (LOCALSEAT===team?cheer:boo)(); hudPunch(); } if(ST.score[team]>=11){ ST.phase='over'; ST.t=T.sess.mode==='demo'?3:99; if(T===G && LOCALSEAT===team && T.sess.host) reward(25,'🏓 Thắng bóng bàn! +25 💰'); } }
    function serve(){ ST.server=Math.floor((ST.score[0]+ST.score[1])/2)%2; const s=SG[ST.server]; b.x=s*(L/2+.25); b.z=PD[ST.server].z; b.y=TY+.32; b.vx=b.vy=b.vz=0; ST.phase='serve'; ST.t=0; ST.bounces=[0,0]; ST.last=-1; }
    function hit(seat,q,aim,smash){ const s=-SG[seat], tx=s*rr(.45,q>.6?1.2:1.0), tz=clamp(b.z*.35+aim*.55+(rnd()-.5)*(1.1-q)*.45,-.68,.68), bad=q<.18 && rnd()<.5; shot(bad?s*(L/2+.25):tx, bad?(rnd()<.5?-.9:.9):tz, smash?.42:.64); ST.last=seat; ST.bounces=[0,0]; tick(2); PD[seat].sw=1; ST.phase='rally'; }
    function tryHit(seat,inp){ if(ST.phase==='serve' && ST.server===seat){ hit(seat,.85,-SG[seat]*(inp.ix||0),!!inp.boost); return; } if(ST.phase==='over'){ if(T.sess.host && seat===0) T.reset(); return; }
      if(ST.phase!=='rally' || ST.last===seat || ST.bounces[seat]!==1){ PD[seat].sw=1; return; } const p=PD[seat], dx=Math.abs(b.x-p.x), dz=Math.abs(b.z-p.z); if(dx<.42 && dz<.42 && b.y>TY+.02 && b.y<TY+.8){ hit(seat,clamp(1-dx/.42-dz*.6,0,1),-SG[seat]*(inp.ix||0),!!inp.boost); } else p.sw=1; }
    const T={kind:'pong', idx, id:'pong-'+idx, icon:'🏓', title:'Bóng bàn', g, seatsMax:2, seatsTxt:'2 người', r:1.4, botSeat:1, botSeat2:0,
      desc:'Bóng bàn 1 đấu 1, luật nảy 1 lần mỗi bên. A/D chạy ngang · W/S lên/lùi · Space đúng lúc bóng tới để đánh (giữ A/D = hướng, Shift = đập mạnh). Chạm 11.',
      demoSeats:()=>[{k:'bot'},{k:'bot'}], botSeats:()=>[{k:'me'},{k:'bot'}], friendSeats:()=>[{k:'me'},{k:'open'}], onJoin(){ T.reset(); },
      reset(){ ST.score=[0,0]; PD[0].z=PD[1].z=0; serve(); T.draw(); },
      sim(dt){ for(let si=0;si<2;si++){ const p=PD[si], s=SG[si], inp=seatIn(T,si);
          if(inp){ p.z=clamp(p.z-s*inp.ix*2.4*dt,-.95,.95); p.x=s>0?clamp(p.x-inp.iz*1.2*dt,L/2+.12,L/2+.7):clamp(p.x+inp.iz*1.2*dt,-L/2-.7,-L/2-.12); for(const e of inp.ev) if(e==='d') tryHit(si,inp); }
          else if(isAI(T,si)){ const tz=s*b.vx>0 ? b.z+b.vz*Math.max(0,(p.x-b.x)/(b.vx||1e-3)) : b.z*.4; p.z=lerp(p.z,clamp(tz,-.9,.9),1-Math.exp(-dt*3.2));
            if(ST.phase==='serve' && ST.server===si){ ST.t+=dt; if(ST.t>1){ hit(si,.85,rr(-.6,.6),false); } }
            else if(ST.phase==='rally' && ST.last!==si && ST.bounces[si]===1 && Math.abs(b.x-p.x)<.35 && s*b.vx>0 && b.y>TY+.03){ const miss=rnd()<(T.sess.mode==='demo'?.07:.15)+Math.max(0,Math.hypot(b.vx,b.vz)-5)*.08; if(!miss) hit(si,rr(.55,.95),rr(-.7,.7),rnd()<.15); else ST.missed=si; } } }
        if(ST.phase==='serve'){ const p=PD[ST.server]; b.x=p.x-SG[ST.server]*.12; b.z=p.z; b.y=TY+.32+Math.sin(performance.now()/180)*.03; }
        else if(ST.phase==='rally'){ const n=Math.max(1,Math.ceil(dt/.004)), h=dt/n; for(let k=0;k<n;k++){ const px=b.x; b.vy-=GR*h; b.x+=b.vx*h; b.y+=b.vy*h; b.z+=b.vz*h; const fr=1-.05*h; b.vx*=fr; b.vz*=fr;
            if(px*b.x<=0 && b.y<TY+NH+BR && Math.abs(b.z)<WD/2+.15){ b.vx*=-.15; b.x=Math.sign(px)*.01; point(1-ST.last,'🥅 Bóng chạm lưới'); return; }
            if(b.y<TY+BR && b.vy<0 && Math.abs(b.x)<L/2 && Math.abs(b.z)<WD/2){ b.y=TY+BR; b.vy=-b.vy*.86; const side=b.x>0?0:1; tick(1.4); if(side===ST.last){ point(1-side,'❌ Bóng nảy bên người đánh'); return; } ST.bounces[side]++; if(ST.bounces[side]>=2){ point(1-side,'❌ Không đỡ kịp'); return; } }
            if(b.y<TY-.25){ const rec=1-ST.last; point(ST.bounces[rec]>0?ST.last:rec, ST.bounces[rec]>0?'✅ Ăn điểm':'❌ Bóng ra ngoài'); return; } } }
        else if(ST.phase==='dead'){ ST.t-=dt; b.vy-=GR*dt; b.y=Math.max(TY-.7,b.y+b.vy*dt); b.x+=b.vx*dt*.5; if(ST.t<=0) serve(); } else if(ST.phase==='over'){ ST.t-=dt; if(ST.t<=0 && T.sess.mode==='demo') T.reset(); }
        PD[0].sw=Math.max(0,PD[0].sw-dt*4); PD[1].sw=Math.max(0,PD[1].sw-dt*4); },
      draw(){ ballM.position.set(b.x,b.y,b.z); const hy=y=>clamp(y,TY+.12,TY+.6); PD.forEach((p,i)=>{ p.m.position.set(p.x,hy(b.y),p.z); p.m.rotation.set(0,SG[i]*Math.PI/2,-SG[i]*p.sw*.9); }); },
      snap:()=>[b.x,b.y,b.z,b.vx,b.vy,b.vz,PD[0].x,PD[0].z,PD[0].sw,PD[1].x,PD[1].z,PD[1].sw,ST.score[0],ST.score[1],['serve','rally','dead','over'].indexOf(ST.phase),ST.server,ST.last].map(v=>+(+v).toFixed(4)),
      unsnap(a){ [b.x,b.y,b.z,b.vx,b.vy,b.vz,PD[0].x,PD[0].z,PD[0].sw,PD[1].x,PD[1].z,PD[1].sw]=a; ST.score=[a[12],a[13]]; ST.phase=['serve','rally','dead','over'][a[14]]||'rally'; ST.server=a[15]; ST.last=a[16]; },
      cam(o,seat){ const s=SG[seat], p=PD[seat]; o.pos.copy(wp(g,s*(L/2+1.3),1.8,p.z*.5)); o.look.copy(wp(g,-s*.35,TY,p.z*.25)); },
      standFor(seat){ const p=PD[seat], s=SG[seat]; return st(g,p.x+s*.25,p.z,s>0?-Math.PI/2:Math.PI/2); }, inter:()=>wp(g,L/2+.55,0,0),
      hud(seat){ return ['🏓 Bóng bàn · chạm 11', `${seatName(T,0)}  ${ST.score[0]} : ${ST.score[1]}  ${seatName(T,1)}`, ST.phase==='over' ? `${ST.score[seat]>ST.score[1-seat]?'🏆 Bạn thắng!':'😅 Thua rồi'}${T.sess.host?' · Space: ván mới':''} · Esc: thôi` : `${ST.phase==='dead'&&ST.msg?ST.msg+' · ':''}${ST.phase==='serve'&&ST.server===seat?'Space: giao bóng · ':''}A/D: chạy ngang · W/S: lên/lùi · Space đúng lúc bóng tới: đánh (A/D = hướng, Shift = đập) · Esc: thôi`]; },
      botPose(bot, seat){ const p=PD[seat]; const hpos=p.m.position.clone(); hpos.y-=.1; lean(bot,.25); ik(bot.B,'Right',wp(g,hpos.x,hpos.y,hpos.z),hintOut(bot,1)); const [f,r]=bodyFR(bot); ik(bot.B,'Left',new V3(bot.x,F.y+1.0,bot.z).addScaledVector(f,.3).addScaledVector(r,-.25),hintOut(bot,-1)); } };
    return reg(T); }

  /* ============================================================================================
     🎯 PHI TIÊU – 1–4 người lần lượt · mỗi lượt 3 mũi · 3 lượt
     ============================================================================================ */
  function buildDarts(slot, idx){ const g=slot.g; const CY=1.73, BRD=.226, ORDER=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5], THROW=2.37;
    const boardT=canvasTex(1024,1024,(c,w)=>{ const cx=w/2, k=w/2/BRD; c.fillStyle='#111'; c.beginPath(); c.arc(cx,cx,w/2,0,TAU); c.fill(); const ring=(r0,r1,cols)=>{ for(let i=0;i<20;i++){ const a0=-Math.PI/2+(i-.5)*TAU/20, a1=a0+TAU/20; c.fillStyle=cols[i%2]; c.beginPath(); c.arc(cx,cx,r1*k,a0,a1); c.arc(cx,cx,r0*k,a1,a0,true); c.closePath(); c.fill(); } };
      ring(.0159,.099,['#1b1b1b','#efe3c2']); ring(.099,.107,['#c8231c','#1d7a3e']); ring(.107,.162,['#1b1b1b','#efe3c2']); ring(.162,.170,['#c8231c','#1d7a3e']); c.fillStyle='#1d7a3e'; c.beginPath(); c.arc(cx,cx,.0159*k,0,TAU); c.fill(); c.fillStyle='#c8231c'; c.beginPath(); c.arc(cx,cx,.00635*k,0,TAU); c.fill();
      c.strokeStyle='#bfc4c9'; c.lineWidth=2; for(const r of [.0159,.099,.107,.162,.170]){ c.beginPath(); c.arc(cx,cx,r*k,0,TAU); c.stroke(); } c.fillStyle='#f4f1ea'; c.font='bold 46px Segoe UI'; c.textAlign='center'; c.textBaseline='middle'; for(let i=0;i<20;i++){ const a=-Math.PI/2+i*TAU/20; c.fillText(String(ORDER[i]), cx+Math.cos(a)*.196*k, cx+Math.sin(a)*.196*k); } });
    add(g, rb(.86,1.05,.06,.02,2), M.wood, 0,CY,-.06); for(const s of [-1,1]) add(g, rb(.43,1.05,.03,.012,1), M.wood, s*.66,CY,.05,0,s*.9,0);
    add(g, new THREE.CylinderGeometry(BRD+.01,BRD+.01,.04,48), M.black, 0,CY,-.015,Math.PI/2,0,0); add(g, new THREE.CircleGeometry(BRD,64), std(0xffffff,.8,0,{map:boardT}), 0,CY,.006,0,0,0,false);
    add(g, rb(.12,1.2,.12,.03,2), M.black, 0,.6,-.12); add(g, rb(.7,.05,.5,.02,1), M.black, 0,.025,-.1);
    const ocheT=canvasTex(256,32,(c,w)=>{ c.fillStyle='#d4af37'; c.fillRect(0,0,w,32); c.fillStyle='#111'; c.font='800 22px Segoe UI'; c.textAlign='center'; c.fillText('OCHE 2,37 m',w/2,23); }); add(g, new THREE.PlaneGeometry(.9,.1), std(0xffffff,.5,0,{map:ocheT, polygonOffset:true, polygonOffsetFactor:-2}), 0,.004,THROW,-Math.PI/2,0,0,false);
    colRect(slot.g, 0, 0, .58, .2, -.4, 2.4, '🎯 Bảng phi tiêu');
    const dartG=vcol([[new THREE.CylinderGeometry(.0035,.0035,.035,6),0xdcdcdc,0,0,.0175,Math.PI/2,0,0],[new THREE.CylinderGeometry(.006,.005,.06,10),0x2a2a2a,0,0,.065,Math.PI/2,0,0],[new THREE.CylinderGeometry(.003,.003,.04,6),0x888888,0,0,.115,Math.PI/2,0,0],[new THREE.BoxGeometry(.0015,.03,.035),0xc8231c,0,0,.14],[new THREE.BoxGeometry(.03,.0015,.035),0xc8231c,0,0,.14]]);
    const dartM=std(0xffffff,.45,.3,{vertexColors:true}), darts=[...Array(3)].map(()=>{ const m=add(g,dartG,dartM,0,-5,0,0,0,0,false); m.visible=false; return m; }), handDart=add(g,dartG,dartM,0,-5,0,0,0,0,false); handDart.visible=false;
    const ret=add(g, new THREE.TorusGeometry(.011,.0025,6,20), std(0x46d39a,.4,0,{emissive:0x46d39a, emissiveIntensity:1.2}), 0,CY,.02,0,0,0,false); ret.visible=false;
    const ST={cur:0, n:0, round:1, sc:[0,0,0,0], last:[], phase:'aim', aim:[0,0], fly:null, t:0, anim:0, dp:[]};
    const scoreAt=(x,y)=>{ const r=Math.hypot(x,y); if(r<.00635) return [50,'BULL 50']; if(r<.0159) return [25,'25']; if(r>.170) return [0,'trượt']; const a=(Math.atan2(x,y)+TAU+Math.PI/20)%TAU, base=ORDER[Math.floor(a/(TAU/20))%20]; if(r>.099 && r<.107) return [base*3,'×3 '+base]; if(r>.162) return [base*2,'×2 '+base]; return [base,String(base)]; };
    const sway=t=>[Math.sin(t*1.7)*.024+Math.sin(t*3.1)*.011, Math.cos(t*1.3)*.024+Math.sin(t*2.3)*.009];
    function throwAt(ax,ay){ if(ST.fly || ST.phase!=='aim') return; const t=performance.now()/1000, sw=sway(t), tgt=[ax+sw[0]+rr(-.013,.013), ay+sw[1]+rr(-.013,.013)]; ST.fly={t:0,T:.34,from:new V3(.16,1.5,THROW-.15),to:new V3(tgt[0],CY+tgt[1],.004), m:darts[ST.n%3]}; ST.fly.m.visible=true; ST.anim=.35; snd(500,.12,'sine',.05,260); }
    const order=()=>turnOrder(T);
    function nextTurn(){ const o=order(); for(const d of darts) d.visible=false; ST.dp=[]; const k=o.indexOf(ST.cur); if(k>=o.length-1 || k<0){ if(ST.round>=3){ ST.phase='done'; ST.t=T.sess.mode==='demo'?4:0; finish(); return; } ST.round++; ST.cur=o[0]; } else ST.cur=o[k+1]; ST.n=0; ST.t=0; ST.aim=[0,0]; }
    function finish(){ if(T!==G || !T.sess.host) return; const o=order(), my=ST.sc[LOCALSEAT]; const best=S.brainGames.darts||0; if(my>best){ S.brainGames.darts=my; save(); toast(`🎯 Kỷ lục mới: ${my} điểm!`,3000); } if(o.length>1 && o.every(i=>i===LOCALSEAT || ST.sc[i]<my)) reward(20,'🎯 Thắng phi tiêu! +20 💰'); else if(o.length===1 && my>=180) reward(20,'🎯 Phi tiêu ≥ 180 điểm! +20 💰'); }
    const T={kind:'darts', idx, id:'darts-'+idx, icon:'🎯', title:'Phi tiêu', g, seatsMax:4, seatsTxt:'1–4 người lần lượt', r:1.3, botSeat:1, turn:true,
      desc:'Phi tiêu 3 lượt × 3 mũi, lần lượt từng người. WASD / chuột: ngắm (tay rung tự nhiên) · Space / chuột trái: phóng. Bảng chuẩn: bull 50 · 25 · vòng đôi · vòng ba.',
      demoSeats:()=>[{k:'idle'},{k:'bot'}], botSeats:()=>[{k:'me'},{k:'bot'}], friendSeats:()=>[{k:'me'},{k:'open'},{k:'open'},{k:'open'}],
      onJoin(){}, onLeave(si){ if(ST.cur===si) nextTurn(); }, onMode(){ T.reset(); },
      reset(){ ST.sc=[0,0,0,0]; ST.round=1; ST.n=0; ST.last=[]; ST.phase='aim'; ST.fly=null; ST.dp=[]; const o=order(); ST.cur=o.length?o[0]:0; ST.t=0; for(const d of darts) d.visible=false; },
      sim(dt){ if(T.sess.mode==='friends' && !T.sess.started) return; const o=order(); if(!o.length) return; if(!o.includes(ST.cur)) ST.cur=o[0];
        const inp=seatIn(T,ST.cur); ST.anim=Math.max(0,ST.anim-dt);
        if(ST.phase==='done'){ ST.t-=dt; const hi=seatIn(T,0); if((T.sess.mode==='demo' && ST.t<=0) || (hi && hi.ev.includes('d') && T.sess.host)) T.reset(); return; }
        if(inp){ ST.aim[0]=clamp(ST.aim[0]+inp.ix*.22*dt+inp.mx*.00045,-.3,.3); ST.aim[1]=clamp(ST.aim[1]+inp.iz*.22*dt-inp.my*.00045,-.3,.3); if(inp.ev.includes('d')) throwAt(ST.aim[0],ST.aim[1]); }
        else if(isAI(T,ST.cur) && !ST.fly){ ST.t+=dt; const tg=ST.n%2?[0,.103]:[0,0]; ST.aim[0]=lerp(ST.aim[0],tg[0],1-Math.exp(-dt*3)); ST.aim[1]=lerp(ST.aim[1],tg[1],1-Math.exp(-dt*3)); if(ST.t>rr(1.3,2.1)){ ST.t=0; throwAt(ST.aim[0]+rr(-.03,.03),ST.aim[1]+rr(-.03,.03)); } }
        const f=ST.fly; if(f){ f.t+=dt; const u=Math.min(1,f.t/f.T); if(u>=1){ const [pts,lab]=scoreAt(f.to.x,f.to.y-CY); ST.sc[ST.cur]+=pts; ST.last=[...ST.last.slice(-2),lab]; ST.dp.push([f.to.x,f.to.y,f.to.z]); ST.n++; ST.fly=null; thud(.6); if(T===G && pts>=40){ snd(880,.15,'triangle',.08); hudPunch(); }
            if(ST.n>=3){ ST.t=0; ST.phase='between'; ST.bt=1.1; } } }
        if(ST.phase==='between'){ ST.bt-=dt; if(ST.bt<=0){ ST.phase='aim'; nextTurn(); } } },
      draw(){ const t=performance.now()/1000, sw=sway(t), mine=G===T && ST.cur===LOCALSEAT; ret.visible=mine && !ST.fly && ST.phase==='aim'; ret.position.set(ST.aim[0]+sw[0],CY+ST.aim[1]+sw[1],.012);
        const f=ST.fly; darts.forEach((d,i)=>{ if(f && d===f.m){ const u=Math.min(1,f.t/f.T), p=new V3().lerpVectors(f.from,f.to,u); p.y+=Math.sin(u*Math.PI)*.12; d.position.copy(p); d.rotation.set(-.12*(1-u)+.05,0,0); d.visible=true; } else if(ST.dp[i]){ d.position.set(...ST.dp[i]); d.rotation.set(.05,0,0); d.visible=true; } else d.visible=false; }); },
      snap:()=>({c:ST.cur, n:ST.n, r:ST.round, s:ST.sc, l:ST.last, ph:ST.phase, a:ST.aim.map(v=>+v.toFixed(3)), dp:ST.dp, f:ST.fly?{t:+ST.fly.t.toFixed(3), to:[ST.fly.to.x,ST.fly.to.y,ST.fly.to.z]}:null}),
      unsnap(a){ ST.cur=a.c; ST.n=a.n; ST.round=a.r; ST.sc=a.s; ST.last=a.l; ST.phase=a.ph; ST.aim=a.a; ST.dp=a.dp||[]; if(a.f){ ST.fly={t:a.f.t,T:.34,from:new V3(.16,1.5,THROW-.15),to:new V3(...a.f.to),m:darts[ST.n%3]}; } else ST.fly=null; },
      cam(o){ o.pos.copy(wp(g,0,1.66,1.25)); o.look.copy(wp(g,0,CY,0)); },
      standFor(seat){ const isCur=seat===ST.cur; return st(g,isCur?0:(seat%2?.95:-.95),isCur?THROW+.25:THROW+.75,0); }, inter:()=>wp(g,0,0,THROW+.2),
      hud(seat){ const o=order(); const sc=o.map(i=>`${seatName(T,i)} ${ST.sc[i]}`).join(' · '); return ['🎯 Phi tiêu · 3 lượt × 3 mũi', sc||'—',
        T.sess.mode==='friends' && !T.sess.started ? `👥 Đang chờ bạn bè vào… còn ${Math.ceil(T.sess.wait)} s · Space: bắt đầu ngay` : ST.phase==='done' ? `Xong! ${T.sess.host?'Space: chơi lại · ':''}Esc: thôi` : `Lượt ${ST.round}/3 · ${ST.cur===seat?'đến lượt BẠN':'lượt '+seatName(T,ST.cur)} · ${ST.last.join(' · ')||'chưa phóng'} · WASD / chuột: ngắm · Space: phóng`]; },
      botPose(bot, seat){ if(seat!==ST.cur) return; const B2=bot.B; if(!B2.Head) return; const hp=new V3(); B2.Head.getWorldPosition(hp); const [f,r]=bodyFR(bot), e=ST.anim>0?Math.sin((1-ST.anim/.35)*Math.PI):0;
        const tgt=hp.clone().addScaledVector(f,.22+e*.38).addScaledVector(r,.12).add(new V3(0,-.06+e*.05,0)); ik(B2,'Right',tgt,new V3(0,-1,0).addScaledVector(r,.8)); ik(B2,'Left',new V3(bot.x,F.y+.95,bot.z).addScaledVector(f,.15).addScaledVector(r,-.25),hintOut(bot,-1)); } };
    return reg(T); }

  /* ============================================================================================
     🏀 NÉM BÓNG RỔ ARCADE – 1–4 người lần lượt (mỗi lượt 30 s; 1 người 45 s)
     ============================================================================================ */
  function buildHoops(slot, idx){ const g=slot.g; const HX=0, HY=2.05, HZ=-1.25, RIM=.19, BRAD=.1, GR=9.8;
    const ballT=canvasTex(256,128,(c,w,h)=>{ c.fillStyle='#e0661e'; c.fillRect(0,0,w,h); for(let i=0;i<4000;i++){ c.fillStyle=`rgba(0,0,0,${Math.random()*.08})`; c.fillRect(Math.random()*w,Math.random()*h,2,2); } c.strokeStyle='#1a1a1a'; c.lineWidth=4; c.beginPath(); c.moveTo(0,h/2); c.lineTo(w,h/2); c.stroke(); for(const x of [w/4,w*3/4]){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); } });
    const ballMat=std(0xffffff,.7,0,{map:ballT});
    add(g, rb(1.3,.9,.7,.04,2), M.black, 0,.45,.95); add(g, rb(1.36,.08,.76,.03,2), std(0xd4af37,.22,1), 0,.93,.95); { const ramp=add(g, rb(1.2,.06,2.2,.02,1), M.woodL, 0,1.05,-.15); ramp.rotation.x=-.12; }
    for(const s of [-1,1]){ add(g, rb(.06,1.9,2.6,.02,1), M.black, s*.66,1.2,-.2); add(g, new THREE.PlaneGeometry(2.5,1.3), M.net, s*.63,1.75,-.2,0,Math.PI/2,0,false); }
    add(g, rb(1.36,.1,.1,.03,1), std(0xd4af37,.22,1), 0,2.85,-1.45); add(g, rb(.1,2.85,.1,.03,1), M.black, -.66,1.42,-1.45); add(g, rb(.1,2.85,.1,.03,1), M.black, .66,1.42,-1.45);
    const bbT=canvasTex(256,192,(c,w,h)=>{ c.fillStyle='rgba(230,240,248,.9)'; c.fillRect(0,0,w,h); c.strokeStyle='#c8231c'; c.lineWidth=6; c.strokeRect(6,6,w-12,h-12); c.strokeRect(w/2-40,h-90,80,60); }); add(g, new THREE.PlaneGeometry(1.0,.75), std(0xffffff,.2,0,{map:bbT, transparent:true, opacity:.92}), HX,HY+.28,-1.44,0,0,0,false);
    add(g, new THREE.TorusGeometry(RIM,.011,8,36), std(0xff5a1e,.35,.6), HX,HY,HZ,Math.PI/2,0,0); add(g, rb(.08,.04,.08,.01,1), std(0xff5a1e,.35,.6), HX,HY,HZ-RIM-.03);
    const net=add(g, new THREE.CylinderGeometry(RIM,RIM*.6,.3,16,4,true), new THREE.MeshStandardMaterial({color:0xffffff, wireframe:true, transparent:true, opacity:.8}), HX,HY-.15,HZ,0,0,0,false);
    const ledT=canvasTex(512,128,()=>{}); add(g, new THREE.PlaneGeometry(1.2,.3), std(0x000000,.5,0,{emissive:0xffffff, emissiveMap:ledT, emissiveIntensity:1.1, map:ledT}), 0,3.1,-1.45,0,0,0,false); add(g, rb(1.32,.38,.12,.03,1), M.black, 0,3.1,-1.52);
    let ledKey=''; const drawLED=(sc,t,lab)=>{ const k=sc+'|'+t+'|'+lab; if(k===ledKey) return; ledKey=k; const c=ledT.image.getContext('2d'); c.fillStyle='#050608'; c.fillRect(0,0,512,128); c.font='900 64px Consolas,monospace'; c.textBaseline='middle'; c.fillStyle='#ff3b30'; c.textAlign='left'; c.fillText(String(sc).padStart(3,'0'),24,70); c.fillStyle='#ffd23f'; c.textAlign='right'; c.fillText(t>=0?String(t).padStart(2,'0'):'--',488,70); c.fillStyle='#46d39a'; c.font='800 22px Segoe UI'; c.textAlign='center'; c.fillText(lab,256,24); ledT.needsUpdate=true; };
    colRect(slot.g, 0, -.15, .7, 1.45, -.4, 3.2, '🏀 Máy ném bóng rổ');
    const BALLS=[...Array(5)].map(()=>{ const m=add(g,new THREE.SphereGeometry(BRAD,18,12),ballMat,0,-9,0); return {m,x:0,y:-9,z:0,vx:0,vy:0,vz:0,live:false,sc:false}; }), hold=add(g,new THREE.SphereGeometry(BRAD,18,12),ballMat,0,1.25,.95); hold.visible=false;
    const ST={cur:0, sc:[0,0,0,0], t:45, phase:'play', aim:0, pw:0, pdir:1, charging:false, cool:0, swish:0, anim:0, bt:0, bshot:0, played:[]};
    const turnLen=()=>turnOrder(T).length>1?30:45;
    function shoot(pw){ const b=BALLS.find(q=>!q.live); if(!b || ST.cool>0 || ST.phase!=='play') return; ST.cool=.38; ST.anim=.4; const p0=[0,1.3,.85], a=ST.aim, d=Math.hypot(HX-p0[0],HZ-p0[2])/Math.cos(a), h=HY-p0[1], al=62*Math.PI/180, v0=Math.sqrt(GR*d*d/(2*Math.cos(al)**2*(d*Math.tan(al)-h)));
      const v=v0*(.86+pw*.28), dir=[Math.sin(a),-Math.cos(a)]; Object.assign(b,{x:p0[0],y:p0[1],z:p0[2],vx:dir[0]*v*Math.cos(al),vz:dir[1]*v*Math.cos(al),vy:v*Math.sin(al),live:true,sc:false}); b.m.visible=true; snd(260,.1,'sine',.07,180); }
    function rimHit(b){ const dx=b.x-HX, dz=b.z-HZ, dh=Math.hypot(dx,dz)||1e-6, cx=HX+dx/dh*RIM, cz=HZ+dz/dh*RIM, ex=b.x-cx, ey=b.y-HY, ez=b.z-cz, d=Math.hypot(ex,ey,ez), m=BRAD+.011; if(d<m && d>1e-6){ const nx=ex/d, ny=ey/d, nz=ez/d; b.x=cx+nx*m; b.y=HY+ny*m; b.z=cz+nz*m; const vn=b.vx*nx+b.vy*ny+b.vz*nz; if(vn<0){ b.vx-=1.55*vn*nx; b.vy-=1.55*vn*ny; b.vz-=1.55*vn*nz; clack(.8); } } }
    function endTurn(){ const o=turnOrder(T); ST.played.push(ST.cur); const nx=o.find(i=>!ST.played.includes(i)); if(nx==null){ ST.phase='done'; ST.bt=T.sess.mode==='demo'?3:0; finish(); } else { ST.phase='between'; ST.bt=2; ST.next=nx; } snd(160,.6,'square',.07,150); }
    function finish(){ if(T!==G || !T.sess.host) return; const my=ST.sc[LOCALSEAT], best=S.brainGames.hoops||0; if(my>best){ S.brainGames.hoops=my; save(); toast(`🏀 Kỷ lục mới: ${my} điểm!`,3000); } const o=turnOrder(T); if(o.length>1 && o.every(i=>i===LOCALSEAT || ST.sc[i]<my)) reward(20,'🏀 Thắng ném rổ! +20 💰'); else if(my>=40) reward(20,'🏀 Ném rổ ≥ 40 điểm! +20 💰'); }
    const T={kind:'hoops', idx, id:'hoops-'+idx, icon:'🏀', title:'Ném bóng rổ', g, seatsMax:4, seatsTxt:'1–4 người lần lượt', r:1.3, botSeat:1, turn:true,
      desc:'Máy ném bóng rổ arcade – lần lượt mỗi người 30 giây (chơi một mình 45 giây). A/D · chuột: ngắm · giữ Space lấy lực, thả để ném. 10 giây cuối mỗi quả 3 điểm.',
      demoSeats:()=>[{k:'idle'},{k:'bot'}], botSeats:()=>[{k:'me'},{k:'bot'}], friendSeats:()=>[{k:'me'},{k:'open'},{k:'open'},{k:'open'}], onJoin(){}, onLeave(si){ if(ST.cur===si) endTurn(); }, onMode(){ T.reset(); },
      reset(){ ST.sc=[0,0,0,0]; ST.played=[]; const o=turnOrder(T); ST.cur=o.length?o[0]:0; ST.t=turnLen(); ST.phase='play'; ST.aim=0; ST.pw=0; ST.charging=false; },
      sim(dt){ if(T.sess.mode==='friends' && !T.sess.started) return; ST.cool-=dt; ST.anim=Math.max(0,ST.anim-dt); const o=turnOrder(T); if(!o.length) return; if(!o.includes(ST.cur)) ST.cur=o[0];
        if(ST.phase==='play'){ ST.t-=dt; if(ST.t<=0){ ST.t=0; endTurn(); } const inp=seatIn(T,ST.cur);
          if(inp){ ST.aim=clamp(ST.aim+inp.ix*.5*dt+inp.mx*.0012,-.22,.22); for(const e of inp.ev){ if(e==='d'){ ST.charging=true; ST.pw=0; ST.pdir=1; } else if(e==='u' && ST.charging){ ST.charging=false; shoot(ST.pw); } } }
          else if(isAI(T,ST.cur)){ ST.bshot-=dt; ST.aim=lerp(ST.aim,0,dt*2); if(ST.bshot<=0 && ST.cool<=0){ ST.bshot=rr(1.2,1.8); shoot(clamp(.5+(rnd()+rnd()-1)*.16,0,1)); } } }
        else if(ST.phase==='between'){ ST.bt-=dt; if(ST.bt<=0){ ST.cur=ST.next; ST.t=turnLen(); ST.phase='play'; ST.aim=0; } }
        else if(ST.phase==='done'){ ST.bt-=dt; const hi=seatIn(T,0); if((T.sess.mode==='demo' && ST.bt<=0) || (hi && hi.ev.includes('d') && T.sess.host)) T.reset(); }
        if(ST.charging){ ST.pw+=ST.pdir*dt/1.1; if(ST.pw>1){ ST.pw=1; ST.pdir=-1; } if(ST.pw<0){ ST.pw=0; ST.pdir=1; } }
        const n=Math.max(1,Math.ceil(dt/.005)), h=dt/n; for(const b of BALLS){ if(!b.live) continue; for(let i=0;i<n;i++){ const py=b.y; b.vy-=GR*h; b.x+=b.vx*h; b.y+=b.vy*h; b.z+=b.vz*h;
            if(b.z<-1.44+BRAD && b.y>HY-.1 && b.y<HY+.66 && Math.abs(b.x)<.5 && b.vz<0){ b.z=-1.44+BRAD; b.vz=-b.vz*.55; thud(.4); } if(Math.abs(b.x)>.6-BRAD){ b.x=Math.sign(b.x)*(.6-BRAD); b.vx*=-.5; }
            rimHit(b); if(!b.sc && py>HY && b.y<=HY && b.vy<0 && Math.hypot(b.x-HX,b.z-HZ)<RIM-BRAD*.35){ b.sc=true; if(ST.phase==='play'){ ST.sc[ST.cur]+=ST.t<=10?3:2; if(T===G){ hudPunch(); } snd(988,.12,'triangle',.09); } ST.swish=1; }
            const fy=1.05+(b.z+.15)*.12; if(b.y<fy+BRAD && b.z>-1.3 && b.z<.95){ b.y=fy+BRAD; b.vy=Math.abs(b.vy)*.35; b.vz=Math.abs(b.vz)*.2+.6; } if(b.z>.9 || b.y<.4){ b.live=false; break; } } }
        ST.swish=Math.max(0,ST.swish-dt*3); },
      draw(){ for(const b of BALLS){ b.m.visible=b.live; if(b.live){ b.m.position.set(b.x,b.y,b.z); b.m.rotation.x-=.13; } } net.scale.set(1,1+ST.swish*.25,1); hold.visible=ST.phase==='play' && ST.cool<=0; hold.position.set(Math.sin(ST.aim)*.2,1.25,.92);
        drawLED(ST.sc[ST.cur]||0, ST.phase==='play'?Math.ceil(ST.t):-1, T.sess.mode==='demo'?'QC SHOOT':seatName(T,ST.cur)); },
      snap:()=>({c:ST.cur, s:ST.sc, t:+ST.t.toFixed(2), ph:ST.phase, a:+ST.aim.toFixed(3), pw:+ST.pw.toFixed(3), ch:ST.charging?1:0, cl:+ST.cool.toFixed(2), sw:+ST.swish.toFixed(2), b:BALLS.map(b=>b.live?[+b.x.toFixed(3),+b.y.toFixed(3),+b.z.toFixed(3)]:0)}),
      unsnap(a){ ST.cur=a.c; ST.sc=a.s; ST.t=a.t; ST.phase=a.ph; ST.aim=a.a; ST.pw=a.pw; ST.charging=!!a.ch; ST.cool=a.cl; ST.swish=a.sw; a.b.forEach((q,i)=>{ const b=BALLS[i]; b.live=!!q; if(q){ [b.x,b.y,b.z]=q; } }); },
      cam(o){ o.pos.copy(wp(g,Math.sin(ST.aim)*.3,1.62,1.85)); o.look.copy(wp(g,Math.sin(ST.aim)*1.2,HY-.1,HZ)); },
      standFor(seat){ const isCur=seat===ST.cur; return st(g,isCur?0:(seat%2?.95:-.95),isCur?1.65:1.95,0); }, inter:()=>wp(g,0,0,1.55),
      hud(seat){ const o=turnOrder(T); return ['🏀 Ném bóng rổ arcade', o.map(i=>`${seatName(T,i)} ${ST.sc[i]}`).join(' · ')+(ST.phase==='play'?` · ⏱ ${Math.ceil(ST.t)} s`:''),
        T.sess.mode==='friends' && !T.sess.started ? `👥 Đang chờ bạn bè vào… còn ${Math.ceil(T.sess.wait)} s · Space: bắt đầu ngay` : ST.phase==='done' ? `Hết giờ! ${T.sess.host?'Space: chơi lại · ':''}Esc: thôi` : ST.phase==='between' ? `Tới lượt ${seatName(T,ST.next)}…` : `${ST.cur===seat?'Lượt BẠN':'Lượt '+seatName(T,ST.cur)} · A/D · chuột: ngắm · giữ Space lấy lực, thả để ném (vạch giữa ≈ chuẩn) · 10 giây cuối 3 điểm`, ST.charging && ST.cur===seat?ST.pw:null]; },
      botPose(bot, seat){ if(seat!==ST.cur) return; const [f,r]=bodyFR(bot), e=ST.anim>0?Math.sin((1-ST.anim/.4)*Math.PI):0, c=new V3(bot.x,F.y+1.15+e*.75,bot.z).addScaledVector(f,.32+e*.1);
        ik(bot.B,'Right',c.clone().addScaledVector(r,.11),new V3(0,-1,0).addScaledVector(r,.7)); ik(bot.B,'Left',c.clone().addScaledVector(r,-.11),new V3(0,-1,0).addScaledVector(r,-.7)); } };
    return reg(T); }

  /* ============================================================================================
     🎳 BOWLING MINI – 1–4 người lần lượt · 5 frame
     ============================================================================================ */
  function buildBowl(slot, idx){ const g=slot.g; const LW=.78, Z0=2.85, ZP=-2.85, BR=.075, PR=.034, LANE_Y=.06;
    const laneT=canvasTex(128,1024,(c,w,h)=>{ for(let i=0;i<16;i++){ c.fillStyle=i%2?'#d8b07a':'#cfa56c'; c.fillRect(i*w/16,0,w/16,h); } c.strokeStyle='rgba(90,55,25,.25)'; for(let y=0;y<h;y+=64){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); } c.fillStyle='#7a1712'; for(let i=0;i<7;i++){ const x=w*(i+1)/8, y=h*.72; c.beginPath(); c.moveTo(x,y-26); c.lineTo(x-7,y); c.lineTo(x+7,y); c.closePath(); c.fill(); } });
    add(g, rb(LW,.08,Z0-ZP+1.0,.01,1), std(0xffffff,.28,0,{map:laneT}), 0,LANE_Y-.04,(Z0+ZP)/2-.2);
    for(const s of [-1,1]){ add(g, new THREE.CylinderGeometry(.07,.07,Z0-ZP+.4,16,1,true,0,Math.PI), M.black, s*(LW/2+.07),LANE_Y-.02,(Z0+ZP)/2,Math.PI/2,0,Math.PI); add(g, rb(.08,.28,Z0-ZP+1.2,.02,1), M.wood, s*(LW/2+.18),.14,(Z0+ZP)/2-.2); }
    add(g, rb(LW+.5,.9,.4,.03,2), M.black, 0,.45,ZP-.75); add(g, rb(LW+.5,.12,.5,.02,1), M.dark, 0,LANE_Y-.06,ZP-.5);
    const capT=canvasTex(512,128,(c,w)=>{ c.fillStyle='#101318'; c.fillRect(0,0,w,128); c.fillStyle='#ffd23f'; c.font='900 54px Segoe UI'; c.textAlign='center'; c.fillText('🎳 QA STRIKE',w/2,80); }); add(g, new THREE.PlaneGeometry(LW+.4,.3), std(0xffffff,.5,0,{map:capT, emissive:0xffffff, emissiveMap:capT, emissiveIntensity:.6}), 0,1.25,ZP-.55,0,0,0,false); add(g, rb(LW+.5,.4,.3,.03,1), M.black, 0,1.25,ZP-.72);
    add(g, new THREE.PlaneGeometry(LW,.02), std(0xc8231c,.5,0,{polygonOffset:true, polygonOffsetFactor:-2}), 0,LANE_Y+.001,Z0,-Math.PI/2,0,0,false);
    add(g, rb(.9,.7,.5,.04,2), M.black, LW/2+.75,.35,Z0+.4); for(let i=0;i<3;i++) add(g, new THREE.SphereGeometry(BR,18,12), std([0x1f5fbf,0xc8231c,0x2e8f57][i],.25,.1), LW/2+.5+i*.2,.78,Z0+.4);
    colRect(slot.g, 0, -.25, LW/2+.25, 3.55, -.4, 1.4, '🎳 Đường bowling'); colRect(slot.g, 1.14, 3.25, .46, .26, -.4, 1.0, '🎳 Giá bóng');
    const pinG=new THREE.LatheGeometry([[0,0],[.02,0],[.03,.04],[.034,.08],[.026,.13],[.014,.17],[.016,.2],[.022,.23],[.014,.26],[0,.265]].map(([x,y])=>new THREE.Vector2(x,y)),16), pinM=std(0xf8f6f0,.25);
    const PINS=[]; { const sp=.13; for(let row=0;row<4;row++) for(let j=0;j<=row;j++){ const x=(j-row/2)*sp, z=ZP-row*sp*.866, m=add(g,pinG,pinM,x,LANE_Y,z); add(m, new THREE.CylinderGeometry(.0262,.0262,.012,14), M.red, 0,.165,0); PINS.push({m,hx:x,hz:z,x,z,vx:0,vz:0,down:false,tilt:0,ta:0,live:true}); } }
    const ballM=add(g,new THREE.SphereGeometry(BR,22,16),std(0x1f5fbf,.18,.15),0,LANE_Y+BR,Z0+.3);
    const ST={cur:0, frame:1, roll:1, frames:[[],[],[],[]], phase:'aim', x:0, ang:0, pw:0, pdir:1, charging:false, b:{x:0,z:Z0+.3,vx:0,vz:0,gutter:false,spin:0}, t:0, msg:'', bt:0, app:0, plan:null};
    function resetPins(all){ for(const p of PINS){ if(all || !p.down){ Object.assign(p,{x:p.hx,z:p.hz,vx:0,vz:0,tilt:0,down:false,live:true}); p.m.visible=true; } else { p.live=false; p.m.visible=false; } p.m.position.set(p.x,LANE_Y,p.z); p.m.rotation.set(0,0,0); } }
    function release(x,ang,pw){ if(ST.phase!=='aim') return; const v=2.2+pw*3.6, an=ang+rr(-.014,.014); ST.b={x:x+rr(-.01,.01), z:Z0+.25, vx:Math.sin(an)*v, vz:-Math.cos(an)*v, gutter:false, spin:(pw-.5)*.25}; ST.phase='roll'; ST.t=0; thud(.8); }
    const knock=(p,vx,vz)=>{ if(!p.down){ p.down=true; p.ta=Math.atan2(vx,vz); clack(1); } };
    function phys(dt){ const n=Math.max(1,Math.ceil(dt/.004)), h=dt/n, b=ST.b; for(let i=0;i<n;i++){ if(ST.phase==='roll'){ b.x+=b.vx*h; b.z+=b.vz*h; b.vx+=b.spin*h*(b.z<0?1.2:.3); const f=1-.05*h; b.vx*=f; b.vz*=f; if(!b.gutter && Math.abs(b.x)>LW/2-BR*.4){ b.gutter=true; b.x=Math.sign(b.x)*(LW/2+.05); b.vx=0; thud(.5); }
          if(!b.gutter) for(const p of PINS){ if(!p.live) continue; const dx=p.x-b.x, dz=p.z-b.z, d=Math.hypot(dx,dz); if(d<BR+PR && d>1e-6){ const nx=dx/d, nz=dz/d, vn=b.vx*nx+b.vz*nz; if(vn>0){ p.vx+=nx*vn*1.45+b.vx*.15; p.vz+=nz*vn*1.45+b.vz*.15; b.vx-=nx*vn*.5; b.vz-=nz*vn*.5; knock(p,p.vx,p.vz); } } } }
        for(const p of PINS){ if(!p.live || (Math.abs(p.vx)+Math.abs(p.vz))<1e-4) continue; p.x+=p.vx*h; p.z+=p.vz*h; const f=1-(p.down?2.2:4)*h; p.vx*=f; p.vz*=f; if(Math.abs(p.x)>LW/2+.05 || p.z<ZP-.6){ p.vx*=.3; p.vz*=.3; knock(p,p.vx,p.vz); } }
        for(let a=0;a<PINS.length;a++){ const A=PINS[a]; if(!A.live) continue; for(let c=a+1;c<PINS.length;c++){ const Bp=PINS[c]; if(!Bp.live) continue; const dx=Bp.x-A.x, dz=Bp.z-A.z, d=Math.hypot(dx,dz), md=A.down||Bp.down?PR*2.6:PR*2; if(d<md && d>1e-6){ const nx=dx/d, nz=dz/d, rv=(A.vx-Bp.vx)*nx+(A.vz-Bp.vz)*nz; if(rv>0){ A.vx-=rv*nx*.8; A.vz-=rv*nz*.8; Bp.vx+=rv*nx*.8; Bp.vz+=rv*nz*.8; if(rv>.34){ knock(A,A.vx,A.vz); knock(Bp,Bp.vx,Bp.vz); } } const o=(md-d)/2; A.x-=nx*o; A.z-=nz*o; Bp.x+=nx*o; Bp.z+=nz*o; } } } }
      for(const p of PINS) if(p.live && p.down) p.tilt=Math.min(Math.PI/2,p.tilt+dt*9); }
    const score=si=>ST.frames[si].reduce((s,f)=>{ const t=f.reduce((a,v)=>a+v,0); return s+t+(f[0]===10?10:(t===10?5:0)); },0);
    function nextPlayer(){ const o=turnOrder(T), k=o.indexOf(ST.cur); ST.roll=1; if(k<0 || k>=o.length-1){ ST.frame++; ST.cur=o[0]; } else ST.cur=o[k+1]; if(ST.frame>5){ ST.phase='done'; ST.bt=T.sess.mode==='demo'?4:0; finish(); return; } resetPins(true); ST.phase='aim'; ST.x=0; ST.ang=0; ST.plan=null; }
    function finish(){ if(T!==G || !T.sess.host) return; const my=score(LOCALSEAT), best=S.brainGames.bowl||0; if(my>best){ S.brainGames.bowl=my; save(); toast(`🎳 Kỷ lục mới: ${my} điểm!`,3000); } const o=turnOrder(T); if(o.length>1 && o.every(i=>i===LOCALSEAT || score(i)<my)) reward(20,'🎳 Thắng bowling! +20 💰'); else if(my>=60) reward(20,'🎳 Bowling ≥ 60 điểm! +20 💰'); }
    const T={kind:'bowl', idx, id:'bowl-'+idx, icon:'🎳', title:'Bowling mini', g, seatsMax:4, seatsTxt:'1–4 người lần lượt', r:1.3, botSeat:1, turn:true,
      desc:'Bowling mini 5 frame, lần lượt từng người. A/D: vị trí · W/S: góc lăn · giữ Space lấy lực, thả để lăn. Strike +10, spare +5.',
      demoSeats:()=>[{k:'idle'},{k:'bot'}], botSeats:()=>[{k:'me'},{k:'bot'}], friendSeats:()=>[{k:'me'},{k:'open'},{k:'open'},{k:'open'}], onJoin(){}, onLeave(si){ if(ST.cur===si && ST.phase==='aim') nextPlayer(); }, onMode(){ T.reset(); },
      reset(){ ST.frame=1; ST.roll=1; ST.frames=[[],[],[],[]]; ST.phase='aim'; const o=turnOrder(T); ST.cur=o.length?o[0]:0; ST.x=0; ST.ang=0; ST.plan=null; resetPins(true); },
      sim(dt){ if(T.sess.mode==='friends' && !T.sess.started) return; const o=turnOrder(T); if(!o.length) return; if(!o.includes(ST.cur)) ST.cur=o[0];
        if(ST.phase==='done'){ ST.bt-=dt; const hi=seatIn(T,0); if((T.sess.mode==='demo' && ST.bt<=0) || (hi && hi.ev.includes('d') && T.sess.host)) T.reset(); return; }
        const inp=seatIn(T,ST.cur);
        if(ST.phase==='aim'){ if(inp){ ST.x=clamp(ST.x+inp.ix*.5*dt+inp.mx*.0008,-LW/2+BR+.02,LW/2-BR-.02); ST.ang=clamp(ST.ang-inp.iz*.12*dt,-.07,.07); for(const e of inp.ev){ if(e==='d'){ ST.charging=true; ST.pw=0; ST.pdir=1; } else if(e==='u' && ST.charging){ ST.charging=false; release(ST.x,ST.ang,ST.pw); } } }
          else if(isAI(T,ST.cur)){ if(!ST.plan) ST.plan={x:rr(-.12,.12), ang:rr(-.02,.02), pw:clamp(rr(.45,.9),0,1), t:0}; const pl=ST.plan; pl.t+=dt; ST.x=lerp(ST.x,pl.x,1-Math.exp(-dt*3)); ST.ang=pl.ang; ST.app=clamp((pl.t-1.2)/.8,0,1); if(pl.t>2.0){ ST.app=0; release(ST.x,ST.ang,pl.pw); ST.plan=null; } } }
        if(ST.charging){ ST.pw+=ST.pdir*dt/1.2; if(ST.pw>1){ ST.pw=1; ST.pdir=-1; } if(ST.pw<0){ ST.pw=0; ST.pdir=1; } }
        phys(dt);
        if(ST.phase==='roll'){ ST.t+=dt; const b=ST.b; if(b.z<ZP-.55 || Math.hypot(b.vx,b.vz)<.08 || ST.t>8){ ST.phase='settle'; ST.t=0; } }
        else if(ST.phase==='settle'){ ST.t+=dt; if(ST.t>1.6){ const down=PINS.filter(p=>p.live && p.down).length, fr=ST.frames[ST.cur][ST.frame-1]||(ST.frames[ST.cur][ST.frame-1]=[]); fr.push(down); const tot=fr.reduce((s,v)=>s+v,0);
            if(ST.roll===1 && down===10){ ST.msg=`🎳 STRIKE! (${seatName(T,ST.cur)})`; if(T===G){ cheer(); hudPunch(); } nextPlayer(); } else if(ST.roll===2){ ST.msg=tot===10?`✨ SPARE! (${seatName(T,ST.cur)})`:`${tot} ky (${seatName(T,ST.cur)})`; if(tot===10 && T===G) hudPunch(); nextPlayer(); } else { ST.msg=`${down} ky – lăn tiếp`; ST.roll=2; resetPins(false); ST.phase='aim'; } } } },
      draw(){ for(const p of PINS){ p.m.visible=p.live; if(!p.live) continue; p.m.position.set(p.x,LANE_Y+Math.sin(p.tilt)*.03,p.z); p.m.rotation.set(Math.cos(p.ta)*p.tilt,0,-Math.sin(p.ta)*p.tilt,'YXZ'); }
        const b=ST.b, aim=ST.phase==='aim'; if(aim && T.bot && T.bot.seat===ST.cur && isAI(T,ST.cur) && T.bot.B.RightHand && T.bot.a.g.visible){ const hp=new V3(); T.bot.B.RightHand.getWorldPosition(hp); g.worldToLocal(hp); ballM.position.copy(hp); }
        else ballM.position.set(aim?ST.x:b.x, b.gutter?LANE_Y+.01:LANE_Y+BR, aim?Z0+.3:b.z); if(ST.phase==='roll') ballM.rotation.x-=b.vz*.016/BR; },
      snap:()=>({c:ST.cur, f:ST.frame, r:ST.roll, fr:ST.frames, ph:ST.phase, x:+ST.x.toFixed(3), an:+ST.ang.toFixed(3), pw:+ST.pw.toFixed(3), ch:ST.charging?1:0, m:ST.msg, b:[ST.b.x,ST.b.z,ST.b.vz,ST.b.gutter?1:0].map(v=>+(+v).toFixed(3)), p:PINS.map(p=>[+p.x.toFixed(3),+p.z.toFixed(3),p.down?1:0,+p.tilt.toFixed(2),+p.ta.toFixed(2),p.live?1:0])}),
      unsnap(a){ ST.cur=a.c; ST.frame=a.f; ST.roll=a.r; ST.frames=a.fr; ST.phase=a.ph; ST.x=a.x; ST.ang=a.an; ST.pw=a.pw; ST.charging=!!a.ch; ST.msg=a.m; [ST.b.x,ST.b.z,ST.b.vz]=a.b; ST.b.gutter=!!a.b[3]; a.p.forEach((q,i)=>{ const p=PINS[i]; [p.x,p.z]=q; p.down=!!q[2]; p.tilt=q[3]; p.ta=q[4]; p.live=!!q[5]; }); },
      cam(o){ const b=ST.b, fol=ST.phase==='roll'||ST.phase==='settle', z=fol?Math.max(ZP+1.6,b.z+1.1):Z0+1.2, x=fol?b.x*.6:ST.x; o.pos.copy(wp(g,x,fol?.85:1.15,z)); o.look.copy(wp(g,x*.5+Math.sin(ST.ang)*2*(fol?0:1),LANE_Y+.1,fol?ZP:Z0-3)); },
      standFor(seat){ const isCur=seat===ST.cur; return st(g,isCur?ST.x:(seat%2?.85:-.85),isCur?Z0+.75-(ST.app||0)*.55:Z0+1.15,0); }, inter:()=>wp(g,0,0,Z0+.7),
      hud(seat){ const o=turnOrder(T); return ['🎳 Bowling mini · 5 frame', `Frame ${Math.min(5,ST.frame)}/5 · `+o.map(i=>`${seatName(T,i)} ${score(i)}`).join(' · '),
        T.sess.mode==='friends' && !T.sess.started ? `👥 Đang chờ bạn bè vào… còn ${Math.ceil(T.sess.wait)} s · Space: bắt đầu ngay` : ST.phase==='done' ? `Xong 5 frame! ${T.sess.host?'Space: chơi lại · ':''}Esc: thôi` : `${ST.msg?ST.msg+' · ':''}${ST.cur===seat?'Lượt BẠN':'Lượt '+seatName(T,ST.cur)} · A/D: vị trí · W/S: góc · giữ Space lấy lực, thả để lăn`, ST.charging && ST.cur===seat?ST.pw:null]; },
      botPose(bot, seat){ if(seat!==ST.cur || ST.phase!=='aim') return; const [f,r]=bodyFR(bot), e=ST.app||0, sw=Math.sin(e*Math.PI*1.5);
        lean(bot,.15+e*.4); ik(bot.B,'Right',new V3(bot.x,F.y+.55-e*.25,bot.z).addScaledVector(f,-.25+sw*.6).addScaledVector(r,.22),new V3(0,0,0).addScaledVector(f,1).addScaledVector(r,.3)); ik(bot.B,'Left',new V3(bot.x,F.y+1.0,bot.z).addScaledVector(r,-.45).addScaledVector(f,.1),hintOut(bot,-1)); } };
    return reg(T); }

  /* ============================================================================================
     ⛳ GOLF MINI 3 LỖ – 1–4 người lần lượt (mỗi lỗ từng người đánh tới khi vào lỗ / tối đa 7 gậy)
     ============================================================================================ */
  function buildGolf(slot, idx){ const g=slot.g; const LW=.95, LL=5.4, BR=.0215, CUP=.054, Y0=.07, GV=9.8, TEE=2.35, CUPZ=-2.2, YO=.006;
    const HOLES=[ {x:-1.07, par:2, name:'Đồi nhỏ', h:(x,z)=>.075*Math.exp(-(z*z)/.14)+.012*Math.exp(-((z+1.4)**2)/.3)*(1+Math.sin(x*4)), blocks:[]},
      {x:0, par:3, name:'Zig-zag', h:(x,z)=>.02+.018*Math.sin(z*1.3)*x*2, blocks:[[-.22,1.05,.52,.1],[.22,.05,.52,.1],[-.22,-.95,.52,.1]]},
      {x:1.07, par:3, name:'Cối xay gió', h:(x,z)=>{ const d=Math.hypot(x,z-CUPZ); return .055*Math.exp(-d*d/.2); }, blocks:[], mill:{z:.15, len:.43, w:1.9}} ];
    const turf=canvasTex(128,512,(c,w,h)=>{ c.fillStyle='#2f8f43'; c.fillRect(0,0,w,h); for(let i=0;i<7000;i++){ c.fillStyle=`rgba(${20+Math.random()*30|0},${90+Math.random()*60|0},${30+Math.random()*30|0},.5)`; c.fillRect(Math.random()*w,Math.random()*h,1,2); } }); turf.wrapS=turf.wrapT=THREE.RepeatWrapping; turf.repeat.set(1,2);
    const turfM=std(0xffffff,.95,0,{map:turf}); add(g, rb(3.5,Y0,LL+.5,.02,1), M.wood, 0,Y0/2,0);
    for(const [hi,H] of HOLES.entries()){ const pg=new THREE.PlaneGeometry(LW,LL,8,60); pg.rotateX(-Math.PI/2); const pa=pg.attributes.position; for(let i=0;i<pa.count;i++) pa.setY(i, Y0+YO+H.h(pa.getX(i),pa.getZ(i))); pg.computeVertexNormals(); add(g, pg, turfM, H.x,0,0,0,0,0,false);
      for(const s2 of [-1,1]) add(g, rb(.06,.09,LL+.06,.015,1), M.woodL, H.x+s2*(LW/2+.03), Y0+.045, 0); for(const e of [-1,1]) add(g, rb(LW+.12,.09,.06,.015,1), M.woodL, H.x, Y0+.045, e*(LL/2+.03));
      add(g, new THREE.PlaneGeometry(.3,.22), std(0x1d5a2a,.9), H.x, Y0+H.h(0,TEE)+.009, TEE, -Math.PI/2,0,0,false); add(g, new THREE.CircleGeometry(CUP,24), std(0x050505,.9), H.x, Y0+H.h(0,CUPZ)+.008, CUPZ, -Math.PI/2,0,0,false); add(g, new THREE.CylinderGeometry(.005,.005,.62,6), M.steel, H.x, Y0+H.h(0,CUPZ)+.31, CUPZ);
      const fT=canvasTex(64,48,(c,w,h)=>{ c.fillStyle=['#e63946','#ffd23f','#4fc3ff'][hi]; c.fillRect(0,0,w,h); c.fillStyle='#111'; c.font='900 34px Segoe UI'; c.textAlign='center'; c.fillText(String(hi+1),w/2,37); }); add(g, new THREE.PlaneGeometry(.16,.12), std(0xffffff,.6,0,{map:fT, side:THREE.DoubleSide}), H.x+.083, Y0+H.h(0,CUPZ)+.55, CUPZ, 0,0,0,false);
      for(const [bx,bz,bw,bd] of H.blocks) add(g, rb(bw,.1,bd,.02,1), M.red, H.x+bx, Y0+H.h(bx,bz)+.05, bz);
      if(H.mill){ const mz=H.mill.z, hy=Y0+H.h(0,mz); add(g, new THREE.CylinderGeometry(.05,.06,.16,14), M.wood, H.x, hy+.08, mz); add(g, new THREE.ConeGeometry(.08,.1,14), M.red, H.x, hy+.21, mz);
        H.bar=add(g, rb(H.mill.len*2,.035,.04,.012,1), M.woodL, H.x, hy+.03, mz); H.blades=new THREE.Group(); H.blades.position.set(H.x, hy+.2, mz+.07); g.add(H.blades); for(let k=0;k<4;k++){ const piv=new THREE.Group(); piv.rotation.z=k*Math.PI/2; const bl=new THREE.Mesh(new THREE.BoxGeometry(.02,.22,.005),M.white); bl.position.y=.11; piv.add(bl); H.blades.add(piv); } } }
    const sign=canvasTex(512,96,(c,w)=>{ c.fillStyle='#14321c'; c.fillRect(0,0,w,96); c.fillStyle='#ffd23f'; c.font='900 46px Segoe UI'; c.textAlign='center'; c.fillText('⛳ MINI GOLF · 3 LỖ',w/2,62); });
    add(g, new THREE.PlaneGeometry(1.8,.34), std(0xffffff,.5,0,{map:sign, emissive:0xffffff, emissiveMap:sign, emissiveIntensity:.4}), 0,1.35,-LL/2-.18,0,0,0,false); add(g, rb(1.9,.42,.06,.02,1), M.black, 0,1.35,-LL/2-.22); for(const s2 of [-.85,.85]) add(g, rb(.06,1.3,.06,.015,1), M.black, s2,.65,-LL/2-.22);
    colRect(slot.g, 0, 0, 1.78, LL/2+.3, -.4, .45, '⛳ Sân golf mini');
    const ball=add(g, new THREE.SphereGeometry(BR,16,12), M.white, HOLES[0].x, Y0+BR, TEE);
    const aimL=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]), new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:.7})); g.add(aimL); aimL.visible=false;
    const putter=new THREE.Group(); { add(putter, new THREE.CylinderGeometry(.007,.007,.82,8), M.steel, 0,.41,0); add(putter, rb(.1,.025,.03,.008,1), M.black, 0,.01,0); add(putter, new THREE.CylinderGeometry(.012,.012,.2,8), M.rubber, 0,.78,0); } putter.visible=false; g.add(putter);
    const ST={hole:0, cur:0, strokes:0, card:[[],[],[],[]], phase:'aim', aim:-Math.PI/2, pw:0, pdir:1, charging:false, b:{x:0,z:TEE,vx:0,vz:0}, t:0, msg:'', mill:0, swing:0, plan:null, done:[]};
    const H0=()=>HOLES[ST.hole];
    function putBall(){ ST.b={x:0,z:TEE,vx:0,vz:0}; ST.aim=-Math.PI/2; ST.phase='aim'; ST.strokes=0; ST.plan=null; ST.msg=`Lỗ ${ST.hole+1}: ${H0().name} · par ${H0().par} · ${seatName(T,ST.cur)} đánh`; }
    function stroke(pw){ if(ST.phase!=='aim') return; const v=.35+pw*2.9; ST.b.vx=Math.cos(ST.aim)*v; ST.b.vz=Math.sin(ST.aim)*v; ST.strokes++; ST.phase='roll'; ST.t=0; ST.swing=.5; clack(.5+pw*.6); }
    const millSeg=H=>{ const a=ST.mill*H.mill.w, c=Math.cos(a)*H.mill.len, sn=Math.sin(a)*H.mill.len; return [-c,H.mill.z-sn,c,H.mill.z+sn]; };
    function phys(dt){ const H=H0(), b=ST.b, n=Math.max(1,Math.ceil(dt/.003)), hh=dt/n, e=.004;
      for(let k=0;k<n;k++){ const gx=-(H.h(b.x+e,b.z)-H.h(b.x-e,b.z))/(2*e), gz=-(H.h(b.x,b.z+e)-H.h(b.x,b.z-e))/(2*e); b.vx+=gx*GV*.7*hh; b.vz+=gz*GV*.7*hh; const sp=Math.hypot(b.vx,b.vz); if(sp>0){ const ns=Math.max(0,sp-.5*hh); b.vx*=ns/sp; b.vz*=ns/sp; } b.x+=b.vx*hh; b.z+=b.vz*hh;
        const xw=LW/2-BR, zw=LL/2-BR; if(Math.abs(b.x)>xw){ b.x=Math.sign(b.x)*xw; b.vx*=-.62; tick(Math.abs(b.vx)); } if(Math.abs(b.z)>zw){ b.z=Math.sign(b.z)*zw; b.vz*=-.62; tick(Math.abs(b.vz)); }
        for(const [bx,bz,bw,bd] of H.blocks){ const cx=clamp(b.x,bx-bw/2,bx+bw/2), cz=clamp(b.z,bz-bd/2,bz+bd/2), dx=b.x-cx, dz=b.z-cz, d=Math.hypot(dx,dz); if(d<BR && d>1e-6){ const nx=dx/d, nz=dz/d; b.x=cx+nx*BR; b.z=cz+nz*BR; const vn=b.vx*nx+b.vz*nz; if(vn<0){ b.vx-=1.62*vn*nx; b.vz-=1.62*vn*nz; thud(.3); } } }
        if(H.mill){ const [ax,az,bx2,bz2]=millSeg(H), ex=bx2-ax, ez=bz2-az, L2=ex*ex+ez*ez; const t=clamp(((b.x-ax)*ex+(b.z-az)*ez)/L2,0,1), cx=ax+ex*t, cz=az+ez*t, dx=b.x-cx, dz=b.z-cz, d=Math.hypot(dx,dz), m=BR+.02;
          if(d<m && d>1e-6){ const nx=dx/d, nz=dz/d; b.x=cx+nx*m; b.z=cz+nz*m; const w=H.mill.w, pvx=-w*(cz-H.mill.z), pvz=w*cx, rvn=(b.vx-pvx)*nx+(b.vz-pvz)*nz; if(rvn<0){ b.vx-=1.5*rvn*nx; b.vz-=1.5*rvn*nz; clack(.5); } }
          const hd=Math.hypot(b.x,b.z-H.mill.z); if(hd<BR+.06 && hd>1e-6){ const nx=b.x/hd, nz=(b.z-H.mill.z)/hd; b.x=nx*(BR+.06); b.z=H.mill.z+nz*(BR+.06); const vn=b.vx*nx+b.vz*nz; if(vn<0){ b.vx-=1.6*vn*nx; b.vz-=1.6*vn*nz; } } }
        const dc=Math.hypot(b.x,b.z-CUPZ); if(dc<CUP){ const s2=Math.hypot(b.vx,b.vz); if(s2<1.25){ ST.phase='sunk'; ST.t=0; b.vx=b.vz=0; b.x=0; b.z=CUPZ; snd(660,.12,'triangle',.08); setTimeout(()=>snd(990,.14,'triangle',.08),110); const d=ST.strokes-H0().par; if(T===G){ if(d<0) cheer(); hudPunch(); } ST.msg=(ST.strokes===1?'🎉 HOLE IN ONE!':d<0?'🐦 Birdie!':d===0?'👍 Par':`+${d}`)+` (${seatName(T,ST.cur)})`; return; } else { b.vx*=.72; b.vz*=.72; } } } }
    const total=si=>ST.card[si].reduce((s,v)=>s+v,0);
    function nextGolfer(){ const o=turnOrder(T); ST.card[ST.cur][ST.hole]=ST.strokes; ST.done.push(ST.cur); const nx=o.find(i=>!ST.done.includes(i)); if(nx!=null){ ST.cur=nx; putBall(); return; } ST.done=[]; if(ST.hole<2){ ST.hole++; ST.cur=o[0]; putBall(); return; } ST.phase='done'; ST.t=T.sess.mode==='demo'?4:0; finish(); }
    function finish(){ if(T!==G || !T.sess.host) return; const my=total(LOCALSEAT), best=S.brainGames.golf; if(!best || my<best){ S.brainGames.golf=my; save(); toast(`⛳ Kỷ lục mới: ${my} gậy!`,3000); } const o=turnOrder(T); if(o.length>1 && o.every(i=>i===LOCALSEAT || total(i)>my)) reward(20,'⛳ Thắng golf mini! +20 💰'); else if(my<=8) reward(20,'⛳ Golf mini ≤ par! +20 💰'); }
    const T={kind:'golf', idx, id:'golf-'+idx, icon:'⛳', title:'Golf mini', g, seatsMax:4, seatsTxt:'1–4 người lần lượt', r:1.6, botSeat:1, turn:true,
      desc:'Golf mini 3 lỗ (đồi nhỏ · vách zig-zag · cối xay gió quay), lần lượt từng người. A/D · chuột: ngắm (Shift = tinh) · giữ Space lấy lực, thả để đánh. Ít gậy nhất thắng.',
      demoSeats:()=>[{k:'idle'},{k:'bot'}], botSeats:()=>[{k:'me'},{k:'bot'}], friendSeats:()=>[{k:'me'},{k:'open'},{k:'open'},{k:'open'}], onJoin(){}, onLeave(si){ if(ST.cur===si) nextGolfer(); }, onMode(){ T.reset(); },
      reset(){ ST.hole=0; ST.card=[[],[],[],[]]; ST.done=[]; const o=turnOrder(T); ST.cur=o.length?o[0]:0; putBall(); },
      sim(dt){ ST.mill+=dt; ST.swing=Math.max(0,ST.swing-dt); if(T.sess.mode==='friends' && !T.sess.started) return; const o=turnOrder(T); if(!o.length) return; if(!o.includes(ST.cur)){ ST.cur=o[0]; putBall(); }
        if(ST.phase==='done'){ ST.t-=dt; const hi=seatIn(T,0); if((T.sess.mode==='demo' && ST.t<=0) || (hi && hi.ev.includes('d') && T.sess.host)) T.reset(); return; }
        const inp=seatIn(T,ST.cur);
        if(ST.phase==='aim'){ if(inp){ ST.aim+=(-inp.ix*(inp.boost?.25:1.2)*dt)+inp.mx*.0016; for(const e of inp.ev){ if(e==='d'){ ST.charging=true; ST.pw=0; ST.pdir=1; } else if(e==='u' && ST.charging){ ST.charging=false; stroke(ST.pw); } } }
          else if(isAI(T,ST.cur)){ if(!ST.plan){ const b=ST.b, d=Math.hypot(b.x,CUPZ-b.z), want=Math.atan2(CUPZ-b.z,-b.x), v=Math.sqrt(2*.5*d)+.35; ST.plan={a:want+rr(-.06,.06), pw:clamp((v-.35)/2.9+rr(-.04,.06),.05,1), t:0}; } const pl=ST.plan; pl.t+=dt; ST.aim=lerpA(ST.aim,pl.a,1-Math.exp(-dt*3)); if(pl.t>1.6){ stroke(pl.pw); ST.plan=null; } } }
        if(ST.charging){ ST.pw+=ST.pdir*dt/1.3; if(ST.pw>1){ ST.pw=1; ST.pdir=-1; } if(ST.pw<0){ ST.pw=0; ST.pdir=1; } }
        if(ST.phase==='roll'){ phys(dt); ST.t+=dt; const b=ST.b, sp=Math.hypot(b.vx,b.vz); if(ST.phase==='roll' && ((sp<.02 && ST.t>.4) || ST.t>15)){ b.vx=b.vz=0; if(ST.strokes>=7){ ST.phase='sunk'; ST.t=0; ST.msg='Nhặt bóng (tối đa 7 gậy)'; } else { ST.phase='aim'; ST.aim=Math.atan2(CUPZ-b.z,-b.x); } } }
        else if(ST.phase==='sunk'){ ST.t+=dt; if(ST.t>1.6) nextGolfer(); } },
      draw(){ for(const H of HOLES) if(H.mill){ H.bar.rotation.y=-ST.mill*H.mill.w; H.blades.rotation.z=ST.mill*2.5; } const H=H0(), b=ST.b, X=H.x+b.x, Y=Y0+YO+H.h(b.x,b.z)+BR; ball.position.set(X, ST.phase==='sunk'?Y-Math.min(.05,ST.t*.12):Y, b.z);
        const mine=G===T && ST.cur===LOCALSEAT; aimL.visible=mine && ST.phase==='aim'; if(aimL.visible){ const pa=aimL.geometry.attributes.position, Ln=.25+ST.pw*.9; pa.setXYZ(0,X,Y,b.z); pa.setXYZ(1,X+Math.cos(ST.aim)*Ln,Y,b.z+Math.sin(ST.aim)*Ln); pa.needsUpdate=true; }
        const bp=T.bot && T.bot.seat===ST.cur && isAI(T,ST.cur) && T.bot.a.g.visible && (ST.phase==='aim'||ST.swing>0); putter.visible=!!bp; if(bp){ const dx=Math.cos(ST.aim), dz=Math.sin(ST.aim), sw=(ST.plan?Math.sin(clamp(ST.plan.t/1.6,0,1)*Math.PI)*-.12:0)+ST.swing*.25; putter.position.set(X-dx*(.05-sw),Y0+H.h(b.x,b.z)+.01,b.z-dz*(.05-sw)); putter.rotation.set(0,Math.atan2(dx,dz),0); putter.rotateX(-.25); } },
      snap:()=>({h:ST.hole, c:ST.cur, s:ST.strokes, cd:ST.card, ph:ST.phase, a:+ST.aim.toFixed(3), pw:+ST.pw.toFixed(3), ch:ST.charging?1:0, b:[+ST.b.x.toFixed(3),+ST.b.z.toFixed(3)], m:ST.msg, mi:+ST.mill.toFixed(2), t:+ST.t.toFixed(2)}),
      unsnap(a){ ST.hole=a.h; ST.cur=a.c; ST.strokes=a.s; ST.card=a.cd; ST.phase=a.ph; ST.aim=a.a; ST.pw=a.pw; ST.charging=!!a.ch; ST.b.x=a.b[0]; ST.b.z=a.b[1]; ST.msg=a.m; ST.mill=a.mi; ST.t=a.t; },
      cam(o){ const H=H0(), b=ST.b, dx=Math.cos(ST.aim), dz=Math.sin(ST.aim), X=H.x+b.x; o.pos.copy(wp(g,X-dx*.95,Y0+.62,b.z-dz*.95)); o.look.copy(wp(g,X+dx*.9,Y0,b.z+dz*.9)); },
      standFor(seat){ const H=H0(), b=ST.b; if(seat===ST.cur){ const dx=Math.cos(ST.aim), dz=Math.sin(ST.aim), px=-dz, pz=dx; const p=wp(g,H.x+b.x+px*.42,0,b.z+pz*.42), q=wp(g,H.x+b.x,0,b.z); return {x:p.x, z:p.z, yaw:Math.atan2(q.x-p.x,q.z-p.z)}; } return st(g,(seat%2?1:-1)*2.15,LL/2+.4,Math.PI); },
      exitSpot(){ return st(g,0,LL/2+.7,Math.PI); }, inter:()=>wp(g,0,0,LL/2+.65),
      hud(seat){ const o=turnOrder(T); return ['⛳ Golf mini · 3 lỗ · par 8', ST.phase==='done'?o.map(i=>`${seatName(T,i)} ${total(i)} gậy`).join(' · '):`Lỗ ${ST.hole+1}/3 · ${seatName(T,ST.cur)} gậy ${ST.strokes} · `+o.map(i=>`${seatName(T,i)} ${total(i)}`).join(' · '),
        T.sess.mode==='friends' && !T.sess.started ? `👥 Đang chờ bạn bè vào… còn ${Math.ceil(T.sess.wait)} s · Space: bắt đầu ngay` : ST.phase==='done' ? `Xong 3 lỗ! ${T.sess.host?'Space: chơi lại · ':''}Esc: thôi` : `${ST.msg?ST.msg+' · ':''}${ST.cur===seat?'A/D · chuột: ngắm (Shift = tinh) · giữ Space lấy lực, thả để đánh':'đang xem '+seatName(T,ST.cur)+' đánh'}`, ST.charging && ST.cur===seat?ST.pw:null]; },
      botPose(bot, seat){ if(seat!==ST.cur || !putter.visible) return; const gp=new V3(0,.78,0); putter.updateMatrixWorld(true); putter.localToWorld(gp); const [f,r]=bodyFR(bot); lean(bot,.35); ik(bot.B,'Right',gp.clone().addScaledVector(r,.03),hintOut(bot,1)); ik(bot.B,'Left',gp.clone().add(new V3(0,.06,0)).addScaledVector(r,-.03),hintOut(bot,-1)); } };
    return reg(T); }

  /* ============================================================================================
     🎱 BIDA 3 BI (carom) – nhận 2 bàn có sẵn của tầng (archKit.buildBilliardTable); ghế 0 = bi trắng, ghế 1 = bi vàng
     ============================================================================================ */
  function takeBilliards(max){ const out=[]; const its=(INTER||[]).filter(i=>/Đánh một cơ Bida/.test(String(i.label||'')) && Math.hypot(i.x-F.cx,i.z-F.cz)<32 && Math.abs((i.y??F.y)-F.y)<4)
      .sort((a,b)=>((Math.atan2(a.z-F.cz,a.x-F.cx)-F.A0+TAU*2)%TAU)-((Math.atan2(b.z-F.cz,b.x-F.cx)-F.A0+TAU*2)%TAU));
    for(const it of its){ if(out.length>=max){ it.when=()=>false; continue; } let tbl=null; scene.traverse(o=>{ if(tbl || !o.isGroup) return; const w=new V3(); o.getWorldPosition(w); if(Math.hypot(w.x-it.x,w.z-it.z)>.06 || Math.abs(w.y-F.y)>.5) return; const balls=o.children.filter(c=>c.isMesh && c.geometry && c.geometry.parameters && Math.abs((c.geometry.parameters.radius||0)-.031)<1e-4); if(balls.length===3) tbl={g:o, balls}; });
      if(!tbl) continue; for(const b of tbl.balls) if(!b.parent) tbl.g.add(b); const T=billiard(tbl, out.length); it.when=()=>false; out.push(T); }
    return out; }
  function billiard(tbl, idx){ const g=tbl.g, L=2.84, Wd=1.42, H=.78, R=.031, HX=L/2-.16-R, HZ=Wd/2-.16-R, BY=H+.03+R;
    const B=tbl.balls.map((m,i)=>({m, x:m.position.x, z:m.position.z, vx:0, vz:0, i})), HOME=B.map(b=>[b.x,b.z]);
    const cue=new THREE.Mesh(new THREE.CylinderGeometry(.006,.014,1.45,12), std(0xd8b27a,.35)); cue.visible=false; g.add(cue); const tip=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.012,10), std(0x3a6ea5,.6)); cue.add(tip); tip.position.y=.725;
    const aimLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(),new V3(),new V3()]), new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:.6})); aimLine.visible=false; g.add(aimLine);
    const ghost=new THREE.Mesh(new THREE.SphereGeometry(R,12,8), new THREE.MeshBasicMaterial({color:0xffffff, wireframe:true, transparent:true, opacity:.5})); ghost.visible=false; g.add(ghost);
    const ST={turn:0, score:[0,0], phase:'aim', aim:Math.PI, pw:0, pdir:1, charging:false, hits:new Set(), t:0, plan:null, msg:'', stroke:0};
    function sim3(st3, dt, onHit){ const n=Math.max(1,Math.ceil(dt/.004)), h=dt/n; let moving=false; for(let k=0;k<n;k++){ for(const b of st3){ if(!b.vx && !b.vz) continue; b.x+=b.vx*h; b.z+=b.vz*h; if(Math.abs(b.x)>HX){ b.x=Math.sign(b.x)*HX; b.vx*=-.86; onHit && onHit(b.i,-1,Math.abs(b.vx)); } if(Math.abs(b.z)>HZ){ b.z=Math.sign(b.z)*HZ; b.vz*=-.86; onHit && onHit(b.i,-1,Math.abs(b.vz)); } const sp=Math.hypot(b.vx,b.vz); if(sp>0){ const ns=Math.max(0,sp-.42*h); if(ns<.004){ b.vx=b.vz=0; } else { b.vx*=ns/sp; b.vz*=ns/sp; } } }
        for(let i=0;i<3;i++) for(let j=i+1;j<3;j++){ const A=st3[i], C2=st3[j], dx=C2.x-A.x, dz=C2.z-A.z, d=Math.hypot(dx,dz); if(d<2*R && d>1e-6){ const nx=dx/d, nz=dz/d, rv=(A.vx-C2.vx)*nx+(A.vz-C2.vz)*nz; if(rv>0){ A.vx-=rv*.98*nx; A.vz-=rv*.98*nz; C2.vx+=rv*.98*nx; C2.vz+=rv*.98*nz; onHit && onHit(i,j,rv); } const o=(2*R-d)/2; A.x-=nx*o; A.z-=nz*o; C2.x+=nx*o; C2.z+=nz*o; } } }
      for(const b of st3) if(b.vx||b.vz) moving=true; return moving; }
    function shoot(a,pw){ const c=B[ST.turn], v=.5+pw*3.6; c.vx=Math.cos(a)*v; c.vz=Math.sin(a)*v; ST.hits=new Set(); ST.phase='roll'; ST.t=0; ST.stroke=.25; clack(.6+pw); }
    function evalShot(){ const ok=ST.hits.size>=2, who=seatName(T,ST.turn); if(ok){ ST.score[ST.turn]++; ST.msg=`✅ ${who} chạm 2 bi – +1, đánh tiếp`; if(T===G){ (ST.turn===LOCALSEAT?cheer:boo)(); hudPunch(); } } else { ST.msg=`❌ ${who} chưa chạm đủ 2 bi – đổi lượt`; ST.turn=1-ST.turn; }
      if(ST.score[0]>=5 || ST.score[1]>=5){ ST.phase='over'; ST.t=T.sess.mode==='demo'?4:0; if(T===G && T.sess.host && ST.score[LOCALSEAT]>=5) reward(30,'🎱 Thắng bida 3 bi! +30 💰'); return; }
      ST.phase='aim'; ST.t=0; ST.plan=null; const c=B[ST.turn], tg=B[2]; ST.aim=Math.atan2(tg.z-c.z,tg.x-c.x); }
    function botPlan(ci){ const others=[0,1,2].filter(i=>i!==ci); let best=null; const base=B.map(b=>({x:b.x,z:b.z,vx:0,vz:0,i:b.i}));
      for(let k=0;k<60;k++){ const tg=B[others[k%2]], a0=Math.atan2(tg.z-B[ci].z,tg.x-B[ci].x), a=k<20?a0+rr(-.12,.12):rr(0,TAU), pw=rr(.35,.95), s3=base.map(b=>({...b})), hit=new Set(); s3[ci].vx=Math.cos(a)*(.5+pw*3.6); s3[ci].vz=Math.sin(a)*(.5+pw*3.6);
        for(let s=0;s<200 && sim3(s3,1/60,(i,j)=>{ if(j>=0 && (i===ci||j===ci)) hit.add(i===ci?j:i); });s++); const sc=hit.size*10+(hit.size>=2?5:0)-pw; if(!best || sc>best.sc) best={a,pw,sc}; if(hit.size>=2 && rnd()<.35) break; }
      return {a:best.a+rr(-.025,.025), pw:best.pw, t:0}; }
    const T={kind:'bida', idx, id:'bida-'+idx, icon:'🎱', title:'Bida 3 bi', g, seatsMax:2, seatsTxt:'2 người', r:2.3, botSeat:1, turn:false,
      desc:'Bida 3 bi (carom): bi của bạn chạm cả 2 bi còn lại = 1 điểm và đánh tiếp. A/D · chuột: xoay cơ (Shift = tinh) · giữ Space lấy lực, thả để đánh. Chạm 5.',
      demoSeats:()=>[{k:'bot'},{k:'bot'}], botSeats:()=>[{k:'me'},{k:'bot'}], friendSeats:()=>[{k:'me'},{k:'open'}], onJoin(){ T.reset(); },
      reset(){ B.forEach((b,i)=>{ b.x=HOME[i][0]; b.z=HOME[i][1]; b.vx=b.vz=0; }); ST.turn=0; ST.score=[0,0]; ST.phase='aim'; ST.plan=null; ST.msg='Ghế 1 bi trắng · ghế 2 bi vàng'; const c=B[0], t=B[2]; ST.aim=Math.atan2(t.z-c.z,t.x-c.x); T.draw(); },
      sim(dt){ ST.stroke=Math.max(0,ST.stroke-dt); if(T.sess.mode==='demo' && T.bot && ST.phase!=='roll') T.bot.seat=ST.turn;
        if(ST.phase==='over'){ ST.t-=dt; const hi=seatIn(T,0); if((T.sess.mode==='demo' && ST.t<=0) || (hi && hi.ev.includes('d') && T.sess.host)) T.reset(); return; }
        if(ST.phase==='aim'){ const inp=seatIn(T,ST.turn);
          if(inp){ const fine=inp.boost?.22:1.1; ST.aim+=(-inp.ix*fine*dt)+inp.mx*.0016; for(const e of inp.ev){ if(e==='d'){ ST.charging=true; ST.pw=0; ST.pdir=1; } else if(e==='u' && ST.charging){ ST.charging=false; shoot(ST.aim,ST.pw); } } if(ST.charging){ ST.pw+=ST.pdir*dt/1.3; if(ST.pw>1){ ST.pw=1; ST.pdir=-1; } if(ST.pw<0){ ST.pw=0; ST.pdir=1; } } }
          else { ST.t+=dt; if(!ST.plan && ST.t>.5) { ST.plan=botPlan(ST.turn); ST.pw=0; } if(ST.plan){ ST.aim=lerpA(ST.aim,ST.plan.a,1-Math.exp(-dt*4)); ST.pw=Math.min(ST.plan.pw,ST.pw+dt*.8); if(ST.t>2.3) shoot(ST.plan.a,ST.plan.pw); } } }
        else if(ST.phase==='roll'){ ST.t+=dt; const ci=ST.turn; const mv=sim3(B,dt,(i,j,v)=>{ if(j>=0){ clack(v); if(i===ci||j===ci) ST.hits.add(i===ci?j:i); } else if(v>.3) tick(v); }); if(!mv || ST.t>12){ for(const b of B){ b.vx=b.vz=0; } evalShot(); } } },
      draw(){ for(const b of B){ b.m.position.set(b.x,BY,b.z); } const c=B[ST.turn], show=ST.phase==='aim', dx=Math.cos(ST.aim), dz=Math.sin(ST.aim), mine=G===T && ST.turn===LOCALSEAT;
        cue.visible=show || ST.stroke>0; aimLine.visible=ghost.visible=show && mine;
        if(cue.visible){ const back=ST.stroke>0?-.03:.06+ST.pw*.28; cue.position.set(c.x-dx*(.725+back),BY+.04,c.z-dz*(.725+back)); cue.quaternion.setFromUnitVectors(new V3(0,1,0), new V3(dx,-.06,dz).normalize()); }
        if(aimLine.visible){ let tHit=9, hb=null; for(const b of B){ if(b===c) continue; const ox=b.x-c.x, oz=b.z-c.z, t=ox*dx+oz*dz; if(t<=0) continue; const pd=Math.abs(ox*dz-oz*dx); if(pd<2*R){ const tt=t-Math.sqrt(4*R*R-pd*pd); if(tt<tHit){ tHit=tt; hb=b; } } }
          const tx=dx>0?(HX-c.x)/dx:dx<0?(-HX-c.x)/dx:9, tz=dz>0?(HZ-c.z)/dz:dz<0?(-HZ-c.z)/dz:9, tw=Math.min(tx,tz); if(tw<tHit){ tHit=tw; hb=null; }
          const p=aimLine.geometry.attributes.position; p.setXYZ(0,c.x,BY,c.z); p.setXYZ(1,c.x+dx*tHit,BY,c.z+dz*tHit); if(hb){ const nx=hb.x-(c.x+dx*tHit), nz=hb.z-(c.z+dz*tHit), nl=Math.hypot(nx,nz)||1; p.setXYZ(2,hb.x+nx/nl*.35,BY,hb.z+nz/nl*.35); } else p.setXYZ(2,c.x+dx*tHit,BY,c.z+dz*tHit); p.needsUpdate=true; ghost.position.set(c.x+dx*tHit,BY,c.z+dz*tHit); } },
      snap:()=>({b:B.map(b=>[+b.x.toFixed(4),+b.z.toFixed(4)]), t:ST.turn, s:ST.score, ph:ST.phase, a:+ST.aim.toFixed(3), pw:+ST.pw.toFixed(3), m:ST.msg, k:+ST.stroke.toFixed(2)}),
      unsnap(a){ a.b.forEach((q,i)=>{ B[i].x=q[0]; B[i].z=q[1]; }); ST.turn=a.t; ST.score=a.s; ST.phase=a.ph; ST.aim=a.a; ST.pw=a.pw; ST.msg=a.m; ST.stroke=a.k; },
      cam(o,seat){ const c=B[ST.turn], dx=Math.cos(ST.aim), dz=Math.sin(ST.aim); if(ST.phase==='aim' && ST.turn===seat){ o.pos.copy(wp(g,c.x-dx*1.05,H+.48,c.z-dz*1.05)); o.look.copy(wp(g,c.x+dx*.7,H,c.z+dz*.7)); } else { o.pos.copy(wp(g,0,H+2.3,Wd*1.15)); o.look.copy(wp(g,0,H,0)); } },
      standFor(seat){ const outside=(lx,lz)=>{ if(Math.abs(lx)<L/2+.5 && Math.abs(lz)<Wd/2+.5){ const k=Math.min((L/2+.5)/Math.max(1e-3,Math.abs(lx)),(Wd/2+.5)/Math.max(1e-3,Math.abs(lz))); lx*=k; lz*=k; } return [lx,lz]; };
        if(seat===ST.turn && ST.phase!=='over'){ const c=B[ST.turn]; const [lx,lz]=outside(c.x-Math.cos(ST.aim)*.85, c.z-Math.sin(ST.aim)*.85), p=wp(g,lx,0,lz), q=wp(g,c.x,0,c.z); return {x:p.x, z:p.z, yaw:Math.atan2(q.x-p.x,q.z-p.z)}; }
        return st(g,(seat?-1:1)*(L/2+.75),Wd/2+.55,seat?Math.PI*.75:-Math.PI*.75); },
      exitSpot(seat){ return st(g,(seat?-1:1)*(L/2+.8),Wd/2+.8,Math.PI); }, inter:()=>wp(g,0,0,0),
      hud(seat){ return ['🎱 Bida 3 bi (carom) · chạm 5', `⚪ ${seatName(T,0)}  ${ST.score[0]} : ${ST.score[1]}  ${seatName(T,1)} 🟡`, ST.phase==='over' ? `${ST.score[seat]>=5?'🏆 Bạn thắng!':'😅 Thua rồi'}${T.sess.host?' · Space: ván mới':''} · Esc: thôi` :
        `${ST.msg?ST.msg+' · ':''}${ST.phase==='roll'?'Bi đang lăn…':ST.turn===seat?'Lượt BẠN: A/D · chuột xoay cơ (Shift = tinh) · giữ Space lấy lực, thả để đánh':'Lượt '+seatName(T,ST.turn)+' đang ngắm…'}`, ST.charging && ST.turn===seat?ST.pw:null]; },
      botPose(bot, seat){ if(seat!==ST.turn || !cue.visible) return; const ax=new V3(0,1,0).applyQuaternion(cue.quaternion), cw=new V3(); cue.getWorldPosition(cw); ax.applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion())).normalize();
        lean(bot,.85); ik(bot.B,'Right',cw.clone().addScaledVector(ax,-.45),hintOut(bot,1)); const br=cw.clone().addScaledVector(ax,.55); br.y=F.y+H+.03; ik(bot.B,'Left',br,hintOut(bot,-1)); } };
    return reg(T); }

  /* ============================== BỐ TRÍ: mỗi trò 2 bàn (bida: 2 bàn có sẵn) ============================== */
  const LOG={A0:+F.A0.toFixed(3), y:F.y, placed:[], skipped:[]};
  const PLAN=[ ['bowl', [-.7,1.65,-3.85,3.85], buildBowl], ['golf', [-1.8,1.8,-3.0,3.4], buildGolf], ['pong', [-2.45,2.55,-1.15,1.15], buildPong], ['hockey', [-1.9,1.9,-.62,.62], buildHockey],
    ['hoops', [-1.2,1.2,-1.6,2.1], buildHoops], ['foos', [-.82,.82,-1.38,1.4], buildFoos], ['darts', [-1.2,1.2,-.3,3.1], buildDarts] ];
  for(const [kind,fp,build] of PLAN) for(let i=0;i<2;i++){ try{ const sl=place(fp); if(!sl){ LOG.skipped.push(kind+'-'+i); continue; } const T=build(sl,i); LOG.placed.push([T.id, +((sl.a-F.A0+TAU)%TAU).toFixed(2), +sl.r.toFixed(1)]);
      const p=wp(sl.g,0,2.7,0); try{ makeLabel(`${T.icon} ${T.title}`, 'Tầng Giải trí · E: chơi với máy / cùng bạn', {h:.34, x:p.x, y:p.y, z:p.z, fade:26}); }catch(e){} }catch(e){ console.warn('[brain_games] dựng', kind, e); LOG.skipped.push(kind+'-'+i+' (lỗi)'); } }
  try{ LOG.billiards=takeBilliards(2).length; }catch(e){ console.warn('[brain_games] bida', e); }
  if(LOG.skipped.length) console.warn('[brain_games] không đủ chỗ cho:', LOG.skipped.join(', '));
  /* 9 bot đang chơi thật: bàn đầu của mỗi trò (bóng bàn 2 bot) */
  let bi=0; for(const T of TABLES){ if(T.idx!==0) { T.needBot=true; continue; } T.bot=mkBot(bi++); if(T.bot){ T.bot.T=T; T.bot.seat=T.botSeat; botGoto(T.bot, T.standFor(T.botSeat), true); T.botName=T.bot.name; }
    if(T.botSeat2!=null){ T.bot2=mkBot(bi++); if(T.bot2){ T.bot2.T=T; T.bot2.seat=T.botSeat2; botGoto(T.bot2, T.standFor(T.botSeat2), true); } } T.needBot=true; }
  LOG.bots=BOTS.length; LOG.tables=TABLES.map(t=>t.id);

  /* ============================== KHUNG HÌNH ============================== */
  let netT=0, openT=0;
  HOOK.onFrame.push((dt)=>{ dt=Math.min(dt||1/60,.05); const c=W.camera.position, onFloor=Math.abs(c.y-F.y-1.5)<7 && Math.hypot(c.x-F.cx,c.z-F.cz)<ROUT+8;
    if(G && !(HOOK.vehicle && HOOK.vehicle.brainGame)) exitGame();
    if(exitCool>0) exitCool-=dt; for(const T of TABLES){ if(T.cool>0) T.cool-=dt; if(T===G) continue; if(T.sess.mode==='demo' && [T.bot,T.bot2].some(b=>b && !b.hidden && !b.away) && onFloor){ sndK=.35; try{ T.sim(dt); T.draw(); }catch(e){} sndK=1; } }
    if(G){ const T=G; try{
        if(T.sess.host){ if(T.sess.mode==='friends' && !T.sess.started){ T.sess.wait-=dt; const hi=LI.ev.includes('d'); if(hi || T.sess.wait<=0){ const n=humanSeats(T).filter(i=>T.sess.seats[i].k==='net').length; if(!n){ toBotMode(T,'Chưa có bạn bè nào vào – chơi với máy.'); } else { T.sess.seats=T.sess.seats.map(s=>s.k==='open'?{k:'idle'}:s); T.sess.started=true; T.reset(); } LI.ev=LI.ev.filter(e=>e!=='d'); } }
            else if(T.sess.mode==='friends' && !T.turn){ T.sess.wait=(T.sess.wait??20)-dt; if(T.sess.wait<=0 && !humanSeats(T).some(i=>T.sess.seats[i].k==='net')) toBotMode(T,'20 giây chưa có bạn bè vào – chơi với máy.'); }
            T.sim(dt); T.draw();
            for(const [i,s] of T.sess.seats.entries()) if(s.k==='net' && performance.now()-(s.at||0)>6000) dropSeat(T,i);
            if(T.sess.mode==='friends'){ netT-=dt; if(netT<=0){ netT=1/15; NET.send({k:'st', tid:T.id, s:T.snap(), seats:T.sess.seats.map(s=>[s.k==='me'?'net':s.k, s.name||'']), host:MYNAME}); } openT-=dt; if(openT<=0){ openT=1.5; if(T.sess.seats.some(s=>s.k==='open') && (!T.turn || !T.sess.started)) NET.send({k:'open', tid:T.id, kind:T.kind, name:MYNAME}); } } }
        else { const m=T.snapIn; if(m){ T.unsnap(m.s); if(m.seats) m.seats.forEach(([k,nm],i)=>{ if(i!==LOCALSEAT) T.sess.seats[i]={k:k==='me'?'net':k, name:nm}; }); } T.draw();
          netT-=dt; if(netT<=0){ netT=1/15; NET.send({k:'in', tid:T.id, gid:NET.gid, ix:+LI.ix.toFixed(2), iz:+LI.iz.toFixed(2), mx:LI.mx, my:LI.my, b:LI.boost?1:0, ev:LI.ev.slice(0,8)}); LI.mx=LI.my=0; LI.ev=[]; } }
        const [t,s,h,bar]=T.hud(LOCALSEAT); hudSet(t,s,h,bar); if(T.sess.host){ LI.ev=[]; LI.mx=LI.my=0; }
        if(HOOK.camOverride){ T.cam(HOOK.camOverride,LOCALSEAT); if(shake>0){ shake=Math.max(0,shake-dt*1.8); const k=shake*shake*.05; HOOK.camOverride.pos.x+=(rnd()-.5)*k; HOOK.camOverride.pos.y+=(rnd()-.5)*k; } }
      }catch(e){ console.warn('[brain_games]', G&&G.title, e); exitGame(); } }
    for(const T of TABLES) for(const k of Object.keys(T.RI)){ const r=T.RI[k]; if(r){ r.ev=[]; r.mx=r.my=0; } }
    for(const b of BOTS) try{ botFrame(b,dt); }catch(e){} });

  console.info('[brain_games] Tầng giải trí:', JSON.stringify(LOG));
  const api={ tables:TABLES, floor:F, log:LOG, bots:BOTS, net:NET,
    enter:(kind,i=0,mode='bot')=>{ const T=TABLES.filter(t=>t.kind===kind)[i]; if(!T || G) return false; enterTable(T,mode); return true; }, exit:()=>exitGame(), choose:(kind,i=0)=>{ const T=TABLES.filter(t=>t.kind===kind)[i]; if(T) choose(T); },
    state:()=>G?{id:G.id, mode:G.sess.mode, host:G.sess.host, seat:LOCALSEAT, seats:G.sess.seats.map(s=>s.k), snap:G.snap()}:null, input:LI, onNet };
  W.brainGames=api; return api; }
/* MÁY CHỦ NHIỀU NGƯỜI (multiplayer_server.py) cần chuyển tiếp tin trò chơi để chơi cùng bạn – thêm trong vòng xử lý tin (cạnh 'chat'):
     elif t == 'game':
         broadcast({k: v for k, v in m.items() if k in ('t','g','k','tid','gid','name','kind','seat','ok','why','n','s','seats','host','ix','iz','mx','my','b','ev')}, skip=pid)
   Chưa có dòng này thì mọi trò vẫn chơi với máy bình thường; nút "Chơi cùng bạn" mở bàn nhưng người khác không thấy → sau 20 giây tự về chơi với máy. */
