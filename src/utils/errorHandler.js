/**
 * Xử lý lỗi thống nhất cho toàn bộ ứng dụng.
 * Nhận error object từ Axios hoặc Error throw ra, và trả về một chuỗi thân thiện với người dùng.
 * 
 * @param {Error|Object} error - Error object từ try/catch hoặc Axios
 * @param {string} fallbackMessage - Tin nhắn mặc định nếu không parse được lỗi
 * @returns {string} Tin nhắn lỗi đã được chuẩn hóa để hiện lên UI
 */
export const handleApiError = (error, fallbackMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.') => {
  console.error('[API Error]:', error); // Giữ lại log để debug ở phía dev

  // 1. Lỗi từ phía Server trả về (Axios bắt được response)
  if (error.response) {
    // Thường BE sẽ trả về cấu trúc có message như: { data: { message: "Sai mật khẩu" } }
    const serverMessage = error.response.data?.message;
    if (serverMessage) return serverMessage;

    // Các HTTP status code chung chung nếu BE không trả message cụ thể
    const status = error.response.status;
    if (status === 401) return 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    if (status === 404) return 'Không tìm thấy dữ liệu yêu cầu.';
    if (status >= 500) return 'Hệ thống đang bảo trì hoặc quá tải. Vui lòng thử lại sau.';
  }

  // 2. Lỗi do không thể kết nối tới Server (Mạng yếu, Server sập, bị chặn CORS)
  if (error.request) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng của bạn.';
  }

  // 3. Các lỗi logic khác trong quá trình setup request hoặc lỗi JS thuần
  if (error.message) {
    // Nếu là lỗi "Network Error" đặc trưng của Axios
    if (error.message.includes('Network Error')) {
      return 'Lỗi mạng kết nối. Vui lòng kiểm tra WiFi/4G.';
    }
    // Trả về error.message gốc hoặc fallback
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};
