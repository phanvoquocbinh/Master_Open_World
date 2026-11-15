# QC World – SỔ VIỆC CHUNG (QA + bố cục)

> **Quy ước cho MỌI phiên đang làm game** (Bình yêu cầu 15/11): mỗi lần sửa/xây xong, ghi 1 dòng vào mục **NHẬT KÝ THAY ĐỔI** ở cuối file
> (giờ · phiên · file · vùng toạ độ x0–x1, z0–z1 · việc đã làm). Phiên QA (phiên đồ hoạ) sẽ chạy lại bộ rà tự động trên vùng đó
> (đi xuyên, lún, vật chắn đường, điểm nhảy, nhấp nháy) và xếp lại bố cục nếu vật thể bị lệch – Bình không phải tự đi soát từng chỗ.
> Trạng thái: ⬜ chưa làm · 🔧 đang làm · ✅ xong + đã thử trong game · ➡️ đã giao phiên khác.

## A. Phản hồi của Bình – 15/11 (trưa)

| # | Hạng mục | File | Cỡ | Trạng thái |
|---|---|---|---|---|
| A1 | **Điểm nhảy (bản đồ)**: nhảy "Căn hộ Sky QC" rơi ra chỗ lạ; nhảy thác thì đứng sát vách bị che. Mọi điểm nhảy phải: đứng chỗ trống, thấy toàn cảnh, hướng nhìn không bị che | world.html `teleport` + các `PLACES.push` | vừa | ⬜ |
| A2 | **Thác nước**: rộng bề ngang hơn nhiều (kiểu Niagara), có đường đi bộ + đài ngắm sát thác, tiếng nước lớn dần khi lại gần | highland.js | lớn | ⬜ |
| A3 | **Rạp phim**: ngồi được, ngồi xong xem ở góc nhìn thứ 1; có sảnh + nhân viên soát vé + cửa + hành lang tối (đèn dịu / vạch dạ quang) rẽ trái/phải vào phòng chiếu | arena.js | lớn | ⬜ |
| A4 | **Nhấp nháy (z-fighting)**: sân bóng, băng rôn, vài cửa toà Ngoại ngữ – rà toàn bộ | arena.js, langcenter.js, … | vừa | ⬜ |
| A5 | **Chợ/cửa hàng**: bỏ kiểu quầy bấm E; xây CHỢ LỚN đi bộ vào được, mỗi gian trưng bày thật nhiều hàng (giày nhiều màu/kiểu…), xây to | ward.js, city.js, life.js (shop UI) | lớn | ⬜ |
| A6 | **Bố cục phố**: nhà nằm đủ trên phố, không chen chúc; đất dư thì dùng, thiếu thì nới đất; nhà to hơn | roads.js/ward.js/downtown.js (phiên công viên đang quy hoạch) | lớn | ➡️ |
| A7 | **Nhân viên tư vấn** (Trung tâm Việc làm) đứng dang tay chữ T → ngồi, hai tay đặt trước đùi; nội thất thêm cây/vật trang trí, bớt trắng | jobcenter.js | nhỏ–vừa | ⬜ |
| A8 | **Showroom xe**: bỏ quầy bé; showroom rộng gấp đôi, 2 tầng, ≥ 20 xe nhiều kiểu/hãng (hãng tự đặt, không dùng thương hiệu thật) | showroom.js, ward.js | lớn | ⬜ |
| A9 | **Góc nhìn thứ 1 / thứ 3** chọn được ở khu vui chơi, cáp treo, ống nhòm; ngồi tại chỗ xoay 360° | world.html (camera), transit.js, funisland.js, arena.js, monument.js | vừa | ⬜ |
| A10 | **Tháp QC**: nền trắng; mỗi tầng cao rộng hơn (camera bị thu gần); vạch/lan can vẽ chắn ngang lối cầu thang; đi vào tự té xuống cầu thang; ghế bấm được từ tầng khác rồi rớt lên rớt xuống; kiến trúc phải lớn + đẹp như biểu tượng thế giới | monument.js, life.js (ghế) | lớn | 🔧 phiên chính (ghế: xem A19) |
| A11 | **Quán ven núi**: biển tên bị ngược chữ khi nhìn từ ngoài (mặt ngoài = tên quán, mặt trong = "Cảm ơn quý khách"); mỗi quán kiến trúc khác nhau; có đầu bếp, phục vụ bưng món, món trên bàn; rộng hơn, gác lửng/2 tầng; tầng dưới bị vùi trong đất (đèn lồng sát mặt đất) | mountaintown.js | lớn | 🔧 phiên chính (trừ biển ngược chữ – phiên QA) |
| A12 | **Đường đèo** uốn vòng vèo; cỏ mọc xuyên mép đường → nắn thẳng/nới đất, dọn cỏ khỏi mặt đường | hills.js | vừa | ⬜ |
| A13 | **Vạch kẻ đường** chỗ có chỗ không (đại lộ Downtown trơn) | roads.js/downtown.js (phiên công viên) | vừa | ➡️ |
| A14 | **Văn phòng**: bảng trắng ngoài phòng họp quay sai mặt; người thuyết trình/người nghe cử động, các nhóm họp luân phiên; nhân viên đi lại, lấy nước, ăn trưa; lead/manager đi khảo sát | interior.js | lớn | ⬜ |
| A15 | **Cửa kính văn phòng** nhìn ra thành phố thật, tầng càng cao view càng cao; **phòng giám đốc**: ghế oai, thảm, bàn quay mặt ra cửa, nội thất + trưng bày | interior.js | lớn | ⬜ |
| A16 | **Lỗi**: đang ở trong toà nhà thì bấm bản đồ không nhảy ra được | world.html / interior.js | nhỏ | ⬜ |
| A17 | **Cáp treo** đi xuyên trần nhà ga; chọn góc nhìn 1/3, xoay 360° | transit.js | vừa | ⬜ |
| A18 | **Biển**: nhìn từ trên cao một vùng là biển, vùng xa trắng xoá | world.html (nước + sương) | nhỏ | ⬜ |
| A19 | **Ghế**: bấm E được từ tầng trên/tầng dưới | life.js | nhỏ | ⬜ |
| A20 | **Cột đèn đứng giữa đường** ở cổng "Thế giới mở" (đầu cầu phía đảo) – rà mọi vật thể lệch sau khi quy hoạch lại | city.js + công cụ rà | nhỏ | ⬜ |
| A21 | **Giao diện (UI)** trống trải, nhàm → làm lại đồ hoạ các bảng (chợ, hồ sơ, bản đồ…) | world.html CSS, life.js | vừa | ⬜ |
| A22 | Chất lượng chung: nội thất, hành vi nhân vật, cử động… chưa đạt – được phép dùng thư viện/tài sản miễn phí (CC0) | nhiều | – | liên tục |

