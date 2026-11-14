# QC World – Nghiên cứu & thiết kế đồ hoạ (S-GFX)

> Mục tiêu: nhìn **tỉ mỉ, thật như render Blender** nhưng vẫn **mượt trên Intel Iris Xe** (nghẽn ở số lượt vẽ, ~40 µs/lượt).
> Sản phẩm của đợt nghiên cứu này:
> - `js/gfxkit.js` – bộ dựng đồ hoạ dùng lại được (vật liệu PBR thủ tục, kính có phòng bên trong, hình vát cạnh, cây "bông xốp", cau, đèn đường, mái hiên, dây đèn, bóng AO giả, 8 công trình mẫu).
> - `gfx_demo.html` – phòng thử: **TRƯỚC** (chép đúng cách dựng hiện tại của `downtown.js` / `foodstreet.js` / `riverside.js`) vs **SAU** (gfxkit), cùng một ánh sáng như `world.html`.
> - `gfx_shots/` – ảnh so sánh chụp bằng Edge headless.
>
> Không sửa file nào của phiên khác. Mọi đề xuất áp vào game nằm ở **mục 8** (file, hàm, đoạn thay cụ thể).

---

## 0. Tóm tắt nhanh

**Vì sao hiện tại nhìn "thô":** hộp cạnh sắc 90°, cửa sổ là ảnh vẽ phẳng dán lên hộp, kính trong suốt nên "biến mất", vật liệu màu trơn (nhựa), không có tiếp xúc đất (vật thể lơ lửng), cây là 3 quả cầu, đèn đường cao 3 m (thật: 8–10 m), môi trường phản chiếu chỉ có bầu trời trơn.

**10 nâng cấp đáng giá nhất (theo thứ tự ưu tiên – lợi ích/chi phí):**

| # | Nâng cấp | Ăn tiền ở đâu | Chi phí Iris Xe |
|---|---|---|---|
| P0-1 | **Kính có phòng bên trong** (interior mapping) cho mọi toà/nhà | Toà nhà "sống" ngay: thấy bàn, trần, đèn; đêm phòng sáng ngẫu nhiên | 0 lượt vẽ thêm, ~60 phép tính/điểm ảnh trên mặt kính |
| P0-2 | **Đường chân trời + mặt đất trong envScene** (chỉ cho PMREM) | Kính/kim loại phản chiếu thành phố thay vì trời trơn | 0 khi chạy (chỉ tốn lúc đổi giờ) |
| P0-3 | **Mặt dựng có chiều sâu**: đố đứng, băng spandrel mỗi sàn, lam, góc toà | Bóng đổ của đố lên kính = cảm giác thật | +1 lượt vẽ/toà (gộp), ~2–5k tam giác |
| P0-4 | **Vát cạnh** (`cbox`) cho mọi khối kiến trúc/đồ đạc | Cạnh bắt sáng như Blender | chỉ tam giác (~40/hộp), 0 lượt vẽ |
| P1-5 | **Vật liệu PBR thủ tục** (albedo + normal + roughness/AO): vữa, bê tông, gỗ, đá ốp, terrazzo, gạch, cỏ, gạch hồ bơi, pin mặt trời, vảy kim loại | Bề mặt có vi chi tiết, hết "nhựa" | +2 lần đọc texture/điểm ảnh, tạo lúc nạp ~20–60 ms/bộ |
| P1-6 | **Bóng AO giả dưới chân** (decal) + AO trong texture | Vật thể "đứng" trên đất | 1 lượt vẽ chung (trong suốt) |
| P1-7 | **Cây bông xốp** (thẻ lá, pháp tuyến cầu, AO theo đỉnh, gió) + InstancedMesh | Cây mềm, có khối như ảnh thật | 2 lượt vẽ/loài (instanced) |
| P1-8 | **Tỉ lệ thật** cho đèn đường, cửa, tầng, lan can, vỉa hè | Mắt hết thấy "đồ chơi" | 0 |
| P2-9 | **Đèn đêm có chủ đích**: đèn âm trần, dây đèn, đèn hồ bơi, glow | Cảnh đêm đẹp như ảnh quảng cáo BĐS | dùng W.GLOW sẵn có |
| P2-10 | **Công trình chủ lực làm lại**: toà Downtown, phố ẩm thực, siêu biệt thự, campus công nghệ, văn phòng trong | Nơi người chơi nhìn nhiều nhất | xem ngân sách mục 5 |

---

## 1. Khảo sát hiện trạng (đọc code ngày 14/11/2026)

