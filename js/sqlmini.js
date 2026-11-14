// QC World – SQL mini chạy trong trình duyệt (để chấm bài SQL ở Trung tâm Việc làm). Không cần cài thư viện, không kết nối DB thật.
// Hỗ trợ: SELECT [DISTINCT] … FROM t [alias] [[INNER|LEFT] JOIN t2 [alias] ON …]* [WHERE …] [GROUP BY …] [HAVING …] [ORDER BY … [ASC|DESC]] [LIMIT n [OFFSET m]]
// Biểu thức: AND/OR/NOT, = <> != < <= > >=, LIKE, IN (…), BETWEEN, IS [NOT] NULL, + - * /, ||, CASE WHEN … THEN … ELSE … END,
// hàm: COUNT(*|[DISTINCT] x), SUM, AVG, MIN, MAX, UPPER, LOWER, LENGTH, ROUND, ABS, COALESCE, IFNULL, SUBSTR, TRIM, DATE.
// Chưa hỗ trợ truy vấn con (subquery) và UNION.
const KW=new Set(['select','distinct','from','where','group','by','having','order','asc','desc','limit','offset','join','inner','left','outer','on','as','and','or','not','in','between','like','is','null','case','when','then','else','end','true','false']);
const AGG=new Set(['count','sum','avg','min','max']);
const SUBQ='Chưa hỗ trợ truy vấn con (subquery) – hãy dùng JOIN, hoặc LEFT JOIN … WHERE … IS NULL';

function tokenize(s){
  const t=[]; let i=0;
  while(i<s.length){ const c=s[i];
    if(/\s/.test(c)){ i++; continue; }
    if(c==='-' && s[i+1]==='-'){ while(i<s.length && s[i]!=='\n') i++; continue; }
    if(c==="'"){ let j=i+1, v=''; while(j<s.length){ if(s[j]==="'"){ if(s[j+1]==="'"){ v+="'"; j+=2; continue; } break; } v+=s[j++]; } if(j>=s.length) throw new Error('Thiếu dấu nháy đơn đóng chuỗi'); t.push({t:'str', v}); i=j+1; continue; }
    if(/[0-9]/.test(c) || (c==='.' && /[0-9]/.test(s[i+1]))){ let j=i; while(j<s.length && /[0-9.]/.test(s[j])) j++; t.push({t:'num', v:parseFloat(s.slice(i,j))}); i=j; continue; }
    if(/[A-Za-z_\u00C0-\u1EF9]/.test(c)){ let j=i; while(j<s.length && /[A-Za-z0-9_\u00C0-\u1EF9]/.test(s[j])) j++; const w=s.slice(i,j), lw=w.toLowerCase(); t.push(KW.has(lw)?{t:'kw', v:lw}:{t:'id', v:lw}); i=j; continue; }
    if(c==='"' || c==='`'){ const q=c; let j=i+1; while(j<s.length && s[j]!==q) j++; t.push({t:'id', v:s.slice(i+1,j).toLowerCase()}); i=j+1; continue; }
    const two=s.slice(i,i+2); if(['<=','>=','<>','!=','||'].includes(two)){ t.push({t:'op', v:two}); i+=2; continue; }
    if('=<>+-*/(),.;%'.includes(c)){ t.push({t:'op', v:c}); i++; continue; }
    throw new Error(`Ký tự không hợp lệ: ${c}`);
  }
  return t;
}

