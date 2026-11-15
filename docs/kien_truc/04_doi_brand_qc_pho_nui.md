# 04 · Đồi Brand QC và Phố Núi — hiện trạng kiến trúc

Tài liệu mô tả đúng theo mã nguồn (đọc ngày 15/11, không chạy game). Quy ước: 1 ô = 1 m = 1 đơn vị toạ độ; trục x Đông–Tây (x tăng về Đông), trục z Bắc–Nam (z tăng về Nam), y là độ cao. "Y0/FLAT" là cao độ nền. Mọi con số có dấu "≈" là tính tay từ công thức trong mã (mã không ghi sẵn); "chưa rõ" nghĩa là mã không xác định được nếu không chạy game.

File nguồn dùng: `js/hills.js` (H), `js/monument.js` (MON), `js/mountaintown.js` (MT), `js/foodstreet.js` (FS), `js/riverside.js` (RV), `js/luxury.js` (LX; chỉ vỏ showroom). Số dòng ghi dạng `file:dòng`.

---

## 0. Tổng quan và hằng số chung

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

## 1. ĐỒI BRAND QC — địa hình và hạ tầng (`hills.js`)

### 1.1 Địa hình đồi — H:49–90

- **Vị trí và kích thước:** lưới độ cao 2 m phủ x 276–476, z 66–274 (101 × 105 điểm); đăng ký `EXTL` tên "ĐỒI BRAND QC · PHỐ NÚI" (H:78). Đồi chính hình chuông quanh HC: cao 32 m trong d ≤ 14, giảm mượt (smoothstep) về 0 ở d = 84, cộng nhiễu fbm ±3 m ở d 26–84 (H:25, H:60). Sân đỉnh phẳng 32 m trong d < 24,5, taluy mềm đến d = 31 (H:70).
- **Hình dạng đất liền:** hình chữ nhật HZ bị thụt vào 9–23 m (nhiễu), nhưng ép thụt ≤ 1,2 m quanh pad căn hộ/phố ẩm thực/showroom, dải đường ven biển và vùng biệt thự, và đất liền chắc chắn trong dải z ST±8,5 gần chân cầu (H:50–55). Ngoài mép đất: bờ cát rồi đáy biển (−6 m) (H:57, H:72).
- **Pad phẳng:** FOOD, APT, SHOW san về cao 1,7 m (viền chuyển tiếp 6–7 m); mỗi lô biệt thự phẳng ở 1,8 m (x ± (w/2+1), z từ z0−1 đến z1+2) (H:63–64).
- **Đầm:** vùng elip LAG lõm xuống −2,3 m, bờ nhô nhẹ (H:66).
- **Đường và thang** san phẳng theo đúng cao độ thiết kế, taluy mềm 11 m hai bên đường và 9 m hai bên thang (H:68–69).
- **Màu sắc:** cỏ xanh 2 sắc pha, khô dần khi cao, đá khi dốc, cát khi gần mực nước, bùn dưới nước; pad ẩm thực/căn hộ/showroom tô màu gạch xám (H:80–86).
- **Cây xanh:** tối đa 340 cây thưa (cách nhau ≥ 4,2 m), thân + tán cầu (xanh lá), thông (cao h > 12, xác suất 55%); tránh sân đỉnh (d < 33), đường (cách mép 3,5 m), thang, các pad, biệt thự, đầm, và nhà Phố Núi; mỗi cây có va chạm bán kính ≈ 0,32 m (H:184–196).
- **Chức năng:** nền cho toàn khu; mọi nhà dựng theo hàm độ cao này (`hAt`).
- **Nhân vật / Tương tác:** không có.

### 1.2 Cầu nối Phường → đồi — H:171–182

- **Vị trí và kích thước:** x 262 → 278,5 (dài 16,5 m), z = 86 ± 5,5 (sàn rộng 11 m, mặt nhựa rộng 8 m). Dốc thoai thoải từ y = 0,12 (mặt Phường) lên 1,68 (mặt đồi), chia 11 mảnh sàn (mỗi mảnh 1,5 m) để đi bộ/xe lên êm.
- **Bố trí:** sàn bê tông xám (dày 0,5), mặt nhựa, 2 lan can ở z = 86 ± 5,3 (thanh kim loại vàng, có va chạm); cắt lan can bờ Đông Phường (x ≈ 263) chừa lối z 80,2–91,8 cho xe/người vào cầu.
- **Chức năng:** lối duy nhất từ phố chính Phường sang khu đồi.
- **Kết nối:** đầu Tây là đường Phường (x = 262); đầu Đông nối đường vào (mục 1.3).

### 1.3 Đường vào + đường xoắn ốc lên đồi (MAIN) — H:28–35

