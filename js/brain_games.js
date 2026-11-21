// QC World V2 – TẦNG GIẢI TRÍ & BIDA · THÁP QA/QC BRAIN (phiên B · abyss-sea, 21/11/2026 – yêu cầu Bình qua phiên chính)
// Trò nào cũng CHƠI ĐƯỢC THẬT (E vào chơi · Esc / E thoát · có điểm số · camera góc nhìn thứ nhất sau tay cầm / sau bi):
//  ⚽ Bi lắc 2 đấu 2   – mỗi bên 2 người × 2 thanh (bạn cầm thanh tiền vệ 5 + tiền đạo 3, bot đồng đội giữ thủ môn + hậu vệ, 2 bot đối thủ).
//                        W/S hoặc chuột lên-xuống: đẩy/kéo thanh · Space / chuột trái: xoay đá bóng · Shift: nhấc thanh cho bóng lăn qua ·
//                        A/D: chọn thanh (mặc định tự chọn thanh gần bóng). Bóng nảy vách, chân cầu thủ đá theo vận tốc xoay thật, ghi bàn, bảng tỉ số, chạm 5.
//                        Có người chơi khác (👥 Online) đứng cạnh bàn → "Vào chơi cùng": cầm 2 thanh tấn công của đội xanh (máy chủ phải chuyển tin 'game' – xem cuối file).
//  🏒 Khúc côn cầu đĩa hơi – WASD / chuột điều khiển chày, đĩa trượt nảy băng, đấu bot, chạm 7.
//  🏓 Bóng bàn          – A/D di chuyển, Space đánh đúng lúc bóng tới (A/D lúc đánh = hướng, Shift = đập mạnh), luật nảy 1 lần mỗi bên, đấu bot, chạm 11.
//  🎯 Phi tiêu           – WASD / chuột ngắm (tay rung tự nhiên), Space phóng, bảng điểm chuẩn (bull 50 · 25 · vòng đôi · vòng ba), 3 lượt × 3 phi tiêu.
//  🏀 Ném bóng rổ arcade (2 máy) – A/D ngắm, giữ Space lấy lực, thả để ném; bóng nảy vành/bảng thật, 45 giây, 10 giây cuối 3 điểm.
//  🎳 Bowling mini       – A/D vị trí, W/S góc, giữ Space lấy lực; 10 ky đổ dây chuyền, 5 frame, strike/spare.
//  🎱 Bida 3 bi (carom)  – dùng 4 bàn bida có sẵn của tầng (archKit.buildBilliardTable): A/D xoay cơ (Shift = tinh), giữ Space lấy lực;
//                        vạch ngắm + bi ma, cây cơ kéo lùi theo lực; bi trắng của bạn chạm cả bi vàng lẫn bi đỏ = 1 điểm (đánh tiếp), đấu bot, chạm 5.
// Bố trí (21/11, Bình chốt): TẦNG 5 (y 142) – tầng đang có 4 bàn bida, bàn ăn, quầy bar, bảng vinh danh. Mỗi trò 1 bộ; bida dùng bàn có sẵn.
//   Đọc W.brainV2.gameFloor {y, cx, cz, rIn, rOut, A0, ENT, keepOut} LÚC CHẠY rồi TỰ XẾP từng trò vào chỗ trống:
//   lưới vật cản (W.circles / W.SEGS / W.boxes ở cao độ tầng) + keepOut (góc ± da, dải bán kính r; hoặc vòng {x,z,r}; hoặc hộp {x0,x1,z0,z1})
//   + chừa vành lối đi 1,3 m quanh giếng trời (nối cầu thang ↔ thang máy) + lề ≥ 0,85 m giữa các trò. Trò nào không vừa chỗ thì bỏ qua và ghi log.
// API: export make(W, ctx, floor) – floor = W.brainV2.gameFloor (không truyền thì tự đọc).
import { roundedBox, makeWoodMaterial } from './archKit.js';

