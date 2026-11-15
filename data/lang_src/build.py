# -*- coding: utf-8 -*-
"""Trung tâm Ngoại ngữ QC World – kiểm tra & gộp dữ liệu bài học.

  python data/lang_src/build.py              # kiểm tra tất cả + gộp ra data/lang_*.json + data/lang_index.json
  python data/lang_src/build.py --check en_a1   # chỉ kiểm tra 1 thư mục nguồn (không ghi file)

Định dạng: xem data/lang_src/SCHEMA.md
"""
import json, os, re, sys, unicodedata, glob

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.dirname(HERE)

LEVELS = {
  'en': [
    ('l0',  'Cấp 0 · Nhập môn phát âm', 'Pre-A1', 'Bảng chữ cái, 44 âm IPA, âm cuối, trọng âm, ngữ điệu – nền móng để nghe nói chuẩn ngay từ đầu.', 20),
    ('a1',  'Cấp 1 · Sơ cấp', 'CEFR A1', 'Giao tiếp cơ bản: giới thiệu bản thân, gia đình, thói quen, mua sắm; hiện tại đơn/tiếp diễn, quá khứ đơn.', 100),
    ('a2',  'Cấp 2 · Tiền trung cấp', 'CEFR A2 · IELTS ~3.0–3.5', 'Kể chuyện, kế hoạch, so sánh, trải nghiệm; tương lai, hiện tại hoàn thành, modal, câu điều kiện 0–1.', 200),
    ('b1',  'Cấp 3 · Trung cấp', 'CEFR B1 · IELTS 4.0–5.0', 'Bị động, mệnh đề quan hệ, câu tường thuật, điều kiện 2, suy đoán; viết đoạn văn; làm quen IELTS.', 400),
    ('b2',  'Cấp 4 · Trung cao cấp', 'CEFR B2 · IELTS 5.5–6.5', 'Ngữ pháp nâng cao, văn phong học thuật, collocation, mô tả số liệu, kỹ năng nghe–đọc chiến lược.', 600),
    ('c1',  'Cấp 5 · Luyện thi IELTS 6.5→7.5', 'CEFR C1 · IELTS 7.0–7.5', 'Từng dạng bài IELTS Listening, Reading, Writing Task 1–2, Speaking Part 1–3 với chiến lược + bài mẫu.', 800),
    ('c2',  'Cấp 6 · Chinh phục IELTS 8.0+', 'CEFR C1+/C2 · IELTS 8.0–9.0', 'Độ chính xác band 8: từ vựng ít phổ biến, ngữ pháp đa dạng tự nhiên, ý tưởng theo chủ đề, chiến lược phòng thi.', 1000),
  ],
  'zh': [
    ('l0',   'Cấp 0 · Nhập môn pinyin & chữ Hán', '–', 'Thanh điệu, thanh mẫu, vận mẫu, biến điệu, nét chữ, bộ thủ, âm Hán Việt – nền móng phát âm chuẩn.', 20),
    ('hsk1', 'HSK 1', 'Sơ cấp 1 · 150/500 từ', 'Chào hỏi, giới thiệu, số đếm, ngày giờ, ăn uống, mua sắm; câu 是, 有, 吗, 了.', 100),
    ('hsk2', 'HSK 2', 'Sơ cấp 2 · 300/1.272 từ', 'So sánh 比, 正在, 过, bổ ngữ kết quả & trạng thái, 因为…所以…', 200),
    ('hsk3', 'HSK 3', 'Sơ cấp 3 · 600/2.245 từ', 'Câu 把/被, bổ ngữ xu hướng & khả năng, các cặp liên từ; viết câu, đoạn ngắn.', 400),
    ('hsk4', 'HSK 4', 'Trung cấp · 1.200/3.245 từ', 'Chủ đề công việc, giáo dục, sức khoẻ, môi trường; liên từ phức, câu phản vấn, thành ngữ đầu tiên.', 700),
    ('hsk5', 'HSK 5', 'Trung cao · 2.500/4.316 từ', 'Đọc văn dài, liên từ văn viết, từ bốn chữ, viết đoạn 80 chữ.', 1100),
    ('hsk6', 'HSK 6', 'Cao cấp · 5.000/5.456 từ', 'Văn báo chí – học thuật, thành ngữ, 书面语, tìm câu sai, tóm tắt 400 chữ.', 1600),
    ('hsk79','HSK 7–9', 'Cao cấp HSK 3.0 · 11.092 từ', 'Nghị luận, dịch Việt⇄Trung, văn ngôn cơ bản, thuyết trình học thuật.', 2500),
  ],
  # Khung khoá học chưa có dữ liệu (V2: học viện Kyoto & Hanok đã xây – nội dung soạn sau)
  'ja': [
    ('kana', 'Cấp 0 · Hiragana & Katakana', '–', 'Bảng chữ Hiragana, Katakana, phát âm, trường âm, âm ngắt; viết chữ đúng nét.', 30),
    ('n5', 'JLPT N5', 'Sơ cấp 1 · ~800 từ', 'Chào hỏi, giới thiệu, số đếm, thời gian; です/ます, trợ từ は・が・を・に.', 150),
    ('n4', 'JLPT N4', 'Sơ cấp 2 · ~1.500 từ', 'Thể て, thể ない, thể khả năng, so sánh; ~300 Kanji.', 300),
    ('n3', 'JLPT N3', 'Trung cấp · ~3.750 từ', 'Kính ngữ cơ bản, bị động – sai khiến; đọc báo đơn giản.', 600),
    ('n2', 'JLPT N2', 'Trung cao · ~6.000 từ', 'Văn viết, ngữ pháp N2, đọc hiểu dài, nghe tin tức.', 1000),
    ('n1', 'JLPT N1', 'Cao cấp · ~10.000 từ', 'Văn học thuật, kính ngữ nâng cao, thành ngữ.', 1600),
    ('it', 'Tiếng Nhật IT', 'Chuyên ngành', 'Từ vựng & hội thoại IT: họp, báo cáo bug, đặc tả, email công việc.', 200),
  ],
  'ko': [
    ('hangul', 'Cấp 0 · Hangul', '–', 'Bảng chữ Hangul: nguyên âm, phụ âm, patchim, quy tắc nối âm.', 20),
    ('t1', 'TOPIK 1', 'Sơ cấp 1 · ~800 từ', 'Chào hỏi, giới thiệu, mua sắm; đuôi câu 입니다/요.', 150),
    ('t2', 'TOPIK 2', 'Sơ cấp 2 · ~1.500 từ', 'Quá khứ – tương lai, nối câu, kính ngữ cơ bản.', 300),
    ('t3', 'TOPIK 3', 'Trung cấp 1', 'Hội thoại công sở, đọc văn bản ngắn, viết đoạn.', 500),
    ('t4', 'TOPIK 4', 'Trung cấp 2', 'Đọc báo, nghe tin tức, viết bài 300 chữ.', 700),
    ('t5', 'TOPIK 5', 'Cao cấp 1', 'Văn bản học thuật, thuyết trình, nghị luận.', 1000),
    ('t6', 'TOPIK 6', 'Cao cấp 2', 'Thành ngữ, văn viết chuyên ngành, viết luận 600–700 chữ.', 1300),
  ],
}
PY_REQUIRED = {'l0', 'hsk1', 'hsk2', 'hsk3', 'hsk4'}

