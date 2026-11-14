// QC World – 🗣️ TRUNG TÂM NGOẠI NGỮ · ỨNG DỤNG HỌC (tải lười khi mở lần đầu – không tốn gì lúc vào game)
//  Lộ trình Tiếng Anh 0 → IELTS 8.0+ · Tiếng Trung 0 → HSK 7–9 · bài đánh số · bài tập tự chấm · bài thi cấp · thi thử IELTS/HSK tự soạn
//  Hội thoại giao tiếp (nghe – kiểm tra nghe – nhập vai – ghi âm nói theo) · Thẻ từ vựng lặp lại ngắt quãng · Kiểm tra từ vựng/ngữ pháp/nghe
//  BẮT KIỂM TRA LẠI bài đã học sau 1 · 3 · 7 · 14 · 30 · 60 ngày · Sổ lỗi sai · Chứng chỉ · Chế độ giáo viên (giáo án, đáp án, in giáo trình)
//  Giọng đọc = speechSynthesis của trình duyệt (mặc định CHỈ giọng cài trên máy – offline). Ghi âm = MediaRecorder, chỉ giữ trong máy.
//  Dữ liệu: data/lang_index.json + data/lang_<track>_<cấp>.json (gộp từ data/lang_src bằng build.py). Tiến độ: localStorage 'qcworld-lang'.
export function createApp(W, ctx = {}){
  /* ============================== TIỆN ÍCH ============================== */
  const DAY = 864e5, now = () => Date.now();
  const dkey = (t = now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nl = s => esc(s).replace(/\n/g, '<br>');
  const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const fmtD = t => { const d = new Date(t); return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const ALLOWED = new Set(['P','B','I','U','BR','UL','OL','LI','TABLE','THEAD','TBODY','TR','TH','TD','SPAN','SMALL','H4','EM','STRONG','SUP','SUB']);
  function clean(html){   // dữ liệu bài học là của mình nhưng vẫn lọc: chỉ giữ thẻ định dạng, bỏ mọi thuộc tính (trừ class của span)
    const t = document.createElement('template'); t.innerHTML = String(html ?? '');
    const walk = n => { for(const c of [...n.childNodes]){
      if(c.nodeType === 1){ if(!ALLOWED.has(c.tagName)){ c.replaceWith(document.createTextNode(c.textContent)); continue; }
        for(const a of [...c.attributes]) if(!(a.name === 'class' && c.tagName === 'SPAN')) c.removeAttribute(a.name); walk(c); }
      else if(c.nodeType !== 3) c.remove(); } };
    walk(t.content); const d = document.createElement('div'); d.appendChild(t.content); return d.innerHTML; }
  const N = (s, zh) => { let r = String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/đ/g, 'd')
    .replace(/[\s.,!?;:'"’‘“”，。！？、；：（）()\[\]\-–—…·_/]+/g, ''); if(zh) r = r.replace(/v/g, 'u'); return r; };
  function lev(a, b){ if(a === b) return 0; const m = a.length, n = b.length; if(!m || !n) return m + n; let p = Array.from({length: n + 1}, (_, j) => j);
    for(let i = 1; i <= m; i++){ const q = [i]; for(let j = 1; j <= n; j++) q[j] = Math.min(p[j] + 1, q[j-1] + 1, p[j-1] + (a[i-1] === b[j-1] ? 0 : 1)); p = q; } return p[n]; }
  const similar = (a, b) => { const L = Math.max(a.length, b.length); return L ? 1 - lev(a, b) / L : 1; };
  const TR = {
    en: {name:'Tiếng Anh', short:'EN', lang:'en-GB', goal:'Từ con số 0 → IELTS 8.0+', unit:'từ'},
    zh: {name:'Tiếng Trung', short:'中', lang:'zh-CN', goal:'Từ con số 0 → HSK 7–9 (cao cấp)', unit:'chữ'},
  };
  const flag = t => `<span class="lcx-flag ${t}">${TR[t].short}</span>`;
  const langOf = (t, x) => (x && x.lang) || TR[t].lang;

  /* ============================== TIẾN ĐỘ (localStorage) ============================== */
  const LS = 'qcworld-lang';
  const defSet = () => ({rate:.9, voiceEn:'', voiceZh:'', online:false, force:true, teacher:false, showPy:true, showVi:false, newPerDay:15, pop:true});
  const defP = () => ({v:1, done:{}, opened:{}, exams:{}, mocks:{}, talks:{}, rev:{}, srs:{}, srsDay:{}, wrong:{}, tests:[], stats:{days:{}}, certs:{}, guide:{}, set:defSet()});
  let P; try{ P = Object.assign(defP(), JSON.parse(localStorage.getItem(LS) || '{}')); P.set = Object.assign(defSet(), P.set || {}); }catch(e){ P = defP(); }
  let svT = 0; const save = () => { clearTimeout(svT); svT = setTimeout(() => { try{ localStorage.setItem(LS, JSON.stringify(P)); }catch(e){ console.warn('[lang] lưu tiến độ', e); } }, 250); };
  const coins = (n, why) => { try{ ctx.addCoins && ctx.addCoins(n, why); }catch(e){} };

  /* ============================== DỮ LIỆU (tải lười) ============================== */
  const C = {};
  const J = f => C[f] || (C[f] = fetch('data/' + f, {cache:'no-store'}).then(r => { if(!r.ok) throw new Error(`Không tải được ${f} (${r.status})`); return r.json(); }).catch(e => { delete C[f]; throw e; }));
  const IDX = () => J('lang_index.json');
  const LV = (t, c) => J(`lang_${t}_${c}.json`);
  const EXTRA = (t, k) => J(`lang_${t}_${k}.json`);   // talk | mock | guide
  async function levelMeta(t, c){ const I = await IDX(); return (I.tracks[t]?.levels || []).find(l => l.code === c); }
  const lid = (t, c, n) => `${t}-${c}-${String(n).padStart(2,'0')}`;
  const parseId = id => { const m = /^(en|zh)-([a-z0-9]+)-(\d+)$/.exec(id); return m ? {t:m[1], c:m[2], n:+m[3]} : null; };
  function wordsOf(L){ const out = []; for(const p of L.parts || []) if(p.k === 'words') for(const w of p.items || []) out.push(w); return out; }
  function linesOf(L){ const out = []; for(const p of L.parts || []) if(p.k === 'dialog') for(const l of p.lines || []) out.push({...l, lang:p.lang}); return out; }

  /* ============================== GIỌNG ĐỌC (speechSynthesis) ============================== */
  const synth = window.speechSynthesis;
  let VO = []; const loadV = () => { try{ VO = synth ? synth.getVoices() : []; }catch(e){ VO = []; } };
  loadV(); try{ synth && synth.addEventListener('voiceschanged', loadV); }catch(e){}
  const FEM = /zira|hazel|susan|libby|sonia|maisie|aria|jenny|michelle|emma|ava\b|sara|nancy|huihui|yaoyao|xiaoxiao|xiaoyi|xiaohan|xiaomo|xiaorui|xiaoxuan|xiaoshuang|xiaochen|hiumaan|hsiaochen|hsiaoyu|catherine|linda|heera|natasha|clara|female|samantha|karen|moira|tessa|tingting|ting-ting|meijia|sinji|serena|kate|fiona|ana\b|amber|ashley|cora|elizabeth|jane|michelle|monica|sonia/i;
  const MALE = /david|mark|george|ryan|guy\b|thomas|kangkang|yunxi|yunyang|yunjian|yunhao|yunye|yunze|yunfeng|eric|brian|christopher|roger|steffan|daniel|alex\b|fred|ravi|william|liam|male|oliver|arthur|andrew|brandon|davis|jason|tony|noah/i;
  function voicesFor(lang, any){ const base = lang.slice(0,2).toLowerCase(); let v = VO.filter(x => (x.lang || '').toLowerCase().replace('_','-').startsWith(base));
    if(!any && !P.set.online) v = v.filter(x => x.localService !== false); return v; }
  function pickVoice(lang, g){ const vs = voicesFor(lang); if(!vs.length) return null;
    const pref = lang.startsWith('zh') ? P.set.voiceZh : P.set.voiceEn;
    const exact = vs.filter(x => x.lang.replace('_','-').toLowerCase() === lang.toLowerCase()), pool = exact.length ? exact : vs;
    if(g){ const re = g === 'm' ? MALE : FEM; const m = (pref && vs.find(x => x.name === pref && re.test(x.name))) || pool.find(x => re.test(x.name)) || vs.find(x => re.test(x.name)); if(m) return m; }
    return (pref && vs.find(x => x.name === pref)) || pool[0]; }
  const hasVoice = lang => voicesFor(lang).length > 0;
  let speakId = 0;
  const chunks = t => { t = String(t).trim(); if(t.length < 160) return [t]; return t.match(/[^.!?。！？；;]+[.!?。！？；;]*["”’」]?\s*/g) || [t]; };
  function say(text, lang, {g = null, rate = null} = {}){
    return new Promise(res => {
      if(!synth || !text){ res(false); return; }
      const id = ++speakId, parts = chunks(text), v = pickVoice(lang, g); let i = 0;
      const next = () => { if(id !== speakId || i >= parts.length){ res(id === speakId); return; }
        const u = new SpeechSynthesisUtterance(parts[i++]); u.lang = lang; if(v) u.voice = v;
        u.rate = (rate || P.set.rate) * (lang.startsWith('zh') ? .92 : 1);
        u.pitch = (v && g && !(g === 'm' ? MALE : FEM).test(v.name)) ? (g === 'm' ? .78 : 1.22) : 1;
        let done = false; const fin = () => { if(done) return; done = true; clearTimeout(to); setTimeout(next, 120); };
        u.onend = fin; u.onerror = fin;
        const to = setTimeout(fin, 2500 + u.text.length * (lang.startsWith('zh') ? 280 : 85) / u.rate);   // phòng khi máy không có giọng/không báo onend
        try{ synth.speak(u); }catch(e){ fin(); } };
      next(); }); }
  function hush(){ speakId++; try{ synth && synth.cancel(); }catch(e){} }
  const sayBtn = (text, lang, g, label = '🔊') => `<button class="lcx-say" data-act="say" data-t="${esc(text)}" data-l="${esc(lang)}"${g ? ` data-g="${g}"` : ''} title="Nghe">${label}</button>`;

  /* ============================== GHI ÂM (chỉ trong máy) ============================== */
  let rec = null;
  const recHTML = () => `<span class="lcx-rec"><button class="lcx-btn sm" data-act="rec">🎙️ Ghi âm</button><audio controls hidden></audio></span>`;
  async function toggleRec(btn){
    const span = btn.closest('.lcx-rec'), au = span.querySelector('audio');
    if(rec && rec.btn === btn){ try{ rec.mr.stop(); }catch(e){} return; }
    if(rec){ try{ rec.mr.stop(); }catch(e){} }
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder){ note('Trình duyệt không hỗ trợ ghi âm.'); return; }
    try{
      const st = await navigator.mediaDevices.getUserMedia({audio:true}); const mr = new MediaRecorder(st), ch = [];
      mr.ondataavailable = e => ch.push(e.data);
      mr.onstop = () => { st.getTracks().forEach(t => t.stop()); if(au.src) URL.revokeObjectURL(au.src); au.src = URL.createObjectURL(new Blob(ch, {type:mr.mimeType || 'audio/webm'})); au.hidden = false; btn.textContent = '🎙️ Ghi lại'; btn.classList.remove('on'); if(rec && rec.btn === btn) rec = null; };
      mr.start(); rec = {mr, btn}; btn.textContent = '⏹ Dừng ghi'; btn.classList.add('on');
    }catch(e){ note('Không mở được micro: ' + e.message); } }
  const stopRec = () => { if(rec){ try{ rec.mr.stop(); }catch(e){} rec = null; } };

  /* ============================== GIAO DIỆN NỀN ============================== */
  const css = document.createElement('style'); css.id = 'lcx-css';
  css.textContent = `
.modalWrap.lcx{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;padding:0;background:rgba(7,11,20,.94);backdrop-filter:blur(6px);color:#eef2fa;font:15px/1.6 "Segoe UI",system-ui,sans-serif;user-select:text;place-items:stretch}
.lcx *{box-sizing:border-box}
.lcx-top{display:flex;align-items:center;gap:8px;padding:9px 14px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(16,22,36,.96);flex-wrap:wrap}
.lcx-crumb{flex:1;min-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#aab4c8;font-size:14px}
.lcx-crumb a{color:#cfe0ff;cursor:pointer;text-decoration:none}.lcx-crumb a:hover{text-decoration:underline}
.lcx-main{flex:1;overflow:auto;padding:16px 16px 80px;scroll-behavior:smooth}
.lcx-wrap{max-width:1100px;margin:0 auto}
.lcx h1{font-size:25px;margin:2px 0 6px;line-height:1.3}.lcx h2{font-size:20px;margin:4px 0 8px}.lcx h3{font-size:17px;margin:4px 0 8px}.lcx h4{font-size:15px;margin:10px 0 4px;color:#ffd27a}
.lcx p{margin:6px 0}.lcx .mut{color:#aab4c8}.lcx small{color:#aab4c8}
.lcx-card{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px 18px;margin:12px 0}
.lcx-card.hot{border-color:#ffb547;background:rgba(255,181,71,.08)}.lcx-card.teach{border:1px dashed #ffd27a;background:rgba(255,210,122,.06)}
.lcx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.lcx-tile{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px;cursor:pointer;transition:background .15s,border-color .15s}
.lcx-tile:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.25)}.lcx-tile.dis{opacity:.5;cursor:default}
.lcx-tile b{font-size:16px}.lcx-tile .big{font-size:28px;line-height:1}
.lcx-btn{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);color:#f4f6fb;border-radius:10px;padding:7px 12px;font:600 14px "Segoe UI",system-ui,sans-serif;cursor:pointer;display:inline-flex;gap:6px;align-items:center;white-space:nowrap;margin:2px}
.lcx-btn:hover{background:rgba(255,255,255,.18)}.lcx-btn.pri{background:#ff5a6e;border-color:transparent}.lcx-btn.ok{background:#2f9e6e;border-color:transparent}.lcx-btn.blue{background:#3b6fd8;border-color:transparent}
.lcx-btn.sm{padding:4px 9px;font-size:13px}.lcx-btn.on{background:#e5484d}.lcx-btn[disabled]{opacity:.45;cursor:not-allowed}
.lcx-say{border:none;background:rgba(127,178,255,.16);color:#cfe0ff;border-radius:8px;padding:1px 7px;cursor:pointer;font-size:14px;margin:0 3px;vertical-align:middle}.lcx-say:hover{background:rgba(127,178,255,.32)}
.lcx table{border-collapse:collapse;width:100%;margin:8px 0;font-size:14.5px}.lcx td,.lcx th{border:1px solid rgba(255,255,255,.14);padding:6px 9px;text-align:left;vertical-align:top}.lcx th{background:rgba(255,255,255,.07)}
.lcx .hl{background:rgba(255,210,63,.24);border-radius:4px;padding:0 3px}.lcx .ipa{color:#9fd2ff}.lcx .py{color:#ffd27a}
.lcx .zh{font-family:"Microsoft YaHei","PingFang SC","Noto Sans SC","SimSun",sans-serif}.lcx .zhb{font-family:"Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif;font-size:1.3em}
.lcx-flag{display:inline-grid;place-items:center;min-width:30px;height:24px;padding:0 6px;border-radius:7px;font:800 13px "Segoe UI","Microsoft YaHei",sans-serif;vertical-align:middle;margin-right:6px}
.lcx-flag.en{background:#1f4fa8;color:#fff}.lcx-flag.zh{background:#c62f2f;color:#ffe08a}
.lcx-badge{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12px;background:rgba(255,255,255,.12);margin-left:6px;white-space:nowrap}
.lcx-badge.red{background:#e5484d}.lcx-badge.green{background:#2f9e6e}.lcx-badge.gold{background:#b8860b}.lcx-badge.blue{background:#3b6fd8}
.lcx-bar{height:8px;border-radius:6px;background:rgba(255,255,255,.1);overflow:hidden;margin:6px 0}.lcx-bar i{display:block;height:100%;background:linear-gradient(90deg,#46d39a,#7fb2ff)}
.lcx input[type=text],.lcx input[type=number],.lcx textarea,.lcx select{background:rgba(0,0,0,.35);color:#fff;border:1px solid rgba(255,255,255,.22);border-radius:8px;padding:6px 9px;font:15px "Segoe UI","Microsoft YaHei",sans-serif}
.lcx textarea{width:100%;min-height:140px;line-height:1.6}.lcx select option{background:#1b2333}
.lcx-q{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:12px 14px;margin:10px 0}
.lcx-q .qn{display:inline-block;min-width:28px;height:24px;border-radius:7px;background:rgba(255,255,255,.12);text-align:center;font-weight:700;margin-right:8px;font-size:13px;line-height:24px}
.lcx-opt{display:block;width:100%;text-align:left;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:#eef2fa;border-radius:9px;padding:7px 11px;margin:5px 0;cursor:pointer;font:15px "Segoe UI","Microsoft YaHei",sans-serif}
.lcx-opt:hover{background:rgba(255,255,255,.1)}.lcx-opt.sel{border-color:#7fb2ff;background:rgba(127,178,255,.17)}
.lcx-opt.right{border-color:#46d39a;background:rgba(70,211,154,.2)}.lcx-opt.wrong{border-color:#ff6b6b;background:rgba(255,107,107,.17)}
.lcx-fb{margin-top:8px;padding:8px 11px;border-radius:8px;background:rgba(255,255,255,.06);font-size:14.5px}.lcx-fb.ok{border-left:4px solid #46d39a}.lcx-fb.no{border-left:4px solid #ff6b6b}
.lcx-chip{display:inline-block;padding:5px 11px;margin:4px;border-radius:8px;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.18);cursor:pointer;font:15px "Segoe UI","Microsoft YaHei",sans-serif;color:#fff}
.lcx-chip:hover{background:rgba(255,255,255,.2)}.lcx-ans{min-height:44px;border:1px dashed rgba(255,255,255,.25);border-radius:9px;padding:3px;margin:6px 0}
.lcx-line{display:grid;grid-template-columns:auto 1fr auto;gap:10px;padding:6px 9px;border-radius:9px;align-items:start}.lcx-line.on{background:rgba(255,210,63,.14)}.lcx-line.me{background:rgba(127,178,255,.16);outline:1px solid #7fb2ff}
.lcx-line .who{font-weight:700;color:#ffd27a;white-space:nowrap;min-width:60px}.lcx-line .who.m{color:#9fd2ff}
.lcx-hide .tx{filter:blur(7px);user-select:none}.lcx-hide .lcx-line.me .tx{filter:none}
.lcx-sub{font-size:13.5px;color:#aab4c8}.lcx-sub.py{color:#ffd27a}
.lcx-words{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px}
.lcx-w{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:8px 11px}.lcx-w .w{font-size:17px;font-weight:700}
.lcx-tip{border-left:4px solid #ffb547;background:rgba(255,181,71,.08);padding:6px 10px;border-radius:6px;margin:6px 0}
.lcx-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.lcx-sp{flex:1}
.lcx-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:820px){.lcx-two{grid-template-columns:1fr}}
.lcx-read{font-size:16px;line-height:1.75;white-space:normal}.lcx-read p{margin:0 0 10px}
.lcx-flash{max-width:560px;margin:10px auto;text-align:center;padding:26px 18px;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14)}
.lcx-flash .f{font-size:40px;font-weight:700;margin:8px 0}.lcx-flash .f.zh{font-size:64px}
.lcx-timer{font:700 16px Consolas,monospace;background:rgba(229,72,77,.2);padding:3px 10px;border-radius:8px}
.lcx-res{font-size:22px;font-weight:800}.lcx-gate{border:2px solid #ffb547}
.lcx-char{display:grid;grid-template-columns:110px 1fr;gap:12px;align-items:center}
.lcx-char .gl{font:72px "KaiTi","STKaiti","Microsoft YaHei",serif;text-align:center;background:rgba(255,255,255,.06);border-radius:10px;line-height:110px;height:110px}
.lcx-pad{position:relative;width:220px;height:220px;background:#f6f1e3;border-radius:10px;touch-action:none}
.lcx-pad span{position:absolute;inset:0;display:grid;place-items:center;font:170px "KaiTi","STKaiti","Microsoft YaHei",serif;color:rgba(0,0,0,.13);pointer-events:none}
.lcx-pad canvas{position:absolute;inset:0}.lcx-pad:before{content:"";position:absolute;inset:0;background:linear-gradient(#d9cfb5,#d9cfb5) 50% 0/1px 100% no-repeat,linear-gradient(#d9cfb5,#d9cfb5) 0 50%/100% 1px no-repeat}
.lcx-note{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#222c40;border:1px solid rgba(255,255,255,.2);padding:9px 16px;border-radius:10px;z-index:61;max-width:90vw}
.lcx details>summary{cursor:pointer;font-weight:700;color:#ffd27a;margin:4px 0}
@media print{.lcx-top{display:none}}
`;
  document.head.appendChild(css);
  const root = document.createElement('div'); root.className = 'modalWrap lcx'; root.hidden = true;
  root.innerHTML = `<div class="lcx-top"><button class="lcx-btn sm" data-x="back" title="Quay lại (Esc)">◀</button><button class="lcx-btn sm" data-x="home" title="Sảnh">🏠</button><div class="lcx-crumb"></div>
    <button class="lcx-btn sm" data-x="teach" title="Chế độ giáo viên: hiện giáo án, đáp án, in giáo trình">👩‍🏫 Giáo viên</button><button class="lcx-btn sm" data-x="set" title="Giọng đọc, tốc độ, ôn tập bắt buộc…">⚙️</button><button class="lcx-btn sm" data-x="close" title="Đóng – về thế giới">✕</button></div>
    <div class="lcx-main"><div class="lcx-wrap"></div></div>`;
  const main = root.querySelector('.lcx-main'), wrap = root.querySelector('.lcx-wrap'), crumb = root.querySelector('.lcx-crumb');
  let noteT = 0; function note(msg, ms = 2600){ let n = root.querySelector('.lcx-note'); if(!n){ n = document.createElement('div'); n.className = 'lcx-note'; root.appendChild(n); } n.textContent = msg; n.hidden = false; clearTimeout(noteT); noteT = setTimeout(() => n.hidden = true, ms); }
  const teachBtn = root.querySelector('[data-x=teach]');
  const paintTeach = () => { teachBtn.classList.toggle('ok', !!P.set.teacher); teachBtn.textContent = P.set.teacher ? '👩‍🏫 Giáo viên: BẬT' : '👩‍🏫 Giáo viên'; };
  paintTeach();

  /* ---------- điều hướng ---------- */
  let stack = [], token = 0, leaveGuard = null;
  function nav(r, replace){ if(leaveGuard && !leaveGuard()) return; leaveGuard = null; hush(); stopRec(); if(r.v === 'home') stack = [r]; else if(replace) stack[stack.length - 1] = r; else stack.push(r); render(); }
  function back(){ if(leaveGuard && !leaveGuard()) return; leaveGuard = null; hush(); stopRec(); if(stack.length > 1){ stack.pop(); render(); } else close(); }
  function crumbs(){ crumb.innerHTML = stack.map((r, i) => i < stack.length - 1 ? `<a data-i="${i}">${esc(r.label || '…')}</a>` : `<b>${esc(r.label || '…')}</b>`).join(' › '); }
  crumb.addEventListener('click', e => { const a = e.target.closest('a[data-i]'); if(!a) return; if(leaveGuard && !leaveGuard()) return; leaveGuard = null; hush(); stack = stack.slice(0, +a.dataset.i + 1); render(); });
  async function render(){
    const r = stack[stack.length - 1], my = ++token; wrap.innerHTML = '<p class="mut">⏳ Đang tải…</p>'; main.scrollTop = 0;
    try{ const v = VIEWS[r.v]; if(!v) throw new Error('Không có màn hình ' + r.v); const el = document.createElement('div'); await v(r, el); if(my !== token) return; wrap.innerHTML = ''; wrap.appendChild(el); }
    catch(e){ if(my !== token) return; console.warn('[lang]', e); wrap.innerHTML = `<div class="lcx-card hot"><h3>⚠️ Chưa mở được nội dung</h3><p>${esc(e.message)}</p><p class="mut">Có thể phần này đang được soạn. Thử lại sau, hoặc chạy <code>python data/lang_src/build.py</code> để gộp dữ liệu mới.</p></div>`; }
    crumbs(); }
  root.addEventListener('click', e => {
    const gg = e.target.closest('[data-go]');
    if(gg && root.contains(gg) && !gg.classList.contains('dis')){ try{ nav(JSON.parse(gg.dataset.go)); }catch(err){ console.warn(err); } return; }
    const x = e.target.closest('[data-x]');
    if(x && root.contains(x)){ const k = x.dataset.x;
      if(k === 'back') back(); else if(k === 'home') nav({v:'home', label:'Sảnh'}); else if(k === 'close') close();
      else if(k === 'set') nav({v:'settings', label:'⚙️ Cài đặt'});
      else if(k === 'teach'){ P.set.teacher = !P.set.teacher; save(); paintTeach(); note(P.set.teacher ? '👩‍🏫 Chế độ giáo viên BẬT: hiện giáo án, đáp án, nút in giáo trình; không bị khoá ôn tập.' : 'Đã tắt chế độ giáo viên.'); render(); }
      return; }
    const a = e.target.closest('[data-act]'); if(!a || !root.contains(a)) return;
    if(a.dataset.act === 'say'){ e.preventDefault(); hush(); say(a.dataset.t, a.dataset.l, {g:a.dataset.g || null}); }
    else if(a.dataset.act === 'rec'){ e.preventDefault(); toggleRec(a); }
  });
  addEventListener('keydown', e => {
    if(root.hidden || e.code !== 'Escape') return;
    e.stopImmediatePropagation(); e.preventDefault();
    const t = e.target; if(t && ['INPUT','TEXTAREA','SELECT'].includes(t.tagName)){ t.blur(); return; }
    back(); }, true);
  root.addEventListener('close', () => { root.hidden = false; close(true); });   // phòng khi game tự ẩn bằng Esc

  /* ---------- đồng hồ học (phút học mỗi ngày → chuỗi ngày học) ---------- */
  let clk = 0;
  const startClock = () => { if(clk) return; clk = setInterval(() => { if(root.hidden || document.hidden) return; const k = dkey(); P.stats.days[k] = (P.stats.days[k] || 0) + 1; save(); }, 60000); };
  const stopClock = () => { clearInterval(clk); clk = 0; };
  function streak(){ let s = 0, t = now(); if(!P.stats.days[dkey(t)]) t -= DAY; while(P.stats.days[dkey(t)]){ s++; t -= DAY; } return s; }

  /* ============================== MỞ / ĐÓNG ============================== */
  let onCloseCb = null;
  function open(route){
    if(!root.isConnected) document.body.appendChild(root);
    root.hidden = false; W.langOpen = true; try{ W.clearKeys && W.clearKeys(); }catch(e){} startClock(); loadV();
    if(route){ if(route.v !== 'home'){ leaveGuard = null; stack = [{v:'home', label:'🏠 Sảnh'}]; } nav(route.v === 'home' ? {...route, label:'🏠 Sảnh'} : route); }
    else if(!stack.length) nav({v:'home', label:'🏠 Sảnh'}); else render();
  }
  function close(force){
    if(!force && leaveGuard && !leaveGuard()) return; leaveGuard = null;
    hush(); stopRec(); stopClock(); root.hidden = true; W.langOpen = false; save();
    try{ W.canvas && W.canvas.focus(); }catch(e){}
    onCloseCb && onCloseCb(); }

  /* ============================== Ô TRẢ LỜI / CHẤM ĐIỂM ============================== */
  // items: EX theo SCHEMA (mc · fill · order · listen · dict · match) – dùng chung cho bài tập, kiểm tra, ôn tập, bài thi, đề thi thử
  function quiz(items, {t, lang, exam = false, plays = 0, onDone, submitText = '✅ Nộp bài & chấm điểm', showKey = P.set.teacher, src = '', noSubmit = false, start = 0} = {}){
    const zh = t === 'zh' || (lang || '').startsWith('zh');
    const el = document.createElement('div'); const st = items.map(() => ({}));
    const isFill = x => x.t === 'fill' || (!x.t && !x.o);
    const isMc = x => x.t === 'mc' || x.t === 'listen' || (!x.t && x.o);
    const qText = (x, i) => { const q = esc(String(x.q || '').replace(/^\s*(?:Câu\s*)?\d{1,2}\s*[.):]\s+/, '')); if(isFill(x)){ let used = false; const r = q.replace(/_{3,}|…{1,}|\.{4,}/, () => { used = true; return `<input type="text" class="lcx-in" data-i="${i}" size="${Math.max(6, Math.min(22, String(x.a || '').length + 3))}" autocomplete="off" spellcheck="false">`; }); return used ? r : r + `<div><input type="text" class="lcx-in" data-i="${i}" size="22" autocomplete="off" spellcheck="false"></div>`; } return q.replace(/_{3,}/g, '<b>_____</b>'); };
    const playBtn = (x, i) => `<button class="lcx-btn sm blue" data-play="${i}">▶ Nghe${plays ? ` <small>(còn ${plays} lượt)</small>` : ''}</button>`;
    el.innerHTML = items.map((x, i) => {
      let b = `<div class="lcx-q" data-q="${i}"><div><span class="qn">${start + i + 1}</span>`;
      if(x.t === 'listen'){ b += playBtn(x, i) + ' ' + qText(x, i); }
      else if(x.t === 'dict'){ b += playBtn(x, i) + ` <span class="mut">Nghe và gõ lại chính xác${zh ? ' (gõ chữ Hán hoặc pinyin – không cần dấu thanh)' : ''}${x.q ? ': ' + esc(x.q) : ''}</span>`; }
      else if(x.t === 'match'){ b += esc(x.q || 'Nối mỗi mục bên trái với mục đúng bên phải'); }
      else if(x.t === 'order'){ b += esc(x.q || 'Sắp xếp thành câu đúng'); }
      else b += qText(x, i);
      b += '</div>';
      if(isMc(x)){ const ord = canShuffle(x) ? shuffle((x.o || []).map((_, j) => j)) : (x.o || []).map((_, j) => j);   // xáo thứ tự lựa chọn mỗi lần làm → không học vẹt vị trí đáp án
        b += ord.map((j, d) => `<button class="lcx-opt${zh ? ' zh' : ''}" data-o="${i}:${j}">${String.fromCharCode(65 + d)}. ${esc(x.o[j])}</button>`).join(''); }
      else if(x.t === 'dict') b += String(x.a || '').length > 38 ? `<textarea class="lcx-in" data-i="${i}" style="min-height:70px" spellcheck="false"></textarea>` : `<input type="text" class="lcx-in" data-i="${i}" size="40" autocomplete="off" spellcheck="false">`;
      else if(x.t === 'order'){ st[i].pool = shuffle((x.w || []).map((w, k) => ({w, k}))); st[i].ans = []; b += `<div class="lcx-ans" data-ans="${i}"></div><div data-pool="${i}"></div><button class="lcx-btn sm" data-reset="${i}">↺ Làm lại</button>`; }
      else if(x.t === 'match'){ const R = shuffle((x.pairs || []).map(p => p[1])); st[i].R = R;
        b += `<table>${(x.pairs || []).map((p, k) => `<tr><td class="${zh ? 'zh' : ''}">${esc(p[0])}</td><td><select data-m="${i}:${k}"><option value="">— chọn —</option>${R.map((r, j) => `<option value="${j}">${esc(r)}</option>`).join('')}</select></td></tr>`).join('')}</table>`; }
      if(showKey) b += `<div class="lcx-fb"><small>🔑 Đáp án: ${esc(keyOf(x))}</small></div>`;
      return b + `<div class="lcx-fbx"></div></div>`; }).join('') + `<div class="lcx-row" style="margin-top:12px${noSubmit ? ';display:none' : ''}"><button class="lcx-btn pri" data-submit>${submitText}</button><span class="lcx-sp"></span><span class="lcx-res" hidden></span></div>`;
    const paintOrder = i => { const x = items[i], a = el.querySelector(`[data-ans="${i}"]`), p = el.querySelector(`[data-pool="${i}"]`); if(!a) return;
      a.innerHTML = st[i].ans.map((o, k) => `<span class="lcx-chip${zh ? ' zh' : ''}" data-un="${i}:${k}">${esc(o.w)}</span>`).join('');
      p.innerHTML = st[i].pool.map((o, k) => `<span class="lcx-chip${zh ? ' zh' : ''}" data-pk="${i}:${k}">${esc(o.w)}</span>`).join(''); };
    items.forEach((x, i) => { if(x.t === 'order') paintOrder(i); });
    let done = false; const playsLeft = items.map(() => plays);
    el.addEventListener('click', e => {
      const pb = e.target.closest('[data-play]'); if(pb){ const i = +pb.dataset.play, x = items[i];
        if(plays && !done){ if(playsLeft[i] <= 0) return; playsLeft[i]--; pb.innerHTML = `▶ Nghe <small>(còn ${playsLeft[i]} lượt)</small>`; if(playsLeft[i] <= 0) pb.disabled = true; }
        hush(); say(x.say, x.lang || lang, {g:x.g || null}); return; }
      if(done) return;
      const ob = e.target.closest('[data-o]'); if(ob){ const [i, j] = ob.dataset.o.split(':').map(Number); st[i].sel = j; el.querySelectorAll(`[data-o^="${i}:"]`).forEach(b => b.classList.toggle('sel', b === ob)); return; }
      const pk = e.target.closest('[data-pk]'); if(pk){ const [i, k] = pk.dataset.pk.split(':').map(Number); st[i].ans.push(st[i].pool.splice(k, 1)[0]); paintOrder(i); return; }
      const un = e.target.closest('[data-un]'); if(un){ const [i, k] = un.dataset.un.split(':').map(Number); st[i].pool.push(st[i].ans.splice(k, 1)[0]); paintOrder(i); return; }
      const rs = e.target.closest('[data-reset]'); if(rs){ const i = +rs.dataset.reset; st[i].pool = shuffle((items[i].w || []).map((w, k) => ({w, k}))); st[i].ans = []; paintOrder(i); return; }
      if(e.target.closest('[data-submit]')) submit();
    });
    el.addEventListener('keydown', e => { if(e.key === 'Enter' && e.target.matches('input.lcx-in')){ const ins = [...el.querySelectorAll('input.lcx-in')]; const k = ins.indexOf(e.target); if(k >= 0 && k < ins.length - 1) ins[k + 1].focus(); } });
    function grade(x, i){
      if(isMc(x)) return {ok: st[i].sel === x.a, given: st[i].sel == null ? '(bỏ trống)' : (x.o || [])[st[i].sel]};
      if(x.t === 'order'){ const g = st[i].ans.map(o => o.w).join(zh ? '' : ' '); return {ok: N(g, zh) === N(x.a, zh) || (x.alt || []).some(a => N(a, zh) === N(g, zh)), given: g || '(bỏ trống)'}; }
      if(x.t === 'match'){ let ok = true; (x.pairs || []).forEach((p, k) => { const s = el.querySelector(`[data-m="${i}:${k}"]`); const v = s && s.value !== '' ? st[i].R[+s.value] : null; if(v !== p[1]){ ok = false; if(s) s.style.borderColor = '#ff6b6b'; } else if(s) s.style.borderColor = '#46d39a'; }); return {ok, given:''}; }
      const inp = el.querySelector(`.lcx-in[data-i="${i}"]`), g = inp ? inp.value.trim() : '';
      const cands = [x.a, ...(x.alt || []), x.py].filter(Boolean).map(a => N(a, zh)), gn = N(g, zh);
      let ok = !!gn && cands.includes(gn);
      if(!ok && x.t === 'dict' && gn && cands.some(c => c.length > 18 && similar(c, gn) >= .92)) ok = true;   // câu dài: cho phép sai 1–2 ký tự
      return {ok, given: g || '(bỏ trống)'}; }
    function submit(){
      if(done) return; done = true; hush(); let right = 0; const wrong = [];
      items.forEach((x, i) => { const r = grade(x, i), box = el.querySelector(`[data-q="${i}"] .lcx-fbx`); if(r.ok) right++; else wrong.push({x, i});
        if(isMc(x)) el.querySelectorAll(`[data-o^="${i}:"]`).forEach(b => { const j = +b.dataset.o.split(':')[1]; b.classList.toggle('right', j === x.a); b.classList.toggle('wrong', j === st[i].sel && j !== x.a); });
        el.querySelectorAll(`[data-q="${i}"] input, [data-q="${i}"] textarea, [data-q="${i}"] select`).forEach(n => n.disabled = true);
        const extra = x.t === 'dict' || x.t === 'listen' ? `<div class="lcx-sub ${zh ? 'zh' : ''}">🔊 Câu đọc: ${esc(x.say)}${x.py ? ` · <span class="py">${esc(x.py)}</span>` : ''}</div>` : '';
        box.innerHTML = `<div class="lcx-fb ${r.ok ? 'ok' : 'no'}">${r.ok ? '✅ Đúng' : `❌ Chưa đúng${r.given && !isMc(x) && x.t !== 'match' ? ` – bạn ghi: <i>${esc(r.given)}</i>` : ''}. Đáp án: <b class="${zh ? 'zh' : ''}">${esc(keyOf(x))}</b>`}${x.e ? `<div>💡 ${clean(x.e)}</div>` : ''}${extra}</div>`; });
      const res = el.querySelector('.lcx-res'); res.hidden = false; const p = pct(right, items.length);
      res.textContent = `${right}/${items.length} câu · ${p}%`; res.style.color = p >= 80 ? '#46d39a' : p >= 60 ? '#ffd27a' : '#ff8b8b';
      el.querySelector('[data-submit]').disabled = true;
      if(src) logWrong(src, wrong, lang, t);
      lastRes = {right, total:items.length, pct:p, wrong};
      onDone && onDone(lastRes); }
    let lastRes = null;
    return {el, submit, get done(){ return done; }, score:() => lastRes || {right:0, total:items.length, pct:0, wrong:[]}};
  }
  // chỉ xáo khi an toàn: ≥ 3 lựa chọn, không phải dạng cố định thứ tự (Đúng/Sai, T/F/NG, A–H, i–x, "tất cả…") và giải thích không nhắc tới chữ cái đáp án
  function canShuffle(x){ const o = (x.o || []).map(s => String(s).trim()); if(o.length < 3) return false;
    if(o.some(s => /^(true|false|not given|yes|no|đúng|sai|không có thông tin|[a-h]|[ivx]{1,4})$/i.test(s) || /^[A-H]\s*[-–.:)]/.test(s) || /^(cả|tất cả|all of|none of|both|không có|cả hai)/i.test(s))) return false;
    if(/(đáp án|chọn|phương án|câu|option)\s+[A-H]\b|\b[A-H]\s*(đúng|sai|là đáp án)|\(([A-H])\)/i.test(String(x.e || ''))) return false;
    return true; }
  function keyOf(x){ if(x.t === 'match') return (x.pairs || []).map(p => `${p[0]} → ${p[1]}`).join(' · ');
    if(x.t === 'mc' || x.t === 'listen' || (!x.t && x.o)) return (x.o || [])[x.a] ?? '';
    return x.a + (x.py ? ` (${x.py})` : ''); }
  // Sổ lỗi sai: câu sai được lưu lại (kèm nội dung) để làm lại; làm đúng 2 lần liên tiếp thì tự gỡ khỏi sổ
  function logWrong(src, wrong, lang, t){
    for(const {x, i} of wrong){ const k = `${src}#${i}`; const o = P.wrong[k] || {x, t: t || (String(lang || '').startsWith('zh') ? 'zh' : 'en'), lang, n:0, ok:0}; o.n++; o.ok = 0; o.at = now(); P.wrong[k] = o; }
    const ks = Object.keys(P.wrong); if(ks.length > 400){ ks.sort((a, b) => P.wrong[a].at - P.wrong[b].at).slice(0, ks.length - 400).forEach(k => delete P.wrong[k]); }
    save(); }

  /* ============================== CÂU HỎI TỪ VỰNG TỰ SINH ============================== */
  const TONES = {a:'āáǎà', e:'ēéěè', i:'īíǐì', o:'ōóǒò', u:'ūúǔù', 'ü':'ǖǘǚǜ'};
  function toneVariants(py, n){ const out = new Set(); const chars = [...String(py || '')];
    const idx = chars.map((c, i) => [c, i]).filter(([c]) => Object.values(TONES).some(s => s.includes(c)));
    for(let tries = 0; tries < 30 && out.size < n && idx.length; tries++){ const cc = chars.slice(); const [c, i] = idx[Math.floor(Math.random() * idx.length)];
      const base = Object.keys(TONES).find(k => TONES[k].includes(c)); const cur = TONES[base].indexOf(c); let nt; do{ nt = Math.floor(Math.random() * 4); }while(nt === cur);
      cc[i] = TONES[base][nt]; const v = cc.join(''); if(v !== py) out.add(v); }
    return [...out]; }
  function vocabQs(ws, pool, t, n){
    const zh = t === 'zh', lang = TR[t].lang, out = [];
    const others = (w, k) => shuffle(pool.filter(o => o.w !== w.w && o[k] && o[k] !== w[k])).map(o => o[k]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
    const info = w => `${w.w}${zh ? ` · ${w.py || ''}${w.hv ? ` (HV: ${w.hv})` : ''}` : w.ipa ? ` ${w.ipa}` : ''} = ${w.vi}${w.ex ? ` · Ví dụ: ${w.ex}${w.exVi ? ` – ${w.exVi}` : ''}` : ''}`;
    for(const w of pick(ws.filter(w => w.w && w.vi), n)){
      const kinds = zh ? ['mean', 'rev', 'hear', 'tone', 'spell', 'mean'] : ['mean', 'rev', 'hear', 'spell', 'mean'];
      let k = kinds[Math.floor(Math.random() * kinds.length)];
      if((k === 'mean' || k === 'hear') && others(w, 'vi').length < 2) k = 'spell';
      if(k === 'rev' && others(w, 'w').length < 2) k = 'spell';
      if(k === 'tone'){ const v = toneVariants(w.py, 3); if(v.length < 2) k = 'spell'; else { const o = shuffle([w.py, ...v]); out.push({t:'mc', q:`Chọn pinyin (thanh điệu) đúng của  ${w.w}`, o, a:o.indexOf(w.py), e:info(w)}); continue; } }
      if(k === 'mean'){ const o = shuffle([w.vi, ...others(w, 'vi')]); out.push({t:'mc', q:`“${w.w}”${zh && w.py ? ` (${w.py})` : ''} nghĩa là gì?`, o, a:o.indexOf(w.vi), e:info(w)}); }
      else if(k === 'rev'){ const o = shuffle([w.w, ...others(w, 'w')]); out.push({t:'mc', q:`Từ nào nghĩa là “${w.vi}”?`, o, a:o.indexOf(w.w), e:info(w)}); }
      else if(k === 'hear'){ const o = shuffle([w.vi, ...others(w, 'vi')]); out.push({t:'listen', say:w.w, lang, q:'Nghe từ và chọn nghĩa đúng', o, a:o.indexOf(w.vi), e:info(w)}); }
      else out.push({t:'dict', say:w.w, lang, a:w.w, py:zh ? w.py : undefined, e:info(w)});
    }
    return out; }
  const levelWords = D => (D.lessons || []).flatMap(wordsOf);

  /* ============================== ÔN TẬP NGẮT QUÃNG (bắt kiểm tra lại) ============================== */
  const INTV = [1, 3, 7, 14, 30, 60];
  function schedule(id){ if(!P.rev[id]) P.rev[id] = {s:0, due:now() + INTV[0] * DAY, last:now(), fail:0}; }
  function dueList(t){ return Object.entries(P.rev).filter(([id, r]) => (!t || id.startsWith(t + '-')) && !r.off && r.due <= now()).map(([id, r]) => ({id, ...r})).sort((a, b) => a.due - b.due); }
  async function reviewItems(id){
    const {t, c} = parseId(id), D = await LV(t, c), L = D.lessons.find(x => x.id === id); if(!L) throw new Error('Không thấy bài ' + id);
    const lang = TR[t].lang, ws = wordsOf(L);
    const ex = pick((L.exercises || []).filter(x => x.t !== 'match'), 6);
    const vq = vocabQs(ws, levelWords(D), t, 4);
    const ls = linesOf(L).filter(l => l.t && l.t.length < 80);
    const dq = ls.length ? (l => [{t:'dict', say:l.t, lang:l.lang || lang, g:l.g, a:l.t, py:l.py, e:l.vi ? `Nghĩa: ${l.vi}` : ''}])(pick(ls, 1)[0]) : [];
    return {L, items:shuffle([...ex, ...vq]).concat(dq)}; }
  async function reviewDone(id, p){
    const r = P.rev[id] || (P.rev[id] = {s:0, due:0, fail:0}); r.last = now();
    if(p >= 80){ if(r.s >= INTV.length - 1){ r.off = true; r.due = now() + 3650 * DAY; } else { r.s++; r.due = now() + INTV[r.s] * DAY; } coins(3, '🔁 Ôn tập đúng hạn +3 💰'); }
    else { r.fail = (r.fail || 0) + 1; r.s = Math.max(0, r.s - 1); r.due = now() + DAY; }
    save(); return r; }

  /* ============================== KHỐI NỘI DUNG ============================== */
  const mk = (html, cls = 'lcx-card') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; return d; };
  const H = p => p.h ? `<h3>${esc(p.h)}</h3>` : '';
  function wordsEl(p, t){
    const zh = t === 'zh', lang = TR[t].lang, items = p.items || [];
    const d = mk(`${H(p)}<div class="lcx-row"><button class="lcx-btn sm" data-all>🔊 Nghe cả danh sách</button><label class="mut"><input type="checkbox" data-hv> Che nghĩa để tự kiểm tra</label><span class="lcx-sp"></span><small>${items.length} ${zh ? 'từ' : 'từ/cụm'} · tự vào kho 🃏 Thẻ từ vựng</small></div>
      <div class="lcx-words">${items.map(w => `<div class="lcx-w"><div><span class="w ${zh ? 'zhb' : ''}">${esc(w.w)}</span> ${sayBtn(w.w, lang)} ${w.pos ? `<small>${esc(w.pos)}</small>` : ''}</div>
        <div>${zh ? `<span class="py">${esc(w.py || '')}</span>${w.hv ? ` <small>· Hán Việt: ${esc(w.hv)}</small>` : ''}` : `<span class="ipa">${esc(w.ipa || '')}</span>`}</div>
        <div class="vi"><b>${esc(w.vi)}</b></div>
        ${w.ex ? `<div class="lcx-sub ${zh ? 'zh' : ''}">${esc(w.ex)} ${sayBtn(w.ex, lang, null, '🔉')}</div>${w.exPy && P.set.showPy ? `<div class="lcx-sub py">${esc(w.exPy)}</div>` : ''}${w.exVi ? `<div class="lcx-sub vi">${esc(w.exVi)}</div>` : ''}` : ''}</div>`).join('')}</div>`);
    d.querySelector('[data-hv]').onchange = e => d.querySelectorAll('.vi').forEach(v => v.style.filter = e.target.checked ? 'blur(6px)' : '');
    d.querySelector('[data-all]').onclick = async () => { hush(); for(const w of items){ const ok = await say(w.w, lang); if(!ok) break; await new Promise(r => setTimeout(r, 350)); } };
    return d; }
  function soundsEl(p, t){
    const zh = t === 'zh', lang = TR[t].lang;
    const chip = x => `<span class="lcx-chip ${zh ? 'zh' : ''}" data-act="say" data-t="${esc(x)}" data-l="${lang}">${esc(x)} 🔊</span>`;
    return mk(`${H(p)}${p.html ? `<div>${clean(p.html)}</div>` : ''}${(p.items || []).map(s => `<div class="lcx-q"><div class="lcx-row"><b class="ipa" style="font-size:20px">${esc(s.sym)}</b><span>${(s.ex || []).map(chip).join('')}</span></div>
      <div>${clean(s.vi)}</div>${(s.pairs || []).length ? `<div class="lcx-sub">🎧 Nghe phân biệt: ${s.pairs.map(pr => `${chip(pr[0])} ↔ ${chip(pr[1])}`).join(' &nbsp;·&nbsp; ')}</div>` : ''}</div>`).join('')}`); }
  function grammarEl(p, t){
    const zh = t === 'zh', lang = TR[t].lang; const tb = p.table || [];
    return mk(`${H(p)}<div>${clean(p.html)}</div>${tb.length ? `<table>${tb.map((r, i) => `<tr>${r.map(c => i ? `<td class="${zh ? 'zh' : ''}">${clean(c)}</td>` : `<th>${clean(c)}</th>`).join('')}</tr>`).join('')}</table>` : ''}
      ${(p.ex || []).length ? `<h4>Ví dụ</h4>${p.ex.map(e => `<div style="margin:5px 0"><span class="${zh ? 'zhb' : ''}">${esc(e.t)}</span> ${sayBtn(e.t, lang)}${e.py && P.set.showPy ? `<div class="lcx-sub py">${esc(e.py)}</div>` : ''}${e.vi ? `<div class="lcx-sub">${esc(e.vi)}</div>` : ''}</div>`).join('')}` : ''}
      ${(p.tips || []).map(x => `<div class="lcx-tip">${clean(x)}</div>`).join('')}`); }
  function textEl(p){ return mk(`${H(p)}<div>${clean(p.html)}</div>`); }
  // ---- hội thoại / bài nghe: nghe cả bài, che/hiện lời, dịch, pinyin, nhập vai ----
  function dialogEl(d, t, o = {}){
    const zh = t === 'zh', lang = d.lang || TR[t].lang, lines = d.lines || [];
    const who = [...new Set(lines.map(l => l.s))];
    let hidden = o.hide !== false, vi = false, py = P.set.showPy, run = 0, plays = o.plays || 0, locked = !!o.lockText;
    const el = mk(`${o.title === false ? '' : H(d)}${d.note ? `<p class="mut">🎬 ${esc(d.note)}</p>` : ''}${d.situation ? `<p class="mut">🎬 ${esc(d.situation)}</p>` : ''}
      <div class="lcx-row"><button class="lcx-btn sm blue" data-k="play">▶ Nghe cả bài${plays ? ` <small>(còn ${plays} lượt)</small>` : ''}</button><button class="lcx-btn sm" data-k="stop">⏹</button>
      <button class="lcx-btn sm" data-k="hide"></button><button class="lcx-btn sm" data-k="vi">🇻🇳 Dịch</button>${zh ? '<button class="lcx-btn sm" data-k="py">拼 Pinyin</button>' : ''}
      ${o.exam ? '' : `<span class="lcx-sp"></span><span class="mut">🎭 Nhập vai:</span><select data-k="role">${who.map(s => `<option>${esc(s)}</option>`).join('')}</select><button class="lcx-btn sm ok" data-k="rp">Bắt đầu</button>`}</div>
      <div class="lcx-turn" hidden></div><div class="lcx-lines"></div>`);
    const box = el.querySelector('.lcx-lines'), turn = el.querySelector('.lcx-turn'), hb = el.querySelector('[data-k=hide]');
    const paint = () => {
      box.classList.toggle('lcx-hide', hidden); hb.textContent = hidden ? '👁 Hiện lời thoại' : '🙈 Che lời thoại'; hb.disabled = locked;
      box.innerHTML = lines.map((l, i) => `<div class="lcx-line" data-l="${i}"><span class="who ${l.g === 'm' ? 'm' : ''}">${esc(l.s)}</span><div class="tx"><div class="${zh ? 'zhb' : ''}">${esc(l.t)}</div>${zh && py && l.py ? `<div class="lcx-sub py">${esc(l.py)}</div>` : ''}${vi && l.vi ? `<div class="lcx-sub">${esc(l.vi)}</div>` : ''}</div>${o.exam || locked ? '<span></span>' : sayBtn(l.t, lang, l.g)}</div>`).join(''); };
    paint();
    const mark = (i, cls) => box.querySelectorAll('.lcx-line').forEach((n, k) => { n.classList.toggle('on', k === i && cls === 'on'); n.classList.toggle('me', k === i && cls === 'me'); });
    async function playAll(){ hush(); const my = ++run;
      for(let i = 0; i < lines.length; i++){ if(my !== run) return; mark(i, 'on'); if(!hidden) box.children[i] && box.children[i].scrollIntoView({block:'nearest'});
        const ok = await say(lines[i].t, lang, {g:lines[i].g}); if(!ok || my !== run) return; await new Promise(r => setTimeout(r, 250)); }
      mark(-1); o.onPlayed && o.onPlayed(); }
    async function roleplay(role){ hush(); const my = ++run; turn.hidden = false;
      for(let i = 0; i < lines.length; i++){ if(my !== run) return; const l = lines[i];
        if(l.s === role){ mark(i, 'me'); box.children[i].scrollIntoView({block:'nearest'});
          turn.innerHTML = `<div class="lcx-card hot" style="margin:6px 0"><b>🎙️ Lượt của bạn (${esc(role)})</b> – nói to câu được tô xanh${zh && l.py ? ` <span class="py">(${esc(l.py)})</span>` : ''}. ${recHTML()} <button class="lcx-btn sm" data-k="hint">🔊 Nghe mẫu</button> <button class="lcx-btn sm ok" data-k="next">Tiếp ▶</button></div>`;
          turn.querySelector('[data-k=hint]').onclick = () => { hush(); say(l.t, lang, {g:l.g}); };
          await new Promise(r => { turn.querySelector('[data-k=next]').onclick = r; el._rpAbort = r; }); stopRec();
          if(my !== run) return; turn.innerHTML = ''; }
        else { mark(i, 'on'); box.children[i].scrollIntoView({block:'nearest'}); const ok = await say(l.t, lang, {g:l.g}); if(my !== run) return; if(!ok) await new Promise(r => setTimeout(r, 400)); await new Promise(r => setTimeout(r, 200)); } }
      mark(-1); turn.innerHTML = `<div class="lcx-card" style="margin:6px 0">🎭 Xong vai <b>${esc(role)}</b>! Đổi vai rồi luyện lại cho đến khi nói trôi chảy không cần nhìn.</div>`;
      o.onRoleplay && o.onRoleplay(role); }
    el.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if(!b || b.tagName === 'SELECT') return; const k = b.dataset.k;
      if(k === 'play'){ if(plays){ if(o._left == null) o._left = plays; if(o._left <= 0) return; o._left--; b.innerHTML = `▶ Nghe cả bài <small>(còn ${o._left} lượt)</small>`; if(o._left <= 0) b.disabled = true; } playAll(); }
      else if(k === 'stop'){ run++; hush(); mark(-1); if(el._rpAbort) el._rpAbort(); turn.hidden = true; }
      else if(k === 'hide'){ if(locked) return; hidden = !hidden; paint(); }
      else if(k === 'vi'){ if(locked){ note('Làm xong câu hỏi nghe rồi mới xem bản dịch nhé!'); return; } vi = !vi; paint(); }
      else if(k === 'py'){ py = !py; paint(); }
      else if(k === 'rp'){ if(locked){ note('Làm xong câu hỏi nghe (Bước 1) trước, rồi nhập vai.'); return; } roleplay(el.querySelector('[data-k=role]').value); } });
    el.unlock = () => { locked = false; hidden = false; paint(); };
    el.stop = () => { run++; hush(); };
    return el; }
  function readEl(p, t, o = {}){
    const zh = t === 'zh', lang = TR[t].lang; let showPy = false, showVi = false;
    const paras = String(p.text || '').split(/\n{2,}|\n/).filter(Boolean), pys = String(p.py || '').split(/\n{2,}|\n/).filter(Boolean), vis = String(p.vi || '').split(/\n{2,}|\n/).filter(Boolean);
    const el = mk(`${o.title === false ? '' : H(p)}${p.title ? `<h2 class="${zh ? 'zh' : ''}" style="text-align:center">${esc(p.title)}</h2>` : ''}
      <div class="lcx-row">${o.exam ? '' : `<button class="lcx-btn sm" data-k="say">🔊 Nghe đọc cả bài</button><button class="lcx-btn sm" data-k="stop">⏹</button>`}${zh && p.py && !o.exam ? '<button class="lcx-btn sm" data-k="py">拼 Pinyin</button>' : ''}${p.vi && !o.exam ? '<button class="lcx-btn sm" data-k="vi">🇻🇳 Bản dịch</button>' : ''}<span class="lcx-sp"></span><small>${zh ? `${String(p.text || '').replace(/[^一-鿿]/g, '').length} chữ Hán` : `${String(p.text || '').split(/\s+/).filter(Boolean).length} từ`}</small></div>
      <div class="lcx-read ${zh ? 'zhb' : ''}" style="${zh ? 'font-size:19px' : ''}"></div>
      ${(p.gloss || []).length && !o.exam ? `<details><summary>📘 Chú giải từ (${p.gloss.length})</summary><table>${p.gloss.map(g => `<tr><td class="${zh ? 'zh' : ''}"><b>${esc(g.w)}</b> ${sayBtn(g.w, lang)}</td><td class="py">${esc(g.py || '')}</td><td>${esc(g.vi)}</td></tr>`).join('')}</table></details>` : ''}`);
    const box = el.querySelector('.lcx-read');
    const paint = () => { box.innerHTML = paras.map((x, i) => `<p>${esc(x)}${showPy && pys[i] ? `<br><span class="lcx-sub py" style="font-size:15px">${esc(pys[i])}</span>` : ''}${showVi && vis[i] ? `<br><span class="lcx-sub" style="font-size:15px">${esc(vis[i])}</span>` : ''}</p>`).join('')
      + (showVi && vis.length > paras.length ? `<p class="lcx-sub">${esc(vis.slice(paras.length).join(' '))}</p>` : ''); };
    paint();
    el.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if(!b) return; const k = b.dataset.k;
      if(k === 'say'){ hush(); (async () => { for(const x of paras){ const ok = await say(x, lang); if(!ok) break; } })(); }
      else if(k === 'stop') hush(); else if(k === 'py'){ showPy = !showPy; paint(); } else if(k === 'vi'){ showVi = !showVi; paint(); } });
    return el; }
  function speakEl(p, t){
    const zh = t === 'zh', lang = TR[t].lang;
    return mk(`${H(p)}<p class="mut">Đọc đề → tự nói (bấm 🎙️ Ghi âm để thu lại giọng mình, chỉ lưu trong máy) → mở câu mẫu, nghe và so sánh → nói lại cho trôi chảy.</p>
      ${(p.tasks || []).map((k, i) => `<div class="lcx-q"><b>Nhiệm vụ ${i + 1}.</b> ${esc(k.p)}<div style="margin:6px 0">${recHTML()}</div>
      ${k.model ? `<details><summary>💬 Câu trả lời mẫu</summary><div class="${zh ? 'zhb' : ''}" style="white-space:pre-line">${esc(k.model)} ${sayBtn(k.model, lang)}</div>${k.py ? `<div class="lcx-sub py">${esc(k.py)}</div>` : ''}${k.vi ? `<div class="lcx-sub">${esc(k.vi)}</div>` : ''}</details>` : ''}
      ${k.tips ? `<div class="lcx-tip">💡 ${clean(k.tips)}</div>` : ''}</div>`).join('')}`); }
  const LINK_EN = ['however','therefore','moreover','furthermore','in addition','although','though','whereas','while','because','since','as a result','consequently','for example','for instance','such as','in contrast','on the other hand','nevertheless','firstly','secondly','finally','in conclusion','overall','to sum up','in my opinion','not only','despite','in spite of','thus','hence','meanwhile','similarly','likewise','instead','otherwise','unless','so that','which','who','whose'];
  const LINK_ZH = ['因为','所以','但是','可是','虽然','不过','而且','并且','然后','首先','其次','最后','总之','因此','所以说','例如','比如','如果','即使','无论','不管','只要','只有','不但','不仅','而是','然而','此外','另外','同时','由于','于是','否则','尽管','从而','以便','总而言之'];
  function writeEl(p, t, o = {}){
    const zh = t === 'zh', lang = TR[t].lang;
    const el = mk(`${o.title === false ? '' : H(p)}<div class="lcx-q"><b>📝 Đề:</b> <span style="white-space:pre-line" class="${zh ? 'zh' : ''}">${esc(p.task)}</span>${p.min ? ` <span class="lcx-badge">tối thiểu ${p.min} ${zh ? 'chữ' : 'từ'}</span>` : ''}</div>
      ${p.chart ? '<canvas class="lcx-chart" width="760" height="380" style="max-width:100%;background:#fff;border-radius:10px"></canvas>' : ''}
      <textarea placeholder="Viết bài của bạn ở đây…" spellcheck="${zh ? 'false' : 'true'}"></textarea>
      <div class="lcx-row"><small class="cnt">0 ${zh ? 'chữ' : 'từ'}</small><span class="lcx-sp"></span><button class="lcx-btn sm" data-k="ana">🔎 Phân tích nhanh</button>${o.exam ? '' : '<button class="lcx-btn sm" data-k="model">📄 Xem bài mẫu</button>'}</div>
      <div class="ana"></div><div class="mdl" hidden><h4>📄 Bài mẫu</h4><div class="${zh ? 'zhb' : ''}" style="white-space:pre-line;line-height:1.75">${esc(p.model)} ${sayBtn(p.model, lang)}</div>${p.modelVi ? `<div class="lcx-sub" style="white-space:pre-line">${esc(p.modelVi)}</div>` : ''}</div>
      ${(p.tips || []).map(x => `<div class="lcx-tip">💡 ${clean(x)}</div>`).join('')}
      ${(p.checklist || p.rubric || []).length ? `<h4>✅ Tự kiểm tra bài viết</h4>${(p.checklist || p.rubric).map(x => `<label style="display:block"><input type="checkbox"> ${clean(x)}</label>`).join('')}` : ''}`);
    const ta = el.querySelector('textarea'), cnt = el.querySelector('.cnt');
    const count = s => zh ? s.replace(/[^一-鿿]/g, '').length : (s.match(/[A-Za-z0-9'’-]+/g) || []).length;
    ta.addEventListener('input', () => { const n = count(ta.value); cnt.textContent = `${n} ${zh ? 'chữ' : 'từ'}${p.min ? (n >= p.min ? ' ✓ đủ độ dài' : ` / cần ${p.min}`) : ''}`; });
    el.querySelector('[data-k=ana]').onclick = () => { const s = ta.value, out = []; const n = count(s);
      const sents = s.split(zh ? /[。！？!?]+/ : /[.!?]+/).map(x => x.trim()).filter(Boolean);
      out.push(`Độ dài: <b>${n}</b> ${zh ? 'chữ' : 'từ'}${p.min ? (n >= p.min ? ' ✓' : ` – <b style="color:#ff8b8b">thiếu ${p.min - n}</b>`) : ''} · ${sents.length} câu · TB ${sents.length ? Math.round(n / sents.length) : 0} ${zh ? 'chữ' : 'từ'}/câu`);
      const low = s.toLowerCase(); const links = (zh ? LINK_ZH : LINK_EN).filter(w => zh ? s.includes(w) : new RegExp(`\\b${w}\\b`).test(low));
      out.push(`Từ nối/liên kết đã dùng (${links.length}): ${links.length ? links.map(esc).join(', ') : '<i>chưa có – thêm từ nối để bài mạch lạc hơn</i>'}`);
      if(!zh){ const freq = {}; (low.match(/[a-z']{4,}/g) || []).filter(w => !['that','this','with','have','they','their','there','which','will','would','from','what','when','about','more','some','been','were','also','because','people'].includes(w)).forEach(w => freq[w] = (freq[w] || 0) + 1);
        const rep = Object.entries(freq).filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]).slice(0, 8); if(rep.length) out.push(`Lặp từ nhiều: ${rep.map(([w, c]) => `${esc(w)} ×${c}`).join(', ')} → thử thay bằng từ đồng nghĩa/đại từ`);
        const longS = sents.filter(x => x.split(/\s+/).length > 35).length; if(longS) out.push(`${longS} câu quá dài (>35 từ) – cân nhắc tách câu`);
        if(/\b(i|i'm)\b/.test(low) && /task|essay|report/i.test(p.task || '') && (p.min || 0) >= 150) out.push('Lưu ý: bài học thuật hạn chế “I” ở Task 1; Task 2 dùng “I” khi nêu quan điểm là được.'); }
      out.push('<small>Phân tích tự động chỉ đếm hình thức. Hãy tự chấm theo danh sách bên dưới và so với bài mẫu.</small>');
      el.querySelector('.ana').innerHTML = `<div class="lcx-fb">${out.map(x => `<div>• ${x}</div>`).join('')}</div>`; };
    const mb = el.querySelector('[data-k=model]'); if(mb) mb.onclick = () => { const m = el.querySelector('.mdl'); m.hidden = !m.hidden; };
    if(p.chart) requestAnimationFrame(() => drawChart(el.querySelector('canvas'), p.chart));
    el.showModel = () => { el.querySelector('.mdl').hidden = false; };
    el.value = () => ta.value;
    return el; }
  function charsEl(p, t){
    const el = mk(`${H(p)}<p class="mut">Bấm ✍️ để tập viết đè lên chữ mẫu (viết đúng thứ tự nét: trên → dưới, trái → phải, ngang trước sổ sau).</p>${(p.items || []).map((c, i) => `<div class="lcx-q"><div class="lcx-char"><div class="gl">${esc(c.c)}</div><div>
      <div><span class="py" style="font-size:18px">${esc(c.py)}</span> ${sayBtn(c.c, 'zh-CN')} ${c.hv ? `· Hán Việt: <b>${esc(c.hv)}</b>` : ''} ${c.strokes ? `· ${esc(c.strokes)} nét` : ''}</div>
      ${c.parts ? `<div>🧩 ${esc(c.parts)}</div>` : ''}${c.vi ? `<div>💡 ${esc(c.vi)}</div>` : ''}${c.words ? `<div class="zh">📚 ${esc(c.words)}</div>` : ''}
      <button class="lcx-btn sm" data-pad="${i}">✍️ Tập viết</button></div></div><div class="padbox" hidden></div></div>`).join('')}`);
    el.addEventListener('click', e => { const b = e.target.closest('[data-pad]'); if(!b) return; const c = p.items[+b.dataset.pad], box = b.closest('.lcx-q').querySelector('.padbox');
      if(!box.hidden){ box.hidden = true; return; } box.hidden = false; if(box.firstChild) return;
      box.innerHTML = `<div class="lcx-row" style="align-items:flex-start;margin-top:8px"><div class="lcx-pad"><span>${esc(c.c)}</span><canvas width="220" height="220"></canvas></div><div><button class="lcx-btn sm" data-c="clr">🧽 Xoá</button><br><button class="lcx-btn sm" data-c="ghost">👁 Ẩn/hiện chữ mẫu</button></div></div>`;
      const cv = box.querySelector('canvas'), g = cv.getContext('2d'); g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#1b1b1b'; let dn = false;
      const pt = ev => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) * cv.width / r.width, (ev.clientY - r.top) * cv.height / r.height]; };
      cv.onpointerdown = ev => { dn = true; cv.setPointerCapture(ev.pointerId); const [x, y] = pt(ev); g.beginPath(); g.moveTo(x, y); };
      cv.onpointermove = ev => { if(!dn) return; const [x, y] = pt(ev); g.lineTo(x, y); g.stroke(); };
      cv.onpointerup = () => { dn = false; };
      box.querySelector('[data-c=clr]').onclick = () => g.clearRect(0, 0, 220, 220);
      box.querySelector('[data-c=ghost]').onclick = () => { const s = box.querySelector('.lcx-pad span'); s.style.visibility = s.style.visibility === 'hidden' ? '' : 'hidden'; }; });
    return el; }
  function drawChart(cv, ch){
    if(!cv || !ch) return; const g = cv.getContext('2d'), Wd = cv.width, Ht = cv.height; g.clearRect(0, 0, Wd, Ht); g.fillStyle = '#fff'; g.fillRect(0, 0, Wd, Ht);
    const COL = ['#2f6fdb','#e5484d','#2f9e6e','#d9930d','#8e4ec6','#0d9488','#c2410c','#64748b'];
    g.fillStyle = '#111'; g.font = 'bold 16px Segoe UI, sans-serif'; g.textAlign = 'center'; g.fillText(ch.title || '', Wd / 2, 24);
    const S = ch.series || [], L = ch.labels || [], unit = ch.unit || '';
    if(ch.type === 'pie'){ const s = S[0] || {data:[]}, tot = s.data.reduce((a, b) => a + b, 0) || 1; let a0 = -Math.PI / 2; const cx = 230, cy = 205, r = 140;
      s.data.forEach((v, i) => { const a1 = a0 + v / tot * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a0, a1); g.closePath(); g.fillStyle = COL[i % COL.length]; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
        const am = (a0 + a1) / 2; g.fillStyle = '#fff'; g.font = 'bold 13px Segoe UI'; if(v / tot > .04) g.fillText(`${v}${unit}`, cx + Math.cos(am) * r * .65, cy + Math.sin(am) * r * .65 + 4); a0 = a1; });
      g.textAlign = 'left'; g.font = '14px Segoe UI'; L.forEach((l, i) => { g.fillStyle = COL[i % COL.length]; g.fillRect(420, 70 + i * 26, 16, 16); g.fillStyle = '#111'; g.fillText(l, 444, 83 + i * 26); });
      if(S.length > 1) g.fillText('(chỉ vẽ dãy số đầu – xem bảng bên dưới)', 420, 360); return; }
    if(ch.type === 'table'){ const cols = [''].concat(L), rows = S.map(s => [s.name].concat(s.data.map(v => `${v}${unit}`))); const cw = (Wd - 40) / cols.length, rh = Math.min(34, (Ht - 60) / (rows.length + 1));
      g.font = 'bold 13px Segoe UI'; g.textAlign = 'center'; cols.forEach((c, i) => { g.fillStyle = '#e8eef9'; g.fillRect(20 + i * cw, 44, cw, rh); g.fillStyle = '#111'; g.fillText(c, 20 + i * cw + cw / 2, 44 + rh * .65); });
      g.font = '13px Segoe UI'; rows.forEach((r, j) => r.forEach((c, i) => { g.strokeStyle = '#ccd'; g.strokeRect(20 + i * cw, 44 + (j + 1) * rh, cw, rh); g.fillStyle = '#111'; g.fillText(String(c), 20 + i * cw + cw / 2, 44 + (j + 1) * rh + rh * .65); })); return; }
    const all = S.flatMap(s => s.data), max = Math.max(1, ...all) * 1.12, min = Math.min(0, ...all);
    const x0 = 60, x1 = Wd - (S.length > 1 ? 170 : 30), y0 = Ht - 50, y1 = 46, sx = (x1 - x0) / Math.max(1, L.length - (ch.type === 'line' ? 1 : 0)), sy = v => y0 - (v - min) / (max - min) * (y0 - y1);
    g.strokeStyle = '#999'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
    g.font = '12px Segoe UI'; g.fillStyle = '#333'; g.textAlign = 'right';
    for(let k = 0; k <= 5; k++){ const v = min + (max - min) * k / 5, y = sy(v); g.fillText((Math.round(v * 10) / 10) + unit, x0 - 6, y + 4); g.strokeStyle = '#eee'; g.beginPath(); g.moveTo(x0 + 1, y); g.lineTo(x1, y); g.stroke(); }
    g.textAlign = 'center'; L.forEach((l, i) => g.fillText(l, ch.type === 'line' ? x0 + i * sx : x0 + (i + .5) * sx, y0 + 18));
    if(ch.type === 'bar'){ const bw = sx * .8 / Math.max(1, S.length); S.forEach((s, k) => { g.fillStyle = COL[k % COL.length]; s.data.forEach((v, i) => { const x = x0 + i * sx + sx * .1 + k * bw, y = sy(v); g.fillRect(x, y, bw - 2, y0 - y); }); }); }
    else S.forEach((s, k) => { g.strokeStyle = g.fillStyle = COL[k % COL.length]; g.lineWidth = 2.5; g.beginPath(); s.data.forEach((v, i) => { const x = x0 + i * sx, y = sy(v); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); s.data.forEach((v, i) => { g.beginPath(); g.arc(x0 + i * sx, sy(v), 3.5, 0, 7); g.fill(); }); });
    if(S.length > 1){ g.textAlign = 'left'; g.font = '13px Segoe UI'; S.forEach((s, k) => { g.fillStyle = COL[k % COL.length]; g.fillRect(x1 + 14, 60 + k * 24, 14, 14); g.fillStyle = '#111'; g.fillText(s.name, x1 + 34, 72 + k * 24); }); } }
  function teacherEl(T){ if(!T) return mk('<p class="mut">Bài này chưa có giáo án.</p>', 'lcx-card teach');
    return mk(`<h3>👩‍🏫 Giáo án cho giáo viên</h3><p><b>Thời lượng:</b> ${esc(T.time || '')}</p>${T.prep ? `<p><b>Chuẩn bị:</b> ${esc(T.prep)}</p>` : ''}
      ${(T.steps || []).length ? `<table><tr><th style="width:120px">Thời gian</th><th>Hoạt động</th></tr>${T.steps.map(s => `<tr><td>${esc(s.t)}</td><td>${clean(s.do)}</td></tr>`).join('')}</table>` : ''}
      ${(T.games || []).length ? `<h4>🎲 Hoạt động / trò chơi lớp</h4><ul>${T.games.map(g => `<li>${clean(g)}</li>`).join('')}</ul>` : ''}
      ${(T.errors || []).length ? `<h4>⚠️ Lỗi học viên hay mắc & cách sửa</h4><ul>${T.errors.map(g => `<li>${clean(g)}</li>`).join('')}</ul>` : ''}
      ${T.homework ? `<h4>🏠 Bài về nhà</h4><p>${clean(T.homework)}</p>` : ''}`, 'lcx-card teach'); }
  function partEl(p, t, ctxL){
    switch(p.k){
      case 'words': return wordsEl(p, t); case 'sounds': return soundsEl(p, t); case 'grammar': return grammarEl(p, t); case 'text': return textEl(p);
      case 'dialog': { const c = document.createElement('div'); const d = dialogEl(p, t, {hide:true}); c.appendChild(d);
        if((p.qs || []).length){ const q = quiz(p.qs, {t, lang:p.lang || TR[t].lang, src:(ctxL ? ctxL.id + ':dlg' : ''), submitText:'✅ Kiểm tra nghe hiểu', onDone:r => { d.unlock(); ctxL && ctxL.onListen && ctxL.onListen(r); }}); d.appendChild(mk('<h4>🎧 Câu hỏi nghe hiểu – nghe xong rồi trả lời (lời thoại đang che)</h4>', '')); d.appendChild(q.el); }
        return c; }
      case 'read': { const r = readEl(p, t); if((p.qs || []).length){ r.appendChild(mk('<h4>❓ Câu hỏi đọc hiểu</h4>', '')); r.appendChild(quiz(p.qs, {t, lang:TR[t].lang, src:(ctxL ? ctxL.id + ':read' : ''), submitText:'✅ Kiểm tra đọc hiểu'}).el); } return r; }
      case 'speak': return speakEl(p, t); case 'write': return writeEl(p, t); case 'chars': return charsEl(p, t);
      default: return mk(`<p class="mut">(khối “${esc(p.k)}” chưa hỗ trợ)</p>`); } }

  /* ============================== CHẠY BÀI THI (cấp · IELTS · HSK) ============================== */
  const L_BAND = [[39,9],[37,8.5],[35,8],[32,7.5],[30,7],[26,6.5],[23,6],[18,5.5],[16,5],[13,4.5],[10,4],[8,3.5],[6,3],[4,2.5],[2,2],[1,1],[0,0]];
  const R_BAND = [[39,9],[37,8.5],[35,8],[33,7.5],[30,7],[27,6.5],[23,6],[19,5.5],[15,5],[13,4.5],[10,4],[8,3.5],[6,3],[4,2.5],[2,2],[1,1],[0,0]];
  const band = (raw, tot, tb) => { const s = tot ? Math.round(raw / tot * 40) : 0; return (tb.find(([m]) => s >= m) || [0, 0])[1]; };
  const ieltsAvg = a => { const v = a.filter(x => x != null && !isNaN(x)); if(!v.length) return null; return Math.round(v.reduce((s, x) => s + x, 0) / v.length * 2) / 2; };
  function examRunner(X, t, {kind = 'level', onResult} = {}){
    const lang = TR[t].lang, el = document.createElement('div'), real0 = kind !== 'practice';
    el.innerHTML = `<div class="lcx-card"><h2>${esc(X.title || 'Bài thi')}</h2>${X.intro ? `<div style="white-space:pre-line">${clean(X.intro)}</div>` : ''}
      <p>⏱ Thời gian: <b>${X.time || '–'} phút</b>${kind === 'level' ? ` · Đạt: <b>≥ ${X.pass || 70}%</b> câu tự chấm` : ''}${kind === 'ielts' ? ' · Nghe/Đọc quy đổi band theo bảng tham khảo; Viết/Nói tự chấm theo tiêu chí + bài mẫu' : ''}${kind === 'hsk' ? ' · Mỗi kỹ năng quy về thang 100 điểm' : ''}</p>
      <label><input type="checkbox" data-real ${real0 ? 'checked' : ''}> Chế độ thi thật: bài nghe chỉ được nghe ${kind === 'ielts' ? '1 lần' : '2 lần'}, che lời thoại, đếm giờ</label><br>
      <button class="lcx-btn pri" data-start style="margin-top:8px">▶ Bắt đầu làm bài</button></div><div class="xb" hidden></div>`;
    const body = el.querySelector('.xb'); let parts = [], timer = 0, left = 0, fin = false;
    el.querySelector('[data-start]').onclick = () => {
      const real = el.querySelector('[data-real]').checked; el.firstElementChild.querySelector('[data-start]').remove(); el.querySelector('[data-real]').disabled = true; body.hidden = false;
      let n = 0;
      (X.sections || []).forEach((s, si) => {
        const card = mk(`<h3>${esc(s.h || `Phần ${si + 1}`)}${s.skill ? ` <span class="lcx-badge blue">${{L:'Nghe', R:'Đọc', W:'Viết', S:'Nói'}[s.skill] || s.skill}</span>` : ''}</h3>${s.intro ? `<p class="mut" style="white-space:pre-line">${esc(s.intro)}</p>` : ''}`); body.appendChild(card);
        const part = {s, si, q:null, dlg:null, wr:null};
        if(s.dialog){ part.dlg = dialogEl({...s.dialog, h:''}, t, {exam:true, title:false, hide:true, lockText:real, plays:real ? (kind === 'ielts' ? 1 : 2) : 0}); card.appendChild(part.dlg); }
        if(s.read){ card.appendChild(readEl({...s.read, h:''}, t, {exam:true, title:false})); }
        if((s.items || []).length){ part.q = quiz(s.items, {t, lang:(s.dialog && s.dialog.lang) || lang, noSubmit:true, start:n, plays:real ? (kind === 'ielts' ? 1 : 2) : 0, showKey:false, src:X.id ? `${X.id}#${si}` : ''}); n += s.items.length; card.appendChild(part.q.el); }
        if(s.write){ part.wr = writeEl({...s.write, h:''}, t, {exam:true, title:false}); card.appendChild(part.wr); }
        if(s.speak){ card.appendChild(speakEl({h:'', tasks:s.speak.tasks || []}, t)); if((s.speak.rubric || []).length) card.appendChild(mk(`<h4>Tiêu chí tự chấm</h4><ul>${s.speak.rubric.map(x => `<li>${clean(x)}</li>`).join('')}</ul>`, '')); }
        parts.push(part); });
      const foot = mk(`<div class="lcx-row"><button class="lcx-btn pri" data-sub>📤 Nộp bài</button><span class="lcx-sp"></span><span class="lcx-timer"></span></div><div class="xres"></div>`); body.appendChild(foot);
      const tEl = foot.querySelector('.lcx-timer'); left = (X.time || 0) * 60;
      const tick = () => { if(fin) return; if(!X.time || !real){ tEl.textContent = '⏱ không giới hạn'; return; } left--; const m = Math.max(0, left); tEl.textContent = `⏱ ${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; if(left <= 0){ note('⏰ Hết giờ – tự động nộp bài'); submit(); } };
      tick(); timer = setInterval(tick, 1000);
      leaveGuard = () => fin || confirm('Bạn đang làm bài thi. Thoát bây giờ sẽ mất bài làm. Vẫn thoát?');
      foot.querySelector('[data-sub]').onclick = () => { if(!fin && (!real || left > 30) && !confirm('Nộp bài và chấm điểm?')) return; submit(); };
      function submit(){
        if(fin) return; fin = true; clearInterval(timer); leaveGuard = null; hush(); stopRec(); foot.querySelector('[data-sub]').disabled = true;
        const sk = {}; let right = 0, total = 0;
        for(const p of parts){ if(p.q) p.q.submit(); if(p.dlg) p.dlg.unlock(); if(p.wr) p.wr.showModel(); }
        for(const p of parts){ if(!p.q) continue; const r = p.q.score(); right += r.right; total += r.total; const k = p.s.skill || 'X'; sk[k] = sk[k] || {right:0, total:0}; sk[k].right += r.right; sk[k].total += r.total; }
        const res = {right, total, pct:pct(right, total), sk, at:now()};
        if(kind === 'ielts'){ res.L = sk.L ? band(sk.L.right, sk.L.total, L_BAND) : null; res.R = sk.R ? band(sk.R.right, sk.R.total, R_BAND) : null; }
        if(kind === 'hsk'){ res.scores = Object.fromEntries(Object.entries(sk).map(([k, v]) => [k, pct(v.right, v.total)])); }
        const box = foot.querySelector('.xres');
        const paint = () => {
          let h = `<div class="lcx-card hot"><h2>📊 Kết quả</h2><p class="lcx-res">${right}/${total} câu tự chấm đúng · ${res.pct}%</p>`;
          if(kind === 'level') h += `<p>${res.pct >= (X.pass || 70) ? '🏅 <b style="color:#46d39a">ĐẠT</b> – đủ điều kiện lên cấp tiếp theo!' : `❌ Chưa đạt (cần ${X.pass || 70}%). Ôn lại các bài có câu sai (đã lưu vào 📕 Sổ lỗi sai) rồi thi lại.`}</p>`;
          if(kind === 'ielts'){ const opts = sel => ['', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9'].map(v => `<option${String(sel ?? '') === v ? ' selected' : ''}>${v}</option>`).join('');
            h += `<table><tr><th>Listening</th><th>Reading</th><th>Writing (tự chấm)</th><th>Speaking (tự chấm)</th><th>Overall</th></tr><tr><td>${sk.L ? `${sk.L.right}/${sk.L.total} → <b>${res.L}</b>` : '–'}</td><td>${sk.R ? `${sk.R.right}/${sk.R.total} → <b>${res.R}</b>` : '–'}</td>
              <td><select data-b="W">${opts(res.W)}</select></td><td><select data-b="S">${opts(res.S)}</select></td><td><b class="ov">${ieltsAvg([res.L, res.R, res.W, res.S]) ?? '–'}</b></td></tr></table>
              <p class="mut">Quy đổi Nghe/Đọc theo bảng tham khảo phổ biến (có thể lệch ±0,5 so với đề thật). Viết/Nói: đọc tiêu chí + bài mẫu bên dưới mỗi phần rồi tự chọn band trung thực – hoặc nhờ giáo viên chấm.</p>`; }
          if(kind === 'hsk'){ const sc = res.scores, tot = Object.values(sc).reduce((a, b) => a + b, 0), max = Object.keys(sc).length * 100, need = (X.hsk || 3) <= 2 ? .6 * max : .6 * max;
            h += `<table><tr>${Object.keys(sc).map(k => `<th>${{L:'听力 Nghe', R:'阅读 Đọc', W:'书写 Viết'}[k] || k}</th>`).join('')}<th>Tổng</th></tr><tr>${Object.values(sc).map(v => `<td>${v}/100</td>`).join('')}<td><b>${tot}/${max}</b> ${tot >= need ? '✅ Đạt' : '❌ Chưa đạt'} (đạt ≥ ${Math.round(need)})</td></tr></table>`; }
          box.innerHTML = h + '</div>';
          box.querySelectorAll('[data-b]').forEach(s => s.onchange = () => { res[s.dataset.b] = s.value ? +s.value : null; box.querySelector('.ov').textContent = ieltsAvg([res.L, res.R, res.W, res.S]) ?? '–'; onResult && onResult(res, true); });
          box.scrollIntoView({block:'start'}); };
        paint(); onResult && onResult(res, false); }
    };
    return el; }

  /* ============================== MÀN HÌNH ============================== */
  const VIEWS = {};
  const go = r => esc(JSON.stringify(r));
  const levelsDone = (t, L) => (L.lessons || []).filter(x => P.done[lid(t, L.code, x.no)]).length;
  async function nextLesson(t){ const I = await IDX(); for(const L of I.tracks[t].levels){ if(!L.file) continue; for(const x of L.lessons) if(!P.done[lid(t, L.code, x.no)]) return {v:'lesson', t, c:L.code, n:x.no}; } return null; }
  const voiceNote = () => { const en = hasVoice('en-GB'), zh = hasVoice('zh-CN'); if(en && zh) return '';
    return `<div class="lcx-card hot"><b>🔊 Giọng đọc:</b> Tiếng Anh ${en ? '✓ có' : '✗ chưa có'} · Tiếng Trung ${zh ? '✓ có' : '✗ chưa có'} giọng cài trên máy (offline).<br>
      <small>Cách 1 (khuyên dùng, chạy offline): Windows → Settings → Time & Language → Speech → <b>Add voices</b> → thêm “English (United Kingdom)” / “Chinese (Simplified, China)”, rồi mở lại game.<br>
      Cách 2: ⚙️ Cài đặt → bật “Cho phép giọng online” (giọng tự nhiên của Edge – câu bài học được gửi tới dịch vụ đọc của trình duyệt, cần Internet).</small></div>`; };

  VIEWS.home = async (r, el) => {
    r.label = '🏠 Sảnh'; let I = null; try{ I = await IDX(); }catch(e){}
    const due = dueList(), st = streak();
    const card = t => { const T = I && I.tracks[t]; const tot = T ? T.levels.reduce((a, L) => a + (L.lessons || []).length, 0) : 0, dn = T ? T.levels.reduce((a, L) => a + levelsDone(t, L), 0) : 0;
      const cur = T && T.levels.find(L => L.file && levelsDone(t, L) < L.lessons.length);
      return `<div class="lcx-tile" data-go="${go({v:'track', t})}"><div class="lcx-row">${flag(t)}<b style="font-size:19px">${TR[t].name}</b><span class="lcx-sp"></span><span class="lcx-badge">${TR[t].goal}</span></div>
        <div class="lcx-bar"><i style="width:${pct(dn, tot)}%"></i></div><small>${dn}/${tot} bài đã xong${cur ? ` · đang ở: <b>${esc(cur.name)}</b>` : ''} · ${dueList(t).length} bài đến hạn ôn</small>
        <div style="margin-top:8px"><span class="lcx-btn sm">🗺️ Vào lộ trình</span><span class="lcx-btn sm ok" data-next="${t}">▶ Học tiếp</span></div></div>`; };
    el.innerHTML = `<h1>🗣️ Trung tâm Ngoại ngữ QC</h1>
      <p class="mut">Học <b>miễn phí</b>. ${flag('en')}Tiếng Anh từ con số 0 → IELTS 8.0+ · ${flag('zh')}Tiếng Trung từ con số 0 → HSK 7–9. Bài học đánh số theo từng cấp: phát âm → từ vựng → ngữ pháp → nghe → đọc → nói → viết → bài tập tự chấm; cuối cấp có bài thi; cuối lộ trình có đề thi thử. Hệ thống tự <b>bắt kiểm tra lại</b> bài cũ đúng lúc bạn sắp quên (sau 1 · 3 · 7 · 14 · 30 · 60 ngày).</p>
      ${due.length ? `<div class="lcx-card hot"><h3>📌 Đến hạn kiểm tra lại: ${due.length} bài</h3><p class="mut">Mỗi bài ~3 phút. Đạt ≥ 80% → lịch ôn giãn ra; chưa đạt → mai kiểm tra lại.${P.set.force ? ' <b>Phải làm xong mới được học bài mới.</b>' : ''}</p>${due.slice(0, 8).map(d => { const p = parseId(d.id); return `<button class="lcx-btn sm" data-go="${go({v:'review', id:d.id})}">${flag(p.t)} ${esc(p.c.toUpperCase())} · Bài ${p.n}</button>`; }).join('')}${due.length > 8 ? ` <small>… và ${due.length - 8} bài</small>` : ''}</div>` : ''}
      <div class="lcx-grid" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr))">${card('en')}${card('zh')}</div>
      <div class="lcx-card"><div class="lcx-row">🔥 Chuỗi ngày học: <b>${st}</b> · Hôm nay: <b>${P.stats.days[dkey()] || 0}</b> phút · Bài đã xong: <b>${Object.keys(P.done).length}</b> · Thẻ từ đang ôn: <b>${Object.keys(P.srs).length}</b> · Chứng chỉ: <b>${Object.keys(P.certs).length}</b></div></div>
      <div class="lcx-grid">
        <div class="lcx-tile" data-go="${go({v:'help'})}"><div class="big">🧭</div><b>Hướng dẫn & lộ trình</b><div class="mut">Cách học hiệu quả, bảng cấp độ CEFR/IELTS/HSK, cách dạy lại cho người khác</div></div>
        <div class="lcx-tile" data-go="${go({v:'certs'})}"><div class="big">🏅</div><b>Chứng chỉ của tôi</b><div class="mut">Đạt bài thi cuối cấp → nhận chứng nhận, tải ảnh</div></div>
        <div class="lcx-tile" data-go="${go({v:'links'})}"><div class="big">🔗</div><b>Đề mẫu chính thức miễn phí</b><div class="mut">Trang luyện thi chính thức IELTS / HSK (mở trình duyệt, cần mạng)</div></div>
        <div class="lcx-tile" data-go="${go({v:'settings'})}"><div class="big">⚙️</div><b>Cài đặt</b><div class="mut">Giọng đọc, tốc độ, ôn tập bắt buộc, chế độ giáo viên, sao lưu tiến độ</div></div>
      </div>${voiceNote()}`;
    el.addEventListener('click', async e => { const b = e.target.closest('[data-next]'); if(!b) return; e.stopPropagation(); const r2 = await nextLesson(b.dataset.next); if(r2) nav(r2); else note('🎉 Bạn đã học hết các bài hiện có của lộ trình này!'); }, true); };

  VIEWS.track = async (r, el) => {
    const t = r.t, I = await IDX(), T = I.tracks[t]; r.label = `${TR[t].short} ${TR[t].name}`;
    const due = dueList(t), srsDue = Object.entries(P.srs).filter(([k, v]) => k.startsWith(t + ':') && v.d <= now()).length, wr = Object.values(P.wrong).filter(w => w.t === t).length;
    const tile = (icon, name, sub, route, dis) => `<div class="lcx-tile${dis ? ' dis' : ''}" ${dis ? '' : `data-go="${go(route)}"`}><div class="big">${icon}</div><b>${name}</b><div class="mut">${sub}</div></div>`;
    el.innerHTML = `<h1>${flag(t)}${TR[t].name} – ${TR[t].goal}</h1>
      <div class="lcx-grid">
        ${tile('🔁', 'Ôn tập đến hạn', due.length ? `<b style="color:#ffb547">${due.length} bài cần kiểm tra lại</b>` : 'Không có bài đến hạn 👍', {v:'reviews', t})}
        ${tile('🃏', 'Thẻ từ vựng', `${srsDue} thẻ đến hạn · lặp lại ngắt quãng`, {v:'cards', t})}
        ${tile('🧪', 'Kiểm tra', 'Từ vựng · ngữ pháp · nghe · tổng hợp (tự sinh đề)', {v:'tests', t})}
        ${tile('🎭', 'Hội thoại giao tiếp', T.talk ? `${T.talk.talks.length} tình huống · nghe – trả lời – nhập vai` : 'đang soạn', {v:'talks', t}, !T.talk)}
        ${tile('📝', 'Thi thử', T.mock ? `${T.mock.tests.length} đề ${t === 'en' ? 'IELTS' : 'HSK'} tự soạn` : 'đang soạn', {v:'mocks', t}, !T.mock)}
        ${tile('📖', 'Sổ tay chuyên đề', T.guide ? `${T.guide.articles.length} chuyên đề cho giáo viên & tra cứu` : 'đang soạn', {v:'guide', t}, !T.guide)}
        ${tile('📕', 'Sổ lỗi sai', `${wr} câu từng làm sai – làm lại đến khi đúng`, {v:'wrong', t})}
      </div><h2 style="margin-top:18px">🗺️ Lộ trình theo cấp</h2>
      ${T.levels.map((L, i) => { const dn = levelsDone(t, L), n = (L.lessons || []).length, ex = P.exams[`${t}-${L.code}`], ce = P.certs[`${t}-${L.code}`];
        return `<div class="lcx-tile${L.file ? '' : ' dis'}" style="margin:10px 0" ${L.file ? `data-go="${go({v:'level', t, c:L.code})}"` : ''}><div class="lcx-row"><b style="font-size:17px">${esc(L.name)}</b><span class="lcx-badge">${esc(L.eq)}</span><span class="lcx-badge">~${L.hours} giờ tích luỹ</span>${ce ? '<span class="lcx-badge gold">🏅 Đã có chứng chỉ</span>' : ''}<span class="lcx-sp"></span><small>${L.file ? `${dn}/${n} bài${L.hasExam ? ` · thi: ${ex ? ex.best + '%' : 'chưa thi'}` : ''}` : 'đang soạn…'}</small></div>
          <div class="mut">${esc(L.desc)}</div>${L.file ? `<div class="lcx-bar"><i style="width:${pct(dn, n)}%"></i></div>` : ''}</div>`; }).join('')}`; };

  VIEWS.level = async (r, el) => {
    const {t, c} = r, meta = await levelMeta(t, c); if(!meta || !meta.file) throw new Error('Cấp này đang được soạn.');
    r.label = meta.name; const D = await LV(t, c), next = D.lessons.find(L => !P.done[L.id]), ex = P.exams[`${t}-${c}`];
    el.innerHTML = `<h1>${flag(t)}${esc(meta.name)} <span class="lcx-badge">${esc(meta.eq)}</span></h1><p class="mut">${esc(meta.desc)} · Ước tính ~${meta.hours} giờ học tích luỹ từ đầu lộ trình.</p>
      <div class="lcx-row">${next ? `<button class="lcx-btn ok" data-go="${go({v:'lesson', t, c, n:next.no})}">▶ Học tiếp: Bài ${next.no}</button>` : '<span class="lcx-badge green">✓ Đã học hết các bài</span>'}
        ${D.exam ? `<button class="lcx-btn pri" data-go="${go({v:'exam', t, c})}">📝 Bài thi cuối cấp${ex ? ` (cao nhất ${ex.best}%)` : ''}</button>` : ''}
        <button class="lcx-btn" data-go="${go({v:'tests', t, c})}">🧪 Kiểm tra cấp này</button><button class="lcx-btn" data-go="${go({v:'cards', t, c})}">🃏 Thẻ từ của cấp</button>
        <button class="lcx-btn" data-k="print">🖨️ In giáo trình</button><button class="lcx-btn" data-k="dl">💾 Tải giáo trình (.html)</button></div>
      <div class="lessons"></div>`;
    el.querySelector('.lessons').innerHTML = D.lessons.map(L => { const d = P.done[L.id], rv = P.rev[L.id];
      const st = d ? `<span class="lcx-badge green">✓ ${d.best}%</span>` : P.opened[L.id] ? '<span class="lcx-badge blue">đang học</span>' : '<span class="lcx-badge">chưa học</span>';
      const rs = rv ? (rv.off ? '<span class="lcx-badge gold">🏆 đã thuộc</span>' : rv.due <= now() ? '<span class="lcx-badge red">🔁 đến hạn ôn</span>' : `<span class="lcx-badge">ôn lại ${fmtD(rv.due)}</span>`) : '';
      return `<div class="lcx-tile" style="margin:8px 0" data-go="${go({v:'lesson', t, c, n:L.no})}"><div class="lcx-row"><b>Bài ${L.no}: ${esc(L.title)}</b><span class="lcx-sp"></span>${st}${rs}</div><div class="mut ${t === 'zh' ? 'zh' : ''}">${esc(L.sub || '')}</div></div>`; }).join('');
    el.querySelector('[data-k=print]').onclick = () => printLevel(t, c, false);
    el.querySelector('[data-k=dl]').onclick = () => printLevel(t, c, true); };

  VIEWS.lesson = async (r, el) => {
    const {t, c, n} = r, D = await LV(t, c), L = D.lessons.find(x => x.no === n); if(!L) throw new Error('Không thấy bài ' + n);
    const meta = await levelMeta(t, c); r.label = `Bài ${L.no}`;
    if(!P.done[L.id] && P.set.force && !P.set.teacher){ const due = dueList(t);
      if(due.length){ el.innerHTML = `<div class="lcx-card lcx-gate"><h2>📌 Đến giờ kiểm tra lại bài cũ!</h2><p>Bạn có <b>${due.length}</b> bài đã học cần kiểm tra lại để chắc chắn còn nhớ. Làm xong (mỗi bài ~3 phút) rồi học <b>Bài ${L.no}</b> nhé.</p>
        <p class="mut">Vì sao bắt buộc? Não quên ~70% sau vài ngày nếu không ôn. Kiểm tra lại đúng lúc sắp quên là cách “học dở mà chăm vẫn giỏi”.</p>
        ${due.map(d => { const p = parseId(d.id); return `<button class="lcx-btn sm ok" data-go="${go({v:'review', id:d.id})}">🔁 ${esc(p.c.toUpperCase())} · Bài ${p.n}</button>`; }).join('')}
        <p><small>Có thể tắt chế độ bắt buộc trong ⚙️ Cài đặt (không khuyến khích). Giáo viên bật 👩‍🏫 để xem bài tự do.</small></p></div>`; return; } }
    P.opened[L.id] = P.opened[L.id] || now(); save();
    const top = mk(`<div class="lcx-row"><span class="lcx-badge">${flag(t)}${esc(meta ? meta.name : c)}</span><span class="lcx-sp"></span>${P.done[L.id] ? `<span class="lcx-badge green">✓ Đã hoàn thành · ${P.done[L.id].best}%</span>` : ''}</div>
      <h1>Bài ${L.no}: ${esc(L.title)}</h1>${L.sub ? `<p class="mut ${t === 'zh' ? 'zhb' : ''}">${esc(L.sub)}</p>` : ''}
      ${(L.goals || []).length ? `<h4>🎯 Mục tiêu bài học</h4><ul>${L.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}
      <p class="mut">Học lần lượt từ trên xuống. Bấm 🔊 để nghe. Cuối bài làm <b>Bài tập</b> (≥ 60% là hoàn thành) – sau đó hệ thống sẽ hẹn ngày kiểm tra lại.</p>`);
    el.appendChild(top);
    if(P.set.teacher) el.appendChild(teacherEl(L.teacher));
    for(const p of L.parts || []) el.appendChild(partEl(p, t, {id:L.id}));
    const exCard = mk(`<h2>📝 Bài tập cuối bài (${(L.exercises || []).length} câu)</h2><p class="mut">Làm hết rồi bấm Nộp bài. Câu sai tự vào 📕 Sổ lỗi sai.</p>`); el.appendChild(exCard);
    const runEx = () => { const q = quiz(L.exercises || [], {t, lang:TR[t].lang, src:L.id, onDone:res => {
        const msg = document.createElement('div');
        if(res.pct >= 60){ const first = !P.done[L.id]; const d = P.done[L.id] || {best:0, n:0}; d.best = Math.max(d.best, res.pct); d.n++; d.at = now(); P.done[L.id] = d; schedule(L.id); save();
          if(first) coins(10, `📗 Hoàn thành Bài ${L.no} (+10 💰)`);
          for(const w of wordsOf(L)){ const k = `${t}:${w.w}`; if(!P.srs[k]) P.srs[k] = {b:0, d:now(), n:0, lv:c}; } save();
          msg.innerHTML = `<div class="lcx-card hot"><b>✅ Hoàn thành bài ${L.no}!</b> ${res.pct}%. Từ vựng của bài đã vào kho 🃏 Thẻ từ vựng. 🔁 Kiểm tra lại lần đầu: <b>${fmtD(P.rev[L.id].due)}</b>.
            <div style="margin-top:6px">${D.lessons.find(x => x.no === L.no + 1) ? `<button class="lcx-btn ok" data-go="${go({v:'lesson', t, c, n:L.no + 1})}">Bài ${L.no + 1} ▶</button>` : D.exam ? `<button class="lcx-btn pri" data-go="${go({v:'exam', t, c})}">📝 Làm bài thi cuối cấp</button>` : ''} <button class="lcx-btn" data-again>↺ Làm lại bài tập</button></div></div>`; }
        else msg.innerHTML = `<div class="lcx-card hot"><b>Chưa đạt (${res.pct}%)</b> – cần ≥ 60%. Đọc kỹ phần giải thích các câu sai, xem lại phần lý thuyết phía trên rồi làm lại. <button class="lcx-btn" data-again>↺ Làm lại</button></div>`;
        exCard.appendChild(msg); const ag = msg.querySelector('[data-again]'); if(ag) ag.onclick = () => { exCard.querySelectorAll(':scope > div:not(:first-child)').forEach(x => x.remove()); runEx(); };
      }}); exCard.appendChild(q.el); };
    runEx();
    const nb = mk(`<div class="lcx-row">${D.lessons.find(x => x.no === L.no - 1) ? `<button class="lcx-btn" data-go="${go({v:'lesson', t, c, n:L.no - 1})}">◀ Bài ${L.no - 1}</button>` : ''}<span class="lcx-sp"></span><button class="lcx-btn" data-go="${go({v:'level', t, c})}">☰ Danh sách bài</button>${D.lessons.find(x => x.no === L.no + 1) ? `<button class="lcx-btn" data-go="${go({v:'lesson', t, c, n:L.no + 1})}">Bài ${L.no + 1} ▶</button>` : ''}</div>`, ''); el.appendChild(nb); };

  VIEWS.exam = async (r, el) => {
    const {t, c} = r, D = await LV(t, c), meta = await levelMeta(t, c); if(!D.exam) throw new Error('Cấp này chưa có bài thi.'); r.label = '📝 Thi cuối cấp';
    const key = `${t}-${c}`;
    el.appendChild(examRunner({...D.exam, id:`${key}-exam`}, t, {kind:'level', onResult:(res, upd) => { if(upd) return;
      const e = P.exams[key] || {best:0, n:0}; e.best = Math.max(e.best, res.pct); e.last = res.pct; e.n++; e.at = now(); e.pass = e.pass || res.pct >= (D.exam.pass || 70); P.exams[key] = e;
      if(res.pct >= (D.exam.pass || 70) && !P.certs[key]){ P.certs[key] = {at:now(), score:res.pct, name:(W.PROFILE && W.PROFILE.name) || 'Học viên', title:meta ? meta.name : c, t}; coins(100, `🏅 Đạt bài thi ${meta ? meta.name : c} – nhận chứng chỉ (+100 💰)`); note('🏅 Chúc mừng! Bạn đã nhận chứng chỉ – xem ở Sảnh › Chứng chỉ của tôi.', 5000); }
      save(); }})); };

  VIEWS.reviews = async (r, el) => {
    r.label = '🔁 Ôn tập'; const t = r.t, all = Object.entries(P.rev).filter(([id]) => !t || id.startsWith(t + '-')).map(([id, v]) => ({id, ...v})).sort((a, b) => a.due - b.due);
    el.innerHTML = `<h1>🔁 Lịch kiểm tra lại</h1><p class="mut">Mỗi bài đã hoàn thành được kiểm tra lại sau 1 → 3 → 7 → 14 → 30 → 60 ngày. Đạt ≥ 80% thì giãn lịch; sai nhiều thì kéo lịch về gần. Qua mốc 60 ngày = 🏆 đã thuộc lâu dài.</p>
      ${all.length ? `<table><tr><th>Bài</th><th>Lần ôn</th><th>Hạn</th><th></th></tr>${all.map(d => { const p = parseId(d.id); return `<tr><td>${flag(p.t)} ${esc(p.c.toUpperCase())} · Bài ${p.n}</td><td>${d.off ? '🏆 đã thuộc' : `mốc ${INTV[d.s]} ngày${d.fail ? ` · trượt ${d.fail} lần` : ''}`}</td><td>${d.off ? '–' : d.due <= now() ? '<b style="color:#ffb547">ĐẾN HẠN</b>' : fmtD(d.due)}</td><td><button class="lcx-btn sm${d.due <= now() && !d.off ? ' ok' : ''}" data-go="${go({v:'review', id:d.id})}">Kiểm tra</button></td></tr>`; }).join('')}</table>` : '<p>Chưa có bài nào – hoàn thành bài học đầu tiên để bắt đầu lịch ôn.</p>'}`; };

  VIEWS.review = async (r, el) => {
    const p = parseId(r.id); r.label = `🔁 Ôn Bài ${p.n}`; const {L, items} = await reviewItems(r.id);
    el.appendChild(mk(`<h1>🔁 Kiểm tra lại: Bài ${L.no} – ${esc(L.title)}</h1><p class="mut">${items.length} câu trộn: bài tập của bài · từ vựng · nghe chép chính tả. Đạt ≥ 80% để giãn lịch ôn. Không xem lại bài trước khi làm – đây là bài kiểm tra trí nhớ!</p>`));
    const q = quiz(items, {t:p.t, lang:TR[p.t].lang, src:r.id + ':rev', onDone:async res => { const rv = await reviewDone(r.id, res.pct);
      el.appendChild(mk(res.pct >= 80 ? `<b>✅ Nhớ tốt!</b> ${rv.off ? '🏆 Bài này đã thuộc lâu dài.' : `Lần kiểm tra tiếp: <b>${fmtD(rv.due)}</b> (sau ${INTV[rv.s]} ngày).`} <button class="lcx-btn" data-x="back">◀ Quay lại</button>` : `<b>Chưa đạt (${res.pct}%).</b> Mai kiểm tra lại. Nên mở lại bài để xem phần sai: <button class="lcx-btn" data-go="${go({v:'lesson', t:p.t, c:p.c, n:p.n})}">📖 Mở Bài ${p.n}</button>`, 'lcx-card hot')); }});
    el.appendChild(q.el); };

  // ---- kiểm tra tự sinh đề: từ vựng / ngữ pháp / nghe / tổng hợp ----
  async function scopeLessons(t, c){ const I = await IDX(); const lv = I.tracks[t].levels.filter(L => L.file && (!c || L.code === c)); const out = [];
    for(const L of lv){ const D = await LV(t, L.code); for(const x of D.lessons) if(c || P.opened[x.id] || P.done[x.id]) out.push({L:x, D}); } return out; }
  VIEWS.tests = async (r, el) => {
    const t = r.t, I = await IDX(); r.label = '🧪 Kiểm tra';
    const lv = I.tracks[t].levels.filter(L => L.file);
    el.innerHTML = `<h1>🧪 Kiểm tra ${TR[t].name}</h1><p class="mut">Đề tự sinh ngẫu nhiên mỗi lần từ các bài trong phạm vi bạn chọn – làm nhiều lần không trùng hẳn. Câu sai vào 📕 Sổ lỗi sai.</p>
      <div class="lcx-card"><div class="lcx-row"><b>Phạm vi:</b><select data-c><option value="">Các bài tôi đã học/đã mở</option>${lv.map(L => `<option value="${L.code}"${r.c === L.code ? ' selected' : ''}>${esc(L.name)} (cả cấp)</option>`).join('')}</select>
        <b>Số câu:</b><select data-n><option>10</option><option selected>20</option><option>30</option><option>40</option></select></div>
        <div class="lcx-row" style="margin-top:10px">${[['vocab', '🔤 Từ vựng'], ['grammar', '🧩 Ngữ pháp & cấu trúc'], ['listen', '🎧 Nghe hiểu'], ['mixed', '🧪 Tổng hợp']].map(([k, n]) => `<button class="lcx-btn ${k === 'mixed' ? 'pri' : ''}" data-k="${k}">${n}</button>`).join('')}</div></div><div class="run"></div>
      ${P.tests.filter(x => x.t === t).length ? `<details><summary>📈 Lịch sử kiểm tra (${P.tests.filter(x => x.t === t).length})</summary><table>${P.tests.filter(x => x.t === t).slice(-20).reverse().map(x => `<tr><td>${fmtD(x.at)}</td><td>${esc(x.kind)}</td><td>${esc(x.scope || 'đã học')}</td><td><b>${x.pct}%</b> (${x.n} câu)</td></tr>`).join('')}</table></details>` : ''}`;
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = async () => {
      const kind = b.dataset.k, c = el.querySelector('[data-c]').value, n = +el.querySelector('[data-n]').value, run = el.querySelector('.run');
      const S = await scopeLessons(t, c); if(!S.length){ run.innerHTML = '<div class="lcx-card hot">Bạn chưa mở bài nào – hãy chọn phạm vi “cả cấp” hoặc học bài đầu tiên.</div>'; return; }
      const words = S.flatMap(s => wordsOf(s.L)), pool = words.concat(...S.map(s => levelWords(s.D)));
      const exs = S.flatMap(s => (s.L.exercises || []).map((x, i) => ({x, k:`${s.L.id}#${i}`})));
      const gram = exs.filter(o => ['mc', 'fill', 'order', 'match'].includes(o.x.t)).map(o => o.x), lis = exs.filter(o => ['listen', 'dict'].includes(o.x.t)).map(o => o.x);
      let items = [], dlg = null;
      if(kind === 'vocab') items = vocabQs(words, pool, t, n);
      else if(kind === 'grammar') items = pick(gram, n);
      else if(kind === 'listen'){ const ds = S.flatMap(s => (s.L.parts || []).filter(p => p.k === 'dialog' && (p.qs || []).length)); if(ds.length) dlg = pick(ds, 1)[0];
        items = pick(lis, Math.max(4, n - (dlg ? dlg.qs.length : 0))).concat(vocabQs(words, pool, t, 3).filter(x => x.t !== 'mc')); }
      else items = shuffle(vocabQs(words, pool, t, Math.round(n * .4)).concat(pick(gram, Math.round(n * .4)), pick(lis, Math.max(2, n - Math.round(n * .8)))));
      if(!items.length && !dlg){ run.innerHTML = '<div class="lcx-card hot">Phạm vi này chưa đủ câu cho dạng kiểm tra đã chọn.</div>'; return; }
      run.innerHTML = ''; hush(); const box = mk(`<h2>${b.textContent} · ${items.length + (dlg ? dlg.qs.length : 0)} câu</h2>`); run.appendChild(box);
      const log = res => { P.tests.push({at:now(), t, kind:b.textContent, scope:c ? c.toUpperCase() : 'đã học', pct:res.pct, n:res.total}); if(P.tests.length > 200) P.tests.splice(0, P.tests.length - 200); save(); };
      if(dlg){ const d = dialogEl({...dlg, h:'🎧 Bài nghe (lời thoại bị che – nghe tối đa 2 lần)'}, t, {hide:true, lockText:true, plays:2}); box.appendChild(d); box.appendChild(quiz(dlg.qs, {t, lang:dlg.lang || TR[t].lang, submitText:'✅ Chấm phần nghe', onDone:res => { d.unlock(); }}).el); }
      if(items.length) box.appendChild(quiz(items, {t, lang:TR[t].lang, src:`test-${t}`, start:dlg ? dlg.qs.length : 0, onDone:log}).el);
      box.scrollIntoView({block:'start'}); }); };

  // ---- kiểm tra nhanh đột xuất (game hỏi khi đang chơi) ----
  VIEWS.quick = async (r, el) => {
    r.label = '⚡ Kiểm tra nhanh'; const ids = Object.keys(P.done).map(parseId).filter(Boolean);
    if(!ids.length){ el.innerHTML = '<div class="lcx-card">Bạn chưa hoàn thành bài nào – học Bài 1 trước nhé!</div>'; return; }
    const t = pick(ids, 1)[0].t, mine = ids.filter(x => x.t === t), items = [];
    const S = []; for(const x of mine){ const D = await LV(x.t, x.c), L = D.lessons.find(l => l.no === x.n); if(L) S.push({L, D}); }
    const words = S.flatMap(s => wordsOf(s.L)), pool = words.concat(...S.map(s => levelWords(s.D)));
    items.push(...vocabQs(words, pool, t, 4));
    const ex = S.flatMap(s => (s.L.exercises || []).filter(x => x.t !== 'match')); items.push(...pick(ex, 2));
    el.appendChild(mk(`<h1>⚡ Kiểm tra nhanh – ${TR[t].name}</h1><p class="mut">${items.length} câu ngẫu nhiên từ các bài bạn đã học. Không mở lại bài – đây là kiểm tra trí nhớ thật! Câu sai vào 📕 Sổ lỗi sai.</p>`, ''));
    el.appendChild(quiz(shuffle(items), {t, lang:TR[t].lang, src:`quick-${t}`, onDone:res => { P.tests.push({at:now(), t, kind:'⚡ Kiểm tra nhanh', scope:'đã học', pct:res.pct, n:res.total}); save();
      if(res.pct >= 80) coins(5, '⚡ Kiểm tra nhanh đạt (+5 💰)');
      el.appendChild(mk(`${res.pct >= 80 ? '🎉 Nhớ bài tốt lắm!' : '📕 Có câu quên rồi – các câu sai đã vào Sổ lỗi sai, ôn lại tối nay nhé.'} <button class="lcx-btn ok" data-x="close">🌍 Về chơi tiếp</button>`, 'lcx-card hot')); }}).el); };

  // ---- thẻ từ vựng lặp lại ngắt quãng ----
  const BOX = [0, 1, 3, 7, 14, 30, 60, 120];
  VIEWS.cards = async (r, el) => {
    const t = r.t, I = await IDX(); r.label = '🃏 Thẻ từ vựng'; const zh = t === 'zh', lang = TR[t].lang;
    const lv = I.tracks[t].levels.filter(L => L.file);
    const S = await scopeLessons(t, r.c || '');
    const seen = new Set(); const deck = []; for(const s of S) for(const w of wordsOf(s.L)){ if(!w.w || seen.has(w.w)) continue; seen.add(w.w); deck.push({...w, id:`${t}:${w.w}`, lv:s.D.level}); }
    const due = deck.filter(w => P.srs[w.id] && P.srs[w.id].d <= now()), fresh = deck.filter(w => !P.srs[w.id]);
    const today = dkey(), newLeft = Math.max(0, (P.set.newPerDay || 15) - (P.srsDay[today] || 0));
    el.innerHTML = `<h1>🃏 Thẻ từ vựng ${TR[t].name}</h1><p class="mut">Lặp lại ngắt quãng: nhớ tốt → thẻ quay lại sau 1, 3, 7, 14, 30, 60, 120 ngày; quên → học lại ngay. Mỗi ngày ôn hết thẻ đến hạn + ${P.set.newPerDay} thẻ mới là đủ.</p>
      <div class="lcx-card"><div class="lcx-row"><b>Bộ thẻ:</b><select data-c><option value="">Từ các bài tôi đã học/đã mở</option>${lv.map(L => `<option value="${L.code}"${r.c === L.code ? ' selected' : ''}>${esc(L.name)}</option>`).join('')}</select>
        <b>Kiểu:</b><select data-m><option value="fv">${zh ? 'Chữ Hán' : 'Tiếng Anh'} → nghĩa</option><option value="vf">Nghĩa → ${zh ? 'chữ Hán' : 'tiếng Anh'}</option><option value="ear">🎧 Nghe → nghĩa</option></select></div>
        <p>Tổng <b>${deck.length}</b> thẻ · đến hạn <b style="color:#ffb547">${due.length}</b> · mới <b>${fresh.length}</b> (hôm nay còn được học ${newLeft} thẻ mới)</p>
        <button class="lcx-btn pri" data-start>▶ Bắt đầu ôn (${due.length + Math.min(newLeft, fresh.length)} thẻ)</button></div><div class="fl"></div>`;
    el.querySelector('[data-c]').onchange = e => nav({v:'cards', t, c:e.target.value, label:'🃏 Thẻ từ vựng'}, true);
    el.querySelector('[data-start]').onclick = () => {
      const q = shuffle(due).concat(fresh.slice(0, newLeft)), mode = el.querySelector('[data-m]').value, fl = el.querySelector('.fl'); let i = 0, ok = 0;
      if(!q.length){ fl.innerHTML = '<div class="lcx-card">🎉 Hôm nay hết thẻ cần ôn. Quay lại ngày mai nhé!</div>'; return; }
      const show = () => { if(i >= q.length){ fl.innerHTML = `<div class="lcx-flash"><div class="f">🎉</div><p>Xong ${q.length} lượt thẻ · nhớ ${ok}. Hẹn ngày mai!</p></div>`; save(); return; }
        const w = q[i], front = mode === 'vf' ? `<div class="f" style="font-size:28px">${esc(w.vi)}</div>` : mode === 'ear' ? `<div class="f">🎧</div><button class="lcx-btn" data-act="say" data-t="${esc(w.w)}" data-l="${lang}">🔊 Nghe lại</button>` : `<div class="f ${zh ? 'zh' : ''}">${esc(w.w)}</div>`;
        fl.innerHTML = `<div class="lcx-flash"><small>Thẻ ${i + 1}/${q.length}${P.srs[w.id] ? '' : ' · <b>MỚI</b>'}</small>${front}<button class="lcx-btn blue" data-flip>👁 Lật thẻ (Space)</button><div class="bk" hidden></div></div>`;
        if(mode === 'ear') say(w.w, lang);
        const flip = () => { const bk = fl.querySelector('.bk'); if(!bk.hidden) return; bk.hidden = false; fl.querySelector('[data-flip]').remove(); say(w.w, lang);
          bk.innerHTML = `<div class="f ${zh ? 'zh' : ''}" style="font-size:${zh ? 54 : 32}px">${esc(w.w)}</div><div>${zh ? `<span class="py" style="font-size:20px">${esc(w.py || '')}</span>${w.hv ? ` · HV: ${esc(w.hv)}` : ''}` : `<span class="ipa">${esc(w.ipa || '')}</span>`} ${w.pos ? `<small>${esc(w.pos)}</small>` : ''}</div><div style="font-size:19px;margin:6px 0"><b>${esc(w.vi)}</b></div>${w.ex ? `<div class="${zh ? 'zh' : ''}">${esc(w.ex)} ${sayBtn(w.ex, lang)}</div>${w.exVi ? `<div class="lcx-sub">${esc(w.exVi)}</div>` : ''}` : ''}
            <div style="margin-top:12px">${[['0', '😵 Quên', 'pri'], ['1', '😐 Khó', ''], ['2', '🙂 Nhớ', 'ok'], ['3', '😎 Dễ', 'blue']].map(([g, n, cl]) => `<button class="lcx-btn ${cl}" data-g="${g}">${n}</button>`).join('')}</div>`;
          bk.querySelectorAll('[data-g]').forEach(b => b.onclick = () => grade(+b.dataset.g)); };
        fl.querySelector('[data-flip]').onclick = flip; fl._flip = flip; };
      const grade = g => { const w = q[i], s = P.srs[w.id] || {b:0, d:0, n:0};
        if(!P.srs[w.id]) P.srsDay[today] = (P.srsDay[today] || 0) + 1;
        s.n++; if(g === 0){ s.b = 0; s.d = now() + 10 * 60000; q.push(w); } else { s.b = g === 1 ? Math.max(1, s.b) : Math.min(BOX.length - 1, s.b + (g === 3 ? 2 : 1)); s.d = now() + BOX[s.b] * DAY * (g === 1 ? .6 : 1); ok++; }
        P.srs[w.id] = s; i++; save(); show(); };
      show(); };
    const kh = e => { if(root.hidden || !el.isConnected) return; const fl = el.querySelector('.fl'); if(!fl || !fl._flip) return; if(e.code === 'Space' && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){ e.preventDefault(); fl._flip(); } };
    root.addEventListener('keydown', kh); };

  // ---- hội thoại giao tiếp ----
  VIEWS.talks = async (r, el) => {
    const t = r.t, D = await EXTRA(t, 'talk'); r.label = '🎭 Hội thoại';
    const groups = {}; for(const x of D.talks) (groups[x.lv || 'khác'] = groups[x.lv || 'khác'] || []).push(x);
    el.innerHTML = `<h1>🎭 Hội thoại giao tiếp ${TR[t].name}</h1><p class="mut">Mỗi tình huống 5 bước: <b>① Nghe & trả lời</b> (lời thoại bị che – bắt buộc) → ② Học mẫu câu → ③ <b>Nhập vai</b>: máy đọc lời người kia, bạn nói lời của mình (ghi âm, nghe lại) → ④ Bài tập → ⑤ Tự nói tình huống biến thể.</p>
      ${Object.entries(groups).map(([lv, xs]) => `<h3>Cấp ${esc(lv.toUpperCase())}</h3><div class="lcx-grid">${xs.map(x => { const s = P.talks[x.id] || {}; return `<div class="lcx-tile" data-go="${go({v:'talk', t, n:x.no})}"><b>${x.no}. ${esc(x.title)}</b><div class="mut ${t === 'zh' ? 'zh' : ''}">${esc(x.sub || '')}</div><div>${s.L != null ? `<span class="lcx-badge ${s.L >= 80 ? 'green' : ''}">🎧 ${s.L}%</span>` : ''}${s.rp ? '<span class="lcx-badge blue">🎭 đã nhập vai</span>' : ''}</div></div>`; }).join('')}</div>`).join('')}`; };
  VIEWS.talk = async (r, el) => {
    const t = r.t, D = await EXTRA(t, 'talk'), T = D.talks.find(x => x.no === r.n); if(!T) throw new Error('Không thấy hội thoại'); r.label = `🎭 ${T.no}`;
    const zh = t === 'zh', lang = T.lang || TR[t].lang, st = P.talks[T.id] = P.talks[T.id] || {};
    el.appendChild(mk(`<h1>🎭 ${T.no}. ${esc(T.title)}</h1>${T.sub ? `<p class="mut ${zh ? 'zhb' : ''}">${esc(T.sub)}</p>` : ''}${T.situation ? `<p>🎬 <b>Tình huống:</b> ${esc(T.situation)}</p>` : ''}<span class="lcx-badge">Cấp ${esc(String(T.lv || '').toUpperCase())}</span>`));
    const s1 = mk('<h2>① Nghe & trả lời (lời thoại đang che)</h2><p class="mut">Nghe cả bài (có thể nghe nhiều lần), trả lời câu hỏi. Nộp bài xong mới hiện lời thoại & bản dịch, mở khoá nhập vai.</p>'); el.appendChild(s1);
    const dl = dialogEl({...T, h:'', note:''}, t, {hide:true, lockText:!st.L && st.L !== 0, title:false, onRoleplay:() => { if(!st.rp){ st.rp = 1; coins(5, '🎭 Hoàn thành nhập vai (+5 💰)'); } else st.rp++; save(); }});
    s1.appendChild(dl);
    if((T.qs || []).length) s1.appendChild(quiz(T.qs, {t, lang, src:T.id, submitText:'✅ Chấm bài nghe', onDone:res => { st.L = Math.max(st.L || 0, res.pct); save(); dl.unlock(); }}).el); else dl.unlock();
    if((T.phrases || []).length) el.appendChild(mk(`<h2>② Mẫu câu then chốt</h2>${T.phrases.map(p => `<div class="lcx-q"><span class="${zh ? 'zhb' : ''}"><b>${esc(p.t)}</b></span> ${sayBtn(p.t.replace(/\(.*?\)/g, ''), lang)}${p.py ? `<div class="lcx-sub py">${esc(p.py)}</div>` : ''}<div>${esc(p.vi)}</div>${p.note ? `<div class="lcx-sub">💡 ${clean(p.note)}</div>` : ''}</div>`).join('')}`));
    el.appendChild(mk('<h2>③ Nhập vai</h2><p>Kéo lên phần ①, chọn vai ở ô <b>🎭 Nhập vai</b> rồi bấm <b>Bắt đầu</b>: máy đọc lời người kia, tới lượt bạn câu được tô xanh – nói to (bấm 🎙️ để ghi âm, nghe lại so với giọng mẫu), bấm <b>Tiếp ▶</b>. Luyện cả hai vai đến khi không cần nhìn chữ.</p>'));
    if((T.exercises || []).length){ const c4 = mk('<h2>④ Bài tập</h2>'); c4.appendChild(quiz(T.exercises, {t, lang, src:T.id + ':ex'}).el); el.appendChild(c4); }
    if((T.practice || []).length) el.appendChild(speakEl({h:'⑤ Tự nói – tình huống biến thể', tasks:T.practice}, t)); };

  // ---- đề thi thử ----
  VIEWS.mocks = async (r, el) => {
    const t = r.t, D = await EXTRA(t, 'mock'); r.label = '📝 Thi thử';
    el.innerHTML = `<h1>📝 Đề thi thử ${t === 'en' ? 'IELTS Academic' : 'HSK'} tự soạn</h1><p class="mut">Đề do Trung tâm tự biên soạn, mô phỏng đúng cấu trúc và độ khó – <b>không phải đề thật</b> (đề thật có bản quyền). Muốn làm thêm đề mẫu chính thức: Sảnh › 🔗 Đề mẫu chính thức miễn phí.</p>
      <div class="lcx-grid">${D.tests.map(x => { const m = P.mocks[x.id]; return `<div class="lcx-tile" data-go="${go({v:'mock', t, id:x.id})}"><b>${esc(x.title || x.id)}</b><div class="mut">${x.time ? `⏱ ${x.time} phút · ` : ''}${(x.sections || []).reduce((a, s) => a + (s.items || []).length, 0)} câu tự chấm</div>${m ? `<span class="lcx-badge green">Lần gần nhất: ${m.overall != null ? 'band ' + m.overall : m.pct + '%'} · ${fmtD(m.at)}</span>` : ''}</div>`; }).join('')}</div>`; };
  VIEWS.mock = async (r, el) => {
    const t = r.t, D = await EXTRA(t, 'mock'), X = D.tests.find(x => x.id === r.id); if(!X) throw new Error('Không thấy đề'); r.label = '📝 ' + (X.kind === 'ielts' ? 'IELTS' : 'HSK');
    el.appendChild(examRunner(X, t, {kind:X.kind === 'ielts' ? 'ielts' : 'hsk', onResult:res => { P.mocks[X.id] = {at:now(), pct:res.pct, L:res.L, R:res.R, W:res.W, S:res.S, overall:X.kind === 'ielts' ? ieltsAvg([res.L, res.R, res.W, res.S]) : null, scores:res.scores};
      if(!coinDone[X.id] && res.pct >= 40){ coinDone[X.id] = 1; P.mockCoin = P.mockCoin || {}; if(!P.mockCoin[X.id]){ P.mockCoin[X.id] = 1; coins(50, '📝 Hoàn thành đề thi thử (+50 💰)'); } } save(); }})); };
  const coinDone = {};

  // ---- sổ tay chuyên đề ----
  VIEWS.guide = async (r, el) => {
    const t = r.t, D = await EXTRA(t, 'guide'); r.label = '📖 Sổ tay';
    const g = {teacher:[], ref:[]}; for(const a of D.articles) (String(a.for || '').includes('teacher') ? g.teacher : g.ref).push(a);
    el.innerHTML = `<h1>📖 Sổ tay chuyên đề ${TR[t].name}</h1><p class="mut">Kiến thức chuyên sâu để tự học như chuyên gia và để <b>dạy lại cho người khác</b>.</p>
      ${[['👩‍🏫 Phương pháp giảng dạy', g.teacher], ['📚 Tra cứu chuyên sâu', g.ref]].map(([h, xs]) => xs.length ? `<h2>${h}</h2><div class="lcx-grid">${xs.map(a => `<div class="lcx-tile" data-go="${go({v:'article', t, n:a.no})}"><b>${a.no}. ${esc(a.title)}</b><div class="mut">${esc(a.sub || '')}</div>${P.guide[a.id] ? '<span class="lcx-badge green">✓ đã đọc</span>' : ''}</div>`).join('')}</div>` : '').join('')}`; };
  VIEWS.article = async (r, el) => {
    const t = r.t, D = await EXTRA(t, 'guide'), A = D.articles.find(x => x.no === r.n); if(!A) throw new Error('Không thấy chuyên đề'); r.label = `📖 ${A.no}`;
    P.guide[A.id] = now(); save();
    el.appendChild(mk(`<h1>${A.no}. ${esc(A.title)}</h1>${A.sub ? `<p class="mut">${esc(A.sub)}</p>` : ''}`, ''));
    for(const p of A.parts || []) el.appendChild(partEl(p, t, {id:A.id}));
    if((A.exercises || []).length){ const c = mk('<h2>📝 Tự kiểm tra</h2>'); c.appendChild(quiz(A.exercises, {t, lang:TR[t].lang, src:A.id}).el); el.appendChild(c); }
    if(A.teacher) el.appendChild(teacherEl(A.teacher)); };

  // ---- sổ lỗi sai ----
  VIEWS.wrong = async (r, el) => {
    const t = r.t; r.label = '📕 Sổ lỗi sai';
    const ent = Object.entries(P.wrong).filter(([, w]) => w.t === t).sort((a, b) => b[1].at - a[1].at);
    el.innerHTML = `<h1>📕 Sổ lỗi sai ${TR[t].name}</h1><p class="mut">Mọi câu bạn làm sai (bài tập, kiểm tra, ôn tập, thi) được lưu ở đây. Làm lại – đúng <b>2 lần liên tiếp</b> thì câu tự rời sổ.</p><p>Đang có <b>${ent.length}</b> câu.</p>${ent.length ? '<button class="lcx-btn pri" data-k>▶ Làm lại 20 câu</button>' : ''}<div class="run"></div>`;
    const b = el.querySelector('[data-k]'); if(b) b.onclick = () => { const sel = ent.slice(0, 20), run = el.querySelector('.run'); run.innerHTML = '';
      const q = quiz(sel.map(([, w]) => w.x), {t, lang:TR[t].lang, onDone:res => { const bad = new Set(res.wrong.map(w => w.i)); sel.forEach(([k, w], i) => { if(bad.has(i)){ w.ok = 0; w.at = now(); } else { w.ok = (w.ok || 0) + 1; if(w.ok >= 2) delete P.wrong[k]; } }); save(); }});
      run.appendChild(q.el); b.remove(); }; };

  // ---- chứng chỉ ----
  VIEWS.certs = async (r, el) => {
    r.label = '🏅 Chứng chỉ'; const ks = Object.keys(P.certs);
    el.innerHTML = `<h1>🏅 Chứng chỉ của tôi</h1>${ks.length ? '' : '<p>Chưa có – đạt bài thi cuối cấp (≥ 70%) để nhận chứng chỉ đầu tiên.</p>'}<div class="cv"></div>`;
    const box = el.querySelector('.cv');
    for(const k of ks){ const c = P.certs[k], cv = document.createElement('canvas'); cv.width = 1000; cv.height = 680; cv.style.cssText = 'width:100%;max-width:760px;display:block;margin:12px auto;border-radius:10px'; drawCert(cv, c);
      const a = document.createElement('div'); a.style.textAlign = 'center'; a.innerHTML = '<button class="lcx-btn">💾 Tải ảnh chứng chỉ</button>'; a.firstChild.onclick = () => { const l = document.createElement('a'); l.download = `chung-chi-${k}.png`; l.href = cv.toDataURL('image/png'); l.click(); };
      box.appendChild(cv); box.appendChild(a); } };
  function drawCert(cv, c){ const g = cv.getContext('2d'), Wd = cv.width, Ht = cv.height;
    const gr = g.createLinearGradient(0, 0, Wd, Ht); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(1, '#f3e7c9'); g.fillStyle = gr; g.fillRect(0, 0, Wd, Ht);
    g.strokeStyle = '#b8860b'; g.lineWidth = 10; g.strokeRect(22, 22, Wd - 44, Ht - 44); g.lineWidth = 2; g.strokeRect(40, 40, Wd - 80, Ht - 80);
    g.textAlign = 'center'; g.fillStyle = '#7a5a00'; g.font = 'bold 26px Segoe UI'; g.fillText('TRUNG TÂM NGOẠI NGỮ QC · QC WORLD', Wd / 2, 105);
    g.fillStyle = '#1b2b4a'; g.font = 'bold 54px Georgia, serif'; g.fillText('CHỨNG NHẬN', Wd / 2, 185); g.font = 'italic 22px Georgia, serif'; g.fillStyle = '#444'; g.fillText('Certificate of Achievement · 结业证书', Wd / 2, 222);
    g.font = '24px Segoe UI'; g.fillText('Chứng nhận học viên', Wd / 2, 290); g.fillStyle = '#9b1c1c'; g.font = 'bold 50px Georgia, serif'; g.fillText(c.name || 'Học viên', Wd / 2, 355);
    g.fillStyle = '#333'; g.font = '24px Segoe UI'; g.fillText(`đã hoàn thành và vượt qua bài thi cuối cấp`, Wd / 2, 410); g.font = 'bold 32px Segoe UI'; g.fillStyle = '#1b2b4a'; g.fillText(`${TR[c.t] ? TR[c.t].name : ''} · ${c.title}`, Wd / 2, 460);
    g.font = '22px Segoe UI'; g.fillStyle = '#333'; g.fillText(`Điểm: ${c.score}%  ·  Ngày: ${fmtD(c.at)}`, Wd / 2, 510);
    g.beginPath(); g.arc(Wd - 170, Ht - 150, 62, 0, 7); g.fillStyle = '#c62f2f'; g.fill(); g.fillStyle = '#ffe08a'; g.font = 'bold 22px Segoe UI'; g.fillText('QC WORLD', Wd - 170, Ht - 155); g.font = '15px Segoe UI'; g.fillText('LANGUAGE CENTER', Wd - 170, Ht - 132);
    g.fillStyle = '#555'; g.font = '16px Segoe UI'; g.textAlign = 'left'; g.fillText('Chứng nhận nội bộ trong game – ghi nhận nỗ lực học tập, không thay thế chứng chỉ IELTS/HSK chính thức.', 70, Ht - 70); }

  // ---- liên kết chính thức ----
  VIEWS.links = async (r, el) => {
    r.label = '🔗 Tài liệu chính thức';
    const L = [['en', 'IELTS – trang chính thức (thông tin kỳ thi, tài liệu chuẩn bị)', 'https://ielts.org/'],
      ['en', 'British Council – luyện thi IELTS miễn phí (đề mẫu, bài luyện)', 'https://takeielts.britishcouncil.org/take-ielts/prepare'],
      ['en', 'IDP IELTS – chuẩn bị thi (bài mẫu, mẹo)', 'https://ielts.idp.com/prepare'],
      ['en', 'Cambridge English – học tiếng Anh miễn phí', 'https://www.cambridgeenglish.org/learning-english/'],
      ['en', 'BBC Learning English – bài học, phát âm, tin tức chậm', 'https://www.bbc.co.uk/learningenglish'],
      ['zh', 'Chinese Testing International – trang chính thức HSK/HSKK (đề mẫu, quy chế)', 'https://www.chinesetest.cn/']];
    el.innerHTML = `<h1>🔗 Đề mẫu & tài liệu chính thức miễn phí</h1><p class="mut">Các trang này mở ở <b>trình duyệt</b> (cần Internet) – Trung tâm không sao chép đề thật vì có bản quyền. Hãy dùng đề mẫu chính thức để đối chiếu sau khi làm hết đề tự soạn.</p>
      ${L.map(([t, n, u]) => `<div class="lcx-q">${flag(t)} <b>${esc(n)}</b><br><small class="mut">${esc(u)}</small> <button class="lcx-btn sm" data-u="${esc(u)}">↗ Mở</button></div>`).join('')}`;
    el.querySelectorAll('[data-u]').forEach(b => b.onclick = () => window.open(b.dataset.u, '_blank', 'noopener')); };

  // ---- cài đặt ----
  VIEWS.settings = async (r, el) => {
    r.label = '⚙️ Cài đặt'; loadV();
    const vopt = (lang, cur) => { const vs = voicesFor(lang, true); return `<option value="">Tự chọn</option>${vs.map(v => `<option value="${esc(v.name)}"${v.name === cur ? ' selected' : ''}>${esc(v.name)} (${esc(v.lang)})${v.localService === false ? ' – online' : ''}</option>`).join('')}`; };
    el.innerHTML = `<h1>⚙️ Cài đặt</h1>
      <div class="lcx-card"><h3>🔊 Giọng đọc</h3>
        <p>Giọng tiếng Anh: <select data-s="voiceEn">${vopt('en-GB', P.set.voiceEn)}</select> <button class="lcx-btn sm" data-test="en-GB">▶ Thử</button></p>
        <p>Giọng tiếng Trung: <select data-s="voiceZh">${vopt('zh-CN', P.set.voiceZh)}</select> <button class="lcx-btn sm" data-test="zh-CN">▶ Thử</button></p>
        <p>Tốc độ đọc: <input type="range" min="0.5" max="1.3" step="0.05" value="${P.set.rate}" data-s="rate"> <b class="rv">${P.set.rate}</b>× <small>(người mới: 0,7–0,8)</small></p>
        <label><input type="checkbox" data-s="online" ${P.set.online ? 'checked' : ''}> Cho phép giọng <b>online</b> (giọng tự nhiên của Edge – câu bài học được gửi tới dịch vụ đọc của trình duyệt, cần Internet). Mặc định tắt: chỉ dùng giọng cài trên máy.</label></div>
      <div class="lcx-card"><h3>📚 Học tập</h3>
        <label><input type="checkbox" data-s="force" ${P.set.force ? 'checked' : ''}> <b>Bắt buộc</b> làm bài kiểm tra lại đến hạn trước khi học bài mới (khuyên bật)</label><br>
        <label><input type="checkbox" data-s="teacher" ${P.set.teacher ? 'checked' : ''}> 👩‍🏫 Chế độ giáo viên (hiện giáo án + đáp án, mở mọi bài)</label><br>
        <label><input type="checkbox" data-s="showPy" ${P.set.showPy ? 'checked' : ''}> Hiện pinyin dưới câu tiếng Trung</label><br>
        <label><input type="checkbox" data-s="pop" ${P.set.pop ? 'checked' : ''}> ⚡ Thỉnh thoảng hỏi <b>kiểm tra nhanh</b> khi đang chơi ngoài thế giới (~25 phút/lần, 6 câu từ bài đã học)</label><br>
        Thẻ từ mới mỗi ngày: <input type="number" min="5" max="60" value="${P.set.newPerDay}" data-s="newPerDay" style="width:70px"></div>
      <div class="lcx-card"><h3>💾 Tiến độ học</h3><p class="mut">Lưu trong trình duyệt của máy này. Sao lưu ra file để chuyển máy hoặc để giáo viên xem tiến độ.</p>
        <button class="lcx-btn" data-k="exp">💾 Xuất tiến độ (.json)</button><label class="lcx-btn">📂 Nhập tiến độ<input type="file" accept=".json" hidden data-k="imp"></label><button class="lcx-btn pri" data-k="reset">🗑️ Xoá toàn bộ tiến độ</button></div>`;
    el.querySelectorAll('[data-s]').forEach(i => i.onchange = i.oninput = () => { const k = i.dataset.s; P.set[k] = i.type === 'checkbox' ? i.checked : i.type === 'range' || i.type === 'number' ? +i.value : i.value; if(k === 'rate') el.querySelector('.rv').textContent = i.value; if(k === 'teacher') paintTeach(); save(); });
    el.querySelectorAll('[data-test]').forEach(b => b.onclick = () => { hush(); say(b.dataset.test.startsWith('zh') ? '你好！欢迎来到语言中心。' : 'Hello! Welcome to the language centre.', b.dataset.test); });
    el.querySelector('[data-k=exp]').onclick = () => { const a = document.createElement('a'); a.download = `qcworld-ngoai-ngu-${dkey()}.json`; a.href = URL.createObjectURL(new Blob([JSON.stringify(P, null, 1)], {type:'application/json'})); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); };
    el.querySelector('[data-k=imp]').onchange = e => { const f = e.target.files[0]; if(!f) return; f.text().then(s => { const o = JSON.parse(s); if(!o || typeof o !== 'object' || !o.v) throw new Error('File không đúng định dạng'); if(!confirm('Thay tiến độ hiện tại bằng file này?')) return; P = Object.assign(defP(), o); P.set = Object.assign(defSet(), o.set || {}); save(); note('Đã nhập tiến độ.'); render(); }).catch(err => note('Không đọc được file: ' + err.message)); };
    el.querySelector('[data-k=reset]').onclick = () => { if(!confirm('Xoá TOÀN BỘ tiến độ học (bài đã học, điểm, thẻ từ, chứng chỉ)? Không hoàn tác được.')) return; const s = P.set; P = defP(); P.set = s; save(); note('Đã xoá tiến độ.'); render(); }; };

  // ---- hướng dẫn ----
  VIEWS.help = async (r, el) => {
    r.label = '🧭 Hướng dẫn'; let I = null; try{ I = await IDX(); }catch(e){}
    const tbl = t => I ? `<table><tr><th>Cấp</th><th>Tương đương</th><th>Giờ học tích luỹ</th><th>Số bài</th><th>Nội dung</th></tr>${I.tracks[t].levels.map(L => `<tr><td><b>${esc(L.name)}</b></td><td>${esc(L.eq)}</td><td>~${L.hours} h</td><td>${(L.lessons || []).length || '…'}</td><td>${esc(L.desc)}</td></tr>`).join('')}</table>` : '';
    el.innerHTML = `<h1>🧭 Hướng dẫn học & lộ trình</h1>
      <div class="lcx-card"><h3>Cách học để “học dở mà chăm vẫn giỏi”</h3><ol>
        <li><b>Mỗi ngày 45–60 phút</b>, đều đặn hơn là dồn: 15' ôn thẻ từ + kiểm tra đến hạn, 30' học bài mới, 10' nghe/nói (nhập vai, shadowing).</li>
        <li><b>Học theo thứ tự bài</b>: phát âm → từ vựng → ngữ pháp → nghe (che chữ trước!) → đọc → nói (ghi âm) → viết → bài tập. Bài tập ≥ 60% mới tính hoàn thành.</li>
        <li><b>Không bỏ kiểm tra lại</b>: hệ thống tự hẹn sau 1, 3, 7, 14, 30, 60 ngày – chính lúc sắp quên. Đây là lý do người chăm luôn thắng người giỏi mà lười.</li>
        <li><b>Nói to & ghi âm</b>: nghe lại giọng mình so với giọng mẫu, sửa âm cuối, trọng âm (tiếng Anh) / thanh điệu (tiếng Trung).</li>
        <li><b>Sổ lỗi sai</b>: làm lại tới khi đúng 2 lần liền. Lỗi lặp lại = lỗ hổng cần mở lại bài.</li>
        <li><b>Thi cuối cấp ≥ 70%</b> mới lên cấp. Cuối lộ trình làm đề thi thử, rồi đối chiếu đề mẫu chính thức.</li></ol></div>
      <div class="lcx-card"><h3>${flag('en')}Lộ trình Tiếng Anh</h3>${tbl('en')}</div>
      <div class="lcx-card"><h3>${flag('zh')}Lộ trình Tiếng Trung</h3>${tbl('zh')}<p class="mut">HSK 2.0 có 6 cấp; HSK 3.0 (chuẩn mới) có 9 cấp chia 3 bậc – cấp 7–9 là cao cấp, tương đương mục tiêu IELTS 8.0 bên tiếng Anh.</p></div>
      <div class="lcx-card teach"><h3>👩‍🏫 Dùng để dạy miễn phí cho người khác</h3><ul>
        <li>Bật <b>👩‍🏫 Giáo viên</b> (thanh trên cùng): mỗi bài hiện <b>giáo án 2 buổi × 90 phút</b> (các bước có phút, trò chơi lớp, lỗi hay gặp, bài về nhà) + đáp án mọi câu.</li>
        <li>Trong mỗi cấp: <b>🖨️ In giáo trình</b> (Ctrl+P → lưu PDF) hoặc <b>💾 Tải giáo trình</b> – gồm bài giảng, lời thoại, bản dịch, bài tập + đáp án, giáo án, bài thi + đáp án.</li>
        <li>📖 <b>Sổ tay chuyên đề</b>: phương pháp dạy, bảng tra cứu chuyên sâu (IPA, 12 thì, bộ thủ, Hán Việt ↔ pinyin, lỗi người Việt…).</li>
        <li>Học viên học trong game ở nhà: giao bài tập tự chấm, xem tiến độ qua file <b>Xuất tiến độ</b> (⚙️ Cài đặt).</li></ul></div>
      <div class="lcx-card"><h3>©️ Bản quyền</h3><p>Toàn bộ bài học, hội thoại, bài đọc, đề thi trong Trung tâm là <b>tự biên soạn</b>, mô phỏng cấu trúc IELTS/HSK nhưng không sao chép đề thật hay giáo trình đã xuất bản. Đề mẫu chính thức: mục 🔗 ở Sảnh (mở trang chính thức trên trình duyệt).</p></div>`; };

  /* ============================== IN / TẢI GIÁO TRÌNH (cho giáo viên) ============================== */
  async function printLevel(t, c, download){
    const D = await LV(t, c), meta = await levelMeta(t, c), zh = t === 'zh';
    const Z = s => zh ? `<span class="zh">${esc(s)}</span>` : esc(s);
    const exKey = (xs) => `<ol>${xs.map(x => `<li>${x.t === 'listen' || x.t === 'dict' ? `🔊 <i>${Z(x.say)}</i> – ` : ''}${esc(x.q || (x.t === 'order' ? 'Sắp xếp: ' + (x.w || []).join(' / ') : x.t === 'match' ? 'Nối cặp' : ''))}${(x.o || []).length ? `<br>${x.o.map((o, j) => `${String.fromCharCode(65 + j)}. ${Z(o)}`).join(' &nbsp; ')}` : ''}<br><b>→ Đáp án:</b> ${Z(keyOf(x))}${x.e ? ` <small>· ${clean(x.e)}</small>` : ''}</li>`).join('')}</ol>`;
    const part = p => {
      if(p.k === 'words') return `<h3>${esc(p.h || 'Từ vựng')}</h3><table><tr><th>Từ</th><th>${zh ? 'Pinyin · Hán Việt' : 'IPA'}</th><th>Nghĩa</th><th>Ví dụ</th></tr>${(p.items || []).map(w => `<tr><td><b>${Z(w.w)}</b> <small>${esc(w.pos || '')}</small></td><td>${zh ? `${esc(w.py || '')}${w.hv ? ' · ' + esc(w.hv) : ''}` : esc(w.ipa || '')}</td><td>${esc(w.vi)}</td><td>${Z(w.ex || '')}${w.exPy ? `<br><small>${esc(w.exPy)}</small>` : ''}${w.exVi ? `<br><small>${esc(w.exVi)}</small>` : ''}</td></tr>`).join('')}</table>`;
      if(p.k === 'sounds') return `<h3>${esc(p.h || 'Phát âm')}</h3>${p.html ? clean(p.html) : ''}<table>${(p.items || []).map(s => `<tr><td><b>${esc(s.sym)}</b></td><td>${Z((s.ex || []).join(', '))}</td><td>${clean(s.vi)}${(s.pairs || []).length ? `<br><small>Cặp: ${s.pairs.map(x => x.join(' – ')).join('; ')}</small>` : ''}</td></tr>`).join('')}</table>`;
      if(p.k === 'grammar') return `<h3>${esc(p.h)}</h3>${clean(p.html)}${(p.table || []).length ? `<table>${p.table.map((r, i) => `<tr>${r.map(c => i ? `<td>${clean(c)}</td>` : `<th>${clean(c)}</th>`).join('')}</tr>`).join('')}</table>` : ''}${(p.ex || []).map(e => `<p>• ${Z(e.t)}${e.py ? ` <small>${esc(e.py)}</small>` : ''} – <i>${esc(e.vi || '')}</i></p>`).join('')}${(p.tips || []).map(x => `<p class="tip">⚠️ ${clean(x)}</p>`).join('')}`;
      if(p.k === 'text') return `<h3>${esc(p.h || '')}</h3>${clean(p.html)}`;
      if(p.k === 'dialog') return `<h3>${esc(p.h || 'Hội thoại')}</h3>${p.note ? `<p><i>${esc(p.note)}</i></p>` : ''}<table>${(p.lines || []).map(l => `<tr><td><b>${esc(l.s)}</b></td><td>${Z(l.t)}${l.py ? `<br><small>${esc(l.py)}</small>` : ''}</td><td><small>${esc(l.vi || '')}</small></td></tr>`).join('')}</table>${(p.qs || []).length ? '<p><b>Câu hỏi nghe hiểu:</b></p>' + exKey(p.qs) : ''}`;
      if(p.k === 'read') return `<h3>${esc(p.h || 'Đọc hiểu')}${p.title ? ': ' + Z(p.title) : ''}</h3>${String(p.text || '').split(/\n+/).map(x => `<p>${Z(x)}</p>`).join('')}${p.py ? `<p><small>${esc(p.py)}</small></p>` : ''}${p.vi ? `<p><i>Dịch:</i> ${esc(p.vi)}</p>` : ''}${(p.qs || []).length ? exKey(p.qs) : ''}`;
      if(p.k === 'speak') return `<h3>${esc(p.h || 'Nói')}</h3><ol>${(p.tasks || []).map(k => `<li>${esc(k.p)}<br><i>Mẫu:</i> ${Z(k.model || '')}${k.py ? `<br><small>${esc(k.py)}</small>` : ''}</li>`).join('')}</ol>`;
      if(p.k === 'write') return `<h3>${esc(p.h || 'Viết')}</h3><p><b>Đề:</b> ${esc(p.task)}</p><p><b>Bài mẫu:</b><br>${Z(p.model).replace(/\n/g, '<br>')}</p>${(p.checklist || []).length ? `<p>Checklist: ${p.checklist.map(esc).join(' · ')}</p>` : ''}`;
      if(p.k === 'chars') return `<h3>${esc(p.h || 'Chữ Hán')}</h3><table>${(p.items || []).map(c => `<tr><td style="font-size:30px" class="zh">${esc(c.c)}</td><td>${esc(c.py)} · ${esc(c.hv || '')} · ${esc(c.strokes || '')} nét</td><td>${esc(c.parts || '')}<br>${esc(c.vi || '')}</td><td class="zh">${esc(c.words || '')}</td></tr>`).join('')}</table>`;
      return ''; };
    const T = x => !x ? '' : `<div class="teach"><h3>👩‍🏫 Giáo án</h3><p><b>${esc(x.time || '')}</b> · ${esc(x.prep || '')}</p><table>${(x.steps || []).map(s => `<tr><td>${esc(s.t)}</td><td>${clean(s.do)}</td></tr>`).join('')}</table>${(x.games || []).length ? `<p><b>Trò chơi:</b></p><ul>${x.games.map(g => `<li>${clean(g)}</li>`).join('')}</ul>` : ''}${(x.errors || []).length ? `<p><b>Lỗi hay gặp:</b></p><ul>${x.errors.map(g => `<li>${clean(g)}</li>`).join('')}</ul>` : ''}${x.homework ? `<p><b>Bài về nhà:</b> ${clean(x.homework)}</p>` : ''}</div>`;
    let h = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(TR[t].name)} – ${esc(meta.name)} – Giáo trình QC World</title><style>
      body{font:14px/1.55 "Segoe UI",Arial,sans-serif;color:#111;max-width:900px;margin:24px auto;padding:0 18px}h1{font-size:26px}h2{font-size:21px;border-bottom:2px solid #1f4fa8;padding-bottom:4px;margin-top:34px;page-break-before:always}h3{font-size:16px;color:#1f4fa8;margin:16px 0 6px}
      table{border-collapse:collapse;width:100%;margin:6px 0}td,th{border:1px solid #ccc;padding:4px 7px;vertical-align:top;text-align:left}th{background:#eef2fa}.zh{font-family:"Microsoft YaHei","SimSun",sans-serif;font-size:1.15em}
      .teach{border:2px dashed #b8860b;background:#fffaf0;padding:8px 12px;margin:12px 0}.tip{background:#fff6e5;padding:4px 8px}.hl{background:#fff2a8}small{color:#555}.cover{text-align:center;margin:80px 0}</style></head><body>
      <div class="cover"><h1>TRUNG TÂM NGOẠI NGỮ QC · QC WORLD</h1><h1>${esc(TR[t].name)} – ${esc(meta.name)}</h1><p>${esc(meta.eq)} · ${D.lessons.length} bài · ~${meta.hours} giờ tích luỹ</p><p>${esc(meta.desc)}</p><p><small>Giáo trình tự biên soạn – dùng để dạy miễn phí. In ngày ${fmtD(now())}.</small></p>
      <h3>Mục lục</h3><ol style="text-align:left;display:inline-block">${D.lessons.map(L => `<li>${esc(L.title)}</li>`).join('')}${D.exam ? '<li>Bài thi cuối cấp</li>' : ''}</ol></div>`;
    for(const L of D.lessons){ h += `<h2>Bài ${L.no}: ${esc(L.title)}</h2>${L.sub ? `<p><i>${Z(L.sub)}</i></p>` : ''}${(L.goals || []).length ? `<p><b>Mục tiêu:</b></p><ul>${L.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}${T(L.teacher)}`;
      for(const p of L.parts || []) h += part(p); h += `<h3>📝 Bài tập + đáp án</h3>${exKey(L.exercises || [])}`; }
    if(D.exam){ h += `<h2>📝 ${esc(D.exam.title || 'Bài thi cuối cấp')}</h2>${D.exam.intro ? `<p>${clean(D.exam.intro)}</p>` : ''}`;
      for(const s of D.exam.sections || []){ h += `<h3>${esc(s.h || '')}</h3>${s.intro ? `<p>${esc(s.intro)}</p>` : ''}`; if(s.dialog) h += part({k:'dialog', h:'Lời thoại bài nghe', ...s.dialog}); if(s.read) h += part({k:'read', h:'Bài đọc', ...s.read}); if((s.items || []).length) h += exKey(s.items); if(s.write) h += part({k:'write', h:'Viết', ...s.write}); if(s.speak) h += part({k:'speak', h:'Nói', tasks:s.speak.tasks || []}); } }
    h += '</body></html>';
    const url = URL.createObjectURL(new Blob([h], {type:'text/html'}));
    if(download){ const a = document.createElement('a'); a.download = `giao-trinh-${t}-${c}.html`; a.href = url; a.click(); note('💾 Đã tải giáo trình – mở file bằng trình duyệt, Ctrl+P để in/lưu PDF.'); }
    else { const w = window.open(url, '_blank'); if(!w){ const a = document.createElement('a'); a.download = `giao-trinh-${t}-${c}.html`; a.href = url; a.click(); note('Trình duyệt chặn cửa sổ mới – đã tải file giáo trình thay thế.'); } else note('🖨️ Đã mở giáo trình ở tab mới – bấm Ctrl+P để in hoặc lưu PDF.'); }
    setTimeout(() => URL.revokeObjectURL(url), 120000); }

  /* ============================== API ============================== */
  return {
    open, close, get isOpen(){ return !root.hidden; }, onClose(f){ onCloseCb = f; },
    dueCount: t => dueList(t).length,
    hush,
  };
}


