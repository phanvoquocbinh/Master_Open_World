# Rà soát hình ảnh & va chạm toàn thế giới QC World – 16/11/2026 (phiên S19g)

Bình yêu cầu: "rà soát tất cả địa hình, cảnh vật, mọi thứ… chân lún xuống đất, lòi qua đầu, nước đi xuyên mặt đất ở thác cao… check từng chi tiết".
Ảnh bằng chứng: `C:/Users/Binh - Soft/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/side-session-notes/local_27363314-849e-49d1-8f26-098f5d8cecd1/audit_shots/` (số thứ tự ghi trong từng mục).

## Cách rà (chạy lại được)
- `tools/qa/poseaudit.js`: với mỗi nhân vật (người chơi + bot), bắn tia dọc từng đoạn xương. Đoạn nào cắt qua sàn/ghế/xe/mái thì báo, kèm vật bị xuyên. Các đoạn xét: đùi, cẳng chân→gót, cẳng chân→mũi giày, thân, cổ→đầu, tay.
- `tools/qa/worldaudit.js`:
  - `ground()`: loang từ điểm đứng, chỉ những ô người chơi thật sự đi tới được (có xét dốc ≤ 0,65 m, vật cản, tường `SEGS`). Ở mỗi ô so mặt đi VẬT LÝ với mặt NHÌN THẤY → `sink` (chân lún vào vật) / `float` (đứng trên không).
  - `water()`: nước cắt vào vách / đất nhô lên mặt nước.
  - `instances()`: cây/đá/đèn lơ lửng 0,25–2,5 m hoặc chìm.
- Đã quét V1 (86 điểm, ~165 nghìn ô đi được) và V2 (78 điểm, ~163 nghìn ô). Có 2 lượt chụp xác nhận (~220 điểm) và chụp riêng 2 thác nước.
- Lưu ý: từ 05:19 mặc định đã là **V2** (`v2core.js`); V1 mở bằng `world.html?v1`.

---
## A. ĐÃ SỬA (file của S19g) – đã test lại

**1. Gói 20k (`topup.js`)**
- **Lỗi:** vệ sĩ và anh Bình Phan ngồi tư thế "ghế" (cẳng chân thẳng đứng) trong khi đệm xe chỉ cao hơn sàn 17 cm → bàn chân tọt xuống sàn xe, đùi lún 19 cm vào đệm.
- **Đã sửa:**
  - Thêm tư thế ngồi xe theo hình học thật: khớp háng trên mặt đệm, cẳng chân chéo đủ dài để gót chạm sàn.
  - Ghế sau lùi 15 cm, chân chui dưới đệm ghế trước.
  - Xe tự tìm chỗ đỗ trống: thân xe, vùng mở cửa và lối vệ sĩ đi vòng đều không vướng ghế/bàn. Trước đó vệ sĩ đứng lọt vào ghế bàn picnic.
  - Đường chạy tới vướng thì xe bay từ trời xuống.
- **Kết quả test:** 3 địa điểm, 0 lỗi khi xe đứng yên.

**2. Dev City (`devcity_chongqing.js`, `devcity_landmarks.js`, `bots_devcity.js`)**
- Mặt nhựa đường (+6 cm) và mặt cầu (+9 cm): đã nâng mặt đi/xe lên đúng mặt nhựa. Trước sửa có hàng trăm ô chân lún 6–9 cm; sau sửa còn 0–3 ô mỗi khu.
- **Dải 2 bên nóc hầm Nam Sơn:** mặt vật lý vẫn khoét theo đường hầm → người trên cao nguyên tụt sâu 3–10 m (lún tới ngực, ảnh 25). Đã sửa: chỉ khoét trong lòng hầm; sàn trên nóc lát theo đúng mặt núi.
- **Mép kè sông:** lưới vật lý 2,5 m biến tường kè thành dốc → đi sát lan can tụt 0,6–1,6 m. Đã sửa:
  - thêm dải sàn phẳng trên mặt kè;
  - khe lan can kè đúng bằng bề rộng cầu (trước rộng hơn 2,5 m mỗi bên);
  - chặn 2 đầu kè và bờ sông dưới Hồng Nhai Động.
