// QC World V2 – PHA 2: KHUNG THẾ GIỚI V2 (theo QC_WORLD_V2_MASTER_BIBLE_AND_CODE_SPECS.md – Phần 0)
//  • Từ 16/11/2026 MẶC ĐỊNH là V2. Muốn xem thế giới cũ (V1): mở world.html?v1 (hoặc localStorage 'qcworld-v2' = '0'). ?v2 vẫn ép bật V2.
//  • ZONES: bảng phân vùng toạ độ V2 (không chồng lấn) – mọi module V2 chỉ dựng trong đúng vùng của mình.
//  • clearLegacy(W): ở chế độ V2, gỡ toàn bộ nội dung khu vực cũ (nhà, đường, cây, va chạm, điểm E, ghế, điểm nhảy bản đồ, đất EXTL)
//    – giữ lại hệ thống lõi: biển, trời, ánh sáng, nhân vật, xe, kinh tế, điện thoại/laptop, nhiều người chơi.
//  • MODULES: danh sách module V2 (nạp động; file chưa có thì bỏ qua). Mỗi file export make(W, ctx) và tự đăng ký EXTL/PLACES của mình.
export const V2 = (()=>{ try{ const q=new URLSearchParams(location.search); if(q.has('v1')) return false; if(q.has('v2')) return true; return localStorage.getItem('qcworld-v2')!=='0'; }catch(e){ return true; } })();

// Bảng phân vùng V2 (x0..x1, z0..z1 theo mét; y = cao độ dự kiến). Skyport thu x1 về 175 để không chạm CBD (x ≥ 180).
export const ZONES = {
  abyssal:   {name:'QA/QC Abyssal Canyon Island – vịnh thông biển (eo Nam)', x0:-180, x1:180,  z0:-180, z1:180,  y:[-12,36],  file:'./abyssal_island.js',     phase:3},
  cbd:       {name:'River Tech CBD',              x0:180,  x1:580,  z0:-120, z1:460,  y:[0,140],   file:'./river_cbd.js',          phase:4},
  skyport:   {name:'QA/QC International Skyport', x0:-180, x1:175,  z0:220,  z1:380,  y:[4,68],    file:'./skyport.js',            phase:5},
  devcity:   {name:'Dev City 8D',       x0:100,  x1:850,  z0:-950, z1:-120, y:[2,135],   file:'./devcity_chongqing.js',  phase:6},
  brain:     {name:'QA/QC Brain Sovereign Peak',  x0:620,  x1:1150, z0:-100, z1:450,  y:[0,168],   file:'./brain_citadel.js',      phase:7},
  swiss:     {name:'Swiss Language Island',       x0:-850, x1:-250, z0:-500, z1:250,  y:[0,95],    file:'./swiss_lang_island.js',  phase:8},
  palm:      {name:'The QC Palm Archipelago',     x0:250,  x1:1050, z0:520,  z1:1320, y:[-8,65],   file:'./palm_dubai.js',         phase:8},
  wonder:    {name:'Wonderland & Kỳ Quan (dời về Nam)', x0:-400, x1:230, z0:485, z1:1510, y:[0,98], file:'./wonder_v2.js',        phase:2},
};
// bot theo vùng (Pha 9) – các vùng khác tự nạp bot trong module của mình
export const BOTS=[['abyssal','./bots_abyssal.js']];
// module dùng chung toàn thế giới (nạp sau cùng, nhận W + kết quả mọi vùng): giao thông, an ninh, sự kiện… → W[key]
export const EXTRAS=[['traffic','./v2traffic.js'], ['police','./police_station.js'], ['events','./world_events.js']];
export const inZone=(z,x,zz,pad=0)=>x>=z.x0-pad && x<=z.x1+pad && zz>=z.z0-pad && zz<=z.z1+pad;
export const zoneAt=(x,z)=>Object.entries(ZONES).find(([k,Z])=>inZone(Z,x,z))?.[0]||null;

