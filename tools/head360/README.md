# head360 – dựng "đầu thật" cho nhân vật Anh trai Bình Phan từ 1 video quay quanh đầu

Kết quả: `data/binhphan_head.jpg` (ảnh trải 360°, 1024×512, đúng cách trải UV của `THREE.SphereGeometry`) –
`js/topup.js` dán lên khối đầu (elip thon hàm/gáy) gắn vào xương đầu. Ảnh + video là **dữ liệu riêng tư**:
`data/binhphan*` đã nằm trong `.gitignore`, không đưa lên git, không gửi đi đâu.

## Quay video
- Người ngồi ghế xoay, máy quay **đứng yên** ngang tầm mắt, cách ~1 m, nền sáng trơn.
- Xoay chậm đủ 1 vòng (≈6–8 s): thẳng mặt → nghiêng phải → sau gáy → nghiêng trái → thẳng mặt. Giữ đầu thẳng, không cười to.

## Các bước (Python 3 + OpenCV + NumPy, ffmpeg)
```bash
ffmpeg -i video.mp4 -vf fps=10 frames/f_%03d.png          # cắt khung
python -I head_track.py frames head_track.json             # dò khối tóc → đỉnh đầu, tâm ngang từng khung
python -I align_head.py frames head_track.json head.png prev.jpg params.json   # tự căn góc/vị trí từng khung rồi ghép
python -I shave.py head.png binhphan_head.jpg cmp.png      # "cạo râu" vùng nhân trung/cằm (giữ môi)
```
- `align_head.py`: bảng `KEY` = góc quay ước lượng theo số khung (đọc bằng mắt từ bảng ảnh nhỏ), `A,B,C` = nửa rộng/cao/sâu đầu (px)
  đo trên khung thẳng mặt và khung nghiêng. Video mới → sửa 2 chỗ này, script tự tinh chỉnh ±14°, ±24 px.
- Sau khi chép ảnh vào `data/`: sửa `data/characters.json` → `headU` (cột giữa mặt / 1024), tăng `headVer`.