PART_K = {'text', 'sounds', 'words', 'grammar', 'dialog', 'read', 'speak', 'write', 'chars'}
EX_T = {'mc', 'fill', 'order', 'listen', 'dict', 'match'}
ALLOWED_TAGS = {'p', 'b', 'i', 'u', 'br', 'ul', 'ol', 'li', 'table', 'tr', 'th', 'td', 'span', 'small', 'h4', 'thead', 'tbody', 'em', 'strong', 'sup', 'sub'}

PUNCT = re.compile(r"[\s\.,!\?;:'\"’‘“”，。！？、；：（）\(\)\-–—…·]+")
def norm(s):
    s = unicodedata.normalize('NFD', str(s).lower())
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    return PUNCT.sub('', s)

class Rep:
    def __init__(s): s.err = []; s.warn = []
    def E(s, where, msg): s.err.append(f'{where}: {msg}')
    def W(s, where, msg): s.warn.append(f'{where}: {msg}')

def check_html(rep, where, html):
    if not isinstance(html, str): rep.E(where, 'html phải là chuỗi'); return
    if re.search(r'<\s*script|\son\w+\s*=|javascript:', html, re.I): rep.E(where, 'html chứa script/on*= – không được phép')
    for t in re.findall(r'<\s*/?\s*([a-zA-Z0-9]+)', html):
        if t.lower() not in ALLOWED_TAGS: rep.W(where, f'thẻ HTML <{t}> ngoài danh sách cho phép')

