# Ghép ảnh trải 360° của đầu có TỰ CĂN: khung thẳng mặt làm gốc, mỗi khung kế tiếp dò (góc, lệch ngang, lệch dọc)
# sao cho vùng chồng lấn khớp nhất (so chi tiết cao tần → ít phụ thuộc ánh sáng), đi dần 2 phía ra sau gáy.
# usage: python -I align_head.py <thư mục khung> <head_track.json> <png ra> <png xem thử> <json tham số ra>
import sys, os, json, math
import numpy as np, cv2

d, trk, out, prev, pout = sys.argv[1:6]
A, B, C = 178.0, 232.0, 190.0
TW, TH = 512, 256            # lưới thô để căn; ảnh cuối 1024x512
KEY = {1: 0, 5: 0, 8: 3, 9: 5, 10: 10, 11: 15, 12: 22, 13: 28, 14: 35, 15: 42, 16: 50, 17: 58, 18: 66, 19: 74, 20: 82, 21: 90,
       24: 109, 27: 130, 30: 148, 33: 164, 36: 175, 39: 181, 42: 193, 45: 214, 48: 238, 52: 270, 55: 291, 58: 312, 61: 331,
       64: 347, 66: 354, 69: 360, 76: 360}
ks = sorted(KEY)
def ang0(n):
    for a, b in zip(ks, ks[1:]):
        if a <= n <= b: return KEY[a] + (KEY[b] - KEY[a]) * (n - a) / (b - a)
    return KEY[ks[-1]]
tr = {int(o['f'][2:5]): o for o in json.load(open(trk)) if 'top' in o}
IM = {}
def frame(n):
    if n not in IM:
        im = cv2.imread(os.path.join(d, f'f_{n:03d}.png')); hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
        bg = cv2.morphologyEx(((hsv[..., 1] < 58) & (hsv[..., 2] > 140)).astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        IM[n] = (im, bg)
    return IM[n]

def grid(tw, th):
    u = (np.arange(tw) + .5) / tw; v = (np.arange(th) + .5) / th
    U, V = np.meshgrid(u, v); phi = 2 * np.pi * U; t = np.pi * V
    ux, uy, uz = -np.cos(phi) * np.sin(t), np.cos(t), np.sin(phi) * np.sin(t)
    lo = np.clip(-uy, 0, 1) ** 2; sx = 1 - .26 * lo; sz = np.where(uz > 0, 1 - .12 * lo, 1 - .34 * lo)
    X, Y, Z = A * ux * sx, B * uy, C * uz * sz
    nx, ny, nz = ux / A, uy / B, uz / C; nl = np.sqrt(nx * nx + ny * ny + nz * nz)
    return X, Y, Z, nx / nl, ny / nl, nz / nl
G = grid(TW, TH)

def sample(n, prm, g=G):
    X, Y, Z, nx, ny, nz = g; im, bg = frame(n); th, dx, dy = prm
    t = math.radians(th); ct, st = math.cos(t), math.sin(t)
    o = tr[n]; cx, cy = o['cx'] + dx, o['top'] + B + dy
    mx = (cx + X * ct + Z * st).astype(np.float32); my = (cy - Y).astype(np.float32)
    vis = np.clip(-nx * st + nz * ct, 0, 1)
    col = cv2.remap(im, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT).astype(np.float32)
    isbg = cv2.remap(bg, mx, my, cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=1)
    ok = (mx >= 0) & (mx < im.shape[1] - 1) & (my >= 0) & (my < im.shape[0] - 1) & (isbg == 0)
    return col, vis * ok

def hp(col):   # chi tiết cao tần của ảnh xám
    g = cv2.cvtColor(col.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
    return g - cv2.GaussianBlur(g, (0, 0), 6)

params = {3: (0.0, 0.0, 0.0)}
ref_col, ref_vis = sample(3, params[3]); ref_acc = ref_col * (ref_vis ** 4)[..., None]; ref_w = ref_vis ** 4; ref_conf = ref_vis.copy()
def add(n):
    global ref_acc, ref_w, ref_conf
    col, vis = sample(n, params[n]); w = vis ** 4
    ref_acc = ref_acc + col * w[..., None]; ref_w = ref_w + w; ref_conf = np.maximum(ref_conf, vis)

RIGHT = [13, 17, 21, 25, 30, 35, 39]; LEFT = [62, 57, 52, 48, 44]
for chain in (RIGHT, LEFT):
    prev_d = None
    for n in chain:
        refc = (ref_acc / np.maximum(ref_w, 1e-9)[..., None]); R = hp(refc)
        base = ang0(n); bd = prev_d if prev_d else (0.0, 0.0)
        best = None
        for dth in range(-14, 15, 2):
            for dx in range(-24, 25, 6):
                for dy in range(-12, 13, 6):
                    prm = (base + dth, bd[0] + dx, bd[1] + dy); col, vis = sample(n, prm)
                    m = (ref_conf > .5) & (vis > .5)
                    if m.sum() < 800: continue
                    s = float(np.abs(hp(col)[m] - R[m]).mean())
                    if best is None or s < best[0]: best = (s, prm)
        # tinh chỉnh quanh điểm tốt nhất
        s0, p0 = best
        for dth in (-1, 0, 1):
            for dx in (-3, 0, 3):
                for dy in (-3, 0, 3):
                    prm = (p0[0] + dth, p0[1] + dx, p0[2] + dy); col, vis = sample(n, prm)
                    m = (ref_conf > .5) & (vis > .5)
                    if m.sum() < 800: continue
                    s = float(np.abs(hp(col)[m] - R[m]).mean())
                    if s < best[0]: best = (s, prm)
        params[n] = best[1]; prev_d = (best[1][1], best[1][2]); add(n)
        print(n, 'goc %.0f -> %.0f' % (base, best[1][0]), 'dx %+.0f dy %+.0f' % best[1][1:], 'diff %.2f' % best[0], flush=True)
json.dump({str(k): v for k, v in params.items()}, open(pout, 'w'))

# ảnh cuối độ phân giải đầy đủ
GF = grid(1024, 512); P = 24
best_vis = np.full(GF[0].shape, 1e-6)
for n, prm in params.items():
    t = math.radians(prm[0]); best_vis = np.maximum(best_vis, np.clip(-GF[3] * math.sin(t) + GF[5] * math.cos(t), 0, 1))
acc = np.zeros(GF[0].shape + (3,), np.float64); ws = np.zeros(GF[0].shape, np.float64)
for n, prm in params.items():
    col, vis = sample(n, prm, GF); w = np.clip(vis / best_vis, 0, 1) ** P
    acc += col * w[..., None]; ws += w
ok = ws > 1e-9; pano = np.zeros(GF[0].shape + (3,), np.uint8); pano[ok] = np.clip(acc[ok] / ws[ok][:, None], 0, 255).astype(np.uint8)
pano = cv2.inpaint(pano, (~ok).astype(np.uint8) * 255, 6, cv2.INPAINT_TELEA); cv2.imwrite(out, pano)
pv = pano.copy()
for k in range(0, 1024, 128): cv2.line(pv, (k, 0), (k, 512), (0, 255, 0), 1)
for k in range(0, 512, 64): cv2.line(pv, (0, k), (1024, k), (0, 255, 0), 1)
cv2.imwrite(prev, pv); print('saved', out, 'holes', round(100 * (~ok).mean(), 2))
