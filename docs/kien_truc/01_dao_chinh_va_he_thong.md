# 01 · Đảo chính Master Dashboard và các hệ thống chung (hiện trạng theo mã nguồn)

> Tài liệu hiện trạng kiến trúc cho QC World, viết từ việc đọc mã, không sửa mã. Phạm vi: `world.html`, `js/island.js`, `js/screens.js`, `js/campus.js`, `js/brain.js`, `js/resort.js` và các hệ thống chung `js/life.js`, `js/bots.js`, `js/people.js`, `js/vehicles.js`, `js/cafe.js`, `js/multi.js`, `js/gadgets.js`, `js/topup.js`, `js/ambience.js`, `js/skyfx.js`.
> Những nơi do file ngoài phạm vi dựng (`city.js`, `downtown.js`, `ward.js`, `interior.js`, `showroom.js`, `transit.js`, `arena.js`, `highland.js`, `traffic.js`, `jobs.js`…) chỉ được ghi theo cách `world.html`/`life.js` tham chiếu tới, kèm chú thích "chưa rõ trong phạm vi".

## 0. Quy ước

- 1 ô = 1 m = 1 đơn vị toạ độ thế giới. Trục x Đông (+) – Tây (−); trục z **Nam (+) – Bắc (−)**; y là độ cao.
- Góc cực `a` (rad) dùng trong quy hoạch: a=0 là Đông, a=π/2 là Nam, a=π là Tây, a=−π/2 là Bắc. `atPolar(a,r)` cho x=cos(a)·r, z=sin(a)·r (world.html:236).
- Hướng nhìn h (rad): đi thẳng thì x += sin h, z += cos h. h=0 nhìn về +z (Nam); h=π nhìn về −z (Bắc).
- Mực nước biển `WATER_Y = −0,35` m. Nền Downtown/Phường/Khu Giải trí phẳng ở y=0,02 (world.html:466).
- Số liệu có dấu "~" là tính từ công thức trong mã (các giá trị làm tròn do tôi tính lại), không phải hằng số viết sẵn.
- "Chưa rõ" = mã trong phạm vi không cho biết (do file khác dựng hoặc do đặt ngẫu nhiên khi chạy).

## 1. Kiến trúc nạp và cấu trúc tổng thể

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

## 2. ĐẢO CHÍNH MASTER DASHBOARD

### 2.1 Đảo Master Dashboard – địa hình, bờ biển, nước (world.html:451–542, 1139–1141)

- **Vị trí và kích thước:** tâm (0,0). Bán kính đảo `edgeR(a)=74+2,6·sin(3a+0,7)+1,6·sin(5a+2,1)+0,9·sin(9a)+10·exp(−(Δ(a,2,3)/0,42)²)` (world.html:455). Nhỏ nhất ~69,2 m, lớn nhất ~88,8 m (phình ra ở bờ Tây Nam a≈2,3 để làm khu nghỉ dưỡng). Một vài giá trị: Đông ~77,1; Nam ~72,6; Tây ~71,1; Bắc ~75,9. Địa hình là một lưới phẳng 320×320 m (`TS=320`, 300 đoạn ở mức Vừa).
- **Cao độ nền:** y≈0,0–0,1 (cồn cát gợn ±0,05–0,075) trong đảo; từ r=e−9 xuống r=e dốc xuống y=−0,55; ngoài bờ đáy biển hạ dần tới −6,05 m. Mặt đất thật = `max(groundH, plats)`.
- **Bố trí và nội thất:** mặt đất phối cát + cỏ qua "mặt nạ cỏ" 1024² (1 px ≈ 0,31 m): cỏ mọc quanh 8 khu zone (bán kính 10), 9 vệt ngẫu nhiên ở r 12–28, quanh tháp Brand QA (r 16) và 14 vệt ở r 49–62. Sóng bọt trắng sát bờ (`foam`, 240 đoạn), nước biển 4000×4000 m ở y=−0,35 (Thấp/Vừa: nước PBR 2 lớp normal; Cao: `Water` phản chiếu thật). Cỏ 3D đung đưa: 9000 / 22000 / 45000 ngọn (Thấp/Vừa/Cao) trong ô 150×150 m quanh tâm, tránh đường và vật cản. 72 cây dừa ngẫu nhiên: 46 cây ven bờ (r = edgeR −13…−4,5), 10 cây ở r 12–27, 16 cây ở r 49–61 (đều tránh khu zone, quảng trường, sân khấu, đường, phân khu). 16 tảng đá (thủ tục, ~320 tam giác) ở bờ, 4 vỏ sò to (model `lambis_shell`).
- **Chức năng:** nền cho toàn bộ không gian "miễn phí" (học, tool, quiz, concert, ngắm biển).
- **Nhân vật:** xem 2.16 (NPC trên sàn nhảy), 2.18 (Tuấn Dev đi tuần) và mục 8 (bot cư dân).
- **Tương tác:** đi lại, không có E riêng ở địa hình. Phao/cột mốc nổi ngoài khơi: 5 phao tại (96,30), (−74,−70), (44,−98), (−102,22), (70,82) và 1 cột mốc xanh tại (14,−112), tất cả trôi nhấp nhô (world.html:985–993).
- **Kết nối:** cầu nối sang Downtown ở đầu đông (x từ ~52, đóng gate "Rời đảo" `CITY.gateX=52`), cầu gỗ tới đảo nhỏ ISLET ở Tây Nam, cầu cảng phía Bắc (do `city.js` dựng, chưa rõ trong phạm vi).

### 2.2 Đường vành đai (world.html:235, 462; life.js:275)

- **Vị trí và kích thước:** vòng tròn tâm (0,0), bán kính giữa `ROAD.r=43`, rộng `ROAD.w=7` (r 39,5–46,5). Mặt đường/vạch do `city.js` và `traffic.js` dựng (chưa rõ trong phạm vi).
- **Bố trí:** 8 thùng rác đặt ở bán kính 48,5 m tại các góc a=i/8·2π+0,2: (47,5;9,6), (26,8;40,4), (−9,6;47,5), (−40,4;26,8), (−47,5;−9,6), (−26,8;−40,4), (9,6;−47,5), (40,4;−26,8).
- **Chức năng:** đường xe chạy vòng đảo, tuyến tuần tra của bảo vệ và chạy bộ, `onRoad()` làm xe nhanh hơn (ngoài đường hệ số 0,55).
- **Nhân vật:** Bảo vệ Hùng (đi tuần ở bán kính 48,7, 24 điểm), Minh chạy bộ (bán kính 47,4, 36 điểm, chạy 3,4 m/s).
- **Kết nối:** các phân khu 2.3; trục cầu về Downtown theo z=0.

### 2.3 Phân khu quy hoạch (CITY.sectors – world.html:239–246)

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

### 2.4 Quảng trường trung tâm + Cổng Trang chủ Dashboard (world.html:785–805)

- **Vị trí và kích thước:** tâm (0,0), mặt gỗ tròn bán kính 7,5 m, cao 0,16 m (đĩa 7,4–7,6; viền gỗ tối). Bệ đá giữa bán kính 2,4–2,6, cao thêm 0,3, mặt đứng 0,45 m (`plats` r=2,45 h=0,45).
- **Bố trí và nội thất:** cổng vòng tròn kim loại (torus R=2,1, ống 0,17) tâm y=2,75 trên bệ; vành xanh phát sáng (torus 0,05) và đĩa năng lượng xoáy xanh–tím (shader, bán kính 1,95) ở y=2,75; 2 trụ kim loại ở x=±1,85 cao 1,2; 6 đèn đường quanh bán kính 6,6 (a=i/6·2π+0,26): (6,4;1,7), (1,7;6,4), (−4,7;4,7), (−6,4;−1,7), (−1,7;−6,4), (4,7;−4,7), mỗi đèn kèm 1 điểm sáng ban đêm (cường độ 8, tầm 16 m). Nhãn "🏠 Trang chủ Dashboard — Đi qua cổng · bấm E" ở y=5,6.
- **Chức năng:** điểm xuất phát chung; cửa mở "Trang chủ Master Dashboard".
- **Nhân vật:** người chơi xuất hiện tại (0; 0,16; 9) nhìn về Bắc (−z). Mèo Miu (xem 10.1) quanh ghế đá `city.benches[0]` (vị trí chưa rõ).
- **Tương tác:** `E` tại (0,0) bán kính 2,2: "🏠 Mở Trang chủ Dashboard" → `openTool` → `HOOK.openScreen` (screens.js:312–318) → không phải màn hình đảo nên gọi `gadgets.laptop.openMD('/')`: **chỉ mở trong app Laptop (phím L), có kiểm tra thư mục MD**; nếu chưa có laptop thì toast "Master Dashboard chỉ mở trong Laptop (phím L)". Bản đồ: "Quảng trường trung tâm" bay tới (0,5).
- **Kết nối:** lối gỗ rộng 2,2 m từ (0;−7,3) lên sân khấu (2.15); 8 lối gỗ rộng 1,7 m ra 8 quảng trường zone (2.5–2.12).

