# 🗣️ Trung tâm Ngoại ngữ QC – Hướng dẫn nhanh cho Bình

## Đi tới đâu?
- **Đảo Ngoại ngữ** nằm phía **Tây đảo chính**. Ra bãi biển bờ Tây (ngang Toà Giáo trình, hơi lệch Bắc) → đi qua **cầu vòm trắng 115 m** → đại lộ dẫn thẳng vào **Toà Trung tâm Ngoại ngữ**.
- Hoặc bấm **M** (bản đồ) → chọn **🗣️ Trung tâm Ngoại ngữ** để bay tới.

## Bấm E ở đâu?
| Chỗ | Mở |
|---|---|
| Quầy tư vấn trong sảnh kính / vòng vàng trước cửa | Sảnh chính của ứng dụng học |
| 🇬🇧 English House (tháp đồng hồ) | Lộ trình Tiếng Anh |
| 🏯 Hán Học Đường 汉学堂 | Lộ trình Tiếng Trung |
| 🎭 Sân khấu CLB Giao tiếp | Hội thoại giao tiếp (nghe – kiểm tra nghe – nhập vai) |
| 📝 Phòng thi | Đề thi thử IELTS / HSK tự soạn |
| 📖 Thư viện | Sổ tay chuyên đề (phương pháp dạy, tra cứu chuyên sâu) |
| 📌 Bảng ôn tập (quảng trường) | Các bài đến hạn kiểm tra lại |

Trong ứng dụng: **Esc** = quay lại, **✕** = về thế giới. Khi ứng dụng mở, thế giới 3D tạm dừng vẽ cho đỡ nặng máy.

## Học thế nào
1. Chọn lộ trình → cấp → **Bài 1, 2, 3…** Học từ trên xuống: phát âm, từ vựng, ngữ pháp, nghe (lời thoại bị che), đọc, nói (🎙️ ghi âm – chỉ lưu trong máy), viết (có phân tích nhanh + bài mẫu), bài tập cuối bài (≥ 60% là xong bài).
2. Xong bài → từ vựng tự vào **🃏 Thẻ từ vựng**; hệ thống hẹn **kiểm tra lại sau 1 · 3 · 7 · 14 · 30 · 60 ngày**. Có bài đến hạn thì **phải làm trước khi học bài mới** (tắt được trong ⚙️, không khuyến khích).
3. **🧪 Kiểm tra**: đề tự sinh – từ vựng / ngữ pháp / nghe / tổng hợp. **📕 Sổ lỗi sai**: câu sai được lưu, làm đúng 2 lần liền thì rời sổ.
4. Cuối cấp: **📝 Bài thi** ≥ 70% → **🏅 chứng chỉ** (+100 💰). Cuối lộ trình: **đề thi thử** IELTS (quy đổi band) / HSK (thang điểm 100 mỗi kỹ năng).

## Dạy miễn phí cho người khác
- Bật **👩‍🏫 Giáo viên** ở thanh trên: mỗi bài hiện **giáo án 2 buổi × 90 phút** (các bước có phút, trò chơi, lỗi hay gặp, bài về nhà) + đáp án mọi câu; mở mọi bài không bị khoá ôn tập.
- Trong mỗi cấp: **🖨️ In giáo trình** (mở tab mới → Ctrl+P → lưu PDF) hoặc **💾 Tải giáo trình (.html)** – đủ bài giảng, lời thoại + bản dịch, bài tập + đáp án, giáo án, bài thi + đáp án.
- Học viên học ở nhà trong game; xem tiến độ của họ bằng file **Xuất tiến độ** (⚙️ Cài đặt).

## Giọng đọc
- Dùng giọng có sẵn trong Windows (offline). Thiếu giọng tiếng Trung/Anh-Anh: **Settings → Time & Language → Speech → Add voices**.
- Tuỳ chọn ⚙️ “Cho phép giọng online” (giọng tự nhiên của Edge) – câu bài học được gửi tới dịch vụ đọc của trình duyệt, cần Internet. Mặc định TẮT.

## Sửa / thêm bài
- Nguồn: `data/lang_src/<ngôn ngữ>_<cấp>/NN.json` (định dạng: `SCHEMA.md`, yêu cầu nội dung: `AUTHORING.md`, khung chương trình: `CURRICULUM.md`).
- Sửa xong chạy: `python data/lang_src/build.py` (kiểm tra + gộp ra `data/lang_*.json`) → F5 trong game.
- Tiến độ học lưu trong trình duyệt: `localStorage` khoá `qcworld-lang`.

## Bản quyền
Toàn bộ bài học, hội thoại, bài đọc, đề thi là **tự biên soạn** – mô phỏng cấu trúc IELTS/HSK, không chép đề thật hay giáo trình đã xuất bản. Đề mẫu chính thức: Sảnh → 🔗 (mở trang chính thức IELTS / British Council / IDP / Cambridge / BBC Learning English / Chinese Testing International trên trình duyệt).
