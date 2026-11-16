// QC World – BỘ THANG MÁY DÙNG CHUNG (phiên chính, 16/11/2026) – Bình: "phải có cái ô thang máy để bước vô, trong đó sẽ hiện các nút
// trên bảng thang máy, user muốn chọn tầng mấy thì chọn" + "thang máy thì cứ cho nhiều cái".
//  • Giếng thang kính có khung thép, mỗi tầng có cửa trượt 2 cánh + bảng số tầng đang ở + nút GỌI THANG (E) ngoài cửa.
//  • Cabin thật: bước vào được (sàn cabin là mặt đứng chạy theo cabin), có đèn trần, tay vịn, bảng nút.
//  • Đứng trong cabin → hiện BẢNG NÚT (HTML) liệt kê mọi tầng; bấm tầng nào → đóng cửa, cabin chạy, nhân vật đi cùng, tới nơi mở cửa.
//  • Vách giếng chặn mọi phía; cửa tầng chỉ mở khi cabin đang đỗ ở tầng đó → không bao giờ rơi xuống giếng.
// API:
//   import { makeLift, makeLiftBank } from './liftkit.js';
//   const L = makeLift(W, {x, z, yaw, floors:[{y, name}], w:2.4, d:2.4, name:'Thang A', color:0xd8b25a});
//     – (x,z) tâm giếng; yaw = hướng cửa (cửa ở phía +z cục bộ, giống rotation.y của three.js); floors xếp từ thấp lên cao.
//     – Vùng sàn của toà nhà phải CHỪA LỖ đúng giếng (w × d) ở các tầng, để sàn nhà không cắt ngang cabin.
//   makeLiftBank(W, {x, z, yaw, floors, count:3, gap:.6, ...}) – dãy nhiều thang cạnh nhau (dàn theo trục x cục bộ).
// Emoji: không dùng 🛗 / 🪜 (Windows 10 không có) → dùng ⇅.
const LIFTS=[]; let panel=null, cur=null, hooked=false;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

function css(){ if(document.getElementById('liftkit-css')) return; const st=document.createElement('style'); st.id='liftkit-css'; st.textContent=`
#liftPanel{position:fixed;right:22px;top:50%;transform:translateY(-50%);z-index:40;min-width:230px;max-height:78vh;overflow:auto;padding:14px 14px 12px;border-radius:16px;
 background:linear-gradient(180deg,rgba(28,32,40,.94),rgba(16,18,24,.94));border:1px solid rgba(216,178,90,.55);box-shadow:0 10px 40px rgba(0,0,0,.45);color:#f3efe6;font:600 14px 'Segoe UI',system-ui,sans-serif;display:none}
#liftPanel .lp-h{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
#liftPanel .lp-t{font-size:15px;color:#ffd98a}#liftPanel .lp-x{cursor:pointer;border:0;background:rgba(255,255,255,.08);color:#ddd;border-radius:8px;padding:3px 9px;font:600 13px inherit}
#liftPanel .lp-cur{font-size:12px;color:#9fe3ff;margin-bottom:10px}
#liftPanel .lp-g{display:flex;flex-direction:column;gap:6px}
#liftPanel button.lp-b{display:flex;align-items:center;gap:10px;width:100%;cursor:pointer;text-align:left;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#f3efe6;border-radius:12px;padding:7px 10px;font:600 13px 'Segoe UI',system-ui,sans-serif}
#liftPanel button.lp-b:hover{background:rgba(216,178,90,.22);border-color:rgba(216,178,90,.7)}
#liftPanel button.lp-b .n{flex:0 0 34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#20242c;border:2px solid #8a8f99;color:#fff;font:800 14px 'Segoe UI',sans-serif}
#liftPanel button.lp-b.on .n{border-color:#ffd166;color:#ffd166;box-shadow:0 0 10px rgba(255,209,102,.7)}
#liftPanel button.lp-b.here{opacity:.55;cursor:default}
#liftPanel .lp-f{margin-top:9px;font-size:11px;color:#a9a39a;font-weight:500}`; document.head.appendChild(st); }

