# QC World – Thế giới mở của Master Dashboard

> Cập nhật: 14/11/2026 – **S15 (phần 1): Đảo Master Dashboard như đảo thật** · **S8: Sửa lỗi, bản đồ, va chạm, quán xá** · Sprint 7: Nhiều người chơi · Sprint 6: Cao nguyên · Sprint 5: Giải trí · Sprint 4: Giao thông công cộng. Kế hoạch các sprint (S9–S18 đang chờ): [SPRINTS.md](SPRINTS.md)

### S15 (phần 1) – Đảo Master Dashboard như đảo thật (14/11)
- **🌊 Sóng vỗ bờ** quanh đảo chính + đảo nghỉ dưỡng: viền bọt trắng tràn lên bãi rồi rút, vệt cát ướt, các lớp sóng bạc đầu từ ngoài khơi vào (1 lượt vẽ mỗi đảo).
- **🌴 Rặng dừa dày** (~77 cây mới, vẽ theo lô nên chỉ ~15 lượt vẽ), tàu lá **đung đưa theo gió**.
- **🛖 6 nhà chòi lá** (sàn gỗ, mái tranh, bàn + 2 băng ghế ngồi được, võng nằm được) · **🛟 2 chòi cứu hộ** – đi cầu thang phía sau **leo lên sàn cao 2,6 m** ngắm biển · **🛶 6 thuyền thúng** ngồi được · **⛱️ 9 bộ dù + ghế tắm nắng** nằm được · **🪨 ghềnh đá** ven bờ.
- **🦀 Cua** bò ngang trên cát, thấy người lại gần là chạy, sát quá thì chui xuống cát · **🕊️ hải âu** bay lượn vỗ cánh.
- **🔊 Âm thanh môi trường** tự tạo (WebAudio, không tải file): sóng vỗ to dần khi lại gần bờ, gió (to hơn trên cao), hải âu kêu, **tiếng bước chân theo mặt đất** (cát · cỏ · đường nhựa · sàn gỗ). Bật/tắt: **⚙ Đồ hoạ → Âm thanh môi trường** (âm thanh bắt đầu sau cú bấm/phím đầu tiên – quy định trình duyệt).

### S8 – Sửa lỗi, bản đồ, va chạm, quán xá (14/11)
- **Nhân vật**: dùng lại đúng động tác gốc như bot (bỏ phần chỉnh thân trên S3.1), tốc độ ngang bot (đi 1,35 · chạy 3,4 m/s). Chỉ khi **ngồi xe** thân trên đứng yên (chân tay bám bàn đạp/tay lái).
- **Bị chặn = đứng yên tại chỗ + báo lý do** (không bao giờ bị đá về chỗ khác): mép nước (🌊 …thuê thuyền ở Bến cảng), cổng sân bóng / concert / rạp cần vé. Hết khe hở ở đầu cầu Khu Giải trí và cầu Cao nguyên (trước đây bị kéo về đảo). Đang ở trong sân/rạp thì cổng luôn mở để ra.
- **Không đi xuyên xe**: xe buýt, taxi là khối đặc. Đi bộ/xe chạy chậm chạm vào chỉ bị chặn; **đạp xe nhanh đâm vào thì té xe** (ngã ~1,5 giây rồi tự đứng dậy tại chỗ).
- **🗺️ Bản đồ thật (phím M)**: địa hình, đường xe, cầu, nhà cửa, tên các khu, 50+ biểu tượng địa điểm (rê chuột xem tên, bấm để bay tới), xe buýt đang chạy, **mũi tên vàng “Bạn ở đây”** + dòng “Bạn đang ở: …”, nút 📍 *Tôi đang ở đâu*; lăn chuột phóng to, kéo để di chuyển; M lần nữa để đóng.
- **🍹 Quán xá sống động** (quán Ngắm Biển, phố ẩm thực Fun Park): khách bot ra quầy gọi đồ rồi mang ly ra bàn; đi **theo cặp** thì ngồi chung bàn **nói chuyện qua lại**; đi **một mình** mà bạn ngồi xuống chung bàn → bot **chào và hỏi thăm** (đang làm ở đâu, ở khu nào, có hay đi concert…), nhân vật bạn trả lời theo đúng tình trạng của bạn.
- Phòng **Vận hành**: dàn màn hình giám sát quay đúng về phía bàn trực. **Lễ tân → Vào phòng phỏng vấn**: đưa thẳng tới bàn HR và bắt đầu 5 câu hỏi.

