# 05. Khu Giải trí · Cao nguyên · Đảo Wonderland · Công viên Kỳ Quan · Biển sống động

Tài liệu hiện trạng kiến trúc, đọc từ mã nguồn (không chạy game). Phạm vi các file: `js/arena.js`, `js/highland.js`, `js/funisland.js`, `js/themepark.js`, `js/themerides.js`, `js/themeland2.js`, `js/coastertrack.js`, `js/sealife.js`.

## 0. Quy ước và cách đọc

- 1 ô = 1 m = 1 đơn vị toạ độ thế giới. Trục x Đông (+) – Tây (−), trục z Nam (+) – Bắc (−), y là độ cao. (Mã chú thích `z=−` là phía Bắc, ví dụ Cao nguyên ở z âm, đảo Wonderland và Công viên Kỳ Quan ở z dương.)
- "Chưa rõ" = giá trị phụ thuộc file ngoài phạm vi (ví dụ `CITY.arena`, `CITY.downtown`, `edgeR`, `W.addSeat`) hoặc mã không nói.
- "Ước tính" = số do người viết tài liệu tính lại từ công thức trong mã (không phải hằng số trong mã). Các số này được ghi rõ để Bình biết là suy ra.
- Giá tiền tính bằng 💰 (xu). Phím E = tương tác ở điểm `INTER`. Phím C = ngồi/đứng dậy (do `W.addSeat`/`W.addBench`, logic nằm ngoài phạm vi). Phím B = góc máy truyền hình (chỉ ở sân bóng). Phím F = nhảy ở concert (chỉ có trong chuỗi thông báo; mã xử lý phím F nằm ngoài các file này). Phím Q = đổi góc nhìn thứ nhất/thứ ba trên tàu lượn (xử lý ngoài phạm vi).
- Mỗi không gian ghi: vị trí, bố trí, chức năng, trò chơi, nhân vật, tương tác, kết nối. Phần "Bảng tóm tắt" ở cuối file.

### 0.1. Bản đồ tổng quát (theo toạ độ trong mã)

| Khu | File | Vị trí thế giới |
|---|---|---|
| Khu Giải trí QC Fun Park | arena.js | Phía Đông Downtown, qua cầu theo trục z = 0. Sân bóng tâm (334, −33); sân khấu concert tâm (388, 33); rạp phim x 279–315 · z 10–34; phố ẩm thực z = 46; vòng quay (331, 40). Biên khu = `CITY.arena` (chưa rõ). |
| Cao nguyên Bình Phan | highland.js | Phía Bắc Downtown. Lưới địa hình x 88–332 · z −342…−100. Phố cổ x 150–256 · z −182…−108. Thác Móng Ngựa tâm (216, −266). |
| Đảo QC Wonderland | funisland.js | Ngoài khơi phía Nam. Lưới địa hình x −10…132 · z 222…362, tâm đảo (61, 291). |
| Công viên Kỳ Quan | themepark.js (+ themerides, themeland2, coastertrack) | Phía Nam Đảo Wonderland. Lưới địa hình x −270…363 · z 372…1242. Cổ chai (cổng, Đại lộ Ánh Sao) x −40…116 · z 384…520; thân công viên x −256…348 · z 500…1230. |
| Biển sống động | sealife.js | Du thuyền: vịnh phía Bắc đảo chính (đoạn đường z −136…−50). Lướt ván: bờ Đông-Nam đảo chính. Mô tô nước: vịnh phía Nam, tâm (106, 52). Dù bay: ngoài khơi phía Nam, tâm (−60, 190). |

Chuỗi di chuyển giữa các khu: Downtown → (cầu x = 178 hướng Bắc) → Cao nguyên; Downtown → (cầu z = 0 hướng Đông) → Khu Giải trí; đảo chính (Master Dashboard) → cáp treo → đảo Wonderland → cầu đá (40, 337→395,5) → Công viên Kỳ Quan.

### 0.2. Cơ chế dùng chung

- **Vé có thời hạn (arena.js):** `S.fun.tickets[k]` lưu mốc hết hạn. Vé sân bóng 30 phút, concert 30 phút, rạp phim 20 phút. Mua vé xong cổng (hộp va chạm) bị gỡ khỏi danh sách `boxes`; đang ở bên trong thì cổng luôn mở để khỏi bị nhốt khi hết vé.
- **Buff đồ ăn (arena.js):** hai loại, `energy` = nhanh hơn 40 %, `coffee` = thưởng quiz +20 %, cộng dồn thời gian; lưu trong `S.buffs`.
- **Hộp va chạm:** `boxes` (hộp chữ nhật, có thể có y0/y1), `circles` (cột tròn), `addPlat` (sàn đứng được ở cao độ khác mặt đất), `addSeg` (đoạn rào có thông báo khi chạm).
- **Mức chi tiết theo khoảng cách (themepark.js):** 4 nhóm hiển thị: `gLand` (ray, trụ, vòng quay, tháp, cổng; < 1050 m), `gFar` (lối lát, nhà, cầu, ga; < 560 m), `gMid` (tán lá, đoàn tàu, kính cabin; < 520 m), `gNear` (rào, ghế, đèn, quầy; < 430 m).
- **Luồng lên trò chơi ở Công viên Kỳ Quan (themerides.js):** cổng tên trò → quầy vé + cổng soát vé (E trả tiền, thanh chắn mở khi đứng trong vùng cổng) → hàng rào xếp hàng zíc-zắc 3 làn × 12 m có mái → sân ga → tàu vào ga, bấm E thì nhân vật TỰ ĐI BỘ lên ghế (tốc độ 2,3 m/s), bước vào ghế 0,6 s, đai an toàn hạ khoảng 1,1–1,5 s → chạy → về ga, đai mở 0,8 s, bước xuống → ra theo "LỐI RA" một chiều. Không dịch chuyển tức thời. Vé dùng một lần (`tix[id]` reset sau khi xuống).
- **Góc nhìn:** mặc định camera đuổi theo toa; Q chuyển góc nhìn thứ nhất bám khung toa (lộn vòng thật, FOV 66–82° theo tốc độ, rung khi có sự kiện).
- **Âm thanh:** tất cả tự tạo bằng WebAudio (không file âm thanh): nhạc concert 124 BPM, tiếng thác, gió tàu lượn, chuông mua vé, tiếng sấm, tiếng gầm, v.v. Chỉ bật sau khi người chơi đã tương tác với trang.

---

# PHẦN A. KHU GIẢI TRÍ "QC FUN PARK" (`js/arena.js`)

## 1. Nền Khu Giải trí, lan can, đại lộ z = 0
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

## 2. Cầu Downtown → Khu Giải trí
- **Nguồn:** `arena.js:50–59`.
- **Vị trí và kích thước:** từ x = `CITY.downtown.x1` đến x = AX0, dọc trục z = 0; rộng 10 m (z −5…5); dài = AX0 − downtown.x1 (chưa rõ, hai giá trị ngoài phạm vi). Mặt cầu dày 0,4 m ở y −0,05; mặt nhựa rộng 7 m ở y 0,16.
- **Bố trí:** hai bên lan can bạc cao 1,05 m tại z = ±4,9, cột mỗi 2 m. Sàn đứng được `addPlat` cao 0,15; hộp chặn hai mép tại z ±4,85…5,2. Mã tự cắt lan can bờ Đông Downtown một đoạn z −5,5…5,5 để thông cầu.
- **Chức năng:** nối hai khu.
- **Kết nối:** Downtown (bờ Đông) ↔ cổng chào Khu Giải trí.

## 3. Cổng chào QC FUN PARK
- **Nguồn:** `arena.js:67–76`.
- **Vị trí và kích thước:** tâm (AX0+4, 0). Hai trụ tròn đường kính ≈ 1,0–1,2 m, cao 9 m tại z = ±7,2 (hở giữa 14,4 m); xà ngang 1 × 1,8 × 15,4 ở y 8,2.
- **Bố trí:** mỗi trụ có quả cầu vàng ở đỉnh (y 9,3). Hai mặt xà có bảng 15 × 1,6 m ghi "🎡 QC FUN PARK · KHU GIẢI TRÍ" nền gradient hồng–vàng–xanh ngọc, phát sáng mạnh hơn ban đêm.
- **Chức năng:** biển hiệu lối vào khu.
- **Tương tác:** không.

## 4. Sân bóng QC Arena
Gồm nhiều phần; ghi từng phần.

### 4.1. Sân cỏ, khung thành, tường ngoài
- **Nguồn:** `arena.js:78–125`.
- **Vị trí và kích thước:** tâm SC = (334, −33). Sân cỏ 44 × 28 (x 312…356, z −47…−19), mặt y = 0,05; nền cỏ tối 56 × 38 ở y 0,015. Khung thành rộng 5,2 m, cao 2,0 m, tại x = 312 và x = 356 (giữa z = −33), có lưới sàn sâu 1,6 m. Tường ngoài xanh dương cao 3,2 m, dày 0,4: x 300…368, z −59…−10 (68 × 49).
- **Bố trí:** sân kẻ vạch trắng: vòng tròn giữa, vòng phạt hai đầu; cỏ sọc 12 dải. Cổng Nam ở giữa tường nam (z = −10): rộng 5,2 m (x 331,4…336,6); trên có xà vàng 6,4 × 1,2 cao tới y ≈ 4,4 và hai trụ vàng.
- **Chức năng:** nơi diễn ra trận QC FC vs Bug United.
- **Tương tác / Kết nối:** cổng Nam chỉ mở khi có vé (xem 4.5). Đường dẫn: từ đại lộ z = 0 đi lên phía Bắc (z âm) tới cổng tại (334, −10).

