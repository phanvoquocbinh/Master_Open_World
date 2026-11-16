# Kế hoạch nâng cấp toàn diện đảo QA/QC Abyssal (16/11/2026)

**Nguồn:** bản đặc tả của Bình "Canyon Overhaul Master Prompt" (PDF 14 trang). Bản sao để các phiên đọc: `_work/overhaul/ABYSSAL_OVERHAUL_SPEC.pdf`.
**Hiện trạng đảo:** `KIEN_TRUC_HIEN_TRANG.md` mục V2.1.

## 1. Điều chỉnh bắt buộc so với bản đặc tả
- **Không dùng tên có thật:**
  - 5 đảo đá vôi (đặc tả gọi theo tên một vịnh có thật) đổi thành **"Quần đảo Đá Vôi Ngọc Bích"** (chỉ bắt chước địa hình đá vôi).
  - Không dùng tên hãng xếp hạng nhà hàng; ghi "Nhà hàng 5 sao".
  - Tên khoá học trên bảng lớp dùng tên công cụ mã nguồn mở (Playwright, JMeter…).
- **Chỗ đặt quần đảo đá vôi:** dải biển trống x −245…95, z −200…−900 (giữa Đảo Ngoại ngữ và Dev City, cách Dev City ≥ 5 m). Bản đặc tả ghi 800 × 800 m nhưng không đủ chỗ, nên dùng vùng ≈ 340 × 700 m.
- **Máy chạy là Intel Iris Xe:**
  - Nội thất chỉ dựng cho toà, tầng hoặc du thuyền mà người chơi đang ở gần; ở xa thì ẩn hoặc gỡ.
  - Vật lặp lại dùng InstancedMesh.
  - Mỗi pha thêm ≤ 150 lượt vẽ khi đứng trong vịnh. FPS ≥ 45.
- **Luật V2 vẫn giữ:**
  - Lối đi trống ≥ 2,5 m.
  - Địa hình liền và mềm, không khe hở, không chớp mặt.
  - Thang máy dùng `liftkit.js`.
  - Điểm M chỉ gọi `teleport`.
  - Đường xe đưa vào `W.V2ROADS` + `W.roadNet`, không có đường cụt.
  - 3 cổng G1 (180, 0, +2), G2 (0, 180, +4), G3 (−180, −16, +2) giữ nguyên.
- **Mỗi pha một phiên, mỗi phiên một file riêng:**
  - Chỉ phiên lõi được sửa `js/abyssal_island.js`.
  - Các phiên khác viết file mới, gọi từ `abyssal_island.js` qua 1 dòng import do phiên lõi để sẵn.
  - Phiên lõi công bố bố cục chung `W.ABY` (bán kính vịnh, đường vành đai, các lô đất) để phiên khác đặt công trình đúng chỗ.
- **Mỗi lúc chỉ 2 phiên con chạy trình duyệt test.** Phiên chính test tích hợp V2 + `?v1` rồi mới đẩy GitHub. Phiên con không chạy git.

## 2. Thứ tự và phân công

| Đợt | Phiên | Phạm vi (theo PDF) | File | Điều kiện bắt đầu |
|---|---|---|---|---|
| 1 | **A · abyss-core** (phiên đồ hoạ đã dựng đảo) | Phần 0 (vật liệu, `lux_textures.js`), Phần 1 (vịnh ×2, bỏ đập, eo biển, bãi cát vàng, bãi đỗ xe, nhà tắm, quán dừa, đường vành đai 2 làn trên cao +15,8, Cầu Vòm Cửa Vịnh, 2 đường dốc), 8 pavilion công cụ + cầu kính, Phần 4 (3 đĩa kính trong Hydro-Pulse Core + bãi đỗ xe ngắm cảnh) | `js/abyssal_island.js`, `js/lux_textures.js` (mới), `js/v2core.js` (ZONES.abyssal) | sau khi xong 5 lỗi đáy vực đang sửa |
| 1 | **B · abyss-sea** | Phần 3: Quần đảo Đá Vôi Ngọc Bích, bến du thuyền, 7–8 siêu du thuyền 3 tầng có nội thất và tour tự chạy; Phần 8: QC Live Stage 84 × 40 m, 160 vòi, 6 hình nước; ca-nô kéo dù, flyboard, mô tô nước, kayak đôi | `js/abyssal_sea.js`, `js/abyssal_yacht.js`, `js/abyssal_stage.js` (mới) | dựng mẫu tàu và đảo ngay; tuyến tàu và vị trí sân khấu cắm vào sau khi A có `W.ABY` |
| 2 | **C · abyss-hotel** | Phần 2: siêu khách sạn "The Royal Lotus-Crescent Palace" 24 tầng ở ốc đảo trung tâm (đảo nâng +14, cầu dẫn 10 m, tĩnh không ≥ 15,5 m), sảnh, tầng tiện ích, phòng thuê | `js/abyssal_hotel.js` (mới) | A xong |
| 2 | **D · abyss-towers** | Phần 6 + 7 + 5: lột xác 2 toà (Academy 12 tầng, Residences 14 tầng), Grand Lobby, bảo vệ, nội thất xuyên kính; 16 shophouse ở tầng đế (bỏ 24 shophouse chân vách); Cafe 3 tầng (trái) + Nhà hàng 5 sao 3 tầng (phải) | `js/abyssal_towers.js`, `js/abyssal_dining_venues.js` (mới) | A xong |
| 3 | **E · abyss-life** | Phần 9 + 10: 6 chu trình sống của bot (cư dân, học viên, xe gia đình, bãi biển, khách mua sắm, khách du thuyền) + phục vụ bàn góc nhìn thứ nhất (hỏi gọi món, khay món 3D, 1 tiếng mới hỏi lại) | `js/bots_abyssal.js`, `js/dining.js` (mới) | B, C, D xong |

