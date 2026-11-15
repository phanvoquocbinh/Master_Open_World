# "Cạo râu" trên ảnh trải đầu: vùng nhân trung + cằm, chỉ làm SÁNG các điểm tối hơn da xung quanh (râu lún phún), giữ nguyên môi.
# usage: python -I shave.py <png vào> <ảnh ra (.jpg)> <png so sánh trước/sau>
import sys, numpy as np, cv2
src, dst, cmp_ = sys.argv[1:4]
im = cv2.imread(src).astype(np.float32); H, W = im.shape[:2]
b, g, r = im[..., 0], im[..., 1], im[..., 2]
# vùng quanh miệng (toạ độ ảnh trải 1024x512: mặt ở giữa cột ~265)
reg = np.zeros((H, W), np.float32)
cv2.ellipse(reg, (268, 352), (98, 74), 0, 0, 360, 1, -1)
reg[:318] *= 0                                             # không đụng mũi
reg = cv2.GaussianBlur(reg, (0, 0), 9)
lips = ((b - g) > -10) & (r > 120)                         # môi: hồng tím (B ≥ G), da: vàng cam (B < G)
lips = cv2.dilate(lips.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (27, 15))).astype(np.float32)   # gồm cả đường khép môi + khoé miệng
lips = cv2.GaussianBlur(lips, (0, 0), 3)
blur = cv2.medianBlur(im.astype(np.uint8), 21).astype(np.float32); blur = cv2.GaussianBlur(blur, (0, 0), 4)
lift = np.clip(blur - im, 0, None)                         # chỉ phần tối hơn nền da
m = (reg * (1 - lips))[..., None]
out = np.clip(im + lift * m * .95, 0, 255).astype(np.uint8)
cv2.imwrite(dst, out, [cv2.IMWRITE_JPEG_QUALITY, 92])
c0 = im[280:470, 150:400].astype(np.uint8); c1 = out[280:470, 150:400]
cv2.imwrite(cmp_, cv2.resize(np.hstack([c0, c1]), None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC))
sk = out[330:350, 180:200].reshape(-1, 3).mean(0)          # màu da má (BGR) → cho cổ / tay nhân vật
print('skin rgb #%02x%02x%02x' % (int(sk[2]), int(sk[1]), int(sk[0])))
