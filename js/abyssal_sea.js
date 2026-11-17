// QC World V2 – Đảo Abyssal · phiên B (abyss-sea), 17/11/2026 – BIỂN, QUẦN ĐẢO ĐÁ VÔI, BẾN SIÊU DU THUYỀN, TOUR TỰ CHẠY, THỂ THAO NƯỚC (đặc tả Bình Phần 3 + Phần 8.2)
//  • "Quần đảo Đá Vôi Ngọc Bích": 5 đảo đá vôi vách dựng (lưới dọc liên tục có khía sóng chân đảo, vân nhũ đá, hang vòm ở chân), 1 đảo đôi có VÒM ĐÁ cho ca-nô/kayak luồn qua,
//    8 cột đá nhỏ; cây trên đỉnh và bám vách (InstancedMesh); bọt sóng trắng quanh chân đảo. Vùng TẠM: biển trống Tây Nam x −730…−410, z 405…705 (W.ABY.karst ghi đè).
//  • Bến Siêu Du Thuyền: lối gỗ teak + cầu tàu chính + phao nổi, cọc/bích neo đồng, đèn cột 2 nhánh, quầy vé E (150 💰 · combo ăn uống VIP 250 💰), quầy thuê đồ chơi nước.
//  • Đội 8 siêu du thuyền 3 tầng (abyssal_yacht.js) chạy MỘT tuyến khép kín, lệch pha đều nhau → không bao giờ đụng nhau: cập bến đón khách → (vòng đảo khách sạn → qua gầm
//    Cầu Vòm, khi có W.ABY) → vòng quần đảo đá vôi → về bến. Tốc độ giảm ở khúc cua, tăng/giảm tốc êm khi rời/cập bến. Vị trí tàu là HÀM CỦA THỜI GIAN (W.T).
//  • Thể thao nước: 2 ca-nô kéo dù (dây 38 m, dù cầu vồng cao 6–18 m), 2 flyboard (8–14 m), 3 mô tô nước, 4 kayak đôi – chạy trong vùng riêng, không cắt luồng tàu.
//    Người chơi thuê được: bay dù (20 💰), mô tô nước, kayak đôi, flyboard.
// BỐ CỤC: đọc W.ABY (phiên A công bố). CHƯA có W.ABY → dùng HẰNG SỐ TẠM ở mục "BỐ CỤC" (bến đặt ngoài bờ Bắc đảo hiện tại). Xem ghi chú bàn giao cho phiên A ở cuối file.
import * as AK from './archKit.js';
import { makeYachtKit } from './abyssal_yacht.js';
import { ZONES } from './v2core.js';