### Sprint 7 – Nhiều người chơi (14/11)
- **👥 Online** (nút trên thanh công cụ hoặc phím **J**): nhập địa chỉ server → thấy **người chơi thật** đi lại trong thế giới (đúng avatar đã chọn trong Hồ sơ, tên + màu trên đầu), **chat chung** bằng phím T như cũ (bong bóng chữ trên đầu người gửi + khung chat), **cử chỉ 1–6** hiện cho mọi người, thông báo ai vào/ra. Chuyển động người khác được **nội suy** (trễ 160 ms) nên mượt dù mạng chỉ gửi 10 gói/giây.
- **Server riêng** `multiplayer_server.py` (chỉ dùng thư viện có sẵn của Python): chỉ chuyển tiếp vị trí / tên / chat / cử chỉ – **không chứa token, không đọc db.json hay dữ liệu Dashboard, không phục vụ file, không ra Internet, không lưu gì**. Chỉ nhận kết nối từ trang game chạy ở 127.0.0.1/localhost (trang web lạ bị từ chối 403), chống spam chat, tối đa 32 người.
  - Chơi nhiều cửa sổ trên 1 máy: chạy **`ChoiNhieuNguoi_Server.bat`** (chỉ nghe 127.0.0.1:8790) → trong game bấm 👥 Online → Kết nối.
  - Chơi với bạn **cùng mạng LAN**: máy chủ chạy **`ChoiNhieuNguoi_Server_LAN.bat`** (cửa sổ server in địa chỉ `ws://IP:8790`; Windows có thể hỏi mở tường lửa – bạn tự quyết). Máy khác mở **QC World của họ** (127.0.0.1:8770) → 👥 Online → nhập địa chỉ đó.
  - Tắt server: đóng cửa sổ server. Có tuỳ chọn “Tự kết nối khi mở game”.

### Sprint 6 – Cảnh quan & thành phố mới: Cao nguyên Bình Phan (14/11)
Đi tiếp phố **x=178 ra bờ Bắc Downtown** → **cầu 50 m** sang vùng đất mới (taxi + bản đồ M đều tới được):
- **⛰️ Dãy núi đá** bao phía Bắc/Đông/Tây (đỉnh ~63 m), **🌲 rừng ~2.100 cây** (thông + cây lá rộng, chỉ 2 lượt vẽ nhờ InstancedMesh), **🌊 sông** chảy từ núi qua **thác nước cao ~24 m** (rèm nước chảy, bọt, sương mù, đá) xuyên phố cổ rồi ra biển.
- **🏮 Phố cổ Riverside** kiểu Hội An: 18 nhà nhiều màu mái ngói, ban công, cửa chớp, đèn lồng trước cửa; 2 phố lát đá hai bên sông, **2 cầu gỗ cong** sơn đỏ, **dây đèn lồng giăng ngang phố**, chợ đêm ven sông, người dạo phố. Ban đêm cửa sổ + đèn lồng sáng lung linh (quầng sáng, không cần hậu kỳ).
- **🛕 Chòi ngắm cảnh** trên đỉnh núi (E: ảnh toàn cảnh).
- **Bầu trời sống động** (mọi nơi): ☁️ lớp mây trôi đổi màu theo giờ (trắng ban ngày, cam hồng hoàng hôn, xám xanh đêm), 🏔️ dãy núi xa ở chân trời tạo chiều sâu, 🌕 trăng + quầng sáng; đêm sáng trăng hơn trước. Chỉ thêm ~4 lượt vẽ.
- Hiệu năng: địa hình = 1 lưới (lấy mẫu sẵn 2 m, va chạm khớp hình vẽ), rừng 2 lượt vẽ, nhà phố gộp khối; khi đứng trong phố cổ nhìn về núi chỉ ~36 lượt vẽ.

### Sprint 5 – Giải trí: Khu QC Fun Park (14/11)
Khu đất mới **phía Đông Downtown** (qua cầu ngắn cuối đại lộ z=0; taxi + bản đồ M đều tới được):
- **⚽ Sân bóng QC Arena**: khán đài 4 phía + mái che, ~700 cổ động viên nhún nhảy (cả sân nhảy lên khi có bàn thắng), 4 cột đèn pha, bảng tỉ số điện tử. **QC FC vs Bug United** đá liên tục (5 người/đội: dẫn bóng, chuyền, tranh bóng, sút, thủ môn cản phá; 90 phút trận = 6 phút thật, có nghỉ giữa hiệp). Vé **20 💰/30 phút** mở cổng → ngồi hàng ghế đầu khán đài Nam (C) → bấm **B** bật **góc máy truyền hình** bám theo trái bóng.
- **🎤 QC Live Arena**: sân khấu giàn thép, màn LED lớn + 2 màn phụ, 8 đèn quét đổi màu, laser, ca sĩ “Bình Vip Pro” + DJ “Anh trai say Salary”, ~350 khán giả nhảy theo nhịp. **Nhạc tự tạo bằng WebAudio** (trống, bass, hợp âm, giai điệu 124 BPM – không cần mạng, nhỏ dần khi đi xa, tự tắt khi đang mở nhạc YouTube). Diễn 3 phút / nghỉ 1 phút. Vé **30 💰** vào khu sát sân khấu.
- **🎬 Rạp QC Cinema**: mặt tiền neon + poster, vào trong được (phòng tối, 5 hàng ghế bậc thang, màn 24 m). Ngồi xuống là xem phim hoạt hình ngắn **“Cuộc săn Bug”** (7 cảnh về nghề QC, vẽ bằng canvas). Vé **15 💰**; quầy **🍿 bỏng ngô** (nhanh hơn 5 phút).
- **🍜 Phố ẩm thực**: Phở Bình Phan · Cơm tấm QC · Bánh mì Test Case · Trà sữa Regression – gọi món (có xác nhận) được **buff ngay**: ⚡ nhanh hơn 40% hoặc ☕ thưởng quiz +20% trong 5–30 phút; bàn ăn có ô dù ngồi được.
- **🎡 Vòng quay QC Eye**: cao 33 m, 12 cabin màu, vành đèn đổi màu ban đêm. Vé **15 💰** quay 1 vòng (~1 phút), camera lượn ngắm toàn thành phố.

