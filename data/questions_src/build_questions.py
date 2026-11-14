import io, json, os, sys

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qb")
OUT = r"F:\Software\Self-Software\Master Dashboard Open World\data\questions.json"

TOPICS = [
    {"id": "istqb", "name": "ISTQB nền tảng", "icon": "📘"},
    {"id": "design", "name": "Kỹ thuật thiết kế test", "icon": "🧩"},
    {"id": "automation", "name": "Automation test", "icon": "🤖"},
    {"id": "api", "name": "API testing", "icon": "🔌"},
    {"id": "db", "name": "Database & SQL", "icon": "🗄️"},
    {"id": "performance", "name": "Performance test", "icon": "⚡"},
    {"id": "mobile", "name": "Mobile testing", "icon": "📱"},
    {"id": "security", "name": "Security testing", "icon": "🔒"},
    {"id": "agile", "name": "Agile & Scrum", "icon": "🔄"},
    {"id": "scenario", "name": "Tình huống thực tế", "icon": "🎯"},
]

# small content fixes applied at build time
FIXES = {
    "agile": [("Chỉ test phần giao diện bên trái màn hình", "Chỉ tập trung kiểm thử trên môi trường production")],
}

questions = []
for t in TOPICS:
    tid = t["id"]
    raw = io.open(os.path.join(SRC, tid + ".json"), encoding="utf-8").read()
    for a, b in FIXES.get(tid, []):
        assert raw.count(a) == 1, (tid, a)
        raw = raw.replace(a, b)
    items = json.loads(raw)
    ppath = os.path.join(SRC, "patch_" + tid + ".json")
    patch = json.load(io.open(ppath, encoding="utf-8")) if os.path.exists(ppath) else {}
    for key, p in patch.items():
        idx = int(key) - 1
        assert 0 <= idx < len(items), (tid, key)
        level, q, options, answer, explain = items[idx]
        if isinstance(p, list):
            p = {"d": p}
        d = p["d"]
        assert len(d) == 3, (tid, key)
        new = list(options)
        if "c" in p:
            new[answer] = p["c"]
        others = [j for j in range(4) if j != answer]
        for j, txt in zip(others, d):
            new[j] = txt
        items[idx] = [level, q, new, answer, explain]
    for i, (level, q, options, answer, explain) in enumerate(items, 1):
        questions.append({
            "id": "%s-%03d" % (tid, i),
            "topic": tid,
            "level": level,
            "q": q,
            "options": options,
            "answer": answer,
            "explain": explain,
        })

# patch2: one longer distractor per question, replacing the current shortest distractor
p2 = json.load(io.open(os.path.join(SRC, "patch2.json"), encoding="utf-8"))
byid = {q["id"]: q for q in questions}
log = []
for qid, txt in p2.items():
    q = byid[qid]
    a = q["answer"]
    others = [j for j in range(4) if j != a]
    j = min(others, key=lambda k: len(q["options"][k]))
    log.append("%s | %s  ==>  %s" % (qid, q["options"][j], txt[:50]))
    q["options"][j] = txt
io.open(os.path.join(os.path.dirname(SRC), "patch2_log.txt"), "w", encoding="utf-8").write("\n".join(log))

data = {"version": 1, "topics": TOPICS, "questions": questions}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")
print("wrote", len(questions), "questions to", OUT)
