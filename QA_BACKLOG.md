# QC World – SỔ VIỆC CHUNG (QA + bố cục)

> **Quy ước cho MỌI phiên đang làm game** (Bình yêu cầu 15/11): mỗi lần sửa/xây xong, ghi 1 dòng vào mục **NHẬT KÝ THAY ĐỔI** ở cuối file
> (giờ · phiên · file · vùng toạ độ x0–x1, z0–z1 · việc đã làm). Phiên QA (phiên đồ hoạ) sẽ chạy lại bộ rà tự động trên vùng đó
> (đi xuyên, lún, vật chắn đường, điểm nhảy, nhấp nháy) và xếp lại bố cục nếu vật thể bị lệch – Bình không phải tự đi soát từng chỗ.
> Trạng thái: ⬜ chưa làm · 🔧 đang làm · ✅ xong + đã thử trong game · ➡️ đã giao phiên khác.

## A. Phản hồi của Bình – 15/11 (trưa)

| # | Hạng mục | File | Cỡ | Trạng thái |
|---|---|---|---|---|
| A1 | **Điểm nhảy (bản đồ)**: nhảy "Căn hộ Sky QC" rơi ra chỗ lạ; nhảy thác thì đứng sát vách bị che. Mọi điểm nhảy phải: đứng chỗ trống, thấy toàn cảnh, hướng nhìn không bị che | world.html `teleport` + các `PLACES.push` | vừa | ✅ 73 điểm nhảy đã rà: Sky QC hết rơi đáy biển; camera tự chọn góc trống (còn: chòi đỉnh núi dưới mái) |
| A2 | **Thác nước**: rộng bề ngang hơn nhiều (kiểu Niagara), có đường đi bộ + đài ngắm sát thác, tiếng nước lớn dần khi lại gần | highland.js | lớn | ✅ Thác Móng Ngựa rộng 52 m cao 24 m, hồ trên/dưới, đài ngắm chân thác (sàn gỗ), 100 bậc đá, đài ngắm đỉnh thác, lối dạo từ phố cổ, tiếng thác theo khoảng cách (âm thanh chưa nghe thử được trong máy test) |
| A3 | **Rạp phim**: ngồi được, ngồi xong xem ở góc nhìn thứ 1; có sảnh + nhân viên soát vé + cửa + hành lang tối (đèn dịu / vạch dạ quang) rẽ trái/phải vào phòng chiếu | arena.js | lớn | ⬜ |
| A4 | **Nhấp nháy (z-fighting)**: sân bóng, băng rôn, vài cửa toà Ngoại ngữ – rà toàn bộ | arena.js, langcenter.js, … | vừa | ✅ sửa gốc toàn game (tấm dán ưu tiên chiều sâu + near .3) + sân bóng, cổng sân; còn vài chỗ nhỏ – xem mục B |
| A5 | **Chợ/cửa hàng**: bỏ kiểu quầy bấm E; xây CHỢ LỚN đi bộ vào được, mỗi gian trưng bày thật nhiều hàng (giày nhiều màu/kiểu…), xây to | ward.js, city.js, life.js (shop UI) | lớn | ⬜ |
| A6 | **Bố cục phố**: nhà nằm đủ trên phố, không chen chúc; đất dư thì dùng, thiếu thì nới đất; nhà to hơn | roads.js/ward.js/downtown.js (phiên công viên đang quy hoạch) | lớn | 🟡 phiên công viên 15/11: đã quy hoạch lại theo khối (CITY.roads, đường 20 m, phường tới z 480, công viên giữa, khối bệnh viện/cứu hoả/trường/lô đất/cao ốc); Trung tâm Việc làm dời khỏi vỉa hè. Còn: phóng to các toà cao ốc (downtown.js DEFS) |
| A7 | **Nhân viên tư vấn** (Trung tâm Việc làm) đứng dang tay chữ T → ngồi, hai tay đặt trước đùi; nội thất thêm cây/vật trang trí, bớt trắng | jobcenter.js | nhỏ–vừa | ✅ ngồi ghế quầy, hết dang tay (nội thất/cây: ⬜) |
| A8 | **Showroom xe**: bỏ quầy bé; showroom rộng gấp đôi, 2 tầng, ≥ 20 xe nhiều kiểu/hãng (hãng tự đặt, không dùng thương hiệu thật) | showroom.js, ward.js | lớn | ⬜ |
| A9 | **Góc nhìn thứ 1 / thứ 3** chọn được ở khu vui chơi, cáp treo, ống nhòm; ngồi tại chỗ xoay 360° | world.html (camera), transit.js, funisland.js, arena.js, monument.js | vừa | ✅ phím Q (hoặc bấm chữ ở thanh gợi ý): góc nhìn thứ 1/3 ở mọi nơi – đi bộ, ngồi ghế, phương tiện; ống nhòm tháp QC xoay 360° + phóng to. Chưa thử riêng: cáp treo, vòng quay, tàu lượn |
| A10 | **Tháp QC**: nền trắng; mỗi tầng cao rộng hơn (camera bị thu gần); vạch/lan can vẽ chắn ngang lối cầu thang; đi vào tự té xuống cầu thang; ghế bấm được từ tầng khác rồi rớt lên rớt xuống; kiến trúc phải lớn + đẹp như biểu tượng thế giới | monument.js, life.js (ghế) | lớn | 🔧 phiên chính (ghế: xem A19) |
| A11 | **Quán ven núi**: biển tên bị ngược chữ khi nhìn từ ngoài (mặt ngoài = tên quán, mặt trong = "Cảm ơn quý khách"); mỗi quán kiến trúc khác nhau; có đầu bếp, phục vụ bưng món, món trên bàn; rộng hơn, gác lửng/2 tầng; tầng dưới bị vùi trong đất (đèn lồng sát mặt đất) | mountaintown.js | lớn | 🔧 biển tên: ✅ (mặt ngoài tên quán, mặt trong "Cảm ơn quý khách"); phần kiến trúc/nhân viên: ⬜ |
| A12 | **Đường đèo** uốn vòng vèo; cỏ mọc xuyên mép đường → nắn thẳng/nới đất, dọn cỏ khỏi mặt đường | hills.js | vừa | ⬜ |
| A13 | **Vạch kẻ đường** chỗ có chỗ không (đại lộ Downtown trơn) | roads.js/downtown.js (phiên công viên) | vừa | ✅ phiên công viên 15/11: vạch có đủ, chỉ bị world.html markFar bỏ vẽ (tâm lưới vạch cả thành phố ở z≈209, cách Downtown >192 m) → đặt userData.noFar cho lưới vạch + nền Downtown/Phường |
| A14 | **Văn phòng**: bảng trắng ngoài phòng họp quay sai mặt; người thuyết trình/người nghe cử động, các nhóm họp luân phiên; nhân viên đi lại, lấy nước, ăn trưa; lead/manager đi khảo sát | interior.js | lớn | ⬜ |
| A15 | **Cửa kính văn phòng** nhìn ra thành phố thật, tầng càng cao view càng cao; **phòng giám đốc**: ghế oai, thảm, bàn quay mặt ra cửa, nội thất + trưng bày | interior.js | lớn | ⬜ |
| A16 | **Lỗi**: đang ở trong toà nhà thì bấm bản đồ không nhảy ra được | world.html / interior.js | nhỏ | ✅ |
| A17 | **Cáp treo** đi xuyên trần nhà ga; chọn góc nhìn 1/3, xoay 360° | transit.js | vừa | ⬜ |
| A18 | **Biển**: nhìn từ trên cao một vùng là biển, vùng xa trắng xoá | world.html (nước + sương) | nhỏ | ✅ |
| A19 | **Ghế**: bấm E được từ tầng trên/tầng dưới | life.js | nhỏ | ✅ |
| A20 | **Cột đèn đứng giữa đường** ở cổng "Thế giới mở" (đầu cầu phía đảo) – rà mọi vật thể lệch sau khi quy hoạch lại | city.js + công cụ rà | nhỏ | ✅ (cột đèn vành đai đầu cầu) |
| A21 | **Giao diện (UI)** trống trải, nhàm → làm lại đồ hoạ các bảng (chợ, hồ sơ, bản đồ…) | world.html CSS, life.js | vừa | ⬜ |
| A22 | Chất lượng chung: nội thất, hành vi nhân vật, cử động… chưa đạt – được phép dùng thư viện/tài sản miễn phí (CC0) | nhiều | – | liên tục |
| A23 | **Khu vui chơi**: thiết kế lại theo tài liệu Bình gửi (`Downloads\Thiet Ke Cong Vien Qc World Disneyland.md`) – công viên chủ đề nguyên bản của QC World, KHÔNG dùng tên/nhân vật/hình ảnh có bản quyền | funisland.js, arena.js | lớn | ⬜ (làm sau A2 + A9) |