### S4.1 – Đồ hoạ (14/11)
- **🎬 Hậu kỳ điện ảnh** (thư viện miễn phí *postprocessing* của pmndrs, giấy phép Zlib, để sẵn trong `vendor/addons/pmndrs/` – chạy offline): bloom (đèn, biển hiệu, cửa sổ ban đêm toả sáng), tone mapping ACES, tăng màu nhẹ, viền tối. **Mặc định bật ở mức Vừa/Cao, tắt ở mức Thấp** (card tích hợp tốn thêm ~9–14 ms/khung) – bật/tắt trong **⚙ Đồ hoạ → Hậu kỳ điện ảnh**.
- **✨ Quầng sáng giả** cho máy yếu: mọi đèn đường, đèn pha sân bóng, đèn giàn sân khấu có quầng sáng mờ ban đêm – tất cả chỉ 1 lượt vẽ.

### Sprint 4 – Giao thông công cộng (14/11)
- **🚌 Xe buýt Tuyến 01** (vé 5 💰, đi bao nhiêu trạm cũng được): chạy vòng **Đảo → cầu → Downtown → Phường Khởi Nghiệp → Downtown → cầu → Đảo**, 9 trạm có mái chờ, bảng tên, quảng cáo phát sáng, khách đứng chờ (lên xe khi xe đỗ). 3 xe chạy đều nhau, giảm tốc vào cua/vào trạm, mở cửa, chờ khi bạn đang mua vé, dừng + bóp còi nếu bạn đứng chắn đường. Tới trạm: bấm **E** ở mái chờ → chọn trạm xuống → xe tự thả bạn xuống; đang đi bấm E khi xe dừng để xuống sớm. Trên mái chờ có nhãn “xe tới sau ~N giây”.
- **🚡 Cáp treo Vịnh Bình Phan** (vé 10 💰): ga Đảo (bờ Đông Bắc) ⇄ ga Downtown, trụ thép giữa biển cao 26 m, 8 cabin kính chạy vòng (chậm lại trong ga cho khách lên/xuống). Lên cabin camera tự lượn chậm để ngắm vịnh, cầu dây văng và Downtown; tới ga bên kia tự xuống. Ban đêm cabin + cửa sổ xe buýt sáng ấm, đèn báo đỏ trên trụ nhấp nháy.
- **🚕 Taxi**: bấm **X** khi đứng gần đường (vòng đảo, cầu, phố Downtown/Phường) → xe chạy tới đón theo đường thật → **E** lên xe → chọn 1 trong ~25 điểm đến (quảng trường, sân khấu, bến cảng, các toà công ty, chợ, showroom, trung tâm việc làm, nhà trọ, 2 ga cáp treo…). Giá = 10 💰 + 1 💰 / 20 m đường. Đang đi bấm **X** để đi nhanh.
- Bản đồ (M) có thêm 2 ga cáp treo + trạm buýt Đầu cầu Downtown; mọi khoản tiền đều hỏi xác nhận trước.

### S3.1 – bớt giật khi di chuyển (14/11)
- **Thân trên đứng yên khi đi / chạy**: chỉ hông + chân cử động, lưng – vai – tay – đầu giữ cố định (clip đi/chạy được lọc lại lúc tải, bù xoắn hông vào đốt sống) → ở 30 FPS không còn cảnh tay vung nhanh trông như giật.
- **Đạp xe chậm, thân trên im**: bàn đạp tối đa ~60 vòng/phút (trước ~145), chỉ đạp khi giữ ga, thả ga thì chân đứng yên cho xe trôi; tốc độ xe giữ nguyên 9,5 m/s. Khi lái xe nhân vật dùng tư thế đứng yên tuyệt đối (không “thở”).
- **Nhẹ hơn ở góc nhìn đông đúc** (nhìn từ khu nghỉ dưỡng về trung tâm đảo/Downtown: 420 → ~300 lượt vẽ, CPU 18,6 → ~14 ms): vật nhỏ ở xa (đèn đường, vòng sáng, biển nhỏ) tự bỏ vẽ; vật liệu màu trơn gộp chung bất kể độ nhám/kim loại (lưu theo đỉnh); bảng hiệu canvas không phát sáng xếp chung vào ảnh gộp (atlas).

### Sprint 3 – Học tập (14/11)
- **📚 Toà Giáo trình** (bờ Tây đảo, miễn phí): sảnh-thư viện (kệ sách, bàn đọc, thủ thư, **sơ đồ khoá học** – bấm E để chọn khoá) + **6 tầng lớp học** theo `data/courses.json` (17 khoá · 128 bài, phòng P.101 → P.603). Mỗi phòng có **giảng viên đứng giảng, màn chiếu tự chạy slide** của khoá, học viên ngồi học. **Ngồi vào ghế trống → mở bài học**; xong 1 bài +10 💰, xong cả khoá **🏅 chứng chỉ +100 💰**.
- **🎓 Học viện QA** vào được: phòng thi trắc nghiệm có giám thị, ngồi vào máy là làm quiz (380 câu có sẵn).
- **🧠 Bộ não phát sáng** trên đỉnh tháp Brand QA (đồ hoạ: vân não chạy sáng, vòng hào quang, hạt neuron) – phần xử lý sẽ gắn từ dự án khác.

