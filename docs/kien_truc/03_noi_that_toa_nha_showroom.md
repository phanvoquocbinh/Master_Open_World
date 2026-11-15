# 03. Nội thất toà nhà công ty, máy tính làm việc, showroom xe và xe đại gia

Tài liệu hiện trạng, đọc từ mã nguồn các file: `js/interior.js`, `js/workpc.js`, `js/jobs.js`, `js/showroom.js`, `js/luxury.js` và danh sách toà trong `js/downtown.js`. Chỉ ghi những gì mã thể hiện; chỗ mã không nói rõ ghi "chưa rõ". Không chép nguyên văn mã.

Quy ước chung: 1 ô = 1 m = 1 đơn vị toạ độ. Trục x sang phải, z hướng "ra phía trước" (về phía mặt tiền kính), y lên trên. Góc quay `rotY = 0` nghĩa là vật nhìn về +z, `rotY = π` nhìn về -z.

---

## 0. Kiến trúc chung của các cảnh nội thất

### 0.1. Cảnh riêng, không dựng chung với thế giới ngoài

- `interior.js` tạo một `THREE.Scene` riêng tên `IS` (nền 0x0f1520), có 1 đèn bán cầu (cường độ .55) và 1 đèn định hướng có đổ bóng (bản đồ bóng 1024 nếu chất lượng thấp, 2048 nếu không; vùng bóng ±22).
- `showroom.js` có cảnh riêng `SS` (đèn bán cầu .75, đèn định hướng 1.0, bóng 1024, vùng ±26).
- Khi vào, cảnh được hoán đổi bằng `renderPass.scene = IS` (hoặc `SS`); nhân vật người chơi `me.g` được gỡ khỏi `scene` và thêm vào cảnh trong. Khi ra thì làm ngược lại.
- Khi vào, mã cất toàn bộ danh sách va chạm của thế giới ngoài (`SEGS`, `circles`, `boxes`, `plats`, `INTER`) vào `st.saved` rồi làm rỗng; ra thì trả lại. Vì vậy mọi toạ độ `circles/boxes/plats/INTER` trong nội thất là toạ độ PHÒNG, độc lập với toạ độ thành phố.
- Máy ảnh bị giới hạn bằng `HOOK.camBox`: trong toà là x ±(RW-.5), z ±(RD-.5), trần FY+CH-.3; trong showroom x ±(22-.5), z ±(14-.5), trần FY+6-.4. Khoảng cách camera `cam.dist` bị giảm còn tối đa 4.6 (toà) hoặc 6 (showroom) khi ở trong.
- Chuyển cảnh: màn đen mờ dần (`fade`, 0.28 s, chờ 300 ms rồi dựng cảnh, 60 ms sau mở lại).
- Nhãn chữ trong nhà dùng nhóm `'interior'` (`HOOK.labelGroup`).

### 0.2. Hệ toạ độ phòng (toà công ty)

Hằng số: `RW=18`, `RD=12`, `CH=3.4` (chiều cao trần), `FY=.1` (mặt sàn, y).

- Sàn và trần là hộp `RW*2 × RD*2` = 36 m (x) × 24 m (z), tâm (0,0). Tức x thuộc [-18, 18], z thuộc [-12, 12].
- z = -12 (RD âm): bức tường sau, có thang máy, bảng tên tầng, logo (sảnh).
- z = +12: mặt tiền. Ở sảnh là kính + cửa ra ngoài; ở các tầng khác là dải cửa sổ nhìn ra đường chân trời.
- x = ±18: tường bên, có dải cửa sổ (kể cả ở sảnh).
- Toạ độ bàn, ghế, vật dụng trong tài liệu này đều là (x, z) của phòng này; y thường là FY + độ cao.
- Va chạm: `solid(x0,x1,z0,z1)` thêm một hình chữ nhật cấm đi vào `boxes`; `circles` là cột tròn (cây, bàn tròn, người đứng); `plats` có 1 sàn hình chữ nhật cao FY phủ cả phòng.
- Vị trí xuất hiện của người chơi: đi thang máy tới thì ở (0, -9.4) quay mặt +z (`-RD+2.6`); vào từ ngoài phố thì ở sảnh (0, 9.6) quay mặt -z (`RD-2.4`).

### 0.3. Vỏ phòng chung (`shell`)

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

### 0.4. Theme theo công ty (`THEMES`, `themeOf`)

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