### 2.5–2.12 Tám quảng trường công cụ (ZONES – world.html:219–228, 738–781)

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

### 2.13 Màn hình ốc đảo – 8 màn hình zone + 1 flycam (js/screens.js)

- **Vị trí và kích thước:** mỗi màn hình là 1 giá đứng, màn rộng 3,2 m × cao 2,0 m, mép dưới màn ở y=1,0 (khung 3,4×2,2×0,12), chân đế 0,5 m. Đặt trong hệ toạ độ của zone tại (lx=−4,3; lz=5,4), xoay thêm +0,4 rad so với hướng zone. Vị trí thế giới (x,z) và hướng (rad): Kiến thức QA (−22,29; 1,04; 1,82), Chứng khoán (−17,41; −12,12; 1,16), API (11,16; −18,04; −0,36), Automation (21,03; −7,46; −1,02), Database (19,96; 8,41; −1,77), QC thực chiến (−15,12; 15,51; 2,57), Tin báo (−4,98; 23,62; 3,15), Công nghệ (12,94; 20,38; −2,35); **flycam** ở (4,9; 3,4) quay hướng (−0,72 rad) – ngay cạnh quảng trường trung tâm. Vật cản tròn bán kính 0,55. Vòng sáng trên đất ở 2,1 m phía trước mỗi màn.
- **Chức năng:** thay cho "nhà công cụ" cũ; không còn hiển thị Master Dashboard trong màn hình (MD chỉ mở trong laptop). 9 màn gồm 3 loại (screens.js:35–47):
  - **Web (3):** 📰 Tin báo hôm nay (Google Tin tức, ngày), 📈 Chứng khoán (tìm "VN-Index"), 💻 Công nghệ mới (tin công nghệ/AI trong tuần) – bấm E → trang Google nhúng iframe qua CSS3D ngay trên mặt màn; mất mạng hiện "No internet". Nút "Trang đầu", "Mở tab riêng".
  - **Học (5):** 📘 Kiến thức QA (chủ đề istqb, design; khoá test-design, bdd, ai-for-qa), 🗄️ Database (db; sql), 🔌 API (api; api, json-regex), ✅ QC thực chiến (scenario, agile, security, mobile; mobile-manual, security-basics), 🤖 Automation & Hiệu năng (automation, performance; 9 khoá: computer-basics, programming-basics, git, playwright, selenium, appium, k6, jmeter, cicd). Câu hỏi (đã đánh sẵn đáp án + giải thích) xen bài giảng, **tự lướt mỗi 30 s**, tiến độ lưu `localStorage qcworld-screens`. Dữ liệu `data/questions.json`, `data/courses.json`.
  - **Flycam (1):** camera bay vòng quanh thành phố theo đường cong 8 điểm (cao 60/80 m), render 320×180 chia lát, chỉ khi người chơi đứng ≤34 m và đang nhìn; dừng nếu game dưới ~28 FPS.
- **Nhân vật:** không.
- **Tương tác:** `E` tại điểm cách màn 2,1 m (bán kính 2,3) "🖥️ Xem … trên màn hình": camera tiến sát, khoá điều khiển, thanh nút dưới đáy ("◀ Trước / ⏸ Dừng tự lướt / Sau ▶", "Rời màn hình (Esc)"); lăn chuột / bấm vào màn để lướt thẻ; flycam có nút "🚁 Bay theo flycam". Không có thưởng tiền.
- **Kết nối:** `HOOK.openScreen` là điểm vào chung cho "mở công cụ Dashboard": cổng trang chủ, QA Brain tab "Tự test" cũng dùng `openTool` → laptop.

### 2.14 Lối gỗ (boardwalk) trên đảo (world.html:619–625)

- **Vị trí và kích thước:** mỗi lối rộng 1,7 m (lối lên sân khấu 2,2 m), dày 0,14 m; viền gỗ tối 2 bên; sàn đi được `addPlat`.
- **Bố trí:** 8 lối từ quảng trường zone về hướng tâm (bắt đầu ở bán kính 7,3 m quanh quảng trường trung tâm); 1 lối từ (0;−7,3) tới (0;−18,8) rộng 2,2 lên sân khấu; resort có thêm lối gỗ trước dãy nhà (2.34).
- **Chức năng:** đường đi chính trên cát; âm bước chân gỗ.
- **Kết nối:** nối quảng trường trung tâm với 8 zone và với sân khấu.

### 2.15 Sân khấu QC Live (world.html:807–883)

- **Vị trí và kích thước:** sàn sân khấu hộp 20×9 m (x −10…10, z −37…−28), cao 1,2 m (mặt sàn đi được cao 1,2 m nhờ `addPlat(0;−32,4; nửa rộng 10; nửa sâu 4,4; h 1,2)` trong life.js:662: x −10…10, z −36,8…−28). Vạch vàng phát sáng ở mép trước (z=−28, y=1,22). Tường nền sau 20×11×0,6 m (z≈−37,3). Hộp va chạm lớn x −12,6…12,6, z −37,8…−28 (VIP vô hiệu hoá hộp này, xem tương tác); life.js:661 thêm 3 hộp chặn cố định: tường sau (x −10,2…10,2, z −38…−36,6) và hai loa sub (x ±10,1…12,6, z −31…−29).
- **Bố trí và nội thất:** màn hình LED lớn 15×8,44 m ở (0; 6,6; −36,86) (khung đen 15,6×9×0,15), vẽ bằng canvas 1024×576 (512×288 ở mức Thấp): hình thu nhỏ video YouTube + 48 cột equalizer nhảy theo nhạc, hoặc chữ "QC WORLD · LIVE STAGE" khi chưa phát; 2 trụ giàn kim loại (mỗi bên 4 trụ ở x=±9,7, z≈−28,4, cao 12 m, chéo giằng) + dầm ngang giàn y=11,75 dài 19,9 m; **5 đèn moving head** ở y=11,35, x=−8,−4,0,4,8, z=−28,4, mỗi đèn 1 chùm sáng hình nón (đổi màu, lắc theo thời gian, sáng mạnh khi có nhạc); **2 đèn spot** ở x=±6, y=11; **loa line-array** 2 bên (5 hộp/bên ở x=±11,2, y 10,6→8,5, z=−28,6) + 2 loa sub (2×1,6×1,6 tại x=±11,4, z=−30) co giãn theo nhịp nhạc. **2 bậc lên** giữa mép trước: bậc 1 (z=−27,75, rộng 4,4, cao 0,85) và bậc 2 (z=−27,25, cao 0,5) – hông bậc có hộp chặn.
- **Chức năng:** sân khấu biểu diễn + chiếu màn hình lớn theo nhạc YouTube người chơi chọn; hiệu ứng đèn cũng sáng nhẹ ban đêm (`.25+night·.35`).
- **Nhân vật:** 3 NPC nhảy quanh sàn (xem 2.16 Sàn nhảy) và Vy, Đạt (fan cứng, mục 8).
- **Tương tác:** không bấm E trực tiếp để lên sân khấu; phải có **Vé concert VIP** (150 💰/24 h): khi `buffOn('vip')` hộp va chạm sân khấu bị vô hiệu (x0=x1=1e9) để leo lên bậc, và có điểm `E` tại (12,6; −23,2) bán kính 1,2 "🎆 Bắn pháo hoa (VIP)", hồi 15 s.
- **Kết nối:** lối gỗ rộng 2,2 từ quảng trường (z −7,3 → −18,8) tới sàn nhảy.

### 2.16 Sàn nhảy LED (trước sân khấu – world.html:847–871)