export async function make(W, ctx={}){
  if(W.abySea) return W.abySea;
  const {THREE, scene, P, me, cam, HOOK, INTER, PLACES, toast, makeLabel, teleport, addSeg, addPlat} = W;
  const TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  const WY=(W.ABY && W.ABY.waterY!=null) ? W.ABY.waterY : (W.WATER_Y ?? -.35), LOW=W.QUAL==='low';
  W.__abyPay={S:ctx.S, save:ctx.save, askPay:ctx.askPay, spend:ctx.spend, ui:ctx.ui, fmt:ctx.fmt};   /* cho dining.js (phục vụ bàn – nạp từ bots_abyssal.js, không nhận ctx) */
  const pay=(cost, what, go)=>{ if(!ctx.askPay) return go(); ctx.askPay(cost, what, ()=>{ if(ctx.spend && !ctx.spend(cost)) return; go(); }); };
  const root=new THREE.Group(); root.name='abyssal-sea'; scene.add(root); const dyn=new THREE.Group(); dyn.name='abyssal-sea-dyn'; dyn.userData.dynamic=true; scene.add(dyn);
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:.6, ...o});
  const cvs=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; f(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };

  /* ============================== BỐ CỤC: W.ABY (phiên A) – thiếu mục nào thì dùng HẰNG TẠM = bố cục A đã chốt 17/11 (ABY_layout_A.md, phương án eo Nam) ============================== */
  //  • plots.marina = {x, z, nx, nz, deckY, stem}: (x,z) điểm vách/lối gỗ bờ · (nx,nz) hướng ra nước · stem bề rộng bến ra nước (m). Tàu cập mạn phải, mũi theo (nz, −nx).
  //  • plots.stage {x,z,yaw} (abyssal_stage.js) · plots.watersports / plots.parasail {x,z,rx,rz} · bayLoop {x,z,r} · strait {…}
  //  • karst = {islands:[{x,z,r,h,name,twin?,caves?}], loop:[[x,z]…] (vòng quanh quần đảo), x0,x1,z0,z1, cut:[{x0,x1,z0,z1}], keepOut:[{x0,x1,z0,z1,hMax}]}
  //  • seaOut / seaBack = [[x,z]…]: từ cửa eo ra quần đảo / từ quần đảo về cửa eo · yachtRoute: ghi đè toàn bộ (trừ đoạn cập bến)
  // Tuyến TẠM do phiên B dựng theo hành lang A cho phép, KHÔNG có đoạn nào cắt nhau (làn đi luôn ở bên phải làn về):
  //   bến (vách Tây eo, mũi hướng Bắc) → vòng đảo khách sạn r 80 → xuống eo làn Đông x −8 → qua gầm Cầu Vòm → ra cửa eo ở x −20 (Tây cầu G2)
  //   → kênh z 180–220 làn Nam z 208 sang Tây → khe giữa Thụy Sĩ và đường băng → vòng quần đảo → về theo làn Bắc/Tây → kênh làn Bắc z 190 → lên eo làn Tây → cập bến.
  const DEF={ plots:{ marina:{x:-38, z:126, nx:1, nz:0, deckY:2.0, stem:8}, stage:{x:-100, z:-212, yaw:0}, watersports:{x:-215, z:40, rx:18, rz:70}, parasail:{x:-170, z:-262, rx:38, rz:26} },
    bayLoop:{x:0, z:-12, r:80}, strait:{x:0, z:140, nx:0, nz:1, w:76},
    seaOut:[[6,96],[-4,118],[-8,140],[-14,158],[-21,171],[-24,184],[-36,206],[-70,207],[-110,207],[-150,207],[-176,206],[-202,213],[-210,248],[-246,296],[-300,338],[-356,372]],
    seaBack:[[-450,352],[-380,338],[-320,318],[-262,282],[-240,262],[-232,240],[-228,214],[-216,196],[-195,191],[-160,191],[-120,191],[-85,191],[-62,191],[-46,186],[-37,170],[-30,156]],
    karst:{ x0:-600, x1:-255, z0:398, z1:660, cut:[{x0:-405, x1:-255, z0:478, z1:660}], keepOut:[{x0:-1800, x1:-250, z0:300, z1:398, hMax:12}], hMax:100,
      islands:[ {x:-520,z:450,r:34,h:100,seed:41,name:'Hòn Mẹ Release', caves:[[.6,12,9],[2.2,8,6],[5.2,10,7]]},
        {x:-470,z:580,r:32,h:58,seed:23,name:'Hòn Cổng Regression', twin:true, caves:[]},
        {x:-560,z:590,r:26,h:84,seed:11,name:'Hòn Bug Ngủ', caves:[[2.4,9,7],[4.1,7,5]]},
        {x:-365,z:452,r:18,h:70,seed:37,name:'Hòn Bút Test Case', caves:[[3.6,6,5]]},
        {x:-300,z:446,r:21,h:68,seed:53,name:'Hòn Ngọc Pipeline', caves:[[1.2,8,6],[3.9,7,5]]} ],
      loop:[[-390,398],[-430,430],[-455,470],[-455,512],[-505,520],[-585,522],[-618,495],[-612,430],[-585,388],[-520,368]] } };
  const WA=W.ABY||{}, PRE=!W.ABY;
  const LANES=[]; if(Array.isArray(WA.seaOut) && Array.isArray(WA.seaBack)) LANES.push({name:'W.ABY', out:WA.seaOut, back:WA.seaBack}); LANES.push({name:'dự phòng phiên B', out:DEF.seaOut, back:DEF.seaBack}); let LN=LANES[0];
  const ABY={...DEF, ...WA, plots:{...DEF.plots, ...(WA.plots||{})}, karst:{...DEF.karst, ...(WA.karst||{})}};
  if(WA.karst && (WA.karst.islands || WA.karst.loop) && !WA.seaOut){ /* A đổi quần đảo nhưng không đưa tuyến → giữ tuyến tạm, routeCheck sẽ báo nếu chạm */ }
  const PL=ABY.plots, KS=ABY.karst, M0=PL.marina;
  const MAR={sx:M0.x, sz:M0.z, nx:M0.nx ?? Math.sin(M0.dir??Math.PI), nz:M0.nz ?? Math.cos(M0.dir??Math.PI), deckY:M0.deckY ?? 2.0, stem:M0.stem ?? 40};
  { const l=Math.hypot(MAR.nx,MAR.nz)||1; MAR.nx/=l; MAR.nz/=l; }
  const N2=[MAR.nx,MAR.nz], U2=[MAR.nz,-MAR.nx], S2=[-MAR.nx,-MAR.nz];   /* hướng ra nước · hướng mũi tàu khi cập bến · hướng mạn phải tàu (về phía bờ) */
  const MW=(a,b)=>[MAR.sx+U2[0]*a+N2[0]*b, MAR.sz+U2[1]*a+N2[1]*b];       /* toạ độ bến: a dọc bờ (theo hướng mũi tàu), b ra nước tính từ điểm bờ */
  const DY=MAR.deckY, PB=MAR.stem, GA=15.6, YB=PB+.6+4.75, COMPACT=PB<14;   /* COMPACT: bến sát vách (1 dải cầu gỗ rộng = stem) thay cho lối gỗ + cầu tàu + phao nổi */
  const DOCK={x:MW(GA,YB)[0], z:MW(GA,YB)[1], yaw:Math.atan2(U2[0],U2[1])};
  const fitZone=(Z,pad=6)=>{ if(!Z) return Z; const B=[], st=2.5, ex=1.25;   /* lưới 2,5 m quanh vùng → điểm cạn / có cầu-sàn thấp; rồi tìm elip lớn nhất không chứa điểm nào */
    for(let x=Z.x-(Z.rx*ex+pad); x<=Z.x+Z.rx*ex+pad; x+=st) for(let z=Z.z-(Z.rz*ex+pad); z<=Z.z+Z.rz*ex+pad; z+=st) if(W.groundH(x,z)>WY-1.2 || lowPlat(x,z,6)) B.push([x,z]);
    const hit=c=>B.some(([x,z])=>Math.pow((x-c.x)/(c.rx+pad),2)+Math.pow((z-c.z)/(c.rz+pad),2)<1);
    if(!hit(Z)) return Z; let best=null; for(const sc of [1,.85,.7,.6,.5,.4]) for(let dx=-1;dx<=1;dx+=.25) for(let dz=-1;dz<=1;dz+=.0625){ const c={x:Z.x+dx*Z.rx*.6, z:Z.z+dz*Z.rz*.8, rx:Z.rx*Math.min(1,sc*1.3), rz:Z.rz*sc}; if(!hit(c)){ const ar=c.rx*c.rz-.01*Math.hypot(dx,dz); if(!best || ar>best.ar) best={...c, ar}; } }
    if(best){ delete best.ar; console.info('[abyssal_sea] vùng nước chỉnh để né cầu/cạn:', JSON.stringify(Z), '→', JSON.stringify(best)); return best; } return Z; };
  let SPORT=PL.watersports, PARA=PL.parasail;   /* fitZone chạy ngay sau khi có lowPlat (dưới) */
  const ISL=KS.islands.map((o,i)=>({seed:11+i*13, caves:[], name:'Hòn đá vôi '+(i+1), ...o}));
  const lowPlat=(x,z,top)=>{ if(!W.platH) return false; const h=W.platH(x,z); return h>WY-1 && h<WY+top; };   /* sàn/cầu sát hoặc trên mặt nước nhưng thấp hơn đỉnh vật (cầu cao +16 không chặn) */
  SPORT=fitZone(SPORT,6); PARA=fitZone(PARA,10);
  const inBox=(x,z,b,p=0)=>x>b.x0-p && x<b.x1+p && z>b.z0-p && z<b.z1+p;
  const KB={x0:KS.x0, x1:KS.x1, z0:KS.z0, z1:KS.z1}, karstOK=(x,z,r,h)=>inBox(x,z,{x0:KB.x0+r,x1:KB.x1-r,z0:KB.z0+r,z1:KB.z1-r}) && !(KS.cut||[]).some(c=>inBox(x,z,c,r)) && !(KS.keepOut||[]).some(c=>h>(c.hMax??12) && inBox(x,z,c,r));
  for(const I of ISL){ const rr=I.r*1.3+(I.twin?20:0); if(!karstOK(I.x,I.z,rr,I.h)) console.warn('[abyssal_sea] đảo nằm ngoài vùng karst cho phép / chạm vùng cắt:', I.name, I.x, I.z); }
  function buildRoute(){ const D=[DOCK.x,DOCK.z], u=U2, ah=(k)=>[D[0]+u[0]*k, D[1]+u[1]*k];
    if(Array.isArray(ABY.yachtRoute) && ABY.yachtRoute.length>3) return [D, ah(45), ...ABY.yachtRoute, ah(-80), ah(-40)];
    const pts=[D, ah(45)], BL=ABY.bayLoop;
    if(BL){ /* vòng quanh đảo khách sạn: bán kính BL.r, chỗ nào cạn (thềm bãi cát trước 2 cánh nhà phía Bắc) thì co vào – vẫn cách kè đảo ≥ 5 m */
      const s=ah(45), a0=Math.atan2(s[1]-BL.z, s[0]-BL.x), HR=((PL.hotel||{}).r??58)+10, deep=(x,z)=>W.groundH(x,z)<WY-2.3, P=(a,r)=>[BL.x+Math.cos(a)*r, BL.z+Math.sin(a)*r];
      const rs=[]; for(let i=1;i<=12;i++){ const a=a0+i*TAU*.8/12; let r=BL.r; while(r>HR && !(deep(...P(a,r)) && deep(...P(a,r+3)))) r-=1; rs.push([a,Math.max(r,HR)]); }
      for(let i=0;i<rs.length;i++){ const r=Math.min(rs[i][1], rs[Math.max(0,i-1)][1]+6, rs[Math.min(rs.length-1,i+1)][1]+6); pts.push(P(rs[i][0],r)); } }
    pts.push(...LN.out, ...KS.loop, ...LN.back, ah(-40)); return pts; }

  /* ============================== 1. QUẦN ĐẢO ĐÁ VÔI NGỌC BÍCH ============================== */
  const karstTex=(()=>{ const t=cvs(512,512,(g,w,h)=>{ const R=AK.rng(91); g.fillStyle='#c4bfb3'; g.fillRect(0,0,w,h);
      for(let i=0;i<260;i++){ const x=R()*w, y=R()*h, r=6+R()*26; g.fillStyle=R()<.5?`rgba(90,86,78,${.04+R()*.07})`:`rgba(235,230,215,${.05+R()*.08})`; for(const ox of [-w,0,w]) for(const oy of [-h,0,h]){ g.beginPath(); g.ellipse(x+ox,y+oy,r*1.6,r,0,0,TAU); g.fill(); } }   /* mảng sáng tối */
      for(let i=0;i<22;i++){ const y=R()*h; g.strokeStyle=`rgba(80,74,66,${.05+R()*.1})`; g.lineWidth=1+R()*2; g.beginPath(); for(let x=0;x<=w;x+=12){ const yy=y+Math.sin(x*.025+i)*5+Math.sin(x*.11+i*3)*1.5; x?g.lineTo(x,yy):g.moveTo(x,yy); } g.stroke(); }   /* vỉa đá ngang */
      for(let i=0;i<220;i++){ const x=R()*w, y0=R()*h, L=60+R()*300, wd=1+R()*6, c=R()<.8?'30,28,26':'170,110,60', gr=g.createLinearGradient(0,y0,0,y0+L); gr.addColorStop(0,`rgba(${c},0)`); gr.addColorStop(.25,`rgba(${c},${.18+R()*.35})`); gr.addColorStop(1,`rgba(${c},0)`); g.fillStyle=gr; for(const oy of [-h,0,h]) g.fillRect(x,y0+oy,wd,L); }   /* vệt nhũ đá chảy dọc (đen, đôi khi gỉ cam) */
    }); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; })();
  const rockMat=new THREE.MeshStandardMaterial({map:karstTex, vertexColors:true, roughness:.92}); rockMat.name='karst';
  const C=new THREE.Color();
  // tháp đá vôi: lưới vòng liên tục (NS cột × NR hàng) + chỏm tròn. Bán kính r(θ,y) = mặt bằng gồ ghề × khía sóng chân đảo × phình/thắt theo độ cao (vách lồi lõm, hàm ếch) × gờ ngang ~11 m × hang vòm.
  // Cây/bụi mọc ở mọi chỗ mặt đá HƯỚNG LÊN (gờ, chỏm) – lấy theo pháp tuyến sau khi dựng lưới → giống đảo đá vôi thật, không dán đĩa xanh lên vách.
  function karst(pos, col, uv, idx, cx, cz, r, h, seed, caves=[]){ const R=AK.rng(seed), ph=[...Array(9)].map(()=>R()*TAU), NS=LOW?44:64, NR=LOW?28:42, Y0=-3;
    const plan=a=>1+.13*Math.sin(a*2+ph[0])+.08*Math.sin(a*3+ph[1])+.05*Math.sin(a*5+ph[2]);
    const lobe=(a,y)=>1+.09*Math.sin(a*3+y*.055+ph[3])+.06*Math.sin(a*5-y*.08+ph[4])+.05*Math.sin(y*.19+ph[5])+.035*Math.sin(a*9+y*.13+ph[6]);
    const ledge=y=>{ const f=(((y+ph[7]*3)/11)%1+1)%1; return 1+.028*Math.sin(f*Math.PI)*ss(.55,1,f)*2-.012; };
    const prof=(y,dome=true)=>{ const t=y/h; let k=.84+.16*ss(.4,3.4,y); if(dome && t>.72) k*=Math.sqrt(Math.max(.015,1-Math.pow((t-.72)/.3,2))); return k; };
    const shape=(a,y,dome=true)=>{ const k=ss(1.2,7,y); return r*plan(a)*prof(y,dome)*lerp(1,lobe(a,y)*ledge(y),k); };
    const cave=(a,y)=>{ let d=0; for(const [ac,w,hc] of caves){ const da=Math.abs(((a-ac)%TAU+TAU+Math.PI)%TAU-Math.PI)*r; if(da<w && y<hc){ const u=1-Math.pow(da/w,2), v=1-Math.pow(Math.max(0,y)/hc,2); d=Math.max(d,u*v); } } return d; };
    const base=pos.length/3;
    for(let j=0;j<=NR;j++){ const y=Y0+(h-Y0)*Math.pow(j/NR,1.05);
      for(let i=0;i<=NS;i++){ const a=i/NS*TAU, cv=cave(a,y), rr=Math.max(.6, shape(a,y)*(1+.018*Math.sin(a*29+ph[8]+y*.1))*(1-.45*cv)); pos.push(cx+Math.cos(a)*rr, y, cz+Math.sin(a)*rr); uv.push(a*r/16, y/16);
        const br=.86+.12*Math.sin(a*7+ph[1]+y*.04), st=Math.pow(Math.max(0,Math.sin(a*13+ph[8])*Math.sin(a*5.3+ph[1]+y*.012)),3), wet=y<2.4?.42+.4*ss(-1,2.4,y):1;
        C.setRGB(.8*br,.78*br,.72*br).multiplyScalar((1-.5*st)*wet*(1-.75*cv)); col.push(C.r,C.g,C.b); } }
    for(let j=0;j<NR;j++) for(let i=0;i<NS;i++){ const a=base+j*(NS+1)+i, b=a+NS+1; idx.push(a,b,a+1, a+1,b,b+1); }
    const top=pos.length/3; pos.push(cx, h*1.04, cz); uv.push(0,0); C.setRGB(.2,.3,.14); col.push(C.r,C.g,C.b); const lr=base+NR*(NS+1); for(let i=0;i<NS;i++) idx.push(lr+i, lr+i+1, top);
    return {plan, prof, shape, r, h, cx, cz}; }
  const inOther=(x,z,pad)=>Object.entries(ZONES).some(([k,Z])=>k!=='abyssal' && x>Z.x0-pad && x<Z.x1+pad && z>Z.z0-pad && z<Z.z1+pad);   /* chạm vùng khác (cách ≥ pad m) */
  const towers=[], TREES=[];
  { const pos=[], col=[], uv=[], idx=[];
    for(const I of ISL){ if(I.twin){ for(const e of [-1,1]) towers.push(karst(pos, col, uv, idx, I.x+e*18, I.z+e*4, 11.5, I.h-(e>0?8:0), I.seed+e, [[e>0?Math.PI:0,6,6]]));
        /* VÒM ĐÁ nối 2 tháp (cổng): mép dưới vòm cao ≈ 13 m giữa nhịp, lòng rộng ≈ 10–14 m – kayak, mô tô nước, flyboard luồn qua */
        const a=new THREE.CatmullRomCurve3([new THREE.Vector3(I.x-15,11,I.z-3.4), new THREE.Vector3(I.x-6,18.5,I.z-1.2), new THREE.Vector3(I.x+6,18.5,I.z+1.2), new THREE.Vector3(I.x+15,11,I.z+3.4)]);
        const tg=new THREE.TubeGeometry(a,48,5,16,false), p=tg.attributes.position, nn=tg.attributes.normal;
        for(let i=0;i<p.count;i++){ const k=.9*Math.sin(p.getX(i)*.45+p.getY(i)*.9)+.6*Math.sin(p.getZ(i)*1.3+p.getX(i)*.2)+(nn.getY(i)>.3?1.2*nn.getY(i):0); p.setXYZ(i,p.getX(i)+nn.getX(i)*k,p.getY(i)+nn.getY(i)*k,p.getZ(i)+nn.getZ(i)*k); }
        const b=pos.length/3; for(let i=0;i<p.count;i++){ pos.push(p.getX(i),p.getY(i),p.getZ(i)); uv.push(tg.attributes.uv.getX(i)*4, tg.attributes.uv.getY(i)*2); const br=.85+.12*Math.sin(i*.37); C.setRGB(.78*br,.76*br,.7*br); col.push(C.r,C.g,C.b); } const ti=tg.index.array; for(let i=0;i<ti.length;i++) idx.push(b+ti[i]);
        continue; }
      towers.push(karst(pos, col, uv, idx, I.x, I.z, I.r, I.h, I.seed, I.caves)); }
    /* 8 cột đá nhỏ quanh các đảo (cách luồng tàu ≥ 30 m) */ const R=AK.rng(77); let n=0; const rp=new THREE.CatmullRomCurve3(buildRoute().map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal').getSpacedPoints(400);
    for(let k=0;k<90 && n<8;k++){ const I=ISL[k%5], a=R()*TAU, d=I.r+14+R()*22, x=I.x+Math.cos(a)*d, z=I.z+Math.sin(a)*d; const rr=3.5+4*.5, hh=32; if(!karstOK(x,z,rr*1.3,hh) || inOther(x,z,12)) continue; if(rp.some(v=>Math.hypot(v.x-x,v.z-z)<30)) continue; towers.push(karst(pos,col,uv,idx,x,z,3.5+R()*4,12+R()*20,300+k)); towers[towers.length-1].small=true; n++; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
    /* mặt hướng lên (gờ, chỏm, lưng vòm) → phủ xanh rêu/cây bụi; chọn ngẫu nhiên vài đỉnh làm gốc cây */
    { const P3=g.attributes.position, N3=g.attributes.normal, CC=g.attributes.color, R2=AK.rng(5150), G=new THREE.Color(), cap=LOW?700:1500; let budget=cap;
      for(let i=0;i<P3.count;i++){ const ny=N3.getY(i), y=P3.getY(i); if(y<3.5) continue; const k=ss(.22,.6,ny); if(k<=0) continue; G.setRGB(.17+.06*R2(),.27+.08*R2(),.12+.04*R2()); C.setRGB(CC.getX(i),CC.getY(i),CC.getZ(i)).lerp(G,k*.92); CC.setXYZ(i,C.r,C.g,C.b);
        if(budget>0 && ny>.45 && R2()<.42){ budget--; const big=ny>.8; TREES.push([P3.getX(i)+N3.getX(i)*.3, y+N3.getY(i)*.2, P3.getZ(i)+N3.getZ(i)*.3, big?1.4+R2()*2.2:.8+R2()*1.3]); } } }
    const m=new THREE.Mesh(g,rockMat); m.name='abyssal-karst-islands'; m.castShadow=true; m.receiveShadow=true; root.add(m); }
  // cây / bụi (InstancedMesh, mọc theo gờ đá + chỏm)
  { const R=AK.rng(5151), blob=new THREE.IcosahedronGeometry(1,1); { const p=blob.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i), k=1+.18*Math.sin(x*5+z*3)+.12*Math.sin(y*6); p.setXYZ(i,x*k,y*.85*k,z*k); } blob.computeVertexNormals(); }
    const im=new THREE.InstancedMesh(blob, std(0xffffff,{roughness:.88}), TREES.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler();
    TREES.forEach(([x,y,z,s],i)=>{ q.setFromEuler(e.set((R()-.5)*.3,R()*TAU,(R()-.5)*.3)); m4.compose(new THREE.Vector3(x,y+s*.35,z),q,new THREE.Vector3(s,s*(.8+R()*.4),s)); im.setMatrixAt(i,m4); C.setHSL(.25+R()*.08,.42+R()*.18,.1+R()*.09); im.setColorAt(i,C); });
    im.castShadow=!LOW; im.receiveShadow=true; im.name='abyssal-karst-trees'; root.add(im); }
  // bọt sóng trắng quanh chân đảo (1 lưới gộp, cộng sáng, cuộn texture)
  const foamTex=(()=>{ const t=cvs(256,64,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); const R=AK.rng(8); for(let i=0;i<700;i++){ const y=h*Math.pow(R(),1.6), a=(1-y/h)*.8; g.fillStyle=`rgba(255,255,255,${a*R()})`; g.beginPath(); g.ellipse(R()*w,y,2+R()*9,1+R()*2.5,0,0,TAU); g.fill(); } }); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; })();
  const foamMat=new THREE.MeshBasicMaterial({map:foamTex, transparent:true, opacity:.75, blending:THREE.AdditiveBlending, depthWrite:false}); foamMat.name='karst-foam';
  { const pos=[], uv=[], idx=[]; for(const T of towers){ const NS=48, b=pos.length/3; for(let i=0;i<=NS;i++){ const a=i/NS*TAU, r0=T.r*T.plan(a)*T.prof(.2)-.2, w=T.small?2:3.6; for(const [rr,v] of [[r0,0],[r0+w,1]]){ pos.push(T.cx+Math.cos(a)*rr, WY+.06, T.cz+Math.sin(a)*rr); uv.push(a*T.r/6, v); } }
      for(let i=0;i<NS;i++){ const a=b+i*2; idx.push(a,a+2,a+1, a+1,a+2,a+3); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); const m=new THREE.Mesh(g,foamMat); m.renderOrder=3; m.userData.dynamic=true; m.name='abyssal-karst-foam'; dyn.add(m); }
  for(const I of ISL) makeLabel('⛰️ '+I.name, 'Quần đảo Đá Vôi Ngọc Bích', {h:.5, x:I.x, y:I.h+8, z:I.z, fade:420});
  const hitIsland=(x,z,pad)=>{ for(const T of towers){ const dx=x-T.cx, dz=z-T.cz, d=Math.hypot(dx,dz); if(d>T.r*1.35+pad) continue; const a=Math.atan2(dz,dx); if(d<T.r*T.plan(a)*.95+pad) return true; } return false; };

  /* ============================== 2. BẾN SIÊU DU THUYỀN ============================== */
  const YK=makeYachtKit(W);
  const teak=YK.M.teak, bronze=std(0x8c6a3a,{roughness:.35, metalness:.85}), pile=std(0x3b2e24,{roughness:.9}), stoneM=std(0x3b312b,{roughness:.78}), glowM=std(0xffcf70,{emissive:0xffb84d, emissiveIntensity:1.2, roughness:.3});
  const mb={}; const putM=(mat,geo,x,y,z,ry=0)=>{ let g=geo.index?geo.toNonIndexed():geo; for(const k of Object.keys(g.attributes)) if(!['position','normal','uv'].includes(k)) g.deleteAttribute(k); if(!g.attributes.uv) g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); if(ry) g.rotateY(ry); g.translate(x,y,z); (mb[mat.uuid]=mb[mat.uuid]||{mat,list:[]}).list.push(g); };
  const ang=Math.atan2(U2[0],U2[1]);   /* góc của trục a (dọc bờ) */
  // sàn: hình chữ nhật trong hệ (a, b) → tấm teak + plat đứng + cọc
  function deckRect(a0,a1,b0,b1,y=DY,o={}){ const [cx,cz]=MW((a0+a1)/2,(b0+b1)/2), la=a1-a0, lb=b1-b0; let g=AK.roundedBox(lb,.24,la,.05,1).clone(); g=g.index?g.toNonIndexed():g;
    g.rotateY(ang); g.translate(cx,y-.12,cz); { const p=g.attributes.position, uv=g.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i, p.getX(i)*S2[0]+p.getZ(i)*S2[1], p.getX(i)*U2[0]+p.getZ(i)*U2[1]+p.getY(i)); } putM(teak, g, 0, 0, 0, 0);   /* UV theo mét → ván teak đúng tỉ lệ */
    addPlat(cx,cz,ang,lb/2,la/2,y);
    if(o.piles!==false) for(let a=a0+1;a<a1;a+=4) for(const b of [b0+.4,b1-.4]){ const [x,z]=MW(a,b); putM(pile, new THREE.CylinderGeometry(.22,.26,y-WY+3.2,8), x, (y+WY-3.2)/2-.1, z); } }
  // lan can (kính + tay vịn đồng) theo đoạn trong hệ (a,b) + va chạm
  const RAILS=[]; function rail(a0,b0,a1,b1,msg='⚓ Lan can cầu tàu'){ const [x0,z0]=MW(a0,b0), [x1,z1]=MW(a1,b1); addSeg(x0,z0,x1,z1,.14,DY-1.2,DY+2.2,msg); RAILS.push([x0,z0,x1,z1]); }
  // lối gỗ ven bờ (spine) · cầu tàu chính (stem) · phao nổi (cập du thuyền) · cầu thuê đồ chơi nước
  const SPINE=COMPACT?[-30,44]:[-34,52], STEM=[-2,2], RP=[-26,-22], RL=[-34,-22,18,22];   /* cầu tàu chính đúng chỗ cầu lên tàu (a = 0) · cầu thuê đồ chơi nước chữ L */
  if(COMPACT){ /* bến gọn sát vách: 1 dải cầu gỗ rộng = stem; mép ngoài hở đúng chỗ tàu cập (a −7…37) và chỗ xuống mô tô nước / kayak (a −28…−22) */
    deckRect(SPINE[0],SPINE[1],-.6,PB);
    rail(SPINE[0],PB,-28,PB); rail(-22,PB,-7,PB); rail(37,PB,SPINE[1],PB); rail(SPINE[0],-.6,SPINE[0],PB,'⚓ Đầu bến'); rail(SPINE[1],-.6,SPINE[1],PB,'⚓ Đầu bến'); }
  else { deckRect(SPINE[0],SPINE[1],-.6,7,DY,{piles:!PRE}); deckRect(STEM[0],STEM[1],6.9,PB-3.9); deckRect(-6,40,PB-4,PB);
    deckRect(RP[0],RP[1],6.9,RL[2]+.1); deckRect(RL[0],RL[1],RL[2],RL[3]);
    rail(SPINE[0],7,RL[0],7); rail(RP[1],7,STEM[0],7); rail(STEM[1],7,SPINE[1],7); rail(SPINE[1],-.6,SPINE[1],7); rail(SPINE[0],-.6,SPINE[0],7);
    rail(RP[1],7,RP[1],RL[3]); rail(RP[0],7,RP[0],RL[2]); rail(RL[0],RL[2],RP[0],RL[2]); rail(RL[0],RL[2],RL[0],RL[3],'⚓ Mép cầu thuê đồ chơi nước');
    rail(STEM[0],7,STEM[0],PB-4); rail(STEM[1],7,STEM[1],PB-4); rail(-6,PB-4,STEM[0],PB-4); rail(STEM[1],PB-4,40,PB-4); rail(40,PB-4,40,PB,'⚓ Đầu phao nổi'); rail(-6,PB-4,-6,PB,'⚓ Đầu phao nổi'); }
  // tay vịn đồng + kính
  for(const [x0,z0,x1,z1] of RAILS){ const L=Math.hypot(x1-x0,z1-z0); if(L<.3) continue; const ry=Math.atan2(x1-x0,z1-z0); putM(bronze, new THREE.CylinderGeometry(.035,.035,L,6).rotateX(Math.PI/2), (x0+x1)/2, DY+1.0, (z0+z1)/2, ry); putM(YK.M.glassNear, new THREE.BoxGeometry(.02,.85,L), (x0+x1)/2, DY+.52, (z0+z1)/2, ry);
    for(let t=0;t<=L;t+=2.4){ const k=t/L; putM(bronze, new THREE.CylinderGeometry(.03,.03,1,6), x0+(x1-x0)*k, DY+.5, z0+(z1-z0)*k); } }
  // cọc neo (bollard) + bích (cleat) đồng dọc mép phao, đèn cột 2 nhánh mỗi 12 m
  const LAMPS=[]; for(let a=-4;a<=38;a+=6){ const [x,z]=MW(a,PB-.35); putM(bronze, new THREE.LatheGeometry([[0,0],[.2,0],[.2,.06],[.13,.1],[.12,.42],[.19,.48],[.19,.56],[0,.58]].map(([r,y])=>new THREE.Vector2(r,y)),12), x, DY, z); }
  for(const [a,b] of COMPACT ? [[-29,PB-.4],[-16,PB-.4],[-4,.2],[10,.2],[24,.2],[38,PB-.4],[43,.2]] : [[STEM[0]+.3,14],[STEM[0]+.3,38],[STEM[1]-.3,26],[STEM[1]-.3,50],[8,PB-3.7],[20,PB-3.7],[32,PB-3.7],[-30,6.6],[-14,6.6],[10,6.6],[22,6.6],[34,6.6],[46,6.6],[RP[1]-.3,13],[RL[0]+.3,RL[2]+.3]]) LAMPS.push(MW(a,b));
  for(const [x,z] of LAMPS){ putM(bronze, new THREE.CylinderGeometry(.06,.1,3.6,8), x, DY+1.8, z); putM(bronze, new THREE.TorusGeometry(.42,.03,6,16,Math.PI).rotateZ(0), x, DY+3.4, z); for(const e of [-1,1]) putM(glowM, new THREE.SphereGeometry(.17,12,8), x+e*.42, DY+3.32, z); }
  // dây neo (chỉ hiện khi có tàu cập) – 2 dây từ bích trên phao tới mũi/đuôi tàu
  const moor=new THREE.Group(); moor.userData.dynamic=true; root.add(moor); { const rope=std(0xd8c9a3,{roughness:.9}); for(const [aa,la] of [[GA-17,-17.5],[GA+16,16]]){ const [px,pz]=MW(aa,PB-.35), [yx,yz]=MW(GA+la,YB-4.2); const c=new THREE.CatmullRomCurve3([new THREE.Vector3(px,DY+.5,pz), new THREE.Vector3((px+yx)/2,DY-.2,(pz+yz)/2), new THREE.Vector3(yx,DY+.4,yz)]); moor.add(new THREE.Mesh(new THREE.TubeGeometry(c,12,.04,5,false),rope)); } moor.visible=false; }
  // quầy vé (kiosk bo tròn) + quầy thuê đồ chơi nước + bảng hiệu
  const KIOSK=COMPACT?MW(-10,2.4):MW(-8,3.4), RENT=COMPACT?MW(-24,2.4):MW(-24,3.6);
  { const s=new THREE.Shape(); s.absarc(0,0,1.8,0,TAU,false); const body=new THREE.ExtrudeGeometry(s,{depth:2.6, bevelEnabled:true, bevelThickness:.06, bevelSize:.05, bevelSegments:3, curveSegments:28}); body.rotateX(-Math.PI/2);
    for(const [x,z] of [KIOSK,RENT]){ putM(YK.M.white, body.clone(), x, DY, z); putM(YK.M.gold, new THREE.CylinderGeometry(2.0,2.0,.12,28), x, DY+2.72, z); putM(YK.M.navy, new THREE.ConeGeometry(2.3,1.1,28), x, DY+3.3, z); putM(YK.M.gold, new THREE.SphereGeometry(.16,10,8), x, DY+3.9, z); W.circles.push({x, z, r:1.95, y0:DY-.5, y1:DY+4}); } }
  const sign=(txt,sub,x,z,ry,col='#d4af37')=>{ const t=cvs(512,160,(g,w,h)=>{ g.fillStyle='#0f1c33'; g.fillRect(0,0,w,h); g.strokeStyle=col; g.lineWidth=6; g.strokeRect(6,6,w-12,h-12); g.fillStyle=col; g.font='bold 46px sans-serif'; g.textAlign='center'; g.fillText(txt,w/2,72,w-30); g.fillStyle='#e8dcc4'; g.font='26px sans-serif'; g.fillText(sub,w/2,122,w-30); });
    const m=new THREE.Mesh(new THREE.PlaneGeometry(3.4,1.06), new THREE.MeshBasicMaterial({map:t})); m.position.set(x,DY+3.05,z); m.rotation.y=ry; m.userData.dynamic=true; root.add(m); return m; };
  { const fy=Math.atan2(S2[0],S2[1]); sign('SUPERYACHT MARINA','Tour vịnh & quần đảo · 150 💰',KIOSK[0]+S2[0]*1.95,KIOSK[1]+S2[1]*1.95,fy); sign('WATER SPORTS','Dù bay · mô tô nước · kayak · flyboard',RENT[0]+S2[0]*1.95,RENT[1]+S2[1]*1.95,fy,'#7fe3ff'); }
  for(const k in mb){ const {mat,list}=mb[k]; const g=W.mergeGeometries?W.mergeGeometries(list,false):null; for(const gg of (g?[g]:list)){ const m=new THREE.Mesh(gg,mat); m.castShadow=mat!==YK.M.glassNear && mat!==glowM; m.receiveShadow=true; m.name='abyssal-marina'; root.add(m); } }
  makeLabel('🛥️ Bến Siêu Du Thuyền', 'Quầy vé tour 3 tầng · tàu cập bến mỗi ~1 phút', {h:.6, x:KIOSK[0], y:DY+5.2, z:KIOSK[1], fade:180});
  makeLabel('🌊 Thể thao nước', 'Dù bay ca-nô · mô tô nước · kayak đôi · flyboard', {h:.5, x:RENT[0], y:DY+5.2, z:RENT[1], fade:150});

  /* ============================== 3. ĐỘI 8 SIÊU DU THUYỀN – TUYẾN KHÉP KÍN, LỆCH PHA ============================== */
  const NY=8, fleet=YK.makeFleet(NY, dyn), near=YK.makeNear(dyn); near.g.visible=false;
  function makeRT(DWELL,GAP){ const pts=buildRoute(), curve=new THREE.CatmullRomCurve3(pts.map(([x,z])=>new THREE.Vector3(x,0,z)), true, 'centripetal'), L=curve.getLength(), n=Math.ceil(L), sp=curve.getSpacedPoints(n);
    const X=new Float32Array(n+1), Z=new Float32Array(n+1), YAW=new Float32Array(n+1), K=new Float32Array(n+1);
    for(let i=0;i<=n;i++){ X[i]=sp[i].x; Z[i]=sp[i].z; } for(let i=0;i<=n;i++){ const a=sp[Math.max(0,i-3)], b=sp[Math.min(n,i+3)]; YAW[i]=Math.atan2(b.x-a.x,b.z-a.z); }
    for(let i=0;i<=n;i++){ let d=YAW[Math.min(n,i+4)]-YAW[Math.max(0,i-4)]; d=Math.atan2(Math.sin(d),Math.cos(d)); K[i]=Math.abs(d)/8; }   /* độ cong (rad/m) */
    const ACC=.32, ALAT=.55;   /* gia tốc dọc, gia tốc ngang khi cua, thời gian đỗ đón khách, khoảng trống tối thiểu (s) trước tàu sau */
    const prof=(vmax)=>{ const v=new Float32Array(n+1); for(let i=0;i<=n;i++){ const kk=Math.max(K[Math.max(0,i-12)],K[i],K[Math.min(n,i+12)]); v[i]=Math.min(vmax, kk>1e-4?Math.sqrt(ALAT/kk):vmax); }
      v[0]=0; v[n]=0; for(let i=1;i<=n;i++) v[i]=Math.min(v[i],Math.sqrt(v[i-1]*v[i-1]+2*ACC)); for(let i=n-1;i>=0;i--) v[i]=Math.min(v[i],Math.sqrt(v[i+1]*v[i+1]+2*ACC));
      const t=new Float32Array(n+1); for(let i=1;i<=n;i++){ const vm=Math.max(.15,(v[i]+v[i-1])/2); t[i]=t[i-1]+1/vm; } return {v,t}; };
    /* chọn vmax sao cho chu kỳ P = 8 × (đỗ + khoảng trống) → tàu sau luôn tới bến SAU khi tàu trước đã rời đủ xa */
    const want=NY*(DWELL+GAP)-DWELL; let lo=2, hi=12, pr=null; for(let it=0;it<30;it++){ const mid=(lo+hi)/2; pr=prof(mid); if(pr.t[n]>want) lo=mid; else hi=mid; } pr=prof(hi);
    const TT=pr.t[n], PER=TT+DWELL;
    return {pts, L, n, X, Z, YAW, v:pr.v, t:pr.t, TT, PER, DWELL, GAP, vmax:hi}; }
  let RT=makeRT(32,28);
  const sAt=(tt)=>{ const t=RT.t; let lo=0, hi=RT.n; while(hi-lo>1){ const m=(lo+hi)>>1; if(t[m]<=tt) lo=m; else hi=m; } const f=(tt-t[lo])/Math.max(1e-6,t[hi]-t[lo]); return lo+clamp(f,0,1); };
  const poseOf=(k,T,out={})=>{ const tau=((T+k*RT.PER/NY)%RT.PER+RT.PER)%RT.PER; let fi=0, v=0, docked=false; if(tau<RT.DWELL){ docked=true; fi=0; } else { fi=sAt(tau-RT.DWELL); }
    const i=Math.floor(fi), f=fi-i, j=Math.min(RT.n,i+1); out.x=RT.X[i]+(RT.X[j]-RT.X[i])*f; out.z=RT.Z[i]+(RT.Z[j]-RT.Z[i])*f; let dy=RT.YAW[j]-RT.YAW[i]; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); out.yaw=RT.YAW[i]+dy*f; if(docked) out.yaw=DOCK.yaw;
    out.v=docked?0:RT.v[i]+(RT.v[j]-RT.v[i])*f; out.docked=docked; out.tau=tau; out.s=fi; out.turn=docked?0:(RT.YAW[Math.min(RT.n,i+6)]-RT.YAW[Math.max(0,i-6)]); out.turn=Math.atan2(Math.sin(out.turn),Math.cos(out.turn)); return out; };
  // MÔ PHỎNG CHỐNG VA: chạy thử 1 chu kỳ (bước 0,5 s), mỗi tàu = 3 vòng r 5,2 m dọc thân → khoảng cách nhỏ nhất giữa mọi cặp tàu.
  // Tuyến có chỗ làn đi / làn về gần nhau (cửa eo, kênh) → nếu có cặp < 1,5 m thì đổi thời gian đỗ / khoảng giãn rồi thử lại.
  const sepOf=()=>{ let best=1e9, at=null; const A=[...Array(NY)].map(()=>({})), c=[[0,0,0],[0,0,0],[0,0,0]];
    for(let T=0;T<RT.PER;T+=.5){ for(let k=0;k<NY;k++) poseOf(k,T,A[k]);
      for(let i=0;i<NY;i++) for(let j=i+1;j<NY;j++){ const a=A[i], b=A[j]; if(Math.abs(a.x-b.x)>60 || Math.abs(a.z-b.z)>60) continue;
        for(const oa of [-14,0,14]) for(const ob of [-14,0,14]){ const d=Math.hypot(a.x+Math.sin(a.yaw)*oa-b.x-Math.sin(b.yaw)*ob, a.z+Math.cos(a.yaw)*oa-b.z-Math.cos(b.yaw)*ob)-10.4; if(d<best){ best=d; at=[Math.round(a.x),Math.round(a.z),i,j,T]; } } } }
    return {sep:+best.toFixed(1), at}; };
  let LANE_LOG=[];
  function pickRoute(){ let pick=null; LANE_LOG=[];
    for(const ln of LANES){ LN=ln; RT=makeRT(32,28); const bad=routeCheck(true), nb=bad.length; let best=null;
      if(!nb) for(const [dw,gp] of [[32,28],[30,30],[34,26],[28,32],[36,28],[32,34],[38,30],[30,36],[40,32],[34,38]]){ RT=makeRT(dw,gp); const r=sepOf(); if(!best || r.sep>best.r.sep) best={dw,gp,r}; if(r.sep>=1.5) break; }
      LANE_LOG.push({lane:ln.name, bad:nb, firstBad:bad.slice(0,3), sep:best?best.r.sep:null});
      const cand={ln, nb, best, score:(nb?-1000*nb:0)+(best?Math.min(best.r.sep,1.5)*10:0)}; if(!pick || cand.score>pick.score) pick=cand; if(!nb && best && best.r.sep>=1.5) break; }
    LN=pick.ln; const b=pick.best||{dw:32,gp:28,r:null}; RT=makeRT(b.dw,b.gp); RT.sep=b.r||sepOf(); RT.lane=LN.name; RT.laneLog=LANE_LOG; }
  // tự kiểm tra tuyến: cách đảo ≥ 12 m, không lên cạn, không vượt vùng (Dev City x ≥ 100, Đảo Ngoại ngữ x ≤ −250)
  const MO=(ABY.strait && ABY.strait.mouth) || null;   /* cửa eo: tàu cao chỉ đi x0…x1 ở dải z mouth.z −10 … +1 (cầu dẫn G2 thấp phía Đông) */
  const routeCheck=(quick)=>{ const bad=[]; let fly=0; for(let i=0;i<=RT.n;i+=4){ const x=RT.X[i], z=RT.Z[i]; if(MO && x>-90 && x<45 && z>MO.z-10.5 && z<MO.z+1.5 && (x+4.9>MO.x1 || x-4.9<MO.x0)) bad.push(['cửa eo/G2',Math.round(x),Math.round(z)]); if(i>60 && i<RT.n-60 && W.groundH(x,z)>WY-2.2) bad.push(['cạn',Math.round(x),Math.round(z)]); if(hitIsland(x,z,12)) bad.push(['đảo',Math.round(x),Math.round(z)]); if(W.abyStage && W.abyStage.hit(x,z,8)) bad.push(['sân khấu',Math.round(x),Math.round(z)]); for(const [k,Z] of Object.entries(ZONES)) if(k!=='abyssal' && x>Z.x0-9.75 && x<Z.x1+9.75 && z>Z.z0-9.75 && z<Z.z1+9.75) bad.push([k,Math.round(x),Math.round(z)]); if(x<-251 && x>-760 && z>318 && z<392) fly++; if(Math.hypot(x-DOCK.x,z-DOCK.z)>70){ let near=false; for(const [ox,oz] of [[0,0],[5,0],[-5,0],[0,5],[0,-5]]) if(lowPlat(x+ox,z+oz,13.5)) near=true; if(near) bad.push(['cầu/sàn',Math.round(x),Math.round(z)]); } } bad.flyCross=Math.round(fly*4); return bad; };
  pickRoute();
  { const bad=routeCheck(); console.info(`[abyssal_sea] tuyến du thuyền ${Math.round(RT.L)} m · chu kỳ ${Math.round(RT.PER)} s (đỗ ${RT.DWELL} s) · 2 tàu gần nhất cách ${RT.sep.sep} m · tốc độ tối đa ${RT.vmax.toFixed(1)} m/s · ${PRE?'bố cục TẠM (chưa có W.ABY)':'theo W.ABY'}`+(bad.length?` · ⚠️ ${bad.length} điểm cần xem: `+JSON.stringify(bad.slice(0,8)):' · tuyến sạch')+` · băng qua trục bay Tây Skyport ~${bad.flyCross} m · làn: ${RT.lane}`, RT.laneLog); }
  const YS=[...Array(NY)].map(()=>({x:0,z:0,yaw:0,v:0})), _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _p=new THREE.Vector3(), _s=new THREE.Vector3(1,1,1);
  let nearK=-1, aboard=-1, frameT=-1, ticket=null;
  const yObj=new THREE.Object3D();   /* khung toạ độ tàu người chơi đang đi */
  let OFF=0;   /* lệch thời gian (chỉ dùng khi test: W.abySea.shift(giây)) */
  function sync(){ const T=(W.T||0)+OFF; if(T===frameT) return; frameT=T;
    for(let k=0;k<NY;k++){ const y=poseOf(k,T,YS[k]); const bob=Math.sin(T*.9+k*1.7)*.05, roll=Math.sin(T*.7+k)*.012-clamp(y.turn*y.v*.08,-.06,.06), pitch=Math.sin(T*.55+k*2.3)*.006-y.v*.0015;
      y.py=WY+bob; _e.set(pitch,y.yaw,roll,'YXZ'); _q.setFromEuler(_e); y.q=y.q||new THREE.Quaternion(); y.q.copy(_q); }
    /* tàu gần nhất (≤ 150 m) hoặc tàu đang đi → bản đầy đủ */
    let best=aboard, bd=150; if(best<0) for(let k=0;k<NY;k++){ const d=Math.hypot(YS[k].x-P.x,YS[k].z-P.z); if(d<bd){ bd=d; best=k; } }
    nearK=best; for(let k=0;k<NY;k++){ const y=YS[k]; if(k===nearK){ fleet.hide(k); continue; } _m.compose(_p.set(y.x,y.py,y.z),y.q,_s); fleet.set(k,_m); } fleet.commit();
    if(nearK>=0){ const y=YS[nearK]; near.g.visible=true; near.g.position.set(y.x,y.py,y.z); near.g.quaternion.copy(y.q); if(!near.built) near.build(); yObj.position.copy(near.g.position); yObj.quaternion.copy(near.g.quaternion); } else near.g.visible=false; }
  const dockedK=()=>{ for(let k=0;k<NY;k++) if(YS[k].docked) return k; return -1; };
  const nextDockIn=()=>{ let best=1e9; for(let k=0;k<NY;k++){ const tau=YS[k].tau; best=Math.min(best, RT.PER-tau); } return best; };
  // người chơi lên / xuống tàu
  const rider=YK.makeRider({ sync, obj:()=>yObj, yaw:()=>aboard>=0?YS[aboard].yaw:0, onAbort:()=>{ aboard=-1; ticket=null; },
    onSit:(s)=>{ if(s.dine && W.dining) W.dining.onSit({venue:'yacht', frame:yObj, x:s.x, y:s.y, z:s.z, yaw:s.face, floor:s.floor, tableY:s.floor+.77, waiterFrom:(s.floor>7?YK.SPOTS.cocktail:YK.SPOTS.bar)}); },   /* bàn ăn trên tàu → phục vụ bàn (dining.js) */
    onStand:(s)=>{ if(s.dine && W.dining) W.dining.onStand(); },
    onInter:(R)=>{ const SP=YK.SPOTS, y=YS[aboard]; if(!y) return null; const d=(o)=>o && Math.abs(o.y-R.ly)<.7 ? Math.hypot(o.x-R.lx,o.z-R.lz) : 99;
      if(d(SP.gangway)<2.2) return y.docked ? {prio:1, label:'🚶 Xuống bến (E)', action:leaveYacht} : {prio:1, label:`⏳ Tàu đang chạy – về bến sau ~${Math.ceil((RT.PER-y.tau)/60)} phút (hoặc gọi ca-nô ở bệ bơi đuôi tàu)`, action:()=>toast('⚓ Muốn về sớm: xuống bệ bơi đuôi tàu, bấm E gọi ca-nô đưa đón.',3000)};
      if(d(SP.swim)<2.6) return {prio:1, label:y.docked?'🚶 Xuống bến (E)':'🚤 Gọi ca-nô đưa về bến (E)', action:leaveYacht};
      if(d(SP.helm)<1.8) return {prio:1, label:SP.helm.label, action:()=>{ const ii=Math.round(y.s/RT.n*100); toast(y.docked?`⚓ Thuyền trưởng: "Tàu rời bến sau ${Math.ceil(RT.DWELL-y.tau)} giây. Hành trình: vòng quần đảo Đá Vôi Ngọc Bích, khoảng ${Math.round(RT.PER/60)} phút."`:`⚓ Thuyền trưởng: "Đã đi được ${ii}% hành trình, đang chạy ${(y.v*1.94).toFixed(1)} hải lý/giờ. Ra Sun Deck ngắm đảo nhé!"`,4200); }};
      if(d(SP.bar)<1.6 || d(SP.cocktail)<1.6) return {prio:1, label:(ticket&&ticket.combo)?'🍹 Gọi cocktail / món VIP (miễn phí trong combo)':'🍹 Gọi cocktail (25 💰)', action:()=>serve(R)};
      if(d(SP.piano)<1.4) return {prio:1, label:SP.piano.label, action:piano};
      return null; }});
  function boardYacht(k){ if(k<0) return; if(!near.built) near.build(); aboard=k; frameT=-1; sync(); rider.board(YK.SPOTS.gangway.x-.6, YK.SPOTS.gangway.z, -Math.PI/2); if(cam.dist>5) cam.dist=5;
    toast(`🛥️ Chào mừng lên du thuyền! Tàu rời bến sau ~${Math.max(1,Math.ceil(RT.DWELL-YS[k].tau))} giây · đi lại tự do 3 tầng (cầu thang ở boong sau & phòng ăn) · E để ngồi / nằm / gọi đồ uống.`,5200); }
  function leaveYacht(){ const y=YS[aboard]; aboard=-1; if(y && y.docked){ const [x,z]=MW(0,PB-2.2); rider.leave(x,z,Math.atan2(N2[0]*-1,N2[1]*-1)); toast('⚓ Đã xuống bến. Hẹn gặp lại!',2200); }
    else { const [x,z]=COMPACT?MW(-14,PB*.5):MW(STEM[0]+2,PB-6); rider.leave(x,z); toast('🚤 Ca-nô đưa đón đã chở bạn về Bến Siêu Du Thuyền.',3200); }
    ticket=null; }
  function serve(R){ const go=()=>{ toast('🍹 Phục vụ mang tới ly cocktail nhiệt đới + đĩa hải sản nướng. Năng lượng +20 · tâm trạng +10!',3200); try{ if(W.life && W.life.buff) W.life.buff('energy',20); }catch(e){} };
    if(ticket && ticket.combo) go(); else pay(25,'🍹 Ly cocktail trên du thuyền',go); }
  let actx=null; function piano(){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const t0=actx.currentTime; [523.25,659.25,783.99,1046.5,783.99,659.25].forEach((f,i)=>{ const o=actx.createOscillator(), g=actx.createGain(); o.type='triangle'; o.frequency.value=f; g.gain.setValueAtTime(0,t0+i*.22); g.gain.linearRampToValueAtTime(.08,t0+i*.22+.02); g.gain.exponentialRampToValueAtTime(.001,t0+i*.22+1.1); o.connect(g); g.connect(actx.destination); o.start(t0+i*.22); o.stop(t0+i*.22+1.2); }); }catch(e){} toast('🎹 Bạn chơi một đoạn arpeggio Đô trưởng – khách trên tàu vỗ tay!',2600); }
  const buyTicket=(then)=>{ const m=W.ui && W.ui.modal ? W.ui.modal('🛥️ Tour Siêu Du Thuyền 3 Tầng') : null;
    const opt=(combo)=>pay(combo?250:150, combo?'🛥️ Tour du thuyền <b>+ Combo ăn uống VIP</b>':'🛥️ Vé tour Siêu Du Thuyền 3 tầng', ()=>{ ticket={combo, t:W.T}; toast(combo?'🎟️ Đã mua vé + Combo VIP: cocktail & món ăn miễn phí trên tàu.':'🎟️ Đã mua vé tour. Ra phao nổi, bấm E ở cầu lên tàu.',3400); if(then) then(); });
    if(!m){ opt(false); return; }
    m.body.innerHTML=`<div style="line-height:1.6">Hành trình ~${Math.round(RT.PER/60)} phút: rời bến → vòng Quần đảo Đá Vôi Ngọc Bích (5 đảo, cổng vòm đá) → về bến. Tàu 3 tầng: Main Salon, phòng ăn, Master Suite, Sky Lounge, 2 phòng VIP, buồng lái, Sun Deck có Jacuzzi.<br>Tàu kế tiếp cập bến: <b>${dockedK()>=0?'đang đỗ – lên ngay':'~'+Math.ceil(nextDockIn())+' giây'}</b></div>
      <div class="row" style="margin-top:14px;gap:10px;justify-content:flex-end"><button class="btn" data-a="0">🎟️ Vé tour · 150 💰</button><button class="btn pri" data-a="1">🍽️ Vé + Combo ăn uống VIP · 250 💰</button></div>`;
    m.body.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ m.close(); opt(b.dataset.a==='1'); }); };
  INTER.push({x:KIOSK[0]+S2[0]*2.4, z:KIOSK[1]+S2[1]*2.4, r:2.6, prio:.8, when:()=>!HOOK.vehicle && Math.abs(P.y-DY)<1.5, get label(){ return ticket?'🎟️ Bạn đã có vé – ra phao nổi lên tàu (E: mua lại)':'🛥️ Thuê Tour Siêu Du Thuyền 3 Tầng (150 💰 · Combo Ăn Uống VIP 250 💰) (E)'; }, action:()=>buyTicket()});
  { const [gx,gz]=MW(0,PB-1.4); INTER.push({x:gx, z:gz, r:2.8, prio:1, when:()=>!HOOK.vehicle && Math.abs(P.y-DY)<1.5, get label(){ const k=dockedK(); if(k<0) return `⏳ Chờ du thuyền cập bến (~${Math.ceil(nextDockIn())} giây)`; return ticket?'🛥️ Lên du thuyền (E)':'🛥️ Lên du thuyền – mua vé 150 💰 / combo 250 💰 (E)'; },
    action:()=>{ const k=dockedK(); if(k<0) return toast(`⏳ Tàu kế tiếp cập bến sau ~${Math.ceil(nextDockIn())} giây – đứng chờ ở đây nhé.`,2600); if(ticket) boardYacht(k); else buyTicket(()=>{ const k2=dockedK(); if(k2>=0) boardYacht(k2); else toast('⏳ Tàu vừa rời bến – chờ chuyến sau (~1 phút) rồi bấm E.',3000); }); }}); }

  /* ============================== 4. THỂ THAO NƯỚC ============================== */
  const SP={on:true}, inst=(geo,mat,n,name)=>{ const im=new THREE.InstancedMesh(geo,mat,n); im.userData.dynamic=true; im.frustumCulled=false; im.castShadow=false; im.receiveShadow=true; im.name=name; dyn.add(im); return im; };
  // hình người cứng (áo phao cam) gộp màu đỉnh: ngồi / đứng → 2 InstancedMesh cho mọi tay chèo, người lái, người bay dù
  const figure=(sit)=>{ const parts=[], addp=(g,c,x,y,z,rx=0,rz=0)=>{ g=g.index?g.toNonIndexed():g; if(rx) g.rotateX(rx); if(rz) g.rotateZ(rz); g.translate(x,y,z); const n=g.attributes.position.count, cc=new Float32Array(n*3); C.set(c); for(let i=0;i<n;i++){ cc[i*3]=C.r; cc[i*3+1]=C.g; cc[i*3+2]=C.b; } g.setAttribute('color',new THREE.BufferAttribute(cc,3)); for(const k of Object.keys(g.attributes)) if(!['position','normal','color'].includes(k)) g.deleteAttribute(k); parts.push(g); };
    const skin=0xc99a7a, vest=0xff7a1a, sh=0x1f2a44, hy=sit?.95:1.62, hip=sit?.25:.95;
    addp(new THREE.CapsuleGeometry(.17,.42,4,10), vest, 0, hip+.38, 0); addp(new THREE.SphereGeometry(.12,12,10), skin, 0, hy, 0); addp(new THREE.SphereGeometry(.125,10,6,0,TAU,0,1.4), 0x3a2a1e, 0, hy+.02, -.01);
    for(const e of [-1,1]){ addp(new THREE.CapsuleGeometry(.05,.42,3,6), skin, e*.24, hip+.42, sit?.16:0, sit?-1.1:0, e*.25); if(sit) addp(new THREE.CapsuleGeometry(.07,.38,3,6), sh, e*.1, hip-.02, .26, Math.PI/2); else { addp(new THREE.CapsuleGeometry(.07,.72,3,6), sh, e*.1, .45, 0); } }
    const g=W.mergeGeometries(parts,false); g.computeVertexNormals(); return g; };
  const figMat=new THREE.MeshStandardMaterial({vertexColors:true, roughness:.7});
  const NSIT=2+3+8+2+1, NSTAND=2+2+1;   /* ngồi: 2 lái ca-nô, 3 mô tô nước, 8 kayak, 2 mô tô nước bơm flyboard, +1 người chơi kayak đôi (bạn chèo cùng) · đứng: 2 người bay dù, 2 flyboard, +1 dự phòng */
  const FS=inst(figure(true),figMat,NSIT,'aby-sport-sit'), FT=inst(figure(false),figMat,NSTAND,'aby-sport-stand');
  // thân tàu nhỏ: ca-nô, mô tô nước, kayak đôi, ván flyboard (Shape + Extrude bo cạnh)
  const smallHull=(len,beam,h,col,bow=.6)=>{ const s=new THREE.Shape(); s.moveTo(-beam/2,len/2); s.lineTo(beam/2,len/2); s.lineTo(beam/2,-len*.1); s.quadraticCurveTo(beam*.45,-len*bow*.8,0,-len/2); s.quadraticCurveTo(-beam*.45,-len*bow*.8,-beam/2,-len*.1); s.lineTo(-beam/2,len/2);
    const g=new THREE.ExtrudeGeometry(s,{depth:h, bevelEnabled:true, bevelThickness:.05, bevelSize:.05, bevelSegments:2, curveSegments:10}); g.rotateX(-Math.PI/2); const p=g.attributes.position; for(let i=0;i<p.count;i++){ const t=clamp(p.getY(i)/h,0,1); p.setX(i,p.getX(i)*(.45+.55*Math.sin(t*Math.PI/2))); } g.computeVertexNormals(); g.translate(0,-h*.45,0); return g; };
  const BOAT=inst(smallHull(6.2,2.2,1.0), std(0xf4f1ea,{roughness:.25,metalness:.1}), 2, 'aby-sport-boat'), JET=inst(smallHull(3.1,1.1,.6), std(0xffffff,{roughness:.3}), 3+2+1, 'aby-sport-jetski'), KAY=inst(smallHull(5.2,.8,.38,0,.9), std(0xffffff,{roughness:.4}), 4+1, 'aby-sport-kayak');
  { const cs=[0x2a7bd9,0xf2c14e,0xd94f4f,0x1e9e6a,0x8a4fd9,0x14284f]; for(let i=0;i<JET.count;i++) JET.setColorAt(i,C.set(cs[i%cs.length])); for(let i=0;i<KAY.count;i++) KAY.setColorAt(i,C.set([0xffd23f,0xff6a3d,0x3fb0ff,0x46d39a,0xff4f9a][i%5])); BOAT.setColorAt(0,C.set(0xf4f1ea)); BOAT.setColorAt(1,C.set(0xe8eef6)); }
  const BOARD=inst(AK.roundedBox(.7,.12,1.1,.05,2).clone(), std(0x1f2a44,{roughness:.3,metalness:.4}), 3, 'aby-flyboard');
  const jetMat=new THREE.MeshBasicMaterial({color:0xeaf8ff, transparent:true, opacity:.62, depthWrite:false});
  const JETS=inst((()=>{ const g=new THREE.CylinderGeometry(.14,.32,1,10,1,true); g.translate(0,.5,0); return g; })(), jetMat, 3*2, 'aby-flyboard-jets');
  const CHUTE=inst((()=>{ const g=new THREE.SphereGeometry(4.2,24,8,0,TAU,0,1.05); g.scale(1,.55,1.25); const n=g.attributes.position.count, cc=new Float32Array(n*3), cs=[0xe53935,0xfb8c00,0xfdd835,0x43a047,0x1e88e5,0x8e24aa]; for(let i=0;i<n;i++){ const a=Math.atan2(g.attributes.position.getZ(i),g.attributes.position.getX(i)); C.set(cs[Math.floor(((a/TAU+1)%1)*12)%6]); cc[i*3]=C.r; cc[i*3+1]=C.g; cc[i*3+2]=C.b; } g.setAttribute('color',new THREE.BufferAttribute(cc,3)); return g; })(), new THREE.MeshStandardMaterial({vertexColors:true, roughness:.6, side:THREE.DoubleSide}), 2, 'aby-parasail');
  const PAD=inst((()=>{ const g=new THREE.CylinderGeometry(.025,.025,2.3,6); g.rotateZ(Math.PI/2); return g; })(), std(0x1c2026,{roughness:.4}), 8+1, 'aby-paddle');
  const lineGeo=new THREE.BufferGeometry(); lineGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(3*2*12),3)); const LINES=new THREE.LineSegments(lineGeo,new THREE.LineBasicMaterial({color:0x2a2f38})); LINES.frustumCulled=false; LINES.userData.dynamic=true; dyn.add(LINES);
  // vệt sóng sau đuôi (chữ V, cộng sáng) cho du thuyền + ca-nô + mô tô nước
  const wakeTex=cvs(128,256,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); const R=AK.rng(3); for(let i=0;i<1600;i++){ const t=R(), y=t*h, side=R()<.5?-1:1, spread=t*w*.48, x=w/2+side*spread*(.85+R()*.3), a=(1-t)*.7; g.fillStyle=`rgba(255,255,255,${a*R()})`; g.beginPath(); g.ellipse(x,y,1+R()*3,1+R()*4,0,0,TAU); g.fill(); if(R()<.5){ g.fillStyle=`rgba(255,255,255,${(1-t)*.35*R()})`; g.beginPath(); g.ellipse(w/2+(R()-.5)*t*w*.3,y,1.5+R()*4,2+R()*5,0,0,TAU); g.fill(); } } });
  const WAKE=inst((()=>{ const g=new THREE.PlaneGeometry(1,1); g.rotateX(-Math.PI/2); g.translate(0,0,-.5); return g; })(), new THREE.MeshBasicMaterial({map:wakeTex, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false}), NY+2+6, 'aby-wakes'); WAKE.renderOrder=3;
  // quỹ đạo NPC
  const ell=(c,i,n,T,spd,dir=1)=>{ const per=TAU*Math.sqrt((c.rx*c.rx+c.rz*c.rz)/2), a=dir*(T*spd/per*TAU)+i/n*TAU; return [c.x+Math.cos(a)*c.rx, c.z+Math.sin(a)*c.rz, Math.atan2(-Math.sin(a)*c.rx*dir, Math.cos(a)*c.rz*dir), a]; };
  const fig8=(c,ph,T,w)=>{ const t=T*w+ph; const x=c.x+Math.sin(t)*c.rx*.85, z=c.z+Math.sin(2*t)*c.rz*.6; const dx=Math.cos(t)*c.rx*.85*w, dz=2*Math.cos(2*t)*c.rz*.6*w; return [x,z,Math.atan2(dx,dz),Math.hypot(dx,dz)]; };
  // người chơi lái / bay
  const CR={on:null, x:0,z:0,y:WY,yaw:0,v:0,alt:2.5, lap:0};
  const freeWater=(x,z,r=1.5)=>{ if(W.groundH(x,z)>WY-.9) return false; if(W.abyStage && W.abyStage.hit && W.abyStage.hit(x,z,r)) return false; if(lowPlat(x,z,4)) return false;   /* chỉ sàn sát / trên mặt nước mới chặn (sàn dưới đáy vực cũ thì không) */ if(hitIsland(x,z,r)) return false;
    for(const y of YS){ const dx=x-y.x, dz=z-y.z, c=Math.cos(y.yaw), s=Math.sin(y.yaw), lx=dx*c-dz*s, lz=dx*s+dz*c; if(Math.abs(lx)<5.4+r && lz>-23-r && lz<22+r) return false; } return true; };
  const rentAt0=COMPACT?[-25,PB-.8]:[-30,20.4], rentAt=()=>MW(...rentAt0), backAt=()=>COMPACT?MW(-25,PB-2):MW(-30,19.6);
  const RIDES={ jet:{name:'🚤 Mô tô nước', cost:30, vmax:15, acc:6, turn:1.9, seat:.55}, kayak:{name:'🛶 Kayak đôi', cost:10, vmax:2.8, acc:1.4, turn:1.2, seat:.12}, fly:{name:'🌊 Flyboard', cost:40, vmax:5.5, acc:3, turn:1.6, seat:0} };
  function startRide(kind){ const R=RIDES[kind], [x,z]=rentAt(); CR.on=kind; CR.x=x+N2[0]*4; CR.z=z+N2[1]*4; CR.yaw=Math.atan2(N2[0],N2[1]); CR.v=0; CR.alt=kind==='fly'?3:0; CR.y=WY;
    { let ok=freeWater(CR.x,CR.z,8); for(let i=0;!ok && i<24;i++){ const a=(i%6-2.5)*6, b=4+Math.floor(i/6)*6; const [x,z]=MW(rentAt0[0]+a, rentAt0[1]+b); if(freeWater(x,z,8)){ CR.x=x; CR.z=z; ok=true; } } }   /* chỗ xuất phát: nước trống, cách du thuyền ≥ 8 m */ P.x=P.px=CR.x; P.z=P.pz=CR.z;   /* đặt người lên xe ngay (bộ dò 'dịch chuyển đi' không huỷ nhầm) */
    HOOK.vehicle={drive:rideDrive}; toast(kind==='fly'?'🌊 Flyboard: W/S tiến–lùi · A/D xoay · giữ Shift để bay cao (tối đa 14 m) · E gọi cứu hộ về bến.':`${R.name}: W/S ga–lùi · A/D bẻ lái${kind==='jet'?' · Shift tăng tốc':''} · về sát cầu thuê rồi bấm E để trả.`,5000); }
  function endRide(back){ CR.on=null; HOOK.vehicle=null; HOOK.vehicleInter=null; const [x,z]=backAt(); P.x=x; P.z=z; P.px=x; P.pz=z; P.y=W.groundAt(x,z); P.vx=P.vz=P.vy=0; P.ground=true; me.g.position.set(P.x,P.y,P.z); me.g.rotation.set(0,P.face,0); toast(back?'🆘 Cứu hộ đã đưa bạn về cầu thuê đồ chơi nước.':'⚓ Đã trả. Cảm ơn quý khách!',2400); }
  function rideDrive(dt,inp){ dt=Math.min(dt,.1); const R=RIDES[CR.on]; if(!R) return; const boost=inp.boost && CR.on==='jet';
    if(Math.hypot(P.x-CR.x,P.z-CR.z)>4){ CR.on=null; HOOK.vehicle=null; HOOK.vehicleInter=null; return; }   /* đã bay đi chỗ khác (bản đồ M) → trả xe tự động */
    if(CR.on!=='fly') for(const y of YS){ const dx=CR.x-y.x, dz=CR.z-y.z, c=Math.cos(y.yaw), s=Math.sin(y.yaw), lx=dx*c-dz*s, lz=dx*s+dz*c, hw=5.4+1.2; if(Math.abs(lx)<hw && lz>-24 && lz<22.5){ const k=(Math.sign(lx)||1)*hw-lx; CR.x+=c*k; CR.z-=s*k; CR.v*=.5; } }   /* du thuyền lấn vào → đẩy xe nhỏ ra mạn, không kẹt */
    const stuckNow=CR.on!=='fly' && !freeWater(CR.x,CR.z,CR.on==='kayak'?.8:1.2);
    CR.yaw-=inp.ix*R.turn*dt*(CR.on==='fly'?1:clamp(.35+Math.abs(CR.v)/R.vmax,0,1.2)); const vm=R.vmax*(boost?1.3:1); CR.v=clamp(CR.v+(inp.iz*R.acc-CR.v*(CR.on==='kayak'?.7:.35))*dt,-vm*.35,vm);
    const nx=CR.x+Math.sin(CR.yaw)*CR.v*dt, nz=CR.z+Math.cos(CR.yaw)*CR.v*dt; if(CR.on==='fly' ? !hitIsland(nx,nz,1) && W.groundH(nx,nz)<CR.alt-2 && !(W.platH && W.platH(nx,nz)>WY+CR.alt-3) : (stuckNow || freeWater(nx,nz,CR.on==='kayak'?.8:1.2))){ CR.x=nx; CR.z=nz; } else { CR.v*=-.3; }
    if(CR.on==='fly'){ CR.alt=clamp(CR.alt+(inp.boost?3.2:-1.4)*dt,2.2,14); }
    const T=W.T||0, bob=CR.on==='fly'?Math.sin(T*2.3)*.12:Math.sin(T*2.1)*.04; CR.y=WY+(CR.on==='fly'?CR.alt:0)+bob;
    P.x=CR.x; P.z=CR.z; P.y=CR.y+R.seat; P.vx=P.vz=P.vy=0; P.face=CR.yaw; me.g.position.set(P.x,P.y-(CR.on==='fly'?0:.42),P.z); me.g.rotation.set(0,CR.yaw,CR.on==='jet'?-inp.ix*.15*Math.min(1,Math.abs(CR.v)/8):0); if(me.play) me.play(CR.on==='fly'?'idle':(me.acts&&me.acts.sit?'sit':'idle'));
    const [rx,rz]=rentAt(), nearDock=Math.hypot(CR.x-rx,CR.z-rz)<9; HOOK.vehicleInter=()=>nearDock&&CR.on!=='fly'?{label:'⚓ Trả '+R.name.slice(2)+' (E)', action:()=>endRide(false)}:{label:'🆘 Gọi cứu hộ đưa về bến (E)', action:()=>endRide(true)}; }
  // bay dù kéo ca-nô (tự động 2 vòng)
  const PR={on:false, t:0}; function startPara(){ PR.on=true; PR.t=0; PR.lx=undefined; HOOK.vehicle={para:true, drive:(dt)=>{ PR.t+=dt; const c=SP.chute[0]; if(!c || c.x===undefined) return; if(PR.lx!==undefined && Math.hypot(P.x-PR.lx,P.z-PR.lz)>4){ PR.on=false; HOOK.vehicle=null; HOOK.vehicleInter=null; return; } P.x=c.x; P.z=c.z; P.y=c.y-1.8; PR.lx=P.x; PR.lz=P.z; P.face=c.yaw; P.vx=P.vz=P.vy=0; me.g.position.set(P.x,P.y,P.z); me.g.rotation.set(0,c.yaw,0); if(me.play) me.play(me.acts&&me.acts.sit?'sit':'idle'); HOOK.vehicleInter=()=>({label:'🪂 Hạ dù về bến sớm (E)', action:endPara}); if(PR.t>70) endPara(); }};
    toast('🪂 Cất cánh! Dây cáp 38 m kéo bạn bay cao 6–18 m ngắm toàn cảnh đảo & vịnh. Kéo chuột để nhìn quanh.',4500); }
  function endPara(){ PR.on=false; HOOK.vehicle=null; HOOK.vehicleInter=null; const [x,z]=backAt(); P.x=x; P.z=z; P.px=x; P.pz=z; P.y=W.groundAt(x,z); P.vx=P.vz=P.vy=0; P.ground=true; me.g.position.set(P.x,P.y,P.z); me.g.rotation.set(0,P.face,0); toast('🪂 Hạ cánh an toàn xuống cầu thuê đồ chơi nước!',2400); }
  { const [ix,iz]=rentAt(), base={x:ix-N2[0]*1.2, z:iz-N2[1]*1.2, r:3.4, when:()=>!HOOK.vehicle && Math.abs(P.y-DY)<1.5};
    INTER.push({...base, prio:.9, label:'🌊 Thuê đồ chơi nước: dù bay 20 💰 · mô tô nước 30 💰 · kayak đôi 10 💰 · flyboard 40 💰 (E)', action:()=>{ const m=W.ui && W.ui.modal ? W.ui.modal('🌊 Thể thao nước') : null; const go=(k)=>{ if(k==='para') pay(20,'🪂 Bay dù kéo Ca-nô ngắm toàn cảnh Đảo & Vịnh',startPara); else pay(RIDES[k].cost,RIDES[k].name,()=>startRide(k)); };
      if(!m) return go('para'); m.body.innerHTML=`<div class="row" style="gap:10px;flex-wrap:wrap"><button class="btn pri" data-k="para">🪂 Bay dù kéo ca-nô · 20 💰</button><button class="btn" data-k="jet">🚤 Mô tô nước · 30 💰</button><button class="btn" data-k="kayak">🛶 Kayak đôi · 10 💰</button><button class="btn" data-k="fly">🌊 Flyboard · 40 💰</button></div><div style="margin-top:10px;opacity:.8;font-size:13px">Áo phao có sẵn. Không chạy vào luồng du thuyền và quanh chân đảo đá.</div>`;
      m.body.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ m.close(); go(b.dataset.k); }); }}); }
  SP.chute=[{},{}];
  function sportsUpdate(T, dt){ if(!SP.on) return; let fs=0, ft=0, w=0, li=0; const lp=lineGeo.attributes.position, setL=(a,b)=>{ lp.setXYZ(li*2,a[0],a[1],a[2]); lp.setXYZ(li*2+1,b[0],b[1],b[2]); li++; };
    const put=(im,i,x,y,z,yaw,sx=1,sy=1,sz=1,rx=0,rz=0)=>{ _e.set(rx,yaw,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z),_q,_s.set(sx,sy,sz)); im.setMatrixAt(i,_m); _s.set(1,1,1); };
    const wake=(x,z,yaw,len,wid,k)=>{ if(w>=WAKE.count) return; put(WAKE,w,x,WY+.035,z,yaw,wid,1,len); WAKE.setColorAt(w,C.setScalar(clamp(k,0,1))); w++; };
    // ca-nô kéo dù
    if(PARA) for(let i=0;i<2;i++){ const [x,z,yaw]=ell(PARA,i,2,T,9.5), hb=clamp(Math.sin(T*.21+i*2)*.5+.5,0,1), cy=WY+6+12*hb, trail=Math.sqrt(38*38-(cy-WY)*(cy-WY)); const [cx,cz,cyaw]=ell(PARA,i,2,T-trail/9.5,9.5);
      put(BOAT,i,x,WY+.12,z,yaw,1,1,1,-.05); put(FS,fs++,x-Math.sin(yaw)*.5,WY+.35,z-Math.cos(yaw)*.5,yaw); wake(x+Math.sin(yaw)*3,z+Math.cos(yaw)*3,yaw,22,9,.9);
      put(CHUTE,i,cx,cy+3.4,cz,cyaw,1,1,1,-.25); SP.chute[i]={x:cx,y:cy,z:cz,yaw:cyaw}; const sx=x-Math.sin(yaw)*2.8, sz=z-Math.cos(yaw)*2.8; setL([sx,WY+1.2,sz],[cx,cy-.3,cz]); setL([cx-Math.cos(cyaw)*3,cy+2.2,cz+Math.sin(cyaw)*3],[cx,cy,cz]); setL([cx+Math.cos(cyaw)*3,cy+2.2,cz-Math.sin(cyaw)*3],[cx,cy,cz]);
      if(!(PR.on && i===0)) put(FT,ft++,cx,cy-1.62-.2,cz,cyaw+Math.sin(T*1.3+i)*.2); }
    if(SPORT){ // 3 mô tô nước hình số 8
      for(let i=0;i<3;i++){ const [x,z,yaw,v]=fig8(SPORT,i*2.1,T,.11+i*.015); put(JET,i,x,WY+.12,z,yaw,1,1,1,-.06,-Math.sin(T*.11+i)*.18); put(FS,fs++,x,WY+.32,z,yaw); wake(x+Math.sin(yaw)*1.5,z+Math.cos(yaw)*1.5,yaw,9,3.6,.8); }
      // 2 flyboard + mô tô nước bơm (dây vòi)
      for(let i=0;i<2;i++){ const ax=SPORT.x+(i?-SPORT.rx*.45:SPORT.rx*.45), az=SPORT.z+(i?SPORT.rz*.3:-SPORT.rz*.3), t=T*.35+i*2, x=ax+Math.sin(t)*5, z=az+Math.cos(t*.8)*4, alt=8+6*(.5+.5*Math.sin(T*.42+i*1.7)), yaw=t*.9, flip=(Math.floor(T/9+i)%4===0)?ss(0,1,(T/9+i)%1)*TAU:0;
        put(BOARD,i,x,WY+alt,z,yaw,1,1,1,flip); put(FT,ft++,x,WY+alt+.06,z,yaw,1,1,1,flip); for(const e of [-1,1]){ const jx=x+Math.cos(yaw)*e*.25, jz=z-Math.sin(yaw)*e*.25; put(JETS,i*2+(e>0?1:0),jx,WY,jz,0,1,alt,1); }
        const px=ax-6, pz=az+3; put(JET,3+i,px,WY+.1,pz,yaw*.2+i); put(FS,fs++,px,WY+.3,pz,yaw*.2+i); setL([px,WY+.4,pz],[x,WY+alt-.2,z]); }
      // 4 kayak đôi (2 người chèo, mái chèo luân phiên)
      for(let i=0;i<4;i++){ const c={x:SPORT.x-SPORT.rx*.2+(i%2?6:-6), z:SPORT.z+(i<2?-1:1)*SPORT.rz*.45, rx:SPORT.rx*.55, rz:SPORT.rz*.32}; const [x,z,yaw]=ell(c,i,4,T,1.6,i%2?1:-1); put(KAY,i,x,WY+.05,z,yaw);
        for(const o of [-.9,.9]){ const fx=x+Math.sin(yaw)*o, fz=z+Math.cos(yaw)*o; put(FS,fs++,fx,WY+.02,fz,yaw); put(PAD,i*2+(o>0?1:0),fx+Math.sin(yaw)*.35,WY+.55,fz+Math.cos(yaw)*.35,yaw+Math.PI/2,1,1,1,0,Math.sin(T*3.2+i+(o>0?.6:0))*.55); } } }
    // phương tiện người chơi
    const hideI=(im,i)=>{ _m.makeScale(0,0,0); im.setMatrixAt(i,_m); };
    if(CR.on==='jet'){ put(JET,5,CR.x,WY+.12,CR.z,CR.yaw,1,1,1,-.05); wake(CR.x+Math.sin(CR.yaw)*1.5,CR.z+Math.cos(CR.yaw)*1.5,CR.yaw,9*Math.min(1,Math.abs(CR.v)/8),3.6,Math.abs(CR.v)/10); } else hideI(JET,5);
    if(CR.on==='kayak'){ put(KAY,4,CR.x,WY+.05,CR.z,CR.yaw); put(FS,fs++,CR.x+Math.sin(CR.yaw)*.9,WY+.02,CR.z+Math.cos(CR.yaw)*.9,CR.yaw); put(PAD,8,CR.x+Math.sin(CR.yaw)*1.25,WY+.55,CR.z+Math.cos(CR.yaw)*1.25,CR.yaw+Math.PI/2,1,1,1,0,Math.sin(T*3.2)*.55); } else { hideI(KAY,4); hideI(PAD,8); }
    if(CR.on==='fly'){ put(BOARD,2,CR.x,CR.y,CR.z,CR.yaw); for(const e of [-1,1]) put(JETS,4+(e>0?1:0),CR.x+Math.cos(CR.yaw)*e*.25,WY,CR.z-Math.sin(CR.yaw)*e*.25,0,1,CR.y-WY,1); } else { hideI(BOARD,2); hideI(JETS,4); hideI(JETS,5); }
    for(;fs<FS.count;fs++) hideI(FS,fs); for(;ft<FT.count;ft++) hideI(FT,ft);
    // vệt sóng du thuyền
    for(const y of YS) if(y.v>.4) wake(y.x+Math.sin(y.yaw)*20,y.z+Math.cos(y.yaw)*20,y.yaw,62,22,y.v/6);
    for(;w<WAKE.count;w++){ hideI(WAKE,w); }
    for(;li<12;li++) setL([0,-50,0],[0,-50,0]); lp.needsUpdate=true;
    for(const im of [BOAT,JET,KAY,BOARD,JETS,CHUTE,PAD,FS,FT,WAKE]){ im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; } }

  /* ============================== 5. ĐIỂM BẢN ĐỒ · KHUNG HÌNH · ÂM THANH ============================== */
  { const [x,z]=COMPACT?MW(-16,PB-2.5):MW(-14,3.2), [lx,lz]=MW(-16,40); PLACES.push({icon:'🛥️', name:'Bến Siêu Du Thuyền', sub:'Tour 3 tầng · Quần đảo Đá Vôi Ngọc Bích · thể thao nước', go:()=>teleport(x,z,lx,lz)}); }
  let tt=0, wasNear=false, lateDone=false, diningReg=false;
  HOOK.onFrame.push((dt)=>{ dt=Math.min(dt||1/60,.1); tt+=dt; const T=W.T||tt;
    if(!lateDone && tt>.5){ lateDone=true;   /* các vùng nạp SAU đảo Abyssal (Thụy Sĩ – cầu G3, Skyport…) đã có sàn/cầu → chỉnh lại vùng nước + chọn lại tuyến 1 lần */
      try{ SPORT=fitZone(PL.watersports,6); PARA=fitZone(PL.parasail,10); api.layout.sport=SPORT; api.layout.para=PARA; if(aboard<0){ const old=RT.lane, os=RT.sep&&RT.sep.sep; pickRoute(); frameT=-1; const b=routeCheck(); console.info(`[abyssal_sea] kiểm lại sau khi mọi vùng đã nạp: làn ${RT.lane} (trước: ${old}) · 2 tàu gần nhất ${RT.sep.sep} m (trước ${os}) · ${b.length} điểm cần xem`, b.slice(0,6)); } }catch(e){ console.warn('[abyssal_sea] kiểm lại', e); } }
    const dxm=P.x-MAR.sx, dzm=P.z-MAR.sz, inArea=Math.hypot(dxm,dzm)<450 || Math.hypot(P.x-(KB.x0+KB.x1)/2,P.z-(KB.z0+KB.z1)/2)<520 || Math.hypot(P.x-SPORT.x,P.z-SPORT.z)<350 || Math.hypot(P.x-PARA.x,P.z-PARA.z)<400 || aboard>=0;
    /* bị phương tiện khác giành quyền điều khiển (phím V lên xe, C ngồi ghế…) → coi như đã rời tàu / trả xe */
    if(aboard>=0 && !(HOOK.vehicle && HOOK.vehicle.yachtRider)){ aboard=-1; ticket=null; rider.on=false; if(HOOK.camBox && HOOK.camBox._ys) HOOK.camBox=null; }
    if(CR.on && !(HOOK.vehicle && HOOK.vehicle.drive===rideDrive)) CR.on=null; if(PR.on && !(HOOK.vehicle && HOOK.vehicle.para)) PR.on=false;
    sync(); if(aboard>=0 && rider.on) HOOK.vehicleInter=rider.inter;
    moor.visible=dockedK()>=0;
    if(near.g.visible){ const y=YS[nearK]; let clap=false; if(y && y.v>.8) for(const I of ISL){ if(Math.hypot(y.x-I.x,y.z-I.z)<I.r*1.3+70){ clap=true; break; } } near.update(dt,T,clap,aboard>=0); }   /* khách vỗ tay khi tàu lượn qua quần đảo */
    if(!diningReg && W.dining){ diningReg=true; try{ W.dining.register({id:'yacht', name:'Siêu du thuyền', kind:'yacht', free:()=>!!(ticket && ticket.combo)}); }catch(e){} }
    foamTex.offset.x=T*.012; foamTex.offset.y=(Math.sin(T*.8)*.5+.5)*.25; foamMat.opacity=.55+.2*Math.sin(T*1.3);
    YK.M.glassFar.emissive.setRGB(.35*(W.night||0),.24*(W.night||0),.1*(W.night||0)); glowM.emissiveIntensity=.6+(W.night||0)*1.6;
    if(inArea || PR.on || CR.on) sportsUpdate(T,dt);
    if(!inArea && wasNear){ /* ra xa: không cần cập nhật thể thao nước */ } wasNear=inArea; });

  /* ============================== API ============================== */
  const api={ layout:{pre:PRE, marina:MAR, dock:DOCK, sport:SPORT, para:PARA, islands:ISL}, get route(){ return RT; }, poseOf, yachts:YS, kit:YK, near, rider, routeCheck,
    quay:{at:(a,b)=>MW(a,b), PB, DY, compact:COMPACT},   /* toạ độ bến cho bot xếp hàng (bots_abyssal.js) */
    board:()=>boardYacht(dockedK()), shift(sec){ OFF+=sec; frameT=-1; sync(); }, waitDock(){ let k=dockedK(); if(k>=0) return k; OFF+=nextDockIn()+1; frameT=-1; sync(); return dockedK(); }, leave:leaveYacht, get aboard(){ return aboard; }, get nearK(){ return nearK; }, dockedK, nextDockIn, startRide, endRide, startPara, endPara, CR, PR,
    /* nguồn âm cho ambience_world.js (phiên chính nối 1 dòng): [{kind:'boat', id, x,y,z, v}] */
    soundList(){ const L=[]; let a=null, ad=1e9, b=null, bd=1e9; for(let k=0;k<NY;k++){ const y=YS[k]; if(y.v<.3) continue; const d=Math.hypot(y.x-P.x,y.z-P.z); if(d<ad){ b=a; bd=ad; a=k; ad=d; } else if(d<bd){ b=k; bd=d; } }
      for(const k of [a,b]) if(k!=null && Math.hypot(YS[k].x-P.x,YS[k].z-P.z)<160) L.push({kind:'boat', id:'aby-yacht'+k, x:YS[k].x, y:WY+1, z:YS[k].z, v:YS[k].v*.7});
      if(CR.on==='jet') L.push({kind:'boat', id:'aby-me-jet', x:CR.x, y:WY+.5, z:CR.z, v:Math.abs(CR.v)}); if(CR.on==='kayak') L.push({kind:'kayak', id:'aby-me-kayak', x:CR.x, y:WY+.5, z:CR.z}); return L; } };
  W.abySea=api; return api; }
// ===== GHI CHÚ BÀN GIAO CHO PHIÊN A (abyssal_island.js) =====
// 1) Dòng import an toàn (sau khi dựng xong vịnh + công bố W.ABY):
//      try{ const m=await import('./abyssal_sea.js'); await m.make(W, ctx); }catch(e){ console.warn('[abyssal_sea]', e); }
//      try{ const m=await import('./abyssal_stage.js'); await m.make(W, ctx); }catch(e){ console.warn('[abyssal_stage]', e); }
//    (abyssal_yacht.js là thư viện, abyssal_sea.js tự import – không cần gọi make.)
// 2) W.ABY cần có: plots.marina {x,z,nx,nz,deckY,stem} · plots.stage {x,z,yaw} · (tuỳ chọn) plots.watersports {x,z,rx,rz}, plots.parasail {x,z,rx,rz},
//    yachtRoute [[x,z]…] HOẶC bayLoop {x,z,r} + strait {x,z,nx,nz,w}. Gọi W.abySea.routeCheck() để xem điểm tuyến chạm cạn / đảo.
