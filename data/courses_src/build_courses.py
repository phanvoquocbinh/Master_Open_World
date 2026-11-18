# -*- coding: utf-8 -*-
"""Parse course source .txt files (simple line format) and build courses.json.

Usage:
  python -I build.py check <file.txt> [...]      # parse + validate given files only
  python -I build.py build <src_dir> <out.json>   # assemble all 18 courses in fixed order

Source format (UTF-8):
  === COURSE <id>
  name: ...
  icon: ...
  floor: N
  room: NNN
  level: ...
  hours: N
  summary: ...
  ## LESSON <lesson-id> | <title>
  ### <slide heading>
  body line            (blank lines ignored; bullet lines start with '• ')
  ~~~<lang>            (optional single code block per slide, verbatim until a line '~~~')
  ...code...
  ~~~
  PRACTICE: text       (continuation lines allowed until first Q:)
  Q: question
  - wrong option
  + correct option
"""
import json, os, re, sys, zlib

FLOORS = [
    (1, "Tầng 1 · Nền tảng"),
    (2, "Tầng 2 · API & Dữ liệu"),
    (3, "Tầng 3 · Automation Web"),
    (4, "Tầng 4 · Mobile"),
    (5, "Tầng 5 · Hiệu năng & DevOps"),
    (6, "Tầng 6 · Chuyên sâu QA"),
    (7, "Dev City · The Crystal"),
    (8, "Học viện QA · Mở rộng"),
]
ORDER = [
    ("computer-basics", 1, "101"), ("programming-basics", 1, "102"), ("git", 1, "103"),
    ("api", 2, "201"), ("sql", 2, "202"), ("json-regex", 2, "203"),
    ("playwright", 3, "301"), ("selenium", 3, "302"), ("bdd", 3, "303"),
    ("appium", 4, "401"), ("mobile-manual", 4, "402"),
    ("jmeter", 5, "501"), ("k6", 5, "502"), ("cicd", 5, "503"),
    ("test-design", 6, "601"), ("security-basics", 6, "602"), ("ai-for-qa", 6, "603"),
    ("backend", 7, "701"), ("frontend", 7, "702"), ("system-design", 7, "703"),
    ("devops", 7, "704"), ("ai-dev", 7, "705"),
    ("typescript", 7, "706"),
    ("database-design", 7, "707"),
    ("dsa", 7, "708"),
    ("secure-coding", 7, "709"),
    ("mobile-dev", 7, "710"),
    ("cloud-basics", 7, "711"),
    ("manual-testing", 8, "801"),
    ("istqb-foundation", 8, "802"),
    ("test-management", 8, "803"),
    ("bug-life", 8, "804"),
    ("exploratory", 8, "805"),
    ("accessibility", 8, "806"),
    ("database-testing", 8, "807"),
    ("cypress", 8, "808"),

]
NON_TECH = {"mobile-manual", "test-design", "ai-for-qa"}
LANGS = {"ts", "js", "python", "bash", "sql", "xml", "json", "text"}


class ParseError(Exception):
    pass