### S2.4 – Showroom ô tô (14/11)
- **🚗 QC Auto Showroom** (Phường Khởi Nghiệp) bước vào được: sảnh lớn 44×28 m, 11 ô tô trên bục có đèn (xe chính quay trên bàn xoay) + 3 xe tay ga, quầy lễ tân, khu chờ.
- **Tư vấn viên** ra đón: *Nghe giới thiệu* (dẫn đi từng mẫu) hoặc *Bỏ qua*; bấm E cạnh anh ấy để bỏ qua giữa chừng.
- **5 mẫu ô tô**: Mini Hatch 4.500 · Sedan S 6.000 · Pickup 8.000 · SUV 7 chỗ 9.000 · Sport GT 15.000 💰 (Sport chạy nhanh nhất). Bấm E ở bảng thông số → chọn màu → mua (có hỏi xác nhận). Xe mới thay xe cũ, đỗ trước showroom, bấm V để lái.

### S2.3 – Đảo nghỉ dưỡng (14/11)
- Bỏ các ngôi nhà sau màn hình tool (màn hình + vòng đứng vẫn giữ) → **quảng trường trang trí theo chủ đề**: vọng lâu, vòm hoa, bánh răng xoay, tháp đèn, pha lê phát sáng, đài phun nước, vườn nhiệt đới, đuốc tiki.
- **Bờ Tây Nam nới rộng** thành khu nghỉ dưỡng: **🏠 Nhà nghỉ Hoa Sứ** (thuê 80 💰/ngày), **🏡 3 Biệt thự Biển Xanh** (6.000 💰, hồ bơi riêng, ghế tắm nắng), cầu gỗ sang **🏝️ Đảo Siêu biệt thự** (3 căn 30.000 💰, hồ bơi vô cực trên sàn gỗ nhô ra biển).
- Nhà nào cũng **vào & ở được**: cửa tự mở cho chủ nhà, nội thất thật (phòng khách, TV, bếp, bàn ăn, phòng ngủ, phòng tắm), ngủ qua đêm, đặt làm nơi xuất hiện, nấu ăn (+tốc độ). Vào nhà thì mái + nửa trên tường tự ẩn để nhìn được bên trong.
- **🍹 Quán nước Ngắm Biển** (bờ Đông Nam): quầy bar mái lá, ghế quầy, bàn dù hướng biển, gọi nước dừa/cà phê/sinh tố. **🌴 Võng** giữa 2 cây dừa và ghế tắm nắng: nằm thư giãn (E/C).

### S2.2 – Công ty như thật (14/11)
- **Nhiều người khác nhau**: mỗi bot là 1 người riêng (giới tính, chiều cao, màu da, áo, quần/váy, giày, kiểu tóc, mũ, kính) – sinh từ khung Xbot (`js/people.js`), 1 lượt vẽ/người. Bot ngoài phố, trong toà, nhà ăn… đều dùng.
- **Nội thất theo loại công ty**: *Outsource* (Nhân sự, Dev, QA, Dự án PM/BA) · *Product* (thêm Sản phẩm & Thiết kế, Kinh doanh, Marketing, Kế toán, Vận hành & CSKH). Mỗi phòng ban có màu thảm, màn hình máy tính, phòng họp kính có người thuyết trình, **khu đặc trưng** (lab thiết bị + Bug Board, góc server + Kanban, bảng doanh số + tủ cúp + chiêng, góc chụp ảnh + moodboard, tủ hồ sơ + két sắt, tường màn hình giám sát, phòng đào tạo…), pantry, lounge, tranh treo tường.
- **Bot trò chuyện**: từng cặp nói chuyện luân phiên (họp, ghé bàn hỏi việc, pantry, nhà ăn).
- **Phỏng vấn**: phòng phỏng vấn ở sảnh mỗi toà – **5 câu QA/QC, sai 1 câu là trượt** (thử lại sau 2 phút; toà 🔒 câu Vừa–Khó). Đậu → **thẻ nhân viên đeo trước ngực**, **quẹt thẻ ở cổng** để chấm công (lương ngày).
- **Một ngày đi làm** (bảng “Việc hôm nay” góc trái): quẹt thẻ → họp Daily → **ngồi bàn của bạn (vòng vàng) mở máy tính**: Jira (chạy test run, log bug, verify bug), Email PM, Chat nhóm, Báo cáo cuối ngày → thưởng.
- **Khách tham quan**: nhờ lễ tân gọi **hướng dẫn viên** – chị ấy dẫn qua cổng, lên từng tầng, giới thiệu từng phòng ban (bấm E cạnh chị ấy để tự đi). Không có thẻ/không đi cùng hướng dẫn viên thì không lên tầng được.