- **Bến du thuyền:** 3 cầu tàu không có lối xuống, không có lan can. Đã thêm dốc gỗ từ kè, lan can hai bên và chặn cuối cầu tàu.
- **Hồ Thiên Cảnh:** trước đi bộ được xuống đáy hồ, đi dưới gầm cầu. Đã thêm tường chắn bờ hồ và bờ đảo, chừa khe 2 đầu cầu.
- **Đình giữa hồ:** bệ đá cao 25 cm chưa có sàn đi → đã thêm sàn. Nghệ sĩ đàn Cổ tranh: bàn đàn trước bị xoay dọc xuyên qua người, ghế/hông tính từ tâm bệ → đã sửa, 0 lỗi.
- **Nút giao xoắn ốc:** ô sàn hở ở đoạn cong; đoạn cầu thấp đi xuyên thân cầu → đã đặt ô sàn dày/rộng hơn, tường chắn kéo xuống mặt đất khi gầm < 2,3 m. Nay 0 lỗi.
- **Lối dạo quanh hồ, sân trường, đường băng sân bay:** vẽ cao +5–6 cm → đã hạ xuống +1–2 cm, chống nhấp nháy bằng polygonOffset.
- **The Crystal:** bồn cây chưa có va chạm → đã thêm. Đã bỏ hàng cọ bị trùng.

**3. Wonderland V2 (`wonder_v2.js`)**
- Mặt đi cầu G8, mố cầu G9 và lối lát ra G9 trước thấp hơn mặt nhựa/lát 3–6 cm → đã chỉnh, nay lệch ≤ 0,1 m.

Còn lại nhỏ ở Dev City (chưa sửa): 2 điểm sát chân tượng Phật (+82 m); 3 ô trong hầm gần cửa Nam lệch 13–35 cm.

---
## B. CẦN SỬA – theo file / phiên phụ trách
P1 = thấy rõ khi chơi, P2 = thấy khi để ý, P3 = nhỏ. Toạ độ (x, y, z).

### B1. Phiên đồ hoạ (`qc-world-do-hoa`)
- **[P1] `highland.js` – Thác Móng Ngựa (V1, Cao nguyên)** – ảnh 01, 02. Đây đúng là lỗi "nước đi xuyên mặt đất ở thác cao" Bình nói.
  - Rèm nước 2 đầu mép thác (b = ±26) chạy lọt vào vách đá/bờ cỏ.
  - Mặt hồ trên (dải b ±34, rộng hơn lòng thác 4–26 m) cắt vào 2 bờ và tràn qua mép.
  - Đề xuất: rèm nước chỉ trong |b| ≤ FHW−2,5; dải hồ trên theo đúng nửa bề rộng `fHalf(a)+1` thay vì ±34; 2 đầu rèm khuất sau đá.
- **[P1] `abyssal_island.js` – 2 thác đầu nguồn Đông/Tây (V2, x ±145,9, z −30, cao 58 m)** – ảnh 03, 04.
  - Tấm nước phẳng cắt xuyên sàn và lan can kính các tầng phố đi bộ.
  - Thác đập Cổng Trời (z 161,75) gần như bị vách che.
  - Đề xuất: đẩy tấm nước ra trước mặt vách và khoét chỗ giao với các tầng (hoặc chia thành đoạn giữa các tầng).
- **[P1] `abyssal_island.js` – Cổng Đông (x ≈ 170,5, z −40…36):** người chơi đi vào được trong tường bờ xám cao ~1,3 m – ảnh 17, 18.
- **[P1] `themedark.js` – nhà "Huyền Thoại Xứ Sở Thần Tiên" (lâu đài):** đi xuyên vào khối nhà tường xanh/đỏ, lún 1,15–1,5 m.
  - V1 (44, 2, 1080); V2 (−86…−69, 2, 1337…1346).
  - Ảnh 18. Các khối nhà tối khác cũng cần kiểm.
- **[P2] `themepark.js` / `themerides.js`:**
  - Quầy soát vé là khối trắng không va chạm (người chơi đi xuyên 1,1 m) – ảnh 19.
  - Nhân viên soát vé mũi giày lọt 8–9 cm vào quầy.
