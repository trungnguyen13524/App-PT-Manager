import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Scan Module - 4 Endpoints (AI Food Scanning)
 */
const scanService = {
  // POST /scan - Phân tích ảnh món ăn (multipart/form-data)
  scanImage: (formData) => apiClient.post(endpoints.SCAN.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000 // Tăng lên 120s (2 phút) để chờ backend quét và đổi vòng lặp API key
  }),
  
  // (Deleted confirmScan as per new API contract)
  
  // GET /scan/history - Lấy lịch sử quét
  getScanHistory: (params) => apiClient.get(endpoints.SCAN.HISTORY, { params }),
  
  // GET /scan/:scanId - Chi tiết một lần quét
  getScanDetail: (scanId) => apiClient.get(endpoints.SCAN.DETAIL.replace(':scanId', scanId)),
};

export default scanService;
