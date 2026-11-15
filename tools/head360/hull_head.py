# Dựng ĐẦU 3D THẬT từ video quay quanh đầu: "visual hull" theo hướng toả tròn từ tâm đầu.
# Mỗi hướng (u,v) như SphereGeometry: đi từ tâm ra ngoài tới khi điểm bị ≥ VOTE khung nhìn thấy là NỀN → đó là mặt đầu.
# Sau đó phủ màu từ các khung đã căn (nhìn thẳng nhất) lên đúng hình dạng đó → không méo mặt.
# Ra: <shape.json> bán kính tại từng đỉnh của SphereGeometry(GW, GH) (đơn vị px video, gốc = tâm đầu ngang tầm mắt) + <texture.png> 1024x512
# usage: python -I hull_head.py <thư mục khung> <head_track.json> <params.json> <shape.json> <texture.png> <xem thử.jpg>
import sys, os, json, math
import numpy as np, cv2

d, trk, prm, out_shape, out_tex, out_prev = sys.argv[1:7]
B = 232.0                 # nửa chiều cao đầu (px) – gốc toạ độ: đỉnh tóc − B (ngang tầm mắt)
CUT = -292.0              # cắt ngang cổ ~3 cm dưới cằm (đủ dài để nối vào cổ áo)
GW, GH = 128, 64          # lưới đỉnh của khối đầu trong game
VOTE = 3                  # cần ≥3 khung thấy "nền" mới khoét

tr = {int(o['f'][2:5]): o for o in json.load(open(trk)) if 'top' in o}
AL = {int(k): v for k, v in json.load(open(prm)).items()}          # khung đã căn: [góc, dx, dy]
KEY = {1: 0, 5: 0, 8: 3, 9: 5, 10: 10, 11: 15, 12: 22, 13: 28, 14: 35, 15: 42, 16: 50, 17: 58, 18: 66, 19: 74, 20: 82, 21: 90,
       24: 109, 27: 130, 30: 148, 33: 164, 36: 175, 39: 181, 42: 193, 45: 214, 48: 238, 52: 270, 55: 291, 58: 312, 61: 331,
       64: 347, 66: 354, 69: 360, 76: 360}
ks = sorted(KEY)
def ang0(n):
    for a, b in zip(ks, ks[1:]):
        if a <= n <= b: return KEY[a] + (KEY[b] - KEY[a]) * (n - a) / (b - a)
    return KEY[ks[-1]]
# tham số mọi khung 3..62: nội suy giữa các khung đã căn (giữ nhịp quay theo KEY)
al = sorted(AL)
def params(n):
    if n in AL: return AL[n]
    for a, b in zip(al, al[1:]):
        if a < n < b:
            ga, gb = ang0(a), ang0(b); t = (ang0(n) - ga) / (gb - ga) if gb != ga else (n - a) / (b - a); s = (n - a) / (b - a)
            return [AL[a][0] + (AL[b][0] - AL[a][0]) * t, AL[a][1] + (AL[b][1] - AL[a][1]) * s, AL[a][2] + (AL[b][2] - AL[a][2]) * s]
    return None
views = []
for n in range(al[0], al[-1] + 1):
    p = params(n)
    if p is None or n not in tr: continue
    im = cv2.imread(os.path.join(d, f'f_{n:03d}.png')); hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    bg = ((hsv[..., 1] < 58) & (hsv[..., 2] > 140)).astype(np.uint8)
    bg = cv2.morphologyEx(bg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    # chỉ giữ vùng nền nối ra mép ảnh (vệt sáng bóng trên trán/má không bị coi là nền)
    nl, lab = cv2.connectedComponents(bg); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgc = np.isin(lab, list(edge)).astype(np.uint8)
    o = tr[n]; views.append({'n': n, 'th': math.radians(p[0]), 'cx': o['cx'] + p[1], 'cy': o['top'] + B + p[2], 'bg': bgc, 'im': im})
print('views', len(views), 'frames', views[0]['n'], '..', views[-1]['n'])

def dirs(W, H, vertex):
    u = (np.arange(W + 1) / W) if vertex else (np.arange(W) + .5) / W
    v = (np.arange(H + 1) / H) if vertex else (np.arange(H) + .5) / H
    U, V = np.meshgrid(u, v); phi = 2 * np.pi * U; t = np.pi * V
    return np.stack([-np.cos(phi) * np.sin(t), np.cos(t), np.sin(phi) * np.sin(t)], -1)

def hull_radius(D, rmax=340, step=2.0):
    sh = D.shape[:2]; Df = D.reshape(-1, 3); n = len(Df)
    r_out = np.full(n, rmax, np.float32); alive = np.ones(n, bool)
    for r in np.arange(step, rmax, step):
        X, Y, Z = Df[:, 0] * r, Df[:, 1] * r, Df[:, 2] * r
        cnt = np.zeros(n, np.int16)
        for vw in views:
            ct, st = math.cos(vw['th']), math.sin(vw['th'])
            px = np.round(vw['cx'] + X * ct + Z * st).astype(np.int32); py = np.round(vw['cy'] - Y).astype(np.int32)
            ok = (px >= 0) & (px < vw['bg'].shape[1]) & (py >= 0) & (py < vw['bg'].shape[0])
            b = np.zeros(n, bool); b[ok] = vw['bg'][py[ok], px[ok]] > 0
            cnt += b
        out = (cnt >= VOTE) | (Y < CUT)
        newly = alive & out; r_out[newly] = r - step / 2; alive &= ~out
        if not alive.any(): break
    return r_out.reshape(sh)

# 1) hình dạng: tính dày rồi làm mượt (bọc vòng theo u)
Dd = dirs(256, 128, False); R = hull_radius(Dd)
Rp = np.concatenate([R[:, -8:], R, R[:, :8]], 1); Rp = cv2.GaussianBlur(Rp.astype(np.float32), (0, 0), 1.6); R = Rp[:, 8:-8]
print('r px: min %.0f  max %.0f  mean %.0f' % (R.min(), R.max(), R.mean()))
def sample(Rg, u, v):   # nội suy song tuyến trên lưới tâm ô (bọc theo u)
    H, W = Rg.shape; x = u * W - .5; y = np.clip(v * H - .5, 0, H - 1)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); fx = x - x0; fy = y - y0; y1 = np.minimum(y0 + 1, H - 1)
    x0w = x0 % W; x1w = (x0 + 1) % W
    return (Rg[y0, x0w] * (1 - fx) + Rg[y0, x1w] * fx) * (1 - fy) + (Rg[y1, x0w] * (1 - fx) + Rg[y1, x1w] * fx) * fy