- **Vị trí và kích thước:** lưới 4 hàng × 7 cột ô LED 1,94 m, tâm ô tại x=−6…6 (cách 2 m), z=−26…−20; phủ x −6,97…6,97, z −26,97…−19,03; sàn đi được x −7…7, z −27…−19 cao 0,1. Vùng nhận "nhảy múa" `onDanceFloor`: x −7,1…7,1, z −27,1…−18,9.
- **Bố trí và nội thất:** 28 ô gộp thành 1 mesh, 5 màu xen kẽ (tím 0x8e5bd1, xanh ngọc 0x2bb3a6, xanh lá 0x47b25b, vàng 0xf2c230, đỏ 0xe5484d), mỗi ô nháy theo nhạc trong shader; ban đêm sáng nhẹ.
- **Chức năng:** đứng yên trên sàn khi có nhạc → nhân vật tự nhảy; nhảy ≥15 s → easter egg "Vũ công QC".
- **Nhân vật:** Linh Tester (Michelle) đứng/nhảy samba tại (−3,8; −24,2), Bug Hunter (Soldier, pose nhảy thủ tục) tại (2,6; −22,6), QC Bot (Robot) tại (9,6; −27). Đều là NPC cố định (vật cản bán kính 0,35–0,4), chỉ nhảy khi có nhạc; QC Bot vẫy tay nếu người chơi trong 3,2 m. Vy tại (−5,5; −21), Đạt tại (5,5; −20,5) và điểm thứ 3 (−1; −25,6) là chỗ nhảy cho "fan" (bot).
- **Tương tác:** phím `F` bật/tắt nhảy múa; di chuyển thì tắt.
- **Kết nối:** lối gỗ từ quảng trường.

### 2.17 Bàn DJ (world.html:873–882)

- **Vị trí và kích thước:** tâm (11,5; −25,5), xoay −0,5 rad; bàn đen 2,4×1,05×1,1 m, vật cản tròn bán kính 1,3.
- **Bố trí và nội thất:** dải sáng đỏ trên mặt bàn, 2 đĩa than quay khi có nhạc, boombox model thật (`boombox.gltf`) giữa bàn. Nhãn "🎧 Bàn DJ — Bấm E để chọn nhạc" ở y=2,7.
- **Chức năng:** nơi chọn nhạc YouTube cho sân khấu (mở khung nhạc bên phải: dán link YouTube, "Phát ngay"/"Hàng chờ", âm lượng, bài tiếp).
- **Nhân vật:** không.
- **Tương tác:** `E` tại (10,5; −23,8), bán kính 1,5 → `openMusic()`; không cần vé. Bản đồ: "Bàn DJ" bay tới (10;−23), nhìn về bàn.
- **Kết nối:** cạnh sân khấu phía Đông.

### 2.18 Tuấn Dev (NPC đi tuần – world.html:1068–1071, 1479–1485)

- **Vị trí và kích thước:** robot cao 1,5 m. Tuyến đi: với từng khu (theo thứ tự wiki, plan, api, auto, db, qc, notes, links) 3 điểm: (tx/d·8,2; tz/d·8,2) → (tx·(1−1,6/d); tz·(1−1,6/d)) → quay lại điểm đầu. Tốc độ 1,35 m/s; dừng 3,5 s ở điểm thứ 3 mỗi cặp (ngẫu nhiên chào "agree" hoặc đứng). Nếu người chơi trong 1,2 m thì đứng yên.
- **Chức năng:** làm đảo đỡ vắng. Không thoại.

### 2.19 Bãi biển Đông Nam: dù + ghế + bàn picnic (world.html:937, 995–1002)

- **Vị trí và kích thước:** `BEACH` tại góc a=0,95, r=edgeR−7,5 ≈ (38,98; 54,51). Vùng dừa không mọc quanh bán kính 7.
- **Bố trí và nội thất:** 2 dù biển: đỏ (0xd23c3c) tại (38,98; 54,51) và xanh (0x2f6fd0) tại (42,48; 57,51); mỗi dù có cột trắng cao 2,6 m, nón sọc đường kính 3,4 m ở y≈2,5, 2 ghế gỗ + lưng ghế (trang trí, **không ngồi được**). Bàn picnic model thật tại (41,98; 50,51) xoay 0,6 rad.
- **Chức năng:** góc ngắm biển; bàn picnic ngồi được (4 chỗ).
- **Nhân vật:** không cố định.
- **Tương tác:** `E`/`C` ngồi bàn picnic (life.js:387–390, 4 chỗ: 2 băng × 2). Còn 2 bàn picnic khác tại (24;−30,5) xoay −0,3 và (8;8,6) xoay 0.
- **Kết nối:** bờ Đông Nam (ngoài vành đai); rộng quanh a=0,95.

### 2.20 Chai thư (easter egg – world.html:935–936, 1083–1090)

- **Vị trí:** `BOTTLE` ở a=2,78, r=edgeR−5,5 ≈ (−66,99; 25,34), trôi nhẹ lên xuống.
- **Bố trí:** chai thuỷ tinh xanh trong suốt có nút gỗ + cuộn giấy.
- **Tương tác:** `E` bán kính 1,4 "🍾 Nhặt chai thư" → egg 1/3, toast một câu đùa QC ngẫu nhiên trong 5 câu (ví dụ "Bug không tự biến mất…"), hiệu ứng hạt.
- **Easter egg còn lại:** gõ "binhphan" (pháo hoa), nhảy 15 s trên sàn LED khi có nhạc. Đủ 3 → chúc mừng + pháo hoa.

### 2.21 Chòi lá nghỉ chân (js/island.js:85–107)

- **Số lượng và vị trí:** 6 chòi, đặt ngẫu nhiên trên bãi (cách bờ 10–16 m, `findSpot`) với hạt giống cố định (90210) nên mỗi lần chạy giống nhau, nhưng toạ độ phụ thuộc vật cản khác → **chưa tính ra**. Quay mặt ra biển. Tránh: cầu (|z|<10, x>38), khu nghỉ dưỡng, bến cảng, quán nước, đường, sàn gỗ.
- **Kích thước:** sàn 4×4 (3,6+0,4), cao 0,32; cột tre 4 góc cao 2,75; mái lá 4 mái (nón vuông bán kính 3,5 cao 1,9) đỉnh y≈4,7.
- **Nội thất:** bàn tròn bán kính 0,55 ở (0;−0,55 cục bộ); 2 băng ghế 1,1 m ở x=±0,95; võng vải màu ngẫu nhiên giữa 2 cột phía biển (z=+S/2).
- **Tương tác:** 2 chỗ ngồi ở băng ghế ("🛖 Ngồi nghỉ trong chòi lá (E · C)") + 1 chỗ nằm võng ("🛖 Nằm võng đung đưa", nằm ngửa). Không thưởng.

### 2.22 Chòi cứu hộ (island.js:110–130)

- **Số lượng:** 2, đặt ngẫu nhiên gần bờ (cách bờ 6,5–11 m) quay ra biển.
- **Kích thước:** sàn 2,3×2,3 ở cao 2,6 m, 4 chân trắng cao 4,2; lan can 3 mặt (đỏ), mái đỏ 2,5×2,5 ở y≈4,25 + cột cờ đỏ; phao tròn + biển vàng; **cầu thang 6 bậc phía sau** (rộng 0,9, mỗi bậc cao 0,43) leo lên được, lan can nhà có vật cản nên không đi xuyên.
- **Tương tác:** leo lên ngắm biển; không E.

### 2.23 Thuyền thúng (island.js:133–139)

- **Số lượng:** 6, đặt gần mép nước (cách bờ 4,2–5,6 m), xoay ngẫu nhiên.
- **Kích thước:** vỏ thúng bán cầu bán kính 1,05, dẹp, tre đan; mái chèo; nghiêng nhẹ.
- **Tương tác:** `E`/`C` "🛶 Ngồi vào thuyền thúng" – chỉ ngồi, không bơi/di chuyển.

### 2.24 Dù + ghế tắm nắng (island.js:142–152)

- **Số lượng:** 9 bộ, ngẫu nhiên trên cát (cách bờ 5,5–9,5 m), hướng ra biển.
- **Kích thước:** dù nón đường kính 3 m ở y≈2,4 (sọc đỏ–trắng, xanh–trắng, cam–trắng), 2 ghế tắm nắng trắng (0,62×1,5) ở x=±0,85, khăn trải cát.
- **Tương tác:** 2 chỗ nằm ghế (`E`/`C`, "⛱️ Nằm ghế tắm nắng").

### 2.25 Ghềnh đá, rặng dừa, cua, hải âu (island.js:155–212)

- **Ghềnh đá:** 4 cụm × 9 tảng (tỷ lệ 0,7–2,5) ở rìa bờ (cách bờ 3–7 m), có vật cản; không ở khu nghỉ dưỡng/bến.
- **Rặng dừa:** 34 rặng × 5–9 cây (mục tiêu tối đa ~240 cây, đầu file ghi "~110 cây" thực đặt; số thật phụ thuộc chỗ trống) cách bờ 4,5–14,5 m, vẽ theo lô (InstancedMesh) và đung đưa theo gió bằng shader; mỗi cây có vật cản; mỗi cây tới gần ≤1,9 m có điểm `E` rung dừa.
- **Cua:** 26 con, bò **ngang** trên cát (cách bờ 3,8–8 m), thấy người cách <3,2 m thì chạy trốn, <1,2 m thì chui xuống cát 8–18 s rồi xuất hiện chỗ khác.
- **Hải âu:** 14 con bay vòng cao 11–27 m, bán kính 40–85 m, vỗ cánh bằng shader.

