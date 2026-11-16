// QC World V2 – PHA 8B: 🌴 ỐC ĐẢO LẤN BIỂN "THE QC PALM DUBAI" – vùng x 250→1050, z 520→1320, y −8→65 · tâm (650, 920) · mặt đảo y +2,2
//  🌴 Thân cọ x 585–715 (z 520–1005): 2 đại lộ + vòng xuyến đài phun nước · Phố ẩm thực 8 quán dưới Palm Monorail · 6 Beach Club · Marina Mall · 4 Palm Sky-Towers 60 m
//  🍃 8 nhánh lá (z 660 · 740 · 820 · 900) – mỗi cặp 1 hạng nhà đồng nhất, mũi nhánh có cầu vòm sang vành trăng khuyết:
//     F1·F2 🏠 Santorini 2.500 · F3·F4 🏡 Duplex kính 12.000 · F5·F6 🏖️ Biệt thự hồ bơi 35.000 · F7·F8 🛥️ Siêu biệt thự bến du thuyền 85.000
//  🌙 Vành trăng khuyết r 336–398: 4 👑 Dinh thự Đế Vương 250.000 (sân trực thăng · thuỷ cung ngầm · bến siêu du thuyền) · 🏨 Khách sạn Vòm Vương Miện · bãi tắm dù
//  💳 Mua nhiều căn – lưu S.ownedEstates (không ghi đè căn cũ) · chủ nhà mở cửa vào nhà (nội thất theo hạng) · đặt làm nơi xuất hiện
//  🛣️ Không đường cụt: đại lộ Bắc ↔ đường vành (vòng lớn) · nhánh lá ↔ cầu mũi nhánh ↔ đường vành · cầu G7 (CBD Nam 450,460) · cầu G9 (Wonderland Đông 220,900)
import * as AK from './archKit.js';
export async function make(W, ctx = {}){
  const {THREE, scene, HOOK, INTER, PLACES, toast, teleport, addPlat, EXTL, mergeGeometries} = W;
  if(!EXTL || !addPlat || !mergeGeometries) return null;
  const N0 = scene.children.length;
  const ui =ctx.ui || W.ui, S = ctx.S || {}, boxes = W.boxes || [], addSeg = W.addSeg || (() => ({}));
  const save = () => { try{ ctx.save && ctx.save(); }catch(e){} }, fmt = n => Number(n).toLocaleString('vi-VN');
  try{ AK.bindNight(W); }catch(e){}
  const R = AK.rng(20261180), lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sm = (c, r = .6, m = 0, o = {}) => new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const FONT = '"Segoe UI","Segoe UI Emoji",sans-serif';
  const signTex = (w, h, bg, lines) => canvasTex(w, h, g => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle'; for(const [t, f, c, y] of lines){ g.fillStyle = c; g.font = f; g.fillText(t, w / 2, h * y); } });
  const sign = (tex, w, h, x, y, z, ry = 0, emis = .45) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({map:tex, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:emis, roughness:.6, side:THREE.DoubleSide})); m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); return m; };
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _n = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const mtx = (x, y, z, ry = 0, sx = 1, sy = sx, sz = sx, rx = 0, rz = 0) => _m4.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz, 'YXZ')), _s.set(sx, sy, sz));
  // Kit: gộp hình theo vật liệu (vật liệu có texture trải UV theo mét thật → gỗ/đá không giãn)
  function uvWorld(g, s){ const P = g.attributes.position, Nn = g.attributes.normal, uv = new Float32Array(P.count * 2);
    for(let i = 0; i < P.count; i++){ _n.fromBufferAttribute(Nn, i); const x = P.getX(i), y = P.getY(i), z = P.getZ(i), ax = Math.abs(_n.x), ay = Math.abs(_n.y), az = Math.abs(_n.z);
      if(ay >= ax && ay >= az){ uv[i * 2] = x / s; uv[i * 2 + 1] = z / s; } else if(ax >= az){ uv[i * 2] = z / s; uv[i * 2 + 1] = y / s; } else { uv[i * 2] = x / s; uv[i * 2 + 1] = y / s; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
  function Kit(){ const parts = new Map(); return {
    add(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0){ const g = geo.index ? geo.toNonIndexed() : geo.clone(); _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _m4.compose(_p.set(x, y, z), _q, _s.set(1, 1, 1)); g.applyMatrix4(_m4);
      for(const k of Object.keys(g.attributes)) if(!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      if(!g.attributes.normal) g.computeVertexNormals();
      if(!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      if(!parts.has(mat)) parts.set(mat, []); parts.get(mat).push(g); },
    build(parent = scene, shadow = true){ const out = []; for(const [m, list] of parts){ const geo = list.length === 1 ? list[0] : mergeGeometries(list, false); if(!geo) continue; if(m.map) uvWorld(geo, m.userData.tileM || 3); const ms = new THREE.Mesh(geo, m); ms.castShadow = shadow && !m.transparent; ms.receiveShadow = true; parent.add(ms); out.push(ms); } return out; } }; }
  // trả tiền: askPay chỉ hỏi xác nhận → trừ tiền bằng spend() rồi mới làm
  const pay = (cost, what, go) => { if(!ctx.askPay) return go(); ctx.askPay(cost, what, () => { if(ctx.spend && !ctx.spend(cost)) return; go(); }); };
  const buffGo = (key, min) => { try{ S.buffs = S.buffs || {}; S.buffs[key] = Math.max(Date.now(), S.buffs[key] || 0) + min * 60000; save(); }catch(e){} };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  /* ============================== 1. HÌNH ĐẢO CỌ (khoảng cách có dấu – SDF) ============================== */
  const C = {x:650, z:920}, Y = 2.2, ZN = ctx.zone || {x0:250, x1:1050, z0:520, z1:1320};
  const TR = {x0:585, x1:715, z0:520, z1:940};
  const sdRect = (x, z, x0, x1, z0, z1) => { const dx = Math.max(x0 - x, x - x1), dz = Math.max(z0 - z, z - z1); return dx > 0 && dz > 0 ? Math.hypot(dx, dz) : Math.max(dx, dz); };
  const polar = (x, z) => ({r:Math.hypot(x - C.x, z - C.z), a:Math.atan2(x - C.x, z - C.z)});   // a = 0 hướng Nam (+z), ±π hướng Bắc
  const atPolar = (r, a) => [C.x + Math.sin(a) * r, C.z + Math.cos(a) * r];
  const CR = {r0:336, r1:398, amax:.86 * Math.PI, road:350};
  const sdCres = (x, z) => { const {r, a} = polar(x, z); return Math.max(CR.r0 - r, r - CR.r1, (Math.abs(a) - CR.amax) * r); };
  const segD = (x, z, P) => { let d = 1e9; for(let i = 0; i < P.length - 1; i++){ const [ax, az] = P[i], [bx, bz] = P[i + 1], vx = bx - ax, vz = bz - az, t = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz || 1), 0, 1); d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t)); } return d; };
  // 8 nhánh lá: bề rộng nửa nhánh theo hạng nhà (nhà càng to sân sau càng sâu), uốn nhẹ về Nam, mũi cách vành ≥ 14 m nước
  const FZ = [660, 740, 820, 900], FWK = [20, 24, 28, 32], FRONDS = [];
  for(let k = 0; k < 4; k++) for(const s of [-1, 1]){ const z0 = FZ[k], FW = FWK[k], pts = [];
    for(let t = 0; t <= 240; t += 4){ const x = C.x + s * (65 + t), z = z0 + 38 * (t / 240) ** 2; if(Math.hypot(x - C.x, z - C.z) > CR.r0 - FW - 14) break; pts.push([x, z]); }
    const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
    FRONDS.push({k, s, z0, FW, pts, id:`F${k * 2 + (s < 0 ? 1 : 2)}`, bb:{x0:Math.min(...xs) - FW - 20, x1:Math.max(...xs) + FW + 20, z0:Math.min(...zs) - FW - 20, z1:Math.max(...zs) + FW + 20}}); }
  function sdLand(x, z){
    let d = Math.min(sdRect(x, z, TR.x0, TR.x1, TR.z0, TR.z1), Math.hypot(x - 650, z - 940) - 65);
    d = Math.min(d, sdRect(x, z, 425, 875, 520, 558), sdRect(x, z, 428, 502, 520, 612), sdRect(x, z, 798, 872, 520, 612), sdCres(x, z));
    for(const F of FRONDS){ const b = F.bb; if(x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) continue; d = Math.min(d, segD(x, z, F.pts) - F.FW); }
    return d; }
  // dinh thự trên vành (tính sớm để khoét hố thuỷ cung ngầm dưới biển)
  const local = (H, lx, lz) => [H.x + Math.cos(H.rot) * lx + Math.sin(H.rot) * lz, H.z - Math.sin(H.rot) * lx + Math.cos(H.rot) * lz];
  const toLocal = (H, x, z) => { const dx = x - H.x, dz = z - H.z, c = Math.cos(H.rot), s = Math.sin(H.rot); return [dx * c - dz * s, dx * s + dz * c]; };
  const PAL = [-.74, -.28, .28, .74].map((f, i) => { const a = f * Math.PI, [x, z] = atPolar(374, a); return {id:`P-${i + 1}`, cls:'p', a, x, z, rot:Math.atan2(C.x - x, C.z - z)}; });
  const AQZ = -44;   // tâm thuỷ cung theo trục sâu của dinh thự (ra biển)
  const AQ = PAL.map(H => { const [x, z] = local(H, -14, AQZ); return {x, z, rot:H.rot, hw:8, hd:6, sw:15, sd:12, H}; });
  const inRot = (A, x, z, pad = 0) => { const [lx, lz] = toLocal(A, x, z); return Math.abs(lx) < A.hw + pad && Math.abs(lz) < A.hd + pad; };
  const inShell = (A, x, z, pad = 0) => { const [lx, lz] = toLocal(A, x, z); return Math.abs(lx) < A.sw + pad && Math.abs(lz) < A.sd + pad; };
  // lưới khoảng cách 2,5 m → độ cao mặt đất (tra nhanh mỗi khung hình)
  const GR = 2.5, GX0 = ZN.x0 - 8, GZ0 = ZN.z0 - 6, NX = Math.ceil((ZN.x1 - GX0) / GR) + 1, NZ = Math.ceil((ZN.z1 - GZ0) / GR) + 1, D = new Float32Array(NX * NZ);
  for(let j = 0; j < NZ; j++) for(let i = 0; i < NX; i++) D[j * NX + i] = sdLand(GX0 + i * GR, GZ0 + j * GR);
  const DL = 16, YD = -6;
  const dAt = (x, z) => { const fx = (x - GX0) / GR, fz = (z - GZ0) / GR, i = Math.floor(fx), j = Math.floor(fz); if(i < 0 || j < 0 || i >= NX - 1 || j >= NZ - 1) return 99; const u = fx - i, v = fz - j, k = j * NX + i; return (D[k] * (1 - u) + D[k + 1] * u) * (1 - v) + (D[k + NX] * (1 - u) + D[k + NX + 1] * u) * v; };
  const hOf = d => d <= 0 ? Y : lerp(Y, YD, Math.min(1, d / DL));
  // độ cao mặt đi nội suy theo ĐÚNG tam giác của lưới đất vẽ ra (trước nội suy khoảng cách → ven bờ chân lơ lửng 15–30 cm)
  const HG = new Float32Array(NX * NZ); for(let j = 0; j < NZ; j++) for(let i = 0; i < NX; i++){ const k = j * NX + i, x = GX0 + i * GR, z = GZ0 + j * GR; HG[k] = AQ.some(A => inShell(A, x, z, 1.5)) ? -7 : hOf(D[k]); }
  const hLand = (x, z) => { const fx = (x - GX0) / GR, fz = (z - GZ0) / GR, i = Math.floor(fx), j = Math.floor(fz); if(i < 0 || j < 0 || i >= NX - 1 || j >= NZ - 1) return null; const k = j * NX + i;
    if(Math.min(D[k], D[k + 1], D[k + NX], D[k + NX + 1]) > DL) return null; const u = fx - i, v = fz - j, a = HG[k], b = HG[k + 1], c = HG[k + NX], d = HG[k + NX + 1];
    return u + v <= 1 ? a + (b - a) * u + (c - a) * v : d + (c - d) * (1 - u) + (b - d) * (1 - v); };
  EXTL.push({x0:GX0, x1:ZN.x1, z0:GZ0, z1:ZN.z1, h:hLand, name:'Ốc đảo Palm Dubai'});
  { const pos = [], col = [], idx = [], map = new Int32Array(NX * NZ).fill(-1), c = new THREE.Color(), SAND = new THREE.Color(0xf1e3c0), WET = new THREE.Color(0xc4ae84), G1 = new THREE.Color(0x7fbf55), G2 = new THREE.Color(0x9ccf68);
    const vid = (i, j) => { const k = j * NX + i; if(map[k] >= 0) return map[k]; const x = GX0 + i * GR, z = GZ0 + j * GR, d = D[k];
      if(d > 0) c.copy(SAND).lerp(WET, Math.min(1, d / 4)); else if(d > -4) c.copy(SAND); else c.copy(G1).lerp(G2, Math.sin(x * .07) * Math.cos(z * .05) * .5 + .5);
      map[k] = pos.length / 3; pos.push(x, HG[k], z); col.push(c.r, c.g, c.b); return map[k]; };
    for(let j = 0; j < NZ - 1; j++) for(let i = 0; i < NX - 1; i++){ const k = j * NX + i; if(Math.min(D[k], D[k + 1], D[k + NX], D[k + NX + 1]) > DL) continue;
      const a = vid(i, j), b = vid(i + 1, j), cc = vid(i, j + 1), d = vid(i + 1, j + 1); idx.push(a, cc, b, b, cc, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.92})); m.receiveShadow = true; m.userData.dynamic = true; m.userData.noFar = true; scene.add(m); }

  /* ============================== 2. VẬT LIỆU ============================== */
  const MAT = {
    white:sm(0xf8f6f1, .55), cobalt:sm(0x1f5fbf, .45), cream:sm(0xe8dcc4, .6), marble:sm(0xf2efe9, .25, .05), dark:sm(0x22262c, .5, .3), steel:sm(0xd0d6dd, .3, .85), gold:sm(0xd9a63a, .3, .85),
    teak:AK.makeWoodMaterial({col:'#8a5a32', seed:31}), stone:AK.makeStoneMaterial({col:'#efe9dc', joint:'#c9c0ae', seed:33}),
    glass:new THREE.MeshStandardMaterial({color:0x9fd2f5, roughness:.04, metalness:.7, transparent:true, opacity:.32, depthWrite:false, side:THREE.DoubleSide}),
    aqua:new THREE.MeshStandardMaterial({color:0x2a8fb8, roughness:.05, metalness:.3, transparent:true, opacity:.42, depthWrite:false, side:THREE.DoubleSide}),
    seaC:new THREE.MeshStandardMaterial({color:0x1a6f8f, emissive:0x0a3a4f, emissiveIntensity:.6, roughness:.2, transparent:true, opacity:.82, depthWrite:false, side:THREE.DoubleSide}),
    pool:new THREE.MeshStandardMaterial({color:0x35c6e8, roughness:.05, metalness:.1, transparent:true, opacity:.88, depthWrite:false}),
    deep:new THREE.MeshStandardMaterial({color:0x0b5d7d, emissive:0x05324a, emissiveIntensity:.5, roughness:.3, transparent:true, opacity:.93, depthWrite:false, side:THREE.BackSide}),
    green:sm(0x2f8f4f, .7), awning:sm(0xff7b54, .6), navy:sm(0x18304f, .5), sand:sm(0xd9c49a, .8) };
  MAT.teak.userData.tileM = 2.4; MAT.stone.userData.tileM = 3;
  const KX = Kit(), CLUBS = [], FOODP = [];   // CLUBS/FOODP: vị trí cho bot Pha 9

  /* ============================== 3. ĐƯỜNG & CẦU (không đường cụt) ============================== */
  const RP = [], RC = [], RI = [], pc = new THREE.Color(), ROADL = [], VSEG = [], r1 = v => Math.round(v * 10) / 10;   // VSEG → W.V2ROADS (sổ đường chung V2)
  const ribbon = (pts, w, col, y = Y + .02) => { const S2 = []; for(let i = 0; i < pts.length - 1; i++){ const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0); for(let t = 0; t < L; t += 2.5) S2.push([x0 + (x1 - x0) * t / L, z0 + (z1 - z0) * t / L]); } S2.push(pts[pts.length - 1]);
    pc.set(col); let prev = -1; for(let i = 0; i < S2.length; i++){ const [x, z] = S2[i], a = S2[Math.max(0, i - 1)], b = S2[Math.min(S2.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l, base = RP.length / 3;
      RP.push(x + nx * w / 2, y, z + nz * w / 2, x - nx * w / 2, y, z - nz * w / 2); RC.push(pc.r, pc.g, pc.b, pc.r, pc.g, pc.b); if(prev >= 0) RI.push(prev, base, prev + 1, prev + 1, base, base + 1); prev = base; }
    for(let i = 0; i < pts.length - 1; i++) VSEG.push([r1(pts[i][0]), r1(pts[i][1]), r1(pts[i + 1][0]), r1(pts[i + 1][1])]);
    const xs = S2.map(p => p[0]), zs = S2.map(p => p[1]); ROADL.push({pts:S2, hw:w / 2, bb:[Math.min(...xs) - w, Math.max(...xs) + w, Math.min(...zs) - w, Math.max(...zs) + w]}); };
  const roadNear = (x, z, m) => ROADL.some(L => x > L.bb[0] - m && x < L.bb[1] + m && z > L.bb[2] - m && z < L.bb[3] + m && segD(x, z, L.pts) < L.hw + m);
  const ROAD = 0x3a3d42;
  ribbon([[436, 538], [864, 538]], 9, ROAD);                                                                            // đại lộ Bắc
  const crP = []; for(let a = -CR.amax + .03; a <= CR.amax - .03 + 1e-9; a += .01) crP.push(atPolar(CR.road, a)); ribbon(crP, 8, ROAD);   // đường vành trăng khuyết
  for(const P0 of [crP[0], crP[crP.length - 1]]) ribbon([P0, [P0[0], 538]], 8, ROAD);                                // 2 mũi vành nối đại lộ Bắc → vòng lớn
  ribbon([[625, 538], [625, 948], [637.5, 959]], 8, ROAD); ribbon([[675, 538], [675, 948], [662.5, 959]], 8, ROAD);   // 2 đại lộ thân cọ
  { const P = []; for(let i = 0; i <= 48; i++){ const a = i / 48 * 6.2832; P.push([650 + Math.cos(a) * 16, 968 + Math.sin(a) * 16]); } ribbon(P, 8, ROAD); }   // vòng xuyến
  for(const F of FRONDS) ribbon([[F.s < 0 ? 625 : 675, F.z0], ...F.pts], 8, ROAD);
  ribbon([[256, 900], [C.x - Math.sqrt(CR.road ** 2 - 20 ** 2), 900]], 8, ROAD);                                     // cổng G9 → đường vành
  ribbon([[450, 524], [450, 538]], 9, ROAD);                                                                            // cổng G7 → đại lộ Bắc
  const BRIDGE = (x0, z0, x1, z1, w, y0, y1, arch, label, lamps = false) => { const L = Math.hypot(x1 - x0, z1 - z0), N = Math.max(4, Math.ceil(L / 2.5)), ry = Math.atan2(x1 - x0, z1 - z0), nx = Math.cos(ry), nz = -Math.sin(ry), yAt = t => lerp(y0, y1, t) + Math.sin(Math.PI * t) * arch;
    VSEG.push([r1(x0), r1(z0), r1(x1), r1(z1)]);
    for(let i = 0; i < N; i++){ const t = (i + .5) / N, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, y = yAt(t); KX.add(B(w, .45, L / N + .06), MAT.stone, x, y - .22, z, 0, ry, 0); addPlat(x, z, ry, w / 2 - .1, L / N / 2 + .03, y); }
    for(const s of [-1, 1]){ for(let i = 0; i <= N; i++){ const t = i / N; KX.add(B(.12, 1.1, .12), MAT.steel, x0 + (x1 - x0) * t + nx * s * (w / 2 - .1), yAt(t) + .55, z0 + (z1 - z0) * t + nz * s * (w / 2 - .1)); }
      for(let i = 0; i < N; i++){ const t = (i + .5) / N; KX.add(B(.08, .08, L / N + .02), MAT.steel, x0 + (x1 - x0) * t + nx * s * (w / 2 - .1), yAt(t) + 1.1, z0 + (z1 - z0) * t + nz * s * (w / 2 - .1), 0, ry, 0); }
      addSeg(x0 + nx * s * (w / 2), z0 + nz * s * (w / 2), x1 + nx * s * (w / 2), z1 + nz * s * (w / 2), .15, Math.min(y0, y1) - 8, Math.max(y0, y1) + arch + 3, label); }
    for(let t = .2; t < .9; t += .3){ const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, y = yAt(t); KX.add(new THREE.CylinderGeometry(.8, 1, y + 6, 10), MAT.stone, x, (y - 6) / 2, z); }
    if(lamps && W.lampPost) for(let d = 8; d < L - 4; d += 16){ const t = d / L, y = yAt(t); for(const s of [-1, 1]){ try{ const before = scene.children.length; W.lampPost(x0 + (x1 - x0) * t + nx * s * (w / 2 + .3), z0 + (z1 - z0) * t + nz * s * (w / 2 + .3)); for(let k = before; k < scene.children.length; k++) scene.children[k].position.y += y; }catch(e){} } }
    return {yAt}; };
  // cầu vòm mũi mỗi nhánh lá → đường vành (khép vòng mọi nhánh, du thuyền đi dưới)
  for(const F of FRONDS){ const T = F.pts[F.pts.length - 1], pT = polar(T[0], T[1]), a = pT.a, T2 = atPolar(pT.r + F.FW - 2, a), Bp = atPolar(CR.r0 + 2, a), Rd = atPolar(CR.road, a);
    F.tipA = a; ribbon([T, T2], 7, ROAD); BRIDGE(T2[0], T2[1], Bp[0], Bp[1], 7, Y, Y, 1.4, `🌉 Lan can cầu mũi nhánh ${F.id}`); ribbon([Bp, Rd], 7, ROAD); }
  // cổng G7 (CBD Nam 450,460) và G9 (Wonderland Đông 220,900) – cao +2
  BRIDGE(450, 458, 450, 524, 10, 2, Y, .8, '🌉 Lan can cầu G7 – đi thẳng sang River Tech CBD', true);
  BRIDGE(218, 900, 256, 900, 9, 2, Y, .5, '🌉 Lan can cầu G9 – đi thẳng sang Wonderland', true);
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(RP, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(RC, 3)); g.setIndex(RI); g.computeVertexNormals(); g.computeBoundingSphere();
    // noFar: lưới đường phẳng trải cả đảo – không để bộ ẩn-vật-ở-xa coi là "tấm mỏng" rồi ẩn cả mạng đường khi camera cách tâm > 300 m
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.9, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2})); m.receiveShadow = true; m.userData.dynamic = true; m.userData.noFar = true; scene.add(m); }
  for(const [x, z, ry, t2] of [[450, 527, 0, 'Cổng G7 · ↑ River Tech CBD'], [259, 900, Math.PI / 2, 'Cổng G9 · ← Wonderland']]){
    for(const s of [-1, 1]){ const ox = Math.cos(ry) * s * 6.4, oz = -Math.sin(ry) * s * 6.4; KX.add(new THREE.CylinderGeometry(.5, .6, 8, 12), MAT.gold, x + ox, Y + 4, z + oz); addSeg(x + ox, z + oz, x + ox, z + oz, .6, Y - 1, Y + 8); }
    KX.add(B(13.6, .9, .9), MAT.gold, x, Y + 8.2, z, 0, ry, 0);
    const t = signTex(1024, 200, '#0b3d5c', [['🌴 THE QC PALM DUBAI', `900 70px ${FONT}`, '#ffd23f', .42], [t2, `600 40px ${FONT}`, '#fff', .82]]); sign(t, 11, 2.1, x, Y + 6.6, z, ry, .55); }

  /* ============================== 4. NHÀ & QUYỀN SỞ HỮU ============================== */
  if(!Array.isArray(S.ownedEstates)) S.ownedEstates = [];
  const owns = id => S.ownedEstates.some(e => e && e.id === id);
  const CLS = {
    t:{name:'Nhà phố Santorini', icon:'🏠', price:2500, w:8, d:10, h:6.6, sp:11, per:6, slab:0},
    d:{name:'Duplex kính', icon:'🏡', price:12000, w:12, d:14, h:7.4, sp:19, per:5, slab:0},
    v:{name:'Biệt thự hồ bơi', icon:'🏖️', price:35000, w:18, d:18, h:8, sp:26, per:4, slab:0},
    m:{name:'Siêu biệt thự bến du thuyền', icon:'🛥️', price:85000, w:26, d:22, h:11.4, sp:36, per:3, slab:4.2},
    p:{name:'Dinh thự Đế Vương', icon:'👑', price:250000, w:50, d:36, h:14.6, sp:0, per:0, slab:4.8} };
  const FCLS = ['t', 'd', 'v', 'm'], HOUSES = [], START = 14;
  for(const F of FRONDS){ const cls = FCLS[F.k], K = CLS[cls], P = F.pts, cum = [0]; for(let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const at = s => { let i = 1; while(i < P.length - 1 && cum[i] < s) i++; const t = clamp((s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1), 0, 1), dx = P[i][0] - P[i - 1][0], dz = P[i][1] - P[i - 1][1], l = Math.hypot(dx, dz) || 1; return {x:lerp(P[i - 1][0], P[i][0], t), z:lerp(P[i - 1][1], P[i][1], t), tx:dx / l, tz:dz / l}; };
    const total = cum[cum.length - 1]; let no = 0; F.at = at; F.gapS = []; F.total = total; F.lastS = START;
    for(let i = 0; i < K.per; i++){ const s = START + K.sp / 2 + i * K.sp; if(s + K.w / 2 > total - 4) break; const q = at(s); F.gapS.push(s - K.sp / 2);
      for(const side of [-1, 1]){ const nx = -q.tz * side, nz = q.tx * side, off = 5.5 + K.d / 2, x = q.x + nx * off, z = q.z + nz * off;
        HOUSES.push({id:`${F.id}-${String(++no).padStart(2, '0')}`, cls, x, z, rot:Math.atan2(-nx, -nz), door:{x:q.x + nx * 4.8, z:q.z + nz * 4.8}, F}); } F.lastS = s + K.sp / 2; } }
  for(const H of PAL){ const [dx, dz] = atPolar(CR.road + 4.6, H.a); H.door = {x:dx, z:dz}; HOUSES.push(H); }
  // mái / tầng trên: InstancedMesh theo hạng (ẩn đúng căn người chơi đang ở trong)
  const ROOFS = {}, nonIdx = g => { g = g.index ? g.toNonIndexed() : g; for(const k of Object.keys(g.attributes)) if(k !== 'position' && k !== 'normal') g.deleteAttribute(k); return g; };
  const roofGeo = {
    t:mergeGeometries([nonIdx(new THREE.SphereGeometry(2.2, 16, 8, 0, 6.2832, 0, Math.PI / 2).translate(1.2, 6.6, -1)), nonIdx(B(8.3, .3, 10.3).translate(0, 6.75, 0))], false),
    d:B(12.6, .45, 14.6).translate(0, 7.62, 0), v:B(19, .5, 19).translate(0, 8.25, 0), m:B(27, .6, 23).translate(0, 11.7, 0), p:B(51, .8, 37).translate(0, 15, 0) };
  const roofMat = {t:MAT.cobalt, d:sm(0x9a8a74, .6), v:sm(0x6b5844, .7), m:sm(0x2a2f36, .4, .3), p:sm(0xc7a96b, .4, .5)};
  for(const k of Object.keys(CLS)){ const L = HOUSES.filter(h => h.cls === k); if(!L.length) continue; const im = new THREE.InstancedMesh(roofGeo[k], roofMat[k], L.length);
    L.forEach((H, i) => { im.setMatrixAt(i, mtx(H.x, Y, H.z, H.rot)); H.ri = i; }); im.castShadow = true; im.receiveShadow = true; im.userData.dynamic = true; im.computeBoundingSphere(); scene.add(im); ROOFS[k] = im; }
  const wallM = {t:MAT.white, d:MAT.cream, v:MAT.marble, m:MAT.white, p:MAT.marble}, T = .3, PIERS = [];
  for(const H of HOUSES){ const K = CLS[H.cls], w = K.w, d = K.d, h = K.h, wm = wallM[H.cls], door = H.cls === 'p' ? 4 : 2.2;
    const L = (lx, lz, sx, sy, sz, m, y = Y) => { const [x, z] = local(H, lx, lz); KX.add(B(sx, sy, sz), m, x, y + sy / 2, z, 0, H.rot, 0); };
    const SG = (lx0, lz0, lx1, lz1, y0 = Y - 1, y1 = Y + h, msg) => { const a = local(H, lx0, lz0), b = local(H, lx1, lz1); return addSeg(a[0], a[1], b[0], b[1], T / 2 + .02, y0, y1, msg); };
    const SOLID = (lx, lz, sx, sz, y0 = Y - 1, y1 = Y + 4) => { SG(lx - sx / 2, lz - sz / 2, lx + sx / 2, lz - sz / 2, y0, y1); SG(lx - sx / 2, lz + sz / 2, lx + sx / 2, lz + sz / 2, y0, y1); SG(lx - sx / 2, lz - sz / 2, lx - sx / 2, lz + sz / 2, y0, y1); SG(lx + sx / 2, lz - sz / 2, lx + sx / 2, lz + sz / 2, y0, y1); };
    const FG = (y0, hh) => { const a = door / 2 + .5, b = w / 2 - .4; for(const s of [-1, 1]) L(s * (a + b) / 2, d / 2 + .12, b - a, hh, .08, MAT.glass, y0); };
    // vỏ nhà: mặt +z cục bộ là mặt tiền (quay ra đường), cửa giữa
    L(0, -d / 2, w, h, T, wm); SG(-w / 2, -d / 2, w / 2, -d / 2);
    for(const s of [-1, 1]){ L(s * w / 2, 0, T, h, d, wm); SG(s * w / 2, -d / 2, s * w / 2, d / 2); }
    for(const s of [-1, 1]){ const a = door / 2, b = w / 2; L(s * (a + b) / 2, d / 2, b - a, h, T, wm); SG(s * a, d / 2, s * b, d / 2); }
    L(0, d / 2, door + .1, h - 2.6, T, wm, Y + 2.6);
    { const [x, z] = local(H, 0, 0); addPlat(x, z, H.rot, w / 2, d / 2, Y + .12); KX.add(B(w, .12, d), H.cls === 'd' || H.cls === 'm' ? MAT.teak : MAT.marble, x, Y + .06, z, 0, H.rot, 0); }
    // cửa khoá với người chưa sở hữu (đoạn chắn ở ô cửa – bật/tắt bằng y0)
    H.lock = SG(-door / 2, d / 2, door / 2, d / 2, Y - 1, Y + 3, `🔒 ${K.name} ${H.id} đang rao bán – bấm E ở biển bán trước cửa để xem / mua`); H.lockY0 = Y - 1; if(owns(H.id)) H.lock.y0 = 1e9;
    if(H.cls === 't'){ for(const s of [-1, 1]) L(s * 2.3, d / 2 + .05, 1.2, 1.3, .1, MAT.cobalt, Y + 3.8); L(0, d / 2 + .05, door + .3, .2, .1, MAT.cobalt, Y + 2.6); L(-w / 2 + 1.2, d / 2 + .5, 1.6, .3, .6, MAT.green); SOLID(-w / 2 + 1.2, d / 2 + .5, 1.6, .6, Y - 1, Y + .3); L(0, -d / 2 - 1.5, w - 1, .1, 2.6, MAT.teak, Y); { const [tx, tz] = local(H, 0, -d / 2 - 1.5); addPlat(tx, tz, H.rot, (w - 1) / 2 + .05, 1.35, Y + .1); } }
    if(H.cls === 'd'){ L(0, d / 2 + .05, w - 1, 2.4, .08, MAT.glass, Y + 4.4); L(0, -d / 2 - 2.2, 4, .1, 3, MAT.pool, Y + .02); L(0, -d / 2 - 2.2, 5, .06, 4, MAT.stone, Y); SOLID(0, -d / 2 - 2.2, 4, 3, Y - 1, Y + .9); L(-w / 2 - 2.5, 2, 4.6, 2.6, 6, MAT.cream); SOLID(-w / 2 - 2.5, 2, 4.6, 6); }
    if(H.cls === 'v'){ FG(Y + 1, 3); L(0, -d / 2 - 2.6, 10, .1, 3.6, MAT.pool, Y + .02); L(0, -d / 2 - 2.6, 11, .06, 4.6, MAT.stone, Y); for(let i = 0; i < 3; i++) L(7.5, -d / 2 - 1.2 - i * 1.2, 1.9, .35, .8, MAT.white); SOLID(0, -d / 2 - 2.6, 10, 3.6, Y - 1, Y + .9); SOLID(7.5, -d / 2 - 2.4, 1.9, 3.2, Y - 1, Y + .4); }
    if(H.cls === 'm'){ FG(Y + .5, h - 1); for(const f of [K.slab, 8]) L(0, 0, w + 1, .3, d + 2, MAT.white, Y + f); L(0, -d / 2 - 2, w - 8, .1, 3.2, MAT.pool, Y + .02); L(0, -d / 2 - 2, w - 7, .06, 4, MAT.stone, Y); SOLID(0, -d / 2 - 2, w - 8, 3.2, Y - 1, Y + .9);
      L(-w / 2 - 3, 3, 5, 3, 8, MAT.glass); SOLID(-w / 2 - 3, 3, 5, 8);
      const [px, pz] = local(H, w / 2 - 3, -d / 2 - 9); L(w / 2 - 3, -d / 2 - 9, 3, .4, 10, MAT.teak, Y - .3); addPlat(px, pz, H.rot, 1.5, 5, Y + .1); PIERS.push({H, lx:w / 2 - 3, lz:-d / 2 - 9, hw:1.5, hd:5, yacht:[w / 2 - 3 - 8.7, -d / 2 - 10.5, Math.PI / 2, .6]}); }
    if(H.cls === 'p'){ FG(Y + .6, h - 1.2); for(const f of [K.slab, 9.6]) L(0, 0, w + 2, .35, d + 2, MAT.marble, Y + f); L(0, -d / 2 - 2.75, w - 16, .1, 4.5, MAT.pool, Y + .02); L(0, -d / 2 - 2.75, w - 14, .06, 5.5, MAT.stone, Y); SOLID(0, -d / 2 - 2.75, w - 16, 4.5, Y - 1, Y + .9);
      for(const lx of [-18, -12, -6, 6, 12, 18]){ const [x, z] = local(H, lx, d / 2 + 1.2); KX.add(new THREE.CylinderGeometry(.45, .5, K.slab, 14), MAT.marble, x, Y + K.slab / 2, z); addSeg(x, z, x, z, .5, Y - 1, Y + K.slab); }
      // sân trực thăng trên mái
      const [hx, hz] = local(H, 0, 0), top = Y + h + .8; addPlat(hx, hz, H.rot, w / 2 + .5, d / 2 + .5, top);
      KX.add(new THREE.CylinderGeometry(7, 7, .06, 40), MAT.dark, hx, top + .03, hz); KX.add(new THREE.CylinderGeometry(6.2, 6.2, .07, 40), MAT.gold, hx, top + .035, hz); KX.add(new THREE.CylinderGeometry(5.7, 5.7, .08, 40), MAT.dark, hx, top + .04, hz);
      L(-1.6, 0, .6, .1, 5, MAT.gold, top); L(1.6, 0, .6, .1, 5, MAT.gold, top); L(0, 0, 2.6, .1, .6, MAT.gold, top);
      SG(-w / 2 - .5, -d / 2 - .5, w / 2 + .5, -d / 2 - .5, top - .5, top + 3, '🚁 Lan can sân thượng'); SG(-w / 2 - .5, d / 2 + .5, w / 2 + .5, d / 2 + .5, top - .5, top + 3, '🚁 Lan can sân thượng'); for(const s of [-1, 1]) SG(s * (w / 2 + .5), -d / 2 - .5, s * (w / 2 + .5), d / 2 + .5, top - .5, top + 3, '🚁 Lan can sân thượng');
      for(const s of [-1, 1]) L(0, s * (d / 2 + .5), w + 1, 1.1, .08, MAT.glass, top); for(const s of [-1, 1]) L(s * (w / 2 + .5), 0, .08, 1.1, d + 1, MAT.glass, top);
      // bến siêu du thuyền + thuỷ cung ngầm phía biển
      const [px, pz] = local(H, 14, -d / 2 - 16); L(14, -d / 2 - 16, 4, .4, 22, MAT.teak, Y - .3); addPlat(px, pz, H.rot, 2, 11, Y + .1); PIERS.push({H, lx:14, lz:-d / 2 - 16, hw:2, hd:11, yacht:[20, -d / 2 - 20, 0, 1]});
      const A = AQ.find(q => q.H === H), al = (lx, lz, sx, sy, sz, m, y) => L(-14 + lx, AQZ + lz, sx, sy, sz, m, y);
      al(0, 0, 16, .3, 12, MAT.marble, -3.7); al(0, 0, 16, .1, 12, MAT.seaC, -.4); for(const s of [-1, 1]){ al(0, s * 6, 16, 3.3, .1, MAT.aqua, -3.6); al(s * 8, 0, .1, 3.3, 12, MAT.aqua, -3.6); }
      al(0, 0, 6, .45, 1, MAT.navy, -3.4); KX.add(B(30, 5.8, 24), MAT.deep, A.x, -3.3, A.z, 0, H.rot, 0); KX.add(B(29.6, .1, 23.6), MAT.sand, A.x, -6.15, A.z, 0, H.rot, 0);   // khối nước biển bao quanh + đáy cát
      addPlat(A.x, A.z, H.rot, 7.8, 5.8, -3.4); const c4 = [[-8, -6], [8, -6], [8, 6], [-8, 6]].map(([a, b]) => local(H, -14 + a, AQZ + b));
      for(let i = 0; i < 4; i++){ const a = c4[i], b = c4[(i + 1) % 4]; addSeg(a[0], a[1], b[0], b[1], .15, -6, 0, '🐠 Vách kính thuỷ cung'); }
      const xs = c4.map(p => p[0]), zs = c4.map(p => p[1]); A.box = {x0:Math.min(...xs) + 1.2, x1:Math.max(...xs) - 1.2, z0:Math.min(...zs) + 1.2, z1:Math.max(...zs) - 1.2, y1:-.8};
      A.exit = local(H, -21, -21);
      INTER.push({x:A.x, z:A.z, r:7, prio:.9, when:() => W.P && W.P.y < -1, label:'⬆ Lên dinh thự (E)', action:() => teleport(A.exit[0], A.exit[1], H.x, H.z)});
      const [ex, ez] = local(H, -21, -22.5); INTER.push({x:ex, z:ez, r:2.6, prio:.8, when:() => owns(H.id) && W.P && W.P.y > 0, label:'🐠 Thang xuống thuỷ cung ngầm (E)', action:() => goAqua(H)}); }
    // biển rao bán ở vỉa hè trước cửa
    H.signPos = local(H, w / 2 - 1, d / 2 + 1); }
  for(const Q of PIERS){ const {H, lx, lz, hw, hd} = Q, sg = (a, b, c, d2, msg) => { const p = local(H, a, b), q = local(H, c, d2); addSeg(p[0], p[1], q[0], q[1], .12, Y - 1, Y + 3, msg); };
    sg(lx - hw, lz - hd, lx - hw, lz + hd, '🛥️ Mép cầu cảng'); sg(lx + hw, lz - hd, lx + hw, lz + hd, '🛥️ Mép cầu cảng'); sg(lx - hw, lz - hd, lx + hw, lz - hd, '🛥️ Cuối cầu cảng'); }
  function goAqua(H){ const A = AQ.find(q => q.H === H); if(!A) return; const [x, z] = local(H, -14, AQZ + 3); teleport(x, z, A.x, A.z); toast('🐠 Thuỷ cung ngầm dưới biển – cá san hô bơi quanh vách kính! Bấm E để lên lại dinh thự.', 4200); }
  // biển bán: InstancedMesh theo hạng (ẩn khi đã sở hữu)
  const SIGNS = {};
  for(const k of Object.keys(CLS)){ const K = CLS[k], L = HOUSES.filter(h => h.cls === k); if(!L.length) continue;
    const tex = signTex(512, 300, '#0b3d5c', [[`${K.icon} ĐANG BÁN`, `900 62px ${FONT}`, '#ffd23f', .24], [K.name, `700 ${K.name.length > 20 ? 30 : 40}px ${FONT}`, '#fff', .55], [`${fmt(K.price)} 💰 · bấm E`, `700 46px ${FONT}`, '#9fe7ff', .84]]);
    const g = mergeGeometries([new THREE.PlaneGeometry(1.8, 1.05).translate(0, 1.75, 0), B(.08, 1.25, .08).translate(0, .62, -.03)], false);
    const im = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({map:tex, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:.35, side:THREE.DoubleSide}), L.length);
    L.forEach((H, i) => { H.si = i; im.setMatrixAt(i, owns(H.id) ? ZERO : mtx(H.signPos[0], Y, H.signPos[1], H.rot)); }); im.userData.dynamic = true; im.computeBoundingSphere(); scene.add(im); SIGNS[k] = im; }
  const setLock = (H, on) => { H.lock.y0 = on ? H.lockY0 : 1e9; };
  const setOwnedVisual = H => { const im = SIGNS[H.cls]; im.setMatrixAt(H.si, ZERO); im.instanceMatrix.needsUpdate = true; setLock(H, false); };
  const isInside = (H, pad = 0) => { const p = W.P, K = CLS[H.cls]; if(!p) return false; const [lx, lz] = toLocal(H, p.x, p.z); return Math.abs(lx) < K.w / 2 + pad && Math.abs(lz) < K.d / 2 + pad && p.y < Y + K.h; };
  // nội thất theo hạng: 1 bộ dùng chung, dời tới đúng căn người chơi đang đứng gần
  const INT = {};
  for(const k of Object.keys(CLS)){ const K = CLS[k], g = new THREE.Group(); g.visible = false; g.userData.dynamic = true; scene.add(g); const ki = Kit(), w = K.w, d = K.d;
    const A = (sx, sy, sz, m, lx, ly, lz) => ki.add(B(sx, sy, sz), m, lx, ly + sy / 2, lz);
    A(2.6, .45, .9, MAT.navy, -w / 2 + 2, .12, d / 2 - 3); A(2.6, .5, .2, MAT.navy, -w / 2 + 2, .57, d / 2 - 3.55); A(1.2, .42, .7, MAT.teak, -w / 2 + 2, .12, d / 2 - 1.7);   // sofa + bàn trà
    A(Math.min(4, w - 3), .9, .6, MAT.white, w / 2 - 2.6, .12, -d / 2 + .6); A(Math.min(4, w - 3), .05, .62, MAT.dark, w / 2 - 2.6, 1.02, -d / 2 + .6);   // bếp
    A(2, .5, 2.2, MAT.white, -w / 2 + 1.8, .12, -d / 2 + 1.6); A(2, .6, .3, MAT.teak, -w / 2 + 1.8, .4, -d / 2 + .5);   // giường
    A(1.6, .9, .08, MAT.dark, w / 2 - .4, 1.0, d / 2 - 3); A(.4, .5, 1.6, MAT.teak, w / 2 - .5, .12, d / 2 - 3);   // TV + kệ
    A(1.4, .75, .9, MAT.teak, 0, .12, -d / 2 + 3.2); for(const s of [-1, 1]) A(.45, .45, .45, MAT.navy, s * 1.1, .12, -d / 2 + 3.2);   // bàn ăn
    if(k !== 't') ki.add(new THREE.SphereGeometry(.55, 14, 10), MAT.gold, 0, Math.min(K.h, K.slab || K.h) - 1.1, 0);   // đèn chùm
    ki.build(g, false);
    if(k === 'v' || k === 'm' || k === 'p'){ try{ AK.buildBilliardTable({}, 2.5, .12, 0, Math.PI / 2, 0x0d7a4f, 'interior', {parent:g}); }catch(e){} }
    INT[k] = g; }
  let cur = null, camSet = false, welcomed = false;
  const releaseCam = () => { if(camSet){ camSet = false; HOOK.camBox = null; } };
  function hideCur(){ if(!cur) return; INT[cur.cls].visible = false; if(cur.in){ ROOFS[cur.cls].setMatrixAt(cur.ri, mtx(cur.x, Y, cur.z, cur.rot)); ROOFS[cur.cls].instanceMatrix.needsUpdate = true; cur.in = false; } releaseCam(); cur = null; }
  HOOK.onFrame.push(() => { const p = W.P; if(!p) return;
    if(p.x < ZN.x0 - 40 || p.x > ZN.x1 + 10 || p.z < ZN.z0 - 70 || p.z > ZN.z1 + 10){ if(cur) hideCur(); return; }
    if(!welcomed && p.z > 526 && p.x > 252){ welcomed = true; toast('🌴 Chào mừng tới The QC Palm Dubai! Biển "ĐANG BÁN" trước mỗi căn nhà – bấm E để xem / mua. 🚝 Monorail chạy dọc thân cọ.', 5200); }
    if(p.y < -1){ const A = AQ.find(q => inRot(q, p.x, p.z, .5)); if(A && A.box){ if(cur) hideCur(); HOOK.camBox = A.box; camSet = true; return; } }
    let best = null, bd = 1e9; for(const H of HOUSES){ const d = (H.x - p.x) ** 2 + (H.z - p.z) ** 2; if(d < bd){ bd = d; best = H; } }
    if(best !== cur){ hideCur(); if(best && bd < 60 ** 2){ cur = best; const g = INT[cur.cls]; g.position.set(cur.x, Y, cur.z); g.rotation.y = cur.rot; g.visible = true; } }
    if(!cur) return releaseCam();
    const K = CLS[cur.cls], inside = isInside(cur), im = ROOFS[cur.cls];
    if(inside !== !!cur.in){ cur.in = inside; im.setMatrixAt(cur.ri, inside ? ZERO : mtx(cur.x, Y, cur.z, cur.rot)); im.instanceMatrix.needsUpdate = true; }
    if(inside){ const c4 = [local(cur, -K.w / 2, -K.d / 2), local(cur, K.w / 2, K.d / 2), local(cur, -K.w / 2, K.d / 2), local(cur, K.w / 2, -K.d / 2)], xs = c4.map(q => q[0]), zs = c4.map(q => q[1]);
      HOOK.camBox = {x0:Math.min(...xs) + .5, x1:Math.max(...xs) - .5, z0:Math.min(...zs) + .5, z1:Math.max(...zs) - .5, y1:Y + (K.slab ? K.slab - .35 : Math.min(K.h, 4.4) - .3)}; camSet = true; }
    else releaseCam(); });
  // menu mua / xem nhà
  const EXTRA = {t:'2 tầng · tường trắng mái vòm xanh coban kiểu đảo Hy Lạp · hiên gỗ sau nhà nhìn ra biển', d:'Đá kem + gỗ teak · mặt kính tầng trên · gara ô tô · hồ bơi Plunge Pool sau nhà',
    v:'Đá marble trắng · hồ bơi 10 × 3,6 m sát biển · ghế tắm nắng · phòng bida riêng', m:'3 tầng kính · hồ bơi vô cực · bến du thuyền riêng (có sẵn du thuyền) · gara kính siêu xe · phòng bida',
    p:'50 × 36 m · 3 tầng · sân trực thăng trên mái · thuỷ cung ngầm dưới biển · bến siêu du thuyền 24 m · hồ bơi vô cực sát biển · hàng cột marble'};
  function buyMenu(H){ const K = CLS[H.cls]; if(!ui || !ui.modal) return; const m = ui.modal(`${K.icon} ${K.name} · căn ${H.id}`), mine = owns(H.id);
    m.body.innerHTML = `<p class="muted">${EXTRA[H.cls]}</p><p>Giá: <b>${fmt(K.price)} 💰</b>${mine ? ' · <b style="color:#46d39a">✅ Bạn đang sở hữu căn này</b>' : ''}</p><p class="muted">Bạn đang sở hữu ${S.ownedEstates.length} bất động sản trên Palm Dubai – mua thêm không mất nhà cũ.</p><div class="row" style="gap:8px;flex-wrap:wrap"></div>`;
    const row = m.body.querySelector('.row'), btn = (t, f, pri) => { const b = document.createElement('button'); b.className = 'btn' + (pri ? ' pri' : ''); b.textContent = t; b.onclick = () => { m.close(); f(); }; row.appendChild(b); };
    if(!mine){ btn(`💳 Mua ${fmt(K.price)} 💰`, () => pay(K.price, `mua ${K.icon} <b>${K.name}</b> căn ${H.id}`, () => { if(owns(H.id)) return; S.ownedEstates.push({id:H.id, cls:H.cls, name:K.name, price:K.price, at:Date.now()}); save(); setOwnedVisual(H); toast(`🎉 Chúc mừng! ${K.name} ${H.id} là của bạn – cửa đã mở, vào nhà thôi!`, 5000); }), true);
      btn('👀 Xem nhà mẫu (60 giây)', () => { setLock(H, false); let t = 0; const f = dt => { t += dt || 1 / 60; if(owns(H.id)){ HOOK.onFrame.splice(HOOK.onFrame.indexOf(f), 1); return; } if(t > 60 && !isInside(H, 1.2)){ setLock(H, true); HOOK.onFrame.splice(HOOK.onFrame.indexOf(f), 1); toast('⏱ Hết giờ xem nhà mẫu – cửa đã khoá lại.', 2600); } }; HOOK.onFrame.push(f); toast('👀 Cửa mở 60 giây – mời vào xem nhà mẫu!', 3000); }); }
    else { btn('📍 Đặt làm nơi xuất hiện', () => { S.palmHome = H.id; save(); toast('📍 Lần sau vào game (chế độ V2) bạn sẽ xuất hiện trước căn nhà này.', 3500); }, true);
      if(H.cls === 'p'){ btn('🚁 Lên sân trực thăng', () => { const [x, z] = local(H, 9, 0); teleport(x, z, C.x, C.z); }); btn('🐠 Xuống thuỷ cung ngầm', () => goAqua(H)); } } }
  for(const H of HOUSES){ const K = CLS[H.cls]; INTER.push({x:H.signPos[0], z:H.signPos[1], r:2.4, prio:.8, get label(){ return owns(H.id) ? `🏠 Nhà của bạn · ${K.name} ${H.id} (E)` : `${K.icon} ${K.name} ${H.id} – ${fmt(K.price)} 💰 (E: xem / mua)`; }, action:() => buyMenu(H)}); }
  // cá san hô quanh thuỷ cung + du thuyền ở các bến riêng
  { const NF = 36, fish = new THREE.InstancedMesh(new THREE.ConeGeometry(.16, .6, 6).rotateX(Math.PI / 2), sm(0xffffff, .4), AQ.length * NF), c = new THREE.Color();
    // cá bơi vòng elip quanh vách kính (chỉ cập nhật khi người chơi đang ở trong thuỷ cung)
    const fishAt = (A, f, i) => { const lx = Math.cos(f.th) * f.r * 1.1, lz = Math.sin(f.th) * f.r * .85, [x, z] = local(A, lx, lz), tx = -Math.sin(f.th) * 1.1 * f.dir, tz = Math.cos(f.th) * .85 * f.dir, wx = Math.cos(A.rot) * tx + Math.sin(A.rot) * tz, wz = -Math.sin(A.rot) * tx + Math.cos(A.rot) * tz;
      fish.setMatrixAt(i, mtx(x, f.y + Math.sin(f.th * 3) * .25, z, Math.atan2(wx, wz))); };
    AQ.forEach((A, k) => { A.fish = []; for(let j = 0; j < NF; j++){ const f = {r:10 + R() * 3, th:R() * 6.28, dir:R() < .5 ? -1 : 1, w:.08 + R() * .12, y:-1.3 - R() * 4.2, i:k * NF + j}; A.fish.push(f); fishAt(A, f, f.i); fish.setColorAt(f.i, c.setHSL(R(), .85, .55)); } });
    fish.name = 'fish'; fish.userData.swimming = true; fish.userData.dynamic = true; fish.computeBoundingSphere(); fish.frustumCulled = false; scene.add(fish);
    HOOK.onFrame.push(dt => { const p = W.P; if(!p || p.y > -1 || p.x < ZN.x0 - 40 || p.x > ZN.x1) return; const A = AQ.find(q => inRot(q, p.x, p.z, 4)); if(!A) return; dt = Math.min(dt || 1 / 60, .1);
      for(const f of A.fish){ f.th += f.w * f.dir * dt; fishAt(A, f, f.i); } fish.instanceMatrix.needsUpdate = true; });
    // san hô: trong thuỷ cung (dọc vách kính) + ngoài đáy biển
    const coralG = mergeGeometries([nonIdx(new THREE.ConeGeometry(.22, 1.1, 6).translate(0, .55, 0)), nonIdx(new THREE.ConeGeometry(.16, .8, 6).rotateZ(.5).translate(.3, .45, 0)), nonIdx(new THREE.ConeGeometry(.16, .8, 6).rotateZ(-.5).translate(-.3, .45, .1)), nonIdx(new THREE.SphereGeometry(.28, 8, 6).translate(0, 1.15, 0))], false);
    const CP = []; for(const A of AQ){ for(let i = 0; i < 12; i++){ const t = i / 12, side = i % 4, lx = side < 2 ? (t * 2 - 1) * 7.2 : (side === 2 ? -7.3 : 7.3), lz = side < 2 ? (side ? 5.3 : -5.3) : (t * 2 - 1) * 5; CP.push([A, lx, lz, -3.4, .8 + R() * .5]); }
      for(let i = 0; i < 30; i++){ let lx, lz; do { lx = (R() - .5) * 28; lz = (R() - .5) * 22; } while(Math.abs(lx) < 9 && Math.abs(lz) < 7); CP.push([A, lx, lz, -6.1, 1 + R() * 1.4]); } }
    const coral = new THREE.InstancedMesh(coralG, sm(0xffffff, .75), CP.length); CP.forEach(([A, lx, lz, y, s], i) => { const [x, z] = local(A, lx, lz); coral.setMatrixAt(i, mtx(x, y, z, R() * 6.28, s)); coral.setColorAt(i, c.set([0xff6f61, 0xff9f43, 0xf368e0, 0xffd23f, 0x48dbfb, 0x1dd1a1][i % 6])); });
    coral.userData.dynamic = true; coral.computeBoundingSphere(); scene.add(coral);
    const yacht = mergeGeometries([B(6, 2.4, 24).translate(0, 1.2, 0), B(4.6, 2.6, 12).translate(0, 3.6, -2), B(3.4, 1.6, 6).translate(0, 5.6, -3)].map(nonIdx), false);
    const ym = new THREE.InstancedMesh(yacht, sm(0xf7f7f4, .25, .1), PIERS.length); PIERS.forEach((Q, i) => { const [lx, lz, r, sc] = Q.yacht, [x, z] = local(Q.H, lx, lz); ym.setMatrixAt(i, mtx(x, -.75, z, Q.H.rot + r, sc)); });
    ym.castShadow = true; ym.userData.dynamic = true; ym.computeBoundingSphere(); scene.add(ym); }

  /* ============================== 5. THÂN CỌ: Monorail · Phố ẩm thực · Beach Club · Marina Mall · Sky-Towers · Khách sạn ============================== */
  const MZ0 = 548, MZ1 = 1282, MY = 13;
  KX.add(B(2.4, 1.6, MZ1 - MZ0), MAT.white, 650, MY, (MZ0 + MZ1) / 2);
  for(let z = MZ0 + 6; z < MZ1 - 4; z += 22){ if(z > 882 && z < 928) continue; const gy = hLand(650, z) ?? YD; KX.add(new THREE.CylinderGeometry(.7, .9, MY - gy, 12), MAT.white, 650, (MY + gy) / 2, z); if(gy > 0) addSeg(650, z, 650, z, 1, gy - 1, MY); }
  KX.add(new THREE.CylinderGeometry(.7, .7, .6, 12), MAT.white, 650, MY - 1.1, 906);
  const MST = [{name:'Ga Palm Gateway', z:562, gz:562}, {name:'Ga Phố Ẩm Thực', z:782, gz:782}, {name:'Ga Vành Trăng Khuyết', z:1268, gz:1262}];
  for(const st of MST){ KX.add(B(9, .4, 26), MAT.white, 650, MY - 1.2, st.z); KX.add(B(9.6, .3, 27), MAT.glass, 650, MY + 3.4, st.z); for(const s of [-1, 1]) for(const dz of [-12, 12]) KX.add(B(.25, 4.4, .25), MAT.steel, 650 + s * 4.6, MY + 1.2, st.z + dz);
    sign(signTex(1024, 160, '#0b3d5c', [[`🚝 ${st.name}`, `800 64px ${FONT}`, '#fff', .5]]), 7, 1.1, 650, MY + 4.4, st.z - 13.6, Math.PI, .5);
    INTER.push({x:650, z:st.gz, r:4, prio:.85, label:`🚝 ${st.name} – đi Palm Monorail (E)`, action:() => monoMenu(st)}); }
  const mono = new THREE.Group(); mono.userData.dynamic = true; { const k = Kit(); for(let c = 0; c < 3; c++){ k.add(AK.roundedBox(2.8, 2.6, 9.2, .6, 2), MAT.white, 0, MY + 2.1, c * 9.6); k.add(B(2.86, .9, 8), MAT.navy, 0, MY + 2.4, c * 9.6); } k.build(mono); } mono.position.x = 650; scene.add(mono);
  { let z = MZ0 + 20, dir = 1, wait = 0, last = null; HOOK.onFrame.push(dt => { dt = Math.min(dt || 1 / 60, .1); if(wait > 0){ wait -= dt; return; } z += dir * 14 * dt;
      for(const st of MST) if(st !== last && Math.abs(z - st.z) < 14 * dt){ wait = 6; last = st; }
      if(z > MZ1 - 26){ z = MZ1 - 26; dir = -1; wait = 6; last = null; } if(z < MZ0 + 6){ z = MZ0 + 6; dir = 1; wait = 6; last = null; } mono.position.z = z - 9.6; }); }
  function monoMenu(from){ if(!ui || !ui.modal) return; const m = ui.modal(`🚝 ${from.name} · Palm Monorail`); m.body.innerHTML = '<p class="muted">Tàu điện một ray trên cao chạy dọc thân cọ ra tận Khách sạn Vòm Vương Miện. Vé 8 💰.</p><div class="grid"></div>'; const g = m.body.querySelector('.grid');
    for(const st of MST){ if(st === from) continue; const b = document.createElement('button'); b.className = 'btn'; b.textContent = `🚉 ${st.name}`; b.onclick = () => { m.close(); pay(8, `vé Monorail tới ${st.name}`, () => { teleport(656, st.gz, 656, st.gz + (st.z > 1000 ? 30 : 20)); toast(`🚝 Đã tới ${st.name}!`, 2500); }); }; g.appendChild(b); } }
  // phố ẩm thực dưới đường ray (z 600–840)
  { const FOOD = ['🦞 Hải sản Bình Phan', '🍣 Sushi Marina', '🌮 Taco Bay', '🍕 Pizza Palm', '🥙 Shawarma Dubai', '🍦 Gelato Beach', '🍜 Phở Ốc Đảo', '🥤 Trà sữa Coral'];
    FOOD.forEach((n, i) => { const z = 610 + i * 32, x = i % 2 ? 660 : 640; FOODP.push({x, z, n}); KX.add(B(6, 2.8, 4), MAT.cream, x, Y + 1.4, z); KX.add(B(7, .2, 5.4), MAT.awning, x, Y + 3.3, z + .4); KX.add(B(5.6, 1, .5), MAT.teak, x, Y + .5, z + 2.3);
      boxes.push({x0:x - 3, x1:x + 3, z0:z - 2, z1:z + 2.6, y0:Y - 1, y1:Y + 3.5});
      for(let t = 0; t < 2; t++){ const tz = z + 6 + t * 3.2; KX.add(new THREE.CylinderGeometry(.6, .6, .08, 16), MAT.white, x, Y + .75, tz); KX.add(new THREE.CylinderGeometry(.08, .1, .72, 8), MAT.dark, x, Y + .37, tz); for(const s of [-1, 1]){ KX.add(B(.45, .45, .45), MAT.navy, x + s * 1, Y + .22, tz); addSeg(x + s, tz, x + s, tz, .26, Y - 1, Y + .45); } addSeg(x, tz, x, tz, .65, Y - 1, Y + 1); }
      sign(signTex(512, 128, '#ff7b54', [[n, `800 44px ${FONT}`, '#fff', .52]]), 5, 1.25, x, Y + 3.95, z + 3.1, 0, .5);
      INTER.push({x, z:z + 3.6, r:2.2, prio:.85, label:`${n} – gọi món (15 💰, ⚡ đi nhanh 12 phút)`, action:() => pay(15, n, () => { buffGo('energy', 12); toast(`${n}: ngon tuyệt! ⚡ Đi nhanh hơn trong 12 phút.`, 3500); })}); }); }
  // 6 Beach Club ở mép thân cọ (giữa các nhánh lá): nhà club + hồ bơi + ghế tắm nắng + dù sát biển
  const UMB = [];
  { let n = 0;
    for(const z of [700, 780, 860]) for(const s of [-1, 1]){ const x = 650 + s * 41; n++; CLUBS.push({x, z, s, n});
      KX.add(B(10, 3.4, 12), MAT.white, x, Y + 1.7, z); KX.add(B(12, .25, 14), MAT.teak, x, Y + 3.5, z); boxes.push({x0:x - 5, x1:x + 5, z0:z - 6, z1:z + 6, y0:Y - 1, y1:Y + 3.6});
      KX.add(B(6, .1, 10), MAT.pool, x + s * 11, Y + .07, z); KX.add(B(7, .06, 11), MAT.stone, x + s * 11, Y + .03, z); boxes.push({x0:x + s * 11 - 3, x1:x + s * 11 + 3, z0:z - 5, z1:z + 5, y0:Y - 1, y1:Y + .9}, {x0:x + s * 18 - .95, x1:x + s * 18 + .95, z0:z - 4.9, z1:z + 4.9, y0:Y - 1, y1:Y + .4});
      for(let i = 0; i < 4; i++){ KX.add(B(1.9, .35, .8), MAT.white, x + s * 18, Y + .18, z - 4.5 + i * 3); if(i < 3) UMB.push([x + s * 18.4, z - 3 + i * 3]); }
      sign(signTex(512, 128, '#00a8a8', [[`🏝️ BEACH CLUB ${n}`, `900 50px ${FONT}`, '#fff', .52]]), 5, 1.25, x - s * 5.06, Y + 2.7, z, s < 0 ? Math.PI / 2 : -Math.PI / 2, .5);
      INTER.push({x:x - s * 6.6, z, r:2.6, prio:.8, label:`🍹 Beach Club ${n} – mocktail & hồ bơi (20 💰, ☕ thưởng quiz 15 phút)`, action:() => pay(20, `Beach Club ${n}`, () => { buffGo('coffee', 15); toast('🍹 Mocktail dừa mát lạnh – ☕ thưởng quiz +20% trong 15 phút!', 3500); })}); } }
  // Marina Mall (giữa 2 đại lộ, dưới đường ray) + 4 Palm Sky-Towers 60 m
  { KX.add(AK.roundedBox(36, 9, 38, 1.2, 2), MAT.glass, 650, Y + 4.5, 905); KX.add(B(36.4, .5, 38.4), MAT.white, 650, Y + 9.2, 905); KX.add(B(34, .4, 36), MAT.marble, 650, Y + .2, 905); boxes.push({x0:632, x1:668, z0:886, z1:924, y0:Y - 1, y1:Y + 9.5, msg:'🛍️ Marina Mall – lối vào ở mặt Bắc (bấm E)'});
    for(let i = 0; i < 4; i++) KX.add(B(5, 2.4, 3), [MAT.awning, MAT.cobalt, MAT.green, MAT.gold][i], 638 + i * 8, Y + 1.2, 910);
    sign(signTex(1024, 180, '#0b3d5c', [['🛍️ MARINA MALL', `900 80px ${FONT}`, '#ffd23f', .45], ['Thời trang · đồng hồ · đồ bơi · điện tử', `600 36px ${FONT}`, '#fff', .84]]), 14, 2.4, 650, Y + 7, 885.7, Math.PI, .55);
    INTER.push({x:650, z:883, r:3, prio:.8, label:'🛍️ Marina Mall – dạo mua sắm (E)', action:() => toast('🛍️ Marina Mall: thời trang, đồng hồ, đồ bơi, đồ công nghệ… Mẹo: mua nhà ở các nhánh lá để có chỗ ở sang!', 5000)});
    let fac = null; try{ fac = AK.makePBRFacade({cols:4, rows:4, glassCol:'#2a5a7a', frameCol:'#e9e4d8', seed:7}); }catch(e){}
    const TH = 60, TOW = [[608, 595], [692, 595], [608, 935], [692, 935]];
    TOW.forEach(([x, z], i) => { const g = B(22, TH, 22); if(fac){ try{ AK.facadeUV(g, 22, TH, fac); }catch(e){} } const tm = new THREE.Mesh(g, fac || MAT.white); tm.position.set(x, Y + TH / 2, z); tm.castShadow = tm.receiveShadow = true; scene.add(tm);
      KX.add(B(24, 1.2, 24), MAT.white, x, Y + TH + .6, z); boxes.push({x0:x - 11, x1:x + 11, z0:z - 11, z1:z + 11, y0:Y - 1, y1:Y + TH}); const top = Y + TH + 1.2; addPlat(x, z, 0, 12, 12, top);
      KX.add(B(10, .1, 6), MAT.pool, x, top + .02, z + 3); boxes.push({x0:x - 5, x1:x + 5, z0:z, z1:z + 6, y0:top - .5, y1:top + .9}); for(const s of [-1, 1]){ addSeg(x - 12, z + s * 12, x + 12, z + s * 12, .12, top - .5, top + 3, '🏙️ Lan can sân thượng'); addSeg(x + s * 12, z - 12, x + s * 12, z + 12, .12, top - .5, top + 3, '🏙️ Lan can sân thượng'); KX.add(B(24, 1.1, .08), MAT.glass, x, top + .55, z + s * 12); KX.add(B(.08, 1.1, 24), MAT.glass, x + s * 12, top + .55, z); }
      const dz = z < 800 ? 11.5 : -11.5; sign(signTex(1024, 160, '#0b3d5c', [[`🏙️ PALM SKY-TOWER ${i + 1}`, `900 64px ${FONT}`, '#fff', .5]]), 12, 1.9, x, Y + 5, z + dz, dz > 0 ? 0 : Math.PI, .5);
      INTER.push({x, z:z + dz * 1.25, r:3, prio:.85, label:`🏙️ Palm Sky-Tower ${i + 1} – căn hộ biển 8.000–18.000 💰 (E)`, action:() => aptMenu(i + 1, x, z)}); });
    function aptMenu(n, x, z){ if(!ui || !ui.modal) return; const m = ui.modal(`🏙️ Palm Sky-Tower ${n} · căn hộ biển 18 tầng`), L = [[3, 8000], [9, 12000], [18, 18000]];
      m.body.innerHTML = '<p class="muted">Căn hộ view biển, hồ bơi chung trên sân thượng. Mua nhiều căn không mất nhà cũ.</p><div class="grid"></div>'; const g = m.body.querySelector('.grid');
      for(const [f, price] of L){ const id = `T${n}-${f}`, mine = owns(id), b = document.createElement('button'); b.className = 'btn' + (mine ? ' pri' : ''); b.textContent = mine ? `🏙️ Lên căn tầng ${f} của bạn` : `💳 Tầng ${f} – ${fmt(price)} 💰`;
        b.onclick = () => { m.close(); if(mine){ teleport(x + 4, z - 6, C.x, C.z); toast(`🏙️ Thang máy đưa bạn lên sân thượng Sky-Tower ${n} – view toàn Palm!`, 3500); } else pay(price, `mua căn hộ tầng ${f} Sky-Tower ${n}`, () => { if(owns(id)) return; S.ownedEstates.push({id, cls:'apt', name:`Căn hộ tầng ${f} Sky-Tower ${n}`, price, at:Date.now()}); save(); toast(`🎉 Căn hộ tầng ${f} Sky-Tower ${n} là của bạn!`, 4000); }); }; g.appendChild(b); } } }
  // đài phun nước giữa vòng xuyến
  { KX.add(new THREE.CylinderGeometry(9, 9.4, .7, 40), MAT.stone, 650, Y + .35, 968); KX.add(new THREE.CylinderGeometry(8.3, 8.3, .1, 40), MAT.pool, 650, Y + .62, 968); KX.add(new THREE.CylinderGeometry(2.2, 2.6, 1.6, 20), MAT.marble, 650, Y + 1, 968); addSeg(650, 968, 650, 968, 9.4, Y - 1, Y + 4, '⛲ Đài phun nước Vòng Xuyến'); }
  // 🏨 Khách sạn Vòm Vương Miện (đỉnh vành trăng khuyết, đối diện thân cọ – cuối tuyến Monorail)
  { let fac2 = null; try{ fac2 = AK.makePBRFacade({cols:5, rows:5, glassCol:'#1e4d6b', frameCol:'#f2efe9', seed:11}); }catch(e){}
    const part = (x0, x1, z0, z1, y0, y1) => { const w = x1 - x0, h = y1 - y0, d = z1 - z0, g = B(w, h, d); if(fac2){ try{ AK.facadeUV(g, Math.max(w, d), h, fac2); }catch(e){} } const ms = new THREE.Mesh(g, fac2 || MAT.white); ms.position.set((x0 + x1) / 2, Y + (y0 + y1) / 2, (z0 + z1) / 2); ms.castShadow = ms.receiveShadow = true; scene.add(ms); };
    part(613, 633, 1286, 1314, 0, 50); part(667, 687, 1286, 1314, 0, 50); part(633, 667, 1290, 1312, 40, 50); part(633, 667, 1298, 1314, 0, 9);
    boxes.push({x0:613, x1:633, z0:1286, z1:1314, y0:Y - 1, y1:Y + 50}, {x0:667, x1:687, z0:1286, z1:1314, y0:Y - 1, y1:Y + 50}, {x0:633, x1:667, z0:1298, z1:1314, y0:Y - 1, y1:Y + 9, msg:'🏨 Sảnh khách sạn – bấm E ở cổng vòm để nhận phòng'});
    KX.add(B(76, .8, 30), MAT.white, 650, Y + 50.4, 1300); const top = Y + 50.8; addPlat(650, 1300, 0, 37, 14, top); KX.add(B(20, .1, 8), MAT.pool, 650, top + .02, 1300); boxes.push({x0:640, x1:660, z0:1296, z1:1304, y0:top - .5, y1:top + .9});
    for(const s of [-1, 1]){ addSeg(612, 1300 + s * 14.6, 688, 1300 + s * 14.6, .12, top - .5, top + 3, '🏨 Lan can đài ngắm cảnh'); addSeg(650 + s * 37.6, 1286, 650 + s * 37.6, 1314, .12, top - .5, top + 3, '🏨 Lan can đài ngắm cảnh'); KX.add(B(76, 1.1, .08), MAT.glass, 650, top + .55, 1300 + s * 14.6); KX.add(B(.08, 1.1, 30), MAT.glass, 650 + s * 37.6, top + .55, 1300); }
    KX.add(B(70, .25, 1.4), MAT.gold, 650, Y + 39.9, 1289.4); KX.add(new THREE.CylinderGeometry(5.5, 6, .6, 36), MAT.stone, 650, Y + .3, 1292); KX.add(new THREE.CylinderGeometry(5, 5, .1, 36), MAT.pool, 650, Y + .62, 1292); addSeg(650, 1292, 650, 1292, 6, Y - 1, Y + 2, '⛲ Đài phun nước sân khách sạn');
    sign(signTex(1024, 180, '#0b3d5c', [['🏨 KHÁCH SẠN VÒM VƯƠNG MIỆN', `900 52px ${FONT}`, '#ffd23f', .45], ['Đài ngắm cảnh tầng 50 · hồ bơi trên không', `600 36px ${FONT}`, '#fff', .82]]), 18, 3.2, 650, Y + 44.5, 1289.9, Math.PI, .6);
    INTER.push({x:650, z:1284, r:4, prio:.85, label:'🏨 Khách sạn Vòm Vương Miện – nghỉ dưỡng 1 đêm (300 💰, ⚡ + lên đài ngắm cảnh) (E)', action:() => pay(300, 'phòng hạng sang Khách sạn Vòm Vương Miện', () => { buffGo('energy', 30); teleport(650, 1296, C.x, C.z); toast('🏨 Nhận phòng thành công! Thang máy đưa bạn lên đài ngắm cảnh tầng 50 – ⚡ đi nhanh 30 phút.', 4500); })}); }

  /* ============================== 6. CÂY CỌ · DÙ BÃI BIỂN ============================== */
  const MYBOX = boxes.slice(-40);
  const freeAt = (x, z, m = 1.6) => !roadNear(x, z, 1.4) && !MYBOX.some(b => x > b.x0 - m && x < b.x1 + m && z > b.z0 - m && z < b.z1 + m) && !HOUSES.some(H => { const K = CLS[H.cls], [lx, lz] = toLocal(H, x, z); return Math.abs(lx) < K.w / 2 + 2 && lz > -K.d / 2 - (H.cls === 'p' ? 30 : 8) && lz < K.d / 2 + 2; });
  { const spots = [], add = (x, z) => { if(freeAt(x, z) && (hLand(x, z) ?? -9) > 1.6) spots.push([x, z]); };
    for(let z = 566; z < 1000; z += 14) for(const x of [617, 633, 667, 683]) add(x + (R() - .5) * 1.5, z);
    for(let x = 440; x < 862; x += 16) for(const z of [529, 548]) add(x, z);
    for(const F of FRONDS){ const K = CLS[FCLS[F.k]]; for(const s of F.gapS.concat([F.lastS + 4, F.lastS + 12, F.lastS + 20])){ if(s > F.total) continue; const q = F.at(s); for(const side of [-1, 1]) add(q.x - q.tz * side * (5.5 + K.d / 2), q.z + q.tx * side * (5.5 + K.d / 2)); } }
    for(let a = -CR.amax + .04; a < CR.amax - .04; a += .028){ for(const r of [362, 390]){ const [x, z] = atPolar(r + (R() - .5) * 3, a); add(x, z); } }
    const tr = new THREE.CylinderGeometry(.2, .32, 1, 7).translate(0, .5, 0), cr = mergeGeometries(Array.from({length:8}, (_, i) => nonIdx(new THREE.ConeGeometry(.55, 3.8, 4).rotateZ(Math.PI / 2 - .38).translate(1.7, 0, 0).rotateY(i / 8 * 6.283))), false);
    const T1 = new THREE.InstancedMesh(tr, sm(0x8a6a4a, .9), spots.length), T2 = new THREE.InstancedMesh(cr, sm(0x3f8f3a, .8), spots.length);
    spots.forEach(([x, z], i) => { const h = 6 + R() * 4, y = hLand(x, z) ?? Y, lx = (R() - .5) * .14, lz = (R() - .5) * .14; T1.setMatrixAt(i, mtx(x, y, z, 0, 1, h, 1, lx, lz)); T2.setMatrixAt(i, mtx(x + Math.sin(lz) * -h, y + h, z + Math.sin(lx) * h, R() * 6.28)); addSeg(x, z, x, z, .35, y - 1, y + 6); });
    for(const im of [T1, T2]){ im.castShadow = true; im.userData.dynamic = true; im.computeBoundingSphere(); scene.add(im); }
    // dù + ghế tắm nắng dọc bãi cát phía trong vành (hướng ra vịnh) – tránh chỗ cầu mũi nhánh đổ bộ
    for(let a = -CR.amax + .05; a < CR.amax - .05; a += .03){ if(Math.abs(a) < .08 || FRONDS.some(F => Math.abs(F.tipA - a) < .04)) continue; UMB.push(atPolar(CR.r0 + 3.2, a)); }
    const pole = new THREE.CylinderGeometry(.05, .05, 2.4, 6).translate(0, 1.2, 0), can = new THREE.ConeGeometry(1.5, .7, 10, 1, true).translate(0, 2.55, 0), lounge = B(.75, .3, 1.9).translate(.9, .15, 0);
    const U1 = new THREE.InstancedMesh(pole, MAT.steel, UMB.length), U2 = new THREE.InstancedMesh(can, new THREE.MeshStandardMaterial({color:0xffffff, roughness:.7, side:THREE.DoubleSide}), UMB.length), U3 = new THREE.InstancedMesh(lounge, MAT.white, UMB.length), cc = new THREE.Color();
    UMB.forEach(([x, z], i) => { const y = hLand(x, z) ?? Y, ry = R() * 6.28, c = Math.cos(ry), s = Math.sin(ry); addSeg(x + c * .9 - s * .95, z - s * .9 - c * .95, x + c * .9 + s * .95, z - s * .9 + c * .95, .38, y - 1, y + .3); U1.setMatrixAt(i, mtx(x, y, z)); U2.setMatrixAt(i, mtx(x, y, z, ry)); U2.setColorAt(i, cc.set([0xff6f61, 0x1f9bd1, 0xffd23f, 0x2ec4b6, 0xffffff][i % 5])); U3.setMatrixAt(i, mtx(x, y, z, ry)); });
    for(const im of [U1, U2, U3]){ im.userData.dynamic = true; im.computeBoundingSphere(); scene.add(im); } }

  for(const ms of KX.build()) ms.userData.noFar = true;   // lưới gộp trải cả đảo → không ẩn theo khoảng cách
  W.V2ROADS = W.V2ROADS || []; W.V2ROADS.push({zone:'palm', y:Y, segs:VSEG, gates:{G7:[450, 460], G9:[220, 900]}});

  /* ============================== 7. NƠI XUẤT HIỆN · BẢN ĐỒ ============================== */
  const myHome = () => HOUSES.find(h => h.id === S.palmHome && owns(h.id)) || HOUSES.find(h => owns(h.id));
  { let t = 0, done = false; HOOK.onFrame.push(dt => { if(done) return; t += dt || 1 / 60; if(t < 1.5) return; done = true; const H = HOUSES.find(h => h.id === S.palmHome); if(H && owns(H.id)) teleport(H.door.x, H.door.z, H.x, H.z); }); }
  const tp = (x, z, lx, lz) => () => teleport(x, z, lx, lz);
  PLACES.push({icon:'🌴', name:'The QC Palm Dubai', sub:'Ốc đảo lấn biển hình cây cọ · 5 hạng nhà · Monorail', go:tp(450, 546, 650, 700)},
    {icon:'🍤', name:'Phố ẩm thực Palm', sub:'Dưới đường ray Monorail – 8 quán', go:tp(650, 598, 650, 700)},
    {icon:'🏙️', name:'Palm Sky-Towers', sub:'4 toà căn hộ biển 60 m (8.000–18.000 💰)', go:tp(608, 612, 608, 595)},
    {icon:'🏠', name:'Nhánh Santorini (F1·F2)', sub:'Nhà phố 2.500 💰', go:tp(565, 660, 480, 662)},
    {icon:'🏡', name:'Nhánh Duplex kính (F3·F4)', sub:'12.000 💰', go:tp(565, 740, 480, 742)},
    {icon:'🏖️', name:'Nhánh Biệt thự hồ bơi (F5·F6)', sub:'35.000 💰', go:tp(565, 820, 480, 822)},
    {icon:'🛥️', name:'Nhánh Siêu biệt thự (F7·F8)', sub:'85.000 💰 · bến du thuyền riêng', go:tp(565, 900, 480, 902)},
    {icon:'👑', name:'Vành Dinh thự Đế Vương', sub:'250.000 💰 · trực thăng · thuỷ cung', go:tp(...atPolar(CR.road, .28 * Math.PI), PAL[2].x, PAL[2].z)},
    {icon:'🏨', name:'Khách sạn Vòm Vương Miện', sub:'Cuối tuyến Monorail · đài ngắm cảnh tầng 50', go:tp(650, 1272, 650, 1300)},
    {icon:'🔑', name:'Nhà của tôi (Palm)', sub:'Căn bạn đã mua trên Palm Dubai', go:() => { const H = myHome(); if(H) teleport(H.door.x, H.door.z, H.x, H.z); else toast('🔑 Bạn chưa có nhà trên Palm Dubai – tới các nhánh lá, bấm E ở biển "ĐANG BÁN".', 4000); }});
  for(const o of scene.children.slice(N0)) o.userData.zone = 'palm';
  const OUT = {houses:HOUSES, fronds:FRONDS, aquariums:AQ, cls:CLS, crescent:CR, center:C, layout:{Y, clubs:CLUBS, food:FOODP}, owned:() => S.ownedEstates, myHome, buyMenu, zone:'palm'};
  // Pha 9: bot sống động Đảo Thụy Sĩ + Palm (file riêng, nạp sau khi cả 2 vùng đã dựng)
  try{ const bm = await import('./bots_swiss_palm.js'); OUT.bots = await bm.make(W, ctx, {swiss:W.swissV2, palm:OUT}); }catch(e){ console.warn('[Palm] bots_swiss_palm:', e); }
  return OUT;
}