### 0.5. Các hàm dựng nội thất dùng chung

- `desk(x,z,f,key,dual)`: bàn 1.5×.05×.75 tại độ cao FY+.74, 2 chân thép, màn hình 0.62×.38 quay về phía người ngồi (f=+1: người ngồi ở z-.75, mặt màn hình nhìn -z; f=-1 ngược lại), bàn phím, 30% có cốc. Nếu `dual` thì 2 màn (màn thứ 2 luôn là "mail"). Tự đặt 1 ghế (không có điểm ngồi riêng).
- `chair(x,z,rotY,mat,sit)`: ghế xoay; nếu `sit=true` thì thêm điểm ngồi E/C.
- `sofa(x,z,rotY,col,w,seats)`: sofa dài w, cứ 0.8 m có 1 chỗ ngồi (bán kính bấm 2.2).
- `plant(x,z,s)`: chậu cây, thêm cột tròn r=.35·s.
- `rug`, `frame` (tranh khung đen), `plate` (tấm phẳng có thể phát sáng), `stand` (bảng trắng đứng, có va chạm).
- Hình màn hình theo nghề (`drawScr`): code, test, kanban, chart, sheet, crm, dash, design, mail, gantt; dạng tối cho code/test/dash.
- 6 bức tranh nghệ thuật `ART[0..5]` vẽ thủ tục.

Điểm ngồi (`seat`) dùng `W.addSeat` với phạm vi `'interior'`: bấm E hoặc C để ngồi. Khi dựng xong tầng, ghế nào có bot ngồi gần (<.5 m) bị đánh dấu `taken='bot'`.

### 0.6. Dựng và dọn tầng

`go(idx, at)` dọn tầng cũ (`clearFloor`: bỏ ghế phạm vi interior, bỏ nhãn, xả hình học nhưng KHÔNG xả hình dùng chung với avatar, xoá `circles/boxes/plats/INTER`), đặt chỉ số tầng, `buildFloor()` (đặt theme, gọi `BUILD[kind]`, gộp mesh tĩnh `batchStatic`, đặt đèn, báo cho `W.work.onFloor`). Mỗi lần vào tầng là dựng lại hoàn toàn, nên NPC và vị trí ngẫu nhiên (bàn nào có người, cốc trên bàn...) khác nhau mỗi lần.

---

## 1. Toà công ty: số tầng, loại tầng, phòng ban

### 1.1. Danh sách 13 toà (`DEFS` trong downtown.js)

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

### 1.2. Hồ sơ công ty (`profileOf`)

- `product = true` nếu tên toà thuộc tập {Bình Phan Tech Hub, API Hub Tower, DataCheck Corp, Mobile First QA, Cloud Test Co., DevOps Center} hoặc `style==='hq'`.
- Product ("Công ty sản phẩm (Product)"): 8 phòng ban theo thứ tự `hr, product, dev, qa, sales, marketing, accounting, ops`.
- Outsource ("Công ty gia công phần mềm (Outsource)"): 4 phòng ban `hr, dev, qa, pmo`.
- Toàn game có 9 phòng ban: `dev, qa, pmo, product, sales, marketing, accounting, ops, hr` (pmo chỉ có ở Outsource; product, sales, marketing, accounting, ops chỉ có ở Product).

### 1.3. Công thức số tầng (`floorsOf`)

- N = `max(7, round(h / 3.6))`.
- Tầng 1 luôn là `lobby` ("Sảnh lễ tân").
- Phòng ban thứ i (i từ 0, k = tổng số phòng ban) ở tầng `2 + floor(i · (N-4) / k)`. Hệ quả: các phòng ban dàn đều trong khoảng tầng 2 đến N-3; với toà thấp, hai phòng ban có thể trùng số tầng (xem bảng).
- Tầng N-1 là `canteen` ("Nhà ăn nhân viên"), tầng N là `director` ("Phòng Giám đốc").
- Tên phòng QA đổi theo nhóm toà: lấy nhóm đầu tiên khác `qa` và `dev` trong `teams`, tra `QA_NAME`: perf = "Phòng QA · Performance", sec = "Phòng QA · Bảo mật (Pentest)", data = "Phòng QA · Data", mobile = "Phòng QA · Mobile"; nếu không có thì dùng tên mặc định "Phòng Kiểm thử QA/QC".
- Tổng số loại tầng: 4 (`lobby`, `dept`, `canteen`, `director`). Mỗi toà dựng lại từng tầng theo yêu cầu, tất cả tầng cùng loại có chung khung (kích thước phòng 36×24).

