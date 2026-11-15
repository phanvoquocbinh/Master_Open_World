// QC World V2 – PHA 8A: 🏔️ ĐẢO NGOẠI NGỮ THỤY SĨ (Swiss Alpine Eden) – vùng x −850→−250, z −500→250, y 0→95
//  Nâng cấp từ langcenter.js (V1 vẫn giữ nguyên). Dùng chung ứng dụng học js/langui.js + API W.lang.
//  🏔️ Núi tuyết Jungfrau 95 m phía Bắc · thác bạc → Suối Băng Pha Lê uốn qua đồng cỏ hoa vàng/tím · cối xay gió · đàn bò đeo chuông
//  🚂 Tàu bánh răng đỏ chạy vòng khép kín qua cầu cạn đá vòm, 5 ga (Cầu Vòm · Tiếng Anh · Tiếng Trung · Tiếng Nhật · Tiếng Hàn & Làng Tuyết)
//  🏫 4 học viện mở thông nội thất (đại sảnh · 2 lớp học · phòng chuyên đề · quán trà) – bấm E trong phòng để học:
//     🇬🇧 Oxford Castle + Big Ben 38 m + nhà kính Kew (−420,−80) · 🀄 Hán Học Điện trên hồ sen + Cầu Cửu Khúc + rừng trúc (−680,−80)
//     🇯🇵 Lâu đài Kyoto 3 tầng mái + Torii đỏ dưới hồ + vườn đá Zen + 40 hoa anh đào rơi cánh (−420,−280)
//     🇰🇷 Hanok Dancheong + khối kính K-Cube màn hình LED + lầu Khánh Hội trên hồ đá + hàng ngân hạnh vàng (−680,−280)
//  🧀 Làng Chalet (Fondue · Sô-cô-la · Đồng hồ) (−550,80) · ⛷️ Làng Tuyết · ✈️ Bến thuỷ phi cơ (−320,160)
//  Tiếng Nhật / tiếng Hàn: khung khoá học trống (chưa có dữ liệu) – ưu tiên công trình theo V2_PLAN.
import * as AK from './archKit.js';
export async function make(W, ctx = {}){
  const {THREE, scene, HOOK, INTER, PLACES, toast, circles, boxes, teleport, addPlat, EXTL, mergeGeometries} = W;
  if(!EXTL || !addPlat) return null;
  const ui = ctx.ui || W.ui, addSeg = W.addSeg || (() => null);
  try{ AK.bindNight(W); }catch(e){}
  const R = AK.rng(81515);
  const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const vn = (x, z) => { const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz), a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const fbm = (x, z, o = 4) => { let s = 0, a = .5, f = 1, n = 0; for(let k = 0; k < o; k++){ s += a * vn(x * f, z * f); n += a; f *= 2; a *= .5; } return s / n; };
  const ridged = (x, z) => { let s = 0, a = .55, f = 1; for(let k = 0; k < 5; k++){ s += a * (1 - Math.abs(vn(x * f, z * f) * 2 - 1)) ** 2; f *= 2.1; a *= .5; } return s; };
  const sm = (c, r = .6, m = 0, o = {}) => new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const signTex = (w, h, bg, lines) => canvasTex(w, h, g => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle'; for(const [t, f, c, y] of lines){ g.fillStyle = c; g.font = f; g.fillText(t, w / 2, h * y); } });
  const FONT = '"Segoe UI","Segoe UI Emoji","Microsoft YaHei","Yu Gothic","Meiryo","Malgun Gothic",sans-serif';
  const sign = (tex, w, h, x, y, z, ry = 0, emis = .45, parent = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({map:tex, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:emis, roughness:.6, side:THREE.DoubleSide})); m.position.set(x, y, z); m.rotation.y = ry; parent.add(m); return m; };
  // Kit: gộp hình theo vật liệu; vật liệu có texture được trải UV theo toạ độ thật (1 ô = mat.userData.tileM mét) → đá/gỗ không bị kéo giãn
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s1 = new THREE.Vector3(1, 1, 1), _p = new THREE.Vector3(), _n = new THREE.Vector3();
  function uvWorld(g, s){ const P = g.attributes.position, Nn = g.attributes.normal, uv = new Float32Array(P.count * 2);
    for(let i = 0; i < P.count; i++){ _n.fromBufferAttribute(Nn, i); const x = P.getX(i), y = P.getY(i), z = P.getZ(i), ax = Math.abs(_n.x), ay = Math.abs(_n.y), az = Math.abs(_n.z);
      if(ay >= ax && ay >= az){ uv[i * 2] = x / s; uv[i * 2 + 1] = z / s; } else if(ax >= az){ uv[i * 2] = z / s; uv[i * 2 + 1] = y / s; } else { uv[i * 2] = x / s; uv[i * 2 + 1] = y / s; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
  function Kit(){ const parts = new Map(); return {
    add(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1){ const g = geo.index ? geo.toNonIndexed() : geo.clone(); _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _m4.compose(_p.set(x, y, z), _q, new THREE.Vector3(sx, sy, sz)); g.applyMatrix4(_m4); for(const k of Object.keys(g.attributes)) if(!['position','normal','uv'].includes(k)) g.deleteAttribute(k); if(!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); if(!parts.has(mat)) parts.set(mat, []); parts.get(mat).push(g); },
    build(parent = scene, shadow = true){ const out = []; for(const [m, list] of parts){ const geo = list.length === 1 ? list[0] : mergeGeometries(list, false); if(!geo) continue; if(m.map) uvWorld(geo, m.userData.tileM || 3); const ms = new THREE.Mesh(geo, m); ms.castShadow = shadow && !m.transparent; ms.receiveShadow = true; parent.add(ms); out.push(ms); } return out; } }; }

  /* ============================== 1. ĐỊA HÌNH ============================== */
  const Z = ctx.zone || {x0:-850, x1:-250, z0:-500, z1:250};
  const LX = -550, LZ = -125, HX = 287, HZ = 362;
  const ACAD = {
    en:{x:-420, z:-80, w:50, d:36, h:6.0, name:'Tiếng Anh', short:'EN'},
    zh:{x:-680, z:-80, w:50, d:38, h:5.4, name:'Tiếng Trung', short:'中'},
    ja:{x:-420, z:-280, w:52, d:40, h:7.0, name:'Tiếng Nhật', short:'日'},
    ko:{x:-680, z:-280, w:52, d:40, h:7.0, name:'Tiếng Hàn', short:'한'} };
  const mask = (x, z) => { const u = Math.abs(x - LX) / HX, v = Math.abs(z - LZ) / HZ; return (1 - Math.pow(u ** 4 + v ** 4, .25)) * 120 + (fbm(x * .02 + 7, z * .02 - 3, 3) - .5) * 14; };
  const hBase = (x, z) => { let h = 4 + fbm(x * .009 + 1, z * .009 + 3, 4) * 12; const mt = ss(-300, -440, z); h += mt * (ridged(x * .006 + 2, z * .006 - 1) * 78 + 22); return h; };
  const SITES = [
    {x:ACAD.en.x, z:ACAD.en.z, r:40, h:ACAD.en.h}, {x:-420, z:-140, r:22, h:ACAD.en.h}, {x:ACAD.zh.x, z:ACAD.zh.z, r:56, h:ACAD.zh.h},
    {x:ACAD.ja.x, z:ACAD.ja.z + 6, r:50, h:ACAD.ja.h}, {x:ACAD.ko.x - 12, z:ACAD.ko.z, r:58, h:ACAD.ko.h}, {x:-555, z:80, r:72, h:5.0},
    {x:-315, z:150, r:24, h:1.6}, {x:-770, z:-340, r:30, h:null}, {x:-550, z:-180, r:30, h:null} ];
  for(const s of SITES) if(s.h == null) s.h = hBase(s.x, s.z);
  const LAKES = [{x:ACAD.zh.x, z:ACAD.zh.z, rx:47, rz:38, bed:3.3, wl:4.7}, {x:ACAD.ja.x + 30, z:ACAD.ja.z + 46, rx:24, rz:14, bed:5.3, wl:6.5}, {x:ACAD.ko.x - 46, z:ACAD.ko.z + 4, rx:17, rz:14, bed:5.3, wl:6.5}];
  const RIV = [[-560,-372],[-546,-300],[-560,-205],[-543,-125],[-556,-40],[-547,22],[-556,80],[-532,160],[-508,228],[-500,272]];
  const RS = []; for(let i = 0; i < RIV.length - 1; i++){ const [x0, z0] = RIV[i], [x1, z1] = RIV[i + 1], L = Math.hypot(x1 - x0, z1 - z0); for(let t = 0; t < L; t += 2) RS.push([x0 + (x1 - x0) * t / L, z0 + (z1 - z0) * t / L]); }
  const riverD = (x, z) => { let d = 1e9; for(let i = 0; i < RS.length; i += 2){ const dd = (RS[i][0] - x) ** 2 + (RS[i][1] - z) ** 2; if(dd < d) d = dd; } return Math.sqrt(d); };
  function hf(x, z){
    const m = mask(x, z); if(m < -16) return -7;
    let h = hBase(x, z);
    for(const s of SITES){ const d = Math.hypot(x - s.x, z - s.z); if(d < s.r + 22) h = lerp(h, s.h, ss(s.r + 22, s.r, d)); }
    for(const L of LAKES){ const e = Math.hypot((x - L.x) / L.rx, (z - L.z) / L.rz); if(e < 1.25) h = lerp(L.bed, h, ss(.92, 1.2, e)); }
    if(z > -385){ const d = riverD(x, z); if(d < 11) h -= 1.5 * ss(10, 4, d); }
    if(m < 0) return lerp(-.4, -7, clamp(-m / 16, 0, 1));
    if(m < 12) h = lerp(.25, h, ss(0, 12, m));
    return h; }
  const RES = 3, X0 = Z.x0, Z0 = Z.z0, NX = Math.floor((Z.x1 - Z.x0) / RES) + 1, NZ = Math.floor((Z.z1 - Z.z0) / RES) + 1, H = new Float32Array(NX * NZ);
  for(let j = 0; j < NZ; j++) for(let i = 0; i < NX; i++) H[j * NX + i] = hf(X0 + i * RES, Z0 + j * RES);
  const hAt = (x, z) => { const fx = (x - X0) / RES, fz = (z - Z0) / RES; if(fx < 0 || fz < 0 || fx >= NX - 1 || fz >= NZ - 1) return null; const i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j, a = H[j * NX + i], b = H[j * NX + i + 1], c = H[(j + 1) * NX + i], d = H[(j + 1) * NX + i + 1];
    return tx + tz <= 1 ? a + (b - a) * tx + (c - a) * tz : d + (c - d) * (1 - tx) + (b - d) * (1 - tz); };
  // RA SOÁT 16/11: dải nền đường ray (ballast + tà vẹt cao 0,35–1,6 m so với cỏ) là MẶT ĐI – trước đây người đi xuyên tà vẹt
  const BED = new Map(), bedK = (x, z) => Math.floor(x * 2) * 100003 + Math.floor(z * 2);
  const hExt = (x, z) => { const h = hAt(x, z); if(h == null || !BED.size) return h; const b = BED.get(bedK(x, z)); return b !== undefined && b > h ? b : h; };
  EXTL.push({x0:X0, x1:X0 + (NX - 1) * RES, z0:Z0, z1:Z0 + (NZ - 1) * RES, h:hExt, name:'Đảo Ngoại ngữ Thụy Sĩ'});
  const gy = (x, z) => hAt(x, z) ?? 0;
  { const pos = new Float32Array(NX * NZ * 3), col = new Float32Array(NX * NZ * 3), c = new THREE.Color();
    const SAND = new THREE.Color(0xd8c79a), G1 = new THREE.Color(0x6aa846), G2 = new THREE.Color(0x8fbe4f), G3 = new THREE.Color(0x4f8a3c), ROCK = new THREE.Color(0x8b8780), ROCK2 = new THREE.Color(0x6f6b66), SNOW = new THREE.Color(0xf4f7fb), YEL = new THREE.Color(0xe8d24a), PUR = new THREE.Color(0xa77ad8);
    for(let j = 0; j < NZ; j++) for(let i = 0; i < NX; i++){ const k = j * NX + i, x = X0 + i * RES, z = Z0 + j * RES, h = H[k]; pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z;
      const hx = (H[j * NX + Math.min(i + 1, NX - 1)] - H[j * NX + Math.max(i - 1, 0)]) / (2 * RES), hz = (H[Math.min(j + 1, NZ - 1) * NX + i] - H[Math.max(j - 1, 0) * NX + i]) / (2 * RES), slope = Math.hypot(hx, hz), n = fbm(x * .05, z * .05, 2), f = hash(i * 7 + 3, j * 13 + 1);
      if(h < 1.0) c.copy(SAND); else { c.copy(G1).lerp(G2, n); c.lerp(G3, ss(20, 45, h) * .6); if(h < 18 && slope < .35){ if(f < .07) c.lerp(YEL, .75); else if(f < .11) c.lerp(PUR, .7); } c.lerp(ROCK, ss(.55, 1.1, slope)); c.lerp(ROCK2, ss(45, 70, h) * .7); c.lerp(SNOW, ss(58, 72, h + n * 8) * (1 - ss(1.3, 2.2, slope) * .5)); }
      c.offsetHSL(0, 0, (n - .5) * .05); col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b; }
    const idx = new Uint32Array((NX - 1) * (NZ - 1) * 6); let q = 0; for(let j = 0; j < NZ - 1; j++) for(let i = 0; i < NX - 1; i++){ const a = j * NX + i, b = a + 1, cc = a + NX, d = cc + 1; idx[q++] = a; idx[q++] = cc; idx[q++] = b; idx[q++] = b; idx[q++] = cc; idx[q++] = d; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals(); g.computeBoundingSphere();
    const terr = new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.95})); terr.receiveShadow = true; terr.userData.dynamic = true; terr.userData.noFar = true; scene.add(terr); }

  /* ============================== 2. NƯỚC: hồ, suối băng, thác ============================== */
  const waterM = new THREE.MeshStandardMaterial({color:0x4fb3c8, roughness:.08, metalness:.1, transparent:true, opacity:.82, depthWrite:false});
  { const gs = []; for(const L of LAKES){ const g = new THREE.CircleGeometry(1, 40); g.rotateX(-Math.PI / 2); g.scale(L.rx * 1.02, 1, L.rz * 1.02); g.translate(L.x, L.wl, L.z); gs.push(g); }
    const lm = new THREE.Mesh(mergeGeometries(gs, false), waterM); lm.renderOrder = 1; lm.userData.dynamic = true; scene.add(lm); }
  const flowTex = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#5fc4d6'; g.fillRect(0, 0, w, h); for(let i = 0; i < 140; i++){ g.fillStyle = `rgba(235,252,255,${.08 + R() * .25})`; g.fillRect(R() * w, R() * h, 1 + R() * 2, 6 + R() * 22); } }); flowTex.wrapS = flowTex.wrapT = THREE.RepeatWrapping;
  { const pos = [], uv = [], idx = []; let s = 0;
    for(let i = 0; i < RS.length; i++){ const a = RS[Math.max(0, i - 1)], b = RS[Math.min(RS.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l, [x, z] = RS[i];
      const y = Math.max(gy(x, z) + .75, .02), w = lerp(4.2, 7.5, i / RS.length); pos.push(x + nx * w / 2, y, z + nz * w / 2, x - nx * w / 2, y, z - nz * w / 2); uv.push(0, s / 8, 1, s / 8); s += 2;
      if(i > 0){ const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const rm = new THREE.Mesh(g, new THREE.MeshStandardMaterial({map:flowTex, roughness:.12, transparent:true, opacity:.9, depthWrite:false})); rm.renderOrder = 1; rm.userData.dynamic = true; rm.userData.noFar = true; scene.add(rm); }
  const WF = {x:RIV[0][0], z:RIV[0][1]}; WF.bot = gy(WF.x, WF.z) + .6; WF.top = Math.max(WF.bot + 12, gy(WF.x, WF.z - 22));
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(9, WF.top - WF.bot, 1, 6), new THREE.MeshStandardMaterial({map:flowTex.clone(), transparent:true, opacity:.88, roughness:.2, emissive:0xbfeff6, emissiveIntensity:.12, side:THREE.DoubleSide, depthWrite:false}));
  fall.material.map.wrapS = fall.material.map.wrapT = THREE.RepeatWrapping; fall.material.map.needsUpdate = true;
  fall.position.set(WF.x, (WF.top + WF.bot) / 2, WF.z - 6); fall.rotation.x = -.18; fall.userData.dynamic = true; fall.renderOrder = 2; scene.add(fall);
  HOOK.onFrame.push((dt, T) => { flowTex.offset.y = -T * .35 % 1; fall.material.map.offset.y = T * .9 % 1; });

  /* ============================== 3. VẬT LIỆU ============================== */
  const MAT = {
    stone:AK.makeStoneMaterial({col:'#d6ccb6', joint:'#9a907f', seed:11}), stoneD:AK.makeStoneMaterial({col:'#9b968c', joint:'#5f5b55', blockW:128, blockH:64, seed:12}),
    wood:AK.makeWoodMaterial({col:'#6b4426', seed:13}), woodL:AK.makeWoodMaterial({col:'#b8875a', plank:32, seed:14}), cedar:AK.makeWoodMaterial({col:'#3b2a20', plank:48, seed:15}),
    plaster:sm(0xf3efe5, .9), red:sm(0xb3261e, .45), redL:sm(0xc8402c, .5), gold:sm(0xd9a63a, .3, .85), slate:sm(0x3c4048, .7), dark:sm(0x25282e, .6, .2), white:sm(0xf7f7f4, .5),
    tatami:sm(0xc9c08a, .95), green:sm(0x2f6d3a, .8), ginkgo:sm(0xe8b923, .8), snow:sm(0xf4f7fb, .7), steel:sm(0xcfd5dc, .3, .85), floorL:sm(0xe2d8c6, .35),
    glass:new THREE.MeshStandardMaterial({color:0xbfe2f2, roughness:.05, metalness:.6, transparent:true, opacity:.28, depthWrite:false, side:THREE.DoubleSide}),
    shoji:new THREE.MeshStandardMaterial({color:0xfbf8ee, roughness:.9, transparent:true, opacity:.82, side:THREE.DoubleSide}) };
  MAT.stone.userData.tileM = 3.2; MAT.stoneD.userData.tileM = 4; MAT.wood.userData.tileM = 2.4; MAT.woodL.userData.tileM = 2; MAT.cedar.userData.tileM = 2.6;
  const KX = Kit();   // ngoại thất tĩnh toàn đảo

  /* ============================== 4. ỨNG DỤNG HỌC ============================== */
  let appP = null;
  const openApp = async route => { try{ if(W.lang && W.lang.open && W.lang.open !== openApp) return W.lang.open(route); if(!appP) appP = import('./langui.js').then(m => m.createApp(W, {addCoins:ctx.addCoins, ui})); (await appP).open(route); }catch(e){ console.warn('[swiss]', e); toast('⚠️ Không mở được ứng dụng học: ' + e.message, 4000); } };
  // V2: đảo cũ (langcenter.js) không nạp → module này giữ API W.lang, tạm dừng vẽ 3D khi mở ứng dụng học, nhắc ôn tập & kiểm tra nhanh đột xuất
  const dueNow = () => { try{ const p = JSON.parse(localStorage.getItem('qcworld-lang') || '{}'), n = Date.now(), r = {en:0, zh:0, ja:0, ko:0}; for(const [id, v] of Object.entries(p.rev || {})) if(!v.off && v.due <= n){ const t = id.slice(0, 2); r[t] = (r[t] || 0) + 1; } return r; }catch(e){ return {en:0, zh:0}; } };
  if(!W.lang){
    W.lang = {open:openApp, due:dueNow};
    const RD = W.renderer; if(RD && !RD.__lcPause){ const orig = RD.render; RD.render = function(s, c){ if(W.langOpen) return; return orig.call(this, s, c); }; RD.__lcPause = true; }
    let playT = 0, lastQ = 0, still = 0, lx = 0, lz = 0, pState = null, pT = 99, daily = false;
    HOOK.onFrame.push(dt => { if(W.langOpen) return; const p = W.P; playT += dt; pT += dt;
      if(pT > 60){ pT = 0; try{ const o = JSON.parse(localStorage.getItem('qcworld-lang') || '{}'); pState = {n:Object.keys(o.done || {}).length, on:!(o.set && o.set.pop === false)}; }catch(e){ pState = null; } }
      if(!daily && playT > 40){ daily = true; try{ const k = 'qcworld-lang-nudge', today = new Date().toDateString(); if(localStorage.getItem(k) !== today){ const d = dueNow(), n = Object.values(d).reduce((a, b) => a + b, 0); if(n){ localStorage.setItem(k, today); toast(`📌 Bạn có ${n} bài ngoại ngữ đến hạn kiểm tra lại – tới 🏔️ Đảo Ngoại ngữ Thụy Sĩ (phím M) để ôn trước khi quên!`, 7000); } } }catch(e){} }
      if(Math.abs(p.x - lx) + Math.abs(p.z - lz) < .02) still += dt; else still = 0; lx = p.x; lz = p.z;
      if(pState && pState.n && pState.on && !W.inside && !HOOK.vehicle && still > 5 && playT - lastQ > 1500 && playT > 600 && ui && ui.confirm && !document.querySelector('.modalWrap:not([hidden])')){
        lastQ = playT; ui.confirm('⚡ Kiểm tra nhanh – bạn còn nhớ bài không?', 'Trung tâm Ngoại ngữ hỏi <b>6 câu</b> từ các bài bạn đã học (khoảng 1 phút).<br>Ôn đúng lúc sắp quên giúp nhớ lâu gấp nhiều lần!', '⚡ Làm ngay', () => openApp({v:'quick', label:'⚡ Kiểm tra nhanh'})); } }); }
  let welcomed = false;
  HOOK.onFrame.push(() => { if(welcomed) return; const p = W.P; if(p.x > Z.x0 && p.x < Z.x1 && p.z > Z.z0 && p.z < Z.z1 && mask(p.x, p.z) > 0){ welcomed = true; const d = dueNow(), n = Object.values(d).reduce((a, b) => a + b, 0);
    toast(`🏔️ Chào mừng tới Đảo Ngoại ngữ Thụy Sĩ! 4 học viện Anh – Trung – Nhật – Hàn, đi bộ vào trong và bấm E để học (miễn phí).${n ? ` 📌 Có ${n} bài đến hạn kiểm tra lại.` : ''}`, 6500); } });
  // askPay chỉ hỏi xác nhận – trừ tiền bằng spend (như life.js)
  const pay = (cost, what, go) => { if(!ctx.askPay) return go(); ctx.askPay(cost, what, () => { if(ctx.spend && !ctx.spend(cost)) return; go(); }); };
  const buff = (key, min, cost, what) => { const go = () => { try{ const S = ctx.S; if(S){ S.buffs = S.buffs || {}; S.buffs[key] = Date.now() + min * 60000; ctx.save && ctx.save(); } }catch(e){} toast(`${what} – ${key === 'energy' ? '⚡ đi nhanh hơn' : '☕ thưởng quiz +20%'} trong ${min} phút!`, 3800); };
    pay(cost, what, go); };

  /* ============================== 5. KHUNG HỌC VIỆN (nội thất mở thông) ============================== */
  // Mặt bằng chung (cửa chính phía Nam): Đại sảnh giữa (bàn dài, kệ sách, bảng lộ trình) · Tây-Bắc: Lớp học A · Đông-Bắc: Phòng kiểm tra · Tây-Nam: phòng chuyên đề · Đông-Nam: quán trà
  const ACADS = [], BOTD = {};   // BOTD: dữ liệu cho bot Pha 9 (bots_swiss_palm.js)
  function academy(key, o){
    const A = ACAD[key], cx = A.x, cz = A.z, w = A.w, d = A.d, y0 = o.floorY ?? A.h + .15, WH = o.wallH ?? 7, T = .6, door = 4.4;
    const zs = cz + d / 2, zn = cz - d / 2, xw = cx - w / 2, xe = cx + w / 2;
    const inner = new THREE.Group(); inner.userData.dynamic = true; scene.add(inner);
    const upper = new THREE.Group(); upper.userData.dynamic = true; scene.add(upper);
    const ki = Kit(), wallM = o.wallM, floorM = o.floorM || MAT.floorL;
    // sàn + mặt đứng
    KX.add(new THREE.BoxGeometry(w, .3, d), floorM, cx, y0 - .15, cz); addPlat(cx, cz, 0, w / 2, d / 2, y0);
    // tường ngoài (cửa Nam ở giữa)
    const wall = (x0, x1, z0, z1, h = WH, m = wallM, kit = KX) => { kit.add(new THREE.BoxGeometry(Math.max(x1 - x0, T), h, Math.max(z1 - z0, T)), m, (x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2); boxes.push({x0:Math.min(x0, x1) - (x1 - x0 < T ? T / 2 : 0), x1:Math.max(x0, x1) + (x1 - x0 < T ? T / 2 : 0), z0:Math.min(z0, z1) - (z1 - z0 < T ? T / 2 : 0), z1:Math.max(z0, z1) + (z1 - z0 < T ? T / 2 : 0), y0:y0 - .5, y1:y0 + h}); };
    wall(xw, xe, zn, zn); wall(xw, xw, zn, zs); wall(xe, xe, zn, zs); wall(xw, cx - door / 2, zs, zs); wall(cx + door / 2, xe, zs, zs);
    KX.add(new THREE.BoxGeometry(door + .2, WH - 3.6, T), wallM, cx, y0 + 3.6 + (WH - 3.6) / 2, zs);
    // vách ngăn (thuộc nội thất – ẩn khi ở xa): 2 vách dọc có 2 cửa, 2 vách ngang chia cánh
    const pm = o.partM || wallM, gap = 2.6;
    for(const sx of [-1, 1]){ const x = cx + sx * 10;
      for(const [a, b] of [[zn, cz - d / 4 - gap / 2], [cz - d / 4 + gap / 2, cz + d / 4 - gap / 2], [cz + d / 4 + gap / 2, zs]]) wall(x, x, a, b, WH - .4, pm, ki);
      wall(sx < 0 ? xw : cx + 10, sx < 0 ? cx - 10 : xe, cz, cz, WH - .4, pm, ki); }
    // đại sảnh: 2 bàn dài + ghế băng (ngồi được), kệ sách 3 tầng sau, bảng lộ trình, quầy học vụ cạnh cửa
    for(const sx of [-1, 1]){ const tx = cx + sx * 4.2;
      ki.add(new THREE.BoxGeometry(1.6, .1, d - 12), o.tableM || MAT.wood, tx, y0 + .78, cz - 1); for(const zz of [cz - d / 2 + 6.5, cz + d / 2 - 8.5]) ki.add(new THREE.BoxGeometry(1.2, .74, .12), MAT.dark, tx, y0 + .37, zz);
      boxes.push({x0:tx - .85, x1:tx + .85, z0:cz - 1 - (d - 12) / 2, z1:cz - 1 + (d - 12) / 2, y0:y0 - .3, y1:y0 + 1});
      for(const bs of [-1, 1]) boxes.push({x0:tx + bs * 1.25 - .24, x1:tx + bs * 1.25 + .24, z0:cz - 1 - (d - 12) / 2, z1:cz - 1 + (d - 12) / 2, y0:y0 - .3, y1:y0 + .45});   /* ghế băng: chặn người đi, người ngồi (y = sàn + .47) không bị đẩy */
      for(const bs of [-1, 1]){ const bx = tx + bs * 1.25; ki.add(new THREE.BoxGeometry(.42, .45, d - 12), MAT.wood, bx, y0 + .22, cz - 1);
        if(W.addBench) try{ W.addBench({x:bx, z:cz - 1, rot:Math.PI / 2, len:d - 13, y:y0 + .47, floor:y0, label:`🪑 Ngồi bàn học · ${A.name} (E · C)`}); }catch(e){} } }
    for(const sx of [-1, 1]){ const sxp = cx + sx * 6.5; ki.add(new THREE.BoxGeometry(5, 3.6, .5), MAT.wood, sxp, y0 + 1.8, zn + .55); for(let r = 0; r < 3; r++) for(let b = 0; b < 9; b++) ki.add(new THREE.BoxGeometry(.18 + R() * .1, .9, .32), [MAT.red, MAT.green, MAT.slate, MAT.gold][(r + b) % 4], sxp - 2.2 + b * .52, y0 + .55 + r * 1.15, zn + .45); boxes.push({x0:sxp - 2.6, x1:sxp + 2.6, z0:zn, z1:zn + .9}); }
    sign(o.board, 7, 3.5, cx, y0 + 3.2, zn + .4, 0, .55, inner);
    ki.add(new THREE.BoxGeometry(3.4, 1.05, 1), MAT.wood, cx + 6.5, y0 + .52, zs - 3); boxes.push({x0:cx + 4.8, x1:cx + 8.2, z0:zs - 3.6, z1:zs - 2.4});
    // phòng học (bàn 3×4, bảng) – Tây-Bắc và Đông-Bắc
    const classroom = (sx, tex) => { const rx = cx + sx * (10 + (w / 2 - 10) / 2), rz = cz - d / 4;
      for(let r = 0; r < 3; r++) for(let c = 0; c < 4; c++){ const dx = rx - 4.2 + c * 2.8, dz = rz - 3 + r * 2.6; ki.add(new THREE.BoxGeometry(1.4, .06, .7), o.deskM || MAT.woodL, dx, y0 + .74, dz); ki.add(new THREE.BoxGeometry(.06, .72, .6), MAT.dark, dx, y0 + .37, dz); ki.add(new THREE.BoxGeometry(.5, .45, .45), o.chairM || MAT.slate, dx, y0 + .23, dz + .6); }
      boxes.push({x0:rx - 5, x1:rx + 5, z0:rz - 3.5, z1:rz + 3.1, y0:y0 - .3, y1:y0 + 1});
      ki.add(new THREE.BoxGeometry(2, .9, .8), MAT.wood, rx, y0 + .45, zn + 3.2); boxes.push({x0:rx - 1.05, x1:rx + 1.05, z0:zn + 2.75, z1:zn + 3.65, y0:y0 - .3, y1:y0 + 1}); sign(tex, 6, 2.6, rx, y0 + 2.4, zn + .4, 0, .4, inner); return {x:rx, z:rz + 4.6}; };
    const cA = classroom(-1, o.boardA), cB = classroom(1, o.boardB);
    // phòng chuyên đề (Tây-Nam) + quán (Đông-Nam): bàn tròn + quầy
    const sp = {x:cx - (10 + (w / 2 - 10) / 2), z:cz + d / 4}, cf = {x:cx + (10 + (w / 2 - 10) / 2), z:cz + d / 4};
    for(const [tx, tz] of [[-3.5, -2], [3.5, -2], [-3.5, 3], [3.5, 3]]){ for(const R0 of [sp, cf]){ ki.add(new THREE.CylinderGeometry(.75, .75, .07, 16), o.tableM || MAT.wood, R0.x + tx, y0 + .74, R0.z + tz); ki.add(new THREE.CylinderGeometry(.08, .12, .72, 8), MAT.dark, R0.x + tx, y0 + .37, R0.z + tz); circles.push({x:R0.x + tx, z:R0.z + tz, r:.8, y0:y0 - .3, y1:y0 + 1}); } }
    ki.add(new THREE.BoxGeometry(6, 1.1, .9), MAT.wood, cf.x, y0 + .55, cz + 1.6); boxes.push({x0:cf.x - 3, x1:cf.x + 3, z0:cz + 1.1, z1:cz + 2.1});
    if(o.special) o.special(ki, sp, y0, inner); if(o.cafe) o.cafe(ki, cf, y0, inner);
    ki.build(inner);
    // biển tên cửa chính
    sign(o.signTex, 9, 1.6, cx, y0 + WH - .9, zs + .36, 0, .5);
    // tương tác
    const when = () => Math.abs(W.P.y - y0) < 2.5;
    INTER.push({x:cx + 6.5, z:zs - 1.5, r:2.2, prio:.92, when, label:`🗣️ Quầy học vụ ${A.name} – lộ trình học (E)`, action:() => openApp({v:'track', t:key})});
    INTER.push({x:cx, z:zn + 3, r:2.6, prio:.9, when, label:o.boardLabel, action:o.boardAct});
    INTER.push({x:cA.x, z:cA.z, r:2.4, prio:.9, when, label:`📖 Lớp học ${A.name} – vào bài học (E)`, action:() => openApp({v:'track', t:key})});
    INTER.push({x:cB.x, z:cB.z, r:2.4, prio:.9, when, label:`🧪 Phòng kiểm tra ${A.name} – từ vựng · ngữ pháp · nghe (E)`, action:() => openApp({v:'tests', t:key})});
    INTER.push({x:sp.x, z:sp.z, r:3, prio:.9, when, label:o.specialLabel, action:o.specialAct});
    INTER.push({x:cf.x, z:cz + 3.2, r:2.4, prio:.9, when, label:o.cafeLabel, action:o.cafeAct});
    // camera trong nhà + ẩn mái khi vào + ẩn nội thất khi ở xa
    let inside = false, camSet = false;
    HOOK.onFrame.push(() => { const p = W.P, d2 = (p.x - cx) ** 2 + (p.z - cz) ** 2; inner.visible = d2 < 95 * 95;
      const isIn = !W.inside && p.x > xw && p.x < xe && p.z > zn && p.z < zs && p.y < y0 + WH;
      if(isIn !== inside){ inside = isIn; upper.visible = !isIn; }
      if(isIn){ HOOK.camBox = {x0:xw + .7, x1:xe - .7, z0:zn + .7, z1:zs - .7, y1:y0 + WH - .5}; camSet = true; } else if(camSet){ camSet = false; HOOK.camBox = null; } });
    const R1 = {key, cx, cz, w, d, y0, WH, zs, zn, xw, xe, upper, inner}; ACADS.push(R1); return R1; }
  // archKit dùng chung 1 vật liệu tường/viền mái cho mọi lần gọi → đổi vật liệu riêng cho từng mái (không sửa archKit của phiên khác)
  const recolorRoof = (grp, wallM, trimM) => grp.traverse(m => { if(!m.isMesh || !m.material || m.material.map || !m.material.color || m.material.color.getHex() !== 0xb3322a) return;
    if(!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const hgt = m.geometry.boundingBox.max.y - m.geometry.boundingBox.min.y;
    if(m.geometry.type === 'TubeGeometry' || hgt < .6){ if(trimM) m.material = trimM; } else if(wallM) m.material = wallM; });
  const board = (bg, fg, lines) => signTex(1024, 512, bg, lines.map(([t, s, c, y]) => [t, `${s} ${FONT}`, c || fg, y]));
  const NOTE = (lang) => toast(`🚧 Khoá ${lang} đang được biên soạn – học viện đã sẵn sàng đón học viên. Hiện học được: Tiếng Anh & Tiếng Trung.`, 5000);

  /* ---------- 5a. 🇬🇧 OXFORD CASTLE + BIG BEN + KEW GLASSHOUSE ---------- */
  { const A = ACAD.en, en = academy('en', {wallM:MAT.stone, wallH:9, floorM:MAT.woodL, tableM:MAT.wood,
      board:board('#1b2d4f', '#fff', [['ENGLISH ROADMAP', '800 64px', '#ffd23f', .15], ['Pre-A1 → A1 → A2 → B1 → B2', '600 50px', null, .4], ['IELTS 6.5–7.5 → IELTS 8.0+', '600 50px', null, .58], ['82 bài · thi cuối cấp · 2 đề IELTS', '40px', '#9fd2ff', .8]]),
      boardA:board('#f7f7f2', '#1f4fa8', [["Lesson 1: Hello!", '700 70px', null, .25], ["I'm Lan. I'm from Hanoi.", '54px', '#222', .55], ['/aɪm/ /ʃiːz/ /ɪts/', '48px', '#b3261e', .82]]),
      boardB:board('#16324f', '#fff', [['🧪 TEST ROOM', '800 70px', '#ffd23f', .3], ['Vocabulary · Grammar · Listening', '48px', null, .62]]),
      signTex:signTex(1024, 180, '#1b2d4f', [['OXFORD ENGLISH ACADEMY', `800 70px Georgia,serif`, '#ffd23f', .42], ['Học viện Tiếng Anh · 0 → IELTS 8.0+', `600 40px ${FONT}`, '#fff', .82]]),
      boardLabel:'📝 Bảng lộ trình – thi thử IELTS (E)', boardAct:() => openApp({v:'mocks', t:'en'}),
      specialLabel:'🎭 Speaking Club – hội thoại nhập vai (E)', specialAct:() => openApp({v:'talks', t:'en'}),
      cafeLabel:'☕ British Tea Room – gọi trà (10 💰, ☕ thưởng quiz)', cafeAct:() => buff('coffee', 10, 10, '☕ Trà Anh & bánh scone'),
      special:(ki, p, y) => { for(let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2; ki.add(new THREE.BoxGeometry(1.8, .45, .8), MAT.red, p.x + Math.cos(a) * 3.2, y + .23, p.z + Math.sin(a) * 3.2, 0, -a + Math.PI / 2, 0); } },
      cafe:(ki, p, y) => { for(let i = 0; i < 5; i++) ki.add(new THREE.CylinderGeometry(.12, .1, .14, 10), MAT.white, p.x - 2 + i, y + 1.18, p.z - 6.4); } });
    // tháp góc + răng cưa đỉnh tường
    const merl = new THREE.BoxGeometry(.9, .9, .7);
    for(let x = en.xw; x <= en.xe; x += 1.8){ KX.add(merl, MAT.stone, x, en.y0 + 9.45, en.zn); KX.add(merl, MAT.stone, x, en.y0 + 9.45, en.zs); }
    for(let z = en.zn; z <= en.zs; z += 1.8){ KX.add(merl, MAT.stone, en.xw, en.y0 + 9.45, z); KX.add(merl, MAT.stone, en.xe, en.y0 + 9.45, z); }
    for(const [x, z] of [[en.xw, en.zn], [en.xe, en.zn], [en.xw, en.zs], [en.xe, en.zs]]){ KX.add(new THREE.CylinderGeometry(4, 4.4, 14, 8), MAT.stone, x, en.y0 + 7, z); for(let a = 0; a < 8; a++) KX.add(merl, MAT.stone, x + Math.cos(a / 8 * 6.283) * 3.8, en.y0 + 14.45, z + Math.sin(a / 8 * 6.283) * 3.8); circles.push({x, z, r:4.4}); }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(en.w - 1, .5, en.d - 1), MAT.slate); roof.position.set(en.cx, en.y0 + 9, en.cz); roof.castShadow = false; en.upper.add(roof);
    // cửa vòm gothic + cửa sổ
    for(const x of [-18, -12, 12, 18]){ KX.add(new THREE.BoxGeometry(1.6, 3.4, .12), MAT.dark, en.cx + x, en.y0 + 4.2, en.zs + .33); KX.add(new THREE.ConeGeometry(.82, 1, 4), MAT.stoneD, en.cx + x, en.y0 + 6.4, en.zs + .33, 0, Math.PI / 4, 0); }
    // Big Ben 38 m (góc Đông-Nam, cạnh ga)
    const BB = {x:en.xe + 9, z:en.zs - 6}, by = en.y0;
    KX.add(new THREE.BoxGeometry(7, 26, 7), MAT.stone, BB.x, by + 13, BB.z); KX.add(new THREE.BoxGeometry(8, 5, 8), MAT.stoneD, BB.x, by + 28.5, BB.z); KX.add(new THREE.BoxGeometry(7.2, 3, 7.2), MAT.stone, BB.x, by + 32.5, BB.z);
    KX.add(new THREE.ConeGeometry(5.4, 7, 4), MAT.slate, BB.x, by + 37.5, BB.z, 0, Math.PI / 4, 0); KX.add(new THREE.ConeGeometry(.3, 2.4, 8), MAT.gold, BB.x, by + 42, BB.z); boxes.push({x0:BB.x - 4, x1:BB.x + 4, z0:BB.z - 4, z1:BB.z + 4});
    const clockT = canvasTex(256, 256, g => { g.fillStyle = '#f2ead2'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#2a2a2a'; g.lineWidth = 9; g.stroke(); g.fillStyle = '#1d1d1d'; g.font = 'bold 26px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; ['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'].forEach((t, i) => { const a = i / 12 * 6.283 - 1.5708; g.fillText(t, 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); }); });
    const clockM = new THREE.MeshStandardMaterial({map:clockT, emissive:0xfff2c8, emissiveMap:clockT, emissiveIntensity:.15}); const hands = [];
    for(const [dx, dz, ry] of [[0, 4.05, 0], [0, -4.05, Math.PI], [4.05, 0, Math.PI / 2], [-4.05, 0, -Math.PI / 2]]){ const f = new THREE.Mesh(new THREE.CircleGeometry(2.1, 32), clockM); f.position.set(BB.x + dx, by + 28.5, BB.z + dz); f.rotation.y = ry; scene.add(f);
      const hg = new THREE.Group(); hg.position.copy(f.position); hg.rotation.y = ry; hg.translateZ(.06); hg.userData.dynamic = true; scene.add(hg); const hh = new THREE.Mesh(new THREE.BoxGeometry(.12, 1.1, .05), MAT.dark), mh = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.6, .05), MAT.dark); hh.geometry.translate(0, .5, 0); mh.geometry.translate(0, .75, 0); hg.add(hh, mh); hands.push([hh, mh]); }
    let ht = 9; HOOK.onFrame.push((dt, T) => { const n = W.night || 0; clockM.emissiveIntensity = .15 + n * .9; ht += dt; if(ht < 1) return; ht = 0; const t = new Date(), m = t.getMinutes() + t.getSeconds() / 60, h = t.getHours() % 12 + m / 60; for(const [hh, mh] of hands){ mh.rotation.z = -m / 60 * 6.283; hh.rotation.z = -h / 12 * 6.283; } });
    // nhà kính Kew (vòm kính) + vườn hồng
    const KG = {x:-420, z:-140, L:30, r:7};
    { const vg = new THREE.CylinderGeometry(KG.r, KG.r, KG.L, 24, 1, true, 0, Math.PI); vg.rotateZ(Math.PI / 2); const vm = new THREE.Mesh(vg, MAT.glass); vm.position.set(KG.x, A.h + .2, KG.z); vm.rotation.y = 0; vm.renderOrder = 2; scene.add(vm);
      for(let i = 0; i <= 10; i++){ const t = new THREE.TorusGeometry(KG.r, .07, 6, 24, Math.PI); t.rotateY(Math.PI / 2); KX.add(t, MAT.white, KG.x - KG.L / 2 + i * KG.L / 10, A.h + .2, KG.z); }
      KX.add(new THREE.BoxGeometry(KG.L + 1, .5, 2 * KG.r + 1), MAT.stone, KG.x, A.h, KG.z); boxes.push({x0:KG.x - KG.L / 2 - .5, x1:KG.x + KG.L / 2 + .5, z0:KG.z - KG.r - .5, z1:KG.z + KG.r + .5});
      const rose = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.28, 0), sm(0xffffff, .7), 160), c = new THREE.Color(); let n = 0;
      for(let i = 0; i < 160; i++){ const x = KG.x - 14 + (i % 20) * 1.45, z = KG.z + (i < 80 ? -9.5 - (i / 20 | 0) * .7 : 9.5 + ((i - 80) / 20 | 0) * .7); _m4.compose(_p.set(x, gy(x, z) + .26, z), _q.identity(), _s1); rose.setMatrixAt(n, _m4); rose.setColorAt(n++, c.setHSL([.98, .0, .92, .1][i % 4], .75, .55)); }
      rose.userData.dynamic = true; scene.add(rose);
      INTER.push({x:KG.x, z:KG.z + KG.r + 2, r:2.5, prio:.7, label:'🌹 Nhà kính Hoàng gia Kew & vườn hồng (E)', action:() => toast('🌹 Nhà kính Hoàng gia: hồng Anh, dương xỉ, cây nhiệt đới – nơi học viên ôn từ vựng chủ đề Thiên nhiên. Mẹo: học từ theo chủ đề + hình ảnh nhớ lâu gấp đôi!', 5000)}); } }

  /* ---------- 5b. 🀄 HÁN HỌC ĐIỆN & CÔ TÔ THUỶ CÁC (trên hồ sen) ---------- */
  { const A = ACAD.zh, L = LAKES[0], y0 = L.wl + 1.3;
    KX.add(new THREE.BoxGeometry(A.w + 6, y0 - L.bed - .02, A.d + 6), MAT.stone, A.x, (y0 - .02 + L.bed) / 2, A.z); addPlat(A.x, A.z, 0, A.w / 2 + 3.1, A.d / 2 + 3.1, y0);
    const lat = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#f1e8d2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a1f17'; g.lineWidth = 6; for(let i = 0; i < 4; i++){ const x = 30 + i * 122; g.strokeRect(x, 40, 90, 170); for(let j = 1; j < 6; j++){ g.beginPath(); g.moveTo(x, 40 + j * 28); g.lineTo(x + 90, 40 + j * 28); g.stroke(); } g.beginPath(); g.moveTo(x + 45, 40); g.lineTo(x + 45, 210); g.stroke(); } });
    lat.wrapS = lat.wrapT = THREE.RepeatWrapping; const latM = new THREE.MeshStandardMaterial({map:lat, roughness:.8}); latM.userData.tileM = 8;
    const zh = academy('zh', {wallM:latM, partM:MAT.plaster, wallH:7, floorY:y0, floorM:MAT.woodL, tableM:MAT.redL, chairM:MAT.red,
      board:board('#7a1410', '#ffe6a8', [['汉语学习路线', '800 72px', '#ffd36b', .15], ['拼音 → HSK1 → HSK2 → HSK3', '600 52px', null, .4], ['HSK4 → HSK5 → HSK6 → HSK 7–9', '600 52px', null, .58], ['84 bài · 7 đề HSK tự soạn', '40px', '#fff', .8]]),
      boardA:board('#f7f7f2', '#b3261e', [['第一课 你好！', '700 80px', null, .3], ['Nǐ hǎo! Wǒ jiào Xiǎo Lán.', '50px', '#222', .62], ['nǐ hǎo → ní hǎo', '46px', '#1f4fa8', .85]]),
      boardB:board('#7a1410', '#fff', [['🧪 考场 · Phòng kiểm tra', '800 64px', '#ffd36b', .3], ['Từ vựng · Ngữ pháp · Nghe · Thanh điệu', '44px', null, .62]]),
      signTex:signTex(1024, 200, '#7a1410', [['汉 学 殿', '900 96px "KaiTi","Microsoft YaHei",serif', '#ffd36b', .42], ['Hán Học Điện · Tiếng Trung 0 → HSK 7–9', `600 40px ${FONT}`, '#fff3d0', .84]]),
      boardLabel:'📝 Bảng lộ trình – thi thử HSK (E)', boardAct:() => openApp({v:'mocks', t:'zh'}),
      specialLabel:'🖌️ Bàn thư pháp – tập viết chữ Hán (E)', specialAct:() => openApp({v:'level', t:'zh', c:'l0'}),
      cafeLabel:'🍵 Trà quán Giang Nam – gọi trà (10 💰, ☕ thưởng quiz)', cafeAct:() => buff('coffee', 10, 10, '🍵 Trà Long Tỉnh & bánh hoa quế'),
      special:(ki, p, y) => { for(let i = 0; i < 4; i++){ ki.add(new THREE.BoxGeometry(2.4, .08, 1), MAT.redL, p.x - 3 + (i % 2) * 6, y + .72, p.z - 3 + (i / 2 | 0) * 4.5); ki.add(new THREE.BoxGeometry(1.8, .01, .7), MAT.white, p.x - 3 + (i % 2) * 6, y + .77, p.z - 3 + (i / 2 | 0) * 4.5); } } });
    for(let i = 0; i <= 12; i++) for(const s of [-1, 1]){ KX.add(new THREE.CylinderGeometry(.42, .46, 7.4, 14), MAT.red, A.x - A.w / 2 - 1.4 + i * (A.w + 2.8) / 12, y0 + 3.7, A.z + s * (A.d / 2 + 1.4)); }
    const roof = AK.buildAsianCurvedRoof(A.w + 3, A.d + 3, 7, 2.6, 0xd8a531, 2, {trim:0xb3261e, wall:0xb3261e}); roof.position.set(A.x, y0 + 7.2, A.z); roof.traverse(m => { if(m.isMesh) m.castShadow = false; }); zh.upper.add(roof);
    // Cầu Cửu Khúc 9 nhịp (bờ Nam → cửa chính), có lan can
    // 9 nhịp gấp khúc nhẹ (lệch 1 m) – lối đi luôn liền; lan can chặn chạy dọc mép ngoài cả cầu
    const zStart = L.z + L.rz * 1.26, zEnd = zh.zs + 3, stepZ = (zStart - zEnd) / 9; let px = A.x, pz = zStart; const yb = y0;
    for(let i = 0; i < 9; i++){ const nx = i === 8 ? A.x : A.x + (i % 2 ? 0 : -1), nz = pz - stepZ;
      const mx = (px + nx) / 2, mz = (pz + nz) / 2, ry = Math.atan2(nx - px, nz - pz), seg = Math.hypot(nx - px, nz - pz);
      KX.add(new THREE.BoxGeometry(2.8, .35, seg + 1.2), MAT.stone, mx, yb - .18, mz, 0, ry, 0); addPlat(mx, mz, ry, 1.42, (seg + 1.2) / 2, yb);
      const fx = Math.sin(ry), fz = Math.cos(ry);
      for(const s of [-1, 1]){ const ox = Math.cos(ry) * s * 1.35, oz = -Math.sin(ry) * s * 1.35; KX.add(new THREE.BoxGeometry(.1, .9, seg + .2), MAT.redL, mx + ox, yb + .45, mz + oz, 0, ry, 0);
        addSeg(mx + ox - fx * (seg + .2) / 2, mz + oz - fz * (seg + .2) / 2, mx + ox + fx * (seg + .2) / 2, mz + oz + fz * (seg + .2) / 2, .1, yb - 4, yb + 1.5, '🌸 Lan can Cầu Cửu Khúc'); }
      px = nx; pz = nz; }
    // sen + rừng trúc
    const pad = new THREE.InstancedMesh(new THREE.CircleGeometry(.75, 10).rotateX(-Math.PI / 2), sm(0x3f8a3a, .7, 0, {side:THREE.DoubleSide}), 140), lotus = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.25, 0), sm(0xf7a6c4, .6), 60); let pi = 0, li = 0;
    for(let i = 0; i < 260 && pi < 140; i++){ const a = R() * 6.283, e = .6 + R() * .38, x = L.x + Math.cos(a) * L.rx * e, z = L.z + Math.sin(a) * L.rz * e; if(Math.abs(x - A.x) < A.w / 2 + 5 && Math.abs(z - A.z) < A.d / 2 + 5) continue; if(Math.abs(x - A.x) < 6 && z > A.z) continue;
      _m4.compose(_p.set(x, L.wl + .03, z), _q.setFromEuler(_e.set(0, R() * 6, 0)), _s1.set(.7 + R() * .8, 1, .7 + R() * .8)); pad.setMatrixAt(pi++, _m4); if(li < 60 && R() < .45){ _m4.compose(_p.set(x, L.wl + .3, z), _q.identity(), _s1.set(1, 1, 1)); lotus.setMatrixAt(li++, _m4); } }
    _s1.set(1, 1, 1); pad.count = pi; lotus.count = li; for(const im of [pad, lotus]){ im.userData.dynamic = true; scene.add(im); }
    const bam = new THREE.InstancedMesh(new THREE.CylinderGeometry(.11, .13, 1, 6).translate(0, .5, 0), sm(0x6f9a3a, .6), 300), leaf = new THREE.InstancedMesh(new THREE.ConeGeometry(.9, 2.6, 6).translate(0, -1.1, 0), sm(0x4f8f36, .8), 300); let bi = 0;
    for(let i = 0; i < 900 && bi < 300; i++){ const a = R() * 6.283, e = 1.08 + R() * .35, x = L.x + Math.cos(a) * L.rx * e, z = L.z + Math.sin(a) * L.rz * e; if(Math.abs(x - A.x) < 9 && z > L.z) continue; const y = gy(x, z); if(y < 3) continue; const hh = 5 + R() * 4, tilt = _e.set((R() - .5) * .12, 0, (R() - .5) * .12);
      _m4.compose(_p.set(x, y, z), _q.setFromEuler(tilt), _s1.set(1, hh, 1)); bam.setMatrixAt(bi, _m4); _m4.compose(_p.set(x, y + hh + .4, z), _q.setFromEuler(tilt), _s1.set(1, 1, 1)); leaf.setMatrixAt(bi++, _m4); }
    _s1.set(1, 1, 1); bam.count = leaf.count = bi; for(const im of [bam, leaf]){ im.userData.dynamic = true; scene.add(im); } }

  /* ---------- 5c. 🇯🇵 LÂU ĐÀI KYOTO + TORII + VƯỜN ZEN + 40 HOA ANH ĐÀO ---------- */
  const PET = {x:ACAD.ja.x, z:ACAD.ja.z};
  { const A = ACAD.ja, base = 2.4, y0 = A.h + base;
    { const g = new THREE.BoxGeometry(A.w + 6, base, A.d + 6, 1, 1, 1); const P = g.attributes.position; for(let i = 0; i < P.count; i++) if(P.getY(i) > 0){ P.setX(i, P.getX(i) * .96); P.setZ(i, P.getZ(i) * .95); } g.computeVertexNormals(); KX.add(g, MAT.stoneD, A.x, A.h + base / 2, A.z);
      const bz = A.z + A.d / 2, by0 = A.h - 5, by1 = y0 - .3;   // bệ đá: chặn người đi dưới đất, người đứng trên bệ đi tự do; chừa lối bậc thang giữa
      boxes.push({x0:A.x - A.w / 2 - 3, x1:A.x + A.w / 2 + 3, z0:A.z - A.d / 2 - 3, z1:bz, y0:by0, y1:by1}, {x0:A.x - A.w / 2 - 3, x1:A.x - 3, z0:bz, z1:bz + 3, y0:by0, y1:by1}, {x0:A.x + 3, x1:A.x + A.w / 2 + 3, z0:bz, z1:bz + 3, y0:by0, y1:by1}); }
    for(let i = 0; i < 4; i++){ const zz = A.z + A.d / 2 + 3 - i * .9 + 2.6, yy = A.h + (i + 1) * base / 4; KX.add(new THREE.BoxGeometry(6, yy - A.h, .9), MAT.stoneD, A.x, A.h + (yy - A.h) / 2, zz); addPlat(A.x, zz, 0, 3, .45, yy); }
    addPlat(A.x, A.z + A.d / 2 + 1.5, 0, 3, 1.6, y0); KX.add(new THREE.BoxGeometry(6, .3, 3.2), MAT.stoneD, A.x, y0 - .15, A.z + A.d / 2 + 1.5);
    const plast = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, w, h); g.fillStyle = '#2d241e'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); for(let x = 0; x < w; x += 64) g.fillRect(x, 0, 10, h); });
    plast.wrapS = plast.wrapT = THREE.RepeatWrapping; const plM = new THREE.MeshStandardMaterial({map:plast, roughness:.85}); plM.userData.tileM = 4;
    const ja = academy('ja', {wallM:plM, partM:MAT.shoji, wallH:6.5, floorY:y0, floorM:MAT.tatami, tableM:MAT.cedar, deskM:MAT.cedar, chairM:MAT.tatami,
      board:board('#2b1d16', '#f7ead2', [['日本語ロードマップ', '800 70px', '#ffb7c5', .15], ['ひらがな・カタカナ → JLPT N5 → N4', '600 48px', null, .4], ['N3 → N2 → N1 · 日本語 IT', '600 48px', null, .58], ['Khoá tiếng Nhật đang biên soạn', '40px', '#ffd36b', .8]]),
      boardA:board('#f7f4ea', '#b3261e', [['第1課 ひらがな', '700 76px', null, .3], ['あ い う え お · か き く け こ', '52px', '#222', .62], ['a i u e o · ka ki ku ke ko', '44px', '#1f4fa8', .85]]),
      boardB:board('#2b1d16', '#fff', [['🎧 JLPT 聴解ラボ', '800 64px', '#ffb7c5', .3], ['Lab luyện nghe JLPT N5 → N1', '44px', null, .62]]),
      signTex:signTex(1024, 200, '#2b1d16', [['京都 桜 学院', '900 90px "Yu Mincho","MS Mincho","Yu Gothic",serif', '#ffb7c5', .42], ['Học viện Tiếng Nhật · Hiragana → JLPT N1 + IT', `600 38px ${FONT}`, '#f7ead2', .84]]),
      boardLabel:'🗾 Bảng lộ trình tiếng Nhật (E)', boardAct:() => { openApp({v:'track', t:'ja'}); },
      specialLabel:'🍵 Phòng Tatami & Trà đạo Matcha (10 💰, ☕ thưởng quiz)', specialAct:() => buff('coffee', 10, 10, '🍵 Matcha & bánh wagashi'),
      cafeLabel:'🍜 Quầy Ramen & Sushi (15 💰, ⚡ đi nhanh)', cafeAct:() => buff('energy', 12, 15, '🍜 Ramen tonkotsu'),
      special:(ki, p, y) => { ki.add(new THREE.BoxGeometry(2.2, .3, 1.2), MAT.cedar, p.x, y + .15, p.z); for(const s of [-1, 1]) ki.add(new THREE.BoxGeometry(.7, .06, .7), MAT.red, p.x + s * 1.5, y + .03, p.z); },
      cafe:(ki, p, y) => { for(let i = 0; i < 6; i++) ki.add(new THREE.CylinderGeometry(.25, .25, .7, 10), MAT.red, p.x - 2.5 + i, y + .35, p.z - 5.7); } });
    const roof = AK.buildAsianCurvedRoof(A.w + 2, A.d + 2, 6, 2.6, 0x3b3a40, 3, {trim:0x2b2b2b, wall:0xf4f1e8}); roof.position.set(A.x, y0 + 6.7, A.z); roof.traverse(m => { if(m.isMesh) m.castShadow = false; }); recolorRoof(roof, MAT.plaster, MAT.dark); ja.upper.add(roof);
    // cổng Torii đỏ khổng lồ dưới hồ + cầu gỗ đỏ cong
    const L = LAKES[1], TX = L.x, TZ = L.z;
    for(const s of [-1, 1]){ KX.add(new THREE.CylinderGeometry(.55, .65, 13, 16), MAT.red, TX + s * 5, L.wl + 6.2, TZ); circles.push({x:TX + s * 5, z:TZ, r:.7}); }
    { const kg = new THREE.BoxGeometry(15, .8, 1.3, 16, 1, 1), P = kg.attributes.position; for(let i = 0; i < P.count; i++){ const x = P.getX(i); P.setY(i, P.getY(i) + (x / 7.5) ** 2 * .6); } kg.computeVertexNormals(); KX.add(kg, MAT.dark, TX, L.wl + 13, TZ); KX.add(new THREE.BoxGeometry(13.6, .7, 1.1), MAT.red, TX, L.wl + 12.2, TZ); KX.add(new THREE.BoxGeometry(12, .55, .7), MAT.red, TX, L.wl + 10.4, TZ); }
    const BZ = A.z + A.d / 2 + 13, bw = 3, bl = 10;
    for(let i = 0; i < 10; i++){ const t = (i + .5) / 10, z = BZ - bl / 2 + t * bl, y = A.h + .15 + Math.sin(Math.PI * t) * 1.2; KX.add(new THREE.BoxGeometry(bw, .2, bl / 10 + .05), MAT.wood, A.x, y, z); addPlat(A.x, z, 0, bw / 2, bl / 20 + .03, y + .1); }
    for(const s of [-1, 1]){ for(let i = 0; i <= 5; i++){ const t = i / 5, z = BZ - bl / 2 + t * bl, y = A.h + .15 + Math.sin(Math.PI * t) * 1.2; KX.add(new THREE.CylinderGeometry(.06, .06, 1, 6), MAT.red, A.x + s * 1.45, y + .55, z); } addSeg(A.x + s * 1.5, BZ - bl / 2, A.x + s * 1.5, BZ + bl / 2, .1, A.h - 1, A.h + 3, '🌉 Lan can cầu gỗ'); }
    { const cg = new THREE.BoxGeometry(14, .2, 6); const ch = new THREE.Mesh(cg, waterM); ch.position.set(A.x, A.h - .35, BZ); ch.userData.dynamic = true; scene.add(ch); }
    // vườn đá Zen (sỏi cào + đá)
    const rake = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e4ded0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,110,95,.35)'; g.lineWidth = 2; for(let y = 4; y < h; y += 10){ g.beginPath(); g.moveTo(0, y); for(let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x / 40) * 2); g.stroke(); } }); rake.wrapS = rake.wrapT = THREE.RepeatWrapping; rake.repeat.set(5, 3);
    const ZG = {x:A.x - 38, z:A.z + 34}; const zg = new THREE.Mesh(new THREE.PlaneGeometry(22, 14).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({map:rake, roughness:.95})); zg.position.set(ZG.x, A.h + .05, ZG.z); zg.receiveShadow = true; scene.add(zg);
    for(const [dx, dz, s] of [[-6, -3, 1.4], [-4, 2, .9], [3, -1, 1.7], [6, 3, 1], [7.5, -4, .7]]){ KX.add(new THREE.DodecahedronGeometry(s, 0), MAT.stoneD, ZG.x + dx, A.h + s * .45, ZG.z + dz); circles.push({x:ZG.x + dx, z:ZG.z + dz, r:s * .9}); }
    INTER.push({x:ZG.x, z:ZG.z + 8, r:3, prio:.7, label:'🪨 Vườn đá Zen – ngồi thiền 1 phút (E)', action:() => toast('🪨 禅 – Hít sâu… thở ra. Người học ngoại ngữ giỏi nhất là người đều đặn mỗi ngày, không phải người học dồn. 頑張って！', 5000)}); }

  /* ---------- 5d. 🇰🇷 HANOK DANCHEONG + K-CUBE + LẦU KHÁNH HỘI ---------- */
  let ledT = null, ledC = null; const DANCH = sm(0x2f8f6f, .45);
  { const A = ACAD.ko, y0 = A.h + .6;
    KX.add(new THREE.BoxGeometry(A.w + 4, .6, A.d + 4), MAT.stone, A.x, A.h + .3, A.z); addPlat(A.x, A.z, 0, A.w / 2 + 2.12, A.d / 2 + 2.12, y0);
    const hw = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#efe8d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#5b3a24'; for(let x = 0; x < w; x += 64) g.fillRect(x, 0, 10, h); g.fillRect(0, 0, w, 12); g.fillStyle = '#2f8f6f'; g.fillRect(0, 12, w, 10); g.fillStyle = '#c0392b'; g.fillRect(0, 22, w, 6); });
    hw.wrapS = hw.wrapT = THREE.RepeatWrapping; const hwM = new THREE.MeshStandardMaterial({map:hw, roughness:.8}); hwM.userData.tileM = 4;
    const ko = academy('ko', {wallM:hwM, partM:MAT.plaster, wallH:7, floorY:y0, floorM:MAT.woodL, tableM:MAT.wood,
      board:board('#0f3b34', '#f2fff9', [['한국어 로드맵', '800 70px', '#ffd36b', .15], ['한글 → TOPIK I (1–2급)', '600 50px', null, .4], ['TOPIK II (3–6급) · 회사 한국어', '600 48px', null, .58], ['Khoá tiếng Hàn đang biên soạn', '40px', '#ffd36b', .8]]),
      boardA:board('#f7f7f2', '#0f5b4f', [['제1과 한글', '700 80px', null, .3], ['가 나 다 라 마 바 사', '56px', '#222', .62], ['ga na da ra ma ba sa', '44px', '#b3261e', .85]]),
      boardB:board('#0f3b34', '#fff', [['🧪 TOPIK 시험실', '800 64px', '#ffd36b', .3], ['Phòng kiểm tra TOPIK I & II', '44px', null, .62]]),
      signTex:signTex(1024, 200, '#0f3b34', [['한국어 학당 · K-CUBE', `900 80px "Malgun Gothic",${FONT}`, '#ffd36b', .42], ['Học viện Tiếng Hàn · Hangul → TOPIK I & II', `600 38px ${FONT}`, '#f2fff9', .84]]),
      boardLabel:'🇰🇷 Bảng lộ trình tiếng Hàn (E)', boardAct:() => openApp({v:'track', t:'ko'}),
      specialLabel:'🎙️ Studio hội thoại công sở Hàn Quốc (E)', specialAct:() => openApp({v:'track', t:'ko'}),
      cafeLabel:'🍢 Lều Pocha – tokbokki & kimbap (15 💰, ⚡ đi nhanh)', cafeAct:() => buff('energy', 12, 15, '🍢 Tokbokki & kimbap'),
      cafe:(ki, p, y, inner) => { for(const s of [-1, 1]){ const c = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 4, 1, true), sm(0xe8742c, .7, 0, {side:THREE.DoubleSide})); c.position.set(p.x + s * 3.5, y + 3.2, p.z + .5); c.rotation.y = Math.PI / 4; inner.add(c); } } });
    // nửa Tây: mái ngói Dancheong · nửa Đông: khối kính K-Cube cao 16 m + màn LED
    const roof = AK.buildAsianCurvedRoof(A.w / 2 + 3, A.d + 3, 6, 2.4, 0x4a4f57, 1, {trim:0x2f8f6f, wall:0xc0392b}); roof.position.set(A.x - A.w / 4 - .5, y0 + 7.2, A.z); roof.traverse(m => { if(m.isMesh) m.castShadow = false; }); recolorRoof(roof, null, DANCH); ko.upper.add(roof);
    const cube = new THREE.Mesh(new THREE.BoxGeometry(A.w / 2 + .6, 9, A.d + .6), MAT.glass); cube.position.set(A.x + A.w / 4, y0 + 7 + 4.5, A.z); cube.renderOrder = 2; ko.upper.add(cube);
    const cubeTop = new THREE.Mesh(new THREE.BoxGeometry(A.w / 2 + 1, .4, A.d + 1), MAT.white); cubeTop.position.set(A.x + A.w / 4, y0 + 16.2, A.z); ko.upper.add(cubeTop);
    ledC = document.createElement('canvas'); ledC.width = 512; ledC.height = 256; ledT = new THREE.CanvasTexture(ledC); ledT.colorSpace = THREE.SRGBColorSpace; ledT.userData.live = true;
    const led = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), new THREE.MeshBasicMaterial({map:ledT})); led.position.set(A.x + A.w / 4, y0 + 11.5, A.z + A.d / 2 + .45); scene.add(led);
    const LEDMSG = [['K-WAVE · 한국어', '안녕하세요!'], ['TOPIK I & II', 'Học tiếng Hàn từ Hangul'], ['감사합니다', 'Cảm ơn · Kamsahamnida'], ['QC WORLD', '언어 섬 · Đảo Ngoại ngữ']];
    let li = 0, lt = 0;
    const paintLED = () => { const g = ledC.getContext('2d'), m = LEDMSG[li++ % LEDMSG.length], gr = g.createLinearGradient(0, 0, 512, 256);
      gr.addColorStop(0, ['#ff2e88', '#3b82f6', '#10b981', '#f59e0b'][li % 4]); gr.addColorStop(1, '#14002e'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `900 64px "Malgun Gothic",${FONT}`; g.fillText(m[0], 256, 110); g.font = `600 34px "Malgun Gothic",${FONT}`; g.fillText(m[1], 256, 190); ledT.needsUpdate = true; };
    paintLED(); HOOK.onFrame.push(dt => { lt += dt; if(lt < 3) return; lt = 0; const p = W.P; if((p.x - A.x) ** 2 + (p.z - A.z) ** 2 > 260 ** 2) return; paintLED(); });
    // lầu Khánh Hội trên hồ đá (cột đá, sàn gỗ cao, mái Dancheong)
    const L = LAKES[2], PV = {x:L.x, z:L.z, w:16, d:11, h:3.2};
    for(let i = 0; i < 5; i++) for(let j = 0; j < 4; j++) KX.add(new THREE.BoxGeometry(.7, PV.h, .7), MAT.stone, PV.x - PV.w / 2 + 1 + i * (PV.w - 2) / 4, L.wl - .5 + PV.h / 2, PV.z - PV.d / 2 + 1 + j * (PV.d - 2) / 3);
    KX.add(new THREE.BoxGeometry(PV.w, .4, PV.d), MAT.wood, PV.x, L.wl + PV.h - .3, PV.z); boxes.push({x0:PV.x - PV.w / 2, x1:PV.x + PV.w / 2, z0:PV.z - PV.d / 2, z1:PV.z + PV.d / 2});
    const pr = AK.buildAsianCurvedRoof(PV.w, PV.d, 3.6, 1.8, 0x4a4f57, 1, {trim:0x2f8f6f, wall:0xc0392b}); pr.position.set(PV.x, L.wl + PV.h + 3.4, PV.z); recolorRoof(pr, null, DANCH); scene.add(pr);
    for(let i = 0; i < 5; i++) for(const s of [-1, 1]) KX.add(new THREE.CylinderGeometry(.22, .22, 3.6, 10), MAT.red, PV.x - PV.w / 2 + 1 + i * (PV.w - 2) / 4, L.wl + PV.h + 1.6, PV.z + s * (PV.d / 2 - 1)); }

  /* ============================== 6. CÂY: thông núi · anh đào · ngân hạnh · lá xanh ============================== */
  const inBuilding = (x, z, pad = 6) => Object.values(ACAD).some(A => Math.abs(x - A.x) < A.w / 2 + pad && Math.abs(z - A.z) < A.d / 2 + pad + 8) || LAKES.some(L => ((x - L.x) / (L.rx + 3)) ** 2 + ((z - L.z) / (L.rz + 3)) ** 2 < 1) || riverD(x, z) < 7;
  const RAIL = {x0:-740, x1:-360, z0:-360, z1:20, r:40};
  const nearRail = (x, z) => { const dx = Math.max(RAIL.x0 - x, 0, x - RAIL.x1), dz = Math.max(RAIL.z0 - z, 0, z - RAIL.z1); const inside = dx === 0 && dz === 0; const de = inside ? Math.min(x - RAIL.x0, RAIL.x1 - x, z - RAIL.z0, RAIL.z1 - z) : Math.hypot(dx, dz); return de < (inside ? 7 : 13.5); };   // ngoài ray 13,5 m: chừa đường dạo vòng đảo
  // dải đường nội đảo (mục 9) – không trồng cây/hoa lên lối đi
  const PATHBOX = [[-360, -255, -22, -10], [-430, -345, -54, -42], [-430, -345, -218, -206], [-426, -414, -238, -206], [-756, -672, -246, -234], [-686, -674, -30, 32],
    [-636, -624, 20, 86], [-486, -474, 20, 92], [-636, -474, 74, 86], [-395, -305, 20, 160], [-485, -305, 80, 160], [-780, -745, -355, -325]];
  const onPath = (x, z) => PATHBOX.some(([a, b, c, d]) => x > a && x < b && z > c && z < d);
  { const pines = [], trees = [];
    for(let i = 0; i < 6000 && pines.length < 520; i++){ const x = lerp(Z.x0 + 10, Z.x1 - 10, R()), z = lerp(Z.z0 + 10, -300, R()), h = hAt(x, z); if(h == null || h < 12 || h > 66 || nearRail(x, z) || riverD(x, z) < 8) continue; pines.push([x, h, z, .8 + R() * .7]); }
    const sak = [], gin = [], grn = [];
    for(let i = 0; i < 2000 && sak.length < 40; i++){ const a = R() * 6.283, r = 33 + R() * 30, x = PET.x + Math.cos(a) * r, z = PET.z + Math.sin(a) * r * .85; if(inBuilding(x, z, 3) || nearRail(x, z) || onPath(x, z) || Math.abs(x - PET.x) < 4 && z > PET.z) continue; sak.push([x, gy(x, z), z, 1 + R() * .4]); }
    for(let i = 0; i < 2000 && gin.length < 32; i++){ const a = R() * 6.283, r = 34 + R() * 26, x = ACAD.ko.x + Math.cos(a) * r, z = ACAD.ko.z + Math.sin(a) * r * .8; if(inBuilding(x, z, 3) || nearRail(x, z) || onPath(x, z) || Math.abs(x - ACAD.ko.x) < 4 && z > ACAD.ko.z) continue; gin.push([x, gy(x, z), z, 1 + R() * .3]); }
    for(let i = 0; i < 4000 && grn.length < 120; i++){ const x = lerp(-820, -280, R()), z = lerp(-300, 220, R()), h = hAt(x, z); if(h == null || h < 1.5 || h > 20 || inBuilding(x, z, 8) || nearRail(x, z) || onPath(x, z) || Math.hypot(x + 555, z - 80) < 62 || Math.hypot(x + 420, z + 140) < 26) continue; grn.push([x, h, z, .9 + R() * .6]); }
    trees.push(...sak.map(t => [...t, 0xf6b6cc]), ...gin.map(t => [...t, 0xe8b923]), ...grn.map(t => [...t, null]));
    const pc = new THREE.ConeGeometry(2.4, 7, 7).translate(0, 5.5, 0), pt = new THREE.CylinderGeometry(.25, .35, 2.2, 6).translate(0, 1.1, 0);
    const pin = new THREE.InstancedMesh(pc, sm(0x2f5a33, .9), pines.length), pinT = new THREE.InstancedMesh(pt, sm(0x5a3e2a, .9), pines.length);
    pines.forEach(([x, y, z, s], i) => { _m4.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, R() * 6, 0)), _s1.set(s, s * (.9 + R() * .4), s)); pin.setMatrixAt(i, _m4); pinT.setMatrixAt(i, _m4); circles.push({x, z, r:.4 * s}); });
    const cg = new THREE.IcosahedronGeometry(2.2, 1).translate(0, 4.4, 0), tg = new THREE.CylinderGeometry(.2, .3, 3.2, 6).translate(0, 1.6, 0), c = new THREE.Color();
    const crowns = new THREE.InstancedMesh(cg, sm(0xffffff, .85), trees.length), trunks = new THREE.InstancedMesh(tg, sm(0x5d4330, .9), trees.length);
    trees.forEach(([x, y, z, s, col], i) => { _m4.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, R() * 6, 0)), _s1.set(s, s, s)); crowns.setMatrixAt(i, _m4); trunks.setMatrixAt(i, _m4); crowns.setColorAt(i, col ? c.set(col).offsetHSL(0, 0, (R() - .5) * .08) : c.setHSL(.26 + R() * .07, .45 + R() * .15, .28 + R() * .08)); circles.push({x, z, r:.35 * s}); });
    _s1.set(1, 1, 1);
    for(const im of [pin, pinT, crowns, trunks]){ im.castShadow = true; im.receiveShadow = true; im.userData.dynamic = true; im.computeBoundingSphere(); scene.add(im); } }
  // cánh hoa anh đào rơi trong gió (Points) – chỉ cập nhật khi ở gần
  { const N = 520, pos = new Float32Array(N * 3), sd = new Float32Array(N); for(let i = 0; i < N; i++){ sd[i] = R(); pos[i * 3] = PET.x + (R() - .5) * 120; pos[i * 3 + 1] = ACAD.ja.h + R() * 9; pos[i * 3 + 2] = PET.z + (R() - .5) * 100; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const sp = canvasTex(32, 32, g2 => { const gr = g2.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(255,214,226,1)'); gr.addColorStop(1, 'rgba(255,170,200,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 32, 32); });
    const pts = new THREE.Points(g, new THREE.PointsMaterial({map:sp, size:.45, transparent:true, depthWrite:false, color:0xffd2df})); pts.frustumCulled = false; pts.userData.dynamic = true; scene.add(pts);
    HOOK.onFrame.push((dt, T) => { const p = W.P; const near = (p.x - PET.x) ** 2 + (p.z - PET.z) ** 2 < 170 * 170; pts.visible = near; if(!near) return;
      for(let i = 0; i < N; i++){ let y = pos[i * 3 + 1] - dt * (.6 + sd[i] * .5); pos[i * 3] += Math.sin(T * 1.3 + sd[i] * 20) * dt * .9 + dt * .5; pos[i * 3 + 2] += Math.cos(T * .9 + sd[i] * 9) * dt * .5;
        if(y < ACAD.ja.h){ y = ACAD.ja.h + 7 + sd[i] * 4; pos[i * 3] = PET.x + (hash(i, T * 10 | 0) - .5) * 120; pos[i * 3 + 2] = PET.z + (hash(T * 7 | 0, i) - .5) * 100; } pos[i * 3 + 1] = y; }
      g.attributes.position.needsUpdate = true; }); }
  // hoa đồng cỏ (1 lượt vẽ) + bò sữa + cối xay gió
  { const N = 2600, fl = new THREE.InstancedMesh((() => { const a = new THREE.PlaneGeometry(.35, .35).translate(0, .18, 0), b = a.clone().rotateY(Math.PI / 2); return mergeGeometries([a, b], false); })(), sm(0xffffff, .8, 0, {side:THREE.DoubleSide, alphaTest:.5, map:canvasTex(64, 64, g2 => { g2.fillStyle = '#fff'; for(let k = 0; k < 5; k++){ const a = k / 5 * 6.283; g2.beginPath(); g2.ellipse(32 + Math.cos(a) * 14, 32 + Math.sin(a) * 14, 11, 7, a, 0, 6.283); g2.fill(); } g2.fillStyle = '#e8b923'; g2.beginPath(); g2.arc(32, 32, 7, 0, 6.283); g2.fill(); })}), N), c = new THREE.Color(); let n = 0;
    for(let i = 0; i < 12000 && n < N; i++){ const x = lerp(-830, -270, R()), z = lerp(-330, 230, R()), h = hAt(x, z); if(h == null || h < 2 || h > 18 || inBuilding(x, z, 2) || nearRail(x, z) || onPath(x, z)) continue;
      _m4.compose(_p.set(x, h, z), _q.setFromEuler(_e.set(0, R() * 3, 0)), _s1.set(.8 + R() * .7, .8 + R() * .9, .8 + R() * .7)); fl.setMatrixAt(n, _m4); fl.setColorAt(n++, c.set([0xf5d63d, 0xb084e8, 0xffffff, 0xf5d63d, 0xe95b8f][i % 5])); }
    _s1.set(1, 1, 1); fl.count = n; fl.userData.dynamic = true; fl.castShadow = false; scene.add(fl); }
  { const body = new THREE.BoxGeometry(1, .9, 2.1), head = new THREE.BoxGeometry(.6, .6, .7).translate(0, .25, 1.3), legs = [];
    for(const [sx, sz] of [[-.35, -.75], [.35, -.75], [-.35, .75], [.35, .75]]) legs.push(new THREE.BoxGeometry(.2, .7, .2).translate(sx, -.75, sz));
    const paint = (g, col) => { g = g.index ? g.toNonIndexed() : g; const c = new THREE.Color(col), a = new Float32Array(g.attributes.position.count * 3); for(let i = 0; i < a.length; i += 3){ a[i] = c.r; a[i + 1] = c.g; a[i + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
    const spot = new THREE.BoxGeometry(1.02, .5, .8).translate(0, .15, -.3);
    const cowG = mergeGeometries([paint(body, 0xf4f2ee), paint(spot, 0x222222), paint(head, 0xe8e2da), ...legs.map(l => paint(l, 0x2b2b2b)), paint(new THREE.BoxGeometry(.18, .18, .18).translate(0, -.15, 1.55), 0xd9a63a)], false).translate(0, 1.1, 0);
    const cows = []; for(let i = 0; i < 400 && cows.length < 18; i++){ const cx0 = i % 2 ? -470 : -650, x = cx0 + (R() - .5) * 70, z = 150 + (R() - .5) * 60, h = hAt(x, z); if(h == null || h < 2 || inBuilding(x, z) || Math.hypot(x + 555, z - 80) < 66) continue; cows.push([x, h, z, R() * 6.28]); }
    BOTD.cows = cows; const cm = new THREE.InstancedMesh(cowG, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.8}), cows.length);
    cows.forEach(([x, y, z, r], i) => { _m4.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, r, 0)), _s1); cm.setMatrixAt(i, _m4); circles.push({x, z, r:1.1}); }); cm.castShadow = true; cm.userData.dynamic = true; scene.add(cm);
    INTER.push({x:-470, z:150, r:30, prio:.2, label:'🐄 Đàn bò sữa đeo chuông – nghe “leng keng” (E)', action:() => toast('🐄🔔 Leng keng… Bò Thụy Sĩ đeo chuông để chủ tìm trên đồng cỏ. Từ mới: cow /kaʊ/ · 奶牛 nǎiniú · 牛 (うし) · 소 (so)', 5000)}); }
  const MILLS = [];
  for(const [mx, mz] of [[-475, -178], [-640, -185], [-640, 165]]){ const y = gy(mx, mz);
    KX.add(new THREE.CylinderGeometry(1.8, 3.2, 12, 8), MAT.woodL, mx, y + 6, mz); KX.add(new THREE.ConeGeometry(2.6, 3, 8), MAT.slate, mx, y + 13.5, mz); circles.push({x:mx, z:mz, r:3.3});
    const hub = new THREE.Group(); hub.position.set(mx, y + 11.5, mz + 2.1); hub.userData.dynamic = true; scene.add(hub);
    for(let b = 0; b < 4; b++){ const bl = new THREE.Mesh(new THREE.BoxGeometry(1.3, 7, .12), MAT.woodL); bl.geometry.translate(0, 3.8, 0); bl.rotation.z = b * Math.PI / 2; bl.castShadow = true; hub.add(bl); } MILLS.push(hub); }
  HOOK.onFrame.push(dt => { for(const h of MILLS) h.rotation.z -= dt * .6; });

  /* ============================== 7. TÀU HOẢ BÁNH RĂNG ĐỎ + CẦU CẠN ĐÁ VÒM ============================== */
  const PATH = [];
  { const {x0, x1, z0, z1, r} = RAIL, segs = [];   // vòng chữ nhật bo góc, chạy theo chiều kim đồng hồ (nhìn từ trên)
    const line = (ax, az, bx, bz) => { const L = Math.hypot(bx - ax, bz - az); for(let t = 0; t < L; t += 1) PATH.push([ax + (bx - ax) * t / L, az + (bz - az) * t / L]); };
    const arc = (cx, cz, a0, a1) => { const L = Math.abs(a1 - a0) * r; for(let t = 0; t < L; t += 1){ const a = a0 + (a1 - a0) * t / L; PATH.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
    line(x0 + r, z0, x1 - r, z0); arc(x1 - r, z0 + r, -Math.PI / 2, 0); line(x1, z0 + r, x1, z1 - r); arc(x1 - r, z1 - r, 0, Math.PI / 2); line(x1 - r, z1, x0 + r, z1); arc(x0 + r, z1 - r, Math.PI / 2, Math.PI); line(x0, z1 - r, x0, z0 + r); arc(x0 + r, z0 + r, Math.PI, Math.PI * 1.5); }
  const NP = PATH.length, GY = PATH.map(([x, z]) => gy(x, z)), RY = new Float32Array(NP);
  for(let i = 0; i < NP; i++){ let s = 0, n = 0; for(let k = -28; k <= 28; k += 2){ s += GY[(i + k + NP) % NP]; n++; } RY[i] = Math.max(s / n, GY[i] + .35); }
  for(let pass = 0; pass < 3; pass++) for(let i = 0; i < NP; i++){ const a = RY[(i - 1 + NP) % NP], b = RY[(i + 1) % NP]; RY[i] = Math.max((a + RY[i] + b) / 3, GY[i] + .35); }
  { const pos = [], idx = [], rp = [], ridx = [], skP = [], skI = [], sl = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, .14, .26), MAT.cedar, Math.ceil(NP / 1.0)); let ns = 0;
    const piers = [], arches = [];
    for(let i = 0; i <= NP; i++){ const k = i % NP, [x, z] = PATH[k], [xa, za] = PATH[(k + 1) % NP], dx = xa - x, dz = za - z, l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l, y = RY[k];
      pos.push(x + nx * 1.6, y - .05, z + nz * 1.6, x - nx * 1.6, y - .05, z - nz * 1.6); if(i > 0){ const q = i * 2; idx.push(q - 2, q, q - 1, q - 1, q, q + 1); }
      { const g0 = GY[k] - .3; skP.push(x + nx * 1.6, y - .05, z + nz * 1.6, x + nx * 2.3, g0, z + nz * 2.3, x - nx * 1.6, y - .05, z - nz * 1.6, x - nx * 2.3, g0, z - nz * 2.3); if(i > 0){ const q = i * 4; skI.push(q - 4, q - 3, q, q, q - 3, q + 1, q - 2, q + 2, q - 1, q - 1, q + 2, q + 3); } }
      if(i < NP && y - GY[k] <= 1.7) for(let o = -2.3; o <= 2.31; o += .25) for(const a of [-.5, 0, .5]){ const ao = Math.abs(o), kk = bedK(x + nx * o + dx / l * a, z + nz * o + dz / l * a), top = ao <= 1.6 ? y + .09 : y - .05 + (GY[k] - .3 - y + .05) * (ao - 1.6) / .7 + .02; if(!(BED.get(kk) >= top)) BED.set(kk, top); }   /* mặt tà vẹt · trên taluy */
      for(const s of [-.72, .72]) rp.push(x + nx * (s - .04), y + .2, z + nz * (s - .04), x + nx * (s + .04), y + .2, z + nz * (s + .04)); if(i > 0){ const q = i * 4; ridx.push(q - 4, q, q - 3, q - 3, q, q + 1, q - 2, q + 2, q - 1, q - 1, q + 2, q + 3); }
      if(i < NP){ _m4.compose(_p.set(x, y + .02, z), _q.setFromEuler(_e.set(0, Math.atan2(dx, dz), 0)), _s1); sl.setMatrixAt(ns++, _m4);
        if(y - GY[k] > 1.0 && k % 10 === 0) piers.push([x, GY[k] - .5, z, y - GY[k], Math.atan2(dx, dz)]); } }
    const bal = new THREE.BufferGeometry(); bal.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bal.setIndex(idx); bal.computeVertexNormals();
    const bm = new THREE.Mesh(bal, sm(0x8a8478, .95)); bm.receiveShadow = true; bm.userData.dynamic = true; bm.userData.noFar = true; scene.add(bm);
    { const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(skP, 3)); sg.setIndex(skI); sg.computeVertexNormals(); const sk = new THREE.Mesh(sg, sm(0x7d776b, .95, 0, {side:THREE.DoubleSide})); sk.receiveShadow = true; sk.userData.dynamic = true; sk.userData.noFar = true; scene.add(sk); }   // taluy nền ray
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); rg.setIndex(ridx); rg.computeVertexNormals();
    const rm = new THREE.Mesh(rg, MAT.steel); rm.userData.dynamic = true; rm.userData.noFar = true; scene.add(rm);
    sl.count = ns; sl.userData.dynamic = true; sl.receiveShadow = true; scene.add(sl);
    // cầu cạn đá vòm: trụ + vòm (ExtrudeGeometry khung vòm, 1 lượt vẽ)
    if(piers.length){ const sh = new THREE.Shape(); sh.moveTo(-5, 0); sh.lineTo(-5, 1); sh.lineTo(5, 1); sh.lineTo(5, 0); sh.absarc(0, 0, 4.2, 0, Math.PI, false); sh.lineTo(-5, 0);
      const archG = new THREE.ExtrudeGeometry(sh, {depth:3, bevelEnabled:false, curveSegments:10}).translate(0, 0, -1.5);
      const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 1, 3).translate(0, .5, 0), MAT.stoneD, piers.length), am = new THREE.InstancedMesh(archG, MAT.stoneD, piers.length);
      piers.forEach(([x, y, z, hh, ry], i) => { _m4.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry + Math.PI / 2, 0)), _s1.set(1, hh + .3, 1)); pm.setMatrixAt(i, _m4); _m4.compose(_p.set(x, y + Math.max(0, hh - 1.6), z), _q.setFromEuler(_e.set(0, ry + Math.PI / 2, 0)), _s1.set(1, 1, 1)); am.setMatrixAt(i, _m4); circles.push({x, z, r:1.7}); });
      _s1.set(1, 1, 1); for(const im of [pm, am]){ im.castShadow = true; im.receiveShadow = true; im.userData.dynamic = true; im.computeBoundingSphere(); scene.add(im); } } }
  // 5 ga
  const STATIONS = [
    {name:'Ga Tiếng Anh', sub:'English Station', x:-360, z:-80, t:'en'}, {name:'Ga Tiếng Nhật', sub:'日本語駅', x:-360, z:-280, t:'ja'},
    {name:'Ga Tiếng Hàn & Làng Tuyết', sub:'한국어역 · Snow Village', x:-740, z:-300, t:'ko'}, {name:'Ga Tiếng Trung', sub:'汉语站', x:-740, z:-80, t:'zh'},
    {name:'Ga Cầu Vòm', sub:'Viaduct Station · Làng Chalet', x:-556, z:20, t:null}];
  for(const S of STATIONS){ let bi = 0, bd = 1e9; for(let i = 0; i < NP; i++){ const d = (PATH[i][0] - S.x) ** 2 + (PATH[i][1] - S.z) ** 2; if(d < bd){ bd = d; bi = i; } } S.i = bi;
    const [x, z] = PATH[bi], [xa, za] = PATH[(bi + 1) % NP], ry = Math.atan2(xa - x, za - z), nx = Math.cos(ry), nz = -Math.sin(ry), side = S.x > -550 ? 1 : -1;
    const px = x + nx * 3.4 * side, pz = z + nz * 3.4 * side, py = Math.max(RY[bi] + .55, gy(px, pz) + .3); S.px = px; S.pz = pz; S.py = py;
    KX.add(new THREE.BoxGeometry(3, py - gy(px, pz) + .5, 26), MAT.stone, px, (py + gy(px, pz) - .5) / 2, pz, 0, ry, 0); addPlat(px, pz, ry, 1.5, 13, py);
    for(const k of [-9, 0, 9]){ const ox = Math.sin(ry) * k, oz = Math.cos(ry) * k; KX.add(new THREE.CylinderGeometry(.12, .12, 3.2, 8), MAT.dark, px + ox + nx * side * .9, py + 1.6, pz + oz + nz * side * .9); circles.push({x:px + ox + nx * side * .9, z:pz + oz + nz * side * .9, r:.2, y0:py - 1, y1:py + 3}); }
    KX.add(new THREE.BoxGeometry(3.6, .2, 24), MAT.red, px + nx * side * .3, py + 3.25, pz + nz * side * .3, 0, ry, 0);
    sign(signTex(1024, 200, '#b3261e', [[`🚂 ${S.name}`, `800 64px ${FONT}`, '#fff', .4], [S.sub, `600 40px ${FONT}`, '#ffe9a8', .8]]), 6, 1.2, px + nx * side * .9, py + 2.6, pz + nz * side * .9, ry + Math.PI / 2 * (side > 0 ? -1 : 1), .5);
    INTER.push({x:px, z:pz, r:3.2, prio:.85, label:`🚂 ${S.name} – đi tàu bánh răng (E)`, action:() => trainMenu(S)}); }
  function trainMenu(from){ if(!ui || !ui.modal){ return; } const m = ui.modal(`🚂 ${from.name} · Tàu bánh răng đỏ`);
    let learner = false; try{ learner = Object.keys(JSON.parse(localStorage.getItem('qcworld-lang') || '{}').done || {}).length > 0; }catch(e){}
    m.body.innerHTML = `<p class="muted">Tàu chạy vòng khép kín qua cầu cạn đá vòm. Vé <b>5 💰</b> – <b>miễn phí cho học viên</b> (đã học xong ≥ 1 bài).${learner ? ' ✅ Bạn là học viên – đi miễn phí!' : ''}</p><div class="grid"></div>`;
    const g = m.body.querySelector('.grid'); for(const S of STATIONS){ if(S === from) continue; const b = document.createElement('button'); b.className = 'btn'; b.textContent = `🚉 ${S.name}`; b.onclick = () => { m.close(); const go = () => { teleport(S.px, S.pz, S.px + (S.x > -550 ? 8 : -8), S.pz); toast(`🚂 Tu tu… Tàu bánh răng đã đưa bạn tới ${S.name}.`, 3200); }; if(learner) go(); else pay(5, `vé tàu tới ${S.name}`, go); }; g.appendChild(b); } }
  // đoàn tàu: đầu máy + 2 toa (khối đặc – không đi xuyên)
  const CARS = [];
  { const red = sm(0xc0201a, .4, .2), win = sm(0x2a3a4a, .2, .4), roofW = sm(0xf4f4f0, .5);
    for(let c = 0; c < 3; c++){ const g = new THREE.Group(); g.userData.dynamic = true; const k = Kit();
      k.add(AK.roundedBox(2.6, 2.4, 9.4, .25, 2), red, 0, 1.7, 0); k.add(new THREE.BoxGeometry(2.66, .8, 8.4), win, 0, 2.1, 0); k.add(AK.roundedBox(2.7, .25, 9.6, .1, 2), roofW, 0, 3, 0);
      for(const z of [-3.2, 3.2]) k.add(new THREE.BoxGeometry(2.2, .5, 1.6), MAT.dark, 0, .5, z);
      if(c === 0){ k.add(new THREE.BoxGeometry(2.4, 1.6, 1.4), red, 0, 1.3, 5.2); k.add(new THREE.CylinderGeometry(.3, .3, .2, 12), sm(0xfff3b0, .3, 0, {emissive:0xfff3b0, emissiveIntensity:.8}), 0, 1.6, 5.95, Math.PI / 2, 0, 0); }
      k.build(g); scene.add(g); CARS.push(g); W.DYN && W.DYN.push({obj:g, hw:1.45, hl:5, head:() => g.userData.h || 0, on:() => true, name:'Tàu bánh răng'}); }
    let s = STATIONS[0].i, wait = 0, lastSt = null; const speed = 9;
    HOOK.onFrame.push(dt => { const p = W.P, near = (p.x + 550) ** 2 + (p.z + 125) ** 2 < 520 ** 2; if(!near && R() < .7) return;
      if(wait > 0) wait -= dt; else { s = (s + speed * dt) % NP; for(const S of STATIONS) if(S !== lastSt && Math.abs(((s - S.i + NP) % NP)) < speed * dt + .1){ wait = 7; lastSt = S; } }
      for(let c = 0; c < CARS.length; c++){ const f = (s - c * 10.6 + NP * 2) % NP, i = Math.floor(f), t = f - i, a = PATH[i], b = PATH[(i + 1) % NP], g = CARS[c];
        const x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t, y = RY[i] + (RY[(i + 1) % NP] - RY[i]) * t, h = Math.atan2(b[0] - a[0], b[1] - a[1]);
        g.position.set(x, y + .1, z); g.rotation.set(0, h, 0); g.userData.h = h; } }); }

  /* ============================== 8. LÀNG CHALET · LÀNG TUYẾT · BẾN THUỶ PHI CƠ ============================== */
  const chalet = (x, z, face, w = 9, d = 8, snowy = false, label = null) => { const y = gy(x, z), ry = face > 0 ? 0 : Math.PI;
    KX.add(new THREE.BoxGeometry(w, 3, d), MAT.plaster, x, y + 1.5, z); KX.add(new THREE.BoxGeometry(w + .2, 3, d + .2), MAT.wood, x, y + 4.5, z);
    const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 1, 0); sh.lineTo(0, w * .55); sh.lineTo(w / 2 + 1, 0); sh.lineTo(-w / 2 - 1, 0);
    KX.add(new THREE.ExtrudeGeometry(sh, {depth:d + 2, bevelEnabled:false}).translate(0, 0, -(d + 2) / 2), snowy ? MAT.snow : MAT.cedar, x, y + 6, z);
    KX.add(new THREE.BoxGeometry(w - 1, .15, 1.4), MAT.woodL, x, y + 3.1, z + face * (d / 2 + .7)); KX.add(new THREE.BoxGeometry(w - 1.2, .4, .3), MAT.red, x, y + 3.4, z + face * (d / 2 + 1.3));
    KX.add(new THREE.BoxGeometry(1.6, 2.4, .1), MAT.cedar, x, y + 1.2, z + face * (d / 2 + .06));
    boxes.push({x0:x - w / 2 - .1, x1:x + w / 2 + .1, z0:z - d / 2 - .1, z1:z + d / 2 + .1});
    if(label) sign(signTex(768, 160, '#3b2a20', [[label, `800 56px ${FONT}`, '#ffe9a8', .5]]), 5.4, 1.1, x, y + 3.9, z + face * (d / 2 + 1.5), ry, .5); };
  { const SHOPS = [[-612, 68, 1, 12, 9, '🧀 Fondue Bình Phan'], [-590, 68, 1, 9, 8, '🍫 Chocolaterie'], [-520, 68, 1, 9, 8, '🕰️ Tiệm Đồng hồ'], [-498, 68, 1, 9, 8, null], [-612, 92, -1, 9, 8, null], [-590, 92, -1, 9, 8, null], [-520, 92, -1, 9, 8, '🏨 Chalet Inn'], [-498, 92, -1, 9, 8, null]];
    for(const [x, z, f, w, d, l] of SHOPS) chalet(x, z, f, w, d, false, l);
    const y = gy(-555, 80); KX.add(new THREE.BoxGeometry(14, .35, 5), MAT.woodL, -555, y + .9, 80); addPlat(-555, 80, 0, 7, 2.5, y + 1.05); for(const s of [-1, 1]) addSeg(-562, 80 + s * 2.4, -548, 80 + s * 2.4, .1, y, y + 3, '🌉 Lan can cầu gỗ làng');
    INTER.push({x:-612, z:75, r:3, prio:.85, label:'🧀 Nhà hàng Lẩu Phô mai Fondue (20 💰, ⚡ đi nhanh)', action:() => buff('energy', 15, 20, '🧀 Lẩu phô mai Fondue nóng hổi')});
    INTER.push({x:-590, z:74.5, r:2.6, prio:.85, label:'🍫 Tiệm Sô-cô-la Thụy Sĩ (10 💰, ☕ thưởng quiz)', action:() => buff('coffee', 10, 10, '🍫 Sô-cô-la sữa Thụy Sĩ')});
    INTER.push({x:-520, z:74.5, r:2.6, prio:.85, label:'🕰️ Tiệm Đồng hồ cúc cu (E)', action:() => { const t = new Date(); toast(`🕰️ Cúc cu! Bây giờ là ${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}. “Time flies” · 光阴似箭 · 時は金なり · 시간은 금이다`, 5000); }});
    // Làng Tuyết + dốc trượt tuyết
    for(const [x, z] of [[-786, -352], [-768, -366], [-752, -350], [-800, -335]]) chalet(x, z, 1, 8, 7, true);
    for(let i = 0; i < 8; i++){ const x = -770 + (i % 2 ? 5 : -5), z = -380 - i * 9, y = gy(x, z); KX.add(new THREE.CylinderGeometry(.06, .06, 2, 6), i % 2 ? MAT.red : sm(0x1f4fa8), x, y + 1, z); }
    INTER.push({x:-770, z:-372, r:4, prio:.7, label:'⛷️ Khu trượt tuyết Làng Tuyết (E)', action:() => toast('⛷️ Dốc trượt tuyết mở mùa đông! Từ vựng: ski /skiː/ · 滑雪 huáxuě · スキー · 스키 – bấm M để bay về học viện.', 5000)}); }
  { const DX = -306, DZ = 158, y = .7;   // bến thuỷ phi cơ: cầu tàu gỗ ra biển + 2 thuỷ phi cơ
    KX.add(new THREE.BoxGeometry(34, .3, 4), MAT.woodL, DX + 12, y, DZ); addPlat(DX + 12, DZ, 0, 17.1, 2.1, y + .15);
    for(let i = 0; i < 9; i++) for(const s of [-1, 1]) KX.add(new THREE.CylinderGeometry(.18, .18, 4, 8), MAT.wood, DX - 4 + i * 4, y - 1.8, DZ + s * 1.9);
    for(const s of [-1, 1]) addSeg(DX - 5, DZ + s * 2.05, DX + 29, DZ + s * 2.05, .1, y - 1, y + 2, '🌊 Mép cầu tàu');
    addSeg(DX + 29, DZ - 2, DX + 29, DZ + 2, .1, y - 1, y + 2, '🌊 Cuối cầu tàu – lên thuỷ phi cơ bằng E');
    for(const [ox, oz] of [[18, 7], [28, -7]]){ const g = new THREE.Group(), k = Kit(); k.add(AK.roundedBox(1.6, 1.6, 9, .5, 2), MAT.white, 0, 2.2, 0); k.add(new THREE.BoxGeometry(12, .18, 1.8), MAT.white, 0, 2.9, .5); k.add(new THREE.BoxGeometry(4, .15, 1.1), MAT.white, 0, 2.5, -4.2); k.add(new THREE.BoxGeometry(.15, 1.6, 1.2), sm(0xc0201a), 0, 3.2, -4.3);
      k.add(new THREE.BoxGeometry(1.64, .3, 7), sm(0xc0201a), 0, 2.1, 0); for(const s of [-1, 1]){ k.add(AK.roundedBox(.6, .5, 7, .2, 2), MAT.white, s * 1.6, .3, .3); k.add(new THREE.BoxGeometry(.1, 1.5, .1), MAT.dark, s * 1.6, 1.1, 1.5); }
      k.build(g); g.position.set(DX + ox, 0, DZ + oz); g.rotation.y = Math.PI / 2; g.userData.dynamic = true; scene.add(g); boxes.push({x0:DX + ox - 5, x1:DX + ox + 5, z0:DZ + oz - 6.5, z1:DZ + oz + 6.5}); }
    sign(signTex(1024, 180, '#0b4a6f', [['✈️ BẾN THUỶ PHI CƠ · SEAPLANE DOCK', `800 56px ${FONT}`, '#fff', .45], ['Bay về Đảo trung tâm', `600 40px ${FONT}`, '#ffd23f', .82]]), 7, 1.25, DX - 3, y + 3, DZ - 2.6, 0, .5);
    KX.add(new THREE.BoxGeometry(.2, 3.4, .2), MAT.dark, DX - 6, y + 1.5, DZ - 2.6); KX.add(new THREE.BoxGeometry(.2, 3.4, .2), MAT.dark, DX, y + 1.5, DZ - 2.6);
    INTER.push({x:DX + 26, z:DZ, r:3, prio:.85, label:'✈️ Thuỷ phi cơ – bay về Đảo trung tâm (10 💰)', action:() => { const go = () => { const s = W.V2SPAWN || {x:0, z:5, lx:0, lz:0}; teleport(s.x, s.z, s.lx, s.lz); toast('✈️ Vù… Thuỷ phi cơ đã hạ cánh ở Đảo trung tâm!', 3500); }; pay(10, 'chuyến thuỷ phi cơ', go); }}); }

  /* ============================== 9. ĐƯỜNG NỘI ĐẢO (không đường cụt) + CẦU G3 SANG ĐẢO TRUNG TÂM ============================== */
  //  • Đường dạo vòng đảo (khép kín, chạy ngoài đường ray 9 m, đi ngang sau 5 ga) · đại lộ Cổng Đông → cầu G3
  //  • Vòng làng Chalet ↔ bến thuỷ phi cơ (khép kín, nối vào đường vòng) · lối vào 4 học viện + Làng Tuyết kết thúc bằng quảng trường trước cửa
  const pathPos = [], pathCol = [], pathIdx = [], pc = new THREE.Color();
  const ribbon = (pts, w, col, skipRiver = true) => { const S = []; for(let i = 0; i < pts.length - 1; i++){ const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0); for(let t = 0; t < L; t += 2) S.push([x0 + (x1 - x0) * t / L, z0 + (z1 - z0) * t / L]); } S.push(pts[pts.length - 1]);
    pc.set(col); let prev = -1;
    for(let i = 0; i < S.length; i++){ const [x, z] = S[i], a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
      if(skipRiver && riverD(x, z) < 6.5){ prev = -1; continue; } const base = pathPos.length / 3;
      pathPos.push(x + nx * w / 2, gy(x + nx * w / 2, z + nz * w / 2) + .025, z + nz * w / 2, x - nx * w / 2, gy(x - nx * w / 2, z - nz * w / 2) + .025, z - nz * w / 2); for(let k = 0; k < 2; k++) pathCol.push(pc.r, pc.g, pc.b);
      if(prev >= 0) pathIdx.push(prev, base, prev + 1, prev + 1, base, base + 1); prev = base; } };
  const plaza = (x, z, r, col) => { pc.set(col); const c = pathPos.length / 3; pathPos.push(x, gy(x, z) + .025, z); pathCol.push(pc.r, pc.g, pc.b); const n = 20;
    for(let i = 0; i <= n; i++){ const a = i / n * 6.283, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; pathPos.push(px, gy(px, pz) + .025, pz); pathCol.push(pc.r, pc.g, pc.b); if(i > 0) pathIdx.push(c, c + i + 1, c + i); } };
  const roundRect = (x0, x1, z0, z1, r) => { const P = [], arc = (cx, cz, a0, a1) => { for(let k = 0; k <= 8; k++){ const a = a0 + (a1 - a0) * k / 8; P.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
    arc(x1 - r, z0 + r, -Math.PI / 2, 0); arc(x1 - r, z1 - r, 0, Math.PI / 2); arc(x0 + r, z1 - r, Math.PI / 2, Math.PI); arc(x0 + r, z0 + r, Math.PI, Math.PI * 1.5); P.push(P[0]); return P; };
  const STONE = 0xc9bb9b, PAVE = 0xb4ada2;
  const PR = {x0:RAIL.x0 - 9, x1:RAIL.x1 + 9, z0:RAIL.z0 - 9, z1:RAIL.z1 + 9};
  ribbon(roundRect(PR.x0, PR.x1, PR.z0, PR.z1, RAIL.r + 9), 4, STONE);   // đường dạo vòng đảo
  // cầu gỗ nhỏ ở 2 chỗ đường vòng cắt suối băng
  const footbridge = (x, z, alongX, len = 14) => { const y = Math.max(gy(x - (alongX ? len / 2 : 0), z - (alongX ? 0 : len / 2)), gy(x + (alongX ? len / 2 : 0), z + (alongX ? 0 : len / 2))) + .25;
    KX.add(new THREE.BoxGeometry(alongX ? len : 4.4, .35, alongX ? 4.4 : len), MAT.woodL, x, y - .15, z); addPlat(x, z, 0, alongX ? len / 2 + .1 : 2.3, alongX ? 2.3 : len / 2 + .1, y);
    for(const s of [-1, 1]){ if(alongX){ KX.add(new THREE.BoxGeometry(len, .9, .1), MAT.wood, x, y + .45, z + s * 2.15); addSeg(x - len / 2, z + s * 2.2, x + len / 2, z + s * 2.2, .1, y - 3, y + 2, '🌉 Lan can cầu gỗ'); }
      else { KX.add(new THREE.BoxGeometry(.1, .9, len), MAT.wood, x + s * 2.15, y + .45, z); addSeg(x + s * 2.2, z - len / 2, x + s * 2.2, z + len / 2, .1, y - 3, y + 2, '🌉 Lan can cầu gỗ'); } } };
  { let best = null; for(let x = -620; x < -480; x += .5){ const d = riverD(x, PR.z1); if(!best || d < best.d) best = {x, d}; } footbridge(best.x, PR.z1, true); }
  { let best = null; for(let x = -620; x < -500; x += .5){ const d = riverD(x, PR.z0); if(!best || d < best.d) best = {x, d}; } if(best && best.d < 6) footbridge(best.x, PR.z0, true); }
  // làng Chalet + bến thuỷ phi cơ: 1 vòng khép kín nối vào cạnh Nam đường vòng
  ribbon([[-630, PR.z1], [-630, 80], [-480, 80], [-480, PR.z1]], 4.5, PAVE, true);
  ribbon([[PR.x1 - 40, PR.z1], [-330, 90], [-314, 148]], 3.6, STONE); ribbon([[-314, 150], [-400, 124], [-480, 86]], 3.6, STONE); plaza(-312, 154, 6, STONE);
  // lối vào học viện + Làng Tuyết (quảng trường trước cửa)
  ribbon([[PR.x1, -48], [-420, -48]], 3.4, STONE); plaza(-420, -51, 7, PAVE);
  ribbon([[ACAD.zh.x, PR.z1], [ACAD.zh.x, -24]], 3.4, STONE); plaza(ACAD.zh.x, -26, 6, PAVE);
  ribbon([[PR.x1, -212], [-420, -212], [-420, -236]], 3.4, STONE); plaza(-420, -236, 5.5, PAVE);
  ribbon([[PR.x0, -240], [ACAD.ko.x, -240]], 3.4, STONE); plaza(ACAD.ko.x, -246, 7, PAVE);
  ribbon([[PR.x0, -330], [-772, -348]], 3.2, STONE); plaza(-776, -350, 9, STONE);
  // đại lộ Cổng Đông → cầu G3 (cổng Abyssal Tây −180, −16, cao +2)
  const GZ = -16; let coastX = -262; for(let x = -330; x < -240; x += .5){ const h = hAt(x, GZ); if(h == null || h < .35){ coastX = x - .5; break; } }
  const landX = coastX - 10, landY = gy(landX, GZ) + .1;
  ribbon([[PR.x1, GZ], [landX, GZ]], 7, PAVE);
  { const x0 = landX, x1 = -180, L = x1 - x0, N = Math.ceil(L / 2.5), BW = 8;
    const yAt = t => { const ramp = ss(0, .18, t); return lerp(landY, 2, ramp) + Math.sin(Math.PI * t) * .9 * ramp; };
    for(let i = 0; i < N; i++){ const t0 = i / N, t1 = (i + 1) / N, xm = x0 + L * (t0 + t1) / 2, y = yAt((t0 + t1) / 2), sl = L / N;
      KX.add(new THREE.BoxGeometry(sl + .05, .5, BW), MAT.stone, xm, y - .25, GZ); KX.add(new THREE.BoxGeometry(sl + .05, .04, BW - 1.4), sm(0x3a3c40, .9), xm, y + .01, GZ); addPlat(xm, GZ, 0, sl / 2 + .03, BW / 2 - .1, y); }
    for(const s of [-1, 1]){ const z = GZ + s * (BW / 2 - .1);
      for(let i = 0; i <= N; i++){ const t = i / N, x = x0 + L * t, y = yAt(t); KX.add(new THREE.BoxGeometry(.1, 1.1, .1), MAT.dark, x, y + .55, z); if(i < N){ const t2 = (i + 1) / N, y2 = yAt(t2), len = Math.hypot(L / N, y2 - y); KX.add(new THREE.BoxGeometry(len, .1, .12), MAT.steel, x + L / N / 2, (y + y2) / 2 + 1.1, z, 0, 0, Math.atan2(y2 - y, L / N)); } }
      addSeg(x0, z, x1, z, .15, -10, 6, '🌊 Lan can cầu G3 – đi thẳng sang đảo trung tâm'); }
    for(let x = x0 + 14; x < x1 - 4; x += 12){ const y = yAt((x - x0) / L); KX.add(new THREE.CylinderGeometry(.8, 1, Math.max(1, y + 6), 10), MAT.stoneD, x, (y - 6) / 2, GZ); }
    if(W.lampPost) for(let x = x0 + 8; x < x1 - 2; x += 16){ const y = yAt((x - x0) / L); for(const s of [-1, 1]){ try{ const before = W.scene.children.length; W.lampPost(x, GZ + s * (BW / 2 + .3)); for(let k = before; k < W.scene.children.length; k++) W.scene.children[k].position.y += y; }catch(e){} } }
    const gate = (x, y, txt, sub) => { for(const s of [-1, 1]) KX.add(new THREE.BoxGeometry(.9, 6.5, .9), MAT.stoneD, x, y + 3.25, GZ + s * (BW / 2 + .6)); KX.add(new THREE.BoxGeometry(1, 1.2, BW + 2.2), MAT.stoneD, x, y + 6.8, GZ);
      const t = signTex(1024, 180, '#1b2d4f', [[txt, `800 58px ${FONT}`, '#fff', .42], [sub, `600 36px ${FONT}`, '#ffd23f', .82]]); for(const f of [1, -1]) sign(t, BW, 1.3, x + f * .52, y + 6.8, GZ, f > 0 ? Math.PI / 2 : -Math.PI / 2, .5); };
    gate(x0 + 1.5, landY, '🏔️ ĐẢO NGOẠI NGỮ THỤY SĨ', 'Cổng Đông G3 · ← 4 học viện Anh–Trung–Nhật–Hàn'); gate(x1 - 1.5, 2, '→ ĐẢO TRUNG TÂM · ABYSSAL', 'Cầu G3 · Đảo Ngoại ngữ Thụy Sĩ ở phía sau'); }
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pathPos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(pathCol, 3)); g.setIndex(pathIdx); g.computeVertexNormals();
    const pm = new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.92, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2})); pm.receiveShadow = true; pm.userData.dynamic = true; pm.userData.noFar = true; scene.add(pm); }

  KX.build();

  /* ============================== 10. BẢN ĐỒ & ĐIỂM NHẢY ============================== */
  const tp = (x, z, lx, lz) => () => teleport(x, z, lx, lz);
  PLACES.push({icon:'🏔️', name:'Đảo Ngoại ngữ Thụy Sĩ', sub:'Thảo nguyên núi tuyết · 4 học viện Anh–Trung–Nhật–Hàn · tàu bánh răng', go:tp(-330, -180, -560, -230)},
    {icon:'🇬🇧', name:'Học viện Tiếng Anh · Oxford', sub:'Lâu đài đá + Big Ben + nhà kính Kew · 0 → IELTS 8.0+', go:tp(-420, -50, -420, -80)},
    {icon:'🀄', name:'Học viện Tiếng Trung · Tô Châu', sub:'Hán Học Điện trên hồ sen · Cầu Cửu Khúc · 0 → HSK 7–9', go:tp(-680, -33, -680, -80)},
    {icon:'🇯🇵', name:'Học viện Tiếng Nhật · Kyoto', sub:'Lâu đài gỗ · Torii · hoa anh đào (khoá đang soạn)', go:tp(-420, -238, -420, -280)},
    {icon:'🇰🇷', name:'Học viện Tiếng Hàn · Hanok & K-Cube', sub:'Dancheong · màn LED K-Wave (khoá đang soạn)', go:tp(-680, -250, -680, -280)},
    {icon:'🧀', name:'Làng Chalet Thụy Sĩ', sub:'Fondue · Sô-cô-la · Đồng hồ cúc cu', go:tp(-540, 80, -600, 80)},
    {icon:'⛷️', name:'Làng Tuyết & Ga Tiếng Hàn', sub:'Chalet tuyết · dốc trượt tuyết', go:tp(-760, -330, -770, -390)},
    {icon:'✈️', name:'Bến thuỷ phi cơ', sub:'Bay về Đảo trung tâm', go:tp(-312, 152, -280, 160)});

  // Pha 9: bot do palm_dubai.js nạp chung; vùng Palm không tải được thì đảo Thụy Sĩ tự nạp phần của mình
  setTimeout(() => { if(!W.__botsSP) import('./bots_swiss_palm.js').then(m => m.make(W, ctx, {swiss:W.swissV2})).catch(e => console.warn('[Swiss] bots_swiss_palm:', e)); }, 10000);
  return {lang:W.lang || {open:openApp}, open:openApp, stations:STATIONS, academies:ACADS, cars:CARS, cows:BOTD.cows || [], gy, zone:'swiss'};
}
