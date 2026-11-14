# Trung tâm Ngoại ngữ QC World – định dạng dữ liệu bài học

Nguồn soạn: `data/lang_src/<track>_<level>/` (mỗi bài 1 file `01.json`, `02.json`, … + `exam.json`).
Gộp & kiểm tra: `python data/lang_src/build.py` → sinh `data/lang_<track>_<level>.json` + `data/lang_index.json` (game chỉ đọc các file gộp này).
Sửa bài: sửa file nguồn → chạy lại `build.py` → F5 trong game.

- `track`: `en` (tiếng Anh) | `zh` (tiếng Trung)
- `level`: `l0`, `a1`, `a2`, `b1`, `b2`, `c1`, `c2` (Anh) · `l0`, `hsk1` … `hsk6`, `hsk79` (Trung)
- Mọi giải thích, hướng dẫn, đáp án giải thích: **tiếng Việt có dấu**. Ví dụ/bài đọc/hội thoại bằng ngôn ngữ đang học + bản dịch tiếng Việt.
- Toàn bộ nội dung **tự soạn**. KHÔNG chép đề/bài đọc/audio/sách đã xuất bản (Cambridge, Oxford, Hán ngữ, giáo trình HSK chuẩn…), không dùng tên thương hiệu/nhân vật có bản quyền. Tên người, địa danh: tự đặt (Lan, Minh, Tom, Anna, 小明, 王老师…).
- HTML cho phép trong trường `html` / `e`: `<p> <b> <i> <u> <br> <ul> <ol> <li> <table> <tr> <th> <td> <span class="hl"> <span class="ipa"> <span class="py"> <small> <h4>`. Không script, không style, không ảnh, không link.
- JSON hợp lệ UTF-8, không comment. Chuỗi dùng `"…"`; trong chuỗi dùng ’ hoặc \" cho ngoặc kép.

## 1. File bài học `NN.json`

```json
{
  "no": 1,
  "title": "Chào hỏi & giới thiệu – động từ TO BE",
  "sub": "Hello! I'm Lan.",
  "goals": ["Chào hỏi, giới thiệu tên, quê quán", "Dùng đúng am / is / are"],
  "parts": [ PART, PART, … ],
  "exercises": [ EX, EX, … ],
  "teacher": {
    "time": "2 buổi × 90 phút",
    "prep": "Chuẩn bị: thẻ tên, tranh nghề nghiệp…",
    "steps": [ {"t": "10'", "do": "Khởi động: …"}, {"t": "20'", "do": "Dạy từ vựng: …"} ],
    "games": ["Trò chơi 'Ai là ai?': …"],
    "errors": ["Học viên Việt hay nói 'I am agree' – sai vì …"],
    "homework": "…"
  }
}
```

### PART – các khối nội dung (xếp theo thứ tự dạy)

| `k` | Dùng cho | Trường |
|---|---|---|
| `text` | Giải thích, lý thuyết, mẹo | `h`, `html` |
| `sounds` | Phát âm (âm IPA / thanh mẫu–vận mẫu–thanh điệu) | `h`, `html?`, `items:[{sym, ex:[…từ để đọc…], vi, pairs?:[[a,b],…]}]` |
| `words` | Từ vựng (vào kho thẻ ôn tập) | `h`, `items:[WORD]` |
| `grammar` | Ngữ pháp | `h`, `html`, `table?:[[ô,ô,…],…]` (hàng đầu = tiêu đề), `ex:[{t, py?, vi}]`, `tips?:[…]` |
| `dialog` | Hội thoại / bài nghe (đọc bằng giọng máy) | `h`, `note?`, `lang?`, `lines:[{s, g, t, py?, vi}]`, `qs?:[Q]` |
| `read` | Bài đọc hiểu | `h`, `title?`, `text` (đoạn cách nhau `\n\n`), `py?` (pinyin cả bài – chỉ cấp thấp), `vi?` (bản dịch), `gloss?:[{w, py?, vi}]`, `qs?:[Q]` |
| `speak` | Luyện nói (ghi âm & nghe lại) | `h`, `tasks:[{p, model, py?, vi?, tips?}]` |
| `write` | Luyện viết | `h`, `task`, `min?` (số từ / chữ), `model`, `modelVi?`, `tips?:[…]`, `checklist?:[…]` |
| `chars` | Chữ Hán (có ô tập viết) | `h`, `items:[{c, py, hv, parts, strokes, vi, words}]` |