### 2.26 Mini-game bãi biển: rung dừa, nhặt vỏ sò, đắp lâu đài cát (island.js:253–313)

- **Rung dừa:** `E` (bán kính 1,9) "Rung cây dừa cho rơi trái": 1 trái rơi (hồi 40 s/cây, có trọng lực + nảy), nằm lại 75 s; `E` nhặt "🥥 uống nước dừa": **buff `energy` +6 phút** (chạy nhanh +40%), tăng bộ đếm `coconuts`.
- **Vỏ sò:** 28 vỏ 5 màu rải trên bãi; `E` nhặt; đủ **10 vỏ → +50 💰**, vỏ mới trôi vào sau 120 s.
- **Lâu đài cát:** 2 chỗ (có xô xanh + xẻng vàng), `E` "🏰 Đắp lâu đài cát": mọc trong 5 s, đứng 3 phút rồi sóng xoá; không có thưởng tiền (đếm `castles`).
- **Âm thanh:** xem mục 13.

### 2.27 Sóng vỗ bờ quanh đảo (island.js:37–72)

- 2 vòng shader: quanh đảo chính (900 phân đoạn, từ −6,5 đến +3,5 m quanh mép) và quanh đảo nghỉ dưỡng (360 phân đoạn): mép bọt trắng tràn lên rồi rút, vệt cát ướt, 2 lớp sóng bạc đầu ngoài khơi.

### 2.28 Toà Giáo trình – ngoại thất (campus.js:22–40)

- **Vị trí và kích thước:** `TW={x:−58, z:0, w:16, d:22, floors:7}`: thân toà x −66…−50, z −11…11, cao 7×3,6=25,2 m (thân kính 0x2b5f8a) trên bệ đá 22×28 m (x −69…−47, z −14…14, dày 0,5). Mặt tiền quay +x (vào tâm đảo). Hộp va chạm x −66,3…−49,7, z −11,3…11,3.
- **Bố trí:** mỗi 3,6 m có gờ trắng tầng; 5×2 cột khung ở hai mặt dài; mái 1,2 m; **bảng "📚 TOÀ GIÁO TRÌNH" phát sáng** trên đỉnh hai mặt; sảnh kính + mái che lối vào ở x≈−50…−47 (kính cao 3,2 m, mái 3×6,4 m, 2 cột); vòng vàng nhấp nháy tại cửa.
- **Chức năng:** trường học miễn phí 17 khoá · 6 tầng lớp học.
- **Nhân vật:** xem 2.29–2.31.
- **Tương tác:** `E` tại cửa (−47,7; 0) bán kính 2 "📚 Vào Toà Giáo trình" → vào bên trong (cảnh riêng). Nhãn tên cao tới 160 m. Bản đồ: bay tới (−42,7; 0).
- **Kết nối:** cửa +x nối đảo; bên trong có thang máy 7 tầng.

### 2.29 Toà Giáo trình – Sảnh tầng 0 (thư viện + danh mục) (campus.js:150–167)

- **Cảnh trong nhà:** mỗi tầng/phòng là 1 cảnh riêng (`CS`), sàn 36×24 m (x −18…18, z −12…12, `RW=18, RD=12`), trần cao 3,6 m, sàn y=0,1; tường đặc ở phía z=−12, ba mặt còn lại là dải cửa sổ in "cảnh trời biển" (có đèn trần lát ô). Cửa ra tại (0; 10,6). Người chơi xuất hiện (0; 9,6) nhìn Bắc khi vào sảnh.
- **Bố trí và nội thất:** quầy lễ tân trắng 5×1,1×1 ở (0; 4) với dải xanh phát sáng; bảng "SƠ ĐỒ KHOÁ HỌC" 6×4 m ở (−11; z=−11,85) liệt kê các khoá theo tầng (đánh dấu ✓ nếu có chứng chỉ); **4 giá sách** cao 2,2 m (3,6 m dài) ở x=−17,4, z=−6,−2,2,6 + 2 giá ở z=−11,4, x=9, 13; **4 bàn đọc** 2,4×1,1 ở (−10,0), (−10,5), (8,2), (8,7), mỗi bàn 4 ghế (2 phía); sofa 3,2 m ở (12; 10,3) quay π (3 chỗ "🛋️ Ngồi đọc sách") trên thảm 4×2,6 tại (12;9); 4 chậu cây ở góc: (−17;10,8), (17;10,8), (6;−10,8), (−6;−10,8).
- **Chức năng:** thư viện + danh mục khoá học.
- **Nhân vật:** 1 **Thủ thư** (áo xanh lá dài tay) đứng sau quầy tại (0; 2,9); các **Học viên** ngồi bàn đọc (xác suất 40% mỗi ghế phía +z, gõ máy) và 1 học viên **đi dạo** theo vòng (4;8)→(4;−4)→(−6;−4)→(−6;8) tốc độ 1,2 m/s. Tên hiển thị dạng "tên · vai". Không có lời thoại.
- **Tương tác:** `E` tại (−11; −9,8) bán kính 2,2: "📚 Danh mục khoá học" mở lưới khoá theo tầng → chọn khoá để học; `E` tại (0; −10,3) thang máy (cùng chỗ mọi tầng toà) chọn tầng; `E`/`C` ngồi ghế/sofa; `E` cửa ra.
- **Kết nối:** thang máy (0; −10,3) tới tầng 1–6; cửa (0; 10,6) ra ngoài (vị trí ra: x=−46,1; z=0).

### 2.30 Toà Giáo trình – Tầng 1–6 (tầng lớp học) (campus.js:168–180, 114–145)

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

### 2.31 Học viện QA – phòng thi trắc nghiệm (campus.js:181–192; life.js:240)

- **Vị trí ngoài trời:** do `city.js` dựng tại `CITY.places.academy` ≈ (16,25; 52,54), cửa tại `city.academy.tx,tz` (chưa rõ trong phạm vi). `E` tại cửa bán kính 1,5 "🎓 Vào Học viện QA – phòng thi trắc nghiệm".
- **Bên trong:** 1 tầng, khung 36×24 m, bảng "🎓 HỌC VIỆN QA – Phòng thi trắc nghiệm · 380 câu · 10 chủ đề" 9×3 m ở tường sau; **30 máy thi** (5 hàng z=−5,−2,1,4,7 × 6 cột x=−12,−8,−4,4,8,12), mỗi máy 1 màn hình 0,6×0,38 hiển thị "Câu 12/20", 1 ghế; tối đa 10 thí sinh bot ngồi gõ; 2 chậu cây ở (±17; 10,8). Cửa ra (0; 10,6).
- **Nhân vật:** 1 **Giám thị** (áo xanh đậm, kính) đứng ở (0; −9,8) tư thế khoanh tay; tối đa 10 **Thí sinh**.
- **Tương tác:** ngồi vào máy trống "📝 Ngồi vào máy làm quiz QA/QC" hoặc `E` tại (0; −8,4) bán kính 2 → mở **Quiz** (xem 7.1). Cùng quiz có ở các **Kiosk Quiz** (`city.kiosks`, vị trí chưa rõ).
- **Kết nối:** cửa ra ngoài; vào/ra có hiệu ứng mờ đen 0,28 s.

### 2.32 Tháp Brand QA·QC·QE + "bộ não" phát sáng (campus.js:44–63; brain.js)

- **Vị trí và kích thước:** toà tháp do `city.js` dựng tại `CITY.places.tower` = (0; 61) (chưa rõ trong phạm vi, có đèn nhấp nháy `towerBlink` và logo phát sáng). Phần do campus.js: **bộ não** thủ tục (mặt cầu méo, kích thước ~7,8×6,6×9,9 m theo x×y×z) lơ lửng ở (0; **y=65**; 61), phát sáng tím với dải sáng chạy; vòng hào quang torus xanh dương R=6,2 ở cùng tâm; 180 hạt sáng quay chậm quanh (bán kính 5–8,5 m). Trôi lên xuống ±0,4 m, tự xoay.
- **Chức năng:** biểu tượng + cổng vào "QA Brain" (tài liệu yêu cầu → test case).
- **Nhân vật:** không.
- **Tương tác:** `E` tại `city.spots.brain` (bán kính 1,8; vị trí chưa rõ) "🧠 Vào QA Brain" mở modal (`brain.js`): 4 tab – **📄 Phân tích tài liệu** (dán văn bản/chọn .txt .md .csv .json; đếm câu, nhận diện yêu cầu, giá trị biên, từ ngữ mơ hồ cần hỏi BA, vùng rủi ro cao: thanh toán, OTP, khuyến mãi, tồn kho, bảo mật, phân quyền, đơn hàng, giá, đồng bộ, PROD), **🧪 Test case** (sinh tự động EP/BVA/Negative/Error guessing/Risk-based, xuất CSV), **▶️ Tự test** (4 nút mở API Client, Automation, Database, Plan qua laptop), **🗺️ Lộ trình** (2 mục xong, 3 mục "⏳"). **Lần đầu dùng: +100 💰.** Chạy offline bằng heuristic regex, lưu `localStorage qcworld-brain`. Bản đồ: "🧠 Tháp Brand QA·QC·QE".
- **Kết nối:** tháp nằm ở phân khu Brand QA, phía Nam đảo (r≈61).