### S2.1 – sửa lỗi sau khi test S2 (14/11)
- **Bớt giật khi đi/đạp xe:** bóng đổ vẽ bằng *khối bóng gộp riêng* (mỗi ô 48 m gộp mọi vật đổ bóng thành 1 khối, chỉ hiện trong lượt vẽ bóng) → lượt vẽ bóng ~144 → ~60, CPU mỗi khung có bóng giảm ~17 → ~7–10 ms; bóng cập nhật mỗi 2 khung (trước 3); mặt trời dịch theo đúng bước điểm ảnh bản đồ bóng → **viền bóng nhà/cây không còn rung** khi di chuyển; sàn LED 28 ô → 1 lượt vẽ (nháy trong shader); người/thú ở xa > 100 m không vẽ (máy yếu).
- **Hết mất hình nhân vật khi đổi tầng** trong toà nhà (lỗi: dọn tầng cũ giải phóng hình dùng chung giữa bot và người chơi).
- **Tư thế ngồi trong toà nhà** (trước chỉ đúng ở ngoài trời) + **tư thế bật nhảy** (co gối, vung tay).
- **Hỏi xác nhận trước mọi khoản chi** (mua đồ, gia hạn, xây nhà, sơn nhà, ăn trưa, mua đất): hiện giá + số dư trước/sau.
- **Vòng sáng vàng trước cửa mọi toà công ty** – đứng vào bấm E để vào; dời chỗ đứng vào sát cửa (dưới mái che), bỏ cây/cột đèn chắn lối vào.
- Giám đốc các toà: Bình Vip Pro, Bình Phan, Bình Internship, Anh trai ốp pồ, Anh trai say Salary (mỗi toà cố định 1 người). Đổi tên công ty cũ thành “Bình Phan” (toà *Bình Phan Tech Hub*, biển *BÌNH PHAN QUALITY HUB*; mật mã pháo hoa: gõ `binhphan`).

### Sprint 2 – Tách vùng & khởi nghiệp (14/11)
- **2 vùng:** 🏝️ *Đảo Master Dashboard* = **miễn phí** (tool, học, quiz, concert). Qua **cổng “Thế giới mở”** ở đầu cầu phía Đông là 🌆 *thế giới mở* (Downtown + **Phường Khởi Nghiệp**): chợ, xe, đất, nhà hàng tính phí. Thanh trên cùng luôn hiện bạn đang ở vùng nào.
- **Phường Khởi Nghiệp** (nối liền bờ Nam Downtown, đi qua 2 nhánh đường): Chợ QC, Showroom xe, Văn phòng địa chính, 12 lô đất (R1–R8, B1–B4) đã chuyển sang đây; thêm **Trung tâm Việc làm**, **Nhà trọ khởi nghiệp** (phòng 1 cấp miễn phí: ngủ, đặt làm nơi xuất hiện), quầy **Bếp Cơm**. Chỗ cũ trên đảo thành bãi biển công cộng + đất dự trữ cho Toà Giáo trình (Sprint 3).
- **Trung tâm Việc làm** (E ở trước cửa):
  - 💪 *Việc chân tay* – dọn rác phố, giao hàng (nhận ở Chợ QC, giao tới cột sáng vàng), phụ bếp (chọn nguyên liệu đúng thứ tự); 3 mức Dễ/Vừa/Khó, có giờ hẹn.
  - 🧠 *Việc trí tuệ* chấm tự động ngay trong game: **SQL** trên DB mẫu nhà thuốc (4 bảng, có cài sẵn “bug dữ liệu” để tìm), **đọc API/JSON**, **tìm bug theo spec**, **thiết kế test** (BVA, bảng quyết định), **viết code JS** (chạy test trong Web Worker). Dễ 40 · Vừa 90 · Khó 180 💰; làm lại bài cũ 25%.
  - 🏢 *Xin việc công ty*: đủ số việc trí tuệ → ký hợp đồng → vào được toà 🔒 SecureQA / DevOps Center, mỗi ngày vào toà công ty **chấm công nhận lương**, việc trí tuệ +25%.
- Sửa/thêm bài ở `data/jobs.json` (có ghi chú cấu trúc). SQL mini hỗ trợ SELECT/JOIN/LEFT JOIN/WHERE/GROUP BY/HAVING/ORDER BY/LIMIT/CASE (chưa có truy vấn con).

### S1.2 – sửa lỗi sau khi test (14/11)
- **Hết giật khi đi ngang:** số lượt vẽ mỗi khung giảm ~1.100 → ~220 (gộp vật liệu màu trơn, tách hộp nhiều vật liệu, gộp bồn hoa/nhà/xe, Robot 19 mảnh → 3, chỉ vẽ nhân vật trong khung nhìn); màn hình LED sân khấu vẽ thưa + nhỏ hơn; camera kéo vào/nhả ra mượt khi bị nhà/cây che. **⚙️ Đồ hoạ → Nhịp khung hình**: *Tự động* (máy không giữ nổi 60 FPS thì khoá **30 FPS đều**, góc FPS hiện “khoá đều”), *Khoá 30*, *Không khoá*.
- **Đạp xe không còn gãy chân** (quẹo quá 90° làm lật trục xoay → chân gập ngược; đã sửa).
- **Màn hình Dashboard:** đứng ở **vòng sáng trước mặt màn hình** bấm E là dùng được.
- **Ngồi được thật:** ghế đá (2 chỗ), bàn picnic (4 chỗ), ghế/sofa/ghế đẩu trong toà nhà. Bấm **E** ở ghế hoặc **C** để ngồi ghế gần nhất; E/C/phím di chuyển để đứng dậy.
- Mở lại sau khi cập nhật: chỉ cần **F5** trong cửa sổ game (server không cache code). Nếu tắt hẳn thì mở lại bằng `QCWorld.vbs` – launcher tự dọn server cũ.