def is_zh(track): return track == 'zh'

def check_q(rep, where, q, track):
    if not isinstance(q, dict) or 'q' not in q: rep.E(where, 'câu hỏi thiếu "q"'); return
    if 'o' in q:
        if not isinstance(q['o'], list) or len(q['o']) < 2: rep.E(where, '"o" phải là danh sách ≥2 lựa chọn')
        elif not isinstance(q.get('a'), int) or not (0 <= q['a'] < len(q['o'])): rep.E(where, f'"a" phải là chỉ số 0..{len(q["o"])-1}')
        if len(set(map(str, q.get('o', [])))) != len(q.get('o', [])): rep.W(where, 'các lựa chọn bị trùng nhau')
    else:
        if not isinstance(q.get('a'), str) or not q['a'].strip(): rep.E(where, 'câu điền thiếu đáp án "a" (chuỗi)')
    if not q.get('e'): rep.W(where, 'thiếu giải thích "e"')

def check_ex(rep, where, x, track):
    t = x.get('t') if isinstance(x, dict) else None
    if t not in EX_T: rep.E(where, f'"t" phải thuộc {sorted(EX_T)}'); return
    if t in ('mc', 'listen'):
        if t == 'listen' and not x.get('say'): rep.E(where, 'listen thiếu "say"')
        if not x.get('q') and t == 'mc': rep.E(where, 'thiếu "q"')
        o = x.get('o')
        if not isinstance(o, list) or len(o) < 2: rep.E(where, '"o" phải ≥2 lựa chọn')
        elif not isinstance(x.get('a'), int) or not (0 <= x['a'] < len(o)): rep.E(where, f'"a" phải là chỉ số 0..{len(o)-1}')
        elif len(set(map(str, o))) != len(o): rep.W(where, 'lựa chọn trùng nhau')
    elif t == 'fill':
        if not x.get('q'): rep.E(where, 'thiếu "q"')
        if not isinstance(x.get('a'), str) or not x['a'].strip(): rep.E(where, 'fill thiếu "a"')
        if '___' not in str(x.get('q', '')) and '…' not in str(x.get('q', '')) and '(' not in str(x.get('q', '')): rep.W(where, 'fill: câu hỏi nên có ___ chỗ trống')
    elif t == 'order':
        w = x.get('w'); a = x.get('a')
        if not isinstance(w, list) or len(w) < 2: rep.E(where, 'order: "w" phải là danh sách mảnh')
        elif not isinstance(a, str): rep.E(where, 'order: thiếu "a"')
        elif sorted(norm(''.join(w))) != sorted(norm(a)):   # w đã xáo – chỉ cần đúng bộ mảnh của a
            rep.E(where, f'order: các mảnh {w} không ghép được thành "{a}"')
    elif t == 'dict':
        if not x.get('say') or not x.get('a'): rep.E(where, 'dict thiếu "say"/"a"')
        if is_zh(track) and not x.get('py'): rep.W(where, 'dict tiếng Trung nên có "py" để chấp nhận gõ pinyin')
    elif t == 'match':
        p = x.get('pairs')
        if not isinstance(p, list) or len(p) < 2 or any(not isinstance(i, list) or len(i) != 2 for i in p): rep.E(where, 'match: "pairs" phải là [[trái, phải], …]')
        elif len(set(str(i[1]) for i in p)) != len(p): rep.E(where, 'match: vế phải bị trùng')
    if t in ('mc', 'fill', 'order', 'listen') and not x.get('e'): rep.W(where, 'thiếu giải thích "e"')

def check_words(rep, where, items, track):
    if not isinstance(items, list) or not items: rep.E(where, 'words.items rỗng'); return 0
    for i, w in enumerate(items):
        wh = f'{where}.items[{i}]'
        if not w.get('w') or not w.get('vi'): rep.E(wh, 'từ thiếu "w"/"vi"')
        if is_zh(track):
            if not w.get('py'): rep.E(wh, f'thiếu pinyin "py" ({w.get("w")})')
            if 'hv' not in w: rep.W(wh, f'thiếu âm Hán Việt "hv" ({w.get("w")})')
        else:
            if not w.get('ipa'): rep.W(wh, f'thiếu IPA ({w.get("w")})')
    return len(items)