### 2.33 Học viện QA (toà) / Chợ QC / Nhà thuyền / Văn phòng địa chính / Showroom (điểm đặt và tương tác trong life.js)

Toà nhà dựng bởi `city.js` (ngoài phạm vi); mã trong phạm vi chỉ cho biết:
- **Học viện QA:** xem 2.31.
- **Nhà thuyền:** `E` tại `city.boathouse.tx,tz` (bán kính 1,5) mở cửa hàng ['fun','goods'] "⚓ Nhà thuyền"; điểm đặt `atPolar(−π/2−0,13; 62)` ≈ (−8,0; −61,5).
- **Bến cảng (cầu tàu):** `PLACES` "⚓ Bến cảng – câu cá, thuê thuyền" bay tới (1; −66) nhìn (0; −100). Câu cá tại `city.spots.fish` (xem 7.4). Lên thuyền ở `city.spots.dock` (xem mục 6).
- Chợ QC, showroom, địa chính **không còn ở đảo** mà ở Phường Khởi Nghiệp (xem 2.37).

### 2.34 Khu nghỉ dưỡng bờ Tây Nam (js/resort.js, world.html:453–457)

- **Vị trí và kích thước:** bờ đảo phình ra quanh góc `RESORT_A=2,3` rad (Tây Nam, ~(−59; 66) ở r=88). 4 nhà nằm ở r 58–60 (trong đất liền, mặt tiền hướng ra biển).
- **Bố trí:** (1) **Nhà nghỉ Hoa Sứ** (cho thuê 80 💰/ngày) tâm ~(−20,9; 54,1), 10×8 m, cao 2,8 m, mái ngói đỏ hai mái; (2) **Dãy Biệt thự Biển Xanh ×3** (mua 6.000 💰/căn), mỗi căn 13×10 m cao 3,2 m, mái bằng, tâm ~(−34,3; 49,2), (−47,0; 37,3), (−55,7; 22,3); (3) lối gỗ rộng 2 m nối 5 điểm bán kính 51,5 m (a=1,88→2,85) + nhánh ra bờ rộng 2,2 m, đèn đường ở mỗi điểm; (4) cầu gỗ 3 m và (5) đảo nhỏ: xem 2.35.
- **Chức năng:** nơi ở/ngủ/nấu ăn cho người chơi có tiền; có thể đặt làm "nơi xuất hiện".
- **Kết nối:** lối gỗ men dãy nhà; cầu gỗ ra đảo siêu biệt thự.

### 2.34a Cấu trúc từng loại nhà ở khu nghỉ dưỡng (resort.js:116–161)

Chung: nền đá, sàn, tường dày 0,18 với cửa chính 1,3 m ở giữa mặt tiền (z=+d/2, x −0,65…0,65) – cửa **tự mở khi chủ nhà tới gần (<2,6 m)** hoặc đang trong nhà, khoá cứng với người chưa thuê/mua (vật cản). Khi bạn ở trong nhà, **mái + nửa trên tường ẩn** để nhìn vào. Nhãn trên nhà hiện giá/loại.

- **Nhà nghỉ Hoa Sứ (RENT):** vách ngăn z=−0,4 có 2 cửa (x −3,3…−2,2 vào phòng ngủ; x 2,2…3,2 vào phòng tắm); phòng khách: thảm nâu, sofa xanh xám 2,2 m (3 chỗ), bàn trà, TV "QC TV" (tivi 1,7×0,98 phát hình "Release 2.4 thành công 🎉"), cây, tranh; bếp 2,6 m + tủ lạnh thép; bàn ăn nhỏ + 2 ghế; phòng ngủ: giường 1,6 m, tủ quần áo, tranh; phòng tắm: bồn tắm, bồn cầu, bồn rửa; 2 chậu hoa trước cửa. Cửa sổ 4 mặt.
- **Biệt thự Biển Xanh (VILLA):** mặt tiền kính; phòng khách thảm 4,4×3, sofa trắng 3 m + sofa góc 1,8 m, bàn trà, TV, 2 cây, tranh; bếp 3,6 m + đảo bếp gỗ óc chó 2,2×0,9 + 3 ghế quầy; bàn ăn 2×1 + 4 ghế; phòng ngủ giường 2 m, tủ; phòng tắm; **sân trước sàn gỗ 14,2×4,6 với hồ bơi 6×2,6, 3 ghế tắm nắng (nằm được), dù trắng**.
- **Siêu biệt thự (SUPER):** 11,5×11 m cao 3,6 m; kính hai bên; phòng khách thảm 4,6×3,4, sofa xanh navy 3,2 m + sofa 2 m, bàn trà mạ vàng, TV, đèn chùm phát sáng; bếp 3,4 m + đảo bếp đen 2,4×1 + 3 ghế; bàn ăn 2,2×1; phòng ngủ giường 2,2 m, tủ; phòng tắm + bồn sục tròn; **sàn gỗ hướng biển trên cọc 14,5×6,4 + hồ bơi vô cực 10,5×2,4, 4 ghế tắm nắng, vách kính chắn gió**.

**Tương tác (3 hạng):** `E` ngoài cửa (r 1,7, vị trí cách cửa 1,1 m): chưa sở hữu → "Mua/Thuê … · giá 💰" (qua `askPay` xác nhận), sở hữu → "nhà của bạn (cửa tự mở)"; `E` ở **giường** (bán kính 1,6) → menu "😴 Ngủ một giấc" (chuyển sang buổi sáng `setTime(0)`) và "📍 Đặt làm nơi xuất hiện" (thuê chỉ trong ngày); `E` ở **bếp**: 🍳 Nấu bữa ăn → **buff chạy nhanh +10 phút** (R, V) hoặc 👨‍🍳 +15 phút (S); ngồi sofa/ghế (`E`/`C`), nằm ghế tắm nắng.

### 2.35 Cầu gỗ sang đảo nhỏ + Đảo siêu biệt thự ISLET (resort.js:166–182; world.html:456–458)

- **Cầu gỗ:** rộng 3 m, mặt y≈0,38 (đi được cao 0,47), từ r=82,8 đến r=103 theo hướng a=2,3: từ ~(−55,1; 61,7) tới ~(−68,6; 76,8), dài 20,2 m, lan can + cột đèn mỗi 2,4 m. Nhãn "🌉 Cầu sang Đảo Siêu biệt thự".
- **Đảo nhỏ ISLET:** tâm (−81,29; 90,98) (r=122 theo a=2,3), bán kính 24 m (±2 theo `isletR`), có sóng vỗ riêng.
- **Bố trí:** 3 **Siêu biệt thự** mua 30.000 💰/căn: "Siêu biệt thự Hoàng Hôn" ~(−68,2; 97,3), "Đại Dương" ~(−90,9; 101,8), "Bình Minh" ~(−89,0; 78,7), cách tâm đảo nhỏ 14,5 m, mặt tiền hướng ra biển (xoay 1,12 / −0,73 / −2,58 rad); chi tiết nhà xem 2.34a. 14 cây dừa viền; quảng trường đá tròn bán kính 3,4–3,6 ở tâm đảo + đài phun nước bán kính 1,6–1,8 + 10 quả cầu hoa bán kính 2,8.
- **Kết nối:** cầu gỗ về đất chính. Bản đồ: "🏝️ Đảo Siêu biệt thự" (đến nhà thứ 3 của đảo), "🏡 Dãy Biệt thự Biển Xanh", "🏠 Nhà nghỉ Hoa Sứ".

### 2.36 Quán nước Ngắm Biển + võng (resort.js:184–222)