function showPanel(L){ css(); if(!panel){ panel=document.createElement('div'); panel.id='liftPanel'; document.body.appendChild(panel);
    for(const ev of ['mousedown','pointerdown','wheel','click']) panel.addEventListener(ev,e=>e.stopPropagation()); }
  cur=L; const fl=L.floors, here=L.at, tgt=L.target;
  panel.innerHTML=`<div class="lp-h"><span class="lp-t">⇅ ${L.name}</span><button class="lp-x" title="Ẩn bảng">✕</button></div>
   <div class="lp-cur">Đang ở: <b>${fl[here].name}</b>${tgt>=0 && tgt!==here?` → ${fl[tgt].name}`:''}</div>
   <div class="lp-g">${fl.map((f,i)=>({f,i})).reverse().map(({f,i})=>`<button class="lp-b${i===here&&tgt<0?' here':''}${i===tgt?' on':''}" data-i="${i}"><span class="n">${f.short??(i===0?'G':i)}</span><span>${f.name}</span></button>`).join('')}</div>
   <div class="lp-f">Bấm số tầng muốn tới · ra khỏi cabin để đóng bảng</div>`;
  panel.querySelector('.lp-x').onclick=()=>{ L.hidePanel=true; hidePanel(); };
  panel.querySelectorAll('button.lp-b').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i; if(i!==L.at || L.ph!=='idle') L.go(i, true); });
  panel.style.display='block'; }
function hidePanel(){ if(panel) panel.style.display='none'; cur=null; }