- **Vị trí và kích thước:** rộng 8 m, hai làn (vạch trắng mép, vạch vàng giữa). Đường vào theo các điểm (262, 86) → (276, 86) → (300, 87) → (340, 88,5) → khoảng 14 m trước điểm đầu xoắn ốc, cao độ 1,7. Chạy sát lưng dãy nhà phố Bắc của phố ẩm thực (lưng nhà z = 92,4, mép đường ≈ z 92,5 tại x = 340).
- **Xoắn ốc:** 520 đoạn, góc quét 5,1 rad (≈ 292°, chưa đủ một vòng), bắt đầu ở góc −90° tức phía Bắc tâm đồi (≈ (392, 96), bán kính ≈ 74 m) rồi đi theo chiều Bắc → Đông → Nam → Tây, bán kính co dần đến 24,5 m ở độ cao 32 m, điểm cuối ≈ (369,3; 160,7) — mép sân đỉnh phía Tây Nam. Cao độ tăng đều từ 1,7 lên 32 m; mã chú thích "dốc ~11%"; chiều dài ≈ 270–300 m (ước tính).
- **Bố trí:** mặt đường là dải nhựa bám địa hình, khung hình đầu tiên được dựng lại theo `W.groundAt` (H:132–142). Đèn đường (cột thép 4,2 m + bóng cầu ấm, có glow, sáng thêm ban đêm) đặt mỗi 22 mẫu, luân phiên trái/phải, cách tim đường 4,9 m, bỏ x < 278 và vị trí trùng nhà Phố Núi (H:165–169).
- **Chức năng:** trục giao thông của đồi; hai bên (phía ngoài) gắn Phố Núi (mục 3).
- **Kết nối:** nối cầu (mục 1.2); cắt qua đường ven biển tại x ≈ 286; điểm cuối là sân đỉnh. Đồ thị taxi/xe bot: các nút mỗi ~14 m dọc đường, nối vào nút Phường (262, 86); đường ven biển có nút rẽ nối vào nút gần x = 286 (H:198–202).

### 1.4 Đường ven biển (COAST) — H:36

- **Vị trí và kích thước:** rộng 7 m, nền 1,7: (286, 91) → (286, 218) → (352, 218). Mặt lát đá ô vuông xám.
- **Chức năng:** trục Bắc–Nam bên Tây khu: đi qua mặt tiền showroom (z 120–152) và đầu Tây phố ẩm thực (x ≈ 289), tới cổng gác biệt thự (z = 205), rồi rẽ Đông thành ngõ biệt thự (z = 218, x 286–352).
- **Kết nối:** đường vào / xoắn ốc cắt ở x ≈ 286; ngõ z = 218 là điểm "nhà" của xe đại gia (LX:93).

### 1.5 Cầu thang lớn (phố ẩm thực → tháp) — H:38–41, H:147–163

- **Vị trí và kích thước:** đường thẳng từ SA ≈ (351,2; 109,4; cao 1,7) — sát đầu Đông phố ẩm thực — đến SB ≈ (378,9; 150,5; cao 32) trên mép sân đỉnh (hướng 4,12 rad ≈ 236° quanh tâm đồi). Dài ≈ 49,6 m, cao 30,3 m (dốc ≈ 61%), rộng 7 m, khoảng 151–152 bậc (cao 0,2 m, sâu ≈ 0,33 m).
- **Bố trí:** bậc đá màu kem trắng + khối nền dày 1 m dưới bậc; 2 lan can (cột tròn cách 8 bậc + thanh tay vịn vàng đồng tại cao 1 m); mỗi bên 5 cột đèn (t = 0,12 → 0,95, cách 0,2) bên ngoài lan can; va chạm: cột lan can và vật cản chạy dọc hai bên (không bước hụt ra ngoài); mỗi bậc là một "plat" để chân đặt đúng mặt bậc.
- **Chức năng:** lối đi bộ thẳng từ phố ẩm thực lên Tháp Brand QC.
- **Kết nối:** chân thang gần đầu Đông phố ẩm thực (bàn nước "Nước ép Sprint" ở x 333–340, z 105); đầu trên dẫn vào sân đỉnh, hướng thẳng cửa chính tháp (ENT trùng hướng SB).

### 1.6 Các pad dành cho module khác — H:19–23

Phố ẩm thực (mục 5), căn hộ (mục 6), showroom (mục 8), biệt thự + đầm (mục 7) đều là các hình chữ nhật san phẳng; `freeAt` giữ vùng đệm cho nhà Phố Núi (H:97–98). Sân đỉnh (mục 2.1) là đĩa tròn.

---

## 2. THÁP BRAND QC (`monument.js`)

Hằng số: tâm C = (392, 170); Y0 = 32; bán kính toà RB = 13 (thành kính); bán kính giếng trời RA = 5,2; chiều cao tầng FH = 6,5; cao độ sàn FY = [32; 38,5; 45; 51,5] (trệt, lầu 1, lầu 2, sân thượng) (MON:11). Hướng cửa chính ENT = góc từ tâm đến SB ≈ −123,9° (≈ −2,163 rad), tức cửa nhìn về phía Tây Bắc, đúng đầu cầu thang lớn (MON:12). Mọi góc dưới đây ghi tương đối so với ENT. Toà "đi bộ thẳng vào, không cần bấm E" (MON:1).

### 2.1 Sân đỉnh đồi — MON:54–64

- **Vị trí và kích thước:** đĩa tròn bán kính 24,4 m quanh (392, 170), cao 32,03 (nền đá sáng khắc vòng tròn đồng tâm + 48 tia).
- **Bố trí:** 10 cột đèn thép (cao 5,5 m, đầu cầu vàng, glow) đặt ở bán kính 22 m, cách nhau 36°, bỏ đèn gần cửa chính (± 0,3 rad); xen giữa là 10 bồn hoa (đá cẩm thạch Ø 2,4 + bụi cây) ở bán kính 21 m.
- **Chức năng:** quảng trường trước tháp; điểm đến cuối của cầu thang lớn và đường xoắn ốc.
- **Nhân vật:** không. **Tương tác:** không.

### 2.2 Vỏ toà — MON:66–96