def check_lines(rep, where, lines, track, level):
    if not isinstance(lines, list) or not lines: rep.E(where, 'lines rỗng'); return
    for i, l in enumerate(lines):
        wh = f'{where}.lines[{i}]'
        if not l.get('t'): rep.E(wh, 'thiếu "t"')
        if l.get('g') not in ('f', 'm'): rep.W(wh, '"g" nên là "f"/"m"')
        if is_zh(track) and level in PY_REQUIRED and not l.get('py'): rep.E(wh, 'thiếu pinyin "py"')

def check_part(rep, where, p, track, level, stats):
    k = p.get('k') if isinstance(p, dict) else None
    if k not in PART_K: rep.E(where, f'"k" phải thuộc {sorted(PART_K)}'); return
    if not p.get('h'): rep.W(where, 'thiếu tiêu đề "h"')
    if 'html' in p: check_html(rep, where, p['html'])
    if k == 'text' and not p.get('html'): rep.E(where, 'text thiếu html')
    elif k == 'sounds':
        for i, s in enumerate(p.get('items') or []):
            if not s.get('sym') or not s.get('vi'): rep.E(f'{where}.items[{i}]', 'sounds thiếu "sym"/"vi"')
        if not p.get('items'): rep.E(where, 'sounds thiếu items')
    elif k == 'words': stats['words'] += check_words(rep, where, p.get('items'), track)
    elif k == 'grammar':
        if not p.get('html') and not p.get('table'): rep.E(where, 'grammar cần html hoặc table')
        for i, e in enumerate(p.get('ex') or []):
            if not e.get('t'): rep.E(f'{where}.ex[{i}]', 'ví dụ thiếu "t"')
            if is_zh(track) and level in PY_REQUIRED and not e.get('py'): rep.W(f'{where}.ex[{i}]', 'ví dụ tiếng Trung nên có "py"')
        for e in p.get('tips') or []: check_html(rep, where + '.tips', e)
    elif k == 'dialog':
        check_lines(rep, where, p.get('lines'), track, level); stats['lines'] += len(p.get('lines') or [])
        for i, q in enumerate(p.get('qs') or []): check_q(rep, f'{where}.qs[{i}]', q, track)
    elif k == 'read':
        if not p.get('text'): rep.E(where, 'read thiếu text')
        for i, q in enumerate(p.get('qs') or []): check_q(rep, f'{where}.qs[{i}]', q, track)
    elif k == 'speak':
        if not p.get('tasks'): rep.E(where, 'speak thiếu tasks')
        for i, t in enumerate(p.get('tasks') or []):
            if not t.get('p'): rep.E(f'{where}.tasks[{i}]', 'thiếu "p"')
    elif k == 'write':
        if not p.get('task') or not p.get('model'): rep.E(where, 'write thiếu task/model')
    elif k == 'chars':
        for i, c in enumerate(p.get('items') or []):
            if not c.get('c') or not c.get('py'): rep.E(f'{where}.items[{i}]', 'chars thiếu "c"/"py"')

def check_lesson(rep, f, L, track, level, stats):
    for key in ('no', 'title', 'parts', 'exercises'):
        if key not in L: rep.E(f, f'thiếu "{key}"')
    if not isinstance(L.get('no'), int): rep.E(f, '"no" phải là số nguyên')
    if not L.get('goals'): rep.W(f, 'thiếu "goals"')
    for i, p in enumerate(L.get('parts') or []): check_part(rep, f'{f} parts[{i}]', p, track, level, stats)
    ex = L.get('exercises') or []
    if len(ex) < 8: rep.W(f, f'chỉ có {len(ex)} bài tập (nên 10–16)')
    for i, x in enumerate(ex): check_ex(rep, f'{f} exercises[{i}]', x, track)
    stats['ex'] += len(ex)
    kinds = {p.get('k') for p in L.get('parts') or []}
    if 'dialog' not in kinds and not any(x.get('t') in ('listen', 'dict') for x in ex): rep.W(f, 'bài không có phần nghe (dialog / listen / dict)')
    T = L.get('teacher')
    if not isinstance(T, dict) or not T.get('steps'): rep.W(f, 'thiếu giáo án "teacher.steps"')

