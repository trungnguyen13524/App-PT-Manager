import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Upload Module - AWS S3 Presigned URL
 */
const uploadService = {
  // GET /upload/presigned-url - Lấy URL để upload file trực tiếp lên S3
  // Params: { fileType, purpose, fileSizeBytes? }
  getPresignedUrl: (params) => apiClient.get(endpoints.UPLOAD.PRESIGNED_URL, { params }),
};

export default uploadService;
