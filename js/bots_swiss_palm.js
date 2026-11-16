// QC World V2 – PHA 9 (phiên qc-lang-center): BOT SỐNG ĐỘNG CHO ĐẢO NGOẠI NGỮ THỤY SĨ + ỐC ĐẢO PALM DUBAI (bible Phần 7)
//  Thụy Sĩ: 4 giảng viên (Giáo sư IELTS Oxford · Lão sư HSK Tô Châu · Sensei Kyoto · Giảng viên Seoul) đi lại trong đại sảnh học viện
//           · nghệ nhân thổi kèn Alphorn ở làng Chalet · 2 người chăn bò sữa (gậy chăn) · lái tàu bánh răng đỏ ngồi trong đầu máy · 4 khách du lịch chụp ảnh
//  Palm:    B11 quản gia tuxedo + găng trắng (4 dinh thự + 1 quản gia riêng theo căn bạn sở hữu – cúi chào 30° khi chủ về)
//           · B12 đầu bếp áp chảo bốc lửa (phố ẩm thực · bếp dinh thự · bếp siêu biệt thự) · 2 cứu hộ trên chòi bãi tắm vành trăng
//           · khách Beach Club (DJ + 2 người nhảy + khách tắm nắng) · B09 thợ lặn bơi quanh vách kính thuỷ cung, vẫy tay khi bạn ở trong
//  Hiệu năng (theo mẫu bots_cbd_sky.js): bot chỉ hiện + chạy hoạt hình khi cách camera < 85 m (máy yếu 60 m); cả vùng ngủ khi bạn ở xa > 120 m
import { makePoser } from './pose.js';