def check_exam(rep, f, X, track, level, stats):
    if not X.get('sections'): rep.E(f, 'exam thiếu sections'); return
    n = 0; listen = False
    for i, s in enumerate(X['sections']):
        wh = f'{f} sections[{i}]'
        if s.get('dialog'): check_lines(rep, wh + '.dialog', s['dialog'].get('lines'), track, level); listen = True
        if s.get('read') and not s['read'].get('text'): rep.E(wh, 'read thiếu text')
        for j, x in enumerate(s.get('items') or []):
            check_ex(rep, f'{wh}.items[{j}]', x, track); n += 1
            if x.get('t') in ('listen', 'dict'): listen = True
        if s.get('write') and (not s['write'].get('task') or not s['write'].get('model')): rep.E(wh, 'write thiếu task/model')
    stats['examItems'] += n
    return n, listen

def load(rep, path):
    try:
        with open(path, encoding='utf-8') as fh: return json.load(fh)
    except Exception as e:
        rep.E(os.path.relpath(path, DATA), f'JSON lỗi: {e}'); return None

def check_talk(rep, f, T, track, stats):
    for key in ('no', 'title', 'lines'):
        if key not in T: rep.E(f, f'thiếu "{key}"')
    if T.get('lv') is None: rep.W(f, 'thiếu "lv" (cấp độ)')
    lv = T.get('lv') or ''
    check_lines(rep, f, T.get('lines'), track, lv if lv in PY_REQUIRED else 'x')
    stats['lines'] += len(T.get('lines') or [])
    if len({l.get('s') for l in T.get('lines') or []}) < 2: rep.E(f, 'hội thoại cần ≥ 2 người nói')
    for i, p in enumerate(T.get('phrases') or []):
        if not p.get('t') or not p.get('vi'): rep.E(f'{f} phrases[{i}]', 'thiếu "t"/"vi"')
    qs = T.get('qs') or []
    if len(qs) < 4: rep.W(f, f'chỉ có {len(qs)} câu hỏi nghe (nên 5–8)')
    for i, q in enumerate(qs): check_q(rep, f'{f} qs[{i}]', q, track)
    for i, x in enumerate(T.get('exercises') or []): check_ex(rep, f'{f} exercises[{i}]', x, track)
    stats['ex'] += len(qs) + len(T.get('exercises') or [])

