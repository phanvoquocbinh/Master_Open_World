# 02 – Hiện trạng kiến trúc: Downtown · Phường Khởi Nghiệp · Đại công viên Hồ Ngọc · mạng đường & giao thông

Tài liệu mô tả **đúng theo mã nguồn** (đọc ngày 15/11/2026). Chỗ nào mã không nói rõ ghi "chưa rõ". Không chép mã, chỉ tóm tắt số liệu.

**Quy ước toạ độ:** 1 ô = 1 m = 1 đơn vị. Trục x: Đông (+) – Tây (−). Trục z: Nam (+) – Bắc (−). y là độ cao (mặt đất thành phố ≈ 0,02–0,05). Hướng "mặt quay" tính theo `rot`/`face`: forward = (sin rot, cos rot).
**Viết tắt file:** `W` = world.html, `rd` = js/roads.js, `dt` = js/downtown.js, `ci` = js/city.js, `wd` = js/ward.js, `pk` = js/park.js, `cv` = js/civic.js, `tf` = js/traffic.js, `tr` = js/transit.js, `sl` = js/streetlife.js, `pd` = js/pedestrians.js, `jc` = js/jobcenter.js, `jb` = js/jobs.js, `nv` = js/nav.js.

---

## 0. Tổng quan bản đồ (suy ra từ `CITY` và mã dựng)

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

## 1. Khối `CITY` trong world.html

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

## 2. MẠNG ĐƯỜNG (rd:1–36, W:263–274, tf, dt:44–66)

### 2.1 Trục đường (đúng thứ tự trong `CITY.roads.segs`, mỗi đường rộng 20 m, vỉa hè 5 m mỗi bên)

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

### 2.2 Mặt cắt ngang một con đường 20 m (tính từ tim)
- Tim đôi vàng ở ±0,11–0,27 m (đường nét liền), 2 làn ô tô mỗi chiều 3,3 m + 1 làn xe máy 2,6 m. Vị trí tim làn theo `CITY.roads.lane`: A = 2,05 m, B = 5,35 m, xe máy = 8,3 m.
- Vạch sơn dựng bằng hình thật (tf:47–77): trắng đứt tại ±3,5 (giữa 2 làn ô tô, đoạn 2,4 m cách 4,5 m); trắng liền tại ±6,8 (ô tô | xe máy); mép trắng 9,58–9,75 m; chữ "XE MÁY" sơn trên làn xe máy cách ~24 m; đinh phản quang vàng tim đường mỗi 9 m; vạch dừng trước vạch qua đường (cách mép ngã tư 1,4+2,8+0,6…). Sơn sáng hơn ban đêm.
- Bó vỉa nổi 0,24×0,14 m tại ±10,12 (dt:63–66). Vỉa hè lát gạch 5 m (10–15 m từ tim). Mặt nhựa vẽ trên texture phẳng (dt:49–62) ở Downtown và bằng các mảnh nhựa (wd:180–186) ở Phường.
- Đèn đường: `lampPost` cách mép đường 0,9 m, bước 22 m, bỏ gần cửa toà/các `places` (dt:177–181).
- Cây vỉa hè (shade/purple/flame): cách mép 1,5 m, bước ~11 m (máy yếu 14 m); chậu hoa/bồn 1,15 m, bước ~22 m (28 m); mỗi toà có 2 chậu lớn cạnh cửa (pk:624–651).
- Người đi bộ: lối chuẩn cách mép 2,8 m (tức ±12,8 m từ tim, thẳng tâm vạch qua đường), tránh vật cản bằng Viterbi (pd:21–80).

### 2.3 Ngã giao (tính từ mã `roadNet`, rd:12–20)
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

### 2.4 Đèn tín hiệu (tf:24–114)
- Chu kỳ 32 s, mỗi ngã lệch pha `i×5,3 s`: trục dọc (Bắc–Nam) xanh 0–13 s, vàng 13–16, đỏ cả 2 hướng 16–17; trục ngang (Đông–Tây) xanh 17–28 s (**11 s**, không phải 13 s như chú thích), vàng 28–31, đỏ 31–32.
- Cột đèn người đi bộ ở 4 góc ngã (cách tim 11,1 m) khi đất tồn tại; cột đèn xe (tay vươn 5,9 m trên làn ô tô, đầu đèn cao 4,95 m, cột cao 5,9 m) cho mỗi nhánh có xe đi vào. Góc ngã (146; 0) phía cầu đảo không có đất → cột dựng trên lối bộ hành cầu.
- Người đi bộ chỉ được qua khi đèn trục **đang cắt** ở trạng thái đỏ; xe/taxi/buýt dừng qua hàm `limit()` (đèn đỏ, giữ khoảng cách, nhường người).

### 2.5 Lối bộ hành nâng cao trên 3 cầu (tf:116–125)
Khu Giải trí và Cao nguyên: dải lát 1,35 m rộng, cao 0,17 / 0,235 m, bó vỉa riêng; cầu đảo do dt dựng (mục 3).

### 2.6 Lưới taxi (đồ thị đường, tr:375–390)
86 nút: 64 nút vành đai (r=43) + 22 nút của `CITY.roads` (đầu mỗi đoạn và mọi ngã giao). Ba đường ngoại lệ: nút vành đai (43;0) nối (136;0) bằng cầu; hills/arena/highland tự thêm nối (262;86), gần (262;0), gần (178;−62) (chưa rõ trong phạm vi này).

---

## 3. DOWNTOWN (dt, đảo trung tâm thương mại)

### 3.1 Nền đảo + kè đá
**Tên:** Nền Downtown – dt:37–43.
- **Vị trí/kích thước:** x 136–262, z −62…62 → **126 × 124 ô**; khối đá dày 8 m (rộng 130×128, mặt trên ≈ y 0,02) với mặt lát gạch lặp; plane mặt đất y=0,03 phủ texture 3072 px (máy yếu 2048) vẽ gạch vỉa hè 0,5 m + mặt nhựa theo `CITY.roads`.
- **Lan can:** thanh kim loại y=1,0 ở cạnh Bắc (z=−63), Đông (x=263), Tây (x=135, **chừa cầu |z|<14,5**); **bờ Nam để trống** nối liền Phường.
- **Chức năng:** mặt bằng chính của thành phố.
- **Kết nối:** cầu dây văng phía Tây (z=0); đường x=146/x=252 chạy xuống Nam; Trục Bắc (x=178) lên cầu Cao nguyên; Đại lộ z=0 sang cầu Khu Giải trí phía Đông.

### 3.2 Cầu dây văng nối đảo chính ⇄ Downtown
**Tên:** Cầu dây văng – dt:67–97.
- **Vị trí/kích thước:** x 46,5–137 (dài 90,5 m), z −14…14 (**rộng 28 m**), mặt cầu y≈0 (mặt nhựa trên 0,15), ván bê tông dày 0,3. Ở 2 bên có **lối bộ hành nâng** cao mặt 0,33 m, rộng 4 m, tâm z=±12.
- **Bố trí:** mặt nhựa 20 m đúng chuẩn đường thành phố (2 vạch vàng tim, trắng ±6,8 và ±9,7, vạch "ngựa" ngắn ở ±3,5); bó vỉa trắng; lan can thật: trụ cao 0,95 m mỗi 2 m, 2 thanh ngang (cao 1,05 và 0,6), tại z=±13,9; bốn hộp chặn (collider) sát lan can; **trụ đá** (cylinder r 0,55–0,65, cao 6) ở x=74…<137 bước 8 m, tại z=±3,5 và ±10 chìm dưới biển (y −3).
- **Tháp dây văng:** tại x=104, 2 tháp trắng cao 26 m (1,4×1,4) ở z=±14,9, thanh ngang nối ở độ cao 23; 6 dây mỗi phía × 2 hướng (tổng 24 dây) toả ra bước 4,2 m.
- **Đèn:** `lampPost` mỗi 16 m từ x=60 đến cầu, z=±13,4.
- **Nhãn:** "🏙️ Downtown · QC City" tại (140; 9; 0).
- **Kết nối:** đầu Tây tại vành đai đảo (x≈46,5, ở vòng ngoài r=46,5) + **cổng Rời đảo x=52**; đầu Đông vào ngã ba (146; 0).