- **Vị trí và kích thước:** a=0,42 (Đông Nam), r=62: tâm ~(56,6; 25,3), sàn tròn bán kính 6,5 m cao 0,16 (đi được).
- **Bố trí và nội thất:** 8 cột gỗ cao 3 m ở bán kính 3,2; mái nón lá bán kính 4,6 cao 2,2 (đỉnh y≈5,2); quầy bar cung tròn (1,4π) bán kính 1,7 cao 1,05 + mặt gỗ + đèn LED 6 màu; **5 ghế quầy bar** quanh mặt hướng biển (bán kính 2,45); **4 bàn ngoài trời** (bàn tròn 0,5 + dù 4 màu đỏ/vàng/xanh lá/xanh dương) ở bán kính 5, mỗi bàn **2 ghế** (tổng 8 chỗ); nhãn "🍹 Quán nước Ngắm Biển — Nước dừa · cà phê · sinh tố".
- **Nhân vật:** 1 **Pha chế** (nữ, áo trắng) đứng ở tâm quầy hướng biển; khách bot (xem mục 9 cafe.js): tối đa 3 nhóm, sinh ra cách quầy 14 m về phía đất liền.
- **Tương tác:** `E` tại quầy (bán kính 2,4) "🍹 Gọi nước ở quầy": 🥥 Nước dừa tươi **15 💰 / chạy nhanh 5 phút**, ☕ Cà phê sữa đá **20 💰 / 8 phút**, 🍓 Sinh tố dâu **25 💰 / 10 phút**; `E`/`C` ngồi quầy/bàn.
- **Võng:** 4 võng giữa 2 cây dừa (a=0,66; 0,735; 0,81; 0,885, r=66/68,5/66/68,5): ~(52,1; 40,5), (50,8; 45,9), (45,5; 47,8), (43,4; 53,0), màu đỏ/xanh/vàng/lục; `E`/`C` nằm võng.
- **Kết nối:** bờ Đông Nam; bản đồ "🍹 Quán nước Ngắm Biển" đứng cách quầy 9 m.

### 2.37 Quy hoạch đất liền mở rộng: Downtown, Phường Khởi Nghiệp, Khu Giải trí (world.html:256–277)

Chỉ là **dữ liệu chữ nhật** trong world.html (toà nhà do `downtown.js`, `ward.js`, `arena.js`… dựng, chưa rõ trong phạm vi):

| Vùng | x0–x1 | z0–z1 | Rộng×sâu | Ghi chú |
|---|---|---|---|---|
| Downtown (đảo thương mại) | 136–262 | −62…62 | 126×124 | nối đảo MD bằng cầu theo z=0, `bridgeW=28` (đường 20 m + 2 lối bộ hành) |
| Phường Khởi Nghiệp | 136–262 | 56…480 | 126×424 | `slabZ0=62`, đường nhánh `street=86`, `links=[146,252]`, phố chính `main=200`; "Đại công viên Hồ Ngọc" ở x 156–242, z 10–190 (theo chú thích) |
| Khu Giải trí | 274–394 | −60…60 | 120×120 | cầu ngắn `bridgeW=10` (x 262→274) |

**Mạng đường phố** (`CITY.roads`, rộng 20 m, vỉa hè 5 m, làn ô tô 3,3 m ×2 chiều + làn xe máy 2,6 m): Đại lộ Hồ Ngọc (z=0, x 136→262); Trục Bắc (x=178, z −62→0, cầu Cao nguyên); Đại lộ ven Tây (x=146, z 0→200); Đại lộ ven Đông (x=252, z 0→200); Nhánh cầu Đồi Brand QC (z=86, x 252→262); Phố chính Phường (z=200, x 136→262); Đường Trường Học (x=199, z 200→470); Đường Bệnh Viện (z=290); Đường Cao Ốc Nam (z=380); Đường Ven Biển Nam (z=470) (ba đường cuối x 136→262).
**Điểm bán/nơi mở "chợ"** (`CITY.places`): Chợ QC `shop` (146; 217,5), Showroom `showroom` (163; 217,5), Văn phòng địa chính `landOffice` (180; 217,5), cả ba xoay π (mặt về −z, ra Phố chính z=200).
**Cổng "Rời đảo":** `CITY.gateX=52` (đầu cầu phía đảo).

### 2.38 Đất ở + đất kinh doanh của người chơi (CITY.lots – world.html:249–252; life.js:499–623)

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

### 2.39 Phòng trọ khởi nghiệp (life.js:398–409)

- Vị trí do `ward.spots.tro` (ward.js, chưa rõ trong phạm vi); có 4 phòng: **Phòng 1 miễn phí của người chơi**, Phòng 2–4 "đã có người thuê".
- Tương tác: `E` vào Phòng 1 → menu: 😴 Ngủ (chuyển sang buổi sáng), 📍 Đặt làm nơi xuất hiện, 🧑‍💼 Đi kiếm việc. Người mới được toast giới thiệu phòng trọ miễn phí.

---

## 3. KINH TẾ TIỀN (life.js:46–111, 114–148)

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

## 4. CỬA HÀNG, VẬT PHẨM, TÚI ĐỒ (life.js:114–170, 674–685)

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

## 5. NHÀ, ĐẤT, VƯỜN, PHÒNG TRỌ (tóm tắt – chi tiết ở 2.34, 2.38, 2.39)

- **Nơi xuất hiện (`S.home`):** phòng trọ `tro` / lô đất `R1…B4` / nhà nghỉ dưỡng `res:<id>`; mở game thì dịch chuyển tới đó (life.js:776–779). Không đặt thì xuất hiện ở quảng trường (0; 9).
- **Ngủ:** ở giường nhà/phòng trọ → `setTime(0)` (chuyển về buổi **Ngày**).
- **Nhà nghỉ dưỡng thuê theo ngày** (`rent[id] = ngày hôm nay`), mua vĩnh viễn (`own[id]`).

## 6. PHƯƠNG TIỆN (js/vehicles.js, life.js:647–658)

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

## 7. HOẠT ĐỘNG KIẾM TIỀN VÀ SINH HOẠT TRÊN ĐẢO

### 7.1 Quiz QA (life.js:172–217)
- Mở ở Học viện (2.31) hoặc Kiosk Quiz. Chọn chủ đề (hoặc 🎲 Trộn) → câu ngẫu nhiên (85% câu chưa thuộc) → chọn A–D → đáp án + giải thích. Sai không mất tiền, chuỗi về 0. Thưởng như bảng mục 3; chuỗi chẵn bội 5 bắn pháo hoa. Dữ liệu `data/questions.json` (380 câu / 10 chủ đề theo mô tả; có 3 câu dự phòng nếu không tải được).

### 7.2 Rác và thùng rác (life.js:250–287)
- Ban đầu 9 mảnh rác (4 dạng), sinh thêm 1 mảnh/14 s nếu <16; vị trí `city.trashArea` (chưa rõ trong phạm vi). `E` "🗑️ Nhặt rác" → cầm vào tay; `E` ở thùng "♻️ Bỏ rác vào thùng (+6 💰)" hoặc `G` ném (bay cong 6 m/s; trúng thùng +12 💰, trượt thì rác rơi lại).
- **14 thùng rác:** 4 quanh quảng trường ở r=8,6 (a=0,55; 2,1; 3,7; 5,3): (7,3; 4,5), (−4,3; 7,4), (−7,3; −4,6), (4,8; −7,2); 8 thùng ở bán kính 48,5 (xem 2.2); 1 thùng ở (2,2; −63) (bến cảng); 1 thùng cạnh QA Brain (`city.spots.brain` + (4,1)).
- Bot **Bác Ba / Cô Út** tự dọn rác (xem mục 8).

### 7.3 Học ở Toà Giáo trình: xem 2.28–2.30.

### 7.4 Câu cá (life.js:625–645)
- Điểm câu `city.spots.fish` (cuối cầu tàu phía Bắc; vị trí chưa rõ), bán kính 1,8. Cần 🎣 + 🪱. `E` thả câu (tốn 1 mồi) → chờ 2,5–7,5 s → **"❗ CÁ CẮN CÂU!"** (1,5 s để bấm E) → bắt được. Rời quá 3 m thì thu dây.
- Bảng cá (xác suất ‰ / thưởng): Cá cơm 30 / 12 💰, Cá nục 24 / 22, Mực ống 12 / 35, Cá thu 15 / 48, Cá mú 9 / 85, Cá ngừ đại dương 4 / 170, Chiếc giày cũ 👟 3 / 0, Rùa biển (thả lại) 3 / 0.

### 7.5 Trồng rau (life.js:533–558)
- 3 luống (nhà cấp 4), 6 (biệt thự), 4 (trang trại) trên lô đất người chơi. `E` luống trống → chọn hạt (còn bao nhiêu), gieo; nhãn đếm % và thời gian còn lại; chín thì `E` thu hoạch (+tiền), cây lớn dần theo thời gian thật (kể cả offline).