### 4.2. Khán đài
- **Nguồn:** `arena.js:93–108`.
- **Vị trí và kích thước (7 bậc, mỗi bậc rộng 0,85 m, cao thêm 0,45 m/bậc, bậc cao nhất 3,15 m; có sàn đứng bậc 0,45 m leo được từ phía sân):**
  - Bắc: x 307…361 (54 m), z từ −51 tới −56,95.
  - Tây: x từ 308 tới 302,05, z −50…−16 (34 m).
  - Đông: x từ 360 tới 365,95, z −50…−16.
  - Nam: chỉ 3 bậc, hai nửa (x 307…330 và x 338…361), z từ −15 tới −12,45; chừa lối giữa rộng 8 m (x 330…338) cho đường vào từ cổng.
- **Bố trí:** mỗi bậc có mặt trên sơn màu xen kẽ xanh ngọc – trắng – hồng – vàng. Lưng và hai đầu khán đài có hộp chặn cao hơn mặt bậc để người chơi không chui vào khối bậc.
- **Nhân vật (khán giả):** khoảng 700 cổ động viên (một lượt vẽ `InstancedMesh`, tô màu xanh ngọc/trắng/đỏ/vàng/xanh dương/đen), xác suất ngồi 82 % mỗi chỗ; nhún nhảy theo shader, khi ghi bàn cả sân nhảy cao hơn trong ~3 giây. Khán giả không có tên/thoại.
- **Chức năng:** chỗ ngồi xem bóng.

### 4.3. Mái che khán đài Bắc, cột đèn pha, bảng tỉ số
- **Nguồn:** `arena.js:109–138`.
- **Mái Bắc:** tấm 58 × 0,25 × 9 nghiêng nhẹ ở y 10,6, tâm z ≈ −55; 7 cột bạc cao 10,4 m cách nhau 9,2 m, tại z ≈ −59 (x = 334 −28 … +27,2).
- **Đèn pha:** 4 cột bạc cao 22 m tại (303, −55,5), (365, −55,5), (303, −10,5), (365, −10,5); đầu đèn phát sáng mạnh ban đêm; có quầng sáng. Sân cỏ phát sáng nhẹ ban đêm.
- **Bảng tỉ số:** khung 0,6 × 5,4 × 9,4 m ở x ≈ 365,5, z = −33, tâm y 11,5, hai chân cao 9 m tại z = −36,5 và −29,5; màn 8,8 × 4,4 m quay vào sân. Hiển thị tên 2 đội, tỉ số, phút trận hoặc "NGHỈ GIỮA HIỆP"/"HẾT GIỜ".

### 4.4. Trận bóng (trò chơi nền, miễn phí xem)
- **Trò chơi:** 2 đội × 5 cầu thủ (1 thủ môn, 2 hậu vệ, 2 tiền đạo). Đội 0 "QC FC" (áo xanh ngọc, quần trắng) chống khung thành phía Tây, ghi vào khung thành Đông; đội 1 "Bug United" (áo đỏ hồng, quần xanh đen). Thủ môn áo vàng (đội 1 áo xanh dương nhạt). Sơ đồ ban đầu (đội 0): thủ môn cách tâm 19 m, 2 hậu vệ cách 12 m (z ±6), 2 tiền đạo cách 5 m (z ±4); đội 1 đối xứng.
- **Thông số trận:** 1 "phút" trận = 3,6 s thật; hiệp 1 từ 0 → 45 phút (162 s), nghỉ 8 s, hiệp 2 đến 90 phút (tổng ≈ 324 s chơi), sau trận nghỉ 14 s rồi reset tỉ số về 0-0 và đá lại. Sau mỗi bàn nghỉ 4 s rồi giao bóng lại (đội giao bóng luân phiên theo tổng số bàn). Tốc độ cầu thủ 3,2 m/s đi, 4,4 m/s mang bóng, 4,8 m/s đuổi bóng; thủ môn 4 m/s. Sút khi cách khung thành < 15 m (vận tốc bóng 15–20 m/s), chuyền khi có đối thủ cách < 2,4 m, thủ môn cản 50 % khi bóng bay về phía mình và cách < 2,6 m.
- **Nhân vật:** 10 cầu thủ bot, tên dạng "QC FC · Thủ môn", "QC FC · Số 5…9", "Bug United · Thủ môn", "Bug United · Số 5…9"; 1 trọng tài "Trọng tài" (áo đen) đứng sát mép Nam sân (z = −22, cách vạch biên Nam 3 m), đi theo bóng dọc trục x với tốc độ ≤ 3 m/s.
- **Thoại tiêu biểu (thông báo trên màn hình khi người chơi đứng gần ≤ 70–80 m):** "⚽ VÀOOO! … ghi bàn – x-y", "🧤 Thủ môn cản phá xuất sắc!", "🏁 Hết trận: QC FC x - y Bug United".

### 4.5. Quầy vé + cổng sân bóng
- **Nguồn:** `arena.js:125, 226–229`.
- **Vị trí:** điểm tương tác tại (334, −7,8), bán kính 3,2 m (trước cổng, ngoài tường).
- **Tương tác:** bấm E: nếu chưa có vé hiện hộp xác nhận mua "Vé xem bóng đá QC FC vs Bug United" 20 💰 / 30 phút (ra vào tự do); mua xong cổng mở. Nếu đã có vé: hướng dẫn "Đi qua cổng vào sân, lại gần hàng ghế đầu khán đài Nam bấm C để ngồi – bấm B để xem góc máy truyền hình."
- **Kết nối:** cổng Nam (x 331,4…336,6, z −10).

### 4.6. Ghế khán đài Nam + góc máy truyền hình
- **Nguồn:** `arena.js:230–233, 491–492`.
- **Vị trí:** 14 ghế ngồi tại bậc đầu khán đài Nam, z ≈ −14,58, y 0,51, quay mặt hướng Bắc (rot = π): 7 ghế ở x 328…321,4 (cách nhau 1,1 m) và 7 ghế x 340…346,6.
- **Tương tác:** E hoặc C để ngồi. Khi đang ngồi, phím B bật/tắt góc máy truyền hình: camera ở độ cao 13 m, z ≈ 0 (phía sau khán đài Nam), x bám theo bóng (giới hạn 328…340), nhìn vào bóng. Đứng dậy sẽ tự tắt.

## 5. Sân khấu QC Live Arena (concert)
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

## 6. Rạp QC Cinema
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

## 7. Phố ẩm thực
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

## 8. Vòng quay QC Eye
- **Nguồn:** `arena.js:441–474`.
- **Vị trí và kích thước:** trục tại FW = (331, y 18,3, 40), bán kính vòng 15 m (đỉnh ≈ 33,3 m ≈ "33 m"), 12 cabin. Hai vòng thép song song cách nhau 2,6 m (z 38,7 và 41,3), có vòng LED viền phát sáng đổi màu, ban đêm sáng mạnh hơn. Chân đế chữ A: 4 chân thép (z = 40 ± 3,2, đi xiên tới x = 331 ± 9), trục ngang; bệ đế 7 × 0,5 × 5 tại (331, 40) với sàn đứng cao 0,5 (x 327,5…334,5, z 37,5…42,5).
- **Bố trí:** cabin hình trụ trắng với tấm sàn xanh ngọc, 6 màu hồng/vàng/xanh ngọc/xanh dương/tím/xanh lá nhạt lặp, lắc nhẹ.
- **Chức năng:** ngắm toàn thành phố.
- **Trò chơi:** quay 0,1 rad/s → 1 vòng ≈ 62,8 s; vé 15 💰.
- **Nhân vật:** không có.
- **Tương tác:** điểm E tại (331, 44), bán kính 3,2 m: hộp "Vé vòng quay QC Eye – lên cao 33 m ngắm toàn thành phố (khoảng 1 phút)"; sau khi trả tiền chờ cabin xuống đáy (góc 1,5π), bước vào cabin, camera lùi ra 11 m, kéo chuột để xoay ngắm. Hết đúng 1 vòng, nhân vật đứng lại ở (331, 44). Nếu người chơi rời sàn xa hơn 12 m khi đang chờ cabin → hoàn vé 15 💰.
- **Kết nối:** đại lộ z = 0 / phố ẩm thực. Dịch chuyển "Vòng quay QC Eye" tới (331, 46) nhìn về vòng quay.

---

# PHẦN B. CAO NGUYÊN BÌNH PHAN (`js/highland.js`)

## 9. Địa hình tổng thể Cao nguyên
- **Nguồn:** `highland.js:19–82, 190–203`.
- **Vị trí và kích thước:** lưới địa hình x 88…332, z −342…−100 (244 × 242 m), lưới ô 2 m (123 × 122 đỉnh), vẽ và va chạm khớp nhau (nội suy theo đúng 2 tam giác lưới). Độ cao tối đa trong lưới ≈ 66,5 m (tính lại từ công thức); đỉnh dùng đặt chòi: (296, −306), cao ≈ 63 m. Phố cổ phẳng ở độ cao 1,3 m trong x 150…256, z −182…−108.
- **Bố trí:** dãy núi đá bao phía Bắc (z < −185…), Đông và Tây (nhiễu fBM + ridged, cố định), vùng cỏ/rừng/đá/bùn/cát tô theo độ cao, độ dốc, gần sông, bờ biển. Mép đảo ngả xuống biển −6,5 m. Sông chảy từ núi.
- **Chức năng:** nền cảnh quan và đường tới phố cổ, thác.
- **Kết nối:** cầu x = 178 từ Downtown (không gian 10); taxi: thêm 2 nút (178, landZ−4) và (178, −174) nối nút Downtown gần (178, D.z0) nhất; 2 điểm đến taxi "Phố cổ Riverside (Cao nguyên)" tại (178, −135) và "Đường lên Thác nước" tại (178, −176).