### 3.3 Đèn đường Downtown
Mọi vỉa hè đều có `lampPost` (không đặt trong 4,6×5 m quanh cửa toà hay 6 m quanh `places`). Nhãn và bản đồ: PLACES "Downtown · QC City" teleport tới (144; −12,5) nhìn (176; −12,5) (dt:183).

---

## 4. CÁC TOÀ CÔNG TY CAO TẦNG (dt:100–175)

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

### 4.1 Bảy toà ở Downtown (phía Bắc)

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

### 4.2 Sáu toà ở khối cao ốc Nam (Phường, z 390–460)

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

## 5. PHƯỜNG KHỞI NGHIỆP (wd, ci, jc)

### 5.1 Nền phường
**Tên:** Nền Phường Khởi Nghiệp – wd:174–190.
- **Vị trí:** x 136–262, z 62–480 (mặt đất ward từ z=62; khối đá từ z=64 đến 482, dày 8 m). Gạch vỉa hè lặp 4 m; mặt nhựa từng đoạn đường vẽ từ `CITY.roads` (polygonOffset để nằm trên nền).
- **Lan can:** cạnh Tây (x=135), Đông (x=263), Nam (z=481) – trang trí; cạnh Đông liền 1 đoạn (hills.js tự cắt khe cầu ở z=86).
- **Nhãn:** "🌱 Phường Khởi Nghiệp" tại (160; 9; 214).
- **Kết nối:** liền Downtown ở z≈56–62 (bờ Nam để trống); nhánh z=86 ra cầu Đồi Brand QC (x=262, hills.js).

### 5.2 Chợ QC · Showroom xe · Văn phòng địa chính (ci:108–111, W:253)
Ba "nhà" dùng chung mẫu `buildHouse` (nhà 5,4×4,6 m, tường cao 3,0, mái hai mái 30°; sàn đứng 6,2×2,4; ci:16–25).
- Chợ QC (146; 217,5), Showroom xe (163; 217,5), Văn phòng địa chính (180; 217,5): `rot=π` quay mặt về Bắc (phố chính z=200). Vòng sáng tương tác cách tâm ≈ 5,9 m về phía trước (z≈211,6), nhãn y=7,6.
- Va chạm tròn r=3,25 mỗi nhà. Màu nhấn: chợ cam 0xd05f28, showroom xám 0x3a3f4b, địa chính nâu 0x8b6a2e.
- Chức năng: chợ (đồ dùng/vé/mồi/thuê thuyền), showroom (xe máy · ô tô), địa chính (mua đất · xây nhà · mở quán). Chi tiết giao dịch nằm ở life.js (ngoài phạm vi: **chưa rõ**).
- Taxi: mỗi nơi có điểm đến taxi (tr:416).

### 5.3 Nhà trọ khởi nghiệp
**Tên:** Nhà trọ khởi nghiệp – wd:200–218.
- **Vị trí:** x0=139, tâm z=235,5; **4 phòng × 7,2 m = 28,8 m rộng**, x 139–167,8; thân sâu 5,2 (z 232,5–237,7), nền đá 6,6; collider x 138,7–168,1, z 232,4–237,8; cao 3,1 (tường), mái 5 tấm tôn xám nghiêng đến y≈3,7.
- **Bố trí:** mỗi phòng: cửa gỗ 1,1×2,2 (4 màu: xanh dương, nâu, xanh lá, tím) ở trái, cửa sổ kính 1,3×1 ở phải, biển số phòng 1–4; phòng 2–4 có xe đạp + chậu cây trước cửa (vách ngăn nâu nhạt). Biển "🛏️ NHÀ TRỌ KHỞI NGHIỆP" 10×1,1 m ở y 3,0.
- **Điểm vào phòng** (`spots.tro.rooms`): x = 141,0 / 148,2 / 155,4 / 162,6, z=238,7.
- **Chức năng:** phòng trọ miễn phí (phòng 1 cấp cho người mới). Logic thuê/ngủ ở life.js (ngoài phạm vi, **chưa rõ**).
- **Bản đồ:** "🛏️ Nhà trọ khởi nghiệp".

### 5.4 Quầy Bếp Cơm
**Tên:** Quầy Bếp Cơm Khởi Nghiệp – wd:220–230. Tâm (180,5; 238), quầy đỏ gạch 4,4×1,05×1,6 + mặt trắng, tường sau 4,4×2,6, mái bạt sọc cam, 3 nồi inox; collider x 178,2–182,8, z 236,9–239,5. Điểm làm việc (180,5; 240,6). Việc phụ bếp (jb:46, 84–112): nhận ở Trung tâm Việc làm: dễ/vừa/khó = 3/5/8 món, 100/130/160 s, thưởng 30/60/100 💰.

### 5.5 Trung tâm Việc làm (tháp 11 tầng) – jc:19–153
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

### 5.6 Việc làm tay chân và việc trí tuệ (jb)
**Tên:** Hệ thống việc làm (modal "Trung tâm Việc làm", 4 tab) – jb:1–221.
- Tab 💪 chân tay: 🧹 Dọn rác phố (5/10/15 cụm, 240/360/420 s, 35/70/110 💰, rác trên vỉa hè Downtown + Phường), 📦 Giao hàng (nhận ở Chợ QC rồi giao tới Phường/Downtown/đảo trong 150/200/280 s, 40/80/140 💰), 🍳 Phụ bếp (30/60/100 💰).
- Tab 🧠 trí tuệ: SQL, API/JSON, tìm bug, thiết kế test, code JS (nạp `data/jobs.json`; số bài và mức thưởng **chưa rõ** vì dữ liệu ngoài phạm vi); làm lại bài đã xong = 25% thưởng.
- Tab 🏢 xin việc công ty: danh sách 13 toà, "Chỉ đường tới sảnh" gắn cột sáng 2 phút ở cửa toà.
- Tab 📊 hồ sơ.
- **Tương tác:** bảng việc (E ở quầy thông tin).

### 5.7 Lô đất ở (khối C) – dữ liệu trong `CITY.lots`
12 lô (8 nhà ở R, 4 kinh doanh B), vị trí đã nêu ở mục 1. Mỗi lô quay mặt Bắc. Cây hoa 3 bồn trước 3 lô R đầu (bed tại l.x ± 4,2, l.z − 6,2 theo hướng, ci:147). Phần xây dựng/mua nằm ở life.js (**chưa rõ**).

### 5.8 Cổng "Rời đảo"
**Tên:** Cổng Rời đảo – wd:232–244. Tại x=52: 2 trụ đá 1,1×6,4×1,1 ở z=±14,8 (mũ xanh 0x1d6fd8), dầm 1,2×1,5×30,8 ở y=6,2; 2 bảng 28+2,4 m: phía Đông "🌆 THẾ GIỚI MỞ ➜" (nền xanh đen), phía Tây "⬅ 🏝️ ĐẢO MASTER DASHBOARD" (nền xanh lá). Collider tròn r 0,8 mỗi trụ. Điểm `spots.gate`=(52; 0). Teleport bản đồ "Cổng Rời đảo" tới (46; 0) nhìn (62; 0).
**Chip vùng:** thanh trên cùng hiện "🌆 Thế giới mở" / "🏝️ Đảo MD · miễn phí"; toast khi qua ranh giới (kiểm 0,4 s/lần).

---

## 6. ĐẠI CÔNG VIÊN HỒ NGỌC (pk, 1033 dòng)

