# QC World – Hiện trạng kiến trúc toàn thế giới (15/11/2026)

Tài liệu tổng hợp **mọi không gian đang có trong game**, viết theo đúng mã nguồn để làm nền cho bản kiến trúc final. Mỗi không gian ghi:
- toạ độ và kích thước;
- số tầng;
- bố trí nội thất;
- chức năng;
- nhân vật (vai trò, vị trí, hành vi, câu thoại);
- tương tác (phím, giá, phần thưởng);
- đường nối;
- file và dòng nguồn.

**Quy ước:**
- 1 ô = 1 m = 1 đơn vị toạ độ thế giới. Trục x là Đông–Tây, trục z là Bắc–Nam (z âm ở phía Bắc), y là độ cao (mặt biển ≈ 0).
- `x0–x1, z0–z1` là hình chữ nhật bao.
- Nội thất các toà công ty dùng toạ độ phòng riêng (xem phần 3).
- Số có dấu "≈" là số tính lại từ công thức trong mã.
- "chưa rõ" nghĩa là mã tính lúc chạy hoặc không ghi rõ.

## Mục lục
1. [Đảo chính Master Dashboard + hệ thống chung](#phần-1) – quảng trường, 8 zone, sân khấu, bãi biển, Toà Giáo trình, Học viện QA, tháp Brand QA, khu nghỉ dưỡng và đảo nhỏ, lô đất, phòng trọ. Hệ thống chung: kinh tế, cửa hàng, xe, bot, laptop, nhạc, điện thoại, nạp tiền, âm thanh, phím tắt.
2. [Downtown · Phường Khởi Nghiệp · Đại công viên Hồ Ngọc](#phần-2) – mạng đường, 13 toà công ty (bên ngoài), cầu, công viên, bệnh viện, trạm cứu hoả, trường học, giao thông (đèn, xe buýt, cáp treo, taxi), người trên phố, Trung tâm Việc làm.
3. [Nội thất toà công ty + showroom](#phần-3) – sảnh, phỏng vấn, 9 phòng ban, 5 kiểu bố trí bàn, nhà ăn, phòng giám đốc, showroom, xe đại gia.
4. [Đồi Brand QC · Phố Núi](#phần-4) – địa hình, đường xoắn ốc, tháp Brand QC, nhà sàn bám vách, tháp cầu trời, phố ẩm thực, căn hộ Sky QC, biệt thự ven đầm.
5. [Khu Giải trí · Cao nguyên · Đảo Wonderland · Công viên Kỳ Quan · Biển](#phần-5) – sân bóng, concert, rạp, vòng quay, phố cổ, Thác Móng Ngựa, cáp treo dài, các trò cảm giác mạnh, du thuyền.
6. [Đảo Ngoại ngữ + bản đồ đất toàn thế giới](#phần-6) – campus ngoại ngữ, bảng 10 vùng đất, các tuyến nối, sơ đồ ASCII.

## Tổng quan nhanh: 10 vùng đất
| # | Vùng | x0 – x1 | z0 – z1 | Nối với |
|---|---|---|---|---|
| 1 | Đảo chính Master Dashboard | ≈ −89 … 89 (tâm 0,0, bán kính ≈ 74) | ≈ −89 … 89 | Downtown (cầu dây văng z = 0 + cáp treo), Wonderland (cáp treo dài), đảo nghỉ dưỡng (cầu gỗ), Đảo Ngoại ngữ (cầu vòm z = −16) |
| 2 | Đảo nhỏ nghỉ dưỡng (ISLET) | ≈ −105 … −57 | ≈ 67 … 115 | Cầu gỗ 3 m |
| 3 | Downtown | 136 – 262 | −62 – 62 | Đảo chính, Phường (liền đất), Khu Giải trí (cầu z = 0), Cao nguyên (cầu x = 178) |
| 4 | Phường Khởi Nghiệp | 136 – 262 | 56 – 480 | Downtown, Đồi Brand QC (cầu dốc z = 86) |
| 5 | Khu Giải trí | 274 – 394 | −60 – 60 | Cầu z = 0 |
| 6 | Cao nguyên Bình Phan | 88 – 332 | −342 – −100 | Cầu x = 178 |
| 7 | Đồi Brand QC + Phố Núi | 276 – 476 | 66 – 274 | Cầu z = 86 |
| 8 | Đảo QC Wonderland | −10 – 132 | 222 – 362 | Cáp treo dài từ đảo chính, cầu đá sang Kỳ Quan |
| 9 | Công viên Kỳ Quan | −270 – 363 | 372 – 1242 | Cầu đá x = 40 từ Wonderland |
| 10 | Đảo Ngoại ngữ | −360 – −160 | −120 – 100 | Cầu vòm z = −16 |

Chi tiết từng tuyến nối và sơ đồ ASCII ở phần 6.

## Những điểm cần biết khi thiết kế lại (phát hiện lúc đọc mã)
**Đất và quy hoạch:**
- Hộp đất Công viên Kỳ Quan (z từ 372) chồng lên Phường Khởi Nghiệp (tới z 480) ở x 136–262. Cần kiểm tra bờ thật.
- `LAND_CLAIMS.md` đăng ký mở rộng Phố Núi x 476–640, nhưng mã chưa có. Đảo chính trong sổ ghi ±115, mã thực tế là bán kính ≈ 74, tối đa ≈ 89.
- Đường ven Tây x = 146 và ven Đông x = 252 rộng 20 m, mép ngoài trùng mép đất, chỉ có vỉa hè phía công viên.
- Đường z = 290 / 380 / 470 chỉ nối nhau qua đường x = 199. Đầu x = 136 và x = 262 là đường cụt. Đường z = 470 không có vỉa hè phía Nam.
- Đảo Ngoại ngữ chỉ đi được bằng cầu vòm hoặc nhảy bản đồ. Không có taxi, xe buýt hay cáp treo.

**Toà nhà và nội thất:**
- Căn hộ Sky QC không có lối vào đi bộ. 20 tầng căn hộ chỉ là mặt tiền, chưa có nội thất.
- Đảo Ngoại ngữ: chỉ sảnh Toà Trung tâm đi vào được. English House, Hán Học Đường, phòng thi và thư viện là khối đặc.
- Biệt thự ven đầm: bàn ăn không có ghế. Hồ bơi và bến thuyền nằm ngoài phần đất được san phẳng. Mỗi người chỉ lưu được 1 biệt thự; mua căn khác thì ghi đè, không hoàn tiền.
- Showroom trên đồi: tấm tầng lửng dài gần bằng cả toà. 2 cột mái hiên đứng trùng tim đường ven biển x = 286.
- Toà Mobile First QA và DevOps Center có hai phòng ban trùng số tầng. Phòng Vận hành có một dòng dựng tấm nền màn hình không chạy (bị chú thích che).
- `world.html` còn hàm dựng nhà công cụ cũ (`buildTower`, `zoneProps`) nhưng không được gọi nữa.

**Hành vi:**
- Xe đại gia "sáng đi làm, chiều về" thực chất chạy vòng lặp cố định, không theo giờ trong ngày.
- Một số câu thoại và mô tả cũ còn nhắc "khu dân cư phía Đông" hay "khu Thương mại" ở chỗ đã đổi sang Phường Khởi Nghiệp.

**Chú thích lệch với mã:**
- Showroom ghi "11 xe, 5 mẫu" nhưng thực tế có 8 mẫu.
- Toà nhà ghi "8 kiểu" nhưng thực tế có 9 kiểu.
- Ngã giao có đèn ghi "6 ngã tư + 2 ngã ba" nhưng mã sinh 10 ngã giao.
- Xe buýt ghi 9 trạm nhưng thực tế có 8 trạm.
- Xe đạp ghi khoảng 23 km/h nhưng mã đặt 5 m/s (khoảng 18 km/h).

---
