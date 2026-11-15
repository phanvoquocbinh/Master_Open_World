# QC World V2 – Kế hoạch dựng & phân công (phiên chính điều phối, 15/11/2026)

Tài liệu gốc:
- `QC_WORLD_V2_MASTER_BIBLE_AND_CODE_SPECS.md`: bản text của PDF Bình gửi. Mỗi phiên chỉ đọc đúng Phần + Module của mình.
- `KIEN_TRUC_HIEN_TRANG.md`: hiện trạng V1, các API lõi phải giữ nguyên.

## 1. Chế độ V2 (không làm vỡ thế giới cũ)
- Mở game với **`world.html?v2`** (hoặc `localStorage.setItem('qcworld-v2','1')`) để vào thế giới V2. Mở bình thường vẫn là V1. Khi mọi pha xong, phiên chính sẽ chuyển mặc định sang V2.
- Ở chế độ V2, `js/v2core.js` gỡ toàn bộ nội dung khu vực V1: nhà, đường, cây, va chạm, điểm E, ghế, PLACES, EXTL, vùng phố phẳng `inDT`. Phần lõi được giữ: biển, trời, nhân vật, xe, kinh tế, điện thoại/laptop/nhạc, nhiều người chơi.
- Sau đó các module V2 được nạp theo bảng `ZONES` trong `js/v2core.js`. Mỗi file đã có sẵn stub `export function make(W, ctx){ return null; }`; phiên được giao thay nội dung stub đó.
- `ctx` = {S, save, ui, askPay, fmt, spend, addCoins, V, city, bots, jobs, zone, ZONES}. Kết quả trả về được gán vào `W.<key>V2`.
- Điểm xuất hiện: module đảo chính (Abyssal) đặt `W.V2SPAWN={x,z,lx,lz}`.

## 2. Bảng phân vùng V2 (không chồng lấn – chỉ dựng trong vùng của mình)
| Khoá | Vùng | x0 → x1 | z0 → z1 | y | File | Pha | Phiên |
|---|---|---|---|---|---|---|---|
| abyssal | QA/QC Abyssal Canyon Island | −180 → 180 | −180 → 180 | −42 → 28 | `js/abyssal_island.js` (+ `abyssal_interior.js` nếu cần) | 3 | qc-world-do-hoa |
| cbd | River Tech CBD | 180 → 580 | −120 → 460 | 0 → 140 | `js/river_cbd.js` (+ `bigtech_interiors.js`) | 4 | qc-park |
| skyport | Sân bay Quốc tế | −180 → 175 | 220 → 380 | 4 → 68 | `js/skyport.js` | 5 | qc-park (sau Pha 4) |
| devcity | Dev City Trùng Khánh 8D | 100 → 850 | −950 → −120 | 2 → 135 | `js/devcity_chongqing.js` | 6 | qc-world-laptop |
| brain | Đỉnh QA/QC Brain Citadel | 620 → 1150 | −100 → 450 | 0 → 168 | `js/brain_citadel.js` | 7 | phiên chính |
| swiss | Đảo Ngoại ngữ Thụy Sĩ | −850 → −250 | −500 → 250 | 0 → 95 | `js/swiss_lang_island.js` | 8A | qc-lang-center |
| palm | Ốc đảo Palm Dubai | 250 → 1050 | 520 → 1320 | −8 → 65 | `js/palm_dubai.js` | 8B | phiên xong sớm nhận |
| wonder | Wonderland + Kỳ Quan (dời về Nam) | −320 → 220 | 520 → 1350 | 0 → 98 | `js/wonder_v2.js` | 2 (dời) | qc-world-do-hoa (sau Pha 3) |
| bots | 55 loại bot | toàn thế giới | | | `bots.js`, `pedestrians.js`, `streetlife.js` | 9 | sau cùng |

Mỗi vùng có một kênh biển ngăn cách. Đất mới đăng ký bằng `W.EXTL.push({x0,x1,z0,z1,h:(x,z)=>độ cao|null, name})`. Hàm độ cao trả `null` ở ngoài đất; EXTL được ưu tiên hơn đảo cũ.


## 2b. Cổng nối giữa các vùng – mọi tuyến đường phải thông nhau, KHÔNG tuyến nào cụt (Bình yêu cầu 15/11)
Mỗi vùng phải đưa đường chính ra đúng các cổng của mình (cao độ mặt đường ghi ở cột y). Bên trong vùng, mọi con đường phải khép thành vòng hoặc dẫn ra một cổng; không có đường cụt.
Cầu nối qua kênh biển giữa 2 vùng do vùng ở xa trung tâm hơn dựng: từ cổng của mình tới cổng của vùng kia, có lan can và mặt đứng (plat) suốt cầu.
Nhớ thêm nút vào `W.transit.G` (nếu có) để taxi và xe bot đi xuyên vùng được.