| Chỗ | Cách dựng hiện tại | Vì sao thô |
|---|---|---|
| `world.html` renderer | ACES, exposure .5, sun 3 + hemi .5, PMREM từ `Sky`, sương mù 160–1100 m, mức Thấp: không hậu kỳ, bóng 1024 px / ±28 m, cập nhật cách khung | Ổn. Thiếu: env chỉ có trời (kính phản chiếu trời trơn, nửa dưới env tối) và không có AO nào ở mức Thấp |
| `world.html` `MAT.glass` | `MeshPhysicalMaterial` màu 0x22313f, clearcoat | Gần như đen, không thấy bên trong |
| `downtown.js` `FACADE` + `build()` | `BoxGeometry` thân toà + texture canvas 256 px vẽ ô cửa (lặp 6,4 × 14,4 m), đèn đêm là emissiveMap | Ô cửa phẳng, không có đố/lam/spandrel nổi, cạnh hộp sắc; 13 toà cùng 1 bộ texture → lặp lại dễ thấy; viền LED màu bão hoà khắp nơi |
| `downtown.js` `tree()` | trụ + 3 `IcosahedronGeometry(r,1)` | Cây low-poly, không có lá |
| `world.html` `lampPost()` | trụ 3 m + cầu đèn | Đèn đường thật cao 8–10 m (đường 7–8 m: cột 8 m, cách 25–30 m) |
| `foodstreet.js` dãy nhà | hộp tường màu trơn, tấm kính `opacity .32`, mái hiên là hộp dày 8 cm, ban công = tấm đá + 2 quả cầu cây | Kính trong suốt → nhìn xuyên vào hộp đặc; không có phào chỉ, cửa chớp, sắt hoa, biển hiệu đúng kiểu VN |
| `riverside.js` biệt thự | hộp trắng + tường ốp gỗ (canvas), kính `opacity .28`, hồ bơi là hộp xanh phát sáng | Không có khung bao dày, không lam, hồ bơi không có lòng/đáy/gạch, không cây cảnh |
| `perf.js` `batchStatic` | gộp vật liệu màu trơn thành vertex-color | Rất tốt cho lượt vẽ. Lưu ý: vật liệu có `userData.noMerge` (kính interior, emissive) được giữ nguyên |

**Kết luận:** vấn đề không nằm ở ánh sáng (đã ổn) mà ở **hình học thiếu chiều sâu + vật liệu thiếu vi bề mặt + kính "rỗng" + tỉ lệ**. Đây đúng là những thứ sửa được mà **không tăng lượt vẽ**.

---

## 2. Nguyên tắc "nhìn như Blender" mà vẫn nhẹ

1. **Không có cạnh nào sắc 90°.** Ngoài đời mọi cạnh đều bo/vát 1–5 cm → có một dải sáng mảnh ở cạnh. Đây là dấu hiệu số 1 để mắt nhận "thật". (`cbox(w,h,d,c)`)
2. **Mặt dựng phải có chiều sâu 10–80 cm**: đố nhôm nhô 16 cm, lam 60–80 cm, ô cửa lùi 15–25 cm, phào chỉ 15 cm. Bóng của chúng đổ lên kính/tường mới tạo hình khối.
3. **Kính = phản chiếu + nội thất.** Kính tòa nhà ban ngày nhìn tối + phản chiếu trời, nhưng thấp thoáng trần đèn, vách, bàn ghế. Không bao giờ để kính trong suốt nhìn xuyên vào hộp rỗng.
4. **Vật liệu có vi bề mặt:** normal map nhẹ + độ nhám thay đổi + AO ở rãnh. Albedo nằm trong vùng vật lý (không dùng trắng tuyệt đối 0xffffff – vữa trắng thật ≈ 0xf0eee8; asphalt ≈ 0x2e3034).
5. **Môi trường phản chiếu phải có đường chân trời và mặt đất.**
6. **Tiếp xúc đất:** bóng mềm/AO dưới chân mọi công trình, chậu cây, bàn ghế.
7. **Cây mềm & có khối:** nhiều thẻ lá, pháp tuyến hướng ra ngoài tán, phía trong/dưới tối hơn, gió nhẹ.
8. **Tỉ lệ thật** (mục 4 có bảng kích thước).
9. **Màu tiết chế 60-30-10:** 60% màu nền trung tính, 30% vật liệu tự nhiên (gỗ/đá/cây), 10% điểm nhấn. Đèn ấm 2700–3000 K cho nhà ở/quán, 4000 K văn phòng.
10. **Đêm có câu chuyện:** cửa sổ sáng ngẫu nhiên (40–60%), đèn âm trần, đèn hắt cây, dây đèn, đèn hồ bơi.

---

## 3. Kỹ thuật three.js (r160) – cái nào dùng, giá bao nhiêu