uu, vv = np.meshgrid(np.arange(GW + 1) / GW, np.arange(GH + 1) / GH)
RV = sample(R, uu, vv)
json.dump({'w': GW, 'h': GH, 'unit': 'px', 'B': B, 'cut': CUT, 'r': [round(float(x), 1) for x in RV.ravel()]}, open(out_shape, 'w'))

# 2) màu: chiếu lên đúng hình (pháp tuyến từ lưới) – dùng các khung đã căn (nét nhất)
TW, TH = 1024, 512; Dt = dirs(TW, TH, False)
ut, vt = np.meshgrid((np.arange(TW) + .5) / TW, (np.arange(TH) + .5) / TH); Rt = sample(R, ut, vt)
Pt = Dt * Rt[..., None]
du = np.roll(Pt, -1, 1) - np.roll(Pt, 1, 1); dv = np.concatenate([Pt[1:2] - Pt[0:1], Pt[2:] - Pt[:-2], Pt[-1:] - Pt[-2:-1]], 0)
Nn = np.cross(dv, du); Nn /= np.linalg.norm(Nn, axis=-1, keepdims=True) + 1e-9
Nn *= np.sign((Nn * Dt).sum(-1, keepdims=True) + 1e-9)       # hướng ra ngoài
X, Y, Z = Pt[..., 0], Pt[..., 1], Pt[..., 2]
sel = [v for v in views if v['n'] in AL]
best = np.full((TH, TW), 1e-6)
for vw in sel: best = np.maximum(best, -Nn[..., 0] * math.sin(vw['th']) + Nn[..., 2] * math.cos(vw['th']))
acc = np.zeros((TH, TW, 3)); ws = np.zeros((TH, TW))
for vw in sel:
    ct, st = math.cos(vw['th']), math.sin(vw['th'])
    mx = (vw['cx'] + X * ct + Z * st).astype(np.float32); my = (vw['cy'] - Y).astype(np.float32)
    w = np.clip((-Nn[..., 0] * st + Nn[..., 2] * ct) / best, 0, 1) ** 24
    col = cv2.remap(vw['im'], mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT).astype(np.float64)
    isbg = cv2.remap(vw['bg'], mx, my, cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=1)
    ok = (mx >= 0) & (mx < vw['im'].shape[1] - 1) & (my >= 0) & (my < vw['im'].shape[0] - 1) & (isbg == 0)
    w = w * ok; acc += col * w[..., None]; ws += w
ok = ws > 1e-9; tex = np.zeros((TH, TW, 3), np.uint8); tex[ok] = np.clip(acc[ok] / ws[ok][:, None], 0, 255).astype(np.uint8)
tex = cv2.inpaint(tex, (~ok).astype(np.uint8) * 255, 6, cv2.INPAINT_TELEA); cv2.imwrite(out_tex, tex)
# xem thử: ảnh trải + mặt cắt ngang (nhìn từ trên) & mặt cắt dọc (nhìn nghiêng)
pv = np.zeros((512, 1024 + 512, 3), np.uint8); pv[:, :1024] = tex
c = (1024 + 256, 256); s = .6
for row in range(0, 128, 16):
    pts = [(int(c[0] + Dd[row, k, 0] * R[row, k] * s), int(c[1] - Dd[row, k, 2] * R[row, k] * s)) for k in range(256)]
    cv2.polylines(pv, [np.array(pts)], True, (0, 200, 255), 1)
for k in (64, 192):   # mặt cắt dọc qua trước–sau (u=.25 trước, .75 sau)
    pts = [(int(c[0] + Dd[row, k, 2] * R[row, k] * s), int(c[1] - Dd[row, k, 1] * R[row, k] * s)) for row in range(128)]
    cv2.polylines(pv, [np.array(pts)], False, (0, 255, 0), 2)
cv2.imwrite(out_prev, pv); print('saved', out_shape, out_tex)
