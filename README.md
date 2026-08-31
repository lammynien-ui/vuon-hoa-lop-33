# VƯỜN HOA LỚP 3.3
Trường Tiểu học Trần Bình Trọng – Năm học 2026–2027

## Chức năng
- 40 học sinh = 40 bông hoa.
- Tải ảnh học sinh vào nhụy hoa.
- Tưới nước để cộng điểm.
- Điểm cộng làm hoa phát triển qua 5 giai đoạn.
- Điểm trừ làm hoa chuyển sang trạng thái "cần được chăm sóc thêm".
- Lựa chọn lý do ghi nhận.
- Huy hiệu theo tiến bộ.
- Mục tiêu chung của cả lớp.
- Chế độ giáo viên bằng PIN.
- Sao lưu và khôi phục dữ liệu JSON.
- Responsive cho máy tính và điện thoại.

## PIN mặc định
3300

Đổi trong file `script.js` tại dòng:
const TEACHER_PIN = "3300";

## Cách đổi tên 40 học sinh
1. Mở website.
2. Bấm "Góc giáo viên".
3. Nhập PIN.
4. Bấm vào từng bông hoa.
5. Gõ tên học sinh vào ô tên.
6. Tải ảnh học sinh.

## Lưu dữ liệu
Phiên bản này lưu bằng `localStorage` của trình duyệt.
Điều đó có nghĩa:
- Dữ liệu vẫn còn khi tải lại trang trên cùng trình duyệt/máy.
- Dữ liệu KHÔNG tự đồng bộ giữa nhiều máy.
- Hãy dùng nút "Sao lưu dữ liệu" thường xuyên.
- Khi đổi máy, dùng "Khôi phục dữ liệu" để nạp file JSON.

## Cách chạy
Chỉ cần mở `index.html` bằng trình duyệt.

Tốt hơn:
- Dùng VS Code + Live Server.
- Hoặc đưa cả thư mục lên GitHub Pages.

## Đưa lên GitHub Pages
1. Tạo repository mới trên GitHub.
2. Upload `index.html`, `style.css`, `script.js`.
3. Vào Settings > Pages.
4. Chọn Deploy from a branch.
5. Branch: main, folder: /(root).
6. Save.
7. Chờ GitHub tạo link website.

## Lưu ý quan trọng về ảnh học sinh
Phiên bản localStorage lưu ảnh trực tiếp trong trình duyệt, phù hợp để chạy trên một máy/lớp học.
Nếu muốn:
- cô cập nhật từ điện thoại,
- mở máy trường vẫn thấy dữ liệu,
- phụ huynh xem cùng một dữ liệu mới nhất,
thì nên chuyển sang Firebase/Supabase.

## Bảo mật
PIN ở phiên bản này nằm trong mã JavaScript nên chỉ là lớp bảo vệ đơn giản, KHÔNG phải bảo mật mạnh.
Nếu triển khai công khai trên Internet và cần quản lý thật, nên dùng Firebase Authentication + Firestore/Storage.


## Cập nhật V2 – âm thanh
- Nút 🎵 Nhạc nền giờ phát/tắt giai điệu dịu nhẹ trực tiếp trên trình duyệt.
- Không cần thêm file MP3.
- Khi tưới nước vẫn có hiệu ứng âm thanh riêng.


## Cập nhật V3
- Có nút "Tải nhạc": giáo viên tự chọn file MP3/audio từ máy.
- File nhạc được lưu bằng IndexedDB của trình duyệt.
- Nút Phát nhạc / Tạm dừng tách riêng.
- Ảnh học sinh trong nhụy hoa được phóng lớn, crop chính giữa, rõ hơn.
- Kích thước đầu hoa được tăng để chân dung dễ nhìn.


