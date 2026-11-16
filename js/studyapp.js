// 📚 TÀI LIỆU HỌC TẬP – app trên laptop (phím L) – 16/11/2026
//  Học mọi thứ ngay trên laptop, không cần tới lớp (cho người dễ say 3D):
//   • QA/QC và Dev: lộ trình theo tầng → khoá → bài (slide + code) → kiểm tra cuối bài → thi cuối khoá → chứng chỉ.
//     Dữ liệu data/courses.json, tiến độ dùng chung với Toà Giáo trình (S.learn.done / S.learn.certs).
//   • Ngoại ngữ: mở ứng dụng học ngoại ngữ (langui.js qua W.lang.open) – lộ trình, bài học, kiểm tra, thi thử, hội thoại.
//  Gọi: studyApp(box, arg, env) với env = {W, S, save, addCoins, toast, lapClose}. arg = {course:'api'} để mở thẳng 1 khoá.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let DATA = null, loadP = null;
const load = () => DATA ? Promise.resolve(DATA) : (loadP ||= fetch('data/courses.json', {cache:'no-store'}).then(r => r.json()).then(d => (DATA = d)));

const TRACKS = {
  qa:  {icon:'🧪', name:'QA / QC', sub:'Kiểm thử phần mềm từ số 0 → automation, hiệu năng, bảo mật', floors:f => f !== 7},
  dev: {icon:'💻', name:'Dev', sub:'Backend, Frontend, Thiết kế hệ thống, DevOps, AI cho lập trình viên', floors:f => f === 7},
};
const LANGS = [
  {t:'en', icon:'🇬🇧', name:'Tiếng Anh', sub:'Phát âm → A1 … C2, luyện IELTS', mock:'Thi thử IELTS'},
  {t:'zh', icon:'🇨🇳', name:'Tiếng Trung', sub:'Pinyin → HSK 1 … HSK 7–9', mock:'Thi thử HSK'},
  {t:'ja', icon:'🇯🇵', name:'Tiếng Nhật', sub:'Kana → N5 … N1, tiếng Nhật công sở IT', mock:'Thi thử JLPT'},
  {t:'ko', icon:'🇰🇷', name:'Tiếng Hàn', sub:'Hangul → TOPIK 1 … 6', mock:'Thi thử TOPIK'},
];
const PASS = .8, EXAM_N = 20;
const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function studyApp(box, arg, env){
  const {W, S, save, addCoins, toast, lapClose} = env;
  S.learn = Object.assign({done:{}, certs:{}, exam:{}}, S.learn || {}); S.learn.exam ||= {};
  const L = S.learn, root = document.createElement('div'); root.className = 'stA'; box.appendChild(root);
  const crumbs = [];   // lịch sử để nút ← quay lại
  const go = (fn, ...a) => { crumbs.push([fn, a]); fn(...a); root.scrollTop = 0; };
  const back = () => { crumbs.pop(); const p = crumbs[crumbs.length - 1]; if(p){ crumbs.pop(); go(p[0], ...p[1]); } else go(home); };
  const head = (title, sub) => `<div class="stH">${crumbs.length > 1 ? '<button class="stBk">← Quay lại</button>' : ''}<div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div></div>`;
  const bindBack = () => { const b = root.querySelector('.stBk'); if(b) b.onclick = back; };
  const nDone = c => c.lessons.filter(l => L.done[l.id]).length;
  const bar = (a, b) => `<div class="stBar"><i style="width:${b ? Math.round(a / b * 100) : 0}%"></i></div>`;
  const coursesOf = k => DATA.courses.filter(c => TRACKS[k].floors(c.floor));
  const cert = c => { if(L.certs[c.id]) return; L.certs[c.id] = new Date().toLocaleDateString('vi-VN'); save(); addCoins(100, `🏅 Chứng chỉ khoá ${c.name}! +100 💰`); };

  /* ---------- màn hình chính ---------- */
  function home(){
    const tile = (k, ic, name, sub, stat) => `<button class="stTile" data-k="${k}"><b>${ic}</b><div><h3>${esc(name)}</h3><p>${esc(sub)}</p>${stat}</div></button>`;
    const stat = k => { const cs = coursesOf(k), tot = cs.reduce((a, c) => a + c.lessons.length, 0), dn = cs.reduce((a, c) => a + nDone(c), 0), ce = cs.filter(c => L.certs[c.id]).length;
      return `<small>${cs.length} khoá · ${tot} bài · đã học ${dn} · 🏅 ${ce}</small>${bar(dn, tot)}`; };
    root.innerHTML = `${head('📚 Tài liệu học tập', 'Học mọi thứ ngay trên laptop – xem lộ trình, học bài, làm kiểm tra và thi cuối khoá. Thích đến lớp thì vẫn học ở lớp được, tiến độ dùng chung.')}
      <div class="stTiles">${tile('qa', TRACKS.qa.icon, TRACKS.qa.name, TRACKS.qa.sub, stat('qa'))}${tile('dev', TRACKS.dev.icon, TRACKS.dev.name, TRACKS.dev.sub, stat('dev'))}
      ${tile('lang', '🌏', 'Ngoại ngữ', 'Tiếng Anh · Trung · Nhật · Hàn – từ số 0 tới thi chứng chỉ', '<small>Lộ trình từng cấp · bài học · kiểm tra · thi thử · hội thoại</small>')}</div>`;
    root.querySelectorAll('.stTile').forEach(b => b.onclick = () => b.dataset.k === 'lang' ? go(langs) : go(track, b.dataset.k)); bindBack(); }

  /* ---------- lộ trình QA/QC hoặc Dev ---------- */
  function track(k){ const T = TRACKS[k], fl = DATA.floors.filter(f => T.floors(f.floor));
    root.innerHTML = `${head(`${T.icon} Lộ trình ${esc(T.name)}`, 'Học lần lượt từng chặng từ trên xuống. Mỗi khoá: học bài → kiểm tra cuối bài → thi cuối khoá (đạt ≥ 80 % hoặc học hết bài là có chứng chỉ 🏅).')}
      ${k === 'qa' ? '<div class="stRow"><button class="stBtn stQB">🎓 Ngân hàng câu hỏi QA/QC (luyện có thưởng)</button></div>' : ''}
      <ol class="stPath">${fl.map((f, i) => `<li><div class="stStep"><span>Chặng ${i + 1}</span><b>${esc(f.name.replace(/^Tầng \d+ · /, ''))}</b></div><div class="stCards">${DATA.courses.filter(c => c.floor === f.floor).map(c => { const n = nDone(c);
        return `<button class="stCard" data-c="${esc(c.id)}"><div class="stCt"><b>${c.icon}</b><span>${esc(c.name)}</span>${L.certs[c.id] ? '<em>🏅</em>' : ''}</div><small>${esc(c.level)} · ${c.hours} giờ · ${n}/${c.lessons.length} bài${L.exam[c.id] != null ? ` · thi ${L.exam[c.id]}%` : ''}</small>${bar(n, c.lessons.length)}</button>`; }).join('')}</div></li>`).join('')}</ol>`;
    root.querySelectorAll('.stCard').forEach(b => b.onclick = () => go(course, b.dataset.c));
    const qb = root.querySelector('.stQB'); if(qb) qb.onclick = () => { if(W.life && W.life.openQuiz){ lapClose(); setTimeout(() => W.life.openQuiz(), 450); } else toast('Ngân hàng câu hỏi chưa sẵn sàng', 2000); };
    bindBack(); }

  /* ---------- 1 khoá ---------- */
  function course(id){ const c = DATA.courses.find(x => x.id === id); if(!c) return go(home); const n = nDone(c), nq = c.lessons.reduce((a, l) => a + (l.check || []).length, 0);
    root.innerHTML = `${head(`${c.icon} ${esc(c.name)}`, esc(c.summary))}
      <p class="stMut">${esc(c.level)} · ${c.hours} giờ · học ở lớp: phòng P.${esc(c.room)} · tiến độ <b>${n}/${c.lessons.length}</b> bài${L.certs[c.id] ? ` · 🏅 chứng chỉ ngày ${esc(L.certs[c.id])}` : ''}</p>${bar(n, c.lessons.length)}
      <div class="stRow"><button class="stBtn pri stCont">▶ ${n ? 'Học tiếp' : 'Bắt đầu học'}</button><button class="stBtn stEx" ${nq ? '' : 'disabled'}>📝 Thi cuối khoá (${Math.min(EXAM_N, nq)} câu)${L.exam[c.id] != null ? ` · điểm cao nhất ${L.exam[c.id]}%` : ''}</button></div>
      <div class="stList">${c.lessons.map((l, i) => `<button class="stLes" data-l="${i}"><span>Bài ${i + 1}</span><b>${esc(l.title)}</b><small>${l.slides.length} slide · ${(l.check || []).length} câu kiểm tra</small>${L.done[l.id] ? '<em>✓</em>' : ''}</button>`).join('')}</div>`;
    root.querySelectorAll('.stLes').forEach(b => b.onclick = () => go(lesson, id, +b.dataset.l, 0));
    root.querySelector('.stCont').onclick = () => { const i = c.lessons.findIndex(l => !L.done[l.id]); go(lesson, id, i < 0 ? 0 : i, 0); };
    root.querySelector('.stEx').onclick = () => go(exam, id);
    bindBack(); }

  /* ---------- 1 bài: slide → luyện tập → kiểm tra ---------- */
  function lesson(id, li, si){ const c = DATA.courses.find(x => x.id === id), l = c.lessons[li], ns = l.slides.length;
    if(si >= ns){ return quiz(c, li); }
    const s = l.slides[si];
    root.innerHTML = `${head(`Bài ${li + 1}: ${esc(l.title)}`, `${c.icon} ${esc(c.name)} · slide ${si + 1}/${ns}`)}
      <div class="stSlide"><h3>${esc(s.h)}</h3><div class="stBody">${esc(s.body)}</div>${s.code ? `<pre class="stCode"><span>${esc(s.lang || 'code')}</span>${esc(s.code)}</pre>` : ''}
      ${si === ns - 1 && l.practice ? `<div class="stPr"><b>🛠️ Thực hành</b><div>${esc(l.practice)}</div></div>` : ''}</div>
      <div class="stRow"><button class="stBtn stP" ${si ? '' : 'disabled'}>◀ Trước</button><span class="stSp"></span><button class="stBtn pri stN">${si === ns - 1 ? ((l.check || []).length ? '📝 Làm kiểm tra cuối bài' : '✅ Hoàn thành bài') : 'Tiếp ▶'}</button></div>`;
    root.querySelector('.stP').onclick = () => lesson(id, li, si - 1);
    root.querySelector('.stN').onclick = () => { root.scrollTop = 0; lesson(id, li, si + 1); };
    bindBack(); }

  function finishLesson(c, li){ const l = c.lessons[li];
    if(!L.done[l.id]){ L.done[l.id] = 1; save(); addCoins(10, `📖 Học xong bài “${l.title}” +10 💰`); }
    if(c.lessons.every(x => L.done[x.id])) cert(c); }

  /* ---------- bộ câu hỏi dùng chung (kiểm tra bài / thi cuối khoá) ---------- */
  function runQs(qs, title, sub, onEnd){ let i = 0, ok = 0;
    const ask = () => { if(i >= qs.length) return onEnd(ok, qs.length); const q = qs[i];
      root.innerHTML = `${head(title, `${sub} · câu ${i + 1}/${qs.length} · đúng ${ok}`)}${bar(i, qs.length)}
        <div class="stQ"><h3>${esc(q.q)}</h3>${q.options.map((o, k) => `<button class="stOpt" data-k="${k}">${String.fromCharCode(65 + k)}. ${esc(o)}</button>`).join('')}</div><div class="stRow stNx" hidden><span class="stSp"></span><button class="stBtn pri">${i + 1 < qs.length ? 'Câu tiếp ▶' : 'Xem kết quả'}</button></div>`;
      root.querySelectorAll('.stOpt').forEach(b => b.onclick = () => { if(root.querySelector('.stOpt.ok')) return; const k = +b.dataset.k, right = k === q.answer; if(right) ok++;
        root.querySelectorAll('.stOpt').forEach((x, j) => { x.disabled = true; if(j === q.answer) x.classList.add('ok'); }); if(!right) b.classList.add('bad');
        const nx = root.querySelector('.stNx'); nx.hidden = false; nx.querySelector('button').onclick = () => { i++; ask(); }; });
      bindBack(); };
    ask(); }

  function quiz(c, li){ const l = c.lessons[li], qs = l.check || [];
    const end = (ok, n) => { const pass = !n || ok / n >= .6; if(pass) finishLesson(c, li);
      root.innerHTML = `${head(`Bài ${li + 1}: ${esc(l.title)}`, `${c.icon} ${esc(c.name)}`)}<div class="stRes ${pass ? 'ok' : 'bad'}"><b>${pass ? '✅' : '🔁'}</b><h3>${n ? `Đúng ${ok}/${n} câu` : 'Đã học xong bài'}</h3><p>${pass ? 'Hoàn thành bài!' : 'Cần đúng ít nhất 60 % – xem lại slide rồi làm lại nhé.'}</p></div>
        <div class="stRow"><button class="stBtn stRe">${pass ? '↺ Xem lại bài' : '↺ Học lại bài'}</button><span class="stSp"></span>${li + 1 < c.lessons.length ? '<button class="stBtn pri stNext">Bài tiếp ▶</button>' : '<button class="stBtn pri stEnd">📝 Thi cuối khoá</button>'}</div>`;
      root.querySelector('.stRe').onclick = () => lesson(c.id, li, 0);
      const nx = root.querySelector('.stNext'); if(nx) nx.onclick = () => lesson(c.id, li + 1, 0);
      const ed = root.querySelector('.stEnd'); if(ed) ed.onclick = () => go(exam, c.id); bindBack(); };
    if(!qs.length) return end(0, 0);
    runQs(shuffle(qs), `📝 Kiểm tra: ${esc(l.title)}`, `${c.icon} ${esc(c.name)}`, end); }

  function exam(id){ const c = DATA.courses.find(x => x.id === id), pool = c.lessons.flatMap(l => l.check || []), qs = shuffle(pool).slice(0, EXAM_N);
    root.innerHTML = `${head(`📝 Thi cuối khoá · ${esc(c.name)}`, `${qs.length} câu trộn từ cả ${c.lessons.length} bài · đạt từ ${PASS * 100}% là có chứng chỉ 🏅`)}
      <div class="stRes"><b>📝</b><h3>Sẵn sàng?</h3><p>Làm một mạch, không giới hạn thời gian. Điểm cao nhất được lưu lại.</p></div><div class="stRow"><span class="stSp"></span><button class="stBtn pri stGo">Bắt đầu thi ▶</button></div>`;
    root.querySelector('.stGo').onclick = () => runQs(qs, `📝 Thi cuối khoá · ${esc(c.name)}`, `${c.icon}`, (ok, n) => { const pc = Math.round(ok / n * 100), pass = pc >= PASS * 100;
      if(L.exam[id] == null || pc > L.exam[id]){ L.exam[id] = pc; save(); } if(pass) cert(c);
      root.innerHTML = `${head(`📝 Kết quả thi · ${esc(c.name)}`, '')}<div class="stRes ${pass ? 'ok' : 'bad'}"><b>${pass ? '🏅' : '📚'}</b><h3>${pc}% (${ok}/${n} câu)</h3><p>${pass ? `Đạt! ${L.certs[c.id] ? `Chứng chỉ khoá ${esc(c.name)} đã có trong hồ sơ.` : ''}` : `Chưa đạt – cần ${PASS * 100}%. Ôn lại các bài rồi thi lại nhé.`}</p></div>
        <div class="stRow"><button class="stBtn stAg">↺ Thi lại</button><span class="stSp"></span><button class="stBtn pri stBc">← Về khoá học</button></div>`;
      root.querySelector('.stAg').onclick = () => exam(id); root.querySelector('.stBc').onclick = back; bindBack(); });
    bindBack(); }

  /* ---------- ngoại ngữ ---------- */
  function langs(){
    root.innerHTML = `${head('🌏 Ngoại ngữ', 'Mỗi ngôn ngữ có lộ trình từ số 0, bài học có nghe – nói – đọc – viết, phòng kiểm tra, đề thi thử và hội thoại nhập vai. Bấm để mở ứng dụng học (laptop tự cất).')}
      <div class="stLangs">${LANGS.map(g => `<div class="stLang"><div class="stCt"><b>${g.icon}</b><span>${esc(g.name)}</span></div><small>${esc(g.sub)}</small>
        <div class="stLb"><button class="stBtn pri" data-r='{"v":"track","t":"${g.t}"}'>🗺️ Lộ trình & bài học</button><button class="stBtn" data-r='{"v":"tests","t":"${g.t}"}'>🧪 Kiểm tra</button><button class="stBtn" data-r='{"v":"mocks","t":"${g.t}"}'>📝 ${esc(g.mock)}</button><button class="stBtn" data-r='{"v":"talks","t":"${g.t}"}'>🎭 Hội thoại</button></div></div>`).join('')}</div>`;
    root.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { const r = JSON.parse(b.dataset.r);
      if(!(W.lang && W.lang.open)){ toast('⚠️ Ứng dụng ngoại ngữ chưa sẵn sàng, thử lại sau vài giây', 2600); return; }
      lapClose(); setTimeout(() => W.lang.open(r), 450); });
    bindBack(); }

  const open = a => load().then(() => { crumbs.length = 0; go(home); if(a && a.course){ const c = DATA.courses.find(x => x.id === a.course); if(c){ go(track, TRACKS.dev.floors(c.floor) ? 'dev' : 'qa'); go(course, a.course); } } })
    .catch(e => { root.innerHTML = `<div class="stRes bad"><b>⚠️</b><h3>Không tải được tài liệu</h3><p>${esc(e.message)}</p></div>`; });
  open(arg);
  return {show:a => { if(a && a.course) open(a); }};
}

