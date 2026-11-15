# 06 · Đảo Ngoại ngữ và Bản đồ đất toàn thế giới (hiện trạng theo mã nguồn)

Tài liệu mô tả hiện trạng, lấy từ mã nguồn, không phải thiết kế mới. Nguồn đọc: `js/langcenter.js` (LC, 304 dòng), `js/langui.js` (UI, 954 dòng), `data/lang_index.json`, `LAND_CLAIMS.md`, và các khối đất trong `world.html`, `js/funisland.js`, `js/highland.js`, `js/hills.js`, `js/themepark.js`, `js/transit.js`, `js/downtown.js`, `js/arena.js`, `js/resort.js`.

**Quy ước:** 1 ô = 1 m = 1 đơn vị toạ độ. x: Đông (+) – Tây (−). z: Nam (+) – Bắc (−). y: độ cao (mặt biển `WATER_Y = −0,35`). Góc cực của đảo chính: 0 = Đông, π/2 = Nam, π = Tây, −π/2 = Bắc (`world.html:224`).
Ghi chú "≈" là số tính từ công thức hoặc ước lượng. "chưa rõ" là mã không cho biết chắc.

---

## PHẦN A. ĐẢO NGOẠI NGỮ (`js/langcenter.js`)

### A0. Tổng quan và cách nạp

- Module `make(W, ctx)` được nạp bởi `js/life.js:769` (danh sách `['lang','./langcenter.js']`), trả về `W.lang = {open, due, pickTrack}` (LC:275).
- Đất đăng ký: `EXTL.push({x0:-360, x1:-162, z0:-120, z1:98, name:'Đảo Ngoại ngữ'})` (LC:41). Hộp khai báo `LAND = x −360…−160, z −120…100` (LC:27), x1 và z1 trừ `RES = 2` m. Lưới độ cao 2 m (101 × 111 điểm), nội suy 2 tam giác.
- Hằng số hình học (LC:27): tâm `CX = −262`, `CZ = −12`; nửa rộng `HX = 92`, nửa sâu `HZ = 102`; trục cầu và đại lộ `ZB = −16`; vùng phẳng campus `CAMP = {hx:66, hz:76}`; cao độ nền campus `G0 = 1,3`.
- Vùng `region` của đảo = `'open'` (thuộc thế giới mở, `regionAt` ở `world.html:283`).
- Chưa có nút taxi, xe bot hay bus tới đảo. `grep TAXI_DEST` chỉ thấy Cao nguyên. Đảo chỉ tới được bằng cầu vòm hoặc teleport trong bản đồ M.
- Ứng dụng học `langui.js` chỉ được `import()` khi mở lần đầu (LC:270). Khi mở, `renderer.render` bị chặn (`W.langOpen`) để đỡ tốn GPU (LC:277).

### A1. Đảo Ngoại ngữ (địa hình + lát đường)

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

### A2. Cầu vòm (bờ Tây đảo chính → Đảo Ngoại ngữ)

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

### A3. Cổng chào đầu Đông cầu (phía đảo chính)

- **Tên:** Cổng chào "ĐẢO NGOẠI NGỮ · LANGUAGE ISLAND · 语言岛". LC:85–90, `gate(XS+1,2)`.
- **Vị trí và kích thước:** x = XS+1,2 (≈ −64). 2 cột navy 0,9 × 7,2 × 0,9 tại z = −16 ± 5,4. Xà ngang 1,2 × 1,4 × 11,8, tâm cao 7,6 m. Cổng thông thoáng 10,8 m.
- **Bố trí:** bảng hai mặt 10,8 × 1,7, nền xanh '#16324f', dòng 1 trắng "🗣️ ĐẢO NGOẠI NGỮ · LANGUAGE ISLAND · 语言岛", dòng 2 vàng "Học miễn phí: Tiếng Anh 0 → IELTS 8.0+ · Tiếng Trung 0 → HSK 7–9". Cột có va chạm tròn r = 0,65.
- **Chức năng:** biển báo, dẫn vào đảo. Không có nhân vật. Không có tương tác riêng.
- **Kết nối:** nằm ở đầu cầu phía đảo chính.

### A4. Cổng chào đầu Tây cầu (phía đảo ngoại ngữ)