### 6.0 Khung chung
**Tên:** Đại công viên Hồ Ngọc (QC City Central Park) – pk:1–1033.
- **Vị trí:** `PK` = x 161,5–236,5 (**75 ô**), z 15,5–184,5 (**169 ô**), nằm trong lô x 156–242, z 10–190; hàng rào giậu (hedge) cách mép 0,3 m, cao ≈0,25–0,6.
- **Tâm hồ `LC`** (199; 101). Mặt nước y=0,15. Công tắc gỡ lỗi: `localStorage['qcworld-park']='off'` → bỏ cả công viên.
- **Kết nối:** cổng Bắc (z=16), cổng Nam (z≈184,5, khe giậu x 195,4–202,6 và lối lát x 197,4–200,6, z 177,5–184,5), cổng Tây/Đông tại trục cầu z=101±2,6 (khe giậu), nối thẳng ra vỉa hè đại lộ ven Tây (x=146 → vỉa hè 156–161) và ven Đông. Bản đồ: teleport chính (199; 19,8). Taxi: điểm đến thêm "Cổng Đông (bến thuyền)" tại (252; 101) và "Cổng Nam (sân khấu)" tại (199; 200).
- **Mặt đất:** cỏ y 0,036; đường chạy y 0,05; sàn gỗ y 0,06; đá viền hồ; lối lát (pavé) y 0,046.
- **Cây:** 7 loại – tall (cổ thụ thân 6 m, tán tới ≈11,5 m), shade, flame (phượng, hoa đỏ cam), purple (hoa tím), willow (liễu rủ có rèm), cone (tùng) và bamboo (trúc). Cây gộp khối theo vùng 64×60 m, lay gió.
- **Âm thanh nền:** chim hót ban ngày (tần số 2600–4400 Hz), dế kêu ban đêm; nghe được khi cách công viên <30 m.
- **Hiệu năng:** NPC/cá/chim chỉ chạy khi bạn ở trong ≤38 m (tắt khi >52 m); NPC ẩn khi cách camera >85 m (60 m máy yếu).
- **Số nhân vật:** 29 NPC (máy yếu bớt: 2 người chạy bộ, 2 học viên yoga, không có cặp picnic) + chó Bé Vàng.

### 6.1 Hồ Ngọc (hồ có eo)
**Tên:** Hồ Ngọc – pk:181–233.
- **Vị trí/kích thước:** thuỳ Bắc và thuỳ Nam đối xứng quanh tâm (199; 101), thắt eo ở z=101 (nửa rộng eo ≈ 8,6–9 m; nửa rộng tối đa 18 m). Ước lượng bao: x ≈ 181–217, **z ≈ 42–160** (mỗi thuỳ ~57 m dài). Công thức: x = 199 + 18·cos·(1−0,52·e^(−sin²/0,09))·wobble, z = 101 + 57·sin·wobble.
- **Bờ:** kè granite rộng 0,55 m (cao 0,22); **sàn gỗ ven hồ** rộng đến 3,55 m từ mép nước (cao 6 cm).
- **Bố trí:** ~120 đá cảnh ven bờ (trừ chỗ cầu/bến); ~70 lá hoa súng (30% có sen hồng/trắng) ở 2 vùng z 46–66 và 136–154; cỏ lau 10 cụm × 12 cây; **26 cá koi** (cam/trắng/vàng, bơi theo 2 thuỳ); **10 vịt** (8 trắng, 2 nâu); **3 thiên nga** bơi tự do ở thuỳ Nam + 2 thuyền thiên nga đậu bến. Đèn lồng đen (cao 3,5 m, ánh vàng ấm) dọc sàn gỗ mỗi 15 m; ghế gỗ khối mỗi ~21 m quay mặt ra hồ; tối đa 8 thùng rác (mỗi 37 m).
- **Chức năng:** cảnh quan, nuôi cá, đạp thuyền. Không lội xuống nước được (vòng đoạn chặn có lời nhắn, có khe ở cầu/bến).

### 6.2 Đường chạy gạch đỏ + sàn gỗ + cây xanh
**Tên:** Đường chạy bộ – pk:185–205, 612, 617.
- **Hình:** siêu-elip (n=2,4) tâm (199; 101), nửa trục x=33, z=75 → đường tim x 166–232, **z 26–176**; rộng **5,5 m** (gạch đỏ nâu 0x6e2f22, bó vỉa đá trắng, vạch trắng đứt chia 2 làn), dài ~380 m (theo tab sơ đồ).
- **Đèn:** đèn cầu trắng (cao 3,4 m) mỗi 19 m ở ngoài đường 3,6 m.
- **Cây:** cổ thụ (tall) 2 hàng dọc đường chạy (bước 14–15 m), 34 cây thường (tall/shade/flame/purple) rải bãi cỏ, tùng viền 2 cạnh Tây/Đông.
- **Nhân vật:** 3 người chạy bộ (🏃 Tuấn nam, Linh nữ làn ngoài; Khoa nam làn trong, tốc độ 3,0/2,6/2,85 m/s). Gặp người chơi thì giảm tốc/nhường ("Cho mình qua với nha! 🏃", "Xin lỗi, nhường đường chút nha 😅"); 3 vòng thì nghỉ 8–12 s giãn cơ ("Xong 3 vòng rồi! 😮‍💨").
- **Cô Hạnh dắt chó Bé Vàng** (pk:772–793): đi dạo vòng sàn gỗ ven hồ, 1,1 m/s, thỉnh thoảng dừng 4–7 s; **E vuốt ve** Bé Vàng (không tốn tiền, có hiệu ứng tim).

### 6.3 Cầu Vòm Hồ Ngọc
**Tên:** Cầu Vòm – pk:235–248.
- **Vị trí:** qua eo hồ tại z=101, x từ `bxa` (rìa Tây hồ + 0,3) đến `bxb`; **dài ≈ 19–20 m** (mã ghi "~19 m" ở mục 4; chú thích đầu file ghi 27 m là cũ), rộng 3,2 m, đỉnh vòm cao ≈1,27 m.
- **Bố trí:** mặt gỗ cong, dầm + tay vịn ống 2 bên (cao 0,95 m, trụ mỗi ~1 m), 2 mố đá, 4 đèn đá ở 2 đầu, lan can chặn có lời nhắn.
- **Tương tác:** đứng giữa cầu bấm **E để cho cá koi ăn: 2 💰** (14 s cá và vịt kéo đến). Thống kê `S.stats.koi`.
- **Kết nối:** 2 quảng trường đầu cầu: Tây (178; 101) bán kính 6,6 (đài phun nước) và Đông (220; 101) bán kính 6,6 (tượng); trục lối lát Đông–Tây nối thẳng ra cổng Tây/Đông.
- **Bản đồ:** teleport (182,2; 104,4) nhìn tâm cầu.

### 6.4 Đảo thủy đình + cầu gỗ đỏ
**Tên:** Đảo thủy đình – pk:250–275.
- **Vị trí/kích thước:** đảo tròn tâm (199; 72) **bán kính 5,5** (cao 0,3), nằm ở thuỳ Bắc; đình lục giác bán kính 3,3 trên bệ cao 0,58: 6 cột đỏ cao 2,7 m, mái ngói xanh đen 6 mặt (nón r=4,3) có cầu vàng trên đỉnh.
- **Nội thất:** 3 ghế gỗ trong đình (mỗi ghế 2 chỗ ngồi: tổng 6 chỗ, nhãn "🏯 Ngồi trong thủy đình ngắm hồ (E · C)"); cây: 2 liễu (199∓3,9; 74,4/74,1), 1 phượng (199,4; 76,5).
- **Cầu gỗ đỏ ra đảo:** dọc x=199, rộng 2,6 m, từ mũi Bắc hồ (z≈41) đến đảo (z≈67,4), **dài ≈ 26 m**, đỉnh vòm ≈0,58 m, tay vịn đỏ; 2 đèn đá ở đầu cầu.
- **Nhãn:** "🏯 Thủy Đình Hồ Ngọc".

