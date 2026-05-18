import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Scan Module - 4 Endpoints (AI Food Scanning)
 */
const scanService = {
  // POST /scan - Phân tích ảnh món ăn (multipart/form-data)
  scanImage: (formData) => apiClient.post(endpoints.SCAN.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // POST /scan/:scanId/confirm - Xác nhận thông tin dinh dưỡng sau khi scan
  confirmScan: (scanId, data) => apiClient.post(endpoints.SCAN.CONFIRM.replace(':scanId', scanId), data),
  
  // GET /scan/history - Lấy lịch sử quét
  getScanHistory: (params) => apiClient.get(endpoints.SCAN.HISTORY, { params }),
  
  // GET /scan/:scanId - Chi tiết một lần quét
  getScanDetail: (scanId) => apiClient.get(endpoints.SCAN.DETAIL.replace(':scanId', scanId)),
};

export default scanService;