### 7.6 Bồn hoa tưới (life.js:289–296)
- Các `city.beds` (số lượng/vị trí do city.js). Có Bình tưới: `E` tưới (+5 💰); bồn khô <0,55 thì bot **Cô Lan / Chú Sáu** tới tưới; bồn héo nếu lâu không tưới.

## 8. BOT DÂN CƯ + NHÂN VẬT (js/bots.js, js/people.js)

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

## 9. QUÁN XÁ SỐNG ĐỘNG (js/cafe.js)

- Quán khai báo vào `W.CAFES` (resort.js trong phạm vi: Quán nước Ngắm Biển; `arena.js` có thêm quán – chưa rõ trong phạm vi). Chỉ chạy khi bạn ≤75 m (`near`), đi xa +20 m thì khách biến mất.
- **Vào quán:** có 1–2 nhóm khách ngồi sẵn khi bạn tới; sinh khách mới mỗi 16–32 s, tối đa `max` (3) nhóm; xác suất đi cặp 60%, đi một mình 40%; ở 80–150 s rồi rời.
- **Quy trình khách:** xuất hiện ở `spawn` → đi tới điểm gọi món `order()` ("Cho 2 ly <đồ uống> nha!") → chờ 3,2 s ("Cảm ơn nha! 😊") → đi vòng tới bàn → ngồi (tư thế ngồi/ăn), ly nước đặt lên bàn → nói chuyện. Dùng bàn có ≥2 ghế trống.
- **Hội thoại cặp:** 8 đoạn chung (bug sprint, concert khu Giải trí, thi ISTQB, hotfix, Phố cổ Riverside, bóng đá QC FC vs Bug United, đồ uống, Playwright) + đoạn riêng quán (2 đoạn ở Ngắm Biển: "Biển hôm nay xanh ghê ha!"…). Khách **đi một mình** nói câu đơn ("Chill thật sự…") hoặc, khi bạn **ngồi chung bàn**, chào "Chào <tên>! Ngồi chung bàn nha 😄" rồi hỏi 4 câu ngẫu nhiên trong 8 câu (công việc, bug, chỗ ở, khu Giải trí, uống gì, SQL, mẹo test case, cuối tuần đi đâu) – nhân vật bạn đáp tự động ("Mình làm … ở … đó", "Mình ở phòng trọ khởi nghiệp, đang để dành mua nhà!"…); bạn đứng dậy thì "Hẹn gặp lại nha <tên>! 👋".

## 10. THÚ CƯNG, GHẾ NGỒI, CHAT, CỬ CHỈ

### 10.1 Thú cưng (life.js:438–497)
- Thú mua: Shiba (model Fox), Mèo (thủ tục), Vẹt (model Parrot). Đi theo sau lưng cách 1,2 m, bên trái/phải xen kẽ; chạy khi bạn chạy/lái xe; xa >30 m thì dịch chuyển tới; `E` vuốt ve (tim hồng + "Gâu gâu! ❤️" / "Meo~ ❤️" / "Test đi! Test đi! 🦜"). Đấm bé → "😾". Lưu trong `S.pets` (tên mặc định Shiba / Mướp / Vẹt Xanh).
- **Thú hàng xóm:** 🐕 Lu (chó Fox đi dạo vòng bán kính 50 m quanh đảo, tốc độ 0,045 rad/s); 🐈 Miu (mèo ngồi cạnh `city.benches[0]`). **Chim trời:** 3 cò bay vòng r≈60–76, cao 30; 2 hồng hạc r≈95–103, cao 9.

### 10.2 Ghế ngồi (life.js:345–391)
- Mọi "chỗ ngồi" `addSeat({x,z,rot,y,floor,scope,lie…})`; các chỗ kề nhau tự gộp thành **băng ghế** (≤1,5 m, cùng hướng/độ cao) với 1 nút E chung "còn x/y chỗ", ~0,6 m/người. `E` hoặc `C` để ngồi, `E/C/phím di chuyển` để dậy. Có kiểu ngồi, nằm ngửa (võng, ghế tắm nắng). Ghế đá `city.benches` (1,5 m = 3 chỗ), bàn picnic (4 chỗ, lại gần từ ngoài), ghế trong toà.

### 10.3 Chat (T / Enter, ≤120 ký tự) – bong bóng trên đầu + nhật ký 7 dòng; gửi cho người chơi khác nếu đang online.

### 10.4 Cử chỉ: `1` vẫy tay, `2` nhảy múa (bật/tắt), `3` đấm, `4` cổ vũ/like, `5` gật đầu, `6` lắc đầu (clip gốc nếu có, nếu không dùng tư thế thủ tục bằng IK xương). `F` cũng bật nhảy múa. Khi online các cử chỉ 1–6 đồng bộ cho mọi người.

## 11. THIẾT BỊ CÁ NHÂN: LAPTOP · MÁY NGHE NHẠC · ĐIỆN THOẠI · NẠP TIỀN (js/gadgets.js, js/topup.js)

Có dock 3 nút ở góc phải dưới (💻 L, 🎧 Y, 📱 O) và nhân vật cầm đồ bằng tư thế IK (laptop đặt trước ngực, máy/điện thoại cầm ngang ngực). Khi đang lái xe thì chỉ còn giao diện.

### 11.1 💻 Laptop – phím L (cất: L / Esc / ⏏)
- Camera chuyển góc nhìn thứ nhất, màn hình laptop gần bằng màn hình game (HTML đè lên), giả lập hệ điều hành "QC OS" với desktop 6 biểu tượng:
  - 🖥️ **Master Dashboard** – **chỉ mở khi máy có thư mục Master Dashboard** (kiểm tra `GET /api/md/available`; nếu không → "Máy này không có Master Dashboard – không truy cập được"; có thư mục nhưng chưa chạy → hướng dẫn `MasterDashboard.vbs`); thanh nút: Trang chủ + 8 khu zone, "↗ Mở tab riêng" tới `http://127.0.0.1:8765`.
  - 🌐 **Trình duyệt kiểu Chrome**: tối đa 6 tab, Google nhúng (`igu=1`), YouTube chuyển sang bản embed, danh sách ~33 trang chặn nhúng (github, facebook, mail.google, youtube.com (trừ link watch được đổi sang bản embed), chatgpt, claude.ai, shopee, v.v.) → nút "↗ Mở bằng trình duyệt thật"; 8 ô gợi ý (Google, Wikipedia, Bản đồ, Tin tức, Thời tiết, Tỷ giá, W3Schools, ISTQB).
  - 🐞 **Diệt Bug** (30 s, lưới 12 ô: 🐞 +10, 🕷️ +25, ✨ −15; combo; kỷ lục `qcworld-bugbest`; danh hiệu Tester tập sự → Thợ săn bug huyền thoại ≥360).
  - 🃏 **Lật thẻ QA** (ghép 8 cặp thuật ngữ ↔ nghĩa trong 18 cặp; kỷ lục lượt `qcworld-cardbest`).
  - 📝 **Ghi chú** (tự lưu `qcworld-lapnotes`).
  - 🎧 **Nghe nhạc** (cất laptop rồi mở máy nghe nhạc).
- Cổng Trang chủ và QA Brain "Tự test" gọi `laptop.openMD(url)`.

### 11.2 🎧 Máy nghe nhạc "QC Pod" – phím Y
- Tìm YouTube qua `GET /api/yt/search?q=` (server `serve.py`, không cần API key) hoặc dán link; danh sách kết quả có ảnh thu nhỏ; chọn bài, ▶ Phát (hoặc bấm đúp), ⏯ ⏭ âm lượng ⏹. Bài bị chủ sở hữu chặn phát ngoài YouTube (mã 101/150/153) được đánh dấu ⛔ + nút "↗ Mở trên YouTube" (lưu `qcworld-pod-bad2`). Trình phát YouTube chạy trong `js/ytframe.html` ở `http://localhost` (không phải 127.0.0.1) để YouTube cho phát bản chính thức.
- **Đeo tai nghe**: hoạt cảnh tay lấy tai nghe từ túi quần → đưa lên tai (1,7 s), tháo (1,6 s). **Khi đeo, mọi âm thanh thành phố (sóng, gió, xe, người, nhạc sân khấu) bị tắt** (vá `AudioNode.connect` bằng nút giảm âm); chuông điện thoại vẫn nghe. Thanh "Đang phát" ở góc phải dưới (tạm dừng/bài kế/âm lượng/Tháo/☰/⏹).

### 11.3 📱 Điện thoại – phím O
- Mỗi người **1 số cố định `555-xxx-xxxx`** (lưu `qcworld-phone`), danh bạ, nhắn tin (gửi/nhận qua server nhiều người chơi, trạng thái "đang gửi/đã gửi/chờ người nhận online"), mục "📡 Đang online", soạn tin, huy hiệu tin chưa đọc, chuông "ting-ting" khi có tin. Chơi một mình thì nhắn tin báo cần vào chế độ nhiều người (J). Nếu số đang dùng ở cửa sổ khác thì cấp số tạm.