### 6.5 Bến thuyền thiên nga
**Tên:** Bến thuyền – pk:277–284, 951–969.
- **Vị trí:** bờ Đông thuỳ Nam, trục z=130; bến gỗ dài 7,6 m (x từ `DX0` đến `DXS`, đầu mút bờ Đông hồ) rộng 2,4 m, cao 0,26. Đầu bến nhô ra mặt nước tại `DX0+0,9`. 2 thuyền đậu tại (DX0+2,6; 127,1) và (DX0+2,6; 132,9).
- **Biển:** "🦢 THUYỀN THIÊN NGA · 20 💰" tại (218,4; 127,8).
- **Tương tác:** đầu bến **E thuê thuyền: 20 💰**, xác nhận trả tiền. Điều khiển: W/S đạp tới/lùi (tốc độ tối đa 1,7 m/s tiến, 0,6 lùi), A/D rẽ; chạm bờ phải lùi (không qua được gầm Cầu Vòm; thuyền chỉ chạy ở thuỳ Nam z>105). Về bến bấm E trả thuyền. Bị ngắt (dịch chuyển/taxi) → tự đưa về bến.
- **Nhân vật:** 2 khách đạp thuyền (Nam xanh lá, Nữ hồng) ngồi trên 2 thuyền thiên nga tự lái.

### 6.6 Cổng Bắc + sơ đồ + biển chỉ dẫn
**Tên:** Cổng Bắc – pk:300–342.
- **Vị trí:** z=16; 2 trụ granite 0,6×3,9×0,6 tại x=194,4 và 203,6 (đèn lồng đá trên đỉnh); bảng "ĐẠI CÔNG VIÊN HỒ NGỌC / QC CITY · CENTRAL PARK · MỞ CỬA 24/7" 6,6×1,24 m ở y=3,55; quảng trường cổng `GP` x 186–212, z 15,5–22,6 (lát đá).
- **Bảng sơ đồ** tại (192,8; 18,6) quay về trục cổng: **E xem sơ đồ** (12 thẻ mô tả khu); biển chỉ dẫn 5 hướng tại (205,2; 17,4). 2 bồn hoa cổng (188,6–191,6 và 206,4–209,4, z 16,3–17,1). 2 thùng rác (186,6; 21,9), (211,5; 16,3). 12 chim bồ câu mổ thóc quanh x 193,6–202,6, z 17,6–21,2 (bay khi bạn chạy lại gần <3,6 m, đi bộ <2 m).
- **Nhãn:** "🌳 Đại công viên Hồ Ngọc" ở (199; 6,4; 16) (fade 90 m).

### 6.7 Góc giải khát ở cổng (máy bán nước · quầy nước · xe kem)
- **3 máy bán nước** (pk:344–365) tại z=21,75, x = 203,0 / 204,15 / 205,3 (mỗi máy 1,0×1,95×0,78, mặt quay Bắc; xanh dương, đỏ, xanh lá): E (từ z=20,7): mỗi máy 3 món — Máy nước suối & trà: 💧 Nước suối 6 · 🍵 Trà xanh 10 · 🍋 Trà chanh mật ong 12 (+5 phút chạy nhanh); Máy nước ngọt & tăng lực: 🥤 10 · ⚡ Nước tăng lực 15 (+10 phút) · 🧃 Nước ép cam 12 (+4); Máy cà phê & sữa: ☕ Cà phê sữa lon 12 (+20% thưởng quiz 10 phút) · 🥛 Sữa tươi 9 · 🧋 Trà sữa chai 14 (+20% quiz 6 phút). Hiệu ứng cộng dồn; có lon rơi ra animate.
- **Quầy nước Cổng Bắc** (pk:366–377) tâm (209,6; 20,85), 2,6×1,05×1,3 m, mái bạt sọc xanh ngọc/trắng: nhân vật **Chị Mai** (quầy nước) tại (209,6; 21,3). Menu: 🧊 Trà đá 4 · 🎋 Nước mía tắc 10 (+4 ph) · 🥥 Nước dừa 15 (+8) · 🫘 Sữa đậu nành 8 · ☕ Cà phê muối 16 (+20% quiz 12 ph). Thoại: "Nước của bạn đây! 😊", "Uống ngon nha!", "Trà đá, nước mía đây!".
- **Xe kem** (pk:378–386) tại (188,9; 19,6): nhân vật **Anh Phát · bán kem** (mũ lưỡi trai, tại (188,9; 20,45)). Menu: 🍦 Kem ốc quế 10 · 🍡 Kem que đậu xanh 6 · 🥥 Kem dừa trái 18 (+5 ph) · 🍨 Kem ly 3 viên 14. Thoại: "Kem đây! Kem mát lạnh đây! 🍦", "Kem dừa ngon nhất công viên nè!".
- **Thanh toán:** mọi món qua `askPay` (xác nhận) rồi `spend`.

### 6.8 Bãi xe đạp
tại z=18,2: 5 giá xe x = 213,6 + i×1,75 (đến 220,6); 4 xe đạp (xanh dương, đỏ, xanh lá, vàng) tại x 213,6; 215,35; 218,85; 220,6; biển "🚲 BÃI XE ĐẠP" ở (221,3; 16,3). Chỉ trang trí (không có E). Lối lát (212,2–221,6; 15,5–20,2). Nhãn "Gửi xe rồi chạy bộ vòng hồ".

### 6.9 Khu thể dục (góc Đông Bắc)
**Tên:** Khu thể dục + xà đơn xà kép – pk:400–427.
- **Vị trí:** `GY` x 221,8–236,5, z 15,5–32 (**14,7 × 16,5 ô**), thảm cao su xanh lá + vạch vàng ở z=22,2.
- **Bố trí (5 thiết bị có thể tập):** (1) Máy đi bộ trên không (224,4; 19,6); (2) Máy xoay eo (226,4; 19,65); (3) Xe đạp tại chỗ (228,4; 19,6) (ngồi); (4) Vòng xoay tay (230,4; 19,45); (5) **Xà đơn 3 tầng** tại z=27, 4 trụ x 230,3/232,1/233,9/235,7 (cao 2,7), 3 xà cao 2,0/2,3/2,6 m ở x 231,2/233,0/234,8. Thêm xà kép (226,2; 28,2) và ghế gập bụng (223,6; 28,2) (trang trí, không E). Màu chính xanh dương/vàng.
- **Nhân vật:** 👴 **Ông Sáu** (đi bộ trên không), 👵 **Bà Tư** (xoay eo) – tập thật theo máy, thoại "Tập thể dục mỗi chiều, khoẻ re! 💪", "Sống lâu trăm tuổi nhờ đi bộ đó cháu!", "Một, hai, ba, bốn…"; 💪 **Anh Dũng** kéo xà đơn ở xà thứ 3 (x=234,8, 8 cái rồi nghỉ 7–11 s, "8 cái! Xong 1 hiệp 😤").
- **Tương tác:** máy trống (2 máy đã có NPC dùng) **E tập** (xà đơn 10,5 s; máy khác 8 s); đi/chạy để dừng; xong **thưởng +3 phút chạy nhanh** (không tốn tiền). Máy bận → toast "Có người đang tập".
- **Nhãn:** "💪 Khu thể dục · xà đơn xà kép".

