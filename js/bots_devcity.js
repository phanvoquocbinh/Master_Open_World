// QC World V2 – PHA 9 (phần Dev City): BOT SỐNG ĐỘNG CHO DEV CITY 8D (theo bible Phần 7 – "Đội Bot Dev City" + "Đội Hàng không & Giao thông")
//  🏮 Lầu Vách Đèn Lồng: nghệ nhân múa mì (sợi mì dài vung vòng trên đầu) · nghệ nhân Biến diện Tứ Xuyên (đổi mặt nạ) · 2 người bán kẹo hồ lô · khách dạo bờ sông
//  🚝 Xuyên Lầu: lái tàu ngồi buồng lái toa đầu · nhóm khách săn ảnh tàu xuyên lầu (giơ máy ảnh, reo khi tàu chui qua toà nhà)
//  🌀 CSGT điều tiết chân nút giao xoắn ốc · 🏙️ Principal Architect trên sàn kính The Crystal + khách dạo vườn trên mây · công nhân lau kính trên gondola 2 tháp
//  🚒 lính cứu hoả · 🚁 bác sĩ + phi công trực thăng trên nóc bệnh viện (cánh quạt quay) · 🏫 học sinh sân trường
//  🏞️ khách thả hoa đăng (đèn sen trôi trên hồ) · người chạy bộ quanh hồ · nghệ sĩ đàn Cổ tranh trong đình giữa hồ
//  🛕 sư thầy gõ chuông chùa (lầu chuông, khúc gỗ đánh chuông đung đưa) · sư quét sân bảo tháp · khách hành hương leo bậc đá
//  ✈️ nhân viên vẫy gậy đèn trước máy bay · cơ trưởng + tiếp viên đi trên sân đỗ
//  Hiệu năng: mỗi cụm chỉ "thức" khi bạn ở trong vòng 140 m; bot chỉ hiện + chạy hoạt hình khi cách camera < 85 m (máy yếu 60 m)
import { makePoser } from './pose.js';
import * as AK from './archKit.js';

