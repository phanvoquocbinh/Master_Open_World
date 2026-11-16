// QC World – S5: KHU GIẢI TRÍ "QC FUN PARK" (phía Đông Downtown, nối bằng cầu ngắn theo trục z=0)
//  ⚽ Sân bóng QC Arena: khán đài 4 phía + mái che, ~700 cổ động viên (1 lượt vẽ, nhún nhảy bằng shader), 4 cột đèn pha,
//     bảng tỉ số, 2 đội bot 5 người đá thật (dẫn bóng, chuyền, sút, thủ môn bắt), vé 20 💰 mở cổng, ghế ngồi + góc máy truyền hình (B).
//  🎤 Sân khấu QC Live Arena: màn LED + đèn quét + laser theo nhịp, ca sĩ + DJ, ~350 khán giả nhảy, nhạc tự tạo bằng WebAudio (không cần mạng).
//     Vé 30 💰 vào khu sát sân khấu. Diễn 3 phút, nghỉ 1 phút.
//  🎬 Rạp QC Cinema: vào trong được, 5 hàng ghế bậc thang, màn chiếu phim hoạt hình ngắn "Cuộc săn Bug" (vẽ bằng canvas). Vé 15 💰. Quầy bỏng ngô.
//  🍜 Phố ẩm thực: 4 quầy (phở, cơm tấm, bánh mì, trà sữa) – ăn được buff (nhanh hơn / thưởng quiz cao hơn) trong vài phút.
//  🎡 Vòng quay QC Eye: cao 33 m, 12 cabin, đèn đổi màu ban đêm. Vé 15 💰, quay 1 vòng ngắm toàn thành phố.
import { compactGroup } from './perf.js';
export function makeArena(W, ctx){
  const {S, save, ui, askPay, fmt, spend, transit} = ctx;
  const {THREE, scene, MAT, colorMat, groundAt, P, me, cam, HOOK, INTER, PLACES, toast, clamp, lerp, lerpAngle, circles, boxes, CITY, makeLabel, mergeGeometries, resolve, addPlat, lampPost, palm, burst} = W;
  const AR=CITY.arena, R=Math.random, TAU=Math.PI*2, now=()=>Date.now();
  S.fun=S.fun||{}; S.fun.tickets=S.fun.tickets||{}; S.fun.goals=S.fun.goals||0;
  const hasTicket=k=>(S.fun.tickets[k]||0)>now();
  const giveTicket=(k,min)=>{ S.fun.tickets[k]=Math.max(now(), S.fun.tickets[k]||0)+min*60000; save(); };
  const near=(x,z,r)=>Math.hypot(P.x-x,P.z-z)<r;

  /* ============================== TIỆN ÍCH ============================== */
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function prep(geo, color){ const g=geo.index ? geo.toNonIndexed() : geo.clone();
    for(const k of Object.keys(g.attributes)) if(!['position','normal','uv'].includes(k)) g.deleteAttribute(k);
    if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    if(color!=null){ const c=new THREE.Color(color), n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b; } g.setAttribute('color', new THREE.Float32BufferAttribute(a,3)); }
    return g; }
  const SMC=new Map(), sm=(c,r=.6,m=.05)=>{ const k=c+'|'+r+'|'+m; if(!SMC.has(k)) SMC.set(k, new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m})); return SMC.get(k); };
  // gộp hình theo vật liệu; vật tĩnh dùng màu trơn (batchStatic gộp tiếp vào khối màu chung của ô)
  function Kit(){ const parts=new Map();
    return { add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0){ const g=prep(geo, mat.vertexColors?0xffffff:null); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); return this; },
      geos(){ const out=[]; for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(geo){ geo.computeBoundingSphere(); out.push([m,geo]); } } return out; },
      build(parent, cast=true){ const out=[]; for(const [m,geo] of this.geos()){ const ms=new THREE.Mesh(geo,m); ms.castShadow=cast && !m.transparent && !m.isMeshBasicMaterial; ms.receiveShadow=true; parent.add(ms); out.push(ms); } return out; } }; }
  function canvasTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'), w, h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; t.userData.canvas=c; return t; }
  const font=(c,px,wt=800)=>{ c.font=`${wt} ${px}px "Segoe UI","Segoe UI Emoji",sans-serif`; };
  const fit=(c,t,px,wt,max)=>{ let f=px; do{ font(c,f,wt); f-=2; } while(c.measureText(t).width>max && f>10); };
  const glow=(c)=>new THREE.MeshBasicMaterial({color:c, toneMapped:false});
  const addBox=(x0,x1,z0,z1)=>{ const b={x0,x1,z0,z1}; boxes.push(b); return b; };
  let night=-1; const nightFns=[]; HOOK.onFrame.push(()=>{ if(W.night===night) return; night=W.night; for(const f of nightFns) f(night); });

  /* ============================== 1. NỀN ĐẤT · CẦU · ĐẠI LỘ ============================== */
  const AX0=AR.x0, AX1=AR.x1, AZ0=AR.z0, AZ1=AR.z1, ACX=(AX0+AX1)/2, ACZ=(AZ0+AZ1)/2;
  { const pave=canvasTex(512,512,(g,w,h)=>{ g.fillStyle='#cfc9bd'; g.fillRect(0,0,w,h); for(let i=0;i<9000;i++){ const v=175+R()*45|0; g.fillStyle=`rgba(${v},${v-5},${v-14},.45)`; g.fillRect(R()*w,R()*h,2,2); }
      g.strokeStyle='rgba(110,102,92,.35)'; g.lineWidth=2; for(let k=0;k<=w;k+=64){ g.beginPath(); g.moveTo(k,0); g.lineTo(k,h); g.stroke(); g.beginPath(); g.moveTo(0,k); g.lineTo(w,k); g.stroke(); } });
    pave.wrapS=pave.wrapT=THREE.RepeatWrapping; pave.repeat.set((AX1-AX0)/8,(AZ1-AZ0)/8);
    const slab=new THREE.Mesh(new THREE.BoxGeometry(AX1-AX0+4, 8, AZ1-AZ0+4), [MAT.stone,MAT.stone,new THREE.MeshStandardMaterial({map:pave, roughness:.85}),MAT.stone,MAT.stone,MAT.stone]);
    slab.position.set(ACX,-4+.02,ACZ); slab.receiveShadow=true; slab.castShadow=false; scene.add(slab);
    // lan can mép (chừa lối cầu ở bờ Tây)
    const rail=(x0,z0,x1,z1)=>{ const len=Math.hypot(x1-x0,z1-z0); if(len<.5) return; const r=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,len), MAT.metal); r.position.set((x0+x1)/2,1.0,(z0+z1)/2); r.rotation.y=Math.atan2(x1-x0,z1-z0); scene.add(r);
      for(let t=0;t<=len;t+=4){ const p=new THREE.Mesh(new THREE.BoxGeometry(.06,1,.06), MAT.metal); p.position.set(x0+(x1-x0)*t/len,.5,z0+(z1-z0)*t/len); scene.add(p); } };
    rail(AX0-1,AZ0-1,AX1+1,AZ0-1); rail(AX1+1,AZ0-1,AX1+1,AZ1+1); rail(AX1+1,AZ1+1,AX0-1,AZ1+1); rail(AX0-1,AZ1+1,AX0-1,6); rail(AX0-1,-6,AX0-1,AZ0-1);
    // cầu ngắn Downtown → Khu Giải trí
    const D=CITY.downtown, bx0=D.x1, bx1=AX0, bl=bx1-bx0, bm=(bx0+bx1)/2;
    const k=Kit(); k.add(new THREE.BoxGeometry(bl+.4,.4,10), sm(0x9aa1a8,.8), bm,-.05,0); k.add(new THREE.BoxGeometry(bl+.4,.02,7), sm(0x2f3237,.9), bm,.16,0);
    for(const s of [-1,1]){ k.add(new THREE.BoxGeometry(bl,.08,.08), sm(0xc8ced6,.3,.8), bm,1.05,s*4.9); for(let x=bx0;x<=bx1;x+=2) k.add(new THREE.BoxGeometry(.06,1,.06), sm(0xc8ced6,.3,.8), x,.55,s*4.9); }
    const bg=new THREE.Group(); scene.add(bg); k.build(bg);
    addPlat(bm,0,0,bl/2+.6,5,.15); addBox(bx0,bx1,4.85,5.2); addBox(bx0,bx1,-5.2,-4.85);
    // cắt lan can bờ Đông Downtown chỗ cầu
    for(const o of scene.children.slice()){ if(!o.isMesh || !o.geometry || !o.geometry.parameters) continue; const pr=o.geometry.parameters;
      if(Math.abs(o.position.x-(D.x1+1))<.3 && pr.width<.12 && pr.depth>40 && Math.abs(o.rotation.y)<1e-3){ const z0=o.position.z-pr.depth/2, z1=o.position.z+pr.depth/2; scene.remove(o);
        for(const [a,b] of [[z0,-5.5],[5.5,z1]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(pr.width,pr.height,b-a), o.material); m.position.set(o.position.x,o.position.y,(a+b)/2); scene.add(m); } } }
    // đại lộ z=0 xuyên khu
    const asph=canvasTex(512,128,(g,w,h)=>{ g.fillStyle='#303236'; g.fillRect(0,0,w,h); for(let i=0;i<4000;i++){ const v=30+R()*38|0; g.fillStyle=`rgba(${v},${v},${v+4},.6)`; g.fillRect(R()*w,R()*h,1.5,1.5); }
      g.fillStyle='#e9e6dc'; g.fillRect(0,8,w,4); g.fillRect(0,h-12,w,4); g.fillStyle='#e8b923'; for(let x=0;x<w;x+=64) g.fillRect(x,h/2-3,36,6); });
    asph.wrapS=THREE.RepeatWrapping; asph.repeat.set((AX1-AX0)/20,1);
    const road=new THREE.Mesh(new THREE.PlaneGeometry(AX1-AX0,10), new THREE.MeshStandardMaterial({map:asph, roughness:.9})); road.rotation.x=-Math.PI/2; road.position.set(ACX,.035,0); road.receiveShadow=true; scene.add(road);
    for(let x=AX0+8;x<AX1-4;x+=16){ lampPost(x,-6.2); lampPost(x+8,6.2); }
    for(let x=AX0+4;x<AX0+30;x+=7){ palm(x,-9,1+R()*.25); palm(x+3,9,1+R()*.25); }
    // cổng chào
    const gate=new THREE.Group(); gate.position.set(AX0+4,0,0); scene.add(gate);
    const gk=Kit(); for(const s of [-1,1]){ gk.add(new THREE.CylinderGeometry(.5,.6,9,16), sm(0xf3f0ea,.4), 0,4.5,s*7.2); gk.add(new THREE.SphereGeometry(.8,16,12), sm(0xffc44d,.3,.3), 0,9.3,s*7.2); circles.push({x:AX0+4, z:s*7.2, r:.6}); }
    gk.add(new THREE.BoxGeometry(1,1.8,15.4), sm(0xf3f0ea,.4), 0,8.2,0); gk.build(gate);
    const sign=canvasTex(1024,128,(c,w,h)=>{ const g=c.createLinearGradient(0,0,w,0); g.addColorStop(0,'#ff4f8b'); g.addColorStop(.5,'#ffb21f'); g.addColorStop(1,'#12a594'); c.fillStyle=g; c.fillRect(0,0,w,h);
      c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle'; fit(c,'🎡 QC FUN PARK · KHU GIẢI TRÍ',70,900,w-40); c.fillText('🎡 QC FUN PARK · KHU GIẢI TRÍ',w/2,h/2+3); });
    const sgm=new THREE.MeshStandardMaterial({map:sign, emissive:0xffffff, emissiveMap:sign, emissiveIntensity:.4});
    for(const s of [-1,1]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(15,1.6), sgm); p.position.set(s*.52,8.2,0); p.rotation.y=s*Math.PI/2; gate.add(p); }
    nightFns.push(n=>{ sgm.emissiveIntensity=.4+n*1.4; });
  }

  /* ============================== 2. ⚽ SÂN BÓNG QC ARENA ============================== */
  const SC={x:334, z:-33}, PL=44, PW=28, GW=5.2;
  const SB={x0:SC.x-PL/2-12, x1:SC.x+PL/2+12, z0:SC.z-PW/2-12, z1:SC.z+PW/2+9};   // tường ngoài
  const stad=new THREE.Group(); scene.add(stad);
  const pitchTex=canvasTex(1024,652,(c,w,h)=>{ for(let i=0;i<12;i++){ c.fillStyle=i%2?'#3f9a3a':'#47a842'; c.fillRect(i*w/12,0,w/12+1,h); }
    c.strokeStyle='rgba(255,255,255,.92)'; c.lineWidth=5; const m=18; c.strokeRect(m,m,w-2*m,h-2*m); c.beginPath(); c.moveTo(w/2,m); c.lineTo(w/2,h-m); c.stroke();
    c.beginPath(); c.arc(w/2,h/2,70,0,TAU); c.stroke(); c.fillStyle='#fff'; c.beginPath(); c.arc(w/2,h/2,6,0,TAU); c.fill();
    for(const s of [0,1]){ const x0=s?w-m-150:m; c.strokeRect(x0,h/2-170,150,340); const x1=s?w-m-60:m; c.strokeRect(x1,h/2-90,60,180); c.beginPath(); c.arc(s?w-m-110:m+110,h/2,6,0,TAU); c.fill(); } });
  const pitchMat=new THREE.MeshStandardMaterial({map:pitchTex, roughness:.95, emissive:0xffffff, emissiveMap:pitchTex, emissiveIntensity:0});
  { const p=new THREE.Mesh(new THREE.PlaneGeometry(PL,PW), pitchMat); p.rotation.x=-Math.PI/2; p.position.set(SC.x,.05,SC.z); p.receiveShadow=true; stad.add(p);
    const k=Kit(); k.add(new THREE.BoxGeometry(PL+12,.04,PW+10), sm(0x2f6e35,.95), SC.x,.015,SC.z);   // S-QA: hạ nền cỏ 1,5 cm – trước mặt trên trùng đúng mặt sân (y=.05) → nhấp nháy cả sân
    // khung thành
    for(const s of [-1,1]){ const gx=SC.x+s*PL/2; for(const z of [-GW/2,GW/2]) k.add(new THREE.CylinderGeometry(.07,.07,2.0,10), sm(0xffffff,.3), gx,1.0,SC.z+z);
      k.add(new THREE.CylinderGeometry(.07,.07,GW,10), sm(0xffffff,.3), gx,2.0,SC.z, Math.PI/2,0,0); k.add(new THREE.BoxGeometry(.05,.05,GW), sm(0xdddddd,.5), gx+s*1.6,.03,SC.z);
      for(const z of [-GW/2,GW/2]) k.add(new THREE.BoxGeometry(1.6,.05,.05), sm(0xdddddd,.5), gx+s*.8,.03,SC.z+z); }
    // khán đài: 7 bậc mỗi phía (Bắc dài + 2 đầu), phía Nam 3 bậc + cổng
    const tierCol=[0x12a594,0xf3f6f8,0xff5a6e,0xf3f6f8,0x12a594,0xffc44d,0x12a594];
    const stand=(axis, side, len, start, rows, off=0)=>{ for(let i=0;i<rows;i++){ const h=.45*(i+1), d=start+i*.85+.425;
        if(axis==='z'){ const z=SC.z+side*d; k.add(new THREE.BoxGeometry(len,h,.85), sm(0x8d949b,.9), SC.x+off,h/2,z); k.add(new THREE.BoxGeometry(len,.06,.42), sm(tierCol[i%7],.5), SC.x+off,h+.03,z+side*.15); addPlat(SC.x+off,z,0,len/2,.43,h); }
        else { const x=SC.x+side*d; k.add(new THREE.BoxGeometry(.85,h,len), sm(0x8d949b,.9), x,h/2,SC.z); k.add(new THREE.BoxGeometry(.42,.06,len), sm(tierCol[i%7],.5), x+side*.15,h+.03,SC.z); addPlat(x,SC.z,0,.43,len/2,h); } }
      // S-GFX (15/11): sàn đứng từng bậc (cao .45 m/bậc → leo được từ phía sân) – trước khán đài chỉ là khối hình, đi xuyên qua.
      // Lưng + 2 đầu khán đài chặn người đứng thấp hơn mặt bậc (không chui vào khối bậc từ phía sau / bên hông)
      const d0=start, d1=start+rows*.85, top=.45*rows-.35;
      if(axis==='z'){ const xa=SC.x+off-len/2, xb=SC.x+off+len/2, za=SC.z+side*d0, zb=SC.z+side*d1;
        boxes.push({x0:xa, x1:xb, z0:Math.min(zb,zb+side*.12), z1:Math.max(zb,zb+side*.12), y0:-1, y1:top+1.6});
        for(const xe of [xa,xb]) boxes.push({x0:xe-.06, x1:xe+.06, z0:Math.min(za,zb), z1:Math.max(za,zb), y0:.2, y1:top}); }
      else { const za=SC.z-len/2, zb=SC.z+len/2, xa=SC.x+side*d0, xb=SC.x+side*d1;
        boxes.push({x0:Math.min(xb,xb+side*.12), x1:Math.max(xb,xb+side*.12), z0:za, z1:zb, y0:-1, y1:top+1.6});
        for(const ze of [za,zb]) boxes.push({x0:Math.min(xa,xb), x1:Math.max(xa,xb), z0:ze-.06, z1:ze+.06, y0:.2, y1:top}); } };
    stand('z',-1,PL+10,PW/2+4,7); stand('x',-1,PW+6,PL/2+4,7); stand('x',1,PW+6,PL/2+4,7);
    { const half=(PL+10)/2-4; stand('z',1,half,PW/2+4,3,-(4+half/2)); stand('z',1,half,PW/2+4,3,4+half/2); }   // phía Nam: 2 nửa, giữa là lối vào từ cổng
    // mái che khán đài Bắc
    const rz=SC.z-(PW/2+4+7*.85/2);
    k.add(new THREE.BoxGeometry(PL+14,.25,9), sm(0xf5f7fa,.4), SC.x,10.6,rz-1, -.12,0,0);
    for(let x=-PL/2-6;x<=PL/2+6;x+=9.2) k.add(new THREE.CylinderGeometry(.18,.22,10.4,10), sm(0xd8dde3,.35,.6), SC.x+x,5.2,rz-5);
    // tường ngoài + cổng Nam
    const wallM=sm(0x1d6fd8,.5), wh=3.2;
    k.add(new THREE.BoxGeometry(SB.x1-SB.x0,wh,.4), wallM, (SB.x0+SB.x1)/2,wh/2,SB.z0);
    k.add(new THREE.BoxGeometry(.4,wh,SB.z1-SB.z0), wallM, SB.x0,wh/2,(SB.z0+SB.z1)/2); k.add(new THREE.BoxGeometry(.4,wh,SB.z1-SB.z0), wallM, SB.x1,wh/2,(SB.z0+SB.z1)/2);
    const gL=SC.x-2.6, gR=SC.x+2.6;
    k.add(new THREE.BoxGeometry(gL-SB.x0,wh,.4), wallM, (SB.x0+gL)/2,wh/2,SB.z1); k.add(new THREE.BoxGeometry(SB.x1-gR,wh,.4), wallM, (gR+SB.x1)/2,wh/2,SB.z1);
    k.add(new THREE.BoxGeometry(6.4,1.2,.6), sm(0xffc44d,.4), SC.x,wh+1.2,SB.z1); for(const s of [-1,1]) k.add(new THREE.BoxGeometry(.6,wh+1.8,.6), sm(0xffc44d,.4), SC.x+s*2.84,(wh+1.8)/2,SB.z1);   // S-QA: trụ ôm kín đầu tường (trước 2 mặt trùng nhau → nhấp nháy)
    // cột đèn pha 4 góc
    for(const sx of [-1,1]) for(const sz of [-1,1]){ const x=SC.x+sx*(PL/2+9), z=SC.z+sz*(PW/2+8.5); k.add(new THREE.CylinderGeometry(.28,.4,22,10), sm(0xb8c0c8,.35,.7), x,11,z); circles.push({x,z,r:.5}); }
    k.build(stad);
    addBox(SB.x0,SB.x1,SB.z0-.2,SB.z0+.2); addBox(SB.x0-.2,SB.x0+.2,SB.z0,SB.z1); addBox(SB.x1-.2,SB.x1+.2,SB.z0,SB.z1); addBox(SB.x0,gL,SB.z1-.2,SB.z1+.2); addBox(gR,SB.x1,SB.z1-.2,SB.z1+.2);
  }
  const gateBox={x0:SC.x-2.6, x1:SC.x+2.6, z0:SB.z1-.25, z1:SB.z1+.25, msg:'🎟️ Cổng sân bóng cần vé (20 💰) – bấm E ở quầy vé ngay trước cổng.'}; boxes.push(gateBox);
  // đầu đèn pha (phát sáng ban đêm → bloom)
  const floodM=glow(0xfffbe8); floodM.color.setScalar(.25);
  { const k=Kit(); for(const sx of [-1,1]) for(const sz of [-1,1]){ const x=SC.x+sx*(PL/2+9), z=SC.z+sz*(PW/2+8.5); k.add(new THREE.BoxGeometry(3.4,1.6,.4), floodM, x,22.2,z, -.5*sz,-sx*sz*.6,0); }
    const g=new THREE.Group(); g.userData.dynamic=true; scene.add(g); k.build(g, false); }
  nightFns.push(n=>{ floodM.color.setScalar(.25+n*1.6); pitchMat.emissiveIntensity=n*.22; });
  if(W.GLOW){ for(const sx of [-1,1]) for(const sz of [-1,1]) W.GLOW.add(SC.x+sx*(PL/2+9), 22.2, SC.z+sz*(PW/2+8.5), 11, 0xfff4dc, 1);   // quầng đèn pha
    for(let i=0;i<8;i++) W.GLOW.add(388-3.6, 12, 33-10.5+i*3, 2.4, [0xff3df0,0x39ff88,0x4fc3ff,0xffd23f][i%4], 1); }   // đèn giàn sân khấu
  // bảng tỉ số (vẽ lại khi đổi điểm / phút)
  const board=canvasTex(512,256,()=>{}); board.userData.live=true;
  { const g=new THREE.Group(); g.position.set(SC.x+PL/2+9.5,0,SC.z); g.userData.dynamic=true; scene.add(g);
    const fr=new THREE.Mesh(new THREE.BoxGeometry(.6,5.4,9.4), sm(0x1d2329,.6)); fr.position.y=11.5; g.add(fr);
    const sc=new THREE.Mesh(new THREE.PlaneGeometry(8.8,4.4), new THREE.MeshBasicMaterial({map:board, toneMapped:false})); sc.position.set(-.31,11.5,0); sc.rotation.y=-Math.PI/2; g.add(sc);
    for(const s of [-1,1]){ const leg=new THREE.Mesh(new THREE.BoxGeometry(.4,9,.4), sm(0x8d949b,.5,.5)); leg.position.set(0,4.5,s*3.5); g.add(leg); } }
  // cổ động viên: 1 InstancedMesh, nhún theo shader (đội ghi bàn → cả sân nhảy)
  function crowd(spots, colors){
    const k=Kit(); k.add(new THREE.CylinderGeometry(.19,.22,.62,7), sm(0xffffff), 0,.31,0); k.add(new THREE.SphereGeometry(.15,8,6), sm(0xffffff), 0,.78,0); const geo=k.geos().map(([m,g])=>g); const g=mergeGeometries(geo,false);
    const mat=new THREE.MeshStandardMaterial({roughness:.8}); const U={uT:{value:0}, uCheer:{value:0}, uBeat:{value:0}};
    mat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U); sh.vertexShader=sh.vertexShader.replace('#include <common>', `#include <common>
uniform float uT; uniform float uCheer; uniform float uBeat;`).replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef USE_INSTANCING
float ph = instanceMatrix[3].x*1.73 + instanceMatrix[3].z*2.31;
transformed.y += abs(sin(uT*2.2 + ph))*0.05 + uCheer*abs(sin(uT*9.0 + ph))*0.42 + uBeat*abs(sin(uT*7.8 + ph*0.3))*0.3;
#endif`); };
    mat.customProgramCacheKey=()=>'crowdBob';
    const im=new THREE.InstancedMesh(g, mat, spots.length); const c=new THREE.Color();
    spots.forEach((s,i)=>{ _m.makeRotationY(s.r||0); _m.setPosition(s.x,s.y,s.z); im.setMatrixAt(i,_m); im.setColorAt(i, c.set(colors[(R()*colors.length)|0]).offsetHSL(0,0,(R()-.5)*.12)); });
    im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; im.castShadow=false; im.receiveShadow=false; im.userData.dynamic=true; scene.add(im); im.computeBoundingSphere && im.computeBoundingSphere();
    return {im, U}; }
  const fanSpots=[];
  { const add=(x,y,z,r)=>{ if(R()<.82) fanSpots.push({x:x+(R()-.5)*.15, y, z:z+(R()-.5)*.1, r}); };
    for(let i=0;i<7;i++){ const y=.45*(i+1)+.06, d=PW/2+4+i*.85+.6;
      for(let x=-PL/2-4.5;x<=PL/2+4.5;x+=.72) add(SC.x+x, y, SC.z-d, 0);
      for(const s of [-1,1]) for(let z=-PW/2-2.5;z<=PW/2+2.5;z+=.72) add(SC.x+s*(PL/2+4+i*.85+.6), y, SC.z+z, s>0?-Math.PI/2:Math.PI/2); }
    for(let i=0;i<3;i++){ const y=.45*(i+1)+.06, d=PW/2+4+i*.85+.6; for(let x=-PL/2-4.5;x<=PL/2+4.5;x+=.72){ if(Math.abs(x)<5) continue; add(SC.x+x, y, SC.z+d, Math.PI); } } }
  const fans=crowd(fanSpots, [0x12a594,0x12a594,0xf3f6f8,0xff5a6e,0xff5a6e,0xffc44d,0x2f6fd0,0x222831]);

  // cầu thủ + bóng
  const kitA={shirt:0x12a594, pants:0xffffff, shorts:true, long:false}, kitB={shirt:0xff5a6e, pants:0x1f2a44, shorts:true, long:false}, kitGK={shirt:0xffd23f, pants:0x222222, shorts:true, long:false};
  const players=[];
  const FORM=[[-19,0,'gk'],[-12,-6,'df'],[-12,6,'df'],[-5,-4,'fw'],[-5,4,'fw']];
  function mkPlayer(team, i){ if(!W.people) return null; const [hx,hz,role]=FORM[i], side=team===0?-1:1, seed=(team*97+i*31+7)>>>0;
    const k=W.people.kit(seed+300,{outfit: role==='gk' ? (team? {...kitGK, shirt:0x7aa2ff} : kitGK) : team? kitB : kitA}); if(!k) return null;
    const a=W.makeActor(k.gl,{name:`${team?'Bug United':'QC FC'} · ${role==='gk'?'Thủ môn':'Số '+(i+5)}`, height:k.h, face:0, clips:k.clips, compact:false, dot:team?'#ff5a6e':'#12a594'});
    const p={a, team, role, home:{x:SC.x+(team===0? hx : -hx), z:SC.z+(team===0? hz : -hz)}, x:0, z:0, vx:0, vz:0, h:0}; p.x=p.home.x; p.z=p.home.z; a.g.position.set(p.x,.02,p.z); a.play('idle',0); players.push(p); return p; }   // S19g rà soát 16/11: đứng đúng chỗ ngay từ đầu (trước chồng ở gốc 0,0 = cổng xuất hiện)
  for(let t=0;t<2;t++) for(let i=0;i<5;i++) mkPlayer(t,i);
  const ref=(()=>{ if(!W.people) return null; const k=W.people.kit(9911,{outfit:{shirt:0x111111, pants:0x111111, shorts:true}}); const a=W.makeActor(k.gl,{name:'Trọng tài', height:k.h, face:0, clips:k.clips, compact:false, dot:'#ffd23f'}); a.g.position.set(SC.x,.02,SC.z+6); a.play('idle',0); return {a, x:SC.x, z:SC.z+6}; })();
  const ballTex=canvasTex(128,64,(c,w,h)=>{ c.fillStyle='#fafafa'; c.fillRect(0,0,w,h); c.fillStyle='#111'; for(let i=0;i<10;i++){ c.beginPath(); c.arc((i%5)*w/5+(i>4?w/10:0)+8, i>4?h*.72:h*.28, 7, 0, TAU); c.fill(); } });
  const ballM=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12), new THREE.MeshStandardMaterial({map:ballTex, roughness:.45})); ballM.castShadow=true; ballM.userData.dynamic=true; scene.add(ballM);
  const ball={x:SC.x, z:SC.z, y:.22, vx:0, vz:0, vy:0, owner:null, cd:0};
  const M={t:0, half:1, score:[0,0], state:'kick', pause:2, last:-1, ended:0};   // t: phút trận (0..90)
  function drawBoard(){ const c=board.userData.canvas, g=c.getContext('2d'), w=c.width, h=c.height; g.fillStyle='#05070a'; g.fillRect(0,0,w,h);
    g.fillStyle='#12a594'; g.fillRect(0,0,w/2,40); g.fillStyle='#ff5a6e'; g.fillRect(w/2,0,w/2,40); g.fillStyle='#fff'; g.textAlign='center'; g.textBaseline='middle'; font(g,26,900); g.fillText('QC FC',w/4,21); g.fillText('BUG UNITED',w*3/4,21);
    font(g,120,900); g.fillStyle='#ffd23f'; g.fillText(`${M.score[0]} - ${M.score[1]}`,w/2,130); font(g,34,800); g.fillStyle='#9fe6da';
    g.fillText(M.state==='end' ? 'HẾT GIỜ' : M.state==='half' ? 'NGHỈ GIỮA HIỆP' : `⏱ ${Math.min(90,Math.floor(M.t))}'`, w/2, 220); board.needsUpdate=true; }
  drawBoard();
  function kickoff(teamToKick){ ball.x=SC.x; ball.z=SC.z; ball.y=.22; ball.vx=ball.vz=ball.vy=0; ball.owner=null; ball.cd=.5;
    for(const p of players){ p.x=p.home.x; p.z=p.home.z; p.vx=p.vz=0; } const k=players.find(p=>p.team===teamToKick && p.role==='fw'); if(k){ k.x=SC.x+(teamToKick===0?-.6:.6); k.z=SC.z; } M.state='play'; }
  let cheer=0, watchT=0;
  function goal(team){ M.score[team]++; M.state='goal'; M.pause=4; cheer=3.2; drawBoard();
    burst(new THREE.Vector3(SC.x, 18, SC.z), team?[0xff5a6e,0xffffff]:[0x12a594,0xffd23f], 160, 9, 2.2, -4, .35);
    if(near(SC.x,SC.z,70)) toast(`⚽ VÀOOO! ${team?'Bug United':'QC FC'} ghi bàn – ${M.score[0]}-${M.score[1]}`, 2600); }
  const goalX=t=>SC.x+(t===0?PL/2:-PL/2);   // khung thành đối phương của đội t
  function updMatch(dt, full){
    if(M.state==='goal'||M.state==='half'||M.state==='end'){ M.pause-=dt; if(M.pause<=0){ if(M.state==='end'){ M.t=0; M.half=1; M.score=[0,0]; } if(M.state==='half') M.half=2; kickoff(M.state==='goal' ? (M.score[0]+M.score[1])%2 : R()<.5?0:1); drawBoard(); } }
    if(M.state==='kick'){ M.pause-=dt; if(M.pause<=0) kickoff(0); }
    if(M.state==='play'){ const pt=M.t; M.t+=dt/3.6; if(Math.floor(M.t)!==Math.floor(pt)) drawBoard();
      if(M.half===1 && M.t>=45){ M.t=45; M.state='half'; M.pause=8; drawBoard(); } else if(M.t>=90){ M.t=90; M.state='end'; M.pause=14; drawBoard(); if(near(SC.x,SC.z,80)) toast(`🏁 Hết trận: QC FC ${M.score[0]} - ${M.score[1]} Bug United`, 3500); } }
    const playing=M.state==='play';
    // bóng
    ball.cd=Math.max(0,ball.cd-dt);
    if(ball.owner){ const o=ball.owner, f=Math.hypot(o.vx,o.vz)>.2 ? [o.vx/Math.hypot(o.vx,o.vz), o.vz/Math.hypot(o.vx,o.vz)] : [Math.sin(o.h),Math.cos(o.h)]; ball.x=o.x+f[0]*.55; ball.z=o.z+f[1]*.55; ball.y=.22; ball.vx=o.vx; ball.vz=o.vz; }
    else { ball.x+=ball.vx*dt; ball.z+=ball.vz*dt; ball.vy-=14*dt; ball.y+=ball.vy*dt; if(ball.y<.22){ ball.y=.22; ball.vy=Math.abs(ball.vy)>1.5?-ball.vy*.45:0; } const f=Math.exp(-dt*(ball.y>.3?.25:1.1)); ball.vx*=f; ball.vz*=f;
      if(playing){ const dx=ball.x-SC.x, dz=ball.z-SC.z;
        if(Math.abs(dx)>PL/2){ const team = dx>0 ? 0 : 1; if(Math.abs(dz)<GW/2 && ball.y<2) goal(team); else { const gk=players.find(p=>p.role==='gk' && (dx>0?p.team===1:p.team===0)); ball.x=SC.x+Math.sign(dx)*(PL/2-1.5); ball.z=SC.z; ball.vx=ball.vz=0; if(gk){ ball.owner=gk; ball.cd=.8; } } }
        else if(Math.abs(dz)>PW/2){ ball.z=SC.z+Math.sign(dz)*(PW/2-.4); ball.vx*=.2; ball.vz=0; } } }
    // cầu thủ
    let chaser=[null,null], cd=[1e9,1e9];
    for(const p of players){ if(p.role==='gk') continue; const d=Math.hypot(p.x-ball.x,p.z-ball.z); if(d<cd[p.team]){ cd[p.team]=d; chaser[p.team]=p; } }
    for(const p of players){
      let tx=p.home.x+(ball.x-SC.x)*.45, tz=p.home.z+(ball.z-SC.z)*.4, sp=3.2;
      if(!playing){ tx=p.home.x; tz=p.home.z; sp=2.2; }
      else if(p.role==='gk'){ const gx=SC.x+(p.team===0?-PL/2+.9:PL/2-.9); tx=gx; tz=SC.z+clamp((ball.z-SC.z)*.55,-GW/2+.4,GW/2-.4); sp=4;
        const toward=(p.team===0? ball.vx<-2 : ball.vx>2), d=Math.hypot(ball.x-gx,ball.z-tz);
        if(!ball.owner && toward && d<2.6 && ball.cd<=0){ if(R()<.5){ ball.vx=-ball.vx*.45; ball.vz=(R()-.5)*8; ball.vy=3; ball.cd=.6; if(near(SC.x,SC.z,70) && R()<.4) toast('🧤 Thủ môn cản phá xuất sắc!', 1600); } else ball.cd=.3; } }
      else if(ball.owner===p){ const gx=goalX(p.team), dg=Math.hypot(gx-p.x, SC.z-p.z); tx=gx; tz=SC.z+(p.z>SC.z?-1:1)*1.5; sp=4.4;
        const opp=players.find(o=>o.team!==p.team && Math.hypot(o.x-p.x,o.z-p.z)<2.4);
        if(dg<15 && R()<dt*1.8){ const aim=SC.z+(R()-.5)*(GW*1.15), dx=gx-p.x, dz=aim-p.z, L=Math.hypot(dx,dz)||1, v=15+R()*5; ball.owner=null; ball.vx=dx/L*v; ball.vz=dz/L*v; ball.vy=1.5+R()*3; ball.cd=.5; }
        else if(opp && R()<dt*2.2){ const mates=players.filter(m=>m.team===p.team && m!==p && m.role!=='gk'); const m=mates[(R()*mates.length)|0]; if(m){ const dx=m.x-p.x, dz=m.z-p.z, L=Math.hypot(dx,dz)||1, v=Math.min(13, 5+L*.9); ball.owner=null; ball.vx=dx/L*v; ball.vz=dz/L*v; ball.vy=.8; ball.cd=.35; } } }
      else if(chaser[p.team]===p){ tx=ball.x; tz=ball.z; sp=4.8;
        if(ball.owner && ball.owner.team!==p.team && Math.hypot(p.x-ball.x,p.z-ball.z)<.8 && R()<dt*1.6){ ball.owner=p; ball.cd=.4; } }
      if(playing && !ball.owner && ball.cd<=0 && Math.hypot(p.x-ball.x,p.z-ball.z)<.6 && ball.y<1){ ball.owner=p; }
      const dx=tx-p.x, dz=tz-p.z, d=Math.hypot(dx,dz), want = d>.25 ? Math.min(sp, d*2.2) : 0, k=1-Math.exp(-dt*5);
      p.vx=lerp(p.vx, d>1e-3?dx/d*want:0, k); p.vz=lerp(p.vz, d>1e-3?dz/d*want:0, k);
      for(const o of players){ if(o===p) continue; const ox=p.x-o.x, oz=p.z-o.z, od=Math.hypot(ox,oz); if(od<.7 && od>1e-3){ p.x+=ox/od*(.7-od)*.5; p.z+=oz/od*(.7-od)*.5; } }
      p.x+=p.vx*dt; p.z+=p.vz*dt; const s=Math.hypot(p.vx,p.vz); if(s>.3) p.h=lerpAngle(p.h, Math.atan2(p.vx,p.vz), 1-Math.exp(-dt*10));
      if(p.role==='gk' && ball.owner===p && playing){ p.vx=p.vz=0; if(R()<dt*1.2){ const m=players.filter(x=>x.team===p.team && x.role!=='gk'); const t=m[(R()*m.length)|0]; const ddx=t.x-p.x, ddz=t.z-p.z, L=Math.hypot(ddx,ddz)||1; ball.owner=null; ball.vx=ddx/L*14; ball.vz=ddz/L*14; ball.vy=5; ball.cd=.4; } }
      if(full){ p.a.g.position.set(p.x,.02,p.z); p.a.g.rotation.y=p.h; const anim=s>3?'run':s>.4?'walk':'idle'; p.a.play(anim,.2); if(p.a.acts[anim] && anim!=='idle') p.a.acts[anim].timeScale=clamp(s/(anim==='run'?4.5:1.5),.6,1.6); if(p.a.root.visible) p.a.mixer.update(dt); } }
    if(ref && full){ const tx=clamp(ball.x,SC.x-PL/2+4,SC.x+PL/2-4), tz=SC.z+PW/2-3; const dx=tx-ref.x; ref.x+=clamp(dx,-3*dt,3*dt); ref.a.g.position.set(ref.x,.02,tz); ref.a.g.rotation.y=Math.atan2(ball.x-ref.x, ball.z-tz); ref.a.play(Math.abs(dx)>.3?'walk':'idle',.3); if(ref.a.root.visible) ref.a.mixer.update(dt); }
    ballM.position.set(ball.x, ball.y, ball.z); ballM.rotation.x+=ball.vz*dt*4.5; ballM.rotation.z-=ball.vx*dt*4.5;
  }
  // vé + cổng + ghế + góc máy truyền hình
  INTER.push({x:SC.x, z:SB.z1+2.2, r:3.2, prio:.6, get label(){ return hasTicket('stadium') ? `⚽ Cổng QC Arena – vé còn ${Math.ceil((S.fun.tickets.stadium-now())/60000)} phút (vào sân · ngồi khán đài)` : '🎟️ Mua vé xem bóng đá (E) – 20 💰 / 30 phút'; },
    action:()=>{ if(hasTicket('stadium')) return toast('Đi qua cổng vào sân, lại gần hàng ghế đầu khán đài Nam bấm C để ngồi – bấm B để xem góc máy truyền hình.', 4200);
      askPay(20, '🎟️ Vé xem bóng đá <b>QC FC vs Bug United</b> (30 phút, ra vào tự do)', ()=>{ if(!spend(20)) return; giveTicket('stadium',30); toast('🎟️ Đã có vé! Cổng mở – vào ngồi khán đài Nam (C), bấm B để xem góc máy truyền hình.', 4500); }); }});
  const standSeats=[]; for(let i=0;i<14;i++){ const side=i<7?-1:1, x=SC.x+side*(6+(i%7)*1.1), z=SC.z+PW/2+4+.42; standSeats.push(W.addSeat({x, z, rot:Math.PI, y:.45+.06, floor:.02, label:'🪑 Ngồi xem bóng (E · C) – B: góc máy truyền hình', tag:'stadium', onSit:()=>toast('⚽ Bấm B để bật góc máy truyền hình bám theo trái bóng.', 3200)})); }
  let tvCam=false; const _tvPos=new THREE.Vector3(), _tvLook=new THREE.Vector3();
  const inStadSeat=()=>standSeats.some(s=>s.taken==='me');
  HOOK.keys.KeyB=()=>{ if(!inStadSeat()) return toast('📺 Góc máy truyền hình chỉ dùng khi đang ngồi khán đài QC Arena.', 2400); tvCam=!tvCam; if(!tvCam) HOOK.camOverride=null; toast(tvCam?'📺 Góc máy truyền hình: BẬT (B để tắt)':'📺 Góc máy truyền hình: TẮT', 1800); };

  /* ============================== 3. 🎤 QC LIVE ARENA (concert) ============================== */
  const CS={x:388, z:33};   // giữa sân khấu, mặt quay về phía Tây (−x)
  const PIT={x0:359, x1:383, z0:15, z1:53};
  const ledTex=canvasTex(1024,384,()=>{}); ledTex.userData.live=true;
  const sideTex=canvasTex(256,320,()=>{}); sideTex.userData.live=true;
  const beams=[], lasers=[];
  { const k=Kit();
    k.add(new THREE.BoxGeometry(9,1.4,24), sm(0x16181c,.7), CS.x,.7,CS.z); k.add(new THREE.BoxGeometry(.2,.1,24), sm(0xffc44d,.4,.4), CS.x-4.55,1.42,CS.z);
    for(const z of [-12,12]) for(const x of [-4,4]) k.add(new THREE.BoxGeometry(.5,11,.5), sm(0x2a2e34,.5,.7), CS.x+x,6.9,CS.z+z);
    k.add(new THREE.BoxGeometry(9,.5,.5), sm(0x2a2e34,.5,.7), CS.x,12.2,CS.z-12); k.add(new THREE.BoxGeometry(9,.5,.5), sm(0x2a2e34,.5,.7), CS.x,12.2,CS.z+12);
    for(const x of [-4,4]) k.add(new THREE.BoxGeometry(.5,.5,24.5), sm(0x2a2e34,.5,.7), CS.x+x,12.2,CS.z);
    k.add(new THREE.BoxGeometry(.6,7,17), sm(0x0c0d10,.6), CS.x+3.7,5.2,CS.z);
    for(const s of [-1,1]){ k.add(new THREE.BoxGeometry(2.2,5.5,2.4), sm(0x111214,.8), CS.x-2.6,4.15,CS.z+s*14.4); k.add(new THREE.BoxGeometry(.5,6,5), sm(0x0c0d10,.6), CS.x+1.5,5.6,CS.z+s*12.4); }
    k.add(new THREE.BoxGeometry(1.6,1.1,2.6), sm(0x2b2f36,.5,.4), CS.x+1.2,1.95,CS.z);   // bàn DJ
    // hàng rào khu VIP (cổng ở mặt Tây)
    const fm=sm(0xc8ced6,.35,.7);
    k.add(new THREE.BoxGeometry(PIT.x1-PIT.x0,1.1,.08), fm, (PIT.x0+PIT.x1)/2,.55,PIT.z0); k.add(new THREE.BoxGeometry(PIT.x1-PIT.x0,1.1,.08), fm, (PIT.x0+PIT.x1)/2,.55,PIT.z1);
    const gz0=CS.z-2, gz1=CS.z+2; k.add(new THREE.BoxGeometry(.08,1.1,gz0-PIT.z0), fm, PIT.x0,.55,(PIT.z0+gz0)/2); k.add(new THREE.BoxGeometry(.08,1.1,PIT.z1-gz1), fm, PIT.x0,.55,(gz1+PIT.z1)/2);
    const g=new THREE.Group(); scene.add(g); k.build(g);
    addBox(PIT.x0,PIT.x1,PIT.z0-.1,PIT.z0+.1); addBox(PIT.x0,PIT.x1,PIT.z1-.1,PIT.z1+.1); addBox(PIT.x0-.1,PIT.x0+.1,PIT.z0,gz0); addBox(PIT.x0-.1,PIT.x0+.1,gz1,PIT.z1);
    addBox(CS.x-4.5,CS.x+4.5,CS.z-12.3,CS.z+12.3);   // sân khấu cao 1,4 m – không trèo lên
    const scr=new THREE.Mesh(new THREE.PlaneGeometry(16,6.2), new THREE.MeshBasicMaterial({map:ledTex, toneMapped:false})); scr.position.set(CS.x+3.38,5.4,CS.z); scr.rotation.y=-Math.PI/2; scr.userData.dynamic=true; scene.add(scr);
    for(const s of [-1,1]){ const ss=new THREE.Mesh(new THREE.PlaneGeometry(4.6,5.6), new THREE.MeshBasicMaterial({map:sideTex, toneMapped:false})); ss.position.set(CS.x+1.24,5.6,CS.z+s*12.4); ss.rotation.y=-Math.PI/2; ss.userData.dynamic=true; scene.add(ss); }
    // đèn quét (nón sáng cộng màu) + laser
    const coneG=new THREE.ConeGeometry(1.6,14,20,1,true); coneG.translate(0,-7,0);
    for(let i=0;i<8;i++){ const m=new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:.14, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide, toneMapped:false});
      const c=new THREE.Mesh(coneG, m); c.position.set(CS.x-3.6, 12, CS.z-10.5+i*3); c.userData.dynamic=true; c.castShadow=false; c.userData.noFar=true; scene.add(c); beams.push({c, m, ph:i*.8}); }
    const lzG=new THREE.BoxGeometry(.04,.04,60); lzG.translate(0,0,30);
    for(let i=0;i<6;i++){ const m=new THREE.MeshBasicMaterial({color:i%2?0x39ff88:0xff3df0, transparent:true, opacity:.75, blending:THREE.AdditiveBlending, depthWrite:false, toneMapped:false});
      const l=new THREE.Mesh(lzG, m); l.position.set(CS.x-3, 9.5, CS.z-6+i*2.4); l.userData.dynamic=true; l.castShadow=false; l.userData.noFar=true; scene.add(l); lasers.push({l, m, ph:i}); }
  }
  const pitSpots=[]; for(let x=PIT.x0+1.2;x<PIT.x1-1;x+=.85) for(let z=PIT.z0+1;z<PIT.z1-1;z+=.85){ if(R()<.6 && !(x<PIT.x0+5 && Math.abs(z-CS.z)<3)) pitSpots.push({x:x+(R()-.5)*.3, y:.02, z:z+(R()-.5)*.3, r:-Math.PI/2+(R()-.5)*.6}); }
  for(let x=PIT.x0-14;x<PIT.x0-2;x+=1.1) for(let z=PIT.z0+2;z<PIT.z1-2;z+=1.1) if(R()<.35) pitSpots.push({x:x+(R()-.5)*.4, y:.02, z:z+(R()-.5)*.4, r:-Math.PI/2+(R()-.5)*.8});
  const audience=crowd(pitSpots, [0xff4f8b,0xffb21f,0x12a594,0x7aa2ff,0xf3f6f8,0x222831,0xc77dff]);
  const singer=(()=>{ if(!W.people) return null; const k=W.people.kit(4242,{outfit:{shirt:0xffd23f, pants:0x111111, style:'long'}}); const a=W.makeActor(k.gl,{name:'Ca sĩ · Bình Vip Pro', height:k.h, face:0, clips:k.clips, compact:false, dot:'#ffd23f'}); a.g.position.set(CS.x-3,1.42,CS.z); a.g.rotation.y=-Math.PI/2; a.play('idle',0); return {a}; })();
  const dj=(()=>{ if(!W.people) return null; const k=W.people.kit(5151,{outfit:{shirt:0x111111, pants:0x111111, style:'cap'}}); const a=W.makeActor(k.gl,{name:'DJ · Anh trai say Salary', height:k.h, face:0, clips:k.clips, compact:false, dot:'#c77dff'}); a.g.position.set(CS.x+2.2,1.42,CS.z); a.g.rotation.y=-Math.PI/2; a.play('idle',0); return {a}; })();
  const SHOW={on:false, t:0, len:180, rest:60};
  INTER.push({x:PIT.x0-1.5, z:CS.z, r:3, prio:.6, get label(){ return hasTicket('concert') ? `🎤 Khu sát sân khấu – vé còn ${Math.ceil((S.fun.tickets.concert-now())/60000)} phút` : '🎟️ Vé concert khu sát sân khấu (E) – 30 💰 / 30 phút'; },
    action:()=>{ if(hasTicket('concert')) return toast('🎤 Vào thẳng khu sát sân khấu, nhảy cùng mọi người (phím F)!', 3000);
      askPay(30, '🎟️ Vé concert <b>QC LIVE ARENA</b> – khu sát sân khấu, 30 phút', ()=>{ if(!spend(30)) return; giveTicket('concert',30); toast('🎟️ Đã có vé – cổng mở! Bấm F để nhảy theo nhạc.', 3600); }); }});
  const pitGate={x0:PIT.x0-.15, x1:PIT.x0+.15, z0:CS.z-2, z1:CS.z+2, msg:'🎟️ Khu sát sân khấu cần vé concert (30 💰) – bấm E ở quầy vé cạnh lối vào.'}; boxes.push(pitGate);
  // nhạc tự tạo (WebAudio): trống + bass + hợp âm + giai điệu, 124 BPM
  const AU={ctx:null, master:null, next:0, step:0, timer:null};
  function audioStart(){ if(AU.ctx) return true; try{ const C=window.AudioContext||window.webkitAudioContext; if(!C) return false; AU.ctx=new C(); AU.master=AU.ctx.createGain(); AU.master.gain.value=0; const comp=AU.ctx.createDynamicsCompressor();
      AU.lp=AU.ctx.createBiquadFilter(); AU.lp.type='lowpass'; AU.lp.frequency.value=12000; AU.master.connect(AU.lp); AU.lp.connect(comp); comp.connect(AU.ctx.destination);   // S19g: xa sân khấu → tiếng đục (chỉ còn bass)
      AU.noise=AU.ctx.createBuffer(1, AU.ctx.sampleRate*.5, AU.ctx.sampleRate); const d=AU.noise.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=R()*2-1;
      AU.timer=setInterval(schedule, 25); return true; }catch(e){ return false; } }
  const BPM=124, SPB=60/BPM/4, CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]], LEAD=[69,72,76,72, 74,72,69,67, 65,69,72,69, 67,71,74,71];
  const hz=n=>440*Math.pow(2,(n-69)/12);
  function tone(t, f, dur, type, vol, cut){ const o=AU.ctx.createOscillator(), g=AU.ctx.createGain(); o.type=type; o.frequency.value=f; let node=o; if(cut){ const fl=AU.ctx.createBiquadFilter(); fl.type='lowpass'; fl.frequency.value=cut; o.connect(fl); node=fl; } node.connect(g); g.connect(AU.master);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(.0008,t+dur); o.start(t); o.stop(t+dur+.02); }
  function noiseHit(t, dur, vol, hp){ const s=AU.ctx.createBufferSource(), g=AU.ctx.createGain(), f=AU.ctx.createBiquadFilter(); s.buffer=AU.noise; f.type='highpass'; f.frequency.value=hp; s.connect(f); f.connect(g); g.connect(AU.master); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0008,t+dur); s.start(t); s.stop(t+dur+.02); }
  function kick(t){ const o=AU.ctx.createOscillator(), g=AU.ctx.createGain(); o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(42,t+.14); g.gain.setValueAtTime(.9,t); g.gain.exponentialRampToValueAtTime(.001,t+.32); o.connect(g); g.connect(AU.master); o.start(t); o.stop(t+.34); }
  function schedule(){ const c=AU.ctx; if(!c || !SHOW.on || Math.hypot(P.x-CS.x,P.z-CS.z)>110) return; if(AU.next<c.currentTime) AU.next=c.currentTime+.05;
    while(AU.next<c.currentTime+.12){ const s=AU.step%16, bar=Math.floor(AU.step/16)%4, t=AU.next, ch=CH[bar];
      if(s%4===0) kick(t); if(s===4||s===12) noiseHit(t,.18,.35,1500); if(s%2===1) noiseHit(t,.05,.12,7000);
      if(s%2===0) tone(t, hz(ch[0]-24+(s%8===6?12:0)), SPB*1.8, 'sawtooth', .16, 520);
      if(s===0) for(const n of ch) tone(t, hz(n), SPB*15, 'triangle', .05, 2400);
      if(s%2===0 && bar%2===1) tone(t, hz(LEAD[(s/2+bar*4)%16]), SPB*1.6, 'square', .045, 3200);
      AU.next+=SPB; AU.step++; } }
  const beatAt=t=>{ const ph=(t*BPM/60)%1; return Math.pow(1-ph,3); };
  function drawLED(T, beat){ const c=ledTex.userData.canvas, g=c.getContext('2d'), w=c.width, h=c.height;
    const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,`hsl(${(T*30)%360},80%,${12+beat*14}%)`); gr.addColorStop(1,`hsl(${(T*30+140)%360},80%,8%)`); g.fillStyle=gr; g.fillRect(0,0,w,h);
    if(SHOW.on){ for(let i=0;i<40;i++){ const a=.25+.75*Math.abs(Math.sin(T*3+i*.4)*Math.sin(T*1.7+i*.13))*(.6+beat*.4), bh=a*h*.6; g.fillStyle=`hsl(${(i*9+T*60)%360},95%,60%)`; g.fillRect(i*w/40+4, h-bh-20, w/40-8, bh); }
      g.fillStyle='#fff'; g.textAlign='center'; font(g,64,900); g.fillText('QC LIVE ARENA',w/2,96); font(g,30,700); g.fillStyle='#ffe28a'; g.fillText('🎤 Bình Vip Pro · DJ Anh trai say Salary',w/2,146); }
    else { g.fillStyle='#fff'; g.textAlign='center'; font(g,58,900); g.fillText('QC LIVE ARENA',w/2,h/2-20); font(g,34,700); g.fillStyle='#9fe6da'; const r=Math.max(0,Math.ceil(SHOW.rest-SHOW.t)); g.fillText(`Màn diễn tiếp theo sau ${Math.floor(r/60)}:${String(r%60).padStart(2,'0')}`,w/2,h/2+40); }
    ledTex.needsUpdate=true;
    const s=sideTex.userData.canvas, q=s.getContext('2d'); q.fillStyle=`hsl(${(T*40+200)%360},70%,${10+beat*20}%)`; q.fillRect(0,0,s.width,s.height); q.fillStyle='#fff'; q.textAlign='center'; font(q,44,900); q.fillText(SHOW.on?'LIVE':'QC',s.width/2,s.height/2); sideTex.needsUpdate=true; }
  let ledAcc=0;
  function updConcert(dt, T, inRange){
    SHOW.t+=dt; if(SHOW.on && SHOW.t>SHOW.len){ SHOW.on=false; SHOW.t=0; } else if(!SHOW.on && SHOW.t>SHOW.rest){ SHOW.on=true; SHOW.t=0; if(near(CS.x,CS.z,70)) toast('🎤 Màn diễn bắt đầu! Bấm F để nhảy cùng khán giả.', 2600); }
    const beat=SHOW.on ? beatAt(AU.ctx ? AU.ctx.currentTime : T) : 0;
    audience.U.uT.value=T; audience.U.uBeat.value=SHOW.on?1:0;
    if(!inRange) return;
    for(const b of beams){ b.c.visible=SHOW.on; if(!SHOW.on) continue; b.c.rotation.z=Math.sin(T*.9+b.ph)*.55; b.c.rotation.x=Math.cos(T*.7+b.ph)*.35; b.m.color.setHSL(((T*.08+b.ph*.12)%1),.9,.55); b.m.opacity=.08+beat*.12; }
    for(const l of lasers){ l.l.visible=SHOW.on && (Math.floor(T*2+l.ph)%3!==0); if(!l.l.visible) continue; l.l.rotation.y=-Math.PI/2+Math.sin(T*1.3+l.ph)*.7; l.l.rotation.x=-.12+Math.sin(T*2.1+l.ph*.7)*.08; }
    ledAcc+=dt; if(ledAcc>1/15){ ledAcc=0; drawLED(T, beat); }
    if(singer){ singer.a.play(SHOW.on?'walk':'idle',.3); singer.a.g.position.z=CS.z+(SHOW.on?Math.sin(T*.6)*4:0); singer.a.g.rotation.y=-Math.PI/2+(SHOW.on?Math.cos(T*.6)*.4:0); if(singer.a.root.visible) singer.a.mixer.update(dt*(SHOW.on?.6:1)); }
    if(dj && dj.a.root.visible){ dj.a.play('idle',.3); dj.a.g.position.y=1.42+(SHOW.on?beat*.05:0); dj.a.mixer.update(dt); }
    // âm lượng theo khoảng cách (không phát nếu đang mở nhạc YouTube)
    // S19g: nhỏ dần theo bình phương khoảng cách (10 m ~0,5 · 25 m ~0,25 · 50 m ~0,06 · 90 m gần như im) + càng xa càng đục
    if(AU.ctx){ const d=Math.hypot(P.x-CS.x,P.z-CS.z), yt=W.music && W.music.playing, k=Math.max(0,d-10)/15, v = SHOW.on && !yt && !W.inside && d<100 ? .5/(1+k*k)*Math.min(1,(100-d)/15) : 0; AU.master.gain.setTargetAtTime(v, AU.ctx.currentTime, .3);
      if(AU.lp) AU.lp.frequency.setTargetAtTime(Math.max(450, 14000/(1+d/9)), AU.ctx.currentTime, .4); }
  }
  addEventListener('keydown', ()=>{ if(!AU.ctx && near(CS.x,CS.z,95)) audioStart(); if(AU.ctx && AU.ctx.state==='suspended') AU.ctx.resume(); });
  addEventListener('pointerdown', ()=>{ if(!AU.ctx && near(CS.x,CS.z,95)) audioStart(); if(AU.ctx && AU.ctx.state==='suspended') AU.ctx.resume(); });

  /* ============================== 4. 🎬 RẠP QC CINEMA ============================== */
  const CI={x0:279, x1:315, z0:10, z1:34, h:9.5};
  const film=canvasTex(960,400,()=>{}); film.userData.live=true;
  const hall=new THREE.Group(); scene.add(hall); hall.userData.dynamic=true; hall.visible=false;
  let roof=null;
  { const k=Kit(), wm=sm(0xe9e2d4,.75), CX=(CI.x0+CI.x1)/2, door=4;
    k.add(new THREE.BoxGeometry(CI.x1-CI.x0,CI.h,.4), wm, CX,CI.h/2,CI.z1);
    k.add(new THREE.BoxGeometry(.4,CI.h,CI.z1-CI.z0), wm, CI.x0,CI.h/2,(CI.z0+CI.z1)/2); k.add(new THREE.BoxGeometry(.4,CI.h,CI.z1-CI.z0), wm, CI.x1,CI.h/2,(CI.z0+CI.z1)/2);
    k.add(new THREE.BoxGeometry((CI.x1-CI.x0)/2-door/2,CI.h,.4), wm, CI.x0+((CI.x1-CI.x0)/2-door/2)/2,CI.h/2,CI.z0); k.add(new THREE.BoxGeometry((CI.x1-CI.x0)/2-door/2,CI.h,.4), wm, CI.x1-((CI.x1-CI.x0)/2-door/2)/2,CI.h/2,CI.z0);
    k.add(new THREE.BoxGeometry(door,CI.h-3.2,.4), wm, CX,3.2+(CI.h-3.2)/2,CI.z0);
    k.add(new THREE.BoxGeometry(CI.x1-CI.x0+1.2,.6,2.4), sm(0x8a1c2b,.5), CX,3.6,CI.z0-1.1);   // mái hiên
    { const rm=sm(0x8a1c2b,.5), W2=CI.x1-CI.x0+.8, D2=CI.z1-CI.z0+.8, CZ=(CI.z0+CI.z1)/2;   // viền mái đỏ (khung rỗng)
      k.add(new THREE.BoxGeometry(W2,1.2,.8), rm, CX,CI.h+.2,CI.z0); k.add(new THREE.BoxGeometry(W2,1.2,.8), rm, CX,CI.h+.2,CI.z1);
      k.add(new THREE.BoxGeometry(.8,1.2,D2), rm, CI.x0,CI.h+.2,CZ); k.add(new THREE.BoxGeometry(.8,1.2,D2), rm, CI.x1,CI.h+.2,CZ); }
    for(const fx of [-14,-9,9,14]) k.add(new THREE.BoxGeometry(.8,CI.h-1,.5), sm(0x8a1c2b,.5), CX+fx,(CI.h-1)/2,CI.z0-.35);   // gờ đứng mặt tiền
    k.add(new THREE.BoxGeometry(CI.x1-CI.x0-.4,.35,.2), sm(0x2a2e34,.5), CX,.18,CI.z0-.3);
    const g=new THREE.Group(); scene.add(g); k.build(g);
    addBox(CI.x0,CI.x1,CI.z1-.2,CI.z1+.2); addBox(CI.x0-.2,CI.x0+.2,CI.z0,CI.z1); addBox(CI.x1-.2,CI.x1+.2,CI.z0,CI.z1); addBox(CI.x0,CX-door/2,CI.z0-.2,CI.z0+.2); addBox(CX+door/2,CI.x1,CI.z0-.2,CI.z0+.2);
    roof=new THREE.Mesh(new THREE.BoxGeometry(CI.x1-CI.x0-.2,.3,CI.z1-CI.z0-.2), sm(0x3a3f47,.8)); roof.position.set(CX,CI.h+.75,(CI.z0+CI.z1)/2); roof.castShadow=true; roof.receiveShadow=true; scene.add(roof);
    // bảng hiệu neon + poster
    const mq=canvasTex(1024,160,(c,w,h)=>{ c.fillStyle='#120a14'; c.fillRect(0,0,w,h); c.strokeStyle='#ff3d6e'; c.lineWidth=8; c.strokeRect(10,10,w-20,h-20); c.fillStyle='#ffe28a'; c.textAlign='center'; c.textBaseline='middle'; font(c,92,900); c.fillText('🎬 QC CINEMA',w/2,h/2+4); });
    const mqm=new THREE.MeshStandardMaterial({map:mq, emissive:0xffffff, emissiveMap:mq, emissiveIntensity:.5}); const m1=new THREE.Mesh(new THREE.PlaneGeometry(14,2.2), mqm); m1.position.set(CX,6.6,CI.z0-.25); m1.rotation.y=Math.PI; scene.add(m1);
    nightFns.push(n=>{ mqm.emissiveIntensity=.5+n*1.6; });
    const posters=[['CUỘC SĂN BUG','🐞','#0d3b66','#ffd23f'],['TEST CASE WARS','⚔️','#3a0d66','#ff8fc2'],['AUTOMATION RISING','🤖','#0d5c46','#9fe6da']];
    posters.forEach(([t,ic,bg,fg],i)=>{ const pt=canvasTex(256,384,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,0,h); gr.addColorStop(0,bg); gr.addColorStop(1,'#000'); c.fillStyle=gr; c.fillRect(0,0,w,h); c.textAlign='center'; font(c,120,400); c.fillText(ic,w/2,190); c.fillStyle=fg; fit(c,t,40,900,w-20); c.fillText(t,w/2,290); c.fillStyle='#ccc'; font(c,20,600); c.fillText('ĐANG CHIẾU',w/2,340); });
      const pm=new THREE.Mesh(new THREE.PlaneGeometry(2,3), new THREE.MeshStandardMaterial({map:pt, emissive:0xffffff, emissiveMap:pt, emissiveIntensity:.25})); pm.position.set(CI.x0+4+i*3+(i>0?14:0)+(i>1?-2:0), 1.9, CI.z0-.25); pm.rotation.y=Math.PI; scene.add(pm); });
    // bên trong: màn chiếu + 5 hàng ghế bậc thang (ẩn khi ở ngoài)
    const ik=Kit(); ik.add(new THREE.BoxGeometry(CI.x1-CI.x0-1,.05,CI.z1-CI.z0-1), sm(0x3a1d24,.9), CX,.04,(CI.z0+CI.z1)/2);
    for(let r=0;r<5;r++){ const z=CI.z0+4+r*2.2, h=.35*(4-r); if(h>0){ ik.add(new THREE.BoxGeometry(CI.x1-CI.x0-6,h,2.2), sm(0x2a1a20,.9), CX,h/2,z); addPlat(CX,z,0,(CI.x1-CI.x0-6)/2,1.1,h+.02);
        // S-GFX (15/11): hông bậc ghế + lưng bậc cao nhất chặn người đứng thấp hơn mặt bậc (trước đi từ lối bên / phía sau chui vào khối bậc)
        const hw=(CI.x1-CI.x0-6)/2; if(h>.6) for(const sx of [-1,1]) boxes.push({x0:CX+sx*hw-.06, x1:CX+sx*hw+.06, z0:z-1.1, z1:z+1.1, y0:-1, y1:h-.4});
        if(r===0) boxes.push({x0:CX-hw, x1:CX+hw, z0:z-1.16, z1:z-1.04, y0:-1, y1:h+1.2}); }
      for(let i=0;i<10;i++){ const x=CX-11.25+i*2.5; ik.add(new THREE.BoxGeometry(.9,.45,.8), sm(0xb3122e,.6), x,h+.23,z+.3); ik.add(new THREE.BoxGeometry(.9,.8,.15), sm(0xb3122e,.6), x,h+.6,z-.1); } }
    ik.add(new THREE.BoxGeometry(CI.x1-CI.x0-4,.3,1.4), sm(0x8d949b,.6), CX,.15,CI.z1-2.2);
    { const lin=sm(0x1a1216,.9), CZ=(CI.z0+CI.z1)/2, IW=CI.x1-CI.x0-.9, ID=CI.z1-CI.z0-.9;   // lót tường + trần tối bên trong
      ik.add(new THREE.BoxGeometry(.1,CI.h-.3,ID), lin, CI.x0+.3,CI.h/2,CZ); ik.add(new THREE.BoxGeometry(.1,CI.h-.3,ID), lin, CI.x1-.3,CI.h/2,CZ);
      ik.add(new THREE.BoxGeometry(IW,CI.h-.3,.1), lin, CX,CI.h/2,CI.z1-.25); ik.add(new THREE.BoxGeometry(IW,.12,ID), lin, CX,CI.h-.15,CZ);
      for(const sx of [-1,1]) ik.add(new THREE.BoxGeometry((IW-4)/2,CI.h-.3,.1), lin, CX+sx*((IW-4)/4+2),CI.h/2,CI.z0+.3);
      for(let z=CI.z0+3;z<CI.z1-3;z+=4) for(const sx of [-1,1]) ik.add(new THREE.BoxGeometry(.12,.5,.25), glow(0xffb35c), CX+sx*(IW/2-.2),3.2,z); }
    ik.build(hall);
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(24,10), new THREE.MeshBasicMaterial({map:film, toneMapped:false})); screen.position.set(CX,5.6,CI.z1-.35); screen.rotation.y=Math.PI; hall.add(screen);
    const pl=new THREE.PointLight(0xaab8ff, 0, 30, 2); pl.position.set(CX,6,CI.z1-6); hall.add(pl); hall.userData.light=pl;
    // ghế ngồi xem (hàng 2 và 3)
    for(const r of [1,2,3]) for(const i of [3,4,5,6]){ const z=CI.z0+4+r*2.2, h=.35*(4-r), x=CX-11.25+i*2.5;
      W.addSeat({x, z:z+.3, rot:0, y:h+.48, floor:h+.02, label:'🎬 Ngồi xem phim (E · C)', tag:'cinema', onSit:()=>{ FILM.watching=true; toast('🎬 Phim “Cuộc săn Bug” đang chiếu – ngồi thư giãn nhé. Bấm C để đứng dậy.', 3200); }}); }
  }
  const cineGate={x0:(CI.x0+CI.x1)/2-2, x1:(CI.x0+CI.x1)/2+2, z0:CI.z0-.25, z1:CI.z0+.25, msg:'🎟️ Cửa rạp cần vé xem phim (15 💰) – bấm E ở quầy vé trước cửa.'}; boxes.push(cineGate);
  INTER.push({x:(CI.x0+CI.x1)/2, z:CI.z0-2.2, r:3, prio:.6, get label(){ return hasTicket('cinema') ? `🎬 Vào rạp – vé còn ${Math.ceil((S.fun.tickets.cinema-now())/60000)} phút` : '🎟️ Mua vé xem phim (E) – 15 💰 / 20 phút'; },
    action:()=>{ if(hasTicket('cinema')) return toast('🎬 Cửa đã mở – vào chọn ghế (C) để xem phim.', 2800);
      askPay(15, '🎟️ Vé xem phim <b>“Cuộc săn Bug”</b> – phim hoạt hình ngắn về nghề QC (20 phút)', ()=>{ if(!spend(15)) return; giveTicket('cinema',20); toast('🎟️ Đã có vé – cửa rạp mở!', 2400); }); }});
  INTER.push({x:(CI.x0+CI.x1)/2+8, z:CI.z0+1.8, r:2.4, prio:.5, label:'🍿 Bỏng ngô + nước ngọt (E) – 12 💰: nhanh hơn 40% trong 5 phút',
    action:()=>askPay(12, '🍿 Combo bỏng ngô + nước ngọt', ()=>{ if(!spend(12)) return; buff('energy',5); toast('🍿 Giòn tan! ⚡ Nhanh hơn 40% trong 5 phút.', 2600); })});
  // phim hoạt hình "Cuộc săn Bug" (7 cảnh × 9 giây, vẽ bằng canvas)
  const FILM={t:0, watching:false};
  const SCENES=[
    ['Thứ Hai, 8 giờ sáng…', 'Một QC chăm chỉ mở máy, sẵn sàng cho bản build mới.', (g,w,h,t)=>{ sky(g,w,h,'#1b2a49','#3f6fb5'); desk(g,w*.5,h*.72); person(g,w*.5,h*.62,'#12a594',t); sun(g,w*.85,h*.2,t); }],
    ['Bản build 2.0 vừa về!', 'Dev hứa: “Lần này chắc chắn không còn bug.”', (g,w,h,t)=>{ sky(g,w,h,'#2a1b49','#6f3fb5'); person(g,w*.35,h*.62,'#ff5a6e',t); person(g,w*.65,h*.62,'#12a594',t*.7); bubble(g,w*.3,h*.25,'100% OK!'); }],
    ['Nhưng rồi…', 'Một con bug đỏ chạy vụt qua màn hình!', (g,w,h,t)=>{ sky(g,w,h,'#3b0d0d','#8a1c2b'); screenBox(g,w*.5,h*.45); bug(g,w*(.2+((t*.12)%1)*.6),h*.48,t); }],
    ['Cuộc rượt đuổi bắt đầu', 'QC lần theo log, từng bước tái hiện lỗi.', (g,w,h,t)=>{ sky(g,w,h,'#0d2b3b','#1c6f8a'); bug(g,w*(.75-((t*.08)%1)*.2),h*.6,t); person(g,w*(.25+Math.sin(t)*.03),h*.62,'#12a594',t*2); trail(g,w,h,t); }],
    ['Bằng chứng!', 'Ảnh chụp, video, các bước tái hiện – đầy đủ trong bug report.', (g,w,h,t)=>{ sky(g,w,h,'#0d3b2b','#1c8a5c'); report(g,w*.5,h*.48,t); }],
    ['Dev sửa, QC verify', 'Chạy lại test hồi quy: xanh hết!', (g,w,h,t)=>{ sky(g,w,h,'#0d3b2b','#2bb673'); checks(g,w,h,t); }],
    ['HẾT', 'QC không làm ra chất lượng – QC bảo vệ chất lượng. 💚', (g,w,h,t)=>{ sky(g,w,h,'#05070a','#12a594'); g.fillStyle='#fff'; g.textAlign='center'; font(g,74,900); g.fillText('QC WORLD STUDIO',w/2,h*.46); }],
  ];
  function sky(g,w,h,a,b){ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,a); gr.addColorStop(1,b); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(0,h*.78,w,h*.22); }
  function person(g,x,y,col,t){ g.fillStyle=col; g.beginPath(); g.roundRect ? g.roundRect(x-18,y-10,36,52,10) : g.rect(x-18,y-10,36,52); g.fill(); g.fillStyle='#f1c9a5'; g.beginPath(); g.arc(x,y-26,16+Math.sin(t*3)*.5,0,TAU); g.fill(); g.fillStyle='#222'; g.beginPath(); g.arc(x-5,y-28,2.4,0,TAU); g.arc(x+5,y-28,2.4,0,TAU); g.fill(); }
  function desk(g,x,y){ g.fillStyle='#6b4a2e'; g.fillRect(x-90,y-8,180,14); g.fillStyle='#1d2329'; g.fillRect(x-40,y-60,80,50); g.fillStyle='#4fc3ff'; g.fillRect(x-35,y-55,70,40); }
  function sun(g,x,y,t){ g.fillStyle='#ffd23f'; g.beginPath(); g.arc(x,y,26+Math.sin(t*2)*2,0,TAU); g.fill(); }
  function bubble(g,x,y,s){ g.fillStyle='#fff'; g.beginPath(); g.ellipse(x,y,70,30,0,0,TAU); g.fill(); g.fillStyle='#111'; g.textAlign='center'; g.textBaseline='middle'; font(g,24,900); g.fillText(s,x,y); }
  function screenBox(g,x,y){ g.fillStyle='#111'; g.fillRect(x-220,y-90,440,180); g.fillStyle='#e8f1ff'; g.fillRect(x-208,y-78,416,156); }
  function bug(g,x,y,t){ g.fillStyle='#e0262f'; g.beginPath(); g.ellipse(x,y,26,18,0,0,TAU); g.fill(); g.fillStyle='#111'; g.beginPath(); g.arc(x+22,y,9,0,TAU); g.fill(); g.strokeStyle='#111'; g.lineWidth=3; for(let i=-1;i<=1;i++){ g.beginPath(); g.moveTo(x+i*10,y+12); g.lineTo(x+i*10+Math.sin(t*20+i)*6,y+26); g.stroke(); g.beginPath(); g.moveTo(x+i*10,y-12); g.lineTo(x+i*10+Math.sin(t*20+i)*6,y-26); g.stroke(); } g.fillStyle='#111'; for(const s of [-8,6]){ g.beginPath(); g.arc(x+s-4,y-4,3.5,0,TAU); g.fill(); } }
  function trail(g,w,h,t){ g.fillStyle='rgba(255,255,255,.55)'; for(let i=0;i<8;i++){ g.beginPath(); g.arc(w*(.3+i*.05),h*.66+Math.sin(t*4+i)*3,4,0,TAU); g.fill(); } }
  function report(g,x,y,t){ g.fillStyle='#fff'; g.fillRect(x-200,y-120,400,240); g.fillStyle='#e0262f'; g.fillRect(x-200,y-120,400,36); g.fillStyle='#fff'; font(g,22,900); g.textAlign='left'; g.fillText('BUG-1024 · Nút Thanh toán treo',x-188,y-96);
    g.fillStyle='#222'; font(g,18,600); ['1. Đăng nhập tài khoản test','2. Thêm 2 sản phẩm vào giỏ','3. Bấm Thanh toán → treo 30 giây','Mong đợi: chuyển trang ngay','Mức độ: Nghiêm trọng'].forEach((s,i)=>{ if(t*1.2>i) g.fillText(s,x-188,y-58+i*34); }); }
  function checks(g,w,h,t){ g.textAlign='left'; font(g,26,800); for(let i=0;i<6;i++){ const ok=t*1.3>i; g.fillStyle=ok?'#b6ffcf':'rgba(255,255,255,.4)'; g.fillText(`${ok?'✅':'⏳'}  Test case TC-${101+i}`, w*.32, h*.2+i*44); } }
  function drawFilm(dt){ FILM.t+=dt; const per=9, idx=Math.floor(FILM.t/per)%SCENES.length, lt=FILM.t%per, [title, sub, fn]=SCENES[idx]; const c=film.userData.canvas, g=c.getContext('2d'), w=c.width, h=c.height;
    g.save(); fn(g,w,h,lt); g.restore(); const fade=Math.min(1, lt/.6, (per-lt)/.6); g.fillStyle=`rgba(0,0,0,${1-fade})`; g.fillRect(0,0,w,h);
    g.fillStyle='rgba(0,0,0,.55)'; g.fillRect(0,h-78,w,78); g.fillStyle='#ffe28a'; g.textAlign='center'; g.textBaseline='middle'; font(g,28,900); g.fillText(title,w/2,h-54); g.fillStyle='#fff'; font(g,20,600); g.fillText(sub,w/2,h-24); film.needsUpdate=true; }
  let filmAcc=0, inHall=false;
  function updCinema(dt){
    const inside = P.x>CI.x0 && P.x<CI.x1 && P.z>CI.z0 && P.z<CI.z1;
    if(inside!==inHall){ inHall=inside; hall.visible=inside; HOOK.camBox = inside ? {x0:CI.x0+.6, x1:CI.x1-.6, z0:CI.z0+.6, z1:CI.z1-.6, y1:CI.h-.4} : (HOOK.camBox && HOOK.camBox.cinema ? null : HOOK.camBox); if(HOOK.camBox && inside) HOOK.camBox.cinema=true; if(hall.userData.light) hall.userData.light.intensity = inside ? 3 : 0; }
    if(inside){ filmAcc+=dt; if(filmAcc>1/15){ drawFilm(filmAcc); filmAcc=0; } }
  }

  /* ============================== 5. 🍜 PHỐ ẨM THỰC ============================== */
  function buff(id, minutes){ S.buffs=S.buffs||{}; S.buffs[id]=Math.max(now(), S.buffs[id]||0)+minutes*60000; save(); }
  const FOOD={x0:279, x1:322, z:46}, vendors=[];
  const STALLS=[
    {name:'Phở Bình Phan', icon:'🍜', col:0xb3122e, menu:[['🍜','Phở bò tái', 35, 'energy', 10, 'Nhanh hơn 40% trong 10 phút'],['🥢','Phở gà', 30, 'energy', 8, 'Nhanh hơn 40% trong 8 phút']]},
    {name:'Cơm tấm QC', icon:'🍱', col:0xff7b29, menu:[['🍱','Cơm tấm sườn bì chả', 50, 'both', 10, 'Nhanh hơn 40% + thưởng quiz +20% trong 10 phút']]},
    {name:'Bánh mì Test Case', icon:'🥖', col:0xffb21f, menu:[['🥖','Bánh mì thịt', 20, 'energy', 5, 'Nhanh hơn 40% trong 5 phút'],['🍳','Bánh mì ốp la', 22, 'coffee', 10, 'Thưởng quiz +20% trong 10 phút']]},
    {name:'Trà sữa Regression', icon:'🥤', col:0x7a4fd8, menu:[['🥤','Trà sữa trân châu', 25, 'coffee', 15, 'Thưởng quiz +20% trong 15 phút'],['☕','Cà phê sữa đá', 25, 'coffee', 30, 'Thưởng quiz +20% trong 30 phút']]},
  ];
  { const k=Kit(), sk=Kit();
    STALLS.forEach((st,i)=>{ const x=FOOD.x0+5+i*10.5, z=FOOD.z;
      sk.add(new THREE.BoxGeometry(5,1.1,1.6), sm(0xf3f0ea,.5), x,.55,z); sk.add(new THREE.BoxGeometry(5.2,.08,1.8), sm(0x6b4a2e,.6), x,1.14,z);
      for(const sx of [-1,1]) sk.add(new THREE.CylinderGeometry(.06,.06,2.6,8), sm(0x3a3f45,.4,.6), x+sx*2.4,1.3,z-1.2);
      sk.add(new THREE.BoxGeometry(5.6,.12,3.2), sm(st.col,.5), x,2.6,z-.6, .12,0,0);
      const t=canvasTex(512,96,(c,w,h)=>{ c.fillStyle='#fff8ec'; c.fillRect(0,0,w,h); c.fillStyle='#2a1a10'; c.textAlign='center'; c.textBaseline='middle'; fit(c,`${st.icon} ${st.name}`,52,900,w-30); c.fillText(`${st.icon} ${st.name}`,w/2,h/2+2); });
      sk.add(new THREE.PlaneGeometry(4.6,.85), new THREE.MeshStandardMaterial({map:t, roughness:.6}), x,3.15,z-2.15, 0,Math.PI,0);
      circles.push({x:x-1.5,z,r:.9},{x,z,r:.9},{x:x+1.5,z,r:.9});
      INTER.push({x, z:z-2.3, r:2.4, prio:.6, label:`${st.icon} ${st.name} – gọi món (E)`, action:()=>openStall(st)});
      if(W.people){ const kk=W.people.kit(700+i*13,{outfit:{shirt:0xffffff, pants:0x222222, style:i%2?'cap':'bun'}}); const a=W.makeActor(kk.gl,{name:`Chủ quán · ${st.name}`, height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#ffb547'}); a.g.position.set(x,.02,z+1.3); a.g.rotation.y=Math.PI; a.play('idle',0); vendors.push(a); } });
    const foodTables=[];
    for(let i=0;i<6;i++){ const x=FOOD.x0+4+i*7, z=FOOD.z+7.5; const grp={seats:[], table:{x, z, y:.81}}; foodTables.push(grp); k.add(new THREE.CylinderGeometry(.7,.7,.06,16), sm(0xffffff,.4), x,.78,z); k.add(new THREE.CylinderGeometry(.06,.06,.76,8), sm(0x3a3f45,.4,.6), x,.39,z);
      k.add(new THREE.ConeGeometry(1.9,.7,12,1,true), sm(i%2?0xff5a6e:0x12a594,.6), x,2.75,z); k.add(new THREE.CylinderGeometry(.04,.04,2.6,6), sm(0xdddddd,.4), x,1.6,z); circles.push({x,z,r:.75});
      for(const s of [-1,1]){ k.add(new THREE.BoxGeometry(.45,.45,.45), sm(0xe7e3da,.6), x+s*1.15,.23,z); grp.seats.push(W.addSeat({x:x+s*1.15, z, rot:s>0?-Math.PI/2:Math.PI/2, y:.47, floor:.02, label:'🪑 Ngồi bàn ăn (E · C)'})); } }
    // S8: khách bot mua đồ ở quầy rồi ra bàn ngồi ăn uống, nói chuyện (js/cafe.js)
    (W.CAFES||(W.CAFES=[])).push({name:'Phố ẩm thực Fun Park', center:{x:(FOOD.x0+FOOD.x1)/2, z:FOOD.z+3}, max:4, groups:foodTables, drinks:['trà sữa','nước ép cam','cà phê muối','bánh mì'],
      spawn:{x:(FOOD.x0+FOOD.x1)/2, z:FOOD.z-9}, order:()=>{ const i=Math.floor(Math.random()*STALLS.length); return {x:FOOD.x0+5+i*10.5, z:FOOD.z-2.3, face:0}; },
      via:(ap, o)=>{ const gx=o.x+5.25; return [[gx, o.z], [gx, FOOD.z+4.6]]; }});
    const g=new THREE.Group(); scene.add(g); k.build(g); sk.build(g);
  }
  function openStall(st){ const m=ui.modal(`${st.icon} ${st.name}`), grid=document.createElement('div'); grid.className='grid';
    for(const [ic,name,price,b,min,desc] of st.menu){ const c=document.createElement('div'); c.className='card'; c.style.cursor='pointer'; c.innerHTML=`<b>${ic} ${name}</b><small>${desc}</small><small><b>${fmt(price)} 💰</b></small>`;
      c.onclick=()=>{ m.close(); askPay(price, `${ic} <b>${name}</b> – ${desc}`, ()=>{ if(!spend(price)) return; if(b==='both'){ buff('energy',min); buff('coffee',min); } else buff(b,min); S.fun.meals=(S.fun.meals||0)+1; save(); toast(`${ic} Ngon tuyệt! ${desc}.`, 3000); }); };
      grid.appendChild(c); }
    m.body.innerHTML='<p class="muted">Ăn xong được buff ngay (cộng dồn thời gian). Có thể ngồi bàn ăn bên dưới dù nghỉ (C).</p>'; m.body.appendChild(grid); }

  /* ============================== 6. 🎡 VÒNG QUAY QC EYE ============================== */
  const FW={x:331, z:40, y:18.3, r:15, n:12};
  const wheel=new THREE.Group(); wheel.position.set(FW.x,FW.y,FW.z); wheel.userData.dynamic=true; scene.add(wheel);
  const rimLight=new THREE.MeshBasicMaterial({color:0xffffff, toneMapped:false});
  { const k=Kit(); const steel=sm(0xe8ecf0,.3,.7);
    for(const z of [-1.3,1.3]){ k.add(new THREE.TorusGeometry(FW.r,.22,8,64), steel, 0,0,z); k.add(new THREE.TorusGeometry(FW.r*.55,.14,6,40), steel, 0,0,z); }
    for(let i=0;i<FW.n*2;i++){ const a=i/(FW.n*2)*TAU; for(const z of [-1.3,1.3]) k.add(new THREE.CylinderGeometry(.07,.07,FW.r,6), steel, Math.cos(a)*FW.r/2,Math.sin(a)*FW.r/2,z, 0,0,a-Math.PI/2); }
    for(let i=0;i<FW.n;i++){ const a=i/FW.n*TAU; k.add(new THREE.CylinderGeometry(.1,.1,2.6,6), steel, Math.cos(a)*FW.r,Math.sin(a)*FW.r,0, Math.PI/2,0,0); }
    k.add(new THREE.CylinderGeometry(1.1,1.1,3.2,20), sm(0x12a594,.4,.5), 0,0,0, Math.PI/2,0,0);
    const g=new THREE.Group(); wheel.add(g); k.build(g);
    const lk=Kit(); for(const z of [-1.55,1.55]) lk.add(new THREE.TorusGeometry(FW.r+.05,.09,6,96), rimLight, 0,0,z); const lg=new THREE.Group(); wheel.add(lg); lk.build(lg,false);
    // chân đế chữ A (tĩnh)
    const ak=Kit(); for(const z of [-3.2,3.2]) for(const s of [-1,1]){ const L=Math.hypot(9, FW.y), ang=Math.atan2(9*s, FW.y); ak.add(new THREE.CylinderGeometry(.35,.5,L,10), sm(0xd8dde3,.35,.6), FW.x+s*4.5,FW.y/2,FW.z+z, 0,0,ang); circles.push({x:FW.x+s*9, z:FW.z+z, r:.6}); }
    ak.add(new THREE.CylinderGeometry(.5,.5,6.8,12), sm(0xd8dde3,.35,.6), FW.x,FW.y,FW.z, Math.PI/2,0,0);
    ak.add(new THREE.BoxGeometry(7,.5,5), sm(0xb8b2a6,.8), FW.x,.25,FW.z+0); const ag=new THREE.Group(); scene.add(ag); ak.build(ag);
    addPlat(FW.x,FW.z,0,3.5,2.5,.5);
  }
  nightFns.push(n=>{ rimLight.color.setScalar(.35+n*1.4); });
  const gondolas=(()=>{ const k=Kit(); k.add(new THREE.CylinderGeometry(1.15,1.0,1.7,10), sm(0xffffff,.4), 0,-1.6,0); k.add(new THREE.CylinderGeometry(1.2,1.2,.16,10), sm(0x12a594,.4), 0,-.72,0); k.add(new THREE.CylinderGeometry(.06,.06,.8,6), sm(0x8d949b,.4,.6), 0,-.35,0);
    const geos=k.geos(); const g=mergeGeometries(geos.map(([m,gg])=>{ const c=new THREE.Color(m.color); const n=gg.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b; } gg.setAttribute('color', new THREE.Float32BufferAttribute(a,3)); return gg; }), false);
    const im=new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.45}), FW.n); im.castShadow=true; im.frustumCulled=false; im.userData.dynamic=true; scene.add(im); return im; })();
  const cabCol=[0xff5a6e,0xffb21f,0x12a594,0x7aa2ff,0xc77dff,0x46d39a]; { const c=new THREE.Color(); for(let i=0;i<FW.n;i++) gondolas.setColorAt(i, c.set(cabCol[i%cabCol.length]).lerp(new THREE.Color(0xffffff),.35)); if(gondolas.instanceColor) gondolas.instanceColor.needsUpdate=true; }
  let wheelA=0; const gpos=i=>{ const a=wheelA+i/FW.n*TAU; return {x:FW.x+Math.cos(a)*FW.r, y:FW.y+Math.sin(a)*FW.r, z:FW.z, a}; };
  let fwRide=null;
  INTER.push({x:FW.x, z:FW.z+4, r:3.2, prio:.6, label:'🎡 Đi vòng quay QC Eye (E) – 15 💰 / 1 vòng',
    action:()=>askPay(15, '🎡 Vé vòng quay <b>QC Eye</b> – lên cao 33 m ngắm toàn thành phố (khoảng 1 phút)', ()=>{ if(!spend(15)) return; fwRide={state:'wait'}; toast('🎡 Chờ cabin xuống tới sàn…', 2400); })});
  function updWheel(dt, T){
    wheelA+=dt*.1; wheel.rotation.z=wheelA; rimLight.color.setHSL((T*.05)%1, .8, .35+(W.night||0)*.35);
    for(let i=0;i<FW.n;i++){ const p=gpos(i); _m.makeRotationZ(Math.sin(T*.8+i)*.03); _m.setPosition(p.x,p.y,p.z); gondolas.setMatrixAt(i,_m); } gondolas.instanceMatrix.needsUpdate=true;
    if(fwRide){ if(fwRide.state==='wait'){ for(let i=0;i<FW.n;i++){ const p=gpos(i), a=((p.a%TAU)+TAU)%TAU; if(Math.abs(a-Math.PI*1.5)<.05){ fwRide={state:'ride', i, a0:wheelA}; me.g.visible=false; HOOK.camDist=11;
            HOOK.vehicle={drive:(d)=>{ const q=gpos(fwRide.i); P.x=q.x; P.z=q.z+.01; P.y=q.y-2.6; me.g.position.set(q.x,q.y-2.4,q.z); if(!W.dragging && !cam.fpv) cam.yaw+=d*.15; }}; toast('🎡 Lên cabin! Kéo chuột để ngắm thành phố.', 2600); break; } } }
      else if(wheelA-fwRide.a0>TAU-.02){ fwRide=null; HOOK.vehicle=null; HOOK.camDist=null; me.g.visible=true; P.x=FW.x; P.z=FW.z+4; P.y=groundAt(P.x,P.z); toast('🎡 Hết 1 vòng – cảm ơn bạn!', 2200); } }
    if(fwRide && fwRide.state==='wait' && Math.hypot(P.x-FW.x,P.z-FW.z)>12){ fwRide=null; S.coins+=15; save(); toast('🎡 Bạn rời khỏi sàn – đã hoàn vé 15 💰.'); }
  }

  /* ============================== KHUNG HÌNH ============================== */
  let farAcc=0;
  HOOK.onFrame.push((dt, T)=>{
    if(W.inside) return;
    const dC=Math.hypot(P.x-ACX, P.z-ACZ), inRange=dC<190;
    // cổng có vé thì mở (bỏ hộp chắn khỏi danh sách va chạm)
    const setGate=(b,open)=>{ const i=boxes.indexOf(b); if(open && i>=0) boxes.splice(i,1); else if(!open && i<0) boxes.push(b); };
    // đang ở bên trong thì cổng luôn mở để đi ra (hết vé giữa chừng cũng không bị nhốt)
    const inStad=P.x>SB.x0 && P.x<SB.x1 && P.z>SB.z0 && P.z<SB.z1-.3, inPit=P.x>PIT.x0+.3 && P.x<PIT.x1 && P.z>PIT.z0 && P.z<PIT.z1, inCine=P.x>CI.x0 && P.x<CI.x1 && P.z>CI.z0+.3 && P.z<CI.z1;
    setGate(gateBox, hasTicket('stadium')||inStad); setGate(pitGate, hasTicket('concert')||inPit); setGate(cineGate, hasTicket('cinema')||inCine);
    if(!inRange){ farAcc+=dt; if(farAcc<.25) return; dt=farAcc; farAcc=0; }
    updMatch(Math.min(dt,.1), inRange);
    if(cheer>0){ cheer-=dt; } fans.U.uT.value=T; fans.U.uCheer.value=clamp(cheer,0,1);
    updConcert(dt, T, inRange); updWheel(dt, T); updCinema(dt);
    if(inRange) for(const a of vendors) if(a.root.visible) a.mixer.update(dt);
    // góc máy truyền hình (đang ngồi khán đài)
    if(tvCam){ if(!inStadSeat()){ tvCam=false; HOOK.camOverride=null; } else { _tvPos.set(clamp(ball.x,SC.x-PL/2+6,SC.x+PL/2-6), 13, SC.z+PW/2+19); _tvLook.set(ball.x, 0, ball.z); HOOK.camOverride={pos:_tvPos, look:_tvLook, k:3}; } }
    // ngồi khán đài xong đứng dậy → đứng ngay trước ghế (không đưa đi chỗ khác)
    if(FILM.watching && !W.seats.some(s=>s.tag==='cinema' && s.taken==='me')) FILM.watching=false;
  });

  /* ============================== TAXI · BẢN ĐỒ · HƯỚNG DẪN ============================== */
  try{ if(transit && transit.G){ const G=transit.G, node=(x,z)=>{ G.nodes.push({x,z,adj:[]}); return G.nodes.length-1; }, link=(a,b)=>{ const d=Math.hypot(G.nodes[a].x-G.nodes[b].x, G.nodes[a].z-G.nodes[b].z); G.nodes[a].adj.push([b,d]); G.nodes[b].adj.push([a,d]); G.edges.push([a,b]); };
      let j=-1, bd=1e9; G.nodes.forEach((n,i)=>{ const d=Math.hypot(n.x-CITY.downtown.x1, n.z); if(d<bd){ bd=d; j=i; } });
      const a=node(AX0,0), b=node(SC.x,0), c=node(AX1-4,0); link(j,a); link(a,b); link(b,c);
      const TD=transit.TAXI_DEST; TD.push({icon:'🎡',name:'Khu Giải trí QC Fun Park',x:AX0+8,z:0},{icon:'⚽',name:'Sân bóng QC Arena',x:SC.x,z:SB.z1+2},{icon:'🎤',name:'QC Live Arena (concert)',x:PIT.x0-3,z:CS.z},{icon:'🎬',name:'Rạp QC Cinema',x:(CI.x0+CI.x1)/2,z:CI.z0-3},{icon:'🍜',name:'Phố ẩm thực',x:FOOD.x0+15,z:FOOD.z-4},{icon:'🎡',name:'Vòng quay QC Eye',x:FW.x,z:FW.z+5}); } }catch(e){ console.warn('arena taxi', e); }
  const tp=(x,z,lx,lz)=>()=>W.teleport(x,z,lx,lz);
  PLACES.push({icon:'🎡', name:'Khu Giải trí QC Fun Park', sub:'Sân bóng · concert · rạp chiếu · ẩm thực · vòng quay (qua cầu phía Đông Downtown)', go:tp(AX0+6,0,AX0+30,0)},
    {icon:'⚽', name:'Sân bóng QC Arena', sub:'Vé 20 💰 · QC FC vs Bug United đá liên tục', go:tp(SC.x,SB.z1+3,SC.x,SC.z)},
    {icon:'🎤', name:'QC Live Arena', sub:'Concert · vé 30 💰 khu sát sân khấu', go:tp(PIT.x0-4,CS.z,CS.x,CS.z)},
    {icon:'🎬', name:'Rạp QC Cinema', sub:'Phim “Cuộc săn Bug” · vé 15 💰', go:tp((CI.x0+CI.x1)/2,CI.z0-3.5,(CI.x0+CI.x1)/2,CI.z1)},
    {icon:'🍜', name:'Phố ẩm thực', sub:'Phở · cơm tấm · bánh mì · trà sữa – ăn được buff', go:tp(FOOD.x0+15,FOOD.z-4,FOOD.x0+15,FOOD.z)},
    {icon:'🎡', name:'Vòng quay QC Eye', sub:'Cao 33 m · vé 15 💰', go:tp(FW.x,FW.z+6,FW.x,FW.z)});
  try{ const c=W.$('helpWrap').querySelector('.ctrl'); const a=document.createElement('div'); a.className='ks'; a.innerHTML='<span class="key">B</span>'; const b=document.createElement('div'); b.textContent='Góc máy truyền hình khi ngồi khán đài QC Arena'; c.append(a,b); }catch(e){}

  return {match:M, ball, players, SHOW, FW, gondolas, CI, SC, buff, audio:AU};
}