| Kỹ thuật | Trong gfxkit | Chi phí trên Iris Xe | Ghi chú |
|---|---|---|---|
| **PBR thủ tục** (`genSet`): sinh albedo + normal (Sobel từ bản đồ độ cao) + ORM (R = AO, G = độ nhám) bằng JS, `DataTexture` có mipmap | ✅ 20 công thức | Lúc nạp: ~15–60 ms/bộ 256² (Thấp) – 4× ở 512²; khi vẽ: 3 lần đọc texture | UV theo **mét** → texture không kéo giãn; không dính bản quyền |
| **Hộp vát cạnh** `cbox` (ExtrudeGeometry, bevelSegments 1) | ✅ | ~40 tam giác/hộp, nhớ lại theo kích thước | Gộp theo vật liệu bằng `Kit` |
| **Interior mapping** (kính có phòng) – tia nhìn đi vào lưới phòng ảo trong hệ tiếp tuyến lấy từ `dFdx/dFdy` (không cần tangent) | ✅ `M.glassOffice`, `M.glassHome` | 0 lượt vẽ thêm; ~60 phép tính/điểm ảnh kính | Kỹ thuật của Joost van Dongen (2008). Chạy cả mặt cong (toà vòng). Đêm: phòng sáng theo `uLit` |
| **Env có đường chân trời** (`skyline({basic:true, ground:true})` đặt vào envScene trước PMREM) | ✅ | 0 khi chạy | Đổi màu theo đêm bằng `setNight` |
| **AO nướng sẵn**: AO trong texture (rãnh tối), decal AO dưới chân, AO theo đỉnh cho tán lá | ✅ | 1 lượt vẽ trong suốt chung | Thay cho SSAO |
| SSAO / GTAO / N8AO (hậu kỳ) | ❌ (chỉ đề xuất cho mức Cao) | 3–8 ms ở 1080p trên GPU tích hợp | Hậu kỳ trên máy này đã đo 9–14 ms (memory S4.1) → không dùng ở mức Thấp |
| **Bloom chọn lọc** | dùng `CINEFX` có sẵn (Vừa/Cao), Thấp dùng `GLOW` | — | gfxkit có `makeGlow()` y như `W.GLOW` |
| **Cây thẻ lá** (`treeGeo`) + `forest()` InstancedMesh | ✅ 6 loài + cau | 2 lượt vẽ/loài cho cả rừng | alphaTest + alphaToCoverage (khi có MSAA); pháp tuyến cầu, AO theo đỉnh, gió trong vertex shader |
| LOD / impostor cho toà xa | đề xuất | — | Dùng `markFar` có sẵn; toà > 400 m có thể thay bằng hộp kính interior 1 lượt vẽ |
| Tone mapping AgX (r160 có `THREE.AgXToneMapping`) | đề xuất thử | 0 | Highlight bớt cháy, màu kiến trúc "phim" hơn ACES; cần chỉnh lại exposure (~0.75) |
| Sương mù độ cao / khí quyển | đề xuất | ~0 | Chèn vào `fog_fragment` theo `vWorldPosition.y` cho chiều sâu thành phố |

**Không dùng ở mức Thấp:** SSR, SSAO, bóng mềm PCSS, texture > 1024², mô hình scan > 20k tam giác/vật (memory S1.1: boulder 66k, Xbot 49k từng gây lag).

---

## 4. Thiết kế từng loại công trình

Mỗi mục: **tham khảo → kích thước chuẩn → chi tiết cần có → bảng màu → vật liệu → dựng bằng gfxkit**.

### 4.1 Toà văn phòng cao tầng (Downtown)

**Tham khảo kiến trúc:** toà văn phòng hạng A ở Q1/Thủ Thiêm, Singapore, Thượng Hải: đế (podium) 2–3 tầng có **sảnh kính lùi vào** sau **hàng cột đá**, **mái đón** mỏng có đèn âm; thân **tường kính (curtain wall)** có đố đứng nhô, **băng spandrel** che sàn mỗi tầng; đỉnh có **lam che thiết bị** và viền đèn mảnh.

**Kích thước chuẩn:**
- Cao tầng văn phòng 3,6–4,2 m (sàn đến sàn); sảnh 6–9 m (2 tầng).
- Đố đứng (mullion) 1,5–1,6 m; rộng 5–8 cm, nhô 15–20 cm. Lam đứng 60–80 cm, cách 1,2–3,2 m.
- Spandrel (băng che sàn) cao 0,9–1,1 m mỗi tầng.
- Mái đón: dày 25–35 cm, đua 4–5 m, cao 4,5 m.
- Cửa xoay đường kính 2,6–3 m.

**Chi tiết nên có:** sảnh kính lùi 1,5 m + cột đá 0,7 m cách 6 m; trụ góc đá; gờ chuyển đế–thân; đố + spandrel + góc toà; đỉnh: tường chắn mái + viền LED mảnh + khối lam kỹ thuật + 2 khối máy; cột anten (toà HQ); sân lát đá, cây bóng mát, đèn đường 8 m, ghế đá.

**Bảng màu:** kính xám xanh `#66788a` (F0 ≈ 0,15–0,2), đố than chì `#2a3036`, spandrel `#1f262e`, đá ốp sáng `#d8d3c8`, đá chân `#9a968f`, nhôm trắng `#e9e9e4`, nhấn: viền LED trắng xanh `#9fe8ff` (chỉ 1 đường mảnh).

**4 kiểu** (`style`): `curtain` (kính + đố tối), `fins` (lam đứng trắng – nhiệt đới), `timber` (khung gỗ – campus thấp tầng), `setback` (giật cấp 60%, vườn trên cao + lan can kính).

```js
import { createGFX } from './js/gfxkit.js';
const GFX = createGFX({ quality: W.QUAL, msaa: !CINE });          // 1 lần, đặt vào W.GFX
const t = GFX.build.tower({ w:22, d:18, h:96, style:'curtain', name:'BÌNH PHAN TECH HUB', mast:true,
                            glow:(x,y,z,s,c,k)=>W.GLOW.add(x+X, y, z+Z, s, c, k) });
t.group.position.set(X, 0, Z); W.scene.add(t.group);
```

