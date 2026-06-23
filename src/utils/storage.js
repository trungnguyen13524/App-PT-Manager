import * as SecureStore from 'expo-secure-store';

/**
 * Lớp Helper quản lý lưu trữ dữ liệu bảo mật (Tokens, PII)
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
};

const storage = {
  // --- Token ---
  saveTokens: async (accessToken, refreshToken) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    } catch (e) {
      console.error('Lỗi lưu Token:', e);
    }
  },

  getAccessToken: async () => {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: async () => {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // --- User Data ---
  saveUser: async (user) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (e) {
      console.error('Lỗi lưu thông tin User:', e);
    }
  },

  getUser: async () => {
    const data = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  // --- Xóa sạch (khi Logout) ---
  clearAll: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    } catch (e) {
      console.error('Lỗi xóa dữ liệu storage:', e);
    }
  }
};

export default storage;
export { STORAGE_KEYS };