- **[P2] `themepark.js` – lối lát đá vẽ ở G0+0,05 trong khi mặt đi là G0:** chân lún ~6–8 cm trên mọi lối trong Kỳ Quan (cả V1 lẫn V2). Đề xuất: đặt plat theo lối lát (như S19g làm cho lối G9) hoặc hạ lối xuống +0,01 kèm polygonOffset.
- **[P3] `funisland.js` – Wonderland:** vài vật trên đảo không va chạm, lún 0,3 m (V2 (−107, 1,7, 522)).

### B2. qc-lang-center (`swiss_lang_island.js`, `palm_dubai.js`)
- **[P1] Học viện Tiếng Trung · Tô Châu (V2 (−681,5, 6, −55,5)):** có SÀN VÔ HÌNH cao 2,7 m, người chơi đứng ngang nóc lan can đỏ bên kênh – ảnh 13.
- **[P1] Tà vẹt đường ray cao ~0,6 m không va chạm:** người đi xuyên. Chỗ: đảo Thụy Sĩ (−360, 9,5, −141…−193) và gần Học viện Tiếng Trung – ảnh 14, 15.
- **[P1] Bàn/băng ghế học (4 học viện) và ghế gỗ / khúc gỗ Làng Tuyết không va chạm:** đi xuyên. Học viện Tiếng Trung (−683, 6, −69), Tiếng Hàn (−677, 7,6, −268…−277), Làng Tuyết (−739, 13…23, −310…−328) – ảnh 16, 22.
- **[P2] Mặt lát / sàn vẽ cao hơn mặt đi 5–12 cm (chân lún).** Số ô theo điểm:

  | Điểm | Số ô |
  |---|---|
  | Học viện Tiếng Anh · Oxford | 87 |
  | Học viện Tiếng Hàn | 65 |
  | Bến thuỷ phi cơ | 63 |
  | Nhánh Santorini | 59 |
  | Học viện Tiếng Trung | 36 |
  | Đường đèo ngắm biển | 30 |
- **[P3] Palm – Vành Dinh thự Đế Vương (961–976, −2…−4, 1153–1178):** 10 cụm đồ trang trí dạng instanced bị chìm 2–4 m dưới mặt đất.

### B3. qc-park (`river_cbd.js`, `skyport.js`, `bots_cbd_sky.js`)
- **[P1] The Tri-Matrix Perf Center (450, 2,4…3,4, 164…166):** bậc gỗ khán đài không va chạm, người đi xuyên 0,5–1,4 m – ảnh 20.
- **[P2] Beijing Starlight Towers / Bệnh viện Đa khoa QC City (V2 (262 / 442, 2, 248)):** mỗi chỗ 110 ô lún ~10 cm (sàn sảnh vẽ cao hơn mặt đi).
- **[P2] Sân bay Manta Ray:** 30 ô lún 5–10 cm ở sảnh; hành khách/nhân viên mũi giày lọt 5–11 cm.
- **[P3] Bảo vệ Segway (QA Ring):** đùi xuyên tay lái Segway 0,2 m.

### B4. Phiên chính (Brain + toàn bộ module V1)
**V2 – Brain (`brain_citadel.js`, `bots_brain.js`):**
- **[P1] Sân bay Đỉnh Mây (821, 108,7, 125):** khối trắng cao 1,35 m không va chạm – ảnh 17.
- **[P1] Đường dốc ở "Xích đu vực & Khinh khí cầu" (847, 100, 280):** đi vào trong khối nền đường 1,4 m – ảnh 21.
- **[P2] Lối kính men vách (850–860, 100–108, 243–278):** sàn kính trong suốt, có chỗ ô đứng thò ra ngoài mép lối (đứng giữa không trung); cần soi lại.
- **[P2] Phố săn mây:** 59 ô lún 5–10 cm. "Chủ quán săn mây" thân xuyên quầy trắng – ảnh 23.

