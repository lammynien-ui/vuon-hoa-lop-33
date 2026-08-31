# HƯỚNG DẪN BẬT FIREBASE CHO VƯỜN HOA 3.3

Sau khi hoàn thành các bước dưới đây, cô chỉ cần gửi **một link website duy nhất** cho PH/HS.
Cô cập nhật trên điện thoại hoặc máy tính, mọi người sẽ thấy dữ liệu mới nhất.

## 1. Tạo Firebase Project

1. Mở Firebase Console.
2. Chọn **Create a project / Add project**.
3. Đặt tên, ví dụ: `vuon-hoa-lop-33`.
4. Hoàn tất tạo project.

## 2. Tạo Web App và lấy firebaseConfig

1. Trong trang Overview của project, chọn biểu tượng **Web `</>`**.
2. Đặt nickname, ví dụ `Vuon hoa 3.3`.
3. Firebase sẽ hiện đoạn:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

4. Mở file `firebase-config.js` của bộ website.
5. Thay các dòng `PASTE_...` bằng đúng giá trị Firebase vừa cấp.

**Không đặt mật khẩu giáo viên trong file này.**

## 3. Bật tài khoản giáo viên

Trong Firebase:

1. Vào **Build → Authentication**.
2. Chọn **Get started**.
3. Trong **Sign-in method**, bật **Email/Password**.
4. Vào tab **Users → Add user**.
5. Tạo **1 tài khoản email + mật khẩu chỉ dành cho cô Lâm Mỹ Niên**.

Khi quản lý website, cô bấm **🔐 Góc giáo viên** và đăng nhập tài khoản này.

PH/HS **không cần đăng nhập**; họ chỉ xem.

## 4. Bật Firestore Database

1. Vào **Build → Firestore Database → Create database**.
2. Chọn location phù hợp.
3. Sau khi tạo, vào tab **Rules**.
4. Copy toàn bộ nội dung file `firestore.rules` trong bộ website vào.
5. Bấm **Publish**.

Firestore dùng để đồng bộ:
- 40 tên học sinh
- điểm phát triển
- trạng thái hoa
- lời nhắn
- Bình nước
- lịch sử thao tác gần nhất
- URL ảnh và nhạc

## 5. Bật Firebase Storage

1. Vào **Build → Storage**.
2. Tạo bucket nếu Firebase yêu cầu.
3. Vào tab **Rules**.
4. Copy nội dung file `storage.rules`.
5. Bấm **Publish**.

Storage dùng để lưu:
- ảnh 40 học sinh
- bài nhạc nền của lớp

**Lưu ý:** tùy chính sách/tài khoản Firebase tại thời điểm cô tạo project, Storage có thể yêu cầu cấu hình billing. Firebase Console sẽ báo rõ nếu cần.

## 6. Chuyển dữ liệu V13 đang có trên máy lên Firebase

Sau khi Firebase đã cấu hình:

1. Mở website trên **đúng máy/trình duyệt đang có dữ liệu cũ**.
2. Bấm **🔐 Góc giáo viên**.
3. Đăng nhập tài khoản Firebase của cô.
4. Bấm **☁️ Đưa dữ liệu máy này lên Firebase**.
5. Chờ thông báo **Đã chuyển dữ liệu hiện tại lên Firebase**.

Website sẽ:
- tải ảnh học sinh cũ lên Storage,
- tải nhạc cũ nếu có,
- đưa tên/điểm/lời nhắn lên Firestore.

Sau đó các máy khác sẽ thấy cùng dữ liệu.

## 7. Đưa website lên GitHub Pages

Upload các file/thư mục của bản V14 lên repository GitHub, đặc biệt phải có:

- `index.html`
- `style.css`
- `script.js`
- `firebase-config.js`
- các file/thư mục còn lại

Sau đó:

1. **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main`
4. Folder: `/(root)`
5. Save

GitHub sẽ tạo link dạng:

`https://TEN-GITHUB.github.io/vuon-hoa-33/`

Gửi đúng link đó cho PH/HS.

## 8. Cách sử dụng hằng ngày

### PH/HS
- Mở link.
- Xem cùng một khu vườn.
- Xem bông hoa, ảnh, lời nhắn.
- Xem Bình nước, thời tiết, Nàng tiên Bướm, chatbot.
- Không có quyền cộng/trừ điểm hay sửa dữ liệu.

### Giáo viên
- Mở cùng link.
- Bấm **Góc giáo viên**.
- Đăng nhập Firebase.
- Cộng điểm, trừ điểm, đổi tên, tải ảnh, viết lời nhắn, đổi nhạc.
- Mọi thay đổi tự đồng bộ gần như ngay lập tức.

## 9. Quyền riêng tư

Bộ Rules đi kèm cho phép **bất kỳ ai có đường link** đọc dữ liệu khu vườn, vì PH/HS không phải đăng nhập.

Do website có thể chứa **họ tên, ảnh và thông tin tiến bộ của học sinh**, trước khi chia sẻ cô nên:
- chỉ gửi link trong nhóm lớp;
- bảo đảm việc sử dụng ảnh học sinh phù hợp quy định/đồng thuận của nhà trường và cha mẹ học sinh;
- nếu cần kín hơn, có thể nâng cấp tiếp thành **PH/HS phải đăng nhập hoặc nhập mã lớp**.

## 10. Nếu website báo “Chưa cấu hình Firebase”

Kiểm tra:
- file `firebase-config.js` đã thay hết `PASTE_...` chưa;
- `projectId`, `storageBucket`, `appId` có đúng không;
- Authentication đã bật Email/Password chưa;
- Firestore/Storage Rules đã Publish chưa.


# V15 – Bật Mã lớp cho PH/HS

Bản V15 có thêm cổng vào trước khi hiện khu vườn.

## Mã mẫu để thử

Mã mẫu hiện tại là:

`33-2026`

**Cô nên đổi mã này trước khi gửi link thật cho PH/HS.**

## Cách đổi mã lớp

1. Mở file `TAO_MA_LOP.html`.
2. Nhập mã mới cô muốn dùng, ví dụ một mã khó đoán hơn.
3. Bấm **Tạo SHA-256**.
4. Copy chuỗi được tạo.
5. Mở `firebase-config.js`.
6. Thay giá trị:

```js
window.VUONHOA_CLASS_ACCESS_CODE_HASH = "...";
```

bằng chuỗi mới.
7. Upload lại `firebase-config.js` lên GitHub.

## PH/HS sẽ dùng như thế nào?

1. Mở link website.
2. Thấy màn hình **Vườn hoa lớp 3.3 – Nhập Mã lớp**.
3. Nhập đúng mã cô đã gửi riêng trong nhóm lớp.
4. Bấm **Vào khu vườn**.
5. Trong cùng phiên trình duyệt, website nhớ quyền truy cập.
6. Khi đóng tab/trình duyệt rồi vào lại, có thể phải nhập mã lại.

## Nếu nhập sai nhiều lần

Sau 5 lần sai liên tiếp, cổng tạm khóa trong 30 giây.

## Mức độ bảo mật

Cổng Mã lớp giúp:
- người có link nhưng không có mã khó vào xem trực tiếp;
- giảm việc link bị chuyển tiếp ngoài nhóm lớp;
- phù hợp như một lớp riêng tư bổ sung cho website lớp.

Tuy nhiên đây vẫn là **mã kiểm tra phía trình duyệt**. Nó không thay thế hệ thống tài khoản/mật khẩu phía máy chủ. Với dữ liệu cần bảo mật cao, nên dùng tài khoản riêng hoặc xác thực phía server.
