// QC World – MẠNG ĐƯỜNG THÀNH PHỐ (quy hoạch 15/11/2026): đọc CITY.roads → đoạn, ngã giao (nhánh B/N/Đ/T), mặt đường, vạch qua đường,
// đoạn vỉa hè. Dùng chung cho traffic.js (vạch, đèn, xe bot), transit.js (đồ thị taxi, tuyến buýt), downtown.js / ward.js (mặt đất),
// park.js (cây vỉa hè) – đổi quy hoạch chỉ cần sửa CITY.roads trong world.html.
// Quy ước hướng: Bắc = −z, Nam = +z, Đông = +x, Tây = −x. Lái xe bên phải: xe đi về Đông ở nửa +z, về Tây ở nửa −z, về Nam ở nửa −x, về Bắc ở nửa +x.
export function roadNet(CITY){
  const RD=CITY.roads; if(!RD) return null;
  const hw=RD.hw, walk=RD.walk, ZW=2.8, ZOFF=hw+1.4+ZW/2;   // vạch qua đường rộng 2,8 m, cách mép ngã tư 1,4 m
  const segs=RD.segs.map((s,i)=>s.x!==undefined ? {i, ns:true, x:s.x, a:Math.min(s.z0,s.z1), b:Math.max(s.z0,s.z1), name:s.name||''}
                                                : {i, ns:false, z:s.z, a:Math.min(s.x0,s.x1), b:Math.max(s.x0,s.x1), name:s.name||''});
  const J=[], jm=new Map(), E=1e-3;
  for(const v of segs) if(v.ns) for(const h of segs) if(!h.ns){ const x=v.x, z=h.z; if(z<v.a-E || z>v.b+E || x<h.a-E || x>h.b+E) continue;
    const k=x+','+z; let j=jm.get(k); if(!j){ j={x, z, arms:{n:0, s:0, e:0, w:0}, segs:[]}; jm.set(k,j); J.push(j); }
    j.arms.n=Math.max(j.arms.n, z-v.a); j.arms.s=Math.max(j.arms.s, v.b-z); j.arms.w=Math.max(j.arms.w, x-h.a); j.arms.e=Math.max(j.arms.e, h.b-x); j.segs.push(v,h); }
  for(const j of J){ j.n=['n','s','e','w'].filter(k=>j.arms[k]>E).length; j.signal=j.n>=3; j.t=j.n===3; }
  const isJ=(x,z,pad=0)=>J.find(j=>Math.abs(x-j.x)<hw+pad && Math.abs(z-j.z)<hw+pad)||null;
  // mặt đường (hình chữ nhật theo trục)
  const rects=segs.map(s=>s.ns ? {x0:s.x-hw, x1:s.x+hw, z0:s.a, z1:s.b, seg:s} : {x0:s.a, x1:s.b, z0:s.z-hw, z1:s.z+hw, seg:s});
  const onRoad=(x,z,pad=0)=>rects.some(r=>x>r.x0-pad && x<r.x1+pad && z>r.z0-pad && z<r.z1+pad);
  // các khúc đường giữa 2 ngã (đã trừ ô ngã tư) – để kẻ vạch, bó vỉa, trồng cây, dựng đèn
  function pieces(s){ const js=J.filter(j=>s.ns ? Math.abs(j.x-s.x)<E : Math.abs(j.z-s.z)<E).map(j=>s.ns?j.z:j.x).sort((a,b)=>a-b);
    const cuts=[s.a, ...js.flatMap(p=>[p-hw, p+hw]), s.b], out=[]; for(let i=0;i<cuts.length;i+=2){ const a=Math.max(s.a,cuts[i]), b=Math.min(s.b,cuts[i+1]); if(b-a>.5) out.push({a, b, ja:js.includes(a-hw), jb:js.includes(b+hw)}); } return out; }
  // vạch qua đường: mỗi nhánh dài hơn hw+6 m có 1 vạch, gắn với ngã + trục đường bị cắt ('ew' / 'ns') để chờ đèn
  const zebras=[]; for(const j of J){ const A=j.arms;
    if(A.e>hw+6) zebras.push({x0:j.x+ZOFF-ZW/2, x1:j.x+ZOFF+ZW/2, z0:j.z-hw, z1:j.z+hw, j, road:'ew', side:'e'});
    if(A.w>hw+6) zebras.push({x0:j.x-ZOFF-ZW/2, x1:j.x-ZOFF+ZW/2, z0:j.z-hw, z1:j.z+hw, j, road:'ew', side:'w'});
    if(A.s>hw+6) zebras.push({x0:j.x-hw, x1:j.x+hw, z0:j.z+ZOFF-ZW/2, z1:j.z+ZOFF+ZW/2, j, road:'ns', side:'s'});
    if(A.n>hw+6) zebras.push({x0:j.x-hw, x1:j.x+hw, z0:j.z-ZOFF-ZW/2, z1:j.z-ZOFF+ZW/2, j, road:'ns', side:'n'}); }
  // điểm dọc 2 vỉa hè của mọi đoạn: cách mép đường d m, bước step m, bỏ vùng gần ngã (keep m) – trả {x,z,seg,side,face(hướng nhìn ra đường)}
  function curbPoints(d, step, keep=hw+walk+2, phase=.5){ const pts=[];
    for(const s of segs) for(const p of pieces(s)){ const a=p.a+(p.ja?keep-hw:2), b=p.b-(p.jb?keep-hw:2); if(b-a<1) continue; const n=Math.max(1,Math.floor((b-a)/step)), st=(b-a)/n;
      for(const side of [-1,1]) for(let k=0;k<n;k++){ const t=a+(k+phase)*st, off=side*(hw+d);
        pts.push(s.ns ? {x:s.x+off, z:t, seg:s, side, face:side<0?Math.PI/2:-Math.PI/2} : {x:t, z:s.z+off, seg:s, side, face:side<0?0:Math.PI}); } }
    return pts; }
  const ends=[]; for(const s of segs) for(const [p,end] of [[s.a,'a'],[s.b,'b']]){ const x=s.ns?s.x:p, z=s.ns?p:s.z; if(!J.some(j=>Math.abs(j.x-x)<E && Math.abs(j.z-z)<E)) ends.push({x, z, seg:s, end}); }
  return {RD, hw, walk, lane:RD.lane, segs, J, isJ, rects, onRoad, pieces, zebras, zebraAt:(x,z)=>zebras.find(r=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1)||null, curbPoints, ends, ZOFF, ZW};
}