## 10. Cầu nối Downtown → Cao nguyên (phố x = 178)
- **Nguồn:** `highland.js:190–203`.
- **Vị trí và kích thước:** trục x = 178, rộng 10 m (x 173…183). Từ z = `CITY.downtown.z0` (chưa rõ) đến z = landZ − 3, với landZ = chỗ đầu tiên đi xuống từ Downtown tại x = 178 mà địa hình cao hơn 0,6 m (ước tính −110, tức cầu kết thúc ≈ z −113). Mặt cầu dày 0,5 ở y −0,05, mặt nhựa rộng 7 m ở y 0,22.
- **Bố trí:** lan can bạc cao 1,1 m tại x = 178 ± 4,9 (hộp chặn), cột mỗi 2,5 m; trụ cầu tròn cứ 11 m xen kẽ trái/phải ở y −2,2; cột đèn phía x = 172,4 mỗi 12 m. Mã cắt lan can bờ Bắc Downtown một đoạn rộng x 172,5…183,5 chỗ chân cầu.
- **Chức năng:** đường dẫn vào Cao nguyên.
- **Kết nối:** Downtown ↔ đầu Nam phố cổ (z ≈ −108). Dịch chuyển "Cầu sang Cao nguyên" tới (180, D.z0 − 6) nhìn về (178, landZ).

## 11. Phố cổ Riverside (Hội An thu nhỏ)
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

## 12. Hai cầu gỗ cong qua sông
- **Nguồn:** `highland.js:235–245`.
- **Vị trí và kích thước:** cầu 1 tâm (190, −131), cầu 2 tâm (190, −158); mỗi cầu dài 12 m (x 184…196) × rộng 3,2 m (z ± 1,6), mặt cong hình vòm cao từ 1,35 lên 2,45 m ở giữa; 9 tấm ván, 16 đoạn sàn đứng bám cung (mỗi bậc ≤ 0,25 m).
- **Bố trí:** lan can đỏ (cột + ống uốn theo vòm) hai bên, 2 đèn lồng mỗi cầu ở đỉnh vòm (y ≈ 3,2). Gầm cầu có hộp chặn (y −9…1) để không lội sông chui xuyên mặt cầu.
- **Chức năng:** qua sông giữa hai phố.
- **Kết nối:** hai phố x = 178 và x = 202.

## 13. Chợ đêm ven sông (bờ Đông)
- **Nguồn:** `highland.js:250–253`.
- **Vị trí và kích thước:** 5 sạp tại x = 198,6, z = −137, −143,5, −150, −164,5, −171 (chừa đầu hai cầu gỗ). Mỗi sạp thân 2,2 × 1 × 3,4 (kem), mái 2,8 × 0,1 × 4 màu riêng (đỏ gạch, vàng, xanh ngọc, tím, cam san hô) nghiêng nhẹ, hai cột.
- **Chức năng:** trang trí chợ đêm, có đèn sáng ban đêm.
- **Nhân vật / Tương tác:** không có (mã không đặt người bán hay điểm E).
- **Kết nối:** sát phố x = 202, phía sông.

## 14. Thác Móng Ngựa (rèm nước, hồ trên, hồ dưới)
- **Nguồn:** `highland.js:27–38, 94–132, 177–188`.
- **Vị trí và kích thước:** gốc toạ độ thác FC = (216, −266); trục dọc dòng chảy hướng (−0,217; 0,976) (gần như +z, nghĩa là chảy về Nam), trục ngang (0,976; 0,217). Rèm nước móng ngựa rộng 52 m (±26), mép thác lõm vào giữa 11 m, đỉnh thác y = 44, chân thác y = 20 (cao 24 m). Hai đầu rèm ở xấp xỉ (189,9; −268,3) và (240,6; −257,0), điểm giữa ≈ (217,6; −273,4). Hồ trên kéo dài ~48 m phía trên mép (tới ≈ (226; −313)); hồ dưới rộng ±40 m, dài tới ≈ (208; −229). Bọt sôi 3 dải ở chân thác, sương mù 170 hạt bay lên 17 m, đá hộ ở hai bờ hồ và chân thác (23 khối).
- **Chức năng:** cảnh quan chính; có tiếng thác.
- **Âm thanh:** tiếng ù trầm + rào rào (nhiễu lọc), to dần khi lại gần (30 m ≈ 33 %, 50 m ≈ 15 %, 100 m ≈ 5 %), bị tắt nếu: người chơi đeo tai nghe trong game, đã tắt "Âm thanh môi trường", ở trong nhà, hoặc xa hơn 220 m.
- **Nhãn 3D:** "🌊 Thác Móng Ngựa Cao Nguyên – Rộng 52 m · cao 24 m" ở y 53 (hiện từ xa tới 260 m).
- **Tương tác:** không có E; đi bộ lại gần tuỳ thích (sàn thác có mặt nước, rào chặn không cho xuống).
- **Kết nối:** lối dạo từ phố cổ (không gian 15); bậc đá (17).

## 15. Lối dạo phố cổ → đài ngắm chân thác (và lối nối)
- **Nguồn:** `highland.js:39–49, 168–176`.
- **Vị trí và kích thước:** lối chính TRAIL gồm 7 điểm trong hệ toạ độ thác, từ (203,5; −178) (cao 1,32, ngay đầu Bắc phố x = 202) đến (246,5; −232,6) (cao 20,9) — mặt lát đá rộng 2,8 m, đường dốc từ 1,3 lên ~20,9 m. Lối nối LINK 4 điểm rộng 2,4 m từ cuối TRAIL đến chân bậc đá ≈ (280,9; −247,3) ở cao ~22 m. Ba cột đèn dọc lối ở các cao độ 10,9 / 18,9 / 21,8 m.
- **Chức năng:** đi bộ lên thác.
- **Kết nối:** phố cổ (đầu Bắc phố đông) → Đài ngắm Chân Thác → bậc đá → Đài ngắm Đỉnh Thác.

## 16. Đài ngắm Chân Thác
- **Nguồn:** `highland.js:145–151`.
- **Vị trí và kích thước:** sân đá lát tâm ≈ (251; −238,8), cao độ 20,9 (mặt đứng ≈ 21,0); 14 m (hướng ngang thác) × 16 m (dọc thác), góc ≈ (245,8; −248,1) – (256; −229,4). Sàn gỗ vươn ra mặt hồ dài ~6,8 m × rộng 14 m ở hướng rèm nước, tâm ≈ (237,7; −241,7), cách rèm nước ~9 m; 6 cột gỗ chống dưới sàn (cao 3,2 m).
- **Bố trí:** lan can đen (cột + tay vịn gỗ tối + 2 thanh) quanh sàn và dọc ba mặt; 2 ghế băng quay thẳng về rèm nước (bắt buộc ngồi bằng E hoặc C, nhãn "🪑 Ngồi ngắm thác (E · C)") tại toạ độ thác (a, b) = (23,5; 36,5) và (21; 43,5). Nhãn 3D "🌊 Đài ngắm Chân Thác – Sàn gỗ vươn ra mặt hồ · bậc đá lên đỉnh thác ở phía Đông".
- **Chức năng:** ngắm thác từ chân.
- **Tương tác:** ghế E/C; lan can có thông báo "Lan can đài ngắm – thác ở ngay trước mặt!". Dịch chuyển "Thác Móng Ngựa · Đài ngắm Chân Thác" tới (≈ 241,7; −240,8) nhìn về rèm nước.
- **Kết nối:** lối dạo (15) ở phía Tây-Nam; bậc đá (17) phía Đông.

## 17. 100 bậc đá lên Đỉnh Thác
- **Nguồn:** `highland.js:152–161`.
- **Vị trí và kích thước:** 100 bậc, mỗi bậc sâu 0,3 m, cao 0,226 m (đi từ cao độ 22 lên 44,6), rộng 3,6 m; chân bậc ở xấp xỉ (277,6; −248,0), đỉnh ≈ (248,3; −254,5). Đi men chân vách đá ôm vào mép Đông của thác. Chiếu nghỉ trên (đỉnh) và chiếu nghỉ dưới (chân) rộng 5,2 m.
- **Bố trí:** lan can mảnh (cột đen mỗi 5 bậc, tay vịn gỗ + thanh kim loại); nhãn "⛰️ Bậc đá lên Đỉnh Thác – 100 bậc men vách · vừa leo vừa ngắm rèm nước"; thông báo chạm rào "Lan can bậc đá – bên dưới là hồ chân thác".
- **Chức năng:** đường lên đỉnh thác.
- **Kết nối:** chân bậc ↔ lối nối LINK; đỉnh bậc ↔ Đài ngắm Đỉnh Thác.

## 18. Đài ngắm Đỉnh Thác
- **Nguồn:** `highland.js:162–167`.
- **Vị trí và kích thước:** sân đá lát tâm ≈ (253; −264,2), cao độ 44,6; 15 m (ngang) × 13,5 m (dọc dòng), góc ≈ (247,1; −272,4) – (258,8; −256). Ngay mép nước đổ.
- **Bố trí:** lan can phía mép thác ("Lan can đỉnh thác – nước đổ xuống 24 m ngay dưới chân"), 1 ghế băng ("Ngồi ngắm đỉnh thác (E · C)") tại toạ độ thác (−7; 40,5), 2 cột đèn ở hai góc; nhãn "🌊 Đài ngắm Đỉnh Thác – Đứng ngay mép nước đổ · nhìn xuống hồ và phố cổ".
- **Tương tác:** E/C ngồi ghế. Dịch chuyển "Thác Móng Ngựa · Đài ngắm Đỉnh Thác" tới (≈ 248,8; −263,8).
- **Kết nối:** 100 bậc đá.

