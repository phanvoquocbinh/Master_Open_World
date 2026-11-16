# PROMPT ĐỢT 2 – MỞ RỘNG TÀI LIỆU HỌC (QC World, 16/11/2026)

> Cách dùng: copy **nguyên khối PROMPT** bên dưới, dán **1 lần** cho 1 AI đọc/ghi được file trong thư mục dự án (Claude Code / Cursor / Codex mở `F:\Software\Self-Software\Master Dashboard Open World`).
> AI đó tự làm lần lượt mọi phần và ghi tiến độ vào `docs/TIEN_DO_TAI_LIEU_DOT2.md`. Dừng giữa chừng thì nhắn **"tiếp tục"** (hoặc phiên mới dán lại đúng khối này).
> Xong thì nhắn phiên chính **"duyệt tài liệu đợt 2"**.

## Vì sao cần đợt 2 (phiên chính rà ngày 16/11)
- Đợt 1 đạt kiểm tra 0 lỗi, nhưng mỗi khoá chỉ 7–8 bài, mỗi cấp ngoại ngữ chỉ 8–14 bài: mới đủ "nhập môn", chưa đủ để giỏi.
- Còn lặp chữ máy móc:
  - `system-design.txt`: 3 đoạn mở đầu slide giống hệt nhau ở cả 8 bài.
  - `ko_t5` + `ko_t6`: cùng 5 câu ví dụ lặp lại trong cả 20 bài.
  - `ja_n5…ja_n1`: đoạn "Luyện mora…" lặp ở 10 bài.
- Thiếu nhiều chủ đề QA/QC và Dev quan trọng; chưa có bài thi cuối khoá.

## PROMPT