def build_dir(rep, d, write=True):
    name = os.path.basename(d); track, level = name.split('_', 1)
    stats = {'words': 0, 'ex': 0, 'lines': 0, 'examItems': 0}
    if level == 'talk':
        talks = []
        for p in sorted(glob.glob(os.path.join(d, '[0-9]*.json'))):
            T = load(rep, p)
            if T is None: continue
            check_talk(rep, os.path.relpath(p, DATA), T, track, stats)
            T['id'] = f'{track}-talk-{int(T.get("no", 0)):03d}'
            talks.append(T)
        talks.sort(key=lambda T: T.get('no', 0))
        nos = [T.get('no') for T in talks]
        if len(set(nos)) != len(nos): rep.E(name, f'số hội thoại bị trùng: {nos}')
        out = {'track': track, 'level': 'talk', 'talks': talks}
        meta = {'talks': [{'no': T.get('no'), 'lv': T.get('lv'), 'title': T.get('title'), 'sub': T.get('sub', '')} for T in talks]}
    elif level == 'guide':
        arts = []
        for p in sorted(glob.glob(os.path.join(d, '[0-9]*.json'))):
            L = load(rep, p)
            if L is None: continue
            f = os.path.relpath(p, DATA)
            if not L.get('title') or not L.get('parts'): rep.E(f, 'chuyên đề thiếu title/parts')
            for i, pt in enumerate(L.get('parts') or []): check_part(rep, f'{f} parts[{i}]', pt, track, 'x', stats)
            for i, x in enumerate(L.get('exercises') or []): check_ex(rep, f'{f} exercises[{i}]', x, track)
            stats['ex'] += len(L.get('exercises') or [])
            L['id'] = f'{track}-guide-{int(L.get("no", 0)):02d}'
            arts.append(L)
        arts.sort(key=lambda L: L.get('no', 0))
        out = {'track': track, 'level': 'guide', 'articles': arts}
        meta = {'articles': [{'no': L.get('no'), 'title': L.get('title'), 'sub': L.get('sub', ''), 'for': L.get('for', '')} for L in arts]}
    elif level == 'mock':
        tests = []
        for p in sorted(glob.glob(os.path.join(d, '*.json'))):
            X = load(rep, p)
            if X is None: continue
            f = os.path.relpath(p, DATA)
            if X.get('kind') not in ('ielts', 'hsk'): rep.E(f, '"kind" phải là ielts/hsk')
            n, _ = check_exam(rep, f, X, track, 'hsk1' if X.get('kind') == 'hsk' and (X.get('hsk') or 9) <= 4 else 'mock', stats) or (0, 0)
            X['id'] = X.get('id') or f'{track}-mock-{os.path.splitext(os.path.basename(p))[0]}'
            tests.append(X)
        out = {'track': track, 'level': 'mock', 'tests': tests}
        meta = {'tests': [{'id': t['id'], 'title': t.get('title'), 'kind': t.get('kind'), 'hsk': t.get('hsk'), 'time': t.get('time'), 'items': sum(len(s.get('items') or []) for s in t.get('sections', []))} for t in tests]}
    else:
        lessons = []
        for p in sorted(glob.glob(os.path.join(d, '[0-9]*.json'))):
            L = load(rep, p)
            if L is None: continue
            check_lesson(rep, os.path.relpath(p, DATA), L, track, level, stats)
            L['id'] = f'{track}-{level}-{int(L.get("no", 0)):02d}'
            lessons.append(L)
        lessons.sort(key=lambda L: L.get('no', 0))
        nos = [L.get('no') for L in lessons]
        if nos != list(range(1, len(nos) + 1)): rep.E(name, f'số bài không liên tục: {nos}')
        exam = None; ep = os.path.join(d, 'exam.json')
        if os.path.exists(ep):
            exam = load(rep, ep)
            if exam:
                r = check_exam(rep, os.path.relpath(ep, DATA), exam, track, level, stats)
                if r:
                    n, listen = r
                    if n < 25: rep.W(name, f'bài thi cấp chỉ có {n} câu tự chấm (nên 30–45)')
                    if not listen: rep.W(name, 'bài thi cấp chưa có phần nghe')
        else: rep.W(name, 'chưa có exam.json')
        out = {'track': track, 'level': level, 'lessons': lessons, 'exam': exam}
        meta = {'lessons': [{'no': L.get('no'), 'title': L.get('title'), 'sub': L.get('sub', '')} for L in lessons], 'hasExam': bool(exam), 'examItems': stats['examItems']}
    meta.update({'words': stats['words'], 'exercises': stats['ex'], 'lines': stats['lines']})
    if write:
        with open(os.path.join(DATA, f'lang_{track}_{level}.json'), 'w', encoding='utf-8') as fh:
            json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    return track, level, meta

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
    args = sys.argv[1:]
    rep = Rep()
    if args and args[0] == '--check':
        d = os.path.join(HERE, args[1])
        if not os.path.isdir(d): print('Không thấy thư mục', d); sys.exit(2)
        _, _, meta = build_dir(rep, d, write=False)
        print(json.dumps({k: v for k, v in meta.items() if k not in ('lessons', 'tests', 'talks', 'articles')}, ensure_ascii=False))
        for m in meta.get('lessons', []) + meta.get('talks', []) + meta.get('articles', []): print(f"  {m['no']}: {m['title']}")
    else:
        idx = {'version': 1, 'tracks': {}}
        found = {}
        for d in sorted(glob.glob(os.path.join(HERE, '*_*'))):
            if not os.path.isdir(d): continue
            track, level, meta = build_dir(rep, d)
            found[(track, level)] = meta
        for track, levels in LEVELS.items():
            T = idx['tracks'][track] = {'levels': [], 'mock': found.get((track, 'mock')), 'talk': found.get((track, 'talk')), 'guide': found.get((track, 'guide'))}
            for code, name, eq, desc, hours in levels:
                m = found.get((track, code))
                T['levels'].append({'code': code, 'name': name, 'eq': eq, 'desc': desc, 'hours': hours, 'file': f'lang_{track}_{code}.json' if m else None, **(m or {'lessons': []})})
        with open(os.path.join(DATA, 'lang_index.json'), 'w', encoding='utf-8') as fh:
            json.dump(idx, fh, ensure_ascii=False, indent=1)
        tot = sum(len(m.get('lessons', [])) for m in found.values())
        print(f'Đã gộp {len(found)} thư mục, {tot} bài.')
    for e in rep.err: print('LỖI  ', e)
    for w in rep.warn[:200]: print('cảnh báo', w)
    if len(rep.warn) > 200: print(f'… và {len(rep.warn) - 200} cảnh báo nữa')
    print(f'{len(rep.err)} lỗi, {len(rep.warn)} cảnh báo')
    sys.exit(1 if rep.err else 0)

if __name__ == '__main__':
    main()
