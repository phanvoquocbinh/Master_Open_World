// QC World – THƯ VIỆN NỘI THẤT DÙNG CHUNG W.FURN (phiên A, 21/11/2026)
// Mục tiêu (Bình): đồ vật trông như thật + GIẢM ĐỘ NẶNG nhờ dùng chung 1 bộ ~55 món cho cả game; mỗi nơi chỉ đổi màu / vật liệu.
//  • Nguồn: model Poly Haven CC0 (assets/models/cc0/polyhaven/<id>/<id>.gltf – thư mục bị gitignore) cho món có bản đẹp ≤ 15k tam giác,
//    còn lại (ghế văn phòng, bàn làm việc, giường hiện đại, TV, màn hình, đèn…) dựng bằng code chất lượng cao (bo cạnh, vân gỗ, vải, kim loại).
//    Thiếu thư mục / lỗi tải / model > 15k tam giác ⇒ tự dùng bản dựng bằng code, KHÔNG console.error.
//  • Hiệu năng: 1 món = 1 lần tải (cache), mỗi ô 32 m × (món, biến thể) = 1 InstancedMesh / phần ⇒ 100 ghế cùng loại vẫn 1–2 draw call.
//    Gần (≤ 60 m, máy yếu 35 m): model thật · xa (≤ 160 m): khối LOD rẻ gộp 1 lượt vẽ (vertex color) · xa hơn: ẩn.
//    Ra xa > 85 m quá 20 s: huỷ mesh gần; model không còn ai dùng 30 s: giải phóng geometry + texture khỏi GPU.
//  • Đổi màu: clone material (chung geometry + chung texture) + shader tô lại theo độ sáng texture (giữ vân vải/da/gỗ), tự chừa phần kim loại
//    (kênh metalness của texture ARM) ⇒ chân inox vẫn là inox. Không tạo texture mới.
//  • Tự thêm va chạm (W.boxes / W.circles / W.addSeg) + chỗ ngồi / nằm (W.addSeat / W.addBench của life.js).
//  API: W.FURN.place(kind,{x,y,z,yaw,color,material,frame,top,accent,scale,w,h,d,parent,scope,sit,label,collide,cast})
//       W.FURN.placeMany(kind,[{x,y,z,yaw,…}],chung) · W.FURN.kinds() · W.FURN.info(kind) · W.FURN.stats() · W.FURN.showcase(x,z,y)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { roundedBox, makeWoodMaterial } from './archKit.js';
import { cc0Kit } from './cc0kit.js';   // bộ nạp GLTF dùng chung của game (phiên D) – thư viện này KHÔNG có loader riêng

