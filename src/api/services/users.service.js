import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Users Module - 7 Endpoints
 */
const usersService = {
  // GET /users/me - Lấy thông tin cá nhân
  getMe: () => apiClient.get(endpoints.USERS.ME),
  
  // PATCH /users/me - Cập nhật thông tin cá nhân
  updateMe: (data) => apiClient.patch(endpoints.USERS.ME, data),
  
  // POST /users/me/onboarding - Hoàn thành khảo sát ban đầu
  submitOnboarding: (data) => apiClient.post(endpoints.USERS.ONBOARDING, data),
  
  // GET /users/me/metrics - Lấy chỉ số cơ thể (cân nặng, chiều cao, BMI...)
  getMetrics: () => apiClient.get(endpoints.USERS.METRICS),
  
  // POST /users/me/change-password - Đổi mật khẩu
  changePassword: (data) => apiClient.post(endpoints.USERS.CHANGE_PASSWORD, data),
  
  // DELETE /users/me - Xóa tài khoản
  deleteAccount: (data) => apiClient.delete(endpoints.USERS.ME, { data }),
  
  // POST /users/me/avatar - Cập nhật ảnh đại diện (sau khi đã có URL từ upload service)
  updateAvatar: (fileKey) => apiClient.post(endpoints.USERS.AVATAR, { fileKey }),
};

export default usersService;
