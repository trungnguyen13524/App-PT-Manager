import axios from 'axios';
import { keysToCamelCase, keysToSnakeCase } from '../utils/formatters';
import { getToken } from '../utils/security';

// Cấu hình base URL (sau này thay bằng URL thật từ file .env)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.nutricoach.example.com/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: Xử lý Request trước khi gửi đi
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Chuyển đổi payload (nếu có) từ camelCase sang snake_case cho BE
    if (config.data) {
      config.data = keysToSnakeCase(config.data);
    }

    // 2. Gắn Token (Lấy từ SecureStore)
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR: Xử lý Response sau khi nhận về
apiClient.interceptors.response.use(
  (response) => {
    // Chuyển đổi data trả về từ snake_case sang camelCase cho FE
    if (response.data) {
      response.data = keysToCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    // Có thể xử lý refresh token ở đây nếu lỗi 401
    return Promise.reject(error);
  }
);