### 6.10 Góc cosplay (Tây Bắc)
**Tên:** Góc cosplay – pk:429–437, sl:32–46.
- **Vị trí:** phông chụp ảnh x 163,2–173,4 (10,2 m), z=29,9, cao 2,6 m, tím–hồng sao; 2 cột đèn 3,4 m + 2 đèn spot; ghế gỗ (175,6; 20,6) quay Tây; thùng rác (175,8; 23,6); sân lát x 161,5–177, z 15,5–31.
- **Nhân vật (streetlife):** 4 cosplayer đứng tại (162,6; 24,2) Siêu anh hùng Áo Choàng Đỏ (áo choàng + sao vàng), (166,2; 23,0) Phi hành gia Bug Hunter (mũ kính + balô), (170,2; 23,0) Hiệp sĩ Test Case (khiên), (173,8; 24,2) Ninja Regression (khăn đỏ). Thỉnh thoảng giơ tay chào.
- **Tương tác:** tại (168,2; 27,2) bán kính 4,6: **E chụp ảnh** (miễn phí) → "📸 Tách! Ảnh chụp cùng … đã lưu vào kỷ niệm 😄" + hiệu ứng flash. Thoại: "📸 Cười lên nào!", "✌️ Chụp đẹp nha!", "🦸 Sẵn sàng cứu thế giới khỏi bug!".

### 6.11 Vườn Hoa Tròn (lưỡi liềm Tây Bắc) và Giàn hoa giấy (lưỡi liềm Đông Bắc)
- **Vườn Hoa Tròn:** tâm (183,2; 45,5): bồn giữa r=1,35 + đồng hồ mặt trời (trụ đá cao 0,9 + mặt r=0,5), 6 bồn tròn r=0,62 ở bán kính 2,6 m (6 bộ màu hoa). Không E. Nhãn "🌷 Vườn Hoa Tròn".
- **Giàn hoa giấy:** x 211,8–217,6 (5,8 m), z 42,2–45,6 (3,4 m), cao 2,6 m trắng, 190 hoa trên mái + 50 hoa leo trụ, 2 ghế ngồi (1 ghế mỗi hướng, nhãn "🌸 Ngồi dưới giàn hoa giấy (E · C)"), đèn dây 3 hàng. Nhãn "🌸 Giàn hoa giấy".

### 6.12 Bãi cỏ yoga – dưỡng sinh (Tây)
**Tên:** Bãi yoga – pk:455–461, 835–845.
- **Vị trí:** cột x=176,6, `keep` x 173,2–180,2, z 59,6–88,6. Thảm: HLV z=61,6; học viên z=66/70/74; **thảm trống z=78** (5 thảm màu); 2 vị trí dưỡng sinh (175,0; 84,6) và (178,2; 84,6).
- **Nhân vật:** 🧘 **Cô Thảo** (HLV yoga, áo xanh ngọc, hướng dẫn: "Ngồi thiền, thả lỏng vai… hít thở sâu 🧘", "Hít vào… vươn hai tay lên cao!", "Tư thế cái cây – giữ thăng bằng nhé 🌳", "Thở ra… dang tay, tư thế chiến binh!"; đổi tư thế mỗi 9 s theo chu kỳ lotus → giơ tay → cây → chiến binh), 3 học viên (2 nếu máy yếu), 👴 **Ông Bảy** + 👵 **Bà Hai** tập thái cực quyền (thoại "Dưỡng sinh mỗi sáng, chiều – khoẻ cả người!", "Chậm thôi, đều hơi thở…").
- **Tương tác:** tại (177,7; 78) **E tập yoga cùng lớp** 27 s, làm theo tư thế cô giáo; **+3 phút chạy nhanh**.

### 6.13 Sân cầu lông (Đông)
Sân x 218,6–224,4 (5,8 m), z 69–82 (13 m), lưới ở z=75,5 (cột 1,55 m ở x=218,4 và 224,6, lưới 6,2×0,76 m, đi vòng). Nhân vật **Hải** (áo vàng) và **Quyên** (áo hồng) đánh cầu theo parabol có vợt thật; thỉnh thoảng hụt ("Ối, hụt rồi! 😅", "Cầu xoáy quá!", "Ván này bạn thắng!", "Đỡ nè!", "Đập nè! 💥"). Không có E. Nhãn "🏸 Sân cầu lông".

### 6.14 Quảng trường Tây: đài phun nước ước nguyện
**Tên:** Đài phun nước – pk:473–484. Tâm (178; 101), quảng trường tròn r=6,6; bể granite r=3,0 (nước r 2,55–2,6), trụ đá 4 bậc cao 1,85 m, 6 vòi + 1 vòi giữa phun nước (động). 2 ghế gỗ tại (178; 95,8) và (178; 106,2) (nhãn "⛲ Ngồi ngắm đài phun nước"). **Tương tác:** tại (181,7; 102,9) **E ném xu: 1 💰** → toast ngẫu nhiên ("Tõm! Chúc bạn sprint này không còn bug nào 🍀", "Điều ước đã gửi: lương tăng, deadline giãn 😄", "Ước gì test case nào cũng Pass ✅"), pháo hạt vàng/trắng/xanh.

### 6.15 Quảng trường Đông: tượng "Kính lúp QC"
**Tên:** Tượng Kính lúp QC – pk:485–492. Tâm (220; 101), bồn hoa r=1,7 (vàng/cam/trắng), bệ đá + tay đồng + vành kính lúp (r=0,5, thấu kính xanh nhạt) và con bọ xanh; **4 ghế đá** ở bán kính 4,7 m tại 45°/135°/225°/315° quay vào tượng. Chỉ trang trí. Nhãn "🔎 Tượng "Kính lúp QC" – Soi kỹ từng góc – tinh thần QA".

### 6.16 Vườn Đá – Trúc (Tây Nam)
x 173,4–178,8 (5,4 m), z 116–135,5 (19,5 m): sân sỏi trắng với vạch cào; 6 đá cảnh (r 0,42–0,9), 4 bụi trúc ở 4 góc (173,2/178,9 × 114,2–114,6 và 136,8–137), đèn đá (176,1; 124), 2 ghế đá (179,6; 118,2) và (179,6; 131). Nhãn "🎋 Vườn Đá – Trúc – Góc yên tĩnh ngồi ngắm hồ".

### 6.17 Café Bên Hồ + bàn cờ đá (Đông Nam)
**Tên:** Café Bên Hồ – pk:505–533, 902–912.
- **Vị trí:** sân lát x 218,8–226,4 (7,6 m), z 112–138,5 (26,5 m), cạnh bến thuyền; quầy gỗ tại (225,2; 115,5) 1,3×1,05×3,4 m + mái xanh ngọc, biển "☕ CAFÉ BÊN HỒ".
- **Bố trí:** **6 bàn tròn dù** (r bàn 0,48; dù nón r=1,35 màu hồng/xanh ngọc/vàng/xanh dương/hồng nhạt/xanh lá) ở x 220,6 và 224,4, z 121,2 / 126,6 / 132,0; mỗi bàn 2 ghế gỗ (tổng 12 chỗ, nhãn "☕ Ngồi bàn café ven hồ (E · C)").
- **Nhân vật:** ☕ **Chị Ngân · pha chế** (áo nâu, tại (225,85; 115,5)); tối đa 3 nhóm khách tự sinh (cafe.js, spawn (227,6; 110), điểm gọi (223,4; 115,5)) – hội thoại mẫu: "Hồ này rộng ghê, chiều đạp thuyền chắc vui!", "Lát thuê thuyền thiên nga đi một vòng 🦢"… Thoại pha chế: "Cà phê sữa đá ngon nhất bờ hồ!", "Ngồi bàn dù ngắm thuyền nha mọi người!".
- **Tương tác:** tại (223,45; 115,5) **E gọi món**: ☕ Cà phê sữa đá 12 (+20% quiz 10 ph) · 🧋 Trà sữa trân châu 16 · 🥥 Nước dừa 15 (+8 ph chạy nhanh) · 🍰 Bánh flan 10 · 🍵 Trà sen 14.
- **Bàn cờ đá:** tâm (222,5; 136,4), bàn 0,82×0,82 + mặt cờ tướng + 4 ghế đá (2 người chơi + 2 ghế cho bạn ngồi xem, nhãn "♟️ Ngồi xem đánh cờ (E · C)"). Nhân vật **Ông Ba** và **Ông Năm** ngồi chơi, đối thoại mỗi 10–20 s ("Chiếu tướng! 😤" / "Khoan, khoan… để tôi tính đã."; "Ăn xe nè!"/"Trời ơi, sơ hở rồi!"; "Đi pháo đầu!"/"Thì tôi lên mã."; …). **E xem** (tại (221,1; 136,4)): "Ngồi xem đi cháu, ván này căng lắm!".