## 3. Brief cho từng phiên (Bình có thể copy dán, hoặc để phiên chính tự giao)

### Brief chung (đầu mỗi phiên)
```
Bạn làm cho game three.js "QC World" ở F:\Software\Self-Software\Master Dashboard Open World (V2 mặc định; ?v1 là thế giới cũ).
Đọc trước: docs/ABYSSAL_OVERHAUL_PLAN.md (kế hoạch + điều chỉnh bắt buộc), _work/overhaul/ABYSSAL_OVERHAUL_SPEC.pdf (đặc tả gốc của Bình),
KIEN_TRUC_HIEN_TRANG.md mục V2.1 (hiện trạng đảo), V2_PLAN.md §3, §3b (luật chất lượng V2), js/archKit.js, js/liftkit.js.
Luật: chỉ sửa đúng file của phiên mình; sửa file có sẵn thì backup vào _backup\ trước; không chạy git; không dùng tên địa danh/thương hiệu thật;
file tạm, ảnh chụp, profile trình duyệt để trong _work\<tên phiên>\ (không để ổ C). Chỉ mở trình duyệt test khi phiên chính nhắn "được test".
Xong: báo phiên chính danh sách file + cách test + ảnh chụp ở _work\<tên phiên>\.
```

### A · abyss-core
```
Làm Phần 0 + Phần 1 + 8 pavilion công cụ + Phần 4 của đặc tả (xem bảng ở docs/ABYSSAL_OVERHAUL_PLAN.md mục 2).
- Tạo js/lux_textures.js (6 texture procedural: texTravertine, texTeakDeck, texGraniteCobble, texPersianRug, texFiligreeAlpha,
  texWaterNormal) + bộ vật liệu token (MAT_GOLD_CHAMPAGNE, MAT_TRAVERTINE_WARM…) dùng chung cho mọi phiên.
- Vịnh ×2 (R ≈ 175–185 m), đường vành đai R ≈ 215 m ở +15,8, mở eo biển 65–80 m ra biển phía Bắc–Tây Bắc, bỏ Đập Cổng Trời Thủy Đạo,
  mặt nước vịnh = mặt biển. Nối 3 cổng G1/G2/G3 bằng dốc ≤ 7,5 %. Cập nhật ZONES.abyssal trong v2core.js.
- Bãi cát vàng, bãi đỗ xe biển, 4 cầu thang/dốc xuống cát, 2 nhà tắm, 4 quán dừa + 24 ghế tắm nắng.
- Cầu Vòm Cửa Vịnh (nhịp 60 m, +16, tĩnh không ≥ 15,5 m), 2 đường dốc East/West Canyon Ramps (rộng 7 m, ≤ 7,5 %) vào W.V2ROADS/roadNet.
- 8 pavilion đá Obsidian + vòm vàng thay 8 trụ trắng; cầu kính xanh ngọc khung vàng; không còn nền trắng.
- Hydro-Pulse Core: bãi đỗ xe ngắm cảnh + 3 đĩa sàn kính lounge (y +16, −2, −18).
- Công bố W.ABY = {R_bay, R_road, roadY, strait:{…}, plots:{hotel, towersW, towersE, cafe, restaurant, stage, marina, beach}}
  và để sẵn các dòng import an toàn (try/catch) cho abyssal_hotel.js, abyssal_towers.js, abyssal_dining_venues.js, abyssal_sea.js,
  abyssal_yacht.js, abyssal_stage.js (file chưa có thì bỏ qua). Gỡ 24 shophouse cũ và vỏ 2 cánh cũ khi phiên D bật cờ W.ABY.towersReady.
Nghiệm thu: 0 nền trắng; xe chạy từ đỉnh núi xuống vành đai và bãi đỗ biển; tàu cao 12,5 m chui lọt gầm cầu; 0 lỗi console; FPS không tụt quá 10 %.
```