## Cập nhật V4 – Bình nước tập thể
- "Mặt trời của lớp" được đổi thành "Bình nước của lớp 3.3".
- Mỗi điểm phát triển của học sinh làm bình đầy thêm.
- Mỗi 100 giọt = 1 bình đầy.
- Khi đầy bình, toàn bộ khu vườn ăn mừng trong khoảng 7 giây:
  - cầu vồng xuất hiện,
  - mưa cánh hoa và giọt nước,
  - bướm/ong bay lên,
  - cả 40 bông hoa nhún nở và sáng hơn,
  - âm thanh chúc mừng ngắn.
- Sau đó bình bắt đầu chu kì 100 giọt tiếp theo.
- Website lưu số lần lớp đã làm đầy bình.


## Cập nhật V5 – Hiệu ứng theo từng mốc
- Hiển thị GVCN: Lâm Mỹ Niên.
- Học sinh luôn nhìn thấy mục "Lời nhắn từ cô Lâm Mỹ Niên" khi mở bông hoa.
- Bình nước có 4 mốc trong mỗi chu kỳ 100 giọt:
  - 25/100: nắng ấm xuất hiện, đốm sáng lấp lánh, âm thanh nhẹ 2 nốt.
  - 50/100: bướm và ong bay vào khu vườn, ánh sáng xanh tươi, âm thanh 3 nốt.
  - 75/100: mưa cánh hoa, hoa nhún nhẹ, ánh sáng hồng tím, âm thanh 4 nốt.
  - 100/100: cầu vồng, ánh sáng vàng, cả 40 bông hoa cùng nở rộ, âm thanh chúc mừng 5 nốt.
- Mốc 100 không lặp lại toàn bộ hiệu ứng của 25/50/75; mỗi mốc có dấu ấn riêng.
- Các mốc chỉ chạy một lần khi lớp vừa đạt đến mốc đó.


## Cập nhật V6 – căn giữa ảnh và tách tên khỏi bông hoa
- Ảnh học sinh được ép nằm đúng giữa nhụy hoa bằng định vị `top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`.
- Tên học sinh được đẩy xuống dưới rõ hơn, có khoảng cách với bông hoa.
- Tên được hiện nhiều dòng khi cần, tránh bị hoa che hoặc cắt mất.


## Cập nhật V6 – Ảnh học sinh và tên
- Ảnh học sinh được đặt chính giữa nhụy hoa.
- Nhụy hoa trở thành khung chân dung tròn lớn, ảnh phủ kín bằng object-fit: cover.
- Tên học sinh được đưa hẳn xuống dưới hoa, có vùng riêng nên cánh hoa không che tên.
- Tăng khoảng cách giữa các ô học sinh để khu vườn thoáng và dễ đọc hơn.
- Hiển thị trên điện thoại cũng được điều chỉnh lại.


## Cập nhật V7 – Nhiều loại hoa và căn tâm chính xác
- Sửa lại toàn bộ hình học của bông hoa.
- Nhụy/ảnh và toàn bộ cánh dùng cùng một tâm tuyệt đối 50% / 50%.
- Ảnh học sinh nằm đúng giữa bông hoa, không lệch theo cánh.
- 40 học sinh được phân bổ luân phiên qua 10 kiểu hoa khác nhau:
  - cúc nhiều cánh,
  - hướng dương,
  - hoa 5 cánh,
  - cosmos,
  - cánh tim,
  - cánh nhọn hình sao,
  - hoa hai tầng,
  - hoa cánh rộng,
  - lily,
  - hoa mini nhiều cánh.
- Mỗi kiểu vẫn có phối màu khác nhau nên khu vườn đa dạng hơn.
- Tên học sinh được tách xa thêm khỏi bông hoa.


## Cập nhật V8 – Hoa đẹp hơn + thêm chatbot
- Thiết kế lại bông hoa theo hướng gọn, sạch và cân đối hơn.
- Giảm mức phóng to khi hoa nở để các bông không chồng lên nhau.
- Tăng khoảng cách trong lưới để khu vườn thoáng, đỡ rối.
- Tạo lại nhiều kiểu hoa nhưng theo phong cách đồng bộ, dễ nhìn hơn.
- Ảnh học sinh vẫn nằm ở chính giữa nhụy hoa.
- Thêm chatbot góc dưới bên phải:
  - giáo viên và học sinh có thể đặt câu hỏi,
  - chatbot trả lời về cách dùng website, cách cộng điểm, Bình nước, lời nhắn, tải ảnh, đăng nhập giáo viên...
