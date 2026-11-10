/**
 * =====================================================================
 * HỆ THỐNG ĐỒNG BỘ LEAD FORM VỀ GOOGLE SHEET CHO 500KUSER (MULTI-DOMAIN)
 * =====================================================================
 * Tác giả: 500KUSER Team
 * Hỗ trợ nhận dữ liệu từ nhiều domain khác nhau (Domain tracking)
 * Tự động tạo giao diện bảng tính chuẩn nhận diện thương hiệu, chuyên nghiệp.
 */

// Tên Sheet lưu trữ data khách hàng
const SHEET_NAME = "DATA_KHACH_HANG";

/**
 * HÀM 1: CẤU HÌNH & TRANG TRÍ GOOGLE SHEET ĐẸP MẮT
 * (Chạy hàm này 1 lần duy nhất trong Apps Script để tự động style bảng tính)
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Tiêu đề các cột
  const headers = [
    "STT",
    "Thời Gian",
    "Tên Miền / Domain",
    "Họ Và Tên",
    "Số Điện Thoại / Zalo",
    "Khu Vực Maps",
    "Gói Dịch Vụ",
    "Link Map / Địa Điểm",
    "Ghi Chú Khách Hàng",
    "Trạng Thái Xử Lý",
    "Ghi Chú Nội Bộ / Sales"
  ];

  // Ghi Headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Cố định dòng đầu tiên (Freeze Header)
  sheet.setFrozenRows(1);

  // Style Header (Màu xanh Emerald thương hiệu 500KUSER, chữ trắng đậm, căn giữa)
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange
    .setBackground("#059669")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(11)
    .setFontFamily("Roboto")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  
  sheet.setRowHeight(1, 42);

  // Độ rộng các cột tối ưu cho việc đọc
  const colWidths = [
    60,   // STT
    155,  // Thời Gian
    180,  // Tên Miền
    170,  // Họ Tên
    140,  // SĐT / Zalo
    140,  // Khu Vực
    180,  // Gói
    250,  // Link Map
    200,  // Ghi Chú KH
    140,  // Trạng Thái
    200   // Ghi Chú Sales
  ];

  colWidths.forEach((width, index) => {
    sheet.setColumnWidth(index + 1, width);
  });

  // Tạo Data Validation (Dropdown Menu) cho cột Trạng Thái Xử Lý (Cột J)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "🔥 Mới nhận",
      "📞 Đang liên hệ",
      "🤝 Đang tư vấn",
      "✅ Đã chốt HĐ",
      "⏰ Hẹn gọi lại",
      "❌ Hủy / Sai số"
    ], true)
    .setAllowInvalid(false)
    .build();

  sheet.getRange("J2:J1000").setDataValidation(statusRule);

  // Thêm điều kiện đổi màu tự động (Conditional Formatting) cho cột Trạng Thái
  const rules = [];

  // Mới nhận: Màu vàng nhạt nổi bật
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("🔥 Mới nhận")
    .setBackground("#FEF3C7")
    .setFontColor("#B45309")
    .setRanges([sheet.getRange("J2:J1000")])
    .build());

  // Đã chốt: Màu xanh lá cây
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("✅ Đã chốt HĐ")
    .setBackground("#D1FAE5")
    .setFontColor("#047857")
    .setRanges([sheet.getRange("J2:J1000")])
    .build());

  // Hủy: Màu đỏ nhạt
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("❌ Hủy / Sai số")
    .setBackground("#FEE2E2")
    .setFontColor("#B91C1C")
    .setRanges([sheet.getRange("J2:J1000")])
    .build());

  sheet.setConditionalFormatRules(rules);

  SpreadsheetApp.getActiveSpreadsheet().toast("Đã khởi tạo và làm đẹp bảng tính 500KUSER thành công!", "Thông Báo", 4);
}

/**
 * HÀM 2: TIẾP NHẬN DỮ LIỆU TỪ WEB FORM (POST API)
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Nếu chưa có sheet, tự động chạy setupSheet
    if (!sheet) {
      setupSheet();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Thời gian Việt Nam (GMT+7)
    const timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    // Lấy tên miền nguồn (Domain tracking cho nhiều web vệ tinh)
    const domain = data.domain || data.source_url || "Không xác định";
    const fullName = data.full_name || "";
    const phone = data.phone ? "'" + data.phone : ""; // Thêm dấu ' để Google Sheet không mất số 0 đầu
    const mapRegion = data.map_region || "Maps Việt Nam";
    const servicePackage = data.service_package || "";
    const mapUrl = data.map_url || "";
    const notes = data.notes || "";
    const defaultStatus = "🔥 Mới nhận";

    // Tính STT
    const lastRow = sheet.getLastRow();
    const stt = lastRow > 1 ? lastRow : 1;

    // Dòng dữ liệu mới
    const newRow = [
      stt,
      timestamp,
      domain,
      fullName,
      phone,
      mapRegion,
      servicePackage,
      mapUrl,
      notes,
      defaultStatus,
      "" // Ghi chú Sales để trống
    ];

    sheet.appendRow(newRow);

    const insertedRowIndex = sheet.getLastRow();
    const insertedRange = sheet.getRange(insertedRowIndex, 1, 1, newRow.length);

    // Định dạng dòng vừa thêm: Zebra striping nhạt & font chữ thanh lịch
    const isEven = insertedRowIndex % 2 === 0;
    insertedRange
      .setBackground(isEven ? "#F8FAFC" : "#FFFFFF")
      .setFontFamily("Roboto")
      .setFontSize(10)
      .setVerticalAlignment("middle");

    sheet.getRange(insertedRowIndex, 1).setHorizontalAlignment("center"); // Cột STT
    sheet.getRange(insertedRowIndex, 2).setHorizontalAlignment("center"); // Cột Thời gian
    sheet.getRange(insertedRowIndex, 3).setHorizontalAlignment("center").setFontColor("#0284C7"); // Cột Domain (Highlight xanh dương)
    sheet.getRange(insertedRowIndex, 5).setHorizontalAlignment("center").setFontWeight("bold"); // Cột SĐT
    sheet.getRange(insertedRowIndex, 10).setHorizontalAlignment("center"); // Cột Trạng thái

    // Trả về JSON thành công kèm CORS Header
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Đã lưu thông tin khách hàng thành công!", row: insertedRowIndex }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * HÀM 3: TEST KẾT NỐI (GET API)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "online", message: "500KUSER Google Sheets Web App is running!" }))
    .setMimeType(ContentService.MimeType.JSON);
}
