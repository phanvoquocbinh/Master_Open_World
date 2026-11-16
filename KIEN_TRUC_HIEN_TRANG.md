# QC World – Hiện trạng kiến trúc toàn thế giới (cập nhật 16/11/2026)

Tài liệu mô tả **mọi không gian đang có trong game**, viết theo đúng mã nguồn trên nhánh `main` (commit `0ef971e`), để làm nền cho người thiết kế lại kiến trúc.

- **Phần A – Thế giới V2** (mặc định từ 16/11/2026, mở `world.html`): 8 vùng mới, cổng nối, giao thông, sự kiện, âm thanh, thang máy.
- **Phần B – Thế giới V1** (bản cũ, mở `world.html?v1`): giữ nguyên nội dung hiện trạng ngày 15/11 ở cuối tài liệu.

**Quy ước:**
- 1 đơn vị = 1 m. Trục x là Đông–Tây (x tăng về phía Đông), trục z là Bắc–Nam (z âm ở phía Bắc), y là độ cao (mặt biển ≈ 0).
- `x0–x1, z0–z1` là hình chữ nhật bao. Số có "≈" là số tính lại từ công thức trong mã; "chưa rõ" là mã tính lúc chạy hoặc không ghi rõ.
- Ghi chú `file:dòng` trỏ vào mã nguồn. Giá tiền tính bằng xu 💰 trong game.
- Mọi tên trong game là tên tự đặt; chỗ nào mã còn sót tên địa danh hoặc thương hiệu có thật thì cần đổi khi thiết kế lại.

## Mục lục
**Phần A – V2 (mặc định)**
1. [Tổng quan V2: bản đồ 8 vùng và 9 cổng](#v2-tong-quan)
2. [V2.1 Đảo chính Abyssal Canyon](#v2-abyssal)
3. [V2.2 Sân bay Skyport](#v2-skyport)
4. [V2.3 River Tech CBD](#v2-cbd)
5. [V2.4 Đỉnh Brain Citadel](#v2-brain)
6. [V2.5 Dev City 8D](#v2-devcity)
7. [V2.6 Wonderland & Công viên Kỳ Quan](#v2-wonder)
8. [V2.7 Đảo Ngoại ngữ](#v2-lang)
9. [V2.8 Quần đảo cọ Palm](#v2-palm)
10. [V2.9 Hệ thống chung](#v2-he-thong)
11. [Việc đang làm và tồn đọng (16/11)](#v2-ton-dong)

**Phần B – V1 (`?v1`, hiện trạng 15/11)**: [đi tới Phần B](#phan-b-v1)

---

<a id="v2-tong-quan"></a>

## PHẦN A · THẾ GIỚI V2

### Tổng quan: 8 vùng (bảng `ZONES` trong `js/v2core.js`)
Mỗi vùng cách nhau bằng kênh biển, nối với nhau bằng cầu ở các cổng. Ở V2, toàn bộ nhà, đường, cây của V1 bị gỡ; giữ lại phần lõi: biển, trời, nhân vật, xe, kinh tế, điện thoại/laptop/nhạc, nhiều người chơi.

| Khoá | Vùng | x0 → x1 | z0 → z1 | y | File chính |
|---|---|---|---|---|---|
| abyssal | Đảo chính QA/QC Abyssal Canyon | −180 → 180 | −180 → 180 | −42 → 28 | `abyssal_island.js` |
| skyport | Sân bay QA/QC International Skyport | −180 → 175 | 220 → 380 | 4 → 68 | `skyport.js` |
| cbd | River Tech CBD | 180 → 580 | −120 → 460 | 0 → 140 | `river_cbd.js`, `bigtech_interiors.js`, `police_station.js` |
| brain | Đỉnh QA/QC Brain Citadel | 620 → 1150 | −100 → 450 | 0 → 168 | `brain_citadel.js` |
| devcity | Dev City 8D (thành phố núi) | 100 → 850 | −950 → −120 | 2 → 135 | `devcity_chongqing.js`, `devcity_landmarks.js` |
| swiss | Đảo Ngoại ngữ núi tuyết | −850 → −250 | −500 → 250 | 0 → 95 | `swiss_lang_island.js` |
| palm | Quần đảo cọ The QC Palm Archipelago | 250 → 1050 | 520 → 1320 | −8 → 65 | `palm_dubai.js` |
| wonder | Wonderland + Công viên Kỳ Quan (dời về Nam) | −400 → 230 | 485 → 1510 | 0 → 98 | `wonder_v2.js` |

**Sơ đồ vị trí (Bắc ở trên):**
```
                     Dev City 8D (x 100–850, z −950…−120)
                         G5 │            │ G6
 Đảo Ngoại ngữ ──G3── ABYSSAL ──G1── River Tech CBD ──G4── Brain Citadel
 (x −850…−250)        (tâm 0,0)       (x 180–580)           (x 620–1150)
                         G2 │              │ G7
                       Sân bay           Palm (x 250–1050, z 520–1320)
                         G8 │              │ G9
                Wonderland + Kỳ Quan ──────┘
                 (x −400…230, z 485–1510)
```

### 9 cổng nối (V2_PLAN.md §2b, đối chiếu mã)
| Cổng | Nối | Kế hoạch | Thực tế trong mã |
|---|---|---|---|
| G1 | Abyssal ↔ CBD | (180, 0, +2) | Abyssal rộng 8 m, CBD rộng 20 m ở z 0 |
| G2 | Abyssal ↔ Sân bay | (0, 180 → 220, +4) | cầu sân bay: sàn 30 m, lòng nhựa 20 m |
| G3 | Abyssal ↔ Đảo Ngoại ngữ | (−180 ↔ −250, −16, +2) | cầu rộng 8 m (nhựa 6,6 m) |
| G4 | CBD ↔ Brain | (580, 86, +2) | CBD ở z 80, Brain ở z 86 |
| G5 | CBD ↔ Dev City | (380, −120) | mã đặt x 384 (cầu Dev City x 384, CBD x 388) |
| G6 | Brain ↔ Dev City | (700, −100…−120) | cầu Dev City x 700 rộng 12 m + cầu Brain rộng 9 m |
| G7 | CBD ↔ Palm | (450, 460 → 520) | cầu Palm rộng 10 m |
| G8 | Sân bay ↔ Wonder | (0, 380 → 520) | hầm dưới đường băng + cầu cong rộng 12 m tới (−77, 504) |
| G9 | Wonder ↔ Palm | (220 → 250, 900) | lối lát đá 7 m (chỉ đi bộ) + cầu Palm rộng 9 m |
| thêm | Sân bay → CBD | – | bậc thang đi bộ x 165 → 180,5, z 250–262 |
| thêm | Dev City → CBD | – | cầu dây văng x 220 (z −121 → −104) |

### Luật thiết kế V2 đang áp dụng (Bình yêu cầu)
- Mọi đường phải thông, không đường cụt; mỗi vùng đưa đường chính ra đúng cổng.
- Lối đi trống ≥ 2,5 m; địa hình, vách đá, mép hồ là bề mặt liền, cong mềm, không khe hở, không chớp mặt.
- Toà nhiều tầng dùng thang máy bước vào (`liftkit.js`), không dịch chuyển tức thời.
- Nội đô (Abyssal, CBD, Dev City) chỉ bán/thuê căn hộ; nhà mặt đất, biệt thự chỉ ở Palm.
- Mỗi khu phải có người (bot) đúng ngữ cảnh. Máy chạy là Intel Iris Xe: mỗi khu thêm ≤ 150 lượt vẽ.
- Không dùng tên địa danh, thương hiệu, nhân vật có thật.

---


<a id="v2-abyssal"></a>

### V2.1 · Đảo chính QA/QC Abyssal Canyon Island (`js/abyssal_island.js`, `js/bots_abyssal.js`)

**Tổng quan và địa hình** (`abyssal_island.js:16-80`)
- Vùng x −180…180, z −180…180, khai báo bằng `EXTL` + `hAt`. Mép đất thật ở |x|, |z| = 179,4; 3 hành lang cổng (±9 m) kéo đất liền tới đúng 180.
- Miệng vực: elip bán trục 146 (x) × 130 (z), tâm (0, −15), tức 292 × 260 m.

| Mốc | Cao độ |
|---|---|
| Đỉnh vành núi (RIM) | +28 |
| Thềm vành đai (GY) | +2 |
| Đường dạo đáy vực (FY) | −29,2 |
| Mặt hồ ngầm (LY) | −29,5 |
| Đáy hồ | −42 |

- Lưới địa hình ô 4 m: dưới +3,2 xanh xám, +3,2…24 đá xám, trên 24 xanh cỏ. Tường kè biển +2,2 → −6 (`0x8a8680`).
- Vách miệng vực 6 bậc giật cấp (ρ/y): 0,995/−31 → 1,0/−13 → 1,022/−11 → 1,03/9 → 1,055/11 → 1,062/RIM. Đá `#6f6a66`, mạch `#3d3a38`.
- Khe cửa vực phía Nam |x| < 38, z 60 → 162. Đập tràn "Đập Cổng Trời Thủy Đạo" ở z 162 (mặt +4,2), thác biển rộng 74 m cao 30,5 m.
- Hồ ngầm: viền ρ ≈ 0,836, nước `0x0f8c9e` (opacity 0,9), đáy `0x0a3540`, bờ kè granite `#b9b4aa`. Mặt biển toàn cục khoét lỗ đúng miệng vực.
- 2 thác đầu nguồn Đông/Tây ở (±147, −19) chảy qua 3 bậc vách, chân thác có bồn đá r 5 m.
- 170 cây thông instanced trên đỉnh vách (máy yếu 90).

**Cổng và đường** (`:196-233`)

| Cổng | Toạ độ | Nối sang |
|---|---|---|
| G1 | (180, 0, +2) | CBD |
| G2 | (0, 180, +4) | Sân bay (thềm gần đập nâng lên +4) |
| G3 | (−180, −16, +2) | Đảo Ngoại ngữ |

- Mỗi cổng: 2 trụ granite 1,2 × 7 × 1,2 m + xà ngang 11,8 m ở +7,4.
- Vành đai xe +2: hình vuông ±174, rộng 8 m, nhựa `0x34363b`, chưa có vạch làn. Đây là đường xe duy nhất của đảo. Lệch bề rộng: phía CBD 20 m, cầu G3 7 m, cầu G2 lòng 20 m.
- Đường đỉnh vách (đi bộ): granite rộng 4 m theo elip ρ 1,105, nối đỉnh 2 tháp xoắn qua phía Bắc. Lan can kính mép vực ở ρ 1,078.
- 2 tháp đường xoắn ốc tâm (±112, 112): giếng r 19,5 m, mặt đường r 14 m rộng 9 m, dốc ≈ 8 %. Đáy −29,2 → +2 sau ≈ 4,6 vòng (≈ 407 m), +2 → +28 thêm ≈ 3,5 vòng. Lõi bê tông r 9,2 m cao 59,4 m. 3 lối ra: hầm vòm (rộng 10 m) ra đường dạo đáy, mặt đất +2 hướng Nam, đỉnh +28 hướng Bắc.
- Đáy vực: đường dạo vòng hồ lát granite ρ 0,832 → 1,0 (rộng ≈ 22–24 m). Cầu đá 2 nhịp ngang khe cửa vực ở z 104 (rộng 6 m).
- **Đang sửa (phiên đồ hoạ, 16/11):** lỗ hổng sàn đáy, khe hở vách, nước tràn vào công trình, đường nhựa 2 làn nối từ vành đai xuống đáy vực cho xe chạy.

**Công trình**

| Công trình | Vị trí | Hình khối & vật liệu | Tầng / nội thất |
|---|---|---|---|
| Cánh Xanh "QA · QC · QE Academy & Tech Hub" (`:94-111`) | cung bám vách phía Tây–Tây Bắc, tâm cung (−8,1; −4,8), góc 3,38 → 4,62 rad | `buildCurvedTerraceWing`, giật cấp mỗi tầng lùi 1,2 m (r 123,8 → 137); kính `#2e4a63`, đèn cửa `#bfe8ff`, LED `0x10b981`; biển chữ 36 × 3,4 m chữ `#6dffb0` nền `#0b1220` | 12 tầng × 4,5 m, sâu 12 m. Tên tầng: Đại sảnh & chứng chỉ · Kiểm thử thủ công · Game QA · ERP/POS/thanh toán · CI/CD–TestOps · Bảo mật/Pentest · Di động · API/Microservices · Tự động hoá web · Hiệu năng · AI-QA/Chaos · Sky Billiards Lounge. **Chưa có nội thất**, chỉ đi được ban công + sảnh thang. 2 thang liftkit ở (−131, −31) |
| Cánh Đỏ "Abyssal Horizon Residences" | đối xứng phía Đông, tâm (8,1; −4,8), góc 4,805 → 6,045 rad | như Cánh Xanh; kính `#4a3440`, đèn cửa `#ffc890`, LED `0xff4466`, chữ `#ffc0c8` | 14 tầng (mái ≈ +33,8, cao hơn đỉnh núi): Sảnh → Sky-Condo 1…11 → Duplex Penthouse. **Chưa nội thất, chưa bán căn hộ.** 2 thang ở (131, −31) |
| Tháp thang kính đôi "Hydro-Pulse Core" (`:112-131`) | 2 trục kính 9 × 9 × 76 m ở x ±9, z −140,5 | kính `0x9fd8ee` (0,3), khung vàng `0xe8c040`, chóp kim tự tháp vàng; giữa 2 trục là thác 8,6 × 58 m | `makeLiftBank` 2 cabin, 5 điểm dừng: G đáy −29,2 · 4 (−15,7) · 8 (+2,3) · 12 (+20,3) · ★ đỉnh +28. 3 cầu kính sang đầu hồi 2 cánh ở tầng 4/8/12 |
| Ốc đảo Master Dashboard (`:141-168`) | đảo granite r 26 m, tâm (0, −10), mặt −29,2 | cổng năng lượng 2 trụ 1,6 × 12 m, xà 13,4 m, màn cyan `0x40e8ff`; hồ vòng r 18,2–22; 8 lối lát sáng 3,4 m | E ở tâm mở Dashboard trong Laptop; màn hình thứ 9 |
| 8 đảo công cụ | r 9 m, cách tâm 48 m, cầu kính 3,2 m | trắng, bát diện xoay màu theo công cụ, 5 khối nón, 1 màn hình | Thư viện (0, −58) · Bảng nhiệm vụ (34, −44) · Xưởng API (48, −10) · Trạm Automation (34, 24) · Hầm Database (0, 38) · Tiệm đồ nghề QC (−34, 24) · Bưu điện Ghi chú (−48, −10) · Trạm Quick Link (−34, −44). 4 cầu dài 4 m ra bờ Bắc/Đông/Tây/Nam |
| QC Live Stage (`:170-174`) | bán đảo r 17 m tâm (62, −68) | khán đài 3 bậc vòng cung (ngồi được), sân khấu tròn r 6 m cao 0,8 m; 48 vòi nhạc nước 2 vòng | nhạc nước chạy khi người chơi trong 90 m |
| Bến kayak (`:175-182`) | sàn gỗ 12 × 7 m ở (−42, 35) | cầu gỗ 3 m từ đảo Hầm Database | E lên kayak, W/S/A/D chèo, tối đa 4,2 m/s |
| 24 shophouse chân vách (`:184-194`) | 2 dãy cung ở ρ 0,945, Đông và Tây (chừa khoảng 42–60° cho hầm tháp xoắn) | khối bo góc 9,2 × 8 × 6,6 m, tường `#e9e2d6`, mái hiên 4 màu (đỏ/xanh dương/xanh lá/vàng), biển canvas | thời trang, đồng hồ, lẩu, dimsum, phở, bánh mì, cafe, gelato, bia, cơm tấm, bida, cyber cafe, sách, siêu thị 24h, barber, nhà thuốc, trà sữa, pizza, gear, hoa, salad, game. **Không vào được**, E chỉ báo "đang nhập hàng" |

**Điểm E:** mở công cụ (×8) · xem màn hình (×9) · cổng Dashboard · kayak · shophouse (×24, chỉ thông báo) · gọi thang liftkit. Không có điểm thu tiền.

**PLACES (phím M):** Ốc đảo Master Dashboard (0, 3) · Tháp thang Hydro-Pulse (0, −104) · Đài ngắm đỉnh thác +28 (0, −111) · Phố Shophouse & Bến Kayak (≈ 79, 74) · QC Live Stage (62, −77) · Cổng Đông sang CBD (172, 0). Điểm xuất hiện `W.V2SPAWN` = (0, 3).

**Bot (≈ 38, hiện tối đa 16 trong 75 m):** khách chụp ảnh và dạo ốc đảo (3), khách xem màn hình (≤ 8), chủ tiệm (6), khách ngắm tủ kính (2), người dạo ven hồ (5), ca sĩ + 5 khán giả, 2 người chèo kayak, 3 người đi/chạy bộ vành đai, 3 bảo vệ cổng.

**Ánh sáng, âm thanh:** `AK.bindNight` sáng đèn cửa sổ + LED 2 cánh, biển chữ tự phát sáng, không có đèn điểm. Âm thanh: đập tràn, 2 thác, nhạc nước, tiếng chèo kayak. Xuống dưới −1,5 m thì camera mở bằng `camBox`; rơi xuống hồ thì đưa về ốc đảo.

**Còn dở:** nội thất 2 cánh (12 và 14 tầng) chưa làm, `abyssal_interior.js` chưa có; căn hộ và shophouse chưa bán; xe chỉ chạy được vành đai; hàm `lift()`/`PADS` là mã chết; chú thích ghi y tới +34 khác `ZONES` (+28).

---

<a id="v2-skyport"></a>

### V2.2 · Sân bay QA/QC International Skyport (`js/skyport.js`, bot trong `js/bots_cbd_sky.js:102-129`)

**Tổng quan** (`skyport.js:40-57`)
- Vùng x −180…175, z 220…380, sân GY = +4. `EXTL` kéo sang Tây tới x −251 (đường băng chìa ra biển) và sang Đông tới x 180,5.
- Nhà ga x 15…165 · z 222…294; sân đỗ z 294…328; đường băng z 328…380. Nền bê tông `#c9c6bf`; phần đường băng trên cọc tròn r 1,1–1,4 m (lưới 16 × 14 m). Lan can thép quanh mép.

**Đường và cổng** (`:95-138`)
- Cầu G2 (0, 180) → (0, 220,5), cao +4: sàn 30 m, lòng nhựa 20 m, trụ mỗi 10 m.
- Trục x = 0 rộng 20 m: z 220 → 240 trên mặt đất, rồi **hầm chui dưới đường băng**: dốc z 240 → 300 (≤ 7,5 %) từ +4 xuống +0,15, đoạn có nắp z 300 → 380, trần 3,55 m. Lòng xe 11,6 m = 2 làn mỗi chiều (vạch đôi vàng giữa), vỉa hè 2,5 m mỗi bên. Đèn trần mỗi 8 m + dải LED vách.
- Ra cổng G8 (0, 380): cầu cong rộng 12 m (do `wonder_v2.js` dựng) hạ xuống mũi Bắc Wonderland ở (−77, 504).
- Sang CBD: 10 bậc thang đi bộ x 165 → 174,5 (+4 → +2) + cầu trắng tới x 180,5. **Chưa có đường xe vào nhà ga, xe không sang CBD từ đây.**
- **Đang sửa (phiên laptop, 16/11):** hoàn thiện hầm + nối đường, lộ trình bay leo cao trước khi rẽ để không đâm toà nhà.

**Công trình**

| Công trình | Vị trí / kích thước | Hình khối & vật liệu | Ghi chú |
|---|---|---|---|
| Nhà ga "The Manta Ray" (`:140-155`) | x 15…165 × z 222…294 (150 × 72 m) | viền cánh cá đuối, mái cong cao nhất +32, mép mái +16; mái kim loại `#e9edf0` có sọc kính; vách kính `0x9fc6dd` (0,32); sàn đá `#e9e6df`; 8 cột trắng hình cây | 1 tầng. Cửa vào duy nhất ở mũi Đông (x > 159) |
| Thác trong nhà (`:156-170`) | tâm (85, 258) | phễu giếng trời kính r 9 → 3,5 m, cột nước r 3,2–3,6 m, hồ r 8 m `0x2b7f8f`, 3 vòng gò cây bậc thang (26 cây) | không vào trong gò được |
| Quầy check-in (`:171-174`) | x 138…154,2, z 251/265 | 8 quầy trắng 3,8 × 1,1 m, màn hình cyan, băng chuyền | E chỉ hướng dẫn |
| Soi chiếu an ninh (`:175-181`) | x 127, z 250/258/266 | 3 khung cổng đèn `0x40ff80`, vách kính chặn | E: "Bíp xanh!" |
| 6 cổng Boarding (`:182-184`) | x 39, 54, 69, 84, 99, 114; z ≈ 275–289 | quầy xanh `0x1d6ab8`, màn hình, 2 băng ghế; ống lồng 3 × 3 m ở +8 ra z 308,2 | vé Phổ thông 25 xu / Thương gia 80 xu |
| Phòng chờ thương gia (`:185-194`) | x 101…123, z 226,6…240,6 (22 × 14 m) | sàn gỗ `#5a3518`, bàn bida nỉ `0x0d5a3c`, buffet 7 m, 2 sofa `0x3d4a5c` | buffet miễn phí, +5 phút chạy nhanh |
| 4 máy bay đỗ "QC Airlines" (`:215-218`) | x 35/71/107/143, z 310,5 | dài ≈ 42 m, sải cánh ≈ 33 m, 2 động cơ, trắng sọc `#1d6ab8` + `#ffc531` | không lên được |
| Đường băng (`:79-94`) | 09L/27R tâm z 345 rộng 30 m; 09R/27L tâm z 370 rộng 18 m; dài x −248 → 172 (420 m) | vạch tim/ngưỡng/mép, vạch lăn vàng z 311, đèn biên xanh mỗi 12 m, 6 đèn tiếp cận chạy đuổi mỗi đầu | |
| Đài Không lưu ATC (`:219-240`) | tâm (−58, 252), cao 68 m | thân bê tông r 4,2 → 3,2 m, vòng thép mỗi 6 m, cabin kính r ≈ 8 m (sàn +64,8, 6 bàn điều khiển), đèn đỏ chớp +79,2 | 1 thang liftkit 2 điểm dừng; E nghe tần số không lưu |

**Chuyến bay** (`:241-292`): điểm đến Dev City (500, −850), Brain (900, 78), Đảo Ngoại ngữ (−305, 175), Palm (650, 920), hoặc bay ngắm cảnh. Lăn đà 09L tối đa 45 m/s, bay bằng 72 m/s ở ≈ 170–250 m, tiếp cận 58 m/s. Đích chưa đăng ký trong `W.AIRPORTS` thì bay ngắm rồi về. Phím X hạ cánh nhanh. Máy bay AI cất/hạ cánh 09R mỗi 50–90 giây khi người chơi trong 400 m.

**PLACES:** Nhà ga Manta Ray (156, 258) · Đài ATC (−56, 261).

**Bot:** tổ bay 3 người kéo vali, 6 hành khách, 2 nhân viên check-in, 1 an ninh, 1 người điều hướng máy bay (gậy LED cam), 1 xe kéo hành lý 3 toa chạy z 324.

**Còn dở:** chưa có làn đón trả khách trước nhà ga; nhà ga 1 tầng, chưa có cửa hàng; 2 hạng vé chỉ khác giá; chưa có rào giữa sân đỗ và đường băng; chú thích ghi nhà ga 160 m và đường băng ~348 m là số cũ.

---

<a id="v2-cbd"></a>

### V2.3 · River Tech CBD (`js/river_cbd.js`, `js/bigtech_interiors.js`, `js/civic.js`, `js/police_station.js`, bot trong `js/bots_cbd_sky.js:48-100`)

**Tổng quan** (`river_cbd.js:20-111`)
- Vùng x 180…580, z −120…460, cao độ đất **+2**. Đô thị lấn sông gồm 6 ô đất bồi: 3 dải x (180–353, 377–498, 522–580) × 2 dải z (−120…92 và 128…460). Thân đất granite `#b7b3ab` sâu 6 m, mặt lát `#9d968a`.
- Sông chính z 92–128 (rộng 36 m); 2 kênh rộng 24 m ở x 353–377 ("Đông Hoa") và x 498–522 ("Tây Hoa") – tên đặt ngược hướng. Nước `0x1f6f86`.
- Kè sông: gờ granite, tay vịn thép, LED vàng kim, chừa khe ở đầu cầu, 4 cổng và sàn Silicon Forest.

**Đường** (vỉa hè 5 m mỗi bên; theo chú thích mỗi chiều 2 làn ô tô + 1 làn xe máy; vạch đôi vàng, mép trắng, vạch qua đường ở mọi giao lộ)

| Tên | Trục | Rộng | Đoạn |
|---|---|---|---|
| Đường Bắc CBD | z −100 | 20 | x 188–572 |
| Đại lộ Ven Sông | z 66 | 24 | x 188–572 |
| Đại lộ Quốc Mậu | z 236 | 24 | x 188–572 |
| Đường Nam CBD | z 440 | 20 | x 188–572 |
| Đường Tây CBD | x 198 | 20 | z −110–450 |
| Đường Đông CBD | x 562 | 20 | z −110–450 |

- Cổng thực tế trong mã: G1 z 0 (x 180→188); G4 ở **z 80** (Brain dùng z 86); G5 ở **x 388** (kế hoạch 380); G7 x 450 (z 450→460). Thêm đoạn nối Dev City ở x 220 (z −121 → −104, rộng 15) trong `v2traffic.js:38` – chưa rõ kè có chừa khe.
- **12 cầu:** 8 cầu đá 3 vòm qua 2 kênh; 2 "Cầu Vòm Đỏ" (x 198 và 562) qua sông, 2 vòm thép đỏ `#c8102e` cao 14 m – **chỉ 2 cầu này cho ô tô qua sông**; "Cầu Kính Hai Tầng" (x 276–284, rộng 8 m, sàn kính trên ở y 7,2); "Cầu Ánh Sáng" (x 437–443, rộng 6 m, đi bộ).
- Đường dạo ven sông: liễu, đèn lồng đỏ, ghế gỗ; đèn đường LED cột đôi mỗi 26 m. Nhạc nước 63 vòi (x 300–346 × 3 hàng ở z 104,5–115,5), cao tới ≈ 8,6 m, đổi màu ban đêm.

**Công trình**

| Công trình | Tâm / kích thước | Hình khối & vật liệu | Nội thất | Thang | Vào được |
|---|---|---|---|---|---|
| The Infinite Loop QA Ring (`river_cbd:197`) | (280, −30); vành nhẫn R 54 / 30, cao 24 | kính cong `#24465c` khung `#cfd6dc`, mái pin mặt trời, viền LED cyan, 120 lam bạc; sân trong có hồ koi, nhà vòm kính, ≈ 34 cây ăn quả | sàn sồi, 24 bàn dài 8 m xếp hướng tâm, 7 buồng họp kính tròn (6 treo ở y 11–16), quầy cà phê, lễ tân, phòng Giám đốc tầng 5 (y 21,2) | dãy 2 thang ở (280, −82), tầng 1 và 5 | Có, cửa Nam (280, 25,6) |
| Dragonscale Auto-Labs (`:220`) | (440, −20); 90 × 70, mái 12 → ≈ 26 m | mái lượn sóng vảy rồng bạc, 4 mặt kính, cột bạc nghiêng | 3 cụm × 7 bàn lục giác, xe cafe cổ, sân bóng rổ mini 14 × 12, 3 lều glamping làm phòng họp, gác lửng y 8 (bida, bàn Giám đốc), cầu trượt xoắn xuống tầng 1 | không (cầu thang 14 bậc) | Có, cửa Nam (440, 16,6) |
| Silicon Forest & Treehouse Hub (`:240`) | x 247,5–332,5, z 122,5–197,5; sàn gỗ lấn sông 5,5 m | 4 khối gỗ–kính 2–4 tầng (trệt 5 m, tầng trên 4 m), mái vườn, 6 cây cổ thụ 32 m xuyên mái | suối dưới sàn kính dọc z 160, 2 dãy bàn, quầy ăn, 3 nhà trên cây ở y 10 nối cầu treo, biệt thự kính Giám đốc trên mái (y ≈ 23,4) | dãy 2 thang ở (293,5, 131), G và mái | Có, cửa Nam (290, 199) + Bắc (280, 121,7) |
| The Tri-Matrix Perf Center (`:262`) | (450, 166); kim tự tháp tam giác cạnh 85, cao 38 | ô tam giác phát sáng `#9dff5c`, cạnh LED xanh lá, chóp kính 30–38 m | khán đài Tech Talk 8 bậc + màn 12 × 6,5 (21 chỗ), bàn 3 màn hình cong 2 vòng, quầy năng lượng, phòng Giám đốc trong chóp (y 32) | 1 thang kính (450, 165,2), G và 30 | Có, cửa Bắc (450, 139,7) |
| Cantilever Cyber Twin-Tower (`:277`) | 2 tháp x 323–352 và 378–407 (nghiêng ±9 m), z 318–362, cao 120; khối "Cổng Trời" nối ở y 97–117 | kính `#1d2f45`, khung `#7f8a95`, cạnh LED cyan | sàn kính nhìn xuống kênh, phòng họp HĐQT (bàn óc chó 12 m), CLB bida 2 bàn + bar, phòng Chủ tịch | mỗi tháp dãy 2 thang tốc hành, G và 95 (chỉ nhân viên) | Sảnh trệt; Cổng Trời khoá |
| 4 tháp căn hộ Starlight A–D (`:295-311`) | (235, 280), (290, 280), (235, 335), (290, 335); 24 × 24, 28 tầng × 3,4 m + đỉnh 6 m | kính `#2a3d52`, khung kem `#e8e2d6` có ban công, đế kính tối 4,6 m, LED vàng 4 góc | **không có** | **không có** | Chỉ sảnh. E mua căn: 2PN tầng 8–15 = 1.800 💰, 3PN tầng 16–24 = 3.200 💰, Penthouse tầng 28 = 7.500 💰 (chỉ là bản ghi `S.condos`) |
| Trung tâm Việc làm (`:322`) | (285, 400); 30 × 24 × 18 | kính, mái trắng | không | không | Cửa Bắc, E mở bảng việc |
| Bệnh viện Đa khoa QC City (`civic.js`) | x 420–465, z 273–299, cao 15,6 (4 tầng) | mái có bãi trực thăng, 2 xe cứu thương | sảnh, lối Cấp cứu | chưa rõ | Có; khám 30 💰 |
| Trạm cứu hoả QC City | x 424,5–456,5, z 305–324,5 | 3 gara, 3 xe cứu hoả, tháp phơi vòi | gara xem được | không | Có |
| Trường Tiểu học QC City | x 418,5–466,5, z 355–415 | rào, 2 cổng, sân bóng rổ, cột cờ, dãy lớp 3 tầng | hành lang | chưa rõ | Sân trường |
| Tàu cứu hoả + cầu tàu (`:317`) | cầu tàu (373,5, 300) trên kênh | tàu đỏ tĩnh | – | – | Lên cầu tàu |
| Sở Cảnh Sát QC City · 113 (`police_station.js`) | x 214–244, z 354–382, mặt tiền Tây ra x 198; sàn y 2/6/10, mái 14 | tường trắng `#f1f0ea`, chân navy `#14284f`, gờ vàng `#d8b25a`, biển chữ + sao vàng | T1: 3 gara, sảnh trực ban, 3 buồng tạm giữ. T2: phòng chỉ huy, màn bản đồ an ninh 15 × 4,6 m chạy trực tiếp. T3: phòng giao ban 24 ghế. Mái: bãi trực thăng (trực thăng đậu tĩnh) | 1 thang (241, 377), 4 điểm dừng | Có, cửa (212,5, 377) |

**Điểm E khác:** mỗi trụ sở có lễ tân (phỏng vấn/quẹt thẻ), máy trạm (làm ticket), họp Daily, ăn trưa/cà phê; Dragonscale có ném bóng rổ và trượt cầu trượt xoắn; ghế Giám đốc, ghế khán đài; Sở Cảnh Sát có trực ban 113 (xem sự kiện đang diễn ra).

**PLACES:** CBD · Nhạc nước (280, 86) · QA Ring (280, 30,6) · Dragonscale (440, 21,6) · Silicon Forest (290, 204) · Tri-Matrix (450, 134,7) · Cyber Twin (337,5, 311,4) · Starlight Towers (262, 254) · Căn hộ của bạn (sân thượng tháp đang sở hữu) · Trung tâm Việc làm (285, 382,6) · Sở Cảnh Sát (210,6, 377) · Bệnh viện, Trạm cứu hoả, Trường.

**Bot (24 + NPC civic):** 8 nhân viên văn phòng, 4 công nhân lau kính trên gondola tháp Starlight A/B, 2 cơ thủ bida ở Cổng Trời, 2 người chèo kayak trên kênh, 2 barista, 1 nghệ sĩ violin trên Cầu Kính, 1 kiến trúc sư, 2 người bán kẹo hồ lô, 1 bảo vệ đi xe điện cân bằng, 1 bác sĩ trực thăng; y tá, lính cứu hoả, học sinh; 2 cảnh sát trực đồn.

**Ban đêm:** vật liệu phát sáng (vàng kim, LED cyan/đỏ/xanh lá, mặt Tri-Matrix), cửa sổ sáng ngẫu nhiên, đèn đường, nhạc nước đổi màu, vòng vàng nhấp nháy trước cửa mỗi trụ sở.

**Còn dở:** tháp Starlight chưa có nội thất và thang máy, căn hộ chỉ là bản ghi; điểm M "Căn hộ của bạn" đặt thẳng độ cao (trái luật V2); Cyber Twin chỉ vào được sảnh; trực thăng cảnh sát chưa bay; chú thích đầu file còn ghi cao độ +0,6 (thực tế +2); tên một số toà có chữ địa danh/thương hiệu thật cần đổi.

---

<a id="v2-brain"></a>

### V2.4 · Đỉnh QA/QC Brain Citadel (`js/brain_citadel.js`, `js/bots_brain.js`)

**Địa hình** (`:39-79`): núi tâm (880, 180), sân đỉnh phẳng r 60 ở **y 110**, biển xung quanh −6. Vách đứng ở Đông và Nam (chân cách tâm 118 m), sườn Tây và Bắc thoải (250 m). Lưới ô 2 m, cỏ `0x5e9a3c`/`0x86b04c`, đá `0x7d766b`/`0x5a5249`, cát `0xdcc89d`.

**Đường lên đỉnh**
- Đường dẫn G4: (570, 86) → (580, 86) → (600, 90) rồi cong vào chân đèo ≈ (645, 107, y 4); đoạn qua biển là cầu cạn.
- Đường đèo "Oceanfront Corniche" (`:45-113`): rộng 10 m, mỗi chiều 1 làn (vạch mép trắng, tim vàng đứt), quấn 1,25 vòng từ y 4 lên y 100 (≈ 1,4 km). Đoạn trên biển là cầu cạn bê tông trụ mỗi 14 m. Lan can kính, đèn cột ≈ 26 m. 3 vòm đá bắc ngang đường ở đoạn y 40–74.
- Cầu Kính Cổng Trời (`:114-129`): từ cuối đèo (y 100) lên sân đỉnh (y 110), dài ≈ 47 m, rộng 10, đáy kính `0xcfefff`; 2 tháp chữ A 28 m (titan `0x263040`, vòng vàng `0xd4af37`), cáp đồng `0x7a4a2a` phát sáng cam ban đêm.
- Cầu G6 sang Dev City (`:130-144`): (700, −100,5) → (700, −30) → (640, 20) → nhập đường dẫn gần (628, 97); rộng 9, trụ mỗi 16 m, lan can kính.

**Phố săn mây – 12 quán** (`:157-202`) dọc mép ngoài đèo đoạn y 40–74, mỗi quán sàn gỗ 12 × 8 (trên cột khi dưới là vực), quầy + 2 bàn tròn: Lầu Trà Đạo Lưu Ly, Bistro Hang Đá Ngàn Đèn, Café 3 Vòm Kính, Hải Sản Thuyền Gỗ, CLB Bida & Bia Thủ Công, Café Hải Đăng, Khối Kính Ngắm Mây, Nhà Gỗ Chữ A, Vườn Giàn Hoa, Café Đài Thiên Văn, Container Màu Sắc, Café Xích Đu Mây. Món 20–220 💰, ăn xong chạy nhanh 8 phút.

**Quảng trường đỉnh "Royal Contrast"** (`:210-290`, thiết kế lại 16/11 theo đề bài của Bình)
- Sân r 60,3: đá bazan `#222b38` lát vòng đồng tâm, viền bát giác terracotta `#8f3f29` + sa thạch `#b8925a` + chỉ vàng `#d4af37`, 16 tia la bàn.
- Hồ Vô Cực Sen bát giác (cạnh cách tâm 38 m, mép trong r 26,6), nước `0x0284c7`, 16 vòi phun cong.
- 8 cầu vòm qua hồ (r 25,9 → 39,1): thân sa thạch rộng 3,7, vồng 0,85 m, 18 bậc gỗ lim đỏ `#5c261a`, lan can trụ vàng; mỗi cầu ứng với 1 cửa tháp.
- Lan can viền r 59,3 cao ≈ 1,1 m (đá kem `#cbb698`, mặt đen–vàng), hở 4 lối: cầu kính, xích đu, khinh khí cầu, sân bay.
- 24 trụ đèn pha lê vàng 3,4 m; 16 bồn đồng cây lá kim + sen hồng; 8 vườn thiền ở r 48 (bồn cẩm thạch đen 2 bậc 6 × 3,5, sỏi trắng, đá cảnh, đèn lồng đá, xen phong đỏ / ngân hạnh vàng 5,5–7 m); 8 ghế gỗ lim có pergola vàng + hoa giấy hồng ở r ≈ 55.
- Mái vòm cổng 11 × 9,4 đen–vàng ở y 116,3 trên 8 cột vàng, băng chữ "★ QA · QC · QE SOVEREIGN CITADEL ★" vàng trên nền navy `#0b1a33`.

**Tháp Liên Hoa Thần Kinh** (`:204-430`)
- 6 tầng ở y 110/118/126/134/142/150 (mỗi tầng 8 m), bán kính sàn 26/23,2/21/23,5/26,2/29 (dáng đồng hồ cát), giếng trời r 10.
- Vỏ kính `0x0a2540` (0,58), khung xoắn kép 72 thanh vàng, viền sàn obsidian + vàng + neon cyan `0x00f0ff`.
- 8 cánh sen ngoài cao 35 m mọc từ mặt hồ + 8 cánh trong lên tới y ≈ 160; kính cánh `0x0d7490`, sống cánh đồng đỏ `0x6e351c`.
- 8 cửa tầng trệt; cầu thang xoắn kép ADN (32 bậc mỗi tầng, viền LED cyan và hồng); **4 thang liftkit** (2 dãy × 2, r 13,2) phục vụ cả 6 tầng.

| Tầng | Nội dung |
|---|---|
| 1 · Bảo tàng Lịch sử & Thảm hoạ phần mềm | 3 tủ kính, 6 bảng các sự cố phần mềm nổi tiếng + "Bài học" |
| 2 · Đấu trường Test Design | 6 kiosk đố vui (E) |
| 3 · Chỉ huy Hiệu năng & Bảo mật | hologram lưới quay, 3 bảng Hiệu năng / SOC / CI/CD |
| 4 · Đại sảnh Danh vọng & Phòng Bí ẩn | 5 bảng vinh danh, cổng tím "Không gian Bí ẩn" (chưa có nội dung) |
| 5 · Nhà hàng xoay · Bida Hoàng gia | vành sàn xoay, 7 bàn, Sky Bar, 4 bàn bida nỉ đỏ `0x7a0d1c` |
| 6 · Sân thượng · QA Brain Core | sàn óc chó + tâm ngọc lục bảo, bệ đồng pha lê neon (E mở Brain Core: phân tích tài liệu, sinh test case), 3 lầu kupola "Đình Vọng Cảnh" (mái búp sen xanh ngọc `0x0f766e`, 4 cột vàng, kính thiên văn 360°) ở r 24,4, bồn mẫu đơn và bonsai, "Đài Sen" kính mờ r 15,6 che sảnh thang |

- Vương miện tâm y 165,5: 3 vòng gimbal vàng tự quay (R 15,5/14/12,6), lõi hồng `0xbe185d` "thở", vỏ não pha lê 9 × 7,5 × 10 `0xbfe9ff`, băng chữ quay r 18,4 nền navy `#0a1526` chữ vàng "★ QA · QC · QE ★".

**Khác trên đỉnh**
- Sân bay Đỉnh Mây (`:432-445`): sàn x 820–980, z 50–125, y 110; đường băng ngắn 160 × 26; 2 bãi trực thăng; nhà ga kính 36 × 7 × 14 mái vàng ở (850, 113). Đã đăng ký `W.AIRPORTS`.
- Xích đu tử thần (880, 265): trục 28 m, cần 24 m, 55°, 26 giây, **40 💰**. Khinh khí cầu (925, 250): lên y 210, 54 giây, **50 💰**.

**PLACES:** Đỉnh Brain Citadel (≈ 865, 230) · Đường đèo ngắm biển · Phố săn mây · Sân bay Đỉnh Mây (860, 110) · Xích đu & Khinh khí cầu (880, 250).

**Bot (≈ 27):** 9 chủ quán/barista/đầu bếp, 5 khách săn mây, 3 khách trên cầu kính, 1 nhiếp ảnh gia, 3 nhân viên tầng 1–3, 1 bartender, 2 cơ thủ bida, 2 nhân viên trò chơi, 1 phi công trực thăng.

**Ban đêm:** đèn đèo sáng dần, trụ pha lê và đèn lồng phát sáng, cáp cầu kính cam, lõi hồng thở mạnh hơn, 8 cột sáng tím `0xc9b8ff` cao 180 m ở r 48, tia sáng từ 8 chóp đèn tới quả cầu.

**Còn dở:** Phòng Bí ẩn chưa có nội dung; chuyến bay Sân bay Đỉnh Mây chưa mở; không có người đi bộ trên đèo; vỏ não vượt trần vùng (≈ y 173 > 168); chú thích đầu file còn ghi "2 thang máy kính" (thực tế 4).

---

<a id="v2-devcity"></a>

### V2.5 · Dev City 8D (`js/devcity_chongqing.js`, `js/devcity_landmarks.js`, `js/bots_devcity.js`)

**Địa hình** (`devcity_chongqing.js:20-252`, trong mã dùng `d = −z`)
- Vùng x 100…850, z −950…−120, y 2…135; lưới EXTL ô 2,5 m. Góc x < 180, z > −186 để trống cho Abyssal.

| Thềm | Cao độ | Mép vách (d = −z) |
|---|---|---|
| T1 bờ sông | +2 | bờ d ≈ 158–192; vách lên T2 từ d ≈ 214–230 |
| T2 lưng núi | +24 | vách lên T3 ở d ≈ 440 |
| T3 cao nguyên | +52 | vách lên T4 ở d ≈ 712 |
| T4 đỉnh mây (sân bay) | +85 | |

- Thêm: cao nguyên Tây +46 (x < 236); thung lũng +2 tâm (280, −310) r 50; đỉnh A (720, −675) sân +72; đỉnh B (785, −790) sân +98; hẻm vực giữa 2 đỉnh đáy +44. Cỏ `0x5d8f3c`/`0x7fa94a`, rừng `0x2f5a2c`, đá `0x857f73`, lát `0xc9c2b4`; ≤ 1.400 mỏm đá instanced.
- Sông phía Bắc (kè đá 3,6 m, lan can thép). Hồ Thiên Cảnh tâm (560, −600), elip 65 × 42, mặt nước +51,6 (`0x2a7f98`), đảo r ≈ 14.

**Đường xe** (`:132-144`, dốc ≤ 10 %, đèn mỗi 26 m so le, hộ lan phía vực)

| Tuyến | Toạ độ (x, z, y) | Rộng / làn |
|---|---|---|
| Đại lộ Bến Sông | (220, −176) → (700, −176), +2 | 14 m / 4 |
| Đường đèo Vách Đông | (600, −182) → (840, −252), +2 → +24 | 10 / 2 |
| Đại lộ Lưng Núi | (840, −252) → (840, −300) → (345, −300) | 12 / 2 |
| Phố Bệnh viện – Xuyên Lầu | vòng x 365…600, z −300…−395, +24 | 9 / 2 |
| Đường Thung lũng | (300, −176) → (281, −274), +2 | 10 / 2 |
| Hầm đôi Nam Sơn | x 450, z −300 → −700, +24 → +52 | 20 / 4 |
| Vành đai Cao nguyên | khung x 330…650, z −490…−700, +52 | 12 / 2 |
| Đại lộ Giải Phóng | (214, −246, +46) → (176, −428) → (330, −490, +52) | 10 / 2 |
| Phố Cao nguyên Tây | (214, −246) → (222, −482) | 9 / 2 |
| Đường đèo Mây Trắng | (650, −700, +52) → (350, −747, +85) | 10 / 2 |
| Vòng đón khách Sân bay | x 252…462, z −752…−768, +85 | 10 / 2 |
| Đường lên chùa + vòng xuyến r 9 | (650, −600) → (711, −596) | 8 / 7 |

**Cầu và đường trên cao** (`deck`, `:259-307`; bản bê tông, tường chắn 1,05 m, trụ mỗi 14 m)
- Nút giao xoắn ốc 5 tầng: tâm (280, −310), r 36, 4,5 vòng, +2 → +52, rộng 9 m, 16 cột chung.
- Cầu cạn lên cao nguyên (280, −346) → (326, −484) ở +52.
- Cầu dây văng 2 tầng x 220, z −121…−177: tầng dưới đường xe rộng 15 m; tầng trên (+10, rộng 5,4 m) là dầm tàu điện; tháp chữ H cao 60 m, 16 dây văng. Đầu cầu nối CBD ở (220, −104). (Nhãn trong game ghi ngược tầng.)
- Cầu cổng G5 → CBD: x 384, z −169 → −119, rộng 12 m. Cầu cổng G6 → Brain: x 700, z −177 → −98, rộng 12 m, +2 → +4,05.
- Hầm đôi Nam Sơn (`:370-403`): x 440…460, kín d 440…605 + hào hở d 605…663, 2 lòng × 8,4 m có vách giữa, vòm LED xanh `0x2a8cff` mỗi 12 m, cửa Nam ốp đá cao 31 m.

**Công trình** (`devcity_landmarks.js`)

| Công trình | Vị trí / kích thước | Phong cách | Vào được / thang |
|---|---|---|---|
| Dev Sky-Crystal (`:56-64`) | 4 tháp tiết diện thấu kính 26 × 15 ở x 437,5/472,5/507,5/542,5, z −198; thân +2 → +92, phần trên +100 → +117; sống cánh buồm trắng cao 115 m | kính PBR (khung `#8fa0b0`, kính `#2f5576`), sống `0xf1efe9` | thân đặc; 2 dãy × 2 thang liftkit ở x 455 và 490 (G ↔ +93) |
| The Crystal – ống kính ngang (`:65-83`) | 140 × 24 × 8 m, x 420…560, sàn +93,2 | vỏ kính bo tròn, sườn trắng mỗi 7 m, sàn kính 20,5 m đầu Tây, hồ bơi vô cực 28 × 13, vườn cọ | đi lại bên trong được |
| 5 lớp học Dev (`:78-80`) | hộp kính 11 × 3,4 × 7 ở x 448/463/478/493/508, z −204,5: Backend, Frontend, System Design, DevOps, AI | kính + mái trắng, biển `#0e3b5c` | E chỉ báo "đang biên soạn" (một AI khác đang soạn bài) |
| Lầu Vách Đèn Lồng – phố cổ treo vách (`:86-136`) | x 148…228, vách sau z −233; 11 sàn × 4 m (+2 → +42); sân thượng +46 rộng 80 × 46 có 3 đình mái cong | gỗ tối `#4a2a16`, cột đỏ `0xa82a1f`, mái ngói, đèn lồng, cửa sổ ấm | đi bộ mọi sàn; cầu thang ngoài trời x 229…237; liftkit vàng (225, −193) G ↔ +46; quán lẩu cay 45 💰, mì kéo sợi 30 💰, trà đạo 25 💰 |
| Dev Residency Tower (`:139-170`) | (380, −420), 30 × 24; thân +24 → +78 (18 tầng), khoét rỗng tầng 6–8 cho tàu điện chui qua; mái kính + vườn tới +82 | căn hộ ban công `#efe9df`, 4 lõi bê tông | thân đặc; vào sân ga +39,2 (liftkit) và ban công tầng 15 sau khi mua 3.000 💰 / thuê 250 💰 |
| Trường liên cấp Dev Sơn Thành (`:175-180`) | chữ U: khối chính 58 × 10 ở (519, −281), 2 cánh 10 × 24, cao 16 m; sân thể thao 40 × 34 | mặt tiền `#d9b98c`, đường chạy đỏ `#b8452e` | không |
| Dev Grand Hotel 5★ (`:182-185`) | bệ 58 × 36 cao 8 m ở (721, −263), thân thấu kính 42 × 17 lên +86, vương miện kính + vòng vàng | | không |
| Bệnh viện Sơn Thành (`:187-196`) | chữ H: 2 cánh 72 × 14 ở (680, −345)/(680, −391) cao 21 m, thân giữa 18 × 34 cao 24 m, sân trực thăng trên mái | `#d7d2c8`, chữ thập đỏ | không |
| Trạm cứu hoả Lưng Núi · 114 (`:198-201`) | 46 × 22 ở (800, −345), cao 10 m, tháp tập lên +50, 3 cửa đỏ | | không |
| Cao ốc T2 (4 toà) + 21 cao ốc T3 (`:42-49, 203-217`) | T2 cao 22–34 m; T3 cao 48–76 m quanh hồ, "Dev Tower – Trung tâm Cao nguyên" (365, −642) cao 62 | 5 loại mặt tiền (kính, văn phòng, căn hộ, ấm, tối `#2b3138`) | không |
| Công viên hồ Thiên Cảnh (`:220-240`) | lối dạo vòng 4,4 m, cầu chữ chi gỗ, cầu vòm đá, đình 8 × 8 trên đảo, 16 ghế đá | | đi bộ |
| Sân bay đỉnh núi +85 (`:243-270`) | đường băng 40 × 470 ở (375, −885), sân đỗ 190 × 32, nhà ga 160 × 26 cao 13 mái sóng trắng ở (370, −787), đài kiểm soát ≈ 41 m, 3 máy bay đỗ, 1 máy bay cất cánh mỗi 80 s | | nhà ga không vào được |
| Chùa trên núi "Linh Sơn Vân Tự" (`:273-361`) | bậc đá 7 m lên đỉnh A, cổng tam quan, bảo tháp bát giác 9 tầng ≈ 54 m, cầu xích gỗ ≈ 80 m qua hẻm, chánh điện treo vách 22 × 14 (sàn +72, nửa trong hang), tượng Phật vàng 32 m trên đỉnh B, 16 mây sprite | đá, đỏ, vàng | đi bộ; lên đỉnh tượng bằng E (dịch chuyển); thắp hương |
| Bến du thuyền (`:364-373`) | 3 cầu tàu gỗ 3,2 × 26 ở x 652/742/778, z −146; 6 du thuyền | | đi bộ |

**Tàu điện một ray "Xuyên Lầu"** (`chongqing:311-367`): dầm bê tông trên trụ chữ T, từ tầng trên cầu dây văng (222, −121, +11,4) → (346, −300) → xuyên toà Residency (380, −420, +38,6) → (788, −420). 3 ga sân dài 50 m: Bến Sông (≈ 224, −177, +12,6), Xuyên Lầu (380, −420, +39,2), Đông Sơn (780, −420, +39,2). 4 toa × 11 m (xanh ngọc/tím/cam), tối đa 22 m/s, chạy con thoi, miễn phí; đứng sân ga tàu tới tự lên.

**PLACES (14):** Bến Sông (380, −172) · Nút giao xoắn ốc (300, −250) · Hầm đôi (450, −412) · Cao nguyên & hồ (560, −520) · Ga Xuyên Lầu (380, −401,6) · The Crystal +93 (445, −192) · Lầu Vách Đèn Lồng (200, −186) · Lưng Núi +24 (640, −306) · Trung tâm Cao nguyên +52 (470, −496) · Đình giữa hồ (562, −596) · Sân bay +85 (370, −746) · Chánh điện treo vách · Đỉnh tượng Phật +98 · Bến du thuyền (742, −163).

**Bot (42):** phố cổ (nghệ nhân múa mì, nghệ nhân đổi mặt nạ, 2 người bán kẹo hồ lô, 5 khách), lái tàu + 4 khách săn ảnh tàu chui qua nhà, 1 cảnh sát giao thông ở nút giao, kiến trúc sư + 2 khách + 2 gondola lau kính ở The Crystal, lính cứu hoả, bác sĩ, phi công, 4 học sinh, 2 khách thả hoa đăng, 2 người chạy bộ, 1 nghệ sĩ đàn trong đình, 2 sư + 2 khách hành hương ở chùa, nhân viên và tổ bay ở sân bay. Xe bot chạy mọi đường của Dev City (tối đa 11 m/s, trong hầm 13).

**Ban đêm:** đèn đường và tường gỗ phố cổ sáng dần, cửa sổ PBR sáng 45–60 %, LED hầm luôn sáng, biển hiệu và đèn lồng phát sáng, hoa đăng.

**Còn dở:** 5 khoá Dev chưa có bài; hầu hết toà là khối đặc chưa nội thất (khách sạn, bệnh viện, trường, cứu hoả, cao ốc T2/T3, nhà ga, 4 tháp Crystal, thân Residency); vài nhãn/biển và tên NPC còn tên địa danh có thật cần đổi; cổng G5 ở x 384 (kế hoạch 380).

---

<a id="v2-wonder"></a>

### V2.6 · Wonderland & Công viên Kỳ Quan (dời về Nam) (`js/wonder_v2.js` + `js/worldshift.js`)

**Cách dựng:** `wonder_v2.js` gọi lại 2 module V1 (`funisland.js` và `themepark.js` kéo theo `themerides.js`, `themeland2.js`, `themedark.js`, `themeplay.js`, `coastertrack.js`) với độ dời **dx −130, dz +265,5** qua `worldshift.js`. Toạ độ thế giới = toạ độ V1 + (−130, +265,5). Chỗ nào module tự lấy toạ độ thế giới phải đổi qua `W.SHIFT.toW` / `toL` – điểm dễ lỗi khi thiết kế lại.

**Đất và mặt nước**
- Vùng ZONES x −400…230, z 485…1510. Wonderland x −140…2, z 487,5…627,5, mặt +1,7; Kỳ Quan x −400…233, z 637,5…1507,5, mặt +2,0.
- Hồ Pha Lê tâm (−90, 885,5), elip 200 × 116 m, mặt nước +1,55, đảo giữa r 22 có vọng lâu bát giác, 2 cầu vòm đá 5,4 m, đài phun nhạc 26 vòi (2 vòi cao 22 m). Hồ Atlantis (106, 1417,5), hồ khủng long (40,7, 1296,5).

**Cổng và lối chính**

| Hạng mục | Thông số |
|---|---|
| G8 – cầu cong Sân bay → mũi Bắc Wonderland (`wonder_v2:73-77`) | (0, 379,4, +4) → (−77, 504, +1,75), rộng 12 m: nhựa 8,8 m (2 làn) + vỉa hè 1,3 m mỗi bên, lan can bê tông + tay vịn, trụ đôi mỗi 16 m, đèn mỗi 30 m |
| Cầu đá Wonderland → Cổng Kỳ Quan | x −90, z 602,5 → 661, rộng 8,4 m |
| Đại lộ Ánh Sao | x −103…−77, z 679,5…773,5 (rộng 26 m), dải hoa giữa |
| Đại lộ Phiêu Lưu xuống khu Nam | x 78…90, z 899,5…1149,5 |
| Đại lộ ngang | z 1149,5…1161,5, x −340…200 |
| G9 – lối lát sang Palm (`wonder_v2:80-90`) | đá rộng 7 m, x 90 → 211 ở z 900; mố cầu x 208 → 219,4 rộng 9 m; cầu Palm bắt đầu x 218 |

- Bên trong 2 công viên **không có đường xe**; xe từ G8 bị cụt ở mũi đảo, xe từ G9 quay đầu ở x 200.

**Đảo QC Wonderland** (tâm (−69, 556,5), r ≈ 57): cổng lâu đài 2 tháp hồng (−73, 516,5); đu quay ngựa gỗ 10 ngựa (trang trí); tàu lượn Siêu Bug (đỉnh ≈ +28, 25 💰); tháp rơi 60 m (25 💰); thuyền hải tặc đu 75° (20 💰); Nhà Ma Bug 24 × 16 m (20 💰); quầy kem 15 💰; 16 cột cờ + đèn.

**Công viên Kỳ Quan**
- Cổng chính: 2 tháp 6 × 15 × 6 ở x −102/−78, z 667,5, vòm 18,4 m, biển `#12305a`/`#ffe9a8`, tường vữa `0xf2e6cf`, mái `0x1f5f8f`.
- Đại lộ Ánh Sao: nhà phố 2–3 tầng (không vào được) xen 8 quầy ăn (12–22 💰). Quảng trường HUB (−90, 791,5) r 21 có đài phun 3 tầng.
- 20 trò (mua vé E ở quầy, xếp hàng theo rào, lên xe bằng E):

| Trò | Vị trí (thế giới) | Thông số | Giá 💰 |
|---|---|---|---|
| Thần Long Cuồng Nộ | ga ≈ (−110, 977,5) | dốc 68 m, lao 84°, vòng lộn 39 m, 126 km/h | 35 |
| Tia Chớp Không Gian | ≈ (−30, 801,5) | phóng 0 → 133 km/h, mũ chóp 60 m | 35 |
| Song Dực Đại Bàng | ≈ (−252, 881) | 2 tàu treo đua song song | 35 |
| Tháp Sấm Sét QC | (−182, 803,5) | cao 82 m, rơi 80 m | 30 |
| Mắt Thần QC World | (42, 885,5) | vòng quay 90 m, 24 cabin | 25 |
| Kỷ Jura Tuyệt Diệt | ga ≈ (28, 1240,5), núi 66 m | | 35 |
| Lời Nguyền Hầm Mỏ Dung Nham | ga ≈ (−150, 1181,5), núi lửa 55 m | có đoạn trượt lùi | 35 |
| Đền Thờ Atlantis Chìm Đắm | ga ≈ (−12, 1373,5) | | 35 |
| Con Tàu Ma Ngọc Trai Đen | (−250,4, 1200,9) | xoay 360° | 25 |
| Khúc Nhạc Cung Đình | (−329,6, 1200,9) | ngựa gỗ 2 tầng | 15 |
| Vũ Điệu Gió Trời | (−250,4, 1280,1) | đu dây văng 56 m | 25 |
| Con Lắc Thần Sấm | (−329,6, 1280,1) | | 25 |
| Dinh Thự Huyết Nguyệt (nhà ma) | (−366, 1073,5) | | 35 |
| Phòng Thí Nghiệm Khu 13 | (−254, 1073,5) | bắn bằng E | 35 |
| Lời Nguyền Xác Ướp Hoàng Đế | (−142, 1073,5) | | 35 |
| Huyền Thoại Xứ Sở Thần Tiên | lâu đài 65 m (−70, 1445,5) | thuyền bay | 30 |
| Đường Đua F1-QC (go-kart) | (−222, 1390,5) | tự lái 3 vòng | 30 |
| Bão Điện Từ (xe điện đụng) | (−202, 1415,5) | | 20 |
| Đôi Cánh Vượt Kỳ Quan (rạp bay 4D) | (−342, 1327,5) | | 30 |
| Ảo Ảnh Vô Cực (mê cung gương) | (−256, 1311,5) | | 20 |

**PLACES:** Đảo Wonderland (−73, 510,5) · Cổng chính Kỳ Quan (−90, 675,5) · Quảng trường & Hồ Pha Lê (−90, 814,5) · 20 điểm trước cổng từng trò.

**Bot:** 9 khách đứng ở Wonderland, 8 đầu bếp quầy ăn, nhân viên soát vé và vận hành ở mỗi trò. Không có người đi bộ dạo.

**Ban đêm:** quầng sáng ở đèn cầu G8/G9, cầu đá, quầy ăn, cổng; biển hiệu phát sáng; cửa sổ tím nhà ma.

**Còn dở:** chưa có đường xe trong công viên (G8 cụt, G9 chỉ đi bộ); nhà phố, quầy ăn, nhà ga các trò không có nội thất; không có thang máy; đu quay ngựa không chơi được; đất lệch ra ngoài ZONES 3 m; còn 2 điểm cụt đã biết ở (−77, 504) và (200, 900).

---

<a id="v2-lang"></a>

### V2.7 · Đảo Ngoại ngữ núi tuyết (khoá `swiss`, `js/swiss_lang_island.js`)

**Địa hình** (`:39-101`)
- Vùng x −850…−250, z −500…250, y 0…95. Bờ là siêu-elip tâm (−550, −125), bán trục 287 × 362, thêm nhiễu.
- Nền cao `4 + fbm·12`; phía Bắc (z < −300…−440) có dãy núi cao thêm tới +100 m, tuyết `0xf4f7fb` từ ≈ 58–72 m. Cát `0xd8c79a`, cỏ `0x6aa846`/`0x8fbe4f`, đá `0x8b8780`, đốm hoa vàng/tím. Lưới đất 3 m, 9 nền công trình san phẳng.
- 3 hồ (hồ sen 47 × 38 ở mặt nước 4,7; hồ cổng đỏ 24 × 14; hồ đá 17 × 14), suối băng 10 điểm từ (−560, −372) tới (−500, 272) rộng 4,2 → 7,5 m, thác 9 m.

**4 học viện** (khung chung `academy()`, `:137-195`): cửa chính mặt Nam rộng 4,4 m, tường 0,6 m. Đại sảnh giữa (2 bàn dài, ghế băng, 2 kệ sách, bảng lộ trình, quầy học vụ); lớp học A 12 bàn (Tây-Bắc), Phòng kiểm tra (Đông-Bắc), phòng chuyên đề (Tây-Nam), quán (Đông-Nam). **1 tầng, không thang máy**, mái tự ẩn khi vào trong. 6 điểm E mỗi học viện, học miễn phí; phần nghe/thi chạy trong app `langui.js`.

| Học viện | Tâm · kích thước | Sàn · tường | Phong cách | Riêng |
|---|---|---|---|---|
| Tiếng Anh (`:203-239`) | (−420, −80) · 50 × 36 | +6,15 · 9 m | lâu đài đá `#d6ccb6`/`#9a907f`, 4 tháp góc r 4,4 cao 14 m có răng cưa, mái slate `0x3c4048`, cửa vòm nhọn | tháp đồng hồ ≈ (−386, −68) cao ≈ 43 m chạy theo giờ thật; nhà kính bán trụ dài 30 m + 160 khóm hồng; quán trà 10 💰 |
| Tiếng Trung (`:241-275`) | (−680, −80) · 50 × 38, trên hồ sen | +6,0 · 7 m | song cửa đỏ `0x8a1f17` nền kem, 26 cột đỏ `0xb3261e`, mái cong 2 lớp vàng `0xd8a531` | cầu 9 khúc 2,8 m, 140 lá sen, 300 cây trúc, bàn thư pháp |
| Tiếng Nhật (`:277-310`) | (−420, −280) · 52 × 40 | +9,4 (bệ đá 2,4 m) · 6,5 m | khung gỗ + vách giấy, sàn tatami `0xc9c08a`, mái 3 lớp `0x3b3a40` | cổng đỏ dưới hồ cao 13 m, cầu gỗ cong, vườn đá 22 × 14, 40 cây hoa anh đào. **Khoá học trống** |
| Tiếng Hàn (`:312-343`) | (−680, −280) · 52 × 40 | +7,6 · 7 m | nửa Tây mái ngói cổ (gỗ/xanh `0x2f8f6f`/đỏ `0xc0392b`), nửa Đông khối kính cao 9 m | màn LED 20 × 10, lầu trên hồ đá, 32 cây ngân hạnh. **Khoá học trống** |

**Cảnh quan, giao thông, làng** (`:345-541`)
- 520 cây thông, 120 cây lá, 2.600 hoa, 18 con bò (E nghe chuông), 3 cối xay gió quay.
- Tàu bánh răng: vòng chữ nhật bo góc x −740…−360, z −360…20; 3 toa đỏ `0xc0201a`, 9 m/s, 5 ga (Tiếng Anh, Tiếng Nhật, Tiếng Hàn & Làng Tuyết, Tiếng Trung, Cầu Vòm); vé 5 💰 (miễn phí khi đã học ≥ 1 bài); lên tàu là dịch chuyển.
- Làng nhà gỗ 8 căn (x −612…−498, z 68/92): lẩu phô mai 20 💰, sô-cô-la 10 💰, tiệm đồng hồ; nhà trọ chỉ có biển. Làng Tuyết 4 nhà + 8 cọc cờ trượt (chỉ toast). Bến thuỷ phi cơ (−306, 158), bay về điểm xuất phát 10 💰.
- Đường nội đảo chỉ để đi bộ: đường dạo vòng đảo 4 m, vòng làng 4,5 m, 5 lối vào 3,2–3,4 m, Đại lộ Cổng Đông 7 m ở z −16.
- Cầu G3: từ bờ (x ≈ −272) tới (−180, −16), rộng 8 m (mặt nhựa 6,6 m), cao +2, vồng 0,9 m, lan can 1,1 m, đèn mỗi 16 m, 2 cổng biển hiệu.

**PLACES:** Toàn đảo (−330, −180) · 4 học viện (−420, −50), (−680, −33), (−420, −238), (−680, −250) · Làng (−540, 80) · Làng Tuyết (−760, −330) · Bến (−312, 152).

**Bot (12):** 4 giảng viên, 1 người thổi kèn, 2 người chăn bò, 1 lái tàu, 4 du khách.

**Còn dở:** chưa có bài tiếng Nhật/Hàn (một AI khác đang soạn theo `docs/PROMPT_TAI_LIEU_HOC.md`); học viện 1 tầng; nhà trọ và trượt tuyết chưa tương tác thật; mã còn một số tên địa danh có thật cần đổi sang tên tự đặt.

---

<a id="v2-palm"></a>

### V2.8 · Quần đảo cọ The QC Palm Archipelago (`js/palm_dubai.js`, bot trong `js/bots_swiss_palm.js`)

**Địa hình** (`:42-89`): x 250…1050, z 520…1320, tâm (650, 920), mặt đảo +2,2. Thân cọ x 585–715, z 520–940 + tròn r 65 ở (650, 940); dải Bắc x 425–875, z 520–558; 8 nhánh lá ở z 660/740/820/900 (nửa rộng 20/24/28/32 m); vành trăng khuyết r 336–398 mở về phía Bắc. Bờ dốc xuống −6 trong 16 m. Cát `0xf1e3c0`, cỏ `0x7fbf55`.

**Đường** (`:104-142`, nhựa `0x3a3d42`, mỗi chiều 1 làn, vmax 10 m/s)

| Tuyến | Toạ độ | Rộng |
|---|---|---|
| Đại lộ Bắc | z 538, x 436 → 864 | 9 m |
| Đường vành | r 350 | 8 m |
| 2 đại lộ thân cọ | x 625 và 675, z 538 → 948 | 8 m |
| Vòng xuyến | r 16 quanh (650, 968) | 8 m |
| 8 đường nhánh + 8 cầu vòm ra vành | | 8 m / 7 m |
| Cầu G7 | (450, 458) → (450, 524) | 10 m |
| Cầu G9 | (218, 900) → (256, 900) | 9 m |

Cầu mặt đá, lan can thép 1,1 m; cổng vàng cột 8 m ở (450, 527) và (259, 900).

**Nhà ở bán được** (`:144-271`, lưu ở `S.ownedEstates`, mua thêm không mất căn cũ)

| Hạng | Giá 💰 | w × d × h (m) | Vị trí | Số căn |
|---|---|---|---|---|
| Nhà phố trắng mái vòm xanh coban | 2.500 | 8 × 10 × 6,6 | nhánh F1, F2 | 24 |
| Duplex kính, đá kem + gỗ | 12.000 | 12 × 14 × 7,4 | F3, F4 | 20 |
| Biệt thự hồ bơi, marble | 35.000 | 18 × 18 × 8 | F5, F6 | 16 |
| Siêu biệt thự bến du thuyền, 3 tầng kính | 85.000 | 26 × 22 × 11,4 | F7, F8 | 12 |
| Dinh thự lớn nhất | 250.000 | 50 × 36 × 14,6 | vành, r 374 | 4 |

- Cửa khoá với người chưa sở hữu; biển "ĐANG BÁN" (E mua hoặc xem nhà mẫu 60 s).
- Nội thất: mỗi hạng 1 bộ dùng chung (sofa, bếp, giường, TV, bàn ăn, đèn chùm; bàn bida cho 3 hạng cao), dời tới căn gần nhất trong 60 m.
- Siêu biệt thự có sàn +4,2 và +8 nhưng **không có lối lên**. Dinh thự: 6 cột marble, sàn +4,8/+9,6 **không lên được**, sân trực thăng trên mái, thuỷ cung ngầm 16 × 12 ở −3,4 (36 cá), bến du thuyền 24 m. **Hồ bơi dinh thự bị lọt trong chú thích nên không dựng** (`:190`).

**Thân cọ** (`:291-365`)
- Monorail cao +13, x 650, z 548 → 1282, 3 toa 14 m/s, 3 ga (Gateway z 562, Phố Ẩm Thực z 782, Vành z 1268), vé 8 💰.
- Phố ẩm thực 8 quán (z 610 + 32i), 15 💰 mỗi món. 6 Beach Club ở x 650 ± 41 (nhà 10 × 3,4 × 12 + hồ bơi 6 × 10), 20 💰.
- Trung tâm thương mại kính 36 × 9 × 38 tại (650, 905): **khối đặc, không vào được**.
- 4 tháp căn hộ 22 × 22 × 60 m tại (608, 595), (692, 595), (608, 935), (692, 935): sảnh kính vào được, sân thượng hồ bơi 10 × 6; bán căn tầng 3/9/18 giá 8.000/12.000/18.000; **chưa có tầng ở thật** (thang chỉ G ↔ mái).
- Đài phun nước r 9,4 ở (650, 968).
- Khách sạn mái vòm: 2 khối 20 × 28 × 50 m (x 613–633 và 667–687, z 1286–1314), vòm nối tầng 40–50, sảnh 34 × 16 × 9 là khối đặc, đài tầng 50 có hồ bơi 20 × 8. Nhận phòng 300 💰.

**22 thang máy:** 4 thang dinh thự (G ↔ sân trực thăng, tự do) · 4 thang kính thuỷ cung (chỉ chủ) · 12 thang trong 4 tháp × 3 (chỉ cư dân) · 2 thang khách sạn G ↔ tầng 50 (chỉ khách; cờ `W.palmHotelGuest` mất khi tải lại trang).

**PLACES:** Đảo (450, 546) · Phố ẩm thực (650, 598) · Tháp (608, 612) · 4 nhánh lá (565, 660/740/820/900) · Dinh thự · Khách sạn (650, 1272) · "Nhà của tôi".

**Bot (23):** 4 quản gia dinh thự + 1 quản gia riêng, 3 đầu bếp, 2 cứu hộ, 1 DJ + 2 người nhảy, 6 khách tắm nắng, 4 thợ lặn quanh thuỷ cung.

**Còn dở:** hồ bơi dinh thự; tầng trên siêu biệt thự và dinh thự; tầng ở thật trong 4 tháp; trung tâm thương mại và sảnh khách sạn chưa vào được; mã còn một số tên địa danh có thật cần đổi.

---

<a id="v2-he-thong"></a>

### V2.9 · Hệ thống chung toàn thế giới V2

**`js/v2core.js`:** V2 mặc định (`?v1` hoặc `localStorage qcworld-v2='0'` xem bản cũ). `ZONES` 8 vùng; `BOTS` (abyssal; Swiss/Palm do `palm_dubai.js` nạp); `EXTRAS` = traffic, police, events. `clearLegacy` gỡ nội dung V1 trong bán kính 3.000 m; nạp theo thứ tự ZONES → BOTS → EXTRAS.

**Giao thông `js/v2traffic.js`**
- Đồ thị `W.roadNet` gom `W.V2ROADS` + đường/sàn Dev City + đường đèo Brain + G6 + tuyến G3; nối nút cổng trong 5 m. API `route` (Dijkstra), `nearest`, `onRoad`, `lanePoint`.
- Tốc độ tối đa theo vùng (m/s): abyssal 11 · cbd 12,5 · skyport 11 · palm 10 · wonder 8 · devcity 11 · brain 9 · swiss 6.
- Làn: mỗi chiều 1 làn; đường ≥ 18 m có 2 làn mỗi chiều và cho vượt.
- Xe bot: 38/42/46 xe theo chất lượng + 4 xe tuần tra, mô phỏng trong 180–210 m. Sedan 20 %, SUV 15 %, xe nhỏ 11 %, thể thao 6 %, bán tải 8 %, taxi 17 %, van 11 %, buýt 12 %. Nhường ở giao lộ, giữ khoảng cách, bóp còi. Vẽ InstancedMesh (≈ 15 lượt vẽ). Xe đặc biệt qua `spawnVehicle`: cảnh sát, cứu hoả, cứu thương, xe chở tiền.
- Buýt (≈ 25 m) và taxi (≈ 40 m) tấp lề ngẫu nhiên đón khách; **chưa có trạm buýt cố định**.
- Người đi bộ 30/36/40 trong 100–120 m: dạo, xách túi, nghe điện thoại, chạy bộ, dắt chó, đi nhóm; qua đường ở vạch kẻ. Không có ở brain, swiss, wonder.
- **Đang làm (phiên người đi bộ, 16/11):** tăng tốc xe đạp +20 %, xe máy +35 %, ô tô +50 %, buýt +40 %, tàu +70 %; trạm buýt cố định cách nhau ≥ 400–500 m; bớt 25–30 % xe bot.

**Sự kiện `js/world_events.js`** (lần đầu sau 150–210 s, sau đó mỗi 150–240 s, mỗi lúc 1 sự kiện, chỉ ngoài trời; phím thử Shift + 1…9)

| Mã | Sự kiện | Thưởng |
|---|---|---|
| A | Trộm móc túi, cảnh sát đuổi bắt | lấy lại tiền; tự hạ trộm +30 💰 |
| B | Cháy trên phố, xe cứu hoả tới phun 12 s | – |
| C | Yêu quái + siêu nhân Captain QA, rơi 10 pha lê | +10 💰/viên |
| D1 | Người ngất, xe cứu thương | – |
| D2 | Xe chở tiền rơi 15 túi xu | nhặt +10/túi hoặc trả tài xế ×3 |
| D3 | Va chạm nhẹ, cảnh sát hoà giải | – |
| D4 | Flashmob (F để nhảy) | +40 💰 |
| D5 | Robot trà sữa lỗi (E sửa) | +35 💰 |
| D6 | Lễ hội đèn trời 48 đèn (ban đêm) | – |

**Sở Cảnh Sát QC City · 113** (`js/police_station.js`): trong CBD, x 214–244, z 354–382, 3 tầng + bãi trực thăng (chi tiết ở phần CBD).

**Âm thanh môi trường** (`js/ambience.js`, `js/ambience_world.js`): tổng hợp bằng WebAudio, không dùng file. Bật/tắt + thanh âm lượng (mặc định 60 %), trong nhà lọc trầm. Nguồn: sóng, xe gần, tiếng người, gõ phím; máy bay phản lực (nghe trong 300 m), máy bay cánh quạt, trực thăng, còi khẩn cấp có Doppler (320 m), tàu, cáp treo, thuyền, kayak, khinh khí cầu, lửa, vòi rồng, đám đông, flashmob, robot, đèn trời, pháo hoa, thác/đài phun nước, chuông gió; gió trên cao, mưa, chim ngày/dế đêm; tiếng chuông và cửa thang máy.

**Thang máy bước vào** (`js/liftkit.js`): giếng kính khung thép, cabin có sàn đi theo, gương, tay vịn; cửa tầng 2 cánh chỉ mở khi cabin đỗ đúng tầng, tự đóng sau 2,5 s; E "Gọi/Mở cửa" mỗi tầng, bảng nút `#liftPanel` trong cabin. Thời gian T = max(1,6; min(Δy/2,6; 6 + Δy/9)) giây (91 m ≈ 16 s). Ẩn khi xa hơn 170 m. `makeLiftBank` dựng dãy thang. Dùng ở Abyssal, CBD, Brain, Dev City, Sân bay, Palm (22), Sở Cảnh Sát… Cảnh nội thất 1 tầng dùng `js/floorlift.js` (cabin bước vào, đổi tầng khi cửa đóng hẳn).

---

---

<a id="v2-ton-dong"></a>

### Việc đang làm và tồn đọng (16/11/2026)

**Đang làm (chưa lên GitHub):**
- Sân bay: hoàn thiện hầm cho xe và người đi qua dưới đường băng; sửa lộ trình bay (leo cao hơn toà nhà cao nhất trước khi rẽ, không đâm toà nhà).
- Giao thông: tăng tốc xe đạp +20 %, xe máy +35 %, ô tô +50 %, buýt +40 %, tàu +70 %; trạm buýt cố định cách nhau xa; bớt xe bot.
- Đáy vực Abyssal: vá lỗ sàn, bịt khe vách, nước không tràn vào công trình, đường nhựa 2 làn nối từ vành đai xuống đáy cho xe chạy.
- Tài liệu học: 5 khoá Dev cho The Crystal, chủ đề hội thoại tiếng Anh C2 / tiếng Trung HSK 7–9, toàn bộ tiếng Nhật và tiếng Hàn (một AI khác soạn theo `docs/PROMPT_TAI_LIEU_HOC.md`).

**Chờ thiết kế lại:** 2 toà lớn của đảo Abyssal – Cánh Xanh "QA · QC · QE Academy & Tech Hub" (phía Tây) và Cánh Đỏ "Abyssal Horizon Residences" (phía Đông).

**Tồn đọng lớn theo vùng:**

| Vùng | Chưa có / còn lỗi |
|---|---|
| Abyssal | nội thất 12 + 14 tầng của 2 cánh; 24 shophouse chưa vào được; xe chỉ chạy vành đai |
| Sân bay | làn đón trả khách trước nhà ga; nhà ga 1 tầng, chưa có cửa hàng |
| CBD | 4 tháp căn hộ Starlight chưa nội thất và thang máy; Cyber Twin chỉ vào sảnh |
| Brain | Phòng Bí ẩn tầng 4 trống; chuyến bay Sân bay Đỉnh Mây chưa mở; đèo không có người đi bộ |
| Dev City | 5 lớp học chưa có bài; hầu hết toà là khối đặc |
| Đảo Ngoại ngữ | tiếng Nhật, tiếng Hàn chưa có bài; học viện 1 tầng |
| Palm | hồ bơi dinh thự không dựng; tầng trên siêu biệt thự/dinh thự không lên được; 4 tháp chưa có tầng ở; trung tâm thương mại và sảnh khách sạn là khối đặc |
| Wonder | không có đường xe trong công viên (G8 cụt ở (−77, 504), G9 chỉ đi bộ ở (200, 900)); nhà phố, quầy ăn không vào được |
| Toàn thế giới | chưa có trạm buýt cố định; một số tên còn sót tên địa danh/thương hiệu thật |

---

<a id="phan-b-v1"></a>

# PHẦN B · THẾ GIỚI V1 (`world.html?v1`) – hiện trạng 15/11/2026

Nội dung dưới đây giữ nguyên bản ngày 15/11. Thế giới V1 vẫn chạy được bằng `?v1`; nhiều module V1 (Wonderland, Công viên Kỳ Quan, nội thất công ty, kinh tế, xe…) được V2 dùng lại.


## Mục lục
1. [Đảo chính Master Dashboard + hệ thống chung](#phần-1) – quảng trường, 8 zone, sân khấu, bãi biển, Toà Giáo trình, Học viện QA, tháp Brand QA, khu nghỉ dưỡng và đảo nhỏ, lô đất, phòng trọ. Hệ thống chung: kinh tế, cửa hàng, xe, bot, laptop, nhạc, điện thoại, nạp tiền, âm thanh, phím tắt.
2. [Downtown · Phường Khởi Nghiệp · Đại công viên Hồ Ngọc](#phần-2) – mạng đường, 13 toà công ty (bên ngoài), cầu, công viên, bệnh viện, trạm cứu hoả, trường học, giao thông (đèn, xe buýt, cáp treo, taxi), người trên phố, Trung tâm Việc làm.
3. [Nội thất toà công ty + showroom](#phần-3) – sảnh, phỏng vấn, 9 phòng ban, 5 kiểu bố trí bàn, nhà ăn, phòng giám đốc, showroom, xe đại gia.
4. [Đồi Brand QC · Phố Núi](#phần-4) – địa hình, đường xoắn ốc, tháp Brand QC, nhà sàn bám vách, tháp cầu trời, phố ẩm thực, căn hộ Sky QC, biệt thự ven đầm.
5. [Khu Giải trí · Cao nguyên · Đảo Wonderland · Công viên Kỳ Quan · Biển](#phần-5) – sân bóng, concert, rạp, vòng quay, phố cổ, Thác Móng Ngựa, cáp treo dài, các trò cảm giác mạnh, du thuyền.
6. [Đảo Ngoại ngữ + bản đồ đất toàn thế giới](#phần-6) – campus ngoại ngữ, bảng 10 vùng đất, các tuyến nối, sơ đồ ASCII.

## Tổng quan nhanh: 10 vùng đất
| # | Vùng | x0 – x1 | z0 – z1 | Nối với |
|---|---|---|---|---|
| 1 | Đảo chính Master Dashboard | ≈ −89 … 89 (tâm 0,0, bán kính ≈ 74) | ≈ −89 … 89 | Downtown (cầu dây văng z = 0 + cáp treo), Wonderland (cáp treo dài), đảo nghỉ dưỡng (cầu gỗ), Đảo Ngoại ngữ (cầu vòm z = −16) |
| 2 | Đảo nhỏ nghỉ dưỡng (ISLET) | ≈ −105 … −57 | ≈ 67 … 115 | Cầu gỗ 3 m |
| 3 | Downtown | 136 – 262 | −62 – 62 | Đảo chính, Phường (liền đất), Khu Giải trí (cầu z = 0), Cao nguyên (cầu x = 178) |
| 4 | Phường Khởi Nghiệp | 136 – 262 | 56 – 480 | Downtown, Đồi Brand QC (cầu dốc z = 86) |
| 5 | Khu Giải trí | 274 – 394 | −60 – 60 | Cầu z = 0 |
| 6 | Cao nguyên Bình Phan | 88 – 332 | −342 – −100 | Cầu x = 178 |
| 7 | Đồi Brand QC + Phố Núi | 276 – 476 | 66 – 274 | Cầu z = 86 |
| 8 | Đảo QC Wonderland | −10 – 132 | 222 – 362 | Cáp treo dài từ đảo chính, cầu đá sang Kỳ Quan |
| 9 | Công viên Kỳ Quan | −270 – 363 | 372 – 1242 | Cầu đá x = 40 từ Wonderland |
| 10 | Đảo Ngoại ngữ | −360 – −160 | −120 – 100 | Cầu vòm z = −16 |

Chi tiết từng tuyến nối và sơ đồ ASCII ở phần 6.

## Những điểm cần biết khi thiết kế lại (phát hiện lúc đọc mã)
**Đất và quy hoạch:**
- Hộp đất Công viên Kỳ Quan (z từ 372) chồng lên Phường Khởi Nghiệp (tới z 480) ở x 136–262. Cần kiểm tra bờ thật.
- `LAND_CLAIMS.md` đăng ký mở rộng Phố Núi x 476–640, nhưng mã chưa có. Đảo chính trong sổ ghi ±115, mã thực tế là bán kính ≈ 74, tối đa ≈ 89.
- Đường ven Tây x = 146 và ven Đông x = 252 rộng 20 m, mép ngoài trùng mép đất, chỉ có vỉa hè phía công viên.
- Đường z = 290 / 380 / 470 chỉ nối nhau qua đường x = 199. Đầu x = 136 và x = 262 là đường cụt. Đường z = 470 không có vỉa hè phía Nam.
- Đảo Ngoại ngữ chỉ đi được bằng cầu vòm hoặc nhảy bản đồ. Không có taxi, xe buýt hay cáp treo.

**Toà nhà và nội thất:**
- Căn hộ Sky QC không có lối vào đi bộ. 20 tầng căn hộ chỉ là mặt tiền, chưa có nội thất.
- Đảo Ngoại ngữ: chỉ sảnh Toà Trung tâm đi vào được. English House, Hán Học Đường, phòng thi và thư viện là khối đặc.
- Biệt thự ven đầm: bàn ăn không có ghế. Hồ bơi và bến thuyền nằm ngoài phần đất được san phẳng. Mỗi người chỉ lưu được 1 biệt thự; mua căn khác thì ghi đè, không hoàn tiền.
- Showroom trên đồi: tấm tầng lửng dài gần bằng cả toà. 2 cột mái hiên đứng trùng tim đường ven biển x = 286.
- Toà Mobile First QA và DevOps Center có hai phòng ban trùng số tầng. Phòng Vận hành có một dòng dựng tấm nền màn hình không chạy (bị chú thích che).
- `world.html` còn hàm dựng nhà công cụ cũ (`buildTower`, `zoneProps`) nhưng không được gọi nữa.

**Hành vi:**
- Xe đại gia "sáng đi làm, chiều về" thực chất chạy vòng lặp cố định, không theo giờ trong ngày.
- Một số câu thoại và mô tả cũ còn nhắc "khu dân cư phía Đông" hay "khu Thương mại" ở chỗ đã đổi sang Phường Khởi Nghiệp.

**Chú thích lệch với mã:**
- Showroom ghi "11 xe, 5 mẫu" nhưng thực tế có 8 mẫu.
- Toà nhà ghi "8 kiểu" nhưng thực tế có 9 kiểu.
- Ngã giao có đèn ghi "6 ngã tư + 2 ngã ba" nhưng mã sinh 10 ngã giao.
- Xe buýt ghi 9 trạm nhưng thực tế có 8 trạm.
- Xe đạp ghi khoảng 23 km/h nhưng mã đặt 5 m/s (khoảng 18 km/h).

---

<a id="phần-1"></a>

## 01 · Đảo chính Master Dashboard và các hệ thống chung (hiện trạng theo mã nguồn)

> Tài liệu hiện trạng kiến trúc cho QC World, viết từ việc đọc mã, không sửa mã. Phạm vi: `world.html`, `js/island.js`, `js/screens.js`, `js/campus.js`, `js/brain.js`, `js/resort.js` và các hệ thống chung `js/life.js`, `js/bots.js`, `js/people.js`, `js/vehicles.js`, `js/cafe.js`, `js/multi.js`, `js/gadgets.js`, `js/topup.js`, `js/ambience.js`, `js/skyfx.js`.
> Những nơi do file ngoài phạm vi dựng (`city.js`, `downtown.js`, `ward.js`, `interior.js`, `showroom.js`, `transit.js`, `arena.js`, `highland.js`, `traffic.js`, `jobs.js`…) chỉ được ghi theo cách `world.html`/`life.js` tham chiếu tới, kèm chú thích "chưa rõ trong phạm vi".

### 0. Quy ước

- 1 ô = 1 m = 1 đơn vị toạ độ thế giới. Trục x Đông (+) – Tây (−); trục z **Nam (+) – Bắc (−)**; y là độ cao.
- Góc cực `a` (rad) dùng trong quy hoạch: a=0 là Đông, a=π/2 là Nam, a=π là Tây, a=−π/2 là Bắc. `atPolar(a,r)` cho x=cos(a)·r, z=sin(a)·r (world.html:236).
- Hướng nhìn h (rad): đi thẳng thì x += sin h, z += cos h. h=0 nhìn về +z (Nam); h=π nhìn về −z (Bắc).
- Mực nước biển `WATER_Y = −0,35` m. Nền Downtown/Phường/Khu Giải trí phẳng ở y=0,02 (world.html:466).
- Số liệu có dấu "~" là tính từ công thức trong mã (các giá trị làm tròn do tôi tính lại), không phải hằng số viết sẵn.
- "Chưa rõ" = mã trong phạm vi không cho biết (do file khác dựng hoặc do đặt ngẫu nhiên khi chạy).

### 1. Kiến trúc nạp và cấu trúc tổng thể

**world.html** (1588 dòng) là file duy nhất có HTML + module chính. Thứ tự:

1. Giao diện: thanh trên cùng (`#top`: nút M Bản đồ, N giờ, H hướng dẫn, trạng thái Dashboard, đếm easter egg), khung nhạc sân khấu `#music` (góc phải trên, 330 px), khung gợi ý phím `#hint`, bảng bản đồ, bảng hướng dẫn, toast, màn hình loading (world.html:103–195).
2. Cấu hình: `DASH='http://127.0.0.1:8765'` (Master Dashboard chạy local), mảng `ZONES` (8 khu công cụ), `CITY` (quy hoạch), hằng số địa hình (world.html:216–285).
3. Renderer three.js: chất lượng Thấp/Vừa/Cao (tự chọn theo GPU), hậu kỳ điện ảnh (bloom, tone mapping ACES, viền tối), bóng đổ theo mặt trời đi theo người chơi, nước (phản chiếu thật ở mức Cao), bầu trời `Sky`, sao đêm 2200 điểm (world.html:305–450).
4. Dựng thế giới nội tại của đảo chính: địa hình, nước, bọt sóng, va chạm, nhãn HTML, lối gỗ, đèn đường, 8 quảng trường zone, quảng trường + cổng trang chủ, sân khấu, cây dừa, cỏ, đá, phao, nhân vật NPC, easter egg, ngày/đêm, người chơi + camera, bản đồ, nhạc (world.html:451–1452).
5. Tạo đối tượng ngữ cảnh `W` (world.html:1559–1567) rồi `await import('./js/life.js')` và gọi `initLife(W)`: toàn bộ "thành phố" còn lại nạp từ `life.js`.
6. Sau khi `initLife` xong: chống nhấp nháy (z-fighting) cho vật liệu dán, đánh dấu vật nhỏ bỏ vẽ ở xa, biên dịch trước shader, vào vòng lặp `tick()` (world.html:1570–1585). Có `window.__qc` để kiểm thử từ console.

**Thứ tự `initLife`** (life.js:40–786): UI chung → ví/HUD → vật phẩm → quiz → `buildCity` (city.js: toà nhà đảo chính, chưa rõ trong phạm vi) → xe → `makePeople` → `interior` → `buildDowntown` → `makeScreens` → `makeBrain` → rác/thùng rác/bồn hoa → ghế ngồi → `buildWard` + jobs + nhà trọ → chat → thú cưng → đất/nhà → câu cá → thuyền/xe → VIP sân khấu → hồ sơ/túi đồ → PLACES → bots → các module: resort, campus, transit, arena, highland, island, hills, monument, mountaintown, foodstreet, luxury, jobcenter, funisland, themepark, sealife, streetlife, riverside, traffic, skyfx, cafe → nạp động `park.js`, `gadgets.js`, `langcenter.js`, `pedestrians.js` → gộp mesh tĩnh → bản đồ đường đi cho bot → chỗ xuất hiện (nhà chính) → `makeMulti`.

**Hệ va chạm / tương tác dùng chung** (world.html:545–585, 1245–1252): mảng `circles` (cột tròn), `boxes` (hộp), `SEGS` (đoạn thẳng), `DYN` (xe đang chạy), `plats` (sàn đi được: tròn, vòng, chữ nhật xoay), `INTER` (điểm bấm E: `{x,z,r,label,action,prio,when}`; chọn điểm gần nhất trong bán kính, trừ `prio`). Bán kính người chơi PR=0,35 m. Ra khỏi bờ thì đứng lại + báo "Mép nước", không bị kéo về. Vùng `regionAt`: `'open'` (Downtown, Phường, Khu Giải trí, cầu sau cổng x>52 với |z|<15,5, và các vùng EXTL) hoặc `'island'` (Đảo Master Dashboard, miễn phí).

---

### 2. ĐẢO CHÍNH MASTER DASHBOARD

#### 2.1 Đảo Master Dashboard – địa hình, bờ biển, nước (world.html:451–542, 1139–1141)

- **Vị trí và kích thước:** tâm (0,0). Bán kính đảo `edgeR(a)=74+2,6·sin(3a+0,7)+1,6·sin(5a+2,1)+0,9·sin(9a)+10·exp(−(Δ(a,2,3)/0,42)²)` (world.html:455). Nhỏ nhất ~69,2 m, lớn nhất ~88,8 m (phình ra ở bờ Tây Nam a≈2,3 để làm khu nghỉ dưỡng). Một vài giá trị: Đông ~77,1; Nam ~72,6; Tây ~71,1; Bắc ~75,9. Địa hình là một lưới phẳng 320×320 m (`TS=320`, 300 đoạn ở mức Vừa).
- **Cao độ nền:** y≈0,0–0,1 (cồn cát gợn ±0,05–0,075) trong đảo; từ r=e−9 xuống r=e dốc xuống y=−0,55; ngoài bờ đáy biển hạ dần tới −6,05 m. Mặt đất thật = `max(groundH, plats)`.
- **Bố trí và nội thất:** mặt đất phối cát + cỏ qua "mặt nạ cỏ" 1024² (1 px ≈ 0,31 m): cỏ mọc quanh 8 khu zone (bán kính 10), 9 vệt ngẫu nhiên ở r 12–28, quanh tháp Brand QA (r 16) và 14 vệt ở r 49–62. Sóng bọt trắng sát bờ (`foam`, 240 đoạn), nước biển 4000×4000 m ở y=−0,35 (Thấp/Vừa: nước PBR 2 lớp normal; Cao: `Water` phản chiếu thật). Cỏ 3D đung đưa: 9000 / 22000 / 45000 ngọn (Thấp/Vừa/Cao) trong ô 150×150 m quanh tâm, tránh đường và vật cản. 72 cây dừa ngẫu nhiên: 46 cây ven bờ (r = edgeR −13…−4,5), 10 cây ở r 12–27, 16 cây ở r 49–61 (đều tránh khu zone, quảng trường, sân khấu, đường, phân khu). 16 tảng đá (thủ tục, ~320 tam giác) ở bờ, 4 vỏ sò to (model `lambis_shell`).
- **Chức năng:** nền cho toàn bộ không gian "miễn phí" (học, tool, quiz, concert, ngắm biển).
- **Nhân vật:** xem 2.16 (NPC trên sàn nhảy), 2.18 (Tuấn Dev đi tuần) và mục 8 (bot cư dân).
- **Tương tác:** đi lại, không có E riêng ở địa hình. Phao/cột mốc nổi ngoài khơi: 5 phao tại (96,30), (−74,−70), (44,−98), (−102,22), (70,82) và 1 cột mốc xanh tại (14,−112), tất cả trôi nhấp nhô (world.html:985–993).
- **Kết nối:** cầu nối sang Downtown ở đầu đông (x từ ~52, đóng gate "Rời đảo" `CITY.gateX=52`), cầu gỗ tới đảo nhỏ ISLET ở Tây Nam, cầu cảng phía Bắc (do `city.js` dựng, chưa rõ trong phạm vi).

#### 2.2 Đường vành đai (world.html:235, 462; life.js:275)

- **Vị trí và kích thước:** vòng tròn tâm (0,0), bán kính giữa `ROAD.r=43`, rộng `ROAD.w=7` (r 39,5–46,5). Mặt đường/vạch do `city.js` và `traffic.js` dựng (chưa rõ trong phạm vi).
- **Bố trí:** 8 thùng rác đặt ở bán kính 48,5 m tại các góc a=i/8·2π+0,2: (47,5;9,6), (26,8;40,4), (−9,6;47,5), (−40,4;26,8), (−47,5;−9,6), (−26,8;−40,4), (9,6;−47,5), (40,4;−26,8).
- **Chức năng:** đường xe chạy vòng đảo, tuyến tuần tra của bảo vệ và chạy bộ, `onRoad()` làm xe nhanh hơn (ngoài đường hệ số 0,55).
- **Nhân vật:** Bảo vệ Hùng (đi tuần ở bán kính 48,7, 24 điểm), Minh chạy bộ (bán kính 47,4, 36 điểm, chạy 3,4 m/s).
- **Kết nối:** các phân khu 2.3; trục cầu về Downtown theo z=0.

#### 2.3 Phân khu quy hoạch (CITY.sectors – world.html:239–246)

Chỉ là "vùng dành riêng" (không trồng dừa ngẫu nhiên, `inSector`), toà nhà thật do `city.js` dựng (chưa rõ trong phạm vi). Mọi phân khu cách tâm r0–r1 m:

| Tên | Góc a (rad) | Hướng | r0–r1 (m) |
|---|---|---|---|
| Khu dân cư | −0,5 → 0,5 | Đông | 47–66 |
| Khu dân cư 2 | 0,62 → 1,12 | Đông Nam | 47–66 |
| Brand QA | 1,18 → 1,98 | Nam | 47–72 |
| Thương mại | 2,62 → 3,66 | Tây (qua π) | 47–66 |
| Thương mại 2 | 3,84 → 4,38 | Tây Bắc | 47–66 |
| Bến cảng | 4,45 → 4,98 | Bắc | 47–110 |

Chú thích mã (world.html:247–248): "đất ở / quán / chợ / showroom / địa chính đã chuyển sang Phường Khởi Nghiệp (thế giới mở, qua cầu); đảo MD là vùng miễn phí". Điểm đặt toà do `CITY.places` (world.html:253–254): **tháp Brand QA** `atPolar(π/2, 61)` = (0, 61); **Học viện QA** `atPolar(π/2−0,3, 55)` ≈ (16,3; 52,5); **nhà thuyền** `atPolar(−π/2−0,13, 62)` ≈ (−8,0; −61,5). Chợ QC, showroom, văn phòng địa chính nằm ở Phường (xem 2.30).

#### 2.4 Quảng trường trung tâm + Cổng Trang chủ Dashboard (world.html:785–805)

- **Vị trí và kích thước:** tâm (0,0), mặt gỗ tròn bán kính 7,5 m, cao 0,16 m (đĩa 7,4–7,6; viền gỗ tối). Bệ đá giữa bán kính 2,4–2,6, cao thêm 0,3, mặt đứng 0,45 m (`plats` r=2,45 h=0,45).
- **Bố trí và nội thất:** cổng vòng tròn kim loại (torus R=2,1, ống 0,17) tâm y=2,75 trên bệ; vành xanh phát sáng (torus 0,05) và đĩa năng lượng xoáy xanh–tím (shader, bán kính 1,95) ở y=2,75; 2 trụ kim loại ở x=±1,85 cao 1,2; 6 đèn đường quanh bán kính 6,6 (a=i/6·2π+0,26): (6,4;1,7), (1,7;6,4), (−4,7;4,7), (−6,4;−1,7), (−1,7;−6,4), (4,7;−4,7), mỗi đèn kèm 1 điểm sáng ban đêm (cường độ 8, tầm 16 m). Nhãn "🏠 Trang chủ Dashboard — Đi qua cổng · bấm E" ở y=5,6.
- **Chức năng:** điểm xuất phát chung; cửa mở "Trang chủ Master Dashboard".
- **Nhân vật:** người chơi xuất hiện tại (0; 0,16; 9) nhìn về Bắc (−z). Mèo Miu (xem 10.1) quanh ghế đá `city.benches[0]` (vị trí chưa rõ).
- **Tương tác:** `E` tại (0,0) bán kính 2,2: "🏠 Mở Trang chủ Dashboard" → `openTool` → `HOOK.openScreen` (screens.js:312–318) → không phải màn hình đảo nên gọi `gadgets.laptop.openMD('/')`: **chỉ mở trong app Laptop (phím L), có kiểm tra thư mục MD**; nếu chưa có laptop thì toast "Master Dashboard chỉ mở trong Laptop (phím L)". Bản đồ: "Quảng trường trung tâm" bay tới (0,5).
- **Kết nối:** lối gỗ rộng 2,2 m từ (0;−7,3) lên sân khấu (2.15); 8 lối gỗ rộng 1,7 m ra 8 quảng trường zone (2.5–2.12).

#### 2.5–2.12 Tám quảng trường công cụ (ZONES – world.html:219–228, 738–781)

**Kiến trúc chung:** mỗi khu là 1 quảng trường tròn trang trí (không còn nhà công cụ: `buildHouse`/`buildTower`/`zoneProps` còn trong mã nhưng không gọi cho ZONES, world.html:736). Đĩa gạch be bán kính 3,4–3,55 (cao 0,14) quay mặt vào tâm đảo (`rot=atan2(−x,−z)`), vành xanh phát sáng bán kính 2,25–2,45 (nhấp nháy), 12 bụi cây viền (xanh, xen hoa 4 màu) ở bán kính 3,15, 2 đuốc tiki ở (±2,6; 2,7) toạ độ cục bộ phía hướng về tâm đảo (ngọn lửa phát sáng). Vật cản tròn bán kính 2,1 tại tâm. Nhãn lớn "icon + tên + phụ đề" ở y=5,2 (tháp: 7), hiện từ xa tới 90 m. Điểm tới (tx,tz) = tâm dịch 4,2 m về phía tâm đảo. Lối gỗ rộng 1,7 m chạy từ bán kính 7,3 tới tx,tz, kèm 1 đèn đường. Cỏ mọc bao quanh. Mỗi khu có 1 **màn hình đứng** (xem 2.13) cách tâm khu ~6,9 m.
**Giờ đêm:** biển gỗ/ring/đuốc sáng hơn (`signMat` emissive).
**Nhân vật chung:** không có NPC đứng cố định; "Tuấn Dev" (robot) đi tuần qua cả 8 khu (xem 2.18).

| # | Khu (id) | Tâm (x,z) | Cách tâm đảo | Điểm tới (tx,tz) | Lối gỗ bắt đầu → kết thúc | Màu | URL Dashboard | Màn hình (kênh) |
|---|---|---|---|---|---|---|---|---|
| 2.5 | 📚 Thư viện (wiki) – "Wiki · Tài liệu dự án" | (−27, −4) | 27,3 | (−22,85; −3,38) | (−7,22; −1,07) → ~(−22,3; −3,3) | 0x3f63d8 | `/#/m/wiki` | 📘 Kiến thức QA |
| 2.6 | 📋 Bảng nhiệm vụ (plan) – "Plan · Kanban · Lịch" | (−18, −19) | 26,2 | (−15,11; −15,95) | (−5,02; −5,30) → … | 0xe08a1e | `/#/m/plan` | 📈 Chứng khoán |
| 2.7 | ⚙️ Xưởng API (api) – "API Client · Chuỗi chạy" | (18, −19) | 26,2 | (15,11; −15,95) | (5,02; −5,30) → … | 0x1f9c8c | `/#/m/apiclient` | 🔌 API |
| 2.8 | 🤖 Trạm Automation (auto) – "JMeter · Test tự động" | (27, −4) | 27,3 | (22,85; −3,38) | (7,22; −1,07) → … | 0xc93a3f | `/automation` | 🤖 Automation & Hiệu năng |
| 2.9 | 🗄️ Hầm Database (db) – "SQL Editor · Custom Query" | (22, 15) | 26,6 | (18,53; 12,63) | (6,03; 4,11) → … | 0x7448d8 | `/#/m/db` | 🗄️ Database |
| 2.10 | 🧰 Tiệm đồ nghề QC (qc) – "JWT · JSON · QR · SĐT test" | (−22, 15) | 26,6 | (−18,53; 12,63) | (−6,03; 4,11) → … | 0x2e8f47 | `/#/m/qc` | ✅ QC thực chiến |
| 2.11 | ✉️ Bưu điện Ghi chú (notes) – "Snippet · Báo cáo ngày" | (−11, 27) | 29,2 | (−9,42; 23,11) | (−2,75; 6,76) → … | 0xd05f28 | `/#/m/notes` | 📰 Tin báo hôm nay |
| 2.12 | 🔗 Trạm Quick Link (links) – "Link DEV / STG / UAT" | (11, 27) | 29,2 | (9,42; 23,11) | (2,75; 6,76) → … | 0x2580c8 | `/#/m/links` | 💻 Công nghệ mới |

**Điểm khác biệt riêng từng quảng trường** (theo `kind` – world.html:742–764):

- **2.5 Thư viện (`library`):** 6 cột trắng (bán kính 1,7, cao 2,6) đỡ mái tròn trắng 2,1 m ở y=2,82 và nón xanh cao 1,2 trên đỉnh; quả cầu vàng phát sáng ở y=4,2; 3 cuốn sách xếp chồng giữa.
- **2.6 Bảng nhiệm vụ (`board`):** vòng cung xanh lá (nửa torus 1,6) gắn 14 quả cầu hoa (hồng, vàng, trắng, cam) + 9 cụm hoa 3 màu bán kính 1,1.
- **2.7 Xưởng API (`workshop`):** trụ trắng cao 1 m, trên là 2 vành bánh răng (torus 0,9 và 0,6 vuông góc, 8 răng mỗi vành) màu khu, **quay** quanh trục y (1,2 rad/s) ở y=2,2.
- **2.8 Trạm Automation (`tower`):** 3 bậc đế trắng, tháp mảnh đen cao 4,4 (4 mặt), 4 vòng phát sáng màu đỏ (cường độ 1,6) xếp dọc, bát diện phát sáng ở y=5,65. Nhãn cao 7 m.
- **2.9 Hầm Database (`vault`):** bệ trắng bát giác + khối bát diện phát sáng tím cao 1,5× ở y=2,2, **quay** chậm (0,4 rad/s).
- **2.10–2.11 Tiệm đồ nghề QC / Bưu điện (`shop`/`post`):** đài phun nước: đĩa trắng bán kính 2,2, mặt nước xanh 2,0, trụ + chậu nước 2 tầng, cầu màu khu ở trên (đỉnh y=2,15).
- **2.12 Trạm Quick Link (`signpost`, rơi vào nhánh mặc định):** 3 cây dừa nhỏ (cao 2,6/2,1/1,8) + 4 tảng đá.
- **Tương tác:** quảng trường không có điểm E riêng (chỉ ring nhấp nháy); điểm E nằm ở màn hình đứng (2.13). Bản đồ M có mục bay tới từng khu (đứng ở điểm tới lùi 0,3 m, nhìn vào tâm).
- **Kết nối:** lối gỗ về trục tâm; không có đường nhựa riêng; vành đai r=43 cắt ngang bên ngoài (zone nằm trong vành đai, r 26–29).

#### 2.13 Màn hình ốc đảo – 8 màn hình zone + 1 flycam (js/screens.js)

- **Vị trí và kích thước:** mỗi màn hình là 1 giá đứng, màn rộng 3,2 m × cao 2,0 m, mép dưới màn ở y=1,0 (khung 3,4×2,2×0,12), chân đế 0,5 m. Đặt trong hệ toạ độ của zone tại (lx=−4,3; lz=5,4), xoay thêm +0,4 rad so với hướng zone. Vị trí thế giới (x,z) và hướng (rad): Kiến thức QA (−22,29; 1,04; 1,82), Chứng khoán (−17,41; −12,12; 1,16), API (11,16; −18,04; −0,36), Automation (21,03; −7,46; −1,02), Database (19,96; 8,41; −1,77), QC thực chiến (−15,12; 15,51; 2,57), Tin báo (−4,98; 23,62; 3,15), Công nghệ (12,94; 20,38; −2,35); **flycam** ở (4,9; 3,4) quay hướng (−0,72 rad) – ngay cạnh quảng trường trung tâm. Vật cản tròn bán kính 0,55. Vòng sáng trên đất ở 2,1 m phía trước mỗi màn.
- **Chức năng:** thay cho "nhà công cụ" cũ; không còn hiển thị Master Dashboard trong màn hình (MD chỉ mở trong laptop). 9 màn gồm 3 loại (screens.js:35–47):
  - **Web (3):** 📰 Tin báo hôm nay (Google Tin tức, ngày), 📈 Chứng khoán (tìm "VN-Index"), 💻 Công nghệ mới (tin công nghệ/AI trong tuần) – bấm E → trang Google nhúng iframe qua CSS3D ngay trên mặt màn; mất mạng hiện "No internet". Nút "Trang đầu", "Mở tab riêng".
  - **Học (5):** 📘 Kiến thức QA (chủ đề istqb, design; khoá test-design, bdd, ai-for-qa), 🗄️ Database (db; sql), 🔌 API (api; api, json-regex), ✅ QC thực chiến (scenario, agile, security, mobile; mobile-manual, security-basics), 🤖 Automation & Hiệu năng (automation, performance; 9 khoá: computer-basics, programming-basics, git, playwright, selenium, appium, k6, jmeter, cicd). Câu hỏi (đã đánh sẵn đáp án + giải thích) xen bài giảng, **tự lướt mỗi 30 s**, tiến độ lưu `localStorage qcworld-screens`. Dữ liệu `data/questions.json`, `data/courses.json`.
  - **Flycam (1):** camera bay vòng quanh thành phố theo đường cong 8 điểm (cao 60/80 m), render 320×180 chia lát, chỉ khi người chơi đứng ≤34 m và đang nhìn; dừng nếu game dưới ~28 FPS.
- **Nhân vật:** không.
- **Tương tác:** `E` tại điểm cách màn 2,1 m (bán kính 2,3) "🖥️ Xem … trên màn hình": camera tiến sát, khoá điều khiển, thanh nút dưới đáy ("◀ Trước / ⏸ Dừng tự lướt / Sau ▶", "Rời màn hình (Esc)"); lăn chuột / bấm vào màn để lướt thẻ; flycam có nút "🚁 Bay theo flycam". Không có thưởng tiền.
- **Kết nối:** `HOOK.openScreen` là điểm vào chung cho "mở công cụ Dashboard": cổng trang chủ, QA Brain tab "Tự test" cũng dùng `openTool` → laptop.

#### 2.14 Lối gỗ (boardwalk) trên đảo (world.html:619–625)

- **Vị trí và kích thước:** mỗi lối rộng 1,7 m (lối lên sân khấu 2,2 m), dày 0,14 m; viền gỗ tối 2 bên; sàn đi được `addPlat`.
- **Bố trí:** 8 lối từ quảng trường zone về hướng tâm (bắt đầu ở bán kính 7,3 m quanh quảng trường trung tâm); 1 lối từ (0;−7,3) tới (0;−18,8) rộng 2,2 lên sân khấu; resort có thêm lối gỗ trước dãy nhà (2.34).
- **Chức năng:** đường đi chính trên cát; âm bước chân gỗ.
- **Kết nối:** nối quảng trường trung tâm với 8 zone và với sân khấu.

#### 2.15 Sân khấu QC Live (world.html:807–883)

- **Vị trí và kích thước:** sàn sân khấu hộp 20×9 m (x −10…10, z −37…−28), cao 1,2 m (mặt sàn đi được cao 1,2 m nhờ `addPlat(0;−32,4; nửa rộng 10; nửa sâu 4,4; h 1,2)` trong life.js:662: x −10…10, z −36,8…−28). Vạch vàng phát sáng ở mép trước (z=−28, y=1,22). Tường nền sau 20×11×0,6 m (z≈−37,3). Hộp va chạm lớn x −12,6…12,6, z −37,8…−28 (VIP vô hiệu hoá hộp này, xem tương tác); life.js:661 thêm 3 hộp chặn cố định: tường sau (x −10,2…10,2, z −38…−36,6) và hai loa sub (x ±10,1…12,6, z −31…−29).
- **Bố trí và nội thất:** màn hình LED lớn 15×8,44 m ở (0; 6,6; −36,86) (khung đen 15,6×9×0,15), vẽ bằng canvas 1024×576 (512×288 ở mức Thấp): hình thu nhỏ video YouTube + 48 cột equalizer nhảy theo nhạc, hoặc chữ "QC WORLD · LIVE STAGE" khi chưa phát; 2 trụ giàn kim loại (mỗi bên 4 trụ ở x=±9,7, z≈−28,4, cao 12 m, chéo giằng) + dầm ngang giàn y=11,75 dài 19,9 m; **5 đèn moving head** ở y=11,35, x=−8,−4,0,4,8, z=−28,4, mỗi đèn 1 chùm sáng hình nón (đổi màu, lắc theo thời gian, sáng mạnh khi có nhạc); **2 đèn spot** ở x=±6, y=11; **loa line-array** 2 bên (5 hộp/bên ở x=±11,2, y 10,6→8,5, z=−28,6) + 2 loa sub (2×1,6×1,6 tại x=±11,4, z=−30) co giãn theo nhịp nhạc. **2 bậc lên** giữa mép trước: bậc 1 (z=−27,75, rộng 4,4, cao 0,85) và bậc 2 (z=−27,25, cao 0,5) – hông bậc có hộp chặn.
- **Chức năng:** sân khấu biểu diễn + chiếu màn hình lớn theo nhạc YouTube người chơi chọn; hiệu ứng đèn cũng sáng nhẹ ban đêm (`.25+night·.35`).
- **Nhân vật:** 3 NPC nhảy quanh sàn (xem 2.16 Sàn nhảy) và Vy, Đạt (fan cứng, mục 8).
- **Tương tác:** không bấm E trực tiếp để lên sân khấu; phải có **Vé concert VIP** (150 💰/24 h): khi `buffOn('vip')` hộp va chạm sân khấu bị vô hiệu (x0=x1=1e9) để leo lên bậc, và có điểm `E` tại (12,6; −23,2) bán kính 1,2 "🎆 Bắn pháo hoa (VIP)", hồi 15 s.
- **Kết nối:** lối gỗ rộng 2,2 từ quảng trường (z −7,3 → −18,8) tới sàn nhảy.

#### 2.16 Sàn nhảy LED (trước sân khấu – world.html:847–871)

- **Vị trí và kích thước:** lưới 4 hàng × 7 cột ô LED 1,94 m, tâm ô tại x=−6…6 (cách 2 m), z=−26…−20; phủ x −6,97…6,97, z −26,97…−19,03; sàn đi được x −7…7, z −27…−19 cao 0,1. Vùng nhận "nhảy múa" `onDanceFloor`: x −7,1…7,1, z −27,1…−18,9.
- **Bố trí và nội thất:** 28 ô gộp thành 1 mesh, 5 màu xen kẽ (tím 0x8e5bd1, xanh ngọc 0x2bb3a6, xanh lá 0x47b25b, vàng 0xf2c230, đỏ 0xe5484d), mỗi ô nháy theo nhạc trong shader; ban đêm sáng nhẹ.
- **Chức năng:** đứng yên trên sàn khi có nhạc → nhân vật tự nhảy; nhảy ≥15 s → easter egg "Vũ công QC".
- **Nhân vật:** Linh Tester (Michelle) đứng/nhảy samba tại (−3,8; −24,2), Bug Hunter (Soldier, pose nhảy thủ tục) tại (2,6; −22,6), QC Bot (Robot) tại (9,6; −27). Đều là NPC cố định (vật cản bán kính 0,35–0,4), chỉ nhảy khi có nhạc; QC Bot vẫy tay nếu người chơi trong 3,2 m. Vy tại (−5,5; −21), Đạt tại (5,5; −20,5) và điểm thứ 3 (−1; −25,6) là chỗ nhảy cho "fan" (bot).
- **Tương tác:** phím `F` bật/tắt nhảy múa; di chuyển thì tắt.
- **Kết nối:** lối gỗ từ quảng trường.

#### 2.17 Bàn DJ (world.html:873–882)

- **Vị trí và kích thước:** tâm (11,5; −25,5), xoay −0,5 rad; bàn đen 2,4×1,05×1,1 m, vật cản tròn bán kính 1,3.
- **Bố trí và nội thất:** dải sáng đỏ trên mặt bàn, 2 đĩa than quay khi có nhạc, boombox model thật (`boombox.gltf`) giữa bàn. Nhãn "🎧 Bàn DJ — Bấm E để chọn nhạc" ở y=2,7.
- **Chức năng:** nơi chọn nhạc YouTube cho sân khấu (mở khung nhạc bên phải: dán link YouTube, "Phát ngay"/"Hàng chờ", âm lượng, bài tiếp).
- **Nhân vật:** không.
- **Tương tác:** `E` tại (10,5; −23,8), bán kính 1,5 → `openMusic()`; không cần vé. Bản đồ: "Bàn DJ" bay tới (10;−23), nhìn về bàn.
- **Kết nối:** cạnh sân khấu phía Đông.

#### 2.18 Tuấn Dev (NPC đi tuần – world.html:1068–1071, 1479–1485)

- **Vị trí và kích thước:** robot cao 1,5 m. Tuyến đi: với từng khu (theo thứ tự wiki, plan, api, auto, db, qc, notes, links) 3 điểm: (tx/d·8,2; tz/d·8,2) → (tx·(1−1,6/d); tz·(1−1,6/d)) → quay lại điểm đầu. Tốc độ 1,35 m/s; dừng 3,5 s ở điểm thứ 3 mỗi cặp (ngẫu nhiên chào "agree" hoặc đứng). Nếu người chơi trong 1,2 m thì đứng yên.
- **Chức năng:** làm đảo đỡ vắng. Không thoại.

#### 2.19 Bãi biển Đông Nam: dù + ghế + bàn picnic (world.html:937, 995–1002)

- **Vị trí và kích thước:** `BEACH` tại góc a=0,95, r=edgeR−7,5 ≈ (38,98; 54,51). Vùng dừa không mọc quanh bán kính 7.
- **Bố trí và nội thất:** 2 dù biển: đỏ (0xd23c3c) tại (38,98; 54,51) và xanh (0x2f6fd0) tại (42,48; 57,51); mỗi dù có cột trắng cao 2,6 m, nón sọc đường kính 3,4 m ở y≈2,5, 2 ghế gỗ + lưng ghế (trang trí, **không ngồi được**). Bàn picnic model thật tại (41,98; 50,51) xoay 0,6 rad.
- **Chức năng:** góc ngắm biển; bàn picnic ngồi được (4 chỗ).
- **Nhân vật:** không cố định.
- **Tương tác:** `E`/`C` ngồi bàn picnic (life.js:387–390, 4 chỗ: 2 băng × 2). Còn 2 bàn picnic khác tại (24;−30,5) xoay −0,3 và (8;8,6) xoay 0.
- **Kết nối:** bờ Đông Nam (ngoài vành đai); rộng quanh a=0,95.

#### 2.20 Chai thư (easter egg – world.html:935–936, 1083–1090)

- **Vị trí:** `BOTTLE` ở a=2,78, r=edgeR−5,5 ≈ (−66,99; 25,34), trôi nhẹ lên xuống.
- **Bố trí:** chai thuỷ tinh xanh trong suốt có nút gỗ + cuộn giấy.
- **Tương tác:** `E` bán kính 1,4 "🍾 Nhặt chai thư" → egg 1/3, toast một câu đùa QC ngẫu nhiên trong 5 câu (ví dụ "Bug không tự biến mất…"), hiệu ứng hạt.
- **Easter egg còn lại:** gõ "binhphan" (pháo hoa), nhảy 15 s trên sàn LED khi có nhạc. Đủ 3 → chúc mừng + pháo hoa.

#### 2.21 Chòi lá nghỉ chân (js/island.js:85–107)

- **Số lượng và vị trí:** 6 chòi, đặt ngẫu nhiên trên bãi (cách bờ 10–16 m, `findSpot`) với hạt giống cố định (90210) nên mỗi lần chạy giống nhau, nhưng toạ độ phụ thuộc vật cản khác → **chưa tính ra**. Quay mặt ra biển. Tránh: cầu (|z|<10, x>38), khu nghỉ dưỡng, bến cảng, quán nước, đường, sàn gỗ.
- **Kích thước:** sàn 4×4 (3,6+0,4), cao 0,32; cột tre 4 góc cao 2,75; mái lá 4 mái (nón vuông bán kính 3,5 cao 1,9) đỉnh y≈4,7.
- **Nội thất:** bàn tròn bán kính 0,55 ở (0;−0,55 cục bộ); 2 băng ghế 1,1 m ở x=±0,95; võng vải màu ngẫu nhiên giữa 2 cột phía biển (z=+S/2).
- **Tương tác:** 2 chỗ ngồi ở băng ghế ("🛖 Ngồi nghỉ trong chòi lá (E · C)") + 1 chỗ nằm võng ("🛖 Nằm võng đung đưa", nằm ngửa). Không thưởng.

#### 2.22 Chòi cứu hộ (island.js:110–130)

- **Số lượng:** 2, đặt ngẫu nhiên gần bờ (cách bờ 6,5–11 m) quay ra biển.
- **Kích thước:** sàn 2,3×2,3 ở cao 2,6 m, 4 chân trắng cao 4,2; lan can 3 mặt (đỏ), mái đỏ 2,5×2,5 ở y≈4,25 + cột cờ đỏ; phao tròn + biển vàng; **cầu thang 6 bậc phía sau** (rộng 0,9, mỗi bậc cao 0,43) leo lên được, lan can nhà có vật cản nên không đi xuyên.
- **Tương tác:** leo lên ngắm biển; không E.

#### 2.23 Thuyền thúng (island.js:133–139)

- **Số lượng:** 6, đặt gần mép nước (cách bờ 4,2–5,6 m), xoay ngẫu nhiên.
- **Kích thước:** vỏ thúng bán cầu bán kính 1,05, dẹp, tre đan; mái chèo; nghiêng nhẹ.
- **Tương tác:** `E`/`C` "🛶 Ngồi vào thuyền thúng" – chỉ ngồi, không bơi/di chuyển.

#### 2.24 Dù + ghế tắm nắng (island.js:142–152)

- **Số lượng:** 9 bộ, ngẫu nhiên trên cát (cách bờ 5,5–9,5 m), hướng ra biển.
- **Kích thước:** dù nón đường kính 3 m ở y≈2,4 (sọc đỏ–trắng, xanh–trắng, cam–trắng), 2 ghế tắm nắng trắng (0,62×1,5) ở x=±0,85, khăn trải cát.
- **Tương tác:** 2 chỗ nằm ghế (`E`/`C`, "⛱️ Nằm ghế tắm nắng").

#### 2.25 Ghềnh đá, rặng dừa, cua, hải âu (island.js:155–212)

- **Ghềnh đá:** 4 cụm × 9 tảng (tỷ lệ 0,7–2,5) ở rìa bờ (cách bờ 3–7 m), có vật cản; không ở khu nghỉ dưỡng/bến.
- **Rặng dừa:** 34 rặng × 5–9 cây (mục tiêu tối đa ~240 cây, đầu file ghi "~110 cây" thực đặt; số thật phụ thuộc chỗ trống) cách bờ 4,5–14,5 m, vẽ theo lô (InstancedMesh) và đung đưa theo gió bằng shader; mỗi cây có vật cản; mỗi cây tới gần ≤1,9 m có điểm `E` rung dừa.
- **Cua:** 26 con, bò **ngang** trên cát (cách bờ 3,8–8 m), thấy người cách <3,2 m thì chạy trốn, <1,2 m thì chui xuống cát 8–18 s rồi xuất hiện chỗ khác.
- **Hải âu:** 14 con bay vòng cao 11–27 m, bán kính 40–85 m, vỗ cánh bằng shader.

#### 2.26 Mini-game bãi biển: rung dừa, nhặt vỏ sò, đắp lâu đài cát (island.js:253–313)

- **Rung dừa:** `E` (bán kính 1,9) "Rung cây dừa cho rơi trái": 1 trái rơi (hồi 40 s/cây, có trọng lực + nảy), nằm lại 75 s; `E` nhặt "🥥 uống nước dừa": **buff `energy` +6 phút** (chạy nhanh +40%), tăng bộ đếm `coconuts`.
- **Vỏ sò:** 28 vỏ 5 màu rải trên bãi; `E` nhặt; đủ **10 vỏ → +50 💰**, vỏ mới trôi vào sau 120 s.
- **Lâu đài cát:** 2 chỗ (có xô xanh + xẻng vàng), `E` "🏰 Đắp lâu đài cát": mọc trong 5 s, đứng 3 phút rồi sóng xoá; không có thưởng tiền (đếm `castles`).
- **Âm thanh:** xem mục 13.

#### 2.27 Sóng vỗ bờ quanh đảo (island.js:37–72)

- 2 vòng shader: quanh đảo chính (900 phân đoạn, từ −6,5 đến +3,5 m quanh mép) và quanh đảo nghỉ dưỡng (360 phân đoạn): mép bọt trắng tràn lên rồi rút, vệt cát ướt, 2 lớp sóng bạc đầu ngoài khơi.

#### 2.28 Toà Giáo trình – ngoại thất (campus.js:22–40)

- **Vị trí và kích thước:** `TW={x:−58, z:0, w:16, d:22, floors:7}`: thân toà x −66…−50, z −11…11, cao 7×3,6=25,2 m (thân kính 0x2b5f8a) trên bệ đá 22×28 m (x −69…−47, z −14…14, dày 0,5). Mặt tiền quay +x (vào tâm đảo). Hộp va chạm x −66,3…−49,7, z −11,3…11,3.
- **Bố trí:** mỗi 3,6 m có gờ trắng tầng; 5×2 cột khung ở hai mặt dài; mái 1,2 m; **bảng "📚 TOÀ GIÁO TRÌNH" phát sáng** trên đỉnh hai mặt; sảnh kính + mái che lối vào ở x≈−50…−47 (kính cao 3,2 m, mái 3×6,4 m, 2 cột); vòng vàng nhấp nháy tại cửa.
- **Chức năng:** trường học miễn phí 17 khoá · 6 tầng lớp học.
- **Nhân vật:** xem 2.29–2.31.
- **Tương tác:** `E` tại cửa (−47,7; 0) bán kính 2 "📚 Vào Toà Giáo trình" → vào bên trong (cảnh riêng). Nhãn tên cao tới 160 m. Bản đồ: bay tới (−42,7; 0).
- **Kết nối:** cửa +x nối đảo; bên trong có thang máy 7 tầng.

#### 2.29 Toà Giáo trình – Sảnh tầng 0 (thư viện + danh mục) (campus.js:150–167)

- **Cảnh trong nhà:** mỗi tầng/phòng là 1 cảnh riêng (`CS`), sàn 36×24 m (x −18…18, z −12…12, `RW=18, RD=12`), trần cao 3,6 m, sàn y=0,1; tường đặc ở phía z=−12, ba mặt còn lại là dải cửa sổ in "cảnh trời biển" (có đèn trần lát ô). Cửa ra tại (0; 10,6). Người chơi xuất hiện (0; 9,6) nhìn Bắc khi vào sảnh.
- **Bố trí và nội thất:** quầy lễ tân trắng 5×1,1×1 ở (0; 4) với dải xanh phát sáng; bảng "SƠ ĐỒ KHOÁ HỌC" 6×4 m ở (−11; z=−11,85) liệt kê các khoá theo tầng (đánh dấu ✓ nếu có chứng chỉ); **4 giá sách** cao 2,2 m (3,6 m dài) ở x=−17,4, z=−6,−2,2,6 + 2 giá ở z=−11,4, x=9, 13; **4 bàn đọc** 2,4×1,1 ở (−10,0), (−10,5), (8,2), (8,7), mỗi bàn 4 ghế (2 phía); sofa 3,2 m ở (12; 10,3) quay π (3 chỗ "🛋️ Ngồi đọc sách") trên thảm 4×2,6 tại (12;9); 4 chậu cây ở góc: (−17;10,8), (17;10,8), (6;−10,8), (−6;−10,8).
- **Chức năng:** thư viện + danh mục khoá học.
- **Nhân vật:** 1 **Thủ thư** (áo xanh lá dài tay) đứng sau quầy tại (0; 2,9); các **Học viên** ngồi bàn đọc (xác suất 40% mỗi ghế phía +z, gõ máy) và 1 học viên **đi dạo** theo vòng (4;8)→(4;−4)→(−6;−4)→(−6;8) tốc độ 1,2 m/s. Tên hiển thị dạng "tên · vai". Không có lời thoại.
- **Tương tác:** `E` tại (−11; −9,8) bán kính 2,2: "📚 Danh mục khoá học" mở lưới khoá theo tầng → chọn khoá để học; `E` tại (0; −10,3) thang máy (cùng chỗ mọi tầng toà) chọn tầng; `E`/`C` ngồi ghế/sofa; `E` cửa ra.
- **Kết nối:** thang máy (0; −10,3) tới tầng 1–6; cửa (0; 10,6) ra ngoài (vị trí ra: x=−46,1; z=0).

#### 2.30 Toà Giáo trình – Tầng 1–6 (tầng lớp học) (campus.js:168–180, 114–145)

- **Cảnh:** cùng khung 36×24 m. Dữ liệu từ `data/courses.json` (17 khoá · 128 bài theo chú thích mã; tên tầng/khoá/phòng P.101…P.603 nằm trong file dữ liệu, chưa rõ trong phạm vi). Mỗi tầng tối đa 3 phòng.
- **Bố trí 3 phòng/tầng (toạ độ cảnh):**
  - Phòng 1: x −17,8…−2,4, z −11,8…−2 (15,4×9,8), học viên nhìn −z (màn chiếu ở tường sau z≈−11,7). Cửa vào ở (−3,2; −1,1).
  - Phòng 2: x 2,4…17,8, z −11,8…−2 (15,4×9,8), cùng kiểu; cửa vào ở (17; −1,1).
  - Phòng 3: x 4…17,8, z 2,6…11,8 (13,8×9,2), học viên nhìn +x (màn ở tường x≈17,66); cửa tại (3,1; 3,4).
  - Mỗi phòng: màn chiếu 4,6×2,6 m tự chạy slide của khoá (đổi slide mỗi 9 s, tới hết bài thì sang bài kế); bảng tên phòng "P.xxx · tên khoá · cấp độ · giờ · số bài"; bàn giáo viên 1,6×0,75 (phòng ngang); **12 bàn × 2 ghế = 24 chỗ ngồi** (tối đa 7 hoặc 6 học viên bot ngồi/gõ máy, xác suất 42% mỗi ghế, còn lại ghế trống cho người chơi).
  - Khu tự học (2 bàn đôi) ở (−13; 6) và (−8; 6) mỗi bàn 4 ghế; bảng tin (3×2 m) ở (−10,5; 11,75) với giấy nhớ ("Workshop Playwright", "Hackathon QA 🏆"…); máy nước (−17,2; 10); 6 tủ locker ở x=−3,5−i·0,62, z=11,6; 3 chậu cây (−17;−1,2), (17;1,2), (3;10,8).
- **Nhân vật:** mỗi phòng 1 **Giảng viên** (áo trắng dài tay) đứng giảng: phòng ngang tại (cx+3; z0+1,4), phòng dọc tại (x1−1,4; cz−3). Tên lấy vòng trong 6 tên: Thầy Bình Phan, Cô Bình Vip Pro, Thầy Bình Internship, Anh trai ốp pồ, Anh trai say Salary, Cô Lan ISTQB (kèm hậu tố "· GV"). Khi bạn ở trong 11 m, giảng viên nói bong bóng "📢 <tiêu đề slide>" (6 s, theo slide đang chiếu). Học viên bot: ngồi gõ hoặc ngồi nghe; 1 học viên đi dạo (−10,5; 3,4)→(0;0)→(3;−0,6)→(−14;−0,6).
- **Tương tác:** `E` tại cửa phòng "📖 P.xxx · tên khoá – xem bài học" mở modal bài học; **ngồi vào ghế trống** ("🎓 Ngồi học … (E · C)") cũng tự mở bài học sau 0,35 s; mở bài: danh sách bài → từng slide (◀ Trước / Tiếp ▶) → "✅ Hoàn thành bài (+10 💰)"; học hết bài của khoá → **"🏅 Chứng chỉ khoá +100 💰"**. Ghế/ghế đọc: `E`/`C`.
- **Kết nối:** thang máy (0; −10,3) giữa các tầng; không có cầu thang bộ.

#### 2.31 Học viện QA – phòng thi trắc nghiệm (campus.js:181–192; life.js:240)

- **Vị trí ngoài trời:** do `city.js` dựng tại `CITY.places.academy` ≈ (16,25; 52,54), cửa tại `city.academy.tx,tz` (chưa rõ trong phạm vi). `E` tại cửa bán kính 1,5 "🎓 Vào Học viện QA – phòng thi trắc nghiệm".
- **Bên trong:** 1 tầng, khung 36×24 m, bảng "🎓 HỌC VIỆN QA – Phòng thi trắc nghiệm · 380 câu · 10 chủ đề" 9×3 m ở tường sau; **30 máy thi** (5 hàng z=−5,−2,1,4,7 × 6 cột x=−12,−8,−4,4,8,12), mỗi máy 1 màn hình 0,6×0,38 hiển thị "Câu 12/20", 1 ghế; tối đa 10 thí sinh bot ngồi gõ; 2 chậu cây ở (±17; 10,8). Cửa ra (0; 10,6).
- **Nhân vật:** 1 **Giám thị** (áo xanh đậm, kính) đứng ở (0; −9,8) tư thế khoanh tay; tối đa 10 **Thí sinh**.
- **Tương tác:** ngồi vào máy trống "📝 Ngồi vào máy làm quiz QA/QC" hoặc `E` tại (0; −8,4) bán kính 2 → mở **Quiz** (xem 7.1). Cùng quiz có ở các **Kiosk Quiz** (`city.kiosks`, vị trí chưa rõ).
- **Kết nối:** cửa ra ngoài; vào/ra có hiệu ứng mờ đen 0,28 s.

#### 2.32 Tháp Brand QA·QC·QE + "bộ não" phát sáng (campus.js:44–63; brain.js)

- **Vị trí và kích thước:** toà tháp do `city.js` dựng tại `CITY.places.tower` = (0; 61) (chưa rõ trong phạm vi, có đèn nhấp nháy `towerBlink` và logo phát sáng). Phần do campus.js: **bộ não** thủ tục (mặt cầu méo, kích thước ~7,8×6,6×9,9 m theo x×y×z) lơ lửng ở (0; **y=65**; 61), phát sáng tím với dải sáng chạy; vòng hào quang torus xanh dương R=6,2 ở cùng tâm; 180 hạt sáng quay chậm quanh (bán kính 5–8,5 m). Trôi lên xuống ±0,4 m, tự xoay.
- **Chức năng:** biểu tượng + cổng vào "QA Brain" (tài liệu yêu cầu → test case).
- **Nhân vật:** không.
- **Tương tác:** `E` tại `city.spots.brain` (bán kính 1,8; vị trí chưa rõ) "🧠 Vào QA Brain" mở modal (`brain.js`): 4 tab – **📄 Phân tích tài liệu** (dán văn bản/chọn .txt .md .csv .json; đếm câu, nhận diện yêu cầu, giá trị biên, từ ngữ mơ hồ cần hỏi BA, vùng rủi ro cao: thanh toán, OTP, khuyến mãi, tồn kho, bảo mật, phân quyền, đơn hàng, giá, đồng bộ, PROD), **🧪 Test case** (sinh tự động EP/BVA/Negative/Error guessing/Risk-based, xuất CSV), **▶️ Tự test** (4 nút mở API Client, Automation, Database, Plan qua laptop), **🗺️ Lộ trình** (2 mục xong, 3 mục "⏳"). **Lần đầu dùng: +100 💰.** Chạy offline bằng heuristic regex, lưu `localStorage qcworld-brain`. Bản đồ: "🧠 Tháp Brand QA·QC·QE".
- **Kết nối:** tháp nằm ở phân khu Brand QA, phía Nam đảo (r≈61).

#### 2.33 Học viện QA (toà) / Chợ QC / Nhà thuyền / Văn phòng địa chính / Showroom (điểm đặt và tương tác trong life.js)

Toà nhà dựng bởi `city.js` (ngoài phạm vi); mã trong phạm vi chỉ cho biết:
- **Học viện QA:** xem 2.31.
- **Nhà thuyền:** `E` tại `city.boathouse.tx,tz` (bán kính 1,5) mở cửa hàng ['fun','goods'] "⚓ Nhà thuyền"; điểm đặt `atPolar(−π/2−0,13; 62)` ≈ (−8,0; −61,5).
- **Bến cảng (cầu tàu):** `PLACES` "⚓ Bến cảng – câu cá, thuê thuyền" bay tới (1; −66) nhìn (0; −100). Câu cá tại `city.spots.fish` (xem 7.4). Lên thuyền ở `city.spots.dock` (xem mục 6).
- Chợ QC, showroom, địa chính **không còn ở đảo** mà ở Phường Khởi Nghiệp (xem 2.37).

#### 2.34 Khu nghỉ dưỡng bờ Tây Nam (js/resort.js, world.html:453–457)

- **Vị trí và kích thước:** bờ đảo phình ra quanh góc `RESORT_A=2,3` rad (Tây Nam, ~(−59; 66) ở r=88). 4 nhà nằm ở r 58–60 (trong đất liền, mặt tiền hướng ra biển).
- **Bố trí:** (1) **Nhà nghỉ Hoa Sứ** (cho thuê 80 💰/ngày) tâm ~(−20,9; 54,1), 10×8 m, cao 2,8 m, mái ngói đỏ hai mái; (2) **Dãy Biệt thự Biển Xanh ×3** (mua 6.000 💰/căn), mỗi căn 13×10 m cao 3,2 m, mái bằng, tâm ~(−34,3; 49,2), (−47,0; 37,3), (−55,7; 22,3); (3) lối gỗ rộng 2 m nối 5 điểm bán kính 51,5 m (a=1,88→2,85) + nhánh ra bờ rộng 2,2 m, đèn đường ở mỗi điểm; (4) cầu gỗ 3 m và (5) đảo nhỏ: xem 2.35.
- **Chức năng:** nơi ở/ngủ/nấu ăn cho người chơi có tiền; có thể đặt làm "nơi xuất hiện".
- **Kết nối:** lối gỗ men dãy nhà; cầu gỗ ra đảo siêu biệt thự.

#### 2.34a Cấu trúc từng loại nhà ở khu nghỉ dưỡng (resort.js:116–161)

Chung: nền đá, sàn, tường dày 0,18 với cửa chính 1,3 m ở giữa mặt tiền (z=+d/2, x −0,65…0,65) – cửa **tự mở khi chủ nhà tới gần (<2,6 m)** hoặc đang trong nhà, khoá cứng với người chưa thuê/mua (vật cản). Khi bạn ở trong nhà, **mái + nửa trên tường ẩn** để nhìn vào. Nhãn trên nhà hiện giá/loại.

- **Nhà nghỉ Hoa Sứ (RENT):** vách ngăn z=−0,4 có 2 cửa (x −3,3…−2,2 vào phòng ngủ; x 2,2…3,2 vào phòng tắm); phòng khách: thảm nâu, sofa xanh xám 2,2 m (3 chỗ), bàn trà, TV "QC TV" (tivi 1,7×0,98 phát hình "Release 2.4 thành công 🎉"), cây, tranh; bếp 2,6 m + tủ lạnh thép; bàn ăn nhỏ + 2 ghế; phòng ngủ: giường 1,6 m, tủ quần áo, tranh; phòng tắm: bồn tắm, bồn cầu, bồn rửa; 2 chậu hoa trước cửa. Cửa sổ 4 mặt.
- **Biệt thự Biển Xanh (VILLA):** mặt tiền kính; phòng khách thảm 4,4×3, sofa trắng 3 m + sofa góc 1,8 m, bàn trà, TV, 2 cây, tranh; bếp 3,6 m + đảo bếp gỗ óc chó 2,2×0,9 + 3 ghế quầy; bàn ăn 2×1 + 4 ghế; phòng ngủ giường 2 m, tủ; phòng tắm; **sân trước sàn gỗ 14,2×4,6 với hồ bơi 6×2,6, 3 ghế tắm nắng (nằm được), dù trắng**.
- **Siêu biệt thự (SUPER):** 11,5×11 m cao 3,6 m; kính hai bên; phòng khách thảm 4,6×3,4, sofa xanh navy 3,2 m + sofa 2 m, bàn trà mạ vàng, TV, đèn chùm phát sáng; bếp 3,4 m + đảo bếp đen 2,4×1 + 3 ghế; bàn ăn 2,2×1; phòng ngủ giường 2,2 m, tủ; phòng tắm + bồn sục tròn; **sàn gỗ hướng biển trên cọc 14,5×6,4 + hồ bơi vô cực 10,5×2,4, 4 ghế tắm nắng, vách kính chắn gió**.

**Tương tác (3 hạng):** `E` ngoài cửa (r 1,7, vị trí cách cửa 1,1 m): chưa sở hữu → "Mua/Thuê … · giá 💰" (qua `askPay` xác nhận), sở hữu → "nhà của bạn (cửa tự mở)"; `E` ở **giường** (bán kính 1,6) → menu "😴 Ngủ một giấc" (chuyển sang buổi sáng `setTime(0)`) và "📍 Đặt làm nơi xuất hiện" (thuê chỉ trong ngày); `E` ở **bếp**: 🍳 Nấu bữa ăn → **buff chạy nhanh +10 phút** (R, V) hoặc 👨‍🍳 +15 phút (S); ngồi sofa/ghế (`E`/`C`), nằm ghế tắm nắng.

#### 2.35 Cầu gỗ sang đảo nhỏ + Đảo siêu biệt thự ISLET (resort.js:166–182; world.html:456–458)

- **Cầu gỗ:** rộng 3 m, mặt y≈0,38 (đi được cao 0,47), từ r=82,8 đến r=103 theo hướng a=2,3: từ ~(−55,1; 61,7) tới ~(−68,6; 76,8), dài 20,2 m, lan can + cột đèn mỗi 2,4 m. Nhãn "🌉 Cầu sang Đảo Siêu biệt thự".
- **Đảo nhỏ ISLET:** tâm (−81,29; 90,98) (r=122 theo a=2,3), bán kính 24 m (±2 theo `isletR`), có sóng vỗ riêng.
- **Bố trí:** 3 **Siêu biệt thự** mua 30.000 💰/căn: "Siêu biệt thự Hoàng Hôn" ~(−68,2; 97,3), "Đại Dương" ~(−90,9; 101,8), "Bình Minh" ~(−89,0; 78,7), cách tâm đảo nhỏ 14,5 m, mặt tiền hướng ra biển (xoay 1,12 / −0,73 / −2,58 rad); chi tiết nhà xem 2.34a. 14 cây dừa viền; quảng trường đá tròn bán kính 3,4–3,6 ở tâm đảo + đài phun nước bán kính 1,6–1,8 + 10 quả cầu hoa bán kính 2,8.
- **Kết nối:** cầu gỗ về đất chính. Bản đồ: "🏝️ Đảo Siêu biệt thự" (đến nhà thứ 3 của đảo), "🏡 Dãy Biệt thự Biển Xanh", "🏠 Nhà nghỉ Hoa Sứ".

#### 2.36 Quán nước Ngắm Biển + võng (resort.js:184–222)

- **Vị trí và kích thước:** a=0,42 (Đông Nam), r=62: tâm ~(56,6; 25,3), sàn tròn bán kính 6,5 m cao 0,16 (đi được).
- **Bố trí và nội thất:** 8 cột gỗ cao 3 m ở bán kính 3,2; mái nón lá bán kính 4,6 cao 2,2 (đỉnh y≈5,2); quầy bar cung tròn (1,4π) bán kính 1,7 cao 1,05 + mặt gỗ + đèn LED 6 màu; **5 ghế quầy bar** quanh mặt hướng biển (bán kính 2,45); **4 bàn ngoài trời** (bàn tròn 0,5 + dù 4 màu đỏ/vàng/xanh lá/xanh dương) ở bán kính 5, mỗi bàn **2 ghế** (tổng 8 chỗ); nhãn "🍹 Quán nước Ngắm Biển — Nước dừa · cà phê · sinh tố".
- **Nhân vật:** 1 **Pha chế** (nữ, áo trắng) đứng ở tâm quầy hướng biển; khách bot (xem mục 9 cafe.js): tối đa 3 nhóm, sinh ra cách quầy 14 m về phía đất liền.
- **Tương tác:** `E` tại quầy (bán kính 2,4) "🍹 Gọi nước ở quầy": 🥥 Nước dừa tươi **15 💰 / chạy nhanh 5 phút**, ☕ Cà phê sữa đá **20 💰 / 8 phút**, 🍓 Sinh tố dâu **25 💰 / 10 phút**; `E`/`C` ngồi quầy/bàn.
- **Võng:** 4 võng giữa 2 cây dừa (a=0,66; 0,735; 0,81; 0,885, r=66/68,5/66/68,5): ~(52,1; 40,5), (50,8; 45,9), (45,5; 47,8), (43,4; 53,0), màu đỏ/xanh/vàng/lục; `E`/`C` nằm võng.
- **Kết nối:** bờ Đông Nam; bản đồ "🍹 Quán nước Ngắm Biển" đứng cách quầy 9 m.

#### 2.37 Quy hoạch đất liền mở rộng: Downtown, Phường Khởi Nghiệp, Khu Giải trí (world.html:256–277)

Chỉ là **dữ liệu chữ nhật** trong world.html (toà nhà do `downtown.js`, `ward.js`, `arena.js`… dựng, chưa rõ trong phạm vi):

| Vùng | x0–x1 | z0–z1 | Rộng×sâu | Ghi chú |
|---|---|---|---|---|
| Downtown (đảo thương mại) | 136–262 | −62…62 | 126×124 | nối đảo MD bằng cầu theo z=0, `bridgeW=28` (đường 20 m + 2 lối bộ hành) |
| Phường Khởi Nghiệp | 136–262 | 56…480 | 126×424 | `slabZ0=62`, đường nhánh `street=86`, `links=[146,252]`, phố chính `main=200`; "Đại công viên Hồ Ngọc" ở x 156–242, z 10–190 (theo chú thích) |
| Khu Giải trí | 274–394 | −60…60 | 120×120 | cầu ngắn `bridgeW=10` (x 262→274) |

**Mạng đường phố** (`CITY.roads`, rộng 20 m, vỉa hè 5 m, làn ô tô 3,3 m ×2 chiều + làn xe máy 2,6 m): Đại lộ Hồ Ngọc (z=0, x 136→262); Trục Bắc (x=178, z −62→0, cầu Cao nguyên); Đại lộ ven Tây (x=146, z 0→200); Đại lộ ven Đông (x=252, z 0→200); Nhánh cầu Đồi Brand QC (z=86, x 252→262); Phố chính Phường (z=200, x 136→262); Đường Trường Học (x=199, z 200→470); Đường Bệnh Viện (z=290); Đường Cao Ốc Nam (z=380); Đường Ven Biển Nam (z=470) (ba đường cuối x 136→262).
**Điểm bán/nơi mở "chợ"** (`CITY.places`): Chợ QC `shop` (146; 217,5), Showroom `showroom` (163; 217,5), Văn phòng địa chính `landOffice` (180; 217,5), cả ba xoay π (mặt về −z, ra Phố chính z=200).
**Cổng "Rời đảo":** `CITY.gateX=52` (đầu cầu phía đảo).

#### 2.38 Đất ở + đất kinh doanh của người chơi (CITY.lots – world.html:249–252; life.js:499–623)

- **Vị trí và kích thước:** 12 lô, mỗi lô ~10×10 m (cọc ở ±5), nằm giữa Đường Bệnh Viện (z=290) và Đường Cao Ốc Nam (z=380); xoay π (mặt tiền hướng −z/Bắc ra đường). Bước x 10,45 m.
  - Đất ở **R1–R4**: (143; 307), (153,45; 307), (163,9; 307), (174,35; 307); giá 1.500 / 1.800 / 2.100 / 1.500 💰.
  - Đất ở **R5–R8**: cùng x, z=329; giá 1.800 / 2.100 / 1.500 / 1.800 💰.
  - Đất kinh doanh **B1–B4**: x=143; 153,45; 163,9; 174,35, z=351; giá 3.000 / 3.400 / 3.800 / 4.200 💰.
- **Bố trí:** lô trống có 4 cọc cam + biển "ĐẤT BÁN · mã – giá"; sau khi mua: biển "Đất của <tên>"; xây xong dựng công trình (xem dưới).
- **Chức năng:** nhà ở/vườn rau + quán/trang trại sinh tiền (kể cả offline, tối đa 8 giờ).
- **Tương tác:** `E` ở mặt trước lô (cách tâm 5,9 m về −z, bán kính 1,6): mua (`spend`), xây (`openBuild`), nhà: ngủ / đặt làm nhà chính / sơn lại (50 💰, đổi màu cửa/mái che theo 6 màu); quán: thu tiền tích luỹ. Màu chủ đạo 6 lựa chọn.
- **Công trình có thể xây:**

| Loại | Dành cho | Giá 💰 | Mô tả / thu nhập |
|---|---|---|---|
| 🏠 Nhà cấp 4 | đất ở | 1.200 | nhà mái ngói (dựng bằng `buildHouse`: thân 5,4×4,6, cao 3, mái 30°, hiên + mái sọc + biển tên), 3 luống rau |
| 🏡 Biệt thự hiện đại | đất ở | 4.500 | 2 tầng, kính lớn, hồ bơi nhỏ, 6 luống rau |
| 🥖 Tiệm bánh mì | đất KD | 1.500 | +4 💰/phút (tối đa 8 giờ = 1.920 💰) |
| ☕ Quán cà phê | đất KD | 2.200 | +5 💰/phút (tối đa 2.400) |
| 🍜 Quán phở | đất KD | 3.000 | +7 💰/phút (tối đa 3.360) |
| 🐎 Trang trại ngựa | đất KD | 3.800 | +9 💰/phút (tối đa 4.320) + 4 luống + 3 ngựa thả rông |

  Quán có 2 bàn picnic ngồi được (4,1 m hai bên). Luống rau: xem 7.5.
- **Nhân vật:** bot "khách ăn" (`walker`) ghé quán của người chơi.
- **Kết nối:** Đường Bệnh Viện/Đường Cao Ốc Nam; bản đồ M "🏘️ Khu dân cư (Phường Khởi Nghiệp)" đưa tới lô thứ 3; "🏠 Nhà của bạn" tới nhà chính.
- **Lưu ý (không khớp):** văn bản trong "Văn phòng địa chính" còn ghi "Khu dân cư (phía Đông)" / "Khu thương mại (phía Tây/Tây Bắc)" (life.js:620) – đã cũ so với vị trí thật ở Phường; tin nhắn trợ giúp bot nhắc "khu Thương mại" tương tự.

#### 2.39 Phòng trọ khởi nghiệp (life.js:398–409)

- Vị trí do `ward.spots.tro` (ward.js, chưa rõ trong phạm vi); có 4 phòng: **Phòng 1 miễn phí của người chơi**, Phòng 2–4 "đã có người thuê".
- Tương tác: `E` vào Phòng 1 → menu: 😴 Ngủ (chuyển sang buổi sáng), 📍 Đặt làm nơi xuất hiện, 🧑‍💼 Đi kiếm việc. Người mới được toast giới thiệu phòng trọ miễn phí.

---

### 3. KINH TẾ TIỀN (life.js:46–111, 114–148)

- **Ví:** `S.coins` khởi tạo **300 💰**, hiện ở thanh trên cùng (💰 + nút "+" nạp tiền từ topup.js). Lưu `localStorage` khoá `qcworld-save` (trì hoãn 150 ms). Mọi khoản chi đều qua `askPay` (hộp xác nhận "Số dư a → b"); không đủ tiền thì toast gợi ý làm việc / quiz.
- **Hiệu ứng:** mỗi lần thu/chi nổi chữ "+N 💰" / "−N 💰" trên đầu nhân vật 1,6 s.
- **Người mới:** được tặng **🚲 xe đạp** (và đặt làm xe đang dùng), phòng trọ miễn phí ở Phường.
- **Nguồn thu:**

| Nguồn | Thưởng | Ghi chú |
|---|---|---|
| Quiz QA (đúng) | 20 / 35 / 55 💰 theo mức Cơ bản / Trung bình / Nâng cao | câu đã thuộc còn 5 💰; chuỗi đúng thưởng thêm 5×min(5, ⌊chuỗi/3⌋); ☕ cà phê +20% |
| Học xong 1 bài (Toà Giáo trình) | +10 💰 | lần đầu mỗi bài |
| Hoàn tất cả khoá | +100 💰 (chứng chỉ) | |
| Lần đầu dùng QA Brain | +100 💰 | |
| Bỏ rác vào thùng | +6 💰 | ném trúng thùng (G) +12 💰 |
| Tưới bồn hoa | +5 💰 | cần 🚿 Bình tưới |
| Câu cá | 12–170 💰 | xem 7.4 |
| Thu hoạch rau | 18 / 45 / 110 / 240 💰 | xem 7.5 |
| 10 vỏ sò | +50 💰 | island.js |
| Quán / trang trại | 4 / 5 / 7 / 9 💰 mỗi phút, tối đa 8 giờ tích luỹ | thu bằng `E` |
| Nạp (hoạt cảnh) | +500 hoặc +2.000 💰 | topup.js, không có giao dịch thật |
| Việc làm / lương ngày | chưa rõ trong phạm vi | `jobs.js`, `workpc.js`, `jobcenter.js` |

- **Chi tiêu:** vật phẩm (mục 4), đất/xây/sơn (2.38), nhà nghỉ dưỡng (80 / 6.000 / 30.000), đồ uống quán nước (15–25), vé thuyền 250, vé VIP 150, xe/showroom (`showroom.js`, chưa rõ trong phạm vi).

### 4. CỬA HÀNG, VẬT PHẨM, TÚI ĐỒ (life.js:114–170, 674–685)

**Cửa hàng** (mở bằng `openShop(tabs, title)`):
- **🛒 Chợ QC** – các tab: 🧺 Đồ dùng, 🎟️ Giải trí, 🌱 Hạt giống, 🐾 Thú cưng. Toà nhà ở Phường (146; 217,5), `E` tại `city.shop.tx,tz` bán kính 1,5.
- **⚓ Nhà thuyền** – tab Giải trí + Đồ dùng, ở phía Bắc đảo (xem 2.33).
- **Showroom xe:** xem `showroom.js` (ngoài phạm vi; `life.js` chỉ truyền hàm chi tiêu). Nếu showroom lỗi, mở tab 🚘 Xe với 🛵 và 🚗 đơn giản.
- Gọi xe/loại: mỗi xe có chọn màu: Đỏ, Đen, Trắng, Xanh dương, Bạc, Vàng.

**Danh mục vật phẩm (`ITEMS`)**:

| Món | Giá 💰 | Loại | Tác dụng |
|---|---|---|---|
| 👟 Giày chạy bộ | 600 | vĩnh viễn | đi/chạy nhanh +20% |
| ⚡ Nước tăng lực | 120 | 24 giờ | nhanh +40% |
| ☕ Cà phê sữa đá | 90 | 24 giờ | +20% thưởng quiz |
| 🎣 Cần câu | 300 | vĩnh viễn | câu cá ở cầu cảng phía Bắc |
| 🪱 Mồi câu ×10 | 40 | cộng dồn (10) | mỗi lần thả tốn 1 mồi |
| 🚿 Bình tưới | 150 | vĩnh viễn | tưới bồn hoa đảo (+5 💰) và vườn nhà |
| 🚤 Vé thuê thuyền | 250 | 24 giờ | lái thuyền quanh đảo |
| 🎫 Vé concert VIP | 150 | 24 giờ | lên sân khấu + bắn pháo hoa |
| 🥬 Hạt rau muống ×5 | 30 | cộng dồn | lớn 2 phút, bán 18 |
| 🍅 Hạt cà chua ×5 | 80 | cộng dồn | lớn 6 phút, bán 45 |
| 🍓 Hạt dâu tây ×5 | 180 | cộng dồn | lớn 15 phút, bán 110 |
| 🌻 Hạt hướng dương ×5 | 350 | cộng dồn | lớn 30 phút, bán 240 |
| 🐕 Chó Shiba | 900 | thú cưng | theo bạn, vuốt ve |
| 🐈 Mèo mướp | 700 | thú cưng | |
| 🦜 Vẹt | 500 | thú cưng | bay quanh, nhại câu chat |
| 🛵 Xe tay ga | 2.000 | vĩnh viễn | ~50 km/h, bấm V |
| 🚗 Ô tô sedan | 6.000 | vĩnh viễn | ~70 km/h, bấm V |
| 🚲 Xe đạp | 0 | quà tặng | ~23 km/h theo mô tả (mã: 5 m/s = 18 km/h) |

**Túi đồ (phím I):** tiền, thống kê (đã kiếm, quiz đúng/tổng, dọn rác, câu cá, thu hoạch), vật phẩm, thú cưng, nhà đất ("✨ Bay tới" từng lô), chọn xe đang dùng. **Hồ sơ (phím P):** đổi tên (≤20 ký tự) và nhân vật: 🤖 Robot QC (đủ động tác gốc: nhảy múa, vẫy, đấm, like, gật/lắc), 🧑‍✈️ Anh Lính, 🦾 Ma-nơ-canh; lưu `qcworld-profile` rồi tải lại trang.

### 5. NHÀ, ĐẤT, VƯỜN, PHÒNG TRỌ (tóm tắt – chi tiết ở 2.34, 2.38, 2.39)

- **Nơi xuất hiện (`S.home`):** phòng trọ `tro` / lô đất `R1…B4` / nhà nghỉ dưỡng `res:<id>`; mở game thì dịch chuyển tới đó (life.js:776–779). Không đặt thì xuất hiện ở quảng trường (0; 9).
- **Ngủ:** ở giường nhà/phòng trọ → `setTime(0)` (chuyển về buổi **Ngày**).
- **Nhà nghỉ dưỡng thuê theo ngày** (`rent[id] = ngày hôm nay`), mua vĩnh viễn (`own[id]`).

### 6. PHƯƠNG TIỆN (js/vehicles.js, life.js:647–658)

**Phương tiện** (dựng thủ tục, vật liệu PBR, mỗi cái gộp mesh):

| Loại | Tối đa (m/s ≈ km/h) | Ghi chú |
|---|---|---|
| 🚗 Ô tô | 19 × hệ số mẫu | gia tốc 6,5 m/s², lái 1,5 rad/s; ẩn người chơi (ngồi trong) |
| 🛵 Xe tay ga | 14 ≈ 50 km/h | gia tốc 7, lái 1,9; người ngồi bằng IK |
| 🚲 Xe đạp | 5 ≈ 18 km/h | gia tốc 5, lái 1,1; chân đạp theo bàn đạp |
| 🚤 Thuyền máy | 11 ≈ 40 km/h | gia tốc 4; không vào quá bán kính edgeR+2 (đứng cách bờ ≥2 m) hoặc ra xa quá 190 m |

Ngoài đường nhựa (`onRoad`) tốc độ tối đa nhân **0,55** (xe đạp và thuyền không bị giảm); `Shift` tăng tốc ×1,18. Xe máy/xe đạp đâm vào xe khác khi tốc độ >5,5 m/s → **té ngã ~1,5 s** rồi tự đứng dậy; ô tô va chạm thì bật lùi và toast.

**8 mẫu ô tô** (`CARS`; tốc độ = 19 m/s × hệ số): sedan **QC Sedan S** (1,0; dài ~4,4 m, rộng 1,66), **QC Mini Hatch** (0,9; ~3,5 m, 1,6), **QC SUV 7 chỗ** (1,0; ~4,6 m, 1,84), **QC Pickup Ranger** (0,95; ~5,0 m, có thùng, 1,8), **QC Sport GT** (1,28; ~4,6 m, 1,86, có cánh gió), **QC Royal Limousine** (1,05; ~6,25 m, 1,98, lưới crôm), **QC Maestro S** (1,15; ~5,5 m, 1,96, hai tông màu), **QC Stradale Spider** (1,35; ~4,7 m, 1,94, mui trần, 2 ghế da). Tuỳ chọn phối màu: sọc đua, màu nóc, màu gương, mâm. Mẫu đang dùng `S.carModel` do showroom đặt (chưa rõ trong phạm vi).

**Cách dùng:** phím `V` lên/xuống xe (xe cũ ở xa >8 m thì "gọi" tới chỗ bạn); `W/S` ga/phanh, `A/D` lái; thuyền: `E` ở bến để cập bến. Không lên xe được khi đang ở trong toà nhà. Camera lùi 9 m (ô tô) / 6,8 m (xe máy, xe đạp) / 10 m (thuyền). Thuyền thuê **250 💰/24 giờ**, đậu sẵn ở `city.spots.boatPark`; bến lên thuyền `city.spots.dock` (bán kính 2); cập bến trong 8 m quanh dock.

**Xe bot / xe buýt / taxi:** do `traffic.js`, `transit.js` (ngoài phạm vi).

### 7. HOẠT ĐỘNG KIẾM TIỀN VÀ SINH HOẠT TRÊN ĐẢO

#### 7.1 Quiz QA (life.js:172–217)
- Mở ở Học viện (2.31) hoặc Kiosk Quiz. Chọn chủ đề (hoặc 🎲 Trộn) → câu ngẫu nhiên (85% câu chưa thuộc) → chọn A–D → đáp án + giải thích. Sai không mất tiền, chuỗi về 0. Thưởng như bảng mục 3; chuỗi chẵn bội 5 bắn pháo hoa. Dữ liệu `data/questions.json` (380 câu / 10 chủ đề theo mô tả; có 3 câu dự phòng nếu không tải được).

#### 7.2 Rác và thùng rác (life.js:250–287)
- Ban đầu 9 mảnh rác (4 dạng), sinh thêm 1 mảnh/14 s nếu <16; vị trí `city.trashArea` (chưa rõ trong phạm vi). `E` "🗑️ Nhặt rác" → cầm vào tay; `E` ở thùng "♻️ Bỏ rác vào thùng (+6 💰)" hoặc `G` ném (bay cong 6 m/s; trúng thùng +12 💰, trượt thì rác rơi lại).
- **14 thùng rác:** 4 quanh quảng trường ở r=8,6 (a=0,55; 2,1; 3,7; 5,3): (7,3; 4,5), (−4,3; 7,4), (−7,3; −4,6), (4,8; −7,2); 8 thùng ở bán kính 48,5 (xem 2.2); 1 thùng ở (2,2; −63) (bến cảng); 1 thùng cạnh QA Brain (`city.spots.brain` + (4,1)).
- Bot **Bác Ba / Cô Út** tự dọn rác (xem mục 8).

#### 7.3 Học ở Toà Giáo trình: xem 2.28–2.30.

#### 7.4 Câu cá (life.js:625–645)
- Điểm câu `city.spots.fish` (cuối cầu tàu phía Bắc; vị trí chưa rõ), bán kính 1,8. Cần 🎣 + 🪱. `E` thả câu (tốn 1 mồi) → chờ 2,5–7,5 s → **"❗ CÁ CẮN CÂU!"** (1,5 s để bấm E) → bắt được. Rời quá 3 m thì thu dây.
- Bảng cá (xác suất ‰ / thưởng): Cá cơm 30 / 12 💰, Cá nục 24 / 22, Mực ống 12 / 35, Cá thu 15 / 48, Cá mú 9 / 85, Cá ngừ đại dương 4 / 170, Chiếc giày cũ 👟 3 / 0, Rùa biển (thả lại) 3 / 0.

#### 7.5 Trồng rau (life.js:533–558)
- 3 luống (nhà cấp 4), 6 (biệt thự), 4 (trang trại) trên lô đất người chơi. `E` luống trống → chọn hạt (còn bao nhiêu), gieo; nhãn đếm % và thời gian còn lại; chín thì `E` thu hoạch (+tiền), cây lớn dần theo thời gian thật (kể cả offline).

#### 7.6 Bồn hoa tưới (life.js:289–296)
- Các `city.beds` (số lượng/vị trí do city.js). Có Bình tưới: `E` tưới (+5 💰); bồn khô <0,55 thì bot **Cô Lan / Chú Sáu** tới tưới; bồn héo nếu lâu không tưới.

### 8. BOT DÂN CƯ + NHÂN VẬT (js/bots.js, js/people.js)

**Số lượng:** 22 bot (nếu `people.js` chạy được) + 4 NPC sân khấu/đi tuần của world.html. Mô hình người: `people.js` sinh ~997 kiểu người từ khung Xbot (Mixamo), mỗi người **1 SkinnedMesh** (1 lượt vẽ): giới tính (50/50), da (6 sắc), tóc (10 màu; kiểu nữ: dài/bob/đuôi ngựa/búi/ngắn; nam: ngắn/cạo/dựng/mũ lưỡi trai/hói), áo (16 màu), quần/váy/đầm (nữ 28% đầm, 30% váy), quần đùi (nam 12%), giày (6 màu), kính (24%), chiều cao nữ 1,56–1,70 m / nam 1,66–1,84 m. Tên ngẫu nhiên từ 20 tên nữ + 20 tên nam. Chỉ có clip idle/walk/run/agree/headShake.

**Lịch sinh hoạt:** không có đồng hồ (không phân ban ngày/đêm); mỗi bot chạy 1 vòng lặp theo nghề (máy trạng thái). Bot xa người chơi >60 (Thấp) / 90 m bị ẩn hẳn, xa >70 m chỉ cập nhật thưa (35%). Đường đi A* trên lưới (`nav.js`), tránh vật cản, đứng chờ đèn đi bộ (`traffic`).

**Bảng bot** (bots.js:160–177):

| # | Tên | Mô hình / nghề | Vị trí xuất phát | Hành vi và thoại tiêu biểu |
|---|---|---|---|---|
| 1 | Bác Ba · quét rác | người (nam, nón, áo cam) · sweeper | (8; 12) | tìm rác gần nhất → quét 2,4 s → nhặt; "Xả rác là bug đó nha! 🐞", "Đảo đẹp nhờ mọi người ❤️", "Sạch bong rồi! 🧹" |
| 2 | Cô Út · quét rác | robot · sweeper | (−30; 30) | như trên |
| 3 | Cô Lan · làm vườn | người (nữ, áo xanh lá) · gardener | (−9; 9) | tìm bồn hoa khô nhất, tưới 3,2 s; "Hoa nở đẹp quá 🌸" |
| 4 | Chú Sáu · làm vườn | người (nam, nón) · gardener | (20; 50) | như trên |
| 5 | Anh Tư · ngư dân | người (nam, quần đùi) · fisher | (2; −60) | ra cuối cầu tàu, câu 14–30 s/lần; "Dính một con cá thu! 🐟"/"Hụt rồi… 😅"; sau 3 lần đem bán ở Chợ: "Bán cá cho Chợ QC đây!" |
| 6 | Chị Hoa · bán hàng | người (nữ, áo đỏ) · clerk | tại Chợ QC (`city.shop`) | đứng quầy, gần <4 m thì chào + vẫy: "Chợ QC xin chào! Có mồi câu, vé thuyền nè 🛒" |
| 7 | Anh Khoa · tư vấn xe | người (nam, áo trắng) · clerk | tại Showroom | "Xe máy, ô tô đời mới đây anh/chị ơi! 🏍️" |
| 8 | Cô Mai · địa chính | người (nữ, áo vàng) · clerk | tại Văn phòng địa chính | "Đất đẹp, giá tốt, sổ đỏ có ngay 📜" |
| 9 | Bảo vệ Hùng | người (nam, đồng phục xanh đen) · guard | (45; 0) | đi tuần 24 điểm quanh vành đai (bán kính 48,7), tốc độ 1,2, 12% dừng 4 s; "Khu vực an toàn ✅", "Nhớ khoá xe nha!", "Chào buổi sáng/tối!" |
| 10 | Minh · chạy bộ | người (nam, đồ thể thao) · jogger | (47; 4) | chạy 3,4 m/s quanh vành đai 36 điểm (bán kính 47,4) ngược chiều kim đồng hồ |
| 11 | Thảo · Automation | robot · walker | (−12; −10) | đi dạo giữa quán (của người chơi)/ghế đá/Học viện/Chợ, ngồi 10–24 s; "Món này ngon thật! 🍜", "Nghỉ chân chút…", "Ôn ISTQB thôi 📘", "Mua ít mồi câu nào 🪱" |
| 12 | Long · API tester | người · walker (cầm bảng kẹp) | (14; 4) | như trên |
| 13–20 | 8 "dân phố" (tên ngẫu nhiên, seed 40+i, luân phiên nữ/nam) | người · citizen | (160;−13,5), (196;−13,5), (238;−13,5), (150;214), (215;214), (192;296), (215;386), (170;386) | đi dạo giữa cửa các toà công ty Downtown và các địa điểm x>60; 35% nói: "Hôm nay trời đẹp ghê ☀️", "Đi phỏng vấn thử xem sao…", "Công ty này có pantry free cà phê đó!", "Lương tháng này về rồi 💰", "Tối nay đi ăn lẩu không?" |
| 21 | Vy · fan cứng | robot · fan | (−14; −12) | có nhạc → chạy ra (−5,5; −21) nhảy hướng sân khấu; không nhạc → đi dạo |
| 22 | Đạt · fan cứng | robot · fan | (14; −12) | chỗ nhảy (5,5; −20,5) |

**NPC của world.html** (xem 2.16, 2.18): Linh Tester, Bug Hunter, QC Bot, Tuấn Dev.

**Phản ứng với người chơi:** đấm (phím 3, bán kính 1,5 m phía trước) bot bị đẩy lùi 0,6 m và nói "Ui da! 😵", "Đánh người là bug nghiêm trọng đó!", "Bình tĩnh nào bạn ơi 😅", "Tôi báo bảo vệ Hùng nha!". Chat (phím T): 2 bot gần nhất (trong 10 m) trả lời sau 0,9–1,8 s theo từ khoá (chào / bug / test, qc, qa / đói, ăn, phở / tiền / nhạc, nhảy) hoặc câu chung ("Ờ ha 😄", "Nghe hay đó!", "Chuẩn QA luôn!"…); vẹt nhại lại.

### 9. QUÁN XÁ SỐNG ĐỘNG (js/cafe.js)

- Quán khai báo vào `W.CAFES` (resort.js trong phạm vi: Quán nước Ngắm Biển; `arena.js` có thêm quán – chưa rõ trong phạm vi). Chỉ chạy khi bạn ≤75 m (`near`), đi xa +20 m thì khách biến mất.
- **Vào quán:** có 1–2 nhóm khách ngồi sẵn khi bạn tới; sinh khách mới mỗi 16–32 s, tối đa `max` (3) nhóm; xác suất đi cặp 60%, đi một mình 40%; ở 80–150 s rồi rời.
- **Quy trình khách:** xuất hiện ở `spawn` → đi tới điểm gọi món `order()` ("Cho 2 ly <đồ uống> nha!") → chờ 3,2 s ("Cảm ơn nha! 😊") → đi vòng tới bàn → ngồi (tư thế ngồi/ăn), ly nước đặt lên bàn → nói chuyện. Dùng bàn có ≥2 ghế trống.
- **Hội thoại cặp:** 8 đoạn chung (bug sprint, concert khu Giải trí, thi ISTQB, hotfix, Phố cổ Riverside, bóng đá QC FC vs Bug United, đồ uống, Playwright) + đoạn riêng quán (2 đoạn ở Ngắm Biển: "Biển hôm nay xanh ghê ha!"…). Khách **đi một mình** nói câu đơn ("Chill thật sự…") hoặc, khi bạn **ngồi chung bàn**, chào "Chào <tên>! Ngồi chung bàn nha 😄" rồi hỏi 4 câu ngẫu nhiên trong 8 câu (công việc, bug, chỗ ở, khu Giải trí, uống gì, SQL, mẹo test case, cuối tuần đi đâu) – nhân vật bạn đáp tự động ("Mình làm … ở … đó", "Mình ở phòng trọ khởi nghiệp, đang để dành mua nhà!"…); bạn đứng dậy thì "Hẹn gặp lại nha <tên>! 👋".

### 10. THÚ CƯNG, GHẾ NGỒI, CHAT, CỬ CHỈ

#### 10.1 Thú cưng (life.js:438–497)
- Thú mua: Shiba (model Fox), Mèo (thủ tục), Vẹt (model Parrot). Đi theo sau lưng cách 1,2 m, bên trái/phải xen kẽ; chạy khi bạn chạy/lái xe; xa >30 m thì dịch chuyển tới; `E` vuốt ve (tim hồng + "Gâu gâu! ❤️" / "Meo~ ❤️" / "Test đi! Test đi! 🦜"). Đấm bé → "😾". Lưu trong `S.pets` (tên mặc định Shiba / Mướp / Vẹt Xanh).
- **Thú hàng xóm:** 🐕 Lu (chó Fox đi dạo vòng bán kính 50 m quanh đảo, tốc độ 0,045 rad/s); 🐈 Miu (mèo ngồi cạnh `city.benches[0]`). **Chim trời:** 3 cò bay vòng r≈60–76, cao 30; 2 hồng hạc r≈95–103, cao 9.

#### 10.2 Ghế ngồi (life.js:345–391)
- Mọi "chỗ ngồi" `addSeat({x,z,rot,y,floor,scope,lie…})`; các chỗ kề nhau tự gộp thành **băng ghế** (≤1,5 m, cùng hướng/độ cao) với 1 nút E chung "còn x/y chỗ", ~0,6 m/người. `E` hoặc `C` để ngồi, `E/C/phím di chuyển` để dậy. Có kiểu ngồi, nằm ngửa (võng, ghế tắm nắng). Ghế đá `city.benches` (1,5 m = 3 chỗ), bàn picnic (4 chỗ, lại gần từ ngoài), ghế trong toà.

#### 10.3 Chat (T / Enter, ≤120 ký tự) – bong bóng trên đầu + nhật ký 7 dòng; gửi cho người chơi khác nếu đang online.

#### 10.4 Cử chỉ: `1` vẫy tay, `2` nhảy múa (bật/tắt), `3` đấm, `4` cổ vũ/like, `5` gật đầu, `6` lắc đầu (clip gốc nếu có, nếu không dùng tư thế thủ tục bằng IK xương). `F` cũng bật nhảy múa. Khi online các cử chỉ 1–6 đồng bộ cho mọi người.

### 11. THIẾT BỊ CÁ NHÂN: LAPTOP · MÁY NGHE NHẠC · ĐIỆN THOẠI · NẠP TIỀN (js/gadgets.js, js/topup.js)

Có dock 3 nút ở góc phải dưới (💻 L, 🎧 Y, 📱 O) và nhân vật cầm đồ bằng tư thế IK (laptop đặt trước ngực, máy/điện thoại cầm ngang ngực). Khi đang lái xe thì chỉ còn giao diện.

#### 11.1 💻 Laptop – phím L (cất: L / Esc / ⏏)
- Camera chuyển góc nhìn thứ nhất, màn hình laptop gần bằng màn hình game (HTML đè lên), giả lập hệ điều hành "QC OS" với desktop 6 biểu tượng:
  - 🖥️ **Master Dashboard** – **chỉ mở khi máy có thư mục Master Dashboard** (kiểm tra `GET /api/md/available`; nếu không → "Máy này không có Master Dashboard – không truy cập được"; có thư mục nhưng chưa chạy → hướng dẫn `MasterDashboard.vbs`); thanh nút: Trang chủ + 8 khu zone, "↗ Mở tab riêng" tới `http://127.0.0.1:8765`.
  - 🌐 **Trình duyệt kiểu Chrome**: tối đa 6 tab, Google nhúng (`igu=1`), YouTube chuyển sang bản embed, danh sách ~33 trang chặn nhúng (github, facebook, mail.google, youtube.com (trừ link watch được đổi sang bản embed), chatgpt, claude.ai, shopee, v.v.) → nút "↗ Mở bằng trình duyệt thật"; 8 ô gợi ý (Google, Wikipedia, Bản đồ, Tin tức, Thời tiết, Tỷ giá, W3Schools, ISTQB).
  - 🐞 **Diệt Bug** (30 s, lưới 12 ô: 🐞 +10, 🕷️ +25, ✨ −15; combo; kỷ lục `qcworld-bugbest`; danh hiệu Tester tập sự → Thợ săn bug huyền thoại ≥360).
  - 🃏 **Lật thẻ QA** (ghép 8 cặp thuật ngữ ↔ nghĩa trong 18 cặp; kỷ lục lượt `qcworld-cardbest`).
  - 📝 **Ghi chú** (tự lưu `qcworld-lapnotes`).
  - 🎧 **Nghe nhạc** (cất laptop rồi mở máy nghe nhạc).
- Cổng Trang chủ và QA Brain "Tự test" gọi `laptop.openMD(url)`.

#### 11.2 🎧 Máy nghe nhạc "QC Pod" – phím Y
- Tìm YouTube qua `GET /api/yt/search?q=` (server `serve.py`, không cần API key) hoặc dán link; danh sách kết quả có ảnh thu nhỏ; chọn bài, ▶ Phát (hoặc bấm đúp), ⏯ ⏭ âm lượng ⏹. Bài bị chủ sở hữu chặn phát ngoài YouTube (mã 101/150/153) được đánh dấu ⛔ + nút "↗ Mở trên YouTube" (lưu `qcworld-pod-bad2`). Trình phát YouTube chạy trong `js/ytframe.html` ở `http://localhost` (không phải 127.0.0.1) để YouTube cho phát bản chính thức.
- **Đeo tai nghe**: hoạt cảnh tay lấy tai nghe từ túi quần → đưa lên tai (1,7 s), tháo (1,6 s). **Khi đeo, mọi âm thanh thành phố (sóng, gió, xe, người, nhạc sân khấu) bị tắt** (vá `AudioNode.connect` bằng nút giảm âm); chuông điện thoại vẫn nghe. Thanh "Đang phát" ở góc phải dưới (tạm dừng/bài kế/âm lượng/Tháo/☰/⏹).

#### 11.3 📱 Điện thoại – phím O
- Mỗi người **1 số cố định `555-xxx-xxxx`** (lưu `qcworld-phone`), danh bạ, nhắn tin (gửi/nhận qua server nhiều người chơi, trạng thái "đang gửi/đã gửi/chờ người nhận online"), mục "📡 Đang online", soạn tin, huy hiệu tin chưa đọc, chuông "ting-ting" khi có tin. Chơi một mình thì nhắn tin báo cần vào chế độ nhiều người (J). Nếu số đang dùng ở cửa sổ khác thì cấp số tạm.

#### 11.4 💰 Nạp tiền – nút "+" cạnh ví (topup.js)
- 2 gói chỉ là **hoạt cảnh vui trong game, không có thanh toán thật**:
  - **Gói 1 – Nạp 500:** điện thoại tự bật Tin nhắn → "Anh trai Bình Phan" (số 555-999-9999), ngón tay ảo gõ bàn phím ảo xin, đối thoại: "Cho xin 500 đồng trải nghiệm game đi bợn hiền" → "OK , đưa số tài khoản đây" → "123456789" → "Đã chuyển, trải nghiệm nhé"; thông báo "🏦 Ví QC · +500 💰" → **+500**.
  - **Gói 2 – "Ủng hộ nhà phát triển 20k":** hỏi lại "Bạn muốn thực sự ủng hộ nhà phát triển sao?" [Khôngn't]/[Có chứ]; "Có chứ" → cắt cảnh: xe mui trần đuôi thuyền đỏ "QC Sovereign Boat-Tail" (thiết kế riêng, không logo hãng) chạy tới từ 42 m (6 s), vệ sĩ xuống mở cửa, anh Bình Phan (áo đen, cánh vàng, dây chuyền + vương miện) bước ra nói "Sao hay dị quá, giàu quá ha mà bay đặt nhấn gói này 😏", hai điện thoại chạm nhau → **+2.000 💰**, "Mãi bên nhau bạn nhé 🤝", chào, lên xe, xe bay lên trời. Cần ở ngoài trời, không đi xe. Có nút bỏ qua (Esc) vẫn được cộng.

### 12. NHIỀU NGƯỜI CHƠI (js/multi.js)
- Nút "👥 Online" (phím J) nhập địa chỉ server (mặc định `ws://127.0.0.1:8790`), 6 màu tên, tuỳ chọn tự kết nối. Server `multiplayer_server.py` (chỉ chuyển vị trí/tên/chat/cử chỉ; mặc định chỉ 127.0.0.1, bản LAN cho mạng nội bộ; tối đa **32 người**).
- Gửi 10 gói/giây (vị trí, hướng, animation, mô hình, loại xe, đang trong toà nào); người khác được nội suy trễ 160 ms. Người chơi khác có avatar đúng loại + nhãn "👤 tên"; ở trong toà nhà thì không hiện ngoài phố. Chat T hiện bong bóng trên đầu người gửi; cử chỉ 1–6 đồng bộ (👋🦘👊🙌👍🙅). Tự kết nối lại tối đa 6 lần.

### 13. ÂM THANH MÔI TRƯỜNG (island.js, ambience.js, world.html)

- **Không có nhạc nền.** Âm thanh tự tạo bằng Web Audio (không tải file, offline). Bật/tắt ở nút ⚙ Đồ hoạ → "Âm thanh môi trường" (`qcworld-sfx`).
- **island.js (quanh đảo chính):** sóng vỗ theo khoảng cách tới bờ (to khi sát bờ, im ngoài ~55 m), gió, hải âu kêu (6–16 s/lần khi gần biển), **bước chân theo mặt đất** (cát / cỏ / đường nhựa-Downtown-trong nhà / sàn gỗ), tiếng "bịch" dừa rơi, "ting" nhặt vỏ sò.
- **ambience.js (toàn thế giới):** sóng ở mọi bờ nước khác (mờ dần khi về gần đảo chính r<135 để khỏi chồng tiếng); tiếng xe thật của 5 xe gần nhất trong 45 m (động cơ + lốp, theo tốc độ, lệch trái/phải theo vị trí), xe buýt trầm hơn, tiếng ồn phố xa; **tiếng người lầm rầm** (6 giọng tổng hợp: 4 người lớn nam/nữ + 2 trẻ em, nhân vật thấp <1,35 m hoặc nhãn 👧👦 là trẻ em, thỉnh thoảng cười khúc khích) theo người trong 22 m; **sủa/meo** của thú; **gõ phím** trong văn phòng (toà công ty); vào trong nhà thì tiếng ngoài trời nghe đục (lọc thấp 500 Hz) và nhỏ.
- **Nhạc sân khấu:** YouTube IFrame trong khung phải trên (xem 2.15, 2.17).

### 14. BẦU TRỜI, NGÀY ĐÊM, ĐỒ HOẠ (skyfx.js, world.html)

- **Ngày/đêm (phím N hoặc nút):** 3 mức: ☀️ Ngày (mặt trời cao 40°), 🌇 Hoàng hôn (3°, hệ số đêm 0,6), 🌙 Đêm (−5°, ánh trăng, sao 2200 điểm). Đêm: đèn đường, biển hiệu, cửa sổ, đuốc, đèn sân khấu toả sáng (tối đa 900 quầng sáng gộp); trong đảo đèn đường dùng 6 điểm sáng thật quanh quảng trường. Không có chu kỳ tự động (người chơi tự đổi; ngủ thì về Ngày).
- **skyfx.js:** lớp mây nhiễu 2 tầng trôi theo gió ở y=360 (tấm 7000×7000, nhuộm theo giờ), dãy núi xa ở chân trời (hình trụ r=2100, cao 260), trăng + quầng sáng chỉ ban đêm (cách 1900 m). Tắt khi vào trong toà.
- **Chất lượng đồ hoạ (nút ⚙):** Tự động / Thấp / Vừa / Cao, khoá 30 FPS tự động nếu không giữ nổi ~52 FPS, hậu kỳ điện ảnh bật/tắt, âm thanh bật/tắt. Mức Thấp: không bloom, ít cỏ, nước nhẹ, bóng tĩnh, bot không đổ bóng, bán kính ẩn người/bot nhỏ hơn.

### 15. PHÍM TẮT

| Phím | Tác dụng |
|---|---|
| W A S D / ←↑↓→ | đi (lái xe: W/S ga phanh, A/D lái) |
| Shift | chạy (đi 1,35 m/s → chạy 3,4 m/s; ×1,2 có giày, ×1,4 có tăng lực); xe: tăng tốc ×1,18 |
| Space | nhảy (vận tốc lên 5,2 m/s) |
| Kéo chuột / lăn chuột | xoay camera / zoom (2,2–22 m) |
| Q | đổi góc nhìn thứ nhất ↔ thứ ba |
| E | tương tác (điểm gần nhất) |
| F, phím 2 | nhảy múa bật/tắt |
| 1, 3, 4, 5, 6 | vẫy tay, đấm, cổ vũ/like, gật đầu, lắc đầu |
| C | ngồi/nằm ghế gần nhất (nhấn lại để dậy) |
| V | lên/xuống xe (dậy nếu đang ngồi) |
| T / Enter | chat |
| G | ném rác đang cầm |
| I / P | túi đồ / hồ sơ |
| M | bản đồ (kéo, lăn chuột 0,6×–9×; bấm biểu tượng để bay tới) |
| H | hướng dẫn |
| N | đổi ngày / hoàng hôn / đêm |
| J | nhiều người chơi |
| L / Y / O | laptop / máy nghe nhạc / điện thoại |
| Esc | đóng cửa sổ, rời màn hình, cất đồ, bỏ qua cắt cảnh |
| gõ "binhphan" | pháo hoa (easter egg) |

Bản đồ M liệt kê địa điểm `PLACES`: trong phạm vi này có world.html (Quảng trường trung tâm, Sân khấu QC Live, Bàn DJ + 8 khu zone = 11), life.js (Tháp Brand QA·QC·QE, Học viện QA, Chợ QC, Showroom xe, Văn phòng địa chính, Bến cảng, Khu dân cư, Nhà của bạn = 8), campus.js (Toà Giáo trình = 1), resort.js (Nhà nghỉ Hoa Sứ, Dãy Biệt thự Biển Xanh, Đảo Siêu biệt thự, Quán nước Ngắm Biển = 4); các module khác thêm nữa (chưa rõ trong phạm vi). Bản đồ vẽ địa hình thật nhìn từ trên xuống (độ phân giải mẫu 2 m, 3 px/m), xe buýt đang chạy 🚌, mũi tên vàng "Bạn ở đây" và tên vùng hiện tại (Đảo Master Dashboard / Trên cầu / Downtown / Phường / Khu Giải trí / Cao nguyên / Đảo nghỉ dưỡng / trong toà nhà).

### 16. DỮ LIỆU LƯU TRÊN MÁY (localStorage)

`qcworld-save` (tiền, đồ, buff, đất, thú, nhà, xe, thống kê, học tập, nhà nghỉ dưỡng, `mp`…), `qcworld-profile` (tên + nhân vật), `qcworld-eggs`, `qcworld-helped`, `qcworld-quality`, `qcworld-fpscap`, `qcworld-cine`, `qcworld-sfx`, `qcworld-screens` (chỉ số thẻ từng màn hình), `qcworld-brain` (văn bản + phân tích), `qcworld-phone`, `qcworld-pod-vol`, `qcworld-pod-bad2`, `qcworld-bugbest`, `qcworld-cardbest`, `qcworld-lapnotes`. Tệp dữ liệu: `data/questions.json`, `data/courses.json`, `data/characters.json` (+ ảnh đầu riêng tư), server cục bộ `serve.py` (các `/api/...`), `multiplayer_server.py`.

### 17. ĐIỂM CẦN LƯU Ý KHI THIẾT KẾ LẠI (phát hiện trong mã)

1. `buildHouse` dùng cho nhà trên lô đất; `buildTower`, `zoneProps` (nhà công cụ cũ) **còn trong world.html nhưng không được gọi** cho 8 zone (đã thay bằng quảng trường + màn hình).
2. Văn bản cũ chưa khớp vị trí thật: "Văn phòng địa chính" (life.js:620) và các câu bot nhắc "khu Thương mại"; mô tả xe đạp "~23 km/h" trong khi mã là 5 m/s ≈ 18 km/h.
3. Bot `clerk` (Chị Hoa, Anh Khoa, Cô Mai) và `fisher` hoạt động ở Chợ/showroom/địa chính (Phường) và cầu tàu phía Bắc; bot `walker` chọn điểm đến gồm cả Học viện và Chợ nên có thể đi rất xa.
4. Điểm đặt `CITY.places.academy` và `tower` là toạ độ cực; cửa thật (`city.academy.tx,tz`, `city.spots.brain`) do `city.js` quyết định (ngoài phạm vi).
5. Quy hoạch phân khu `CITY.sectors` chỉ giữ chỗ (không trồng cây ngẫu nhiên), không tự dựng công trình trong phạm vi này.
6. Vị trí cụ thể các vật đặt ngẫu nhiên (chòi lá, cứu hộ, thuyền thúng, dù, ghềnh đá, rặng dừa, rác, vỏ sò, lâu đài cát) dùng bộ sinh số hạt giống cố định nhưng phụ thuộc vật cản đã có nên cần chạy game mới có toạ độ.
7. `S.carModel` (mẫu ô tô đang dùng) không có trong trạng thái mặc định của life.js; do showroom đặt.

### 18. BẢNG TÓM TẮT KHÔNG GIAN

Giá trị x/z là khoảng bao ngoài (m); "≈" là tính từ công thức hoặc làm tròn; "xoay" là hình chữ nhật xoay theo trục khác nên khoảng bao chỉ gần đúng; "chưa rõ" là mã trong phạm vi không cho biết.

| Không gian | x0–x1 | z0–z1 | rộng×sâu | tầng | chức năng |
|---|---|---|---|---|---|
| 2.1 Đảo Master Dashboard | ≈ −71…77 (bán kính 69–89, phình Tây Nam) | ≈ −76…73 | ≈ 150×150 | 1 | đất liền miễn phí: tool, học, quiz, concert |
| 2.2 Đường vành đai | −46,5…46,5 | −46,5…46,5 | rộng 7 (r 39,5–46,5) | 1 | xe chạy vòng, tuần tra, chạy bộ |
| 2.3 Phân khu quy hoạch ×6 | cực: r 47–72 (Bến cảng 47–110) | theo góc | 6 sector | 1 | giữ chỗ khu dân cư/Brand QA/thương mại/bến cảng |
| 2.4 Quảng trường trung tâm + Cổng | −7,5…7,5 | −7,5…7,5 | 15×15 (đĩa tròn) | 1 | điểm xuất phát, cổng Trang chủ Dashboard |
| 2.5 Thư viện (wiki) | −30,6…−23,5 | −7,6…−0,5 | ≈ 7,1×7,1 | 1 | quảng trường Wiki + màn Kiến thức QA |
| 2.6 Bảng nhiệm vụ (plan) | −21,6…−14,5 | −22,6…−15,5 | ≈ 7,1×7,1 | 1 | quảng trường Plan + màn Chứng khoán |
| 2.7 Xưởng API | 14,5…21,6 | −22,6…−15,5 | ≈ 7,1×7,1 | 1 | quảng trường API Client + màn API |
| 2.8 Trạm Automation | 23,5…30,6 | −7,6…−0,5 | ≈ 7,1×7,1 | 1 | quảng trường Automation + màn Automation |
| 2.9 Hầm Database | 18,5…25,6 | 11,5…18,6 | ≈ 7,1×7,1 | 1 | quảng trường DB + màn Database |
| 2.10 Tiệm đồ nghề QC | −25,6…−18,5 | 11,5…18,6 | ≈ 7,1×7,1 | 1 | quảng trường QC + màn QC thực chiến |
| 2.11 Bưu điện Ghi chú | −14,6…−7,5 | 23,5…30,6 | ≈ 7,1×7,1 | 1 | quảng trường Notes + màn Tin báo |
| 2.12 Trạm Quick Link | 7,5…14,6 | 23,5…30,6 | ≈ 7,1×7,1 | 1 | quảng trường Links + màn Công nghệ |
| 2.13 Màn hình ốc đảo ×9 | 8 màn cạnh zone + flycam (4,9; 3,4) | xem 2.13 | màn 3,2×2,0 | 1 | tin tức, chứng khoán, công nghệ, tự học, flycam |
| 2.14 Lối gỗ | từ quảng trường ra zone/sân khấu | — | rộng 1,7 (2,2 lên sân khấu) | 1 | đường đi trên cát |
| 2.15 Sân khấu QC Live | −10…10 (hộp chặn −12,6…12,6) | −37…−28 | 20×9, cao 1,2 | 1 | biểu diễn, màn LED 15×8,4, đèn, loa |
| 2.16 Sàn nhảy LED | −7…7 | −27…−19 | 14×8 (28 ô) | 1 | nhảy theo nhạc, easter egg |
| 2.17 Bàn DJ | tâm 11,5 (xoay −0,5) | tâm −25,5 | 2,4×1,1 | 1 | chọn nhạc YouTube |
| 2.19 Bãi biển Đông Nam | tâm ≈ 39 | tâm ≈ 54,5 | bán kính ≈ 7 | 1 | dù, ghế, bàn picnic |
| 2.20 Chai thư | ≈ −67 | ≈ 25,3 | điểm | 1 | easter egg 1/3 |
| 2.21 Chòi lá ×6 | chưa rõ (ngẫu nhiên ven bờ) | chưa rõ | 4×4 | 1 | ngồi bàn / nằm võng |
| 2.22 Chòi cứu hộ ×2 | chưa rõ | chưa rõ | sàn 2,3×2,3, cao 2,6 | 1 (tầng gác) | ngắm biển |
| 2.23 Thuyền thúng ×6 | chưa rõ | chưa rõ | đường kính 2,1 | 1 | ngồi chơi |
| 2.24 Dù + ghế tắm nắng ×9 | chưa rõ | chưa rõ | ~3×3 | 1 | nằm nghỉ |
| 2.25 Ghềnh đá ×4, rặng dừa ×34, cua ×26, hải âu ×14 | ven bờ, chưa rõ | chưa rõ | — | 1 | cảnh quan sống động |
| 2.26 Mini-game bãi biển | trên bãi | — | 28 vỏ sò, 2 lâu đài | 1 | rung dừa, nhặt vỏ sò, đắp lâu đài |
| 2.28 Toà Giáo trình (ngoại thất) | −66…−50 (bệ −69…−47) | −11…11 (bệ −14…14) | 16×22 (bệ 22×28), cao 25,2 | 7 (sảnh + 6) | trường học miễn phí |
| 2.29 Sảnh tầng 0 | −18…18 (cảnh riêng) | −12…12 | 36×24 | 0 | thư viện, danh mục khoá |
| 2.30 Tầng 1–6 (mỗi tầng) | −18…18 | −12…12 | 36×24 | 1–6 | 3 phòng lớp học/tầng, tự học |
| 2.30a Phòng lớp loại 1 (−z) | −17,8…−2,4 | −11,8…−2 | 15,4×9,8 | 1–6 | lớp có giảng viên + 24 chỗ |
| 2.30b Phòng lớp loại 2 (−z) | 2,4…17,8 | −11,8…−2 | 15,4×9,8 | 1–6 | như trên |
| 2.30c Phòng lớp loại 3 (+x) | 4…17,8 | 2,6…11,8 | 13,8×9,2 | 1–6 | như trên |
| 2.31 Học viện QA (phòng thi) | −18…18 (cảnh riêng) | −12…12 | 36×24 | 1 | quiz kiếm tiền, 30 máy thi |
| 2.32 Tháp Brand QA + bộ não | tâm 0 | tâm 61 (não y=65) | tháp chưa rõ | chưa rõ | QA Brain (phân tích tài liệu → test case) |
| 2.34 Khu nghỉ dưỡng Tây Nam | ≈ −60…−14 | ≈ 15…66 | dải r 51–88 | 1 | thuê / mua nhà, ngủ, nấu ăn |
| 2.34 Nhà nghỉ Hoa Sứ (R1) | tâm −20,9 (xoay −0,37) | tâm 54,1 | 10×8, cao 2,8 | 1 | thuê 80 💰/ngày |
| 2.34 Biệt thự Biển Xanh 1 | tâm −34,3 (xoay −0,61) | tâm 49,2 | 13×10, cao 3,2 | 1 | mua 6.000 💰, hồ bơi |
| 2.34 Biệt thự Biển Xanh 2 | tâm −47,0 (xoay −0,90) | tâm 37,3 | 13×10, cao 3,2 | 1 | như trên |
| 2.34 Biệt thự Biển Xanh 3 | tâm −55,7 (xoay −1,19) | tâm 22,3 | 13×10, cao 3,2 | 1 | như trên |
| 2.35 Cầu gỗ sang ISLET | −68,6…−55,1 | 61,7…76,8 | 3×20,2 | 1 | nối đảo nghỉ dưỡng |
| 2.35 Đảo nhỏ ISLET | tâm −81,3 | tâm 91,0 | bán kính 24 (±2) | 1 | đảo siêu biệt thự |
| 2.35 Siêu biệt thự Hoàng Hôn | tâm −68,2 (xoay 1,12) | tâm 97,3 | 11,5×11, cao 3,6 | 1 | mua 30.000 💰, hồ bơi vô cực |
| 2.35 Siêu biệt thự Đại Dương | tâm −90,9 (xoay −0,73) | tâm 101,8 | 11,5×11 | 1 | như trên |
| 2.35 Siêu biệt thự Bình Minh | tâm −89,0 (xoay −2,58) | tâm 78,7 | 11,5×11 | 1 | như trên |
| 2.36 Quán nước Ngắm Biển | tâm 56,6 | tâm 25,3 | sàn tròn bán kính 6,5 | 1 | gọi nước 15–25 💰, ghế ngắm biển, khách bot |
| 2.36 Võng ×4 | ≈ 43…52 | ≈ 40…53 | 2,6 dài | 1 | nằm nghỉ |
| 2.37 Downtown | 136…262 | −62…62 | 126×124 | chưa rõ | trung tâm công ty (file khác) |
| 2.37 Phường Khởi Nghiệp | 136…262 | 56…480 | 126×424 | chưa rõ | chợ, showroom, đất ở, nhà trọ (file khác) |
| 2.37 Khu Giải trí | 274…394 | −60…60 | 120×120 | chưa rõ | sân bóng, concert, rạp (file khác) |
| 2.37 Cầu đảo MD ⇄ Downtown | ≈ 52…136 | −14…14 (bridgeW 28) | ≈ 84×28 | 1 | cầu xe + người (dựng ở file khác) |
| 2.37 Mạng đường (9 tuyến) | 136…262 | −62…470 | rộng 20 mỗi tuyến | 1 | xe ô tô, xe máy, vỉa hè 5 m |
| 2.37 Chợ QC / Showroom / Địa chính | 146 / 163 / 180 | 217,5 | chưa rõ | chưa rõ | mua đồ / xe / đất (toà do city.js) |
| 2.38 Lô đất ở R1–R4 | 143; 153,45; 163,9; 174,35 (±5) | 307 (±5) | 10×10 mỗi lô | 1 | 1.500–2.100 💰, xây nhà cấp 4 / biệt thự |
| 2.38 Lô đất ở R5–R8 | 143; 153,45; 163,9; 174,35 (±5) | 329 (±5) | 10×10 | 1 | 1.500–2.100 💰 |
| 2.38 Lô kinh doanh B1–B4 | 143; 153,45; 163,9; 174,35 (±5) | 351 (±5) | 10×10 | 1 | 3.000–4.200 💰, quán / trang trại |
| 2.39 Phòng trọ khởi nghiệp | chưa rõ (ward.js) | chưa rõ | 4 phòng | 1 | phòng 1 miễn phí, ngủ / làm nơi xuất hiện |
| Phao + cột mốc ngoài khơi | (96,30), (−74,−70), (44,−98), (−102,22), (70,82), (14,−112) | — | điểm | — | trang trí biển |

**Ghi chú về số lượng:** tài liệu có 40 mục không gian đánh số (2.1–2.39 + 2.34a), tương ứng khoảng 70 không gian cụ thể nếu tính riêng từng quảng trường zone, từng màn hình, từng nhà nghỉ dưỡng, từng loại phòng lớp học.

---

<a id="phần-2"></a>

## 02 – Hiện trạng kiến trúc: Downtown · Phường Khởi Nghiệp · Đại công viên Hồ Ngọc · mạng đường & giao thông

Tài liệu mô tả **đúng theo mã nguồn** (đọc ngày 15/11/2026). Chỗ nào mã không nói rõ ghi "chưa rõ". Không chép mã, chỉ tóm tắt số liệu.

**Quy ước toạ độ:** 1 ô = 1 m = 1 đơn vị. Trục x: Đông (+) – Tây (−). Trục z: Nam (+) – Bắc (−). y là độ cao (mặt đất thành phố ≈ 0,02–0,05). Hướng "mặt quay" tính theo `rot`/`face`: forward = (sin rot, cos rot).
**Viết tắt file:** `W` = world.html, `rd` = js/roads.js, `dt` = js/downtown.js, `ci` = js/city.js, `wd` = js/ward.js, `pk` = js/park.js, `cv` = js/civic.js, `tf` = js/traffic.js, `tr` = js/transit.js, `sl` = js/streetlife.js, `pd` = js/pedestrians.js, `jc` = js/jobcenter.js, `jb` = js/jobs.js, `nv` = js/nav.js.

---

### 0. Tổng quan bản đồ (suy ra từ `CITY` và mã dựng)

| Vùng | x0–x1 | z0–z1 | Ghi chú |
|---|---|---|---|
| Đảo Master Dashboard (vùng miễn phí) | bán kính ~74 quanh (0,0) | – | đường vành đai r=43 |
| Cầu dây văng đảo ⇄ Downtown | 46,5–137 | −14…+14 | rộng 28 m |
| Cổng "Rời đảo" | x=52 | −14,8…+14,8 | ranh giới miễn phí / thế giới mở |
| Downtown | 136–262 | −62…62 | nền đảo 126×124 |
| Phường Khởi Nghiệp | 136–262 | 56(62)–480 | đất liền nối bờ Nam Downtown |
| Đại công viên Hồ Ngọc | 156–242 (đất trong rào 161,5–236,5) | 10–190 (rào 15,5–184,5) | nằm giữa 4 con đường |
| Khu Giải trí (arena, ngoài phạm vi) | 274–394 | −60…60 | cầu ngắn 12 m rộng 10 m từ x=262 |

Các **khối phố** do lưới đường tạo ra (ô chữ nhật giữa các đường, tính từ `CITY.roads`):
- Downtown Bắc: (A) x 136–168 và (B) x 188–262, z −62…−10 (Trục Bắc x=178 cắt đôi). 7 toà công ty ở đây.
- Công viên: x 156–242, z 10–190 (kẹp giữa Đại lộ ven Tây x=146, ven Đông x=252, Đại lộ Hồ Ngọc z=0, Phố chính z=200).
- Phường **Khối A** x 136–189, z 210–280 (chợ, showroom, địa chính, nhà trọ, bếp, Trung tâm Việc làm).
- Phường **Khối B** x 209–262, z 210–280 (bệnh viện, trạm cứu hoả).
- Phường **Khối C** x 136–189, z 300–370 (12 lô đất).
- Phường **Khối D** x 209–262, z 300–370 (trường tiểu học).
- Phường **Khối Nam** x 136–189 và 209–262, z 390–460 (6 toà công ty, cửa quay ra z=380 hoặc z=470).

Phát hiện quan trọng khi quy hoạch lại:
1. Hai đại lộ ven Tây (x=146) và ven Đông (x=252) rộng 20 m nên mép ngoài đúng bằng mép đất (136 và 262) → **chỉ có vỉa hè phía công viên**, phía ngoài là mép bản đồ/lan can.
2. Các đường z=290, 380, 470 **chỉ nối với nhau qua đường x=199**; không nối với x=146/x=252 (hai đường này dừng ở z=200). Đầu đường z=290/380/470 ở x=136 và x=262 là **đường cụt**.
3. Đường z=470 (460–480) trùng mép Nam (z=480) nên không có vỉa hè phía Nam.

---

### 1. Khối `CITY` trong world.html

**Tên:** Khối quy hoạch `CITY` – W:237–283.
- `CITY.road` = đường vành đai đảo: r=43, rộng 7 (`ROAD`, W:236).
- `CITY.sectors` (W:238–245): 6 vùng dành riêng trên đảo không trồng cây ngẫu nhiên (Khu dân cư a −0,5…0,5; Khu dân cư 2; Brand QA; Thương mại ×2; Bến cảng), góc a tính từ Đông theo chiều kim đồng hồ (π/2 = Nam).
- `CITY.lots` (W:249–252): **12 lô đất ở khối C**: R1–R8 (kind `home`, giá 1500 + (i%3)×300 → 1500/1800/2100), B1–B4 (kind `biz`, giá 3000/3400/3800/4200). Toạ độ: x = 143 + (i%4)×10,45 (143; 153,45; 163,9; 174,35); z = 307 (R1–R4), 329 (R5–R8), 351 (B1–B4); `rot=π` (nhà quay mặt về Bắc, ra phố z=290 / lối trong khối).
- `CITY.places` (W:253–254): shop (146; 217,5), showroom (163; 217,5), landOffice (180; 217,5) – cùng rot π; đảo: tower = cực (π/2, 61) → (0; 61), academy = cực (π/2−0,3; 55) → (≈16,3; 52,5), boathouse = cực (−π/2−0,13; 62) → (≈−8,0; −61,5).
- `CITY.downtown` = {x0:136, x1:262, z0:−62, z1:62, bridgeW:28} (W:257).
- `CITY.ward` = {x0:136, x1:262, z0:56, z1:480, slabZ0:62, street:86, links:[146,252], main:200} (W:260).
- `CITY.roads` (W:263–274): `hw`=10, `walk`=5, làn: median 0,4; car 3,3; moto 2,6; tim làn a=2,05, b=5,35, m=8,3 m cách tim đường; 10 đoạn đường (xem mục 2).
- `CITY.gateX` = 52 (W:275). `CITY.arena` = {x0:274, x1:394, z0:−60, z1:60, bridgeW:10} (W:277).
- `inDT(x,z,pad)` = trong Downtown ∪ Phường ∪ Arena (W:281). `regionAt` = 'open' nếu trong `inDT`, hoặc x>52 và |z|<15,5 (cầu), hoặc thuộc `EXTL` (đất mở rộng do module khác đăng ký); ngược lại 'island' (W:283).
- `PR`=0,35 bán kính người chơi; `WATER_Y`=−0,35; `TS`=320; `ISLAND_R`=74 (W:228–231).

---

### 2. MẠNG ĐƯỜNG (rd:1–36, W:263–274, tf, dt:44–66)

#### 2.1 Trục đường (đúng thứ tự trong `CITY.roads.segs`, mỗi đường rộng 20 m, vỉa hè 5 m mỗi bên)

| # | Tên | Trục | Phạm vi | Mặt đường |
|---|---|---|---|---|
| 1 | Đại lộ Hồ Ngọc | z=0 | x 136–262 | z −10…10 |
| 2 | Trục Bắc | x=178 | z −62…0 | x 168–188 |
| 3 | Đại lộ ven Tây | x=146 | z 0–200 | x 136–156 |
| 4 | Đại lộ ven Đông | x=252 | z 0–200 | x 242–262 |
| 5 | Nhánh cầu Đồi Brand QC | z=86 | x 252–262 | z 76–96 (ngắn 10 m) |
| 6 | Phố chính Phường Khởi Nghiệp | z=200 | x 136–262 | z 190–210 |
| 7 | Đường Trường Học | x=199 | z 200–470 | x 189–209 |
| 8 | Đường Bệnh Viện | z=290 | x 136–262 | z 280–300 |
| 9 | Đường Cao Ốc Nam | z=380 | x 136–262 | z 370–390 |
| 10 | Đường Ven Biển Nam | z=470 | x 136–262 | z 460–480 |

Ngoài `CITY.roads` còn có đường nối ngoài phạm vi: **cầu đảo** (z=0, x 48,5–136, 20 m + 2 lối bộ hành, do dt dựng), **cầu Khu Giải trí** (x 262–274, chỉ 7 m lòng đường: z ±3,5 + lối bộ 3,5–4,85, tf:36,116–125), **cầu Cao nguyên** tại x=178 từ z=−62 ngược lên (tf:36 dùng `highland.landZ`, giá trị chưa rõ), **đường vành đai đảo** (ci, mục 12).

#### 2.2 Mặt cắt ngang một con đường 20 m (tính từ tim)
- Tim đôi vàng ở ±0,11–0,27 m (đường nét liền), 2 làn ô tô mỗi chiều 3,3 m + 1 làn xe máy 2,6 m. Vị trí tim làn theo `CITY.roads.lane`: A = 2,05 m, B = 5,35 m, xe máy = 8,3 m.
- Vạch sơn dựng bằng hình thật (tf:47–77): trắng đứt tại ±3,5 (giữa 2 làn ô tô, đoạn 2,4 m cách 4,5 m); trắng liền tại ±6,8 (ô tô | xe máy); mép trắng 9,58–9,75 m; chữ "XE MÁY" sơn trên làn xe máy cách ~24 m; đinh phản quang vàng tim đường mỗi 9 m; vạch dừng trước vạch qua đường (cách mép ngã tư 1,4+2,8+0,6…). Sơn sáng hơn ban đêm.
- Bó vỉa nổi 0,24×0,14 m tại ±10,12 (dt:63–66). Vỉa hè lát gạch 5 m (10–15 m từ tim). Mặt nhựa vẽ trên texture phẳng (dt:49–62) ở Downtown và bằng các mảnh nhựa (wd:180–186) ở Phường.
- Đèn đường: `lampPost` cách mép đường 0,9 m, bước 22 m, bỏ gần cửa toà/các `places` (dt:177–181).
- Cây vỉa hè (shade/purple/flame): cách mép 1,5 m, bước ~11 m (máy yếu 14 m); chậu hoa/bồn 1,15 m, bước ~22 m (28 m); mỗi toà có 2 chậu lớn cạnh cửa (pk:624–651).
- Người đi bộ: lối chuẩn cách mép 2,8 m (tức ±12,8 m từ tim, thẳng tâm vạch qua đường), tránh vật cản bằng Viterbi (pd:21–80).

#### 2.3 Ngã giao (tính từ mã `roadNet`, rd:12–20)
10 ngã giao, **tất cả đều có đèn** (quy tắc: ≥3 nhánh có đèn; 2 nhánh góc chữ L không đèn). Chú thích đầu tf:2 ("6 ngã tư + 2 ngã ba") là cũ.

| # | Toạ độ | Loại | Nhánh (độ dài tính từ tim ngã) | Vạch qua đường |
|---|---|---|---|---|
| J0 | (178; 0) | ngã ba T | B 62 · T 42 · Đ 84 | 3 |
| J1 | (146; 0) | ngã ba T | N 200 · T 10 · Đ 116 | 2 (N, Đ) |
| J2 | (146; 200) | ngã ba T | B 200 · T 10 · Đ 116 | 2 (B, Đ) |
| J3 | (252; 0) | ngã ba T | N 200 · T 116 · Đ 10 | 2 (N, T) |
| J4 | (252; 86) | ngã ba T | B 86 · N 114 · Đ 10 | 2 (B, N) |
| J5 | (252; 200) | ngã ba T | B 200 · T 116 · Đ 10 | 2 (B, T) |
| J6 | (199; 200) | ngã ba T | N 270 · T 63 · Đ 63 | 3 |
| J7 | (199; 290) | **ngã tư** | B 90 · N 180 · T 63 · Đ 63 | 4 |
| J8 | (199; 380) | **ngã tư** | 4 nhánh | 4 |
| J9 | (199; 470) | ngã ba T | B 270 · T 63 · Đ 63 | 3 |

Tổng **27 vạch qua đường**, mỗi vạch rộng 2,8 m, cách mép ngã tư 1,4 m (tâm cách tim ngã 12,8 m); chỉ đặt cho nhánh dài hơn 16 m. Nhánh 10 m (J1/J2/J3/J4/J5) không có vạch.

#### 2.4 Đèn tín hiệu (tf:24–114)
- Chu kỳ 32 s, mỗi ngã lệch pha `i×5,3 s`: trục dọc (Bắc–Nam) xanh 0–13 s, vàng 13–16, đỏ cả 2 hướng 16–17; trục ngang (Đông–Tây) xanh 17–28 s (**11 s**, không phải 13 s như chú thích), vàng 28–31, đỏ 31–32.
- Cột đèn người đi bộ ở 4 góc ngã (cách tim 11,1 m) khi đất tồn tại; cột đèn xe (tay vươn 5,9 m trên làn ô tô, đầu đèn cao 4,95 m, cột cao 5,9 m) cho mỗi nhánh có xe đi vào. Góc ngã (146; 0) phía cầu đảo không có đất → cột dựng trên lối bộ hành cầu.
- Người đi bộ chỉ được qua khi đèn trục **đang cắt** ở trạng thái đỏ; xe/taxi/buýt dừng qua hàm `limit()` (đèn đỏ, giữ khoảng cách, nhường người).

#### 2.5 Lối bộ hành nâng cao trên 3 cầu (tf:116–125)
Khu Giải trí và Cao nguyên: dải lát 1,35 m rộng, cao 0,17 / 0,235 m, bó vỉa riêng; cầu đảo do dt dựng (mục 3).

#### 2.6 Lưới taxi (đồ thị đường, tr:375–390)
86 nút: 64 nút vành đai (r=43) + 22 nút của `CITY.roads` (đầu mỗi đoạn và mọi ngã giao). Ba đường ngoại lệ: nút vành đai (43;0) nối (136;0) bằng cầu; hills/arena/highland tự thêm nối (262;86), gần (262;0), gần (178;−62) (chưa rõ trong phạm vi này).

---

### 3. DOWNTOWN (dt, đảo trung tâm thương mại)

#### 3.1 Nền đảo + kè đá
**Tên:** Nền Downtown – dt:37–43.
- **Vị trí/kích thước:** x 136–262, z −62…62 → **126 × 124 ô**; khối đá dày 8 m (rộng 130×128, mặt trên ≈ y 0,02) với mặt lát gạch lặp; plane mặt đất y=0,03 phủ texture 3072 px (máy yếu 2048) vẽ gạch vỉa hè 0,5 m + mặt nhựa theo `CITY.roads`.
- **Lan can:** thanh kim loại y=1,0 ở cạnh Bắc (z=−63), Đông (x=263), Tây (x=135, **chừa cầu |z|<14,5**); **bờ Nam để trống** nối liền Phường.
- **Chức năng:** mặt bằng chính của thành phố.
- **Kết nối:** cầu dây văng phía Tây (z=0); đường x=146/x=252 chạy xuống Nam; Trục Bắc (x=178) lên cầu Cao nguyên; Đại lộ z=0 sang cầu Khu Giải trí phía Đông.

#### 3.2 Cầu dây văng nối đảo chính ⇄ Downtown
**Tên:** Cầu dây văng – dt:67–97.
- **Vị trí/kích thước:** x 46,5–137 (dài 90,5 m), z −14…14 (**rộng 28 m**), mặt cầu y≈0 (mặt nhựa trên 0,15), ván bê tông dày 0,3. Ở 2 bên có **lối bộ hành nâng** cao mặt 0,33 m, rộng 4 m, tâm z=±12.
- **Bố trí:** mặt nhựa 20 m đúng chuẩn đường thành phố (2 vạch vàng tim, trắng ±6,8 và ±9,7, vạch "ngựa" ngắn ở ±3,5); bó vỉa trắng; lan can thật: trụ cao 0,95 m mỗi 2 m, 2 thanh ngang (cao 1,05 và 0,6), tại z=±13,9; bốn hộp chặn (collider) sát lan can; **trụ đá** (cylinder r 0,55–0,65, cao 6) ở x=74…<137 bước 8 m, tại z=±3,5 và ±10 chìm dưới biển (y −3).
- **Tháp dây văng:** tại x=104, 2 tháp trắng cao 26 m (1,4×1,4) ở z=±14,9, thanh ngang nối ở độ cao 23; 6 dây mỗi phía × 2 hướng (tổng 24 dây) toả ra bước 4,2 m.
- **Đèn:** `lampPost` mỗi 16 m từ x=60 đến cầu, z=±13,4.
- **Nhãn:** "🏙️ Downtown · QC City" tại (140; 9; 0).
- **Kết nối:** đầu Tây tại vành đai đảo (x≈46,5, ở vòng ngoài r=46,5) + **cổng Rời đảo x=52**; đầu Đông vào ngã ba (146; 0).

#### 3.3 Đèn đường Downtown
Mọi vỉa hè đều có `lampPost` (không đặt trong 4,6×5 m quanh cửa toà hay 6 m quanh `places`). Nhãn và bản đồ: PLACES "Downtown · QC City" teleport tới (144; −12,5) nhìn (176; −12,5) (dt:183).

---

### 4. CÁC TOÀ CÔNG TY CAO TẦNG (dt:100–175)

**Quy tắc chung mỗi toà** (hàm `build`, dt:119–174; mặt trước = phía `face`):
- **Đế/sảnh (podium):** hộp mặt dark `min(6, h×0,12)` m cao, rộng thêm 1,2 m mỗi chiều, mái trim (rộng +1,6, dày 0,4). Thân từ độ cao `podium+0,4`.
- **Lối vào** (dt:151–159) gắn ở mặt `face`: tường kính 5×3,2 m, mái hiên 6,4×3 m cao 3,6, 2 cột kim loại, bảng tên đèn 8×1,3 m nhạt. **Cửa (điểm E)** ở (t.x; t.z + face×(d/2+2,3)), vòng sáng vàng nhấp nháy bán kính 1–1,25 m trên đất, `INTER` bán kính 2 m.
- **Va chạm:** 1 hộp x ±(w/2+0,8), z ±(d/2+0,8).
- **Số tầng hiển thị** = `round(h/3,6)`.
- **Nhãn nổi:** "🏢 Tên – N tầng · bấm E để vào" ở y=6,2 phía trên cửa (fade 70 m). Toà khoá: "🔒 … Bảo vệ canh cửa · chỉ nhân viên".
- **Tương tác E:** đã là nhân viên → "💳 Đi làm ở …"; toà khoá chưa là nhân viên → bảo vệ báo "khách chỉ ở sảnh, phòng phỏng vấn ở bên phải sảnh"; sau đó `interior.enter(t)` (nội thất do phiên khác mô tả).
- **Khoá:** `locked:true` → có **bảo vệ** (model soldier, cao 1,78 m) đứng cạnh cửa ở (door.x+2,4; door.z − face×0,6). Bảo vệ tên luân phiên: Tâm, Phúc, Kiên.
- **PLACES/bản đồ:** toà không khoá đều có mục bản đồ, teleport tới cửa ±1,5.
- **Ban đêm:** cửa sổ sáng + LED viền (cường độ phụ thuộc `W.night`).

Kiểu mặt tiền: 4 texture thủ tục (glass, concrete, brick, dark); mỗi ô texture = 4 cột × 4 tầng (6,4 × 14,4 m).

#### 4.1 Bảy toà ở Downtown (phía Bắc)

| Toà | Tâm (x; z) | Rộng×sâu×cao | Tầng | Kiểu | Quay mặt (cửa) | Khoá | Teams |
|---|---|---|---|---|---|---|---|
| **Bình Phan Tech Hub** | (203; −24) | 22×18×96 | 27 | `hq`: thân kính + 4 cột trim góc, khối đỉnh 0,7w × 6 m, trực thăng cylinder r=0,3w, vòng LED vàng, cột anten | +z (Nam) cửa (203; −12,7) | không | qa, dev |
| **AutoQA Labs** | (226,5; −24) | 16×16×84 | 23 | `twist`: ~22 tầng kính 3,5 m xoay dần 0–90°, LED đỉnh xanh dương | +z, cửa (226,5; −13,7) | không | qa, dev |
| **PerfMax Performance** | (250; −24) | 18×18×70 | 19 | `cylinder`: trụ kính r=9 + dải LED xoắn ốc tím + vành LED đỉnh | +z, cửa (250; −12,7) | không | perf |
| **Manual Test Studio** | (152; −25) | 16×14×28 | 8 | `brick`: gạch đỏ, mái trắng + 3 cụm máy | +z, cửa (152; −15,7) | không | qa |
| **SecureQA** | (152; −48) | 12×12×46 | 13 | `dark`: kính tối, 4 cột trim | −z (Bắc) cửa (152; −56,3) | **có** (bảo vệ) | sec |
| **QA Federation** | (205; −48) | 18×14×88 | 24 | `artdeco`: 3 bậc 100%/80%/60% w, 3 khối LED vàng + cột 16 m | −z, cửa (205; −57,3) | không | qa, data |
| **Mobile First QA** | (240; −48) | 22×14×34 | 9 | `brick` | −z, cửa (240; −57,3) | không | mobile |

Hàng Nam (z≈−24) cửa quay ra Đại lộ Hồ Ngọc; hàng Bắc (z≈−48) cửa quay ra bờ biển phía Bắc (z −56…−57, sát mép đất z=−62).
Ghi chú sảnh: mọi toà dùng chung khối lối vào nêu trên; **sảnh bên trong** (phỏng vấn, quẹt thẻ) do phiên khác mô tả.

#### 4.2 Sáu toà ở khối cao ốc Nam (Phường, z 390–460)

| Toà | Tâm (x; z) | Rộng×sâu×cao | Tầng | Kiểu | Cửa | Khoá | Teams |
|---|---|---|---|---|---|---|---|
| **BugBusters Inc.** | (152; 404) | 24×18×72 | 20 | `setback`: 3 tầng thu nhỏ 0,78× mỗi bậc, vành LED đỏ | −z, cửa (152; 392,7) | không | qa |
| **API Hub Tower** | (224; 403) | 17×17×108 | 30 | `spire`: chóp 4 mặt xoay 45°, anten 14 m + đèn đỏ | −z, cửa (224; 392,2) | không | dev, qa |
| **DataCheck Corp** | (250; 402) | 20×16×60 | 17 | `glass` | −z, cửa (250; 391,7) | không | data |
| **Cloud Test Co.** | (158; 446) | 20×14×50 | 14 | `setback` | +z, cửa (158; 455,3) | không | perf, dev |
| **DevOps Center** | (176; 401) | 13×12×40 | 11 | `dark` | −z, cửa (176; 392,7) | **có** (bảo vệ) | dev |
| **Contract Testing Ltd** | (232; 448) | 10×10×44 | 12 | `cylinder` | +z, cửa (232; 455,3) | không | qa |

Bốn toà hàng trên (BugBusters, DevOps, API Hub, DataCheck) mở ra Đường Cao Ốc Nam (z=380); hai toà hàng dưới (Cloud Test, Contract) mở ra Đường Ven Biển Nam (z=470).

**Tổng:** 13 toà (7 + 6), 2 toà khoá (SecureQA, DevOps Center).
**Teams → phòng:** qa → Phòng QA Manual / QA Automation; dev → Dev Backend / Dev Frontend; perf → Performance / SRE; sec → Pentest / SOC; data → Data QA / BI; mobile → Mobile QA / Lab thiết bị (dt:100).

**Tương tác tuyển dụng (jb:37–40, 195–210):** phỏng vấn tại phòng phỏng vấn trong sảnh (5 câu hỏi QA, sai 1 câu là trượt, thử lại sau 2 phút). Đậu → thẻ nhân viên, chấm công mỗi ngày khi vào toà: **60 💰** (toà khoá 120 💰). Công việc trí tuệ +25%, việc chân tay/ca làm +10%.

---

### 5. PHƯỜNG KHỞI NGHIỆP (wd, ci, jc)

#### 5.1 Nền phường
**Tên:** Nền Phường Khởi Nghiệp – wd:174–190.
- **Vị trí:** x 136–262, z 62–480 (mặt đất ward từ z=62; khối đá từ z=64 đến 482, dày 8 m). Gạch vỉa hè lặp 4 m; mặt nhựa từng đoạn đường vẽ từ `CITY.roads` (polygonOffset để nằm trên nền).
- **Lan can:** cạnh Tây (x=135), Đông (x=263), Nam (z=481) – trang trí; cạnh Đông liền 1 đoạn (hills.js tự cắt khe cầu ở z=86).
- **Nhãn:** "🌱 Phường Khởi Nghiệp" tại (160; 9; 214).
- **Kết nối:** liền Downtown ở z≈56–62 (bờ Nam để trống); nhánh z=86 ra cầu Đồi Brand QC (x=262, hills.js).

#### 5.2 Chợ QC · Showroom xe · Văn phòng địa chính (ci:108–111, W:253)
Ba "nhà" dùng chung mẫu `buildHouse` (nhà 5,4×4,6 m, tường cao 3,0, mái hai mái 30°; sàn đứng 6,2×2,4; ci:16–25).
- Chợ QC (146; 217,5), Showroom xe (163; 217,5), Văn phòng địa chính (180; 217,5): `rot=π` quay mặt về Bắc (phố chính z=200). Vòng sáng tương tác cách tâm ≈ 5,9 m về phía trước (z≈211,6), nhãn y=7,6.
- Va chạm tròn r=3,25 mỗi nhà. Màu nhấn: chợ cam 0xd05f28, showroom xám 0x3a3f4b, địa chính nâu 0x8b6a2e.
- Chức năng: chợ (đồ dùng/vé/mồi/thuê thuyền), showroom (xe máy · ô tô), địa chính (mua đất · xây nhà · mở quán). Chi tiết giao dịch nằm ở life.js (ngoài phạm vi: **chưa rõ**).
- Taxi: mỗi nơi có điểm đến taxi (tr:416).

#### 5.3 Nhà trọ khởi nghiệp
**Tên:** Nhà trọ khởi nghiệp – wd:200–218.
- **Vị trí:** x0=139, tâm z=235,5; **4 phòng × 7,2 m = 28,8 m rộng**, x 139–167,8; thân sâu 5,2 (z 232,5–237,7), nền đá 6,6; collider x 138,7–168,1, z 232,4–237,8; cao 3,1 (tường), mái 5 tấm tôn xám nghiêng đến y≈3,7.
- **Bố trí:** mỗi phòng: cửa gỗ 1,1×2,2 (4 màu: xanh dương, nâu, xanh lá, tím) ở trái, cửa sổ kính 1,3×1 ở phải, biển số phòng 1–4; phòng 2–4 có xe đạp + chậu cây trước cửa (vách ngăn nâu nhạt). Biển "🛏️ NHÀ TRỌ KHỞI NGHIỆP" 10×1,1 m ở y 3,0.
- **Điểm vào phòng** (`spots.tro.rooms`): x = 141,0 / 148,2 / 155,4 / 162,6, z=238,7.
- **Chức năng:** phòng trọ miễn phí (phòng 1 cấp cho người mới). Logic thuê/ngủ ở life.js (ngoài phạm vi, **chưa rõ**).
- **Bản đồ:** "🛏️ Nhà trọ khởi nghiệp".

#### 5.4 Quầy Bếp Cơm
**Tên:** Quầy Bếp Cơm Khởi Nghiệp – wd:220–230. Tâm (180,5; 238), quầy đỏ gạch 4,4×1,05×1,6 + mặt trắng, tường sau 4,4×2,6, mái bạt sọc cam, 3 nồi inox; collider x 178,2–182,8, z 236,9–239,5. Điểm làm việc (180,5; 240,6). Việc phụ bếp (jb:46, 84–112): nhận ở Trung tâm Việc làm: dễ/vừa/khó = 3/5/8 món, 100/130/160 s, thưởng 30/60/100 💰.

#### 5.5 Trung tâm Việc làm (tháp 11 tầng) – jc:19–153
**Tên:** Trung tâm Việc làm QC – jc:19–55.
- **Vị trí:** x 166–186 (20 m), z 256–273 (17 m); sảnh kính cao 8 m (2 tầng), **thân tháp** 16×12,6×38 m đặt tại (176; z=262,9) trên sảnh, tổng chiều cao ≈ 47 m (nhãn 11 tầng), cổng chính quay Nam ra phố z=290 (cửa rộng 3,2 m tại z=273), mái hiên 7×3,4 m cao 3,9 với 2 cột.
- **Sảnh (đi vào được):** tường Bắc trắng dày 0,3; 2 tường Tây/Đông; mặt Nam kính 8 m; sàn bóng; **quầy thông tin** (cung tròn r=2,2, 1,4π) ở (176; 265,7), điểm E ở (176; 268,5) "Quầy thông tin – việc chân tay · việc trí tuệ · xin việc công ty"; **màn hình "Việc nóng hôm nay"** 9×4,5 m trên tường Bắc.
- **10 quầy nghề** (3×1,1 m, bảng hiệu sáng): 4 quầy tường Bắc ở x 169; 173,67; 178,33; 183 (z≈257,4, cửa quầy cách 1,5 m về phía Nam): ☕ Pha chế · 🛍️ Bán hàng phố ẩm thực · 🌻 Làm vườn · 👮 Bảo vệ tuần tra; tường Tây 3 quầy x=167,4, z 260/264/268: 🔧 Sửa đèn đường · 🛵 Giao đồ ăn · 🚕 Chở khách; tường Đông 3 quầy x=184,6, z 260/264/268: 🧭 Hướng dẫn viên · 🎣 Ngư dân · 🧽 Rửa xe showroom.
- **Nhân vật:** 10 nhân viên tư vấn ngồi ghế xoay sau mỗi quầy (áo xanh navy; tên "<tên ngẫu nhiên> · tư vấn nghề"; tay đặt trên đùi, nghiêng đầu khẽ). Không có thoại.
- **Camera:** khi bước vào sảnh, camera bị giới hạn trong hộp x 166,5–185,5, z 256,5–272,5, y<7,4.
- **Tương tác (E):** quầy nghề → modal 3 mức (dễ/vừa/khó): số việc 3/5/8, thời hạn 240/330/420 s (taxi/giao đồ ăn/hướng dẫn +120 s); lương (💰): Pha chế 50/95/150 · Bán hàng 55/100/160 · Làm vườn 40/75/120 · Bảo vệ 45/85/130 · Sửa đèn 45/90/140 · Giao đồ ăn 60/110/170 · Chở khách 70/120/180 · Hướng dẫn 60/105/160 · Ngư dân 40/85/130 · Rửa xe 40/80/125. Nhân viên công ty +10%. Cột sáng vàng (cylinder cao 30 m) chỉ chỗ làm; HUD thời gian ở đầu màn hình; có nút "Nghỉ ca" (xác nhận); hết giờ không có lương.
- **Điểm làm việc (từ mã):** Pha chế tại quầy café (Ngắm Biển/Bug Free – ở Đồi, ngoài phạm vi); Bán hàng tại Phố ẩm thực (x≈300–310, z 101,4/106,6); Làm vườn trên đảo (r 14–36); Bảo vệ tại góc các ngã tư (ix±(hw+2,4)); Sửa đèn đường (đèn x>136, z<480); Giao đồ ăn (nhận ở (321; 104), giao tới Sky QC Residence/toà công ty/cổng khu biệt thự); Chở khách (nút x>130 của đồ thị); Hướng dẫn (đảo (−2; 30), cổng Bắc công viên (199; 13), phố ẩm thực (292; 104) + 2 nơi khác tuỳ module); Ngư dân tại cuối cầu tàu (0; −98), phao ở (0; −103,5); Rửa xe trước Luxury Showroom.
- **Điểm tương tác bảng việc cũ:** `ward.spots.jobCenter` = (176; 277,4) (wd:199); teleport bản đồ tới (176; 278,0) nhìn (176; 264,5) (jc:151).
- **Kết nối:** cửa ra Đường Bệnh Viện (z=290); trạm buýt "Bệnh viện · Trạm cứu hoả" không gần, gần nhất là "Phường Khởi Nghiệp · Chợ QC".

#### 5.6 Việc làm tay chân và việc trí tuệ (jb)
**Tên:** Hệ thống việc làm (modal "Trung tâm Việc làm", 4 tab) – jb:1–221.
- Tab 💪 chân tay: 🧹 Dọn rác phố (5/10/15 cụm, 240/360/420 s, 35/70/110 💰, rác trên vỉa hè Downtown + Phường), 📦 Giao hàng (nhận ở Chợ QC rồi giao tới Phường/Downtown/đảo trong 150/200/280 s, 40/80/140 💰), 🍳 Phụ bếp (30/60/100 💰).
- Tab 🧠 trí tuệ: SQL, API/JSON, tìm bug, thiết kế test, code JS (nạp `data/jobs.json`; số bài và mức thưởng **chưa rõ** vì dữ liệu ngoài phạm vi); làm lại bài đã xong = 25% thưởng.
- Tab 🏢 xin việc công ty: danh sách 13 toà, "Chỉ đường tới sảnh" gắn cột sáng 2 phút ở cửa toà.
- Tab 📊 hồ sơ.
- **Tương tác:** bảng việc (E ở quầy thông tin).

#### 5.7 Lô đất ở (khối C) – dữ liệu trong `CITY.lots`
12 lô (8 nhà ở R, 4 kinh doanh B), vị trí đã nêu ở mục 1. Mỗi lô quay mặt Bắc. Cây hoa 3 bồn trước 3 lô R đầu (bed tại l.x ± 4,2, l.z − 6,2 theo hướng, ci:147). Phần xây dựng/mua nằm ở life.js (**chưa rõ**).

#### 5.8 Cổng "Rời đảo"
**Tên:** Cổng Rời đảo – wd:232–244. Tại x=52: 2 trụ đá 1,1×6,4×1,1 ở z=±14,8 (mũ xanh 0x1d6fd8), dầm 1,2×1,5×30,8 ở y=6,2; 2 bảng 28+2,4 m: phía Đông "🌆 THẾ GIỚI MỞ ➜" (nền xanh đen), phía Tây "⬅ 🏝️ ĐẢO MASTER DASHBOARD" (nền xanh lá). Collider tròn r 0,8 mỗi trụ. Điểm `spots.gate`=(52; 0). Teleport bản đồ "Cổng Rời đảo" tới (46; 0) nhìn (62; 0).
**Chip vùng:** thanh trên cùng hiện "🌆 Thế giới mở" / "🏝️ Đảo MD · miễn phí"; toast khi qua ranh giới (kiểm 0,4 s/lần).

---

### 6. ĐẠI CÔNG VIÊN HỒ NGỌC (pk, 1033 dòng)

#### 6.0 Khung chung
**Tên:** Đại công viên Hồ Ngọc (QC City Central Park) – pk:1–1033.
- **Vị trí:** `PK` = x 161,5–236,5 (**75 ô**), z 15,5–184,5 (**169 ô**), nằm trong lô x 156–242, z 10–190; hàng rào giậu (hedge) cách mép 0,3 m, cao ≈0,25–0,6.
- **Tâm hồ `LC`** (199; 101). Mặt nước y=0,15. Công tắc gỡ lỗi: `localStorage['qcworld-park']='off'` → bỏ cả công viên.
- **Kết nối:** cổng Bắc (z=16), cổng Nam (z≈184,5, khe giậu x 195,4–202,6 và lối lát x 197,4–200,6, z 177,5–184,5), cổng Tây/Đông tại trục cầu z=101±2,6 (khe giậu), nối thẳng ra vỉa hè đại lộ ven Tây (x=146 → vỉa hè 156–161) và ven Đông. Bản đồ: teleport chính (199; 19,8). Taxi: điểm đến thêm "Cổng Đông (bến thuyền)" tại (252; 101) và "Cổng Nam (sân khấu)" tại (199; 200).
- **Mặt đất:** cỏ y 0,036; đường chạy y 0,05; sàn gỗ y 0,06; đá viền hồ; lối lát (pavé) y 0,046.
- **Cây:** 7 loại – tall (cổ thụ thân 6 m, tán tới ≈11,5 m), shade, flame (phượng, hoa đỏ cam), purple (hoa tím), willow (liễu rủ có rèm), cone (tùng) và bamboo (trúc). Cây gộp khối theo vùng 64×60 m, lay gió.
- **Âm thanh nền:** chim hót ban ngày (tần số 2600–4400 Hz), dế kêu ban đêm; nghe được khi cách công viên <30 m.
- **Hiệu năng:** NPC/cá/chim chỉ chạy khi bạn ở trong ≤38 m (tắt khi >52 m); NPC ẩn khi cách camera >85 m (60 m máy yếu).
- **Số nhân vật:** 29 NPC (máy yếu bớt: 2 người chạy bộ, 2 học viên yoga, không có cặp picnic) + chó Bé Vàng.

#### 6.1 Hồ Ngọc (hồ có eo)
**Tên:** Hồ Ngọc – pk:181–233.
- **Vị trí/kích thước:** thuỳ Bắc và thuỳ Nam đối xứng quanh tâm (199; 101), thắt eo ở z=101 (nửa rộng eo ≈ 8,6–9 m; nửa rộng tối đa 18 m). Ước lượng bao: x ≈ 181–217, **z ≈ 42–160** (mỗi thuỳ ~57 m dài). Công thức: x = 199 + 18·cos·(1−0,52·e^(−sin²/0,09))·wobble, z = 101 + 57·sin·wobble.
- **Bờ:** kè granite rộng 0,55 m (cao 0,22); **sàn gỗ ven hồ** rộng đến 3,55 m từ mép nước (cao 6 cm).
- **Bố trí:** ~120 đá cảnh ven bờ (trừ chỗ cầu/bến); ~70 lá hoa súng (30% có sen hồng/trắng) ở 2 vùng z 46–66 và 136–154; cỏ lau 10 cụm × 12 cây; **26 cá koi** (cam/trắng/vàng, bơi theo 2 thuỳ); **10 vịt** (8 trắng, 2 nâu); **3 thiên nga** bơi tự do ở thuỳ Nam + 2 thuyền thiên nga đậu bến. Đèn lồng đen (cao 3,5 m, ánh vàng ấm) dọc sàn gỗ mỗi 15 m; ghế gỗ khối mỗi ~21 m quay mặt ra hồ; tối đa 8 thùng rác (mỗi 37 m).
- **Chức năng:** cảnh quan, nuôi cá, đạp thuyền. Không lội xuống nước được (vòng đoạn chặn có lời nhắn, có khe ở cầu/bến).

#### 6.2 Đường chạy gạch đỏ + sàn gỗ + cây xanh
**Tên:** Đường chạy bộ – pk:185–205, 612, 617.
- **Hình:** siêu-elip (n=2,4) tâm (199; 101), nửa trục x=33, z=75 → đường tim x 166–232, **z 26–176**; rộng **5,5 m** (gạch đỏ nâu 0x6e2f22, bó vỉa đá trắng, vạch trắng đứt chia 2 làn), dài ~380 m (theo tab sơ đồ).
- **Đèn:** đèn cầu trắng (cao 3,4 m) mỗi 19 m ở ngoài đường 3,6 m.
- **Cây:** cổ thụ (tall) 2 hàng dọc đường chạy (bước 14–15 m), 34 cây thường (tall/shade/flame/purple) rải bãi cỏ, tùng viền 2 cạnh Tây/Đông.
- **Nhân vật:** 3 người chạy bộ (🏃 Tuấn nam, Linh nữ làn ngoài; Khoa nam làn trong, tốc độ 3,0/2,6/2,85 m/s). Gặp người chơi thì giảm tốc/nhường ("Cho mình qua với nha! 🏃", "Xin lỗi, nhường đường chút nha 😅"); 3 vòng thì nghỉ 8–12 s giãn cơ ("Xong 3 vòng rồi! 😮‍💨").
- **Cô Hạnh dắt chó Bé Vàng** (pk:772–793): đi dạo vòng sàn gỗ ven hồ, 1,1 m/s, thỉnh thoảng dừng 4–7 s; **E vuốt ve** Bé Vàng (không tốn tiền, có hiệu ứng tim).

#### 6.3 Cầu Vòm Hồ Ngọc
**Tên:** Cầu Vòm – pk:235–248.
- **Vị trí:** qua eo hồ tại z=101, x từ `bxa` (rìa Tây hồ + 0,3) đến `bxb`; **dài ≈ 19–20 m** (mã ghi "~19 m" ở mục 4; chú thích đầu file ghi 27 m là cũ), rộng 3,2 m, đỉnh vòm cao ≈1,27 m.
- **Bố trí:** mặt gỗ cong, dầm + tay vịn ống 2 bên (cao 0,95 m, trụ mỗi ~1 m), 2 mố đá, 4 đèn đá ở 2 đầu, lan can chặn có lời nhắn.
- **Tương tác:** đứng giữa cầu bấm **E để cho cá koi ăn: 2 💰** (14 s cá và vịt kéo đến). Thống kê `S.stats.koi`.
- **Kết nối:** 2 quảng trường đầu cầu: Tây (178; 101) bán kính 6,6 (đài phun nước) và Đông (220; 101) bán kính 6,6 (tượng); trục lối lát Đông–Tây nối thẳng ra cổng Tây/Đông.
- **Bản đồ:** teleport (182,2; 104,4) nhìn tâm cầu.

#### 6.4 Đảo thủy đình + cầu gỗ đỏ
**Tên:** Đảo thủy đình – pk:250–275.
- **Vị trí/kích thước:** đảo tròn tâm (199; 72) **bán kính 5,5** (cao 0,3), nằm ở thuỳ Bắc; đình lục giác bán kính 3,3 trên bệ cao 0,58: 6 cột đỏ cao 2,7 m, mái ngói xanh đen 6 mặt (nón r=4,3) có cầu vàng trên đỉnh.
- **Nội thất:** 3 ghế gỗ trong đình (mỗi ghế 2 chỗ ngồi: tổng 6 chỗ, nhãn "🏯 Ngồi trong thủy đình ngắm hồ (E · C)"); cây: 2 liễu (199∓3,9; 74,4/74,1), 1 phượng (199,4; 76,5).
- **Cầu gỗ đỏ ra đảo:** dọc x=199, rộng 2,6 m, từ mũi Bắc hồ (z≈41) đến đảo (z≈67,4), **dài ≈ 26 m**, đỉnh vòm ≈0,58 m, tay vịn đỏ; 2 đèn đá ở đầu cầu.
- **Nhãn:** "🏯 Thủy Đình Hồ Ngọc".

#### 6.5 Bến thuyền thiên nga
**Tên:** Bến thuyền – pk:277–284, 951–969.
- **Vị trí:** bờ Đông thuỳ Nam, trục z=130; bến gỗ dài 7,6 m (x từ `DX0` đến `DXS`, đầu mút bờ Đông hồ) rộng 2,4 m, cao 0,26. Đầu bến nhô ra mặt nước tại `DX0+0,9`. 2 thuyền đậu tại (DX0+2,6; 127,1) và (DX0+2,6; 132,9).
- **Biển:** "🦢 THUYỀN THIÊN NGA · 20 💰" tại (218,4; 127,8).
- **Tương tác:** đầu bến **E thuê thuyền: 20 💰**, xác nhận trả tiền. Điều khiển: W/S đạp tới/lùi (tốc độ tối đa 1,7 m/s tiến, 0,6 lùi), A/D rẽ; chạm bờ phải lùi (không qua được gầm Cầu Vòm; thuyền chỉ chạy ở thuỳ Nam z>105). Về bến bấm E trả thuyền. Bị ngắt (dịch chuyển/taxi) → tự đưa về bến.
- **Nhân vật:** 2 khách đạp thuyền (Nam xanh lá, Nữ hồng) ngồi trên 2 thuyền thiên nga tự lái.

#### 6.6 Cổng Bắc + sơ đồ + biển chỉ dẫn
**Tên:** Cổng Bắc – pk:300–342.
- **Vị trí:** z=16; 2 trụ granite 0,6×3,9×0,6 tại x=194,4 và 203,6 (đèn lồng đá trên đỉnh); bảng "ĐẠI CÔNG VIÊN HỒ NGỌC / QC CITY · CENTRAL PARK · MỞ CỬA 24/7" 6,6×1,24 m ở y=3,55; quảng trường cổng `GP` x 186–212, z 15,5–22,6 (lát đá).
- **Bảng sơ đồ** tại (192,8; 18,6) quay về trục cổng: **E xem sơ đồ** (12 thẻ mô tả khu); biển chỉ dẫn 5 hướng tại (205,2; 17,4). 2 bồn hoa cổng (188,6–191,6 và 206,4–209,4, z 16,3–17,1). 2 thùng rác (186,6; 21,9), (211,5; 16,3). 12 chim bồ câu mổ thóc quanh x 193,6–202,6, z 17,6–21,2 (bay khi bạn chạy lại gần <3,6 m, đi bộ <2 m).
- **Nhãn:** "🌳 Đại công viên Hồ Ngọc" ở (199; 6,4; 16) (fade 90 m).

#### 6.7 Góc giải khát ở cổng (máy bán nước · quầy nước · xe kem)
- **3 máy bán nước** (pk:344–365) tại z=21,75, x = 203,0 / 204,15 / 205,3 (mỗi máy 1,0×1,95×0,78, mặt quay Bắc; xanh dương, đỏ, xanh lá): E (từ z=20,7): mỗi máy 3 món — Máy nước suối & trà: 💧 Nước suối 6 · 🍵 Trà xanh 10 · 🍋 Trà chanh mật ong 12 (+5 phút chạy nhanh); Máy nước ngọt & tăng lực: 🥤 10 · ⚡ Nước tăng lực 15 (+10 phút) · 🧃 Nước ép cam 12 (+4); Máy cà phê & sữa: ☕ Cà phê sữa lon 12 (+20% thưởng quiz 10 phút) · 🥛 Sữa tươi 9 · 🧋 Trà sữa chai 14 (+20% quiz 6 phút). Hiệu ứng cộng dồn; có lon rơi ra animate.
- **Quầy nước Cổng Bắc** (pk:366–377) tâm (209,6; 20,85), 2,6×1,05×1,3 m, mái bạt sọc xanh ngọc/trắng: nhân vật **Chị Mai** (quầy nước) tại (209,6; 21,3). Menu: 🧊 Trà đá 4 · 🎋 Nước mía tắc 10 (+4 ph) · 🥥 Nước dừa 15 (+8) · 🫘 Sữa đậu nành 8 · ☕ Cà phê muối 16 (+20% quiz 12 ph). Thoại: "Nước của bạn đây! 😊", "Uống ngon nha!", "Trà đá, nước mía đây!".
- **Xe kem** (pk:378–386) tại (188,9; 19,6): nhân vật **Anh Phát · bán kem** (mũ lưỡi trai, tại (188,9; 20,45)). Menu: 🍦 Kem ốc quế 10 · 🍡 Kem que đậu xanh 6 · 🥥 Kem dừa trái 18 (+5 ph) · 🍨 Kem ly 3 viên 14. Thoại: "Kem đây! Kem mát lạnh đây! 🍦", "Kem dừa ngon nhất công viên nè!".
- **Thanh toán:** mọi món qua `askPay` (xác nhận) rồi `spend`.

#### 6.8 Bãi xe đạp
tại z=18,2: 5 giá xe x = 213,6 + i×1,75 (đến 220,6); 4 xe đạp (xanh dương, đỏ, xanh lá, vàng) tại x 213,6; 215,35; 218,85; 220,6; biển "🚲 BÃI XE ĐẠP" ở (221,3; 16,3). Chỉ trang trí (không có E). Lối lát (212,2–221,6; 15,5–20,2). Nhãn "Gửi xe rồi chạy bộ vòng hồ".

#### 6.9 Khu thể dục (góc Đông Bắc)
**Tên:** Khu thể dục + xà đơn xà kép – pk:400–427.
- **Vị trí:** `GY` x 221,8–236,5, z 15,5–32 (**14,7 × 16,5 ô**), thảm cao su xanh lá + vạch vàng ở z=22,2.
- **Bố trí (5 thiết bị có thể tập):** (1) Máy đi bộ trên không (224,4; 19,6); (2) Máy xoay eo (226,4; 19,65); (3) Xe đạp tại chỗ (228,4; 19,6) (ngồi); (4) Vòng xoay tay (230,4; 19,45); (5) **Xà đơn 3 tầng** tại z=27, 4 trụ x 230,3/232,1/233,9/235,7 (cao 2,7), 3 xà cao 2,0/2,3/2,6 m ở x 231,2/233,0/234,8. Thêm xà kép (226,2; 28,2) và ghế gập bụng (223,6; 28,2) (trang trí, không E). Màu chính xanh dương/vàng.
- **Nhân vật:** 👴 **Ông Sáu** (đi bộ trên không), 👵 **Bà Tư** (xoay eo) – tập thật theo máy, thoại "Tập thể dục mỗi chiều, khoẻ re! 💪", "Sống lâu trăm tuổi nhờ đi bộ đó cháu!", "Một, hai, ba, bốn…"; 💪 **Anh Dũng** kéo xà đơn ở xà thứ 3 (x=234,8, 8 cái rồi nghỉ 7–11 s, "8 cái! Xong 1 hiệp 😤").
- **Tương tác:** máy trống (2 máy đã có NPC dùng) **E tập** (xà đơn 10,5 s; máy khác 8 s); đi/chạy để dừng; xong **thưởng +3 phút chạy nhanh** (không tốn tiền). Máy bận → toast "Có người đang tập".
- **Nhãn:** "💪 Khu thể dục · xà đơn xà kép".

#### 6.10 Góc cosplay (Tây Bắc)
**Tên:** Góc cosplay – pk:429–437, sl:32–46.
- **Vị trí:** phông chụp ảnh x 163,2–173,4 (10,2 m), z=29,9, cao 2,6 m, tím–hồng sao; 2 cột đèn 3,4 m + 2 đèn spot; ghế gỗ (175,6; 20,6) quay Tây; thùng rác (175,8; 23,6); sân lát x 161,5–177, z 15,5–31.
- **Nhân vật (streetlife):** 4 cosplayer đứng tại (162,6; 24,2) Siêu anh hùng Áo Choàng Đỏ (áo choàng + sao vàng), (166,2; 23,0) Phi hành gia Bug Hunter (mũ kính + balô), (170,2; 23,0) Hiệp sĩ Test Case (khiên), (173,8; 24,2) Ninja Regression (khăn đỏ). Thỉnh thoảng giơ tay chào.
- **Tương tác:** tại (168,2; 27,2) bán kính 4,6: **E chụp ảnh** (miễn phí) → "📸 Tách! Ảnh chụp cùng … đã lưu vào kỷ niệm 😄" + hiệu ứng flash. Thoại: "📸 Cười lên nào!", "✌️ Chụp đẹp nha!", "🦸 Sẵn sàng cứu thế giới khỏi bug!".

#### 6.11 Vườn Hoa Tròn (lưỡi liềm Tây Bắc) và Giàn hoa giấy (lưỡi liềm Đông Bắc)
- **Vườn Hoa Tròn:** tâm (183,2; 45,5): bồn giữa r=1,35 + đồng hồ mặt trời (trụ đá cao 0,9 + mặt r=0,5), 6 bồn tròn r=0,62 ở bán kính 2,6 m (6 bộ màu hoa). Không E. Nhãn "🌷 Vườn Hoa Tròn".
- **Giàn hoa giấy:** x 211,8–217,6 (5,8 m), z 42,2–45,6 (3,4 m), cao 2,6 m trắng, 190 hoa trên mái + 50 hoa leo trụ, 2 ghế ngồi (1 ghế mỗi hướng, nhãn "🌸 Ngồi dưới giàn hoa giấy (E · C)"), đèn dây 3 hàng. Nhãn "🌸 Giàn hoa giấy".

#### 6.12 Bãi cỏ yoga – dưỡng sinh (Tây)
**Tên:** Bãi yoga – pk:455–461, 835–845.
- **Vị trí:** cột x=176,6, `keep` x 173,2–180,2, z 59,6–88,6. Thảm: HLV z=61,6; học viên z=66/70/74; **thảm trống z=78** (5 thảm màu); 2 vị trí dưỡng sinh (175,0; 84,6) và (178,2; 84,6).
- **Nhân vật:** 🧘 **Cô Thảo** (HLV yoga, áo xanh ngọc, hướng dẫn: "Ngồi thiền, thả lỏng vai… hít thở sâu 🧘", "Hít vào… vươn hai tay lên cao!", "Tư thế cái cây – giữ thăng bằng nhé 🌳", "Thở ra… dang tay, tư thế chiến binh!"; đổi tư thế mỗi 9 s theo chu kỳ lotus → giơ tay → cây → chiến binh), 3 học viên (2 nếu máy yếu), 👴 **Ông Bảy** + 👵 **Bà Hai** tập thái cực quyền (thoại "Dưỡng sinh mỗi sáng, chiều – khoẻ cả người!", "Chậm thôi, đều hơi thở…").
- **Tương tác:** tại (177,7; 78) **E tập yoga cùng lớp** 27 s, làm theo tư thế cô giáo; **+3 phút chạy nhanh**.

#### 6.13 Sân cầu lông (Đông)
Sân x 218,6–224,4 (5,8 m), z 69–82 (13 m), lưới ở z=75,5 (cột 1,55 m ở x=218,4 và 224,6, lưới 6,2×0,76 m, đi vòng). Nhân vật **Hải** (áo vàng) và **Quyên** (áo hồng) đánh cầu theo parabol có vợt thật; thỉnh thoảng hụt ("Ối, hụt rồi! 😅", "Cầu xoáy quá!", "Ván này bạn thắng!", "Đỡ nè!", "Đập nè! 💥"). Không có E. Nhãn "🏸 Sân cầu lông".

#### 6.14 Quảng trường Tây: đài phun nước ước nguyện
**Tên:** Đài phun nước – pk:473–484. Tâm (178; 101), quảng trường tròn r=6,6; bể granite r=3,0 (nước r 2,55–2,6), trụ đá 4 bậc cao 1,85 m, 6 vòi + 1 vòi giữa phun nước (động). 2 ghế gỗ tại (178; 95,8) và (178; 106,2) (nhãn "⛲ Ngồi ngắm đài phun nước"). **Tương tác:** tại (181,7; 102,9) **E ném xu: 1 💰** → toast ngẫu nhiên ("Tõm! Chúc bạn sprint này không còn bug nào 🍀", "Điều ước đã gửi: lương tăng, deadline giãn 😄", "Ước gì test case nào cũng Pass ✅"), pháo hạt vàng/trắng/xanh.

#### 6.15 Quảng trường Đông: tượng "Kính lúp QC"
**Tên:** Tượng Kính lúp QC – pk:485–492. Tâm (220; 101), bồn hoa r=1,7 (vàng/cam/trắng), bệ đá + tay đồng + vành kính lúp (r=0,5, thấu kính xanh nhạt) và con bọ xanh; **4 ghế đá** ở bán kính 4,7 m tại 45°/135°/225°/315° quay vào tượng. Chỉ trang trí. Nhãn "🔎 Tượng "Kính lúp QC" – Soi kỹ từng góc – tinh thần QA".

#### 6.16 Vườn Đá – Trúc (Tây Nam)
x 173,4–178,8 (5,4 m), z 116–135,5 (19,5 m): sân sỏi trắng với vạch cào; 6 đá cảnh (r 0,42–0,9), 4 bụi trúc ở 4 góc (173,2/178,9 × 114,2–114,6 và 136,8–137), đèn đá (176,1; 124), 2 ghế đá (179,6; 118,2) và (179,6; 131). Nhãn "🎋 Vườn Đá – Trúc – Góc yên tĩnh ngồi ngắm hồ".

#### 6.17 Café Bên Hồ + bàn cờ đá (Đông Nam)
**Tên:** Café Bên Hồ – pk:505–533, 902–912.
- **Vị trí:** sân lát x 218,8–226,4 (7,6 m), z 112–138,5 (26,5 m), cạnh bến thuyền; quầy gỗ tại (225,2; 115,5) 1,3×1,05×3,4 m + mái xanh ngọc, biển "☕ CAFÉ BÊN HỒ".
- **Bố trí:** **6 bàn tròn dù** (r bàn 0,48; dù nón r=1,35 màu hồng/xanh ngọc/vàng/xanh dương/hồng nhạt/xanh lá) ở x 220,6 và 224,4, z 121,2 / 126,6 / 132,0; mỗi bàn 2 ghế gỗ (tổng 12 chỗ, nhãn "☕ Ngồi bàn café ven hồ (E · C)").
- **Nhân vật:** ☕ **Chị Ngân · pha chế** (áo nâu, tại (225,85; 115,5)); tối đa 3 nhóm khách tự sinh (cafe.js, spawn (227,6; 110), điểm gọi (223,4; 115,5)) – hội thoại mẫu: "Hồ này rộng ghê, chiều đạp thuyền chắc vui!", "Lát thuê thuyền thiên nga đi một vòng 🦢"… Thoại pha chế: "Cà phê sữa đá ngon nhất bờ hồ!", "Ngồi bàn dù ngắm thuyền nha mọi người!".
- **Tương tác:** tại (223,45; 115,5) **E gọi món**: ☕ Cà phê sữa đá 12 (+20% quiz 10 ph) · 🧋 Trà sữa trân châu 16 · 🥥 Nước dừa 15 (+8 ph chạy nhanh) · 🍰 Bánh flan 10 · 🍵 Trà sen 14.
- **Bàn cờ đá:** tâm (222,5; 136,4), bàn 0,82×0,82 + mặt cờ tướng + 4 ghế đá (2 người chơi + 2 ghế cho bạn ngồi xem, nhãn "♟️ Ngồi xem đánh cờ (E · C)"). Nhân vật **Ông Ba** và **Ông Năm** ngồi chơi, đối thoại mỗi 10–20 s ("Chiếu tướng! 😤" / "Khoan, khoan… để tôi tính đã."; "Ăn xe nè!"/"Trời ơi, sơ hở rồi!"; "Đi pháo đầu!"/"Thì tôi lên mã."; …). **E xem** (tại (221,1; 136,4)): "Ngồi xem đi cháu, ván này căng lắm!".

#### 6.18 Sân khấu Cỏ (bờ Nam)
**Tên:** Sân khấu Cỏ – pk:535–550.
- **Vị trí:** sàn x 194,2–203,8 (9,6 m), z 166,6–170,4 (3,8 m), cao 0,6; 2 bậc phụ hai bên; phông 9,6×3 m "🎤 SÂN KHẤU CỎ – Hồ Ngọc Acoustic · mỗi tối"; đèn dây; 2 loa (0,6×1×0,5).
- **Khán giả:** 3 ghế gỗ khối ở z=162,6, x≈194,2/198,4/202,8 quay mặt về sân khấu (nhãn "🎵 Ngồi nghe nhạc (E · C)").
- **Nhân vật:** 🎸 **Anh Toàn · hát acoustic** (áo xanh đậm) tại (199; 168,9), nhảy/hát xen kẽ: "🎶 Chiều nay em ra bờ hồ…", "🎸 Bài tiếp theo tặng các bạn chạy bộ nè!", "🎤 Ai lên song ca với mình không?".
- **Tương tác:** tại (199; 165,7) **E lên sân khấu hát** (miễn phí) → pháo hạt, "🎤 Bạn vừa hát 1 bài – cả công viên vỗ tay rần rần! 👏" / "🎸 Hát hay quá! Có người xin số liên lạc kìa 😄" / "🎶 Encore! Encore!…", Anh Toàn đáp "Hay quá bạn ơi! 👏".

#### 6.19 Sân chơi trẻ em (góc Tây Nam)
**Tên:** Sân chơi – pk:552–582.
- **Vị trí:** `PG` x 162,4–177 (14,6 m), z 168–184,5 (16,5 m), thảm cao su đỏ.
- **Bố trí:** **Xích đu** 2 chỗ tại z=171,5 (khung x 164,0–167,2, thanh ngang cao 2,3; ghế tại x 164,9 và 166,3; ghế x=166,3 ngồi được: **E · C**); **Cầu trượt** thang tại (168,45; 171,65) cao 1,35 m (đỉnh), dốc dài 1,9 m; **Thú nhún** (con vịt vàng) tại (169,8; 172,65); **Bập bênh** (170,6; 179,6) 3 m; **Hố cát** (174,4; 179,4) 3,2×3,2 vuông; **Ghế phụ huynh** (176; 173,6).
- **Nhân vật:** 👧 **Bé Na** (cao 1,12 m) đu xích đu ("Mẹ ơi đẩy cao nữa! 😆", "Wiii~ bay lên trời!"); 👦 **Bé Bin** (1,2 m) leo thang → trượt → ngồi thú nhún → leo lại ("Trượt nè! 🛝", "Wheee~", "Mẹ nhìn con nè!"); 👩 **Mẹ bé Na · Bin** đứng tại (164,05; 173,7) xem điện thoại ("Chơi cẩn thận nha hai đứa!", "Bin ơi, nhường em trượt với!").
- **Nhãn:** "🛝 Sân chơi trẻ em".

#### 6.20 Bãi cỏ dã ngoại + thả diều (Đông Nam)
2 bàn picnic gỗ + khăn trải ô caro đỏ ở (225,6; 174,2) và (232,4; 180,4) (mỗi bàn 4 chỗ, nhãn "🧺 Ngồi bàn picnic (E · C)"). Giữ chỗ `keep` x 221–236,5, z 168–184,5. NPC: 🧑 **Minh** và 👩 **Thư** ngồi bàn đầu (ăn, trò chuyện: "Bánh mì này ngon ghê!"/"Tự tay mình làm đó 😊"…; **không có ở máy yếu**), 👦 **Bé Tí** thả diều tại (230; 173) (diều đỏ bay quanh độ cao ≈ 11,5 m, dây thật; "Diều bay cao quá! 🪁"). Nhãn "🧺 Bãi cỏ dã ngoại".

#### 6.21 Cây vỉa hè quanh công viên
Mọi cây/chậu ở vỉa hè các đường (ngoại trừ khu công viên và khu có vật cản) đặt trong `pk:624–651` (xem mục 2.2). Chậu lớn (big) cạnh cửa mỗi toà công ty (±3,35 m cách cửa).

#### 6.22 Số tiền / phần thưởng tóm tắt công viên
Cho cá koi 2 · ném xu 1 · thuê thuyền 20 · đồ uống/kem 4–18 (buff chạy nhanh/quiz) · tập luyện/yoga miễn phí +3 phút chạy nhanh · hát/chụp ảnh miễn phí.

---

### 7. KHU CÔNG CỘNG (cv; nạp từ pk:622)

#### 7.1 Bệnh viện Đa khoa QC City
**Tên:** Bệnh viện – cv:64–101.
- **Vị trí/kích thước:** x 215,5–260,5 (**45 m**), z 223–249 (**26 m**), cao 15,6 m (4 tầng, dải xanh dương mỗi tầng); mái viền bê tông cao 0,5.
- **Bố trí:** 4 mặt tường dán facade (cửa sổ 2,1 m/bước 3,2 m); **sảnh có mái che** 11×4,6 m cao 3,6 tại giữa mặt Bắc (4 cột thép, cửa kính 5×3 m); biển "BỆNH VIỆN ĐA KHOA QC CITY" 15×2,3 m ở y=14; **chữ thập đỏ** phát sáng trên mái (cột 3,6 m, x=257,3); **lối Cấp cứu** phía Tây (biển "CẤP CỨU 24/7" đỏ, mái 3,2×5 m, cửa kính tại z≈cz+4=240); **bãi đáp trực thăng** tròn r=6 ở mái tại (232,5; 236) (chữ H vàng, 8 đèn xanh); sân trước 7,2 m bê tông + 2 bồn cây shade (x 218,5 và 257,5, z 216,8); **2 xe cứu thương** 5,6×2,1 m đậu tại (223,5; 218) và (252,5; 218) (đèn xanh dương).
- **Chức năng:** khám bệnh · cấp cứu.
- **Nhân vật:** 👩‍⚕️ **Chị Lan · điều dưỡng** (áo trắng) tại (240,4; 220,8) ("Mời bạn vào khám, hôm nay ít người lắm! 💙", "Nhớ uống đủ nước nha!").
- **Tương tác:** cửa (238; 221,4): **E khám sức khoẻ tổng quát: 30 💰** → +15 phút chạy nhanh; "Bác sĩ: 'Sức khoẻ tốt! Nhớ ngủ đủ giấc, bớt thức khuya fix bug nha'". Lối Cấp cứu (x≈213,3; z=240) E → toast "gọi 115 (chỉ tham quan)".
- **Kết nối:** cửa chính quay Bắc ra Phố chính (z=200 → vỉa hè đến z=215); tường là đoạn chặn có lời nhắn (chỉ vào bằng sảnh/cấp cứu; **không có nội thất bên trong**). Bản đồ: teleport (238; 214,5). Taxi: (238; 200). Buýt gần nhất: "Bệnh viện · Trạm cứu hoả" tại (226; 205,35).

#### 7.2 Trạm cứu hoả QC City
**Tên:** Trạm cứu hoả – cv:103–146.
- **Vị trí/kích thước:** x 220–252 (32 m), z 255–274,5 (19,5 m), cao thân 9,2 m, cao gara 5 m (cửa cuốn kéo hết lên); tường gạch đỏ dày 0,4.
- **Bố trí:** **3 gara** rộng 5,2 m tâm x=225,5 / 236 / 246,5 mở ra Đường Bệnh Viện (z=290); trụ gạch giữa các gara + dầm; tầng 2 có dãy cửa sổ kính; biển "🚒 TRẠM CỨU HOẢ QC CITY · 114" 12×1,6 m; số 1–3 trên mỗi cửa + đèn đỏ; **tháp phơi vòi** ở Tây (x≈218,3, z≈257, 3,2×15,5 m, nón mái đen); sàn gara; vạch kẻ trắng ngoài cửa (5 vạch/cửa).
- **Xe:** 3 xe cứu hoả đậu trong gara tại z=269,2 (đầu xe quay ra cửa Nam): xe bồn số 1 (x=225,5), **xe thang số 2** (x=236), xe bồn số 3 (x=246,5); thân dài 8,6 m, rộng 2,5 m, đèn đỏ/xanh nhấp nháy; đi vào trong gara xem được (2 bên thành có tường chặn, mặt trước chỉ chặn ở trụ).
- **Nhân vật:** 👨‍🚒 **Anh Hùng · lính cứu hoả** tại (228,4; 272,3) ("Xe luôn sẵn sàng trong 60 giây! 🚒", "Phòng cháy hơn chữa cháy nha bạn!", "Chào bạn! Muốn ngồi thử ghế lái không? 😄").
- **Tương tác:** tại (236; 276,1) bán kính 2,2 **E tham quan** (modal 4 thẻ thông tin: xe bồn 4000 lít, xe thang 32 m, xe bọt, mẹo an toàn); miễn phí.
- **Bản đồ:** teleport (236; 277,9). Taxi: (236; 290).

#### 7.3 Trường Tiểu học QC City
**Tên:** Trường tiểu học – cv:148–192.
- **Vị trí/kích thước:** khuôn viên x 214,6–261,6 (**47 m**), z 305,6–364,4 (**58,8 m**), tường rào chân vàng 0,6 m + song sắt 1,2 m (cao đến 1,75). **2 cổng**: chính phía Bắc x 233–239 ở z=305,6 (trụ vàng 0,7×2,6, mũ ngói, bảng "🏫 TRƯỜNG TIỂU HỌC QC CITY" 6,9×0,95 m); phụ phía Tây z 329–335 ở x=214,6.
- **Dãy lớp học:** x 218–258 (40 m), z 350–362,6 (12,6 m), cao 11,4 m (3 tầng), tường vàng + dải kem; hành lang 3 tầng nổi 1,8 m rộng phía Bắc (z≈348,2) với cột trắng cách 4,4 m; khối sảnh giữa 6×13,6×2,6 có đồng hồ (r 1,1 tại (238; 11,4; 347,4)); mái ngói đỏ 4 mái cao 3,2 m.
- **Sân trường:** sân phủ x 215–261, z 306–349,4 màu xám; **sân bóng rổ** x 241–257, z 312–328 (16×16 m xanh lá + vạch), **2 rổ** tại z≈312,6 và 327,4, x=249 (cột 3,4 m, bảng 1,8×1,05, vành cam); **cột cờ** (236; 316) cao 9 m, cờ xanh có 📘 bay (động); 4 bồn cây (222,5; 318), (222,5; 334), (230; 344), (248; 344) mỗi bồn 2,2×2,2; 2 ghế đá sân trường (226,2; 318) và (226,2; 334) (mỗi ghế 2 chỗ).
- **Nhân vật:** 👦 **Bé Khang** (xanh dương) và 👧 **Bé Mai** (hồng) chơi bóng rổ tại (247,6; 324) và (251; 323,2) ném bóng luân phiên mỗi 2,2 s ("Vào rồi! 🏀", "Hụt mất tiêu 😅", "Tới lượt bạn ném nè!"). Không có giáo viên/học sinh trong lớp (lớp không vào được).
- **Tương tác:** tại cổng chính (236; 304,4) bán kính 2 **E xem bảng tin trường** (modal 4 thẻ: Giờ học, CLB bóng rổ, Ngày hội "Bé làm kiểm thử", An toàn giao thông). Bản đồ: teleport (233; 303,4) nhìn (236; 330).
- **Kết nối:** cổng chính ra Đường Bệnh Viện (z=290), cổng phụ ra Đường Trường Học (x=199).
- **Lưu ý:** tường dãy lớp là đoạn chặn có lời nhắn; không có nội thất.

---

### 8. GIAO THÔNG CÔNG CỘNG (tr, tf)

#### 8.1 Xe buýt Tuyến 01
**Tên:** Tuyến 01 – tr:95–256.
- **Lộ trình khép kín (chiều lái bên phải):** từ đầu cầu (58; 5,35) → Đông trên làn ô tô ngoài z=+5,35 đến x=140,65 → Nam trên x=140,65 (tức 5,35 m phía Tây tim đại lộ ven Tây) đến z=205,35 → Đông dọc Phố chính đến x=257,35 → Bắc dọc đại lộ ven Đông đến z=−5,35 → Tây dọc Đại lộ Hồ Ngọc về x=58 → cong vào vành đai đảo (r=44,75) đi một vòng (chiều kim đồng hồ theo chú thích mã, góc giảm dần) từ góc −0,35 đến −2π+0,35 → ra cầu (bezier) → lại (58; 5,35). Góc cua bo 9 m; vận tốc tối đa 10 m/s; tăng tốc 1,3, phanh 3,2 m/s².
- **8 trạm** (thứ tự theo chiều chạy; thực có 8, chú thích đầu file ghi 9):
  1. Phường Khởi Nghiệp · Chợ QC – (166; 205,35)
  2. Bệnh viện · Trạm cứu hoả – (226; 205,35)
  3. Downtown · Cổng công viên – (222; −5,35)
  4. Đầu cầu Downtown – (163; −5,35)
  5. Bến cảng – (0; −44,75)
  6. Toà Giáo trình – cực (2,95; r 44,75) ≈ (−43,9; 8,5)
  7. Khu nghỉ dưỡng – cực (2,3) ≈ (−29,8; 33,4)
  8. Tháp Brand QA · Học viện – cực (π/2+0,14) ≈ (−6,2; 44,3)
- **Mái chờ mỗi trạm:** dựng bên phải xe, cách làn ô tô ngoài ≈ 6,25 m trong thành phố (3,75 m trên đảo); 4,5×1,95 m, mái trắng + viền xanh ngọc, ghế gỗ, 4 vách kính + **bảng quảng cáo phát sáng "HỌC QA MIỄN PHÍ – Toà Giáo trình"**, cột biển 🚌 01 cao 3,1 m, bảng tên trạm; 8 va chạm tròn. Nhãn "🚏 tên trạm · Tuyến 01".
- **Nhân vật:** khách chờ (người thật sinh ngẫu nhiên: ≤2 người mỗi trạm, 80%/35% có mặt lúc đầu; bước lên xe khi xe đến; tên "<tên> · chờ xe buýt"), không có thoại.
- **Xe:** **3 xe** (dài 11,2 × rộng 2,5 × cao 3,05 m, trắng + dải xanh ngọc, bảng LED "01 ĐẢO MD ⇄ DOWNTOWN ⇄ PHƯỜNG", 2 cửa mở). Mỗi xe đứng 6–8 s ở trạm. Nhường người chơi (nếu đứng trước đầu xe) và bóp còi toast "🚌 Bíp bíp! Xe buýt xin đường – bước sang lề nhé.".
- **Tương tác:** tại mái chờ bán kính 3,6: khi xe đang đậu "🚌 Lên xe buýt Tuyến 01 (E) – vé 5 💰", ngược lại "xe tới sau ~N giây (E: xem tuyến)". Modal chọn trạm xuống; **vé 5 💰** cho bất kỳ số trạm; tự xuống khi đến nơi; E để xuống sớm khi xe dừng.
- **Bản đồ:** "Trạm buýt Đầu cầu Downtown".

#### 8.2 Cáp treo Vịnh Bình Phan
**Tên:** Cáp treo – tr:258–373.
- **Hai ga:** **Ga Đảo** tại bờ Đông Bắc đảo (tìm tự động: thử góc −0,62…−0,70 và r 60…64; dự phòng (49; −35), khả năng cao ≈ (48,8; −34,9)); **Ga Downtown** tại (136,5; −26,5). Mỗi ga: nền 8×14,4 m (hw=4, hl=7,2) cao 0,3, mái trắng cao ≈7,15, viền xanh ngọc, biển "🚡 CÁP TREO VỊNH BÌNH PHAN · GA ĐẢO/DOWNTOWN", 6 cột thép, vách kính; lối đi ga được đáp bằng sàn (addPlat) – ga Downtown cắt đoạn lan can bờ Tây để đủ chỗ.
- **Trụ giữa biển:** 1 trụ thép cao 26 m (tứ diện thu nhỏ) ở giữa đoạn cáp (≈ (92; −31)), chân bê tông chìm dưới biển, đèn báo đỏ nhấp nháy; dây cáp tube r=0,045 treo ở độ cao 4,4 m (ga) → 26 m (trụ).
- **Cabin:** **8 cabin** (1,9×0,9×1,9, trắng + viền ngọc, kính) đi vòng khép kín 4,2 m/s ngoài ga, **0,7 m/s trong ga**; ~40 giây một chuyến; cabin lắc nhẹ. Cabin dùng 3 InstancedMesh.
- **Tương tác:** tại ga bán kính 5,2, **E: vé 10 💰** (xác nhận); đứng chờ cabin (≥12 m rời ga thì huỷ và hoàn vé 10 💰); trên cabin camera tự lượn chậm, kéo chuột ngắm; tới ga bên kia tự xuống.
- **Bản đồ:** "Ga cáp treo · Đảo", "Ga cáp treo · Downtown".

#### 8.3 Taxi
**Tên:** Taxi – tr:375–473.
- **Cách gọi:** phím **X** (phải ở cách đường ≤45 m; không trong toà; không đang đi xe khác). Taxi xuất phát cách 70–140 m theo đường, tới trong ~(quãng đường/9+3) giây, đợi tối đa 75 s.
- **Điểm đến (danh sách):** Quảng trường trung tâm (0; 30), Sân khấu QC Live (0; −30), Bến cảng (0; −62), Tháp Brand QA (0; 61), Toà Giáo trình (−50; 0), Khu nghỉ dưỡng, Ga cáp treo (Đảo/Downtown), Cổng Rời đảo (52; 0), Downtown · Đại lộ Hồ Ngọc (199; 0), Đại công viên · Cổng Bắc (199; 0), 11 toà công ty không khoá, Chợ QC, Showroom, Văn phòng địa chính, Trung tâm Việc làm (176; 277,4), Nhà trọ khởi nghiệp, + (do module khác nối thêm) Bệnh viện (238; 200), Trạm cứu hoả · Trường Tiểu học (236; 290), Công viên Cổng Đông (252; 101), Công viên Cổng Nam (199; 200).
- **Giá:** **10 💰 + 1 💰 mỗi 20 m** đường thật; đang đi bấm **X** để "đi nhanh" (tới ngay). Taxi vàng 0xf5c400, biển TAXI trên nóc, tuân đèn và nhường người như xe bot.
- **Tương tác:** E lên taxi (bán kính 4); khi tới, người chơi xuống bên phải xe.

#### 8.4 Xe bot dân thường (tf:154–191)
Tối đa **10 mẫu xe** (sedan, suv, mini, pickup, sport; nhiều màu) chạy theo đồ thị taxi, chỉ ở các nút x>130; tốc độ tối đa 9–12 m/s, tăng 2,4 / phanh 6,5 m/s²; dừng đèn đỏ, giữ khoảng cách, nhường người; kẹt đối mặt >5 s thì "ma" 2,5 s xuyên qua nhau; bóp còi khi bạn chắn đường (toast "🚗 Bíp bíp! Ô tô xin đường – bước lên vỉa hè nhé."). Chỉ hiển thị/cập nhật khi cách bạn <210/240 m.

---

### 9. NGƯỜI TRÊN PHỐ

#### 9.1 Người đi bộ tự động (pd)
**Tên:** Hệ thống người đi bộ – pd:1–317 (đọc đầu file và phần dựng đồ thị).
- **Mạng vỉa hè:** mỗi ngã giao có 4 góc phố cách tim ±12,8 m; cạnh VỈA HÈ (dọc đường) và cạnh QUA ĐƯỜNG (đúng 27 vạch); quét vật cản thật (circles/boxes/SEGS).
- **Hành vi:** qua đường khi đèn người đi bộ xanh; xếp hàng chờ ở mép vỉa hè (3 hàng × 3 người mỗi đầu vạch); không qua khi có xe trên vạch; người đang ở lòng đường nằm trong `W.PEDS` để xe bot phanh.
- **Số lượng ("bể" cố định quanh người chơi):** 18 / 26 / 34 người (máy yếu/vừa/mạnh), tầm 70/85/100 m; ban đêm × 0,55.
- Người dựng từ `W.people` (Xbot): tốc độ clip khớp sải chân, quay đầu mượt.

#### 9.2 Người đi phố đủ kiểu (sl)
- **🎧 2 người đeo tai nghe:** đi qua lại vỉa hè Bắc Đại lộ Hồ Ngọc ở z=−13,4, đoạn x 192–240 (nữ áo hồng) và x 148–165 (nam áo xanh); tốc độ 1,3 m/s; dừng nhún nhảy 5–8 s ("🎧 ♪♫ Nhạc hay quá!", "♪ Lên nhạc nào~", "🎶 Bài này cuốn ghê").
- **🎸 Ban nhạc rock dạo QC Rock:** 3 thành viên (🎸 Khánh guitar, 🎸 Tú bass, 🥁 Nam trống) đi dọc vỉa hè z≈−13,2 giữa 3 điểm dừng x=150, 196, 236; mỗi điểm: dựng trống 3 s → chơi 48 s → đi tiếp. Lời chào: "🎸 Xin chào Downtown! Bài này tên là "Hotfix lúc 2 giờ sáng"!". Nhạc WebAudio tự tạo (132 BPM, riff 16 nốt), nghe to dần khi lại gần (tới 45 m), có pan trái/phải. 4 khán giả (người đi đường) đứng xem. **E ủng hộ: 10 💰** ("Cảm ơn bạn! 🤘 Bài sau tặng bạn!"). Bản đồ: "Ban nhạc rock dạo (Downtown)".
- **🦸 Nhóm cosplay** (xem 6.10).
- **🎩 Ảo thuật gia Bình Minh:** tại Phố ẩm thực Đồi QC (307; 104) **(ngoài phạm vi tài liệu này, thuộc Đồi QC)**; E ủng hộ 10 💰.
- **Chạy:** các hoạt động trên chỉ cập nhật khi bạn ở P.x 120–280, z −90…500.

---

### 10. NAV.JS – lưới đi bộ cho bot (nv:1–52)
- **Phạm vi lưới:** gốc (X0=−100; Z0=−118), **370 × 600 ô** (x −100…270, z −118…482), ô 1 m → bao trùm đảo + cầu + Downtown + Phường (không bao Khu Giải trí x>270).
- **Ô đi được:** địa hình `groundH>−0,22` **hoặc** trong Downtown/Phường/Arena (`inDT`, pad −0,5); trừ lòng đường (`W.roadBlock` – chỉ cho qua tại vạch), cộng sàn (plats, trừ vòng ring), trừ vòng va chạm (circle + 0,45 m), đoạn chặn (`SEGS`, trừ `noNav`), hộp (box + 0,45).
- **Tìm đường:** A* 8 hướng (không cắt góc), tối đa 60 000 mở rộng, làm mượt line-of-sight; đích không đi được → ô gần nhất trong 7 ô.
- Dùng bởi `bots.js` (ngoài phạm vi).

---

### 11. ĐẢO MASTER DASHBOARD – phần thuộc `city.js` / `wd.js` (để đối chiếu điểm nhảy bản đồ)

#### 11.1 Đường vành đai
**Tên:** Đường vành đai – ci:28–51. r=43, rộng 7 (r 39,5–46,5), **mặt phẳng y=0,12** (sàn đứng cùng cao độ), 420 đoạn, bó vỉa 2 vòng torus; 30 cột đèn vành ngoài (r 47,6), bỏ đèn gần đầu cầu (|z|<7,5 phía x>0) và gần góc −π/2. Vạch trắng mép + vàng đứt giữa.

#### 11.2 Tháp Brand QA·QC·QE
**Tên:** Tháp Brand QA – ci:53–91. Tâm (0; 61), quay π (mặt chính hướng vào tâm đảo, về phía Bắc). Bệ đá 24×20 (cao 0,6, `addPlat` cao 0,6); sảnh kính 16×12×6 + 4 cột; thân tháp kính 11×40×9 (y 6,9–46,9) có 11 dải trang trí; đỉnh 12×3,4×10 có 4 logo "QA · QC · QE" phát sáng; anten 9 m + đèn đỏ nhấp nháy ở y≈ 60; biển "BÌNH PHAN QUALITY HUB" ở sàn; **đài phun nước** r=3,6 tại 12,6 m phía trước (0; 48,4); điểm Brain tại (0; 53,4) (vòng sáng xanh dương). Va chạm 16,6×12,6. Nhãn "🧠 Tháp Brand QA · QC · QE – QA Brain: phân tích tài liệu, sinh test case" (y=55, fade 260 m).

#### 11.3 Học viện QA + kiosk quiz
Học viện tại (≈16,3; 52,5) dùng mẫu nhà (giải thưởng quiz). 2 kiosk quiz "QUIZ QA – Đúng = có tiền": (−5,6; 4,6) và (5,5; −61,5), màn hình tròn xanh.

#### 11.4 Bến cảng
Cầu tàu x=0 từ z=−62 đến −101 (rộng 3 m, cọc mỗi 4 m); nhánh cầu bến thuyền z=−86 từ x 1,5 đến 9 (rộng 2,6); chỗ câu cá (0; −99,4); bến thuyền (8,4; −86), chỗ đỗ thuyền (11,2; −86); Nhà thuyền (≈−8,0; −61,5). Nhãn "🎣 Chỗ câu cá".

#### 11.5 Bồn hoa/ghế/rác (ci:127–159)
~10 bồn hoa (bán kính 10,5 quanh tâm đảo, loại bỏ gần lối đi và z<−8), ≤8 ghế đá (r=12,8), 2 bồn hoa + 1 ghế trước tháp, 3 bồn trước 3 lô R; 14 hoa mỗi bồn, mỗi bồn có thể tưới (`water`, `growth` – logic nằm ngoài phạm vi). `trashArea` chọn điểm rác ngẫu nhiên.

#### 11.6 Bãi biển công cộng (6b trong wd)
Biển "🏖️ Bãi biển công cộng – Đảo Master Dashboard · miễn phí cho mọi người" tại cực (−0,3; 55) ≈ (52,5; −16,2); 7 cây cọ; 2 ghế đá tại cực (−0,22; 52) và (0,24; 52).

---

### 12. Điểm "chưa rõ" / mâu thuẫn giữa chú thích và mã
1. Chú thích tf:2 ghi "6 ngã tư + 2 ngã ba"; mã sinh **10 ngã giao có đèn** (8 ngã ba T + 2 ngã tư).
2. Đèn: chú thích "xanh 13 s" cho cả 2 trục; mã: dọc 13 s, ngang 11 s.
3. tr:2 ghi "9 trạm"; `STOP_DEF` có **8 trạm**.
4. Đầu pk:1 ghi Cầu Vòm 27 m; mục 4 của chính pk ghi ~19 m; tính từ hàm hồ ≈ 19–20 m.
5. Tên cv:2 ghi bệnh viện x 215–261, z 223–249; mã: x 215,5–260,5.
6. Toạ độ chính xác của Ga Đảo (cáp treo) tính lúc chạy (phụ thuộc `groundH`, `edgeR`); trụ giữa biển cũng tính lúc chạy.
7. Nội thất 13 toà công ty, phòng phỏng vấn, phòng trọ, giao dịch lô đất/chợ/showroom/địa chính: nằm ở interior/life/people… ngoài phạm vi.
8. `data/jobs.json` (số bài việc trí tuệ, mức thưởng) ngoài phạm vi.
9. Hướng cầu Cao nguyên: `landZ` (highland.js) không có trong phạm vi.
10. Số liệu độ dài chính xác của lộ trình buýt `ROUTE.L` tính lúc chạy.

---

### 13. BẢNG TÓM TẮT CÁC KHÔNG GIAN

| Không gian | x0–x1 | z0–z1 | rộng×sâu | tầng | chức năng |
|---|---|---|---|---|---|
| Downtown (nền đảo) | 136–262 | −62…62 | 126×124 | – | mặt bằng thương mại, 7 toà công ty |
| Cầu dây văng đảo ⇄ Downtown | 46,5–137 | −14…14 | 90,5×28 | – | cầu 20 m đường + 2 lối bộ, 2 tháp 26 m |
| Cổng Rời đảo | x=52 | −14,8…14,8 | – | – | ranh giới đảo miễn phí / thế giới mở |
| Phường Khởi Nghiệp | 136–262 | 62–480 | 126×418 | – | khu thế giới mở: chợ, đất, việc, trọ, công cộng |
| Đại lộ Hồ Ngọc | 136–262 | −10…10 | 126×20 | – | trục Đ–T chính |
| Trục Bắc | 168–188 | −62…0 | 20×62 | – | nối cầu Cao nguyên |
| Đại lộ ven Tây | 136–156 | 0–200 | 20×200 | – | |
| Đại lộ ven Đông | 242–262 | 0–200 | 20×200 | – | |
| Nhánh cầu Đồi Brand QC | 252–262 | 76–96 | 10×20 | – | |
| Phố chính Phường | 136–262 | 190–210 | 126×20 | – | |
| Đường Trường Học | 189–209 | 200–470 | 20×270 | – | |
| Đường Bệnh Viện | 136–262 | 280–300 | 126×20 | – | |
| Đường Cao Ốc Nam | 136–262 | 370–390 | 126×20 | – | |
| Đường Ven Biển Nam | 136–262 | 460–480 | 126×20 | – | |
| Bình Phan Tech Hub | 192–214 | −33…−15 | 22×18 | 27 | toà công ty (hq) |
| AutoQA Labs | 218,5–234,5 | −32…−16 | 16×16 | 23 | toà công ty (twist) |
| PerfMax Performance | 241–259 | −33…−15 | 18×18 | 19 | toà công ty (cylinder) |
| Manual Test Studio | 144–160 | −32…−18 | 16×14 | 8 | toà công ty (brick) |
| SecureQA (khoá) | 146–158 | −54…−42 | 12×12 | 13 | toà công ty (dark), bảo vệ |
| QA Federation | 196–214 | −55…−41 | 18×14 | 24 | toà công ty (artdeco) |
| Mobile First QA | 229–251 | −55…−41 | 22×14 | 9 | toà công ty (brick) |
| BugBusters Inc. | 140–164 | 395–413 | 24×18 | 20 | toà công ty (setback) |
| API Hub Tower | 215,5–232,5 | 394,5–411,5 | 17×17 | 30 | toà công ty (spire) |
| DataCheck Corp | 240–260 | 394–410 | 20×16 | 17 | toà công ty (glass) |
| Cloud Test Co. | 148–168 | 439–453 | 20×14 | 14 | toà công ty (setback) |
| DevOps Center (khoá) | 169,5–182,5 | 395–407 | 13×12 | 11 | toà công ty (dark), bảo vệ |
| Contract Testing Ltd | 227–237 | 443–453 | 10×10 | 12 | toà công ty (cylinder) |
| Chợ QC | 143,3–148,7 (tâm 146) | ≈215,2–219,8 | 5,4×4,6 (+sàn) | 1 | chợ (nhà mẫu) |
| Showroom xe | 160,3–165,7 | ≈215,2–219,8 | 5,4×4,6 | 1 | xe máy, ô tô |
| Văn phòng địa chính | 177,3–182,7 | ≈215,2–219,8 | 5,4×4,6 | 1 | mua đất, xây nhà |
| Nhà trọ khởi nghiệp | 139–167,8 | 232,5–237,7 | 28,8×5,2 | 1 | 4 phòng trọ, phòng 1 miễn phí |
| Quầy Bếp Cơm | 178,2–182,8 | 236,9–239,5 | 4,6×2,6 | 1 | việc phụ bếp |
| Trung tâm Việc làm (tháp) | 166–186 | 256–273 | 20×17 (tháp 16×12,6) | 11 (≈47 m) | 10 quầy nghề, bảng việc |
| Lô đất R1–R4 | 143–174,35 (tâm) | 307 | 12 lô tâm cách 10,45 m | 1 | đất ở |
| Lô đất R5–R8 | 143–174,35 | 329 | | 1 | đất ở |
| Lô đất B1–B4 | 143–174,35 | 351 | | 1 | đất kinh doanh |
| Bệnh viện Đa khoa | 215,5–260,5 | 223–249 | 45×26 | 4 | khám bệnh, cấp cứu, trực thăng |
| Trạm cứu hoả | 220–252 | 255–274,5 | 32×19,5 | 2 | 3 gara, 3 xe cứu hoả |
| Trường Tiểu học | 214,6–261,6 | 305,6–364,4 | 47×58,8 | 3 (dãy lớp) | sân trường, bóng rổ, bảng tin |
| Đại công viên Hồ Ngọc | 161,5–236,5 | 15,5–184,5 | 75×169 | – | công viên trung tâm |
| Hồ Ngọc | ≈181–217 | ≈42–160 | ≈36×118 | – | hồ có eo, cá koi, thuyền |
| Đường chạy gạch đỏ | 166–232 (tim) | 26–176 | 66×150 (rộng 5,5) | – | chạy bộ |
| Cầu Vòm Hồ Ngọc | ≈189–208 | 99,4–102,6 | ≈19×3,2 | – | cầu qua eo, cho cá ăn |
| Đảo thủy đình | 193,5–204,5 | 66,5–77,5 | r=5,5 | 1 | đình ngắm hồ |
| Cầu gỗ đỏ ra đảo | 197,7–200,3 | ≈41–67,4 | ≈2,6×26 | – | nối mũi Bắc → đảo |
| Bến thuyền thiên nga | ≈DX0–DXS (bờ Đông) | 128,8–131,2 | 7,6×2,4 | – | thuê thuyền 20 💰 |
| Cổng Bắc + quảng trường | 186–212 | 15,5–22,6 | 26×7,1 | – | sơ đồ, biển chỉ dẫn |
| Góc giải khát | 188,9–209,6 | 19,6–21,75 | ~21×1 | – | 3 máy nước, quầy nước, xe kem |
| Bãi xe đạp | 212,2–221,6 | 15,5–20,2 | ~9×4,7 | – | trang trí |
| Khu thể dục | 221,8–236,5 | 15,5–32 | 14,7×16,5 | – | 5 máy tập, xà đơn |
| Góc cosplay | 161,5–177 | 15,5–31 | ~15×15 | – | chụp ảnh 4 cosplayer |
| Vườn Hoa Tròn | ≈179,2–187,2 | ≈41,6–49,4 | ~8×8 | – | vườn, đồng hồ mặt trời |
| Giàn hoa giấy | 211,8–217,6 | 42,2–45,6 | 5,8×3,4 | – | giàn hoa, 2 ghế |
| Bãi yoga – dưỡng sinh | 173,2–180,2 | 59,6–88,6 | 7×29 | – | lớp yoga, thái cực |
| Sân cầu lông | 218,6–224,4 | 69–82 | 5,8×13 | – | 2 NPC đánh cầu |
| Quảng trường Tây + đài phun | 171,4–184,6 | 94,4–107,6 | r=6,6 | – | ném xu 1 💰 |
| Quảng trường Đông + tượng | 213,4–226,6 | 94,4–107,6 | r=6,6 | – | tượng Kính lúp |
| Vườn Đá – Trúc | 173,4–178,8 | 116–135,5 | 5,4×19,5 | – | góc yên tĩnh |
| Café Bên Hồ + bàn cờ | 218,8–226,4 | 112–138,5 | 7,6×26,5 | 1 | café 5 món, 6 bàn dù, cờ tướng |
| Sân khấu Cỏ | 194,2–203,8 | 166,6–170,4 | 9,6×3,8 | – | hát, nhạc acoustic |
| Sân chơi trẻ em | 162,4–177 | 168–184,5 | 14,6×16,5 | – | xích đu, trượt, bập bênh, hố cát |
| Bãi dã ngoại + thả diều | 221–236,5 | 168–184,5 | ~15,5×16,5 | – | 2 bàn picnic, diều |
| Trạm buýt 1 "Chợ QC" | (166; 205,35) | – | mái 4,5×1,95 | – | Tuyến 01 |
| Trạm buýt 2 "Bệnh viện · Cứu hoả" | (226; 205,35) | – | | – | Tuyến 01 |
| Trạm buýt 3 "Downtown · Cổng công viên" | (222; −5,35) | – | | – | Tuyến 01 |
| Trạm buýt 4 "Đầu cầu Downtown" | (163; −5,35) | – | | – | Tuyến 01 |
| Trạm buýt 5–8 (đảo) | (0;−44,75), (−43,9;8,5), (−29,8;33,4), (−6,2;44,3) | – | | – | Tuyến 01 |
| Ga cáp treo Downtown | ≈132,5–140,5 | ≈−33,7…−19,3 | 8×14,4 | 1 | vé 10 💰 |
| Ga cáp treo Đảo | ≈(49;−35) | – | 8×14,4 | 1 | vé 10 💰 |
| Đường vành đai đảo | r 39,5–46,5 | – | rộng 7 | – | vòng quanh đảo |
| Tháp Brand QA | ≈−12…12 | ≈51…71 | 24×20 (thân 11×9) | ≈11 | QA Brain |
| Bến cảng | −1,5…9 | −101…−62 | cầu tàu 3×39 | – | câu cá, thuyền |

---

<a id="phần-3"></a>

## 03. Nội thất toà nhà công ty, máy tính làm việc, showroom xe và xe đại gia

Tài liệu hiện trạng, đọc từ mã nguồn các file: `js/interior.js`, `js/workpc.js`, `js/jobs.js`, `js/showroom.js`, `js/luxury.js` và danh sách toà trong `js/downtown.js`. Chỉ ghi những gì mã thể hiện; chỗ mã không nói rõ ghi "chưa rõ". Không chép nguyên văn mã.

Quy ước chung: 1 ô = 1 m = 1 đơn vị toạ độ. Trục x sang phải, z hướng "ra phía trước" (về phía mặt tiền kính), y lên trên. Góc quay `rotY = 0` nghĩa là vật nhìn về +z, `rotY = π` nhìn về -z.

---

### 0. Kiến trúc chung của các cảnh nội thất

#### 0.1. Cảnh riêng, không dựng chung với thế giới ngoài

- `interior.js` tạo một `THREE.Scene` riêng tên `IS` (nền 0x0f1520), có 1 đèn bán cầu (cường độ .55) và 1 đèn định hướng có đổ bóng (bản đồ bóng 1024 nếu chất lượng thấp, 2048 nếu không; vùng bóng ±22).
- `showroom.js` có cảnh riêng `SS` (đèn bán cầu .75, đèn định hướng 1.0, bóng 1024, vùng ±26).
- Khi vào, cảnh được hoán đổi bằng `renderPass.scene = IS` (hoặc `SS`); nhân vật người chơi `me.g` được gỡ khỏi `scene` và thêm vào cảnh trong. Khi ra thì làm ngược lại.
- Khi vào, mã cất toàn bộ danh sách va chạm của thế giới ngoài (`SEGS`, `circles`, `boxes`, `plats`, `INTER`) vào `st.saved` rồi làm rỗng; ra thì trả lại. Vì vậy mọi toạ độ `circles/boxes/plats/INTER` trong nội thất là toạ độ PHÒNG, độc lập với toạ độ thành phố.
- Máy ảnh bị giới hạn bằng `HOOK.camBox`: trong toà là x ±(RW-.5), z ±(RD-.5), trần FY+CH-.3; trong showroom x ±(22-.5), z ±(14-.5), trần FY+6-.4. Khoảng cách camera `cam.dist` bị giảm còn tối đa 4.6 (toà) hoặc 6 (showroom) khi ở trong.
- Chuyển cảnh: màn đen mờ dần (`fade`, 0.28 s, chờ 300 ms rồi dựng cảnh, 60 ms sau mở lại).
- Nhãn chữ trong nhà dùng nhóm `'interior'` (`HOOK.labelGroup`).

#### 0.2. Hệ toạ độ phòng (toà công ty)

Hằng số: `RW=18`, `RD=12`, `CH=3.4` (chiều cao trần), `FY=.1` (mặt sàn, y).

- Sàn và trần là hộp `RW*2 × RD*2` = 36 m (x) × 24 m (z), tâm (0,0). Tức x thuộc [-18, 18], z thuộc [-12, 12].
- z = -12 (RD âm): bức tường sau, có thang máy, bảng tên tầng, logo (sảnh).
- z = +12: mặt tiền. Ở sảnh là kính + cửa ra ngoài; ở các tầng khác là dải cửa sổ nhìn ra đường chân trời.
- x = ±18: tường bên, có dải cửa sổ (kể cả ở sảnh).
- Toạ độ bàn, ghế, vật dụng trong tài liệu này đều là (x, z) của phòng này; y thường là FY + độ cao.
- Va chạm: `solid(x0,x1,z0,z1)` thêm một hình chữ nhật cấm đi vào `boxes`; `circles` là cột tròn (cây, bàn tròn, người đứng); `plats` có 1 sàn hình chữ nhật cao FY phủ cả phòng.
- Vị trí xuất hiện của người chơi: đi thang máy tới thì ở (0, -9.4) quay mặt +z (`-RD+2.6`); vào từ ngoài phố thì ở sảnh (0, 9.6) quay mặt -z (`RD-2.4`).

#### 0.3. Vỏ phòng chung (`shell`)

Mọi loại tầng đều gọi `shell(kind, b, fl, D)`:

| Thành phần | Chi tiết |
|---|---|
| Sàn | Sảnh: đá cẩm thạch bóng (roughness .12). Căng-tin: gạch ô cờ. Giám đốc: gỗ. Tầng phòng ban: thảm theo màu `carpet` của phòng ban (mặc định 0x4a5566) |
| Trần | hộp trắng, lưới đèn panel 1.4×.7 cách nhau 4 m ở x từ -15 bước 4, z từ -9.5 bước 4 |
| Tường sau | z = -12.1, dày .2, màu tường theo theme công ty |
| Viền màu | chỉ khi có phòng ban (D): dải 36×.12 ở y = FY+CH-.35, tại z = -11.96, màu `accent` của phòng ban |
| Dải cửa sổ | tường thấp .9 m + kính + khung dọc cách 2.4 m + trần thấp; tranh nền là "đường chân trời thành phố" (ban ngày/đêm đổi theo `W.night > .5`). Có ở z=+12.1 (trừ sảnh) và ở x=±18.1 (mọi loại tầng) |
| Mặt tiền sảnh | kính 36×3.4 ở z = +12.1, trụ kính cách 3 m, cửa thép 3×2.6 ở giữa; điểm bấm E "Ra ngoài phố" tại (0, 10.6) r=1.6 |
| Biên va chạm | 4 hộp mỏng quanh phòng |
| Thang máy | 2 cửa thép tại x = ±1.65, z = -12+.08; bảng chỉ tầng "▲ n" (1.2×.3) tại (0, y2.75, -11.88); nút gọi tại (0, y1.2). Điểm bấm E "Thang máy · chọn tầng" tại (0, -10.3) r=1.7 |
| Biển tên tầng | 4.2×.66 tại (-5.2, y2.3, -11.88): "tên viết tắt toà · Tầng n" + tên tầng; sọc màu = accent phòng ban (hoặc màu toà ở sảnh/căng-tin/giám đốc) |

Thang máy chỉ là cửa trang trí; chuyển tầng làm bằng menu (mục 5.4).

#### 0.4. Theme theo công ty (`THEMES`, `themeOf`)

Chọn theme = `THEMES[hs(tên toà) % 6]` (`hs` là hàm băm chuỗi, hệ số 31, khởi tạo 7). Theme áp dụng cho mọi tầng của toà (đổi màu tường, kiểu mặt bàn, góc vui chơi):

| Chỉ số | Màu tường | Mặt bàn | Góc vui chơi (`fun`) |
|---|---|---|---|
| 0 | 0xd9d4ca | trắng | pingpong |
| 1 | 0xe6dccb | gỗ | beanbag |
| 2 | 0xcfdbe3 | trắng | arcade |
| 3 | 0xe3e8dc | gỗ | garden |
| 4 | 0xe8e1ef | đen (dark) | hammock |
| 5 | 0xf0e6d8 | gỗ | pingpong |

Theme thực tế của 13 toà (tính bằng đúng hàm băm trong mã, đã chạy thử riêng hàm băm):

| Toà | Theme | Màu tường | Mặt bàn | Góc vui chơi |
|---|---|---|---|---|
| Bình Phan Tech Hub | 5 | 0xf0e6d8 | gỗ | pingpong |
| AutoQA Labs | 2 | 0xcfdbe3 | trắng | arcade |
| PerfMax Performance | 4 | 0xe8e1ef | đen | hammock |
| BugBusters Inc. | 5 | 0xf0e6d8 | gỗ | pingpong |
| API Hub Tower | 3 | 0xe3e8dc | gỗ | garden |
| DataCheck Corp | 3 | 0xe3e8dc | gỗ | garden |
| Manual Test Studio | 3 | 0xe3e8dc | gỗ | garden |
| SecureQA | 4 | 0xe8e1ef | đen | hammock |
| QA Federation | 4 | 0xe8e1ef | đen | hammock |
| Mobile First QA | 3 | 0xe3e8dc | gỗ | garden |
| Cloud Test Co. | 4 | 0xe8e1ef | đen | hammock |
| DevOps Center | 3 | 0xe3e8dc | gỗ | garden |
| Contract Testing Ltd | 3 | 0xe3e8dc | gỗ | garden |

Chỉ tầng phòng ban dùng mặt bàn và góc vui chơi theo theme. Màu tường (`wallM`) đổi theo theme cho mọi loại tầng, kể cả sảnh, căng-tin, giám đốc. Trong 13 toà hiện có chỉ dùng theme 2, 3, 4, 5; theme 0 và 1 chưa toà nào dùng.

#### 0.5. Các hàm dựng nội thất dùng chung

- `desk(x,z,f,key,dual)`: bàn 1.5×.05×.75 tại độ cao FY+.74, 2 chân thép, màn hình 0.62×.38 quay về phía người ngồi (f=+1: người ngồi ở z-.75, mặt màn hình nhìn -z; f=-1 ngược lại), bàn phím, 30% có cốc. Nếu `dual` thì 2 màn (màn thứ 2 luôn là "mail"). Tự đặt 1 ghế (không có điểm ngồi riêng).
- `chair(x,z,rotY,mat,sit)`: ghế xoay; nếu `sit=true` thì thêm điểm ngồi E/C.
- `sofa(x,z,rotY,col,w,seats)`: sofa dài w, cứ 0.8 m có 1 chỗ ngồi (bán kính bấm 2.2).
- `plant(x,z,s)`: chậu cây, thêm cột tròn r=.35·s.
- `rug`, `frame` (tranh khung đen), `plate` (tấm phẳng có thể phát sáng), `stand` (bảng trắng đứng, có va chạm).
- Hình màn hình theo nghề (`drawScr`): code, test, kanban, chart, sheet, crm, dash, design, mail, gantt; dạng tối cho code/test/dash.
- 6 bức tranh nghệ thuật `ART[0..5]` vẽ thủ tục.

Điểm ngồi (`seat`) dùng `W.addSeat` với phạm vi `'interior'`: bấm E hoặc C để ngồi. Khi dựng xong tầng, ghế nào có bot ngồi gần (<.5 m) bị đánh dấu `taken='bot'`.

#### 0.6. Dựng và dọn tầng

`go(idx, at)` dọn tầng cũ (`clearFloor`: bỏ ghế phạm vi interior, bỏ nhãn, xả hình học nhưng KHÔNG xả hình dùng chung với avatar, xoá `circles/boxes/plats/INTER`), đặt chỉ số tầng, `buildFloor()` (đặt theme, gọi `BUILD[kind]`, gộp mesh tĩnh `batchStatic`, đặt đèn, báo cho `W.work.onFloor`). Mỗi lần vào tầng là dựng lại hoàn toàn, nên NPC và vị trí ngẫu nhiên (bàn nào có người, cốc trên bàn...) khác nhau mỗi lần.

---

### 1. Toà công ty: số tầng, loại tầng, phòng ban

#### 1.1. Danh sách 13 toà (`DEFS` trong downtown.js)

Cột "Cửa" cho `face`: +1 cửa nhìn về +z, -1 nhìn về -z. `locked` = toà "chỉ nhân viên" (bảo vệ canh cửa). Số tầng = `max(7, round(h/3.6))`.

| # | Tên toà | Viết tắt | Kiểu | x, z (tâm) | w×d×h | Cửa | Nhóm (teams) | Khoá |
|---|---|---|---|---|---|---|---|---|
| 1 | Bình Phan Tech Hub | BP Tech | hq | 203, -24 | 22×18×96 | +1 | qa, dev | không |
| 2 | AutoQA Labs | AutoQA | twist | 226.5, -24 | 16×16×84 | +1 | qa, dev | không |
| 3 | PerfMax Performance | PerfMax | cylinder | 250, -24 | 18×18×70 | +1 | perf | không |
| 4 | BugBusters Inc. | BugBusters | setback | 152, 404 | 24×18×72 | -1 | qa | không |
| 5 | API Hub Tower | API Hub | spire | 224, 403 | 17×17×108 | -1 | dev, qa | không |
| 6 | DataCheck Corp | DataCheck | glass | 250, 402 | 20×16×60 | -1 | data | không |
| 7 | Manual Test Studio | MTS | brick | 152, -25 | 16×14×28 | +1 | qa | không |
| 8 | SecureQA | SecureQA | dark | 152, -48 | 12×12×46 | -1 | sec | có |
| 9 | QA Federation | QA Fed | artdeco | 205, -48 | 18×14×88 | -1 | qa, data | không |
| 10 | Mobile First QA | MobileFirst | brick | 240, -48 | 22×14×34 | -1 | mobile | không |
| 11 | Cloud Test Co. | CloudTest | setback | 158, 446 | 20×14×50 | +1 | perf, dev | không |
| 12 | DevOps Center | DevOps | dark | 176, 401 | 13×12×40 | -1 | dev | có |
| 13 | Contract Testing Ltd | Contract | cylinder | 232, 448 | 10×10×44 | +1 | qa | không |

Ghi chú về toà (chỉ để biết tên và kiểu):
- Bảy toà đầu hàng Bắc Downtown (z âm): #1, #2, #3, #7, #8, #9, #10; sáu toà còn lại (z 400-450) ở khối cao ốc phía Nam theo chú thích trong mã. Chú thích mã: hàng z ≈ -24/-25 có cửa ra Đại lộ Hồ Ngọc (z=0), hàng z=-48 có cửa ra bờ biển.
- Các kiểu toà thực có: hq, twist, cylinder, setback, spire, glass, brick, dark, artdeco, tức 9 kiểu (chú thích đầu file downtown.js ghi "8 kiểu", lệch với danh sách thực).
- Vị trí cửa chính: `door = (t.x, t.z + face·(d/2 + 2.3))`, quay mặt `0` nếu face > 0, `π` nếu face < 0. Vòng sáng vàng nhấp nháy dưới đất, bán kính 1.0-1.25; điểm bấm E bán kính 2.
- Toà `locked`: có 1 bảo vệ đứng cạnh cửa tại (door.x + 2.4, door.z - face·.6); khách không quá được cổng, chỉ ở sảnh (phỏng vấn).
- Nhãn trên cửa hiện số tầng `round(h/3.6)` (không áp `max(7, ...)`), nên toà thấp như Manual Test Studio (h=28) hiện "8 tầng" và khớp N=8; không có toà nào có h/3.6 < 7 làm lệch.

#### 1.2. Hồ sơ công ty (`profileOf`)

- `product = true` nếu tên toà thuộc tập {Bình Phan Tech Hub, API Hub Tower, DataCheck Corp, Mobile First QA, Cloud Test Co., DevOps Center} hoặc `style==='hq'`.
- Product ("Công ty sản phẩm (Product)"): 8 phòng ban theo thứ tự `hr, product, dev, qa, sales, marketing, accounting, ops`.
- Outsource ("Công ty gia công phần mềm (Outsource)"): 4 phòng ban `hr, dev, qa, pmo`.
- Toàn game có 9 phòng ban: `dev, qa, pmo, product, sales, marketing, accounting, ops, hr` (pmo chỉ có ở Outsource; product, sales, marketing, accounting, ops chỉ có ở Product).

#### 1.3. Công thức số tầng (`floorsOf`)

- N = `max(7, round(h / 3.6))`.
- Tầng 1 luôn là `lobby` ("Sảnh lễ tân").
- Phòng ban thứ i (i từ 0, k = tổng số phòng ban) ở tầng `2 + floor(i · (N-4) / k)`. Hệ quả: các phòng ban dàn đều trong khoảng tầng 2 đến N-3; với toà thấp, hai phòng ban có thể trùng số tầng (xem bảng).
- Tầng N-1 là `canteen` ("Nhà ăn nhân viên"), tầng N là `director` ("Phòng Giám đốc").
- Tên phòng QA đổi theo nhóm toà: lấy nhóm đầu tiên khác `qa` và `dev` trong `teams`, tra `QA_NAME`: perf = "Phòng QA · Performance", sec = "Phòng QA · Bảo mật (Pentest)", data = "Phòng QA · Data", mobile = "Phòng QA · Mobile"; nếu không có thì dùng tên mặc định "Phòng Kiểm thử QA/QC".
- Tổng số loại tầng: 4 (`lobby`, `dept`, `canteen`, `director`). Mỗi toà dựng lại từng tầng theo yêu cầu, tất cả tầng cùng loại có chung khung (kích thước phòng 36×24).

#### 1.4. Bảng tầng của từng toà (tính bằng đúng công thức mã)

Cột dạng `tầng: phòng ban (kiểu bàn)`. "Kiểu bàn" tính bằng công thức ở mục 3.1 (đã chạy thử hàm băm). Tầng 1 = Sảnh, N-1 = Nhà ăn, N = Giám đốc.

| Toà | N | Các tầng phòng ban (tầng: phòng ban, kiểu bố trí bàn) | Nhà ăn | Giám đốc | Ông chủ (`bossOf`) |
|---|---|---|---|---|---|
| Bình Phan Tech Hub | 27 | 2 hr hub; 4 product shared; 7 dev hub; 10 qa bench; 13 sales pods; 16 marketing rows; 19 accounting shared; 22 ops hub | 26 | 27 | Bình Phan |
| AutoQA Labs | 23 | 2 hr shared; 6 dev pods; 11 qa pods; 16 pmo pods | 22 | 23 | Anh trai ốp pồ |
| PerfMax Performance | 19 | 2 hr pods; 5 dev rows; 9 qa(Performance) bench; 13 pmo shared | 18 | 19 | Bình Vip Pro |
| BugBusters Inc. | 20 | 2 hr bench; 6 dev shared; 10 qa pods; 14 pmo hub | 19 | 20 | Bình Phan |
| API Hub Tower | 30 | 2 hr rows; 5 product shared; 8 dev hub; 11 qa bench; 15 sales shared; 18 marketing hub; 21 accounting bench; 24 ops pods | 29 | 30 | Anh trai say Salary |
| DataCheck Corp | 17 | 2 hr rows; 3 product hub; 5 dev shared; 6 qa(Data) bench; 8 sales hub; 10 marketing shared; 11 accounting bench; 13 ops hub | 16 | 17 | Anh trai say Salary |
| Manual Test Studio | 8 | 2 hr hub; 3 dev pods; 4 qa shared; 5 pmo bench | 7 | 8 | Bình Internship |
| SecureQA | 13 | 2 hr pods; 4 dev bench; 6 qa(Pentest) hub; 8 pmo shared | 12 | 13 | Bình Vip Pro |
| QA Federation | 24 | 2 hr shared; 7 dev shared; 12 qa(Data) shared; 17 pmo shared | 23 | 24 | Anh trai ốp pồ |
| Mobile First QA | 9 | 2 hr bench; 2 product bench; 3 dev rows; 3 qa(Mobile) rows; 4 sales hub; 5 marketing pods; 5 accounting pods; 6 ops shared | 8 | 9 | Bình Phan |
| Cloud Test Co. | 14 | 2 hr bench; 3 product rows; 4 dev hub; 5 qa(Performance) pods; 7 sales bench; 8 marketing rows; 9 accounting hub; 10 ops pods | 13 | 14 | Bình Phan |
| DevOps Center | 11 | 2 hr pods; 2 product pods; 3 dev shared; 4 qa bench; 5 sales rows; 6 marketing hub; 7 accounting pods; 8 ops shared | 10 | 11 | Bình Vip Pro |
| Contract Testing Ltd | 12 | 2 hr shared; 4 dev rows; 6 qa pods; 8 pmo bench | 11 | 12 | Anh trai ốp pồ |

Lưu ý quan trọng khi thiết kế lại:
- Mobile First QA (tầng 2 có cả hr và product; tầng 3 có dev và qa; tầng 5 có marketing và accounting) và DevOps Center (tầng 2 có cả hr và product) có hai phòng ban cùng số tầng. Mã không gộp chúng; menu thang máy hiển thị hai thẻ cùng số tầng, và chuyển tầng làm theo chỉ số trong mảng chứ không theo số tầng. Hệ quả thực tế: mã `workpc.js` tìm "tầng của bàn bạn" bằng phòng ban nên vẫn đúng.
- Cùng một toà luôn dùng cùng một theme (mục 0.4) nhưng kiểu bàn thay đổi theo từng tầng.

---

### 2. Các loại tầng

#### 2.1. Sảnh (`lobby`, tầng 1)

Kích thước 36×24 m, sàn đá cẩm thạch. Không có góc vui chơi, không có tủ phòng ban.

| Khu | Vị trí (x, z) | Chi tiết |
|---|---|---|
| Logo công ty | (-11, y2.0, -11.88) | bảng 8×2.5, tên toà + loại công ty, sọc màu toà |
| Quầy lễ tân | (0, 1.5), 5×1.1×1; mặt 5.2×1.2; dải sáng màu toà ở z=2.02 | va chạm x -2.6..2.6, z .9..2.1 |
| Lễ tân (NPC) | (0, .4), quay +z | vai "Lễ tân", đứng; áo màu toà |
| Điểm bấm lễ tân | (0, 3.2) r=1.9, ưu tiên .4 | mở hộp thoại lễ tân |
| Cổng quẹt thẻ | z = -5; kính ở x -17.8..-1.4 và 1.4..17.8; 2 máy quẹt tại x=±1.25 | va chạm cánh cổng x ±1.1 |
| Điểm bấm cổng | (0, -3.7) r=1.5, ưu tiên .6 | |
| Bảo vệ (NPC) | (3.4, -6.4), nghiêng -.6 rad, tư thế khoanh tay (`cross`) | đồng phục cap |
| Phòng phỏng vấn | góc phải trước, x 8.5..18, z 2..12 | tường kính, xem 2.1.1 |
| Khu chờ | 2 sofa (-12, 5) quay 0 và (-12, 9.6) quay π, dài 3.2; bàn trà (-12, 7.3); thảm (-12, 7.3) 5×5.6 | mỗi sofa 3 chỗ ngồi |
| Tranh | ART[0] tại (-17.86, y2.0, -1) và ART[4] tại (-17.86, y2.0, 3), quay π/2 | |
| Cây | (-17, 10.8) tỷ lệ 1.3; (6.8, 10.8) 1.3; (-17, -10.8) 1.2; (17, -10.8) 1.2 | |
| Khách đi lại | bắt đầu (-6, 6.5), vòng (-6,6.5)→(-6,-2.6)→(5.6,-2.6)→(5.6,6.5) | 1 NPC, tốc độ 1.3 m/s |
| Nhân viên đi lại | bắt đầu (6, -9), vòng (6,-9)→(-6,-9)→(-6,-7)→(6,-7) | ở phía sau cổng |
| Hướng dẫn viên chờ | (2.6, 3.3), quay -.4 | chỉ xuất hiện khi chưa đi làm ở toà này và toà không khoá |

Cổng chia sảnh: phía sau cổng (z < -5) có thang máy, bảo vệ và nhân viên đi lại; phía trước (z > -5) là khu khách.

##### 2.1.1. Phòng phỏng vấn (sảnh)

- Tường kính dọc x=8.5 từ z≈3.9 đến 12 (có lối vào rộng 1.8 m ở z 2..3.8) và tường kính ngang z=2 từ x=8.5 đến 18. Cột đen ở góc (8.5, 2).
- Biển "📝 PHÒNG PHỎNG VẤN" 2.6×1.3 tại (13.2, y2.4, 1.95), quay π (nhìn ra sảnh).
- Thảm 6×4.6 tại (13.2, 7), bàn gỗ 2.6×1.1 tại (13.2, 7) (va chạm x 11.8..14.6, z 6.4..7.6).
- Ghế HR tại (13.2, 8.2) quay π (có người ngồi); ghế ứng viên tại (13.2, 5.8) quay 0 (không có điểm ngồi).
- NPC "HR phỏng vấn": ngồi tại (13.2, 8.2), áo trắng; lời thoại: "Mời bạn ngồi, mình bắt đầu nhé!", "Bình tĩnh, đọc kỹ câu hỏi nha."
- Tranh ART[2] tại (17.86, y2.0, 7), quay -π/2; cây (17.2, 11.2) tỷ lệ 1.1.
- Điểm bấm E tại (13.2, 5.1) r=1.7, ưu tiên .5: nếu đã là nhân viên toà thì hiện "Bạn đã là nhân viên ở đây"; nếu chưa thì bắt đầu phỏng vấn.

##### 2.1.2. Cổng quẹt thẻ (`buildGate`)

- Hai máy 0.32×1.0×1.3 tại (±1.25, -5) có đèn xanh; giữa là hai cánh kính xoay mở (góc đến 90 độ) và 1 hộp chặn x -1.1..1.1.
- Nhãn bấm E thay đổi: nhân viên "Quẹt thẻ nhân viên"; đang tham quan "Qua cổng cùng hướng dẫn viên"; toà khoá "Chỉ nhân viên – phỏng vấn ở phòng bên phải"; còn lại "Tham quan? Nhờ lễ tân gọi hướng dẫn viên".
- Nhân viên bấm E: tiếng bíp cao, mở cổng 4 s, chấm công (mục 5.2). Đang tham quan: mở cổng 4 s, hướng dẫn viên nói "Em quẹt thẻ khách rồi...". Người ngoài: tiếng bíp thấp, thông báo từ chối.
- Tự mở: người chơi đứng trong dải z -7.6..-5.3, |x| < 1.8 (đi từ trong ra) thì cổng tự mở 2.5 s; khi đang tham quan và người chơi đứng gần phía trước cổng (|x|<2, z -4.6..-2.6) cổng tự mở 3 s. Cổng không đóng khi người chơi còn đứng trong làn (|x|<1.2, |z+5|<.8).

#### 2.2. Tầng phòng ban (`dept`)

Cấu trúc chung cho cả 9 phòng ban, rồi mỗi phòng ban có khu đặc trưng riêng (mục 4). Tất cả đều dùng vỏ `shell('office', ...)` với màu thảm và viền theo phòng ban.

Các khu theo toạ độ phòng:

| Khu | Vị trí | Chi tiết |
|---|---|---|
| Khu bàn làm việc | x -16.4..-3.3, hai băng: băng Bắc z ≈ -6.4 và băng Nam z ≈ 3.4 | 5 kiểu bố trí, xem mục 3 |
| Lối đi giữa | z ≈ -1 | NPC đi tuần ở đây |
| Tranh 2 bức | ART[(hash(dept)) mod 6] tại (-14.5, y2.1, -11.86); ART[(hash+3) mod 6] tại (-10.5, y2.1, -11.86) | tranh 1.4×1.8 |
| Phòng họp kính | x 4..17.8, z -11.8..-3 | xem 2.2.1 |
| Khu đặc trưng phòng ban | khu x 5..17, z 0..7.5 (theo chú thích mã) | xem mục 4; ở layout `shared` thay bằng phòng ban thứ 2 |
| Góc vui chơi | quanh (-4.8, 9.2), biển ở (-4.8, y2.6, 11.88) | theo theme, xem mục 3.5 |
| Pantry | x 9.8..16.9, z 10.2..12 | quầy 6×1×1 tại (13, 10.8); tủ lạnh/máy cà phê steel tại (10.5, 10.8); bình nước xanh tại (16.5, 10.8); 3 cốc trên quầy (12, 12.3, 12.6; z 10.8) |
| Lounge | thảm 8×4 tại (-12, 9.5) | sofa 3.2 tại (-12, 11.1) quay π; sofa 1.6 tại (-15.8, 9.4) quay π/2; bàn trà (-12, 9.4); vài cuốn sách trên bàn |
| Cây | (-17, -10.8), (3, 10.8), (-17, 10.8), (3, -10.8), (-3.6, -1.4), tỷ lệ 1.1 | |
| Bàn của bạn | chỉ khi bạn là nhân viên toà này và đang ở tầng phòng QA | xem mục 5.3 |

##### 2.2.1. Phòng họp kính

- Tường kính dọc tại x=4 từ z=-11.8 đến -4.6; tường kính ngang tại z=-3 từ x=5.8 đến 17.8. Cửa ra vào là khoảng hở góc Tây-Nam: x 4..5.8 ở z=-3 và z -4.6..-3 ở x=4.
- Bàn họp 4.2×1.6 tại (11, -7.4); va chạm x 8.7..13.3, z -8.4..-6.4.
- Bảng họp (tấm phát sáng 3.4×1.9) trên tường sau tại (11, y1.85, -11.85); tiêu đề "🗣️ Họp <vai> · Sprint 24", nội dung là hình màn hình đầu tiên của phòng ban (`D.scr[0]`).
- 4 ghế: (9.6, -6.4) và (12.4, -6.4) quay π; (9.6, -8.4) và (12.4, -8.4) quay 0.
- NPC: "Lead" đứng thuyết trình (`present`) tại (13.9, -9.4), nghiêng -.7; 3 người ngồi họp tại 3 ghế đầu (9.6,-6.4), (12.4,-6.4), (9.6,-8.4) (vai là vai phòng ban). Lead trò chuyện luân phiên với người 1 và người 3 bằng kịch bản `MEET` (3 kịch bản, mục 6.3).
- Điểm bấm E "Vào họp Daily 15 phút" tại (6.2, -6.6) r=1.8 chỉ có khi `mine` (mục 5.3).

#### 2.3. Nhà ăn (`canteen`)

Sàn gạch ô cờ. Dùng `shell('canteen')` (không có viền phòng ban).

| Khu | Vị trí | Chi tiết |
|---|---|---|
| Quầy phục vụ | (-10, -10.4), 12×1×1; kính chắn 12×.5 tại (-10, y1.45, -9.95) | 10 khay thép tại x = -15.4 + 1.2i (i=0..9), z=-10.4, mỗi khay có đồ ăn hình cầu dẹt 5 màu; va chạm x -16.2..-3.8, z -12..-9.8 |
| Đầu bếp Robo | (-10, -11.2) | mô hình robot, đứng; lời thoại: "Cơm gà hôm nay ngon lắm!", "Mời bạn chọn món 🍱" |
| Điểm bấm ăn | (-8, -9) r=1.6 | xem 5.5 |
| Hàng đợi | 3 NPC "Nhân viên" tại (-8.5 + 0.9i, -8.6 + 0.9i), quay π | lời thoại: "Đói quá…", "Hôm nay ăn gì nhỉ?"; 2 người đầu trò chuyện (kịch bản PANTRY) |
| Bàn ăn | 12 bàn 2.6×1.1: x ∈ {-12, -6.5, 6.5, 12.5} × z ∈ {-3.5, 1.5, 6.5} | mỗi bàn 6 ghế đẩu (x lệch -.8, 0, .8; z lệch ±.85); mỗi ghế có điểm ngồi |
| Người ăn | mỗi ghế 30% có 1 NPC "Nhân viên" ngồi ăn, tối đa 12 người | các cặp ngồi gần (<2.2 m) trò chuyện với kịch bản PANTRY |
| Máy bán nước | 2 tủ 1×1.9×.8 tại (16.6, -11.4) đỏ và (15.4, -11.4) xanh; va chạm x 14.8..18, z -12..-10.9 | |
| Cây | (-17, 10.8), (17, 10.8) tỷ lệ 1.2 | |

#### 2.4. Phòng Giám đốc (`director`)

Sàn gỗ. Dùng `shell('director')`.

| Khu | Vị trí | Chi tiết |
|---|---|---|
| Thảm đỏ | (0, -3.5) 9×6 | |
| Bàn giám đốc | (0, y.88, -6.2), 3.2×1.4; mặt trước tại z=-5.55 | màn hình (-.6, ., -6.5), vật trang trí vàng tại (.9, ., -5.7); va chạm x ±1.8, z -7..-5.4 |
| Giám đốc (NPC) | (0, -7.05), quay 0, tư thế gõ (`type`) | tên "Giám đốc <ông chủ>" (mục 1.4); áo vest đen; đeo kính nếu tên có "Pro"; 3 câu thoại giới thiệu (mục 6.2) |
| Ghế khách | (-.9, -4.4) và (.9, -4.4) quay π | không có điểm ngồi riêng |
| Điểm bấm | (0, -3.6) r=1.6: "Chào Giám đốc" | giám đốc nói 1 câu ngẫu nhiên |
| Sofa khách | (-12, 4) hộp 3.6×.45×1 tựa lưng ở z=3.4; bàn trà (-12, 5.6) | 3 chỗ ngồi tại x=-12.95, -12, -11.05 với z=4.05, bán kính bấm 2.5; va chạm x -13.9..-10.1, z 3.2..6.2 |
| Giá sách | dọc tường trái tại x = -17.5, 4 cột × 4 tầng: z = -6 + 1.3i (i=0..3), y = .5 + .6j | mỗi tầng 5 sách màu; va chạm x -18..-17.2, z -6.8..-1.2 |
| Tủ cúp | tủ 2.6×.85×.5 tại (8.6, -11.5) + 3 cúp vàng tại x=8, 8.6, 9.2 (z=-11.5, y 1.15); va chạm x 7.2..10 | |
| Tranh | ART[1] tại (-4.5, y2.0, -11.86) 1.6×2; ART[5] tại (4.5, y2.0, -11.86) | |
| Thư ký (NPC) | bàn 1.4×.7 tại (5, -9), ghế (5, -8.3), NPC ngồi gõ phím quay π | nữ; lời thoại: "Giám đốc đang rảnh, mời bạn vào ạ.", "Lịch họp chiều nay kín rồi…" |
| Cây | (-17, 10.8) 1.3; (17, 10.8) 1.3; (17, -10.8) 1.1 | |

Phòng giám đốc không có góc vui chơi, pantry, lounge.

---

### 3. Bố trí bàn, góc vui chơi

#### 3.1. Quy tắc chọn kiểu bố trí

`layoutOf(b, fl) = LAYOUTS[(hash(tên toà) + n·3) mod 5]` với `n` là số tầng và `LAYOUTS = [rows, pods, bench, hub, shared]`. Nghĩa là mỗi tầng của mỗi toà có kiểu cố định (giả ngẫu nhiên) theo tên toà và số tầng; hai tầng liền nhau thường khác kiểu. Bảng kiểu thực của từng tầng đã nằm ở mục 1.4.

Khu bàn trái: `deskArea(kiểu, D, danh sách ghế, -16.4, -3.3)` với băng mặc định [-6.4, 3.4]. Mỗi bàn được gán màn hình luân phiên từ `D.scr`; riêng Dev và QA (`dual`) có 40-50% bàn 2 màn hình. Mỗi bàn đồng thời đăng ký 1 "ghế" (x, z, hướng) vào danh sách dùng để đặt NPC ngồi gõ phím.

| Kiểu | Mô tả | Số bàn | Chi tiết toạ độ |
|---|---|---|---|
| `rows` (hàng) | 4 hàng song song | 6 bàn/hàng × 4 = 24 | hàng tại z = -7.2 (quay +), -5.6 (quay -), 2.6 (+), 4.2 (-); x = -15.5 bước 2.1 tới -5.0 (6 bàn); dải màu phòng ban dài 12.5 ở z=-6.4 và 3.4 (y .98); va chạm x -16.4..-3.3 và z -8.2..-4.6, 1.6..5.2 |
| `pods` (cụm 4) | cụm 4 bàn đối mặt | 3 cụm/băng × 2 băng × 4 = 24 | tâm cụm x = -14.22, -10.05, -5.88; băng z = -6.4 và 3.4; trong cụm 2 bàn x lệch ±.78, hai hàng z lệch ∓.4; vách ngăn 3.1×.4 màu phòng ban; ghế ở z lệch ∓1.15; va chạm cụm x ±1.6, z ±.8 |
| `bench` (bàn dài) | 2 dãy bàn dài + dải cây | 8 cột × 2 bàn × 2 băng = 32 | x = -15.4 bước 1.6 tới -4.2; dải gỗ giữa 12.1×.35×.3 + bụi cây tròn mỗi .9 m; va chạm theo băng |
| `hub` (vòng quanh) | bàn tròn có cây giữa + 6 bàn xoay quanh + cụm 4 | 6 + 12 = 18 | trung tâm (-9.85, -6.4): bệ gỗ tròn r1.2 + bụi cây, cột r1.3; 6 bàn 1.4×.7 trên elip bán kính 2.9 (x) × 1.6 (z) hướng vào tâm, có ghế; băng Nam z=3.4 là 3 cụm `pods` như trên |
| `shared` (sàn chung 2 phòng ban) | nửa trái là phòng ban của tầng (pods), nửa phải là phòng ban thứ 2 | 24 + 8 | nửa trái `pods` như trên; nửa phải: thảm 13×6.4 tại (11.6, 3.4) màu thảm phòng ban 2, `pods` x 6.2..17.6 chỉ ở băng z=3.4 (2 cụm tại x≈9.05 và 14.75); vách kính thấp 1.25 m dọc x=-1.6 từ z=-2.6 đến 6.2 (chừa khe quanh z=-.9), kèm chậu cây; 2 biển treo (-9.8, y2.65, -.9) "💼 <tên phòng ban trái>" và (11.6, y2.65, -.9) "💼 <tên phòng ban phải>" |

Phòng ban thứ 2 (`D2`) của sàn chung: phòng ban đầu tiên trong danh sách của toà khác phòng ban của tầng (thực tế là `hr`, hoặc `product` nếu là Product và tầng là hr, hoặc `dev` nếu Outsource và tầng là hr). Trên sàn chung có 6 NPC phòng ban 2 ngồi gõ phím + 1 người ghé hỏi chuyện (dùng thoại của phòng ban 2). Khu đặc trưng (FEAT) của CẢ HAI phòng ban đều KHÔNG dựng ở tầng `shared`; chỉ có biển tên.

Ghi chú: ở kiểu `shared` NPC "đứng cạnh" mặc định (xem 6.1) vẫn đặt tại (11.6, 3.1) hoặc toạ độ riêng của hr/pmo. Mã không xử lý va chạm giữa NPC này và bàn của khu phải; chưa rõ có chồng lên bàn không.

#### 3.2. Màu theo phòng ban (`DEPTS`)

| Mã | Tên phòng ban | Vai (role) | Thảm | Viền (accent) | Màn hình ưu tiên | Dual |
|---|---|---|---|---|---|---|
| dev | Phòng Phát triển | Dev | 0x3e4a5c | 0x4fc3ff | code, code, kanban | có |
| qa | Phòng Kiểm thử QA/QC | QA | 0x3f5248 | 0x46d39a | test, code, kanban | có |
| pmo | Phòng Dự án (PM/BA) | PM | 0x4b4a5e | 0xffb547 | gantt, mail, kanban | không |
| product | Phòng Sản phẩm & Thiết kế | Product | 0x55465e | 0xff8fc2 | design, design, kanban | không |
| sales | Phòng Kinh doanh | Sales | 0x5e4a3a | 0xf2c230 | crm, chart, mail | không |
| marketing | Phòng Marketing | Marketing | 0x5a3b4f | 0xff5a6e | design, chart, mail | không |
| accounting | Phòng Kế toán – Tài chính | Kế toán | 0x3b4f5e | 0x2bb3a6 | sheet, sheet, chart | không |
| ops | Phòng Vận hành & CSKH | Vận hành | 0x434d43 | 0x9ad7ff | dash, crm, mail | không |
| hr | Phòng Nhân sự & Đào tạo | HR | 0x5b5048 | 0xffd23f | mail, sheet, design | không |

Mỗi phòng ban còn có `desc` (lời giới thiệu của hướng dẫn viên) và `feat` (câu mô tả khu đặc trưng, cũng là lời thoại của NPC đứng cạnh).

#### 3.3. Cách đặt NPC vào bàn

- Danh sách "ghế" của kiểu bố trí được xáo trộn; nếu là nhân viên toà và đang ở tầng phòng QA thì 1 ghế được dành cho bàn bạn (xem 5.3).
- 7 NPC đầu trong danh sách còn lại ngồi gõ phím (`type`). 2 trong số đó (người thứ 1 và thứ 4) có 1 đồng nghiệp đứng cạnh hỏi chuyện (`deskChat`): vị trí đứng lệch khoảng .85 m ngang bàn và ±.3 m theo z.
- Số NPC ước tính ở tầng phòng ban: Lead 1 + họp 3 + gõ phím 7 + ghé hỏi 2 + pantry 2 + lounge 1 + NPC đứng cạnh 1 + người đi tuần 1 = 18; riêng `shared` thêm 6 + 1 = 25 (nếu đủ ghế).

#### 3.4. Màn hình/đồ dùng trên bàn

Màn hình có hình riêng theo nghề (code, test, kanban, chart, sheet, crm, dash, design, mail, gantt); bàn phím; 30% có cốc (trắng/đỏ/xanh). Mặt bàn: trắng, gỗ hoặc đen theo theme.

#### 3.5. Góc vui chơi (`funZone`)

Tại tầng phòng ban, góc tại (x, z) = (-4.8, 9.2) (đối diện lounge và pantry), biển "Làm hết sức · chơi hết mình" ở (-4.8, y2.6, 11.88).

| Kiểu | Chi tiết |
|---|---|
| pingpong | bàn xanh 2.7×.08×1.5 tại (-4.8, y.86, 9.2), lưới trắng, 4 chân thép; va chạm x -6.2..-3.4, z 8.4..10 |
| beanbag | 4 ghế lười tại x = -6.4, -5.3, -4.2, -3.1; z = 8.9 hoặc 9.7 (chẵn/lẻ); mỗi ghế có điểm ngồi; màu cam, xanh, vàng, hồng |
| arcade | 2 máy 0.9×1.8×.8 tại (-5.6, 9.6) tím và (-4.3, 9.6) đỏ; màn hình phát sáng quay π; va chạm x -6.1..-3.2, z 9.2..10 |
| garden | tường cây 4×2.6×.15 tại (-4.8, 10.6) và 14 chùm lá ngẫu nhiên; va chạm x -6.8..-2.8, z 10.5..10.7 |
| hammock | 2 trụ gỗ tại x = -6.3 và -3.3 (z 9.2), võng màu hồng giữa; điểm ngồi (nằm) tại (-4.8, 9.2) r=1.4 (nhãn "Nằm võng nghỉ trưa") |

---

### 4. Chín phòng ban: khu đặc trưng (FEAT)

Mỗi hàm FEAT dựng khu riêng ở nửa phải/trước (x 5..17, z 0..7.5) và treo poster ở tường kính phòng họp (z = -2.94, nhìn +z). Poster chính luôn ở x=11, y = FY+2.3, kích thước 2.4×1.2. Tất cả đều được gọi chỉ khi tầng không phải `shared`. Với `FEAT[dept]` không tồn tại thì dùng `FEAT.dev`.

| Phòng ban | Khu đặc trưng và vị trí | Poster |
|---|---|---|
| **dev** | - 2 tủ server 0.8×2.1×1 tại (15.6, 1.2) và (16.45, 1.2), 7 đèn LED xanh/lam mỗi tủ; va chạm x 15..17.4, z .6..1.8<br>- Bảng Kanban "📌 Sprint 24 · Kanban" 2.6×1.5 tại (9.5, 1.2), quay π<br>- 3 ghế lười tại (8.4, 5.6) đỏ, (9.6, 6.4) xanh, (11, 5.8) vàng; mỗi cái có điểm ngồi<br>- Bàn đứng gỗ 1.6×.05×.7 tại (14.5, y1.15, 5.5), 2 màn hình code; va chạm x 13.6..15.4, z 5.1..5.9 | "Code · Test · Ship – Deploy thứ 6? Không nhé 😅" |
| **qa** | - Lab thiết bị: bàn trắng 4×.06×1 tại (12, y.95, 1.2) + 10 thiết bị (điện thoại/tablet) trải đều từ x=10.4 bước .36, xoay ngẫu nhiên; va chạm x 9.9..14.1, z .6..1.8<br>- Kệ 3 tầng 2.4×.04×.4 tại (16.2, 4.2), y = .9 + .5r, 6 thiết bị mỗi tầng; va chạm x 14.9..17.5, z 3.9..4.5<br>- Bảng "🐞 BUG BOARD" 2.6×1.5 tại (9.5, 5.4) quay π với phụ đề "Critical 1 · High 3 · Medium 8 · Low 12" | "🐞 Bug Bash Friday" (x=11) và "Không test trên PROD" (x=15, đỏ) |
| **pmo** | - Bảng "📅 Kế hoạch dự án Q4" (Gantt) 3.2×1.7 tại (11, 1.2)<br>- Bàn tròn r1 tại (11, 5) có 5 ghế xung quanh bán kính 1.45; cột tròn r1.1<br>- Máy in 0.9×.9×.7 tại (16.4, 1.4); va chạm x 15.9..16.9, z 1..1.8 | "Đúng hạn · Đúng phạm vi – Khách hàng là trung tâm" |
| **product** | - Bảng "🎨 Wireframe · App v3" 3×1.6 tại (10.5, 1.2)<br>- Tường giấy nhớ 34 mảnh nhiều màu, 3×1.5 tại (15, 1.2)<br>- Bàn thử prototype trắng 2.4×.06×1.2 tại (12.5, y.85, 5.4) có 3 tablet; va chạm x 11.2..13.8, z 4.7..6.1 | "Người dùng là trên hết – Build · Measure · Learn" |
| **sales** | - Bảng doanh số "📈 Doanh số tháng 11" 3×1.7 tại (10.5, 1.2), phụ đề "Mục tiêu: 12 tỷ · Đạt: 9,8 tỷ (82%)"<br>- Tủ cúp 2.2×1.9×.5 tại (15.6, 1.2) với 3×3 cúp vàng và kính; va chạm x 14.4..16.8, z .9..1.5<br>- Chiêng: khung gỗ (x 11.2..12.8, z=6), mâm vàng r.6 tại (12, y1.2, 6); cột tròn r.9 | "Chốt deal = Đánh chiêng 🔔" |
| **marketing** | - Phông chụp ảnh: tường trắng 3×2.6×.04 tại (12.5, 6.6) và sàn trắng 3×1.6 tại z=5.8; 2 đèn softbox tại (10.5, y1.8, 4.6) và (14.5, y1.8, 4.6); va chạm x 10.9..14.1, z 6.4..6.8<br>- Bảng "🎯 Moodboard · Chiến dịch Tết" 2.8×1.5 tại (9.4, 1.2)<br>- Sofa hồng 2.2 tại (16, 2.6) quay -π/2 (có chỗ ngồi, cứ 0.8 m một chỗ) | "Sáng tạo mỗi ngày – Brand · Content · Social" |
| **accounting** | - 6 tủ hồ sơ kim loại 0.6×1.4×.6 tại x = 9.2 + .65i, z=.9, mỗi tủ 3 tay kéo; va chạm x 8.9..13.1, z .6..1.2<br>- Két sắt 0.8×.9×.7 tại (15.8, 1.1) có núm xoay; va chạm x 15.3..16.3, z .7..1.5<br>- Bàn hồ sơ 2.4×.05×.9 tại (14.4, y.84, 5.2) với 5 tập hồ sơ; va chạm x 13.1..15.7, z 4.7..5.7<br>- Bảng "💰 Báo cáo thu – chi Q4" 2.8×1.5 tại (10.4, 5.6) quay π | "Minh bạch · Chính xác – Đúng hạn từng con số" |
| **ops** | - Tường màn hình: 6 màn 1.7×.95 tại x = 10.7, 12.5, 14.3, hai hàng y = 1.2 và 2.2, z = 1.11, nội dung dash/dash/crm/dash/mail/dash; va chạm x 9.6..15.4, z .8..1.2<br>- 3 bàn trực tại (10, 4.6), (12.2, 4.6), (14.4, 4.6), màn hình dash, ngồi quay -z; va chạm x 9.1..15.7, z 4..5.2 | "Hệ thống chạy 24/7 – Khách hàng gọi – mình nghe máy" |
| **hr** | - Màn hình onboarding "🎓 Onboarding · Ngày đầu đi làm" 3.2×1.8 tại (12.5, y1.7, .75), phát sáng<br>- Phòng đào tạo: 3 hàng × 4 ghế tại x = 10.4 + 1.4k (k=0..3), z = 2.6, 3.9, 5.2, quay π; va chạm x 9.9..15.2, z 2.2..6.3 | "Giá trị cốt lõi – Tận tâm · Chính trực · Học hỏi" (x=11) và "We're hiring! 🚀" (x=15, xanh dương) |

Điểm cần chú ý (lỗi trong mã, liên quan thiết kế lại):
- `ops`: dòng dựng tấm nền đen 5.6×2.2×.2 phía sau tường màn hình nằm TRONG phần chú thích cùng dòng nên không chạy; chỉ còn 6 màn hình rời nhau (không có tấm nền). Chưa rõ đây có chủ ý hay không.
- Các bàn trực ops không được thêm vào danh sách ghế, nên không có NPC ngồi ở 3 bàn này.

---

### 5. Tương tác

#### 5.1. Phỏng vấn (`workpc.js` hàm `interview`)

Khởi động: bấm E trong phòng phỏng vấn (sảnh) hoặc chọn "Vào phòng phỏng vấn" ở lễ tân (màn đen, đưa người chơi tới (13.2, 5.4), quay mặt về HR, rồi mở bài phỏng vấn).

Điều kiện chặn:
- Đã là nhân viên toà này: không cho.
- Đang có việc ở công ty khác: hỏi xác nhận nghỉ việc cũ trước (xoá job và ngày làm).
- Vừa trượt: phải chờ 120 s (lưu theo tên toà).

Nội dung: 5 câu trắc nghiệm lấy từ `data/questions.json`:
- Chủ đề theo `teams` của toà (bảng `TOPIC`): qa = istqb, design, agile, scenario; dev = automation, api, db; perf = performance; sec = security; data = db; mobile = mobile; luôn cộng thêm chủ đề của qa. Toà `locked`: chỉ câu mức độ >= 2; toà thường: mức độ <= 2. Nếu ít hơn 5 câu thì mở rộng theo mức độ.
- Sai 1 câu là trượt (hiện đáp án đúng và giải thích, chờ 2 phút); đúng cả 5 thì đậu.
- Đậu: tạo thẻ nhân viên (mã gồm 3 chữ cái đầu của tên viết tắt toà + số 1000-9999), lưu `S.work.job = {company, since, badge, role:'QA Engineer'}`, thưởng 50 xu, hiện thẻ cho người xem.

#### 5.2. Thẻ nhân viên và chấm công

- Thẻ nhân viên (`badge`): tấm 0.07×.105 gắn trước ngực người chơi (xương Spine2, nếu không có thì Spine1/Spine/Chest/Body), kèm 2 dây đeo màu toà; độ nhô ra theo mô hình nhân vật (soldier .2, xbot .14, robot .24, mặc định .17). Mặt thẻ vẽ tên viết tắt toà, tên người chơi, vai, mã vạch giả và mã thẻ.
- Quẹt thẻ ở cổng sảnh (E): lần đầu trong ngày thì đặt cờ `swipe`, gọi `jobs.onEnter` trả lương ngày (60 xu; 120 xu nếu toà khoá; sau 0.9 s; chỉ 1 lần mỗi ngày theo `payday`), thông báo giờ chấm công. Mở máy tính ở bàn mà chưa quẹt cũng tự chấm công.
- Lịch ngày (`day()`) tự reset khi sang ngày mới (theo UTC `toISOString`): cờ `swipe, standup, tickets{}, mail, lunch, report`.
- Bảng "Việc hôm nay" ở góc trái: quẹt thẻ, họp Daily (nêu số tầng phòng họp), làm 3 ticket, trả lời email PM, ăn trưa (nêu số tầng nhà ăn), báo cáo cuối ngày; ghi chú "Bàn của bạn: tầng n, có vòng vàng".
- Lần đầu vào sảnh toà mình làm mà chưa chấm công: nhắc sau 0.9 s.

#### 5.3. Bàn của bạn

Chỉ khi: bạn là nhân viên toà (`isEmp`) và tầng đang vào là tầng phòng ban của bạn. Phòng ban của bạn (`myDept`) = `qa` nếu toà có phòng QA (cả hai loại hồ sơ đều có) nên luôn là QA.

- Chọn bàn: bàn tại gần (-5, 1.85) hướng 0 (có trong kiểu `rows`); nếu không có (các kiểu khác) thì lấy bàn cuối cùng trong danh sách có hướng 0 và z > 0; nếu không còn thì bàn đầu có hướng 0.
- Gắn: điểm ngồi "Ngồi bàn của bạn", bảng tên "<tên người chơi> · QA / Bàn làm việc của bạn" (.5×.25 trên bàn tại (x, y.96, z+.36)), vòng vàng nhấp nháy dưới đất tại (x, z-.65) bán kính .55..72.
- Điểm bấm E tại (x, z-.75) r=1.5, ưu tiên .9: "Bàn làm việc của bạn – ngồi & mở máy tính": cho người chơi ngồi (`W.life.sitOn`), sau 350 ms mở máy tính (`openPC`).

#### 5.4. Thang máy

- Bấm E tại (0, -10.3): mở danh sách tầng từ trên xuống (tầng N đến 1), mỗi thẻ có biểu tượng loại tầng (sảnh, phòng ban, căng-tin, giám đốc), số tầng và tên.
- Nhân viên hoặc đang tham quan: mở được mọi tầng. Còn lại: chỉ sảnh; các tầng khác bị khoá mờ, bấm ra thông báo cần thẻ nhân viên hoặc đi cùng hướng dẫn viên (toà khoá không có lựa chọn hướng dẫn viên).
- Chọn tầng: màn đen, dựng tầng, người chơi xuất hiện trước thang máy (0, -9.4).
- Vào tầng 1 từ ngoài phố: xuất hiện tại sảnh (0, 9.6). Toà khoá: bảo vệ ngoài cửa nói câu thoại khác nhau tuỳ nhân viên hay khách (mã trong downtown.js).

#### 5.5. Họp Daily

- Điểm bấm tại (6.2, -6.6) trong tầng phòng ban của bạn: "Vào họp Daily 15 phút (E)"; nếu đã họp hôm nay thì hiện "Đã họp Daily hôm nay".
- Hộp thoại: 3 đồng nghiệp trình bày 3 câu (hôm qua, hôm nay, blocker); bạn chọn 1 trong 3 câu của mình (trộn ngẫu nhiên); chỉ 1 câu đúng cấu trúc "Hôm qua em chạy xong 40 test case... Blocker: cần dữ liệu khuyến mãi trên STG" được +15 xu; câu sai vẫn đánh dấu đã họp nhưng không có xu (Lead nhắc nói cụ thể).

#### 5.6. Máy tính làm việc (`openPC`, `workpc.js`)

Chỉ nhân viên toà mới mở được. Có 5 ứng dụng:
- Jira: 3 ticket mỗi ngày theo ngày trong tháng và độ dài tên toà: test run (5 mẫu: đăng nhập, giỏ hàng, tìm kiếm, đổi mật khẩu, upload ảnh, đánh Pass/Fail từng bước), log bug (5 mẫu: chọn Severity/Priority/Component), verify bug (5 mẫu: Close/Reopen/Won't fix). Mỗi ticket đúng thì +30 xu.
- Email: 1 thư ngày (PM Hằng hoặc Team Lead), 3 lựa chọn trả lời, 1 đúng +20 xu.
- Chat nhóm: tin nhắn tĩnh `#team-qa`.
- Báo cáo ngày: cần đã chấm công và 3 ticket; thưởng 100 xu (toà khoá 150), +50 nếu đã họp Daily, trả lời email và ăn trưa.
- Việc trí tuệ: mở Trung tâm Việc làm tab "brain" (bài SQL/API/bug/test design/JS; nhân viên +25% công).

#### 5.7. Ăn trưa (nhà ăn)

Điểm bấm tại (-8, -9) r=1.6. Nhân viên: miễn phí, tăng tốc 10 phút (`buffs.energy` + 600000 ms), đánh dấu `lunch` trong ngày. Khách: hỏi trả 25 xu, nếu đủ thì tăng tốc 10 phút.

#### 5.8. Lễ tân và tham quan

- Điểm bấm lễ tân tại (0, 3.2): hộp thoại 3 thẻ: "Tham quan công ty" (khoá nếu toà `locked`, đã là nhân viên hoặc đang tham quan), "Phỏng vấn xin việc", "Nhân viên" (chỉ thông tin).
- Tham quan: bấm "Bắt đầu" thì xoá hướng dẫn viên chờ và sinh hướng dẫn viên dẫn đường; người chơi qua cổng cùng hướng dẫn viên (bấm E ở cổng), lên thang máy chọn tầng.
- Hướng dẫn viên (`spawnGuide`): nữ, áo màu chọn theo toà (hồng, trắng, xanh nhạt, vàng), váy; vị trí xuất hiện: sảnh (2.6, 3.3) hoặc (2.4, 3.4) khi vào lại; tầng phòng ban và nhà ăn (1.4, -9.2); giám đốc (2.4, -9.2).
- Điểm dừng và lời giới thiệu (mỗi điểm đọc 6.5 s, tốc độ đi 1.3 m/s; chờ người chơi lại gần < 8.5 m, nếu xa thì gọi "Anh/chị ơi, bên này ạ!" mỗi 6 s; chỉ sang điểm tiếp theo khi người chơi trong 6 m):
  - Sảnh: (3.6,3.3)→(3.6,-3.4)→(0,-3.4) giới thiệu cổng quẹt thẻ; (0,-6.2)→(2.6,-8.6) liệt kê phòng ban của toà.
  - Phòng ban: (1.4,-1.5)→(-9.5,-1.5) giới thiệu phòng ban (desc); (4.9,-1.6)→(4.9,-2.4) phòng họp kính; (4.9,-1.5)→(11,-1.5)→(11,-.9) khu đặc trưng (feat); (4.2,-1.5)→(4.2,9)→(12,9) pantry; (-6.5,9) góc thư giãn.
  - Nhà ăn: (1.4,-6.2)→(-3.4,-6.2) nhà ăn; (0,-6.2)→(0,-1) máy bán nước.
  - Giám đốc: (2.6,-9.2)→(2.6,-3.2)→(1,-3.2) giới thiệu giám đốc.
  - Hết điểm dừng thì hướng dẫn viên đi theo sau người chơi cách ~1.7 m.
- Kết thúc: điểm bấm E cạnh hướng dẫn viên "Cảm ơn, tôi tự đi tham quan" (r=1.6, ưu tiên .3) kết thúc tham quan (mở được mọi tầng cho tới khi ra khỏi toà). Trạng thái tham quan được đặt lại khi ra ngoài.

#### 5.9. Việc làm (`jobs.js`, phần liên quan nhân viên)

- `canEnter(t)`: toà không khoá ai cũng vào; toà khoá chỉ vào được khi đang làm ở đó (hàm này có trong `jobs.js`; trong các file đã đọc, cửa toà ở downtown.js không gọi nó và vẫn cho khách vào sảnh toà khoá để phỏng vấn).
- Lương ngày 60 xu, toà khoá 120 xu; việc trí tuệ +25% (tham số trong dữ liệu), việc chân tay +10% khi có việc ở công ty.
- Tab "Xin việc công ty" liệt kê 13 toà, nhóm, số tầng, loại công ty, và nút chỉ đường (cột sáng vàng tại cửa). Đoạn xét điều kiện cũ phía sau lệnh `return` là mã chết, không chạy.
- Việc chân tay (dọn rác, giao hàng, phụ bếp) và việc trí tuệ không liên quan tới nội thất, không mô tả sâu ở đây.

---

### 6. Nhân vật trong toà

#### 6.1. Vai và hành vi

NPC được dựng bằng `bot(tên, mẫu, x, z, hướng, chế độ, extra)`; mẫu `person` dùng kho người (`W.people`: tên, dáng, trang phục). Có 4 mẫu cố định khác: `soldier`, `xbot`, `michelle`, `robot`.

| Chế độ | Hành vi | Có chặn đường (circle r=.35)? |
|---|---|---|
| `type` | ngồi gõ phím (tư thế `poser`) | không |
| `eat` | ngồi ăn | không |
| `sit` | ngồi | không |
| `stand` | đứng (nếu có clip `agree` thì gật đầu khi vừa nói) | có |
| `present` | đứng thuyết trình | có |
| `phone` | đứng gọi điện | có |
| `cross` | đứng khoanh tay | có |
| `walk` | đi tuần theo `path`, 1.3 m/s, vòng lặp qua các điểm | không |
| `guide` | hướng dẫn viên (mục 5.8) | không |

Người ngồi được đặt thấp hơn sàn để hông khớp mặt ghế (FY + .47 - độ cao hông + .06).

Danh sách vai theo tầng:
- Sảnh: Lễ tân (nữ, tên theo hạt giống toà), Bảo vệ, HR phỏng vấn, Khách đi lại, Nhân viên đi lại, Hướng dẫn viên chờ.
- Tầng phòng ban: Lead (thuyết trình), người họp x3, người ngồi gõ phím x7, người ghé hỏi x2, 2 người ở pantry, 1 người ở lounge, 1 người đứng cạnh (tư thế theo phòng ban), 1 người đi tuần.
- Nhà ăn: Đầu bếp Robo, 3 Nhân viên hàng đợi, tối đa 12 Nhân viên đang ăn.
- Giám đốc: Giám đốc, Thư ký.

Tư thế của NPC đứng cạnh theo phòng ban: qa, sales, accounting = gọi điện; ops, marketing, dev = khoanh tay; product, hr, pmo = thuyết trình; mặc định khoanh tay. Vị trí đứng mặc định (11.6, 3.1) quay ≈ .9π; hr (15.9, 1.8) quay -1.2; pmo (14.2, 2.6) quay ≈ .9π. Lời thoại lẻ: câu mô tả khu đặc trưng của phòng ban.

NPC đi tuần ở tầng phòng ban: vòng (4.2,-1.5)→(-15,-1.5)→(-15,-.6)→(4.2,-.6)→(4.2,8.8)→(8,8.8)→(4.2,8.8)→ lặp lại.

Nhãn tên NPC dạng "Tên · Vai". Tên sinh theo hạt giống tất định (băm tên toà, số tầng, thứ tự sinh) nên cùng toà cùng tầng ra cùng một nhóm người (trừ các lựa chọn ngẫu nhiên khác).

#### 6.2. Cơ chế trò chuyện và lời nói

- Cặp trò chuyện (`talk`): 2 NPC + một kịch bản gồm các câu xen kẽ [người nói 0/1, câu]. Chỉ chạy khi người chơi ở trong 13 m quanh một trong hai người; mỗi câu bong bóng 3.4 s, cách nhau 3.1 s; hết kịch bản nghỉ 7-15 s rồi chọn kịch bản mới ngẫu nhiên.
- Lời nói lẻ: cứ 4-8 s, trong các NPC có `lines` trong vòng 6 m (và chưa có bong bóng) chọn ngẫu nhiên 1 người với xác suất 60% nói 1 câu.
- Lễ tân tự nói câu đầu khi người chơi lại gần 3.5 m (1 lần mỗi lần vào sảnh).

Lời thoại cố định đã nêu ở các mục 2.x. Giám đốc: "Chào bạn! Mình là <tên>. <toà> luôn cần người giỏi QA.", "Muốn làm ở đây? Phỏng vấn ở sảnh tầng 1 nhé – 5 câu QA/QC thôi!", "Chất lượng là uy tín của công ty." Lễ tân: "Chào mừng tới <toà>!", "Anh/chị cần tham quan hay phỏng vấn ạ?", "Mời anh/chị dùng nước ☕". Bảo vệ: "Chào anh/chị!", "Nhân viên quẹt thẻ ở cổng nhé." Lounge: "Nghỉ 5 phút rồi làm tiếp 😌". Hướng dẫn viên chờ: "Anh/chị muốn tham quan công ty không ạ? Nhờ lễ tân gọi em nhé 😊".

#### 6.3. Kịch bản chung

- `MEET` (họp, 3 kịch bản): điểm tiến độ, ưu tiên bug High trên Jira, phản hồi demo khách (báo cáo Excel).
- `PANTRY` (pantry, hàng đợi, ăn trưa, 3 kịch bản): cà phê và release khuya, trưa ăn gì, team building đi biển.

#### 6.4. Lời thoại mẫu theo phòng ban (`talks`)

Mỗi phòng ban có 2-3 hội thoại ngắn (người 0 và 1 xen kẽ); đây là chủ đề, không chép nguyên văn:

| Phòng ban | Chủ đề các hội thoại |
|---|---|
| dev | review PR và coverage test; build CI đỏ do test flaky, nhớ báo QA khi lên STG; API trả 500 khi thiếu field, đổi thành 400 |
| qa | bug severity High có video, log Jira gắn Dev; regression pass 98%, 2 case fail do dữ liệu test; không test trên PROD, dùng STG |
| pmo | khách muốn đẩy deadline sớm 1 tuần, cắt scope; spec màn hình thanh toán đã gửi QA review |
| product | đổi màu nút "Mua ngay", A/B test; phỏng vấn 5 khách hàng, họ muốn thanh toán nhanh hơn |
| sales | chốt hợp đồng 2 tỷ và đánh chiêng; khách chê giá cao, nhấn mạnh chất lượng và hỗ trợ 24/7 |
| marketing | bài post được 10k like, làm minigame; banner sự kiện gấp, bản nháp trong 1 giờ |
| accounting | chốt bảng lương cuối tháng chờ chấm công phòng Dev; hoá đơn thiếu mã số thuế |
| ops | server thanh toán CPU 90%, báo DevOps scale; khách hỏi đơn bị chậm, kiểm tra giao hàng |
| hr | 3 bạn QA đi làm ngày đầu, chuẩn bị thẻ và laptop; ứng viên trả lời tốt, gửi offer |

---

### 7. Showroom ô tô QC Auto (`showroom.js`)

#### 7.1. Kích thước và cảnh

- Phòng trong: `RW=22, RD=14, CH=6, FY=.1`; sàn và trần 44×28 m, tâm (0,0), tức x thuộc [-22, 22], z thuộc [-14, 14]; trần cao 6 m. Dùng chung hệ toạ độ phòng như toà công ty (z=-14 là tường sau, z=+14 là mặt tiền kính).
- Vỏ ngoài: xem mục 8 (toà kính lớn 44×28 m ở Đồi Brand QC, cao 9 m). Kích thước ngoài đúng bằng phòng trong.
- Vào (E tại cửa toà): màn đen; người chơi xuất hiện tại (0, 11.6) quay -z (`RD-2.4`); sau đó hộp thoại chào của tư vấn viên (500 ms sau). Ra: điểm bấm E "Ra ngoài phố" tại (0, 12.6) r=1.7; vị trí ra do `exitAt()` của module cha quyết định (mã luxury.js đổi thành cửa Tây của toà kính: x = X0 - 1.8, z = CZ, hướng -x; toạ độ tuyệt đối chưa rõ vì phụ thuộc `W.hillsInfo.SHOW`).
- Khi vào, danh sách va chạm thế giới được cất và khôi phục như toà công ty.

#### 7.2. Bố cục phòng

| Thành phần | Vị trí | Chi tiết |
|---|---|---|
| Sàn | toàn phòng | đá bóng, đường chỉ mỗi 4 m dọc z |
| Trần + đèn | | lưới đèn panel 2.4×.5 cách 5 m |
| Tường | z=-14.1, x=±22.1; tường tối | mặt tiền kính ở z=+14.1, trụ kính cách 4 m, cửa thép 3.2×3 ở giữa; tranh phố vẽ ngoài kính |
| Tường thương hiệu | (0, y3.7, -13.86) 14×3.5 | "QC AUTO – Showroom ô tô · xe máy chính hãng" gradient đỏ-cam |
| 4 poster quảng cáo | x=±21.92, y=3.3, z=-6 và 3 | trái: SPORT GT (z=-6), SUV 7 CHỖ (z=3); phải: PICKUP (z=-6), MINI (z=3); 2.4×3.6 |
| Quầy tư vấn | (-14, 9), 4.4×1.1×1, dải đỏ ở z=9.52 | va chạm x -16.3..-11.7, z 8.4..9.6 |
| Khu chờ | sofa 2.6 tại (-16, 4.6) quay 0 và (-16, 1.4) quay π; bàn trà (-16, 3) | mỗi sofa 3 chỗ ngồi, nhãn "Ngồi chờ" |
| Cây | bốn góc (±21, ±12.8) | |
| Xe tay ga | bục 2.2×.12×1.2 tại (16.5, 9.2), (16.5, 7.6), (16.5, 6.0); xe đỏ, xanh dương, trắng; nhãn "Xe tay ga – Đỏ · Xanh · Trắng" tại (16.5, y2.3, 7.6) | điểm bấm E tại (13.6, 7.6) r=1.9 |

#### 7.3. Xe trưng bày (11 ô tô)

Mỗi xe có bục tròn trắng cao .16 (bán kính 2.8; xe chính 3.6), vòng đèn viền neon (xe chính đỏ hồng, còn lại lam), và 1 bảng thông số nghiêng trước xe (đặt cạnh bục cách tâm r+.6 về phía lối đi). Bấm E tại bảng (r=1.8, ưu tiên .5): mở hộp thoại chọn màu, mua. Xe chính ở (0, -1) đặt trên bàn xoay (quay .35 rad/s); các xe còn lại quay nghiêng ±.6 rad hướng vào lối đi.

| # | Mẫu | Màu | Vị trí (x, z) | Ghi chú |
|---|---|---|---|---|
| 1 | sport | đỏ 0xb3122e | (0, -1) | xe chính, bàn xoay |
| 2 | suv | đen | (-14, -9) | |
| 3 | limo | đen | (-14, -2.6) | |
| 4 | pickup | bạc | (-7, -9.6) | |
| 5 | sedan | xanh dương | (14, -9) | |
| 6 | lux | trắng | (14, -2.6) | |
| 7 | pickup | vàng | (7, -9.6) | |
| 8 | mini | vàng | (-6.5, 6) | |
| 9 | mini | xanh lá | (6.5, 6) | |
| 10 | roadster | đỏ | (14, 4) | |
| 11 | suv | xanh lá | (-3.4, -9.6) | |

Mẫu xe thực có 8 (không phải 5 như chú thích đầu file). Giá và thông số (chung cho mọi xe cùng mẫu; chữ hiển thị có tên lấy từ `V.CARS[mẫu].name` ở module khác, chưa rõ):

| Mẫu | Giá (xu) | Tốc độ tối đa | Mô tả |
|---|---|---|---|
| mini | 4.500 | 60 km/h | 4 chỗ, nhỏ gọn, dễ đỗ |
| sedan | 6.000 | 70 km/h | 5 chỗ, êm ái, tiết kiệm |
| suv | 9.000 | 70 km/h | 7 chỗ, gầm cao, đi gia đình |
| pickup | 8.000 | 66 km/h | 5 chỗ, thùng chở hàng |
| sport | 15.000 | 90 km/h | 2 chỗ, tăng tốc cực nhanh |
| limo | 45.000 | 72 km/h | Limousine VIP, khoang sau da thật, tài xế riêng |
| lux | 30.000 | 80 km/h | Sedan siêu sang 2 tông màu, êm như lướt |
| roadster | 40.000 | 98 km/h | Siêu xe mui trần 2 chỗ, gió lộng tóc bay |
| xe tay ga | 2.000 | ~50 km/h | đi đường nhựa nhanh, dễ dắt (bấm V để lên xuống) |

- Bảng chọn màu: 7 màu (Đỏ, Đen, Trắng, Xanh dương, Bạc, Vàng, Xanh lá). Mua có bước xác nhận trả tiền (`askPay`); thành công thì `S.inv.car=1`, đặt `carModel`, `carColor`, xe giao ở bãi đỗ trước showroom, bấm V để lái; mua xe mới thay xe cũ. Xe tay ga mua riêng (đổi màu miễn phí khi đã có).
- Nhân viên tư vấn nói câu chúc mừng sau khi mua.

#### 7.4. Người trong showroom

| Vai | Vị trí | Chế độ |
|---|---|---|
| Tư vấn viên (nam, vest, áo trắng) | bắt đầu (0, 9.6) quay π | `guide` |
| Lễ tân (nữ, áo đỏ) | (-14, 8.2) quay 0 | đứng |
| Khách 1 (nam) | (-11.4, -5.6) | đứng; cặp với khách 2 |
| Khách 2 (nữ) | (-10.6, -6.6) | đứng; bàn luận mỗi 4-8 s (3 đoạn hội thoại: SUV rộng/đi biển; màu trắng/đen; trả góp 0%) |
| Khách 3 (nam) | bắt đầu (9, 2), vòng (9,2)→(9,-6)→(3,-6)→(3,2) | đi, 1.1 m/s |
| Khách 4 (nữ) | (10.8, 7.8) | khoanh tay |

Tư vấn viên: sau hộp thoại chào có 2 lựa chọn "Nghe giới thiệu" hoặc "Bỏ qua, tôi tự xem". Giới thiệu gồm 5 điểm dừng (đi 1.3 m/s, đọc 6.5 s, chờ người chơi trong 6.5 m, gọi nếu xa hơn 9 m):
1. (0,6.5)→(0,3.6): QC Sport GT, 0-100 km/h trong 4,2 s, tối đa 90 km/h.
2. (-9,3.6)→(-9,-5.8): SUV 7 chỗ.
3. (-9,-6.2)→(-4.6,-6.2): Pickup Ranger.
4. (9,-6.2)→(9,-5.8): Sedan S.
5. (9,3.6)→(3,3.6): Mini Hatch, giá 4.500 xu.
Sau đó tư vấn viên đứng lại, nhắc gọi ở quầy. Khi người chơi bấm E cạnh tư vấn viên đang dẫn: "Bỏ qua giới thiệu" (tư vấn viên về (-11.6, 8.4)).

---

### 8. Vỏ showroom trên đồi và xe đại gia (`luxury.js`)

#### 8.1. Toà kính showroom (vỏ ngoài)

Module chỉ chạy khi `W.hillsInfo` tồn tại (cung cấp `FLAT`, `SHOW`, `VILLAS`, `LANE_Z`; các giá trị tuyệt đối chưa rõ vì định nghĩa ở file khác).

- Hình chữ nhật ngoài: x từ `SHOW.x0+2` tới `SHOW.x1-2`, z từ `SHOW.z0+2` tới `SHOW.z1-2` = 44×28 m (đúng bằng phòng trong); cao 9 m (HT) = 2 tầng kính; sàn tại độ cao đồi phẳng `FLAT`.
- Mặt tiền (cửa chính) ở phía Tây, nhìn ra đường ven biển: cửa tại (X0 - 1.4, CZ) với CZ là giữa chiều z. Tường kính 3 mặt (Bắc, Nam, Đông) và mặt Tây có khoảng hở cửa rộng 4 m (z ± 2) cùng dải kính phía trên cửa (từ độ cao 3.2 m). Khung thép mỗi 4 m. Tầng lửng phía sau (Đông): sàn 43.6×.25×8 tại x = X1 - 4.2, độ cao FLAT + 4.6. Mái trắng viền thép, đèn trần panel.
- Mái che cửa 4.6×.3×6.5 tại (X0 - 2.2, FLAT + 3.6, CZ) với 2 cột tại z = CZ ± 2.9.
- Bảng hiệu 26×3.2 "QC AUTO · LUXURY SHOWROOM" trên mái (phát sáng, tăng theo đêm); nhãn nổi "QC Auto · Luxury Showroom".
- Va chạm: cả khối nhà là hộp cấm đi (kèm thông điệp "Vào showroom bằng cửa chính phía đường ven biển (E)"), chỉ vào qua điểm bấm E tại cửa (r=2.2, ưu tiên .8) gọi `showroom.enter()`.
- Xe trưng bày nhìn qua kính (6 xe, bục trắng r2.9, xe chính 3.6, viền neon lam):
  - roadster đỏ tại (CX-4, CZ), xe chính, quay .35 rad/s (hero).
  - limo đen tại (X0+8, Z0+5).
  - lux trắng (2 tông, đáy đen) tại (X0+8, Z1-5).
  - sport vàng tại (X1-8, Z0+5).
  - suv xanh lá tại (X1-8, Z1-5).
  - sedan xanh dương tại (CX+6, Z0+5).
  Bố trí ngoài KHÁC bố trí trong phòng (11 xe trong, 6 xe ngoài).
- Chuyển lối ra của phòng trong: `city.showroom.tx/tz/f` đặt về cửa Tây; căn nhà nhỏ cũ ở Phường trở thành điểm chỉ đường (E hỏi đi taxi tới showroom mới, đưa người chơi đến (X0-3-door.x...) tức trước cửa toà mới, nhìn về tâm). Cập nhật mục bản đồ "Showroom xe" đổi tên thành "QC Auto Luxury Showroom" và điểm đến taxi.

#### 8.2. Xe đại gia

Ba chiếc chạy vòng tuần hoàn giữa nhà và công ty. Chỉ chạy khi người chơi không ở trong nhà (`W.inside` rỗng); hiện hình khi cách người chơi < 220 m; người ngồi trong xe chỉ cập nhật hoạt hình khi cách < 70 m (tư thế ngồi xe `car`).

| Đại gia | Xe | Màu | Bạn đi cùng | Biệt thự | Toà công ty | Chờ khi đỗ |
|---|---|---|---|---|---|---|
| Đại gia Tuấn (nam) | limo (có tài xế) | đen / đen | Ngọc (nữ) | VILLAS[0] | toà thứ 0 = Bình Phan Tech Hub | 40 s + 0..20 s |
| Nữ đại gia Vy | lux | trắng / đen | Khang (nam) | VILLAS[1] | toà thứ 1 = AutoQA Labs | 50 s + 0..20 s |
| Đại gia Long (nam) | roadster mui trần | đỏ / đen | Mai (nữ) | VILLAS[2] | toà thứ 2 = PerfMax Performance | 35 s + 0..20 s |

("Toà thứ i" lấy theo thứ tự `DEFS`; suy từ mã, nếu thứ tự danh sách toà trả về khác thì thay đổi.)

- Người ngồi trong xe (toạ độ cục bộ x ngang, z dọc xe): limo: tài xế (cap, đồng phục đen) x=.42, z=.55; đại gia x=.45, z=-1.2; bạn x=-.45, z=-1.2. lux: đại gia x=.42, z=.1; bạn x=-.42, z=.1. roadster: đại gia x=.42, z=-.45; bạn x=-.42, z=-.45. Độ cao hông theo xe: limo .62, lux .6, roadster .66. Trang phục: nam mặc vest đen; nữ mặc váy (màu tuỳ chiếc); bạn nữ mặc váy, bạn nam vest xanh navy.
- Điểm nhà: (x biệt thự, `LANE_Z`) (nếu thiếu biệt thự thì (300, LANE_Z)). Điểm đỗ ở công ty: trước cửa toà, lệch 3.2 m ra phía phố: (door.x, door.z + 3.2·face). Với 3 toà đầu: Bình Phan (203, -9.5), AutoQA (226.5, -10.5), PerfMax (250, -9.5) (tính từ công thức cửa, mục 1.1).
- Lộ trình: dùng mạng đường của module giao thông (`TR.project`, `TR.route`, `TR.lanePath`); lịch là vòng lặp: bắt đầu ở trạng thái `toWork` (dãn cách ngẫu nhiên theo chỉ số xe, 30% quãng đường mỗi xe), tới nơi thì đỗ (`parkWork`) chờ rồi quay về (`toHome`), tới nhà thì đỗ (`parkHome`) chờ rồi lại đi làm. Chú thích đầu file nói "sáng đi làm, chiều về" nhưng mã không gắn vào giờ trong ngày, chỉ là các khoảng chờ cố định.
- Tốc độ: tối đa 11 m/s (roadster 13), tăng tốc 2.6 m/s², phanh tối đa 6.5 m/s²; giảm tốc theo độ cong đường và theo khoảng cách tới đích (phanh 3 m/s²); `traffic.limit` (module giao thông) áp dụng đèn đỏ, giữ khoảng cách và nhường người đi bộ. Xe nghiêng theo độ dốc (lấy mẫu độ cao hai đầu xe, ±1.6 m).
- Chống kẹt: nếu đứng yên hơn 45 s và cách người chơi > 80 m thì tự nhảy lên phía trước 12 m dọc tuyến.
- Thông báo cho người chơi (trong 30 m): "tới công ty, đỗ <loại xe> trước sảnh", "về tới biệt thự ven đầm".
- Bản đồ: mục "Xe đại gia (đang chạy)" dịch chuyển người chơi tới 1 chiếc ngẫu nhiên (cách +4, +4 m).

---

### 9. Bảng tóm tắt

Kích thước tính theo mét (x × z), cao nếu có. "Tầng" ghi tầng áp dụng.

| Không gian | Kích thước | Tầng | Chức năng | Nhân vật |
|---|---|---|---|---|
| Sảnh lễ tân (lobby) | 36 × 24, trần 3.4 | 1 (mọi toà) | lễ tân, cổng quẹt thẻ, khu chờ, thang máy, ra phố | Lễ tân, Bảo vệ, HR phỏng vấn, Khách, Nhân viên, Hướng dẫn viên chờ |
| Phòng phỏng vấn | x 8.5..18, z 2..12 (9.5 × 10) | 1 | phỏng vấn 5 câu QA/QC, cấp thẻ nhân viên | HR phỏng vấn (ngồi) |
| Cổng quẹt thẻ | z=-5, rộng 2.2 giữa 2 máy | 1 | chấm công, mở khu làm việc | Bảo vệ (3.4,-6.4) |
| Phòng Phát triển (dev) | 36 × 24 | tuỳ toà (xem 1.4) | code, server, Kanban | Lead, họp, gõ phím, đồng nghiệp |
| Phòng QA/QC (qa; biến thể Performance, Pentest, Data, Mobile) | 36 × 24 | tuỳ toà | lab thiết bị, Bug Board; tầng có bàn của người chơi | như trên |
| Phòng Dự án (pmo) | 36 × 24 | chỉ Outsource | Gantt, họp tròn, máy in | như trên |
| Phòng Sản phẩm & Thiết kế (product) | 36 × 24 | chỉ Product | wireframe, giấy nhớ, prototype | như trên |
| Phòng Kinh doanh (sales) | 36 × 24 | chỉ Product | bảng doanh số, tủ cúp, chiêng | như trên |
| Phòng Marketing (marketing) | 36 × 24 | chỉ Product | góc chụp ảnh, moodboard | như trên |
| Phòng Kế toán – Tài chính (accounting) | 36 × 24 | chỉ Product | tủ hồ sơ, két sắt, bảng thu-chi | như trên |
| Phòng Vận hành & CSKH (ops) | 36 × 24 | chỉ Product | tường màn hình giám sát, bàn trực | như trên |
| Phòng Nhân sự & Đào tạo (hr) | 36 × 24 | tầng 2 (mọi toà) | onboarding, phòng đào tạo, tường văn hoá | như trên |
| Phòng họp kính | x 4..17.8, z -11.8..-3 (13.8 × 8.8) | mọi tầng phòng ban | họp Daily, họp sprint | Lead + 3 người họp |
| Pantry | x 9.8..16.9, z 10.2..12 | mọi tầng phòng ban | cà phê, nước, tám chuyện | 2 người đứng |
| Lounge | thảm 8 × 4 tại (-12, 9.5) | mọi tầng phòng ban | nghỉ ngơi, sofa | 1 người ngồi |
| Góc vui chơi | quanh (-4.8, 9.2) | mọi tầng phòng ban | bóng bàn, ghế lười, game, vườn, võng (theo theme) | không có NPC riêng |
| Nhà ăn nhân viên | 36 × 24 | N-1 (mọi toà) | ăn trưa miễn phí (nhân viên) hoặc 25 xu (khách), tăng tốc 10 phút | Đầu bếp Robo, hàng đợi 3, người ăn tối đa 12 |
| Phòng Giám đốc | 36 × 24 | N (mọi toà) | chào giám đốc, giới thiệu phỏng vấn | Giám đốc, Thư ký |
| Bàn của bạn + máy tính | 1 bàn trong tầng QA | tầng QA | Jira, email, chat, báo cáo | người chơi |
| Showroom ô tô (trong) | 44 × 28, trần 6 | 1 tầng | trưng bày 11 xe + 3 xe tay ga, mua xe | Tư vấn viên, Lễ tân, 4 Khách |
| Toà kính showroom (vỏ ngoài) | 44 × 28, cao 9 | 2 tầng kính | mặt tiền, 6 xe nhìn qua kính, cửa vào | không có |
| Xe đại gia: Tuấn (limousine) | thân xe, 3 người | đường phố | chạy nhà - công ty | Đại gia Tuấn, Ngọc, tài xế |
| Xe đại gia: Vy (sedan siêu sang) | thân xe, 2 người | đường phố | chạy nhà - công ty | Nữ đại gia Vy, Khang |
| Xe đại gia: Long (siêu xe mui trần) | thân xe, 2 người | đường phố | chạy nhà - công ty | Đại gia Long, Mai |
| 13 toà ngoài phố (xem 1.1) | w × d × h theo bảng 1.1 | 7 tới 30 tầng | khối nhà, cửa, vòng sáng | Bảo vệ ngoài cửa (2 toà khoá) |

---

### 10. Điểm chưa rõ và điểm lệch trong mã (để Bình lưu ý khi thiết kế lại)

1. Chú thích đầu file `downtown.js` ghi "8 kiểu" toà nhưng danh sách có 9 kiểu; chú thích đầu `showroom.js` ghi "11 ô tô (5 mẫu)" nhưng thực tế 8 mẫu.
2. Tên hiển thị các mẫu xe lấy từ `V.CARS[...]` (module khác): chưa rõ. Tên trong lời hướng dẫn: "QC Sport GT", "SUV 7 chỗ", "Pickup Ranger", "Sedan S", "Mini Hatch".
3. Toạ độ tuyệt đối của toà kính showroom (`W.hillsInfo.SHOW`), đường `LANE_Z`, danh sách biệt thự `VILLAS`: chưa rõ (nằm ngoài các file được giao).
4. Dòng dựng tấm nền màn hình ở phòng Vận hành (`ops`) bị chú thích nuốt nên không chạy.
5. Hai phòng ban có thể trùng số tầng ở toà thấp (Mobile First QA, DevOps Center); mã vẫn chạy nhờ chỉ số mảng.
6. `workpc.js` và `jobs.js` có đoạn mã chết (phần xét điều kiện xin việc cũ ở tab "hire" nằm sau lệnh `return`).
7. Ở kiểu bàn `shared`, NPC "đứng cạnh" tại vị trí mặc định (11.6, 3.1) có thể nằm trên khu bàn phòng ban thứ 2; mã không kiểm tra va chạm; chưa rõ có bị chồng hay không.
8. Phần "lịch sống sáng đi chiều về" của xe đại gia trong chú thích không gắn vào giờ trong ngày; hiện chỉ là vòng chờ cố định.
9. Hạt giống người (tên, dáng) phụ thuộc `js/people.js`, ngoài phạm vi; tài liệu này không mô tả hình dạng cụ thể của từng NPC.

---

<a id="phần-4"></a>

## 04 · Đồi Brand QC và Phố Núi — hiện trạng kiến trúc

Tài liệu mô tả đúng theo mã nguồn (đọc ngày 15/11, không chạy game). Quy ước: 1 ô = 1 m = 1 đơn vị toạ độ; trục x Đông–Tây (x tăng về Đông), trục z Bắc–Nam (z tăng về Nam), y là độ cao. "Y0/FLAT" là cao độ nền. Mọi con số có dấu "≈" là tính tay từ công thức trong mã (mã không ghi sẵn); "chưa rõ" nghĩa là mã không xác định được nếu không chạy game.

File nguồn dùng: `js/hills.js` (H), `js/monument.js` (MON), `js/mountaintown.js` (MT), `js/foodstreet.js` (FS), `js/riverside.js` (RV), `js/luxury.js` (LX; chỉ vỏ showroom). Số dòng ghi dạng `file:dòng`.

---

### 0. Tổng quan và hằng số chung

Khu "Đồi Brand QC · Phố Núi" nằm phía Đông Nam, nối từ phố chính Phường Khởi Nghiệp qua cầu ở z = ST = 86 (`CITY.ward.street`, mặc định 86; H:18).

| Hằng số | Giá trị | Nguồn |
|---|---|---|
| Vùng đất HZ | x 276–476, z 66–274 (200 × 208 m) | H:16 |
| Tâm đồi HC | (392, 170) | H:17 |
| Bán kính sân đỉnh PADR | 24 m (phẳng đến d < 24,5; taluy mềm đến 31) | H:17, H:70 |
| Chiều cao đồi TOPH | 32 m (đỉnh) | H:17 |
| Nền phẳng FLAT | 1,7 m (nền các pad dưới chân đồi) | H:17 |
| Phố ẩm thực FOOD | x 289–353, z 91–118 (64 × 27) | H:19 |
| Căn hộ APT | x 428–472, z 68–100 (44 × 32) | H:20 |
| Showroom SHOW | x 289–337, z 120–152 (48 × 32) | H:21 |
| Đầm nước mặn LAG | tâm (306, 254), bán kính x 31, z 13 (elip) | H:22 |
| 4 lô biệt thự | tâm x = 286 / 302 / 318 / 334, z = 231, mỗi lô 13 × 11 | H:23 |
| Đường ven biển | x = COAST_X = 286; ngõ biệt thự z = LANE_Z = 218 | H:24 |

Sơ đồ bố cục (Bắc ở trên):

```
 z=66  ┌───────────────────────────────────────────────────────────┐
       │                                          [CĂN HỘ SKY QC]  │ x428–472, z68–100
 z=86  ══ cầu(262→278,5) ═ đường vào ═══►(→ đường xoắn ốc)          │
       │  [PHỐ ẨM THỰC] x289–353,z91–118  ── thang lớn ─┐          │
 z=120 │  [SHOWROOM]  x289–337,z120–152                  ▼          │
       │                         ░░ ĐỒI cao 32 m, tâm (392,170) ░░  │
 x=286 │ đường ven biển ║        THÁP BRAND QC trên đỉnh             │
       │                ║                                            │
 z=205 │  ▬▬ cổng gác ▬▬ (rào z=205, x276–356)                      │
 z=218 │  ║═══ ngõ x286→352                                          │
 z=231 │  [BT1][BT2][BT3][BT4]   x279,5–340,5                        │
 z=254 │      (đầm nước mặn, tâm (306,254))                          │
       └───────────────────────────────────────────────────────────┘ z=274
```

Cách module phụ thuộc: `hills.js` dựng địa hình, đường, thang, cây, đèn, rồi xuất `W.hillsInfo` (H:206); các module còn lại đọc `hillsInfo` để biết pad/toạ độ (`monument`, `mountaintown`, `foodstreet`, `riverside`, `luxury` đều trả null nếu không có `hillsInfo`).

Các điểm dịch chuyển bản đồ (`PLACES`) trong phạm vi tài liệu:

| Biểu tượng + tên | Đích (x, z) → nhìn về | Nguồn |
|---|---|---|
| ⛰️ Đồi Brand QC | (300, 87) → (340, 88) | H:205 |
| 🏛️ Tháp Brand QC | điểm cách tâm tháp 20 m phía cửa chính (≈ (380,8; 153,4)) → nhìn về tâm | MON:302 |
| 🏮 Phố Núi Sơn Thành | mép đường trước nhà sàn đầu tiên (chưa rõ toạ độ cụ thể: phụ thuộc kết quả đặt) | MT:222–223 |
| 🌉 Tháp cầu trời · (tên quán bar tháp đầu tiên) | đầu cầu đi bộ của tháp đầu tiên | MT:224 |
| 🍜 Phố ẩm thực Đồi QC | (293, 104) → nhìn (310, 104) | FS:184 |
| 🏙️ Căn hộ Sky QC | trước sảnh Bắc toà 1: (439, 72,5) → nhìn tâm toà | FS:185 |
| 🏡 Khu Biệt thự Ven Đầm | (286, 198) → nhìn (286, 205) | RV:156 |
| 🔑 Biệt thự của bạn | trước cửa căn đã mua (chỉ khi có `S.villa`) | RV:157 |
| QC Auto Luxury Showroom | (286,6; 136) → nhìn tâm showroom (313,136) | LX:62 |

---

### 1. ĐỒI BRAND QC — địa hình và hạ tầng (`hills.js`)

#### 1.1 Địa hình đồi — H:49–90

- **Vị trí và kích thước:** lưới độ cao 2 m phủ x 276–476, z 66–274 (101 × 105 điểm); đăng ký `EXTL` tên "ĐỒI BRAND QC · PHỐ NÚI" (H:78). Đồi chính hình chuông quanh HC: cao 32 m trong d ≤ 14, giảm mượt (smoothstep) về 0 ở d = 84, cộng nhiễu fbm ±3 m ở d 26–84 (H:25, H:60). Sân đỉnh phẳng 32 m trong d < 24,5, taluy mềm đến d = 31 (H:70).
- **Hình dạng đất liền:** hình chữ nhật HZ bị thụt vào 9–23 m (nhiễu), nhưng ép thụt ≤ 1,2 m quanh pad căn hộ/phố ẩm thực/showroom, dải đường ven biển và vùng biệt thự, và đất liền chắc chắn trong dải z ST±8,5 gần chân cầu (H:50–55). Ngoài mép đất: bờ cát rồi đáy biển (−6 m) (H:57, H:72).
- **Pad phẳng:** FOOD, APT, SHOW san về cao 1,7 m (viền chuyển tiếp 6–7 m); mỗi lô biệt thự phẳng ở 1,8 m (x ± (w/2+1), z từ z0−1 đến z1+2) (H:63–64).
- **Đầm:** vùng elip LAG lõm xuống −2,3 m, bờ nhô nhẹ (H:66).
- **Đường và thang** san phẳng theo đúng cao độ thiết kế, taluy mềm 11 m hai bên đường và 9 m hai bên thang (H:68–69).
- **Màu sắc:** cỏ xanh 2 sắc pha, khô dần khi cao, đá khi dốc, cát khi gần mực nước, bùn dưới nước; pad ẩm thực/căn hộ/showroom tô màu gạch xám (H:80–86).
- **Cây xanh:** tối đa 340 cây thưa (cách nhau ≥ 4,2 m), thân + tán cầu (xanh lá), thông (cao h > 12, xác suất 55%); tránh sân đỉnh (d < 33), đường (cách mép 3,5 m), thang, các pad, biệt thự, đầm, và nhà Phố Núi; mỗi cây có va chạm bán kính ≈ 0,32 m (H:184–196).
- **Chức năng:** nền cho toàn khu; mọi nhà dựng theo hàm độ cao này (`hAt`).
- **Nhân vật / Tương tác:** không có.

#### 1.2 Cầu nối Phường → đồi — H:171–182

- **Vị trí và kích thước:** x 262 → 278,5 (dài 16,5 m), z = 86 ± 5,5 (sàn rộng 11 m, mặt nhựa rộng 8 m). Dốc thoai thoải từ y = 0,12 (mặt Phường) lên 1,68 (mặt đồi), chia 11 mảnh sàn (mỗi mảnh 1,5 m) để đi bộ/xe lên êm.
- **Bố trí:** sàn bê tông xám (dày 0,5), mặt nhựa, 2 lan can ở z = 86 ± 5,3 (thanh kim loại vàng, có va chạm); cắt lan can bờ Đông Phường (x ≈ 263) chừa lối z 80,2–91,8 cho xe/người vào cầu.
- **Chức năng:** lối duy nhất từ phố chính Phường sang khu đồi.
- **Kết nối:** đầu Tây là đường Phường (x = 262); đầu Đông nối đường vào (mục 1.3).

#### 1.3 Đường vào + đường xoắn ốc lên đồi (MAIN) — H:28–35

- **Vị trí và kích thước:** rộng 8 m, hai làn (vạch trắng mép, vạch vàng giữa). Đường vào theo các điểm (262, 86) → (276, 86) → (300, 87) → (340, 88,5) → khoảng 14 m trước điểm đầu xoắn ốc, cao độ 1,7. Chạy sát lưng dãy nhà phố Bắc của phố ẩm thực (lưng nhà z = 92,4, mép đường ≈ z 92,5 tại x = 340).
- **Xoắn ốc:** 520 đoạn, góc quét 5,1 rad (≈ 292°, chưa đủ một vòng), bắt đầu ở góc −90° tức phía Bắc tâm đồi (≈ (392, 96), bán kính ≈ 74 m) rồi đi theo chiều Bắc → Đông → Nam → Tây, bán kính co dần đến 24,5 m ở độ cao 32 m, điểm cuối ≈ (369,3; 160,7) — mép sân đỉnh phía Tây Nam. Cao độ tăng đều từ 1,7 lên 32 m; mã chú thích "dốc ~11%"; chiều dài ≈ 270–300 m (ước tính).
- **Bố trí:** mặt đường là dải nhựa bám địa hình, khung hình đầu tiên được dựng lại theo `W.groundAt` (H:132–142). Đèn đường (cột thép 4,2 m + bóng cầu ấm, có glow, sáng thêm ban đêm) đặt mỗi 22 mẫu, luân phiên trái/phải, cách tim đường 4,9 m, bỏ x < 278 và vị trí trùng nhà Phố Núi (H:165–169).
- **Chức năng:** trục giao thông của đồi; hai bên (phía ngoài) gắn Phố Núi (mục 3).
- **Kết nối:** nối cầu (mục 1.2); cắt qua đường ven biển tại x ≈ 286; điểm cuối là sân đỉnh. Đồ thị taxi/xe bot: các nút mỗi ~14 m dọc đường, nối vào nút Phường (262, 86); đường ven biển có nút rẽ nối vào nút gần x = 286 (H:198–202).

#### 1.4 Đường ven biển (COAST) — H:36

- **Vị trí và kích thước:** rộng 7 m, nền 1,7: (286, 91) → (286, 218) → (352, 218). Mặt lát đá ô vuông xám.
- **Chức năng:** trục Bắc–Nam bên Tây khu: đi qua mặt tiền showroom (z 120–152) và đầu Tây phố ẩm thực (x ≈ 289), tới cổng gác biệt thự (z = 205), rồi rẽ Đông thành ngõ biệt thự (z = 218, x 286–352).
- **Kết nối:** đường vào / xoắn ốc cắt ở x ≈ 286; ngõ z = 218 là điểm "nhà" của xe đại gia (LX:93).

#### 1.5 Cầu thang lớn (phố ẩm thực → tháp) — H:38–41, H:147–163

- **Vị trí và kích thước:** đường thẳng từ SA ≈ (351,2; 109,4; cao 1,7) — sát đầu Đông phố ẩm thực — đến SB ≈ (378,9; 150,5; cao 32) trên mép sân đỉnh (hướng 4,12 rad ≈ 236° quanh tâm đồi). Dài ≈ 49,6 m, cao 30,3 m (dốc ≈ 61%), rộng 7 m, khoảng 151–152 bậc (cao 0,2 m, sâu ≈ 0,33 m).
- **Bố trí:** bậc đá màu kem trắng + khối nền dày 1 m dưới bậc; 2 lan can (cột tròn cách 8 bậc + thanh tay vịn vàng đồng tại cao 1 m); mỗi bên 5 cột đèn (t = 0,12 → 0,95, cách 0,2) bên ngoài lan can; va chạm: cột lan can và vật cản chạy dọc hai bên (không bước hụt ra ngoài); mỗi bậc là một "plat" để chân đặt đúng mặt bậc.
- **Chức năng:** lối đi bộ thẳng từ phố ẩm thực lên Tháp Brand QC.
- **Kết nối:** chân thang gần đầu Đông phố ẩm thực (bàn nước "Nước ép Sprint" ở x 333–340, z 105); đầu trên dẫn vào sân đỉnh, hướng thẳng cửa chính tháp (ENT trùng hướng SB).

#### 1.6 Các pad dành cho module khác — H:19–23

Phố ẩm thực (mục 5), căn hộ (mục 6), showroom (mục 8), biệt thự + đầm (mục 7) đều là các hình chữ nhật san phẳng; `freeAt` giữ vùng đệm cho nhà Phố Núi (H:97–98). Sân đỉnh (mục 2.1) là đĩa tròn.

---

### 2. THÁP BRAND QC (`monument.js`)

Hằng số: tâm C = (392, 170); Y0 = 32; bán kính toà RB = 13 (thành kính); bán kính giếng trời RA = 5,2; chiều cao tầng FH = 6,5; cao độ sàn FY = [32; 38,5; 45; 51,5] (trệt, lầu 1, lầu 2, sân thượng) (MON:11). Hướng cửa chính ENT = góc từ tâm đến SB ≈ −123,9° (≈ −2,163 rad), tức cửa nhìn về phía Tây Bắc, đúng đầu cầu thang lớn (MON:12). Mọi góc dưới đây ghi tương đối so với ENT. Toà "đi bộ thẳng vào, không cần bấm E" (MON:1).

#### 2.1 Sân đỉnh đồi — MON:54–64

- **Vị trí và kích thước:** đĩa tròn bán kính 24,4 m quanh (392, 170), cao 32,03 (nền đá sáng khắc vòng tròn đồng tâm + 48 tia).
- **Bố trí:** 10 cột đèn thép (cao 5,5 m, đầu cầu vàng, glow) đặt ở bán kính 22 m, cách nhau 36°, bỏ đèn gần cửa chính (± 0,3 rad); xen giữa là 10 bồn hoa (đá cẩm thạch Ø 2,4 + bụi cây) ở bán kính 21 m.
- **Chức năng:** quảng trường trước tháp; điểm đến cuối của cầu thang lớn và đường xoắn ốc.
- **Nhân vật:** không. **Tương tác:** không.

#### 2.2 Vỏ toà — MON:66–96

- **Vị trí và kích thước:** hình trụ tròn tâm C, bán kính 13 m (mặt sàn ngoài 13,35), cao từ 32 đến 51,5 (3 tầng × 6,5 m) + sân thượng ngoài trời. Đường kính ≈ 26 m, tổng diện tích mỗi tầng ≈ 530 m² (trừ giếng trời ≈ 85 m²).
- **Bố trí:**
  - Sàn vành khăn lầu 1–3 (r từ 5,2 đến 13,35), mặt dưới ốp thanh gỗ, viền đồng, viền LED xanh quanh giếng trời và LED vàng sát kính, vành vàng ngoài.
  - Kính bao quanh từng tầng (trệt chừa cửa chính rộng 0,42 rad ≈ 5,5 m); 36 cột khung thép đứng.
  - Mái hiên cửa chính (đá cẩm thạch 6 × 4,6, cao 4,2 m, viền vàng) trên 2 cột vàng; lan can sân thượng bằng kính thấp 1,1 m + tay vịn vàng.
  - Lan can giếng trời (kính + ống vàng) ở lầu 1, lầu 2, sân thượng, chừa khe tại lối chiếu nghỉ.
  - Va chạm: tường kính từng tầng (chỉ trong khoảng cao tương ứng), lan can.
- **Chức năng:** vỏ kiến trúc; giếng trời thông suốt từ trệt lên trời (không có mái sân thượng).
- **Kết nối:** cửa chính duy nhất ở trệt, hướng ENT. Camera tự thu gọn (≤ 6,2 m) và bị giới hạn trần khi ở trong (trừ sân thượng) (MON:316–318).

#### 2.3 Trệt — "Sảnh Tinh Hoa" — MON:52, MON:140–152, MON:176, MON:180–186, MON:217–252

- **Vị trí và kích thước:** cao độ 32, tầng cao 6,5 m (kính cao 6,05), nền tròn bán kính 12,95 m. Giếng trời r 5,2 ở giữa; vành đi lại rộng 7,8 m.
- **Bố trí và nội thất:**
  - Sàn: đá granite tối, viền đá sáng + chỉ vàng quanh giếng trời; la bàn vàng 16 cánh quanh giếng.
  - **12 bảng trưng bày** (3,4 × 2,12 m, treo trên ốp xanh navy ở bán kính 12,45 m, nền gradient xanh đậm viền vàng, cách đều trên cung từ ENT + 0,49 rad đến ENT + 2π − 0,49 rad) — nội dung: *7 nguyên tắc kiểm thử*: (1) Kiểm thử cho thấy có lỗi; (2) Kiểm thử hết là không thể; (3) Kiểm thử càng sớm càng tốt; (4) Lỗi thường tập trung; (5) Nghịch lý thuốc trừ sâu; (6) Kiểm thử tuỳ ngữ cảnh; (7) Ảo tưởng "không còn lỗi"; và *5 lỗi nổi tiếng*: 1947 con bọ đầu tiên (Harvard Mark II), 1996 Ariane 5 (tràn số), 1999 Mars Climate Orbiter (lệch đơn vị Anh–mét), 2012 Knight Capital (≈ 440 triệu USD trong 45 phút), 2014 Heartbleed (OpenSSL).
  - **3 tủ trưng bày kính** (bệ cẩm thạch + hộp kính Ø 1,2) ở bán kính 9,2 m, các góc ENT + 90°, ENT − 90°, ENT + 180°: mô hình kim tự tháp kiểm thử 3 tầng (đỏ/vàng/xanh lá), con bọ 1947 (thân nâu + 2 cánh), cúp vàng có quả cầu sáng xanh. Mỗi tủ có va chạm r 0,9.
  - **Bảng sơ đồ tầng** (1,5 × 2,5 m, đồng) ở góc ENT + 0,34 rad, bán kính ≈ 10,7: liệt kê 4 tầng và "Theo mũi tên vàng tới cầu thang". **Quầy thông tin** gỗ óc chó 2,6 × 1,05 × 0,75 ở góc ENT − 0,42 rad, bán kính ≈ 10,3.
  - **Băng ghế gỗ** dài 1,9 m (3 chỗ ngồi, nhãn "Ngồi xem trưng bày (E · C)") ở bán kính 10,3, tối đa 12 vị trí cách 30°; bỏ chỗ trùng lối vào/chân thang/tủ/quầy → trệt còn ≈ 1 ghế (tính tay).
  - **Chậu cây** (chậu đen + bụi xanh) ở bán kính 7,1, tối đa 6 vị trí.
  - **Chỉ đường:** các mũi tên vàng phát sáng trên sàn từ cửa chính → vòng quanh giếng trời → chân cầu thang xoắn (MON:225–227); cổng cầu thang bằng 2 trụ đồng + xà ngang + biển "CẦU THANG ↑ Lầu 1 · Lầu 2 · Sân thượng" (MON:228–232); chữ "TRỆT" trên lõi cầu thang.
- **Chức năng:** sảnh vào, giới thiệu "nguyên tắc kiểm thử" và lịch sử lỗi phần mềm.
- **Nhân vật:** không có.
- **Tương tác:** phím E tại quầy thông tin (r 1,8, khi đứng ở trệt) → hiện hướng dẫn "theo mũi tên vàng tới cầu thang xoắn; mỗi tầng có 2 cột đèn xanh + biển tên tầng; lầu 2 có phòng bí ẩn, trên cùng là sân thượng" (7 giây). Ngồi ghế: E hoặc C. Các bảng/tủ chỉ để xem.
- **Kết nối:** cửa chính ↔ sân đỉnh; cầu thang xoắn lên lầu 1.

#### 2.4 Cầu thang xoắn ốc trung tâm — MON:98–123

- **Vị trí và kích thước:** quanh lõi tròn đá tối bán kính 1,35 m ở tâm toà (cột cao 31,5 m, xuyên lên trên sân thượng 12 m). Bậc rộng từ r = 1,35 đến 5,0 (3,65 m), bậc cao 0,25 m, mỗi bậc quay 12° (30 bậc/vòng, 7,5 m cao/vòng); tổng 78 bậc, ≈ 2,6 vòng. Bắt đầu tại ENT + 99°, quay theo chiều tăng góc (Bắc → Đông → Nam → Tây khi nhìn từ trên).
- **Bố trí:** mặt bậc gỗ óc chó tối + nẹp đèn vàng nhạt ở mép bậc; mặt dưới đồng; cột nhỏ + ống tay vịn vàng chạy theo đường xoắn (ngắt tại các chiếu nghỉ); 3 chiếu nghỉ gỗ 2,0 m bắc qua khe giếng trời vào sàn mỗi tầng tại các góc: lầu 1 ≈ ENT + 51°, lầu 2 ≈ ENT + 3°, sân thượng ≈ ENT − 45°. Lan can giếng trời chừa lối ở các chiếu nghỉ; cuối thang (sân thượng) có chắn kính để không bước hụt xuống giếng trời. Mỗi chiếu nghỉ có 2 cột đèn xanh hai bên + biển treo "CẦU THANG · tên tầng ↑/↓" + hàng mũi tên chỉ vào lối + tên tầng trên lõi.
- **Chức năng:** đường đi duy nhất giữa các tầng; đi bộ lên (không có thang máy).
- **Kết nối:** chân thang ở trệt (góc ENT + 99°, qua cổng cầu thang); đỉnh thang dẫn ra sân thượng.

#### 2.5 Lầu 1 — "Kỹ thuật & Công cụ" — MON:153–165, MON:177, MON:187–191

- **Vị trí và kích thước:** sàn ở cao độ 38,5; cao 6,5 m; vành khăn r 5,2–13,35.
- **Bố trí và nội thất:** sàn gỗ óc chó (gỗ ván nhiều tông). **12 bảng** teal xanh đậm, treo trên cung ENT ± 0,2 rad quanh toà (gần kín vòng): Phân vùng tương đương; Phân tích giá trị biên; Bảng quyết định; Chuyển trạng thái; Kiểm thử cặp (pairwise); Kiểm thử thăm dò; Kim tự tháp kiểm thử; Tự động hoá UI (Selenium/Playwright/Cypress/Appium); API & Hiệu năng (Postman/JMeter/k6); CI/CD & chất lượng liên tục; Bảo mật; Khả năng truy cập. **3 kiosk đố vui** (hộp tối 0,9 × 1,2 × 0,5, màn hình xanh sáng nghiêng) ở bán kính 9,6, các góc ENT + 0,9 rad, ENT − 0,9 rad, ENT + 180°. Băng ghế gỗ ≈ 6 chỗ đặt (tính tay), chậu cây tối đa 6.
- **Chức năng:** giới thiệu kỹ thuật thiết kế test và công cụ; chơi đố vui.
- **Nhân vật:** không có.
- **Tương tác:** E ở kiosk (r 1,8, khi đứng đúng tầng) → "Kiosk đố vui QA" mở `W.life.openQuiz()` (nếu chưa sẵn: báo "Kiosk đang khởi động…"). Phần thưởng quiz do module khác xử lý (chưa rõ trong phạm vi tài liệu).
- **Kết nối:** chiếu nghỉ lầu 1; thang xoắn lên/xuống.

#### 2.6 Lầu 2 — "Đại sảnh Huyền thoại" — MON:166–174, MON:178–179

- **Vị trí và kích thước:** sàn cao 45; cao 6,5 m.
- **Bố trí và nội thất:** sàn terrazzo xanh ngọc có hạt vàng. **8 bảng** nâu đỏ (maroon) trên cung từ MYA + 0,7 rad đến MYA + 2π − 0,7 rad (MYA = ENT + 180°, chừa chỗ phòng bí ẩn): Glenford Myers ("The Art of Software Testing" 1979); Cem Kaner/James Bach/Bret Pettichord ("Lessons Learned in Software Testing" 2001); Lisa Crispin & Janet Gregory ("Agile Testing" 2009); Kent Beck (TDD); Mike Cohn (kim tự tháp kiểm thử); Michael Bolton & James Bach (Rapid Software Testing); "Đội QC Bình Phan" (Tận tâm · Chính trực · Học hỏi); "Bạn – người QA tiếp theo". Băng ghế ≈ 5 chỗ đặt (tính tay), chậu cây tối đa 6.
- **Chức năng:** vinh danh người đặt nền móng nghề kiểm thử + giá trị đội QC; chứa phòng bí ẩn (mục 2.7).
- **Nhân vật:** không có. **Tương tác:** chỉ ghế (E/C) và phòng bí ẩn.
- **Kết nối:** chiếu nghỉ lầu 2 (≈ ENT + 3°); thang xoắn.

#### 2.7 Phòng bí ẩn (lầu 2) — MON:193–215

- **Vị trí và kích thước:** hình quạt phía đối diện cửa chính: góc MYA ± 0,55 rad (± 31,5°, ≈ 63°), bán kính trong 6,1 (rIn = RA + 0,9) đến 12,7 m; cao 6 m (FH − 0,5); cao độ 45. Rộng ≈ 10,5 m (cung giữa) × sâu ≈ 6,6 m.
- **Bố trí:** 2 vách bên (tường tím sẫm hơi phát sáng) chạy xuyên tâm, 1 vách cong phía giếng trời với khe cửa rộng ≈ 1,8 m; dầm trên cửa cao từ 2,7 m. Cửa trượt tím 1,6 × 2,6 ở giữa vách cong + biển "? PHÒNG BÍ ẨN"; 3 chốt chặn va chạm (hạ xuống khi cửa mở > 60%). Bên trong: **bệ cẩm thạch** Ø 1,4–1,8 ở bán kính ≈ 9,6 với dấu "?" tím phát sáng xoay (cao 2,1 m) trên bệ. Phòng trống, "để dành cho điều đặc biệt sẽ ra mắt sau" (nội dung hộp thoại).
- **Chức năng:** chỗ giữ cho tính năng tương lai.
- **Nhân vật:** không.
- **Tương tác:** E ở cửa (r 2,2, khi đứng lầu 2). Lần đầu: hộp thoại xác nhận "Căn phòng này được để dành…; bạn có muốn bước vào xem trước không gian trống bên trong?" nút "Mở cửa" → cửa trượt mở (toast "🔮 Cửa phòng bí ẩn mở ra…"). Khi đã mở, E để đóng ("Đóng cửa phòng bí ẩn"). Không có phần thưởng/giá.
- **Kết nối:** chỉ có một cửa vào, mở ra sàn lầu 2.

#### 2.8 Sân thượng — MON:266–279, MON:297–300

- **Vị trí và kích thước:** cao độ 51,5, ngoài trời hoàn toàn (không mái), vành r 5,2–13,35 + giếng trời mở.
- **Bố trí và nội thất:** sàn gỗ deck sáng; lan can kính 1,1 m + tay vịn vàng ngoài rìa (r 13,2); **3 ống nhòm** (cột thép + ống đen) ở bán kính 11,8, các góc ENT, ENT + 120°, ENT − 120°; **3 ghế băng cẩm thạch** 2,0 × 0,12 × 0,6 (3 chỗ) ở bán kính 11,4, các góc ENT + 60°, ENT − 60°, ENT + 180°, quay mặt ra ngoài; băng LED chữ chạy vòng ngoài mép (cao 50,5, r 13,42) với dòng "★ BRAND QC ★ TINH HOA QA/QC ★ CHẤT LƯỢNG LÀ UY TÍN ★ BÌNH PHAN QC TEAM".
- **Chức năng:** ngắm toàn cảnh thành phố, nghỉ chân.
- **Nhân vật:** không.
- **Tương tác:** E ở ống nhòm (r 1,6, khi ở sân thượng) → camera chuyển sang chế độ ống nhòm (FOV 22), kéo chuột nhìn quanh 360°, lăn chuột phóng to/thu nhỏ; bấm E hoặc phím di chuyển để thoát. Ngồi ghế: E/C ("Ngồi ngắm toàn cảnh").
- **Kết nối:** đỉnh cầu thang xoắn.

#### 2.9 Biểu tượng chữ QC vàng + hiệu ứng — MON:281–302, MON:304–319

- **Vị trí và kích thước:** chữ "QC" 3D mạ vàng (chữ Q bằng vòng xuyến + đuôi, chữ C cung 280°), phóng 1,7 lần, đặt tại tâm toà ở cao ≈ 66 m (FY3 + 14,5), nhấp nhô ± 0,3 m, xoay 0,25 rad/s; viên kim cương xanh nhạt phía trên xoay ngược; đế vàng tròn ở cao ≈ 64,1.
- **Bố trí:** 90 hạt lấp lánh quay quanh; 4 cột sáng 140 m (chỉ hiện ban đêm, đảo xung quanh); nhãn nổi "🏛️ Tháp Brand QC" cao ≈ 68,5 (nhìn thấy từ 420 m). Khung hình: toàn bộ nội thất (nhóm `inner`) chỉ hiện khi người chơi cách tâm < 90 m và không ở trong nhà khác.
- **Chức năng:** biểu tượng/điểm nhìn từ xa của cả thành phố.
- **Nhân vật/Tương tác:** không.

---

### 3. PHỐ NÚI SƠN THÀNH (`mountaintown.js` + thuật toán trong `hills.js`)

#### 3.1 Thuật toán chọn chỗ đặt (TOWN/SLOPE) — H:92–115

Mã `hills.js` chọn toạ độ, `mountaintown.js` dựng nhà. Có 3 loại: `stilt` (nhà sàn bám vách), `tower` (tháp cầu trời), `slope` (tháp sườn đồi).

**Quy tắc đặt nhà sàn và tháp cầu trời (dọc đường xoắn ốc)** — H:100–110:
1. Duyệt từng mẫu trên đường MAIN, bắt đầu từ mẫu đầu tiên có cao độ > 4,2 m (FLAT + 2,5) và dừng khi cao độ > 29,5 m (TOPH − 2,5). Trên đoạn xoắn ốc mỗi mẫu cách ≈ 0,6 m (520 đoạn trên đường ≈ 300 m — ước tính), nên khoảng cách tối thiểu "21 mẫu" giữa 2 nhà ≈ 12 m dọc đường.
2. Tại mỗi mẫu, lấy vectơ dọc đường (u) và vectơ pháp tuyến n hướng ra **phía ngoài tâm đồi** (phía thấp, sườn dốc xuống). Mọi nhà đứng ở phía ngoài đường.
3. Thứ tự thử: nếu số thứ tự k chia 3 dư 1 → thử `tower` trước rồi `stilt`; ngược lại thử `stilt` trước rồi `tower`. `tower` bị bỏ qua nếu đã đủ 4 tháp hoặc chưa cách tháp trước ≥ 3 nhà.
4. Kích thước theo loại (e = nửa rộng đường + 0,7 = 4,7 m; "ra ngoài" tính từ tim đường): `stilt` D = 8,5, Wd = 11, gap 0; `tower` D = 12, Wd = 12, gap 7 (cầu đi bộ dài 7 m).
5. Kiểm tra địa hình: lấy mẫu lưới trên toàn bàn chân, đất ở mọi điểm phải không cao hơn mặt đường tại chỗ (cộng sai số theo dốc), không lọt ngoài lưới; nếu đường khác cao ≠ 1,2 m ở gần thì loại; độ thấp nhất `gmin` ≥ 0,9; không vướng pad ẩm thực/căn hộ/showroom/biệt thự/đầm/cầu thang/sân đỉnh (`freeAt`); không chồng nhà khác (`inTown` đệm 6 m).
6. Độ chênh đường–chân dốc (drop = h_đường − gmin): `tower` ≥ 9 m, `stilt` ≥ 2,4 m.
7. Đặt xong thì dịch tối thiểu 21 mẫu, tăng k.

**Số lượng:** mã chặn tối đa 4 tháp cầu trời; nhà sàn không có trần cứng (chỉ bị giới hạn bởi khoảng cách và địa hình). Số lượng điển hình theo yêu cầu: **13 nhà sàn, 3 tháp cầu trời** (log khi chạy: "Phố Núi: N nhà sàn, N tháp cầu trời, N tháp sườn đồi", MT:225). Mã không lưu sẵn số này nên "chưa rõ" nếu không chạy; vị trí cụ thể từng nhà cũng chưa rõ (phụ thuộc kết quả địa hình, tất định vì dùng bộ sinh ngẫu nhiên có hạt giống 777123 và hạt giống 90210 ở MT:14).

**Quy tắc đặt tháp chung cư trên sườn đồi (SLOPE)** — H:111–115:
- Thử ngẫu nhiên tối đa 4000 lần, giữ tối đa 16 tháp (điển hình ≈ 7).
- Điều kiện: điểm nằm trong vùng (cách mép 14 m); độ cao đất 2,5–16 m; xa tâm ≥ 44 m; kích thước w, d ngẫu nhiên 9–14 m; 4 góc + tâm đều có đất, thấp nhất ≥ 1,2 m, chênh góc–góc ≤ 12 m; cách đường ≥ max(w,d)/2 + 9 m; cách các pad ≥ 8 m, cách nhà Phố Núi ≥ 10 m; cách tháp sườn đồi khác ≥ (w1+w2)/2 + 9 m; chiều cao thân = min(22 + 30·ngẫu nhiên, 28 − gmin) ≥ 14 m (do đó thực tế 14–26,8 m).

#### 3.2 Bảng hiệu, đèn lồng, mặt tiền, hiệu ứng ban đêm — MT:22–42, MT:66–79, MT:210–219

- **Mặt tiền:** 9 loại vật liệu: gỗ sẫm (`timber`), nâu đất (`ochre`), kem trắng (`white`) cho nhà sàn; xanh ngọc (`teal`), xanh trời (`sky`), san hô (`coral`), tím nhạt (`lilac`) cho tháp cầu trời; san hô, tím nhạt, vàng chanh (`lemon`), xanh bạc hà (`mint`), xanh trời, xanh ngọc cho tháp sườn đồi. Mỗi ô 4 gian × 4 tầng (12 × 12,8 m); ban đêm cửa sổ sáng ngẫu nhiên.
- **Bảng hiệu:** 1 atlas chữ vàng trên nền đỏ sẫm, cho 10 quán + 4 bar + 1 dòng "🙏 Cảm ơn quý khách · Hẹn gặp lại".
- **Đèn lồng đỏ** (InstancedMesh) treo dưới các mái hiên mỗi 3,2 m, cách nhau 1,45 m; dây bóng đèn; glow giới hạn 70 điểm; đêm sáng gấp nhiều lần.
- **Tương tác chung:** mọi quầy gọi món mở hộp thoại thực đơn (`menuModal`) → "Gọi" → xác nhận trả tiền (`askPay`) → trừ tiền (`spend`) → buff: `energy` = "chạy nhanh hơn N phút"; `coffee` = "thưởng quiz +20% trong N phút" (MT:63–65).

#### 3.3 Danh sách quán nhà sàn (SHOPS, 10 quán) — MT:45–56

Nhà sàn thứ n lấy quán `SHOPS[n mod 10]` theo thứ tự đặt (nhà thứ 11–13 lặp lại quán 1–3). Cột "Món" ghi tên – giá (💰) – buff – phút – ghi chú. Cờ "ăn" = khách bot gọi món ăn.

| # | Quán | Đồ khách gọi (bot) | Thực đơn |
|---|---|---|---|
| 1 | ☕ Café Vách Đá | cà phê muối, bạc xỉu, cà phê trứng | ☕ Cà phê muối 25 – coffee 10 ("Ngắm mây bay dưới chân"); 🍮 Bánh flan 20 – energy 5 |
| 2 | 🍜 Mì Cay Sơn Thành (ăn) | mì cay cấp 3, trà chanh | 🍜 Mì cay 7 cấp độ 45 – energy 12 ("Cay như bug production"); 🥟 Sủi cảo chiên 35 – energy 8 |
| 3 | 🍲 Lẩu Cay Bám Vách (ăn) | lẩu cay, nước sâm | 🍲 Lẩu cay tê cửu cung 150 – energy 24; 🥬 Rau nhúng thập cẩm 30 – energy 6 |
| 4 | 🧋 Trà Sữa Mây Bay | trà sữa khoai môn, trà đào | 🧋 Trà sữa khoai môn 28 – coffee 8; 🍑 Trà đào cam sả 22 – coffee 6 |
| 5 | 🍢 Xiên Nướng Dốc Đêm (ăn) | xiên nướng, nước mía | 🍢 Set xiên nướng 55 – energy 12; 🌽 Bắp nướng mỡ hành 20 – energy 5 |
| 6 | 🍰 Bánh Ngọt Đỉnh Mây | bánh tiramisu, cacao nóng | 🍰 Bánh tiramisu 30 – energy 6; 🍫 Cacao nóng 25 – coffee 8 |
| 7 | 🥟 Há Cảo Cầu Treo (ăn) | há cảo tôm, trà hoa cúc | 🥟 Há cảo tôm 40 – energy 10; 🍵 Trà hoa cúc 18 – coffee 6 |
| 8 | 🍨 Kem Gió Núi | kem dừa, sinh tố bơ | 🍨 Kem dừa 22 – energy 5; 🥑 Sinh tố bơ 28 – energy 7 |
| 9 | 🍚 Cơm Niêu Sườn Đồi (ăn) | cơm niêu, canh chua | 🍚 Cơm niêu cá kho 65 – energy 14; 🥣 Canh chua 30 – energy 6 |
| 10 | 🏮 Quán Nước Đèn Lồng | nước sấu, trà nhài | 🍹 Nước sấu đá 18 – energy 5; 🫖 Trà nhài ấm 20 – coffee 6 |

#### 3.4 Nhà sàn bám vách (13 điển hình) — `stilt()` MT:94–147

- **Vị trí và kích thước (mẫu):** đứng ở phía ngoài đường xoắn ốc; theo trục dọc đường rộng 11 m (3 khoang × 3,67 m), theo trục ra ngoài từ tim đường: sàn gỗ từ 4,35 đến 13,2 m (sâu ≈ 8,85 m), thân nhà dưới sàn từ 4,7 đến 13,2 m. Nền: 3 "bậc" sàn thượng, mỗi bậc cao bằng mặt đường cao nhất ở mép bậc + 0,06 m (và không thấp hơn mặt đất cao nhất dưới sàn + 0,08 m) → bước lên theo dốc đường. Các tầng dưới chồng xuống sườn dốc, đáy ở gmin − 1,6 m. Số "tầng" thay đổi theo độ dốc (chưa rõ: mã không đếm tầng; mái hiên cách nhau 3,2 m nên khoảng drop/3,2 tầng).
- **Bố trí và nội thất (cho một nhà):**
  - Khối thân tường đá nâu xám (`wallS`) + sàn gỗ nâu; mặt tiền ngoài và 2 mặt bên ốp mặt tiền kính cửa sổ (chọn theo chỉ số: gỗ sẫm/nâu đất/kem). Lan can mép ngoài (kính 0,9 + tay vịn gỗ, 3 cột mỗi khoang) + dây đèn ở cao lv + 2,5 m; 2 mặt bên cũng có lan can; mép phía đường bị chặn nếu thấp hơn sàn > 0,65 m (không chui gầm sàn); giữa 2 bậc sàn chênh > 0,6 m có tường chặn bậc.
  - Mái hiên đen xám 0,12 dày (rộng Wd + 1,2, sâu 1,0) cách nhau 3,2 m từ sàn xuống mặt đất trước nhà, viền đỏ, ban công thanh gỗ, đèn lồng đỏ cách 1,45 m (một phần có glow cam).
  - **Cổng gỗ + bảng hiệu**: 2 trụ đỏ cao 3,2 m ở ± 1,7 m cách tim đường 4,85 m, xà 3,9 m; bảng 2 mặt (mặt quay vào đường ghi tên quán, mặt quay ra ngoài ghi "Cảm ơn quý khách · Hẹn gặp lại").
  - **Quầy gọi món** gỗ sẫm 2,6 × 1,0 × 0,7 + mặt vàng 2,8 × 0,85 + 3 tách trắng, đặt trên khoang giữa cách mép ngoài 1,3 m; va chạm 2,7 m.
  - **4 bộ bàn ghế** (bàn tròn Ø 0,84, 2 ghế đối diện, dù che màu ngẫu nhiên trong 7 màu) đặt ở 2 khoang hai bên, mỗi khoang 2 bàn (cách tim đường 6,3 và 9,3 m) → 8 chỗ ngồi (E hoặc C, nhãn "Ngồi quán"); 2 chậu cây ở 2 góc ngoài.
  - Nhãn nổi tên quán, câu "Quán sân thượng bám vách · gọi món · ngồi ngắm phố núi" (nhìn thấy trong 40 m).
- **Chức năng:** quán cà phê/quán ăn bên đường.
- **Nhân vật:** không có nhân viên. Khách bot (hệ thống `cafe.js`, ngoài phạm vi) tới ngồi tối đa 2 người, xuất hiện cách 14 m dọc đường, vào/ra qua cổng.
- **Tương tác:** E ở quầy (r 2,0) → thực đơn quán (xem 3.3); ngồi ghế (E/C).
- **Kết nối:** mép đường xoắn ốc (mặt sàn ngang mặt đường); không có cửa/tường chắn lối vào.

#### 3.5 Tháp cầu trời (3 điển hình, tối đa 4) — `tower()` MT:149–192, danh sách BARS MT:57–62

Bốn quầy bar, gán lần lượt theo thứ tự đặt: `BARS[n mod 4]`:

| # | Bar | Đồ khách gọi (bot) | Thực đơn |
|---|---|---|---|
| 1 | 🍸 Sky Bar Release | mocktail Release, soda chanh | 🍸 Mocktail "Release" 60 – coffee 14; 🍋 Soda chanh bạc hà 30 – energy 6 |
| 2 | ☁️ Café Mây Tầng 9 | cold brew, latte | 🧊 Cold brew 35 – coffee 10; 🥛 Latte 35 – coffee 10 |
| 3 | 🌃 Rooftop Ngắm Thành Phố | trà sữa nướng, nước ép | 🔥 Trà sữa nướng 32 – coffee 8; 🍊 Nước ép cam 28 – energy 6 |
| 4 | 🌬️ Đài Gió Café | cà phê dừa, sinh tố | 🥥 Cà phê dừa 30 – coffee 10; 🍓 Sinh tố dâu 28 – energy 6 |

- **Vị trí và kích thước (mẫu):** phía ngoài đường, cách tim đường 4,7 m có miệng cầu; cầu đi bộ rộng 3,6 m, dài 7,65 m (từ 4,35 đến 12 m), cao độ BL = mặt đường cao nhất ở miệng cầu + 0,06; thân tháp 12 (dọc đường) × 12 (sâu) ở 11,7–23,7 m cách tim đường, từ đáy (gmin − 1,6) đến nóc ở cao độ `top = BL + 3,4 + 3,2·nUp`, với nUp = 1–3 (tính theo khoảng đến TOPH − 3): nóc cao hơn cầu 6,6–13 m; sân thượng gọi là "tầng nUp + 2" trong thông báo.
- **Bố trí và nội thất:**
  - Trụ đá đỡ giữa cầu; hai bên cầu: lan can kính + dây đèn.
  - Cửa sảnh trời (khung tối 2,4 × 2,6 + cánh sáng xanh) ở cao độ cầu, có biển tên bar phía trên.
  - Thân tháp ốp mặt tiền 4 phía (xanh ngọc/xanh trời/san hô/tím nhạt theo chỉ số), nóc có viền LED đổi màu cầu vồng, lan can kính 1,05 m + tay vịn thép, 4 góc phát sáng màu riêng (xanh/hồng/vàng/lục).
  - **Sân thượng:** cabin thang máy tối 2,2 × 2,6 × 2,2 ở một góc; **quầy bar** gỗ 1,0 × 1,05 × 4,2 + mặt vàng sát mép "ngoài"; **4 bộ bàn ghế** (không dù) → 8 chỗ ngồi; 3 chậu cây lớn ở 3 góc; 4 cột đèn góc cao 3 m + dây bóng đèn (kể cả đường chéo); **ống nhòm** ở phía ngoài (mép xa đường).
  - Nhãn nổi tên bar "Cầu đi bộ → thang máy lên sân thượng tầng N" (nhìn thấy trong 40 m).
- **Chức năng:** quán bar/café ngắm cảnh trên cao.
- **Nhân vật:** không nhân viên; khách bot tối đa 2 người ngồi ở các bàn.
- **Tương tác:**
  - E ở miệng cầu trên đường gần cửa (r 1,8, đứng ở cao độ cầu): "Thang máy lên sân thượng" → dịch chuyển lên góc sân thượng, báo "Lên sân thượng tầng N…"; E ở cabin: "Thang máy xuống cầu đi bộ".
  - E ở quầy bar (r 1,8): thực đơn bar (bảng trên).
  - E ở ống nhòm (r 1,6): camera bay ra xa 3 m ngoài mép, nhìn ra 160 m, hạ 14 m, tự kết thúc sau 9 giây hoặc khi bấm W/A/S/D (MT:216–219).
- **Kết nối:** cầu đi bộ từ mép đường xoắn ốc → cửa sảnh trời; thang máy (dịch chuyển) giữa cầu và sân thượng. Không có cầu thang bộ lên sân thượng.

#### 3.6 Tháp chung cư trên sườn đồi (≈ 7 điển hình, tối đa 16) — `slope()` MT:194–204

- **Vị trí và kích thước (mẫu):** đứng ở sườn đồi, cách đường ≥ 12 m (xem 3.1); chân w × d ngẫu nhiên 9–14 m mỗi chiều; cao 14–26,8 m; bệ móng đá rộng hơn thân 2 m (cao từ gmin − 2 đến gmax + 4), thân từ gmin − 2 đến gmin + hgt. Số tầng ước ≈ hgt / 3,2 ≈ 4–8 tầng (mã không có tầng thật, chỉ họa tiết 4 tầng mỗi ô).
- **Bố trí:** 4 mặt ốp mặt tiền theo chỉ số (6 màu xoay vòng), mái xám tối + viền LED đổi màu, bồn nước trụ thép và cột ăng ten ở nóc; glow đỉnh theo 5 màu xoay vòng.
- **Chức năng:** phông nền tạo cảnh đô thị dày, nhiều cao độ.
- **Nhân vật/Tương tác:** không; không vào được (khối đặc, va chạm hộp rộng hơn thân 1 m mỗi phía).
- **Kết nối:** không có.

---

### 4. Phụ: Showroom "QC Auto · Luxury" (vỏ toà) — `luxury.js` LX:22–64

- **Vị trí và kích thước:** toà kính 44 × 28 m: x 291–335, z 122–150 (tâm (313, 136)), trong pad SHOW x 289–337, z 120–152; cao 9 m, 2 tầng kính (nền 1,7, mái ở cao ≈ 10,7 + viền thép). Mặt tiền (cửa chính) ở phía Tây, nhìn ra đường ven biển, cửa tại x ≈ 289,6, z = 136.
- **Bố trí:** sàn gạch bóng; kính 3 mặt Bắc/Nam/Đông kín và mặt Tây có khe cửa rộng 4 m (z 134–138) kèm kính trên cao 3,2 m; khung thép cách 4 m; mái trắng + gờ thép, mái hiên cửa 4,6 × 6,5 ở cao 3,6 m trên 2 cột thép (x ≈ 286,8, z = 133,1 và 138,9 — trùng đúng tim đường ven biển, mã không giải thích); biển hiệu mái 26 × 3,2 "QC AUTO · LUXURY SHOWROOM" nghiêng nhìn về Tây (cao ≈ 12,9); 28 đèn trần; "tầng lửng phía sau" (tấm 43,6 × 8 m ở cao 6,3 — tấm này đặt rộng 43,6 theo trục x lệch toà, có thể nhầm trục; chưa rõ ý đồ). 6 xe trưng bày qua kính trên bệ tròn có viền sáng: siêu xe mui trần đỏ (bàn xoay, hero) ở (309, 136); limousine đen (299, 127); xe sang trắng (299, 145); xe thể thao vàng (327, 127); SUV xanh lục (327, 145); sedan xanh dương (319, 127).
- **Chức năng:** cửa hiệu xe; nội thất phòng trưng bày thật do `W.showroom` (module khác) xử lý.
- **Nhân vật:** trong cùng file có 3 đại gia lái xe (limousine/xe sang/mui trần) chạy giữa ngõ z = 218 (nhà) và toà công ty Downtown; ngoài phạm vi tài liệu này.
- **Tương tác:** E ở cửa (r 2,2): "Vào QC Auto Luxury Showroom – ô tô, siêu xe, xe máy" → `W.showroom.enter()`. Cả toà là vật cản (có tin nhắn hướng dẫn vào bằng cửa chính). Căn nhà showroom cũ trong Phường thành "điểm chỉ đường" (E: taxi tới); điểm đến taxi và `PLACES` "Showroom xe" được đổi sang đây.
- **Kết nối:** đường ven biển x = 286 ở phía Tây; điểm ra của phòng trưng bày được dời về trước cửa mới.

---

### 5. PHỐ ẨM THỰC ĐỒI QC (`foodstreet.js`)

#### 5.1 Phố đi bộ và 2 dãy nhà — FS:29–91

- **Vị trí và kích thước:** x 290–352 (nhà chiếm x 291–351), phố đi bộ z 100–108 (rộng 8 m); dãy Bắc: z 92,4–100 (sâu 7,6 m); dãy Nam: z 108–116,4 (sâu 8,4 m); cao độ nền 1,7; mỗi toà 2 tầng, tầng cao 4,2 m, tổng cao 9 m (đỉnh ≈ 10,7). Lưng nhà dãy Bắc sát đường xoắn ốc vào đồi; đầu Tây giáp đường ven biển (x = 286); đầu Đông dẫn tới chân cầu thang lớn (≈ (351,2; 109,4)).
- **Bố trí chung:**
  - Mỗi nhà: khối 2 tầng màu kem/be/xám/hồng nhạt xoay vòng, mặt tiền kính tầng trệt (cao 3,1) + khung tối, mái hiên sọc 6 màu nghiêng ra phố (rộng w − 0,6, sâu 1,8), bảng hiệu sáng 1 atlas (tối đa 8 m × 0,9, cao ≈ 5,85), tầng 2 có cửa sổ kính (cách 3,2 m), ban công đá có chậu cây + bụi xanh.
  - **Cổng chào** đầu Tây phố (x ≈ 289,5): 2 cột đỏ cao 6 m ở z = 100,5 và 107,5, xà đỏ + bảng "PHỐ ẨM THỰC ĐỒI QC" 2 mặt (cao ≈ 7,9).
  - **Dây đèn** giăng ngang phố: 9 cột 5,4 m ở mỗi bên (x = 294, 300, …, 342) với dây bóng đèn ngang phố; glow tổng cộng khoảng 1/6 số bóng.
  - **Bồn cây** 4 cặp (x = 299, 313, 327, 341; z = 101,6 và 106,4): bệ đá + cây tán xanh.
  - **Đài phun nước** giữa phố tại (321, 104): bồn đá r 2,4–2,6, mặt nước xanh, cột đá + quả cầu vàng (va chạm r 2,6).
  - **Bàn ngoài phố** (xem 5.2): 3 cụm, mỗi bàn tròn có dù, 2 ghế.
- **Chức năng:** đi dạo, ăn uống, mua đồ ăn vặt; trục dẫn tới cầu thang lên tháp.
- **Nhân vật:** nhân viên: không có. Khách bot đến từ cổng Tây, tối đa 2 người mỗi quán nước và 3 người mỗi nhà hàng, ngồi ở bàn ngoài phố/trong nhà hàng (hệ thống `cafe.js`).
- **Tương tác:** mỗi quầy một hộp thoại gọi món + xác nhận trả tiền + buff (xem bảng 5.2). Nội thất tầng trệt hai nhà hàng chỉ hiện khi người chơi ở gần (cách (321,104) < 90 m hoặc tâm căn hộ < 70 m) (FS:180).
- **Kết nối:** đường ven biển (Tây), cầu thang lớn (Đông), đường xoắn ốc (phía Bắc, sau lưng nhà).

#### 5.2 Danh sách 9 quán — FS:31–41, mô tả từng quán

Quầy gọi món của 7 quán không vào được đặt ở ngoài phố cách mặt tiền 1,2 m (r 2,2); khách bot ngồi bàn ngoài phố. Mỗi quán cao 9 m, sâu bằng dãy nhà (7,6 hoặc 8,4 m), tầng trệt đặc (không đi vào trong, trừ 2 nhà hàng).

##### Dãy Bắc (mặt tiền z = 100, nhìn ra phố hướng Nam)

| # | Quán | x0–x1 | Rộng × sâu (m) | Loại | Thực đơn (giá – buff – phút) |
|---|---|---|---|---|---|
| N1 | ☕ Cà phê Bug Free | 291–301 | 10 × 7,6 | quán nước | ☕ Cà phê sữa đá 20 – coffee 8 ("Tỉnh táo săn bug"); 🥥 Cà phê dừa 25 – coffee 10; 🍰 Bánh tiramisu 30 – energy 6 |
| N2 | 🥖 Bánh mì Test Case | 301–311 | 10 × 7,6 | tiệm | 🥖 Bánh mì đặc biệt 20 – energy 6; 🍳 Bánh mì ốp la 15 – energy 4 |
| N3 | 🍷 Sky Bug Fine Dining | 311–331 | 20 × 7,6 | nhà hàng sang (vào được, xem 5.3) | 🥩 Bò Wagyu áp chảo 180 – energy 25; 🦞 Tôm hùm nướng bơ tỏi 220 – energy 30; 🍷 Set tráng miệng 90 – coffee 20 |
| N4 | 🍦 Kem Smoke Test | 331–341 | 10 × 7,6 | tiệm | 🍦 Kem ốc quế 15 – energy 4; 🍨 Kem ly 3 vị 25 – energy 6 |
| N5 | 🍣 Sushi Unit Test | 341–351 | 10 × 7,6 | tiệm | 🍣 Sushi set 60 – energy 12; 🍜 Ramen 45 – energy 10 |

##### Dãy Nam (mặt tiền z = 108, nhìn ra phố hướng Bắc)

| # | Quán | x0–x1 | Rộng × sâu (m) | Loại | Thực đơn |
|---|---|---|---|---|---|
| S1 | 🧋 Trà sữa Regression | 291–301 | 10 × 8,4 | quán nước | 🧋 Trà sữa trân châu 25 – coffee 8; 🍵 Trà đào cam sả 20 – coffee 6 |
| S2 | 🍲 Lẩu Nướng Hotfix | 301–321 | 20 × 8,4 | nhà hàng bình dân (vào được, xem 5.4) | 🍲 Lẩu Thái hải sản 120 – energy 20; 🔥 Set nướng BBQ 140 – energy 22; 🍺 Nước mía 15 – energy 4 |
| S3 | 🎂 Tiệm bánh Release Day | 321–331 | 10 × 8,4 | tiệm | 🎂 Bánh kem mừng release 50 – coffee 10; 🥐 Croissant 20 – energy 5 |
| S4 | 🥤 Nước ép Sprint | 331–344 | 13 × 8,4 | quán nước | 🥤 Nước ép cam 20 – energy 6; 🍓 Sinh tố dâu 25 – energy 8 |

Bàn ngoài phố cho 3 quán nước (mỗi bàn 2 ghế, có dù, nhãn "Ngồi bàn ngoài phố (E · C)", cách nhau 3,2 m):
- Cà phê Bug Free: 3 bàn ở z = 103, x = 292; 295,2; 298,4 → 6 chỗ.
- Trà sữa Regression: 3 bàn ở z = 105, cùng x → 6 chỗ.
- Nước ép Sprint: 3 bàn ở z = 105, x = 333; 336,2; 339,4 → 6 chỗ.
Đồ khách bot gọi: Cà phê → cà phê sữa đá, cà phê dừa, bạc xỉu; Trà sữa → trà sữa trân châu, trà đào; Nước ép → nước ép cam, sinh tố dâu.

#### 5.3 Nhà hàng Sky Bug Fine Dining — `restaurant()` FS:104–129, theme FS:131

- **Vị trí và kích thước:** trong N3; phòng ăn x 311,4–330,6 (19,2 m) × z 92,9–99,75 (6,85 m); trần cao 3,6 m (tầng 2 bên trên đặc). Cửa giữa rộng 2,4 m tại x = 321 (mặt tiền z = 100), hai bên là kính 3,1 m; xà cửa vàng.
- **Bố trí và nội thất:** sàn gỗ nâu sẫm bóng; trần kem phát sáng nhẹ; tường trong có va chạm; **quầy** đen 6 × 1,1 × 0,8 + mặt vàng ở z ≈ 94,5, giữa quầy x = 321; **4 bàn ăn** (bàn gỗ tối 1,4 × 1,0 + khăn trải trắng, nến phát sáng) tại x = 313,8; 317,4; 324,6; 328,2, z ≈ 97,35, mỗi bàn 2 ghế đỏ rượu vang (đối diện) → 8 chỗ ngồi ("Ngồi bàn Sky Bug Fine Dining"); **3 đèn chùm** cầu pha lê ở x = 316,5; 321; 325,5, cao 2,9 m; **đàn piano** đen 1,6 × 1,0 × 1,4 ở x ≈ 328,6, z ≈ 96,3.
- **Chức năng:** nhà hàng sang, đi bộ vào được.
- **Nhân vật:** không có nhân viên; khách bot tối đa 3 người, ăn các món "bò Wagyu / tôm hùm nướng / vang đỏ"; vào theo lối (321, 102,2) → (321, 98,7) rồi ra theo lối ngược.
- **Tương tác:** E ở quầy (r 2,2, ở z ≈ 95,9) → thực đơn 3 món (bảng N3); ngồi bàn (E/C). Camera bị hạn chế trong phòng (không xuyên tường sang nhà bên).
- **Kết nối:** cửa mặt Nam (phố đi bộ); lối khác không có.

#### 5.4 Nhà hàng Lẩu Nướng Hotfix — `restaurant()` FS:132

- **Vị trí và kích thước:** trong S2; phòng ăn x 301,4–320,6 (19,2 m) × z 108,25–115,9 (7,65 m); trần cao 3,6 m (nâu sẫm). Cửa giữa rộng 2,4 m tại x = 311 (mặt tiền z = 108).
- **Bố trí và nội thất:** sàn gỗ nâu; quầy gỗ nâu 6 × 1,1 × 0,8 + mặt vàng ở z ≈ 114,3, x = 311; **4 bàn** gỗ (nâu sẫm) tại x = 303,8; 307,4; 314,6; 318,2, z ≈ 110,65, mỗi bàn 2 ghế gỗ nâu → 8 chỗ; giữa mỗi bàn có 1 trụ nhỏ đen kim loại (đóng vai bếp nướng; mã không dựng bếp thật); **8 đèn lồng** cam treo cao 3 m rải dọc phòng. Không có piano/đèn chùm.
- **Chức năng:** nhà hàng lẩu nướng.
- **Nhân vật:** không nhân viên; khách bot tối đa 3 người ("lẩu Thái / set nướng / nước mía").
- **Tương tác:** E ở quầy (r 2,2, ở z ≈ 112,9) → thực đơn 3 món (bảng S2); ngồi bàn.
- **Kết nối:** cửa mặt Bắc (phố đi bộ).

---

### 6. KHU CĂN HỘ SKY QC (`foodstreet.js`) — FS:134–176

#### 6.1 Toàn khu và quảng trường

- **Vị trí và kích thước:** pad APT x 428–472, z 68–100; nền 1,7. Hai toà đặt tại tâm (439, 84) và (461, 84). Quảng trường giữa 2 toà tại (450, 84): đài phun nước bệ đá Ø 6 (r 3–3,2) có mặt nước; va chạm r 3,2.
- **Chức năng:** khu ở cao cấp; chỉ phần sảnh và sân thượng đi vào được.
- **Kết nối:** trong các file được đọc không có đường riêng nối vào pad này; đường xoắn ốc chạy ở phía Nam (xấp xỉ z ≈ 125 tại x ≈ 437). Chưa rõ lối vào bộ (mã chỉ có dịch chuyển bằng bản đồ và thang máy).

#### 6.2 Toà A (x 431–447, z 76–92) và Toà B (x 453–469, z 76–92) — mỗi toà

- **Vị trí và kích thước:** chân toà 16 × 16 m; 20 tầng, mỗi tầng 3,2 m → cao 64 m (đỉnh ≈ 65,7); sảnh cao 4,6 m; thân kính trắng–xanh cửa sổ tối có vân; ban ngày hơi bóng, ban đêm đèn cửa sổ ngẫu nhiên ~45% tắt/sáng.
- **Bố trí:** **ban công** từ tầng 2 đến tầng 19: Bắc/Nam mỗi tầng một sàn 11,2 × 1,4 m (70% chiều rộng), Đông/Tây 1,4 × 8 m, lan can kính thấp 0,9 m (ngoại thất, không đi ra được — mã không có sàn đi lại; chỉ trang trí). Căn hộ bên trong từng tầng: **không có** (không dựng nội thất).
- **Sảnh kính:** tường kính cao 4,6 m 4 mặt; mặt Bắc (z = 76) có cửa rộng 2,6 m ở giữa; sàn đá sáng; **quầy lễ tân** 3,4 × 1,1 × 0,8 + mặt vàng ở (tâm x, z + 3); **2 sofa** xám xanh (2,4 × 0,45) ở x = tâm ± 4,5, z = tâm − 2, mỗi sofa 2 chỗ ngồi (nhãn "Ngồi sofa sảnh căn hộ (E · C)") → 4 chỗ; **bảng thang máy** inox 2,4 × 3 ở z ≈ tâm + 7,4.
- **Sân thượng (cao độ ≈ 65,9):** sàn 18,8 × 18,8 m (đá màu cát), lan can kính 1,1 m quanh, **hồ bơi tràn** 13 × 6 m (x tâm ± 6,5, z tâm + 1 → + 7), nước xanh phát sáng nhẹ (có va chạm chặn bước xuống), **5 ghế nằm** ở x = tâm − 5; − 2,5; 0; 2,5; 5, z ≈ tâm − 1,4 (nằm được: "Nằm ghế tắm nắng trên sân thượng (E · C)"), **cabin thang máy** 2,2 × 2,8 × 2,2 ở (tâm − 6, tâm − 6).
- **Chức năng:** sảnh tiếp tân + sân thượng hồ bơi ngắm toàn thành phố.
- **Nhân vật:** không có.
- **Tương tác:** E ở thang máy sảnh (r 1,8, tại (tâm x, tâm z + 6,8 − 0,4), khi ở dưới) → dịch chuyển lên sân thượng, toast "Tầng thượng · hồ bơi tràn ngắm toàn thành phố 🌇". E ở cabin sân thượng (r 1,8, tại (tâm − 6, tâm − 6)) → xuống sảnh (đặt ngoài cửa Bắc cách 3 m phía trước toà, "Đã xuống sảnh"). Ghế/sofa (E/C). Nhãn nổi "🏙️ Sky QC Residence · Căn hộ cao cấp · thang máy lên hồ bơi sân thượng" (nhìn thấy trong 160 m).
- **Kết nối:** cửa Bắc sảnh; thang máy dịch chuyển lên/xuống; bản đồ "Căn hộ Sky QC".

---

### 7. KHU BIỆT THỰ VEN ĐẦM (`riverside.js`)

#### 7.1 Cổng gác, hàng rào, nhân viên — RV:94–113

- **Vị trí và kích thước:** hàng rào ngang z = 205 từ x 276 đến 356 (chừa lối xe/người rộng ≈ 9,2 m ở x ≈ 281,4–290,6 quanh đường ven biển x = 286), rồi rào dọc x = 356 từ z 205 xuống bờ đầm (z ≈ 244). Rào trắng kem cao 1,6 + cột tối 1,9 m, cách 2,4 m. **Chốt chặn:** xà đỏ 8,6 m ở cao 1,05 m (xoay lên khi mở), tâm đặt từ x = 281,7; **chòi gác** 2,4 × 2,6 × 2,2 tại (292,2; 203,6).
- **Bố trí:** biển nổi "🚧 Cổng gác · Khu biệt thự Ven Đầm · Chỉ cư dân · tham quan cùng hướng dẫn viên" (60 m) ở (286, 204). Va chạm: rào có tin nhắn "chỉ cư dân…", chốt chặn có tin nhắn "gặp hướng dẫn viên".
- **Nhân vật (nếu `W.people` có):**
  - 👮 **Bảo vệ khu biệt thự** — nam, đồng phục xanh navy, mũ lưỡi trai, đứng tại (292,2; 201,8) quay mặt về Nam, idle; không có tương tác.
  - 👩‍💼 **Linh · Hướng dẫn viên** — nữ (tóc dài/bob/đuôi ngựa), váy trắng, giày đen; đứng tại (279,5; 202,8) quay về Nam, idle; chấm vàng trên bản đồ. Câu thoại tiêu biểu: "Chào anh/chị! Mình chở đi một vòng khu Biệt thự Ven Đầm nhé – 4 căn, mỗi căn mình dừng giới thiệu."; "Mời anh/chị xuống xe vào xem căn mẫu Gió Biển – cứ tự nhiên lên tầng 2 ngắm đầm nhé!"
- **Tương tác:** E ở Linh (r 2,4): nếu chưa mua → hộp thoại "Tham quan Khu Biệt thự Ven Đầm — Miễn phí!" nút "Lên xe"; nếu đã mua (cư dân) → nhãn "Chào cư dân! Xem lại bảng giá / tham quan".
- **Chức năng:** hạn chế người lạ; cổng mở khi: cư dân (đã mua), có lượt tham quan còn hiệu lực (15 phút sau khi bắt đầu tham quan), hoặc xe đại gia/xe tham quan đi qua (cách cổng < 16 m).
- **Kết nối:** đường ven biển x = 286 đi xuyên qua cổng.

#### 7.2 Tuyến tham quan có hướng dẫn viên — RV:115–152

- **Vị trí và kích thước:** xe sang trắng (kiểu 'lux', 2 tông màu) chạy theo làn phải: (284,2; 181) → (284,2; 217) → (290; 219,9) → (348; 219,9). Tốc độ tối đa 4,5 m/s, tăng tốc 1,5, phanh 3,0; dừng lần lượt trước 4 căn (x = 286, 302, 318, 334) mỗi lần 5,5 giây, camera đặt ở (x − 7; 8,3; 212) nhìn về căn (cao độ camera ≈ 8,3).
- **Tương tác:** nhấn "Lên xe" → người chơi ngồi vào xe (nhân vật ẩn, camera cách 9 m), toast giới thiệu; tại mỗi căn toast "Linh: Biệt thự … – N phòng ngủ, hồ bơi tràn, bến du thuyền riêng. Giá … 💰". Kết thúc: xuống xe ở căn Gió Biển (x ≈ 302), đặt trước cửa (302, 223,4), mở bảng giá (xem 7.4). Không giới hạn thời gian dừng, miễn phí.
- **Kết nối:** xe chạy trên đường ven biển và ngõ z = 218; chưa rõ cách hoà vào giao thông chung (dùng `TR.makePath`).

#### 7.3 Biệt thự (mẫu chung cho cả 4) — RV:23–88

Bốn lô giống nhau về cấu trúc, mỗi căn 13 × 11 m mặt bằng, khác tên/giá/số phòng:

| Lô | Tên | Tâm x | x0–x1 | z0–z1 | Phòng ngủ | Giá 💰 |
|---|---|---|---|---|---|---|
| 1 | Biệt thự Hoàng Hôn | 286 | 279,5–292,5 | 225,5–236,5 | 4 | 32.000 |
| 2 | Biệt thự Gió Biển | 302 | 295,5–308,5 | 225,5–236,5 | 3 | 28.000 |
| 3 | Biệt thự Mặt Trăng | 318 | 311,5–324,5 | 225,5–236,5 | 5 | 36.000 |
| 4 | Biệt thự Bình Minh | 334 | 327,5–340,5 | 225,5–236,5 | 4 | 30.000 |

Khoảng cách giữa các căn 3 m. Mỗi căn gồm các không gian sau (toạ độ tương đối: x0, x1, z0 (phía đường, Bắc), z1 (phía đầm, Nam), cx, cz = tâm; cao độ nền Y = 1,8):

**a) Tầng trệt (phòng khách + bếp + ăn)** — RV:27–35, 61–68
- **Vị trí và kích thước:** 13 × 11 m (≈ 143 m²), cao 3,6 m; sàn đá sáng. Tường 2 bên ốp gỗ (dày 0,3); mặt Bắc kính, cửa chính rộng 2,0 m ở giữa; mặt Nam kính với cửa kính trượt giữa rộng 2,2 m ra hồ bơi (lối ra không bị va chạm chặn).
- **Nội thất:** sofa chữ L xám xanh (3 chỗ ngồi: "Ngồi sofa phòng khách") ở góc (x0 + 2,6; z1 − 2,4), 3 gối kem, bàn trà gỗ phía trước; **bếp đảo** trắng 2,6 × 0,95 × 1,0 mặt đá tối ở (cx − 0,2; z0 + 2,6); **bàn ăn** gỗ 2,2 × 1,1 (chưa dựng ghế, không có chỗ ngồi) ở (cx + 0,6; cz + 0,6); 2 chậu cây ở 2 góc chéo; 2 đèn trần ấm ở x = cx ± 3.
- **Chức năng:** sinh hoạt chung.
- **Nhân vật:** không.
- **Tương tác:** ghế sofa (E/C).
- **Kết nối:** cửa chính hướng Bắc ra ngõ; cửa kính trượt Nam ra sân sau; cầu thang bên Đông lên tầng 2.

**b) Cầu thang lên tầng 2** — RV:48–59
- **Vị trí và kích thước:** thẳng dọc tường Đông tại x = x1 − 1,0, rộng 1,3 m, 15 bậc cao 0,24 m, sâu 0,32 m; bắt đầu z0 + 1,2 chạy về Nam đến z0 + 6,0; lên cao độ 5,4 (sàn tầng 2 = Y + 3,6 + 0,12).
- **Bố trí:** bậc bê tông + khối đặc dưới bậc, tay vịn vàng bên trái; gầm thang chặn không chui từ bên hông; sàn tầng 2 chừa lỗ thang (lan can mép lỗ).
- **Kết nối:** trệt ↔ tầng 2.

**c) Tầng 2 (phòng ngủ + ban công)** — RV:36–47, 69–71
- **Vị trí và kích thước:** sàn bê tông dày 0,35 ở cao độ 5,4, rộng 13,6 × 13,4 m: mở rộng thêm 2,2 m về phía đầm (z đến 238,7); cao 3,6 m; mái bê tông (13,4+ × 14,4) nhô ra, cao 3,6 phía trên.
- **Nội thất:** giường đôi trắng 2,0 × 2,3 + đầu giường gỗ ở (cx − 1,5; cz + 1,2), nằm được ("Nằm giường ngắm đầm"); 2 đèn trần.
- **Ban công:** phía Nam, lan can kính 1,05 m + va chạm; tường kính Nam; hai bên tường gỗ.
- **Chức năng:** phòng ngủ, ngắm đầm.
- **Nhân vật:** không. **Tương tác:** nằm giường (E/C).
- **Kết nối:** cầu thang bên Đông.

**d) Sân sau – hồ bơi – bến** — RV:75–84
- **Vị trí và kích thước:** sàn gỗ deck rộng 13,4 từ sau nhà đến z = z1 + 6 = 242,5 (ước tính cho cả 4 căn: z 236,5–242,5). **Hồ bơi tràn** 10,5 × 3,2 m (lệch về Tây 0,4 m so với tâm) ở z ≈ 239,3–242,5, có va chạm "Hồ bơi riêng của biệt thự". **2 ghế nằm** trắng cạnh hồ ở x = cx − 3,5 và cx − 1,5, z = z1 + 1,0 ("Nằm ghế cạnh hồ bơi").
- **Bến gỗ:** rộng 1,6 m, dài 4 m (z ≈ 243–247), ở x = cx + 5,1, có cọc đỡ; **ca nô** (xuồng bán trụ trắng/xám/đen, đổi theo căn) neo ở (x = bến + 1,6; z ≈ 244,8) nhấp nhô theo sóng.
- **Ghi chú:** bãi phẳng của pad chỉ san đến z = 238,5 (H:64), trong khi hồ bơi/bến ở z > 238,5 — vùng gần bờ đầm (đầm bắt đầu z ≈ 241); chưa rõ cách địa hình xử lý chồng lấn.
- **Chức năng:** thư giãn, bến thuyền riêng.
- **Nhân vật:** không. **Tương tác:** ghế nằm (E/C).

**e) Cổng trước + biển** — RV:85–87
- 2 trụ bê tông 0,4 × 1,6 m ở x = cx ± 1,6, z = z0 − 1,6, mỗi trụ có đèn cầu sáng + glow; nhãn nổi "🏡 Tên căn · N phòng ngủ · hồ bơi tràn · bến riêng · giá 💰" (60 m) ở cao ≈ 9,0 m trên nhà. Điểm cửa `v.door` = (cx; z0 − 0,9).
- **Nội thất chỉ hiện khi người chơi ở gần** (cách (318,231) < 80 m, RV:155).

#### 7.4 Mua biệt thự và bảng giá — RV:129–133, 157

- **Tương tác:** sau chuyến tham quan hiện bảng 4 thẻ (tên, "N phòng ngủ · 13 × 11 m · hồ bơi · bến riêng", giá, nút "Mua"). Bấm "Mua" → xác nhận trả tiền → trừ tiền → lưu `S.villa = chỉ số` → cổng luôn mở, toast chúc mừng "Bạn là chủ …". Mã chỉ lưu một căn (`S.villa` duy nhất), không hoàn tiền nếu mua căn khác.
- **Phần thưởng:** quyền vào cổng vĩnh viễn, điểm dịch chuyển "Biệt thự của bạn".

---

### 8. Phụ lục: tóm tắt thuật toán dựng đường/va chạm

- Đường (MAIN/COAST) sinh mẫu 1 m/điểm ở đoạn thẳng; đoạn xoắn ốc 1 điểm/đoạn (≈ 0,6 m).
- `nearRoad(x, z, maxD)` tra điểm đường gần nhất qua lưới ô 8 m; dùng cho địa hình, đặt nhà, đặt cây.
- Va chạm Phố Núi dùng `W.addSeg` (đoạn thẳng xoay tự do có giới hạn độ cao y0–y1) để tường xiên theo hướng đường.

---

### 9. BẢNG TÓM TẮT

Ký hiệu: "—" không áp dụng; "chưa rõ" không xác định được từ mã (cần chạy game). Cột rộng × sâu theo ô (m).

| Không gian | x0–x1 | z0–z1 | rộng×sâu | tầng | chức năng |
|---|---|---|---|---|---|
| Vùng Đồi Brand QC (HZ) | 276–476 | 66–274 | 200×208 | — | địa hình tổng thể, cao 32 m tại (392,170) |
| Cầu Phường → đồi | 262–278,5 | 80,5–91,5 | 16,5×11 | — | lối vào duy nhất từ Phường |
| Đường vào + xoắn ốc (MAIN) | 262→≈392 (xoắn quanh (392,170)) | 86→≈161 | rộng 8 m, dài ≈ 270–300 m | — | trục lên đỉnh, dốc ≈ 11% |
| Đường ven biển + ngõ (COAST) | 286 (rồi 286–352) | 91–218 | rộng 7 m, dài ≈ 193 m | — | trục Tây khu, tới biệt thự |
| Cầu thang lớn | ≈ 351,2→378,9 | ≈ 109,4→150,5 | rộng 7, dài ≈ 49,6, cao 30,3 | — | lối bộ từ phố ẩm thực lên tháp |
| Sân đỉnh đồi | 368–416 (r 24,4) | 146–194 | Ø 48,8 | — | quảng trường trước tháp, cao 32 |
| Tháp Brand QC (vỏ) | 379–405 (r 13) | 157–183 | Ø 26, cao 19,5 + sân thượng | 3 + sân thượng | toà biểu tượng đi bộ thẳng vào |
| Tháp · Trệt (Sảnh Tinh Hoa) | r ≤ 12,95 quanh (392,170) | | Ø 25,9 | trệt (y 32) | 7 nguyên tắc + lỗi nổi tiếng + tủ trưng bày |
| Tháp · Cầu thang xoắn | r 1,35–5,0 quanh tâm | | rộng 3,65 m, 78 bậc | 32→51,5 | đường lên các tầng |
| Tháp · Lầu 1 | r 5,2–13,35 | | vành 8 m | lầu 1 (y 38,5) | kỹ thuật & công cụ, 3 kiosk đố vui |
| Tháp · Lầu 2 | r 5,2–13,35 | | vành 8 m | lầu 2 (y 45) | đại sảnh huyền thoại |
| Tháp · Phòng bí ẩn | quạt ENT+180° ± 31,5° | | ≈ 10,5×6,6, cao 6 | lầu 2 | phòng để dành |
| Tháp · Sân thượng | r ≤ 13,35 | | Ø 26,7 | y 51,5 | ống nhòm, ghế, LED, chữ QC trên cao |
| Phố Núi · nhà sàn (×13, điển hình) | rải dọc xoắn ốc (chưa rõ) | chưa rõ | 11 dọc đường × 8,85 sâu | nhiều bậc theo dốc (chưa rõ) | quán sân thượng bám vách (10 quán) |
| Phố Núi · tháp cầu trời (×3, tối đa 4) | rải dọc xoắn ốc (chưa rõ) | chưa rõ | thân 12×12, cầu 3,6×7,65 | nóc cao hơn cầu 6,6–13 m | quán bar sân thượng (4 bar) |
| Phố Núi · tháp sườn đồi (≈ 7, tối đa 16) | rải ngẫu nhiên (chưa rõ) | chưa rõ | 9–14 × 9–14 | cao 14–26,8 m | phông nền, không vào được |
| Showroom QC Auto (vỏ) | 291–335 | 122–150 | 44×28 | 2 (cao 9 m) | cửa hiệu xe, cửa Tây (x≈289,6; z=136) |
| Phố ẩm thực (tổng) | 290–352 | 92,4–116,4 | 62×24 | 2 | phố đi bộ ăn uống |
| · Cà phê Bug Free | 291–301 | 92,4–100 | 10×7,6 | 2 | quán nước |
| · Bánh mì Test Case | 301–311 | 92,4–100 | 10×7,6 | 2 | tiệm bánh mì |
| · Sky Bug Fine Dining | 311–331 | 92,4–100 (phòng 92,9–99,75) | 20×7,6 | 2 | nhà hàng sang, 8 chỗ, piano |
| · Kem Smoke Test | 331–341 | 92,4–100 | 10×7,6 | 2 | tiệm kem |
| · Sushi Unit Test | 341–351 | 92,4–100 | 10×7,6 | 2 | tiệm sushi/ramen |
| · Trà sữa Regression | 291–301 | 108–116,4 | 10×8,4 | 2 | quán nước |
| · Lẩu Nướng Hotfix | 301–321 | 108–116,4 (phòng 108,25–115,9) | 20×8,4 | 2 | nhà hàng lẩu nướng, 8 chỗ |
| · Tiệm bánh Release Day | 321–331 | 108–116,4 | 10×8,4 | 2 | tiệm bánh |
| · Nước ép Sprint | 331–344 | 108–116,4 | 13×8,4 | 2 | quán nước ép |
| · Phố đi bộ + cổng + đài phun | 289,5–352 | 100–108 | 62×8 | — | trục đi bộ, đài phun (321,104) |
| Căn hộ Sky QC · Toà A | 431–447 | 76–92 | 16×16 | 20 (cao 64 m) | sảnh + sân thượng hồ bơi |
| Căn hộ Sky QC · Toà B | 453–469 | 76–92 | 16×16 | 20 (cao 64 m) | sảnh + sân thượng hồ bơi |
| Quảng trường căn hộ | ≈ 446,8–453,2 | ≈ 80,8–87,2 | Ø 6,4 | — | đài phun giữa 2 toà |
| Cổng gác + rào | 270–356 | 204,8–205,2 (rào), 205–254 (rào Đông) | 86 dài | — | chặn người lạ |
| Biệt thự Hoàng Hôn | 279,5–292,5 | 225,5–236,5 | 13×11 | 2 | 4 phòng ngủ, 32.000 💰 |
| Biệt thự Gió Biển | 295,5–308,5 | 225,5–236,5 | 13×11 | 2 | 3 phòng ngủ, 28.000 💰, căn mẫu |
| Biệt thự Mặt Trăng | 311,5–324,5 | 225,5–236,5 | 13×11 | 2 | 5 phòng ngủ, 36.000 💰 |
| Biệt thự Bình Minh | 327,5–340,5 | 225,5–236,5 | 13×11 | 2 | 4 phòng ngủ, 30.000 💰 |

**Số không gian đã mô tả:** 40 (địa hình, cầu, 2 đường, thang lớn, sân đỉnh, 8 không gian của tháp gồm vỏ/trệt/thang xoắn/lầu 1/lầu 2/phòng bí ẩn/sân thượng/biểu tượng, 4 mục Phố Núi gồm thuật toán + 3 loại nhà, showroom, phố ẩm thực + 9 quán + 2 nhà hàng chi tiết + phố đi bộ, căn hộ 2 toà + quảng trường, cổng gác, 4 biệt thự cùng các phòng a–e).

---

<a id="phần-5"></a>

## 05. Khu Giải trí · Cao nguyên · Đảo Wonderland · Công viên Kỳ Quan · Biển sống động

Tài liệu hiện trạng kiến trúc, đọc từ mã nguồn (không chạy game). Phạm vi các file: `js/arena.js`, `js/highland.js`, `js/funisland.js`, `js/themepark.js`, `js/themerides.js`, `js/themeland2.js`, `js/coastertrack.js`, `js/sealife.js`.

### 0. Quy ước và cách đọc

- 1 ô = 1 m = 1 đơn vị toạ độ thế giới. Trục x Đông (+) – Tây (−), trục z Nam (+) – Bắc (−), y là độ cao. (Mã chú thích `z=−` là phía Bắc, ví dụ Cao nguyên ở z âm, đảo Wonderland và Công viên Kỳ Quan ở z dương.)
- "Chưa rõ" = giá trị phụ thuộc file ngoài phạm vi (ví dụ `CITY.arena`, `CITY.downtown`, `edgeR`, `W.addSeat`) hoặc mã không nói.
- "Ước tính" = số do người viết tài liệu tính lại từ công thức trong mã (không phải hằng số trong mã). Các số này được ghi rõ để Bình biết là suy ra.
- Giá tiền tính bằng 💰 (xu). Phím E = tương tác ở điểm `INTER`. Phím C = ngồi/đứng dậy (do `W.addSeat`/`W.addBench`, logic nằm ngoài phạm vi). Phím B = góc máy truyền hình (chỉ ở sân bóng). Phím F = nhảy ở concert (chỉ có trong chuỗi thông báo; mã xử lý phím F nằm ngoài các file này). Phím Q = đổi góc nhìn thứ nhất/thứ ba trên tàu lượn (xử lý ngoài phạm vi).
- Mỗi không gian ghi: vị trí, bố trí, chức năng, trò chơi, nhân vật, tương tác, kết nối. Phần "Bảng tóm tắt" ở cuối file.

#### 0.1. Bản đồ tổng quát (theo toạ độ trong mã)

| Khu | File | Vị trí thế giới |
|---|---|---|
| Khu Giải trí QC Fun Park | arena.js | Phía Đông Downtown, qua cầu theo trục z = 0. Sân bóng tâm (334, −33); sân khấu concert tâm (388, 33); rạp phim x 279–315 · z 10–34; phố ẩm thực z = 46; vòng quay (331, 40). Biên khu = `CITY.arena` (chưa rõ). |
| Cao nguyên Bình Phan | highland.js | Phía Bắc Downtown. Lưới địa hình x 88–332 · z −342…−100. Phố cổ x 150–256 · z −182…−108. Thác Móng Ngựa tâm (216, −266). |
| Đảo QC Wonderland | funisland.js | Ngoài khơi phía Nam. Lưới địa hình x −10…132 · z 222…362, tâm đảo (61, 291). |
| Công viên Kỳ Quan | themepark.js (+ themerides, themeland2, coastertrack) | Phía Nam Đảo Wonderland. Lưới địa hình x −270…363 · z 372…1242. Cổ chai (cổng, Đại lộ Ánh Sao) x −40…116 · z 384…520; thân công viên x −256…348 · z 500…1230. |
| Biển sống động | sealife.js | Du thuyền: vịnh phía Bắc đảo chính (đoạn đường z −136…−50). Lướt ván: bờ Đông-Nam đảo chính. Mô tô nước: vịnh phía Nam, tâm (106, 52). Dù bay: ngoài khơi phía Nam, tâm (−60, 190). |

Chuỗi di chuyển giữa các khu: Downtown → (cầu x = 178 hướng Bắc) → Cao nguyên; Downtown → (cầu z = 0 hướng Đông) → Khu Giải trí; đảo chính (Master Dashboard) → cáp treo → đảo Wonderland → cầu đá (40, 337→395,5) → Công viên Kỳ Quan.

#### 0.2. Cơ chế dùng chung

- **Vé có thời hạn (arena.js):** `S.fun.tickets[k]` lưu mốc hết hạn. Vé sân bóng 30 phút, concert 30 phút, rạp phim 20 phút. Mua vé xong cổng (hộp va chạm) bị gỡ khỏi danh sách `boxes`; đang ở bên trong thì cổng luôn mở để khỏi bị nhốt khi hết vé.
- **Buff đồ ăn (arena.js):** hai loại, `energy` = nhanh hơn 40 %, `coffee` = thưởng quiz +20 %, cộng dồn thời gian; lưu trong `S.buffs`.
- **Hộp va chạm:** `boxes` (hộp chữ nhật, có thể có y0/y1), `circles` (cột tròn), `addPlat` (sàn đứng được ở cao độ khác mặt đất), `addSeg` (đoạn rào có thông báo khi chạm).
- **Mức chi tiết theo khoảng cách (themepark.js):** 4 nhóm hiển thị: `gLand` (ray, trụ, vòng quay, tháp, cổng; < 1050 m), `gFar` (lối lát, nhà, cầu, ga; < 560 m), `gMid` (tán lá, đoàn tàu, kính cabin; < 520 m), `gNear` (rào, ghế, đèn, quầy; < 430 m).
- **Luồng lên trò chơi ở Công viên Kỳ Quan (themerides.js):** cổng tên trò → quầy vé + cổng soát vé (E trả tiền, thanh chắn mở khi đứng trong vùng cổng) → hàng rào xếp hàng zíc-zắc 3 làn × 12 m có mái → sân ga → tàu vào ga, bấm E thì nhân vật TỰ ĐI BỘ lên ghế (tốc độ 2,3 m/s), bước vào ghế 0,6 s, đai an toàn hạ khoảng 1,1–1,5 s → chạy → về ga, đai mở 0,8 s, bước xuống → ra theo "LỐI RA" một chiều. Không dịch chuyển tức thời. Vé dùng một lần (`tix[id]` reset sau khi xuống).
- **Góc nhìn:** mặc định camera đuổi theo toa; Q chuyển góc nhìn thứ nhất bám khung toa (lộn vòng thật, FOV 66–82° theo tốc độ, rung khi có sự kiện).
- **Âm thanh:** tất cả tự tạo bằng WebAudio (không file âm thanh): nhạc concert 124 BPM, tiếng thác, gió tàu lượn, chuông mua vé, tiếng sấm, tiếng gầm, v.v. Chỉ bật sau khi người chơi đã tương tác với trang.

---

## PHẦN A. KHU GIẢI TRÍ "QC FUN PARK" (`js/arena.js`)

### 1. Nền Khu Giải trí, lan can, đại lộ z = 0
- **Tên + nguồn:** Nền khu, lan can, đại lộ — `arena.js:39–76`.
- **Vị trí và kích thước:** x AX0…AX1, z AZ0…AZ1 lấy từ `CITY.arena` (chưa rõ giá trị số, định nghĩa ngoài phạm vi). Nền là một khối dày 8 m (mặt trên y ≈ 0,02), rộng hơn khu 4 m mỗi chiều; mặt lát đá xám nhạt ô 8 m. Từ mã suy ra khu phải bao tối thiểu x 279…~395 và z −59…~58 (tường sân bóng z0 = −59; bàn ăn z ≈ 53,5).
- **Bố trí và nội thất:**
  - Lan can mép cao 1,0 m (thanh kim loại + cột mỗi 4 m) bốn phía, chừa lối cầu ở bờ Tây (đoạn z −6…6).
  - Đại lộ nhựa z = 0, rộng 10 m (z −5…5), chạy suốt chiều ngang khu, vạch trắng hai mép + vạch vàng đứt giữa, cao độ 0,035.
  - Cột đèn đường: phía z = −6,2 cứ 16 m một cột (bắt đầu AX0+8), phía z = +6,2 so le 8 m.
  - Cọ: từ x AX0+4 đến AX0+30 mỗi 7 m, hai bên đường ở z = −9 và z = +9 (cao 1,0–1,25 lần).
- **Chức năng:** nền trung tâm, đường chính đi tới mọi hạng mục.
- **Trò chơi / Nhân vật:** không có.
- **Tương tác:** không có. Đi bộ tự do.
- **Kết nối:** cầu bờ Tây (không gian 2). Taxi: thêm nút ở (AX0, 0), (334, 0), (AX1−4, 0) nối với nút gần bờ Đông Downtown nhất; thêm 6 điểm đến taxi (Khu Giải trí tại (AX0+8, 0), Sân bóng (334, −8), concert (356, 33), rạp (297, 7), phố ẩm thực (294, 42), vòng quay (331, 45)). Mục "Địa điểm" (`PLACES`) có 6 điểm dịch chuyển (xem từng không gian).

### 2. Cầu Downtown → Khu Giải trí
- **Nguồn:** `arena.js:50–59`.
- **Vị trí và kích thước:** từ x = `CITY.downtown.x1` đến x = AX0, dọc trục z = 0; rộng 10 m (z −5…5); dài = AX0 − downtown.x1 (chưa rõ, hai giá trị ngoài phạm vi). Mặt cầu dày 0,4 m ở y −0,05; mặt nhựa rộng 7 m ở y 0,16.
- **Bố trí:** hai bên lan can bạc cao 1,05 m tại z = ±4,9, cột mỗi 2 m. Sàn đứng được `addPlat` cao 0,15; hộp chặn hai mép tại z ±4,85…5,2. Mã tự cắt lan can bờ Đông Downtown một đoạn z −5,5…5,5 để thông cầu.
- **Chức năng:** nối hai khu.
- **Kết nối:** Downtown (bờ Đông) ↔ cổng chào Khu Giải trí.

### 3. Cổng chào QC FUN PARK
- **Nguồn:** `arena.js:67–76`.
- **Vị trí và kích thước:** tâm (AX0+4, 0). Hai trụ tròn đường kính ≈ 1,0–1,2 m, cao 9 m tại z = ±7,2 (hở giữa 14,4 m); xà ngang 1 × 1,8 × 15,4 ở y 8,2.
- **Bố trí:** mỗi trụ có quả cầu vàng ở đỉnh (y 9,3). Hai mặt xà có bảng 15 × 1,6 m ghi "🎡 QC FUN PARK · KHU GIẢI TRÍ" nền gradient hồng–vàng–xanh ngọc, phát sáng mạnh hơn ban đêm.
- **Chức năng:** biển hiệu lối vào khu.
- **Tương tác:** không.

### 4. Sân bóng QC Arena
Gồm nhiều phần; ghi từng phần.

#### 4.1. Sân cỏ, khung thành, tường ngoài
- **Nguồn:** `arena.js:78–125`.
- **Vị trí và kích thước:** tâm SC = (334, −33). Sân cỏ 44 × 28 (x 312…356, z −47…−19), mặt y = 0,05; nền cỏ tối 56 × 38 ở y 0,015. Khung thành rộng 5,2 m, cao 2,0 m, tại x = 312 và x = 356 (giữa z = −33), có lưới sàn sâu 1,6 m. Tường ngoài xanh dương cao 3,2 m, dày 0,4: x 300…368, z −59…−10 (68 × 49).
- **Bố trí:** sân kẻ vạch trắng: vòng tròn giữa, vòng phạt hai đầu; cỏ sọc 12 dải. Cổng Nam ở giữa tường nam (z = −10): rộng 5,2 m (x 331,4…336,6); trên có xà vàng 6,4 × 1,2 cao tới y ≈ 4,4 và hai trụ vàng.
- **Chức năng:** nơi diễn ra trận QC FC vs Bug United.
- **Tương tác / Kết nối:** cổng Nam chỉ mở khi có vé (xem 4.5). Đường dẫn: từ đại lộ z = 0 đi lên phía Bắc (z âm) tới cổng tại (334, −10).

#### 4.2. Khán đài
- **Nguồn:** `arena.js:93–108`.
- **Vị trí và kích thước (7 bậc, mỗi bậc rộng 0,85 m, cao thêm 0,45 m/bậc, bậc cao nhất 3,15 m; có sàn đứng bậc 0,45 m leo được từ phía sân):**
  - Bắc: x 307…361 (54 m), z từ −51 tới −56,95.
  - Tây: x từ 308 tới 302,05, z −50…−16 (34 m).
  - Đông: x từ 360 tới 365,95, z −50…−16.
  - Nam: chỉ 3 bậc, hai nửa (x 307…330 và x 338…361), z từ −15 tới −12,45; chừa lối giữa rộng 8 m (x 330…338) cho đường vào từ cổng.
- **Bố trí:** mỗi bậc có mặt trên sơn màu xen kẽ xanh ngọc – trắng – hồng – vàng. Lưng và hai đầu khán đài có hộp chặn cao hơn mặt bậc để người chơi không chui vào khối bậc.
- **Nhân vật (khán giả):** khoảng 700 cổ động viên (một lượt vẽ `InstancedMesh`, tô màu xanh ngọc/trắng/đỏ/vàng/xanh dương/đen), xác suất ngồi 82 % mỗi chỗ; nhún nhảy theo shader, khi ghi bàn cả sân nhảy cao hơn trong ~3 giây. Khán giả không có tên/thoại.
- **Chức năng:** chỗ ngồi xem bóng.

#### 4.3. Mái che khán đài Bắc, cột đèn pha, bảng tỉ số
- **Nguồn:** `arena.js:109–138`.
- **Mái Bắc:** tấm 58 × 0,25 × 9 nghiêng nhẹ ở y 10,6, tâm z ≈ −55; 7 cột bạc cao 10,4 m cách nhau 9,2 m, tại z ≈ −59 (x = 334 −28 … +27,2).
- **Đèn pha:** 4 cột bạc cao 22 m tại (303, −55,5), (365, −55,5), (303, −10,5), (365, −10,5); đầu đèn phát sáng mạnh ban đêm; có quầng sáng. Sân cỏ phát sáng nhẹ ban đêm.
- **Bảng tỉ số:** khung 0,6 × 5,4 × 9,4 m ở x ≈ 365,5, z = −33, tâm y 11,5, hai chân cao 9 m tại z = −36,5 và −29,5; màn 8,8 × 4,4 m quay vào sân. Hiển thị tên 2 đội, tỉ số, phút trận hoặc "NGHỈ GIỮA HIỆP"/"HẾT GIỜ".

#### 4.4. Trận bóng (trò chơi nền, miễn phí xem)
- **Trò chơi:** 2 đội × 5 cầu thủ (1 thủ môn, 2 hậu vệ, 2 tiền đạo). Đội 0 "QC FC" (áo xanh ngọc, quần trắng) chống khung thành phía Tây, ghi vào khung thành Đông; đội 1 "Bug United" (áo đỏ hồng, quần xanh đen). Thủ môn áo vàng (đội 1 áo xanh dương nhạt). Sơ đồ ban đầu (đội 0): thủ môn cách tâm 19 m, 2 hậu vệ cách 12 m (z ±6), 2 tiền đạo cách 5 m (z ±4); đội 1 đối xứng.
- **Thông số trận:** 1 "phút" trận = 3,6 s thật; hiệp 1 từ 0 → 45 phút (162 s), nghỉ 8 s, hiệp 2 đến 90 phút (tổng ≈ 324 s chơi), sau trận nghỉ 14 s rồi reset tỉ số về 0-0 và đá lại. Sau mỗi bàn nghỉ 4 s rồi giao bóng lại (đội giao bóng luân phiên theo tổng số bàn). Tốc độ cầu thủ 3,2 m/s đi, 4,4 m/s mang bóng, 4,8 m/s đuổi bóng; thủ môn 4 m/s. Sút khi cách khung thành < 15 m (vận tốc bóng 15–20 m/s), chuyền khi có đối thủ cách < 2,4 m, thủ môn cản 50 % khi bóng bay về phía mình và cách < 2,6 m.
- **Nhân vật:** 10 cầu thủ bot, tên dạng "QC FC · Thủ môn", "QC FC · Số 5…9", "Bug United · Thủ môn", "Bug United · Số 5…9"; 1 trọng tài "Trọng tài" (áo đen) đứng sát mép Nam sân (z = −22, cách vạch biên Nam 3 m), đi theo bóng dọc trục x với tốc độ ≤ 3 m/s.
- **Thoại tiêu biểu (thông báo trên màn hình khi người chơi đứng gần ≤ 70–80 m):** "⚽ VÀOOO! … ghi bàn – x-y", "🧤 Thủ môn cản phá xuất sắc!", "🏁 Hết trận: QC FC x - y Bug United".

#### 4.5. Quầy vé + cổng sân bóng
- **Nguồn:** `arena.js:125, 226–229`.
- **Vị trí:** điểm tương tác tại (334, −7,8), bán kính 3,2 m (trước cổng, ngoài tường).
- **Tương tác:** bấm E: nếu chưa có vé hiện hộp xác nhận mua "Vé xem bóng đá QC FC vs Bug United" 20 💰 / 30 phút (ra vào tự do); mua xong cổng mở. Nếu đã có vé: hướng dẫn "Đi qua cổng vào sân, lại gần hàng ghế đầu khán đài Nam bấm C để ngồi – bấm B để xem góc máy truyền hình."
- **Kết nối:** cổng Nam (x 331,4…336,6, z −10).

#### 4.6. Ghế khán đài Nam + góc máy truyền hình
- **Nguồn:** `arena.js:230–233, 491–492`.
- **Vị trí:** 14 ghế ngồi tại bậc đầu khán đài Nam, z ≈ −14,58, y 0,51, quay mặt hướng Bắc (rot = π): 7 ghế ở x 328…321,4 (cách nhau 1,1 m) và 7 ghế x 340…346,6.
- **Tương tác:** E hoặc C để ngồi. Khi đang ngồi, phím B bật/tắt góc máy truyền hình: camera ở độ cao 13 m, z ≈ 0 (phía sau khán đài Nam), x bám theo bóng (giới hạn 328…340), nhìn vào bóng. Đứng dậy sẽ tự tắt.

### 5. Sân khấu QC Live Arena (concert)
- **Nguồn:** `arena.js:235–320`.
- **Vị trí và kích thước:** tâm sân khấu CS = (388, 33), mặt quay về phía Tây (−x). Sàn sân khấu 9 × 1,4 × 24 (x 383,5…392,5, z 21…45), có hộp chặn nên không trèo lên được. Giàn đèn: 4 trụ cao ~11 m tại x 384 / 392, z 21 / 45, xà ngang ở y 12,2. Màn LED 16 × 6,2 m tại x ≈ 391,4, tâm y 5,4, hướng Tây; 2 màn phụ 4,6 × 5,6 m tại x ≈ 389,2, z = 33 ± 12,4; 2 tháp loa 2,2 × 5,5 × 2,4 tại x ≈ 385,4, z = 33 ± 14,4; bàn DJ 1,6 × 1,1 × 2,6 tại (389,2, 33).
- **Khu sát sân khấu (VIP/pit):** x 359…383, z 15…53 (24 × 38). Rào bạc cao 1,1 m bao ba mặt (Bắc, Nam, Tây); cổng ở mặt Tây rộng 4 m (z 31…35, x = 359). Khán giả đứng phía ngoài rào, thêm trong khoảng x 345…357.
- **Bố trí hiệu ứng:** 8 đèn quét hình nón cộng màu tại (384,4; 12; 22,5 + 3·i), 6 tia laser dài 60 m tại (385; 9,5; 27 + 2,4·i), đèn giàn sân khấu phát sáng ban đêm (quầng sáng ở 8 điểm). Màn LED vẽ thanh phổ nhạc đổi màu và chữ "QC LIVE ARENA / 🎤 Bình Vip Pro · DJ Anh trai say Salary"; khi nghỉ hiển thị đếm ngược "Màn diễn tiếp theo sau m:ss".
- **Chức năng:** buổi hoà nhạc lặp tự động.
- **Trò chơi / lịch diễn:** diễn 180 s (3 phút), nghỉ 60 s (1 phút), lặp vô hạn; nhạc tự tạo bằng WebAudio, 124 BPM, trống + bass + hợp âm + giai điệu; âm lượng tối đa 0,5 và giảm theo khoảng cách (10 m ≈ 0,5, 25 m ≈ 0,25, 50 m ≈ 0,06, > 100 m tắt), càng xa càng đục; không phát khi đang mở nhạc YouTube hoặc đang ở trong nhà.
- **Nhân vật:** 
  - Ca sĩ "Ca sĩ · Bình Vip Pro" áo vàng, tóc dài, đứng ở (385, 1,42, 33), khi diễn đi qua lại dọc z ±4 m.
  - DJ "DJ · Anh trai say Salary" áo đen, mũ lưỡi trai, ở (390,2, 1,42, 33), nhún theo nhịp.
  - Khán giả: khoảng 350 người đứng nhún nhảy theo nhịp (khi diễn nhảy mạnh hơn).
  - Thoại: thông báo "🎤 Màn diễn bắt đầu! Bấm F để nhảy cùng khán giả." (khi người chơi cách ≤ 70 m).
- **Tương tác:** quầy vé tại (357,5; 33), bán kính 3 m: E hiện hộp "Vé concert QC LIVE ARENA – khu sát sân khấu" 30 💰 / 30 phút; mua xong cổng pit mở; có vé thì E chỉ nhắc "Vào thẳng khu sát sân khấu, nhảy cùng mọi người (phím F)!".
- **Kết nối:** đại lộ z = 0 → đi lên phía Nam (z dương) tới (357, 33). Dịch chuyển: "QC Live Arena" tới (355, 33), nhìn về sân khấu.

### 6. Rạp QC Cinema
- **Nguồn:** `arena.js:322–404`.
- **Vị trí và kích thước:** x 279…315 (36 m), z 10…34 (24 m), cao 9,5 m (viền mái đỏ nâng tới ~10,3; mái xám y ≈ 10,25). Tường trắng kem dày 0,4. Cửa duy nhất ở mặt Nam (z = 10) tại x 295…299 (rộng 4 m, trên cửa tường tiếp tục từ y 3,2 lên).
- **Bố trí bên ngoài:** mái hiên đỏ 37,2 × 0,6 × 2,4 ở y 3,6 trước cửa; 4 gờ đứng đỏ ở x = 283, 288, 306, 311; bảng neon "🎬 QC CINEMA" 14 × 2,2 m ở y 6,6 trên cửa; 3 poster 2 × 3 m ở y 1,9 ("CUỘC SĂN BUG" x ≈ 283; "TEST CASE WARS" x ≈ 300; "AUTOMATION RISING" x ≈ 301 – hai poster sau cách nhau chỉ ~1 m nên chồng lên nhau, theo đúng mã).
- **Bố trí bên trong (chỉ vẽ khi người chơi ở trong):** sàn đỏ sẫm; lót tường/trần tối; 5 hàng ghế bậc thang tại z = 14, 16,2, 18,4, 20,6, 22,8 (mỗi hàng sâu 2,2 m, rộng 30 m), cao bậc 1,4 / 1,05 / 0,7 / 0,35 / 0 m (hàng cuối sát sàn); mỗi hàng 10 ghế đỏ (x 285,75…308,25 cách 2,5 m); đèn tường vàng cam mỗi 4 m; bục thấp 32 × 0,3 × 1,4 m sát tường sau (z ≈ 31,8). Màn chiếu 24 × 10 m ở tường Bắc (z ≈ 33,65), tâm y 5,6; đèn xanh nhạt trong rạp bật khi vào.
- **Ghế ngồi xem:** 12 ghế (hàng 2, 3, 4; mỗi hàng 4 ghế giữa: x 293,25 / 295,75 / 298,25 / 300,75), tag "cinema".
- **Chức năng:** chiếu phim hoạt hình.
- **Trò chơi / nội dung phim "Cuộc săn Bug" (vẽ bằng canvas, lặp 63 s):** 7 cảnh × 9 giây: "Thứ Hai, 8 giờ sáng…" → "Bản build 2.0 vừa về!" (Dev hứa: "Lần này chắc chắn không còn bug.") → "Nhưng rồi…" (bug đỏ chạy qua) → "Cuộc rượt đuổi bắt đầu" → "Bằng chứng!" (bug report BUG-1024 · Nút Thanh toán treo) → "Dev sửa, QC verify" → "HẾT" ("QC không làm ra chất lượng – QC bảo vệ chất lượng.").
- **Nhân vật:** không có NPC trong rạp (nhân vật chỉ vẽ trong phim).
- **Tương tác:**
  - Quầy vé tại (297, 7,8), bán kính 3 m: E hiện "Vé xem phim 'Cuộc săn Bug'" 15 💰 / 20 phút; cửa rạp mở khi có vé hoặc khi đang ở trong.
  - Ghế: E hoặc C; ngồi hiện thông báo "Phim 'Cuộc săn Bug' đang chiếu – ngồi thư giãn nhé. Bấm C để đứng dậy.".
  - Quầy bỏng ngô tại (305, 11,8), bán kính 2,4 m: E mua "Combo bỏng ngô + nước ngọt" 12 💰, buff `energy` 5 phút ("Giòn tan! Nhanh hơn 40% trong 5 phút."). (Chỉ là điểm tương tác ở sảnh sát cửa, chưa thấy mô hình quầy riêng trong mã.)
- **Kết nối:** cửa (297, 10) mở ra đại lộ về phía Nam z = 0. Camera được giới hạn trong hộp phòng chiếu khi ở trong. Dịch chuyển "Rạp QC Cinema" tới (297, 6,5) nhìn vào trong.

### 7. Phố ẩm thực
- **Nguồn:** `arena.js:406–439`.
- **Vị trí và kích thước:** x 279…322, trục z = 46 (hàng quầy); khu bàn ở z ≈ 53,5.
- **Bố trí và nội thất:**
  - 4 quầy, mỗi quầy bàn quầy 5 × 1,1 × 1,6 trắng + mặt gỗ, mái che nghiêng 5,6 × 3,2 ở y 2,6 màu riêng, bảng tên 4,6 × 0,85 ở z ≈ 43,85, tâm x = 284, 294,5, 305, 315,5; hai cột đỡ.
  - 6 bàn tròn (cột trắng, ô che đỏ/xanh luân phiên) tại x = 283, 290, 297, 304, 311, 318, z = 53,5; mỗi bàn 2 ghế ở x ± 1,15.
- **Chức năng:** ăn uống nhận buff; nơi khách bot ngồi ăn.
- **Quầy và thực đơn (giá 💰, buff):**
  1. "Phở Bình Phan" 🍜 (đỏ): Phở bò tái 35 (nhanh +40 % 10 phút); Phở gà 30 (nhanh 8 phút).
  2. "Cơm tấm QC" 🍱 (cam): Cơm tấm sườn bì chả 50 (nhanh + thưởng quiz +20 % trong 10 phút).
  3. "Bánh mì Test Case" 🥖 (vàng): Bánh mì thịt 20 (nhanh 5 phút); Bánh mì ốp la 22 (quiz +20 % 10 phút).
  4. "Trà sữa Regression" 🧋 (tím): Trà sữa trân châu 25 (quiz +20 % 15 phút); Cà phê sữa đá 25 (quiz +20 % 30 phút).
- **Nhân vật:** 4 chủ quán bot tên "Chủ quán · <tên quầy>" (áo trắng, quần đen; quầy lẻ đội mũ lưỡi trai, quầy chẵn búi tóc) đứng sau quầy ở z ≈ 47,3 quay mặt về phía Bắc. Khách bot (hệ `js/cafe.js`, ngoài phạm vi) tối đa 4 nhóm, xuất hiện tại (300,5; 37), mua đồ ở trước quầy rồi ra bàn ngồi; đồ uống ngẫu nhiên: trà sữa, nước ép cam, cà phê muối, bánh mì.
- **Tương tác:** điểm E trước mỗi quầy tại (x quầy, 43,7), bán kính 2,4 m: mở bảng thực đơn dạng thẻ; chọn món → hộp xác nhận → trừ tiền, cộng buff, `S.fun.meals`++, thông báo "Ngon tuyệt! <mô tả buff>.". Bàn ăn: E hoặc C để ngồi.
- **Kết nối:** từ đại lộ z = 0 đi về phía Nam. Dịch chuyển "Phố ẩm thực" tới (294, 42), nhìn về (294, 46).

### 8. Vòng quay QC Eye
- **Nguồn:** `arena.js:441–474`.
- **Vị trí và kích thước:** trục tại FW = (331, y 18,3, 40), bán kính vòng 15 m (đỉnh ≈ 33,3 m ≈ "33 m"), 12 cabin. Hai vòng thép song song cách nhau 2,6 m (z 38,7 và 41,3), có vòng LED viền phát sáng đổi màu, ban đêm sáng mạnh hơn. Chân đế chữ A: 4 chân thép (z = 40 ± 3,2, đi xiên tới x = 331 ± 9), trục ngang; bệ đế 7 × 0,5 × 5 tại (331, 40) với sàn đứng cao 0,5 (x 327,5…334,5, z 37,5…42,5).
- **Bố trí:** cabin hình trụ trắng với tấm sàn xanh ngọc, 6 màu hồng/vàng/xanh ngọc/xanh dương/tím/xanh lá nhạt lặp, lắc nhẹ.
- **Chức năng:** ngắm toàn thành phố.
- **Trò chơi:** quay 0,1 rad/s → 1 vòng ≈ 62,8 s; vé 15 💰.
- **Nhân vật:** không có.
- **Tương tác:** điểm E tại (331, 44), bán kính 3,2 m: hộp "Vé vòng quay QC Eye – lên cao 33 m ngắm toàn thành phố (khoảng 1 phút)"; sau khi trả tiền chờ cabin xuống đáy (góc 1,5π), bước vào cabin, camera lùi ra 11 m, kéo chuột để xoay ngắm. Hết đúng 1 vòng, nhân vật đứng lại ở (331, 44). Nếu người chơi rời sàn xa hơn 12 m khi đang chờ cabin → hoàn vé 15 💰.
- **Kết nối:** đại lộ z = 0 / phố ẩm thực. Dịch chuyển "Vòng quay QC Eye" tới (331, 46) nhìn về vòng quay.

---

## PHẦN B. CAO NGUYÊN BÌNH PHAN (`js/highland.js`)

### 9. Địa hình tổng thể Cao nguyên
- **Nguồn:** `highland.js:19–82, 190–203`.
- **Vị trí và kích thước:** lưới địa hình x 88…332, z −342…−100 (244 × 242 m), lưới ô 2 m (123 × 122 đỉnh), vẽ và va chạm khớp nhau (nội suy theo đúng 2 tam giác lưới). Độ cao tối đa trong lưới ≈ 66,5 m (tính lại từ công thức); đỉnh dùng đặt chòi: (296, −306), cao ≈ 63 m. Phố cổ phẳng ở độ cao 1,3 m trong x 150…256, z −182…−108.
- **Bố trí:** dãy núi đá bao phía Bắc (z < −185…), Đông và Tây (nhiễu fBM + ridged, cố định), vùng cỏ/rừng/đá/bùn/cát tô theo độ cao, độ dốc, gần sông, bờ biển. Mép đảo ngả xuống biển −6,5 m. Sông chảy từ núi.
- **Chức năng:** nền cảnh quan và đường tới phố cổ, thác.
- **Kết nối:** cầu x = 178 từ Downtown (không gian 10); taxi: thêm 2 nút (178, landZ−4) và (178, −174) nối nút Downtown gần (178, D.z0) nhất; 2 điểm đến taxi "Phố cổ Riverside (Cao nguyên)" tại (178, −135) và "Đường lên Thác nước" tại (178, −176).

### 10. Cầu nối Downtown → Cao nguyên (phố x = 178)
- **Nguồn:** `highland.js:190–203`.
- **Vị trí và kích thước:** trục x = 178, rộng 10 m (x 173…183). Từ z = `CITY.downtown.z0` (chưa rõ) đến z = landZ − 3, với landZ = chỗ đầu tiên đi xuống từ Downtown tại x = 178 mà địa hình cao hơn 0,6 m (ước tính −110, tức cầu kết thúc ≈ z −113). Mặt cầu dày 0,5 ở y −0,05, mặt nhựa rộng 7 m ở y 0,22.
- **Bố trí:** lan can bạc cao 1,1 m tại x = 178 ± 4,9 (hộp chặn), cột mỗi 2,5 m; trụ cầu tròn cứ 11 m xen kẽ trái/phải ở y −2,2; cột đèn phía x = 172,4 mỗi 12 m. Mã cắt lan can bờ Bắc Downtown một đoạn rộng x 172,5…183,5 chỗ chân cầu.
- **Chức năng:** đường dẫn vào Cao nguyên.
- **Kết nối:** Downtown ↔ đầu Nam phố cổ (z ≈ −108). Dịch chuyển "Cầu sang Cao nguyên" tới (180, D.z0 − 6) nhìn về (178, landZ).

### 11. Phố cổ Riverside (Hội An thu nhỏ)
- **Nguồn:** `highland.js:205–253`.
- **Vị trí và kích thước:** x 150…256, z −182…−108 (106 × 74). Hai phố lát đá rộng 9,4 m tại x = 178 (173,3…182,7) và x = 202 (197,3…206,7), dài z −181…−109, y 1,32. Sông chảy giữa tại x ≈ 190; kè sông 0,5 × 0,9 m tại x = 184,2 và 195,8, ba đoạn (z −181…−159,9; −156,1…−132,9; −129,1…−109) chừa lối lên hai cầu gỗ.
- **Bố trí và nội thất:**
  - Hai dãy nhà: Tây sông tâm x ≈ 168,2 (mặt tiền nhìn Đông, sâu 9 m, x 163,7…172,7); Đông sông tâm x ≈ 211,8 (mặt nhìn Tây, x 207,3…216,3). Mỗi nhà rộng 6–8 m (ngẫu nhiên có seed cố định), 2 tầng (55 %) hoặc 3 tầng (45 %); chạy từ z −114 xuống tới −176, khoảng 8–9 nhà mỗi dãy (ước tính). Màu tường lặp 8 màu (vàng, xanh ngọc, cam san hô, kem, xanh dương, hồng, vàng đất, xanh lá nhạt); cửa chớp 3 màu; mái ngói hai dốc, hiên trên cột gỗ, cửa sổ phát sáng cam ban đêm.
  - Mỗi nhà có 2 đèn lồng (đỏ và vàng) cạnh mặt tiền ở y ≈ 4,25, có quầng sáng.
  - Dây đèn lồng giăng ngang hai phố cứ 7 m một dây, z −116 → −172 (9 dây mỗi phố), cao ≈ 5,6 m, 5 đèn mỗi dây.
- **Chức năng:** phố đi bộ ngắm cảnh ban đêm.
- **Nhân vật:** 8 người dạo phố ("<tên> · dạo phố"), áo/dáng ngẫu nhiên, đi qua lại dọc phố (z −118…−172) tốc độ 0,9–1,4 m/s, đến cuối thì đứng 2–6 s rồi quay lại; x = 178 hoặc 202 ± 1,5. Không có thoại.
- **Tương tác:** không có điểm E (đi bộ tự do).
- **Kết nối:** đầu Nam ↔ cầu Downtown; hai cầu gỗ nối hai phố; đầu Bắc (z ≈ −178) ↔ lối dạo lên thác (không gian 16). Dịch chuyển "Phố cổ Riverside" tới (178, −128) nhìn (190, −140).

### 12. Hai cầu gỗ cong qua sông
- **Nguồn:** `highland.js:235–245`.
- **Vị trí và kích thước:** cầu 1 tâm (190, −131), cầu 2 tâm (190, −158); mỗi cầu dài 12 m (x 184…196) × rộng 3,2 m (z ± 1,6), mặt cong hình vòm cao từ 1,35 lên 2,45 m ở giữa; 9 tấm ván, 16 đoạn sàn đứng bám cung (mỗi bậc ≤ 0,25 m).
- **Bố trí:** lan can đỏ (cột + ống uốn theo vòm) hai bên, 2 đèn lồng mỗi cầu ở đỉnh vòm (y ≈ 3,2). Gầm cầu có hộp chặn (y −9…1) để không lội sông chui xuyên mặt cầu.
- **Chức năng:** qua sông giữa hai phố.
- **Kết nối:** hai phố x = 178 và x = 202.

### 13. Chợ đêm ven sông (bờ Đông)
- **Nguồn:** `highland.js:250–253`.
- **Vị trí và kích thước:** 5 sạp tại x = 198,6, z = −137, −143,5, −150, −164,5, −171 (chừa đầu hai cầu gỗ). Mỗi sạp thân 2,2 × 1 × 3,4 (kem), mái 2,8 × 0,1 × 4 màu riêng (đỏ gạch, vàng, xanh ngọc, tím, cam san hô) nghiêng nhẹ, hai cột.
- **Chức năng:** trang trí chợ đêm, có đèn sáng ban đêm.
- **Nhân vật / Tương tác:** không có (mã không đặt người bán hay điểm E).
- **Kết nối:** sát phố x = 202, phía sông.

### 14. Thác Móng Ngựa (rèm nước, hồ trên, hồ dưới)
- **Nguồn:** `highland.js:27–38, 94–132, 177–188`.
- **Vị trí và kích thước:** gốc toạ độ thác FC = (216, −266); trục dọc dòng chảy hướng (−0,217; 0,976) (gần như +z, nghĩa là chảy về Nam), trục ngang (0,976; 0,217). Rèm nước móng ngựa rộng 52 m (±26), mép thác lõm vào giữa 11 m, đỉnh thác y = 44, chân thác y = 20 (cao 24 m). Hai đầu rèm ở xấp xỉ (189,9; −268,3) và (240,6; −257,0), điểm giữa ≈ (217,6; −273,4). Hồ trên kéo dài ~48 m phía trên mép (tới ≈ (226; −313)); hồ dưới rộng ±40 m, dài tới ≈ (208; −229). Bọt sôi 3 dải ở chân thác, sương mù 170 hạt bay lên 17 m, đá hộ ở hai bờ hồ và chân thác (23 khối).
- **Chức năng:** cảnh quan chính; có tiếng thác.
- **Âm thanh:** tiếng ù trầm + rào rào (nhiễu lọc), to dần khi lại gần (30 m ≈ 33 %, 50 m ≈ 15 %, 100 m ≈ 5 %), bị tắt nếu: người chơi đeo tai nghe trong game, đã tắt "Âm thanh môi trường", ở trong nhà, hoặc xa hơn 220 m.
- **Nhãn 3D:** "🌊 Thác Móng Ngựa Cao Nguyên – Rộng 52 m · cao 24 m" ở y 53 (hiện từ xa tới 260 m).
- **Tương tác:** không có E; đi bộ lại gần tuỳ thích (sàn thác có mặt nước, rào chặn không cho xuống).
- **Kết nối:** lối dạo từ phố cổ (không gian 15); bậc đá (17).

### 15. Lối dạo phố cổ → đài ngắm chân thác (và lối nối)
- **Nguồn:** `highland.js:39–49, 168–176`.
- **Vị trí và kích thước:** lối chính TRAIL gồm 7 điểm trong hệ toạ độ thác, từ (203,5; −178) (cao 1,32, ngay đầu Bắc phố x = 202) đến (246,5; −232,6) (cao 20,9) — mặt lát đá rộng 2,8 m, đường dốc từ 1,3 lên ~20,9 m. Lối nối LINK 4 điểm rộng 2,4 m từ cuối TRAIL đến chân bậc đá ≈ (280,9; −247,3) ở cao ~22 m. Ba cột đèn dọc lối ở các cao độ 10,9 / 18,9 / 21,8 m.
- **Chức năng:** đi bộ lên thác.
- **Kết nối:** phố cổ (đầu Bắc phố đông) → Đài ngắm Chân Thác → bậc đá → Đài ngắm Đỉnh Thác.

### 16. Đài ngắm Chân Thác
- **Nguồn:** `highland.js:145–151`.
- **Vị trí và kích thước:** sân đá lát tâm ≈ (251; −238,8), cao độ 20,9 (mặt đứng ≈ 21,0); 14 m (hướng ngang thác) × 16 m (dọc thác), góc ≈ (245,8; −248,1) – (256; −229,4). Sàn gỗ vươn ra mặt hồ dài ~6,8 m × rộng 14 m ở hướng rèm nước, tâm ≈ (237,7; −241,7), cách rèm nước ~9 m; 6 cột gỗ chống dưới sàn (cao 3,2 m).
- **Bố trí:** lan can đen (cột + tay vịn gỗ tối + 2 thanh) quanh sàn và dọc ba mặt; 2 ghế băng quay thẳng về rèm nước (bắt buộc ngồi bằng E hoặc C, nhãn "🪑 Ngồi ngắm thác (E · C)") tại toạ độ thác (a, b) = (23,5; 36,5) và (21; 43,5). Nhãn 3D "🌊 Đài ngắm Chân Thác – Sàn gỗ vươn ra mặt hồ · bậc đá lên đỉnh thác ở phía Đông".
- **Chức năng:** ngắm thác từ chân.
- **Tương tác:** ghế E/C; lan can có thông báo "Lan can đài ngắm – thác ở ngay trước mặt!". Dịch chuyển "Thác Móng Ngựa · Đài ngắm Chân Thác" tới (≈ 241,7; −240,8) nhìn về rèm nước.
- **Kết nối:** lối dạo (15) ở phía Tây-Nam; bậc đá (17) phía Đông.

### 17. 100 bậc đá lên Đỉnh Thác
- **Nguồn:** `highland.js:152–161`.
- **Vị trí và kích thước:** 100 bậc, mỗi bậc sâu 0,3 m, cao 0,226 m (đi từ cao độ 22 lên 44,6), rộng 3,6 m; chân bậc ở xấp xỉ (277,6; −248,0), đỉnh ≈ (248,3; −254,5). Đi men chân vách đá ôm vào mép Đông của thác. Chiếu nghỉ trên (đỉnh) và chiếu nghỉ dưới (chân) rộng 5,2 m.
- **Bố trí:** lan can mảnh (cột đen mỗi 5 bậc, tay vịn gỗ + thanh kim loại); nhãn "⛰️ Bậc đá lên Đỉnh Thác – 100 bậc men vách · vừa leo vừa ngắm rèm nước"; thông báo chạm rào "Lan can bậc đá – bên dưới là hồ chân thác".
- **Chức năng:** đường lên đỉnh thác.
- **Kết nối:** chân bậc ↔ lối nối LINK; đỉnh bậc ↔ Đài ngắm Đỉnh Thác.

### 18. Đài ngắm Đỉnh Thác
- **Nguồn:** `highland.js:162–167`.
- **Vị trí và kích thước:** sân đá lát tâm ≈ (253; −264,2), cao độ 44,6; 15 m (ngang) × 13,5 m (dọc dòng), góc ≈ (247,1; −272,4) – (258,8; −256). Ngay mép nước đổ.
- **Bố trí:** lan can phía mép thác ("Lan can đỉnh thác – nước đổ xuống 24 m ngay dưới chân"), 1 ghế băng ("Ngồi ngắm đỉnh thác (E · C)") tại toạ độ thác (−7; 40,5), 2 cột đèn ở hai góc; nhãn "🌊 Đài ngắm Đỉnh Thác – Đứng ngay mép nước đổ · nhìn xuống hồ và phố cổ".
- **Tương tác:** E/C ngồi ghế. Dịch chuyển "Thác Móng Ngựa · Đài ngắm Đỉnh Thác" tới (≈ 248,8; −263,8).
- **Kết nối:** 100 bậc đá.

### 19. Chòi ngắm cảnh trên đỉnh núi
- **Nguồn:** `highland.js:278–288`.
- **Vị trí và kích thước:** trên đỉnh cao nhất ngoài vùng thác: (296, −306), độ cao ≈ 63 m (ước tính). Nền đá hình trụ bán kính 3,6–3,9, cao 0,5; 6 cột gỗ cao 3 m bán kính 3; mái hai tầng nón đỏ (bán kính 4,6 và 2,4); cột cờ cao 3 m với lá cờ đỏ phấp phới. Sàn đứng bán kính 3,5.
- **Chức năng:** điểm ngắm toàn cảnh.
- **Tương tác:** E trong bán kính 3,5 m: camera điện ảnh bay tới (PEAK.x+30, PEAK.h+28, PEAK.z+55) nhìn về (200, 10, −150); thông báo "Toàn cảnh cao nguyên – di chuyển để thoát."; nhãn "Chòi ngắm cảnh – cao 63 m". Dịch chuyển "Chòi ngắm cảnh đỉnh núi" tới (298, −304).
- **Kết nối:** không có lối đường bộ nào nêu trong mã; chỉ tới được bằng dịch chuyển hoặc đi bộ leo núi tự do.

### 20. Rừng
- **Nguồn:** `highland.js:259–276`.
- **Số lượng:** tối đa 2.100 cây trong 2 `InstancedMesh` (thông: độ cao > 14 hoặc 45 % số còn lại; lá rộng: phần còn lại); cây chỉ mọc ở độ cao 2,2…56 m, dốc ≤ 0,9, tránh phố cổ, tránh sông và vùng thác, tránh vành đai quanh đường x = 178 (phía Nam của landZ − 25).
- **Va chạm:** tối đa 380 cây thấp (y < 16) có vòng chặn bán kính ≈ 0,35·tỉ lệ.
- **Chức năng:** cảnh quan.

---

## PHẦN C. ĐẢO QC WONDERLAND (`js/funisland.js`)

### 21. Địa hình đảo QC Wonderland
- **Nguồn:** `funisland.js:14–29, 196–197`.
- **Vị trí và kích thước:** lưới x −10…132, z 222…362 (142 × 140, ô 2 m); tâm đảo IC = (61, 291); bán kính bờ 57 m ± ~7 m thay đổi theo góc; mặt đảo phẳng y = 1,7, dốc ra biển trong 7 m rồi xuống −6.
- **Bố trí:** mặt cỏ, vòng lối cát bán kính 26 m (rộng ~4,4 m), 6 nan hoa (lối) dài 50 m từ tâm đi ra theo góc 60°·k + 0,3 rad (rộng ~3,6 m), quảng trường trung tâm bán kính 9 m tô màu tím nhạt; bờ cát. 16 cột đèn + cờ vòng quanh đảo (bán kính bờ − 10 m): cao 6 m, cờ đỏ/vàng/xanh dương/tím luân phiên, quầng sáng hồng/vàng/xanh dương.
- **Chức năng:** nền công viên giải trí.
- **Nhãn 3D:** "🎡 Đảo QC Wonderland – Tàu lượn · tháp rơi · thuyền hải tặc · nhà ma" ở y 23,7 trên tâm (hiện đến 300 m).
- **Kết nối:** cáp treo (22); cầu đá phía Nam (40, 337 → 395,5) tới Công viên Kỳ Quan (30); dải lát 6 × 22 m tại (40, 326,5) dẫn tới đầu cầu. Dịch chuyển "Đảo QC Wonderland" tới (57, 245) nhìn về tâm (61, 291).

### 22. Cáp treo dài (2 ga, trụ giữa, cầu tàu)
- **Nguồn:** `funisland.js:42–79`.
- **Vị trí và kích thước:** ga đảo chính SA tại hướng (6, 84) từ gốc toạ độ, cách mép đảo chính 9 m về phía biển (giá trị cụ thể phụ thuộc `edgeR` ngoài phạm vi: chưa rõ); ga đảo giải trí SB = (54, 239). Chiều dài tuyến ~170 m (theo nhãn trong mã). Mỗi ga: sàn trắng 12 × 0,4 × 10 ở y 1,0, mái xanh ngọc 13 × 0,4 × 11 ở y 7,2, 4 cột thép cao 7,2, bánh dẫn cáp (đĩa đen) ở y 6,4. Trụ giữa: tại điểm giữa hai ga, cao 48 m (thân thép đường kính 3,2→4,8 m tới đáy biển, xà ngang 10 m ở y 47). Hai dây cáp song song cách nhau 6 m; cabin chạy từ độ cao 2,6 m ở ga tới 44 m ở giữa tuyến, dây cáp cao hơn cabin 2,2 m.
- **Cầu tàu nối bờ đảo chính:** rộng 3 m, mặt gỗ ở y 0,95, đầu cầu tự lùi tới chỗ trống đầu tiên không đâm vào toà Brand QA (tránh bị chặn), có bậc gỗ nếu bờ thấp hơn sàn > 0,6 m (mỗi bậc ≤ 0,3 m), cọc đen mỗi 3 m dưới nước.
- **Trò chơi:** 2 cabin đối trọng (cabin vàng và cabin mái đỏ), vận tốc 4,2 m/s, giảm tốc 14 m cuối mỗi đầu (không dưới 0,25 lần); 1 chuyến ≈ 40 s (ước tính 170/4,2) + đỗ ga 8 s đầu / 9 s mỗi lần tới ga. Vé 15 💰 mỗi chiều.
- **Nhân vật:** không có.
- **Tương tác:** hai điểm E bán kính 4 m ở mỗi ga: "Cáp treo ra Đảo QC Wonderland – 15 💰 (E)" (ga chính) và "Cáp treo về đảo Master Dashboard – 15 💰 (E)" (ga giải trí); điều kiện: cabin đang đỗ ở ga đó, nếu không báo "Cabin đang chạy – đợi cabin về ga (~… giây)". Trong cabin: ngồi, camera lùi 10 m, kéo chuột để ngắm. Đến nơi: thông báo "Chào mừng tới Đảo QC Wonderland!" hoặc "Đã về đảo Master Dashboard."
- **Nhãn 3D:** "🚡 Cáp treo ra Đảo QC Wonderland – Vé 15 💰 · bay ~170 m qua biển" ở ga chính (y 9,5).
- **Kết nối:** đảo Master Dashboard ↔ đảo Wonderland. Dịch chuyển "Ga cáp treo ra Đảo Wonderland": lùi 6 m phía sau ga.

### 23. Cổng lâu đài, quảng trường, đu quay ngựa gỗ
- **Nguồn:** `funisland.js:81–90`.
- **Cổng:** tâm (57, 251) (SB.x+3, SB.z+12), hai trụ hồng cao 9 m tại x = 52 và 62 (đường kính 2,8–3,2), nón tím cao 3,4 trên đỉnh, xà ngang 8,6 × 1,6 ở y 7,6, bảng "QC WONDERLAND" nền tím chữ vàng 8,4 × 1,1.
- **Đu quay ngựa gỗ:** tâm đảo (61, 291), bán kính sàn 6 m, mái nón đỏ cao 2,4 ở y 5,4, trục vàng; 10 ngựa 5 màu trên cột vàng. Quay 0,35 rad/s (~18 s/vòng); đây là vật trang trí, mã không có điểm E để cưỡi. Vòng chặn bán kính 6,3 m. Nhãn "🎠 Đu quay ngựa gỗ".
- **Chức năng:** cổng vào và trung tâm đảo.
- **Kết nối:** ga SB ↔ cổng ↔ quảng trường ↔ nan hoa tới các trò.

### 24. Tàu lượn "Siêu Bug"
- **Nguồn:** `funisland.js:92–122`.
- **Vị trí và kích thước:** đường ray khép kín đi qua 14 điểm điều khiển (x 13…58, z 262…322); cao độ ray từ 3,5 đến 26,5 (đỉnh dốc 24 m so với mặt đảo, nhãn "dốc 24 m · xoắn ốc"). Hai thanh ray đỏ cách nhau 1,1 m, tà vẹt tối, trụ thép mỗi 5 m dưới ray cao > 1,6 m.
- **Sân ga:** sàn 18 × 0,5 × 4 tại (33, 258,5), cao +1,15 m; 3 bậc lên ở đầu Tây (x ≈ 22,5…24); mái tím 19 × 0,3 × 9 tại (33, 262), cao +5,2; hộp chặn gầm sân ga x 24…42, z 256,5…260,5.
- **Trò chơi:** đoàn tàu 3 toa (vàng, xanh dương, xanh lá); vé 25 💰; vận tốc: lăn chậm 3,2 m/s qua 12 m đầu và xích kéo lên dốc, sau đó chuyển hoá thế năng (v ≈ √(E − 2·g·h)·0,97, tối thiểu 3 m/s), phanh trong 30 m cuối. Dwell: 8 s lúc khởi động, 10 s ở ga. Tốc độ vượt 14 m/s thì phát tiếng hét/gió.
- **Nhân vật:** không có.
- **Tương tác:** E tại (33, 257,4), bán kính 3 m: "Lên tàu lượn Siêu Bug – 25 💰 (E)"; tàu chỉ nhận khách khi đang đỗ và còn ≥ 2 s; không thì báo "Tàu đang chạy – đợi chuyến sau (~… giây)". Camera đuổi theo hoặc nhìn từ sau toa đầu. Kết thúc: "Phew! Ghê không? 😆", nhân vật đứng lại ở (33, 257).
- **Nhãn:** "🎢 Tàu lượn Siêu Bug – Vé 25 💰 · dốc 24 m · xoắn ốc".

### 25. Tháp rơi tự do 60 m
- **Nguồn:** `funisland.js:124–139`.
- **Vị trí và kích thước:** (100, 300); thân thép cao 60 m (đường kính 3–3,8 m), đầu đỏ trên đỉnh, 5 vòng vàng; bệ trắng đường kính ~9,4 m. Vòng chặn bán kính 4,2 m.
- **Trò chơi:** vòng ghế tím (12 ghế, bán kính 3,2 m) kéo lên 3,2 m/s tới độ cao 56 m (mất ~16–17 s ước tính), treo 3,2 s, rơi tự do (g = 9,81) tới ngưỡng 16 m rồi phanh giảm tốc 26 m/s². Vé 25 💰.
- **Tương tác:** E tại (105,2; 300), bán kính 3 m: "Chơi tháp rơi tự do 60 m – 25 💰 (E)"; lượt chạy duy nhất một lúc (nếu không rảnh: "Đợi lượt sau nhé!"). Xuống tại (105,4; 300) với thông báo "Tim vẫn còn đập chứ? 😵".
- **Nhãn:** "🗼 Tháp rơi tự do 60 m – Vé 25 💰".

### 26. Thuyền hải tặc
- **Nguồn:** `funisland.js:141–154`.
- **Vị trí và kích thước:** trục treo tại (92, y 13,7, 262) (Y+12), hai khung A gỗ hai bên (z 262 ± 3,4, cao 13 m, nghiêng ±0,25 rad), xà ngang gỗ; thân thuyền gỗ dài 13 m, rộng 4,4 m, cột buồm cao 7 m với cờ đen.
- **Trò chơi:** đu theo chu kỳ 4,6 s, biên độ tăng dần 0,07 rad/s tới tối đa 1,3 rad (≈ 75°), chạy 34 s rồi giảm biên độ 0,12 rad/s. Vé 20 💰.
- **Tương tác:** E tại (92, 256), bán kính 3 m: "Lên thuyền hải tặc – 20 💰 (E)"; xuống tại (92, 255,5) với thông báo "Yo-ho-ho! Chóng mặt chưa?".
- **Nhãn:** "🏴‍☠️ Thuyền hải tặc – Vé 20 💰 · đu tới 75°".

### 27. Nhà ma "Nhà Ma Bug" (đi xe)
- **Nguồn:** `funisland.js:156–188`.
- **Vị trí và kích thước:** x 73…97, z 322…338 (24 × 16), tâm (85, 330); thân hộp tím tối cao 9 m, mái chóp nón cao 6 m, 2 tháp tròn cao 13 m tại (75, 322) và (95, 322) có mái nón; cửa đen 3,6 × 4,2 ở mặt Bắc (z ≈ 322); 6 cửa sổ phát sáng tím; biển "👻 NHÀ MA BUG" 6 × 1,1 ở y 6,7. Hộp chặn kín cả toà ("vào bằng xe ở cửa chính").
- **Bố trí bên trong (vẽ riêng, tối):** sàn đen + trần đen, 2 vách ngăn chừa đường xe, 6 hình bóng ma (bóng trắng, đầu lâu, bug xanh lá) bật lên khi xe đi qua trong bán kính 3,2 m, 8 đèn nhấp nháy (tím/đỏ/xanh).
- **Trò chơi:** xe ma đi theo đường 10 điểm (x 76…94, z 317…335, khoảng 90 m, ước tính ≈ 56 s ở 1,6 m/s). Vé 20 💰. Jump scare kèm tiếng "boo".
- **Thoại tiêu biểu:** "👻 BOOO!", "💀 Áaaa!", "🐛 Bug khổng lồ!!", kết "Thoát khỏi Nhà Ma Bug! Can đảm ghê 😄".
- **Tương tác:** E tại (85, 316,5), bán kính 3 m: "Đi xe vào Nhà Ma Bug – 20 💰 (E)"; xuống lại tại (85, 315).

### 28. Quầy kem và khách bot
- **Nguồn:** `funisland.js:190–194`.
- **Quầy kem:** tại (51, 277) (IC.x − 10, IC.z − 14), 3 × 1,1 × 1,6 hồng, mái nón hồng. E tại (51, 278,8), bán kính 2,2 m: "Quầy kem Wonderland (E) – 15 💰" → mua "Kem ốc quế 3 vị", chỉ có thông báo "Mát lạnh! Chơi tiếp trò nào? 😋" (không buff).
- **Khách vui chơi (9 bot "<tên> · khách vui chơi"):** đứng yên tại (30, 255), (31,5; 254,6), (96, 296), (96,6; 297,6), (90, 256), (86, 314), (84,5; 313,4), (66, 276), (56, 286); giới tính luân phiên; không thoại.

---

## PHẦN D. CÔNG VIÊN KỲ QUAN (`js/themepark.js`, `themerides.js`, `themeland2.js`, `coastertrack.js`)

### 29. Địa hình và tổng thể Công viên Kỳ Quan
- **Nguồn:** `themepark.js:1–57, 63–89`.
- **Vị trí và kích thước:** lưới x −270…363, z 372…1242 (633 × 870, ô 3 m). Đường biên thực là hợp của 2 hộp bo góc: cổ chai tâm (38, 452) nửa rộng (78, 68) tức x −40…116, z 384…520; thân tâm (46, 865) nửa rộng (302, 365) tức x −256…348, z 500…1230 (kèm gợn sóng bờ). Mặt đất công viên phẳng ở G0 = 2,0 m. Hai dải gò cây hai bên Đại lộ cao thêm tới 7 m (che thành phố) ở |x − 38| ≈ 49…57 (dốc thoải từ 38 và đến 69), z ≈ 398…496.
- **Bố trí:** cỏ có vân (độ phân giải ô 3 m, gộp ô lớn để giảm tam giác); cát/đáy hồ ở nơi thấp; lối lát đá là lưới riêng nằm trên mặt đất (đất bên dưới hạ 0,35 m chỉ trong lưới vẽ). Cây mọc thành cụm 3–6 cây (tối đa ~680, máy yếu ~400), 3 loại tán (shade/round/tier) + cọ ven hồ; mỗi cây có lõi tán đặc để nhìn từ xa không trong suốt.
- **Chức năng:** khu công viên chủ đề.
- **Kết nối:** cầu đá từ Wonderland (30); Đại lộ Phiêu Lưu x 208…220 từ z 634 xuống tới z 884 (khu Nam); đại lộ ngang z 884…896 (x −210…330). Hộp trời đi theo người chơi vì khu Nam nằm ngoài ±1000 m.

### 30. Cầu đá vào + Cổng chính Công viên Kỳ Quan
- **Nguồn:** `themepark.js:132–155`.
- **Cầu đá:** dọc x = 40 từ z = 337 (cao độ 1,72) đến z = 395,5 (cao độ 2,05), rộng 8,4 m, mặt vòm cao thêm 1,6 m ở giữa; lan can đá hai bên (cột đá nhỏ) tại x = 40 ± 4,2; 3 mố đá (z ≈ 348,7; 366,3; 383,8) mỗi mố có 2 cột đèn cao ~3,4 m; 24 đoạn sàn đứng.
- **Cổng:** tâm (40, 402): hai tháp vuông 6 × 15 × 6 tại x = 28 và 52, mái chóp xanh cao 7 m, cột cờ vàng cao ~3 m, cờ ★ đỏ / ☆ trắng; kính 2 mặt mỗi tháp; tường rào 24 × 3,2 hai bên nối ra gò cây (x 1…25 và 55…79, hộp chặn z 401,6…402,4); xà giữa 18,4 × 3,4 × 2,4 (y 11,3). Bảng "CÔNG VIÊN KỲ QUAN" (nền xanh đậm chữ vàng viền vàng, 17 × 2,5 m) và dòng "QC WORLD · 5 siêu trò chơi · Hồ Pha Lê · Phố ẩm thực"; 9 bóng đèn vàng dọc xà.
- **Nhãn 3D:** "🎢 Công viên Kỳ Quan QC World – Tàu lượn Thần Long · Tia Chớp · Song Dực Đại Bàng · Tháp Sấm Sét · Mắt Thần" ở y 32.
- **Tương tác:** không có E; đi bộ qua cổng giữa (x 34…46).
- **Kết nối:** cầu ↔ Đại lộ Ánh Sao. Dịch chuyển "Công viên Kỳ Quan · Cổng chính" tới (40, 410) nhìn về (40, 440).

### 31. Đại lộ Ánh Sao + phố ẩm thực 8 quầy
- **Nguồn:** `themepark.js:156–183`.
- **Vị trí và kích thước:** x 27…53 (rộng 26 m), z 414…508 (dài 94 m) — lát đá tại z 394…508 (quảng trường granite z 394…414 sát cổng). Bó vỉa hai mép x = 27,15 và 52,85.
- **Bố trí:** 
  - Dải hoa giữa rộng 2,6 m (x 38,7…41,3), mỗi đoạn dài 15 m: ở z = 418, 438,5, 459, 479,5 (4 đoạn), có hoa/bụi và 1 cây tier.
  - Cột đèn hai bên ở x = 31,4 và 48,6, từ z 420 đến 504 mỗi 12 m; ghế băng (x 30,6 và 49,4) và thùng rác xanh ở z 437, 462, 487 (+7,4 thùng rác).
  - 4 ô khoảng cách từ z 422, 442,5, 463, 483,5; mỗi ô dài 16 m. Phía tây (x = 26): ô 1 và 3 là nhà phố; ô 2 và 4 là quầy. Phía đông (x = 54): ô 2 và 4 là nhà phố; ô 1 và 3 là quầy. Như vậy: nhà phố 4 căn (rộng 16, sâu 9,5, 2–3 tầng, màu tường 6 loại, cửa chớp 4 loại); quầy ẩm thực 8 quầy (mỗi ô quầy 2 quầy cách 8,2 m).
  - Mỗi quầy: rộng 5,6 m, thân kem + quầy bàn gỗ, mái hiên sọc xen màu, bảng tên 5,6 × 0,72, bảng thực đơn nhỏ 2,2 × 1,3, hai đèn bóng; 1 bàn dù + 3 ghế mây ngồi được.
- **Chức năng:** đại lộ vào công viên, ăn uống.
- **Quầy (tên · món · giá 💰):** Phở Bò Kỳ Quan "Phở bò tái chín" 18 (z ≈ 426, x đông); Bánh Mì Ánh Sao "Bánh mì thập cẩm" 12 (z ≈ 434,2, đông); Burger Thần Long "Burger bò phô mai 2 tầng" 22 (z ≈ 446,5, tây); Pizza Thiên Hà "Pizza hải sản lát lớn" 20 (z ≈ 454,7, tây); Trà Sữa Mây Bay "Trà sữa trân châu" 14 (z ≈ 467, đông); Kem Tuyết Pha Lê "Kem ốc quế 3 vị" 12 (z ≈ 475,2, đông); Gà Rán Đại Bàng "Gà rán giòn 3 miếng" 20 (z ≈ 487,5, tây); Bắp Rang Sấm Sét "Bắp rang bơ + xúc xích" 15 (z ≈ 495,7, tây).
- **Nhân vật:** 8 đầu bếp đứng sau quầy, tên "<tên> · đầu bếp <tên quầy>", giới tính luân phiên, quay mặt về phía khách; không thoại.
- **Tương tác:** E trước mỗi quầy (bán kính 2,4 m): "<icon> <quầy>: <món> – <giá> 💰 (E)" → hộp thanh toán; sau khi trả: "<món> nóng hổi đây! Ngồi bàn dù bên cạnh ăn rồi chơi tiếp nhé 😋". Không có buff.
- **Kết nối:** cổng chính (z 402) → quảng trường trung tâm (không gian 32, z 526).

### 32. Quảng trường trung tâm (HUB) + đài phun nước
- **Nguồn:** `themepark.js:184–191`.
- **Vị trí và kích thước:** tâm HUB = (40, 526), bán kính 21 m (đĩa terrazzo), ngay sau cuối Đại lộ (z 508 → 526). Đài phun 3 tầng bán kính 5,4 m ở giữa (cao ~4,5 m, quả cầu chrome trên đỉnh), mặt nước y 1,55+0,46; vòng chặn 5,7 m.
- **Bố trí:** 4 cột chỉ đường ở bán kính 17,5 m: "🚀 Tia Chớp Không Gian →" (hướng +x), "← 🗼 Tháp Sấm Sét" (−x), "🎡 Mắt Thần · 🐉 Thần Long ↓" (hướng (0,6; 0,8)), "🦅 Song Dực Đại Bàng ↓" (hướng (−0,6; 0,8)); 8 vị trí ven (bán kính 9,5 ghế, 19 cột đèn xen kẽ).
- **Chức năng:** nút phân phối tới các trò chơi.
- **Kết nối:** lát đá tới Tia Chớp (x 58…132, z 514…522, vòi kết thúc tại x 130…148, z 512…533), tới Tháp Sấm Sét (x −40…22, z 534…542, quảng trường tròn tâm (−52, 538) bán kính 14), tới hồ (x 34…46, z 540…552). Dịch chuyển "Quảng trường & Hồ Pha Lê" tới (40, 549) nhìn về (40, 620).

### 33. Hồ Pha Lê (đảo giữa hồ, 2 cầu đá, vọng lâu, đài phun nhạc)
- **Nguồn:** `themepark.js:17–28, 99–130, 193–201`.
- **Vị trí và kích thước:** hồ elip tâm (40, 620), nửa trục 100 (x) × 58 (z), tức x −60…140, z 562…678; mặt nước y 1,55; viền lát đá rộng 3,2…12,2 m quanh mép, kè bậc 2 cấp, cọc xích thấp (có khe 5,4 m ở đầu cầu). Đảo giữa hồ bán kính 22 m (lát phẳng bán kính 19,8, mép đá bán kính 21,6).
- **Bố trí:** hai cầu vòm đá cùng trục x = 40 (cầu Bắc z ≈ 558,6 → 598,5; cầu Nam z ≈ 641,5 → 681,4; mỗi cầu dài ≈ 40 m) rộng 5,4 m, đỉnh vòm cao 2,0 m trên mặt đất, có lan can đá, 2 cột đèn mỗi đầu, hai mố giữa; vọng lâu bát giác ở tâm đảo: sàn đá bán kính 6,2, 8 cột trắng cao 3,6, mái nón ngói cao 3,2 + cầu chrome, bán kính mái 7,4; 4 ghế băng quanh vọng lâu (2,6 m từ tâm); 8 cây quanh đảo (bán kính 13,5), 6 cột đèn (bán kính 17,5). Đài phun nhạc: 14 vòi xếp cung ở nửa Bắc hồ (z ≈ 586…590, cao 9–12 m), 10 vòi vòng ngoài (cao 6 m), 2 vòi lớn cao 22 m tại (40 ± 52, 612), nhịp lên xuống theo sin (chỉ vẽ khi người chơi cách < 330 m).
- **Chức năng:** trung tâm cảnh quan và ngồi nghỉ; chung quanh là các trò chơi.
- **Tương tác:** ghế băng E/C; bờ hồ có rào vô hình ("Hồ Pha Lê – không xuống nước. Qua đảo giữa hồ bằng cầu đá ở hai đầu Bắc/Nam").
- **Kết nối:** quảng trường (32) ↔ đảo hồ ↔ các trò quanh hồ (Mắt Thần tại (172, 620), Song Dực Đại Bàng ở phía Tây (−154…−83, 620), Thần Long ở phía Nam (x 20…58, z 712)).

### Khung chung cho các trò chơi ray (dùng cho Mục 34–36 và 39–41)
- Tàu có 6 toa (5 toa khi máy yếu), mỗi toa dài 2,6 m; hàng ghế đầu của toa đầu là ghế của người chơi. Cổng soát vé: 3 làn (rộng 4,8 m) cho 5 ride bên, 2 làn cho Song Dực Đại Bàng. Thanh chắn nâng khi đã có vé và người chơi đứng trong vùng cổng.
- Tàu ra ga khi: hết thời gian chờ (dwell 16–18 s) và không có khách có vé đang đứng trong vùng chờ; nếu có khách chờ, tàu đợi thêm tối đa 40 s. Ngoài khoảng cách ~120 m thì chỉ cập nhật thưa.
- Ba loại ghế: tàu ngồi (ray dưới) với ghế bên trái hướng chạy; tàu treo (Song Dực Đại Bàng) ghế treo dưới ray.
- Xe thông báo kết thúc: "<icon> <tên trò>: <giây> giây · tốc độ cao nhất <km/h> km/h. Ra theo biển 'LỐI RA' ở cuối sân ga nhé!".
- Các con số "ước tính thời gian lượt" bên dưới do tôi mô phỏng `physStep` (không phải hằng số trong mã).

### 34. 🐉 Thần Long Cuồng Nộ (tàu lượn)
- **Nguồn:** `themerides.js:223–233`, `coastertrack.js:94–100`.
- **Vị trí và kích thước:** ga ở x 20…58, z = 712 chạy về Đông. Sân ga (platform) ở x ≈ 39,2…61,2, z ≈ 706…711, cao độ ≈ 3,25. Khu xếp hàng gốc (37,7; 705), dài 15,5 m về phía +x, rộng 4,8 m về phía −z (tới (53,2; 700,2)); dãy cổng soát vé ở đầu x ≈ 53,2 (z 700,2…705), quầy vé ≈ (53,2; 698,2), cổng tên trò ở x ≈ 57,7. Ray x −74…171, z 657…782 (trên hồ và quanh hồ), dài 1.510 m, cao nhất ≈ 68 m so với mặt đất (đúng "dốc 68 m").
- **Bố trí:** rồng đỏ vàng ở đầu tàu (đầu rồng gắn vào toa đầu), ray đỏ, xương sống vàng, trụ chữ A bảo vệ; mái ga đỏ sẫm.
- **Trò chơi:** thứ tự: ga 38 m → xích kéo dốc 68 m (6 m/s) → lao 84° → vòng lộn bán kính 19,5 (cao 39 m) → cobra roll → xoắn không trọng lực → 2 xoắn ốc trên hồ → xoáy 540° (bán kính 17) → phanh về ga. Vé 35 💰; tốc độ tối đa theo nhãn 126 km/h (khớp mô phỏng 35 m/s ≈ 126 km/h); thời gian lượt ước tính ≈ 114 s; chờ ghi "8 phút".
- **Nhân vật:** nhân viên vận hành "<tên> · nhân viên vận hành Thần Long Cuồng Nộ" ở đầu sân ga; nhân viên soát vé "<tên> · nhân viên soát vé Thần Long Cuồng Nộ" cạnh quầy vé; khách rải rác (khách bot ngồi sẵn ở các toa phía sau).
- **Tương tác:** quầy vé: E "Mua vé 🐉 Thần Long Cuồng Nộ – 35 💰"; trên sân ga: E "Lên tàu Thần Long – hàng ghế đầu" (chỉ khi đứng trên sân ga). Có thể mua vé ngay khi bấm lên tàu.
- **Kết nối:** từ quảng trường HUB đi theo Đại lộ về hồ và vòng quanh đáy hồ tới (58…76, 686…710,6) granite ở cổng. Dịch chuyển "Công viên Kỳ Quan · Thần Long Cuồng Nộ" tới gần cổng tên trò.

### 35. 🚀 Tia Chớp Không Gian (tàu lượn phóng)
- **Nguồn:** `themerides.js:234–244`, `coastertrack.js:102–110`.
- **Vị trí và kích thước:** ga x 100…130, z = 536 chạy về Đông; sân ga x ≈ 111,2…133,2, z ≈ 530…535; khu xếp hàng gốc (109,7; 529) tới (125,2; 524,2), dãy cổng soát vé ở x ≈ 125,2. Hầm phóng 46 m dọc x 140…186, z = 536 (khung vòm đen cao 4,4 + vòng neon xanh/tím xen kẽ). Ray x 90…319, z 520…798, dài 1.224 m; mũ chóp dựng đứng cao ≈ 60,7 m.
- **Trò chơi:** phóng từ trường 0→133 km/h trong 52 m, mũ chóp 90° (lên 60 m), treo ~3,5 s ở đỉnh (có thông báo "Treo lơ lửng trên đỉnh 60 m… nhìn thẳng xuống đất!"), lao dốc, Immelmann, 3 đồi lạc đà (đồi 24 m, 20 m), vòng thắt nút, xoắn xuống ga (đường 'to' qua (262, 640), (196, 556)). Đếm ngược phóng "3 · 2 · 1". Vé 35 💰; thời gian ước tính ≈ 88 s; chờ ghi "6 phút".
- **Nhân vật:** nhân viên vận hành + soát vé như Mục 34.
- **Tương tác:** như Mục 34 với nhãn "Lên tàu Tia Chớp – hàng ghế đầu (E)".
- **Kết nối:** HUB → lát đá x 58…132, z 514…522 → quảng trường granite 130…148 × 512…533 → hầm phóng.

### 36. 🦅 Song Dực Đại Bàng (tàu treo, 2 đường đua)
- **Nguồn:** `themerides.js:245–260`, `coastertrack.js:112–117`.
- **Vị trí và kích thước:** hai đường soi gương qua mặt phẳng z = 620: đường A đỏ (z 537…616), đường B xanh (z 624…703), x −234…−84; ga đảo giữa hai đường ray ở x ≈ −154…−134, z = 620 (sân ga 20 × 6,8, cao độ 2,6; mái 23 × 17 ở y 8,85; hành lang giữa). Cổng soát vé 2 làn tại (−83,6; 620), vào từ phía Đông rồi đi vào hành lang. Ray cao nhất ≈ 41,2 m.
- **Trò chơi:** 2 đoàn tàu treo đua song song: xích kéo 41 m → vòng lộn bán kính 13,5 → xoắn không trọng lực → xoắn ốc → cork. Vé 35 💰; tốc độ ≈ 93 km/h; thời gian ước tính ≈ 70 s; chờ ghi "7 phút".
- **Nhân vật:** 1 nhân viên vận hành "nhân viên vận hành Song Dực Đại Bàng" ở (−152,6; 620); nhân viên soát vé.
- **Tương tác:** E trên sân ga: nửa Bắc (z < 620) → tàu ĐỎ (A); nửa Nam → tàu XANH (B). Cổng ra một chiều tại (−83,6; 620,1…623,3).
- **Kết nối:** Hồ Pha Lê bờ Tây ra sân ga: lát (−132…−70, 616,8…623,2). Thông tin chưa rõ: toạ độ khu xếp hàng chính xác (chỉ biết vùng chặn x −160…−70, z 606…634).

### 37. ⚡ Tháp Sấm Sét QC (rơi 80 m)
- **Nguồn:** `themerides.js:262–315`.
- **Vị trí và kích thước:** tâm (−52, 538), thân vuông 2,3 × 82 × 2,3 cùng 4 trụ thép bán kính 1,6; đỉnh có đĩa thép + vòng vàng + 8 gai vàng + cột thu lôi (đầu cầu sáng ở y ≈ 92). Bệ lên ghế tròn bán kính 8,2 (cao 0,45) + vòng ngoài 8,7; rào quanh bán kính 9 (chừa lối vào phía Đông và lối ra Đông-Nam). Vùng chặn x −64…−20, z 526…550.
- **Trò chơi:** vòng ghế 24 chỗ (có khoá vai) vừa xoay vừa nâng: lên 80 m trong 24 s (1 vòng xoay trọn), "tích năng lượng" 5 s với tia sét trên đỉnh, rơi giả 0,42 s rồi giật lại, sau 2,5 s rơi thật (rơi tự do tới y ≈ 35, bị đẩy nảy lên, rơi tiếp tới y ≈ 26 rồi hạ dần về bệ) — nhãn "rơi tự do 105 km/h, nảy lên 45 m". Chạy tự động mỗi ~20–22 s nếu không có khách. Vé 30 💰; chờ ghi "5 phút".
- **Thoại/thông báo tiêu biểu:** "Khoá vai tự động đã đóng. Vòng ghế sẽ vừa xoay vừa lên cao 80 m…", "Đỉnh tháp 80 m – năng lượng đang tích tụ…", "Hú hồn… mới chỉ là rơi giả thôi!".
- **Tương tác:** E tại (−46,4; 538), bán kính 3,4 m (chỉ khi đứng trên bệ, cách tâm < 8,6 m): "Ngồi vào ghế Tháp Sấm Sét (E)"; nếu đang chạy báo "Vòng ghế đang ở trên cao – đợi lượt sau (~… giây)". Khu xếp hàng gốc tại (−42,5; 538,8), dài 15,5 m về phía +x (phía HUB), dãy cổng soát vé + quầy vé ở đầu x ≈ −27; cổng ra ở góc ~0,63…1,01 rad quanh bệ.
- **Kết nối:** HUB → lát đá x −40…22, z 534…542 → quảng trường tròn tâm (−52, 538) bán kính 14. Dịch chuyển qua `PLACES` của gateLine (theo cổng tên trò).

### 38. 🎡 Mắt Thần QC World (vòng quay 90 m)
- **Nguồn:** `themerides.js:317–361`.
- **Vị trí và kích thước:** trục tại (172, y 52,5, 620), vòng bán kính 45 m (đỉnh ở y ≈ 97,5, đường kính 90 m "90 m"), hai vòng thép cách nhau 5,2 m (x 169,4 và 174,6), 4 chân chống hướng ra bốn góc (±12 m), 24 cabin kính cầu (bán kính 2,08, trong suốt 22 %) treo lệch trọng tâm, 192 đèn LED (96 × 2 vành) đổi màu theo thời gian, ban đêm to hơn.
- **Sân lên cabin:** phía Tây, x 164…170,1, z 610…630, cao độ 3,6 (cao hơn mặt đất 1,6), cầu thang 8 bậc ở hai đầu (Bắc vào, Nam ra); quầy vé + cổng soát vé phía Bắc sân (khu xếp hàng gốc tại (152,5; 594), dài 15,5 m theo hướng +z, rộng 4,8 m theo +x); lối ra một chiều tại z = 634,6; hộp cấm vùng cabin quay sát đất x 170,2…176.
- **Trò chơi:** 1 vòng 180 s (tốc độ 2π/180 rad/s), cabin kính, camera đuổi hoặc thứ nhất; có nút tương tác "⏩ Quay nhanh về ga để xuống sớm (E)" tăng tốc 7 lần. Vé 25 💰; chờ ghi "4 phút".
- **Nhân vật:** nhân viên soát vé; không có nhân viên vận hành riêng (chưa rõ).
- **Tương tác:** E tại (168,6; 620), bán kính 4,2 m (khi đứng trên sân): "Bước vào cabin Mắt Thần (E)" → tự đi bộ vào cabin → vòng → "Hẹn gặp lại ở Mắt Thần QC World! Ra theo cầu thang phía Nam".
- **Kết nối:** quảng trường HUB → lát đá x 58…132, z 514…522 (Đông) và x 150…165 × 614…626 (đến sát hồ); quảng trường granite x 150…171 × 631…638.

### 39. 🦖 Kỷ Jura Tuyệt Diệt (tàu thám hiểm xuyên núi)
- **Nguồn:** `themeland2.js:74–117`, `coastertrack.js:119–125`.
- **Vị trí và kích thước:** ga (158, 975 → 937) chạy về Bắc; sân ga x ≈ 151,9…156,9, z ≈ 933,8…955,8. Hai núi đá: jura1 tâm (272, 992) bán trục 66 × 60 cao 66 m; jura2 tâm (160, 1064) bán trục 24 × 20 cao 15 m. Ray x 151…315, z 914…1066, dài 607 m. Thung lũng khủng long ở x ~180…300, z ~900…950.
- **Bố trí:** thung lũng ăn cỏ với 2 con cổ dài (tại (226, 941) và (262, 907,5), cổ đung đưa), 3 con ba sừng (tại (205, 929), (241, 937,5), (197, 934)), cọ nhiệt đới rải rác; hầm báo động có đèn đỏ chớp + xe thám hiểm lật; hang raptor 4 con phục kích; đại sảnh T-Rex (đầu + hàm lao ra khi xe tới); bộ xương hoá thạch ở cửa ra; thác nước ở hầm 2; vách núi có hộp chặn ("Vách núi dựng đứng – không leo được").
- **Trò chơi:** thung lũng ăn cỏ → hầm báo động → hang raptor → xích kéo trong núi → T-Rex → lao 75° → xoắn trên hồ → xuyên thác nước → hầm 2 → về ga. Ray cao nhất ≈ 31,4 m; xe jeep, vé 35 💰; chờ ghi "9 phút"; tốc độ tối đa ≈ 87 km/h; thời gian ước tính ≈ 99 s. Trong hầm tối, sương mù kéo gần, tối đi.
- **Thoại/sự kiện:** "T-REX! Bám chặt – tàu lao thẳng xuống vực!", "Xuyên qua thác nước!", tiếng gầm tự tạo.
- **Tương tác:** E tại sân ga "Lên xe thám hiểm Kỷ Jura – hàng ghế đầu (E)".
- **Kết nối:** Đại lộ Phiêu Lưu → đại lộ ngang z 884…896 → lối granite x 136…157 × 896…936 tới ga. Biển chỉ đường tại (214, 878): "🦖 Kỷ Jura · 🔱 Atlantis →", "← 🌋 Hầm Mỏ Dung Nham", "← 🏴‍☠️ 🎠 🌤 🌀 Khu Lễ Hội".

### 40. 🌋 Lời Nguyền Hầm Mỏ Dung Nham
- **Nguồn:** `themeland2.js:119–149`, `coastertrack.js:127–134`.
- **Vị trí và kích thước:** ga (−20…18, 916) chạy về Đông; sân ga x ≈ −0,8…21,2, z ≈ 910…915. Núi lửa tâm (24, 1010) bán trục 72, cao 55 m, miệng bán kính ~10; núi phụ volcN tâm (8, 950) 30 × 16 cao 9; gò pha lê tâm (98,7; 999) 8 × 36 cao 13. Ray x −55…99, z 916…1088, dài 1.204 m, cao nhất ≈ 53,8 m.
- **Bố trí:** hầm pha lê (64 viên pha lê phát sáng đổi màu), quái vật đá dung nham trên đỉnh đường cụt (2 tay đập), lòng núi rỗng, mặt dung nham bán kính 50 m tại (20, 1002), suối dung nham chảy ngoài sườn (7 dòng), 6 cột lửa ở đáy lõi tại (2, 1002), (30, 996), (14, 976), (40, 1016), (−4, 982), (26, 1024), khói tại miệng núi.
- **Trò chơi:** xe goòng mỏ: hầm pha lê → đường ray đứt: quái vật Đá Dung Nham đập xuống, tàu TRƯỢT LÙI 1,5 vòng xoáy trong lòng núi → đáy lõi dung nham "áp suất dồn lên, 3 · 2 · 1 – PHÓNG!" → phóng vọt qua miệng núi lửa. Có 2 điểm đường cụt (dừng 4,6 s và 4,2 s rồi chạy ngược). Vé 35 💰; chờ ghi "10 phút". Tốc độ/thời gian chưa mô phỏng (chưa rõ).
- **Thoại tiêu biểu:** "Đường ray đứt gãy! Quái vật Đá Dung Nham đập xuống – tàu TRƯỢT LÙI vào bóng tối!", "Đáy lõi núi lửa… áp suất đang dồn lên… 3 · 2 · 1 – PHÓNG!", "Vọt qua miệng núi lửa!".
- **Tương tác:** E tại sân ga "Lên xe goòng Hầm Mỏ Dung Nham – hàng ghế đầu (E)".
- **Kết nối:** đại lộ ngang z 884…896 → granite x 14…44 × 896…912 → ga.

### 41. 🔱 Đền Thờ Atlantis Chìm Đắm
- **Nguồn:** `themeland2.js:151–183`, `coastertrack.js:135–139`.
- **Vị trí và kích thước:** ga (118…156, 1108) chạy về Đông; sân ga x ≈ 137,2…159,2, z ≈ 1102…1107. Đại điện đáy biển dạng vòm bán kính 19,5 tại (≈ 220, 1108) (giữa mốc 'hall' và 'hallEnd', ước tính x ≈ 203…237). Đền trên đỉnh tại (307, 1125): bệ bậc thang 4 tầng (46 → 22 m), 10 cột cẩm thạch cao 14, mái cao tới ≈ 32,6 m. Hồ Atlantis tâm (236, 1152), 68 × 26 (x 168…304, z 1126…1178), mặt nước y 1,6. Ray x 97…321, z 1108…1150, dài 515 m, cao nhất ≈ 34,5 m.
- **Bố trí:** phế tích 2 hàng cột cẩm thạch (9 cặp, một số đổ nghiêng, cao 3,2 hoặc 6,2 m) quanh ray gần x 164…185; cổng xoáy nước 6 vòng nước quay; trong đại điện: vỏ xanh thẳm, "cá voi và rùa ảnh nổi" bơi trên đầu, 6 xúc tu Kraken; cuối cùng lao xuống hồ, sóng tung 12 m hai bên.
- **Trò chơi:** chiến thuyền: phế tích → cổng xoáy nước → đại điện (Kraken) → leo đỉnh đền 35 m (xích kéo) → lao xuống hồ → lướt mặt nước về ga. Vé 35 💰; chờ ghi "8 phút"; tốc độ ≈ 94 km/h; thời gian ước tính ≈ 83 s.
- **Thoại tiêu biểu:** "Thuỷ quái Kraken quật xúc tu!", "Ùm! Sóng nước tung cao 12 m hai bên!".
- **Tương tác:** E sân ga "Lên chiến thuyền Atlantis – hàng ghế đầu (E)".
- **Kết nối:** Đại lộ Phiêu Lưu → z 884…896 → (108…120, 896…1100) → (108…186, 1086…1104) → ga.

### 42. 🏴‍☠️ Con Tàu Ma Ngọc Trai Đen (xoay 360°)
- **Nguồn:** `themeland2.js:225–266` (đoạn Khu Lễ Hội).
- **Vị trí và kích thước:** tâm (−120,4; 935,4), bãi tròn bán kính 17 m có rào (khe vào hướng về HUB lễ hội (−160, 975), cổng ra lệch −0,42 rad). Khung chữ A cao 15,3 m (trục treo ở y 17,3), hồ nước bán kính 14,2 m, cầu tàu gỗ lên boong 11 bậc, thân tàu dài 22 m.
- **Trò chơi:** tàu đu biên độ tăng dần tới ~2,95 rad (khoảng 169°), rồi vượt đỉnh xoay trọn 2 vòng 360°, giảm dần về yên. Chạy tự động mỗi ~24 s nếu không có khách. Vé 25 💰; chờ ghi "5 phút".
- **Nhân vật:** nhân viên soát vé "… nhân viên soát vé"; khách bot ngồi trên tàu (nhiều người trong khoang).
- **Tương tác:** E tại bến ≈ (−122,1; 937,1), bán kính 5 m: "Vào chỗ ngồi Con Tàu Ma Ngọc Trai Đen (E)" (khi đứng trong bãi). Thông báo "Nhổ neo! Tàu đu cao dần rồi vượt đỉnh xoay 360°…".

### 43. 🎠 Khúc Nhạc Cung Đình (ngựa gỗ 2 tầng)
- **Nguồn:** `themeland2.js:268–291`.
- **Vị trí và kích thước:** tâm (−199,6; 935,4), bãi tròn bán kính 13,5 m. Mái vòm dát vàng cao ~12 m, sàn quay bán kính 9,6 (nền đá bán kính 10,6), trục giữa kính + tầng nhạc.
- **Trò chơi:** 36 ngựa gỗ (24 tầng dưới, 12 tầng trên), lên xuống nhịp nhàng, quay tối đa 0,5 rad/s; chạy 62 s mỗi lượt, bản nhạc 8 nốt lặp (C5–E5–G5–E5–D5–F5–A5–F5). Vé 15 💰; chờ ghi "3 phút".
- **Tương tác:** E tại ≈ (−193,5; 941,5), bán kính 6 m: "Vào chỗ ngồi Khúc Nhạc Cung Đình (E)"; "Nắm chắc cột vàng nhé!".

### 44. 🌤 Vũ Điệu Gió Trời (đu quay dây văng 60 m)
- **Nguồn:** `themeland2.js:293–316`.
- **Vị trí và kích thước:** tâm (−120,4; 1014,6), bãi tròn bán kính 13 m; tháp trung tâm cao 62 m (quả cầu vàng ở y ≈ 65,6), bàn xoay nâng lên 56 m; 16 ghế treo xích dài 8 m, bán kính ngoài 8,2 m.
- **Trò chơi:** tổng 92 s: nâng lên 22 s, giữ ~48 s văng nghiêng tới 45° (0,8 rad), hạ 22 s. Vé 25 💰; chờ ghi "5 phút".
- **Tương tác:** E tại ≈ (−126,3; 1008,7), bán kính 6 m: "Vào chỗ ngồi Vũ Điệu Gió Trời (E)"; "Bàn xoay nâng lên 56 m – dang tay đón gió nào!".

### 45. 🌀 Con Lắc Thần Sấm (đĩa bay 360°)
- **Nguồn:** `themeland2.js:318–341`.
- **Vị trí và kích thước:** tâm (−199,6; 1014,6), bãi tròn bán kính 14 m; trục ở y 26, cánh tay đòn 20,3 m, đĩa 24 ghế bán kính 4,3–4,75.
- **Trò chơi:** đĩa xoay tối đa ~15 vòng/phút (1,57 rad/s) và cánh tay quăng lên tới 120° (2,09 rad); lượt dài ~74,5 s. Vé 25 💰; chờ ghi "5 phút".
- **Tương tác:** E tại ≈ (−194,9; 1009,9), bán kính 5,5 m: "Vào chỗ ngồi Con Lắc Thần Sấm (E)"; "Khoá vai đã đóng – chân buông lơ lửng!".

### 46. Khu Lễ Hội và lối khu Nam
- **Nguồn:** `themeland2.js:37–43, 291`.
- **Vị trí và kích thước:** HUB lễ hội tâm (−160, 975) bán kính 16 (đĩa terrazzo); lối lát x −166…−154, z 896…962 nối đại lộ ngang z 884…896 xuống HUB; 4 trò Khu Lễ Hội (Mục 42–45) ở bốn góc quanh HUB: tây-bắc (−199,6; 935,4), đông-bắc (−120,4; 935,4), tây-nam (−199,6; 1014,6), đông-nam (−120,4; 1014,6). Đại lộ Phiêu Lưu x 208…220, z 634…884 (cột đèn x 207,2 mỗi 30 m, ghế băng x = 221). Đại lộ ngang z 884…896 từ x −210 đến 330 (đèn mỗi 26 m ở z 883,2). Hồ khủng long tâm (170,7; 1031) bán kính 13; hồ Atlantis (Mục 41).
- **Chức năng:** đường nối các trò khu Nam.

---

## PHẦN E. BIỂN SỐNG ĐỘNG (`js/sealife.js`)

### 47. Du thuyền "QC Ocean Pearl"
- **Nguồn:** `sealife.js:24–64`.
- **Vị trí và kích thước:** thân dài 24 m (từ −11 đến +13 theo trục mũi, mũi nhọn), rộng ≈ 6,2 m, 2 tầng + flybridge, boong gỗ teak. Tuyến đường khép kín qua 8 điểm: (−7, −92), (−18, −120), (25, −136), (75, −112), (110, −76), (96, −50), (55, −58), (18, −80), chiều dài ước tính ≈ 330 m. Điểm cập bến ở đầu tuyến (−7, −92), cầu tàu bên bờ ở x ≈ −1,6.
- **Bố trí và nội thất:** đệm tắm nắng ở mũi (3,6 × 3,6), sofa chữ U xanh dương + quầy bar teak ở đuôi, lan can chrome hai bên, cabin tầng 1 (kính) + tầng 2 + flybridge, cột radar; ghế người chơi ở đuôi (z cục bộ −9,2).
- **Chức năng:** đi 1 vòng vịnh ngắm cảnh.
- **Trò chơi:** vé 30 💰; đỗ bến 22 s; vận tốc tối đa 5,2 m/s (giảm tốc 30 m cuối, tối thiểu 0,6 m/s), gia tốc ≤ 0,6 m/s². 1 vòng ≈ 60–65 s (ước tính) theo nhãn "~1 phút".
- **Nhân vật (5):** 2 khách tắm nắng ở mũi ("☀️ Khách du thuyền", nằm ngửa, x ±0,8, z 8,4), 2 khách ngồi quầy đuôi ("🍹 Khách du thuyền" tại (1; −5,6) và (1,8; −5,4)), "⚓ Thuyền trưởng" (áo trắng, mũ lưỡi trai) ngồi trên flybridge tại (0,4; ?; −2,4).
- **Thoại tiêu biểu (thông báo khi đang ngồi trên tàu):** "Thuyền trưởng: 'Bên phải là Cao nguyên Bình Phan với thác nước 24 m!'" (ở quãng 60–80 m), "'Phía trước: Downtown QC City – nhìn lên sẽ thấy cáp treo bay qua vịnh.'" (140–160 m), "'Bên trái là đảo Master Dashboard – nơi mọi chuyện bắt đầu!'" (230–250 m); "Tàu rời bến!", "Đã cập bến – bấm E để xuống tàu, hoặc ngồi tiếp vòng sau.", "Cảm ơn quý khách đã đi du thuyền!".
- **Tương tác:** điểm E tại (−1,6; −92), bán kính 3 m, chỉ khi tàu đang cập bến (dwell > 0): "Lên du thuyền QC Ocean Pearl – vé 30 💰 (E)". Trên tàu: ngồi, camera lùi 12 m; khi cập bến, E để xuống ("Xuống tàu (E)"); đang chạy thì báo "Đang đi du thuyền… (cập bến mới xuống được)". Xuống tại (−1,4; −92).
- **Nhãn 3D:** "🛥️ Du thuyền QC Ocean Pearl – Vé 30 💰 · 1 vòng vịnh ~1 phút" tại (−7, 9, −92).
- **Kết nối:** Bến cảng (phía Bắc đảo chính). Dịch chuyển "Du thuyền QC Ocean Pearl" tới (−1,4; −84) nhìn về (−1,4; −95).

### 48. Người lướt ván
- **Nguồn:** `sealife.js:66–76`.
- **Vị trí:** 3 người "🏄 Người lướt ván", ván màu vàng/hồng/xanh lá, ở bờ Đông-Nam đảo chính (góc 0,6…1,2 rad từ gốc, tức x, z đều dương). Chu kỳ: lướt vào bờ 7 s (từ cách bờ 32 m vào 6 m), nằm sấp chèo ra 14 s (từ 6 m ra 32 m), lặp, góc bắt sóng đổi ngẫu nhiên.
- **Tương tác:** không có. Chỉ chạy khi người chơi cách gốc < 170 m.

### 49. Mô tô nước (vịnh phía Nam)
- **Nguồn:** `sealife.js:78–88`.
- **Vị trí:** 2 mô tô nước (đỏ, xanh dương) với 2 người ("🚤 Mô tô nước") chạy hình số 8 quanh (106, 52): x = 106 + 20·sin t, z = 52 + 11·sin 2t, t = 0,32·thời gian (một vòng ≈ 19,6 s), mỗi chiếc để lại vệt bọt 40 điểm. Chỉ cập nhật khi người chơi cách (106, 52) < 160 m.
- **Tương tác:** không có.

### 50. Ca nô kéo dù bay
- **Nguồn:** `sealife.js:90–101`.
- **Vị trí:** ca nô trắng chạy vòng elip quanh (−60, 190): x = −60 + 48·cos t, z = 190 + 38·sin t (t = 0,05·thời gian, một vòng ≈ 126 s); dù 6 múi màu bay cách sau 40 m ở độ cao ≈ 26 m (dao động ±2 m), dây trắng nối; 1 người "🪂 Người chơi dù bay" treo dưới dù. Chỉ cập nhật khi người chơi cách (−60, 190) < 200 m.
- **Tương tác:** không có.

---

## BẢNG TÓM TẮT

Ghi chú cột: "rộng×sâu" tính theo trục x × trục z; ô trống "chưa rõ" nghĩa là phụ thuộc file ngoài phạm vi.

| Không gian | x0–x1 | z0–z1 | rộng×sâu | chức năng |
|---|---|---|---|---|
| 1. Nền Khu Giải trí + đại lộ z=0 | chưa rõ (`CITY.arena`); ≥ 279…~395 | chưa rõ; ≥ −59…~58 | chưa rõ | nền khu, đường chính (rộng 10 m) |
| 2. Cầu Downtown → Khu Giải trí | `downtown.x1` … AX0 (chưa rõ) | −5…5 | (AX0−x1) × 10 | nối Downtown với khu |
| 3. Cổng chào QC FUN PARK | tâm AX0+4 | −7,2…7,2 | ~1×15,4 (cao 9–10 m) | cổng vào |
| 4. Sân bóng QC Arena (tường ngoài) | 300…368 | −59…−10 | 68×49 | trận QC FC vs Bug United, vé 20 💰 |
| 4a. Sân cỏ | 312…356 | −47…−19 | 44×28 | sân thi đấu |
| 4b. Khán đài (Bắc/Tây/Đông/Nam) | 302…366 | −57…−12 | 7 bậc ×3 phía + 3 bậc Nam | chỗ ngồi, ~700 CĐV |
| 4c. Quầy vé + cổng sân bóng | 331,4…336,6 (cổng) | −10 (cổng), E tại −7,8 | cổng 5,2 | mua vé 20 💰 |
| 5. QC Live Arena (sân khấu) | 383,5…392,5 | 21…45 | 9×24 | concert 3 phút/nghỉ 1 phút |
| 5a. Khu sát sân khấu (pit) | 359…383 | 15…53 | 24×38 | khu VIP, vé 30 💰 |
| 6. Rạp QC Cinema | 279…315 | 10…34 | 36×24 | chiếu phim, vé 15 💰 |
| 7. Phố ẩm thực (4 quầy + bàn) | 279…322 | ~43…~55 | 43×~12 | ăn uống nhận buff |
| 8. Vòng quay QC Eye | ~316…346 (tâm 331) | ~38,7…41,3 (tâm 40) | đường kính 30 | ngắm toàn cảnh, vé 15 💰 |
| 9. Địa hình Cao nguyên | 88…332 | −342…−100 | 244×242 | núi, sông, rừng |
| 10. Cầu Downtown → Cao nguyên | 173…183 | `downtown.z0`…~−113 | 10×(chưa rõ) | đường vào Cao nguyên |
| 11. Phố cổ Riverside | 150…256 | −182…−108 | 106×74 | nhà màu, đèn lồng, phố đi bộ |
| 12. Hai cầu gỗ | 184…196 | −131 / −158 (±1,6) | 12×3,2 mỗi cầu | qua sông |
| 13. Chợ đêm ven sông | ~197,5…199,7 | −172,7…−135,3 | 5 sạp 2,2×3,4 | trang trí chợ đêm |
| 14. Thác Móng Ngựa | ~190…241 | ~−313…−229 | rộng 52, cao 24 | thác nước, hồ trên/dưới |
| 15. Lối dạo lên thác | 203,5…281 | −248…−178 | rộng 2,4–2,8 | lối dốc từ phố cổ |
| 16. Đài ngắm Chân Thác | ~237…256 | ~−249…−229 | sân 14×16 + sàn gỗ 6,8×14 | ngắm thác từ chân |
| 17. 100 bậc đá | 248…278 | −255…−248 | 3,6 rộng, 100 bậc | lên đỉnh thác |
| 18. Đài ngắm Đỉnh Thác | ~247…259 | ~−272…−256 | 15×13,5 | ngắm thác từ đỉnh |
| 19. Chòi ngắm cảnh | tâm 296 (±3,6) | tâm −306 (±3,6) | ~7×7, cao 63 m | ảnh toàn cảnh (E) |
| 20. Rừng | trong 88…332 | trong −342…−100 | ~2.100 cây | cảnh quan |
| 21. Đảo QC Wonderland | −10…132 | 222…362 | 142×140 | đảo giải trí |
| 22. Cáp treo (ga + trụ) | SB (54, 239) … SA (chưa rõ) | 239 … SA | ~170 m, trụ cao 48 | cáp treo 15 💰/chiều |
| 23. Cổng lâu đài + đu quay ngựa | 52…62 (cổng); tâm 61 | 251 (cổng); tâm 291 | cổng 10; đu quay Ø12 | trang trí/trung tâm đảo |
| 24. Tàu lượn Siêu Bug | 13…58 | 258…322 | ~45×64 | tàu lượn 25 💰 |
| 25. Tháp rơi tự do | tâm 100 (Ø 9,4) | tâm 300 | cao 60 | rơi tự do 25 💰 |
| 26. Thuyền hải tặc | ~87,5…96,5 | ~258,6…265,4 | ~9×7 (cao 13) | đu 75°, 20 💰 |
| 27. Nhà ma Bug | 73…97 | 322…338 | 24×16 | đi xe xuyên nhà ma, 20 💰 |
| 28. Quầy kem + khách bot | tâm 51 | tâm 277 | 3×1,6 | mua kem 15 💰 |
| 29. Địa hình Công viên Kỳ Quan | −270…363 (lưới) | 372…1242 | 633×870 | nền công viên chủ đề |
| 30. Cầu đá vào + Cổng chính | 35,8…44,2 (cầu); 25…55 (cổng) | 337…395,5 (cầu); 399…405 (cổng) | cầu 8,4×58,5; cổng ~54×6 | lối vào công viên |
| 31. Đại lộ Ánh Sao + 8 quầy | 27…53 | 414…508 | 26×94 | đại lộ, 8 quầy ăn, 4 nhà phố |
| 32. Quảng trường trung tâm HUB | 19…61 (tâm 40, r 21) | 505…547 | Ø42 | nút phân phối tới các trò |
| 33. Hồ Pha Lê + đảo giữa hồ | −60…140 | 562…678 | 200×116 | hồ cảnh quan, đài phun nhạc, vọng lâu |
| 34. Thần Long Cuồng Nộ | ray −74…171; ga 20…58 | ray 657…782; ga z=712 | ga 38 m | tàu lượn rồng, 35 💰 |
| 35. Tia Chớp Không Gian | ray 90…319; ga 100…130 | ray 520…798; ga z=536 | ga 30 m | tàu lượn phóng, 35 💰 |
| 36. Song Dực Đại Bàng | −234…−84 | 537…703 (2 đường) | ~150×166 | tàu treo đua đôi, 35 💰 |
| 37. Tháp Sấm Sét QC | −64…−20 (tâm −52) | 526…550 (tâm 538) | Ø17,4 (cao 82) | rơi 80 m, 30 💰 |
| 38. Mắt Thần QC World | 169,4…174,6 (vòng); sân 164…170 | 575…665 (vòng); sân 610…630 | Ø90 | vòng quay 90 m, 25 💰 |
| 39. Kỷ Jura Tuyệt Diệt | 151…315 | 914…1066 | ~164×152 | tàu thám hiểm xuyên núi, 35 💰 |
| 40. Lời Nguyền Hầm Mỏ Dung Nham | −55…99 | 916…1088 | ~154×172 | xe goòng quanh núi lửa, 35 💰 |
| 41. Đền Thờ Atlantis Chìm Đắm | 97…321 | 1108…1150 | ~224×42 | chiến thuyền đáy biển, 35 💰 |
| 42. Con Tàu Ma Ngọc Trai Đen | −137,4…−103,4 | 918,4…952,4 | Ø34 | xoay 360°, 25 💰 |
| 43. Khúc Nhạc Cung Đình | −213,1…−186,1 | 921,9…948,9 | Ø27 | ngựa gỗ 2 tầng, 15 💰 |
| 44. Vũ Điệu Gió Trời | −133,4…−107,4 | 1001,6…1027,6 | Ø26 | đu quay dây văng 56 m, 25 💰 |
| 45. Con Lắc Thần Sấm | −213,6…−185,6 | 1000,6…1028,6 | Ø28 | đĩa bay 120°, 25 💰 |
| 46. Khu Lễ Hội + lối khu Nam | −210…330 (đại lộ ngang); 208…220 (Phiêu Lưu) | 884…896; 634…884 | đại lộ ngang 540×12 | đường nối các trò khu Nam |
| 47. Du thuyền QC Ocean Pearl | tuyến −18…110 | tuyến −136…−50 | thân 24×6,2; tuyến ~330 m | 1 vòng vịnh, 30 💰 |
| 48. Người lướt ván (3) | quanh bờ Đông-Nam đảo chính | — | — | cảnh sống động |
| 49. Mô tô nước (2) | 86…126 (tâm 106) | 41…63 (tâm 52) | 40×22 | cảnh sống động |
| 50. Ca nô kéo dù bay | −108…−12 (tâm −60) | 152…228 (tâm 190) | elip 96×76 | cảnh sống động |

### Phụ lục. Những điểm mã không nêu rõ (cần Bình/nhóm xác nhận khi thiết kế lại)

1. `CITY.arena` (x0, x1, z0, z1) và `CITY.downtown` (x1, z0): định nghĩa ở ngoài phạm vi; ảnh hưởng độ dài hai cầu nối và biên Khu Giải trí.
2. `edgeR` (bán kính bờ đảo chính theo góc): quyết định vị trí chính xác của ga cáp treo phía đảo chính (SA).
3. `W.addSeat`, `W.addBench`, phím F (nhảy concert), phím C (ngồi/đứng): chỉ biết lời gọi; hành vi chi tiết nằm ngoài phạm vi.
4. Khu xếp hàng và vùng cổng của Song Dực Đại Bàng, vị trí nhân viên vận hành Mắt Thần: mã không nói rõ ngoài các hộp chặn đã nêu.
5. Số cổ động viên/khán giả: lấy theo chú thích đầu file (khoảng 700 sân bóng, 350 concert), mã không đếm lại.
6. Các thời gian lượt trò chơi "ước tính" ở Mục 34–41 là kết quả mô phỏng của người viết tài liệu theo `physStep`, không phải hằng số trong mã.

---

<a id="phần-6"></a>

## 06 · Đảo Ngoại ngữ và Bản đồ đất toàn thế giới (hiện trạng theo mã nguồn)

Tài liệu mô tả hiện trạng, lấy từ mã nguồn, không phải thiết kế mới. Nguồn đọc: `js/langcenter.js` (LC, 304 dòng), `js/langui.js` (UI, 954 dòng), `data/lang_index.json`, `LAND_CLAIMS.md`, và các khối đất trong `world.html`, `js/funisland.js`, `js/highland.js`, `js/hills.js`, `js/themepark.js`, `js/transit.js`, `js/downtown.js`, `js/arena.js`, `js/resort.js`.

**Quy ước:** 1 ô = 1 m = 1 đơn vị toạ độ. x: Đông (+) – Tây (−). z: Nam (+) – Bắc (−). y: độ cao (mặt biển `WATER_Y = −0,35`). Góc cực của đảo chính: 0 = Đông, π/2 = Nam, π = Tây, −π/2 = Bắc (`world.html:224`).
Ghi chú "≈" là số tính từ công thức hoặc ước lượng. "chưa rõ" là mã không cho biết chắc.

---

### PHẦN A. ĐẢO NGOẠI NGỮ (`js/langcenter.js`)

#### A0. Tổng quan và cách nạp

- Module `make(W, ctx)` được nạp bởi `js/life.js:769` (danh sách `['lang','./langcenter.js']`), trả về `W.lang = {open, due, pickTrack}` (LC:275).
- Đất đăng ký: `EXTL.push({x0:-360, x1:-162, z0:-120, z1:98, name:'Đảo Ngoại ngữ'})` (LC:41). Hộp khai báo `LAND = x −360…−160, z −120…100` (LC:27), x1 và z1 trừ `RES = 2` m. Lưới độ cao 2 m (101 × 111 điểm), nội suy 2 tam giác.
- Hằng số hình học (LC:27): tâm `CX = −262`, `CZ = −12`; nửa rộng `HX = 92`, nửa sâu `HZ = 102`; trục cầu và đại lộ `ZB = −16`; vùng phẳng campus `CAMP = {hx:66, hz:76}`; cao độ nền campus `G0 = 1,3`.
- Vùng `region` của đảo = `'open'` (thuộc thế giới mở, `regionAt` ở `world.html:283`).
- Chưa có nút taxi, xe bot hay bus tới đảo. `grep TAXI_DEST` chỉ thấy Cao nguyên. Đảo chỉ tới được bằng cầu vòm hoặc teleport trong bản đồ M.
- Ứng dụng học `langui.js` chỉ được `import()` khi mở lần đầu (LC:270). Khi mở, `renderer.render` bị chặn (`W.langOpen`) để đỡ tốn GPU (LC:277).

#### A1. Đảo Ngoại ngữ (địa hình + lát đường)

- **Tên:** Địa hình Đảo Ngoại ngữ. LC:27–56.
- **Vị trí và kích thước:** hộp EXTL x −360…−162, z −120…98 (200 × 218 ô). Đất thật là hình siêu elip tâm (−262, −12), bán trục 92 (x) × 102 (z) cộng nhiễu ±4,5 (LC:28), nên mép đất nhỏ hơn hộp: x ≈ −354…−170, z ≈ −114…90.
- **Cao độ:**
  - Vùng phẳng campus (|x+262| ≤ 66, |z+12| ≤ 76, tức x −328…−196, z −88…64) cao `G0 = 1,3`.
  - Ngoài vùng phẳng, đất nhô dần bằng fbm, tối đa ≈ +12 m. Riêng dải phía Đông (dx > 30 và |z−ZB| < 36) giữ phẳng.
  - Đoạn x > −204 và |z−ZB| < 10 là dốc thoai thoải từ 0,3 (đầu cầu) lên 1,3 (campus, hết ở x = −202).
  - Bãi cát ở mép (m < 9) hạ về 0,22. Ra ngoài mép (m < 0) tụt xuống −0,5…−6,5.
- **Bố trí và nội thất (lát đá, LC:44–46):**
  - Đại lộ: z = ZB ± 4,5 (−20,5…−11,5), x −282…−176.
  - Quảng trường tròn tâm (−226, −16) bán kính 17.
  - Trục Bắc–Nam x = −226 ± 3, z −72…40.
  - Nhánh x = −257 ± 2,6, z −52…20 (dẫn tới English House và Hán Học Đường).
  - Hai đường ngang: z = −68 ± 2,4 (x −312…−212) và z = 30 ± 2,4 (x −300…−212).
- **Chức năng:** nền đất cho toàn campus. Màu cỏ pha xanh theo fbm, đá lát xám, cát ở mép.
- **Nhân vật:** xem A16.
- **Tương tác:** toast chào mừng một lần khi người chơi vào hộp x −360…−165, z −120…100 (LC:301). Nội dung nhắc số bài đến hạn nếu có.
- **Kết nối:** cầu vòm ở bờ Đông (A2). Bờ còn lại là biển.

#### A2. Cầu vòm (bờ Tây đảo chính → Đảo Ngoại ngữ)

- **Tên:** Cầu vòm 115 m (tên bản đồ "Cầu Đảo Ngoại ngữ"). LC:65–90.
- **Vị trí và kích thước:**
  - Trục z = −16, rộng `BW = 9` (z −20,5…−11,5).
  - Đầu Đông `XS` được tính lúc chạy: quét x từ −48 về Tây đến chỗ `groundH < −0,2` rồi + 1,5. Giá trị mặc định −62. Comment ghi dài 115 m nên `XS ≈ −65`, **chưa rõ giá trị chính xác**.
  - Đầu Tây `XE = −180`. Dài `BL = XS − XE`.
  - 14 đoạn mặt cầu, cao mặt 0,2 → 0,75 (đỉnh giữa cầu) → 0,2 (`hy = 0,2 + 0,55·sin`).
- **Bố trí và nội thất:**
  - Mặt cầu xám dày 0,55 m, thảm nhựa rộng `BW − 1,6`, lề đá hai bên.
  - Lan can thép: 2 thanh (cao 1,45 và 0,95), cột đứng cách 2,4 m. Hộp va chạm dọc z = −16 ± 4,45 từ XE+0,5 đến XS−0,5.
  - 2 vòm thép trắng (mỗi bên 1), cao tối đa 15 m, kéo từ x = XS−18 đến XE+18, có dây treo cách 2 đoạn.
  - Trụ cầu (cylinder cao 6 m, đáy y ≈ −3,2) cách 12 m, 2 trụ mỗi hàng (z = −16 ± 3,2), bắt đầu từ XS−10 đến XE+6.
  - Đèn đường `lampPost` cách 16 m, 2 bên (z = −16 ± 4,85), từ XS−8 đến XE+4. Khoảng 7 hàng, **số chính xác chưa rõ vì phụ thuộc XS**.
  - Nền đi được: `addPlat` mỗi đoạn (độ cao theo `hy`).
- **Chức năng:** đường duy nhất từ đảo chính sang đảo ngoại ngữ.
- **Nhân vật:** không có.
- **Tương tác:** `INTER` (XS−2, −13) bán kính 2, prio 0,6: "Đảo Ngoại ngữ – xem lộ trình học (E)" mở Sảnh app (LC:286). `PLACES` "Cầu Đảo Ngoại ngữ": teleport tới (XS+4, −16) hướng nhìn (XS−20, −16) (LC:288).
- **Kết nối:** bờ Tây đảo chính (khoảng x −62…−65, z −16) ⇄ đầu Tây (−180, −16) chạm dốc lên campus. 2 cổng chào (A3, A4).

#### A3. Cổng chào đầu Đông cầu (phía đảo chính)

- **Tên:** Cổng chào "ĐẢO NGOẠI NGỮ · LANGUAGE ISLAND · 语言岛". LC:85–90, `gate(XS+1,2)`.
- **Vị trí và kích thước:** x = XS+1,2 (≈ −64). 2 cột navy 0,9 × 7,2 × 0,9 tại z = −16 ± 5,4. Xà ngang 1,2 × 1,4 × 11,8, tâm cao 7,6 m. Cổng thông thoáng 10,8 m.
- **Bố trí:** bảng hai mặt 10,8 × 1,7, nền xanh '#16324f', dòng 1 trắng "🗣️ ĐẢO NGOẠI NGỮ · LANGUAGE ISLAND · 语言岛", dòng 2 vàng "Học miễn phí: Tiếng Anh 0 → IELTS 8.0+ · Tiếng Trung 0 → HSK 7–9". Cột có va chạm tròn r = 0,65.
- **Chức năng:** biển báo, dẫn vào đảo. Không có nhân vật. Không có tương tác riêng.
- **Kết nối:** nằm ở đầu cầu phía đảo chính.

#### A4. Cổng chào đầu Tây cầu (phía đảo ngoại ngữ)

- **Tên:** Cổng chào thứ 2, `gate(XE−3)`, x = −183. LC:90.
- **Kích thước, bố trí, chức năng:** giống A3 (cùng bảng chữ, xà cao 7,6 m, cột z = −16 ± 5,4).
- **Kết nối:** cuối cầu, trước dốc vào campus.

#### A5. Toà Trung tâm Ngoại ngữ (khối chính)

- **Tên:** Toà Trung tâm Ngoại ngữ QC (mặt kính). LC:112–116.
- **Vị trí và kích thước (`MB`):**
  - Tháp chính: x −316…−290 (26 ô), z −46…14 (60 ô), cao 24 m (khối kính 'glassFx').
  - 2 cánh phụ phía Đông: x −290…−276 (14 ô). Cánh Bắc z −46…−32 (14 ô). Cánh Nam z 0…14 (14 ô). Cao 15 m.
  - Giữa 2 cánh là sảnh (A6), z −32…0.
  - Nền G0 = 1,3. **Số tầng: chưa rõ** (không có dữ liệu tầng; khối là hộp kín dán texture cửa sổ 4 × 4).
- **Bố trí và nội thất:** các khối là hộp đặc có va chạm (boxes): tháp x −316…−289,8; cánh Bắc x −290…−276, z −46…−31,8; cánh Nam z −0,2…14. **Không đi vào bên trong tháp và cánh được**, chỉ sảnh đi vào được.
- **Chức năng:** trụ sở trung tâm ngoại ngữ, bề mặt biển hiệu.
- **Nhân vật:** xem A16 (Cô Linh).
- **Tương tác:** qua sảnh và quầy.
- **Kết nối:** cửa kính sảnh mở ra phía Đông (x −276). Biển lớn "TRUNG TÂM NGOẠI NGỮ QC / ENGLISH · 中文 · HỌC MIỄN PHÍ" (26 × 3,8 m, tâm y = G0+20,5) dán mặt Đông tháp tại x ≈ −289,9, sáng thêm ban đêm (NIGHT).

#### A6. Sảnh tư vấn (Lobby) – vào đi bộ được

- **Tên:** Sảnh kính "SẢNH TƯ VẤN · LOBBY · 大厅". LC:117–150.
- **Vị trí và kích thước:** x −290…−276 (14 ô) × z −32…0 (32 ô), tường cao `HH = 9`. Sàn cao G0+0,12 ≈ 1,42 (tấm trắng ngà dày 0,12, có `addPlat`). Trần: tấm tối dày 0,5 ở cao G0+9 (rộng hơn 1,2 × 1). 1 tầng cao 9 m (thông thuỷ).
- **Bố trí và nội thất:**
  - Mặt Đông (x = −276) là tường kính: 2 mảng kính cao 9 m ở z −32…−18,2 và −13,8…0, chừa cửa rộng 4,4 m (z −18,2…−13,8) ở giữa. Phía trên cửa có kính cao (từ cao 3,4 m lên 9 m). Có 9 khung thép đứng cách 4 m. Hộp va chạm theo 2 mảng kính.
  - Mái hiên cửa: tấm trắng 3,6 × 0,3 × 7,5 tại x ≈ −274,2, cao G0+4; 2 cột thép cao 4 m ở x ≈ −272,7, z = −16 ± 3,4.
  - Vòng sáng vàng nhấp nháy ở sàn tại (−272,5, −16), bán kính 1,1–1,45 (đánh dấu điểm tương tác E).
  - Quầy tư vấn: hộp trắng 1,3 × 1,1 × 6 tại (−284, −16), mặt quầy vàng 1,5 × 0,08 × 6,3. Va chạm x −284,75…−283,25, z −19,1…−12,9.
  - 2 sofa navy: ghế 2,2 × 0,5 × 0,9 + lưng 2,2 × 0,6 × 0,25, tại (−280,5, −22,5) và (−280,5, −9,5).
  - 2 chậu cây: thân gỗ + tán xanh tại (−278, −25) và (−278, −7), va chạm r = 0,45.
  - 2 kệ sách gỗ (0,5 × 2,4 × 3,2, 4 tầng sách) tại x = −289,5, z = −23,6 và −8,4.
  - Màn hình lộ trình 9 × 4,5 m tại x = −289,9 (tường Tây sảnh), cao G0+4,4, lập thành "LỘ TRÌNH HỌC MIỄN PHÍ". Nội dung: EN 0 → A1 → A2 → B1 → B2 → IELTS 7.5 → 8.0+; 中文 0 → HSK1 … HSK 7–9; "bài đánh số · bài tập tự chấm · thi cuối cấp · thi thử · ôn tập ngắt quãng"; "Bấm E ở quầy tư vấn để bắt đầu học".
  - Biển "🗣️ SẢNH TƯ VẤN · LOBBY · 大厅" 9 × 1,4 gắn trên cửa mặt Đông (x −275,9, cao G0+7,8).
- **Chức năng:** điểm vào học. Khi người chơi ở trong sảnh (p.x −290…−276, p.z −32…0, p.y < G0+9) và không đang ở `W.inside`, hệ thống đặt `HOOK.camBox` (hộp giới hạn camera) để camera không xuyên tường (LC:149).
- **Nhân vật:** Cô Linh (A16).
- **Tương tác:** hai điểm E (LC:279–280):
  - (−282,2, −16) r 2,3, prio 0,95: "🗣️ Quầy tư vấn – Trung tâm Ngoại ngữ (E)" → mở app, trang Sảnh.
  - (−272,5, −16) r 1,7, prio 0,9: "🗣️ Trung tâm Ngoại ngữ – vào học (E)" → cùng trang Sảnh.
  - Chưa có giá tiền, học miễn phí. Phần thưởng nằm trong app (xem Phần C).
- **Kết nối:** cửa giữa mặt Đông dẫn ra đại lộ z = −16 và quảng trường.

#### A7. Quầy tư vấn (nằm trong A6)

Mô tả đầy đủ ở A6 (không có không gian riêng). Điểm E: (−282,2, −16). Nhân vật đứng sau quầy: Cô Linh ở (−286,2, −15,2), quay mặt về hướng Đông (π/2).

#### A8. Phòng học kính Bắc (trong sảnh)

- **Tên:** Phòng học kính tiếng Anh (bảng "Lesson 1: Hello!").
- **Vị trí và kích thước:** tâm z = −28,2 (`cz = ZB − 12,2`). x −289,6…−282, z ≈ −31,5…−24,9 (7,6 × 6,6 ô). Kính cao 3 m. 1 tầng.
- **Bố trí và nội thất:**
  - Tường kính phía Đông x = −282 (z −31,5…−24,9) và tường kính phía Nam z = −24,9 (x −289,6…−282); hộp va chạm tương ứng. Lối vào là phần hở phía góc Đông – Nam chưa rõ chính xác (mã chỉ dựng 2 tường kính, **chưa rõ có cửa không**).
  - 6 bộ bàn ghế: 2 hàng × 3 cột. Hàng x = −288,6 và −286,0, z = cz−2, cz, cz+2 (−30,2; −28,2; −26,2). Mỗi bộ gồm bàn trắng 1 × 0,06 × 1,4, chân thép, ghế xanh 0,45³ ở x+0,7. Va chạm 1 hộp x −289,3…−284,8, z cz ± 2,9.
  - Bảng trắng 3 × 1,5 gắn tường Tây (x = −289,55, cao G0+1,8), chữ "Lesson 1: Hello! / I'm Lan. I'm from Hanoi. / /aɪm/ /ʃiːz/ /ɪts/".
- **Chức năng:** trang trí / bối cảnh lớp tiếng Anh. Không có tương tác riêng.
- **Nhân vật:** không có.
- **Kết nối:** thông với sảnh qua phía Đông – Nam.

#### A9. Phòng học kính Nam (trong sảnh)

- **Tên:** Phòng học kính tiếng Trung (bảng "第一课 你好！").
- **Vị trí và kích thước:** tâm z = −3,8 (`ZB + 12,2`). x −289,6…−282, z ≈ −7,1…−0,5 (7,6 × 6,6 ô). Kính cao 3 m. 1 tầng.
- **Bố trí và nội thất:** đối xứng với A8: 6 bộ bàn ghế ở x −288,6 và −286, z = −5,8; −3,8; −1,8. Tường kính Đông x = −282 và tường kính phía Bắc z = −7,1. Bảng trắng tại (x −289,55, z −3,8) với "第一课 你好！ / Nǐ hǎo! Wǒ jiào Xiǎo Lán. / nǐ hǎo → ní hǎo".
- **Chức năng, nhân vật, tương tác, kết nối:** như A8.

#### A10. English House

- **Tên:** English House (gạch đỏ, mái dốc, tháp đồng hồ). LC:152–165.
- **Vị trí và kích thước (`EH`):** tâm (−257, −60), rộng 26 (x −270…−244) × sâu 16 (z −68…−52), thân cao 9 m. Mái hình lăng trụ tam giác bằng cylinder 3 cạnh, tâm cao +2,2 so với đỉnh tường, nâu sẫm. Tháp đồng hồ hộp trắng ngà 5 × 18 × 5 tại (−257, −54,5), kèm chóp nón cao 4,5 ở cao ≈ +20,2. 1 tầng (thân hộp kín). Nền G0.
- **Bố trí và nội thất:**
  - Mặt tiền ở phía Nam (z = −52). Cửa gỗ 3 × 3,4 tại z ≈ −51,9 chỉ là hình ảnh, mái che nhỏ trên cửa, biển "ENGLISH HOUSE / Tiếng Anh · 0 → IELTS 8.0+" (8 × 1,4, cao +5).
  - Đồng hồ tròn bán kính 1,7 tại (−257, cao +15,5, z −51,98) có kim giờ phút chạy theo giờ máy thật.
  - Khối đặc, có va chạm (`boxes`) x −270…−244, z −68…−52. **Không vào trong được; không có nội thất trong nhà.**
- **Chức năng:** cổng vào lộ trình tiếng Anh.
- **Nhân vật:** Mr. Tom (A16).
- **Tương tác:** E tại (−257, −50,4) r 2,2, prio 0,9: "🇬🇧 English House – lộ trình Tiếng Anh (E)" → mở app, trang `track` EN (LC:281). Miễn phí.
- **Kết nối:** đường x = −257 ± 2,6 (z −52…20) nối lên quảng trường; cạnh Bắc giáp đường ngang z = −68.

#### A11. Hán Học Đường 汉学堂

- **Tên:** Hán Học Đường (bệ đá, cột đỏ, mái cong 2 tầng). LC:167–183.
- **Vị trí và kích thước (`HH`):** tâm (−257, 28), rộng 24 (x −269…−245) × sâu 15 (z 20,5…35,5). Bệ đá 28 × 19 (x −271…−243, z 18,5…37,5) cao 1,1 m. Tường thân cao 6 m trên bệ (22 × 13 chiếm nội). Tầng mái 1 cao đỉnh ≈ +8,9 so với bệ, tầng mái 2 và xà vàng cao ≈ +13,95. 2 tầng mái (1 tầng sử dụng).
- **Bố trí và nội thất:**
  - 14 cột đỏ (7 cột × 2 mặt Bắc – Nam), cao 6,2 m, bán kính 0,32–0,36.
  - Tường có hoạ tiết cửa sổ song gỗ (canvas), 2 mái hip đỏ – xám, 4 sừng mái, 4 lồng đèn đỏ (ở 4 góc, cao +5,6 trên bệ, có `W.GLOW` phát sáng cam đỏ, bán kính 2,2).
  - Bảng hiệu "汉 学 堂 / HÁN HỌC ĐƯỜNG · Tiếng Trung 0 → HSK 7–9" (7 × 2,05) ở mặt Bắc (z ≈ 21), quay π.
  - 3 bậc đá phía trước (rộng 6) vẽ bên mặt Bắc (z ≈ 18). Hộp va chạm cả bệ x −271…−243, z 17,95…37 (gồm bậc).
  - **Không vào trong được, không có nội thất trong.**
- **Chức năng:** cổng vào lộ trình tiếng Trung.
- **Nhân vật:** 王老师 (A16).
- **Tương tác:** E tại (−257, 17,1) r 2,4, prio 0,9: "🀄 Hán Học Đường – lộ trình Tiếng Trung (E)" → app `track` ZH (LC:282).
- **Kết nối:** mặt chính hướng Bắc, nối đường x = −257 ± 2,6 và đường ngang z = 30 (x −300…−212).

#### A12. Sân khấu CLB Giao tiếp (Speaking Club)

- **Tên:** Sân khấu CLB Giao tiếp, khán đài bán nguyệt. LC:185–195.
- **Vị trí và kích thước (`AM`):** tâm (−222, −68). Sân khấu tròn gỗ bán kính 4,2–4,4, cao 0,6. Khán đài 4 hàng bậc bán nguyệt nằm phía Nam (z > −68), bán kính trong 6,5, ngoài 12,9, mỗi hàng dày 1,6 m, cao dần 0,45 → 1,8 m, xen màu kem / đá.
- **Bố trí và nội thất:**
  - Phông nền navy 9 × 5 × 0,3 tại z = −72,6, cao tâm +3. Bảng "🎭 SPEAKING CLUB / CLB GIAO TIẾP · 口语俱乐部 / Nghe – trả lời – nhập vai – nói theo" 8,6 × 4,3 gắn phía trước phông (z = −72,5).
  - Rào va chạm tròn (r 0,75 mỗi điểm): vành ngoài bán kính 13,3 (37 điểm), vành trong 6,2 (17 điểm), 2 đầu (z = −67,7). Khán đài bị rào kín, **không bước lên được**.
- **Chức năng:** nhập vai hội thoại, kiểm tra nghe.
- **Nhân vật:** không có người cố định (Ngọc Anh nói về CLB ở quảng trường, A16).
- **Tương tác:** E tại (−222, −53,2) r 2,4, prio 0,9 (phía Nam khán đài): "🎭 CLB Giao tiếp – hội thoại nhập vai, kiểm tra nghe (E)". Hiện hộp chọn ngôn ngữ (🇬🇧 Tiếng Anh / 🀄 Tiếng Trung) rồi mở app `talks` (LC:283, 272).
- **Kết nối:** gần đường ngang z = −68 (x −312…−212) và trục x = −226.

#### A13. Phòng thi IELTS · HSK (Exam Hall)

- **Tên:** Phòng thi "📝 PHÒNG THI · EXAM HALL · 考场". LC:197–201.
- **Vị trí và kích thước (`EX`):** tâm (−222, 34), rộng 22 (x −233…−211) × sâu 14 (z 27…41), cao 8 m (kính). 1 tầng. Hộp kín có va chạm, không vào trong.
- **Bố trí và nội thất:** hiên nhỏ trắng 6 × 0,3 × 2,4 (z ≈ 25,9, cao +3,6). Bảng 10 × 1,95 nền tím '#3a1c5c' (cao +6, z ≈ 26,9, hướng Bắc): "Thi thử IELTS · HSK tự soạn".
- **Chức năng:** thi thử.
- **Nhân vật:** không có.
- **Tương tác:** E tại (−222, 25,2) r 2,2, prio 0,9: "📝 Phòng thi – thi thử IELTS / HSK (E)". Chọn ngôn ngữ rồi mở app `mocks` (LC:284).
- **Kết nối:** mặt chính hướng Bắc, nhìn ra quảng trường; đường z = 30 phía Nam.

#### A14. Thư viện (Library)

- **Tên:** Thư viện "📖 THƯ VIỆN · LIBRARY · 图书馆". LC:203–209.
- **Vị trí và kích thước (`LB`):** tâm (−300, −74), rộng 22 (x −311…−289) × sâu 12 (z −80…−68), thân cao 7 m kem. Mái bằng trắng dày 0,8 (cao ≈ +7,4) nhô ra phía trước. Thềm: bậc đá 23 × 0,5 × 4,2 (z −68,1…−63,9) cao +0,5, có `addPlat` đi lên được. 1 tầng.
- **Bố trí và nội thất:** 6 cột cổ điển trắng (bán kính 0,35–0,4, cao 6,6) ở z = −65,4. Bảng "📖 THƯ VIỆN… / Sổ tay chuyên đề · tra cứu chuyên sâu" 9 × 1,6 (cao +6,2, z ≈ −61,9). Va chạm hộp x −311…−289, z −80…−65,4. **Không vào trong được.** Ghi chú: biến `ped` (đầu hồi tam giác) được tạo nhưng không được thêm vào Kit, nên chưa có đầu hồi.
- **Chức năng:** sổ tay chuyên đề (giáo viên, tra cứu).
- **Nhân vật:** không có.
- **Tương tác:** E tại (−300, −63,4) r 2,4, prio 0,9: "📖 Thư viện – sổ tay chuyên đề (E)". Chọn ngôn ngữ rồi mở app `guide` (LC:285).
- **Kết nối:** thềm hướng Nam, giáp đường z = −68 (x −312…−212).

#### A15. Quảng trường trung tâm + Bảng ôn tập + đường dạo

- **Tên:** Quảng trường (đài phun nước, cột cờ, bảng ôn tập), đại lộ ghế đá. LC:211–231.
- **Vị trí và kích thước:** tâm (−226, −16), bán kính lát đá 17.
- **Bố trí và nội thất:**
  - Đài phun: bồn tròn bán kính 5,4–5,6, cao 0,7, mặt nước bán kính 4,8, cột giữa cao 2,4 và quả cầu vàng bán kính 0,9. Va chạm tròn r 5,6.
  - 4 cột cờ cao 9 m ở bán kính 12 quanh tâm, góc 45° / 135° / 225° / 315°: (−217,5, −7,5), (−234,5, −7,5), (−234,5, −24,5), (−217,5, −24,5). Cờ 2,4 × 1,5, nhãn lần lượt "EN" xanh dương, "中" đỏ, "QC" navy, "VN" xanh lá.
  - Bảng ôn tập: khung gỗ (2 cột 3,4 m) tại (−218, −26), mặt 3,4 × 2,1 cao +2,2 y. Canvas "sống" 512 × 320: tiêu đề "📌 BẢNG ÔN TẬP", dòng "Bài đến hạn kiểm tra lại:", số "EN n · 中 m" (đỏ) hoặc "Không có 👍" (xanh); cập nhật mỗi 8 giây khi người chơi cách bảng < 70 m (x và z). Số liệu lấy từ `localStorage['qcworld-lang'].rev`.
  - Đại lộ z = −16: đèn đường tại z = −16 ± 5,6, ghế đá gỗ + 2 chân đá tại (x+5, z = −16 ± 6,2), x = −186, −198, −246, −258 (bỏ các x cách tâm quảng trường < 20) → 8 đèn, 8 ghế. Mỗi ghế có hộp va chạm.
- **Chức năng:** trục không gian trung tâm.
- **Nhân vật:** 2 học viên (A16).
- **Tương tác:** bảng ôn tập: E tại (−218, −24,6) r 2, prio 0,9: "📌 Bảng ôn tập – kiểm tra lại bài đến hạn (E)" → mở app `reviews` (LC:229).
- **Kết nối:** trục Bắc–Nam x = −226 ± 3 nối sân khấu CLB (Bắc) và phòng thi (Nam); đại lộ z = −16 nối cầu (Đông) và toà chính (Tây).

#### A16. Nhân vật trong campus (5 NPC, LC:246–265)

Chỉ tạo khi có `W.people.kit` và `W.makeActor`. Đứng im, animation "idle" (không đi lại), có va chạm tròn r 0,35. Khi người chơi lại gần < 3,6 m: hiện toast "💬 Tên: lời chào" 4,2 giây, chạy clip "wave" nếu có (2,2 giây). Reset khi cách > 6 m.

| Tên (role) | Vị trí (x, z) | Hướng | Lời chào |
|---|---|---|---|
| Cô Linh · tư vấn (nữ, áo xanh '#1f4fa8', tóc dài; seed idx 21) | (−286,2, −15,2), sau quầy tư vấn | Đông (π/2) | "Chào bạn! Muốn học tiếng Anh hay tiếng Trung? Bấm E ở quầy để xem lộ trình miễn phí nhé" |
| Mr. Tom · English teacher (nam, sơ mi trắng; idx 22) | (−253,6, −50,2), trước English House | Nam (0) | "Hello! Welcome to English House. Lesson 1 starts with “Hello! I’m…” – come in!" |
| 王老师 · thầy Vương (nam, áo đỏ '#b3261e'; idx 23) | (−253,4, 17,3), trước Hán Học Đường | Bắc (π) | "你好！欢迎来到汉学堂！Chào bạn, học tiếng Trung từ pinyin nhé" |
| Ngọc Anh · học viên IELTS (nữ, áo cam; idx 24) | (−219,5, −6,5) trên quảng trường | −2,4 rad | "Mình đang ôn IELTS Speaking ở CLB Giao tiếp – bạn vào nhập vai cùng không?" |
| Đức · học viên HSK (nam, áo xanh lá; idx 25) | (−220,8, −5,4) trên quảng trường | 0,8 rad | "我在准备HSK四级！Mỗi ngày mình ôn thẻ từ 15 phút" |

NPC không có tương tác E, không có thưởng. Chỉ chào bằng toast.

#### A17. Cây xanh và cảnh quan phụ

- LC:232–242. 2 `InstancedMesh` (thân + tán), cao thân 2,4 m, tán icosahedron bán kính 1,7. Có va chạm tròn r ≈ 0,35·tỉ lệ.
- Vị trí: 8 cây dọc đại lộ (x = −188, −197, −251, −260; z = −16 ± 9) + tối đa tới 150 cây rải ngẫu nhiên (140 lần thử, seed 20261115) trong x −346…−174, z −106…86, bỏ chỗ có công trình (8 hộp loại trừ gồm toà chính, English House, Hán Học Đường, sân khấu, phòng thi, thư viện, quảng trường, cạnh cầu), bỏ nền < 1,2 m và đường lát. **Số cây thật chưa rõ** (phụ thuộc kết quả loại trừ).
- Không có tương tác.

#### A18. Hành vi toàn cục gắn vào đảo (không phải không gian)

- **Kiểm tra nhanh đột xuất** (LC:290–296): cứ ≈ 25 phút chơi (1500 giây khung) hỏi một lần, điều kiện: đã chơi > 600 giây, đứng yên > 5 giây ngoài trời, không `W.inside`, không đi xe, không có modal đang mở, đã hoàn thành ≥ 1 bài và `set.pop !== false`. Hiện hộp xác nhận "⚡ Kiểm tra nhanh – bạn còn nhớ bài không?" (6 câu, ≈ 1 phút) nút "⚡ Làm ngay" mở app `quick`.
- **Nhắc ôn hằng ngày** (LC:297–300): sau 40 giây vào game, 1 lần mỗi ngày (khoá `qcworld-lang-nudge`), nếu có bài đến hạn thì toast 7 giây nhắc đến Trung tâm (phím M để bay tới).
- **Bản đồ M (PLACES):** "Trung tâm Ngoại ngữ" teleport (−268, −16) hướng (−285, −16); "Cầu Đảo Ngoại ngữ" (LC:287–288).

**Tổng hợp điểm E của Đảo Ngoại ngữ (8):** quầy tư vấn, vòng sáng sảnh, English House, Hán Học Đường, sân khấu CLB, phòng thi, thư viện, bảng ôn tập. Cộng 1 điểm ở đầu cầu (xem A2): tổng 9 `INTER`.

---

### PHẦN B. ỨNG DỤNG HỌC `js/langui.js` (tóm tắt chức năng)

Tạo bởi `createApp(W, {addCoins, ui})`. Giao diện phủ toàn màn hình, có breadcrumb và nút quay lại, hoạt động bằng định tuyến `nav({v:..})`. Tiến độ lưu `localStorage['qcworld-lang']` (đồng bộ debounce 250 ms), có xuất / nhập .json.

**Dữ liệu:** `data/lang_index.json` liệt kê cấp và bài; mỗi cấp có file riêng `lang_<en|zh>_<cấp>.json` (tải lười). Đề thi `lang_<t>_mock.json`, hội thoại `lang_<t>_talk.json`, sổ tay `lang_<t>_guide.json`. Gộp bằng `data/lang_src/build.py`.

**Lộ trình (đọc từ `lang_index.json`):**

| Ngôn ngữ | Cấp (số bài) | Tổng bài | Hội thoại | Đề thi thử | Sổ tay |
|---|---|---|---|---|---|
| Tiếng Anh | l0 Nhập môn phát âm (10), a1 (12), a2 (12), b1 (12), b2 (12), c1 Luyện IELTS 6.5→7.5 (14), c2 Chinh phục IELTS 8.0+ (10) | 82 | 48 tình huống | 2 đề IELTS (165 phút, 80 mục) | 12 chuyên đề |
| Tiếng Trung | l0 Nhập môn pinyin & chữ Hán (8), hsk1 (12), hsk2 (12), hsk3 (12), hsk4 (12), hsk5 (10), hsk6 (10), hsk79 (8) | 84 | 44 tình huống | 7 đề HSK (từ 40 đến 150 phút) | 12 chuyên đề |

Giờ học tích luỹ ước tính trong index: EN 20 → 1000 giờ; ZH 20 → 2500 giờ.

**Các màn hình (`VIEWS`):**
- `home` (Sảnh): thẻ 2 lộ trình, bài đến hạn, chuỗi ngày học, thẻ từ, chứng chỉ, lối tắt Hướng dẫn / Chứng chỉ / Đề mẫu chính thức / Cài đặt.
- `track`: 7 ô chức năng (Ôn tập đến hạn, Thẻ từ, Kiểm tra, Hội thoại, Thi thử, Sổ tay, Sổ lỗi sai) và danh sách cấp.
- `level`, `lesson`: bài gồm các phần (từ vựng, âm, ngữ pháp, văn bản, hội thoại, đọc, nói/ghi âm, viết, chữ Hán), mục tiêu, giáo án giáo viên, bài tập cuối bài (≥ 60% là xong). Có in / tải giáo trình .html.
- `exam`: thi cuối cấp (qua `examRunner`, ngưỡng mặc định 70%), có dải điểm quy đổi IELTS (L/R band).
- `reviews` / `review`: lịch kiểm tra lại giãn cách 1, 3, 7, 14, 30, 60 ngày; qua mốc 60 ngày là "đã thuộc". Chế độ bắt buộc (mặc định bật) chặn học bài mới khi còn bài đến hạn.
- `tests`: đề tự sinh (từ vựng, ngữ pháp, nghe, tổng hợp; 10/20/30/40 câu).
- `quick`: kiểm tra nhanh 6 câu.
- `cards`: thẻ từ lặp ngắt quãng (hộp 0, 1, 3, 7, 14, 30, 60, 120 ngày; mặc định 15 thẻ mới mỗi ngày; kiểu chữ→nghĩa, nghĩa→chữ, nghe→nghĩa).
- `talks` / `talk`: hội thoại 5 bước (nghe trả lời → mẫu câu → nhập vai có ghi âm → bài tập → tự nói).
- `mocks` / `mock`: đề thi thử tự soạn (nói rõ không phải đề thật).
- `guide` / `article`: sổ tay (phương pháp dạy và tra cứu), có tự kiểm tra.
- `wrong`: sổ lỗi sai (làm đúng 2 lần liên tiếp thì rời sổ).
- `certs`: chứng chỉ canvas tải ảnh. `links`: trang chính thức IELTS/HSK (6 liên kết, mở trình duyệt). `settings`: giọng đọc, tốc độ, giọng online, ôn bắt buộc, chế độ giáo viên, pinyin, kiểm tra nhanh, số thẻ mới/ngày, xuất/nhập/xoá tiến độ. `help`: hướng dẫn và bảng cấp độ.
- TTS dùng `speechSynthesis` (chọn giọng theo ngôn ngữ), có ghi âm (`stopRec`).

**Phần thưởng xu (💰) qua `ctx.addCoins` (`life.js`):**

| Sự kiện | Xu | Nguồn |
|---|---|---|
| Hoàn thành bài lần đầu (bài tập ≥ 60%) | +10 | UI:674 |
| Ôn tập đúng hạn đạt ≥ 80% | +3 | UI:361 |
| Kiểm tra nhanh đạt ≥ 80% | +5 | UI:745 |
| Hoàn thành nhập vai (lần đầu mỗi tình huống) | +5 | UI:794 |
| Hoàn thành đề thi thử (≥ 40%, mỗi đề một lần) | +50 | UI:810 |
| Đạt thi cuối cấp (≥ pass, mặc định 70%), nhận chứng chỉ lần đầu mỗi cấp | +100 | UI:689 |

Không có giá tiền nào để dùng ứng dụng (miễn phí).

---

### PHẦN C. BẢNG TẤT CẢ VÙNG ĐẤT TOÀN THẾ GIỚI

Nguồn khai báo: `EXTL` ở `world.html:279` (mảng đất mở rộng, mỗi phần tử `{x0,x1,z0,z1,h(x,z)|null,name}`); `CITY`, `ISLET` ở `world.html:237–277, 456`. Các `EXTL.push` thật trong mã: `highland.js:67`, `hills.js:78`, `funisland.js:22`, `themepark.js:33`, `langcenter.js:41` (5 phần tử). Các vùng `CITY.downtown/ward/arena` và đảo chính không đi qua EXTL mà qua `inDT`/`edgeR`.
Mỗi hộp EXTL có `x1` và `z1` trừ đi `RES` (2 hoặc 3 m). Hộp chỉ là hộp bao: đất thật có thể nhỏ hơn (ví dụ Wonderland là đảo tròn, Kỳ Quan có bờ SDF).

| # | Vùng | x0 – x1 | z0 – z1 | Nguồn | Cách nối |
|---|---|---|---|---|---|
| 1 | Đảo chính Master Dashboard | tâm (0,0), bán kính `ISLAND_R = 74` + sóng `edgeR(a)`: ≈ 70…76 (tối đa ≈ 89 quanh góc 2,3) → ≈ −89…89 | ≈ −89…89 | `world.html:232, 455` | Tâm mạng lưới: đường vành đai r = 43 rộng 7 |
| 2 | Đảo nhỏ nghỉ dưỡng (ISLET) | tâm (−81,3; 91,0) = 122·(cos 2,3; sin 2,3), r = 24 → x ≈ −105…−57 | z ≈ 67…115 | `world.html:456`, `resort.js` | Cầu gỗ rộng 3 m, theo hướng góc 2,3 rad từ bờ đảo chính (r = `edgeR−6`) tới mép đảo nhỏ |
| 3 | Downtown | 136 – 262 | −62 – 62 | `world.html:257` | Cầu dây văng rộng 28 m trục z = 0 từ x = 46,5 (cổng Rời đảo `gateX = 52`) tới x = 137 (`downtown.js:67–`) |
| 4 | Phường Khởi Nghiệp (`CITY.ward`) | 136 – 262 | 56 – 480 (sàn từ 62) | `world.html:260` | Liền đất với Downtown (cạnh Nam). Đường ven Tây / Đông x = 146 / 252, phố chính z = 200 |
| 5 | Khu Giải trí (arena) | 274 – 394 | −60 – 60 | `world.html:277` | Cầu rộng 10 m trục z = 0 từ x = 262 (Downtown) tới x = 274 (`arena.js:50`) |
| 6 | Cao nguyên Bình Phan (EXTL) | 88 – 330 (hộp khai 332) | −342 – −102 (hộp khai −100) | `highland.js:20, 67` | Cầu rộng 10 m trục x = 178 từ bờ Bắc Downtown (z = −62) kéo tới bờ đất (`landZ` tính lúc chạy, mặc định ≈ −130, rồi −3) (`highland.js:190–199`). Phố cổ `TOWN` x 150–256, z −182…−108. Taxi tới (178, −135) |
| 7 | Đồi Brand QC + Phố Núi (EXTL) | 276 – 474 (hộp khai 476) | 66 – 272 (hộp khai 274) | `hills.js:16, 78` | Cầu dốc rộng 11 m trục z = `ward.street = 86`, từ x = 262 (mép Đông Phường) tới 278,5, mặt cầu 0,12 → ~1,7 m (`hills.js:171–`). Taxi tại nút (262, 86) |
| 8 | Đảo QC Wonderland (EXTL) | −10 – 130 (hộp khai 132) | 222 – 360 (hộp khai 362) | `funisland.js:18, 22` | Đảo tròn tâm (61, 291), bán kính ≈ 57 ± 7 (`IR`). **Không có cầu** tới đảo chính; nối bằng cáp treo dài (xem bên dưới). Có cầu đá phía Nam sang Kỳ Quan |
| 9 | Công viên Kỳ Quan QC World (EXTL) | −270 – 360 (hộp khai 363) | 372 – 1239 (hộp khai 1242) | `themepark.js:29, 33` | Cầu đá rộng 8,4 m trục x = 40, z 337 → 395,5 từ bờ Nam Wonderland tới cổng, dạng vòm (`themepark.js:133–`). Lưới 3 m, trả `null` ngoài bờ SDF |
| 10 | Đảo Ngoại ngữ (EXTL) | −360 – −162 (hộp khai −160) | −120 – 98 (hộp khai 100) | `langcenter.js:27, 41` | Cầu vòm rộng 9 m trục z = −16, từ bờ Tây đảo chính (x ≈ −62…−65) tới x = −180 |

**Phát hiện cần lưu ý (không sửa):**
- Hộp Kỳ Quan (x −270…360, z 372…1239) chồng lên Phường Khởi Nghiệp (x 136–262, z 56–480) ở vùng x 136–262, z 372–480. Việc đất thật có chồng nhau hay không phụ thuộc hình dạng SDF Kỳ Quan (`sdf` trong `themepark.js`, **chưa rõ**). Nên kiểm tra khi quy hoạch lại.
- Khoảng cách giữa Wonderland (x tối đa 130) và Phường (x0 = 136) chỉ 6 m về hộp (nhưng đảo tròn thật cách xa hơn).
- `LAND_CLAIMS.md` ghi "Mở rộng Phố Núi" x 476–640, z 66–274 (`js/hills.js`, `js/mountaintown.js`) nhưng trong mã đọc được `HZ.x1 = 476` và không có `EXTL.push` nào cho x > 476. **Mở rộng này chưa thấy trong mã**.
- `LAND_CLAIMS.md` ghi đảo chính "khoảng −115…115"; mã cho bán kính ≈ 74 ± 15 (tối đa ≈ 89). Đảo nghỉ dưỡng ghi "bán kính 122 theo góc RESORT_A, r = 24": khớp mã.
- Đã đăng ký nhưng chưa có trong mã đọc: phần "dành cho đợt 2B" x −250…−70 · z 1040–1210 và dải Bắc z 800–880 của Kỳ Quan (nằm trong hộp EXTL hiện có).

#### Kết nối giữa các vùng

| Tuyến | Loại | Đầu A | Đầu B | Ghi chú |
|---|---|---|---|---|
| Đảo chính ⇄ Downtown | Cầu dây văng 28 m, trục z = 0 | x = 46,5 (cổng Rời đảo x = 52) | x = 137 | Đường 20 m + 2 lối bộ hành. Là đường "Đại lộ Hồ Ngọc" kéo tới x = 262 (`CITY.roads`) |
| Đảo chính ⇄ Downtown | Cáp treo Vịnh Bình Phan (vé 10 💰) | Ga Đảo: bờ Đông Bắc, góc ≈ −0,62 rad, r ≈ 60 → ≈ (49, −34) (nếu không tìm được: (49, −35)) | Ga Downtown (136,5; −26,5) | 8 cabin, trụ giữa biển cao 26 m (`transit.js:260–`) |
| Downtown ⇄ Arena | Cầu ngắn 10 m, z = 0 | x = 262 | x = 274 | `arena.js:50` |
| Downtown ⇄ Cao nguyên | Cầu 10 m, x = 178 | z = −62 | bờ đất z ≈ −130 | Taxi tới (178, −135) |
| Downtown ⇄ Phường | Liền đất | z = 56…62 | | Không cầu |
| Phường ⇄ Đồi Brand QC | Cầu dốc 11 m, z = 86 | x = 262 | x = 278,5 | |
| Đảo chính ⇄ Đảo Wonderland | Cáp treo dài (vé 15 💰, ~170 m) | Ga A ≈ (6, 81) (hướng góc `atan2(84, 6)`, cách tâm `edgeR + 9`, trên cầu tàu bờ Nam) | Ga B (54, 239) | Trụ tháp ở giữa cao 48 m (`funisland.js:42–79`). Các toạ độ ga A tính xấp xỉ |
| Wonderland ⇄ Kỳ Quan | Cầu đá vòm 8,4 m, x = 40 | z = 337 (bờ Nam Wonderland) | z = 395,5 (cổng) | `themepark.js:133` |
| Đảo chính ⇄ Đảo nghỉ dưỡng | Cầu gỗ 3 m | bờ Tây Nam đảo chính (góc 2,3 rad) | ISLET | `resort.js:170` |
| Đảo chính ⇄ Đảo Ngoại ngữ | Cầu vòm 9 m, z = −16 | x ≈ −62…−65 | x = −180 | `langcenter.js:65` |
| Du thuyền "QC Ocean Pearl" | Tuyến biển, vé 30 💰 | Bến cảng đảo chính (cầu tàu ≈ (−1,4, −84)) | Vòng vịnh phía Bắc | `sealife.js`, chỉ ngắm cảnh, không chở sang đảo nào |

Đảo Ngoại ngữ **không** có cáp treo, taxi, hay xe bus. Cầu vòm hay teleport bản đồ M là đường duy nhất.

#### Sơ đồ ASCII thô (x: 20 m / ký tự, z: 40 m / hàng)

Cột đầu ứng với x = −380. Hàng ghi theo z bắt đầu. Ký hiệu: `L` Đảo Ngoại ngữ, `M` Đảo chính (xấp xỉ hộp ±85), `R` Đảo nghỉ dưỡng, `D` Downtown, `W` Phường Khởi Nghiệp, `A` Khu Giải trí (arena), `H` Cao nguyên, `B` Đồi Brand QC, `F` Đảo Wonderland, `P` Công viên Kỳ Quan. Dấu `.` là biển hoặc trống. Cầu không vẽ (quá hẹp so với ô). Hộp chỉ là hộp bao.

```
 x:  -380      -180       0       200      400
      |         |         |        |        |
 z
 -360 |.......................HHHHHHHHHHHHH
 -320 |.......................HHHHHHHHHHHHH
 -280 |.......................HHHHHHHHHHHHH
 -240 |.......................HHHHHHHHHHHHH
 -200 |.......................HHHHHHHHHHHHH
 -160 |.......................HHHHHHHHHHHHH
 -120 |.LLLLLLLLLL............HHHHHHHHHHHHH
  -80 |.LLLLLLLLLL....MMMMMMMM...DDDDDD.AAAAAA
  -40 |.LLLLLLLLLL....MMMMMMMM...DDDDDD.AAAAAA
    0 |.LLLLLLLLLL....MMMMMMMM...DDDDDD.AAAAAA
   40 |.LLLLLLLLLL....MMMMMMMM...DDDDDD.AAAAAA
   80 |.LLLLLLLLLL...RR..........WWWWWW.BBBBBBBBBB
  120 |..........................WWWWWW.BBBBBBBBBB
  160 |..........................WWWWWW.BBBBBBBBBB
  200 |..........................WWWWWW.BBBBBBBBBB
  240 |..................FFFFFFFFWWWWWW.BBBBBBBBBB
  280 |..................FFFFFFFFWWWWWW
  320 |..................FFFFFFFFWWWWWW
  360 |.....PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
  400 |.....PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
  ... (các hàng 440 … 1200 giống hệt hàng 400: Kỳ Quan x −270…360)
 1200 |.....PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
```

Chú ý khi đọc sơ đồ: `P` ở hàng 360 – 480 che mất phần dưới `W` (Phường kéo tới z = 480) do cả hai hộp chồng nhau. Hộp Phường thật là x 136–262 cho tới z = 480.
Chỉ số cột (bắt đầu từ 0, x = −380 + 20·cột): `L` cột 1–10, `M` cột 15–22, `D` cột 26–31, `A` cột 33–38, `P` bắt đầu cột 5. Ký tự là xấp xỉ theo tâm ô.

**Các cây cầu và cáp treo vẽ tay (không theo tỉ lệ):**
```
  L ==cầu vòm z=-16== M ==cầu dây văng z=0== D ==cầu z=0== A
                      M ~~cáp treo (49,-34)→(136,-26)~~ D
  M ~~cáp treo dài (6,81)→(54,239)~~ F ==cầu đá x=40, z 337→395== P
  D ==cầu x=178 (z -62 → -130)== H         W ==cầu z=86== B
  M ==cầu gỗ (góc 2,3 rad)== R
```

---

### Phụ lục. Danh sách không gian đã mô tả

1. Đảo Ngoại ngữ (địa hình) – A1
2. Cầu vòm – A2
3. Cổng chào đầu Đông cầu – A3
4. Cổng chào đầu Tây cầu – A4
5. Toà Trung tâm Ngoại ngữ (khối) – A5
6. Sảnh tư vấn – A6
7. Quầy tư vấn – A7
8. Phòng học kính Bắc – A8
9. Phòng học kính Nam – A9
10. English House – A10
11. Hán Học Đường – A11
12. Sân khấu CLB Giao tiếp – A12
13. Phòng thi IELTS · HSK – A13
14. Thư viện – A14
15. Quảng trường + Bảng ôn tập + đại lộ – A15
16. Cây xanh và cảnh quan – A17

Nhân vật (A16: 5 NPC) và hành vi toàn cục (A18) được mô tả riêng. Phần C liệt kê 10 vùng đất toàn thế giới.

---