```
Bạn là chuyên gia soạn giáo trình, viết tiếng Việt có dấu, cho game học tập "QC World" ở thư mục:
F:\Software\Self-Software\Master Dashboard Open World
Đây là ĐỢT 2 (đợt 1 đã xong, xem docs/TIEN_DO_TAI_LIEU.md). Mục tiêu: học viên học xong đi làm được, thi được chứng chỉ.

LUẬT BẮT BUỘC (vi phạm = làm lại):
1. Chỉ TẠO/SỬA file nội dung trong data/courses_src/, data/lang_src/ (kể cả CURRICULUM.md), 2 công cụ build_courses.py + build.py
   (chỉ thêm ORDER/FLOORS hoặc thêm kiểm tra, không đổi định dạng dữ liệu), các file data/*.json do công cụ sinh ra,
   và file tiến độ docs/TIEN_DO_TAI_LIEU_DOT2.md. Không sửa .js/.html, không chạy git, không xoá file.
   Sửa file đã có → chép bản cũ vào _backup\tai_lieu_dot2_YYYYMMDD\ trước.
   File tạm/script phụ chỉ để trong _work\tailieu\ (không để ổ C).
2. Nội dung TỰ VIẾT 100 %: không chép sách, đề thi thật, khoá học, tài liệu có bản quyền. Tên người, công ty, sản phẩm,
   thành phố trong ví dụ đều tự đặt (không dùng tên công ty/thương hiệu/địa danh có thật). Công cụ mã nguồn mở được nêu tên
   (Playwright, Cypress, Docker, PostgreSQL…). Không URL/host/token/mật khẩu thật; ví dụ dùng example.com / localhost.
3. Học viên là người Việt: giải thích tiếng Việt dễ hiểu, so sánh đời sống Việt Nam, chỉ rõ lỗi hay gặp.
4. KHÔNG LẶP MÁY MÓC: mỗi slide/đoạn/câu ví dụ phải viết riêng cho bài đó. Một đoạn văn ≥ 40 ký tự không được xuất hiện
   quá 2 lần trong cả 1 khoá/1 cấp. Viết script kiểm lặp trong _work\tailieu\ và chạy sau mỗi phần.
5. Chạy kiểm tra tới 0 lỗi, 0 cảnh báo. Python: "F:/Software/Self-Software/Master Dashboard/runtime/python.exe" -I <file.py>
   (luôn chạy file .py, không dùng "python -" kèm heredoc vì sẽ treo).

CÁCH LÀM VIỆC (một prompt làm hết – tự chạy liên tục):
A. Mở docs/TIEN_DO_TAI_LIEU_DOT2.md. Chưa có → tạo với danh sách việc bên dưới (mỗi việc 1 dòng "[ ] …"). Có rồi → làm tiếp từ [ ] đầu tiên.
B. Làm theo thứ tự PHẦN 1 → 5. Xong mỗi việc nhỏ (1 khoá hoặc 1 cấp): kiểm tra 0 lỗi + kiểm lặp → đánh [x] kèm ngày, file,
   số bài, kết quả → TỰ làm việc kế tiếp, không hỏi lại.
C. Chỉ dừng khi xong hết hoặc gặp lỗi không tự sửa được (ghi lỗi cuối file tiến độ).
D. Khi dừng: in tóm tắt ngắn đã xong gì, còn gì.

========== PHẦN 1 – SỬA LẶP CỦA ĐỢT 1 ==========
- data/courses_src/system-design.txt: viết lại riêng các đoạn mở đầu slide "Hợp đồng và dữ liệu", "Luồng xử lý và ranh giới",
  "Kiểm chứng và vận hành" cho từng bài (nói đúng nội dung code block của bài đó).
- data/lang_src/ko_t5, ko_t6: thay 5 câu ví dụ lặp ("Xem phản biện rồi sửa luận điểm", "Tiền đề đổi thì kết luận cũng đổi"…) bằng ví dụ riêng
  đúng chủ đề từng bài (tiếng Hàn + exVi).
- data/lang_src/ja_n5…ja_n1: viết riêng phần "Phát âm và nhịp" cho từng bài (âm khó của chính từ vựng bài đó).
- Rà tương tự toàn bộ en_*/zh_*/ja_*/ko_* và 22 khoá: chỗ nào lặp quá luật 4 thì sửa.

========== PHẦN 2 – KHOÁ QA/QC: SÂU HƠN + THI CUỐI KHOÁ ==========
Đọc trước: data/courses_src/api.txt (mẫu), build_courses.py (định dạng: === COURSE, ## LESSON, ###, ~~~, PRACTICE:, Q: + đáp án - / +).
2a. 17 khoá QA đang có (computer-basics, programming-basics, git, sql, json-regex, api, playwright, selenium, bdd, appium,
    mobile-manual, jmeter, k6, cicd, test-design, security-basics, ai-for-qa): nâng mỗi khoá lên 14 bài:
    - giữ bài cũ (có thể sửa cho hay hơn), thêm bài trung cấp → nâng cao → 1 bài dự án thực hành cuối khoá;
    - bài cuối cùng tên "Ôn tập & Thi cuối khoá": 20 câu Q phủ cả khoá, có giải thích ngắn trong slide.
2b. 8 khoá QA mới (mỗi khoá 14 bài, cùng chuẩn trên; floor: 8, room 801…808, thêm tầng 8 "Học viện QA · Mở rộng" vào FLOORS):
    - manual-testing      "Kiểm thử thủ công từ A–Z": vòng đời phần mềm, đọc yêu cầu, viết test case/checklist, môi trường, dữ liệu test,
                          kiểm thử web/mobile thủ công, regression, smoke/sanity, UAT.
    - istqb-foundation    "Luyện thi chứng chỉ kiểm thử nền tảng": 6 chương kiến thức theo cấu trúc phổ biến, mỗi bài 6–8 câu luyện,
                          2 bài đề thử 40 câu tự soạn (KHÔNG chép đề thật).
    - test-management     "Quản lý kiểm thử": chiến lược, kế hoạch, ước lượng, rủi ro, chỉ số, báo cáo, go/no-go, làm việc với BA/Dev/PM.
    - bug-life            "Báo lỗi & vòng đời lỗi": tái hiện, khoanh vùng, viết bug chuẩn, mức độ/ưu tiên, log/ảnh/video, điều tra gốc lỗi.
    - exploratory         "Kiểm thử thăm dò": charter, heuristic, session, ghi chép, tour, tìm lỗi biên.
    - accessibility       "Kiểm thử khả năng tiếp cận": chuẩn WCAG cơ bản, bàn phím, trình đọc màn hình, tương phản, form, tự động hoá a11y.
    - database-testing    "Kiểm thử dữ liệu & ETL": ràng buộc, toàn vẹn, migration, đối soát dữ liệu, kiểm thử báo cáo.
    - cypress             "Tự động hoá web với Cypress": selector, lệnh, intercept, fixture, page object, CI.

========== PHẦN 3 – KHOÁ DEV: SÂU HƠN + THÊM KHOÁ ==========
3a. 5 khoá Dev đợt 1 (backend, frontend, system-design, devops, ai-dev): nâng mỗi khoá lên 14 bài, bài cuối "Ôn tập & Thi cuối khoá" 20 câu.
3b. 6 khoá Dev mới (14 bài mỗi khoá; floor 7, room 706…711):
    - typescript          "TypeScript thực chiến"
    - database-design     "Thiết kế cơ sở dữ liệu": mô hình hoá, chuẩn hoá, index, transaction, SQL nâng cao, NoSQL khi nào dùng.
    - dsa                 "Cấu trúc dữ liệu & giải thuật": mảng, chuỗi, hash, stack/queue, cây, đồ thị, sắp xếp, tìm kiếm, Big-O, bài phỏng vấn.
    - secure-coding       "Lập trình an toàn": lỗi phổ biến (injection, XSS, CSRF, lộ dữ liệu), quản lý bí mật, kiểm thử bảo mật cho dev.
    - mobile-dev          "Lập trình di động đa nền tảng" (chọn 1 framework mã nguồn mở, giải thích lý do).
    - cloud-basics        "Điện toán đám mây cơ bản": khái niệm chung (máy ảo, lưu trữ, mạng, serverless, chi phí), không gắn nhà cung cấp cụ thể.
Kiểm tra: cd data/courses_src → build_courses.py check <file> (từng file) → build_courses.py build . ../courses.json

========== PHẦN 4 – NGOẠI NGỮ: ĐỦ BÀI ĐỂ GIỎI ==========
Đọc trước: data/lang_src/SCHEMA.md, AUTHORING.md, CURRICULUM.md, mẫu en_a1/01.json. Bài mới đánh số tiếp theo (11.json, 12.json…),
cập nhật danh sách bài trong CURRICULUM.md. Chất lượng mỗi bài ngang en_a1/01.json (12–16 bài tập, ≥ 2 nghe, ≥ 1 chính tả, có teacher).
4a. Số bài mục tiêu mỗi cấp (thêm cho đủ):
    - Nhập môn (en_l0, zh_l0, ja_kana, ko_hangul): 12 bài.
    - Sơ cấp (en_a1, en_a2, zh_hsk1, zh_hsk2, ja_n5, ja_n4, ko_t1, ko_t2): 20 bài.
    - Trung cấp (en_b1, en_b2, zh_hsk3, zh_hsk4, ja_n3, ko_t3, ko_t4): 18 bài.
    - Cao cấp (en_c1, en_c2, zh_hsk5, zh_hsk6, zh_hsk79, ja_n2, ja_n1, ko_t5, ko_t6): 15 bài.
    - Chuyên ngành (ja_it): 12 bài.
    Trong mỗi cấp, 2 bài cuối là "Ôn tập tổng hợp 1/2" (trộn mọi kỹ năng của cấp). exam.json mỗi cấp mở rộng thêm câu cho phủ bài mới.
4b. Đề thi thử tự soạn: mỗi ngôn ngữ đủ ≥ 4 đề (en_mock thêm 2, ja_mock thêm 2, ko_mock thêm 2; zh_mock đủ rồi thì rà lại).
4c. Hội thoại (talk): mỗi cấp ≥ 6 chủ đề.
Kiểm tra: build.py --check <thư mục> (từng thư mục) → build.py (đóng gói).

========== PHẦN 5 – KIỂM CUỐI ==========
- Chạy lại toàn bộ kiểm tra khoá học + 41 thư mục ngôn ngữ: 0 lỗi, 0 cảnh báo; kiểm lặp đạt luật 4.
- Ghi bảng tổng kết vào cuối docs/TIEN_DO_TAI_LIEU_DOT2.md: số khoá, số bài mỗi khoá, số bài mỗi cấp, số đề thi.
```

---

## Phần phiên chính làm sau khi duyệt (AI khác KHÔNG làm)
- Đọc mẫu ngẫu nhiên, chạy kiểm tra, xem app **"Tài liệu học tập"** trên laptop trong game hiện đủ khoá/cấp mới.
- Thêm phòng học cho tầng 8 (QA mở rộng) và phòng 706–711 (Dev City) nếu cần, rồi đẩy GitHub.
