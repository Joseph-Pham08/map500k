# HƯỚNG DẪN KẾT NỐI FORM 500KUSER VỀ GOOGLE SHEET (HỖ TRỢ NHIỀU DOMAIN)

Tài liệu này hướng dẫn bạn cách tạo một bảng tính **Google Sheet chuyên nghiệp, tự động định dạng đẹp mắt**, có cột **Tên Miền / Domain** để phân loại khách hàng khi bạn nhân bản landing page ra nhiều domain khác nhau.

---

## BƯỚC 1: TẠO GOOGLE SHEET MỚI & MỞ APPS SCRIPT
1. Truy cập [sheets.new](https://sheets.new) để tạo 1 file Google Sheets mới.
2. Đổi tên Google Sheet thành: **`500KUSER - Quản Lý Khách Hàng Maps`**.
3. Trên thanh menu, chọn: **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.

---

## BƯỚC 2: DÁN ĐOẠN CODE GOOGLE APPS SCRIPT
1. Xóa hết code mẫu mặc định `function myFunction() { ... }` trong ô soạn thảo.
2. Mở file [google-apps-script.js](./google-apps-script.js) trong dự án của bạn, copy toàn bộ code và dán vào Apps Script.
3. Bấm biểu tượng **Lưu (Save / Ctrl + S)**.

---

## BƯỚC 3: CHẠY HÀM TRANG TRÍ BẢNG TÍNH ĐẸP MẮT (CHẠY 1 LẦN)
1. Ở thanh công cụ trên cùng của Apps Script, tại ô chọn hàm, chọn hàm **`setupSheet`**.
2. Bấm nút **Chạy (Run)**.
3. Nếu Google hiện bảng hỏi cấp quyền (*Authorization Required*):
   - Bấm **Xem quyền (Review Permissions)** ➔ Chọn tài khoản Google của bạn.
   - Bấm **Nâng cao (Advanced)** ➔ Chọn **Đi tới Untitled project (không an toàn)**.
   - Bấm **Cho phép (Allow)**.
4. Quay lại trang Google Sheet, bạn sẽ thấy bảng tính đã được tự động định dạng cực đẹp:
   - Header màu **Xanh ngọc Emerald `#059669`**, chữ trắng in đậm, cố định dòng đầu tiên.
   - Các cột: **STT, Thời Gian, Tên Miền / Domain, Họ Và Tên, Số Điện Thoại / Zalo, Khu Vực Maps, Gói Dịch Vụ, Link Map / Địa Điểm, Ghi Chú Khách Hàng, Trạng Thái Xử Lý, Ghi Chú Sales**.
   - Cột **Trạng thái** có sẵn Dropdown chọn nhanh (*🔥 Mới nhận, 📞 Đang liên hệ, 🤝 Đang tư vấn, ✅ Đã chốt HĐ, ⏰ Hẹn gọi lại, ❌ Hủy / Sai số*) và tự đổi màu theo trạng thái.

---

## BƯỚC 4: DEPLOY THÀNH WEB APP ĐỂ NHẬN DỮ LIỆU TỪ WEB
1. Ở góc trên bên phải của Apps Script, bấm nút **Triển khai (Deploy)** ➔ Chọn **Tùy chọn triển khai mới (New deployment)**.
2. Bấm biểu tượng bánh răng ⚙️ bên cạnh chữ *Select type* ➔ Chọn **Ứng dụng web (Web app)**.
3. Cấu hình chính xác như sau:
   - **Mô tả (Description):** `500kuser Form API`
   - **Thực thi dưới dạng (Execute as):** **Tôi (Me / email của bạn)**
   - **Người có quyền truy cập (Who has access):** **Bất kỳ ai (Anyone)** *(Rất quan trọng, để form từ các domain gửi data vào được)*
4. Bấm **Triển khai (Deploy)**.
5. Sao chép đường dẫn **URL ứng dụng web (Web app URL)** (có dạng: `https://script.google.com/macros/s/AKfycby.../exec`).

---

## BƯỚC 5: DÁN URL VÀO FILE `index.html`
Mở file `index.html`, tìm đến dòng cấu hình ở cuối trang (khoảng dòng 1740):

```javascript
// Dán link Web App bạn vừa copy ở Bước 4 vào giữa 2 dấu ngoặc kép:
const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycby.../exec";
```

Bấm lưu file và đẩy lên GitHub hoặc máy chủ của bạn!

---

## TÍNH NĂNG NHẬN DIỆN MULTI-DOMAIN HOẠT ĐỘNG THẾ NÀO?
Khi bạn clone landing page sang bất kỳ domain nào (ví dụ: `domain1.vn`, `reviewmap5sao.com`, `500kuser.vn`...):
- Form sẽ tự động lấy `window.location.hostname` của trang web đó và gửi kèm vào cột **Tên Miền / Domain**.
- Bạn chỉ cần dùng **1 file Google Sheet duy nhất** để quản lý khách hàng từ tất cả các web vệ tinh mà không sợ bị nhầm lẫn nguồn khách!