### 11.4 💰 Nạp tiền – nút "+" cạnh ví (topup.js)
- 2 gói chỉ là **hoạt cảnh vui trong game, không có thanh toán thật**:
  - **Gói 1 – Nạp 500:** điện thoại tự bật Tin nhắn → "Anh trai Bình Phan" (số 555-999-9999), ngón tay ảo gõ bàn phím ảo xin, đối thoại: "Cho xin 500 đồng trải nghiệm game đi bợn hiền" → "OK , đưa số tài khoản đây" → "123456789" → "Đã chuyển, trải nghiệm nhé"; thông báo "🏦 Ví QC · +500 💰" → **+500**.
  - **Gói 2 – "Ủng hộ nhà phát triển 20k":** hỏi lại "Bạn muốn thực sự ủng hộ nhà phát triển sao?" [Khôngn't]/[Có chứ]; "Có chứ" → cắt cảnh: xe mui trần đuôi thuyền đỏ "QC Sovereign Boat-Tail" (thiết kế riêng, không logo hãng) chạy tới từ 42 m (6 s), vệ sĩ xuống mở cửa, anh Bình Phan (áo đen, cánh vàng, dây chuyền + vương miện) bước ra nói "Sao hay dị quá, giàu quá ha mà bay đặt nhấn gói này 😏", hai điện thoại chạm nhau → **+2.000 💰**, "Mãi bên nhau bạn nhé 🤝", chào, lên xe, xe bay lên trời. Cần ở ngoài trời, không đi xe. Có nút bỏ qua (Esc) vẫn được cộng.

## 12. NHIỀU NGƯỜI CHƠI (js/multi.js)
- Nút "👥 Online" (phím J) nhập địa chỉ server (mặc định `ws://127.0.0.1:8790`), 6 màu tên, tuỳ chọn tự kết nối. Server `multiplayer_server.py` (chỉ chuyển vị trí/tên/chat/cử chỉ; mặc định chỉ 127.0.0.1, bản LAN cho mạng nội bộ; tối đa **32 người**).
- Gửi 10 gói/giây (vị trí, hướng, animation, mô hình, loại xe, đang trong toà nào); người khác được nội suy trễ 160 ms. Người chơi khác có avatar đúng loại + nhãn "👤 tên"; ở trong toà nhà thì không hiện ngoài phố. Chat T hiện bong bóng trên đầu người gửi; cử chỉ 1–6 đồng bộ (👋🦘👊🙌👍🙅). Tự kết nối lại tối đa 6 lần.

## 13. ÂM THANH MÔI TRƯỜNG (island.js, ambience.js, world.html)

- **Không có nhạc nền.** Âm thanh tự tạo bằng Web Audio (không tải file, offline). Bật/tắt ở nút ⚙ Đồ hoạ → "Âm thanh môi trường" (`qcworld-sfx`).
- **island.js (quanh đảo chính):** sóng vỗ theo khoảng cách tới bờ (to khi sát bờ, im ngoài ~55 m), gió, hải âu kêu (6–16 s/lần khi gần biển), **bước chân theo mặt đất** (cát / cỏ / đường nhựa-Downtown-trong nhà / sàn gỗ), tiếng "bịch" dừa rơi, "ting" nhặt vỏ sò.
- **ambience.js (toàn thế giới):** sóng ở mọi bờ nước khác (mờ dần khi về gần đảo chính r<135 để khỏi chồng tiếng); tiếng xe thật của 5 xe gần nhất trong 45 m (động cơ + lốp, theo tốc độ, lệch trái/phải theo vị trí), xe buýt trầm hơn, tiếng ồn phố xa; **tiếng người lầm rầm** (6 giọng tổng hợp: 4 người lớn nam/nữ + 2 trẻ em, nhân vật thấp <1,35 m hoặc nhãn 👧👦 là trẻ em, thỉnh thoảng cười khúc khích) theo người trong 22 m; **sủa/meo** của thú; **gõ phím** trong văn phòng (toà công ty); vào trong nhà thì tiếng ngoài trời nghe đục (lọc thấp 500 Hz) và nhỏ.
- **Nhạc sân khấu:** YouTube IFrame trong khung phải trên (xem 2.15, 2.17).

## 14. BẦU TRỜI, NGÀY ĐÊM, ĐỒ HOẠ (skyfx.js, world.html)

- **Ngày/đêm (phím N hoặc nút):** 3 mức: ☀️ Ngày (mặt trời cao 40°), 🌇 Hoàng hôn (3°, hệ số đêm 0,6), 🌙 Đêm (−5°, ánh trăng, sao 2200 điểm). Đêm: đèn đường, biển hiệu, cửa sổ, đuốc, đèn sân khấu toả sáng (tối đa 900 quầng sáng gộp); trong đảo đèn đường dùng 6 điểm sáng thật quanh quảng trường. Không có chu kỳ tự động (người chơi tự đổi; ngủ thì về Ngày).
- **skyfx.js:** lớp mây nhiễu 2 tầng trôi theo gió ở y=360 (tấm 7000×7000, nhuộm theo giờ), dãy núi xa ở chân trời (hình trụ r=2100, cao 260), trăng + quầng sáng chỉ ban đêm (cách 1900 m). Tắt khi vào trong toà.
- **Chất lượng đồ hoạ (nút ⚙):** Tự động / Thấp / Vừa / Cao, khoá 30 FPS tự động nếu không giữ nổi ~52 FPS, hậu kỳ điện ảnh bật/tắt, âm thanh bật/tắt. Mức Thấp: không bloom, ít cỏ, nước nhẹ, bóng tĩnh, bot không đổ bóng, bán kính ẩn người/bot nhỏ hơn.

## 15. PHÍM TẮT

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

## 16. DỮ LIỆU LƯU TRÊN MÁY (localStorage)

`qcworld-save` (tiền, đồ, buff, đất, thú, nhà, xe, thống kê, học tập, nhà nghỉ dưỡng, `mp`…), `qcworld-profile` (tên + nhân vật), `qcworld-eggs`, `qcworld-helped`, `qcworld-quality`, `qcworld-fpscap`, `qcworld-cine`, `qcworld-sfx`, `qcworld-screens` (chỉ số thẻ từng màn hình), `qcworld-brain` (văn bản + phân tích), `qcworld-phone`, `qcworld-pod-vol`, `qcworld-pod-bad2`, `qcworld-bugbest`, `qcworld-cardbest`, `qcworld-lapnotes`. Tệp dữ liệu: `data/questions.json`, `data/courses.json`, `data/characters.json` (+ ảnh đầu riêng tư), server cục bộ `serve.py` (các `/api/...`), `multiplayer_server.py`.

## 17. ĐIỂM CẦN LƯU Ý KHI THIẾT KẾ LẠI (phát hiện trong mã)

1. `buildHouse` dùng cho nhà trên lô đất; `buildTower`, `zoneProps` (nhà công cụ cũ) **còn trong world.html nhưng không được gọi** cho 8 zone (đã thay bằng quảng trường + màn hình).
2. Văn bản cũ chưa khớp vị trí thật: "Văn phòng địa chính" (life.js:620) và các câu bot nhắc "khu Thương mại"; mô tả xe đạp "~23 km/h" trong khi mã là 5 m/s ≈ 18 km/h.
3. Bot `clerk` (Chị Hoa, Anh Khoa, Cô Mai) và `fisher` hoạt động ở Chợ/showroom/địa chính (Phường) và cầu tàu phía Bắc; bot `walker` chọn điểm đến gồm cả Học viện và Chợ nên có thể đi rất xa.
4. Điểm đặt `CITY.places.academy` và `tower` là toạ độ cực; cửa thật (`city.academy.tx,tz`, `city.spots.brain`) do `city.js` quyết định (ngoài phạm vi).
5. Quy hoạch phân khu `CITY.sectors` chỉ giữ chỗ (không trồng cây ngẫu nhiên), không tự dựng công trình trong phạm vi này.
6. Vị trí cụ thể các vật đặt ngẫu nhiên (chòi lá, cứu hộ, thuyền thúng, dù, ghềnh đá, rặng dừa, rác, vỏ sò, lâu đài cát) dùng bộ sinh số hạt giống cố định nhưng phụ thuộc vật cản đã có nên cần chạy game mới có toạ độ.
7. `S.carModel` (mẫu ô tô đang dùng) không có trong trạng thái mặc định của life.js; do showroom đặt.

## 18. BẢNG TÓM TẮT KHÔNG GIAN

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