- **Vị trí và kích thước:** hình trụ tròn tâm C, bán kính 13 m (mặt sàn ngoài 13,35), cao từ 32 đến 51,5 (3 tầng × 6,5 m) + sân thượng ngoài trời. Đường kính ≈ 26 m, tổng diện tích mỗi tầng ≈ 530 m² (trừ giếng trời ≈ 85 m²).
- **Bố trí:**
  - Sàn vành khăn lầu 1–3 (r từ 5,2 đến 13,35), mặt dưới ốp thanh gỗ, viền đồng, viền LED xanh quanh giếng trời và LED vàng sát kính, vành vàng ngoài.
  - Kính bao quanh từng tầng (trệt chừa cửa chính rộng 0,42 rad ≈ 5,5 m); 36 cột khung thép đứng.
  - Mái hiên cửa chính (đá cẩm thạch 6 × 4,6, cao 4,2 m, viền vàng) trên 2 cột vàng; lan can sân thượng bằng kính thấp 1,1 m + tay vịn vàng.
  - Lan can giếng trời (kính + ống vàng) ở lầu 1, lầu 2, sân thượng, chừa khe tại lối chiếu nghỉ.
  - Va chạm: tường kính từng tầng (chỉ trong khoảng cao tương ứng), lan can.
- **Chức năng:** vỏ kiến trúc; giếng trời thông suốt từ trệt lên trời (không có mái sân thượng).
- **Kết nối:** cửa chính duy nhất ở trệt, hướng ENT. Camera tự thu gọn (≤ 6,2 m) và bị giới hạn trần khi ở trong (trừ sân thượng) (MON:316–318).

### 2.3 Trệt — "Sảnh Tinh Hoa" — MON:52, MON:140–152, MON:176, MON:180–186, MON:217–252

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

### 2.4 Cầu thang xoắn ốc trung tâm — MON:98–123

- **Vị trí và kích thước:** quanh lõi tròn đá tối bán kính 1,35 m ở tâm toà (cột cao 31,5 m, xuyên lên trên sân thượng 12 m). Bậc rộng từ r = 1,35 đến 5,0 (3,65 m), bậc cao 0,25 m, mỗi bậc quay 12° (30 bậc/vòng, 7,5 m cao/vòng); tổng 78 bậc, ≈ 2,6 vòng. Bắt đầu tại ENT + 99°, quay theo chiều tăng góc (Bắc → Đông → Nam → Tây khi nhìn từ trên).
- **Bố trí:** mặt bậc gỗ óc chó tối + nẹp đèn vàng nhạt ở mép bậc; mặt dưới đồng; cột nhỏ + ống tay vịn vàng chạy theo đường xoắn (ngắt tại các chiếu nghỉ); 3 chiếu nghỉ gỗ 2,0 m bắc qua khe giếng trời vào sàn mỗi tầng tại các góc: lầu 1 ≈ ENT + 51°, lầu 2 ≈ ENT + 3°, sân thượng ≈ ENT − 45°. Lan can giếng trời chừa lối ở các chiếu nghỉ; cuối thang (sân thượng) có chắn kính để không bước hụt xuống giếng trời. Mỗi chiếu nghỉ có 2 cột đèn xanh hai bên + biển treo "CẦU THANG · tên tầng ↑/↓" + hàng mũi tên chỉ vào lối + tên tầng trên lõi.
- **Chức năng:** đường đi duy nhất giữa các tầng; đi bộ lên (không có thang máy).
- **Kết nối:** chân thang ở trệt (góc ENT + 99°, qua cổng cầu thang); đỉnh thang dẫn ra sân thượng.

### 2.5 Lầu 1 — "Kỹ thuật & Công cụ" — MON:153–165, MON:177, MON:187–191

- **Vị trí và kích thước:** sàn ở cao độ 38,5; cao 6,5 m; vành khăn r 5,2–13,35.
- **Bố trí và nội thất:** sàn gỗ óc chó (gỗ ván nhiều tông). **12 bảng** teal xanh đậm, treo trên cung ENT ± 0,2 rad quanh toà (gần kín vòng): Phân vùng tương đương; Phân tích giá trị biên; Bảng quyết định; Chuyển trạng thái; Kiểm thử cặp (pairwise); Kiểm thử thăm dò; Kim tự tháp kiểm thử; Tự động hoá UI (Selenium/Playwright/Cypress/Appium); API & Hiệu năng (Postman/JMeter/k6); CI/CD & chất lượng liên tục; Bảo mật; Khả năng truy cập. **3 kiosk đố vui** (hộp tối 0,9 × 1,2 × 0,5, màn hình xanh sáng nghiêng) ở bán kính 9,6, các góc ENT + 0,9 rad, ENT − 0,9 rad, ENT + 180°. Băng ghế gỗ ≈ 6 chỗ đặt (tính tay), chậu cây tối đa 6.
- **Chức năng:** giới thiệu kỹ thuật thiết kế test và công cụ; chơi đố vui.
- **Nhân vật:** không có.
- **Tương tác:** E ở kiosk (r 1,8, khi đứng đúng tầng) → "Kiosk đố vui QA" mở `W.life.openQuiz()` (nếu chưa sẵn: báo "Kiosk đang khởi động…"). Phần thưởng quiz do module khác xử lý (chưa rõ trong phạm vi tài liệu).
- **Kết nối:** chiếu nghỉ lầu 1; thang xoắn lên/xuống.

### 2.6 Lầu 2 — "Đại sảnh Huyền thoại" — MON:166–174, MON:178–179