### 4.2 Campus công nghệ (lấy NGÔN NGỮ kiến trúc, không sao chép công trình/logo)

| Cảm hứng | Đặc trưng kiến trúc thật | Phiên bản QC World (gfxkit) |
|---|---|---|
| Toà "vòng nhẫn" (Apple Park, Foster + Partners) | Vòng 4 tầng Ø≈461 m, ~800 tấm kính cong cao ~14 m, mái đua kính mỏng ở mỗi sàn, mái pin mặt trời, sân trong là vườn cây ăn trái | `ringHQ({ro:38, ri:24, floors:4})`: kính cong interior mapping (phòng uốn theo mặt cong), mái đua trắng 2,7 m mỗi sàn, mái pin, sân trong cỏ + hồ + cây, đố đứng 3,2 m |
| Mái lều "vảy rồng" (Google Bay View, BIG + Heatherwick) | Mái lều cong dạng dây xích phủ ~50–90 nghìn tấm pin bạc xếp vảy, cửa sổ mái (clerestory) ở phần mái nhô, 2 tầng làm việc chia "khu" 40–80 người quanh sân | `canopyHall({w:44, d:26})`: hộp kính 2 tầng dưới mái cong 3 nhịp phủ vảy kim loại, mặt dưới gỗ, dải kính mái quanh mép, cột thon lớn |
| Campus gỗ thấp tầng (Microsoft Redmond) | 4–5 tầng, kết cấu gỗ khối (mass timber), làng nhiều toà quanh quảng trường, mái xanh/pin | `tower({style:'timber', podium:0, floor:4.2})`: khung gỗ sâu 42 cm, mái cỏ |
| Vòm cây xanh (Amazon Spheres) | Vòm kính lưới, rừng nhiệt đới bên trong là chỗ làm việc | `dome({r:10})`: vòm geodesic, khung trắng, cây bên trong |
| Làng R&D kiểu châu Âu (Huawei Lianqiu Lake / Ox Horn, HENN) | 8 khu, ~104 toà theo phong cách châu Âu, tàu điện nội bộ, hồ trung tâm | *Đề xuất* (chưa làm): 1 khu "làng" mái ngói dốc + tháp đồng hồ + tàu điện nhỏ chạy vòng hồ – hợp với vùng đất cao nguyên `highland.js` |

**Nội thất văn phòng tech (tham khảo chung các trụ sở lớn):** sàn bê tông mài/gỗ sồi, trần hở sơn tối + nan gỗ hút âm, đèn thả dạng thanh, bàn bench gỗ sồi + vách nỉ xanh, phòng họp vách kính khung đen có dải mờ, **tường rêu**, **bậc ngồi khán đài** (town-hall stairs), quầy cà phê, góc sofa, cây lá to, cửa kính kịch trần nhìn ra thành phố. → `office()`.

**Kích thước:** sàn–trần 4,2 m (văn phòng hạng A có trần hở), bàn 1,6 × 0,8 m cao 0,74 m, vách nỉ 0,42 m, lối đi chính ≥ 1,8 m, phòng họp 5 × 6 m cho 6–8 người, bậc khán đài cao 0,45 m sâu 0,85 m.

**Bảng màu nội thất:** nền `#a7a49e` (bê tông) + gỗ sồi `#c9a275` + than `#2b2e33`; nhấn nỉ xanh rêu `#5e7d6a`, cam đất `#c96a3b`, vàng mù tạt `#d9b44a`.

### 4.3 Siêu biệt thự (theo ảnh Bình gửi)

**Ngôn ngữ thiết kế (từ 2 ảnh tham khảo):** hiện đại nhiệt đới – **khung bao trắng dày** ôm trọn tầng 2, **tầng 2 đua ra** che hiên tầng trệt, **kính kịch trần** khung đen mảnh, **lan can kính** không khung, **lam gỗ đứng**, **tường đá ốp sẫm** làm điểm nhấn, **mái xanh** (trồng cỏ), **hồ bơi tràn** lát đá xanh rêu có vân, viền đá trắng, **sàn gỗ** + ghế tắm nắng + dù, **cau vua/chà là**, bụi cây cắt tròn, lối đá bước trên cỏ, đèn âm trần + đèn hồ bơi ban đêm.

**Kích thước:** lô 40 × 36 m; nhà 17–18 × 9–12 m; tầng trệt cao 4,0 m, tầng trên 3,4–3,6 m; khung bao dày 0,45–0,5 m; ban công sâu 2–2,4 m; lan can kính 1,1 m; hồ bơi 15 × 4,4 m sâu 1,2–1,6 m, mép tràn đá 0,3–0,5 m; sàn gỗ ≥ 4 m; đá bước 1,1 × 0,55 m cách 0,9 m.

**Bảng màu:** vữa trắng `#f0eee8`, đá sẫm `#4d5054`, gỗ `#9a6a42`, đá sáng `#d8d3c8`, gạch hồ `#1f4b4c` có vân trắng, cỏ `#4c7a2a`→`#6c8c3a`, vải trắng ngà `#f1ede6`.