### S1.1 – sửa lỗi sau khi test (14/11)
- **Mở lại sau khi cập nhật:** chỉ cần chạy `QCWorld.vbs`. Launcher tự tắt server QC World cũ còn sót, bật `serve.py` (không cache code), chờ server sẵn sàng rồi mới mở Edge. Lần đầu sau cập nhật, bấm **Ctrl+F5** trong cửa sổ game để bỏ code cũ đã cache.
- Lỗi “127.0.0.1 didn’t send any data” (ERR_EMPTY_RESPONSE) là do server cũ của launcher bản trước. Server đó chạy không cửa sổ (pythonw) và trả trang rỗng. Bản launcher mới tự dọn nó.
- **⚙️ Đồ hoạ** (nút trên thanh trên cùng): Tự động / Thấp / Vừa / Cao. Máy dùng card tích hợp (Intel Iris Xe…) tự chọn Thấp.
- **Dùng tool Dashboard ngay trong game:** cạnh mỗi nhà tool có màn hình lớn → bấm E → camera bay tới, trang Dashboard thật hiện trên màn hình (chuột/bàn phím dùng bình thường). Esc hoặc nút “Rời màn hình” để quay lại; “Mở tab riêng” nếu cần.
- **Nhân vật:** Robot QC (đủ động tác gốc), Anh Lính, Ma-nơ-canh (đổi ở 👤 Hồ sơ). Phím 1–6: vẫy · nhảy múa · đấm · like/cổ vũ · gật · lắc.

### Sprint 1 – có gì mới
- **Downtown · QC City** (qua cầu dây văng phía Đông): lưới phố, vạch qua đường, đèn đường, cây xanh, công viên trung tâm; **13 toà công ty** 28–108 m, 8 kiểu (kính, bậc thang LED, trụ tròn xoắn LED, xoắn vặn, chóp kính, art-deco đỉnh vàng, gạch, HQ có sân bay trực thăng), cửa sổ sáng đèn về đêm.
- **Vào trong toà** (E ở cửa): cảnh nội thất riêng nên rất nhẹ máy; **thang máy** chọn tầng; **sảnh** (lễ tân chào khách, bảo vệ, cổng từ, sofa), **văn phòng** (dãy bàn có màn hình code/test report/Jira/biểu đồ, bot ngồi gõ máy, phòng họp kính có bot thuyết trình Sprint Review, pantry), **nhà ăn** (quầy cơm, bot xếp hàng, bot ngồi ăn, mua cơm 25 💰 = tăng tốc 10 phút), **phòng giám đốc** (giám đốc + thư ký, sofa, tủ sách, cúp). Bot tự nói chuyện khi bạn lại gần.
- 2 toà **chỉ dành cho nhân viên** (SecureQA, DevOps Center) có bảo vệ canh cửa – mở ở Sprint 2 (xin việc).
- **Xe đạp miễn phí** cho người mới (bấm V).
- Dữ liệu: `data/questions.json` (380 câu QA/QC, 10 chủ đề) và `data/courses.json` (17 khoá · 128 bài · 736 slide, dùng ở Sprint 3); nguồn để sửa nằm ở `data/questions_src/` và `data/courses_src/`.

Thành phố đảo 3D chạy **local** trên máy. Các ngôi nhà ở khu trung tâm mở đúng tool của Master Dashboard (Wiki, Plan, API Client, Database…). Quanh đó là một thành phố sống động: tháp Brand QA·QC·QE, Học viện QA, chợ, showroom xe, bến cảng, khu dân cư, bot đi làm, thú cưng, nhà hàng…

Master Dashboard (`..\Master Dashboard`) **không bị sửa gì**: bạn vẫn mở riêng như cũ khi không cần thế giới mở.

## Mở / tắt

| Việc | Cách làm |
|---|---|
| Mở | Double-click **`QCWorld.vbs`**: tự bật Master Dashboard chạy ngầm (nếu chưa chạy) + web server nhỏ `http://127.0.0.1:8770` (chỉ máy này vào được) + mở Edge. |
| Mở dự phòng | `Mo_QCWorld.bat` |
| Tắt thế giới | `Tat_QCWorld.bat` (Dashboard vẫn chạy) |

Nhạc YouTube cần Internet; mọi thứ khác chạy offline. Tiến trình chơi (tiền, đồ, đất, thú cưng) lưu trong trình duyệt (`localStorage`: `qcworld-save`, `qcworld-profile`).

## Điều khiển

`WASD` đi · `Shift` chạy · `Space` nhảy · `E` tương tác · `C` ngồi ghế gần nhất · `F`/`2` nhảy múa · `1` vẫy tay · `3` đấm · `4` cổ vũ · `5` gật đầu · `6` lắc đầu · `T`/`Enter` chat · `G` ném rác đang cầm · `V` lên/xuống xe · `I` túi đồ · `P` hồ sơ · `N` ngày/hoàng hôn/đêm · `M` bản đồ (bay tới) · `H` hướng dẫn · chuột kéo xoay / lăn zoom.

## Bản đồ thành phố