## 19. Chòi ngắm cảnh trên đỉnh núi
- **Nguồn:** `highland.js:278–288`.
- **Vị trí và kích thước:** trên đỉnh cao nhất ngoài vùng thác: (296, −306), độ cao ≈ 63 m (ước tính). Nền đá hình trụ bán kính 3,6–3,9, cao 0,5; 6 cột gỗ cao 3 m bán kính 3; mái hai tầng nón đỏ (bán kính 4,6 và 2,4); cột cờ cao 3 m với lá cờ đỏ phấp phới. Sàn đứng bán kính 3,5.
- **Chức năng:** điểm ngắm toàn cảnh.
- **Tương tác:** E trong bán kính 3,5 m: camera điện ảnh bay tới (PEAK.x+30, PEAK.h+28, PEAK.z+55) nhìn về (200, 10, −150); thông báo "Toàn cảnh cao nguyên – di chuyển để thoát."; nhãn "Chòi ngắm cảnh – cao 63 m". Dịch chuyển "Chòi ngắm cảnh đỉnh núi" tới (298, −304).
- **Kết nối:** không có lối đường bộ nào nêu trong mã; chỉ tới được bằng dịch chuyển hoặc đi bộ leo núi tự do.

## 20. Rừng
- **Nguồn:** `highland.js:259–276`.
- **Số lượng:** tối đa 2.100 cây trong 2 `InstancedMesh` (thông: độ cao > 14 hoặc 45 % số còn lại; lá rộng: phần còn lại); cây chỉ mọc ở độ cao 2,2…56 m, dốc ≤ 0,9, tránh phố cổ, tránh sông và vùng thác, tránh vành đai quanh đường x = 178 (phía Nam của landZ − 25).
- **Va chạm:** tối đa 380 cây thấp (y < 16) có vòng chặn bán kính ≈ 0,35·tỉ lệ.
- **Chức năng:** cảnh quan.

---

# PHẦN C. ĐẢO QC WONDERLAND (`js/funisland.js`)

## 21. Địa hình đảo QC Wonderland
- **Nguồn:** `funisland.js:14–29, 196–197`.
- **Vị trí và kích thước:** lưới x −10…132, z 222…362 (142 × 140, ô 2 m); tâm đảo IC = (61, 291); bán kính bờ 57 m ± ~7 m thay đổi theo góc; mặt đảo phẳng y = 1,7, dốc ra biển trong 7 m rồi xuống −6.
- **Bố trí:** mặt cỏ, vòng lối cát bán kính 26 m (rộng ~4,4 m), 6 nan hoa (lối) dài 50 m từ tâm đi ra theo góc 60°·k + 0,3 rad (rộng ~3,6 m), quảng trường trung tâm bán kính 9 m tô màu tím nhạt; bờ cát. 16 cột đèn + cờ vòng quanh đảo (bán kính bờ − 10 m): cao 6 m, cờ đỏ/vàng/xanh dương/tím luân phiên, quầng sáng hồng/vàng/xanh dương.
- **Chức năng:** nền công viên giải trí.
- **Nhãn 3D:** "🎡 Đảo QC Wonderland – Tàu lượn · tháp rơi · thuyền hải tặc · nhà ma" ở y 23,7 trên tâm (hiện đến 300 m).
- **Kết nối:** cáp treo (22); cầu đá phía Nam (40, 337 → 395,5) tới Công viên Kỳ Quan (30); dải lát 6 × 22 m tại (40, 326,5) dẫn tới đầu cầu. Dịch chuyển "Đảo QC Wonderland" tới (57, 245) nhìn về tâm (61, 291).

## 22. Cáp treo dài (2 ga, trụ giữa, cầu tàu)
- **Nguồn:** `funisland.js:42–79`.
- **Vị trí và kích thước:** ga đảo chính SA tại hướng (6, 84) từ gốc toạ độ, cách mép đảo chính 9 m về phía biển (giá trị cụ thể phụ thuộc `edgeR` ngoài phạm vi: chưa rõ); ga đảo giải trí SB = (54, 239). Chiều dài tuyến ~170 m (theo nhãn trong mã). Mỗi ga: sàn trắng 12 × 0,4 × 10 ở y 1,0, mái xanh ngọc 13 × 0,4 × 11 ở y 7,2, 4 cột thép cao 7,2, bánh dẫn cáp (đĩa đen) ở y 6,4. Trụ giữa: tại điểm giữa hai ga, cao 48 m (thân thép đường kính 3,2→4,8 m tới đáy biển, xà ngang 10 m ở y 47). Hai dây cáp song song cách nhau 6 m; cabin chạy từ độ cao 2,6 m ở ga tới 44 m ở giữa tuyến, dây cáp cao hơn cabin 2,2 m.
- **Cầu tàu nối bờ đảo chính:** rộng 3 m, mặt gỗ ở y 0,95, đầu cầu tự lùi tới chỗ trống đầu tiên không đâm vào toà Brand QA (tránh bị chặn), có bậc gỗ nếu bờ thấp hơn sàn > 0,6 m (mỗi bậc ≤ 0,3 m), cọc đen mỗi 3 m dưới nước.
- **Trò chơi:** 2 cabin đối trọng (cabin vàng và cabin mái đỏ), vận tốc 4,2 m/s, giảm tốc 14 m cuối mỗi đầu (không dưới 0,25 lần); 1 chuyến ≈ 40 s (ước tính 170/4,2) + đỗ ga 8 s đầu / 9 s mỗi lần tới ga. Vé 15 💰 mỗi chiều.
- **Nhân vật:** không có.
- **Tương tác:** hai điểm E bán kính 4 m ở mỗi ga: "Cáp treo ra Đảo QC Wonderland – 15 💰 (E)" (ga chính) và "Cáp treo về đảo Master Dashboard – 15 💰 (E)" (ga giải trí); điều kiện: cabin đang đỗ ở ga đó, nếu không báo "Cabin đang chạy – đợi cabin về ga (~… giây)". Trong cabin: ngồi, camera lùi 10 m, kéo chuột để ngắm. Đến nơi: thông báo "Chào mừng tới Đảo QC Wonderland!" hoặc "Đã về đảo Master Dashboard."
- **Nhãn 3D:** "🚡 Cáp treo ra Đảo QC Wonderland – Vé 15 💰 · bay ~170 m qua biển" ở ga chính (y 9,5).
- **Kết nối:** đảo Master Dashboard ↔ đảo Wonderland. Dịch chuyển "Ga cáp treo ra Đảo Wonderland": lùi 6 m phía sau ga.

## 23. Cổng lâu đài, quảng trường, đu quay ngựa gỗ
- **Nguồn:** `funisland.js:81–90`.
- **Cổng:** tâm (57, 251) (SB.x+3, SB.z+12), hai trụ hồng cao 9 m tại x = 52 và 62 (đường kính 2,8–3,2), nón tím cao 3,4 trên đỉnh, xà ngang 8,6 × 1,6 ở y 7,6, bảng "QC WONDERLAND" nền tím chữ vàng 8,4 × 1,1.
- **Đu quay ngựa gỗ:** tâm đảo (61, 291), bán kính sàn 6 m, mái nón đỏ cao 2,4 ở y 5,4, trục vàng; 10 ngựa 5 màu trên cột vàng. Quay 0,35 rad/s (~18 s/vòng); đây là vật trang trí, mã không có điểm E để cưỡi. Vòng chặn bán kính 6,3 m. Nhãn "🎠 Đu quay ngựa gỗ".
- **Chức năng:** cổng vào và trung tâm đảo.
- **Kết nối:** ga SB ↔ cổng ↔ quảng trường ↔ nan hoa tới các trò.

## 24. Tàu lượn "Siêu Bug"
- **Nguồn:** `funisland.js:92–122`.
- **Vị trí và kích thước:** đường ray khép kín đi qua 14 điểm điều khiển (x 13…58, z 262…322); cao độ ray từ 3,5 đến 26,5 (đỉnh dốc 24 m so với mặt đảo, nhãn "dốc 24 m · xoắn ốc"). Hai thanh ray đỏ cách nhau 1,1 m, tà vẹt tối, trụ thép mỗi 5 m dưới ray cao > 1,6 m.
- **Sân ga:** sàn 18 × 0,5 × 4 tại (33, 258,5), cao +1,15 m; 3 bậc lên ở đầu Tây (x ≈ 22,5…24); mái tím 19 × 0,3 × 9 tại (33, 262), cao +5,2; hộp chặn gầm sân ga x 24…42, z 256,5…260,5.
- **Trò chơi:** đoàn tàu 3 toa (vàng, xanh dương, xanh lá); vé 25 💰; vận tốc: lăn chậm 3,2 m/s qua 12 m đầu và xích kéo lên dốc, sau đó chuyển hoá thế năng (v ≈ √(E − 2·g·h)·0,97, tối thiểu 3 m/s), phanh trong 30 m cuối. Dwell: 8 s lúc khởi động, 10 s ở ga. Tốc độ vượt 14 m/s thì phát tiếng hét/gió.
- **Nhân vật:** không có.
- **Tương tác:** E tại (33, 257,4), bán kính 3 m: "Lên tàu lượn Siêu Bug – 25 💰 (E)"; tàu chỉ nhận khách khi đang đỗ và còn ≥ 2 s; không thì báo "Tàu đang chạy – đợi chuyến sau (~… giây)". Camera đuổi theo hoặc nhìn từ sau toa đầu. Kết thúc: "Phew! Ghê không? 😆", nhân vật đứng lại ở (33, 257).
- **Nhãn:** "🎢 Tàu lượn Siêu Bug – Vé 25 💰 · dốc 24 m · xoắn ốc".