## B. Còn lại từ đợt rà sáng 15/11
- Bờ Tây đảo chính (x −71…−46, |z|<14) và quanh bệ tháp Brand QA (x 11…18, z 66…74): mặt nhìn thấy cao hơn chỗ đứng ~0,6 m. ⬜
- Phố ẩm thực (x 302…330, z 94…115) tới 0,54 m; vỉa hè cầu lên Cao nguyên (x 174/181, z −109…−62) và cầu Downtown→Giải trí (x 262…274, z ±3,5) 0,22 m; 3 cầu tàu khu nghỉ dưỡng 0,15 m. ⬜
- park.js: cầu ao (x≈199, z 50–54) chui được từ dưới ao. ➡️ phiên công viên

## C. Bộ rà tự động (chạy trong game qua CDP – xem `tools/qa/`)
| Script | Tìm gì |
|---|---|
| `audit.js` | sàn/cầu/thềm chui được từ dưới, không bước lên được, lối vào bị chặn |
| `heightaudit.js` | bản đồ độ cao toàn thế giới: chỗ người/xe lún dưới mặt nhìn thấy |
| `roadprobe.js`, `roadblock.js` | bánh xe lún trên đường xe; vật cản đặt giữa đường |
| `jumps.js` | mọi điểm nhảy: đứng trong vật thể? camera bị che? |

## NHẬT KÝ THAY ĐỔI (mỗi phiên tự ghi – mới nhất ở trên)
| Giờ | Phiên | File | Vùng (x0–x1, z0–z1) | Việc |
|---|---|---|---|---|
| 15/11 13:30 | phiên chính | monument.js, mountaintown.js | tháp QC (380–404, 158–182, y 32–52); nhà sàn Phố Núi dọc đường xoắn ốc | A10: lan can giếng trời + tay vịn xoắn chừa khe đúng lối cầu thang (không còn vạch chắn ngang), hết khe rơi 2 bên chiếu nghỉ, camera trong tháp lùi 6,2 m. A11: mái hiên/đèn lồng nhà sàn tính theo mặt đất trước nhà (hết vùi trong đất) |
| 15/11 13:00 | phiên chính | world.html, traffic.js, foodstreet.js | (−3…3, −3…3); cầu x 174–182 z −109…−62; cầu x 262–274 z ±4; phố ẩm thực x 301–331 z 92–117 | Hết lún: bệ cổng quảng trường (plat .45), bó vỉa 2 cầu (plat), sàn 2 nhà hàng (plat Y+.16) |
| 15/11 12:30 | đồ hoạ/QA | QA_BACKLOG.md | – | Lập sổ việc chung |