- Đây là chatbot nội bộ theo từ khóa, chưa phải AI có kết nối Internet/API.


## Cập nhật V8 – Hoa gọn + chatbot
### Hoa
- Bỏ kiểu hoa có cánh quá dài.
- Mỗi bông luôn nằm trong khung 118 x 118 px nên không chồng lên hoa bên cạnh khi nở.
- Điểm cao làm hoa nở đầy, sáng và rõ hơn nhưng không phóng kích thước vượt ô.
- Có 8 dáng hoa gọn khác nhau: 5 cánh, 6 cánh, cúc, hướng dương, cánh tròn, cánh nhọn, hoa hai tầng, cánh mềm.
- Ảnh học sinh nằm đúng giữa nhụy.

### Chatbot
- Nút 💬 ở góc phải.
- Chạy ngay với các câu hỏi nội bộ về khu vườn, điểm, Bình nước, lời nhắn và GVCN.
- Có sẵn file `api/chat.js` để kết nối chatbot AI khi triển khai bằng Vercel.
- Không đặt API key trong trình duyệt.
- Để bật AI: triển khai dự án trên Vercel, đặt biến môi trường `OPENAI_API_KEY`, sau đó đặt `CHAT_API_ENDPOINT="/api/chat"` trong `script.js`.


## Cập nhật V9 – Bộ hoa minh họa SVG
- Thay toàn bộ hoa CSS bằng hoa SVG minh họa, nét mềm và cân đối hơn.
- Có 10 kiểu hoa khác nhau: cúc, hướng dương, 5 cánh, cosmos, cánh tim, aster, hai tầng, cánh bầu, sen cách điệu, mini nhiều cánh.
- Mỗi bông luôn nằm trong viewBox 120 × 120 nên không thể tràn/chồng sang ô khác.
- Ảnh học sinh nằm đúng chính giữa nhụy.
- Điểm cao làm hoa nở đầy hơn nhưng không làm bông vượt kích thước ô.
- Chatbot V8 được giữ nguyên.


## Cập nhật V10 – bản sửa lỗi ổn định
- Xóa chatbot cũ bị trùng ID/biến JavaScript với chatbot mới.
- Sửa lỗi JavaScript khiến toàn bộ website dừng chạy.
- 40 học sinh luôn hiển thị thành 40 bông hoa, kể cả khi 0 điểm.
- Ảnh/nhụy giữ nguyên kích thước; chỉ cánh hoa bung dần theo 5 mức.
- Điểm càng cao: cánh càng đầy, màu càng tươi và sáng hơn.
- Đã kiểm tra cú pháp JavaScript và các ID chatbot không còn trùng.

- V10.1: Tải nhạc có cơ chế dự phòng. Nếu IndexedDB bị chặn khi mở file trực tiếp, nhạc vẫn phát trong phiên hiện tại.


## Cập nhật V11 – Chatbot đọc dữ liệu thật
- Chatbot không còn chỉ trả lời các câu mẫu.
- Có thể hỏi: “Bông hoa của Minh Anh được bao nhiêu điểm rồi?”
- Bot dò tên trong danh sách 40 học sinh, kể cả khi câu hỏi chỉ dùng 2–3 từ cuối của họ tên.
- Trả lời điểm hiện tại và giai đoạn phát triển của bông hoa.
- Có thể hỏi lời nhắn của cô dành cho một học sinh.
- Có thể hỏi tiến độ Bình nước/cả lớp.
- Làm được phép tính cơ bản: +, -, ×, ÷ và các từ “cộng, trừ, nhân, chia”.
- Không cung cấp bảng xếp hạng học sinh.
- Những câu hỏi tự do ngoài các khả năng trên vẫn cần kết nối AI backend.


