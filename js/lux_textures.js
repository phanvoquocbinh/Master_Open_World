// QC World V2 – BỘ TEXTURE + VẬT LIỆU SANG TRỌNG DÙNG CHUNG (đợt nâng cấp đảo Abyssal · phần A abyss-core, 17/11/2026)
// Theo đặc tả "Canyon Overhaul" Phần 0.2 + 0.4: không đổ màu trơn – mọi vật liệu chính có texture vẽ bằng canvas 512×512 (+ bump / roughness),
// cấm trắng phèn (#ffffff, #f0f0f0, #e9e2d6, #b9b4aa).
//  • makeLux(THREE) → { tex:{travertine, teak, cobble, rug, filigree, waterN}, MAT:{GOLD_CHAMPAGNE, TRAVERTINE_WARM, …}, mk(token, extra) }
//    – kết quả được nhớ theo THREE (gọi nhiều lần chỉ dựng 1 lần). Đảo Abyssal gán sẵn W.LUX = makeLux(THREE) cho các phiên khác dùng.
//  • Texture lặp liền mép (RepeatWrapping); đặt repeat theo mét ở chỗ dùng: tex.clone() rồi .repeat.set(…) (clone dùng chung ảnh, không tốn bộ nhớ).
//  • mk(token, {repeat:[u,v], ...thuộc tính material}) → material MỚI theo token (khi cần chỉnh repeat / polygonOffset riêng).
const CACHE = new WeakMap();