**WORD** – tiếng Anh: `{"w":"teacher","ipa":"/ˈtiːtʃə(r)/","pos":"n","vi":"giáo viên","ex":"My mum is a teacher.","exVi":"Mẹ tôi là giáo viên."}`
tiếng Trung: `{"w":"老师","py":"lǎoshī","hv":"lão sư","pos":"n","vi":"giáo viên","ex":"她是我的老师。","exPy":"Tā shì wǒ de lǎoshī.","exVi":"Cô ấy là giáo viên của tôi."}`
`pos`: n, v, adj, adv, prep, pron, conj, num, mw (lượng từ), part (trợ từ), phr (cụm), idiom.

**dialog.lines**: `s` = tên người nói, `g` = `"f"` nữ / `"m"` nam (để chọn giọng), `t` = câu, `py` = pinyin (bắt buộc với tiếng Trung đến hết HSK4), `vi` = dịch.
`lang` mặc định `en-GB` (Anh) / `zh-CN` (Trung); có thể đặt `en-US`.

**Q** (câu hỏi gắn sau `dialog`/`read`):
- trắc nghiệm `{"q":"Where is Lan from?","o":["Hà Nội","Huế","Đà Nẵng"],"a":0,"e":"Lan nói: I'm from Hue → … (giải thích)"}` (`a` = chỉ số đáp án đúng, đếm từ 0)
- điền `{"q":"Lan is a ______.","a":"nurse","alt":["a nurse"],"e":"…"}` (so khớp không phân biệt hoa thường/dấu câu; tiếng Trung chấp nhận cả pinyin không dấu nếu có `py`)

### EX – bài tập tự chấm (10–16 câu/bài, trộn nhiều dạng)

| `t` | Mô tả | Trường |
|---|---|---|
| `mc` | Trắc nghiệm | `q`, `o:[…]`, `a` (chỉ số), `e` |
| `fill` | Điền từ | `q` (dùng `___`), `a`, `alt?:[…]`, `py?`, `e` |
| `order` | Sắp xếp từ thành câu | `q` (hướng dẫn), `w:[…mảnh đã xáo…]`, `a` (câu đúng), `e` |
| `listen` | Nghe (máy đọc `say`) rồi chọn | `say`, `lang?`, `q`, `o`, `a`, `e` |
| `dict` | Nghe chép chính tả | `say`, `lang?`, `a` (chữ chuẩn), `py?` (pinyin – chấp nhận gõ pinyin không dấu), `e?` |
| `match` | Nối cặp | `q`, `pairs:[[trái, phải], …]` (3–6 cặp, game tự xáo cột phải), `e?` |

- `e` = giải thích VÌ SAO đúng/sai bằng tiếng Việt (bắt buộc với mc/fill/order/listen).
- Tiếng Trung: câu hỏi `q` có chữ Hán thì cấp l0–hsk3 kèm pinyin trong ngoặc hoặc trong `py`.
- `order.w`: các mảnh phải ghép lại đúng bằng `a` (bỏ qua hoa thường & dấu câu cuối). Tiếng Trung tách theo từ: `["我","是","越南人"]`.

## 2. File bài thi cấp `exam.json`

