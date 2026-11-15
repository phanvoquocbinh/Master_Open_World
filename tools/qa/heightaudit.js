// RÀ TOÀN THẾ GIỚI "lún xuống dưới mặt nhìn thấy": render từ trên xuống (camera trực giao) với vật liệu thay thế chỉ giữ mảnh nằm
// cao hơn mặt đứng va chạm (groundAt) 0,06–1,0 m → ảnh = mặt cao nhất trong dải đó. Gom vùng liền nhau, bỏ ô bị vật cản (box/circle/seg) chiếm.
(async()=>{ const q=__qc, W=q.W, T=W.THREE, R=q.renderer, S=1.0, X0=-340, X1=660, Z0=-360, Z1=320, NX=Math.round((X1-X0)/S), NZ=Math.round((Z1-Z0)/S);
  const t0=performance.now(); const g=new Float32Array(NX*NZ);
  for(let j=0;j<NZ;j++){ const z=Z0+(j+.5)*S; for(let i=0;i<NX;i++){ const x=X0+(i+.5)*S; let h=W.groundAt(x,z); if(!(h>-50)) h=-50; g[j*NX+i]=h; } }
  const tG=performance.now()-t0;
  const gTex=new T.DataTexture(g,NX,NZ,T.RedFormat,T.FloatType); gTex.minFilter=gTex.magFilter=T.NearestFilter; gTex.needsUpdate=true;
  const mat=new T.ShaderMaterial({uniforms:{gT:{value:gTex}, B:{value:new T.Vector4(X0,Z0,X1-X0,Z1-Z0)}}, side:T.DoubleSide,
    vertexShader:`varying vec3 wp; void main(){ vec4 w=modelMatrix*vec4(position,1.);
#ifdef USE_INSTANCING
 w=modelMatrix*instanceMatrix*vec4(position,1.);
#endif
 wp=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader:`uniform sampler2D gT; uniform vec4 B; varying vec3 wp; void main(){ vec2 uv=(wp.xz-B.xy)/B.zw; float gy=texture2D(gT,uv).r; float dh=wp.y-gy; if(dh<.06||dh>2.4) discard; gl_FragColor=vec4(dh,wp.y,0.,1.); }`});
  // chỉ giữ mesh tĩnh, đặc (bỏ người, xe, nước, cỏ/cây instanced, lá alpha, trong suốt, shader riêng, mặt đất)
  const hidden=[]; q.scene.traverse(o=>{ if(!o.isMesh&&!o.isPoints&&!o.isLine&&!o.isSprite) return; let dyn=false; for(let p=o;p;p=p.parent) if(p.userData&&(p.userData.dynamic||p.userData.wheels||p.userData.shadowProxy)) dyn=true;
    const m=o.material, bad=!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||dyn||!m||Array.isArray(m)&&false||(m.transparent)||(m.alphaTest>0)||m.isShaderMaterial||m.isRawShaderMaterial||!o.visible;
    if(bad && o.visible){ o.visible=false; hidden.push(o); } });
  const rt=new T.WebGLRenderTarget(NX,NZ,{type:T.FloatType, format:T.RGBAFormat, depthBuffer:true}), cam=new T.OrthographicCamera(X0,X1,-Z0,-Z1,1,3000); cam.position.set(0,1500,0); cam.rotation.set(-Math.PI/2,0,0); cam.updateMatrixWorld(true);
  const oldO=q.scene.overrideMaterial, oldBg=q.scene.background, oldFog=q.scene.fog; q.scene.overrideMaterial=mat; q.scene.background=null; q.scene.fog=null;
  const cc=R.getClearColor(new T.Color()), ca=R.getClearAlpha(); R.setRenderTarget(rt); R.setClearColor(0x000000,0); R.clear(); R.render(q.scene,cam); R.setRenderTarget(null); R.setClearColor(cc,ca);
  q.scene.overrideMaterial=oldO; q.scene.background=oldBg; q.scene.fog=oldFog; for(const o of hidden) o.visible=true;
  const px=new Float32Array(NX*NZ*4); R.readRenderTargetPixels(rt,0,0,NX,NZ,px); rt.dispose(); gTex.dispose(); mat.dispose();
  // ô bị vật cản chiếm (ở độ cao mặt đất)
  const blk=new Uint8Array(NX*NZ), mark=(x0,x1,z0,z1)=>{ for(let j=Math.max(0,Math.floor((z0-Z0)/S));j<=Math.min(NZ-1,Math.floor((z1-Z0)/S));j++) for(let i=Math.max(0,Math.floor((x0-X0)/S));i<=Math.min(NX-1,Math.floor((x1-X0)/S));i++) blk[j*NX+i]=1; };
  for(const b of W.boxes){ if(b.y0!==undefined && b.y0>1.5) continue; mark(b.x0,b.x1,b.z0,b.z1); }
  for(const c of W.circles){ if(c.y0!==undefined && c.y0>1.5) continue; mark(c.x-c.r,c.x+c.r,c.z-c.r,c.z+c.r); }
  for(const s of (W.SEGS||[])){ if(s.y0!==undefined && s.y0>1.5) continue; const L=Math.hypot(s.bx-s.ax,s.bz-s.az); for(let t=0;t<=L;t+=.5){ const x=s.ax+(s.bx-s.ax)*t/(L||1), z=s.az+(s.bz-s.az)*t/(L||1); mark(x-s.r,x+s.r,z-s.r,z+s.r); } }
  // ảnh: hàng 0 = đáy ảnh = z lớn nhất (Z1)
  const dh=new Float32Array(NX*NZ); for(let r=0;r<NZ;r++){ const j=NZ-1-r; for(let i=0;i<NX;i++){ const k=(r*NX+i)*4; if(px[k+3]>0) dh[j*NX+i]=px[k]; } }
  const seen=new Uint8Array(NX*NZ), out=[]; const st=[];
  for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const id=j*NX+i; if(seen[id]||dh[id]<=0||blk[id]) continue; let n=0, sum=0, mx=0, i0=i,i1=i,j0=j,j1=j; st.length=0; st.push(id); seen[id]=1;
    while(st.length){ const c=st.pop(), ci=c%NX, cj=(c-ci)/NX; n++; sum+=dh[c]; mx=Math.max(mx,dh[c]); i0=Math.min(i0,ci); i1=Math.max(i1,ci); j0=Math.min(j0,cj); j1=Math.max(j1,cj);
      for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=ci+di, nj=cj+dj; if(ni<0||nj<0||ni>=NX||nj>=NZ) continue; const nid=nj*NX+ni; if(seen[nid]||dh[nid]<=0||blk[nid]) continue; seen[nid]=1; st.push(nid); } }
    if(n>=8) out.push({x:[+(X0+i0*S).toFixed(0),+(X0+(i1+1)*S).toFixed(0)], z:[+(Z0+j0*S).toFixed(0),+(Z0+(j1+1)*S).toFixed(0)], m2:n, dhAvg:+(sum/n).toFixed(2), dhMax:+mx.toFixed(2), g:+g[j*NX+i].toFixed(2)}); }
  out.sort((a,b)=>b.m2-a.m2);
  return {grid:[NX,NZ], groundMs:Math.round(tG), hidden:hidden.length, zones:out.length, list:out.filter(z=>z.dhAvg>=.1).slice(0,60)}; })()