function rngOf(seed){ let s = seed | 0 || 1; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function canvas(n = 512){ const c = document.createElement('canvas'); c.width = c.height = n; return [c, c.getContext('2d')]; }
// vẽ lặp liền mép: gọi f(ox, oy) cho 9 bản sao lệch ±n
const wrap9 = (n, f) => { for(const ox of [-n, 0, n]) for(const oy of [-n, 0, n]) f(ox, oy); };

/* ---------- 1. Travertine: vân đá kem ngang ấm + ron gạch ---------- */
function drawTravertine(g, n, r, bumpOnly){
  g.fillStyle = bumpOnly ? '#808080' : '#d1b894'; g.fillRect(0, 0, n, n);
  // vân ngang (lớp trầm tích) lượn sóng nhẹ
  for(let i = 0; i < 70; i++){ const y0 = r() * n, am = 1 + r() * 4, k = 1 + Math.floor(r() * 3), ph = r() * 6.28, w = 1 + r() * 5;
    const dark = r() < .55; g.strokeStyle = bumpOnly ? (dark ? 'rgba(60,60,60,.35)' : 'rgba(200,200,200,.25)') : (dark ? `rgba(150,118,80,${.12 + r() * .22})` : `rgba(240,226,196,${.12 + r() * .25})`); g.lineWidth = w;
    for(const oy of [-n, 0, n]){ g.beginPath(); for(let x = 0; x <= n; x += 8){ const y = y0 + oy + am * Math.sin(x / n * 6.2832 * k + ph); if(x === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); } }
  // lỗ rỗ đặc trưng travertine
  for(let i = 0; i < 260; i++){ const x = r() * n, y = r() * n, a = 1 + r() * 3.5, b = .6 + r() * 1.2; g.fillStyle = bumpOnly ? 'rgba(20,20,20,.6)' : `rgba(120,92,60,${.25 + r() * .3})`; wrap9(n, (ox, oy) => { g.beginPath(); g.ellipse(x + ox, y + oy, a, b, 0, 0, 6.2832); g.fill(); }); }
  // ron gạch: 2 hàng × 2 cột tấm ốp mỗi ô texture (lệch nửa tấm)
  g.strokeStyle = bumpOnly ? 'rgba(0,0,0,.9)' : 'rgba(110,88,62,.85)'; g.lineWidth = 3;
  for(let rI = 0; rI < 4; rI++){ const y = rI * n / 4; g.beginPath(); g.moveTo(0, y); g.lineTo(n, y); g.stroke(); const off = (rI % 2) * n / 4; for(let cI = 0; cI <= 2; cI++){ const x = off + cI * n / 2; g.beginPath(); g.moveTo(x % (n + 1), y); g.lineTo(x % (n + 1), y + n / 4); g.stroke(); } }
}
/* ---------- 2. Teak: thanh ván song song + chỉ đen caulking ---------- */
function drawTeak(g, n, r, bumpOnly){
  const P = 8, pw = n / P; g.fillStyle = bumpOnly ? '#909090' : '#7a4a26'; g.fillRect(0, 0, n, n);
  for(let i = 0; i < P; i++){ const x0 = i * pw, base = bumpOnly ? 140 + r() * 30 : 0; const hue = 22 + r() * 8, li = 30 + r() * 10;
    g.fillStyle = bumpOnly ? `rgb(${base},${base},${base})` : `hsl(${hue},48%,${li}%)`; g.fillRect(x0, 0, pw, n);
    for(let k = 0; k < 26; k++){ const xx = x0 + 2 + r() * (pw - 4); g.strokeStyle = bumpOnly ? 'rgba(90,90,90,.35)' : `rgba(60,32,14,${.12 + r() * .2})`; g.lineWidth = .6 + r() * 1.4; g.beginPath(); g.moveTo(xx, 0); for(let y = 0; y <= n; y += 16) g.lineTo(xx + Math.sin(y * .03 + k) * 1.2, y); g.stroke(); }
    // mối nối đầu thanh (so le)
    const jy = (i * 197) % n; g.fillStyle = bumpOnly ? 'rgba(0,0,0,.8)' : 'rgba(20,12,8,.9)'; g.fillRect(x0, jy, pw, 2.5); }
  g.fillStyle = bumpOnly ? '#000' : '#16100c'; for(let i = 0; i <= P; i++) g.fillRect(i * pw - 1.5, 0, 3, n);   // chỉ caulking đen
}
/* ---------- 3. Granite cobble: đá hoa cương nâu trầm lát ô quạt + sa thạch vàng xen ---------- */
function drawCobble(g, n, r, bumpOnly){
  g.fillStyle = bumpOnly ? '#202020' : '#2a221d'; g.fillRect(0, 0, n, n);   // nền ron
  const R = n / 4;   // 4 × 4 vảy quạt
  for(let row = -1; row <= 4; row++) for(let col = -1; col <= 4; col++){ const cx = col * R + (row % 2 ? R / 2 : 0), cy = row * R * .62;
    for(let ring = 3; ring >= 1; ring--){ const rr = R * .5 * ring / 3 + R * .12;
      for(let s = 0; s < 3 + ring * 2; s++){ const a0 = Math.PI + s / (3 + ring * 2) * Math.PI, a1 = Math.PI + (s + 1) / (3 + ring * 2) * Math.PI - .06, sand = (row * 7 + col * 3 + ring + s) % 9 === 0;
        g.fillStyle = bumpOnly ? `rgb(${150 + r() * 60 | 0},${150 + r() * 60 | 0},${150 + r() * 60 | 0})` : sand ? `hsl(40,${42 + r() * 10}%,${50 + r() * 8}%)` : `hsl(${20 + r() * 10},${18 + r() * 10}%,${18 + r() * 9}%)`;
        wrap9(n, (ox, oy) => { g.beginPath(); g.arc(cx + ox, cy + oy, rr, a0, a1); g.arc(cx + ox, cy + oy, rr - R * .15, a1, a0, true); g.closePath(); g.fill(); }); } } }
  for(let i = 0; i < 2600; i++){ const x = r() * n, y = r() * n; g.fillStyle = bumpOnly ? 'rgba(255,255,255,.08)' : `rgba(${r() < .5 ? '200,180,150' : '10,8,6'},${.08 + r() * .1})`; g.fillRect(x, y, 1.6, 1.6); }   // hạt đá
}
/* ---------- 4. Thảm Ba Tư: nền đỏ, viền cổ điển vàng – xanh rêu, hoạ tiết hoa trung tâm ---------- */
function drawRug(g, n, r){
  g.fillStyle = '#6e1a1c'; g.fillRect(0, 0, n, n);
  const band = (i, c, w) => { g.strokeStyle = c; g.lineWidth = w; g.strokeRect(i, i, n - 2 * i, n - 2 * i); };
  band(8, '#1e4637', 16); band(22, '#c9a54a', 6); band(34, '#1e4637', 10); band(44, '#c9a54a', 3);
  for(let i = 0; i < 4; i++){ g.save(); g.translate(n / 2, n / 2); g.rotate(i * Math.PI / 2); for(let k = -6; k <= 6; k++){ g.fillStyle = k % 2 ? '#c9a54a' : '#2e5e4a'; g.beginPath(); g.ellipse(k * 32, -n / 2 + 27, 9, 5, 0, 0, 6.2832); g.fill(); } g.restore(); }
  g.save(); g.translate(n / 2, n / 2);
  for(let ring = 6; ring >= 1; ring--){ g.fillStyle = ['#6e1a1c', '#c9a54a', '#1e4637', '#a33a2a', '#d9bf7a', '#2e5e4a'][ring % 6]; g.beginPath(); for(let a = 0; a <= 64; a++){ const t = a / 64 * 6.2832, rr = ring * 26 + 8 * Math.sin(t * 8); g.lineTo(Math.cos(t) * rr, Math.sin(t) * rr); } g.closePath(); g.fill(); }
  for(let i = 0; i < 8; i++){ g.rotate(Math.PI / 4); g.fillStyle = '#d9bf7a'; g.beginPath(); g.ellipse(0, -170, 14, 34, 0, 0, 6.2832); g.fill(); g.fillStyle = '#1e4637'; g.beginPath(); g.ellipse(0, -170, 6, 18, 0, 0, 6.2832); g.fill(); }
  g.restore();
  for(let i = 0; i < 4000; i++){ g.fillStyle = `rgba(0,0,0,${r() * .08})`; g.fillRect(r() * n, r() * n, 1, 1); }   // sợi len
}
/* ---------- 5. Filigree (ren cắt laser) – kênh alpha: dùng alphaTest .4 ---------- */
function drawFiligree(g, n){
  g.clearRect(0, 0, n, n); g.strokeStyle = '#d4af37'; g.fillStyle = '#d4af37'; g.lineCap = 'round';
  const cell = n / 4;
  for(let i = 0; i < 4; i++) for(let j = 0; j < 4; j++){ const cx = i * cell + cell / 2, cy = j * cell + cell / 2;
    g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, cell * .32, 0, 6.2832); g.stroke();
    g.lineWidth = 4; for(let k = 0; k < 8; k++){ const a = k / 8 * 6.2832; g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + Math.cos(a + .5) * cell * .3, cy + Math.sin(a + .5) * cell * .3, cx + Math.cos(a) * cell * .5, cy + Math.sin(a) * cell * .5); g.stroke(); }
    g.beginPath(); g.arc(cx, cy, cell * .08, 0, 6.2832); g.fill(); }
  g.lineWidth = 8; g.strokeRect(0, 0, n, n);
}
/* ---------- 6. Normal map gợn nước mịn (tổng sóng sin lặp liền) ---------- */
function drawWaterN(g, n){
  const img = g.createImageData(n, n), d = img.data, W = [[3, 1, .9, 0], [1, 4, .7, 1.3], [5, 2, .45, 2.1], [2, 7, .35, .6], [9, 3, .22, 4.4], [7, 9, .16, 3.1]];
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){ let dx = 0, dy = 0; for(const [kx, ky, a, ph] of W){ const t = (kx * x + ky * y) / n * 6.2832 + ph, c = Math.cos(t) * a; dx += c * kx; dy += c * ky; }
    let nx = -dx * .045, ny = -dy * .045, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l; const i = (y * n + x) * 4; d[i] = (nx * .5 + .5) * 255; d[i + 1] = (ny * .5 + .5) * 255; d[i + 2] = (nz * .5 + .5) * 255; d[i + 3] = 255; }
  g.putImageData(img, 0, 0);
}