```json
{
  "title": "Bài thi cuối cấp A1",
  "time": 45,
  "pass": 70,
  "intro": "Cấu trúc đề, cách tính điểm…",
  "sections": [
    {"h":"Phần 1 – Nghe", "intro":"Nghe 2 lần…", "dialog":{"lang":"en-GB","lines":[…]}, "items":[EX…]},
    {"h":"Phần 2 – Từ vựng & ngữ pháp", "items":[EX…]},
    {"h":"Phần 3 – Đọc hiểu", "read":{"title":"…","text":"…"}, "items":[EX…]},
    {"h":"Phần 4 – Viết", "write":{"task":"…","min":60,"model":"…","rubric":["Đủ ý …","Đúng thì …"]}},
    {"h":"Phần 5 – Nói", "speak":{"tasks":[{"p":"…","model":"…"}],"rubric":["…"]}}
  ]
}
```
- Điểm tự động = các `items` (EX). Viết/Nói: học viên tự chấm theo `rubric` + xem bài mẫu.
- Bài thi cấp: 30–45 câu tự chấm, có ít nhất 1 phần nghe (dialog hoặc các câu `listen`/`dict`).

## 4. Hội thoại giao tiếp `data/lang_src/<track>_talk/NNN.json` (kho nhập vai – nói theo – kiểm tra nghe)

```json
{
  "no": 1,
  "lv": "a1",
  "title": "Gọi đồ uống ở quán cà phê",
  "sub": "At a coffee shop",
  "situation": "Bối cảnh tiếng Việt: ai, ở đâu, muốn gì…",
  "lang": "en-GB",
  "lines": [ {"s":"Barista","g":"f","t":"Hi! What can I get you?","vi":"Chào anh! Anh dùng gì ạ?"}, … ],
  "phrases": [ {"t":"Can I get…?","vi":"Cho tôi…","note":"Cách gọi món tự nhiên; lịch sự hơn: Could I have…?"} ],
  "qs": [ Q, … ],
  "exercises": [ EX, … ],
  "practice": [ {"p":"Đổi vai: bạn là khách, gọi 1 trà sữa ít đá, hỏi giá.","model":"…","py?":"…","vi?":"…"} ]
}
```
- `lv`: cấp phù hợp (`a1`…`c2` / `hsk1`…`hsk79`). `lines` 10–24 câu, 2–4 người nói, ngôn ngữ đời thường tự nhiên đúng cấp. Tiếng Trung có `py` cho mọi câu (đến HSK4).
- `phrases`: 6–12 mẫu câu then chốt + cách dùng/biến thể/mức trang trọng.
- `qs`: 5–8 câu hỏi nghe hiểu (game che lời thoại khi làm – học viên PHẢI nghe).
- `exercises`: 3–6 bài tập tự chấm (điền mẫu câu, sắp xếp, dict một câu then chốt, chọn câu đáp phù hợp).
- `practice`: 2–3 tình huống tự nói (biến thể), có câu mẫu.

## 5. Chuyên đề / Sổ tay giáo viên `data/lang_src/<track>_guide/NN.json`
Như file bài học (`no`, `title`, `sub`, `parts`), thêm `"for"`: `"teacher"` (phương pháp dạy) hoặc `"ref"` (tra cứu chuyên sâu). `exercises`, `teacher` tuỳ chọn. Bài viết dài, sâu, có bảng, ví dụ, lỗi điển hình.

## 3. Đề thi thử `data/lang_src/<track>_mock/NN.json`

Giống `exam.json` + trường `kind`:
- `"kind":"ielts"` – section có `skill`: `L` (Listening), `R` (Reading), `W` (Writing), `S` (Speaking). Game quy đổi số câu đúng L/R (trên 40) ra band. Writing Task 1 có thể kèm biểu đồ:
  `"chart":{"type":"line|bar|pie|table","title":"…","unit":"%","labels":["2000","2010"],"series":[{"name":"…","data":[12,18]}]}` đặt trong `write`.
- `"kind":"hsk"`, `"hsk":1..6|7` – section có `skill`: `L` 听力, `R` 阅读, `W` 书写.
