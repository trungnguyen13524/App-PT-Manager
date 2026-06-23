import axios from 'axios';
import storage from '../utils/storage';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://test-nutricoach.onrender.com/api/v1',
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
    if (config.url && (config.url.includes('/payment/checkout') || config.url.includes('/pt/withdrawals'))) {
      const hasIdempotencyKey = config.headers.has ? config.headers.has('Idempotency-Key') : config.headers['Idempotency-Key'];
      if (!hasIdempotencyKey) {
        // Simple fallback UUID v4 generator if crypto is not available
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };

        const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : generateUUID();
        
        if (config.headers.set) {
          config.headers.set('Idempotency-Key', idempotencyKey);
        } else {
          config.headers['Idempotency-Key'] = idempotencyKey;
        }
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
    
    // Tắt tạm log này cho đỡ rối Terminal vì luồng Food Scan đã hoạt động tốt
    /*
    if (error.response?.status === 400 || error.response?.status === 500) {
      console.warn('--- API ERROR LOG ---');
      console.warn('URL:', originalRequest.url);
      console.warn('Method:', originalRequest.method);
      console.warn('Data Sent:', originalRequest.data);
      console.warn('Response Status:', error.response?.status);
      console.warn('Response Error Data:', JSON.stringify(error.response?.data, null, 2));
      console.warn('---------------------');
    }
    */

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
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://test-nutricoach.onrender.com/api/v1';
        const response = await axios.post(`${baseUrl}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        // Spec trả về phẳng không có expiresIn: { data: { accessToken, refreshToken, user } }
        const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;

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