```js
const v = GFX.build.villa({ glow:(x,y,z,s,c,k)=>W.GLOW.add(x+X,y,z+Z,s,c,k) });
v.group.position.set(X, groundH(X,Z), Z); v.group.rotation.y = rot; W.scene.add(v.group);
```

### 4.4 Nhà phố / shophouse + quán cà phê Việt Nam

**Tham khảo:** nhà ống Hà Nội/Sài Gòn/Hội An, phố cà phê vỉa hè: mặt tiền 4–6 m; **tường vữa màu** (vàng Hội An, xanh ngọc nhạt, kem); **phào chỉ** mỗi tầng + mái chắn trên cùng; **cửa đi kiểu Pháp** + **cửa chớp lá sách xanh** mở áp tường; **ban công sắt hoa** + **hoa giấy** rủ; cục nóng điều hoà; tầng trệt **mở toang** (cửa xếp gỗ), **mái hiên vải sọc có diềm răng cưa**, **hộp đèn biển hiệu** + **biển dọc**; bên trong: quầy bar gỗ + mặt đá mài, kệ chai lọ, máy pha, tường gạch trần, **bảng menu phấn**, đèn thả bóng Edison, quạt trần; vỉa hè **gạch terrazzo 40 × 40**, **ghế nhựa thấp + bàn nhỏ**, ghế mây, cây bóng mát có ô gang, **dây đèn** giăng từ mái hiên ra cây.

**Kích thước (TCVN 9411:2012 / quy chế địa phương):** tầng 1 cao 3,9–4,2 m, tầng 2 3,4–3,6 m, các tầng trên 3,3 m; cao nhà ≤ 4× bề rộng; ban công đua ≤ 0,9–1,4 m tuỳ lộ giới; cửa đi 1,1–1,2 × 2,4–2,6 m; lan can 1,0–1,1 m; vỉa hè 3–6 m, bó vỉa cao 15–20 cm; ghế nhựa thấp cao 25–30 cm, bàn 45 cm.

**Bảng màu quán:** tường `#e0b04f` (vàng mù tạt), phào `#f3ead7`, cửa/cửa chớp `#2f5d4a` (xanh rêu), mái hiên sọc `#1f6f78`/`#f2e8d5`, biển `#1d3b33` chữ kem, gạch trần `#9a4a32`, đèn 2700 K.

```js
GFX.build.cafeStreet({ glow });                          // dãy 3 căn + vỉa hè + đường (mẫu)
GFX.build.shophouse(kit, { x, w:6.2, wall:0xe0b04f, kind:'cafe', sign:'Cà Phê Góc Phố', floors:[4.1,3.4,3.4] }, glow);  // từng căn
```

### 4.5 Cửa hàng
`shophouse({kind:'shop'})`: mặt kính khung màu có phòng bên trong (kệ, đèn), biển hộp đèn; `kind:'shutter'`: cửa cuốn tôn sóng + hộp cuốn + biển đỏ chữ kem (tạp hoá). Tiệm lớn (showroom): dùng `tower({podium:7.6, h:≈12})`.

### 4.6 Cây xanh (`treeGeo` / `addTree` / `forest`)

| Loài (`kind`) | Hình mẫu VN | Cao | Ghi chú |
|---|---|---|---|
| `shade` | sao, dầu, xà cừ (cây đường phố) | 7–9 m, tán 6–7 m | 150 thẻ lá |
| `tier` | bàng Đài Loan (tán tầng) | 6 m | tán phẳng 4 tầng – rất "kiến trúc" |
| `round` | sứ, lộc vừng (cây sân vườn) | 3–4 m | |
| `bush` / `flower` | bụi cắt tròn / hoa giấy | 0,8–1,4 m | |
| `fig` | bàng Singapore trong chậu | 1,5–2,5 m | lá to |
| `palm` | cau vua / chà là | 6,5–9,5 m | lá kép có texture |

### 4.7 Đèn đường & đồ phố
`streetLight(kit,x,z,ry,'road'|'garden'|'bollard')`: **đường phố 8 m** (cột bát giác thon, cần 1,9 m, chao LED dẹt), **lối đi 3,5 m**, **bollard 0,8 m**. Bố trí 1 bên, cách 25–30 m (đường 7–8 m).

### 4.8 Công viên (gợi ý cho phiên công viên)
Lối đi terrazzo/đá bước, bồn cây viền đá vát cạnh, cây `tier` + `shade` + bụi `flower`, ghế gỗ trên chân bê tông, đèn `garden` 3,5 m + `bollard`, hồ nước `M.water` (normal map chạy), decal AO dưới ghế/bồn. Bảng màu: cỏ `#4c7a2a`, đá `#d8d3c8`, gỗ `#c9a275`.

### 4.9 Xe (gợi ý cho phiên xe)
Thân xe: vát cạnh lớn (bevelSegments 3), sơn `MeshPhysicalMaterial` clearcoat 1 (chỉ siêu xe ở gần, xa thì Standard), kính tối phản chiếu (`M.glassDark`), lốp có hông (trụ + torus), mâm kim loại `M.chrome`, đèn pha emissive + GLOW ban đêm, decal AO dưới gầm (rất quan trọng – xe hết "lơ lửng").

