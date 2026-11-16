# PROMPT GIAO AI KHÁC SOẠN TÀI LIỆU HỌC CÒN THIẾU – QC World (16/11/2026)

> Cách dùng: copy **nguyên khối PROMPT** bên dưới (từ dòng "Bạn là chuyên gia…" tới hết) dán **1 lần** cho 1 AI đọc/ghi được file trong thư mục dự án (ví dụ Claude Code / Cursor / Codex mở thư mục `F:\Software\Self-Software\Master Dashboard Open World`). AI đó tự làm lần lượt mọi đợt và tự ghi tiến độ.
> Nếu AI đó dừng giữa chừng (hết lượt / hết token): chỉ cần nhắn nó **"tiếp tục"** (hoặc mở phiên mới dán lại đúng khối PROMPT này) – nó đọc file tiến độ `docs/TIEN_DO_TAI_LIEU.md` và làm tiếp đúng chỗ dừng.
> Xong hết (hoặc bất cứ lúc nào), nhắn phiên chính "duyệt tài liệu" – phiên chính kiểm tra, gắn vào game (nút E ở lớp học, bản đồ…) rồi đẩy GitHub.
> Nếu AI không đọc được file: gửi kèm `data/courses_src/api.txt` (mẫu khoá Dev) hoặc `data/lang_src/SCHEMA.md` + `AUTHORING.md` + `en_a1/01.json` (mẫu bài ngoại ngữ).

## Hiện trạng (rà ngày 16/11)
- ✅ Tiếng Anh (L0 → C2, 2 đề IELTS) và tiếng Trung (L0 → HSK 7–9, 7 đề) **đủ 100 %** theo CURRICULUM.md, kiểm tra 0 lỗi.
- ✅ 17 khoá QA/Tester ở Học viện (128 bài) **đủ**.
- ❌ **5 lớp Dev ở tháp The Crystal (Dev City)**: Backend, Frontend, System Design, DevOps, AI – bấm E chỉ báo "đang biên soạn".
- ❌ **Tiếng Nhật** (Học viện Kyoto, phòng nghe JLPT) và **tiếng Hàn** (Học viện Hanok, phòng thi TOPIK): chưa có bài nào.
- ⚠️ Chủ đề hội thoại: tiếng Anh thiếu cấp C2, tiếng Trung thiếu cấp HSK 7–9.

---

## PROMPT

