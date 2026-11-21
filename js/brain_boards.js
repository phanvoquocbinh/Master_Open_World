// QC World V2 – THÁP QA/QC BRAIN: BẢNG KIẾN THỨC TẦNG 1 + BẢNG VINH DANH TẦNG 5 (phiên qc-lang-center, 21/11/2026)
//  • Tầng 1 (y 110): bảng treo tường theo mặt kính nghiêng + cột bảng 2 mặt đứng giữa sảnh. Mỗi mặt cứ 30 giây đổi sang một mẩu
//    kiến thức khác (mờ dần → vẽ lại → hiện dần), thanh tiến trình chạy dưới bảng, bấm E ở gần để xem mẩu tiếp theo.
//    Nội dung lấy từ data/brain_boards.json (không viết chữ trong code), xen kẽ theo chủ đề.
//  • Tầng 6 (sân thượng, y 150): bia "Vinh danh QA/QC Member" khung gỗ óc chó + chỉ vàng, 2 đèn rọi tranh, bấm E xem bảng lớn.
//  • Chữ sắc nét: canvas 2048 px (bảng vinh danh 2560 px), mipmap + anisotropy tối đa. Vật liệu MeshBasic, tự giảm độ sáng
//    khi trời tối để bloom ban đêm (ngưỡng thấp) không làm chữ loá. Bảng ở xa dùng bản 1024 px; 4 mặt gần nhất (≤ 10 m) lên 2048 px.
//  • Hiệu năng: chỉ tạo texture khi bạn ở tầng 1 / gần tháp, rời đi thì giải phóng GPU.
import * as AK from './archKit.js';
export async function make(W, ctx = {}, L){
  const {THREE, HOOK, INTER, P, toast} = W, ui = ctx.ui || W.ui;
  if(!L || !THREE) return null;
  const {C, FY, RF, RA, A0, ENT, Rof, at, yawOut, dAng, busy, grp} = L, TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const FONT = '"Segoe UI","Segoe UI Emoji",sans-serif', SERIF = 'Cambria,"Times New Roman",serif';
  const maxAniso = () => { try{ const r = W.renderer || (window.__qc && window.__qc.renderer); return r ? r.capabilities.getMaxAnisotropy() : 8; }catch(e){ return 8; } };
  const nightDim = () => { const n = (W.GLOW && W.GLOW.U) ? W.GLOW.U.uNight.value : 0; return 1 - .72 * clamp(n / .5, 0, 1); };   // đêm: chữ ≤ 0,28 (dưới ngưỡng bloom đêm 0,32)
  const sm = (c, r = .5, m = 0, o = {}) => new THREE.MeshStandardMaterial({color:c, roughness:r, metalness:m, ...o});
  const MT = {walnut:AK.makeWoodMaterial({col:'#4a2c1a', plank:36, seed:71, rough:.45}), gold:sm(0xc9a14a, .28, .9), brass:sm(0xb08d4a, .3, .85), obsid:sm(0x161c26, .35, .4), lamp:new THREE.MeshStandardMaterial({color:0xfff1cf, emissive:0xffd9a0, emissiveIntensity:1.1})};
  const parts = new Map(), kitAdd = (geo, mat, m4) => { const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(m4); for(const k of Object.keys(g.attributes)) if(!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); if(!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); if(!parts.has(mat)) parts.set(mat, []); parts.get(mat).push(g); };
  const _o = new THREE.Object3D();
  // đặt khối theo hệ toạ độ của 1 "giá" (group ảo: vị trí + yaw + nghiêng)
  const rig = (x, y, z, ry, rx = 0) => { const base = new THREE.Object3D(); base.position.set(x, y, z); base.rotation.set(rx, ry, 0, 'YXZ'); base.updateMatrixWorld(true);
    return (geo, mat, lx, ly, lz, rrx = 0, rry = 0, rrz = 0) => { _o.position.set(lx, ly, lz); _o.rotation.set(rrx, rry, rrz); _o.scale.set(1, 1, 1); _o.updateMatrix(); kitAdd(geo, mat, base.matrixWorld.clone().multiply(_o.matrix)); }; };
  // bảng nghiêng theo mặt kính tầng (dáng đồng hồ cát): trả {x, z, yc, r, tilt, hgt}
  const wallSpot = (a, y, yb, yt, inset = .45) => { const rB = Rof(yb) - inset, rT = Rof(yt) - inset, r = (rB + rT) / 2, p = at(a, r); return {x:p.x, z:p.z, yc:(yb + yt) / 2, tilt:Math.atan2(rB - rT, yt - yb), hgt:Math.hypot(rB - rT, yt - yb), r}; };

  /* ============================== DỮ LIỆU ============================== */
  let DATA = null, ORDER = [], ptr = 0;
  const loadData = async () => { try{ const r = await fetch('data/brain_boards.json', {cache:'no-cache'}); if(!r.ok) throw new Error(r.status); const d = await r.json(); if(!d || !Array.isArray(d.items) || !d.items.length) throw new Error('trống');
      const TP = {}; for(const t of (d.topics || [])) TP[t.id] = t; const by = {}; for(const it of d.items){ (by[it.topic] = by[it.topic] || []).push(it); }
      for(const k of Object.keys(by)){ const a = by[k]; for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }
      const keys = Object.keys(by), out = []; for(let i = 0; out.length < d.items.length; i++) for(const k of keys) if(by[k][i]) out.push(by[k][i]);   // xen kẽ chủ đề
      DATA = {TP, items:d.items, n:d.items.length}; ORDER = out; ptr = Math.floor(Math.random() * out.length); return true; }catch(e){ console.warn('[Brain] data/brain_boards.json:', e); DATA = {TP:{}, items:[], n:0}; return false; } };
  const nextItem = () => ORDER.length ? ORDER[(ptr++) % ORDER.length] : null;

  /* ============================== VẼ MẶT BẢNG KIẾN THỨC (16:9) ============================== */
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const fitFont = (g, text, weight, size, family, maxW) => { let s = size; g.font = `${weight} ${s}px ${family}`; while(g.measureText(text).width > maxW && s > size * .6){ s -= 2; g.font = `${weight} ${s}px ${family}`; } return s; };
  const wrap = (g, text, maxW) => { const w = String(text).split(/\s+/), out = []; let line = ''; for(const word of w){ const t = line ? line + ' ' + word : word; if(g.measureText(t).width > maxW && line){ out.push(line); line = word; } else line = t; } if(line) out.push(line); return out; };
  function drawItem(cv, it){ const g = cv.getContext('2d'), Wd = cv.width, Ht = cv.height, s = Wd / 2048; g.setTransform(1, 0, 0, 1, 0, 0); g.scale(s, s); const w = 2048, h = 1152;
    const tp = (it && DATA && DATA.TP[it.topic]) || {name:'Thư viện QA Brain', icon:'📚', color:'#e0b040'}, ac = tp.color || '#e0b040';
    const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#0c1522'); bg.addColorStop(1, '#13263d'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.globalAlpha = .06; g.strokeStyle = '#9fc3ff'; g.lineWidth = 2; for(let x = 0; x < w; x += 64){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for(let y = 0; y < h; y += 64){ g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.globalAlpha = 1;
    g.fillStyle = ac; g.fillRect(0, 0, 22, h); g.fillRect(0, 0, w, 10);
    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    if(!it){ g.fillStyle = '#ffe9a8'; g.font = `800 92px ${FONT}`; g.fillText('📚 Thư viện QA Brain', 110, 420); g.fillStyle = '#cfd8e3'; g.font = `500 56px ${FONT}`; g.fillText('Kho kiến thức đang được cập nhật…', 110, 540); return; }
    g.font = `700 50px ${FONT}`; g.fillStyle = ac; g.fillText(`${tp.icon || ''} ${tp.name}`.trim(), 96, 104);
    const idx = DATA.items.indexOf(it) + 1; g.textAlign = 'right'; g.font = `500 40px ${FONT}`; g.fillStyle = '#8fa4bd'; g.fillText(`QA Brain · ${idx}/${DATA.n}`, w - 80, 104); g.textAlign = 'left';
    // tiêu đề (tối đa 2 dòng)
    let tfs = 88; g.font = `800 ${tfs}px ${FONT}`; let tl = wrap(g, it.title, w - 200); if(tl.length > 2){ tfs = 72; g.font = `800 ${tfs}px ${FONT}`; tl = wrap(g, it.title, w - 200).slice(0, 2); }
    g.fillStyle = '#ffe9a8'; let y = 238; for(const t of tl){ fitFont(g, t, 800, tfs, FONT, w - 200); g.fillText(t, 96, y); y += tfs + 16; }
    g.fillStyle = ac; g.fillRect(96, y - 64, 220, 8); y += 26;
    // các ý chính
    const lines = (it.lines || []).slice(0, 5), lh = lines.length > 4 ? 92 : 104, fs = lines.length > 4 ? 54 : 60;
    for(const t of lines){ g.fillStyle = ac; g.beginPath(); g.arc(118, y - fs * .34, 11, 0, TAU); g.fill(); g.fillStyle = '#eef3f9'; fitFont(g, t, 500, fs, FONT, w - 260); g.fillText(t, 150, y); y += lh; }
    // mẹo
    if(it.tip){ const ty = Math.max(y + 10, h - 236), th = 128; g.globalAlpha = .16; g.fillStyle = ac; rr(g, 80, ty, w - 160, th, 26); g.fill(); g.globalAlpha = 1; g.strokeStyle = ac; g.lineWidth = 4; rr(g, 80, ty, w - 160, th, 26); g.stroke();
      g.fillStyle = '#e6fbef'; fitFont(g, '💡 ' + it.tip, 'italic 500', 50, FONT, w - 240); g.fillText('💡 ' + it.tip, 120, ty + 82); }
    g.textAlign = 'right'; g.font = `500 32px ${FONT}`; g.fillStyle = '#6f84a0'; g.fillText('Đổi mẩu mới sau 30 giây · bấm E để xem tiếp', w - 80, h - 34); g.textAlign = 'left'; }

  /* ============================== MẶT BẢNG XOAY VÒNG ============================== */
  const FACES = [], HOLD = 30, FADE = .55, aniso = {v:0};
  const lo = () => { const c = document.createElement('canvas'); c.width = 1024; c.height = 576; return c; }, hi = () => { const c = document.createElement('canvas'); c.width = 2048; c.height = 1152; return c; };
  const mkTex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = aniso.v || (aniso.v = maxAniso()); return t; };
  function face(x, y, z, ry, rx, w, h, accentBar = true){ const mat = new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0, depthWrite:true}), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0, 'YXZ'); m.name = 'brainBoard'; m.userData.dynamic = true; m.userData.noFar = true; m.visible = false; grp.add(m);
    let bar = null; if(accentBar){ const bg = new THREE.PlaneGeometry(1, .045).translate(.5, 0, 0); bar = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({color:0xe0b040})); bar.position.set(-w / 2, -h / 2 - .06, .002); bar.scale.x = .001; m.add(bar); }
    const F = {m, mat, bar, w, h, item:null, t:Math.random() * HOLD, phase:0, cLo:null, tLo:null, cHi:null, tHi:null, hiOn:false, idx:FACES.length}; FACES.push(F); return F; }
  const redraw = F => { if(F.cLo){ drawItem(F.cLo, F.item); F.tLo.needsUpdate = true; } if(F.hiOn && F.cHi){ drawItem(F.cHi, F.item); F.tHi.needsUpdate = true; } if(F.bar && F.item && DATA){ const tp = DATA.TP[F.item.topic]; F.bar.material.color.set((tp && tp.color) || '#e0b040'); } };
  const setHi = (F, on) => { if(on === F.hiOn) return; F.hiOn = on; if(on){ F.cHi = hi(); F.tHi = mkTex(F.cHi); drawItem(F.cHi, F.item); F.mat.map = F.tHi; } else { F.mat.map = F.tLo; if(F.tHi) F.tHi.dispose(); F.tHi = null; F.cHi = null; } F.mat.needsUpdate = true; };
  let active = false, buildQ = [];
  function activate(){ if(active) return; active = true; buildQ = FACES.slice(); }
  function deactivate(){ if(!active) return; active = false; buildQ = []; for(const F of FACES){ F.m.visible = false; F.mat.opacity = 0; F.phase = 0; if(F.tLo) F.tLo.dispose(); if(F.tHi) F.tHi.dispose(); F.tLo = F.tHi = null; F.cLo = F.cHi = null; F.hiOn = false; F.mat.map = null; } }
  const advance = F => { F.phase = 1; F.fade = 0; };   // 1 = đang mờ đi, 2 = đang hiện lại

  /* ---------- tầng 1: bảng treo tường (khe còn trống) + cột bảng 2 mặt giữa sảnh ---------- */
  const y1 = FY[0], used1 = L.f1Wall || [], cases1 = L.f1Cases || [];
  // tầng 1 có 8 cửa ra 8 cầu (cách nhau π/4) → đặt bảng ở ĐIỂM GIỮA 2 cửa liền nhau (cách mỗi cửa ~10 m trên tường, ~3 m trong sảnh)
  const DR = (L.doors && L.doors.length ? L.doors : [ENT, ENT + Math.PI / 2, ENT + Math.PI, ENT - Math.PI / 2]).map(a => ((a % TAU) + TAU) % TAU).sort((a, b) => a - b);
  const MID = DR.map((a, i) => { const b = i + 1 < DR.length ? DR[i + 1] : DR[0] + TAU; return (a + b) / 2; });
  const LIFT = [ENT, ENT + Math.PI];
  let nWall = 0; for(const a of MID){ if(nWall >= 6 || used1.some(u => dAng(u, a) < .35)) continue; nWall++;
    const s = wallSpot(a, y1, y1 + 1.25, y1 + 3.85), F = face(s.x, s.yc, s.z, yawOut(a) + Math.PI, s.tilt, 4.4, 2.475); F.wall = true;
    const R = rig(s.x, s.yc, s.z, yawOut(a) + Math.PI, s.tilt); for(const [sx, sy] of [[0, 1.3], [0, -1.3]]) R(new THREE.BoxGeometry(4.6, .07, .06), MT.brass, sx, sy, -.03); for(const sx of [-2.27, 2.27]) R(new THREE.BoxGeometry(.07, 2.67, .06), MT.brass, sx, 0, -.03); R(new THREE.BoxGeometry(4.5, 2.6, .03), MT.obsid, 0, 0, -.05); }
  const tot = []; for(const a of MID){ if(tot.length >= 6 || LIFT.some(l => dAng(l, a) < .3) || dAng(a, A0) < .3 || dAng(a, A0 + Math.PI) < .3 || cases1.some(c => dAng(c, a) < .2)) continue; tot.push(a); }
  for(const a of tot){ const p = at(a, 15.2), ty = yawOut(a) + Math.PI / 2, yc = y1 + 1.95, R = rig(p.x, y1, p.z, ty);   // mặt bảng quay theo phương tiếp tuyến (người đi vòng sảnh đọc thẳng)
    for(const sx of [-1.38, 1.38]){ R(new THREE.CylinderGeometry(.055, .065, 3.05, 20), MT.brass, sx, 1.525, 0); R(AK.roundedBox(.5, .06, .36, .02, 2), MT.brass, sx, .03, 0); }
    R(AK.roundedBox(2.86, .09, .12, .03, 2), MT.brass, 0, 3.0, 0); R(AK.roundedBox(2.7, 1.56, .05, .02, 2), MT.obsid, 0, 1.95, 0);
    for(const sd of [1, -1]){ const q = new THREE.Vector3(Math.sin(ty) * .035 * sd, 0, Math.cos(ty) * .035 * sd); face(p.x + q.x, yc, p.z + q.z, sd > 0 ? ty : ty + Math.PI, 0, 2.6, 1.4625); }
    W.addSeg && W.addSeg(p.x - Math.cos(ty) * 1.45, p.z + Math.sin(ty) * 1.45, p.x + Math.cos(ty) * 1.45, p.z - Math.sin(ty) * 1.45, .14, y1 - .5, y1 + 3.1, '📚 Cột bảng kiến thức QA'); }
  // tương tác: bấm E gần bảng → mẩu tiếp theo
  INTER.push({x:C.x, z:C.z, r:30, prio:-50, when:() => active && nearest(3.2) != null, get label(){ const F = nearest(3.2); const tp = F && F.item && DATA ? DATA.TP[F.item.topic] : null; return `📚 Bảng kiến thức${tp ? ' · ' + tp.name : ''} – xem mẩu tiếp theo (E)`; }, action:() => { const F = nearest(3.2); if(F && F.phase === 0) advance(F); }});
  function nearest(maxD){ let best = null, bd = maxD * maxD; for(const F of FACES){ if(!F.m.visible) continue; const d = (F.m.position.x - P.x) ** 2 + (F.m.position.z - P.z) ** 2; if(d < bd){ bd = d; best = F; } } return best; }

  /* ---------- tầng 5: BẢNG VINH DANH QA/QC MEMBER ---------- */
  const NAMES = ['Nguyễn Thị Diễm Phương', 'Trần Thị Mỹ Duyên', 'Phan Thị Thùy Dương', 'Nguyễn Thị Kim Trang'];
  function drawHonor(cv){ const g = cv.getContext('2d'), w = cv.width, h = cv.height; g.setTransform(1, 0, 0, 1, 0, 0);
    const bg = g.createRadialGradient(w / 2, h * .45, 80, w / 2, h / 2, w * .62); bg.addColorStop(0, '#2a0f16'); bg.addColorStop(.6, '#1a0a10'); bg.addColorStop(1, '#0d0508'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.globalAlpha = .05; g.fillStyle = '#e8c98a'; for(let x = 0; x < w; x += 40) for(let y = (x / 40) % 2 ? 20 : 0; y < h; y += 40){ g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); } g.globalAlpha = 1;
    const gold = g.createLinearGradient(0, 0, 0, h); gold.addColorStop(0, '#f6e2a4'); gold.addColorStop(.5, '#d4a94e'); gold.addColorStop(1, '#f1d48c');
    g.strokeStyle = gold; g.lineWidth = 10; g.strokeRect(56, 56, w - 112, h - 112); g.lineWidth = 3; g.strokeRect(84, 84, w - 168, h - 168);
    for(const [cx, cy] of [[84, 84], [w - 84, 84], [84, h - 84], [w - 84, h - 84]]){ g.save(); g.translate(cx, cy); g.rotate(Math.PI / 4); g.fillStyle = '#e8c574'; g.fillRect(-16, -16, 32, 32); g.restore(); }
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    // nguyệt quế 2 bên tiêu đề
    const laurel = (cx, cy, dir) => { g.strokeStyle = '#d9b25e'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy + 120, 150, Math.PI * (dir > 0 ? 1.15 : -.15), Math.PI * (dir > 0 ? 1.62 : -.62), dir < 0); g.stroke();
      g.fillStyle = '#d9b25e'; for(let i = 0; i < 7; i++){ const t = Math.PI * (dir > 0 ? 1.2 + i * .06 : -.2 - i * .06), x = cx + Math.cos(t) * 150, y = cy + 120 + Math.sin(t) * 150; g.save(); g.translate(x, y); g.rotate(t + (dir > 0 ? -.9 : .9)); g.beginPath(); g.ellipse(0, 0, 30, 11, 0, 0, TAU); g.fill(); g.restore(); } };
    laurel(w / 2 - 860, 230, 1); laurel(w / 2 + 860, 230, -1);
    g.fillStyle = '#e8c574'; g.font = `600 64px ${SERIF}`; g.letterSpacing = '18px'; g.fillText('★  ★  ★', w / 2, 210); g.letterSpacing = '4px';
    g.fillStyle = gold; fitFont(g, 'Vinh danh QA/QC Member', 700, 168, SERIF, w - 560); g.fillText('Vinh danh QA/QC Member', w / 2, 400); g.letterSpacing = '0px';
    g.strokeStyle = '#d4a94e'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2 - 640, 470); g.lineTo(w / 2 - 70, 470); g.moveTo(w / 2 + 70, 470); g.lineTo(w / 2 + 640, 470); g.stroke();
    g.save(); g.translate(w / 2, 470); g.rotate(Math.PI / 4); g.fillStyle = '#e8c574'; g.fillRect(-20, -20, 40, 40); g.restore();
    NAMES.forEach((n, i) => { const y = 650 + i * 205; g.fillStyle = '#d4a94e'; g.beginPath(); g.arc(w / 2 - 820, y - 40, 44, 0, TAU); g.fill(); g.fillStyle = '#2a0f16'; g.font = `700 52px ${SERIF}`; g.fillText(String(i + 1), w / 2 - 820, y - 22);
      g.fillStyle = '#f8edd2'; fitFont(g, n, 600, 124, SERIF, 1500); g.fillText(n, w / 2 + 40, y); });
    g.fillStyle = '#cdb27a'; g.font = `italic 500 50px ${SERIF}`; g.fillText('Ghi nhận sự tận tâm vì chất lượng sản phẩm', w / 2, h - 130); }
  let honor = null;
  // 21/11 (Bình chốt): bảng vinh danh lên TẦNG 6 (sân thượng) – bia đứng trang trọng giữa 2 Đình Vọng Cảnh, quay vào sảnh thang máy, không chắn lối
  { const y6 = FY[5], HA = L.f6Honor || {a:A0 + TAU / 3, r:21.5}, a = HA.a, r = HA.r, p = at(a, r), ry = yawOut(a) + Math.PI, BW = 4.6, BH = 2.875, yc = y6 + 2.75;
    const cv = document.createElement('canvas'); cv.width = 2560; cv.height = 1600;
    const mat = new THREE.MeshBasicMaterial({color:0xffffff}), m = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), mat); m.position.set(p.x, yc, p.z); m.rotation.set(0, ry, 0, 'YXZ'); m.name = 'honorBoard'; m.userData.dynamic = true; m.userData.noFar = true; m.visible = false; grp.add(m);
    const R = rig(p.x, yc, p.z, ry), fw = .2, fd = .16, ox = BW / 2 + fw / 2, oy = BH / 2 + fw / 2, H0 = y6 - yc;
    R(AK.roundedBox(BW + fw * 2, fw, fd, .03, 3), MT.walnut, 0, oy, -.02); R(AK.roundedBox(BW + fw * 2, fw, fd, .03, 3), MT.walnut, 0, -oy, -.02);
    R(AK.roundedBox(fw, BH, fd, .03, 3), MT.walnut, -ox, 0, -.02); R(AK.roundedBox(fw, BH, fd, .03, 3), MT.walnut, ox, 0, -.02);
    for(const sy of [1, -1]) R(new THREE.BoxGeometry(BW + .08, .035, .03), MT.gold, 0, sy * (BH / 2 + .018), .012); for(const sx of [1, -1]) R(new THREE.BoxGeometry(.035, BH + .08, .03), MT.gold, sx * (BW / 2 + .018), 0, .012);
    R(AK.roundedBox(BW + .5, BH + .5, .08, .02, 2), MT.walnut, 0, 0, -.13);   // mặt sau bia
    // 2 trụ gỗ óc chó (đỉnh cầu vàng) + bệ đá + xà đỉnh có ngôi sao vàng
    for(const sx of [-1, 1]){ R(AK.roundedBox(.34, 4.75, .34, .05, 3), MT.walnut, sx * (BW / 2 + .5), H0 + 2.695, -.05); R(AK.roundedBox(.5, .14, .5, .03, 2), MT.gold, sx * (BW / 2 + .5), H0 + 5.1, -.05); R(new THREE.SphereGeometry(.13, 24, 16), MT.gold, sx * (BW / 2 + .5), H0 + 5.3, -.05); }
    R(AK.roundedBox(BW + 1.7, .32, 1.1, .06, 3), MT.obsid, 0, H0 + .16, -.05); R(AK.roundedBox(BW + 1.4, .06, .9, .02, 2), MT.gold, 0, H0 + .35, -.05);
    R(AK.roundedBox(BW + 1.2, .26, .3, .05, 3), MT.walnut, 0, oy + .3, -.05);
    { const st = new THREE.Shape(); for(let i = 0; i < 10; i++){ const r2 = i % 2 ? .13 : .3, t = i / 10 * TAU + Math.PI / 2; if(i) st.lineTo(Math.cos(t) * r2, Math.sin(t) * r2); else st.moveTo(Math.cos(t) * r2, Math.sin(t) * r2); } st.closePath();
      R(new THREE.ExtrudeGeometry(st, {depth:.06, bevelEnabled:true, bevelSize:.015, bevelThickness:.015, bevelSegments:2}), MT.gold, 0, oy + .78, -.08); }
    // 2 đèn rọi tranh bằng đồng trên xà đỉnh
    for(const sx of [-1.3, 1.3]){ R(new THREE.CylinderGeometry(.03, .03, .5, 16), MT.brass, sx, oy + .32, .2, Math.PI / 2.4, 0, 0); R(new THREE.CylinderGeometry(.065, .065, 1.15, 24), MT.brass, sx, oy + .42, .44, 0, 0, Math.PI / 2); R(new THREE.CylinderGeometry(.04, .04, 1.08, 16), MT.lamp, sx, oy + .38, .47, 0, 0, Math.PI / 2); }
    const tx = Math.cos(ry), tz = -Math.sin(ry), hw = BW / 2 + .75; if(W.addSeg) W.addSeg(p.x - tx * hw, p.z - tz * hw, p.x + tx * hw, p.z + tz * hw, .5, y6 - .5, y6 + 5.4, '🏆 Bia Vinh danh QA/QC Member');
    const ip = at(a, r - 2.6);
    INTER.push({x:ip.x, z:ip.z, r:3, prio:.9, when:() => Math.abs(P.y - y6) < 2, label:'🏆 Bảng Vinh danh QA/QC Member – xem bảng lớn (E)', action:() => { if(!ui || !ui.modal){ toast('🏆 Vinh danh: ' + NAMES.join(' · '), 6000); return; } const md = ui.modal('🏆 Vinh danh QA/QC Member');
      md.body.innerHTML = `<div style="text-align:center;padding:8px 4px 2px"><div style="font:600 15px ${SERIF};color:#c9a14a;letter-spacing:6px">★ ★ ★</div><ol style="list-style:none;padding:0;margin:14px 0">${NAMES.map((n, i) => `<li style="font:600 22px ${SERIF};margin:10px 0"><span style="display:inline-block;width:30px;height:30px;line-height:30px;border-radius:50%;background:#c9a14a;color:#2a0f16;font-size:16px;margin-right:12px">${i + 1}</span>${n}</li>`).join('')}</ol><div class="muted" style="font-style:italic">Ghi nhận sự tận tâm vì chất lượng sản phẩm</div></div>`; }});
    honor = {m, mat, cv, tex:null}; }
  const honorOn = on => { if(!honor) return; if(on && !honor.tex){ drawHonor(honor.cv); honor.tex = mkTex(honor.cv); honor.mat.map = honor.tex; honor.mat.needsUpdate = true; honor.m.visible = true; } else if(!on && honor.tex){ honor.m.visible = false; honor.tex.dispose(); honor.tex = null; honor.mat.map = null; } };

  /* gộp khung/giá theo vật liệu */
  for(const [mat, list] of parts){ const g = list.length === 1 ? list[0] : W.mergeGeometries(list, false); if(!g) continue; if(mat.map){ const P2 = g.attributes.position, N2 = g.attributes.normal, uv = g.attributes.uv; for(let i = 0; i < P2.count; i++){ const ax = Math.abs(N2.getX(i)), ay = Math.abs(N2.getY(i)), az = Math.abs(N2.getZ(i)); if(ay >= ax && ay >= az) uv.setXY(i, P2.getX(i) / 1.5, P2.getZ(i) / 1.5); else if(ax >= az) uv.setXY(i, P2.getZ(i) / 1.5, P2.getY(i) / 1.5); else uv.setXY(i, P2.getX(i) / 1.5, P2.getY(i) / 1.5); } }
    const ms = new THREE.Mesh(g, mat); ms.castShadow = false; ms.receiveShadow = true; ms.userData.noFar = true; grp.add(ms); }

  /* ============================== KHUNG HÌNH ============================== */
  const loaded = loadData();
  let tick = 0;
  HOOK.onFrame.push(dt => { dt = Math.min(dt || 1 / 60, .1); tick -= dt; const dC = Math.hypot(P.x - C.x, P.z - C.z);
    if(tick <= 0){ tick = .25; const on1 = DATA && Math.abs(P.y - y1) < 3.6 && dC < RF[0] + 1.5; if(on1) activate(); else if(active && (dC > RF[0] + 12 || Math.abs(P.y - y1) > 7)) deactivate();
      honorOn(dC < 70 && P.y > FY[0] - 20); const k = nightDim(); for(const F of FACES) F.mat.color.setScalar(k); if(honor) honor.mat.color.setScalar(Math.min(1, k * 1.02));
      if(active){ const ds = FACES.map(F => [F, (F.m.position.x - P.x) ** 2 + (F.m.position.z - P.z) ** 2]).sort((a, b) => a[1] - b[1]); ds.forEach(([F, d], i) => { if(!F.tLo) return; if(i < 4 && d < 100) setHi(F, true); else if(F.hiOn && (i >= 6 || d > 169)) setHi(F, false); }); } }
    if(!active) return;
    if(buildQ.length){ const F = buildQ.shift(); F.cLo = lo(); F.tLo = mkTex(F.cLo); F.item = nextItem(); drawItem(F.cLo, F.item); F.mat.map = F.tLo; F.mat.needsUpdate = true; F.m.visible = true; F.mat.opacity = 0; F.phase = 2; F.fade = 0; if(F.bar && F.item && DATA){ const tp = DATA.TP[F.item.topic]; F.bar.material.color.set((tp && tp.color) || '#e0b040'); } return; }   // tạo dần 1 bảng / khung hình
    for(const F of FACES){ if(!F.tLo) continue;
      if(F.phase === 1){ F.fade += dt; F.mat.opacity = clamp(1 - F.fade / FADE, 0, 1); if(F.fade >= FADE){ F.item = nextItem(); redraw(F); F.phase = 2; F.fade = 0; F.t = 0; } }
      else if(F.phase === 2){ F.fade += dt; F.mat.opacity = clamp(F.fade / FADE, 0, 1); if(F.fade >= FADE){ F.phase = 0; F.mat.opacity = 1; } }
      else { F.t += dt; if(F.t >= HOLD) advance(F); }
      if(F.bar) F.bar.scale.x = Math.max(.001, F.w * clamp(F.t / HOLD, 0, 1)); } });
  await Promise.race([loaded, new Promise(r => setTimeout(r, 50))]);
  return {faces:FACES.length, wall:FACES.filter(F => F.wall).length, totems:tot.length, honor:!!honor, data:() => DATA && DATA.n, next:() => { for(const F of FACES) if(F.phase === 0 && F.tLo) advance(F); }};
}
