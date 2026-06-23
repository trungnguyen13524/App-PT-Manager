import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

const authService = {
  // POST /auth/register
  register: (data) => apiClient.post(endpoints.AUTH.REGISTER, data),
  
  // POST /auth/login
  login: (email, password) => apiClient.post(endpoints.AUTH.LOGIN, { email, password }),
  
  // POST /auth/refresh
  refreshToken: (token) => apiClient.post(endpoints.AUTH.REFRESH, { refreshToken: token }),
  
  // POST /auth/logout
  logout: (token) => apiClient.post(endpoints.AUTH.LOGOUT, { refreshToken: token }),
  
  // POST /auth/logout-all
  logoutAll: () => apiClient.post(endpoints.AUTH.LOGOUT_ALL),

  // GET /auth/me
  getMe: () => apiClient.get(endpoints.AUTH.ME),
  
  // POST /auth/verify-email
  verifyEmail: (token) => apiClient.post(endpoints.AUTH.VERIFY_EMAIL, { token }),
  
  // POST /auth/resend-verification
  resendVerification: () => apiClient.post(endpoints.AUTH.RESEND_VERIFICATION),

  // POST /auth/forgot-password
  forgotPassword: (email) => apiClient.post(endpoints.AUTH.FORGOT_PASSWORD, { email }),
  
  // POST /auth/reset-password
  resetPassword: (token, newPassword) => apiClient.post(endpoints.AUTH.RESET_PASSWORD, { token, newPassword }),
};

export default authService;
