// CẤU HÌNH TÊN SHEET
const SHEET_NAME = "DATA_KHACH_HANG";

// HÀM 1: CẤU HÌNH & TRANG TRÍ GOOGLE SHEET ĐẸP MẮT
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
  sheet.setFrozenRows(1);

  // Style Header (Màu xanh Emerald #059669, chữ trắng đậm, căn giữa)
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

  // Độ rộng các cột tối ưu
  const colWidths = [60, 155, 180, 170, 140, 140, 180, 250, 200, 140, 200];
  colWidths.forEach((width, index) => {
    sheet.setColumnWidth(index + 1, width);
  });

  // Dropdown cho cột Trạng Thái Xử Lý (Cột J)
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

  // Đổi màu tự động theo trạng thái
  const rules = [];
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("🔥 Mới nhận")
    .setBackground("#FEF3C7")
    .setFontColor("#B45309")
    .setRanges([sheet.getRange("J2:J1000")])
    .build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("✅ Đã chốt HĐ")
    .setBackground("#D1FAE5")
    .setFontColor("#047857")
    .setRanges([sheet.getRange("J2:J1000")])
    .build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("❌ Hủy / Sai số")
    .setBackground("#FEE2E2")
    .setFontColor("#B91C1C")
    .setRanges([sheet.getRange("J2:J1000")])
    .build());

  sheet.setConditionalFormatRules(rules);

  SpreadsheetApp.getActiveSpreadsheet().toast("Đã khởi tạo và trang trí bảng tính 500KUSER thành công!", "Thông Báo", 4);
}

// HÀM 2: TIẾP NHẬN DỮ LIỆU TỪ WEB FORM
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

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

    const timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    const domain = data.domain || data.source_url || "Không xác định";
    const fullName = data.full_name || "";
    const phone = data.phone ? "'" + data.phone : "";
    const mapRegion = data.map_region || "Maps Việt Nam";
    const servicePackage = data.service_package || "";
    const mapUrl = data.map_url || "";
    const notes = data.notes || "";
    const defaultStatus = "🔥 Mới nhận";

    const lastRow = sheet.getLastRow();
    const stt = lastRow > 1 ? lastRow : 1;

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
      ""
    ];

    sheet.appendRow(newRow);

    const insertedRowIndex = sheet.getLastRow();
    const insertedRange = sheet.getRange(insertedRowIndex, 1, 1, newRow.length);
    const isEven = insertedRowIndex % 2 === 0;

    insertedRange
      .setBackground(isEven ? "#F8FAFC" : "#FFFFFF")
      .setFontFamily("Roboto")
      .setFontSize(10)
      .setVerticalAlignment("middle");

    sheet.getRange(insertedRowIndex, 1).setHorizontalAlignment("center");
    sheet.getRange(insertedRowIndex, 2).setHorizontalAlignment("center");
    sheet.getRange(insertedRowIndex, 3).setHorizontalAlignment("center").setFontColor("#0284C7");
    sheet.getRange(insertedRowIndex, 5).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(insertedRowIndex, 10).setHorizontalAlignment("center");

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Đã lưu thành công!", row: insertedRowIndex }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// HÀM 3: TEST KẾT NỐI
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "online", message: "500KUSER API is running!" }))
    .setMimeType(ContentService.MimeType.JSON);
}
