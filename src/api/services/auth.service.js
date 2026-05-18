import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Auth Module - 11 Endpoints
 */
const authService = {
  // POST /auth/register - Đăng ký tài khoản
  register: (data) => apiClient.post(endpoints.AUTH.REGISTER, data),
  
  // POST /auth/login - Đăng nhập truyền thống
  login: (email, password) => apiClient.post(endpoints.AUTH.LOGIN, { email, password }),
  
  // POST /auth/google - Đăng nhập Google
  googleLogin: (idToken) => apiClient.post(endpoints.AUTH.GOOGLE, { idToken }),
  
  // POST /auth/apple - Đăng nhập Apple
  appleLogin: (data) => apiClient.post(endpoints.AUTH.APPLE, data),
  
  // POST /auth/refresh - Làm mới Access Token (Rotation)
  refreshToken: (token) => apiClient.post(endpoints.AUTH.REFRESH, { refreshToken: token }),
  
  // POST /auth/logout - Đăng xuất thiết bị hiện tại
  logout: (token) => apiClient.post(endpoints.AUTH.LOGOUT, { refreshToken: token }),
  
  // POST /auth/logout-all - Đăng xuất khỏi tất cả thiết bị
  logoutAll: () => apiClient.post(endpoints.AUTH.LOGOUT_ALL),
  
  // POST /auth/forgot-password - Yêu cầu khôi phục mật khẩu
  forgotPassword: (email) => apiClient.post(endpoints.AUTH.FORGOT_PASSWORD, { email }),
  
  // POST /auth/reset-password - Đặt lại mật khẩu mới
  resetPassword: (token, newPassword) => apiClient.post(endpoints.AUTH.RESET_PASSWORD, { token, newPassword }),
  
  // POST /auth/verify-email - Xác thực email
  verifyEmail: (token) => apiClient.post(endpoints.AUTH.VERIFY_EMAIL, { token }),
  
  // POST /auth/resend-verification - Gửi lại email xác thực
  resendVerification: () => apiClient.post(endpoints.AUTH.RESEND_VERIFICATION),
};

export default authService;
