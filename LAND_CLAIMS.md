# QC World – Đăng ký đất (dùng chung cho mọi phiên đang làm game)

Bình cho phép **mở rộng đất tự do** cho thành phố và mọi nơi cần xây thêm, càng bự càng tốt, không giới hạn trong khu đất cũ.
Bình (14/11/2026): "tôi cho phép bạn mở đất rộng thêm tự do cho thành phố hay tất cả mọi nơi nào bạn cần dựng thêm để xây thêm … cứ tha hồ mở rộng ra, xây càng bự càng tốt".

## Quy tắc tránh đè nhau giữa các phiên
1. **Trước khi xây** trên đất mới, thêm một dòng vào bảng "Đã đăng ký" bên dưới: hình chữ nhật x0–x1, z0–z1, tên phiên, file JS.
   Chọn vùng **không giao** với vùng nào trong bảng; nên chừa 20 m biển giữa các vùng.
2. Đất mới thêm bằng `W.EXTL.push({x0, x1, z0, z1, h:(x,z)=>độCao|null})` (hàm độ cao trả `null` ngoài đất, nhỏ hơn 0 là nước).
   Nối với đất cũ bằng cầu (plat dốc thoai thoải, mỗi bậc ≤ 0,2 m) hoặc đường. Thêm nút vào `W.transit.G` nếu muốn taxi và xe bot chạy tới.
3. Ghi vào `PLACES` để hiện trên bản đồ (phím M).
4. Không sửa file của phiên khác. Cần móc vào file chung thì ghi đề xuất cho phiên chính.

## Vùng đã có (tính đến 14/11/2026)
| Vùng | x0–x1 | z0–z1 | Ghi chú |
|---|---|---|---|
| Đảo chính Master Dashboard | khoảng −115…115 | khoảng −115…115 | tâm (0,0), mép theo `W.edgeR(a)` |
| Đảo nhỏ khu nghỉ dưỡng | quanh ISLET (bán kính 122 theo góc RESORT_A) | | r = 24 |
| Downtown | 136–262 | −62…62 | quy hoạch lại 15/11/2026 (phiên `qc-park`): đường 20 m (2 làn ô tô + 1 làn xe máy mỗi chiều), dữ liệu đường duy nhất `CITY.roads` + js/roads.js |
| Phường Khởi Nghiệp | 136–262 | 56–118 | |
| Khu Giải trí (arena) | 274–394 | −60…60 | |
| Đồi Brand QC + Phố Núi | 276–476 | 66–274 | phiên chính (`hills.js`, `mountaintown.js`, `foodstreet.js`, `riverside.js`…) |
| Đảo QC Wonderland | −10–132 | 222–362 | tâm (61, 291), cáp treo về (54, 239) |
| Cao nguyên (núi, sông, thác, phố cổ) | 88–332 | −342…−100 | `highland.js` |
| Mặt biển dùng cho du thuyền / mô tô nước / dù bay | vịnh phía Bắc; (106, 52); (−60, 190) | | đừng lấp đất ở các tuyến này |

## Đã đăng ký mở rộng
| Phiên | Vùng x0–x1 | z0–z1 | Dùng cho | File |
|---|---|---|---|---|
| phiên chính | 476–640 | 66–274 | mở rộng Phố Núi (đồi thứ 2, đường đèo) | `js/hills.js`, `js/mountaintown.js` |
| phiên công viên (qc-park) | 136–262 | 56–480 | Phường Khởi Nghiệp mở rộng tới z 480 (CITY.ward) – Đại công viên Hồ Ngọc ở giữa thành phố x 156–242 · z 10–190; khối A dịch vụ phường, B bệnh viện + trạm cứu hoả, C 12 lô đất, D trường học, E/F 6 cao ốc (js/civic.js, js/park.js). Bỏ đất EXTL Hồ Thiên Nga cũ |
| phiên Trung tâm Ngoại ngữ | −360…−160 | −120…100 | Đảo Ngoại ngữ (campus Trung tâm Ngoại ngữ QC) + cầu vòm từ bãi biển bờ Tây đảo chính (x −62…−180, z −22…−10, trục z = −16) | `js/langcenter.js` |
| phiên đồ hoạ/QA (A23) | −40…116 và −256…348 | 384…500 và 500…1230 (đợt 2 kéo thân xuống Nam tới z 1230) | **Công viên Kỳ Quan QC World** (đợt 1): cổ chai = cầu từ bờ Nam Đảo QC Wonderland (40, 338→394) + cổng + Đại lộ Ánh Sao + phố ẩm thực; thân = Hồ Pha Lê (tâm 40, 620) + 3 tàu lượn, tháp rơi 80 m, vòng quay 90 m. Lưới đất EXTL x −270…363 · z 372…1242 (trả `null` ngoài bờ). Đợt 2A (z 884–1210): 3 tàu lượn phiêu lưu + núi/núi lửa/đền + 4 trò khô. **Đợt 2B (đã xây)**: dải Bắc "Thung Lũng Ác Mộng" z 805–884 – 3 nhà ma kín: Dinh Thự Huyết Nguyệt (x −242…−155), Phòng Thí Nghiệm Khu 13 (x −130…−43), Kim Tự Tháp Xác Ướp (x −18…69; nhân sư x 70–82 · z 862–874); Tây-Nam "Quảng Trường Tương Lai": rạp bay 4D (tâm −212, 1062, r 20), mê cung gương (x −126…−100 · z 1046–1078), đường đua go-kart (x −243…−104 · z 1106–1203) + khu pit (x −104…−89 · z 1104–1141), xe điện đụng (tâm −72, 1150, r 21), Lâu Đài Pha Lê (x −21…66 · z 1104–1183); lối đi mới x −166…−154 · z 991–1096 và x −244…108 · z 1096–1104. **Còn trống cho đợt 3 (công viên nước)**: x 224…340 · z 800–880; x 70…100 · z 1106–1210; x −250…−226 · z 1040–1096 | `js/themepark.js`, `js/themerides.js`, `js/themeland2.js`, `js/themedark.js`, `js/themeplay.js`, `js/coastertrack.js` |
| phiên đồ hoạ/QA (V2 Pha 3) | −180…180 (chỉ ở `?v2`) | −180…180 | **Đảo Vực Thẳm Abyssal Canyon** (V2, đè lên đảo chính cũ; y −42…+28). Cổng: G1 (180, 0) → CBD · G2 (0, 180) → sân bay · G3 (−180, −16) → cầu Thụy Sĩ. Dưới mực biển: sàn −29,2, hồ −29,5 | `js/abyssal_island.js` |
| phiên bot đi bộ (V2 Pha 10) | 214–244 (chỉ ở V2, trong CBD) | 354–382 | **Sở Cảnh Sát QC City · 113** – 3 tầng + bãi trực thăng, mặt tiền Tây ra Đường Tây CBD (x 198). Đất Bình đề xuất (x 215–255, z 278–302) đã có tháp căn hộ River Tech → dời tới lô trống gần nhất (phía Nam tháp căn hộ thứ 2) | `js/police_station.js` |