```
Bạn là chuyên gia soạn giáo trình, viết tiếng Việt có dấu, cho game học tập "QC World" ở thư mục:
F:\Software\Self-Software\Master Dashboard Open World

LUẬT BẮT BUỘC (vi phạm = làm lại):
1. Chỉ TẠO/SỬA đúng các file nêu trong các đợt dưới đây + file tiến độ docs/TIEN_DO_TAI_LIEU.md. Không sửa bất kỳ file .js/.html nào, không chạy git, không xoá file.
   Sửa file đã có → sao chép bản cũ vào _backup\ với đuôi .backup_YYYYMMDD trước.
2. Nội dung TỰ VIẾT 100 %: không chép sách, đề thi, khoá học, tài liệu có bản quyền; tên người/công ty tự đặt (không dùng tên công ty thật).
   Không có URL/host/token/mật khẩu thật nào. Ví dụ API dùng example.com / localhost.
3. Học viên là người Việt: giải thích bằng tiếng Việt dễ hiểu, so sánh với đời sống Việt Nam, chỉ rõ lỗi hay gặp.
4. Đọc kỹ file mẫu và luật định dạng trước khi viết; chạy lệnh kiểm tra tới khi 0 lỗi, 0 cảnh báo.
   Python: "F:/Software/Self-Software/Master Dashboard/runtime/python.exe" (luôn chạy với -I).
5. Không tự gắn vào game (không sửa .js), không chạy git.

CÁCH LÀM VIỆC (một prompt làm hết – tự chạy liên tục, không chờ hỏi lại):
A. Đầu tiên mở docs/TIEN_DO_TAI_LIEU.md. Chưa có → tạo file đó với danh sách việc bên dưới (mỗi việc 1 dòng "[ ] …").
   Đã có → bỏ qua các việc đã đánh dấu [x], làm tiếp từ việc [ ] đầu tiên.
B. Làm lần lượt: ĐỢT 1 → ĐỢT 2 → ĐỢT 3a → 3b → 3c (3c gồm nhiều cấp, làm từng cấp một).
   Mỗi khi xong 1 việc nhỏ (1 khoá, 1 cấp, 1 nhóm chủ đề): chạy lệnh kiểm tra tới 0 lỗi, 0 cảnh báo → đánh [x] + ghi ngày, tên file,
   số bài, kết quả kiểm tra vào docs/TIEN_DO_TAI_LIEU.md → rồi TỰ làm việc kế tiếp, không dừng lại hỏi.
C. Chỉ dừng khi: (1) xong tất cả, hoặc (2) gặp lỗi không tự sửa được – ghi rõ lỗi vào cuối file tiến độ rồi dừng.
D. Khi dừng (vì xong hoặc hết lượt): in tóm tắt ngắn: đã xong gì, còn gì, file nào đã tạo/sửa.

========== ĐỢT 1 – 5 KHOÁ DEV CHO THÁP THE CRYSTAL (Dev City) ==========
Đọc trước: data/courses_src/api.txt và programming-basics.txt (mẫu), data/courses_src/build_courses.py (luật).
Tạo 5 file trong data/courses_src/ (mỗi khoá 8 bài, mỗi bài 5–7 slide, ≥ 50 % slide có code, có PRACTICE và 2–3 câu Q):
  - backend.txt        "Lập trình Backend": HTTP/REST, Node.js (Express) + Python (FastAPI) song song, routing, validate,
                        DB SQL + ORM, xác thực JWT/session, xử lý lỗi & log, viết unit/integration test cho API, hiệu năng & cache.
  - frontend.txt       "Lập trình Frontend": HTML ngữ nghĩa, CSS (flex/grid, responsive), JavaScript DOM & sự kiện, fetch/async,
                        React cơ bản (component, state, props, effect), form & validate, accessibility, test UI (Testing Library/Playwright).
  - system-design.txt  "Thiết kế hệ thống": yêu cầu chức năng/phi chức năng, ước lượng tải, load balancer, cache, DB (SQL/NoSQL, index,
                        sharding, replication), hàng đợi/message, microservice vs monolith, rate limit, quan sát (log/metric/trace),
                        2 case study tự đặt (rút gọn link, nhắn tin) – có sơ đồ bằng code block text.
  - devops.txt         "DevOps thực chiến": Linux & shell, Docker (Dockerfile, compose), Kubernetes cơ bản (pod, deployment, service),
                        CI/CD pipeline (YAML), hạ tầng dạng code (Terraform cơ bản), giám sát & cảnh báo, bảo mật bí mật (secret),
                        triển khai blue-green/canary.
  - ai-dev.txt         "AI cho lập trình viên": Python + numpy/pandas cơ bản, khái niệm ML (train/test, overfitting, metric), mô hình
                        ngôn ngữ lớn & prompt, gọi API LLM (code mẫu dùng endpoint giả), RAG (embedding, vector search), đánh giá
                        & kiểm thử ứng dụng AI (hallucination, bộ test, guardrail), đạo đức & dữ liệu cá nhân.
  Mỗi khoá cần dòng: name, icon (emoji Unicode ≤ 12.0, ví dụ 🖥️ 🎨 🏗️ 🐳 🤖), floor: 7, room: 701…705 (đúng thứ tự trên),
  level, hours, summary.
Sửa data/courses_src/build_courses.py: CHỈ thêm 5 id trên vào ORDER (floor 7, room 701–705) và thêm tầng 7 "Dev City · The Crystal"
  vào FLOORS – không đổi logic khác.
Kiểm tra: cd data/courses_src → python -I build_courses.py check backend.txt (từng file) → python -I build_courses.py build . ../courses.json

========== ĐỢT 2 – BỔ SUNG CHỦ ĐỀ HỘI THOẠI ==========
Đọc trước: data/lang_src/SCHEMA.md, AUTHORING.md, mẫu en_talk/040.json và zh_talk/040.json.
  - Tiếng Anh cấp C2: tạo data/lang_src/en_talk/049.json … 056.json (8 chủ đề, lv "c2"): đàm phán hợp đồng, thuyết trình
    hội nghị, phỏng vấn báo chí, tranh luận chính sách, xử lý khủng hoảng truyền thông, phản biện nghiên cứu, cố vấn nhân sự cấp cao,
    kể chuyện truyền cảm hứng.
  - Tiếng Trung cấp HSK 7–9: tạo data/lang_src/zh_talk/045.json … 050.json (6 chủ đề, lv "hsk79"): đàm phán thương mại, hội thảo
    học thuật, phỏng vấn tuyển dụng cấp quản lý, bình luận thời sự kinh tế, thuyết trình dự án, giao tiếp ngoại giao doanh nghiệp.
  Đủ trường theo SCHEMA (10–24 lines có g f/m, 6–12 phrases, 5–8 qs, 3–6 exercises, 2–3 practice).
Kiểm tra: python -I data/lang_src/build.py --check en_talk ; --check zh_talk ; sau đó python -I data/lang_src/build.py

========== ĐỢT 3 – TIẾNG NHẬT & TIẾNG HÀN (3 bước 3a → 3b → 3c, làm liên tục) ==========
Bước 3a – Khung chương trình: thêm vào data/lang_src/CURRICULUM.md mục C (Tiếng Nhật: kana, N5, N4, N3, N2, N1, "it" = tiếng Nhật
  công sở IT) và mục D (Tiếng Hàn: hangul, TOPIK 1–6) cùng văn phong mục A/B: bảng cấp + danh sách bài từng cấp
  (kana 8 bài, N5–N1 mỗi cấp 10–12 bài, it 8 bài; hangul 8 bài, t1–t6 mỗi cấp 10–12 bài) + đề thi thử (2 đề JLPT, 2 đề TOPIK).
Bước 3b – Công cụ: sửa data/lang_src/build.py + SCHEMA.md để nhận trường tiếng Nhật (kana, romaji, kanji tuỳ chọn, hv = Hán Việt
  tuỳ chọn) và tiếng Hàn (rr = phiên âm Romaja), không đòi "ipa" cho ja/ko, cho mock kind "jlpt" | "topik".
  Giữ nguyên hành vi với en/zh: chạy --check toàn bộ en_*/zh_* vẫn 0 lỗi.
Bước 3c – Soạn bài: bắt đầu ja_kana (8 bài) + ko_hangul (8 bài) + exam.json mỗi cấp, đạt chất lượng ngang en_a1/01.json
  (12–16 bài tập, ≥ 2 nghe, ≥ 1 chính tả, mỗi bài có giải thích tiếng Việt, có phần teacher). Rồi làm tiếp lần lượt
  ja_n5 → ja_n4 → ja_n3 → ja_n2 → ja_n1 → ja_it, ko_t1 → … → ko_t6, sau đó ja_mock/ko_mock (2 đề mỗi thứ), ja_talk/ko_talk
  (mỗi cấp 4–6 chủ đề), ja_guide/ko_guide (theo mẫu en_guide). Mỗi cấp xong là 1 dòng [x] trong file tiến độ.
Kiểm tra: python -I data/lang_src/build.py --check ja_kana (…từng thư mục) → python -I data/lang_src/build.py
```

---

## Phần phiên chính làm sau khi duyệt (AI khác KHÔNG làm)
- Đợt 1: nối 5 lớp ở `js/devcity_landmarks.js` (The Crystal) gọi `W.openCourse('<id>')` thay cho toast "đang biên soạn"; thêm tầng 7 vào Học viện (`js/campus.js`) nếu cần.
- Đợt 3: bỏ nhãn "(đang soạn)" ở `js/langui.js`, bảng Kyoto/Hanok và bản đồ trong `js/swiss_lang_island.js`; nối phòng nghe JLPT, phòng thi TOPIK.
- Mỗi đợt: test V2 + `?v1`, đọc mẫu ngẫu nhiên 3–5 bài kiểm nội dung (đúng, không bản quyền, tiếng Việt chuẩn), rồi đẩy GitHub.