## 25. Tháp rơi tự do 60 m
- **Nguồn:** `funisland.js:124–139`.
- **Vị trí và kích thước:** (100, 300); thân thép cao 60 m (đường kính 3–3,8 m), đầu đỏ trên đỉnh, 5 vòng vàng; bệ trắng đường kính ~9,4 m. Vòng chặn bán kính 4,2 m.
- **Trò chơi:** vòng ghế tím (12 ghế, bán kính 3,2 m) kéo lên 3,2 m/s tới độ cao 56 m (mất ~16–17 s ước tính), treo 3,2 s, rơi tự do (g = 9,81) tới ngưỡng 16 m rồi phanh giảm tốc 26 m/s². Vé 25 💰.
- **Tương tác:** E tại (105,2; 300), bán kính 3 m: "Chơi tháp rơi tự do 60 m – 25 💰 (E)"; lượt chạy duy nhất một lúc (nếu không rảnh: "Đợi lượt sau nhé!"). Xuống tại (105,4; 300) với thông báo "Tim vẫn còn đập chứ? 😵".
- **Nhãn:** "🗼 Tháp rơi tự do 60 m – Vé 25 💰".

## 26. Thuyền hải tặc
- **Nguồn:** `funisland.js:141–154`.
- **Vị trí và kích thước:** trục treo tại (92, y 13,7, 262) (Y+12), hai khung A gỗ hai bên (z 262 ± 3,4, cao 13 m, nghiêng ±0,25 rad), xà ngang gỗ; thân thuyền gỗ dài 13 m, rộng 4,4 m, cột buồm cao 7 m với cờ đen.
- **Trò chơi:** đu theo chu kỳ 4,6 s, biên độ tăng dần 0,07 rad/s tới tối đa 1,3 rad (≈ 75°), chạy 34 s rồi giảm biên độ 0,12 rad/s. Vé 20 💰.
- **Tương tác:** E tại (92, 256), bán kính 3 m: "Lên thuyền hải tặc – 20 💰 (E)"; xuống tại (92, 255,5) với thông báo "Yo-ho-ho! Chóng mặt chưa?".
- **Nhãn:** "🏴‍☠️ Thuyền hải tặc – Vé 20 💰 · đu tới 75°".

## 27. Nhà ma "Nhà Ma Bug" (đi xe)
- **Nguồn:** `funisland.js:156–188`.
- **Vị trí và kích thước:** x 73…97, z 322…338 (24 × 16), tâm (85, 330); thân hộp tím tối cao 9 m, mái chóp nón cao 6 m, 2 tháp tròn cao 13 m tại (75, 322) và (95, 322) có mái nón; cửa đen 3,6 × 4,2 ở mặt Bắc (z ≈ 322); 6 cửa sổ phát sáng tím; biển "👻 NHÀ MA BUG" 6 × 1,1 ở y 6,7. Hộp chặn kín cả toà ("vào bằng xe ở cửa chính").
- **Bố trí bên trong (vẽ riêng, tối):** sàn đen + trần đen, 2 vách ngăn chừa đường xe, 6 hình bóng ma (bóng trắng, đầu lâu, bug xanh lá) bật lên khi xe đi qua trong bán kính 3,2 m, 8 đèn nhấp nháy (tím/đỏ/xanh).
- **Trò chơi:** xe ma đi theo đường 10 điểm (x 76…94, z 317…335, khoảng 90 m, ước tính ≈ 56 s ở 1,6 m/s). Vé 20 💰. Jump scare kèm tiếng "boo".
- **Thoại tiêu biểu:** "👻 BOOO!", "💀 Áaaa!", "🐛 Bug khổng lồ!!", kết "Thoát khỏi Nhà Ma Bug! Can đảm ghê 😄".
- **Tương tác:** E tại (85, 316,5), bán kính 3 m: "Đi xe vào Nhà Ma Bug – 20 💰 (E)"; xuống lại tại (85, 315).

## 28. Quầy kem và khách bot
- **Nguồn:** `funisland.js:190–194`.
- **Quầy kem:** tại (51, 277) (IC.x − 10, IC.z − 14), 3 × 1,1 × 1,6 hồng, mái nón hồng. E tại (51, 278,8), bán kính 2,2 m: "Quầy kem Wonderland (E) – 15 💰" → mua "Kem ốc quế 3 vị", chỉ có thông báo "Mát lạnh! Chơi tiếp trò nào? 😋" (không buff).
- **Khách vui chơi (9 bot "<tên> · khách vui chơi"):** đứng yên tại (30, 255), (31,5; 254,6), (96, 296), (96,6; 297,6), (90, 256), (86, 314), (84,5; 313,4), (66, 276), (56, 286); giới tính luân phiên; không thoại.

---

# PHẦN D. CÔNG VIÊN KỲ QUAN (`js/themepark.js`, `themerides.js`, `themeland2.js`, `coastertrack.js`)

## 29. Địa hình và tổng thể Công viên Kỳ Quan
- **Nguồn:** `themepark.js:1–57, 63–89`.
- **Vị trí và kích thước:** lưới x −270…363, z 372…1242 (633 × 870, ô 3 m). Đường biên thực là hợp của 2 hộp bo góc: cổ chai tâm (38, 452) nửa rộng (78, 68) tức x −40…116, z 384…520; thân tâm (46, 865) nửa rộng (302, 365) tức x −256…348, z 500…1230 (kèm gợn sóng bờ). Mặt đất công viên phẳng ở G0 = 2,0 m. Hai dải gò cây hai bên Đại lộ cao thêm tới 7 m (che thành phố) ở |x − 38| ≈ 49…57 (dốc thoải từ 38 và đến 69), z ≈ 398…496.
- **Bố trí:** cỏ có vân (độ phân giải ô 3 m, gộp ô lớn để giảm tam giác); cát/đáy hồ ở nơi thấp; lối lát đá là lưới riêng nằm trên mặt đất (đất bên dưới hạ 0,35 m chỉ trong lưới vẽ). Cây mọc thành cụm 3–6 cây (tối đa ~680, máy yếu ~400), 3 loại tán (shade/round/tier) + cọ ven hồ; mỗi cây có lõi tán đặc để nhìn từ xa không trong suốt.
- **Chức năng:** khu công viên chủ đề.
- **Kết nối:** cầu đá từ Wonderland (30); Đại lộ Phiêu Lưu x 208…220 từ z 634 xuống tới z 884 (khu Nam); đại lộ ngang z 884…896 (x −210…330). Hộp trời đi theo người chơi vì khu Nam nằm ngoài ±1000 m.

## 30. Cầu đá vào + Cổng chính Công viên Kỳ Quan
- **Nguồn:** `themepark.js:132–155`.
- **Cầu đá:** dọc x = 40 từ z = 337 (cao độ 1,72) đến z = 395,5 (cao độ 2,05), rộng 8,4 m, mặt vòm cao thêm 1,6 m ở giữa; lan can đá hai bên (cột đá nhỏ) tại x = 40 ± 4,2; 3 mố đá (z ≈ 348,7; 366,3; 383,8) mỗi mố có 2 cột đèn cao ~3,4 m; 24 đoạn sàn đứng.
- **Cổng:** tâm (40, 402): hai tháp vuông 6 × 15 × 6 tại x = 28 và 52, mái chóp xanh cao 7 m, cột cờ vàng cao ~3 m, cờ ★ đỏ / ☆ trắng; kính 2 mặt mỗi tháp; tường rào 24 × 3,2 hai bên nối ra gò cây (x 1…25 và 55…79, hộp chặn z 401,6…402,4); xà giữa 18,4 × 3,4 × 2,4 (y 11,3). Bảng "CÔNG VIÊN KỲ QUAN" (nền xanh đậm chữ vàng viền vàng, 17 × 2,5 m) và dòng "QC WORLD · 5 siêu trò chơi · Hồ Pha Lê · Phố ẩm thực"; 9 bóng đèn vàng dọc xà.
- **Nhãn 3D:** "🎢 Công viên Kỳ Quan QC World – Tàu lượn Thần Long · Tia Chớp · Song Dực Đại Bàng · Tháp Sấm Sét · Mắt Thần" ở y 32.
- **Tương tác:** không có E; đi bộ qua cổng giữa (x 34…46).
- **Kết nối:** cầu ↔ Đại lộ Ánh Sao. Dịch chuyển "Công viên Kỳ Quan · Cổng chính" tới (40, 410) nhìn về (40, 440).

## 31. Đại lộ Ánh Sao + phố ẩm thực 8 quầy
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

## 32. Quảng trường trung tâm (HUB) + đài phun nước
- **Nguồn:** `themepark.js:184–191`.
- **Vị trí và kích thước:** tâm HUB = (40, 526), bán kính 21 m (đĩa terrazzo), ngay sau cuối Đại lộ (z 508 → 526). Đài phun 3 tầng bán kính 5,4 m ở giữa (cao ~4,5 m, quả cầu chrome trên đỉnh), mặt nước y 1,55+0,46; vòng chặn 5,7 m.
- **Bố trí:** 4 cột chỉ đường ở bán kính 17,5 m: "🚀 Tia Chớp Không Gian →" (hướng +x), "← 🗼 Tháp Sấm Sét" (−x), "🎡 Mắt Thần · 🐉 Thần Long ↓" (hướng (0,6; 0,8)), "🦅 Song Dực Đại Bàng ↓" (hướng (−0,6; 0,8)); 8 vị trí ven (bán kính 9,5 ghế, 19 cột đèn xen kẽ).
- **Chức năng:** nút phân phối tới các trò chơi.
- **Kết nối:** lát đá tới Tia Chớp (x 58…132, z 514…522, vòi kết thúc tại x 130…148, z 512…533), tới Tháp Sấm Sét (x −40…22, z 534…542, quảng trường tròn tâm (−52, 538) bán kính 14), tới hồ (x 34…46, z 540…552). Dịch chuyển "Quảng trường & Hồ Pha Lê" tới (40, 549) nhìn về (40, 620).