- **Tên:** Cổng chào thứ 2, `gate(XE−3)`, x = −183. LC:90.
- **Kích thước, bố trí, chức năng:** giống A3 (cùng bảng chữ, xà cao 7,6 m, cột z = −16 ± 5,4).
- **Kết nối:** cuối cầu, trước dốc vào campus.

### A5. Toà Trung tâm Ngoại ngữ (khối chính)

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

### A6. Sảnh tư vấn (Lobby) – vào đi bộ được

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

### A7. Quầy tư vấn (nằm trong A6)

Mô tả đầy đủ ở A6 (không có không gian riêng). Điểm E: (−282,2, −16). Nhân vật đứng sau quầy: Cô Linh ở (−286,2, −15,2), quay mặt về hướng Đông (π/2).

### A8. Phòng học kính Bắc (trong sảnh)

- **Tên:** Phòng học kính tiếng Anh (bảng "Lesson 1: Hello!").
- **Vị trí và kích thước:** tâm z = −28,2 (`cz = ZB − 12,2`). x −289,6…−282, z ≈ −31,5…−24,9 (7,6 × 6,6 ô). Kính cao 3 m. 1 tầng.
- **Bố trí và nội thất:**
  - Tường kính phía Đông x = −282 (z −31,5…−24,9) và tường kính phía Nam z = −24,9 (x −289,6…−282); hộp va chạm tương ứng. Lối vào là phần hở phía góc Đông – Nam chưa rõ chính xác (mã chỉ dựng 2 tường kính, **chưa rõ có cửa không**).
  - 6 bộ bàn ghế: 2 hàng × 3 cột. Hàng x = −288,6 và −286,0, z = cz−2, cz, cz+2 (−30,2; −28,2; −26,2). Mỗi bộ gồm bàn trắng 1 × 0,06 × 1,4, chân thép, ghế xanh 0,45³ ở x+0,7. Va chạm 1 hộp x −289,3…−284,8, z cz ± 2,9.
  - Bảng trắng 3 × 1,5 gắn tường Tây (x = −289,55, cao G0+1,8), chữ "Lesson 1: Hello! / I'm Lan. I'm from Hanoi. / /aɪm/ /ʃiːz/ /ɪts/".
- **Chức năng:** trang trí / bối cảnh lớp tiếng Anh. Không có tương tác riêng.
- **Nhân vật:** không có.
- **Kết nối:** thông với sảnh qua phía Đông – Nam.

### A9. Phòng học kính Nam (trong sảnh)

- **Tên:** Phòng học kính tiếng Trung (bảng "第一课 你好！").
- **Vị trí và kích thước:** tâm z = −3,8 (`ZB + 12,2`). x −289,6…−282, z ≈ −7,1…−0,5 (7,6 × 6,6 ô). Kính cao 3 m. 1 tầng.
- **Bố trí và nội thất:** đối xứng với A8: 6 bộ bàn ghế ở x −288,6 và −286, z = −5,8; −3,8; −1,8. Tường kính Đông x = −282 và tường kính phía Bắc z = −7,1. Bảng trắng tại (x −289,55, z −3,8) với "第一课 你好！ / Nǐ hǎo! Wǒ jiào Xiǎo Lán. / nǐ hǎo → ní hǎo".
- **Chức năng, nhân vật, tương tác, kết nối:** như A8.

### A10. English House

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

### A11. Hán Học Đường 汉学堂

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

### A12. Sân khấu CLB Giao tiếp (Speaking Club)

- **Tên:** Sân khấu CLB Giao tiếp, khán đài bán nguyệt. LC:185–195.
- **Vị trí và kích thước (`AM`):** tâm (−222, −68). Sân khấu tròn gỗ bán kính 4,2–4,4, cao 0,6. Khán đài 4 hàng bậc bán nguyệt nằm phía Nam (z > −68), bán kính trong 6,5, ngoài 12,9, mỗi hàng dày 1,6 m, cao dần 0,45 → 1,8 m, xen màu kem / đá.
- **Bố trí và nội thất:**
  - Phông nền navy 9 × 5 × 0,3 tại z = −72,6, cao tâm +3. Bảng "🎭 SPEAKING CLUB / CLB GIAO TIẾP · 口语俱乐部 / Nghe – trả lời – nhập vai – nói theo" 8,6 × 4,3 gắn phía trước phông (z = −72,5).
  - Rào va chạm tròn (r 0,75 mỗi điểm): vành ngoài bán kính 13,3 (37 điểm), vành trong 6,2 (17 điểm), 2 đầu (z = −67,7). Khán đài bị rào kín, **không bước lên được**.