export function makeLift(W, o){
  const {THREE, scene, plats, INTER, HOOK, P, me, toast} = W; css();
  const w=o.w??2.4, d=o.d??2.4, H=o.h??2.7, yaw=o.yaw??0, c=Math.cos(yaw), s=Math.sin(yaw), fl=o.floors.map((f,i)=>({short:f.short??(i===0?'G':String(i)), ...f}));
  const toW=(lx,lz)=>[o.x+lx*c+lz*s, o.z-lx*s+lz*c];
  const yTop=fl[fl.length-1].y+H+.6, yBot=fl[0].y-.4;
  const g=new THREE.Group(); g.position.set(o.x,0,o.z); g.rotation.y=yaw; g.userData.dynamic=true; scene.add(g);
  const steel=new THREE.MeshStandardMaterial({color:0x9aa3ad, metalness:.85, roughness:.3}), accent=new THREE.MeshStandardMaterial({color:o.color??0xd8b25a, metalness:.9, roughness:.25});
  const glass=new THREE.MeshPhysicalMaterial({color:0xcfe9f5, roughness:.05, metalness:.1, transparent:true, opacity:.22, depthWrite:false, side:THREE.DoubleSide});
  const add=(geo,mat,x,y,z,parent=g)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.userData.dynamic=true; parent.add(m); return m; };
  // 16/11 tối ưu lượt vẽ: phần tĩnh gộp thành 3 khối (thép / nhấn / kính), cửa + bảng số + nút gọi dùng InstancedMesh → ~13 lượt vẽ mỗi thang dù bao nhiêu tầng
  const SG=[], AG=[], GG=[], put=(arr,geo,x,y,z,ry=0)=>{ geo=geo.index?geo.toNonIndexed():geo; if(ry) geo.rotateY(ry); geo.translate(x,y,z); arr.push(geo); };
  const SH=yTop-yBot; for(const sx of [-1,1]) for(const sz of [-1,1]) put(SG,new THREE.BoxGeometry(.14,SH,.14), sx*(w/2+.07), yBot+SH/2, sz*(d/2+.07));
  put(GG,new THREE.PlaneGeometry(w,SH), 0, yBot+SH/2, -d/2-.05); for(const sx of [-1,1]) put(GG,new THREE.PlaneGeometry(d,SH), sx*(w/2+.05), yBot+SH/2, 0, Math.PI/2);
  put(SG,new THREE.BoxGeometry(w+.5,.25,d+.5), 0, yTop+.12, 0);
  // cabin
  const cab=new THREE.Group(); g.add(cab);
  add(new THREE.BoxGeometry(w-.08,.12,d-.08), new THREE.MeshStandardMaterial({color:0x2b2f36, roughness:.6}), 0,-.06,0, cab);
  const lamp=add(new THREE.BoxGeometry(w-.3,.05,d-.3), new THREE.MeshStandardMaterial({color:0xfff6e0, emissive:0xfff0cc, emissiveIntensity:1.2}), 0,H-.06,0, cab);
  add(new THREE.BoxGeometry(w-.08,.1,d-.08), steel, 0,H+.02,0, cab);
  add(new THREE.BoxGeometry(w-.1,H,.04), new THREE.MeshStandardMaterial({color:0xb8c2cc, metalness:.95, roughness:.08}), 0,H/2,-d/2+.06, cab);   // vách gương phía sau
  for(const sx of [-1,1]){ add(new THREE.BoxGeometry(.04,H,d-.1), glass, sx*(w/2-.06), H/2, 0, cab); add(new THREE.BoxGeometry(.05,.05,d-.4), accent, sx*(w/2-.14), .95, 0, cab); }
  // bảng nút trong cabin (vẽ canvas)
  const pc=document.createElement('canvas'); pc.width=128; pc.height=256; const pt=new THREE.CanvasTexture(pc); pt.colorSpace=THREE.SRGBColorSpace;
  const pnl=add(new THREE.PlaneGeometry(.32,.64), new THREE.MeshBasicMaterial({map:pt}), w/2-.09, 1.25, d/2-.38, cab); pnl.rotation.y=-Math.PI/2;
  // cửa tầng: 2 cánh trượt + bảng số tầng phía trên
  const ic=document.createElement('canvas'); ic.width=256; ic.height=64; const it=new THREE.CanvasTexture(ic); it.colorSpace=THREE.SRGBColorSpace;
  const doorMat=new THREE.MeshStandardMaterial({color:0xc9ced4, metalness:.9, roughness:.22});
  const L={name:o.name??'Thang máy', floors:fl, at:o.start??0, target:-1, ph:'idle', open:0, t:0, y:fl[o.start??0].y, rider:false, idle:0, hidePanel:false, doors:[], segs:[]};
  const dw=Math.min(1.3,w-.5);
  const NF=fl.length, DIM=new THREE.InstancedMesh(new THREE.BoxGeometry(dw/2,2.2,.06), doorMat, NF*2), SIM=new THREE.InstancedMesh(new THREE.PlaneGeometry(.9,.22), new THREE.MeshBasicMaterial({map:it, transparent:true}), NF);
  const bg=new THREE.CylinderGeometry(.06,.06,.03,16); bg.rotateX(Math.PI/2); const BIM=new THREE.InstancedMesh(bg, new THREE.MeshBasicMaterial({color:0xffffff}), NF), _m=new THREE.Matrix4(), _c=new THREE.Color();
  for(const im of [DIM,SIM,BIM]){ im.userData.dynamic=true; im.frustumCulled=false; g.add(im); }
  const doorAt=(i,op)=>{ const y=fl[i].y+1.1; _m.makeTranslation(-dw/4-op*(dw/2-.04), y, d/2+.08); DIM.setMatrixAt(i*2,_m); _m.makeTranslation(dw/4+op*(dw/2-.04), y, d/2+.08); DIM.setMatrixAt(i*2+1,_m); DIM.instanceMatrix.needsUpdate=true; };
  fl.forEach((f,i)=>{ const lv={y:f.y, op:-1}; doorAt(i,0);
    put(AG,new THREE.BoxGeometry(dw+.3,.14,.12), 0, f.y+2.27, d/2+.1); for(const sx of [-1,1]) put(AG,new THREE.BoxGeometry(.12,2.3,.12), sx*(dw/2+.09), f.y+1.15, d/2+.1);
    for(const sx of [-1,1]) put(SG,new THREE.BoxGeometry((w-dw)/2-.02,2.3,.06), sx*((w+dw)/4+.01), f.y+1.15, d/2+.08);   // vách 2 bên cửa
    _m.makeTranslation(0, f.y+2.55, d/2+.12); SIM.setMatrixAt(i,_m);
    // nút gọi bên phải cửa
    _m.makeTranslation(dw/2+.32, f.y+1.15, d/2+.12); BIM.setMatrixAt(i,_m); BIM.setColorAt(i,_c.set(0x3a3d44));
    // vách cửa (chặn khi cửa đóng) – bật/tắt bằng y0
    const [ax,az]=toW(-w/2,d/2+.08), [bx,bz]=toW(w/2,d/2+.08); lv.seg=W.addSeg(ax,az,bx,bz,.12,f.y-.3,f.y+2.4,`⇅ Cửa ${L.name} đang đóng – bấm E để gọi thang`); lv.y0=f.y-.3;
    /* ngưỡng cửa: mặt đi liền từ sàn cabin ra 0,7 m ngoài cửa (sàn toà nhà có hụt chút cũng không rơi) */ { const [sx2,sz2]=toW(0,d/2+.3); W.addPlat(sx2,sz2,yaw,dw/2+.2,.42,f.y); put(AG,new THREE.BoxGeometry(dw+.4,.04,.84), 0, f.y-.015, d/2+.3); }
    L.doors.push(lv);
    const [ix,iz]=toW(dw/2+.3, d/2+1.1);
    INTER.push({x:ix, z:iz, r:2.2, prio:.9, when:()=>Math.abs(P.y-f.y)<1.2 && !(L.at===i && L.ph==='idle' && L.open>.95),
      label:'', action:()=>{ if(L.at===i && L.ph==='idle'){ L.wantOpen=true; } else L.go(i,false); }});
    const itx=INTER[INTER.length-1]; Object.defineProperty(itx,'label',{get(){ return L.at===i && L.ph==='idle' ? `⇅ Mở cửa ${L.name} (E)` : `⇅ Gọi ${L.name} – đang ở ${fl[L.at].name} (E)`; }}); });
  for(const [arr,mat] of [[SG,steel],[AG,accent],[GG,glass]]) if(arr.length){ const mg=W.mergeGeometries?W.mergeGeometries(arr,false):null; if(mg) add(mg,mat,0,0,0); else arr.forEach(gg=>add(gg,mat,0,0,0)); }
  SIM.instanceMatrix.needsUpdate=true; BIM.instanceMatrix.needsUpdate=true; if(BIM.instanceColor) BIM.instanceColor.needsUpdate=true;
  // vách giếng 3 mặt (toàn chiều cao)
  for(const [p,q] of [[[-w/2-.1,-d/2-.1],[w/2+.1,-d/2-.1]], [[-w/2-.1,-d/2-.1],[-w/2-.1,d/2+.1]], [[w/2+.1,-d/2-.1],[w/2+.1,d/2+.1]]]){ const [ax,az]=toW(...p), [bx,bz]=toW(...q); L.segs.push(W.addSeg(ax,az,bx,bz,.12,yBot,yTop,`⇅ Giếng ${L.name}`)); }
  // sàn cabin = mặt đứng chạy theo cabin
  W.addPlat(o.x,o.z,yaw,w/2-.05,d/2-.02,L.y); L.plat=plats[plats.length-1];
  const drawSigns=()=>{ const x=ic.getContext('2d'); x.clearRect(0,0,256,64); x.fillStyle='rgba(10,12,16,.9)'; x.fillRect(0,0,256,64); x.fillStyle=L.ph==='move'?'#ffd166':'#7fe3ff'; x.font='800 40px Segoe UI'; x.textAlign='center'; x.textBaseline='middle';
      const arrow=L.ph==='move'?(fl[L.target].y>L.y?'▲ ':'▼ '):''; x.fillText(arrow+fl[L.at].short, 128, 34); it.needsUpdate=true;
    const p=pc.getContext('2d'); p.fillStyle='#1b1f26'; p.fillRect(0,0,128,256); p.strokeStyle='#d8b25a'; p.lineWidth=4; p.strokeRect(2,2,124,252); const n=fl.length, cols=n>6?2:1, rows=Math.ceil(n/cols);
      for(let i=0;i<n;i++){ const col=cols===2?(i%2):0, row=cols===2?Math.floor(i/2):i, cx=cols===2?(col?88:40):64, cy=230-row*(200/Math.max(rows,1)); p.beginPath(); p.arc(cx,cy,15,0,7); p.fillStyle=i===L.target?'#ffd166':(i===L.at?'#7fe3ff':'#3a404b'); p.fill(); p.fillStyle='#10131a'; p.font='800 15px Segoe UI'; p.textAlign='center'; p.textBaseline='middle'; p.fillText(fl[i].short,cx,cy+1); }
      pt.needsUpdate=true; };
  L.go=(i,withRider)=>{ if(i<0 || i>=fl.length) return; if(L.ph!=='idle'){ L.queue=i; return; } if(i===L.at){ L.wantOpen=true; return; } L.target=i; L.rider=!!withRider; L.ph='close'; drawSigns(); if(cur===L) showPanel(L); if(W.sfx && L.open>.05) W.sfx('lift-door', o.x, L.y+1.1, o.z); };   /* S19g: tiếng cửa trượt đóng */
  const inside=()=>{ const dx=P.x-o.x, dz=P.z-o.z, lx=dx*c-dz*s, lz=dx*s+dz*c; return Math.abs(lx)<w/2-.15 && Math.abs(lz)<d/2-.05 && Math.abs(P.y-L.y)<.9; };
  L.inside=inside;
  L.update=(dt)=>{ const ins=inside();
    if(L.ph==='idle'){ const near=Math.abs(P.y-fl[L.at].y)<1.2 && Math.hypot(...((()=>{ const [fx,fz]=toW(0,d/2+1.2); return [P.x-fx,P.z-fz]; })()))<2.4;
      if(near || ins || L.wantOpen){ L.open=Math.min(1,L.open+dt*1.6); L.idle=0; } else { L.idle+=dt; if(L.idle>2.5) L.open=Math.max(0,L.open-dt*1.4); } if(L.open>=1) L.wantOpen=false;
      if(ins && !L.hidePanel && cur!==L) showPanel(L); if(!ins){ L.hidePanel=false; if(cur===L) hidePanel(); }
      if(L.queue!=null){ const q=L.queue; L.queue=null; L.go(q, ins); } }
    else if(L.ph==='close'){ L.open=Math.max(0,L.open-dt*1.6); if(L.open<=0){ L.ph='move'; L.t=0; L.y0=L.y; L.rider=L.rider||ins; if(L.rider){ L.lx=P.x; L.lz=P.z; HOOK.vehicle={drive:()=>{ P.x=L.lx; P.z=L.lz; P.y=L.y; P.vx=P.vz=P.vy=0; me.g.position.set(P.x,P.y,P.z); if(me.play) me.play('idle'); }}; } drawSigns(); } }
    else if(L.ph==='move'){ const ty=fl[L.target].y, dist=Math.abs(ty-L.y0), T=Math.max(1.6, Math.min(dist/2.6, 6+dist/9));   /* nhà cao: tăng tốc như thang cao tốc (91 m ≈ 16 s) */ L.t+=dt; const k=Math.min(1,L.t/T); L.y=L.y0+(ty-L.y0)*ease(k);
      if(k>=1){ L.y=ty; L.at=L.target; L.target=-1; L.ph='idle'; L.wantOpen=true; if(W.sfx){ W.sfx('lift-ding', o.x, L.y+1.2, o.z); W.sfx('lift-door', o.x, L.y+1.1, o.z); }   /* S19g: 'ding' tới tầng + cửa mở */ if(L.rider){ HOOK.vehicle=null; P.y=L.y; P.ground=true; L.rider=false; if(toast) toast(`⇅ Đã tới ${fl[L.at].name}`, 1800); } drawSigns(); if(cur===L) showPanel(L); } }
    cab.position.y=L.y; L.plat.h=L.y;
    let bc=false; L.doors.forEach((lv,i)=>{ const op=(i===L.at && L.ph==='idle')?L.open:0; if(op!==lv.op){ lv.op=op; doorAt(i,op); } lv.seg.y0=op>.85?1e6:lv.y0; const on=L.target===i; if(on!==lv.on){ lv.on=on; BIM.setColorAt(i,_c.set(on?0xffd166:0x3a3d44)); bc=true; } }); if(bc && BIM.instanceColor) BIM.instanceColor.needsUpdate=true;
    g.visible=Math.abs(P.x-o.x)<170 && Math.abs(P.z-o.z)<170;
    lamp.material.emissiveIntensity=.8+(W.night||0)*1.4; };
  drawSigns(); LIFTS.push(L);
  if(!hooked){ hooked=true; HOOK.onFrame.push((dt)=>{ dt=Math.min(dt||1/60,.1); for(const l of LIFTS){ if(Math.abs(P.x-l.cx)>170 || Math.abs(P.z-l.cz)>170){ if(l.ph==='move' || l.ph==='close') l.update(dt); else if(l.g.visible) l.g.visible=false; continue; } l.update(dt); } }); }
  L.cx=o.x; L.cz=o.z; L.g=g; return L; }

export function makeLiftBank(W, o){ const n=o.count??2, w=o.w??2.4, gap=o.gap??.6, c=Math.cos(o.yaw??0), s=Math.sin(o.yaw??0), out=[];
  for(let i=0;i<n;i++){ const lx=(i-(n-1)/2)*(w+gap+.3); out.push(makeLift(W, {...o, x:o.x+lx*c, z:o.z-lx*s, name:`${o.name??'Thang'} ${String.fromCharCode(65+i)}`, start:i%2?o.floors.length-1:(o.start??0)})); }
  return out; }
export const allLifts=()=>LIFTS;