## B. Còn lại từ đợt rà sáng 15/11
- Bờ Tây đảo chính (x −71…−46, |z|<14) và quanh bệ tháp Brand QA (x 11…18, z 66…74): mặt nhìn thấy cao hơn chỗ đứng ~0,6 m. ⬜
- Phố ẩm thực (x 302…330, z 94…115) tới 0,54 m; vỉa hè cầu lên Cao nguyên (x 174/181, z −109…−62) và cầu Downtown→Giải trí (x 262…274, z ±3,5) 0,22 m; 3 cầu tàu khu nghỉ dưỡng 0,15 m. ⬜
- park.js: cầu ao (x≈199, z 50–54) chui được từ dưới ao. ✅ không còn – ao cũ đã bỏ; công viên mới (Đại công viên Hồ Ngọc) có vành mép hồ chặn nên không lội xuống gầm 2 cầu được (phiên công viên xác nhận 15/11)
- Nhấp nháy nhỏ còn lại (2 khối trùng mặt, cần sửa hình): lan can cầu Downtown (x 58–72, y .2, z −10) · sàn gỗ dãy biệt thự Biển Xanh (−40, .14, 46) · tường trắng Đảo Siêu biệt thự (−94, 1–3.5, 106.7) · xe cứu hoả (245, .9, 272.7) · gạch lát cổng Đại công viên (205.6, .07, 21.4). ⬜
- Tất cả nhân vật đứng yên (bảo vệ, nhân viên…) trước đây dang tay chữ T → đã sửa gốc trong `makeActor.play` (world.html). ✅