export async function make(W, ctx={}, floor={}){
  if(W.brainGames) return W.brainGames;
  const {THREE, scene, P, me, HOOK, INTER, toast, makeLabel} = W;
  const TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, V3=THREE.Vector3, LOW=W.QUAL==='low';
  let seed=20261121; const rnd=()=>{ seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }, rr=(a,b)=>a+rnd()*(b-a);
  const S=(W.life && W.life.S) || {}, save=()=>{ try{ W.life && W.life.save && W.life.save(); }catch(e){} }; S.brainGames=S.brainGames||{};
  const reward=(n,msg)=>{ try{ if(W.life && W.life.addCoins) W.life.addCoins(n,msg); else toast(msg,3000); }catch(e){} };

  /* ============================== TẦNG & 3 KHU ============================== */
  const GF=(floor && floor.y!=null) ? floor : ((W.brainV2 && W.brainV2.gameFloor) || {}); const F={cx:880, cz:180, y:142, rc:16, ...GF};
  if(F.A0==null){ const bar=(INTER||[]).find(i=>/Sky Bar Liên Hoa/.test(String(i.label||''))); F.A0=bar ? Math.atan2(bar.z-F.cz, bar.x-F.cx)-Math.PI-.2 : 0; }
  const dAng=(a,b)=>{ let d=(a-b)%TAU; if(d>Math.PI) d-=TAU; if(d<-Math.PI) d+=TAU; return Math.abs(d); };
  const RIN=F.rIn ?? 11.5, ROUT=F.rOut ?? 21, KO=F.keepOut ? [...F.keepOut] : (()=>{ const A0=F.A0, ENT=F.ENT ?? A0-Math.PI/2; return [{a:A0,da:.45},{a:A0+Math.PI,da:.45},{a:ENT,da:.35,r:[11.5,15]},{a:ENT+Math.PI,da:.35,r:[11.5,15]},{a:A0+Math.PI+.2,da:.3,r:[13,17]},{a:A0+Math.PI/2+1.18,da:.8,r:[13.3,17.7]}]; })();
  /* bàn bida có sẵn (gameFloor.existing.billiards): chừa thêm 1,2 m quanh bàn cho người đứng đánh cơ – khung xoay theo hướng bàn */
  for(const t of ((F.existing||{}).billiards||[])) if(typeof t.x==='number') KO.push({ox:t.x, oz:t.z, yaw:t.yaw||0, hl:(t.len||2.84)/2+1.2, hw:(t.wid||1.42)/2+1.2, what:'bàn bida'});
  /* lưới vật cản sẵn có ở cao độ tầng (ô 2 m, mỗi vật ghi vào mọi ô chạm hộp bao đã nới 0,7 m) */
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
  function place(fp){ let best=null; const ext=Math.max(-fp[0],fp[1],-fp[2],fp[3]), rMid=(RIN+1.3+ROUT)/2;
    for(let ai=0;ai<210;ai++){ const a=F.A0+ai/210*TAU; for(let r=RIN+1.6; r<=ROUT-.5; r+=.45){ const px=F.cx+Math.cos(a)*r, pz=F.cz+Math.sin(a)*r, th0=Math.atan2(Math.cos(a),Math.sin(a));
        for(const dth of [0,Math.PI,Math.PI/2,-Math.PI/2]){ if(!fits(fp,px,pz,th0+dth)) continue; let dmin=9; for(const pl of PLACED) dmin=Math.min(dmin,Math.hypot(pl.px-px,pl.pz-pz)); const sc=dmin-Math.abs(r-rMid)*.15; if(!best || sc>best.sc) best={px,pz,th:th0+dth,sc,a,r}; } } }
    if(!best) return null; const g=new THREE.Group(); g.position.set(best.px,F.y,best.pz); g.rotation.y=best.th; g.userData.dynamic=true; scene.add(g); g.updateMatrixWorld(true); PLACED.push({...best, fp}); return {g, ...best}; }

  /* ============================== VẬT LIỆU & TIỆN ÍCH ============================== */
  const std=(c,r=.5,m=0,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:r, metalness:m}, o));
  const M={ wood:makeWoodMaterial({col:'#6a4126', plank:30, rough:.42, seed:21}), woodL:makeWoodMaterial({col:'#c99c66', plank:22, rough:.36, seed:22}), black:std(0x1b1d22,.45,.25), steel:std(0xc9ced4,.25,1), chrome:std(0xf0f3f6,.07,1),
    red:std(0xc8231c,.4), blue:std(0x1f5fbf,.4), white:std(0xf3f1ea,.35), cream:std(0xece4cf,.6), rubber:std(0x121212,.9), gold:std(0xd4af37,.22,1), felt:std(0x1d6b3e,.95), dark:std(0x0c0f14,.8),
    glass:new THREE.MeshPhysicalMaterial({color:0xdcecf3, roughness:.05, transparent:true, opacity:.25, depthWrite:false}), net:std(0xf4f4f4,.8,0,{transparent:true, opacity:.55, side:THREE.DoubleSide}), orange:std(0xe56a1e,.6) };
  const add=(p,geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0,cast=true)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow=cast && !LOW; m.receiveShadow=true; p.add(m); return m; };
  const rb=(w,h,d,r=.02,s=2)=>roundedBox(w,h,d,r,s);
  const canvasTex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
  const C=new THREE.Color(); function vcol(parts){ const list=[]; for(const [g0,col,x=0,y=0,z=0,rx=0,ry=0,rz=0] of parts){ let g=g0.index?g0.toNonIndexed():g0.clone(); if(rx||ry||rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx,ry,rz))); g.translate(x,y,z);
      for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal') g.deleteAttribute(k); const n=g.attributes.position.count, a=new Float32Array(n*3); C.set(col); for(let i=0;i<n;i++){ a[i*3]=C.r; a[i*3+1]=C.g; a[i*3+2]=C.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); list.push(g); }
    const g=W.mergeGeometries(list,false); g.computeVertexNormals(); return g; }
  function colRect(g, cx, cz, hw, hd, y0=-.4, y1=1.6, msg='🎮 Bàn trò chơi'){ g.updateMatrixWorld(true); const pts=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([a,b])=>new V3(cx+a,0,cz+b).applyMatrix4(g.matrixWorld)); for(let i=0;i<4;i++){ const p=pts[i], q=pts[(i+1)%4]; W.addSeg && W.addSeg(p.x,p.z,q.x,q.z,.05,F.y+y0,F.y+y1,msg); } }
  const wp=(g,x,y,z)=>{ g.updateMatrixWorld(true); return new V3(x,y,z).applyMatrix4(g.matrixWorld); };
  const wyaw=(g,ly=0)=>{ const q=new THREE.Quaternion(); g.getWorldQuaternion(q); return new THREE.Euler().setFromQuaternion(q,'YXZ').y+ly; };

  /* ---------- âm thanh (WebAudio tổng hợp – rất nhỏ) ---------- */
  let AC=null; const snd=(f=440,d=.08,type='sine',v=.1,f2)=>{ try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); const t=AC.currentTime, o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+d); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+d+.02); }catch(e){} };
  const tick=(k=1)=>snd(820+rnd()*380,.03,'triangle',.05*clamp(k,.2,1.5)), thud=(k=1)=>snd(120+rnd()*50,.1,'sine',.16*clamp(k,.2,1.2)), clack=(k=1)=>snd(1500+rnd()*500,.025,'square',.035*clamp(k,.2,1.3));
  const cheer=()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>snd(f,.2,'triangle',.11),i*85)), boo=()=>snd(220,.4,'sawtooth',.06,110);

  /* ---------- HUD trò chơi ---------- */
  let hud=null; const hq=k=>hud.querySelector(`[data-${k}]`);
  function hudSet(title, score, help, bar){ if(!hud){ hud=document.createElement('div'); hud.id='bg-hud';
      hud.style.cssText='position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:42;min-width:340px;max-width:92vw;padding:10px 18px;border-radius:14px;background:rgba(12,16,24,.86);border:1px solid rgba(255,215,120,.45);color:#f4f1ea;font:600 14px Segoe UI,system-ui,sans-serif;text-align:center;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,.35)';
      hud.innerHTML='<div data-t style="font:800 15px Segoe UI,system-ui;color:#ffd77a"></div><div data-s style="font:800 24px Segoe UI,system-ui;margin:2px 0;white-space:nowrap"></div><div data-b style="height:9px;border-radius:5px;background:rgba(255,255,255,.12);overflow:hidden;margin:5px auto;max-width:300px"><div style="height:100%;width:0;background:linear-gradient(90deg,#46d39a,#ffd23f,#ff5a3c)"></div></div><div data-h style="opacity:.82;font-size:12.5px;line-height:1.45"></div>';
      document.body.appendChild(hud); }
    hud.hidden=false; if(hq('t').textContent!==title) hq('t').textContent=title; if(hq('s').textContent!==score) hq('s').textContent=score; if(hq('h').textContent!==help) hq('h').textContent=help;
    const b=hq('b'); b.style.display=bar==null?'none':'block'; if(bar!=null) b.firstChild.style.width=`${clamp(bar,0,1)*100}%`; }
  const hudPunch=()=>{ try{ hq('s').animate([{transform:'scale(1.35)', color:'#ffd23f'},{transform:'scale(1)', color:'#f4f1ea'}],{duration:380, easing:'ease-out'}); }catch(e){} };

  /* ============================== QUẢN LÝ PHIÊN CHƠI ============================== */
  const GAMES=[]; let G=null, shake=0, savedVis=true, mdx=0, mdy=0; const KEY={};
  addEventListener('keydown',e=>{ if(!G) return; if(e.code==='Escape'){ e.preventDefault(); e.stopPropagation(); exitGame(); return; } if(!KEY[e.code]){ KEY[e.code]=true; try{ G.key && G.key(e.code,true); }catch(err){} }
    if(['Space','ShiftLeft','ShiftRight','KeyR','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); }, true);
  addEventListener('keyup',e=>{ if(!G) return; KEY[e.code]=false; try{ G.key && G.key(e.code,false); }catch(err){} }, true);
  addEventListener('mousemove',e=>{ if(!G) return; mdx+=e.movementX||0; mdy+=e.movementY||0; });
  addEventListener('mousedown',e=>{ if(!G || e.button!==0 || (e.target && e.target.closest && e.target.closest('button,.modalWrap,input,#bg-hud'))) return; try{ G.click && G.click(true); }catch(err){} });
  addEventListener('mouseup',e=>{ if(!G || e.button!==0) return; try{ G.click && G.click(false); }catch(err){} });
  const held=()=>!!(KEY.Space || KEY.__mouse);
  function enterGame(g){ if(G) return; if(HOOK.vehicle){ toast('🎮 Đang ngồi / đang lái – đứng dậy rồi vào chơi nhé.',2400); return; }
    G=g; for(const k in KEY) KEY[k]=false; mdx=mdy=0; const st=g.stand(); P.x=st.x; P.z=st.z; P.y=st.y??F.y; P.vx=P.vz=0;
    HOOK.vehicle={brainGame:true, drive:(dt,inp)=>{ if(G) G.inp=inp; const s=G?G.stand():st; P.x=s.x; P.z=s.z; P.y=s.y??F.y; P.vx=P.vz=P.vy=0; me.g.position.set(P.x,P.y,P.z); me.g.rotation.set(0,s.yaw,0); me.play('idle'); }};
    HOOK.vehicleInter=()=>({label:`🚪 Thôi chơi ${g.title} (E · Esc)`, action:exitGame});
    savedVis=me.g.visible; me.g.visible=false; HOOK.camOverride={pos:new V3(), look:new V3(), k:60}; try{ g.start(); g.cam(HOOK.camOverride,0); }catch(e){ console.warn('[brain_games] vào', e); }
    setTimeout(()=>{ if(HOOK.camOverride) HOOK.camOverride.k=9; },250); }
  function exitGame(){ const g=G; if(!g) return; G=null; try{ g.stop(); }catch(e){} if(HOOK.vehicle && HOOK.vehicle.brainGame){ HOOK.vehicle=null; } HOOK.vehicleInter=null; HOOK.camOverride=null; me.g.visible=savedVis!==false; if(hud) hud.hidden=true; }
  function reg(g){ GAMES.push(g); const ip=g.inter(); INTER.push({x:ip.x, z:ip.z, r:g.r||1.4, prio:1, when:()=>!G && Math.abs(P.y-F.y)<1.4, get label(){ return g.label(); }, action:()=>g.enterAction ? g.enterAction() : enterGame(g)}); return g; }

  /* ============================================================================================
     ⚽ BI LẮC (FOOSBALL) 2 ĐẤU 2
     ============================================================================================ */
  function buildFoosball(zone, lx, lz, ry, id){
    const g=new THREE.Group(); g.position.set(lx,0,lz); g.rotation.y=ry; zone.g.add(g);
    const L=1.16, WF=.68, FY=.80, RY=.868, GH=.095, R=.0175, FOOT=.072;
    const fieldT=canvasTex(512,300,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,w,0); for(let i=0;i<10;i++){ gr.addColorStop(i/10, i%2?'#2a8a4c':'#24803f'); gr.addColorStop((i+1)/10-.001, i%2?'#2a8a4c':'#24803f'); } c.fillStyle=gr; c.fillRect(0,0,w,h); c.strokeStyle='rgba(255,255,255,.92)'; c.lineWidth=4; c.strokeRect(6,6,w-12,h-12); c.beginPath(); c.moveTo(w/2,6); c.lineTo(w/2,h-6); c.stroke(); c.beginPath(); c.arc(w/2,h/2,46,0,TAU); c.stroke(); c.strokeRect(6,h/2-70,52,140); c.strokeRect(w-58,h/2-70,52,140); c.fillStyle='#fff'; c.beginPath(); c.arc(w/2,h/2,5,0,TAU); c.fill(); });
    add(g, rb(1.38,.18,.9,.035,3), M.wood, 0,FY-.09,0);
    add(g, new THREE.PlaneGeometry(L,WF), std(0xffffff,.85,0,{map:fieldT}), 0,FY+.002,0,-Math.PI/2,0,0,false);
    for(const s of [-1,1]) add(g, rb(1.38,.15,.08,.025,2), M.wood, 0,FY+.06,s*(WF/2+.04));
    for(const e of [-1,1]){ for(const s of [-1,1]) add(g, rb(.08,.15,WF/2-GH,.02,2), M.wood, e*(L/2+.04), FY+.06, s*(GH+(WF/2-GH)/2)); add(g, rb(.08,.05,GH*2,.012,1), M.wood, e*(L/2+.04), FY+.115, 0); add(g, rb(.14,.12,GH*2+.04,.02,1), M.dark, e*(L/2+.13), FY-.01, 0);
      for(const s of [-1,1]) add(g, new THREE.BoxGeometry(.05,.02,.05), M.wood, e*(L/2-.025), FY+.012, s*(WF/2-.025),0,Math.PI/4,0,false); }   /* vát góc cho bóng khỏi kẹt */
    for(const a of [-1,1]) for(const b of [-1,1]){ add(g, new THREE.CylinderGeometry(.05,.038,FY-.18,14), M.black, a*.57, (FY-.18)/2, b*.34); add(g, new THREE.CylinderGeometry(.06,.06,.03,14), M.rubber, a*.57, .015, b*.34); }
    for(const b of [-1,1]) add(g, rb(1.1,.05,.05,.015,1), M.black, 0,.24,b*.34); add(g, rb(.05,.05,.64,.015,1), M.black, 0,.24,0);
    /* bảng tỉ số 2 đầu bàn (bi gỗ trượt trên thanh + số) */ const sbT=canvasTex(256,64,()=>{}), sbM=std(0xffffff,.5,0,{map:sbT, emissive:0xffffff, emissiveMap:sbT, emissiveIntensity:.35});
    for(const e of [-1,1]) add(g, new THREE.PlaneGeometry(.34,.085), sbM, e*(L/2+.081), FY+.1, 0, 0, e*Math.PI/2, 0, false);
    const drawSB=(a,b)=>{ const c=sbT.image.getContext('2d'); c.fillStyle='#14171c'; c.fillRect(0,0,256,64); c.font='900 44px Segoe UI'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#ff5a4c'; c.fillText(String(a),70,34); c.fillStyle='#fff'; c.fillText(':',128,30); c.fillStyle='#5aa0ff'; c.fillText(String(b),186,34); sbT.needsUpdate=true; }; drawSB(0,0);
    /* 8 thanh: đội đỏ (bạn, tay cầm phía +Z, tấn công +X) · đội xanh (tay cầm −Z) */
    const RODS=[[0,-.525,1,0],[0,-.375,2,.24],[1,-.225,3,.2],[0,-.075,5,.12],[1,.075,5,.12],[0,.225,3,.2],[1,.375,2,.24],[1,.525,1,0]].map(([team,x,n,sp],i)=>{ const offs=[...Array(n)].map((_,k)=>(k-(n-1)/2)*sp), mo=Math.max(0,...offs.map(Math.abs));
      return {i, team, x, n, offs, max:n===1?.13:WF/2-.035-mo, slide:0, sv:0, th:0, om:0, kickT:-1, lift:false, liftT:0, cool:0, ctrl:'bot'}; });
    const figG=t=>vcol([[rb(.024,.05,.03,.008,1), t?0x1f5fbf:0xc8231c, 0,-.022,0],[new THREE.SphereGeometry(.0125,10,8),0xf0c8a0,0,.016,0],[rb(.022,.022,.034,.006,1), t?0x14408a:0x8a1712, 0,-.058,0],[rb(.02,.012,.036,.005,1),0x1a1a1a,.004,-.074,0],[new THREE.CylinderGeometry(.012,.012,.03,10), t?0x1f5fbf:0xc8231c, 0,0,0,Math.PI/2,0,0]]);
    const figMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.42, metalness:.05}), NF=[0,1].map(t=>RODS.filter(r=>r.team===t).reduce((s,r)=>s+r.n,0));
    const FIG=[0,1].map(t=>{ const im=new THREE.InstancedMesh(figG(t),figMat,NF[t]); im.castShadow=!LOW; im.frustumCulled=false; g.add(im); return im; });
    const rodIM=new THREE.InstancedMesh(new THREE.CylinderGeometry(.0075,.0075,1.36,10).rotateX(Math.PI/2), M.chrome, 8), grips=new THREE.InstancedMesh(new THREE.CylinderGeometry(.018,.016,.12,14).rotateX(Math.PI/2), M.rubber, 8), bump=new THREE.InstancedMesh(new THREE.CylinderGeometry(.024,.024,.02,14).rotateX(Math.PI/2), M.black, 8);
    for(const im of [rodIM,grips,bump]){ im.frustumCulled=false; g.add(im); }
    const ball=add(g, new THREE.SphereGeometry(R,16,12), std(0xf7f3e8,.35), 0,FY+R,0); const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _p=new V3(), _s=new V3(1,1,1);
    function draw(){ const cnt=[0,0]; for(const r of RODS){ const s=r.team?-1:1; _q.setFromEuler(_e.set(0,0,s*r.th)); for(const o of r.offs){ _p.set(r.x,RY,r.slide+o); _m.compose(_p,_q,_s); FIG[r.team].setMatrixAt(cnt[r.team]++,_m); } _q.identity(); _p.set(r.x,RY,r.slide); _m.compose(_p,_q,_s); rodIM.setMatrixAt(r.i,_m); const hs=r.team?-1:1; _p.set(r.x,RY,r.slide+hs*(WF/2+.2)); _m.compose(_p,_q,_s); grips.setMatrixAt(r.i,_m); _p.set(r.x,RY,r.slide+hs*(WF/2+.125)); _m.compose(_p,_q,_s); bump.setMatrixAt(r.i,_m); }
      for(const im of [...FIG,rodIM,grips,bump]) im.instanceMatrix.needsUpdate=true; ball.position.set(B.x,FY+R,B.z); }
    colRect(zone.g, lx, lz, .74, .62, -.4, 1.2, '⚽ Bàn bi lắc');   /* (bàn đặt song song trục X của khu) */
    const B={x:0,z:0,vx:0,vz:0, still:0}, ST={score:[0,0], phase:'serve', t:0, demo:true, active:5, manual:0, last:0, over:false};
    const kick=r=>{ if(r.kickT<0 && r.cool<=0){ r.kickT=0; r.cool=.32; } };
    function serve(toward){ const sd=rnd()<.5?-1:1; B.x=rr(-.02,.02); B.z=sd*(WF/2-.03); B.vx=(toward??(rnd()<.5?-1:1))*rr(.05,.18); B.vz=-sd*rr(.55,.85); ST.phase='play'; B.still=0; }
    function goal(team){ ST.score[team]++; drawSB(ST.score[0],ST.score[1]); ST.phase='goal'; ST.t=1.3; B.vx=B.vz=0; B.x=Math.sign(B.x)*(L/2+.07);
      if(!ST.demo){ if(team===0){ cheer(); shake=.5; } else { boo(); shake=.25; } hudPunch(); } else thud(.6);
      if(ST.score[team]>=5){ ST.phase='over'; ST.t=ST.demo?3:99; if(!ST.demo){ if(team===0) reward(30,'⚽ Thắng bi lắc 5–'+ST.score[1]+'! +30 💰'); else toast('⚽ Đội xanh thắng '+ST.score[1]+'–'+ST.score[0]+' – bấm Space chơi ván mới.',3200); } } }
    function rodAI(r, dt, skill){ const s=r.team?-1:1; let tz=B.z; if(Math.abs(B.vx)>.05){ const t=(r.x-B.x)/B.vx; if(t>0 && t<1.2){ tz=B.z+B.vz*t; const lim=WF/2-R; for(let k=0;k<3;k++){ if(tz>lim) tz=2*lim-tz; if(tz<-lim) tz=-2*lim-tz; } } }
      const goalie=r.n===1; if(goalie && s*(B.x-r.x)>.25) tz=B.z*.45;   /* thủ môn đứng chắn giữa khi bóng còn xa */
      let best=r.slide, bd=1e9; for(const o of r.offs){ const want=clamp(tz-o,-r.max,r.max), d=Math.abs(want-r.slide); if(d<bd){ bd=d; best=want; } }
      const dv=clamp((best-r.slide)*14,-skill.v,skill.v); r.sv=lerp(r.sv,dv,1-Math.exp(-dt*18)); r.slide=clamp(r.slide+r.sv*dt,-r.max,r.max);
      const dx=s*(B.x-r.x); if(dx>-.012 && dx<.05 && r.offs.some(o=>Math.abs(B.z-(r.slide+o))<.022) && rnd()<skill.k*dt*60) kick(r);
      r.lift = s*B.vx>.9 && dx<-.015 && dx>-.22 && r.team===(B.vx>0?0:1); }
    function rodMe(r, dt, inp, md, active){ if(active){ const tv=clamp(-inp.iz*1.9,-2.2,2.2); r.sv=lerp(r.sv,tv,1-Math.exp(-dt*14)); r.slide=clamp(r.slide+r.sv*dt+md*.0021,-r.max,r.max); }
      else rodAI(r,dt,{v:.9,k:0}); r.lift=!!inp.boost; }
    function step(dt, inp, md){ const n=Math.max(1,Math.ceil(dt/.004)), h=dt/n; ST.manual=Math.max(0,ST.manual-dt);
      if(!ST.demo && !ST.manual){ ST.active = B.x>.05 ? 5 : 3; }
      for(const r of RODS){ r.cool-=dt; let ctl='bot'; if(!ST.demo && r.team===0 && (r.i===3 || r.i===5)) ctl='me'; if(NET.hosting===id && NET.rin && r.team===1 && (r.i===2 || r.i===4)) ctl='net'; r.ctrl=ctl;
        if(ctl==='me') rodMe(r,dt,inp,md,r.i===ST.active); else if(ctl==='net') netRod(r,dt); else rodAI(r,dt,r.team===0?{v:1.25,k:.55}:{v:ST.demo?1.25:1.45,k:.65});
        let tgt=r.lift?-1.45:0, th=r.th; if(r.kickT>=0){ r.kickT+=dt; const t=r.kickT; tgt = t<.06 ? -.55*t/.06 : t<.14 ? -.55+2.05*(t-.06)/.08 : t<.42 ? 1.5*(1-(t-.14)/.28) : 0; if(t>=.42) r.kickT=-1; th=tgt; } else th=lerp(r.th,tgt,1-Math.exp(-dt*16));
        r.om=(th-r.th)/Math.max(dt,1e-4); r.th=th; }
      if(ST.phase==='play'){ for(let k=0;k<n;k++){ B.x+=B.vx*h; B.z+=B.vz*h; const zw=WF/2-R;
          if(B.z>zw){ B.z=zw; B.vz=-Math.abs(B.vz)*.78; if(Math.abs(B.vz)>.3) tick(Math.abs(B.vz)); } else if(B.z<-zw){ B.z=-zw; B.vz=Math.abs(B.vz)*.78; if(Math.abs(B.vz)>.3) tick(Math.abs(B.vz)); }
          const xw=L/2-R; if(Math.abs(B.x)>xw){ if(Math.abs(B.z)<GH-R*.4){ if(Math.abs(B.x)>L/2+.02){ goal(B.x>0?0:1); break; } } else { B.x=Math.sign(B.x)*xw; B.vx=-B.vx*.75; if(Math.abs(B.vx)>.3) thud(Math.abs(B.vx)*.4); } }
          for(const r of RODS){ if(Math.abs(r.th)>1.05) continue; const s=r.team?-1:1, fx=r.x+s*Math.sin(r.th)*FOOT; if(Math.abs(B.x-fx)>R+.017) continue;
            for(const o of r.offs){ const fz=r.slide+o, dx=B.x-fx, dz=B.z-fz, d=Math.hypot(dx,dz); if(d>=R+.015 || d<1e-6) continue; const nx=dx/d, nz=dz/d; B.x=fx+nx*(R+.015); B.z=fz+nz*(R+.015);
              const vfx=s*Math.cos(r.th)*FOOT*r.om, vfz=r.sv, rvx=B.vx-vfx, rvz=B.vz-vfz, vn=rvx*nx+rvz*nz; if(vn<0){ B.vx-=1.55*vn*nx; B.vz-=1.55*vn*nz; const sp=Math.hypot(B.vx,B.vz); if(sp>2.2){ clack(sp/4); if(!ST.demo && r.team===0 && sp>3) shake=Math.max(shake,.15); } else tick(sp); } } }
          const sp=Math.hypot(B.vx,B.vz); if(sp>6.5){ B.vx*=6.5/sp; B.vz*=6.5/sp; } const f=Math.max(0,1-.32*h); B.vx*=f; B.vz*=f; }
        if(ST.phase==='play'){ const sp=Math.hypot(B.vx,B.vz); B.still = sp<.04 ? B.still+dt : 0; if(B.still>2.2){ B.still=0; const reach=RODS.some(r=>Math.abs(B.x-r.x)<.05); if(!reach || B.still>4){ B.vz+=(B.z>0?-1:1)*.35; B.vx+=rr(-.2,.2); } } } }
      else if(ST.phase==='goal'){ ST.t-=dt; if(ST.t<=0) serve(); }
      else if(ST.phase==='serve') serve();
      else if(ST.phase==='over'){ ST.t-=dt; if(ST.t<=0 && ST.demo) reset(); }
      draw(); }
    function reset(){ ST.score=[0,0]; drawSB(0,0); ST.phase='serve'; for(const r of RODS){ r.slide=0; r.th=0; r.kickT=-1; } }
    const game={ title:'Bi lắc', r:1.5, id, g,
      stand:()=>{ const p=wp(g,0,0,1.0); return {x:p.x, z:p.z, yaw:wyaw(g,Math.PI)}; }, inter:()=>wp(g,0,0,.95),
      label:()=>NET.hostOpen(id) ? '⚽ Vào chơi cùng bi lắc – cầm 2 thanh tấn công đội xanh (E)' : '⚽ Chơi bi lắc 2 đấu 2 – bạn + bot đồng đội vs 2 bot (E)',
      enterAction:()=>{ if(NET.hostOpen(id)) NET.join(id, game); else enterGame(game); },
      start(){ ST.demo=false; reset(); ST.active=5; NET.hostStart(id); }, stop(){ ST.demo=true; NET.hostStop(id); if(NET.guest && NET.tid===id) NET.leave(); },
      key(code,down){ if(!down) return; if(code==='Space'){ if(ST.phase==='over' && !ST.demo){ reset(); return; } kick(RODS[ST.active]); if(NET.guest && NET.tid===id) NET.in.k=1; }
        if(code==='KeyA' || code==='ArrowLeft'){ ST.active=3; ST.manual=2; } if(code==='KeyD' || code==='ArrowRight'){ ST.active=5; ST.manual=2; } if(code==='KeyR'){ ST.active=ST.active===3?5:3; ST.manual=2.5; } },
      click(d){ if(d){ if(ST.phase==='over'){ reset(); return; } kick(RODS[ST.active]); } },
      update(dt,inp,mx,my){ if(NET.guest && NET.tid===id){ NET.guestStep(dt,inp,my,game); draw(); } else { step(dt,inp,my); NET.hostSend(id,game,dt); }
        const ar=RODS[ST.active]; hudSet('⚽ Bi lắc 2 đấu 2 · chạm 5', `🔴 Bạn & đồng đội  ${ST.score[0]} : ${ST.score[1]}  Đội xanh 🔵${NET.guest||NET.peers(id)?' 👥':''}`,
          ST.phase==='over' ? (ST.score[0]>ST.score[1]?'🏆 Bạn thắng! ':'😅 Thua rồi – ')+'Space: ván mới · Esc: thôi' : `W/S · chuột: đẩy/kéo thanh ${ar.n===5?'tiền vệ (5)':'tiền đạo (3)'} · Space/chuột trái: đá · Shift: nhấc thanh · A/D: đổi thanh · Esc: thôi`); },
      cam(o,dt){ const pp=wp(g,B.x*.18,1.5,1.0), lk=wp(g,B.x*.3,FY,-.06); o.pos.copy(pp); o.look.copy(lk); },
      idle(dt){ const c=W.camera.position, p=wp(g,0,1,0); if(Math.hypot(c.x-p.x,c.z-p.z)>22 || Math.abs(c.y-p.y)>6){ return; } ST.demo=true; step(dt,{ix:0,iz:0},0); },
      state:()=>({score:[...ST.score], phase:ST.phase, ball:[+B.x.toFixed(3),+B.z.toFixed(3),+Math.hypot(B.vx,B.vz).toFixed(2)], active:ST.active, rods:RODS.map(r=>[+r.slide.toFixed(3),+r.th.toFixed(2),r.ctrl])}),
      _: {B, ST, RODS, serve, kick, drawSB} };
    return reg(game); }

  /* ---------- 👥 chơi cùng qua máy chủ nhiều người (W.multi) – bàn bi lắc ----------
     chủ bàn (người vào trước) mô phỏng vật lý, gửi trạng thái 15 lần/giây; khách gửi lệnh 2 thanh tấn công đội xanh. */
  const NET={ guest:false, tid:null, open:new Map(), hosting:null, sendT:0, in:{s:0,k:0,l:0}, rin:null, st:null, gid:'g'+Math.floor(rnd()*1e9).toString(36),
    ok:()=>!!(W.multi && W.multi.connected && W.multi.connected()), send(o){ return this.ok() && W.multi.send(Object.assign({t:'game', g:'foos'},o)); },
    hostOpen(id){ const o=this.open.get(id); return !!(o && performance.now()-o.at<2500 && this.hosting!==id); }, peers(id){ return this.hosting===id && this.rin && performance.now()-this.rin.at<2000; },
    hostStart(id){ this.hosting=id; this.rin=null; }, hostStop(id){ if(this.hosting===id){ this.send({k:'close', tid:id}); this.hosting=null; this.rin=null; } },
    hostSend(id,game,dt){ if(this.hosting!==id || !this.ok()) return; this.sendT-=dt; if(this.sendT>0) return; this.sendT=1/15; const {B,ST,RODS}=game._; this.send({k:'st', tid:id, b:[B.x,B.z,B.vx,B.vz].map(v=>+v.toFixed(4)), r:RODS.map(r=>[+r.slide.toFixed(4),+r.th.toFixed(3)]), sc:ST.score, ph:ST.phase}); },
    join(id,game){ this.guest=true; this.tid=id; this.send({k:'join', tid:id, gid:this.gid}); enterGame(game); toast('👥 Đã vào bàn bi lắc của người chơi khác – bạn cầm 2 thanh tấn công đội xanh (W/S, Space).',3600); },
    leave(){ this.send({k:'bye', tid:this.tid, gid:this.gid}); this.guest=false; this.tid=null; this.st=null; },
    guestStep(dt,inp,my,game){ const {B,ST,RODS}=game._; this.in.s=clamp(this.in.s+(-inp.iz*1.8)*dt+my*.0021,-.25,.25); this.in.l=inp.boost?1:0; this.sendT-=dt; if(this.sendT<=0){ this.sendT=1/15; this.send({k:'in', tid:this.tid, gid:this.gid, s:+this.in.s.toFixed(4), kk:this.in.k, l:this.in.l}); this.in.k=0; }
      const s=this.st; if(s){ B.x=lerp(B.x,s.b[0],.5); B.z=lerp(B.z,s.b[1],.5); RODS.forEach((r,i)=>{ r.slide=lerp(r.slide,s.r[i][0],.5); r.th=lerp(r.th,s.r[i][1],.6); }); if(s.sc){ ST.score=s.sc; game._.drawSB(s.sc[0],s.sc[1]); } ST.phase=s.ph||ST.phase; } },
    netRod(r,dt){ const q=this.rin; if(!q || performance.now()-q.at>2000){ r.ctrl='bot'; return false; } const tgt=clamp(q.s,-r.max,r.max); r.sv=clamp((tgt-r.slide)*16,-2.2,2.2); r.slide=clamp(r.slide+r.sv*dt,-r.max,r.max); if(q.kk){ q.kk=0; r.kickT<0 && (r.kickT=0); } r.lift=!!q.l; return true; } };
  const netRod=(r,dt)=>{ if(!NET.netRod(r,dt)) r.ctrl='bot'; };
  try{ if(W.multi && W.multi.on) W.multi.on(m=>{ if(!m || m.t!=='game' || m.g!=='foos') return; const now=performance.now();
      if(m.k==='st'){ if(NET.hosting!==m.tid) NET.open.set(m.tid,{at:now}); if(NET.guest && NET.tid===m.tid) NET.st=m; }
      else if(m.k==='close'){ NET.open.delete(m.tid); if(NET.guest && NET.tid===m.tid){ toast('👥 Chủ bàn đã thôi chơi.',2400); exitGame(); } }
      else if(m.k==='join' && NET.hosting===m.tid){ NET.rin={s:0,kk:0,l:0,at:now,gid:m.gid}; toast('👥 Có người vào chơi cùng – họ cầm 2 thanh tấn công đội xanh!',3000); }
      else if(m.k==='in' && NET.hosting===m.tid){ NET.rin=Object.assign(NET.rin||{}, {s:m.s, kk:(NET.rin&&NET.rin.kk)||m.kk, l:m.l, at:now}); }
      else if(m.k==='bye' && NET.hosting===m.tid){ NET.rin=null; } }); }catch(e){}
  /* Bot dùng chung trong rodAI cho thanh khách khi khách mất kết nối: ctrl tự trả về 'bot'. */

  /* ============================================================================================
     🏒 KHÚC CÔN CẦU ĐĨA HƠI
     ============================================================================================ */
  function buildAirHockey(zone, lx, lz, ry){
    const g=new THREE.Group(); g.position.set(lx,0,lz); g.rotation.y=ry; zone.g.add(g);
    const L=2.0, WD=1.0, TY=.8, GW=.15, PR=.04, MR=.05;
    const surf=canvasTex(512,256,(c,w,h)=>{ c.fillStyle='#f4f6f8'; c.fillRect(0,0,w,h); c.fillStyle='rgba(30,40,60,.22)'; for(let x=8;x<w;x+=12) for(let y=8;y<h;y+=12){ c.beginPath(); c.arc(x,y,1.1,0,TAU); c.fill(); }
      c.strokeStyle='#d62828'; c.lineWidth=5; c.beginPath(); c.moveTo(w/2,0); c.lineTo(w/2,h); c.stroke(); c.beginPath(); c.arc(w/2,h/2,34,0,TAU); c.stroke(); c.strokeStyle='#1f5fbf'; for(const x of [0,w]){ c.beginPath(); c.arc(x,h/2,60,0,TAU); c.stroke(); } });
    add(g, rb(L+.2,.22,WD+.2,.05,3), M.black, 0,TY-.12,0); add(g, new THREE.PlaneGeometry(L,WD), std(0xffffff,.18,0,{map:surf}), 0,TY+.002,0,-Math.PI/2,0,0,false);
    for(const s of [-1,1]) add(g, rb(L+.2,.06,.1,.03,2), s<0?M.blue:M.red, 0,TY+.03,s*(WD/2+.05));
    for(const e of [-1,1]){ for(const s of [-1,1]) add(g, rb(.1,.06,WD/2-GW,.025,2), e<0?M.blue:M.red, e*(L/2+.05),TY+.03,s*(GW+(WD/2-GW)/2)); add(g, rb(.12,.1,GW*2+.04,.02,1), M.dark, e*(L/2+.09), TY-.06, 0); }
    for(const a of [-1,1]) for(const b of [-1,1]) add(g, rb(.12,TY-.23,.12,.03,2), M.black, a*(L/2-.1), (TY-.23)/2, b*(WD/2-.08));
    const skirtT=canvasTex(512,64,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#1f5fbf'); gr.addColorStop(.5,'#101318'); gr.addColorStop(1,'#c8231c'); c.fillStyle=gr; c.fillRect(0,0,w,h); c.fillStyle='#fff'; c.font='900 34px Segoe UI'; c.textAlign='center'; c.fillText('AIR HOCKEY · QA ARENA',w/2,44); });
    for(const s of [-1,1]) add(g, new THREE.PlaneGeometry(L,.14), std(0xffffff,.5,0,{map:skirtT, emissive:0xffffff, emissiveMap:skirtT, emissiveIntensity:.25}), 0,TY-.14,s*(WD/2+.101),0,s<0?Math.PI:0,0,false);
    const puck=add(g, new THREE.CylinderGeometry(PR,PR,.012,24), std(0xe0201c,.4), 0,TY+.008,0);
    const malG=new THREE.LatheGeometry([[0,0],[.05,0],[.05,.016],[.028,.024],[.02,.06],[.026,.075],[0,.08]].map(([x,y])=>new THREE.Vector2(x,y)),24);
    const mME=add(g, malG, M.red, .7,TY,0), mBOT=add(g, malG, M.blue, -.7,TY,0);
    { const rt=Math.abs(Math.sin(ry))>.5; colRect(zone.g, lx, lz, rt?.55:1.12, rt?1.12:.55, -.4, 1.2, '🏒 Bàn khúc côn cầu'); }
    /* bàn đặt dọc theo trục Z của khu (ry = π/2) */
    const pk={x:0,z:0,vx:0,vz:0}, A={x:.7,z:0,vx:0,vz:0}, Bo={x:-.7,z:0,vx:0,vz:0}, ST={score:[0,0], phase:'serve', t:0, demo:true, side:1};
    const hitM=(m)=>{ const dx=pk.x-m.x, dz=pk.z-m.z, d=Math.hypot(dx,dz); if(d>=PR+MR || d<1e-6) return; const nx=dx/d, nz=dz/d; pk.x=m.x+nx*(PR+MR); pk.z=m.z+nz*(PR+MR); const rvx=pk.vx-m.vx, rvz=pk.vz-m.vz, vn=rvx*nx+rvz*nz; if(vn<0){ pk.vx-=1.9*vn*nx; pk.vz-=1.9*vn*nz; clack(Math.hypot(pk.vx,pk.vz)/3); if(!ST.demo && m===A) shake=Math.max(shake,.12); } };
    function moveM(m, tx, tz, vmax, dt, side){ const dx=tx-m.x, dz=tz-m.z, d=Math.hypot(dx,dz), sp=Math.min(vmax, d*12); const vx=d>1e-4?dx/d*sp:0, vz=d>1e-4?dz/d*sp:0; m.vx=lerp(m.vx,vx,1-Math.exp(-dt*20)); m.vz=lerp(m.vz,vz,1-Math.exp(-dt*20)); m.x+=m.vx*dt; m.z+=m.vz*dt; clampM(m,side); }
    const clampM=(m,side)=>{ const x0=side>0?MR+.02:-L/2+MR, x1=side>0?L/2-MR:-MR-.02; m.x=clamp(m.x,x0,x1); m.z=clamp(m.z,-WD/2+MR,WD/2-MR); };
    function bot(m, side, dt, v){ const own=side*L/2;   /* side: nửa sân của chày (+1 người chơi, −1 bot); own = vạch gôn nhà */
      if(side*pk.x>0){ const tx=-own, dx=tx-pk.x, dz=-pk.z, dl=Math.hypot(dx,dz)||1, ux=dx/dl, uz=dz/dl, gap=PR+MR+.03, bx=pk.x-ux*gap, bz=pk.z-uz*gap, behind=side*(m.x-pk.x)>0;
        if(behind && Math.hypot(m.x-bx,m.z-bz)<.07) moveM(m, pk.x+ux*.2, pk.z+uz*.2, v, dt, side);   /* đã ở sau đĩa → đánh thẳng về gôn đối thủ */
        else if(!behind) moveM(m, bx, pk.z+(m.z>pk.z?1:-1)*(gap+.06), v, dt, side);   /* đang ở trước đĩa → vòng qua hông, không tự đẩy đĩa về gôn nhà */
        else moveM(m, bx, bz, v, dt, side); }
      else moveM(m, own-side*.18, clamp(pk.z*.6,-.28,.28), v*.85, dt, side); }
    function serve(side){ pk.x=side*.3; pk.z=rr(-.2,.2); pk.vx=pk.vz=0; ST.phase='play'; }
    function goal(team){ ST.score[team]++; ST.phase='goal'; ST.t=1.2; if(!ST.demo){ team===0?(cheer(),shake=.45):(boo(),shake=.2); hudPunch(); } else thud(.5); if(ST.score[team]>=7){ ST.phase='over'; ST.t=ST.demo?3:99; if(!ST.demo && team===0) reward(25,'🏒 Thắng khúc côn cầu! +25 💰'); } }
    function step(dt, inp, mx, my){ const n=Math.max(1,Math.ceil(dt/.004)), h=dt/n;
      if(ST.demo) bot(A,1,dt,1.8); else { const tvx=-inp.iz*2.8, tvz=-inp.ix*2.8; A.vx=lerp(A.vx,tvx,1-Math.exp(-dt*16)); A.vz=lerp(A.vz,tvz,1-Math.exp(-dt*16)); const ox=A.x, oz=A.z; A.x+=A.vx*dt+my*.003; A.z+=A.vz*dt-mx*.003; clampM(A,1); A.vx=(A.x-ox)/dt; A.vz=(A.z-oz)/dt; }
      bot(Bo,-1,dt,ST.demo?1.8:2.1);
      if(ST.phase==='play'){ for(let k=0;k<n;k++){ pk.x+=pk.vx*h; pk.z+=pk.vz*h; const zw=WD/2-PR; if(Math.abs(pk.z)>zw){ pk.z=Math.sign(pk.z)*zw; pk.vz*=-.9; tick(Math.abs(pk.vz)/2); }
          const xw=L/2-PR; if(Math.abs(pk.x)>xw){ if(Math.abs(pk.z)<GW-PR*.3){ if(Math.abs(pk.x)>L/2+.03){ goal(pk.x<0?0:1); break; } } else { pk.x=Math.sign(pk.x)*xw; pk.vx*=-.9; tick(Math.abs(pk.vx)/2); } }
          hitM(A); hitM(Bo); const sp=Math.hypot(pk.vx,pk.vz); if(sp>7){ pk.vx*=7/sp; pk.vz*=7/sp; } const f=Math.max(0,1-.12*h); pk.vx*=f; pk.vz*=f; } }
      else if(ST.phase==='goal'){ ST.t-=dt; if(ST.t<=0) serve(ST.score[0]>ST.score[1]?-1:1); } else if(ST.phase==='serve') serve(1); else if(ST.phase==='over'){ ST.t-=dt; if(ST.t<=0 && ST.demo) reset(); }
      puck.position.set(pk.x,TY+.008,pk.z); mME.position.set(A.x,TY,A.z); mBOT.position.set(Bo.x,TY,Bo.z); }
    const reset=()=>{ ST.score=[0,0]; ST.phase='serve'; A.x=.7; A.z=0; Bo.x=-.7; Bo.z=0; };
    return reg({ title:'Khúc côn cầu', r:1.4, stand:()=>{ const p=wp(g,L/2+.55,0,0); return {x:p.x, z:p.z, yaw:wyaw(g,-Math.PI/2)}; }, inter:()=>wp(g,L/2+.5,0,0), label:()=>'🏒 Chơi khúc côn cầu đĩa hơi – đấu bot (E)',
      start(){ ST.demo=false; reset(); }, stop(){ ST.demo=true; reset(); }, key(c,d){ if(d && c==='Space' && ST.phase==='over') reset(); }, click(d){ if(d && ST.phase==='over') reset(); },
      update(dt,inp,mx,my){ step(dt,inp,mx,my); hudSet('🏒 Khúc côn cầu đĩa hơi · chạm 7', `🔴 Bạn  ${ST.score[0]} : ${ST.score[1]}  Bot 🔵`, ST.phase==='over' ? (ST.score[0]>ST.score[1]?'🏆 Bạn thắng! ':'😅 Thua rồi – ')+'Space: ván mới · Esc: thôi' : 'WASD / phím mũi tên / di chuột: điều khiển chày · đánh đĩa vào khe gôn đối thủ · Esc: thôi'); },
      cam(o){ o.pos.copy(wp(g,L/2+.78,1.62,0)); o.look.copy(wp(g,-.15,TY,0)); }, idle(dt){ const c=W.camera.position, p=wp(g,0,1,0); if(Math.hypot(c.x-p.x,c.z-p.z)>22 || Math.abs(c.y-p.y)>6) return; ST.demo=true; step(dt,{ix:0,iz:0},0,0); },
      state:()=>({score:[...ST.score], phase:ST.phase, puck:[+pk.x.toFixed(2),+pk.z.toFixed(2)]}) }); }

  /* ============================================================================================
     🏓 BÓNG BÀN
     ============================================================================================ */
  function buildPingPong(zone, lx, lz, ry){
    const g=new THREE.Group(); g.position.set(lx,0,lz); g.rotation.y=ry; zone.g.add(g);
    const L=2.74, WD=1.525, TY=.76, NH=.1525, BR=.02, GR=9.8;
    const topT=canvasTex(512,286,(c,w,h)=>{ c.fillStyle='#1d4f8f'; c.fillRect(0,0,w,h); c.strokeStyle='#fff'; c.lineWidth=5; c.strokeRect(3,3,w-6,h-6); c.lineWidth=2; c.beginPath(); c.moveTo(0,h/2); c.lineTo(w,h/2); c.stroke(); });
    add(g, rb(L,.035,WD,.008,1), std(0xffffff,.32,0,{map:topT}), 0,TY-.018,0); add(g, rb(L-.2,.06,WD-.2,.01,1), M.black, 0,TY-.06,0);
    for(const a of [-1,1]) for(const b of [-1,1]){ add(g, new THREE.CylinderGeometry(.03,.03,TY-.09,10), M.steel, a*(L/2-.25),(TY-.09)/2,b*(WD/2-.15)); add(g, new THREE.CylinderGeometry(.045,.045,.04,12), M.rubber, a*(L/2-.25),.02,b*(WD/2-.15)); }
    add(g, rb(L-.6,.04,.05,.01,1), M.steel, 0,.3,0);
    const netT=canvasTex(256,32,(c,w,h)=>{ c.clearRect(0,0,w,h); c.strokeStyle='rgba(20,20,20,.75)'; c.lineWidth=1; for(let x=0;x<w;x+=6){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); } for(let y=0;y<h;y+=6){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); } c.fillStyle='#fff'; c.fillRect(0,0,w,4); });
    add(g, new THREE.PlaneGeometry(WD+.3,NH), std(0xffffff,.8,0,{map:netT, transparent:true, side:THREE.DoubleSide, alphaTest:.05}), 0,TY+NH/2,0,0,Math.PI/2,0,false);
    for(const s of [-1,1]) add(g, new THREE.CylinderGeometry(.012,.012,NH+.02,8), M.black, 0,TY+NH/2,s*(WD/2+.15));
    const ballM=add(g, new THREE.SphereGeometry(BR,14,10), std(0xff8a1e,.4), 0,TY+.3,0);
    const padG=vcol([[new THREE.CylinderGeometry(.075,.075,.012,22),0xc8231c,0,0,0,Math.PI/2,0,0],[rb(.025,.1,.022,.006,1),0x7a4a26,0,-.11,0]]);
    const pMe=add(g, padG, std(0xffffff,.5,0,{vertexColors:true}), L/2+.3,TY+.25,0), pBot=add(g, padG, std(0xffffff,.5,0,{vertexColors:true}), -L/2-.3,TY+.25,0);
    pMe.rotation.y=Math.PI/2; pBot.rotation.y=-Math.PI/2;
    colRect(zone.g, lx, lz, L/2+.05, WD/2+.05, -.4, 1.0, '🏓 Bàn bóng bàn');
    const b={x:0,y:TY+.3,z:0,vx:0,vy:0,vz:0}, me2={z:0,x:L/2+.35,sw:0}, bt={z:0,x:-L/2-.35,sw:0}, ST={score:[0,0], phase:'serve', server:0, t:0, last:-1, bounces:[0,0], swing:0, over:false};
    function shot(fromSide, tx, tz, T){ /* bắn bóng từ vị trí hiện tại tới điểm (tx,tz) trên mặt bàn sau T giây; nâng T nếu chưa qua lưới */
      for(let k=0;k<6;k++){ const vx=(tx-b.x)/T, vz=(tz-b.z)/T, vy=(TY+BR-b.y+.5*GR*T*T)/T, tn=(0-b.x)/vx; const yn=b.y+vy*tn-.5*GR*tn*tn; if(tn<0 || yn>TY+NH+BR+.03){ b.vx=vx; b.vy=vy; b.vz=vz; return; } T*=1.12; }
      b.vx=(tx-b.x)/T; b.vz=(tz-b.z)/T; b.vy=(TY+BR-b.y+.5*GR*T*T)/T; }
    function point(team, why){ ST.score[team]++; ST.phase='dead'; ST.t=1.3; if(team===0){ cheer(); hudPunch(); } else boo(); ST.msg=why;
      if(ST.score[team]>=11){ ST.phase='over'; if(team===0) reward(25,'🏓 Thắng bóng bàn 11–'+ST.score[1]+'! +25 💰'); } }
    function serve(){ ST.server=Math.floor((ST.score[0]+ST.score[1])/2)%2; const s=ST.server===0?1:-1; b.x=s*(L/2+.25); b.z=s>0?me2.z:bt.z; b.y=TY+.32; b.vx=b.vy=b.vz=0; ST.phase=ST.server===0?'myServe':'botServe'; ST.t=ST.server===0?0:1.0; ST.bounces=[0,0]; ST.last=-1; }
    function hit(team, q, aim, smash){ const s=team===0?-1:1; const tx=s*rr(.45, q>.6?1.2:1.0), tz=clamp(b.z*.35+aim*.55+(rnd()-.5)*(1.1-q)*.45,-.68,.68); shot(team, q<.18 && rnd()<.5 ? s*(L/2+.25) : tx, q<.18 && rnd()<.5 ? (rnd()<.5?-.9:.9) : tz, smash?.42:.64); ST.last=team; ST.bounces=[0,0]; tick(2); if(team===0) me2.sw=1; else bt.sw=1; }
    function step(dt, inp){ /* vợt người chơi */ if(!ST.demo){ me2.z=clamp(me2.z-inp.ix*2.4*dt,-.95,.95); me2.x=clamp(me2.x-inp.iz*1.2*dt, L/2+.12, L/2+.7); } else { me2.z=lerp(me2.z, clamp(b.z,-.9,.9), 1-Math.exp(-dt*4)); }
      bt.z=lerp(bt.z, clamp(b.vx<0 ? b.z+b.vz*Math.max(0,(bt.x-b.x)/Math.min(-.1,b.vx)) : b.z*.4,-.9,.9), 1-Math.exp(-dt*3.2));
      if(ST.phase==='myServe'){ b.x=me2.x-.12; b.z=me2.z; b.y=TY+.32+Math.sin(performance.now()/180)*.03; if(ST.demo && (ST.t+=dt)>.8){ hit(0,.8,rr(-.6,.6),false); ST.phase='rally'; } }
      else if(ST.phase==='botServe'){ b.x=bt.x+.12; b.z=bt.z; b.y=TY+.32; ST.t-=dt; if(ST.t<=0){ hit(1,.85,rr(-.6,.6),false); ST.phase='rally'; } }
      else if(ST.phase==='rally'){ const n=Math.max(1,Math.ceil(dt/.004)), h=dt/n; for(let k=0;k<n;k++){ const px=b.x; b.vy-=GR*h; b.x+=b.vx*h; b.y+=b.vy*h; b.z+=b.vz*h; const fr=1-.05*h; b.vx*=fr; b.vz*=fr;
          if(px*b.x<=0 && b.y<TY+NH+BR && Math.abs(b.z)<WD/2+.15){ b.vx*=-.15; b.x=Math.sign(px)*.01; point(ST.last===0?1:0,'🥅 Bóng chạm lưới'); return; }
          if(b.y<TY+BR && b.vy<0 && Math.abs(b.x)<L/2 && Math.abs(b.z)<WD/2){ b.y=TY+BR; b.vy=-b.vy*.86; const side=b.x>0?0:1; tick(1.4);
            if(side===ST.last){ point(side===0?1:0, side===0?'❌ Bóng nảy bên mình':'✅ Bot đánh hỏng'); return; } ST.bounces[side]++; if(ST.bounces[side]>=2){ point(side===0?1:0, side===0?'❌ Bạn không đỡ kịp':'✅ Bot không đỡ kịp'); return; } }
          if(b.y<TY-.25){ point(ST.bounces[ST.last===0?1:0]>0 ? ST.last : (ST.last===0?1:0), ST.bounces[ST.last===0?1:0]>0?'✅ Ăn điểm':'❌ Bóng ra ngoài'); return; } }
        /* bot đánh trả */ if(ST.last===0 && ST.bounces[1]===1 && b.x<-L/2+.35 && b.vx<0 && b.y>TY+.03){ const miss=rnd()<(ST.demo?.08:.16)+Math.max(0,Math.hypot(b.vx,b.vz)-5)*.08; if(!miss) hit(1, rr(.55,.95), rr(-.7,.7), rnd()<.15); }
        /* tự đánh khi xem demo */ if(ST.demo && ST.last===1 && ST.bounces[0]===1 && b.x>L/2-.3 && b.vx>0) hit(0,.8,rr(-.6,.6),false); }
      else if(ST.phase==='dead'){ ST.t-=dt; b.vy-=GR*dt; b.y=Math.max(TY-.7,b.y+b.vy*dt); b.x+=b.vx*dt*.5; if(ST.t<=0) serve(); }
      else if(ST.phase==='over' && ST.demo){ ST.score=[0,0]; serve(); }
      me2.sw=Math.max(0,me2.sw-dt*4); bt.sw=Math.max(0,bt.sw-dt*4);
      ballM.position.set(b.x,b.y,b.z); const hy=y=>clamp(y,TY+.12,TY+.6); pMe.position.set(me2.x,hy(b.y),me2.z); pMe.rotation.set(0,Math.PI/2,-me2.sw*.9); pBot.position.set(bt.x,hy(b.y),bt.z); pBot.rotation.set(0,-Math.PI/2,bt.sw*.9); }
    function tryHit(smash){ if(ST.phase==='myServe'){ hit(0,.85,-(G&&G.inp?G.inp.ix:0),smash); ST.phase='rally'; return; } if(ST.phase==='over'){ ST.score=[0,0]; serve(); return; }
      if(ST.phase!=='rally' || ST.last!==1 || ST.bounces[0]!==1) { if(ST.phase==='rally'){ me2.sw=1; } return; }
      const dx=Math.abs(b.x-me2.x), dz=Math.abs(b.z-me2.z); if(dx<.42 && dz<.42 && b.y>TY+.02 && b.y<TY+.8){ const q=clamp(1-dx/.42-dz*.6,0,1); hit(0,q,-(G&&G.inp?G.inp.ix:0),smash); } else me2.sw=1; }
    return reg({ title:'Bóng bàn', r:1.4, stand:()=>{ const p=wp(g,me2.x+.25,0,me2.z); return {x:p.x, z:p.z, yaw:wyaw(g,-Math.PI/2)}; }, inter:()=>wp(g,L/2+.55,0,0), label:()=>'🏓 Chơi bóng bàn – đấu bot (E)',
      start(){ ST.demo=false; ST.score=[0,0]; me2.z=0; serve(); }, stop(){ ST.demo=true; ST.score=[0,0]; serve(); }, key(c,d){ if(d && c==='Space') tryHit(!!KEY.ShiftLeft || !!KEY.ShiftRight); }, click(d){ if(d) tryHit(false); },
      update(dt,inp){ step(dt,inp); const sv=ST.server===0?'🏓 Bạn giao':'🤖 Bot giao'; hudSet('🏓 Bóng bàn · chạm 11', `Bạn  ${ST.score[0]} : ${ST.score[1]}  Bot`, ST.phase==='over' ? (ST.score[0]>ST.score[1]?'🏆 Bạn thắng! ':'😅 Thua rồi – ')+'Space: ván mới · Esc: thôi' : `${ST.msg && ST.phase==='dead'?ST.msg+' · ':''}${ST.phase==='myServe'?'Space: giao bóng · ':''}A/D: chạy ngang · W/S: lên/lùi · Space đúng lúc bóng tới: đánh (giữ A/D = hướng, Shift = đập) · ${sv}`); },
      cam(o){ o.pos.copy(wp(g,L/2+1.35,1.48,me2.z*.5)); o.look.copy(wp(g,-.2,TY+.12,me2.z*.25)); }, idle(dt){ const c=W.camera.position, p=wp(g,0,1,0); if(Math.hypot(c.x-p.x,c.z-p.z)>22 || Math.abs(c.y-p.y)>6) return; ST.demo=true; step(dt,{ix:0,iz:0}); },
      state:()=>({score:[...ST.score], phase:ST.phase, ball:[+b.x.toFixed(2),+b.y.toFixed(2),+b.z.toFixed(2)], last:ST.last, bounces:[...ST.bounces]}) }); }

  /* ============================================================================================
     🎯 PHI TIÊU
     ============================================================================================ */
  function buildDarts(zone, lx, lz, ry){
    const g=new THREE.Group(); g.position.set(lx,0,lz); g.rotation.y=ry; zone.g.add(g);
    const CY=1.73, BRD=.226, ORDER=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5], THROW=2.37;
    const boardT=canvasTex(1024,1024,(c,w)=>{ const cx=w/2, k=w/2/BRD; c.fillStyle='#111'; c.beginPath(); c.arc(cx,cx,w/2,0,TAU); c.fill(); const ring=(r0,r1,cols)=>{ for(let i=0;i<20;i++){ const a0=-Math.PI/2+(i-.5)*TAU/20, a1=a0+TAU/20; c.fillStyle=cols[i%2]; c.beginPath(); c.arc(cx,cx,r1*k,a0,a1); c.arc(cx,cx,r0*k,a1,a0,true); c.closePath(); c.fill(); } };
      ring(.0159,.099,['#1b1b1b','#efe3c2']); ring(.099,.107,['#c8231c','#1d7a3e']); ring(.107,.162,['#1b1b1b','#efe3c2']); ring(.162,.170,['#c8231c','#1d7a3e']);
      c.fillStyle='#1d7a3e'; c.beginPath(); c.arc(cx,cx,.0159*k,0,TAU); c.fill(); c.fillStyle='#c8231c'; c.beginPath(); c.arc(cx,cx,.00635*k,0,TAU); c.fill();
      c.strokeStyle='#bfc4c9'; c.lineWidth=2; for(const r of [.0159,.099,.107,.162,.170]){ c.beginPath(); c.arc(cx,cx,r*k,0,TAU); c.stroke(); } c.fillStyle='#f4f1ea'; c.font='bold 46px Segoe UI'; c.textAlign='center'; c.textBaseline='middle'; for(let i=0;i<20;i++){ const a=-Math.PI/2+i*TAU/20; c.fillText(String(ORDER[i]), cx+Math.cos(a)*.196*k, cx+Math.sin(a)*.196*k); } });
    add(g, rb(.86,1.05,.06,.02,2), M.wood, 0,CY,-.06); for(const s of [-1,1]) add(g, rb(.43,1.05,.03,.012,1), M.wood, s*.66,CY,.05,0,s*.9,0);   /* tủ gỗ 2 cánh mở */
    add(g, new THREE.CylinderGeometry(BRD+.01,BRD+.01,.04,48), M.black, 0,CY,-.015,Math.PI/2,0,0); add(g, new THREE.CircleGeometry(BRD,64), std(0xffffff,.8,0,{map:boardT}), 0,CY,.006,0,0,0,false);
    add(g, rb(.12,1.2,.12,.03,2), M.black, 0,.6,-.12); add(g, rb(.7,.05,.5,.02,1), M.black, 0,.025,-.1);
    const ocheT=canvasTex(256,32,(c,w,h)=>{ c.fillStyle='#d4af37'; c.fillRect(0,0,w,h); c.fillStyle='#111'; c.font='800 22px Segoe UI'; c.textAlign='center'; c.fillText('OCHE 2,37 m',w/2,23); });
    add(g, new THREE.PlaneGeometry(.9,.1), std(0xffffff,.5,0,{map:ocheT, polygonOffset:true, polygonOffsetFactor:-2}), 0,.004,THROW,-Math.PI/2,0,0,false);
    { const rt=Math.abs(Math.sin(ry))>.5; colRect(zone.g, lx, lz, rt?.2:.58, rt?.58:.2, -.4, 2.4, '🎯 Bảng phi tiêu'); }
    const dartG=vcol([[new THREE.CylinderGeometry(.0035,.0035,.035,6),0xdcdcdc,0,0,.0175,Math.PI/2,0,0],[new THREE.CylinderGeometry(.006,.005,.06,10),0x2a2a2a,0,0,.065,Math.PI/2,0,0],[new THREE.CylinderGeometry(.003,.003,.04,6),0x888888,0,0,.115,Math.PI/2,0,0],[new THREE.BoxGeometry(.0015,.03,.035),0xc8231c,0,0,.14],[new THREE.BoxGeometry(.03,.0015,.035),0xc8231c,0,0,.14]]);
    const dartM=std(0xffffff,.45,.3,{vertexColors:true}), darts=[...Array(9)].map(()=>{ const m=add(g,dartG,dartM,0,-5,0,0,0,0,false); m.visible=false; return m; });
    const ret=add(g, new THREE.TorusGeometry(.011,.0025,6,20), std(0x46d39a,.4,0,{emissive:0x46d39a, emissiveIntensity:1.2}), 0,CY,.02,0,0,0,false); ret.visible=false;
    const ST={aim:[0,0], fly:null, n:0, scores:[], phase:'aim', t:0};
    const scoreAt=(x,y)=>{ const r=Math.hypot(x,y); if(r<.00635) return [50,'BULL 50']; if(r<.0159) return [25,'25']; if(r>.170) return [0,'trượt']; const a=(Math.atan2(x,y)+TAU+Math.PI/20)%TAU, base=ORDER[Math.floor(a/(TAU/20))%20]; if(r>.099 && r<.107) return [base*3,'×3 '+base]; if(r>.162) return [base*2,'×2 '+base]; return [base, String(base)]; };
    function throwDart(){ if(ST.phase==='done'){ reset(); return; } if(ST.fly || ST.n>=9) return; const t=performance.now()/1000, sw=[Math.sin(t*1.7)*.024+Math.sin(t*3.1)*.011, Math.cos(t*1.3)*.024+Math.sin(t*2.3)*.009], sp=[rr(-.013,.013), rr(-.013,.013)];
      const tgt=[ST.aim[0]+sw[0]+sp[0], ST.aim[1]+sw[1]+sp[1]]; ST.fly={t:0, T:.34, from:new V3(.16,1.5,THROW-.15), to:new V3(tgt[0],CY+tgt[1],.004), m:darts[ST.n]}; ST.fly.m.visible=true; snd(500,.12,'sine',.05,260); }
    function reset(){ ST.n=0; ST.scores=[]; ST.phase='aim'; for(const d of darts){ d.visible=false; } }
    function update(dt, inp, mx, my){ ST.aim[0]=clamp(ST.aim[0]+inp.ix*.22*dt+mx*.00045,-.3,.3); ST.aim[1]=clamp(ST.aim[1]+inp.iz*.22*dt-my*.00045,-.3,.3);
      const t=performance.now()/1000, sw=[Math.sin(t*1.7)*.024+Math.sin(t*3.1)*.011, Math.cos(t*1.3)*.024+Math.sin(t*2.3)*.009]; ret.visible=!ST.fly && ST.phase==='aim'; ret.position.set(ST.aim[0]+sw[0],CY+ST.aim[1]+sw[1],.012);
      const f=ST.fly; if(f){ f.t+=dt; const u=Math.min(1,f.t/f.T); const p=new V3().lerpVectors(f.from,f.to,u); p.y+=Math.sin(u*Math.PI)*.12; f.m.position.copy(p); f.m.rotation.set(-.12*(1-u)+.05,0,0);
        if(u>=1){ const [pts,lab]=scoreAt(f.to.x,f.to.y-CY); ST.scores.push([pts,lab]); ST.n++; ST.fly=null; thud(.6); if(pts>=50){ cheer(); shake=.2; hudPunch(); } else if(pts>=40) { snd(880,.15,'triangle',.08); hudPunch(); }
          if(ST.n>=9){ ST.phase='done'; const tot=ST.scores.reduce((s,v)=>s+v[0],0), best=S.brainGames.darts||0; if(tot>best){ S.brainGames.darts=tot; save(); toast(`🎯 Kỷ lục mới: ${tot} điểm!`,3000); } if(tot>=180) reward(20,'🎯 Phi tiêu ≥ 180 điểm! +20 💰'); } } } }
    return reg({ title:'Phi tiêu', r:1.3, stand:()=>{ const p=wp(g,0,0,THROW+.25); return {x:p.x, z:p.z, yaw:wyaw(g,0)}; }, inter:()=>wp(g,0,0,THROW+.2), label:()=>'🎯 Chơi phi tiêu – 3 lượt × 3 mũi (E)',
      start(){ reset(); }, stop(){ ret.visible=false; }, key(c,d){ if(d && c==='Space') throwDart(); }, click(d){ if(d) throwDart(); },
      update(dt,inp,mx,my){ update(dt,inp,mx,my); const tot=ST.scores.reduce((s,v)=>s+v[0],0), turn=Math.min(3,Math.floor(ST.n/3)+1); hudSet('🎯 Phi tiêu · 3 lượt × 3 mũi', `Tổng ${tot} điểm`, ST.phase==='done' ? `Xong 9 mũi · kỷ lục ${S.brainGames.darts||tot} · Space: chơi lại · Esc: thôi` : `Lượt ${turn}/3 · ${ST.scores.slice(-3).map(s=>s[1]).join(' · ')||'chưa phóng'} · WASD / chuột: ngắm (tay rung nhẹ) · Space / chuột trái: phóng`); },
      cam(o){ o.pos.copy(wp(g,.0,1.66,1.25)); o.look.copy(wp(g,0,CY,0)); }, state:()=>({n:ST.n, scores:ST.scores.map(s=>s[0]), phase:ST.phase}) }); }

  /* ============================================================================================
     🏀 NÉM BÓNG RỔ ARCADE
     ============================================================================================ */
  function buildHoops(zone, lx, lz, ry, k){
    const g=new THREE.Group(); g.position.set(lx,0,lz); g.rotation.y=ry; zone.g.add(g);
    const HX=0, HY=2.05, HZ=-1.25, RIM=.19, BRAD=.1, GR=9.8;
    const ballT=canvasTex(256,128,(c,w,h)=>{ c.fillStyle='#e0661e'; c.fillRect(0,0,w,h); for(let i=0;i<4000;i++){ c.fillStyle=`rgba(0,0,0,${Math.random()*.08})`; c.fillRect(Math.random()*w,Math.random()*h,2,2); } c.strokeStyle='#1a1a1a'; c.lineWidth=4; c.beginPath(); c.moveTo(0,h/2); c.lineTo(w,h/2); c.stroke(); for(const x of [w/4,w*3/4]){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); } });
    const ballMat=std(0xffffff,.7,0,{map:ballT});
    /* máy: thân, dốc thu bóng, lồng lưới 2 bên, bảng, vành, lưới rổ, bảng LED */
    add(g, rb(1.3,.9,.7,.04,2), M.black, 0,.45,.95); add(g, rb(1.36,.08,.76,.03,2), M.gold, 0,.93,.95);
    { const ramp=add(g, rb(1.2,.06,2.2,.02,1), M.woodL, 0,1.05,-.15); ramp.rotation.x=-.12; }
    for(const s of [-1,1]){ add(g, rb(.06,1.9,2.6,.02,1), M.black, s*.66,1.2,-.2); const pn=add(g, new THREE.PlaneGeometry(2.5,1.3), M.net, s*.63,1.75,-.2,0,Math.PI/2,0,false); }
    add(g, rb(1.36,.1,.1,.03,1), M.gold, 0,2.85,-1.45); add(g, rb(.1,2.85,.1,.03,1), M.black, -.66,1.42,-1.45); add(g, rb(.1,2.85,.1,.03,1), M.black, .66,1.42,-1.45);
    const bbT=canvasTex(256,192,(c,w,h)=>{ c.fillStyle='rgba(230,240,248,.9)'; c.fillRect(0,0,w,h); c.strokeStyle='#c8231c'; c.lineWidth=6; c.strokeRect(6,6,w-12,h-12); c.strokeRect(w/2-40,h-90,80,60); });
    add(g, new THREE.PlaneGeometry(1.0,.75), std(0xffffff,.2,0,{map:bbT, transparent:true, opacity:.92}), HX,HY+.28,-1.44,0,0,0,false);
    add(g, new THREE.TorusGeometry(RIM,.011,8,36), std(0xff5a1e,.35,.6), HX,HY,HZ,Math.PI/2,0,0); add(g, rb(.08,.04,.08,.01,1), std(0xff5a1e,.35,.6), HX,HY,HZ-RIM-.03);
    const net=add(g, new THREE.CylinderGeometry(RIM,RIM*.6,.3,16,4,true), new THREE.MeshStandardMaterial({color:0xffffff, wireframe:true, transparent:true, opacity:.8}), HX,HY-.15,HZ,0,0,0,false);
    const ledT=canvasTex(512,128,()=>{}), led=add(g, new THREE.PlaneGeometry(1.2,.3), std(0x000000,.5,0,{emissive:0xffffff, emissiveMap:ledT, emissiveIntensity:1.1, map:ledT}), 0,3.1,-1.45,0,0,0,false); add(g, rb(1.32,.38,.12,.03,1), M.black, 0,3.1,-1.52);
    const drawLED=(sc,t)=>{ const c=ledT.image.getContext('2d'); c.fillStyle='#050608'; c.fillRect(0,0,512,128); c.font='900 64px Consolas,monospace'; c.textBaseline='middle'; c.fillStyle='#ff3b30'; c.textAlign='left'; c.fillText(String(sc).padStart(3,'0'),24,66); c.fillStyle='#ffd23f'; c.textAlign='right'; c.fillText(t>=0?String(Math.ceil(t)).padStart(2,'0'):'--',488,66); c.fillStyle='#46d39a'; c.font='800 22px Segoe UI'; c.textAlign='center'; c.fillText(k?'QC SHOOT 2':'QC SHOOT 1',256,24); ledT.needsUpdate=true; }; drawLED(0,-1);
    colRect(zone.g, lx, lz-.15, .7, 1.45, -.4, 3.2, '🏀 Máy ném bóng rổ');
    const BALLS=[...Array(5)].map(()=>{ const m=add(g,new THREE.SphereGeometry(BRAD,18,12),ballMat,0,-9,0); return {m, x:0,y:-9,z:0,vx:0,vy:0,vz:0, live:false, sc:false}; });
    const hold=add(g,new THREE.SphereGeometry(BRAD,18,12),ballMat,0,1.25,.95); hold.visible=false;
    const ST={score:0, t:45, phase:'ready', aim:0, pw:0, pdir:1, charging:false, cool:0, swish:0};
    function shoot(){ const pw=ST.pw, b=BALLS.find(q=>!q.live); if(!b || ST.cool>0 || ST.phase!=='play') return; ST.cool=.38; const p0=[0,1.3,.85], a=ST.aim, d=Math.hypot(HX-p0[0],HZ-p0[2])/Math.cos(a), h=HY-p0[1], al=62*Math.PI/180, v0=Math.sqrt(GR*d*d/(2*Math.cos(al)**2*(d*Math.tan(al)-h)));
      const v=v0*(.86+pw*.28), dir=[Math.sin(a),-Math.cos(a)]; Object.assign(b,{x:p0[0],y:p0[1],z:p0[2], vx:dir[0]*v*Math.cos(al), vz:dir[1]*v*Math.cos(al), vy:v*Math.sin(al), live:true, sc:false, t:0}); b.m.visible=true; snd(260,.1,'sine',.07,180); }
    function rimHit(b){ /* điểm gần nhất trên vòng vành */ const dx=b.x-HX, dz=b.z-HZ, dh=Math.hypot(dx,dz)||1e-6, cx=HX+dx/dh*RIM, cz=HZ+dz/dh*RIM, ex=b.x-cx, ey=b.y-HY, ez=b.z-cz, d=Math.hypot(ex,ey,ez), m=BRAD+.011;
      if(d<m && d>1e-6){ const nx=ex/d, ny=ey/d, nz=ez/d; b.x=cx+nx*m; b.y=HY+ny*m; b.z=cz+nz*m; const vn=b.vx*nx+b.vy*ny+b.vz*nz; if(vn<0){ b.vx-=1.55*vn*nx; b.vy-=1.55*vn*ny; b.vz-=1.55*vn*nz; clack(.8); } } }
    function step(dt){ ST.cool-=dt; if(ST.phase==='play'){ ST.t-=dt; if(ST.t<=0){ ST.t=0; ST.phase='done'; const best=S.brainGames.hoops||0; if(ST.score>best){ S.brainGames.hoops=ST.score; save(); toast(`🏀 Kỷ lục mới: ${ST.score} điểm!`,3000); } if(ST.score>=40) reward(20,'🏀 Ném rổ ≥ 40 điểm! +20 💰'); buzzer(); } }
      if(ST.charging){ ST.pw+=ST.pdir*dt/1.1; if(ST.pw>1){ ST.pw=1; ST.pdir=-1; } if(ST.pw<0){ ST.pw=0; ST.pdir=1; } }
      const n=Math.max(1,Math.ceil(dt/.005)), h=dt/n;
      for(const b of BALLS){ if(!b.live) continue; for(let i=0;i<n;i++){ const py=b.y; b.vy-=GR*h; b.x+=b.vx*h; b.y+=b.vy*h; b.z+=b.vz*h;
          if(b.z<-1.44+BRAD && b.y>HY-.1 && b.y<HY+.66 && Math.abs(b.x)<.5 && b.vz<0){ b.z=-1.44+BRAD; b.vz=-b.vz*.55; thud(.4); }
          if(Math.abs(b.x)>.6-BRAD){ b.x=Math.sign(b.x)*(.6-BRAD); b.vx*=-.5; }
          rimHit(b); if(!b.sc && py>HY && b.y<=HY && b.vy<0 && Math.hypot(b.x-HX,b.z-HZ)<RIM-BRAD*.35){ b.sc=true; const pts=ST.t<=10?3:2; if(ST.phase==='play'){ ST.score+=pts; hudPunch(); snd(988,.12,'triangle',.09); setTimeout(()=>snd(1318,.16,'triangle',.08),90); } ST.swish=1; }
          const fy=1.05+(b.z+.15)*.12; if(b.y<fy+BRAD && b.z>-1.3 && b.z<.95){ b.y=fy+BRAD; b.vy=Math.abs(b.vy)*.35; b.vz=Math.abs(b.vz)*.2+.6; } if(b.z>.9 || b.y<.4){ b.live=false; b.m.visible=false; break; } }
        b.m.position.set(b.x,b.y,b.z); b.m.rotation.x-=dt*8; }
      ST.swish=Math.max(0,ST.swish-dt*3); net.scale.set(1,1+ST.swish*.25,1); hold.visible=G&&G.k===k && ST.phase==='play' && ST.cool<=0; hold.position.set(Math.sin(ST.aim)*.2,1.25,.92); drawLEDThrottle(); }
    let ledT0=0, lastSc=-1, lastT=-1; const drawLEDThrottle=()=>{ const t=Math.ceil(ST.t); if(ST.score!==lastSc || t!==lastT){ lastSc=ST.score; lastT=t; drawLED(ST.score, ST.phase==='ready'?-1:ST.t); } };
    const buzzer=()=>snd(160,.6,'square',.07,150);
    const game={ title:'Ném bóng rổ', k, r:1.3, stand:()=>{ const p=wp(g,0,0,1.65); return {x:p.x, z:p.z, yaw:wyaw(g,0)}; }, inter:()=>wp(g,0,0,1.55), label:()=>`🏀 Chơi máy ném bóng rổ ${k+1} – 45 giây (E)`,
      start(){ ST.score=0; ST.t=45; ST.phase='play'; ST.aim=0; ST.pw=0; }, stop(){ ST.phase='ready'; ST.charging=false; hold.visible=false; },
      key(c,d){ if(c==='Space'){ if(d){ if(ST.phase==='done'){ game.start(); return; } ST.charging=true; ST.pw=0; ST.pdir=1; } else if(ST.charging){ ST.charging=false; shoot(); } } }, click(d){ if(d){ if(ST.phase==='done'){ game.start(); return; } ST.charging=true; ST.pw=0; ST.pdir=1; } else if(ST.charging){ ST.charging=false; shoot(); } },
      update(dt,inp,mx){ ST.aim=clamp(ST.aim+inp.ix*.5*dt+mx*.0012,-.22,.22); step(dt); hudSet(`🏀 Ném bóng rổ · máy ${k+1}`, `${ST.score} điểm · ⏱ ${Math.ceil(ST.t)} s`, ST.phase==='done' ? `Hết giờ! Kỷ lục ${S.brainGames.hoops||ST.score} · Space: chơi lại · Esc: thôi` : `A/D · chuột: ngắm · giữ Space lấy lực, thả để ném (vạch giữa ≈ chuẩn) · 10 giây cuối mỗi quả 3 điểm`, ST.charging?ST.pw:null); },
      cam(o){ o.pos.copy(wp(g,Math.sin(ST.aim)*.3,1.62,1.85)); o.look.copy(wp(g,Math.sin(ST.aim)*1.2,HY-.1,HZ)); }, idle(dt){ if(BALLS.some(b=>b.live)) step(dt); }, state:()=>({score:ST.score, t:+ST.t.toFixed(1), phase:ST.phase, live:BALLS.filter(b=>b.live).length}), _:{ST, shoot} };
    return reg(game); }

  /* ============================================================================================
     🎳 BOWLING MINI
     ============================================================================================ */
  function buildBowling(zone, lx, lz, ry){
    const g=new THREE.Group(); g.position.set(lx,0,lz); g.rotation.y=ry; zone.g.add(g);
    const LW=.78, Z0=2.85, ZP=-2.85, BR=.075, PR=.034, LANE_Y=.06;
    const laneT=canvasTex(128,1024,(c,w,h)=>{ for(let i=0;i<16;i++){ c.fillStyle=i%2?'#d8b07a':'#cfa56c'; c.fillRect(i*w/16,0,w/16,h); } c.strokeStyle='rgba(90,55,25,.25)'; for(let y=0;y<h;y+=64){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); } c.fillStyle='#7a1712'; for(let i=0;i<7;i++){ const x=w*(i+1)/8, y=h*.72; c.beginPath(); c.moveTo(x,y-26); c.lineTo(x-7,y); c.lineTo(x+7,y); c.closePath(); c.fill(); } c.fillStyle='#1a1a1a'; c.fillRect(0,h*.9,w,4); });
    const lane=add(g, rb(LW,.08,Z0-ZP+1.0,.01,1), std(0xffffff,.28,0,{map:laneT}), 0,LANE_Y-.04,(Z0+ZP)/2-.2);
    for(const s of [-1,1]){ add(g, new THREE.CylinderGeometry(.07,.07,Z0-ZP+.4,16,1,true,0,Math.PI), M.black, s*(LW/2+.07),LANE_Y-.02,(Z0+ZP)/2,Math.PI/2,0,Math.PI); add(g, rb(.08,.28,Z0-ZP+1.2,.02,1), M.wood, s*(LW/2+.18),.14,(Z0+ZP)/2-.2); }
    add(g, rb(LW+.5,.9,.4,.03,2), M.black, 0,.45,ZP-.75); add(g, rb(LW+.5,.12,.5,.02,1), M.dark, 0,LANE_Y-.06,ZP-.5);   /* hố cuối + mặt máy */
    const capT=canvasTex(512,128,(c,w,h)=>{ c.fillStyle='#101318'; c.fillRect(0,0,w,h); c.fillStyle='#ffd23f'; c.font='900 54px Segoe UI'; c.textAlign='center'; c.fillText('🎳 QA STRIKE',w/2,80); }); add(g, new THREE.PlaneGeometry(LW+.4,.3), std(0xffffff,.5,0,{map:capT, emissive:0xffffff, emissiveMap:capT, emissiveIntensity:.6}), 0,1.25,ZP-.55,0,0,0,false); add(g, rb(LW+.5,.4,.3,.03,1), M.black, 0,1.25,ZP-.72);
    const foulT=canvasTex(128,16,(c,w,h)=>{ c.fillStyle='#c8231c'; c.fillRect(0,0,w,h); }); add(g, new THREE.PlaneGeometry(LW,.02), std(0xffffff,.5,0,{map:foulT, polygonOffset:true, polygonOffsetFactor:-2}), 0,LANE_Y+.001,Z0,-Math.PI/2,0,0,false);
    add(g, rb(.9,.7,.5,.04,2), M.black, LW/2+.75,.35,Z0+.4); for(let i=0;i<3;i++) add(g, new THREE.SphereGeometry(BR,18,12), std([0x1f5fbf,0xc8231c,0x2e8f57][i],.25,.1), LW/2+.5+i*.2,.78,Z0+.4);   /* giá bóng */
    { const fl=Math.cos(ry)<0?-1:1; colRect(zone.g, lx, lz-.25*fl, LW/2+.25, 3.55, -.4, 1.4, '🎳 Đường bowling'); colRect(zone.g, lx+1.14*fl, lz+3.25*fl, .46, .26, -.4, 1.0, '🎳 Giá bóng'); }   /* (chỉ đúng khi ry = 0 hoặc π) */
    const pinG=new THREE.LatheGeometry([[0,0],[.02,0],[.03,.04],[.034,.08],[.026,.13],[.014,.17],[.016,.2],[.022,.23],[.014,.26],[0,.265]].map(([x,y])=>new THREE.Vector2(x,y)),16), pinM=std(0xf8f6f0,.25);
    const PINS=[]; { const sp=.13; let k=0; for(let row=0;row<4;row++) for(let j=0;j<=row;j++){ const x=(j-row/2)*sp, z=ZP-row*sp*.866; const m=add(g,pinG,pinM,x,LANE_Y,z); add(m, new THREE.CylinderGeometry(.0262,.0262,.012,14), M.red, 0,.165,0); PINS.push({m, hx:x, hz:z, x, z, vx:0, vz:0, down:false, tilt:0, ta:0, live:true}); k++; } }
    const ballM=add(g,new THREE.SphereGeometry(BR,22,16),std(0x1f5fbf,.18,.15),0,LANE_Y+BR,Z0+.3);
    const ST={phase:'aim', x:0, ang:0, pw:0, pdir:1, charging:false, b:{x:0,z:Z0+.3,vx:0,vz:0, gutter:false}, frame:1, roll:1, frames:[], t:0, msg:''};
    function resetPins(all){ for(const p of PINS){ if(all || !p.down){ Object.assign(p,{x:p.hx,z:p.hz,vx:0,vz:0,tilt:0,down:false,live:true}); p.m.visible=true; } else { p.live=false; p.m.visible=false; } p.m.position.set(p.x,LANE_Y,p.z); p.m.rotation.set(0,0,0); } }
    function newGame(){ ST.frame=1; ST.roll=1; ST.frames=[]; ST.phase='aim'; resetPins(true); }
    function release(){ if(ST.phase!=='aim') return; const v=2.2+ST.pw*3.6, an=ST.ang+rr(-.014,.014); ST.b={x:ST.x+rr(-.01,.01), z:Z0+.25, vx:Math.sin(an)*v, vz:-Math.cos(an)*v, gutter:false, spin:(ST.pw-.5)*.25}; ST.phase='roll'; ST.t=0; thud(.8); }
    function knock(p, vx, vz){ if(!p.down){ p.down=true; p.ta=Math.atan2(vx,vz); clack(1); } }
    function stepPhys(dt){ const n=Math.max(1,Math.ceil(dt/.004)), h=dt/n, b=ST.b;
      for(let i=0;i<n;i++){ if(ST.phase==='roll'){ b.x+=b.vx*h; b.z+=b.vz*h; b.vx+=b.spin*h*(b.z<0?1.2:.3); const f=1-.05*h; b.vx*=f; b.vz*=f;
          if(!b.gutter && Math.abs(b.x)>LW/2-BR*.4){ b.gutter=true; b.x=Math.sign(b.x)*(LW/2+.05); b.vx=0; thud(.5); }
          if(!b.gutter) for(const p of PINS){ if(!p.live) continue; const dx=p.x-b.x, dz=p.z-b.z, d=Math.hypot(dx,dz); if(d<BR+PR && d>1e-6){ const nx=dx/d, nz=dz/d, vn=b.vx*nx+b.vz*nz; if(vn>0){ p.vx+=nx*vn*1.45+b.vx*.15; p.vz+=nz*vn*1.45+b.vz*.15; b.vx-=nx*vn*.5; b.vz-=nz*vn*.5; knock(p,p.vx,p.vz); } } } }
        for(const p of PINS){ if(!p.live || (Math.abs(p.vx)+Math.abs(p.vz))<1e-4) continue; p.x+=p.vx*h; p.z+=p.vz*h; const f=1-(p.down?2.2:4)*h; p.vx*=f; p.vz*=f; if(Math.abs(p.x)>LW/2+.05 || p.z<ZP-.6){ p.vx*=.3; p.vz*=.3; knock(p,p.vx,p.vz); } }
        for(let a=0;a<PINS.length;a++){ const A=PINS[a]; if(!A.live) continue; for(let c=a+1;c<PINS.length;c++){ const B=PINS[c]; if(!B.live) continue; const dx=B.x-A.x, dz=B.z-A.z, d=Math.hypot(dx,dz), md=A.down||B.down?PR*2.6:PR*2; if(d<md && d>1e-6){ const nx=dx/d, nz=dz/d, rv=(A.vx-B.vx)*nx+(A.vz-B.vz)*nz; if(rv>0){ A.vx-=rv*nx*.8; A.vz-=rv*nz*.8; B.vx+=rv*nx*.8; B.vz+=rv*nz*.8; if(rv>.34){ knock(A,A.vx,A.vz); knock(B,B.vx,B.vz); } } const o=(md-d)/2; A.x-=nx*o; A.z-=nz*o; B.x+=nx*o; B.z+=nz*o; } } } }
      for(const p of PINS){ if(!p.live) continue; if(p.down) p.tilt=Math.min(Math.PI/2,p.tilt+dt*9); p.m.position.set(p.x,LANE_Y+Math.sin(p.tilt)*.03,p.z); p.m.rotation.set(Math.cos(p.ta)*p.tilt,0,-Math.sin(p.ta)*p.tilt,'YXZ'); }
      ballM.position.set(ST.phase==='aim'?ST.x:b.x, b.gutter?LANE_Y+.01:LANE_Y+BR, ST.phase==='aim'?Z0+.3:b.z); if(ST.phase==='roll'){ ballM.rotation.x-=b.vz*dt/BR; } }
    function step(dt){ if(ST.charging){ ST.pw+=ST.pdir*dt/1.2; if(ST.pw>1){ ST.pw=1; ST.pdir=-1; } if(ST.pw<0){ ST.pw=0; ST.pdir=1; } }
      stepPhys(dt);
      if(ST.phase==='roll'){ ST.t+=dt; const b=ST.b; if(b.z<ZP-.55 || Math.hypot(b.vx,b.vz)<.08 || ST.t>8){ ST.phase='settle'; ST.t=0; } }
      else if(ST.phase==='settle'){ ST.t+=dt; if(ST.t>1.6){ const downNow=PINS.filter(p=>p.live && p.down).length, prev=ST.roll===2 ? (ST.frames[ST.frame-1]||[0])[0] : 0, fr=ST.frames[ST.frame-1]||(ST.frames[ST.frame-1]=[]);
          fr.push(downNow); const tot=fr.reduce((s,v)=>s+v,0); if(ST.roll===1 && downNow===10){ ST.msg='🎳 STRIKE!'; cheer(); shake=.35; hudPunch(); nextFrame(); } else if(ST.roll===2){ ST.msg = tot===10 ? '✨ SPARE!' : `${tot} ky`; if(tot===10){ cheer(); hudPunch(); } nextFrame(); } else { ST.msg=`${downNow} ky – lăn tiếp`; ST.roll=2; resetPins(false); ST.phase='aim'; } } } }
    function nextFrame(){ ST.roll=1; ST.frame++; if(ST.frame>5){ ST.phase='done'; const sc=score(); const best=S.brainGames.bowl||0; if(sc>best){ S.brainGames.bowl=sc; save(); toast(`🎳 Kỷ lục mới: ${sc} điểm!`,3000); } if(sc>=60) reward(20,'🎳 Bowling ≥ 60 điểm! +20 💰'); return; } resetPins(true); ST.phase='aim'; }
    const score=()=>ST.frames.reduce((s,f)=>{ const t=f.reduce((a,v)=>a+v,0); return s+t+(f[0]===10?10:(t===10?5:0)); },0);
    return reg({ title:'Bowling mini', r:1.3, stand:()=>{ const p=wp(g,ST.x,0,Z0+.75); return {x:p.x, z:p.z, yaw:wyaw(g,0)}; }, inter:()=>wp(g,0,0,Z0+.7), label:()=>'🎳 Chơi bowling mini – 5 frame (E)',
      start(){ newGame(); }, stop(){ ST.charging=false; },
      key(c,d){ if(c==='Space'){ if(d){ if(ST.phase==='done'){ newGame(); return; } if(ST.phase==='aim'){ ST.charging=true; ST.pw=0; ST.pdir=1; } } else if(ST.charging){ ST.charging=false; release(); } } }, click(d){ if(d){ if(ST.phase==='done'){ newGame(); return; } if(ST.phase==='aim'){ ST.charging=true; ST.pw=0; ST.pdir=1; } } else if(ST.charging){ ST.charging=false; release(); } },
      update(dt,inp,mx){ if(ST.phase==='aim'){ ST.x=clamp(ST.x+inp.ix*.5*dt+mx*.0008,-LW/2+BR+.02,LW/2-BR-.02); ST.ang=clamp(ST.ang-inp.iz*.12*dt,-.07,.07); } step(dt);
        hudSet('🎳 Bowling mini · 5 frame', `Frame ${Math.min(5,ST.frame)}/5 · ${score()} điểm`, ST.phase==='done' ? `Xong! Kỷ lục ${S.brainGames.bowl||score()} · Space: chơi lại · Esc: thôi` : `${ST.msg?ST.msg+' · ':''}A/D: vị trí · W/S: góc lăn · giữ Space lấy lực, thả để lăn`, ST.charging?ST.pw:null); },
      cam(o){ const b=ST.b, follow=ST.phase==='roll'||ST.phase==='settle', z=follow?Math.max(ZP+1.6,b.z+1.1):Z0+1.2, x=follow?b.x*.6:ST.x; o.pos.copy(wp(g,x,follow?.85:1.15,z)); o.look.copy(wp(g,x*.5+Math.sin(ST.ang)*2*(follow?0:1),LANE_Y+.1,follow?ZP:Z0-3)); },
      state:()=>({frame:ST.frame, roll:ST.roll, phase:ST.phase, score:score(), down:PINS.filter(p=>p.down&&p.live).length, frames:ST.frames}) }); }

  /* ============================================================================================
     ⛳ GOLF MINI TRONG PHÒNG – 3 LỖ (đồi nhỏ · zig-zag vách chắn · thanh quét cối xay gió + lỗ trên gò)
     ============================================================================================ */
  function buildMiniGolf(zone, lx, lz, ry){
    const g=new THREE.Group(); g.position.set(lx,0,lz); g.rotation.y=ry; zone.g.add(g);
    const LW=.95, LL=5.4, BR=.0215, CUP=.054, Y0=.07, GV=9.8, TEE=2.35, CUPZ=-2.2;
    const HOLES=[ {x:-1.07, par:2, name:'Đồi nhỏ', h:(x,z)=>.075*Math.exp(-(z*z)/.14)+.012*Math.exp(-((z+1.4)**2)/.3)*(1+Math.sin(x*4)), blocks:[]},
      {x:0, par:3, name:'Zig-zag', h:(x,z)=>.02+.018*Math.sin(z*1.3)*x*2, blocks:[[-.22,1.05,.52,.1],[.22,.05,.52,.1],[-.22,-.95,.52,.1]]},
      {x:1.07, par:3, name:'Cối xay gió', h:(x,z)=>{ const d=Math.hypot(x,z-CUPZ); return .055*Math.exp(-d*d/.2); }, blocks:[], mill:{z:.15, len:.43, w:1.9}} ];
    const turf=canvasTex(128,512,(c,w,h)=>{ c.fillStyle='#2f8f43'; c.fillRect(0,0,w,h); for(let i=0;i<7000;i++){ c.fillStyle=`rgba(${20+Math.random()*30|0},${90+Math.random()*60|0},${30+Math.random()*30|0},.5)`; c.fillRect(Math.random()*w,Math.random()*h,1,2); } }); turf.wrapS=turf.wrapT=THREE.RepeatWrapping; turf.repeat.set(1,2);
    const turfM=std(0xffffff,.95,0,{map:turf});
    add(g, rb(3.5,Y0,LL+.5,.02,1), M.wood, 0,Y0/2,0);   /* bục gỗ */
    for(const H of HOLES){ const pg=new THREE.PlaneGeometry(LW,LL,8,60); pg.rotateX(-Math.PI/2); const pa=pg.attributes.position; for(let i=0;i<pa.count;i++){ const x=pa.getX(i), z=pa.getZ(i); pa.setY(i, Y0+.006+H.h(x,z)); } pg.computeVertexNormals(); add(g, pg, turfM, H.x,0,0,0,0,0,false);
      for(const s2 of [-1,1]) add(g, rb(.06,.09,LL+.06,.015,1), M.woodL, H.x+s2*(LW/2+.03), Y0+.045, 0); for(const e of [-1,1]) add(g, rb(LW+.12,.09,.06,.015,1), M.woodL, H.x, Y0+.045, e*(LL/2+.03));
      add(g, new THREE.PlaneGeometry(.3,.22), std(0x1d5a2a,.9), H.x, Y0+H.h(0,TEE)+.009, TEE, -Math.PI/2,0,0,false);
      add(g, new THREE.CircleGeometry(CUP,24), std(0x050505,.9), H.x, Y0+H.h(0,CUPZ)+.008, CUPZ, -Math.PI/2,0,0,false); add(g, new THREE.CylinderGeometry(.005,.005,.62,6), M.steel, H.x, Y0+H.h(0,CUPZ)+.31, CUPZ);
      const fT=canvasTex(64,48,(c,w,h)=>{ c.fillStyle=['#e63946','#ffd23f','#4fc3ff'][HOLES.indexOf(H)]; c.fillRect(0,0,w,h); c.fillStyle='#111'; c.font='900 34px Segoe UI'; c.textAlign='center'; c.fillText(String(HOLES.indexOf(H)+1),w/2,37); });
      add(g, new THREE.PlaneGeometry(.16,.12), std(0xffffff,.6,0,{map:fT, side:THREE.DoubleSide}), H.x+.083, Y0+H.h(0,CUPZ)+.55, CUPZ, 0,0,0,false);
      for(const [bx,bz,bw,bd] of H.blocks) add(g, rb(bw,.1,bd,.02,1), M.red, H.x+bx, Y0+H.h(bx,bz)+.05, bz);
      if(H.mill){ const mz=H.mill.z, hy=Y0+H.h(0,mz); add(g, new THREE.CylinderGeometry(.05,.06,.16,14), M.wood, H.x, hy+.08, mz); const roof=add(g, new THREE.ConeGeometry(.08,.1,14), M.red, H.x, hy+.21, mz);
        H.bar=add(g, rb(H.mill.len*2,.035,.04,.012,1), M.woodL, H.x, hy+.03, mz); H.blades=new THREE.Group(); H.blades.position.set(H.x, hy+.2, mz+.07); g.add(H.blades); for(let k=0;k<4;k++){ const b=add(H.blades, new THREE.BoxGeometry(.02,.22,.005), M.white, 0,.11,0); b.parent.remove(b); const piv=new THREE.Group(); piv.rotation.z=k*Math.PI/2; piv.add(b); H.blades.add(piv); } } }
    const sign=canvasTex(512,96,(c,w,h)=>{ c.fillStyle='#14321c'; c.fillRect(0,0,w,h); c.fillStyle='#ffd23f'; c.font='900 46px Segoe UI'; c.textAlign='center'; c.fillText('⛳ MINI GOLF · 3 LỖ',w/2,62); });
    add(g, new THREE.PlaneGeometry(1.8,.34), std(0xffffff,.5,0,{map:sign, emissive:0xffffff, emissiveMap:sign, emissiveIntensity:.4}), 0,1.35,-LL/2-.18,0,0,0,false); add(g, rb(1.9,.42,.06,.02,1), M.black, 0,1.35,-LL/2-.22); for(const s2 of [-.85,.85]) add(g, rb(.06,1.3,.06,.015,1), M.black, s2,.65,-LL/2-.22);
    colRect(zone.g, lx, lz, 1.78, LL/2+.3, -.4, .45, '⛳ Sân golf mini');
    const ball=add(g, new THREE.SphereGeometry(BR,16,12), M.white, HOLES[0].x, Y0+BR, TEE);
    const aimL=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]), new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:.7})); g.add(aimL); aimL.visible=false;
    const ST={hole:0, strokes:0, card:[], phase:'aim', aim:Math.PI, pw:0, pdir:1, charging:false, b:{x:0,z:TEE,vx:0,vz:0}, t:0, msg:'', mill:0};
    const H0=()=>HOLES[ST.hole];
    function putBall(){ const H=H0(); ST.b={x:0,z:TEE,vx:0,vz:0}; ST.aim=-Math.PI/2; ST.phase='aim'; ST.strokes=0; ST.msg=`Lỗ ${ST.hole+1}: ${H.name} · par ${H.par}`; }
    function stroke(){ if(ST.phase!=='aim') return; const v=.35+ST.pw*2.9; ST.b.vx=Math.cos(ST.aim)*v; ST.b.vz=Math.sin(ST.aim)*v; ST.strokes++; ST.phase='roll'; ST.t=0; clack(.5+ST.pw*.6); }
    function millSeg(H){ const a=ST.mill*H.mill.w, c=Math.cos(a)*H.mill.len, sn=Math.sin(a)*H.mill.len; return [-c, H.mill.z-sn, c, H.mill.z+sn, a]; }
    function phys(dt){ const H=H0(), b=ST.b, n=Math.max(1,Math.ceil(dt/.003)), hh=dt/n, e=.004;
      for(let k=0;k<n;k++){ const gx=-(H.h(b.x+e,b.z)-H.h(b.x-e,b.z))/(2*e), gz=-(H.h(b.x,b.z+e)-H.h(b.x,b.z-e))/(2*e); b.vx+=gx*GV*.7*hh; b.vz+=gz*GV*.7*hh;
        const sp=Math.hypot(b.vx,b.vz); if(sp>0){ const ns=Math.max(0,sp-.5*hh); b.vx*=ns/sp; b.vz*=ns/sp; } b.x+=b.vx*hh; b.z+=b.vz*hh;
        const xw=LW/2-BR, zw=LL/2-BR; if(Math.abs(b.x)>xw){ b.x=Math.sign(b.x)*xw; b.vx*=-.62; tick(Math.abs(b.vx)); } if(Math.abs(b.z)>zw){ b.z=Math.sign(b.z)*zw; b.vz*=-.62; tick(Math.abs(b.vz)); }
        for(const [bx,bz,bw,bd] of H.blocks){ const cx=clamp(b.x,bx-bw/2,bx+bw/2), cz=clamp(b.z,bz-bd/2,bz+bd/2), dx=b.x-cx, dz=b.z-cz, d=Math.hypot(dx,dz); if(d<BR && d>1e-6){ const nx=dx/d, nz=dz/d; b.x=cx+nx*BR; b.z=cz+nz*BR; const vn=b.vx*nx+b.vz*nz; if(vn<0){ b.vx-=1.62*vn*nx; b.vz-=1.62*vn*nz; thud(.3); } } }
        if(H.mill){ const [ax,az,bx2,bz2]=millSeg(H), ex=bx2-ax, ez=bz2-az, L2=ex*ex+ez*ez; let t=((b.x-ax)*ex+(b.z-az)*ez)/L2; t=clamp(t,0,1); const cx=ax+ex*t, cz=az+ez*t, dx=b.x-cx, dz=b.z-cz, d=Math.hypot(dx,dz), m=BR+.02;
          if(d<m && d>1e-6){ const nx=dx/d, nz=dz/d; b.x=cx+nx*m; b.z=cz+nz*m; const w=H.mill.w, rx=cx, rz=cz-H.mill.z, pvx=-w*rz, pvz=w*rx, rvn=(b.vx-pvx)*nx+(b.vz-pvz)*nz; if(rvn<0){ b.vx-=1.5*rvn*nx; b.vz-=1.5*rvn*nz; clack(.5); } }
          const hd=Math.hypot(b.x,b.z-H.mill.z); if(hd<BR+.06 && hd>1e-6){ const nx=b.x/hd, nz=(b.z-H.mill.z)/hd; b.x=nx*(BR+.06); b.z=H.mill.z+nz*(BR+.06); const vn=b.vx*nx+b.vz*nz; if(vn<0){ b.vx-=1.6*vn*nx; b.vz-=1.6*vn*nz; } } }
        const dc=Math.hypot(b.x,b.z-CUPZ); if(dc<CUP){ const s2=Math.hypot(b.vx,b.vz); if(s2<1.25){ ST.phase='sunk'; ST.t=0; b.vx=b.vz=0; b.x=0; b.z=CUPZ; snd(660,.12,'triangle',.08); setTimeout(()=>snd(990,.14,'triangle',.08),110); const d=ST.strokes-H0().par; if(d<0){ cheer(); hudPunch(); shake=.2; } else hudPunch(); ST.msg=ST.strokes===1?'🎉 HOLE IN ONE!':d<0?'🐦 Birdie!':d===0?'👍 Par':`+${d}`; return; } else { b.vx*=.72; b.vz*=.72; b.vx+=(b.x)*2; } } } }
    function step(dt){ ST.mill+=dt; const H=H0(); if(H.mill){ const a=ST.mill*H.mill.w; H.bar.rotation.y=-a; H.blades.rotation.z=ST.mill*2.5; }
      for(const HH of HOLES) if(HH.mill && HH!==H){ HH.bar.rotation.y=-ST.mill*HH.mill.w; HH.blades.rotation.z=ST.mill*2.5; }
      if(ST.phase==='aim' && ST.charging){ ST.pw+=ST.pdir*dt/1.3; if(ST.pw>1){ ST.pw=1; ST.pdir=-1; } if(ST.pw<0){ ST.pw=0; ST.pdir=1; } }
      if(ST.phase==='roll'){ phys(dt); ST.t+=dt; const b=ST.b, sp=Math.hypot(b.vx,b.vz); if(ST.phase==='roll' && ((sp<.02 && ST.t>.4) || ST.t>15)){ b.vx=b.vz=0; if(ST.strokes>=7){ ST.phase='sunk'; ST.t=0; ST.msg='Nhặt bóng (tối đa 7 gậy)'; ST.strokes=7; } else { ST.phase='aim'; ST.aim=Math.atan2(CUPZ-b.z,-b.x); } } }
      else if(ST.phase==='sunk'){ ST.t+=dt; if(ST.t>1.6){ ST.card.push(ST.strokes); if(ST.hole<2){ ST.hole++; putBall(); } else { ST.phase='done'; const tot=ST.card.reduce((s2,v)=>s2+v,0), best=S.brainGames.golf; if(!best || tot<best){ S.brainGames.golf=tot; save(); toast(`⛳ Kỷ lục mới: ${tot} gậy cho 3 lỗ!`,3000); } if(tot<=8) reward(20,'⛳ Golf mini ≤ par! +20 💰'); } } }
      const b=ST.b, X=H.x+b.x, Y=Y0+.006+H.h(b.x,b.z)+BR; ball.position.set(X, ST.phase==='sunk'?Y-Math.min(.05,ST.t*.12):Y, b.z);
      aimL.visible=ST.phase==='aim'; if(aimL.visible){ const pa=aimL.geometry.attributes.position, L=.25+ST.pw*.9; pa.setXYZ(0,X,Y,b.z); pa.setXYZ(1,X+Math.cos(ST.aim)*L,Y,b.z+Math.sin(ST.aim)*L); pa.needsUpdate=true; } }
    const press=d=>{ if(d){ if(ST.phase==='done'){ ST.hole=0; ST.card=[]; putBall(); return; } if(ST.phase==='aim'){ ST.charging=true; ST.pw=0; ST.pdir=1; } } else if(ST.charging){ ST.charging=false; stroke(); } };
    return reg({ title:'Golf mini', r:1.6, stand:()=>{ const H=H0(), b=ST.b, p=wp(g,H.x+b.x-Math.cos(ST.aim)*.45,0,b.z-Math.sin(ST.aim)*.45), q=wp(g,H.x+b.x,0,b.z); return {x:p.x, z:p.z, yaw:Math.atan2(q.x-p.x,q.z-p.z)}; },
      inter:()=>wp(g,0,0,LL/2+.65), label:()=>'⛳ Chơi golf mini trong phòng – 3 lỗ (E)', start(){ ST.hole=0; ST.card=[]; putBall(); }, stop(){ ST.charging=false; aimL.visible=false; },
      key(c,d){ if(c==='Space') press(d); }, click(d){ press(d); },
      update(dt,inp,mx){ if(ST.phase==='aim') ST.aim+=(-inp.ix*(inp.boost?.25:1.2)*dt)+mx*.0016; step(dt); const tot=ST.card.reduce((s2,v)=>s2+v,0), par=HOLES.slice(0,ST.card.length).reduce((s2,H)=>s2+H.par,0);
        hudSet('⛳ Golf mini · 3 lỗ · par 8', ST.phase==='done'?`Tổng ${tot} gậy (par 8)`:`Lỗ ${ST.hole+1}/3 · gậy ${ST.strokes} · tổng ${tot}${ST.card.length?` (par ${par})`:''}`, ST.phase==='done' ? `Kỷ lục ${S.brainGames.golf||tot} gậy · Space: chơi lại · Esc: thôi` : `${ST.msg?ST.msg+' · ':''}A/D · chuột: ngắm (Shift = tinh) · giữ Space lấy lực, thả để đánh`, ST.charging?ST.pw:null); },
      cam(o){ const H=H0(), b=ST.b, dx=Math.cos(ST.aim), dz=Math.sin(ST.aim), X=H.x+b.x; o.pos.copy(wp(g,X-dx*.95,Y0+.62,b.z-dz*.95)); o.look.copy(wp(g,X+dx*.9,Y0,b.z+dz*.9)); },
      idle(dt){ ST.mill+=dt; for(const HH of HOLES) if(HH.mill){ HH.bar.rotation.y=-ST.mill*HH.mill.w; HH.blades.rotation.z=ST.mill*2.5; } },
      state:()=>({hole:ST.hole, strokes:ST.strokes, card:[...ST.card], phase:ST.phase, ball:[+ST.b.x.toFixed(2),+ST.b.z.toFixed(2)]}), _:{ST, stroke} }); }

  /* ============================================================================================
     🎱 BIDA 3 BI – NHẬN 4 BÀN CÓ SẴN CỦA TẦNG (archKit.buildBilliardTable) VÀ CHO CHƠI THẬT
     ============================================================================================ */
  function takeBilliards(){ const out=[]; const its=(INTER||[]).filter(i=>/Đánh một cơ Bida/.test(String(i.label||'')) && Math.hypot(i.x-F.cx,i.z-F.cz)<32);
    for(const it of its){ let tbl=null; scene.traverse(o=>{ if(tbl || !o.isGroup) return; const wpp=new V3(); o.getWorldPosition(wpp); if(Math.hypot(wpp.x-it.x,wpp.z-it.z)>.06) return; const balls=o.children.filter(c=>c.isMesh && c.geometry && c.geometry.parameters && Math.abs((c.geometry.parameters.radius||0)-.031)<1e-4); if(balls.length===3) tbl={g:o, balls}; });
      if(!tbl) continue; const game=billiard(tbl, out.length); it.label='🎱 Chơi bida 3 bi – đấu bot (E)'; it.action=()=>enterGame(game); it.when=(()=>{ const w0=it.when; return ()=>!G && (!w0 || w0()); })(); GAMES.push(game); out.push(game); }
    return out; }
  function billiard(tbl, idx){ const g=tbl.g, L=2.84, Wd=1.42, H=.78, R=.031, HX=L/2-.16-R, HZ=Wd/2-.16-R, BY=H+.03+R;
    const B=tbl.balls.map((m,i)=>({m, x:m.position.x, z:m.position.z, vx:0, vz:0, i})), HOME=B.map(b=>[b.x,b.z]);
    const cue=new THREE.Mesh(new THREE.CylinderGeometry(.006,.014,1.45,12), std(0xd8b27a,.35)); cue.visible=false; g.add(cue); const tip=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.012,10), std(0x3a6ea5,.6)); cue.add(tip); tip.position.y=.725;
    const aimLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(),new V3(),new V3()]), new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:.6})); aimLine.visible=false; g.add(aimLine);
    const ghost=new THREE.Mesh(new THREE.SphereGeometry(R,12,8), new THREE.MeshBasicMaterial({color:0xffffff, wireframe:true, transparent:true, opacity:.5})); ghost.visible=false; g.add(ghost);
    const ST={turn:0, score:[0,0], phase:'aim', aim:Math.PI, pw:0, pdir:1, charging:false, hits:new Set(), t:0, botPlan:null, msg:''};
    const cueIdx=()=>ST.turn===0?0:1;
    function sim(st, dt, onHit){ const n=Math.max(1,Math.ceil(dt/.004)), h=dt/n; let moving=false;
      for(let k=0;k<n;k++){ for(const b of st){ if(!b.vx && !b.vz) continue; b.x+=b.vx*h; b.z+=b.vz*h; if(Math.abs(b.x)>HX){ b.x=Math.sign(b.x)*HX; b.vx*=-.86; onHit && onHit(b.i,-1,Math.abs(b.vx)); } if(Math.abs(b.z)>HZ){ b.z=Math.sign(b.z)*HZ; b.vz*=-.86; onHit && onHit(b.i,-1,Math.abs(b.vz)); }
          const sp=Math.hypot(b.vx,b.vz); if(sp>0){ const ns=Math.max(0,sp-.42*h); if(ns<.004){ b.vx=b.vz=0; } else { b.vx*=ns/sp; b.vz*=ns/sp; } } }
        for(let i=0;i<3;i++) for(let j=i+1;j<3;j++){ const A=st[i], C2=st[j], dx=C2.x-A.x, dz=C2.z-A.z, d=Math.hypot(dx,dz); if(d<2*R && d>1e-6){ const nx=dx/d, nz=dz/d, rv=(A.vx-C2.vx)*nx+(A.vz-C2.vz)*nz; if(rv>0){ const j2=rv*.98; A.vx-=j2*nx; A.vz-=j2*nz; C2.vx+=j2*nx; C2.vz+=j2*nz; onHit && onHit(i,j,rv); } const o=(2*R-d)/2; A.x-=nx*o; A.z-=nz*o; C2.x+=nx*o; C2.z+=nz*o; } } }
      for(const b of st) if(b.vx||b.vz) moving=true; return moving; }
    function shoot(a, pw){ const c=B[cueIdx()], v=.5+pw*3.6; c.vx=Math.cos(a)*v; c.vz=Math.sin(a)*v; ST.hits=new Set(); ST.phase='roll'; ST.t=0; clack(.6+pw); }
    function evalShot(){ const ok=ST.hits.size>=2; if(ok){ ST.score[ST.turn]++; ST.msg=ST.turn===0?'✅ Chạm 2 bi – +1, đánh tiếp!':'🤖 Bot ăn điểm, bot đánh tiếp'; if(ST.turn===0){ cheer(); hudPunch(); } else boo(); }
      else { ST.msg=ST.turn===0?'❌ Chưa chạm đủ 2 bi – tới lượt bot':'🤖 Bot hụt – tới lượt bạn'; ST.turn=1-ST.turn; }
      if(ST.score[0]>=5 || ST.score[1]>=5){ ST.phase='over'; if(ST.score[0]>=5) reward(30,'🎱 Thắng bida 3 bi! +30 💰'); return; }
      ST.phase=ST.turn===0?'aim':'bot'; ST.t=0; ST.botPlan=null; if(ST.turn===0){ const c=B[0], tgt=B[2]; ST.aim=Math.atan2(tgt.z-c.z,tgt.x-c.x); } }
    function botPlan(){ const cue2=1, others=[0,2]; let best=null; const base=B.map(b=>({x:b.x,z:b.z,vx:0,vz:0,i:b.i}));
      for(let k=0;k<70;k++){ const tg=B[others[k%2]], a0=Math.atan2(tg.z-B[cue2].z,tg.x-B[cue2].x), a=k<20?a0+rr(-.12,.12):rr(0,TAU), pw=rr(.35,.95), st=base.map(b=>({...b})), hit=new Set(); st[cue2].vx=Math.cos(a)*(.5+pw*3.6); st[cue2].vz=Math.sin(a)*(.5+pw*3.6);
        for(let s=0;s<220 && sim(st,1/60,(i,j)=>{ if(j>=0 && (i===cue2||j===cue2)) hit.add(i===cue2?j:i); });s++); const sc=hit.size*10+(hit.size>=2?5:0)-pw; if(!best || sc>best.sc) best={a,pw,sc}; if(hit.size>=2 && rnd()<.35) break; }
      const miss=rr(-.025,.025); return {a:best.a+miss, pw:best.pw}; }
    function step(dt, inp, mx){ if(ST.phase==='aim'){ const fine=inp.boost?.22:1.1; ST.aim+=(-inp.ix*fine*dt)+mx*.0016; if(ST.charging){ ST.pw+=ST.pdir*dt/1.3; if(ST.pw>1){ ST.pw=1; ST.pdir=-1; } if(ST.pw<0){ ST.pw=0; ST.pdir=1; } } }
      else if(ST.phase==='bot'){ ST.t+=dt; if(!ST.botPlan && ST.t>.4){ ST.botPlan=botPlan(); ST.aim=ST.botPlan.a; ST.pw=0; } if(ST.botPlan){ ST.pw=Math.min(ST.botPlan.pw, ST.pw+dt*.9); if(ST.t>1.9){ shoot(ST.botPlan.a, ST.botPlan.pw); } } }
      else if(ST.phase==='roll'){ ST.t+=dt; const ci=cueIdx(); const mv=sim(B,dt,(i,j,v)=>{ if(j>=0){ clack(v); if(i===ci||j===ci) ST.hits.add(i===ci?j:i); } else if(v>.3) tick(v); }); for(const b of B){ b.m.position.set(b.x,BY,b.z); b.m.rotation.x+=b.vz*dt/R; b.m.rotation.z-=b.vx*dt/R; } if(!mv || ST.t>12){ for(const b of B){ b.vx=b.vz=0; } evalShot(); } }
      /* cây cơ + vạch ngắm */ const c=B[cueIdx()], show=ST.phase==='aim'||ST.phase==='bot', dx=Math.cos(ST.aim), dz=Math.sin(ST.aim); cue.visible=show; aimLine.visible=ghost.visible=show && ST.phase==='aim';
      if(show){ const back=.06+ST.pw*.28; cue.position.set(c.x-dx*(.725+back), BY+.04, c.z-dz*(.725+back)); cue.rotation.set(0,0,0); cue.quaternion.setFromUnitVectors(new V3(0,1,0), new V3(dx,-.06,dz).normalize());
        let tHit=9, hb=null; for(const b of B){ if(b===c) continue; const ox=b.x-c.x, oz=b.z-c.z, t=ox*dx+oz*dz; if(t<=0) continue; const pd=Math.abs(ox*dz-oz*dx); if(pd<2*R){ const tt=t-Math.sqrt(4*R*R-pd*pd); if(tt<tHit){ tHit=tt; hb=b; } } }
        const tx=dx>0?(HX-c.x)/dx:dx<0?(-HX-c.x)/dx:9, tz=dz>0?(HZ-c.z)/dz:dz<0?(-HZ-c.z)/dz:9; const tw=Math.min(tx,tz); if(tw<tHit){ tHit=tw; hb=null; }
        const p=aimLine.geometry.attributes.position; p.setXYZ(0,c.x,BY,c.z); p.setXYZ(1,c.x+dx*tHit,BY,c.z+dz*tHit); if(hb){ const nx=hb.x-(c.x+dx*tHit), nz=hb.z-(c.z+dz*tHit), nl=Math.hypot(nx,nz)||1; p.setXYZ(2,hb.x+nx/nl*.35,BY,hb.z+nz/nl*.35); } else p.setXYZ(2,c.x+dx*tHit,BY,c.z+dz*tHit); p.needsUpdate=true; ghost.position.set(c.x+dx*tHit,BY,c.z+dz*tHit); } }
    function reset(){ B.forEach((b,i)=>{ b.x=HOME[i][0]; b.z=HOME[i][1]; b.vx=b.vz=0; b.m.position.set(b.x,BY,b.z); }); ST.turn=0; ST.score=[0,0]; ST.phase='aim'; ST.msg='Bạn cầm bi trắng · bot cầm bi vàng'; const c=B[0], t=B[2]; ST.aim=Math.atan2(t.z-c.z,t.x-c.x); }
    const press=d=>{ if(d){ if(ST.phase==='over'){ reset(); return; } if(ST.phase==='aim'){ ST.charging=true; ST.pw=0; ST.pdir=1; } } else if(ST.charging){ ST.charging=false; if(ST.phase==='aim') shoot(ST.aim, ST.pw); } };
    return { title:'Bida 3 bi', stand:()=>{ const c=B[0], p=wp(g,c.x-Math.cos(ST.aim)*.9,0,c.z-Math.sin(ST.aim)*.9), q=wp(g,c.x,0,c.z); return {x:p.x, z:p.z, y:p.y, yaw:Math.atan2(q.x-p.x,q.z-p.z)}; }, r:2.3,
      inter:()=>wp(g,0,0,0), label:()=>'🎱 Chơi bida 3 bi – đấu bot (E)', start(){ reset(); }, stop(){ cue.visible=aimLine.visible=ghost.visible=false; ST.charging=false; },
      key(c,d){ if(c==='Space') press(d); }, click(d){ press(d); },
      update(dt,inp,mx){ step(dt,inp,mx); hudSet('🎱 Bida 3 bi (carom) · chạm 5', `⚪ Bạn  ${ST.score[0]} : ${ST.score[1]}  Bot 🟡`, ST.phase==='over' ? (ST.score[0]>ST.score[1]?'🏆 Bạn thắng! ':'😅 Bot thắng – ')+'Space: ván mới · Esc: thôi' : `${ST.msg?ST.msg+' · ':''}${ST.phase==='bot'?'🤖 Bot đang ngắm…':ST.phase==='roll'?'Bi đang lăn…':'A/D · chuột: xoay cơ (Shift = tinh) · giữ Space lấy lực, thả để đánh · bi trắng phải chạm cả bi vàng lẫn bi đỏ'}`, ST.charging||ST.phase==='bot'?ST.pw:null); },
      cam(o){ const c=B[cueIdx()], dx=Math.cos(ST.aim), dz=Math.sin(ST.aim); if(ST.phase==='aim'){ o.pos.copy(wp(g,c.x-dx*1.05,H+.48,c.z-dz*1.05)); o.look.copy(wp(g,c.x+dx*.7,H,c.z+dz*.7)); } else { o.pos.copy(wp(g,0,H+2.3,Wd*1.15)); o.look.copy(wp(g,0,H,0)); } },
      state:()=>({score:[...ST.score], turn:ST.turn, phase:ST.phase, balls:B.map(b=>[+b.x.toFixed(2),+b.z.toFixed(2)])}), _:{ST, B, shoot} }; }

  /* ============================== BỐ TRÍ 3 KHU + TRANG TRÍ ============================== */
  const LOG={A0:+F.A0.toFixed(3), y:F.y};
  /* mỗi trò 1 bộ – xếp trò to trước; khung (u: trục X cục bộ, v: trục Z cục bộ) đã gồm chỗ người chơi đứng */
  const PLAN=[ ['Bowling mini', [-.7,1.65,-3.85,3.85], (z)=>buildBowling(z,0,0,0)], ['Golf mini', [-1.8,1.8,-3.0,3.4], (z)=>buildMiniGolf(z,0,0,0)], ['Bóng bàn', [-2.45,2.55,-1.15,1.15], (z)=>buildPingPong(z,0,0,0)],
    ['Khúc côn cầu', [-1.25,1.9,-.62,.62], (z)=>buildAirHockey(z,0,0,0)], ['Ném bóng rổ', [-.75,.75,-1.6,1.95], (z)=>buildHoops(z,0,0,0,0)], ['Bi lắc', [-.82,.82,-.78,1.4], (z)=>buildFoosball(z,0,0,0,'brain-foos-1')], ['Phi tiêu', [-.72,.72,-.3,2.95], (z)=>buildDarts(z,0,0,0)] ];
  const SLOTS=[]; LOG.placed=[]; LOG.skipped=[];
  for(const [name,fp,build] of PLAN){ try{ const sl=place(fp); if(!sl){ LOG.skipped.push(name); continue; } build(sl); SLOTS.push({name, ...sl}); LOG.placed.push([name, +((sl.a-F.A0+TAU)%TAU).toFixed(2), +sl.r.toFixed(1)]);
      const p=wp(sl.g,0,2.7,0); try{ makeLabel(name==='Bowling mini'?'🎳 Bowling mini':name==='Golf mini'?'⛳ Golf mini':name==='Bóng bàn'?'🏓 Bóng bàn':name==='Khúc côn cầu'?'🏒 Khúc côn cầu':name==='Ném bóng rổ'?'🏀 Ném bóng rổ':name==='Bi lắc'?'⚽ Bi lắc':'🎯 Phi tiêu', 'Tầng Giải trí & Bida · E để chơi', {h:.34, x:p.x, y:p.y, z:p.z, fade:28}); }catch(e){} }
    catch(e){ console.warn('[brain_games] dựng', name, e); LOG.skipped.push(name+' (lỗi)'); } }
  try{ LOG.billiards=takeBilliards().length; }catch(e){ console.warn('[brain_games] bida', e); }
  if(LOG.skipped.length) console.warn('[brain_games] không đủ chỗ cho:', LOG.skipped.join(', '), '– nới keepOut / rOut hoặc dọn bớt đồ.');

  /* ============================== KHUNG HÌNH ============================== */
  HOOK.onFrame.push((dt,T)=>{ dt=Math.min(dt||1/60,.05);
    if(G && !(HOOK.vehicle && HOOK.vehicle.brainGame)) exitGame();
    for(const g of GAMES) if(g!==G && g.idle) try{ g.idle(dt,T); }catch(e){}
    if(G){ const g=G, inp=g.inp||{ix:0,iz:0}; try{ g.update(dt,inp,mdx,mdy); }catch(e){ console.warn('[brain_games]', g.title, e); exitGame(); return; } mdx=mdy=0;
      if(HOOK.camOverride){ g.cam(HOOK.camOverride,dt); if(shake>0){ shake=Math.max(0,shake-dt*1.8); const s=shake*shake*.05; HOOK.camOverride.pos.x+=(rnd()-.5)*s; HOOK.camOverride.pos.y+=(rnd()-.5)*s; HOOK.camOverride.pos.z+=(rnd()-.5)*s; } } } });

  LOG.games=GAMES.map(g=>g.title); console.info('[brain_games] Tầng giải trí:', JSON.stringify(LOG));
  const api={ games:GAMES, slots:SLOTS, floor:F, log:LOG, enter:(name,i=0)=>{ const L=GAMES.filter(g=>g.title===name); if(L[i]) enterGame(L[i]); return !!L[i]; }, exit:exitGame, state:()=>G?{title:G.title, ...(G.state?G.state():{})}:null, net:NET };
  W.brainGames=api; return api; }
/* MÁY CHỦ NHIỀU NGƯỜI (multiplayer_server.py) cần chuyển tiếp tin trò chơi để 2 người chơi cùng bàn bi lắc – thêm 2 dòng trong vòng xử lý tin:
     elif t == 'game':
         broadcast({k: v for k, v in m.items() if k in ('t','g','k','tid','gid','b','r','sc','ph','s','kk','l')}, skip=pid)
   Chưa có dòng này thì bi lắc vẫn chơi bình thường với bot (người khác chỉ không vào chung bàn được). */