def parse(path):
    with open(path, encoding="utf-8") as f:
        lines = f.read().replace("\r\n", "\n").replace("\r", "\n").split("\n")
    courses = []
    course = lesson = slide = q = None
    mode = None  # 'meta' | 'slide' | 'code' | 'practice' | 'check'
    code_buf = []
    for no, raw in enumerate(lines, 1):
        line = raw.rstrip()
        where = f"{os.path.basename(path)}:{no}"
        if mode == "code":
            if line.strip() == "~~~":
                while code_buf and not code_buf[-1].strip():
                    code_buf.pop()
                slide["code"] = "\n".join(code_buf)
                code_buf = []
                mode = "slide"
            else:
                code_buf.append(raw.rstrip("\n").rstrip())
            continue
        if line.startswith("=== COURSE "):
            course = {"id": line[len("=== COURSE "):].strip(), "lessons": []}
            courses.append(course)
            lesson = slide = q = None
            mode = "meta"
            continue
        if line.startswith("## LESSON "):
            if course is None:
                raise ParseError(f"{where}: lesson before course")
            rest = line[len("## LESSON "):]
            if "|" not in rest:
                raise ParseError(f"{where}: lesson header needs 'id | title'")
            lid, title = rest.split("|", 1)
            lesson = {"id": lid.strip(), "title": title.strip(), "slides": [], "practice": "", "check": []}
            course["lessons"].append(lesson)
            slide = q = None
            mode = None
            continue
        if line.startswith("### "):
            if lesson is None:
                raise ParseError(f"{where}: slide before lesson")
            if mode in ("practice", "check"):
                raise ParseError(f"{where}: slide after PRACTICE/Q in same lesson")
            slide = {"h": line[4:].strip(), "body": []}
            lesson["slides"].append(slide)
            mode = "slide"
            continue
        if mode == "meta":
            if not line.strip():
                continue
            m = re.match(r"^(name|icon|floor|room|level|hours|summary):\s*(.*)$", line)
            if not m:
                raise ParseError(f"{where}: bad meta line: {line!r}")
            k, v = m.group(1), m.group(2).strip()
            course[k] = int(v) if k in ("floor", "hours") else v
            continue
        if line.startswith("PRACTICE:"):
            if lesson is None:
                raise ParseError(f"{where}: PRACTICE outside lesson")
            lesson["practice"] = line[len("PRACTICE:"):].strip()
            mode = "practice"
            continue
        if line.startswith("Q:"):
            if lesson is None:
                raise ParseError(f"{where}: Q outside lesson")
            q = {"q": line[2:].strip(), "options": [], "answer": None}
            lesson["check"].append(q)
            mode = "check"
            continue
        if mode == "check":
            if not line.strip():
                continue
            if line.startswith("- ") or line.startswith("+ "):
                if line.startswith("+ "):
                    if q["answer"] is not None:
                        raise ParseError(f"{where}: two correct options")
                    q["answer"] = len(q["options"])
                q["options"].append(line[2:].strip())
                continue
            raise ParseError(f"{where}: unexpected line in check block: {line!r}")
        if mode == "practice":
            if line.strip():
                lesson["practice"] += "\n" + line.strip()
            continue
        if mode == "slide":
            if line.startswith("~~~"):
                if "code" in slide:
                    raise ParseError(f"{where}: second code block in one slide")
                lang = line[3:].strip()
                if lang and lang not in LANGS:
                    raise ParseError(f"{where}: unknown lang {lang!r}")
                if lang:
                    slide["lang"] = lang
                mode = "code"
                code_buf = []
                continue
            if line.strip():
                slide["body"].append(line.strip())
            continue
        if line.strip():
            raise ParseError(f"{where}: stray line: {line!r}")
    if mode == "code":
        raise ParseError(f"{path}: unterminated code block")
    for c in courses:
        for l in c["lessons"]:
            for s in l["slides"]:
                s["body"] = "\n".join(s["body"])
    return courses


def normalize(course):
    out = {k: course.get(k) for k in ("id", "name", "icon", "floor", "room", "level", "hours", "summary")}
    out["lessons"] = []
    for l in course["lessons"]:
        slides = []
        for s in l["slides"]:
            o = {"h": s["h"], "body": s["body"]}
            if "code" in s:
                o["code"] = s["code"]
                o["lang"] = s.get("lang", "text")
            slides.append(o)
        checks = []
        for qi, q in enumerate(l["check"]):
            opts, ans = list(q["options"]), q["answer"]
            if ans is not None and len(opts) >= 3:
                # rotate options (keeps their cyclic order) so the correct answer lands on a
                # deterministic pseudo-random position -> balanced A/B/C/D distribution
                target = zlib.crc32(f"{l['id']}#{qi}".encode()) % len(opts)
                shift = (ans - target) % len(opts)
                opts = opts[shift:] + opts[:shift]
                ans = target
            checks.append({"q": q["q"], "options": opts, "answer": ans})
        out["lessons"].append({"id": l["id"], "title": l["title"], "slides": slides,
                               "practice": l["practice"], "check": checks})
    return out