## C. Bộ rà tự động (chạy trong game qua CDP – xem `tools/qa/`)
| Script | Tìm gì |
|---|---|
| `audit.js` | sàn/cầu/thềm chui được từ dưới, không bước lên được, lối vào bị chặn |
| `heightaudit.js` | bản đồ độ cao toàn thế giới: chỗ người/xe lún dưới mặt nhìn thấy |
| `roadprobe.js`, `roadblock.js` | bánh xe lún trên đường xe; vật cản đặt giữa đường |
| `jumps.js` | mọi điểm nhảy + góc phụ: rơi xuống nước? camera bị che? **nhấp nháy (z-fighting)** kèm toạ độ 2 mặt trùng; xuất ảnh ghép để soát bằng mắt |
| `cdp.py`, `serve_nocache.py` | chạy script trong Edge headless: `python cdp.py <cổng CDP> job.json` (bước `evalFile`, `shot`, `save`) |

## NHẬT KÝ THAY ĐỔI (mỗi phiên tự ghi – mới nhất ở trên)
| Giờ | Phiên | File | Vùng (x0–x1, z0–z1) | Việc |
|---|---|---|---|---|
| 15/11 15:10 | đồ hoạ/QA | highland.js (thác + đài ngắm + bậc đá + lối dạo + tiếng thác), world.html (góc nhìn thứ nhất: setView/firstPerson, HOOK.scope, phím Q, thanh gợi ý), monument.js (ống nhòm → HOOK.scope), transit.js + arena.js (không tự xoay khi góc nhìn 1) | Cao nguyên x 190–290, z −320…−170 | A2, A9 |
| 15/11 14:40 | qc-park (công viên) | traffic.js | cầu đảo x 105–136, z 10–14 · ngã ba (146,0) | Lối bộ hành Nam cầu đảo khớp vạch qua đường nhánh Nam đại lộ x=146 (z 11,4–14,2); thêm cột đèn tín hiệu + đèn người đi bộ đứng trên lối bộ hành cầu (góc ngã ba ngoài đất trước đây bị bỏ) → người từ cầu chờ đèn rồi qua vạch sang vỉa hè công viên |
| 15/11 14:10 | qc-park (công viên) | traffic.js, ward.js, downtown.js | toàn thành phố 136–262, −62…480 | A13: vạch kẻ đường + vạch qua đường Downtown hiện lại (noFar cho lưới phủ cả thành phố) |
| 15/11 13:40 | qc-park (công viên) | park.js (viết lại), civic.js (mới), jobcenter.js, downtown.js, LAND_CLAIMS.md | công viên 156–242, 10–190 · bệnh viện/cứu hoả 215–261, 215–275 · trường 214–262, 305–365 · TT Việc làm 166–186, 256–273 | Đại công viên Hồ Ngọc + khu công cộng; TT Việc làm lùi 6 m khỏi đường z=290; thanh chặn lan can cầu đảo không còn lấn làn xe máy x=146 |
| 15/11 12:00 | qc-park (công viên) | world.html (CITY), roads.js (mới), traffic/transit/downtown/ward/nav/jobs/bots/streetlife.js | 136–262, −62…480 | Quy hoạch lại thành phố: đường 2 làn ô tô + 1 làn xe máy mỗi chiều, đèn đường theo vỉa hè, dời toà nhà theo khối |
| 15/11 14:00 | phiên chính (tích hợp) | toàn bộ quy hoạch thành phố + bot đi bộ + ghế nhiều chỗ | Downtown, Phường, Hồ Ngọc x 156–242 z 10–190 | Test tích hợp: 0 lỗi tải, cầu Phường→đồi đi được, xoắn ốc không kẹt, taxi có tuyến lên đồi, bot đi bộ chạy → đẩy GitHub. Còn: lối đi bộ cầu đảo (|z| 10–14) đổ thẳng vào làn xe máy đại lộ x=146 (thiếu vỉa hè Tây) |
| 15/11 13:30 | phiên chính | monument.js, mountaintown.js | tháp QC (380–404, 158–182, y 32–52); nhà sàn Phố Núi dọc đường xoắn ốc | A10: lan can giếng trời + tay vịn xoắn chừa khe đúng lối cầu thang (không còn vạch chắn ngang), hết khe rơi 2 bên chiếu nghỉ, camera trong tháp lùi 6,2 m. A11: mái hiên/đèn lồng nhà sàn tính theo mặt đất trước nhà (hết vùi trong đất) |
| 15/11 13:00 | phiên chính | world.html, traffic.js, foodstreet.js | (−3…3, −3…3); cầu x 174–182 z −109…−62; cầu x 262–274 z ±4; phố ẩm thực x 301–331 z 92–117 | Hết lún: bệ cổng quảng trường (plat .45), bó vỉa 2 cầu (plat), sàn 2 nhà hàng (plat Y+.16) |
| 15/11 12:30 | đồ hoạ/QA | QA_BACKLOG.md | – | Lập sổ việc chung |