## 33. Hồ Pha Lê (đảo giữa hồ, 2 cầu đá, vọng lâu, đài phun nhạc)
- **Nguồn:** `themepark.js:17–28, 99–130, 193–201`.
- **Vị trí và kích thước:** hồ elip tâm (40, 620), nửa trục 100 (x) × 58 (z), tức x −60…140, z 562…678; mặt nước y 1,55; viền lát đá rộng 3,2…12,2 m quanh mép, kè bậc 2 cấp, cọc xích thấp (có khe 5,4 m ở đầu cầu). Đảo giữa hồ bán kính 22 m (lát phẳng bán kính 19,8, mép đá bán kính 21,6).
- **Bố trí:** hai cầu vòm đá cùng trục x = 40 (cầu Bắc z ≈ 558,6 → 598,5; cầu Nam z ≈ 641,5 → 681,4; mỗi cầu dài ≈ 40 m) rộng 5,4 m, đỉnh vòm cao 2,0 m trên mặt đất, có lan can đá, 2 cột đèn mỗi đầu, hai mố giữa; vọng lâu bát giác ở tâm đảo: sàn đá bán kính 6,2, 8 cột trắng cao 3,6, mái nón ngói cao 3,2 + cầu chrome, bán kính mái 7,4; 4 ghế băng quanh vọng lâu (2,6 m từ tâm); 8 cây quanh đảo (bán kính 13,5), 6 cột đèn (bán kính 17,5). Đài phun nhạc: 14 vòi xếp cung ở nửa Bắc hồ (z ≈ 586…590, cao 9–12 m), 10 vòi vòng ngoài (cao 6 m), 2 vòi lớn cao 22 m tại (40 ± 52, 612), nhịp lên xuống theo sin (chỉ vẽ khi người chơi cách < 330 m).
- **Chức năng:** trung tâm cảnh quan và ngồi nghỉ; chung quanh là các trò chơi.
- **Tương tác:** ghế băng E/C; bờ hồ có rào vô hình ("Hồ Pha Lê – không xuống nước. Qua đảo giữa hồ bằng cầu đá ở hai đầu Bắc/Nam").
- **Kết nối:** quảng trường (32) ↔ đảo hồ ↔ các trò quanh hồ (Mắt Thần tại (172, 620), Song Dực Đại Bàng ở phía Tây (−154…−83, 620), Thần Long ở phía Nam (x 20…58, z 712)).

## Khung chung cho các trò chơi ray (dùng cho Mục 34–36 và 39–41)
- Tàu có 6 toa (5 toa khi máy yếu), mỗi toa dài 2,6 m; hàng ghế đầu của toa đầu là ghế của người chơi. Cổng soát vé: 3 làn (rộng 4,8 m) cho 5 ride bên, 2 làn cho Song Dực Đại Bàng. Thanh chắn nâng khi đã có vé và người chơi đứng trong vùng cổng.
- Tàu ra ga khi: hết thời gian chờ (dwell 16–18 s) và không có khách có vé đang đứng trong vùng chờ; nếu có khách chờ, tàu đợi thêm tối đa 40 s. Ngoài khoảng cách ~120 m thì chỉ cập nhật thưa.
- Ba loại ghế: tàu ngồi (ray dưới) với ghế bên trái hướng chạy; tàu treo (Song Dực Đại Bàng) ghế treo dưới ray.
- Xe thông báo kết thúc: "<icon> <tên trò>: <giây> giây · tốc độ cao nhất <km/h> km/h. Ra theo biển 'LỐI RA' ở cuối sân ga nhé!".
- Các con số "ước tính thời gian lượt" bên dưới do tôi mô phỏng `physStep` (không phải hằng số trong mã).

## 34. 🐉 Thần Long Cuồng Nộ (tàu lượn)
- **Nguồn:** `themerides.js:223–233`, `coastertrack.js:94–100`.
- **Vị trí và kích thước:** ga ở x 20…58, z = 712 chạy về Đông. Sân ga (platform) ở x ≈ 39,2…61,2, z ≈ 706…711, cao độ ≈ 3,25. Khu xếp hàng gốc (37,7; 705), dài 15,5 m về phía +x, rộng 4,8 m về phía −z (tới (53,2; 700,2)); dãy cổng soát vé ở đầu x ≈ 53,2 (z 700,2…705), quầy vé ≈ (53,2; 698,2), cổng tên trò ở x ≈ 57,7. Ray x −74…171, z 657…782 (trên hồ và quanh hồ), dài 1.510 m, cao nhất ≈ 68 m so với mặt đất (đúng "dốc 68 m").
- **Bố trí:** rồng đỏ vàng ở đầu tàu (đầu rồng gắn vào toa đầu), ray đỏ, xương sống vàng, trụ chữ A bảo vệ; mái ga đỏ sẫm.
- **Trò chơi:** thứ tự: ga 38 m → xích kéo dốc 68 m (6 m/s) → lao 84° → vòng lộn bán kính 19,5 (cao 39 m) → cobra roll → xoắn không trọng lực → 2 xoắn ốc trên hồ → xoáy 540° (bán kính 17) → phanh về ga. Vé 35 💰; tốc độ tối đa theo nhãn 126 km/h (khớp mô phỏng 35 m/s ≈ 126 km/h); thời gian lượt ước tính ≈ 114 s; chờ ghi "8 phút".
- **Nhân vật:** nhân viên vận hành "<tên> · nhân viên vận hành Thần Long Cuồng Nộ" ở đầu sân ga; nhân viên soát vé "<tên> · nhân viên soát vé Thần Long Cuồng Nộ" cạnh quầy vé; khách rải rác (khách bot ngồi sẵn ở các toa phía sau).
- **Tương tác:** quầy vé: E "Mua vé 🐉 Thần Long Cuồng Nộ – 35 💰"; trên sân ga: E "Lên tàu Thần Long – hàng ghế đầu" (chỉ khi đứng trên sân ga). Có thể mua vé ngay khi bấm lên tàu.
- **Kết nối:** từ quảng trường HUB đi theo Đại lộ về hồ và vòng quanh đáy hồ tới (58…76, 686…710,6) granite ở cổng. Dịch chuyển "Công viên Kỳ Quan · Thần Long Cuồng Nộ" tới gần cổng tên trò.

## 35. 🚀 Tia Chớp Không Gian (tàu lượn phóng)
- **Nguồn:** `themerides.js:234–244`, `coastertrack.js:102–110`.
- **Vị trí và kích thước:** ga x 100…130, z = 536 chạy về Đông; sân ga x ≈ 111,2…133,2, z ≈ 530…535; khu xếp hàng gốc (109,7; 529) tới (125,2; 524,2), dãy cổng soát vé ở x ≈ 125,2. Hầm phóng 46 m dọc x 140…186, z = 536 (khung vòm đen cao 4,4 + vòng neon xanh/tím xen kẽ). Ray x 90…319, z 520…798, dài 1.224 m; mũ chóp dựng đứng cao ≈ 60,7 m.
- **Trò chơi:** phóng từ trường 0→133 km/h trong 52 m, mũ chóp 90° (lên 60 m), treo ~3,5 s ở đỉnh (có thông báo "Treo lơ lửng trên đỉnh 60 m… nhìn thẳng xuống đất!"), lao dốc, Immelmann, 3 đồi lạc đà (đồi 24 m, 20 m), vòng thắt nút, xoắn xuống ga (đường 'to' qua (262, 640), (196, 556)). Đếm ngược phóng "3 · 2 · 1". Vé 35 💰; thời gian ước tính ≈ 88 s; chờ ghi "6 phút".
- **Nhân vật:** nhân viên vận hành + soát vé như Mục 34.
- **Tương tác:** như Mục 34 với nhãn "Lên tàu Tia Chớp – hàng ghế đầu (E)".
- **Kết nối:** HUB → lát đá x 58…132, z 514…522 → quảng trường granite 130…148 × 512…533 → hầm phóng.

## 36. 🦅 Song Dực Đại Bàng (tàu treo, 2 đường đua)
- **Nguồn:** `themerides.js:245–260`, `coastertrack.js:112–117`.
- **Vị trí và kích thước:** hai đường soi gương qua mặt phẳng z = 620: đường A đỏ (z 537…616), đường B xanh (z 624…703), x −234…−84; ga đảo giữa hai đường ray ở x ≈ −154…−134, z = 620 (sân ga 20 × 6,8, cao độ 2,6; mái 23 × 17 ở y 8,85; hành lang giữa). Cổng soát vé 2 làn tại (−83,6; 620), vào từ phía Đông rồi đi vào hành lang. Ray cao nhất ≈ 41,2 m.
- **Trò chơi:** 2 đoàn tàu treo đua song song: xích kéo 41 m → vòng lộn bán kính 13,5 → xoắn không trọng lực → xoắn ốc → cork. Vé 35 💰; tốc độ ≈ 93 km/h; thời gian ước tính ≈ 70 s; chờ ghi "7 phút".
- **Nhân vật:** 1 nhân viên vận hành "nhân viên vận hành Song Dực Đại Bàng" ở (−152,6; 620); nhân viên soát vé.
- **Tương tác:** E trên sân ga: nửa Bắc (z < 620) → tàu ĐỎ (A); nửa Nam → tàu XANH (B). Cổng ra một chiều tại (−83,6; 620,1…623,3).
- **Kết nối:** Hồ Pha Lê bờ Tây ra sân ga: lát (−132…−70, 616,8…623,2). Thông tin chưa rõ: toạ độ khu xếp hàng chính xác (chỉ biết vùng chặn x −160…−70, z 606…634).