export function makeLux(THREE){
  if(CACHE.has(THREE)) return CACHE.get(THREE);
  const T = (draw, seed, srgb = true, n = 512) => { const [c, g] = canvas(n); draw(g, n, rngOf(seed)); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if(srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const tex = {
    travertine: T((g, n, r) => drawTravertine(g, n, r, false), 11), travertineBump: T((g, n, r) => drawTravertine(g, n, r, true), 11, false),
    teak: T((g, n, r) => drawTeak(g, n, r, false), 12), teakBump: T((g, n, r) => drawTeak(g, n, r, true), 12, false),
    cobble: T((g, n, r) => drawCobble(g, n, r, false), 13), cobbleBump: T((g, n, r) => drawCobble(g, n, r, true), 13, false),
    rug: T((g, n, r) => drawRug(g, n, r), 14),
    filigree: T((g, n) => drawFiligree(g, n), 15),
    waterN: T((g, n) => drawWaterN(g, n), 16, false, 256),
  };
  // token vật liệu (đặc tả 0.4) – hex · roughness · metalness · texture
  const SPEC = {
    GOLD_CHAMPAGNE:     {color: 0xd4af37, roughness: .25, metalness: .88},
    TRAVERTINE_WARM:    {color: 0xd1b894, roughness: .68, metalness: .05, map: 'travertine', bumpMap: 'travertineBump', bumpScale: .04},
    GRANITE_PROMENADE:  {color: 0x3b312b, roughness: .78, metalness: .06, map: 'cobble', bumpMap: 'cobbleBump', bumpScale: .05},
    SANDSTONE_TRIM:     {color: 0xbda070, roughness: .72, metalness: .04, map: 'travertine', bumpMap: 'travertineBump', bumpScale: .03},
    OBSIDIAN_PAVILION:  {color: 0x1a202c, roughness: .35, metalness: .45},
    WALNUT_WOOD:        {color: 0x3d2314, roughness: .45, metalness: .08, map: 'teak', bumpMap: 'teakBump', bumpScale: .03},
    MAHOGANY_DARK:      {color: 0x421812, roughness: .38, metalness: .10, map: 'teak', bumpMap: 'teakBump', bumpScale: .02},
    TITANIUM_BRONZE:    {color: 0x22262e, roughness: .32, metalness: .82},
    BORDEAUX_VELVET:    {color: 0x591622, roughness: .85, metalness: .02},
    EMERALD_VELVET:     {color: 0x1e4637, roughness: .82, metalness: .02},
    GLASS_SAPPHIRE:     {color: 0x0e3342, roughness: .08, metalness: .45, transparent: true, opacity: .56, depthWrite: false, side: THREE.DoubleSide},
    SAND_GOLDEN:        {color: 0xebd5a7, roughness: .90, metalness: 0},
    SAND_WET:           {color: 0xbfa473, roughness: .25, metalness: 0},
    YACHT_HULL:         {color: 0xf4f1ea, roughness: .20, metalness: .15},
    WARM_GLOW:          {color: 0xffcf70, roughness: .20, metalness: 0, emissive: 0xffb84d, emissiveIntensity: 1.35},
    TEAK_DECK:          {color: 0xb07a4a, roughness: .55, metalness: .03, map: 'teak', bumpMap: 'teakBump', bumpScale: .03},
    PERSIAN_RUG:        {color: 0xffffff, roughness: .95, metalness: 0, map: 'rug'},
    FILIGREE_GOLD:      {color: 0xd4af37, roughness: .3, metalness: .85, map: 'filigree', alphaTest: .4, side: THREE.DoubleSide},
    BASALT_ASPHALT:     {color: 0x1c2026, roughness: .9, metalness: 0},
    GLASS_TURQUOISE:    {color: 0x2fb5b0, roughness: .06, metalness: .3, transparent: true, opacity: .42, depthWrite: false, side: THREE.DoubleSide},
  };
  // texture có màu riêng → nhân với màu token sẽ tối đi: các token dùng map đặt color trung tính (ánh màu do texture quyết định)
  const NEUTRAL = new Set(['TRAVERTINE_WARM', 'TEAK_DECK', 'PERSIAN_RUG']);
  const mk = (token, extra = {}) => { const s = SPEC[token]; if(!s) throw new Error('lux: không có token ' + token); const o = {...s, ...extra}; const rep = o.repeat; delete o.repeat;
    for(const k of ['map', 'bumpMap']) if(typeof o[k] === 'string'){ o[k] = tex[o[k]]; if(rep){ o[k] = o[k].clone(); o[k].repeat.set(rep[0], rep[1]); o[k].needsUpdate = true; } }
    if(NEUTRAL.has(token) && o.map && extra.color === undefined) o.color = 0xffffff;
    return new THREE.MeshStandardMaterial(o); };
  const MAT = {}; for(const k of Object.keys(SPEC)) MAT[k] = mk(k);
  const out = {tex, MAT, mk, SPEC};
  CACHE.set(THREE, out); return out;
}