**V1 – các module cũ:**
- **[P1] Vỉa hè + sàn sảnh Downtown, Phường Khởi Nghiệp, Trung tâm Việc làm, Quảng trường… vẽ cao +0,12 m so với mặt đi** → MỌI nhân vật đi trên vỉa hè V1 lún mất bàn chân (ảnh 24). Có tới hơn 100 ô mỗi khu.
  - Gốc: `groundH`/`inDT` không cộng độ cao bó vỉa.
  - Đề xuất: cộng độ cao vỉa hè vào mặt đi (như S19g làm cho mặt đường Dev City) hoặc hạ mặt vẽ.
- **[P1] Bot đứng chồng giữa cổng xuất hiện (0, 0, 0):** cầu thủ QC FC / Bug United, trọng tài (`arena.js`), khách đạp thuyền, bé thả diều, chó (`park.js`), người dạo phố (`highland.js`) – 19 nhân vật.
  - Gốc: tạo bằng `makeActor` ở gốc toạ độ và chỉ đặt vị trí khi người chơi tới gần. Nhãn tên nổi đè lên nhau ở cổng – ảnh 05.
  - Đề xuất: đặt `g.position` = vị trí nhà ngay khi tạo, hoặc `g.visible=false` tới khi khu hoạt động.
- **[P1] Rạp QC Cinema (`arena.js`, ~(284–312, 0,4–1,4, 14–21)):** mặt đi bậc ghế lệch với bậc nhìn thấy → người chơi đứng lơ lửng 0,35–1,4 m giữa hàng ghế – ảnh 11, 12.
- **[P1] Khách ngồi quán (`cafe.js`, dùng cho mọi quán W.CAFES V1):** đùi xuyên đệm ghế 0,13–0,23 m vì đặt hông = `seat.y+.04` (khớp háng nằm thấp hơn mặt đệm).
  - Đề xuất: `seat.y + 0,12 − hipsH` (hoặc đo khớp háng như `topup.js`).
  - Nặng nhất ở quán ven biển Quán nước Ngắm Biển / Cổng Rời đảo (`resort.js`): khách ngồi xuyên ghế đẩu trắng – ảnh 09, 10.
- **[P2] `park.js`:**
  - Người đánh cờ cẳng chân lọt vào trong ghế đẩu tròn – ảnh 08.
  - Chị Mai quầy nước Hồ Ngọc đứng lọt trong quầy – ảnh 07.
- **[P2] `transit.js` – trạm buýt (−32, 0, 36):** 2 người chờ xe buýt (Minh / Uyên) đứng chồng 1 chỗ – ảnh 06.
- **[P2] Các vật không va chạm, đi xuyên 0,4–1,3 m:**
  - Toà Giáo trình / Thư viện / Bảng nhiệm vụ / Cầu Đảo Ngoại ngữ (#b7ae9f, 0,6 m);
  - khán đài sân bóng QC Arena (1,3 m);
  - Căn hộ Sky QC (sàn hiên quán cao 0,48 m).
- **[P3] `luxury.js` – xe đại gia:** đầu/cổ hành khách chạm mái kính 3–4 cm. `jobcenter.js` – nhân viên tư vấn ngồi chân lọt trong bàn (khuất, không thấy).

---
## C. Gợi ý chung cho mọi phiên
1. Mặt đường/lối lát/sàn vẽ lệch cao hơn mặt đi để khỏi nhấp nháy → chân lún.
   - Cách 1: nâng mặt đi (plat hoặc cộng vào hàm độ cao) lên đúng mặt vẽ.
   - Cách 2: hạ mặt vẽ xuống +0,01–0,02 và dùng `polygonOffset` chống nhấp nháy.
2. Đồ vật cao 0,3–1,5 m (ghế, bàn, bồn cây, quầy, khúc gỗ, tà vẹt, bậc khán đài) luôn kèm `circles` / `boxes` (có y0/y1) – không thì người đi xuyên.
3. Bot ngồi: đặt khớp háng cao hơn mặt đệm ~7–9 cm. Nếu đệm thấp hơn ~40 cm so với sàn thì phải duỗi chân ra trước (xem `topup.js seatLegs`). Ghế đẩu: cho người ngồi ở mép trước, không ngồi giữa.
4. Sau khi sửa: chạy lại `tools/qa/worldaudit.js` + `poseaudit.js` (hướng dẫn ở đầu mỗi file) để chắc không còn lỗi.