export async function make(W, ctx, opt = {}){
  if(W.__botsSP) return null;
  const {THREE, scene, circles, HOOK, P, makeActor, makeLabel, removeLabel, lerpAngle, mergeGeometries} = W;
  const SW = opt.swiss, PV = opt.palm; if(!W.people || !makeActor || (!SW && !PV)) return null;
  W.__botsSP = true;
  const R = Math.random, pick = a => a[Math.floor(R() * a.length)], TAU = Math.PI * 2, LOW = W.QUAL === 'low', clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const NPC = [], PROPS = [], sM = s => W.people.pickSeed(L => !L.female, s), sF = s => W.people.pickSeed(L => L.female, s);
  const std = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.5}, o));
  function person(seed, outfit, name, dot, zone){ const k = W.people.kit(seed, {outfit}); const a = makeActor(k.gl, {name, height:k.h, face:0, clips:k.clips, compact:false, dot:dot || '#9fd36a'});
    if(k.look && k.look.width){ a.root.scale.x *= k.look.width; a.root.scale.z *= k.look.width; } if(LOW) a.g.traverse(m => { if(m.isMesh) m.castShadow = false; });
    a.play('idle', 0); a.mixer.update(0); const po = makePoser(THREE, a); const anchor = new THREE.Object3D(); anchor.position.y = k.h + .75; a.g.add(anchor);
    const o = {a, po, h:k.h, hips:po.hipsHeight(), anchor, x:0, y:0, z:0, hd:0, zone, bubble:null, bubbleT:0, col:{x:1e9, z:1e9, r:.3, owner:true}, upd:null, ph:R() * 9, off:false}; circles.push(o.col); NPC.push(o); return o; }
  const say = (o, t, sec = 3) => { if(!o.a.g.visible) return; if(o.bubble) removeLabel(o.bubble); o.bubble = makeLabel(t, null, {fs:38, h:.26, follow:o.anchor, bg:'rgba(255,255,255,.92)', color:'#1b2233', fade:30}); o.bubbleT = sec; };
  const put = (o, col = true) => { o.a.g.position.set(o.x, o.y, o.z); o.a.g.rotation.set(0, o.hd, 0); if(col && !o.off){ o.col.x = o.x; o.col.z = o.z; } else o.col.x = 1e9; };
  const boneOf = (o, re) => { let h = null; o.a.g.traverse(b => { if(b.isBone && !h && re.test(b.name)) h = b; }); return h; };
  const _v = new THREE.Vector3();
  function attachTo(o, re, mesh, off = [0, 0, 0]){ const b = boneOf(o, re); if(!b) return null; o.a.g.updateMatrixWorld(true); b.getWorldScale(_v); const k = 1 / (_v.x || 1); mesh.scale.multiplyScalar(k); mesh.position.set(off[0] * k, off[1] * k, off[2] * k); b.add(mesh); return mesh; }
  const attach = (o, mesh, side = 'Right') => attachTo(o, new RegExp(side + 'Hand$'), mesh);
  // tư thế riêng: ngắm xương theo hướng thế giới (giống pose.js / bots_cbd_sky.js)
  const _pa = new THREE.Vector3(), _pb = new THREE.Vector3(), _pd = new THREE.Vector3(), _qa = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _wq = new THREE.Quaternion(), _F = new THREE.Vector3(), _R = new THREE.Vector3(), _U = new THREE.Vector3(0, 1, 0);
  function aim(bn, n, c, f, u, r){ const B = bn[n], Cc = bn[c]; if(!B || !Cc) return; B.getWorldPosition(_pa); Cc.getWorldPosition(_pb); _pb.sub(_pa).normalize(); _pd.set(0, 0, 0).addScaledVector(_F, f).addScaledVector(_U, u).addScaledVector(_R, r).normalize(); _qa.setFromUnitVectors(_pb, _pd); B.getWorldQuaternion(_wq); B.parent.getWorldQuaternion(_pq); _wq.premultiply(_qa); B.quaternion.copy(_pq.invert().multiply(_wq)); B.updateMatrixWorld(true); }
  const LR = [['Left', -1], ['Right', 1]];
  function pose(o, kind, t = 0){ const bn = o.po.bones; if(!bn || !bn.Hips || !o.a.g.visible) return; o.a.g.updateMatrixWorld(true); o.a.g.getWorldDirection(_F); _F.y = 0; _F.normalize(); _R.set(-_F.z, 0, _F.x);
    switch(kind){
      case 'bow': aim(bn, 'Spine', 'Spine1', .5, .87, 0); aim(bn, 'Spine1', 'Spine2', .5, .87, 0); for(const [s, k] of LR){ aim(bn, s + 'Arm', s + 'ForeArm', .25, -1, k * .05); aim(bn, s + 'ForeArm', s + 'Hand', .45, -1, -k * .1); } break;
      case 'hands': for(const [s, k] of LR){ aim(bn, s + 'Arm', s + 'ForeArm', .2, -1, k * .12); aim(bn, s + 'ForeArm', s + 'Hand', .9, -.15, -k * .7); } break;
      case 'horn': aim(bn, 'Spine', 'Spine1', .22, 1, 0); for(const [s, k] of LR){ aim(bn, s + 'Arm', s + 'ForeArm', .55, -.55, k * .2); aim(bn, s + 'ForeArm', s + 'Hand', .9, .25, -k * .35); } aim(bn, 'Neck', 'Head', .35, 1, 0); break;
      case 'pan': { const e = Math.max(0, Math.sin(t * 5)); aim(bn, 'RightArm', 'RightForeArm', .8, -.45, .3); aim(bn, 'RightForeArm', 'RightHand', 1, .05 + e * .45, .05); aim(bn, 'LeftArm', 'LeftForeArm', .55, -.7, -.25); aim(bn, 'LeftForeArm', 'LeftHand', .9, .1, .35); aim(bn, 'Neck', 'Head', .5, 1, 0); break; }
      case 'staff': aim(bn, 'RightArm', 'RightForeArm', .3, -.9, .45); aim(bn, 'RightForeArm', 'RightHand', .5, .85, .1); break;
      case 'binoc': for(const [s, k] of LR){ aim(bn, s + 'Arm', s + 'ForeArm', .55, -.1, k * .55); aim(bn, s + 'ForeArm', s + 'Hand', .25, .75, -k * .65); } break;
      case 'wave': { const e = Math.sin(t * 7); aim(bn, 'RightArm', 'RightForeArm', .2, .7, .65); aim(bn, 'RightForeArm', 'RightHand', .1, 1, e * .55); break; }
      case 'swim': { const e = Math.sin(t * 2.4); for(const [s, k] of LR){ aim(bn, s + 'Arm', s + 'ForeArm', .95, .05 + k * e * .15, k * .3); aim(bn, s + 'ForeArm', s + 'Hand', 1, 0, -k * .1); } break; }
      case 'sit': for(const [s, k] of LR){ aim(bn, s + 'UpLeg', s + 'Leg', 1, -.12, k * .05); aim(bn, s + 'Leg', s + 'Foot', .15, -1, 0); } break;
      case 'lounge': for(const [s, k] of LR){ aim(bn, s + 'UpLeg', s + 'Leg', 1, .05, k * .06); aim(bn, s + 'Leg', s + 'Foot', 1, -.05, 0); aim(bn, s + 'Arm', s + 'ForeArm', -.2, .6, k * .5); aim(bn, s + 'ForeArm', s + 'Hand', -.5, .2, -k * .9); } aim(bn, 'Spine', 'Spine1', -.45, 1, 0); break;
      case 'drive': for(const [s, k] of LR){ aim(bn, s + 'Arm', s + 'ForeArm', .8, -.5, k * .15); aim(bn, s + 'ForeArm', s + 'Hand', 1, .1, -k * .2); } break;
      case 'dj': { const e = Math.sin(t * 6); aim(bn, 'RightArm', 'RightForeArm', .7, -.6, .3); aim(bn, 'RightForeArm', 'RightHand', 1, -.3 + e * .15, 0); aim(bn, 'LeftArm', 'LeftForeArm', .3, .6 + e * .3, -.5); aim(bn, 'LeftForeArm', 'LeftHand', .1, 1, -.2); aim(bn, 'Neck', 'Head', .2 + Math.abs(e) * .35, 1, 0); break; }
    } }
  // đi theo chuỗi điểm (vòng lặp) – bám mặt đất/sàn thật (groundAtY)
  const gY = (x, z, y) => W.groundAtY ? W.groundAtY(x, z, y == null ? 200 : y + .5) : (W.groundH ? W.groundH(x, z) : 0);
  function walker(o, pts, sp = 1.2, yFix = null){ Object.assign(o, {pts, wi:0, sp, wait:R() * 3}); o.x = pts[0][0]; o.z = pts[0][1]; o.y = yFix != null ? yFix : gY(o.x, o.z, W.groundH ? W.groundH(o.x, o.z) : null);
    o.upd = (dt, T) => { if(o.wait > 0){ o.wait -= dt; o.a.play('idle'); put(o); return 'idle'; }
      const [tx, tz] = o.pts[o.wi], dx = tx - o.x, dz = tz - o.z, d = Math.hypot(dx, dz); if(d < .25){ o.wi = (o.wi + 1) % o.pts.length; if(R() < .35) o.wait = 2 + R() * 5; return 'idle'; }
      const k = Math.min(d, o.sp * dt); o.x += dx / d * k; o.z += dz / d * k; if(yFix == null) o.y = gY(o.x, o.z, o.y); o.hd = lerpAngle(o.hd, Math.atan2(dx, dz), 1 - Math.exp(-dt * 8)); o.a.play('walk'); const ac = o.a.acts.walk; if(ac) ac.timeScale = clamp(o.sp / 1.35, .6, 1.1); put(o); return 'walk'; }; return o; }
  const ell = (cx, cz, rx, rz, n = 10, a0 = 0) => Array.from({length:n}, (_, i) => { const a = a0 + i / n * TAU; return [cx + Math.cos(a) * rx, cz + Math.sin(a) * rz]; });
  const prop = obj => { obj.userData.dynamic = true; scene.add(obj); PROPS.push(obj); return obj; };

  /* ============================== ĐẢO NGOẠI NGỮ THỤY SĨ ============================== */
  if(SW){
    // giảng viên 4 thứ tiếng – đi chậm qua lại trong đại sảnh, giơ tay giảng bài, chào bằng tiếng mình dạy
    const TEACH = {
      en:{name:'🇬🇧 Giáo sư IELTS Oxford', seed:sM(5001), of:{shirt:0x6b4f3a, pants:0x3a3a3a, shoe:0x2a1a10, long:true}, lines:["Good morning! Ready for today's IELTS lesson? 📘", 'Practise speaking every single day!', 'Band 8.0 is a marathon, not a sprint 🏃', 'Mind your linking words: however, moreover…']},
      zh:{name:'🀄 Lão sư HSK Tô Châu', seed:sF(5002), of:{shirt:0xa31f2e, pants:0x2a2a2a, shoe:0x111111, long:true}, lines:['你好！今天我们学HSK新课 🀄', 'Nǐ hǎo! Nhớ luyện đủ 4 thanh điệu nhé!', '加油！每天写十个汉字 ✍️', '慢慢来，比较快 – chậm mà chắc!']},
      ja:{name:'🇯🇵 Sensei tiếng Nhật Kyoto', seed:sF(5003), of:{shirt:0x2c3e66, pants:0x2a2f3a, shoe:0x111111, long:true}, lines:['こんにちは！ひらがなから始めましょう 🌸', '頑張って！Ganbatte!', '毎日少しずつ – mỗi ngày một chút nhé', 'Arigatou gozaimasu! ありがとうございます']},
      ko:{name:'🇰🇷 Giảng viên tiếng Hàn Seoul', seed:sF(5004), of:{shirt:0xf2efe9, pants:0x2a2f3a, shoe:0x111111, long:true}, lines:['안녕하세요! 한글은 정말 과학적이에요 🇰🇷', '화이팅! Hôm nay học TOPIK nhé!', '천천히 따라 하세요 – nói chậm theo cô nhé', '감사합니다! Cảm ơn các bạn!']} };
    for(const A of (SW.academies || [])){ const T = TEACH[A.key]; if(!T) continue; const z = A.zs - 5.5, o = person(T.seed, T.of, T.name, '#ffd23f', 'swiss');
      walker(o, [[A.cx - 5, z], [A.cx + 5, z], [A.cx + 1, z - 2]], .65, A.y0);
      attach(o, new THREE.Mesh(new THREE.BoxGeometry(.2, .27, .04), std(0x8a1c1c)), 'Left'); attach(o, new THREE.Mesh(new THREE.CylinderGeometry(.008, .01, .55, 5).translate(0, .27, 0), std(0x3a2a1a)));
      const u = o.upd; o.upd = (dt, t) => { const st = u(dt, t); if(st === 'idle') o.po.apply('present', t); if(R() < dt * .012) say(o, pick(T.lines), 3.2); }; }
    // nghệ nhân thổi kèn Alphorn ở đầu Đông làng Chalet (kèn gỗ 3,4 m tì xuống đất)
    { const x = -482, z = 80, o = person(sM(5011), {shirt:0xf4f2ec, pants:0x3a2a1a, shoe:0x2a1a10, style:'cap'}, '🎺 Nghệ nhân kèn Alphorn', '#ffb547', 'swiss'); o.x = x; o.z = z; o.y = gY(x, z); o.hd = -Math.PI / 2;
      const fx = Math.sin(o.hd), fz = Math.cos(o.hd), M = new THREE.Vector3(x + fx * .32, o.y + o.h - .22, z + fz * .32), G = new THREE.Vector3(x + fx * 3.4, gY(x + fx * 3.4, z + fz * 3.4) + .28, z + fz * 3.4), dir = G.clone().sub(M), L = dir.length();
      const wood = std(0x8a5a32, {roughness:.45}), horn = new THREE.Group(), tube = new THREE.Mesh(new THREE.CylinderGeometry(.09, .025, L, 12), wood); tube.position.copy(M).addScaledVector(dir, .5); tube.quaternion.setFromUnitVectors(_U, dir.clone().normalize()); horn.add(tube);
      const bell = new THREE.Mesh(new THREE.CylinderGeometry(.24, .09, .5, 16, 1, true), std(0x7a4a22, {roughness:.4, side:THREE.DoubleSide})); bell.position.copy(G).add(new THREE.Vector3(fx * .1, .18, fz * .1)); bell.rotation.set(fz * -.5, 0, fx * .5); horn.add(bell);
      for(const t of [.25, .55, .8]){ const band = new THREE.Mesh(new THREE.TorusGeometry(.06 + t * .03, .012, 6, 14), std(0xc0392b)); band.position.copy(M).addScaledVector(dir, t); band.quaternion.copy(tube.quaternion); band.rotateX(Math.PI / 2); horn.add(band); }
      prop(horn); o.prop = horn;
      o.upd = (dt, t) => { put(o); horn.visible = o.a.g.visible; const blow = ((t * .25 + o.ph) % 8) < 4.5; pose(o, blow ? 'horn' : 'hands', t); if(blow && R() < dt * .04) say(o, pick(['🎺 Buuuu~ ♪ (kèn Alphorn vang khắp thung lũng)', '🎺 Bản “Ranz des Vaches” – gọi đàn bò về!', '🏔️ Grüezi! Chào mừng tới làng Chalet!']), 3); }; }
    // 2 người chăn bò sữa – đi vòng quanh 2 đồng cỏ, cầm gậy chăn
    [[-470, 150], [-650, 150]].forEach(([cx, cz], i) => { const o = person(sM(5021 + i), {shirt:[0xc0392b, 0x2f6d3a][i], pants:0x3a2a1a, shoe:0x2a1a10, style:'cap'}, '🐄 Người chăn bò sữa', '#9fd36a', 'swiss');
      walker(o, ell(cx, cz, 34, 24, 12, i), 1.0); attach(o, new THREE.Mesh(new THREE.CylinderGeometry(.022, .028, 1.6, 6).translate(0, .3, 0), std(0x6b4a2a)));
      const u = o.upd; o.upd = (dt, t) => { u(dt, t); pose(o, 'staff', t); if(R() < dt * .008) say(o, pick(['Ho-la-hi-ti-ho! 🐄 Về chuồng nào các cô!', '🔔 Nghe tiếng chuông là biết bò đi đâu!', '🧀 Sữa sáng nay làm phô mai Gruyère đó!']), 3); }; });
    // lái tàu bánh răng đỏ – ngồi trong đầu máy, chạy cùng tàu
    if(SW.cars && SW.cars[0]){ const g = SW.cars[0], o = person(sM(5031), {shirt:0x1d3a6b, pants:0x1d3a6b, shoe:0x111111, long:true, style:'cap'}, '🚂 Lái tàu bánh răng', '#ff6b6b', 'swiss');
      o.upd = (dt, t) => { const h = g.userData.h || 0; o.x = g.position.x + Math.sin(h) * 3.9; o.z = g.position.z + Math.cos(h) * 3.9; o.y = g.position.y + 1.25 - o.hips; o.hd = h; put(o, false); pose(o, 'sit', t); pose(o, 'drive', t); if(R() < dt * .005) say(o, pick(['🚂 Tút tút! Tàu bánh răng sắp vào ga!', '🏔️ Bên trái là núi tuyết Jungfrau đó!']), 2.8); }; }
    // khách du lịch – dạo làng Chalet và đại lộ cầu G3, dừng lại chụp ảnh
    const TOUR = [[[-612, 80], [-500, 80], [-530, 82], [-590, 79]], [[-505, 79], [-610, 81], [-560, 80]], [[-352, -16], [-262, -16], [-300, -15], [-340, -17]], [[-270, -15], [-350, -16], [-320, -17]]];
    TOUR.forEach((pts, i) => { const o = person(i % 2 ? sF(5041 + i) : sM(5041 + i), {shirt:[0xff9fc4, 0x46d39a, 0xffd23f, 0x4fc3ff][i], pants:0x2a3a5a, shoe:0x1b1d21, style:i > 1 ? 'cap' : undefined}, `📸 Du khách ${W.people.nameOf(5041 + i)}`, '#ffd23f', 'swiss');
      walker(o, pts, .95 + R() * .3); attach(o, new THREE.Mesh(new THREE.BoxGeometry(.13, .08, .06), std(0x1b1d22, {metalness:.4})));
      const u = o.upd; o.upd = (dt, t) => { const st = u(dt, t); if(st === 'idle') o.po.apply('phone', t); if(st === 'idle' && R() < dt * .02) say(o, pick(['📸 Cảnh đẹp quá, chụp thêm kiểu nữa!', '🏔️ Thụy Sĩ đẹp như tranh!', '🧀 Lát nữa đi ăn Fondue nhé!', '🇬🇧 Học xong tiếng Anh rồi đi du lịch khắp nơi!']), 2.8); }; }); }

  /* ============================== ỐC ĐẢO PALM DUBAI ============================== */
  if(PV){ const L = PV.layout || {}, Y = L.Y || 2.2, HS = PV.houses || [], C = PV.center || {x:650, z:920};
    const own = id => (PV.owned() || []).some(e => e && e.id === id);
    const loc = (H, lx, lz) => [H.x + Math.cos(H.rot) * lx + Math.sin(H.rot) * lz, H.z - Math.sin(H.rot) * lx + Math.cos(H.rot) * lz];
    const tux = {shirt:0x15161a, pants:0x15161a, shoe:0x0a0a0a, long:true}, gloveM = std(0xffffff, {roughness:.7});
    const gloves = o => { for(const s of ['Right', 'Left']) attach(o, new THREE.Mesh(new THREE.SphereGeometry(.065, 8, 6), gloveM), s); };
    const butler = (o, H) => { let bowT = 0, greeted = false;
      return (dt, t) => { put(o); const d = Math.hypot(P.x - o.x, P.z - o.z), mine = own(H.id);
        if(d < 7 && !greeted){ greeted = true; bowT = 2.6; say(o, mine ? pick(['🎩 Chào mừng ông chủ về nhà! Đèn & nhạc đã bật sẵn ạ.', '🎩 Ông chủ về rồi! Bữa tối sẵn sàng lúc 7 giờ ạ.']) : '🎩 Kính chào quý khách – căn này đang rao bán, mời xem biển trước cửa ạ.', 3.4); }
        if(d > 12) greeted = false; if(bowT > 0){ bowT -= dt; pose(o, 'bow', t); } else pose(o, 'hands', t); }; };
    // B11 quản gia trưởng ở 4 dinh thự (đứng cạnh cửa chính dưới hàng cột)
    HS.filter(h => h.cls === 'p').forEach((H, i) => { const K = PV.cls.p, [x, z] = loc(H, 3.4, K.d / 2 + 1.7), o = person(sM(5101 + i), tux, `🎩 Quản gia trưởng · Dinh thự ${H.id}`, '#e8e2d0', 'palm'); o.x = x; o.z = z; o.y = Y; o.hd = H.rot; gloves(o); o.upd = butler(o, H); });
    // B11 quản gia riêng: tự đứng đón ở cửa căn bạn sở hữu gần nhất (nhà phố → siêu biệt thự)
    { const o = person(sM(5120), tux, '🎩 Quản gia riêng của bạn', '#e8e2d0', 'palm'); o.off = true; let cur = null, scan = 0, inner = null;
      gloves(o);
      o.upd = (dt, t) => { if((scan -= dt) <= 0){ scan = .5; let best = null, bd = 45 * 45; for(const H of HS){ if(H.cls === 'p' || !own(H.id)) continue; const d = (H.x - P.x) ** 2 + (H.z - P.z) ** 2; if(d < bd){ bd = d; best = H; } }
          if(best !== cur){ cur = best; o.off = !cur; if(cur){ const K = PV.cls[cur.cls], [x, z] = loc(cur, 1.75, K.d / 2 + .9); o.x = x; o.z = z; o.y = Y; o.hd = cur.rot; inner = butler(o, cur); } } }
        if(cur && inner) inner(dt, t); }; }
    // B12 đầu bếp áp chảo bốc lửa (chảo + ngọn lửa flambé gắn tay phải, mũ bếp trắng)
    const chef = (seed, name, x, z, y, hd, grill) => { const o = person(seed, {shirt:0xffffff, pants:0x2a2a2a, shoe:0x111111, long:true}, name, '#ffb547', 'palm'); o.x = x; o.z = z; o.y = y; o.hd = hd;
      const hat = new THREE.Group(); const c1 = new THREE.Mesh(new THREE.CylinderGeometry(.11, .1, .2, 14), gloveM); c1.position.y = .1; hat.add(c1); const c2 = new THREE.Mesh(new THREE.SphereGeometry(.15, 12, 8), gloveM); c2.position.y = .24; c2.scale.y = .7; hat.add(c2); attachTo(o, /Head$/, hat, [0, .17, .01]);
      const pan = new THREE.Group(); const disc = new THREE.Mesh(new THREE.CylinderGeometry(.17, .14, .05, 18), std(0x2a2a2a, {metalness:.6, roughness:.35})); disc.position.z = .3; pan.add(disc); const hd2 = new THREE.Mesh(new THREE.BoxGeometry(.035, .03, .3), std(0x111111)); hd2.position.z = .08; pan.add(hd2);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(.15, .55, 10, 1, true), new THREE.MeshBasicMaterial({color:0xff7a1a, transparent:true, opacity:.85, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide})); flame.position.set(0, .3, .3); pan.add(flame);
      const fl2 = new THREE.Mesh(new THREE.ConeGeometry(.08, .35, 8, 1, true), new THREE.MeshBasicMaterial({color:0xffe066, transparent:true, opacity:.9, blending:THREE.AdditiveBlending, depthWrite:false})); fl2.position.set(0, .22, .3); pan.add(fl2); attach(o, pan);
      if(grill){ const gt = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(1.5, .88, .75), std(0xc9ced4, {metalness:.7, roughness:.3})); b.position.y = .44; gt.add(b); const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, .04, .65), std(0x1b1b1b, {metalness:.5})); top.position.y = .9; gt.add(top);
        gt.position.set(x + Math.sin(hd) * .75, y, z + Math.cos(hd) * .75); gt.rotation.y = hd; prop(gt); o.prop = gt; circles.push({x:gt.position.x, z:gt.position.z, r:.8}); }
      o.upd = (dt, t) => { put(o); if(o.prop) o.prop.visible = o.a.g.visible; pose(o, 'pan', t + o.ph); const burst = ((t * .3 + o.ph) % 6) < 1.6; flame.visible = fl2.visible = burst; if(burst){ const k = .6 + R() * .8; flame.scale.set(1, k, 1); fl2.scale.set(1, .7 + R() * .6, 1); }
        if(burst && R() < dt * .05) say(o, pick(['🔥 Flambé! Bò Wagyu áp chảo bốc lửa!', '👨‍🍳 Chín vừa medium-rare, mời quý khách!', '🦞 Tôm hùm nướng bơ tỏi ra lò!']), 2.6); }; return o; };
    const FD = (L.food || [])[0]; if(FD) chef(sM(5131), '👨‍🍳 Đầu bếp Teppanyaki · Phố ẩm thực', FD.x - 3.8, FD.z + 1, Y, 0, true);
    for(const [cls, seed] of [['p', 5132], ['m', 5133]]){ const H = HS.filter(h => h.cls === cls)[cls === 'p' ? 1 : 0]; if(!H) continue; const K = PV.cls[cls], [x, z] = loc(H, K.w / 2 - 2.6, -K.d / 2 + 1.55);
      chef(sM(seed), `👨‍🍳 Đầu bếp Michelin tư gia · ${H.id}`, x, z, Y + .12, H.rot + Math.PI, false); }
    // cứu hộ trên 2 chòi canh bãi tắm phía trong vành trăng (nhìn ra vịnh)
    [-.05, .05].forEach((a, i) => { const x = C.x + Math.sin(a) * 341.5, z = C.z + Math.cos(a) * 341.5, gy = gY(x, z), hd = Math.atan2(C.x - x, C.z - z);
      const tw = new THREE.Group(), red = std(0xd62828), wh = std(0xffffff), leg = new THREE.CylinderGeometry(.06, .07, 2.1, 6);
      for(const [lx, lz] of [[-.6, -.6], [.6, -.6], [-.6, .6], [.6, .6]]){ const m = new THREE.Mesh(leg, wh); m.position.set(lx, 1.05, lz); tw.add(m); }
      const pf = new THREE.Mesh(new THREE.BoxGeometry(1.5, .12, 1.5), red); pf.position.y = 2.1; tw.add(pf); const seat = new THREE.Mesh(new THREE.BoxGeometry(.7, .5, .5), wh); seat.position.set(0, 2.4, -.35); tw.add(seat);
      const um = new THREE.Mesh(new THREE.ConeGeometry(1.1, .5, 10, 1, true), std(0xffd23f, {side:THREE.DoubleSide})); um.position.y = 4.2; tw.add(um); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.9, 6), wh); pole.position.set(0, 3.1, -.6); tw.add(pole);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(.6, .4), std(0xd62828, {side:THREE.DoubleSide})); flag.position.set(.3, 3.8, -.6); tw.add(flag);
      tw.position.set(x, gy, z); tw.rotation.y = hd; prop(tw); circles.push({x, z, r:1.1});
      const o = person(i ? sF(5141) : sM(5141), {shirt:0xd62828, pants:0xd62828, shoe:0xf2c230, style:'cap'}, '⚓ Cứu hộ bãi biển', '#ff6b6b', 'palm');
      const bx = x - Math.sin(hd) * .35, bz = z - Math.cos(hd) * .35; o.prop = tw;
      o.upd = (dt, t) => { o.x = bx; o.z = bz; o.y = gy + 2.67 - o.hips; o.hd = hd; put(o, false); tw.visible = o.a.g.visible; pose(o, 'sit', t); if(((t * .2 + o.ph) % 9) < 3) pose(o, 'binoc', t);
        if(R() < dt * .006) say(o, pick(['⚓ Bơi trong khu cờ đỏ – vàng nhé! 🚩', '📣 Tuýt tuýt! Bạn kia bơi xa quá rồi!', '🌊 Hôm nay sóng êm, nước trong lắm!']), 2.8); }; });
    // khách Beach Club: club 1 có DJ + 2 người nhảy bên hồ; mỗi club 1 khách tắm nắng trên ghế
    const CL = L.clubs || [];
    if(CL[0]){ const c = CL[0], px = c.x + c.s * 11, bz = c.z + 7.6;
      const booth = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.05, .7), std(0x1b1d22, {metalness:.4})); b.position.y = .52; booth.add(b); const led = new THREE.Mesh(new THREE.BoxGeometry(2.24, .12, .72), std(0x111111, {emissive:0xff2ad4, emissiveIntensity:1.4})); led.position.y = .9; booth.add(led);
      booth.position.set(px, Y, bz + .9); prop(booth); circles.push({x:px, z:bz + .9, r:1.1});
      const dj = person(sM(5151), {shirt:0x111111, pants:0x2a2a2a, shoe:0xffffff, style:'cap'}, '🎧 DJ Beach Club', '#ff9fc4', 'palm'); dj.x = px; dj.z = bz + 1.75; dj.y = Y; dj.hd = Math.PI; dj.prop = booth;
      dj.upd = (dt, t) => { put(dj); booth.visible = dj.a.g.visible; led.material.emissive.setHSL((t * .15) % 1, 1, .5); pose(dj, 'dj', t); if(R() < dt * .006) say(dj, pick(['🎧 Tay lên nào cả Palm ơi! 🙌', '🎶 Bài tiếp theo – remix nhạc nước!', '🔥 Sunset session bắt đầu!']), 2.6); };
      [-1.6, 1.6].forEach((dx, i) => { const o = person(i ? sF(5152) : sM(5153), {shirt:[0xff6f61, 0x48dbfb][i], pants:0xf2efe9, shoe:0xffffff}, '💃 Khách Beach Club', '#ff9fc4', 'palm'); o.x = px + dx; o.z = bz - .4; o.y = Y; o.hd = 0;
        o.upd = (dt, t) => { put(o); o.po.apply('dance', t + i * 1.7); }; }); }
    CL.forEach((c, i) => { const lz = c.z - 4.5 + (i % 2 ? 6 : 0), lx = c.x + c.s * 18, o = person(i % 2 ? sF(5160 + i) : sM(5160 + i), {shirt:[0xffd23f, 0x2ec4b6, 0xff9fc4, 0xffffff, 0xff6f61, 0x1f9bd1][i % 6], pants:0x1f3b5a, shoe:0xd9c49a}, '🍹 Khách tắm nắng · Beach Club ' + c.n, '#ffd23f', 'palm');
      o.x = lx; o.z = lz; o.y = Y + .48 - o.hips; o.hd = c.s > 0 ? Math.PI / 2 : -Math.PI / 2;
      o.upd = (dt, t) => { put(o, false); pose(o, 'lounge', t); if(R() < dt * .003) say(o, pick(['🍹 Mocktail dừa ngon tuyệt!', '😎 Nắng đẹp quá, nằm thêm chút nữa…', '🌴 Cuối tuần ở Palm là nhất!']), 2.6); }; });
    // B09 thợ lặn: bơi vòng ngoài vách kính mỗi thuỷ cung, vẫy tay khi bạn đang ở trong
    (PV.aquariums || []).forEach((A, i) => { const o = person(sM(5171 + i), {shirt:0x111418, pants:0x111418, shoe:0x111418, long:true}, '🤿 Thợ lặn thuỷ cung', '#4fc3ff', 'palm');
      attachTo(o, /Spine2$/, new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .55, 12), std(0xffc531, {metalness:.5, roughness:.3})), [0, .05, -.22]);
      const mask = new THREE.Mesh(new THREE.BoxGeometry(.2, .09, .06), std(0x48dbfb, {transparent:true, opacity:.7})); attachTo(o, /Head$/, mask, [0, .1, .12]);
      let th = R() * TAU; const dir = i % 2 ? 1 : -1;
      o.upd = (dt, t) => { const inAq = P.y < -1 && Math.hypot(P.x - A.x, P.z - A.z) < 14; if(!inAq) th += dir * .07 * dt; const lx = Math.cos(th) * 11, lz = Math.sin(th) * 8.6, c = Math.cos(A.rot), s = Math.sin(A.rot);
        o.x = A.x + c * lx + s * lz; o.z = A.z - s * lx + c * lz; o.y = -4.6 + Math.sin(t * 1.3 + i) * .25;
        if(inAq){ o.hd = Math.atan2(P.x - o.x, P.z - o.z); o.a.play('idle'); put(o, false); pose(o, 'wave', t); if(R() < dt * .03) say(o, pick(['👋 Chào bạn trong thuỷ cung!', '🐠 Đàn cá hôm nay đông lắm!', '🤿 Bình dưỡng khí còn đầy, lặn thêm chút!']), 2.6); }
        else { const tx = -Math.sin(th) * 11 * dir, tz = Math.cos(th) * 8.6 * dir; o.hd = Math.atan2(c * tx + s * tz, -s * tx + c * tz); o.a.play('walk'); const ac = o.a.acts.walk; if(ac) ac.timeScale = .45; put(o, false); pose(o, 'swim', t); } }; }); }

  /* ============================== KHUNG HÌNH: ẩn/hiện theo khoảng cách (như bots_cbd_sky.js) ============================== */
  const FAR = (LOW ? 60 : 85) ** 2, ZB = {swiss:{x0:-850, x1:-250, z0:-500, z1:250}, palm:{x0:250, x1:1050, z0:520, z1:1320}}; let tick = 0; const awake = {swiss:false, palm:false};
  for(const o of NPC){ o.a.g.visible = false; if(o.prop) o.prop.visible = false; }
  HOOK.onFrame.push((dt, T) => { dt = Math.min(dt || 1 / 60, .1); T = T || performance.now() / 1000; tick -= dt;
    if(tick <= 0){ tick = .5; for(const z of ['swiss', 'palm']){ const Z = ZB[z]; const d = W.inside ? 1e9 : Math.hypot(Math.max(Z.x0 - P.x, 0, P.x - Z.x1), Math.max(Z.z0 - P.z, 0, P.z - Z.z1)); awake[z] = d < 120; }
      const c = W.camera.position; for(const o of NPC){ const v = awake[o.zone] && !o.off && ((o.x - c.x) ** 2 + (o.z - c.z) ** 2 < FAR); if(o.a.g.visible !== v){ o.a.g.visible = v; if(o.prop) o.prop.visible = v; if(!v){ o.col.x = 1e9; if(o.bubble){ removeLabel(o.bubble); o.bubble = null; } } } } }
    for(const o of NPC){ if(!awake[o.zone]) continue; if(o.bubble){ o.bubbleT -= dt; if(o.bubbleT <= 0){ removeLabel(o.bubble); o.bubble = null; } }
      if(o.a.g.visible) o.a.mixer.update(dt); if(o.upd) o.upd(dt, T); } });   /* hoạt hình trước, tư thế ghi đè sau */
  const out = {npc:NPC.length, swiss:NPC.filter(o => o.zone === 'swiss').length, palm:NPC.filter(o => o.zone === 'palm').length, props:PROPS.length};
  Object.defineProperty(out, 'list', {value:NPC, enumerable:false}); console.info('[Bot Thụy Sĩ + Palm]', out); return out;
}
