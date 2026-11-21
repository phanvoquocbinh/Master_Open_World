// QC World V2 – SÓNG BIỂN (phiên B · abyss-sea, 20/11/2026 – yêu cầu Bình qua phiên chính)
//  • Mặt nước nhấp nhô: tổng 4 sóng hướng khác nhau (kiểu Gerstner, chỉ đổi pháp tuyến + màu ngọn/chân sóng) → rẻ GPU, không thêm đỉnh, không thêm lượt vẽ.
//  • Vệt sóng sau tàu (wake): tối đa 10 tàu đang chạy gần camera – vệt bọt giữa đuôi + 2 cánh sóng Kelvin 19,5° + bọt dọc mạn.
//  • Sóng vỗ bờ: bản đồ "khoảng cách tới bờ" dựng 1 lần lúc nạp (vịnh Abyssal + quần đảo đá vôi) → bọt trắng sát mép cát / vách đá
//    + từng đợt sóng chạy vào bờ rồi tan.
// Chèn vào vật liệu nước chung W.water bằng onBeforeCompile (giữ nguyên PBR + đoạn sương mù của world.html), có customProgramCacheKey.
// Chế độ nước "phản chiếu thật" (three Water.js) cũng được chèn trực tiếp vào shader.
// API: W.abyWaves {addSource(getter, B, L), sources, U (uniforms), boxes}
export function make(W, o={}){
  if(W.abyWaves) return W.abyWaves; const {THREE, HOOK} = W, water=W.water; if(!water || !water.material) return null;
  const WY=o.WY ?? -.35, MAXB=10, mat=water.material;
  /* SỬA "BIỂN TRẮNG XOÁ" (20/11): bộ "bỏ vẽ vật nhỏ ở xa" của world.html (markFar) coi mặt nước 4000 × 4000 m là "tấm phẳng mỏng" → userData.farR2 = 192² m
     (máy yếu; 307² máy vừa) tính từ TÂM tấm = gốc toạ độ → camera đi xa gốc hơn ~190–300 m (quần đảo đá vôi ~550 m) là cả mặt biển bị loại, chỉ còn nền trời trắng.
     Mặt nước phải luôn được vẽ: farR2 = 0 + noFar (đặt trước/sau markFar đều đúng). */
  water.userData.farR2=0; water.userData.noFar=true;
  const U={ uT:{value:0}, uDay:{value:1}, uAmp:{value:1},
    uBoat:{value:Array.from({length:MAXB},()=>new THREE.Vector4(0,0,0,0))}, uBoatS:{value:Array.from({length:MAXB},()=>new THREE.Vector2(4,10))},
    uShA:{value:null}, uBoxA:{value:new THREE.Vector4(0,0,-1,-1)}, uShB:{value:null}, uBoxB:{value:new THREE.Vector4(0,0,-1,-1)} };

  /* ---------- bản đồ khoảng cách tới bờ (0–24 m) – biến đổi khoảng cách 2 lượt (chamfer) trên lưới n×n ---------- */
  function shoreTex(box, n, land){ const [x0,z0,x1,z1]=box, sx=(x1-x0)/(n-1), sz=(z1-z0)/(n-1), D=new Float32Array(n*n), BIG=1e6, a=Math.min(sx,sz), dg=Math.hypot(sx,sz);
    for(let j=0;j<n;j++) for(let i=0;i<n;i++){ D[j*n+i]=land(x0+i*sx, z0+j*sz) ? 0 : BIG; }
    /* kè, đảo khách sạn, cầu tàu… dựng bằng plat (không phải địa hình) + cột / đá có va chạm cắm xuống nước → cũng là "bờ" */
    const cell=(x,z)=>{ const i=Math.round((x-x0)/sx), j=Math.round((z-z0)/sz); if(i>=0 && j>=0 && i<n && j<n) D[j*n+i]=0; };
    for(const p of (W.plats||[])){ if(!(p.h>WY-.05 && p.h<WY+4)) continue; let r=p.t==='c'?p.r:p.t==='ring'?p.r1:Math.hypot(p.hw,p.hd); if(!(r>0) || p.x+r<x0 || p.x-r>x1 || p.z+r<z0 || p.z-r>z1) continue;
      for(let z=Math.max(z0,p.z-r); z<=Math.min(z1,p.z+r); z+=sz) for(let x=Math.max(x0,p.x-r); x<=Math.min(x1,p.x+r); x+=sx){ const dx=x-p.x, dz=z-p.z; let ins;
        if(p.t==='c') ins=dx*dx+dz*dz<p.r*p.r; else if(p.t==='ring'){ const d2=dx*dx+dz*dz; ins=d2>p.r0*p.r0 && d2<p.r1*p.r1; } else ins=Math.abs(dx*p.c-dz*p.s)<p.hw && Math.abs(dx*p.s+dz*p.c)<p.hd; if(ins) cell(x,z); } }
    for(const c of (W.circles||[])){ if(!(c.r>.25) || c.r>12 || c.owner || !(c.x>x0-c.r && c.x<x1+c.r && c.z>z0-c.r && c.z<z1+c.r)) continue; if(c.y0!==undefined && !(c.y0<WY+.2 && c.y1>WY)) continue;
      for(let z=c.z-c.r; z<=c.z+c.r; z+=sz*.7) for(let x=c.x-c.r; x<=c.x+c.r; x+=sx*.7) if((x-c.x)**2+(z-c.z)**2<=c.r*c.r) cell(x,z); }
    for(let j=0;j<n;j++) for(let i=0;i<n;i++){ let v=D[j*n+i]; if(!v) continue; if(i>0) v=Math.min(v,D[j*n+i-1]+sx); if(j>0){ v=Math.min(v,D[(j-1)*n+i]+sz); if(i>0) v=Math.min(v,D[(j-1)*n+i-1]+dg); if(i<n-1) v=Math.min(v,D[(j-1)*n+i+1]+dg); } D[j*n+i]=v; }
    for(let j=n-1;j>=0;j--) for(let i=n-1;i>=0;i--){ let v=D[j*n+i]; if(!v) continue; if(i<n-1) v=Math.min(v,D[j*n+i+1]+sx); if(j<n-1){ v=Math.min(v,D[(j+1)*n+i]+sz); if(i<n-1) v=Math.min(v,D[(j+1)*n+i+1]+dg); if(i>0) v=Math.min(v,D[(j+1)*n+i-1]+dg); } D[j*n+i]=v; }
    const px=new Uint8Array(n*n*4); let landN=0; for(let k=0;k<n*n;k++){ const d=D[k]; if(d===0) landN++; px[k*4]=Math.round(Math.min(1,d/24)*255); px[k*4+3]=255; }
    const t=new THREE.DataTexture(px,n,n,THREE.RGBAFormat); t.magFilter=t.minFilter=THREE.LinearFilter; t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; t.needsUpdate=true; t.userData={landN, n, a}; return t; }
  const groundH=W.groundH || ((x,z)=>W.groundAt(x,z)), boxes={};
  try{ if(o.bay){ const b=o.bay; U.uShA.value=shoreTex(b,256,(x,z)=>groundH(x,z)>WY-.03); U.uBoxA.value.set(b[0],b[1],b[2],b[3]); boxes.bay={box:b, land:U.uShA.value.userData.landN}; } }catch(e){ console.warn('[abyssal_waves] bờ vịnh', e); }
  try{ if(o.karst){ const b=o.karst; U.uShB.value=shoreTex(b,256,(x,z)=>(o.karstLand && o.karstLand(x,z)) || groundH(x,z)>WY-.03); U.uBoxB.value.set(b[0],b[1],b[2],b[3]); boxes.karst={box:b, land:U.uShB.value.userData.landN}; } }catch(e){ console.warn('[abyssal_waves] bờ đảo', e); }
  const dummy=new THREE.DataTexture(new Uint8Array([255,0,0,255]),1,1,THREE.RGBAFormat); dummy.needsUpdate=true; if(!U.uShA.value) U.uShA.value=dummy; if(!U.uShB.value) U.uShB.value=dummy;

  /* ---------- GLSL dùng chung ---------- */
  const PARS=`
uniform float uT; uniform float uDay; uniform float uAmp; uniform vec4 uBoat[${MAXB}]; uniform vec2 uBoatS[${MAXB}];
uniform sampler2D uShA; uniform vec4 uBoxA; uniform sampler2D uShB; uniform vec4 uBoxB;
float abyHash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
float abyVN(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(abyHash(i),abyHash(i+vec2(1.0,0.0)),f.x), mix(abyHash(i+vec2(0.0,1.0)),abyHash(i+vec2(1.0,1.0)),f.x), f.y); }
// 4 sóng: trả về pháp tuyến thế giới, h = độ cao (m)
vec3 abyWave(vec2 p, float t, out float h){
  vec2 d1=vec2(.8,.6), d2=normalize(vec2(-.45,.9)), d3=normalize(vec2(.95,-.3)), d4=normalize(vec2(-.7,-.71));
  float k1=.21, k2=.37, k3=.83, k4=1.7; float a1=.16, a2=.09, a3=.045, a4=.02;
  float f1=dot(d1,p)*k1+t*sqrt(9.8*k1), f2=dot(d2,p)*k2+t*sqrt(9.8*k2)+1.7, f3=dot(d3,p)*k3+t*sqrt(9.8*k3)+.4, f4=dot(d4,p)*k4+t*sqrt(9.8*k4)+2.9;
  h=a1*sin(f1)+a2*sin(f2)+a3*sin(f3)+a4*sin(f4);
  vec2 g=d1*(a1*k1*cos(f1))+d2*(a2*k2*cos(f2))+d3*(a3*k3*cos(f3))+d4*(a4*k4*cos(f4));
  return normalize(vec3(-g.x*uAmp, 1.0, -g.y*uAmp)); }
float abyShore(sampler2D tx, vec4 box, vec2 p, float t){ if(box.z<=box.x) return 0.0; vec2 uv=(p-box.xy)/(box.zw-box.xy); if(uv.x<0.0||uv.y<0.0||uv.x>1.0||uv.y>1.0) return 0.0;
  float d=texture2D(tx,uv).r*24.0; if(d>22.0) return 0.0;
  float n=abyVN(p*.8+vec2(t*.25,-t*.18))*.6+abyVN(p*2.4-vec2(t*.2,t*.3))*.4;
  float edge=1.0-smoothstep(0.2, 1.6+n*1.6, d);                                   // bọt bám sát mép cát / chân vách
  float ph=d*1.05+t*1.25+abyVN(p*.04)*6.28;                                     // đợt sóng chạy vào bờ (pha giảm dần theo khoảng cách)
  float band=smoothstep(.74,.97,sin(ph))*(1.0-smoothstep(1.5,13.0,d))*smoothstep(.25,.65,n);
  float wash=smoothstep(.5,.95,sin(ph+1.2))*(1.0-smoothstep(.0,3.2,d))*.6;      // nước tràn lên rồi rút
  return clamp(max(edge*(.5+.5*n), max(band*.9, wash)),0.0,1.0); }
float abyWake(vec2 p, float t){ float f=0.0;
  for(int i=0;i<${MAXB};i++){ vec4 b=uBoat[i]; if(b.w<0.4) continue; vec2 s=uBoatS[i]; vec2 dir=vec2(sin(b.z),cos(b.z)); vec2 q=p-b.xy; float al=dot(q,dir), ac=dot(q,vec2(dir.y,-dir.x));
    float back=-al-s.y*.5; if(back<-s.y*.95 || back>160.0 || abs(ac)>s.x+back*.45) continue; float bb=max(back,0.0), sp=clamp(b.w/8.0,0.0,1.0);
    float w=s.x*.42+bb*.07; float trail=exp(-ac*ac/(w*w))*exp(-bb/(26.0+s.y))*sp*(back>-.5?1.0:0.0);
    float arm=abs(abs(ac)-(s.x*.5+bb*.354)); float kel=(1.0-smoothstep(0.0,.45+bb*.03,arm))*exp(-bb/(55.0+s.y))*sp*(.55+.45*sin(bb*1.05-t*3.5));
    float nz=abyVN(p*1.6+vec2(t*.7,t*.4));
    f=max(f, max(trail*(.55+.45*nz), kel*(.5+.5*nz))); }
  return clamp(f,0.0,1.0); }
float abyFoam(vec2 p, float t, float h, float fd){ float f=max(abyShore(uShA,uBoxA,p,t), abyShore(uShB,uBoxB,p,t)); f=max(f, abyWake(p,t));
  f=max(f, smoothstep(.2,.29,h)*.22*fd*smoothstep(.45,.8,abyVN(p*.7+t*.3)));   // vài ngọn sóng bạc đầu lác đác
  return f; }
`;
  const FOAM_COL='vec3(.90,.95,.97)*(.42+.58*uDay)';

  /* ---------- chèn vào vật liệu ---------- */
  let mode='none';
  if(mat.isShaderMaterial && mat.uniforms && /surfaceNormal/.test(mat.fragmentShader)){   /* three Water.js (chế độ phản chiếu thật) */
    Object.assign(mat.uniforms, U); let fs=mat.fragmentShader;
    fs=fs.replace('void main() {', PARS+'\nvoid main() {');
    fs=fs.replace(/vec3 surfaceNormal = normalize\( noise\.xzy \* vec3\( 1\.5, 1\.0, 1\.5 \) \);/, m=>`${m}\n float abyH; float abyFd=1.0-smoothstep(80.0,520.0,length(worldPosition.xz-cameraPosition.xz)); vec3 abyN=abyWave(worldPosition.xz,uT,abyH); surfaceNormal=normalize(surfaceNormal+vec3(abyN.x,0.0,abyN.z)*1.6*abyFd);`);
    fs=fs.replace(/gl_FragColor = vec4\( outgoingLight, alpha \);/, m=>`${m}\n { float abyF=abyFoam(worldPosition.xz,uT,abyH,abyFd); gl_FragColor.rgb=mix(gl_FragColor.rgb, ${FOAM_COL}, abyF); gl_FragColor.a=max(gl_FragColor.a,abyF); }`);
    if(/abyFoam\(worldPosition/.test(fs)){ mat.fragmentShader=fs; mat.needsUpdate=true; mode='reflect'; } }
  else if(mat.isMeshStandardMaterial){
    const prev=mat.onBeforeCompile;
    mat.onBeforeCompile=function(sh, r){ if(prev) prev.call(this, sh, r); Object.assign(sh.uniforms, U);
      sh.vertexShader=sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vAbyW;').replace('#include <project_vertex>', '#include <project_vertex>\nvAbyW=(modelMatrix*vec4(transformed,1.0)).xyz;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vAbyW;'+PARS)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  float abyH; float abyFd=1.0-smoothstep(80.0,520.0,length(vAbyW.xz-cameraPosition.xz)); vec3 abyN=abyWave(vAbyW.xz,uT,abyH);
  normal=normalize(normal+(viewMatrix*vec4(abyN.x,0.0,abyN.z,0.0)).xyz*1.35*abyFd);`)
        .replace('#include <color_fragment>', '#include <color_fragment>\n')
        .replace('#include <opaque_fragment>', `#include <opaque_fragment>
  { float abyF=abyFoam(vAbyW.xz,uT,abyH,abyFd); gl_FragColor.rgb=mix(gl_FragColor.rgb*(.94+.12*clamp(abyH*3.5+.5,0.0,1.0)), ${FOAM_COL}, abyF); gl_FragColor.a=max(gl_FragColor.a,abyF); }`);
      mat.userData.abyShader=sh; };
    const pk=mat.customProgramCacheKey ? mat.customProgramCacheKey.bind(mat) : null; mat.customProgramCacheKey=()=>(pk?pk():'')+'|aby-waves-1';
    mat.needsUpdate=true; mode='pbr'; }

  /* ---------- nguồn vệt sóng: hàm trả {x,z} (hướng + tốc độ tính từ chênh vị trí giữa 2 khung hình) ---------- */
  const SRC=[]; function addSource(get, B=4, L=10){ const s={get, B, L, px:null, pz:null, hd:0, v:0}; SRC.push(s); return s; }
  const _sel=[];
  HOOK.onFrame.push((dt)=>{ dt=Math.min(dt||1/60,.1); U.uT.value=(W.T||0)%3600; U.uDay.value=1-.72*(W.night||0);
    const c=W.camera.position; _sel.length=0;
    for(const s of SRC){ let p=null; try{ p=s.get(); }catch(e){} if(!p){ s.px=null; s.v=0; continue; }
      if(s.px!=null && dt>0){ const dx=p.x-s.px, dz=p.z-s.pz, sp=Math.hypot(dx,dz)/dt; if(sp<60){ s.v+=(sp-s.v)*Math.min(1,dt*4); if(sp>.3) s.hd=Math.atan2(dx,dz); } }
      s.px=p.x; s.pz=p.z; if(p.hd!=null && s.v<.3) s.hd=p.hd; if(s.v>.4){ const d=Math.hypot(p.x-c.x,p.z-c.z); if(d<700) _sel.push([d,s,p]); } }
    _sel.sort((a,b)=>a[0]-b[0]);
    for(let i=0;i<MAXB;i++){ const e=_sel[i]; if(e){ U.uBoat.value[i].set(e[2].x,e[2].z,e[1].hd,e[1].v); U.uBoatS.value[i].set(e[1].B,e[1].L); } else U.uBoat.value[i].w=0; } });
  const api={addSource, sources:SRC, U, boxes, mode};
  console.info('[abyssal_waves] sóng biển:', mode, JSON.stringify(boxes));
  W.abyWaves=api; return api; }