## 37. ⚡ Tháp Sấm Sét QC (rơi 80 m)
- **Nguồn:** `themerides.js:262–315`.
- **Vị trí và kích thước:** tâm (−52, 538), thân vuông 2,3 × 82 × 2,3 cùng 4 trụ thép bán kính 1,6; đỉnh có đĩa thép + vòng vàng + 8 gai vàng + cột thu lôi (đầu cầu sáng ở y ≈ 92). Bệ lên ghế tròn bán kính 8,2 (cao 0,45) + vòng ngoài 8,7; rào quanh bán kính 9 (chừa lối vào phía Đông và lối ra Đông-Nam). Vùng chặn x −64…−20, z 526…550.
- **Trò chơi:** vòng ghế 24 chỗ (có khoá vai) vừa xoay vừa nâng: lên 80 m trong 24 s (1 vòng xoay trọn), "tích năng lượng" 5 s với tia sét trên đỉnh, rơi giả 0,42 s rồi giật lại, sau 2,5 s rơi thật (rơi tự do tới y ≈ 35, bị đẩy nảy lên, rơi tiếp tới y ≈ 26 rồi hạ dần về bệ) — nhãn "rơi tự do 105 km/h, nảy lên 45 m". Chạy tự động mỗi ~20–22 s nếu không có khách. Vé 30 💰; chờ ghi "5 phút".
- **Thoại/thông báo tiêu biểu:** "Khoá vai tự động đã đóng. Vòng ghế sẽ vừa xoay vừa lên cao 80 m…", "Đỉnh tháp 80 m – năng lượng đang tích tụ…", "Hú hồn… mới chỉ là rơi giả thôi!".
- **Tương tác:** E tại (−46,4; 538), bán kính 3,4 m (chỉ khi đứng trên bệ, cách tâm < 8,6 m): "Ngồi vào ghế Tháp Sấm Sét (E)"; nếu đang chạy báo "Vòng ghế đang ở trên cao – đợi lượt sau (~… giây)". Khu xếp hàng gốc tại (−42,5; 538,8), dài 15,5 m về phía +x (phía HUB), dãy cổng soát vé + quầy vé ở đầu x ≈ −27; cổng ra ở góc ~0,63…1,01 rad quanh bệ.
- **Kết nối:** HUB → lát đá x −40…22, z 534…542 → quảng trường tròn tâm (−52, 538) bán kính 14. Dịch chuyển qua `PLACES` của gateLine (theo cổng tên trò).

## 38. 🎡 Mắt Thần QC World (vòng quay 90 m)
- **Nguồn:** `themerides.js:317–361`.
- **Vị trí và kích thước:** trục tại (172, y 52,5, 620), vòng bán kính 45 m (đỉnh ở y ≈ 97,5, đường kính 90 m "90 m"), hai vòng thép cách nhau 5,2 m (x 169,4 và 174,6), 4 chân chống hướng ra bốn góc (±12 m), 24 cabin kính cầu (bán kính 2,08, trong suốt 22 %) treo lệch trọng tâm, 192 đèn LED (96 × 2 vành) đổi màu theo thời gian, ban đêm to hơn.
- **Sân lên cabin:** phía Tây, x 164…170,1, z 610…630, cao độ 3,6 (cao hơn mặt đất 1,6), cầu thang 8 bậc ở hai đầu (Bắc vào, Nam ra); quầy vé + cổng soát vé phía Bắc sân (khu xếp hàng gốc tại (152,5; 594), dài 15,5 m theo hướng +z, rộng 4,8 m theo +x); lối ra một chiều tại z = 634,6; hộp cấm vùng cabin quay sát đất x 170,2…176.
- **Trò chơi:** 1 vòng 180 s (tốc độ 2π/180 rad/s), cabin kính, camera đuổi hoặc thứ nhất; có nút tương tác "⏩ Quay nhanh về ga để xuống sớm (E)" tăng tốc 7 lần. Vé 25 💰; chờ ghi "4 phút".
- **Nhân vật:** nhân viên soát vé; không có nhân viên vận hành riêng (chưa rõ).
- **Tương tác:** E tại (168,6; 620), bán kính 4,2 m (khi đứng trên sân): "Bước vào cabin Mắt Thần (E)" → tự đi bộ vào cabin → vòng → "Hẹn gặp lại ở Mắt Thần QC World! Ra theo cầu thang phía Nam".
- **Kết nối:** quảng trường HUB → lát đá x 58…132, z 514…522 (Đông) và x 150…165 × 614…626 (đến sát hồ); quảng trường granite x 150…171 × 631…638.

## 39. 🦖 Kỷ Jura Tuyệt Diệt (tàu thám hiểm xuyên núi)
- **Nguồn:** `themeland2.js:74–117`, `coastertrack.js:119–125`.
- **Vị trí và kích thước:** ga (158, 975 → 937) chạy về Bắc; sân ga x ≈ 151,9…156,9, z ≈ 933,8…955,8. Hai núi đá: jura1 tâm (272, 992) bán trục 66 × 60 cao 66 m; jura2 tâm (160, 1064) bán trục 24 × 20 cao 15 m. Ray x 151…315, z 914…1066, dài 607 m. Thung lũng khủng long ở x ~180…300, z ~900…950.
- **Bố trí:** thung lũng ăn cỏ với 2 con cổ dài (tại (226, 941) và (262, 907,5), cổ đung đưa), 3 con ba sừng (tại (205, 929), (241, 937,5), (197, 934)), cọ nhiệt đới rải rác; hầm báo động có đèn đỏ chớp + xe thám hiểm lật; hang raptor 4 con phục kích; đại sảnh T-Rex (đầu + hàm lao ra khi xe tới); bộ xương hoá thạch ở cửa ra; thác nước ở hầm 2; vách núi có hộp chặn ("Vách núi dựng đứng – không leo được").
- **Trò chơi:** thung lũng ăn cỏ → hầm báo động → hang raptor → xích kéo trong núi → T-Rex → lao 75° → xoắn trên hồ → xuyên thác nước → hầm 2 → về ga. Ray cao nhất ≈ 31,4 m; xe jeep, vé 35 💰; chờ ghi "9 phút"; tốc độ tối đa ≈ 87 km/h; thời gian ước tính ≈ 99 s. Trong hầm tối, sương mù kéo gần, tối đi.
- **Thoại/sự kiện:** "T-REX! Bám chặt – tàu lao thẳng xuống vực!", "Xuyên qua thác nước!", tiếng gầm tự tạo.
- **Tương tác:** E tại sân ga "Lên xe thám hiểm Kỷ Jura – hàng ghế đầu (E)".
- **Kết nối:** Đại lộ Phiêu Lưu → đại lộ ngang z 884…896 → lối granite x 136…157 × 896…936 tới ga. Biển chỉ đường tại (214, 878): "🦖 Kỷ Jura · 🔱 Atlantis →", "← 🌋 Hầm Mỏ Dung Nham", "← 🏴‍☠️ 🎠 🌤 🌀 Khu Lễ Hội".

## 40. 🌋 Lời Nguyền Hầm Mỏ Dung Nham
- **Nguồn:** `themeland2.js:119–149`, `coastertrack.js:127–134`.
- **Vị trí và kích thước:** ga (−20…18, 916) chạy về Đông; sân ga x ≈ −0,8…21,2, z ≈ 910…915. Núi lửa tâm (24, 1010) bán trục 72, cao 55 m, miệng bán kính ~10; núi phụ volcN tâm (8, 950) 30 × 16 cao 9; gò pha lê tâm (98,7; 999) 8 × 36 cao 13. Ray x −55…99, z 916…1088, dài 1.204 m, cao nhất ≈ 53,8 m.
- **Bố trí:** hầm pha lê (64 viên pha lê phát sáng đổi màu), quái vật đá dung nham trên đỉnh đường cụt (2 tay đập), lòng núi rỗng, mặt dung nham bán kính 50 m tại (20, 1002), suối dung nham chảy ngoài sườn (7 dòng), 6 cột lửa ở đáy lõi tại (2, 1002), (30, 996), (14, 976), (40, 1016), (−4, 982), (26, 1024), khói tại miệng núi.
- **Trò chơi:** xe goòng mỏ: hầm pha lê → đường ray đứt: quái vật Đá Dung Nham đập xuống, tàu TRƯỢT LÙI 1,5 vòng xoáy trong lòng núi → đáy lõi dung nham "áp suất dồn lên, 3 · 2 · 1 – PHÓNG!" → phóng vọt qua miệng núi lửa. Có 2 điểm đường cụt (dừng 4,6 s và 4,2 s rồi chạy ngược). Vé 35 💰; chờ ghi "10 phút". Tốc độ/thời gian chưa mô phỏng (chưa rõ).
- **Thoại tiêu biểu:** "Đường ray đứt gãy! Quái vật Đá Dung Nham đập xuống – tàu TRƯỢT LÙI vào bóng tối!", "Đáy lõi núi lửa… áp suất đang dồn lên… 3 · 2 · 1 – PHÓNG!", "Vọt qua miệng núi lửa!".
- **Tương tác:** E tại sân ga "Lên xe goòng Hầm Mỏ Dung Nham – hàng ghế đầu (E)".
- **Kết nối:** đại lộ ngang z 884…896 → granite x 14…44 × 896…912 → ga.