- **Chức năng:** nhập vai hội thoại, kiểm tra nghe.
- **Nhân vật:** không có người cố định (Ngọc Anh nói về CLB ở quảng trường, A16).
- **Tương tác:** E tại (−222, −53,2) r 2,4, prio 0,9 (phía Nam khán đài): "🎭 CLB Giao tiếp – hội thoại nhập vai, kiểm tra nghe (E)". Hiện hộp chọn ngôn ngữ (🇬🇧 Tiếng Anh / 🀄 Tiếng Trung) rồi mở app `talks` (LC:283, 272).
- **Kết nối:** gần đường ngang z = −68 (x −312…−212) và trục x = −226.

### A13. Phòng thi IELTS · HSK (Exam Hall)

- **Tên:** Phòng thi "📝 PHÒNG THI · EXAM HALL · 考场". LC:197–201.
- **Vị trí và kích thước (`EX`):** tâm (−222, 34), rộng 22 (x −233…−211) × sâu 14 (z 27…41), cao 8 m (kính). 1 tầng. Hộp kín có va chạm, không vào trong.
- **Bố trí và nội thất:** hiên nhỏ trắng 6 × 0,3 × 2,4 (z ≈ 25,9, cao +3,6). Bảng 10 × 1,95 nền tím '#3a1c5c' (cao +6, z ≈ 26,9, hướng Bắc): "Thi thử IELTS · HSK tự soạn".
- **Chức năng:** thi thử.
- **Nhân vật:** không có.
- **Tương tác:** E tại (−222, 25,2) r 2,2, prio 0,9: "📝 Phòng thi – thi thử IELTS / HSK (E)". Chọn ngôn ngữ rồi mở app `mocks` (LC:284).
- **Kết nối:** mặt chính hướng Bắc, nhìn ra quảng trường; đường z = 30 phía Nam.

### A14. Thư viện (Library)

- **Tên:** Thư viện "📖 THƯ VIỆN · LIBRARY · 图书馆". LC:203–209.
- **Vị trí và kích thước (`LB`):** tâm (−300, −74), rộng 22 (x −311…−289) × sâu 12 (z −80…−68), thân cao 7 m kem. Mái bằng trắng dày 0,8 (cao ≈ +7,4) nhô ra phía trước. Thềm: bậc đá 23 × 0,5 × 4,2 (z −68,1…−63,9) cao +0,5, có `addPlat` đi lên được. 1 tầng.
- **Bố trí và nội thất:** 6 cột cổ điển trắng (bán kính 0,35–0,4, cao 6,6) ở z = −65,4. Bảng "📖 THƯ VIỆN… / Sổ tay chuyên đề · tra cứu chuyên sâu" 9 × 1,6 (cao +6,2, z ≈ −61,9). Va chạm hộp x −311…−289, z −80…−65,4. **Không vào trong được.** Ghi chú: biến `ped` (đầu hồi tam giác) được tạo nhưng không được thêm vào Kit, nên chưa có đầu hồi.
- **Chức năng:** sổ tay chuyên đề (giáo viên, tra cứu).
- **Nhân vật:** không có.
- **Tương tác:** E tại (−300, −63,4) r 2,4, prio 0,9: "📖 Thư viện – sổ tay chuyên đề (E)". Chọn ngôn ngữ rồi mở app `guide` (LC:285).
- **Kết nối:** thềm hướng Nam, giáp đường z = −68 (x −312…−212).

### A15. Quảng trường trung tâm + Bảng ôn tập + đường dạo

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

### A16. Nhân vật trong campus (5 NPC, LC:246–265)

Chỉ tạo khi có `W.people.kit` và `W.makeActor`. Đứng im, animation "idle" (không đi lại), có va chạm tròn r 0,35. Khi người chơi lại gần < 3,6 m: hiện toast "💬 Tên: lời chào" 4,2 giây, chạy clip "wave" nếu có (2,2 giây). Reset khi cách > 6 m.

