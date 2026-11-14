// QC World – 🏛️ THÁP BRAND QC trên đỉnh Đồi Brand QC: biểu tượng lớn nhất thành phố, ĐI BỘ THẲNG VÀO (không cần bấm E)
//  • Toà kính tròn 3 tầng + sân thượng, giếng trời ở giữa với CẦU THANG XOẮN ỐC quanh cột đá cẩm thạch (bậc 25 cm)
//  • Trệt "Sảnh Tinh Hoa": 7 nguyên tắc kiểm thử + những lỗi phần mềm nổi tiếng + mô hình kim tự tháp kiểm thử, con bọ 1947
//  • Lầu 1 "Kỹ thuật & Công cụ": kỹ thuật thiết kế test, công cụ, kiosk đố vui (E)
//  • Lầu 2 "Đại sảnh Huyền thoại": những người đặt nền móng nghề kiểm thử, giá trị đội QC Bình Phan + PHÒNG BÍ ẨN (để dành)
//  • Sân thượng: ống nhòm ngắm thành phố (E), ghế ngồi; trên cùng: chữ QC mạ vàng khổng lồ xoay chậm, lấp lánh, cột sáng ban đêm
//  Va chạm theo từng tầng (vật cản có y0/y1), sàn tầng là "ring plat", camera tự thu gọn khi vào trong.
export function makeMonument(W){
  const {THREE, scene, P, HOOK, INTER, PLACES, toast, circles, plats, addPlat, mergeGeometries, GLOW, cam, makeLabel, teleport} = W;
  const info=W.hillsInfo; if(!info) return null;
  const C={x:info.HC.x, z:info.HC.z}, Y0=info.TOPH, RB=13, RA=5.2, FH=6.5, FY=[Y0, Y0+FH, Y0+FH*2, Y0+FH*3], TAU=Math.PI*2;
  const ENT=Math.atan2(info.SB.z-C.z, info.SB.x-C.x);      // cửa chính nhìn về đầu cầu thang lớn
  const at=(a,r,y=0)=>new THREE.Vector3(C.x+Math.cos(a)*r, y, C.z+Math.sin(a)*r);
  const yawOut=a=>Math.atan2(Math.cos(a), Math.sin(a));    // hướng (quy ước h) nhìn ra ngoài theo góc a
  const sm=(c,r=.5,m=0,o={})=>new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const M={ marble:sm(0xf3efe8,.35), marbleD:sm(0xd9d2c6,.4), gold:sm(0xffcf6a,.28,1,{emissive:0xffa820, emissiveIntensity:.18}), dark:sm(0x1c2028,.5,.3),
    glass:new THREE.MeshStandardMaterial({color:0x9fd6ff, roughness:.04, metalness:.9, transparent:true, opacity:.28, depthWrite:false, side:THREE.DoubleSide, envMapIntensity:1.6}),
    steel:sm(0xc7ccd4,.3,.85), pave:sm(0xe7e1d6,.6), purple:sm(0x3a1c5c,.4,.2,{emissive:0x7a3cff, emissiveIntensity:.35}) };
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new THREE.Vector3(1,1,1), _p=new THREE.Vector3();
  function Kit(){ const parts=new Map(); return { add(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0){ const g=geo.index?geo.toNonIndexed():geo.clone(); if(g.attributes.uv===undefined){} _e.set(rx,ry,rz,'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x,y,z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat,[]); parts.get(mat).push(g); },
    build(parent, cast=true){ for(const [m,list] of parts){ const geo=list.length===1?list[0]:mergeGeometries(list,false); if(!geo) continue; const ms=new THREE.Mesh(geo,m); ms.castShadow=cast && !m.transparent; ms.receiveShadow=true; parent.add(ms); } } }; }
  const shell=new THREE.Group(), inner=new THREE.Group(); scene.add(shell); scene.add(inner);

  /* ============================== SÂN ĐỈNH ĐỒI ============================== */
  { const k=Kit(); const tex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=1024; const g=c.getContext('2d'); g.fillStyle='#e9e3d7'; g.fillRect(0,0,1024,1024); g.translate(512,512);
      for(let r=40;r<512;r+=34){ g.strokeStyle=r%68?'rgba(150,130,100,.35)':'rgba(190,150,80,.6)'; g.lineWidth=r%68?2:5; g.beginPath(); g.arc(0,0,r,0,TAU); g.stroke(); }
      for(let i=0;i<48;i++){ g.rotate(TAU/48); g.strokeStyle='rgba(150,130,100,.28)'; g.lineWidth=2; g.beginPath(); g.moveTo(40,0); g.lineTo(512,0); g.stroke(); }
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; })();
    const disc=new THREE.Mesh(new THREE.CircleGeometry(info.PADR+.4,96), new THREE.MeshStandardMaterial({map:tex, roughness:.6})); disc.rotation.x=-Math.PI/2; disc.position.set(C.x,Y0+.03,C.z); disc.receiveShadow=true; shell.add(disc);
    // cột đèn + bồn hoa quanh sân
    for(let i=0;i<10;i++){ const a=ENT+Math.PI/10+i*TAU/10, p=at(a,info.PADR-2); if(Math.abs(Math.atan2(Math.sin(a-ENT),Math.cos(a-ENT)))<.3) continue;
      k.add(new THREE.CylinderGeometry(.14,.2,5.5,10), M.steel, p.x,Y0+2.75,p.z); k.add(new THREE.SphereGeometry(.34,14,10), M.gold, p.x,Y0+5.6,p.z); circles.push({x:p.x, z:p.z, r:.22}); GLOW && GLOW.add(p.x,Y0+5.6,p.z,3.2,0xffd27a,1);
      const f=at(a+TAU/20, info.PADR-3); k.add(new THREE.CylinderGeometry(1.1,1.2,.6,20), M.marbleD, f.x,Y0+.3,f.z); k.add(new THREE.SphereGeometry(1.0,12,8), sm(0x5aa04a,.8), f.x,Y0+.75,f.z); circles.push({x:f.x, z:f.z, r:1.2}); }
    k.build(shell); }

  /* ============================== VỎ TOÀ: sàn, kính, khung, vành vàng ============================== */
  const gap=.42;   // khe cửa chính (rad)
  { const k=Kit();
    for(let i=1;i<=3;i++){ const y=FY[i]; const ring=new THREE.RingGeometry(RA,RB+.35,72,1); ring.rotateX(-Math.PI/2); k.add(ring, M.marble, C.x,y,C.z);
      const under=new THREE.RingGeometry(RA,RB+.35,72,1); under.rotateX(Math.PI/2); k.add(under, M.marbleD, C.x,y-.45,C.z);
      k.add(new THREE.CylinderGeometry(RB+.36,RB+.36,.45,72,1,true), M.marbleD, C.x,y-.22,C.z); k.add(new THREE.CylinderGeometry(RA,RA,.45,48,1,true), M.marbleD, C.x,y-.22,C.z);
      k.add(new THREE.TorusGeometry(RB+.38,.07,8,96), M.gold, C.x,y,C.z, Math.PI/2,0,0);
      plats.push({t:'ring', x:C.x, z:C.z, r0:RA+.05, r1:RB-.05, h:y}); }
    // kính bao quanh từng tầng (trệt chừa cửa chính) + khung đứng
    for(let f=0;f<3;f++){ const y0=FY[f]+(f?0:0), hgt=FH-.45, ts=f===0?(Math.PI/2-ENT)+gap/2:0, tl=f===0?TAU-gap:TAU;
      const gl=new THREE.CylinderGeometry(RB,RB,hgt,72,1,true,ts,tl); k.add(gl, M.glass, C.x,y0+hgt/2,C.z); }
    for(let i=0;i<36;i++){ const a=i/36*TAU, p=at(a,RB+.02); const nearDoor=Math.abs(Math.atan2(Math.sin(a-ENT),Math.cos(a-ENT)))<gap/2; k.add(new THREE.BoxGeometry(.12,FH*3,.18), M.steel, p.x,Y0+FH*1.5+(nearDoor?FH/2:0)*0,p.z, 0,yawOut(a),0); }
    // mái hiên cửa chính + bậc tam cấp
    { const p=at(ENT,RB+2.2); k.add(new THREE.BoxGeometry(6,.35,4.6), M.marble, p.x,Y0+4.2,p.z, 0,yawOut(ENT),0); k.add(new THREE.BoxGeometry(6.2,.08,4.8), M.gold, p.x,Y0+4.41,p.z, 0,yawOut(ENT),0);
      for(const s of [-1,1]){ const q=at(ENT+s*.2, RB+3.8); k.add(new THREE.CylinderGeometry(.22,.26,4.2,14), M.gold, q.x,Y0+2.1,q.z); circles.push({x:q.x, z:q.z, r:.3}); } }
    // lan can sân thượng (kính thấp + tay vịn vàng)
    k.add(new THREE.CylinderGeometry(RB+.2,RB+.2,1.1,72,1,true), M.glass, C.x,FY[3]+.55,C.z); k.add(new THREE.TorusGeometry(RB+.2,.06,8,96), M.gold, C.x,FY[3]+1.12,C.z, Math.PI/2,0,0);
    // lan can giếng trời tầng 1, 2, sân thượng
    for(let i=1;i<=3;i++){ k.add(new THREE.CylinderGeometry(RA+.15,RA+.15,1.05,48,1,true), M.glass, C.x,FY[i]+.52,C.z); k.add(new THREE.TorusGeometry(RA+.15,.05,8,64), M.gold, C.x,FY[i]+1.06,C.z, Math.PI/2,0,0); }
    k.build(shell); }
  // va chạm vỏ: tường kính từng tầng, lan can (chỉ trong khoảng cao tương ứng)
  const ring=(r,y0,y1,skip)=>{ const n=Math.ceil(TAU*r/.9); for(let i=0;i<n;i++){ const a=i/n*TAU; if(skip && skip(a)) continue; const p=at(a,r); circles.push({x:p.x, z:p.z, r:.32, y0, y1}); } };
  const dAng=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
  ring(RB-.15, Y0-1, Y0+FH-.5, a=>dAng(a,ENT)<gap/2+.02);
  ring(RB-.15, FY[1]-.2, FY[1]+FH-.5); ring(RB-.15, FY[2]-.2, FY[2]+FH-.5); ring(RB+.05, FY[3]-.2, FY[3]+1.6);

  /* ============================== CẦU THANG XOẮN ỐC ============================== */
  const STEP=.25, DA=TAU/30, R0=1.35, R1=RA-.2, NSTEP=Math.round((FY[3]-Y0)/STEP), A0=ENT+Math.PI*.55;
  const landA=[]; for(let f=1;f<=3;f++) landA.push(A0+(f*FH/STEP)*DA);
  { const k=Kit();
    k.add(new THREE.CylinderGeometry(R0-.05,R0+.05,FY[3]-Y0+12,32), M.marble, C.x,Y0+(FY[3]-Y0+12)/2,C.z); circles.push({x:C.x, z:C.z, r:R0});
    for(let i=1;i<=NSTEP;i++){ const a=A0+i*DA, y=Y0+i*STEP, rm=(R0+R1)/2, p=at(a,rm);
      k.add(new THREE.BoxGeometry(R1-R0, .12, (R1)*DA+.18), M.marble, p.x,y-.06,p.z, 0,yawOut(a)+Math.PI/2,0);
      k.add(new THREE.BoxGeometry(R1-R0, .16, (R1)*DA+.18), M.marbleD, p.x,y-.2,p.z, 0,yawOut(a)+Math.PI/2,0);
      addPlat(p.x, p.z, yawOut(a), R1*Math.sin(DA/2)+.12, (R1-R0)/2, y);
      const nearLand=landA.some(la=>dAng(a,la)<DA*1.6);
      if(i>3 && !nearLand){ const q=at(a,R1+.12); circles.push({x:q.x, z:q.z, r:.17, y0:y-.3, y1:y+1.15}); }   // tay vịn ngoài
      if(y-Y0>.8 && y-Y0<2.2){ circles.push({x:p.x, z:p.z, r:.7, y0:Y0-1, y1:y-.5}); }                            // không chui gầm bậc thấp
      // tay vịn: cột nhỏ + thanh vàng
      if(i%2===0){ const q=at(a,R1+.05); k.add(new THREE.CylinderGeometry(.025,.025,1.0,6), M.gold, q.x,y+.5,q.z); } }
    // tay vịn xoắn (ống vàng chạy theo đường xoắn)
    { const pts=[]; for(let i=4;i<=NSTEP;i++){ const a=A0+i*DA; const q=at(a,R1+.05, Y0+i*STEP+1.0); pts.push(q); } const curve=new THREE.CatmullRomCurve3(pts); k.add(new THREE.TubeGeometry(curve, NSTEP*2, .045, 6, false), M.gold); }
    // chiếu nghỉ nối thang vào sàn từng tầng (bắc qua khe giếng trời)
    for(let f=0;f<3;f++){ const a=landA[f], y=FY[f+1], p=at(a,(R1+RA+.6)/2); k.add(new THREE.BoxGeometry(2.0,.2,RA+.6-R1+.4), M.marble, p.x,y-.1,p.z, 0,yawOut(a),0); addPlat(p.x,p.z,yawOut(a),1.0,(RA+.6-R1)/2+.25,y); }
    k.build(inner); }
  // cuối thang (sân thượng): chắn ngang không bước hụt xuống giếng trời
  { const aEnd=A0+(NSTEP+1)*DA; for(let r=R0+.25;r<=R1+.05;r+=.45){ const p=at(aEnd,r); circles.push({x:p.x, z:p.z, r:.26, y0:FY[3]-.4, y1:FY[3]+1.4}); }
    const k=Kit(); const p=at(aEnd,(R0+R1)/2); k.add(new THREE.BoxGeometry(R1-R0,.06,.06), M.gold, p.x,FY[3]+1.0,p.z, 0,yawOut(aEnd)+Math.PI/2,0); k.add(new THREE.BoxGeometry(R1-R0,1.0,.04), M.glass, p.x,FY[3]+.5,p.z, 0,yawOut(aEnd)+Math.PI/2,0); k.build(inner); }
  // lan can giếng trời có chừa lối từ chiếu nghỉ
  for(let f=1;f<=3;f++){ const la=landA[f-1]; ring(RA+.2, FY[f]-.2, FY[f]+1.15, a=>dAng(a,la)<.32); }

  /* ============================== TRƯNG BÀY (atlas mỗi tầng = 1 lượt vẽ) ============================== */
  const wrap=(g,text,x,y,maxW,lh)=>{ const words=text.split(' '); let line='', yy=y; for(const w of words){ const t=line?line+' '+w:w; if(g.measureText(t).width>maxW && line){ g.fillText(line,x,yy); yy+=lh; line=w; } else line=t; } if(line) g.fillText(line,x,yy); return yy; };
  function panelAtlas(list, theme){ const CW=512, CH=320, cols=4, rows=Math.ceil(list.length/cols), c=document.createElement('canvas'); c.width=CW*cols; c.height=CH*rows; const g=c.getContext('2d');
    list.forEach((p,i)=>{ const x0=(i%cols)*CW, y0=Math.floor(i/cols)*CH; const gr=g.createLinearGradient(x0,y0,x0,y0+CH); gr.addColorStop(0,theme[0]); gr.addColorStop(1,theme[1]); g.fillStyle=gr; g.fillRect(x0,y0,CW,CH);
      g.strokeStyle='#e8c060'; g.lineWidth=8; g.strokeRect(x0+8,y0+8,CW-16,CH-16); g.fillStyle='#ffd77a'; g.font='900 26px "Segoe UI",sans-serif'; g.textBaseline='top';
      wrap(g, p.t, x0+30, y0+28, CW-60, 32); g.fillStyle='#ffffff'; g.font='600 21px "Segoe UI",sans-serif'; wrap(g, p.d, x0+30, y0+108, CW-60, 28);
      if(p.icon){ g.font='64px "Segoe UI Emoji"'; g.textAlign='right'; g.fillText(p.icon, x0+CW-28, y0+CH-90); g.textAlign='left'; } });
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return {t, cols, rows}; }
  function hangPanels(list, floorY, theme, a0, a1){ const at_=panelAtlas(list, theme), geos=[];
    list.forEach((p,i)=>{ const a=a0+(a1-a0)*(i+.5)/list.length, pos=at(a,RB-.55), g=new THREE.PlaneGeometry(3.4,2.12), uv=g.attributes.uv, cx=i%at_.cols, cy=Math.floor(i/at_.cols);
      for(let k=0;k<uv.count;k++){ uv.setXY(k, (cx+uv.getX(k))/at_.cols, 1-(cy+1-uv.getY(k))/at_.rows); }
      g.applyMatrix4(new THREE.Matrix4().makeRotationY(yawOut(a)+Math.PI)); g.translate(pos.x, floorY+2.0, pos.z); geos.push(g); });
    const m=new THREE.Mesh(mergeGeometries(geos), new THREE.MeshStandardMaterial({map:at_.t, roughness:.55, emissive:0xffffff, emissiveMap:at_.t, emissiveIntensity:.22})); inner.add(m); }
  const PRINC=[
    {t:'1. Kiểm thử cho thấy có lỗi', d:'Kiểm thử chỉ chứng minh phần mềm CÓ lỗi, không chứng minh được phần mềm HẾT lỗi.', icon:'🔍'},
    {t:'2. Kiểm thử hết là không thể', d:'Không thể thử mọi tổ hợp đầu vào – hãy dựa vào rủi ro và ưu tiên để chọn test.', icon:'♾️'},
    {t:'3. Kiểm thử càng sớm càng tốt', d:'Tìm lỗi từ lúc đọc yêu cầu rẻ hơn nhiều so với sửa lỗi khi đã lên production.', icon:'⏱️'},
    {t:'4. Lỗi thường tập trung', d:'Phần lớn lỗi nằm ở một số ít module – hãy soi kỹ những chỗ hay "dính".', icon:'🐞'},
    {t:'5. Nghịch lý thuốc trừ sâu', d:'Chạy mãi một bộ test cũ sẽ không tìm thêm lỗi mới – phải làm mới test thường xuyên.', icon:'🧪'},
    {t:'6. Kiểm thử tuỳ ngữ cảnh', d:'App ngân hàng, game hay trang tin tức cần cách kiểm thử khác nhau.', icon:'🧭'},
    {t:'7. Ảo tưởng "không còn lỗi"', d:'Hết lỗi chưa chắc đã đúng thứ người dùng cần – chất lượng là giá trị mang lại.', icon:'🎯'},
    {t:'1947 · "Con bọ" đầu tiên', d:'Một con bướm đêm kẹt trong máy Harvard Mark II, được dán vào sổ nhật ký – ca "bug" thật đầu tiên.', icon:'🦋'},
    {t:'1996 · Ariane 5', d:'Tên lửa tự huỷ sau ~37 giây do tràn số khi chuyển số 64-bit sang 16-bit.', icon:'🚀'},
    {t:'1999 · Mars Climate Orbiter', d:'Tàu vũ trụ mất tích vì một hệ thống dùng đơn vị Anh, hệ thống kia dùng đơn vị mét.', icon:'🛰️'},
    {t:'2012 · Knight Capital', d:'Triển khai sai phiên bản, mất khoảng 440 triệu USD chỉ trong 45 phút.', icon:'📉'},
    {t:'2014 · Heartbleed', d:'Thiếu kiểm tra độ dài trong OpenSSL làm lộ dữ liệu bộ nhớ của máy chủ.', icon:'💔'}];
  const TECH=[
    {t:'Phân vùng tương đương', d:'Chia dữ liệu vào thành các nhóm cư xử giống nhau, mỗi nhóm chỉ cần 1 test đại diện.', icon:'🧩'},
    {t:'Phân tích giá trị biên', d:'Lỗi hay nằm ở mép: thử ngay tại biên, sát dưới và sát trên biên.', icon:'📏'},
    {t:'Bảng quyết định', d:'Liệt kê tổ hợp điều kiện → hành động, không bỏ sót luật nghiệp vụ.', icon:'🗂️'},
    {t:'Chuyển trạng thái', d:'Vẽ trạng thái và sự kiện, thử cả các chuyển trạng thái KHÔNG hợp lệ.', icon:'🔁'},
    {t:'Kiểm thử cặp (pairwise)', d:'Phủ mọi cặp giá trị tham số với số test ít hơn rất nhiều.', icon:'👥'},
    {t:'Kiểm thử thăm dò', d:'Vừa học, vừa thiết kế, vừa chạy test – dựa trên kinh nghiệm và trực giác.', icon:'🧭'},
    {t:'Kim tự tháp kiểm thử', d:'Nhiều unit test, vừa phải integration test, ít UI test – nhanh, rẻ, ổn định.', icon:'🔺'},
    {t:'Tự động hoá UI', d:'Selenium · Playwright · Cypress · Appium – tự động các luồng người dùng.', icon:'🤖'},
    {t:'API & Hiệu năng', d:'Postman · REST client · JMeter · k6 – kiểm thử API, tải và độ chịu đựng.', icon:'⚡'},
    {t:'CI/CD & chất lượng liên tục', d:'Test chạy tự động mỗi lần đẩy code – phát hiện lỗi trong vài phút.', icon:'🔄'},
    {t:'Bảo mật', d:'Thử phân quyền, đầu vào độc hại, lộ dữ liệu – nghĩ như người tấn công.', icon:'🛡️'},
    {t:'Khả năng truy cập', d:'Bàn phím, trình đọc màn hình, độ tương phản – sản phẩm cho mọi người.', icon:'♿'}];
  const HALL=[
    {t:'Glenford Myers', d:'"The Art of Software Testing" (1979) – cuốn sách kinh điển định nghĩa kiểm thử là tìm lỗi.', icon:'📘'},
    {t:'Cem Kaner, James Bach, Bret Pettichord', d:'"Lessons Learned in Software Testing" (2001) – kinh nghiệm thực chiến, kiểm thử thăm dò.', icon:'📗'},
    {t:'Lisa Crispin & Janet Gregory', d:'"Agile Testing" (2009) – tester là thành viên trọn vẹn của đội Agile.', icon:'📙'},
    {t:'Kent Beck', d:'Phổ biến TDD – viết test trước, code sau, thiết kế nhờ test.', icon:'🧪'},
    {t:'Mike Cohn', d:'Kim tự tháp kiểm thử – cân bằng giữa unit, service và UI test.', icon:'🔺'},
    {t:'Michael Bolton & James Bach', d:'Rapid Software Testing – kiểm thử là hoạt động tư duy, không chỉ là bấm theo kịch bản.', icon:'🧠'},
    {t:'Đội QC Bình Phan', d:'Tận tâm · Chính trực · Học hỏi – chất lượng là uy tín của cả đội.', icon:'🏆'},
    {t:'Bạn – người QA tiếp theo', d:'Mỗi bug bạn tìm ra là một người dùng được bảo vệ. Hãy tiếp tục tò mò!', icon:'🌟'}];
  const openA=ENT, half=gap/2+.28;
  hangPanels(PRINC, FY[0], ['#1d2a44','#0f1626'], openA+half, openA+TAU-half);
  hangPanels(TECH, FY[1], ['#123b3a','#0b2120'], openA+.2, openA+TAU-.2);
  const MYA=openA+Math.PI, MYH=.55;   // phòng bí ẩn: cung đối diện cửa chính, lầu 2
  hangPanels(HALL, FY[2], ['#3b1d12','#1f0f09'], MYA+MYH+.15, MYA+TAU-MYH-.15);
  // tủ trưng bày trệt: kim tự tháp kiểm thử, con bọ 1947, cúp
  const caseKit=Kit(), glowM=sm(0x9fe8ff,.2,.1,{emissive:0x46c8ff, emissiveIntensity:.8});
  const showcase=(a,r,y,build)=>{ const p=at(a,r); caseKit.add(new THREE.CylinderGeometry(.75,.85,1.0,24), M.marble, p.x,y+.5,p.z); caseKit.add(new THREE.CylinderGeometry(.62,.62,1.1,24,1,true), M.glass, p.x,y+1.55,p.z); build(p.x,y+1.05,p.z); circles.push({x:p.x, z:p.z, r:.9, y0:y-.2, y1:y+2.2}); };
  showcase(ENT+Math.PI*.5, 9.2, Y0, (x,y,z)=>{ caseKit.add(new THREE.CylinderGeometry(.18,.5,.28,4), sm(0xd94141,.4), x,y+.14,z); caseKit.add(new THREE.CylinderGeometry(.12,.3,.22,4), sm(0xf2c230,.4), x,y+.39,z); caseKit.add(new THREE.ConeGeometry(.16,.3,4), sm(0x46d39a,.4), x,y+.65,z); });
  showcase(ENT-Math.PI*.5, 9.2, Y0, (x,y,z)=>{ caseKit.add(new THREE.SphereGeometry(.12,10,8), sm(0x5a4030,.6), x,y+.25,z); for(const s of [-1,1]) caseKit.add(new THREE.CircleGeometry(.22,10), sm(0xb89a70,.7,0,{side:THREE.DoubleSide}), x+s*.2,y+.28,z, 0,0,s*.4); });
  showcase(ENT+Math.PI, 9.2, Y0, (x,y,z)=>{ caseKit.add(new THREE.CylinderGeometry(.2,.08,.35,16), M.gold, x,y+.35,z); caseKit.add(new THREE.CylinderGeometry(.06,.06,.12,8), M.gold, x,y+.12,z); caseKit.add(new THREE.SphereGeometry(.11,12,8), glowM, x,y+.62,z); });
  caseKit.build(inner);
  // kiosk đố vui (lầu 1) – E
  { const k=Kit(); for(const a of [ENT+.9, ENT-.9, ENT+Math.PI]){ const p=at(a,9.6); k.add(new THREE.BoxGeometry(.9,1.2,.5), M.dark, p.x,FY[1]+.6,p.z, 0,yawOut(a)+Math.PI,0); k.add(new THREE.BoxGeometry(.8,.55,.06), glowM, p.x,FY[1]+1.35,p.z, -.3,yawOut(a)+Math.PI,0);
      circles.push({x:p.x, z:p.z, r:.55, y0:FY[1]-.2, y1:FY[1]+2});
      INTER.push({x:p.x, z:p.z, r:1.8, prio:.8, when:()=>Math.abs(P.y-FY[1])<1.5, label:'🧠 Kiosk đố vui QA (E)', action:()=>{ if(W.life && W.life.openQuiz) W.life.openQuiz(); else toast('Kiosk đang khởi động…'); }}); }
    k.build(inner); }

  /* ============================== 🔒 PHÒNG BÍ ẨN (lầu 2) ============================== */
  const myst={open:false, k:0, t:0};
  { const k=Kit(), y=FY[2], rIn=RA+.9, wallM=sm(0x241436,.6,.2,{emissive:0x4a1e8a, emissiveIntensity:.25});
    for(const s of [-1,1]){ const a=MYA+s*MYH; for(let r=rIn;r<RB-.3;r+=.5){ const p=at(a,r); k.add(new THREE.BoxGeometry(.25,FH-.5,.55), wallM, p.x,y+(FH-.5)/2,p.z, 0,yawOut(a)+Math.PI/2,0); circles.push({x:p.x, z:p.z, r:.32, y0:y-.2, y1:y+FH-.5}); } }
    const dg=.9/rIn;   // khe cửa (rad)
    for(const [a0,a1] of [[-MYH,-dg],[dg,MYH]]){ const arcG=new THREE.CylinderGeometry(rIn,rIn,FH-.5,20,1,true,(Math.PI/2-MYA)-a1,a1-a0); arcG.applyMatrix4(new THREE.Matrix4().makeTranslation(C.x,y+(FH-.5)/2,C.z)); k.add(arcG, wallM);
      for(let a=a0;a<=a1+1e-6;a+=.45/rIn){ const p=at(MYA+a,rIn); circles.push({x:p.x, z:p.z, r:.3, y0:y-.2, y1:y+FH-.5}); } }
    { const lintel=new THREE.CylinderGeometry(rIn,rIn,FH-.5-2.7,8,1,true,(Math.PI/2-MYA)-dg,dg*2); lintel.applyMatrix4(new THREE.Matrix4().makeTranslation(C.x,y+2.7+(FH-.5-2.7)/2,C.z)); k.add(lintel, wallM); }
    k.build(inner);
    // cửa trượt ở giữa vách cong
    const doorA=MYA, dp=at(doorA,rIn-.05), door=new THREE.Mesh(new THREE.BoxGeometry(1.6,2.6,.12), M.purple); door.position.set(dp.x,y+1.3,dp.z); door.rotation.y=yawOut(doorA)+Math.PI; inner.add(door);
    const sign=(()=>{ const c=document.createElement('canvas'); c.width=256; c.height=128; const g=c.getContext('2d'); g.fillStyle='#14081f'; g.fillRect(0,0,256,128); g.fillStyle='#c79bff'; g.font='900 72px "Segoe UI"'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('?',128,60); g.font='700 20px "Segoe UI"'; g.fillText('PHÒNG BÍ ẨN',128,108); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.7), new THREE.MeshStandardMaterial({map:sign, emissive:0xffffff, emissiveMap:sign, emissiveIntensity:.8})); const sp=at(doorA,rIn-.12); sg.position.set(sp.x,y+3.1,sp.z); sg.rotation.y=yawOut(doorA)+Math.PI; inner.add(sg);
    // chặn cửa (khi đóng)
    const blockers=[-.6,0,.6].map(o=>{ const p=at(doorA+o/rIn, rIn); const c={x:p.x, z:p.z, r:.42, y0:y-.2, y1:y+2.6}; circles.push(c); return c; });
    // bên trong: bệ + dấu ? phát sáng xoay
    const ped=new THREE.Mesh(new THREE.CylinderGeometry(.7,.9,1.1,24), M.marbleD); const pp=at(MYA,(rIn+RB)/2); ped.position.set(pp.x,y+.55,pp.z); inner.add(ped); circles.push({x:pp.x, z:pp.z, r:1.0, y0:y-.2, y1:y+2});
    const q=new THREE.Mesh(new THREE.TorusGeometry(.38,.1,10,24,Math.PI*1.4), M.purple); q.position.set(pp.x,y+2.1,pp.z); inner.add(q); const qd=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8), M.purple); qd.position.set(pp.x,y+1.45,pp.z); inner.add(qd);
    myst.door=door; myst.dp=dp; myst.blockers=blockers; myst.q=q; myst.y=y; myst.doorA=doorA; myst.rIn=rIn;
    INTER.push({x:dp.x, z:dp.z, r:2.2, prio:.9, when:()=>Math.abs(P.y-y)<1.5, get label(){ return myst.open?'🚪 Đóng cửa phòng bí ẩn (E)':'🔒 Phòng bí ẩn (E)'; },
      action:()=>{ if(myst.open){ myst.open=false; return; } const ui=W.life && W.life.ui || W.ui;
        if(ui && ui.confirm) ui.confirm('🔒 Phòng bí ẩn', 'Căn phòng này được <b>để dành cho một điều đặc biệt</b> sẽ ra mắt sau.<br>Bạn có muốn bước vào xem trước không gian trống bên trong?', 'Mở cửa', ()=>{ myst.open=true; toast('🔮 Cửa phòng bí ẩn mở ra…', 2000); });
        else { myst.open=true; } }}); }

  /* ============================== SÂN THƯỢNG: ống nhòm + ghế ============================== */
  { const k=Kit(), y=FY[3];
    for(const a of [ENT, ENT+TAU/3, ENT-TAU/3]){ const p=at(a,RB-1.2); k.add(new THREE.CylinderGeometry(.06,.1,1.1,8), M.steel, p.x,y+.55,p.z); k.add(new THREE.CylinderGeometry(.12,.16,.6,12), M.dark, p.x,y+1.2,p.z, Math.PI/2.3,yawOut(a),0);
      circles.push({x:p.x, z:p.z, r:.35, y0:y-.2, y1:y+1.6});
      INTER.push({x:p.x, z:p.z, r:1.6, prio:.8, when:()=>Math.abs(P.y-y)<1.5, label:'🔭 Ống nhòm ngắm thành phố (E)', action:()=>{ const look=at(a,200, y-10), pos=at(a,RB+1, y+1.6); HOOK.camOverride={pos, look, k:4}; toast('🔭 Đang ngắm thành phố… (6 giây)', 2200); setTimeout(()=>{ HOOK.camOverride=null; }, 6000); }}); }
    for(const a of [ENT+TAU/6, ENT-TAU/6, ENT+Math.PI]){ const p=at(a,RB-1.6); k.add(new THREE.BoxGeometry(2.0,.12,.6), M.marble, p.x,y+.45,p.z, 0,yawOut(a)+Math.PI/2,0); k.add(new THREE.BoxGeometry(2.0,.42,.2), M.marbleD, p.x,y+.21,p.z, 0,yawOut(a)+Math.PI/2,0);
      W.addSeat && W.addSeat({x:p.x, z:p.z, rot:yawOut(a), y:y+.5, floor:y, label:'🪑 Ngồi ngắm toàn cảnh (E · C)'}); }
    k.build(inner); }

  /* ============================== 👑 CHỮ QC VÀNG KHỔNG LỒ + LẤP LÁNH + CỘT SÁNG ============================== */
  const EY=FY[3]+14.5; const emblem=new THREE.Group(); emblem.position.set(C.x, EY, C.z); emblem.scale.setScalar(1.7); shell.add(emblem);
  const goldE=new THREE.MeshStandardMaterial({color:0xffd27a, metalness:1, roughness:.22, emissive:0xffa000, emissiveIntensity:.3});
  { const Q=new THREE.Mesh(new THREE.TorusGeometry(2.6,.55,20,72), goldE); Q.position.x=-3.1; emblem.add(Q);
    const tail=new THREE.Mesh(new THREE.BoxGeometry(.9,2.4,.9), goldE); tail.position.set(-1.4,-2.2,0); tail.rotation.z=.75; emblem.add(tail);
    const Cc=new THREE.Mesh(new THREE.TorusGeometry(2.6,.55,20,72,Math.PI*1.55), goldE); Cc.position.x=3.1; Cc.rotation.z=Math.PI*.225; emblem.add(Cc);
    const crown=new THREE.Mesh(new THREE.OctahedronGeometry(1.1,0), new THREE.MeshStandardMaterial({color:0xbfefff, metalness:.3, roughness:.05, emissive:0x66d9ff, emissiveIntensity:.6, transparent:true, opacity:.9})); crown.position.y=4.3; crown.scale.set(1,1.6,1); emblem.add(crown); emblem.userData.crown=crown;
    const ped=new THREE.Mesh(new THREE.CylinderGeometry(2.0,1.4,1.6,24), M.gold); ped.position.set(C.x, FY[3]+12.6, C.z); shell.add(ped); }
  // lấp lánh
  const spark=(()=>{ const n=90, pos=new Float32Array(n*3), base=[]; for(let i=0;i<n;i++){ const a=Math.random()*TAU, r=5+Math.random()*11, y=(Math.random()-.3)*9; base.push([a,r,y,Math.random()*TAU]); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const tex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'), gr=x.createRadialGradient(32,32,1,32,32,31); gr.addColorStop(0,'rgba(255,250,220,1)'); gr.addColorStop(.25,'rgba(255,220,120,.7)'); gr.addColorStop(1,'rgba(255,200,80,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); x.fillStyle='rgba(255,255,240,.9)'; x.fillRect(31,4,2,56); x.fillRect(4,31,56,2); return new THREE.CanvasTexture(c); })();
    const pts=new THREE.Points(g, new THREE.PointsMaterial({map:tex, size:1.1, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:.9})); pts.frustumCulled=false; pts.userData.dynamic=true; shell.add(pts); return {pts, pos, base, n}; })();
  // cột sáng ban đêm
  const beamMat=new THREE.MeshBasicMaterial({color:0xffe2a0, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
  const beams=[]; for(let i=0;i<4;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.35,4,140,16,1,true), beamMat); b.geometry.translate(0,70,0); b.position.set(C.x, FY[3]+1, C.z); b.userData.dynamic=true; shell.add(b); beams.push(b); }
  // băng LED chữ chạy quanh mép sân thượng
  const ledTex=(()=>{ const c=document.createElement('canvas'); c.width=2048; c.height=96; const g=c.getContext('2d'); g.fillStyle='#07090d'; g.fillRect(0,0,2048,96); g.fillStyle='#ffd77a'; g.font='900 58px "Segoe UI",sans-serif'; g.textBaseline='middle';
    const msg='★ BRAND QC ★ TINH HOA QA/QC ★ CHẤT LƯỢNG LÀ UY TÍN ★ BÌNH PHAN QC TEAM '; let x=10; while(x<2048){ g.fillText(msg,x,50); x+=g.measureText(msg).width; } const t=new THREE.CanvasTexture(c); t.wrapS=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.repeat.x=2; return t; })();
  const led=new THREE.Mesh(new THREE.CylinderGeometry(RB+.42,RB+.42,1.1,96,1,true), new THREE.MeshStandardMaterial({map:ledTex, emissive:0xffffff, emissiveMap:ledTex, emissiveIntensity:.9})); led.position.set(C.x, FY[3]-1.0, C.z); shell.add(led);
  makeLabel('🏛️ Tháp Brand QC', 'Tinh hoa QA/QC · đi bộ thẳng vào bên trong', {h:.9, x:C.x, y:FY[3]+17, z:C.z, fade:420});
  PLACES.push({icon:'🏛️', name:'Tháp Brand QC', sub:'Đỉnh Đồi Brand QC · trưng bày tinh hoa QA/QC · phòng bí ẩn · sân thượng ngắm cảnh', go:()=>{ const p=at(ENT,RB+7); teleport(p.x, p.z, C.x, C.z); }});

  /* ============================== khung hình ============================== */
  let wasIn=false, savedDist=null;
  HOOK.onFrame.push((dt, T)=>{
    const d=Math.hypot(P.x-C.x, P.z-C.z), near=d<90 && !W.inside; if(inner.visible!==near) inner.visible=near;
    emblem.rotation.y+=dt*.25; emblem.userData.crown.rotation.y-=dt*.8; emblem.position.y=EY+Math.sin(T*.8)*.3;
    const n=W.night||0; goldE.emissiveIntensity=.25+n*.9; beamMat.opacity=n*.16; beams.forEach((b,i)=>{ const a=T*.18+i*TAU/4; b.rotation.set(Math.sin(a)*.38, 0, Math.cos(a)*.38); });
    led.material.map.offset.x=(T*.02)%1;
    if(d<120){ const s=spark; for(let i=0;i<s.n;i++){ const [a,r,y,ph]=s.base[i], aa=a+T*.15; s.pos[i*3]=C.x+Math.cos(aa)*r; s.pos[i*3+1]=EY+y*1.5+Math.sin(T*1.3+ph)*.4; s.pos[i*3+2]=C.z+Math.sin(aa)*r; } s.pts.geometry.attributes.position.needsUpdate=true; s.pts.material.size=.8+.4*Math.sin(T*6); }
    // phòng bí ẩn: cửa trượt
    myst.k+=((myst.open?1:0)-myst.k)*Math.min(1,dt*3); const sl=myst.k*1.7, tg=yawOut(myst.doorA)+Math.PI/2, tv=[Math.sin(tg),Math.cos(tg)];
    myst.door.position.set(myst.dp.x+tv[0]*sl, myst.y+1.3, myst.dp.z+tv[1]*sl); for(const b of myst.blockers) b.y1=myst.k>.6 ? myst.y-10 : myst.y+2.6; myst.q.rotation.y+=dt*1.2;
    // vào trong toà: camera thu gọn + không xuyên trần
    const inside=d<RB-.4 && P.y>Y0-1 && P.y<FY[3]-.6 && !W.inside;   // sân thượng là ngoài trời: không giới hạn trần
    if(inside){ const f=Math.min(2, Math.max(0, Math.floor((P.y-Y0+.3)/FH))); if(!wasIn){ savedDist=cam.dist; cam.dist=Math.min(cam.dist,4.2); } HOOK.camBox={x0:C.x-9, x1:C.x+9, z0:C.z-9, z1:C.z+9, y1:FY[f]+FH-.8}; wasIn=true; }
    else if(wasIn){ wasIn=false; HOOK.camBox=null; if(savedDist) cam.dist=savedDist; }
  });
  return {C, FY, ENT, RB, RA, landA, myst};
}
