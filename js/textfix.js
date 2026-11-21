// QC World – S-TEXT (21/11/2026): CHỮ SẮC NÉT, KHÔNG LÓA, NHÃN KHÔNG XUYÊN TƯỜNG
// 1) Chữ 3D (bảng hiệu / bảng thông tin vẽ bằng canvas ở mọi module):
//    - anisotropy tối đa + mipmap → chữ nhìn xiên vẫn rõ;
//    - chữ PHÁT SÁNG (emissiveMap là canvas) bị chặn trần độ sáng (đêm các module đẩy lên tới ~2,9 → loá, ăn bloom);
//    - canvas quá trắng (nền giấy/bảng trắng) trên vật liệu không chịu ánh sáng → dịu bớt 15 %.
//    Quét cả cảnh lúc nạp và mỗi 3 s (vật dựng thêm sau cũng được sửa). Không vẽ lại canvas của module nào.
// 2) Nhãn HTML (tên NPC, địa danh): kiểm tra bị che bởi tường/nhà dựa trên hộp va chạm (boxes, SEGS, cột tròn lớn),
//    chia nhỏ theo khung (mỗi khung chỉ xét 1 phần nhãn) → nhẹ máy; nhãn nằm TRONG chính toà nhà của nó không bị tính là che.
export function initTextFix(W){
  const {THREE, scene, renderer, boxes, SEGS, circles, groundH}=W;
  const MAXA=Math.min(16, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 8);
  const EMI_CAP=.55;            // trần độ sáng chữ phát sáng
  const seenTex=new WeakSet(), seenMat=new WeakSet();
  const isCanvasTex=t=>!!(t && (t.isCanvasTexture || (t.image && typeof HTMLCanvasElement!=='undefined' && t.image instanceof HTMLCanvasElement)));
  const _lc=document.createElement('canvas'); _lc.width=_lc.height=16; const _lg=_lc.getContext('2d', {willReadFrequently:true});
  function brightness(img){ try{ _lg.clearRect(0,0,16,16); _lg.drawImage(img,0,0,16,16); const d=_lg.getImageData(0,0,16,16).data; let s=0, n=0;
      for(let i=0;i<d.length;i+=4){ if(d[i+3]<40) continue; s+=(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])/255; n++; } return n ? s/n : 0; }catch(e){ return 0; } }
  function fixTex(t){ if(!isCanvasTex(t) || seenTex.has(t)) return; seenTex.add(t);
    let ch=false; if(t.anisotropy<MAXA){ t.anisotropy=MAXA; ch=true; }
    if(t.minFilter!==THREE.LinearMipmapLinearFilter && t.generateMipmaps!==false){ t.minFilter=THREE.LinearMipmapLinearFilter; ch=true; }
    if(ch) t.needsUpdate=true; }
  // emissiveIntensity thành thuộc tính có trần: module nào đặt lại mỗi đêm cũng không vượt trần
  function capEmissive(m){ if(m.userData.emiCap) return; const d=Object.getOwnPropertyDescriptor(m,'emissiveIntensity'); if(d && (d.get||d.set)) return;
    let raw=m.emissiveIntensity; m.userData.emiCap=EMI_CAP;
    Object.defineProperty(m,'emissiveIntensity',{configurable:true, enumerable:true, get(){ return Math.min(raw, this.userData.emiCap); }, set(v){ raw=v; }}); }
  function fixMat(m){ if(!m || seenMat.has(m)) return; seenMat.add(m);
    fixTex(m.map); fixTex(m.emissiveMap);
    if(m.userData.textGlow===true) return;   // module nào thật sự muốn chữ sáng rực thì đặt userData.textGlow=true
    if(isCanvasTex(m.emissiveMap) && m.emissive && (m.emissive.r+m.emissive.g+m.emissive.b)>0) capEmissive(m);
    // vật liệu không chịu ánh sáng (Basic) + canvas gần như toàn trắng → dịu 15 % cho đỡ chói
    if(m.isMeshBasicMaterial && isCanvasTex(m.map) && m.color && !m.userData.dimmed && m.map.image && brightness(m.map.image)>.82){ m.color.multiplyScalar(.85); m.userData.dimmed=true; } }
  function scan(root){ root.traverse(o=>{ if(!o.material || o.isSkinnedMesh) return; for(const m of [].concat(o.material)) fixMat(m); }); }

  // ---------- nhãn HTML bị che? (đoạn thẳng camera → nhãn cắt hộp/tường/cột) ----------
  const CAP_H=4;   // hộp/tường không ghi độ cao: coi như cao 4 m từ mặt đất
  function segBox(ax,ay,az,bx,by,bz,b){ const y0=b.y0!==undefined ? b.y0 : (b._g ??= groundH((b.x0+b.x1)/2,(b.z0+b.z1)/2)), y1=b.y1!==undefined ? b.y1 : y0+CAP_H;
    let t0=0, t1=1; const dx=bx-ax, dy=by-ay, dz=bz-az;
    for(const [o,d,lo,hi] of [[ax,dx,b.x0,b.x1],[ay,dy,y0,y1],[az,dz,b.z0,b.z1]]){
      if(Math.abs(d)<1e-9){ if(o<lo || o>hi) return false; continue; }
      let ta=(lo-o)/d, tb=(hi-o)/d; if(ta>tb){ const s=ta; ta=tb; tb=s; } if(ta>t0) t0=ta; if(tb<t1) t1=tb; if(t0>t1) return false; }
    return t1>.02 && t0<.97; }
  function segSeg(ax,ay,az,bx,by,bz,s){   // tường mảnh xoay (SEGS) = viên nang bán kính s.r theo phương ngang
    const ux=bx-ax, uz=bz-az, vx=s.bx-s.ax, vz=s.bz-s.az, wx=ax-s.ax, wz=az-s.az;
    const a=ux*ux+uz*uz, b=ux*vx+uz*vz, c=vx*vx+vz*vz, d=ux*wx+uz*wz, e=vx*wx+vz*wz, D=a*c-b*b;
    let sc, tc; if(D<1e-9){ sc=0; tc=c>1e-9?e/c:0; } else { sc=(b*e-c*d)/D; tc=(a*e-b*d)/D; }
    sc=Math.min(.97,Math.max(.02,sc)); tc=Math.min(1,Math.max(0,tc));
    const px=ax+ux*sc-(s.ax+vx*tc), pz=az+uz*sc-(s.az+vz*tc); if(px*px+pz*pz>(s.r||.15)**2) return false;
    const y=ay+(by-ay)*sc, y0=s.y0!==undefined ? s.y0 : groundH(s.ax+vx*tc, s.az+vz*tc), y1=s.y1!==undefined ? s.y1 : y0+CAP_H; return y>=y0 && y<=y1; }
  function occluded(cam, p){ const ax=cam.x, ay=cam.y, az=cam.z, bx=p.x, by=p.y, bz=p.z;
    const mnx=Math.min(ax,bx), mxx=Math.max(ax,bx), mnz=Math.min(az,bz), mxz=Math.max(az,bz);
    for(const b of boxes){ if(b.x1<mnx || b.x0>mxx || b.z1<mnz || b.z0>mxz) continue;
      if(bx>b.x0-.6 && bx<b.x1+.6 && bz>b.z0-.6 && bz<b.z1+.6) continue;   // nhãn của chính toà nhà này
      if(segBox(ax,ay,az,bx,by,bz,b)) return true; }
    for(const s of SEGS){ if(s.x1<mnx-.3 || s.x0>mxx+.3 || s.z1<mnz-.3 || s.z0>mxz+.3) continue; if(segSeg(ax,ay,az,bx,by,bz,s)) return true; }
    for(const c of circles){ if(c.r<1.4) continue; const ux=bx-ax, uz=bz-az, L2=ux*ux+uz*uz||1e-9; let t=((c.x-ax)*ux+(c.z-az)*uz)/L2; if(t<.02 || t>.95) continue;
      const qx=ax+ux*t-c.x, qz=az+uz*t-c.z; if(qx*qx+qz*qz<c.r*c.r && Math.hypot(bx-c.x,bz-c.z)>c.r+.6) return true; }
    return false; }
  // gọi mỗi khung từ updateLabels: trả độ "lộ" 0..1 đã làm mượt (đổi chậm → không chớp)
  let slice=0; const SL=6;
  function visibility(L, p, cam, dt, i){ if(L.noOcc) return 1;
    if(L._vis===undefined){ L._vis=occluded(cam,p)?0:1; L._k=L._vis; }
    else if((i+slice)%SL===0) L._vis=occluded(cam,p)?0:1;
    L._k+=(L._vis-L._k)*Math.min(1,(dt||.033)*10); return L._k; }
  function tick(){ slice=(slice+1)%SL; }

  scan(scene); let acc=0;
  W.HOOK.onFrame.push((dt)=>{ acc+=dt; if(acc>3){ acc=0; scan(W.renderPass && W.renderPass.scene || scene); } });
  return {scan, occluded, visibility, tick, MAXA};
}