- **Vị trí và kích thước:** sàn cao 45; cao 6,5 m.
- **Bố trí và nội thất:** sàn terrazzo xanh ngọc có hạt vàng. **8 bảng** nâu đỏ (maroon) trên cung từ MYA + 0,7 rad đến MYA + 2π − 0,7 rad (MYA = ENT + 180°, chừa chỗ phòng bí ẩn): Glenford Myers ("The Art of Software Testing" 1979); Cem Kaner/James Bach/Bret Pettichord ("Lessons Learned in Software Testing" 2001); Lisa Crispin & Janet Gregory ("Agile Testing" 2009); Kent Beck (TDD); Mike Cohn (kim tự tháp kiểm thử); Michael Bolton & James Bach (Rapid Software Testing); "Đội QC Bình Phan" (Tận tâm · Chính trực · Học hỏi); "Bạn – người QA tiếp theo". Băng ghế ≈ 5 chỗ đặt (tính tay), chậu cây tối đa 6.
- **Chức năng:** vinh danh người đặt nền móng nghề kiểm thử + giá trị đội QC; chứa phòng bí ẩn (mục 2.7).
- **Nhân vật:** không có. **Tương tác:** chỉ ghế (E/C) và phòng bí ẩn.
- **Kết nối:** chiếu nghỉ lầu 2 (≈ ENT + 3°); thang xoắn.

### 2.7 Phòng bí ẩn (lầu 2) — MON:193–215

- **Vị trí và kích thước:** hình quạt phía đối diện cửa chính: góc MYA ± 0,55 rad (± 31,5°, ≈ 63°), bán kính trong 6,1 (rIn = RA + 0,9) đến 12,7 m; cao 6 m (FH − 0,5); cao độ 45. Rộng ≈ 10,5 m (cung giữa) × sâu ≈ 6,6 m.
- **Bố trí:** 2 vách bên (tường tím sẫm hơi phát sáng) chạy xuyên tâm, 1 vách cong phía giếng trời với khe cửa rộng ≈ 1,8 m; dầm trên cửa cao từ 2,7 m. Cửa trượt tím 1,6 × 2,6 ở giữa vách cong + biển "? PHÒNG BÍ ẨN"; 3 chốt chặn va chạm (hạ xuống khi cửa mở > 60%). Bên trong: **bệ cẩm thạch** Ø 1,4–1,8 ở bán kính ≈ 9,6 với dấu "?" tím phát sáng xoay (cao 2,1 m) trên bệ. Phòng trống, "để dành cho điều đặc biệt sẽ ra mắt sau" (nội dung hộp thoại).
- **Chức năng:** chỗ giữ cho tính năng tương lai.
- **Nhân vật:** không.
- **Tương tác:** E ở cửa (r 2,2, khi đứng lầu 2). Lần đầu: hộp thoại xác nhận "Căn phòng này được để dành…; bạn có muốn bước vào xem trước không gian trống bên trong?" nút "Mở cửa" → cửa trượt mở (toast "🔮 Cửa phòng bí ẩn mở ra…"). Khi đã mở, E để đóng ("Đóng cửa phòng bí ẩn"). Không có phần thưởng/giá.
- **Kết nối:** chỉ có một cửa vào, mở ra sàn lầu 2.

### 2.8 Sân thượng — MON:266–279, MON:297–300

- **Vị trí và kích thước:** cao độ 51,5, ngoài trời hoàn toàn (không mái), vành r 5,2–13,35 + giếng trời mở.
- **Bố trí và nội thất:** sàn gỗ deck sáng; lan can kính 1,1 m + tay vịn vàng ngoài rìa (r 13,2); **3 ống nhòm** (cột thép + ống đen) ở bán kính 11,8, các góc ENT, ENT + 120°, ENT − 120°; **3 ghế băng cẩm thạch** 2,0 × 0,12 × 0,6 (3 chỗ) ở bán kính 11,4, các góc ENT + 60°, ENT − 60°, ENT + 180°, quay mặt ra ngoài; băng LED chữ chạy vòng ngoài mép (cao 50,5, r 13,42) với dòng "★ BRAND QC ★ TINH HOA QA/QC ★ CHẤT LƯỢNG LÀ UY TÍN ★ BÌNH PHAN QC TEAM".
- **Chức năng:** ngắm toàn cảnh thành phố, nghỉ chân.
- **Nhân vật:** không.
- **Tương tác:** E ở ống nhòm (r 1,6, khi ở sân thượng) → camera chuyển sang chế độ ống nhòm (FOV 22), kéo chuột nhìn quanh 360°, lăn chuột phóng to/thu nhỏ; bấm E hoặc phím di chuyển để thoát. Ngồi ghế: E/C ("Ngồi ngắm toàn cảnh").
- **Kết nối:** đỉnh cầu thang xoắn.

### 2.9 Biểu tượng chữ QC vàng + hiệu ứng — MON:281–302, MON:304–319

- **Vị trí và kích thước:** chữ "QC" 3D mạ vàng (chữ Q bằng vòng xuyến + đuôi, chữ C cung 280°), phóng 1,7 lần, đặt tại tâm toà ở cao ≈ 66 m (FY3 + 14,5), nhấp nhô ± 0,3 m, xoay 0,25 rad/s; viên kim cương xanh nhạt phía trên xoay ngược; đế vàng tròn ở cao ≈ 64,1.
- **Bố trí:** 90 hạt lấp lánh quay quanh; 4 cột sáng 140 m (chỉ hiện ban đêm, đảo xung quanh); nhãn nổi "🏛️ Tháp Brand QC" cao ≈ 68,5 (nhìn thấy từ 420 m). Khung hình: toàn bộ nội thất (nhóm `inner`) chỉ hiện khi người chơi cách tâm < 90 m và không ở trong nhà khác.
- **Chức năng:** biểu tượng/điểm nhìn từ xa của cả thành phố.
- **Nhân vật/Tương tác:** không.

