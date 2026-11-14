// QC World – S15: ĐẢO MASTER DASHBOARD NHƯ ĐẢO THẬT
//  🌊 Sóng vỗ bờ: viền bọt trắng chạy lên bãi rồi rút, vệt cát ướt, các lớp sóng bạc đầu từ ngoài khơi vào (quanh đảo chính + đảo nghỉ dưỡng)
//  🌴 Rặng dừa dày (vẽ theo lô – thêm ~110 cây chỉ tốn ~15 lượt vẽ), tàu lá đung đưa theo gió
//  🛖 Nhà chòi lá (bàn + ghế ngồi + võng nằm) · 🛟 chòi cứu hộ leo cầu thang lên ngắm biển · 🛶 thuyền thúng ngồi được
//  ⛱️ Dù + ghế tắm nắng · 🪨 ghềnh đá · 🦀 cua bò ngang (thấy người là chạy trốn) · 🕊️ hải âu bay lượn vỗ cánh
//  🔊 Âm thanh môi trường tự tạo bằng WebAudio (không tải file, chạy offline): sóng vỗ theo khoảng cách tới bờ, gió, hải âu kêu,
//     tiếng bước chân theo mặt đất (cát · cỏ · đường nhựa · sàn gỗ). Bật/tắt ở ⚙ Đồ hoạ.
export function makeIsland(W){
  const {THREE, scene, groundH, groundAt, edgeR, addPlat, circles, boxes, INTER, HOOK, P, me, WATER_Y, PALMS, PALM_MAT, ROCKS, ROCK_MAT, makeLabel, toast} = W;
  const dAng=W.dAng, platH=W.platH, ISLET=W.ISLET;
  let sd=90210; const R=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  const TAU=Math.PI*2, U={uT:{value:0}};
  const pol=(a,r)=>({x:Math.cos(a)*r, z:Math.sin(a)*r});
  const sm=(c,r=.8,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const canvasTex=(w,h,draw,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; } return t; };
  // gom hình theo vật liệu → mỗi vật liệu 1 lượt vẽ (batchStatic gộp tiếp các nhóm tĩnh)
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function Kit(){ const parts=new Map(); return {
    add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0, sc=1){ const g=geo.index?geo.toNonIndexed():geo.clone(); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s.set(sc,sc,sc)); _s.set(1,1,1); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); return this; },
    build(parent){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:W.mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=!m.transparent; ms.receiveShadow=true; parent.add(ms); } } }; }

  /* ---------- chọn chỗ trống trên bãi biển ---------- */
  const busy=[];   // chỗ đã đặt đồ của module này
  const BRIDGE=(x,z)=>Math.abs(z)<10 && x>38;
  function freeSpot(x,z,pad){
    if(BRIDGE(x,z)) return false; const a=Math.atan2(z,x);
    if(Math.abs(dAng(a,W.RESORT_A))<.55 || Math.abs(dAng(a,-Math.PI/2))<.34 || Math.abs(dAng(a,.42))<.2) return false;   // khu nghỉ dưỡng · bến cảng · quán nước
    if(W.onRoad(x,z,2.5) || platH(x,z)>-1e8) return false;
    if(circles.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+pad)) return false;
    if(boxes.some(b=>x>b.x0-pad && x<b.x1+pad && z>b.z0-pad && z<b.z1+pad)) return false;
    if(INTER.some(it=>Math.hypot(x-it.x,z-it.z)<(it.r||1.5)+pad*.6)) return false;
    if(busy.some(b=>Math.hypot(x-b.x,z-b.z)<b.r+pad)) return false;
    return true; }
  function findSpot(rIn, rOut, pad, tries=400, aRange){ for(let i=0;i<tries;i++){ const a=aRange?aRange[0]+R()*(aRange[1]-aRange[0]):R()*TAU, e=edgeR(a), r=e-rIn+R()*(rIn-rOut), p=pol(a,r); if(freeSpot(p.x,p.z,pad)) return {...p, a, e}; } return null; }
  const outward=a=>Math.atan2(Math.cos(a), Math.sin(a));   // hướng nhìn ra biển (quy ước: hướng h → x+=sin h, z+=cos h)

  /* ============================== 🌊 SÓNG VỖ BỜ ============================== */
  const noise=(()=>{ const N=128, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'), img=g.createImageData(N,N), G=16, grid=[]; for(let i=0;i<G*G;i++) grid.push(R());
    const at=(x,y)=>grid[((y%G+G)%G)*G+((x%G+G)%G)];
    for(let y=0;y<N;y++) for(let x=0;x<N;x++){ const fx=x/N*G, fy=y/N*G, xi=Math.floor(fx), yi=Math.floor(fy), tx=fx-xi, ty=fy-yi, u=tx*tx*(3-2*tx), v=ty*ty*(3-2*ty);
      const val=at(xi,yi)*(1-u)*(1-v)+at(xi+1,yi)*u*(1-v)+at(xi,yi+1)*(1-u)*v+at(xi+1,yi+1)*u*v, k=(y*N+x)*4; img.data[k]=img.data[k+1]=img.data[k+2]=val*255; img.data[k+3]=255; }
    g.putImageData(img,0,0); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.NoColorSpace; return t; })();
  const surfMat=new THREE.ShaderMaterial({uniforms:{...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uT:U.uT, uN:{value:noise}}, transparent:true, depthWrite:false, fog:true,
    vertexShader:`varying vec2 vUv;
#include <fog_pars_vertex>
      void main(){ vUv=uv; vec4 mvPosition=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
      }`,
    fragmentShader:`uniform float uT; uniform sampler2D uN; varying vec2 vUv;
#include <common>
#include <fog_pars_fragment>
      void main(){ float ang=vUv.x, t=vUv.y; float n=texture2D(uN, vec2(ang*48., t*1.6+uT*.03)).r, n2=texture2D(uN, vec2(ang*95.+.3, t*3.-uT*.05)).r;
        float sw=.5+.5*sin(uT*.75+ang*6.2831*7.+n*2.4);           // sóng tràn lên bãi rồi rút
        float front=.31-.13*sw+(n-.5)*.05;
        float line=1.-smoothstep(0.,.034,abs(t-front)); float foamN=smoothstep(.42,.8,n2*.7+n*.45);               // mép bọt trắng
        float wash=step(front,t)*(1.-smoothstep(.30,.44,t))*(.12+.8*foamN); // bọt loang phía sau mép
        float wet=step(t,front)*smoothstep(front-.11,front,t)*.4;   // cát ướt
        float crest=0.; for(int k=0;k<2;k++){ float c=fract(uT*.05+float(k)*.5+ang*3.+n*.08); float pos=.95-c*.62; crest+=(1.-smoothstep(0.,.03,abs(t-pos-(n2-.5)*.04)))*smoothstep(.33,.5,pos)*(.25+.65*foamN); }
        float a=clamp(line*.95+wash+crest*.55,0.,1.);
        vec3 col=mix(vec3(.42,.34,.24), vec3(1.), clamp((line+wash+crest)*3.,0.,1.));
        float alpha=max(a, wet)*smoothstep(0.,.06,t)*(1.-smoothstep(.85,1.,t));
        gl_FragColor=vec4(col, alpha);
#include <fog_fragment>
      }`});
  function shoreRing(cx, cz, rf, N, rin, rout){ const idx=[];
    const rows=10; const P2=[], UV2=[];
    for(let i=0;i<=N;i++){ const a=i/N*TAU, e=rf(a), c=Math.cos(a), s=Math.sin(a); for(let j=0;j<=rows;j++){ const t=j/rows, r=e-rin+t*(rin+rout), x=cx+c*r, z=cz+s*r; P2.push(x, Math.max(groundH(x,z)+.09, WATER_Y+.06), z); UV2.push(i/N, t); } }
    for(let i=0;i<N;i++) for(let j=0;j<rows;j++){ const a=i*(rows+1)+j, b=a+rows+1; idx.push(a,b,a+1, a+1,b,b+1); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P2,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV2,2)); g.setIndex(idx); g.computeBoundingSphere();
    const m=new THREE.Mesh(g, surfMat); m.renderOrder=2; m.userData.dynamic=true; m.receiveShadow=false; scene.add(m); return m; }
  shoreRing(0,0, edgeR, 900, 6.5, 3.5);
  if(ISLET) shoreRing(ISLET.x, ISLET.z, a=>W.isletR?W.isletR(a):ISLET.r, 360, 5.5, 3);

  /* ============================== vật liệu đồ biển ============================== */
  const strawTex=canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#b8925a'; g.fillRect(0,0,w,h); for(let i=0;i<1600;i++){ const x=R()*w, y=R()*h, l=10+R()*26; g.strokeStyle=`rgba(${120+R()*90|0},${90+R()*60|0},${40+R()*30|0},.55)`; g.lineWidth=1+R()*1.5; g.beginPath(); g.moveTo(x,y); g.lineTo(x+(R()-.5)*4,y+l); g.stroke(); } },true);
  const weaveTex=canvasTex(128,128,(g,w,h)=>{ g.fillStyle='#5c3d20'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=8) for(let x=0;x<w;x+=8){ g.fillStyle=((x+y)/8)%2?'#7a5530':'#4a2f17'; g.fillRect(x+1,y+1,6,6); } },true);
  const stripeTex=(c1,c2)=>canvasTex(256,64,(g,w,h)=>{ for(let i=0;i<8;i++){ g.fillStyle=i%2?c1:c2; g.fillRect(i*w/8,0,w/8,h); } },true);
  const M={ bamboo:sm(0xcaa66a,.7), bambooD:sm(0x8a6a3a,.8), straw:sm(0xffffff,.95,0,{map:strawTex}), wood:sm(0x9a6b42,.8), woodD:sm(0x6b4a2e,.85), white:sm(0xf2f2ee,.6), red:sm(0xd63a3a,.6), yellow:sm(0xf2c230,.6),
    rope:sm(0xd8c7a0,.9), basket:sm(0xffffff,.9,0,{map:weaveTex}), cloth:[0xff6b6b,0x4fc3ff,0x46d39a,0xffd23f].map(c=>sm(c,.85,0,{side:THREE.DoubleSide})),
    umb:[['#ff5a6e','#ffffff'],['#2f8cff','#ffffff'],['#ffb02e','#ffffff']].map(([a,b])=>sm(0xffffff,.8,0,{map:stripeTex(a,b), side:THREE.DoubleSide})), lounger:sm(0xf5f0e6,.7), buoy:sm(0xff5530,.5) };
  const addSeat=(o)=>W.addSeat && W.addSeat(o);
  const placed=[];

  /* ============================== 🛖 NHÀ CHÒI LÁ ============================== */
  function hut(x,z,face){ const gy=groundH(x,z), g=new THREE.Group(); g.position.set(x,gy,z); g.rotation.y=face; scene.add(g); const k=Kit(), S=3.6, F=.32;
    k.add(new THREE.BoxGeometry(S+.4,.12,S+.4), M.wood, 0,F,0);                                          // sàn gỗ
    for(const sx of [-1,1]) for(const sz of [-1,1]){ k.add(new THREE.CylinderGeometry(.09,.11,2.75,8), M.bamboo, sx*S/2,1.37,sz*S/2); }   // cột tre
    for(const sz of [-1,1]) k.add(new THREE.CylinderGeometry(.07,.07,S+.3,8), M.bambooD, 0,2.7,sz*S/2, 0,0,Math.PI/2);
    for(const sx of [-1,1]) k.add(new THREE.CylinderGeometry(.07,.07,S+.3,8), M.bambooD, sx*S/2,2.7,0, Math.PI/2,0,0);
    const roof=new THREE.ConeGeometry(S*.98,1.9,4,1,true); roof.rotateY(Math.PI/4); k.add(roof, M.straw, 0,3.62,0);  // mái lá (4 mái)
    k.add(new THREE.ConeGeometry(.22,.5,6), M.bambooD, 0,4.7,0);
    k.add(new THREE.CylinderGeometry(.55,.55,.06,14), M.wood, 0,F+.72,-.55); k.add(new THREE.CylinderGeometry(.06,.06,.66,8), M.woodD, 0,F+.39,-.55);   // bàn tròn
    for(const sx of [-1,1]){ k.add(new THREE.BoxGeometry(1.1,.07,.4), M.wood, sx*.95,F+.45,-.55); k.add(new THREE.BoxGeometry(1.0,.38,.06), M.woodD, sx*.95,F+.24,-.55); }   // 2 băng ghế
    // võng giữa 2 cột phía biển
    const hm=new THREE.CylinderGeometry(.42,.42,S-.6,14,1,true,Math.PI*1.1,Math.PI*.8); hm.rotateZ(Math.PI/2); k.add(hm, M.cloth[Math.floor(R()*4)], 0,1.05,S/2-.15);
    k.add(new THREE.CylinderGeometry(.012,.012,.5,4), M.rope, -(S/2-.2),1.3,S/2-.15, 0,0,Math.PI/2.4); k.add(new THREE.CylinderGeometry(.012,.012,.5,4), M.rope, S/2-.2,1.3,S/2-.15, 0,0,-Math.PI/2.4);
    k.build(g);
    const W2=(lx,lz)=>{ const c=Math.cos(face), s=Math.sin(face); return {x:x+lx*c+lz*s, z:z-lx*s+lz*c}; };
    for(const sx of [-1,1]) for(const sz of [-1,1]){ const p=W2(sx*S/2, sz*S/2); circles.push({x:p.x, z:p.z, r:.16}); }
    { const p=W2(0,-.55); circles.push({x:p.x, z:p.z, r:.5}); }
    for(const sx of [-1,1]) for(const lx of [-.3,.3]){ const p=W2(sx*.95+lx,-.55); circles.push({x:p.x, z:p.z, r:.2}); }   // băng ghế
    addPlat(x, z, face, S/2+.2, S/2+.2, gy+F+.06);
    for(const sx of [-1,1]){ const p=W2(sx*.95,-.55); addSeat({x:p.x, z:p.z, rot:face+(sx<0?Math.PI/2:-Math.PI/2), y:gy+F+.49, floor:gy+F+.06, label:'🛖 Ngồi nghỉ trong chòi lá (E · C)'}); }
    { const p=W2(0,S/2-.15); addSeat({x:p.x, z:p.z, rot:face+Math.PI/2, y:gy+1.0, floor:gy+F+.06, lie:true, r:1.6, label:'🛖 Nằm võng đung đưa (E · C)'}); }
    makeLabel('🛖 Chòi lá nghỉ chân', 'Ngồi bàn · nằm võng', {h:.5, x, y:gy+5.4, z, fade:45});
    busy.push({x,z,r:3.6}); placed.push({kind:'hut', x, z}); }
  for(let i=0;i<6;i++){ const c=findSpot(16,10,3.8,1500); if(!c) continue; hut(c.x, c.z, outward(c.a)); }

  /* ============================== 🛟 CHÒI CỨU HỘ (leo cầu thang lên được) ============================== */
  function lifeguard(x,z,face){ const gy=groundH(x,z), g=new THREE.Group(); g.position.set(x,gy,z); g.rotation.y=face; scene.add(g); const k=Kit(), H=2.6;
    for(const sx of [-1,1]) for(const sz of [-1,1]) k.add(new THREE.BoxGeometry(.14,H+1.6,.14), M.white, sx*.95,(H+1.6)/2,sz*.95);
    k.add(new THREE.BoxGeometry(2.3,.12,2.3), M.wood, 0,H,0);
    for(const [sx,sz,w,d] of [[0,1,2.3,.06],[1,0,.06,2.3],[-1,0,.06,2.3]]) k.add(new THREE.BoxGeometry(w,.9,d), M.red, sx*1.12,H+.5,sz*1.12);   // lan can 3 mặt
    k.add(new THREE.BoxGeometry(2.5,.1,2.5), M.red, 0,H+1.65,0); k.add(new THREE.BoxGeometry(2.6,.06,2.6), M.white, 0,H+1.72,0);              // mái
    k.add(new THREE.BoxGeometry(1.8,.5,.05), M.yellow, 0,H+.55,1.16);
    // cầu thang phía sau (6 bậc)
    for(let i=0;i<6;i++){ k.add(new THREE.BoxGeometry(.9,.08,.42), M.wood, 0,(i+1)*H/6-.04,-1.15-((5-i)*.42)-.21); }
    for(const sx of [-.48,.48]){ const L=Math.hypot(H, 2.52); k.add(new THREE.BoxGeometry(.06,L,.1), M.woodD, sx,H/2,-1.15-1.26, Math.atan2(2.52,H),0,0); }
    // cột cờ + phao
    k.add(new THREE.CylinderGeometry(.03,.03,2.2,6), M.white, .95,H+2.6,.95); k.add(new THREE.BoxGeometry(.04,.5,.75), M.red, .95,H+3.4,.58);
    const tor=new THREE.TorusGeometry(.32,.08,8,16); k.add(tor, M.buoy, 0,H+.55,1.22);
    k.build(g);
    const W2=(lx,lz)=>{ const c=Math.cos(face), s=Math.sin(face); return {x:x+lx*c+lz*s, z:z-lx*s+lz*c}; };
    for(const sx of [-1,1]) for(const sz of [-1,1]){ const p=W2(sx*.95, sz*.95); circles.push({x:p.x, z:p.z, r:.12}); }
    for(let i=0;i<6;i++){ const p=W2(0, -1.15-((5-i)*.42)-.21); addPlat(p.x, p.z, face, .46, .22, gy+(i+1)*H/6); }
    addPlat(x, z, face, 1.12, 1.12, gy+H+.06);
    for(let t=-1.1;t<=1.11;t+=.36){ for(const [lx,lz] of [[t,1.12],[1.12,t],[-1.12,t]]){ const q=W2(lx,lz); circles.push({x:q.x, z:q.z, r:.12}); } }   // lan can 3 mặt: không đi xuyên
    makeLabel('🛟 Chòi cứu hộ', 'Leo cầu thang phía sau lên ngắm biển', {h:.5, x, y:gy+H+2.6, z, fade:50});
    busy.push({x,z,r:4.5}); placed.push({kind:'lifeguard', x, z}); }
  for(let i=0;i<2;i++){ const c=findSpot(11,6.5,3.6,1500); if(!c) continue; lifeguard(c.x, c.z, outward(c.a)); }

  /* ============================== 🛶 THUYỀN THÚNG ============================== */
  function basketBoat(x,z,a){ const gy=Math.max(groundH(x,z), WATER_Y), g=new THREE.Group(); g.position.set(x,gy+.02,z); g.rotation.set(.12, a, .06, 'YXZ'); scene.add(g); const k=Kit();
    const bowl=new THREE.SphereGeometry(1.05,22,10,0,TAU,Math.PI/2,Math.PI/2); bowl.scale(1,.45,1); bowl.translate(0,.47,0); k.add(bowl, M.basket);
    k.add(new THREE.TorusGeometry(1.05,.06,8,28), M.woodD, 0,.47,0, Math.PI/2,0,0);
    k.add(new THREE.BoxGeometry(1.8,.04,.12), M.wood, 0,.12,.9, 0,.4,0); k.add(new THREE.BoxGeometry(.35,.03,.18), M.wood, .9,.12,1.25, 0,.4,0);   // mái chèo
    k.build(g); circles.push({x, z, r:1.0}); busy.push({x,z,r:1.6});
    addSeat({x, z, rot:a, y:gy+.32, floor:gy+.05, label:'🛶 Ngồi vào thuyền thúng (E · C)'}); placed.push({kind:'boat', x, z}); }
  for(let i=0;i<6;i++){ const c=findSpot(5.6,4.2,2,400); if(!c) continue; basketBoat(c.x, c.z, R()*TAU); }

  /* ============================== ⛱️ DÙ + GHẾ TẮM NẮNG ============================== */
  function umbrellaSet(x,z,face){ const gy=groundH(x,z), g=new THREE.Group(); g.position.set(x,gy,z); g.rotation.y=face; scene.add(g); const k=Kit(), um=M.umb[Math.floor(R()*M.umb.length)];
    k.add(new THREE.CylinderGeometry(.035,.035,2.5,6), M.white, 0,1.25,0); k.add(new THREE.ConeGeometry(1.5,.55,16,1,true), um, 0,2.4,0);
    for(const sx of [-1,1]){ k.add(new THREE.BoxGeometry(.62,.08,1.5), M.lounger, sx*.85,.32,.3); k.add(new THREE.BoxGeometry(.62,.08,.6), M.lounger, sx*.85,.55,-.55, -.7,0,0);
      for(const lz of [-.3,.9]) k.add(new THREE.BoxGeometry(.56,.3,.05), M.woodD, sx*.85,.15,lz); }
    k.add(new THREE.BoxGeometry(1.6,.02,.9), M.cloth[Math.floor(R()*4)], 0,.04,1.8);   // khăn trải cát
    k.build(g);
    const W2=(lx,lz)=>{ const c=Math.cos(face), s=Math.sin(face); return {x:x+lx*c+lz*s, z:z-lx*s+lz*c}; };
    circles.push({x, z, r:.12}); for(const sx of [-1,1]) for(const lz of [-.5,.2,.8]){ const q=W2(sx*.85,lz); circles.push({x:q.x, z:q.z, r:.3}); }   // ghế tắm nắng
    for(const sx of [-1,1]){ const p=W2(sx*.85,-.25); addSeat({x:p.x, z:p.z, rot:face, y:gy+.42, floor:gy, lie:true, r:1.4, label:'⛱️ Nằm ghế tắm nắng (E · C)'}); }
    busy.push({x,z,r:2.6}); placed.push({kind:'umbrella', x, z}); }
  for(let i=0;i<9;i++){ const c=findSpot(9.5,5.5,2.4,1200); if(!c) continue; umbrellaSet(c.x, c.z, outward(c.a)); }

  /* ============================== 🪨 GHỀNH ĐÁ ============================== */
  for(let cl=0; cl<4; cl++){ let c=null; for(let t=0;t<300 && !c;t++){ const a=R()*TAU, e=edgeR(a), p=pol(a,e-3); if(!BRIDGE(p.x,p.z) && Math.abs(dAng(a,W.RESORT_A))>.6 && Math.abs(dAng(a,-Math.PI/2))>.4 && Math.abs(dAng(a,.42))>.25 && freeSpot(p.x,p.z,3)) c={...p,a}; }
    if(!c) continue; const g=new THREE.Group(); scene.add(g); const k=Kit();
    for(let i=0;i<9;i++){ const a=c.a+(R()-.5)*.07, r=edgeR(a)-4+R()*7, p=pol(a,r), s=.7+R()*1.8, y=groundH(p.x,p.z)-.25*s;
      k.add(ROCKS[i%3], ROCK_MAT, p.x,y,p.z, R()*.4,R()*TAU,R()*.4, s);
      if(r<edgeR(a)-3.2) circles.push({x:p.x, z:p.z, r:.85*s}); busy.push({x:p.x,z:p.z,r:s+1}); }
    k.build(g); g.children.forEach(m=>{ m.castShadow=true; }); }

  /* ============================== 🌴 RẶNG DỪA (vẽ theo lô, đung đưa theo gió) ============================== */
  const sway=(mat, flutter)=>{ const m=mat.clone(); m.onBeforeCompile=sh=>{ sh.uniforms.uT=U.uT; sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float hh=max(position.y-1.2,0.); vec4 ip=instanceMatrix[3]; float ph=ip.x*.13+ip.z*.17;
      transformed.x+=sin(uT*1.05+ph)*hh*hh*.0032; transformed.z+=cos(uT*.83+ph*1.3)*hh*hh*.0026;
      ${flutter?'transformed.y+=sin(uT*3.1+position.x*2.3+position.z*1.7+ph)*.05*smoothstep(4.,7.,position.y);':''}`); }; m.customProgramCacheKey=()=>'palmSway'+(flutter?1:0); return m; };
  const PM={bark:sway(PALM_MAT.bark,false), frond:sway(PALM_MAT.frond,true), nut:sway(PALM_MAT.nut,false)};
  const palmSpots=[];
  // các rặng dừa: chọn tâm rặng trên bãi, mỗi rặng 5–9 cây
  for(let grove=0; grove<34; grove++){ const c=findSpot(15,4.5,2.0,400); if(!c) continue; const n=5+Math.floor(R()*5);
    for(let k=0;k<n*3 && n>0;k++){ const a=c.a+(R()-.5)*.2, e=edgeR(a), r=e-4.5-R()*10, p=pol(a,r); if(!freeSpot(p.x,p.z,1.5) || palmSpots.some(s=>Math.hypot(s.x-p.x,s.z-p.z)<2.1)) continue;
      const s=.8+R()*.45; palmSpots.push({x:p.x, z:p.z, s, lean:a, v:Math.floor(R()*PALMS.length)}); busy.push({x:p.x,z:p.z,r:.6}); circles.push({x:p.x, z:p.z, r:.3*s}); if(palmSpots.filter(q=>Math.hypot(q.x-c.x,q.z-c.z)<12).length>=n) break; } }
  { const byV=PALMS.map(()=>[]); for(const s of palmSpots) byV[s.v].push(s);
    byV.forEach((list,v)=>{ if(!list.length) return; const V=PALMS[v];
      for(const [geo,mat] of [[V.trunk,PM.bark],[V.crown,PM.frond],[V.nuts,PM.nut]]){ const im=new THREE.InstancedMesh(geo, mat, list.length);
        list.forEach((s,i)=>{ _e.set(0, outward(s.lean)+(R()-.5)*1.2, 0); _q.setFromEuler(_e); _m.compose(_p.set(s.x, groundH(s.x,s.z)-.05, s.z), _q, new THREE.Vector3(s.s,s.s,s.s)); im.setMatrixAt(i,_m); });
        im.castShadow=true; im.receiveShadow=true; im.userData.dynamic=true; im.computeBoundingSphere(); scene.add(im); } }); }

  /* ============================== 🦀 CUA BÒ NGANG ============================== */
  const crabGeo=(()=>{ const parts=[]; const b=new THREE.SphereGeometry(.09,10,6); b.scale(1.3,.5,1); parts.push(b.toNonIndexed());
    for(const s of [-1,1]){ for(let i=0;i<3;i++){ const l=new THREE.BoxGeometry(.13,.015,.015); l.rotateZ(s*-.5); l.translate(s*.13,-.02,(i-1)*.05); parts.push(l.toNonIndexed()); }
      const cl=new THREE.SphereGeometry(.04,8,6); cl.scale(1.4,.7,1); cl.translate(s*.08,0,.12); parts.push(cl.toNonIndexed());
      const e=new THREE.CylinderGeometry(.008,.008,.05,4); e.translate(s*.035,.05,.06); parts.push(e.toNonIndexed()); }
    for(const p of parts){ p.deleteAttribute('uv'); } return W.mergeGeometries(parts,false); })();
  const CRAB_N=26, crabs=new THREE.InstancedMesh(crabGeo, sm(0xd8452a,.55), CRAB_N); crabs.userData.dynamic=true; crabs.castShadow=false; crabs.frustumCulled=false; scene.add(crabs);
  const CR=[]; for(let i=0;i<CRAB_N;i++){ const a=R()*TAU; CR.push({a, r:edgeR(a)-4.2-R()*2.5, h:R()*TAU, sp:0, t:R()*3, hide:0}); }
  function updCrabs(dt){ for(let i=0;i<CRAB_N;i++){ const c=CR[i]; let p=pol(c.a,c.r);
      const dx=p.x-P.x, dz=p.z-P.z, d=Math.hypot(dx,dz);
      if(c.hide>0){ c.hide-=dt; if(c.hide<=0){ c.a=R()*TAU; c.r=edgeR(c.a)-4.2-R()*2.5; } _m.makeScale(0,0,0); crabs.setMatrixAt(i,_m); continue; }
      if(d<3.2){ c.sp=1.6; c.h=Math.atan2(dx,dz)-Math.PI/2; c.t=1.2; if(d<1.2){ c.hide=8+R()*10; } }   // hoảng → chạy ngang, quá gần thì chui xuống cát
      else { c.t-=dt; if(c.t<=0){ c.t=1+R()*3; c.sp=R()<.45?0:.25+R()*.3; c.h=R()*TAU; } }
      const mx=Math.cos(c.h)*c.sp*dt, mz=-Math.sin(c.h)*c.sp*dt; p.x+=mx; p.z+=mz;   // cua bò NGANG: thân quay theo c.h, đi theo trục ngang
      c.a=Math.atan2(p.z,p.x); c.r=Math.min(edgeR(c.a)-3.8, Math.max(edgeR(c.a)-8, Math.hypot(p.x,p.z)));
      p=pol(c.a,c.r); const y=groundH(p.x,p.z)+.04+(c.sp>0?Math.abs(Math.sin(U.uT.value*30+i))*.01:0);
      _e.set(0,c.h,0); _q.setFromEuler(_e); _m.compose(_p.set(p.x,y,p.z), _q, _s); crabs.setMatrixAt(i,_m); }
    crabs.instanceMatrix.needsUpdate=true; }

  /* ============================== 🕊️ HẢI ÂU ============================== */
  const gullGeo=(()=>{ const parts=[]; const b=new THREE.SphereGeometry(.14,10,6); b.scale(.8,.7,2.1); parts.push(b.toNonIndexed());
    const hd=new THREE.SphereGeometry(.08,8,6); hd.translate(0,.06,.3); parts.push(hd.toNonIndexed());
    for(const s of [-1,1]){ const w=new THREE.BoxGeometry(.75,.02,.24); w.translate(s*.45,.02,0); parts.push(w.toNonIndexed()); }
    const t=new THREE.BoxGeometry(.16,.02,.16); t.translate(0,0,-.32); parts.push(t.toNonIndexed());
    for(const p of parts) p.deleteAttribute('uv'); return W.mergeGeometries(parts,false); })();
  const gullMat=sm(0xf4f6f8,.6); gullMat.onBeforeCompile=sh=>{ sh.uniforms.uT=U.uT; sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float wx=abs(position.x); if(wx>.12){ vec4 ip=instanceMatrix[3]; float ph=ip.x*.7+ip.z*.3; float f=sin(uT*7.+ph)*.55+.1; transformed.y+= (wx-.12)*f; }`); };
  gullMat.customProgramCacheKey=()=>'gullFlap';
  const GULL_N=14, gulls=new THREE.InstancedMesh(gullGeo, gullMat, GULL_N); gulls.userData.dynamic=true; gulls.castShadow=true; gulls.frustumCulled=false; scene.add(gulls);
  const GL=[]; for(let i=0;i<GULL_N;i++) GL.push({cx:(R()-.5)*80, cz:(R()-.5)*80, rr:40+R()*45, y:11+R()*16, w:(.12+R()*.1)*(R()<.5?-1:1), a:R()*TAU, bob:R()*TAU});
  function updGulls(dt){ for(let i=0;i<GULL_N;i++){ const g=GL[i]; g.a+=g.w*dt; const x=g.cx+Math.cos(g.a)*g.rr, z=g.cz+Math.sin(g.a)*g.rr, y=g.y+Math.sin(U.uT.value*.4+g.bob)*1.6;
      const h=Math.atan2(-Math.sin(g.a)*Math.sign(g.w), Math.cos(g.a)*Math.sign(g.w));
      _e.set(0, h, -Math.sign(g.w)*.35, 'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); gulls.setMatrixAt(i,_m); }
    gulls.instanceMatrix.needsUpdate=true; }

  /* ============================== 🔊 ÂM THANH MÔI TRƯỜNG ============================== */
  const AUD={on:(()=>{ try{ return localStorage.getItem('qcworld-sfx')!=='0'; }catch(e){ return true; } })(), ctx:null, master:null, wave:null, wind:null, nextSwell:0, nextGull:3, stepAcc:0, lastX:null, lastZ:null};
  function audioInit(){ if(AUD.ctx || !AUD.on) return; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; const c=new AC(); AUD.ctx=c;
    AUD.master=c.createGain(); AUD.master.gain.value=.55; AUD.master.connect(c.destination);
    const buf=c.createBuffer(1, c.sampleRate*3, c.sampleRate), d=buf.getChannelData(0); let b=0; for(let i=0;i<d.length;i++){ const w=Math.random()*2-1; b=(b*.97+w*.03); d[i]=w*.6+b*3; }   // ồn trắng + ồn nâu
    AUD.noise=buf;
    const loop=(type,f,q)=>{ const s=c.createBufferSource(); s.buffer=buf; s.loop=true; const fl=c.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const gn=c.createGain(); gn.gain.value=0; s.connect(fl); fl.connect(gn); gn.connect(AUD.master); s.start(); return {s, fl, gn}; };
    AUD.wave=loop('lowpass',520,.7); AUD.surf=loop('bandpass',1400,.6); AUD.wind=loop('bandpass',420,.5); }
  addEventListener('pointerdown', audioInit); addEventListener('keydown', audioInit);
  function shoreDist(){ const x=P.x, z=P.z; let d=Math.abs(Math.hypot(x,z)-(edgeR(Math.atan2(z,x))-3.6)); if(ISLET){ const ri=Math.hypot(x-ISLET.x,z-ISLET.z), ei=(W.isletR?W.isletR(Math.atan2(z-ISLET.z,x-ISLET.x)):ISLET.r)-3; d=Math.min(d, Math.abs(ri-ei)); } return d; }
  function swell(near){ const c=AUD.ctx, t=c.currentTime, g=AUD.surf.gn.gain, peak=.32*near;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value,t); g.linearRampToValueAtTime(peak, t+1.5+Math.random()*.6); g.linearRampToValueAtTime(peak*.25, t+4.2); g.linearRampToValueAtTime(.02*near, t+6); }
  function gullCry(vol){ const c=AUD.ctx, t=c.currentTime, n=2+Math.floor(Math.random()*3);
    for(let i=0;i<n;i++){ const o=c.createOscillator(), g=c.createGain(), f=c.createBiquadFilter(); o.type='sawtooth'; f.type='bandpass'; f.frequency.value=1700; f.Q.value=3;
      const s=t+i*.22, f0=1500+Math.random()*400; o.frequency.setValueAtTime(f0,s); o.frequency.exponentialRampToValueAtTime(f0*.62, s+.18);
      g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(.08*vol,s+.02); g.gain.exponentialRampToValueAtTime(.001,s+.2); o.connect(f); f.connect(g); g.connect(AUD.master); o.start(s); o.stop(s+.22); } }
  function footstep(kind, run){ const c=AUD.ctx, t=c.currentTime, s=c.createBufferSource(); s.buffer=AUD.noise; const f=c.createBiquadFilter(), g=c.createGain();
    const cfg={sand:['lowpass',650,.09,.22], grass:['bandpass',1100,.07,.12], hard:['highpass',1600,.045,.14], wood:['bandpass',380,.07,.25]}[kind]||['lowpass',800,.06,.15];
    f.type=cfg[0]; f.frequency.value=cfg[1]*(.9+Math.random()*.2); const dur=cfg[2]*(run?.8:1), v=cfg[3]*(run?1.25:1);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+.008); g.gain.exponentialRampToValueAtTime(.001,t+dur);
    s.connect(f); f.connect(g); g.connect(AUD.master); s.start(t, Math.random()*2, dur+.02);
    if(kind==='wood'){ const o=c.createOscillator(), og=c.createGain(); o.frequency.value=150+Math.random()*30; og.gain.setValueAtTime(.12,t); og.gain.exponentialRampToValueAtTime(.001,t+.08); o.connect(og); og.connect(AUD.master); o.start(t); o.stop(t+.09); } }
  function surface(){ const x=P.x, z=P.z, gp=platH(x,z), gh=groundH(x,z); if(gp>gh+.02 && Math.abs(P.y-gp)<.3) return 'wood';
    if(W.inside || W.inDT(x,z) || W.onRoad(x,z,0)) return 'hard';
    if(W.onExt && W.onExt(x,z)) return gh>30 ? 'hard' : 'grass';
    const r=Math.hypot(x,z), e=edgeR(Math.atan2(z,x)); if(r>e-12) return 'sand';
    if(ISLET && Math.hypot(x-ISLET.x,z-ISLET.z)<ISLET.r) return 'sand'; return 'grass'; }
  function updAudio(dt){ if(!AUD.ctx || !AUD.on) return; const c=AUD.ctx; if(c.state==='suspended'){ c.resume(); return; }
    const near=W.inside ? 0 : Math.max(0, 1-shoreDist()/55), t=c.currentTime;
    AUD.wave.gn.gain.setTargetAtTime(.38*near, t, .5);
    AUD.nextSwell-=dt; if(AUD.nextSwell<=0){ AUD.nextSwell=4.5+Math.random()*3.5; if(near>.02) swell(near); }
    const high=Math.min(1, Math.max(0,(P.y-8)/40)), TT=U.uT.value; AUD.wind.gn.gain.setTargetAtTime(W.inside?0:(.05+.05*Math.sin(TT*.21)*Math.sin(TT*.07)+.25*high), t, 1.2);
    AUD.nextGull-=dt; if(AUD.nextGull<=0){ AUD.nextGull=6+Math.random()*10; if(near>.25 && !W.inside) gullCry(near); }
    // bước chân: theo quãng đường đi bộ thật (không tính lúc lái xe / ngồi)
    if(HOOK.vehicle || !P.ground){ AUD.lastX=null; return; }
    if(AUD.lastX!=null){ const dd=Math.hypot(P.x-AUD.lastX, P.z-AUD.lastZ); if(dd<1){ AUD.stepAcc+=dd; const run=(P.speed||0)>2.3, stride=run?1.05:.72; if(AUD.stepAcc>=stride){ AUD.stepAcc=0; footstep(surface(), run); } } }
    AUD.lastX=P.x; AUD.lastZ=P.z; }
  const audio={ get on(){ return AUD.on; }, set(on){ AUD.on=!!on; try{ localStorage.setItem('qcworld-sfx', on?'1':'0'); }catch(e){} if(!on && AUD.ctx){ AUD.ctx.close(); AUD.ctx=null; } else if(on) audioInit(); } };

  /* ============================== S15 phần 2: 🥥 RUNG DỪA · 🐚 NHẶT VỎ SÒ · 🏰 ĐẮP LÂU ĐÀI CÁT ============================== */
  const LS=()=>(W.life && W.life.S) || null, LIFE=()=>W.life || {};
  const sv=()=>{ try{ LIFE().save && LIFE().save(); }catch(e){} };
  const buff=(id,min)=>{ const S=LS(); if(!S) return; S.buffs=S.buffs||{}; S.buffs[id]=Math.max(Date.now(), S.buffs[id]||0)+min*60000; sv(); };
  const blip=(f0,f1,dur=.18,type='sine',v=.18)=>{ const c=AUD.ctx; if(!c || !AUD.on) return; const t=c.currentTime, o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f1,t+dur); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(g); g.connect(AUD.master); o.start(t); o.stop(t+dur+.02); };
  // --- 🥥 dừa: rung cây → 1 trái rơi (trọng lực + nảy) → nhặt uống: +⚡ chạy nhanh 6 phút
  const nutGeo=new THREE.SphereGeometry(.17,12,9), nutMat=sm(0x5e7a22,.65), nuts=[];
  const palmI={x:1e9, z:1e9, r:1.9, prio:.35, p:null, label:'🌴 Rung cây dừa cho rơi trái (E)', action:()=>shakePalm(palmI.p)};
  const nutI={x:1e9, z:1e9, r:1.6, prio:.7, n:null, label:'🥥 Nhặt trái dừa – uống nước dừa mát lạnh (E)', action:()=>drinkNut(nutI.n)};
  INTER.push(palmI, nutI);
  function shakePalm(p){ if(!p) return; const now=performance.now(); if(p.cd && now<p.cd){ toast('🌴 Cây này vừa rung xong – để dừa kịp già đã nhé!', 2200); return; }
    p.cd=now+40000; try{ LIFE().emote && LIFE().emote('throw', .5); }catch(e){}
    const h=groundH(p.x,p.z), a=Math.atan2(P.z-p.z, P.x-p.x)+(R()-.5)*1.4, m=new THREE.Mesh(nutGeo, nutMat); m.castShadow=true; m.position.set(p.x+Math.cos(a)*.6, h+6.1*p.s, p.z+Math.sin(a)*.6); scene.add(m);
    nuts.push({m, vx:Math.cos(a)*1.1, vz:Math.sin(a)*1.1, vy:0, gy:h+.15, life:75, rest:false}); setTimeout(()=>blip(140,60,.25,'triangle',.25), 900); toast('🌴 Rung rung… một trái dừa rơi xuống!', 1800); }
  function drinkNut(n){ if(!n) return; scene.remove(n.m); nuts.splice(nuts.indexOf(n),1); nutI.n=null; nutI.x=1e9; buff('energy', 6); const S=LS(); if(S){ S.coconuts=(S.coconuts||0)+1; sv(); }
    try{ LIFE().emote && LIFE().emote('water', 1.2); }catch(e){} blip(500,900,.22); toast(`🥥 Nước dừa mát lạnh! ⚡ chạy nhanh hơn 6 phút · đã uống ${S?S.coconuts:1} trái`, 3000); }
  // --- 🐚 vỏ sò trên bãi cát: nhặt đủ 10 → +50 💰 (nhặt rồi sóng đánh vỏ mới vào sau 2 phút)
  const SHN=28, shellGeo=(()=>{ const g=new THREE.ConeGeometry(.11,.07,9,1); g.rotateX(Math.PI); g.scale(1,1,.8); g.translate(0,.035,0); return g; })();
  const shells=new THREE.InstancedMesh(shellGeo, sm(0xffffff,.45), SHN); shells.userData.dynamic=true; shells.castShadow=false; scene.add(shells);
  const SHC=[0xffd6c9,0xfff3e0,0xf6b8c8,0xffe0a8,0xe8d6ff], SH=[];
  function placeShell(i){ for(let t=0;t<80;t++){ const a=R()*TAU, e=edgeR(a), p=pol(a, e-4.6-R()*3.2); if(!freeSpot(p.x,p.z,.6)) continue; const y=groundH(p.x,p.z); if(y<WATER_Y+.05) continue;
      SH[i]={x:p.x, z:p.z, y, back:0}; _e.set(0,R()*TAU,0); _q.setFromEuler(_e); _m.compose(_p.set(p.x,y,p.z), _q, new THREE.Vector3(1,1,1)); shells.setMatrixAt(i,_m); shells.setColorAt(i,new THREE.Color(SHC[i%SHC.length])); return; }
    SH[i]={x:1e9, z:1e9, y:0, back:30}; }
  for(let i=0;i<SHN;i++) placeShell(i); shells.instanceMatrix.needsUpdate=true; if(shells.instanceColor) shells.instanceColor.needsUpdate=true; shells.computeBoundingSphere(); shells.frustumCulled=false;
  const shellI={x:1e9, z:1e9, r:1.4, prio:.8, i:-1, get label(){ const S=LS(); return `🐚 Nhặt vỏ sò (E) · bộ sưu tập ${((S&&S.shells)||0)%10}/10`; }, action:()=>pickShell(shellI.i)};
  INTER.push(shellI);
  function pickShell(i){ if(i<0 || !SH[i]) return; const s=SH[i]; s.back=120; _m.makeScale(0,0,0); shells.setMatrixAt(i,_m); shells.instanceMatrix.needsUpdate=true; shellI.i=-1; shellI.x=1e9;
    const S=LS(); if(S){ S.shells=(S.shells||0)+1; sv(); } const n=S?S.shells:1; blip(1200,1800,.12,'sine',.12);
    if(n%10===0){ LIFE().addCoins ? LIFE().addCoins(50, `🐚 Đủ bộ 10 vỏ sò! Thưởng nhà sưu tầm bãi biển (+50 💰) · tổng ${n} vỏ`) : toast('🐚 Đủ 10 vỏ sò!', 2600); }
    else toast(`🐚 Nhặt được vỏ sò xinh! (${n%10}/10 – đủ 10 vỏ nhận 50 💰)`, 2000); }
  // --- 🏰 đắp lâu đài cát: 2 chỗ có xô + xẻng, đắp 5 giây, lâu đài đứng 3 phút rồi sóng xoá
  const sandM=sm(0xe3cc94,.95), castles=[];
  function castleGeo(){ const parts=[]; const add=(g,x,y,z)=>{ g.translate(x,y,z); parts.push(g.index?g.toNonIndexed():g); };
    add(new THREE.CylinderGeometry(.62,.7,.32,16),0,.16,0); add(new THREE.BoxGeometry(.7,.42,.7),0,.53,0);
    for(const [x,z] of [[-.38,-.38],[.38,-.38],[-.38,.38],[.38,.38]]){ add(new THREE.CylinderGeometry(.13,.15,.62,10),x,.62,z); add(new THREE.ConeGeometry(.16,.22,10),x,1.04,z); }
    add(new THREE.CylinderGeometry(.18,.2,.5,12),0,.99,0); add(new THREE.ConeGeometry(.22,.3,12),0,1.39,0); for(const p of parts) p.deleteAttribute('uv'); return W.mergeGeometries(parts,false); }
  const CG=castleGeo(), flagM=sm(0xd94141,.6,0,{side:THREE.DoubleSide}), bucketM=sm(0x2f9fe0,.5), spadeM=sm(0xf2c230,.5), poleM=sm(0x555555);
  for(let k=0;k<2;k++){ const c=findSpot(9,4.8,1.6,2500)||findSpot(12,4.5,1.2,2500); if(!c) continue; const y=groundH(c.x,c.z); busy.push({x:c.x,z:c.z,r:2});
    const bk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.12,.26,12), bucketM); bk.position.set(c.x+.9,y+.13,c.z+.4); scene.add(bk); const sp=new THREE.Mesh(new THREE.BoxGeometry(.1,.04,.42), spadeM); sp.position.set(c.x+1.05,y+.03,c.z-.1); sp.rotation.y=.6; scene.add(sp);
    const cs={x:c.x, z:c.z, y, m:null, grow:0, wash:0}; castles.push(cs);
    INTER.push({x:c.x+.6, z:c.z, r:1.8, prio:.5, get label(){ return cs.m && cs.grow>=1 ? '🏰 Lâu đài cát đẹp quá! (sóng sẽ xoá sau ít phút)' : cs.grow>0 ? '🏰 Đang đắp…' : '🏰 Đắp lâu đài cát (E)'; }, action:()=>{ if(cs.grow>0) return;
      cs.m=new THREE.Mesh(CG, sandM); cs.m.castShadow=true; cs.m.position.set(cs.x,cs.y-.02,cs.z); cs.m.scale.set(1,.01,1); scene.add(cs.m);
      const f=new THREE.Mesh(new THREE.PlaneGeometry(.22,.14), flagM); f.position.set(.11,1.68,0); cs.m.add(f); const pole=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.36,4), poleM); pole.position.set(0,1.62,0); cs.m.add(pole);
      cs.grow=.001; cs.wash=180; circles.push(cs.col={x:cs.x, z:cs.z, r:.75}); try{ LIFE().emote && LIFE().emote('water', 4.5); }catch(e){} toast('🏰 Xúc cát, vỗ vỗ… đang đắp lâu đài!', 2400);
      const S=LS(); if(S){ S.castles=(S.castles||0)+1; sv(); } }}); }
  function updBeachFun(dt){
    // cây dừa gần nhất (≤ 1,9 m) → hiện nút rung
    let bp=null, bd=1.9; for(const p of palmSpots){ const d=Math.hypot(P.x-p.x,P.z-p.z); if(d<bd){ bd=d; bp=p; } } palmI.p=bp; if(bp){ palmI.x=bp.x; palmI.z=bp.z; } else palmI.x=1e9;
    // dừa rơi: trọng lực + nảy + lăn nhẹ
    let bn=null, bnd=1.6; for(let i=nuts.length-1;i>=0;i--){ const n=nuts[i]; n.life-=dt; if(n.life<=0){ scene.remove(n.m); nuts.splice(i,1); continue; }
      if(!n.rest){ n.vy-=9.8*dt; n.m.position.x+=n.vx*dt; n.m.position.z+=n.vz*dt; n.m.position.y+=n.vy*dt; n.m.rotation.x+=n.vz*dt*4; n.m.rotation.z-=n.vx*dt*4;
        n.gy=groundH(n.m.position.x,n.m.position.z)+.15; if(n.m.position.y<=n.gy){ n.m.position.y=n.gy; if(Math.abs(n.vy)>2.2){ n.vy=-n.vy*.32; n.vx*=.6; n.vz*=.6; blip(120,70,.12,'triangle',.18); } else { n.vy=0; n.vx*=.9; n.vz*=.9; if(Math.hypot(n.vx,n.vz)<.08) n.rest=true; } } }
      const d=Math.hypot(P.x-n.m.position.x, P.z-n.m.position.z); if(d<bnd){ bnd=d; bn=n; } }
    nutI.n=bn; if(bn){ nutI.x=bn.m.position.x; nutI.z=bn.m.position.z; } else nutI.x=1e9;
    // vỏ sò gần nhất + vỏ mới trôi vào
    let bs=-1, bsd=1.4; for(let i=0;i<SHN;i++){ const s=SH[i]; if(s.back>0){ s.back-=dt; if(s.back<=0){ placeShell(i); shells.instanceMatrix.needsUpdate=true; if(shells.instanceColor) shells.instanceColor.needsUpdate=true; } continue; } const d=Math.hypot(P.x-s.x,P.z-s.z); if(d<bsd){ bsd=d; bs=i; } }
    shellI.i=bs; if(bs>=0){ shellI.x=SH[bs].x; shellI.z=SH[bs].z; } else shellI.x=1e9;
    // lâu đài: mọc lên trong 5 giây, đứng 3 phút, sóng xoá dần
    for(const c of castles){ if(!c.m) continue; if(c.grow<1){ c.grow=Math.min(1, c.grow+dt/5); const g=c.grow; c.m.scale.set(1, Math.max(.01, g<.5? g*1.2 : .6+(g-.5)*.8), 1); if(g>=1){ toast('🏰 Lâu đài cát hoàn thành! Chụp ảnh lưu niệm nào 📸', 2600); blip(600,1200,.3); } continue; }
      c.wash-=dt; if(c.wash<4){ const k=Math.max(.01,c.wash/4); c.m.scale.set(1+(1-k)*.3, k, 1+(1-k)*.3); } if(c.wash<=0){ scene.remove(c.m); c.m=null; c.grow=0; const i=circles.indexOf(c.col); if(i>=0) circles.splice(i,1); } } }

  /* ============================== khung hình ============================== */
  HOOK.onFrame.push((dt, T)=>{ U.uT.value=T; if(W.inside) return;
    const nearIsland=Math.hypot(P.x,P.z)<160;
    if(nearIsland){ updCrabs(dt); updGulls(dt); try{ updBeachFun(dt); }catch(e){} }
    try{ updAudio(dt); }catch(e){} });
  return {placed, palms:palmSpots.length, palmSpots, shells:SH, castles, audio, crabs:CR, gulls:GL};
}
