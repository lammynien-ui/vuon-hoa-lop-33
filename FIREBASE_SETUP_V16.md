# V16 – FIREBASE SPARK MIỄN PHÍ, KHÔNG DÙNG STORAGE

V16 không dùng Firebase Storage nên cô **không cần Upgrade project / Blaze**.

## Cô cần làm NGAY

### 1. Cập nhật Firestore Rules lần nữa

V16 lưu 40 học sinh trong subcollection `students`, vì vậy Rules V15 chưa đủ.

Vào:

**Firestore → Rules**

Xóa nội dung hiện tại và dán toàn bộ file `firestore.rules` của V16.

Sau đó bấm **Publish**.

Rules V16:
- PH/HS: đọc được dữ liệu
- chỉ UID giáo viên `CAt49gdVV9a0WD42dbwkmtg1g3i1`: được ghi/sửa
- dữ liệu học sinh nằm tại:
  `/classes/lop-3-3-2026-2027/students/01` ... `/40`

### 2. Không dùng Storage

Trang Storage yêu cầu Upgrade → bỏ qua.
V16 không cần Storage.

## Ảnh học sinh lưu thế nào?

Khi cô tải ảnh:
- website tự nén ảnh còn khoảng 220 px,
- lưu ảnh trong field `photo` của document học sinh,
- mỗi HS có một document riêng nên không dồn 40 ảnh vào cùng một document.

## Nhạc nền dùng chung

1. Chọn bài MP3.
2. Đổi tên thành `music.mp3`.
3. Đặt vào thư mục `music`.
4. Upload cả thư mục `music` lên GitHub Pages.

## Firebase config

File `firebase-config.js` đã được điền sẵn theo project:
- projectId: `vuon-hoa-lop-ba`
- authDomain: `vuon-hoa-lop-ba.firebaseapp.com`

## Đồng bộ dữ liệu cũ

Sau khi chạy V16:
1. nhập Mã lớp,
2. Góc giáo viên,
3. đăng nhập Firebase,
4. bấm **☁️ Đồng bộ dữ liệu máy này lên Firestore**.

## Kiểm tra

Sau khi đồng bộ:
1. mở website trên cửa sổ ẩn danh,
2. nhập Mã lớp,
3. không đăng nhập giáo viên,
4. kiểm tra tên/điểm/ảnh có giống máy cô không,
5. kiểm tra không thấy nút cộng/trừ điểm.
