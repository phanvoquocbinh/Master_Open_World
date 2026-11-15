// QC World – S14: ĐẢO CÔNG VIÊN GIẢI TRÍ "QC WONDERLAND" (ngoài khơi phía Nam, thiết kế riêng của QC World)
//  🚡 CÁP TREO DÀI ~170 m từ bờ Nam đảo Master Dashboard bay qua biển (trụ giữa cao 48 m) – ngắm biển, đảo, thành phố
//  🎢 Tàu lượn siêu tốc "Siêu Bug" (dốc 24 m, xoắn ốc) · 🗼 Tháp rơi tự do 60 m · 🏴‍☠️ Thuyền hải tặc đu 75° · 👻 Nhà ma đi xe xuyên đường hầm tối
//  🎠 Đu quay ngựa gỗ, cổng lâu đài, cờ, đèn, quầy kem, khách bot xếp hàng. Mọi trò: E để lên (vé), camera bám theo cảm giác mạnh.
import { shiftView } from './worldshift.js';
export function makeFunIsland(W, ctx, opt={}){
  W=shiftView(W, opt.dx||0, opt.dz||0);   // V2 (wonder_v2.js): dời cả đảo theo (dx, dz) – V1 không truyền opt → W giữ nguyên
  const CABLE=opt.cable!==false, SH=W.SHIFT, toW=SH ? SH.toW : (v=>v), toL=SH ? SH.toL : (v=>v);   // V2: bỏ cáp treo dài (đảo chính V1 không còn)
  const {askPay, spend, ui} = ctx;
  const {THREE, scene, P, me, HOOK, INTER, PLACES, toast, circles, boxes, addPlat, mergeGeometries, GLOW, teleport, makeLabel, makeActor, cam, EXTL, WATER_Y, edgeR, clamp, lerp} = W;
  const TAU=Math.PI*2, R=Math.random;
  const sm=(c,r=.55,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3(), V3=(x,y,z)=>new THREE.Vector3(x,y,z);
  function Kit(){ const parts=new Map(); return { add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
    addG(g,mat){ if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g.index?g.toNonIndexed():g); },
    build(parent){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=!m.transparent; ms.receiveShadow=true; parent.add(ms); } } }; }
  const ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  const IC={x:61, z:291}, IR=a=>57+4.5*Math.sin(3*a+1)+2.5*Math.sin(7*a+.4), Y=1.7;

  /* ============================== ĐẢO (địa hình) ============================== */
  const FI={x0:-10, x1:132, z0:222, z1:362}, RES=2, NX=Math.round((FI.x1-FI.x0)/RES)+1, NZ=Math.round((FI.z1-FI.z0)/RES)+1, H=new Float32Array(NX*NZ);
  const hf=(x,z)=>{ const d=Math.hypot(x-IC.x,z-IC.z), e=IR(Math.atan2(z-IC.z,x-IC.x)); if(d>e+10) return -6; if(d>e) return lerp(.2,-6,ss(e,e+10,d)); if(d>e-7) return lerp(Y,.25,ss(e-7,e,d)); return Y+Math.sin(x*.21)*Math.cos(z*.17)*.04; };
  for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++) H[j*NX+i]=hf(FI.x0+i*RES, FI.z0+j*RES);
  const hAt=(x,z)=>{ const fx=(x-FI.x0)/RES, fz=(z-FI.z0)/RES; if(fx<0||fz<0||fx>=NX-1||fz>=NZ-1) return null; const i=Math.floor(fx), j=Math.floor(fz), tx=fx-i, tz=fz-j, a=H[j*NX+i], b=H[j*NX+i+1], c=H[(j+1)*NX+i], d=H[(j+1)*NX+i+1]; return tx+tz<=1 ? a+(b-a)*tx+(c-a)*tz : d+(c-d)*(1-tx)+(b-d)*(1-tz); };
  EXTL.push({x0:FI.x0, x1:FI.x1-RES, z0:FI.z0, z1:FI.z1-RES, h:hAt, name:'ĐẢO QC WONDERLAND'});
  { const pos=new Float32Array(NX*NZ*3), col=new Float32Array(NX*NZ*3), c=new THREE.Color(), SAND=new THREE.Color(0xe3cf9f), GR=new THREE.Color(0x6aa84a), PATH=new THREE.Color(0xd9c9a8), PLZ=new THREE.Color(0xcfb9d9);
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const k=j*NX+i, x=FI.x0+i*RES, z=FI.z0+j*RES, h=H[k]; pos[k*3]=x; pos[k*3+1]=h; pos[k*3+2]=z; const d=Math.hypot(x-IC.x,z-IC.z);
      c.copy(GR); if(h<Y-.05) c.copy(SAND); const ring=Math.abs(d-26)<2.2, spoke=[0,1,2,3,4,5].some(s=>{ const a=s*TAU/6+.3, px=Math.cos(a), pz=Math.sin(a), t=(x-IC.x)*px+(z-IC.z)*pz, l=Math.abs((x-IC.x)*pz-(z-IC.z)*px); return t>0 && t<50 && l<1.8; });
      if(d<9) c.copy(PLZ); else if(ring || spoke) c.copy(PATH); col[k*3]=c.r; col[k*3+1]=c.g; col[k*3+2]=c.b; }
    const idx=new Uint32Array((NX-1)*(NZ-1)*6); let q=0; for(let j=0;j<NZ-1;j++) for(let i=0;i<NX-1;i++){ const a=j*NX+i, b=a+1, cc=a+NX, d=cc+1; idx[q++]=a; idx[q++]=cc; idx[q++]=b; idx[q++]=b; idx[q++]=cc; idx[q++]=d; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('color', new THREE.BufferAttribute(col,3)); g.setIndex(new THREE.BufferAttribute(idx,1)); g.computeVertexNormals(); g.computeBoundingSphere();
    const t=new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.95})); t.receiveShadow=true; t.userData.dynamic=true; t.userData.noFar=true; scene.add(t); }
  const k=Kit(), kd=Kit();   // k: tĩnh, kd: nhà ma (tối)
  const M={ white:sm(0xffffff,.5), red:sm(0xe53950,.45), yellow:sm(0xffcf3a,.45), blue:sm(0x2f78e0,.45), purple:sm(0x7a3fd0,.45), green:sm(0x2ea96a,.5), steel:sm(0xc8ced6,.3,.85), dark:sm(0x1c1f26,.5,.3), wood:sm(0x8a5a36,.6), gold:sm(0xffcf6a,.3,1,{emissive:0xffa820, emissiveIntensity:.2}), pink:sm(0xff7ab8,.5), teal:sm(0x18b8b0,.45) };
  const ride={kind:null};   // trò đang chơi (chỉ 1 lúc)
  function startRide(kind, onDrive, opts={}){ ride.kind=kind; me.g.visible=opts.showMe!==false; HOOK.camDist=opts.camDist??null;
    HOOK.vehicle={drive:(dt)=>{ onDrive(dt); }}; }
  function endRide(at){ ride.kind=null; HOOK.vehicle=null; HOOK.vehicleInter=null; HOOK.camOverride=null; HOOK.camDist=null; me.g.visible=true; if(at){ P.x=at.x; P.z=at.z; P.y=W.groundAt(P.x,P.z); P.vx=P.vz=0; me.g.rotation.set(0,P.face,0); } }
  const seatPlayer=(pos, yaw)=>{ P.x=pos.x; P.z=pos.z; P.y=pos.y; P.face=yaw; me.g.position.set(pos.x, pos.y+.04-(me.h||1.75)*.53, pos.z); me.g.rotation.set(0,yaw,0); me.play(me.acts.sit?'sit':'idle'); };
  const AUD={ctx:null}; function audio(){ if(AUD.ctx) return AUD.ctx; if(!(navigator.userActivation && navigator.userActivation.hasBeenActive)) return null; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null; AUD.ctx=new AC(); return AUD.ctx; }
  function whoosh(vol=.25, dur=1.2, f0=400, f1=2400){ const c=audio(); if(!c) return; const n=c.createBuffer(1,c.sampleRate*dur,c.sampleRate), d=n.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; const s=c.createBufferSource(); s.buffer=n; const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.setValueAtTime(f0,c.currentTime); f.frequency.exponentialRampToValueAtTime(f1,c.currentTime+dur); const g=c.createGain(); g.gain.setValueAtTime(0,c.currentTime); g.gain.linearRampToValueAtTime(vol,c.currentTime+.1); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur); s.connect(f); f.connect(g); g.connect(c.destination); s.start(); }
  function boo(){ const c=audio(); if(!c) return; const o=c.createOscillator(), g=c.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(320,c.currentTime); o.frequency.exponentialRampToValueAtTime(70,c.currentTime+.9); g.gain.setValueAtTime(.18,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+1); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+1); whoosh(.15,.6,1500,300); }
  const pay=(price,what,fn)=>askPay(price, what, ()=>{ if(!spend(price)) return; fn(); });

  /* ============================== 🚡 CÁP TREO DÀI ============================== */
  const aA=Math.atan2(84,6), eA=edgeR(aA);
  const SA={x:Math.cos(aA)*(eA+9), z:Math.sin(aA)*(eA+9)}, SB={x:54, z:239};   // ga đảo chính (trên cầu tàu) · ga đảo giải trí
  const TWR={x:(SA.x+SB.x)/2, z:(SA.z+SB.z)/2, h:48}, CAB=[];
  const lineDir=[SB.x-SA.x, SB.z-SA.z], LL=Math.hypot(...lineDir), ux=lineDir[0]/LL, uz=lineDir[1]/LL, lat=[-uz, ux];
  const cabY=u=>{ const a=2.6, top=TWR.h-4; return a+(top-a)*Math.pow(Math.sin(Math.PI*u),.85); };
  if(CABLE){ // ga 2 đầu: sàn + mái + cột, cầu tàu nối bờ đảo chính
    for(const [S,face] of [[SA,Math.atan2(ux,uz)],[SB,Math.atan2(-ux,-uz)]]){ k.add(new THREE.BoxGeometry(12,.4,10), M.white, S.x,1.0,S.z, 0,face,0); k.add(new THREE.BoxGeometry(13,.4,11), M.teal, S.x,7.2,S.z, 0,face,0); addPlat(S.x,S.z,face,6,5,1.2);
      for(const sx of [-1,1]) for(const sz of [-1,1]){ const c=Math.cos(face), s=Math.sin(face), lx=sx*5.5, lz=sz*4.5, x=S.x+lx*c+lz*s, z=S.z-lx*s+lz*c; k.add(new THREE.CylinderGeometry(.25,.3,7.2,10), M.steel, x,3.6,z); circles.push({x,z,r:.3}); }
      k.add(new THREE.CylinderGeometry(2.2,2.2,.6,24), M.dark, S.x+ux*(S===SA?3:-3),6.4,S.z+uz*(S===SA?3:-3)); }
    // S-GFX (15/11): đầu cầu phía đảo phải nằm NGOÀI chân toà tháp Brand QA – trước bắt đầu ở mép đảo −7 m, lọt vào trong khối toà (hộp va chạm z tới 67,3)
    // → đi thẳng ra cầu bị toà chặn, không lên được ga cáp treo. Lùi đầu cầu ra tới chỗ trống đầu tiên (thường là bệ đá cao .6 m trước toà → bước lên cầu 1,1 m được)
    let r0=eA-7; const hitB=(x,z)=>boxes.some(b=>b.y0===undefined && x>b.x0-.7 && x<b.x1+.7 && z>b.z0-.7 && z<b.z1+.7); while(r0<eA-1.5 && hitB(Math.cos(aA)*r0, Math.sin(aA)*r0)) r0+=.25;
    const p0={x:Math.cos(aA)*r0, z:Math.sin(aA)*r0}, L=Math.hypot(SA.x-p0.x, SA.z-p0.z), mx=(SA.x+p0.x)/2, mz=(SA.z+p0.z)/2, rot=Math.atan2(SA.x-p0.x, SA.z-p0.z);
    k.add(new THREE.BoxGeometry(3,.25,L), M.wood, mx,.95,mz, 0,rot,0); addPlat(mx,mz,rot,1.5,L/2,1.1);
    // bậc gỗ nếu mặt đứng ngay trước đầu cầu thấp hơn sàn cầu quá .6 m (mỗi bậc ≤ .3 m)
    { const ux0=(SA.x-p0.x)/L, uz0=(SA.z-p0.z)/L, gb=W.groundAt?W.groundAt(p0.x-ux0*.8,p0.z-uz0*.8):1.1;
      if(1.1-gb>.6){ const n=Math.ceil((1.1-gb)/.3)-1; for(let j=0;j<n;j++){ const h=1.1-(1.1-gb)*(j+1)/(n+1), d=.3+j*.6, x=p0.x-ux0*d, z=p0.z-uz0*d; k.add(new THREE.BoxGeometry(3,h-gb+.3,.6), M.wood, x,(h+gb-.3)/2,z, 0,rot,0); addPlat(x,z,rot,1.5,.31,h); } } }
    for(let t=0;t<L;t+=3){ const x=p0.x+(SA.x-p0.x)*t/L, z=p0.z+(SA.z-p0.z)*t/L; k.add(new THREE.CylinderGeometry(.12,.12,3,6), M.dark, x-lat[0]*1.4,-.5,z-lat[1]*1.4); k.add(new THREE.CylinderGeometry(.12,.12,3,6), M.dark, x+lat[0]*1.4,-.5,z+lat[1]*1.4); }
    // trụ giữa (trong biển)
    k.add(new THREE.CylinderGeometry(1.6,2.4,TWR.h+6,12), M.steel, TWR.x, TWR.h/2-3, TWR.z); k.add(new THREE.BoxGeometry(10,1.2,1.2), M.steel, TWR.x, TWR.h-1, TWR.z, 0,Math.atan2(lat[0],lat[1]),0);
    // dây cáp (2 sợi, vẽ theo đường cong cabin)
    for(const s of [-3,3]){ const pts=[]; for(let i=0;i<=60;i++){ const u=i/60; pts.push(V3(SA.x+ux*LL*u+lat[0]*s, cabY(u)+2.2, SA.z+uz*LL*u+lat[1]*s)); } k.addG(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),120,.05,4,false), M.dark); }
    makeLabel('🚡 Cáp treo ra Đảo QC Wonderland', 'Vé 15 💰 · bay ~170 m qua biển', {h:.6, x:SA.x, y:9.5, z:SA.z, fade:80}); }
  const cabMat=sm(0xffcf3a,.4), glassM=new THREE.MeshStandardMaterial({color:0x9fd6ff, roughness:.05, metalness:.6, transparent:true, opacity:.35, side:THREE.DoubleSide, depthWrite:false});
  for(let i=0;i<(CABLE?2:0);i++){ const g=new THREE.Group(); g.userData.dynamic=true; scene.add(g); const body=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.2,2.6), glassM); body.position.y=-1.4; g.add(body); const roof=new THREE.Mesh(new THREE.BoxGeometry(2.8,.25,2.8), i?M.red:cabMat); roof.position.y=-.2; g.add(roof); const fl=new THREE.Mesh(new THREE.BoxGeometry(2.8,.2,2.8), i?M.red:cabMat); fl.position.y=-2.55; g.add(fl);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.12,2.2,.12), M.steel); arm.position.y=.9; g.add(arm); CAB.push({g, u:i, side:i?3:-3}); }
  const CC={u:0, dir:1, dwell:8, riding:null};   // cabin 0 đi u: 0→1, cabin 1 ngược lại
  function cabPos(c){ const u=c===CAB[0]?CC.u:1-CC.u; return {x:SA.x+ux*LL*u+lat[0]*c.side, y:cabY(u), z:SA.z+uz*LL*u+lat[1]*c.side}; }
  function updCable(dt){ if(CC.dwell>0){ CC.dwell-=dt; } else { const v=4.2/LL, edge=Math.min(CC.u,1-CC.u)*LL, sp=edge<14?Math.max(.25,edge/14):1; CC.u+=CC.dir*v*sp*dt; if(CC.u>=1||CC.u<=0){ CC.u=clamp(CC.u,0,1); CC.dir*=-1; CC.dwell=9; if(CC.riding) arriveCab(); } }
    for(const c of CAB){ const p=cabPos(c); c.g.position.set(p.x, p.y+2.2, p.z); c.g.rotation.y=Math.atan2(ux,uz); } }
  function cabAtStation(atA){ for(const c of CAB){ const u=c===CAB[0]?CC.u:1-CC.u; if(CC.dwell>0 && (atA?u<.01:u>.99)) return c; } return null; }
  function boardCab(atA){ const c=cabAtStation(atA); if(!c) return toast('🚡 Cabin đang chạy – đợi cabin về ga (~'+Math.ceil(CC.dwell>0?1:(LL/4.2)*(CC.dir>0?1-CC.u:CC.u))+' giây).', 2600);
    pay(15, '🚡 Vé cáp treo ra <b>Đảo QC Wonderland</b>', ()=>{ CC.riding={c, toB:atA}; toast('🚡 Ngồi vững nhé – cabin bay qua biển, kéo chuột để ngắm cảnh!', 3200);
      startRide('cable', ()=>{ const p=cabPos(c); seatPlayer({x:p.x, y:p.y+.2, z:p.z}, Math.atan2(lat[0],lat[1])); if(!W.dragging) cam.yaw+=.004; }, {camDist:10}); }); }
  function arriveCab(){ const r=CC.riding; if(!r) return; const u=r.c===CAB[0]?CC.u:1-CC.u, S=u>.5?SB:SA; CC.riding=null; endRide({x:S.x-ux*(u>.5?-2:2), z:S.z-uz*(u>.5?-2:2)}); toast(u>.5?'🎡 Chào mừng tới Đảo QC Wonderland!':'🏝️ Đã về đảo Master Dashboard.', 2600); }
  if(CABLE) INTER.push({x:SA.x, z:SA.z, r:4, prio:.9, when:()=>!ride.kind, label:'🚡 Cáp treo ra Đảo QC Wonderland – 15 💰 (E)', action:()=>boardCab(true)});
  if(CABLE) INTER.push({x:SB.x, z:SB.z, r:4, prio:.9, when:()=>!ride.kind, label:'🚡 Cáp treo về đảo Master Dashboard – 15 💰 (E)', action:()=>boardCab(false)});

  /* ============================== 🏰 CỔNG + QUẢNG TRƯỜNG + ĐU QUAY NGỰA ============================== */
  { const gx=SB.x+3, gz=SB.z+12; for(const s of [-1,1]){ k.add(new THREE.CylinderGeometry(1.4,1.6,9,12), M.pink, gx+s*5,4.5,gz); k.add(new THREE.ConeGeometry(1.9,3.4,12), M.purple, gx+s*5,10.7,gz); circles.push({x:gx+s*5, z:gz, r:1.7}); }
    k.add(new THREE.BoxGeometry(8.6,1.6,1.4), M.pink, gx,7.6,gz); const t=(()=>{ const c=document.createElement('canvas'); c.width=1024; c.height=128; const g=c.getContext('2d'); g.fillStyle='#7a3fd0'; g.fillRect(0,0,1024,128); g.fillStyle='#ffe27a'; g.font='900 72px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('QC WONDERLAND',512,68); const tx=new THREE.CanvasTexture(c); tx.colorSpace=THREE.SRGBColorSpace; return tx; })();
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(8.4,1.1), new THREE.MeshStandardMaterial({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:.5})); sg.position.set(gx,7.6,gz-.72); sg.rotation.y=Math.PI; scene.add(sg); }
  const carousel=new THREE.Group(); carousel.position.set(IC.x, Y, IC.z); carousel.userData.dynamic=true; scene.add(carousel);
  { const ck=Kit(); ck.add(new THREE.CylinderGeometry(6,6,.4,32), M.white, 0,.2,0); ck.add(new THREE.ConeGeometry(6.6,2.4,24), M.red, 0,5.4,0); ck.add(new THREE.CylinderGeometry(.5,.5,4.4,12), M.gold, 0,2.4,0);
    for(let i=0;i<10;i++){ const a=i/10*TAU, x=Math.cos(a)*4.5, z=Math.sin(a)*4.5; ck.add(new THREE.CylinderGeometry(.05,.05,4,6), M.gold, x,2.3,z); ck.add(new THREE.BoxGeometry(.4,.7,1.2), [M.white,M.pink,M.yellow,M.blue,M.teal][i%5], x,1.3,z, 0,a,0); ck.add(new THREE.BoxGeometry(.3,.5,.3), [M.white,M.pink,M.yellow,M.blue,M.teal][i%5], x+Math.cos(a+Math.PI/2)*.6,1.8,z+Math.sin(a+Math.PI/2)*.6); }
    ck.build(carousel); circles.push({x:IC.x, z:IC.z, r:6.3}); makeLabel('🎠 Đu quay ngựa gỗ', null, {h:.5, x:IC.x, y:Y+8, z:IC.z, fade:60}); }
  // đèn + cờ quanh đảo
  for(let i=0;i<16;i++){ const a=i/16*TAU, r=IR(a)-10, x=IC.x+Math.cos(a)*r, z=IC.z+Math.sin(a)*r; k.add(new THREE.CylinderGeometry(.08,.1,6,6), M.steel, x,Y+3,z); k.add(new THREE.BoxGeometry(.04,.8,1.3), [M.red,M.yellow,M.blue,M.purple][i%4], x,Y+5.4,z+.65); circles.push({x,z,r:.15}); GLOW && GLOW.add(x,Y+6.1,z,2.4,[0xff7ab8,0xffd27a,0x7ab8ff][i%3],1); }

  /* ============================== 🎢 TÀU LƯỢN SIÊU TỐC ============================== */
  const TR_PTS=[[24,262,3.5],[42,262,3.5],[50,265,7],[57,277,25],[58,285,26.5],[54,293,24],[44,303,5],[32,312,14],[22,322,6],[14,313,9],[13,299,11],[19,287,7],[15,275,5],[18,265,3.8]];
  const curve=new THREE.CatmullRomCurve3(TR_PTS.map(([x,z,h])=>V3(x,h+Y,z)), true, 'centripetal'), CL=curve.getLength(), CN=Math.ceil(CL), cPts=curve.getSpacedPoints(CN), cTan=cPts.map((p,i)=>cPts[(i+1)%CN].clone().sub(p).normalize());
  const cAt=s=>{ s=((s%CL)+CL)%CL; const f=s/CL*CN, i=Math.floor(f)%CN, t=f-Math.floor(f); return {p:cPts[i].clone().lerp(cPts[(i+1)%CN],t), t:cTan[i].clone().lerp(cTan[(i+1)%CN],t).normalize()}; };
  const ST0=0, ST1=18*CL/CL, LIFT_END=(()=>{ let best=0, bh=-1; for(let i=0;i<CN*.4;i++){ if(cPts[i].y>bh){ bh=cPts[i].y; best=i; } } return best*CL/CN; })();
  { const up=V3(0,1,0); const rails=[[],[]]; for(let i=0;i<=CN;i++){ const p=cPts[i%CN], t=cTan[i%CN], l=new THREE.Vector3().crossVectors(up,t).normalize(); rails[0].push(p.clone().addScaledVector(l,.55)); rails[1].push(p.clone().addScaledVector(l,-.55)); }
    for(const r of rails) k.addG(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(r,true),CN*2,.09,6,true), M.red);
    for(let i=0;i<CN;i+=1){ const p=cPts[i], t=cTan[i]; const yaw=Math.atan2(t.x,t.z); k.add(new THREE.BoxGeometry(1.3,.08,.18), M.dark, p.x,p.y-.08,p.z, 0,yaw,0); }
    for(let i=0;i<CN;i+=5){ const p=cPts[i]; if(p.y-Y<1.6) continue; k.add(new THREE.CylinderGeometry(.18,.24,p.y-Y,8), M.steel, p.x,(p.y+Y)/2-.1,p.z); circles.push({x:p.x, z:p.z, r:.28}); }
    // ga tàu lượn
    k.add(new THREE.BoxGeometry(18,.5,4), M.white, 33,Y+.9,258.5); addPlat(33,258.5,0,9,2,Y+1.15);
    // S-GFX (15/11): 3 bậc lên sân ga (cao 1,15 m) ở đầu Tây + chặn gầm sân ga (trước đi lọt vào trong khối sân ga)
    for(let j=0;j<3;j++){ const h=Y+.29*(j+1), x=22.5+j*.6; k.add(new THREE.BoxGeometry(.6,h-Y+.65,3), M.white, x,(h+Y-.65)/2,258.5); addPlat(x,258.5,0,.31,1.5,h); }
    boxes.push({x0:24, x1:42, z0:256.5, z1:260.5, y0:Y-2, y1:Y+.75, msg:'🎢 Sân ga tàu lượn – lên bằng bậc ở đầu phía Tây'}); k.add(new THREE.BoxGeometry(19,.3,9), M.purple, 33,Y+5.2,262); for(const x of [24.5,41.5]) for(const z of [258,266]){ k.add(new THREE.CylinderGeometry(.18,.18,4.2,8), M.steel, x,Y+3,z); circles.push({x,z,r:.25}); }
    makeLabel('🎢 Tàu lượn Siêu Bug', 'Vé 25 💰 · dốc 24 m · xoắn ốc', {h:.6, x:33, y:Y+8, z:262, fade:80}); }
  const train=[0,1,2].map(i=>{ const g=new THREE.Group(); g.userData.dynamic=true; scene.add(g); const b=new THREE.Mesh(new THREE.BoxGeometry(1.4,.55,2.1), [M.yellow,M.blue,M.green][i]); b.position.y=.35; g.add(b); const s=new THREE.Mesh(new THREE.BoxGeometry(1.2,.6,.25), M.dark); s.position.set(0,.8,-.7); g.add(s); const nose=new THREE.Mesh(new THREE.BoxGeometry(1.42,.3,.3), M.red); nose.position.set(0,.5,1.05); g.add(nose); return g; });
  const CO={s:ST0+6, v:0, state:'dwell', t:8, riding:false};
  function placeTrain(){ train.forEach((g,i)=>{ const q=cAt(CO.s-i*2.3); g.position.copy(q.p); g.lookAt(toW(q.p.clone().add(q.t))); }); }
  function updCoaster(dt){ const sNorm=((CO.s%CL)+CL)%CL;
    if(CO.state==='dwell'){ CO.t-=dt; CO.v=0; if(CO.t<=0){ CO.state='run'; whoosh(.08,2,200,600); } }
    else { const p=cAt(CO.s), h=p.p.y-Y; let v=CO.v;
      if(sNorm<=12) v=3.2;                                                         // lăn chậm ra khỏi ga
      else if(sNorm<LIFT_END) v=Math.max(v*.98, 3.2);                              // xích kéo lên dốc
      else { const E=3.2*3.2+2*9.81*(cPts[Math.floor(LIFT_END/CL*CN)].y-Y); v=Math.sqrt(Math.max(9, E-2*9.81*h))*.97; }
      if(sNorm>CL-30 || sNorm<6){ const d=sNorm>CL-30?CL-sNorm+6:6-sNorm; v=Math.min(v, Math.max(.3, d*.45)); if(sNorm<6.3 && sNorm>5.4 && CO.v<1.2){ CO.state='dwell'; CO.t=10; CO.s=6; if(CO.riding){ CO.riding=false; endRide({x:33, z:257}); toast('🎢 Phew! Ghê không? 😆', 2400); } } }
      CO.v=lerp(CO.v, v, Math.min(1,dt*3)); CO.s+=CO.v*dt; if(CO.riding && CO.v>14 && !CO.screamed){ CO.screamed=true; whoosh(.3,1.6,600,3000); } if(CO.v<8) CO.screamed=false; }
    placeTrain(); }
  INTER.push({x:33, z:257.4, r:3, prio:.9, when:()=>!ride.kind, label:'🎢 Lên tàu lượn Siêu Bug – 25 💰 (E)', action:()=>{ if(CO.state!=='dwell' || CO.t<2) return toast('🎢 Tàu đang chạy – đợi chuyến sau (~'+Math.ceil(CO.state==='dwell'?CO.t:20)+' giây).', 2200);
    pay(25, '🎢 Vé tàu lượn <b>Siêu Bug</b>', ()=>{ CO.riding=true; CO.t=Math.max(CO.t,3); toast('🎢 Thắt dây an toàn! Giữ chặt nha!', 2600);
      startRide('coaster', ()=>{ const g=train[0], q=cAt(CO.s), seat=q.p.clone().add(V3(0,.75,0)); seatPlayer(seat, Math.atan2(q.t.x,q.t.z)); me.g.quaternion.copy(g.quaternion);
        HOOK.camOverride={pos:seat.clone().addScaledVector(q.t,-3.2).add(V3(0,1.6,0)), look:seat.clone().addScaledVector(q.t,8), k:9}; }, {}); }); }});

  /* ============================== 🗼 THÁP RƠI TỰ DO ============================== */
  const DT={x:100, z:300, h:60, y:3, st:'idle', t:0, riding:false};
  const ringG=new THREE.Group(); ringG.userData.dynamic=true; scene.add(ringG);
  { k.add(new THREE.CylinderGeometry(1.5,1.9,DT.h,16), M.steel, DT.x,Y+DT.h/2,DT.z); k.add(new THREE.CylinderGeometry(2.4,2.4,1.2,16), M.red, DT.x,Y+DT.h+.6,DT.z); circles.push({x:DT.x, z:DT.z, r:4.2});
    for(let i=0;i<5;i++) k.add(new THREE.TorusGeometry(1.75,.06,6,20), M.yellow, DT.x,Y+8+i*10,DT.z, Math.PI/2,0,0);
    const r=new THREE.Mesh(new THREE.TorusGeometry(2.9,.35,10,32), M.purple); r.rotation.x=Math.PI/2; ringG.add(r); for(let i=0;i<12;i++){ const a=i/12*TAU, s=new THREE.Mesh(new THREE.BoxGeometry(.6,.9,.5), M.dark); s.position.set(Math.cos(a)*3.2,.1,Math.sin(a)*3.2); s.rotation.y=-a+Math.PI/2; ringG.add(s); }
    k.add(new THREE.CylinderGeometry(4.6,4.8,.6,24), M.white, DT.x,Y+.3,DT.z); makeLabel('🗼 Tháp rơi tự do 60 m', 'Vé 25 💰', {h:.6, x:DT.x, y:Y+DT.h+4, z:DT.z, fade:150}); GLOW && GLOW.add(DT.x,Y+DT.h+1.4,DT.z,5,0xff4f6d,1); }
  function updDrop(dt){ DT.t+=dt; let y=DT.y;
    if(DT.st==='up'){ y=Math.min(DT.h-4, DT.y+dt*3.2); if(y>=DT.h-4){ DT.st='hold'; DT.t=0; } }
    else if(DT.st==='hold'){ if(DT.t>3.2){ DT.st='fall'; DT.t=0; DT.v=0; whoosh(.35,1.8,2600,300); } }
    else if(DT.st==='fall'){ DT.v=(DT.v||0)+9.81*dt; y=DT.y-DT.v*dt; if(y<16){ DT.st='brake'; } }
    else if(DT.st==='brake'){ DT.v=Math.max(0,(DT.v||0)-26*dt); y=Math.max(3, DT.y-DT.v*dt); if(DT.v<=0||y<=3){ y=3; DT.st='idle'; DT.t=0; if(DT.riding){ DT.riding=false; endRide({x:DT.x+5.4, z:DT.z}); toast('🗼 Tim vẫn còn đập chứ? 😵', 2400); } } }
    DT.y=y; ringG.position.set(DT.x, Y+y, DT.z); }
  INTER.push({x:DT.x+5.2, z:DT.z, r:3, prio:.9, when:()=>!ride.kind, label:'🗼 Chơi tháp rơi tự do 60 m – 25 💰 (E)', action:()=>{ if(DT.st!=='idle') return toast('🗼 Đợi lượt sau nhé!', 1800);
    pay(25, '🗼 Vé <b>tháp rơi tự do 60 m</b>', ()=>{ DT.riding=true; DT.st='up'; DT.t=0; toast('🗼 Đang kéo lên 56 m… nhìn xuống đi! 😱', 3000);
      startRide('drop', ()=>{ const a=0, seat=V3(DT.x+Math.cos(a)*3.25, Y+DT.y+.4, DT.z+Math.sin(a)*3.25); seatPlayer(seat, Math.PI/2); HOOK.camOverride={pos:seat.clone().add(V3(1.6,1.4,0)), look:seat.clone().add(V3(30,-12,0)), k:10}; }, {}); }); }});

  /* ============================== 🏴‍☠️ THUYỀN HẢI TẶC ============================== */
  const SHIP={x:92, z:262, a:0, amp:0, st:'idle', t:0, riding:false};
  const shipPivot=new THREE.Group(); shipPivot.position.set(SHIP.x, Y+12, SHIP.z); shipPivot.userData.dynamic=true; scene.add(shipPivot);
  { for(const s of [-1,1]){ k.add(new THREE.BoxGeometry(.5,13,.5), M.wood, SHIP.x-3,Y+6,SHIP.z+s*3.4, 0,0,.25); k.add(new THREE.BoxGeometry(.5,13,.5), M.wood, SHIP.x+3,Y+6,SHIP.z+s*3.4, 0,0,-.25); circles.push({x:SHIP.x-4.5, z:SHIP.z+s*3.4, r:.4}, {x:SHIP.x+4.5, z:SHIP.z+s*3.4, r:.4}); }
    k.add(new THREE.BoxGeometry(.6,.6,7.4), M.wood, SHIP.x,Y+12.2,SHIP.z);
    const sk=Kit(); const hull=new THREE.CylinderGeometry(2.4,1.2,13,12,1,false,0,Math.PI); hull.rotateZ(Math.PI/2); hull.rotateY(Math.PI/2); hull.rotateX(Math.PI); sk.add(hull, M.wood, 0,-9.2,0, 0,Math.PI/2,0);
    sk.add(new THREE.BoxGeometry(13,.2,4.4), M.wood, 0,-8.9,0); sk.add(new THREE.CylinderGeometry(.12,.12,7,8), M.wood, 0,-5.6,0); sk.add(new THREE.PlaneGeometry(3,2.4), sm(0x111111,.8,0,{side:THREE.DoubleSide}), 0,-4.4,.05);
    for(const s of [-1,1]) sk.add(new THREE.BoxGeometry(.3,9.4,.3), M.steel, s*.2,-4.6,0);
    sk.build(shipPivot); makeLabel('🏴‍☠️ Thuyền hải tặc', 'Vé 20 💰 · đu tới 75°', {h:.6, x:SHIP.x, y:Y+15.5, z:SHIP.z, fade:80}); }
  function updShip(dt){ SHIP.t+=dt; const T=4.6; if(SHIP.st==='run'){ SHIP.amp=Math.min(1.3, SHIP.amp+dt*.07); if(SHIP.t>34){ SHIP.st='stop'; } } else if(SHIP.st==='stop'){ SHIP.amp=Math.max(0, SHIP.amp-dt*.12); if(SHIP.amp<=0.01){ SHIP.st='idle'; SHIP.amp=0; if(SHIP.riding){ SHIP.riding=false; endRide({x:SHIP.x, z:SHIP.z-6.5}); toast('🏴‍☠️ Yo-ho-ho! Chóng mặt chưa?', 2400); } } }
    SHIP.a=SHIP.amp*Math.sin(SHIP.t*TAU/T); shipPivot.rotation.z=SHIP.a; }
  INTER.push({x:SHIP.x, z:SHIP.z-6, r:3, prio:.9, when:()=>!ride.kind, label:'🏴‍☠️ Lên thuyền hải tặc – 20 💰 (E)', action:()=>{ if(SHIP.st!=='idle') return toast('🏴‍☠️ Thuyền đang đu – đợi lượt sau!', 1800);
    pay(20, '🏴‍☠️ Vé <b>thuyền hải tặc</b>', ()=>{ SHIP.riding=true; SHIP.st='run'; SHIP.t=0; SHIP.amp=.05;
      startRide('ship', ()=>{ const loc=V3(5,-8.4,1), w=loc.clone(); toL(shipPivot.localToWorld(w)); seatPlayer(w, Math.PI); HOOK.camOverride={pos:toL(shipPivot.localToWorld(V3(7.5,-6.4,3.5))), look:toL(shipPivot.localToWorld(V3(-8,-8,0))), k:12}; }, {}); }); }});

  /* ============================== 👻 NHÀ MA ĐI XE ============================== */
  const HH={x0:73, x1:97, z0:322, z1:338};
  { const hx=(HH.x0+HH.x1)/2, w=HH.x1-HH.x0, d=HH.z1-HH.z0, ext=sm(0x2a1f3a,.8), roofM=sm(0x1a1226,.7);
    k.add(new THREE.BoxGeometry(w,9,d), ext, hx,Y+4.5,(HH.z0+HH.z1)/2); k.add(new THREE.ConeGeometry(Math.hypot(w,d)/2*.98,6,4), roofM, hx,Y+12,(HH.z0+HH.z1)/2, 0,Math.PI/4,0);
    for(const x of [HH.x0+2,HH.x1-2]){ k.add(new THREE.CylinderGeometry(1.2,1.2,13,8), ext, x,Y+6.5,HH.z0); k.add(new THREE.ConeGeometry(1.6,4,8), roofM, x,Y+15,HH.z0); }
    k.add(new THREE.BoxGeometry(3.6,4.2,.3), sm(0x050308,.9), hx,Y+2.1,HH.z0-.05);
    for(let i=0;i<6;i++) k.add(new THREE.BoxGeometry(1.2,1.6,.1), sm(0xb07aff,.5,0,{emissive:0x8a3cff, emissiveIntensity:.9}), HH.x0+3+i*3.6,Y+6.5,HH.z0-.06);
    boxes.push({x0:HH.x0, x1:HH.x1, z0:HH.z0, z1:HH.z1, msg:'👻 Nhà ma: vào bằng xe ở cửa chính (E)'});
    const tx=(()=>{ const c=document.createElement('canvas'); c.width=512; c.height=96; const g=c.getContext('2d'); g.fillStyle='#14081f'; g.fillRect(0,0,512,96); g.fillStyle='#c79bff'; g.font='900 56px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('👻 NHÀ MA BUG',256,50); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(6,1.1), new THREE.MeshStandardMaterial({map:tx, emissive:0xffffff, emissiveMap:tx, emissiveIntensity:.8})); sg.position.set(hx,Y+5,HH.z0-.2); sg.rotation.y=Math.PI; scene.add(sg); }
  const ghostTex=(kind)=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'); g.clearRect(0,0,128,128);
    if(kind===0){ g.fillStyle='rgba(235,240,255,.95)'; g.beginPath(); g.arc(64,50,36,Math.PI,0); g.lineTo(100,110); for(let x=100;x>=28;x-=12) g.lineTo(x,x%24?98:110); g.closePath(); g.fill(); g.fillStyle='#000'; g.beginPath(); g.ellipse(50,52,7,11,0,0,TAU); g.ellipse(78,52,7,11,0,0,TAU); g.fill(); g.beginPath(); g.ellipse(64,80,9,12,0,0,TAU); g.fill(); }
    else if(kind===1){ g.fillStyle='#f4f1e6'; g.beginPath(); g.arc(64,52,34,0,TAU); g.fill(); g.fillRect(44,76,40,22); g.fillStyle='#000'; g.beginPath(); g.arc(50,50,10,0,TAU); g.arc(78,50,10,0,TAU); g.fill(); g.fillRect(60,62,8,10); for(let x=48;x<84;x+=8) g.fillRect(x,86,4,10); }
    else { g.fillStyle='#3cff8a'; g.beginPath(); g.ellipse(64,70,38,30,0,0,TAU); g.fill(); g.fillStyle='#000'; for(const [x,y] of [[50,62],[78,62]]){ g.beginPath(); g.arc(x,y,7,0,TAU); g.fill(); } g.strokeStyle='#3cff8a'; g.lineWidth=5; for(const s of [-1,1]) for(let i=0;i<3;i++){ g.beginPath(); g.moveTo(64+s*30,70+i*8); g.lineTo(64+s*56,58+i*16); g.stroke(); } g.fillStyle='#ff3b3b'; g.font='900 22px sans-serif'; g.textAlign='center'; g.fillText('BUG',64,104); }
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const scares=[]; const hpath=[[85,317],[85,325],[94,325],[94,330],[76,330],[76,335],[94,335],[94,326.5],[85,326.5],[85,317]];
  const HP=(()=>{ const c=new THREE.CatmullRomCurve3(hpath.map(([x,z])=>V3(x,Y+.3,z)), false, 'catmullrom', .2), L=c.getLength(), n=Math.ceil(L*2), pts=c.getSpacedPoints(n); return {L, at:s=>{ s=clamp(s,0,L); const f=s/L*n, i=Math.min(n-1,Math.floor(f)), t=f-i; return pts[i].clone().lerp(pts[i+1],t); }, tan:s=>{ const a=c.getPointAt(clamp(s/L,0,1)), b=c.getPointAt(clamp((s+.5)/L,0,1)); return b.sub(a).normalize(); }}; })();
  { const inside=new THREE.Group(); scene.add(inside); const dk=Kit(), black=new THREE.MeshBasicMaterial({color:0x07050b}), floorM=new THREE.MeshBasicMaterial({color:0x120b18});
    dk.add(new THREE.BoxGeometry(HH.x1-HH.x0-.6,.1,HH.z1-HH.z0-.6), floorM, (HH.x0+HH.x1)/2,Y+.05,(HH.z0+HH.z1)/2); dk.add(new THREE.BoxGeometry(HH.x1-HH.x0-.6,.1,HH.z1-HH.z0-.6), black, (HH.x0+HH.x1)/2,Y+4.6,(HH.z0+HH.z1)/2);
    dk.add(new THREE.BoxGeometry(15,4.5,.3), black, 84.5,Y+2.3,327.7); dk.add(new THREE.BoxGeometry(15,4.5,.3), black, 85.5,Y+2.3,332.6);   // vách ngăn: chừa đường xe
    for(const [x,z,kind] of [[90,325,0],[94,328,1],[80,330,2],[77,333.5,0],[90,335,1],[92,326.5,2]]){ const g=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.8), new THREE.MeshBasicMaterial({map:ghostTex(kind), transparent:true, depthWrite:false, side:THREE.DoubleSide})); g.position.set(x,Y+1.2,z); g.visible=false; inside.add(g); scares.push({g, x, z, kind, done:false}); }
    for(let i=0;i<8;i++){ const l=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6), new THREE.MeshBasicMaterial({color:[0x8a3cff,0xff3b3b,0x3cff8a][i%3]})); l.position.set(HH.x0+2+i*2.8, Y+4.2, 324+(i%3)*5); inside.add(l); scares.push({light:l}); }
    dk.build(inside); }
  const hcar=new THREE.Group(); hcar.userData.dynamic=true; scene.add(hcar); { const b=new THREE.Mesh(new THREE.BoxGeometry(1.5,.7,2), sm(0x5a1a6a,.4)); b.position.y=.35; hcar.add(b); const s=new THREE.Mesh(new THREE.BoxGeometry(1.4,.7,.2), M.dark); s.position.set(0,.9,-.8); hcar.add(s); }
  const HC={s:0, riding:false}; const placeHC=()=>{ const p=HP.at(HC.s), t=HP.tan(HC.s); hcar.position.copy(p); hcar.position.y=Y; hcar.rotation.y=Math.atan2(t.x,t.z); return {p,t}; };
  placeHC();
  function updHaunt(dt, T){ if(!HC.riding){ for(const s of scares) if(s.g) s.g.visible=false; return; }
    HC.s+=dt*1.6; const {p,t}=placeHC();
    for(const s of scares){ if(s.light){ s.light.visible=Math.sin(T*9+s.light.position.x)>.2; continue; } const d=Math.hypot(p.x-s.x,p.z-s.z); if(d<3.2 && !s.done){ s.done=true; s.g.visible=true; s.t=0; boo(); toast(['👻 BOOO!','💀 Áaaa!','🐛 Bug khổng lồ!!'][s.kind], 1200); }
      if(s.g.visible){ s.t+=dt; s.g.scale.setScalar(Math.min(1.4, .3+s.t*2.5)); s.g.lookAt(toW(V3(p.x, Y+1.3, p.z))); if(s.t>1.6) s.g.visible=false; } }
    if(HC.s>=HP.L-.2){ HC.riding=false; HC.s=0; placeHC(); for(const s of scares) s.done=false; endRide({x:85, z:315}); toast('👻 Thoát khỏi Nhà Ma Bug! Can đảm ghê 😄', 2600); } }
  INTER.push({x:85, z:316.5, r:3, prio:.9, when:()=>!ride.kind, label:'👻 Đi xe vào Nhà Ma Bug – 20 💰 (E)', action:()=>pay(20, '👻 Vé <b>Nhà Ma Bug</b>', ()=>{ HC.riding=true; HC.s=0; toast('👻 Xe từ từ tiến vào bóng tối…', 2600);
    startRide('haunt', ()=>{ const {p,t}=placeHC(), seat=p.clone().add(V3(0,.65,0)); seatPlayer(seat, Math.atan2(t.x,t.z)); HOOK.camOverride={pos:seat.clone().addScaledVector(t,-1.6).add(V3(0,1.3,0)), look:seat.clone().addScaledVector(t,6).add(V3(0,.6,0)), k:10}; }, {}); })});

  /* ============================== 🍦 quầy kem + khách bot ============================== */
  { const qx=IC.x-10, qz=IC.z-14; k.add(new THREE.BoxGeometry(3,1.1,1.6), M.pink, qx,Y+.55,qz); k.add(new THREE.ConeGeometry(2.4,1,10,1,true), sm(0xff7ab8,.6,0,{side:THREE.DoubleSide}), qx,Y+3,qz); k.add(new THREE.CylinderGeometry(.05,.05,2.4,6), M.white, qx,Y+1.9,qz); boxes.push({x0:qx-1.5, x1:qx+1.5, z0:qz-.8, z1:qz+.8});
    INTER.push({x:qx, z:qz+1.8, r:2.2, prio:.6, label:'🍦 Quầy kem Wonderland (E) – 15 💰', action:()=>pay(15, '🍦 Kem ốc quế 3 vị', ()=>{ toast('🍦 Mát lạnh! Chơi tiếp trò nào? 😋', 2200); })}); }
  const bots=[]; if(W.people){ const spots=[[30,255,0],[31.5,254.6,.3],[96,296,Math.PI/2],[96.6,297.6,Math.PI/2],[90,256,0],[86,314,0],[84.5,313.4,.2],[66,276,Math.PI],[56,286,-.5]];
    spots.forEach(([x,z,h],i)=>{ const sd=W.people.pickSeed(L=>i%2?L.female:!L.female, 700+i), kk=W.people.kit(sd,{}); const a=makeActor(kk.gl,{name:`${W.people.nameOf(sd)} · khách vui chơi`, height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#ffb547'}); a.g.position.set(x,Y,z); a.g.rotation.y=h; a.play('idle',0); circles.push({x,z,r:.35}); bots.push(a); }); }

  k.build(scene);
  makeLabel('🎡 Đảo QC Wonderland', 'Tàu lượn · tháp rơi · thuyền hải tặc · nhà ma', {h:1.0, x:IC.x, y:Y+22, z:IC.z, fade:300});
  /* ============================== khung hình ============================== */
  HOOK.onFrame.push((dt, T)=>{ dt=Math.min(dt,.1);
    if(CABLE) updCable(dt);
    const near=!W.inside && Math.hypot(P.x-IC.x,P.z-IC.z)<170;
    if(near || ride.kind){ updCoaster(dt); updDrop(dt); updShip(dt); updHaunt(dt, T); carousel.rotation.y+=dt*.35; for(const a of bots) if(a.root.visible) a.mixer.update(dt); }
    if(ride.kind && W.applyPose) W.applyPose('sit'); });
  PLACES.push({icon:'🎡', name:'Đảo QC Wonderland', sub:'Công viên giải trí: tàu lượn, tháp rơi 60 m, thuyền hải tặc, nhà ma · '+(CABLE?'đi cáp treo từ bờ Nam đảo':'đi cầu G8 từ cổng Nam Sân bay'), go:()=>teleport(SB.x+3, SB.z+6, IC.x, IC.z)});
  if(CABLE) PLACES.push({icon:'🚡', name:'Ga cáp treo ra Đảo Wonderland', sub:'Bờ Nam đảo Master Dashboard · bay ~170 m qua biển', go:()=>teleport(SA.x-ux*6, SA.z-uz*6, SA.x, SA.z)});
  return {IC, SA, SB, CO, DT, SHIP, HC, CC};
}