### 6.18 Sân khấu Cỏ (bờ Nam)
**Tên:** Sân khấu Cỏ – pk:535–550.
- **Vị trí:** sàn x 194,2–203,8 (9,6 m), z 166,6–170,4 (3,8 m), cao 0,6; 2 bậc phụ hai bên; phông 9,6×3 m "🎤 SÂN KHẤU CỎ – Hồ Ngọc Acoustic · mỗi tối"; đèn dây; 2 loa (0,6×1×0,5).
- **Khán giả:** 3 ghế gỗ khối ở z=162,6, x≈194,2/198,4/202,8 quay mặt về sân khấu (nhãn "🎵 Ngồi nghe nhạc (E · C)").
- **Nhân vật:** 🎸 **Anh Toàn · hát acoustic** (áo xanh đậm) tại (199; 168,9), nhảy/hát xen kẽ: "🎶 Chiều nay em ra bờ hồ…", "🎸 Bài tiếp theo tặng các bạn chạy bộ nè!", "🎤 Ai lên song ca với mình không?".
- **Tương tác:** tại (199; 165,7) **E lên sân khấu hát** (miễn phí) → pháo hạt, "🎤 Bạn vừa hát 1 bài – cả công viên vỗ tay rần rần! 👏" / "🎸 Hát hay quá! Có người xin số liên lạc kìa 😄" / "🎶 Encore! Encore!…", Anh Toàn đáp "Hay quá bạn ơi! 👏".

### 6.19 Sân chơi trẻ em (góc Tây Nam)
**Tên:** Sân chơi – pk:552–582.
- **Vị trí:** `PG` x 162,4–177 (14,6 m), z 168–184,5 (16,5 m), thảm cao su đỏ.
- **Bố trí:** **Xích đu** 2 chỗ tại z=171,5 (khung x 164,0–167,2, thanh ngang cao 2,3; ghế tại x 164,9 và 166,3; ghế x=166,3 ngồi được: **E · C**); **Cầu trượt** thang tại (168,45; 171,65) cao 1,35 m (đỉnh), dốc dài 1,9 m; **Thú nhún** (con vịt vàng) tại (169,8; 172,65); **Bập bênh** (170,6; 179,6) 3 m; **Hố cát** (174,4; 179,4) 3,2×3,2 vuông; **Ghế phụ huynh** (176; 173,6).
- **Nhân vật:** 👧 **Bé Na** (cao 1,12 m) đu xích đu ("Mẹ ơi đẩy cao nữa! 😆", "Wiii~ bay lên trời!"); 👦 **Bé Bin** (1,2 m) leo thang → trượt → ngồi thú nhún → leo lại ("Trượt nè! 🛝", "Wheee~", "Mẹ nhìn con nè!"); 👩 **Mẹ bé Na · Bin** đứng tại (164,05; 173,7) xem điện thoại ("Chơi cẩn thận nha hai đứa!", "Bin ơi, nhường em trượt với!").
- **Nhãn:** "🛝 Sân chơi trẻ em".

### 6.20 Bãi cỏ dã ngoại + thả diều (Đông Nam)
2 bàn picnic gỗ + khăn trải ô caro đỏ ở (225,6; 174,2) và (232,4; 180,4) (mỗi bàn 4 chỗ, nhãn "🧺 Ngồi bàn picnic (E · C)"). Giữ chỗ `keep` x 221–236,5, z 168–184,5. NPC: 🧑 **Minh** và 👩 **Thư** ngồi bàn đầu (ăn, trò chuyện: "Bánh mì này ngon ghê!"/"Tự tay mình làm đó 😊"…; **không có ở máy yếu**), 👦 **Bé Tí** thả diều tại (230; 173) (diều đỏ bay quanh độ cao ≈ 11,5 m, dây thật; "Diều bay cao quá! 🪁"). Nhãn "🧺 Bãi cỏ dã ngoại".

### 6.21 Cây vỉa hè quanh công viên
Mọi cây/chậu ở vỉa hè các đường (ngoại trừ khu công viên và khu có vật cản) đặt trong `pk:624–651` (xem mục 2.2). Chậu lớn (big) cạnh cửa mỗi toà công ty (±3,35 m cách cửa).

### 6.22 Số tiền / phần thưởng tóm tắt công viên
Cho cá koi 2 · ném xu 1 · thuê thuyền 20 · đồ uống/kem 4–18 (buff chạy nhanh/quiz) · tập luyện/yoga miễn phí +3 phút chạy nhanh · hát/chụp ảnh miễn phí.

---

## 7. KHU CÔNG CỘNG (cv; nạp từ pk:622)

### 7.1 Bệnh viện Đa khoa QC City
**Tên:** Bệnh viện – cv:64–101.
- **Vị trí/kích thước:** x 215,5–260,5 (**45 m**), z 223–249 (**26 m**), cao 15,6 m (4 tầng, dải xanh dương mỗi tầng); mái viền bê tông cao 0,5.
- **Bố trí:** 4 mặt tường dán facade (cửa sổ 2,1 m/bước 3,2 m); **sảnh có mái che** 11×4,6 m cao 3,6 tại giữa mặt Bắc (4 cột thép, cửa kính 5×3 m); biển "BỆNH VIỆN ĐA KHOA QC CITY" 15×2,3 m ở y=14; **chữ thập đỏ** phát sáng trên mái (cột 3,6 m, x=257,3); **lối Cấp cứu** phía Tây (biển "CẤP CỨU 24/7" đỏ, mái 3,2×5 m, cửa kính tại z≈cz+4=240); **bãi đáp trực thăng** tròn r=6 ở mái tại (232,5; 236) (chữ H vàng, 8 đèn xanh); sân trước 7,2 m bê tông + 2 bồn cây shade (x 218,5 và 257,5, z 216,8); **2 xe cứu thương** 5,6×2,1 m đậu tại (223,5; 218) và (252,5; 218) (đèn xanh dương).
- **Chức năng:** khám bệnh · cấp cứu.
- **Nhân vật:** 👩‍⚕️ **Chị Lan · điều dưỡng** (áo trắng) tại (240,4; 220,8) ("Mời bạn vào khám, hôm nay ít người lắm! 💙", "Nhớ uống đủ nước nha!").
- **Tương tác:** cửa (238; 221,4): **E khám sức khoẻ tổng quát: 30 💰** → +15 phút chạy nhanh; "Bác sĩ: 'Sức khoẻ tốt! Nhớ ngủ đủ giấc, bớt thức khuya fix bug nha'". Lối Cấp cứu (x≈213,3; z=240) E → toast "gọi 115 (chỉ tham quan)".
- **Kết nối:** cửa chính quay Bắc ra Phố chính (z=200 → vỉa hè đến z=215); tường là đoạn chặn có lời nhắn (chỉ vào bằng sảnh/cấp cứu; **không có nội thất bên trong**). Bản đồ: teleport (238; 214,5). Taxi: (238; 200). Buýt gần nhất: "Bệnh viện · Trạm cứu hoả" tại (226; 205,35).