/* ---------- gỡ nội dung thế giới cũ (chỉ chạy ở chế độ V2, trước khi nạp module V2) ---------- */
export function clearLegacy(W, opt={}){ const {THREE, scene, circles, boxes, plats, INTER, PLACES, EXTL, DYN, SEGS, HOOK} = W; const R=opt.radius??3000;
  const keep=new Set([W.me && W.me.g, W.camera, W.water, W.ocean, W.sky].filter(Boolean)); const box=new THREE.Box3(), v=new THREE.Vector3(), sz=new THREE.Vector3();
  const isCore=o=>{ if(keep.has(o) || o.isLight || o.isCamera) return true; const n=(o.name||'')+' '+(o.userData.role||''); if(/water|ocean|sea|sky|cloud|star|sun|moon/i.test(n)) return true; return !!o.userData.keepV2; };
  const out={objects:0, instances:0, colliders:0, inter:0, places:0, extl:0};
  for(const o of scene.children.slice()){ if(isCore(o)) continue;
    if(o.isInstancedMesh){ const m=new THREE.Matrix4(), z0=new THREE.Matrix4().makeScale(0,0,0); let hid=0; for(let i=0;i<o.count;i++){ o.getMatrixAt(i,m); v.setFromMatrixPosition(m); if(Math.abs(v.x)<R && Math.abs(v.z)<R){ o.setMatrixAt(i,z0); hid++; } } o.instanceMatrix.needsUpdate=true; out.instances+=hid; continue; }
    box.setFromObject(o); if(box.isEmpty()) { if(!o.isGroup) continue; }
    box.getSize(sz); if(sz.x>1800 || sz.z>1800) continue;   // biển, bầu trời, sương: giữ
    scene.remove(o); out.objects++; }
  const inR=(x,z)=>Math.abs(x)<R && Math.abs(z)<R;
  const filt=(arr, pos)=>{ const n=arr.length; for(let i=arr.length-1;i>=0;i--){ const p=pos(arr[i]); if(p && inR(p[0],p[1])) arr.splice(i,1); } return n-arr.length; };
  out.colliders+=filt(circles, c=>c.owner?null:[c.x,c.z]); out.colliders+=filt(boxes, b=>b.x0>1e8?null:[(b.x0+b.x1)/2,(b.z0+b.z1)/2]); out.colliders+=filt(plats, p=>[p.x,p.z]); if(SEGS) out.colliders+=filt(SEGS, s=>[(s.ax+s.bx)/2,(s.az+s.bz)/2]);
  out.inter+=filt(INTER, it=>[it.x,it.z]); if(W.dropSeats) W.dropSeats(s=>inR(s.x,s.z));
  if(DYN) filt(DYN, d=>d.obj ? [d.obj.position.x, d.obj.position.z] : null);
  if(EXTL) out.extl+=filt(EXTL, e=>[(e.x0+e.x1)/2,(e.z0+e.z1)/2]);
  if(W.CAFES) filt(W.CAFES, c=>[c.center.x,c.center.z]);
  if(PLACES){ for(let i=PLACES.length-1;i>=0;i--){ const p=PLACES[i]; HOOK.tpProbe=[]; try{ p.go(); }catch(e){} const q=HOOK.tpProbe[0]; HOOK.tpProbe=null; if(!q || inR(q[0],q[1])){ PLACES.splice(i,1); out.places++; } } }
  if(W.GLOW && W.GLOW.clear) W.GLOW.clear();
  W.inDTOff=true;   // vùng phố cũ (CITY.downtown/ward/arena) không còn là đất phẳng
  console.info('[QC World V2] gỡ thế giới cũ:', out); return out; }

/* ---------- nạp module V2 (file nào chưa có thì bỏ qua, không báo lỗi đỏ) ---------- */
export async function loadModules(W, ctx){ const res={};
  for(const [key,Z] of Object.entries(ZONES)){ try{ const m=await import(Z.file); if(m && m.make){ res[key]=await m.make(W, {...ctx, zone:Z, ZONES}); W[key+'V2']=res[key]; } }
    catch(e){ if(!/Failed to fetch|Cannot find module|error loading dynamically imported/i.test(String(e))) console.warn('[V2]', key, e); } }
  /* bot của từng vùng nạp SAU khi mọi vùng dựng xong (file bot nhận W và kết quả module vùng) */
  for(const [key,file] of BOTS){ if(!res[key]) continue; try{ const m=await import(file); if(m && m.make) W[key+'Bots']=await m.make(W, res[key]); }catch(e){ console.warn('[V2 bots]', key, e); } }
  for(const [key,file] of EXTRAS){ try{ const m=await import(file); if(m && m.make){ const r=await m.make(W, res); if(r) W[key]=r; } }catch(e){ console.warn('[V2 extra]', key, e); } }
  return res; }