### 1.4. Bảng tầng của từng toà (tính bằng đúng công thức mã)

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

## 2. Các loại tầng

### 2.1. Sảnh (`lobby`, tầng 1)

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

#### 2.1.1. Phòng phỏng vấn (sảnh)

- Tường kính dọc x=8.5 từ z≈3.9 đến 12 (có lối vào rộng 1.8 m ở z 2..3.8) và tường kính ngang z=2 từ x=8.5 đến 18. Cột đen ở góc (8.5, 2).
- Biển "📝 PHÒNG PHỎNG VẤN" 2.6×1.3 tại (13.2, y2.4, 1.95), quay π (nhìn ra sảnh).
- Thảm 6×4.6 tại (13.2, 7), bàn gỗ 2.6×1.1 tại (13.2, 7) (va chạm x 11.8..14.6, z 6.4..7.6).
- Ghế HR tại (13.2, 8.2) quay π (có người ngồi); ghế ứng viên tại (13.2, 5.8) quay 0 (không có điểm ngồi).
- NPC "HR phỏng vấn": ngồi tại (13.2, 8.2), áo trắng; lời thoại: "Mời bạn ngồi, mình bắt đầu nhé!", "Bình tĩnh, đọc kỹ câu hỏi nha."
- Tranh ART[2] tại (17.86, y2.0, 7), quay -π/2; cây (17.2, 11.2) tỷ lệ 1.1.
- Điểm bấm E tại (13.2, 5.1) r=1.7, ưu tiên .5: nếu đã là nhân viên toà thì hiện "Bạn đã là nhân viên ở đây"; nếu chưa thì bắt đầu phỏng vấn.

#### 2.1.2. Cổng quẹt thẻ (`buildGate`)

- Hai máy 0.32×1.0×1.3 tại (±1.25, -5) có đèn xanh; giữa là hai cánh kính xoay mở (góc đến 90 độ) và 1 hộp chặn x -1.1..1.1.
- Nhãn bấm E thay đổi: nhân viên "Quẹt thẻ nhân viên"; đang tham quan "Qua cổng cùng hướng dẫn viên"; toà khoá "Chỉ nhân viên – phỏng vấn ở phòng bên phải"; còn lại "Tham quan? Nhờ lễ tân gọi hướng dẫn viên".
- Nhân viên bấm E: tiếng bíp cao, mở cổng 4 s, chấm công (mục 5.2). Đang tham quan: mở cổng 4 s, hướng dẫn viên nói "Em quẹt thẻ khách rồi...". Người ngoài: tiếng bíp thấp, thông báo từ chối.
- Tự mở: người chơi đứng trong dải z -7.6..-5.3, |x| < 1.8 (đi từ trong ra) thì cổng tự mở 2.5 s; khi đang tham quan và người chơi đứng gần phía trước cổng (|x|<2, z -4.6..-2.6) cổng tự mở 3 s. Cổng không đóng khi người chơi còn đứng trong làn (|x|<1.2, |z+5|<.8).

### 2.2. Tầng phòng ban (`dept`)

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

#### 2.2.1. Phòng họp kính

- Tường kính dọc tại x=4 từ z=-11.8 đến -4.6; tường kính ngang tại z=-3 từ x=5.8 đến 17.8. Cửa ra vào là khoảng hở góc Tây-Nam: x 4..5.8 ở z=-3 và z -4.6..-3 ở x=4.
- Bàn họp 4.2×1.6 tại (11, -7.4); va chạm x 8.7..13.3, z -8.4..-6.4.
- Bảng họp (tấm phát sáng 3.4×1.9) trên tường sau tại (11, y1.85, -11.85); tiêu đề "🗣️ Họp <vai> · Sprint 24", nội dung là hình màn hình đầu tiên của phòng ban (`D.scr[0]`).
- 4 ghế: (9.6, -6.4) và (12.4, -6.4) quay π; (9.6, -8.4) và (12.4, -8.4) quay 0.
- NPC: "Lead" đứng thuyết trình (`present`) tại (13.9, -9.4), nghiêng -.7; 3 người ngồi họp tại 3 ghế đầu (9.6,-6.4), (12.4,-6.4), (9.6,-8.4) (vai là vai phòng ban). Lead trò chuyện luân phiên với người 1 và người 3 bằng kịch bản `MEET` (3 kịch bản, mục 6.3).
- Điểm bấm E "Vào họp Daily 15 phút" tại (6.2, -6.6) r=1.8 chỉ có khi `mine` (mục 5.3).

