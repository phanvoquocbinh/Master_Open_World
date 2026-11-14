// ============================================================================
// QC World – GFX KIT (S-GFX): bộ dựng đồ hoạ "kiến trúc thật" chạy được trên card tích hợp (Intel Iris Xe)
//  • Vật liệu PBR THỦ TỤC: albedo + normal + roughness/AO sinh bằng JS (không tải ảnh, không dính bản quyền)
//  • Hình khối VÁT CẠNH (cbox) – cạnh bắt sáng như render Blender; UV theo MÉT → texture không bị kéo giãn
//  • KÍNH CÓ PHÒNG BÊN TRONG (interior mapping): cả mặt dựng 1 lượt vẽ, ban ngày thấy bàn/trần/đèn, ban đêm phòng sáng ngẫu nhiên
//  • Cây "bông xốp" (thẻ lá + pháp tuyến cầu + đổ bóng giả bên trong tán), cau/cọ, đèn đường, mái hiên vải, dây đèn, bóng AO giả
//  • Công trình mẫu: toà văn phòng (curtain/fins/timber/setback), dãy nhà phố + quán cà phê Việt Nam, siêu biệt thự,
//    campus công nghệ (vòng kính, mái lều vảy rồng, vòm kính cây xanh), văn phòng mở bên trong
//  Mọi thứ gộp theo vật liệu (Kit) → mỗi công trình chỉ vài lượt vẽ. Thiết kế + ngân sách: DESIGN_GRAPHICS.md
// ============================================================================
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const TAU=Math.PI*2;
export function rng(seed){ let s=(seed>>>0)||1; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hash2(ix,iy,seed){ let h=(Math.imul(ix|0,374761393)+Math.imul(iy|0,668265263)+Math.imul(seed|0,144665))|0; h=Math.imul(h^(h>>>13),1274126177); h^=h>>>16; return (h>>>0)/4294967296; }
const md=(a,p)=>((a%p)+p)%p;
function vnoise(x,y,px,py,seed){ const ix=Math.floor(x), iy=Math.floor(y), fx=x-ix, fy=y-iy, ux=fx*fx*(3-2*fx), uy=fy*fy*(3-2*fy);
  const x0=md(ix,px), x1=md(ix+1,px), y0=md(iy,py), y1=md(iy+1,py);
  const a=hash2(x0,y0,seed), b=hash2(x1,y0,seed), c=hash2(x0,y1,seed), d=hash2(x1,y1,seed);
  return a+(b-a)*ux+(c-a)*uy+(a-b-c+d)*ux*uy; }
// fbm lặp tuần hoàn (texture liền mạch): x∈[0,px), y∈[0,py)
function fbm(x,y,px,py,oct,seed){ let s=0,a=.5,f=1,n=0; for(let o=0;o<oct;o++){ s+=a*vnoise(x*f,y*f,px*f,py*f,seed+o*131); n+=a; a*=.5; f*=2; } return s/n; }
const ss=(a,b,x)=>{ let t=(x-a)/(b-a); t=t<0?0:t>1?1:t; return t*t*(3-2*t); };
const mix=(a,b,t)=>a+(b-a)*t;
const rgbOf=c=>[(c>>16)&255,(c>>8)&255,c&255];

/* ============================== 1. HÌNH KHỐI ============================== */
const CB=new Map();
// hộp vát cạnh (12 cạnh vát 1 nấc): ~40 tam giác, UV theo mét. Hình được nhớ lại (Kit tự clone) → dựng nhanh
export function cbox(w,h,d,c=.04,seg=1){ const key=`${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}|${c}|${seg}`; if(CB.has(key)) return CB.get(key);
  c=Math.max(.001,Math.min(c,w/2-.002,h/2-.002,d/2-.002));
  const s=new THREE.Shape(), hw=w/2-c, hd=d/2-c; s.moveTo(-hw,-hd); s.lineTo(hw,-hd); s.lineTo(hw,hd); s.lineTo(-hw,hd);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,h-2*c), bevelEnabled:true, bevelThickness:c, bevelSize:c, bevelOffset:0, bevelSegments:seg, curveSegments:1});
  g.rotateX(-Math.PI/2); g.translate(0,-(h-2*c)/2,0); CB.set(key,g); return g; }
// hộp/mặt phẳng/trụ có UV theo mét (ou,ov = lệch UV để mỗi mặt một kiểu)
export function boxM(w,h,d,ou=0,ov=0){ const g=new THREE.BoxGeometry(w,h,d), uv=g.attributes.uv, S=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let f=0;f<6;f++) for(let i=0;i<4;i++){ const k=f*4+i; uv.setXY(k, ou+uv.getX(k)*S[f][0], ov+uv.getY(k)*S[f][1]); } return g; }
export function planeM(w,h,ou=0,ov=0,su=1,sv=1){ const g=new THREE.PlaneGeometry(w,h), uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i, ou+uv.getX(i)*w*su, ov+uv.getY(i)*h*sv); return g; }
const planeU=(w,h)=>new THREE.PlaneGeometry(w,h);   // UV 0..1 – cho biển hiệu/menu/màn hình (texture chữ không lặp)
export function cylM(rt,rb,h,seg=16,open=false,ou=0,sv=1){ const g=new THREE.CylinderGeometry(rt,rb,h,seg,1,open), uv=g.attributes.uv, C=Math.PI*(rt+rb), n=(seg+1)*2, D=2*Math.max(rt,rb);
  for(let i=0;i<uv.count;i++){ if(i<n) uv.setXY(i, ou+uv.getX(i)*C, uv.getY(i)*h*sv); else uv.setXY(i, uv.getX(i)*D, uv.getY(i)*D); } return g; }
export function flipGeo(src){ const g=src.index?src.toNonIndexed():src.clone(); for(const A of Object.values(g.attributes)){ const s=A.itemSize, a=A.array;
    for(let i=0;i<A.count;i+=3) for(let c=0;c<s;c++){ const t=a[(i+1)*s+c]; a[(i+1)*s+c]=a[(i+2)*s+c]; a[(i+2)*s+c]=t; } }
  const n=g.attributes.normal; if(n) for(let i=0;i<n.array.length;i++) n.array[i]*=-1; return g; }
function uvXZ(g){ const p=g.attributes.position, uv=g.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i),p.getZ(i)); return g; }
function limb(a,b,r0,r1,seg=7){ const d=new THREE.Vector3().subVectors(b,a), L=d.length(), g=cylM(r1,r0,L,seg,true); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), d.normalize())); g.translate((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2); return g; }
function annulus(r0,r1,th,seg){ const t=new THREE.RingGeometry(r0,r1,seg,1); t.rotateX(-Math.PI/2); t.translate(0,th/2,0); const b=new THREE.RingGeometry(r0,r1,seg,1); b.rotateX(Math.PI/2); b.translate(0,-th/2,0);
  return [uvXZ(t), uvXZ(b), cylM(r1,r1,th,seg,true), flipGeo(cylM(r0,r0,th,seg,true))]; }

// Vật liệu MÀU TRƠN (không texture/phát sáng/trong suốt/shader riêng) → gộp thành 1 vật liệu "màu theo đỉnh" cho mỗi (độ nhám, kim loại):
// hàng chục màu sơn/ghế/nhựa chỉ còn vài lượt vẽ (cùng ý tưởng perf.js batchStatic)
const VCM=new Map(), BASE_OBC=THREE.Material.prototype.onBeforeCompile;
const isPlain=m=>m.isMeshStandardMaterial && !m.isMeshPhysicalMaterial && !(m.userData&&m.userData.noMerge) && !m.map && !m.normalMap && !m.roughnessMap && !m.emissiveMap && !m.alphaMap && !m.aoMap
  && !m.transparent && m.alphaTest===0 && !m.vertexColors && m.onBeforeCompile===BASE_OBC && !(m.emissive && m.emissive.getHex()!==0 && m.emissiveIntensity>0);
function vcMat(m){ const k=`${m.roughness}|${m.metalness}|${m.side}|${m.envMapIntensity}`; if(!VCM.has(k)) VCM.set(k,new THREE.MeshStandardMaterial({vertexColors:true, roughness:m.roughness, metalness:m.metalness, side:m.side, envMapIntensity:m.envMapIntensity})); return VCM.get(k); }
// Kit: gom hình theo vật liệu → 1 lượt vẽ / vật liệu. add(geo, mat, x,y,z, ry,rx,rz, sx,sy,sz)
export function Kit(){ const parts=new Map(), _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _p=new THREE.Vector3(), _s=new THREE.Vector3();
  const prep=geo=>{ const g=geo.index?geo.toNonIndexed():geo.clone(); for(const k of Object.keys(g.attributes)) if(!['position','normal','uv','color'].includes(k)) g.deleteAttribute(k);
    if(!g.attributes.normal) g.computeVertexNormals(); if(!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); g.morphAttributes={}; g.clearGroups(); return g; };
  const push=(g,mat)=>{ if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); return g; };
  return {
    add(geo,mat,x=0,y=0,z=0,ry=0,rx=0,rz=0,sx=1,sy=1,sz=1){ const g=prep(geo); _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z),_q,_s.set(sx,sy,sz)); g.applyMatrix4(_m); return push(g,mat); },
    addMat(geo,mat,m4){ const g=prep(geo); g.applyMatrix4(m4); return push(g,mat); },
    get size(){ let n=0; for(const l of parts.values()) n+=l.length; return n; },
    build(parent,o={}){ const out=[];
      // vật liệu "tô màu" (plasterC/louverC/fabricC…): cùng texture, khác màu → dồn về 1 vật liệu gốc + màu theo đỉnh
      for(const [mat,list] of [...parts]){ const tb=mat.userData.tintOf; if(!tb) continue; const c=mat.color;
        for(const g of list){ const n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b; } g.setAttribute('color',new THREE.Float32BufferAttribute(a,3)); push(g,tb); }
        parts.delete(mat); }
      if(o.vc!==false) for(const [mat,list] of [...parts]){ if(!isPlain(mat)) continue; const c=mat.color, vm=vcMat(mat);
        for(const g of list){ const n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b; } g.setAttribute('color',new THREE.Float32BufferAttribute(a,3)); push(g,vm); }
        parts.delete(mat); }
      for(const [mat,list] of parts){ if(list.some(g=>g.attributes.color)) for(const g of list) if(!g.attributes.color) g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(1),3));
        const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue;
        const ms=new THREE.Mesh(geo,mat); ms.castShadow=o.cast!==false && !mat.transparent && !mat.userData.noCast; ms.receiveShadow=o.receive!==false; parent.add(ms); out.push(ms); }
      parts.clear(); return out; } }; }
// đặt theo hệ toạ độ cục bộ (gốc X,Y,Z, xoay ry): P(geo,mat, lx,ly,lz, rx,rz, ry2, sx,sy,sz); P.at(lx,lz) → [x,z]
export function local(k,X,Y,Z,ry=0){ const c=Math.cos(ry), s=Math.sin(ry), at=(lx,lz)=>[X+lx*c+lz*s, Z-lx*s+lz*c];
  const f=(geo,mat,lx=0,ly=0,lz=0,rx=0,rz=0,ry2=0,sx=1,sy=1,sz=1)=>{ const [x,z]=at(lx,lz); return k.add(geo,mat,x,Y+ly,z,ry+ry2,rx,rz,sx,sy,sz); }; f.at=at; f.ry=ry; f.Y=Y; return f; }
const faces4=(w,d)=>[[0,d/2,w,0],[w/2,0,d,Math.PI/2],[0,-d/2,w,Math.PI],[-w/2,0,d,-Math.PI/2]];

/* ============================== 2. TEXTURE THỦ TỤC ============================== */
const TEXC=new Map();
function dataTex(data,N,srgb){ const t=new THREE.DataTexture(data,N,N,THREE.RGBAFormat); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.magFilter=THREE.LinearFilter; t.minFilter=THREE.LinearMipmapLinearFilter; t.generateMipmaps=true; t.anisotropy=8; if(srgb) t.colorSpace=THREE.SRGBColorSpace; t.needsUpdate=true; return t; }
// fn(u,v,o): o=[r,g,b (0..255), độ cao 0..1 (1 = mặt, 0 = rãnh), độ nhám 0..1]. S = số mét / 1 lần lặp; depth = độ sâu rãnh (m)
function genSet(key,N,S,depth,fn){ if(TEXC.has(key)) return TEXC.get(key);
  // o[5] = AO riêng (nếu fn không đặt → suy ra từ độ cao: rãnh tối)
  const col=new Uint8ClampedArray(N*N*4), H=new Float32Array(N*N), RO=new Float32Array(N*N), AO=new Float32Array(N*N), o=[0,0,0,1,.8,-1];
  for(let y=0;y<N;y++) for(let x=0;x<N;x++){ o[3]=1; o[4]=.8; o[5]=-1; fn(x/N,y/N,o); const i=y*N+x, j=i*4; col[j]=o[0]; col[j+1]=o[1]; col[j+2]=o[2]; col[j+3]=255; H[i]=o[3]; RO[i]=o[4]; AO[i]=o[5]>=0?o[5]:.42+.58*Math.sqrt(Math.max(0,o[3])); }
  const nor=new Uint8ClampedArray(N*N*4), orm=new Uint8ClampedArray(N*N*4), k=depth*N/(2*S);
  for(let y=0;y<N;y++) for(let x=0;x<N;x++){ const i=y*N+x, j=i*4;
    const dx=(H[y*N+(x+1)%N]-H[y*N+(x-1+N)%N])*k, dy=(H[((y+1)%N)*N+x]-H[((y-1+N)%N)*N+x])*k, l=Math.hypot(dx,dy,1);
    nor[j]=(-dx/l*.5+.5)*255; nor[j+1]=(-dy/l*.5+.5)*255; nor[j+2]=(1/l*.5+.5)*255; nor[j+3]=255;
    orm[j]=AO[i]*255; orm[j+1]=RO[i]*255; orm[j+2]=0; orm[j+3]=255; }
  const set={map:dataTex(col,N,true), normalMap:dataTex(nor,N,false), orm:dataTex(orm,N,false), S};
  for(const t of [set.map,set.normalMap,set.orm]) t.repeat.set(1/S,1/S);
  TEXC.set(key,set); return set; }
function canvasTex(w,h,draw,srgb=true){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); if(srgb) t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=8; return t; }