## Cập nhật V12 – Cảnh ngày đêm và thời tiết
- Khu vườn có chu kỳ tự động:
  - ban ngày trời nắng,
  - đôi lúc trời mưa,
  - sau đó có thể xuất hiện cầu vồng,
  - rồi chuyển sang buổi tối.
- Hiệu ứng đi kèm:
  - ☀️ mặt trời,
  - 🌙 mặt trăng,
  - ☁️ mây trôi,
  - 🌧 hạt mưa rơi,
  - ✦ sao lấp lánh ban đêm,
  - 🌈 cầu vồng.
- Có nhãn trạng thái nhỏ ở góc trên của khu vườn.
- Cảnh đầu tiên sẽ ưu tiên theo giờ thực tế: buổi tối mở web sẽ vào cảnh đêm trước.


## Cập nhật V12 – Bầu trời sống động
- Thêm hiệu ứng bầu trời động cho khu vườn.
- Website tự luân phiên qua 5 trạng thái:
  - 🌤 Ban ngày dịu nhẹ
  - ☀️ Trời nắng
  - 🌧️ Trời mưa
  - 🌈 Cầu vồng sau mưa
  - 🌙 Buổi đêm
- Có nút **🌤 Bầu trời** để cô tự đổi nhanh trạng thái.
- Trời mưa có hạt mưa và gợn nước.
- Buổi đêm có mặt trăng và các ngôi sao lấp lánh.
- Trời nắng có ánh sáng vàng và tia nắng.
- Sau mưa có cầu vồng hiện trên bầu trời.
- Chatbot cũng hiểu và trả lời được câu hỏi về thời tiết hiện tại của khu vườn.


## Cập nhật V13 – Nàng tiên Bướm
- Mỗi ngày khu vườn có 1 thông điệp tích cực riêng.
- Khi mở website lần đầu trong ngày, Nàng tiên Bướm bay vào, để lại thông điệp rồi bay đi.
- Thông điệp chỉ tự xuất hiện 1 lần/ngày trên cùng trình duyệt.
- Có nút **🦋 Thông điệp hôm nay** để mở lại bất cứ lúc nào.
- Có hơn 60 thông điệp tích cực phù hợp học sinh tiểu học.
- Cùng một ngày sẽ luôn ra cùng một thông điệp.
- Có hiệu ứng ánh sáng nhẹ và âm thanh chuông nhỏ khi Nàng tiên Bướm xuất hiện.
- Chatbot có thể trả lời câu hỏi: “Thông điệp hôm nay là gì?” hoặc “Nàng tiên Bướm nhắn gì?”.


## Cập nhật V14 – Firebase dùng chung cho PH/HS
- Bản website có thể kết nối Firebase để tất cả thiết bị thấy cùng một khu vườn.
- Firestore đồng bộ dữ liệu lớp theo thời gian thực.
- Firebase Storage lưu ảnh học sinh và nhạc nền.
- Firebase Authentication dùng cho tài khoản giáo viên.
- PH/HS mở link ở chế độ chỉ xem, không cần tài khoản.
- Có trạng thái đồng bộ ngay trên thanh công cụ.
- Có nút chuyển dữ liệu localStorage/ảnh cũ lên Firebase.
- Nếu chưa cấu hình Firebase, website vẫn chạy ở chế độ cục bộ để thử.
- Xem hướng dẫn đầy đủ trong `FIREBASE_SETUP.md`.


## Cập nhật V15 – Mã lớp 3.3
- Thêm màn hình khóa trước khi vào khu vườn.
- PH/HS phải nhập đúng Mã lớp.
- Mã không lưu dạng chữ rõ; website so sánh SHA-256.
- Ghi nhớ quyền truy cập trong `sessionStorage`, không lưu vĩnh viễn.
- Sai 5 lần sẽ khóa tạm 30 giây.
- Giáo viên có nút **🔒 Khóa lại cổng lớp**.
- Có file `TAO_MA_LOP.html` để tự tạo hash cho mã mới.
- Mã mẫu để thử: `33-2026`.
- Cần đổi mã mẫu trước khi sử dụng thật.