export async function make(W, ctx, D){
  const {THREE, scene, circles, HOOK, P, makeActor, makeLabel, removeLabel, lerpAngle, mergeGeometries} = W;
  if(!W.people || !makeActor || !D) return null;
  const R=Math.random, pick=a=>a[Math.floor(R()*a.length)], TAU=Math.PI*2, LOW=W.QUAL==='low', clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const V3=THREE.Vector3, hy=(x,z)=>D.hAt(x,z) ?? 0;
  const NPC=[], sM=s=>W.people.pickSeed(L=>!L.female,s), sF=s=>W.people.pickSeed(L=>L.female,s);
  const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.5}, o));
  const dyn=o=>{ o.userData.dynamic=true; scene.add(o); return o; };
  function person(seed, outfit, name, dot, zone, h){ const k=W.people.kit(seed,{outfit, h}); const a=makeActor(k.gl,{name, height:k.h, face:0, clips:k.clips, compact:false, dot:dot||'#ffb547'});
    if(k.look && k.look.width){ a.root.scale.x*=k.look.width; a.root.scale.z*=k.look.width; } if(LOW) a.g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
    a.play('idle',0); a.mixer.update(0); const po=makePoser(THREE,a); const anchor=new THREE.Object3D(); anchor.position.y=k.h+.75; a.g.add(anchor);
    const o={a, po, h:k.h, hips:po.hipsHeight(), anchor, x:0, y:0, z:0, hd:0, zone, bubble:null, bubbleT:0, col:{x:1e9, z:1e9, r:.3, owner:true}, upd:null, ph:R()*9}; circles.push(o.col); NPC.push(o); return o; }
  const say=(o,t,sec=3)=>{ if(o.bubble) removeLabel(o.bubble); o.bubble=makeLabel(t, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:30}); o.bubbleT=sec; };
  const put=(o,col=true)=>{ o.a.g.position.set(o.x,o.y,o.z); o.a.g.rotation.set(0,o.hd,0); if(col){ o.col.x=o.x; o.col.z=o.z; } else o.col.x=1e9; };
  const bone=(o,re)=>{ let h=null; o.a.g.traverse(b=>{ if(b.isBone && !h && re.test(b.name)) h=b; }); return h; };
  const _v=new V3();
  function attach(o, mesh, side='Right', re){ const h=bone(o, re || new RegExp(side+'Hand$')); if(!h) return null; o.a.g.updateMatrixWorld(true); h.getWorldScale(_v); mesh.scale.multiplyScalar(1/(_v.x||1)); h.add(mesh); return mesh; }
  const _pa=new V3(), _pb=new V3(), _pd=new V3(), _qa=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _wq=new THREE.Quaternion(), _F=new V3(), _R=new V3(), _U=new V3(0,1,0);
  function aim(bn,n,c,f,u,r){ const B=bn[n], Cc=bn[c]; if(!B||!Cc) return; B.getWorldPosition(_pa); Cc.getWorldPosition(_pb); _pb.sub(_pa).normalize(); _pd.set(0,0,0).addScaledVector(_F,f).addScaledVector(_U,u).addScaledVector(_R,r).normalize(); _qa.setFromUnitVectors(_pb,_pd); B.getWorldQuaternion(_wq); B.parent.getWorldQuaternion(_pq); _wq.premultiply(_qa); B.quaternion.copy(_pq.invert().multiply(_wq)); B.updateMatrixWorld(true); }
  function pose(o, kind, t=0){ const bn=o.po.bones; if(!bn || !bn.Hips || !o.a.g.visible) return; o.a.g.updateMatrixWorld(true); o.a.g.getWorldDirection(_F); _F.y=0; _F.normalize(); _R.set(-_F.z,0,_F.x); const LR=[['Left',-1],['Right',1]];
    switch(kind){
      case 'wipe': { const e=Math.sin(t*3); aim(bn,'RightArm','RightForeArm',.75,.45,.35+e*.35); aim(bn,'RightForeArm','RightHand',.8,.6,e*.5); aim(bn,'LeftArm','LeftForeArm',.3,-1,-.2); break; }
      case 'wands': { const e=Math.sin(t*2.6); for(const [s,k] of LR){ const w=k>0?e:-e; aim(bn,s+'Arm',s+'ForeArm',.15,.35+w*.6,k*.9); aim(bn,s+'ForeArm',s+'Hand',.2,.9,k*(.2-w*.5)); } break; }
      case 'traffic': { const e=Math.sin(t*2.2); aim(bn,'RightArm','RightForeArm',.1,.05,1); aim(bn,'RightForeArm','RightHand',.4+e*.5,.2,.8); aim(bn,'LeftArm','LeftForeArm',.9,.15,-.3); aim(bn,'LeftForeArm','LeftHand',.6,.75,-.1); break; }
      case 'camera': for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.75,.15,k*.35); aim(bn,s+'ForeArm',s+'Hand',.55,.75,-k*.35); } aim(bn,'Neck','Head',1,.15,0); break;
      case 'overhead': { const e=Math.sin(t*4.2); for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.15,.85+e*.12,k*.55); aim(bn,s+'ForeArm',s+'Hand',.1,1,k*(.35+e*.2)); } break; }
      case 'pluck': for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.55,-1,k*.18); aim(bn,s+'ForeArm',s+'Hand',1,-.15+Math.sin(t*9+k*1.7)*.12,-k*.35+Math.sin(t*5+k)*.2); } break;
      case 'sweep': { const e=Math.sin(t*2.4); for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.6,-.75,k*.1+e*.35); aim(bn,s+'ForeArm',s+'Hand',.55,-.8,e*.6); } break; }
      case 'rope': { const e=Math.max(0,Math.sin(t)); aim(bn,'RightArm','RightForeArm',.9-e*.5,.25,.25); aim(bn,'RightForeArm','RightHand',1-e*.6,.1,.15); aim(bn,'LeftArm','LeftForeArm',.85-e*.5,.2,-.1); aim(bn,'LeftForeArm','LeftHand',1-e*.6,.1,.1); aim(bn,'Spine','Spine1',.15-e*.35,1,0); break; }
      case 'crouch': for(const [s,k] of LR){ aim(bn,s+'UpLeg',s+'Leg',1,-.25,k*.12); aim(bn,s+'Leg',s+'Foot',-.35,-1,0); aim(bn,s+'Arm',s+'ForeArm',.8,-.6,k*.08); aim(bn,s+'ForeArm',s+'Hand',.9,-.4,-k*.2); } aim(bn,'Spine','Spine1',.45,1,0); break;
      case 'sit': for(const [s,k] of LR){ aim(bn,s+'UpLeg',s+'Leg',1,-.12,k*.05); aim(bn,s+'Leg',s+'Foot',.15,-1,0); } break;
      case 'bar': for(const [s,k] of LR){ aim(bn,s+'Arm',s+'ForeArm',.8,-.55,k*.2); aim(bn,s+'ForeArm',s+'Hand',1,.15,-k*.15); } break;
      case 'stick': aim(bn,'RightArm','RightForeArm',.35,-.4,.6); aim(bn,'RightForeArm','RightHand',.4,.9,.1); break;
    } }
  // đi theo chuỗi điểm (vòng lặp); y bám địa hình (hoặc cố định), dừng nghỉ ngẫu nhiên
  function walker(o, pts, sp=1.2, yf=null){ Object.assign(o,{pts, wi:0, sp, wait:R()*3}); o.x=pts[0][0]; o.z=pts[0][1]; const Y=()=>typeof yf==='number' ? yf : yf ? yf(o.x,o.z) : hy(o.x,o.z);
    o.upd=(dt,T)=>{ o.y=Y(); if(o.wait>0){ o.wait-=dt; o.a.play('idle'); put(o); return 'idle'; }
      const [tx,tz]=o.pts[o.wi], dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<.25){ o.wi=(o.wi+1)%o.pts.length; if(R()<.3) o.wait=2+R()*5; return 'idle'; }
      const k=Math.min(d, o.sp*dt); o.x+=dx/d*k; o.z+=dz/d*k; o.hd=lerpAngle(o.hd, Math.atan2(dx,dz), 1-Math.exp(-dt*8)); o.a.play(o.sp>2.2?'run':'walk'); const ac=o.a.acts[o.sp>2.2?'run':'walk']; if(ac) ac.timeScale=clamp(o.sp/(o.sp>2.2?3.4:1.35),.6,1.15); put(o); return 'walk'; }; return o; }
  const stand=(o,x,z,hd,y)=>{ o.x=x; o.z=z; o.hd=hd; o.y=y ?? hy(x,z); return o; };
  const ring=(cx,cz,rx,rz,n,a0=0)=>Array.from({length:n},(_,i)=>{ const a=a0+i/n*TAU; return [cx+Math.cos(a)*rx, cz+Math.sin(a)*rz]; });
  const Y1=D.Y1, Y2=D.Y2, Y3=D.Y3, Y4=D.Y4, front=k=>-(196+k*.8), FL=4;
  const ZONES={hyd:{x0:130,x1:260,z0:-260,z1:-150}, river:{x0:170,x1:620,z0:-215,z1:-150}, res:{x0:330,x1:430,z0:-440,z1:-360}, spiral:{x0:240,x1:340,z0:-300,z1:-230},
    crystal:{x0:410,x1:570,z0:-215,z1:-180}, t2:{x0:480,x1:840,z0:-400,z1:-240}, lake:{x0:480,x1:640,z0:-660,z1:-540}, temple:{x0:690,x1:760,z0:-700,z1:-595}, air:{x0:280,x1:470,z0:-840,z1:-790}};

  /* ============================== 🏮 LẦU VÁCH ĐÈN LỒNG ============================== */
  // nghệ nhân múa mì ở quán mì tầng 4: sợi mì dài (chuỗi hạt) vung vòng trên đầu
  { const y=Y1+4*FL, o=person(sM(6101), {shirt:0xf4f2ec, pants:0x2a2a2a, shoe:0x1b1d21, style:'cap'}, '🍜 Nghệ nhân múa mì', '#ffcf7a', 'hyd'); stand(o, 186, front(4)-1.1, 0, y);
    const N=46, seg=new THREE.InstancedMesh(new THREE.SphereGeometry(.035,6,4), std(0xf3e2b0,{roughness:.6}), N); seg.frustumCulled=false; dyn(seg); const m4=new THREE.Matrix4(), L=new V3(), Rh=new V3(), p=new V3();
    const hl=bone(o,/LeftHand$/), hr=bone(o,/RightHand$/);
    o.upd=(dt,T)=>{ put(o); pose(o,'overhead',T); seg.visible=o.a.g.visible; if(!seg.visible) return; o.a.g.updateMatrixWorld(true); hl.getWorldPosition(L); hr.getWorldPosition(Rh);
      for(let i=0;i<N;i++){ const s=i/(N-1), lift=Math.sin(Math.PI*s)*(1.6+.5*Math.sin(T*3.1)), sw=Math.sin(TAU*s+T*5.2)*.9;
        p.copy(L).lerp(Rh,s); p.y+=lift; p.x+=Math.cos(T*2.6)*sw; p.z+=Math.sin(T*2.6)*sw*.6; m4.makeTranslation(p.x,p.y,p.z); seg.setMatrixAt(i,m4); } seg.instanceMatrix.needsUpdate=true;
      if(R()<dt*.01) say(o, pick(['Mì kéo tay đây! Xem múa mì nè 🍜','Một sợi dài 3 mét, không đứt nhé!','Vào quán tầng 4 ăn mì nóng đi bạn ơi!']), 2.8); }; }
  // nghệ nhân Biến diện Tứ Xuyên trên sân khấu nhỏ tầng trệt: đổi mặt nạ mỗi 4 giây
  { const o=person(sM(6102), {shirt:0xb3121b, pants:0x111111, shoe:0x111111, long:true}, '🎭 Nghệ nhân Biến diện Tứ Xuyên', '#ff5a5a', 'hyd'); stand(o, 172, front(0)+3.6, Math.PI, Y1+.6);
    const stage=new THREE.Mesh(AK.roundedBox(6,.6,4,.15,2).clone(), std(0x6b1a14,{roughness:.6})); stage.position.set(172, Y1+.3, front(0)+3.4); dyn(stage); circles.push({x:172, z:front(0)+3.4, r:2.6});
    const faces=['#c8102e','#111111','#e2b24a','#1f5fbf','#1f8a4c','#f4f4f0'].map(c=>{ const cv=document.createElement('canvas'); cv.width=cv.height=128; const g=cv.getContext('2d'); g.fillStyle=c; g.fillRect(0,0,128,128); g.fillStyle=c==='#111111'?'#e2b24a':'#111'; g.beginPath(); g.ellipse(40,56,16,8,-.3,0,TAU); g.ellipse(88,56,16,8,.3,0,TAU); g.fill(); g.strokeStyle=c==='#f4f4f0'?'#c8102e':'#fff'; g.lineWidth=5; g.beginPath(); g.moveTo(64,20); g.quadraticCurveTo(54,64,64,104); g.stroke(); g.beginPath(); g.arc(64,92,14,0,Math.PI); g.stroke(); const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; return t; });
    const mm=std(0xffffff,{map:faces[0], roughness:.4}), mask=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12,-Math.PI/2,Math.PI,0,Math.PI), mm); mask.scale.set(1,1.25,.75); mask.position.set(0,.09,.05);
    const head=bone(o,/Head$/); if(head){ o.a.g.updateMatrixWorld(true); head.getWorldScale(_v); mask.scale.multiplyScalar(1/(_v.x||1)); mask.position.multiplyScalar(1/(_v.x||1)); head.add(mask); }
    let k=0, next=4;
    o.upd=(dt,T)=>{ put(o); next-=dt; if(next<=0){ next=3.5+R()*2; k=(k+1)%faces.length; mm.map=faces[k]; mm.needsUpdate=true; o.po.apply('shake',T); if(o.a.g.visible && W.burst) W.burst(new V3(o.x, o.y+1.7, o.z-.3), [0xffd27a,0xff4f4f,0xffffff], 18, 1, .4, 1, .05); if(R()<.5) say(o, pick(['Biến! 🎭','Mặt mới nè! 👺','Đố bạn thấy tay mình đổi lúc nào!']), 2); }
      else if(((T*.6+o.ph)%5)<2) o.po.apply('present',T); }; }
  // 2 người bán kẹo hồ lô ven sông trước phố cổ
  for(const [i,x] of [200,244].entries()){ const o=person(i?sF(6103):sM(6104), {shirt:0xc8102e, pants:0x2a2a2a, shoe:0x1b1d21, style:'cap'}, '🍡 Người bán kẹo hồ lô', '#ff6b6b', 'hyd'); stand(o, x, -186.5, Math.PI, Y1);
    const pole=new THREE.Group(); const st=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,2.4,8), std(0xd9b27a)); st.position.y=1.2; pole.add(st); const hay=new THREE.Mesh(new THREE.CylinderGeometry(.28,.22,.7,10), std(0xd8c27a,{roughness:.95})); hay.position.y=2.2; pole.add(hay);
    const balls=new THREE.InstancedMesh(new THREE.SphereGeometry(.05,8,6), std(0xd6211f,{roughness:.2}), 42); let n=0; const m4=new THREE.Matrix4(); for(let k=0;k<14;k++){ const a=k/14*TAU; for(let b=0;b<3;b++){ m4.makeTranslation(Math.cos(a)*(.38+b*.07),2.48+b*.07,Math.sin(a)*(.38+b*.07)); balls.setMatrixAt(n++,m4); } } pole.add(balls);
    pole.position.set(x+.9,Y1,-186.5); dyn(pole); circles.push({x:x+.9, z:-186.5, r:.35});
    o.upd=(dt,T)=>{ put(o); if(((T*.3+o.ph)%7)<2) o.po.apply('present',T); if(R()<dt*.01) say(o, pick(['Kẹo hồ lô đây! Chua chua ngọt ngọt 🍡','Mua 1 xiên lên phố cổ ngắm đèn lồng đi!','Kẹo mới nhúng đường, giòn tan!']), 2.8); }; }
  // khách dạo bờ sông (đi dọc đại lộ + bờ kè)
  for(let i=0;i<(LOW?3:5);i++){ const z=-163-i*.9, pts=i<2 ? [[234+i*5,z],[300,z-.5],[370,z],[330,z+.3]] : [[400+i*6,z],[470,z-.4],[598,z],[520,z+.4]];   // 2 đoạn bờ kè giữa các đầu cầu (không xuyên tường cầu)
    const o=person(i%2?sF(6110+i):sM(6110+i), {shirt:[0xff6b6b,0x46d39a,0xffd23f,0x7a9cc6,0xff9fc4][i], pants:0x2a3a5a, shoe:0x1b1d21}, `🚶 Khách dạo bờ sông ${W.people.nameOf(6110+i)}`, '#9fd36a', i<2?'hyd':'river');
    walker(o, i%2 ? pts : [...pts].reverse(), 1.1+R()*.3, Y1); const u=o.upd; o.upd=(dt,T)=>{ const s=u(dt,T); if(s==='idle' && ((T*.4+o.ph)%6)<2.5) pose(o,'camera',T); if(R()<dt*.004) say(o, pick(['Phố cổ 11 tầng đẹp quá! 📸','Tối nay lên Lầu Vách Đèn Lồng ăn lẩu nha!','Gió sông mát ghê 🌬️']), 2.6); }; }

  /* ============================== 🚝 TÀU XUYÊN LẦU ============================== */
  // lái tàu ngồi buồng lái toa đầu (theo hướng chạy)
  if(D.cars && D.cars.length){ const o=person(sM(6201), {shirt:0x1d6ab8, pants:0x16324f, shoe:0x111111, long:true, style:'cap'}, '🚝 Lái tàu Xuyên Lầu', '#4fc3ff', 'res');
    o.upd=(dt,T)=>{ const lead=D.TR.dir>0 ? D.cars[0] : D.cars[3]; lead.updateMatrixWorld(); const f=new V3(0,0,1).applyQuaternion(lead.quaternion); o.x=lead.position.x+f.x*3.6; o.z=lead.position.z+f.z*3.6; o.y=lead.position.y+.75-o.hips*.55; o.hd=lead.rotation.y; put(o,false); pose(o,'sit',T); pose(o,'bar',T); };
    o.alwaysAwake=true; }
  // khách săn ảnh tàu xuyên lầu: đứng ở bãi cỏ phía Nam toà nhà, giơ máy ảnh khi tàu tới gần
  { const cam=()=>{ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(.16,.1,.08), std(0x1b1d22,{roughness:.3})); g.add(b); const l=new THREE.Mesh(new THREE.CylinderGeometry(.035,.04,.09,10).rotateX(Math.PI/2), std(0x333a44,{metalness:.6})); l.position.z=.07; g.add(l); return g; };
    const spots=[[373,-382],[380,-378.5],[392,-380],[401,-384]]; const S2=D.ST.find(s=>s.key==='s2');
    spots.forEach(([x,z],i)=>{ const o=person(i%2?sF(6211+i):sM(6211+i), {shirt:[0xffd23f,0x46d39a,0xff6b6b,0x7a9cc6][i], pants:0x2a3a5a, shoe:0x1b1d21, style:i===2?'cap':undefined}, '📸 Khách săn ảnh tàu xuyên lầu', '#ffd23f', 'res');
      stand(o, x, z, Math.atan2(380-x, -420-z), Y2); attach(o, cam()); let cheered=0;
      o.upd=(dt,T)=>{ put(o); const near=S2 && Math.abs(D.TR.s-S2.s)<60; if(near) pose(o,'camera',T); else if(((T*.3+o.ph)%8)<2) o.po.apply('phone',T);
        cheered-=dt; if(near && cheered<=0 && R()<.02){ cheered=9; say(o, pick(['Tàu chui qua toà nhà kìa!! 📸','Chụp kịp rồi! Đẹp quá 😍','Tầng 6 tới tầng 8 luôn đó!']), 2.6); } }; }); }

  /* ============================== 🌀 CSGT · 🏙️ THE CRYSTAL ============================== */
  { const o=person(sM(6301), {shirt:0xe9e4c8, pants:0x2f4f3a, shoe:0x111111, long:true, style:'cap'}, '👮 CSGT nút giao xoắn ốc', '#ffd23f', 'spiral'); stand(o, 289, -262, -Math.PI/2.4, Y1);
    const bat=new THREE.Mesh(new THREE.CylinderGeometry(.02,.025,.5,8).translate(0,.25,0), std(0xffffff,{emissive:0xff3030, emissiveIntensity:.3})); attach(o, bat);
    o.upd=(dt,T)=>{ put(o); pose(o,'traffic',T); if(R()<dt*.004) say(o, pick(['Xe lên tầng 5 đi chậm thôi nhé! 🚦','Nút giao 5 tầng – nhớ giữ làn!','Ai lên cao nguyên rẽ phải nha 👉']), 2.6); }; }
  const FY=93.2, CZ=-198;
  { const o=person(sM(6311), {shirt:0xf4f2ec, pants:0x3a3a3a, shoe:0x1b1d21, long:true}, '📐 Principal Architect · The Crystal', '#c7d2e0', 'crystal'); stand(o, 433, CZ+2, Math.PI/2, FY);
    const tab=new THREE.Mesh(new THREE.BoxGeometry(.25,.02,.18), std(0x1b1d22,{emissive:0x3fb8ff, emissiveIntensity:.5})); attach(o, tab);
    o.upd=(dt,T)=>{ put(o); o.po.apply('phone',T); if(R()<dt*.005) say(o, pick(['Ống kính này vắt qua 4 tháp, dài 140 m 😎','Đứng trên sàn kính 93 m mà run chân chưa?','Kết cấu thép giữ hồ bơi vô cực ở đầu Đông đó!']), 3); }; }
  for(let i=0;i<2;i++){ const o=person(i?sF(6312):sM(6313), {shirt:[0xff9fc4,0x46d39a][i], pants:0x2a3a5a, shoe:0x1b1d21}, '🌴 Khách dạo vườn trên mây', '#9fd36a', 'crystal'); walker(o, [[440+i*3,CZ+1],[512,CZ+1.5],[530,CZ-1],[452,CZ-1.5]], 1.05, FY); }
  // công nhân lau kính trên gondola treo mặt Nam 2 tháp
  const GOND=[]; for(const [i,tx] of [472.5,542.5].entries()){ const g=new THREE.Group(); const plat=new THREE.Mesh(AK.roundedBox(6,.25,1.2,.08,1).clone(), std(0xff8a2a,{metalness:.4})); g.add(plat);
      const rr=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,6,6).rotateZ(Math.PI/2), std(0xc9ced4,{metalness:.8})); rr.position.set(0,1.1,.55); g.add(rr); const cab=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1,4), std(0x222222)); g.add(cab); dyn(g);
      const G={g, cab, x:tx, z:CZ+8.4, y0:12, y1:86, top:117, ph:i*5, men:[]}; GOND.push(G);
      for(const sx of [-1.3,1.3]){ const o=person(sM(6321+i*2+(sx>0?1:0)), {shirt:0xff8a2a, pants:0x2a3a5a, shoe:0x1b1d21, style:'cap'}, '🧽 Công nhân lau kính tháp', '#ffb547', 'crystal'); o.gx=sx; o.G=G;
        const sq=new THREE.Mesh(mergeGeometries([new THREE.CylinderGeometry(.02,.02,.5,6).translate(0,.25,0), new THREE.BoxGeometry(.4,.06,.05).translate(0,.52,0)]), std(0x4fc3ff)); attach(o, sq);
        o.upd=(dt,T)=>{ o.x=G.x+o.gx; o.z=G.z-.25; o.y=G.g.position.y+.13; o.hd=Math.PI; put(o,false); pose(o,'wipe',T+o.ph); if(R()<dt*.003) say(o, pick(['Lau xong tầng này rồi! ✨','Trên này gió mạnh ghê!','Chào bạn dưới đường nha 👋']), 2.4); }; } }

  /* ============================== THỀM 2: cứu hoả · bệnh viện · trường học ============================== */
  for(const [i,x] of [793,807].entries()){ const o=person(sM(6401+i), {shirt:0xd9a019, pants:0x2a2a2a, shoe:0x111111, long:true, style:'cap'}, '🚒 Lính cứu hoả Lưng Núi', '#ff7a3a', 't2'); stand(o, x, -321.5, Math.PI*(i?.9:1.1), Y2);
    o.upd=(dt,T)=>{ put(o); if(((T*.25+o.ph)%8)<3) o.po.apply(i?'cross':'present',T); if(R()<dt*.004) say(o, pick(['Xe thang đã kiểm tra xong ✅','Gọi 114 khi có cháy nhé!','Sẵn sàng xuất phát trong 60 giây!']), 2.6); }; }
  // trực thăng cấp cứu trên nóc bệnh viện + bác sĩ + phi công
  const HELI={x:680, z:-368, y:Y2+24.08}; { const g=new THREE.Group(); const body=new THREE.Mesh(new THREE.CapsuleGeometry(1.1,3.4,6,14).rotateZ(Math.PI/2), std(0xf4f4f2,{roughness:.3,metalness:.2})); body.position.y=1.5; g.add(body);
    const stripe=new THREE.Mesh(new THREE.CapsuleGeometry(1.12,3.4,4,14).rotateZ(Math.PI/2).scale(1,.18,1), std(0xd0201a)); stripe.position.y=1.5; g.add(stripe);
    const boom=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,4.6,8).rotateZ(Math.PI/2), std(0xf4f4f2)); boom.position.set(-4.2,1.9,0); g.add(boom); const fin=new THREE.Mesh(AK.roundedBox(.9,1.4,.15,.05,1).clone(), std(0xd0201a)); fin.position.set(-6.4,2.4,0); g.add(fin);
    for(const s of [-1,1]){ const sk=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,3.6,6).rotateZ(Math.PI/2), std(0x2a2e35)); sk.position.set(0,.15,s*.9); g.add(sk); }
    const rotor=new THREE.Group(); for(let k=0;k<4;k++){ const b=new THREE.Mesh(new THREE.BoxGeometry(5.2,.04,.28), std(0x222222)); b.position.x=2.6; const p=new THREE.Group(); p.rotation.y=k/4*TAU; p.add(b); rotor.add(p); } rotor.position.y=2.75; g.add(rotor);
    g.position.set(HELI.x+1.5, HELI.y, HELI.z); g.rotation.y=.4; dyn(g); circles.push({x:HELI.x+1.5, z:HELI.z, r:2.2}); HELI.g=g; HELI.rotor=rotor; }
  { const d=person(sF(6411), {shirt:0xffffff, pants:0x3a7bd5, shoe:0xffffff}, '👩‍⚕️ Bác sĩ trực thăng cấp cứu', '#6fd3ff', 't2'); stand(d, HELI.x-4.5, HELI.z+3.5, -2.2, HELI.y);
    d.upd=(dt,T)=>{ put(d,false); if(((T*.2)%8)<3) d.po.apply('phone',T); if(R()<dt*.004) say(d, pick(['🚁 Trực thăng cấp cứu sẵn sàng 24/7!','Ca cấp cứu từ sân bay đỉnh núi đang tới!']), 2.8); };
    const p=person(sM(6412), {shirt:0x4d5b3a, pants:0x4d5b3a, shoe:0x111111, long:true, style:'cap'}, '🚁 Phi công trực thăng', '#9fd36a', 't2'); stand(p, HELI.x+5.2, HELI.z-2.5, -1.2, HELI.y);
    p.upd=(dt,T)=>{ put(p,false); if(((T*.3+p.ph)%9)<3) p.po.apply('present',T); if(R()<dt*.003) say(p, 'Kiểm tra cánh quạt xong, sẵn sàng cất cánh!', 2.6); }; }
  // học sinh sân trường (chạy chơi quanh sân)
  for(let i=0;i<(LOW?2:4);i++){ const o=person(i%2?sF(6421+i):sM(6421+i), {shirt:0xffffff, pants:i%2?0x1f3a8a:0x1f3a8a, shoe:0x1b1d21, skirt:false}, '🎒 Học sinh Dev Sơn Thành', '#ffd23f', 't2', 1.32+R()*.12);
    walker(o, ring(578,-266,14+i*1.5,12,8,i), 2.6+R()*.4, Y2+.05); }

  /* ============================== 🏞️ HỒ THIÊN CẢNH ============================== */
  const LK=D.LAKE, lx=LK.x, lz=-LK.d;
  // hoa đăng: đèn sen trôi chậm trên mặt hồ (2 InstancedMesh: cánh sen + ngọn nến)
  const LAN={n:14}; { const petals=new THREE.LatheGeometry([[0,0],[.5,.03],[.66,.22],[.4,.36],[0,.3]].map(([r,h])=>new THREE.Vector2(r,h)), 12);
    LAN.p=new THREE.InstancedMesh(petals, std(0xff9fc4,{roughness:.6, emissive:0xff6fa8, emissiveIntensity:.25}), LAN.n); LAN.f=new THREE.InstancedMesh(new THREE.SphereGeometry(.14,10,8), std(0xffe08a,{emissive:0xffb14a, emissiveIntensity:2.2}), LAN.n);
    LAN.p.frustumCulled=LAN.f.frustumCulled=false; dyn(LAN.p); dyn(LAN.f); LAN.L=Array.from({length:LAN.n},(_,i)=>({a:R()*TAU, r:.2+R()*.75, w:(R()<.5?-1:1)*(.008+R()*.012), b:R()*TAU})); NIGHTF.push(LAN.f.material); }
  for(const [i,ox] of [-6,5].entries()){ const o=person(i?sF(6501):sM(6502), {shirt:[0xff9fc4,0xffffff][i], pants:0x2a3a5a, shoe:0x1b1d21}, '🏮 Khách thả hoa đăng', '#ff9fc4', 'lake'); stand(o, lx+ox, lz+LK.rz+2.4, Math.PI, Y3);
    o.upd=(dt,T)=>{ put(o); pose(o,'crouch',T); if(R()<dt*.004) say(o, pick(['Thả hoa đăng cầu bình an 🌸','Ước gì release tới không có bug 🙏','Đèn sen trôi đẹp quá…']), 2.8); }; }
  for(let i=0;i<2;i++){ const o=person(i?sF(6511):sM(6512), {shirt:[0x46d39a,0x2f6fd0][i], pants:0x1b1d22, shoe:0xffffff}, '🏃 Người chạy bộ quanh hồ', '#46d39a', 'lake'); walker(o, ring(lx,lz,LK.rx+8,LK.rz+8,24,i*Math.PI).reverse(), 2.6+R()*.3); }
  // nghệ sĩ đàn Cổ tranh trong đình giữa hồ
  { const o=person(sF(6521), {shirt:0xf3e6c8, pants:0x8a1d2a, shoe:0x1b1d21, long:true}, '🎼 Nghệ sĩ đàn Cổ tranh', '#ffcf7a', 'lake'); stand(o, lx, lz+1.2, Math.PI, 53.56-o.hips);   /* S19g rà soát: mặt bệ đình = 52,95 · đôn cao .45 → hông 53,48 (trước tính từ TÂM bệ → đùi lún vào đôn) */
    const zg=new THREE.Group(); const body=new THREE.Mesh(AK.roundedBox(1.6,.12,.36,.04,1).clone(), std(0x6b3d1f,{roughness:.45})); zg.add(body); for(let k=0;k<12;k++){ const s=new THREE.Mesh(new THREE.BoxGeometry(1.5,.005,.006), std(0xe8e0c8,{metalness:.6})); s.position.set(0,.065,-.15+k*.027); zg.add(s); }
    const table=new THREE.Mesh(AK.roundedBox(1.8,.5,.5,.05,1).clone(), std(0x3f2614)); table.position.y=-.31; zg.add(table); zg.position.set(lx, 53.69, lz+.25); dyn(zg);   /* đàn nằm NGANG trước mặt (trước xoay 90° → bàn đàn chạy dọc xuyên qua người ngồi) */
    const stool=new THREE.Mesh(new THREE.CylinderGeometry(.22,.24,.45,12), std(0x6b3d1f)); stool.position.set(lx, 52.95+.225, lz+1.2); dyn(stool);
    o.upd=(dt,T)=>{ put(o,false); pose(o,'sit',T); pose(o,'pluck',T); if(R()<dt*.004) say(o, pick(['🎶 "Cao sơn lưu thuỷ" tặng hồ Thiên Cảnh','🎼 Tiếng đàn hoà tiếng nước…','🎶 Ngồi nghe một khúc rồi hẵng đi nhé']), 3); }; }

  /* ============================== 🛕 LINH SƠN VÂN TỰ ============================== */
  const A={x:D.PA.x, z:-D.PA.d, y:D.PA.top};
  // lầu chuông: 4 cột đỏ + mái cong + chuông đồng + khúc gỗ đánh chuông treo dây
  const BELL={x:A.x-13, z:A.z+7}; { const g=new THREE.Group(); g.position.set(BELL.x, A.y, BELL.z);
    for(const [ox,oz] of [[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[1.8,1.8]]){ const c=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,4.6,10), std(0xa82a1f)); c.position.set(ox,2.3,oz); g.add(c); circles.push({x:BELL.x+ox, z:BELL.z+oz, r:.3}); }
    const rf=AK.buildAsianCurvedRoof(5.2, 5.2, 1.8, 1.1, 0x2c2f35, 1); rf.position.y=4.6; g.add(rf);
    const bell=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.95,0],[.85,.25],[.72,1.1],[.62,1.6],[.3,1.85],[0,1.9]].map(([r,h])=>new THREE.Vector2(r,h)), 24), std(0x6b5a2a,{metalness:.85, roughness:.35}));
    const bp=new THREE.Group(); bp.position.y=4.3; bell.position.y=-2.1; bp.add(bell); g.add(bp);
    const log=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,2.2,10).rotateZ(Math.PI/2), std(0x7a4a28)); const lp=new THREE.Group(); lp.position.set(0,3.8,1.8); log.position.set(0,-.95,0); lp.add(log); for(const s of [-.8,.8]){ const rope=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.95,4), std(0xd8c27a)); rope.position.set(s,-.47,0); lp.add(rope); } g.add(lp);
    dyn(g); BELL.bp=bp; BELL.lp=lp; }
  { const o=person(sM(6601), {shirt:0xd98a2b, pants:0xd98a2b, shoe:0x6b3d1f, long:true, style:'bald'}, '🔔 Sư thầy gõ chuông chùa', '#ffb547', 'temple'); stand(o, BELL.x, BELL.z+3.4, Math.PI, A.y); let t=0, rung=0;
    o.upd=(dt,T)=>{ put(o); t+=dt; const cyc=t%7, swing=cyc<1.6 ? -Math.sin(cyc/1.6*Math.PI)*.75 : 0; BELL.lp.rotation.x=swing; pose(o,'rope',cyc<1.6?cyc/1.6*Math.PI:0);
      if(cyc>.78 && cyc<.82 && rung<=0){ rung=1; if(o.a.g.visible && W.burst) W.burst(new V3(BELL.x, A.y+2.6, BELL.z+.8), [0xffe08a,0xffffff], 14, .8, .3, .5, .05); if(R()<.45) say(o, pick(['Boong… 🔔','Nam mô A Di Đà Phật 🙏','Tiếng chuông cầu an cho mọi người']), 2.4); }
      if(cyc>2) rung=0; BELL.bp.rotation.x=cyc<4 && cyc>.8 ? Math.sin((cyc-.8)*6)*.06*Math.exp(-(cyc-.8)) : 0; }; }
  { const o=person(sM(6602), {shirt:0xd98a2b, pants:0xd98a2b, shoe:0x6b3d1f, long:true, style:'bald'}, '🧹 Sư quét sân bảo tháp', '#ffb547', 'temple');
    const broom=new THREE.Mesh(mergeGeometries([new THREE.CylinderGeometry(.02,.02,1.3,6).translate(0,.1,0), new THREE.ConeGeometry(.16,.42,8).translate(0,-.72,0)]), std(0xc8a45a,{roughness:.9})); attach(o, broom);
    walker(o, ring(A.x,A.z,18.5,18.5,18), .55, A.y); const u=o.upd; o.upd=(dt,T)=>{ u(dt,T); pose(o,'sweep',T); }; }
  // khách hành hương leo bậc đá (độ cao bám dốc bậc thang)
  { const S=D.STAIR; for(let i=0;i<2;i++){ const o=person(i?sF(6611):sM(6612), {shirt:[0xf4f2ec,0xc8a45a][i], pants:0x3a3a3a, shoe:0x1b1d21}, '🙏 Khách hành hương', '#ffd23f', 'temple');
      walker(o, i ? [[S.x0-.5,S.z0+2],[S.x1-.5,S.z1-2],[A.x-6,A.z+19]] : [[A.x+6,A.z+19],[S.x1+.5,S.z1-2],[S.x0+.5,S.z0+2]], .9); } }   // đi giữa lối cổng Tam Quan

  /* ============================== ✈️ SÂN BAY ĐỈNH NÚI ============================== */
  const PK=(D.landmarks && D.landmarks.parked) || [{x:322,z:-822},{x:372,z:-822},{x:422,z:-822}];
  { const pl=PK[2], o=person(sM(6701), {shirt:0xffd23f, pants:0x2a2f3a, shoe:0x111111, style:'cap'}, '🦺 Nhân viên điều hướng máy bay', '#ffb547', 'air'); stand(o, pl.x, pl.z+19.5, Math.PI, Y4);
    const wm=std(0xff7a1a,{emissive:0xff5a00, emissiveIntensity:1.4}); for(const side of ['Right','Left']){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.5,8).translate(0,.25,0), wm); attach(o, w, side); }
    o.upd=(dt,T)=>{ put(o); pose(o,'wands',T); }; }
  { const crew=[[sM(6711),{shirt:0xf4f2ec, pants:0x16324f, shoe:0x111111, long:true, style:'cap'},'👨‍✈️ Cơ trưởng Dev Air'],[sF(6712),{shirt:0x18a999, pants:0x18a999, shoe:0x111111, long:true},'💁‍♀️ Tiếp viên Dev Air']];
    const route=[[300,-803],[322,-805],[372,-805],[440,-803],[452,-800],[300,-800]];
    crew.forEach(([seed,of,nm],i)=>{ const o=person(seed, of, nm, '#4fc3ff', 'air'); walker(o, route.map(([x,z])=>[x-i*1.2, z+i*.8]), 1.15, Y4); const u=o.upd; o.upd=(dt,T)=>{ u(dt,T); if(i===0 && R()<dt*.004) say(o, pick(['Chuyến Dev Air 08 đi Brain Skyport, cất cánh đúng giờ ✈️','Đường băng trên đỉnh núi, gió ngang hơi mạnh!']), 2.8); }; }); }

  /* ============================== KHUNG HÌNH: thức/ngủ theo cụm, ẩn/hiện theo khoảng cách ============================== */
  const FAR=(LOW?60:85)**2; let tick=0; const awake={};
  for(const o of NPC) o.a.g.visible=false; for(const G of GOND) G.g.visible=false;
  HOOK.onFrame.push((dt,T)=>{ dt=Math.min(dt,.1); tick-=dt;
    if(tick<=0){ tick=.5; for(const [k,Z] of Object.entries(ZONES)){ const d=W.inside?1e9:Math.hypot(Math.max(Z.x0-P.x,0,P.x-Z.x1), Math.max(Z.z0-P.z,0,P.z-Z.z1)); awake[k]=d<140; }
      const c=W.camera.position; for(const o of NPC){ const v=(o.alwaysAwake ? Math.hypot(o.x-P.x,o.z-P.z)<160 : awake[o.zone]) && (((o.a.g.position.x-c.x)**2+(o.a.g.position.z-c.z)**2<FAR) || ((o.x-c.x)**2+(o.z-c.z)**2<FAR) || (o.alwaysAwake && D.TR.ride));
        if(o.a.g.visible!==v){ o.a.g.visible=v; if(!v){ o.col.x=1e9; if(o.bubble){ removeLabel(o.bubble); o.bubble=null; } } } }
      for(const G of GOND) G.g.visible=!!awake.crystal; if(HELI.g) HELI.g.visible=!!awake.t2; if(LAN.p){ LAN.p.visible=LAN.f.visible=!!awake.lake; } }
    for(const G of GOND){ if(!awake.crystal) break; const k=(Math.sin(T*.04+G.ph)+1)/2, y=G.y0+(G.y1-G.y0)*k; G.g.position.set(G.x,y,G.z); G.cab.scale.y=Math.max(.1,G.top-y); G.cab.position.set(0,(G.top-y)/2,0); }
    if(HELI.rotor && awake.t2) HELI.rotor.rotation.y+=dt*1.6;
    if(LAN.p && awake.lake){ const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), s=new V3(1,1,1), p=new V3();
      LAN.L.forEach((l,i)=>{ l.a+=l.w*dt*6; const x=lx+Math.cos(l.a)*LK.rx*.8*l.r, z=lz+Math.sin(l.a)*LK.rz*.8*l.r; if(Math.hypot(x-lx,z-lz)<14){ l.r=Math.min(1,l.r+.002); }
        e.set(Math.sin(T*.9+l.b)*.05,l.a,Math.cos(T*.8+l.b)*.05); q.setFromEuler(e); m4.compose(p.set(x,LK.y+.02+Math.sin(T*1.3+l.b)*.02,z), q, s); LAN.p.setMatrixAt(i,m4); m4.compose(p.set(x,LK.y+.4,z), q, s); LAN.f.setMatrixAt(i,m4); });
      LAN.p.instanceMatrix.needsUpdate=true; LAN.f.instanceMatrix.needsUpdate=true; LAN.f.material.emissiveIntensity=1.2+(W.night||0)*3.5; LAN.p.material.emissiveIntensity=.25+(W.night||0)*.9; }
    for(const o of NPC){ const aw=o.alwaysAwake || awake[o.zone]; if(!aw) continue; if(o.bubble){ o.bubbleT-=dt; if(o.bubbleT<=0){ removeLabel(o.bubble); o.bubble=null; } }
      if(o.a.g.visible) o.a.mixer.update(dt); if(o.upd) o.upd(dt,T); } });
  const out={npc:NPC.length, gondolas:GOND.length, lanterns:LAN.n, zones:Object.keys(ZONES)};
  Object.defineProperty(out,'list',{value:NPC, enumerable:false}); console.info('[Bot Dev City]', out); return out;
}
const NIGHTF=[];