function parse(sql){
  const T=tokenize(sql); let p=0;
  const peek=(k=0)=>T[p+k], next=()=>T[p++];
  const isKw=(v,k=0)=>peek(k)&&peek(k).t==='kw'&&peek(k).v===v, isOp=(v,k=0)=>peek(k)&&peek(k).t==='op'&&peek(k).v===v;
  const eatKw=v=>{ if(!isKw(v)) throw new Error(`Thiếu từ khoá ${v.toUpperCase()} (gần "${peek()?peek().v:'cuối câu'}")`); p++; };
  const eatOp=v=>{ if(!isOp(v)) throw new Error(`Thiếu "${v}" (gần "${peek()?peek().v:'cuối câu'}")`); p++; };
  const ident=()=>{ const x=next(); if(!x||x.t!=='id') throw new Error(`Cần tên bảng/cột (gần "${x?x.v:'cuối câu'}")`); return x.v; };
  // biểu thức
  function expr(){ return orE(); }
  function orE(){ let l=andE(); while(isKw('or')){ p++; l={k:'or', a:l, b:andE()}; } return l; }
  function andE(){ let l=notE(); while(isKw('and')){ p++; l={k:'and', a:l, b:notE()}; } return l; }
  function notE(){ if(isKw('not')){ p++; return {k:'not', a:notE()}; } return cmp(); }
  function cmp(){ let l=add();
    for(;;){
      if(peek()&&peek().t==='op'&&['=','<>','!=','<','<=','>','>='].includes(peek().v)){ const o=next().v; l={k:'cmp', o, a:l, b:add()}; continue; }
      let neg=false; if(isKw('not') && (isKw('in',1)||isKw('like',1)||isKw('between',1))){ p++; neg=true; }
      if(isKw('in')){ p++; eatOp('('); if(isKw('select')) throw new Error(SUBQ); const list=[expr()]; while(isOp(',')){ p++; list.push(expr()); } eatOp(')'); l={k:'in', a:l, list, neg}; continue; }
      if(isKw('like')){ p++; l={k:'like', a:l, b:add(), neg}; continue; }
      if(isKw('between')){ p++; const lo=add(); eatKw('and'); const hi=add(); l={k:'between', a:l, lo, hi, neg}; continue; }
      if(isKw('is')){ p++; let n=false; if(isKw('not')){ p++; n=true; } eatKw('null'); l={k:'isnull', a:l, neg:n}; continue; }
      return l; } }
  function add(){ let l=mul(); while(isOp('+')||isOp('-')||isOp('||')){ const o=next().v; l={k:'bin', o, a:l, b:mul()}; } return l; }
  function mul(){ let l=unary(); while(isOp('*')||isOp('/')||isOp('%')){ const o=next().v; l={k:'bin', o, a:l, b:unary()}; } return l; }
  function unary(){ if(isOp('-')){ p++; return {k:'neg', a:unary()}; } return prim(); }
  function prim(){ const x=peek(); if(!x) throw new Error('Câu SQL bị cụt'); if(isKw('select')) throw new Error(SUBQ);
    if(x.t==='num'){ p++; return {k:'lit', v:x.v}; }
    if(x.t==='str'){ p++; return {k:'lit', v:x.v}; }
    if(isKw('null')){ p++; return {k:'lit', v:null}; }
    if(isKw('true')||isKw('false')){ p++; return {k:'lit', v:x.v==='true'?1:0}; }
    if(isOp('(')){ p++; if(isKw('select')) throw new Error(SUBQ); const e=expr(); eatOp(')'); return e; }
    if(isKw('case')){ p++; const whens=[]; let base=null; if(!isKw('when')) base=expr(); while(isKw('when')){ p++; const c=expr(); eatKw('then'); whens.push([c, expr()]); } let el=null; if(isKw('else')){ p++; el=expr(); } eatKw('end'); return {k:'case', base, whens, el}; }
    if(x.t==='id'){ p++;
      if(isOp('(')){ p++; const fn=x.v; let distinct=false, args=[];
        if(isOp('*')){ p++; args=[{k:'star'}]; } else if(!isOp(')')){ if(isKw('distinct')){ p++; distinct=true; } args.push(expr()); while(isOp(',')){ p++; args.push(expr()); } }
        eatOp(')'); return {k:AGG.has(fn)?'agg':'fn', fn, args, distinct}; }
      if(isOp('.')){ p++; if(isOp('*')){ p++; return {k:'star', t:x.v}; } return {k:'col', t:x.v, c:ident()}; }
      return {k:'col', c:x.v}; }
    throw new Error(`Không hiểu "${x.v}"`); }
  // câu SELECT
  eatKw('select'); let distinct=false; if(isKw('distinct')){ p++; distinct=true; }
  const cols=[]; do{ if(cols.length) p++; if(isOp('*')){ p++; cols.push({e:{k:'star'}}); continue; } const e=expr(); let as=null; if(isKw('as')){ p++; as=ident(); } else if(peek()&&peek().t==='id') as=next().v; cols.push({e, as}); } while(isOp(','));
  eatKw('from'); const from={t:ident(), a:null}; if(isKw('as')){ p++; from.a=ident(); } else if(peek()&&peek().t==='id') from.a=next().v;
  const joins=[];
  while(isKw('join')||isKw('inner')||isKw('left')){ let left=false; if(isKw('left')){ p++; left=true; if(isKw('outer')) p++; } else if(isKw('inner')) p++; eatKw('join');
    const j={t:ident(), a:null, left}; if(isKw('as')){ p++; j.a=ident(); } else if(peek()&&peek().t==='id') j.a=next().v; eatKw('on'); j.on=expr(); joins.push(j); }
  let where=null, group=null, having=null, order=null, limit=null, offset=0;
  if(isKw('where')){ p++; where=expr(); }
  if(isKw('group')){ p++; eatKw('by'); group=[expr()]; while(isOp(',')){ p++; group.push(expr()); } }
  if(isKw('having')){ p++; having=expr(); }
  if(isKw('order')){ p++; eatKw('by'); order=[]; do{ if(order.length) p++; const e=expr(); let desc=false; if(isKw('asc')) p++; else if(isKw('desc')){ p++; desc=true; } order.push({e, desc}); } while(isOp(',')); }
  if(isKw('limit')){ p++; const n=next(); if(!n||n.t!=='num') throw new Error('LIMIT cần một số'); limit=n.v; if(isKw('offset')){ p++; offset=next().v; } }
  if(isOp(';')) p++;
  if(p<T.length) throw new Error(`Dư phần cuối câu: "${T.slice(p).map(x=>x.v).join(' ')}"`);
  return {distinct, cols, from, joins, where, group, having, order, limit, offset};
}

