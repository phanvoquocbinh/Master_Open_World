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
| Downtown | 136–262 | −62…62 | phiên `qc-park` đang làm công viên + cây xanh |
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
| phiên công viên (qc-park) | 150–258 | 138–352 | Đại Công viên Hồ Ngọc – QC City Central Park (đất mới phía Nam Phường Khởi Nghiệp: hồ uốn lượn, đảo thủy đình, cầu vòm, sàn gỗ ven hồ, đường chạy gạch đỏ, khu gym/yoga/cầu lông, cosplay, sân khấu, café, thuyền thiên nga) + lối đi giữa lô R6/R7 (x 198–200, z 91–118) và cầu bộ hành x 197–201, z 118–138 | `js/park.js` |
| phiên Trung tâm Ngoại ngữ | −360…−160 | −120…100 | Đảo Ngoại ngữ (campus Trung tâm Ngoại ngữ QC) + cầu vòm từ bãi biển bờ Tây đảo chính (x −62…−180, z −22…−10, trục z = −16) | `js/langcenter.js` |
