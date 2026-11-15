// RÀ MỌI ĐIỂM NHẢY (PLACES): bay tới từng điểm → kiểm tra chỗ đứng, camera có bị che không, dò NHẤP NHÁY (z-fighting) trong khung nhìn,
// và ghép ảnh nhỏ thành các trang (4×4 ô) để soát bằng mắt. Chạy trong game qua CDP: trả về {info:[…], imgs:[dataURL…]}.
// Nhấp nháy: vẽ 2 lần, lần sau camera tiến 2 mm – 2 mặt trùng nhau sẽ đổi hoa văn → điểm ảnh khác nhiều (tô đỏ trên ảnh ghép).
(async()=>{ const q=__qc, W=q.W, T=W.THREE, R=q.renderer, P=q.P, cam=q.camera;
  const unblock=()=>{ W.HOOK.blockInput=false; document.querySelectorAll('.modalWrap').forEach(m=>m.hidden=true); for(const id of ['panelWrap','helpWrap']){ const e=document.getElementById(id); if(e) e.hidden=true; } };
  unblock(); q.setTime && q.setTime(0);
  const PL=W.PLACES, TW=480, TH=270, COLS=4, PER=16, pages=[], info=[];
  const mk=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
  const a=mk(TW,TH), b=mk(TW,TH), ga=a.getContext('2d',{willReadFrequently:true}), gb=b.getContext('2d',{willReadFrequently:true});
  const rc=new T.Raycaster(), head=new T.Vector3(), dir=new T.Vector3(), fwd=new T.Vector3();
  const solid=[]; q.scene.traverse(m=>{ if(!m.isMesh||!m.visible||m.isSkinnedMesh||m.isInstancedMesh) return; const mt=m.material; if(!mt||mt.transparent||mt.isShaderMaterial||(m.userData&&m.userData.shadowProxy)) return; for(let p=m;p;p=p.parent) if(p===W.me.g||(p.userData&&p.userData.shadowProxy)) return; solid.push(m); });
  const allM=[]; q.scene.traverse(m=>{ if(!m.isMesh||!m.visible||m.isSkinnedMesh||m.isInstancedMesh||(m.userData&&m.userData.shadowProxy)) return; for(let p=m.parent;p;p=p.parent) if(p.visible===false||(p.userData&&p.userData.shadowProxy)) return; allM.push(m); });
  const ndc=new T.Vector2(), desc=m=>{ const mt=Array.isArray(m.material)?m.material[0]:m.material; return (mt.color?mt.color.getHexString():'-')+(mt.map?'+map':'')+(mt.transparent?'+tr':'')+(mt.emissiveMap?'+em':'')+' v'+m.geometry.attributes.position.count; };
  // thêm góc nhìn ngoài danh sách điểm nhảy (trong sân bóng, sân khấu, cửa toà Ngoại ngữ…)
  const EXTRA=[['+Sân bóng (trong sân, nhìn Bắc)',334,-30,334,-50],['+Sân bóng (nhìn Đông)',330,-33,360,-33],['+Sân bóng (nhìn Tây)',338,-33,308,-33],['+Sân bóng (nhìn Nam)',334,-36,334,-14],['+Concert sát sân khấu',355,40,355,52],
    ['+Ngoại ngữ – cửa chính',-262,-16,-275,-16],['+Ngoại ngữ – CLB Giao tiếp',-222,-50,-222,-62],['+Ngoại ngữ – đại lộ',-240,-16,-275,-30],['+Phố cổ – chợ đêm',196,-150,200,-160],['+Đầu cầu Thế giới mở',38,0,60,0]];
  for(const [n,x,z,lx,lz] of EXTRA) PL.push({name:n, extra:true, go:()=>q.teleport(x,z,lx,lz)});
  let page=null, pg=null;
  for(let i=0;i<PL.length;i++){ const pl=PL[i], rec={i, name:pl.name};
    try{ pl.go(); }catch(e){ rec.err=String(e).slice(0,80); }
    for(let k=0;k<24;k++){ unblock(); q.frame(1/30); }
    rec.pos=[+P.x.toFixed(1),+P.z.toFixed(1),+P.y.toFixed(2)]; rec.inside=!!W.inside;
    const gh=W.groundAt(P.x,P.z); if(Math.abs(P.y-gh)>.3) rec.offGround=+(P.y-gh).toFixed(2);
    // camera → đầu nhân vật có bị che không
    head.set(P.x,P.y+1.45,P.z); dir.subVectors(head,cam.position); const dist=dir.length(); dir.normalize(); rc.set(cam.position,dir); rc.far=Math.max(.1,dist-.35);
    const hit=W.inside?null:rc.intersectObjects(solid,false)[0]; if(hit) rec.blocked=+hit.distance.toFixed(1);
    // dò NHẤP NHÁY: vẽ 2 lần chỉ khác mặt cắt gần của camera (near .1 → .16) – hình học đứng yên tuyệt đối, chỉ độ chính xác chiều sâu đổi
    // → điểm ảnh nào khác nhau = 2 mặt gần trùng nhau tranh nhau (z-fighting). Sau đó bắn tia qua vài điểm để biết toạ độ + 2 vật thể.
    const sc=q.scene, n0=cam.near;
    R.render(sc,cam); ga.drawImage(R.domElement,0,0,TW,TH);
    cam.near=n0*1.6; cam.updateProjectionMatrix(); R.render(sc,cam); gb.drawImage(R.domElement,0,0,TW,TH); cam.near=n0; cam.updateProjectionMatrix();
    const A=ga.getImageData(0,0,TW,TH), B=gb.getImageData(0,0,TW,TH), fl=[]; for(let k=0;k<A.data.length;k+=4){ const d=Math.abs(A.data[k]-B.data[k])+Math.abs(A.data[k+1]-B.data[k+1])+Math.abs(A.data[k+2]-B.data[k+2]); if(d>36){ fl.push(k/4); A.data[k]=255; A.data[k+1]=0; A.data[k+2]=0; } }
    rec.flick=+(fl.length/(TW*TH)*100).toFixed(2); ga.putImageData(A,0,0);
    if(fl.length>25){ rec.fights=[]; const seen=new Set(); for(let s2=0;s2<8;s2++){ const k=fl[Math.floor((s2+.5)/8*fl.length)], px=k%TW, py=Math.floor(k/TW); ndc.set((px+.5)/TW*2-1, -((py+.5)/TH*2-1)); rc.setFromCamera(ndc,cam); rc.far=600;
        const hs=rc.intersectObjects(allM,false); for(let h=0;h<hs.length-1 && h<4;h++){ if(hs[h+1].distance-hs[h].distance<.03){ const pt=hs[h].point, key=Math.round(pt.x/3)+','+Math.round(pt.y/2)+','+Math.round(pt.z/3); if(!seen.has(key)){ seen.add(key); rec.fights.push({at:[+pt.x.toFixed(1),+pt.y.toFixed(2),+pt.z.toFixed(1)], gap:+(hs[h+1].distance-hs[h].distance).toFixed(4), a:desc(hs[h].object), b:desc(hs[h+1].object)}); } break; } } } }
    if(i%PER===0){ page=mk(COLS*TW,Math.ceil(Math.min(PER,PL.length-i)/COLS)*TH); pg=page.getContext('2d'); pages.push(page); }
    const c=(i%PER)%COLS, r=Math.floor((i%PER)/COLS); pg.drawImage(a,c*TW,r*TH);
    pg.fillStyle='rgba(0,0,0,.6)'; pg.fillRect(c*TW,r*TH,TW,20); pg.fillStyle=rec.blocked||rec.flick>.4?'#ff6a6a':'#fff'; pg.font='13px Segoe UI'; pg.fillText(`${i} ${pl.name.slice(0,34)}${rec.blocked?' ·CHE':''}${rec.flick>.4?' ·NHÁY '+rec.flick+'%':''}`, c*TW+4, r*TH+14);
    info.push(rec); }
  PL.splice(PL.length-EXTRA.length, EXTRA.length);
  return {info, imgs:pages.map(p=>p.toDataURL('image/jpeg',.8))}; })()
