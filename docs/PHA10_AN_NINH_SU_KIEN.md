# PHA 10 – Hệ thống an ninh, cứu hộ & sự kiện đường phố (đặc tả của Bình, 16/11/2026)

> Bản gốc Bình gửi phiên chính. Làm SAU khi V2 có mạng đường cho xe (`W.roadNet`) và xe bot chạy trên đường (việc "xe hơi + người đi bộ trên đường phố V2").
> Áp dụng mọi luật ở `V2_PLAN.md` mục 3 và 3b (lối đi không vật chắn, khối liền, không chớp, emoji Windows 10, thang `liftkit.js`…).
> Ghi chú tích hợp: `life.js` / `v2core.js` là file phiên chính – module mới export `make(W, ctx)`, phiên chính móc nạp.

## 1. Đồn cảnh sát & tuần tra (`js/police_station.js`)
- Vị trí đề xuất: "Sở Cảnh Sát QC City · 113" tại x 215 → 255, z 278 → 302 (vùng CBD – phiên làm phải kiểm đất trống, lệch được nếu vướng; ghi vào LAND_CLAIMS.md). Cao 3 tầng, tông Xanh Navy – Trắng – Vàng Kim, bãi đáp trực thăng trên mái, 3 gara mở phía trước.
- Nội thất đi bộ vào được: Sảnh trực ban 113, Phòng chỉ huy bản đồ an ninh, Khu phòng giam tạm giữ (song sắt, nhốt trộm bắt ngoài phố). Lên tầng bằng `liftkit.js` hoặc cầu thang có plat từng bậc.
- Tuần tra thường trực:
  - 4 xe cảnh sát "QC Police Interceptor" trắng–xanh, thanh đèn LED đỏ–xanh trên nóc, chạy liên tục trên `roadNet`.
  - 8 cảnh sát đi bộ (sắc phục, mũ kê-pi) tuần dọc vỉa hè chính ở Abyssal, River Tech CBD và Dev City.

## 2. Bộ điều phối sự kiện (`js/world_events.js`)
Hẹn giờ kích hoạt luân phiên các sự kiện gần người chơi (bán kính 20–45 m). Có phím tắt hoặc menu Debug trong Laptop để gọi thử ngay bất kỳ sự kiện nào.

### A. Trộm móc túi & cảnh sát truy đuổi trả lại tiền
1. (0–2 s) Sinh NPC "Tên Trộm" (áo đen, mặt nạ) tiếp cận 1 bot dân thường hoặc người chơi.
   - Trộm của bot: nạn nhân hoảng loạn, chạy vòng kêu cứu "😱 Cướp! Cướp! Ai cứu tôi với, nó lấy mất ví tiền rồi!".
   - Trộm của người chơi: tạm trừ 50 💰, chữ nổi "-50 💰 Bị móc túi!" + toast "🚨 Bạn vừa bị móc túi! Cảnh sát 113 đang lao tới trong 10 giây!".
2. (2–10 s) Trộm bỏ chạy dọc vỉa hè. Nếu người chơi đuổi kịp và bấm phím 3 đấm trúng trước khi công an tới → trộm ngã choáng, thưởng +30 💰.
3. (10–18 s) Xe cảnh sát hú còi, đèn chớp đỏ–xanh lao tới dừng sát lề; 2 cảnh sát chạy 5,8 m/s đuổi, quật ngã, khoá tay trộm.
4. (18–30 s)
   - 1 cảnh sát tới chỗ người chơi (hoặc bot nạn nhân) chào điều lệnh, trả lại đủ +50 💰 (chữ nổi xanh "+50 💰 Công an trả lại tiền", thoại "Của rơi đã thu hồi! Gửi lại bạn số tiền bị mất nhé! 👮‍♂️✅").
   - Cảnh sát còn lại áp giải trộm lên cửa sau xe, lái về phòng giam đồn.
   - Mọi bot trong 22 m quay về phía công an, vỗ tay, bong bóng "👏 Hoan hô các anh công an!".

### B. Cháy ngẫu nhiên & xe cứu hoả 114
1. Đám cháy ngẫu nhiên trên phố (lửa + khói cao 4 m, ánh cam nhấp nháy). Bot quanh đó lùi ra đứng xem, hô "🔥 Cháy rồi! Gọi 114 mau!".
2. Xe cứu hoả từ trạm cứu hoả bật đèn, hú còi chạy theo `roadNet` tới hiện trường.
3. 3 lính cứu hoả xuống xe, phun vòi rồng (hạt nước trắng) 12 giây → lửa nhỏ dần, bốc hơi trắng rồi tắt.
4. Đám đông vỗ tay 👏 cảm ơn; xe thu vòi chạy về trạm.

### C. Yêu quái xuất hiện & siêu nhân bay xuống
1. Cổng xoáy tím đen trên không; yêu quái 7–8 m ("Memory-Leak Behemoth" hoặc "Kraken 502") đáp xuống quảng trường/đại lộ, gầm rú, bot hoảng sợ bỏ chạy.
2. "Captain QA" (giáp sáng vàng–xanh, áo choàng đỏ) bay từ y = +140 m xuống, đáp đất kiểu Superhero Landing, sóng xung kích ánh sáng.
3. 20 giây chiến đấu: đòn cận chiến trên không, khiên chặn đòn, tụ năng lượng bắn tia "HOTFIX HYPER BEAM" → yêu quái nổ thành pháo hoa, rơi 10 viên pha lê (+10 💰/viên khi người chơi nhặt).
4. Bot chạy lại vây quanh vỗ tay, chụp ảnh 📸👏; siêu nhân vẫy chào rồi phóng thẳng lên trời biến vào mây.
(Thiết kế nhân vật gốc – không sao chép siêu anh hùng/quái vật có bản quyền.)

### D. 6 sự kiện đường phố khác
1. Cấp cứu 115: bot ngất vì thức khuya → xe cứu thương từ bệnh viện hú còi tới sơ cứu → bot tỉnh, dân vỗ tay.
2. Xe chở tiền rơi vàng: xe bọc thép làm rơi 15 túi xu trên đường trong 25 s cho người chơi và bot nhặt (hoặc đem trả tài xế nhận thưởng lớn).
3. Va chạm giao thông nhẹ: 2 xe bot chạm đuôi, tài xế xuống tranh luận vui vẻ → cảnh sát giao thông tới hoà giải, bắt tay làm hoà.
4. Flashmob: 10 bot xếp đội hình nhảy đồng diễn theo nhạc; người chơi bấm F nhảy cùng được +40 💰.
5. Robot giao trà sữa lỗi AI: chạy xoay vòng bắn bong bóng; người chơi bấm E "debug" giúp nhận +35 💰.
6. Lễ hội đèn trời ban đêm: khi `W.night > 0.5`, bot dọc bờ sông và phố cổ thả đèn trời phát sáng bay lên.