## V16 – Spark miễn phí, không Firebase Storage
- Bỏ Firebase Storage để không cần nâng cấp Blaze.
- Ảnh HS nén nhỏ và lưu trong 40 document Firestore riêng.
- Nhạc dùng file `music/music.mp3` trên GitHub Pages.
- Firebase config đã được điền theo project `vuon-hoa-lop-ba`.
- Firestore Rules V16 hỗ trợ subcollection `students`.


## V17 – Chẩn đoán đăng nhập Firebase
- Hiện trực tiếp mã lỗi Firebase trong cửa sổ Góc giáo viên.
- Có nút `🧪 Kiểm tra Firebase` để xem project/auth domain/phiên hiện tại.
- Có nút `🔑 Gửi email đặt lại mật khẩu` từ đúng project mà website đang kết nối.
- Tách Authentication khỏi Firestore: đăng nhập thành công sẽ không bị báo nhầm là thất bại nếu bước tạo dữ liệu Firestore lỗi.
- Sửa vị trí trạng thái Firestore để không chồng lên các nút.


## V18 – Xóa chế độ thử khỏi website công khai
- Xóa hoàn toàn phần “Chỉ thử trên máy này”.
- Không còn hiển thị hoặc sử dụng PIN thử nghiệm 3300.
- Không còn chế độ quản trị cục bộ dành cho PH/HS.
- Góc giáo viên chỉ hoạt động khi đăng nhập Firebase Authentication thành công.
- Giữ nguyên công cụ chẩn đoán đăng nhập Firebase của V17.


## V19 – Firebase API key đã sửa chính xác
- Thay API key Firebase theo đúng cấu hình copy trực tiếp từ Firebase Console.
- Sửa lỗi nhầm chữ `O` và số `0` trong API key.
- Giữ nguyên V18: không còn chế độ thử/PIN 3300 trên website công khai.
- Giữ nguyên chẩn đoán đăng nhập Firebase.
- Giữ nguyên Firestore, mã lớp, chatbot, hiệu ứng thời tiết, Nàng tiên Bướm, 40 bông hoa.


## V20 – Âm thanh khu vườn
- Sửa hoàn toàn âm thanh cộng/trừ điểm.
- +1: tiếng giọt nước + chuông tích cực.
- +2: hai giọt nước + chuông vui hơn.
- -1: âm chăm sóc nhẹ, không mang cảm giác phạt.
- Thêm nút `🔊 Hiệu ứng: Bật/Tắt`, lưu lựa chọn trên thiết bị.
- Ưu tiên nhạc riêng của lớp tại `music/music.mp3`.
- Nếu file MP3 thiếu hoặc lỗi, tự động phát `music/default-garden.wav`.
- `default-garden.wav` là bản nhạc nền nhẹ do hệ thống tạo riêng cho khu vườn.
- Nút chọn nhạc thử chỉ hiện cho giáo viên.
- Sửa hàm `animateWater()` và `ping()` bị thiếu ở các phiên bản trước.
- Sau đăng nhập thành công, trạng thái lỗi cũ được xóa.


## V21 – Bài Trúc An dùng trực tiếp từ GitHub
- File nhạc hiện có trong repository: `Trúc An.mp3` ở thư mục gốc.
- Website trỏ trực tiếp tới file đó bằng đường dẫn `Tr%C3%BAc%20An.mp3`.
- Không sửa, không chuyển đổi, không đổi tên file bài hát.
- Nút `🎵 Bật nhạc` / `🔇 Tắt nhạc`.
- Nhạc lặp khi bật.
- Không autoplay: người dùng bấm Bật nhạc một lần theo chính sách trình duyệt.
- Âm thanh tưới nước, cộng/trừ điểm của V20 hoạt động riêng.
- Xóa cơ chế nhạc cục bộ cũ để tránh ghi đè bài Trúc An.