### B · abyss-sea
```
Làm Phần 3 + Phần 8 của đặc tả trong file mới js/abyssal_sea.js (quần đảo đá vôi, bến, tour), js/abyssal_yacht.js (mẫu siêu du thuyền 3 tầng),
js/abyssal_stage.js (QC Live Stage mới). Không sửa abyssal_island.js – phiên A để sẵn import.
- "Quần đảo Đá Vôi Ngọc Bích": 5 đảo vách dựng đứng, hang vòm ở chân, cây trên đỉnh (InstancedMesh), bọt sóng; trong x −245…95, z −200…−900.
- Siêu du thuyền 42 × 9,5 m, vỏ Shape + ExtrudeGeometry bo cạnh (không ghép hộp), 3 tầng đi bộ được (Main Salon, phòng ăn, Master Suite,
  buồng lái có thuyền trưởng NPC, Sky Lounge, 2 phòng VIP, Sun Deck có Jacuzzi). Chỉ tàu gần người chơi mới dựng nội thất.
- 7–8 tàu chạy tour tự động: cập bến → vòng đảo khách sạn → qua gầm Cầu Vòm → vòng quần đảo đá vôi → về bến. Vé 150 💰, combo 250 💰.
- QC Live Stage 84 × 40 m, 160 vòi InstancedMesh, 6 hình nước đổi mỗi 10 s, không người biểu diễn, không chắn luồng tàu.
- Ca-nô kéo dù (20 💰), flyboard, mô tô nước, kayak đôi – tránh va chạm tàu.
Lấy vị trí bến, sân khấu, tuyến tàu từ W.ABY (phiên A); trước khi có thì dùng hằng số tạm và ghi rõ chỗ cần đổi.
```

### C · abyss-hotel
```
Làm Phần 2 của đặc tả trong file mới js/abyssal_hotel.js tại W.ABY.plots.hotel (đảo trung tâm nâng +14, cầu dẫn 10 m tĩnh không ≥ 15,5 m).
Khách sạn "The Royal Lotus-Crescent Palace" 24 tầng ≈ 120 m: 2 tháp cánh cung ôm khối pha lê, ban công ExtrudeGeometry + viền filigree,
hồ bơi treo tầng 20, bãi trực thăng. Porte-cochère, Grand Atrium 28 m (đài phun, thang cuốn, 3 thang kính, lễ tân, piano), tầng 2–5 tiện ích,
tầng 6–23 phòng thuê E (5.000 / 15.000 / 35.000 💰). Giữ cổng Master Dashboard + 8 pavilion quanh quảng trường đảo.
Nội thất chỉ dựng tầng người chơi đang đứng; từ ngoài nhìn thấy đèn ấm qua kính (emissive giả, không đèn thật).
```

### D · abyss-towers
```
Làm Phần 5 + 6 + 7 của đặc tả trong file mới js/abyssal_towers.js (2 toà + tầng đế 16 shophouse) và js/abyssal_dining_venues.js (Cafe 3 tầng
bên trái + Nhà hàng 5 sao 3 tầng bên phải), đặt theo W.ABY.plots. Khi dựng xong bật W.ABY.towersReady=true để phiên A gỡ vỏ cũ.
- 2 toà: Travertine + mullion đồng đen + phào vàng + kính Sapphire, cây xanh ban công; Grand Lobby + 2 bảo vệ + lễ tân + cổng quẹt thẻ;
  nội thất xuyên kính (lớp học, phòng bida, pantry, phòng họp / căn hộ có sofa, TV, giường, ban công Jacuzzi) bằng InstancedMesh.
- 16 shophouse 12 × 11 × 5,5 m đi bộ vào được, 4 ngành hàng, bấm E mua đồ.
- Cafe và nhà hàng: 3 tầng khoan vào núi + sàn lồi, cầu thang ngoài + 2 thang kính, nội thất theo đặc tả.
```

### E · abyss-life
```
Làm Phần 9 + 10 của đặc tả: js/bots_abyssal.js (6 chu trình sống của bot) và js/dining.js (phục vụ bàn dùng chung cho cafe, nhà hàng,
lounge tháp, bàn dù bãi biển, du thuyền; hỏi gọi món, menu góc nhìn thứ nhất, khay món 3D, buff, 1 tiếng mới hỏi lại).
Bot hiện tối đa 16–20 con gần camera; xe gia đình dùng W.traffic.spawnVehicle và W.roadNet.
```

## 4. Còn cần Bình
- Các ảnh mẫu được nhắc trong đặc tả (`image_d1dec7.jpg`, `image_d163bc.jpg`, `image_d1e37b.png`, `image_d2d71f.jpg`, `image_d2d77e.jpg`, `image_d2d740.jpg`, `image_d2d725.jpg`) chưa có trên máy. Bình bỏ vào `_work\overhaul\` để các phiên xem đúng hình mẫu.
