# Hướng dẫn soạn bài – Trung tâm Ngoại ngữ QC World

Dành cho người soạn thêm/sửa bài (giáo viên, hoặc trợ lý AI). Đọc kèm `SCHEMA.md` (định dạng) và `CURRICULUM.md` (khung chương trình).
Bài mẫu chuẩn chất lượng: `en_a1/01.json` (tiếng Anh), `zh_hsk1/01.json` (tiếng Trung) – mọi bài khác phải **sâu, đủ, chính xác ít nhất bằng**.

## 1. Mỗi bài học phải có
| Thành phần | Yêu cầu tối thiểu |
|---|---|
| `goals` | 3–5 mục tiêu cụ thể, đo được (“nói được…”, “dùng đúng…”) |
| `words` | 12–20 từ/cụm của bài (cấp cao: 15–25, ưu tiên collocation/cụm). Tiếng Anh có IPA Anh-Anh có trọng âm; tiếng Trung có `py` (dấu thanh), `hv` (âm Hán Việt – không chắc thì để `""`, KHÔNG đoán), ví dụ có `exPy` (đến HSK4) |
| Phát âm | Cấp 0–A2 / Cấp 0–HSK2: mỗi bài có khối `sounds` (âm khó của bài, cặp tối thiểu, biến điệu, ngữ điệu). Cấp cao: lồng mẹo phát âm vào `text`/`speak` |
| `grammar` | 1–3 khối: giải thích tiếng Việt dễ hiểu, `table` công thức, 3–6 ví dụ có dịch, `tips` nêu **lỗi người Việt hay mắc** và so sánh với tiếng Việt |
| `dialog` | 1 bài nghe 6–14 câu (cấp cao: bài giảng/độc thoại dài 150–400 từ chia thành nhiều câu), người nói có `g` nam/nữ, bối cảnh `note` + 3–5 câu hỏi `qs` |
| `read` | 1 bài đọc tự viết. Độ dài: Cấp 0 ≈ 30–60 từ · A1 80–150 · A2 150–220 · B1 220–320 · B2 300–450 · C1/C2 500–800 (văn học thuật kiểu IELTS). Tiếng Trung: HSK1 40–80 chữ · HSK2 80–150 · HSK3 150–250 · HSK4 250–400 · HSK5 400–600 · HSK6 600–900 · 7–9 800–1.200. Kèm `gloss` và 3–6 câu hỏi; cấp thấp kèm `vi` (bản dịch) và (tiếng Trung đến HSK3) `py` |
| `speak` | 2–4 nhiệm vụ nói có câu mẫu `model` (cấp IELTS: câu trả lời mẫu band 8, 80–200 từ) |
| `write` | 1 đề viết có `model` (bài mẫu hoàn chỉnh), `tips`, `checklist` |
| `chars` (tiếng Trung) | 4–8 chữ Hán trọng tâm: bộ thủ/thành phần, số nét đúng, mẹo nhớ |
| `exercises` | 12–16 câu tự chấm, trộn: `mc`, `fill`, `order`, `match`, **≥ 2 `listen`**, **≥ 1 `dict`**. Mọi câu có `e` giải thích bằng tiếng Việt |
| `teacher` | Giáo án 2 buổi × 90 phút: `prep`, `steps` (có phút), `games` (1–3 hoạt động lớp), `errors` (4–6 lỗi hay gặp + cách sửa), `homework` |

## 2. Bài thi cuối cấp `exam.json`
30–45 câu tự chấm, đủ: Nghe (1–2 `dialog` + câu hỏi, hoặc nhiều câu `listen`/`dict`) · Từ vựng & ngữ pháp · Đọc hiểu (bài đọc mới) · Viết (đề + bài mẫu + `rubric`) · Nói (đề + mẫu + `rubric`). Bao phủ TẤT CẢ bài của cấp. `pass: 70`.

## 3. Chính xác là trên hết
- IPA: chuẩn Anh-Anh (dấu trọng âm ˈ ˌ, /r/ cuối trong ngoặc như /ˈtiːtʃə(r)/). Pinyin: dấu thanh đúng; 不/一 ghi theo thanh thực đọc (bú shì, yí ge, yì tiān); biến điệu 3+3 KHÔNG ghi (nǐ hǎo). Thanh nhẹ không dấu (xièxie, māma).
- Đáp án `a` của `mc`/`listen` là chỉ số từ 0 – kiểm tra kỹ từng câu. Mỗi câu chỉ có MỘT đáp án đúng rõ ràng.
- `order.w` là các mảnh ĐÃ XÁO của đúng câu `a` (đủ chữ, không thừa thiếu).
- Câu trong `say` / `dialog.t` sẽ được giọng máy (speechSynthesis) đọc: viết câu tự nhiên, đủ dấu câu, không emoji/ký hiệu lạ; tiếng Trung viết bằng chữ Hán (KHÔNG viết pinyin vào `say`), muốn đọc 1 âm tiết có thanh điệu thì dùng 1 chữ Hán mang âm đó (妈 mā, 麻 má, 马 mǎ, 骂 mà).
- Tiếng Việt có dấu đầy đủ, giọng thân thiện, dễ hiểu cho người mới.

## 4. Bản quyền
Tự viết 100%: không chép câu, bài đọc, hội thoại, đề, bài mẫu từ sách/đề thi đã xuất bản (Cambridge IELTS, giáo trình Hán ngữ, HSK Standard Course, đề HSK thật…), không trích lời bài hát, không dùng nhân vật/thương hiệu có bản quyền. Mô tả tiêu chí chấm IELTS/HSK bằng lời của mình (diễn giải tiếng Việt), không chép nguyên văn.

## 5. Kiểm tra
`python data/lang_src/build.py --check <thư_mục>` (ví dụ `en_a2`) – sửa hết dòng `LỖI`, giảm `cảnh báo` tối đa. Chạy `python data/lang_src/build.py` (không có --check) để gộp ra file game đọc.