---

## 5. Ngân sách hiệu năng cho Iris Xe

Ràng buộc đã biết (memory S1.2–S3.1): mỗi lượt vẽ ≈ 40 µs CPU; cảnh nặng hiện ≈ 300 lượt / 14 ms. Hậu kỳ tốn 9–14 ms → tắt ở mức Thấp.

| Hạng mục | Lượt vẽ | Tam giác | Texture |
|---|---|---|---|
| 1 toà văn phòng (gfxkit) | 10–14 trước gộp; ≈ 6–8 sau `batchStatic` (vật liệu dùng chung giữa các toà) | 15–40k | dùng chung bộ 256² |
| 1 dãy nhà phố 3 căn + vỉa hè | ≈ 30 trước gộp (biển hiệu/menu riêng); ≈ 20 sau gộp | 30–60k | biển hiệu 1024×96 |
| 1 siêu biệt thự + sân vườn | ≈ 25 | 60–90k | |
| Cả rừng 1 loài cây (instanced) | 2 | 600 tam giác × số cây | lá 256² RGBA |
| Kính interior | 0 thêm (thay vật liệu) | — | 0 |
| Env đường chân trời | 0 khi chạy | — | — |
| **Toàn cảnh** | **≤ 300** (giữ như hiện tại) | ≤ 1,5 M | ≤ 200 MB |

Quy tắc: mọi vật liệu dùng chung qua `GFX.M` (không `new` vật liệu mỗi toà); `Kit` gộp theo vật liệu; vật thể động gắn `userData.dynamic`; texture thủ tục 256² ở mức Thấp, 512² ở Vừa/Cao.

---

## 6. Kết quả đo trên cảnh demo

Đo bằng Edge headless trên **chính Intel Iris Xe** (ANGLE D3D11), 1600×900, pixelRatio 1, MSAA, bóng 2048 vẽ lại MỖI khung (game Thấp: 1024, cách khung → nhẹ hơn).
Máy đang bận (nhiều phiên) nên đo **xen kẽ A/B 4 vòng, lấy min**. `ms` = render + chờ GPU; `GPU` = timer query. Lượt vẽ đã gồm lượt vẽ bóng.

| Cảnh | TRƯỚC: lượt vẽ / tam giác / ms / GPU | SAU: lượt vẽ / tam giác / ms / GPU |
|---|---|---|
| Toà văn phòng 96 m | 94 / 3,5k / 8,9 / 5,4 | **41** / 20k / 10,7 / 6,2 |
| Dãy quán cà phê | 43 / 6,6k / 12,2 / 7,1 | 102 / 24k / 18,5 / 10,7 |
| Siêu biệt thự | 29 / 2,4k / 13,0 / 6,7 | 55 / 29k / 16,4 / 8,6 |
| 4 kiểu toà (sau) | – | 146 / 73k / 15,6 / 8,4 |
| Campus (sau) | – | 95 / 99k / 18,1 / 8,4 |
| Văn phòng trong (sau) | – | 71 / 46k / 21,9 / 13,7 |

Nhận xét: toà văn phòng ít lượt vẽ hơn bản cũ, chậm thêm ~1–2 ms. Quán cà phê/biệt thự tốn thêm 3–6 ms → **đã tối ưu thêm sau đợt đo này** (gộp vữa/cửa chớp/vải mọi màu về 1 vật liệu tô màu theo đỉnh, gộp màu sơn trơn, đèn/biển hiệu không đổ bóng, mức Thấp bỏ normal map mặt đất + tắt alpha-to-coverage lá) nhưng **CHƯA đo lại** – việc đầu tiên khi áp vào game là đo lại bằng `__gfx.ab('cafe',4)`.
Ảnh so sánh: `gfx_shots/*_split_*` (trái TRƯỚC, phải SAU), `*_after_*` cho cảnh chỉ có bản mới; hậu tố `ngay/hoanghon/dem`.

---

## 7. Lộ trình áp vào game (ưu tiên)

| Bước | Việc | Ai / file | Ước lượng |
|---|---|---|---|
| P0 | Nạp `gfxkit` vào `W` + env đường chân trời | phiên chính – `world.html` | nhỏ |
| P0 | Thay kính toà Downtown bằng `M.glassOffice` + mặt dựng sâu (`tower()`) | `downtown.js` (phần 4) | vừa |
| P1 | Cây `shade`/`tier` + đèn đường 8 m cho Downtown, Phường, phố ẩm thực | `downtown.js`, `ward.js`, `foodstreet.js` | vừa |
| P1 | Siêu biệt thự: 4 căn ven đầm + đảo siêu biệt thự | `riverside.js`, `resort.js` | vừa |
| P1 | Phố ẩm thực → `shophouse()` | `foodstreet.js` | vừa |
| P2 | Campus công nghệ mới (vòng kính + mái lều + khối gỗ + vòm) | module mới, đặt trên `highland.js` | lớn |
| P2 | Văn phòng trong (`office()` làm mẫu bố trí, vật liệu, đèn) | `interior.js` | lớn |
| P3 | Thử AgX, sương mù độ cao, N8AO cho mức Cao | `world.html` | nhỏ |