| Hướng | Khu | Có gì |
|---|---|---|
| Giữa | Phân khu Công cụ | Cổng Trang chủ + 8 nhà tool Master Dashboard (dùng thật), quảng trường, bồn hoa, ghế, kiosk Quiz |
| Bắc | Sân khấu + Bến cảng | Concert (YouTube, sàn LED, VIP lên sân khấu), cầu tàu 40 m, câu cá, bến thuyền, Nhà thuyền |
| Nam | Tháp Brand QA·QC·QE | Tháp kính 50 m, logo phát sáng, đài phun nước, **QA Brain** (phân tích tài liệu, sinh test case, xuất CSV); Học viện QA |
| Đông | Bãi biển công cộng + cổng “Thế giới mở” | Đầu cầu sang Downtown (vùng tính phí) |
| Tây | Đất dự trữ | Toà Giáo trình (Sprint 3) |
| Qua cầu | Downtown + Phường Khởi Nghiệp | 13 toà công ty; Chợ QC, Showroom, Địa chính, 12 lô đất (R1–R8 ở, B1–B4 quán), Trung tâm Việc làm, Nhà trọ, Bếp Cơm |
| Vòng | Đường vành đai | Đường nhựa có vạch kẻ, đèn đường, thùng rác |

## Kinh tế

- **Kiếm tiền**: 🧑‍💼 Trung tâm Việc làm (việc chân tay 30–140 💰, việc trí tuệ 40–180 💰, lương công ty 60–120 💰/ngày) · quiz QA/QC ở 🎓 Học viện / kiosk (đúng: 20 · 35 · 55 💰 theo độ khó, chuỗi đúng có thưởng; sai không mất gì; câu đã thuộc còn 5 💰) · nhặt rác bỏ thùng (+6, ném trúng +12) · tưới hoa (+5) · câu cá (12–170) · thu hoạch rau (18–240) · thu tiền quán (4–9 💰/phút, tích luỹ cả khi offline tối đa 8 giờ).
- **Tiêu tiền**: Chợ QC (giày, nước tăng lực, cà phê +20% quiz, cần câu, mồi, bình tưới, vé thuyền, vé concert VIP, hạt giống, thú cưng) · Showroom (xe tay ga, ô tô, chọn màu) · Địa chính (đất, xây nhà/quán/trang trại).
- Vật phẩm "1 ngày" = 24 giờ thực.

## Cuộc sống

- **Bot có nghề**: quét rác, làm vườn (tưới bồn hoa), ngư dân (câu cá → bán cho chợ), bán hàng (chào khách), bảo vệ tuần tra, chạy bộ, dân văn phòng đi ăn/nghỉ/học, fan cứng ra sân khấu nhảy khi có nhạc. Bot trả lời khi bạn chat, phản ứng khi bị đấm.
- **Thú cưng**: Shiba, mèo mướp, vẹt (nhại câu chat) – đi theo bạn, vuốt ve được. Có chó nhà hàng xóm, mèo quảng trường, cò và hồng hạc bay quanh đảo.
- **Ngồi ghế, nhặt rác, ném rác, tưới cây, câu cá, lái xe máy/ô tô/thuyền, ngủ ở nhà (sang sáng), đặt nhà chính (xuất hiện ở đó khi mở game).**

## Hiệu năng

- Gộp mesh tĩnh theo vật liệu + ô lưới 32 m (≈1.200 mesh → vài trăm khối, vẫn cắt theo tầm nhìn).
- Mặt nước không vẽ lại cỏ/bot/thú trong lượt phản chiếu; bot ở xa cập nhật thưa.
- Camera tự kéo gần khi bị nhà che. Máy yếu: tự giảm độ phân giải, tắt bloom nếu FPS < 28.
- Bóng đổ: khối bóng gộp riêng (`perf.js` → `W.SHPROXY`, world.html bọc `renderer.shadowMap.render` để chỉ hiện khối bóng trong lượt vẽ bóng); mặt trời bám lưới điểm ảnh bản đồ bóng (hết rung viền bóng).
- Không `geometry.dispose()` hình của nhân vật/bot: chúng dùng chung hình với mẫu avatar và người chơi.
- S3.1: `markFar()` (world.html) gắn `userData.farR2` cho mesh nhỏ – bước frustum của three.js bỏ qua khi ở xa hơn ngưỡng theo kích thước. Vật liệu màu trơn gộp lưu độ nhám/kim loại theo đỉnh (thuộc tính `rm`). `buildAtlas` (perf.js) gộp canvas tĩnh; canvas vẽ lại khi chơi phải đặt `texture.userData.live=true`.
- S7 `js/multi.js` (WebSocket, nội suy theo dấu thời gian server) + `multiplayer_server.py` (asyncio, tự cài WebSocket RFC 6455, kiểm tra Origin).
- S6 `js/highland.js` (vùng đất mở rộng đăng ký qua `W.EXTL` – groundH/resolve/regionAt tự nhận) + `js/skyfx.js` (mây, núi xa, trăng). Địa hình dùng nhiễu có seed → mỗi lần mở giống hệt nhau.
- S5 `js/arena.js`: Khu Giải trí (`CITY.arena` trong world.html, `inDT` gồm cả khu này). Đám đông = InstancedMesh + shader nhún (`crowd()`), cầu thủ = actor people.js + AI đơn giản; cổng có vé = hộp va chạm được gỡ/đặt lại mỗi khung. Quầng sáng: `W.GLOW.add(x,y,z,size,color)`.
- S4 `js/transit.js`: đường xe buýt là đường cong lấy mẫu đều 0,5 m (`makePath`, bo góc `roundCorners`), taxi tìm đường bằng đồ thị đường (Dijkstra) rồi dời sang làn phải; vật tĩnh dựng bằng `Kit(true)` để batchStatic gộp vào khối màu chung; 8 cabin = 3 InstancedMesh; mọi hẹn giờ trong game đếm theo khung hình (không dùng setTimeout).
- Nhân vật người chơi: clip đi/chạy qua `calmClip()` (thân trên cố định), lái xe dùng clip `ride` (1 khung đứng yên).