const TAU=Math.PI*2;
function rng(seed){ let s=(seed>>>0)||1; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

export function furnitureLib(W){
  if(W.FURN) return W.FURN;
  const LOW=W.QUAL==='low';
  const CFG={near:LOW?35:60, far:LOW?110:160, cell:32, maxTris:Infinity, tickMs:350, releaseMs:20000, protoIdleMs:30000, budgetMs:LOW?2.5:4};   // 21/11 Bình: ưu tiên trông như thật – bỏ trần tam giác; giữ nạp gần/giải phóng xa/nạp dần
  const now=()=>performance.now();

  /* ============================== VẬT LIỆU (dùng chung toàn thư viện) ============================== */
  const PRE={
    fabric:{c:0x8b9098, r:.95, t:'weave'}, velvet:{c:0x2f4f6f, r:.8, sheen:1, t:'weave'}, boucle:{c:0xeeeae2, r:1, t:'boucle'}, leather:{c:0x6b4a32, r:.42, t:'leather'},
    linen:{c:0xefebe3, r:.95, t:'weave'}, shade:{c:0xf3ece0, r:.9, t:'weave', ds:1, e:0xffe2b0, ei:.18},
    oak:{wood:'#c8a57a'}, walnut:{wood:'#5b3a22'}, ash:{wood:'#e2d2b6'}, teak:{wood:'#9a6a3e'}, ebony:{wood:'#2e2420'},
    white:{c:0xf3f2ef, r:.32}, matte:{c:0xe6e3dd, r:.75}, black:{c:0x1c1e21, r:.45, m:.35}, dark:{c:0x232529, r:.55, m:.1}, plastic:{c:0x2a2c30, r:.42},
    alu:{c:0xd3d8de, r:.3, m:1}, chrome:{c:0xf4f6f8, r:.07, m:1}, brass:{c:0xd0a750, r:.22, m:1}, gold:{c:0xe0b85a, r:.18, m:1}, steel:{c:0xa9afb6, r:.35, m:1},
    marble:{c:0xffffff, r:.16, t:'marble'}, stone:{c:0x8f8b84, r:.6, t:'marble'}, ceramic:{c:0xf1eee8, r:.16}, terracotta:{c:0xb5643c, r:.85}, concrete:{c:0xa19e98, r:.92, t:'boucle'},
    glass:{glass:1}, mirror:{c:0xdfe6ec, r:.02, m:1}, screen:{c:0x06080b, r:.07, m:.3, e:0x0b1626, ei:1}, leaf:{c:0xffffff, r:.62, ds:1}, soil:{c:0x3a2a1e, r:1},
    bulb:{c:0xfff3d6, e:0xffd9a0, ei:1.6}, books:{c:0xffffff, r:.8}, art:{c:0xffffff, r:.55, t:'art'}, board:{c:0xfafafa, r:.18}
  };
  const GLOBAL_DEF={main:'fabric', frame:'black', top:'oak', front:'white', head:'fabric:#b9b1a4', accent:'velvet:#c46a3a', linen:'linen', metal:'alu', chrome:'chrome',
    dark:'dark', white:'white', glass:'glass', screen:'screen', leaf:'leaf', soil:'soil', pot:'ceramic', bulb:'bulb', books:'books', stone:'marble', art:'art', shade:'shade', board:'board', mirror:'mirror'};
  const parseSpec=s=>{ s=String(s??''); if(s.startsWith('#')||/^0x/i.test(s)) return {pre:null, col:s.startsWith('#')?s:'#'+s.slice(2)}; const [pre,col]=s.split(':'); return {pre:pre||null, col:col||null}; };
  const TEX={};
  const canvasTex=(S,draw,rep=1)=>{ if(typeof document==='undefined') return null; const c=document.createElement('canvas'); c.width=c.height=S; draw(c.getContext('2d'),S); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep,rep); t.anisotropy=4; return t; };
  function tex(k){ if(k in TEX) return TEX[k]; const R=rng(k.length*977+13);
    TEX[k]= k==='weave'? canvasTex(256,(g,S)=>{ g.fillStyle='#d8d8d8'; g.fillRect(0,0,S,S); for(let y=0;y<S;y+=2){ g.fillStyle=`rgba(255,255,255,${.06+R()*.06})`; g.fillRect(0,y,S,1); } for(let x=0;x<S;x+=2){ g.fillStyle=`rgba(0,0,0,${.04+R()*.05})`; g.fillRect(x,0,1,S); } for(let i=0;i<2200;i++){ g.fillStyle=`rgba(${R()<.5?0:255},${R()<.5?0:255},${R()<.5?0:255},.05)`; g.fillRect(R()*S,R()*S,1+R()*2,1); } },3)
      : k==='boucle'? canvasTex(256,(g,S)=>{ g.fillStyle='#dcdcdc'; g.fillRect(0,0,S,S); for(let i=0;i<5200;i++){ const v=180+R()*75|0; g.fillStyle=`rgba(${v},${v},${v},.55)`; g.beginPath(); g.arc(R()*S,R()*S,.6+R()*1.6,0,TAU); g.fill(); } },3)
      : k==='leather'? canvasTex(256,(g,S)=>{ g.fillStyle='#cfcfcf'; g.fillRect(0,0,S,S); for(let i=0;i<4000;i++){ const v=170+R()*80|0; g.fillStyle=`rgba(${v},${v},${v},.35)`; g.fillRect(R()*S,R()*S,1+R()*3,1+R()*3); } for(let i=0;i<60;i++){ g.strokeStyle='rgba(90,90,90,.08)'; g.beginPath(); let x=R()*S,y=R()*S; g.moveTo(x,y); for(let j=0;j<5;j++){ x+=R()*20-10; y+=R()*20-10; g.lineTo(x,y); } g.stroke(); } },2)
      : k==='marble'? canvasTex(512,(g,S)=>{ g.fillStyle='#eeece8'; g.fillRect(0,0,S,S); for(let i=0;i<46;i++){ g.strokeStyle=`rgba(${110+R()*40|0},${110+R()*40|0},${118+R()*40|0},${.06+R()*.2})`; g.lineWidth=.5+R()*2.2; g.beginPath(); let x=R()*S,y=R()*S; g.moveTo(x,y); for(let j=0;j<9;j++){ x+=R()*90-45; y+=R()*60-20; g.lineTo(x,y); } g.stroke(); } })
      : k==='art'? canvasTex(512,(g,S)=>{ const gr=g.createLinearGradient(0,0,S,S); gr.addColorStop(0,'#e9dcc6'); gr.addColorStop(1,'#c7b59b'); g.fillStyle=gr; g.fillRect(0,0,S,S); const pal=['#1f3b4d','#c8553d','#e2a03f','#2a7f62','#efe6d5','#30343f']; for(let i=0;i<9;i++){ g.fillStyle=pal[i%pal.length]; g.globalAlpha=.55+R()*.4; g.beginPath(); g.arc(R()*S,R()*S,30+R()*120,0,TAU); g.fill(); } g.globalAlpha=1; g.strokeStyle='#1d1d1d'; g.lineWidth=5; g.beginPath(); g.moveTo(40,S*.7); g.bezierCurveTo(S*.3,S*.2,S*.6,S*.9,S-40,S*.35); g.stroke(); },1)
      : null;
    return TEX[k]; }
  const WOOD={};
  const woodMat=pre=>WOOD[pre]||(WOOD[pre]=makeWoodMaterial({col:PRE[pre].wood, plank:34, seed:pre.length*31+7, rough:.48}));
  const MATS=new Map();
  function matFor(spec){ if(MATS.has(spec)) return MATS.get(spec); const {pre,col}=parseSpec(spec), P=PRE[pre]||PRE.fabric; let m;
    if(P.wood){ m=woodMat(pre).clone(); m.vertexColors=true; if(col) m.color.set(col); }
    else if(P.glass) m=new THREE.MeshPhysicalMaterial({color:col||0xdcecf3, roughness:.04, metalness:0, transparent:true, opacity:.28, depthWrite:false, vertexColors:true});
    else { const o={color:col??P.c, roughness:P.r??.6, metalness:P.m??0, vertexColors:true}; if(P.e){ o.emissive=P.e; o.emissiveIntensity=P.ei??1; } if(P.t) o.map=tex(P.t);
      m=P.sheen? new THREE.MeshPhysicalMaterial({...o, sheen:1, sheenRoughness:.45, sheenColor:new THREE.Color(col??P.c).lerp(new THREE.Color(0xffffff),.35)}) : new THREE.MeshStandardMaterial(o);
      if(P.ds) m.side=THREE.DoubleSide; }
    m.name='furn:'+spec; MATS.set(spec,m); return m; }
  const specColor=spec=>{ const {pre,col}=parseSpec(spec), P=PRE[pre]||PRE.fabric; if(col) return new THREE.Color(col); if(P.wood) return new THREE.Color(P.wood); if(P.glass) return new THREE.Color(0x9fb7c4); return new THREE.Color(P.c??0x888888); };
  const topOf=o=>{ let q=o; while(q && q.parent) q=q.parent; return q; };
  const LODMAT=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.72, metalness:.05}); LODMAT.name='furn:lod';

  /* ============================== HÌNH HỌC (bộ dựng bằng code) ============================== */
  let LOQ=false;   // true khi dựng khối LOD (ít đỉnh)
  const ATTR=['position','normal','uv'];
  function prep(g){ const q=g.index?g.toNonIndexed():g.clone(); for(const k of Object.keys(q.attributes)) if(!ATTR.includes(k)) q.deleteAttribute(k);
    if(!q.attributes.normal) q.computeVertexNormals(); if(!q.attributes.uv) q.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(q.attributes.position.count*2),2)); return q; }
  const _M=new THREE.Matrix4(), _E=new THREE.Euler(), _Q=new THREE.Quaternion(), _V=new THREE.Vector3(), _S=new THREE.Vector3(), _UP=new THREE.Vector3(0,1,0);
  const RB=(w,h,d,r=.02,s=2)=>LOQ? new THREE.BoxGeometry(w,h,d) : roundedBox(w,h,d,Math.max(.002,Math.min(r,w/2-.002,h/2-.002,d/2-.002)),s);
  const CY=(rt,rb,h,n=16,open=false)=>new THREE.CylinderGeometry(rt,rb,h,LOQ?Math.min(n,6):n,1,open);
  const SP=(r,w=16,h=10)=>new THREE.SphereGeometry(r,LOQ?6:w,LOQ?4:h);
  const TO=(R,r,n=8,m=32)=>new THREE.TorusGeometry(R,r,LOQ?3:n,LOQ?8:m);
  const LA=(prof,n=28)=>new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)), LOQ?6:n);
  const TU=(pts,r,n=8)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))), LOQ?4:pts.length*6, r, LOQ?3:n, false);
  // lá cây: mặt phẳng uốn (gốc ở y=0, ngọn ở y=L), shape 'leaf' (bầu dục) | 'blade' (lá lưỡi kiếm)
  function LEAF(L,Wd,bend=.3,shape='leaf'){ const g=new THREE.PlaneGeometry(Wd,L,LOQ?1:2,LOQ?1:6), p=g.attributes.position;
    for(let i=0;i<p.count;i++){ const t=(p.getY(i)+L/2)/L; const k=shape==='blade'? Math.max(.04,1-Math.pow(t,5)) : Math.max(.03,Math.sin(Math.PI*Math.min(1,t*1.04))*(1-.2*t)); const x=p.getX(i)*k; p.setXYZ(i, x, t*L*(1-.25*bend*t), bend*t*t*L*.8+Math.abs(x)*.28); }
    g.computeVertexNormals(); return g; }
  // UV hộp theo kích thước thật (1 ô ≈ 1,1 m): vân gỗ / sợi vải không bị kéo giãn trên mặt lớn (cánh tủ áo 2,2 m…); tranh/màn hình/bảng giữ UV 0–1
  const KEEP_UV=new Set(['art','screen','board','mirror','leaf']);
  function boxUV(q,S=1.1){ const p=q.attributes.position, n=q.attributes.normal, uv=q.attributes.uv; for(let i=0;i<p.count;i++){ const ax=Math.abs(n.getX(i)), ay=Math.abs(n.getY(i)), az=Math.abs(n.getZ(i)); let u,v;
      if(ax>=ay && ax>=az){ u=p.getZ(i); v=p.getY(i); } else if(ay>=az){ u=p.getX(i); v=p.getZ(i); } else { u=p.getX(i); v=p.getY(i); } uv.setXY(i,u/S,v/S); } uv.needsUpdate=true; }
  function collector(){ const parts=[]; const p=(role,g,x=0,y=0,z=0,rx=0,ry=0,rz=0,col=null)=>{ const q=prep(g); _M.compose(_V.set(x,y,z), _Q.setFromEuler(_E.set(rx,ry,rz,'YXZ')), _S.set(1,1,1)); q.applyMatrix4(_M); if(!KEEP_UV.has(role)) boxUV(q); parts.push({role,g:q,col}); }; p.parts=parts; return p; }

  const BLD={
    officeChair(s,o,p){ const ex=!!o.exec;
      for(let i=0;i<5;i++){ const a=i*TAU/5, sn=Math.sin(a), c=Math.cos(a);
        p('dark',RB(.055,.04,.31,.015),sn*.16,.085,c*.16,.1,a,0); p('dark',CY(.03,.03,.026,14),sn*.31,.032,c*.31,0,a,Math.PI/2); p('dark',RB(.028,.04,.034,.008),sn*.31,.064,c*.31,0,a,0); }
      p('dark',CY(.055,.068,.07,20),0,.11,0); p('dark',CY(.037,.037,.12,16),0,.19,0); p('chrome',CY(.024,.024,.2,16),0,.3,0);
      p('dark',RB(.24,.05,.26,.015),0,.4,0); p('dark',RB(.48,.024,.46,.01),0,.428,0); p('main',RB(.52,.085,.5,.04,3),0,.48,.01);
      const bh=ex?.76:.52, by=ex?.98:.85;
      p('dark',RB(.07,.44,.03,.01),0,.62,-.27,-.12,0,0); p('main',RB(.48,bh,.08,.04,3),0,by,-.28,-.1,0,0); if(!ex) p('dark',RB(.5,bh+.04,.02,.01),0,by,-.325,-.1,0,0);
      for(const sx of [-1,1]){ p('dark',RB(.03,.2,.05,.008),sx*.275,.57,-.02); p('dark',RB(.075,.03,.25,.012),sx*.275,.68,0); } },
    diningChair(s,o,p){ const {w,d,h}=s, sy=.45, lx=w/2-.045, lz=d/2-.045;
      for(const sx of [-1,1]){ p('frame',CY(.019,.014,sy,10),sx*lx,sy/2,lz); p('frame',CY(.019,.016,h,10),sx*lx,h/2,-lz,-.07,0,0); }
      p('frame',RB(w-.1,.02,.02,.006),0,.16,lz); p('frame',RB(w-.1,.02,.02,.006),0,.16,-lz+.02); p('frame',RB(.02,.02,d-.1,.006),-lx,.18,0); p('frame',RB(.02,.02,d-.1,.006),lx,.18,0);
      p('main',RB(w-.03,.055,d-.03,.022,3),0,sy+.01,.005); p('main',RB(w-.05,.24,.035,.015,2),0,h-.17,-lz-.005,-.1,0,0); },
    sofa(s,o,p){ const {w,d,h}=s, n=o.n||Math.max(1,Math.round((w-.3)/.66)), aw=o.aw??.16, lg=o.low?.06:.1, by=lg, ph=.16, low=o.low?.06:0, ah=.58-low;
      const legs=(o.legs==='metal')?'chrome':'frame';
      for(const sx of [-1,1]) for(const sz of [-1,1]) p(legs,CY(.022,.015,lg,10),sx*(w/2-.07),lg/2,sz*(d/2-.08));
      p('main',RB(w,ph,d,.03,2),0,by+ph/2,0);
      for(const sx of [-1,1]) p('main',RB(aw,ah-by,d,.06,3),sx*(w/2-aw/2),by+(ah-by)/2,0);
      p('main',RB(w-.01,h-by,.2,.06,3),0,by+(h-by)/2,-d/2+.1);
      const iw=w-2*aw, cw=iw/n, sd=d-.24;
      for(let i=0;i<n;i++){ const cx=-iw/2+cw*(i+.5); p('main',RB(cw-.012,.15,sd,.06,3),cx,by+ph+.07,.11); p('main',RB(cw-.02,Math.min(.46,h-by-ph-.14),.17,.07,3),cx,by+ph+.14+Math.min(.46,h-by-ph-.14)/2,-d/2+.27,-.14,0,0); }
      if(o.pillows!==false && n>1) for(const sx of [-1,1]) p('accent',RB(.42,.4,.12,.07,3),sx*(iw/2-.26),by+ph+.38,-d/2+.42,-.25,sx*.25,0); },
    ottoman(s,o,p){ const {w,d,h}=s; for(const sx of [-1,1]) for(const sz of [-1,1]) p('frame',CY(.02,.015,.08,10),sx*(w/2-.07),.04,sz*(d/2-.07)); p('main',RB(w,h-.08,d,.07,3),0,.08+(h-.08)/2,0); },
    barStool(s,o,p){ const h=s.h; p('chrome',CY(.22,.23,.02,40),0,.01,0); p('chrome',CY(.026,.026,h-.1,16),0,(h-.1)/2,0); p('chrome',TO(.17,.011,8,36),0,.3,0,Math.PI/2,0,0); p('dark',CY(.16,.12,.05,24),0,h-.09,0); p('main',CY(.2,.19,.07,32),0,h-.035,0); },
    stool(s,o,p){ const {w,h}=s; for(const sx of [-1,1]) for(const sz of [-1,1]) p('frame',CY(.018,.014,h-.03,10),sx*(w/2-.06),(h-.03)/2,sz*(w/2-.06),sz*.06,0,-sx*.06); p('top',RB(w,.035,w,.012,2),0,h-.017,0); },
    bench(s,o,p){ const {w,d,h}=s; for(const sx of [-1,1]){ p('frame',RB(.05,.44,d-.08,.01),sx*(w/2-.08),.22,0); } p('top',RB(w,.045,d-.05,.012,2),0,.45,0); if(h>.6) p('top',RB(w,.16,.035,.01,2),0,h-.1,-d/2+.04,-.12,0,0); },
    desk(s,o,p){ const {w,d,h}=s, lx=w/2-.05, lz=d/2-.05;
      p('top',RB(w,.03,d,.01,2),0,h-.015,0);
      for(const sx of [-1,1]){ for(const sz of [-1,1]) p('frame',RB(.05,h-.03,.05,.008),sx*lx,(h-.03)/2,sz*lz); p('frame',RB(.05,.03,d-.05,.008),sx*lx,.015,0); p('frame',RB(.04,.04,d-.08,.008),sx*lx,h-.05,0); }
      p('frame',RB(w-.14,.04,.03,.008),0,h-.05,-lz); p('main',RB(w-.16,.3,.014,.005),0,h-.24,-lz+.03); p('dark',RB(w*.55,.05,.12,.01),0,h-.12,-lz+.12); },
    meetingTable(s,o,p){ const {w,d,h}=s; p('top',RB(w,.045,d,.06,3),0,h-.0225,0); for(const sx of [-1,1]){ p('frame',RB(.09,h-.06,d*.55,.02,2),sx*w*.3,(h-.06)/2+.015,0); p('frame',RB(.34,.03,d*.7,.012,2),sx*w*.3,.015,0); }
      p('frame',RB(w*.6,.05,.08,.01),0,h-.08,0); p('metal',RB(.36,.012,.12,.005),0,h+.006,0); for(let i=0;i<3;i++) p('dark',RB(.05,.004,.03,.002),-.1+i*.1,h+.013,0); },
    table(s,o,p){ const {w,d,h}=s, t=o.t??.04, gl=!!o.glass, topRole=gl?'glass':(o.marble?'stone':'top');
      if(o.round){ const r=w/2; p(topRole,CY(r,r,t,56),0,h-t/2,0); if(gl) p('frame',TO(r,.012,6,56),0,h-t/2,0,Math.PI/2,0,0); }
      else { p(topRole,RB(w,t,d,Math.min(.02,t/2),2),0,h-t/2,0); }
      const lh=h-t, leg=o.legs||(o.round?'pedestal':'4');
      if(leg==='pedestal'){ p('frame',CY(.035,.045,lh,16),0,lh/2,0); p('frame',CY(Math.min(.28,w*.32),Math.min(.3,w*.34),.025,40),0,.0125,0); }
      else if(leg==='plinth'){ p('frame',RB(w*.62,lh,d*.55,.02,2),0,lh/2,0); }
      else if(leg==='sled'){ for(const sx of [-1,1]){ p('frame',RB(.03,lh,.03,.006),sx*(w/2-.08),lh/2,d/2-.08); p('frame',RB(.03,lh,.03,.006),sx*(w/2-.08),lh/2,-d/2+.08); p('frame',RB(.03,.03,d-.16,.006),sx*(w/2-.08),.015,0); } }
      else { const ix=w/2-.06, iz=d/2-.06; for(const sx of [-1,1]) for(const sz of [-1,1]) p('frame',CY(.022,.015,lh,12),sx*ix,lh/2,sz*iz,sz*.05,0,-sx*.05); if(h>.5) for(const sz of [-1,1]) p('frame',RB(w-.16,.06,.022,.006),0,lh-.03,sz*iz); } },
    storage(s,o,p){ const {w,h,d}=s, lg=o.legs?.1:0, y0=o.legs?lg:.05, bh=h-y0-(o.top?.025:0);
      if(o.legs) for(const sx of [-1,1]) for(const sz of [-1,1]) p('frame',CY(.018,.012,lg,10),sx*(w/2-.05),lg/2,sz*(d/2-.05));
      else p('dark',RB(w-.06,.05,d-.06,.005),0,.025,-.01);
      p('main',RB(w,bh,d,.012,2),0,y0+bh/2,0); if(o.top) p('top',RB(w+.02,.025,d+.02,.008,2),0,h-.0125,0);
      const rows=o.rows||2, cols=o.cols||1, fw=(w-.03)/cols, fh=(bh-.03)/rows;
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){ const cx=-w/2+.015+fw*(c+.5), cy=y0+.015+fh*(r+.5); p('front',RB(fw-.006,fh-.006,.02,.006,2),cx,cy,d/2+.004);
        if(o.doors) p('metal',RB(.014,Math.min(.32,fh*.35),.022,.005),cx+(c%2?-1:1)*(fw/2-.05),cy,d/2+.026); else p('metal',RB(Math.min(.22,fw*.45),.014,.022,.005),cx,cy+fh*.28,d/2+.026); } },
    shelf(s,o,p){ const {w,h,d}=s, R=rng(Math.round(w*100+h*10)), rows=o.rows||5, mt=!!o.metal, rl=mt?'metal':'main';
      if(mt){ for(const sx of [-1,1]) for(const sz of [-1,1]) p('metal',RB(.03,h,.03,.004),sx*(w/2-.015),h/2,sz*(d/2-.015)); }
      else { for(const sx of [-1,1]) p('main',RB(.025,h,d,.006),sx*(w/2-.0125),h/2,0); p('main',RB(w-.05,h-.05,.012,.004),0,h/2,-d/2+.006); }
      const gap=(h-.06)/rows; const PAL=[0x8c2f39,0x1f4e79,0xd9c8a9,0x2f5d50,0x3a3a3a,0xb5651d,0xe8e2d0,0x5b4a7a,0x7a8b3d];
      for(let r=0;r<=rows;r++){ const y=.03+r*gap; p(rl,RB(w-(mt?0:.05),.025,d-(mt?0:.012),.005),0,y,mt?0:.006);
        if(r<rows && o.books!==false && !LOQ){ let x=-w/2+.05; while(x<w/2-.08){ if(R()<.16){ x+=.06+R()*.12; continue; } const bw=.022+R()*.03, bh2=Math.min(gap-.05,.17+R()*.1), bd=d*(.62+R()*.2), col=PAL[R()*PAL.length|0];
            if(mt) p('books',RB(.3,.2,d*.8,.01),x+.15,y+.11,0,0,0,0,0xb89b72), x+=.36; else { p('books',new THREE.BoxGeometry(bw,bh2,bd),x+bw/2,y+.0125+bh2/2,(d-bd)/2-.02,0,0,R()<.08?.18:0,col); x+=bw+.002; } } } } },
    bed(s,o,p){ const {w,h,d}=s, two=w>1.25;
      for(const sx of [-1,1]) for(const sz of [-1,1]) p('frame',CY(.025,.02,.08,10),sx*(w/2-.08),.04,sz*(d/2-.1));
      p('frame',RB(w+.06,.28,d+.04,.04,3),0,.22,0); p('linen',RB(w-.02,.22,d-.06,.07,3),0,.47,.01);
      p('main',RB(w+.05,.07,d*.68,.035,3),0,.6,d*.16); for(const sx of [-1,1]) p('main',RB(.035,.24,d*.68,.015,2),sx*(w/2+.04),.48,d*.16);
      p('accent',RB(w+.09,.035,.46,.015,2),0,.65,d/2-.34); for(const sx of [-1,1]) p('accent',RB(.03,.2,.46,.012),sx*(w/2+.06),.55,d/2-.34);
      const np=two?2:1; for(let i=0;i<np;i++){ const px=two?(i?1:-1)*w/4:0; p('linen',RB(.62,.15,.38,.07,3),px,.66,-d/2+.32,-.35,0,0); }
      if(two) p('accent',RB(.42,.3,.11,.06,3),0,.72,-d/2+.48,-.3,0,0);
      const k=Math.max(3,Math.round(w/.3)), pw=(w+.1)/k; for(let i=0;i<k;i++) p('head',RB(pw-.012,h-.3,.11,.045,2),-(w+.1)/2+pw*(i+.5),.3+(h-.3)/2,-d/2-.06); },
    tv(s,o,p){ const {w,h}=s, wall=!!o.wall, ph=wall?h:h-.14, y=wall?0:.14+ph/2, z=wall?.03:0;
      p('dark',RB(w,ph,.035,.008,1),0,y,z); p('screen',new THREE.PlaneGeometry(w-.02,ph-.02),0,y,z+.0185);
      if(!wall){ p('dark',RB(.32,.014,.2,.005),0,.007,0); p('dark',RB(.06,.13,.025,.006),0,.07,-.025); } },
    monitor(s,o,p){ const {w,h}=s; p('dark',RB(w,.36,.03,.008,1),0,h-.18,0); p('screen',new THREE.PlaneGeometry(w-.02,.34),0,h-.18,.0155); p('metal',RB(.05,h-.2,.025,.008),0,(h-.2)/2+.01,-.05,.08,0,0); p('metal',RB(.24,.012,.18,.005),0,.006,-.04); },
    laptop(s,o,p){ p('metal',RB(.32,.016,.22,.006,1),0,.008,0); p('dark',new THREE.PlaneGeometry(.28,.1),0,.0165,-.02,-Math.PI/2,0,0); const a=-.32; p('metal',RB(.32,.21,.007,.004,1),0,.016+.105*Math.cos(a),-.11+.105*Math.sin(a),a,0,0); p('screen',new THREE.PlaneGeometry(.29,.18),0,.016+.105*Math.cos(a)+.004*Math.sin(-a),-.11+.105*Math.sin(a)+.004*Math.cos(a),a,0,0); },
    floorLamp(s,o,p){ const h=s.h; p('stone',CY(.16,.17,.03,36),0,.015,0); p('frame',CY(.011,.011,h-.32,10),0,(h-.32)/2+.03,0); p('shade',CY(.19,.22,.32,36,true),0,h-.16,0); p('bulb',SP(.05,12,8),0,h-.2,0); p('frame',TO(.19,.004,4,36),0,h,0,Math.PI/2,0,0); },
    tableLamp(s,o,p){ const h=s.h; p('pot',LA([[0,0],[.07,0],[.1,.08],[.085,.2],[.03,.27],[.015,h-.2],[0,h-.2]]),0,0,0); p('chrome',CY(.006,.006,.12,6),0,h-.17,0); p('shade',CY(.11,.14,.2,32,true),0,h-.1,0); p('bulb',SP(.035,10,6),0,h-.13,0); },
    deskLamp(s,o,p){ p('frame',CY(.08,.085,.02,28),0,.01,0); p('frame',TU([[0,.02,0],[0,.25,-.06],[0,.36,.02]],.009),0,0,0); p('frame',TU([[0,.36,.02],[0,.44,.15],[0,.42,.24]],.008),0,0,0); p('frame',CY(.025,.06,.09,20,true),0,.4,.26,.5,0,0); p('bulb',SP(.022,8,6),0,.385,.27); },
    pendant(s,o,p){ const h=s.h, r=s.w/2; p('dark',CY(.004,.004,h-.18,6),0,-(h-.18)/2,0); p('frame',CY(.05,.05,.03,16),0,-.015,0); p('frame',LA([[.026,0],[.036,-.045],[r*.74,-.135],[r-.004,-.181],[r,-.18],[r*.75,-.13],[.04,-.04],[.03,0]].map(([a,b])=>[a,b-(h-.18)+.18])),0,-.18,0); p('bulb',SP(.045,12,8),0,-(h-.12),0); },
    sconce(s,o,p){ p('frame',RB(.1,.16,.02,.008),0,0,.01); p('frame',TU([[0,0,.02],[0,.04,.12],[0,.08,.17]],.008),0,0,0); p('shade',CY(.06,.08,.12,24,true),0,.1,.18); p('bulb',SP(.025,8,6),0,.08,.18); },
    plant(s,o,p){ const R=rng(7+Math.round(s.h*100)), ph=o.small?s.h*.45:.36, pr=o.small?s.w*.4:Math.min(.22,s.w*.36);
      p('pot',LA([[0,0],[pr*.78,0],[pr*.8,.01],[pr,ph*.92],[pr*1.03,ph],[pr*.93,ph],[pr*.9,ph*.97],[0,ph*.97]]),0,0,0); p('soil',CY(pr*.9,pr*.9,.01,20),0,ph*.95,0);
      if(o.gltfOnly) return; const n=LOQ?6:(o.small?8:14), top=s.h-ph;
      for(let i=0;i<n;i++){ const a=i*2.39996+R()*.3, L=top*(.45+R()*.45), tilt=.35+R()*.55, col=[0x2f6b2f,0x3d7f37,0x285c2b,0x4a8a3c][i%4];
        p('leaf',CY(.004,.006,L*.55,4),Math.sin(a)*.03,ph+L*.27,Math.cos(a)*.03,tilt*.6,a,0,0x3e6b2c); p('leaf',LEAF(L*.6,L*.36,.35),Math.sin(a)*(.03+L*.26*Math.sin(tilt*.6)),ph+L*.5,Math.cos(a)*(.03+L*.26*Math.sin(tilt*.6)),tilt,a,0,col); } },
    plantTall(s,o,p){ const R=rng(11), ph=.34, pr=Math.min(.18,s.w*.4); p('pot',LA([[0,0],[pr*.85,0],[pr,ph],[pr*.94,ph],[0,ph*.97]]),0,0,0); p('soil',CY(pr*.92,pr*.92,.01,20),0,ph*.95,0);
      const n=LOQ?5:11; for(let i=0;i<n;i++){ const a=i*2.39996, rr=R()*pr*.55, L=(s.h-ph)*(.55+R()*.45); p('leaf',LEAF(L,.07+R()*.03,.06,'blade'),Math.sin(a)*rr,ph*.95,Math.cos(a)*rr,.05+R()*.18,a+R()*.6,0,[0x2f5f2a,0x3f7a33,0x4d6f2a][i%3]); } },
    planter(s,o,p){ const {w,h,d}=s; p('pot',RB(w,h,d,.03,2),0,h/2,0); p('soil',RB(w-.06,.02,d-.06,.005),0,h-.03,0); if(LOQ) return; const R=rng(5); for(let i=0;i<Math.round(w*14);i++){ const x=-w/2+.08+R()*(w-.16), z=-d/2+.08+R()*(d-.16), a=R()*TAU; p('leaf',LEAF(.22+R()*.15,.1,.4),x,h-.03,z,.5+R()*.5,a,0,[0x2f6b2f,0x4a8a3c][i%2]); } },
    rug(s,o,p){ p('main',RB(s.w,Math.max(.008,s.h),s.d,.004,1),0,Math.max(.008,s.h)/2,0); },
    vase(s,o,p){ const h=s.h, r=s.w/2; p('pot',LA([[0,0],[r*.6,0],[r,h*.35],[r*.85,h*.7],[r*.4,h*.9],[r*.5,h],[r*.44,h],[r*.32,h*.9],[0,h*.85]]),0,0,0); },
    frameArt(s,o,p){ const {w,h,d}=s, fw=.04; for(const sy of [-1,1]) p('frame',RB(w,fw,d,.006),0,sy*(h/2-fw/2),d/2); for(const sx of [-1,1]) p('frame',RB(fw,h-2*fw,d,.006),sx*(w/2-fw/2),0,d/2); p(o.mirror?'mirror':'art',new THREE.PlaneGeometry(w-2*fw,h-2*fw),0,0,d*.4); },
    clock(s,o,p){ const r=s.w/2; p('white',CY(r,r,.03,40),0,0,.02,Math.PI/2,0,0); p('frame',TO(r,.012,8,40),0,0,.035); p('dark',RB(.01,r*.55,.004,.002),0,r*.25,.04,0,0,.6); p('dark',RB(.008,r*.8,.004,.002),0,r*.38,.042,0,0,-.9); },
    pillows(s,o,p){ p('main',RB(.45,.43,.13,.08,3),-.22,.215,0,-.15,.1,0); p('accent',RB(.42,.4,.13,.08,3),.22,.2,.02,-.2,-.12,0); },
    whiteboard(s,o,p){ const {w,h}=s; for(const sx of [-1,1]){ p('metal',CY(.015,.015,h-.08,10),sx*(w/2-.03),(h-.08)/2+.06,0); p('metal',RB(.04,.035,.55,.008),sx*(w/2-.03),.07,0); for(const sz of [-1,1]) p('dark',CY(.025,.025,.02,10),sx*(w/2-.03),.025,sz*.24,0,0,Math.PI/2); }
      p('metal',RB(w-.04,1.06,.035,.01),0,h-.65,0); p('board',new THREE.PlaneGeometry(w-.1,1.0),0,h-.65,.019); p('metal',RB(w*.5,.02,.06,.004),0,h-1.19,.04); },
    // SOFA CHỮ L hiện đại: thân 2–3 chỗ + đoản kỷ (chaise) bên phải (o.left: bên trái), nệm ngồi + nệm lưng tách múi bo tròn, chân kim loại mảnh
    sofaL(s,o,p){ const {w,h,d}=s, L=o.left?-1:1, md=.95, cw=Math.min(1.0,w*.36), aw=.15, lg=.1, ph=.17, by=lg, cxC=L*(w/2-cw/2), xm0=-w/2, xm1=w/2-cw; const xa=L>0?xm0:-xm1, xb=L>0?xm1:-xm0;
      const zB=-d/2, zM=zB+md/2;
      for(const [x,z] of [[xa+.07,zB+.08],[xa+.07,zB+md-.08],[L*(w/2-.07),zB+.08],[L*(w/2-.07),d/2-.08],[L*(w/2-cw+.07),d/2-.08],[(xa+xb)/2,zB+md-.08]]) p('frame',CY(.018,.012,lg,10),x,lg/2,z);
      p('main',RB(xb-xa,ph,md,.03,2),(xa+xb)/2,by+ph/2,zM); p('main',RB(cw,ph,d,.03,2),cxC,by+ph/2,0);
      p('main',RB(aw,.6-by,md,.06,3),L>0?xa+aw/2:xb-aw/2,by+(.6-by)/2,zM);
      p('main',RB(aw,.6-by,d,.06,3),L*(w/2-aw/2),by+(.6-by)/2,0);
      p('main',RB(w,h-by,.2,.07,3),0,by+(h-by)/2,zB+.1);
      const iw=(xb-xa)-aw, n=Math.max(1,Math.round(iw/.75)), cwi=iw/n, x0=L>0?xa+aw:xa;
      for(let i=0;i<n;i++){ const cx=x0+cwi*(i+.5); p('main',RB(cwi-.014,.16,md-.24,.07,3),cx,by+ph+.075,zB+.2+(md-.2)/2-.02); p('main',RB(cwi-.02,.46,.18,.08,3),cx,by+ph+.38,zB+.29,-.14,0,0); }
      const chw=cw-aw, chx=L*(w/2-aw-chw/2); p('main',RB(chw-.014,.16,d-.24,.07,3),chx,by+ph+.075,.1); p('main',RB(chw-.02,.46,.18,.08,3),chx,by+ph+.38,zB+.29,-.14,0,0);
      for(const [x,a] of [[x0+.3,-.25],[chx-L*.12,.3]]) p('accent',RB(.44,.42,.13,.08,3),x,by+ph+.4,zB+.44,-.25,a,0); },
    // TỦ BẾP DƯỚI: chân lùi tối, thân trắng, cánh/ngăn kéo vân gỗ, tay nắm thanh đen mảnh, mặt đá thạch anh; o.sink / o.hob: chậu rửa inox + vòi cổ ngỗng, bếp từ kính đen
    kitchenBase(s,o,p){ const {w,h,d}=s, pl=.1, ch=h-pl-.04, n=Math.max(1,Math.round(w/.6)), mw=w/n, sinkI=o.sink===false?-1:Math.min(n-1,Math.floor(n*.25)), hobI=o.hob===false?-1:Math.max(0,n-1-Math.floor(n*.25));
      p('dark',RB(w-.02,pl,d-.08,.004,1),0,pl/2,-.04); p('main',RB(w,ch,d-.02,.004,1),0,pl+ch/2,-.01); p('top',RB(w+.02,.04,d+.02,.006,2),0,h-.02,0);
      for(let i=0;i<n;i++){ const cx=-w/2+mw*(i+.5), fz=d/2;
        if(i===hobI || (i!==sinkI && i%2===1)){ const rows=[.18,.27,.27], tot=rows.reduce((a,b)=>a+b,0); let y=pl+.005; for(const rh of rows){ const fh=ch*rh/tot-.004; p('front',RB(mw-.004,fh,.019,.004,2),cx,y+fh/2,fz-.008); p('metal',RB(Math.min(.36,mw*.6),.012,.016,.004,1),cx,y+fh-.035,fz+.01); y+=fh+.004; } }
        else { const nd=mw>.75?2:1, dw=mw/nd; for(let k=0;k<nd;k++){ const dx=cx-mw/2+dw*(k+.5); p('front',RB(dw-.004,ch-.008,.019,.004,2),dx,pl+ch/2,fz-.008); p('metal',RB(.012,.3,.016,.004,1),dx+(nd>1?(k?-1:1):1)*(dw/2-.05),pl+ch-.2,fz+.01); } }
        if(i===sinkI){ p('chrome',RB(Math.min(.62,mw-.08),.006,.42,.01,1),cx,h+.001,.02); p('dark',RB(Math.min(.56,mw-.14),.004,.36,.008,1),cx,h+.004,.02); p('chrome',CY(.022,.026,.05,16),cx,h+.025,-d/2+.1);
          p('chrome',TU([[cx,h+.05,-d/2+.1],[cx,h+.32,-d/2+.1],[cx,h+.4,-d/2+.2],[cx,h+.3,-d/2+.3]],.012,10)); }
        if(i===hobI){ p('screen',RB(Math.min(.58,mw-.04),.008,.5,.004,1),cx,h+.004,.0); for(const [ox,oz,r] of [[-.13,-.1,.09],[.13,-.1,.07],[-.13,.12,.07],[.13,.12,.09]]) p('dark',TO(r,.003,4,40),cx+ox,h+.009,oz,Math.PI/2,0,0); } } },
    // TỦ BẾP TRÊN (đặt y = đáy tủ, thường 1,45 m): thân + cánh trắng không tay nắm, rãnh vát dưới, dải LED hắt xuống mặt đá
    kitchenWall(s,o,p){ const {w,h,d}=s, n=Math.max(1,Math.round(w/.6)), mw=w/n; p('main',RB(w,h,d-.02,.004,1),0,h/2,-.01);
      for(let i=0;i<n;i++){ const cx=-w/2+mw*(i+.5); p('front',RB(mw-.004,h-.006,.019,.004,2),cx,h/2+.006,d/2-.008); p('metal',RB(mw-.04,.01,.012,.003,1),cx,.012,d/2-.004); }
      p('bulb',RB(w-.04,.006,.02,.002,1),0,-.004,d/2-.08); },
    // TỦ CAO: tủ lạnh âm tủ (2 cánh dọc) hoặc tháp lò nướng (o.oven)
    kitchenTall(s,o,p){ const {w,h,d}=s, pl=.1; p('dark',RB(w-.02,pl,d-.08,.004,1),0,pl/2,-.04); p('main',RB(w,h-pl,d-.02,.004,1),0,pl+(h-pl)/2,-.01);
      if(o.oven){ const yO=.95; p('front',RB(w-.004,yO-pl-.004,.019,.004,2),0,pl+(yO-pl)/2,d/2-.008); p('screen',RB(w-.03,.6,.02,.004,1),0,yO+.3,d/2-.008); p('chrome',RB(w*.7,.016,.03,.006,1),0,yO+.56,d/2+.02);
        p('front',RB(w-.004,h-yO-.62,.019,.004,2),0,yO+.61+(h-yO-.62)/2,d/2-.008); p('metal',RB(.3,.012,.016,.004,1),0,yO+.66,d/2+.01); }
      else { const ys=pl+1.25; p('front',RB(w-.004,ys-pl-.006,.019,.004,2),0,pl+(ys-pl)/2,d/2-.008); p('front',RB(w-.004,h-ys-.004,.019,.004,2),0,ys+(h-ys)/2,d/2-.008); p('metal',RB(.012,.6,.016,.004,1),w/2-.05,ys-.4,d/2+.01); p('metal',RB(.012,.3,.016,.004,1),w/2-.05,ys+.2,d/2+.01); } },
    // ĐẢO BẾP: thân cánh gỗ phía trước, mặt đá thác nước 2 đầu, phía sau đua .3 m làm quầy bar
    kitchenIsland(s,o,p){ const {w,h,d}=s, bd=d-.3, pl=.1, ch=h-pl-.04, n=Math.max(1,Math.round((w-.1)/.6)), mw=(w-.1)/n;
      p('dark',RB(w-.14,pl,bd-.08,.004,1),0,pl/2,d/2-bd/2-.02); p('main',RB(w-.1,ch,bd,.004,1),0,pl+ch/2,d/2-bd/2-.01);
      p('top',RB(w,.045,d,.008,2),0,h-.0225,0); for(const sx of [-1,1]) p('top',RB(.045,h-.045,d,.008,2),sx*(w/2-.0225),(h-.045)/2,0);
      for(let i=0;i<n;i++){ const cx=-w/2+.05+mw*(i+.5); p('front',RB(mw-.004,ch-.008,.019,.004,2),cx,pl+ch/2,d/2-.01); p('metal',RB(.36,.012,.016,.004,1),cx,pl+ch-.06,d/2+.01); } },
    booksRow(s,o,p){ const R=rng(23), PAL=[0x8c2f39,0x1f4e79,0xd9c8a9,0x2f5d50,0x3a3a3a,0xb5651d,0xe8e2d0]; let x=-s.w/2; while(x<s.w/2-.02){ const bw=.03+R()*.03, bh=s.h*(.75+R()*.25); p('books',new THREE.BoxGeometry(bw,bh,s.d*(.85+R()*.15)),x+bw/2,bh/2,0,0,0,0,PAL[R()*PAL.length|0]); x+=bw+.002; } },
    trash(s,o,p){ const {w,h}=s, r=w/2; p('metal',LA([[0,0],[r*.92,0],[r,h],[r*.96,h],[r*.88,.01],[0,.01]]),0,0,0); p('dark',TO(r,.008,6,32),0,h,0,Math.PI/2,0,0); },
  };

  /* ============================== DANH MỤC ~55 MÓN (dims = kích thước thật [rộng, cao, sâu] m · mặt trước +Z) ============================== */
  const D=(w,h,d)=>({w,h,d});
  const CAT={
    // — ghế ngồi —
    officeChair:{cat:'ghế', b:'officeChair', dims:D(.64,1.02,.64), def:{main:'fabric:#3d4654'}, seat:{y:.5,z:.02}},
    officeChairExec:{cat:'ghế', b:'officeChair', p:{exec:1}, dims:D(.66,1.28,.66), def:{main:'leather:#2a2523'}, seat:{y:.5,z:.02}},
    diningChair:{cat:'ghế', src:'gallinera_chair', b:'diningChair', dims:D(.58,1.03,.6), def:{main:'fabric:#b9ab95', frame:'oak'}, seat:{y:.48,z:.04}},
    chairWood:{cat:'ghế', src:'painted_wooden_chair_01', b:'diningChair', dims:D(.43,.96,.54), def:{main:'oak', frame:'oak'}, seat:{y:.48,z:.03}},
    chairGreen:{cat:'ghế', src:'GreenChair_01', b:'diningChair', dims:D(.67,1.06,.66), def:{main:'velvet:#3f6b4a', frame:'walnut'}, seat:{y:.48,z:.04}},
    schoolChair:{cat:'ghế', src:'SchoolChair_01', b:'diningChair', dims:D(.57,1.01,.68), def:{main:'oak', frame:'steel'}, seat:{y:.47,z:.04}},
    plasticChair:{cat:'ghế', src:'plastic_monobloc_chair_01', b:'diningChair', dims:D(.64,.88,.63), def:{main:'white', frame:'white'}, seat:{y:.46,z:.04}},
    armchair:{cat:'ghế', src:'ArmChair_01', b:'sofa', p:{n:1,aw:.15}, dims:D(.85,1.07,.77), seat:{y:.47,z:.06}, solid:1},
    armchairModern:{cat:'ghế', src:'modern_arm_chair_01', tint:'pillow', b:'sofa', p:{n:1,aw:.1,legs:'metal'}, dims:D(.82,1.02,.99), seat:{y:.47,z:.08}, solid:1},
    loungeChair:{cat:'ghế', src:'mid_century_lounge_chair', b:'sofa', p:{n:1,aw:.12,low:1}, dims:D(1.01,1.17,1.19), def:{main:'leather:#3b2a20', frame:'walnut'}, seat:{y:.43,z:.12}, solid:1},
    sofa:{cat:'sofa', b:'sofa', p:{n:3}, dims:D(2.2,.82,.92), def:{main:'fabric:#8d8f93'}, seat:{y:.46,z:.1,bench:1.75}, solid:1},
    sofa2:{cat:'sofa', b:'sofa', p:{n:2}, dims:D(1.6,.82,.9), def:{main:'fabric:#8d8f93'}, seat:{y:.46,z:.1,bench:1.2}, solid:1},
    sofaClassic:{cat:'sofa', src:'Sofa_01', b:'sofa', p:{n:2,aw:.14}, dims:D(1.57,.8,.66), seat:{y:.45,z:.06,bench:1.25}, solid:1},
    sofaLong:{cat:'sofa', src:'sofa_03', tint:'^sofa_03$', b:'sofa', p:{n:3}, dims:D(2.73,1.12,.93), seat:{y:.47,z:.1,bench:2.2}, solid:1},
    ottoman:{cat:'ghế', src:'Ottoman_01', b:'ottoman', dims:D(.88,.62,.62), def:{main:'velvet:#6d5a7a'}, seat:{y:.5,z:0}, solid:1},
    barStool:{cat:'ghế', src:'bar_chair_round_01', b:'barStool', dims:D(.49,.75,.49), def:{main:'leather:#3a2a22'}, seat:{y:.78,z:0}},
    stool:{cat:'ghế', src:'metal_stool_02', b:'stool', dims:D(.45,.46,.47), def:{frame:'black'}, seat:{y:.49,z:0}},
    bench:{cat:'ghế', src:'painted_wooden_bench', b:'bench', dims:D(1.16,.89,.5), seat:{y:.48,z:.04,bench:1.0}, solid:1},
    // — bàn —
    desk:{cat:'bàn', b:'desk', dims:D(1.4,.75,.7), def:{main:'white'}, solid:1},
    deskMetal:{cat:'bàn', src:'metal_office_desk', b:'desk', dims:D(2.0,.79,.95), solid:1},
    meetingTable:{cat:'bàn', b:'meetingTable', dims:D(3.2,.75,1.2), def:{top:'walnut', frame:'black'}, solid:1},
    diningTable:{cat:'bàn', src:'dining_table', b:'table', p:{legs:'4'}, dims:D(2.26,.88,1.39), solid:1},
    roundTable:{cat:'bàn', src:'round_wooden_table_02', b:'table', p:{round:1}, dims:D(.8,.75,.8), solid:1, round:1},
    coffeeTable:{cat:'bàn', src:'modern_coffee_table_01', yaw0:Math.PI/2, b:'table', p:{legs:'4'}, dims:D(1.2,.39,.6), solid:1},
    coffeeTableRound:{cat:'bàn', src:'coffee_table_round_01', b:'table', p:{round:1,legs:'pedestal'}, dims:D(1.3,.49,1.3), solid:1, round:1},
    coffeeTableGlass:{cat:'bàn', src:'modern_coffee_table_02', b:'table', p:{glass:1,legs:'sled'}, dims:D(1.2,.37,1.2), def:{frame:'chrome'}, solid:1},
    sideTable:{cat:'bàn', src:'side_table_01', b:'table', p:{legs:'4'}, dims:D(.55,.55,.45), solid:1},
    sideTableTall:{cat:'bàn', src:'side_table_tall_01', b:'table', p:{round:1,legs:'pedestal',marble:1}, dims:D(.38,.76,.38), solid:1, round:1},
    console:{cat:'tủ', src:'ClassicConsole_01', b:'storage', p:{rows:1,cols:3,legs:1}, dims:D(1.54,.95,.59), def:{main:'walnut', front:'walnut', metal:'brass'}, solid:1},
    // — tủ / kệ —
    nightstand:{cat:'tủ', src:'ClassicNightstand_01', b:'storage', p:{rows:2,legs:1}, dims:D(.57,.7,.42), def:{main:'oak', front:'oak', metal:'brass'}, solid:1},
    nightstandModern:{cat:'tủ', b:'storage', p:{rows:2,legs:1,top:1}, dims:D(.5,.52,.4), def:{main:'white', front:'white', top:'oak', metal:'brass', frame:'oak'}, solid:1},
    cabinet:{cat:'tủ', b:'storage', p:{rows:3,cols:2}, dims:D(.8,1.1,.45), def:{main:'white', front:'white', metal:'alu'}, solid:1},
    filing:{cat:'tủ', b:'storage', p:{rows:4,cols:1}, dims:D(.47,1.32,.62), def:{main:'matte:#e4e6e8', front:'matte:#e4e6e8', metal:'alu'}, solid:1},
    wardrobe:{cat:'tủ', b:'storage', p:{rows:1,cols:2,doors:1}, dims:D(1.2,2.2,.6), def:{main:'white', front:'oak', metal:'black'}, solid:1},
    dresser:{cat:'tủ', src:'vintage_wooden_drawer_01', b:'storage', p:{rows:3,cols:2,legs:1}, dims:D(1.72,1.09,1.01), def:{main:'walnut', front:'walnut', metal:'brass'}, solid:1},
    cabinetWood:{cat:'tủ', src:'painted_wooden_cabinet', b:'storage', p:{rows:1,cols:2,doors:1,legs:1}, dims:D(1.19,1.18,.62), def:{main:'teak', front:'teak'}, solid:1},
    tvStand:{cat:'tủ', b:'storage', p:{rows:1,cols:3,legs:1,top:1}, dims:D(1.8,.5,.42), def:{main:'walnut', front:'walnut', top:'walnut', metal:'black'}, solid:1},
    bookshelf:{cat:'tủ', b:'shelf', p:{rows:5}, dims:D(1.0,2.0,.35), def:{main:'oak'}, solid:1},
    shelfSteel:{cat:'tủ', src:'steel_frame_shelves_02', b:'shelf', p:{rows:5,metal:1}, dims:D(.59,2.14,.5), def:{metal:'steel'}, solid:1},
    // — giường —
    bed:{cat:'giường', b:'bed', dims:D(1.7,1.1,2.15), def:{main:'linen:#d9d3c7', head:'boucle:#cfc6b8', frame:'boucle:#cfc6b8', accent:'velvet:#8a5a3c'}, lie:1, solid:1},
    bedSingle:{cat:'giường', b:'bed', dims:D(1.0,1.0,2.1), def:{main:'linen:#c9d3dc', head:'fabric:#9aa6b0', frame:'fabric:#9aa6b0'}, lie:1, solid:1},
    // — điện tử —
    tv:{cat:'điện tử', b:'tv', dims:D(1.24,.86,.22)}, tvWall:{cat:'điện tử', b:'tv', p:{wall:1}, anchor:'wall', dims:D(1.24,.72,.05)},
    monitor:{cat:'điện tử', b:'monitor', dims:D(.62,.5,.2), def:{metal:'dark'}}, laptop:{cat:'điện tử', b:'laptop', dims:D(.32,.23,.24)},
    tvRetro:{cat:'điện tử', src:'Television_01', b:'tv', dims:D(.6,.46,.47)},
    // — đèn —
    floorLamp:{cat:'đèn', b:'floorLamp', dims:D(.44,1.62,.44), def:{frame:'brass', stone:'marble'}}, tableLamp:{cat:'đèn', b:'tableLamp', dims:D(.3,.55,.3)}, deskLamp:{cat:'đèn', b:'deskLamp', dims:D(.18,.48,.4), def:{frame:'black'}},
    pendant:{cat:'đèn', src:'modern_ceiling_lamp_01', anchor:'hang', b:'pendant', dims:D(.43,.95,.43), def:{frame:'black'}},
    chandelier:{cat:'đèn', src:'lantern_chandelier_01', anchor:'hang', b:'pendant', dims:D(.58,.88,.57), def:{frame:'brass'}},
    sconce:{cat:'đèn', src:'industrial_wall_sconce', anchor:'wall', b:'sconce', dims:D(.15,.34,.25), def:{frame:'brass'}},
    // — cây —
    plant:{cat:'cây', src:'calathea_orbifolia_01', pick:'_b', keep:['pot','soil'], gl:{y:.34,h:.5}, b:'plant', dims:D(.6,.9,.6), def:{pot:'ceramic:#e9e4da'}, solid:1, round:1},
    plantTall:{cat:'cây', b:'plantTall', dims:D(.45,1.3,.45), def:{pot:'concrete:#5c5a56'}, solid:1, round:1},
    plantSmall:{cat:'cây', src:'potted_plant_04', b:'plant', p:{small:1}, dims:D(.17,.27,.18)},
    planter:{cat:'cây', src:'planter_box_02', b:'planter', dims:D(1.25,.45,.47), def:{pot:'concrete'}, solid:1},
    // — sofa chữ L + bếp hiện đại (dựng bằng code, kho CC0 không có) —
    sofaL:{cat:'sofa', b:'sofaL', dims:D(2.9,.84,1.7), def:{main:'boucle:#cfc8bc', frame:'black', accent:'velvet:#7a5a3c'}, seats:[{x:-.5,z:-.35,y:.47,bench:1.4},{x:.95,z:-.4,y:.6,lie:1}], solid:1},
    sofaLLeft:{cat:'sofa', b:'sofaL', p:{left:1}, dims:D(2.9,.84,1.7), def:{main:'boucle:#cfc8bc', frame:'black', accent:'velvet:#7a5a3c'}, seats:[{x:.5,z:-.35,y:.47,bench:1.4},{x:-.95,z:-.4,y:.6,lie:1}], solid:1},
    kitchenBase:{cat:'bếp', b:'kitchenBase', dims:D(2.4,.9,.62), def:{main:'white', front:'oak', top:'marble', metal:'black', chrome:'chrome', screen:'screen'}, solid:1},
    kitchenWall:{cat:'bếp', b:'kitchenWall', dims:D(2.4,.72,.35), def:{main:'white', front:'white', metal:'alu'}},
    kitchenTall:{cat:'bếp', b:'kitchenTall', dims:D(.62,2.2,.62), def:{main:'white', front:'oak', metal:'black'}, solid:1},
    kitchenOven:{cat:'bếp', b:'kitchenTall', p:{oven:1}, dims:D(.62,2.2,.62), def:{main:'white', front:'oak', metal:'black'}, solid:1},
    kitchenIsland:{cat:'bếp', b:'kitchenIsland', dims:D(2.2,.92,1.0), def:{main:'white', front:'oak', top:'marble', metal:'black'}, solid:1},
    // — model chi tiết thêm (21/11: Bình cho phép nặng hơn để giống thật) —
    plantFloor:{cat:'cây', src:'potted_plant_01', b:'plantTall', dims:D(.59,1.35,.63), def:{pot:'ceramic:#e9e4da'}, solid:1, round:1},
    plantMedium:{cat:'cây', src:'potted_plant_02', b:'plant', dims:D(.7,.84,.66), solid:1, round:1},
    plantMoney:{cat:'cây', src:'pachira_aquatica_01', pick:['_bark_b','_leaves_b'], keep:['pot','soil'], gl:{y:.3,h:1.6}, b:'plantTall', def:{pot:'ceramic:#2b2d30'}, dims:D(1.0,1.9,1.0), solid:1, round:1},
    anthurium:{cat:'cây', src:'anthurium_botany_01', pick:'_01_b', keep:['pot','soil'], gl:{y:.34,h:.5}, b:'plant', dims:D(.5,.84,.5), def:{pot:'ceramic:#1f2226'}, solid:1, round:1},
    sideboard:{cat:'tủ', src:'modern_wooden_cabinet', b:'storage', p:{rows:1,cols:4,doors:1,legs:1}, dims:D(2.44,.68,.52), def:{main:'walnut', front:'walnut', metal:'brass'}, solid:1},
    drawerCabinet:{cat:'tủ', src:'drawer_cabinet', b:'storage', p:{rows:6,cols:2}, dims:D(1.14,1.88,.49), def:{main:'oak', front:'oak', metal:'brass'}, solid:1},
    cabinetVintage:{cat:'tủ', src:'vintage_cabinet_01', b:'storage', p:{rows:2,cols:3,doors:1}, dims:D(2.02,2.24,.67), def:{main:'walnut', front:'walnut', metal:'brass'}, solid:1},
    chandelierCrystal:{cat:'đèn', src:'Chandelier_03', anchor:'hang', b:'pendant', dims:D(.78,1.04,.79), def:{frame:'gold'}},
    chandelierModern:{cat:'đèn', src:'Chandelier_02', anchor:'hang', b:'pendant', dims:D(.68,.85,.62), def:{frame:'brass'}},
    ceilingFan:{cat:'đèn', src:'ceiling_fan', anchor:'hang', b:'pendant', dims:D(1.46,.52,1.46), def:{frame:'walnut'}},
    deskLampArm:{cat:'đèn', src:'desk_lamp_arm_01', b:'deskLamp', dims:D(.2,.89,.61)},
    diningChairModern:{cat:'ghế', src:'dining_chair_02', b:'diningChair', dims:D(.43,.97,.58), def:{main:'oak', frame:'oak'}, seat:{y:.47,z:.03}},
    rockingChair:{cat:'ghế', src:'Rockingchair_01', b:'diningChair', dims:D(.71,.99,.83), def:{main:'oak', frame:'oak'}, seat:{y:.46,z:.05}},
    picnicTable:{cat:'bàn', src:'wooden_picnic_table', b:'table', dims:D(2.24,.75,3.02), def:{top:'teak', frame:'teak'}, solid:1},
    sideTableIndustrial:{cat:'bàn', src:'industrial_coffee_table', b:'table', p:{legs:'4'}, dims:D(.78,.64,.76), solid:1},
    books:{cat:'trang trí', src:'book_encyclopedia_set_01', b:'booksRow', dims:D(.55,.24,.16)},
    vaseBrass:{cat:'trang trí', src:'brass_vase_01', b:'vase', dims:D(.23,.69,.23), def:{pot:'brass'}},
    basket:{cat:'trang trí', src:'wicker_basket_01', b:'vase', dims:D(.38,.12,.3), def:{pot:'oak'}},
    pictureLarge:{cat:'trang trí', src:'fancy_picture_frame_02', anchor:'wall', b:'frameArt', dims:D(.66,.77,.09), def:{frame:'gold'}},
    // — trang trí —
    rug:{cat:'trang trí', b:'rug', dims:D(2.4,.012,1.7), def:{main:'boucle:#b8ab98'}},
    vase:{cat:'trang trí', src:'ceramic_vase_01', b:'vase', dims:D(.2,.4,.2)},
    picture:{cat:'trang trí', src:'fancy_picture_frame_01', anchor:'wall', b:'frameArt', dims:D(.6,.46,.03), def:{frame:'gold'}},
    mirror:{cat:'trang trí', src:'ornate_mirror_01', anchor:'wall', b:'frameArt', p:{mirror:1}, dims:D(.49,.74,.03), def:{frame:'gold'}},
    clock:{cat:'trang trí', src:'wall_clock', anchor:'wall', b:'clock', dims:D(.32,.32,.05)},
    pillows:{cat:'trang trí', src:'throw_pillows_01', b:'pillows', dims:D(.94,.45,.45), def:{main:'linen', accent:'velvet:#c46a3a'}},
    whiteboard:{cat:'trang trí', b:'whiteboard', dims:D(1.9,1.9,.6), solid:1},
    chalkboard:{cat:'trang trí', src:'standing_chalkboard_01', b:'whiteboard', dims:D(.92,1.51,.76)},
    trashBin:{cat:'trang trí', b:'trash', dims:D(.3,.5,.3), def:{metal:'steel'}, round:1},
  };
  const ROLE_LABEL={ghế:'🪑 Ngồi ghế (E · C)', sofa:'🛋️ Ngồi sofa (E · C)'};   // bếp: tủ dưới cao .9, tủ trên đặt y≈1,45 (đáy tủ)

  /* ============================== MODEL THẬT – nạp qua W.cc0 (cc0kit.js: bộ nạp GLTF DUY NHẤT của game) · xử lý NẠP DẦN theo khung hình ============================== */
  const CC=cc0Kit(W); const PROTO=new Map(); const SKIP={};
  // hàng đợi việc nặng (gộp lưới, đưa texture lên GPU, dựng InstancedMesh…): mỗi khung hình chỉ chạy tới hết ngân sách ms → không đứng hình
  const JOBS=[]; const job=fn=>new Promise((res,rej)=>JOBS.push(()=>{ try{ res(fn()); }catch(e){ rej(e); } }));
  function runJobs(budget=CFG.budgetMs){ const t0=now(); let n=0; while(JOBS.length && (n===0 || now()-t0<budget)){ JOBS.shift()(); n++; } return n; }
  async function digest(g,K){ const sc=g.scene; sc.updateMatrixWorld(true); const byMat=new Map(), picks=[].concat(K.pick||[]);
    const want=m=>{ if(!picks.length) return true; for(let q=m; q; q=q.parent) if(q.name && picks.some(p=>q.name.endsWith(p))) return true; return false; };
    sc.traverse(m=>{ if(!m.isMesh || !want(m)) return; const mat=Array.isArray(m.material)?m.material[0]:m.material; if(!byMat.has(mat)) byMat.set(mat,[]); byMat.get(mat).push(m); });
    const parts=[], box=new THREE.Box3(); let tris=0;
    for(const [mat,meshes] of byMat){ const geo=await job(()=>{ const geos=meshes.map(m=>{ const q=m.geometry.clone(); q.applyMatrix4(m.matrixWorld); return q; });
        const keys=Object.keys(geos[0].attributes).filter(k=>['position','normal','uv','uv1'].includes(k) && geos.every(q=>q.attributes[k])), anyNI=geos.some(q=>!q.index);
        const list=geos.map(q=>{ const r=anyNI && q.index? q.toNonIndexed(): q; for(const k of Object.keys(r.attributes)) if(!keys.includes(k)) r.deleteAttribute(k); return r; });
        const out=list.length>1? mergeGeometries(list): list[0]; if(list.length>1) for(const q of list) q.dispose(); if(out) out.computeBoundingBox(); return out; });
      if(!geo) continue; box.union(geo.boundingBox); tris+=(geo.index?geo.index.count:geo.attributes.position.count)/3; parts.push({geo, mat}); }
    if(!parts.length || tris>CFG.maxTris){ for(const pt of parts) pt.geo.dispose(); SKIP[K.src]=tris?'>'+CFG.maxTris+' tam giác ('+Math.round(tris)+')':'không có lưới'; return null; }
    const c=box.getCenter(new THREE.Vector3()), anc=K.anchor||'floor', ty=anc==='hang'?-box.max.y:anc==='wall'?-c.y:-box.min.y, tz=anc==='wall'?-box.min.z:-c.z;
    await job(()=>{ for(const pt of parts){ pt.geo.translate(-c.x,ty,tz); pt.geo.computeBoundingSphere(); } });
    const R=W.renderer; if(R && R.initTexture){ const texs=new Set(); for(const pt of parts) for(const k of ['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap','alphaMap']) if(pt.mat[k]) texs.add(pt.mat[k]);
      for(const t of texs) await job(()=>{ try{ R.initTexture(t); }catch(e){} }); }   // texture lên GPU từng tấm một / khung hình
    return {parts, size:box.getSize(new THREE.Vector3()), tris:Math.round(tris), vm:new Map()}; }
  function protoAcquire(K){ const key=K.src+'|'+[].concat(K.pick||[]).join(','); let e=PROTO.get(key);
    if(!e){ e={key, src:K.src, refs:0, data:undefined, idleAt:0}; PROTO.set(key,e);
      e.p=CC.acquire(K.src).then(g=>g?digest(g,K):null).catch(()=>null).then(d=>{ e.data=d; return d; }); }
    e.refs++; e.idleAt=0; return e; }
  function protoRelease(e){ if(!e) return; e.refs=Math.max(0,e.refs-1); if(!e.refs) e.idleAt=now(); }
  function protoDispose(e){ if(e.data){ const orig=new Set(e.data.parts.map(pt=>pt.mat)); for(const pt of e.data.parts) pt.geo.dispose(); for(const arr of e.data.vm.values()) for(const m of arr) if(!orig.has(m)) m.dispose(); }
    PROTO.delete(e.key); CC.release(e.src); }   // material/texture gốc thuộc cc0kit – cc0kit.sweep() huỷ khi hết tham chiếu
  // biên dịch shader trước (không chặn khung hình nếu trình duyệt hỗ trợ KHR_parallel_shader_compile)
  const WARM=new Set(), warmGeo=new THREE.BoxGeometry(.01,.01,.01);
  async function warm(mats,target){ const R=W.renderer, cam=W.camera; const todo=[...new Set(mats)].filter(m=>m && !WARM.has(m)); if(!todo.length || !R || !R.compileAsync || !cam) return; for(const m of todo) WARM.add(m);
    const tmp=new THREE.Scene(), ims=todo.map(m=>{ const im=new THREE.InstancedMesh(warmGeo,m,1); tmp.add(im); return im; });
    try{ await R.compileAsync(tmp, cam, target||W.scene); }catch(e){} for(const im of ims){ tmp.remove(im); im.dispose(); } }
  // tô lại màu theo độ sáng texture, chừa phần kim loại (kênh B của texture ARM Poly Haven)
  function texAvg(t){ if(!t || !t.image) return .2; if(t.userData.flAvg) return t.userData.flAvg; let v=.2;
    try{ const c=document.createElement('canvas'); c.width=c.height=16; const g=c.getContext('2d',{willReadFrequently:true}); g.drawImage(t.image,0,0,16,16); const d=g.getImageData(0,0,16,16).data; let s=0,n=0;
      for(let i=0;i<d.length;i+=4){ if(d[i+3]<100) continue; const l=(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])/255; s+=Math.pow(l,2.2); n++; } v=Math.max(.015,n?s/n:.2); }catch(e){}
    return (t.userData.flAvg=v); }
  function tintMat(src,color,pre){ const m=src.clone(); const P=PRE[pre]; if(P && !P.wood){ if(pre==='leather') m.roughness=Math.min(m.roughness,.6); else if(pre==='velvet'||pre==='fabric'||pre==='boucle'||pre==='linen'||pre==='matte') m.roughness=1; else if(pre==='white'||pre==='ceramic') m.roughness=.45; }
    if(color==null) return m; const tc=new THREE.Color(color), avg=texAvg(src.map); m.color.set(0xffffff);
    m.onBeforeCompile=sh=>{ sh.uniforms.flTint={value:tc}; sh.uniforms.flAvg={value:avg};
      sh.fragmentShader='uniform vec3 flTint;\nuniform float flAvg;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        { float flM=0.0;
        #ifdef USE_METALNESSMAP
          flM=texture2D(metalnessMap, vMetalnessMapUv).b;
        #endif
          float flL=dot(diffuseColor.rgb, vec3(.2126,.7152,.0722));
          vec3 flC=flTint*clamp(mix(1.0, flL/flAvg, .75), 0.0, 2.4);
          diffuseColor.rgb=mix(diffuseColor.rgb, flC, 1.0-smoothstep(.35,.65,flM)); }`); };
    m.customProgramCacheKey=()=>'furnTint1'; return m; }
  function variantMats(K,data,vg){ const key=vg.key; if(data.vm.has(key)) return data.vm.get(key); const re=K.tint?new RegExp(K.tint):null;
    const arr=data.parts.map(pt=>{ if(!vg.color && !vg.pre) return pt.mat; if(re && !re.test(pt.mat.name||'')) return pt.mat; if(pt.mat.transparent) return pt.mat; return tintMat(pt.mat, vg.color, vg.pre); });
    data.vm.set(key,arr); return arr; }

  /* ============================== LÔ (batch) = 1 món × 1 biến thể × 1 ô 32 m × 1 parent ============================== */
  const FB=new Map(), LODG=new Map();
  function fbParts(kind,K,size){ const key=kind+'|'+size.w.toFixed(3)+'|'+size.h.toFixed(3)+'|'+size.d.toFixed(3)+'|'+(size.opt||'')+'|'+(LOQ?'lo':'hi'); if(FB.has(key)) return FB.get(key);
    const p=collector(); try{ BLD[K.b](size, {...(K.p||{}), ...(size.opt?JSON.parse(size.opt):{})}, p); }catch(e){} FB.set(key,p.parts); return p.parts; }
  const colorize=(g,c)=>{ const n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b; } g.setAttribute('color', new THREE.BufferAttribute(a,3)); return g; };
  function fbRoleGeos(kind,K,size){ const key='R|'+kind+'|'+size.w+'|'+size.h+'|'+size.d+'|'+(size.opt||''); if(FB.has(key)) return FB.get(key); LOQ=false; const parts=fbParts(kind,K,size), by=new Map();
    for(const pt of parts){ const g=colorize(pt.g.clone(), pt.col!=null?new THREE.Color(pt.col):new THREE.Color(1,1,1)); if(!by.has(pt.role)) by.set(pt.role,[]); by.get(pt.role).push(g); }
    const out=new Map(); for(const [r,list] of by){ const m=mergeGeometries(list); for(const g of list) g.dispose(); if(m){ m.computeBoundingSphere(); out.set(r,m); } } FB.set(key,out); return out; }
  function lodGeo(kind,K,size,spec){ const key=kind+'|'+size.w+'|'+size.h+'|'+size.d+'|'+(size.opt||'')+'|'+JSON.stringify(spec); if(LODG.has(key)) return LODG.get(key); LOQ=true; let parts; try{ parts=fbParts(kind,K,size); } finally{ LOQ=false; }
    const list=parts.map(pt=>{ const c=specColor(spec[pt.role]||GLOBAL_DEF[pt.role]||'fabric'); if(pt.col!=null) c.multiply(new THREE.Color(pt.col)); return colorize(pt.g.clone(), c); });
    const g=list.length? mergeGeometries(list): null; for(const q of list) q.dispose(); if(g) g.computeBoundingSphere(); LODG.set(key,g); return g; }

  const batches=new Map(), dirty=new Set(); let flushQ=false;
  const queueFlush=()=>{ if(flushQ) return; flushQ=true; Promise.resolve().then(()=>{ flushQ=false; flush(); }); };
  function mkIM(geo,mat,b,extra){ const n=b.items.length, im=new THREE.InstancedMesh(geo,mat,n); for(let i=0;i<n;i++){ _M.copy(b.items[i].m); if(extra) _M.multiply(extra); im.setMatrixAt(i,_M); }
    im.instanceMatrix.needsUpdate=true; im.computeBoundingSphere(); im.userData.dynamic=true; im.userData.furn=b.kind; im.name='furn-'+b.kind; return im; }
  function clearMeshes(b,which){ const arr=b[which]; if(!arr) return; for(const m of arr){ m.removeFromParent(); m.dispose(); } b[which]=null; }
  function buildLod(b){ clearMeshes(b,'lod'); const g=lodGeo(b.kind,b.K,b.size,b.spec); if(!g){ b.lod=[]; return; } const im=mkIM(g,LODMAT,b); im.castShadow=false; im.receiveShadow=false; im.visible=false; b.group.add(im); b.lod=[im]; }
  function finishNear(b,data,roles){ if(b.dead) return; const K=b.K, out=[], cast=!LOW && !!K.solid && b.o.cast!==false;
    const addRole=r=>{ const g=roles.get(r); if(!g) return; const im=mkIM(g, matFor(b.spec[r]||GLOBAL_DEF[r]||'fabric'), b); im.castShadow=cast && r!=='glass' && r!=='leaf'; im.receiveShadow=true; out.push(im); };
    if(data){ const vm=variantMats(K,data,b.vg), gl=K.gl||{}, fit=(K.anchor==='wall'? K.dims.w/data.size.x : (gl.h||K.dims.h)/data.size.y), st=b.stretch;
      const G=new THREE.Matrix4().compose(_V.set(0,gl.y||0,0), _Q.setFromAxisAngle(_UP,K.yaw0||0), _S.set(fit,fit,fit)); G.premultiply(new THREE.Matrix4().makeScale(st.x,st.y,st.z));
      data.parts.forEach((pt,i)=>{ const im=mkIM(pt.geo, vm[i], b, G); im.castShadow=cast; im.receiveShadow=true; out.push(im); }); for(const r of (K.keep||[])) addRole(r); b.mode2='gltf'; }
    else { for(const r of roles.keys()) addRole(r); b.mode2='code'; }
    for(const im of out){ im.visible=b.mode==='near'; b.group.add(im); } b.near=out; b.nearReady=true; if(b.mode==='near') for(const m of (b.lod||[])) m.visible=false; }
  // dựng mesh gần theo từng bước nhỏ trong hàng đợi khung hình: tải (cc0kit) → gộp lưới → texture lên GPU → biên dịch shader → InstancedMesh
  function buildNear(b){ if(b.nearBusy) return; clearMeshes(b,'near'); b.nearReady=false; const K=b.K; b.nearBusy=true;
    (async()=>{ let data=null; if(K.src && !b.o.codeOnly && !SKIP[K.src]){ if(!b.proto) b.proto=protoAcquire(K); data=await b.proto.p; } if(b.dead) return;
      const roles=await job(()=>fbRoleGeos(b.kind,K,b.size)); if(b.dead) return;
      const mats=[]; if(data) mats.push(...variantMats(K,data,b.vg)); for(const r of (data?(K.keep||[]):[...roles.keys()])) if(roles.has(r)) mats.push(matFor(b.spec[r]||GLOBAL_DEF[r]||'fabric'));
      const top=topOf(b.parent); await warm(mats, top && top.isScene ? top : W.scene); if(b.dead) return;
      await job(()=>finishNear(b,data,roles)); })().catch(()=>{}).finally(()=>{ b.nearBusy=false; }); }
  function releaseNear(b){ clearMeshes(b,'near'); b.nearReady=false; if(b.proto){ protoRelease(b.proto); b.proto=null; } }
  function setMode(b,mode){ if(b.mode===mode) return; b.mode=mode; if(mode==='near' && !b.near && !b.nearBusy) buildNear(b);
    const nearOn=mode==='near' && b.nearReady; for(const m of (b.near||[])) m.visible=nearOn; for(const m of (b.lod||[])) m.visible=(mode==='lod') || (mode==='near' && !b.nearReady); }
  function flush(){ for(const b of dirty){ if(!b.items.length){ clearMeshes(b,'lod'); releaseNear(b); b.group.removeFromParent(); batches.delete(b.key); continue; }
      let sx=0,sy=0,sz=0; for(const it of b.items){ sx+=it.x; sy+=it.y; sz+=it.z; } const n=b.items.length; b.c.set(sx/n,sy/n,sz/n); let r=0; for(const it of b.items) r=Math.max(r,Math.hypot(it.x-b.c.x,it.z-b.c.z)); b.r=r+Math.max(b.size.w,b.size.d);
      if(!b.group.parent) b.parent.add(b.group); buildLod(b); const had=!!b.near; if(had){ clearMeshes(b,'near'); b.nearReady=false; } const m=b.mode; b.mode=null; setMode(b,m||'lod'); if(had && m==='near' && !b.near) buildNear(b); }
    dirty.clear(); tickNow(true); }

  /* ============================== VA CHẠM + CHỖ NGỒI ============================== */
  const pendingSeats=[];
  function addSeatSafe(fn){ if(W.addSeat) return fn(); pendingSeats.push(fn); return null; }
  function colliders(h,K,o,x,y,z,yaw,size){ if(o.collide===false || (!K.solid && !o.collide) || K.anchor==='hang' || K.anchor==='wall') return; const C=o.colliders||{}, boxes=C.boxes||W.boxes, circles=C.circles||W.circles, seg=C.addSeg||W.addSeg;
    const y0=y-.2, y1=y+size.h+.05;
    if(K.round && circles){ const c={x,z,r:Math.max(size.w,size.d)/2, y0, y1}; circles.push(c); h._col.push(['c',circles,c]); return; }
    const q=((yaw%(Math.PI/2))+Math.PI/2)%(Math.PI/2), axis=q<.03||q>Math.PI/2-.03, sw=Math.abs(Math.sin(yaw))>.7;
    if(axis && boxes){ const hw=(sw?size.d:size.w)/2, hd=(sw?size.w:size.d)/2, bx={x0:x-hw, x1:x+hw, z0:z-hd, z1:z+hd, y0, y1}; boxes.push(bx); h._col.push(['b',boxes,bx]); return; }
    if(seg){ const long=size.w>=size.d, L=(long?size.w:size.d)/2, r=(long?size.d:size.w)/2, dx=long?Math.cos(yaw):Math.sin(yaw), dz=long?-Math.sin(yaw):Math.cos(yaw), e=Math.max(0,L-r);
      const sg=seg(x-dx*e,z-dz*e,x+dx*e,z+dz*e,r,y0,y1,o.msg||'🪑 Đồ nội thất – đi vòng nhé'); if(sg) h._col.push(['s',null,sg]); } }
  function seats(h,K,o,x,y,z,yaw,size,sc){ if(o.sit===false || (!K.seat && !K.lie && !K.seats)) return; const c=Math.cos(yaw), s=Math.sin(yaw), at=(lx,lz)=>[x+lx*c+lz*s, z-lx*s+lz*c], scope=o.scope||'world';
    if(K.lie){ const two=size.w>1.25, pts=two?[-size.w/4,size.w/4]:[0];
      addSeatSafe(()=>{ for(const lx of pts){ const [px,pz]=at(lx,-size.d/2+.42); h.seats.push(W.addSeat({x:px, z:pz, rot:yaw, y:y+.66*sc, floor:y, lie:true, solo:true, scope, label:o.label||'🛏️ Nằm nghỉ (E · C)'})); } }); return; }
    if(K.seats){ const lb=typeof o.sit==='string'?o.sit:(o.label||ROLE_LABEL[K.cat]||'🪑 Ngồi (E · C)'), kx=size.w/K.dims.w, kz=size.d/K.dims.d;
      addSeatSafe(()=>{ for(const S of K.seats){ const [px,pz]=at(S.x*kx*sc,S.z*kz*sc); if(S.lie) h.seats.push(W.addSeat({x:px, z:pz, rot:yaw, y:y+S.y*sc, floor:y, lie:true, solo:true, scope, label:'🛋️ Nằm duỗi trên đoản kỷ (E · C)'}));
        else if(S.bench && W.addBench) h.seats.push(...W.addBench({x:px, z:pz, rot:yaw, len:S.bench*kx*sc, y:y+S.y*sc, floor:y, scope, label:lb})); else h.seats.push(W.addSeat({x:px, z:pz, rot:yaw, y:y+S.y*sc, floor:y, scope, label:lb})); } }); return; }
    const S=K.seat, [px,pz]=at(0,(S.z||0)*sc), label=typeof o.sit==='string'?o.sit:(o.label||ROLE_LABEL[K.cat]||'🪑 Ngồi (E · C)');
    addSeatSafe(()=>{ if(S.bench && W.addBench) h.seats.push(...W.addBench({x:px, z:pz, rot:yaw, len:S.bench*(size.w/K.dims.w)*sc, y:y+S.y*sc, floor:y, scope, label}));
      else h.seats.push(W.addSeat({x:px, z:pz, rot:yaw, y:y+S.y*sc, floor:y, scope, label, solo:!!o.solo})); }); }

  /* ============================== API ============================== */
  let uid=0;
  function place(kind,o={}){ const K=CAT[kind]; if(!K) return null; const parent=o.parent||W.scene; if(!parent) return null;
    const x=+o.x||0, y=+o.y||0, z=+o.z||0, yaw=+o.yaw||0, sc=typeof o.scale==='number'?o.scale:1, sv=Array.isArray(o.scale)?o.scale:[sc,sc,sc];
    const size={w:+(o.w||K.dims.w), h:+(o.h||K.dims.h), d:+(o.d||K.dims.d), opt:o.opt?JSON.stringify(o.opt):''}; const stretch=new THREE.Vector3(size.w/K.dims.w, size.h/K.dims.h, size.d/K.dims.d);
    const def={...(K.def||{})}; const user={}; if(o.material||o.color) user.main=(o.material||'')+(o.color?':'+(typeof o.color==='number'?'#'+o.color.toString(16).padStart(6,'0'):o.color):'');
    for(const r of ['frame','top','front','accent','head','pot','metal','linen','stone','chrome']) if(o[r]) user[r]=o[r]; if(o.roles) Object.assign(user,o.roles);
    const spec={...def, ...user}; if(user.main && !parseSpec(user.main).pre && def.main) spec.main=parseSpec(def.main).pre+user.main;   // chỉ đổi màu → giữ vật liệu mặc định
    const pm=parseSpec(user.main||''); const vg={color:pm.col||(pm.pre && !o.color && PRE[pm.pre] ? (PRE[pm.pre].wood||(PRE[pm.pre].c!=null?'#'+PRE[pm.pre].c.toString(16).padStart(6,'0'):null)) : null), pre:pm.pre}; vg.key=(vg.color||'')+'|'+(vg.pre||'');
    const vkey=JSON.stringify(spec)+'|'+vg.key+'|'+(o.codeOnly?1:0)+'|'+(o.cast===false?0:1), skey=size.w+','+size.h+','+size.d+','+size.opt;
    const cx=Math.floor(x/CFG.cell), cz=Math.floor(z/CFG.cell), key=[kind,vkey,skey,parent.uuid,cx,cz].join('#');
    let b=batches.get(key); if(!b){ b={key, kind, K, spec, vg, size, stretch, parent, o:{cast:o.cast, codeOnly:!!o.codeOnly}, items:[], group:new THREE.Group(), lod:null, near:null, nearReady:false, mode:null, proto:null, c:new THREE.Vector3(), r:1, farT:0}; b.group.name='furn-'+kind; batches.set(key,b); }
    const m=new THREE.Matrix4().compose(_V.set(x,y,z), _Q.setFromAxisAngle(_UP,yaw), _S.set(sv[0],sv[1],sv[2]));
    const it={x,y,z,yaw,m}; b.items.push(it); dirty.add(b); queueFlush();
    const h={id:++uid, kind, x,y,z,yaw, size, seats:[], _col:[], _b:b, _it:it,
      remove(){ const i=b.items.indexOf(it); if(i<0) return; b.items.splice(i,1); dirty.add(b); queueFlush();
        for(const [t,arr,c] of h._col){ if(t==='s'){ c.y0=-1e5; c.y1=-1e5+.1; } else { const j=arr.indexOf(c); if(j>=0) arr.splice(j,1); } } h._col=[];
        if(h.seats.length && W.dropSeats){ const S=new Set(h.seats); W.dropSeats(s=>S.has(s)); } h.seats=[]; } };
    colliders(h,K,o,x,y,z,yaw,{w:size.w*sv[0], h:size.h*sv[1], d:size.d*sv[2]}); seats(h,K,o,x,y,z,yaw,size,sv[1]);
    return h; }
  const placeMany=(kind,list,common={})=>(list||[]).map(it=>place(kind,{...common,...it}));

  /* ============================== GẦN/XA: nạp – LOD – ẩn – giải phóng ============================== */
  let lastT=0; const _w=new THREE.Vector3();
  function tickNow(force){ const t=now(); if(!force && t-lastT<CFG.tickMs) return; lastT=t; const P=W.P||{x:0,y:0,z:0}, cur=(W.renderPass && W.renderPass.scene)||W.scene;
    while(pendingSeats.length && W.addSeat) try{ pendingSeats.shift()(); }catch(e){}
    for(const b of batches.values()){ if(!b.items.length) continue; const top=topOf(b.parent), active=!(top && top.isScene && cur && top!==cur);
      _w.copy(b.c); if(b.parent!==W.scene && b.parent.localToWorld){ b.parent.updateWorldMatrix(true,false); b.parent.localToWorld(_w); }
      const d=active? Math.max(0, Math.hypot(P.x-_w.x, ((P.y||0)-_w.y)*1.4, P.z-_w.z)-b.r) : 1e9;
      if(d<CFG.near) setMode(b,'near'); else if(d<CFG.far){ if(!(b.mode==='near' && d<CFG.near+12)) setMode(b,'lod'); } else setMode(b,'hidden');
      if(b.mode!=='near' && (b.near||b.nearBusy) && d>CFG.near+25){ if(!b.farT) b.farT=t; else if(t-b.farT>CFG.releaseMs && !b.nearBusy){ releaseNear(b); b.farT=0; } } else b.farT=0; }
    for(const e of [...PROTO.values()]) if(!e.refs && e.idleAt && t-e.idleAt>CFG.protoIdleMs && e.data!==undefined) protoDispose(e);
    if(CC.sweep) CC.sweep(CFG.protoIdleMs); }
  if(W.HOOK && W.HOOK.onFrame) W.HOOK.onFrame.push(()=>{ runJobs(); tickNow(false); });

  function stats(){ let tris=0, calls=0, inst=0, near=0, lod=0, gl=0, code=0; const tc=g=>(g.index?g.index.count:g.attributes.position.count)/3;
    for(const b of batches.values()){ inst+=b.items.length; for(const m of (b.near||[])) if(m.visible){ calls++; tris+=tc(m.geometry)*m.count; } for(const m of (b.lod||[])) if(m.visible){ calls++; tris+=tc(m.geometry)*m.count; }
      if(b.mode==='near'){ near++; if(b.mode2==='gltf') gl++; else code++; } else if(b.mode==='lod') lod++; }
    let bytes=0; try{ for(const e of performance.getEntriesByType('resource')) if(e.name.includes('/cc0/polyhaven/')) bytes+=e.encodedBodySize||e.transferSize||0; }catch(e){}
    return {jobsPending:JOBS.length, batches:batches.size, items:inst, nearBatches:near, gltfBatches:gl, codeBatches:code, lodBatches:lod, drawCalls:calls, tris:Math.round(tris), modelsInMemory:[...PROTO.values()].filter(e=>e.data).map(e=>e.src+'('+e.data.tris+')'), skipped:{...SKIP}, mbLoaded:+(bytes/1048576).toFixed(2), range:{near:CFG.near, far:CFG.far}}; }
  const kinds=()=>Object.keys(CAT);
  const info=k=>{ const K=CAT[k]; return K && {kind:k, cat:K.cat, dims:{...K.dims}, src:K.src?('polyhaven:'+K.src):'code', anchor:K.anchor||'floor', seat:!!K.seat, lie:!!K.lie, solid:!!K.solid}; };
  // bày toàn bộ danh mục thành lưới để soát ảnh (dùng khi test)
  function showcase(x0,z0,y=0,o={}){ const out=[]; kinds().forEach((k,i)=>{ const K=CAT[k], col=i%8, row=Math.floor(i/8), x=x0+col*3.2, z=z0+row*3.4; const yy=K.anchor==='hang'?y+2.4:K.anchor==='wall'?y+1.4:y; out.push(place(k,{x, y:yy, z, yaw:0, sit:false, collide:false, ...o})); }); return out; }
  // gỡ toàn bộ đồ đặt dưới 1 parent (cảnh dựng lại theo tầng như interior.js) – va chạm/chỗ ngồi do module gọi tự dọn
  function clearParent(par){ for(const b of [...batches.values()]) if(b.parent===par){ b.dead=true; clearMeshes(b,'lod'); releaseNear(b); b.group.removeFromParent(); b.items.length=0; dirty.delete(b); batches.delete(b.key); } }
  function setRange(r={}){ if(r.near) CFG.near=r.near; if(r.far) CFG.far=r.far; tickNow(true); }
  function preload(list){ return Promise.all((list||[]).map(k=>{ const K=CAT[k]; if(!K || !K.src) return null; const e=protoAcquire(K); return e.p.then(d=>{ protoRelease(e); return d?k:null; }); })); }

  W.FURN={place, placeMany, clearParent, kinds, info, stats, showcase, setRange, preload, catalog:CAT, presets:Object.keys(PRE), available:()=>CC.available(), _batches:batches, _tick:()=>tickNow(true), _drain:()=>{ let n=0; while(JOBS.length && n<1e5) n+=runJobs(1e9); return n; }};
  return W.FURN;
}