### 2.3. Nhà ăn (`canteen`)

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

### 2.4. Phòng Giám đốc (`director`)

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

## 3. Bố trí bàn, góc vui chơi

### 3.1. Quy tắc chọn kiểu bố trí

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

### 3.2. Màu theo phòng ban (`DEPTS`)

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

### 3.3. Cách đặt NPC vào bàn

- Danh sách "ghế" của kiểu bố trí được xáo trộn; nếu là nhân viên toà và đang ở tầng phòng QA thì 1 ghế được dành cho bàn bạn (xem 5.3).
- 7 NPC đầu trong danh sách còn lại ngồi gõ phím (`type`). 2 trong số đó (người thứ 1 và thứ 4) có 1 đồng nghiệp đứng cạnh hỏi chuyện (`deskChat`): vị trí đứng lệch khoảng .85 m ngang bàn và ±.3 m theo z.
- Số NPC ước tính ở tầng phòng ban: Lead 1 + họp 3 + gõ phím 7 + ghé hỏi 2 + pantry 2 + lounge 1 + NPC đứng cạnh 1 + người đi tuần 1 = 18; riêng `shared` thêm 6 + 1 = 25 (nếu đủ ghế).

### 3.4. Màn hình/đồ dùng trên bàn

Màn hình có hình riêng theo nghề (code, test, kanban, chart, sheet, crm, dash, design, mail, gantt); bàn phím; 30% có cốc (trắng/đỏ/xanh). Mặt bàn: trắng, gỗ hoặc đen theo theme.

### 3.5. Góc vui chơi (`funZone`)

Tại tầng phòng ban, góc tại (x, z) = (-4.8, 9.2) (đối diện lounge và pantry), biển "Làm hết sức · chơi hết mình" ở (-4.8, y2.6, 11.88).

| Kiểu | Chi tiết |
|---|---|
| pingpong | bàn xanh 2.7×.08×1.5 tại (-4.8, y.86, 9.2), lưới trắng, 4 chân thép; va chạm x -6.2..-3.4, z 8.4..10 |
| beanbag | 4 ghế lười tại x = -6.4, -5.3, -4.2, -3.1; z = 8.9 hoặc 9.7 (chẵn/lẻ); mỗi ghế có điểm ngồi; màu cam, xanh, vàng, hồng |
| arcade | 2 máy 0.9×1.8×.8 tại (-5.6, 9.6) tím và (-4.3, 9.6) đỏ; màn hình phát sáng quay π; va chạm x -6.1..-3.2, z 9.2..10 |
| garden | tường cây 4×2.6×.15 tại (-4.8, 10.6) và 14 chùm lá ngẫu nhiên; va chạm x -6.8..-2.8, z 10.5..10.7 |
| hammock | 2 trụ gỗ tại x = -6.3 và -3.3 (z 9.2), võng màu hồng giữa; điểm ngồi (nằm) tại (-4.8, 9.2) r=1.4 (nhãn "Nằm võng nghỉ trưa") |

---

## 4. Chín phòng ban: khu đặc trưng (FEAT)

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

## 5. Tương tác

### 5.1. Phỏng vấn (`workpc.js` hàm `interview`)

Khởi động: bấm E trong phòng phỏng vấn (sảnh) hoặc chọn "Vào phòng phỏng vấn" ở lễ tân (màn đen, đưa người chơi tới (13.2, 5.4), quay mặt về HR, rồi mở bài phỏng vấn).

Điều kiện chặn:
- Đã là nhân viên toà này: không cho.
- Đang có việc ở công ty khác: hỏi xác nhận nghỉ việc cũ trước (xoá job và ngày làm).
- Vừa trượt: phải chờ 120 s (lưu theo tên toà).