### 7.2 Trạm cứu hoả QC City
**Tên:** Trạm cứu hoả – cv:103–146.
- **Vị trí/kích thước:** x 220–252 (32 m), z 255–274,5 (19,5 m), cao thân 9,2 m, cao gara 5 m (cửa cuốn kéo hết lên); tường gạch đỏ dày 0,4.
- **Bố trí:** **3 gara** rộng 5,2 m tâm x=225,5 / 236 / 246,5 mở ra Đường Bệnh Viện (z=290); trụ gạch giữa các gara + dầm; tầng 2 có dãy cửa sổ kính; biển "🚒 TRẠM CỨU HOẢ QC CITY · 114" 12×1,6 m; số 1–3 trên mỗi cửa + đèn đỏ; **tháp phơi vòi** ở Tây (x≈218,3, z≈257, 3,2×15,5 m, nón mái đen); sàn gara; vạch kẻ trắng ngoài cửa (5 vạch/cửa).
- **Xe:** 3 xe cứu hoả đậu trong gara tại z=269,2 (đầu xe quay ra cửa Nam): xe bồn số 1 (x=225,5), **xe thang số 2** (x=236), xe bồn số 3 (x=246,5); thân dài 8,6 m, rộng 2,5 m, đèn đỏ/xanh nhấp nháy; đi vào trong gara xem được (2 bên thành có tường chặn, mặt trước chỉ chặn ở trụ).
- **Nhân vật:** 👨‍🚒 **Anh Hùng · lính cứu hoả** tại (228,4; 272,3) ("Xe luôn sẵn sàng trong 60 giây! 🚒", "Phòng cháy hơn chữa cháy nha bạn!", "Chào bạn! Muốn ngồi thử ghế lái không? 😄").
- **Tương tác:** tại (236; 276,1) bán kính 2,2 **E tham quan** (modal 4 thẻ thông tin: xe bồn 4000 lít, xe thang 32 m, xe bọt, mẹo an toàn); miễn phí.
- **Bản đồ:** teleport (236; 277,9). Taxi: (236; 290).

### 7.3 Trường Tiểu học QC City
**Tên:** Trường tiểu học – cv:148–192.
- **Vị trí/kích thước:** khuôn viên x 214,6–261,6 (**47 m**), z 305,6–364,4 (**58,8 m**), tường rào chân vàng 0,6 m + song sắt 1,2 m (cao đến 1,75). **2 cổng**: chính phía Bắc x 233–239 ở z=305,6 (trụ vàng 0,7×2,6, mũ ngói, bảng "🏫 TRƯỜNG TIỂU HỌC QC CITY" 6,9×0,95 m); phụ phía Tây z 329–335 ở x=214,6.
- **Dãy lớp học:** x 218–258 (40 m), z 350–362,6 (12,6 m), cao 11,4 m (3 tầng), tường vàng + dải kem; hành lang 3 tầng nổi 1,8 m rộng phía Bắc (z≈348,2) với cột trắng cách 4,4 m; khối sảnh giữa 6×13,6×2,6 có đồng hồ (r 1,1 tại (238; 11,4; 347,4)); mái ngói đỏ 4 mái cao 3,2 m.
- **Sân trường:** sân phủ x 215–261, z 306–349,4 màu xám; **sân bóng rổ** x 241–257, z 312–328 (16×16 m xanh lá + vạch), **2 rổ** tại z≈312,6 và 327,4, x=249 (cột 3,4 m, bảng 1,8×1,05, vành cam); **cột cờ** (236; 316) cao 9 m, cờ xanh có 📘 bay (động); 4 bồn cây (222,5; 318), (222,5; 334), (230; 344), (248; 344) mỗi bồn 2,2×2,2; 2 ghế đá sân trường (226,2; 318) và (226,2; 334) (mỗi ghế 2 chỗ).
- **Nhân vật:** 👦 **Bé Khang** (xanh dương) và 👧 **Bé Mai** (hồng) chơi bóng rổ tại (247,6; 324) và (251; 323,2) ném bóng luân phiên mỗi 2,2 s ("Vào rồi! 🏀", "Hụt mất tiêu 😅", "Tới lượt bạn ném nè!"). Không có giáo viên/học sinh trong lớp (lớp không vào được).
- **Tương tác:** tại cổng chính (236; 304,4) bán kính 2 **E xem bảng tin trường** (modal 4 thẻ: Giờ học, CLB bóng rổ, Ngày hội "Bé làm kiểm thử", An toàn giao thông). Bản đồ: teleport (233; 303,4) nhìn (236; 330).
- **Kết nối:** cổng chính ra Đường Bệnh Viện (z=290), cổng phụ ra Đường Trường Học (x=199).
- **Lưu ý:** tường dãy lớp là đoạn chặn có lời nhắn; không có nội thất.

---

## 8. GIAO THÔNG CÔNG CỘNG (tr, tf)

### 8.1 Xe buýt Tuyến 01
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

### 8.2 Cáp treo Vịnh Bình Phan
**Tên:** Cáp treo – tr:258–373.
- **Hai ga:** **Ga Đảo** tại bờ Đông Bắc đảo (tìm tự động: thử góc −0,62…−0,70 và r 60…64; dự phòng (49; −35), khả năng cao ≈ (48,8; −34,9)); **Ga Downtown** tại (136,5; −26,5). Mỗi ga: nền 8×14,4 m (hw=4, hl=7,2) cao 0,3, mái trắng cao ≈7,15, viền xanh ngọc, biển "🚡 CÁP TREO VỊNH BÌNH PHAN · GA ĐẢO/DOWNTOWN", 6 cột thép, vách kính; lối đi ga được đáp bằng sàn (addPlat) – ga Downtown cắt đoạn lan can bờ Tây để đủ chỗ.
- **Trụ giữa biển:** 1 trụ thép cao 26 m (tứ diện thu nhỏ) ở giữa đoạn cáp (≈ (92; −31)), chân bê tông chìm dưới biển, đèn báo đỏ nhấp nháy; dây cáp tube r=0,045 treo ở độ cao 4,4 m (ga) → 26 m (trụ).
- **Cabin:** **8 cabin** (1,9×0,9×1,9, trắng + viền ngọc, kính) đi vòng khép kín 4,2 m/s ngoài ga, **0,7 m/s trong ga**; ~40 giây một chuyến; cabin lắc nhẹ. Cabin dùng 3 InstancedMesh.
- **Tương tác:** tại ga bán kính 5,2, **E: vé 10 💰** (xác nhận); đứng chờ cabin (≥12 m rời ga thì huỷ và hoàn vé 10 💰); trên cabin camera tự lượn chậm, kéo chuột ngắm; tới ga bên kia tự xuống.
- **Bản đồ:** "Ga cáp treo · Đảo", "Ga cáp treo · Downtown".

### 8.3 Taxi
**Tên:** Taxi – tr:375–473.
- **Cách gọi:** phím **X** (phải ở cách đường ≤45 m; không trong toà; không đang đi xe khác). Taxi xuất phát cách 70–140 m theo đường, tới trong ~(quãng đường/9+3) giây, đợi tối đa 75 s.
- **Điểm đến (danh sách):** Quảng trường trung tâm (0; 30), Sân khấu QC Live (0; −30), Bến cảng (0; −62), Tháp Brand QA (0; 61), Toà Giáo trình (−50; 0), Khu nghỉ dưỡng, Ga cáp treo (Đảo/Downtown), Cổng Rời đảo (52; 0), Downtown · Đại lộ Hồ Ngọc (199; 0), Đại công viên · Cổng Bắc (199; 0), 11 toà công ty không khoá, Chợ QC, Showroom, Văn phòng địa chính, Trung tâm Việc làm (176; 277,4), Nhà trọ khởi nghiệp, + (do module khác nối thêm) Bệnh viện (238; 200), Trạm cứu hoả · Trường Tiểu học (236; 290), Công viên Cổng Đông (252; 101), Công viên Cổng Nam (199; 200).
- **Giá:** **10 💰 + 1 💰 mỗi 20 m** đường thật; đang đi bấm **X** để "đi nhanh" (tới ngay). Taxi vàng 0xf5c400, biển TAXI trên nóc, tuân đèn và nhường người như xe bot.
- **Tương tác:** E lên taxi (bán kính 4); khi tới, người chơi xuống bên phải xe.

