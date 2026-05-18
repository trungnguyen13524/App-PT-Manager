import axios from 'axios';
import storage from '../utils/storage';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Biến để kiểm soát việc làm mới token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Thêm Idempotency-Key cho các request tài chính quan trọng
    if (config.url.includes('/payment/checkout') || config.url.includes('/pt/withdrawals')) {
      if (!config.headers['Idempotency-Key']) {
        const { v4: uuidv4 } = require('uuid'); // Giả sử có uuid, nếu không dùng crypto.randomUUID()
        config.headers['Idempotency-Key'] = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : `idmp-${Date.now()}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp phần data bên trong envelope để store sử dụng gọn hơn
    // Spec: { success: true, data: { ... }, meta: { ... } }
    if (response.data && response.data.success === true) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Bóc tách lỗi từ Error Envelope của BE (RFC 7807 style)
    // Spec: { success: false, error: { code, message, details }, meta: { ... } }
    const apiError = error.response?.data?.error || { 
      code: 'INTERNAL_SERVER_ERROR', 
      message: 'Có lỗi xảy ra, vui lòng thử lại sau.' 
    };

    // Nếu lỗi 401 và không phải là yêu cầu refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Logic Token Reuse Detection (401 TOKEN_REUSE_DETECTED)
      if (apiError.code === 'TOKEN_REUSE_DETECTED') {
        const { useAuthStore } = require('../store/authStore');
        useAuthStore.getState().logout();
        return Promise.reject(apiError);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await storage.getRefreshToken();
      const { useAuthStore } = require('../store/authStore');

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(apiError);
      }

      try {
        // Gọi API refresh token đúng theo spec v1
        const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        // Spec trả về: { data: { accessToken, refreshToken, expiresIn } }
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // Ném apiError ra ngoài để các store/catch xử lý
    return Promise.reject(apiError);
  }
);


export default apiClient;