/* ============================== 3. KÍNH CÓ PHÒNG BÊN TRONG (interior mapping) ============================== */
// Tia nhìn đi vào lưới phòng ảo (rộng uRoom.x, cao uRoom.y, sâu uRoom.z) theo UV mét của mặt kính – tính trong hệ tiếp tuyến lấy từ đạo hàm màn hình
// (không cần thuộc tính tangent, chạy cho mặt phẳng lẫn mặt cong). Không dùng pow() (D3D: pow(0,x) → NaN).
const GLSL_INT=`
uniform vec3 uRoom; uniform float uDay; uniform float uNight; uniform float uLit; uniform float uLevel; uniform float uTrans;
uniform vec3 uWall; uniform vec3 uFloorC; uniform vec3 uWarm; uniform float uSeed; uniform float uKind;
varying vec2 vGUv;
float gh13(vec3 p){ p=fract(p*.1031); p+=dot(p,p.zyx+31.32); return fract((p.x+p.y)*p.z); }
float box2(vec2 p, vec4 r){ return step(r.x,p.x)*step(p.x,r.z)*step(r.y,p.y)*step(p.y,r.w); }
vec3 gInterior(vec2 uvm, vec3 vpos, vec3 N){
  vec3 q0=dFdx(vpos), q1=dFdy(vpos); vec2 s0=dFdx(uvm), s1=dFdy(uvm);
  vec3 q1p=cross(q1,N), q0p=cross(N,q0);
  vec3 T=q1p*s0.x+q0p*s1.x, B=q1p*s0.y+q0p*s1.y;
  float det=max(dot(T,T),dot(B,B)); float sc=det<=0.?0.:inversesqrt(det); T*=sc; B*=sc;
  vec3 d=normalize(vpos);
  vec3 r=vec3(dot(d,T)/uRoom.x, dot(d,B)/uRoom.y, max(-dot(d,N),.03)/uRoom.z);
  if(abs(r.x)<1e-4) r.x=1e-4;
  if(abs(r.y)<1e-4) r.y=1e-4;
  vec2 rc=uvm/uRoom.xy; vec2 cell=floor(rc); vec3 o=vec3(rc-cell,0.);
  float h1=gh13(vec3(cell,uSeed)), h2=gh13(vec3(cell.yx+17.3,uSeed+3.1)), h3=gh13(vec3(cell*1.7+5.1,uSeed+7.7));
  vec3 tt=vec3(((r.x>0.?1.:0.)-o.x)/r.x, ((r.y>0.?1.:0.)-o.y)/r.y, 1./r.z);
  float tm=min(tt.x,min(tt.y,tt.z)); vec3 h=o+r*tm;
  vec3 wall=uWall*(.78+.4*h2); vec3 c; float em=0.;
  if(tt.z<=tt.x && tt.z<=tt.y){
    c=wall;
    if(uKind<.5){
      float desk=box2(h.xy,vec4(.08,.2,.92,.25)); float leg=box2(h.xy,vec4(.1,0.,.13,.2))+box2(h.xy,vec4(.87,0.,.9,.2));
      c=mix(c,uFloorC*.45,clamp(desk+leg,0.,1.));
      float sc1=box2(h.xy,vec4(.24,.27,.49,.41))*step(.3,h3), sc2=box2(h.xy,vec4(.55,.27,.8,.41))*step(.6,h3);
      c=mix(c,vec3(.035,.045,.06),clamp(sc1+sc2,0.,1.)); em+=(sc1+sc2)*.3;
      c=mix(c,uFloorC*.75,box2(h.xy,vec4(.08,.52,.34,.82))*step(h1,.45));
      c=mix(c,vec3(.25,.42,.3),box2(h.xy,vec4(.8,.0,.95,.5))*step(.7,h2));
    } else {
      c=mix(c,mix(vec3(.62,.56,.48),vec3(.3,.34,.38),h3)*(.75+.4*h1),box2(h.xy,vec4(.1,0.,.9,.24)));
      c=mix(c,mix(vec3(.18,.32,.42),vec3(.78,.52,.3),h2),box2(h.xy,vec4(.32,.44,.68,.72))*step(h3,.75));
      float lamp=box2(h.xy,vec4(.9,.3,.96,.42)); c=mix(c,vec3(1.,.9,.7),lamp); em+=lamp*1.5;
    }
  } else if(tt.x<tt.y){
    c=wall*.84;
    c=mix(c,uFloorC*.7,box2(h.zy,vec4(.55,.05,.98,.62))*step(h2,.5));
  } else if(r.y<0.){
    c=uFloorC*(.82+.32*h3);
    c=mix(c,vec3(.5,.46,.42)*(.7+.6*h1),box2(h.xz,vec4(.2,.25,.8,.8))*step(.45,h2));
  } else {
    c=vec3(.88);
    float lz=fract(h.z*2.+.25);
    float pan=uKind<.5 ? box2(vec2(h.x,lz),vec4(.1,.42,.9,.58)) : step(length(vec2(h.x-.5,h.z-.45)),.08);
    em+=pan*2.2; c=mix(c,vec3(1.),pan);
  }
  float e2=min(min(h.x,1.-h.x),min(h.y,1.-h.y));
  float ao=mix(.62,1.,smoothstep(0.,.1,e2))*mix(1.,.5,h.z);
  float on=step(h1,uLit);
  vec3 L=vec3(uLevel*uDay)*(.75+.5*h3)+uWarm*(uNight*on*1.6);
  vec3 res=c*L*ao+uWarm*em*(uNight*on*1.25+uDay*uLevel*.5);
  float bl=h2<.45 ? .5+.45*h3 : 2.;
  if(o.y>bl){ float sl=.82+.18*step(.5,fract(uvm.y*14.)); res=vec3(.8,.78,.74)*sl*(uDay*uLevel*1.25+uWarm*uNight*on*1.05); }
  return res;
}`;
function glassInterior(U,o={}){
  const m=new THREE.MeshStandardMaterial({color:o.tint??0x6b7884, metalness:1, roughness:o.rough??.06, envMapIntensity:o.env??1.1});
  const LU={ uRoom:{value:new THREE.Vector3(o.rw??3.2,o.rh??3.6,o.rd??6)}, uLit:{value:o.lit??.5}, uLevel:{value:o.level??.32}, uTrans:{value:o.trans??.85},
    uWall:{value:new THREE.Color(o.wall??0xdcd8cf)}, uFloorC:{value:new THREE.Color(o.floor??0x77716a)}, uWarm:{value:new THREE.Color(o.warm??0xffd8a0)}, uSeed:{value:o.seed??1}, uKind:{value:o.kind??0} };
  m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms, LU, {uDay:U.uDay, uNight:U.uNight});
    sh.vertexShader='varying vec2 vGUv;\n'+sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvGUv=uv;');
    sh.fragmentShader=GLSL_INT+'\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
{ float NoV=clamp(dot(normal,normalize(vViewPosition)),0.,1.); float f5=1.-NoV; f5=f5*f5*f5*f5*f5; float Fr=.06+.94*f5;
  totalEmissiveRadiance+=gInterior(vGUv,-vViewPosition,normal)*(1.-Fr)*uTrans; }`); };
  m.customProgramCacheKey=()=>'gfx-glassint';
  m.userData.LU=LU; m.userData.noMerge=true; return m; }

// Đẩy va chạm cục bộ của 1 công trình (col = {boxes, circles, plats}) vào thế giới: gốc (X,Y,Z), xoay ry
// sink = { boxes:W.boxes, circles:W.circles, addPlat:W.addPlat }  (hộp xoay lẻ góc → lấy hộp bao)
export function applyCol(col,X,Y,Z,ry,sink){ if(!col) return; const c=Math.cos(ry), s=Math.sin(ry), tp=(x,z)=>[X+x*c+z*s, Z-x*s+z*c];
  for(const b of col.boxes||[]){ const P=[tp(b.x0,b.z0),tp(b.x1,b.z0),tp(b.x0,b.z1),tp(b.x1,b.z1)], xs=P.map(p=>p[0]), zs=P.map(p=>p[1]); sink.boxes && sink.boxes.push({...b, x0:Math.min(...xs), x1:Math.max(...xs), z0:Math.min(...zs), z1:Math.max(...zs)}); }
  for(const ci of col.circles||[]){ const [x,z]=tp(ci.x,ci.z); sink.circles && sink.circles.push({...ci, x, z}); }
  for(const p of col.plats||[]){ const [x,z]=tp(p.x,p.z); sink.addPlat && sink.addPlat(x,z,(p.rot||0)+ry,p.hw,p.hd,Y+p.h); } }

/* ============================== 4. BỘ ĐỒ HOẠ ============================== */
// createGFX({quality:'low'|'medium'|'high', msaa:true}) → { M, Kit, cbox…, build:{tower, cafeStreet, villa, ringHQ, canopyHall, dome, office}, setTime(day,night), update(dt) }
export function createGFX(opt={}){
  const Q=opt.quality||'low', N0=Q==='low'?256:512;
  const U={uTime:{value:0}, uDay:{value:1}, uNight:{value:0}};
  const EMIS=[], ANIM=[], cache=new Map(), memo=(key,f)=>{ if(!cache.has(key)) cache.set(key,f()); return cache.get(key); };
  const M={}, lazy=(n,f)=>Object.defineProperty(M,n,{configurable:true, enumerable:true, get(){ const v=f(); Object.defineProperty(M,n,{value:v, enumerable:true}); return v; }});
  const std=(c,r=.6,m=0,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:r, metalness:m}, o));
  const pbr=(set,o={})=>new THREE.MeshStandardMaterial(Object.assign({map:set.map, normalMap:set.normalMap, roughnessMap:set.orm, aoMap:set.orm, roughness:1, metalness:0}, o));
  const emis=(c,dayK,nightK,o={})=>{ const m=std(o.base??0xffffff, o.r??.4, 0, {emissive:c, emissiveIntensity:dayK}); m.userData.noMerge=true; m.userData.noCast=true; EMIS.push([m,dayK,nightK]); return m; };
  const LOW=Q==='low', flat=LOW?{normalMap:null}:{};   // máy yếu: mặt đất rộng bỏ normal map (bớt 1 lần đọc texture/điểm ảnh trên diện tích lớn nhất màn hình)

  /* ---- 4a. công thức texture (mét/lần lặp) ---- */
  const TZP=[[246,244,238],[96,98,101],[44,44,46],[176,98,72],[124,146,122],[206,196,174],[150,120,90]];
  const T={
    plaster:c=>genSet('pl'+c,N0,2,.0022,(u,v,o)=>{ const [r,g,b]=rgbOf(c), n=fbm(u*16,v*16,16,16,4,11), m=fbm(u*3,v*3,3,3,3,12), t=.96+.07*(m-.5)+.05*(n-.5); o[0]=r*t;o[1]=g*t;o[2]=b*t;o[3]=n;o[4]=.82+.12*(1-n);o[5]=.94+.06*n; }),
    screed:c=>genSet('sc'+c,N0,6,.002,(u,v,o)=>{ const [r,g,b]=rgbOf(c), n=fbm(u*24,v*24,24,24,4,25), m=fbm(u*4,v*4,4,4,4,26), fu=u*2%1, fv=v*2%1, jt=ss(0,.004,fu)*ss(1,.996,fu)*ss(0,.004,fv)*ss(1,.996,fv), sp=hash2(Math.floor(u*N0),Math.floor(v*N0),27);
      const t=(.94+.16*(m-.5)+.05*(n-.5)+(sp>.985?.12:0))*(.6+.4*jt); o[0]=r*t;o[1]=g*t;o[2]=b*t;o[3]=jt;o[4]=.3+.25*m;o[5]=.85+.15*jt; }),
    concrete:c=>genSet('co'+c,N0,2.4,.003,(u,v,o)=>{ const [r,g,b]=rgbOf(c), n=fbm(u*14,v*14,14,14,4,21), m=fbm(u*3,v*3,3,3,3,22), bv=v*16, bi=Math.floor(bv), bf=bv-bi, tone=(hash2(bi,0,23)-.5)*.08, jt=ss(0,.05,bf)*ss(1,.95,bf);
      const tu=u*4%1-.5, tv=v*4%1-.5, hole=Math.hypot(tu,tv)<.03?1:0, t=(.93+tone+.14*(m-.5)+.07*(n-.5))*(1-.1*(1-jt))*(1-.5*hole); o[0]=r*t;o[1]=g*t;o[2]=b*t;o[3]=Math.min(jt,1-hole)*(.8+.2*n);o[4]=.62+.25*n; }),
    wood:c=>genSet('wd'+c,N0,1.2,.0018,(u,v,o)=>{ const [r,g,b]=rgbOf(c), pu=u*8, pi=Math.floor(pu), pf=pu-pi, vo=hash2(pi,2,32), tone=(hash2(pi,1,31)-.5)*.24;
      const gn=fbm(u*64,v*3+vo*3,64,3,4,33), ring=Math.sin((gn*10+pf*3)*Math.PI)*.5+.5, ev=(v+vo)%1, gap=ss(0,.035,pf)*ss(1,.965,pf)*ss(0,.006,ev)*ss(1,.994,ev);
      const t=(.8+tone+.22*(gn-.5)+.08*ring)*(.5+.5*gap); o[0]=r*t;o[1]=g*t;o[2]=b*t;o[3]=gap*(.85+.15*gn);o[4]=.5+.3*(1-gn); }),
    tile:(c,sz,S,rough=.5,vein=0)=>genSet(`ti${c}|${sz}|${S}|${vein}|${rough}`,N0,S,.0025,(u,v,o)=>{ const [r,g,b]=rgbOf(c), n=Math.round(S/sz), tu=u*n, tv=v*n, ti=Math.floor(tu), tj=Math.floor(tv), fu=tu-ti, fv=tv-tj, gw=.022;
      const gr=ss(0,gw,fu)*ss(1,1-gw,fu)*ss(0,gw,fv)*ss(1,1-gw,fv), tone=(hash2(ti,tj,41)-.5)*.14, nz=fbm(u*24,v*24,24,24,3,42), t=.92+tone+.1*(nz-.5);
      let cr=r*t, cg=g*t, cb=b*t;
      if(vein){ const w=fbm(u*6,v*6,6,6,5,43), vv=1-Math.abs(Math.sin((u*2+v+w*3)*Math.PI*2)); let k=vv*vv; k*=k; k*=k; k*=k*vein; cr+=(225-cr)*k; cg+=(232-cg)*k; cb+=(226-cb)*k; }
      const G=[150,147,141]; o[0]=mix(G[0],cr,gr); o[1]=mix(G[1],cg,gr); o[2]=mix(G[2],cb,gr); o[3]=gr; o[4]=rough+(1-gr)*.35; }),
    terrazzo:(c,S=1.2,tsz=.4)=>genSet(`tz${c}|${S}|${tsz}`,N0,S,.0012,(u,v,o)=>{ const [r,g,b]=rgbOf(c), n=Math.round(S/tsz), fu=u*n%1, fv=v*n%1, gw=.012, gr=ss(0,gw,fu)*ss(1,1-gw,fu)*ss(0,gw,fv)*ss(1,1-gw,fv);
      const K=Math.round(S/.018), cu=u*K, cv=v*K, ci=Math.floor(cu), cj=Math.floor(cv); let cr=r,cg=g,cb=b;
      if(hash2(ci,cj,51)<.42){ const px=cu-ci-.5+(hash2(ci,cj,52)-.5)*.35, py=cv-cj-.5+(hash2(ci,cj,53)-.5)*.35, rr=.18+.17*hash2(ci,cj,54); if(px*px+py*py<rr*rr){ const P=TZP[Math.floor(hash2(ci,cj,55)*TZP.length)]; cr=P[0];cg=P[1];cb=P[2]; } }
      const nz=fbm(u*8,v*8,8,8,3,56), t=.95+.1*(nz-.5); o[0]=mix(140,cr*t,gr); o[1]=mix(137,cg*t,gr); o[2]=mix(131,cb*t,gr); o[3]=gr; o[4]=.26+.1*nz+(1-gr)*.4; }),
    brick:(c=0x9a4a32)=>genSet('br'+c,N0,1,.008,(u,v,o)=>{ const [r,g,b]=rgbOf(c), rows=13, cols=4, tv=v*rows, rj=Math.floor(tv), fv=tv-rj, tu=u*cols+(rj%2)*.5, ri=Math.floor(tu), fu=tu-ri;
      const mo=ss(0,.09,fv)*ss(1,.91,fv)*ss(0,.03,fu)*ss(1,.97,fu), tn=(hash2(md(ri,cols),rj,61)-.5)*.3, nz=fbm(u*20,v*20,20,20,3,62), t=.85+tn+.15*(nz-.5);
      o[0]=mix(186,r*t,mo); o[1]=mix(179,g*t,mo); o[2]=mix(166,b*t,mo); o[3]=mo*(.8+.2*nz); o[4]=.86+.1*nz; }),
    bark:(c=0x6b5a48)=>genSet('bk'+c,256,1,.01,(u,v,o)=>{ const [r,g,b]=rgbOf(c), w=fbm(u*6,v*2,6,2,4,71), rd=1-Math.abs(Math.sin((u*10+w*3)*Math.PI)), h=Math.sqrt(rd)*(.7+.3*fbm(u*16,v*8,16,8,3,72)), t=.55+.6*h; o[0]=r*t;o[1]=g*t;o[2]=b*t;o[3]=h;o[4]=.92; }),
    palmBark:()=>genSet('pbk',256,1,.008,(u,v,o)=>{ const w=fbm(u*6,v*3,6,3,3,74), f=(v*7+w*.35)%1, h=ss(0,.7,f), n=fbm(u*8,v*14,8,14,3,75), t=.68+.24*h+.14*(n-.5); o[0]=150*t;o[1]=132*t;o[2]=110*t;o[3]=h;o[4]=.9;o[5]=.8+.2*h; }),
    lawn:()=>genSet('lawn',N0,4,.006,(u,v,o)=>{ const n=fbm(u*5,v*5,5,5,4,81), bl=hash2(Math.floor(u*N0),Math.floor(v*N0),82), m=fbm(u*40,v*40,40,40,2,83), t=.25+n*.35+bl*.22+m*.18;
      o[0]=mix(40,108,t); o[1]=mix(74,142,t); o[2]=mix(26,54,t); o[3]=bl*.6+m*.4; o[4]=.93; o[5]=.8+.2*bl; }),
    solar:()=>genSet('solar',N0,2,.001,(u,v,o)=>{ const cu=u*12%1, cv=v*12%1, pu=u*2%1, pv=v*2%1, line=Math.min(cu,1-cu,cv,1-cv)<.035, frame=Math.min(pu,1-pu,pv,1-pv)<.012, nz=fbm(u*10,v*10,10,10,2,91);
      if(frame){ o[0]=o[1]=o[2]=178; o[3]=1; o[4]=.35; } else if(line){ o[0]=96;o[1]=106;o[2]=126;o[3]=.9;o[4]=.3; } else { o[0]=16+8*nz;o[1]=26+10*nz;o[2]=54+14*nz;o[3]=.95;o[4]=.12; } }),
    scales:()=>genSet('scale',N0,1.6,.04,(u,v,o)=>{ const rows=4, cols=2, tv=v*rows, rj=Math.floor(tv), fv=tv-rj, tu=u*cols+(rj%2)*.5, ri=Math.floor(tu), fu=tu-ri;
      const e=Math.abs(fu-.5)*2, lip=ss(.88,1,fv+.12*e*e), h=fv*(1-lip), tn=(hash2(md(ri,cols),rj,95)-.5)*.2, k=.72+.38*fv;
      o[0]=(150+40*tn)*k; o[1]=(166+40*tn)*k; o[2]=(184+30*tn)*k; o[3]=h; o[4]=.26+.12*(1-fv); }),
    moss:()=>genSet('moss',N0,1,.02,(u,v,o)=>{ const n=fbm(u*10,v*10,10,10,5,101), bl=fbm(u*40,v*40,40,40,2,102), t=n*.6+bl*.4; o[0]=mix(30,96,t); o[1]=mix(58,130,t); o[2]=mix(20,42,t); o[3]=t; o[4]=.96; }),
    fabric:c=>genSet('fb'+c,256,.4,.0008,(u,v,o)=>{ const [r,g,b]=rgbOf(c), wv=Math.sin(u*TAU*64)*Math.sin(v*TAU*64)*.5+.5, nz=fbm(u*8,v*8,8,8,3,111), t=.9+.08*wv+.06*(nz-.5); o[0]=r*t;o[1]=g*t;o[2]=b*t;o[3]=wv;o[4]=.93;o[5]=.9+.1*wv; }),
    louver:c=>genSet('lv'+c,256,.6,.006,(u,v,o)=>{ const [r,g,b]=rgbOf(c), f=v*12%1, gap=f<.1?0:1, nz=fbm(u*6,v*6,6,6,2,121), t=(.72+.38*f)*(.92+.1*nz)*(.35+.65*gap); o[0]=r*t;o[1]=g*t;o[2]=b*t;o[3]=f*gap;o[4]=.55; }),
    shutter:()=>genSet('sh',256,1,.004,(u,v,o)=>{ const s=Math.sin(v*TAU*12)*.5+.5, nz=fbm(u*4,v*4,4,4,3,131), t=.75+.25*s+.1*(nz-.5); o[0]=150*t;o[1]=155*t;o[2]=160*t;o[3]=s;o[4]=.45+.2*nz; }),
    water:()=>genSet('wa',256,2,.025,(u,v,o)=>{ o[0]=o[1]=o[2]=255; o[3]=fbm(u*4,v*4,4,4,4,141); o[4]=.05; }),
    asphalt:()=>genSet('as',N0,4,.002,(u,v,o)=>{ const n=fbm(u*12,v*12,12,12,3,151), m=fbm(u*2,v*2,2,2,3,153), sp=hash2(Math.floor(u*N0),Math.floor(v*N0),152), t=64+16*n+14*(m-.5)+(sp>.92?34:0)-(sp<.05?12:0); o[0]=t;o[1]=t;o[2]=t+2;o[3]=sp*.4+n*.6;o[4]=.86;o[5]=.88+.12*n; }),
    rattan:(c=0xb48a5a)=>genSet('rt'+c,256,.3,.002,(u,v,o)=>{ const [r,g,b]=rgbOf(c), wv=Math.max(Math.sin((u+v)*TAU*20),Math.sin((u-v)*TAU*20))*.5+.5, t=.72+.36*wv; o[0]=r*t;o[1]=g*t;o[2]=b*t;o[3]=wv;o[4]=.7;o[5]=.75+.25*wv; }),
  };

  /* ---- 4b. texture vẽ canvas có kênh trong suốt ---- */
  const leafTex=kind=>memo('leaf'+kind,()=>canvasTex(256,256,g=>{ const R=rng(kind.length*97+7), cnt=kind==='big'?46:kind==='tier'?230:130;
    for(let i=0;i<cnt;i++){ const a=R()*TAU, rr=Math.pow(R(),.62)*112, x=128+Math.cos(a)*rr, y=128+Math.sin(a)*rr, sc=(kind==='big'?2.3:kind==='tier'?.7:1)*(.7+.6*R());
      const fl=kind==='flower' && R()<.55, hue=fl?316+R()*20:82+R()*36, sat=fl?68+R()*20:30+R()*26, lit=fl?50+R()*14:19+R()*24;
      g.save(); g.translate(x,y); g.rotate(R()*TAU); g.fillStyle=`hsl(${hue},${sat}%,${lit}%)`; g.beginPath(); g.ellipse(0,0,(fl?6.5:4.2)*sc,(fl?6:10)*sc,0,0,TAU); g.fill();
      if(!fl){ g.strokeStyle=`hsla(${hue},${sat}%,${lit+14}%,.55)`; g.lineWidth=.8; g.beginPath(); g.moveTo(0,-9*sc); g.lineTo(0,9*sc); g.stroke(); } g.restore(); } }));
  const frondTex=()=>memo('frond',()=>canvasTex(512,128,(g,w,h)=>{ const R=rng(5); g.strokeStyle='#5d6b2e'; g.lineWidth=5; g.beginPath(); g.moveTo(0,h/2); g.lineTo(w,h/2); g.stroke();
    for(let i=0;i<72;i++){ const t=i/72, x=t*w, L=(Math.sin(Math.PI*Math.min(1,t*1.1))*.9+.1)*h*.48; for(const s of [-1,1]){ g.strokeStyle=`hsl(${78+R()*22},${38+R()*16}%,${21+R()*16}%)`; g.lineWidth=3+R()*2; g.beginPath(); g.moveTo(x,h/2); g.quadraticCurveTo(x+L*.3,h/2+s*L*.5,x+L*.55,h/2+s*L); g.stroke(); } } }));
  const railTex=()=>memo('rail',()=>canvasTex(256,128,(g,w,h)=>{ g.strokeStyle='#17181a'; g.lineWidth=7; g.beginPath(); g.moveTo(0,4); g.lineTo(w,4); g.moveTo(0,h-4); g.lineTo(w,h-4); g.stroke(); g.lineWidth=3.5;
    for(let x=8;x<w;x+=16){ g.beginPath(); g.moveTo(x,6); g.lineTo(x,h-6); g.stroke(); } g.lineWidth=3; for(let x=0;x<w;x+=32){ g.beginPath(); g.arc(x+16,h*.3,8,0,TAU); g.stroke(); g.beginPath(); g.arc(x+16,h*.72,6,Math.PI,TAU); g.stroke(); } }));
  const aoTex=()=>memo('ao',()=>canvasTex(128,128,(g,w,h)=>{ const id=g.createImageData(w,h); for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const dx=Math.max(0,(Math.abs(x-63.5)/63.5-.5)/.5), dy=Math.max(0,(Math.abs(y-63.5)/63.5-.5)/.5), d=Math.min(1,Math.hypot(dx,dy)), a=(1-d)*(1-d), i=(y*w+x)*4; id.data[i+3]=a*255; } g.putImageData(id,0,0); },false));
  function signMat(text,o={}){ return memo('sign|'+text+'|'+(o.key||''),()=>{ const W=o.w||1024, H=o.h||160, font=o.font||'"Segoe UI",sans-serif';
    const t=canvasTex(W,H,g=>{ if(o.bg){ g.fillStyle=o.bg; g.fillRect(0,0,W,H); } if(o.border){ g.strokeStyle=o.border; g.lineWidth=8; g.strokeRect(10,10,W-20,H-20); }
      g.fillStyle=o.fg||'#fff'; g.textAlign='center'; g.textBaseline='middle'; let fs=o.fs||Math.floor(H*.56); g.font=`${o.weight||800} ${fs}px ${font}`;
      if(o.vertical){ const ch=[...text], step=H/(ch.length+.4); g.font=`${o.weight||800} ${Math.min(W*.78,step*.82)|0}px ${font}`; ch.forEach((c,i)=>g.fillText(c,W/2,step*(i+.7))); }
      else { while(g.measureText(text).width>W*.9 && fs>12){ fs-=4; g.font=`${o.weight||800} ${fs}px ${font}`; } g.fillText(text,W/2,H/2+2); } });
    const m=new THREE.MeshStandardMaterial({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:o.day??.22, roughness:.45, transparent:!o.bg, alphaTest:o.bg?0:.3, side:o.double?THREE.DoubleSide:THREE.FrontSide});
    m.userData.noMerge=true; m.userData.noCast=true; EMIS.push([m,o.day??.22,o.night??1.4]); return m; }); }
  function canvasMat(key,w,h,draw,o={}){ return memo(key,()=>{ const t=canvasTex(w,h,draw); const m=new THREE.MeshStandardMaterial({map:t, roughness:o.r??.85});
    if(o.emis){ m.emissive=new THREE.Color(0xffffff); m.emissiveMap=t; m.emissiveIntensity=o.emis[0]; EMIS.push([m,o.emis[0],o.emis[1]]); } m.userData.noMerge=true; m.userData.noCast=true; return m; }); }
  const menuMat=()=>canvasMat('menu',512,360,(g,w,h)=>{ const R=rng(9); g.fillStyle='#1f2622'; g.fillRect(0,0,w,h); for(let i=0;i<2500;i++){ g.fillStyle=`rgba(255,255,255,${R()*.035})`; g.fillRect(R()*w,R()*h,2,2); }
    g.strokeStyle='#8a6a48'; g.lineWidth=18; g.strokeRect(9,9,w-18,h-18); g.fillStyle='#f4efe2'; g.font='700 44px "Segoe Print","Segoe UI",cursive'; g.textAlign='center'; g.fillText('THỰC ĐƠN',w/2,70);
    g.font='400 28px "Segoe Print","Segoe UI",cursive'; [['Cà phê sữa đá','25k'],['Bạc xỉu','28k'],['Cà phê muối','32k'],['Trà đào cam sả','35k'],['Sinh tố bơ','40k']].forEach((l,i)=>{ g.textAlign='left'; g.fillText(l[0],42,125+i*44); g.textAlign='right'; g.fillText(l[1],w-42,125+i*44); }); });
  function awnMat(c1,c2){ return memo(`awn|${c1}|${c2}`,()=>{ const draw=(g,w,h,scal)=>{ for(let i=0;i<8;i++){ g.fillStyle=i%2?c2:c1; g.fillRect(i*w/8,0,w/8+1,h); }
        const id=g.getImageData(0,0,w,h), d=id.data, R=rng(3); for(let i=0;i<d.length;i+=4){ const n=(R()-.5)*14; d[i]+=n; d[i+1]+=n; d[i+2]+=n; } g.putImageData(id,0,0);
        if(scal){ g.globalCompositeOperation='destination-out'; const n=16; for(let i=0;i<n;i++){ g.beginPath(); g.arc((i+.5)*w/n, h+w/n*.18, w/n*.5, 0, TAU); g.fill(); } g.globalCompositeOperation='source-over'; } };
      const top=canvasTex(256,256,(g,w,h)=>{ draw(g,w,h,false); const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'rgba(0,0,0,.2)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
      const val=canvasTex(256,64,(g,w,h)=>draw(g,w,h,true)); top.repeat.set(.5,.42); val.repeat.set(.5,3.33);
      return {top:new THREE.MeshStandardMaterial({map:top, side:THREE.DoubleSide, roughness:.85}), val:new THREE.MeshStandardMaterial({map:val, side:THREE.DoubleSide, roughness:.85, alphaTest:.5})}; }); }

  /* ---- 4c. vật liệu (tạo khi dùng lần đầu) ---- */
  function leafMat(kind){ const m=new THREE.MeshStandardMaterial({map:kind==='frond'?frondTex():leafTex(kind), alphaTest:.45, side:THREE.DoubleSide, vertexColors:kind!=='frond', roughness:.78, metalness:0});
    if(opt.msaa && Q!=='low') m.alphaToCoverage=true;
    m.onBeforeCompile=sh=>{ sh.uniforms.uTime=U.uTime;
      sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  vec3 gwp=(modelMatrix*vec4(position,1.)).xyz;
#ifdef USE_INSTANCING
  gwp=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;
#endif
  float gk=smoothstep(.6,5.,position.y);
  transformed.x+=sin(uTime*1.7+gwp.x*.35+gwp.z*.27)*.045*gk; transformed.z+=cos(uTime*1.3+gwp.x*.21-gwp.z*.33)*.035*gk;`);
      sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n  normal=normalize(vNormal);'); };
    m.customProgramCacheKey=()=>'gfx-leaf'+(m.vertexColors?1:0); return m; }
  lazy('glassOffice',()=>glassInterior(U,{rw:3.2,rh:3.6,rd:6,tint:0x8aa2b6,wall:0xdedbd4,floor:0x7a7672,lit:.55,level:.8,kind:0,seed:1}));
  lazy('glassHome',()=>glassInterior(U,{rw:4.6,rh:3.7,rd:6.5,tint:0x75848e,wall:0xe6dccb,floor:0x8a6446,warm:0xffcf90,lit:.8,level:.5,kind:1,seed:2}));
  lazy('glassDark',()=>std(0x4a5560,.05,1,{envMapIntensity:1.2}));
  lazy('glassClear',()=>{ const m=std(0xdfeef0,.04,.6,{transparent:true, opacity:.2, depthWrite:false, side:THREE.DoubleSide, envMapIntensity:1.6}); m.userData.noCast=true; return m; });
  lazy('frosted',()=>{ const m=std(0xf4f6f6,.4,0,{transparent:true, opacity:.6, depthWrite:false, side:THREE.DoubleSide}); m.userData.noCast=true; return m; });
  lazy('mullion',()=>std(0x7d8792,.34,.8)); lazy('spandrel',()=>std(0x3a4653,.26,.75)); lazy('mullionDark',()=>std(0x2a3036,.38,.75)); lazy('whiteAlu',()=>std(0xe9e9e4,.32,.15)); lazy('poleGray',()=>std(0x5f6468,.42,.7));
  lazy('blackMetal',()=>std(0x1b1c1f,.45,.6)); lazy('chrome',()=>std(0xd5d9dc,.12,1));
  lazy('white',()=>pbr(T.plaster(0xf0eee8))); lazy('stoneLight',()=>pbr(T.tile(0xd8d3c8,.6,2.4,.45))); lazy('stoneDark',()=>pbr(T.tile(0x4d5054,.6,2.4,.5,.3)));
  lazy('granite',()=>pbr(T.tile(0x9a968f,.6,2.4,.55))); lazy('conc',()=>pbr(T.concrete(0xb8b4ac))); lazy('concPol',()=>pbr(T.screed(0xb3afa8),flat));
  lazy('wood',()=>pbr(T.wood(0x9a6a42))); lazy('woodLight',()=>pbr(T.wood(0xc9a275))); lazy('woodDark',()=>pbr(T.wood(0x5b3a24))); lazy('deck',()=>pbr(T.wood(0x8e6446)));
  lazy('terrazzo',()=>pbr(T.terrazzo(0xe8e2d6))); lazy('terrazzoDark',()=>pbr(T.terrazzo(0x5e625f))); lazy('pave',()=>pbr(T.terrazzo(0xb3aca2,1.2,.4),flat));
  lazy('brick',()=>pbr(T.brick())); lazy('asphalt',()=>pbr(T.asphalt(),flat)); lazy('lawn',()=>pbr(T.lawn(),flat));
  lazy('poolTile',()=>pbr(T.tile(0x1f4b4c,.3,1.2,.25,.55))); lazy('solar',()=>pbr(T.solar(),{metalness:.4})); lazy('scales',()=>pbr(T.scales(),{metalness:.65}));
  lazy('moss',()=>pbr(T.moss())); lazy('shutter',()=>pbr(T.shutter(),{metalness:.5})); lazy('bark',()=>pbr(T.bark())); lazy('palmBark',()=>pbr(T.palmBark())); lazy('rattan',()=>pbr(T.rattan()));
  lazy('terracotta',()=>pbr(T.plaster(0xb5653f))); lazy('felt',()=>pbr(T.fabric(0x5e7d6a)));
  lazy('water',()=>{ const s=T.water(), n=s.normalMap.clone(); n.needsUpdate=true; n.repeat.set(.5,.5); const m=new THREE.MeshStandardMaterial({color:0x0f8c9e, roughness:.05, metalness:0, normalMap:n, normalScale:new THREE.Vector2(.3,.3), transparent:true, opacity:.72, envMapIntensity:.55, depthWrite:false});
    m.userData.noCast=true; ANIM.push(dt=>{ n.offset.x+=dt*.02; n.offset.y+=dt*.013; }); return m; });
  lazy('rail',()=>new THREE.MeshStandardMaterial({map:railTex(), alphaTest:.5, side:THREE.DoubleSide, roughness:.5, metalness:.4}));
  lazy('aoDecal',()=>{ const m=new THREE.MeshBasicMaterial({map:aoTex(), color:0x000000, transparent:true, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, opacity:.5}); m.userData.noCast=true; return m; });
  lazy('leaf',()=>leafMat('leaf')); lazy('leafBig',()=>leafMat('big')); lazy('leafTier',()=>leafMat('tier')); lazy('flower',()=>leafMat('flower')); lazy('frond',()=>leafMat('frond'));
  lazy('lampWarm',()=>emis(0xffd9a0,.5,4)); lazy('lampCool',()=>emis(0xf2f6ff,.9,3.2)); lazy('bulb',()=>emis(0xffbf6a,.45,6));
  lazy('poolLight',()=>emis(0x6fe6ff,0,5)); lazy('screen',()=>emis(0x29486a,.45,.7,{base:0x0b0e12, r:.25})); lazy('accent',()=>emis(0x9fe8ff,.25,3.2,{base:0xdff6ff}));
  lazy('bottleA',()=>std(0x7a4a12,.15,.1)); lazy('bottleB',()=>std(0x2f5a2c,.15,.1));
  const paint=(c,r=.55,m=0)=>memo(`paint|${c}|${r}|${m}`,()=>std(c,r,m));
  // vật liệu tô màu: 1 vật liệu gốc (texture trắng/xám + màu theo đỉnh) cho mọi màu → tường 10 màu vẫn chỉ 1 lượt vẽ (Kit tự dồn)
  const tinted=(kind,setFn,c)=>memo(kind+'|'+c,()=>{ const base=memo('tintBase|'+kind,()=>pbr(setFn(0xffffff),{vertexColors:true})); const p=new THREE.MeshStandardMaterial({color:c}); p.userData.tintOf=base; return p; });
  const plasterC=c=>tinted('pl',T.plaster,c), fabricC=c=>tinted('fb',T.fabric,c), louverC=c=>tinted('lv',T.louver,c);
  Object.assign(M,{paint, plasterC, fabricC, louverC, signMat, awnMat});

  /* ---- 4d. thực vật: cây bông xốp (thẻ lá, pháp tuyến cầu) + cau/cọ ---- */
  const TREES={
    shade:{trunkH:3.0, r0:.22, clusters:[[0,6.2,0,2.6,1.7,2.6],[1.9,5.4,.6,1.9,1.4,1.9],[-1.8,5.6,-.5,2,1.4,2],[.4,5.3,-1.9,1.8,1.3,1.8],[-.5,5.2,1.9,1.8,1.3,1.8],[0,7.4,0,1.7,1.2,1.7]], cards:150, size:1.5, leaf:'leaf'},
    round:{trunkH:1.7, r0:.13, clusters:[[0,3.2,0,1.5,1.1,1.5],[.9,2.8,.3,1,.8,1],[-.8,2.9,-.4,1,.8,1]], cards:72, size:1.1, leaf:'leaf'},
    tier:{trunkH:5.8, r0:.12, flat:true, clusters:[[0,2.6,0,2.4,.32,2.4],[0,3.7,0,1.9,.3,1.9],[0,4.7,0,1.4,.28,1.4],[0,5.6,0,.8,.25,.8]], cards:120, size:.95, leaf:'leafTier'},
    bush:{trunkH:0, clusters:[[0,.55,0,.75,.55,.75],[.45,.45,.2,.5,.4,.5],[-.4,.45,-.25,.5,.4,.5]], cards:30, size:.75, leaf:'leaf'},
    flower:{trunkH:0, clusters:[[0,.7,0,.9,.7,.9],[.6,.5,.3,.6,.5,.6]], cards:34, size:.8, leaf:'flower'},
    fig:{trunkH:1.0, r0:.05, clusters:[[0,1.8,0,.6,.7,.6],[.2,1.3,.1,.45,.4,.45]], cards:28, size:.6, leaf:'leafBig'},
  };
  function treeGeo(kind,seed=1){ return memo(`tree|${kind}|${seed}`,()=>{ const D=TREES[kind], R=rng(seed*7919+kind.length*13), parts=[], sc=.88+.24*R(), V=THREE.Vector3;
    if(D.trunkH>0){ const top=new V((R()-.5)*.4, D.trunkH*sc, (R()-.5)*.4); parts.push(limb(new V(0,-.1,0), top, D.r0*sc, D.r0*.62*sc));
      for(const c of D.clusters){ if(D.flat){ for(let i=0;i<4;i++){ const a=R()*TAU, y=c[1]*sc-.12; parts.push(limb(new V(0,y,0), new V(Math.cos(a)*c[3]*.7*sc, y+.22, Math.sin(a)*c[5]*.7*sc), .05*sc, .015*sc, 5)); } }
        else if(Math.hypot(c[0],c[2])>.3) parts.push(limb(top, new V(c[0]*.75*sc, c[1]*sc-c[4]*.35*sc, c[2]*.75*sc), D.r0*.55*sc, D.r0*.22*sc, 6)); } }
    const pos=[],nor=[],uv=[],col=[],idx=[]; let vi=0; const cen=new V(); for(const c of D.clusters) cen.add(new V(c[0],c[1],c[2])); cen.multiplyScalar(sc/D.clusters.length);
    let y0=1e9,y1=-1e9; for(const c of D.clusters){ y0=Math.min(y0,(c[1]-c[4])*sc); y1=Math.max(y1,(c[1]+c[4])*sc); }
    const q=new THREE.Quaternion(), e=new THREE.Euler(), v=new V(), p=new V(), cc=new V(), n=new V(), ng=new V();
    for(let i=0;i<D.cards;i++){ const c=D.clusters[i%D.clusters.length], th=R()*TAU, u=2*R()-1, s=Math.sqrt(1-u*u), rr=.45+.55*Math.sqrt(R());
      cc.set(c[0],c[1],c[2]).multiplyScalar(sc); p.set(s*Math.cos(th)*rr*c[3], u*rr*c[4], s*Math.sin(th)*rr*c[5]).multiplyScalar(sc).add(cc);
      if(D.flat) e.set(-Math.PI/2+(R()-.5)*.5, R()*TAU, 0, 'YXZ'); else e.set(R()*TAU, R()*TAU, R()*TAU); q.setFromEuler(e);
      const S=D.size*sc*(.7+.6*R()); n.subVectors(p,cc).normalize(); ng.subVectors(p,cen).normalize(); n.multiplyScalar(.55).add(ng.multiplyScalar(.45)); n.y+=.3; n.normalize();
      const yk=(p.y-y0)/Math.max(.01,y1-y0), sh=Math.min(1,.36+.42*rr+.3*yk), hue=.92+.16*R();
      for(const [a,b] of [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]){ v.set(a*S,b*S,0).applyQuaternion(q).add(p); pos.push(v.x,v.y,v.z); nor.push(n.x,n.y,n.z); uv.push(a+.5,b+.5); col.push(sh*hue,sh,sh*(2-hue)); }
      idx.push(vi,vi+1,vi+2, vi,vi+2,vi+3); vi+=4; }
    const crown=new THREE.BufferGeometry(); crown.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); crown.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
    crown.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); crown.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); crown.setIndex(idx);
    return {trunk:parts.length?mergeGeometries(parts):null, crown, leaf:D.leaf, h:y1}; }); }
  function frondGeo(L,W,droop){ const N=12,pos=[],uv=[],idx=[]; for(let i=0;i<=N;i++){ const t=i/N, z=L*t, y=L*(.3*t-droop*t*t), w=W/2*(.3+.7*Math.sin(Math.PI*Math.min(t*1.08,1))), f=w*.35; pos.push(-w,y-f,z, 0,y,z, w,y-f,z); uv.push(t,0, t,.5, t,1); }
    for(let i=0;i<N;i++){ const a=i*3,b=a+3; idx.push(a,b,a+1, a+1,b,b+1, a+1,b+1,a+2, a+2,b+1,b+2); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g; }
  function palmGeo(seed){ return memo('palm'+seed,()=>{ const R=rng(seed*31+7), H=6.5+R()*3, lean=.6+R()*1.6, dir=R()*TAU, pts=[]; for(let i=0;i<=6;i++){ const t=i/6; pts.push(new THREE.Vector3(Math.cos(dir)*lean*t*t, H*t, Math.sin(dir)*lean*t*t)); }
    const curve=new THREE.CatmullRomCurve3(pts), S=20, RS=8, fr=curve.computeFrenetFrames(S,false), pos=[],nor=[],uv=[],idx=[];
    for(let i=0;i<=S;i++){ const t=i/S, P=curve.getPointAt(t), N=fr.normals[i], B=fr.binormals[i], rad=(.26-.1*t)+.14*Math.max(0,1-t*8);
      for(let j=0;j<=RS;j++){ const a=j/RS*TAU, vx=N.x*Math.cos(a)+B.x*Math.sin(a), vy=N.y*Math.cos(a)+B.y*Math.sin(a), vz=N.z*Math.cos(a)+B.z*Math.sin(a); pos.push(P.x+vx*rad,P.y+vy*rad,P.z+vz*rad); nor.push(vx,vy,vz); uv.push(j/RS*1.2, t*H); } }
    for(let i=0;i<S;i++) for(let j=0;j<RS;j++){ const a=i*(RS+1)+j, b=a+RS+1; idx.push(a,b,a+1, a+1,b,b+1); }
    const trunk=new THREE.BufferGeometry(); trunk.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); trunk.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); trunk.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); trunk.setIndex(idx);
    const top=curve.getPointAt(1), fr2=[], m=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(0,0,0,'YXZ'), one=new THREE.Vector3(1,1,1);
    for(let k=0;k<14;k++){ const g=frondGeo(3.4+R()*1.2, 1.7+R()*.4, .45+R()*.5); e.set(-.5+(k%3)*.36+R()*.2, k/14*TAU+R()*.3, (R()-.5)*.3); q.setFromEuler(e); m.compose(top,q,one); g.applyMatrix4(m); fr2.push(g); }
    return {trunk, crown:mergeGeometries(fr2), h:H}; }); }
  function addTree(k,kind,x,y,z,s=1,ry=0,seed=1){ if(kind==='palm'){ const p=palmGeo(seed); k.add(p.trunk,M.palmBark,x,y,z,ry,0,0,s,s,s); k.add(p.crown,M.frond,x,y,z,ry,0,0,s,s,s); return p.h*s; }
    const t=treeGeo(kind,seed); if(t.trunk) k.add(t.trunk,M.bark,x,y,z,ry,0,0,s,s,s); k.add(t.crown,M[t.leaf],x,y,z,ry,0,0,s,s,s); return t.h*s; }
  // rừng cây số lượng lớn: 2 InstancedMesh / loài (thân + tán), màu lá đổi nhẹ theo cây
  function forest(kind,list,seed=1){ const g=new THREE.Group(), t=kind==='palm'?palmGeo(seed):treeGeo(kind,seed), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(), p=new THREE.Vector3(), up=new THREE.Vector3(0,1,0), col=new THREE.Color();
    const mk=(geo,mat)=>{ const im=new THREE.InstancedMesh(geo,mat,list.length); list.forEach((o,i)=>{ q.setFromAxisAngle(up,o.r||0); s.setScalar(o.s||1); m4.compose(p.set(o.x,o.y||0,o.z),q,s); im.setMatrixAt(i,m4); im.setColorAt(i,col.setHSL(.27+((i*37)%10)/120,.25,.45+((i*13)%7)/40).multiplyScalar(2.1)); });
      im.castShadow=im.receiveShadow=true; im.computeBoundingSphere(); g.add(im); return im; };
    if(t.trunk) mk(t.trunk, kind==='palm'?M.palmBark:M.bark); mk(t.crown, kind==='palm'?M.frond:M[t.leaf]); return g; }

  /* ---- 4e. đồ phố ---- */
  function streetLight(k,x,z,ry=0,kind='road',glow){ const P=local(k,x,0,z,ry);
    if(kind==='road'){ P(cbox(.42,.5,.42,.04),M.conc,0,.25,0); P(cylM(.075,.12,8,8),M.poleGray,0,4.5,0); P(cylM(.15,.15,.12,8),M.poleGray,0,.56,0);
      P(cylM(.035,.035,1.9,6),M.poleGray,.92,8.42,0,0,-Math.PI/2+.1); P(cbox(.82,.11,.32,.03),M.poleGray,1.9,8.55,0,0,.1); P(cbox(.62,.02,.22,.005),M.lampCool,1.9,8.49,0,0,.1);
      if(glow){ const [gx,gz]=P.at(1.9,0); glow(gx,8.3,gz,3.2,0xf4f6ff,.9); } }
    else if(kind==='garden'){ P(cylM(.045,.06,3.2,8),M.blackMetal,0,1.6,0); P(cylM(.2,.16,.34,12),M.blackMetal,0,3.36,0); P(cylM(.17,.17,.1,12),M.lampWarm,0,3.15,0); if(glow) glow(x,3.15,z,2.2,0xffc98a,.9); }
    else { P(cylM(.075,.085,.8,10),M.blackMetal,0,.4,0); P(cylM(.078,.078,.1,10),M.lampWarm,0,.72,0); if(glow) glow(x,.72,z,1.0,0xffc98a,.8); } }
  function aoDecal(k,x,y,z,w,d,ry=0,pad=1.4){ k.add(planeM(w+2*pad,d+2*pad).scale(1,1,1), M.aoDecal, x,y+.02,z, ry,-Math.PI/2); }
  const vec=(a,b,c)=>new THREE.Vector3(a,b,c);
  function stringLights(k,a,b,n,sag,glow){ let prev=null; for(let i=0;i<=n;i++){ const t=i/n, p=new THREE.Vector3().lerpVectors(a,b,t); p.y-=Math.sin(Math.PI*t)*sag; if(prev) k.add(limb(prev,p,.006,.006,3),M.blackMetal); prev=p;
      if(i>0 && i<n){ k.add(new THREE.SphereGeometry(.045,8,6),M.bulb,p.x,p.y-.06,p.z); if(glow && i%2===0) glow(p.x,p.y-.06,p.z,.9,0xffb860,.8); } } }

  /* ---- 4f. mặt dựng: kính + đố đứng (+ lam) + băng spandrel mỗi sàn ---- */
  function facade(k,L,ya,yb,cx,cz,ry,o){ const H=yb-ya, P=local(k,cx,ya,cz,ry), F=o.F||3.6;
    const gp=planeM(L,H), uv=gp.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,(o.ou||0)+uv.getX(i)*(o.us||1), uv.getY(i)*(o.vs??3.6/F)); P(gp,o.glass,0,H/2,0);
    if(o.mul){ const n=Math.max(1,Math.round(L/(o.spacing||1.6))), sp=L/n, mdp=o.md??.16, mw=o.mw??.07, mg=cbox(mw,H,mdp,.012), fg=o.fin?cbox(o.finW||.1,H,o.finD||.7,.02):null;
      for(let i=0;i<=n;i++){ const deep=fg && i%o.fin===0; P(deep?fg:mg, deep?(o.finMat||o.mul):o.mul, -L/2+i*sp, H/2, (deep?(o.finD||.7):mdp)/2); } }
    if(o.spd){ const sg=cbox(L+.04,.95,.07,.01); for(let y=F;y<H-.4;y+=F) P(sg,o.spd,0,y-.38,.035); }
    if(o.hband){ const hb=cbox(L+.04,.06,o.hband,.01); for(let y=F;y<H-.4;y+=F) P(hb,o.mul,0,y,o.hband/2); } }
  function ring4(k,W,D,ya,yb,o){ faces4(W,D).forEach(([cx,cz,L,ry],i)=>facade(k,L,ya,yb,cx,cz,ry,{...o, ou:(o.ou||0)+i*37.7})); }

  /* ============================== 5. CÔNG TRÌNH MẪU ============================== */
  // 5.1 TOÀ VĂN PHÒNG – đế 2 tầng (sảnh kính lùi, hàng cột đá, mái đón), thân kính có phòng + đố + spandrel, đỉnh có lam che kỹ thuật + viền LED
  //     style: 'curtain' (kính + đố tối) · 'fins' (lam đứng trắng) · 'timber' (khung gỗ, kiểu campus gỗ thấp tầng) · 'setback' (giật cấp + vườn trên cao)
  function tower(o){ const g=new THREE.Group(), k=Kit(), R=rng(o.seed||7), st=o.style||'curtain', {w,d}=o, H=o.h, F=o.floor||3.6, PH=o.podium??7.6, glow=o.glow;
    const wood=st==='timber', fins=st==='fins', gl=M.glassOffice;
    const FO={glass:gl, F, mul:wood?M.woodLight:fins?M.whiteAlu:M.mullion, spd:wood?M.woodLight:fins?M.whiteAlu:M.spandrel, spacing:wood?1.5:1.6, md:wood?.42:.16, mw:wood?.14:.07, fin:fins?2:0, finD:.75, finW:.1, finMat:M.whiteAlu};
    k.add(cbox(w+3,.35,d+3,.05),M.granite,0,.175,0); let y0=.35;
    if(PH>0){ const li=1.5; ring4(k,w-2*li,d-2*li,.35,PH,{glass:gl, mul:M.mullion, spacing:3, md:.14, mw:.1, F, us:3.2/6, vs:3.6/(PH-.35), ou:R()*80});
      k.add(planeM(w-2*li,d-2*li),M.paint(0xe9e6e0,.8),0,PH-.01,0,0,Math.PI/2);
      for(const sx of [-1,1]) for(const sz of [-1,1]) k.add(cbox(1.3,PH-.35,1.3,.04),M.stoneLight,sx*(w/2-.65),(PH+.35)/2,sz*(d/2-.65));
      for(const [cx,cz,L,ry] of faces4(w,d)){ const P=local(k,cx,0,cz,ry), n=Math.max(2,Math.round(L/6)); for(let i=1;i<n;i++) P(cbox(.7,PH-.35,.7,.04),M.stoneLight,-L/2+i*L/n,(PH+.35)/2,-.35); }
      k.add(cbox(w+.9,.9,d+.9,.06),wood?M.woodLight:M.whiteAlu,0,PH+.45,0); y0=PH+.9;
      // mái đón + cửa xoay + bảng tên
      k.add(cbox(10,.32,4.6,.05),M.whiteAlu,0,4.6,d/2+2.1); for(let i=0;i<6;i++) k.add(cylM(.09,.09,.02,10),M.lampWarm,-3.75+i*1.5,4.43,d/2+2.6);
      for(const s of [-1,1]) k.add(limb(vec(s*4.2,6.6,d/2), vec(s*4.2,4.75,d/2+4.1), .025,.025,5),M.chrome);
      k.add(cylM(1.3,1.3,2.7,24,true),M.glassClear,0,1.7,d/2-1.5); k.add(cylM(1.36,1.36,.25,24),M.mullion,0,3.12,d/2-1.5);
      if(o.name) k.add(planeU(8.6,.42),signMat(o.name,{fg:'#ffffff', key:'tw', w:1024, h:64, night:1.6}),0,4.6,d/2+4.42);
      if(glow) for(let i=0;i<6;i++) glow(-3.75+i*1.5,4.3,d/2+2.6,1.4,0xffd9a0,.7); }
    const body=(W,D,ya,yb)=>{ ring4(k,W,D,ya,yb,{...FO, ou:R()*100}); for(const sx of [-1,1]) for(const sz of [-1,1]) k.add(cbox(.55,yb-ya,.55,.03),wood?M.woodLight:fins?M.whiteAlu:M.mullion,sx*W/2,(ya+yb)/2,sz*D/2); };
    const crown=(W,D,top)=>{ for(const [cx,cz,L,ry] of faces4(W,D)){ const P=local(k,cx,top,cz,ry); P(cbox(L+.55,1.3,.3,.03),wood?M.woodLight:M.spandrel,0,.65,0); P(cbox(L+.57,.06,.06,.01),M.accent,0,1.3,.13); }
      k.add(cbox(W,.3,D,.02),M.conc,0,top+.15,0);
      const sw=W*.5, sd=D*.5; k.add(cbox(sw-.4,3.8,sd-.4,.04),M.conc,0,top+2.2,0);
      for(const [cx,cz,L,ry] of faces4(sw,sd)){ const P=local(k,cx,top+.3,cz,ry), n=Math.round(L/.45); for(let i=0;i<=n;i++) P(cbox(.05,4.2,.38,.01),fins?M.whiteAlu:M.mullion,-L/2+i*L/n,2.1,0); }
      for(let i=0;i<2;i++) k.add(cbox(2.2,1.5,1.6,.05),M.whiteAlu,(i?1:-1)*W*.34,top+1.05,D*.3);
      if(o.mast){ k.add(cylM(.12,.32,14,8),M.chrome,0,top+11,0); k.add(new THREE.SphereGeometry(.35,10,8),M.bulb,0,top+18.2,0); if(glow) glow(0,top+18.2,0,2.4,0xff4433,1); }
      if(wood){ k.add(planeM(W-1,D-1),M.lawn,0,top+.31,0,0,-Math.PI/2); for(let i=0;i<5;i++) addTree(k,'bush',-W/2+2+i*(W-4)/4,top+.3,D/2-1.6,1,i,i+3); } };
    if(st==='setback'){ const h1=y0+Math.round((H-y0)*.6/F)*F, w2=w*.74, d2=d*.74; body(w,d,y0,h1); k.add(cbox(w+.3,.5,d+.3,.04),M.stoneLight,0,h1+.25,0);
      for(const [cx,cz,L,ry] of faces4(w,d)){ const P=local(k,cx,h1+.5,cz,ry); P(planeM(L-.3,1.1),M.glassClear,0,.55,-.12); P(cbox(L-.3,.05,.06,.01),M.chrome,0,1.12,-.12); }
      for(const [cx,cz,L,ry] of faces4((w+w2)/2,(d+d2)/2)){ const P=local(k,cx,h1+.5,cz,ry), n=Math.max(1,Math.floor(L/5)); for(let i=0;i<n;i++){ const lx=-L/2+(i+.5)*L/n, [tx,tz]=P.at(lx,0); P(cbox(2.6,.55,.9,.04),M.woodDark,lx,.28,0); addTree(k,i%2?'bush':'round',tx,h1+.8,tz,i%2?1:.55,R()*6,i+1); } }
      body(w2,d2,h1+.5,H); crown(w2,d2,H); }
    else { body(w,d,y0,H); crown(w,d,H); }
    // sân: lát đá, cây, đèn, bóng AO dưới chân toà (o.site=0 → không dựng sân, dùng khi đặt vào phố có sẵn)
    const col={boxes:[{x0:-w/2-.8, x1:w/2+.8, z0:-d/2-.8, z1:d/2+.8}], circles:[], plats:[]};
    if(o.site!==0){ const sp=o.site||11; k.add(planeM(w+2*sp,d+2*sp),M.pave,0,.012,0,0,-Math.PI/2);
      for(const sx of [-1,1]){ addTree(k,'shade',sx*(w/2+5),0,d/2+6,1,R()*6,3+sx); streetLight(k,sx*(w/2+8.5),d/2+8.5,sx>0?0:Math.PI,'road',glow);
        k.add(cbox(1.8,.45,.5,.04),M.woodLight,sx*(w/2+5),.4,d/2+3.6); k.add(cbox(1.6,.4,.4,.04),M.conc,sx*(w/2+5),.2,d/2+3.6);
        col.circles.push({x:sx*(w/2+5),z:d/2+6,r:.35},{x:sx*(w/2+8.5),z:d/2+8.5,r:.15}); col.boxes.push({x0:sx*(w/2+5)-.9,x1:sx*(w/2+5)+.9,z0:d/2+3.35,z1:d/2+3.85}); } }
    aoDecal(k,0,.0,0,w+2.4,d+2.4,0,2.2);
    k.build(g); return {group:g, col}; }

  // 5.2 PHỐ NHÀ ỐNG + QUÁN CÀ PHÊ VIỆT NAM – tường vữa màu, phào chỉ, cửa đi kiểu Pháp + cửa chớp, ban công sắt hoa + hoa giấy,
  //     tầng trệt mở (cửa xếp), mái hiên vải sọc có diềm, hộp đèn biển hiệu, quầy bar, bảng menu phấn, đèn thả, ghế nhựa thấp vỉa hè, dây đèn
  function shophouse(k,o,glow){ const R=rng(o.seed||3), w=o.w, fl=o.floors||[4.0,3.4,3.4], Ht=fl.reduce((a,b)=>a+b,0), dep=o.depth||10, pil=.35, P=local(k,o.x||0,0,0,0);
    const wallM=plasterC(o.wall), trimM=plasterC(o.trim||0xf1e9da), paintM=paint(o.paint||0x2f5d4a,.5), louvM=louverC(o.paint||0x2f5d4a);
    P(boxM(w-.02,Ht-fl[0],dep),wallM,0,fl[0]+(Ht-fl[0])/2,-.25-dep/2);
    if(o.kind==='cafe'){ P(boxM(.25,fl[0],dep),wallM,-w/2+.125,fl[0]/2,-dep/2); P(boxM(.25,fl[0],dep),wallM,w/2-.125,fl[0]/2,-dep/2); P(boxM(w,fl[0],.25),wallM,0,fl[0]/2,-dep+.125); }
    else P(boxM(w-.02,fl[0],dep),wallM,0,fl[0]/2,-.6-dep/2);
    for(const s of [-1,1]) P(cbox(pil,Ht+.4,.4,.03),trimM,s*(w/2-pil/2),(Ht+.4)/2,0);
    let y=0; for(let i=0;i<fl.length-1;i++){ y+=fl[i]; P(cbox(w+.12,.26,.5,.04),trimM,0,y-.1,.05); }
    P(cbox(w,1.0,.32,.04),wallM,0,Ht+.5,-.05); P(cbox(w+.2,.14,.5,.03),trimM,0,Ht+1.07,-.02); P(cbox(w+.12,.22,.42,.03),trimM,0,Ht+.11,.02);
    // các tầng trên: cửa đi kiểu Pháp (kính có phòng) + khung + cửa chớp + ban công
    y=fl[0]; const nd=w>5.2?2:1, dw=1.15, dh=2.55;
    for(let i=1;i<fl.length;i++){ for(let j=0;j<nd;j++){ const dx=nd===1?0:(j-.5)*(w-2*pil)/2;
        P(planeM(dw,dh,R()*40,0,1,3.7/dh),M.glassHome,dx,y+dh/2+.05,-.24);
        P(cbox(dw+.16,.1,.12,.02),paintM,dx,y+dh+.1,-.2); for(const s of [-1,1]) P(cbox(.08,dh,.12,.02),paintM,dx+s*(dw/2+.04),y+dh/2+.05,-.2); P(cbox(.05,dh,.05,.01),paintM,dx,y+dh/2+.05,-.22);
        for(const s of [-1,1]){ const ang=R()<.75?Math.PI-.1:1.9, hx=dx+s*(dw/2+.08);   // bản lề ở mép cửa, cánh xoay ra ngoài
          P(cbox(.6,dh,.04,.01),louvM,hx-s*.3*Math.cos(ang),y+dh/2+.05,-.13+.3*Math.sin(ang),0,0,s*ang); }
        if(o.balcony!==false){ const [tx,tz]=P.at(dx,.88); addTree(k,'flower',tx,y+1.12,tz,.55,R()*6,i*7+j); P(cbox(.95,.26,.24,.03),M.terracotta,dx,y+1.24,.88); } }
      if(o.balcony!==false){ const bw=w-2*pil-.1; P(cbox(bw,.14,.92,.03),trimM,0,y+.07,.44); P(planeM(bw,.95),M.rail,0,y+.62,.87); P(cbox(bw,.05,.07,.01),M.blackMetal,0,y+1.12,.87);
        if(i===1){ const [tx,tz]=P.at(-bw/2+.4,.95); addTree(k,'flower',tx,y-.35,tz,.6,1,i*3); } }
      if(o.ac && i===1) { P(cbox(.82,.56,.3,.03),paint(0xe9e9e6,.5),-w/2+pil+.6,y+fl[i]-.55,.18); P(cylM(.2,.2,.02,16),paint(0x2a2c2f,.6),-w/2+pil+.6,y+fl[i]-.55,.34,Math.PI/2); }
      y+=fl[i]; }
    // tầng trệt
    const ow=w-2*pil, g0=fl[0];
    if(o.kind==='cafe'){ P(cbox(ow,.65,.32,.03),trimM,0,g0-.33,.02);
      for(const s of [-1,1]) for(let j=0;j<3;j++) P(cbox(.045,3.0,.5,.01),j%2?paintM:louvM,s*(ow/2-.06-j*.08),1.55,-.3-j*.04,0,0,s*(j%2?.25:-.25));
      const iw=w-.5, iz1=-dep+.25, izc=(-.3+iz1)/2, il=dep-.55;
      P(planeM(iw,il),M.terrazzo,0,.015,izc,-Math.PI/2); P(planeM(iw,il),plasterC(0xe8dcc6),0,g0-.66,izc,Math.PI/2);
      P(planeM(iw,g0),M.brick,0,g0/2,iz1+.01); P(planeM(il,g0),plasterC(0x2f4f43),-iw/2+.01,g0/2,izc,0,0,Math.PI/2); P(planeM(il,g0),plasterC(0xe8dcc6),iw/2-.01,g0/2,izc,0,0,-Math.PI/2);
      const bx=-iw/2+.5; P(cbox(.6,1.0,3.4,.03),M.woodDark,bx,.5,-3); P(cbox(.72,.06,3.5,.02),M.terrazzoDark,bx,1.03,-3); P(cbox(.55,.42,.45,.04),M.chrome,bx-.02,1.27,-3.9); P(cbox(.3,.08,.25,.02),M.blackMetal,bx+.22,1.18,-3.9);
      for(const hh of [1.55,1.95,2.35]){ P(cbox(.28,.04,2.6,.01),M.woodLight,-iw/2+.16,hh,-3.2); for(let b=0;b<9;b++) P(cylM(.035,.035,.24,6),b%3?M.bottleA:M.bottleB,-iw/2+.16,hh+.14,-4.3+b*.27); }
      for(let i=0;i<3;i++){ const lz=-1.4-i*1.9, ly=g0-1.45; P(cylM(.006,.006,.8,4),M.blackMetal,.4,ly+.45,lz); P(new THREE.ConeGeometry(.2,.18,16,1,true),M.blackMetal,.4,ly+.06,lz); P(new THREE.SphereGeometry(.07,10,8),M.bulb,.4,ly-.02,lz); if(glow){ const [gx,gz]=P.at(.4,lz); glow(gx,ly-.02,gz,1.1,0xffc070,.7); } }
      P(cylM(.12,.12,.12,12),paintM,.4,g0-.75,-5.6); for(let b=0;b<3;b++) P(cbox(.95,.012,.15,.004),M.woodDark,.4,g0-.8,-5.6,0,0,b*TAU/3);
      P(planeU(1.7,1.15),menuMat(),.9,2.15,iz1+.03);
      for(const [tx,tz] of [[.9,-2.3],[.9,-4.8]]){ P(cylM(.35,.35,.04,20),M.woodLight,tx,.74,tz); P(cylM(.04,.05,.72,8),M.blackMetal,tx,.37,tz); for(const s of [-1,1]){ P(cbox(.4,.05,.4,.02),M.woodLight,tx+s*.6,.45,tz); P(cbox(.4,.45,.04,.01),M.woodLight,tx+s*.8,.7,tz,0,0,Math.PI/2); for(const q of [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]]) P(cylM(.015,.015,.45,5),M.blackMetal,tx+s*.6+q[0],.22,tz+q[1]); } }
      // biển hiệu hộp đèn + biển dọc + mái hiên vải có diềm
      P(cbox(ow-.4,.6,.14,.03),paint(0x1d3b33,.5),0,g0-.33,.25); P(planeU(ow-.6,.46),signMat(o.sign||'Cà Phê',{bg:'#f3ead2', fg:'#1d3b33', border:'#1d3b33', key:'cafe', w:1024, h:96, font:'"Times New Roman",serif', weight:700, night:1.1}),0,g0-.33,.33);
      const blade=signMat('CÀ PHÊ',{bg:'#1d3b33', fg:'#ffd98a', key:'blade', w:128, h:512, vertical:true, night:1.3}); P(cbox(.1,1.6,.62,.02),paint(0x1d3b33,.5),w/2-pil/2,g0+1.5,.62);
      P(planeU(.52,1.45),blade,w/2-pil/2+.056,g0+1.5,.62,0,0,Math.PI/2); P(planeU(.52,1.45),blade,w/2-pil/2-.056,g0+1.5,.62,0,0,-Math.PI/2);
      const A=awnMat('#1f6f78','#f2e8d5'), dA=2.4, drop=.55, a=Math.atan2(drop,dA), La=Math.hypot(drop,dA), yt=g0-.75;
      P(planeM(ow+.1,La),A.top,0,yt-drop/2,.2+dA/2,-Math.PI/2+a); P(planeM(ow+.1,.3),A.val,0,yt-drop-.15,.2+dA);
      for(const s of [-1,1]) P(cylM(.016,.016,La,5),M.blackMetal,s*(ow/2-.1),yt-drop/2-.04,.2+dA/2,Math.PI/2+a);
      o.awnFront={y:yt-drop, z:.2+dA, x0:(o.x||0)-ow/2, x1:(o.x||0)+ow/2}; }
    else if(o.kind==='shutter'){ P(planeM(ow,g0-1.0),M.shutter,0,(g0-1.0)/2,-.05); P(cbox(ow,.42,.42,.04),paint(0x8d9297,.45,.4),0,g0-.8,.0); P(cbox(ow,.5,.12,.02),trimM,0,g0-.3,.05);
      P(planeU(ow-.4,.42),signMat(o.sign||'TẠP HOÁ',{bg:'#c8312b', fg:'#fff4d6', key:'shop1', w:1024, h:96, night:1.0}),0,g0-.3,.12); }
    else { P(planeM(ow-.1,2.9,R()*30,0,1,3.7/2.9),M.glassHome,0,1.55,-.15); for(const lx of [-ow/2+.05,-.55,.55,ow/2-.05]) P(cbox(.07,2.9,.12,.01),paintM,lx,1.55,-.1);
      P(cbox(ow,.08,.14,.01),paintM,0,3.05,-.1); P(cbox(ow,.6,.14,.02),paintM,0,g0-.42,.02); P(planeU(ow-.4,.42),signMat(o.sign||'TIỆM HOA',{bg:'#7a3b2e', fg:'#fff1dc', key:'shop2', w:1024, h:96, font:'"Times New Roman",serif', weight:700, night:1.0}),0,g0-.42,.1); }
  }
  function cafeStreet(o={}){ const g=new THREE.Group(), k=Kit(), glow=o.glow;
    const H=[{x:-5.4,w:4.6,wall:0xa9c7cf,trim:0xf2ede2,paint:0x4b5d6a,kind:'shutter',floors:[3.9,3.3,3.3,3.3],seed:11,ac:true,sign:'TẠP HOÁ BÀ TƯ'},
             {x:0,w:6.2,wall:0xe0b04f,trim:0xf3ead7,paint:0x2f5d4a,kind:'cafe',floors:[4.1,3.4,3.4],seed:12,sign:'Cà Phê Góc Phố',ac:true},
             {x:5.3,w:4.2,wall:0xefe6d6,trim:0xffffff,paint:0x7a3b2e,kind:'shop',floors:[3.9,3.4],seed:13,sign:'TIỆM HOA NHỎ'}];
    for(const h of H) shophouse(k,h,glow);
    // vỉa hè lát, bó vỉa đá, lòng đường
    k.add(planeM(22,4.6),M.pave,0,0,2.3,0,-Math.PI/2); k.add(cbox(22,.19,.26,.03),M.granite,0,-.06,4.73); k.add(planeM(22,10),M.asphalt,0,-.15,9.86,0,-Math.PI/2);
    for(let x=-10;x<11;x+=3.2) k.add(planeM(1.6,.12),M.paint(0xe9e6dc,.7),x,-.145,10.2,0,-Math.PI/2);
    // cây đường phố + ô gang, đèn đường, chậu cây
    addTree(k,'shade',-6.2,0,3.7,.92,1.3,21); k.add(cbox(1.2,.03,1.2,.01),M.blackMetal,-6.2,.015,3.7); streetLight(k,3.6,4.25,-Math.PI/2,'road',glow); addTree(k,'tier',8.2,0,3.7,.9,.4,4);
    for(const [x,z] of [[-2.85,.45],[2.85,.45]]){ k.add(cylM(.26,.19,.5,14),M.terracotta,x,.25,z); addTree(k,'fig',x,.45,z,.85,x,5); }
    // bàn ghế nhựa thấp + ghế mây
    const st=[0xc8322b,0x2a62b8,0x3c9a5a,0xd9a82b];
    for(const [tx,tz,n] of [[-1.7,2.0,4],[.4,2.4,4],[2.3,1.7,3],[-.6,3.85,4]]){ k.add(cbox(.55,.04,.55,.01),M.paint(0xe9e3d3,.5),tx,.45,tz); k.add(cylM(.03,.03,.43,6),M.paint(0x9a9a98,.4,.6),tx,.22,tz); k.add(cylM(.18,.18,.02,12),M.paint(0x9a9a98,.4,.6),tx,.01,tz);
      for(let i=0;i<n;i++){ const a=i/4*TAU+.4, sx=tx+Math.cos(a)*.52, sz=tz+Math.sin(a)*.52, c=paint(st[(i+Math.round(tx*3))&3],.45); k.add(cylM(.125,.16,.25,10,true),c,sx,.125,sz); k.add(cylM(.14,.14,.03,12),c,sx,.265,sz); } }
    for(const s of [-1,1]){ const x=3.95+s*.62, z=2.6; k.add(cbox(.58,.12,.6,.03),M.rattan,x,.42,z); k.add(cbox(.08,.5,.6,.02),M.rattan,x+s*.27,.72,z,0,0,-s*.2); for(const q of [[-.24,-.26],[.24,-.26],[-.24,.26],[.24,.26]]) k.add(cylM(.02,.02,.4,5),M.woodDark,x+q[0],.2,z+q[1]); }
    k.add(cylM(.3,.3,.03,18),M.woodLight,3.95,.62,2.6); k.add(cylM(.03,.04,.6,8),M.blackMetal,3.95,.31,2.6);
    // bảng chữ A trên vỉa hè
    k.add(planeU(.6,.85),menuMat(),3.2,.5,.9,-.2,0,-.5); k.add(planeU(.6,.85),menuMat(),3.32,.5,1.1,.2,0,Math.PI-.5);
    // dây đèn: từ mái hiên ra cây và cột đèn, dọc mép mái hiên
    const af=H[1].awnFront; if(af){ stringLights(k,vec(af.x0,af.y,af.z),vec(af.x1,af.y,af.z),14,.12,glow); stringLights(k,vec(af.x0,af.y,af.z),vec(-6.0,4.4,3.6),10,.35,glow); stringLights(k,vec(af.x1,af.y,af.z),vec(3.6,5.2,4.25),8,.3,glow); }
    aoDecal(k,0,0,-.2,16.2,.4,0,.9);
    const col={boxes:[{x0:-7.7,x1:-3.1,z0:-10.6,z1:.1,msg:'🏪 Tạp hoá'},{x0:3.1,x1:7.4,z0:-10.6,z1:.1,msg:'💐 Tiệm hoa'},{x0:-3.1,x1:-2.85,z0:-10,z1:.1},{x0:2.85,x1:3.1,z0:-10,z1:.1},{x0:-3.1,x1:3.1,z0:-10.2,z1:-9.75},
        {x0:-2.65,x1:-2.05,z0:-4.7,z1:-1.3,msg:'☕ Quầy pha chế'},{x0:3.2,x1:4.7,z0:2.2,z1:3.0}],
      circles:[{x:.9,z:-2.3,r:.95},{x:.9,z:-4.8,r:.95},{x:-1.7,z:2.0,r:.75},{x:.4,z:2.4,r:.75},{x:2.3,z:1.7,r:.75},{x:-.6,z:3.85,r:.75},{x:-6.2,z:3.7,r:.35},{x:8.2,z:3.7,r:.25},{x:-2.85,z:.45,r:.3},{x:2.85,z:.45,r:.3},{x:3.6,z:4.25,r:.15},{x:3.26,z:1.0,r:.35}], plats:[]};
    k.build(g); return {group:g, col}; }

  // 5.3 SIÊU BIỆT THỰ – 3 tầng kiểu hiện đại nhiệt đới: khung trắng dày ôm tầng 2, tầng 2 đua ra 2,7 m, kính kịch trần + lan can kính,
  //     lam gỗ đứng, tường đá ốp, mái xanh, hồ bơi tràn đá xanh rêu, sàn gỗ, ghế tắm nắng, dù, cau/cọ, đèn sân vườn, đèn âm trần
  function villa(o={}){ const g=new THREE.Group(), k=Kit(), R=rng(o.seed||5), glow=o.glow;
    const GH={glass:M.glassHome, mul:M.mullion, md:.1, mw:.06};
    // nền + tầng trệt (lùi vào, kính + lam gỗ + tường đá)
    k.add(cbox(17.4,.45,9.4,.03),M.stoneLight,-1,.225,-.8);
    facade(k,12,.45,4.45,1,3.5,0,{...GH, spacing:2.0, F:4.0, vs:3.7/4.0, ou:R()*40});
    k.add(cbox(4,4.0,.45,.03),M.stoneDark,-7,2.45,3.3); k.add(cbox(.3,4.0,8.5,.03),M.white,-9,2.45,-.75); k.add(cbox(16,4.0,.3,.03),M.white,-1,2.45,-5);
    facade(k,8.5,.45,4.45,7,-.75,Math.PI/2,{...GH, spacing:2.1, F:4.0, vs:3.7/4.0, ou:R()*40});
    for(let z=-4.9;z<3.4;z+=.16) k.add(cbox(.05,3.9,.13,.01),M.wood,7.4,2.42,z);
    // tầng 2: khung trắng dày (sàn + mái + 2 vách bên + vách giữa), kính lùi 2,4 m tạo ban công, lan can kính
    k.add(cbox(18,.35,11.7,.03),M.white,-1,4.625,.35); k.add(cbox(18.6,.5,12.3,.03),M.white,-1,8.45,.35);
    for(const x of [-9.775,7.775]) k.add(cbox(.45,3.4,11.7,.03),M.white,x,6.5,.35); k.add(cbox(.35,3.4,2.4,.03),M.white,-1.5,6.5,5.0);
    facade(k,17.1,4.8,8.2,-1,3.8,0,{...GH, spacing:1.8, F:3.4, vs:3.7/3.4, ou:R()*40}); k.add(cbox(17.1,3.4,.3,.02),M.white,-1,6.5,-5.35);
    k.add(planeM(17.1,1.1),M.glassClear,-1,5.36,6.02); k.add(cbox(17.1,.1,.12,.02),M.mullion,-1,4.85,6.02); k.add(cbox(17.1,.04,.05,.01),M.chrome,-1,5.92,6.02);
    for(let x=-9.4;x<-3.9;x+=.14) k.add(cbox(.04,3.3,.1,.01),M.wood,x,6.5,4.35);
    for(let x=-8;x<=6;x+=2.8) for(const z of [4.1,5.3]){ k.add(cylM(.07,.07,.02,10),M.lampWarm,x,4.44,z); k.add(cylM(.07,.07,.02,10),M.lampWarm,x,8.19,z+.6); if(glow){ glow(x,4.3,z,1.2,0xffd9a0,.55); glow(x,8.05,z+.6,1.2,0xffd9a0,.55); } }
    // tầng 3 + mái xanh + sân thượng gỗ
    facade(k,9.5,8.7,12.1,1.25,2,0,{...GH, spacing:1.9, F:3.4, vs:3.7/3.4, ou:R()*40}); k.add(cbox(10.3,.45,7.6,.03),M.white,1.25,12.325,-1.5);
    for(const x of [-3.5,6]) k.add(cbox(.35,3.4,7,.03),M.white,x,10.4,-1.5); k.add(cbox(9.5,3.4,.3,.02),M.white,1.25,10.4,-5.0);
    for(let z=-4.8;z<1.9;z+=.15) k.add(cbox(.04,3.3,.1,.01),M.wood,6.35,10.4,z);
    k.add(planeM(9.6,6.8),M.lawn,1.25,12.56,-1.5,0,-Math.PI/2); for(let i=0;i<4;i++) addTree(k,'bush',-2.8+i*2.7,12.55,-4.4,.8,i,40+i);
    k.add(planeM(17.4,4.1),M.deck,-1,8.71,4.3,0,-Math.PI/2); k.add(planeM(6.1,7),M.lawn,-6.7,8.71,-1.7,0,-Math.PI/2);
    k.add(planeM(18,1.1),M.glassClear,-1,9.26,6.43); k.add(cbox(18,.04,.05,.01),M.chrome,-1,9.82,6.43);
    for(const x of [-7.5,4.5]){ k.add(cbox(2.4,.6,.6,.04),M.stoneDark,x,9.0,5.6); addTree(k,'flower',x,9.25,5.6,.8,x,9); }
    // sân hiên gỗ, hồ bơi tràn
    k.add(cbox(20,.45,4.9,.02),M.deck,-.5,.225,5.95);
    const PX0=-8, PX1=7, PZ0=8.4, PZ1=12.8, PD=-1.2, pcx=(PX0+PX1)/2, pw=PX1-PX0, pd=PZ1-PZ0;
    k.add(planeM(pw,pd),M.poolTile,pcx,PD,(PZ0+PZ1)/2,0,-Math.PI/2);
    k.add(planeM(pw,.45-PD),M.poolTile,pcx,(.45+PD)/2,PZ0,0); k.add(planeM(pw,.45-PD),M.poolTile,pcx,(.45+PD)/2,PZ1,Math.PI);
    k.add(planeM(pd,.45-PD),M.poolTile,PX0,(.45+PD)/2,(PZ0+PZ1)/2,Math.PI/2); k.add(planeM(pd,.45-PD),M.poolTile,PX1,(.45+PD)/2,(PZ0+PZ1)/2,-Math.PI/2);
    for(const [x,z,w,d] of [[PX0-.25,(PZ0+PZ1)/2,.5,pd+1],[PX1+.25,(PZ0+PZ1)/2,.5,pd+1]]) k.add(cbox(w,.12,d,.02),M.stoneLight,x,.39,z);
    k.add(cbox(pw+1,.14,.5,.02),M.stoneLight,pcx,.38,PZ0-.25); k.add(cbox(pw+1,.14,.32,.02),M.stoneLight,pcx,.31,PZ1+.16); k.add(cbox(pw+1.6,.25,.7,.02),M.stoneDark,pcx,.12,PZ1+.65);
    for(const [x,z,w,d] of [[pcx,PZ1+.2,pw+1.2,.4],[PX0-.3,(PZ0+PZ1)/2,.4,pd],[PX1+.3,(PZ0+PZ1)/2,.4,pd]]) k.add(cbox(w,.45,d,.02),M.stoneLight,x,.2,z);
    const water=new THREE.Mesh(new THREE.PlaneGeometry(pw,pd),M.water); water.rotation.x=-Math.PI/2; water.position.set(pcx,.36,(PZ0+PZ1)/2); g.add(water);
    for(let i=0;i<4;i++){ const x=PX0+2+i*3.6; k.add(cylM(.13,.13,.02,12),M.poolLight,x,-.5,PZ0+.012,0,Math.PI/2); if(glow) glow(x,-.3,PZ0+.6,1.6,0x6fe6ff,.6); }
    // ghế tắm nắng, dù, bàn ăn ngoài trời
    for(const x of [-5.6,-3.8,-2.0]){ k.add(cbox(.72,.26,2.0,.03),M.woodDark,x,.6,6.6); k.add(cbox(.66,.08,1.3,.03),fabricC(0xf1ede6),x,.77,6.95); k.add(cbox(.66,.08,.7,.03),fabricC(0xf1ede6),x,.98,5.95,0,.6); }
    k.add(cylM(.03,.03,2.6,8),M.chrome,-.6,1.75,6.9); k.add(new THREE.ConeGeometry(1.6,.5,18,1,true),fabricC(0xf4f1ea),-.6,3.05,6.9);
    k.add(cbox(2.4,.06,1.0,.02),M.woodLight,3.6,1.2,5.0); for(const s of [-1,1]) k.add(cbox(.08,.72,.8,.01),M.blackMetal,3.6+s*1.0,.81,5.0);
    for(let i=0;i<3;i++) for(const s of [-1,1]){ const x=2.8+i*.8, z=5.0+s*.75; k.add(cbox(.45,.06,.45,.02),M.rattan,x,.9,z); k.add(cbox(.45,.5,.05,.01),M.rattan,x,1.15,z+s*.21); }
    // sân cỏ (chừa hồ bơi), đường đá bước, bụi cây, cau, đèn sân vườn
    for(const [x0,x1,z0,z1] of [[-24,PX0,-20,24],[PX1,24,-20,24],[PX0,PX1,PZ1,24],[PX0,PX1,-20,PZ0]]) k.add(planeM(x1-x0,z1-z0,x0,z0),M.lawn,(x0+x1)/2,.01,(z0+z1)/2,0,-Math.PI/2);
    for(let i=0;i<15;i++){ const t=i/14, x=11+Math.sin(t*2.6)*1.6, z=-3+t*20; k.add(cbox(1.1,.06,.55,.02),M.stoneLight,x+(R()-.5)*.2,.03,z,(R()-.5)*.25); if(i%3===1) streetLight(k,x+1.3,z,0,'bollard',glow); }
    for(const [x,z,s,sd] of [[-10.5,13.6,1,1],[9.6,13.4,.9,2],[11,-6,1.05,3],[-11.5,-2,.95,4]]){ addTree(k,'palm',x,0,z,s,R()*6,sd); k.add(cylM(.11,.12,.07,12),M.blackMetal,x+.6,.035,z+.4); k.add(cylM(.06,.06,.02,10),M.lampWarm,x+.6,.07,z+.4); if(glow) glow(x+.4,.6,z+.3,1.8,0xffd9a0,.6); }
    for(let i=0;i<10;i++){ const x=-9.8+i*1.9, z=-6.0; addTree(k,i%3===0?'flower':'bush',x,0,z,.9+R()*.3,R()*6,60+i); }
    for(const [x,z] of [[-9.6,8.6],[-9.6,10.5],[8.4,9.2],[8.6,11.2],[-9.3,4.1]]) addTree(k,'bush',x,0,z,1.1,R()*6,70+Math.round(x));
    addTree(k,'tier',14.5,0,6,1,1,8); addTree(k,'round',-14,0,6,1.2,2,9);
    aoDecal(k,-1,.45,-.8,17,9,0,1.2); aoDecal(k,-1,0,.4,20.5,13.5,0,1.6);
    const col={boxes:[{x0:-9.3,x1:7.5,z0:-5.3,z1:3.6,msg:'🏡 Siêu biệt thự'},{x0:PX0,x1:PX1,z0:PZ0,z1:PZ1,msg:'🏊 Hồ bơi tràn'},{x0:-5.95,x1:-1.65,z0:5.6,z1:7.6},{x0:2.3,x1:4.9,z0:4.1,z1:5.9}],
      circles:[[-10.5,13.6],[9.6,13.4],[11,-6],[-11.5,-2]].map(([x,z])=>({x,z,r:.35})).concat([...Array(10)].map((_,i)=>({x:-9.8+i*1.9,z:-6,r:.6})),[[-9.6,8.6],[-9.6,10.5],[8.4,9.2],[8.6,11.2],[-9.3,4.1],[14.5,6],[-14,6]].map(([x,z])=>({x,z,r:.6})),[{x:-.6,z:6.9,r:.12}]),
      plats:[{x:-.5,z:5.95,rot:0,hw:10,hd:2.45,h:.45},{x:pcx,z:PZ1+.2,rot:0,hw:pw/2+.6,hd:.25,h:.45},{x:PX0-.3,z:(PZ0+PZ1)/2,rot:0,hw:.45,hd:pd/2,h:.45},{x:PX1+.3,z:(PZ0+PZ1)/2,rot:0,hw:.45,hd:pd/2,h:.45}]};
    k.build(g); return {group:g, col}; }

  // 5.4 CAMPUS CÔNG NGHỆ – lấy NGÔN NGỮ kiến trúc (không sao chép công trình/logo):
  //  ringHQ: toà vòng kính 4 tầng, mỗi sàn có mái đua trắng mỏng chạy vòng, mái pin mặt trời, sân trong là vườn cây + hồ (cảm hứng toà "vòng nhẫn")
  function ringHQ(o={}){ const g=new THREE.Group(), k=Kit(), Ro=o.ro||38, Ri=o.ri||24, NF=o.floors||4, F=o.floor||4.2, H=NF*F, seg=o.seg||112, glow=o.glow;
    const sv=3.6/F, out=cylM(Ro,Ro,H,seg,true,0,sv), inn=flipGeo(cylM(Ri,Ri,H,seg,true,0,sv)); k.add(out,M.glassOffice,0,H/2+.3,0); k.add(inn,M.glassOffice,0,H/2+.3,0);
    for(const p of annulus(Ri-.6,Ro+.6,.3,seg)) k.add(p,M.granite,0,.15,0);
    for(let i=1;i<=NF;i++){ const y=i*F+.3, top=i===NF; for(const p of annulus(Ro-.25,Ro+(top?1.2:2.7),top?.6:.22,seg)) k.add(p,M.whiteAlu,0,y,0); for(const p of annulus(Ri-(top?1.2:2.3),Ri+.25,top?.6:.22,seg)) k.add(p,M.whiteAlu,0,y,0); }
    k.add(uvXZ(new THREE.RingGeometry(Ri+.3,Ro-.3,seg,2).rotateX(-Math.PI/2)),M.solar,0,H+.62,0);
    for(const [R0,sgn] of [[Ro,1],[Ri,-1]]){ const n=Math.round(TAU*R0/3.2); for(let i=0;i<n;i++){ const a=i/n*TAU, x=Math.cos(a)*(R0+sgn*.09), z=Math.sin(a)*(R0+sgn*.09); k.add(cbox(.07,H,.18,.012),M.mullion,x,H/2+.3,z,Math.PI/2-a); } }
    for(const p of annulus(Ro+.6,Ro+9,.04,seg)) k.add(p,M.pave,0,.02,0);
    k.add(uvXZ(new THREE.CircleGeometry(Ri-.6,seg).rotateX(-Math.PI/2)),M.lawn,0,.31,0);
    for(const p of annulus(5.2,6.4,.06,48)) k.add(p,M.stoneLight,6,.33,-4); { const wm=new THREE.Mesh(new THREE.CircleGeometry(5.2,48),M.water); wm.rotation.x=-Math.PI/2; wm.position.set(6,.34,-4); g.add(wm); }
    const R=rng(17); for(let i=0;i<14;i++){ const a=i/14*TAU+R()*.2, r=11+R()*8, x=Math.cos(a)*r, z=Math.sin(a)*r; if(Math.hypot(x-6,z+4)<7.5) continue; addTree(k,i%3?'round':'shade',x,.3,z,i%3?1.1:.8,R()*6,i); }
    for(let i=0;i<10;i++){ const a=i/10*TAU+.3, r=Ro+12; addTree(k,'shade',Math.cos(a)*r,0,Math.sin(a)*r,.95,R()*6,30+i); streetLight(k,Math.cos(a+.16)*(Ro+8),Math.sin(a+.16)*(Ro+8),-a-.16,'garden',glow); }
    k.build(g); return {group:g, H}; }
  //  canopyHall: nhà làm việc 2 tầng dưới MÁI LỀU cong phủ "vảy" pin mặt trời bạc, cửa sổ mái (clerestory) quanh mép (cảm hứng mái lều vảy rồng)
  function canopyHall(o={}){ const g=new THREE.Group(), k=Kit(), W=o.w||44, D=o.d||26, F=4.2, H=2*F+.3, ov=3.4, RW=W+2*ov, RD=D+2*ov;
    ring4(k,W,D,.3,H,{glass:M.glassOffice, mul:M.mullion, spacing:1.5, md:.14, mw:.06, spd:M.spandrel, F, ou:13}); k.add(cbox(W+3,.3,D+3,.04),M.granite,0,.15,0);
    k.add(planeM(W,D),M.paint(0xf0ede6,.8),0,H,0,0,Math.PI/2);
    const yf=(x,z)=>{ const t=(1-Math.cos(TAU*(x+W/2)/(W/3)))/2, zz=Math.min(1,Math.abs(z)/(RD/2)); return H+.9+3.6*t*(1-.62*zz*zz)+1.1*zz*zz*zz; };
    const nx=66, nz=40, roof=new THREE.PlaneGeometry(RW,RD,nx,nz); roof.rotateX(-Math.PI/2); { const p=roof.attributes.position; for(let i=0;i<p.count;i++) p.setY(i,yf(p.getX(i),p.getZ(i))); } roof.computeVertexNormals(); uvXZ(roof);
    k.add(roof,M.scales); const under=flipGeo(roof); under.translate(0,-.14,0); k.add(under,M.woodLight);
    const edge=(pts,y0f,y1f,mat)=>{ const pos=[],uv=[]; let s=0; for(let i=0;i<pts.length-1;i++){ const [ax,az]=pts[i], [bx,bz]=pts[i+1], l=Math.hypot(bx-ax,bz-az), a0=y0f(ax,az), a1=y1f(ax,az), b0=y0f(bx,bz), b1=y1f(bx,bz);
        pos.push(ax,a0,az, bx,b0,bz, bx,b1,bz,  ax,a0,az, bx,b1,bz, ax,a1,az); uv.push(s,a0, s+l,b0, s+l,b1, s,a0, s+l,b1, s,a1); s+=l; }
      const gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); gg.computeVertexNormals(); k.add(gg,mat); };
    const rect=(w,d,n)=>{ const P=[]; for(let i=0;i<=n;i++) P.push([-w/2+w*i/n,d/2]); for(let i=1;i<=n/2;i++) P.push([w/2,d/2-d*i/(n/2)]); for(let i=1;i<=n;i++) P.push([w/2-w*i/n,-d/2]); for(let i=1;i<=n/2;i++) P.push([-w/2,-d/2+d*i/(n/2)]); return P; };
    edge(rect(RW,RD,66),(x,z)=>yf(x,z)-.45,(x,z)=>yf(x,z),M.whiteAlu);
    edge(rect(W,D,66),()=>H,(x,z)=>yf(x,z)-.2,M.glassDark);
    for(const x of [-W/6,W/6]) for(const s of [-1,1]){ const z=s*(D/2+1.8), yt=yf(x,z)-.2; k.add(limb(vec(x,0,z),vec(x,yt,z),.55,.32,12),M.whiteAlu); }
    k.add(planeM(RW+16,RD+16),M.pave,0,.012,0,0,-Math.PI/2); aoDecal(k,0,0,0,W+2,D+2,0,2);
    const R=rng(23); for(let i=0;i<8;i++){ const x=-RW/2-2+i*(RW+4)/7; addTree(k,'tier',x,0,RD/2+5,1,R()*6,i); }
    k.build(g); return {group:g}; }
  //  dome: vòm kính lưới tam giác (geodesic) chứa vườn cây bên trong – nơi họp/thư giãn (cảm hứng vòm cây xanh văn phòng)
  function dome(o={}){ const g=new THREE.Group(), k=Kit(), r=o.r||10;
    const ico=new THREE.IcosahedronGeometry(r,3), p=ico.attributes.position, pos=[], E=new Map(), key=v=>`${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`;
    for(let i=0;i<p.count;i+=3){ const a=new THREE.Vector3().fromBufferAttribute(p,i), b=new THREE.Vector3().fromBufferAttribute(p,i+1), c=new THREE.Vector3().fromBufferAttribute(p,i+2); if(Math.min(a.y,b.y,c.y)<-.05*r) continue;
      pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z); for(const [u,v] of [[a,b],[b,c],[c,a]]){ const kk=[key(u),key(v)].sort().join('|'); if(!E.has(kk)) E.set(kk,[u,v]); } }
    const gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); gg.computeVertexNormals(); k.add(gg,M.glassClear,0,.8,0);
    for(const [a,b] of E.values()) k.add(limb(a,b,.06,.06,5),M.whiteAlu,0,.8,0);
    k.add(cylM(r+.25,r+.25,.8,64),M.stoneLight,0,.4,0); k.add(uvXZ(new THREE.CircleGeometry(r,48).rotateX(-Math.PI/2)),M.lawn,0,.82,0);
    addTree(k,'shade',1.5,.8,-1,.75,1,5); addTree(k,'fig',-4,.8,3,2.2,1,6); addTree(k,'palm',-3,.8,-4,.8,2,7); for(let i=0;i<7;i++) addTree(k,i%2?'bush':'flower',Math.cos(i)*7,.8,Math.sin(i)*7,1,i,80+i);
    k.build(g); return {group:g}; }

  // 5.5 VĂN PHÒNG MỞ (bên trong) – sàn bê tông mài, trần tối + nan gỗ, đèn thả dạng thanh, bàn bench gỗ sồi + vách nỉ,
  //     phòng họp vách kính khung đen (dải mờ), tường rêu, bậc ngồi "khán đài", quầy cà phê, góc sofa, cây lá to
  function office(o={}){ const g=new THREE.Group(), k=Kit(), W=28, D=18, Hc=4.2, R=rng(31);
    k.add(planeM(W,D),M.concPol,0,0,0,0,-Math.PI/2); k.add(planeM(W,D),paint(0x2b2e33,.9),0,Hc,0,0,Math.PI/2);
    for(let z=-D/2+.45;z<D/2-.3;z+=.3) k.add(cbox(W-1.6,.16,.035,.008),M.woodLight,0,Hc-.5,z);
    k.add(planeM(W,Hc),M.white,0,Hc/2,-D/2); k.add(planeM(D,Hc),M.white,-W/2,Hc/2,0,Math.PI/2);
    for(const [cx,cz,L,ry] of [[0,D/2,W,Math.PI],[W/2,0,D,-Math.PI/2]]){ const P=local(k,cx,0,cz,ry); P(planeM(L,Hc),M.glassClear,0,Hc/2,0); const n=Math.round(L/1.5); for(let i=0;i<=n;i++) P(cbox(.06,Hc,.14,.01),M.mullion,-L/2+i*L/n,Hc/2,.07);
      P(cbox(L,.12,.25,.02),M.mullion,0,.06,.12); P(cbox(L,.3,.3,.02),M.mullion,0,Hc-.15,.15); }
    // tường rêu + chữ, bậc ngồi khán đài + màn hình di động
    k.add(planeM(7,2.6),M.moss,-2,1.75,-D/2+.04); for(const [x,y,w,h] of [[-2,3.1,7.2,.1],[-2,.4,7.2,.1],[-5.55,1.75,.1,2.8],[1.55,1.75,.1,2.8]]) k.add(cbox(w,h,.1,.01),M.woodDark,x,y,-D/2+.06);
    k.add(planeU(4.4,.5),signMat('QA · QC · QE',{fg:'#efe9dd', key:'off', w:1024, h:110, night:.6, day:.1}),-2,3.55,-D/2+.05);
    for(let i=0;i<3;i++){ const hh=.45*(3-i), z=-D/2+.45+i*.85; k.add(cbox(7,hh,.85,.02),M.woodLight,8,hh/2,z); for(let j=0;j<4;j++) k.add(cbox(1.1,.09,.6,.03),fabricC([0xc96a3b,0x5d7d8c,0xd9b44a,0x7a8f5a][(i+j)&3]),5.6+j*1.6,hh+.045,z+.05); }
    k.add(cbox(2.5,1.45,.08,.02),M.whiteAlu,8,1.75,-4.2); k.add(planeU(2.4,1.35),canvasMat('slide',512,288,(c,w,h)=>{ c.fillStyle='#0f1a2b'; c.fillRect(0,0,w,h); c.fillStyle='#46d39a'; c.fillRect(30,40,8,200); c.fillStyle='#fff'; c.font='700 34px "Segoe UI"'; c.fillText('Sprint Review',54,78);
      c.font='22px "Segoe UI"'; c.fillStyle='#b9c6d6'; ['✔ 128 test case PASS','✖ 3 bug P1 cần fix','⏱ Regression: 42 phút'].forEach((t,i)=>c.fillText(t,54,130+i*38)); },{emis:[.9,1.1]}),8,1.75,-4.25,0,0,Math.PI);
    for(const s of [-1,1]) k.add(cbox(.06,1.05,.6,.01),M.blackMetal,8+s*1.0,.52,-4.2);
    // phòng họp kính dọc tường trái
    { const P=local(k,-9,0,-2.9,Math.PI/2), L=12.2, hh=Hc-.6; P(planeM(L,hh),M.glassClear,0,hh/2,0); for(let i=0;i<=10;i++) P(cbox(.05,hh,.07,.01),M.blackMetal,-L/2+i*L/10,hh/2,0); P(cbox(L,.06,.08,.01),M.blackMetal,0,hh,0); P(planeM(L,.45),M.frosted,0,1.35,.01);
      k.add(cbox(.25,.6,L,.02),M.white,-9,Hc-.3,-2.9);
      for(const z of [-2.9,3.2]){ k.add(planeM(5,hh),M.glassClear,-11.5,hh/2,z); k.add(cbox(5,.06,.08,.01),M.blackMetal,-11.5,hh,z); }
      for(const zc of [-6,.3]){ k.add(cbox(3.2,.06,1.3,.02),M.woodLight,-11.6,.74,zc); for(const s of [-1,1]) k.add(cbox(.06,.7,1.0,.01),M.blackMetal,-11.6+s*1.3,.36,zc);
        for(let i=0;i<3;i++) for(const s of [-1,1]){ const x=-12.6+i, z=zc+s*.95; k.add(cbox(.48,.08,.46,.02),fabricC(0x3b4a5a),x,.48,z); k.add(cbox(.46,.5,.06,.02),fabricC(0x3b4a5a),x,.8,z+s*.22); k.add(cylM(.02,.02,.42,6),M.chrome,x,.24,z); }
        k.add(cbox(.06,1.0,1.7,.01),M.blackMetal,-13.9,1.6,zc); k.add(planeU(1.6,.9),canvasMat('slide',0,0,null),-13.86,1.6,zc,Math.PI/2); k.add(cbox(2.4,.05,.12,.01),M.lampCool,-11.6,2.9,zc); } }
    // bàn bench: 3 dãy × 2 cụm × 8 chỗ
    const chairC=[0x2f3236,0x46505a,0x5b4636];
    for(const bz of [-4.6,-.5,3.6]) for(const bx of [-2.8,4.4]){ const L=6.4; k.add(cbox(L,.035,1.6,.01),M.woodLight,bx,.74,bz); for(const lx of [-L/2+.05,0,L/2-.05]) k.add(cbox(.05,.72,1.4,.01),M.blackMetal,bx+lx,.37,bz);
      k.add(cbox(L,.42,.025,.005),M.felt,bx,.97,bz); k.add(cbox(5.6,.06,.14,.01),M.lampCool,bx,2.95,bz); for(const s of [-1,1]) k.add(cylM(.004,.004,.7,3),M.blackMetal,bx+s*2.4,3.3,bz);
      for(const s of [-1,1]) for(let i=0;i<4;i++){ const x=bx-L/2+.8+i*1.6, z=bz+s*.4;
        k.add(cbox(.6,.36,.025,.008),M.screen,x,1.12,bz+s*.2); k.add(cbox(.62,.38,.02,.008),M.blackMetal,x,1.12,bz+s*.18); k.add(cbox(.05,.22,.05,.01),M.blackMetal,x,.86,bz+s*.16); k.add(cbox(.24,.015,.18,.005),M.blackMetal,x,.765,bz+s*.18);
        k.add(cbox(.42,.015,.13,.005),paint(0x2c2e31,.5),x,.765,z+s*.08); const cc=fabricC(chairC[(i+(s>0?1:0))%3]), cz=bz+s*1.05;
        k.add(cbox(.5,.08,.48,.02),cc,x,.48,cz); k.add(cbox(.48,.55,.06,.02),cc,x,.84,cz+s*.25,0,s*.12); k.add(cylM(.025,.025,.36,6),M.chrome,x,.26,cz); k.add(cylM(.28,.28,.03,10),M.blackMetal,x,.06,cz);
        if((i+Math.round(bz)+3)%3===0){ k.add(cylM(.07,.06,.12,10),paint(0xe8e4dc,.5),x+.45,.81,z); addTree(k,'bush',x+.45,.85,z,.22,i,90+i); } } }
    // quầy cà phê + ghế cao + đèn cầu
    k.add(cbox(4.2,1.0,.8,.03),M.woodDark,-4.8,.5,6.6); k.add(cbox(4.4,.05,.95,.02),M.terrazzo,-4.8,1.025,6.6); k.add(cbox(.6,.42,.45,.04),M.chrome,-6.3,1.26,6.5);
    for(let i=0;i<4;i++){ const x=-6.3+i*1.0; k.add(cylM(.19,.19,.06,14),M.woodLight,x,.75,7.45); k.add(cylM(.025,.025,.72,6),M.chrome,x,.37,7.45); k.add(cylM(.2,.2,.02,14),M.chrome,x,.01,7.45); }
    for(let i=0;i<3;i++){ const x=-6+i*1.2; k.add(new THREE.SphereGeometry(.17,16,12),M.lampWarm,x,2.6,6.6); k.add(cylM(.004,.004,1.0,3),M.blackMetal,x,3.15,6.6); }
    // góc sofa
    k.add(planeM(4.2,3.4),fabricC(0x6a7c8c),11.4,.012,6.6,0,-Math.PI/2); const sf=fabricC(0xb9a58a);
    k.add(cbox(3.2,.42,.95,.06),sf,11,.21,8.1); k.add(cbox(3.2,.48,.22,.05),sf,11,.62,8.55); k.add(cbox(.95,.42,2.2,.06),sf,13.0,.21,6.4); k.add(cbox(.22,.48,2.2,.05),sf,13.45,.62,6.4);
    for(let i=0;i<3;i++) k.add(cbox(.85,.14,.75,.06),fabricC(0xe8dfcf),9.9+i*.95,.49,8.05); k.add(cylM(.55,.55,.38,24),M.woodLight,11,.19,6.4);
    k.add(cylM(.015,.015,1.6,5),M.blackMetal,9.4,.8,8.4); k.add(cylM(.18,.22,.3,16,true),fabricC(0xf2ede4),9.4,1.65,8.4); k.add(new THREE.SphereGeometry(.07,8,6),M.lampWarm,9.4,1.6,8.4);
    k.add(cylM(.3,.24,.55,16),paint(0xe8e4dc,.5),13.3,.275,4.6); addTree(k,'fig',13.3,.5,4.6,1.5,1,11);
    for(const z of [-5.6,.6]){ k.add(cbox(.5,.6,3,.04),M.woodDark,-7.6,.3,z); for(let i=0;i<3;i++) addTree(k,'bush',-7.6,.55,z-1+i,.6,i,100+i+z); }
    k.build(g); return {group:g}; }

  /* ---- 6. môi trường phản chiếu ---- */
  // Đặt vào envScene trước khi PMREM: mặt đất + đường chân trời thành phố → kính có cái để phản chiếu (không còn là trời trơn)
  function skyline(o={}){ const g=new THREE.Group(), R=rng(o.seed||99), n=o.n||70, r0=o.r0||140, r1=o.r1||260, k=Kit(), mat=o.mat||(o.basic?new THREE.MeshBasicMaterial({color:o.color||0x7c8794}):M.glassOffice);
    for(let i=0;i<n;i++){ const a=i/n*TAU+R()*.05, r=r0+R()*(r1-r0), w=12+R()*22, d=12+R()*22, h=(o.hmin||18)+R()*(o.hmax||90); k.add(boxM(w,h,d,R()*90,0),mat,Math.cos(a)*r,(o.y||0)+h/2,Math.sin(a)*r,-a); }
    k.build(g,{cast:false}); if(o.ground){ const gm=new THREE.Mesh(new THREE.CircleGeometry(r1*3,32),o.basic?new THREE.MeshBasicMaterial({color:o.groundColor||0x8f8a80}):paint(0x8f8a80,.95)); gm.rotation.x=-Math.PI/2; gm.position.y=(o.y||0)-.05; g.add(gm); }
    g.userData.setNight=(nk)=>{ if(!o.basic) return; g.traverse(m=>{ if(m.isMesh){ const c=m.material.color; c.setHex(m.geometry.type==='CircleGeometry'?(o.groundColor||0x8f8a80):(o.color||0x7c8794)).lerp(new THREE.Color(0x0d121a),nk*.88); } }); };
    return g; }
  // glow: quầng sáng đêm (1 InstancedMesh, cộng sáng, quay mặt về camera) – giống W.GLOW của world.html
  function makeGlow(max=1024){ const mat=new THREE.ShaderMaterial({uniforms:{uNight:U.uNight}, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
      vertexShader:`varying vec2 vUv; varying vec3 vCol;
void main(){ vUv=uv;
#ifdef USE_INSTANCING_COLOR
  vCol=instanceColor;
#else
  vCol=vec3(1.);
#endif
  vec4 mv=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.); float s=length(instanceMatrix[0].xyz); mv.xy+=position.xy*s; gl_Position=projectionMatrix*mv; }`,
      fragmentShader:`uniform float uNight; varying vec2 vUv; varying vec3 vCol; void main(){ float d=length(vUv-.5)*2.; float a=max(0.,1.-d); a=a*a*a*uNight; if(a<.003) discard; gl_FragColor=vec4(vCol*a,a); }`});
    const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),mat,max); im.count=0; im.frustumCulled=false; im.renderOrder=3; im.castShadow=im.receiveShadow=false; const m4=new THREE.Matrix4(), c=new THREE.Color();
    const add=(x,y,z,size=2,color=0xffc477,kk=1)=>{ if(im.count>=max) return; m4.makeScale(size,size,size); m4.setPosition(x,y,z); im.setMatrixAt(im.count,m4); im.setColorAt(im.count,c.set(color).multiplyScalar(kk)); im.count++; im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; };
    return {mesh:im, add}; }

  return { M, U, T, Kit, cbox, boxM, planeM, cylM, local, addTree, forest, streetLight, aoDecal, stringLights, facade, ring4, signMat, makeGlow, skyline,
    build:{tower, cafeStreet, shophouse, villa, ringHQ, canopyHall, dome, office},
    setTime(day,night){ U.uDay.value=day; U.uNight.value=night; for(const [m,a,b] of EMIS) m.emissiveIntensity=a+(b-a)*night; },
    update(dt){ U.uTime.value+=dt; for(const f of ANIM) f(dt); } };
}
