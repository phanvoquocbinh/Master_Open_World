// QC World – 🗣️ ĐẢO NGOẠI NGỮ · TRUNG TÂM NGOẠI NGỮ QC (miễn phí)
//  Vùng đất mới phía Tây đảo chính (x −360…−160, z −120…100 – đã đăng ký trong LAND_CLAIMS.md), nối bằng CẦU VÒM 115 m từ bãi biển bờ Tây (z = −16).
//  Campus: 🏛️ Toà Trung tâm Ngoại ngữ (sảnh kính đi bộ vào được – quầy tư vấn) · 🇬🇧 English House (tháp đồng hồ) · 🏯 Hán Học Đường 汉学堂
//          🎭 Sân khấu CLB Giao tiếp (hội thoại nhập vai) · 📝 Phòng thi IELTS · HSK (đề thi thử) · 📖 Thư viện (sổ tay chuyên đề) · 📌 Bảng ôn tập (bài đến hạn kiểm tra lại)
//  Bấm E ở các điểm trên → mở ứng dụng học (js/langui.js – chỉ tải khi mở lần đầu). Dữ liệu: data/lang_*.json (gộp bằng data/lang_src/build.py).
//  Khi đang mở ứng dụng học: thế giới 3D tạm ngừng vẽ (đỡ tốn GPU), đóng lại vẽ tiếp bình thường.
export async function make(W, ctx = {}){
  const {THREE, scene, HOOK, INTER, PLACES, toast, circles, boxes, mergeGeometries, teleport, addPlat, EXTL, lampPost} = W;
  const ui = ctx.ui || W.ui;
  let seed = 20261115; const R = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const vn = (x, z) => { const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz), a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const fbm = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for(let k = 0; k < o; k++){ s += a * vn(x * f, z * f); n += a; f *= 2; a *= .5; } return s / n; };
  const sm = (c, r = .6, m = 0, o = {}) => new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(1, 1, 1), _p = new THREE.Vector3();
  function Kit(){ const parts = new Map(); return {
    add(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0){ const g = geo.index ? geo.toNonIndexed() : geo.clone(); _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s); g.applyMatrix4(_m); if(!parts.has(mat)) parts.set(mat, []); parts.get(mat).push(g); },
    build(parent = scene){ for(const [m, list] of parts){ const geo = list.length === 1 ? list[0] : mergeGeometries(list, false); if(!geo) continue; const ms = new THREE.Mesh(geo, m); ms.castShadow = !m.transparent; ms.receiveShadow = true; parent.add(ms); } } }; }
  const canvasTex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if(rep){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  const signTex = (w, h, bg, lines) => canvasTex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle';
    for(const [txt, font, col, y] of lines){ g.fillStyle = col; g.font = font; g.fillText(txt, w / 2, h * y); } });
  const plane = (tex, w, h, x, y, z, ry = 0, emis = .55) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({map:tex, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:emis, roughness:.6, side:THREE.DoubleSide})); m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); return m; };

  /* ============================== 1. ĐẤT MỚI ============================== */
  const LAND = {x0:-360, x1:-160, z0:-120, z1:100}, CX = -262, CZ = -12, HX = 92, HZ = 102, ZB = -16, CAMP = {hx:66, hz:76};
  const mask = (x, z) => { const u = Math.abs(x - CX) / HX, v = Math.abs(z - CZ) / HZ; return (1 - Math.pow(u ** 4 + v ** 4, .25)) * 90 + (fbm(x * .025 + 7, z * .025 - 3, 3) - .5) * 9; };
  function hf(x, z){
    const m = mask(x, z), dx = x - CX, dz = z - CZ, out = Math.max(Math.abs(dx) - CAMP.hx, Math.abs(dz) - CAMP.hz);
    let h = 1.3;
    if(out > 0){ const east = dx > 30 && Math.abs(z - ZB) < 36 ? 0 : 1; h += ss(0, 26, out) * fbm(x * .014 + 2, z * .014 + 5, 4) * 12 * east + (fbm(x * .05, z * .05, 2) - .5) * .4 * east; }
    if(x > -204 && Math.abs(z - ZB) < 10){ const k = ss(10, 6, Math.abs(z - ZB)); h = lerp(h, lerp(.3, 1.3, ss(-178, -202, x)), k); }   // dốc thoai thoải từ đầu cầu lên campus
    if(m < 0) return lerp(-.5, -6.5, clamp(-m / 14, 0, 1));
    if(m < 9) return Math.min(h, lerp(.22, h, ss(0, 9, m)));
    return h; }
  const RES = 2, NX = Math.round((LAND.x1 - LAND.x0) / RES) + 1, NZ = Math.round((LAND.z1 - LAND.z0) / RES) + 1, H = new Float32Array(NX * NZ);
  for(let j = 0; j < NZ; j++) for(let i = 0; i < NX; i++) H[j * NX + i] = hf(LAND.x0 + i * RES, LAND.z0 + j * RES);
  const hAt = (x, z) => { const fx = (x - LAND.x0) / RES, fz = (z - LAND.z0) / RES; if(fx < 0 || fz < 0 || fx >= NX - 1 || fz >= NZ - 1) return null; const i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j, a = H[j * NX + i], b = H[j * NX + i + 1], c = H[(j + 1) * NX + i], d = H[(j + 1) * NX + i + 1];
    return tx + tz <= 1 ? a + (b - a) * tx + (c - a) * tz : d + (c - d) * (1 - tx) + (b - d) * (1 - tz); };
  EXTL.push({x0:LAND.x0, x1:LAND.x1 - RES, z0:LAND.z0, z1:LAND.z1 - RES, h:hAt, name:'Đảo Ngoại ngữ'});
  const G0 = 1.3;   // cao độ nền campus
  // đường lát đá trong campus (tô màu lên lưới địa hình)
  const PLAZA = {x:-226, z:ZB, r:17};
  const paved = (x, z) => (Math.abs(z - ZB) < 4.5 && x > -282 && x < -176) || Math.hypot(x - PLAZA.x, z - PLAZA.z) < PLAZA.r
    || (Math.abs(x - PLAZA.x) < 3 && Math.abs(z - ZB) < 56) || (Math.abs(x + 257) < 2.6 && Math.abs(z - ZB) < 36) || (Math.abs(z - ZB + 52) < 2.4 && x > -312 && x < -212) || (Math.abs(z - ZB - 46) < 2.4 && x > -300 && x < -212);
  { const pos = new Float32Array(NX * NZ * 3), col = new Float32Array(NX * NZ * 3), c = new THREE.Color();
    const SAND = new THREE.Color(0xdcc89a), G1 = new THREE.Color(0x5e9a3e), G2 = new THREE.Color(0x7fae4a), G3 = new THREE.Color(0x467a34), STONE = new THREE.Color(0xc9c2b4), STONE2 = new THREE.Color(0xb3ab9c);
    for(let j = 0; j < NZ; j++) for(let i = 0; i < NX; i++){ const k = j * NX + i, x = LAND.x0 + i * RES, z = LAND.z0 + j * RES, h = H[k]; pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z;
      const n = fbm(x * .07, z * .07, 2);
      if(h < .95) c.copy(SAND); else { c.copy(G1).lerp(G2, n); c.lerp(G3, ss(3, 9, h) * .7); if(paved(x, z)) c.copy(STONE).lerp(STONE2, n * .7); }
      if(h > .6 && h < 1.1) c.lerp(SAND, ss(1.1, .6, h) * .8);
      c.offsetHSL(0, 0, (n - .5) * .04); col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b; }
    const idx = new Uint32Array((NX - 1) * (NZ - 1) * 6); let q = 0; for(let j = 0; j < NZ - 1; j++) for(let i = 0; i < NX - 1; i++){ const a = j * NX + i, b = a + 1, cc = a + NX, d = cc + 1; idx[q++] = a; idx[q++] = cc; idx[q++] = b; idx[q++] = b; idx[q++] = cc; idx[q++] = d; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals(); g.computeBoundingSphere();
    const terr = new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.95})); terr.receiveShadow = true; terr.userData.dynamic = true; terr.userData.noFar = true; scene.add(terr); }

  const k = Kit();
  const M = {
    white:sm(0xf2f1ec, .5), cream:sm(0xece2c8, .7), stone:sm(0xbdb6a6, .85), dark:sm(0x22262e, .5, .3), steel:sm(0xd4d9df, .3, .85), arch:sm(0xf4f6f8, .35, .4),
    asph:sm(0x34373c, .9), deck:sm(0x9aa1a8, .8), wood:sm(0x8a5a35, .7), red:sm(0xb3261e, .55), gold:sm(0xd8a531, .35, .8), roof:sm(0x3d4a45, .75), roofE:sm(0x5b3c2c, .8),
    green:sm(0x2f6d3a, .8), navy:sm(0x1b3557, .5), seat:sm(0x2f6fdb, .6), brickTrim:sm(0xf3efe6, .6), water:sm(0x4aa3c9, .1, .2, {transparent:true, opacity:.85}),
    glass:new THREE.MeshStandardMaterial({color:0x9fd2f5, roughness:.04, metalness:.85, transparent:true, opacity:.26, depthWrite:false, side:THREE.DoubleSide}) };

  /* ============================== 2. CẦU VÒM (bờ Tây đảo chính → Đảo Ngoại ngữ) ============================== */
  let XS = -62; for(let x = -48; x > -110; x -= .5){ if(W.groundH(x, ZB) < -.2 && !(W.platH && W.platH(x, ZB) > -1e8)){ XS = x + 1.5; break; } }
  const XE = -180, BL = XS - XE, BW = 9;
  { const N = 14, segL = BL / N;
    for(let i = 0; i < N; i++){ const t0 = i / N, t1 = (i + 1) / N, tm = (t0 + t1) / 2, hy = .2 + .55 * Math.sin(Math.PI * tm), x = XS - (i + .5) * segL;
      k.add(new THREE.BoxGeometry(segL + .05, .55, BW), M.deck, x, hy - .3, ZB); k.add(new THREE.BoxGeometry(segL + .05, .04, BW - 1.6), M.asph, x, hy, ZB);
      for(const s of [-1, 1]) k.add(new THREE.BoxGeometry(segL + .05, .12, .8), M.stone, x, hy + .04, ZB + s * (BW / 2 - .4));
      addPlat(x, ZB, 0, segL / 2 + .03, BW / 2 - .15, hy); }
    for(const s of [-1, 1]){ const z = ZB + s * (BW / 2 - .05);
      k.add(new THREE.BoxGeometry(BL, .09, .09), M.steel, XS - BL / 2, 1.45, z); k.add(new THREE.BoxGeometry(BL, .06, .06), M.steel, XS - BL / 2, .95, z);
      for(let x = XS - 1; x > XE; x -= 2.4) k.add(new THREE.BoxGeometry(.08, 1.1, .08), M.steel, x, .95, z);
      boxes.push({x0:XE + .5, x1:XS - .5, z0:z - .15, z1:z + .15});
      // 2 vòm thép trắng hai bên + dây treo
      const A = 15, xa = XS - 18, xb = XE + 18; let prev = null;
      for(let i = 0; i <= 28; i++){ const t = i / 28, x = lerp(xa, xb, t), y = 1 + Math.sin(Math.PI * t) * A, p = new THREE.Vector3(x, y, z + s * .3);
        if(prev){ const d = p.clone().sub(prev), L = d.length(); const mid = p.clone().add(prev).multiplyScalar(.5); k.add(new THREE.BoxGeometry(L + .1, .55, .55), M.arch, mid.x, mid.y, mid.z, 0, 0, Math.atan2(d.y, d.x)); }
        if(i % 2 === 0 && i > 0 && i < 28) k.add(new THREE.CylinderGeometry(.03, .03, y - 1.4, 4), M.steel, x, 1.4 + (y - 1.4) / 2, z);
        prev = p; } }
    for(let x = XS - 10; x > XE + 6; x -= 12) for(const s of [-1, 1]) k.add(new THREE.CylinderGeometry(.55, .8, 6, 10), M.deck, x, -3.2, ZB + s * 3.2);
    for(let x = XS - 8; x > XE + 4; x -= 16) for(const s of [-1, 1]) lampPost(x, ZB + s * (BW / 2 + .35));
    // cổng chào 2 đầu cầu
    const gate = (x, face) => { for(const s of [-1, 1]){ k.add(new THREE.BoxGeometry(.9, 7.2, .9), M.navy, x, 3.6, ZB + s * 5.4); circles.push({x, z:ZB + s * 5.4, r:.65}); }
      k.add(new THREE.BoxGeometry(1.2, 1.4, 11.8), M.navy, x, 7.6, ZB);
      const t = signTex(1024, 160, '#16324f', [['🗣️ ĐẢO NGOẠI NGỮ · LANGUAGE ISLAND · 语言岛', '800 54px "Segoe UI","Segoe UI Emoji","Microsoft YaHei",sans-serif', '#ffffff', .44], ['Học miễn phí: Tiếng Anh 0 → IELTS 8.0+ · Tiếng Trung 0 → HSK 7–9', '600 30px "Segoe UI",sans-serif', '#ffd23f', .82]]);
      for(const f of [1, -1]) plane(t, 10.8, 1.7, x + f * .62, 7.6, ZB, f > 0 ? Math.PI / 2 : -Math.PI / 2); };
    gate(XS + 1.2); gate(XE - 3); }

  /* ============================== 3. CAMPUS ============================== */
  const facade = (base, win, frame, cols, rows, litP = .55) => {
    const map = canvasTex(512, 512, (g, w, h) => { g.fillStyle = frame; g.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows; for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){ g.fillStyle = win(R()); g.fillRect(c * cw + 5, r * rh + 6, cw - 10, rh - 12); } g.fillStyle = base; for(let r = 0; r <= rows; r++) g.fillRect(0, r * rh - 3, w, 6); }, [1, 1]);
    const lit = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows; for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++) if(R() < litP){ g.fillStyle = R() < .7 ? '#ffe2ad' : '#d8ecff'; g.fillRect(c * cw + 5, r * rh + 6, cw - 10, rh - 12); } }, [1, 1]);
    return {map, lit}; };
  const NIGHT = [];
  const facadeBox = (fx, w, h, d, x, y, z, rx, ry) => { const mats = []; for(let i = 0; i < 6; i++){ if(i === 2 || i === 3){ mats.push(M.roof); continue; }
      const along = (i < 2) ? d : w; const map = fx.map.clone(), lit = fx.lit.clone(); map.needsUpdate = lit.needsUpdate = true; map.repeat.set(Math.max(1, Math.round(along / rx)), Math.max(1, Math.round(h / ry))); lit.repeat.copy(map.repeat);
      const m = new THREE.MeshStandardMaterial({map, emissive:0xffffff, emissiveMap:lit, emissiveIntensity:.05, roughness:.35, metalness:.25}); NIGHT.push([m, .05, .95]); mats.push(m); }
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); b.position.set(x, y + h / 2, z); b.castShadow = b.receiveShadow = true; scene.add(b); return b; };
  const glassFx = facade('#c9d4de', r => `rgb(${50 + r * 30 | 0},${100 + r * 40 | 0},${150 + r * 50 | 0})`, '#2a4f73', 4, 4, .5);
  const brickFx = (() => { const cols = 3, rows = 3, rects = [];
    for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){ const cw = 512 / cols, rh = 512 / rows; rects.push([c * cw + cw * .3, r * rh + rh * .2, cw * .4, rh * .58]); }
    const map = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#9a3d2c'; g.fillRect(0, 0, w, h);
      for(let y = 0; y < h; y += 12) for(let x = (y / 12 % 2) * 14 - 14; x < w; x += 28){ g.fillStyle = R() < .5 ? '#8a3424' : '#b2533b'; g.fillRect(x + 1, y + 1, 26, 10); }
      for(const [x, y, ww, hh] of rects){ g.fillStyle = '#f3efe6'; g.fillRect(x - 7, y - 7, ww + 14, hh + 14); g.fillStyle = `rgb(${52 + R() * 20 | 0},${70 + R() * 20 | 0},${92 + R() * 25 | 0})`; g.fillRect(x, y, ww, hh); g.fillStyle = '#f3efe6'; g.fillRect(x + ww / 2 - 2, y, 4, hh); g.fillRect(x, y + hh * .45, ww, 4); }
      g.fillStyle = '#e9e2d2'; g.fillRect(0, h - 10, w, 10); }, [1, 1]);
    const lit = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); for(const [x, y, ww, hh] of rects) if(R() < .55){ g.fillStyle = '#ffe2ad'; g.fillRect(x, y, ww, hh); } }, [1, 1]);
    return {map, lit}; })();

  // ---- 3a. Toà Trung tâm Ngoại ngữ (sảnh kính đi bộ vào được) ----
  const MB = {x0:-316, x1:-290, ax1:-276, z0:ZB - 30, z1:ZB + 30, az0:ZB - 16, az1:ZB + 16, HH:9};
  facadeBox(glassFx, MB.x1 - MB.x0, 24, MB.z1 - MB.z0, (MB.x0 + MB.x1) / 2, G0, ZB, 6, 4);
  for(const [za, zb] of [[MB.z0, MB.az0], [MB.az1, MB.z1]]) facadeBox(glassFx, MB.ax1 - MB.x1, 15, zb - za, (MB.x1 + MB.ax1) / 2, G0, (za + zb) / 2, 6, 4);
  boxes.push({x0:MB.x0, x1:MB.x1 + .2, z0:MB.z0, z1:MB.z1}); boxes.push({x0:MB.x1, x1:MB.ax1, z0:MB.z0, z1:MB.az0 + .2}); boxes.push({x0:MB.x1, x1:MB.ax1, z0:MB.az1 - .2, z1:MB.z1});
  { const Y = G0, ax = (MB.x1 + MB.ax1) / 2;
    k.add(new THREE.BoxGeometry(MB.ax1 - MB.x1, .12, MB.az1 - MB.az0), sm(0xe8e4dc, .2, .05), ax, Y + .06, ZB);
    addPlat(ax, ZB, 0, (MB.ax1 - MB.x1) / 2, (MB.az1 - MB.az0) / 2, Y + .12);   // mặt sàn sảnh – đứng trên sàn, không lún
    const door = 4.4; for(const [a, b] of [[MB.az0, ZB - door / 2], [ZB + door / 2, MB.az1]]){ k.add(new THREE.BoxGeometry(.08, MB.HH, b - a), M.glass, MB.ax1, Y + MB.HH / 2, (a + b) / 2); boxes.push({x0:MB.ax1 - .15, x1:MB.ax1 + .15, z0:a, z1:b}); }
    k.add(new THREE.BoxGeometry(.08, MB.HH - 3.4, door), M.glass, MB.ax1, Y + 3.4 + (MB.HH - 3.4) / 2, ZB);
    for(let z = MB.az0; z <= MB.az1 + .01; z += 4) k.add(new THREE.BoxGeometry(.24, MB.HH, .2), M.steel, MB.ax1, Y + MB.HH / 2, z);
    k.add(new THREE.BoxGeometry(MB.ax1 - MB.x1 + 1.2, .5, MB.az1 - MB.az0 + 1), M.dark, ax, Y + MB.HH + .25, ZB);
    k.add(new THREE.BoxGeometry(3.6, .3, 7.5), M.white, MB.ax1 + 1.8, Y + 4, ZB);
    for(const s of [-1, 1]){ k.add(new THREE.CylinderGeometry(.14, .14, 4, 10), M.steel, MB.ax1 + 3.3, Y + 2, ZB + s * 3.4); circles.push({x:MB.ax1 + 3.3, z:ZB + s * 3.4, r:.2}); }
    // nội thất sảnh: quầy tư vấn, sofa, kệ sách, cây, 2 phòng học kính
    k.add(new THREE.BoxGeometry(1.3, 1.1, 6), M.white, -284, Y + .55, ZB); k.add(new THREE.BoxGeometry(1.5, .08, 6.3), M.gold, -284, Y + 1.14, ZB); boxes.push({x0:-284.75, x1:-283.25, z0:ZB - 3.1, z1:ZB + 3.1});
    for(const s of [-1, 1]){ k.add(new THREE.BoxGeometry(2.2, .5, .9), M.navy, -280.5, Y + .25, ZB + s * 6.5); k.add(new THREE.BoxGeometry(2.2, .6, .25), M.navy, -280.5, Y + .7, ZB + s * 6.9); boxes.push({x0:-281.6, x1:-279.4, z0:ZB + s * 6.5 - .5, z1:ZB + s * 6.5 + .5});
      k.add(new THREE.CylinderGeometry(.35, .3, .6, 10), M.wood, -278, Y + .3, ZB + s * 9); k.add(new THREE.IcosahedronGeometry(.8, 0), M.green, -278, Y + 1.2, ZB + s * 9); circles.push({x:-278, z:ZB + s * 9, r:.45});
      // phòng học kính hai bên sảnh
      const cz = ZB + s * 12.2;
      k.add(new THREE.BoxGeometry(.06, 3, 6.6), M.glass, -282, Y + 1.5, cz); k.add(new THREE.BoxGeometry(7.6, 3, .06), M.glass, -285.8, Y + 1.5, cz - s * 3.3);
      boxes.push({x0:-282.2, x1:-281.8, z0:cz - 3.3, z1:cz + 3.3}); boxes.push({x0:-289.6, x1:-282, z0:cz - s * 3.3 - .15, z1:cz - s * 3.3 + .15});
      for(let r = 0; r < 2; r++) for(let c = 0; c < 3; c++){ const dx = -288.6 + r * 2.6, dz = cz - 2 + c * 2; k.add(new THREE.BoxGeometry(1, .06, 1.4), M.white, dx, Y + .75, dz); k.add(new THREE.BoxGeometry(.06, .72, 1.3), M.steel, dx, Y + .37, dz); k.add(new THREE.BoxGeometry(.45, .45, .45), M.seat, dx + .7, Y + .23, dz); }
      boxes.push({x0:-289.3, x1:-284.8, z0:cz - 2.9, z1:cz + 2.9}); }   // cụm bàn ghế phòng học
    for(const z of [ZB - 7.6, ZB + 7.6]){ k.add(new THREE.BoxGeometry(.5, 2.4, 3.2), M.wood, -289.5, Y + 1.2, z); for(let i = 0; i < 4; i++) k.add(new THREE.BoxGeometry(.42, .04, 3.1), M.cream, -289.4, Y + .4 + i * .55, z); }
    // bảng chữ trong 2 phòng học + màn hình lộ trình sau quầy
    const wb1 = signTex(512, 256, '#f7f7f2', [['Lesson 1: Hello!', '700 46px Segoe UI', '#1f4fa8', .3], ["I'm Lan. I'm from Hanoi.", '36px Segoe UI', '#222', .6], ['/aɪm/  /ʃiːz/  /ɪts/', '32px Segoe UI', '#b3261e', .85]]);
    const wb2 = signTex(512, 256, '#f7f7f2', [['第一课 你好！', '700 50px "Microsoft YaHei",sans-serif', '#b3261e', .3], ['Nǐ hǎo! Wǒ jiào Xiǎo Lán.', '34px Segoe UI', '#222', .6], ['nǐ hǎo → ní hǎo', '32px Segoe UI', '#1f4fa8', .85]]);
    plane(wb1, 3, 1.5, -289.55, Y + 1.8, ZB - 12.2, Math.PI / 2, .15); plane(wb2, 3, 1.5, -289.55, Y + 1.8, ZB + 12.2, Math.PI / 2, .15);
    const scr = signTex(1024, 512, '#0c1c33', [['LỘ TRÌNH HỌC MIỄN PHÍ', '800 64px "Segoe UI",sans-serif', '#ffd23f', .14], ['ENGLISH  0 → A1 → A2 → B1 → B2 → IELTS 7.5 → IELTS 8.0+', '600 38px "Segoe UI",sans-serif', '#ffffff', .38], ['中文  0 → HSK1 → HSK2 → HSK3 → HSK4 → HSK5 → HSK6 → HSK 7–9', '600 38px "Segoe UI","Microsoft YaHei",sans-serif', '#ffffff', .56], ['Bài đánh số · bài tập tự chấm · thi cuối cấp · thi thử · ôn tập ngắt quãng', '30px "Segoe UI",sans-serif', '#9fd2ff', .76], ['Bấm E ở quầy tư vấn để bắt đầu học', '700 34px "Segoe UI",sans-serif', '#46d39a', .9]]);
    plane(scr, 9, 4.5, MB.x1 + .12, Y + 4.4, ZB, Math.PI / 2, .7);
    const big = signTex(2048, 300, '#0f2747', [['TRUNG TÂM NGOẠI NGỮ QC', '900 150px "Segoe UI",sans-serif', '#ffffff', .42], ['ENGLISH · 中文 · HỌC MIỄN PHÍ', '700 72px "Segoe UI","Microsoft YaHei",sans-serif', '#ffd23f', .84]]);
    const bigM = plane(big, 26, 3.8, MB.x1 + .08, G0 + 20.5, ZB, Math.PI / 2, .6); NIGHT.push([bigM.material, .45, 1.1]);
    const lobby = signTex(1024, 160, '#16324f', [['🗣️ SẢNH TƯ VẤN · LOBBY · 大厅', '800 60px "Segoe UI","Segoe UI Emoji","Microsoft YaHei",sans-serif', '#fff', .52]]);
    plane(lobby, 9, 1.4, MB.ax1 + .06, Y + MB.HH - 1.2, ZB, Math.PI / 2, .6);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.45, 40), new THREE.MeshBasicMaterial({color:0xffd23f, transparent:true, opacity:.75, side:THREE.DoubleSide})); ring.rotation.x = -Math.PI / 2; ring.position.set(-272.5, G0 + .04, ZB); ring.userData.dynamic = true; scene.add(ring);
    HOOK.onFrame.push((dt, T) => { ring.material.opacity = .45 + .3 * Math.sin(T * 3); });
    let camSet = false; HOOK.onFrame.push(() => { const p = W.P, inside = !W.inside && p.x > MB.x1 && p.x < MB.ax1 && p.z > MB.az0 && p.z < MB.az1 && p.y < G0 + MB.HH;
      if(inside){ HOOK.camBox = {x0:MB.x1 + .5, x1:MB.ax1 - .5, z0:MB.az0 + .5, z1:MB.az1 - .5, y1:G0 + MB.HH - .6}; camSet = true; } else if(camSet){ camSet = false; HOOK.camBox = null; } }); }

  // ---- 3b. English House (gạch đỏ, mái dốc, tháp đồng hồ) ----
  const EH = {x:-257, z:ZB - 44, w:26, d:16};
  { const Y = G0; facadeBox(brickFx, EH.w, 9, EH.d, EH.x, Y, EH.z, 6.5, 4.5); boxes.push({x0:EH.x - EH.w / 2, x1:EH.x + EH.w / 2, z0:EH.z - EH.d / 2, z1:EH.z + EH.d / 2});
    const roof = new THREE.CylinderGeometry(.01, EH.d / 2 + .8, EH.w + 1.4, 3, 1); roof.rotateZ(Math.PI / 2); roof.scale(1, .55, 1);
    k.add(roof, M.roofE, EH.x, Y + 9 + 2.2, EH.z, 0, 0, 0);
    k.add(new THREE.BoxGeometry(5, 18, 5), M.brickTrim, EH.x, Y + 9, EH.z + EH.d / 2 - 2.5); k.add(new THREE.ConeGeometry(3.8, 4.5, 4), M.roofE, EH.x, Y + 20.2, EH.z + EH.d / 2 - 2.5, 0, Math.PI / 4, 0);
    const clock = canvasTex(256, 256, (g) => { g.fillStyle = '#f7f3e6'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#2b2b2b'; g.lineWidth = 8; g.stroke(); g.fillStyle = '#222'; g.font = 'bold 26px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle';
      ['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'].forEach((t, i) => { const a = i / 12 * Math.PI * 2 - Math.PI / 2; g.fillText(t, 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); }); });
    const cm = new THREE.Mesh(new THREE.CircleGeometry(1.7, 32), new THREE.MeshStandardMaterial({map:clock, emissive:0xffffff, emissiveMap:clock, emissiveIntensity:.15})); cm.position.set(EH.x, Y + 15.5, EH.z + EH.d / 2 + .02); scene.add(cm); NIGHT.push([cm.material, .15, .9]);
    const hands = new THREE.Group(); hands.position.set(EH.x, Y + 15.5, EH.z + EH.d / 2 + .06); hands.userData.dynamic = true; scene.add(hands);
    const hh = new THREE.Mesh(new THREE.BoxGeometry(.08, .9, .04), M.dark), mh = new THREE.Mesh(new THREE.BoxGeometry(.06, 1.35, .04), M.dark); hh.geometry.translate(0, .4, 0); mh.geometry.translate(0, .6, 0); hands.add(hh, mh);
    HOOK.onFrame.push(() => { const d = new Date(), m = d.getMinutes() + d.getSeconds() / 60, h = d.getHours() % 12 + m / 60; mh.rotation.z = -m / 60 * Math.PI * 2; hh.rotation.z = -h / 12 * Math.PI * 2; });
    k.add(new THREE.BoxGeometry(3, 3.4, .3), M.wood, EH.x, Y + 1.7, EH.z + EH.d / 2 + .1); k.add(new THREE.BoxGeometry(4.4, .3, 1.6), M.brickTrim, EH.x, Y + 3.7, EH.z + EH.d / 2 + .7);
    plane(signTex(1024, 180, '#1f4fa8', [['ENGLISH HOUSE', '900 92px Georgia,serif', '#ffffff', .45], ['Tiếng Anh · 0 → IELTS 8.0+', '600 40px "Segoe UI",sans-serif', '#ffd23f', .85]]), 8, 1.4, EH.x, Y + 5, EH.z + EH.d / 2 + .05, 0, .5); }

  // ---- 3c. Hán Học Đường 汉学堂 (bệ đá, cột đỏ, mái cong hai tầng) ----
  const HH = {x:-257, z:ZB + 44, w:24, d:15};
  { const Y = G0, top = Y + 1.1;
    k.add(new THREE.BoxGeometry(HH.w + 4, 1.1, HH.d + 4), M.stone, HH.x, Y + .55, HH.z); boxes.push({x0:HH.x - HH.w / 2 - 2, x1:HH.x + HH.w / 2 + 2, z0:HH.z - HH.d / 2 - 3.05, z1:HH.z + HH.d / 2 + 2});   // gồm cả bậc đá trước bệ
    for(let i = 0; i < 3; i++) k.add(new THREE.BoxGeometry(6, .37, 1), M.stone, HH.x, Y + .18 + i * .37 - .37 * 0, HH.z - HH.d / 2 - 2.5 + i * .01 - (2 - i) * .0);
    const wallT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a1f17'; g.lineWidth = 6; for(let i = 0; i < 4; i++){ const x = 40 + i * 120; g.strokeRect(x, 50, 80, 150); for(let j = 1; j < 5; j++){ g.beginPath(); g.moveTo(x, 50 + j * 30); g.lineTo(x + 80, 50 + j * 30); g.stroke(); } g.beginPath(); g.moveTo(x + 40, 50); g.lineTo(x + 40, 200); g.stroke(); } }, [3, 1]);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(HH.w - 2, 6, HH.d - 2), new THREE.MeshStandardMaterial({map:wallT, roughness:.8})); wall.position.set(HH.x, top + 3, HH.z); wall.castShadow = wall.receiveShadow = true; scene.add(wall);
    for(let i = 0; i <= 6; i++) for(const s of [-1, 1]){ const x = HH.x - HH.w / 2 + .5 + i * (HH.w - 1) / 6; k.add(new THREE.CylinderGeometry(.32, .36, 6.2, 12), M.red, x, top + 3.1, HH.z + s * (HH.d / 2 - .4)); }
    const hip = (w, d, h, y, m) => { const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1); g.rotateY(Math.PI / 4); g.scale(w, h, d); k.add(g, m, HH.x, y + h / 2, HH.z); };
    k.add(new THREE.BoxGeometry(HH.w + 3.4, .5, HH.d + 3.4), M.red, HH.x, top + 6.4, HH.z); hip(HH.w + 6, HH.d + 6, 2.6, top + 6.5, M.roof);
    k.add(new THREE.BoxGeometry(HH.w * .62, 2.6, HH.d * .6), M.red, HH.x, top + 9.9, HH.z); hip(HH.w * .62 + 4, HH.d * .6 + 4, 2.8, top + 11.1, M.roof);
    k.add(new THREE.BoxGeometry(HH.w * .62 + 1, .25, .25), M.gold, HH.x, top + 13.95, HH.z);
    for(const sx of [-1, 1]) for(const sz of [-1, 1]){ k.add(new THREE.BoxGeometry(1.8, .25, .5), M.roof, HH.x + sx * ((HH.w + 6) / 2 - .4), top + 6.85, HH.z + sz * ((HH.d + 6) / 2 - .4), 0, Math.atan2(sz, sx) * -1, .5 * sx);
      k.add(new THREE.SphereGeometry(.42, 10, 8), M.red, HH.x + sx * (HH.w / 2 + 1.5), top + 5.6, HH.z + sz * (HH.d / 2 + 1)); }
    const plaque = signTex(1024, 300, '#7a1410', [['汉 学 堂', '900 150px "KaiTi","STKaiti","Microsoft YaHei",serif', '#ffd36b', .42], ['HÁN HỌC ĐƯỜNG · Tiếng Trung 0 → HSK 7–9', '600 44px "Segoe UI",sans-serif', '#fff3d0', .84]]);
    plane(plaque, 7, 2.05, HH.x, top + 5.2, HH.z - HH.d / 2 + .3, Math.PI, .5);
    if(W.GLOW) for(const sx of [-1, 1]) for(const sz of [-1, 1]) try{ W.GLOW.add(HH.x + sx * (HH.w / 2 + 1.5), top + 5.6, HH.z + sz * (HH.d / 2 + 1), 2.2, 0xff6040); }catch(e){} }

  // ---- 3d. Sân khấu CLB Giao tiếp (khán đài bán nguyệt) ----
  const AM = {x:-222, z:ZB - 52};
  { const Y = G0; k.add(new THREE.CylinderGeometry(4.2, 4.4, .6, 32), M.wood, AM.x, Y + .3, AM.z); circles.push({x:AM.x, z:AM.z, r:4.3});
    for(let i = 0; i < 4; i++){ const r0 = 6.5 + i * 1.6, r1 = r0 + 1.6, sh = new THREE.Shape(); sh.absarc(0, 0, r1, Math.PI, 0, true); sh.lineTo(r0, 0); sh.absarc(0, 0, r0, 0, Math.PI, false); sh.lineTo(-r1, 0);
      const g = new THREE.ExtrudeGeometry(sh, {depth:.45 * (i + 1), bevelEnabled:false, curveSegments:20}); g.rotateX(Math.PI / 2); g.translate(0, .45 * (i + 1), 0); k.add(g, i % 2 ? M.stone : M.cream, AM.x, Y, AM.z); }
    // khán đài nằm phía Nam sân khấu (z > AM.z): rào kín vành ngoài, vành trong và 2 đầu – không đi lọt vào khối bậc
    const ring = (rr, n) => { for(let a = 0; a <= n; a++){ const t = a / n * Math.PI; circles.push({x:AM.x + Math.cos(t) * rr, z:AM.z + Math.sin(t) * rr, r:.75}); } };
    ring(13.3, 36); ring(6.2, 16);
    for(const sx of [-1, 1]) for(let r = 6.2; r <= 13.3; r += 1.1) circles.push({x:AM.x + sx * r, z:AM.z + .3, r:.75});
    k.add(new THREE.BoxGeometry(9, 5, .3), M.navy, AM.x, Y + 3, AM.z - 4.6);
    plane(signTex(1024, 512, '#1b3557', [['🎭 SPEAKING CLUB', '900 92px "Segoe UI","Segoe UI Emoji",sans-serif', '#ffd23f', .3], ['CLB GIAO TIẾP · 口语俱乐部', '700 56px "Segoe UI","Microsoft YaHei",sans-serif', '#ffffff', .58], ['Nghe – trả lời – nhập vai – nói theo', '40px "Segoe UI",sans-serif', '#9fd2ff', .82]]), 8.6, 4.3, AM.x, Y + 3, AM.z - 4.42, 0, .55); }

  // ---- 3e. Phòng thi IELTS · HSK ----
  const EX = {x:-222, z:ZB + 50, w:22, d:14};
  { facadeBox(glassFx, EX.w, 8, EX.d, EX.x, G0, EX.z, 5.5, 4); boxes.push({x0:EX.x - EX.w / 2, x1:EX.x + EX.w / 2, z0:EX.z - EX.d / 2, z1:EX.z + EX.d / 2});
    k.add(new THREE.BoxGeometry(6, .3, 2.4), M.white, EX.x, G0 + 3.6, EX.z - EX.d / 2 - 1.1);
    plane(signTex(1024, 200, '#3a1c5c', [['📝 PHÒNG THI · EXAM HALL · 考场', '800 70px "Segoe UI","Segoe UI Emoji","Microsoft YaHei",sans-serif', '#ffffff', .42], ['Thi thử IELTS · HSK tự soạn', '600 40px "Segoe UI",sans-serif', '#ffd23f', .82]]), 10, 1.95, EX.x, G0 + 6, EX.z - EX.d / 2 - .06, Math.PI, .55); }

  // ---- 3f. Thư viện (cột cổ điển) ----
  const LB = {x:-300, z:ZB - 58, w:22, d:12};
  { const Y = G0; k.add(new THREE.BoxGeometry(LB.w, 7, LB.d), M.cream, LB.x, Y + 3.5, LB.z); boxes.push({x0:LB.x - LB.w / 2, x1:LB.x + LB.w / 2, z0:LB.z - LB.d / 2, z1:LB.z + LB.d / 2 + 2.6});
    k.add(new THREE.BoxGeometry(LB.w + 1, .8, LB.d + 4), M.white, LB.x, Y + 7.4, LB.z + 1); const ped = new THREE.CylinderGeometry(.01, LB.w / 2 + .5, 2.6, 3, 1); ped.rotateZ(Math.PI / 2); ped.rotateY(Math.PI / 2); ped.scale(1, 1, .18);
    k.add(new THREE.BoxGeometry(LB.w + 1, .5, 4.2), M.stone, LB.x, Y + .25, LB.z + LB.d / 2 + 2); addPlat(LB.x, LB.z + LB.d / 2 + 2, 0, (LB.w + 1) / 2, 2.1, Y + .5);   // bậc thềm thư viện
    for(let i = 0; i < 6; i++) k.add(new THREE.CylinderGeometry(.35, .4, 6.6, 14), M.white, LB.x - LB.w / 2 + 1.8 + i * (LB.w - 3.6) / 5, Y + 3.8, LB.z + LB.d / 2 + 2.6);
    plane(signTex(1024, 180, '#3b2a14', [['📖 THƯ VIỆN · LIBRARY · 图书馆', '800 66px "Segoe UI","Segoe UI Emoji","Microsoft YaHei",sans-serif', '#ffe6a8', .45], ['Sổ tay chuyên đề · tra cứu chuyên sâu', '40px "Segoe UI",sans-serif', '#fff', .84]]), 9, 1.6, LB.x, Y + 6.2, LB.z + LB.d / 2 + .06, 0, .5); }

  // ---- 3g. Quảng trường: đài phun nước, cột cờ, bảng ôn tập ----
  { const Y = G0; k.add(new THREE.CylinderGeometry(5.4, 5.6, .7, 36), M.stone, PLAZA.x, Y + .35, PLAZA.z); k.add(new THREE.CylinderGeometry(4.8, 4.8, .12, 36), M.water, PLAZA.x, Y + .66, PLAZA.z);
    k.add(new THREE.CylinderGeometry(.5, .8, 2.4, 14), M.white, PLAZA.x, Y + 1.6, PLAZA.z); k.add(new THREE.SphereGeometry(.9, 16, 12), M.gold, PLAZA.x, Y + 3.3, PLAZA.z); circles.push({x:PLAZA.x, z:PLAZA.z, r:5.6});
    const flags = [['#1f4fa8', 'EN', '#fff'], ['#c62f2f', '中', '#ffe08a'], ['#16324f', 'QC', '#ffd23f'], ['#2f9e6e', 'VN', '#fff']];
    flags.forEach(([bg, txt, fg], i) => { const a = Math.PI * .25 + i * Math.PI * .5, x = PLAZA.x + Math.cos(a) * 12, z = PLAZA.z + Math.sin(a) * 12;
      k.add(new THREE.CylinderGeometry(.08, .1, 9, 8), M.steel, x, Y + 4.5, z); circles.push({x, z, r:.2});
      plane(signTex(256, 160, bg, [[txt, '900 96px "Segoe UI","Microsoft YaHei",sans-serif', fg, .55]]), 2.4, 1.5, x + 1.25, Y + 8, z, 0, .35); });
    // bảng ôn tập (canvas sống – cập nhật số bài đến hạn)
    const bc = document.createElement('canvas'); bc.width = 512; bc.height = 320; const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace; bt.userData.live = true;
    const paintBoard = () => { const g = bc.getContext('2d'), d = dueNow(); g.fillStyle = '#20302a'; g.fillRect(0, 0, 512, 320); g.strokeStyle = '#8a5a35'; g.lineWidth = 16; g.strokeRect(0, 0, 512, 320);
      g.fillStyle = '#ffd23f'; g.font = '800 40px "Segoe UI","Segoe UI Emoji",sans-serif'; g.textAlign = 'center'; g.fillText('📌 BẢNG ÔN TẬP', 256, 62);
      g.fillStyle = '#fff'; g.font = '30px "Segoe UI",sans-serif'; g.fillText('Bài đến hạn kiểm tra lại:', 256, 120);
      g.font = '800 64px "Segoe UI",sans-serif'; g.fillStyle = d.en + d.zh ? '#ff8b8b' : '#46d39a'; g.fillText(d.en + d.zh ? `EN ${d.en} · 中 ${d.zh}` : 'Không có 👍', 256, 200);
      g.fillStyle = '#cfe0ff'; g.font = '26px "Segoe UI",sans-serif'; g.fillText('Bấm E để kiểm tra lại – ôn đúng lúc sắp quên', 256, 270); bt.needsUpdate = true; };
    const BX = PLAZA.x + 8, BZ = ZB - 10;
    k.add(new THREE.BoxGeometry(.2, 3.4, .2), M.wood, BX - 1.6, Y + 1.7, BZ); k.add(new THREE.BoxGeometry(.2, 3.4, .2), M.wood, BX + 1.6, Y + 1.7, BZ); boxes.push({x0:BX - 1.8, x1:BX + 1.8, z0:BZ - .2, z1:BZ + .2});
    const bm = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.1), new THREE.MeshStandardMaterial({map:bt, emissive:0xffffff, emissiveMap:bt, emissiveIntensity:.35, side:THREE.DoubleSide})); bm.position.set(BX, Y + 2.2, BZ); scene.add(bm);
    let bT = 99; HOOK.onFrame.push(dt => { bT += dt; if(bT > 8){ bT = 0; const p = W.P; if(Math.abs(p.x - BX) < 70 && Math.abs(p.z - BZ) < 70) paintBoard(); } }); paintBoard();
    INTER.push({x:BX, z:BZ + 1.4, r:2, prio:.9, label:'📌 Bảng ôn tập – kiểm tra lại bài đến hạn (E)', action:() => openApp({v:'reviews', label:'🔁 Ôn tập'})});
    // ghế đá + đèn dọc đại lộ, cây xanh
    for(let x = -186; x > -270; x -= 12){ if(Math.abs(x - PLAZA.x) < 20) continue; for(const s of [-1, 1]){ lampPost(x, ZB + s * 5.6); k.add(new THREE.BoxGeometry(2, .12, .6), M.wood, x + 5, Y + .48, ZB + s * 6.2); k.add(new THREE.BoxGeometry(.15, .45, .5), M.stone, x + 4.2, Y + .22, ZB + s * 6.2); k.add(new THREE.BoxGeometry(.15, .45, .5), M.stone, x + 5.8, Y + .22, ZB + s * 6.2); boxes.push({x0:x + 4, x1:x + 6, z0:ZB + s * 6.2 - .35, z1:ZB + s * 6.2 + .35}); } } }
  // cây xanh (2 InstancedMesh: thân + tán)
  { const spots = [];
    for(let x = -190; x > -272; x -= 9) for(const s of [-1, 1]) if(Math.abs(x - PLAZA.x) > 19) spots.push([x + 2, ZB + s * 9]);
    for(let i = 0; i < 140 && spots.length < 150; i++){ const x = lerp(LAND.x0 + 14, LAND.x1 - 14, R()), z = lerp(LAND.z0 + 14, LAND.z1 - 14, R()), h = hAt(x, z);
      if(h === null || h < 1.2 || paved(x, z)) continue; const nearB = [[MB.x0 - 4, MB.ax1 + 8, MB.z0 - 5, MB.z1 + 5], [EH.x - 16, EH.x + 16, EH.z - 11, EH.z + 12], [HH.x - 17, HH.x + 17, HH.z - 14, HH.z + 12], [AM.x - 16, AM.x + 16, AM.z - 16, AM.z + 6], [EX.x - 14, EX.x + 14, EX.z - 12, EX.z + 9], [LB.x - 14, LB.x + 14, LB.z - 9, LB.z + 13], [PLAZA.x - 20, PLAZA.x + 20, PLAZA.z - 20, PLAZA.z + 20], [-200, -160, ZB - 12, ZB + 12]];
      if(nearB.some(([a, b, c, d]) => x > a && x < b && z > c && z < d)) continue; spots.push([x, z]); }
    const tg = new THREE.CylinderGeometry(.18, .26, 2.4, 6); tg.translate(0, 1.2, 0); const cg = new THREE.IcosahedronGeometry(1.7, 1); cg.translate(0, 3.6, 0);
    const trunks = new THREE.InstancedMesh(tg, sm(0x6b4a2f, .9), spots.length), crowns = new THREE.InstancedMesh(cg, sm(0x3f7f38, .85), spots.length), c = new THREE.Color();
    spots.forEach(([x, z], i) => { const s = .8 + R() * .6, y = hAt(x, z) ?? G0; _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, R() * 6.3, 0)), _s.set(s, s * (.9 + R() * .3), s)); trunks.setMatrixAt(i, _m); crowns.setMatrixAt(i, _m); crowns.setColorAt(i, c.setHSL(.27 + R() * .07, .45 + R() * .2, .26 + R() * .1)); circles.push({x, z, r:.35 * s}); });
    _s.set(1, 1, 1);
    for(const im of [trunks, crowns]){ im.castShadow = true; im.receiveShadow = true; im.userData.dynamic = true; im.computeBoundingSphere(); scene.add(im); } }
  k.build();
  HOOK.onFrame.push(() => { const n = W.night || 0; for(const [m, a, b] of NIGHT) m.emissiveIntensity = a + (b - a) * n; });

  // ---- 3h. Người trong campus: tư vấn viên, giảng viên, học viên (đứng tại chỗ, chào khi bạn lại gần) ----
  const NPC = [];
  if(W.people && W.people.kit && W.makeActor){
    const mkNpc = (name, female, idx, x, z, face, greet, outfit) => { try{
      const sd = W.people.pickSeed ? W.people.pickSeed(L => !!L.female === female, idx) : 700 + idx, kk = W.people.kit(sd, {outfit});
      const a = W.makeActor(kk.gl, {name, height:kk.h, face:0, clips:kk.clips, compact:false, dot:'#7fb2ff'});
      if(kk.look && kk.look.width){ a.root.scale.x *= kk.look.width; a.root.scale.z *= kk.look.width; }
      a.g.position.set(x, hAt(x, z) ?? G0, z); a.g.rotation.y = face; a.play('idle', 0); a.mixer.update(R() * 3);
      circles.push({x, z, r:.35}); NPC.push({a, x, z, greet, name, near:false, t:0}); }catch(e){ console.warn('[lang] npc', e); } };
    mkNpc('Cô Linh · tư vấn', true, 21, -286.2, ZB + .8, Math.PI / 2, 'Chào bạn! Muốn học tiếng Anh hay tiếng Trung? Bấm E ở quầy để xem lộ trình miễn phí nhé 😊', {shirt:0x1f4fa8, long:true});
    mkNpc('Mr. Tom · English teacher', false, 22, -253.6, EH.z + EH.d / 2 + 1.8, 0, 'Hello! Welcome to English House. Lesson 1 starts with “Hello! I’m…” – come in! 🇬🇧', {shirt:0xffffff, pants:0x1f2a44, long:true});
    mkNpc('王老师 · thầy Vương', false, 23, -253.4, HH.z - HH.d / 2 - 3.2, Math.PI, '你好！欢迎来到汉学堂！Chào bạn, học tiếng Trung từ pinyin nhé 🀄', {shirt:0xb3261e, long:true});
    mkNpc('Ngọc Anh · học viên IELTS', true, 24, PLAZA.x + 6.5, ZB + 9.5, -2.4, 'Mình đang ôn IELTS Speaking ở CLB Giao tiếp – bạn vào nhập vai cùng không? 🎭', {shirt:0xf2a65a});
    mkNpc('Đức · học viên HSK', false, 25, PLAZA.x + 5.2, ZB + 10.6, .8, '我在准备HSK四级！Mỗi ngày mình ôn thẻ từ 15 phút 🃏', {shirt:0x2f9e6e});
    HOOK.onFrame.push(dt => { const p = W.P;
      for(const n of NPC){ const a = n.a; if(a.root.visible) a.mixer.update(dt);
        const d = Math.hypot(p.x - n.x, p.z - n.z);
        if(d < 3.6 && !n.near){ n.near = true; toast(`💬 ${n.name}: ${n.greet}`, 4200); if(a.acts.wave){ a.play('wave', .2); n.t = 2.2; } }
        else if(d > 6) n.near = false;
        if(n.t > 0){ n.t -= dt; if(n.t <= 0) a.play('idle', .3); } } }); }

  /* ============================== 4. ỨNG DỤNG HỌC + ĐIỂM TƯƠNG TÁC ============================== */
  function dueNow(){ try{ const p = JSON.parse(localStorage.getItem('qcworld-lang') || '{}'), n = Date.now(), r = {en:0, zh:0}; for(const [id, v] of Object.entries(p.rev || {})) if(!v.off && v.due <= n) r[id.startsWith('zh') ? 'zh' : 'en']++; return r; }catch(e){ return {en:0, zh:0}; } }
  let app = null, appP = null;
  const getApp = () => appP || (appP = import('./langui.js').then(m => (app = m.createApp(W, {addCoins:ctx.addCoins, ui}))).catch(e => { appP = null; throw e; }));
  async function openApp(route){ try{ const a = await getApp(); a.open(route); }catch(e){ console.warn('[lang]', e); toast('⚠️ Không mở được Trung tâm Ngoại ngữ: ' + e.message, 5000); } }
  function pickTrack(title, mk){ if(!ui || !ui.modal){ openApp(mk('en')); return; } const m = ui.modal(title);
    m.body.innerHTML = '<p class="muted">Chọn ngôn ngữ:</p><div class="row" style="gap:10px;flex-wrap:wrap"><button class="btn pri" data-t="en">🇬🇧 Tiếng Anh</button><button class="btn pri" data-t="zh">🀄 Tiếng Trung</button></div>';
    m.body.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { m.close(); openApp(mk(b.dataset.t)); }); }
  W.lang = {open:openApp, due:dueNow, pickTrack};
  // tạm ngừng vẽ thế giới 3D khi ứng dụng học đang phủ kín màn hình (đỡ tốn GPU/pin)
  const RD = W.renderer; if(RD && !RD.__lcPause){ const orig = RD.render; RD.render = function(s, c){ if(W.langOpen) return; return orig.call(this, s, c); }; RD.__lcPause = true; }
  const home = {v:'home', label:'Sảnh'};
  INTER.push({x:-282.2, z:ZB, r:2.3, prio:.95, label:'🗣️ Quầy tư vấn – Trung tâm Ngoại ngữ (E)', action:() => openApp(home)});
  INTER.push({x:-272.5, z:ZB, r:1.7, prio:.9, label:'🗣️ Trung tâm Ngoại ngữ – vào học (E)', action:() => openApp(home)});
  INTER.push({x:EH.x, z:EH.z + EH.d / 2 + 1.6, r:2.2, prio:.9, label:'🇬🇧 English House – lộ trình Tiếng Anh (E)', action:() => openApp({v:'track', t:'en'})});
  INTER.push({x:HH.x, z:HH.z - HH.d / 2 - 3.4, r:2.4, prio:.9, label:'🀄 Hán Học Đường – lộ trình Tiếng Trung (E)', action:() => openApp({v:'track', t:'zh'})});
  INTER.push({x:AM.x, z:AM.z + 14.8, r:2.4, prio:.9, label:'🎭 CLB Giao tiếp – hội thoại nhập vai, kiểm tra nghe (E)', action:() => pickTrack('🎭 CLB Giao tiếp', t => ({v:'talks', t}))});
  INTER.push({x:EX.x, z:EX.z - EX.d / 2 - 1.8, r:2.2, prio:.9, label:'📝 Phòng thi – thi thử IELTS / HSK (E)', action:() => pickTrack('📝 Phòng thi', t => ({v:'mocks', t}))});
  INTER.push({x:LB.x, z:LB.z + LB.d / 2 + 4.6, r:2.4, prio:.9, label:'📖 Thư viện – sổ tay chuyên đề (E)', action:() => pickTrack('📖 Thư viện', t => ({v:'guide', t}))});
  INTER.push({x:XS - 2, z:ZB + 3, r:2, prio:.6, label:'🗣️ Đảo Ngoại ngữ – xem lộ trình học (E)', action:() => openApp(home)});
  PLACES.push({icon:'🗣️', name:'Trung tâm Ngoại ngữ', sub:'Đảo Ngoại ngữ (qua cầu vòm bờ Tây) · Tiếng Anh 0→IELTS 8.0+ · Tiếng Trung 0→HSK 7–9 · miễn phí', go:() => teleport(-268, ZB, -285, ZB)});
  PLACES.push({icon:'🌉', name:'Cầu Đảo Ngoại ngữ', sub:'Cầu vòm 115 m từ bãi biển bờ Tây đảo chính', go:() => teleport(XS + 4, ZB, XS - 20, ZB)});

  // ⚡ thỉnh thoảng bắt kiểm tra nhanh khi đang chơi: ~25 phút chơi / lần, chỉ hỏi lúc đứng yên ngoài trời, chỉ khi đã học xong ít nhất 1 bài
  let playT = 0, lastQ = 0, still = 0, lx = 0, lz = 0, pState = null, pT = 99;
  HOOK.onFrame.push(dt => { if(W.langOpen) return; const p = W.P; playT += dt; pT += dt;
    if(pT > 60){ pT = 0; try{ const o = JSON.parse(localStorage.getItem('qcworld-lang') || '{}'); pState = {n:Object.keys(o.done || {}).length, on:!(o.set && o.set.pop === false)}; }catch(e){ pState = null; } }
    if(Math.abs(p.x - lx) + Math.abs(p.z - lz) < .02) still += dt; else still = 0; lx = p.x; lz = p.z;
    if(pState && pState.n && pState.on && !W.inside && !HOOK.vehicle && still > 5 && playT - lastQ > 1500 && playT > 600 && ui && ui.confirm && !document.querySelector('.modalWrap:not([hidden])')){
      lastQ = playT; ui.confirm('⚡ Kiểm tra nhanh – bạn còn nhớ bài không?', 'Trung tâm Ngoại ngữ hỏi <b>6 câu</b> từ các bài bạn đã học (khoảng 1 phút).<br>Ôn đúng lúc sắp quên giúp nhớ lâu gấp nhiều lần! <small>(Tắt nhắc trong ⚙️ Cài đặt của Trung tâm)</small>', '⚡ Làm ngay', () => openApp({v:'quick', label:'⚡ Kiểm tra nhanh'})); } });
  // nhắc ôn tập: khi tới đảo + 1 lần mỗi ngày lúc vào game (đếm theo khung hình, không dùng setTimeout)
  let welcomed = false, tAcc = 0, daily = false;
  HOOK.onFrame.push(dt => { const p = W.P; tAcc += dt;
    if(!daily && tAcc > 40){ daily = true; try{ const key = 'qcworld-lang-nudge', today = new Date().toDateString(); if(localStorage.getItem(key) !== today){ const d = dueNow(); if(d.en + d.zh){ localStorage.setItem(key, today); toast(`📌 Bạn có ${d.en + d.zh} bài ngoại ngữ đến hạn kiểm tra lại – tới 🗣️ Trung tâm Ngoại ngữ (phím M → bay tới) để ôn trước khi quên!`, 7000); } } }catch(e){} }
    if(!welcomed && p.x < -165 && p.x > -360 && p.z > -120 && p.z < 100){ welcomed = true; const d = dueNow();
      toast(`🗣️ Chào mừng tới Đảo Ngoại ngữ! Học miễn phí tiếng Anh & tiếng Trung – vào toà lớn cuối đại lộ, bấm E ở quầy tư vấn.${d.en + d.zh ? ` 📌 Có ${d.en + d.zh} bài đến hạn kiểm tra lại.` : ''}`, 6500); } });
  return W.lang;
}