### 8.4 Xe bot dân thường (tf:154–191)
Tối đa **10 mẫu xe** (sedan, suv, mini, pickup, sport; nhiều màu) chạy theo đồ thị taxi, chỉ ở các nút x>130; tốc độ tối đa 9–12 m/s, tăng 2,4 / phanh 6,5 m/s²; dừng đèn đỏ, giữ khoảng cách, nhường người; kẹt đối mặt >5 s thì "ma" 2,5 s xuyên qua nhau; bóp còi khi bạn chắn đường (toast "🚗 Bíp bíp! Ô tô xin đường – bước lên vỉa hè nhé."). Chỉ hiển thị/cập nhật khi cách bạn <210/240 m.

---

## 9. NGƯỜI TRÊN PHỐ

### 9.1 Người đi bộ tự động (pd)
**Tên:** Hệ thống người đi bộ – pd:1–317 (đọc đầu file và phần dựng đồ thị).
- **Mạng vỉa hè:** mỗi ngã giao có 4 góc phố cách tim ±12,8 m; cạnh VỈA HÈ (dọc đường) và cạnh QUA ĐƯỜNG (đúng 27 vạch); quét vật cản thật (circles/boxes/SEGS).
- **Hành vi:** qua đường khi đèn người đi bộ xanh; xếp hàng chờ ở mép vỉa hè (3 hàng × 3 người mỗi đầu vạch); không qua khi có xe trên vạch; người đang ở lòng đường nằm trong `W.PEDS` để xe bot phanh.
- **Số lượng ("bể" cố định quanh người chơi):** 18 / 26 / 34 người (máy yếu/vừa/mạnh), tầm 70/85/100 m; ban đêm × 0,55.
- Người dựng từ `W.people` (Xbot): tốc độ clip khớp sải chân, quay đầu mượt.

### 9.2 Người đi phố đủ kiểu (sl)
- **🎧 2 người đeo tai nghe:** đi qua lại vỉa hè Bắc Đại lộ Hồ Ngọc ở z=−13,4, đoạn x 192–240 (nữ áo hồng) và x 148–165 (nam áo xanh); tốc độ 1,3 m/s; dừng nhún nhảy 5–8 s ("🎧 ♪♫ Nhạc hay quá!", "♪ Lên nhạc nào~", "🎶 Bài này cuốn ghê").
- **🎸 Ban nhạc rock dạo QC Rock:** 3 thành viên (🎸 Khánh guitar, 🎸 Tú bass, 🥁 Nam trống) đi dọc vỉa hè z≈−13,2 giữa 3 điểm dừng x=150, 196, 236; mỗi điểm: dựng trống 3 s → chơi 48 s → đi tiếp. Lời chào: "🎸 Xin chào Downtown! Bài này tên là "Hotfix lúc 2 giờ sáng"!". Nhạc WebAudio tự tạo (132 BPM, riff 16 nốt), nghe to dần khi lại gần (tới 45 m), có pan trái/phải. 4 khán giả (người đi đường) đứng xem. **E ủng hộ: 10 💰** ("Cảm ơn bạn! 🤘 Bài sau tặng bạn!"). Bản đồ: "Ban nhạc rock dạo (Downtown)".
- **🦸 Nhóm cosplay** (xem 6.10).
- **🎩 Ảo thuật gia Bình Minh:** tại Phố ẩm thực Đồi QC (307; 104) **(ngoài phạm vi tài liệu này, thuộc Đồi QC)**; E ủng hộ 10 💰.
- **Chạy:** các hoạt động trên chỉ cập nhật khi bạn ở P.x 120–280, z −90…500.

---

## 10. NAV.JS – lưới đi bộ cho bot (nv:1–52)
- **Phạm vi lưới:** gốc (X0=−100; Z0=−118), **370 × 600 ô** (x −100…270, z −118…482), ô 1 m → bao trùm đảo + cầu + Downtown + Phường (không bao Khu Giải trí x>270).
- **Ô đi được:** địa hình `groundH>−0,22` **hoặc** trong Downtown/Phường/Arena (`inDT`, pad −0,5); trừ lòng đường (`W.roadBlock` – chỉ cho qua tại vạch), cộng sàn (plats, trừ vòng ring), trừ vòng va chạm (circle + 0,45 m), đoạn chặn (`SEGS`, trừ `noNav`), hộp (box + 0,45).
- **Tìm đường:** A* 8 hướng (không cắt góc), tối đa 60 000 mở rộng, làm mượt line-of-sight; đích không đi được → ô gần nhất trong 7 ô.
- Dùng bởi `bots.js` (ngoài phạm vi).

---

## 11. ĐẢO MASTER DASHBOARD – phần thuộc `city.js` / `wd.js` (để đối chiếu điểm nhảy bản đồ)

### 11.1 Đường vành đai
**Tên:** Đường vành đai – ci:28–51. r=43, rộng 7 (r 39,5–46,5), **mặt phẳng y=0,12** (sàn đứng cùng cao độ), 420 đoạn, bó vỉa 2 vòng torus; 30 cột đèn vành ngoài (r 47,6), bỏ đèn gần đầu cầu (|z|<7,5 phía x>0) và gần góc −π/2. Vạch trắng mép + vàng đứt giữa.

### 11.2 Tháp Brand QA·QC·QE
**Tên:** Tháp Brand QA – ci:53–91. Tâm (0; 61), quay π (mặt chính hướng vào tâm đảo, về phía Bắc). Bệ đá 24×20 (cao 0,6, `addPlat` cao 0,6); sảnh kính 16×12×6 + 4 cột; thân tháp kính 11×40×9 (y 6,9–46,9) có 11 dải trang trí; đỉnh 12×3,4×10 có 4 logo "QA · QC · QE" phát sáng; anten 9 m + đèn đỏ nhấp nháy ở y≈ 60; biển "BÌNH PHAN QUALITY HUB" ở sàn; **đài phun nước** r=3,6 tại 12,6 m phía trước (0; 48,4); điểm Brain tại (0; 53,4) (vòng sáng xanh dương). Va chạm 16,6×12,6. Nhãn "🧠 Tháp Brand QA · QC · QE – QA Brain: phân tích tài liệu, sinh test case" (y=55, fade 260 m).

### 11.3 Học viện QA + kiosk quiz
Học viện tại (≈16,3; 52,5) dùng mẫu nhà (giải thưởng quiz). 2 kiosk quiz "QUIZ QA – Đúng = có tiền": (−5,6; 4,6) và (5,5; −61,5), màn hình tròn xanh.

### 11.4 Bến cảng
Cầu tàu x=0 từ z=−62 đến −101 (rộng 3 m, cọc mỗi 4 m); nhánh cầu bến thuyền z=−86 từ x 1,5 đến 9 (rộng 2,6); chỗ câu cá (0; −99,4); bến thuyền (8,4; −86), chỗ đỗ thuyền (11,2; −86); Nhà thuyền (≈−8,0; −61,5). Nhãn "🎣 Chỗ câu cá".

### 11.5 Bồn hoa/ghế/rác (ci:127–159)
~10 bồn hoa (bán kính 10,5 quanh tâm đảo, loại bỏ gần lối đi và z<−8), ≤8 ghế đá (r=12,8), 2 bồn hoa + 1 ghế trước tháp, 3 bồn trước 3 lô R; 14 hoa mỗi bồn, mỗi bồn có thể tưới (`water`, `growth` – logic nằm ngoài phạm vi). `trashArea` chọn điểm rác ngẫu nhiên.

### 11.6 Bãi biển công cộng (6b trong wd)
Biển "🏖️ Bãi biển công cộng – Đảo Master Dashboard · miễn phí cho mọi người" tại cực (−0,3; 55) ≈ (52,5; −16,2); 7 cây cọ; 2 ghế đá tại cực (−0,22; 52) và (0,24; 52).

---

## 12. Điểm "chưa rõ" / mâu thuẫn giữa chú thích và mã
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

## 13. BẢNG TÓM TẮT CÁC KHÔNG GIAN

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
