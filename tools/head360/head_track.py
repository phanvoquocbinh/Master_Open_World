# dò đầu trong từng khung: khối tóc đen lớn nhất ở nửa trên → đỉnh tóc, hàng rộng nhất, tâm ngang
import sys, glob, os, json
import numpy as np, cv2
d = sys.argv[1]; out = []
for f in sorted(glob.glob(os.path.join(d, 'f_*.png'))):
    im = cv2.imread(f); H, W = im.shape[:2]; hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    m = ((hsv[..., 2] < 70)).astype(np.uint8); m[int(H * .62):] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(m)
    if n < 2: out.append({'f': os.path.basename(f)}); continue
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); x, y, w, h, a = st[k]
    blob = (lab == k)
    rows = []
    for r in range(y, y + h):
        xs = np.nonzero(blob[r])[0]
        if len(xs): rows.append((r, xs.min(), xs.max()))
    top = rows[0][0]
    band = [rw for rw in rows if rw[0] < top + .55 * h]
    wr = max(band, key=lambda t: t[2] - t[1])
    out.append({'f': os.path.basename(f), 'top': int(top), 'wy': int(wr[0]), 'x0': int(wr[1]), 'x1': int(wr[2]), 'cx': (wr[1] + wr[2]) / 2, 'w': int(wr[2] - wr[1]), 'bottom': int(y + h), 'area': int(a)})
json.dump(out, open(sys.argv[2], 'w'), indent=0)
for o in out: print(o.get('f'), o.get('top'), o.get('wy'), o.get('cx'), o.get('w'), o.get('bottom'), o.get('area'))