const likeRe=pat=>new RegExp('^'+String(pat).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*').replace(/_/g,'.')+'$','i');
const cmpv=(a,b)=>{ if(a===null||b===null) return null; if(typeof a==='number'&&typeof b==='number') return a-b; const na=+a, nb=+b; if(typeof a!==typeof b && !isNaN(na) && !isNaN(nb)) return na-nb; return String(a)<String(b)?-1:String(a)>String(b)?1:0; };

export function runSQL(db, sql){
  const q=parse(sql);
  const tbl=n=>{ const t=db[n]; if(!t) throw new Error(`Không có bảng "${n}". Các bảng: ${Object.keys(db).join(', ')}`); return t; };
  const srcs=[q.from, ...q.joins].map(s=>({...s, a:s.a||s.t, rows:tbl(s.t)}));
  // dòng = {alias: rowObject|null}
  let rows=srcs[0].rows.map(r=>({[srcs[0].a]:r}));
  function colVal(row, e){
    if(e.t){ if(!(e.t in row)) throw new Error(`Không có bảng/bí danh "${e.t}"`); const r=row[e.t]; if(r===null) return null; if(!(e.c in r)) throw new Error(`Bảng ${e.t} không có cột "${e.c}"`); return r[e.c]; }
    let found=undefined, n=0; for(const a in row){ const r=row[a]; const cols=r?r:(srcs.find(s=>s.a===a).rows[0]||{}); if(e.c in cols){ n++; found=r?r[e.c]:null; } }
    if(n>1) throw new Error(`Cột "${e.c}" bị trùng giữa các bảng – ghi rõ bảng.cột`); if(n===0) throw new Error(`Không có cột "${e.c}"`); return found; }
  function ev(e, row, grp){
    switch(e.k){
      case 'lit': return e.v;
      case 'col': if(row.__alias && e.c in row.__alias && !e.t) return row.__alias[e.c]; return colVal(row, e);
      case 'neg': { const v=ev(e.a,row,grp); return v===null?null:-v; }
      case 'bin': { const a=ev(e.a,row,grp), b=ev(e.b,row,grp); if(e.o==='||') return (a??'')+''+(b??''); if(a===null||b===null) return null; const x=+a, y=+b;
        return e.o==='+'?x+y:e.o==='-'?x-y:e.o==='*'?x*y:e.o==='/'?(y===0?null:x/y):x%y; }
      case 'cmp': { const c=cmpv(ev(e.a,row,grp), ev(e.b,row,grp)); if(c===null) return null; return {'=':c===0,'<>':c!==0,'!=':c!==0,'<':c<0,'<=':c<=0,'>':c>0,'>=':c>=0}[e.o]?1:0; }
      case 'and': { const a=ev(e.a,row,grp), b=ev(e.b,row,grp); return (a&&b)?1:0; }
      case 'or': { const a=ev(e.a,row,grp), b=ev(e.b,row,grp); return (a||b)?1:0; }
      case 'not': return ev(e.a,row,grp)?0:1;
      case 'in': { const v=ev(e.a,row,grp); if(v===null) return null; const r=e.list.some(x=>cmpv(v, ev(x,row,grp))===0); return (e.neg?!r:r)?1:0; }
      case 'like': { const v=ev(e.a,row,grp); if(v===null) return null; const r=likeRe(ev(e.b,row,grp)).test(String(v)); return (e.neg?!r:r)?1:0; }
      case 'between': { const v=ev(e.a,row,grp); const r=cmpv(v,ev(e.lo,row,grp))>=0 && cmpv(v,ev(e.hi,row,grp))<=0; return (e.neg?!r:r)?1:0; }
      case 'isnull': { const v=ev(e.a,row,grp); const r=v===null||v===undefined; return (e.neg?!r:r)?1:0; }
      case 'case': { for(const [c,v] of e.whens){ const hit = e.base ? cmpv(ev(e.base,row,grp), ev(c,row,grp))===0 : !!ev(c,row,grp); if(hit) return ev(v,row,grp); } return e.el?ev(e.el,row,grp):null; }
      case 'fn': { const a=e.args.map(x=>ev(x,row,grp)), f=e.fn;
        if(f==='upper') return a[0]==null?null:String(a[0]).toUpperCase(); if(f==='lower') return a[0]==null?null:String(a[0]).toLowerCase();
        if(f==='length'||f==='len') return a[0]==null?null:String(a[0]).length; if(f==='round'){ const k=Math.pow(10,a[1]||0); return a[0]==null?null:Math.round(a[0]*k)/k; }
        if(f==='abs') return a[0]==null?null:Math.abs(a[0]); if(f==='coalesce'||f==='ifnull') return a.find(v=>v!==null&&v!==undefined)??null;
        if(f==='substr'||f==='substring'){ if(a[0]==null) return null; const s=String(a[0]); return s.substr((a[1]||1)-1, a[2]??s.length); }
        if(f==='trim') return a[0]==null?null:String(a[0]).trim(); if(f==='date') return a[0]==null?null:String(a[0]).slice(0,10);
        throw new Error(`Chưa hỗ trợ hàm ${f.toUpperCase()}()`); }
      case 'agg': { if(!grp) throw new Error(`Hàm ${e.fn.toUpperCase()}() chỉ dùng trong SELECT/HAVING (kèm GROUP BY nếu cần)`);
        if(e.args[0]&&e.args[0].k==='star') return e.fn==='count'?grp.length:null;
        let vals=grp.map(r=>ev(e.args[0], r, null)).filter(v=>v!==null&&v!==undefined); if(e.distinct) vals=[...new Set(vals.map(v=>typeof v==='number'?v:String(v)))];
        if(e.fn==='count') return vals.length; if(!vals.length) return null;
        if(e.fn==='sum') return vals.reduce((s,v)=>s+ +v,0); if(e.fn==='avg') return vals.reduce((s,v)=>s+ +v,0)/vals.length;
        if(e.fn==='min') return vals.reduce((m,v)=>cmpv(v,m)<0?v:m); if(e.fn==='max') return vals.reduce((m,v)=>cmpv(v,m)>0?v:m); }
      case 'star': throw new Error('Dấu * chỉ dùng trong SELECT * hoặc COUNT(*)');
    } throw new Error('Biểu thức không hỗ trợ'); }
  // JOIN
  for(let k=1;k<srcs.length;k++){ const s=srcs[k], outR=[];
    for(const r of rows){ let hit=false; for(const r2 of s.rows){ const row={...r, [s.a]:r2}; if(ev(s.on,row)){ outR.push(row); hit=true; } } if(!hit && s.left) outR.push({...r, [s.a]:null}); }
    rows=outR; }
  if(q.where) rows=rows.filter(r=>ev(q.where,r));
  const hasAgg=e=>e && (e.k==='agg' || ['a','b','lo','hi','base','el'].some(k=>e[k]&&hasAgg(e[k])) || (e.list||[]).some(hasAgg) || (e.args||[]).some(hasAgg) || (e.whens||[]).some(w=>hasAgg(w[0])||hasAgg(w[1])));
  const grouped = q.group || q.cols.some(c=>hasAgg(c.e)) || (q.having && hasAgg(q.having));
  // danh sách cột ra
  const outCols=[]; for(const c of q.cols){ if(c.e.k==='star'){ for(const s of srcs) if(!c.e.t || c.e.t===s.a) for(const k of Object.keys(s.rows[0]||{})) outCols.push({e:{k:'col', t:s.a, c:k}, name:k}); } else outCols.push({e:c.e, name:c.as || (c.e.k==='col'?c.e.c:(c.e.fn?c.e.fn+'(…)':'expr'))}); }
  let res;
  if(grouped){
    const groups=new Map();
    for(const r of rows){ const key=q.group ? JSON.stringify(q.group.map(g=>ev(g,r))) : '_'; if(!groups.has(key)) groups.set(key, []); groups.get(key).push(r); }
    if(!q.group && !groups.size) groups.set('_', []);
    res=[]; for(const g of groups.values()){ const first=g[0]||{}; if(q.having && !ev(q.having, first, g)) continue;
      const vals=outCols.map(c=>ev(c.e, first, g)); const alias={}; outCols.forEach((c,i)=>alias[c.name]=vals[i]); res.push({vals, first, g, alias}); }
  } else res=rows.map(r=>{ const vals=outCols.map(c=>ev(c.e, r)); const alias={}; outCols.forEach((c,i)=>alias[c.name]=vals[i]); return {vals, first:r, g:null, alias}; });
  if(q.order){ res.sort((A,B)=>{ for(const o of q.order){ const va=ev(o.e, {...A.first, __alias:A.alias}, A.g), vb=ev(o.e, {...B.first, __alias:B.alias}, B.g);
      let c = va===null&&vb===null?0 : va===null?-1 : vb===null?1 : cmpv(va,vb); if(o.desc) c=-c; if(c) return c; } return 0; }); }
  let out=res.map(r=>r.vals);
  if(q.distinct){ const seen=new Set(); out=out.filter(v=>{ const k=JSON.stringify(v); if(seen.has(k)) return false; seen.add(k); return true; }); }
  if(q.limit!==null) out=out.slice(q.offset, q.offset+q.limit);
  return {columns:outCols.map(c=>c.name), rows:out, ordered:!!q.order};
}

// So khớp kết quả bài làm với đáp án (bỏ qua tên cột; số làm tròn 2 chữ số; không quan tâm thứ tự nếu đề không yêu cầu sắp xếp)
export function sameResult(a, b, ordered){
  if(a.rows.length!==b.rows.length) return {ok:false, why:`Số dòng: bạn ${a.rows.length}, đúng phải là ${b.rows.length}`};
  if(a.rows.length && a.rows[0].length!==b.rows[0].length) return {ok:false, why:`Số cột: bạn ${a.rows[0].length}, đúng phải là ${b.rows[0].length}`};
  const norm=v=>v===null||v===undefined?'∅':typeof v==='number'?String(Math.round(v*100)/100):(!isNaN(+v)&&String(v).trim()!==''?String(Math.round(+v*100)/100):String(v).trim().toLowerCase());
  const ka=a.rows.map(r=>r.map(norm).join('¦')), kb=b.rows.map(r=>r.map(norm).join('¦'));
  if(ordered){ for(let i=0;i<ka.length;i++) if(ka[i]!==kb[i]) return {ok:false, why:`Dòng ${i+1} khác đáp án (để ý ORDER BY)`}; return {ok:true}; }
  ka.sort(); kb.sort(); for(let i=0;i<ka.length;i++) if(ka[i]!==kb[i]) return {ok:false, why:'Dữ liệu trả về chưa khớp đáp án'}; return {ok:true};
}
