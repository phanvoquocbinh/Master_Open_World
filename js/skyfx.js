// QC World – S6: BẦU TRỜI SỐNG ĐỘNG (rẻ cho card tích hợp: 4 lượt vẽ, không hậu kỳ)
//  ☁️ Lớp mây trôi theo gió (2 lớp nhiễu lát gạch, nhuộm màu theo giờ: trắng ban ngày, cam hồng lúc hoàng hôn, xám xanh ban đêm)
//  🏔️ Dãy núi xa ở chân trời (vòng ảnh bóng núi, pha màu sương theo giờ) → cảnh có chiều sâu
//  🌕 Trăng + quầng sáng ban đêm
export function makeSkyFX(W){
  const {THREE, scene, camera, HOOK, WATER_Y} = W;
  const R=(()=>{ let a=777; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; })();
  // ảnh nhiễu lát gạch (fbm trên lưới tuần hoàn) cho mây
  const noiseTex=(()=>{ const N=256, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d'), img=g.createImageData(N,N);
    const grid=(p)=>{ const a=new Float32Array(p*p); for(let i=0;i<a.length;i++) a[i]=R(); return a; };
    const oct=[[4,grid(4)],[8,grid(8)],[16,grid(16)],[32,grid(32)],[64,grid(64)]];
    const smp=(p,a,x,y)=>{ const fx=x*p, fy=y*p, xi=Math.floor(fx), yi=Math.floor(fy), tx=fx-xi, ty=fy-yi, u=tx*tx*(3-2*tx), v=ty*ty*(3-2*ty), x0=xi%p, y0=yi%p, x1=(x0+1)%p, y1=(y0+1)%p;
      const A=a[y0*p+x0], B=a[y0*p+x1], C=a[y1*p+x0], D=a[y1*p+x1]; return A+(B-A)*u+(C-A)*v+(A-B-C+D)*u*v; };
    for(let y=0;y<N;y++) for(let x=0;x<N;x++){ let s=0, w=.5, tot=0; for(const [p,a] of oct){ s+=w*smp(p,a,x/N,y/N); tot+=w; w*=.5; } const v=Math.round(s/tot*255), k=(y*N+x)*4; img.data[k]=img.data[k+1]=img.data[k+2]=v; img.data[k+3]=255; }
    g.putImageData(img,0,0); const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.NoColorSpace; t.generateMipmaps=true; return t; })();

  /* ---------- ☁️ mây ---------- */
  const CU={uTime:{value:0}, uNoise:{value:noiseTex}, uCol:{value:new THREE.Color(1,1,1)}, uShade:{value:new THREE.Color(.72,.77,.84)}, uCover:{value:.5}, uAlpha:{value:.85}, uCam:{value:new THREE.Vector2()}};
  const clouds=new THREE.Mesh(new THREE.PlaneGeometry(7000,7000,1,1), new THREE.ShaderMaterial({uniforms:CU, transparent:true, depthWrite:false, fog:false, side:THREE.DoubleSide,
    vertexShader:`varying vec2 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader:`uniform sampler2D uNoise; uniform float uTime, uCover, uAlpha; uniform vec3 uCol, uShade; uniform vec2 uCam; varying vec2 vW;
      void main(){ float vD=length(vW-uCam); vec2 uv=vW/1500.+vec2(uTime*.004,uTime*.0016); float n=texture2D(uNoise,uv).r*.62+texture2D(uNoise,uv*2.7+vec2(.31,.17)-vec2(uTime*.003,0.)).r*.38;
        float c=smoothstep(uCover,uCover+.22,n); if(c<.01) discard; float fade=1.-smoothstep(1400.,3300.,vD); float th=smoothstep(uCover,uCover+.45,n);
        vec3 col=mix(uCol,uShade,th*.75); gl_FragColor=vec4(col, c*fade*uAlpha); }`}));
  clouds.rotation.x=-Math.PI/2; clouds.position.y=360; clouds.renderOrder=-2; clouds.frustumCulled=false; clouds.userData.dynamic=true; clouds.userData.noFar=true; clouds.castShadow=false; clouds.receiveShadow=false; scene.add(clouds);

  /* ---------- 🏔️ dãy núi xa ---------- */
  const ridgeTex=(()=>{ const w=2048, h=256, cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d'); g.clearRect(0,0,w,h);
    const layer=(base, amp, freq, alpha, seed)=>{ g.beginPath(); g.moveTo(0,h); let ph=seed; for(let x=0;x<=w;x+=4){ const t=x/w*Math.PI*2; const y=base-amp*(.55*Math.sin(t*freq+ph)+.3*Math.sin(t*freq*2.3+ph*1.7)+.15*Math.sin(t*freq*5.1+ph*.3))-amp*.35*Math.abs(Math.sin(t*freq*.5+ph)); g.lineTo(x,y); } g.lineTo(w,h); g.closePath(); g.fillStyle=`rgba(255,255,255,${alpha})`; g.fill(); };
    layer(200, 70, 3, .55, 1.3); layer(222, 55, 5, .8, 4.1); layer(238, 34, 9, 1, 2.2);
    const t=new THREE.CanvasTexture(cv); t.wrapS=THREE.RepeatWrapping; t.repeat.x=3; t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const ridgeMat=new THREE.MeshBasicMaterial({map:ridgeTex, transparent:true, fog:false, depthWrite:false, side:THREE.BackSide, color:0x9db3c8});
  const ridge=new THREE.Mesh(new THREE.CylinderGeometry(2100,2100,260,64,1,true), ridgeMat); ridge.position.y=WATER_Y+128; ridge.renderOrder=-1; ridge.frustumCulled=false; ridge.userData.dynamic=true; ridge.userData.noFar=true; scene.add(ridge);

  /* ---------- 🌕 trăng ---------- */
  const moonTex=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=256; const g=cv.getContext('2d'); const gr=g.createRadialGradient(118,112,10,128,128,120); gr.addColorStop(0,'#fffef4'); gr.addColorStop(.85,'#e7e4d4'); gr.addColorStop(1,'#cfcbb8'); g.fillStyle=gr; g.beginPath(); g.arc(128,128,120,0,Math.PI*2); g.fill();
    for(let i=0;i<26;i++){ const a=R()*Math.PI*2, d=R()*95, r=6+R()*20; g.fillStyle=`rgba(150,145,128,${.18+R()*.25})`; g.beginPath(); g.arc(128+Math.cos(a)*d,128+Math.sin(a)*d,r,0,Math.PI*2); g.fill(); }
    const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const haloTex=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=128; const g=cv.getContext('2d'), gr=g.createRadialGradient(64,64,4,64,64,63); gr.addColorStop(0,'rgba(220,230,255,.55)'); gr.addColorStop(.35,'rgba(170,190,255,.18)'); gr.addColorStop(1,'rgba(150,170,255,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(cv); })();
  const moon=new THREE.Mesh(new THREE.PlaneGeometry(110,110), new THREE.MeshBasicMaterial({map:moonTex, transparent:true, fog:false, depthWrite:false, toneMapped:false, color:0xdedbd0}));
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(520,520), new THREE.MeshBasicMaterial({map:haloTex, transparent:true, fog:false, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false}));
  for(const m of [moon, halo]){ m.renderOrder=-1; m.frustumCulled=false; m.userData.dynamic=true; m.userData.noFar=true; m.visible=false; scene.add(m); }
  const MOON_DIR=new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90-34), THREE.MathUtils.degToRad(115));

  /* ---------- màu theo giờ ---------- */
  const PRESET=[   // ngày · hoàng hôn · đêm
    {col:0xffffff, shade:0xcfd8e4, cover:.5, alpha:.85, ridge:0xa9bccf},
    {col:0xffd2a8, shade:0xb8728e, cover:.44, alpha:.92, ridge:0xc99487},
    {col:0x3a4766, shade:0x1d2436, cover:.5,  alpha:.55, ridge:0x1a2234},
  ];
  let ti=-1;
  HOOK.onFrame.push((dt, T)=>{
    const p=camera.position;
    clouds.position.x=p.x; clouds.position.z=p.z; CU.uCam.value.set(p.x,p.z); CU.uTime.value=T;
    ridge.position.x=p.x; ridge.position.z=p.z;
    if(W.timeIdx!==ti){ ti=W.timeIdx; const s=PRESET[Math.min(ti,PRESET.length-1)]||PRESET[0]; CU.uCol.value.set(s.col); CU.uShade.value.set(s.shade); CU.uCover.value=s.cover; CU.uAlpha.value=s.alpha; ridgeMat.color.set(s.ridge); moon.visible=halo.visible=ti===2; }
    if(moon.visible){ const d=1900; moon.position.copy(p).addScaledVector(MOON_DIR,d); halo.position.copy(moon.position); moon.lookAt(p); halo.lookAt(p); }
    // trong toà nhà (cảnh riêng) không cần
    const inside=!!W.inside; clouds.visible=!inside; ridge.visible=!inside;
  });
  return {clouds, ridge, moon};
}