| Cổng | Vùng A → điểm (x, z, y) | Vùng B → điểm (x, z, y) | Ai dựng đoạn nối |
|---|---|---|---|
| G1 | Abyssal Đông (180, 0, +2) | CBD Tây (180, 0, +2) | 2 vùng liền nhau: mỗi bên đưa đường tới đúng x = 180 |
| G2 | Abyssal Nam (0, 180, +4) | Skyport Bắc (0, 220, +4) | Skyport dựng cầu z 180 → 220 |
| G3 | Abyssal Tây (−180, −16, +2) | Swiss Đông (−250, −16, +2) | Swiss dựng cầu x −250 → −180 |
| G4 | CBD Đông (580, 86, +2) | Brain – đầu đường đèo (580, 86, +2) | ĐÃ CÓ (Brain dựng cầu 580 → 620) |
| G5 | CBD Bắc (380, −120, +2) | Dev City Nam (380, −120, +2) | 2 vùng liền nhau |
| G6 | Brain Bắc (700, −100, +4) | Dev City Đông Nam (700, −120, +2) | Dev City dựng đoạn nối |
| G7 | CBD Nam (450, 460, +2) | Palm Bắc (450, 520, +2) | Palm dựng cầu z 460 → 520 |
| G8 | Skyport Nam (0, 380, +4) | Wonder Bắc (0, 520, +2) | Wonder dựng cầu z 380 → 520 |
| G9 | Wonder Đông (220, 900, +2) | Palm Tây (250, 900, +2) | Palm dựng cầu x 220 → 250 |

## 3. Hợp đồng kỹ thuật cho mọi module V2
- **Đồ hoạ:** dùng `js/archKit.js` (Pha 1, xem `archkit_demo.html`):
  - `makePBRFacade` + `facadeUV`, `makeStoneMaterial`, `makeWoodMaterial`;
  - `roundedBox`, `arcSlab`, `buildCurvedTerraceWing`, `buildAsianCurvedRoof`, `buildBilliardTable`;
  - bộ cấu kiện lặp `windowFrames`, `glassRails`, `hangingPlanters`, `lanterns`;
  - gọi `AK.bindNight(W)` một lần.
  - Không ghép hộp vuông thô.
- **Va chạm:** dùng `circles`, `boxes`, `W.addSeg(ax,az,bx,bz,r,y0,y1,msg)` cho tường xiên và lan can, `addPlat(x,z,rot,hw,hd,h)` cho mặt đứng. Đứng tầng nào chặn tầng đó (y0/y1). Không đi xuyên vật thể. Bị chặn thì nhân vật đứng tại chỗ và hiện lý do (`msg`).
- **Nội thất nhiều tầng:** tầng trệt đi bộ thẳng vào. Tầng trên dùng thang máy (E) hoặc cầu thang có plat từng bậc. Camera trong nhà dùng `HOOK.camBox`.
- **Tương tác:** dùng `INTER` (E, có `when` theo tầng), `W.addSeat` hoặc `W.addBench`, và `PLACES` (điểm nhảy bản đồ M phải đứng chỗ trống, nhìn được toàn cảnh).
- **Hiệu năng:** máy Bình là Iris Xe. Gộp mesh tĩnh trước `batchStatic` (module nạp trước bước này). Cấu kiện lặp dùng InstancedMesh. Nội thất ở xa thì ẩn. Mục tiêu: mỗi khu thêm ≤ 150 lượt vẽ.
- **Nhà ở (luật V2):** nội đô (Abyssal, CBD, Dev City) chỉ bán/thuê căn hộ. Nhà mặt đất và biệt thự chỉ có ở Palm Dubai.
- **Dữ liệu chưa có** (khoá học dev, tiếng Nhật, tiếng Hàn…): tạo khung trống để đó, ưu tiên xây thành phố trước.

## 4. Quy trình
1. Chỉ sửa file của mình. Cần đổi `world.html`, `life.js` hay `v2core.js` thì nhắn phiên chính.
2. Tự test bằng máy chủ no-store (`tools/qa/serve_nocache.py` hoặc script tương tự) trên cổng riêng, mở `world.html?v2`. Kiểm tra 0 lỗi console, đi bộ thử, rồi chụp ảnh.
3. Ghi 1 dòng vào NHẬT KÝ THAY ĐỔI trong `QA_BACKLOG.md`.
4. Không chạy git. Nhắn phiên chính danh sách file; phiên chính test tích hợp (V1 + V2) rồi đẩy GitHub.
5. Mỗi pha xong, phiên chính báo Bình duyệt.