def validate(course, problems):
    cid = course.get("id")
    exp = {c: (f, r) for c, f, r in ORDER}
    if cid not in exp:
        problems.append(f"{cid}: unknown course id")
    else:
        f, r = exp[cid]
        if course.get("floor") != f or course.get("room") != r:
            problems.append(f"{cid}: floor/room {course.get('floor')}/{course.get('room')} != {f}/{r}")
    for k in ("name", "icon", "level", "hours", "summary"):
        if not course.get(k):
            problems.append(f"{cid}: missing {k}")
    ls = course["lessons"]
    if len(ls) != 14:
        problems.append(f"{cid}: {len(ls)} lessons (need 14)")
    n_slides = n_code = 0
    for i, l in enumerate(ls, 1):
        lid = l["id"]
        if lid != f"{cid}-{i:02d}":
            problems.append(f"{cid}: lesson id {lid} should be {cid}-{i:02d}")
        if not l["title"]:
            problems.append(f"{lid}: empty title")
        if not 4 <= len(l["slides"]) <= 8:
            problems.append(f"{lid}: {len(l['slides'])} slides (need 4-8)")
        for s in l["slides"]:
            n_slides += 1
            if s.get("code"):
                n_code += 1
            if not s["h"] or not s["body"]:
                problems.append(f"{lid}: slide missing heading/body: {s['h']!r}")
        if not l["practice"]:
            problems.append(f"{lid}: missing practice")
        expected = (20, 20) if i == 14 else (40, 40) if cid == "istqb-foundation" and i in (12, 13) else (6, 8) if cid == "istqb-foundation" else (2, 3)
        if not expected[0] <= len(l["check"]) <= expected[1]:
            problems.append(f"{lid}: {len(l['check'])} checks (need {expected[0]}-{expected[1]})")
        if i == 14 and l["title"] != "Ôn tập & Thi cuối khoá":
            problems.append(f"{lid}: last lesson must be Ôn tập & Thi cuối khoá")
        if i == (11 if cid == "istqb-foundation" else 13) and "Dự án" not in l["title"]:
            problems.append(f"{lid}: missing practical project lesson")
        for q in l["check"]:
            if len(q["options"]) < 3 or len(q["options"]) > 4:
                problems.append(f"{lid}: question has {len(q['options'])} options: {q['q'][:40]}")
            if q["answer"] is None or not 0 <= q["answer"] < len(q["options"]):
                problems.append(f"{lid}: bad answer index: {q['q'][:40]}")
    ratio = n_code / n_slides if n_slides else 0
    if cid not in NON_TECH and ratio < 0.5:
        problems.append(f"{cid}: only {n_code}/{n_slides} slides have code ({ratio:.0%}), need >=50%")
    return len(ls), n_slides, n_code


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    mode = sys.argv[1]
    if mode == "check":
        problems = []
        for p in sys.argv[2:]:
            for c in parse(p):
                c = normalize(c)
                nl, ns, nc = validate(c, problems)
                print(f"{c['id']:20s} lessons={nl:2d} slides={ns:3d} code={nc:3d} ({nc/ns:.0%})")
        print("\n".join(problems) if problems else "OK - no problems")
        sys.exit(1 if problems else 0)
    elif mode == "build":
        src, out = sys.argv[2], sys.argv[3]
        found = {}
        for fn in sorted(os.listdir(src)):
            if fn.endswith(".txt"):
                for c in parse(os.path.join(src, fn)):
                    if c["id"] in found:
                        raise SystemExit(f"duplicate course {c['id']}")
                    found[c["id"]] = normalize(c)
        problems = []
        courses = []
        for cid, f, r in ORDER:
            if cid not in found:
                problems.append(f"missing course {cid}")
                continue
            courses.append(found[cid])
            validate(found[cid], problems)
        if problems:
            print("\n".join(problems))
            sys.exit(1)
        data = {"version": 1,
                "floors": [{"floor": n, "name": name} for n, name in FLOORS],
                "courses": courses}
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8", newline="\n") as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
            f.write("\n")
        print(f"wrote {out}: {os.path.getsize(out)} bytes")


if __name__ == "__main__":
    main()
