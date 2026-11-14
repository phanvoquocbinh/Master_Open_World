// QC World – Sprint 3: HỌC TẬP (miễn phí, trên đảo Master Dashboard).
// • TOÀ GIÁO TRÌNH (bờ Tây đảo): sảnh-thư viện + 6 tầng lớp học theo data/courses.json (17 khoá · 128 bài).
//   Mỗi phòng (P.101 … P.603) có giảng viên đứng giảng, màn chiếu tự chạy slide của khoá, học viên ngồi học.
//   Ngồi vào bàn → mở bài học (slide), học xong bài +10 💰, xong cả khoá có chứng chỉ +100 💰.
// • HỌC VIỆN QA: vào được – phòng thi trắc nghiệm (quiz 380 câu có sẵn).
// • THÁP BRAND QA: "bộ não" phát sáng trên đỉnh tháp (đồ hoạ; phần xử lý gắn từ dự án khác).
import { makePoser } from './pose.js';
import { batchStatic } from './perf.js';

export function makeCampus(W, L){
  const {THREE, renderPass, scene, camera, me, P, HOOK, circles, boxes, plats, INTER, PLACES, mesh, box, MAT, colorMat, makeActor, makeLabel, removeLabel, toast, cam, groundAt, groundH, teleport, CITY} = W;
  const {S, save, ui, addCoins, fmt, openQuiz, city} = L;
  S.learn=Object.assign({done:{}, certs:{}}, S.learn||{});
  let DATA=null; const load=()=>DATA?Promise.resolve(DATA):fetch('data/courses.json',{cache:'no-store'}).then(r=>r.json()).then(d=>(DATA=d));
  load().catch(()=>{});
  const R=Math.random, pick=a=>a[Math.floor(R()*a.length)], esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const hex=c=>'#'+c.toString(16).padStart(6,'0');
  const ct=(w,h,draw,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } return t; };
  const GL={}, glow=(c,k=1)=>GL[c+'|'+k]||(GL[c+'|'+k]=new THREE.MeshStandardMaterial({color:c, emissive:c, emissiveIntensity:k, roughness:.4}));
  const TEACH=['Thầy Bình Phan','Cô Bình Vip Pro','Thầy Bình Internship','Anh trai ốp pồ','Anh trai say Salary','Cô Lan ISTQB'];

  /* ============================== 1. NGOẠI THẤT TOÀ GIÁO TRÌNH ============================== */
  const TW={x:-58, z:0, w:16, d:22, floors:7};   // mặt tiền hướng +x (vào tâm đảo)
  { const gy=Math.max(.02, groundH(TW.x,TW.z)), g=new THREE.Group(); g.position.set(TW.x,gy,TW.z); scene.add(g); const H=TW.floors*3.6;
    const glass=new THREE.MeshPhysicalMaterial({color:0x2b5f8a, metalness:.5, roughness:.08, envMapIntensity:1.2, clearcoat:1}), frame=colorMat(0xeef1f5,{roughness:.3,metalness:.5});
    mesh(box(TW.w+6,.5,TW.d+6), MAT.stone, 0,.25,0, g); mesh(box(TW.w,H,TW.d), glass, 0,.5+H/2,0, g);
    for(let y=.5+3.6;y<H;y+=3.6) mesh(box(TW.w+.25,.25,TW.d+.25), frame, 0,y,0, g);
    for(const sz of [-1,-.5,0,.5,1]) for(const sx of [-1,1]) mesh(box(.3,H,.3), frame, sx*TW.w/2,.5+H/2,sz*TW.d/2, g);
    mesh(box(TW.w+1,1.2,TW.d+1), frame, 0,H+1.1,0, g);
    const sign=ct(1024,256,(c,w,h)=>{ c.fillStyle='#0b1424'; c.fillRect(0,0,w,h); const gr=c.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#ffd23f'); gr.addColorStop(1,'#46d39a'); c.fillStyle=gr; c.font='900 96px "Segoe UI",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('📚 TOÀ GIÁO TRÌNH',w/2,h/2+4); });
    const sm=new THREE.MeshStandardMaterial({map:sign, emissive:0xffffff, emissiveMap:sign, emissiveIntensity:.75}); for(const s of [-1,1]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(TW.d*.9,TW.d*.9/4), sm); p.position.set(s*(TW.w/2+.52),H+1.1,0); p.rotation.y=s*Math.PI/2; g.add(p); }
    // sảnh + mái che lối vào (mặt +x)
    mesh(box(4,3.2,.12), colorMat(0x8ec8f2,{roughness:.1}), TW.w/2+.07,2.1,0, g).rotation.y=Math.PI/2; mesh(box(3,.25,6.4), frame, TW.w/2+1.6,3.9,0, g);
    for(const s of [-1,1]) mesh(new THREE.CylinderGeometry(.1,.1,3.4,10), frame, TW.w/2+2.9,2.2,s*3, g);
    boxes.push({x0:TW.x-TW.w/2-.3, x1:TW.x+TW.w/2+.3, z0:TW.z-TW.d/2-.3, z1:TW.z+TW.d/2+.3});
    const door={x:TW.x+TW.w/2+2.3, z:TW.z}; TW.door=door;
    const rg=new THREE.Mesh(new THREE.RingGeometry(1,1.25,48), new THREE.MeshBasicMaterial({color:0xffd23f, transparent:true, opacity:.8, depthWrite:false, side:THREE.DoubleSide})); rg.rotation.x=-Math.PI/2; rg.position.set(door.x,gy+.06,door.z); rg.userData.dynamic=true; scene.add(rg); TW.ring=rg;
    makeLabel('📚 Toà Giáo trình', '17 khoá · 6 tầng lớp học · miễn phí', {h:.9, x:TW.x, y:H+5, z:TW.z, fade:160});
    INTER.push({x:door.x, z:door.z, r:2, label:'📚 Vào Toà Giáo trình (E)', action:()=>enter('tower',0)});
  }
  // Học viện QA (nhà trên đảo) → vào phòng thi
  const AC=city.academy;

  /* ============================== 2. BỘ NÃO PHÁT SÁNG (tháp Brand QA) ============================== */
  const brainU={uT:{value:0}};
  { const tp=CITY.places.tower; const geo=new THREE.SphereGeometry(1,72,48), pa=geo.attributes.position, v=new THREE.Vector3();
    for(let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa,i); const n=1+.07*Math.sin(v.x*13+v.y*5)*Math.sin(v.y*11-v.z*7)*Math.sin(v.z*12+v.x*4)+.03*Math.sin(v.y*31+v.z*23); v.multiplyScalar(n);
      if(Math.abs(v.x)<.06) v.x*= .3; v.x*=1.0+(v.x>0?.04:-.04); v.set(v.x*.92, v.y*.78, v.z*1.18); pa.setXYZ(i,v.x,v.y,v.z); }
    geo.computeVertexNormals();
    const bm=new THREE.MeshStandardMaterial({color:0x2a1650, emissive:0xb07cff, emissiveIntensity:1, roughness:.35, metalness:.1});
    bm.onBeforeCompile=sh=>{ sh.uniforms.uT=brainU.uT;
      sh.vertexShader='varying vec3 vBP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n  vBP=position;');
      sh.fragmentShader='uniform float uT;\nvarying vec3 vBP;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        float band=pow(abs(sin(vBP.y*9.0-uT*2.2+sin(vBP.x*7.0+uT)*1.5+vBP.z*4.0)),10.0);
        float spark=pow(abs(sin(vBP.z*15.0+uT*3.1)*sin(vBP.x*13.0-uT*1.7)),14.0);
        totalEmissiveRadiance*=(.28+1.8*band+2.2*spark);`); };
    bm.customProgramCacheKey=()=>'qc-brain';
    const br=new THREE.Mesh(geo, bm); br.scale.setScalar(4.2); br.position.set(tp.x, 65, tp.z); br.userData.dynamic=true; br.castShadow=false; scene.add(br);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(6.2,.12,8,64), glow(0x4fc3ff,2)); halo.position.copy(br.position); halo.rotation.x=Math.PI/2; halo.userData.dynamic=true; scene.add(halo);
    const np=new THREE.BufferGeometry(), N=180, arr=new Float32Array(N*3); for(let i=0;i<N;i++){ const a=R()*Math.PI*2, r=5+R()*3.5, y=(R()-.5)*7; arr.set([Math.cos(a)*r, y, Math.sin(a)*r], i*3); } np.setAttribute('position', new THREE.BufferAttribute(arr,3));
    const pts=new THREE.Points(np, new THREE.PointsMaterial({color:0xc9a8ff, size:.35, transparent:true, opacity:.85, depthWrite:false, blending:THREE.AdditiveBlending})); pts.position.copy(br.position); pts.userData.dynamic=true; scene.add(pts);
    BRAIN={br, halo, pts}; }
  var BRAIN;

  /* ============================== 3. CẢNH TRONG NHÀ ============================== */
  const CS=new THREE.Scene(); CS.background=new THREE.Color(0x0f1520);
  CS.add(new THREE.HemisphereLight(0xfff8f0, 0x6f665c, .6));
  const dl=new THREE.DirectionalLight(0xfff2e0, .85); dl.castShadow=true; dl.shadow.mapSize.set(1024,1024); Object.assign(dl.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:60}); dl.shadow.bias=-.0005; dl.shadow.normalBias=.02; CS.add(dl, dl.target);
  const root=new THREE.Group(); CS.add(root);
  const RW=18, RD=12, CH=3.6, FY=.1;
  const st={on:false, b:null, idx:0, floors:[], actors:[], rooms:[], saved:null, labels:[]};
  const fade=document.createElement('div'); fade.style.cssText='position:fixed;inset:0;background:#05080d;opacity:0;pointer-events:none;transition:opacity .28s;z-index:45'; document.body.appendChild(fade);
  const M=(geo,mat,x,y,z,parent=root)=>mesh(geo,mat,x,y,z,parent), solid=(x0,x1,z0,z1)=>boxes.push({x0,x1,z0,z1});
  const white=colorMat(0xf6f6f4,{roughness:.5}), dark=colorMat(0x2b2f36,{roughness:.6}), wallM=colorMat(0xe6e1d8,{roughness:.85}), woodM=MAT.wood, steel=new THREE.MeshStandardMaterial({color:0xb8bec6, metalness:.9, roughness:.25});
  const glassM=new THREE.MeshPhysicalMaterial({color:0xcfe8ff, transparent:true, opacity:.22, roughness:.05, side:THREE.DoubleSide, depthWrite:false});
  const carpet=(col)=>ct(256,256,(g,w,h)=>{ g.fillStyle=hex(col); g.fillRect(0,0,w,h); for(let i=0;i<7000;i++){ g.fillStyle=`rgba(255,255,255,${R()*.06})`; g.fillRect(R()*w,R()*h,1.5,1.5); } },[12,8]);
  const sky=ct(2048,512,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#8ec8f2'); gr.addColorStop(1,'#e8f3fb'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#2f86b5'; g.fillRect(0,h*.7,w,h*.3); for(let i=0;i<30;i++){ g.fillStyle='rgba(255,255,255,.5)'; g.fillRect(R()*w,h*.72+R()*h*.25,40+R()*80,2); }
    for(let i=0;i<14;i++){ const x=R()*w; g.fillStyle='#3b7a3a'; g.beginPath(); g.arc(x,h*.7,30+R()*40,Math.PI,0); g.fill(); } });
  function shell(fl, col){ const f=M(box(RW*2,.2,RD*2), new THREE.MeshStandardMaterial({map:fl.kind==='lobby'?null:carpet(col), color:fl.kind==='lobby'?0xe9e6df:0xffffff, roughness:fl.kind==='lobby'?.2:1}), 0,FY-.1,0); f.castShadow=false;
    const c=M(box(RW*2,.2,RD*2), white, 0,FY+CH+.1,0); c.castShadow=false; for(let x=-RW+3;x<RW;x+=4) for(let z=-RD+2.5;z<RD;z+=4){ const p=M(box(1.4,.04,.7), glow(0xfff6e6,1.1), x,FY+CH-.02,z); p.castShadow=false; }
    M(box(RW*2,CH,.2), wallM, 0,FY+CH/2,-RD-.1).castShadow=false;
    const band=(cx,cz,len,rotY)=>{ const g=new THREE.Group(); g.position.set(cx,0,cz); g.rotation.y=rotY; root.add(g); M(box(len,.9,.2), wallM, 0,FY+.45,0, g); M(box(len,.45,.2), wallM, 0,FY+CH-.22,0, g);
      const v=new THREE.Mesh(new THREE.PlaneGeometry(len,CH-1.35), new THREE.MeshBasicMaterial({map:sky})); v.position.set(0,FY+.9+(CH-1.35)/2,-.6); g.add(v); for(let x=-len/2;x<=len/2+.01;x+=2.4) M(box(.08,CH-1.35,.1), dark, x,FY+.9+(CH-1.35)/2,.02, g); };
    band(0,RD+.1,RW*2,Math.PI); band(-RW-.1,0,RD*2,Math.PI/2); band(RW+.1,0,RD*2,-Math.PI/2);
    solid(-RW-2,RW+2,-RD-2,-RD+.15); solid(-RW-2,RW+2,RD-.15,RD+2); solid(-RW-2,-RW+.15,-RD-2,RD+2); solid(RW-.15,RW+2,-RD-2,RD+2); plats.push({t:'r', x:0, z:0, c:1, s:0, hw:RW, hd:RD, h:FY});
    if(st.b==='tower'){ for(const s of [-1,1]){ M(box(1.5,2.5,.12), steel, s*1.65,FY+1.25,-RD+.08); M(box(1.8,2.8,.1), dark, s*1.65,FY+1.4,-RD+.03); }
      INTER.push({x:0, z:-RD+1.7, r:1.7, label:'🛗 Thang máy · chọn tầng', action:()=>elevator()}); }
    if(fl.kind==='lobby' || fl.kind==='exam'){ M(box(3,2.6,.08), steel, 0,FY+1.3,RD-.05); INTER.push({x:0, z:RD-1.4, r:1.6, label:'🚪 Ra ngoài', action:()=>exit()}); }
    const pl=ct(1024,160,(g,w,h)=>{ g.fillStyle='#fff'; g.fillRect(0,0,w,h); g.fillStyle=hex(col); g.fillRect(0,0,22,h); g.fillStyle='#1b2233'; g.font='800 60px "Segoe UI",sans-serif'; g.textBaseline='middle'; g.fillText(fl.title,50,h/2-22); g.font='500 40px "Segoe UI",sans-serif'; g.fillStyle='#5b6474'; g.fillText(fl.sub||'',50,h/2+38); });
    M(box(4.6,.7,.05), new THREE.MeshStandardMaterial({map:pl}), -6,FY+2.3,-RD+.12); }
  const seat=(x,z,rot,y,o={})=>W.addSeat && W.addSeat({x, z, rot, y, floor:FY, scope:'interior', label:'🪑 Ngồi (E · C)', ...o});
  function chair(x,z,rot,sit=true){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; root.add(g); M(box(.46,.06,.46),dark,0,FY+.46,0,g); M(box(.46,.5,.05),dark,0,FY+.74,-.21,g); M(new THREE.CylinderGeometry(.03,.03,.42,6),steel,0,FY+.22,0,g);
    return sit ? seat(x+Math.sin(rot)*.04, z+Math.cos(rot)*.04, rot, FY+.5) : null; }
  function plant(x,z,s=1){ M(new THREE.CylinderGeometry(.28*s,.22*s,.5*s,12), white, x,FY+.25*s,z); for(let i=0;i<6;i++){ const l=M(new THREE.SphereGeometry(.28*s,8,6), colorMat(0x3f8f3a), x+(R()-.5)*.35*s, FY+.65*s+R()*.5*s, z+(R()-.5)*.35*s); l.scale.y=1.4; } circles.push({x,z,r:.35*s}); }
  function shelf(x,z,len,rot){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; root.add(g); M(box(len,2.2,.4),woodM,0,FY+1.1,0,g);
    for(let r=0;r<4;r++) for(let k=0;k<len/.13-1;k++){ if(R()<.12) continue; const h=.3+R()*.12; M(box(.1,h,.28), colorMat(pick([0xb33a3a,0x2f5fb3,0xc98a1e,0x2a7a4f,0x6b4fa0,0xe9e2d0])), -len/2+.15+k*.13,FY+.32+r*.5+h/2,.08,g); }
    const c=Math.abs(Math.cos(rot)), s=Math.abs(Math.sin(rot)); solid(x-c*len/2-s*.3, x+c*len/2+s*.3, z-s*len/2-c*.3, z+s*len/2+c*.3); }
  // người
  const PE=()=>W.people;
  function person(role, x, z, h, mode, o={}){ const P2=PE(); const seed=o.seed ?? ((st.idx*977+st.actors.length*131+(st.b==='academy'?55:0))>>>0); const k=P2?P2.kit(seed,{outfit:o.outfit}):null; if(!k) return null;
    const name=o.name||`${P2.nameOf(seed)} · ${role}`; const a=makeActor(k.gl,{name, height:k.h, face:0, clips:k.clips, compact:false, dot:o.dot||'#7aa2ff', group:'interior', parent:root});
    a.play('idle',0); a.mixer.update(R()*3); const p=makePoser(THREE,a), hh=p.hipsHeight(); const anchor=new THREE.Object3D(); anchor.position.y=k.h+.7; a.g.add(anchor);
    const ob={a,p,x,z,h,mode,hh,anchor,t:R()*10,path:o.path||null,wi:0}; placeA(ob); if(['stand','present','cross'].includes(mode)) circles.push({x,z,r:.35}); st.actors.push(ob); return ob; }
  function placeA(o){ const seated=['type','sit'].includes(o.mode); o.a.g.position.set(o.x, seated?FY+.46-o.hh+.06:FY, o.z); o.a.g.rotation.y=o.h; }
  const sayNow=(o,text,sec=5)=>{ if(!o) return; if(o.bub) removeLabel(o.bub); o.bub=makeLabel(text, null, {fs:36, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.94)', color:'#1b2233', fade:22, group:'interior'}); o.bubT=sec; };

  /* ---------- màn chiếu slide ---------- */
  function drawSlide(g, w, h, c, li, si){ const les=c.lessons[li], sl=les.slides[si]||les.slides[0];
    const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#0f1f3a'); gr.addColorStop(1,'#1b2f55'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.fillStyle='#ffd23f'; g.fillRect(0,0,w,10); g.fillStyle='#9fb3c8'; g.font='600 26px "Segoe UI",sans-serif'; g.fillText(`${c.icon} ${c.name} · Bài ${li+1}: ${les.title}`.slice(0,70),40,52);
    g.fillStyle='#fff'; g.font='800 46px "Segoe UI",sans-serif'; g.fillText(String(sl.h).slice(0,40),40,120);
    g.font='500 27px "Segoe UI",sans-serif'; g.fillStyle='#dfe7f2'; let y=170; for(const para of String(sl.body).split('\n')){ let line=''; for(const word of para.split(' ')){ const t=line?line+' '+word:word; if(g.measureText(t).width>w-80){ g.fillText(line,40,y); y+=36; line=word; if(y>h-40) break; } else line=t; } if(y>h-40) break; g.fillText(line,40,y); y+=40; }
    g.fillStyle='#46d39a'; g.font='600 22px "Segoe UI",sans-serif'; g.fillText(`Slide ${si+1}/${les.slides.length}`,w-180,h-24); }
  function room(c, x0,x1,z0,z1, facing){   // facing: hướng học viên nhìn (màn chiếu ở phía đó): '-z' | '+x'
    const cx=(x0+x1)/2, cz=(z0+z1)/2, cv=document.createElement('canvas'); cv.width=1024; cv.height=576; const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace;
    const r={c, li:0, si:0, t:4+R()*4, cv, tx, teacher:null};
    // tường: kính phía hành lang, tường đặc giữa các phòng
    if(facing==='-z'){ const gw=new THREE.Mesh(box(x1-x0,CH,.06), glassM); gw.position.set(cx,FY+CH/2,z1); root.add(gw); solid(x0,x1-1.6,z1-.08,z1+.08); solid(x1-.2,x1,z1-.08,z1+.08);
        for(const x of [x0,x1]) M(box(.14,CH,z1-z0), wallM, x,FY+CH/2,cz).castShadow=false; solid(x0-.1,x0+.1,z0,z1); solid(x1-.1,x1+.1,z0,z1);
        const sc=new THREE.Mesh(new THREE.PlaneGeometry(4.6,2.6), new THREE.MeshStandardMaterial({map:tx, emissive:0xffffff, emissiveMap:tx, emissiveIntensity:.8})); sc.position.set(cx,FY+1.95,z0+.13); root.add(sc); M(box(4.8,2.8,.05), dark, cx,FY+1.95,z0+.1);
        r.teacher=person('Giảng viên', cx+3, z0+1.4, -.5, 'present', {name:TEACH[(c.floor*3+(+c.room.slice(-1)))%TEACH.length]+' · GV', dot:'#ffd23f', outfit:{shirt:0xffffff, long:true}});
        M(box(1.6,.75,.7), woodM, cx-3,FY+.38,z0+1.3); solid(cx-3.8,cx-2.2,z0+.9,z0+1.7);
        const rows=[z0+3.4,z0+5.2,z0+7], cols=[cx-2.6,cx-.9,cx+.9,cx+2.6]; let k=0; r.free=[];
        for(const z of rows){ for(const x of cols){ M(box(1.4,.05,.6), white, x,FY+.74,z-.32); M(box(.05,.72,.5), steel, x-.65,FY+.37,z-.32); M(box(.05,.72,.5), steel, x+.65,FY+.37,z-.32);
            for(const sx of [-.33,.33]){ const sx2=x+sx; const s=chair(sx2,z+.15,Math.PI,true); if(R()<.42 && k<7){ k++; person('Học viên', sx2, z+.15, Math.PI, R()<.5?'type':'sit'); if(s) s.taken='bot'; } else if(s) r.free.push(s); } }
          solid(cx-3.4,cx+3.4,z-.65,z+.05); }
        r.door={x:x1-.8, z:z1+.9}; }
    else { // phòng phía trước bên phải: màn ở tường x1, học viên nhìn +x
      const gw=new THREE.Mesh(box(.06,CH,z1-z0), glassM); gw.position.set(x0,FY+CH/2,cz); root.add(gw); solid(x0-.08,x0+.08,z0+1.6,z1);
      const gw2=new THREE.Mesh(box(x1-x0,CH,.06), glassM); gw2.position.set(cx,FY+CH/2,z0); root.add(gw2); solid(x0,x1,z0-.08,z0+.08);
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(4.6,2.6), new THREE.MeshStandardMaterial({map:tx, emissive:0xffffff, emissiveMap:tx, emissiveIntensity:.8})); sc.position.set(x1-.14,FY+1.95,cz); sc.rotation.y=-Math.PI/2; root.add(sc); M(box(.05,2.8,4.8), dark, x1-.1,FY+1.95,cz);
      r.teacher=person('Giảng viên', x1-1.4, cz-3, -Math.PI/2+.5, 'present', {name:TEACH[(c.floor*3+(+c.room.slice(-1)))%TEACH.length]+' · GV', dot:'#ffd23f', outfit:{shirt:0xffffff, long:true}});
      const cols=[x1-3.6,x1-5.4,x1-7.2], rows=[cz-2.6,cz-.9,cz+.9,cz+2.6]; let k=0; r.free=[];
      for(const x of cols){ for(const z of rows){ M(box(.6,.05,1.4), white, x+.32,FY+.74,z); M(box(.5,.72,.05), steel, x+.32,FY+.37,z-.65); M(box(.5,.72,.05), steel, x+.32,FY+.37,z+.65);
          for(const sz of [-.33,.33]){ const s=chair(x-.15,z+sz,Math.PI/2,true); if(R()<.42 && k<6){ k++; person('Học viên', x-.15, z+sz, Math.PI/2, R()<.5?'type':'sit'); if(s) s.taken='bot'; } else if(s) r.free.push(s); } }
        solid(x-.05,x+.65,cz-3.4,cz+3.4); }
      r.door={x:x0-.9, z:z0+.8}; }
    // biển phòng
    const plT=ct(1024,200,(g,w,h)=>{ g.fillStyle='#0f1724'; g.fillRect(0,0,w,h); g.fillStyle='#ffd23f'; g.font='900 70px "Segoe UI",sans-serif'; g.fillText('P.'+c.room,30,82); g.fillStyle='#fff'; g.font='700 46px "Segoe UI",sans-serif'; g.fillText(`${c.icon} ${c.name}`.slice(0,34),30,150); g.fillStyle='#9fb3c8'; g.font='500 28px "Segoe UI",sans-serif'; g.fillText(`${c.level} · ${c.hours} giờ · ${c.lessons.length} bài`,560,82); });
    const pm=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.47), new THREE.MeshStandardMaterial({map:plT, emissive:0xffffff, emissiveMap:plT, emissiveIntensity:.5}));
    if(facing==='-z'){ pm.position.set(cx,FY+2.75,z1+.05); } else { pm.position.set(x0-.05,FY+2.75,cz); pm.rotation.y=-Math.PI/2; } root.add(pm);
    INTER.push({x:r.door.x, z:r.door.z, r:1.6, prio:.4, label:`📖 P.${c.room} · ${c.name} – xem bài học (E)`, action:()=>openCourse(c.id)});
    // ghế trống cho người chơi: ngồi → mở bài học
    for(const s of r.free){ s.label=`🎓 Ngồi học ${c.name} (E · C)`; s.onSit=()=>setTimeout(()=>openCourse(c.id), 350); }
    r.redraw=()=>{ drawSlide(cv.getContext('2d'), 1024, 576, c, r.li, r.si); tx.needsUpdate=true; }; r.redraw(); st.rooms.push(r); return r; }

  /* ---------- các loại tầng ---------- */
  const FCOL=[0x46d39a,0x4fc3ff,0xff8fc2,0xffb547,0x9b8cff,0xff6b81];
  const BUILD={
    lobby(fl){ shell(fl, 0x2f6fd0);
      M(box(5,1.1,1), white, 0,FY+.55,4); M(box(5.2,.06,1.2), dark, 0,FY+1.13,4); M(box(5,.25,.04), glow(0x46d39a,.8), 0,FY+.75,4.52); solid(-2.6,2.6,3.4,4.6);
      person('Thủ thư', 0, 2.9, 0, 'stand', {outfit:{shirt:0x46a36b, long:true}, dot:'#46d39a'});
      // sơ đồ khoá học
      const dir=ct(1536,1024,(g,w,h)=>{ g.fillStyle='#0f1724'; g.fillRect(0,0,w,h); g.fillStyle='#ffd23f'; g.font='900 64px "Segoe UI",sans-serif'; g.fillText('📚 SƠ ĐỒ KHOÁ HỌC',40,84);
        let y=150; for(const f of DATA.floors){ g.fillStyle=hex(FCOL[(f.floor-1)%6]); g.font='800 34px "Segoe UI",sans-serif'; g.fillText(f.name,40,y); y+=8;
          for(const c of DATA.courses.filter(c=>c.floor===f.floor)){ y+=40; g.fillStyle='#fff'; g.font='500 30px "Segoe UI",sans-serif'; g.fillText(`P.${c.room}  ${c.icon} ${c.name}`,70,y); g.fillStyle=S.learn.certs[c.id]?'#46d39a':'#9fb3c8'; g.fillText(S.learn.certs[c.id]?'✓ đã xong':`${c.lessons.length} bài`,w-260,y); } y+=56; } });
      const dp=new THREE.Mesh(new THREE.PlaneGeometry(6,4), new THREE.MeshStandardMaterial({map:dir, emissive:0xffffff, emissiveMap:dir, emissiveIntensity:.55})); dp.position.set(-11,FY+2,-RD+.15); root.add(dp); M(box(6.2,4.2,.08), dark, -11,FY+2,-RD+.1);
      INTER.push({x:-11, z:-RD+2.2, r:2.2, prio:.4, label:'📚 Danh mục khoá học – chọn khoá để học (E)', action:()=>catalog()});
      // thư viện + bàn đọc
      for(const z of [-6,-2,2,6]) shelf(-RW+.6,z,3.6,Math.PI/2); for(const x of [9,13]) shelf(x,-RD+.6,3.6,0);
      for(const [x,z] of [[-10,0],[-10,5],[8,2],[8,7]]){ M(box(2.4,.06,1.1), woodM, x,FY+.75,z); for(const sx of [-1.1,1.1]) M(box(.06,.72,.9), steel, x+sx,FY+.37,z); solid(x-1.25,x+1.25,z-.6,z+.6);
        for(const sx of [-.6,.6]){ chair(x+sx,z-.95,0); const s=chair(x+sx,z+.95,Math.PI); if(R()<.4){ person('Học viên', x+sx, z+.95, Math.PI, 'type'); if(s) s.taken='bot'; } } }
      for(const [x,z] of [[-RW+1,RD-1.2],[RW-1,RD-1.2],[6,-RD+1.2],[-6,-RD+1.2]]) plant(x,z,1.2);
      person('Học viên', 4, 8, 0, 'walk', {path:[[4,8],[4,-4],[-6,-4],[-6,8]]});
      M(box(4,.05,2.6), colorMat(0x8a7b6a,{roughness:1}), 12,FY+.03,9).castShadow=false;
      const sf=new THREE.Group(); sf.position.set(12,0,10.3); sf.rotation.y=Math.PI; root.add(sf); const sm=colorMat(0x34495e,{roughness:.9}); M(box(3.2,.45,.9),sm,0,FY+.23,0,sf); M(box(3.2,.6,.25),sm,0,FY+.6,-.36,sf); solid(10.3,13.7,9.8,10.8);
      for(const k of [-.9,0,.9]) seat(12-k,9.95,Math.PI,FY+.46,{r:2,label:'🛋️ Ngồi đọc sách (E · C)'}); },
    course(fl){ const col=FCOL[(fl.floor-1)%6]; shell(fl, [0x3e4a5c,0x3f5248,0x55465e,0x5e4a3a,0x4b4a5e,0x434d43][(fl.floor-1)%6]);
      const cs=DATA.courses.filter(c=>c.floor===fl.floor).sort((a,b)=>a.room.localeCompare(b.room));
      const slots=[[-RW+.2,-2.4,-RD+.2,-2,'-z'],[2.4,RW-.2,-RD+.2,-2,'-z'],[4,RW-.2,2.6,RD-.2,'+x']];
      cs.forEach((c,i)=>{ const s=slots[i]; if(s) room(c, s[0],s[1],s[2],s[3],s[4]); });
      // khu tự học phía trước bên trái
      for(const [x,z] of [[-13,6],[-8,6]]){ M(box(2.4,.06,1.1), woodM, x,FY+.75,z); for(const sx of [-1.1,1.1]) M(box(.06,.72,.9), steel, x+sx,FY+.37,z); solid(x-1.25,x+1.25,z-.6,z+.6); for(const sx of [-.6,.6]){ chair(x+sx,z-.95,0); chair(x+sx,z+.95,Math.PI); } }
      const nb=ct(768,512,(g,w,h)=>{ g.fillStyle='#c79a63'; g.fillRect(0,0,w,h); for(let i=0;i<9;i++){ g.fillStyle=pick(['#fff8c4','#c4f1ff','#ffd6e7','#d6ffd6']); g.save(); g.translate(30+(i%3)*240,30+Math.floor(i/3)*160); g.rotate((R()-.5)*.1); g.fillRect(0,0,200,130); g.fillStyle='#333'; g.font='600 20px "Segoe UI",sans-serif';
        g.fillText(pick(['Lịch thi cuối khoá: T6','CLB Automation tối T4','Tìm bạn học JMeter','Workshop Playwright','Hackathon QA 🏆','Mượn sách ở tầng 1']),12,40); g.restore(); } });
      const np=new THREE.Mesh(new THREE.PlaneGeometry(3,2), new THREE.MeshStandardMaterial({map:nb})); np.position.set(-10.5,FY+1.8,RD-.25); np.rotation.y=Math.PI; root.add(np);
      M(box(.5,1.3,.5), colorMat(0x9ad7ff), -RW+.8,FY+.65,10); circles.push({x:-RW+.8,z:10,r:.4});
      for(let i=0;i<6;i++) M(box(.6,1.9,.5), colorMat(i%2?0x7d8792:0x8f99a4,{roughness:.5,metalness:.3}), -3.5-i*.62,FY+.95,RD-.4); solid(-7.2,-3.1,RD-.7,RD);
      person('Học viên', -10.5, 3.4, Math.PI, 'walk', {path:[[-10.5,3.4],[0,0],[3,-.6],[-14,-.6]]});
      for(const [x,z] of [[-RW+1,-1.2],[RW-1,1.2],[3,RD-1.2]]) plant(x,z,1.1); },
    exam(fl){ shell(fl, 0x2f6fd0);
      const bd=ct(1536,512,(g,w,h)=>{ g.fillStyle='#0f1724'; g.fillRect(0,0,w,h); g.fillStyle='#ffd23f'; g.font='900 92px "Segoe UI",sans-serif'; g.fillText('🎓 HỌC VIỆN QA',40,130); g.fillStyle='#fff'; g.font='600 48px "Segoe UI",sans-serif'; g.fillText('Phòng thi trắc nghiệm · 380 câu · 10 chủ đề',40,230); g.fillStyle='#46d39a'; g.fillText('Ngồi vào máy, bấm E để làm bài – đúng là có thưởng 💰',40,320); });
      const bp=new THREE.Mesh(new THREE.PlaneGeometry(9,3), new THREE.MeshStandardMaterial({map:bd, emissive:0xffffff, emissiveMap:bd, emissiveIntensity:.6})); bp.position.set(0,FY+2,-RD+.15); root.add(bp);
      person('Giám thị', 0, -RD+2.2, 0, 'cross', {outfit:{shirt:0x1f2a44, long:true, glasses:true}, dot:'#ffd23f'});
      const qs=ct(256,160,(g,w,h)=>{ g.fillStyle='#f7f9fc'; g.fillRect(0,0,w,h); g.fillStyle='#2f6fd0'; g.fillRect(0,0,w,18); g.fillStyle='#222'; g.font='bold 12px sans-serif'; g.fillText('Câu 12/20',8,34); for(let i=0;i<4;i++){ g.fillStyle=i===1?'#cfe8ff':'#eef1f5'; g.fillRect(8,46+i*26,240,20); } });
      const qm=new THREE.MeshStandardMaterial({map:qs, emissive:0xffffff, emissiveMap:qs, emissiveIntensity:.8}); let k=0;
      for(const z of [-5,-2,1,4,7]) for(const x of [-12,-8,-4,4,8,12]){ M(box(1.4,.05,.7), white, x,FY+.74,z); M(box(.05,.72,.6), steel, x-.65,FY+.37,z); M(box(.05,.72,.6), steel, x+.65,FY+.37,z);
        M(box(.6,.38,.03), dark, x,FY+1.05,z-.22); const s2=new THREE.Mesh(new THREE.PlaneGeometry(.56,.34), qm); s2.position.set(x,FY+1.05,z-.205); root.add(s2);
        const s=chair(x,z+.75,Math.PI,true); if(R()<.35 && k<10){ k++; person('Thí sinh', x, z+.75, Math.PI, 'type'); if(s) s.taken='bot'; } else if(s){ s.label='📝 Ngồi vào máy làm quiz QA/QC (E · C)'; s.onSit=()=>setTimeout(()=>openQuiz && openQuiz(), 300); }
        solid(x-.75,x+.75,z-.4,z+.4); }
      for(const [x,z] of [[-RW+1,RD-1.2],[RW-1,RD-1.2]]) plant(x,z,1.2);
      INTER.push({x:0, z:-RD+3.6, r:2, prio:.3, label:'📝 Làm bài quiz QA/QC (E)', action:()=>openQuiz && openQuiz()}); },
  };

  /* ============================== 4. HỌC BÀI (slide) ============================== */
  function catalog(){ load().then(()=>{ const m=ui.modal('📚 Danh mục khoá học · Toà Giáo trình', {wide:true});
    m.body.innerHTML=DATA.floors.map(f=>`<h3 style="margin:10px 0 6px">${esc(f.name)}</h3><div class="grid">${DATA.courses.filter(c=>c.floor===f.floor).map(c=>{ const n=c.lessons.filter(l=>S.learn.done[l.id]).length;
      return `<div class="card" style="cursor:pointer" data-c="${c.id}"><div class="row"><div class="ic">${c.icon}</div><div class="sp"></div><b>P.${c.room}</b></div><b>${esc(c.name)}</b><small>${esc(c.level)} · ${c.hours} giờ · ${n}/${c.lessons.length} bài${S.learn.certs[c.id]?' · 🏅':''}</small></div>`; }).join('')}</div>`).join('');
    m.body.querySelectorAll('[data-c]').forEach(x=>x.onclick=()=>{ m.close(); openCourse(x.dataset.c); }); }); }
  function openCourse(id, li0){ load().then(()=>{ const c=DATA.courses.find(x=>x.id===id); if(!c) return; const m=ui.modal(`${c.icon} ${c.name}`, {wide:true});
    const list=()=>{ const n=c.lessons.filter(l=>S.learn.done[l.id]).length;
      m.body.innerHTML=`<p>${esc(c.summary)}</p><p class="muted">${esc(c.level)} · ${c.hours} giờ · P.${c.room} · tiến độ <b>${n}/${c.lessons.length}</b> bài${S.learn.certs[c.id]?' · 🏅 đã có chứng chỉ':''}</p>
        <div class="grid">${c.lessons.map((l,i)=>`<div class="card" style="cursor:pointer" data-l="${i}"><b>Bài ${i+1}</b><small>${esc(l.title)}</small><small>${l.slides.length} slide ${S.learn.done[l.id]?'· <span class="jok">✓ đã học</span>':''}</small></div>`).join('')}</div>`;
      m.body.querySelectorAll('[data-l]').forEach(x=>x.onclick=()=>show(+x.dataset.l,0)); };
    const show=(li,si)=>{ const l=c.lessons[li], s=l.slides[si], last=si===l.slides.length-1;
      m.body.innerHTML=`<div class="row" style="gap:8px;margin-bottom:8px"><button class="btn" data-back>← Danh sách bài</button><b>Bài ${li+1}: ${esc(l.title)}</b><span class="sp" style="flex:1"></span><span class="muted">Slide ${si+1}/${l.slides.length}</span></div>
        <div style="background:linear-gradient(135deg,#0f1f3a,#1b2f55);border-radius:14px;padding:22px 26px;min-height:260px"><h2 style="margin:0 0 12px;color:#fff">${esc(s.h)}</h2><div style="white-space:pre-wrap;line-height:1.65;color:#dfe7f2;font-size:16px">${esc(s.body)}</div></div>
        <div class="row" style="margin-top:12px;gap:8px"><button class="btn" data-p ${si?'':'disabled'}>◀ Trước</button><span class="sp" style="flex:1"></span>${last?`<button class="btn pri" data-done>${S.learn.done[l.id]?'✓ Đã học – bài tiếp':'✅ Hoàn thành bài (+10 💰)'}</button>`:'<button class="btn pri" data-n>Tiếp ▶</button>'}</div>`;
      m.body.querySelector('[data-back]').onclick=list; const p=m.body.querySelector('[data-p]'); if(p) p.onclick=()=>show(li,si-1); const n=m.body.querySelector('[data-n]'); if(n) n.onclick=()=>show(li,si+1);
      const d=m.body.querySelector('[data-done]'); if(d) d.onclick=()=>{ if(!S.learn.done[l.id]){ S.learn.done[l.id]=1; save(); addCoins(10, `📖 Học xong bài “${l.title}” +10 💰`); }
        if(!S.learn.certs[c.id] && c.lessons.every(x=>S.learn.done[x.id])){ S.learn.certs[c.id]=new Date().toLocaleDateString('vi-VN'); save(); addCoins(100, `🏅 Chứng chỉ khoá ${c.name}! +100 💰`); }
        if(li+1<c.lessons.length) show(li+1,0); else list(); }; };
    if(li0!=null) show(li0,0); else list(); }); }
  W.openCourse=openCourse;

  /* ============================== 5. VÀO / RA · THANG MÁY ============================== */
  function floorsOf(b){ if(b==='academy') return [{n:1, kind:'exam', title:'Học viện QA', sub:'Phòng thi trắc nghiệm'}];
    return [{n:0, kind:'lobby', title:'Toà Giáo trình · Sảnh', sub:'Thư viện · danh mục khoá học'}, ...DATA.floors.map(f=>({n:f.floor, floor:f.floor, kind:'course', title:`Toà Giáo trình · Tầng ${f.floor}`, sub:f.name.replace(/^Tầng \d+ · /,'')}))]; }
  function clear(){ W.dropSeats && W.dropSeats(x=>x.scope==='interior'); for(const o of st.actors){ removeLabel(o.a.label); if(o.bub) removeLabel(o.bub); }
    const shared=new Set(); for(const o of st.actors) o.a.g.traverse(c=>{ if(c.geometry) shared.add(c.geometry); });
    root.traverse(o=>{ if(o.isMesh && o.geometry && !o.isSkinnedMesh && !shared.has(o.geometry)) o.geometry.dispose(); if(o.isMesh && o.material && o.material.map && o.material.map.isCanvasTexture && !o.isSkinnedMesh && o.material!==glassM) o.material.map.dispose(); });
    root.clear(); st.actors=[]; st.rooms=[]; circles.length=0; boxes.length=0; plats.length=0; INTER.length=0; }
  function build(){ const fl=st.floors[st.idx]; BUILD[fl.kind](fl); root.updateMatrixWorld(true);
    try{ batchStatic(W, root); }catch(e){ console.warn('campus batch', e); } }
  function go(idx, first){ fade.style.opacity=1;
    setTimeout(()=>{ clear(); st.idx=idx; build(); const fl=st.floors[idx]; const atDoor=first || fl.kind!=='course';
      const sp = (fl.kind==='lobby'&&first)||fl.kind==='exam' ? {x:0, z:RD-2.4, f:Math.PI} : {x:0, z:-RD+2.6, f:0};
      P.x=sp.x; P.z=sp.z; P.y=FY; P.vx=P.vz=P.vy=0; P.face=sp.f; me.g.position.set(P.x,P.y,P.z); me.g.rotation.y=sp.f; cam.yaw=sp.f+Math.PI; cam.pitch=.2; cam.tx=P.x; cam.tz=P.z; camera.position.set(P.x+Math.sin(cam.yaw)*4, P.y+2, P.z+Math.cos(cam.yaw)*4);
      toast(`${fl.title}${fl.sub?': '+fl.sub:''}`, 2200); setTimeout(()=>fade.style.opacity=0, 60); }, 300); }
  function elevator(){ const m=ui.modal('🛗 Thang máy · Toà Giáo trình'); const g=document.createElement('div'); g.className='grid'; m.body.appendChild(g);
    [...st.floors].reverse().forEach((fl,ri)=>{ const i=st.floors.indexOf(fl), c=document.createElement('div'); c.className='card'+(i===st.idx?' sel':''); c.style.cursor='pointer';
      const cs=fl.kind==='course'?DATA.courses.filter(x=>x.floor===fl.floor).map(x=>`P.${x.room} ${x.icon}`).join(' · '):'Thư viện · danh mục';
      c.innerHTML=`<div class="row"><div class="ic">${fl.kind==='lobby'?'🛎️':'📖'}</div><div class="sp"></div><b style="font-size:22px">${fl.n||'S'}</b></div><b>${esc(fl.sub||fl.title)}</b><small>${cs}</small>`;
      c.onclick=()=>{ m.close(); if(i!==st.idx) go(i); }; g.appendChild(c); }); }
  function enter(b, idx=0){ if(st.on || W.inside) return; load().then(()=>{ st.on=true; st.b=b; st.floors=floorsOf(b);
      st.saved={segs:(W.SEGS||[]).splice(0), circles:circles.splice(0), boxes:boxes.splice(0), plats:plats.splice(0), INTER:INTER.splice(0)}; st.camDist=cam.dist; cam.dist=Math.min(cam.dist,4.8);
      W.inside={name:b==='academy'?'Học viện QA':'Toà Giáo trình', campus:true, locked:false}; HOOK.labelGroup='interior'; HOOK.camBox={x0:-RW+.5, x1:RW-.5, z0:-RD+.5, z1:RD-.5, y1:FY+CH-.3};
      CS.environment=scene.environment; renderPass.scene=CS; scene.remove(me.g); CS.add(me.g); go(idx, true); }).catch(e=>toast('Không tải được data/courses.json: '+e.message, 4000)); }
  function exit(){ if(!st.on) return; const b=st.b; fade.style.opacity=1;
    setTimeout(()=>{ clear(); for(const k of ['circles','boxes','plats','INTER']){ const arr={circles,boxes,plats,INTER}[k]; arr.push(...st.saved[k]); } (W.SEGS||[]).push(...(st.saved.segs||[]));
      renderPass.scene=scene; CS.remove(me.g); scene.add(me.g); HOOK.labelGroup='world'; HOOK.camBox=null; W.inside=null; cam.dist=st.camDist||6.5; st.on=false;
      const d = b==='academy' ? {x:AC.tx+(AC.f?AC.f[0]:0)*1.4, z:AC.tz+(AC.f?AC.f[1]:1)*1.4, f:AC.f?Math.atan2(AC.f[0],AC.f[1]):0} : {x:TW.door.x+1.6, z:TW.door.z, f:Math.PI/2};
      P.x=d.x; P.z=d.z; P.y=groundAt(P.x,P.z); P.face=d.f; me.g.position.set(P.x,P.y,P.z); me.g.rotation.y=d.f; cam.yaw=d.f+Math.PI; cam.tx=P.x; cam.tz=P.z;
      camera.position.set(P.x+Math.sin(cam.yaw)*6, P.y+3, P.z+Math.cos(cam.yaw)*6); setTimeout(()=>fade.style.opacity=0, 60); }, 300); }

  /* ============================== 6. CẬP NHẬT ============================== */
  HOOK.onFrame.push((dt, T)=>{
    brainU.uT.value=T; if(BRAIN && !W.inside){ BRAIN.br.rotation.y+=dt*.15; BRAIN.br.position.y=65+Math.sin(T*.8)*.4; BRAIN.halo.rotation.z+=dt*.3; BRAIN.halo.position.y=BRAIN.br.position.y; BRAIN.pts.rotation.y-=dt*.08; BRAIN.pts.position.y=BRAIN.br.position.y; }
    if(TW.ring) TW.ring.material.opacity=.55+.35*Math.sin(T*3.2);
    if(!st.on) return;
    if(CS.environment!==scene.environment) CS.environment=scene.environment;
    dl.position.set(P.x+8,14,P.z+9); dl.target.position.set(P.x,0,P.z);
    for(const o of st.actors){ o.t+=dt;
      if(o.mode==='walk' && o.path){ const [tx,tz]=o.path[o.wi], dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<.3) o.wi=(o.wi+1)%o.path.length; else { o.x+=dx/d*1.2*dt; o.z+=dz/d*1.2*dt; o.h=W.lerpAngle(o.h, Math.atan2(dx,dz), 1-Math.exp(-dt*6)); } o.a.play('walk'); placeA(o); }
      o.a.mixer.update(dt); if(['type','sit','present','cross'].includes(o.mode)) o.p.apply(o.mode, o.t);
      if(o.bub){ o.bubT-=dt; if(o.bubT<=0){ removeLabel(o.bub); o.bub=null; } } }
    // giảng viên chiếu slide: tự chuyển slide, đọc tiêu đề khi bạn ở gần
    for(const r of st.rooms){ r.t-=dt; if(r.t>0) continue; r.t=9; const les=r.c.lessons[r.li]; r.si++; if(r.si>=les.slides.length){ r.si=0; r.li=(r.li+1)%r.c.lessons.length; } r.redraw();
      const sl=r.c.lessons[r.li].slides[r.si]; if(r.teacher && Math.hypot(P.x-r.teacher.x,P.z-r.teacher.z)<11) sayNow(r.teacher, `📢 ${sl.h}`, 6); }
  });
  PLACES.push({icon:'📚', name:'Toà Giáo trình', sub:'17 khoá học · lớp học có giảng viên · miễn phí', go:()=>teleport(TW.door.x+5, TW.door.z, TW.x, TW.z)});
  return {enter, exit, catalog, openCourse, get on(){ return st.on; }};
}