---

## 3. PHỐ NÚI SƠN THÀNH (`mountaintown.js` + thuật toán trong `hills.js`)

### 3.1 Thuật toán chọn chỗ đặt (TOWN/SLOPE) — H:92–115

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

### 3.2 Bảng hiệu, đèn lồng, mặt tiền, hiệu ứng ban đêm — MT:22–42, MT:66–79, MT:210–219

- **Mặt tiền:** 9 loại vật liệu: gỗ sẫm (`timber`), nâu đất (`ochre`), kem trắng (`white`) cho nhà sàn; xanh ngọc (`teal`), xanh trời (`sky`), san hô (`coral`), tím nhạt (`lilac`) cho tháp cầu trời; san hô, tím nhạt, vàng chanh (`lemon`), xanh bạc hà (`mint`), xanh trời, xanh ngọc cho tháp sườn đồi. Mỗi ô 4 gian × 4 tầng (12 × 12,8 m); ban đêm cửa sổ sáng ngẫu nhiên.
- **Bảng hiệu:** 1 atlas chữ vàng trên nền đỏ sẫm, cho 10 quán + 4 bar + 1 dòng "🙏 Cảm ơn quý khách · Hẹn gặp lại".
- **Đèn lồng đỏ** (InstancedMesh) treo dưới các mái hiên mỗi 3,2 m, cách nhau 1,45 m; dây bóng đèn; glow giới hạn 70 điểm; đêm sáng gấp nhiều lần.
- **Tương tác chung:** mọi quầy gọi món mở hộp thoại thực đơn (`menuModal`) → "Gọi" → xác nhận trả tiền (`askPay`) → trừ tiền (`spend`) → buff: `energy` = "chạy nhanh hơn N phút"; `coffee` = "thưởng quiz +20% trong N phút" (MT:63–65).

### 3.3 Danh sách quán nhà sàn (SHOPS, 10 quán) — MT:45–56

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

### 3.4 Nhà sàn bám vách (13 điển hình) — `stilt()` MT:94–147

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

### 3.5 Tháp cầu trời (3 điển hình, tối đa 4) — `tower()` MT:149–192, danh sách BARS MT:57–62

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

### 3.6 Tháp chung cư trên sườn đồi (≈ 7 điển hình, tối đa 16) — `slope()` MT:194–204

- **Vị trí và kích thước (mẫu):** đứng ở sườn đồi, cách đường ≥ 12 m (xem 3.1); chân w × d ngẫu nhiên 9–14 m mỗi chiều; cao 14–26,8 m; bệ móng đá rộng hơn thân 2 m (cao từ gmin − 2 đến gmax + 4), thân từ gmin − 2 đến gmin + hgt. Số tầng ước ≈ hgt / 3,2 ≈ 4–8 tầng (mã không có tầng thật, chỉ họa tiết 4 tầng mỗi ô).
- **Bố trí:** 4 mặt ốp mặt tiền theo chỉ số (6 màu xoay vòng), mái xám tối + viền LED đổi màu, bồn nước trụ thép và cột ăng ten ở nóc; glow đỉnh theo 5 màu xoay vòng.
- **Chức năng:** phông nền tạo cảnh đô thị dày, nhiều cao độ.
- **Nhân vật/Tương tác:** không; không vào được (khối đặc, va chạm hộp rộng hơn thân 1 m mỗi phía).
- **Kết nối:** không có.

---

## 4. Phụ: Showroom "QC Auto · Luxury" (vỏ toà) — `luxury.js` LX:22–64

- **Vị trí và kích thước:** toà kính 44 × 28 m: x 291–335, z 122–150 (tâm (313, 136)), trong pad SHOW x 289–337, z 120–152; cao 9 m, 2 tầng kính (nền 1,7, mái ở cao ≈ 10,7 + viền thép). Mặt tiền (cửa chính) ở phía Tây, nhìn ra đường ven biển, cửa tại x ≈ 289,6, z = 136.
- **Bố trí:** sàn gạch bóng; kính 3 mặt Bắc/Nam/Đông kín và mặt Tây có khe cửa rộng 4 m (z 134–138) kèm kính trên cao 3,2 m; khung thép cách 4 m; mái trắng + gờ thép, mái hiên cửa 4,6 × 6,5 ở cao 3,6 m trên 2 cột thép (x ≈ 286,8, z = 133,1 và 138,9 — trùng đúng tim đường ven biển, mã không giải thích); biển hiệu mái 26 × 3,2 "QC AUTO · LUXURY SHOWROOM" nghiêng nhìn về Tây (cao ≈ 12,9); 28 đèn trần; "tầng lửng phía sau" (tấm 43,6 × 8 m ở cao 6,3 — tấm này đặt rộng 43,6 theo trục x lệch toà, có thể nhầm trục; chưa rõ ý đồ). 6 xe trưng bày qua kính trên bệ tròn có viền sáng: siêu xe mui trần đỏ (bàn xoay, hero) ở (309, 136); limousine đen (299, 127); xe sang trắng (299, 145); xe thể thao vàng (327, 127); SUV xanh lục (327, 145); sedan xanh dương (319, 127).
- **Chức năng:** cửa hiệu xe; nội thất phòng trưng bày thật do `W.showroom` (module khác) xử lý.
- **Nhân vật:** trong cùng file có 3 đại gia lái xe (limousine/xe sang/mui trần) chạy giữa ngõ z = 218 (nhà) và toà công ty Downtown; ngoài phạm vi tài liệu này.
- **Tương tác:** E ở cửa (r 2,2): "Vào QC Auto Luxury Showroom – ô tô, siêu xe, xe máy" → `W.showroom.enter()`. Cả toà là vật cản (có tin nhắn hướng dẫn vào bằng cửa chính). Căn nhà showroom cũ trong Phường thành "điểm chỉ đường" (E: taxi tới); điểm đến taxi và `PLACES` "Showroom xe" được đổi sang đây.
- **Kết nối:** đường ven biển x = 286 ở phía Tây; điểm ra của phòng trưng bày được dời về trước cửa mới.

