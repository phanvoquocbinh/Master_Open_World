// QC World – KHU CÔNG CỘNG (quy hoạch thành phố 15/11/2026) – nạp từ js/park.js
//  • 🏥 Bệnh viện Đa khoa QC City (khối B: x 215–261 · z 223–249, cửa chính quay ra phố chính z = 200): 4 tầng, mái có bãi đáp trực thăng,
//    sảnh có mái che, lối Cấp cứu, 2 xe cứu thương đậu ở sân trước · E: khám sức khoẻ
//  • 🚒 Trạm cứu hoả (khối B: x 220–252 · z 255–274,5): 3 gara mở ra đường z = 290, 3 xe cứu hoả đậu bên trong (đi vào xem được),
//    tháp phơi vòi, đèn hiệu · E: tham quan
//  • 🏫 Trường Tiểu học QC City (khối D: x 214–262 · z 305–365): tường rào + 2 cổng, sân trường, sân bóng rổ, cột cờ, dãy lớp học 3 tầng có hành lang
//  • Tường nhà là đoạn chặn có lời nhắn (đứng lại tại chỗ + báo lý do) · người chỉ chạy khi bạn ở gần
import { makePoser } from './pose.js';

export async function make(W, ctx, opt={}){
  const {THREE, scene, colorMat, circles, boxes, INTER, PLACES, HOOK, P, toast, makeLabel, removeLabel, makeActor, lerpAngle, burst, teleport, mergeGeometries, addSeg, GLOW} = W;
  const {S, save, ui, askPay, spend} = ctx;
  const R=Math.random, pick=a=>a[Math.floor(R()*a.length)], TAU=Math.PI*2, LOW=W.QUAL==='low', night=()=>W.night||0;
  const rng=(s=>()=>{ s=(s+0x6D2B79F5)|0; let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; })(151126);
  const out={};
  const tree=opt.tree||(()=>{});

  /* ---------- tiện ích dựng hình (gộp theo vật liệu → ít lượt vẽ) ---------- */
  const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3();
  function Kit(ox, oz){ const parts=new Map();
    return { add(geo, mat, x=0,y=0,z=0, ry=0, rx=0, rz=0, sx=1,sy=1,sz=1){ const g=geo.index?geo.toNonIndexed():geo.clone();
        for(const k of Object.keys(g.attributes)) if(k!=='position' && k!=='normal' && k!=='uv') g.deleteAttribute(k);
        if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
        g.clearGroups(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m4.compose(_v.set(x-ox,y,z-oz), _q, _s.set(sx,sy,sz)); g.applyMatrix4(_m4);
        if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
      build(cast=true){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.position.set(ox,0,oz); ms.castShadow=cast; ms.receiveShadow=true; scene.add(ms); } parts.clear(); } }; }
  const ctex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; };
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), CY=(a,b,h,n=12)=>new THREE.CylinderGeometry(a,b,h,n);
  const vc=(parts)=>{ const list=[]; for(const p of parts){ const {g:g0, c, x=0, y=0, z=0, rx=0, ry=0, rz=0, sx=1, sy=1, sz=1}=p; const g=g0.index?g0.toNonIndexed():g0.clone(); if(g.attributes.uv) g.deleteAttribute('uv');
      _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); g.applyMatrix4(_m4.compose(_v.set(x,y,z), _q, _s.set(sx,sy,sz))); const col=new THREE.Color(c), n=g.attributes.position.count, a=new Float32Array(n*3);
      for(let i=0;i<n;i++){ a[i*3]=col.r; a[i*3+1]=col.g; a[i*3+2]=col.b; } g.setAttribute('color', new THREE.Float32BufferAttribute(a,3)); list.push(g); } return mergeGeometries(list,false); };
  const vcMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.5, metalness:.25});
  const M={ white:colorMat(0xf2f4f5,{roughness:.7}), conc:colorMat(0xb9bbbd,{roughness:.9}), dark:colorMat(0x2a2e35,{roughness:.6}), glass:colorMat(0x5d8fb5,{roughness:.12, metalness:.6}),
    red:colorMat(0xc0392b,{roughness:.55}), brick:colorMat(0x9c3b2c,{roughness:.85}), yellow:colorMat(0xf2c94c,{roughness:.8}), roof:colorMat(0xa8442e,{roughness:.75}), steel:colorMat(0xc9ced4,{roughness:.3, metalness:.85}),
    green:colorMat(0x3f8f5a,{roughness:.9, polygonOffset:true, polygonOffsetFactor:-2}), yard:colorMat(0xc8c6c0,{roughness:.95, polygonOffset:true, polygonOffsetFactor:-1}), line:colorMat(0xf4f2ec,{roughness:.8, polygonOffset:true, polygonOffsetFactor:-3}),
    lamp:W.MAT.lamp, wood:W.MAT.wood };
  // mặt tiền: cửa sổ theo tầng vẽ trên canvas đúng tỉ lệ mét (16 px/m)
  function facade(wM, hM, o){ const k=16, w=Math.max(64,Math.round(wM*k)), h=Math.max(64,Math.round(hM*k));
    return ctex(w,h,(g)=>{ g.fillStyle=o.wall; g.fillRect(0,0,w,h); const fl=o.floors, fh=h/fl;
      for(let f=0;f<fl;f++){ const y0=h-(f+1)*fh; if(o.band){ g.fillStyle=o.band; g.fillRect(0,y0+fh*.08,w,fh*.1); }
        if(f===0 && o.ground) continue;
        for(let x=o.margin*k; x<w-o.margin*k-o.win*k*.5; x+=o.step*k){ g.fillStyle=o.frame; g.fillRect(x-2,y0+fh*.28-2,o.win*k+4,fh*.5+4); g.fillStyle=o.glass; g.fillRect(x,y0+fh*.28,o.win*k,fh*.5);
          g.fillStyle='rgba(255,255,255,.25)'; g.fillRect(x+2,y0+fh*.3,o.win*k*.3,fh*.46); g.fillStyle=o.frame; g.fillRect(x+o.win*k/2-1,y0+fh*.28,2,fh*.5); } }
      if(o.ground){ const y0=h-fh; for(let x=o.margin*k; x<w-o.margin*k-o.win*k*.5; x+=o.step*k){ g.fillStyle=o.glass; g.fillRect(x,y0+fh*.15,o.win*k,fh*.85); g.fillStyle=o.frame; g.fillRect(x-2,y0+fh*.15,2,fh*.85); } } }); }
  function facadePlane(tex, x, y, z, w, h, ry){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshStandardMaterial({map:tex, roughness:.6})); m.position.set(x,y,z); m.rotation.y=ry; m.receiveShadow=true; scene.add(m); return m; }
  // tường = đoạn chặn có lời nhắn
  function wallRect(x0,z0,x1,z1,msg, gaps=[]){ const pts=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
    for(let i=0;i<4;i++){ const a=pts[i], b=pts[(i+1)%4]; let segs=[[a,b]];
      for(const g of gaps){ const ns=[]; for(const [p,q] of segs){ if(g.side!==i){ ns.push([p,q]); continue; } const k=Math.abs(q[0]-p[0])>Math.abs(q[1]-p[1])?0:1, lo=Math.min(p[k],q[k]), hi=Math.max(p[k],q[k]);
          if(g.b<=lo || g.a>=hi){ ns.push([p,q]); continue; } const mk=v=>k===0?[v,p[1]]:[p[0],v]; if(g.a>lo) ns.push([mk(lo),mk(g.a)]); if(g.b<hi) ns.push([mk(g.b),mk(hi)]); } segs=ns; }
      for(const [p,q] of segs) if(Math.hypot(q[0]-p[0],q[1]-p[1])>.05) addSeg(p[0],p[1],q[0],q[1],.12,undefined,undefined,msg); } }
  const label=(t,s,o)=>makeLabel(t, s, Object.assign({h:.5, fade:45}, o));

  /* ---------- người (chỉ chạy khi bạn ở gần) ---------- */
  const NPC=[];
  function person(seed, outfit, name, dot, h){ if(!W.people) return null; const k=W.people.kit(seed,{outfit, h}); const a=makeActor(k.gl,{name, height:k.h, face:0, clips:k.clips, compact:false, dot:dot||'#9fd36a'});
    if(k.look && k.look.width){ a.root.scale.x*=k.look.width; a.root.scale.z*=k.look.width; } if(LOW) a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
    a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a); const anchor=new THREE.Object3D(); anchor.position.y=k.h+.75; a.g.add(anchor);
    const o={a, po, h:k.h, anchor, x:0, z:0, hd:0, bubble:null, bubbleT:0, col:{x:1e9, z:1e9, r:.3, owner:true}}; circles.push(o.col); NPC.push(o); return o; }
  const say=(o,t,sec=3)=>{ if(!o) return; if(o.bubble) removeLabel(o.bubble); o.bubble=makeLabel(t, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:30}); o.bubbleT=sec; };
  const put=(o,y=0)=>{ o.a.g.position.set(o.x,y,o.z); o.a.g.rotation.set(0,o.hd,0); o.col.x=o.x; o.col.z=o.z; };
  const sM=s=>W.people.pickSeed(L=>!L.female,s), sF=s=>W.people.pickSeed(L=>L.female,s);

  /* ============================== 1. BỆNH VIỆN ĐA KHOA QC CITY ============================== */
  const H={x0:215.5, x1:260.5, z0:223, z1:249, h:15.6, door:{x:238, z:221.4}};
  { const K=Kit(238,236), {x0,x1,z0,z1,h}=H, cx=(x0+x1)/2, cz=(z0+z1)/2, w=x1-x0, d=z1-z0;
    K.add(B(w,h,d), M.white, cx,h/2,cz); K.add(B(w+.4,.5,d+.4), M.conc, cx,h+.25,cz); K.add(B(w+.3,.4,d+.3), M.conc, cx,.2,cz);
    const ft={wall:'#eef1f3', glass:'#4f7fa6', frame:'#d9dee2', band:'#2f80c0', floors:4, win:2.1, step:3.2, margin:1.2, ground:true};
    facadePlane(facade(w,h,ft), cx,h/2,z0-.03, w,h, Math.PI); facadePlane(facade(w,h,ft), cx,h/2,z1+.03, w,h, 0);
    facadePlane(facade(d,h,ft), x0-.03,h/2,cz, d,h, -Math.PI/2); facadePlane(facade(d,h,ft), x1+.03,h/2,cz, d,h, Math.PI/2);
    // sảnh: mái che + cột + cửa kính
    K.add(B(11,.35,4.6), M.white, cx,3.6,z0-2.3); for(const sx of [-1,1]) for(const dz of [-4.2,-.4]){ K.add(CY(.18,.18,3.5), M.steel, cx+sx*5.1,1.75,z0+dz); circles.push({x:cx+sx*5.1, z:z0+dz, r:.22}); }
    K.add(B(5,3.0,.08), M.glass, cx,1.5,z0-.06);
    // biển + chữ thập đỏ
    const sT=ctex(1024,160,(g,w2,h2)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,w2,h2); g.fillStyle='#d62828'; g.fillRect(28,40,80,80); g.fillStyle='#fff'; g.fillRect(56,48,24,64); g.fillRect(36,68,64,24);
      g.fillStyle='#1d3557'; g.font='800 64px "Segoe UI",sans-serif'; g.textAlign='left'; g.textBaseline='middle'; g.fillText('BỆNH VIỆN ĐA KHOA QC CITY',136,h2/2+2); });
    facadePlane(sT, cx,h-1.6,z0-.12, 15,2.3, Math.PI);
    const cT=ctex(256,256,(g,w2,h2)=>{ g.fillStyle='#fff'; g.beginPath(); g.arc(128,128,124,0,7); g.fill(); g.fillStyle='#d62828'; g.fillRect(96,36,64,184); g.fillRect(36,96,184,64); });
    const cross=facadePlane(cT, x1-3.2,h+2.2,z0+.4, 3.2,3.2, Math.PI); cross.material.transparent=true; cross.material.alphaTest=.5; cross.material.emissive=new THREE.Color(0xff3030); cross.material.emissiveMap=cT; cross.material.emissiveIntensity=.2;
    K.add(B(.2,3.6,.2), M.steel, x1-3.2,h+.6,z0+.5); out.hospCross=cross;
    // lối cấp cứu phía Tây
    const eT=ctex(512,128,(g,w2,h2)=>{ g.fillStyle='#d62828'; g.fillRect(0,0,w2,h2); g.fillStyle='#fff'; g.font='900 64px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('CẤP CỨU 24/7',w2/2,h2/2+2); });
    facadePlane(eT, x0-.1,4.4,cz+4, 5,1.25, -Math.PI/2); K.add(B(3.2,.3,5), M.white, x0-1.6,3.4,cz+4); K.add(B(.1,3.0,3.2), M.glass, x0-.08,1.5,cz+4);
    // bãi đáp trực thăng trên mái
    const hT=ctex(256,256,(g,w2,h2)=>{ g.fillStyle='#3b3f46'; g.fillRect(0,0,w2,h2); g.strokeStyle='#ffd23f'; g.lineWidth=10; g.beginPath(); g.arc(128,128,108,0,7); g.stroke(); g.fillStyle='#fff'; g.font='900 150px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('H',128,136); });
    const hp=new THREE.Mesh(new THREE.CircleGeometry(6,40), new THREE.MeshStandardMaterial({map:hT, roughness:.8})); hp.rotation.x=-Math.PI/2; hp.position.set(cx-6,h+.52,cz); scene.add(hp);
    for(let i=0;i<8;i++){ const a=i/8*TAU; GLOW.add(cx-6+Math.cos(a)*6.3,h+.6,cz+Math.sin(a)*6.3,.8,0x6fd3ff,.7); }
    // sân trước: làn đón bệnh nhân + bồn cây
    K.add(B(w,.06,7.2), M.conc, cx,.03,z0-3.7);
    for(const x of [x0+3,x1-3]){ K.add(B(3.2,.5,1.2), M.conc, x,.25,z0-6.2); tree('shade', x, z0-6.2, .9); }
    wallRect(x0,z0,x1,z1,'🏥 Tường bệnh viện – vào sảnh chính (cửa giữa phía Bắc) hoặc lối Cấp cứu phía Tây nhé!');
    K.build();
    label('🏥 Bệnh viện Đa khoa QC City', 'Khám bệnh · cấp cứu 24/7 · bãi đáp trực thăng', {x:cx, y:h+4.6, z:z0, fade:140, h:.7});
    INTER.push({x:H.door.x, z:H.door.z-1.2, r:1.8, prio:.6, label:'🏥 Khám sức khoẻ tổng quát (E · 30 💰)', action:()=>askPay(30,'🏥 Khám sức khoẻ tổng quát tại Bệnh viện Đa khoa QC City',()=>{ if(!spend(30)) return; S.buffs=S.buffs||{}; S.buffs.energy=Math.max(Date.now(), S.buffs.energy||0)+15*60000; save();
      toast('🩺 Bác sĩ: "Sức khoẻ tốt! Nhớ ngủ đủ giấc, bớt thức khuya fix bug nha" – +15 phút chạy nhanh ⚡', 4200); say(out.nurse, 'Chúc bạn luôn khoẻ mạnh! 💙', 3); })});
    INTER.push({x:x0-2.2, z:cz+4, r:1.6, prio:.5, label:'🚑 Lối Cấp cứu (E)', action:()=>toast('🚑 Khoa Cấp cứu trực 24/7 – gọi xe cứu thương: 115 (trong QC World chỉ để tham quan 😊)', 3400)});
  }
  // xe cứu thương đậu ở sân trước
  { const amb=vc([{g:B(2.1,1.9,5.6), c:0xf7f7f5, y:1.35}, {g:B(2.12,.42,5.62), c:0xd62828, y:1.2}, {g:B(2.0,.9,1.2), c:0x2a2e35, y:1.75, z:2.3}, {g:B(1.6,.18,.5), c:0x3a7bd5, y:2.4, z:1.9},
      {g:B(.5,.5,.06), c:0xd62828, y:1.95, z:-2.83}, ...[[-.95,1.8],[.95,1.8],[-.95,-1.8],[.95,-1.8]].map(([x,z])=>({g:CY(.42,.42,.3,16), c:0x1b1d21, x, y:.42, z, rz:Math.PI/2}))]);
    for(const [x,z] of [[223.5,218.0],[252.5,218.0]]){ const m=new THREE.Mesh(amb, vcMat); m.position.set(x,0,z); m.rotation.y=Math.PI/2; m.castShadow=true; m.receiveShadow=true; scene.add(m); boxes.push({x0:x-2.9, x1:x+2.9, z0:z-1.15, z1:z+1.15}); GLOW.add(x+1.9,2.4,z,1.2,0x3a7bd5,.8); } }

  /* ============================== 2. TRẠM CỨU HOẢ (3 gara mở ra đường z = 290, xe đậu bên trong) ============================== */
  const F={x0:220, x1:252, z0:255, z1:274.5, h:9.2, bh:5.0, bays:[225.5,236,246.5], bw:5.2};
  { const K=Kit(236,265), {x0,x1,z0,z1,h,bh,bays,bw}=F, cx=(x0+x1)/2, cz=(z0+z1)/2, w=x1-x0, d=z1-z0, t=.4;
    const brT=ctex(512,256,(g,w2,h2)=>{ g.fillStyle='#7d2d22'; g.fillRect(0,0,w2,h2); for(let r=0;r<16;r++) for(let c=-1;c<17;c++){ const k=.82+rng()*.3; g.fillStyle=`rgb(${168*k|0},${62*k|0},${46*k|0})`; g.fillRect(c*32+(r%2)*16+1,r*16+1,30,14); } });
    brT.wrapS=brT.wrapT=THREE.RepeatWrapping; brT.repeat.set(4,2); const brick=new THREE.MeshStandardMaterial({map:brT, roughness:.85});
    K.add(B(w,h,t), brick, cx,h/2,z0+t/2); K.add(B(t,h,d), brick, x0+t/2,h/2,cz); K.add(B(t,h,d), brick, x1-t/2,h/2,cz);
    // mặt trước: trụ giữa các gara + dầm trên + tầng 2
    const edges=[x0, ...bays.flatMap(b=>[b-bw/2,b+bw/2]), x1]; for(let i=0;i<edges.length;i+=2){ const a=edges[i], b=edges[i+1]; if(b-a<.05) continue; K.add(B(b-a,bh,.5), brick, (a+b)/2,bh/2,z1-.25); boxes.push({x0:a, x1:b, z0:z1-.5, z1}); }
    K.add(B(w,h-bh,.5), brick, cx,bh+(h-bh)/2,z1-.25); K.add(B(w-2*t,.3,d-t), M.conc, cx,bh+.15,cz+t/2); K.add(B(w+.6,.45,d+.6), M.dark, cx,h+.22,cz);
    K.add(B(w-2*t,.06,d-t), M.conc, cx,.03,cz+t/2);   // sàn gara
    for(const b of bays){ K.add(B(bw+.2,.25,.6), M.white, b,bh+.1,z1-.2); K.add(B(bw,.6,.12), colorMat(0xe0e0e0,{roughness:.5, metalness:.4}), b,bh-.35,z1-.55);   // cửa cuốn kéo lên hết
      for(let i=0;i<5;i++) K.add(B(.18,.02,1.3), M.line, b-1.6+i*.8,.07,z1+1.2); }
    const ft={wall:'rgba(0,0,0,0)', glass:'#35546e', frame:'#e8e2d6', floors:1, win:1.6, step:3.0, margin:1.0};
    const winT=facade(w,h-bh,ft); const wp=facadePlane(winT, cx,bh+(h-bh)/2-.6,z1+.02, w,h-bh, 0); wp.material.transparent=true;
    const sT=ctex(1024,140,(g,w2,h2)=>{ g.fillStyle='#b71c1c'; g.fillRect(0,0,w2,h2); g.strokeStyle='#ffd23f'; g.lineWidth=6; g.strokeRect(6,6,w2-12,h2-12); g.fillStyle='#fff'; g.font='900 56px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🚒 TRẠM CỨU HOẢ QC CITY · 114',w2/2,h2/2+2,w2-40); });
    facadePlane(sT, cx,h-.82,z1+.04, 12,1.62, 0);
    const nT=n=>ctex(128,128,(g,w2,h2)=>{ g.fillStyle='#fff'; g.beginPath(); g.arc(64,64,60,0,7); g.fill(); g.fillStyle='#b71c1c'; g.font='900 84px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(String(n),64,70); });
    bays.forEach((b,i)=>{ const m=facadePlane(nT(i+1), b,bh+.85,z1+.04, .9,.9, 0); m.material.transparent=true; m.material.alphaTest=.5; GLOW.add(b+bw/2-.3,bh+.4,z1+.3,.9,0xff3020,.9); });
    // tháp phơi vòi (phía Tây)
    K.add(B(3.2,15.5,3.2), brick, x0-1.7,7.75,z0+2.0); K.add(B(3.8,.5,3.8), M.dark, x0-1.7,15.75,z0+2.0); K.add(new THREE.ConeGeometry(2.6,1.6,4), M.dark, x0-1.7,16.8,z0+2.0, Math.PI/4);
    for(let y=3;y<14;y+=3.4) K.add(B(1.2,1.4,.08), M.glass, x0-1.7,y,z0+3.62);
    wallRect(x0-3.3,z0+.4,x0,z0+3.6,'🚒 Tháp phơi vòi – đi vòng nhé!');
    // tường chặn: sau + 2 bên (mặt trước chỉ chặn ở trụ – gara mở, đi vào xem xe được)
    addSeg(x0,z0,x1,z0,.12,undefined,undefined,'🚒 Tường sau trạm cứu hoả – vào xem xe qua cửa gara phía Nam (đường z = 290)');
    for(const x of [x0,x1]) addSeg(x,z0,x,z1,.12,undefined,undefined,'🚒 Tường trạm cứu hoả – vào xem xe qua cửa gara phía Nam');
    K.build();
    label('🚒 Trạm cứu hoả QC City', '3 xe chữa cháy trực 24/7 · vào gara xem xe (E)', {x:cx, y:h+3.2, z:z1, fade:120, h:.65});
  }
  // xe cứu hoả (2 xe bồn + 1 xe thang) đậu trong gara, đầu xe quay ra cửa
  { const truck=(ladder)=>vc([{g:B(2.5,.5,8.6), c:0x2a2e35, y:.75}, {g:B(2.5,2.4,2.4), c:0xc8102e, y:1.95, z:3.0}, {g:B(2.42,.9,2.3), c:0x1d2b3a, y:2.45, z:3.08}, {g:B(2.5,2.0,5.8), c:0xc8102e, y:2.0, z:-1.3},
      {g:B(2.52,.22,8.62), c:0xf4f2ec, y:1.35}, {g:B(2.52,.12,8.62), c:0xffd23f, y:1.05}, ...[-2.8,-1.3,.2].map(z=>({g:B(2.54,1.3,1.2), c:0xa50d24, y:2.2, z})),
      {g:B(1.6,.18,.4), c:0x3a7bd5, y:3.25, z:3.6}, {g:B(2.4,.22,.3), c:0xc9ced4, y:.75, z:4.35},
      ...(ladder?[{g:B(.5,.2,8.2), c:0xc9ced4, y:3.35, z:-.4, rx:.02},{g:B(1.3,.08,7.6), c:0xdfe3e6, y:3.2, z:-.6},{g:CY(.35,.35,.5,10), c:0x8a8f96, y:3.15, z:-3.6}]:[{g:CY(.32,.32,1.6,10), c:0xdfe3e6, y:3.25, z:-1.6, rx:Math.PI/2},{g:B(2.3,.14,5.4), c:0x8a8f96, y:3.05, z:-1.3}]),
      ...[[-1.15,3.1],[1.15,3.1],[-1.15,-1.4],[1.15,-1.4],[-1.15,-2.9],[1.15,-2.9]].map(([x,z])=>({g:CY(.52,.52,.42,18), c:0x1b1d21, x, y:.52, z, rz:Math.PI/2}))]);
    const g1=truck(false), g2=truck(true);
    F.bays.forEach((b,i)=>{ const m=new THREE.Mesh(i===1?g2:g1, vcMat); const z=F.z1-5.3; m.position.set(b,0,z); m.castShadow=true; m.receiveShadow=true; scene.add(m);
      boxes.push({x0:b-1.3, x1:b+1.3, z0:z-4.4, z1:z+4.45}); GLOW.add(b-.55,3.38,z+3.6,.7,0xff2a2a,.8); GLOW.add(b+.55,3.38,z+3.6,.7,0x3a7bd5,.8); });
    INTER.push({x:F.bays[1], z:F.z1+1.6, r:2.2, prio:.6, label:'🚒 Tham quan trạm cứu hoả (E)', action:openFire});
  }
  function openFire(){ const m=ui.modal('🚒 Trạm cứu hoả QC City · số khẩn cấp 114');
    m.body.innerHTML=`<p class="muted">Trực 24/7 – 3 xe chữa cháy luôn sẵn sàng xuất phát trong 60 giây.</p><div class="grid">${[
      ['🚒','Xe bồn số 1','Bồn nước 4.000 lít, vòi rồng áp lực cao.'],['🪜','Xe thang số 2','Thang tự động vươn cao 32 m – cứu hộ nhà cao tầng Downtown.'],['🚒','Xe bồn số 3','Bồn bọt chữa cháy xăng dầu.'],
      ['🧯','Mẹo an toàn','Thấy cháy: bình tĩnh, ngắt điện, gọi 114, thoát theo lối thoát hiểm – không đi thang máy.']].map(([i,n,d])=>`<div class="card"><div class="ic">${i}</div><b>${n}</b><small>${d}</small></div>`).join('')}</div>`;
    say(out.fireman, pick(['Chào bạn! Muốn ngồi thử ghế lái không? 😄','Xe nào cũng rửa sạch bóng mỗi sáng đó!','Phòng cháy hơn chữa cháy nha bạn! 🧯']), 3.2); }

  /* ============================== 3. TRƯỜNG TIỂU HỌC QC CITY (sân trường phía Bắc, dãy lớp 3 tầng phía Nam) ============================== */
  const SC={x0:214.6, x1:261.6, z0:305.6, z1:364.4, b:{x0:218, x1:258, z0:350, z1:362.6, h:11.4}, gateN:[233,239], gateW:[329,335]};
  { const K=Kit(238,335), {x0,x1,z0,z1,b}=SC, cx=(x0+x1)/2;
    K.add(B(x1-x0-.6,.05,b.z0-z0-.6), M.yard, cx,.035,(z0+b.z0)/2);
    // tường rào: chân tường + song sắt
    const fenceRun=(ax,az,bx,bz)=>{ const L=Math.hypot(bx-ax,bz-az); if(L<.1) return; const mx=(ax+bx)/2, mz=(az+bz)/2, ry=Math.atan2(bx-ax,bz-az);
      K.add(B(.3,.6,L), M.yellow, mx,.3,mz, ry); K.add(B(.08,.08,L), M.dark, mx,1.75,mz, ry); for(let s=0;s<=L;s+=.25){ const k=s/L; K.add(B(.035,1.2,.035), M.dark, ax+(bx-ax)*k,1.2,az+(bz-az)*k); } };
    const [ga,gb]=SC.gateN, [wa,wb]=SC.gateW;
    fenceRun(x0,z0,ga,z0); fenceRun(gb,z0,x1,z0); fenceRun(x1,z0,x1,z1); fenceRun(x1,z1,x0,z1); fenceRun(x0,z1,x0,wb); fenceRun(x0,wa,x0,z0);
    const MSG='🏫 Tường rào trường học – vào bằng cổng chính (phía Bắc) hoặc cổng phụ (phía Tây)';
    wallRect(x0,z0,x1,z1,MSG,[{side:0,a:ga,b:gb},{side:3,a:wa,b:wb}]);
    for(const x of [ga,gb]){ K.add(B(.7,2.6,.7), M.yellow, x,1.3,z0); K.add(B(.9,.2,.9), M.roof, x,2.7,z0); }
    const gT=ctex(1024,150,(g,w2,h2)=>{ g.fillStyle='#1d4e89'; g.fillRect(0,0,w2,h2); g.fillStyle='#ffd23f'; g.font='900 64px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('🏫 TRƯỜNG TIỂU HỌC QC CITY',w2/2,h2/2+2); });
    const gp=facadePlane(gT, (ga+gb)/2,3.25,z0-.02, gb-ga+.9,.95, Math.PI); K.add(B(gb-ga+1.1,.12,.2), M.dark, (ga+gb)/2,3.78,z0);
    // dãy lớp học 3 tầng + hành lang + mái ngói
    const bw=b.x1-b.x0, bd=b.z1-b.z0, bcx=(b.x0+b.x1)/2, bcz=(b.z0+b.z1)/2;
    K.add(B(bw,b.h,bd), M.yellow, bcx,b.h/2,bcz); { const rg=new THREE.ConeGeometry(1,1,4,1); rg.rotateY(Math.PI/4); K.add(rg, M.roof, bcx,b.h+1.6,bcz, 0,0,0, bw*.74,3.2,(bd+2)*.74); }   // mái ngói 4 mái
    const ft={wall:'#f2c94c', glass:'#5b7f9b', frame:'#ffffff', band:'#e0a82e', floors:3, win:1.6, step:3.3, margin:1.4};
    facadePlane(facade(bw,b.h,ft), bcx,b.h/2,b.z0-.03, bw,b.h, Math.PI); facadePlane(facade(bw,b.h,ft), bcx,b.h/2,b.z1+.03, bw,b.h, 0);
    for(const f of [1,2,3]){ const y=f*3.8; K.add(B(bw,.22,1.8), M.white, bcx,y-.11,b.z0-.9); if(f<3){ K.add(B(bw,.9,.1), M.white, bcx,y+.45,b.z0-1.78); } }
    for(let x=b.x0+.2;x<=b.x1;x+=4.4) K.add(B(.3,b.h,.3), M.white, x,b.h/2,b.z0-1.65);
    K.add(B(6,b.h+2.2,2.6), M.white, bcx,(b.h+2.2)/2,b.z0-1.3);   // khối sảnh giữa có đồng hồ
    const ckT=ctex(256,256,(g,w2,h2)=>{ g.fillStyle='#fff'; g.beginPath(); g.arc(128,128,120,0,7); g.fill(); g.strokeStyle='#1d3557'; g.lineWidth=10; g.stroke(); for(let i=0;i<12;i++){ const a=i/12*TAU; g.fillStyle='#1d3557'; g.fillRect(128+Math.cos(a)*96-5,128+Math.sin(a)*96-5,10,10); } g.lineWidth=9; g.beginPath(); g.moveTo(128,128); g.lineTo(128,58); g.moveTo(128,128); g.lineTo(178,150); g.stroke(); });
    const ck=facadePlane(ckT, bcx,b.h+.6,b.z0-2.63, 2.2,2.2, Math.PI); ck.material.transparent=true; ck.material.alphaTest=.5;
    wallRect(b.x0,b.z0-2.6,b.x1,b.z1,'🏫 Dãy lớp học – giờ này học sinh đang trong lớp, mình ngắm từ sân trường nhé!');
    // sân bóng rổ + 2 rổ · cột cờ trường · ghế đá · bồn cây
    const C={x0:241, x1:257, z0:312, z1:328};
    K.add(B(C.x1-C.x0,.03,C.z1-C.z0), M.green, (C.x0+C.x1)/2,.055,(C.z0+C.z1)/2);
    const ln=(ax,az,bx,bz)=>K.add(B(Math.max(.08,Math.abs(bx-ax)),.01,Math.max(.08,Math.abs(bz-az))), M.line, (ax+bx)/2,.075,(az+bz)/2);
    ln(C.x0,C.z0,C.x1,C.z0); ln(C.x0,C.z1,C.x1,C.z1); ln(C.x0,C.z0,C.x0,C.z1); ln(C.x1,C.z0,C.x1,C.z1); ln(C.x0,(C.z0+C.z1)/2,C.x1,(C.z0+C.z1)/2);
    for(const [z,s] of [[C.z0+.6,1],[C.z1-.6,-1]]){ const x=(C.x0+C.x1)/2; K.add(CY(.08,.1,3.4), M.dark, x,1.7,z-s*.4); K.add(B(1.8,1.05,.06), M.white, x,3.3,z); K.add(new THREE.TorusGeometry(.23,.02,6,16), colorMat(0xff6b1a,{roughness:.5}), x,3.05,z+s*.3, 0,Math.PI/2); circles.push({x, z:z-s*.4, r:.14}); }
    out.hoop={x:(C.x0+C.x1)/2, z:C.z1-.3, y:3.05};
    { const fx=236, fz=316; K.add(CY(.06,.08,9), M.steel, fx,4.5,fz); K.add(CY(.5,.6,.3), M.conc, fx,.15,fz); circles.push({x:fx, z:fz, r:.55});
      const flT=ctex(192,128,(g,w2,h2)=>{ g.fillStyle='#1d4e89'; g.fillRect(0,0,w2,h2); g.fillStyle='#ffd23f'; g.font='900 64px "Segoe UI Emoji","Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('📘',w2/2,h2/2+4); });
      const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.2,8,1), new THREE.MeshStandardMaterial({map:flT, side:THREE.DoubleSide, roughness:.7})); flag.position.set(fx+.95,8.2,fz); flag.userData.dynamic=true; scene.add(flag); out.flag=flag; }
    for(const [x,z] of [[222.5,318],[222.5,334],[230,344],[248,344]]){ K.add(B(2.2,.45,2.2), M.conc, x,.22,z); tree(rng()<.5?'shade':'flame', x, z, 1.05); boxes.push({x0:x-1.1, x1:x+1.1, z0:z-1.1, z1:z+1.1}); }
    for(const [x,z] of [[226.2,318],[226.2,334]]){ K.add(B(1.8,.09,.48), M.conc, x,.45,z); for(const s of [-1,1]) K.add(B(.26,.4,.42), M.conc, x+s*.66,.2,z); boxes.push({x0:x-.9, x1:x+.9, z0:z-.25, z1:z+.25}); if(W.addSeat) for(const s of [-1,1]) W.addSeat({x:x+s*.45, z, rot:Math.PI/2, y:.49, floor:.02, label:'🪑 Ngồi ghế đá sân trường (E · C)'}); }
    K.build();
    label('🏫 Trường Tiểu học QC City', 'Sân trường · bóng rổ · bảng tin (E ở cổng chính)', {x:bcx, y:b.h+5.2, z:b.z0-1.3, fade:120, h:.65});
    INTER.push({x:(ga+gb)/2, z:z0-1.2, r:2, prio:.5, label:'🏫 Xem bảng tin trường (E)', action:openSchool});
  }
  function openSchool(){ const m=ui.modal('🏫 Trường Tiểu học QC City · bảng tin');
    m.body.innerHTML=`<p class="muted">"Học để hiểu – hỏi để biết – thử để chắc" 📘</p><div class="grid">${[
      ['🕖','Giờ học','Sáng 7:00 – 11:00 · chiều 13:30 – 16:30.'],['🏀','CLB bóng rổ','Chiều thứ 3, 5 ở sân trường – các bạn lớp 4, 5 đang tập.'],
      ['🧪','Ngày hội "Bé làm kiểm thử"','Các bé tìm lỗi trong truyện tranh – ai tìm nhiều lỗi nhất được tặng kính lúp 🔎'],['🚸','An toàn giao thông','Qua đường ở vạch kẻ, chờ đèn xanh cho người đi bộ.']].map(([i,n,d])=>`<div class="card"><div class="ic">${i}</div><b>${n}</b><small>${d}</small></div>`).join('')}</div>`; }

  /* ============================== 4. NGƯỜI: y tá · lính cứu hoả · 2 bạn nhỏ chơi bóng rổ ============================== */
  out.nurse=person(sF(901), {shirt:0xffffff, pants:0xffffff, shoe:0xffffff}, '👩‍⚕️ Chị Lan · điều dưỡng', '#6fd3ff'); if(out.nurse){ out.nurse.x=H.door.x+2.4; out.nurse.z=H.door.z-.6; out.nurse.hd=Math.PI; }
  out.fireman=person(sM(902), {shirt:0x2a2f3a, pants:0x2a2f3a, shoe:0x111111, style:'cap'}, '👨‍🚒 Anh Hùng · lính cứu hoả', '#ff6b4a'); if(out.fireman){ out.fireman.x=F.bays[0]+2.9; out.fireman.z=F.z1-2.2; out.fireman.hd=0; }
  const ballers=[0,1].map(i=>{ const o=person(i?sF(904):sM(903), {shirt:i?0xff8fc2:0x4fc3ff, pants:0x1d1f24, shoe:0xffffff}, i?'👧 Bé Mai · bóng rổ':'👦 Bé Khang · bóng rổ', '#ffd23f', 1.25); if(o){ o.x=out.hoop.x+(i?1.6:-1.4); o.z=out.hoop.z-3.4-i*.8; o.hd=0; } return o; }).filter(Boolean);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.12,14,10), colorMat(0xe0662a,{roughness:.6})); ball.userData.dynamic=true; scene.add(ball);
  let shotT=0, shooter=0; const LINES={nurse:['Mời bạn vào khám, hôm nay ít người lắm! 💙','Nhớ uống đủ nước nha!'], fire:['Xe luôn sẵn sàng trong 60 giây! 🚒','Phòng cháy hơn chữa cháy nha bạn!'], kid:['Vào rồi! 🏀','Hụt mất tiêu 😅','Tới lượt bạn ném nè!']};

  /* ---------- khung hình: chỉ chạy khi bạn ở gần khu công cộng ---------- */
  let active=false, nearT=0;
  const setActive=on=>{ active=on; for(const o of NPC){ o.a.g.visible=on; if(!on){ o.col.x=1e9; if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } } } ball.visible=on; };
  setActive(false);
  HOOK.onFrame.push((dt,T)=>{
    if(out.flag){ const p=out.flag.geometry.attributes.position; if(!out.flag.userData.base) out.flag.userData.base=Float32Array.from(p.array); const bs=out.flag.userData.base; if(active){ for(let i=0;i<p.count;i++){ const x=bs[i*3]; p.setZ(i, Math.sin(T*3+x*2.2)*.12*(x+.9)); } p.needsUpdate=true; } }
    if(out.hospCross) out.hospCross.material.emissiveIntensity=.15+night()*1.4;
    nearT-=dt; if(nearT<=0){ nearT=.5; const d=W.inside?1e9:Math.hypot(Math.max(209-P.x,0,P.x-263), Math.max(212-P.z,0,P.z-368)); if(!active && d<40) setActive(true); else if(active && d>55) setActive(false); }
    if(!active) return; dt=Math.min(dt,.1);
    for(const o of NPC){ if(o.bubble){ o.bubbleT-=dt; if(o.bubbleT<=0){ removeLabel(o.bubble); o.bubble=null; } } }
    if(out.nurse){ const o=out.nurse; o.a.play('idle'); put(o); o.a.mixer.update(dt); if(((T*.15)%8)<1.6) o.po.apply('present',T); if(R()<dt*.015) say(o, pick(LINES.nurse)); }
    if(out.fireman){ const o=out.fireman; o.a.play('idle'); put(o); o.a.mixer.update(dt); if(((T*.12)%7)<2) o.po.apply('cross',T); if(R()<dt*.012) say(o, pick(LINES.fire)); }
    if(ballers.length){ shotT+=dt; const s=ballers[shooter], h=out.hoop, k=Math.min(1,shotT/1.15);
      for(const o of ballers){ o.a.play('idle'); o.hd=Math.atan2(h.x-o.x,h.z-o.z); put(o); o.a.mixer.update(dt); }
      const hx=s.x+Math.sin(s.hd)*.3, hz=s.z+Math.cos(s.hd)*.3; if(k<.3){ s.po.apply('present',T); ball.position.set(hx,1.0+Math.abs(Math.sin(T*9))*.5,hz); }
      else { const u=(k-.3)/.7; ball.position.set(hx+(h.x-hx)*u, 1.7+(h.y+.2-1.7)*u+Math.sin(Math.PI*u)*1.6, hz+(h.z-hz)*u); }
      if(shotT>2.2){ shotT=0; if(R()<.35) say(s, pick(LINES.kid), 1.8); shooter=(shooter+1)%ballers.length; } }
  });
  PLACES.push({icon:'🏥', name:'Bệnh viện Đa khoa QC City', sub:'Phố chính Phường (z 200) · khám sức khoẻ · cấp cứu 24/7 · xe cứu thương', go:()=>teleport(H.door.x, 214.5, H.door.x, H.z0)});
  PLACES.push({icon:'🚒', name:'Trạm cứu hoả QC City', sub:'Đường Bệnh Viện (z 290) · 3 xe cứu hoả trong gara – đi vào xem được', go:()=>teleport(F.bays[1], F.z1+3.4, F.bays[1], F.z0)});
  PLACES.push({icon:'🏫', name:'Trường Tiểu học QC City', sub:'Khối D · sân trường, bóng rổ, cột cờ, dãy lớp 3 tầng', go:()=>teleport((SC.gateN[0]+SC.gateN[1])/2, SC.z0-2.2, 236, 330)});
  try{ const TD=ctx.transit && ctx.transit.TAXI_DEST; if(TD){ TD.push({icon:'🏥', name:'Bệnh viện Đa khoa QC City', x:238, z:200}); TD.push({icon:'🚒', name:'Trạm cứu hoả · Trường Tiểu học', x:236, z:290}); } }catch(e){}
  Object.assign(out, {H, F, SC, NPC, setActive});
  return out;
}