---

## 8. Đề xuất áp vào file của phiên khác (phiên chính áp sau)

> **Va chạm:** `tower()`, `villa()`, `cafeStreet()` trả về `col = {boxes, circles, plats}` theo toạ độ cục bộ. Áp vào game:
> ```js
> import { applyCol } from './js/gfxkit.js';
> const v = W.GFX.build.villa({glow}); v.group.position.set(X,Y,Z); v.group.rotation.y=ry; W.scene.add(v.group);
> applyCol(v.col, X, Y, Z, ry, { boxes:W.boxes, circles:W.circles, addPlat:W.addPlat });
> ```
> (hộp xoay lẻ góc được thay bằng hộp bao; sàn gỗ/viền hồ là `plats` cao .45 m). Vẫn phải tự kiểm tra lại bằng cách đi quanh công trình – quy tắc "không đi xuyên vật thể".

### 8.1 `world.html`
1. **Nạp kit** (sau khi tạo `MAT`, trước khi nạp module):
   ```js
   import { createGFX } from './js/gfxkit.js';
   const GFX = createGFX({ quality: QUAL, msaa: DIRECT });
   // trong đối tượng W: thêm GFX
   ```
   và trong `setTime(i)` thêm: `GFX.setTime(p.elev<0?.05:p.elev<8?.55:1, p.night); GFX.envCity.userData.setNight(p.night);`
   và trong vòng lặp khung: `GFX.update(dt);`
2. **Env có thành phố** – trong `refreshEnv()`:
   ```js
   // tạo 1 lần:
   GFX.envCity = GFX.skyline({ basic:true, ground:true, n:60, r0:160, r1:300 });
   function refreshEnv(){ if(envRT) envRT.dispose(); scene.remove(sky); envScene.add(sky, GFX.envCity);
     envRT=pmrem.fromScene(envScene); envScene.remove(sky, GFX.envCity); scene.add(sky); scene.environment=envRT.texture; }
   ```
3. **Kính chung**: `MAT.glass = GFX.M.glassOffice` (hoặc `glassHome` cho nhà ở) – mọi nơi dùng `MAT.glass` tự đẹp lên.
4. **Đèn đường**: `lampPost(x,z)` giữ nguyên cho lối đi bộ đảo; đường xe dùng `GFX.streetLight(kit, x, z, ry, 'road', glowFn)` (cột 8 m).

### 8.2 `downtown.js`
- Phần 4 `build(t)`: thay khối thân + đế bằng
  ```js
  const st = {glass:'curtain', hq:'curtain', twist:'fins', cylinder:'curtain', spire:'fins', setback:'setback', artdeco:'setback', brick:'timber', dark:'curtain'}[t.style];
  const tw = W.GFX.build.tower({ w:t.w, d:t.d, h:t.h, style:st, name:t.name.toUpperCase(), mast:t.style==='hq'||t.style==='spire', seed:towers.length+1, site:0,
                                 glow:(x,y,z,s,c,k)=>W.GLOW.add(t.x+x, y, t.z+z*t.face, s, c, k) });
  tw.group.position.set(t.x,0,t.z); if(t.face<0) tw.group.rotation.y=Math.PI; scene.add(tw.group);
  ```
  giữ nguyên phần lối vào/INTER/boxes/label. (Kiểu `cylinder` nên dùng `ringHQ` thu nhỏ hoặc trụ kính `cylM` + `M.glassOffice` – interior mapping chạy trên mặt cong.)
- `tree()` → `W.GFX.addTree(kit,'shade',x,0,z,.9)`; nhiều cây → `W.GFX.forest('shade', list)` (2 lượt vẽ cho cả phố).
- `lampPost` dọc đường xe → `streetLight(...,'road')`, khoảng cách 25–30 m.

### 8.3 `foodstreet.js`
- Vòng `SHOPS.forEach` (khối nhà 2 tầng, kính, mái hiên, ban công) → `W.GFX.build.shophouse(k, {x:cx, w, depth:d, kind: s.kind==='cafe'?'cafe':'shop', wall:…, sign:s.name, floors:[4.2,4.2]}, glow)`; giữ nguyên `INTER`, `boxes`, `cafeOrders`, nhà hàng đi vào được (walkIn) dùng `kind:'cafe'` (tầng trệt rỗng có nội thất).
- Dây đèn: `W.GFX.stringLights(k, a, b, n, sag, glow)`.

### 8.4 `riverside.js` / `resort.js`
- 4 căn ven đầm: thay khối vỏ ngoài bằng `W.GFX.build.villa()` (thu về lô 13 × 11 bằng `group.scale` 0,72 hoặc thêm tham số kích thước) – giữ cầu thang, `addPlat`, `addSeat`, colliders cũ. Đảo siêu biệt thự (`resort.js` mục "đảo siêu biệt thự") dùng nguyên `villa()` cỡ đầy đủ.