---

## 5. PHỐ ẨM THỰC ĐỒI QC (`foodstreet.js`)

### 5.1 Phố đi bộ và 2 dãy nhà — FS:29–91

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

### 5.2 Danh sách 9 quán — FS:31–41, mô tả từng quán

Quầy gọi món của 7 quán không vào được đặt ở ngoài phố cách mặt tiền 1,2 m (r 2,2); khách bot ngồi bàn ngoài phố. Mỗi quán cao 9 m, sâu bằng dãy nhà (7,6 hoặc 8,4 m), tầng trệt đặc (không đi vào trong, trừ 2 nhà hàng).

#### Dãy Bắc (mặt tiền z = 100, nhìn ra phố hướng Nam)

| # | Quán | x0–x1 | Rộng × sâu (m) | Loại | Thực đơn (giá – buff – phút) |
|---|---|---|---|---|---|
| N1 | ☕ Cà phê Bug Free | 291–301 | 10 × 7,6 | quán nước | ☕ Cà phê sữa đá 20 – coffee 8 ("Tỉnh táo săn bug"); 🥥 Cà phê dừa 25 – coffee 10; 🍰 Bánh tiramisu 30 – energy 6 |
| N2 | 🥖 Bánh mì Test Case | 301–311 | 10 × 7,6 | tiệm | 🥖 Bánh mì đặc biệt 20 – energy 6; 🍳 Bánh mì ốp la 15 – energy 4 |
| N3 | 🍷 Sky Bug Fine Dining | 311–331 | 20 × 7,6 | nhà hàng sang (vào được, xem 5.3) | 🥩 Bò Wagyu áp chảo 180 – energy 25; 🦞 Tôm hùm nướng bơ tỏi 220 – energy 30; 🍷 Set tráng miệng 90 – coffee 20 |
| N4 | 🍦 Kem Smoke Test | 331–341 | 10 × 7,6 | tiệm | 🍦 Kem ốc quế 15 – energy 4; 🍨 Kem ly 3 vị 25 – energy 6 |
| N5 | 🍣 Sushi Unit Test | 341–351 | 10 × 7,6 | tiệm | 🍣 Sushi set 60 – energy 12; 🍜 Ramen 45 – energy 10 |

#### Dãy Nam (mặt tiền z = 108, nhìn ra phố hướng Bắc)

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

### 5.3 Nhà hàng Sky Bug Fine Dining — `restaurant()` FS:104–129, theme FS:131

- **Vị trí và kích thước:** trong N3; phòng ăn x 311,4–330,6 (19,2 m) × z 92,9–99,75 (6,85 m); trần cao 3,6 m (tầng 2 bên trên đặc). Cửa giữa rộng 2,4 m tại x = 321 (mặt tiền z = 100), hai bên là kính 3,1 m; xà cửa vàng.
- **Bố trí và nội thất:** sàn gỗ nâu sẫm bóng; trần kem phát sáng nhẹ; tường trong có va chạm; **quầy** đen 6 × 1,1 × 0,8 + mặt vàng ở z ≈ 94,5, giữa quầy x = 321; **4 bàn ăn** (bàn gỗ tối 1,4 × 1,0 + khăn trải trắng, nến phát sáng) tại x = 313,8; 317,4; 324,6; 328,2, z ≈ 97,35, mỗi bàn 2 ghế đỏ rượu vang (đối diện) → 8 chỗ ngồi ("Ngồi bàn Sky Bug Fine Dining"); **3 đèn chùm** cầu pha lê ở x = 316,5; 321; 325,5, cao 2,9 m; **đàn piano** đen 1,6 × 1,0 × 1,4 ở x ≈ 328,6, z ≈ 96,3.
- **Chức năng:** nhà hàng sang, đi bộ vào được.
- **Nhân vật:** không có nhân viên; khách bot tối đa 3 người, ăn các món "bò Wagyu / tôm hùm nướng / vang đỏ"; vào theo lối (321, 102,2) → (321, 98,7) rồi ra theo lối ngược.
- **Tương tác:** E ở quầy (r 2,2, ở z ≈ 95,9) → thực đơn 3 món (bảng N3); ngồi bàn (E/C). Camera bị hạn chế trong phòng (không xuyên tường sang nhà bên).
- **Kết nối:** cửa mặt Nam (phố đi bộ); lối khác không có.

### 5.4 Nhà hàng Lẩu Nướng Hotfix — `restaurant()` FS:132