## Cấu trúc thư mục

```
world.html        Thế giới nền: địa hình, trời, nước, khu công cụ, sân khấu, nhân vật, camera, HOOK
js/life.js        Điều phối "cuộc sống": ví, quiz, shop, thú cưng, đất/nhà/vườn/quán, rác, ghế, cử chỉ, chat, câu cá, xe
js/city.js        Thành phố: đường vành đai, tháp Brand, Học viện, chợ, showroom, địa chính, bến cảng, bồn hoa, ghế
js/bots.js        Cộng đồng bot và nghề nghiệp
js/vehicles.js    Xe tay ga, ô tô, thuyền + điều khiển lái
js/brain.js       QA Brain (phân tích tài liệu → test case, chạy offline)
js/perf.js        Gộp mesh tĩnh/nhóm/nhân vật (giảm lượt vẽ), tối ưu phản chiếu
js/ward.js        Phường Khởi Nghiệp, cổng Rời đảo, chỉ báo vùng, nhà trọ, Trung tâm Việc làm (vỏ)
js/jobs.js        Việc làm: chân tay, trí tuệ chấm tự động, xin việc công ty
js/sqlmini.js     SQL mini chạy trong trình duyệt (chấm bài SQL)
js/screens.js     Màn hình Dashboard 3D trong game
js/nav.js         Tìm đường A* cho bot
js/people.js      Người đa dạng (giới tính, tóc, quần áo) từ khung xương Xbot · js/workpc.js  phỏng vấn, thẻ, máy tính làm việc
js/interior.js    Bên trong toà công ty · js/showroom.js  showroom ô tô · js/campus.js  Toà Giáo trình + Học viện · js/resort.js  khu nghỉ dưỡng
js/transit.js     S4: xe buýt Tuyến 01, cáp treo Vịnh Bình Phan, taxi (phím X)
js/arena.js       S5: Khu Giải trí – sân bóng, concert (nhạc WebAudio), rạp chiếu, phố ẩm thực, vòng quay
js/highland.js    S6: Cao nguyên – núi, sông, thác, rừng, phố cổ Riverside
js/skyfx.js       S6: mây trôi, núi xa chân trời, trăng
js/multi.js       S7: nhiều người chơi (phím J)
js/cafe.js        S8: khách bot ở quán nước / phố ẩm thực (gọi đồ, ngồi chill, nói chuyện, hỏi thăm bạn)
js/island.js      S15: đảo chính như đảo thật (sóng vỗ bờ, rặng dừa, chòi lá, chòi cứu hộ, thuyền thúng, cua, hải âu, âm thanh)
multiplayer_server.py   S7: server nhiều người chơi (không token/DB) · ChoiNhieuNguoi_Server(.bat / _LAN.bat) để chạy
data/jobs.json    Ngân hàng việc trí tuệ + DB mẫu
data/questions.json  Ngân hàng câu hỏi QA/QC (nếu thiếu dùng bộ dự phòng nhỏ)
data/courses.json    Giáo trình kỹ thuật cho toà Giáo trình (v4)
vendor/           three.js r160 + addons · vendor/addons/pmndrs/postprocessing.js (hậu kỳ điện ảnh, giấy phép Zlib)
assets/           Model (glTF) + texture PBR
```

**Thêm khu tool:** sửa mảng `ZONES` trong `world.html`. **Thêm nghề cho bot:** thêm hàm vào `JOBS` trong `js/bots.js` rồi `spawn(...)`. **Thêm món hàng:** thêm vào `ITEMS` trong `js/life.js`.

## Nguồn tài nguyên

- three.js r160 (MIT) và model mẫu trong repo three.js: Soldier, Michelle, Xbot (nhân vật Mixamo), RobotExpressive, Horse, Parrot, Flamingo, Stork.
- Fox (Khronos glTF-Sample-Assets): model CC0 của PixelMannen, rig/animation CC-BY 4.0 của @tomkranis (cần ghi nguồn).
- Poly Haven (CC0): texture cát/gỗ/tường/ngói; model đá, vỏ ốc, phao, cột mốc, bàn picnic, boombox.
- Dùng nội bộ team.

## Lộ trình

- **v4**: vào được bên trong toà nhà (thang máy, nhiều tầng): công ty có bot đang làm việc, phòng giám đốc, nhà ăn; toà Giáo trình nhiều tầng, mỗi phòng một khoá (Playwright, Appium, JMeter, API, DB…) có bot giảng bài; toà trung tâm có “bộ não” phát sáng (đồ họa – phần xử lý gắn từ dự án khác).
- **v5**: nhiều người chơi thật qua mạng LAN (server riêng, không chứa token/DB).