## 41. 🔱 Đền Thờ Atlantis Chìm Đắm
- **Nguồn:** `themeland2.js:151–183`, `coastertrack.js:135–139`.
- **Vị trí và kích thước:** ga (118…156, 1108) chạy về Đông; sân ga x ≈ 137,2…159,2, z ≈ 1102…1107. Đại điện đáy biển dạng vòm bán kính 19,5 tại (≈ 220, 1108) (giữa mốc 'hall' và 'hallEnd', ước tính x ≈ 203…237). Đền trên đỉnh tại (307, 1125): bệ bậc thang 4 tầng (46 → 22 m), 10 cột cẩm thạch cao 14, mái cao tới ≈ 32,6 m. Hồ Atlantis tâm (236, 1152), 68 × 26 (x 168…304, z 1126…1178), mặt nước y 1,6. Ray x 97…321, z 1108…1150, dài 515 m, cao nhất ≈ 34,5 m.
- **Bố trí:** phế tích 2 hàng cột cẩm thạch (9 cặp, một số đổ nghiêng, cao 3,2 hoặc 6,2 m) quanh ray gần x 164…185; cổng xoáy nước 6 vòng nước quay; trong đại điện: vỏ xanh thẳm, "cá voi và rùa ảnh nổi" bơi trên đầu, 6 xúc tu Kraken; cuối cùng lao xuống hồ, sóng tung 12 m hai bên.
- **Trò chơi:** chiến thuyền: phế tích → cổng xoáy nước → đại điện (Kraken) → leo đỉnh đền 35 m (xích kéo) → lao xuống hồ → lướt mặt nước về ga. Vé 35 💰; chờ ghi "8 phút"; tốc độ ≈ 94 km/h; thời gian ước tính ≈ 83 s.
- **Thoại tiêu biểu:** "Thuỷ quái Kraken quật xúc tu!", "Ùm! Sóng nước tung cao 12 m hai bên!".
- **Tương tác:** E sân ga "Lên chiến thuyền Atlantis – hàng ghế đầu (E)".
- **Kết nối:** Đại lộ Phiêu Lưu → z 884…896 → (108…120, 896…1100) → (108…186, 1086…1104) → ga.

## 42. 🏴‍☠️ Con Tàu Ma Ngọc Trai Đen (xoay 360°)
- **Nguồn:** `themeland2.js:225–266` (đoạn Khu Lễ Hội).
- **Vị trí và kích thước:** tâm (−120,4; 935,4), bãi tròn bán kính 17 m có rào (khe vào hướng về HUB lễ hội (−160, 975), cổng ra lệch −0,42 rad). Khung chữ A cao 15,3 m (trục treo ở y 17,3), hồ nước bán kính 14,2 m, cầu tàu gỗ lên boong 11 bậc, thân tàu dài 22 m.
- **Trò chơi:** tàu đu biên độ tăng dần tới ~2,95 rad (khoảng 169°), rồi vượt đỉnh xoay trọn 2 vòng 360°, giảm dần về yên. Chạy tự động mỗi ~24 s nếu không có khách. Vé 25 💰; chờ ghi "5 phút".
- **Nhân vật:** nhân viên soát vé "… nhân viên soát vé"; khách bot ngồi trên tàu (nhiều người trong khoang).
- **Tương tác:** E tại bến ≈ (−122,1; 937,1), bán kính 5 m: "Vào chỗ ngồi Con Tàu Ma Ngọc Trai Đen (E)" (khi đứng trong bãi). Thông báo "Nhổ neo! Tàu đu cao dần rồi vượt đỉnh xoay 360°…".

## 43. 🎠 Khúc Nhạc Cung Đình (ngựa gỗ 2 tầng)
- **Nguồn:** `themeland2.js:268–291`.
- **Vị trí và kích thước:** tâm (−199,6; 935,4), bãi tròn bán kính 13,5 m. Mái vòm dát vàng cao ~12 m, sàn quay bán kính 9,6 (nền đá bán kính 10,6), trục giữa kính + tầng nhạc.
- **Trò chơi:** 36 ngựa gỗ (24 tầng dưới, 12 tầng trên), lên xuống nhịp nhàng, quay tối đa 0,5 rad/s; chạy 62 s mỗi lượt, bản nhạc 8 nốt lặp (C5–E5–G5–E5–D5–F5–A5–F5). Vé 15 💰; chờ ghi "3 phút".
- **Tương tác:** E tại ≈ (−193,5; 941,5), bán kính 6 m: "Vào chỗ ngồi Khúc Nhạc Cung Đình (E)"; "Nắm chắc cột vàng nhé!".

## 44. 🌤 Vũ Điệu Gió Trời (đu quay dây văng 60 m)
- **Nguồn:** `themeland2.js:293–316`.
- **Vị trí và kích thước:** tâm (−120,4; 1014,6), bãi tròn bán kính 13 m; tháp trung tâm cao 62 m (quả cầu vàng ở y ≈ 65,6), bàn xoay nâng lên 56 m; 16 ghế treo xích dài 8 m, bán kính ngoài 8,2 m.
- **Trò chơi:** tổng 92 s: nâng lên 22 s, giữ ~48 s văng nghiêng tới 45° (0,8 rad), hạ 22 s. Vé 25 💰; chờ ghi "5 phút".
- **Tương tác:** E tại ≈ (−126,3; 1008,7), bán kính 6 m: "Vào chỗ ngồi Vũ Điệu Gió Trời (E)"; "Bàn xoay nâng lên 56 m – dang tay đón gió nào!".

## 45. 🌀 Con Lắc Thần Sấm (đĩa bay 360°)
- **Nguồn:** `themeland2.js:318–341`.
- **Vị trí và kích thước:** tâm (−199,6; 1014,6), bãi tròn bán kính 14 m; trục ở y 26, cánh tay đòn 20,3 m, đĩa 24 ghế bán kính 4,3–4,75.
- **Trò chơi:** đĩa xoay tối đa ~15 vòng/phút (1,57 rad/s) và cánh tay quăng lên tới 120° (2,09 rad); lượt dài ~74,5 s. Vé 25 💰; chờ ghi "5 phút".
- **Tương tác:** E tại ≈ (−194,9; 1009,9), bán kính 5,5 m: "Vào chỗ ngồi Con Lắc Thần Sấm (E)"; "Khoá vai đã đóng – chân buông lơ lửng!".

## 46. Khu Lễ Hội và lối khu Nam
- **Nguồn:** `themeland2.js:37–43, 291`.
- **Vị trí và kích thước:** HUB lễ hội tâm (−160, 975) bán kính 16 (đĩa terrazzo); lối lát x −166…−154, z 896…962 nối đại lộ ngang z 884…896 xuống HUB; 4 trò Khu Lễ Hội (Mục 42–45) ở bốn góc quanh HUB: tây-bắc (−199,6; 935,4), đông-bắc (−120,4; 935,4), tây-nam (−199,6; 1014,6), đông-nam (−120,4; 1014,6). Đại lộ Phiêu Lưu x 208…220, z 634…884 (cột đèn x 207,2 mỗi 30 m, ghế băng x = 221). Đại lộ ngang z 884…896 từ x −210 đến 330 (đèn mỗi 26 m ở z 883,2). Hồ khủng long tâm (170,7; 1031) bán kính 13; hồ Atlantis (Mục 41).
- **Chức năng:** đường nối các trò khu Nam.

---

# PHẦN E. BIỂN SỐNG ĐỘNG (`js/sealife.js`)

## 47. Du thuyền "QC Ocean Pearl"
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

## 48. Người lướt ván
- **Nguồn:** `sealife.js:66–76`.
- **Vị trí:** 3 người "🏄 Người lướt ván", ván màu vàng/hồng/xanh lá, ở bờ Đông-Nam đảo chính (góc 0,6…1,2 rad từ gốc, tức x, z đều dương). Chu kỳ: lướt vào bờ 7 s (từ cách bờ 32 m vào 6 m), nằm sấp chèo ra 14 s (từ 6 m ra 32 m), lặp, góc bắt sóng đổi ngẫu nhiên.
- **Tương tác:** không có. Chỉ chạy khi người chơi cách gốc < 170 m.

## 49. Mô tô nước (vịnh phía Nam)
- **Nguồn:** `sealife.js:78–88`.
- **Vị trí:** 2 mô tô nước (đỏ, xanh dương) với 2 người ("🚤 Mô tô nước") chạy hình số 8 quanh (106, 52): x = 106 + 20·sin t, z = 52 + 11·sin 2t, t = 0,32·thời gian (một vòng ≈ 19,6 s), mỗi chiếc để lại vệt bọt 40 điểm. Chỉ cập nhật khi người chơi cách (106, 52) < 160 m.
- **Tương tác:** không có.

## 50. Ca nô kéo dù bay
- **Nguồn:** `sealife.js:90–101`.
- **Vị trí:** ca nô trắng chạy vòng elip quanh (−60, 190): x = −60 + 48·cos t, z = 190 + 38·sin t (t = 0,05·thời gian, một vòng ≈ 126 s); dù 6 múi màu bay cách sau 40 m ở độ cao ≈ 26 m (dao động ±2 m), dây trắng nối; 1 người "🪂 Người chơi dù bay" treo dưới dù. Chỉ cập nhật khi người chơi cách (−60, 190) < 200 m.
- **Tương tác:** không có.

---

# BẢNG TÓM TẮT

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

## Phụ lục. Những điểm mã không nêu rõ (cần Bình/nhóm xác nhận khi thiết kế lại)

1. `CITY.arena` (x0, x1, z0, z1) và `CITY.downtown` (x1, z0): định nghĩa ở ngoài phạm vi; ảnh hưởng độ dài hai cầu nối và biên Khu Giải trí.
2. `edgeR` (bán kính bờ đảo chính theo góc): quyết định vị trí chính xác của ga cáp treo phía đảo chính (SA).
3. `W.addSeat`, `W.addBench`, phím F (nhảy concert), phím C (ngồi/đứng): chỉ biết lời gọi; hành vi chi tiết nằm ngoài phạm vi.
4. Khu xếp hàng và vùng cổng của Song Dực Đại Bàng, vị trí nhân viên vận hành Mắt Thần: mã không nói rõ ngoài các hộp chặn đã nêu.
5. Số cổ động viên/khán giả: lấy theo chú thích đầu file (khoảng 700 sân bóng, 350 concert), mã không đếm lại.
6. Các thời gian lượt trò chơi "ước tính" ở Mục 34–41 là kết quả mô phỏng của người viết tài liệu theo `physStep`, không phải hằng số trong mã.