- **Vị trí và kích thước:** trong S2; phòng ăn x 301,4–320,6 (19,2 m) × z 108,25–115,9 (7,65 m); trần cao 3,6 m (nâu sẫm). Cửa giữa rộng 2,4 m tại x = 311 (mặt tiền z = 108).
- **Bố trí và nội thất:** sàn gỗ nâu; quầy gỗ nâu 6 × 1,1 × 0,8 + mặt vàng ở z ≈ 114,3, x = 311; **4 bàn** gỗ (nâu sẫm) tại x = 303,8; 307,4; 314,6; 318,2, z ≈ 110,65, mỗi bàn 2 ghế gỗ nâu → 8 chỗ; giữa mỗi bàn có 1 trụ nhỏ đen kim loại (đóng vai bếp nướng; mã không dựng bếp thật); **8 đèn lồng** cam treo cao 3 m rải dọc phòng. Không có piano/đèn chùm.
- **Chức năng:** nhà hàng lẩu nướng.
- **Nhân vật:** không nhân viên; khách bot tối đa 3 người ("lẩu Thái / set nướng / nước mía").
- **Tương tác:** E ở quầy (r 2,2, ở z ≈ 112,9) → thực đơn 3 món (bảng S2); ngồi bàn.
- **Kết nối:** cửa mặt Bắc (phố đi bộ).

---

## 6. KHU CĂN HỘ SKY QC (`foodstreet.js`) — FS:134–176

### 6.1 Toàn khu và quảng trường

- **Vị trí và kích thước:** pad APT x 428–472, z 68–100; nền 1,7. Hai toà đặt tại tâm (439, 84) và (461, 84). Quảng trường giữa 2 toà tại (450, 84): đài phun nước bệ đá Ø 6 (r 3–3,2) có mặt nước; va chạm r 3,2.
- **Chức năng:** khu ở cao cấp; chỉ phần sảnh và sân thượng đi vào được.
- **Kết nối:** trong các file được đọc không có đường riêng nối vào pad này; đường xoắn ốc chạy ở phía Nam (xấp xỉ z ≈ 125 tại x ≈ 437). Chưa rõ lối vào bộ (mã chỉ có dịch chuyển bằng bản đồ và thang máy).

### 6.2 Toà A (x 431–447, z 76–92) và Toà B (x 453–469, z 76–92) — mỗi toà

- **Vị trí và kích thước:** chân toà 16 × 16 m; 20 tầng, mỗi tầng 3,2 m → cao 64 m (đỉnh ≈ 65,7); sảnh cao 4,6 m; thân kính trắng–xanh cửa sổ tối có vân; ban ngày hơi bóng, ban đêm đèn cửa sổ ngẫu nhiên ~45% tắt/sáng.
- **Bố trí:** **ban công** từ tầng 2 đến tầng 19: Bắc/Nam mỗi tầng một sàn 11,2 × 1,4 m (70% chiều rộng), Đông/Tây 1,4 × 8 m, lan can kính thấp 0,9 m (ngoại thất, không đi ra được — mã không có sàn đi lại; chỉ trang trí). Căn hộ bên trong từng tầng: **không có** (không dựng nội thất).
- **Sảnh kính:** tường kính cao 4,6 m 4 mặt; mặt Bắc (z = 76) có cửa rộng 2,6 m ở giữa; sàn đá sáng; **quầy lễ tân** 3,4 × 1,1 × 0,8 + mặt vàng ở (tâm x, z + 3); **2 sofa** xám xanh (2,4 × 0,45) ở x = tâm ± 4,5, z = tâm − 2, mỗi sofa 2 chỗ ngồi (nhãn "Ngồi sofa sảnh căn hộ (E · C)") → 4 chỗ; **bảng thang máy** inox 2,4 × 3 ở z ≈ tâm + 7,4.
- **Sân thượng (cao độ ≈ 65,9):** sàn 18,8 × 18,8 m (đá màu cát), lan can kính 1,1 m quanh, **hồ bơi tràn** 13 × 6 m (x tâm ± 6,5, z tâm + 1 → + 7), nước xanh phát sáng nhẹ (có va chạm chặn bước xuống), **5 ghế nằm** ở x = tâm − 5; − 2,5; 0; 2,5; 5, z ≈ tâm − 1,4 (nằm được: "Nằm ghế tắm nắng trên sân thượng (E · C)"), **cabin thang máy** 2,2 × 2,8 × 2,2 ở (tâm − 6, tâm − 6).
- **Chức năng:** sảnh tiếp tân + sân thượng hồ bơi ngắm toàn thành phố.
- **Nhân vật:** không có.
- **Tương tác:** E ở thang máy sảnh (r 1,8, tại (tâm x, tâm z + 6,8 − 0,4), khi ở dưới) → dịch chuyển lên sân thượng, toast "Tầng thượng · hồ bơi tràn ngắm toàn thành phố 🌇". E ở cabin sân thượng (r 1,8, tại (tâm − 6, tâm − 6)) → xuống sảnh (đặt ngoài cửa Bắc cách 3 m phía trước toà, "Đã xuống sảnh"). Ghế/sofa (E/C). Nhãn nổi "🏙️ Sky QC Residence · Căn hộ cao cấp · thang máy lên hồ bơi sân thượng" (nhìn thấy trong 160 m).
- **Kết nối:** cửa Bắc sảnh; thang máy dịch chuyển lên/xuống; bản đồ "Căn hộ Sky QC".

