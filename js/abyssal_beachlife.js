// QC World V2 – ĐỜI SỐNG BÃI BIỂN VỊNH ABYSSAL (phiên B · abyss-sea, 20/11/2026 – yêu cầu Bình)
//  1. 🏖️ Ghế tắm nắng: NẰM DUỖI thật (lưng tựa theo độ ngả của ghế, chân duỗi thẳng, tay xuôi hoặc gối sau đầu) – cả người chơi lẫn bot.
//     (ghế do phiên A tạo bằng W.addBench 2 chỗ ngồi thẳng → file này gộp còn 1 chỗ nằm / ghế, đổi sang tư thế nằm, đứng dậy ra cạnh ghế)
//  2. 🌊 Người tắm biển: bơi sải song song bờ, nằm ngửa thả nổi, đứng ngâm nước tới ngực té nước đùa, bé con ngồi phao bơi.
//  3. 🏐 Nhóm 3 người chuyền bóng chuyền bãi biển – người chơi bấm E để vào chơi cùng, bóng bay tới thì bấm E đỡ bóng (trượt thì bot chạy nhặt).
//  4. 🚪 Nhà tắm & thay đồ (vỏ nhà do phiên A dựng, công bố W.ABY.plots.changing = {x,z,y,doorX,doorZ,cabins:[…]}):
//     bước vào buồng → cửa tự đóng → đếm 10 s (thanh tiến độ) → cửa mở, nhân vật bước ra trong ĐỒ BƠI KÍN ĐÁO (nam quần bơi, nữ đồ bơi liền thân);
//     vào lại buồng → thay về đồ cũ. Không có "bấm E → hiện chữ". Bot cũng vào buồng thay đồ rồi ra biển bơi, xong quay lại thay đồ rồi về.
//     Buồng nhận các dạng: {x,z,y?,yaw?,w?,d?,doorX?,doorZ?,door?:[x,z]|Object3D,setDoor?(k)} – k = 1 mở, 0 đóng. Không có cửa thì file này tự gắn cánh cửa gỗ bản lề.
// Nạp từ js/bots_abyssal.js (dùng chung hàm tạo người / đi đường / kiểm mặt đứng của file đó) – không sửa file của phiên A.
// API: W.abyBeach {loungers, freeLounger, take, release, sideSpot, placeLie, poseLie, poseWater, setSwim(on), swim(), cabins, ball, log}
export async function make(W, K){
  const {THREE, scene, P, me, cam, HOOK, INTER, toast, makeLabel, removeLabel, lerpAngle} = W;
  const {R, rr, pick, el, person, put, go, stepGo, findSpot, gY, sM, sF, nm, say, WY, LOW, STAIRS, giveBot, dropBot, face} = K;
  const TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, V3=THREE.Vector3, ABY=W.ABY||{}, DN=W.dining||null, DR=DN && DN.drinks;
  const log={}; const BEACH={x:0, z:-12};
  const gH=(x,z)=>W.groundH ? W.groundH(x,z) : W.groundAtY(x,z,-50);

  /* ---------- xoay xương theo hướng thế giới (F = hướng mặt / hướng chân, R = bên phải, U = lên) ---------- */
  const _F=new V3(), _R=new V3(), _U=new V3(0,1,0), _a=new V3(), _b=new V3(), _d=new V3(), _q=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _pq=new THREE.Quaternion();
  function aim(B,n,c,f,u,r){ const b=B[n], cc=B[c]; if(!b || !cc) return; b.getWorldPosition(_a); cc.getWorldPosition(_b); _b.sub(_a); if(_b.lengthSq()<1e-9) return; _b.normalize();
    _d.set(0,0,0).addScaledVector(_F,f).addScaledVector(_U,u).addScaledVector(_R,r).normalize(); _q.setFromUnitVectors(_b,_d); b.getWorldQuaternion(_wq); b.parent.getWorldQuaternion(_pq); _wq.premultiply(_q); b.quaternion.copy(_pq.invert().multiply(_wq)); b.updateMatrixWorld(true); }
  const frameOf=(fx,fz)=>{ _F.set(fx,0,fz).normalize(); _R.set(-_F.z,0,_F.x); };
  const bonesOf=root=>{ const b={}; if(root) root.traverse(x=>{ if(x.isBone){ const k=x.name.replace(/^mixamorig[:_]?/,''); if(!b[k]) b[k]=x; } }); return b; };
  const meRoot=me.root||me.g; let meB=null; const meBones=()=>meB||(meB=bonesOf(meRoot));
  let meHipsH=null; const meHips=()=>{ if(meHipsH!=null) return meHipsH; const B=meBones(); if(!B.Hips) return meHipsH=.95; me.g.updateMatrixWorld(true); B.Hips.getWorldPosition(_a); const h=_a.y-me.g.position.y; return meHipsH=(h>.5 && h<1.3) ? h : .95; };

  /* ============================== 1. 🏖️ GHẾ TẮM NẮNG – NẰM DUỖI ============================== */
  const LOUNGE=[]; let meL=null;
  function scanLoungers(){ const groups=new Map(); for(const s of (W.seats||[])){ const lb=String((s.group && s.group.label)||s.label||''); if(s.scope==='interior' || !/Nằm (duỗi )?thư giãn ghế tắm nắng/.test(lb) || (s.floor ?? s.y)>5) continue;   /* chỉ ghế bãi cát của phiên A */ if(Math.hypot(s.x-BEACH.x,s.z-BEACH.z)>230) continue; const g=s.group||s; if(!groups.has(g)) groups.set(g,[]); groups.get(g).push(s); }
    let n=0; for(const [g,ss] of groups){ if(LOUNGE.some(L=>L.g===g)) continue; let cx=0, cz=0; for(const s of ss){ cx+=s.x; cz+=s.z; } cx/=ss.length; cz/=ss.length;
      const s0=ss[0], rot=s0.rot, F=[Math.sin(rot+Math.PI), Math.cos(rot+Math.PI)];   /* ghế quay mặt vào bờ → chân duỗi ra phía biển, đầu ở phía lưng tựa */
      const L={g, seat:s0, cx, cz, y:s0.y, floor:s0.floor ?? s0.y-.45, F, yaw:Math.atan2(F[0],F[1]), taken:null};
      if(ss.length>1 && W.dropSeats){ const extra=new Set(ss.slice(1)); try{ W.dropSeats(s=>extra.has(s)); }catch(e){} }   /* 1 ghế nằm = 1 chỗ */
      s0.x=cx; s0.z=cz; s0.lie=true; s0.lounger=L; g.lie=true; g.label='🏖️ Nằm duỗi thư giãn ghế tắm nắng (E · C)'; if(g.inter){ g.inter.x=cx; g.inter.z=cz; g.inter.r=Math.max(g.inter.r||1.35,1.5); }
      const prev=s0.onSit; s0.onSit=()=>{ meLieOn(L); try{ prev && prev(); }catch(e){ console.warn('[Bãi biển] ghế', e); } };   /* đặt xe điều khiển nằm TRƯỚC khi dining.js chụp HOOK.vehicle */
      LOUNGE.push(L); n++; } return n; }
  const freeLounger=(x,z)=>{ const L=LOUNGE.filter(q=>!q.taken && !q.seat.taken); if(!L.length) return null; L.sort((a,b)=>Math.hypot(a.cx-x,a.cz-z)-Math.hypot(b.cx-x,b.cz-z)); return L[Math.floor(R()*Math.min(4,L.length))]; };
  const take=(L,o)=>{ L.taken=o; L.seat.taken='bot'; }, release=L=>{ if(L.taken!=='me'){ L.taken=null; if(L.seat.taken==='bot') L.seat.taken=null; } };
  const sideSpot=L=>{ const r=[L.F[1],-L.F[0]]; for(const k of [1,-1,1.4,-1.4]){ const sp=findSpot(L.cx+r[0]*k, L.cz+r[1]*k, L.floor, .3, false); if(sp && Math.abs(sp[2]-L.floor)<.6) return sp; } return null; };
  // đặt gốc nhân vật: hông nằm trên đệm ghế (lùi 0,32 m về phía lưng tựa), thân vẫn đứng thẳng – phần nằm do poseLie bẻ xương
  function placeLie(a, hipsH, L){ a.g.position.set(L.cx-L.F[0]*.32, L.y+.1-(hipsH||.95), L.cz-L.F[1]*.32); a.g.rotation.set(0, L.yaw, 0); }
  // tư thế nằm duỗi: lưng ngả ~47° theo lưng tựa, chân duỗi thẳng về phía biển, bàn chân dựng; tay xuôi trên đùi (v=0) hoặc gối sau đầu (v=1)
  function lieBones(B, L, v, holdRight){ if(!B.Hips) return; frameOf(L.F[0],L.F[1]);
    aim(B,'Spine','Neck',-.68,.73,0); aim(B,'Neck','Head',-.3,.95,0);
    for(const [s,k] of [['Left',-1],['Right',1]]){ aim(B,s+'UpLeg',s+'Leg',.98,.05,k*.07); aim(B,s+'Leg',s+'Foot',.99,-.06,k*.02); aim(B,s+'Foot',s+'ToeBase',.45,.9,0);
      if(holdRight && s==='Right') continue;
      if(v===1){ aim(B,s+'Arm',s+'ForeArm',-.35,.5,k*.8); aim(B,s+'ForeArm',s+'Hand',-.55,.2,-k*.8); }
      else { aim(B,s+'Arm',s+'ForeArm',.62,-.62,k*.38); aim(B,s+'ForeArm',s+'Hand',.92,.25,-k*.2); } } }
  const poseLie=o=>{ o.a.g.updateMatrixWorld(true); lieBones(o.po.bones, o.lie, o.lieV||0, !!o.drink); };
  // người chơi nằm: thay xe điều khiển ghế của life.js bằng xe nằm duỗi (life.js vẫn lo nút "Đứng dậy" + đứng dậy)
  const lieCtrl={ drive(dt, inp){ if(inp.ix || inp.iz){ try{ W.life.standUp(); }catch(e){ HOOK.vehicle=null; } return; } const L=meL; if(!L) return; P.x=L.cx; P.z=L.cz; P.y=L.floor; P.vx=P.vz=0; P.face=L.yaw+Math.PI; placeLie(me, meHips(), L); me.play('idle'); } };
  function meLieOn(L){ meHips(); meL=L; L.taken='me'; HOOK.vehicle=lieCtrl; if(DN) DN.meLie=L; meLieV=(meLieV+1)%2; }
  let meLieV=1;
  function meLieFrame(){ if(!meL) return; if(HOOK.vehicle!==lieCtrl){ const L=meL; meL=null; L.taken=null; if(DN) DN.meLie=null; if(Math.hypot(P.x-L.cx,P.z-L.cz)<1.6){ const sp=sideSpot(L); if(sp){ P.x=sp[0]; P.z=sp[1]; P.y=sp[2]; } } return; }
    me.g.updateMatrixWorld(true); lieBones(meBones(), meL, DR && DR.holderOf(me) ? 0 : meLieV, !!(DR && DR.holderOf(me))); }

  /* ============================== 2. 👙 ĐỒ BƠI KÍN ĐÁO (nam quần bơi tới gối, nữ đồ bơi liền thân) ============================== */
  const SWIM_COL=[0x1f5fa8,0x15a5b8,0xe0593c,0x1f2a3a,0x2bb673,0xe86aa6,0x8e5bd6,0xf2b632];
  function swimOutfit(seed, female, col){ const L=W.people && W.people.look ? W.people.look(seed) : {}, sk=L.skin ?? 0xd9a77e, c=col ?? pick(SWIM_COL);
    return female ? {shirt:c, pants:c, dress:true, skirt:false, shorts:false, long:false, shoe:sk} : {shirt:sk, pants:c, shorts:true, dress:false, skirt:false, long:false, shoe:sk}; }
  const meshOf=root=>{ let m=null; root.traverse(x=>{ if(x.isSkinnedMesh && (x.name==='person' || !m)) m=x; }); return m; };
  // đổi đồ cho bot: cùng người (cùng seed, cùng khung xương, cùng số đỉnh) → chỉ thay hình học tô màu theo vùng
  function setOutfit(o, outfit){ try{ const k=W.people.kit(o.seed,{outfit}), src=meshOf(k.gl.scene), dst=meshOf(o.a.root||o.a.g);
      if(src && dst && src.geometry.attributes.position.count===dst.geometry.attributes.position.count){ dst.geometry=src.geometry; return true; } }catch(e){ console.warn('[Bãi biển] đồ bơi', e); } return false; }
  // người chơi: "bản đồ bơi" = 1 người cùng chiều cao, gắn vào nhân vật, chép tư thế từng xương (retarget theo tư thế gốc) → đi, chạy, ngồi, nằm, cầm ly đều khớp
  let DBL=null, swimOn=false; const _t1=new THREE.Quaternion(), _t2=new THREE.Quaternion();
  const skelOf=root=>{ let s=null; root.traverse(x=>{ if(!s && x.isSkinnedMesh && x.skeleton) s=x.skeleton; }); return s; };
  function makeDouble(){ if(!W.people || !W.makeActor) return null; const PR=W.PROFILE||{}, fem=PR.gender==='f' || PR.gender==='female' || PR.female===true || /nữ|female/i.test(String(PR.sex||''));
    const seed=W.people.pickSeed(L=>L.female===fem && L.style!=='cap' && !L.glasses, 4242), k=W.people.kit(seed,{outfit:swimOutfit(seed,fem,fem?0x15a5b8:0x1f5fa8), h:me.h||1.75});
    const a=W.makeActor(k.gl,{name:'·', height:me.h||1.75, face:0, clips:k.clips, compact:false}); try{ removeLabel(a.label); }catch(e){} scene.remove(a.g); me.g.add(a.g); a.g.position.set(0,0,0); a.g.rotation.set(0,0,0); a.g.visible=false; a.play('idle',0); a.mixer.update(0);
    const Bp=bonesOf(meRoot), Bd=bonesOf(a.root||a.g), pairs=[], by=new Map(); for(const n of Object.keys(Bd)) if(Bp[n]){ const pr={p:Bp[n], d:Bd[n], off:new THREE.Quaternion(), tw:new THREE.Quaternion()}; pairs.push(pr); by.set(Bd[n],pr); }
    const D={a, pairs, by, mode:(pairs.length>=15 && Bp.Hips && Bd.Hips) ? 'retarget' : 'mirror', hipP:Bp.Hips, hipD:Bd.Hips, seed, fem};
    if(D.mode==='retarget'){ const sp=skelOf(meRoot), sd=skelOf(a.root||a.g); try{ sp && sp.pose(); sd && sd.pose(); me.g.updateMatrixWorld(true); me.g.getWorldQuaternion(_wq); const ig=_wq.clone().invert();
        for(const pr of pairs){ const rp=ig.clone().multiply(pr.p.getWorldQuaternion(new THREE.Quaternion())), rd=ig.clone().multiply(pr.d.getWorldQuaternion(new THREE.Quaternion())); pr.off.copy(rp.invert().multiply(rd)); } }catch(e){ D.mode='mirror'; }
      try{ me.mixer.update(0); }catch(e){} }
    log.double=D.mode+':'+pairs.length; return D; }
  function retarget(dt){ const D=DBL; if(!D) return; if(!swimOn){ if(D.a.g.visible) D.a.g.visible=false; return; }
    const fp=!!cam.fpv, vis=me.g.visible && !fp; if(meRoot.visible) meRoot.visible=false; if(D.a.g.visible!==vis) D.a.g.visible=vis; if(!vis) return;
    if(D.mode==='mirror'){ const c=String(me.cur||''); D.a.play(/run/i.test(c)?'run':/walk/i.test(c)?'walk':'idle'); D.a.mixer.update(dt); return; }
    me.g.updateMatrixWorld(true);
    for(const pr of D.pairs){ pr.p.getWorldQuaternion(pr.tw); pr.tw.multiply(pr.off); const par=pr.d.parent, pp=D.by.get(par); if(pp) _t2.copy(pp.tw); else par.getWorldQuaternion(_t2); pr.d.quaternion.copy(_t2.invert().multiply(pr.tw)); }
    if(D.hipP && D.hipD){ D.hipP.getWorldPosition(_a); D.hipD.parent.updateMatrixWorld(true); D.hipD.parent.worldToLocal(_a); D.hipD.position.copy(_a); }
    D.a.g.updateMatrixWorld(true); }
  function setSwim(on){ on=!!on; if(on && !DBL){ DBL=makeDouble(); if(!DBL) return false; } swimOn=on; if(!on){ meRoot.visible=true; if(DBL) DBL.a.g.visible=false; } try{ const S=W.life && W.life.S; if(S){ S.abySwim=on; } }catch(e){} return true; }

  /* ============================== 4. 🚪 NHÀ TẮM & THAY ĐỒ ============================== */
  const CAB=[]; let chReady=false, CH=null, hud=null;
  const teak=new THREE.MeshStandardMaterial({color:0x8a5a34, roughness:.7}), knobM=new THREE.MeshStandardMaterial({color:0xd4af37, metalness:.8, roughness:.3});
  function ownDoor(C){ const wd=clamp(Math.min(C.w,C.d)*.72,.6,.86), hd=1.95, piv=new THREE.Group(), pnl=new THREE.Mesh(new THREE.BoxGeometry(wd,hd,.045),teak), kn=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),knobM);
    pnl.position.set(wd/2,hd/2+.03,0); kn.position.set(wd-.09,1.0,.05); piv.add(pnl,kn); const r=[Math.cos(C.yaw),-Math.sin(C.yaw)];
    piv.position.set(C.dx-r[0]*wd/2, C.y, C.dz-r[1]*wd/2); piv.rotation.y=C.yaw; piv.userData.dynamic=true; pnl.castShadow=true; scene.add(piv); C.doorObj=piv;
    return k=>{ piv.rotation.y=C.yaw-1.45*k; }; }
  function normCab(cb, h, i){ const arr=Array.isArray(cb), x=arr?cb[0]:cb.x, z=arr?cb[1]:cb.z; if(typeof x!=='number' || typeof z!=='number') return null;
    const dObj=cb.door && cb.door.isObject3D ? cb.door : (cb.doorMesh && cb.doorMesh.isObject3D ? cb.doorMesh : null);
    let dx=cb.doorX ?? (Array.isArray(cb.door)?cb.door[0]:undefined), dz=cb.doorZ ?? (Array.isArray(cb.door)?cb.door[1]:undefined);
    const y=cb.y ?? h.y ?? gY(x,z,(h.y??2)+.4);
    if(typeof dx!=='number' || typeof dz!=='number'){ let vx, vz; if(typeof cb.yaw==='number'){ vx=Math.sin(cb.yaw); vz=Math.cos(cb.yaw); } else { vx=(h.doorX??h.x??x)-x; vz=(h.doorZ??h.z??z)-z; const l=Math.hypot(vx,vz)||1; vx/=l; vz/=l; } const half=(cb.d??1.3)/2; dx=x+vx*half; dz=z+vz*half; }
    const fx=dx-x, fz=dz-z, fl=Math.hypot(fx,fz)||1, w=cb.w??1.3, d=cb.d??1.3;
    const C={i, house:h, x, z, y, dx, dz, f:[fx/fl,fz/fl], yaw:Math.atan2(fx,fz), w, d, r:Math.min(w,d)/2, occ:null, k:1, cool:false, src:cb};
    C.out=Array.isArray(cb.door) ? [dx, dz] : [dx+C.f[0]*1.0, dz+C.f[1]*1.0];   /* cửa cabin phiên A ở 0,6 m trước vách → đứng ngay đó (xa hơn là vướng ghế băng giữa phòng) */
    if(h.doors && h.doors.length && typeof h.yaw==='number'){ const hd=h.doors.find(q=>q.who===cb.side) || h.doors[0], hf=[Math.sin(h.yaw),Math.cos(h.yaw)]; C.entry=[[hd.x+hf[0]*1.3, hd.z+hf[1]*1.3], [hd.x-hf[0]*.9, hd.z-hf[1]*.9]]; C.side=cb.side; }
    if(typeof cb.setDoor==='function') C.setDoor=k=>{ try{ cb.setDoor(k); }catch(e){} };
    else if(typeof h.setDoor==='function') C.setDoor=k=>{ try{ h.setDoor(i,k); }catch(e){} };
    else if(cb.doorPivot && cb.doorPivot.isObject3D && typeof cb.doorClosedYaw==='number' && typeof cb.doorOpenYaw==='number'){ const pv=cb.doorPivot, a0=cb.doorClosedYaw, a1=cb.doorOpenYaw; C.setDoor=k=>{ pv.rotation.y=a0+(a1-a0)*k; }; }   /* 20/11: bản lề cửa cabin do phiên A dựng */
    else if(dObj){ const r0=dObj.rotation.y; C.setDoor=k=>{ dObj.rotation.y=r0-1.45*k; }; }
    else C.setDoor=ownDoor(C);
    C.setDoor(1); return C; }
  function initChanging(){ const c=ABY.plots && ABY.plots.changing; if(!c) return false; const houses=Array.isArray(c)?c:(Array.isArray(c.list)&&c.list.length?c.list:[c]);
    for(const h of houses){ if(!h) continue; (h.cabins||[]).forEach((cb,i)=>{ const C=normCab(cb,h,i); if(C) CAB.push(C); }); try{ houseExtras(h); }catch(e){ console.warn('[Bãi biển] tủ / vòi sen', e); } } chReady=CAB.length>0; log.cabins=CAB.length; if(chReady) console.info('[Bãi biển] nhà thay đồ:', CAB.length, 'buồng'); return chReady; }
  function showHud(on, t, swimTo){ if(!hud){ hud=document.createElement('div'); hud.id='aby-change-hud'; hud.style.cssText='position:fixed;left:50%;top:16%;transform:translateX(-50%);z-index:41;min-width:260px;padding:12px 18px;border-radius:14px;background:rgba(14,22,30,.86);border:1px solid rgba(127,224,255,.45);color:#e8f6ff;font:600 15px Segoe UI,system-ui,sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:none';
      hud.innerHTML='<div data-t></div><div style="margin-top:8px;height:8px;border-radius:6px;background:rgba(255,255,255,.14);overflow:hidden"><div data-b style="height:100%;width:0;background:linear-gradient(90deg,#7fe0ff,#ffd166)"></div></div>'; document.body.appendChild(hud); }
    hud.hidden=!on; if(!on) return; const left=Math.max(0,Math.ceil(10-t)); hud.querySelector('[data-t]').textContent=`🚪 Cửa đã đóng · đang ${swimTo?'thay đồ bơi 🩱':'thay lại đồ thường 👕'} … ${left} s`; hud.querySelector('[data-b]').style.width=`${clamp(t/10,0,1)*100}%`; }
  const cabCtrl={ drive(dt){ const c=CH; if(!c){ HOOK.vehicle=null; return; } const C=c.C;
      if(c.ph==='out'){ const tx=C.out[0], tz=C.out[1], dx=tx-P.x, dz=tz-P.z, d=Math.hypot(dx,dz); if(d>.05){ const k=Math.min(d,1.3*dt); P.x+=dx/d*k; P.z+=dz/d*k; } P.y=W.groundAtY(P.x,P.z,P.y+.3); P.face=C.yaw; me.g.position.set(P.x,P.y,P.z); me.g.rotation.set(0,C.yaw,0); me.play(d>.05?'walk':'idle'); return; }
      P.x+=(C.x-P.x)*Math.min(1,dt*5); P.z+=(C.z-P.z)*Math.min(1,dt*5); P.y=C.y; P.vx=P.vz=0; P.face=C.yaw; me.g.position.set(P.x,P.y,P.z); me.g.rotation.set(0, c.ph==='open' ? C.yaw : C.yaw+Math.PI, 0); me.play('idle'); } };
  function cabinFrame(dt){ if(!chReady) return;
    for(const C of CAB){ const want=C.occ ? (C.closed?0:1) : 1; if(Math.abs(C.k-want)>.001){ C.k+=(want-C.k)*Math.min(1,dt*5); if(Math.abs(C.k-want)<.01) C.k=want; C.setDoor(C.k); } }
    if(!CH){ if(HOOK.vehicle || W.inside) return; for(const C of CAB){ const d=Math.hypot(P.x-C.x,P.z-C.z); if(C.cool){ if(d>C.r+.7) C.cool=false; continue; } if(C.occ) continue;
        if(d<Math.max(.42,C.r-.18) && Math.abs(P.y-C.y)<1.2){ C.occ='me'; CH={C, ph:'close', t:0, to:!swimOn, swapped:false}; HOOK.vehicle=cabCtrl; HOOK.vehicleInter=()=>null; break; } } return; }
    const c=CH, C=c.C; c.t+=dt;
    if(c.ph==='close'){ C.closed=true; if(c.t>.8){ c.ph='change'; c.t=0; } }
    else if(c.ph==='change'){ showHud(true, c.t, c.to); if(c.t>5 && !c.swapped){ c.swapped=true; setSwim(c.to); } if(c.t>=10){ showHud(false); c.ph='open'; c.t=0; C.closed=false; } }
    else if(c.ph==='open'){ if(c.t>.7){ c.ph='out'; c.t=0; } }
    else if(c.ph==='out'){ if(c.t>1.6 || Math.hypot(P.x-C.out[0],P.z-C.out[1])<.08){ HOOK.vehicle=null; HOOK.vehicleInter=null; C.occ=null; C.cool=true; CH=null; P.y=W.groundAtY(P.x,P.z,P.y+.3);
        toast(c.to ? '🩱 Đã thay đồ bơi – ra biển tắm thôi! (vào lại buồng để thay về đồ thường)' : '👕 Đã thay lại đồ thường.', 3000); } }
    if(c.ph!=='out' && HOOK.vehicle!==cabCtrl){ /* bị chương trình khác lấy quyền điều khiển → nhả buồng */ showHud(false); C.occ=null; C.closed=false; C.cool=true; CH=null; } }
  /* ---------- 🗄️ TỦ ĐỒ MỞ / ĐÓNG (cánh tủ riêng phủ lên mặt tủ tĩnh của phiên A; mở ra thấy lòng tủ tối + kệ + khăn gấp + móc) · 🚿 VÒI SEN CÓ NƯỚC CHẢY ---------- */
  const LOCK=[], SHOW=[], lockM=[new THREE.MeshStandardMaterial({color:0x9a6b43, roughness:.62}), new THREE.MeshStandardMaterial({color:0x5b3a24, roughness:.6})], darkM=new THREE.MeshStandardMaterial({color:0x22170f, roughness:.95}),
    towelM=[0xf4f1ea,0x8fc9d8,0xe9b8a0,0xc9d9a8].map(c=>new THREE.MeshStandardMaterial({color:c, roughness:.95})), brassM=new THREE.MeshStandardMaterial({color:0xc9a24a, metalness:.85, roughness:.3});
  const dropM=new THREE.LineBasicMaterial({color:0xd8f2ff, transparent:true, opacity:.6, depthWrite:false}), splashM=new THREE.PointsMaterial({color:0xe6f7ff, size:.045, transparent:true, opacity:.75, depthWrite:false});
  const mk=(geo,mat,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); return m; };
  function houseExtras(h){ if(!h.size || typeof h.yaw!=='number' || h.__bl) return; h.__bl=true; const HW=h.size[0]/2, HD=h.size[1]/2, CD=(h.cabins&&h.cabins[0]&&h.cabins[0].d)||1.8, base=h.y, ry=h.yaw;
    const Lc=(lx,lz)=>[h.x+Math.cos(ry)*lx+Math.sin(ry)*lz, h.z-Math.sin(ry)*lx+Math.cos(ry)*lz];
    const root=new THREE.Group(); root.position.set(h.x,base,h.z); root.rotation.y=ry; root.userData.dynamic=true; scene.add(root);
    for(const side of [-1,1]) for(let k=0;k<6;k++){ const lz=-HD+CD+.42+k*.6; if(lz>HD-.5) break; const lx=side*(HW-.4), fx=lx-side*.30;   /* đặt trước tay nắm + khe gió tĩnh của phiên A (tới 0,282 m) */
      const back=new THREE.Group(); back.position.set(lx-side*.287,0,lz); root.add(back); back.visible=false;
      back.add(mk(new THREE.BoxGeometry(.012,1.8,.52),darkM,0,.95,0)); for(const yy of [.55,1.25]) back.add(mk(new THREE.BoxGeometry(.03,.02,.5),lockM[1],-side*.02,yy,0));
      back.add(mk(new THREE.BoxGeometry(.05,.12,.34),towelM[(k+(side>0?2:0))%4],-side*.035,1.32,0)); const hg=mk(new THREE.TorusGeometry(.05,.008,6,14,Math.PI),brassM,-side*.03,1.62,0); hg.rotation.y=Math.PI/2; back.add(hg);
      const piv=new THREE.Group(); piv.position.set(fx,0,lz-.27); root.add(piv); piv.add(mk(new THREE.BoxGeometry(.022,1.84,.53),lockM[k%2],0,.95,.265));
      for(let v=0;v<3;v++) piv.add(mk(new THREE.BoxGeometry(.006,.02,.3),darkM,-side*.013,1.6+v*.06,.265));
      piv.add(mk(new THREE.CylinderGeometry(.012,.012,.14,10),brassM,-side*.03,1.0,.45));
      const L={piv, back, k:0, want:0, side, base}; const ip=Lc(lx-side*.85,lz);
      INTER.push({x:ip[0], z:ip[1], r:.75, prio:1.1, when:()=>Math.abs(P.y-base)<1.2, get label(){ return L.want ? '🗄️ Đóng tủ đồ (E)' : '🗄️ Mở tủ đồ (E)'; }, action:()=>{ L.want=L.want?0:1; }}); LOCK.push(L); }
    for(const sh of (h.showers||[])){ const S={x:sh.x, z:sh.z, y:sh.y, on:false, t:0, obj:null, bathed:false};
      INTER.push({x:sh.x, z:sh.z, r:.85, prio:1.2, when:()=>Math.abs(P.y-sh.y)<1.4, get label(){ return S.on ? '🚿 Khoá vòi sen (E)' : '🚿 Mở vòi sen (E)'; }, action:()=>showerToggle(S)}); SHOW.push(S); }
    /* nút "Tắm tráng (E)" của phiên A (chỉ hiện chữ) → mở vòi sen gần nhất thật sự */
    for(const it of INTER){ if(it.__bl || !/Tắm tráng nước ngọt/.test(String(it.label||''))) continue; if(Math.hypot(it.x-h.x,it.z-h.z)>9) continue; it.__bl=true;
      it.action=()=>{ let b=null, bd=1e9; for(const S of SHOW){ const d=Math.hypot(S.x-P.x,S.z-P.z); if(d<bd){ bd=d; b=S; } } if(b) showerToggle(b, true); }; } }
  function showerToggle(S, forceOn){ S.on=forceOn ? true : !S.on; S.t=0; S.bathed=false;
    if(S.on && !S.obj){ const N=LOW?50:90, pos=new Float32Array(N*6), sp=new Float32Array(N*3), seed=new Float32Array(N*3);
      for(let i=0;i<N;i++){ seed[i*3]=Math.random()*TAU; seed[i*3+1]=Math.sqrt(Math.random()); seed[i*3+2]=Math.random(); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); const ls=new THREE.LineSegments(g,dropM); ls.frustumCulled=false; ls.userData.dynamic=true; scene.add(ls);
      const gp=new THREE.BufferGeometry(); gp.setAttribute('position',new THREE.BufferAttribute(sp,3)); const pt=new THREE.Points(gp,splashM); pt.frustumCulled=false; pt.userData.dynamic=true; scene.add(pt); S.obj={ls, pt, N, seed}; }
    if(S.obj){ S.obj.ls.visible=S.obj.pt.visible=S.on; } }
  function extrasFrame(dt, T){ for(const L of LOCK){ if(Math.abs(L.k-L.want)>.002){ L.k+=(L.want-L.k)*Math.min(1,dt*6); if(Math.abs(L.k-L.want)<.01) L.k=L.want; L.piv.rotation.y=-L.side*1.85*L.k; L.back.visible=L.k>.03; } }
    for(const S of SHOW){ if(!S.on || !S.obj) continue; S.t+=dt; if(S.t>25){ showerToggle(S); continue; } const {ls, pt, N, seed}=S.obj, pa=ls.geometry.attributes.position.array, sa=pt.geometry.attributes.position.array, top=S.y+2.15, H=2.15;
      for(let i=0;i<N;i++){ const u=((T*1.9+seed[i*3+2])%1), a=seed[i*3], r=seed[i*3+1]*(.07+u*.2), x=S.x+Math.cos(a)*r, z=S.z+Math.sin(a)*r, y=top-u*H; pa[i*6]=x; pa[i*6+1]=y; pa[i*6+2]=z; pa[i*6+3]=x; pa[i*6+4]=Math.max(S.y+.01,y-.13); pa[i*6+5]=z;
        const b=((T*2.6+seed[i*3+2]*3.1)%1), rb=.12+seed[i*3+1]*.28; sa[i*3]=S.x+Math.cos(a*1.7)*rb*(.5+b); sa[i*3+1]=S.y+.02+Math.sin(b*Math.PI)*.12; sa[i*3+2]=S.z+Math.sin(a*1.7)*rb*(.5+b); }
      ls.geometry.attributes.position.needsUpdate=true; pt.geometry.attributes.position.needsUpdate=true;
      if(!S.bathed && Math.hypot(P.x-S.x,P.z-S.z)<.5 && Math.abs(P.y-S.y)<.6){ S.bathed=true; try{ const B=W.life && W.life.S && W.life.S.buffs; if(B) B.energy=Math.max(Date.now(),B.energy||0)+180000; }catch(e){} try{ W.life.emote && W.life.emote('cheer',1.6); }catch(e){} } } }
  const freeCab=near=>{ const L=CAB.filter(C=>!C.occ); if(!L.length) return null; if(near) L.sort((a,b)=>Math.hypot(a.x-near[0],a.z-near[1])-Math.hypot(b.x-near[0],b.z-near[1])); return L[0]; };

  /* ============================== VÙNG NƯỚC TẮM (dò lúc chạy: độ sâu thật từ địa hình đáy vịnh) ============================== */
  const strait=(ABY.strait||{}).mouth, marina=((ABY.plots||{}).marina)||{x:-38, z:126};
  const okWater=(x,z)=>{ if(Math.hypot(x-marina.x,z-marina.z)<34) return false; if(strait && z>strait.z-45 && x>strait.x0-20 && x<strait.x1+20) return false; return W.groundAtY(x,z,WY+5)<=WY+.02; };
  const ROWS=[]; for(let f=-6; f<=186; f+=1.5){ let wade=null, swim=null; for(let rho=.762; rho>=.6; rho-=.004){ const [x,z]=el(f,rho), g=gH(x,z), dep=WY-g; if(!okWater(x,z)) continue;
      if(!wade && dep>.95 && dep<1.3) wade=[x,z,g]; if(dep>1.7 && wade && Math.hypot(x-wade[0],z-wade[1])>5){ swim=[x,z]; break; } }
    const sh=el(f,.776), sy=gY(sh[0],sh[1],2); ROWS.push({f, wade, swim, shore:(sy>WY+.15 && sy<2.4) ? [sh[0],sh[1],sy] : null}); }
  const RUNS=[]; { let cur=[]; for(const r of ROWS){ if(r.swim){ cur.push(r); } else { if(cur.length>=7) RUNS.push(cur); cur=[]; } } if(cur.length>=7) RUNS.push(cur); }
  const WADES=ROWS.filter(r=>r.wade && r.shore); log.swimRuns=RUNS.length; log.wade=WADES.length;
  const lerp2=(a,b,t)=>[a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t];

  /* ---------- tư thế dưới nước (gọi sau hoạt hình, trong khung hình của bots_abyssal) ---------- */
  function poseWater(o, T){ const B=o.po.bones; if(!B.Hips) return; frameOf(Math.sin(o.hd),Math.cos(o.hd)); o.a.g.updateMatrixWorld(true); const ph=T*2.4+o.ph;
    if(o.water==='swim'){ for(const [s,k,off] of [['Left',-1,0],['Right',1,Math.PI]]){ const a=ph+off, c=Math.cos(a), sn=Math.sin(a), up=sn>0 ? -sn : -sn*.7;
        aim(B,s+'Arm',s+'ForeArm',c,up,k*.22); aim(B,s+'ForeArm',s+'Hand',c,up+(sn<0?.15:0),k*.08);
        const kk=Math.sin(T*8+o.ph+(k>0?Math.PI:0))*.2; aim(B,s+'UpLeg',s+'Leg',-1,kk,k*.06); aim(B,s+'Leg',s+'Foot',-1,kk*1.2,k*.03); aim(B,s+'Foot',s+'ToeBase',-1,-.2,0); }
      aim(B,'Neck','Head',1,.18,Math.sin(ph)*.25); }
    else if(o.water==='back'){ for(const [s,k] of [['Left',-1],['Right',1]]){ aim(B,s+'Arm',s+'ForeArm',-.25,.05,k*.95); aim(B,s+'ForeArm',s+'Hand',-.35,.05,k*.9); const kk=Math.sin(T*1.4+o.ph+k)*.08; aim(B,s+'UpLeg',s+'Leg',1,kk,k*.12); aim(B,s+'Leg',s+'Foot',1,kk,k*.12); }
      aim(B,'Neck','Head',-1,.25,0); }
    else if(o.water==='wade'){ const sp=o.splash>0 ? Math.min(1,o.splash) : 0; for(const [s,k] of [['Left',-1],['Right',1]]){ const sw=Math.sin(T*1.6+o.ph+k)*.25;
        if(sp){ const e=Math.sin(o.splash*9); aim(B,s+'Arm',s+'ForeArm',.75,-.15+e*.25,k*.35); aim(B,s+'ForeArm',s+'Hand',.9,.05+e*.35,-k*.1); }
        else { aim(B,s+'Arm',s+'ForeArm',.45,-.45,k*.55+sw*.3); aim(B,s+'ForeArm',s+'Hand',.75,-.2,k*.2+sw); } } }
    else if(o.water==='float'){ for(const [s,k] of [['Left',-1],['Right',1]]){ aim(B,s+'Arm',s+'ForeArm',.35,-.05,k*.9); aim(B,s+'ForeArm',s+'Hand',.85,-.05,-k*.35); const kk=Math.sin(T*3+o.ph+k*1.5)*.35; aim(B,s+'UpLeg',s+'Leg',.25+kk*.5,-1,k*.1); aim(B,s+'Leg',s+'Foot',kk,-1,k*.05); } } }
  // đặt thân dưới nước: bơi sải (úp mặt, nằm ngang), nằm ngửa thả nổi, đứng ngâm tới ngực, ngồi phao
  function placeWater(o, T){ const fx=Math.sin(o.hd), fz=Math.cos(o.hd), g=o.a.g; o.col.x=1e9;
    if(o.water==='swim'){ g.rotation.set(Math.PI/2-.12, o.hd, 0, 'YXZ'); g.position.set(o.x-fx*o.h*.5, WY-.16+Math.sin(T*2.4+o.ph)*.025, o.z-fz*o.h*.5); }
    else if(o.water==='back'){ g.rotation.set(-Math.PI/2+.06, o.hd, 0, 'YXZ'); g.position.set(o.x+fx*o.h*.5, WY-.1+Math.sin(T*1.1+o.ph)*.03, o.z+fz*o.h*.5); }
    else if(o.water==='float'){ g.rotation.set(0, o.hd, 0); g.position.set(o.x, WY-.05-o.hips+Math.sin(T*1.7+o.ph)*.05, o.z); }
    else { g.rotation.set(0, o.hd, 0); g.position.set(o.x, o.y+Math.sin(T*1.3+o.ph)*.03, o.z); } }
  function lineWade(o){ const L=['Nước mát ghê! 🌊','Ra chỗ sâu hơn chút không?','Té nước nè! 💦','Biển hôm nay êm thật','Lát lên quầy dừa nhé 🥥']; o.lines=L; }

  /* ---------- người tắm biển (đã mặc đồ bơi sẵn) ---------- */
  const SW_BOTS=[]; const nSwim=LOW?2:3;
  function swimmer(i, back){ const run=RUNS[(i*3+1)%Math.max(1,RUNS.length)]; if(!run) return null; const fem=i%2===1, s=fem?sF(8700+i):sM(8700+i), out=swimOutfit(s,fem), o=person(s,out,`🏊 ${nm(s)} · ${back?'thả nổi':'bơi sải'}`); o.seed=s; o.outS=out; o.noSnap=true;
    o.lines=back?['Nằm ngửa trôi lững lờ, sướng ghê ☁️','Nước ấm lắm!']:['Bơi một vòng nữa! 🏊','Nước trong thấy cả cát dưới đáy','Coi chừng ca nô nhé!']; o.water=back?'back':'swim';
    const pts=run.map(r=>r.swim); let u=R()*(pts.length-1), dir=R()<.5?1:-1; const lo=Math.max(0,Math.floor(u)-5), hi=Math.min(pts.length-1,lo+(back?3:9)); u=clamp(u,lo,hi);
    { const p=lerp2(pts[Math.floor(u)],pts[Math.min(pts.length-1,Math.floor(u)+1)],u%1); o.x=p[0]; o.z=p[1]; o.y=WY; }
    o.upd=(dt,T)=>{ const sp=back?.12:.75, i0=Math.floor(u), a=pts[i0], b=pts[Math.min(pts.length-1,i0+1)], seg=Math.max(.5,Math.hypot(b[0]-a[0],b[1]-a[1])); u+=dir*sp*dt/seg; if(u>=hi){ u=hi; dir=-1; } if(u<=lo){ u=lo; dir=1; }
      const j=Math.floor(u), p=lerp2(pts[j],pts[Math.min(pts.length-1,j+1)],u-j), hd=Math.atan2((b[0]-a[0])*dir,(b[1]-a[1])*dir); o.x=p[0]; o.z=p[1]; o.y=WY; o.hd=lerpAngle(o.hd, back?hd+Math.PI*.5:hd, 1-Math.exp(-dt*(back?.5:2.5))); o.a.play('idle'); placeWater(o,T); };
    SW_BOTS.push(o); return o; }
  for(let i=0;i<nSwim;i++) swimmer(i,false); swimmer(nSwim,true);
  /* ---------- nhóm đứng ngâm nước té nước đùa + bé ngồi phao bơi ---------- */
  const ringG=new THREE.TorusGeometry(.36,.12,10,22); { const c=[], C=new THREE.Color(); const pos=ringG.attributes.position; for(let i=0;i<pos.count;i++){ const a=Math.atan2(pos.getY(i),pos.getX(i)); C.set(Math.floor((a+Math.PI)/(Math.PI/4))%2?0xff6b3d:0xf4f2ec); c.push(C.r,C.g,C.b); } ringG.setAttribute('color',new THREE.Float32BufferAttribute(c,3)); }
  const ringM=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.45});
  const WADERS=[];
  function wadeGroup(gi, withKid){ if(!WADES.length) return; const row=WADES[Math.floor((gi*.37+.21)*WADES.length)%WADES.length]; const c=row.wade, sh=row.shore, f=[c[0]-sh[0],c[1]-sh[1]], fl=Math.hypot(f[0],f[1])||1, F=[f[0]/fl,f[1]/fl], Rr=[F[1],-F[0]];
    const n=withKid?2:2; for(let k=0;k<n;k++){ const kid=withKid && k===1, fem=(gi+k)%2===0, s=fem?sF(8750+gi*3+k):sM(8750+gi*3+k), out=swimOutfit(s,fem), o=person(s,out,kid?`🛟 Bé ${nm(s)} · ngồi phao`:`🌊 ${nm(s)} · tắm biển`,null,kid?1.2:null); o.seed=s; o.noSnap=true; lineWade(o);
      if(kid){ o.lines=['Mẹ ơi con nổi được nè! 🛟','Hihi nước mát quá!']; const ring=new THREE.Mesh(ringG,ringM); ring.userData.dynamic=true; scene.add(ring); o.ring=ring; }
      let x=c[0]+Rr[0]*(k-.5)*1.5+(kid?F[0]*.9:0), z=c[1]+Rr[1]*(k-.5)*1.5+(kid?F[1]*.9:0); if(!okWater(x,z)){ x=c[0]; z=c[1]; } o.x=x; o.z=z; o.y=gH(x,z); o.hd=Math.atan2(Rr[0]*(k?-1:1),Rr[1]*(k?-1:1)); o.water=kid?'float':'wade'; o.splash=0; o.home=[x,z];
      o.upd=(dt,T)=>{ o.y=gH(o.x,o.z); o.a.play('idle'); if(o.splash>0) o.splash-=dt; else if(!kid && R()<dt*.05){ o.splash=1.6; if(R()<.4) say(o,pick(['Té nước nè! 💦','Á lạnh quá! 😆','Bắt được rồi nhé!']),2); }
        if(kid){ o.hd+=Math.sin(T*.3+o.ph)*dt*.2; o.x=o.home[0]+Math.sin(T*.25+o.ph)*.6; o.z=o.home[1]+Math.cos(T*.21+o.ph)*.6; }
        placeWater(o,T); if(o.ring){ o.ring.visible=o.a.g.visible; if(o.ring.visible){ o.ring.position.set(o.x, WY+.02+Math.sin(T*1.7+o.ph)*.05, o.z); o.ring.rotation.set(Math.PI/2,0,T*.2); } } };
      WADERS.push(o); } }
  wadeGroup(0,false); if(!LOW) wadeGroup(1,true);

  /* ============================== 3. 🏐 BÓNG CHUYỀN BÃI BIỂN ============================== */
  const BALL={on:false, mem:[], state:'hold', holder:0, from:null, to:null, t:0, dur:1.3, joined:false, center:null, mesh:null, hitOk:false, wait:1.5, fetch:null};
  { const loungeNear=(x,z)=>LOUNGE.some(L=>Math.hypot(L.cx-x,L.cz-z)<3.2);
    for(const fb of [78,104,38,142,60,122]){ const c=el(fb,.808), cy=gY(c[0],c[1],2.5); if(!(cy>WY+.3 && cy<2.4)) continue; const spots=[]; const n0=el(fb,.6), dir=Math.atan2(n0[0]-c[0],n0[1]-c[1]);
      for(let k=0;k<3;k++){ const a=dir+k/3*TAU+.4, sp=findSpot(c[0]+Math.sin(a)*3.2, c[1]+Math.cos(a)*3.2, cy, .4, true); if(sp && Math.abs(sp[2]-cy)<.8 && !loungeNear(sp[0],sp[1])) spots.push(sp); }
      if(spots.length===3){ BALL.center=[c[0],c[1],cy]; BALL.spots=spots; break; } }
    if(BALL.center){ const ballG=new THREE.SphereGeometry(.21,18,12), cols=[], C=new THREE.Color(), pos=ballG.attributes.position; for(let i=0;i<pos.count;i++){ const a=Math.atan2(pos.getZ(i),pos.getX(i)); C.set([0xf4f2ec,0x1f5fa8,0xf2c14e][Math.floor((a+Math.PI)/(TAU/6))%3]); cols.push(C.r,C.g,C.b); } ballG.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
      BALL.mesh=new THREE.Mesh(ballG,new THREE.MeshStandardMaterial({vertexColors:true, roughness:.5})); BALL.mesh.castShadow=true; BALL.mesh.userData.dynamic=true; scene.add(BALL.mesh);
      BALL.spots.forEach((sp,k)=>{ const fem=k===1, s=fem?sF(8800+k):sM(8800+k), o=person(s, swimOutfit(s,fem), `🏐 ${nm(s)} · bóng chuyền bãi biển`); o.seed=s; o.x=sp[0]; o.z=sp[1]; o.y=sp[2]; o.hd=face(sp[0],sp[1],BALL.center[0],BALL.center[1]); o.spot=sp; o.lines=['Chuyền qua đây! 🏐','Vào chơi chung không bạn?','Đỡ hay quá! 👏']; o.bump=0;
        o.upd=(dt,T)=>{ if(stepGo(o,dt)) return; const b=BALL.mesh.position; o.hd=lerpAngle(o.hd, face(o.x,o.z,b.x,b.z), 1-Math.exp(-dt*5)); o.a.play('idle'); put(o);
          if(o.a.g.visible){ const B=o.po.bones; frameOf(Math.sin(o.hd),Math.cos(o.hd)); o.a.g.updateMatrixWorld(true); const e=o.bump>0 ? Math.min(1,o.bump*2) : (BALL.to===o && BALL.state==='fly' && BALL.t>BALL.dur*.55 ? 1 : 0);
            if(e){ for(const [s,k] of [['Left',-1],['Right',1]]){ aim(B,s+'Arm',s+'ForeArm',.8,-.45,k*.12); aim(B,s+'ForeArm',s+'Hand',.85,-.25,-k*.28); } } else if(BALL.holder===BALL.mem.indexOf(o) && BALL.state==='hold'){ for(const [s,k] of [['Left',-1],['Right',1]]){ aim(B,s+'Arm',s+'ForeArm',.7,-.3,k*.2); aim(B,s+'ForeArm',s+'Hand',.6,.5,-k*.55); } } }
          if(o.bump>0) o.bump-=dt; }; BALL.mem.push(o); });
      BALL.on=true; log.ball=BALL.center.map(v=>Math.round(v));
      INTER.push({x:BALL.center[0], z:BALL.center[1], r:6.5, prio:.5, when:()=>Math.abs(P.y-BALL.center[2])<2.5 && !HOOK.vehicle, get label(){ return BALL.joined ? '🏐 Rời trận bóng chuyền (E)' : '🏐 Vào chơi bóng chuyền bãi biển cùng nhóm (E)'; },
        action:()=>{ BALL.joined=!BALL.joined; toast(BALL.joined ? '🏐 Đã vào nhóm! Bóng bay tới thì bấm E để đỡ bóng (đi xa quá 10 m là rời nhóm).' : '🏐 Đã rời trận bóng.', 3200); }});
      BALL.hit={x:0, z:0, r:4, prio:9, when:()=>BALL.joined && BALL.to==='me' && BALL.state==='fly' && BALL.t>BALL.dur*.35, label:'🏐 Đỡ bóng! (E)', action:()=>{ BALL.hitOk=true; try{ W.life.emote && W.life.emote('throw',.45); }catch(e){} }}; INTER.push(BALL.hit); } }
  const handPos=(o,out)=>{ if(o==='me'){ out.set(P.x,P.y+1.25,P.z); return out; } out.set(o.x,o.y+1.15,o.z); return out; };
  const _bf=new V3(), _bt=new V3();
  function throwBall(fromIdx, to){ BALL.state='fly'; BALL.t=0; BALL.from=fromIdx; BALL.to=to; BALL.hitOk=false; const a=BALL.mem[fromIdx]; handPos(a,_bf); handPos(to,_bt); BALL.p0=_bf.clone(); BALL.p1=_bt.clone(); BALL.dur=1.15+_bf.distanceTo(_bt)*.06; a.bump=.45; }
  function ballFrame(dt){ if(!BALL.on) return; const m=BALL.mesh, cvis=Math.hypot(BALL.center[0]-W.camera.position.x, BALL.center[1]-W.camera.position.z)<85; m.visible=cvis; BALL.hit.x=P.x; BALL.hit.z=P.z;
    if(BALL.joined && Math.hypot(P.x-BALL.center[0],P.z-BALL.center[1])>10){ BALL.joined=false; toast('🏐 Đã rời trận bóng chuyền.',2200); }
    if(BALL.state==='hold'){ const h=BALL.mem[BALL.holder]; handPos(h,_bf); m.position.set(_bf.x,_bf.y+.25,_bf.z); BALL.wait-=dt; if(BALL.wait<=0){ const cand=[...BALL.mem.map((o,i)=>i).filter(i=>i!==BALL.holder)]; let to=BALL.mem[pick(cand)];
        if(BALL.joined && R()<.5 && Math.hypot(P.x-BALL.center[0],P.z-BALL.center[1])<9) to='me'; throwBall(BALL.holder,to); } return; }
    if(BALL.state==='fly'){ BALL.t+=dt; const u=Math.min(1,BALL.t/BALL.dur); if(BALL.to==='me') handPos('me',BALL.p1);
      m.position.lerpVectors(BALL.p0,BALL.p1,u); m.position.y+=Math.sin(u*Math.PI)*3.2; m.rotation.x+=dt*6; m.rotation.z+=dt*3;
      if(u>=1){ if(BALL.to==='me'){ if(BALL.hitOk){ const to=pick(BALL.mem.map((o,i)=>i)); BALL.state='fly'; BALL.t=0; BALL.p0=m.position.clone(); BALL.to=BALL.mem[to]; handPos(BALL.to,BALL.p1); BALL.p1=BALL.p1.clone(); BALL.dur=1.4; BALL.hitOk=false; BALL.meHits=(BALL.meHits||0)+1; if(BALL.meHits%3===1) say(BALL.to,pick(['Đỡ đẹp lắm! 👏','Hay quá bạn ơi!','Bóng tới rồi!']),2); }
            else { BALL.state='roll'; BALL.t=0; const near=BALL.joined && Math.hypot(P.x-BALL.center[0],P.z-BALL.center[1])<9; BALL.rp=near?[P.x+(R()-.5)*1.6, P.z+(R()-.5)*1.6]:[BALL.center[0]+(R()-.5)*2, BALL.center[1]+(R()-.5)*2]; BALL.ry=gY(BALL.rp[0],BALL.rp[1],near?P.y:BALL.center[2]); } }
          else { const k=BALL.mem.indexOf(BALL.to); BALL.holder=k; BALL.state='hold'; BALL.wait=.35+R()*.5; BALL.to.bump=.5; } } return; }
    if(BALL.state==='roll'){ BALL.t+=dt; const u=Math.min(1,BALL.t/.9); m.position.set(m.position.x+(BALL.rp[0]-m.position.x)*Math.min(1,dt*4), BALL.ry+.21+Math.abs(Math.sin(u*Math.PI*2))*(1-u)*.6, m.position.z+(BALL.rp[1]-m.position.z)*Math.min(1,dt*4));
      if(BALL.t>1.2 && !BALL.fetch){ let bi=0, bd=1e9; BALL.mem.forEach((o,i)=>{ const d=Math.hypot(o.x-BALL.rp[0],o.z-BALL.rp[1]); if(d<bd){ bd=d; bi=i; } }); const o=BALL.mem[bi]; BALL.fetch=o; say(o,'Để mình nhặt bóng! 😄',2.2);
        const sp=findSpot(BALL.rp[0],BALL.rp[1],BALL.ry,.35,false)||[BALL.rp[0],BALL.rp[1],BALL.ry]; go(o,[sp],2.6,()=>{ BALL.holder=bi; BALL.state='hold'; BALL.wait=99; go(o,[o.spot],1.6,()=>{ BALL.wait=.8; BALL.fetch=null; }); }); } } }

  /* ============================== 🩱 KHÁCH VÀO NHÀ THAY ĐỒ → RA BIỂN BƠI → THAY LẠI → VỀ ============================== */
  const CHANGERS=[]; const moveTo=(o,tx,tz,sp,dt,yf)=>{ const dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<.06){ o.a.play('idle'); return true; } const k=Math.min(d,sp*dt); o.x+=dx/d*k; o.z+=dz/d*k; o.y=yf(o.x,o.z); o.hd=lerpAngle(o.hd,Math.atan2(dx,dz),1-Math.exp(-dt*8)); o.a.play(sp>2?'run':'walk'); return false; };
  function changer(i){ const fem=i%2===1, s=fem?sF(8900+i):sM(8900+i), cas=K.casual(), sw=swimOutfit(s,fem), o=person(s,cas,`🩱 ${nm(s)} · khách tắm biển`); o.seed=s; o.outC=cas; o.outS=sw; o.inSwim=false;
    o.lines=['Thay đồ xong ra biển thôi! 🌊','Buồng thay đồ sạch sẽ ghê','Nắng thế này tắm biển là nhất ☀️']; o.hidden=true; let st='away', C=null, row=null, sw0=0; o.wt=rr(3,12)+i*14;
    const stairNear=(x,z)=>{ let b=null, bd=1e9; for(const q of STAIRS){ if(!q.top||!q.bottom) continue; const d=Math.hypot(q.bottom[0]-x,q.bottom[1]-z); if(d<bd){ bd=d; b=q; } } return b; };
    const toShore=()=>{ row=pick(WADES.length?WADES:[{shore:null}]); if(!row || !row.shore){ st='leave'; return; } st='shore'; go(o,[row.shore],1.15,()=>{ st='wadeIn'; o.noSnap=true; }); };
    const startCab=()=>{ C=freeCab([o.x,o.z]); if(!C){ o.wt=4; st=o.inSwim?'waitBack':'waitCab'; return; } C.occ=o; st='toCab'; const outside=findSpot(C.out[0],C.out[1],C.y,.3,false)||[C.out[0],C.out[1],C.y]; const ent=C.entry?[[...C.entry[0],C.y],[...C.entry[1],C.y]]:[]; go(o,[...ent, outside],1.15,()=>{ st='enter'; o.noSnap=true; }); };
    o.upd=(dt,T)=>{ if(stepGo(o,dt)) return; const Y=(x,z)=>gY(x,z,o.y);
      if(st==='away'){ o.wt-=dt; if(o.wt>0) return; const S2=pick(STAIRS.filter(q=>q.top&&q.bottom)); if(!S2){ o.wt=30; return; } o.x=S2.top[0]; o.z=S2.top[1]; o.y=gY(o.x,o.z,16); o.hidden=false; o.inSwim=false; setOutfit(o,o.outC);
        st='arrive'; go(o,[[...S2.bottom,2.5]],1.15,()=>{ if(chReady) startCab(); else { setOutfit(o,o.outS); o.inSwim=true; toShore(); } }); return; }
      if(st==='waitCab' || st==='waitBack'){ o.a.play('idle'); put(o); o.wt-=dt; if(o.wt<=0) startCab(); return; }
      if(st==='enter'){ if(moveTo(o,C.x,C.z,.9,dt,()=>C.y)){ st='inCab'; o.wt=0; C.closed=true; } put(o); return; }
      if(st==='inCab'){ o.wt+=dt; o.hd=lerpAngle(o.hd,C.yaw,1-Math.exp(-dt*4)); o.a.play('idle'); put(o); if(o.wt>5.5 && !o.sw){ o.sw=true; o.inSwim=!o.inSwim; setOutfit(o,o.inSwim?o.outS:o.outC); } if(o.wt>10.8){ C.closed=false; o.sw=false; st='exitCab'; o.wt=0; } return; }
      if(st==='exitCab'){ o.wt+=dt; if(o.wt<.7){ o.a.play('idle'); put(o); return; } if(moveTo(o,C.out[0],C.out[1],1,dt,Y)){ const ent=C.entry; C.occ=null; C=null; o.noSnap=false; if(ent){ st='exitHouse'; go(o,[[...ent[1],o.y],[...ent[0],o.y]],1.1,()=>{ if(o.inSwim) toShore(); else st='leave'; }); } else if(o.inSwim) toShore(); else st='leave'; } put(o); return; }
      if(st==='wadeIn'){ const tgt=row.wade; if(moveTo(o,tgt[0],tgt[1],.75,dt,(x,z)=>Math.max(gH(x,z),WY-1.25))){ st='swim'; o.water='swim'; sw0=0; o.swT=rr(35,70); o.lap=0; } else { if(WY-o.y>.5){ o.water='wade'; placeWater(o,T); } else put(o); } return; }
      if(st==='swim'){ sw0+=dt; const a=row.wade, b=row.swim||row.wade, ph=(Math.sin(sw0*.09)+1)/2, p=lerp2(a,b,.35+ph*.65); const ox=o.x, oz=o.z; o.x+=(p[0]-o.x)*Math.min(1,dt*.8); o.z+=(p[1]-o.z)*Math.min(1,dt*.8); const mv=Math.hypot(o.x-ox,o.z-oz);
        if(mv>1e-4) o.hd=lerpAngle(o.hd,Math.atan2(o.x-ox,o.z-oz),1-Math.exp(-dt*3)); o.y=WY; o.a.play('idle'); placeWater(o,T); if(sw0>o.swT){ st='wadeOut'; o.water='wade'; } return; }
      if(st==='wadeOut'){ const tgt=row.shore; if(moveTo(o,tgt[0],tgt[1],.8,dt,(x,z)=>Math.max(gH(x,z),WY-1.25))){ o.water=null; o.noSnap=false; o.y=gY(o.x,o.z,tgt[2]+.3); if(chReady) startCab(); else st='leave'; put(o); } else if(WY-o.y>.5){ o.water='wade'; placeWater(o,T); } else { o.water=null; put(o); } return; }
      if(st==='leave'){ const S2=stairNear(o.x,o.z); st='going'; go(o,[S2?[...S2.bottom,2.5]:null, S2?[...S2.top,16]:null],1.15,()=>{ o.hidden=true; st='away'; o.wt=rr(25,60); }); return; }
      o.a.play('idle'); put(o); };
    CHANGERS.push(o); return o; }
  for(let i=0;i<(LOW?1:2);i++) changer(i);

  /* ============================== KHUNG HÌNH (người chơi: nằm, cầm ly sau khi nằm, đồ bơi, buồng thay đồ, bóng) ============================== */
  if(DN) DN.extPlayer=true;   /* tay cầm ly của người chơi được đặt SAU tư thế nằm (file này gọi) */
  let scanT=0, scanN=0, chT=0;
  HOOK.onFrame.push((dt,T)=>{ dt=Math.min(dt||1/60,.1);
    scanT-=dt; if(scanT<=0 && scanN<20){ scanT=3; scanN++; try{ const n=scanLoungers(); if(n) log.loungers=LOUNGE.length; }catch(e){ console.warn('[Bãi biển] ghế', e); } }
    if(!chReady){ chT-=dt; if(chT<=0){ chT=1; try{ initChanging(); }catch(e){ console.warn('[Bãi biển] nhà thay đồ', e); chT=30; } } }
    try{ meLieFrame(); }catch(e){ console.warn('[Bãi biển] nằm', e); meL=null; }
    if(DR){ const h=DR.holderOf(me); if(h) try{ DR.pose(h,dt); }catch(e){} }
    try{ cabinFrame(dt); }catch(e){ console.warn('[Bãi biển] buồng', e); CH=null; HOOK.vehicle=null; }
    try{ extrasFrame(dt, T||0); }catch(e){ if(!log.exErr){ log.exErr=1; console.warn('[Bãi biển] tủ / vòi sen', e); } }
    try{ ballFrame(dt); }catch(e){ console.warn('[Bãi biển] bóng', e); BALL.on=false; }
    try{ retarget(dt); }catch(e){ console.warn('[Bãi biển] đồ bơi', e); swimOn=false; meRoot.visible=true; } });
  scanLoungers(); log.loungers=LOUNGE.length; log.swimmers=SW_BOTS.length; log.waders=WADERS.length; log.changers=CHANGERS.length;
  const api={loungers:LOUNGE, freeLounger, take, release, sideSpot, placeLie, poseLie, poseWater, setSwim, swim:()=>swimOn, cabins:CAB, ball:BALL, log, rows:ROWS, runs:RUNS, swimOutfit, setOutfit, changers:CHANGERS, state:()=>({lie:!!meL, swim:swimOn, cab:CH?{ph:CH.ph, t:+CH.t.toFixed(1)}:null, ball:BALL.state, joined:BALL.joined}), initChanging};
  W.abyBeach=api; return api; }