| Tên (role) | Vị trí (x, z) | Hướng | Lời chào |
|---|---|---|---|
| Cô Linh · tư vấn (nữ, áo xanh '#1f4fa8', tóc dài; seed idx 21) | (−286,2, −15,2), sau quầy tư vấn | Đông (π/2) | "Chào bạn! Muốn học tiếng Anh hay tiếng Trung? Bấm E ở quầy để xem lộ trình miễn phí nhé" |
| Mr. Tom · English teacher (nam, sơ mi trắng; idx 22) | (−253,6, −50,2), trước English House | Nam (0) | "Hello! Welcome to English House. Lesson 1 starts with “Hello! I’m…” – come in!" |
| 王老师 · thầy Vương (nam, áo đỏ '#b3261e'; idx 23) | (−253,4, 17,3), trước Hán Học Đường | Bắc (π) | "你好！欢迎来到汉学堂！Chào bạn, học tiếng Trung từ pinyin nhé" |
| Ngọc Anh · học viên IELTS (nữ, áo cam; idx 24) | (−219,5, −6,5) trên quảng trường | −2,4 rad | "Mình đang ôn IELTS Speaking ở CLB Giao tiếp – bạn vào nhập vai cùng không?" |
| Đức · học viên HSK (nam, áo xanh lá; idx 25) | (−220,8, −5,4) trên quảng trường | 0,8 rad | "我在准备HSK四级！Mỗi ngày mình ôn thẻ từ 15 phút" |

NPC không có tương tác E, không có thưởng. Chỉ chào bằng toast.

### A17. Cây xanh và cảnh quan phụ

- LC:232–242. 2 `InstancedMesh` (thân + tán), cao thân 2,4 m, tán icosahedron bán kính 1,7. Có va chạm tròn r ≈ 0,35·tỉ lệ.
- Vị trí: 8 cây dọc đại lộ (x = −188, −197, −251, −260; z = −16 ± 9) + tối đa tới 150 cây rải ngẫu nhiên (140 lần thử, seed 20261115) trong x −346…−174, z −106…86, bỏ chỗ có công trình (8 hộp loại trừ gồm toà chính, English House, Hán Học Đường, sân khấu, phòng thi, thư viện, quảng trường, cạnh cầu), bỏ nền < 1,2 m và đường lát. **Số cây thật chưa rõ** (phụ thuộc kết quả loại trừ).
- Không có tương tác.

### A18. Hành vi toàn cục gắn vào đảo (không phải không gian)

- **Kiểm tra nhanh đột xuất** (LC:290–296): cứ ≈ 25 phút chơi (1500 giây khung) hỏi một lần, điều kiện: đã chơi > 600 giây, đứng yên > 5 giây ngoài trời, không `W.inside`, không đi xe, không có modal đang mở, đã hoàn thành ≥ 1 bài và `set.pop !== false`. Hiện hộp xác nhận "⚡ Kiểm tra nhanh – bạn còn nhớ bài không?" (6 câu, ≈ 1 phút) nút "⚡ Làm ngay" mở app `quick`.
- **Nhắc ôn hằng ngày** (LC:297–300): sau 40 giây vào game, 1 lần mỗi ngày (khoá `qcworld-lang-nudge`), nếu có bài đến hạn thì toast 7 giây nhắc đến Trung tâm (phím M để bay tới).
- **Bản đồ M (PLACES):** "Trung tâm Ngoại ngữ" teleport (−268, −16) hướng (−285, −16); "Cầu Đảo Ngoại ngữ" (LC:287–288).

**Tổng hợp điểm E của Đảo Ngoại ngữ (8):** quầy tư vấn, vòng sáng sảnh, English House, Hán Học Đường, sân khấu CLB, phòng thi, thư viện, bảng ôn tập. Cộng 1 điểm ở đầu cầu (xem A2): tổng 9 `INTER`.

---

## PHẦN B. ỨNG DỤNG HỌC `js/langui.js` (tóm tắt chức năng)

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

## PHẦN C. BẢNG TẤT CẢ VÙNG ĐẤT TOÀN THẾ GIỚI

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

### Kết nối giữa các vùng

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

### Sơ đồ ASCII thô (x: 20 m / ký tự, z: 40 m / hàng)

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

## Phụ lục. Danh sách không gian đã mô tả

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