### 8.5 `interior.js` (văn phòng trong toà)
- Lấy bố cục/vật liệu từ `office()`: trần tối + nan gỗ, đèn thanh, bench + vách nỉ, phòng họp kính dải mờ, tường rêu, bậc khán đài, quầy cà phê, góc sofa; env trong nhà dùng `roomEnv()` (xem `gfx_demo.html`) thay env bầu trời.

### 8.6 `park.js` / `streetlife.js` / `vehicles.js`
- Công viên: mục 4.8; xe: mục 4.9 – chỉ là gợi ý thiết kế.

### 8.7 `perf.js`
- Không cần sửa: `matSig` đã tôn trọng `userData.noMerge`; vật liệu PBR có map nên không bị đổi sang vertex-color. Có thể thêm: gộp `InstancedMesh` cây vào `ACTORS`-style culling theo khoảng cách.

---

## 9. Tài sản & bản quyền
- Toàn bộ texture/hình trong gfxkit **sinh bằng code** (không tải ảnh). Chữ dùng font hệ thống (Segoe UI, Georgia).
- Tên thương hiệu/logo thật **không** xuất hiện; campus chỉ lấy ngôn ngữ kiến trúc chung (vòng, mái lều, gỗ, vòm).
- Nếu sau này muốn texture scan thật: chỉ dùng **CC0** (Poly Haven, ambientCG) tải về `assets/textures/`, ≤ 1k, có normal + roughness.

## 10. Cách xem & kiểm thử
- Chạy server (ví dụ `serve.py`) rồi mở `http://127.0.0.1:8770/gfx_demo.html`.
- Nút: cảnh (Toà văn phòng · 4 kiểu toà · Quán cà phê · Siêu biệt thự · Campus · Văn phòng mở), **Trước / Sau / So sánh ◫**, Ngày / Hoàng hôn / Đêm, góc nhìn. Kéo chuột trái xoay, phải để dời, lăn để zoom.
- URL: `?s=villa&m=split&t=2&v=1&q=low`.
- Tự động: `window.__gfx.set({scene, mode, time, view})`, `__gfx.bench(40)` → `{calls, tris, msMin, msMed, msP90}`.

## 11. Prompt gợi ý để giao phiên chính áp vào game

> Dán nguyên khối này cho phiên chính (hoặc một phiên mới) khi muốn áp từng phần:

```
Đọc DESIGN_GRAPHICS.md (mục 7–8) và js/gfxkit.js. Áp bước P0 trước:
1) world.html: import createGFX, tạo W.GFX = createGFX({quality:QUAL, msaa:DIRECT}); thêm GFX.update(dt) vào vòng khung,
   GFX.setTime(...) vào setTime(), và đưa GFX.skyline({basic:true,ground:true}) vào envScene trong refreshEnv() (mục 8.1).
2) downtown.js phần 4: thay thân/đế toà bằng W.GFX.build.tower(...) theo bảng đổi kiểu ở mục 8.2, GIỮ NGUYÊN lối vào, INTER, boxes, label, bảo vệ.
3) Cây + đèn đường Downtown theo mục 8.2 (forest 'shade'/'tier', streetLight 'road' 8 m cách 25–30 m).
Backup từng file vào _backup\ trước khi sửa. Sau mỗi bước đo lượt vẽ/thời gian khung ở góc nhìn nặng (Downtown từ cầu, resort nhìn về đảo)
so với trước; không được tăng quá ~10%. Người chơi không được đi xuyên vật thể mới.
```

## 12. Nguồn tham khảo
- Interior mapping: Joost van Dongen 2008; bản three.js của Mohsen Heydari (`three-interior-mapping`), giải thích của Kristian Dixon – https://kristian-dixon.github.io//2025/02/27/InteriorMapping.html ; thảo luận: https://discourse.threejs.org/t/interior-mapping-shader/38415
- Cây thẻ lá/pháp tuyến cầu: https://discourse.threejs.org/t/procedural-instanced-forest-high-performance-real-trees/88610
- Apple Park: https://en.wikipedia.org/wiki/Apple_Park
- Google Bay View: https://www.dezeen.com/?p=1796951 · https://blog.google/outreach-initiatives/sustainability/dragonscale-solar/
- Microsoft Redmond: https://news.microsoft.com/source/features/work-life/the-workspace-of-the-future/ · https://www.geekwire.com/2025/rebooting-redmond-microsofts-new-campus-reflects-ongoing-transformation-uncertain-future/
- Huawei Lianqiu Lake: https://en.wikipedia.org/wiki/Huawei_Lianqiuhu
- Nhà liền kề: TCVN 9411:2012 – https://thuvienphapluat.vn/TCVN/Xay-dung/TCVN-9411-2012-Nha-o-lien-ke-Tieu-chuan-thiet-ke-907721.aspx ; nhà thương mại liên kế TCVN 12872:2020.
- Chiếu sáng đường phố (cột 8 m, cách 25–30 m): tài liệu giải pháp của Rạng Đông – https://thuvien.rangdong.com.vn/bitstream/123456789/632/1/2.%20Gi%e1%ba%a3i%20ph%c3%a1p%20chi%e1%ba%bfu%20s%c3%a1ng%20Duong%20pho.pdf
