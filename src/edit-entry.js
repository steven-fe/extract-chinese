import _ from "lodash";
import fs from "node:fs";

(async () => {
  const filePath =
    "/Users/steven/Desktop/work/code/coinstore-web/src/lang/languages/vi_VN/user.js";

  const { default: content } = await import(filePath);
  const editContent = {
    section: 'user',
    dicts: {
      status: {
        msg: "Đơn xin KYC Nâng cao của bạn không thành công. Vui lòng xem xét thông tin của bạn kỹ lưỡng trước khi nộp đơn lại. Bạn cần đợi một giờ trước khi nộp đơn khác. Cảm ơn bạn đã hợp tác và thông cảm."
      },
      inputParams: {
        msg: "Vui lòng cung cấp số định danh của giấy phép do chính phủ cấp, như hộ chiếu, thẻ căn cước hoặc bằng lái xe. Số này xác định duy nhất tài liệu của bạn và giúp chúng tôi xác minh danh tính của bạn một cách chính xác.",
        errorMsg: 'Vui lòng nhập Số Định danh chính xác'
      },
      tip: {
        screenshot: 'Chụp màn hình',
        upload: 'Tải lên',
        imageUploadCompleted: 'Tải lên hình ảnh hoàn tất',
        imageFileSizeError: 'Vui lòng giữ kích thước hình ảnh dưới 20 MB',
        uploadTitle1: 'Giấy tờ tùy thân do chính phủ cấp:',
        uploadTips1: '1. Cung cấp ảnh chụp cận cảnh rõ ràng của giấy tờ tùy thân hợp lệ do chính phủ cấp.<br />2. Đảm bảo số tài liệu trùng khớp với thông tin được cung cấp trong KYC1.<br />3. Bốn góc của giấy tờ tùy thân phải hiển thị rõ trong ảnh.<br />4. Ảnh nên hiển thị mặt của giấy tờ tùy thân có hình ảnh khuôn mặt của bạn.<br />5. Sử dụng PNG, JPEG hoặc JPG dưới 20 MB.',
        uploadTitle2: 'Ảnh giấy tờ cầm tay:',
        uploadTips2: '1. Cầm giấy tờ tùy thân do chính phủ cấp trên một tay.<br />2. Trên tay kia, cầm một tờ giấy có thông tin viết tay sau đây:<br />·UID Coinstore của bạn (ID Người dùng)<br />·Chữ ký của bạn<br />·Ngày nộp tài liệu hiện tại (mm/dd/yyyy)<br />3. Đảm bảo khuôn mặt đầy đủ và thông tin viết tay trên giấy hiển thị rõ ràng trong ảnh.<br />4. Chữ viết tay phải rõ ràng và dễ đọc.<br />5. Sử dụng PNG, JPEG hoặc JPG dưới 20 MB.',
        nextApplyTime: 'Thời gian kích hoạt lại cho xác minh KYC nâng cao',
        advancedKYCDisabled: 'KYC Nâng cao đã bị Vô hiệu hóa'
      }
    }
  };

  const result = _.merge(content, editContent);

  fs.writeFileSync(filePath, `export default ${JSON.stringify(result)}`);
})();