Nội dung: 5 câu trắc nghiệm lấy từ `data/questions.json`:
- Chủ đề theo `teams` của toà (bảng `TOPIC`): qa = istqb, design, agile, scenario; dev = automation, api, db; perf = performance; sec = security; data = db; mobile = mobile; luôn cộng thêm chủ đề của qa. Toà `locked`: chỉ câu mức độ >= 2; toà thường: mức độ <= 2. Nếu ít hơn 5 câu thì mở rộng theo mức độ.
- Sai 1 câu là trượt (hiện đáp án đúng và giải thích, chờ 2 phút); đúng cả 5 thì đậu.
- Đậu: tạo thẻ nhân viên (mã gồm 3 chữ cái đầu của tên viết tắt toà + số 1000-9999), lưu `S.work.job = {company, since, badge, role:'QA Engineer'}`, thưởng 50 xu, hiện thẻ cho người xem.

### 5.2. Thẻ nhân viên và chấm công

- Thẻ nhân viên (`badge`): tấm 0.07×.105 gắn trước ngực người chơi (xương Spine2, nếu không có thì Spine1/Spine/Chest/Body), kèm 2 dây đeo màu toà; độ nhô ra theo mô hình nhân vật (soldier .2, xbot .14, robot .24, mặc định .17). Mặt thẻ vẽ tên viết tắt toà, tên người chơi, vai, mã vạch giả và mã thẻ.
- Quẹt thẻ ở cổng sảnh (E): lần đầu trong ngày thì đặt cờ `swipe`, gọi `jobs.onEnter` trả lương ngày (60 xu; 120 xu nếu toà khoá; sau 0.9 s; chỉ 1 lần mỗi ngày theo `payday`), thông báo giờ chấm công. Mở máy tính ở bàn mà chưa quẹt cũng tự chấm công.
- Lịch ngày (`day()`) tự reset khi sang ngày mới (theo UTC `toISOString`): cờ `swipe, standup, tickets{}, mail, lunch, report`.
- Bảng "Việc hôm nay" ở góc trái: quẹt thẻ, họp Daily (nêu số tầng phòng họp), làm 3 ticket, trả lời email PM, ăn trưa (nêu số tầng nhà ăn), báo cáo cuối ngày; ghi chú "Bàn của bạn: tầng n, có vòng vàng".
- Lần đầu vào sảnh toà mình làm mà chưa chấm công: nhắc sau 0.9 s.

### 5.3. Bàn của bạn

Chỉ khi: bạn là nhân viên toà (`isEmp`) và tầng đang vào là tầng phòng ban của bạn. Phòng ban của bạn (`myDept`) = `qa` nếu toà có phòng QA (cả hai loại hồ sơ đều có) nên luôn là QA.

- Chọn bàn: bàn tại gần (-5, 1.85) hướng 0 (có trong kiểu `rows`); nếu không có (các kiểu khác) thì lấy bàn cuối cùng trong danh sách có hướng 0 và z > 0; nếu không còn thì bàn đầu có hướng 0.
- Gắn: điểm ngồi "Ngồi bàn của bạn", bảng tên "<tên người chơi> · QA / Bàn làm việc của bạn" (.5×.25 trên bàn tại (x, y.96, z+.36)), vòng vàng nhấp nháy dưới đất tại (x, z-.65) bán kính .55..72.
- Điểm bấm E tại (x, z-.75) r=1.5, ưu tiên .9: "Bàn làm việc của bạn – ngồi & mở máy tính": cho người chơi ngồi (`W.life.sitOn`), sau 350 ms mở máy tính (`openPC`).

### 5.4. Thang máy

- Bấm E tại (0, -10.3): mở danh sách tầng từ trên xuống (tầng N đến 1), mỗi thẻ có biểu tượng loại tầng (sảnh, phòng ban, căng-tin, giám đốc), số tầng và tên.
- Nhân viên hoặc đang tham quan: mở được mọi tầng. Còn lại: chỉ sảnh; các tầng khác bị khoá mờ, bấm ra thông báo cần thẻ nhân viên hoặc đi cùng hướng dẫn viên (toà khoá không có lựa chọn hướng dẫn viên).
- Chọn tầng: màn đen, dựng tầng, người chơi xuất hiện trước thang máy (0, -9.4).
- Vào tầng 1 từ ngoài phố: xuất hiện tại sảnh (0, 9.6). Toà khoá: bảo vệ ngoài cửa nói câu thoại khác nhau tuỳ nhân viên hay khách (mã trong downtown.js).

### 5.5. Họp Daily

