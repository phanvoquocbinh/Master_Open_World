// QC World – nội thất toà công ty (S2.2): cảnh riêng (nhẹ máy), thang máy chọn tầng.
// • Mỗi công ty 1 mô hình: OUTSOURCE (Nhân sự, Dev, QA, Dự án) hoặc PRODUCT (thêm Sản phẩm, Sales, Marketing, Kế toán, Vận hành).
// • Mỗi phòng ban có nội thất riêng: bàn làm việc, phòng họp kính, khu đặc trưng (lab thiết bị, bảng doanh số, góc chụp ảnh…), pantry, lounge.
// • Bot là "người" đa dạng (js/people.js), làm việc + trò chuyện với nhau (bong bóng thoại luân phiên).
// • Sảnh: lễ tân, cổng quẹt thẻ, PHÒNG PHỎNG VẤN; người ngoài muốn lên tầng phải đi cùng HƯỚNG DẪN VIÊN.
// • Nhân viên: quẹt thẻ chấm công, họp Daily, bàn làm việc riêng có máy tính (js/workpc.js).
import { makePoser } from './pose.js';
import { batchStatic } from './perf.js';

export function makeInterior(W){
  const {THREE, renderPass, scene, camera, me, P, HOOK, circles, boxes, plats, INTER, mesh, box, MAT, colorMat, makeActor, makeLabel, removeLabel,
         MODELS, clipOf, toast, cam, groundAt} = W;
  const IS=new THREE.Scene(); IS.background=new THREE.Color(0x0f1520);
  const hemi=new THREE.HemisphereLight(0xfff8f0, 0x6f665c, .55); IS.add(hemi);
  const dl=new THREE.DirectionalLight(0xfff2e0, .85); dl.castShadow=true; dl.shadow.mapSize.set(W.QUAL==='low'?1024:2048, W.QUAL==='low'?1024:2048);
  Object.assign(dl.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:60}); dl.shadow.bias=-.0005; dl.shadow.normalBias=.02; IS.add(dl, dl.target);
  const root=new THREE.Group(); IS.add(root);
  const RW=18, RD=12, CH=3.4, FY=.1;
  const st={b:null, idx:0, floors:[], actors:[], saved:null, talks:[], tour:false, guide:null, gate:null, myDesk:null};
  const R=Math.random, pick=a=>a[Math.floor(R()*a.length)], hs=s=>[...String(s)].reduce((h,ch)=>(h*31+ch.codePointAt(0))>>>0, 7);
  const fade=document.createElement('div'); fade.style.cssText='position:fixed;inset:0;background:#05080d;opacity:0;pointer-events:none;transition:opacity .28s;z-index:45'; document.body.appendChild(fade);
  const PEOPLE=()=>W.people;

  /* ============================== TEXTURE ============================== */
  const ct=(w,h,draw,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } return t; };
  const hex=c=>'#'+c.toString(16).padStart(6,'0');
  const TEX={
    marble:ct(512,512,(g,w,h)=>{ g.fillStyle='#ecebe7'; g.fillRect(0,0,w,h); for(let i=0;i<40;i++){ g.strokeStyle=`rgba(120,120,125,${.08+R()*.18})`; g.lineWidth=.5+R()*2; g.beginPath(); let x=R()*w,y=R()*h; g.moveTo(x,y); for(let k=0;k<8;k++){ x+=R()*80-40; y+=R()*80-40; g.lineTo(x,y); } g.stroke(); } g.strokeStyle='rgba(0,0,0,.08)'; for(let i=0;i<=4;i++){ g.strokeRect(0,i*128,w,0); g.strokeRect(i*128,0,0,h); } },[9,6]),
    tile:ct(256,256,(g,w,h)=>{ for(let y=0;y<4;y++) for(let x=0;x<4;x++){ const v=(x+y)%2?222:206; g.fillStyle=`rgb(${v},${v-6},${v-18})`; g.fillRect(x*64,y*64,64,64); } g.strokeStyle='rgba(0,0,0,.12)'; for(let i=0;i<=4;i++){ g.strokeRect(i*64,0,0,h); g.strokeRect(0,i*64,w,0); } },[10,7]),
    sky:{}, carpet:{}, scr:{}, mat:{},
  };
  function carpetOf(col){ if(TEX.carpet[col]) return TEX.carpet[col]; const c=new THREE.Color(col);
    return TEX.carpet[col]=ct(256,256,(g,w,h)=>{ g.fillStyle=hex(col); g.fillRect(0,0,w,h); for(let i=0;i<9000;i++){ const k=.8+R()*.4; g.fillStyle=`rgba(${c.r*255*k|0},${c.g*255*k|0},${c.b*255*k|0},.55)`; g.fillRect(R()*w,R()*h,1.5,1.5); }
      g.strokeStyle='rgba(0,0,0,.12)'; g.strokeRect(0,0,w,h); },[12,8]); }
  // màn hình máy tính theo nghề
  function drawScr(kind, g, w, h){ const s=w/256; g.save(); g.scale(s,s); const H=h/s, dark=['code','test','dash'].includes(kind);
    g.fillStyle=dark?'#1e1e2e':'#f7f9fc'; g.fillRect(0,0,256,H);
    const bar=(c)=>{ g.fillStyle=c; g.fillRect(0,0,256,14); };
    switch(kind){
      case 'code': case 'test': { const cols=['#c792ea','#82aaff','#c3e88d','#f78c6c','#89ddff','#d6deeb']; for(let i=0;i<13;i++){ let x=8+(i%4?14:0)*(R()<.5?1:2); for(let j=0;j<1+R()*4;j++){ const ww=12+R()*50; g.fillStyle=pick(cols); g.fillRect(x,8+i*10,ww,5); x+=ww+6; } }
        if(kind==='test'){ g.fillStyle='#46d39a'; g.fillRect(0,H-22,256,22); g.fillStyle='#0b1424'; g.font='bold 13px monospace'; g.fillText('✓ 128 passed  ✗ 2 failed',8,H-7); } break; }
      case 'kanban': bar('#e8edf4'); for(let c=0;c<3;c++){ g.fillStyle='#dfe6f0'; g.fillRect(8+c*82,22,76,H-28); for(let i=0;i<4;i++){ g.fillStyle=['#ffe066','#9be89b','#ff9ec7','#9ad7ff'][(i+c)%4]; g.fillRect(12+c*82,28+i*30,68,24); } } break;
      case 'chart': bar('#2f6fd0'); g.strokeStyle='#ff8a00'; g.lineWidth=3; g.beginPath(); for(let x=0;x<256;x+=16){ const y=H-30-x*.25-R()*18; x?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); for(let i=0;i<10;i++){ g.fillStyle=i%2?'#4fc3ff':'#46d39a'; const bh=20+R()*60; g.fillRect(12+i*24,H-8-bh,14,bh); } break;
      case 'sheet': bar('#1d6f42'); g.strokeStyle='#d6dde5'; for(let y=22;y<H;y+=11){ g.beginPath(); g.moveTo(0,y); g.lineTo(256,y); g.stroke(); } for(let x=0;x<256;x+=42){ g.beginPath(); g.moveTo(x,14); g.lineTo(x,H); g.stroke(); }
        g.fillStyle='#333'; g.font='8px monospace'; for(let y=31;y<H;y+=11) for(let x=4;x<256;x+=42) g.fillText((R()*99999|0).toLocaleString('vi-VN'),x,y); break;
      case 'crm': bar('#7a3fd0'); ['Mới','Báo giá','Đàm phán','Chốt'].forEach((t,c)=>{ g.fillStyle='#eef0f7'; g.fillRect(6+c*63,20,58,H-26); g.fillStyle='#555'; g.font='bold 9px sans-serif'; g.fillText(t,10+c*63,31); for(let i=0;i<3-(c>>1);i++){ g.fillStyle=['#ffd9a0','#c9e7ff','#d9f5d0'][i%3]; g.fillRect(9+c*63,36+i*34,52,28); g.fillStyle='#2e7d4f'; g.fillText((R()*900+100|0)+'tr',13+c*63,56+i*34); } }); break;
      case 'dash': for(let i=0;i<4;i++){ const x=6+(i%2)*126, y=6+(i>>1)*((H-12)/2); g.fillStyle='#262a3e'; g.fillRect(x,y,120,(H-18)/2); g.strokeStyle=['#46d39a','#4fc3ff','#ffb547','#ff6b81'][i]; g.lineWidth=2; g.beginPath(); for(let k=0;k<12;k++){ const yy=y+(H-18)/2-8-R()*((H-18)/2-16); k?g.lineTo(x+6+k*10,yy):g.moveTo(x+6,yy); } g.stroke();
          g.fillStyle=R()<.8?'#46d39a':'#ff5a6e'; g.beginPath(); g.arc(x+110,y+10,4,0,7); g.fill(); } break;
      case 'design': bar('#ff8fc2'); g.strokeStyle='#9aa6b8'; g.lineWidth=2; g.strokeRect(14,22,108,H-34); g.strokeRect(134,22,108,H-34); for(const ox of [14,134]){ g.fillStyle='#e5e9f0'; g.fillRect(ox+8,30,92,40); g.strokeStyle='#c0c8d4'; g.beginPath(); g.moveTo(ox+8,30); g.lineTo(ox+100,70); g.moveTo(ox+100,30); g.lineTo(ox+8,70); g.stroke();
          g.fillStyle='#cfd6e0'; for(let i=0;i<4;i++) g.fillRect(ox+8,80+i*10,60+R()*30,5); g.fillStyle='#2f6fd0'; g.fillRect(ox+8,H-30,44,12); } break;
      case 'mail': bar('#0f6cbd'); for(let i=0;i<9;i++){ const y=20+i*15; g.fillStyle=i===1?'#dbe9fb':'#fff'; g.fillRect(0,y,256,14); g.fillStyle='#222'; g.font=(i<3?'bold ':'')+'9px sans-serif'; g.fillText(pick(['PM Hằng','Khách hàng','HR','Team Lead','Kế toán','Jira']),6,y+10); g.fillStyle='#777'; g.fillRect(80,y+5,100+R()*60,4); } break;
      case 'gantt': bar('#ff9a3c'); for(let i=0;i<9;i++){ g.fillStyle='#f0f2f6'; g.fillRect(0,20+i*14,256,12); g.fillStyle=['#4fc3ff','#46d39a','#ffb547','#ff6b81','#9b8cff'][i%5]; const x=40+R()*120; g.fillRect(x,22+i*14,30+R()*70,8); } break;
    }
    g.restore(); }
  const scrTex=k=>TEX.scr[k]||(TEX.scr[k]=ct(256,160,(g,w,h)=>drawScr(k,g,w,h)));
  const scrMat=k=>TEX.mat['s'+k]||(TEX.mat['s'+k]=new THREE.MeshStandardMaterial({map:scrTex(k), emissive:0xffffff, emissiveMap:scrTex(k), emissiveIntensity:.85}));
  // bảng lớn: tiêu đề + nội dung (dùng lại hình màn hình)
  function boardTex(kind, title, col=0x2f6fd0, sub=''){ return ct(512,320,(g,w,h)=>{ g.fillStyle='#fbfbfa'; g.fillRect(0,0,w,h); g.fillStyle=hex(col); g.fillRect(0,0,w,46); g.fillStyle='#fff'; g.font='800 26px "Segoe UI",sans-serif'; g.fillText(title,16,32);
      if(sub){ g.fillStyle='#5b6474'; g.font='500 16px "Segoe UI",sans-serif'; g.fillText(sub,16,70); }
      const c=document.createElement('canvas'); c.width=480; c.height=230; drawScr(kind, c.getContext('2d'), 480, 230); g.drawImage(c,16,sub?80:60,480,sub?226:246); }); }
  function posterTex(t1, t2, col=0x1b2233, bg='#ffffff'){ return ct(512,256,(g,w,h)=>{ g.fillStyle=bg; g.fillRect(0,0,w,h); g.fillStyle=hex(col); g.fillRect(0,0,14,h); g.fillStyle=hex(col); let fs=54; g.font=`800 ${fs}px "Segoe UI",sans-serif`; while(g.measureText(t1).width>w-60 && fs>20){ fs-=4; g.font=`800 ${fs}px "Segoe UI",sans-serif`; } g.fillText(t1,36,h/2-6);
      if(t2){ g.fillStyle='#5b6474'; g.font='500 26px "Segoe UI",sans-serif'; g.fillText(t2,38,h/2+40); } }); }
  const ART=[0,1,2,3,4,5].map(k=>ct(256,320,(g,w,h)=>{ const pal=[['#f2e8cf','#386641','#6a994e','#bc4749'],['#edf2f4','#2b2d42','#8d99ae','#ef233c'],['#fefae0','#283618','#dda15e','#bc6c25'],['#f8f9fa','#003049','#f77f00','#fcbf49'],['#fff1e6','#6d597a','#b56576','#e56b6f'],['#eef4ed','#134074','#13315c','#8da9c4']][k];
      g.fillStyle=pal[0]; g.fillRect(0,0,w,h); for(let i=0;i<7;i++){ g.fillStyle=pal[1+i%3]; g.globalAlpha=.75; if(i%2){ g.beginPath(); g.arc(R()*w,R()*h,20+R()*70,0,7); g.fill(); } else g.fillRect(R()*w*.7,R()*h*.7,30+R()*120,20+R()*90); } g.globalAlpha=1; g.strokeStyle='#2a2a2a'; g.lineWidth=14; g.strokeRect(0,0,w,h); }));
  function skyline(night){ const k=night?'n':'d'; if(TEX.sky[k]) return TEX.sky[k];
    return TEX.sky[k]=ct(2048,512,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); if(night){ gr.addColorStop(0,'#071022'); gr.addColorStop(1,'#1d2b4f'); } else { gr.addColorStop(0,'#8ec8f2'); gr.addColorStop(1,'#e8f3fb'); } g.fillStyle=gr; g.fillRect(0,0,w,h);
      for(let layer=0;layer<3;layer++){ let x=0; while(x<w){ const bw=40+R()*110, bh=(.25+R()*.55)*h*(1-layer*.2), y=h-bh+layer*40; const v=night?18+layer*10:120+layer*40;
          g.fillStyle=night?`rgb(${v},${v+6},${v+20})`:`rgb(${v-30},${v-10},${v+10})`; g.fillRect(x,y,bw,h-y);
          for(let yy=y+8;yy<h-6;yy+=14) for(let xx=x+6;xx<x+bw-8;xx+=12){ if(night ? R()<.35 : R()<.15){ g.fillStyle=night?(R()<.7?'#ffd99a':'#cfe6ff'):'rgba(255,255,255,.35)'; g.fillRect(xx,yy,6,8); } }
          x+=bw+2+R()*12; } } }); }

  /* ============================== TIỆN ÍCH DỰNG ============================== */
  const wallM=colorMat(0xd9d4ca,{roughness:.85}), darkM=colorMat(0x2b2f36,{roughness:.6}), whiteM=colorMat(0xf6f6f4,{roughness:.5}), woodM=MAT.wood;
  const steel=new THREE.MeshStandardMaterial({color:0xb8bec6, metalness:.9, roughness:.25});
  const panelM=new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xfff6e6, emissiveIntensity:1.1});
  const glassM=new THREE.MeshPhysicalMaterial({color:0xcfe8ff, transparent:true, opacity:.22, roughness:.05, metalness:0, side:THREE.DoubleSide, depthWrite:false});
  const M=(geo,mat,x,y,z,parent=root)=>mesh(geo,mat,x,y,z,parent);
  const solid=(x0,x1,z0,z1)=>boxes.push({x0,x1,z0,z1});
  const texMat=t=>new THREE.MeshStandardMaterial({map:t, roughness:.55});
  // tấm phẳng có hình (tranh, poster, bảng) – rotY: 0 = nhìn về +z
  function plate(tex, w, h, x, y, z, rotY=0, glow=0){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h), glow ? new THREE.MeshStandardMaterial({map:tex, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:glow}) : texMat(tex)); m.position.set(x,y,z); m.rotation.y=rotY; m.receiveShadow=true; root.add(m); return m; }
  function frame(tex, w, h, x, y, z, rotY=0){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rotY; root.add(g); M(box(w+.1,h+.1,.04), darkM, 0,0,0, g); const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h), texMat(tex)); p.position.z=.025; g.add(p); return g; }
  function stand(tex, w, h, x, z, rotY=0){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotY; root.add(g);   // bảng trắng đứng
    M(box(w,h,.05), whiteM, 0,FY+1.0+h/2,0, g); const p=new THREE.Mesh(new THREE.PlaneGeometry(w-.08,h-.08), texMat(tex)); p.position.set(0,FY+1.0+h/2,.03); g.add(p);
    for(const s of [-1,1]){ M(box(.05,1.05+h,.05), steel, s*(w/2-.05),FY+(1.05+h)/2,-.02, g); M(box(.05,.03,.6), steel, s*(w/2-.05),FY+.03,0, g); }
    const c=Math.abs(Math.cos(rotY)), s=Math.abs(Math.sin(rotY)); boxes.push({x0:x-c*w/2-s*.3, x1:x+c*w/2+s*.3, z0:z-s*w/2-c*.3, z1:z+s*w/2+c*.3}); }
  function shell(kind, b, fl, D){
    const fm = kind==='lobby' ? new THREE.MeshStandardMaterial({map:TEX.marble, roughness:.12, metalness:.05, envMapIntensity:.8})
             : kind==='canteen' ? new THREE.MeshStandardMaterial({map:TEX.tile, roughness:.35})
             : kind==='director' ? new THREE.MeshStandardMaterial({map:(()=>{ const t=woodM.map.clone(); t.repeat.set(8,6); t.needsUpdate=true; return t; })(), normalMap:woodM.normalMap, roughness:.5})
             : new THREE.MeshStandardMaterial({map:carpetOf(D?D.carpet:0x4a5566), roughness:1});
    const f=M(box(RW*2,.2,RD*2), fm, 0,FY-.1,0); f.castShadow=false;
    const ce=M(box(RW*2,.2,RD*2), whiteM, 0,FY+CH+.1,0); ce.castShadow=false;
    for(let x=-RW+3;x<RW;x+=4) for(let z=-RD+2.5;z<RD;z+=4){ const p=M(box(1.4,.04,.7), panelM, x,FY+CH-.02,z); p.castShadow=false; }
    const sky=new THREE.MeshBasicMaterial({map:skyline(W.night>.5)}); st.skyMat=sky;
    const wall=(x,z,w,d)=>{ const m=M(box(w,CH,d), wallM, x,FY+CH/2,z); m.castShadow=false; };
    wall(0,-RD-.1,RW*2,.2);
    if(D){ const acc=M(box(RW*2,.12,.06), colorMat(D.accent,{roughness:.5}), 0,FY+CH-.35,-RD+.04); acc.castShadow=false; }   // viền màu phòng ban
    const band=(cx,cz,len,rotY)=>{ const g=new THREE.Group(); g.position.set(cx,0,cz); g.rotation.y=rotY; root.add(g);
      M(box(len,.9,.2), wallM, 0,FY+.45,0, g).castShadow=false; M(box(len,.45,.2), wallM, 0,FY+CH-.22,0, g).castShadow=false;
      const v=new THREE.Mesh(new THREE.PlaneGeometry(len,CH-1.35), sky); v.position.set(0,FY+.9+(CH-1.35)/2,-.6); g.add(v);
      for(let x=-len/2;x<=len/2+.01;x+=2.4) M(box(.08,CH-1.35,.1), darkM, x,FY+.9+(CH-1.35)/2,.02, g);
      M(box(len,.06,.16), darkM, 0,FY+.9,.02, g); };
    if(kind!=='lobby') band(0,RD+.1,RW*2,Math.PI); band(-RW-.1,0,RD*2,Math.PI/2); band(RW+.1,0,RD*2,-Math.PI/2);
    if(kind==='lobby'){ // mặt tiền kính + cửa ra
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(RW*2,CH), new THREE.MeshPhysicalMaterial({color:0xbfdcf5, transparent:true, opacity:.35, roughness:.05, side:THREE.DoubleSide})); gl.position.set(0,FY+CH/2,RD+.1); root.add(gl);
      const out=new THREE.Mesh(new THREE.PlaneGeometry(RW*2.4,CH*1.6), sky); out.position.set(0,FY+CH/2,RD+3); out.rotation.y=Math.PI; root.add(out);
      for(let x=-RW;x<=RW;x+=3) M(box(.1,CH,.12), darkM, x,FY+CH/2,RD+.1);
      M(box(3,2.6,.08), steel, 0,FY+1.3,RD+.05);
      INTER.push({x:0, z:RD-1.4, r:1.6, label:'🚪 Ra ngoài phố', action:()=>exit()});
    }
    solid(-RW-2,RW+2,-RD-2,-RD+.15); solid(-RW-2,RW+2,RD-.15,RD+2); solid(-RW-2,-RW+.15,-RD-2,RD+2); solid(RW-.15,RW+2,-RD-2,RD+2);
    plats.push({t:'r', x:0, z:0, c:1, s:0, hw:RW, hd:RD, h:FY});
    // thang máy
    for(const s of [-1,1]){ M(box(1.5,2.5,.12), steel, s*1.65,FY+1.25,-RD+.08); M(box(1.8,2.8,.1), darkM, s*1.65,FY+1.4,-RD+.03); }
    const ind=ct(256,64,(g,w,h)=>{ g.fillStyle='#0b0f14'; g.fillRect(0,0,w,h); g.fillStyle='#ff9a3c'; g.font='bold 44px monospace'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(`▲ ${fl.n}`,w/2,h/2+2); });
    M(box(1.2,.3,.05), new THREE.MeshStandardMaterial({map:ind, emissive:0xffffff, emissiveMap:ind, emissiveIntensity:1}), 0,FY+2.75,-RD+.12);
    M(box(.18,.36,.05), steel, 0,FY+1.2,-RD+.12);
    INTER.push({x:0, z:-RD+1.7, r:1.7, label:'🛗 Thang máy · chọn tầng', action:()=>elevatorMenu()});
    // biển tên tầng
    const pl=ct(1024,160,(g,w,h)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); g.fillStyle=hex(D?D.accent:b.color); g.fillRect(0,0,22,h); g.fillStyle='#1b2233'; g.font='800 64px "Segoe UI",sans-serif'; g.textBaseline='middle'; g.fillText(`${b.short} · Tầng ${fl.n}`,50,h/2-24); g.font='500 44px "Segoe UI",sans-serif'; g.fillStyle='#5b6474'; g.fillText(fl.name,50,h/2+36); });
    M(box(4.2,.66,.05), new THREE.MeshStandardMaterial({map:pl, roughness:.5}), -5.2,FY+2.2,-RD+.12);
  }
  /* ---------- S16: MỖI CÔNG TY MỘT KIỂU ---------- */
  // phong cách: màu tường, mặt bàn, góc vui chơi · bố cục bàn: hàng / cụm 4 / bàn dài + dải cây / vòng quanh sofa tròn / SÀN CHUNG 2 phòng ban
  const THEMES=[{wall:0xd9d4ca, top:'white', fun:'pingpong'},{wall:0xe6dccb, top:'wood', fun:'beanbag'},{wall:0xcfdbe3, top:'white', fun:'arcade'},{wall:0xe3e8dc, top:'wood', fun:'garden'},{wall:0xe8e1ef, top:'dark', fun:'hammock'},{wall:0xf0e6d8, top:'wood', fun:'pingpong'}];
  const darkTopM=colorMat(0x2b2f36,{roughness:.4}); let curTheme=THEMES[0];
  const deskTop=()=>curTheme.top==='wood'?woodM:curTheme.top==='dark'?darkTopM:whiteM;
  const themeOf=b=>THEMES[hs(b.name)%THEMES.length];
  const LAYOUTS=['rows','pods','bench','hub','shared'];
  const layoutOf=(b,fl)=>LAYOUTS[(hs(b.name)+fl.n*3)%LAYOUTS.length];
  // khu bàn trong dải x0..x1, 2 băng (Bắc z≈-6.4, Nam z≈3.6) – lối đi giữa z≈-1 giữ nguyên
  function deskArea(lay, D, desks, x0, x1, bands=[-6.4,3.4]){ let n=0; const key=()=>D.scr[(n++)%D.scr.length];
    const pod=(cx,cz)=>{ for(const dx of [-.78,.78]){ desk(cx+dx,cz-.4,1,key(),D.dual&&R()<.4); desks.push({x:cx+dx, z:cz-1.15, h:0}); desk(cx+dx,cz+.4,-1,key(),D.dual&&R()<.4); desks.push({x:cx+dx, z:cz+1.15, h:Math.PI}); }
      M(box(3.1,.4,.04), colorMat(D.accent,{roughness:.9}), cx,FY+.98,cz); solid(cx-1.6,cx+1.6,cz-.8,cz+.8); };
    if(lay==='rows'){ for(const [zd,f] of [[-7.2,1],[-5.6,-1],[2.6,1],[4.2,-1]]) for(let x=x0+.9;x<=x1-.7;x+=2.1){ desk(x,zd,f,key(),D.dual && R()<.5); desks.push({x, z:zd-f*.75, h:f>0?0:Math.PI}); }
      for(const z of [-6.4,3.4]) M(box(x1-x0-.8,.45,.05), colorMat(D.accent,{roughness:.9}), (x0+x1)/2,FY+.98,z); solid(x0,x1,-8.2,-4.6); solid(x0,x1,1.6,5.2); }
    else if(lay==='pods' || lay==='shared'){ const w=x1-x0, k=Math.max(1,Math.floor(w/4.2)); for(let i=0;i<k;i++){ const cx=x0+w*(i+.5)/k; for(const cz of bands) pod(cx,cz); } }
    else if(lay==='bench'){ for(const cz of [-6.4,3.4]){ for(let x=x0+1;x<=x1-.8;x+=1.6){ desk(x,cz-.4,1,key()); desks.push({x, z:cz-1.15, h:0}); desk(x,cz+.4,-1,key()); desks.push({x, z:cz+1.15, h:Math.PI}); }
        M(box(x1-x0-1,.35,.3), colorMat(0x6b4a2e,{roughness:.8}), (x0+x1)/2,FY+.95,cz); for(let x=x0+1.2;x<x1-.6;x+=.9) M(new THREE.IcosahedronGeometry(.22,0), colorMat(0x3f8f3a,{roughness:.9}), x,FY+1.25,cz); solid(x0+.2,x1-.2,cz-.8,cz+.8); } }
    else if(lay==='hub'){ const cx=(x0+x1)/2, cz=-6.4; M(new THREE.CylinderGeometry(1.2,1.2,.45,24), colorMat(0x6b4a2e,{roughness:.8}), cx,FY+.23,cz); M(new THREE.IcosahedronGeometry(.9,1), colorMat(0x3f8f3a,{roughness:.9}), cx,FY+1.1,cz); circles.push({x:cx, z:cz, r:1.3});
      for(let i=0;i<6;i++){ const a=i/6*Math.PI*2, r=2.9, x=cx+Math.cos(a)*r, z=cz+Math.sin(a)*r*.55; const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=Math.atan2(cx-x, cz-z)+Math.PI; root.add(g);
        M(box(1.4,.05,.7), deskTop(), 0,FY+.74,0, g); M(box(.62,.38,.03), darkM, 0,FY+1.05,-.22, g); const sc=new THREE.Mesh(new THREE.PlaneGeometry(.58,.34), scrMat(key())); sc.position.set(0,FY+1.05,-.2); g.add(sc); circles.push({x, z, r:.55});
        const ox=x+Math.sin(g.rotation.y)*.8, oz=z+Math.cos(g.rotation.y)*.8; chair(ox,oz,g.rotation.y+Math.PI, darkM, false); desks.push({x:ox, z:oz, h:g.rotation.y+Math.PI}); }
      const w=x1-x0, k=Math.max(1,Math.floor(w/4.2)); for(let i=0;i<k;i++) pod(x0+w*(i+.5)/k, 3.4); }
    return desks; }
  // góc vui chơi theo công ty
  function funZone(kind){ const x=-4.8, z=9.2;
    if(kind==='pingpong'){ M(box(2.7,.08,1.5), colorMat(0x1f6f4a,{roughness:.5}), x,FY+.76,z); M(box(.04,.16,1.5), colorMat(0xffffff), x,FY+.86,z); for(const sx of [-1,1]) for(const sz of [-1,1]) M(box(.06,.74,.06), steel, x+sx*1.2,FY+.37,z+sz*.6); solid(x-1.4,x+1.4,z-.8,z+.8); }
    else if(kind==='beanbag'){ for(let i=0;i<4;i++){ const bx=x-1.6+i*1.1, bz=z+(i%2?.5:-.3); const bb=M(new THREE.SphereGeometry(.45,14,10), colorMat([0xff7b29,0x4fc3ff,0xf2c230,0xff5a8a][i],{roughness:.95}), bx,FY+.32,bz); bb.scale.set(1,.65,1); seat(bx,bz,Math.PI,FY+.38,{label:'🫘 Ngồi ghế lười (E · C)'}); } }
    else if(kind==='arcade'){ for(let i=0;i<2;i++){ const ax=x-.8+i*1.3; M(box(.9,1.8,.8), colorMat([0x7a3fd0,0xd94141][i],{roughness:.5}), ax,FY+.9,z+.4); const s=new THREE.Mesh(new THREE.PlaneGeometry(.66,.5), new THREE.MeshStandardMaterial({color:0x111111, emissive:[0x46d39a,0x4fc3ff][i], emissiveIntensity:.9})); s.position.set(ax,FY+1.35,z-.02); s.rotation.y=Math.PI; root.add(s); } solid(x-1.3,x+1.6,z,z+.8); }
    else if(kind==='garden'){ M(box(4,2.6,.15), colorMat(0x2f7a35,{roughness:1}), x,FY+1.3,z+1.4); for(let i=0;i<14;i++) M(new THREE.IcosahedronGeometry(.18+R()*.12,0), colorMat(pick([0x3f8f3a,0x4caf50,0x2e7d32]),{roughness:1}), x-1.8+R()*3.6,FY+.3+R()*2.3,z+1.3); solid(x-2,x+2,z+1.3,z+1.5); }
    else if(kind==='hammock'){ for(const sx of [-1,1]) M(box(.12,1.8,.12), woodM, x+sx*1.5,FY+.9,z); const h=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,2.6,12,1,true,Math.PI*1.1,Math.PI*.8), colorMat(0xff8fc2,{roughness:.9})); h.material.side=THREE.DoubleSide; h.rotation.z=Math.PI/2; h.position.set(x,FY+.95,z); root.add(h); seat(x,z,0,FY+.8,{r:1.4, label:'🛌 Nằm võng nghỉ trưa (E · C)'}); circles.push({x:x-1.5,z,r:.2},{x:x+1.5,z,r:.2}); }
    const sg=posterTex({pingpong:'🏓 Góc bóng bàn',beanbag:'🫘 Góc thư giãn',arcade:'🕹️ Góc game',garden:'🌿 Vườn trong nhà',hammock:'😴 Góc ngủ trưa'}[kind]||'🎈 Góc vui', 'Làm hết sức · chơi hết mình', 0x2f6fd0); plate(sg,1.6,.8, x,FY+2.5,RD-.12,Math.PI); }
  function plant(x,z,s=1){ M(new THREE.CylinderGeometry(.28*s,.22*s,.5*s,12), colorMat(0xe9e5dc), x,FY+.25*s,z); const lf=colorMat(0x3f8f3a,{roughness:.8});
    for(let i=0;i<6;i++){ const l=M(new THREE.SphereGeometry(.28*s,8,6), lf, x+(R()-.5)*.35*s, FY+.65*s+R()*.5*s, z+(R()-.5)*.35*s); l.scale.y=1.4; } circles.push({x,z,r:.35*s}); }
  const seat=(x,z,rot,y,o={})=>W.addSeat && W.addSeat({x, z, rot, y, floor:FY, scope:'interior', label:'🪑 Ngồi (E · C)', ...o});
  function chair(x,z,rotY, mat=darkM, sit=true){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotY; root.add(g);
    M(box(.5,.08,.5), mat, 0,FY+.47,0, g); M(box(.5,.55,.06), mat, 0,FY+.78,-.24, g); M(new THREE.CylinderGeometry(.03,.03,.42,6), steel, 0,FY+.23,0, g); M(new THREE.CylinderGeometry(.26,.26,.03,12), steel, 0,FY+.02,0, g);
    if(sit) return seat(x+Math.sin(rotY)*.04, z+Math.cos(rotY)*.04, rotY, FY+.51, {label:'🪑 Ngồi ghế (E · C)'}); }
  function desk(x,z,f,key='code', dual=false){ M(box(1.5,.05,.75), deskTop(), x,FY+.74,z); for(const sx of [-.7,.7]) M(box(.04,.72,.7), steel, x+sx,FY+.37,z);
    for(const ox of dual?[-.34,.34]:[0]){ M(box(.62,.38,.03), darkM, x+ox,FY+1.05,z+f*.22); const s=new THREE.Mesh(new THREE.PlaneGeometry(.58,.34), scrMat(dual&&ox>0?'mail':key)); s.position.set(x+ox,FY+1.05,z+f*.205); s.rotation.y=f>0?Math.PI:0; root.add(s); M(box(.06,.18,.06), darkM, x+ox,FY+.84,z+f*.24); }
    M(box(.42,.02,.14), darkM, x,FY+.77,z-f*.08); if(R()<.3) M(new THREE.CylinderGeometry(.04,.035,.1,10), colorMat(pick([0xffffff,0xd94848,0x2f6fd0])), x+.55,FY+.82,z-f*.15); chair(x, z-f*.75, f>0?0:Math.PI, darkM, false); }
  function sofa(x,z,rotY,col,w=2.4,seats=true){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotY; root.add(g); const m=colorMat(col,{roughness:.9});
    M(box(w,.42,.9), m, 0,FY+.21,0, g); M(box(w,.55,.22), m, 0,FY+.6,-.36, g); for(const s of [-1,1]) M(box(.2,.6,.9), m, s*(w/2-.1),FY+.3,0, g);
    const c=Math.cos(rotY), s=Math.sin(rotY); boxes.push({x0:x-Math.abs(c)*w/2-Math.abs(s)*.5, x1:x+Math.abs(c)*w/2+Math.abs(s)*.5, z0:z-Math.abs(s)*w/2-Math.abs(c)*.5, z1:z+Math.abs(s)*w/2+Math.abs(c)*.5});
    if(seats) for(let k=-(w/2-.55);k<=w/2-.55+.01;k+=.8) seat(x+c*k+s*.08, z-s*k+c*.08, rotY, FY+.44, {r:2.2, label:'🛋️ Ngồi sofa (E · C)'}); }
  function rug(x,z,w,d,col){ const r=M(box(w,.02,d), colorMat(col,{roughness:1}), x,FY+.01,z); r.castShadow=false; }

  /* ============================== NGƯỜI TRONG TOÀ ============================== */
  const SOL=MODELS.soldier, MIC=MODELS.michelle, XB=MODELS.xbot, RB=MODELS.robot, samba=clipOf(MIC,'SambaDance');
  const KIT={ soldier:()=>({gl:SOL,h:1.76,face:Math.PI,clips:{idle:clipOf(SOL,'Idle'),walk:clipOf(SOL,'Walk')}}),
    xbot:()=>({gl:XB,h:1.78,face:0,clips:{idle:clipOf(XB,'idle'),walk:clipOf(XB,'walk'),agree:clipOf(XB,'agree')}}),
    michelle:()=>({gl:MIC,h:1.66,face:0,clips:{idle:samba&&THREE.AnimationUtils.subclip(samba,'idle',0,2,30)}}),
    robot:()=>({gl:RB,h:1.4,face:0,clips:{idle:clipOf(RB,'Idle'),walk:clipOf(RB,'Walking'),wave:clipOf(RB,'Wave')}}),
    person:(o)=>PEOPLE() ? PEOPLE().kit(o.seed ?? (R()*1e6|0), {outfit:o.outfit}) : KIT.soldier() };
  let seedK=0; const nextSeed=()=>(hs(st.b?st.b.name:'x')+(st.idx*977)+(seedK++)*7919)>>>0;
  const nameOf=s=>PEOPLE() ? PEOPLE().nameOf(s) : pick(['An','Bình','Lan','Minh','Vy']);
  function bot(name, model, x, z, face, mode='stand', extra={}){
    if(model==='person' && extra.seed==null) extra.seed=nextSeed();
    const k=KIT[model](extra); if(typeof name==='function') name=name(extra.seed);
    const a=makeActor(k.gl, {name, height:k.h, face:k.face, dot:extra.dot||'#7aa2ff', clips:k.clips, group:'interior', parent:root, compact:k.compact});
    if(k.look && k.look.width) { a.root.scale.x*=k.look.width; a.root.scale.z*=k.look.width; }
    a.play('idle',0); a.mixer.update(R()*3); const p=makePoser(THREE, a); const hh=p.hipsHeight();
    const anchor=new THREE.Object3D(); anchor.position.y=k.h+.7; a.g.add(anchor);
    const o={a, p, x, z, h:face, mode, hh, anchor, t:R()*10, lines:extra.lines||[], path:extra.path||null, wi:0, gest:0, ...extra};
    place(o); if(['stand','present','phone','cross'].includes(mode)) circles.push({x,z,r:.35});
    st.actors.push(o); return o; }
  const who=(role)=>s=>`${nameOf(s)} · ${role}`;
  function place(o){ const seated=['type','eat','sit'].includes(o.mode); o.a.g.position.set(o.x, seated ? FY+.47-o.hh+.06 : FY, o.z); o.a.g.rotation.y=o.h; }
  function sayNow(o, text, sec=4){ if(!o) return; if(o.bub) removeLabel(o.bub); o.bub=makeLabel(text, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.94)', color:'#1b2233', fade:26, group:'interior'}); o.bubT=sec; o.gest=1.4; }
  const face=(o,tx,tz)=>Math.atan2(tx-o.x, tz-o.z);
  // 2 người trò chuyện: lời thoại luân phiên [người nói (0/1), câu]
  function talk(a, b, pool){ if(a && b && pool && pool.length) st.talks.push({a, b, pool, cur:null, i:0, t:1+R()*6}); }
  // ngồi bàn + 1 đồng nghiệp đứng cạnh hỏi chuyện
  function deskChat(sitter, role, pool){ const sx=sitter.x+Math.cos(sitter.h)*.85, sz=sitter.z-Math.sin(sitter.h)*.85+(sitter.h? .3:-.3);
    const v=bot(who(role), 'person', sx, sz, 0, 'stand'); v.h=face(v, sitter.x, sitter.z); place(v); talk(sitter, v, pool); return v; }

  /* ============================== PHÒNG BAN ============================== */
  const MEET=[[[0,'Chào cả nhà, mình điểm qua tiến độ nhé.'],[1,'Bên em xong 80%, còn chờ API.'],[0,'Ok, blocker nào cần hỗ trợ không?'],[1,'Chắc cần thêm dữ liệu test ạ.']],
              [[0,'Sprint này mình ưu tiên các bug High trước.'],[1,'Đồng ý, em nhận 3 bug thanh toán.'],[0,'Nhớ cập nhật trạng thái trên Jira nha.']],
              [[0,'Khách hàng phản hồi bản demo khá tốt 👍'],[1,'Tuyệt! Có góp ý gì không anh?'],[0,'Họ muốn thêm báo cáo xuất Excel.'],[1,'Để em ước lượng effort rồi báo lại.']]];
  const PANTRY=[[[0,'Cà phê sáng nay đậm ghê ☕'],[1,'Tối qua release tới khuya hả?'],[0,'Ừ, may mà regression pass hết 😅']],
                [[0,'Trưa nay ăn gì ta?'],[1,'Xuống nhà ăn đi, hôm nay có cơm gà.'],[0,'Ok, 12h nha!']],
                [[0,'Cuối tuần team building đi biển đó.'],[1,'Thiệt hả? Đăng ký ở đâu vậy?'],[0,'Chị HR có gửi form trong nhóm chat.']]];
  const DEPTS={
    dev:{name:'Phòng Phát triển', role:'Dev', carpet:0x3e4a5c, accent:0x4fc3ff, scr:['code','code','kanban'], dual:true,
      desc:'Các bạn Dev viết code backend, frontend, review PR và deploy lên môi trường DEV/STG.', feat:'Góc server & bảng Kanban: task “To do → Doing → Done” của sprint.',
      talks:[[[0,'PR của em review giúp anh với.'],[1,'Ok, để anh xem. Unit test đủ chưa?'],[0,'Coverage 85% rồi anh.']],[[1,'Build CI đỏ rồi kìa 😱'],[0,'Do test flaky, em rerun liền.'],[1,'Nhớ báo QA khi lên STG nha.']],[[0,'API này trả 500 khi thiếu field.'],[1,'Để em thêm validate, trả 400 cho đúng.']]]},
    qa:{name:'Phòng Kiểm thử QA/QC', role:'QA', carpet:0x3f5248, accent:0x46d39a, scr:['test','code','kanban'], dual:true,
      desc:'Team QA viết test case, chạy regression, log bug và kiểm thử tự động (automation).', feat:'Lab thiết bị: điện thoại & tablet để test mobile; bảng Bug Board theo mức độ.',
      talks:[[[0,'Bug này severity High nha anh.'],[1,'Repro được chưa em?'],[0,'Được, 3/3 lần, có video luôn.'],[1,'Ok log Jira, gắn Dev phụ trách.']],[[1,'Regression đợt này pass 98%.'],[0,'Còn 2 case fail do dữ liệu test.'],[1,'Dọn data rồi chạy lại giúp anh nhé.']],[[0,'Không test trên PROD đâu nha!'],[1,'Biết rồi, mình dùng STG thôi 😄']]]},
    pmo:{name:'Phòng Dự án (PM/BA)', role:'PM', carpet:0x4b4a5e, accent:0xffb547, scr:['gantt','mail','kanban'],
      desc:'PM & BA làm việc với khách hàng, viết yêu cầu, lên kế hoạch và theo dõi tiến độ dự án.', feat:'Phòng War-room: biểu đồ Gantt các dự án đang chạy.',
      talks:[[[0,'Khách muốn đẩy deadline sớm 1 tuần.'],[1,'Vậy phải cắt bớt scope thôi chị.'],[0,'Ok, mình họp với khách chiều nay.']],[[1,'Spec màn hình thanh toán xong chưa?'],[0,'Xong rồi, em gửi QA review luôn.']]]},
    product:{name:'Phòng Sản phẩm & Thiết kế', role:'Product', carpet:0x55465e, accent:0xff8fc2, scr:['design','design','kanban'],
      desc:'Product Owner & UI/UX Designer nghiên cứu người dùng, vẽ wireframe, quyết định tính năng.', feat:'Tường thiết kế: wireframe, giấy nhớ ý tưởng, bàn thử prototype.',
      talks:[[[0,'Nút “Mua ngay” nên đổi màu nổi hơn.'],[1,'Để em làm A/B test tuần này.']],[[1,'Phỏng vấn 5 khách hàng xong rồi.'],[0,'Insight chính là gì em?'],[1,'Họ muốn thanh toán nhanh hơn.']]]},
    sales:{name:'Phòng Kinh doanh', role:'Sales', carpet:0x5e4a3a, accent:0xf2c230, scr:['crm','chart','mail'],
      desc:'Sales tìm khách hàng, báo giá, đàm phán và chốt hợp đồng.', feat:'Bảng doanh số theo tháng, tủ cúp và cái chiêng – chốt deal là đánh chiêng!',
      talks:[[[0,'Chốt được hợp đồng 2 tỷ rồi! 🎉'],[1,'Đánh chiêng đi anh ơi!'],[0,'Haha, tí đánh liền.']],[[1,'Khách chê giá cao quá.'],[0,'Nhấn mạnh chất lượng & hỗ trợ 24/7 nhé.']]]},
    marketing:{name:'Phòng Marketing', role:'Marketing', carpet:0x5a3b4f, accent:0xff5a6e, scr:['design','chart','mail'],
      desc:'Marketing lo thương hiệu, quảng cáo, mạng xã hội và sự kiện.', feat:'Góc chụp ảnh sản phẩm và moodboard chiến dịch.',
      talks:[[[0,'Bài post hôm qua được 10k like!'],[1,'Đỉnh! Tuần sau làm minigame nữa.']],[[1,'Banner sự kiện cần gấp chiều nay.'],[0,'Em gửi bản nháp trong 1 tiếng nhé.']]]},
    accounting:{name:'Phòng Kế toán – Tài chính', role:'Kế toán', carpet:0x3b4f5e, accent:0x2bb3a6, scr:['sheet','sheet','chart'],
      desc:'Kế toán lo lương, thuế, hoá đơn và báo cáo tài chính.', feat:'Tủ hồ sơ, két sắt và bảng báo cáo thu – chi.',
      talks:[[[0,'Cuối tháng rồi, chốt bảng lương nhé.'],[1,'Còn chờ chấm công phòng Dev.']],[[1,'Hoá đơn này thiếu mã số thuế.'],[0,'Để chị gọi nhà cung cấp bổ sung.']]]},
    ops:{name:'Phòng Vận hành & CSKH', role:'Vận hành', carpet:0x434d43, accent:0x9ad7ff, scr:['dash','crm','mail'],
      desc:'Vận hành theo dõi hệ thống 24/7 và chăm sóc khách hàng.', feat:'Tường màn hình giám sát: trạng thái hệ thống, đơn hàng, ticket hỗ trợ.',
      talks:[[[0,'Server thanh toán CPU 90% kìa.'],[1,'Báo DevOps scale thêm node đi.']],[[1,'Khách gọi hỏi đơn bị chậm.'],[0,'Em kiểm tra trạng thái giao hàng rồi gọi lại.']]]},
    hr:{name:'Phòng Nhân sự & Đào tạo', role:'HR', carpet:0x5b5048, accent:0xffd23f, scr:['mail','sheet','design'],
      desc:'HR tuyển dụng, đào tạo nhân viên mới và chăm lo văn hoá công ty.', feat:'Phòng đào tạo & tường văn hoá: giá trị cốt lõi của công ty.',
      talks:[[[0,'Tuần này có 3 bạn QA đi làm ngày đầu.'],[1,'Chuẩn bị thẻ nhân viên và laptop nhé.']],[[1,'Ứng viên hôm qua trả lời tốt lắm.'],[0,'Ok, gửi offer luôn em.']]]},
  };
  const PRODUCT=new Set(['Bình Phan Tech Hub','API Hub Tower','DataCheck Corp','Mobile First QA','Cloud Test Co.','DevOps Center']);
  function profileOf(b){ const product=PRODUCT.has(b.name) || b.style==='hq';
    return {product, kind:product?'Công ty sản phẩm (Product)':'Công ty gia công phần mềm (Outsource)', depts: product ? ['hr','product','dev','qa','sales','marketing','accounting','ops'] : ['hr','dev','qa','pmo']}; }
  const QA_NAME={qa:'Phòng Kiểm thử QA/QC', perf:'Phòng QA · Performance', sec:'Phòng QA · Bảo mật (Pentest)', data:'Phòng QA · Data', mobile:'Phòng QA · Mobile', dev:'Phòng Kiểm thử QA/QC'};
  function floorsOf(b){ const N=Math.max(7,Math.round(b.h/3.6)), pf=profileOf(b); const fl=[{n:1, kind:'lobby', name:'Sảnh lễ tân'}];
    pf.depts.forEach((d,i)=>{ const D=DEPTS[d]; fl.push({n:2+Math.floor(i*(N-4)/pf.depts.length), kind:'dept', dept:d, name:d==='qa'?(QA_NAME[(b.teams||[]).find(t=>t!=='qa'&&t!=='dev')]||D.name):D.name}); });
    fl.push({n:N-1, kind:'canteen', name:'Nhà ăn nhân viên'}, {n:N, kind:'director', name:'Phòng Giám đốc'}); return fl; }
  const BOSS=['Bình Vip Pro','Bình Phan','Bình Internship','Anh trai ốp pồ','Anh trai say Salary'];
  const bossOf=b=>b.name.includes('Bình Phan') ? 'Bình Phan' : BOSS[hs(b.name)%BOSS.length];
  const isEmp=b=>!!(W.work && W.work.isEmployee(b));

  /* ---------- khu đặc trưng từng phòng ban (x 5..17, z 0..7.5) ---------- */
  const FEAT={
    dev(D){ for(let i=0;i<2;i++){ M(box(.8,2.1,1), colorMat(0x1b1f27,{roughness:.4}), 15.6+i*.85,FY+1.05,1.2); for(let k=0;k<7;k++) M(box(.6,.03,.02), new THREE.MeshStandardMaterial({color:0x111111, emissive:k%3?0x46d39a:0x4fc3ff, emissiveIntensity:1.4}), 15.6+i*.85,FY+.4+k*.24,1.71); }
      solid(15,17.4,.6,1.8); stand(boardTex('kanban','📌 Sprint 24 · Kanban',D.accent),2.6,1.5, 9.5,1.2, Math.PI);
      for(const [x,z,c] of [[8.4,5.6,0xff6b81],[9.6,6.4,0x4fc3ff],[11,5.8,0xffd23f]]){ const bb=M(new THREE.SphereGeometry(.45,14,10), colorMat(c,{roughness:.95}), x,FY+.3,z); bb.scale.y=.6; seat(x,z,Math.PI,FY+.42,{r:1.6,label:'🫘 Ngồi ghế lười (E · C)'}); }
      M(box(1.6,.05,.7), woodM, 14.5,FY+1.05,5.5); for(const sx of [-.7,.7]) M(box(.06,1.03,.06), steel, 14.5+sx,FY+.52,5.5); for(const ox of [-.36,.36]){ M(box(.62,.38,.03), darkM, 14.5+ox,FY+1.38,5.3); const s=new THREE.Mesh(new THREE.PlaneGeometry(.58,.34), scrMat('code')); s.position.set(14.5+ox,FY+1.38,5.32); root.add(s); }
      solid(13.6,15.4,5.1,5.9); frame(posterTex('Code · Test · Ship','Deploy thứ 6? Không nhé 😅',D.accent),2.4,1.2, 11,FY+2.3,-2.94,0); },
    qa(D){ M(box(4,.06,1), whiteM, 12,FY+.85,1.2); for(const sx of [-1.8,1.8]) M(box(.06,.82,.9), steel, 12+sx,FY+.42,1.2); solid(9.9,14.1,.6,1.8);
      for(let i=0;i<10;i++){ const tab=i%3===0, w=tab?.24:.09, h=tab?.17:.17; const d=M(box(w,.012,h), darkM, 10.4+i*.36,FY+.89,1.2); d.rotation.y=(R()-.5)*.3; const s=new THREE.Mesh(new THREE.PlaneGeometry(w*.86,h*.86), scrMat(pick(['design','kanban','chart']))); s.rotation.x=-Math.PI/2; s.position.set(10.4+i*.36,FY+.898,1.2); root.add(s); }
      for(let r=0;r<3;r++){ M(box(2.4,.04,.4), woodM, 16.2,FY+.8+r*.5,4.2); for(let k=0;k<6;k++) M(box(.09,.17,.012), darkM, 15.2+k*.38,FY+.91+r*.5,4.2); } solid(14.9,17.5,3.9,4.5);
      stand(boardTex('kanban','🐞 BUG BOARD',0xd94848,'Critical 1 · High 3 · Medium 8 · Low 12'),2.6,1.5, 9.5,5.4, Math.PI);
      frame(posterTex('🐞 Bug Bash Friday','Ai tìm nhiều bug nhất được trà sữa!',D.accent),2.4,1.2, 11,FY+2.3,-2.94,0);
      frame(posterTex('Không test trên PROD','Mọi kiểm thử chạy trên DEV / STG',0xd94848),2.2,1.1, 15,FY+2.25,-2.94,0); },
    pmo(D){ stand(boardTex('gantt','📅 Kế hoạch dự án Q4',D.accent),3.2,1.7, 11,1.2, Math.PI); M(new THREE.CylinderGeometry(1,1,.05,24), woodM, 11,FY+.75,5); M(new THREE.CylinderGeometry(.08,.3,.72,12), steel, 11,FY+.37,5);
      for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; chair(11+Math.sin(a)*1.45,5+Math.cos(a)*1.45,a+Math.PI); } circles.push({x:11,z:5,r:1.1});
      M(box(.9,.9,.7), colorMat(0xd8d8d8), 16.4,FY+.45,1.4); M(box(.7,.1,.5), darkM, 16.4,FY+.95,1.4); solid(15.9,16.9,1,1.8);
      frame(posterTex('Đúng hạn · Đúng phạm vi','Khách hàng là trung tâm',D.accent),2.4,1.2, 11,FY+2.3,-2.94,0); },
    product(D){ stand(boardTex('design','🎨 Wireframe · App v3',D.accent),3,1.6, 10.5,1.2, Math.PI);
      const notes=ct(512,256,(g,w,h)=>{ g.fillStyle='#f4f1ea'; g.fillRect(0,0,w,h); for(let i=0;i<34;i++){ g.fillStyle=pick(['#ffe066','#9be89b','#ff9ec7','#9ad7ff','#ffb380']); g.save(); g.translate(20+(i%9)*54, 20+Math.floor(i/9)*58); g.rotate((R()-.5)*.2); g.fillRect(0,0,44,44); g.restore(); } });
      stand(notes,3,1.5, 15,1.2, Math.PI); M(box(2.4,.06,1.2), whiteM, 12.5,FY+.75,5.4); for(const sx of [-1.1,1.1]) M(box(.06,.72,1.1), steel, 12.5+sx,FY+.37,5.4); solid(11.2,13.8,4.7,6.1);
      for(let i=0;i<3;i++){ const t=M(box(.26,.012,.18), darkM, 11.8+i*.7,FY+.79,5.4); const s=new THREE.Mesh(new THREE.PlaneGeometry(.23,.15), scrMat('design')); s.rotation.x=-Math.PI/2; s.position.set(11.8+i*.7,FY+.797,5.4); root.add(s); }
      frame(posterTex('Người dùng là trên hết','Build · Measure · Learn',D.accent),2.4,1.2, 11,FY+2.3,-2.94,0); },
    sales(D){ stand(boardTex('chart','📈 Doanh số tháng 11',D.accent,'Mục tiêu: 12 tỷ · Đạt: 9,8 tỷ (82%)'),3,1.7, 10.5,1.2, Math.PI);
      const gold=new THREE.MeshStandardMaterial({color:0xd4af37, metalness:.95, roughness:.25}); M(box(2.2,1.9,.5), colorMat(0x3a2a1e), 15.6,FY+.95,1.2); const gc=new THREE.Mesh(box(2.1,1.7,.06), glassM); gc.position.set(15.6,FY+1.05,1.47); root.add(gc);
      for(let r=0;r<3;r++) for(let k=0;k<3;k++) M(new THREE.CylinderGeometry(.09,.05,.26,10), gold, 15+k*.6,FY+.45+r*.55,1.2); solid(14.4,16.8,.9,1.5);
      const fr=new THREE.Group(); fr.position.set(12,0,6); root.add(fr); M(box(.08,1.9,.08), woodM, -.8,FY+.95,0, fr); M(box(.08,1.9,.08), woodM, .8,FY+.95,0, fr); M(box(1.7,.08,.08), woodM, 0,FY+1.88,0, fr);
      const gong=M(new THREE.CylinderGeometry(.6,.6,.06,24), gold, 0,FY+1.1,0, fr); gong.rotation.x=Math.PI/2; circles.push({x:12,z:6,r:.9});
      frame(posterTex('Chốt deal = Đánh chiêng 🔔','Khách hàng hài lòng là doanh số',D.accent),2.4,1.2, 11,FY+2.3,-2.94,0); },
    marketing(D){ const bd=M(box(3,2.6,.04), colorMat(0xf1f1ee,{roughness:1}), 12.5,FY+1.3,6.6); M(box(3,.03,1.6), colorMat(0xf1f1ee,{roughness:1}), 12.5,FY+.02,5.8);
      for(const s of [-1,1]){ M(new THREE.CylinderGeometry(.02,.02,1.7,6), darkM, 12.5+s*2,FY+.85,4.6); const sb=M(box(.6,.6,.3), colorMat(0xffffff,{roughness:.3}), 12.5+s*2,FY+1.8,4.6); sb.rotation.y=s*.5; }
      solid(10.9,14.1,6.4,6.8); stand(boardTex('design','🎯 Moodboard · Chiến dịch Tết',D.accent),2.8,1.5, 9.4,1.2, Math.PI);
      sofa(16,2.6,-Math.PI/2,0xff8fc2,2.2); frame(posterTex('Sáng tạo mỗi ngày','Brand · Content · Social',D.accent),2.4,1.2, 11,FY+2.3,-2.94,0); },
    accounting(D){ for(let i=0;i<6;i++){ M(box(.6,1.4,.6), colorMat(0x7d8792,{roughness:.5,metalness:.3}), 9.2+i*.65,FY+.7,.9); for(let k=0;k<3;k++) M(box(.3,.03,.02), steel, 9.2+i*.65,FY+.35+k*.42,1.21); }
      solid(8.9,13.1,.6,1.2); M(box(.8,.9,.7), colorMat(0x3a3f47,{metalness:.6,roughness:.4}), 15.8,FY+.45,1.1); M(new THREE.CylinderGeometry(.1,.1,.05,16), steel, 15.8,FY+.55,1.46).rotation.x=Math.PI/2; solid(15.3,16.3,.7,1.5);
      for(let i=0;i<5;i++) M(box(.35,.12+R()*.25,.3), colorMat(0xe8dcc0), 13.6+i*.4,FY+.85,5.2); M(box(2.4,.05,.9), whiteM, 14.4,FY+.74,5.2); solid(13.1,15.7,4.7,5.7);
      stand(boardTex('sheet','💰 Báo cáo thu – chi Q4',D.accent),2.8,1.5, 10.4,5.6, Math.PI); frame(posterTex('Minh bạch · Chính xác','Đúng hạn từng con số',D.accent),2.4,1.2, 11,FY+2.3,-2.94,0); },
    ops(D){ const fr=new THREE.Group(); fr.position.set(12.5,0,1); root.add(fr);   // mặt màn hình quay về phía bàn trực (+z) M(box(5.6,2.2,.2), darkM, 0,FY+1.6,0, fr);
      ['dash','dash','crm','dash','mail','dash'].forEach((k,i)=>{ const s=new THREE.Mesh(new THREE.PlaneGeometry(1.7,.95), scrMat(k)); s.position.set(-1.8+(i%3)*1.8,FY+1.1+Math.floor(i/3)*1.0,.11); fr.add(s); }); solid(9.6,15.4,.8,1.2);
      for(let i=0;i<3;i++){ desk(10+i*2.2,4.6,-1,'dash'); } solid(9.1,15.7,4,5.2); frame(posterTex('Hệ thống chạy 24/7','Khách hàng gọi – mình nghe máy',D.accent),2.4,1.2, 11,FY+2.3,-2.94,0); },
    hr(D){ const scrT=boardTex('mail','🎓 Onboarding · Ngày đầu đi làm',D.accent,'Văn hoá · Quy trình · Công cụ'); plate(scrT,3.2,1.8, 12.5,FY+1.6,.75,0,.5);
      for(let r=0;r<3;r++) for(let k=0;k<4;k++) chair(10.4+k*1.4,2.6+r*1.3,Math.PI); solid(9.9,15.2,2.2,6.3);
      frame(posterTex('Giá trị cốt lõi','Tận tâm · Chính trực · Học hỏi',D.accent),2.4,1.2, 11,FY+2.3,-2.94,0); frame(posterTex("We're hiring! 🚀",'QA · Dev · BA – phỏng vấn ở sảnh tầng 1',0x2f6fd0),2.2,1.1, 15,FY+2.25,-2.94,0); },
  };

  /* ============================== CÁC LOẠI TẦNG ============================== */
  const BUILD={
    lobby(b, fl){ shell('lobby', b, fl);
      const logo=ct(1024,320,(g,w,h)=>{ g.fillStyle='#10161f'; g.fillRect(0,0,w,h); g.fillStyle=hex(b.color); g.fillRect(0,h-18,w,18); g.fillStyle='#fff'; g.font='800 110px "Segoe UI",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; let fs=110; while(g.measureText(b.name).width>w-80){ fs-=8; g.font=`800 ${fs}px "Segoe UI",sans-serif`; } g.fillText(b.name,w/2,h/2-20); g.font='500 40px "Segoe UI",sans-serif'; g.fillStyle='#aab4c8'; g.fillText(profileOf(b).kind,w/2,h/2+70); });
      M(box(8,2.5,.08), new THREE.MeshStandardMaterial({map:logo, emissive:0xffffff, emissiveMap:logo, emissiveIntensity:.5}), -11,FY+1.9,-RD+.12);
      // quầy lễ tân
      M(box(5,1.1,1), whiteM, 0,FY+.55,1.5); M(box(5.2,.06,1.2), darkM, 0,FY+1.13,1.5); M(box(5,.25,.04), new THREE.MeshStandardMaterial({color:b.color, emissive:b.color, emissiveIntensity:.8}), 0,FY+.75,2.02);
      solid(-2.6,2.6,.9,2.1); const fs=PEOPLE()?PEOPLE().pickSeed(L=>L.female && L.style!=='cap', hs(b.name)):0;
      const rec=bot(who('Lễ tân'), 'person', 0, .4, 0, 'stand', {seed:fs, outfit:{shirt:b.color, long:true}, lines:[`Chào mừng tới ${b.name}!`,'Anh/chị cần tham quan hay phỏng vấn ạ?','Mời anh/chị dùng nước ☕'], dot:'#ff8fc2', greet:true}); st.rec=rec;
      INTER.push({x:0, z:3.2, r:1.9, prio:.4, label:'🛎️ Lễ tân: tham quan công ty / phỏng vấn (E)', action:()=>reception(b)});
      buildGate(b);
      bot(who('Bảo vệ'), 'person', 3.4, -6.4, -.6, 'cross', {outfit:{shirt:0x1f2a44, pants:0x1f2a44, long:true, style:'cap'}, lines:['Chào anh/chị!','Nhân viên quẹt thẻ ở cổng nhé.'], dot:'#9fb3c8'});
      // phòng phỏng vấn (góc phải phía trước)
      const ix0=8.5, iz0=2;
      { const w1=new THREE.Mesh(box(.06,CH,RD-iz0-1.9), glassM); w1.position.set(ix0,FY+CH/2,(iz0+1.9+RD)/2); root.add(w1); solid(ix0-.08,ix0+.08,iz0+1.8,RD);
        const w2=new THREE.Mesh(box(RW-ix0,CH,.06), glassM); w2.position.set((ix0+RW)/2,FY+CH/2,iz0); root.add(w2); solid(ix0,RW,iz0-.08,iz0+.08);
        M(box(.08,CH,.08), darkM, ix0,FY+CH/2,iz0); M(box(RW-ix0,.08,.08), darkM, (ix0+RW)/2,FY+CH-.04,iz0);
        plate(posterTex('📝 PHÒNG PHỎNG VẤN','5 câu QA/QC · sai 1 câu là trượt',0x2f6fd0),2.6,1.3, 13.2,FY+2.3,iz0-.05,Math.PI);
        rug(13.2,7,6,4.6,0x3d4a5c); M(box(2.6,.06,1.1), woodM, 13.2,FY+.75,7); for(const sx of [-1.15,1.15]) M(box(.06,.72,1), steel, 13.2+sx,FY+.37,7); solid(11.8,14.6,6.4,7.6);
        chair(13.2,8.2,Math.PI); chair(13.2,5.8,0,darkM,false);
        bot(who('HR phỏng vấn'), 'person', 13.2, 8.2, Math.PI, 'sit', {outfit:{shirt:0xffffff, long:true}, dot:'#ffd23f', lines:['Mời bạn ngồi, mình bắt đầu nhé!','Bình tĩnh, đọc kỹ câu hỏi nha.']});
        frame(ART[2],1.2,1.5, 17.86,FY+1.9,7,-Math.PI/2); plant(17.2,11.2,1.1);
        INTER.push({x:13.2, z:5.1, r:1.7, prio:.5, get label(){ return isEmp(b) ? '✅ Bạn đã là nhân viên ở đây' : `📝 Phỏng vấn vào ${b.name} (E)`; }, action:()=>{ if(isEmp(b)) return toast('Bạn đã là nhân viên – quẹt thẻ ở cổng để vào làm nhé!'); W.work && W.work.interview(b); }}); }
      // ghế chờ + trang trí
      sofa(-12,5,0,0x3d4552,3.2); sofa(-12,9.6,Math.PI,0x3d4552,3.2); M(box(1.4,.4,.8),woodM,-12,FY+.2,7.3); solid(-12.7,-11.3,6.9,7.7); rug(-12,7.3,5,5.6,0x8a7b6a);
      frame(ART[0],1.3,1.6, -RW+.14,FY+1.9,-1,Math.PI/2); frame(ART[4],1.3,1.6, -RW+.14,FY+1.9,3,Math.PI/2);
      plant(-RW+1,RD-1.2,1.3); plant(6.8,RD-1.2,1.3); plant(-RW+1,-RD+1.2,1.2); plant(RW-1,-RD+1.2,1.2);
      const vp=[[-6,6.5],[-6,-2.6],[5.6,-2.6],[5.6,6.5]]; bot(who('Khách'), 'person', -6, 6.5, 0, 'walk', {path:vp});
      bot(who('Nhân viên'), 'person', 6, -9, 0, 'walk', {path:[[6,-9],[-6,-9],[-6,-7],[6,-7]]});
      if(st.tour) spawnGuide(b, 2.4, 3.4, 'lobby');
      else if(!isEmp(b) && !b.locked){ const gs=guideSeed(b); const g=bot(s=>`${nameOf(s)} · Hướng dẫn viên`, 'person', 2.6, 3.3, -.4, 'stand', {seed:gs, outfit:guideOutfit(b), dot:'#ff8fc2', lines:['Anh/chị muốn tham quan công ty không ạ? Nhờ lễ tân gọi em nhé 😊']}); st.idle=g; }
    },
    dept(b, fl){ const D=DEPTS[fl.dept]; shell('office', b, fl, D);
      const mine=isEmp(b) && fl.dept===myDept(b); const desks=[], LAY=layoutOf(b,fl);
      deskArea(LAY, D, desks, -16.4, -3.3);
      const D2key=LAY==='shared' ? (profileOf(b).depts.find(d=>d!==fl.dept)||'dev') : null, D2=D2key?DEPTS[D2key]:null;
      frame(ART[(hs(fl.dept)+0)%6],1.4,1.8, -14.5,FY+2,-RD+.14); frame(ART[(hs(fl.dept)+3)%6],1.4,1.8, -10.5,FY+2,-RD+.14);
      // phòng họp kính
      const mx0=4, mx1=RW-.2, mz0=-RD+.2, mz1=-3;
      for(const [x,z,w,d] of [[mx0,(mz0+mz1)/2-.8,.06,mz1-mz0-1.6],[(mx0+mx1)/2+.9,mz1,mx1-mx0-1.8,.06]]){ const gw=new THREE.Mesh(box(w,CH,d), glassM); gw.position.set(x,FY+CH/2,z); root.add(gw); }
      solid(mx0-.1,mx0+.1,mz0,mz1-1.6); solid(mx0+1.8,mx1,mz1-.1,mz1+.1);
      M(box(4.2,.06,1.6), woodM, 11,FY+.75,-7.4); for(const sx of [-1.4,0,1.4]) M(box(.06,.72,.06), steel, 11+sx,FY+.37,-7.4); solid(8.7,13.3,-8.4,-6.4);
      plate(boardTex(D.scr[0], `🗣️ Họp ${D.role} · Sprint 24`, D.accent, 'Mục tiêu · Tiến độ · Rủi ro'),3.4,1.9, 11,FY+1.75,-RD+.15,0,.45);
      for(const [x,z,h] of [[9.6,-6.4,Math.PI],[12.4,-6.4,Math.PI],[9.6,-8.4,0],[12.4,-8.4,0]]) chair(x,z,h,darkM,false);
      const pres=bot(who('Lead'), 'person', 13.9, -9.4, -.7, 'present', {lines:['Sprint này mình chốt mục tiêu nhé!']});
      const att=[[9.6,-6.4,Math.PI],[12.4,-6.4,Math.PI],[9.6,-8.4,0]].map(([x,z,h])=>bot(who(D.role), 'person', x, z, h, 'sit'));
      talk(pres, att[0], MEET); talk(pres, att[2], MEET);
      if(mine) INTER.push({x:6.2, z:-6.6, r:1.8, prio:.5, get label(){ return W.work && W.work.day().standup ? '✅ Đã họp Daily hôm nay' : '🗣️ Vào họp Daily 15 phút (E)'; }, action:()=>W.work && W.work.standup(b, D)});
      // khu đặc trưng – hoặc SÀN CHUNG: phòng ban thứ 2 ngồi cùng sàn, ngăn bằng vách kính thấp + thảm màu riêng
      if(D2){ const desks2=[]; rug(11.6,3.4,13,6.4,D2.carpet); deskArea('pods', D2, desks2, 6.2, 17.6, [3.4]);
        for(let z=-2.6;z<=6.2;z+=1.4){ if(Math.abs(z+.9)<.8) continue; const gw=new THREE.Mesh(box(.05,1.25,1.3), glassM); gw.position.set(-1.6,FY+.63,z); root.add(gw); M(new THREE.CylinderGeometry(.24,.2,.45,10), colorMat(0xe9e5dc), -1.6,FY+.23,z); }
        solid(-1.7,-1.5,-2.8,-1.7); solid(-1.7,-1.5,-.1,6.6);
        for(const [x,DD] of [[-9.8,D],[11.6,D2]]) plate(posterTex(`💼 ${DD.name}`, DD.feat||'', DD.accent),3.6,.9, x,FY+CH-.75,-.9,0,.5);
        desks2.sort(()=>R()-.5).slice(0,6).forEach(d=>bot(who(D2.role), 'person', d.x, d.z, d.h, 'type'));
        if(desks2.length) deskChat(st.actors[st.actors.length-1], D2.role, D2.talks); }
      else (FEAT[fl.dept]||FEAT.dev)(D);
      funZone(curTheme.fun);
      // pantry
      M(box(6,1,1), whiteM, 13,FY+.5,RD-1.2); M(box(.6,1.6,.6), steel, 10.5,FY+.8+.2,RD-1.2); M(box(.5,1.3,.5), colorMat(0x9ad7ff), 16.5,FY+.65,RD-1.2); solid(9.8,16.9,RD-1.8,RD);
      for(let i=0;i<3;i++) M(new THREE.CylinderGeometry(.05,.04,.11,10), colorMat([0xffffff,0xd94848,0x2f6fd0][i]), 12+i*.3,FY+1.06,RD-1.2);
      const p1=bot(who(D.role), 'person', 12.2, 9.1, Math.PI*.8, 'stand'), p2=bot(who(D.role), 'person', 13.4, 8.4, -Math.PI*.2, 'stand'); p1.h=face(p1,p2.x,p2.z); p2.h=face(p2,p1.x,p1.z); place(p1); place(p2); talk(p1,p2,PANTRY);
      // lounge
      rug(-12,9.5,8,4,0x6a5d4d); sofa(-12,11.1,Math.PI,0x34495e,3.2); sofa(-15.8,9.4,Math.PI/2,0x34495e,1.6,true); M(box(1.6,.4,.8),woodM,-12,FY+.2,9.4); solid(-12.8,-11.2,9,9.8);
      for(let i=0;i<3;i++){ M(box(.35,.02,.25), colorMat(pick([0xd94848,0x2f6fd0,0xf2c230])), -12.3+i*.4,FY+.41,9.4); }
      bot(who(D.role), 'person', -12.6, 10.9, Math.PI, 'sit', {lines:['Nghỉ 5 phút rồi làm tiếp 😌']});
      for(const [x,z] of [[-RW+1,-RD+1.2],[3,RD-1.2],[-RW+1,RD-1.2],[3,-RD+1.2],[-3.6,-1.4]]) plant(x,z,1.1);
      // người làm việc ở bàn + đồng nghiệp ghé hỏi chuyện
      let myIdx = mine ? desks.findIndex(d=>Math.abs(d.x+5)<.2 && Math.abs(d.z-1.85)<.2) : -1; if(mine && myIdx<0){ for(let i=desks.length-1;i>=0;i--) if(desks[i].h===0 && desks[i].z>0){ myIdx=i; break; } if(myIdx<0) myIdx=desks.findIndex(d=>d.h===0); }
      const free=desks.map((d,i)=>i).filter(i=>i!==myIdx).sort(()=>R()-.5);
      const typers=free.slice(0,7).map(i=>bot(who(D.role), 'person', desks[i].x, desks[i].z, desks[i].h, 'type'));
      deskChat(typers[0], D.role, D.talks); deskChat(typers[3], D.role, D.talks);
      const sideK={qa:'phone', sales:'phone', ops:'cross', marketing:'cross', dev:'cross', product:'present', accounting:'phone', hr:'present', pmo:'present'}[fl.dept]||'cross';
      const sp={hr:[15.9,1.8,-1.2], pmo:[14.2,2.6,Math.PI*.9]}[fl.dept]||[11.6,3.1,Math.PI*.9]; bot(who(D.role), 'person', sp[0], sp[1], sp[2], sideK, {lines:[D.feat]});
      bot(who(D.role), 'person', 4.2, -1.5, 0, 'walk', {path:[[4.2,-1.5],[-15,-1.5],[-15,-.6],[4.2,-.6],[4.2,8.8],[8,8.8],[4.2,8.8]]});
      // bàn của bạn (nhân viên phòng mình)
      if(mine){ const d=desks[myIdx]; st.myDesk=d; const s=seat(d.x+Math.sin(d.h)*.04, d.z+Math.cos(d.h)*.04, d.h, FY+.51, {label:'🪑 Ngồi bàn của bạn (E)'});
        const nameT=posterTex(`${(W.PROFILE&&W.PROFILE.name)||'Bạn'} · QA`, 'Bàn làm việc của bạn', D.accent); plate(nameT,.5,.25, d.x,FY+.86,d.z+.36,Math.PI);
        const ring=new THREE.Mesh(new THREE.RingGeometry(.55,.72,40), new THREE.MeshBasicMaterial({color:0xffd23f, transparent:true, opacity:.85, depthWrite:false, side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.set(d.x,FY+.02,d.z-.65); root.add(ring); st.ring=ring;
        INTER.push({x:d.x, z:d.z-.75, r:1.5, prio:.9, label:'💻 Bàn làm việc của bạn – ngồi & mở máy tính (E)', action:()=>{ if(s && W.life) W.life.sitOn(s); setTimeout(()=>W.work && W.work.openPC(b), 350); }}); }
      if(st.tour) spawnGuide(b, 1.4, -9.2, 'dept', D);
    },
    canteen(b, fl){ shell('canteen', b, fl);
      M(box(12,1,1), whiteM, -10,FY+.5,-RD+1.6); const glass=new THREE.Mesh(box(12,.5,.05), glassM); glass.position.set(-10,FY+1.35,-RD+2.05); root.add(glass);
      const food=[0xffb347,0x7bc96f,0xe8d6a8,0xd9534f,0xfff1b8];
      for(let i=0;i<10;i++){ M(box(.9,.08,.6), steel, -15.4+i*1.2,FY+1.04,-RD+1.6); M(new THREE.SphereGeometry(.22,10,6), colorMat(food[i%5],{roughness:.6}), -15.4+i*1.2,FY+1.12,-RD+1.6).scale.y=.45; }
      solid(-16.2,-3.8,-RD,-RD+2.2);
      bot('Đầu bếp Robo', 'robot', -10, -RD+.8, 0, 'stand', {lines:['Cơm gà hôm nay ngon lắm!','Mời bạn chọn món 🍱'], dot:'#ffb547'});
      INTER.push({x:-8, z:-RD+3, r:1.6, get label(){ return isEmp(b) ? '🍱 Ăn trưa nhân viên (miễn phí) – chạy nhanh hơn 10 phút' : '🍱 Ăn trưa (25 💰) – no bụng, chạy nhanh hơn 10 phút'; }, action:()=>{ const L=W.life; if(!L) return;
        if(isEmp(b)){ L.S.buffs.energy=Math.max(Date.now(),L.S.buffs.energy||0)+600000; W.work && W.work.lunch(); toast('😋 Cơm nhân viên ngon quá! Bạn được tăng tốc 10 phút.'); return; }
        L.askPay(25, '🍱 Ăn trưa ở nhà ăn (chạy nhanh hơn 10 phút)', ()=>{ if(L.S.coins<25) return toast('Không đủ 25 💰'); L.S.buffs.energy=Math.max(Date.now(),L.S.buffs.energy||0)+600000; L.addCoins(-25); toast('😋 Ngon! Bạn được tăng tốc 10 phút.'); }); }});
      const q=[0,1,2].map(i=>bot(who('Nhân viên'), 'person', -8.5+i*.9, -RD+3.4+i*.9, Math.PI, 'stand', {lines:['Đói quá…','Hôm nay ăn gì nhỉ?']})); talk(q[0],q[1],PANTRY);
      let k=0; const eaters=[];
      for(const tx of [-12,-6.5,6.5,12.5]) for(const tz of [-3.5,1.5,6.5]){
        M(box(2.6,.06,1.1), woodM, tx,FY+.75,tz); for(const sx of [-1.1,1.1]) M(box(.06,.72,.9), steel, tx+sx,FY+.37,tz); solid(tx-1.4,tx+1.4,tz-1.15,tz+1.15);
        for(const sx of [-.8,0,.8]) for(const sz of [-1,1]){ M(new THREE.CylinderGeometry(.18,.18,.06,10), colorMat(0xd05f28), tx+sx,FY+.47,tz+sz*.85); M(new THREE.CylinderGeometry(.03,.03,.44,6), steel, tx+sx,FY+.23,tz+sz*.85);
          seat(tx+sx, tz+sz*.85, sz>0?Math.PI:0, FY+.5, {back:true, label:'🪑 Ngồi ăn (E · C)'});
          if(R()<.3 && k<12){ k++; eaters.push(bot(who('Nhân viên'), 'person', tx+sx, tz+sz*.85, sz>0?Math.PI:0, 'eat')); M(new THREE.CylinderGeometry(.16,.12,.06,12), whiteM, tx+sx,FY+.8,tz+sz*.45); } } }
      for(let i=0;i+1<eaters.length;i+=2) if(Math.hypot(eaters[i].x-eaters[i+1].x, eaters[i].z-eaters[i+1].z)<2.2) talk(eaters[i], eaters[i+1], PANTRY);
      for(const x of [RW-1.4,RW-2.6]) M(box(1,1.9,.8), colorMat(x>RW-2?0xd32f2f:0x1976d2,{roughness:.4}), x,FY+.95,-RD+.6); solid(RW-3.2,RW,-RD,-RD+1.1);
      plant(-RW+1,RD-1.2,1.2); plant(RW-1,RD-1.2,1.2);
      if(st.tour) spawnGuide(b, 1.4, -9.2, 'canteen');
    },
    director(b, fl){ shell('director', b, fl);
      const rg=M(box(9,.02,6), colorMat(0x7a2e2e,{roughness:1}), 0,FY+.01,-3.5); rg.castShadow=false;
      M(box(3.2,.08,1.4), new THREE.MeshStandardMaterial({color:0x4a2f1e, roughness:.35}), 0,FY+.78,-6.2); M(box(3.2,.74,.08), new THREE.MeshStandardMaterial({color:0x3a2416, roughness:.4}), 0,FY+.38,-5.55);
      M(box(.5,.3,.04), darkM, -.6,FY+.96,-6.5); M(box(.9,.08,.25), new THREE.MeshStandardMaterial({color:0xd4af37, metalness:.9, roughness:.3}), .9,FY+.86,-5.7);
      solid(-1.8,1.8,-7,-5.4);
      const boss=bossOf(b), bs=PEOPLE()?PEOPLE().pickSeed(L=>!L.female && L.style!=='cap', hs(boss)):0;
      const dir=bot('Giám đốc '+boss, 'person', 0, -7.05, 0, 'type', {seed:bs, outfit:{shirt:0x1b1f2a, pants:0x1b1f2a, shoe:0x111111, long:true, glasses:boss.includes('Pro')}, lines:[`Chào bạn! Mình là ${boss}. ${b.name} luôn cần người giỏi QA.`,'Muốn làm ở đây? Phỏng vấn ở sảnh tầng 1 nhé – 5 câu QA/QC thôi!','Chất lượng là uy tín của công ty.'], dot:'#ffd23f'});
      for(const x of [-.9,.9]) chair(x,-4.4,Math.PI, colorMat(0x5a3a2a));
      INTER.push({x:0, z:-3.6, r:1.6, label:'🤝 Chào Giám đốc', action:()=>sayNow(dir, pick(dir.lines))});
      M(box(3.6,.45,1),colorMat(0x2f2a26,{roughness:.8}),-12,FY+.23,4); M(box(3.6,.65,.25),colorMat(0x2f2a26,{roughness:.8}),-12,FY+.62,3.4); M(box(1.6,.4,.9),woodM,-12,FY+.2,5.6); solid(-13.9,-10.1,3.2,6.2); for(const k of [-.95,0,.95]) seat(-12+k, 4.05, 0, FY+.46, {r:2.5, label:'🛋️ Ngồi sofa (E · C)'});
      for(let i=0;i<4;i++) for(let j=0;j<4;j++){ M(box(1.2,.04,.4), woodM, -RW+.5,FY+.4+j*.6,-6+i*1.3); for(let k=0;k<5;k++) M(box(.1,.4,.28), colorMat([0xb33a3a,0x2f5fb3,0xc98a1e,0x2a7a4f][(i+j+k)%4]), -RW+.45,FY+.62+j*.6,-6.45+i*1.3+k*.2); }
      solid(-RW,-RW+.8,-6.8,-1.2);
      for(let i=0;i<3;i++) M(new THREE.CylinderGeometry(.12,.08,.4,12), new THREE.MeshStandardMaterial({color:0xd4af37, metalness:.95, roughness:.25}), 8+i*.6,FY+1.05,-RD+.5);
      M(box(2.6,.85,.5), woodM, 8.6,FY+.43,-RD+.5); solid(7.2,10,-RD,-RD+.9);
      frame(ART[1],1.6,2, -4.5,FY+1.9,-RD+.14); frame(ART[5],1.6,2, 4.5,FY+1.9,-RD+.14);
      plant(-RW+1,RD-1.2,1.3); plant(RW-1,RD-1.2,1.3); plant(RW-1,-RD+1.2,1.1);
      M(box(1.4,.05,.7), whiteM, 5,FY+.74,-9); chair(5,-8.3,0); bot(who('Thư ký'), 'person', 5, -8.3, Math.PI, 'type', {seed:PEOPLE()?PEOPLE().pickSeed(L=>L.female, hs(b.name)+5):0, lines:['Giám đốc đang rảnh, mời bạn vào ạ.','Lịch họp chiều nay kín rồi…']});
      if(st.tour) spawnGuide(b, 2.4, -9.2, 'director');
    },
  };
  const myDept=b=>profileOf(b).depts.includes('qa') ? 'qa' : 'dev';

  /* ============================== CỔNG QUẸT THẺ ============================== */
  let audio=null; function beep(ok=true){ try{ audio=audio||new (window.AudioContext||window.webkitAudioContext)(); const o=audio.createOscillator(), g=audio.createGain(); o.frequency.value=ok?1320:220; g.gain.value=.06; o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime+(ok?.12:.3)); }catch(e){} }
  function buildGate(b){ const z=-5;
    for(const [x0,x1] of [[-RW+.2,-1.4],[1.4,RW-.2]]){ const w=x1-x0, cx=(x0+x1)/2; const g=new THREE.Mesh(box(w,1.05,.05), glassM); g.position.set(cx,FY+.53,z); root.add(g); M(box(w,.05,.08), steel, cx,FY+1.07,z); solid(x0,x1,z-.15,z+.15); }
    const flaps=[];
    for(const s of [-1,1]){ M(box(.32,1.0,1.3), steel, s*1.25,FY+.5,z); solid(s*1.25-.16, s*1.25+.16, z-.65, z+.65);
      M(box(.2,.02,.2), new THREE.MeshStandardMaterial({color:0x111111, emissive:0x46d39a, emissiveIntensity:1.2}), s*1.25,FY+1.01,z+.4);
      const piv=new THREE.Group(); piv.position.set(s*1.08,FY+.55,z); root.add(piv); const fp=new THREE.Mesh(box(.98,.7,.03), glassM); fp.position.x=-s*.49; piv.add(fp); piv.userData.dynamic=true; flaps.push({piv, s}); }
    const gb={x0:-1.1,x1:1.1,z0:z-.12,z1:z+.12}; boxes.push(gb); st.gate={open:0, flaps, box:gb, b};
    INTER.push({x:0, z:-3.7, r:1.5, prio:.6, get label(){ return isEmp(b) ? '💳 Quẹt thẻ nhân viên (E)' : st.tour ? '🎫 Qua cổng cùng hướng dẫn viên (E)' : b.locked ? '🔒 Chỉ nhân viên – phỏng vấn ở phòng bên phải' : '🎫 Tham quan? Nhờ lễ tân gọi hướng dẫn viên'; }, action:()=>gateAction(b)}); }
  function openGate(sec=3.5){ const G=st.gate; if(!G) return; G.open=Math.max(G.open, sec); const i=boxes.indexOf(G.box); if(i>=0) boxes.splice(i,1); }
  function gateAction(b){
    if(isEmp(b)){ beep(true); openGate(4); W.work && W.work.swipe(b); return; }
    if(st.tour){ beep(true); openGate(4); sayNow(st.guide, 'Em quẹt thẻ khách rồi, mời anh/chị qua cổng ạ!', 3.5); return; }
    beep(false); toast(b.locked ? '🔒 Khu làm việc chỉ dành cho nhân viên. Muốn vào làm? Phỏng vấn ở PHÒNG PHỎNG VẤN bên phải sảnh.' : '🎫 Muốn tham quan? Nhờ lễ tân (quầy phía trước) gọi hướng dẫn viên dẫn đi nhé.', 4200); }
  function updGate(dt){ const G=st.gate; if(!G) return;
    const inLane=Math.abs(P.x)<1.2 && Math.abs(P.z+5)<.8;
    if(P.z<-5.3 && P.z>-7.6 && Math.abs(P.x)<1.8 && G.open<=0) openGate(2.5);   // từ trong đi ra: cổng tự mở
    if(st.tour && Math.abs(P.x)<2 && P.z>-4.6 && P.z<-2.6 && G.open<=0) openGate(3);
    if(G.open>0){ G.open-=dt; if(G.open<=0){ if(inLane) G.open=.5; else if(!boxes.includes(G.box)) boxes.push(G.box); } }
    const want=G.open>0?1:0; for(const f of G.flaps){ f.k=W.lerp(f.k||0, want, 1-Math.exp(-dt*8)); f.piv.rotation.y=f.s*f.k*Math.PI/2; } }

  /* ============================== LỄ TÂN · THAM QUAN ============================== */
  const guideSeed=b=>PEOPLE()?PEOPLE().pickSeed(L=>L.female && ['long','bob','ponytail'].includes(L.style), hs(b.name)+99):0;
  const guideOutfit=b=>({shirt:[0xff8fc2,0xffffff,0x8fc2f0,0xf2c230][hs(b.name)%4], dress:true, shoe:0xffffff, long:false});
  function reception(b){ const ui=W.ui; if(!ui) return;
    const m=ui.modal(`🛎️ Lễ tân · ${b.name}`); const pf=profileOf(b);
    m.body.innerHTML=`<p>Xin chào! ${b.name} là <b>${pf.kind}</b>. Anh/chị cần gì ạ?</p>
      <div class="grid">
        <div class="card"><div class="ic">🎫</div><b>Tham quan công ty</b><small>${b.locked?'Toà bảo mật – không nhận khách tham quan.':'Hướng dẫn viên dẫn đi các tầng, giới thiệu từng phòng ban.'}</small><button class="btn pri" data-a="tour" ${b.locked||isEmp(b)||st.tour?'disabled':''}>${st.tour?'Đang tham quan':'Bắt đầu'}</button></div>
        <div class="card"><div class="ic">📝</div><b>Phỏng vấn xin việc</b><small>5 câu hỏi QA/QC – sai 1 câu là trượt. Đậu thì nhận thẻ nhân viên ngay.</small><button class="btn" data-a="iv" ${isEmp(b)?'disabled':''}>${isEmp(b)?'Bạn đã là nhân viên':'Vào phòng phỏng vấn'}</button></div>
        <div class="card"><div class="ic">💳</div><b>Nhân viên</b><small>${isEmp(b)?'Quẹt thẻ ở cổng phía sau để chấm công, rồi lên tầng làm việc.':'Chỉ nhân viên có thẻ mới qua cổng.'}</small></div></div>`;
    m.body.querySelector('[data-a=tour]').onclick=()=>{ m.close(); startTour(b); };
    // bấm là vào thẳng phòng phỏng vấn: đưa tới trước bàn HR (13,2 · 5,4), quay mặt về HR rồi mở bài phỏng vấn
    m.body.querySelector('[data-a=iv]').onclick=()=>{ m.close(); fade.style.opacity=1;
      setTimeout(()=>{ if(st.b!==b) return; P.x=13.2; P.z=5.4; P.y=FY; P.vx=P.vz=P.vy=0; P.face=0; me.g.position.set(P.x,P.y,P.z); me.g.rotation.y=0;
        cam.yaw=Math.PI; cam.pitch=.2; cam.tx=P.x; cam.tz=P.z; camera.position.set(P.x, P.y+2, P.z-4);
        setTimeout(()=>fade.style.opacity=0, 60); if(W.work) W.work.interview(b); else toast('📝 Phòng phỏng vấn ở góc phải sảnh – đứng trước bàn rồi bấm E.', 4200); }, 300); }; }
  function startTour(b){ st.tour=true; const g=st.idle; if(g){ const i=st.actors.indexOf(g); if(i>=0) st.actors.splice(i,1); g.a.g.parent && g.a.g.parent.remove(g.a.g); removeLabel(g.a.label); if(g.bub) removeLabel(g.bub); st.idle=null; }
    spawnGuide(b, 2.6, 3.3, 'lobby'); sayNow(st.guide, `Chào anh/chị! Em là ${st.guide.gname}, em sẽ dẫn mình tham quan ${b.name} ạ 😊`, 5); toast('🎫 Bắt đầu tham quan – đi theo hướng dẫn viên. Bấm E cạnh chị ấy nếu muốn tự đi.', 4500); }
  function endTour(msg='Cảm ơn anh/chị đã ghé thăm! Chúc một ngày vui vẻ 👋'){ if(!st.tour) return; st.tour=false; if(st.guide){ sayNow(st.guide, msg, 4); st.guide.mode='stand'; st.guide.pois=null; } toast('👋 Kết thúc tham quan.'); }
  function spawnGuide(b, x, z, where, D){ const s=guideSeed(b);
    const g=bot(ss=>`${nameOf(ss)} · Hướng dẫn viên`, 'person', x, z, Math.PI, 'guide', {seed:s, outfit:guideOutfit(b), dot:'#ff8fc2'}); g.gname=nameOf(s); st.guide=g;
    const pf=profileOf(b), list=pf.depts.map(d=>DEPTS[d].name.replace('Phòng ','')).join(', ');
    const POIS={
      lobby:[{path:[[3.6,3.3],[3.6,-3.4],[0,-3.4]], line:`Đây là cổng quẹt thẻ: nhân viên quẹt thẻ để chấm công. Em quẹt thẻ khách cho mình nhé!`},
             {path:[[0,-6.2],[2.6,-8.6]], line:`${b.name} có các phòng: ${list}. Mình bấm E ở thang máy để lên tầng nhé ạ!`}],
      dept:D?[{path:[[1.4,-1.5],[-9.5,-1.5]], line:`Đây là ${D.name}. ${D.desc}`},
              {path:[[4.9,-1.6],[4.9,-2.4]], line:`Phòng họp kính – team họp Daily mỗi sáng 15 phút, họp Sprint, demo cho khách hàng.`},
              {path:[[4.9,-1.5],[11,-1.5],[11,-.9]], line:D.feat},
              {path:[[4.2,-1.5],[4.2,9],[12,9]], line:'Pantry: cà phê, trà, nước miễn phí – chỗ mọi người “sạc pin” và tám chuyện ☕'},
              {path:[[-6.5,9]], line:'Góc thư giãn: sofa, sách. Mệt thì ra đây nghỉ chút. Mình lên tầng khác nhé?'}]:[],
      canteen:[{path:[[1.4,-6.2],[-3.4,-6.2]], line:'Nhà ăn nhân viên: cơm trưa miễn phí cho nhân viên, khách 25 💰 một suất.'},{path:[[0,-6.2],[0,-1]], line:'Ăn xong mọi người hay ngồi lại tám chuyện, có cả máy bán nước ở góc kia.'}],
      director:[{path:[[2.6,-9.2],[2.6,-3.2],[1,-3.2]], line:`Phòng Giám đốc ${bossOf(b)}. Anh/chị có thể bấm E để chào giám đốc ạ!`}],
    };
    g.pois=POIS[where]||[]; g.gi=0; g.route=g.pois.length?g.pois[0].path.slice():[]; g.wait=0; g.callT=4; return g; }
  function updGuide(o, dt){ const dP=Math.hypot(P.x-o.x, P.z-o.z);
    const walkTo=(tx,tz,sp=1.3)=>{ const dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz); if(d<.15) return true; o.x+=dx/d*Math.min(d,sp*dt); o.z+=dz/d*Math.min(d,sp*dt); o.h=W.lerpAngle(o.h, Math.atan2(dx,dz), 1-Math.exp(-dt*7)); o.a.play('walk'); place(o); return false; };
    const idleFace=()=>{ o.h=W.lerpAngle(o.h, face(o,P.x,P.z), 1-Math.exp(-dt*4)); o.a.play('idle'); place(o); };
    if(!o.pois){ idleFace(); return; }
    if(o.gi<o.pois.length){
      if(o.wait>0){ o.wait-=dt; idleFace(); if(o.wait<=0){ if(dP<6){ o.gi++; if(o.gi<o.pois.length) o.route=o.pois[o.gi].path.slice(); } else o.wait=.6; } return; }
      if(dP>8.5){ idleFace(); o.callT-=dt; if(o.callT<=0){ o.callT=6; sayNow(o,'Anh/chị ơi, bên này ạ! 👋',3); } return; }
      const wp=o.route[0]; if(!wp){ sayNow(o, o.pois[o.gi].line, 7); o.wait=6.5; return; }
      if(walkTo(wp[0], wp[1])) o.route.shift();
    } else { if(dP>2.6) walkTo(P.x+(o.x-P.x)/dP*1.7, P.z+(o.z-P.z)/dP*1.7, 1.6); else idleFace(); }
  }

  /* ============================== ĐIỀU KHIỂN ============================== */
  function clearFloor(){
    W.dropSeats && W.dropSeats(x=>x.scope==='interior');
    for(const o of st.actors){ removeLabel(o.a.label); if(o.bub) removeLabel(o.bub); }
    // KHÔNG giải phóng hình của bot: bot dùng chung hình với mẫu avatar (và với chính người chơi) –
    // giải phóng ở đây làm người chơi + bot các tầng sau biến mất (chỉ còn bóng).
    const shared=new Set(); for(const o of st.actors) o.a.g.traverse(c=>{ if(c.geometry) shared.add(c.geometry); });
    st.actors=[]; st.talks=[]; st.guide=null; st.idle=null; st.gate=null; st.myDesk=null; st.ring=null; st.rec=null;
    root.traverse(o=>{ if(o.isMesh && o.geometry && !o.isSkinnedMesh && !shared.has(o.geometry)) o.geometry.dispose(); }); root.clear();
    circles.length=0; boxes.length=0; plats.length=0; INTER.length=0;
  }
  function buildFloor(){ const b=st.b, fl=st.floors[st.idx]; seedK=0; curTheme=themeOf(b); wallM.color.set(curTheme.wall); BUILD[fl.kind](b, fl); root.updateMatrixWorld(true);
    for(const x of (W.seats||[])) if(x.scope==='interior' && st.actors.some(o=>['type','eat','sit'].includes(o.mode) && Math.hypot(o.x-x.x,o.z-x.z)<.5)) x.taken='bot';
    batchStatic(W, root); dl.position.set(8,14,9); dl.target.position.set(0,0,0); W.work && W.work.onFloor(b, fl); }
  function go(idx, at){ fade.style.opacity=1;
    setTimeout(()=>{ clearFloor(); st.idx=idx; buildFloor();
      const sp = at==='door' ? {x:0, z:RD-2.4, f:Math.PI} : {x:0, z:-RD+2.6, f:0};
      P.x=sp.x; P.z=sp.z; P.y=FY; P.vx=P.vz=P.vy=0; P.face=sp.f; me.g.position.set(P.x,P.y,P.z); me.g.rotation.y=sp.f;
      cam.yaw=sp.f+Math.PI; cam.pitch=.18; cam.tx=P.x; cam.tz=P.z; camera.position.set(P.x+Math.sin(cam.yaw)*4, P.y+2, P.z+Math.cos(cam.yaw)*4);
      const fl=st.floors[idx]; toast(`${fl.kind==='lobby'&&at==='door'?'🏢 '+st.b.name:'🛗 Tầng '+fl.n}: ${fl.name}`, 2200);
      setTimeout(()=>fade.style.opacity=0, 60); }, 300); }
  function elevatorMenu(){ const b=st.b, ok=isEmp(b)||st.tour; const m=W.ui.modal(`🛗 Thang máy · ${b.name}`); const g=document.createElement('div'); g.className='grid'; m.body.appendChild(g);
    if(!ok) m.body.insertAdjacentHTML('afterbegin', `<p class="muted">🔒 Các tầng làm việc chỉ dành cho nhân viên${b.locked?'':' hoặc khách đi cùng hướng dẫn viên'}.</p>`);
    const icon={lobby:'🛎️', dept:'💼', canteen:'🍱', director:'👔'};
    [...st.floors].reverse().forEach(fl=>{ const i=st.floors.indexOf(fl), open=ok||fl.kind==='lobby', c=document.createElement('div'); c.className='card'+(i===st.idx?' sel':''); c.style.cursor=open?'pointer':'not-allowed'; c.style.opacity=open?1:.45;
      c.innerHTML=`<div class="row"><div class="ic">${icon[fl.kind]}</div><div class="sp"></div><b style="font-size:22px">${fl.n}</b></div><b>${fl.name}</b><small>${i===st.idx?'Bạn đang ở đây':open?'Bấm để đi tới':'🔒 Cần thẻ nhân viên'}</small>`;
      c.onclick=()=>{ if(!open) return toast('🔒 Cần thẻ nhân viên (phỏng vấn ở sảnh) hoặc đi cùng hướng dẫn viên.'); m.close(); if(i!==st.idx) go(i,'lift'); }; g.appendChild(c); }); }
  function enter(b){ if(st.b) return;
    st.b=b; st.floors=floorsOf(b); st.idx=0; st.tour=false;
    st.saved={segs:(W.SEGS||[]).splice(0), circles:circles.splice(0), boxes:boxes.splice(0), plats:plats.splice(0), INTER:INTER.splice(0)};
    st.camDist=cam.dist; cam.dist=Math.min(cam.dist,4.6);
    W.inside=b; HOOK.labelGroup='interior'; HOOK.camBox={x0:-RW+.5, x1:RW-.5, z0:-RD+.5, z1:RD-.5, y1:FY+CH-.3};
    IS.environment=scene.environment; renderPass.scene=IS; scene.remove(me.g); IS.add(me.g);
    go(0,'door'); }
  function exit(){ if(!st.b) return; const b=st.b; fade.style.opacity=1; st.tour=false;
    setTimeout(()=>{ clearFloor(); for(const k of ['circles','boxes','plats','INTER']){ const arr={circles,boxes,plats,INTER}[k]; arr.push(...st.saved[k]); } (W.SEGS||[]).push(...(st.saved.segs||[]));
      renderPass.scene=scene; IS.remove(me.g); scene.add(me.g); HOOK.labelGroup='world'; HOOK.camBox=null; W.inside=null; cam.dist=st.camDist||6.5; st.b=null; W.work && W.work.onFloor(null);
      const d=b.door; P.x=d.x; P.z=d.z; P.y=groundAt(P.x,P.z); P.face=d.face; me.g.position.set(P.x,P.y,P.z); me.g.rotation.y=d.face; cam.yaw=d.face+Math.PI; cam.tx=P.x; cam.tz=P.z;
      camera.position.set(P.x+Math.sin(cam.yaw)*6, P.y+3, P.z+Math.cos(cam.yaw)*6); setTimeout(()=>fade.style.opacity=0, 60); }, 300); }

  /* ============================== CẬP NHẬT ============================== */
  HOOK.onFrame.push((dt, T)=>{
    if(!st.b) return;
    if(IS.environment!==scene.environment) IS.environment=scene.environment;   // đổi giờ khi đang trong toà → môi trường cũ đã bị giải phóng
    dl.position.set(P.x+8,14,P.z+9); dl.target.position.set(P.x,0,P.z);
    const want=skyline(W.night>.5); if(st.skyMat && st.skyMat.map!==want){ st.skyMat.map=want; st.skyMat.needsUpdate=true; }
    updGate(dt); if(st.ring) st.ring.material.opacity=.55+.35*Math.sin(T*3.2);
    for(const o of st.actors){
      o.t+=dt;
      if(o.mode==='guide') updGuide(o, dt);
      else if(o.mode==='walk' && o.path){ const [tx,tz]=o.path[o.wi], dx=tx-o.x, dz=tz-o.z, d=Math.hypot(dx,dz);
        if(d<.3) o.wi=(o.wi+1)%o.path.length; else { o.x+=dx/d*1.3*dt; o.z+=dz/d*1.3*dt; o.h=W.lerpAngle(o.h, Math.atan2(dx,dz), 1-Math.exp(-dt*6)); }
        o.a.play('walk'); place(o); }
      else if(o.greet && Math.hypot(P.x-o.x,P.z-o.z)<3.5 && !o.greeted){ o.greeted=true; sayNow(o, o.lines[0]); }
      if(o.mode==='stand' && o.a.acts.agree){ o.gest-=dt; o.a.play(o.gest>0?'agree':'idle', .35); }
      o.a.mixer.update(dt);
      if(['type','eat','sit','present','phone','cross'].includes(o.mode)) o.p.apply(o.mode, o.t);
      if(o.bub){ o.bubT-=dt; if(o.bubT<=0){ removeLabel(o.bub); o.bub=null; } }
    }
    // trò chuyện: chỉ chạy khi người chơi ở gần (đỡ rối mắt + nhẹ máy)
    for(const k of st.talks){ k.t-=dt; if(k.t>0) continue; if(Math.min(Math.hypot(P.x-k.a.x,P.z-k.a.z), Math.hypot(P.x-k.b.x,P.z-k.b.z))>13){ k.t=2; continue; }
      if(!k.cur){ k.cur=pick(k.pool); k.i=0; } const [w,text]=k.cur[k.i]; sayNow(w===0?k.a:k.b, text, 3.4); k.i++;
      if(k.i>=k.cur.length){ k.cur=null; k.t=7+R()*8; } else k.t=3.1; }
    // lời nói lẻ của người đứng gần
    st.talkT=(st.talkT||0)-dt; if(st.talkT<=0){ st.talkT=4+R()*4; const near=st.actors.filter(o=>o.lines.length && o.mode!=='guide' && Math.hypot(P.x-o.x,P.z-o.z)<6 && !o.bub); if(near.length && R()<.6){ const o=pick(near); sayNow(o, pick(o.lines)); } }
  });
  // hướng dẫn viên: bấm E cạnh chị ấy để kết thúc / tiếp tục
  const guideInter={get x(){ return st.guide?st.guide.x:1e9; }, get z(){ return st.guide?st.guide.z:1e9; }, r:1.6, prio:.3, when:()=>!!(st.tour && st.guide),
    get label(){ return '👋 Cảm ơn, tôi tự đi tham quan (E)'; }, action:()=>endTour()};
  HOOK.onFrame.push(()=>{ if(st.b && st.tour && !INTER.includes(guideInter)) INTER.push(guideInter); });
  return {enter, exit, go:(i)=>go(i,'lift'), scene:IS, get inside(){ return st.b; }, get floors(){ return st.floors; }, profileOf, floorsOf, myDept, endTour, get touring(){ return st.tour; }};
}