---

## 7. KHU BIỆT THỰ VEN ĐẦM (`riverside.js`)

### 7.1 Cổng gác, hàng rào, nhân viên — RV:94–113

- **Vị trí và kích thước:** hàng rào ngang z = 205 từ x 276 đến 356 (chừa lối xe/người rộng ≈ 9,2 m ở x ≈ 281,4–290,6 quanh đường ven biển x = 286), rồi rào dọc x = 356 từ z 205 xuống bờ đầm (z ≈ 244). Rào trắng kem cao 1,6 + cột tối 1,9 m, cách 2,4 m. **Chốt chặn:** xà đỏ 8,6 m ở cao 1,05 m (xoay lên khi mở), tâm đặt từ x = 281,7; **chòi gác** 2,4 × 2,6 × 2,2 tại (292,2; 203,6).
- **Bố trí:** biển nổi "🚧 Cổng gác · Khu biệt thự Ven Đầm · Chỉ cư dân · tham quan cùng hướng dẫn viên" (60 m) ở (286, 204). Va chạm: rào có tin nhắn "chỉ cư dân…", chốt chặn có tin nhắn "gặp hướng dẫn viên".
- **Nhân vật (nếu `W.people` có):**
  - 👮 **Bảo vệ khu biệt thự** — nam, đồng phục xanh navy, mũ lưỡi trai, đứng tại (292,2; 201,8) quay mặt về Nam, idle; không có tương tác.
  - 👩‍💼 **Linh · Hướng dẫn viên** — nữ (tóc dài/bob/đuôi ngựa), váy trắng, giày đen; đứng tại (279,5; 202,8) quay về Nam, idle; chấm vàng trên bản đồ. Câu thoại tiêu biểu: "Chào anh/chị! Mình chở đi một vòng khu Biệt thự Ven Đầm nhé – 4 căn, mỗi căn mình dừng giới thiệu."; "Mời anh/chị xuống xe vào xem căn mẫu Gió Biển – cứ tự nhiên lên tầng 2 ngắm đầm nhé!"
- **Tương tác:** E ở Linh (r 2,4): nếu chưa mua → hộp thoại "Tham quan Khu Biệt thự Ven Đầm — Miễn phí!" nút "Lên xe"; nếu đã mua (cư dân) → nhãn "Chào cư dân! Xem lại bảng giá / tham quan".
- **Chức năng:** hạn chế người lạ; cổng mở khi: cư dân (đã mua), có lượt tham quan còn hiệu lực (15 phút sau khi bắt đầu tham quan), hoặc xe đại gia/xe tham quan đi qua (cách cổng < 16 m).
- **Kết nối:** đường ven biển x = 286 đi xuyên qua cổng.

### 7.2 Tuyến tham quan có hướng dẫn viên — RV:115–152

- **Vị trí và kích thước:** xe sang trắng (kiểu 'lux', 2 tông màu) chạy theo làn phải: (284,2; 181) → (284,2; 217) → (290; 219,9) → (348; 219,9). Tốc độ tối đa 4,5 m/s, tăng tốc 1,5, phanh 3,0; dừng lần lượt trước 4 căn (x = 286, 302, 318, 334) mỗi lần 5,5 giây, camera đặt ở (x − 7; 8,3; 212) nhìn về căn (cao độ camera ≈ 8,3).
- **Tương tác:** nhấn "Lên xe" → người chơi ngồi vào xe (nhân vật ẩn, camera cách 9 m), toast giới thiệu; tại mỗi căn toast "Linh: Biệt thự … – N phòng ngủ, hồ bơi tràn, bến du thuyền riêng. Giá … 💰". Kết thúc: xuống xe ở căn Gió Biển (x ≈ 302), đặt trước cửa (302, 223,4), mở bảng giá (xem 7.4). Không giới hạn thời gian dừng, miễn phí.
- **Kết nối:** xe chạy trên đường ven biển và ngõ z = 218; chưa rõ cách hoà vào giao thông chung (dùng `TR.makePath`).

### 7.3 Biệt thự (mẫu chung cho cả 4) — RV:23–88

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

### 7.4 Mua biệt thự và bảng giá — RV:129–133, 157

- **Tương tác:** sau chuyến tham quan hiện bảng 4 thẻ (tên, "N phòng ngủ · 13 × 11 m · hồ bơi · bến riêng", giá, nút "Mua"). Bấm "Mua" → xác nhận trả tiền → trừ tiền → lưu `S.villa = chỉ số` → cổng luôn mở, toast chúc mừng "Bạn là chủ …". Mã chỉ lưu một căn (`S.villa` duy nhất), không hoàn tiền nếu mua căn khác.
- **Phần thưởng:** quyền vào cổng vĩnh viễn, điểm dịch chuyển "Biệt thự của bạn".

---

## 8. Phụ lục: tóm tắt thuật toán dựng đường/va chạm

- Đường (MAIN/COAST) sinh mẫu 1 m/điểm ở đoạn thẳng; đoạn xoắn ốc 1 điểm/đoạn (≈ 0,6 m).
- `nearRoad(x, z, maxD)` tra điểm đường gần nhất qua lưới ô 8 m; dùng cho địa hình, đặt nhà, đặt cây.
- Va chạm Phố Núi dùng `W.addSeg` (đoạn thẳng xoay tự do có giới hạn độ cao y0–y1) để tường xiên theo hướng đường.

---

## 9. BẢNG TÓM TẮT

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