- Điểm bấm tại (6.2, -6.6) trong tầng phòng ban của bạn: "Vào họp Daily 15 phút (E)"; nếu đã họp hôm nay thì hiện "Đã họp Daily hôm nay".
- Hộp thoại: 3 đồng nghiệp trình bày 3 câu (hôm qua, hôm nay, blocker); bạn chọn 1 trong 3 câu của mình (trộn ngẫu nhiên); chỉ 1 câu đúng cấu trúc "Hôm qua em chạy xong 40 test case... Blocker: cần dữ liệu khuyến mãi trên STG" được +15 xu; câu sai vẫn đánh dấu đã họp nhưng không có xu (Lead nhắc nói cụ thể).

### 5.6. Máy tính làm việc (`openPC`, `workpc.js`)

Chỉ nhân viên toà mới mở được. Có 5 ứng dụng:
- Jira: 3 ticket mỗi ngày theo ngày trong tháng và độ dài tên toà: test run (5 mẫu: đăng nhập, giỏ hàng, tìm kiếm, đổi mật khẩu, upload ảnh, đánh Pass/Fail từng bước), log bug (5 mẫu: chọn Severity/Priority/Component), verify bug (5 mẫu: Close/Reopen/Won't fix). Mỗi ticket đúng thì +30 xu.
- Email: 1 thư ngày (PM Hằng hoặc Team Lead), 3 lựa chọn trả lời, 1 đúng +20 xu.
- Chat nhóm: tin nhắn tĩnh `#team-qa`.
- Báo cáo ngày: cần đã chấm công và 3 ticket; thưởng 100 xu (toà khoá 150), +50 nếu đã họp Daily, trả lời email và ăn trưa.
- Việc trí tuệ: mở Trung tâm Việc làm tab "brain" (bài SQL/API/bug/test design/JS; nhân viên +25% công).

### 5.7. Ăn trưa (nhà ăn)

Điểm bấm tại (-8, -9) r=1.6. Nhân viên: miễn phí, tăng tốc 10 phút (`buffs.energy` + 600000 ms), đánh dấu `lunch` trong ngày. Khách: hỏi trả 25 xu, nếu đủ thì tăng tốc 10 phút.

### 5.8. Lễ tân và tham quan

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

### 5.9. Việc làm (`jobs.js`, phần liên quan nhân viên)

- `canEnter(t)`: toà không khoá ai cũng vào; toà khoá chỉ vào được khi đang làm ở đó (hàm này có trong `jobs.js`; trong các file đã đọc, cửa toà ở downtown.js không gọi nó và vẫn cho khách vào sảnh toà khoá để phỏng vấn).
- Lương ngày 60 xu, toà khoá 120 xu; việc trí tuệ +25% (tham số trong dữ liệu), việc chân tay +10% khi có việc ở công ty.
- Tab "Xin việc công ty" liệt kê 13 toà, nhóm, số tầng, loại công ty, và nút chỉ đường (cột sáng vàng tại cửa). Đoạn xét điều kiện cũ phía sau lệnh `return` là mã chết, không chạy.
- Việc chân tay (dọn rác, giao hàng, phụ bếp) và việc trí tuệ không liên quan tới nội thất, không mô tả sâu ở đây.

---

## 6. Nhân vật trong toà

### 6.1. Vai và hành vi

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

### 6.2. Cơ chế trò chuyện và lời nói

- Cặp trò chuyện (`talk`): 2 NPC + một kịch bản gồm các câu xen kẽ [người nói 0/1, câu]. Chỉ chạy khi người chơi ở trong 13 m quanh một trong hai người; mỗi câu bong bóng 3.4 s, cách nhau 3.1 s; hết kịch bản nghỉ 7-15 s rồi chọn kịch bản mới ngẫu nhiên.
- Lời nói lẻ: cứ 4-8 s, trong các NPC có `lines` trong vòng 6 m (và chưa có bong bóng) chọn ngẫu nhiên 1 người với xác suất 60% nói 1 câu.
- Lễ tân tự nói câu đầu khi người chơi lại gần 3.5 m (1 lần mỗi lần vào sảnh).

Lời thoại cố định đã nêu ở các mục 2.x. Giám đốc: "Chào bạn! Mình là <tên>. <toà> luôn cần người giỏi QA.", "Muốn làm ở đây? Phỏng vấn ở sảnh tầng 1 nhé – 5 câu QA/QC thôi!", "Chất lượng là uy tín của công ty." Lễ tân: "Chào mừng tới <toà>!", "Anh/chị cần tham quan hay phỏng vấn ạ?", "Mời anh/chị dùng nước ☕". Bảo vệ: "Chào anh/chị!", "Nhân viên quẹt thẻ ở cổng nhé." Lounge: "Nghỉ 5 phút rồi làm tiếp 😌". Hướng dẫn viên chờ: "Anh/chị muốn tham quan công ty không ạ? Nhờ lễ tân gọi em nhé 😊".

### 6.3. Kịch bản chung

- `MEET` (họp, 3 kịch bản): điểm tiến độ, ưu tiên bug High trên Jira, phản hồi demo khách (báo cáo Excel).
- `PANTRY` (pantry, hàng đợi, ăn trưa, 3 kịch bản): cà phê và release khuya, trưa ăn gì, team building đi biển.

### 6.4. Lời thoại mẫu theo phòng ban (`talks`)

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

## 7. Showroom ô tô QC Auto (`showroom.js`)

### 7.1. Kích thước và cảnh

- Phòng trong: `RW=22, RD=14, CH=6, FY=.1`; sàn và trần 44×28 m, tâm (0,0), tức x thuộc [-22, 22], z thuộc [-14, 14]; trần cao 6 m. Dùng chung hệ toạ độ phòng như toà công ty (z=-14 là tường sau, z=+14 là mặt tiền kính).
- Vỏ ngoài: xem mục 8 (toà kính lớn 44×28 m ở Đồi Brand QC, cao 9 m). Kích thước ngoài đúng bằng phòng trong.
- Vào (E tại cửa toà): màn đen; người chơi xuất hiện tại (0, 11.6) quay -z (`RD-2.4`); sau đó hộp thoại chào của tư vấn viên (500 ms sau). Ra: điểm bấm E "Ra ngoài phố" tại (0, 12.6) r=1.7; vị trí ra do `exitAt()` của module cha quyết định (mã luxury.js đổi thành cửa Tây của toà kính: x = X0 - 1.8, z = CZ, hướng -x; toạ độ tuyệt đối chưa rõ vì phụ thuộc `W.hillsInfo.SHOW`).
- Khi vào, danh sách va chạm thế giới được cất và khôi phục như toà công ty.

### 7.2. Bố cục phòng

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

### 7.3. Xe trưng bày (11 ô tô)

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

### 7.4. Người trong showroom

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

## 8. Vỏ showroom trên đồi và xe đại gia (`luxury.js`)

### 8.1. Toà kính showroom (vỏ ngoài)

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

### 8.2. Xe đại gia

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

## 9. Bảng tóm tắt

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

## 10. Điểm chưa rõ và điểm lệch trong mã (để Bình lưu ý khi thiết kế lại)

1. Chú thích đầu file `downtown.js` ghi "8 kiểu" toà nhưng danh sách có 9 kiểu; chú thích đầu `showroom.js` ghi "11 ô tô (5 mẫu)" nhưng thực tế 8 mẫu.
2. Tên hiển thị các mẫu xe lấy từ `V.CARS[...]` (module khác): chưa rõ. Tên trong lời hướng dẫn: "QC Sport GT", "SUV 7 chỗ", "Pickup Ranger", "Sedan S", "Mini Hatch".
3. Toạ độ tuyệt đối của toà kính showroom (`W.hillsInfo.SHOW`), đường `LANE_Z`, danh sách biệt thự `VILLAS`: chưa rõ (nằm ngoài các file được giao).
4. Dòng dựng tấm nền màn hình ở phòng Vận hành (`ops`) bị chú thích nuốt nên không chạy.
5. Hai phòng ban có thể trùng số tầng ở toà thấp (Mobile First QA, DevOps Center); mã vẫn chạy nhờ chỉ số mảng.
6. `workpc.js` và `jobs.js` có đoạn mã chết (phần xét điều kiện xin việc cũ ở tab "hire" nằm sau lệnh `return`).
7. Ở kiểu bàn `shared`, NPC "đứng cạnh" tại vị trí mặc định (11.6, 3.1) có thể nằm trên khu bàn phòng ban thứ 2; mã không kiểm tra va chạm; chưa rõ có bị chồng hay không.
8. Phần "lịch sống sáng đi chiều về" của xe đại gia trong chú thích không gắn vào giờ trong ngày; hiện chỉ là vòng chờ cố định.
9. Hạt giống người (tên, dáng) phụ thuộc `js/people.js`, ngoài phạm vi; tài liệu này không mô tả hình dạng cụ thể của từng NPC.