export const STUDY_CSS = `
.stA{min-height:100%;padding:16px 20px 28px;background:#f4f6fa;color:#1b2233;font:14px 'Segoe UI',system-ui,sans-serif;box-sizing:border-box}
.stA *{box-sizing:border-box}
.stH{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}.stH h2{margin:0;font-size:20px}.stH p{margin:4px 0 0;color:#55607a;line-height:1.5}
.stBk,.stBtn{border:1px solid #c9d2e3;background:#fff;color:#1b2233;border-radius:9px;padding:8px 14px;font:600 13px inherit;cursor:pointer;white-space:nowrap}
.stBtn.pri{background:#2563eb;border-color:#2563eb;color:#fff}.stBtn:disabled{opacity:.45;cursor:default}.stBk:hover,.stBtn:not(:disabled):hover{filter:brightness(.95)}
.stRow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0}.stSp{flex:1}.stMut{color:#55607a;margin:0 0 6px}
.stTiles{display:grid;gap:12px}.stTile{display:flex;gap:16px;align-items:center;text-align:left;border:1px solid #d5ddeb;background:#fff;border-radius:14px;padding:16px 18px;cursor:pointer;font:inherit;color:inherit}
.stTile:hover{border-color:#2563eb;box-shadow:0 4px 14px rgba(37,99,235,.15)}.stTile>b{font-size:40px}.stTile h3{margin:0 0 2px;font-size:18px}.stTile p{margin:0 0 6px;color:#55607a}.stTile>div{flex:1}
.stBar{height:6px;background:#e2e8f3;border-radius:4px;overflow:hidden;margin-top:6px}.stBar i{display:block;height:100%;background:linear-gradient(90deg,#22c55e,#16a34a)}
.stPath{list-style:none;margin:0;padding:0;counter-reset:s}.stPath>li{position:relative;padding:0 0 14px 22px;border-left:3px solid #c7d4ea;margin-left:8px}.stPath>li:last-child{border-left-color:transparent}
.stPath>li:before{content:'';position:absolute;left:-9px;top:2px;width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid #fff}
.stStep{display:flex;gap:8px;align-items:baseline;margin-bottom:8px}.stStep span{font-size:12px;color:#2563eb;font-weight:700;text-transform:uppercase}.stStep b{font-size:15px}
.stCards,.stLangs{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.stCard,.stLang,.stLes{text-align:left;border:1px solid #d5ddeb;background:#fff;border-radius:12px;padding:12px 14px;font:inherit;color:inherit}
.stCard,.stLes{cursor:pointer}.stCard:hover,.stLes:hover{border-color:#2563eb}
.stCt{display:flex;gap:8px;align-items:center;font-weight:700;margin-bottom:4px}.stCt b{font-size:22px}.stCt span{flex:1}.stCt em{font-style:normal}
.stCard small,.stLang small,.stLes small{color:#55607a;display:block}
.stLb{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.stLb .stBtn{padding:6px 10px;font-size:12px}
.stList{display:grid;gap:8px}.stLes{display:grid;grid-template-columns:auto 1fr auto;gap:2px 12px;align-items:center}.stLes span{grid-row:span 2;color:#2563eb;font-weight:700}.stLes em{grid-row:1/3;grid-column:3;font-style:normal;color:#16a34a;font-size:18px}
.stSlide{background:linear-gradient(135deg,#0f1f3a,#1b2f55);border-radius:14px;padding:20px 24px;color:#dfe7f2;min-height:240px}.stSlide h3{margin:0 0 10px;color:#fff;font-size:19px}
.stBody{white-space:pre-wrap;line-height:1.65;font-size:15px}
.stCode{position:relative;background:#0a1222;border:1px solid #24375d;border-radius:10px;padding:26px 14px 12px;margin:14px 0 0;overflow:auto;color:#cde3ff;font:13px/1.5 Consolas,'Courier New',monospace;white-space:pre}
.stCode span{position:absolute;top:6px;right:10px;font:600 11px 'Segoe UI',sans-serif;color:#7f9cc8;text-transform:uppercase}
.stPr{margin-top:14px;background:rgba(250,204,21,.12);border:1px solid rgba(250,204,21,.4);border-radius:10px;padding:10px 12px;line-height:1.55}.stPr b{color:#fde68a}
.stQ{background:#fff;border:1px solid #d5ddeb;border-radius:14px;padding:16px 18px;margin-top:10px}.stQ h3{margin:0 0 12px;font-size:16px;line-height:1.5;white-space:pre-wrap}
.stOpt{display:block;width:100%;text-align:left;margin:6px 0;border:1px solid #c9d2e3;background:#f8fafd;border-radius:9px;padding:10px 12px;font:14px inherit;color:inherit;cursor:pointer}
.stOpt:not(:disabled):hover{border-color:#2563eb}.stOpt.ok{background:#dcfce7;border-color:#16a34a}.stOpt.bad{background:#fee2e2;border-color:#dc2626}.stOpt:disabled{cursor:default;color:inherit}
.stRes{text-align:center;background:#fff;border:1px solid #d5ddeb;border-radius:14px;padding:22px}.stRes>b{font-size:44px}.stRes h3{margin:6px 0;font-size:20px}.stRes p{margin:0;color:#55607a}
.stRes.ok{border-color:#86efac}.stRes.bad{border-color:#fca5a5}
`;
